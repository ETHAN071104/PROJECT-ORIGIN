export const DEFAULT_ATMOSPHERE_TRANSITION_SECONDS = 4

export function clampedTransitionSeconds(value: number, reducedMotion = false): number {
  if (reducedMotion) return .01
  if (!Number.isFinite(value)) return DEFAULT_ATMOSPHERE_TRANSITION_SECONDS
  return Math.max(3, Math.min(5, value))
}

export function waitForAtmosphere(milliseconds: number): Promise<void> {
  return new Promise((resolve) => globalThis.setTimeout(resolve, milliseconds))
}
