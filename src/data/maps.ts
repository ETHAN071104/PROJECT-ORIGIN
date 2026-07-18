import type { Direction, HistorySpawnId, HubSpawnId, LabId, Point, ResearchSpawnId } from '../game/types'
import type { MovementBounds } from '../game/movement'

export const HUD_HEIGHT = 65
export const MAP_HEIGHT = 475

export interface SpawnPoint {
  position: Point
  direction: Direction
}

export interface HubTarget {
  id: LabId | 'east-gate'
  position: Point
  interactionRadius: number
}

export const HUB_BOUNDS: MovementBounds = { minX: 68, maxX: 892, minY: 105, maxY: 423 }

export const HUB_TARGETS: HubTarget[] = [
  { id: 'cv', position: { x: 202, y: 157 }, interactionRadius: 52 },
  { id: 'ml', position: { x: 468, y: 139 }, interactionRadius: 52 },
  { id: 'nlp', position: { x: 742, y: 171 }, interactionRadius: 52 },
  { id: 'dl', position: { x: 223, y: 377 }, interactionRadius: 50 },
  { id: 'east-gate', position: { x: 872, y: 294 }, interactionRadius: 70 },
]

export const HUB_EAST_TRANSITION_X = 884

export const HUB_SPAWNS: Record<HubSpawnId, SpawnPoint> = {
  'hub-default': { position: { x: 488, y: 401 }, direction: 'up' },
  'hub-from-cv': { position: { x: 202, y: 216 }, direction: 'down' },
  'hub-from-ml': { position: { x: 468, y: 198 }, direction: 'down' },
  'hub-from-nlp': { position: { x: 742, y: 230 }, direction: 'down' },
  'hub-from-dl': { position: { x: 223, y: 420 }, direction: 'down' },
  'hub-from-east-gate': { position: { x: 826, y: 294 }, direction: 'left' },
  'hub-from-history': { position: { x: 826, y: 294 }, direction: 'left' },
}

export const HISTORY_BOUNDS: MovementBounds = { minX: 68, maxX: 892, minY: 150, maxY: 422 }
export const HISTORY_SPAWNS: Record<HistorySpawnId, SpawnPoint> = {
  'history-from-academy': { position: { x: 185, y: 350 }, direction: 'right' },
  'history-from-research': { position: { x: 730, y: 350 }, direction: 'left' },
}
export const HISTORY_WEST_TRANSITION_X = 76
export const HISTORY_EAST_TRANSITION_X = 884

export const RESEARCH_BOUNDS: MovementBounds = { minX: 68, maxX: 892, minY: 248, maxY: 424 }
export const RESEARCH_SPAWNS: Record<ResearchSpawnId, SpawnPoint> = {
  'research-from-history': { position: { x: 185, y: 350 }, direction: 'right' },
}
export const RESEARCH_FUTURE_DOORS = [
  { id: 'reinforcement-learning', position: { x: 260, y: 324 }, interactionRadius: 65 },
  { id: 'generative-ai', position: { x: 448, y: 324 }, interactionRadius: 65 },
  { id: 'agent-intelligence', position: { x: 626, y: 324 }, interactionRadius: 65 },
] as const
export const RESEARCH_FINAL_GATE = { position: { x: 838, y: 324 }, interactionRadius: 70 }
export const RESEARCH_WEST_TRANSITION_X = 78

export const LAB_BOUNDS: MovementBounds = { minX: 192, maxX: 768, minY: 166, maxY: 394 }
export const LAB_SPAWN: SpawnPoint = { position: { x: 480, y: 370 }, direction: 'up' }
export const LAB_CONSOLE_Y = 228
export const LAB_EXIT_Y = 352
export const LAB_CONSOLE_TARGET = { position: { x: 480, y: 212 }, interactionRadius: 76 }
export const LAB_EXHIBIT_TARGETS = {
  left: { position: { x: 260, y: 270 }, interactionRadius: 64 },
  right: { position: { x: 700, y: 270 }, interactionRadius: 64 },
} as const

export function hubSpawnForLab(lab: LabId): HubSpawnId {
  return `hub-from-${lab}`
}
