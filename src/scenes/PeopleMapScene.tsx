import { useCallback, useMemo, useRef, useState, type CSSProperties } from 'react'
import { playTone } from '../audio/audio'
import { ModernBuildersPanel, PersonEntryPanel } from '../components/HistoryExhibit'
import { InteractionPrompt } from '../components/InteractionPrompt'
import { PixelRobot } from '../components/PixelRobot'
import { VirtualControls } from '../components/VirtualControls'
import { VoiceParticles } from '../components/VoiceParticles'
import { MODERN_BUILDERS, PEOPLE_OF_AI, type PersonEntry } from '../data/historyArchive'
import {
  PEOPLE_BOUNDS,
  PEOPLE_NORTH_TRANSITION_Y,
  PEOPLE_SPAWNS,
  PEOPLE_TRANSITION_MAX_X,
  PEOPLE_TRANSITION_MIN_X,
} from '../data/maps'
import { useGame } from '../game/GameContext'
import { sameActiveInteractable, selectActiveInteractable, type ActiveInteractable, type InteractionCandidate } from '../game/interactions'
import type { Point } from '../game/types'
import { usePlayerMovement } from '../hooks/usePlayerMovement'
import { isVoiceAbilityAvailable, useVoiceExpression } from '../hooks/useVoiceExpression'

const PEOPLE_POSITIONS: readonly Point[] = [
  { x: 175, y: 226 }, { x: 375, y: 226 }, { x: 585, y: 226 }, { x: 785, y: 226 },
  { x: 175, y: 345 }, { x: 375, y: 345 }, { x: 585, y: 345 }, { x: 785, y: 345 },
]
const MODERN_POSITION: Point = { x: 480, y: 405 }
const NORTH_EXIT: InteractionCandidate = {
  id: 'people-to-events',
  actionLabel: 'Return to History Events',
  type: 'transition',
  priority: 100,
  position: { x: 480, y: 160 },
  interactionRadius: 46,
}

type ActivePanel = { kind: 'person'; person: PersonEntry; align: 'left' | 'right' } | { kind: 'modern'; align: 'left' | 'right' }

function positionStyle(position: Point) {
  return { '--archive-x': `${position.x}px`, '--archive-y': `${position.y}px` } as CSSProperties
}

export function PeopleMapScene() {
  const { state, dispatch } = useGame()
  const [activePanel, setActivePanel] = useState<ActivePanel | null>(null)
  const transitioned = useRef(false)
  const spawn = PEOPLE_SPAWNS[state.peopleSpawn]
  const languageRestored = state.save.completedLabs.nlp
  const voiceAvailable = isVoiceAbilityAvailable(languageRestored, !activePanel)
  const voice = useVoiceExpression(voiceAvailable, state.save.audioEnabled)

  const candidates = useMemo<readonly InteractionCandidate[]>(() => [
    NORTH_EXIT,
    ...PEOPLE_OF_AI.map((person, index) => ({
      id: person.id,
      actionLabel: `Inspect ${person.name}`,
      type: 'person' as const,
      priority: 70,
      position: PEOPLE_POSITIONS[index],
      interactionRadius: 48,
    })),
    {
      id: 'modern-builders',
      actionLabel: 'Inspect Modern Builders',
      type: 'person' as const,
      priority: 75,
      position: MODERN_POSITION,
      interactionRadius: 50,
    },
  ], [])
  const [activeInteractable, setActiveInteractable] = useState<ActiveInteractable | null>(() => (
    selectActiveInteractable(spawn.position, candidates)
  ))

  const updateActive = useCallback((position: Point) => {
    const next = activePanel ? null : selectActiveInteractable(position, candidates)
    setActiveInteractable((current) => sameActiveInteractable(current, next) ? current : next)
  }, [activePanel, candidates])

  const returnToEvents = useCallback(() => {
    if (transitioned.current) return
    transitioned.current = true
    setActiveInteractable(null)
    playTone(state.save.audioEnabled, 'confirm')
    dispatch({ type: 'RETURN_TO_HISTORY_EVENTS' })
  }, [dispatch, state.save.audioEnabled])

  const updatePosition = useCallback((position: Point) => {
    const inTransitionLane = position.x >= PEOPLE_TRANSITION_MIN_X && position.x <= PEOPLE_TRANSITION_MAX_X
    if (inTransitionLane && position.y <= PEOPLE_NORTH_TRANSITION_Y) return returnToEvents()
    updateActive(position)
  }, [returnToEvents, updateActive])

  const interact = useCallback(() => {
    if (!activeInteractable || activePanel || transitioned.current) return
    if (activeInteractable.id === NORTH_EXIT.id) return returnToEvents()
    playTone(state.save.audioEnabled, 'confirm')
    if (activeInteractable.id === 'modern-builders') {
      dispatch({ type: 'READ_HISTORY_ENTRY', id: 'modern-builders' })
      setActivePanel({ kind: 'modern', align: 'left' })
    } else {
      const person = PEOPLE_OF_AI.find((item) => item.id === activeInteractable.id)
      if (!person) return
      dispatch({ type: 'READ_HISTORY_ENTRY', id: person.id })
      setActivePanel({ kind: 'person', person, align: PEOPLE_POSITIONS[PEOPLE_OF_AI.indexOf(person)].x < 480 ? 'right' : 'left' })
    }
    setActiveInteractable(null)
  }, [activeInteractable, activePanel, dispatch, returnToEvents, state.save.audioEnabled])

  const movement = usePlayerMovement({
    active: !activePanel && !transitioned.current,
    initialPosition: spawn.position,
    initialDirection: spawn.direction,
    bounds: PEOPLE_BOUNDS,
    speed: 165,
    audioEnabled: state.save.audioEnabled,
    onPositionChange: updatePosition,
    onInteract: interact,
  })

  const closePanel = useCallback(() => {
    setActivePanel(null)
    setActiveInteractable(selectActiveInteractable(movement.positionRef.current, candidates))
  }, [candidates, movement.positionRef])

  return (
    <div className="scene history-map-scene people-map-scene">
      <div className="scene-hud history-hud people-hud">
        <div><span>ARCHIVE</span><strong>PEOPLE</strong></div>
        <div className="hub-title"><span>AI HISTORY ARCHIVE</span><strong>PEOPLE BEHIND THE PROGRESS</strong></div>
        <div><span>RETURN</span><strong>EVENTS ↑</strong></div>
      </div>

      <div className="history-map people-map" aria-label="People of AI contributor gallery">
        <div className="history-wall-grid" aria-hidden="true" />
        <div className="people-gallery-label">PEOPLE OF AI // CONTRIBUTOR GALLERY</div>
        <div className="people-gallery-rail rail-one" /><div className="people-gallery-rail rail-two" />

        {PEOPLE_OF_AI.map((person, index) => (
          <section
            key={person.id}
            className={`person-terminal ${state.save.worldProgress.readExhibitIds.includes(person.id) ? 'is-read' : ''}`}
            style={positionStyle(PEOPLE_POSITIONS[index])}
            aria-label={`${person.name}, ${person.category}`}
          >
            <i><b /><b /></i><strong>{person.name}</strong><span>{person.category}</span>
          </section>
        ))}

        <div className="modern-builders-label">MODERN BUILDERS // COMMUNITY RECORD</div>
        <section className={`modern-builders-terminal ${state.save.worldProgress.readExhibitIds.includes('modern-builders') ? 'is-read' : ''}`} style={positionStyle(MODERN_POSITION)}>
          <i /><strong>MODERN BUILDERS</strong><span>COMMUNITY RECORD</span>
        </section>

        <div className="history-north-gate people-return-gate"><span>↑ HISTORY EVENTS</span><i /><i /></div>
        <div className="archive-floor" aria-hidden="true" />

        <div ref={movement.playerRef} className="player-on-map" style={movement.playerStyle} data-player-direction={movement.direction}>
          <VoiceParticles expression={voice.expression} />
          <PixelRobot direction={movement.direction} walking={movement.walking} visionUpgraded={state.save.completedLabs.cv} learningUpgraded={state.save.completedLabs.ml} communicationUpgraded={state.save.completedLabs.nlp} deepLearningUpgraded={state.save.completedLabs.dl} />
        </div>
      </div>

      <div className="map-action-hints">
        <InteractionPrompt active={activePanel ? null : activeInteractable} className="history-prompt" />
        {voiceAvailable && <div className="voice-prompt"><span>F</span>VOICE</div>}
      </div>
      <VirtualControls
        onDirectionChange={movement.input.setDirection}
        onReset={movement.input.resetDirections}
        onInteract={!activePanel && activeInteractable ? interact : undefined}
        interactionLabel={activeInteractable?.actionLabel}
        onExpress={voiceAvailable ? voice.express : undefined}
      />

      {activePanel?.kind === 'person' && <PersonEntryPanel person={activePanel.person} align={activePanel.align} onClose={closePanel} />}
      {activePanel?.kind === 'modern' && <ModernBuildersPanel builders={MODERN_BUILDERS} align={activePanel.align} onClose={closePanel} />}
    </div>
  )
}
