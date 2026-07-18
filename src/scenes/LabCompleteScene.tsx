import { PixelButton } from '../components/PixelButton'
import { labs } from '../data/labs'
import { useGame } from '../game/GameContext'
import { playTone } from '../audio/audio'

const summaries = {
  cv: 'Machines can use labelled visual examples to detect useful features and classify what they see.',
  ml: 'Machine learning finds patterns in examples, then uses those patterns to make a prediction about new data.',
  nlp: 'Language systems connect words, structure, and context to estimate what a person means.',
  dl: 'Deep learning combines connected layers, tuned signals, and iterative optimization to learn useful representations from data.',
}

export function LabCompleteScene() {
  const { state, dispatch } = useGame()
  if (!state.currentLab) return null
  const lab = labs[state.currentLab]
  const achievementId = state.currentLab === 'cv'
    ? 'MACHINES_FIRST_SIGHT'
    : state.currentLab === 'ml'
      ? 'PATTERN_FINDER'
      : state.currentLab === 'nlp'
        ? 'LANGUAGE_DECODER'
        : 'NEURAL_CORE_ONLINE'
  const achievementName = state.currentLab === 'cv'
    ? "Machine's First Sight"
    : state.currentLab === 'ml'
      ? 'Pattern Finder'
      : state.currentLab === 'nlp'
        ? 'Language Decoder'
        : 'Neural Core Online'
  const showLabAchievement = state.save.achievements.includes(achievementId)
  const showAwakened = state.currentLab !== 'dl' && state.save.achievements.includes('AI_AWAKENED')

  return (
    <div className={`scene complete-scene ${lab.roomClass}`}>
      <div className="complete-burst" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="complete-panel">
        <div className="signal-glyph"><span>{lab.shortName}</span></div>
        <p>{state.currentLab === 'dl' ? 'NEURAL SIGNAL ACQUIRED' : 'FOUNDATION SIGNAL ACQUIRED'}</p>
        <h2>{lab.title} Lab Complete</h2>
        <div className="mentor-explanation">
          <strong>{lab.mentor} // FIELD NOTE</strong>
          <p>{summaries[state.currentLab]}</p>
        </div>
        {state.currentLab === 'dl' && <div className="east-gate-unlocked" role="status">EAST GATE UNLOCKED</div>}
        {(showLabAchievement || showAwakened) && (
          <div className="achievement-stack">
            {showLabAchievement && (
              <div className={`achievement-toast achievement-${state.currentLab}`} role="status">
                <span>ACHIEVEMENT UNLOCKED</span>
                <strong>{achievementName}</strong>
              </div>
            )}
            {showAwakened && (
              <div className="achievement-toast achievement-awakened" role="status">
                <span>ALL FOUNDATION SIGNALS</span>
                <strong>AI Awakened</strong>
              </div>
            )}
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
