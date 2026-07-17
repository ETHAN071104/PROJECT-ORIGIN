import { describe, expect, it } from 'vitest'
import { createInitialState, gameReducer } from './reducer'

describe('Project Origin navigation state machine', () => {
  it('walks through every implemented game state', () => {
    let state = createInitialState(null)
    expect(state.screen).toBe('TITLE')

    state = gameReducer(state, { type: 'NEW_GAME' })
    expect(state.screen).toBe('INTRO')
    state = gameReducer(state, { type: 'INTRO_COMPLETE' })
    expect(state.screen).toBe('NAME_ENTRY')
    state = gameReducer(state, { type: 'SET_NAME', name: 'ORI' })
    expect(state.screen).toBe('HUB')

    for (const lab of ['cv', 'ml', 'nlp'] as const) {
      state = gameReducer(state, { type: 'ENTER_LAB', lab })
      expect(state.screen).toBe('LAB_INTERIOR')
      state = gameReducer(state, { type: 'START_DIALOGUE', key: `${lab}-intro` })
      expect(state.screen).toBe('DIALOGUE')
      state = gameReducer(state, { type: 'DIALOGUE_COMPLETE' })
      expect(state.screen).toBe('MINIGAME')
      state = gameReducer(state, { type: 'COMPLETE_STAGE' })
      expect(state.screen).toBe('LAB_COMPLETE')
      state = gameReducer(state, { type: 'ACKNOWLEDGE_LAB_COMPLETE' })
      expect(state.screen).toBe('HUB')
      expect(state.hubSpawn).toBe(`hub-from-${lab}`)
    }

    state = gameReducer(state, { type: 'OPEN_RESEARCH' })
    expect(state.screen).toBe('ENDING')
  })

  it('keeps research locked before all labs are complete', () => {
    let state = createInitialState(null)
    state = gameReducer(state, { type: 'OPEN_RESEARCH' })
    expect(state.screen).toBe('DIALOGUE')
    expect(state.dialogueKey).toBe('research-locked')
    state = gameReducer(state, { type: 'DIALOGUE_COMPLETE' })
    expect(state.screen).toBe('HUB')
    expect(state.hubSpawn).toBe('hub-from-research')
  })

  it.each(['cv', 'ml', 'nlp'] as const)('returns an early %s lab exit to its named door spawn', (lab) => {
    let state = createInitialState(null)
    state = gameReducer(state, { type: 'ENTER_LAB', lab })
    state = gameReducer(state, { type: 'LEAVE_LAB' })

    expect(state.screen).toBe('HUB')
    expect(state.currentLab).toBeNull()
    expect(state.hubSpawn).toBe(`hub-from-${lab}`)
  })
})
