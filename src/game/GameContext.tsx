import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react'
import { gameReducer, createInitialState } from './reducer'
import { emptySave, loadSave, persistSave } from './storage'
import type { GameAction, GameState } from './types'
import { useDomTranslation } from '../hooks/useDomTranslation'

interface GameContextValue {
  state: GameState
  dispatch: Dispatch<GameAction>
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const endingPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get('qa') === 'ending'
  const [state, dispatch] = useReducer(gameReducer, undefined, () => {
    if (!endingPreview) return createInitialState(loadSave())
    const save = {
      ...emptySave(false),
      playerName: 'ORI',
      introCompleted: true,
      completedLabs: { cv: true, ml: true, nlp: true, dl: true },
      stageProgress: { cv: 4, ml: 4, nlp: 4, dl: 4 },
      achievements: ['MACHINES_FIRST_SIGHT', 'PATTERN_FINDER', 'LANGUAGE_DECODER', 'NEURAL_CORE_ONLINE'],
      worldProgress: {
        ...emptySave().worldProgress,
        researchVisited: true,
        finalGateReached: true,
        lastMap: 'research' as const,
        lastSpawn: 'research-from-ending' as const,
      },
    }
    return { ...createInitialState(save), screen: 'ENDING' as const, hasStoredSave: true, researchSpawn: 'research-from-ending' as const }
  })
  useDomTranslation(state.save.language)

  useEffect(() => {
    if (endingPreview) return
    persistSave(state.save)
  }, [endingPreview, state.save])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used inside GameProvider')
  return context
}
