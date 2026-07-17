import type { Point } from './types'

export const GAME_WIDTH = 960
export const GAME_HEIGHT = 540
export const GAME_ASPECT_RATIO = GAME_WIDTH / GAME_HEIGHT

export interface BoundsLike {
  left: number
  top: number
  width: number
  height: number
}

export interface ScaledStage {
  scale: number
  width: number
  height: number
}

export function calculateScaledStage(containerWidth: number, containerHeight: number): ScaledStage {
  const scale = Math.max(0, Math.min(containerWidth / GAME_WIDTH, containerHeight / GAME_HEIGHT))
  return {
    scale,
    width: GAME_WIDTH * scale,
    height: GAME_HEIGHT * scale,
  }
}

export function clientToLogicalPoint(clientX: number, clientY: number, bounds: BoundsLike): Point {
  if (bounds.width <= 0 || bounds.height <= 0) return { x: 0, y: 0 }
  return {
    x: Math.max(0, Math.min(GAME_WIDTH, ((clientX - bounds.left) / bounds.width) * GAME_WIDTH)),
    y: Math.max(0, Math.min(GAME_HEIGHT, ((clientY - bounds.top) / bounds.height) * GAME_HEIGHT)),
  }
}
