export type LabId = 'cv' | 'ml' | 'nlp'
export type HubSpawnId = 'hub-default' | 'hub-from-cv' | 'hub-from-ml' | 'hub-from-nlp' | 'hub-from-research'

export type GameScreen =
  | 'TITLE'
  | 'INTRO'
  | 'NAME_ENTRY'
  | 'HUB'
  | 'LAB_INTERIOR'
  | 'DIALOGUE'
  | 'MINIGAME'
  | 'LAB_COMPLETE'
  | 'ENDING'

export interface LabFlags {
  cv: boolean
  ml: boolean
  nlp: boolean
}

export interface LabProgress {
  cv: number
  ml: number
  nlp: number
}

export interface SaveData {
  playerName: string
  introCompleted: boolean
  completedLabs: LabFlags
  stageProgress: LabProgress
  achievements: string[]
  audioEnabled: boolean
}

export interface GameState {
  screen: GameScreen
  save: SaveData
  currentLab: LabId | null
  dialogueKey: string | null
  hasStoredSave: boolean
  hubSpawn: HubSpawnId
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
  | { type: 'ACKNOWLEDGE_LAB_COMPLETE' }
  | { type: 'OPEN_RESEARCH' }
  | { type: 'TOGGLE_AUDIO' }

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
