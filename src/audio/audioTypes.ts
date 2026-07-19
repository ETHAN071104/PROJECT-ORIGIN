export type MusicThemeId = 'origin-signal' | 'academy-night' | 'academy-day' | 'stand-among-giants'

export type MusicVoice = 'pad' | 'bass' | 'lead' | 'bell' | 'pulse' | 'hat' | 'glitch'

export type MusicLayer = 'base' | 'cv' | 'ml' | 'nlp' | 'dl'

export interface MusicProgression {
  cv: boolean
  ml: boolean
  nlp: boolean
  dl: boolean
}

export interface MusicEvent {
  beat: number
  note: number
  duration: number
  velocity: number
  voice: MusicVoice
  layer?: MusicLayer
  detune?: number
}

export interface MusicTheme {
  id: MusicThemeId
  name: string
  bpm: number
  beatsPerLoop: number
  events: readonly MusicEvent[]
}

export interface MusicEngineSnapshot {
  initialized: boolean
  enabled: boolean
  paused: boolean
  desiredTheme: MusicThemeId | null
  activeTheme: MusicThemeId | null
  volume: number
  contextState: AudioContextState | 'unavailable' | 'not-created'
}

export const EMPTY_MUSIC_PROGRESSION: MusicProgression = { cv: false, ml: false, nlp: false, dl: false }
