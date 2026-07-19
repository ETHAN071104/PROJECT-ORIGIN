import { describe, expect, it } from 'vitest'
import { ATMOSPHERE_PRESETS, PARTICLE_COUNTS, atmosphereAfterLabCompletion, unlockedAtmospheresForLabs } from './atmospherePresets'

describe('world atmosphere presets', () => {
  it('defines all authored modes and keeps the sandstorm music deliberately filtered', () => {
    expect(Object.keys(ATMOSPHERE_PRESETS)).toEqual(['day', 'dusk', 'night', 'sandstorm'])
    expect(ATMOSPHERE_PRESETS.sandstorm.musicCutoff).toBeLessThan(ATMOSPHERE_PRESETS.night.musicCutoff)
    expect(ATMOSPHERE_PRESETS.night.emissive).toBeGreaterThan(ATMOSPHERE_PRESETS.day.emissive)
  })

  it('unlocks day with CV and dusk after the first restored Lab without exposing sandstorm', () => {
    expect(unlockedAtmospheresForLabs({ cv: false, ml: false, nlp: false, dl: false })).toEqual(['night'])
    expect(unlockedAtmospheresForLabs({ cv: true, ml: false, nlp: false, dl: false })).toEqual(['day', 'dusk', 'night'])
    expect(unlockedAtmospheresForLabs({ cv: false, ml: true, nlp: false, dl: false })).toEqual(['dusk', 'night'])
    expect(unlockedAtmospheresForLabs({ cv: true, ml: true, nlp: false, dl: false })).toEqual(['day', 'dusk', 'night'])
    expect(unlockedAtmospheresForLabs({ cv: false, ml: true, nlp: true, dl: false })).toEqual(['dusk', 'night'])
  })

  it('alternates dusk and night before CV, then cycles day, dusk and night after CV', () => {
    const none = { cv: false, ml: false, nlp: false, dl: false }
    expect(atmosphereAfterLabCompletion('night', none, 'ml')).toBe('dusk')
    expect(atmosphereAfterLabCompletion('dusk', { ...none, ml: true }, 'nlp')).toBe('night')
    expect(atmosphereAfterLabCompletion('night', { ...none, ml: true, nlp: true }, 'cv')).toBe('day')
    expect(atmosphereAfterLabCompletion('day', { cv: true, ml: true, nlp: true, dl: false }, 'dl')).toBe('dusk')
  })

  it('uses bounded particle pools for mobile-friendly quality levels', () => {
    expect(PARTICLE_COUNTS.low).toBeLessThan(PARTICLE_COUNTS.medium)
    expect(PARTICLE_COUNTS.medium).toBeLessThan(PARTICLE_COUNTS.high)
    expect(PARTICLE_COUNTS.high).toBeLessThanOrEqual(40)
  })
})
