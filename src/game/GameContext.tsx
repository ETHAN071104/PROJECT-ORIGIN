import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react'
import { gameReducer, createInitialState } from './reducer'
import { emptySave, loadSave, persistSave } from './storage'
import type { GameAction, GameState, SaveData } from './types'
import { useDomTranslation } from '../hooks/useDomTranslation'

interface GameContextValue {
  state: GameState
  dispatch: Dispatch<GameAction>
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const qaPreview = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('qa') : null
  const [state, dispatch] = useReducer(gameReducer, undefined, () => {
    if (!qaPreview) return createInitialState(loadSave())
    const save: SaveData = {
      ...emptySave(false),
      playerName: 'ORI',
      introCompleted: true,
      completedLabs: { cv: true, ml: true, nlp: true, dl: true },
      stageProgress: { cv: 4, ml: 4, nlp: 4, dl: 4 },
      achievements: ['MACHINES_FIRST_SIGHT', 'PATTERN_FINDER', 'LANGUAGE_DECODER', 'NEURAL_CORE_ONLINE'],
      atmosphereMode: 'day' as const,
      unlockedAtmospheres: ['day', 'dusk', 'night'],
      hasSeenResearchSandstorm: true,
      worldProgress: {
        ...emptySave().worldProgress,
        researchVisited: true,
        finalGateReached: true,
        lastMap: 'research' as const,
        lastSpawn: 'research-from-ending' as const,
      },
    }
    if (qaPreview === 'research') return { ...createInitialState({ ...save, hasSeenResearchSandstorm: false }), screen: 'RESEARCH_MAP' as const, hasStoredSave: true, researchSpawn: 'research-from-hub' as const }
    if (qaPreview === 'hub') return { ...createInitialState({ ...save, worldProgress: { ...save.worldProgress, researchVisited: false, lastMap: 'hub' as const, lastSpawn: 'hub-default' as const } }), screen: 'HUB' as const, hasStoredSave: true }
    if (qaPreview === 'history') return { ...createInitialState({ ...save, worldProgress: { ...save.worldProgress, lastMap: 'history' as const, lastSpawn: 'history-events-from-hub' as const } }), screen: 'HISTORY_MAP' as const, historySpawn: 'history-events-from-hub' as const, hasStoredSave: true }
    if (qaPreview === 'cv2' || qaPreview === 'cv4') {
      const cvProgress = qaPreview === 'cv2' ? 1 : 3
      const cvSave = { ...save, completedLabs: { cv: false, ml: false, nlp: false, dl: false }, stageProgress: { cv: cvProgress, ml: 0, nlp: 0, dl: 0 } }
      return { ...createInitialState(cvSave), screen: 'MINIGAME' as const, currentLab: 'cv' as const, hasStoredSave: true }
    }
    return { ...createInitialState(save), screen: 'ENDING' as const, hasStoredSave: true, researchSpawn: 'research-from-ending' as const }
  })
  useDomTranslation(state.save.language)

  useEffect(() => {
    if (qaPreview) return
    persistSave(state.save)
  }, [qaPreview, state.save])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used inside GameProvider')
  return context
}
