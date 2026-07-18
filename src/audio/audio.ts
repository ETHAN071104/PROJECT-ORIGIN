let context: AudioContext | null = null

function getContext() {
  context ??= new AudioContext()
  if (context.state === 'suspended') void context.resume()
  return context
}

export function playTone(enabled: boolean, kind: 'confirm' | 'step' | 'alarm' | 'incorrect' = 'confirm') {
  if (!enabled || typeof AudioContext === 'undefined') return
  const ctx = getContext()
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  const now = ctx.currentTime
  oscillator.type = kind === 'alarm' || kind === 'incorrect' ? 'sawtooth' : 'square'
  oscillator.frequency.setValueAtTime(kind === 'confirm' ? 520 : kind === 'step' ? 170 : kind === 'incorrect' ? 130 : 240, now)
  if (kind === 'confirm') oscillator.frequency.exponentialRampToValueAtTime(780, now + 0.08)
  if (kind === 'incorrect') oscillator.frequency.exponentialRampToValueAtTime(82, now + 0.16)
  gain.gain.setValueAtTime(kind === 'alarm' ? 0.035 : 0.025, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (kind === 'alarm' ? 0.3 : kind === 'incorrect' ? 0.18 : 0.08))
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(now)
  oscillator.stop(now + (kind === 'alarm' ? 0.3 : kind === 'incorrect' ? 0.18 : 0.09))
}
