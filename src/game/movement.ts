import type { Direction, MovementInput, Point } from './types'

export interface MovementBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export interface MovementVector {
  x: number
  y: number
  direction: Direction | null
}

export const EMPTY_INPUT: MovementInput = { up: false, down: false, left: false, right: false }

export function movementVector(input: MovementInput): MovementVector {
  const rawX = Number(input.right) - Number(input.left)
  const rawY = Number(input.down) - Number(input.up)
  if (rawX === 0 && rawY === 0) return { x: 0, y: 0, direction: null }

  const magnitude = Math.hypot(rawX, rawY)
  const direction: Direction = rawY !== 0
    ? rawY > 0 ? 'down' : 'up'
    : rawX > 0 ? 'right' : 'left'

  return { x: rawX / magnitude, y: rawY / magnitude, direction }
}

export function moveWithinBounds(
  position: Point,
  input: MovementInput,
  speed: number,
  deltaSeconds: number,
  bounds: MovementBounds,
): Point {
  const vector = movementVector(input)
  const safeDelta = Math.max(0, Math.min(deltaSeconds, 0.05))
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, position.x + vector.x * speed * safeDelta)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, position.y + vector.y * speed * safeDelta)),
  }
}
