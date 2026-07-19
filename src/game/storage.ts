import type { SaveData } from './types'

export const SAVE_KEY = 'project-origin-save-v1'

export const emptySave = (audioEnabled = true, language: SaveData['language'] = 'en'): SaveData => ({
  playerName: '',
  introCompleted: false,
  completedLabs: { cv: false, ml: false, nlp: false, dl: false },
  stageProgress: { cv: 0, ml: 0, nlp: 0, dl: 0 },
  achievements: [],
  audioEnabled,
  language,
  endingCompleted: false,
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
      language: parsed.language === 'zh-CN' ? 'zh-CN' as const : 'en' as const,
      endingCompleted: parsed.endingCompleted === true,
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
    if (!['hub', 'history', 'people', 'research'].includes(save.worldProgress.lastMap)) {
      save.worldProgress.lastMap = 'hub'
      save.worldProgress.lastSpawn = 'hub-default'
    }
    // Migrate the former Hub -> Hall -> Research corridor spawns into the new
    // Hub-centered branches without discarding completed Labs or read records.
    const legacySpawn = save.worldProgress.lastSpawn as string
    if (legacySpawn === 'hub-from-east-gate') save.worldProgress.lastSpawn = 'hub-from-research'
    if (legacySpawn === 'history-from-academy') save.worldProgress.lastSpawn = 'history-events-from-hub'
    if (legacySpawn === 'history-from-research') save.worldProgress.lastSpawn = 'history-events-from-people'
    if (legacySpawn === 'research-from-history') save.worldProgress.lastSpawn = 'research-from-hub'
    if (save.worldProgress.lastMap === 'hub' && ![
      'hub-default', 'hub-from-cv', 'hub-from-ml', 'hub-from-nlp', 'hub-from-dl', 'hub-from-history', 'hub-from-research',
    ].includes(save.worldProgress.lastSpawn)) save.worldProgress.lastSpawn = 'hub-default'
    if (save.worldProgress.lastMap === 'history' && ![
      'history-events-from-hub', 'history-events-from-people',
    ].includes(save.worldProgress.lastSpawn)) save.worldProgress.lastSpawn = 'history-events-from-hub'
    if (save.worldProgress.lastMap === 'people') save.worldProgress.lastSpawn = 'people-from-events'
    if (save.worldProgress.lastMap === 'research' && ![
      'research-from-hub', 'research-from-ending',
    ].includes(save.worldProgress.lastSpawn)) save.worldProgress.lastSpawn = 'research-from-hub'
    if (!(save.completedLabs.cv && save.completedLabs.ml && save.completedLabs.nlp && save.completedLabs.dl)) {
      save.worldProgress.researchVisited = false
      save.worldProgress.finalGateReached = false
      save.endingCompleted = false
      if (save.worldProgress.lastMap === 'research') {
        save.worldProgress.lastMap = 'hub'
        save.worldProgress.lastSpawn = 'hub-default'
      }
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
