import type { CSSProperties } from 'react'
import type { WorldMapAtmosphereId } from './atmosphereTypes'

interface LightPoint { x: number; y: number; color: string; size: number }

const LIGHTS: Record<WorldMapAtmosphereId, LightPoint[]> = {
  hub: [
    { x: 31, y: 49, color: '#ffe6a1', size: 76 }, { x: 52, y: 43, color: '#b8ffff', size: 84 },
    { x: 67, y: 61, color: '#ffe6a1', size: 72 }, { x: 86, y: 49, color: '#d89dff', size: 92 },
    { x: 46, y: 74, color: '#91edf1', size: 66 },
  ],
  history: [
    { x: 16, y: 37, color: '#a5e9ef', size: 74 }, { x: 48, y: 42, color: '#d7a2e3', size: 82 },
    { x: 80, y: 38, color: '#a5e9ef', size: 74 },
  ],
  people: [
    { x: 20, y: 42, color: '#9ee9ee', size: 82 }, { x: 50, y: 37, color: '#d7a2e3', size: 88 },
    { x: 80, y: 42, color: '#9ee9ee', size: 82 },
  ],
  research: [
    { x: 23, y: 48, color: '#d9b15d', size: 72 }, { x: 48, y: 48, color: '#d88be5', size: 74 },
    { x: 72, y: 48, color: '#86e9ee', size: 74 }, { x: 91, y: 40, color: '#c981e0', size: 110 },
  ],
}

export function WorldLights({ map, strength }: { map: WorldMapAtmosphereId; strength: number }) {
  return (
    <div className="world-light-layer" aria-hidden="true">
      {LIGHTS[map].map((light, index) => (
        <i key={index} style={{
          '--light-x': `${light.x}%`, '--light-y': `${light.y}%`, '--light-color': light.color,
          '--light-size': `${light.size}px`, '--light-strength': strength,
        } as CSSProperties} />
      ))}
    </div>
  )
}
