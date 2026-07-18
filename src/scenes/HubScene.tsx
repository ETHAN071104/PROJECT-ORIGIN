import { useCallback, useRef, useState } from 'react'
import { playTone } from '../audio/audio'
import { PixelRobot } from '../components/PixelRobot'
import { VirtualControls } from '../components/VirtualControls'
import { HUB_BOUNDS, HUB_EAST_TRANSITION_X, HUB_SPAWNS, HUB_TARGETS, type HubTarget } from '../data/maps'
import { useGame } from '../game/GameContext'
import { allLabsComplete } from '../game/reducer'
import type { LabId, Point } from '../game/types'
import { usePlayerMovement } from '../hooks/usePlayerMovement'
import { useVoiceExpression } from '../hooks/useVoiceExpression'

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)

function nearestTarget(position: Point): HubTarget {
  return HUB_TARGETS.reduce((best, target) => distance(position, target.position) < distance(position, best.position) ? target : best)
}

export function HubScene() {
  const { state, dispatch } = useGame()
  const dayUnlocked = state.save.completedLabs.cv
  const learningRestored = state.save.completedLabs.ml
  const languageRestored = state.save.completedLabs.nlp
  const researchPowered = allLabsComplete(state.save)
  const defaultPrompt = dayUnlocked ? 'Explore the awakened academy' : 'The academy is quiet. Follow the lit paths.'
  const [prompt, setPrompt] = useState(defaultPrompt)
  const transitioned = useRef(false)
  const spawn = HUB_SPAWNS[state.hubSpawn]
  const voice = useVoiceExpression(languageRestored, state.save.audioEnabled)

  const enterResearchRoute = useCallback(() => {
    if (transitioned.current) return
    transitioned.current = true
    playTone(state.save.audioEnabled, 'confirm')
    dispatch({ type: 'ENTER_RESEARCH_ROUTE' })
  }, [dispatch, state.save.audioEnabled])

  const updatePrompt = useCallback((position: Point) => {
    if (position.x >= HUB_EAST_TRANSITION_X && position.y >= 238 && position.y <= 356) {
      enterResearchRoute()
      return
    }

    const target = nearestTarget(position)
    let nextPrompt = defaultPrompt
    if (distance(position, target.position) <= target.interactionRadius) {
      if (target.id === 'east-gate') nextPrompt = researchPowered ? 'East route online — press E to travel' : 'Press E to follow the silent east route'
      else if (target.id === 'dl') nextPrompt = 'Deep Learning Lab is dormant'
      else nextPrompt = `Press E to enter ${target.id.toUpperCase()} Lab`
    }
    setPrompt((current) => current === nextPrompt ? current : nextPrompt)
  }, [defaultPrompt, enterResearchRoute, researchPowered])

  const interact = useCallback((position: Point) => {
    const target = nearestTarget(position)
    if (distance(position, target.position) > target.interactionRadius) {
      setPrompt('Move closer to a lab door or campus gate')
      return
    }
    if (target.id === 'east-gate') {
      enterResearchRoute()
      return
    }
    if (target.id === 'dl') {
      playTone(state.save.audioEnabled, 'incorrect')
      setPrompt('No signal. This lab has not awakened yet.')
      return
    }
    playTone(state.save.audioEnabled)
    dispatch({ type: 'ENTER_LAB', lab: target.id })
  }, [dispatch, enterResearchRoute, state.save.audioEnabled])

  const movement = usePlayerMovement({
    active: true,
    initialPosition: spawn.position,
    initialDirection: spawn.direction,
    bounds: HUB_BOUNDS,
    speed: 155,
    audioEnabled: state.save.audioEnabled,
    onPositionChange: updatePrompt,
    onInteract: interact,
  })

  const mapClasses = [
    'hub-map',
    dayUnlocked ? 'is-day' : 'is-night',
    learningRestored ? 'has-learning' : '',
    languageRestored ? 'has-language' : '',
    researchPowered ? 'research-route-active' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="scene hub-scene">
      <div className="scene-hud campus-hud">
        <div><span>UNIT</span><strong>{state.save.playerName}</strong></div>
        <div className="hub-title"><span>AI ACADEMY</span><strong>{dayUnlocked ? 'DAY CAMPUS' : 'NIGHT CAMPUS'}</strong></div>
        <div><span>LAB SIGNALS</span><strong>{Object.values(state.save.completedLabs).filter(Boolean).length} / 3</strong></div>
      </div>

      <div className={mapClasses} aria-label={`${dayUnlocked ? 'Daytime' : 'Nighttime'} AI Academy campus map`}>
        <div className="campus-stars" aria-hidden="true" />
        <div className="campus-path path-north" /><div className="campus-path path-west" />
        <div className="campus-path path-southwest" /><div className="campus-path path-east" />
        <div className="campus-path path-entry" />
        <div className="plaza-pavers" aria-hidden="true" />

        <CampusLabBuilding id="cv" label="CV" completed={state.save.completedLabs.cv} />
        <CampusLabBuilding id="ml" label="ML" completed={state.save.completedLabs.ml} />
        <CampusLabBuilding id="nlp" label="NLP" completed={state.save.completedLabs.nlp} />
        <CampusLabBuilding id="dl" label="DL" completed={false} locked />

        <div className="origin-plaza" aria-label="ORIGIN academy emblem">
          <div className="origin-mark"><i /><i /><i /><i /><b>ORIGIN</b></div>
        </div>

        <div className="east-gate" aria-label="East gate to the Research route">
          <i className="gate-post gate-post-top" /><i className="gate-post gate-post-bottom" />
          <span>{languageRestored ? 'EAST' : 'E_ST'}</span><b aria-hidden="true">›</b>
          <div className="gate-beacon"><i /></div>
        </div>

        <AcademySign className="sign-plaza" decoded={languageRestored} text="CENTRAL QUAD" cipher="C?NTR_L // QD" />
        <AcademySign className="sign-route" decoded={languageRestored} text="RESEARCH →" cipher="R?S_//CH →" />

        <CampusTree className="tree-nw" /><CampusTree className="tree-n" /><CampusTree className="tree-ne" />
        <CampusTree className="tree-w" /><CampusTree className="tree-se" /><CampusTree className="tree-s" />
        <CampusLamp className="lamp-one" /><CampusLamp className="lamp-two" /><CampusLamp className="lamp-three" />
        <CampusLamp className="lamp-four" /><CampusLamp className="lamp-five" />
        <div className="campus-bench bench-west"><i /><b /></div>
        <div className="campus-bench bench-east"><i /><b /></div>

        <div className="system-relay relay-one"><i /><i /><i /></div>
        <div className="system-relay relay-two"><i /><i /><i /></div>
        <div className="system-conduit conduit-one" /><div className="system-conduit conduit-two" />

        <div ref={movement.playerRef} className="player-on-map" style={movement.playerStyle} data-player-direction={movement.direction}>
          {voice.expression && <span key={voice.expression.id} className="voice-note-bubble">♪ {voice.expression.note}</span>}
          <PixelRobot direction={movement.direction} walking={movement.walking} visionUpgraded={dayUnlocked} learningUpgraded={learningRestored} communicationUpgraded={languageRestored} />
        </div>
      </div>

      <div className="map-action-hints">
        <div className="interaction-prompt"><span>E</span>{prompt}</div>
        {languageRestored && <div className="voice-prompt"><span>F</span>VOICE</div>}
      </div>
      <VirtualControls
        onDirectionChange={movement.input.setDirection}
        onReset={movement.input.resetDirections}
        onInteract={() => interact(movement.positionRef.current)}
        onExpress={languageRestored ? voice.express : undefined}
      />
    </div>
  )
}

function CampusLabBuilding({ id, label, completed, locked = false }: { id: LabId | 'dl'; label: string; completed: boolean; locked?: boolean }) {
  const fullName = id === 'cv' ? 'Computer Vision' : id === 'ml' ? 'Machine Learning' : id === 'nlp' ? 'Natural Language' : 'Deep Learning'
  return (
    <section className={`campus-lab campus-lab-${id} ${completed ? 'is-complete' : ''} ${locked ? 'is-locked' : ''}`} aria-label={`${fullName} Lab${completed ? ', restored' : locked ? ', dormant' : ''}`}>
      <div className="campus-lab-roof"><span className="lab-symbol"><i /><i /><i /></span><b /></div>
      <div className="campus-lab-face">
        <i className="lab-window window-left" /><i className="lab-window window-right" />
        <span className="campus-lab-plaque">{label}</span>
        <div className="campus-lab-door"><i />{locked && <span className="pixel-padlock" />}</div>
        <span className="lab-status-light" aria-hidden="true" />
      </div>
    </section>
  )
}

function AcademySign({ className, decoded, text, cipher }: { className: string; decoded: boolean; text: string; cipher: string }) {
  return <div className={`campus-sign ${className} ${decoded ? 'is-decoded' : ''}`}><i />{decoded ? text : cipher}</div>
}

function CampusTree({ className }: { className: string }) {
  return <div className={`campus-tree ${className}`}><i /><i /><b /></div>
}

function CampusLamp({ className }: { className: string }) {
  return <div className={`campus-lamp ${className}`}><i /><b /></div>
}
