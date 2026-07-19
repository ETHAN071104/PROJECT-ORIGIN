import { describe, expect, it } from 'vitest'
import {
  BOSS_ROUNDS,
  calculateNetworkSignal,
  interferenceQuality,
  isMaximumSignal,
  NEURAL_PATH_ROUNDS,
  POWER_ROUNDS,
  simulateGradientDescent,
  TUNING_ROUNDS,
  validateNeuralPaths,
} from './dlLab'

describe('Deep Learning deterministic curriculum', () => {
  it('ships exactly three deterministic rounds for each ordinary DL stage', () => {
    expect(NEURAL_PATH_ROUNDS).toHaveLength(3)
    expect(POWER_ROUNDS).toHaveLength(3)
    expect(TUNING_ROUNDS.map((round) => round.hiddenNumber)).toEqual(['3', '67', '2012'])
  })

  it('accepts any non-crossing orthogonal route that connects every matching pair', () => {
    for (const round of NEURAL_PATH_ROUNDS) expect(validateNeuralPaths(round, round.solution)).toBe(true)
    const alternateSolution = {
      cyan: [
        { row: 0, col: 0 }, { row: 1, col: 0 }, { row: 1, col: 1 },
        { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 1, col: 4 }, { row: 0, col: 4 },
      ],
      violet: NEURAL_PATH_ROUNDS[0].solution.violet,
    }
    expect(validateNeuralPaths(NEURAL_PATH_ROUNDS[0], alternateSolution)).toBe(true)
    expect(validateNeuralPaths(NEURAL_PATH_ROUNDS[0], { cyan: NEURAL_PATH_ROUNDS[0].solution.cyan })).toBe(false)
    expect(validateNeuralPaths(NEURAL_PATH_ROUNDS[0], {
      ...NEURAL_PATH_ROUNDS[0].solution,
      violet: [
        NEURAL_PATH_ROUNDS[0].pairs[1].start,
        ...NEURAL_PATH_ROUNDS[0].solution.cyan.slice(1),
        NEURAL_PATH_ROUNDS[0].pairs[1].end,
      ],
    })).toBe(false)
  })

  it('calculates the visible layer arithmetic and recognizes only the maximum route', () => {
    for (const round of POWER_ROUNDS) {
      const choices = round.layers.reduce<string[][]>(
        (paths, layer) => paths.flatMap((path) => layer.map((choice) => [...path, choice.id])),
        [[]],
      )
      const strongest = choices.find((choiceIds) => isMaximumSignal(round, choiceIds))!
      const result = calculateNetworkSignal(round, strongest)
      expect(result.complete).toBe(true)
      expect(result.value).toBeCloseTo(round.target)
      expect(isMaximumSignal(round, strongest)).toBe(true)
      expect(choices.some((choiceIds) => !isMaximumSignal(round, choiceIds))).toBe(true)
    }
  })

  it('mixes the maximum choices between upper and lower buttons', () => {
    const maximumPositions = POWER_ROUNDS.map((round) => round.layers.map((layer) => {
      const best = layer.reduce((current, choice) => (
        choice.gain > current.gain || (choice.gain === current.gain && choice.bias > current.bias) ? choice : current
      ))
      return layer.indexOf(best)
    }))

    expect(maximumPositions[0]).toEqual([0, 1, 0])
    expect(maximumPositions[1]).toEqual([1, 1, 0])
    expect(maximumPositions[2]).toEqual([0, 1, 0, 1])
  })

  it('makes tuning quality deterministic and maximal at the authored angle', () => {
    for (const round of TUNING_ROUNDS) {
      expect(interferenceQuality(round, round.targetAngle)).toBe(1)
      expect(interferenceQuality(round, round.targetAngle + 90)).toBe(0)
    }
  })

  it('produces deterministic boss successes and distinct failure outcomes', () => {
    expect(simulateGradientDescent(BOSS_ROUNDS[0], .25, 'default').outcome).toBe('converged')
    expect(simulateGradientDescent(BOSS_ROUNDS[0], .05, 'default').outcome).toBe('too slow')
    expect(simulateGradientDescent(BOSS_ROUNDS[0], 1.1, 'default').outcome).toBe('unstable')

    expect(simulateGradientDescent(BOSS_ROUNDS[1], .15, 'default').outcome).toBe('converged')
    expect(simulateGradientDescent(BOSS_ROUNDS[1], .45, 'default').outcome).toBe('overshot')

    expect(simulateGradientDescent(BOSS_ROUNDS[2], .02, 'left').outcome).toBe('converged')
    expect(simulateGradientDescent(BOSS_ROUNDS[2], .02, 'right').outcome).toBe('local minimum')
  })
})
