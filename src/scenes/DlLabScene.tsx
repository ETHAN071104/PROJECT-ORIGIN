import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { playTone } from '../audio/audio'
import { PixelButton } from '../components/PixelButton'
import {
  BOSS_ROUNDS,
  calculateNetworkSignal,
  cellKey,
  DL_EXPLANATIONS,
  DL_HINTS,
  DL_LEARN_MORE,
  DL_STAGE_TITLES,
  interferenceQuality,
  isMaximumSignal,
  isOrthogonalStep,
  NEURAL_PATH_ROUNDS,
  POWER_ROUNDS,
  lossAt,
  sampleLossCurve,
  simulateGradientDescent,
  TUNING_ROUNDS,
  validateNeuralPaths,
  type BossOutcome,
  type BossSimulation,
  type DlStageNumber,
  type GridCell,
  type PathColor,
} from '../data/dlLab'
import { useGame } from '../game/GameContext'

const PATH_COLORS: PathColor[] = ['cyan', 'violet', 'white', 'gold']

function DlStageShell({ stage, wrongAttempts, onExit, children }: { stage: DlStageNumber; wrongAttempts: number; onExit: () => void; children: ReactNode }) {
  const [hintDismissed, setHintDismissed] = useState(false)
  return (
    <div className="scene dl-stage-scene lab-dl">
      <div className="dl-backplane" aria-hidden="true"><i /><i /><i /><i /><b /><b /></div>
      <header className="dl-stage-hud">
        <div className="dl-stage-title"><span>{stage === 4 ? 'FINAL BOSS' : `STAGE ${stage}`}</span><strong>{DL_STAGE_TITLES[stage]}</strong></div>
        <div className="dl-stage-progress" aria-label={`Deep Learning stage ${stage} of 4`}>
          {[1, 2, 3, 4].map((step) => <i key={step} className={step <= stage ? 'is-active' : ''} />)}
        </div>
        <PixelButton variant="secondary" className="dl-exit-button" onClick={onExit}>Exit Lab</PixelButton>
      </header>
      {wrongAttempts >= 2 && !hintDismissed && (
        <aside className="node-hint" role="status">
          <div className="node-hint-face" aria-hidden="true"><i /><i /><b /></div>
          <strong>NODE-9</strong><p>{DL_HINTS[stage]}</p>
          <button type="button" className="mentor-hint-close" aria-label="Close NODE-9 hint" onClick={() => setHintDismissed(true)}>×</button>
        </aside>
      )}
      {children}
    </div>
  )
}

function DlStageSuccess({ stage, onContinue }: { stage: 1 | 2 | 3; onContinue: () => void }) {
  return (
    <div className="dl-success-overlay" role="dialog" aria-label={`${DL_STAGE_TITLES[stage]} complete`}>
      <section className="dl-success-panel">
        <div className="dl-success-node" aria-hidden="true"><i /><i /><i /></div>
        <p>NEURAL SYSTEM RESTORED</p>
        <h2>{DL_STAGE_TITLES[stage]}</h2>
        <blockquote>{DL_EXPLANATIONS[stage]}</blockquote>
        {stage === 2 && <small>Conceptual analogy: these controls simplify learned weights into visible signal choices.</small>}
        {stage === 3 && <small>2012 marked a major turning point for deep learning in image recognition, led by AlexNet's ImageNet result.</small>}
        <details><summary>Learn More</summary><p>{DL_LEARN_MORE[stage]}</p></details>
        <PixelButton onClick={onContinue}>Continue</PixelButton>
      </section>
    </div>
  )
}

type PathState = Partial<Record<PathColor, GridCell[]>>

type PathDirection = 'up' | 'right' | 'down' | 'left'

function connectedDirections(path: GridCell[], cell: GridCell): PathDirection[] {
  const index = path.findIndex((item) => cellKey(item) === cellKey(cell))
  if (index < 0) return []
  return [path[index - 1], path[index + 1]].filter(Boolean).map((neighbor) => {
    if (neighbor.row < cell.row) return 'up'
    if (neighbor.row > cell.row) return 'down'
    if (neighbor.col < cell.col) return 'left'
    return 'right'
  })
}

function NeuralPathStage({ onSaved, onContinue, onExit }: { onSaved: () => void; onContinue: () => void; onExit: () => void }) {
  const { state } = useGame()
  const [roundIndex, setRoundIndex] = useState(0)
  const [paths, setPaths] = useState<PathState>({})
  const [activeColor, setActiveColor] = useState<PathColor | null>(null)
  const [lastEdited, setLastEdited] = useState<PathColor | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const pointerIdRef = useRef<number | null>(null)
  const pathOriginRef = useRef<GridCell | null>(null)
  const activeColorRef = useRef<PathColor | null>(null)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [wrong, setWrong] = useState(false)
  const [roundClear, setRoundClear] = useState(false)
  const [complete, setComplete] = useState(false)
  const savedRef = useRef(false)
  const round = NEURAL_PATH_ROUNDS[roundIndex]

  const endpointColor = (cell: GridCell) => round.pairs.find((pair) =>
    cellKey(pair.start) === cellKey(cell) || cellKey(pair.end) === cellKey(cell))?.color

  const usedColor = (cell: GridCell) => PATH_COLORS.find((color) => (paths[color] ?? []).some((item) => cellKey(item) === cellKey(cell)))

  const extend = (color: PathColor, cell: GridCell) => {
    setWrong(false)
    setLastEdited(color)
    setPaths((current) => {
      const path = current[color] ?? []
      const last = path.at(-1)
      if (last && cellKey(last) === cellKey(cell)) return current
      if (last && !isOrthogonalStep(last, cell)) return current
      const occupiedBy = PATH_COLORS.find((candidate) => (current[candidate] ?? []).some((item) => cellKey(item) === cellKey(cell)))
      if (occupiedBy && occupiedBy !== color) return current
      const existingIndex = path.findIndex((item) => cellKey(item) === cellKey(cell))
      if (existingIndex >= 0) {
        if (existingIndex === path.length - 2) return { ...current, [color]: path.slice(0, -1) }
        return current
      }
      return { ...current, [color]: [...path, cell] }
    })
  }

  const beginOrExtend = (cell: GridCell) => {
    const endpoint = endpointColor(cell)
    if (endpoint) {
      setActiveColor(endpoint)
      activeColorRef.current = endpoint
      pathOriginRef.current = cell
      setLastEdited(endpoint)
      setPaths((current) => ({ ...current, [endpoint]: [cell] }))
      return
    }
    const color = activeColorRef.current ?? activeColor
    if (color) extend(color, cell)
  }

  const finishDrag = (pointerId?: number) => {
    draggingRef.current = false
    pointerIdRef.current = null
    if (pointerId !== undefined && gridRef.current?.hasPointerCapture(pointerId)) gridRef.current.releasePointerCapture(pointerId)
  }

  const continueDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || pointerIdRef.current !== event.pointerId || !activeColorRef.current) return
    event.preventDefault()
    const hit = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLButtonElement>('.neural-cell')
    if (!hit || !gridRef.current?.contains(hit)) return
    const row = Number(hit.dataset.row)
    const col = Number(hit.dataset.col)
    if (!Number.isInteger(row) || !Number.isInteger(col)) return
    const cell = { row, col }
    const color = activeColorRef.current
    extend(color, cell)
    if (endpointColor(cell) === color && pathOriginRef.current && cellKey(cell) !== cellKey(pathOriginRef.current)) finishDrag(event.pointerId)
  }

  const undo = () => {
    if (!lastEdited) return
    setPaths((current) => ({ ...current, [lastEdited]: (current[lastEdited] ?? []).slice(0, -1) }))
    setWrong(false)
  }

  const confirm = () => {
    if (!validateNeuralPaths(round, paths)) {
      playTone(state.save.audioEnabled, 'incorrect')
      setWrongAttempts((count) => count + 1)
      setWrong(true)
      return
    }
    playTone(state.save.audioEnabled, 'connect')
    if (roundIndex === NEURAL_PATH_ROUNDS.length - 1) {
      setComplete(true)
      if (!savedRef.current) { savedRef.current = true; onSaved() }
    } else setRoundClear(true)
  }

  const nextRound = () => {
    setRoundIndex((index) => index + 1)
    setPaths({})
    setActiveColor(null)
    activeColorRef.current = null
    pathOriginRef.current = null
    setLastEdited(null)
    setRoundClear(false)
    setWrong(false)
  }

  return (
    <DlStageShell stage={1} wrongAttempts={wrongAttempts} onExit={onExit}>
      <main className="neural-path-layout">
        <section className="dl-task-card"><span>CONNECTION PUZZLE {roundIndex + 1} / 3</span><h2>Link matching neural ports</h2><p>Drag or tap through orthogonal cells. Paths cannot cross. Any route is valid when every matching pair connects.</p></section>
        <section className={`neural-grid-shell ${wrong ? 'is-wrong' : ''}`}>
          <div
            ref={gridRef}
            className="neural-grid"
            style={{ '--grid-size': round.size } as CSSProperties}
            onPointerMove={continueDrag}
            onPointerUp={(event) => finishDrag(event.pointerId)}
            onPointerCancel={(event) => finishDrag(event.pointerId)}
            onLostPointerCapture={() => finishDrag()}
            onContextMenu={(event) => event.preventDefault()}
          >
            {Array.from({ length: round.size * round.size }, (_, index) => {
              const cell = { row: Math.floor(index / round.size), col: index % round.size }
              const endpoint = endpointColor(cell)
              const pathColor = usedColor(cell)
              const directions = pathColor ? connectedDirections(paths[pathColor] ?? [], cell) : []
              return (
                <button
                  type="button"
                  key={cellKey(cell)}
                  data-row={cell.row}
                  data-col={cell.col}
                  className={`neural-cell ${endpoint ? `is-endpoint path-${endpoint}` : ''} ${pathColor ? `is-path path-${pathColor}` : ''}`}
                  aria-label={`Grid row ${cell.row + 1}, column ${cell.col + 1}${endpoint ? `, ${endpoint} port` : ''}`}
                  onPointerDown={(event) => {
                    event.preventDefault()
                    draggingRef.current = true
                    pointerIdRef.current = event.pointerId
                    beginOrExtend(cell)
                    gridRef.current?.setPointerCapture(event.pointerId)
                  }}
                  onDragStart={(event) => event.preventDefault()}
                  onClick={(event) => { if (event.detail === 0) beginOrExtend(cell) }}
                ><span className="path-direction-glow" aria-hidden="true">{directions.map((direction) => <b key={direction} className={`path-arm arm-${direction}`} />)}</span><i /></button>
              )
            })}
          </div>
          <div className="path-legend">{round.pairs.map((pair) => <span key={pair.color} className={`path-${pair.color}`}><i />{pair.color}</span>)}</div>
        </section>
        <div className="dl-action-row"><PixelButton variant="secondary" onClick={() => { setPaths({}); setActiveColor(null); activeColorRef.current = null; pathOriginRef.current = null; finishDrag(); setWrong(false) }}>Reset</PixelButton><PixelButton variant="secondary" onClick={undo}>Undo</PixelButton><PixelButton onClick={confirm}>Verify Paths</PixelButton></div>
      </main>
      {roundClear && <div className="dl-round-overlay" role="dialog"><p>CONNECTIONS STABLE</p><h2>Neural path {roundIndex + 1} synchronized</h2><PixelButton onClick={nextRound}>Next Grid</PixelButton></div>}
      {complete && <DlStageSuccess stage={1} onContinue={onContinue} />}
    </DlStageShell>
  )
}

function PowerNetworkStage({ onSaved, onContinue, onExit }: { onSaved: () => void; onContinue: () => void; onExit: () => void }) {
  const { state } = useGame()
  const [roundIndex, setRoundIndex] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [wrong, setWrong] = useState(false)
  const [roundClear, setRoundClear] = useState(false)
  const [complete, setComplete] = useState(false)
  const savedRef = useRef(false)
  const round = POWER_ROUNDS[roundIndex]
  const calculation = calculateNetworkSignal(round, selected)

  const choose = (layerIndex: number, id: string) => {
    setSelected((current) => { const next = [...current]; next[layerIndex] = id; return next })
    setWrong(false)
  }

  const confirm = () => {
    if (!isMaximumSignal(round, selected)) {
      playTone(state.save.audioEnabled, 'incorrect')
      setWrongAttempts((count) => count + 1)
      setWrong(true)
      return
    }
    playTone(state.save.audioEnabled, 'power')
    if (roundIndex === POWER_ROUNDS.length - 1) {
      setComplete(true)
      if (!savedRef.current) { savedRef.current = true; onSaved() }
    } else setRoundClear(true)
  }

  const nextRound = () => { setRoundIndex((index) => index + 1); setSelected([]); setWrong(false); setRoundClear(false) }

  return (
    <DlStageShell stage={2} wrongAttempts={wrongAttempts} onExit={onExit}>
      <main className="power-network-layout">
        <section className="dl-task-card"><span>SIGNAL ROUND {roundIndex + 1} / 3</span><h2>Route the strongest useful signal</h2><p>Select one transformation in every layer, then compare the output with the maximum target.</p></section>
        <section className={`network-console ${wrong ? 'is-wrong' : ''}`}>
          <div className="network-input"><span>INPUT</span><strong>{round.input}</strong></div>
          <div className="network-layers">
            {round.layers.map((layer, layerIndex) => (
              <div className="network-layer" key={`${round.id}-${layerIndex}`}><span>LAYER {layerIndex + 1}</span>{layer.map((choice) => <button type="button" key={choice.id} className={selected[layerIndex] === choice.id ? 'is-selected' : ''} onClick={() => choose(layerIndex, choice.id)}>{choice.label}</button>)}</div>
            ))}
          </div>
          <div className="network-output"><span>OUTPUT</span><strong>{calculation.value.toFixed(1)}</strong><small>MAX {round.target.toFixed(1)}</small></div>
          <div className="signal-calculation" aria-label="Current signal calculation">
            {calculation.values.map((value, index) => <span key={`${index}-${value}`}><b>{value.toFixed(1)}</b>{index < round.layers.length && <i>→</i>}</span>)}
          </div>
          <small className="analogy-note">CONCEPTUAL ANALOGY — real neural networks learn weights from examples; these choices expose the idea, not a literal model.</small>
        </section>
        <div className="dl-action-row"><PixelButton variant="secondary" onClick={() => { setSelected([]); setWrong(false) }}>Reset</PixelButton><PixelButton onClick={confirm}>Activate Network</PixelButton></div>
      </main>
      {roundClear && <div className="dl-round-overlay" role="dialog"><p>MAXIMUM SIGNAL REACHED</p><h2>{round.target.toFixed(1)} units delivered</h2><PixelButton onClick={nextRound}>Next Network</PixelButton></div>}
      {complete && <DlStageSuccess stage={2} onContinue={onContinue} />}
    </DlStageShell>
  )
}

function TuneNeuronStage({ onSaved, onContinue, onExit }: { onSaved: () => void; onContinue: () => void; onExit: () => void }) {
  const { state } = useGame()
  const [roundIndex, setRoundIndex] = useState(0)
  const [angle, setAngle] = useState(0)
  const [answer, setAnswer] = useState('')
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [wrong, setWrong] = useState(false)
  const [roundClear, setRoundClear] = useState(false)
  const [complete, setComplete] = useState(false)
  const savedRef = useRef(false)
  const round = TUNING_ROUNDS[roundIndex]
  const quality = interferenceQuality(round, angle)
  const clarityPercent = Math.round(quality * 100)
  const tuned = clarityPercent >= 98

  const normalizeAngle = (value: number) => setAngle((value % 360 + 360) % 360)
  const adjust = (amount: number) => { normalizeAngle(angle + amount); setWrong(false) }

  const pointKnob = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const degrees = Math.atan2(event.clientY - (rect.top + rect.height / 2), event.clientX - (rect.left + rect.width / 2)) * 180 / Math.PI + 90
    normalizeAngle(degrees)
    setWrong(false)
  }

  const confirm = () => {
    if (!tuned || answer.trim() !== round.hiddenNumber) {
      playTone(state.save.audioEnabled, 'incorrect')
      setWrongAttempts((count) => count + 1)
      setWrong(true)
      return
    }
    playTone(state.save.audioEnabled, 'tune')
    if (roundIndex === TUNING_ROUNDS.length - 1) {
      setComplete(true)
      if (!savedRef.current) { savedRef.current = true; onSaved() }
    } else setRoundClear(true)
  }

  const nextRound = () => { setRoundIndex((index) => index + 1); setAngle(0); setAnswer(''); setWrong(false); setRoundClear(false) }

  return (
    <DlStageShell stage={3} wrongAttempts={wrongAttempts} onExit={onExit}>
      <main className="tune-neuron-layout">
        <section className="dl-task-card"><span>PARAMETER TEST {roundIndex + 1} / 3</span><h2>Tune away the interference</h2><p>Drag the dial, use −/+, or focus it and press arrow keys / A / D. Enter the number only when the signal is clear.</p></section>
        <section className={`tuning-console ${wrong ? 'is-wrong' : ''}`}>
          <div className={`interference-screen ${tuned ? 'is-readable' : ''}`} style={{ '--quality': quality } as CSSProperties}>
            <div className="hidden-digits" aria-label={tuned ? `Clear number ${round.hiddenNumber}` : 'Noisy number, not yet readable'}>{round.hiddenNumber.split('').map((digit, index) => <span aria-hidden="true" key={`${digit}-${index}`}>{tuned ? digit : '▒'}</span>)}</div>
            <div className="pixel-interference" aria-hidden="true">{Array.from({ length: 24 }, (_, index) => <i key={index} style={{ '--noise-x': `${(index * 17 + round.seed * 7) % 92}%`, '--noise-y': `${(index * 29 + round.seed * 11) % 88}%`, '--noise-opacity': tuned ? .02 : Math.max(.45, 1 - quality) } as CSSProperties} />)}</div>
            <div className="quality-meter"><i style={{ width: `${clarityPercent}%` }} /><span>CLARITY {clarityPercent}%</span></div>
          </div>
          <div className="neuron-controls">
            <button type="button" className="tune-step" onClick={() => adjust(-2)} aria-label="Turn parameter down">−</button>
            <div
              className="neuron-knob"
              role="slider"
              tabIndex={0}
              aria-label="Neuron parameter angle"
              aria-valuemin={0}
              aria-valuemax={359}
              aria-valuenow={Math.round(angle)}
              onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); pointKnob(event) }}
              onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) pointKnob(event) }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') { event.preventDefault(); adjust(-2) }
                if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') { event.preventDefault(); adjust(2) }
              }}
            ><i style={{ transform: `translateX(-50%) rotate(${angle}deg)` }} /><b>{Math.round(angle)}°</b></div>
            <button type="button" className="tune-step" onClick={() => adjust(2)} aria-label="Turn parameter up">+</button>
            <label className="number-entry"><span>RECOVERED NUMBER</span><input inputMode="numeric" value={answer} onChange={(event) => { setAnswer(event.target.value.replace(/\D/g, '').slice(0, 4)); setWrong(false) }} onKeyDown={(event) => { if (event.key === 'Enter') confirm() }} /></label>
          </div>
        </section>
        <div className="dl-action-row"><PixelButton variant="secondary" onClick={() => { setAngle(0); setAnswer(''); setWrong(false) }}>Reset</PixelButton><PixelButton onClick={confirm}>Confirm Signal</PixelButton></div>
      </main>
      {roundClear && <div className="dl-round-overlay" role="dialog"><p>PARAMETER LOCKED</p><h2>Signal {round.hiddenNumber} recovered</h2><PixelButton onClick={nextRound}>Next Neuron</PixelButton></div>}
      {complete && <DlStageSuccess stage={3} onContinue={onContinue} />}
    </DlStageShell>
  )
}

const OUTCOME_COPY: Record<BossOutcome, string> = {
  overshot: 'The update crossed the valley again and again without settling.',
  'too slow': 'Loss fell, but the steps were too small to reach the target in time.',
  unstable: 'The updates grew instead of settling. Reduce the learning rate.',
  converged: 'Loss decreased into a stable minimum.',
  'local minimum': 'The updates settled, but in the shallower valley. Try another start.',
}

function GradientBossStage({ onComplete, onFinish, onExit }: { onComplete: () => void; onFinish: () => void; onExit: () => void }) {
  const { state } = useGame()
  const [roundIndex, setRoundIndex] = useState(0)
  const [rate, setRate] = useState(BOSS_ROUNDS[0].learningRates[0])
  const [startId, setStartId] = useState(BOSS_ROUNDS[0].starts[0].id)
  const [simulation, setSimulation] = useState<BossSimulation | null>(null)
  const [displayStep, setDisplayStep] = useState(0)
  const [phase, setPhase] = useState<'intro' | 'ready' | 'optimizing' | 'result' | 'round-clear' | 'activation'>('intro')
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [activationStep, setActivationStep] = useState(0)
  const completedRef = useRef(false)
  const round = BOSS_ROUNDS[roundIndex]
  const curve = useMemo(() => sampleLossCurve(round, 65), [round])

  useEffect(() => {
    if (phase !== 'optimizing' || !simulation) return
    const timer = window.setInterval(() => {
      setDisplayStep((step) => {
        if (step >= simulation.trajectory.length - 1) {
          window.clearInterval(timer)
          setPhase('result')
          return step
        }
        return step + 1
      })
    }, 115)
    return () => window.clearInterval(timer)
  }, [phase, simulation])

  useEffect(() => {
    if (phase !== 'activation') return
    const one = window.setTimeout(() => setActivationStep(1), 450)
    const two = window.setTimeout(() => setActivationStep(2), 1050)
    return () => { window.clearTimeout(one); window.clearTimeout(two) }
  }, [phase])

  const launch = () => {
    const result = simulateGradientDescent(round, rate, startId)
    setSimulation(result)
    setDisplayStep(0)
    setPhase('optimizing')
    playTone(state.save.audioEnabled, 'optimize')
    if (result.outcome !== 'converged') setWrongAttempts((count) => count + 1)
  }

  const acceptResult = () => {
    if (!simulation) return
    if (simulation.outcome !== 'converged') {
      setSimulation(null)
      setDisplayStep(0)
      setPhase('ready')
      return
    }
    if (roundIndex < BOSS_ROUNDS.length - 1) setPhase('round-clear')
    else {
      if (!completedRef.current) { completedRef.current = true; playTone(state.save.audioEnabled, 'complete'); onComplete() }
      setPhase('activation')
    }
  }

  const nextRound = () => {
    const nextIndex = roundIndex + 1
    const next = BOSS_ROUNDS[nextIndex]
    setRoundIndex(nextIndex)
    setRate(next.learningRates[0])
    setStartId(next.starts[0].id)
    setSimulation(null)
    setDisplayStep(0)
    setPhase('ready')
  }

  const losses = curve.map((point) => point.loss)
  const minLoss = Math.min(...losses)
  const maxLoss = Math.max(...losses)
  const graphPoint = (point: { x: number; loss: number }) => ({
    x: 28 + (point.x - round.xRange[0]) / (round.xRange[1] - round.xRange[0]) * 564,
    y: 202 - Math.max(0, Math.min(1, (point.loss - minLoss) / Math.max(.001, maxLoss - minLoss))) * 174,
  })
  const curvePoints = curve.map(graphPoint).map((point) => `${point.x},${point.y}`).join(' ')
  const visibleTrajectory = simulation?.trajectory.slice(0, displayStep + 1) ?? []
  const trajectoryPoints = visibleTrajectory.map(graphPoint)
  const selectedStartX = round.starts.find((item) => item.id === startId)?.x ?? round.starts[0].x
  const current = visibleTrajectory.at(-1) ?? { x: selectedStartX, loss: lossAt(round.lossKind, selectedStartX) }
  const currentPoint = graphPoint(current)
  const currentBest = simulation ? Math.min(...visibleTrajectory.map((point) => point.loss)) : current.loss

  return (
    <DlStageShell stage={4} wrongAttempts={wrongAttempts} onExit={onExit}>
      <main className="gradient-boss-layout">
        <section className="gradient-brief"><span>OPTIMIZATION ROUND {roundIndex + 1} / 3</span><strong>{round.title}</strong><p>Choose an update size. The core repeatedly moves downhill to reduce loss.</p></section>
        <section className="gradient-console">
          <div className="loss-graph" aria-label="Loss curve and optimization trajectory">
            <svg viewBox="0 0 620 230" role="img" aria-label={`Loss curve, current outcome ${simulation?.outcome ?? 'not started'}`}>
              <path className="graph-axis" d="M28 18V202H600" />
              <polyline className="loss-curve-line" points={curvePoints} />
              {trajectoryPoints.length > 1 && <polyline className="trajectory-line" points={trajectoryPoints.map((point) => `${point.x},${point.y}`).join(' ')} />}
              {trajectoryPoints.map((point, index) => <rect key={index} className="trajectory-step" x={point.x - 3} y={point.y - 3} width="6" height="6" />)}
              <g className="optimizer-orb" transform={`translate(${currentPoint.x} ${currentPoint.y})`}><rect x="-8" y="-8" width="16" height="16" /><rect x="-3" y="-3" width="6" height="6" /></g>
            </svg>
            <span className="loss-label">LOSS</span><span className="position-label">PARAMETER POSITION</span>
          </div>
          <div className="gradient-hud">
            <div><span>CURRENT LOSS</span><strong>{Number.isFinite(current.loss) ? current.loss.toFixed(3) : '∞'}</strong></div>
            <div><span>STEPS</span><strong>{displayStep} / {round.steps}</strong></div>
            <div><span>BEST LOSS</span><strong>{Number.isFinite(currentBest) ? currentBest.toFixed(3) : '∞'}</strong></div>
            <div><span>STATUS</span><strong>{phase === 'optimizing' ? 'UPDATING' : simulation?.outcome?.toUpperCase() ?? 'READY'}</strong></div>
          </div>
          <div className="gradient-controls">
            <div className="rate-choices"><span>LEARNING RATE</span>{round.learningRates.map((value) => <button type="button" key={value} className={rate === value ? 'is-selected' : ''} disabled={phase === 'optimizing'} onClick={() => { setRate(value); setSimulation(null); setPhase('ready') }}>{value}</button>)}</div>
            {round.starts.length > 1 && <div className="start-choices"><span>START POSITION</span>{round.starts.map((start) => <button type="button" key={start.id} className={startId === start.id ? 'is-selected' : ''} disabled={phase === 'optimizing'} onClick={() => { setStartId(start.id); setSimulation(null); setPhase('ready') }}>{start.label}</button>)}</div>}
            <PixelButton onClick={launch} disabled={phase !== 'ready'}>{phase === 'optimizing' ? 'Optimizing…' : 'Run Updates'}</PixelButton>
          </div>
        </section>
        {phase === 'intro' && <section className="gradient-intro" role="dialog"><span>NODE-9 // CORE BRIEF</span><h2>Reduce the loss</h2><p>Loss tells us how far the network is from its goal. Choose an update size, then watch each gradient step move the parameter.</p><PixelButton onClick={() => setPhase('ready')}>Open Optimizer</PixelButton></section>}
        {phase === 'result' && simulation && <section className={`gradient-result outcome-${simulation.outcome.replace(' ', '-')}`} role="dialog"><span>{simulation.outcome.toUpperCase()}</span><p>{OUTCOME_COPY[simulation.outcome]}</p><PixelButton onClick={acceptResult}>{simulation.outcome === 'converged' ? 'Lock Result' : 'Try Again'}</PixelButton></section>}
      </main>
      {phase === 'round-clear' && <div className="dl-round-overlay" role="dialog"><p>UPDATE RULE STABLE</p><h2>Loss converged in round {roundIndex + 1}</h2><PixelButton onClick={nextRound}>Next Curve</PixelButton></div>}
      {phase === 'activation' && <div className={`neural-core-activation step-${activationStep}`} role="dialog">
        <div className="core-rings" aria-hidden="true"><i /><i /><i /><b /></div>
        <p>NODE-9 // FINAL FIELD NOTE</p>
        <h2>NEURAL CORE ONLINE</h2>
        <blockquote>Loss measures how far a model is from its goal. The gradient points toward a useful change. Repeating small, stable updates can improve the model step by step.</blockquote>
        <strong>DEEP LEARNING MODULE RESTORED</strong>
        {activationStep >= 2 && <PixelButton onClick={onFinish}>Return to Academy</PixelButton>}
      </div>}
    </DlStageShell>
  )
}

function DlReplayChoice({ onReplay, onExit }: { onReplay: () => void; onExit: () => void }) {
  return <div className="scene dl-replay-scene lab-dl"><section className="dl-replay-panel"><div className="replay-network" aria-hidden="true"><i /><i /><i /><b /><b /></div><p>NEURAL CORE ONLINE</p><h2>Deep Learning Lab Restored</h2><blockquote>Replay the four training systems, or return to the academy. Your DL upgrade and East Gate access remain active.</blockquote><div><PixelButton variant="secondary" onClick={onExit}>Return to Academy</PixelButton><PixelButton onClick={onReplay}>Replay Lab</PixelButton></div></section></div>
}

export function DlLabScene() {
  const { state, dispatch } = useGame()
  const initialStage = Math.max(1, Math.min(4, state.save.stageProgress.dl + 1)) as DlStageNumber
  const [stage, setStage] = useState<DlStageNumber>(initialStage)
  const [showReplayChoice, setShowReplayChoice] = useState(state.save.completedLabs.dl && state.save.stageProgress.dl >= 4)
  const exit = () => dispatch({ type: 'LEAVE_LAB' })
  const saveStage = (completedStage: 1 | 2 | 3) => dispatch({ type: 'RECORD_DL_STAGE', stage: completedStage })

  if (showReplayChoice) return <DlReplayChoice onReplay={() => { setStage(1); setShowReplayChoice(false) }} onExit={exit} />
  if (stage === 1) return <NeuralPathStage onSaved={() => saveStage(1)} onContinue={() => setStage(2)} onExit={exit} />
  if (stage === 2) return <PowerNetworkStage onSaved={() => saveStage(2)} onContinue={() => setStage(3)} onExit={exit} />
  if (stage === 3) return <TuneNeuronStage onSaved={() => saveStage(3)} onContinue={() => setStage(4)} onExit={exit} />
  return <GradientBossStage onComplete={() => dispatch({ type: 'COMPLETE_DL_LAB' })} onFinish={() => dispatch({ type: 'FINISH_DL_LAB' })} onExit={exit} />
}
