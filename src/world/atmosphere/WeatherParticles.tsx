import type { CSSProperties } from 'react'
import type { AtmospherePreset } from './atmosphereTypes'
import { PARTICLE_COUNTS } from './atmospherePresets'
import type { ParticleQuality } from '../../game/types'

function particleStyle(index: number, preset: AtmospherePreset): CSSProperties {
  const x = (index * 37 + 11) % 101
  const y = (index * 61 + 7) % 97
  const delay = -((index * 0.43) % 6)
  const duration = preset.particle === 'sand' ? 1.8 + (index % 5) * .16 : 4.8 + (index % 7) * .55
  return {
    '--particle-x': `${x}%`, '--particle-y': `${y}%`, '--particle-delay': `${delay}s`,
    '--particle-duration': `${duration}s`, '--particle-color': preset.particleColor,
  } as CSSProperties
}

export function WeatherParticles({ preset, quality }: { preset: AtmospherePreset; quality: ParticleQuality }) {
  if (preset.particle === 'none') return null
  return (
    <div className={`weather-particles particle-${preset.particle}`} aria-hidden="true">
      {Array.from({ length: PARTICLE_COUNTS[quality] }, (_, index) => <i key={index} style={particleStyle(index, preset)} />)}
    </div>
  )
}
