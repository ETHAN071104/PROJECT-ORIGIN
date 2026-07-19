import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { playEndingCue, playTone } from '../audio/audio'
import { InteractionPrompt } from '../components/InteractionPrompt'
import { PixelRobot } from '../components/PixelRobot'
import { VirtualControls } from '../components/VirtualControls'
import { VoiceParticles } from '../components/VoiceParticles'
import {
  RESEARCH_BOUNDS,
  RESEARCH_FINAL_GATE,
  RESEARCH_FUTURE_DOORS,
  RESEARCH_SPAWNS,
  RESEARCH_WEST_TRANSITION_MIN_Y,
  RESEARCH_WEST_TRANSITION_X,
} from '../data/maps'
import { useGame } from '../game/GameContext'
import { sameActiveInteractable, selectActiveInteractable, type ActiveInteractable, type InteractionCandidate } from '../game/interactions'
import type { Point } from '../game/types'
import { usePlayerMovement } from '../hooks/usePlayerMovement'
import { isVoiceAbilityAvailable, useVoiceExpression } from '../hooks/useVoiceExpression'

const FUTURE_MODULES = [
  {
    id: 'reinforcement-learning',
    title: 'REINFORCEMENT LEARNING',
    subtitle: 'LEARN THROUGH ACTION AND REWARD',
    text: 'An agent acts, observes consequences, and adapts through reward and feedback.',
    icon: 'reward-loop',
    accent: 'amber',
  },
  {
    id: 'generative-ai',
    title: 'GENERATIVE AI',
    subtitle: 'CREATE FROM LEARNED PATTERNS',
    text: 'Generative systems produce new text, images, audio, and other content from patterns learned in data.',
    icon: 'emerging-pixels',
    accent: 'violet',
  },
  {
    id: 'agent-intelligence',
    title: 'AGENT INTELLIGENCE',
    subtitle: 'PLAN, REMEMBER, AND USE TOOLS',
    text: 'Agent systems combine goals, planning, memory, tools, and multi-step actions.',
    icon: 'agent-nodes',
    accent: 'cyan',
  },
] as const

type FutureModule = typeof FUTURE_MODULES[number]
type ActivePanel = { kind: 'module'; module: FutureModule; align: 'left' | 'right' } | { kind: 'gate'; align: 'left' | 'right' }

const WEST_EXIT: InteractionCandidate = {
  id: 'research-to-hub',
  actionLabel: 'Return to Central Plaza',
  type: 'transition',
  priority: 100,
  position: { x: 92, y: 350 },
  interactionRadius: 54,
}

function usePanelKeys(onClose: () => void, closeOnConfirm = true) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Escape' && !(closeOnConfirm && ['Enter', 'KeyE', 'Space'].includes(event.code))) return
      event.preventDefault()
      if (!event.repeat) onClose()
    }
    window.addEventListener('keydown', onKeyDown, { passive: false })
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeOnConfirm, onClose])
}

function FutureModulePanel({ module, align, onClose }: { module: FutureModule; align: 'left' | 'right'; onClose: () => void }) {
  usePanelKeys(onClose)
  return (
    <aside className={`research-info-panel is-${align} accent-${module.accent}`} role="dialog" aria-modal="true" aria-label={`${module.title}, access locked`}>
      <button type="button" className="archive-panel-close" aria-label={`Close ${module.title}`} onClick={onClose}>×</button>
      <div className={`future-panel-icon icon-${module.icon}`} aria-hidden="true"><i /><i /><i /><b /></div>
      <span>FUTURE MODULE</span>
      <h2>{module.title}</h2>
      <strong>{module.subtitle}</strong>
      <p>{module.text}</p>
      <footer><b>ACCESS LOCKED</b><button type="button" onClick={onClose}>CLOSE</button></footer>
    </aside>
  )
}

function FinalGatePanel({ align, endingCompleted, onBegin, onClose }: { align: 'left' | 'right'; endingCompleted: boolean; onBegin: () => void; onClose: () => void }) {
  usePanelKeys(onClose, false)
  const modules = ['CV', 'ML', 'NLP', 'DL']
  return (
    <aside className={`research-info-panel final-scan-panel is-${align}`} role="dialog" aria-modal="true" aria-label="Archive Zero foundational intelligence scan">
      <button type="button" className="archive-panel-close" aria-label="Close Archive Zero scan" onClick={onClose}>×</button>
      <span>ARCHIVE ZERO // IDENTITY SCAN</span>
      <h2>FOUNDATIONAL INTELLIGENCE RESTORED</h2>
      <div className="foundational-scan-grid">
        {modules.map((module) => <div key={module}><strong>{module}</strong><i />RESTORED</div>)}
      </div>
      <div className="origin-record-message"><i />ORIGIN RECORD DETECTED</div>
      <footer>
        <b>{endingCompleted ? 'ORIGIN RECORD ACCESSED' : 'ORIGIN PATH OPEN'}</b>
        <button type="button" onClick={onBegin}>{endingCompleted ? 'REPLAY PATH' : 'ENTER'}</button>
        <button type="button" onClick={onClose}>CLOSE</button>
      </footer>
    </aside>
  )
}

export function ResearchMapScene() {
  const { state, dispatch } = useGame()
  const [activePanel, setActivePanel] = useState<ActivePanel | null>(null)
  const transitioned = useRef(false)
  const spawn = RESEARCH_SPAWNS[state.researchSpawn]
  const languageRestored = state.save.completedLabs.nlp
  const voiceAvailable = isVoiceAbilityAvailable(languageRestored, !activePanel)
  const voice = useVoiceExpression(voiceAvailable, state.save.audioEnabled)

  const candidates = useMemo<readonly InteractionCandidate[]>(() => [
    WEST_EXIT,
    ...RESEARCH_FUTURE_DOORS.map((door) => {
      const module = FUTURE_MODULES.find((item) => item.id === door.id)!
      return {
        ...door,
        id: `future-${door.id}`,
        actionLabel: `Inspect ${module.title}`,
        type: 'research-door' as const,
        priority: 70,
      }
    }),
    {
      ...RESEARCH_FINAL_GATE,
      id: 'archive-zero',
      actionLabel: state.save.endingCompleted ? 'Revisit ARCHIVE ZERO' : 'Enter ARCHIVE ZERO',
      type: 'gate' as const,
      priority: 90,
    },
  ], [state.save.endingCompleted])
  const [activeInteractable, setActiveInteractable] = useState<ActiveInteractable | null>(() => (
    selectActiveInteractable(spawn.position, candidates)
  ))

  const updateActive = useCallback((position: Point) => {
    const next = activePanel ? null : selectActiveInteractable(position, candidates)
    setActiveInteractable((current) => sameActiveInteractable(current, next) ? current : next)
  }, [activePanel, candidates])

  const returnToHub = useCallback(() => {
    if (transitioned.current) return
    transitioned.current = true
    setActiveInteractable(null)
    playTone(state.save.audioEnabled, 'confirm')
    dispatch({ type: 'RETURN_TO_HUB_FROM_RESEARCH' })
  }, [dispatch, state.save.audioEnabled])

  const updatePosition = useCallback((position: Point) => {
    if (position.x <= RESEARCH_WEST_TRANSITION_X && position.y >= RESEARCH_WEST_TRANSITION_MIN_Y) return returnToHub()
    updateActive(position)
  }, [returnToHub, updateActive])

  const interact = useCallback(() => {
    if (!activeInteractable || activePanel || transitioned.current) return
    if (activeInteractable.id === WEST_EXIT.id) return returnToHub()
    if (activeInteractable.id === 'archive-zero') {
      playTone(state.save.audioEnabled, 'complete')
      dispatch({ type: 'REACH_FINAL_GATE' })
      setActivePanel({ kind: 'gate', align: 'left' })
      setActiveInteractable(null)
      return
    }
    const module = FUTURE_MODULES.find((item) => `future-${item.id}` === activeInteractable.id)
    if (!module) return
    playTone(state.save.audioEnabled, 'alarm')
    const door = RESEARCH_FUTURE_DOORS.find((item) => item.id === module.id)!
    setActivePanel({ kind: 'module', module, align: door.position.x < 480 ? 'right' : 'left' })
    setActiveInteractable(null)
  }, [activeInteractable, activePanel, dispatch, returnToHub, state.save.audioEnabled])

  const movement = usePlayerMovement({
    active: !activePanel && !transitioned.current,
    initialPosition: spawn.position,
    initialDirection: spawn.direction,
    bounds: RESEARCH_BOUNDS,
    speed: 160,
    audioEnabled: state.save.audioEnabled,
    onPositionChange: updatePosition,
    onInteract: interact,
  })

  const closePanel = useCallback(() => {
    setActivePanel(null)
    setActiveInteractable(selectActiveInteractable(movement.positionRef.current, candidates))
  }, [candidates, movement.positionRef])

  const beginEnding = useCallback(() => {
    setActivePanel(null)
    setActiveInteractable(null)
    playEndingCue(state.save.audioEnabled, 'gate')
    dispatch({ type: 'START_ENDING' })
  }, [dispatch, state.save.audioEnabled])

  return (
    <div className="scene research-map-scene">
      <div className="scene-hud research-hud">
        <div><span>SECTOR</span><strong>RESEARCH—EAST</strong></div>
        <div className="hub-title"><span>RESEARCH LAB COMPLEX</span><strong>FUTURE MODULE CORRIDOR</strong></div>
        <div><span>FINAL GATE</span><strong>{state.save.endingCompleted ? 'ACCESSED' : state.save.worldProgress.finalGateReached ? 'OPEN' : 'DETECTED'}</strong></div>
      </div>

      <div className="research-map research-complex-map" aria-label="Research Lab Complex with three sealed future modules and the Archive Zero Final Gate">
        <div className="complex-wall-grid" aria-hidden="true" />
        <div className="complex-floor" aria-hidden="true" />
        <div className="complex-entrance-sign">← CENTRAL PLAZA</div>
        <div className="complex-depth-label">RESEARCH DEPTH // 01</div>

        {FUTURE_MODULES.map((module, index) => (
          <section
            key={module.id}
            className={`future-module-door accent-${module.accent}`}
            style={{ '--door-x': `${RESEARCH_FUTURE_DOORS[index].position.x}px` } as CSSProperties}
            aria-label={`${module.title}, future module, access locked`}
          >
            <div className={`future-door-icon icon-${module.icon}`}><i /><i /><i /><b /></div>
            <span>FUTURE MODULE</span>
            <strong>{module.title}</strong>
            <small>{module.subtitle}</small>
            <div className="sealed-door-face"><i /><b>LOCKED</b></div>
            <div className="future-release-sign" aria-hidden="true"><i /><span>COMING SOON</span><small>TO BE UPDATED</small></div>
          </section>
        ))}

        <div className="final-corridor" aria-hidden="true">
          <i /><i /><i /><i />
          <div className="corridor-origin-symbol"><b>ORIGIN</b><span /></div>
          <div className="corridor-module-lights"><span>CV</span><span>ML</span><span>NLP</span><span>DL</span></div>
        </div>

        <section className={`archive-zero-gate ${state.save.endingCompleted ? 'is-accessed' : state.save.worldProgress.finalGateReached ? 'is-open' : ''}`} aria-label="Archive Zero Final Gate">
          <div className="archive-zero-rails" aria-hidden="true"><i /><i /><i /><i /></div>
          <div className="archive-zero-crown"><i /><i /><b /></div>
          <span>FINAL GATE</span><strong>ARCHIVE ZERO</strong>
          <div className="archive-zero-status" aria-hidden="true"><i />{state.save.endingCompleted ? 'ORIGIN RECORD ACCESSED' : state.save.worldProgress.finalGateReached ? 'ORIGIN PATH OPEN' : 'ORIGIN SEAL // PENDING'}<i /></div>
          <div className="archive-zero-door">
            <i /><i /><b /><span />
            <div className="archive-zero-lock-core" aria-hidden="true"><i /><i /><i /><b /></div>
          </div>
          <div className="archive-zero-foundation" aria-hidden="true"><i /><b>FINAL ACCESS</b><i /></div>
          <div className="archive-zero-scanner">SCAN<i /></div>
        </section>

        <div ref={movement.playerRef} className="player-on-map" style={movement.playerStyle} data-player-direction={movement.direction}>
          <VoiceParticles expression={voice.expression} className="research-note" />
          <PixelRobot direction={movement.direction} walking={movement.walking} visionUpgraded learningUpgraded communicationUpgraded deepLearningUpgraded />
        </div>
      </div>

      <div className="map-action-hints">
        <InteractionPrompt active={activePanel ? null : activeInteractable} className="research-prompt" />
        {voiceAvailable && <div className="voice-prompt research-voice"><span>F</span>VOICE</div>}
      </div>
      <VirtualControls
        onDirectionChange={movement.input.setDirection}
        onReset={movement.input.resetDirections}
        onInteract={!activePanel && activeInteractable ? interact : undefined}
        interactionLabel={activeInteractable?.actionLabel}
        onExpress={voiceAvailable ? voice.express : undefined}
      />

      {activePanel?.kind === 'module' && <FutureModulePanel module={activePanel.module} align={activePanel.align} onClose={closePanel} />}
      {activePanel?.kind === 'gate' && <FinalGatePanel align={activePanel.align} endingCompleted={state.save.endingCompleted} onBegin={beginEnding} onClose={closePanel} />}
    </div>
  )
}
