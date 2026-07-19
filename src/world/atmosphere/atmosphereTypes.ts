import type { AtmosphereMode, ParticleQuality } from '../../game/types'

export type WorldMapAtmosphereId = 'hub' | 'history' | 'people' | 'research'

export interface AtmospherePreset {
  mode: AtmosphereMode
  skyTop: string
  skyBottom: string
  grade: string
  gradeOpacity: number
  brightness: number
  saturation: number
  emissive: number
  shadowOpacity: number
  particle: 'none' | 'motes' | 'fireflies' | 'stars' | 'sand'
  particleColor: string
  wind: number
  musicCutoff: number
}

export interface AtmosphereDebugState {
  overrideMode: AtmosphereMode | null
  transitionSeconds: number
  lights: boolean
  shadows: boolean
  particles: boolean
}

export interface AtmosphereRenderState {
  mode: AtmosphereMode
  previousMode: AtmosphereMode | null
  transitionSeconds: number
  particleQuality: ParticleQuality
  lights: boolean
  shadows: boolean
  particles: boolean
}
