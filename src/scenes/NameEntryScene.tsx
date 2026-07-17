import { useState, type FormEvent } from 'react'
import { PixelButton } from '../components/PixelButton'
import { Portrait } from '../components/Portrait'
import { playTone } from '../audio/audio'
import { useGame } from '../game/GameContext'

export function NameEntryScene() {
  const { state, dispatch } = useGame()
  const [name, setName] = useState('ORI')
  const [error, setError] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const cleanName = name.trim()
    if (!cleanName) {
      setError('A unit name is required.')
      return
    }
    playTone(state.save.audioEnabled)
    dispatch({ type: 'SET_NAME', name: cleanName })
  }

  return (
    <div className="scene name-scene">
      <div className="name-grid" aria-hidden="true" />
      <div className="name-terminal">
        <div className="terminal-header"><span>ACADEMY INTAKE TERMINAL</span><i /></div>
        <div className="name-layout">
          <div className="name-portrait"><Portrait type="player" active /></div>
          <form onSubmit={submit}>
            <p>UNIT UNKNOWN</p>
            <h2>Choose your name</h2>
            <label htmlFor="player-name">Unit designation</label>
            <input
              id="player-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value.replace(/[^a-zA-Z0-9 _-]/g, '').slice(0, 12))
                setError('')
              }}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              maxLength={12}
              aria-describedby={error ? 'name-error' : undefined}
            />
            <div className="name-meta"><span>{name.length}/12</span><span>LETTERS / NUMBERS</span></div>
            {error && <div className="input-error" id="name-error">{error}</div>}
            <PixelButton type="submit">Confirm Name</PixelButton>
          </form>
        </div>
      </div>
    </div>
  )
}
