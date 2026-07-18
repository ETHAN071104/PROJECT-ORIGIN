import { describe, expect, it } from 'vitest'
import { selectActiveInteractable, type InteractionCandidate } from './interactions'

const candidates: InteractionCandidate[] = [
  { id: 'far', actionLabel: 'Read Archive', type: 'history', priority: 50, position: { x: 20, y: 0 }, interactionRadius: 30 },
  { id: 'near-low', actionLabel: 'Inspect Display', type: 'person', priority: 20, position: { x: 10, y: 0 }, interactionRadius: 30 },
  { id: 'near-high', actionLabel: 'Use Terminal', type: 'terminal', priority: 80, position: { x: 10, y: 0 }, interactionRadius: 30 },
]

describe('contextual interaction selection', () => {
  it('returns no active interaction in empty space', () => {
    expect(selectActiveInteractable({ x: 100, y: 100 }, candidates)).toBeNull()
  })

  it('chooses the closest target and deterministically breaks distance ties by priority', () => {
    expect(selectActiveInteractable({ x: 0, y: 0 }, candidates)?.id).toBe('near-high')
    expect(selectActiveInteractable({ x: 19, y: 0 }, candidates)?.id).toBe('far')
  })
})
