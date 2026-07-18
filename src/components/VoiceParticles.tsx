import type { VoiceExpression } from '../hooks/useVoiceExpression'

export function VoiceParticles({ expression, className = '' }: { expression: VoiceExpression | null; className?: string }) {
  if (!expression) return null
  return (
    <span key={expression.id} className={`voice-note-bubble ${className}`.trim()} aria-label={`Voice note ${expression.note}`}>
      <i>♪</i><i>♫</i><i>♪</i><b>{expression.note}</b>
    </span>
  )
}
