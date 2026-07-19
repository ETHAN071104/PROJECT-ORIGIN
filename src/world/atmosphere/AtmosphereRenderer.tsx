import type { CSSProperties } from 'react'
import { ATMOSPHERE_PRESETS } from './atmospherePresets'
import type { WorldMapAtmosphereId } from './atmosphereTypes'
import { useAtmosphere } from './AtmosphereProvider'
import { WeatherParticles } from './WeatherParticles'
import { WorldLights } from './WorldLights'

function presetStyle(mode: keyof typeof ATMOSPHERE_PRESETS, seconds: number): CSSProperties {
  const preset = ATMOSPHERE_PRESETS[mode]
  return {
    '--atmo-sky-top': preset.skyTop,
    '--atmo-sky-bottom': preset.skyBottom,
    '--atmo-grade': preset.grade,
    '--atmo-grade-opacity': preset.gradeOpacity,
    '--atmo-brightness': preset.brightness,
    '--atmo-saturation': preset.saturation,
    '--atmo-transition': `${seconds}s`,
  } as CSSProperties
}

export function AtmosphereRenderer({ map }: { map: WorldMapAtmosphereId }) {
  const atmosphere = useAtmosphere()
  const preset = ATMOSPHERE_PRESETS[atmosphere.mode]
  const previous = atmosphere.previousMode ? ATMOSPHERE_PRESETS[atmosphere.previousMode] : null
  return (
    <>
      {previous && <div key={`old-${previous.mode}`} className={`world-atmosphere-sky is-previous atmosphere-${previous.mode}`} style={presetStyle(previous.mode, atmosphere.transitionSeconds)} aria-hidden="true" />}
      <div key={`sky-${preset.mode}`} className={`world-atmosphere-sky is-current atmosphere-${preset.mode}`} style={presetStyle(preset.mode, atmosphere.transitionSeconds)} aria-hidden="true" />
      {atmosphere.shadows && <div className={`world-shadow-layer shadows-${map}`} style={{ '--shadow-opacity': preset.shadowOpacity } as CSSProperties} aria-hidden="true"><i /><i /><i /><i /></div>}
      {atmosphere.lights && <WorldLights map={map} strength={preset.emissive} />}
      {atmosphere.particles && <WeatherParticles preset={preset} quality={atmosphere.particleQuality} />}
      {previous && <div key={`grade-old-${previous.mode}`} className={`world-atmosphere-grade is-previous atmosphere-${previous.mode}`} style={presetStyle(previous.mode, atmosphere.transitionSeconds)} aria-hidden="true" />}
      <div key={`grade-${preset.mode}`} className={`world-atmosphere-grade is-current atmosphere-${preset.mode}`} style={presetStyle(preset.mode, atmosphere.transitionSeconds)} aria-hidden="true" />
    </>
  )
}
