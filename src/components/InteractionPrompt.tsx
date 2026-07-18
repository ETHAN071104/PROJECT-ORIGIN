import type { ActiveInteractable } from '../game/interactions'

export function InteractionPrompt({ active, className = '' }: { active: ActiveInteractable | null; className?: string }) {
  if (!active) return null
  return <div className={`interaction-prompt ${className}`.trim()}><span>E</span>{active.actionLabel}</div>
}
