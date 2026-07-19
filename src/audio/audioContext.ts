type WebkitAudioWindow = typeof globalThis & {
  webkitAudioContext?: typeof AudioContext
}

let sharedContext: AudioContext | null = null

export function audioContextSupported() {
  const target = globalThis as WebkitAudioWindow
  return Boolean(target.AudioContext ?? target.webkitAudioContext)
}

export function getAudioContext(): AudioContext | null {
  if (sharedContext) return sharedContext
  const target = globalThis as WebkitAudioWindow
  const ContextConstructor = target.AudioContext ?? target.webkitAudioContext
  if (!ContextConstructor) return null
  sharedContext = new ContextConstructor()
  return sharedContext
}

export async function resumeAudioContext(context = sharedContext): Promise<boolean> {
  if (!context) return false
  if (context.state === 'suspended') {
    try {
      await context.resume()
    } catch {
      return false
    }
  }
  return context.state === 'running'
}

export function currentAudioContext() {
  return sharedContext
}
