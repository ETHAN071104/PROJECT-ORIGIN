import { describe, expect, it } from 'vitest'
import {
  boundariesMatch,
  moveWord,
  ORDERING_ROUNDS,
  orderingMatches,
  PREDICTION_ROUNDS,
  predictionIsLikely,
  synonymMatches,
  TOKEN_ROUNDS,
  tokensFromBoundaries,
} from './nlpLab'

describe('NLP lab teaching data', () => {
  it('validates the required word and punctuation token boundaries', () => {
    expect(boundariesMatch(TOKEN_ROUNDS[0], [2, 1])).toBe(true)
    expect(tokensFromBoundaries(TOKEN_ROUNDS[0], [1, 2])).toEqual(['Robots', 'can', 'learn'])
    expect(tokensFromBoundaries(TOKEN_ROUNDS[2], [1, 2, 4])).toEqual(['Hello', ',', 'robot', '!'])
    expect(boundariesMatch(TOKEN_ROUNDS[2], [1, 4])).toBe(false)
  })

  it('uses fixed, transparent simulated next-word probabilities', () => {
    for (const round of PREDICTION_ROUNDS) {
      expect(round.choices.reduce((sum, choice) => sum + choice.probability, 0)).toBe(100)
      const topChoice = [...round.choices].sort((a, b) => b.probability - a.probability)[0]
      expect(predictionIsLikely(round, topChoice.word)).toBe(true)
    }
  })

  it('matches only the intended semantic pairs', () => {
    expect(synonymMatches('Happy', 'Joyful')).toBe(true)
    expect(synonymMatches('Happy', 'Engine')).toBe(false)
    expect(synonymMatches('Large', 'Fast')).toBe(false)
  })

  it('moves and validates ordering tiles without mutating the source', () => {
    const source = ['two', 'one', 'three']
    expect(moveWord(source, 1, -1)).toEqual(['one', 'two', 'three'])
    expect(source).toEqual(['two', 'one', 'three'])
    expect(moveWord(source, 0, -1)).toBe(source)
    expect(orderingMatches(ORDERING_ROUNDS[0].correct, ORDERING_ROUNDS[0].correct)).toBe(true)
    expect(orderingMatches(ORDERING_ROUNDS[0].scrambled, ORDERING_ROUNDS[0].correct)).toBe(false)
  })
})
