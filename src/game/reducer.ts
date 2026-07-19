import { emptySave } from './storage'
import type { GameAction, GameState, HubSpawnId, SaveData, WorldMapId, WorldSpawnId } from './types'
import { atmosphereAfterLabCompletion, unlockedAtmospheresForLabs } from '../world/atmosphere/atmospherePresets'

export function createInitialState(stored: SaveData | null): GameState {
  return {
    screen: 'TITLE',
    save: stored ?? emptySave(),
    currentLab: null,
    dialogueKey: null,
    hasStoredSave: Boolean(stored?.introCompleted && stored.playerName),
    hubSpawn: 'hub-default',
    historySpawn: 'history-events-from-hub',
    peopleSpawn: 'people-from-events',
    researchSpawn: 'research-from-hub',
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

function withAtmosphereProgress(save: SaveData, completedLabs: SaveData['completedLabs'], completedLab: keyof SaveData['completedLabs']): Pick<SaveData, 'completedLabs' | 'unlockedAtmospheres' | 'atmosphereMode'> {
  const unlockedAtmospheres = unlockedAtmospheresForLabs(completedLabs)
  const atmosphereMode = save.completedLabs[completedLab]
    ? save.atmosphereMode
    : atmosphereAfterLabCompletion(save.atmosphereMode, save.completedLabs, completedLab)
  return { completedLabs, unlockedAtmospheres, atmosphereMode }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return {
        ...createInitialState(null),
        screen: 'INTRO',
        save: emptySave(state.save.audioEnabled, state.save.language),
      }
    case 'CONTINUE_GAME':
      if (!state.hasStoredSave) return state
      if (state.save.worldProgress.lastMap === 'history') {
        return {
          ...state,
          screen: 'HISTORY_MAP',
          currentLab: null,
          dialogueKey: null,
          historySpawn: state.save.worldProgress.lastSpawn === 'history-events-from-people'
            ? 'history-events-from-people'
            : 'history-events-from-hub',
        }
      }
      if (state.save.worldProgress.lastMap === 'people') {
        return {
          ...state,
          screen: 'PEOPLE_MAP',
          currentLab: null,
          dialogueKey: null,
          peopleSpawn: 'people-from-events',
        }
      }
      if (allLabsComplete(state.save) && state.save.worldProgress.lastMap === 'research') {
        const researchSpawn = state.save.worldProgress.lastSpawn === 'research-from-ending'
          ? 'research-from-ending'
          : 'research-from-hub'
        return {
          ...state,
          screen: 'RESEARCH_MAP',
          currentLab: null,
          dialogueKey: null,
          researchSpawn,
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
      const completedLabs = { ...state.save.completedLabs, [lab]: true }
      return {
        ...state,
        screen: 'LAB_COMPLETE',
        save: {
          ...state.save,
          ...withAtmosphereProgress(state.save, completedLabs, lab),
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
          ...withAtmosphereProgress(state.save, completedLabs, 'cv'),
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
          ...withAtmosphereProgress(state.save, completedLabs, 'ml'),
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
          ...withAtmosphereProgress(state.save, completedLabs, 'nlp'),
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
      const completedLabs = { ...state.save.completedLabs, dl: true }
      return {
        ...state,
        hasStoredSave: true,
        save: {
          ...state.save,
          ...withAtmosphereProgress(state.save, completedLabs, 'dl'),
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
    case 'ENTER_HISTORY_ROUTE':
      if (state.screen !== 'HUB') return state
      return {
        ...state,
        screen: 'HISTORY_MAP',
        currentLab: null,
        dialogueKey: null,
        historySpawn: 'history-events-from-hub',
        save: atWorldLocation(state.save, 'history', 'history-events-from-hub', { hallVisited: true }),
      }
    case 'ENTER_PEOPLE_GALLERY':
      if (state.screen !== 'HISTORY_MAP') return state
      return {
        ...state,
        screen: 'PEOPLE_MAP',
        currentLab: null,
        dialogueKey: null,
        peopleSpawn: 'people-from-events',
        save: atWorldLocation(state.save, 'people', 'people-from-events', { hallVisited: true }),
      }
    case 'RETURN_TO_HISTORY_EVENTS':
      if (state.screen !== 'PEOPLE_MAP') return state
      return {
        ...state,
        screen: 'HISTORY_MAP',
        currentLab: null,
        dialogueKey: null,
        historySpawn: 'history-events-from-people',
        save: atWorldLocation(state.save, 'history', 'history-events-from-people', { hallVisited: true }),
      }
    case 'ENTER_RESEARCH_ROUTE':
      if (!allLabsComplete(state.save) || state.screen !== 'HUB') return state
      return {
        ...state,
        screen: 'RESEARCH_MAP',
        currentLab: null,
        dialogueKey: null,
        researchSpawn: 'research-from-hub',
        save: atWorldLocation(state.save, 'research', 'research-from-hub', { researchVisited: true }),
      }
    case 'RETURN_TO_HUB_FROM_HISTORY':
      if (state.screen !== 'HISTORY_MAP') return state
      return {
        ...state,
        screen: 'HUB',
        currentLab: null,
        dialogueKey: null,
        hubSpawn: 'hub-from-history',
        save: atWorldLocation(state.save, 'hub', 'hub-from-history'),
      }
    case 'RETURN_TO_HUB_FROM_RESEARCH':
      if (state.screen !== 'RESEARCH_MAP') return state
      return {
        ...state,
        screen: 'HUB',
        currentLab: null,
        dialogueKey: null,
        hubSpawn: 'hub-from-research',
        save: atWorldLocation(state.save, 'hub', 'hub-from-research'),
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
    case 'START_ENDING':
      if (
        state.screen !== 'RESEARCH_MAP'
        || !allLabsComplete(state.save)
        || !state.save.worldProgress.finalGateReached
      ) return state
      return {
        ...state,
        screen: 'ENDING',
        currentLab: null,
        dialogueKey: null,
        save: atWorldLocation(state.save, 'research', 'research-from-ending', {
          researchVisited: true,
          finalGateReached: true,
        }),
      }
    case 'COMPLETE_ENDING':
      if (state.screen !== 'ENDING' || state.save.endingCompleted) return state
      return {
        ...state,
        hasStoredSave: true,
        save: {
          ...atWorldLocation(state.save, 'research', 'research-from-ending', {
            researchVisited: true,
            finalGateReached: true,
          }),
          endingCompleted: true,
        },
      }
    case 'CONTINUE_EXPLORING':
      if (state.screen !== 'ENDING') return state
      return {
        ...state,
        screen: 'RESEARCH_MAP',
        currentLab: null,
        dialogueKey: null,
        hasStoredSave: true,
        researchSpawn: 'research-from-ending',
        save: {
          ...atWorldLocation(state.save, 'research', 'research-from-ending', {
            researchVisited: true,
            finalGateReached: true,
          }),
          endingCompleted: true,
        },
      }
    case 'END_ENDING_TO_TITLE':
      if (state.screen !== 'ENDING') return state
      return {
        ...state,
        screen: 'TITLE',
        currentLab: null,
        dialogueKey: null,
        hasStoredSave: true,
        researchSpawn: 'research-from-ending',
        save: {
          ...atWorldLocation(state.save, 'research', 'research-from-ending', {
            researchVisited: true,
            finalGateReached: true,
          }),
          endingCompleted: true,
        },
      }
    case 'TOGGLE_AUDIO':
      return { ...state, save: { ...state.save, audioEnabled: !state.save.audioEnabled } }
    case 'SET_LANGUAGE':
      return { ...state, save: { ...state.save, language: action.language } }
    case 'SET_ATMOSPHERE_MODE':
      if (action.mode === 'sandstorm' || !state.save.unlockedAtmospheres.includes(action.mode)) return state
      return { ...state, save: { ...state.save, atmosphereMode: action.mode } }
    case 'SET_PARTICLE_QUALITY':
      return { ...state, save: { ...state.save, particleQuality: action.quality } }
    case 'MARK_RESEARCH_SANDSTORM_SEEN':
      if (state.save.hasSeenResearchSandstorm) return state
      return { ...state, save: { ...state.save, hasSeenResearchSandstorm: true } }
    case 'ACKNOWLEDGE_ATMOSPHERE_TERMINAL':
      if (!state.save.completedLabs.dl || state.save.hasUsedAtmosphereTerminal) return state
      return { ...state, save: { ...state.save, hasUsedAtmosphereTerminal: true } }
    default:
      return state
  }
}

export { allLabsComplete, foundationsComplete }
