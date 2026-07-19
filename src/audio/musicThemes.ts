import type { MusicEvent, MusicProgression, MusicTheme, MusicThemeId } from './audioTypes'

export const ORIGIN_MOTIF = [60, 63, 67, 62] as const

const ROOTS = [36, 39, 31, 38] as const
const loopSections = [0, 8, 16, 24] as const

const event = (
  beat: number,
  note: number,
  duration: number,
  velocity: number,
  voice: MusicEvent['voice'],
  layer: MusicEvent['layer'] = 'base',
  detune = 0,
): MusicEvent => ({ beat, note, duration, velocity, voice, layer, detune })

const sustainedFoundation = (brightness = 0): MusicEvent[] => loopSections.flatMap((beat, index) => [
  event(beat, ROOTS[index], 8.2, .64, 'bass'),
  event(beat, ROOTS[index] + 12, 8.35, .34, 'pad'),
  event(beat, ROOTS[index] + 19 + brightness, 8.35, .2, 'pad', 'dl'),
])

const progressionLayers = (leadLift = 0): MusicEvent[] => [
  ...loopSections.map((beat, index) => event(beat + 1.5, ORIGIN_MOTIF[index] + 24 + leadLift, .8, .32, 'bell', 'cv')),
  ...Array.from({ length: 16 }, (_, index) => event(index * 2, 36, .18, index % 4 === 0 ? .5 : .3, 'pulse', 'ml')),
  ...loopSections.map((beat, index) => event(beat + 5.5, ORIGIN_MOTIF[(index + 2) % ORIGIN_MOTIF.length] + 12 + leadLift, 1.15, .3, 'lead', 'nlp')),
  ...loopSections.map((beat, index) => event(beat + 3, ORIGIN_MOTIF[index] + 7 + leadLift, 3.4, .2, 'pad', 'dl')),
]

const originSignal: MusicTheme = {
  id: 'origin-signal',
  name: 'ORIGIN SIGNAL',
  bpm: 76,
  beatsPerLoop: 32,
  events: [
    ...sustainedFoundation(),
    ...loopSections.flatMap((beat, index) => [
      event(beat + 2, ORIGIN_MOTIF[index] + 12, 1.4, .45, 'bell'),
      event(beat + 3.75, ORIGIN_MOTIF[index] + 19, .65, .22, 'bell'),
    ]),
    ...Array.from({ length: 8 }, (_, index) => event(index * 4, ROOTS[index % ROOTS.length], .22, .32, 'pulse')),
  ],
}

const academyNight: MusicTheme = {
  id: 'academy-night',
  name: 'ACADEMY NIGHT',
  bpm: 72,
  beatsPerLoop: 32,
  events: [
    ...sustainedFoundation(),
    ...loopSections.map((beat, index) => event(beat + 3.5, ORIGIN_MOTIF[index] + 12, 1.2, .28, 'lead')),
    ...[7.5, 15.5, 23.5, 31.5].map((beat, index) => event(beat, 72 + index, .12, .16, 'glitch')),
    ...progressionLayers(-12),
  ],
}

const academyDay: MusicTheme = {
  id: 'academy-day',
  name: 'ACADEMY DAY',
  bpm: 78,
  beatsPerLoop: 32,
  events: [
    ...sustainedFoundation(5),
    ...loopSections.flatMap((beat, index) => [
      event(beat, ORIGIN_MOTIF[index] + 12, 1.15, .4, 'lead'),
      event(beat + 2, ORIGIN_MOTIF[(index + 1) % ORIGIN_MOTIF.length] + 12, .9, .3, 'bell'),
      event(beat + 4, ORIGIN_MOTIF[index] + 19, 1.5, .24, 'lead'),
    ]),
    ...Array.from({ length: 16 }, (_, index) => event(index * 2 + 1, 84, .08, .13, 'hat')),
    ...progressionLayers(),
  ],
}

const standAmongGiants: MusicTheme = {
  id: 'stand-among-giants',
  name: 'STAND AMONG GIANTS',
  bpm: 70,
  beatsPerLoop: 32,
  events: [
    event(0, 24, 16.4, .72, 'bass'),
    event(0, 36, 16.4, .3, 'pad'),
    event(8, 43, 8.3, .54, 'bass'),
    ...ORIGIN_MOTIF.map((note, index) => event(8 + index * 2, note, 1.55, .32 + index * .035, 'bell')),
    event(16, 36, 16.35, .72, 'bass'),
    event(16, 48, 16.35, .35, 'pad'),
    ...ORIGIN_MOTIF.flatMap((note, index) => [
      event(16 + index * 2, note + 12, 1.7, .42, 'lead'),
      event(16 + index * 2, note + 19, 2.4, .22, 'pad'),
      event(24 + index * 1.5, note + 24, 1.25, .36, 'bell'),
    ]),
    ...[16, 20, 24, 28].map((beat) => event(beat, 36, .3, .38, 'pulse')),
  ],
}

export const MUSIC_THEMES: Record<MusicThemeId, MusicTheme> = {
  'origin-signal': originSignal,
  'academy-night': academyNight,
  'academy-day': academyDay,
  'stand-among-giants': standAmongGiants,
}

export function layerEnabled(layer: MusicEvent['layer'], progression: MusicProgression) {
  if (!layer || layer === 'base') return true
  return progression[layer]
}

export function activeThemeEvents(theme: MusicTheme, progression: MusicProgression) {
  return theme.events.filter((item) => layerEnabled(item.layer, progression))
}

export function themeLoopSeconds(theme: MusicTheme) {
  return theme.beatsPerLoop * 60 / theme.bpm
}
