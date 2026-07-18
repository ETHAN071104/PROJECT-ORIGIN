import { describe, expect, it } from 'vitest'
import {
  BOSS_FINAL_REPLAY,
  BOSS_ROUNDS,
  calculateBossFrame,
  calculateBossReplayFrame,
  calculateBossScore,
  classificationIsCorrect,
  LOCATION_TARGETS,
  pointInPercentRect,
  targetMatchesSelection,
} from './cvLab'

describe('Computer Vision Lab configuration', () => {
  it('keeps the required image classification mapping', () => {
    expect(classificationIsCorrect('cat', 'Living')).toBe(true)
    expect(classificationIsCorrect('tree', 'Living')).toBe(true)
    expect(classificationIsCorrect('car', 'Machine')).toBe(true)
    expect(classificationIsCorrect('robot', 'Machine')).toBe(true)
    expect(classificationIsCorrect('street-lamp', 'Object')).toBe(true)
    expect(classificationIsCorrect('apple', 'Object')).toBe(true)
    expect(classificationIsCorrect('apple', 'Machine')).toBe(false)
  })

  it('requires a matching selected class for an object target', () => {
    const car = LOCATION_TARGETS.find((target) => target.id === 'car')!
    expect(targetMatchesSelection(car, 'Car')).toBe(true)
    expect(targetMatchesSelection(car, 'Tree')).toBe(false)
    expect(targetMatchesSelection(car, null)).toBe(false)
  })

  it('uses inclusive touch-friendly rectangle hitboxes', () => {
    const rect = { x: 10, y: 20, width: 30, height: 40 }
    expect(pointInPercentRect(10, 20, rect)).toBe(true)
    expect(pointInPercentRect(40, 60, rect)).toBe(true)
    expect(pointInPercentRect(41, 60, rect)).toBe(false)
  })

  it('defines three distinct five-target driving rounds', () => {
    expect(BOSS_ROUNDS).toHaveLength(3)
    expect(BOSS_ROUNDS.every((round) => round.objects.length === 5)).toBe(true)
    expect(new Set(BOSS_ROUNDS.map((round) => round.id)).size).toBe(3)
  })

  it('passes each boss round at four of five correct labels', () => {
    const targets = BOSS_ROUNDS[0].objects
    const fourTargets = targets.slice(0, 4).map((target) => target.id)
    expect(calculateBossScore(targets, fourTargets)).toEqual({ correct: 4, missed: 1, accuracy: 80, passed: true })
    expect(calculateBossScore(targets, fourTargets.slice(0, 3)).passed).toBe(false)
  })

  it('produces deterministic frames that can be frozen exactly', () => {
    const round = BOSS_ROUNDS[1]
    expect(calculateBossFrame(round, 2140)).toEqual(calculateBossFrame(round, 2140))
    expect(calculateBossFrame(round, 2140)).not.toEqual(calculateBossFrame(round, 3140))
  })

  it('steers left and returns during the trained replay', () => {
    const beforeAvoidance = calculateBossReplayFrame(BOSS_FINAL_REPLAY, 600)
    const duringAvoidance = calculateBossReplayFrame(BOSS_FINAL_REPLAY, 3000)
    const afterAvoidance = calculateBossReplayFrame(BOSS_FINAL_REPLAY, 5600)
    expect(duringAvoidance.playerShift).toBeLessThan(beforeAvoidance.playerShift)
    expect(Math.abs(afterAvoidance.playerShift)).toBeLessThan(1)
  })
})
