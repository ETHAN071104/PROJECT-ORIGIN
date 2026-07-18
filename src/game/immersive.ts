export const GAME_INPUT_RESET_EVENT = 'project-origin-input-reset'
export const GAME_INPUT_BLOCK_ATTRIBUTE = 'data-project-origin-input-blocked'

export interface StandaloneSignals {
  displayModeStandalone: boolean
  navigatorStandalone?: boolean
}

export interface MobileSignals {
  coarsePointer: boolean
  hoverNone: boolean
  maxTouchPoints: number
  viewportWidth: number
  viewportHeight: number
}

export interface ImmersiveGateState {
  isMobile: boolean
  isStandalone: boolean
  sessionDismissed: boolean
}

export type FullscreenRequestResult = 'success' | 'unsupported' | 'rejected'

export interface FullscreenTargetLike {
  requestFullscreen?: () => Promise<void>
}

export interface OrientationLike {
  lock?: (orientation: string) => Promise<void>
}

export function detectStandalone(signals: StandaloneSignals) {
  return signals.displayModeStandalone || signals.navigatorStandalone === true
}

export function detectTouchMobile(signals: MobileSignals) {
  const touchOriented = signals.maxTouchPoints > 0 && (signals.coarsePointer || signals.hoverNone)
  const shortEdge = Math.min(signals.viewportWidth, signals.viewportHeight)
  const longEdge = Math.max(signals.viewportWidth, signals.viewportHeight)
  return touchOriented && shortEdge <= 1024 && longEdge <= 1366
}

export function shouldShowImmersiveGate(state: ImmersiveGateState) {
  return state.isMobile && !state.isStandalone && !state.sessionDismissed
}

export async function requestImmersiveMode(
  target: FullscreenTargetLike | null,
  orientation?: OrientationLike | null,
): Promise<FullscreenRequestResult> {
  if (!target?.requestFullscreen) return 'unsupported'
  try {
    await target.requestFullscreen()
    try {
      await orientation?.lock?.('landscape')
    } catch {
      // Fullscreen remains valid when orientation locking is not available.
    }
    return 'success'
  } catch {
    return 'rejected'
  }
}

export function setGlobalGameInputBlocked(blocked: boolean) {
  if (typeof document === 'undefined') return
  if (blocked) document.documentElement.setAttribute(GAME_INPUT_BLOCK_ATTRIBUTE, 'true')
  else document.documentElement.removeAttribute(GAME_INPUT_BLOCK_ATTRIBUTE)
  if (blocked && typeof window !== 'undefined') window.dispatchEvent(new Event(GAME_INPUT_RESET_EVENT))
}

export function isGlobalGameInputBlocked() {
  return typeof document !== 'undefined' && document.documentElement.hasAttribute(GAME_INPUT_BLOCK_ATTRIBUTE)
}
