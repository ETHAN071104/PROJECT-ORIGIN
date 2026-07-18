export type MlStageNumber = 1 | 2 | 3 | 4
export type MlCategory = 'Animal' | 'Vehicle' | 'Fruit'
export type MlExampleId = 'cat' | 'bird' | 'car' | 'bicycle' | 'apple' | 'banana' | 'pear'

export interface MlExample {
  id: MlExampleId
  label: string
  category: MlCategory
}

export interface BoundaryPoint {
  id: string
  x: number
  y: number
  group: 'blue' | 'orange'
}

export interface BoundaryResultPoint extends BoundaryPoint {
  predicted: 'blue' | 'orange'
  correct: boolean
}

export type ProductFeature = 'crackedScreen' | 'missingPanel' | 'wrongLight' | 'bentAntenna' | 'missingWheel'

export interface FactoryProduct {
  id: string
  name: string
  serial: string
  crackedScreen?: boolean
  missingPanel?: boolean
  wrongLight?: boolean
  bentAntenna?: boolean
  missingWheel?: boolean
}

export interface FeatureChallenge {
  id: string
  product: FactoryProduct
  question: string
  feature: ProductFeature
  answer: boolean
}

export interface PredictionProduct extends FactoryProduct {
  simulatedPrediction: 'Normal' | 'Defective'
  uncertain?: boolean
}

export const ML_STAGE_TITLES: Record<MlStageNumber, string> = {
  1: 'Supervised Learning',
  2: 'Decision Boundary',
  3: 'Cat Feature Decision Tree',
  4: 'Factory Quality Inspection',
}

export const ML_HINTS: Record<MlStageNumber, string> = {
  1: 'The banana has poor road performance. Categorize accordingly.',
  2: 'The dots are forming teams. Your line is confusing everyone.',
  3: 'I have studied many cats. Wheels remain statistically unusual.',
  4: 'Inspect the obvious parts. The factory has not mastered subtlety.',
}

export const ML_EXPLANATIONS: Record<1 | 2 | 3, string> = {
  1: 'You learned from examples that already included the correct answers. This is supervised learning.',
  2: 'The line separates different groups of data. This is a decision boundary.',
  3: 'A decision tree makes a prediction by following a sequence of questions.',
}

export const ML_LEARN_MORE: Record<1 | 2 | 3, string> = {
  1: 'The training data contains inputs and labels. A model searches for patterns that connect them.',
  2: 'Models use learned boundaries to decide which category a new data point belongs to.',
  3: 'Each branch tests a feature. The final path leads to a predicted category.',
}

export const ML_TRAINING_EXAMPLES: MlExample[] = [
  { id: 'cat', label: 'Cat', category: 'Animal' },
  { id: 'bird', label: 'Bird', category: 'Animal' },
  { id: 'car', label: 'Car', category: 'Vehicle' },
  { id: 'bicycle', label: 'Bicycle', category: 'Vehicle' },
  { id: 'apple', label: 'Apple', category: 'Fruit' },
  { id: 'banana', label: 'Banana', category: 'Fruit' },
]

export const ML_PREDICTION_EXAMPLE: MlExample = { id: 'pear', label: 'Pear', category: 'Fruit' }
export const ML_CATEGORIES: MlCategory[] = ['Animal', 'Vehicle', 'Fruit']

export const BOUNDARY_POINTS: BoundaryPoint[] = [
  { id: 'b1', x: 18, y: 21, group: 'blue' },
  { id: 'b2', x: 29, y: 32, group: 'blue' },
  { id: 'b3', x: 34, y: 48, group: 'blue' },
  { id: 'b4', x: 27, y: 66, group: 'blue' },
  { id: 'b5', x: 20, y: 79, group: 'blue' },
  { id: 'o1', x: 68, y: 18, group: 'orange' },
  { id: 'o2', x: 76, y: 34, group: 'orange' },
  { id: 'o3', x: 64, y: 49, group: 'orange' },
  { id: 'o4', x: 74, y: 66, group: 'orange' },
  { id: 'o5', x: 65, y: 81, group: 'orange' },
]

export const CAT_QUESTIONS = [
  { id: 'fur', question: 'Does it have fur?', answer: true },
  { id: 'legs', question: 'Does it have four legs?', answer: true },
  { id: 'whiskers', question: 'Does it have whiskers?', answer: true },
  { id: 'wheels', question: 'Does it have wheels?', answer: false },
  { id: 'leaves', question: 'Does it have leaves?', answer: false },
] as const

export const TRAINING_PRODUCTS: FactoryProduct[] = [
  { id: 'train-1', name: 'Sweep Unit A', serial: 'PX-104' },
  { id: 'train-2', name: 'Sweep Unit B', serial: 'PX-118', crackedScreen: true },
  { id: 'train-3', name: 'Home Unit A', serial: 'PX-203' },
  { id: 'train-4', name: 'Home Unit B', serial: 'PX-219', missingPanel: true },
  { id: 'train-5', name: 'Service Unit A', serial: 'PX-301', wrongLight: true },
  { id: 'train-6', name: 'Service Unit B', serial: 'PX-322', bentAntenna: true },
]

export const FEATURE_CHALLENGES: FeatureChallenge[] = [
  {
    id: 'feature-panel',
    product: { id: 'feature-1', name: 'Panel Check', serial: 'PX-410', missingPanel: true },
    question: 'Is a side panel missing?',
    feature: 'missingPanel',
    answer: true,
  },
  {
    id: 'feature-screen',
    product: { id: 'feature-2', name: 'Screen Check', serial: 'PX-424' },
    question: 'Is the screen cracked?',
    feature: 'crackedScreen',
    answer: false,
  },
  {
    id: 'feature-light',
    product: { id: 'feature-3', name: 'Light Check', serial: 'OR-1G1N', wrongLight: true },
    question: 'Is the status light incorrect?',
    feature: 'wrongLight',
    answer: true,
  },
]

export const PREDICTION_PRODUCTS: PredictionProduct[] = [
  { id: 'predict-1', name: 'Fresh Unit A', serial: 'PX-501', simulatedPrediction: 'Normal' },
  { id: 'predict-2', name: 'Fresh Unit B', serial: 'PX-518', missingWheel: true, simulatedPrediction: 'Normal', uncertain: true },
  { id: 'predict-3', name: 'Fresh Unit C', serial: 'PX-527', crackedScreen: true, simulatedPrediction: 'Defective' },
  { id: 'predict-4', name: 'Fresh Unit D', serial: 'PX-536', simulatedPrediction: 'Normal' },
]

export function mlExampleMatches(id: MlExampleId, category: MlCategory): boolean {
  const example = [...ML_TRAINING_EXAMPLES, ML_PREDICTION_EXAMPLE].find((item) => item.id === id)
  return example?.category === category
}

export function calculateBoundaryAccuracy(centerX: number, angle: number) {
  const slope = Math.tan((angle * Math.PI) / 180)
  const points: BoundaryResultPoint[] = BOUNDARY_POINTS.map((point) => {
    const boundaryX = centerX - slope * (point.y - 50)
    const predicted = point.x < boundaryX ? 'blue' : 'orange'
    return { ...point, predicted, correct: predicted === point.group }
  })
  const correct = points.filter((point) => point.correct).length
  return { accuracy: Math.round((correct / points.length) * 100), points, passed: correct / points.length >= 0.9 }
}

export function productIsDefective(product: FactoryProduct): boolean {
  return Boolean(product.crackedScreen || product.missingPanel || product.wrongLight || product.bentAntenna || product.missingWheel)
}

export function productLabel(product: FactoryProduct): 'Normal' | 'Defective' {
  return productIsDefective(product) ? 'Defective' : 'Normal'
}
