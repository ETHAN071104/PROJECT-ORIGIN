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

    state = gameReducer(state, { type: 'ENTER_LAB', lab: 'cv' })
    expect(state.screen).toBe('LAB_INTERIOR')
    state = gameReducer(state, { type: 'START_DIALOGUE', key: 'cv-intro' })
    state = gameReducer(state, { type: 'DIALOGUE_COMPLETE' })
    expect(state.screen).toBe('MINIGAME')
    state = gameReducer(state, { type: 'RECORD_CV_STAGE', stage: 1 })
    state = gameReducer(state, { type: 'RECORD_CV_STAGE', stage: 2 })
    state = gameReducer(state, { type: 'RECORD_CV_STAGE', stage: 3 })
    expect(state.save.stageProgress.cv).toBe(3)
    state = gameReducer(state, { type: 'COMPLETE_CV_LAB' })
    expect(state.save.stageProgress.cv).toBe(4)
    expect(state.save.completedLabs.cv).toBe(true)
    expect(state.save.achievements).toContain('MACHINES_FIRST_SIGHT')
    state = gameReducer(state, { type: 'FINISH_CV_LAB' })
    expect(state.screen).toBe('LAB_COMPLETE')
    state = gameReducer(state, { type: 'ACKNOWLEDGE_LAB_COMPLETE' })
    expect(state.hubSpawn).toBe('hub-from-cv')

    state = gameReducer(state, { type: 'ENTER_LAB', lab: 'ml' })
    state = gameReducer(state, { type: 'START_DIALOGUE', key: 'ml-intro' })
    state = gameReducer(state, { type: 'DIALOGUE_COMPLETE' })
    state = gameReducer(state, { type: 'RECORD_ML_STAGE', stage: 1 })
    state = gameReducer(state, { type: 'RECORD_ML_STAGE', stage: 2 })
    state = gameReducer(state, { type: 'RECORD_ML_STAGE', stage: 3 })
    expect(state.save.stageProgress.ml).toBe(3)
    state = gameReducer(state, { type: 'COMPLETE_ML_LAB' })
    expect(state.save.stageProgress.ml).toBe(4)
    expect(state.save.completedLabs.ml).toBe(true)
    expect(state.save.achievements).toContain('PATTERN_FINDER')
    state = gameReducer(state, { type: 'FINISH_ML_LAB' })
    expect(state.screen).toBe('LAB_COMPLETE')
    state = gameReducer(state, { type: 'ACKNOWLEDGE_LAB_COMPLETE' })
    expect(state.hubSpawn).toBe('hub-from-ml')

    state = gameReducer(state, { type: 'ENTER_LAB', lab: 'nlp' })
    state = gameReducer(state, { type: 'START_DIALOGUE', key: 'nlp-intro' })
    state = gameReducer(state, { type: 'DIALOGUE_COMPLETE' })
    state = gameReducer(state, { type: 'RECORD_NLP_STAGE', stage: 1 })
    state = gameReducer(state, { type: 'RECORD_NLP_STAGE', stage: 2 })
    state = gameReducer(state, { type: 'RECORD_NLP_STAGE', stage: 3 })
    expect(state.save.stageProgress.nlp).toBe(3)
    state = gameReducer(state, { type: 'COMPLETE_NLP_LAB' })
    expect(state.save.stageProgress.nlp).toBe(4)
    expect(state.save.completedLabs.nlp).toBe(true)
    expect(state.save.achievements).toContain('LANGUAGE_DECODER')
    expect(state.save.achievements).toContain('AI_AWAKENED')
    state = gameReducer(state, { type: 'FINISH_NLP_LAB' })
    expect(state.screen).toBe('LAB_COMPLETE')
    state = gameReducer(state, { type: 'ACKNOWLEDGE_LAB_COMPLETE' })
    expect(state.hubSpawn).toBe('hub-from-nlp')

    state = gameReducer(state, { type: 'ENTER_HISTORY_ROUTE' })
    expect(state.screen).toBe('HISTORY_MAP')
    state = gameReducer(state, { type: 'RETURN_TO_HUB_FROM_HISTORY' })
    expect(state.screen).toBe('HUB')

    state = gameReducer(state, { type: 'ENTER_LAB', lab: 'dl' })
    expect(state.screen).toBe('LAB_INTERIOR')
    state = gameReducer(state, { type: 'START_DIALOGUE', key: 'dl-intro' })
    state = gameReducer(state, { type: 'DIALOGUE_COMPLETE' })
    state = gameReducer(state, { type: 'RECORD_DL_STAGE', stage: 1 })
    state = gameReducer(state, { type: 'RECORD_DL_STAGE', stage: 2 })
    state = gameReducer(state, { type: 'RECORD_DL_STAGE', stage: 3 })
    expect(state.save.stageProgress.dl).toBe(3)
    state = gameReducer(state, { type: 'COMPLETE_DL_LAB' })
    expect(state.save.stageProgress.dl).toBe(4)
    expect(state.save.completedLabs.dl).toBe(true)
    expect(state.save.achievements).toContain('NEURAL_CORE_ONLINE')
    state = gameReducer(state, { type: 'FINISH_DL_LAB' })
    expect(state.screen).toBe('LAB_COMPLETE')
    state = gameReducer(state, { type: 'ACKNOWLEDGE_LAB_COMPLETE' })
    expect(state.hubSpawn).toBe('hub-from-dl')

    state = gameReducer(state, { type: 'ENTER_HISTORY_ROUTE' })
    expect(state.screen).toBe('HISTORY_MAP')
    expect(state.historySpawn).toBe('history-events-from-hub')
    expect(state.save.worldProgress.hallVisited).toBe(true)
    state = gameReducer(state, { type: 'READ_HISTORY_ENTRY', id: 'hall-imitation-game-1950' })
    expect(state.save.worldProgress.readExhibitIds).toContain('hall-imitation-game-1950')
    state = gameReducer(state, { type: 'ENTER_PEOPLE_GALLERY' })
    expect(state.screen).toBe('PEOPLE_MAP')
    expect(state.peopleSpawn).toBe('people-from-events')
    state = gameReducer(state, { type: 'RETURN_TO_HISTORY_EVENTS' })
    expect(state.screen).toBe('HISTORY_MAP')
    expect(state.historySpawn).toBe('history-events-from-people')
    state = gameReducer(state, { type: 'RETURN_TO_HUB_FROM_HISTORY' })
    expect(state.screen).toBe('HUB')
    expect(state.hubSpawn).toBe('hub-from-history')
    state = gameReducer(state, { type: 'ENTER_RESEARCH_ROUTE' })
    expect(state.screen).toBe('RESEARCH_MAP')
    expect(state.researchSpawn).toBe('research-from-hub')
    expect(state.save.worldProgress.researchVisited).toBe(true)
    state = gameReducer(state, { type: 'REACH_FINAL_GATE' })
    expect(state.screen).toBe('RESEARCH_MAP')
    expect(state.save.worldProgress.finalGateReached).toBe(true)
    state = gameReducer(state, { type: 'RETURN_TO_HUB_FROM_RESEARCH' })
    expect(state.screen).toBe('HUB')
    expect(state.hubSpawn).toBe('hub-from-research')
  })

  it('keeps the East Gate route locked until the Deep Learning Lab is complete', () => {
    let state = createInitialState(null)
    state = { ...state, screen: 'HUB' }
    state = gameReducer(state, { type: 'ENTER_RESEARCH_ROUTE' })
    expect(state.screen).toBe('HUB')
    state = gameReducer(state, { type: 'OPEN_RESEARCH' })
    expect(state.screen).toBe('HUB')
  })

  it('does not trust an invalid DL-only save to open the East Gate', () => {
    let state = createInitialState(null)
    state = { ...state, screen: 'HUB', save: { ...state.save, completedLabs: { cv: false, ml: false, nlp: false, dl: true } } }
    state = gameReducer(state, { type: 'ENTER_RESEARCH_ROUTE' })
    expect(state.screen).toBe('HUB')
  })

  it('keeps History and Research as independent Hub branches and never auto-starts an ending at the Final Gate', () => {
    let state = createInitialState(null)
    state = {
      ...state,
      screen: 'HUB',
      save: { ...state.save, completedLabs: { cv: true, ml: true, nlp: true, dl: true } },
    }

    state = gameReducer(state, { type: 'ENTER_HISTORY_ROUTE' })
    expect(state.screen).toBe('HISTORY_MAP')
    state = gameReducer(state, { type: 'RETURN_TO_HUB_FROM_HISTORY' })
    expect(state.screen).toBe('HUB')
    state = gameReducer(state, { type: 'ENTER_RESEARCH_ROUTE' })
    expect(state.screen).toBe('RESEARCH_MAP')
    state = gameReducer(state, { type: 'REACH_FINAL_GATE' })

    expect(state.screen).toBe('RESEARCH_MAP')
    expect(state.save.worldProgress.finalGateReached).toBe(true)
  })

  it('starts the Archive Zero ending only after every Lab is complete and the Final Gate is reached', () => {
    let state = createInitialState(null)
    state = { ...state, screen: 'RESEARCH_MAP' }

    expect(gameReducer(state, { type: 'START_ENDING' })).toBe(state)

    state = {
      ...state,
      save: { ...state.save, completedLabs: { cv: true, ml: true, nlp: true, dl: true } },
    }
    expect(gameReducer(state, { type: 'START_ENDING' })).toBe(state)

    state = gameReducer(state, { type: 'REACH_FINAL_GATE' })
    state = gameReducer(state, { type: 'START_ENDING' })

    expect(state.screen).toBe('ENDING')
    expect(state.save.endingCompleted).toBe(false)
    expect(state.save.worldProgress.lastMap).toBe('research')
    expect(state.save.worldProgress.lastSpawn).toBe('research-from-ending')
  })

  it('records ending completion and returns to a safe Research spawn without replaying automatically', () => {
    let state = createInitialState(null)
    state = {
      ...state,
      screen: 'RESEARCH_MAP',
      hasStoredSave: true,
      save: {
        ...state.save,
        playerName: 'ORI',
        introCompleted: true,
        completedLabs: { cv: true, ml: true, nlp: true, dl: true },
        worldProgress: { ...state.save.worldProgress, finalGateReached: true },
      },
    }
    state = gameReducer(state, { type: 'START_ENDING' })
    state = gameReducer(state, { type: 'COMPLETE_ENDING' })

    expect(state.screen).toBe('ENDING')
    expect(state.save.endingCompleted).toBe(true)

    state = gameReducer(state, { type: 'CONTINUE_EXPLORING' })
    expect(state.screen).toBe('RESEARCH_MAP')
    expect(state.researchSpawn).toBe('research-from-ending')
    expect(state.save.worldProgress.lastSpawn).toBe('research-from-ending')

    state = { ...state, screen: 'TITLE' }
    state = gameReducer(state, { type: 'CONTINUE_GAME' })
    expect(state.screen).toBe('RESEARCH_MAP')
    expect(state.researchSpawn).toBe('research-from-ending')
  })

  it('marks the ending complete before returning to the title', () => {
    let state = createInitialState(null)
    state = {
      ...state,
      screen: 'ENDING',
      save: {
        ...state.save,
        completedLabs: { cv: true, ml: true, nlp: true, dl: true },
        worldProgress: { ...state.save.worldProgress, finalGateReached: true },
      },
    }

    state = gameReducer(state, { type: 'END_ENDING_TO_TITLE' })

    expect(state.screen).toBe('TITLE')
    expect(state.save.endingCompleted).toBe(true)
    expect(state.save.worldProgress.lastSpawn).toBe('research-from-ending')
  })

  it('continues on the last unlocked world map with its safe named spawn', () => {
    let state = createInitialState(null)
    state = {
      ...state,
      hasStoredSave: true,
      save: {
        ...state.save,
        playerName: 'ORI',
        introCompleted: true,
        completedLabs: { cv: true, ml: true, nlp: true, dl: true },
        worldProgress: {
          ...state.save.worldProgress,
          hallVisited: true,
          lastMap: 'history',
          lastSpawn: 'history-events-from-people',
        },
      },
    }

    state = gameReducer(state, { type: 'CONTINUE_GAME' })
    expect(state.screen).toBe('HISTORY_MAP')
    expect(state.historySpawn).toBe('history-events-from-people')
  })

  it('returns from the Hub to the title without losing the current save', () => {
    let state = createInitialState(null)
    state = gameReducer(state, { type: 'NEW_GAME' })
    state = gameReducer(state, { type: 'INTRO_COMPLETE' })
    state = gameReducer(state, { type: 'SET_NAME', name: 'ORI' })
    const save = state.save

    state = gameReducer(state, { type: 'RETURN_TO_TITLE' })

    expect(state.screen).toBe('TITLE')
    expect(state.currentLab).toBeNull()
    expect(state.save).toBe(save)
    expect(state.hasStoredSave).toBe(true)
  })

  it('persists the selected language across a new game', () => {
    let state = createInitialState(null)
    state = gameReducer(state, { type: 'SET_LANGUAGE', language: 'zh-CN' })
    expect(state.save.language).toBe('zh-CN')

    state = gameReducer(state, { type: 'NEW_GAME' })
    expect(state.save.language).toBe('zh-CN')
    expect(state.screen).toBe('INTRO')
  })

  it('keeps DL sealed until all three foundation labs are complete', () => {
    let state = createInitialState(null)
    state = { ...state, screen: 'HUB' }
    state = gameReducer(state, { type: 'ENTER_LAB', lab: 'dl' })
    expect(state.screen).toBe('HUB')
    expect(state.currentLab).toBeNull()

    state = { ...state, save: { ...state.save, completedLabs: { ...state.save.completedLabs, cv: true, ml: true, nlp: true } } }
    state = gameReducer(state, { type: 'ENTER_LAB', lab: 'dl' })
    expect(state.screen).toBe('LAB_INTERIOR')
    expect(state.currentLab).toBe('dl')
  })

  it.each(['cv', 'ml', 'nlp'] as const)('returns an early %s lab exit to its named door spawn', (lab) => {
    let state = createInitialState(null)
    state = gameReducer(state, { type: 'ENTER_LAB', lab })
    state = gameReducer(state, { type: 'LEAVE_LAB' })

    expect(state.screen).toBe('HUB')
    expect(state.currentLab).toBeNull()
    expect(state.hubSpawn).toBe(`hub-from-${lab}`)
  })

  it('never moves CV progress backwards and ignores CV actions outside the CV lab', () => {
    let state = createInitialState(null)
    state = gameReducer(state, { type: 'RECORD_CV_STAGE', stage: 2 })
    expect(state.save.stageProgress.cv).toBe(0)

    state = gameReducer(state, { type: 'ENTER_LAB', lab: 'cv' })
    state = gameReducer(state, { type: 'RECORD_CV_STAGE', stage: 3 })
    state = gameReducer(state, { type: 'RECORD_CV_STAGE', stage: 1 })
    expect(state.save.stageProgress.cv).toBe(3)
  })

  it('never moves ML progress backwards and ignores ML actions outside the ML lab', () => {
    let state = createInitialState(null)
    state = gameReducer(state, { type: 'RECORD_ML_STAGE', stage: 2 })
    expect(state.save.stageProgress.ml).toBe(0)

    state = gameReducer(state, { type: 'ENTER_LAB', lab: 'ml' })
    state = gameReducer(state, { type: 'RECORD_ML_STAGE', stage: 3 })
    state = gameReducer(state, { type: 'RECORD_ML_STAGE', stage: 1 })
    expect(state.save.stageProgress.ml).toBe(3)
  })

  it('never moves NLP progress backwards and ignores NLP actions outside the NLP lab', () => {
    let state = createInitialState(null)
    state = gameReducer(state, { type: 'RECORD_NLP_STAGE', stage: 2 })
    expect(state.save.stageProgress.nlp).toBe(0)

    state = gameReducer(state, { type: 'ENTER_LAB', lab: 'nlp' })
    state = gameReducer(state, { type: 'RECORD_NLP_STAGE', stage: 3 })
    state = gameReducer(state, { type: 'RECORD_NLP_STAGE', stage: 1 })
    expect(state.save.stageProgress.nlp).toBe(3)
  })

  it('never moves DL progress backwards and ignores DL actions while locked or outside DL', () => {
    let state = createInitialState(null)
    state = gameReducer(state, { type: 'RECORD_DL_STAGE', stage: 2 })
    expect(state.save.stageProgress.dl).toBe(0)
    state = { ...state, save: { ...state.save, completedLabs: { cv: true, ml: true, nlp: true, dl: false } } }
    state = gameReducer(state, { type: 'ENTER_LAB', lab: 'dl' })
    state = gameReducer(state, { type: 'RECORD_DL_STAGE', stage: 3 })
    state = gameReducer(state, { type: 'RECORD_DL_STAGE', stage: 1 })
    expect(state.save.stageProgress.dl).toBe(3)
  })

  it('awards AI Awakened no matter which foundation lab is completed last', () => {
    let state = createInitialState(null)
    state = gameReducer(state, { type: 'ENTER_LAB', lab: 'nlp' })
    state = gameReducer(state, { type: 'COMPLETE_NLP_LAB' })
    state = gameReducer(state, { type: 'LEAVE_LAB' })
    state = gameReducer(state, { type: 'ENTER_LAB', lab: 'cv' })
    state = gameReducer(state, { type: 'COMPLETE_CV_LAB' })
    state = gameReducer(state, { type: 'LEAVE_LAB' })
    state = gameReducer(state, { type: 'ENTER_LAB', lab: 'ml' })
    state = gameReducer(state, { type: 'COMPLETE_ML_LAB' })

    expect(state.save.achievements).toContain('AI_AWAKENED')
    expect(state.save.achievements.filter((item) => item === 'AI_AWAKENED')).toHaveLength(1)
  })
})
