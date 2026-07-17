import type { Direction, HubSpawnId, LabId, Point } from '../game/types'
import type { MovementBounds } from '../game/movement'

export const HUD_HEIGHT = 65
export const MAP_HEIGHT = 475

export interface SpawnPoint {
  position: Point
  direction: Direction
}

export interface HubDoor {
  id: LabId | 'research'
  position: Point
  interactionRadius: number
}

export const HUB_BOUNDS: MovementBounds = { minX: 77, maxX: 883, minY: 109, maxY: 413 }

export const HUB_DOORS: HubDoor[] = [
  { id: 'cv', position: { x: 173, y: 166 }, interactionRadius: 52 },
  { id: 'ml', position: { x: 480, y: 119 }, interactionRadius: 52 },
  { id: 'nlp', position: { x: 787, y: 166 }, interactionRadius: 52 },
  { id: 'research', position: { x: 480, y: 295 }, interactionRadius: 52 },
]

export const HUB_SPAWNS: Record<HubSpawnId, SpawnPoint> = {
  'hub-default': { position: { x: 480, y: 399 }, direction: 'up' },
  'hub-from-cv': { position: { x: 173, y: 225 }, direction: 'down' },
  'hub-from-ml': { position: { x: 480, y: 178 }, direction: 'down' },
  'hub-from-nlp': { position: { x: 787, y: 225 }, direction: 'down' },
  'hub-from-research': { position: { x: 480, y: 354 }, direction: 'down' },
}

export const LAB_BOUNDS: MovementBounds = { minX: 192, maxX: 768, minY: 166, maxY: 394 }
export const LAB_SPAWN: SpawnPoint = { position: { x: 480, y: 370 }, direction: 'up' }
export const LAB_CONSOLE_Y = 228
export const LAB_EXIT_Y = 352

export function hubSpawnForLab(lab: LabId): HubSpawnId {
  return `hub-from-${lab}`
}
