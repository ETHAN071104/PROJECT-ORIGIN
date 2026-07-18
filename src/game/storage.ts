import type { SaveData } from './types'

export const SAVE_KEY = 'project-origin-save-v1'

export const emptySave = (audioEnabled = true): SaveData => ({
  playerName: '',
  introCompleted: false,
  completedLabs: { cv: false, ml: false, nlp: false, dl: false },
  stageProgress: { cv: 0, ml: 0, nlp: 0, dl: 0 },
  achievements: [],
  audioEnabled,
  worldProgress: {
    hallVisited: false,
    researchVisited: false,
    finalGateReached: false,
    readExhibitIds: [],
    lastMap: 'hub',
    lastSpawn: 'hub-default',
  },
})

export function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<SaveData>
    if (!parsed.completedLabs || !parsed.stageProgress) return null
    const parsedWorld = parsed.worldProgress && typeof parsed.worldProgress === 'object'
      ? parsed.worldProgress
      : undefined
    const save = {
      ...emptySave(parsed.audioEnabled ?? true),
      ...parsed,
      completedLabs: { ...emptySave().completedLabs, ...parsed.completedLabs },
      stageProgress: { ...emptySave().stageProgress, ...parsed.stageProgress },
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
      worldProgress: {
        ...emptySave().worldProgress,
        ...parsedWorld,
        readExhibitIds: Array.isArray(parsedWorld?.readExhibitIds)
          ? parsedWorld.readExhibitIds.filter((id): id is string => typeof id === 'string')
          : [],
      },
    }
    save.stageProgress.cv = Math.max(0, Math.min(4, Number(save.stageProgress.cv) || 0))
    save.stageProgress.ml = Math.max(0, Math.min(4, Number(save.stageProgress.ml) || 0))
    save.stageProgress.nlp = Math.max(0, Math.min(4, Number(save.stageProgress.nlp) || 0))
    save.stageProgress.dl = Math.max(0, Math.min(4, Number(save.stageProgress.dl) || 0))

    // Saves created by the former one-button CV placeholder resume after the
    // recorded stage instead of incorrectly skipping the new complete lab.
    if (save.completedLabs.cv && save.stageProgress.cv < 4 && !save.achievements.includes('MACHINES_FIRST_SIGHT')) {
      save.completedLabs.cv = false
    }
    // The former ML placeholder marked the lab complete at stage 1. Those
    // saves resume the real lab from its first activity instead of skipping it.
    if (save.completedLabs.ml && !save.achievements.includes('PATTERN_FINDER')) {
      save.completedLabs.ml = false
      save.stageProgress.ml = 0
    }
    // The former NLP placeholder used the generic lab-complete marker. Resume
    // those saves at the real language curriculum instead of skipping it.
    if (save.completedLabs.nlp && !save.achievements.includes('LANGUAGE_DECODER')) {
      save.completedLabs.nlp = false
      save.stageProgress.nlp = 0
    }
    if (!['hub', 'history', 'research'].includes(save.worldProgress.lastMap)) {
      save.worldProgress.lastMap = 'hub'
      save.worldProgress.lastSpawn = 'hub-default'
    }
    if (save.worldProgress.lastMap === 'hub' && ![
      'hub-default', 'hub-from-cv', 'hub-from-ml', 'hub-from-nlp', 'hub-from-dl', 'hub-from-east-gate', 'hub-from-history',
    ].includes(save.worldProgress.lastSpawn)) save.worldProgress.lastSpawn = 'hub-default'
    if (save.worldProgress.lastMap === 'history' && ![
      'history-from-academy', 'history-from-research',
    ].includes(save.worldProgress.lastSpawn)) save.worldProgress.lastSpawn = 'history-from-academy'
    if (save.worldProgress.lastMap === 'research') save.worldProgress.lastSpawn = 'research-from-history'
    if (!(save.completedLabs.cv && save.completedLabs.ml && save.completedLabs.nlp && save.completedLabs.dl)) {
      save.worldProgress.hallVisited = false
      save.worldProgress.researchVisited = false
      save.worldProgress.finalGateReached = false
      save.worldProgress.lastMap = 'hub'
      save.worldProgress.lastSpawn = 'hub-default'
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
