import { describe, expect, it } from 'vitest'
import {
  calculateBoundaryAccuracy,
  CAT_QUESTIONS,
  FEATURE_CHALLENGES,
  mlExampleMatches,
  PREDICTION_PRODUCTS,
  productIsDefective,
  productLabel,
  TRAINING_PRODUCTS,
} from './mlLab'

describe('Machine Learning Lab configuration', () => {
  it('keeps labeled examples and the prediction example deterministic', () => {
    expect(mlExampleMatches('cat', 'Animal')).toBe(true)
    expect(mlExampleMatches('car', 'Vehicle')).toBe(true)
    expect(mlExampleMatches('banana', 'Fruit')).toBe(true)
    expect(mlExampleMatches('pear', 'Fruit')).toBe(true)
    expect(mlExampleMatches('banana', 'Vehicle')).toBe(false)
  })

  it('provides a forgiving perfect decision boundary', () => {
    expect(calculateBoundaryAccuracy(50, 0).accuracy).toBe(100)
    expect(calculateBoundaryAccuracy(50, 0).passed).toBe(true)
    expect(calculateBoundaryAccuracy(34, 30).passed).toBe(false)
  })

  it('uses the required cat feature answers', () => {
    expect(CAT_QUESTIONS.map((question) => question.answer)).toEqual([true, true, true, false, false])
  })

  it('derives factory labels only from visible deterministic defects', () => {
    expect(TRAINING_PRODUCTS).toHaveLength(6)
    expect(productLabel(TRAINING_PRODUCTS[0])).toBe('Normal')
    expect(productLabel(TRAINING_PRODUCTS[1])).toBe('Defective')
    expect(productIsDefective({ id: 'wheel', name: 'Wheel test', serial: 'T-1', missingWheel: true })).toBe(true)
  })

  it('includes three feature checks and one uncertain prediction', () => {
    expect(FEATURE_CHALLENGES).toHaveLength(3)
    expect(PREDICTION_PRODUCTS.filter((product) => product.uncertain)).toHaveLength(1)
  })
})
