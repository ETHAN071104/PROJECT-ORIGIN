import { useCallback, useMemo, useState } from 'react'
import { playTone } from '../audio/audio'
import { HistoryEntryPanel, HistoryExhibit } from '../components/HistoryExhibit'
import { InteractionPrompt } from '../components/InteractionPrompt'
import { PixelRobot } from '../components/PixelRobot'
import { VirtualControls } from '../components/VirtualControls'
import { LAB_HISTORY_EXHIBITS, type HistoryEntry } from '../data/historyArchive'
import { labs } from '../data/labs'
import { LAB_BOUNDS, LAB_CONSOLE_TARGET, LAB_EXHIBIT_TARGETS, LAB_SPAWN } from '../data/maps'
import { useGame } from '../game/GameContext'
import { sameActiveInteractable, selectActiveInteractable, type ActiveInteractable, type InteractionCandidate } from '../game/interactions'
import type { LabId, Point } from '../game/types'
import { usePlayerMovement } from '../hooks/usePlayerMovement'

const LAB_WHITEBOARD_COPY: Record<LabId, { title: string; formula: string; note: string }> = {
  cv: { title: 'VISION NOTES', formula: 'FRAME > FOCUS > FEATURE', note: 'LIGHT BECOMES DATA' },
  ml: { title: 'TRAINING NOTES', formula: 'INPUT > PATTERN > PREDICT', note: 'TEST. LEARN. REPEAT.' },
  nlp: { title: 'LANGUAGE NOTES', formula: 'TOKEN + CONTEXT = MEANING', note: 'WORDS CARRY SIGNALS' },
  dl: { title: 'NETWORK NOTES', formula: 'SIGNAL > LAYERS > LOSS', note: 'DEEPER IS NOT ALWAYS CLEARER' },
}

function LabWorkbenchProps({ labId }: { labId: LabId }) {
  if (labId === 'cv') {
    return (
      <>
        <div className="bench-camera"><i /><b /><span /></div>
        <div className="bench-lens lens-wide"><i /></div>
        <div className="bench-lens lens-small"><i /></div>
      </>
    )
  }

  if (labId === 'ml') {
    return (
      <>
        <div className="bench-data-screen"><i /><i /><i /><b /></div>
        <div className="bench-data-chip"><i /><i /><b /></div>
      </>
    )
  }

  if (labId === 'nlp') {
    return (
      <>
        <div className="bench-books"><i /><i /><i /></div>
        <div className="bench-speech-card"><i /><b /></div>
      </>
    )
  }

  return (
    <>
      <div className="bench-network"><i /><i /><i /><i /><b /><b /></div>
      <div className="bench-core-sample"><i /></div>
    </>
  )
}

function LabDecor({ labId }: { labId: LabId }) {
  const copy = LAB_WHITEBOARD_COPY[labId]
  return (
    <div className={`lab-decor lab-decor-${labId}`} aria-hidden="true">
      <div className="lab-whiteboard">
        <span>{copy.title}</span>
        <strong>{copy.formula}</strong>
        <small>{copy.note}</small>
        <i /><i /><i />
      </div>
      <div className="lab-workbench">
        <div className="lab-workbench-props"><LabWorkbenchProps labId={labId} /></div>
        <div className="lab-workbench-top"><i /><i /></div>
        <div className="lab-workbench-base"><i /><i /><b /></div>
      </div>
      <div className="lab-planter planter-left"><div className="cyan-plant"><i /><i /><i /><b /></div><span /></div>
      <div className="lab-planter planter-right"><div className="cyan-plant"><i /><i /><i /><b /></div><span /></div>
    </div>
  )
}

export function LabInteriorScene() {
  const { state, dispatch } = useGame()
  const [activeEntry, setActiveEntry] = useState<HistoryEntry | null>(null)
  const lab = state.currentLab ? labs[state.currentLab] : null
  const exhibits = state.currentLab ? LAB_HISTORY_EXHIBITS[state.currentLab] : null

  const candidates = useMemo<readonly InteractionCandidate[]>(() => {
    if (!lab || !exhibits) return []
    return [
      {
        id: 'mentor-console',
        actionLabel: state.save.completedLabs[lab.id] ? 'Replay Lab Module' : 'Use Mentor Terminal',
        type: 'terminal',
        priority: 80,
        ...LAB_CONSOLE_TARGET,
      },
      {
        id: exhibits[0].id,
        actionLabel: `Read ${exhibits[0].year}: ${exhibits[0].title}`,
        type: 'history',
        priority: 70,
        ...LAB_EXHIBIT_TARGETS.left,
      },
      {
        id: exhibits[1].id,
        actionLabel: `Read ${exhibits[1].year}: ${exhibits[1].title}`,
        type: 'history',
        priority: 70,
        ...LAB_EXHIBIT_TARGETS.right,
      },
      {
        id: 'lab-exit',
        actionLabel: 'Return to Central Plaza',
        type: 'transition',
        priority: 100,
        position: { x: 480, y: 382 },
        interactionRadius: 48,
      },
    ]
  }, [exhibits, lab, state.save.completedLabs])

  const [activeInteractable, setActiveInteractable] = useState<ActiveInteractable | null>(() => (
    selectActiveInteractable(LAB_SPAWN.position, candidates)
  ))

  const updateActive = useCallback((position: Point) => {
    const next = activeEntry ? null : selectActiveInteractable(position, candidates)
    setActiveInteractable((current) => sameActiveInteractable(current, next) ? current : next)
  }, [activeEntry, candidates])

  const interact = useCallback(() => {
    if (!lab || !state.currentLab || !activeInteractable || activeEntry) return
    playTone(state.save.audioEnabled, 'confirm')
    if (activeInteractable.id === 'lab-exit') {
      dispatch({ type: 'LEAVE_LAB' })
      return
    }
    if (activeInteractable.id === 'mentor-console') {
      dispatch({ type: 'START_DIALOGUE', key: `${state.currentLab}-intro` })
      return
    }
    const entry = exhibits?.find((item) => item.id === activeInteractable.id)
    if (!entry) return
    setActiveEntry(entry)
    setActiveInteractable(null)
    dispatch({ type: 'READ_HISTORY_ENTRY', id: entry.id })
  }, [activeEntry, activeInteractable, dispatch, exhibits, lab, state.currentLab, state.save.audioEnabled])

  const movement = usePlayerMovement({
    active: Boolean(lab) && !activeEntry,
    initialPosition: LAB_SPAWN.position,
    initialDirection: LAB_SPAWN.direction,
    bounds: LAB_BOUNDS,
    speed: 165,
    audioEnabled: state.save.audioEnabled,
    onPositionChange: updateActive,
    onInteract: interact,
  })

  const closeEntry = useCallback(() => {
    setActiveEntry(null)
    setActiveInteractable(selectActiveInteractable(movement.positionRef.current, candidates))
  }, [candidates, movement.positionRef])

  if (!lab) return null

  return (
    <div className={`scene lab-interior ${lab.roomClass}`}>
      <div className="scene-hud lab-hud">
        <div><span>{lab.shortName} LAB</span><strong>{lab.title}</strong></div>
        <div><span>MENTOR</span><strong>{lab.mentor}</strong></div>
      </div>
      <div className="lab-room">
        <div className="lab-backwall"><i /><i /><i /></div>
        <LabDecor labId={lab.id} />
        <div className="mentor-console">
          <div className="console-screen"><span>{state.save.completedLabs[lab.id] ? 'REPLAY' : 'READY'}</span><i /></div>
          <div className="console-base" />
        </div>
        {exhibits && (
          <>
            <HistoryExhibit entry={exhibits[0]} side="left" read={state.save.worldProgress.readExhibitIds.includes(exhibits[0].id)} />
            <HistoryExhibit entry={exhibits[1]} side="right" read={state.save.worldProgress.readExhibitIds.includes(exhibits[1].id)} />
          </>
        )}
        <div className="room-cable cable-a" /><div className="room-cable cable-b" />
        <div className="lab-floor-grid" />
        <div className="lab-exit">EXIT</div>
        <div ref={movement.playerRef} className="player-in-lab" style={movement.playerStyle} data-player-direction={movement.direction}>
          <PixelRobot direction={movement.direction} walking={movement.walking} visionUpgraded={state.save.completedLabs.cv} learningUpgraded={state.save.completedLabs.ml} communicationUpgraded={state.save.completedLabs.nlp} deepLearningUpgraded={state.save.completedLabs.dl} />
        </div>
      </div>
      <InteractionPrompt active={activeEntry ? null : activeInteractable} />
      <VirtualControls
        onDirectionChange={movement.input.setDirection}
        onReset={movement.input.resetDirections}
        onInteract={!activeEntry && activeInteractable ? interact : undefined}
        interactionLabel={activeInteractable?.actionLabel}
      />
      {activeEntry && (
        <HistoryEntryPanel
          entry={activeEntry}
          align={activeEntry === exhibits?.[0] ? 'right' : 'left'}
          onClose={closeEntry}
        />
      )}
    </div>
  )
}
