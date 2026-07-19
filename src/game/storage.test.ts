import { afterEach, describe, expect, it } from 'vitest'
import { emptySave, loadSave, SAVE_KEY } from './storage'

class MemoryStorage {
  private values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
  removeItem(key: string) { this.values.delete(key) }
  clear() { this.values.clear() }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  get length() { return this.values.size }
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, 'localStorage')
})

describe('Project Origin save migration', () => {
  it('adds safe DL defaults to an existing three-lab save without changing its progress', () => {
    const storage = new MemoryStorage()
    Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })
    storage.setItem(SAVE_KEY, JSON.stringify({
      playerName: 'ORI',
      introCompleted: true,
      completedLabs: { cv: true, ml: true, nlp: true },
      stageProgress: { cv: 4, ml: 4, nlp: 4 },
      achievements: ['MACHINES_FIRST_SIGHT', 'PATTERN_FINDER', 'LANGUAGE_DECODER', 'AI_AWAKENED'],
      audioEnabled: false,
    }))

    const migrated = loadSave()
    expect(migrated?.completedLabs).toEqual({ cv: true, ml: true, nlp: true, dl: false })
    expect(migrated?.stageProgress).toEqual({ cv: 4, ml: 4, nlp: 4, dl: 0 })
    expect(migrated?.audioEnabled).toBe(false)
    expect(migrated?.language).toBe('en')
    expect(migrated?.playerName).toBe('ORI')
    expect(migrated?.endingCompleted).toBe(false)
    expect(migrated?.worldProgress).toEqual({
      hallVisited: false,
      researchVisited: false,
      finalGateReached: false,
      readExhibitIds: [],
      lastMap: 'hub',
      lastSpawn: 'hub-default',
    })
  })

  it('creates new games with four incomplete lab records', () => {
    expect(emptySave().completedLabs).toEqual({ cv: false, ml: false, nlp: false, dl: false })
    expect(emptySave().stageProgress).toEqual({ cv: 0, ml: 0, nlp: 0, dl: 0 })
    expect(emptySave().endingCompleted).toBe(false)
    expect(emptySave().language).toBe('en')
    expect(emptySave().worldProgress.lastMap).toBe('hub')
  })

  it('preserves valid Hall and Research progress without changing completed labs', () => {
    const storage = new MemoryStorage()
    Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })
    storage.setItem(SAVE_KEY, JSON.stringify({
      playerName: 'ORI',
      introCompleted: true,
      completedLabs: { cv: true, ml: true, nlp: true, dl: true },
      stageProgress: { cv: 4, ml: 4, nlp: 4, dl: 4 },
      achievements: ['MACHINES_FIRST_SIGHT', 'PATTERN_FINDER', 'LANGUAGE_DECODER', 'NEURAL_CORE_ONLINE'],
      audioEnabled: true,
      worldProgress: {
        hallVisited: true,
        researchVisited: true,
        finalGateReached: true,
        readExhibitIds: ['cv-shakey-1966', 42, 'person-alan-turing'],
        lastMap: 'history',
        lastSpawn: 'history-from-research',
      },
    }))

    const migrated = loadSave()
    expect(migrated?.completedLabs).toEqual({ cv: true, ml: true, nlp: true, dl: true })
    expect(migrated?.worldProgress).toEqual({
      hallVisited: true,
      researchVisited: true,
      finalGateReached: true,
      readExhibitIds: ['cv-shakey-1966', 'person-alan-turing'],
      lastMap: 'history',
      lastSpawn: 'history-events-from-people',
    })
  })

  it('preserves the optional People branch before DL while keeping locked Research state safe', () => {
    const storage = new MemoryStorage()
    Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })
    storage.setItem(SAVE_KEY, JSON.stringify({
      playerName: 'ORI',
      introCompleted: true,
      completedLabs: { cv: true, ml: false, nlp: false, dl: false },
      stageProgress: { cv: 4, ml: 0, nlp: 0, dl: 0 },
      achievements: ['MACHINES_FIRST_SIGHT'],
      audioEnabled: true,
      worldProgress: {
        hallVisited: true,
        researchVisited: true,
        finalGateReached: true,
        readExhibitIds: ['person-alan-turing'],
        lastMap: 'people',
        lastSpawn: 'people-from-events',
      },
    }))

    const migrated = loadSave()
    expect(migrated?.worldProgress.lastMap).toBe('people')
    expect(migrated?.worldProgress.lastSpawn).toBe('people-from-events')
    expect(migrated?.worldProgress.hallVisited).toBe(true)
    expect(migrated?.worldProgress.researchVisited).toBe(false)
    expect(migrated?.worldProgress.finalGateReached).toBe(false)
    expect(migrated?.endingCompleted).toBe(false)
  })

  it('preserves a completed ending and its safe post-ending Research spawn', () => {
    const storage = new MemoryStorage()
    Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })
    storage.setItem(SAVE_KEY, JSON.stringify({
      playerName: 'ORI',
      introCompleted: true,
      completedLabs: { cv: true, ml: true, nlp: true, dl: true },
      stageProgress: { cv: 4, ml: 4, nlp: 4, dl: 4 },
      achievements: ['MACHINES_FIRST_SIGHT', 'PATTERN_FINDER', 'LANGUAGE_DECODER', 'NEURAL_CORE_ONLINE'],
      audioEnabled: true,
      endingCompleted: true,
      worldProgress: {
        hallVisited: true,
        researchVisited: true,
        finalGateReached: true,
        readExhibitIds: ['person-alan-turing'],
        lastMap: 'research',
        lastSpawn: 'research-from-ending',
      },
    }))

    const migrated = loadSave()
    expect(migrated?.endingCompleted).toBe(true)
    expect(migrated?.worldProgress.lastMap).toBe('research')
    expect(migrated?.worldProgress.lastSpawn).toBe('research-from-ending')
    expect(migrated?.achievements).toContain('NEURAL_CORE_ONLINE')
  })

  it('preserves Chinese and rejects unsupported saved language values', () => {
    const storage = new MemoryStorage()
    Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })
    const base = {
      playerName: 'ORI',
      introCompleted: true,
      completedLabs: { cv: false, ml: false, nlp: false, dl: false },
      stageProgress: { cv: 0, ml: 0, nlp: 0, dl: 0 },
      achievements: [],
      audioEnabled: true,
    }

    storage.setItem(SAVE_KEY, JSON.stringify({ ...base, language: 'zh-CN' }))
    expect(loadSave()?.language).toBe('zh-CN')

    storage.setItem(SAVE_KEY, JSON.stringify({ ...base, language: 'unsupported' }))
    expect(loadSave()?.language).toBe('en')
  })
})
