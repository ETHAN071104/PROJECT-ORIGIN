import { PixelButton } from '../components/PixelButton'
import { PixelRobot } from '../components/PixelRobot'
import { useGame } from '../game/GameContext'

export function EndingScene() {
  const { state, dispatch } = useGame()
  return (
    <div className="scene ending-scene">
      <div className="ending-door"><i /><b><span>ORIGIN</span></b><i /></div>
      <div className="ending-robot"><PixelRobot /></div>
      <div className="ending-copy">
        <p>RESEARCH ACCESS GRANTED</p>
        <h2>Every answer opens another question.</h2>
        <p>{state.save.playerName}, your three foundation signals are active. The Research Lab awaits a future build.</p>
        <PixelButton onClick={() => dispatch({ type: 'LEAVE_LAB' })}>Return to Plaza</PixelButton>
      </div>
    </div>
  )
}
