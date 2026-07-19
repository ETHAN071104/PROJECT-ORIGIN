import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import type { Direction } from '../game/types'

interface VirtualControlsProps {
  onDirectionChange: (direction: Direction, pressed: boolean) => void
  onReset: () => void
  onInteract?: () => void
  interactionLabel?: string
  onExpress?: () => void
}

const directions: Direction[] = ['up', 'down', 'left', 'right']

export function VirtualControls({ onDirectionChange, onReset, onInteract, interactionLabel, onExpress }: VirtualControlsProps) {
  const activePointers = useRef(new Map<number, Direction>())

  const syncDirections = useCallback(() => {
    const active = new Set(activePointers.current.values())
    for (const direction of directions) onDirectionChange(direction, active.has(direction))
  }, [onDirectionChange])

  const clearPointers = useCallback(() => {
    activePointers.current.clear()
    syncDirections()
    onReset()
  }, [onReset, syncDirections])

  useEffect(() => {
    const clearOnVisibilityLoss = () => { if (document.hidden) clearPointers() }
    const releaseGlobalPointer = (event: PointerEvent) => {
      if (!activePointers.current.delete(event.pointerId)) return
      syncDirections()
    }
    window.addEventListener('blur', clearPointers)
    window.addEventListener('pointerup', releaseGlobalPointer, true)
    window.addEventListener('pointercancel', releaseGlobalPointer, true)
    document.addEventListener('visibilitychange', clearOnVisibilityLoss)
    return () => {
      window.removeEventListener('blur', clearPointers)
      window.removeEventListener('pointerup', releaseGlobalPointer, true)
      window.removeEventListener('pointercancel', releaseGlobalPointer, true)
      document.removeEventListener('visibilitychange', clearOnVisibilityLoss)
      clearPointers()
    }
  }, [clearPointers])

  const pressDirection = (direction: Direction, event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    activePointers.current.set(event.pointerId, direction)
    event.currentTarget.setPointerCapture(event.pointerId)
    syncDirections()
  }

  const releaseDirection = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    activePointers.current.delete(event.pointerId)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    syncDirections()
  }

  const moveButton = (direction: Direction, label: string) => (
    <button
      type="button"
      className={`dpad-key dpad-${direction}`}
      data-direction={direction}
      aria-label={`Move ${direction}`}
      onPointerDown={(event) => pressDirection(direction, event)}
      onPointerUp={releaseDirection}
      onPointerCancel={releaseDirection}
      onLostPointerCapture={releaseDirection}
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
    >
      {label}
    </button>
  )

  return (
    <div className="virtual-controls" aria-label="Touch game controls" onContextMenu={(event) => event.preventDefault()}>
      <div className="dpad">
        {moveButton('up', '▲')}
        {moveButton('left', '◀')}
        <span className="dpad-center" />
        {moveButton('right', '▶')}
        {moveButton('down', '▼')}
      </div>
      <div className="map-action-buttons">
        {onExpress && (
          <button
            type="button"
            className="expression-button"
            aria-label="Express a note"
            onPointerDown={(event) => {
              event.preventDefault()
              onExpress()
            }}
            onContextMenu={(event) => event.preventDefault()}
          >
            F
            <small>VOICE</small>
          </button>
        )}
        {onInteract && (
          <button
            type="button"
            className="interact-button"
            aria-label={interactionLabel ? `Interact: ${interactionLabel}` : 'Interact'}
            onPointerDown={(event) => {
              event.preventDefault()
              event.currentTarget.setPointerCapture(event.pointerId)
              onInteract()
            }}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
            }}
            onPointerCancel={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
            }}
            onContextMenu={(event) => event.preventDefault()}
          >
            E
            <small>{interactionLabel ? interactionLabel.slice(0, 12) : 'ACT'}</small>
          </button>
        )}
      </div>
    </div>
  )
}
