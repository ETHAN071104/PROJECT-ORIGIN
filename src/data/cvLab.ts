export type CvStageNumber = 1 | 2 | 3 | 4
export type ClassificationCategory = 'Living' | 'Machine' | 'Object'
export type VisionClass = 'Car' | 'Tree' | 'Street Lamp'

export interface PercentRect {
  x: number
  y: number
  width: number
  height: number
}

export interface ClassificationCard {
  id: 'cat' | 'car' | 'tree' | 'street-lamp' | 'robot' | 'apple'
  label: string
  category: ClassificationCategory
}

export interface VisionTarget {
  id: string
  label: string
  className: VisionClass
  rect: PercentRect
}

export interface DifferenceTarget {
  id: 'lamp' | 'car-detail' | 'tree-branch'
  label: string
  rect: PercentRect
}

export type BossRoundNumber = 1 | 2 | 3
export type BossObjectVariant = 'blue' | 'gold' | 'red' | 'round' | 'tall' | 'silver'

export interface BossObjectMotion {
  startOffsetX: number
  startOffsetY: number
  startScale: number
  startOpacity?: number
}

export interface BossSceneObject extends VisionTarget {
  variant: BossObjectVariant
  motion: BossObjectMotion
}

export interface BossSceneConfig {
  id: string
  title: string
  roadScrollStart: number
  observeDurationMs: number
  playerStartShift: number
  playerEndShift: number
  objects: BossSceneObject[]
}

export interface BossRoundConfig extends BossSceneConfig {
  round: BossRoundNumber
}

export interface BossObjectFrame {
  id: string
  translateX: number
  translateY: number
  scale: number
  opacity: number
}

export interface BossSceneFrame {
  elapsedMs: number
  roadOffset: number
  playerShift: number
  objects: BossObjectFrame[]
}

export const CV_STAGE_TITLES: Record<CvStageNumber, string> = {
  1: 'Image Classification',
  2: 'Spot the Difference',
  3: 'Object Location',
  4: 'Autonomous Driving',
}

export const CLASSIFICATION_CARDS: ClassificationCard[] = [
  { id: 'cat', label: 'Cat', category: 'Living' },
  { id: 'car', label: 'Car', category: 'Machine' },
  { id: 'tree', label: 'Tree', category: 'Living' },
  { id: 'street-lamp', label: 'Street Lamp', category: 'Object' },
  { id: 'robot', label: 'Robot', category: 'Machine' },
  { id: 'apple', label: 'Apple', category: 'Object' },
]

export const CLASSIFICATION_CATEGORIES: ClassificationCategory[] = ['Living', 'Machine', 'Object']

export const DIFFERENCE_TARGETS: DifferenceTarget[] = [
  { id: 'lamp', label: 'Missing street lamp', rect: { x: 60, y: 15, width: 15, height: 52 } },
  { id: 'car-detail', label: 'Changed car window', rect: { x: 40, y: 52, width: 23, height: 20 } },
  { id: 'tree-branch', label: 'Changed tree branch', rect: { x: 7, y: 17, width: 22, height: 43 } },
]

export const LOCATION_TARGETS: VisionTarget[] = [
  { id: 'car', label: 'Car', className: 'Car', rect: { x: 39, y: 54, width: 23, height: 21 } },
  { id: 'tree-left', label: 'Left tree', className: 'Tree', rect: { x: 6, y: 14, width: 25, height: 55 } },
  { id: 'tree-right', label: 'Right tree', className: 'Tree', rect: { x: 72, y: 15, width: 23, height: 54 } },
  { id: 'lamp-left', label: 'Left street lamp', className: 'Street Lamp', rect: { x: 27, y: 19, width: 14, height: 47 } },
  { id: 'lamp-right', label: 'Right street lamp', className: 'Street Lamp', rect: { x: 62, y: 18, width: 14, height: 48 } },
]

export const BOSS_ROUNDS: BossRoundConfig[] = [
  {
    id: 'city-entry',
    round: 1,
    title: 'City Entry',
    roadScrollStart: 8,
    observeDurationMs: 4600,
    playerStartShift: 8,
    playerEndShift: 0,
    objects: [
      { id: 'r1-car', label: 'Blue car ahead', className: 'Car', variant: 'blue', rect: { x: 43, y: 43, width: 15, height: 16 }, motion: { startOffsetX: 10, startOffsetY: -80, startScale: 0.62, startOpacity: 0.55 } },
      { id: 'r1-tree-left', label: 'Left round tree', className: 'Tree', variant: 'round', rect: { x: 4, y: 22, width: 17, height: 39 }, motion: { startOffsetX: 42, startOffsetY: -55, startScale: 0.7 } },
      { id: 'r1-tree-right', label: 'Right tall tree', className: 'Tree', variant: 'tall', rect: { x: 79, y: 17, width: 16, height: 43 }, motion: { startOffsetX: -38, startOffsetY: -62, startScale: 0.68 } },
      { id: 'r1-lamp-left', label: 'Left street lamp', className: 'Street Lamp', variant: 'silver', rect: { x: 23, y: 21, width: 9, height: 39 }, motion: { startOffsetX: 28, startOffsetY: -49, startScale: 0.72 } },
      { id: 'r1-lamp-right', label: 'Right street lamp', className: 'Street Lamp', variant: 'silver', rect: { x: 69, y: 18, width: 9, height: 40 }, motion: { startOffsetX: -27, startOffsetY: -53, startScale: 0.7 } },
    ],
  },
  {
    id: 'cross-town',
    round: 2,
    title: 'Cross Town',
    roadScrollStart: 31,
    observeDurationMs: 5000,
    playerStartShift: -10,
    playerEndShift: 5,
    objects: [
      { id: 'r2-car-near', label: 'Gold car ahead', className: 'Car', variant: 'gold', rect: { x: 51, y: 46, width: 17, height: 18 }, motion: { startOffsetX: -18, startOffsetY: -88, startScale: 0.58, startOpacity: 0.5 } },
      { id: 'r2-car-far', label: 'Red car in the far lane', className: 'Car', variant: 'red', rect: { x: 37, y: 33, width: 12, height: 13 }, motion: { startOffsetX: 15, startOffsetY: -62, startScale: 0.68, startOpacity: 0.58 } },
      { id: 'r2-tree-left', label: 'Left tall tree', className: 'Tree', variant: 'tall', rect: { x: 6, y: 15, width: 16, height: 45 }, motion: { startOffsetX: 46, startOffsetY: -65, startScale: 0.66 } },
      { id: 'r2-tree-right', label: 'Right round tree', className: 'Tree', variant: 'round', rect: { x: 81, y: 24, width: 15, height: 36 }, motion: { startOffsetX: -43, startOffsetY: -48, startScale: 0.72 } },
      { id: 'r2-lamp-right', label: 'Right street lamp', className: 'Street Lamp', variant: 'silver', rect: { x: 72, y: 15, width: 9, height: 42 }, motion: { startOffsetX: -31, startOffsetY: -59, startScale: 0.68 } },
    ],
  },
  {
    id: 'academy-avenue',
    round: 3,
    title: 'Academy Avenue',
    roadScrollStart: 53,
    observeDurationMs: 5200,
    playerStartShift: 12,
    playerEndShift: -4,
    objects: [
      { id: 'r3-car', label: 'Red car ahead', className: 'Car', variant: 'red', rect: { x: 40, y: 40, width: 16, height: 17 }, motion: { startOffsetX: 17, startOffsetY: -84, startScale: 0.6, startOpacity: 0.52 } },
      { id: 'r3-tree-left', label: 'Left round tree', className: 'Tree', variant: 'round', rect: { x: 3, y: 18, width: 18, height: 42 }, motion: { startOffsetX: 43, startOffsetY: -62, startScale: 0.68 } },
      { id: 'r3-tree-right', label: 'Right round tree', className: 'Tree', variant: 'round', rect: { x: 80, y: 20, width: 17, height: 40 }, motion: { startOffsetX: -42, startOffsetY: -57, startScale: 0.69 } },
      { id: 'r3-lamp-left', label: 'Left street lamp', className: 'Street Lamp', variant: 'silver', rect: { x: 24, y: 14, width: 9, height: 43 }, motion: { startOffsetX: 30, startOffsetY: -61, startScale: 0.67 } },
      { id: 'r3-lamp-right', label: 'Right street lamp', className: 'Street Lamp', variant: 'silver', rect: { x: 67, y: 22, width: 9, height: 38 }, motion: { startOffsetX: -27, startOffsetY: -48, startScale: 0.72 } },
    ],
  },
]

export const BOSS_FINAL_REPLAY: BossSceneConfig = {
  id: 'trained-replay',
  title: 'Trained Replay',
  roadScrollStart: 19,
  observeDurationMs: 5600,
  playerStartShift: 0,
  playerEndShift: 0,
  objects: [
    { id: 'replay-car', label: 'Car detected', className: 'Car', variant: 'gold', rect: { x: 43, y: 43, width: 17, height: 18 }, motion: { startOffsetX: 8, startOffsetY: -92, startScale: 0.56, startOpacity: 0.5 } },
    { id: 'replay-tree-left', label: 'Tree detected', className: 'Tree', variant: 'tall', rect: { x: 4, y: 17, width: 17, height: 44 }, motion: { startOffsetX: 44, startOffsetY: -63, startScale: 0.66 } },
    { id: 'replay-tree-right', label: 'Tree detected', className: 'Tree', variant: 'round', rect: { x: 80, y: 22, width: 16, height: 38 }, motion: { startOffsetX: -42, startOffsetY: -54, startScale: 0.7 } },
    { id: 'replay-lamp-left', label: 'Street lamp detected', className: 'Street Lamp', variant: 'silver', rect: { x: 24, y: 16, width: 9, height: 42 }, motion: { startOffsetX: 29, startOffsetY: -59, startScale: 0.68 } },
    { id: 'replay-lamp-right', label: 'Street lamp detected', className: 'Street Lamp', variant: 'silver', rect: { x: 69, y: 18, width: 9, height: 41 }, motion: { startOffsetX: -29, startOffsetY: -55, startScale: 0.69 } },
  ],
}

export const CV_HINTS: Record<CvStageNumber, string> = {
  1: 'That apple has many talents. Driving is not one of them.',
  2: 'Try looking for details, not existential meaning.',
  3: 'The road is not a tree. I checked twice.',
  4: 'Freeze the road, select a class, then tap the matching object. Four labels will pass.',
}

export const CV_EXPLANATIONS: Record<CvStageNumber, string> = {
  1: 'You grouped complete images into categories. This is image classification.',
  2: 'You searched for visual features: small details that distinguish one image from another.',
  3: 'You identified both what an object is and where it appears. This is object detection.',
  4: 'Autonomous systems must recognize important objects before they can react to them.',
}

export const CV_LEARN_MORE: Partial<Record<CvStageNumber, string>> = {
  1: 'A model learns visual patterns from labeled examples and predicts which category a new image belongs to.',
  3: 'Object detection predicts a category and a location for each relevant object.',
}

export function classificationIsCorrect(cardId: ClassificationCard['id'], category: ClassificationCategory): boolean {
  return CLASSIFICATION_CARDS.find((card) => card.id === cardId)?.category === category
}

export function targetMatchesSelection(target: VisionTarget, selection: VisionClass | null): boolean {
  return selection !== null && target.className === selection
}

export function pointInPercentRect(x: number, y: number, rect: PercentRect): boolean {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

function easeOutCubic(value: number) {
  return 1 - (1 - value) ** 3
}

export function calculateBossFrame(config: BossSceneConfig, elapsedMs: number): BossSceneFrame {
  const safeElapsed = Math.max(0, elapsedMs)
  const progress = easeOutCubic(clamp01(safeElapsed / config.observeDurationMs))
  const roadOffset = (config.roadScrollStart + safeElapsed * 0.07) % 64
  const playerShift = config.playerStartShift + (config.playerEndShift - config.playerStartShift) * progress

  return {
    elapsedMs: safeElapsed,
    roadOffset,
    playerShift,
    objects: config.objects.map((object) => ({
      id: object.id,
      translateX: object.motion.startOffsetX * (1 - progress),
      translateY: object.motion.startOffsetY * (1 - progress),
      scale: object.motion.startScale + (1 - object.motion.startScale) * progress,
      opacity: (object.motion.startOpacity ?? 0.64) + (1 - (object.motion.startOpacity ?? 0.64)) * progress,
    })),
  }
}

export function calculateBossReplayFrame(config: BossSceneConfig, elapsedMs: number): BossSceneFrame {
  const frame = calculateBossFrame(config, elapsedMs)
  const progress = clamp01(elapsedMs / config.observeDurationMs)
  const moveLeft = easeOutCubic(clamp01((progress - 0.28) / 0.22))
  const returnToLane = easeOutCubic(clamp01((progress - 0.72) / 0.24))
  frame.playerShift = -72 * moveLeft + 72 * returnToLane
  return frame
}

export function calculateBossScore(targets: readonly VisionTarget[], foundTargetIds: Iterable<string>) {
  const found = new Set(foundTargetIds)
  const correct = targets.filter((target) => found.has(target.id)).length
  const missed = targets.length - correct
  const accuracy = targets.length === 0 ? 0 : Math.round((correct / targets.length) * 100)
  return { correct, missed, accuracy, passed: accuracy >= 80 }
}
