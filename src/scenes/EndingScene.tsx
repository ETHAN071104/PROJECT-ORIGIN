import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { playEndingCue, playTone } from '../audio/audio'
import { PixelButton } from '../components/PixelButton'
import { PixelRobot } from '../components/PixelRobot'
import { useGame } from '../game/GameContext'
import { useSceneInput } from '../hooks/useSceneInput'

type EndingPhase =
  | 'FINAL_GATE_SCAN'
  | 'FINAL_GATE_OPEN'
  | 'DARK_CHAMBER_ENTRY'
  | 'PLAYER_CONTROLLED_WALK'
  | 'IMPACT_STOP'
  | 'CAMERA_REVEAL_LEG'
  | 'CAMERA_TILT_UP'
  | 'GIANT_ROBOT_CLOSEUP'
  | 'ENDING_TEXT_1'
  | 'ENDING_TEXT_2'
  | 'ENDING_TEXT_3'
  | 'LOGO_END'
  | 'ENDING_OPTIONS'

const PHASES: EndingPhase[] = [
  'FINAL_GATE_SCAN',
  'FINAL_GATE_OPEN',
  'DARK_CHAMBER_ENTRY',
  'PLAYER_CONTROLLED_WALK',
  'IMPACT_STOP',
  'CAMERA_REVEAL_LEG',
  'CAMERA_TILT_UP',
  'GIANT_ROBOT_CLOSEUP',
  'ENDING_TEXT_1',
  'ENDING_TEXT_2',
  'ENDING_TEXT_3',
  'LOGO_END',
  'ENDING_OPTIONS',
]

const PHASE_DURATION: Partial<Record<EndingPhase, number>> = {
  FINAL_GATE_SCAN: 2400,
  FINAL_GATE_OPEN: 2700,
  DARK_CHAMBER_ENTRY: 1900,
  IMPACT_STOP: 1200,
  CAMERA_REVEAL_LEG: 1800,
  CAMERA_TILT_UP: 3800,
  GIANT_ROBOT_CLOSEUP: 3100,
  ENDING_TEXT_1: 3300,
  ENDING_TEXT_2: 3300,
  ENDING_TEXT_3: 3500,
  LOGO_END: 3800,
}

const PHASE_LABELS: Record<EndingPhase, string> = {
  FINAL_GATE_SCAN: 'Archive Zero confirms that foundational intelligence is restored and detects the Origin Record.',
  FINAL_GATE_OPEN: 'The Origin Path opens.',
  DARK_CHAMBER_ENTRY: 'A dark, silent chamber lies beyond the gate.',
  PLAYER_CONTROLLED_WALK: 'Walk forward a few steps.',
  IMPACT_STOP: 'ORI softly bumps into an enormous object.',
  CAMERA_REVEAL_LEG: 'The object is the leg of a gigantic robot.',
  CAMERA_TILT_UP: 'The camera reveals a giant original robot and silent figures behind it.',
  GIANT_ROBOT_CLOSEUP: 'The giant robot awakens one quiet eye and waits for builders.',
  ENDING_TEXT_1: 'You are still small. But every great intelligence begins somewhere.',
  ENDING_TEXT_2: 'Keep learning. Someday, you may stand among giants.',
  ENDING_TEXT_3: 'Become one of the AI developers who build the future.',
  LOGO_END: 'Project Origin. Every AI has an origin. This is yours.',
  ENDING_OPTIONS: 'Choose to return to the title or continue exploring.',
}

function GiantRobot({ className = '' }: { className?: string }) {
  return (
    <div className={`origin-giant ${className}`} aria-hidden="true">
      <div className="giant-antenna"><i /><i /><b /></div>
      <div className="giant-head"><i className="giant-eye" /><i className="giant-eye-dim" /><b /></div>
      <div className="giant-neck" />
      <div className="giant-torso">
        <i className="giant-armor armor-left" /><i className="giant-armor armor-right" />
        <b className="giant-core"><i /></b>
        <span className="giant-origin-mark">O</span>
      </div>
      <div className="giant-arm giant-arm-left"><i /></div>
      <div className="giant-arm giant-arm-right"><i /></div>
      <div className="giant-leg giant-leg-left"><i /></div>
      <div className="giant-leg giant-leg-right"><i /></div>
    </div>
  )
}

function ArchiveGate({ open }: { open: boolean }) {
  return (
    <div className={`cinematic-archive-gate ${open ? 'is-opening' : ''}`} aria-hidden="true">
      <div className="cinematic-gate-crown"><i /><b /><i /></div>
      <div className="cinematic-gate-label"><span>FINAL GATE</span><strong>ARCHIVE ZERO</strong></div>
      <div className="cinematic-gate-frame">
        <i className="gate-rail gate-rail-left" /><i className="gate-rail gate-rail-right" />
        <div className="cinematic-gate-panel panel-left"><i /><b /></div>
        <div className="cinematic-gate-panel panel-right"><i /><b /></div>
        <div className="cinematic-gate-seal"><i /><b /></div>
      </div>
      <div className="cinematic-gate-floor"><i /><i /><i /></div>
    </div>
  )
}

export function EndingScene() {
  const { state, dispatch } = useGame()
  const [phase, setPhase] = useState<EndingPhase>('FINAL_GATE_SCAN')
  const [walking, setWalking] = useState(false)
  const walkerRef = useRef<HTMLDivElement>(null)
  const walkSteps = useRef(0)
  const previousUp = useRef(false)
  const phaseStartedAt = useRef(performance.now())
  const playedCue = useRef<EndingPhase | null>(null)
  const completedDispatched = useRef(false)

  const advance = useCallback(() => {
    setPhase((current) => {
      const next = PHASES[PHASES.indexOf(current) + 1]
      return next ?? current
    })
  }, [])

  useEffect(() => {
    phaseStartedAt.current = performance.now()
    const duration = PHASE_DURATION[phase]
    if (!duration) return
    const timer = window.setTimeout(advance, duration)
    return () => window.clearTimeout(timer)
  }, [advance, phase])

  useEffect(() => {
    if (playedCue.current === phase) return
    playedCue.current = phase
    if (phase === 'FINAL_GATE_SCAN') playTone(state.save.audioEnabled, 'connect')
    if (phase === 'FINAL_GATE_OPEN') playEndingCue(state.save.audioEnabled, 'gate')
    if (phase === 'IMPACT_STOP') playEndingCue(state.save.audioEnabled, 'impact')
    if (phase === 'CAMERA_TILT_UP') playEndingCue(state.save.audioEnabled, 'reveal')
    if (phase === 'GIANT_ROBOT_CLOSEUP') playEndingCue(state.save.audioEnabled, 'core')
  }, [phase, state.save.audioEnabled])

  useEffect(() => {
    if (phase !== 'ENDING_OPTIONS' || completedDispatched.current) return
    completedDispatched.current = true
    dispatch({ type: 'COMPLETE_ENDING' })
  }, [dispatch, phase])

  const onWalkFrame = useCallback((input: { up: boolean }) => {
    if (phase !== 'PLAYER_CONTROLLED_WALK') return
    if (!input.up) {
      previousUp.current = false
      setWalking(false)
      return
    }
    if (previousUp.current) return
    previousUp.current = true
    setWalking(true)
    walkSteps.current += 1
    walkerRef.current?.style.setProperty('--ending-walk-distance', `${Math.min(78, walkSteps.current * 26)}px`)
    if (walkSteps.current < 3) return
    window.setTimeout(() => {
      setWalking(false)
      setPhase('IMPACT_STOP')
    }, 220)
  }, [phase])

  const input = useSceneInput(phase === 'PLAYER_CONTROLLED_WALK', onWalkFrame, () => undefined)

  const skipIfReady = useCallback(() => {
    if (phase === 'PLAYER_CONTROLLED_WALK' || phase === 'ENDING_OPTIONS') return
    if (performance.now() - phaseStartedAt.current < 850) return
    advance()
  }, [advance, phase])

  useEffect(() => {
    if (phase === 'PLAYER_CONTROLLED_WALK' || phase === 'ENDING_OPTIONS') return
    const onKeyDown = (event: KeyboardEvent) => {
      if (!['Enter', 'KeyE', 'Space'].includes(event.code) || event.repeat) return
      event.preventDefault()
      skipIfReady()
    }
    window.addEventListener('keydown', onKeyDown, { passive: false })
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [phase, skipIfReady])

  const pressForward = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    input.setDirection('up', true)
  }

  const releaseForward = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    input.setDirection('up', false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const gatePhase = phase === 'FINAL_GATE_SCAN' || phase === 'FINAL_GATE_OPEN'
  const chamberPhase = ['DARK_CHAMBER_ENTRY', 'PLAYER_CONTROLLED_WALK', 'IMPACT_STOP', 'CAMERA_REVEAL_LEG', 'CAMERA_TILT_UP'].includes(phase)
  const textPhase = phase.startsWith('ENDING_TEXT')

  return (
    <div
      className={`scene ending-scene ending-phase-${phase.toLowerCase().replaceAll('_', '-')}`}
      aria-label="Project Origin final cinematic"
      onPointerUp={skipIfReady}
    >
      <p className="sr-only" aria-live="polite">{PHASE_LABELS[phase]}</p>

      {gatePhase && (
        <div className="ending-gate-shot">
          <div className="ending-scan-lines" aria-hidden="true"><i /><i /><i /><i /></div>
          <ArchiveGate open={phase === 'FINAL_GATE_OPEN'} />
          <div className="ending-gate-copy">
            {phase === 'FINAL_GATE_SCAN' ? (
              <>
                <span>ARCHIVE ZERO // IDENTITY SCAN</span>
                <strong>FOUNDATIONAL INTELLIGENCE RESTORED</strong>
                <div><i />CV<i />ML<i />NLP<i />DL</div>
                <b>ORIGIN RECORD DETECTED</b>
              </>
            ) : (
              <><span>ACCESS GRANTED</span><strong>ORIGIN PATH OPEN</strong></>
            )}
          </div>
        </div>
      )}

      {chamberPhase && (
        <div className="ending-chamber">
          <div className="chamber-void" aria-hidden="true"><i /><i /><i /></div>
          <div className="chamber-path" aria-hidden="true"><i /><i /><i /><i /></div>
          <div
            ref={walkerRef}
            className="ending-walker"
            style={{ '--ending-walk-distance': '0px' } as CSSProperties}
          >
            <PixelRobot direction="up" walking={walking} visionUpgraded learningUpgraded communicationUpgraded deepLearningUpgraded />
          </div>

          {phase === 'DARK_CHAMBER_ENTRY' && <div className="chamber-title"><span>ARCHIVE ZERO</span><strong>ORIGIN CHAMBER</strong></div>}
          {phase === 'PLAYER_CONTROLLED_WALK' && (
            <div className="ending-walk-control">
              <span>CONTROL RESTORED</span>
              <strong>W / ▲</strong>
              <small>PRESS 3 TIMES</small>
              <button
                type="button"
                aria-label="Walk forward"
                onPointerDown={pressForward}
                onPointerUp={releaseForward}
                onPointerCancel={releaseForward}
                onLostPointerCapture={releaseForward}
              >▲<i /><i /><i /></button>
            </div>
          )}

          {['IMPACT_STOP', 'CAMERA_REVEAL_LEG'].includes(phase) && (
            <div className="impact-leg" aria-hidden="true"><i /><b /><span /></div>
          )}
          {phase === 'IMPACT_STOP' && <div className="impact-mark" aria-hidden="true"><i /><i /><i /></div>}
          {phase === 'CAMERA_REVEAL_LEG' && <div className="reveal-caption"><span>OBJECT SCALE</span><strong>UNKNOWN</strong></div>}

          {phase === 'CAMERA_TILT_UP' && (
            <div className="giant-reveal-stage">
              <GiantRobot className="giant-background giant-back-left" />
              <GiantRobot className="giant-background giant-back-right" />
              <GiantRobot className="giant-background giant-back-far" />
              <GiantRobot className="giant-primary" />
            </div>
          )}
        </div>
      )}

      {phase === 'GIANT_ROBOT_CLOSEUP' && (
        <div className="giant-closeup">
          <div className="closeup-silhouettes" aria-hidden="true"><i /><i /><i /></div>
          <GiantRobot className="giant-closeup-figure" />
          <div className="closeup-status"><i />AWAITING BUILDERS<i /></div>
        </div>
      )}

      {textPhase && (
        <div className="ending-text-card">
          <i className="ending-text-mark" aria-hidden="true" />
          {phase === 'ENDING_TEXT_1' && <p>You are still small.<br />But every great intelligence<br />begins somewhere.</p>}
          {phase === 'ENDING_TEXT_2' && <p>Keep learning.<br />Someday,<br />you may stand among giants.</p>}
          {phase === 'ENDING_TEXT_3' && <p>Become one of the AI developers<br />who build the future.</p>}
        </div>
      )}

      {(phase === 'LOGO_END' || phase === 'ENDING_OPTIONS') && (
        <div className={`ending-logo-card ${phase === 'ENDING_OPTIONS' ? 'has-options' : ''}`}>
          <div className="ending-origin-seal" aria-hidden="true"><i /><b /><i /></div>
          <span>AI ACADEMY ARCHIVE</span>
          <h1>PROJECT<br /><strong>ORIGIN</strong></h1>
          <p>Every AI has an origin.<br /><b>This is yours.</b></p>
          {phase === 'ENDING_OPTIONS' && (
            <div className="ending-options">
              <PixelButton onClick={() => dispatch({ type: 'END_ENDING_TO_TITLE' })}>RETURN TO TITLE</PixelButton>
              <PixelButton variant="secondary" onClick={() => dispatch({ type: 'CONTINUE_EXPLORING' })}>CONTINUE EXPLORING</PixelButton>
            </div>
          )}
        </div>
      )}

      {!['PLAYER_CONTROLLED_WALK', 'ENDING_OPTIONS'].includes(phase) && (
        <div className="ending-skip-hint">E / ENTER / TAP&nbsp;&nbsp;CONTINUE</div>
      )}
    </div>
  )
}
