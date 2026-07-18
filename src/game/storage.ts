import type { SaveData } from './types'

export const SAVE_KEY = 'project-origin-save-v1'

export const emptySave = (audioEnabled = true): SaveData => ({
  playerName: '',
  introCompleted: false,
  completedLabs: { cv: false, ml: false, nlp: false },
  stageProgress: { cv: 0, ml: 0, nlp: 0 },
  achievements: [],
  audioEnabled,
})

export function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<SaveData>
    if (!parsed.completedLabs || !parsed.stageProgress) return null
    const save = {
      ...emptySave(parsed.audioEnabled ?? true),
      ...parsed,
      completedLabs: { ...emptySave().completedLabs, ...parsed.completedLabs },
      stageProgress: { ...emptySave().stageProgress, ...parsed.stageProgress },
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
    }
    save.stageProgress.cv = Math.max(0, Math.min(4, Number(save.stageProgress.cv) || 0))
    save.stageProgress.ml = Math.max(0, Number(save.stageProgress.ml) || 0)
    save.stageProgress.nlp = Math.max(0, Number(save.stageProgress.nlp) || 0)

    // Saves created by the former one-button CV placeholder resume after the
    // recorded stage instead of incorrectly skipping the new complete lab.
    if (save.completedLabs.cv && save.stageProgress.cv < 4 && !save.achievements.includes('MACHINES_FIRST_SIGHT')) {
      save.completedLabs.cv = false
    }
    return save
  } catch {
    return null
  }
}

export function persistSave(save: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save))
  } catch {
    // The game remains playable when storage is unavailable.
  }
}
