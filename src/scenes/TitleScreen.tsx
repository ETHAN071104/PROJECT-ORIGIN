import { useEffect, useState } from 'react'
import { PixelButton } from '../components/PixelButton'
import { playTone } from '../audio/audio'
import { useGame } from '../game/GameContext'

export function TitleScreen() {
  const { state, dispatch } = useGame()
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    if (!detailsOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDetailsOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [detailsOpen])

  const act = (action: 'NEW_GAME' | 'CONTINUE_GAME' | 'TOGGLE_AUDIO') => {
    playTone(state.save.audioEnabled, 'confirm')
    dispatch({ type: action })
  }

  const openDetails = () => {
    playTone(state.save.audioEnabled, 'confirm')
    setDetailsOpen(true)
  }

  return (
    <div className="scene title-scene">
      <img className="title-backdrop" src="/assets/title-academy-archive.png" alt="" aria-hidden="true" fetchPriority="high" />
      <div className="title-lockup">
        <div className="title-origin-seal" aria-hidden="true"><span /><i /></div>
        <p className="title-kicker">AI ACADEMY ARCHIVE</p>
        <h1><span className="title-project">PROJECT</span><span className="title-origin">ORIGIN</span></h1>
        <p className="tagline">Every AI has an origin. This is yours.</p>
      </div>
      <nav className="title-menu" aria-label="Main menu">
        <PixelButton onClick={() => act('NEW_GAME')}>New Game</PixelButton>
        <PixelButton variant="secondary" disabled={!state.hasStoredSave} onClick={() => act('CONTINUE_GAME')}>
          Continue
        </PixelButton>
        <PixelButton variant="secondary" onClick={openDetails}>Developer Details</PixelButton>
        <PixelButton variant="secondary" aria-pressed={state.save.audioEnabled} onClick={() => act('TOGGLE_AUDIO')}>
          Sound {state.save.audioEnabled ? 'On' : 'Off'}
        </PixelButton>
      </nav>
      <p className="desktop-hint">WASD / ARROWS TO MOVE&nbsp;&nbsp; E / ENTER / SPACE TO ACT&nbsp;&nbsp; ESC TO CLOSE</p>

      {detailsOpen && (
        <div className="developer-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setDetailsOpen(false)
        }}>
          <section className="developer-panel" role="dialog" aria-modal="true" aria-labelledby="developer-title">
            <p>ACADEMY RECORD</p>
            <h2 id="developer-title">DEVELOPER DETAILS</h2>
            <dl>
              <div><dt>PROJECT</dt><dd>PROJECT ORIGIN</dd></div>
              <div><dt>FORMAT</dt><dd>2D PIXEL RPG</dd></div>
              <div><dt>CURRICULUM</dt><dd>CV / ML / NLP / DL</dd></div>
              <div><dt>INPUT</dt><dd>KEYBOARD / TOUCH</dd></div>
            </dl>
            <p className="developer-copy">A story-driven AI academy built for the browser. Restore the foundation labs and uncover the sealed Research facility.</p>
            <PixelButton autoFocus onClick={() => setDetailsOpen(false)}>Close</PixelButton>
          </section>
        </div>
      )}
    </div>
  )
}
