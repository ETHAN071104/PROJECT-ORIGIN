import type { Direction } from '../game/types'

interface PixelRobotProps {
  direction?: Direction
  walking?: boolean
  awakened?: boolean
  className?: string
}

export function PixelRobot({ direction = 'down', walking = false, awakened = true, className = '' }: PixelRobotProps) {
  return (
    <div className={`pixel-robot face-${direction} ${walking ? 'is-walking' : ''} ${className}`} aria-label="Small robot">
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
