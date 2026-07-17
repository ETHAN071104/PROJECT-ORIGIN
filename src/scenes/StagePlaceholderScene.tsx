import { labs } from '../data/labs'
import { PixelButton } from '../components/PixelButton'
import { useGame } from '../game/GameContext'
import { playTone } from '../audio/audio'

export function StagePlaceholderScene() {
  const { state, dispatch } = useGame()
  if (!state.currentLab) return null
  const lab = labs[state.currentLab]

  const complete = () => {
    playTone(state.save.audioEnabled)
    dispatch({ type: 'COMPLETE_STAGE' })
  }

  return (
    <div className={`scene stage-scene ${lab.roomClass}`}>
      <div className="stage-header">
        <span>{lab.shortName} FOUNDATION ACTIVITY</span>
        <strong>{lab.title}</strong>
      </div>
      <div className="stage-machine">
        <div className="stage-screen">
          <div className={`stage-visual stage-visual-${lab.id}`} aria-hidden="true">
            {lab.id === 'cv' && <><i /><i /><b /></>}
            {lab.id === 'ml' && <><i /><i /><i /><b /></>}
            {lab.id === 'nlp' && <><i>HELLO</i><i>MEANING</i><b /></>}
          </div>
          <p>ACTIVITY MODULE RESERVED</p>
          <h2>{lab.learningTeaser}</h2>
          <p className="stage-note">The full mini-game will be installed in the next build. This foundation pass verifies the ordered learning flow.</p>
        </div>
        <div className="machine-controls"><i /><i /><i /><span /></div>
      </div>
      <PixelButton className="stage-complete-button" onClick={complete}>Run Placeholder</PixelButton>
    </div>
  )
}
