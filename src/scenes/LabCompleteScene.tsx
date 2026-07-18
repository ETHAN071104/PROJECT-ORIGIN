import { PixelButton } from '../components/PixelButton'
import { labs } from '../data/labs'
import { useGame } from '../game/GameContext'
import { playTone } from '../audio/audio'

const summaries = {
  cv: 'Machines can use labelled visual examples to detect useful features and classify what they see.',
  ml: 'Machine learning finds patterns in examples, then uses those patterns to make a prediction about new data.',
  nlp: 'Language systems connect words, structure, and context to estimate what a person means.',
}

export function LabCompleteScene() {
  const { state, dispatch } = useGame()
  if (!state.currentLab) return null
  const lab = labs[state.currentLab]

  return (
    <div className={`scene complete-scene ${lab.roomClass}`}>
      <div className="complete-burst" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="complete-panel">
        <div className="signal-glyph"><span>{lab.shortName}</span></div>
        <p>FOUNDATION SIGNAL ACQUIRED</p>
        <h2>{lab.title} Lab Complete</h2>
        <div className="mentor-explanation">
          <strong>{lab.mentor} // FIELD NOTE</strong>
          <p>{summaries[state.currentLab]}</p>
        </div>
        {state.currentLab === 'cv' && state.save.achievements.includes('MACHINES_FIRST_SIGHT') && (
          <div className="achievement-toast" role="status">
            <span>ACHIEVEMENT UNLOCKED</span>
            <strong>Machine's First Sight</strong>
          </div>
        )}
        <PixelButton onClick={() => {
          playTone(state.save.audioEnabled)
          dispatch({ type: 'ACKNOWLEDGE_LAB_COMPLETE' })
        }}>Return to Academy</PixelButton>
      </div>
    </div>
  )
}
