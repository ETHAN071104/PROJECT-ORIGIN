import type { LabId } from '../game/types'

export interface LabDefinition {
  id: LabId
  shortName: string
  title: string
  mentor: string
  color: string
  roomClass: string
  learningTeaser: string
}

export const labs: Record<LabId, LabDefinition> = {
  cv: {
    id: 'cv',
    shortName: 'CV',
    title: 'Computer Vision',
    mentor: 'LENS-01',
    color: '#65d9e8',
    roomClass: 'lab-cv',
    learningTeaser: 'Teach a machine to notice what changes.',
  },
  ml: {
    id: 'ml',
    shortName: 'ML',
    title: 'Machine Learning',
    mentor: 'PROFESSOR PATTERN',
    color: '#9aa5ff',
    roomClass: 'lab-ml',
    learningTeaser: 'Find the rule hiding inside the examples.',
  },
  nlp: {
    id: 'nlp',
    shortName: 'NLP',
    title: 'Language Processing',
    mentor: 'LEXI-7',
    color: '#b88bd8',
    roomClass: 'lab-nlp',
    learningTeaser: 'Help a machine connect words with meaning.',
  },
}
