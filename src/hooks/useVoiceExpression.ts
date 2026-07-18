import { useCallback, useEffect, useRef, useState } from 'react'
import { playVoiceNote } from '../audio/audio'

export const VOICE_NOTES = [
  { name: 'do', frequency: 293.66 },
  { name: 're', frequency: 329.63 },
  { name: 'mi', frequency: 349.23 },
  { name: 'fa', frequency: 392 },
  { name: 'so', frequency: 440 },
] as const

export interface VoiceExpression {
  id: number
  note: string
}

export function chooseVoiceNote(randomValue = Math.random()) {
  const safeValue = Math.max(0, Math.min(0.999999, randomValue))
  return VOICE_NOTES[Math.floor(safeValue * VOICE_NOTES.length)]
}

export function useVoiceExpression(enabled: boolean, audioEnabled: boolean) {
  const [expression, setExpression] = useState<VoiceExpression | null>(null)
  const expressionId = useRef(0)
  const clearTimer = useRef<number | null>(null)

  const express = useCallback(() => {
    if (!enabled) return
    const next = chooseVoiceNote()
    expressionId.current += 1
    playVoiceNote(audioEnabled, next.frequency)
    setExpression({ id: expressionId.current, note: next.name })
    if (clearTimer.current !== null) window.clearTimeout(clearTimer.current)
    clearTimer.current = window.setTimeout(() => setExpression(null), 900)
  }, [audioEnabled, enabled])

  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'KeyF') return
      event.preventDefault()
      if (!event.repeat) express()
    }
    window.addEventListener('keydown', onKeyDown, { passive: false })
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, express])

  useEffect(() => () => {
    if (clearTimer.current !== null) window.clearTimeout(clearTimer.current)
  }, [])

  return { expression, express }
}
