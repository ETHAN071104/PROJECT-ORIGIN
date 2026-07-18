interface PortraitProps {
  type: 'player' | 'mentor' | 'system'
  mentor?: 'cv' | 'ml' | 'nlp' | 'dl'
  active?: boolean
  visionUpgraded?: boolean
  learningUpgraded?: boolean
  communicationUpgraded?: boolean
  deepLearningUpgraded?: boolean
}

export function Portrait({ type, mentor, active = false, visionUpgraded = false, learningUpgraded = false, communicationUpgraded = false, deepLearningUpgraded = false }: PortraitProps) {
  return (
    <div className={`portrait portrait-${type} ${mentor ? `portrait-${mentor}` : ''} ${active ? 'is-speaking' : ''}`}>
      <div className="portrait-frame">
        {type === 'player' && <div className={`portrait-bot ${visionUpgraded ? 'has-vision-upgrade' : ''} ${learningUpgraded ? 'has-learning-upgrade' : ''} ${communicationUpgraded ? 'has-communication-upgrade' : ''} ${deepLearningUpgraded ? 'has-dl-upgrade' : ''}`}><i /><i /><b /></div>}
        {type === 'system' && <div className="portrait-core"><i /><i /><i /></div>}
        {type === 'mentor' && mentor === 'cv' && <div className="portrait-lens"><i /><b /></div>}
        {type === 'mentor' && mentor === 'ml' && <div className="portrait-pattern"><i /><i /><b /></div>}
        {type === 'mentor' && mentor === 'nlp' && <div className="portrait-lexi"><i /><b /><b /></div>}
        {type === 'mentor' && mentor === 'dl' && <div className="portrait-node"><i /><i /><i /><b /></div>}
      </div>
    </div>
  )
}
