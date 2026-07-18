import { useCallback, useMemo, useRef, useState, type CSSProperties } from 'react'
import { playTone } from '../audio/audio'
import { HistoryEntryPanel } from '../components/HistoryExhibit'
import { InteractionPrompt } from '../components/InteractionPrompt'
import { PixelRobot } from '../components/PixelRobot'
import { VirtualControls } from '../components/VirtualControls'
import { VoiceParticles } from '../components/VoiceParticles'
import { ARCHIVE_TIMELINE_NOTE, HALL_TIMELINE_ENTRIES, type HistoryEntry } from '../data/historyArchive'
import {
  HISTORY_BOUNDS,
  HISTORY_NORTH_TRANSITION_Y,
  HISTORY_SOUTH_TRANSITION_Y,
  HISTORY_SPAWNS,
  HISTORY_TRANSITION_MAX_X,
  HISTORY_TRANSITION_MIN_X,
} from '../data/maps'
import { useGame } from '../game/GameContext'
import { sameActiveInteractable, selectActiveInteractable, type ActiveInteractable, type InteractionCandidate } from '../game/interactions'
import type { Point } from '../game/types'
import { usePlayerMovement } from '../hooks/usePlayerMovement'
import { isVoiceAbilityAvailable, useVoiceExpression } from '../hooks/useVoiceExpression'

const TIMELINE_POSITIONS: readonly Point[] = [
  { x: 160, y: 200 }, { x: 340, y: 200 }, { x: 620, y: 200 }, { x: 800, y: 200 },
  { x: 800, y: 290 }, { x: 620, y: 290 }, { x: 340, y: 290 }, { x: 160, y: 290 },
  { x: 160, y: 380 }, { x: 340, y: 380 }, { x: 620, y: 380 }, { x: 800, y: 380 },
]

const NORTH_EXIT: InteractionCandidate = {
  id: 'history-to-hub',
  actionLabel: 'Return to Central Plaza',
  type: 'transition',
  priority: 100,
  position: { x: 480, y: 160 },
  interactionRadius: 44,
}

const SOUTH_EXIT: InteractionCandidate = {
  id: 'history-to-people',
  actionLabel: 'Meet the People Behind the Progress',
  type: 'transition',
  priority: 100,
  position: { x: 480, y: 414 },
  interactionRadius: 48,
}

function positionStyle(position: Point) {
  return { '--archive-x': `${position.x}px`, '--archive-y': `${position.y}px` } as CSSProperties
}

export function HistoryMapScene() {
  const { state, dispatch } = useGame()
  const [activePanel, setActivePanel] = useState<HistoryEntry | null>(null)
  const transitioned = useRef(false)
  const spawn = HISTORY_SPAWNS[state.historySpawn]
  const languageRestored = state.save.completedLabs.nlp
  const voiceAvailable = isVoiceAbilityAvailable(languageRestored, !activePanel)
  const voice = useVoiceExpression(voiceAvailable, state.save.audioEnabled)

  const candidates = useMemo<readonly InteractionCandidate[]>(() => [
    NORTH_EXIT,
    SOUTH_EXIT,
    ...HALL_TIMELINE_ENTRIES.map((entry, index) => ({
      id: entry.id,
      actionLabel: `Read ${entry.year}: ${entry.title}`,
      type: 'history' as const,
      priority: 70,
      position: TIMELINE_POSITIONS[index],
      interactionRadius: 46,
    })),
  ], [])
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
    dispatch({ type: 'RETURN_TO_HUB_FROM_HISTORY' })
  }, [dispatch, state.save.audioEnabled])

  const enterPeople = useCallback(() => {
    if (transitioned.current) return
    transitioned.current = true
    setActiveInteractable(null)
    playTone(state.save.audioEnabled, 'confirm')
    dispatch({ type: 'ENTER_PEOPLE_GALLERY' })
  }, [dispatch, state.save.audioEnabled])

  const updatePosition = useCallback((position: Point) => {
    const inTransitionLane = position.x >= HISTORY_TRANSITION_MIN_X && position.x <= HISTORY_TRANSITION_MAX_X
    if (inTransitionLane && position.y <= HISTORY_NORTH_TRANSITION_Y) return returnToHub()
    if (inTransitionLane && position.y >= HISTORY_SOUTH_TRANSITION_Y) return enterPeople()
    updateActive(position)
  }, [enterPeople, returnToHub, updateActive])

  const interact = useCallback(() => {
    if (!activeInteractable || activePanel || transitioned.current) return
    if (activeInteractable.id === NORTH_EXIT.id) return returnToHub()
    if (activeInteractable.id === SOUTH_EXIT.id) return enterPeople()
    const entry = HALL_TIMELINE_ENTRIES.find((item) => item.id === activeInteractable.id)
    if (!entry) return
    playTone(state.save.audioEnabled, 'confirm')
    dispatch({ type: 'READ_HISTORY_ENTRY', id: entry.id })
    setActivePanel(entry)
    setActiveInteractable(null)
  }, [activeInteractable, activePanel, dispatch, enterPeople, returnToHub, state.save.audioEnabled])

  const movement = usePlayerMovement({
    active: !activePanel && !transitioned.current,
    initialPosition: spawn.position,
    initialDirection: spawn.direction,
    bounds: HISTORY_BOUNDS,
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
    <div className="scene history-map-scene">
      <div className="scene-hud history-hud">
        <div><span>ARCHIVE</span><strong>EVENTS</strong></div>
        <div className="hub-title"><span>AI HISTORY ARCHIVE</span><strong>THE ROAD TO MODERN AI</strong></div>
        <div><span>ROUTE</span><strong>CHRONOLOGICAL ↓</strong></div>
      </div>

      <div className="history-map history-events-map" aria-label="AI History Archive with chronological historical event terminals">
        <div className="history-wall-grid" aria-hidden="true" />
        <div className="history-zone zone-foundations"><span>1950—1986</span><strong>FOUNDATIONS</strong></div>
        <div className="history-zone zone-surprises"><span>1997—2016</span><strong>SYSTEMS THAT SURPRISED US</strong></div>
        <div className="history-zone zone-modern"><span>2017—2023</span><strong>THE MODERN MODEL ERA</strong></div>
        <div className="chronology-route" aria-hidden="true"><i /><i /><i /><i /></div>

        {HALL_TIMELINE_ENTRIES.map((entry, index) => (
          <section
            key={entry.id}
            className={`archive-entry-terminal section-${entry.section} ${state.save.worldProgress.readExhibitIds.includes(entry.id) ? 'is-read' : ''}`}
            style={positionStyle(TIMELINE_POSITIONS[index])}
            aria-label={`${entry.year} ${entry.title}`}
          >
            <span>{entry.year}</span><i /><strong>{entry.title}</strong>
            {entry.relatedNames && <div>{entry.relatedNames.map((name) => <b key={name}>{name}</b>)}</div>}
          </section>
        ))}

        <div className="history-north-gate"><span>↑ CENTRAL PLAZA</span><i /><i /></div>
        <div className="history-south-gate"><span>PEOPLE BEHIND THE PROGRESS</span><strong>↓</strong><i /><i /></div>
        <div className="archive-timeline-note">{ARCHIVE_TIMELINE_NOTE}</div>
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

      {activePanel && <HistoryEntryPanel entry={activePanel} align={activePanel.year < '2009' ? 'right' : 'left'} onClose={closePanel} />}
    </div>
  )
}
