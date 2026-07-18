let context: AudioContext | null = null

function getContext() {
  context ??= new AudioContext()
  if (context.state === 'suspended') void context.resume()
  return context
}

export function playTone(enabled: boolean, kind: 'confirm' | 'step' | 'alarm' | 'incorrect' | 'complete' = 'confirm') {
  if (!enabled || typeof AudioContext === 'undefined') return
  const ctx = getContext()
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  const now = ctx.currentTime
  oscillator.type = kind === 'alarm' || kind === 'incorrect' ? 'sawtooth' : kind === 'complete' ? 'triangle' : 'square'
  oscillator.frequency.setValueAtTime(kind === 'confirm' ? 520 : kind === 'step' ? 170 : kind === 'incorrect' ? 130 : kind === 'complete' ? 330 : 240, now)
  if (kind === 'confirm') oscillator.frequency.exponentialRampToValueAtTime(780, now + 0.08)
  if (kind === 'incorrect') oscillator.frequency.exponentialRampToValueAtTime(82, now + 0.16)
  if (kind === 'complete') {
    oscillator.frequency.exponentialRampToValueAtTime(660, now + 0.13)
    oscillator.frequency.exponentialRampToValueAtTime(990, now + 0.28)
  }
  gain.gain.setValueAtTime(kind === 'alarm' ? 0.035 : kind === 'complete' ? 0.03 : 0.025, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (kind === 'alarm' ? 0.3 : kind === 'incorrect' ? 0.18 : kind === 'complete' ? 0.34 : 0.08))
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(now)
  oscillator.stop(now + (kind === 'alarm' ? 0.3 : kind === 'incorrect' ? 0.18 : kind === 'complete' ? 0.35 : 0.09))
}

export function playVoiceNote(enabled: boolean, frequency: number) {
  if (!enabled || typeof AudioContext === 'undefined') return
  const ctx = getContext()
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
