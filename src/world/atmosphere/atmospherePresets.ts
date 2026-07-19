import type { AtmosphereMode, LabFlags, LabId, ParticleQuality } from '../../game/types'
import type { AtmospherePreset } from './atmosphereTypes'

export const ATMOSPHERE_PRESETS: Record<AtmosphereMode, AtmospherePreset> = {
  day: {
    mode: 'day', skyTop: '#65c9dc', skyBottom: '#c6e5c9', grade: '#d9f5d6', gradeOpacity: .08,
    brightness: 1.05, saturation: 1.04, emissive: .38, shadowOpacity: .2,
    particle: 'motes', particleColor: '#efffd0', wind: .006, musicCutoff: 8200,
  },
  dusk: {
    mode: 'dusk', skyTop: '#4d3d79', skyBottom: '#dc876a', grade: '#a14d70', gradeOpacity: .32,
    brightness: .88, saturation: .96, emissive: .72, shadowOpacity: .34,
    particle: 'fireflies', particleColor: '#dff37d', wind: .018, musicCutoff: 4100,
  },
  night: {
    mode: 'night', skyTop: '#07152d', skyBottom: '#142844', grade: '#07182e', gradeOpacity: .34,
    brightness: .73, saturation: .82, emissive: 1, shadowOpacity: .48,
    particle: 'stars', particleColor: '#a7e8ef', wind: .012, musicCutoff: 2500,
  },
  sandstorm: {
    mode: 'sandstorm', skyTop: '#7a5b3a', skyBottom: '#c29b62', grade: '#8c633b', gradeOpacity: .42,
    brightness: .76, saturation: .58, emissive: .58, shadowOpacity: .2,
    particle: 'sand', particleColor: '#e2bd76', wind: .19, musicCutoff: 1050,
  },
}

export function unlockedAtmospheresForLabs(labs: LabFlags): AtmosphereMode[] {
  const unlocked: AtmosphereMode[] = ['night']
  if (labs.cv) unlocked.unshift('day')
  if (Object.values(labs).some(Boolean)) unlocked.splice(unlocked.includes('day') ? 1 : 0, 0, 'dusk')
  return unlocked
}

export function atmosphereAfterLabCompletion(current: AtmosphereMode, completedBefore: LabFlags, completedLab: LabId): AtmosphereMode {
  if (completedLab === 'cv') return 'day'
  if (!completedBefore.cv) return current === 'dusk' ? 'night' : 'dusk'
  if (current === 'day') return 'dusk'
  if (current === 'dusk') return 'night'
  return 'day'
}

export function isAtmosphereMode(value: unknown): value is AtmosphereMode {
  return value === 'day' || value === 'dusk' || value === 'night' || value === 'sandstorm'
}

export function isParticleQuality(value: unknown): value is ParticleQuality {
  return value === 'low' || value === 'medium' || value === 'high'
}

export function defaultParticleQuality(): ParticleQuality {
  if (typeof window === 'undefined') return 'medium'
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 900 ? 'low' : 'medium'
}

export const PARTICLE_COUNTS: Record<ParticleQuality, number> = { low: 12, medium: 24, high: 40 }
