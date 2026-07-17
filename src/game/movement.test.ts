import { describe, expect, it } from 'vitest'
import { moveWithinBounds, movementVector } from './movement'

const bounds = { minX: 0, maxX: 960, minY: 0, maxY: 540 }

describe('continuous movement math', () => {
  it('moves the same distance at different refresh rates', () => {
    let at60 = { x: 100, y: 100 }
    let at30 = { x: 100, y: 100 }
    const input = { up: true, down: false, left: false, right: false }
    for (let frame = 0; frame < 60; frame += 1) at60 = moveWithinBounds(at60, input, 120, 1 / 60, bounds)
    for (let frame = 0; frame < 30; frame += 1) at30 = moveWithinBounds(at30, input, 120, 1 / 30, bounds)
    expect(at60.y).toBeCloseTo(at30.y, 5)
  })

  it('normalizes diagonal movement', () => {
    const vector = movementVector({ up: true, down: false, left: false, right: true })
    expect(Math.hypot(vector.x, vector.y)).toBeCloseTo(1, 5)
  })

  it('keeps the player inside collision bounds', () => {
    const next = moveWithinBounds(
      { x: 2, y: 2 },
      { up: true, down: false, left: true, right: false },
      500,
      0.05,
      bounds,
    )
    expect(next).toEqual({ x: 0, y: 0 })
  })
})
