import { getAudioContext, resumeAudioContext } from './audioContext'

type ToneKind = 'confirm' | 'step' | 'alarm' | 'incorrect' | 'complete' | 'connect' | 'power' | 'tune' | 'optimize'

export function playTone(enabled: boolean, kind: ToneKind = 'confirm') {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return
  void resumeAudioContext(ctx)
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  const now = ctx.currentTime
  oscillator.type = kind === 'alarm' || kind === 'incorrect' ? 'sawtooth' : kind === 'complete' || kind === 'tune' ? 'triangle' : 'square'
  const startFrequency = kind === 'confirm' ? 520
    : kind === 'step' ? 170
      : kind === 'incorrect' ? 130
        : kind === 'complete' ? 330
          : kind === 'connect' ? 280
            : kind === 'power' ? 410
              : kind === 'tune' ? 610
                : kind === 'optimize' ? 190
                  : 240
  oscillator.frequency.setValueAtTime(startFrequency, now)
  if (kind === 'confirm') oscillator.frequency.exponentialRampToValueAtTime(780, now + 0.08)
  if (kind === 'incorrect') oscillator.frequency.exponentialRampToValueAtTime(82, now + 0.16)
  if (kind === 'complete') {
    oscillator.frequency.exponentialRampToValueAtTime(660, now + 0.13)
    oscillator.frequency.exponentialRampToValueAtTime(990, now + 0.28)
  }
  if (kind === 'connect') oscillator.frequency.exponentialRampToValueAtTime(420, now + 0.1)
  if (kind === 'power') oscillator.frequency.exponentialRampToValueAtTime(820, now + 0.12)
  if (kind === 'tune') oscillator.frequency.exponentialRampToValueAtTime(915, now + 0.14)
  if (kind === 'optimize') oscillator.frequency.exponentialRampToValueAtTime(260, now + 0.12)
  gain.gain.setValueAtTime(kind === 'alarm' ? 0.035 : kind === 'complete' ? 0.03 : 0.025, now)
  const duration = kind === 'alarm' ? 0.3 : kind === 'incorrect' ? 0.18 : kind === 'complete' ? 0.34 : ['connect', 'power', 'tune', 'optimize'].includes(kind) ? 0.15 : 0.08
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(now)
  oscillator.stop(now + duration + 0.01)
}

export function playVoiceNote(enabled: boolean, frequency: number) {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return
  void resumeAudioContext(ctx)
  const oscillator = ctx.createOscillator()
  const harmony = ctx.createOscillator()
  const gain = ctx.createGain()
  const now = ctx.currentTime

  oscillator.type = 'square'
  harmony.type = 'triangle'
  oscillator.frequency.setValueAtTime(frequency, now)
  harmony.frequency.setValueAtTime(frequency * 2, now)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.025, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34)

  oscillator.connect(gain)
  harmony.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(now)
  harmony.start(now)
  oscillator.stop(now + 0.35)
  harmony.stop(now + 0.35)
}

type EndingCue = 'gate' | 'impact' | 'reveal' | 'core'

export function playEndingCue(enabled: boolean, cue: EndingCue) {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return
  void resumeAudioContext(ctx)
  const now = ctx.currentTime
  const voices = cue === 'gate'
    ? [{ frequency: 72, target: 144, duration: 1.25, volume: 0.026, type: 'sawtooth' as OscillatorType }, { frequency: 288, target: 576, duration: .7, volume: 0.012, type: 'triangle' as OscillatorType }]
    : cue === 'impact'
      ? [{ frequency: 58, target: 36, duration: .55, volume: 0.045, type: 'square' as OscillatorType }, { frequency: 94, target: 48, duration: .4, volume: 0.018, type: 'sawtooth' as OscillatorType }]
      : cue === 'reveal'
        ? [{ frequency: 82, target: 110, duration: 2.6, volume: 0.022, type: 'triangle' as OscillatorType }, { frequency: 123, target: 165, duration: 2.4, volume: 0.014, type: 'sine' as OscillatorType }]
        : [{ frequency: 196, target: 392, duration: 1.8, volume: 0.018, type: 'sine' as OscillatorType }, { frequency: 294, target: 588, duration: 1.55, volume: 0.009, type: 'triangle' as OscillatorType }]

  for (const voice of voices) {
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = voice.type
    oscillator.frequency.setValueAtTime(voice.frequency, now)
    oscillator.frequency.exponentialRampToValueAtTime(voice.target, now + voice.duration)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(voice.volume, now + Math.min(.12, voice.duration / 4))
    gain.gain.exponentialRampToValueAtTime(0.0001, now + voice.duration)
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start(now)
    oscillator.stop(now + voice.duration + .02)
  }
}
