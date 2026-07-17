import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { calculateScaledStage, clientToLogicalPoint, GAME_HEIGHT, GAME_WIDTH, type BoundsLike } from '../game/coordinates'
import type { Point } from '../game/types'

interface GameCoordinateContextValue {
  scale: number
  clientToLogical: (clientX: number, clientY: number) => Point
  getGameBounds: () => BoundsLike | null
}

const GameCoordinateContext = createContext<GameCoordinateContextValue | null>(null)

export function GameViewport({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLElement>(null)
  const [stage, setStage] = useState(() => ({ scale: 1, width: GAME_WIDTH, height: GAME_HEIGHT, ready: false }))

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
    measure()
    return () => {
      observer.disconnect()
      window.removeEventListener('orientationchange', measure)
    }
  }, [])

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
      <main className="game-shell">
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
