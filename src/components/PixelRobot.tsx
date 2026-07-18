import type { Direction } from '../game/types'

interface PixelRobotProps {
  direction?: Direction
  walking?: boolean
  awakened?: boolean
  visionUpgraded?: boolean
  learningUpgraded?: boolean
  className?: string
}

export function PixelRobot({ direction = 'down', walking = false, awakened = true, visionUpgraded = false, learningUpgraded = false, className = '' }: PixelRobotProps) {
  return (
    <div className={`pixel-robot face-${direction} ${walking ? 'is-walking' : ''} ${visionUpgraded ? 'has-vision-upgrade' : ''} ${learningUpgraded ? 'has-learning-upgrade' : ''} ${className}`} aria-label="Small robot">
      <div className="robot-antenna" />
      <div className="robot-head">
        <span className={awakened ? 'eye lit' : 'eye'} />
        <span className={awakened ? 'eye lit' : 'eye'} />
      </div>
      <div className="robot-neck" />
      <div className="robot-body"><span className="robot-core" /></div>
      <div className="robot-arm arm-left" />
      <div className="robot-arm arm-right" />
      <div className="robot-leg leg-left" />
      <div className="robot-leg leg-right" />
    </div>
  )
}
