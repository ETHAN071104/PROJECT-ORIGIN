import { describe, expect, it } from 'vitest'
import { MusicEngine } from './MusicEngine'

function fakeAudioEnvironment() {
  let contextCreations = 0
  let sequencerStarts = 0
  let sequencerStops = 0
  const gainParam = () => ({
    value: 1,
    cancelScheduledValues() {},
    setValueAtTime(value: number) { this.value = value },
    exponentialRampToValueAtTime(value: number) { this.value = value },
    setTargetAtTime(value: number) { this.value = value },
  })
  const context = {
    state: 'running',
    currentTime: 1,
    destination: {},
    createGain: () => ({ gain: gainParam(), connect() {}, disconnect() {} }),
  } as unknown as AudioContext
  const engine = new MusicEngine(
    () => { contextCreations += 1; return context },
    async () => true,
    () => {
      sequencerStarts += 1
      return { loopSeconds: 24, stop: () => { sequencerStops += 1 } }
    },
    (callback) => { callback(); return 0 },
  )
  return {
    engine,
    counts: () => ({ contextCreations, sequencerStarts, sequencerStops }),
  }
}

describe('MusicEngine pre-gesture state', () => {
  it('records the desired theme without creating or starting audio', () => {
    const engine = new MusicEngine()
    engine.playTheme('origin-signal')
    engine.playTheme('origin-signal')
    expect(engine.getSnapshot()).toMatchObject({
      initialized: false,
      desiredTheme: 'origin-signal',
      activeTheme: null,
      contextState: 'not-created',
      volume: .35,
    })
  })

  it('keeps mute and pause safe before initialization', () => {
    const engine = new MusicEngine()
    engine.setEnabled(false)
    engine.pause()
    engine.resume()
    expect(engine.getSnapshot()).toMatchObject({ initialized: false, enabled: false, activeTheme: null })
  })

  it('creates one context, avoids duplicate tracks, crossfades, and resumes after mute', async () => {
    const { engine, counts } = fakeAudioEnvironment()
    engine.playTheme('origin-signal')
    expect(counts()).toEqual({ contextCreations: 0, sequencerStarts: 0, sequencerStops: 0 })

    await engine.initialize()
    await engine.initialize()
    expect(counts()).toEqual({ contextCreations: 1, sequencerStarts: 1, sequencerStops: 0 })

    engine.playTheme('origin-signal')
    expect(counts().sequencerStarts).toBe(1)
    engine.playTheme('academy-night')
    expect(counts()).toEqual({ contextCreations: 1, sequencerStarts: 2, sequencerStops: 1 })

    engine.setEnabled(false)
    expect(counts().sequencerStops).toBe(2)
    engine.setEnabled(true)
    expect(counts().sequencerStarts).toBe(3)
  })
})
