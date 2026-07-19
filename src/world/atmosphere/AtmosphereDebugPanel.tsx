import type { AtmosphereMode, ParticleQuality } from '../../game/types'
import { useAtmosphere } from './AtmosphereProvider'

const MODES: AtmosphereMode[] = ['day', 'dusk', 'night', 'sandstorm']
const QUALITIES: ParticleQuality[] = ['low', 'medium', 'high']

export function AtmosphereDebugPanel() {
  const atmosphere = useAtmosphere()
  const visible = import.meta.env.DEV && new URLSearchParams(window.location.search).get('atmosphereTest') === '1'
  if (!visible) return null
  return (
    <aside className="atmosphere-debug-panel" aria-label="World atmosphere debug panel">
      <strong>ATMOSPHERE TEST</strong><span>{atmosphere.mode}</span>
      <div>{MODES.map((mode) => <button type="button" key={mode} className={atmosphere.debug.overrideMode === mode ? 'is-active' : ''} onClick={() => atmosphere.setDebug({ overrideMode: mode })}>{mode}</button>)}</div>
      <label>TRANSITION <input type="range" min="3" max="5" step=".5" value={atmosphere.debug.transitionSeconds} onChange={(event) => atmosphere.setDebug({ transitionSeconds: Number(event.currentTarget.value) })} /></label>
      <label>QUALITY <select value={atmosphere.particleQuality} onChange={(event) => atmosphere.setParticleQuality(event.currentTarget.value as ParticleQuality)}>{QUALITIES.map((quality) => <option key={quality}>{quality}</option>)}</select></label>
      <div className="atmosphere-debug-toggles">
        <button type="button" onClick={() => atmosphere.setDebug({ lights: !atmosphere.debug.lights })}>LIGHTS {atmosphere.debug.lights ? 'ON' : 'OFF'}</button>
        <button type="button" onClick={() => atmosphere.setDebug({ shadows: !atmosphere.debug.shadows })}>SHADOWS {atmosphere.debug.shadows ? 'ON' : 'OFF'}</button>
        <button type="button" onClick={() => atmosphere.setDebug({ particles: !atmosphere.debug.particles })}>PARTICLES {atmosphere.debug.particles ? 'ON' : 'OFF'}</button>
      </div>
      <button type="button" onClick={() => atmosphere.setDebug({ overrideMode: null })}>FOLLOW SAVE</button>
    </aside>
  )
}
