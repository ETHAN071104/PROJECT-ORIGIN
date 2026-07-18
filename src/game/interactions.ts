import type { Point } from './types'

export type InteractableType = 'lab' | 'terminal' | 'history' | 'person' | 'research-door' | 'gate' | 'transition'

export interface InteractionCandidate {
  id: string
  actionLabel: string
  type: InteractableType
  priority: number
  position: Point
  interactionRadius: number
}

export interface ActiveInteractable {
  id: string
  actionLabel: string
  type: InteractableType
  priority: number
  distance: number
}

export function selectActiveInteractable(
  player: Point,
  candidates: readonly InteractionCandidate[],
): ActiveInteractable | null {
  const active = candidates
    .map((candidate) => ({
      ...candidate,
      distance: Math.hypot(player.x - candidate.position.x, player.y - candidate.position.y),
    }))
    .filter((candidate) => candidate.distance <= candidate.interactionRadius)
    .sort((a, b) => a.distance - b.distance || b.priority - a.priority || a.id.localeCompare(b.id))[0]

  if (!active) return null
  const { id, actionLabel, type, priority, distance } = active
  return { id, actionLabel, type, priority, distance }
}

export function sameActiveInteractable(a: ActiveInteractable | null, b: ActiveInteractable | null) {
  return a?.id === b?.id && a?.actionLabel === b?.actionLabel
}
