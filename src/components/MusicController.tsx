import { useEffect, useMemo } from 'react'
import { musicEngine } from '../audio/MusicEngine'
import type { MusicThemeId } from '../audio/audioTypes'
import { useGame } from '../game/GameContext'
import type { GameScreen } from '../game/types'
import { useAtmosphere } from '../world/atmosphere/AtmosphereProvider'

export function musicThemeForScreen(screen: GameScreen, cvComplete: boolean): MusicThemeId {
  if (screen === 'ENDING') return 'stand-among-giants'
  if (screen === 'TITLE' || screen === 'INTRO' || screen === 'NAME_ENTRY') return 'origin-signal'
  return cvComplete ? 'academy-day' : 'academy-night'
}

export function MusicController() {
  const { state } = useGame()
  const atmosphere = useAtmosphere()
  const outdoor = state.screen === 'HUB' || (state.screen === 'RESEARCH_MAP' && atmosphere.mode === 'sandstorm')
  const academyDay = state.save.completedLabs.cv && atmosphere.mode !== 'night'
  const theme = musicThemeForScreen(state.screen, academyDay)
  const progression = useMemo(() => ({ ...state.save.completedLabs }), [state.save.completedLabs])

  useEffect(() => {
    musicEngine.setEnabled(state.save.audioEnabled)
  }, [state.save.audioEnabled])

  useEffect(() => {
    musicEngine.configureTheme(theme, progression)
  }, [progression, theme])

  useEffect(() => {
    musicEngine.setAtmosphere(atmosphere.mode, outdoor)
  }, [atmosphere.mode, outdoor])

  useEffect(() => {
    let active = true
    const removeUnlockListeners = () => {
      window.removeEventListener('pointerdown', unlock, true)
      window.removeEventListener('touchend', unlock, true)
      window.removeEventListener('keydown', unlock, true)
    }
    const unlock = () => {
      void musicEngine.initialize().then((ready) => {
        if (active && ready) removeUnlockListeners()
      })
    }
    window.addEventListener('pointerdown', unlock, { capture: true, passive: true })
    window.addEventListener('touchend', unlock, { capture: true, passive: true })
    window.addEventListener('keydown', unlock, { capture: true })
    return () => {
      active = false
      removeUnlockListeners()
    }
  }, [])

  return null
}
