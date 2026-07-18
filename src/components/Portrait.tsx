interface PortraitProps {
  type: 'player' | 'mentor' | 'system'
  mentor?: 'cv' | 'ml' | 'nlp'
  active?: boolean
  visionUpgraded?: boolean
}

export function Portrait({ type, mentor, active = false, visionUpgraded = false }: PortraitProps) {
  return (
    <div className={`portrait portrait-${type} ${mentor ? `portrait-${mentor}` : ''} ${active ? 'is-speaking' : ''}`}>
      <div className="portrait-frame">
        {type === 'player' && <div className={`portrait-bot ${visionUpgraded ? 'has-vision-upgrade' : ''}`}><i /><i /><b /></div>}
        {type === 'system' && <div className="portrait-core"><i /><i /><i /></div>}
        {type === 'mentor' && mentor === 'cv' && <div className="portrait-lens"><i /><b /></div>}
        {type === 'mentor' && mentor === 'ml' && <div className="portrait-pattern"><i /><i /><b /></div>}
        {type === 'mentor' && mentor === 'nlp' && <div className="portrait-lexi"><i /><b /><b /></div>}
      </div>
    </div>
  )
}
