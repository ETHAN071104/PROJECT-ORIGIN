import { emptySave } from './storage'
import type { GameAction, GameState, SaveData } from './types'

export function createInitialState(stored: SaveData | null): GameState {
  return {
    screen: 'TITLE',
    save: stored ?? emptySave(),
    currentLab: null,
    dialogueKey: null,
    hasStoredSave: Boolean(stored?.introCompleted && stored.playerName),
    hubSpawn: 'hub-default',
  }
}

const allLabsComplete = (save: SaveData) =>
  save.completedLabs.cv && save.completedLabs.ml && save.completedLabs.nlp

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return {
        ...createInitialState(null),
        screen: 'INTRO',
        save: emptySave(state.save.audioEnabled),
      }
    case 'CONTINUE_GAME':
      return state.hasStoredSave
        ? { ...state, screen: 'HUB', currentLab: null, dialogueKey: null, hubSpawn: 'hub-default' }
        : state
    case 'INTRO_COMPLETE':
      return {
        ...state,
        screen: 'NAME_ENTRY',
        save: { ...state.save, introCompleted: true },
      }
    case 'SET_NAME': {
      const name = action.name.trim().slice(0, 12)
      if (!name) return state
      return {
        ...state,
        screen: 'HUB',
        hasStoredSave: true,
        hubSpawn: 'hub-default',
        save: { ...state.save, playerName: name },
      }
    }
    case 'ENTER_LAB':
      return { ...state, screen: 'LAB_INTERIOR', currentLab: action.lab }
    case 'LEAVE_LAB':
      return {
        ...state,
        screen: 'HUB',
        currentLab: null,
        dialogueKey: null,
        hubSpawn: state.currentLab ? `hub-from-${state.currentLab}` : state.hubSpawn,
      }
    case 'START_DIALOGUE':
      return { ...state, screen: 'DIALOGUE', dialogueKey: action.key }
    case 'DIALOGUE_COMPLETE':
      if (state.dialogueKey === 'research-locked') {
        return { ...state, screen: 'HUB', dialogueKey: null }
      }
      return { ...state, screen: 'MINIGAME', dialogueKey: null }
    case 'COMPLETE_STAGE': {
      if (!state.currentLab) return state
      const lab = state.currentLab
      const achievement = `LAB_${lab.toUpperCase()}_COMPLETE`
      return {
        ...state,
        screen: 'LAB_COMPLETE',
        save: {
          ...state.save,
          completedLabs: { ...state.save.completedLabs, [lab]: true },
          stageProgress: { ...state.save.stageProgress, [lab]: 1 },
          achievements: state.save.achievements.includes(achievement)
            ? state.save.achievements
            : [...state.save.achievements, achievement],
        },
      }
    }
    case 'RECORD_CV_STAGE':
      if (state.currentLab !== 'cv') return state
      return {
        ...state,
        hasStoredSave: true,
        save: {
          ...state.save,
          stageProgress: {
            ...state.save.stageProgress,
            cv: Math.max(state.save.stageProgress.cv, action.stage),
          },
        },
      }
    case 'COMPLETE_CV_LAB': {
      if (state.currentLab !== 'cv') return state
      const achievement = 'MACHINES_FIRST_SIGHT'
      return {
        ...state,
        hasStoredSave: true,
        save: {
          ...state.save,
          completedLabs: { ...state.save.completedLabs, cv: true },
          stageProgress: { ...state.save.stageProgress, cv: 4 },
          achievements: state.save.achievements.includes(achievement)
            ? state.save.achievements
            : [...state.save.achievements, achievement],
        },
      }
    }
    case 'FINISH_CV_LAB':
      return state.currentLab === 'cv' ? { ...state, screen: 'LAB_COMPLETE' } : state
    case 'ACKNOWLEDGE_LAB_COMPLETE':
      return {
        ...state,
        screen: 'HUB',
        currentLab: null,
        hubSpawn: state.currentLab ? `hub-from-${state.currentLab}` : state.hubSpawn,
      }
    case 'OPEN_RESEARCH':
      return allLabsComplete(state.save)
        ? { ...state, screen: 'ENDING', currentLab: null, hubSpawn: 'hub-from-research' }
        : { ...state, screen: 'DIALOGUE', dialogueKey: 'research-locked', hubSpawn: 'hub-from-research' }
    case 'TOGGLE_AUDIO':
      return { ...state, save: { ...state.save, audioEnabled: !state.save.audioEnabled } }
    default:
      return state
  }
}

export { allLabsComplete }
