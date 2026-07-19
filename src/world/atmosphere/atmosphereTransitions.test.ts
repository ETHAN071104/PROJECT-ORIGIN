import { describe, expect, it } from 'vitest'
import { clampedTransitionSeconds } from './atmosphereTransitions'

describe('atmosphere transitions', () => {
  it('keeps authored transitions inside the requested three-to-five-second range', () => {
    expect(clampedTransitionSeconds(1)).toBe(3)
    expect(clampedTransitionSeconds(4)).toBe(4)
    expect(clampedTransitionSeconds(8)).toBe(5)
  })

  it('collapses transitions for reduced-motion players', () => {
    expect(clampedTransitionSeconds(4, true)).toBe(.01)
  })
})
