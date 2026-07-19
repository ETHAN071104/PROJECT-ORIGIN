import { describe, expect, it } from 'vitest'
import { activeThemeEvents, MUSIC_THEMES, ORIGIN_MOTIF, themeLoopSeconds } from './musicThemes'
import { EMPTY_MUSIC_PROGRESSION } from './audioTypes'

describe('procedural music themes', () => {
  it('defines four original loopable prototypes between 20 and 45 seconds', () => {
    expect(Object.keys(MUSIC_THEMES)).toEqual([
      'origin-signal',
      'academy-night',
      'academy-day',
      'stand-among-giants',
    ])
    for (const theme of Object.values(MUSIC_THEMES)) {
      expect(themeLoopSeconds(theme)).toBeGreaterThanOrEqual(20)
      expect(themeLoopSeconds(theme)).toBeLessThanOrEqual(45)
      expect(theme.events.length).toBeGreaterThan(12)
    }
  })

  it('keeps the C, E-flat, G, D identity in the shared motif', () => {
    expect(ORIGIN_MOTIF).toEqual([60, 63, 67, 62])
  })

  it('adds Academy layers only when their Lab module is restored', () => {
    const theme = MUSIC_THEMES['academy-night']
    const base = activeThemeEvents(theme, EMPTY_MUSIC_PROGRESSION)
    const afterCv = activeThemeEvents(theme, { ...EMPTY_MUSIC_PROGRESSION, cv: true })
    const afterMl = activeThemeEvents(theme, { ...EMPTY_MUSIC_PROGRESSION, ml: true })
    const full = activeThemeEvents(theme, { cv: true, ml: true, nlp: true, dl: true })
    expect(afterCv.length).toBeGreaterThan(base.length)
    expect(afterMl.length).toBeGreaterThan(base.length)
    expect(full.length).toBe(theme.events.length)
  })
})
