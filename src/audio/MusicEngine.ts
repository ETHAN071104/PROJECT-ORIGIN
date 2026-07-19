import { currentAudioContext, getAudioContext, resumeAudioContext } from './audioContext'
import { MUSIC_THEMES } from './musicThemes'
import { startThemeSequencer, type ThemeSequencer } from './sequencer'
import {
  EMPTY_MUSIC_PROGRESSION,
  type MusicEngineSnapshot,
  type MusicProgression,
  type MusicThemeId,
} from './audioTypes'
import type { AtmosphereMode } from '../game/types'
import { ATMOSPHERE_PRESETS } from '../world/atmosphere/atmospherePresets'

const DEFAULT_MUSIC_VOLUME = .35
const CROSSFADE_OUT_SECONDS = 1
const CROSSFADE_IN_SECONDS = 1.5

interface PlayingTheme {
  id: MusicThemeId
  bus: GainNode
  sequencer: ThemeSequencer
}

type AudioContextFactory = () => AudioContext | null
type AudioContextResumer = (context: AudioContext) => Promise<boolean>
type SequencerFactory = typeof startThemeSequencer
type TimeoutScheduler = (callback: () => void, milliseconds: number) => ReturnType<typeof globalThis.setTimeout>

function clampVolume(value: number) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : DEFAULT_MUSIC_VOLUME))
}

function sameProgression(left: MusicProgression, right: MusicProgression) {
  return left.cv === right.cv && left.ml === right.ml && left.nlp === right.nlp && left.dl === right.dl
}

export class MusicEngine {
  private context: AudioContext | null = null
  private musicBus: GainNode | null = null
  private atmosphereFilter: BiquadFilterNode | null = null
  private windSource: AudioBufferSourceNode | null = null
  private windGain: GainNode | null = null
  private active: PlayingTheme | null = null
  private desiredTheme: MusicThemeId | null = null
  private progression: MusicProgression = { ...EMPTY_MUSIC_PROGRESSION }
  private enabled = true
  private paused = false
  private visibilityPaused = false
  private initialized = false
  private initialization: Promise<boolean> | null = null
  private volume = DEFAULT_MUSIC_VOLUME
  private visibilityListenerAttached = false
  private atmosphereMode: AtmosphereMode = 'night'
  private ambienceActive = false

  constructor(
    private readonly contextFactory: AudioContextFactory = getAudioContext,
    private readonly contextResumer: AudioContextResumer = resumeAudioContext,
    private readonly sequencerFactory: SequencerFactory = startThemeSequencer,
    private readonly scheduleTimeout: TimeoutScheduler = (callback, milliseconds) => globalThis.setTimeout(callback, milliseconds),
  ) {}

  private readonly onVisibilityChange = () => {
    if (typeof document === 'undefined') return
    if (document.hidden) {
      this.visibilityPaused = true
      this.fadeOutActive(.08)
      if (this.context?.state === 'running') void this.context.suspend()
      return
    }
    this.visibilityPaused = false
    if (!this.context) return
    void this.contextResumer(this.context).then(() => this.reconcile())
  }

  async initialize(): Promise<boolean> {
    if (this.initialized) {
      if (this.context) await this.contextResumer(this.context)
      this.reconcile()
      return true
    }
    if (this.initialization) return this.initialization
    this.initialization = this.initializeOnce()
    const ready = await this.initialization
    if (!ready) this.initialization = null
    return ready
  }

  private async initializeOnce() {
    const context = this.contextFactory()
    if (!context) return false
    this.context = context
    const running = await this.contextResumer(context)
    if (!running) return false

    const bus = context.createGain()
    bus.gain.setValueAtTime(this.volume, context.currentTime)
    if (typeof context.createBiquadFilter === 'function') {
      const filter = context.createBiquadFilter()
      filter.type = 'lowpass'
      filter.Q.setValueAtTime(.55, context.currentTime)
      bus.connect(filter)
      filter.connect(context.destination)
      this.atmosphereFilter = filter
    } else {
      bus.connect(context.destination)
    }
    this.musicBus = bus
    this.createWindAmbience(context, bus)
    this.initialized = true
    this.applyAtmosphere()

    if (typeof document !== 'undefined' && !this.visibilityListenerAttached) {
      document.addEventListener('visibilitychange', this.onVisibilityChange)
      this.visibilityListenerAttached = true
      this.visibilityPaused = document.hidden
    }
    this.reconcile()
    return true
  }

  playTheme(theme: MusicThemeId) {
    this.desiredTheme = theme
    this.reconcile()
  }

  configureTheme(theme: MusicThemeId, progression: MusicProgression) {
    const next = { ...progression }
    const progressionChanged = !sameProgression(this.progression, next)
    this.progression = next
    this.desiredTheme = theme
    if (progressionChanged && this.active?.id === theme) this.transitionTo(theme, true)
    else this.reconcile()
  }

  stopTheme() {
    this.desiredTheme = null
    this.fadeOutActive(CROSSFADE_OUT_SECONDS)
  }

  setEnabled(enabled: boolean) {
    if (this.enabled === enabled) return
    this.enabled = enabled
    if (!enabled) this.fadeOutActive(.12)
    else this.reconcile()
    this.applyAtmosphere()
  }

  setProgression(progression: MusicProgression) {
    const next = { ...progression }
    if (sameProgression(this.progression, next)) return
    this.progression = next
    if (this.active && (this.active.id === 'academy-night' || this.active.id === 'academy-day')) {
      this.transitionTo(this.active.id, true)
    }
  }

  setMasterVolume(volume: number) {
    this.volume = clampVolume(volume)
    if (!this.context || !this.musicBus) return
    const now = this.context.currentTime
    this.musicBus.gain.cancelScheduledValues(now)
    this.musicBus.gain.setTargetAtTime(this.volume, now, .06)
  }

  setAtmosphere(mode: AtmosphereMode, ambienceActive = true) {
    this.atmosphereMode = mode
    this.ambienceActive = ambienceActive
    this.applyAtmosphere()
  }

  pause() {
    if (this.paused) return
    this.paused = true
    this.fadeOutActive(.12)
  }

  resume() {
    if (!this.paused) return
    this.paused = false
    if (!this.context) return
    void this.contextResumer(this.context).then(() => this.reconcile())
  }

  getSnapshot(): MusicEngineSnapshot {
    return {
      initialized: this.initialized,
      enabled: this.enabled,
      paused: this.paused || this.visibilityPaused,
      desiredTheme: this.desiredTheme,
      activeTheme: this.active?.id ?? null,
      volume: this.volume,
      contextState: this.context?.state ?? (currentAudioContext()?.state ?? 'not-created'),
    }
  }

  dispose() {
    this.fadeOutActive(0)
    if (this.visibilityListenerAttached && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.onVisibilityChange)
    }
    this.visibilityListenerAttached = false
    this.musicBus?.disconnect()
    this.atmosphereFilter?.disconnect()
    this.windSource?.stop()
    this.windSource?.disconnect()
    this.windGain?.disconnect()
    this.musicBus = null
    this.atmosphereFilter = null
    this.windSource = null
    this.windGain = null
    this.initialized = false
    this.initialization = null
    this.context = null
  }

  private reconcile() {
    if (!this.initialized || !this.context || !this.musicBus) return
    if (!this.enabled || this.paused || this.visibilityPaused || !this.desiredTheme) {
      this.fadeOutActive(this.desiredTheme ? .12 : CROSSFADE_OUT_SECONDS)
      return
    }
    if (this.active?.id === this.desiredTheme) return
    this.transitionTo(this.desiredTheme)
  }

  private createWindAmbience(context: AudioContext, destination: AudioNode) {
    if (typeof context.createBuffer !== 'function' || typeof context.createBufferSource !== 'function' || typeof context.createBiquadFilter !== 'function') return
    const length = Math.max(1, Math.floor(context.sampleRate * 2))
    const buffer = context.createBuffer(1, length, context.sampleRate)
    const samples = buffer.getChannelData(0)
    let seed = 71
    for (let index = 0; index < samples.length; index += 1) {
      seed = (seed * 48271) % 2147483647
      samples[index] = (seed / 2147483647) * 2 - 1
    }
    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const gain = context.createGain()
    source.buffer = buffer
    source.loop = true
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(520, context.currentTime)
    gain.gain.setValueAtTime(.0001, context.currentTime)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(destination)
    source.start()
    this.windSource = source
    this.windGain = gain
  }

  private applyAtmosphere() {
    if (!this.context) return
    const now = this.context.currentTime
    const preset = ATMOSPHERE_PRESETS[this.atmosphereMode]
    if (this.atmosphereFilter) {
      this.atmosphereFilter.frequency.cancelScheduledValues(now)
      this.atmosphereFilter.frequency.setTargetAtTime(preset.musicCutoff, now, .6)
    }
    if (this.windGain) {
      const target = this.enabled && this.ambienceActive ? Math.max(.0001, preset.wind) : .0001
      this.windGain.gain.cancelScheduledValues(now)
      this.windGain.gain.setTargetAtTime(target, now, .7)
    }
  }

  private transitionTo(themeId: MusicThemeId, force = false) {
    if (!this.context || !this.musicBus || !this.enabled || this.paused || this.visibilityPaused) return
    if (!force && this.active?.id === themeId) return
    const oldTheme = this.active
    const now = this.context.currentTime
    const bus = this.context.createGain()
    bus.gain.setValueAtTime(.0001, now)
    bus.gain.exponentialRampToValueAtTime(1, now + CROSSFADE_IN_SECONDS)
    bus.connect(this.musicBus)
    const sequencer = this.sequencerFactory(this.context, MUSIC_THEMES[themeId], bus, this.progression)
    this.active = { id: themeId, bus, sequencer }
    if (oldTheme) this.fadeOutTrack(oldTheme, CROSSFADE_OUT_SECONDS)
  }

  private fadeOutActive(seconds: number) {
    if (!this.active) return
    const active = this.active
    this.active = null
    this.fadeOutTrack(active, seconds)
  }

  private fadeOutTrack(track: PlayingTheme, seconds: number) {
    const context = this.context
    if (!context) {
      track.sequencer.stop()
      track.bus.disconnect()
      return
    }
    const now = context.currentTime
    track.bus.gain.cancelScheduledValues(now)
    track.bus.gain.setValueAtTime(Math.max(.0001, track.bus.gain.value), now)
    if (seconds > .01) track.bus.gain.exponentialRampToValueAtTime(.0001, now + seconds)
    else track.bus.gain.setValueAtTime(.0001, now)
    this.scheduleTimeout(() => {
      track.sequencer.stop()
      track.bus.disconnect()
    }, Math.max(20, (seconds + .08) * 1000))
  }
}

export const musicEngine = new MusicEngine()
export { DEFAULT_MUSIC_VOLUME }
