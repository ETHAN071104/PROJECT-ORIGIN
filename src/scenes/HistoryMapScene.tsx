import { useCallback, useRef, useState, type CSSProperties } from 'react'
import { playTone } from '../audio/audio'
import { HistoryEntryPanel, ModernBuildersPanel, PersonEntryPanel } from '../components/HistoryExhibit'
import { PixelRobot } from '../components/PixelRobot'
import { VirtualControls } from '../components/VirtualControls'
import {
  ARCHIVE_TIMELINE_NOTE,
  HALL_TIMELINE_ENTRIES,
  MODERN_BUILDERS,
  PEOPLE_OF_AI,
  type HistoryEntry,
  type PersonEntry,
} from '../data/historyArchive'
import {
  HISTORY_BOUNDS,
  HISTORY_EAST_TRANSITION_X,
  HISTORY_SPAWNS,
  HISTORY_WEST_TRANSITION_X,
} from '../data/maps'
import { useGame } from '../game/GameContext'
import type { Point } from '../game/types'
import { usePlayerMovement } from '../hooks/usePlayerMovement'
import { useVoiceExpression } from '../hooks/useVoiceExpression'

const TIMELINE_POSITIONS: readonly Point[] = [
  { x: 105, y: 306 }, { x: 174, y: 306 }, { x: 243, y: 306 },
  { x: 326, y: 306 }, { x: 390, y: 306 }, { x: 454, y: 306 }, { x: 518, y: 306 }, { x: 582, y: 306 },
  { x: 665, y: 306 }, { x: 738, y: 306 }, { x: 811, y: 306 },
]

const PEOPLE_POSITIONS: readonly Point[] = [
  { x: 145, y: 168 }, { x: 232, y: 168 }, { x: 319, y: 168 }, { x: 406, y: 168 },
  { x: 493, y: 168 }, { x: 580, y: 168 }, { x: 667, y: 168 }, { x: 754, y: 168 },
]

type ArchiveTarget =
  | { kind: 'history'; position: Point; entry: HistoryEntry }
  | { kind: 'person'; position: Point; person: PersonEntry }
  | { kind: 'modern'; position: Point }

type ActivePanel =
  | { kind: 'history'; entry: HistoryEntry; align: 'left' | 'right' }
  | { kind: 'person'; person: PersonEntry; align: 'left' | 'right' }
  | { kind: 'modern'; align: 'left' | 'right' }

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)

const ARCHIVE_TARGETS: readonly ArchiveTarget[] = [
  ...HALL_TIMELINE_ENTRIES.map((entry, index) => ({ kind: 'history' as const, entry, position: TIMELINE_POSITIONS[index] })),
  ...PEOPLE_OF_AI.map((person, index) => ({ kind: 'person' as const, person, position: PEOPLE_POSITIONS[index] })),
  { kind: 'modern' as const, position: { x: 852, y: 168 } },
]

function nearestTarget(position: Point) {
  return ARCHIVE_TARGETS.reduce((best, target) => distance(position, target.position) < distance(position, best.position) ? target : best)
}

function positionStyle(position: Point) {
  return { '--archive-x': `${position.x}px`, '--archive-y': `${position.y}px` } as CSSProperties
}

export function HistoryMapScene() {
  const { state, dispatch } = useGame()
  const [prompt, setPrompt] = useState('Follow the timeline or visit the contributor gallery')
  const [activePanel, setActivePanel] = useState<ActivePanel | null>(null)
  const transitioned = useRef(false)
  const spawn = HISTORY_SPAWNS[state.historySpawn]
  const languageRestored = state.save.completedLabs.nlp
  const voice = useVoiceExpression(languageRestored && !activePanel, state.save.audioEnabled)

  const returnToHub = useCallback(() => {
    if (transitioned.current) return
    transitioned.current = true
    playTone(state.save.audioEnabled, 'confirm')
    dispatch({ type: 'RETURN_TO_HUB' })
  }, [dispatch, state.save.audioEnabled])

  const enterResearch = useCallback(() => {
    if (transitioned.current) return
    transitioned.current = true
    playTone(state.save.audioEnabled, 'confirm')
    dispatch({ type: 'ENTER_RESEARCH_COMPLEX' })
  }, [dispatch, state.save.audioEnabled])

  const updatePrompt = useCallback((position: Point) => {
    if (position.x <= HISTORY_WEST_TRANSITION_X && position.y >= 300) {
      returnToHub()
      return
    }
    if (position.x >= HISTORY_EAST_TRANSITION_X && position.y >= 300) {
      enterResearch()
      return
    }
    const target = nearestTarget(position)
    if (distance(position, target.position) > 48) {
      setPrompt(position.x < 150 ? 'West corridor — return to AI Academy' : position.x > 820 ? 'East corridor — Research District' : 'Follow the timeline or visit the contributor gallery')
      return
    }
    const next = target.kind === 'history'
      ? `Read ${target.entry.year}: ${target.entry.title}`
      : target.kind === 'person'
        ? `Open contributor record: ${target.person.name}`
        : 'Open the Modern Builders display'
    setPrompt((current) => current === next ? current : next)
  }, [enterResearch, returnToHub])

  const interact = useCallback((position: Point) => {
    if (activePanel) {
      setActivePanel(null)
      return
    }
    if (position.x < 90 && position.y >= 300) {
      returnToHub()
      return
    }
    if (position.x > 842 && position.y >= 300) {
      enterResearch()
      return
    }
    const target = nearestTarget(position)
    if (distance(position, target.position) > 48) {
      setPrompt('Move closer to an archive terminal')
      return
    }
    playTone(state.save.audioEnabled, 'confirm')
    const align = target.position.x < 480 ? 'right' as const : 'left' as const
    if (target.kind === 'history') {
      dispatch({ type: 'READ_HISTORY_ENTRY', id: target.entry.id })
      setActivePanel({ kind: 'history', entry: target.entry, align })
    } else if (target.kind === 'person') {
      dispatch({ type: 'READ_HISTORY_ENTRY', id: target.person.id })
      setActivePanel({ kind: 'person', person: target.person, align })
    } else {
      dispatch({ type: 'READ_HISTORY_ENTRY', id: 'modern-builders' })
      setActivePanel({ kind: 'modern', align })
    }
  }, [activePanel, dispatch, enterResearch, returnToHub, state.save.audioEnabled])

  const movement = usePlayerMovement({
    active: !activePanel,
    initialPosition: spawn.position,
    initialDirection: spawn.direction,
    bounds: HISTORY_BOUNDS,
    speed: 165,
    audioEnabled: state.save.audioEnabled,
    onPositionChange: updatePrompt,
    onInteract: interact,
  })

  return (
    <div className="scene history-map-scene">
      <div className="scene-hud history-hud">
        <div><span>ARCHIVE</span><strong>HALL 01</strong></div>
        <div className="hub-title"><span>AI ACADEMY ARCHIVE</span><strong>HALL OF ORIGINS</strong></div>
        <div><span>ROUTE</span><strong>RESEARCH DISTRICT →</strong></div>
      </div>

      <div className="history-map" aria-label="Hall of Origins AI history archive">
        <div className="history-wall-grid" aria-hidden="true" />
        <div className="history-zone zone-foundations"><span>ZONE A</span><strong>FOUNDATIONS</strong></div>
        <div className="history-zone zone-surprises"><span>ZONE B</span><strong>SYSTEMS THAT SURPRISED US</strong></div>
        <div className="history-zone zone-modern"><span>ZONE C</span><strong>THE MODERN MODEL ERA</strong></div>
        <div className="people-gallery-label">PEOPLE OF AI // CONTRIBUTOR GALLERY</div>
        <div className="chronology-line" aria-hidden="true"><i /><i /><i /></div>

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

        <section className={`modern-builders-terminal ${state.save.worldProgress.readExhibitIds.includes('modern-builders') ? 'is-read' : ''}`} style={positionStyle({ x: 852, y: 168 })}>
          <i /><strong>MODERN BUILDERS</strong><span>COMMUNITY RECORD</span>
        </section>

        <div className="hall-west-gate"><span>← AI ACADEMY</span><i /><i /></div>
        <div className="hall-east-gate"><span>RESEARCH DISTRICT</span><strong>→</strong><i /><i /></div>
        <div className="archive-timeline-note">{ARCHIVE_TIMELINE_NOTE}</div>
        <div className="archive-floor" aria-hidden="true" />

        <div ref={movement.playerRef} className="player-on-map" style={movement.playerStyle} data-player-direction={movement.direction}>
          {voice.expression && <span key={voice.expression.id} className="voice-note-bubble">♪ {voice.expression.note}</span>}
          <PixelRobot direction={movement.direction} walking={movement.walking} visionUpgraded learningUpgraded communicationUpgraded deepLearningUpgraded />
        </div>
      </div>

      <div className="map-action-hints">
        <div className="interaction-prompt history-prompt"><span>E</span>{prompt}</div>
        <div className="voice-prompt"><span>F</span>VOICE</div>
      </div>
      <VirtualControls
        onDirectionChange={movement.input.setDirection}
        onReset={movement.input.resetDirections}
        onInteract={() => interact(movement.positionRef.current)}
        onExpress={voice.express}
      />

      {activePanel?.kind === 'history' && <HistoryEntryPanel entry={activePanel.entry} align={activePanel.align} onClose={() => setActivePanel(null)} />}
      {activePanel?.kind === 'person' && <PersonEntryPanel person={activePanel.person} align={activePanel.align} onClose={() => setActivePanel(null)} />}
      {activePanel?.kind === 'modern' && <ModernBuildersPanel builders={MODERN_BUILDERS} align={activePanel.align} onClose={() => setActivePanel(null)} />}
    </div>
  )
}
