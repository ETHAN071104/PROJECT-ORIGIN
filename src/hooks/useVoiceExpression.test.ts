import { describe, expect, it } from 'vitest'
import { chooseVoiceNote, isVoiceAbilityAvailable, VOICE_COOLDOWN_MS, voiceCooldownReady } from './useVoiceExpression'

describe('voice expression notes', () => {
  it('maps the random range to the five unlocked syllables', () => {
    expect(chooseVoiceNote(0).name).toBe('do')
    expect(chooseVoiceNote(0.2).name).toBe('re')
    expect(chooseVoiceNote(0.4).name).toBe('mi')
    expect(chooseVoiceNote(0.6).name).toBe('fa')
    expect(chooseVoiceNote(0.999).name).toBe('so')
  })

  it('allows map voice expression only after the anti-spam cooldown', () => {
    expect(voiceCooldownReady(1_000, 1_000 + VOICE_COOLDOWN_MS - 1)).toBe(false)
    expect(voiceCooldownReady(1_000, 1_000 + VOICE_COOLDOWN_MS)).toBe(true)
  })

  it('keeps F available throughout exploration only after NLP is complete', () => {
    expect(isVoiceAbilityAvailable(false, true)).toBe(false)
    expect(isVoiceAbilityAvailable(true, true)).toBe(true)
    expect(isVoiceAbilityAvailable(true, false)).toBe(false)
  })
})
