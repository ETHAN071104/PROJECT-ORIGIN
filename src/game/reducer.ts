import { emptySave } from './storage'
import type { GameAction, GameState, HubSpawnId, SaveData, WorldMapId, WorldSpawnId } from './types'

export function createInitialState(stored: SaveData | null): GameState {
  return {
    screen: 'TITLE',
    save: stored ?? emptySave(),
    currentLab: null,
    dialogueKey: null,
    hasStoredSave: Boolean(stored?.introCompleted && stored.playerName),
    hubSpawn: 'hub-default',
    historySpawn: 'history-from-academy',
    researchSpawn: 'research-from-history',
  }
}

const foundationsComplete = (save: SaveData) =>
  save.completedLabs.cv && save.completedLabs.ml && save.completedLabs.nlp

const allLabsComplete = (save: SaveData) =>
  foundationsComplete(save) && save.completedLabs.dl

function atWorldLocation(save: SaveData, lastMap: WorldMapId, lastSpawn: WorldSpawnId, updates: Partial<SaveData['worldProgress']> = {}): SaveData {
  return {
    ...save,
    worldProgress: { ...save.worldProgress, ...updates, lastMap, lastSpawn },
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return {
        ...createInitialState(null),
        screen: 'INTRO',
        save: emptySave(state.save.audioEnabled),
      }
    case 'CONTINUE_GAME':
      if (!state.hasStoredSave) return state
      if (allLabsComplete(state.save) && state.save.worldProgress.lastMap === 'history') {
        return {
          ...state,
          screen: 'HISTORY_MAP',
          currentLab: null,
          dialogueKey: null,
          historySpawn: state.save.worldProgress.lastSpawn === 'history-from-research'
            ? 'history-from-research'
            : 'history-from-academy',
        }
      }
      if (allLabsComplete(state.save) && state.save.worldProgress.lastMap === 'research') {
        return {
          ...state,
          screen: 'RESEARCH_MAP',
          currentLab: null,
          dialogueKey: null,
          researchSpawn: 'research-from-history',
        }
      }
      return {
        ...state,
        screen: 'HUB',
        currentLab: null,
        dialogueKey: null,
        hubSpawn: state.save.worldProgress.lastSpawn.startsWith('hub-')
          ? state.save.worldProgress.lastSpawn as HubSpawnId
          : 'hub-default',
      }
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
      if (action.lab === 'dl' && !foundationsComplete(state.save)) return state
      return {
        ...state,
        screen: 'LAB_INTERIOR',
        currentLab: action.lab,
        save: atWorldLocation(state.save, 'hub', state.hubSpawn),
      }
    case 'LEAVE_LAB':
      return {
        ...state,
        screen: 'HUB',
        currentLab: null,
        dialogueKey: null,
        hubSpawn: state.currentLab ? `hub-from-${state.currentLab}` : state.hubSpawn,
        save: atWorldLocation(
          state.save,
          'hub',
          state.currentLab ? `hub-from-${state.currentLab}` : state.hubSpawn,
        ),
      }
    case 'START_DIALOGUE':
      return { ...state, screen: 'DIALOGUE', dialogueKey: action.key }
    case 'DIALOGUE_COMPLETE':
      if (state.dialogueKey === 'research-locked' || state.dialogueKey === 'research-powered') {
        return { ...state, screen: 'RESEARCH_MAP', dialogueKey: null }
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
      const completedLabs = { ...state.save.completedLabs, cv: true }
      const achievements = state.save.achievements.includes(achievement)
        ? [...state.save.achievements]
        : [...state.save.achievements, achievement]
      if (completedLabs.cv && completedLabs.ml && completedLabs.nlp && !achievements.includes('AI_AWAKENED')) {
        achievements.push('AI_AWAKENED')
      }
      return {
        ...state,
        hasStoredSave: true,
        save: {
          ...state.save,
          completedLabs,
          stageProgress: { ...state.save.stageProgress, cv: 4 },
          achievements,
        },
      }
    }
    case 'FINISH_CV_LAB':
      return state.currentLab === 'cv' ? { ...state, screen: 'LAB_COMPLETE' } : state
    case 'RECORD_ML_STAGE':
      if (state.currentLab !== 'ml') return state
      return {
        ...state,
        hasStoredSave: true,
        save: {
          ...state.save,
          stageProgress: {
            ...state.save.stageProgress,
            ml: Math.max(state.save.stageProgress.ml, action.stage),
          },
        },
      }
    case 'COMPLETE_ML_LAB': {
      if (state.currentLab !== 'ml') return state
      const achievement = 'PATTERN_FINDER'
      const completedLabs = { ...state.save.completedLabs, ml: true }
      const achievements = state.save.achievements.includes(achievement)
        ? [...state.save.achievements]
        : [...state.save.achievements, achievement]
      if (completedLabs.cv && completedLabs.ml && completedLabs.nlp && !achievements.includes('AI_AWAKENED')) {
        achievements.push('AI_AWAKENED')
      }
      return {
        ...state,
        hasStoredSave: true,
        save: {
          ...state.save,
          completedLabs,
          stageProgress: { ...state.save.stageProgress, ml: 4 },
          achievements,
        },
      }
    }
    case 'FINISH_ML_LAB':
      return state.currentLab === 'ml' ? { ...state, screen: 'LAB_COMPLETE' } : state
    case 'RECORD_NLP_STAGE':
      if (state.currentLab !== 'nlp') return state
      return {
        ...state,
        hasStoredSave: true,
        save: {
          ...state.save,
          stageProgress: {
            ...state.save.stageProgress,
            nlp: Math.max(state.save.stageProgress.nlp, action.stage),
          },
        },
      }
    case 'COMPLETE_NLP_LAB': {
      if (state.currentLab !== 'nlp') return state
      const completedLabs = { ...state.save.completedLabs, nlp: true }
      const achievements = state.save.achievements.includes('LANGUAGE_DECODER')
        ? [...state.save.achievements]
        : [...state.save.achievements, 'LANGUAGE_DECODER']
      if (completedLabs.cv && completedLabs.ml && completedLabs.nlp && !achievements.includes('AI_AWAKENED')) {
        achievements.push('AI_AWAKENED')
      }
      return {
        ...state,
        hasStoredSave: true,
        save: {
          ...state.save,
          completedLabs,
          stageProgress: { ...state.save.stageProgress, nlp: 4 },
          achievements,
        },
      }
    }
    case 'FINISH_NLP_LAB':
      return state.currentLab === 'nlp' ? { ...state, screen: 'LAB_COMPLETE' } : state
    case 'RECORD_DL_STAGE':
      if (state.currentLab !== 'dl' || !foundationsComplete(state.save)) return state
      return {
        ...state,
        hasStoredSave: true,
        save: {
          ...state.save,
          stageProgress: {
            ...state.save.stageProgress,
            dl: Math.max(state.save.stageProgress.dl, action.stage),
          },
        },
      }
    case 'COMPLETE_DL_LAB': {
      if (state.currentLab !== 'dl' || !foundationsComplete(state.save)) return state
      const achievements = state.save.achievements.includes('NEURAL_CORE_ONLINE')
        ? [...state.save.achievements]
        : [...state.save.achievements, 'NEURAL_CORE_ONLINE']
      return {
        ...state,
        hasStoredSave: true,
        save: {
          ...state.save,
          completedLabs: { ...state.save.completedLabs, dl: true },
          stageProgress: { ...state.save.stageProgress, dl: 4 },
          achievements,
        },
      }
    }
    case 'FINISH_DL_LAB':
      return state.currentLab === 'dl' && state.save.completedLabs.dl
        ? { ...state, screen: 'LAB_COMPLETE' }
        : state
    case 'ACKNOWLEDGE_LAB_COMPLETE':
      return {
        ...state,
        screen: 'HUB',
        currentLab: null,
        hubSpawn: state.currentLab ? `hub-from-${state.currentLab}` : state.hubSpawn,
        save: atWorldLocation(
          state.save,
          'hub',
          state.currentLab ? `hub-from-${state.currentLab}` : state.hubSpawn,
        ),
      }
    case 'ENTER_RESEARCH_ROUTE':
      if (!allLabsComplete(state.save)) return state
      return {
        ...state,
        screen: 'HISTORY_MAP',
        currentLab: null,
        dialogueKey: null,
        historySpawn: 'history-from-academy',
        save: atWorldLocation(state.save, 'history', 'history-from-academy', { hallVisited: true }),
      }
    case 'ENTER_RESEARCH_COMPLEX':
      if (!allLabsComplete(state.save) || state.screen !== 'HISTORY_MAP') return state
      return {
        ...state,
        screen: 'RESEARCH_MAP',
        currentLab: null,
        dialogueKey: null,
        researchSpawn: 'research-from-history',
        save: atWorldLocation(state.save, 'research', 'research-from-history', { researchVisited: true }),
      }
    case 'RETURN_TO_HISTORY':
      if (!allLabsComplete(state.save) || state.screen !== 'RESEARCH_MAP') return state
      return {
        ...state,
        screen: 'HISTORY_MAP',
        currentLab: null,
        dialogueKey: null,
        historySpawn: 'history-from-research',
        save: atWorldLocation(state.save, 'history', 'history-from-research', { hallVisited: true }),
      }
    case 'RETURN_TO_HUB':
      return {
        ...state,
        screen: 'HUB',
        currentLab: null,
        dialogueKey: null,
        hubSpawn: 'hub-from-history',
        save: atWorldLocation(state.save, 'hub', 'hub-from-history'),
      }
    case 'RETURN_TO_TITLE':
      return {
        ...state,
        screen: 'TITLE',
        currentLab: null,
        dialogueKey: null,
        hubSpawn: 'hub-default',
      }
    case 'OPEN_RESEARCH':
      if (state.screen !== 'RESEARCH_MAP' || !allLabsComplete(state.save)) return state
      return {
        ...state,
        screen: 'DIALOGUE',
        currentLab: null,
        dialogueKey: allLabsComplete(state.save) ? 'research-powered' : 'research-locked',
      }
    case 'READ_HISTORY_ENTRY': {
      if (state.save.worldProgress.readExhibitIds.includes(action.id)) return state
      return {
        ...state,
        save: {
          ...state.save,
          worldProgress: {
            ...state.save.worldProgress,
            readExhibitIds: [...state.save.worldProgress.readExhibitIds, action.id],
          },
        },
      }
    }
    case 'REACH_FINAL_GATE':
      if (state.screen !== 'RESEARCH_MAP' || !allLabsComplete(state.save)) return state
      return {
        ...state,
        save: {
          ...state.save,
          worldProgress: { ...state.save.worldProgress, finalGateReached: true },
        },
      }
    case 'TOGGLE_AUDIO':
      return { ...state, save: { ...state.save, audioEnabled: !state.save.audioEnabled } }
    default:
      return state
  }
}

export { allLabsComplete, foundationsComplete }
