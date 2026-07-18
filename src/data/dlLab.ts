export type DlStageNumber = 1 | 2 | 3 | 4

export const DL_STAGE_TITLES: Record<DlStageNumber, string> = {
  1: 'Neural Path',
  2: 'Power the Network',
  3: 'Tune the Neuron',
  4: 'Gradient Descent Core',
}

export const DL_HINTS: Record<DlStageNumber, string> = {
  1: 'Begin on a matching port. Every step must touch the previous cell, and two signals may never share a cell.',
  2: 'Trace every choice from left to right. The strongest route keeps useful signal instead of shrinking it early.',
  3: 'Turn slowly near the clearest image. Low interference means the neuron is close to its useful setting.',
  4: 'A useful learning rate lowers loss steadily. A good start also matters when a curve has more than one valley.',
}

export const DL_EXPLANATIONS: Record<1 | 2 | 3, string> = {
  1: 'Artificial neurons become useful as a network: information follows connections through multiple layers.',
  2: 'Each layer transforms the signal it receives. A strong path preserves and combines useful information.',
  3: 'Training tunes parameters so a neuron responds more clearly to a useful pattern.',
}

export const DL_LEARN_MORE: Record<1 | 2 | 3, string> = {
  1: 'Real neural networks contain many weighted connections. This grid is a spatial analogy for connectivity, not a literal circuit diagram.',
  2: 'Real networks learn weights from data. These visible multipliers are a simplified analogy that makes layer-by-layer transformations inspectable.',
  3: 'A parameter is a learned number inside a model. This dial represents tuning one parameter while observing how the output changes.',
}

export interface GridCell {
  row: number
  col: number
}

export type PathColor = 'cyan' | 'violet' | 'white' | 'gold'

export interface NeuralPair {
  color: PathColor
  start: GridCell
  end: GridCell
}

export interface NeuralPathRound {
  id: string
  size: number
  pairs: NeuralPair[]
  solution: Record<PathColor, GridCell[]>
}

const cells = (...coords: Array<[number, number]>): GridCell[] => coords.map(([row, col]) => ({ row, col }))

export const NEURAL_PATH_ROUNDS: NeuralPathRound[] = [
  {
    id: 'input-bridge',
    size: 5,
    pairs: [
      { color: 'cyan', start: { row: 0, col: 0 }, end: { row: 0, col: 4 } },
      { color: 'violet', start: { row: 2, col: 0 }, end: { row: 4, col: 2 } },
    ],
    solution: {
      cyan: cells([0, 0], [0, 1], [0, 2], [0, 3], [0, 4]),
      violet: cells([2, 0], [2, 1], [2, 2], [3, 2], [4, 2]),
      white: [], gold: [],
    },
  },
  {
    id: 'hidden-layer',
    size: 6,
    pairs: [
      { color: 'cyan', start: { row: 0, col: 0 }, end: { row: 0, col: 5 } },
      { color: 'violet', start: { row: 2, col: 0 }, end: { row: 5, col: 2 } },
      { color: 'white', start: { row: 2, col: 5 }, end: { row: 5, col: 4 } },
    ],
    solution: {
      cyan: cells([0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5]),
      violet: cells([2, 0], [2, 1], [2, 2], [3, 2], [4, 2], [5, 2]),
      white: cells([2, 5], [3, 5], [4, 5], [5, 5], [5, 4]),
      gold: [],
    },
  },
  {
    id: 'deep-stack',
    size: 6,
    pairs: [
      { color: 'cyan', start: { row: 0, col: 0 }, end: { row: 1, col: 5 } },
      { color: 'violet', start: { row: 2, col: 0 }, end: { row: 3, col: 5 } },
      { color: 'white', start: { row: 4, col: 0 }, end: { row: 4, col: 5 } },
      { color: 'gold', start: { row: 5, col: 0 }, end: { row: 5, col: 5 } },
    ],
    solution: {
      cyan: cells([0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 5]),
      violet: cells([2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [3, 5]),
      white: cells([4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5]),
      gold: cells([5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5]),
    },
  },
]

export const cellKey = (cell: GridCell) => `${cell.row}:${cell.col}`

function sameCell(a: GridCell | undefined, b: GridCell) {
  return Boolean(a && a.row === b.row && a.col === b.col)
}

export function isOrthogonalStep(a: GridCell, b: GridCell) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1
}

export function validateNeuralPaths(round: NeuralPathRound, paths: Partial<Record<PathColor, GridCell[]>>) {
  const occupied = new Set<string>()
  for (const pair of round.pairs) {
    const path = paths[pair.color] ?? []
    const connects = (sameCell(path[0], pair.start) && sameCell(path.at(-1), pair.end))
      || (sameCell(path[0], pair.end) && sameCell(path.at(-1), pair.start))
    if (!connects) return false
    for (let index = 0; index < path.length; index += 1) {
      if (path[index].row < 0 || path[index].row >= round.size || path[index].col < 0 || path[index].col >= round.size) return false
      const key = cellKey(path[index])
      if (occupied.has(key) || (index > 0 && !isOrthogonalStep(path[index - 1], path[index]))) return false
      occupied.add(key)
    }
  }
  return true
}

export interface NetworkChoice {
  id: string
  label: string
  gain: number
  bias: number
}

export interface PowerRound {
  id: string
  input: number
  target: number
  layers: NetworkChoice[][]
}

export const POWER_ROUNDS: PowerRound[] = [
  {
    id: 'two-layer-relay', input: 2, target: 8,
    layers: [
      [{ id: 'l1-a', label: 'Pass ×1', gain: 1, bias: 0 }, { id: 'l1-b', label: 'Amplify ×2', gain: 2, bias: 0 }],
      [{ id: 'l2-a', label: 'Filter ×0.5', gain: .5, bias: 0 }, { id: 'l2-b', label: 'Relay ×1.5', gain: 1.5, bias: 0 }],
      [{ id: 'l3-a', label: 'Linear ×1', gain: 1, bias: 0 }, { id: 'l3-b', label: 'Focus +2', gain: 1, bias: 2 }],
    ],
  },
  {
    id: 'feature-stack', input: 3, target: 14,
    layers: [
      [{ id: 'r2-l1-a', label: 'Compress ×0.8', gain: .8, bias: 0 }, { id: 'r2-l1-b', label: 'Extract ×1.5 +1', gain: 1.5, bias: 1 }],
      [{ id: 'r2-l2-a', label: 'Gate ×0.5', gain: .5, bias: 0 }, { id: 'r2-l2-b', label: 'Combine ×2', gain: 2, bias: 0 }],
      [{ id: 'r2-l3-a', label: 'Output ×0.7', gain: .7, bias: 0 }, { id: 'r2-l3-b', label: 'Output +3', gain: 1, bias: 3 }],
    ],
  },
  {
    id: 'deep-signal', input: 1, target: 12.5,
    layers: [
      [{ id: 'r3-l1-a', label: 'Skip ×1', gain: 1, bias: 0 }, { id: 'r3-l1-b', label: 'Detect ×3', gain: 3, bias: 0 }],
      [{ id: 'r3-l2-a', label: 'Drop ×0.5', gain: .5, bias: 0 }, { id: 'r3-l2-b', label: 'Learn ×2 +1', gain: 2, bias: 1 }],
      [{ id: 'r3-l3-a', label: 'Clamp ×0.8', gain: .8, bias: 0 }, { id: 'r3-l3-b', label: 'Represent ×1.5', gain: 1.5, bias: 0 }],
      [{ id: 'r3-l4-a', label: 'Quiet ×0.6', gain: .6, bias: 0 }, { id: 'r3-l4-b', label: 'Readout +2', gain: 1, bias: 2 }],
    ],
  },
]

export function calculateNetworkSignal(round: PowerRound, selectedIds: string[]) {
  let value = round.input
  const values = [value]
  for (let layerIndex = 0; layerIndex < round.layers.length; layerIndex += 1) {
    const choice = round.layers[layerIndex].find((item) => item.id === selectedIds[layerIndex])
    if (!choice) return { value, values, complete: false }
    value = value * choice.gain + choice.bias
    values.push(value)
  }
  return { value, values, complete: true }
}

export function isMaximumSignal(round: PowerRound, selectedIds: string[]) {
  const result = calculateNetworkSignal(round, selectedIds)
  return result.complete && Math.abs(result.value - round.target) < .0001
}

export interface TuningRound {
  id: string
  hiddenNumber: '3' | '67' | '2012'
  targetAngle: number
  tolerance: number
  seed: number
}

export const TUNING_ROUNDS: TuningRound[] = [
  { id: 'single-feature', hiddenNumber: '3', targetAngle: 52, tolerance: 10, seed: 3 },
  { id: 'paired-feature', hiddenNumber: '67', targetAngle: 217, tolerance: 8, seed: 67 },
  { id: 'archive-feature', hiddenNumber: '2012', targetAngle: 316, tolerance: 6, seed: 12 },
]

export function circularAngleDistance(angle: number, target: number) {
  const difference = Math.abs(((angle - target + 540) % 360) - 180)
  return difference
}

export function interferenceQuality(round: TuningRound, angle: number) {
  return Math.max(0, 1 - circularAngleDistance(angle, round.targetAngle) / 90)
}

export type BossOutcome = 'overshot' | 'too slow' | 'unstable' | 'converged' | 'local minimum'
export type LossKind = 'quadratic' | 'narrow' | 'double-well'

export interface BossStart {
  id: string
  label: string
  x: number
}

export interface BossRound {
  id: string
  title: string
  lossKind: LossKind
  learningRates: number[]
  starts: BossStart[]
  steps: number
  targetLoss: number
  xRange: [number, number]
}

export const BOSS_ROUNDS: BossRound[] = [
  {
    id: 'steady-slope', title: 'Find a steady step', lossKind: 'quadratic', learningRates: [.05, .25, 1.1],
    starts: [{ id: 'default', label: 'Start A', x: 4 }], steps: 12, targetLoss: .12, xRange: [-5, 5],
  },
  {
    id: 'narrow-valley', title: 'Control a narrow valley', lossKind: 'narrow', learningRates: [.03, .15, .45, .7],
    starts: [{ id: 'default', label: 'Start B', x: 3.5 }], steps: 16, targetLoss: .12, xRange: [-4.5, 4.5],
  },
  {
    id: 'two-valleys', title: 'Choose a start and a rate', lossKind: 'double-well', learningRates: [.002, .02, .12],
    starts: [{ id: 'left', label: 'Left ridge', x: -2.8 }, { id: 'right', label: 'Right ridge', x: 2.8 }], steps: 24, targetLoss: -0.72, xRange: [-3.3, 3.3],
  },
]

export function lossAt(kind: LossKind, x: number) {
  if (kind === 'quadratic') return x * x + .1
  if (kind === 'narrow') return 2.2 * x * x + .1
  return .12 * (x * x - 4) ** 2 + .4 * x
}

export function gradientAt(kind: LossKind, x: number) {
  if (kind === 'quadratic') return 2 * x
  if (kind === 'narrow') return 4.4 * x
  return .48 * x * (x * x - 4) + .4
}

export interface BossSimulation {
  trajectory: Array<{ x: number; loss: number }>
  outcome: BossOutcome
  bestLoss: number
}

export function simulateGradientDescent(round: BossRound, learningRate: number, startId: string): BossSimulation {
  const start = round.starts.find((item) => item.id === startId) ?? round.starts[0]
  let x = start.x
  const trajectory = [{ x, loss: lossAt(round.lossKind, x) }]
  let signChanges = 0
  let previousSign = Math.sign(x)
  for (let step = 0; step < round.steps; step += 1) {
    x -= learningRate * gradientAt(round.lossKind, x)
    const currentSign = Math.sign(x)
    if (currentSign && previousSign && currentSign !== previousSign) signChanges += 1
    previousSign = currentSign || previousSign
    trajectory.push({ x, loss: lossAt(round.lossKind, x) })
    if (!Number.isFinite(x) || Math.abs(x) > 20) break
  }
  const losses = trajectory.map((point) => point.loss)
  const bestLoss = Math.min(...losses.filter(Number.isFinite))
  const final = trajectory.at(-1)!
  const initialLoss = trajectory[0].loss
  let outcome: BossOutcome
  if (!Number.isFinite(final.loss) || Math.abs(final.x) > 12 || final.loss > initialLoss * 1.4) outcome = 'unstable'
  else if (round.lossKind === 'double-well' && Math.abs(gradientAt(round.lossKind, final.x)) < .5 && final.x > 0) outcome = 'local minimum'
  else if (round.lossKind === 'narrow' && signChanges >= 4 && final.loss > round.targetLoss) outcome = 'overshot'
  else if (final.loss <= round.targetLoss) outcome = 'converged'
  else outcome = 'too slow'
  return { trajectory, outcome, bestLoss }
}

export function sampleLossCurve(round: BossRound, count = 41) {
  const [min, max] = round.xRange
  return Array.from({ length: count }, (_, index) => {
    const x = min + (max - min) * index / (count - 1)
    return { x, loss: lossAt(round.lossKind, x) }
  })
}
