import { scheduleInstrument, type ScheduledMusicSource } from './instruments'
import { activeThemeEvents, themeLoopSeconds } from './musicThemes'
import type { MusicProgression, MusicTheme } from './audioTypes'

export interface ThemeSequencer {
  loopSeconds: number
  stop: () => void
}

export function startThemeSequencer(
  context: AudioContext,
  theme: MusicTheme,
  output: AudioNode,
  progression: MusicProgression,
): ThemeSequencer {
  const secondsPerBeat = 60 / theme.bpm
  const loopSeconds = themeLoopSeconds(theme)
  const events = activeThemeEvents(theme, progression)
  const sources = new Set<ScheduledMusicSource>()
  const firstCycleTime = context.currentTime + .075
  let scheduledCycles = 0
  let stopped = false

  const scheduleCycle = (cycleIndex: number) => {
    const cycleTime = firstCycleTime + cycleIndex * loopSeconds
    for (const musicEvent of events) {
      const startTime = cycleTime + musicEvent.beat * secondsPerBeat
      for (const scheduled of scheduleInstrument(context, output, musicEvent, startTime, secondsPerBeat)) {
        sources.add(scheduled)
        scheduled.source.addEventListener('ended', () => sources.delete(scheduled), { once: true })
      }
    }
  }

  const fillLookAhead = () => {
    if (stopped) return
    const horizon = context.currentTime + loopSeconds * 1.25
    while (firstCycleTime + scheduledCycles * loopSeconds <= horizon) {
      scheduleCycle(scheduledCycles)
      scheduledCycles += 1
    }
  }

  fillLookAhead()
  const timer = globalThis.setInterval(fillLookAhead, Math.max(600, loopSeconds * 400))

  return {
    loopSeconds,
    stop: () => {
      if (stopped) return
      stopped = true
      globalThis.clearInterval(timer)
      for (const scheduled of sources) scheduled.stop()
      sources.clear()
    },
  }
}
