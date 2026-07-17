import { PixelButton } from '../components/PixelButton'
import { PixelRobot } from '../components/PixelRobot'
import { playTone } from '../audio/audio'
import { useGame } from '../game/GameContext'

export function TitleScreen() {
  const { state, dispatch } = useGame()

  const act = (action: 'NEW_GAME' | 'CONTINUE_GAME' | 'TOGGLE_AUDIO') => {
    playTone(state.save.audioEnabled, 'confirm')
    dispatch({ type: action })
  }

  return (
    <div className="scene title-scene">
      <div className="title-stars stars-back" aria-hidden="true" />
      <div className="academy-silhouette" aria-hidden="true">
        <div className="academy-spire" />
        <div className="academy-main"><span /><span /><span /></div>
        <div className="academy-wing wing-left" />
        <div className="academy-wing wing-right" />
      </div>
      <div className="title-lockup">
        <div className="origin-mark" aria-hidden="true"><span /><i /></div>
        <p className="title-kicker">AI ACADEMY ARCHIVE</p>
        <h1>PROJECT <span>ORIGIN</span></h1>
        <p className="tagline">Every AI has an origin. This is yours.</p>
      </div>
      <div className="title-robot" aria-hidden="true"><PixelRobot /></div>
      <div className="title-menu">
        <PixelButton onClick={() => act('NEW_GAME')}>New Game</PixelButton>
        {state.hasStoredSave && (
          <PixelButton variant="secondary" onClick={() => act('CONTINUE_GAME')}>Continue</PixelButton>
        )}
        <PixelButton variant="secondary" onClick={() => act('TOGGLE_AUDIO')}>
          Sound {state.save.audioEnabled ? 'On' : 'Off'}
        </PixelButton>
      </div>
      <p className="desktop-hint">WASD / ARROWS TO MOVE&nbsp;&nbsp; E / ENTER / SPACE TO ACT</p>
    </div>
  )
}
