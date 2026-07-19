export type NlpStageNumber = 1 | 2 | 3 | 4

export interface TokenRound {
  id: string
  source: string
  pieces: string[]
  correctBoundaries: number[]
}

export interface PredictionChoice {
  word: string
  probability: number
}

export interface PredictionRound {
  id: string
  prompt: string
  choices: PredictionChoice[]
  correctWord: string
}

export interface SynonymPair {
  left: string
  right: string
}

export interface OrderingRound {
  id: string
  correct: string[]
  scrambled: string[]
}

export const NLP_STAGE_TITLES: Record<NlpStageNumber, string> = {
  1: 'Tokenization',
  2: 'Next Word Prediction',
  3: 'Similar Meanings',
  4: 'Transformer Archive',
}

export const NLP_HINTS: Record<NlpStageNumber, string> = {
  1: 'Words appreciate personal space. Punctuation is more complicated.',
  2: 'Bananas rarely open doors. Let the strongest context signal lead.',
  3: 'A synonym keeps the meaning close, even when the word changes clothes.',
  4: 'Follow the sentence structure first. Then ask which earlier word the pronoun points toward.',
}

export const NLP_EXPLANATIONS: Record<1 | 2 | 3, string> = {
  1: 'A tokenizer breaks text into smaller units called tokens so a language system can process them.',
  2: 'A language model estimates which token is most likely to come next from the context it has seen.',
  3: 'Words with related meanings can occupy nearby regions in a learned semantic space.',
}

export const NLP_LEARN_MORE: Record<1 | 2 | 3, string> = {
  1: 'There is no single universal tokenization. Different tokenizers may split punctuation, word pieces, or unfamiliar words in different ways.',
  2: 'These bars are a predefined teaching simulation, not a live model. Real systems compare probabilities across very large vocabularies.',
  3: 'Nearby words are related by usage, not guaranteed to be exact synonyms. Context can move a word toward different neighborhoods.',
}

export const TOKEN_ROUNDS: TokenRound[] = [
  { id: 'robots-learn', source: 'Robots can learn', pieces: ['Ro', 'bots', 'can', 'learn'], correctBoundaries: [1, 2] },
  { id: 'machines-patterns', source: 'Machines understand patterns', pieces: ['Ma', 'chines', 'under', 'stand', 'patterns'], correctBoundaries: [1, 3] },
  { id: 'hello-robot', source: 'Hello, robot!', pieces: ['Hel', 'lo', ',', 'ro', 'bot', '!'], correctBoundaries: [1, 2, 4] },
]

export const PREDICTION_ROUNDS: PredictionRound[] = [
  {
    id: 'opened', prompt: 'The robot opened ___', correctWord: 'door',
    choices: [{ word: 'door', probability: 82 }, { word: 'cloud', probability: 12 }, { word: 'banana', probability: 6 }],
  },
  {
    id: 'sunrise', prompt: 'The sun rose above ___', correctWord: 'horizon',
    choices: [{ word: 'horizon', probability: 76 }, { word: 'ceiling', probability: 16 }, { word: 'spoon', probability: 8 }],
  },
  {
    id: 'learning', prompt: 'Machines learn from ___', correctWord: 'examples',
    choices: [{ word: 'examples', probability: 88 }, { word: 'engines', probability: 8 }, { word: 'Tuesdays', probability: 4 }],
  },
]

export const SYNONYM_PAIRS: SynonymPair[] = [
  { left: 'Happy', right: 'Joyful' },
  { left: 'Large', right: 'Big' },
  { left: 'Quick', right: 'Fast' },
  { left: 'Begin', right: 'Start' },
]

export const SYNONYM_RIGHT_ORDER = ['Joyful', 'Start', 'Fast', 'Big']

export const ORDERING_ROUNDS: OrderingRound[] = [
  { id: 'door', correct: ['The', 'robot', 'opened', 'the', 'door'], scrambled: ['door', 'the', 'robot', 'The', 'opened'] },
  { id: 'prediction', correct: ['Language', 'models', 'predict', 'the', 'next', 'word'], scrambled: ['next', 'models', 'word', 'Language', 'the', 'predict'] },
  { id: 'context', correct: ['Context', 'helps', 'machines', 'interpret', 'meaning'], scrambled: ['meaning', 'machines', 'Context', 'interpret', 'helps'] },
]

export const ATTENTION_SENTENCE = ['The', 'robot', 'raised', 'a', 'hand', 'because', 'it', 'had', 'an', 'answer.']
export const ATTENTION_CHOICES = ['robot', 'hand', 'answer']
export const FINAL_TITLE = ['Attention', 'Is', 'All', 'You', 'Need']
export const FINAL_TITLE_ALTERNATE = ['All', 'You', 'Need', 'Is', 'Attention']
export const FINAL_TITLE_ORDERS = [FINAL_TITLE, FINAL_TITLE_ALTERNATE]
export const FINAL_TITLE_SCRAMBLED = ['All', 'Need', 'Attention', 'You', 'Is']

export function boundariesMatch(round: TokenRound, selected: number[]): boolean {
  const normalized = [...selected].sort((a, b) => a - b)
  return normalized.length === round.correctBoundaries.length
    && normalized.every((boundary, index) => boundary === round.correctBoundaries[index])
}

export function tokensFromBoundaries(round: TokenRound, boundaries: number[]): string[] {
  const boundarySet = new Set(boundaries)
  const tokens: string[] = []
  let current = ''
  round.pieces.forEach((piece, index) => {
    current += piece
    if (boundarySet.has(index) || index === round.pieces.length - 1) {
      tokens.push(current)
      current = ''
    }
  })
  return tokens
}

export function predictionIsLikely(round: PredictionRound, word: string): boolean {
  return word === round.correctWord
}

export function synonymMatches(left: string, right: string): boolean {
  return SYNONYM_PAIRS.some((pair) => pair.left === left && pair.right === right)
}

export function orderingMatches(order: string[], correct: string[]): boolean {
  return order.length === correct.length && order.every((word, index) => word === correct[index])
}

export function finalTitleMatches(order: string[]): boolean {
  return FINAL_TITLE_ORDERS.some((correct) => orderingMatches(order, correct))
}

export function moveWord(order: string[], from: number, offset: -1 | 1): string[] {
  const to = from + offset
  if (from < 0 || from >= order.length || to < 0 || to >= order.length) return order
  const next = [...order]
  ;[next[from], next[to]] = [next[to], next[from]]
  return next
}
