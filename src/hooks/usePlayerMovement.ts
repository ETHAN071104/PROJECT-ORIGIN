import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { playTone } from '../audio/audio'
import { moveWithinBounds, movementVector, type MovementBounds } from '../game/movement'
import type { Direction, MovementInput, Point } from '../game/types'
import { useSceneInput } from './useSceneInput'

interface PlayerMovementOptions {
  active: boolean
  initialPosition: Point
  initialDirection: Direction
  bounds: MovementBounds
  speed: number
  audioEnabled: boolean
  onPositionChange?: (position: Point) => void
  onInteract: (position: Point) => void
}

export function usePlayerMovement({
  active,
  initialPosition,
  initialDirection,
  bounds,
  speed,
  audioEnabled,
  onPositionChange,
  onInteract,
}: PlayerMovementOptions) {
  const playerRef = useRef<HTMLDivElement>(null)
  const positionRef = useRef<Point>({ ...initialPosition })
  const directionRef = useRef(initialDirection)
  const walkingRef = useRef(false)
  const [direction, setDirection] = useState(initialDirection)
  const [walking, setWalking] = useState(false)

  const writePosition = useCallback((position: Point) => {
    playerRef.current?.style.setProperty('--player-x', `${position.x}px`)
    playerRef.current?.style.setProperty('--player-y', `${position.y}px`)
  }, [])

  useLayoutEffect(() => {
    positionRef.current = { ...initialPosition }
    directionRef.current = initialDirection
    writePosition(initialPosition)
  }, [initialDirection, initialPosition, writePosition])

  const onFrame = useCallback((input: MovementInput, deltaSeconds: number) => {
    const vector = movementVector(input)
    const isMoving = vector.direction !== null

    if (walkingRef.current !== isMoving) {
      walkingRef.current = isMoving
      setWalking(isMoving)
      if (isMoving) playTone(audioEnabled, 'step')
    }

    if (!isMoving || !vector.direction) return
    if (directionRef.current !== vector.direction) {
      directionRef.current = vector.direction
      setDirection(vector.direction)
    }

    const next = moveWithinBounds(positionRef.current, input, speed, deltaSeconds, bounds)
    positionRef.current = next
    writePosition(next)
    onPositionChange?.(next)
  }, [audioEnabled, bounds, onPositionChange, speed, writePosition])

  const interact = useCallback(() => onInteract(positionRef.current), [onInteract])
  const input = useSceneInput(active, onFrame, interact)
  const playerStyle = {
    '--player-x': `${initialPosition.x}px`,
    '--player-y': `${initialPosition.y}px`,
  } as CSSProperties

  return {
    direction,
    input,
    playerRef,
    playerStyle,
    positionRef,
    walking,
  }
}
