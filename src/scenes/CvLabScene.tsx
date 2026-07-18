import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { playTone } from '../audio/audio'
import { PixelButton } from '../components/PixelButton'
import {
  BOSS_FINAL_REPLAY,
  BOSS_ROUNDS,
  calculateBossFrame,
  calculateBossReplayFrame,
  calculateBossScore,
  CLASSIFICATION_CARDS,
  CLASSIFICATION_CATEGORIES,
  classificationIsCorrect,
  CV_EXPLANATIONS,
  CV_HINTS,
  CV_LEARN_MORE,
  CV_STAGE_TITLES,
  DIFFERENCE_TARGETS,
  LOCATION_TARGETS,
  pointInPercentRect,
  targetMatchesSelection,
  type ClassificationCard,
  type ClassificationCategory,
  type BossSceneConfig,
  type BossSceneFrame,
  type BossSceneObject,
  type CvStageNumber,
  type DifferenceTarget,
  type PercentRect,
  type VisionClass,
  type VisionTarget,
} from '../data/cvLab'
import { useGameCoordinates } from '../components/GameViewport'
import { useGame } from '../game/GameContext'
import type { Point } from '../game/types'

interface LogicalBounds {
  x: number
  y: number
  width: number
  height: number
}

const DIFFERENCE_LEFT_BOUNDS: LogicalBounds = { x: 28, y: 146, width: 436, height: 276 }
const DIFFERENCE_RIGHT_BOUNDS: LogicalBounds = { x: 496, y: 146, width: 436, height: 276 }
const LOCATION_BOUNDS: LogicalBounds = { x: 70, y: 139, width: 820, height: 304 }
const VISION_CLASSES: VisionClass[] = ['Car', 'Tree', 'Street Lamp']

function percentPoint(point: Point, bounds: LogicalBounds) {
  return {
    x: ((point.x - bounds.x) / bounds.width) * 100,
    y: ((point.y - bounds.y) / bounds.height) * 100,
  }
}

function rectStyle(rect: PercentRect) {
  return {
    left: `${rect.x}%`,
    top: `${rect.y}%`,
    width: `${rect.width}%`,
    height: `${rect.height}%`,
  }
}

function activateWithKeyboard(event: React.KeyboardEvent<HTMLButtonElement>, action: () => void) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  action()
}

function useTransientFeedback() {
  const [feedback, setFeedback] = useState<string | null>(null)
  const timeoutRef = useRef<number | null>(null)

  const flash = useCallback((value: string) => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    setFeedback(value)
    timeoutRef.current = window.setTimeout(() => setFeedback(null), 480)
  }, [])

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
  }, [])

  return { feedback, flash }
}

function CvStageShell({
  stage,
  wrongAttempts,
  onExit,
  children,
}: {
  stage: CvStageNumber
  wrongAttempts: number
  onExit: () => void
  children: ReactNode
}) {
  return (
    <div className="scene cv-stage-scene lab-cv">
      <header className="cv-stage-hud">
        <div className="cv-stage-title">
          <span>{stage === 4 ? 'FINAL BOSS' : `STAGE ${stage}`}</span>
          <strong>{CV_STAGE_TITLES[stage]}</strong>
        </div>
        <div className="cv-stage-progress" aria-label={`Computer Vision stage ${stage} of 4`}>
          {[1, 2, 3, 4].map((step) => <i key={step} className={step <= stage ? 'is-active' : ''} />)}
        </div>
        <PixelButton variant="secondary" className="cv-exit-button" onClick={onExit}>Exit Lab</PixelButton>
      </header>
      {wrongAttempts >= 2 && (
        <aside className="lens-hint" role="status">
          <strong>LENS-01</strong>
          <span>{CV_HINTS[stage]}</span>
        </aside>
      )}
      {children}
    </div>
  )
}

function StageSuccess({ stage, onContinue }: { stage: 1 | 2 | 3; onContinue: () => void }) {
  const learnMore = CV_LEARN_MORE[stage]
  return (
    <div className="cv-success-overlay" role="dialog" aria-label={`${CV_STAGE_TITLES[stage]} complete`}>
      <div className="cv-success-panel">
        <span className="cv-success-check" aria-hidden="true">✓</span>
        <p>ACTIVITY COMPLETE</p>
        <h2>{CV_STAGE_TITLES[stage]}</h2>
        <blockquote>{CV_EXPLANATIONS[stage]}</blockquote>
        {stage === 2 && <small>This is an intuition-building activity, not a literal simulation of a production vision model.</small>}
        {learnMore && (
          <details>
            <summary>Learn More</summary>
            <p>{learnMore}</p>
          </details>
        )}
        <PixelButton onClick={onContinue}>Continue</PixelButton>
      </div>
    </div>
  )
}

function CardArt({ id }: { id: ClassificationCard['id'] }) {
  return <span className={`classification-art art-${id}`} aria-hidden="true"><i /><i /><b /><b /></span>
}

function ClassificationStage({ onSaved, onContinue, onExit }: { onSaved: () => void; onContinue: () => void; onExit: () => void }) {
  const { state } = useGame()
  const [selected, setSelected] = useState<ClassificationCard['id'] | null>(null)
  const [placed, setPlaced] = useState<Record<string, ClassificationCategory>>({})
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [complete, setComplete] = useState(false)
  const { feedback, flash } = useTransientFeedback()

  const placeCard = (category: ClassificationCategory) => {
    if (!selected) return
    if (!classificationIsCorrect(selected, category)) {
      playTone(state.save.audioEnabled, 'incorrect')
      setWrongAttempts((count) => count + 1)
      flash(selected)
      setSelected(null)
      return
    }

    playTone(state.save.audioEnabled)
    const next = { ...placed, [selected]: category }
    setPlaced(next)
    setSelected(null)
    if (Object.keys(next).length === CLASSIFICATION_CARDS.length) {
      setComplete(true)
      onSaved()
    }
  }

  return (
    <CvStageShell stage={1} wrongAttempts={wrongAttempts} onExit={onExit}>
      <main className="classification-layout">
        <section className="classification-cards" aria-label="Images to classify">
          {CLASSIFICATION_CARDS.map((card) => (
            <button
              type="button"
              key={card.id}
              className={`classification-card ${selected === card.id ? 'is-selected' : ''} ${feedback === card.id ? 'is-wrong' : ''} ${placed[card.id] ? 'is-placed' : ''}`}
              disabled={Boolean(placed[card.id])}
              aria-pressed={selected === card.id}
              onClick={() => setSelected(card.id)}
              onKeyDown={(event) => activateWithKeyboard(event, () => setSelected(card.id))}
            >
              <CardArt id={card.id} />
              <strong>{card.label}</strong>
            </button>
          ))}
        </section>
        <section className="classification-bins" aria-label="Image categories">
          {CLASSIFICATION_CATEGORIES.map((category) => (
            <button type="button" key={category} className="classification-bin" onClick={() => placeCard(category)} onKeyDown={(event) => activateWithKeyboard(event, () => placeCard(category))}>
              <strong>{category}</strong>
              <span>
                {CLASSIFICATION_CARDS.filter((card) => placed[card.id] === category).map((card) => (
                  <i key={card.id}>{card.label}</i>
                ))}
              </span>
            </button>
          ))}
        </section>
      </main>
      <p className="cv-instruction">Select an image, then choose its category.</p>
      {complete && <StageSuccess stage={1} onContinue={onContinue} />}
    </CvStageShell>
  )
}

interface RoadSceneProps<T extends VisionTarget | DifferenceTarget> {
  ariaLabel: string
  bounds: LogicalBounds
  targets: T[]
  found: Set<string>
  variant: string
  onTarget: (target: T | null) => void
  wrong: boolean
  interactive?: boolean
  showAllLabels?: boolean
}

function RoadScene<T extends VisionTarget | DifferenceTarget>({
  ariaLabel,
  bounds,
  targets,
  found,
  variant,
  onTarget,
  wrong,
  interactive = true,
  showAllLabels = false,
}: RoadSceneProps<T>) {
  const { clientToLogical } = useGameCoordinates()

  const targetAtPointer = (event: ReactPointerEvent<HTMLElement>) => {
    const logical = clientToLogical(event.clientX, event.clientY)
    const point = percentPoint(logical, bounds)
    return targets.find((target) => pointInPercentRect(point.x, point.y, target.rect)) ?? null
  }

  const activatePointer = (event: ReactPointerEvent<HTMLElement>) => {
    if (!interactive) return
    event.preventDefault()
    onTarget(targetAtPointer(event))
  }

  return (
    <div
      className={`cv-road-scene ${variant} ${wrong ? 'is-wrong' : ''}`}
      aria-label={ariaLabel}
      onPointerUp={activatePointer}
    >
      <div className="road-sky" />
      <div className="road-shoulder shoulder-left" /><div className="road-shoulder shoulder-right" />
      <div className="pixel-road"><i /><i /><i /></div>
      <div className="road-tree road-tree-left"><i /><b /></div>
      <div className="road-tree road-tree-right"><i /><b /></div>
      <div className="road-lamp road-lamp-left"><i /><b /></div>
      <div className="road-lamp road-lamp-right"><i /><b /></div>
      <div className="road-car"><i /><b /><b /></div>
      {variant.startsWith('boss') && <div className="player-car"><i /><b /><b /></div>}
      {targets.map((target) => {
        const marked = found.has(target.id) || showAllLabels
        const className = 'className' in target ? target.className : 'DIFFERENCE'
        return (
          <button
            type="button"
            key={target.id}
            className={`vision-target ${marked ? 'is-marked' : ''}`}
            style={rectStyle(target.rect)}
            aria-label={marked ? `${target.label} found` : `Select ${target.label}`}
            disabled={!interactive || found.has(target.id)}
            onPointerDown={(event) => {
              event.preventDefault()
              event.stopPropagation()
              event.currentTarget.setPointerCapture(event.pointerId)
            }}
            onPointerUp={(event) => {
              event.stopPropagation()
              activatePointer(event)
              if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
            }}
            onPointerCancel={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
            }}
            onClick={(event) => {
              if (event.detail === 0 && interactive) onTarget(target)
            }}
            onKeyDown={(event) => activateWithKeyboard(event, () => { if (interactive) onTarget(target) })}
          >
            {marked && <span>{className}</span>}
          </button>
        )
      })}
      {showAllLabels && <div className="vision-scan" aria-hidden="true" />}
    </div>
  )
}

function DifferenceStage({ onSaved, onContinue, onExit }: { onSaved: () => void; onContinue: () => void; onExit: () => void }) {
  const { state } = useGame()
  const [found, setFound] = useState(new Set<string>())
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [complete, setComplete] = useState(false)
  const savedRef = useRef(false)
  const { feedback, flash } = useTransientFeedback()

  useEffect(() => {
    if (found.size !== DIFFERENCE_TARGETS.length || savedRef.current) return
    savedRef.current = true
    setComplete(true)
    onSaved()
  }, [found.size, onSaved])

  const choose = (target: DifferenceTarget | null) => {
    if (!target || found.has(target.id)) {
      playTone(state.save.audioEnabled, 'incorrect')
      setWrongAttempts((count) => count + 1)
      flash('scene')
      return
    }
    playTone(state.save.audioEnabled)
    setFound((current) => new Set(current).add(target.id))
  }

  return (
    <CvStageShell stage={2} wrongAttempts={wrongAttempts} onExit={onExit}>
      <div className="difference-scenes">
        <RoadScene ariaLabel="First roadside image" bounds={DIFFERENCE_LEFT_BOUNDS} targets={DIFFERENCE_TARGETS} found={found} variant="difference-left" onTarget={choose} wrong={feedback === 'scene'} />
        <RoadScene ariaLabel="Second roadside image" bounds={DIFFERENCE_RIGHT_BOUNDS} targets={DIFFERENCE_TARGETS} found={found} variant="difference-right" onTarget={choose} wrong={feedback === 'scene'} />
      </div>
      <p className="cv-instruction">Find three differences. Either image counts.</p>
      {complete && <StageSuccess stage={2} onContinue={onContinue} />}
    </CvStageShell>
  )
}

function VisionClassButtons({ selected, onSelect, className = '' }: { selected: VisionClass | null; onSelect: (value: VisionClass) => void; className?: string }) {
  return (
    <div className={`vision-class-buttons ${className}`} aria-label="Object classes">
      {VISION_CLASSES.map((className) => (
        <button type="button" key={className} className={selected === className ? 'is-selected' : ''} aria-pressed={selected === className} onClick={() => onSelect(className)} onKeyDown={(event) => activateWithKeyboard(event, () => onSelect(className))}>
          {className}
        </button>
      ))}
    </div>
  )
}

function LocationStage({ onSaved, onContinue, onExit }: { onSaved: () => void; onContinue: () => void; onExit: () => void }) {
  const { state } = useGame()
  const [selected, setSelected] = useState<VisionClass | null>(null)
  const [found, setFound] = useState(new Set<string>())
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [complete, setComplete] = useState(false)
  const savedRef = useRef(false)
  const { feedback, flash } = useTransientFeedback()

  useEffect(() => {
    if (found.size !== LOCATION_TARGETS.length || savedRef.current) return
    savedRef.current = true
    setComplete(true)
    onSaved()
  }, [found.size, onSaved])

  const choose = (target: VisionTarget | null) => {
    if (!target || !targetMatchesSelection(target, selected)) {
      playTone(state.save.audioEnabled, 'incorrect')
      setWrongAttempts((count) => count + 1)
      flash('scene')
      return
    }
    if (found.has(target.id)) return
    playTone(state.save.audioEnabled)
    setFound((current) => new Set(current).add(target.id))
  }

  return (
    <CvStageShell stage={3} wrongAttempts={wrongAttempts} onExit={onExit}>
      <VisionClassButtons selected={selected} onSelect={setSelected} />
      <div className="location-scene-wrap">
        <RoadScene ariaLabel="Roadside object location scene" bounds={LOCATION_BOUNDS} targets={LOCATION_TARGETS} found={found} variant="location-scene" onTarget={choose} wrong={feedback === 'scene'} />
      </div>
      <p className="cv-instruction">Choose a class, then select every matching object.</p>
      {complete && <StageSuccess stage={3} onContinue={onContinue} />}
    </CvStageShell>
  )
}

type BossPhase = 'INTRO' | 'ROUND_OBSERVE' | 'ROUND_PAUSED_LABEL' | 'ROUND_RESULT' | 'NEXT_ROUND' | 'FINAL_REPLAY' | 'COMPLETE'

function bossFrameStyle(frame: BossSceneFrame): CSSProperties {
  return {
    '--boss-road-shift': `${frame.roadOffset}px`,
    '--boss-player-shift': `${frame.playerShift}px`,
  } as CSSProperties
}

function bossObjectStyle(frame: BossSceneFrame, object: BossSceneObject): CSSProperties {
  const objectFrame = frame.objects.find((item) => item.id === object.id)
  return {
    ...rectStyle(object.rect),
    '--boss-object-x': `${objectFrame?.translateX ?? 0}px`,
    '--boss-object-y': `${objectFrame?.translateY ?? 0}px`,
    '--boss-object-scale': objectFrame?.scale ?? 1,
    opacity: objectFrame?.opacity ?? 1,
  } as CSSProperties
}

function applyBossFrame(scene: HTMLDivElement, frame: BossSceneFrame) {
  scene.style.setProperty('--boss-road-shift', `${frame.roadOffset}px`)
  scene.style.setProperty('--boss-player-shift', `${frame.playerShift}px`)
  frame.objects.forEach((objectFrame) => {
    const object = scene.querySelector<HTMLElement>(`[data-boss-object="${objectFrame.id}"]`)
    if (!object) return
    object.style.setProperty('--boss-object-x', `${objectFrame.translateX}px`)
    object.style.setProperty('--boss-object-y', `${objectFrame.translateY}px`)
    object.style.setProperty('--boss-object-scale', String(objectFrame.scale))
    object.style.opacity = String(objectFrame.opacity)
  })
}

function BossObjectArt({ object }: { object: BossSceneObject }) {
  if (object.className === 'Car') {
    return <span className={`boss-object-art boss-car-art is-${object.variant}`} aria-hidden="true"><i /><i /><b /><b /></span>
  }
  if (object.className === 'Tree') {
    return <span className={`boss-object-art boss-tree-art is-${object.variant}`} aria-hidden="true"><i /><i /><b /></span>
  }
  return <span className="boss-object-art boss-lamp-art" aria-hidden="true"><i /><b /><b /></span>
}

function BossRoadScene({
  config,
  frame,
  sceneRef,
  found,
  interactive,
  wrong,
  revealResults,
  showAllLabels,
  replay,
  onTarget,
}: {
  config: BossSceneConfig
  frame: BossSceneFrame | null
  sceneRef: React.RefObject<HTMLDivElement | null>
  found: Set<string>
  interactive: boolean
  wrong: boolean
  revealResults: boolean
  showAllLabels: boolean
  replay: boolean
  onTarget: (target: VisionTarget | null) => void
}) {
  const renderedFrame = frame ?? calculateBossFrame(config, 0)

  return (
    <div
      ref={sceneRef}
      className={`boss-road-sim ${interactive ? 'is-labeling' : ''} ${wrong ? 'is-wrong' : ''} ${replay ? 'is-replay' : ''}`}
      style={bossFrameStyle(renderedFrame)}
      aria-label={replay ? 'Autonomous driving replay with automatic object detection' : `${config.title} live driving scene`}
      onPointerUp={(event) => {
        if (interactive && event.target === event.currentTarget) onTarget(null)
      }}
    >
      <div className="boss-day-sky" aria-hidden="true"><i /><i /><b /></div>
      <div className="boss-cityline" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <div className="boss-verge boss-verge-left" aria-hidden="true" />
      <div className="boss-verge boss-verge-right" aria-hidden="true" />
      <div className="boss-roadway" aria-hidden="true">
        <span className="boss-lane-line boss-lane-left"><i /><i /><i /><i /></span>
        <span className="boss-lane-line boss-lane-right"><i /><i /><i /><i /></span>
      </div>
      {config.objects.map((object) => {
        const isFound = found.has(object.id)
        const isMissed = revealResults && !isFound
        const isMarked = isFound || showAllLabels || isMissed
        return (
          <div
            className={`boss-road-object boss-${object.className.toLowerCase().replace(' ', '-')} ${isFound || showAllLabels ? 'is-detected' : ''} ${isMissed ? 'is-missed' : ''}`}
            data-boss-object={object.id}
            key={object.id}
            style={bossObjectStyle(renderedFrame, object)}
          >
            <BossObjectArt object={object} />
            <button
              type="button"
              className="boss-object-hit"
              aria-label={isMarked ? `${object.label}: ${isMissed ? 'missed' : 'labeled'}` : `Label ${object.label}`}
              aria-disabled={!interactive || isFound}
              tabIndex={interactive && !isFound ? 0 : -1}
              onPointerDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
              }}
              onPointerUp={(event) => {
                event.preventDefault()
                event.stopPropagation()
                if (interactive && !isFound) onTarget(object)
              }}
              onClick={(event) => {
                if (event.detail === 0 && interactive && !isFound) onTarget(object)
              }}
            >
              {isMarked && <span>{showAllLabels ? `AUTO: ${object.className}` : `${isMissed ? 'MISSED' : object.className}`}</span>}
            </button>
          </div>
        )
      })}
      <div className="boss-player-car" aria-label="Player vehicle"><i /><i /><b /><b /></div>
      {interactive && <div className="boss-freeze-grid" aria-hidden="true" />}
      {(interactive || revealResults) && <strong className="boss-frame-status">FRAME PAUSED</strong>}
      {showAllLabels && <div className="boss-auto-scan" aria-hidden="true" />}
    </div>
  )
}

function DrivingBossStage({ onComplete, onFinish, onExit }: { onComplete: () => void; onFinish: () => void; onExit: () => void }) {
  const { state } = useGame()
  const [phase, setPhase] = useState<BossPhase>('INTRO')
  const [roundIndex, setRoundIndex] = useState(0)
  const [selected, setSelected] = useState<VisionClass | null>(null)
  const [found, setFound] = useState(new Set<string>())
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [score, setScore] = useState<ReturnType<typeof calculateBossScore> | null>(null)
  const [frozenFrame, setFrozenFrame] = useState<BossSceneFrame | null>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const currentFrameRef = useRef<BossSceneFrame | null>(null)
  const completionSavedRef = useRef(false)
  const { feedback, flash } = useTransientFeedback()
  const round = BOSS_ROUNDS[roundIndex]
  const isReplay = phase === 'FINAL_REPLAY' || phase === 'COMPLETE'
  const sceneConfig = isReplay ? BOSS_FINAL_REPLAY : round

  useEffect(() => {
    if (phase !== 'ROUND_OBSERVE' && phase !== 'FINAL_REPLAY') return
    const scene = sceneRef.current
    if (!scene) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const startedAt = performance.now()
    let animationFrame = 0

    const update = (now: number) => {
      const elapsed = reduceMotion ? sceneConfig.observeDurationMs : now - startedAt
      const nextFrame = phase === 'FINAL_REPLAY'
        ? calculateBossReplayFrame(sceneConfig, elapsed)
        : calculateBossFrame(sceneConfig, elapsed)
      currentFrameRef.current = nextFrame
      applyBossFrame(scene, nextFrame)
      if (!reduceMotion) animationFrame = window.requestAnimationFrame(update)
    }

    update(startedAt)
    return () => window.cancelAnimationFrame(animationFrame)
  }, [phase, sceneConfig])

  useEffect(() => {
    if (phase !== 'NEXT_ROUND') return
    const timeout = window.setTimeout(() => {
      setRoundIndex((current) => current + 1)
      setSelected(null)
      setFound(new Set())
      setScore(null)
      setFrozenFrame(null)
      currentFrameRef.current = null
      setPhase('ROUND_OBSERVE')
    }, 850)
    return () => window.clearTimeout(timeout)
  }, [phase])

  useEffect(() => {
    if (phase !== 'FINAL_REPLAY') return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timeout = window.setTimeout(() => {
      setFrozenFrame(currentFrameRef.current ?? calculateBossReplayFrame(BOSS_FINAL_REPLAY, BOSS_FINAL_REPLAY.observeDurationMs))
      setPhase('COMPLETE')
    }, reduceMotion ? 900 : BOSS_FINAL_REPLAY.observeDurationMs + 350)
    return () => window.clearTimeout(timeout)
  }, [phase])

  const choose = (target: VisionTarget | null) => {
    if (phase !== 'ROUND_PAUSED_LABEL') return
    if (!target || !targetMatchesSelection(target, selected)) {
      playTone(state.save.audioEnabled, 'incorrect')
      setWrongAttempts((count) => count + 1)
      flash('scene')
      return
    }
    if (found.has(target.id)) return
    playTone(state.save.audioEnabled)
    setFound((current) => new Set(current).add(target.id))
  }

  const submit = () => {
    const result = calculateBossScore(round.objects, found)
    setScore(result)
    setPhase('ROUND_RESULT')
    if (result.passed) {
      playTone(state.save.audioEnabled)
    } else {
      playTone(state.save.audioEnabled, 'incorrect')
      setWrongAttempts((count) => count + 1)
    }
  }

  const retry = () => {
    setFound(new Set())
    setSelected(null)
    setScore(null)
    setPhase('ROUND_PAUSED_LABEL')
  }

  const pauseFrame = () => {
    const capturedFrame = currentFrameRef.current ?? calculateBossFrame(round, 0)
    setFrozenFrame(capturedFrame)
    if (sceneRef.current) applyBossFrame(sceneRef.current, capturedFrame)
    setPhase('ROUND_PAUSED_LABEL')
  }

  const continueAfterRound = () => {
    if (roundIndex < BOSS_ROUNDS.length - 1) {
      setPhase('NEXT_ROUND')
      return
    }
    if (!completionSavedRef.current) {
      completionSavedRef.current = true
      onComplete()
    }
    setFrozenFrame(null)
    currentFrameRef.current = null
    setPhase('FINAL_REPLAY')
  }

  return (
    <CvStageShell stage={4} wrongAttempts={wrongAttempts} onExit={onExit}>
      <div className="boss-round-readout" aria-live="polite">
        <strong>{isReplay ? 'FINAL REPLAY' : `ROUND ${roundIndex + 1} / ${BOSS_ROUNDS.length}`}</strong>
        <span>{sceneConfig.title}</span>
      </div>
      <div className="boss-sim-wrap">
        <BossRoadScene
          config={sceneConfig}
          frame={phase === 'ROUND_OBSERVE' || phase === 'FINAL_REPLAY' ? null : frozenFrame}
          sceneRef={sceneRef}
          found={found}
          interactive={phase === 'ROUND_PAUSED_LABEL'}
          revealResults={phase === 'ROUND_RESULT'}
          showAllLabels={isReplay}
          replay={isReplay}
          onTarget={choose}
          wrong={feedback === 'scene'}
        />
        {phase === 'ROUND_OBSERVE' && (
          <div className="boss-observe-label">
            <strong>OBSERVE THE ROAD</strong>
            <span>Pause when you are ready to label this live frame.</span>
          </div>
        )}
        {phase === 'FINAL_REPLAY' && (
          <div className="boss-system-active" role="status">
            <strong>SIMULATED VISION SYSTEM ACTIVE</strong>
            <span>Objects detected. Avoidance path engaged.</span>
          </div>
        )}
      </div>
      {phase === 'INTRO' && (
        <div className="boss-intro-panel" role="dialog" aria-label="Autonomous driving training briefing">
          <p>LENS-01 TRAINING BRIEF</p>
          <h2>Teach the vehicle to see</h2>
          <blockquote>Observe each moving road scene. Pause the live frame, then label what the vehicle needs to recognize.</blockquote>
          <div className="boss-intro-facts"><span>3 road rounds</span><span>5 targets each</span><span>80% to pass</span></div>
          <PixelButton onClick={() => setPhase('ROUND_OBSERVE')}>Begin Training</PixelButton>
        </div>
      )}
      {phase === 'ROUND_OBSERVE' && (
        <div className="boss-action-bar is-observing">
          <span>Live feed running</span>
          <PixelButton className="boss-pause-button" onClick={pauseFrame}>Pause Scene</PixelButton>
        </div>
      )}
      {phase === 'ROUND_PAUSED_LABEL' && (
        <div className="boss-action-bar is-labeling">
          <VisionClassButtons className="boss-class-buttons" selected={selected} onSelect={setSelected} />
          <PixelButton className="boss-submit-button" onClick={submit}>Submit Labels</PixelButton>
        </div>
      )}
      {phase === 'ROUND_RESULT' && score && (
        <div className={`boss-score-panel ${score.passed ? 'is-passing' : 'is-failing'}`} role="dialog" aria-label="Vision accuracy score">
          <p>{score.passed ? `ROUND ${roundIndex + 1} CLEAR` : 'RECALIBRATION NEEDED'}</p>
          <strong>{score.accuracy}%</strong>
          <dl>
            <div><dt>Correct targets</dt><dd>{score.correct}</dd></div>
            <div><dt>Missed targets</dt><dd>{score.missed}</dd></div>
          </dl>
          {score.passed
            ? <PixelButton onClick={continueAfterRound}>{roundIndex === BOSS_ROUNDS.length - 1 ? 'Run Final Replay' : 'Next Road Round'}</PixelButton>
            : <PixelButton onClick={retry}>Retry This Frame</PixelButton>}
        </div>
      )}
      {phase === 'NEXT_ROUND' && (
        <div className="boss-next-round" role="status">
          <strong>ROUND {roundIndex + 1} CLEAR</strong>
          <span>Loading the next road moment...</span>
        </div>
      )}
      {phase === 'COMPLETE' && (
        <div className="boss-complete-panel" role="dialog" aria-label="Autonomous driving training complete">
          <p>LENS-01</p>
          <h2>Vision system trained</h2>
          <blockquote>Now the vehicle can recognize the road before reacting to it.</blockquote>
          <span>Every accurate label helps a machine understand the road.</span>
          <PixelButton onClick={onFinish}>Complete Lab</PixelButton>
        </div>
      )}
    </CvStageShell>
  )
}

function CvReplayChoice({ onReplay, onExit }: { onReplay: () => void; onExit: () => void }) {
  return (
    <div className="scene cv-replay-scene lab-cv">
      <div className="cv-replay-panel">
        <div className="replay-lens" aria-hidden="true"><i /></div>
        <p>VISION MODULE ONLINE</p>
        <h2>Training record complete</h2>
        <blockquote>LENS-01: My understanding has improved. My dramatic timing remains flawless.</blockquote>
        <div>
          <PixelButton onClick={onReplay}>Replay Training</PixelButton>
          <PixelButton variant="secondary" onClick={onExit}>Return to Academy</PixelButton>
        </div>
      </div>
    </div>
  )
}

export function CvLabScene() {
  const { state, dispatch } = useGame()
  const initialStage = Math.max(1, Math.min(4, state.save.stageProgress.cv + 1)) as CvStageNumber
  const [stage, setStage] = useState<CvStageNumber>(initialStage)
  const [showReplayChoice, setShowReplayChoice] = useState(state.save.completedLabs.cv && state.save.stageProgress.cv >= 4)

  if (state.currentLab !== 'cv') return null

  const exit = () => dispatch({ type: 'LEAVE_LAB' })
  const saveStage = (completedStage: 1 | 2 | 3) => dispatch({ type: 'RECORD_CV_STAGE', stage: completedStage })

  if (showReplayChoice) {
    return <CvReplayChoice onReplay={() => { setStage(1); setShowReplayChoice(false) }} onExit={exit} />
  }

  if (stage === 1) return <ClassificationStage onSaved={() => saveStage(1)} onContinue={() => setStage(2)} onExit={exit} />
  if (stage === 2) return <DifferenceStage onSaved={() => saveStage(2)} onContinue={() => setStage(3)} onExit={exit} />
  if (stage === 3) return <LocationStage onSaved={() => saveStage(3)} onContinue={() => setStage(4)} onExit={exit} />
  return (
    <DrivingBossStage
      onComplete={() => dispatch({ type: 'COMPLETE_CV_LAB' })}
      onFinish={() => dispatch({ type: 'FINISH_CV_LAB' })}
      onExit={exit}
    />
  )
}
