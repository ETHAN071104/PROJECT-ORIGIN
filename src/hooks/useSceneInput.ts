import { useCallback, useEffect, useRef } from 'react'
import { EMPTY_INPUT } from '../game/movement'
import { GAME_INPUT_RESET_EVENT, isGlobalGameInputBlocked } from '../game/immersive'
import type { Direction, MovementInput } from '../game/types'

const directionForCode: Record<string, Direction | undefined> = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
}

const interactionCodes = new Set(['Enter', 'KeyE', 'Space'])

export interface InputController {
  setDirection: (direction: Direction, pressed: boolean) => void
  resetDirections: () => void
}

export function useSceneInput(
  active: boolean,
  onFrame: (input: MovementInput, deltaSeconds: number) => void,
  onInteract: () => void,
): InputController {
  const keyboardDirections = useRef(new Set<Direction>())
  const virtualDirections = useRef(new Set<Direction>())
  const pendingDirections = useRef(new Set<Direction>())
  const input = useRef<MovementInput>({ ...EMPTY_INPUT })
  const onFrameRef = useRef(onFrame)
  const onInteractRef = useRef(onInteract)

  useEffect(() => { onFrameRef.current = onFrame }, [onFrame])
  useEffect(() => { onInteractRef.current = onInteract }, [onInteract])

  const syncInput = useCallback(() => {
    const pressed = (direction: Direction) => keyboardDirections.current.has(direction) || virtualDirections.current.has(direction)
    input.current = {
      up: pressed('up'),
      down: pressed('down'),
      left: pressed('left'),
      right: pressed('right'),
    }
  }, [])

  const setDirection = useCallback((direction: Direction, pressed: boolean) => {
    if (isGlobalGameInputBlocked()) return
    if (pressed) {
      virtualDirections.current.add(direction)
      pendingDirections.current.add(direction)
    }
    else virtualDirections.current.delete(direction)
    syncInput()
  }, [syncInput])

  const resetDirections = useCallback(() => {
    keyboardDirections.current.clear()
    virtualDirections.current.clear()
    pendingDirections.current.clear()
    input.current = { ...EMPTY_INPUT }
  }, [])

  useEffect(() => {
    if (!active) {
      resetDirections()
      return
    }

    let animationFrame = 0
    let previousTime = performance.now()

    const tick = (time: number) => {
      const deltaSeconds = Math.min((time - previousTime) / 1000, 0.05)
      previousTime = time
      if (isGlobalGameInputBlocked()) {
        resetDirections()
        animationFrame = window.requestAnimationFrame(tick)
        return
      }
      const frameInput = { ...input.current }
      const hasPendingDirection = pendingDirections.current.size > 0
      for (const direction of pendingDirections.current) frameInput[direction] = true
      pendingDirections.current.clear()
      onFrameRef.current(frameInput, hasPendingDirection ? Math.max(deltaSeconds, 1 / 120) : deltaSeconds)
      animationFrame = window.requestAnimationFrame(tick)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (isGlobalGameInputBlocked()) {
        if (directionForCode[event.code] || interactionCodes.has(event.code)) event.preventDefault()
        return
      }
      const direction = directionForCode[event.code]
      if (direction) {
        event.preventDefault()
        keyboardDirections.current.add(direction)
        pendingDirections.current.add(direction)
        syncInput()
        return
      }
      if (interactionCodes.has(event.code)) {
        event.preventDefault()
        if (!event.repeat) onInteractRef.current()
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      const direction = directionForCode[event.code]
      if (direction) {
        event.preventDefault()
        keyboardDirections.current.delete(direction)
        syncInput()
      } else if (interactionCodes.has(event.code)) {
        event.preventDefault()
      }
    }

    const resetOnVisibilityLoss = () => {
      if (document.hidden) resetDirections()
    }

    animationFrame = window.requestAnimationFrame(tick)
    window.addEventListener('keydown', onKeyDown, { passive: false })
    window.addEventListener('keyup', onKeyUp, { passive: false })
    window.addEventListener('blur', resetDirections)
    window.addEventListener(GAME_INPUT_RESET_EVENT, resetDirections)
    document.addEventListener('visibilitychange', resetOnVisibilityLoss)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', resetDirections)
      window.removeEventListener(GAME_INPUT_RESET_EVENT, resetDirections)
      document.removeEventListener('visibilitychange', resetOnVisibilityLoss)
      resetDirections()
    }
  }, [active, resetDirections, syncInput])

  return { setDirection, resetDirections }
}
