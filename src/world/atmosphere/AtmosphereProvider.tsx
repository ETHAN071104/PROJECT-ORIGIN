import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useGame } from '../../game/GameContext'
import type { AtmosphereMode, GameScreen, ParticleQuality } from '../../game/types'
import { clampedTransitionSeconds, DEFAULT_ATMOSPHERE_TRANSITION_SECONDS } from './atmosphereTransitions'
import type { AtmosphereDebugState, AtmosphereRenderState } from './atmosphereTypes'

interface AtmosphereContextValue extends AtmosphereRenderState {
  setMode: (mode: AtmosphereMode) => void
  setParticleQuality: (quality: ParticleQuality) => void
  playResearchSandstorm: () => Promise<boolean>
  debug: AtmosphereDebugState
  setDebug: (updates: Partial<AtmosphereDebugState>) => void
}

const AtmosphereContext = createContext<AtmosphereContextValue | null>(null)

function intendedMode(screen: GameScreen, saved: AtmosphereMode): AtmosphereMode {
  if (screen === 'RESEARCH_MAP') return 'night'
  return saved
}

export function AtmosphereProvider({ children }: { children: ReactNode }) {
  const { state, dispatch } = useGame()
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [debug, setDebugState] = useState<AtmosphereDebugState>({
    overrideMode: null,
    transitionSeconds: DEFAULT_ATMOSPHERE_TRANSITION_SECONDS,
    lights: true,
    shadows: true,
    particles: true,
  })
  const [transientMode, setTransientMode] = useState<AtmosphereMode | null>(null)
  const researchTransientMode = state.screen === 'RESEARCH_MAP' ? transientMode : null
  const resolvedMode = debug.overrideMode ?? researchTransientMode ?? intendedMode(
    state.screen,
    state.save.atmosphereMode,
  )
  const [mode, setDisplayMode] = useState<AtmosphereMode>(resolvedMode)
  const [previousMode, setPreviousMode] = useState<AtmosphereMode | null>(null)
  const modeRef = useRef(mode)
  const sandstormTimerRef = useRef<number | null>(null)
  const transitionSeconds = clampedTransitionSeconds(debug.transitionSeconds, reducedMotion)

  useEffect(() => {
    if (resolvedMode === modeRef.current) return
    setPreviousMode(modeRef.current)
    modeRef.current = resolvedMode
    setDisplayMode(resolvedMode)
    const timer = window.setTimeout(() => setPreviousMode(null), transitionSeconds * 1000 + 80)
    return () => window.clearTimeout(timer)
  }, [resolvedMode, transitionSeconds])

  useEffect(() => () => {
    if (sandstormTimerRef.current !== null) window.clearTimeout(sandstormTimerRef.current)
  }, [])

  const setMode = useCallback((nextMode: AtmosphereMode) => {
    dispatch({ type: 'SET_ATMOSPHERE_MODE', mode: nextMode })
  }, [dispatch])

  const setParticleQuality = useCallback((quality: ParticleQuality) => {
    dispatch({ type: 'SET_PARTICLE_QUALITY', quality })
  }, [dispatch])

  const playResearchSandstorm = useCallback(async () => {
    if (state.save.hasSeenResearchSandstorm) return false
    dispatch({ type: 'MARK_RESEARCH_SANDSTORM_SEEN' })
    setTransientMode('sandstorm')
    if (sandstormTimerRef.current !== null) window.clearTimeout(sandstormTimerRef.current)
    sandstormTimerRef.current = window.setTimeout(() => {
      setTransientMode(null)
      sandstormTimerRef.current = null
    }, 10_000)
    return true
  }, [dispatch, state.save.hasSeenResearchSandstorm])

  const setDebug = useCallback((updates: Partial<AtmosphereDebugState>) => {
    setDebugState((current) => ({ ...current, ...updates }))
  }, [])

  const value = useMemo<AtmosphereContextValue>(() => ({
    mode,
    previousMode,
    transitionSeconds,
    particleQuality: state.save.particleQuality,
    lights: debug.lights,
    shadows: debug.shadows,
    particles: debug.particles,
    setMode,
    setParticleQuality,
    playResearchSandstorm,
    debug,
    setDebug,
  }), [debug, mode, playResearchSandstorm, previousMode, setDebug, setMode, setParticleQuality, state.save.particleQuality, transitionSeconds])

  return <AtmosphereContext.Provider value={value}>{children}</AtmosphereContext.Provider>
}

export function useAtmosphere() {
  const context = useContext(AtmosphereContext)
  if (!context) throw new Error('useAtmosphere must be used inside AtmosphereProvider')
  return context
}
