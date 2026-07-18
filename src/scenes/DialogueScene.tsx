import { useCallback, useEffect, useMemo, useState } from 'react'
import { playTone } from '../audio/audio'
import { PixelButton } from '../components/PixelButton'
import { Portrait } from '../components/Portrait'
import { dialogueScripts } from '../data/dialogue'
import { useGame } from '../game/GameContext'

export function DialogueScene() {
  const { state, dispatch } = useGame()
  const script = state.dialogueKey ? dialogueScripts[state.dialogueKey] ?? [] : []
  const [lineIndex, setLineIndex] = useState(0)
  const [visibleCount, setVisibleCount] = useState(0)
  const line = script[lineIndex]
  const lab = state.currentLab ?? (state.dialogueKey?.startsWith('cv') ? 'cv' : state.dialogueKey?.startsWith('ml') ? 'ml' : 'nlp')
  const text = useMemo(() => line?.text.replaceAll('{{player}}', state.save.playerName) ?? '', [line, state.save.playerName])
  const speaker = line?.speaker.replaceAll('{{player}}', state.save.playerName) ?? ''
  const complete = visibleCount >= text.length

  useEffect(() => {
    setVisibleCount(0)
    if (!text) return
    const ticker = window.setInterval(() => {
      setVisibleCount((count) => Math.min(text.length, count + 2))
    }, 28)
    return () => window.clearInterval(ticker)
  }, [text])

  const advance = useCallback(() => {
    if (!line) {
      dispatch({ type: 'DIALOGUE_COMPLETE' })
      return
    }
    if (!complete) {
      setVisibleCount(text.length)
      return
    }
    playTone(state.save.audioEnabled)
    if (lineIndex >= script.length - 1) dispatch({ type: 'DIALOGUE_COMPLETE' })
    else setLineIndex((index) => index + 1)
  }, [complete, dispatch, line, lineIndex, script.length, state.save.audioEnabled, text.length])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === 'e' || event.key === 'E' || event.key === ' ') {
        event.preventDefault()
        advance()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [advance])

  if (!line) return null
  const mentorSpeaking = line.portrait === 'mentor'
  const playerSpeaking = line.portrait === 'player'

  return (
    <div className={`scene dialogue-scene dialogue-${lab}`}>
      <div className="dialogue-background">
        <div className="dialogue-console"><i /><i /><b /></div>
        <div className="dialogue-light light-one" /><div className="dialogue-light light-two" />
      </div>
      <div className="dialogue-portraits">
        <Portrait type={line.portrait === 'system' ? 'system' : 'mentor'} mentor={lab} active={mentorSpeaking || line.portrait === 'system'} />
        <Portrait type="player" active={playerSpeaking} visionUpgraded={state.save.completedLabs.cv} learningUpgraded={state.save.completedLabs.ml} />
      </div>
      <div className="dialogue-box" onClick={advance}>
        <div className="speaker-name">{speaker}</div>
        <p>{text.slice(0, visibleCount)}<span className="type-caret" /></p>
        {line.choices && complete && (
          <div className="dialogue-choices">
            {line.choices.map((choice) => (
              <PixelButton key={choice} variant="secondary" onClick={(event) => { event.stopPropagation(); advance() }}>
                {choice}
              </PixelButton>
            ))}
          </div>
        )}
        {(!line.choices || !complete) && <button className="dialogue-next" aria-label="Continue dialogue" onClick={advance}>▼</button>}
      </div>
    </div>
  )
}
