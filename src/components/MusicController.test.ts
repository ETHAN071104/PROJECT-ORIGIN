import { describe, expect, it } from 'vitest'
import { musicThemeForScreen } from './MusicController'

describe('scene music routing', () => {
  it('uses the title and ending prototypes in their canonical scenes', () => {
    expect(musicThemeForScreen('TITLE', false)).toBe('origin-signal')
    expect(musicThemeForScreen('INTRO', false)).toBe('origin-signal')
    expect(musicThemeForScreen('ENDING', true)).toBe('stand-among-giants')
  })

  it('switches the Academy from night to day after CV', () => {
    expect(musicThemeForScreen('HUB', false)).toBe('academy-night')
    expect(musicThemeForScreen('HUB', true)).toBe('academy-day')
    expect(musicThemeForScreen('MINIGAME', true)).toBe('academy-day')
  })
})
