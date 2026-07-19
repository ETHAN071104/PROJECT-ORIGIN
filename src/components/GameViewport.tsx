import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { calculateScaledStage, clientToLogicalPoint, GAME_HEIGHT, GAME_WIDTH, type BoundsLike } from '../game/coordinates'
import {
  detectStandalone,
  detectTouchMobile,
  requestImmersiveMode,
  setGlobalGameInputBlocked,
  shouldShowImmersiveGate,
  type OrientationLike,
} from '../game/immersive'
import type { Point } from '../game/types'
import { musicEngine } from '../audio/MusicEngine'

interface GameCoordinateContextValue {
  scale: number
  clientToLogical: (clientX: number, clientY: number) => Point
  getGameBounds: () => BoundsLike | null
}

interface BeforeInstallPromptEventLike extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

interface ImmersiveEnvironment {
  isMobile: boolean
  isStandalone: boolean
  isFullscreen: boolean
}

const GameCoordinateContext = createContext<GameCoordinateContextValue | null>(null)

function readImmersiveEnvironment(): ImmersiveEnvironment {
  const navigatorStandalone = (navigator as Navigator & { standalone?: boolean }).standalone
  return {
    isMobile: detectTouchMobile({
      coarsePointer: window.matchMedia('(pointer: coarse)').matches,
      hoverNone: window.matchMedia('(hover: none)').matches,
      maxTouchPoints: navigator.maxTouchPoints,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    }),
    isStandalone: detectStandalone({
      displayModeStandalone: window.matchMedia('(display-mode: standalone)').matches,
      navigatorStandalone,
    }),
    isFullscreen: Boolean(document.fullscreenElement),
  }
}

function isAppleTouchPlatform() {
  const platform = navigator.platform.toLowerCase()
  return /iphone|ipad|ipod/.test(platform) || (platform.includes('mac') && navigator.maxTouchPoints > 1)
}

export function GameViewport({ children }: { children: ReactNode }) {
  const shellRef = useRef<HTMLElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLElement>(null)
  const enteredFullscreen = useRef(false)
  const [stage, setStage] = useState(() => ({ scale: 1, width: GAME_WIDTH, height: GAME_HEIGHT, ready: false }))
  const [environment, setEnvironment] = useState(readImmersiveEnvironment)
  const [sessionDismissed, setSessionDismissed] = useState(environment.isFullscreen)
  const [fullscreenFailure, setFullscreenFailure] = useState(false)
  const [fullscreenExited, setFullscreenExited] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEventLike | null>(null)
  const [installGuideOpen, setInstallGuideOpen] = useState(false)
  const [installStatus, setInstallStatus] = useState('')

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const measure = () => {
      const bounds = host.getBoundingClientRect()
      const next = calculateScaledStage(bounds.width, bounds.height)
      setStage((current) => (
        Math.abs(current.width - next.width) < 0.1 && Math.abs(current.height - next.height) < 0.1 && current.ready
          ? current
          : { ...next, ready: true }
      ))
    }

    const observer = new ResizeObserver(measure)
    observer.observe(host)
    window.addEventListener('orientationchange', measure)
    document.addEventListener('fullscreenchange', measure)
    measure()
    return () => {
      observer.disconnect()
      window.removeEventListener('orientationchange', measure)
      document.removeEventListener('fullscreenchange', measure)
    }
  }, [])

  useEffect(() => {
    const standaloneQuery = window.matchMedia('(display-mode: standalone)')
    const updateEnvironment = () => {
      const next = readImmersiveEnvironment()
      setEnvironment(next)
      if (next.isStandalone) {
        setSessionDismissed(true)
        setFullscreenExited(false)
      } else if (next.isFullscreen) {
        setSessionDismissed(true)
        setFullscreenExited(false)
      } else if (enteredFullscreen.current && next.isMobile) {
        setFullscreenExited(true)
      }
    }
    const captureInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEventLike)
    }
    const installed = () => {
      setInstallPrompt(null)
      setInstallGuideOpen(false)
      setInstallStatus('APP INSTALLED — launch ORIGIN from your home screen.')
      setSessionDismissed(true)
    }

    window.addEventListener('resize', updateEnvironment)
    window.addEventListener('orientationchange', updateEnvironment)
    document.addEventListener('fullscreenchange', updateEnvironment)
    window.addEventListener('beforeinstallprompt', captureInstallPrompt)
    window.addEventListener('appinstalled', installed)
    standaloneQuery.addEventListener?.('change', updateEnvironment)
    return () => {
      window.removeEventListener('resize', updateEnvironment)
      window.removeEventListener('orientationchange', updateEnvironment)
      document.removeEventListener('fullscreenchange', updateEnvironment)
      window.removeEventListener('beforeinstallprompt', captureInstallPrompt)
      window.removeEventListener('appinstalled', installed)
      standaloneQuery.removeEventListener?.('change', updateEnvironment)
    }
  }, [])

  const showEntryGate = shouldShowImmersiveGate({
    isMobile: environment.isMobile,
    isStandalone: environment.isStandalone,
    sessionDismissed,
  })
  const inputBlocked = showEntryGate || fullscreenExited

  useEffect(() => {
    setGlobalGameInputBlocked(inputBlocked)
    if (inputBlocked) musicEngine.pause()
    else musicEngine.resume()
    return () => setGlobalGameInputBlocked(false)
  }, [inputBlocked])

  const enterFullscreen = useCallback(async () => {
    setFullscreenFailure(false)
    setInstallGuideOpen(false)
    const orientation = screen.orientation as ScreenOrientation & OrientationLike
    const result = await requestImmersiveMode(shellRef.current, orientation)
    if (result === 'success') {
      enteredFullscreen.current = true
      setSessionDismissed(true)
      setFullscreenExited(false)
      setEnvironment(readImmersiveEnvironment())
    } else {
      setFullscreenFailure(true)
    }
  }, [])

  const continueInBrowser = useCallback(() => {
    enteredFullscreen.current = false
    setSessionDismissed(true)
    setFullscreenExited(false)
    setFullscreenFailure(false)
    setInstallGuideOpen(false)
  }, [])

  const installApp = useCallback(async () => {
    if (!installPrompt) {
      setInstallGuideOpen(true)
      return
    }
    setInstallStatus('')
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    setInstallPrompt(null)
    setInstallStatus(choice.outcome === 'accepted'
      ? 'INSTALL REQUEST ACCEPTED — complete the browser installation prompt.'
      : 'INSTALL DISMISSED — you can continue in the browser.')
  }, [installPrompt])

  const getGameBounds = useCallback((): BoundsLike | null => {
    const bounds = viewportRef.current?.getBoundingClientRect()
    return bounds ? { left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height } : null
  }, [])

  const clientToLogical = useCallback((clientX: number, clientY: number): Point => {
    const bounds = getGameBounds()
    return bounds ? clientToLogicalPoint(clientX, clientY, bounds) : { x: 0, y: 0 }
  }, [getGameBounds])

  const coordinates = useMemo(() => ({ scale: stage.scale, clientToLogical, getGameBounds }), [clientToLogical, getGameBounds, stage.scale])

  return (
    <GameCoordinateContext.Provider value={coordinates}>
      <main ref={shellRef} className="game-shell">
        <div ref={hostRef} className="game-stage-host">
          <div
            className="game-stage-scale"
            style={{ width: stage.width, height: stage.height, visibility: stage.ready ? 'visible' : 'hidden' }}
          >
            <section
              ref={viewportRef}
              className="game-viewport"
              aria-label="Project Origin game viewport"
              data-logical-width={GAME_WIDTH}
              data-logical-height={GAME_HEIGHT}
              style={{ transform: `scale(${stage.scale})` }}
            >
              {children}
              <div className="scanline-overlay" aria-hidden="true" />
            </section>
          </div>
        </div>

        {(showEntryGate || fullscreenExited) && (
          <section className="immersive-gate" role="dialog" aria-modal="true" aria-label={fullscreenExited ? 'Fullscreen exited' : 'Mobile experience setup'}>
            <div className="immersive-stars" aria-hidden="true" />
            <div className="immersive-card">
              <div className="immersive-origin-mark" aria-hidden="true"><i /><b /></div>
              <span>{fullscreenExited ? 'DISPLAY MODE INTERRUPTED' : 'MOBILE FIELD SETUP'}</span>
              <h1>{fullscreenFailure ? 'FULLSCREEN UNAVAILABLE' : fullscreenExited ? 'FULL SCREEN EXITED' : 'BEST EXPERIENCED IN FULL SCREEN'}</h1>
              <p>{fullscreenFailure
                  ? 'This browser could not enter fullscreen. Install the app or continue with the protected 16:9 browser frame.'
                  : fullscreenExited
                    ? 'Gameplay is paused and held movement has been cleared.'
                  : 'PROJECT ORIGIN is designed for landscape play.'}</p>
              {!fullscreenFailure && !fullscreenExited && <button type="button" className="immersive-primary" onClick={enterFullscreen}>ENTER FULLSCREEN</button>}
              {fullscreenExited && !fullscreenFailure && <button type="button" className="immersive-primary" onClick={enterFullscreen}>RETURN TO FULLSCREEN</button>}
              <button type="button" className="immersive-secondary" onClick={installApp}>INSTALL APP</button>
              {(fullscreenFailure || fullscreenExited) && <button type="button" className="immersive-tertiary" onClick={continueInBrowser}>CONTINUE IN BROWSER</button>}
              <small>Install PROJECT ORIGIN for an app-like experience without browser controls.</small>
              {installStatus && <div className="install-status" role="status">{installStatus}</div>}

              {installGuideOpen && (
                <div className="install-guide" role="status">
                  <strong>INSTALL FROM YOUR BROWSER</strong>
                  {isAppleTouchPlatform() ? (
                    <ol><li>Open the browser Share menu.</li><li>Choose Add to Home Screen.</li><li>Launch PROJECT ORIGIN from the new icon.</li></ol>
                  ) : (
                    <ol><li>Open the browser menu.</li><li>Choose Install app or Add to Home screen.</li><li>Launch ORIGIN from the installed icon.</li></ol>
                  )}
                  <button type="button" onClick={() => setInstallGuideOpen(false)}>CLOSE GUIDE</button>
                </div>
              )}
            </div>
          </section>
        )}

        <div className="rotate-overlay" role="status">
          <div className="rotate-device" aria-hidden="true"><span /></div>
          <strong>Rotate your device</strong>
          <p>Turn to landscape to continue.</p>
        </div>
      </main>
    </GameCoordinateContext.Provider>
  )
}

export function useGameCoordinates() {
  const context = useContext(GameCoordinateContext)
  if (!context) throw new Error('useGameCoordinates must be used inside GameViewport')
  return context
}
