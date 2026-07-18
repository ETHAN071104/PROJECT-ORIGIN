import { describe, expect, it } from 'vitest'
import { calculateScaledStage, clientToLogicalPoint, GAME_HEIGHT, GAME_WIDTH } from './coordinates'

describe('fixed logical game coordinates', () => {
  it.each([
    [1920, 1080, 2],
    [1024, 576, 576 / 540],
    [1366, 768, 768 / 540],
    [844, 390, 390 / 540],
    [740, 360, 360 / 540],
  ])('fits 960x540 inside %ix%i without changing aspect ratio', (width, height, expectedScale) => {
    const stage = calculateScaledStage(width, height)
    expect(stage.scale).toBeCloseTo(expectedScale, 5)
    expect(stage.width / stage.height).toBeCloseTo(GAME_WIDTH / GAME_HEIGHT, 5)
    expect(stage.width).toBeLessThanOrEqual(width)
    expect(stage.height).toBeLessThanOrEqual(height)
  })

  it('converts container pointer coordinates into logical coordinates', () => {
    const point = clientToLogicalPoint(430, 220, { left: 50, top: 10, width: 760, height: 420 })
    expect(point.x).toBe(480)
    expect(point.y).toBe(270)
  })
})
