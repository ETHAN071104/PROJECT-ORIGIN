import { useState } from 'react'
import { musicEngine } from '../audio/MusicEngine'
import { audioContextSupported } from '../audio/audioContext'
import type { MusicEngineSnapshot, MusicThemeId } from '../audio/audioTypes'
import { useGame } from '../game/GameContext'

const TEST_THEMES: { id: MusicThemeId; label: string }[] = [
  { id: 'origin-signal', label: 'Play Origin Signal' },
  { id: 'academy-night', label: 'Play Academy Night' },
  { id: 'academy-day', label: 'Play Academy Day' },
  { id: 'stand-among-giants', label: 'Play Stand Among Giants' },
]

function panelEnabled() {
  return import.meta.env.DEV && new URLSearchParams(window.location.search).get('musicTest') === '1'
}

export function MusicTestPanel() {
  const { state } = useGame()
  const [snapshot, setSnapshot] = useState<MusicEngineSnapshot>(() => musicEngine.getSnapshot())
  const [volume, setVolume] = useState(snapshot.volume)
  const [initializationAttempted, setInitializationAttempted] = useState(false)

  if (!panelEnabled()) return null

  const refresh = () => setSnapshot(musicEngine.getSnapshot())
  const initialize = async () => {
    setInitializationAttempted(true)
    await musicEngine.initialize()
    refresh()
  }
  const play = async (theme: MusicThemeId) => {
    setInitializationAttempted(true)
    await musicEngine.initialize()
    musicEngine.setEnabled(state.save.audioEnabled)
    musicEngine.playTheme(theme)
    refresh()
  }

  return (
    <aside className="music-test-panel" aria-label="Procedural music test panel">
      <p>DEV AUDIO // PROCEDURAL</p>
      <h2>MUSIC TEST</h2>
      <button type="button" onClick={initialize}>Initialize Audio</button>
      {TEST_THEMES.map((theme) => (
        <button type="button" key={theme.id} onClick={() => play(theme.id)}>{theme.label}</button>
      ))}
      <button type="button" onClick={() => { musicEngine.stopTheme(); refresh() }}>Stop</button>
      <label>
        <span>Volume {Math.round(volume * 100)}%</span>
        <input
          type="range"
          min="0"
          max="0.6"
          step="0.01"
          value={volume}
          onChange={(event) => {
            const next = Number(event.target.value)
            setVolume(next)
            musicEngine.setMasterVolume(next)
            refresh()
          }}
        />
      </label>
      <output>{snapshot.initialized
        ? snapshot.activeTheme ?? 'READY / STOPPED'
        : initializationAttempted
          ? audioContextSupported() ? `AUDIO ${snapshot.contextState.toUpperCase()}` : 'WEB AUDIO UNAVAILABLE'
          : 'WAITING FOR GESTURE'}</output>
      {!state.save.audioEnabled && <small>SOUND IS OFF — enable it from Home to hear music.</small>}
    </aside>
  )
}
