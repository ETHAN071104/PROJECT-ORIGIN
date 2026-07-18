import { describe, expect, it, vi } from 'vitest'
import { detectStandalone, detectTouchMobile, requestImmersiveMode, shouldShowImmersiveGate } from './immersive'

describe('mobile immersive entry state', () => {
  it('shows the gate only for a mobile browser session that is not standalone or dismissed', () => {
    expect(shouldShowImmersiveGate({ isMobile: true, isStandalone: false, sessionDismissed: false })).toBe(true)
    expect(shouldShowImmersiveGate({ isMobile: false, isStandalone: false, sessionDismissed: false })).toBe(false)
    expect(shouldShowImmersiveGate({ isMobile: true, isStandalone: true, sessionDismissed: false })).toBe(false)
    expect(shouldShowImmersiveGate({ isMobile: true, isStandalone: false, sessionDismissed: true })).toBe(false)
  })

  it('detects standalone from display mode or the safe platform-specific flag', () => {
    expect(detectStandalone({ displayModeStandalone: true })).toBe(true)
    expect(detectStandalone({ displayModeStandalone: false, navigatorStandalone: true })).toBe(true)
    expect(detectStandalone({ displayModeStandalone: false, navigatorStandalone: false })).toBe(false)
  })

  it('uses touch, pointer, and viewport signals rather than a user agent alone', () => {
    expect(detectTouchMobile({ coarsePointer: true, hoverNone: true, maxTouchPoints: 5, viewportWidth: 844, viewportHeight: 390 })).toBe(true)
    expect(detectTouchMobile({ coarsePointer: false, hoverNone: false, maxTouchPoints: 0, viewportWidth: 390, viewportHeight: 844 })).toBe(false)
  })

  it('returns a safe fallback result when fullscreen is missing or rejected', async () => {
    await expect(requestImmersiveMode(null)).resolves.toBe('unsupported')
    await expect(requestImmersiveMode({ requestFullscreen: vi.fn().mockRejectedValue(new Error('denied')) })).resolves.toBe('rejected')
  })

  it('keeps fullscreen successful when optional orientation locking rejects', async () => {
    const requestFullscreen = vi.fn().mockResolvedValue(undefined)
    const lock = vi.fn().mockRejectedValue(new Error('not supported'))
    await expect(requestImmersiveMode({ requestFullscreen }, { lock })).resolves.toBe('success')
    expect(requestFullscreen).toHaveBeenCalledOnce()
    expect(lock).toHaveBeenCalledWith('landscape')
  })
})
