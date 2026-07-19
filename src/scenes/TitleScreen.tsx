import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { PixelButton } from '../components/PixelButton'
import { playTone } from '../audio/audio'
import { useGame } from '../game/GameContext'

type TitleRecord = 'creator' | 'project'

export function TitleScreen() {
  const { state, dispatch } = useGame()
  const [openRecord, setOpenRecord] = useState<TitleRecord | null>(null)
  const recordPanelRef = useRef<HTMLElement>(null)
  const returnFocusRef = useRef<HTMLButtonElement | null>(null)

  const closeRecord = useCallback(() => {
    const returnTarget = returnFocusRef.current
    setOpenRecord(null)
    requestAnimationFrame(() => returnTarget?.focus())
  }, [])

  useEffect(() => {
    if (!openRecord) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRecord()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [closeRecord, openRecord])

  useEffect(() => {
    if (!openRecord) return
    const frame = requestAnimationFrame(() => {
      recordPanelRef.current?.querySelector<HTMLElement>('a[href], button:not([disabled])')?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [openRecord])

  const act = (action: 'NEW_GAME' | 'CONTINUE_GAME' | 'TOGGLE_AUDIO') => {
    playTone(state.save.audioEnabled, 'confirm')
    dispatch({ type: action })
  }

  const showRecord = (record: TitleRecord, trigger: HTMLButtonElement) => {
    playTone(state.save.audioEnabled, 'confirm')
    returnFocusRef.current = trigger
    setOpenRecord(record)
  }

  const trapRecordFocus = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
    if (controls.length === 0) return
    const first = controls[0]
    const last = controls[controls.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
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
        <PixelButton variant="secondary" onClick={(event) => showRecord('creator', event.currentTarget)}>Creator Record</PixelButton>
        <PixelButton variant="secondary" onClick={(event) => showRecord('project', event.currentTarget)}>Project Record</PixelButton>
        <PixelButton variant="secondary" aria-pressed={state.save.audioEnabled} onClick={() => act('TOGGLE_AUDIO')}>
          Sound {state.save.audioEnabled ? 'On' : 'Off'}
        </PixelButton>
      </nav>
      <p className="desktop-hint">WASD / ARROWS TO MOVE&nbsp;&nbsp; E / ENTER / SPACE TO ACT&nbsp;&nbsp; ESC TO CLOSE</p>

      {openRecord && (
        <div className="title-record-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeRecord()
        }}>
          <section
            ref={recordPanelRef}
            className={`title-record-panel ${openRecord === 'creator' ? 'creator-record-panel' : 'project-record-panel'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="title-record-heading"
            onKeyDown={trapRecordFocus}
          >
            <p>ACADEMY ARCHIVE</p>
            <h2 id="title-record-heading">{openRecord === 'creator' ? 'CREATOR RECORD' : 'PROJECT RECORD'}</h2>

            {openRecord === 'creator' ? (
              <>
                <div className="creator-record-layout">
                  <div className="creator-identity">
                    <div className="creator-pixel-profile" aria-hidden="true"><i /><i /><b /><span /></div>
                    <span>CREATOR</span>
                    <h3>ETHAN LIM</h3>
                    <dl>
                      <div><dt>BASED IN</dt><dd>MALAYSIA</dd></div>
                    </dl>
                  </div>
                  <dl className="creator-record-facts">
                    <div>
                      <dt>ROLE</dt>
                      <dd>AI BUILDER<br />PRODUCT-MINDED DEVELOPER</dd>
                    </div>
                    <div>
                      <dt>EDUCATION</dt>
                      <dd>BACHELOR OF ARTIFICIAL INTELLIGENCE<br /><span>UNIVERSITI TEKNOLOGI MALAYSIA</span></dd>
                    </div>
                  </dl>
                </div>
                <blockquote className="creator-statement">
                  <p>I build interactive AI experiences that turn technical ideas into understandable products.</p>
                  <p>PROJECT ORIGIN was designed and developed as a playable introduction to artificial intelligence.</p>
                </blockquote>
                <div className="record-actions creator-record-actions">
                  <a className="record-link-button" href="https://github.com/ETHAN071104" target="_blank" rel="noopener noreferrer">
                    <i className="pixel-link-icon pixel-code-icon" aria-hidden="true"><b /><b /><span /></i>
                    GITHUB
                  </a>
                  <a className="record-link-button" href="https://www.linkedin.com/in/ethan-lim-462a833bb/" target="_blank" rel="noopener noreferrer">
                    <i className="pixel-link-icon pixel-profile-icon" aria-hidden="true"><b /><b /><span /></i>
                    LINKEDIN
                  </a>
                  <PixelButton onClick={closeRecord}>Close</PixelButton>
                </div>
              </>
            ) : (
              <>
                <dl className="project-record-grid">
                  <div><dt>PROJECT</dt><dd>PROJECT ORIGIN</dd></div>
                  <div><dt>FORMAT</dt><dd>2D PIXEL RPG</dd></div>
                  <div><dt>CURRICULUM</dt><dd>CV / ML / NLP / DL</dd></div>
                  <div><dt>INPUT</dt><dd>KEYBOARD / TOUCH</dd></div>
                </dl>
                <p className="project-record-copy">A story-driven AI academy built for the browser. Restore the foundation labs and uncover the sealed Research facility.</p>
                <div className="record-actions"><PixelButton onClick={closeRecord}>Close</PixelButton></div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
