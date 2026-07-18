import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { playTone } from '../audio/audio'
import { PixelRobot } from '../components/PixelRobot'
import { VirtualControls } from '../components/VirtualControls'
import {
  RESEARCH_BOUNDS,
  RESEARCH_FINAL_GATE,
  RESEARCH_FUTURE_DOORS,
  RESEARCH_SPAWNS,
  RESEARCH_WEST_TRANSITION_X,
} from '../data/maps'
import { useGame } from '../game/GameContext'
import type { Point } from '../game/types'
import { usePlayerMovement } from '../hooks/usePlayerMovement'
import { useVoiceExpression } from '../hooks/useVoiceExpression'

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

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)

function usePanelKeys(onClose: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!['Escape', 'Enter', 'KeyE', 'Space'].includes(event.code)) return
      event.preventDefault()
      if (!event.repeat) onClose()
    }
    window.addEventListener('keydown', onKeyDown, { passive: false })
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])
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

function FinalGatePanel({ align, onClose }: { align: 'left' | 'right'; onClose: () => void }) {
  usePanelKeys(onClose)
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
      <footer><b>AUTHORIZATION PENDING</b><button type="button" onClick={onClose}>CLOSE</button></footer>
    </aside>
  )
}

export function ResearchMapScene() {
  const { state, dispatch } = useGame()
  const [prompt, setPrompt] = useState('Proceed through the future module corridor')
  const [activePanel, setActivePanel] = useState<ActivePanel | null>(null)
  const transitioned = useRef(false)
  const spawn = RESEARCH_SPAWNS[state.researchSpawn]
  const voice = useVoiceExpression(state.save.completedLabs.nlp && !activePanel, state.save.audioEnabled)

  const returnToHistory = useCallback(() => {
    if (transitioned.current) return
    transitioned.current = true
    playTone(state.save.audioEnabled, 'confirm')
    dispatch({ type: 'RETURN_TO_HISTORY' })
  }, [dispatch, state.save.audioEnabled])

  const updatePrompt = useCallback((position: Point) => {
    if (position.x <= RESEARCH_WEST_TRANSITION_X && position.y >= 300) {
      returnToHistory()
      return
    }
    if (distance(position, RESEARCH_FINAL_GATE.position) <= RESEARCH_FINAL_GATE.interactionRadius) {
      setPrompt('Scan the ARCHIVE ZERO Final Gate')
      return
    }
    const nearDoor = RESEARCH_FUTURE_DOORS.find((door) => distance(position, door.position) <= door.interactionRadius)
    if (nearDoor) {
      const module = FUTURE_MODULES.find((item) => item.id === nearDoor.id)
      setPrompt(module ? `Inspect sealed module: ${module.title}` : 'Inspect sealed future module')
      return
    }
    setPrompt(position.x < 150 ? 'West corridor — return to Hall of Origins' : position.x > 700 ? 'Four restored signals are reacting ahead' : 'Proceed through the future module corridor')
  }, [returnToHistory])

  const interact = useCallback((position: Point) => {
    if (activePanel) {
      setActivePanel(null)
      return
    }
    if (position.x < 120 && position.y >= 300) {
      returnToHistory()
      return
    }
    if (distance(position, RESEARCH_FINAL_GATE.position) <= RESEARCH_FINAL_GATE.interactionRadius) {
      playTone(state.save.audioEnabled, 'complete')
      dispatch({ type: 'REACH_FINAL_GATE' })
      setActivePanel({ kind: 'gate', align: 'left' })
      return
    }
    const door = RESEARCH_FUTURE_DOORS.find((target) => distance(position, target.position) <= target.interactionRadius)
    const module = door ? FUTURE_MODULES.find((item) => item.id === door.id) : undefined
    if (!module || !door) {
      setPrompt('Move closer to a sealed module door or the Final Gate')
      return
    }
    playTone(state.save.audioEnabled, 'alarm')
    setActivePanel({ kind: 'module', module, align: door.position.x < 480 ? 'right' : 'left' })
  }, [activePanel, dispatch, returnToHistory, state.save.audioEnabled])

  const movement = usePlayerMovement({
    active: !activePanel,
    initialPosition: spawn.position,
    initialDirection: spawn.direction,
    bounds: RESEARCH_BOUNDS,
    speed: 160,
    audioEnabled: state.save.audioEnabled,
    onPositionChange: updatePrompt,
    onInteract: interact,
  })

  return (
    <div className="scene research-map-scene">
      <div className="scene-hud research-hud">
        <div><span>SECTOR</span><strong>RESEARCH—EAST</strong></div>
        <div className="hub-title"><span>RESEARCH LAB COMPLEX</span><strong>FUTURE MODULE CORRIDOR</strong></div>
        <div><span>FINAL GATE</span><strong>{state.save.worldProgress.finalGateReached ? 'PENDING' : 'DETECTED'}</strong></div>
      </div>

      <div className="research-map research-complex-map" aria-label="Research Lab Complex with three sealed future modules and the Archive Zero Final Gate">
        <div className="complex-wall-grid" aria-hidden="true" />
        <div className="complex-floor" aria-hidden="true" />
        <div className="complex-entrance-sign">← HALL OF ORIGINS</div>
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
          </section>
        ))}

        <div className="final-corridor" aria-hidden="true">
          <i /><i /><i /><i />
          <div className="corridor-origin-symbol"><b>ORIGIN</b><span /></div>
          <div className="corridor-module-lights"><span>CV</span><span>ML</span><span>NLP</span><span>DL</span></div>
        </div>

        <section className="archive-zero-gate" aria-label="Archive Zero Final Gate">
          <div className="archive-zero-crown"><i /><i /><b /></div>
          <span>FINAL GATE</span><strong>ARCHIVE ZERO</strong>
          <div className="archive-zero-door"><i /><i /><b /><span /></div>
          <div className="archive-zero-scanner">SCAN<i /></div>
        </section>

        <div ref={movement.playerRef} className="player-on-map" style={movement.playerStyle} data-player-direction={movement.direction}>
          {voice.expression && <span key={voice.expression.id} className="voice-note-bubble research-note">♪ {voice.expression.note}</span>}
          <PixelRobot direction={movement.direction} walking={movement.walking} visionUpgraded learningUpgraded communicationUpgraded deepLearningUpgraded />
        </div>
      </div>

      <div className="map-action-hints">
        <div className="interaction-prompt research-prompt"><span>E</span>{prompt}</div>
        <div className="voice-prompt research-voice"><span>F</span>VOICE</div>
      </div>
      <VirtualControls
        onDirectionChange={movement.input.setDirection}
        onReset={movement.input.resetDirections}
        onInteract={() => interact(movement.positionRef.current)}
        onExpress={voice.express}
      />

      {activePanel?.kind === 'module' && <FutureModulePanel module={activePanel.module} align={activePanel.align} onClose={() => setActivePanel(null)} />}
      {activePanel?.kind === 'gate' && <FinalGatePanel align={activePanel.align} onClose={() => setActivePanel(null)} />}
    </div>
  )
}
