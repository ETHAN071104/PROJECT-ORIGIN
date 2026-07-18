import { describe, expect, it } from 'vitest'
import { chooseVoiceNote } from './useVoiceExpression'

describe('voice expression notes', () => {
  it('maps the random range to the five unlocked syllables', () => {
    expect(chooseVoiceNote(0).name).toBe('do')
    expect(chooseVoiceNote(0.2).name).toBe('re')
    expect(chooseVoiceNote(0.4).name).toBe('mi')
    expect(chooseVoiceNote(0.6).name).toBe('fa')
    expect(chooseVoiceNote(0.999).name).toBe('so')
  })
})
