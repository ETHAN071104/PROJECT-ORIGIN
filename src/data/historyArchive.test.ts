import { describe, expect, it } from 'vitest'
import { HALL_TIMELINE_ENTRIES, LAB_HISTORY_EXHIBITS, MODERN_BUILDERS, PEOPLE_OF_AI } from './historyArchive'

describe('Hall of Origins archive data', () => {
  it('provides exactly two optional exhibits for each foundational lab', () => {
    const exhibits = Object.values(LAB_HISTORY_EXHIBITS).flat()
    expect(exhibits).toHaveLength(8)
    expect(new Set(exhibits.map((entry) => entry.id)).size).toBe(8)
    expect(exhibits.every((entry) => entry.shortText.length > 0 && entry.longText)).toBe(true)
  })

  it('keeps the Hall timeline concise, chronological, and uniquely addressable', () => {
    expect(HALL_TIMELINE_ENTRIES).toHaveLength(11)
    expect(new Set(HALL_TIMELINE_ENTRIES.map((entry) => entry.id)).size).toBe(11)
    expect(HALL_TIMELINE_ENTRIES.map((entry) => Number(entry.year))).toEqual(
      [...HALL_TIMELINE_ENTRIES].map((entry) => Number(entry.year)).sort((a, b) => a - b),
    )
  })

  it('includes eight primary contributors and a community-framed Modern Builders display', () => {
    expect(PEOPLE_OF_AI).toHaveLength(8)
    expect(MODERN_BUILDERS.map((entry) => entry.name)).toEqual(['JENSEN HUANG', 'SAM ALTMAN', 'DARIO AMODEI'])
  })

  it('describes 1986 as popularization without claiming backpropagation was first invented then', () => {
    const backpropagation = LAB_HISTORY_EXHIBITS.dl[0]
    expect(backpropagation.title).toBe('BACKPROPAGATION POPULARIZED')
    expect(`${backpropagation.shortText} ${backpropagation.longText}`.toLowerCase()).not.toContain('invented')
  })
})
