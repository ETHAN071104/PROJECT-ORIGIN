import type { Direction, HubSpawnId, LabId, Point } from '../game/types'
import type { MovementBounds } from '../game/movement'

export const HUD_HEIGHT = 65
export const MAP_HEIGHT = 475

export interface SpawnPoint {
  position: Point
  direction: Direction
}

export interface HubTarget {
  id: LabId | 'dl' | 'east-gate'
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
  'hub-from-east-gate': { position: { x: 826, y: 294 }, direction: 'left' },
}

export const RESEARCH_BOUNDS: MovementBounds = { minX: 70, maxX: 890, minY: 204, maxY: 424 }
export const RESEARCH_SPAWN: SpawnPoint = { position: { x: 112, y: 338 }, direction: 'right' }
export const RESEARCH_DOOR = { position: { x: 590, y: 295 }, interactionRadius: 64 }
export const RESEARCH_WEST_TRANSITION_X = 78

export const LAB_BOUNDS: MovementBounds = { minX: 192, maxX: 768, minY: 166, maxY: 394 }
export const LAB_SPAWN: SpawnPoint = { position: { x: 480, y: 370 }, direction: 'up' }
export const LAB_CONSOLE_Y = 228
export const LAB_EXIT_Y = 352

export function hubSpawnForLab(lab: LabId): HubSpawnId {
  return `hub-from-${lab}`
}
