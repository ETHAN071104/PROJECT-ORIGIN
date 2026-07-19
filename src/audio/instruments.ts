import type { MusicEvent } from './audioTypes'

export interface ScheduledMusicSource {
  source: AudioScheduledSourceNode
  stop: () => void
}

const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>()

export function midiToFrequency(note: number) {
  return 440 * 2 ** ((note - 69) / 12)
}

function safeStop(source: AudioScheduledSourceNode) {
  try {
    source.stop()
  } catch {
    // A source may already have completed while a crossfade cleanup is running.
  }
}

function tracked(source: AudioScheduledSourceNode): ScheduledMusicSource {
  return { source, stop: () => safeStop(source) }
}

function oscillatorVoice(
  context: AudioContext,
  output: AudioNode,
  musicEvent: MusicEvent,
  startTime: number,
  secondsPerBeat: number,
  type: OscillatorType,
  level: number,
  filterFrequency: number,
  attackSeconds: number,
  releaseSeconds: number,
) {
  const oscillator = context.createOscillator()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()
  const duration = Math.max(.06, musicEvent.duration * secondsPerBeat)
  const endTime = startTime + duration
  const attackEnd = Math.min(endTime - .02, startTime + attackSeconds)
  const releaseStart = Math.max(attackEnd, endTime - releaseSeconds)

  oscillator.type = type
  oscillator.frequency.setValueAtTime(midiToFrequency(musicEvent.note), startTime)
  oscillator.detune.setValueAtTime(musicEvent.detune ?? 0, startTime)
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(filterFrequency, startTime)
  filter.Q.setValueAtTime(.7, startTime)
  gain.gain.setValueAtTime(.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(Math.max(.0002, level * musicEvent.velocity), attackEnd)
  gain.gain.setValueAtTime(Math.max(.0002, level * musicEvent.velocity), releaseStart)
  gain.gain.exponentialRampToValueAtTime(.0001, endTime)

  oscillator.connect(filter)
  filter.connect(gain)
  gain.connect(output)
  oscillator.start(startTime)
  oscillator.stop(endTime + .03)
  oscillator.addEventListener('ended', () => {
    oscillator.disconnect()
    filter.disconnect()
    gain.disconnect()
  }, { once: true })
  return tracked(oscillator)
}

function bellVoice(context: AudioContext, output: AudioNode, musicEvent: MusicEvent, startTime: number, secondsPerBeat: number) {
  const fundamental = oscillatorVoice(context, output, musicEvent, startTime, secondsPerBeat, 'sine', .024, 7000, .012, .34)
  const overtoneEvent = { ...musicEvent, note: musicEvent.note + 12, duration: musicEvent.duration * .72, velocity: musicEvent.velocity * .52, detune: 7 }
  const overtone = oscillatorVoice(context, output, overtoneEvent, startTime + .008, secondsPerBeat, 'triangle', .015, 6200, .008, .24)
  return [fundamental, overtone]
}

function noiseBuffer(context: AudioContext) {
  const cached = noiseBuffers.get(context)
  if (cached) return cached
  const length = Math.max(1, Math.floor(context.sampleRate * .28))
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  let seed = 0x4f524947
  for (let index = 0; index < data.length; index += 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    data[index] = (seed / 0xffffffff) * 2 - 1
  }
  noiseBuffers.set(context, buffer)
  return buffer
}

function noiseVoice(context: AudioContext, output: AudioNode, musicEvent: MusicEvent, startTime: number, highpass: number, level: number) {
  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()
  const duration = musicEvent.voice === 'hat' ? .055 : .11
  source.buffer = noiseBuffer(context)
  filter.type = 'highpass'
  filter.frequency.setValueAtTime(highpass, startTime)
  filter.Q.setValueAtTime(musicEvent.voice === 'hat' ? 1.1 : 3.2, startTime)
  gain.gain.setValueAtTime(Math.max(.0002, level * musicEvent.velocity), startTime)
  gain.gain.exponentialRampToValueAtTime(.0001, startTime + duration)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(output)
  source.start(startTime)
  source.stop(startTime + duration + .02)
  source.addEventListener('ended', () => {
    source.disconnect()
    filter.disconnect()
    gain.disconnect()
  }, { once: true })
  return [tracked(source)]
}

export function scheduleInstrument(
  context: AudioContext,
  output: AudioNode,
  musicEvent: MusicEvent,
  startTime: number,
  secondsPerBeat: number,
): ScheduledMusicSource[] {
  if (musicEvent.voice === 'bell') return bellVoice(context, output, musicEvent, startTime, secondsPerBeat)
  if (musicEvent.voice === 'hat') return noiseVoice(context, output, musicEvent, startTime, 5200, .022)
  if (musicEvent.voice === 'glitch') return noiseVoice(context, output, musicEvent, startTime, 1700, .016)
  if (musicEvent.voice === 'bass') {
    return [oscillatorVoice(context, output, musicEvent, startTime, secondsPerBeat, 'triangle', .032, 720, .055, .26)]
  }
  if (musicEvent.voice === 'pad') {
    return [oscillatorVoice(context, output, musicEvent, startTime, secondsPerBeat, 'sine', .019, 2100, .38, .62)]
  }
  if (musicEvent.voice === 'pulse') {
    return [oscillatorVoice(context, output, musicEvent, startTime, secondsPerBeat, 'square', .016, 1100, .006, .08)]
  }
  return [oscillatorVoice(context, output, musicEvent, startTime, secondsPerBeat, 'square', .018, 3100, .018, .22)]
}
