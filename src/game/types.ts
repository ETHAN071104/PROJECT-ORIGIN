export type LabId = 'cv' | 'ml' | 'nlp' | 'dl'
export type Language = 'en' | 'zh-CN'
export type HubSpawnId = 'hub-default' | 'hub-from-cv' | 'hub-from-ml' | 'hub-from-nlp' | 'hub-from-dl' | 'hub-from-history' | 'hub-from-research'
export type HistorySpawnId = 'history-events-from-hub' | 'history-events-from-people'
export type PeopleSpawnId = 'people-from-events'
export type ResearchSpawnId = 'research-from-hub' | 'research-from-ending'
export type WorldMapId = 'hub' | 'history' | 'people' | 'research'
export type WorldSpawnId = HubSpawnId | HistorySpawnId | PeopleSpawnId | ResearchSpawnId

export type GameScreen =
  | 'TITLE'
  | 'INTRO'
  | 'NAME_ENTRY'
  | 'HUB'
  | 'HISTORY_MAP'
  | 'PEOPLE_MAP'
  | 'RESEARCH_MAP'
  | 'LAB_INTERIOR'
  | 'DIALOGUE'
  | 'MINIGAME'
  | 'LAB_COMPLETE'
  | 'ENDING'

export interface LabFlags {
  cv: boolean
  ml: boolean
  nlp: boolean
  dl: boolean
}

export interface LabProgress {
  cv: number
  ml: number
  nlp: number
  dl: number
}

export interface WorldProgress {
  hallVisited: boolean
  researchVisited: boolean
  finalGateReached: boolean
  readExhibitIds: string[]
  lastMap: WorldMapId
  lastSpawn: WorldSpawnId
}

export interface SaveData {
  playerName: string
  introCompleted: boolean
  completedLabs: LabFlags
  stageProgress: LabProgress
  achievements: string[]
  audioEnabled: boolean
  language: Language
  endingCompleted: boolean
  worldProgress: WorldProgress
}

export interface GameState {
  screen: GameScreen
  save: SaveData
  currentLab: LabId | null
  dialogueKey: string | null
  hasStoredSave: boolean
  hubSpawn: HubSpawnId
  historySpawn: HistorySpawnId
  peopleSpawn: PeopleSpawnId
  researchSpawn: ResearchSpawnId
}

export type GameAction =
  | { type: 'NEW_GAME' }
  | { type: 'CONTINUE_GAME' }
  | { type: 'INTRO_COMPLETE' }
  | { type: 'SET_NAME'; name: string }
  | { type: 'ENTER_LAB'; lab: LabId }
  | { type: 'LEAVE_LAB' }
  | { type: 'START_DIALOGUE'; key: string }
  | { type: 'DIALOGUE_COMPLETE' }
  | { type: 'COMPLETE_STAGE' }
  | { type: 'RECORD_CV_STAGE'; stage: 1 | 2 | 3 }
  | { type: 'COMPLETE_CV_LAB' }
  | { type: 'FINISH_CV_LAB' }
  | { type: 'RECORD_ML_STAGE'; stage: 1 | 2 | 3 }
  | { type: 'COMPLETE_ML_LAB' }
  | { type: 'FINISH_ML_LAB' }
  | { type: 'RECORD_NLP_STAGE'; stage: 1 | 2 | 3 }
  | { type: 'COMPLETE_NLP_LAB' }
  | { type: 'FINISH_NLP_LAB' }
  | { type: 'RECORD_DL_STAGE'; stage: 1 | 2 | 3 }
  | { type: 'COMPLETE_DL_LAB' }
  | { type: 'FINISH_DL_LAB' }
  | { type: 'ACKNOWLEDGE_LAB_COMPLETE' }
  | { type: 'ENTER_HISTORY_ROUTE' }
  | { type: 'ENTER_PEOPLE_GALLERY' }
  | { type: 'RETURN_TO_HISTORY_EVENTS' }
  | { type: 'ENTER_RESEARCH_ROUTE' }
  | { type: 'RETURN_TO_HUB_FROM_HISTORY' }
  | { type: 'RETURN_TO_HUB_FROM_RESEARCH' }
  | { type: 'RETURN_TO_TITLE' }
  | { type: 'OPEN_RESEARCH' }
  | { type: 'READ_HISTORY_ENTRY'; id: string }
  | { type: 'REACH_FINAL_GATE' }
  | { type: 'START_ENDING' }
  | { type: 'COMPLETE_ENDING' }
  | { type: 'CONTINUE_EXPLORING' }
  | { type: 'END_ENDING_TO_TITLE' }
  | { type: 'TOGGLE_AUDIO' }
  | { type: 'SET_LANGUAGE'; language: Language }

export interface DialogueLine {
  speaker: string
  text: string
  portrait: 'mentor' | 'player' | 'system'
  choices?: string[]
}

export interface Point {
  x: number
  y: number
}

export type Direction = 'up' | 'down' | 'left' | 'right'

export interface MovementInput {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}
