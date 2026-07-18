import { useCallback, useState } from 'react'
import { playTone } from '../audio/audio'
import { PixelRobot } from '../components/PixelRobot'
import { HistoryEntryPanel, HistoryExhibit } from '../components/HistoryExhibit'
import { VirtualControls } from '../components/VirtualControls'
import { LAB_HISTORY_EXHIBITS, type HistoryEntry } from '../data/historyArchive'
import { labs } from '../data/labs'
import { LAB_BOUNDS, LAB_CONSOLE_TARGET, LAB_EXHIBIT_TARGETS, LAB_EXIT_Y, LAB_SPAWN } from '../data/maps'
import { useGame } from '../game/GameContext'
import type { Point } from '../game/types'
import { usePlayerMovement } from '../hooks/usePlayerMovement'

export function LabInteriorScene() {
  const { state, dispatch } = useGame()
  const [prompt, setPrompt] = useState('Approach the console')
  const [activeEntry, setActiveEntry] = useState<HistoryEntry | null>(null)
  const lab = state.currentLab ? labs[state.currentLab] : null
  const exhibits = state.currentLab ? LAB_HISTORY_EXHIBITS[state.currentLab] : null

  const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)

  const nearbyExhibit = useCallback((position: Point) => {
    if (!exhibits) return null
    const leftDistance = distance(position, LAB_EXHIBIT_TARGETS.left.position)
    const rightDistance = distance(position, LAB_EXHIBIT_TARGETS.right.position)
    if (leftDistance <= LAB_EXHIBIT_TARGETS.left.interactionRadius && leftDistance <= rightDistance) {
      return { entry: exhibits[0], side: 'left' as const }
    }
    if (rightDistance <= LAB_EXHIBIT_TARGETS.right.interactionRadius) {
      return { entry: exhibits[1], side: 'right' as const }
    }
    return null
  }, [exhibits])

  const updatePrompt = useCallback((position: Point) => {
    const exhibit = nearbyExhibit(position)
    const nextPrompt = position.y > LAB_EXIT_Y
      ? 'Return to academy'
      : exhibit
        ? `Read ${exhibit.entry.year}: ${exhibit.entry.title}`
        : distance(position, LAB_CONSOLE_TARGET.position) <= LAB_CONSOLE_TARGET.interactionRadius
          ? 'Activate mentor console'
          : 'Explore the console or side exhibits'
    setPrompt((current) => current === nextPrompt ? current : nextPrompt)
  }, [nearbyExhibit])

  const interact = useCallback((position: Point) => {
    if (!lab || !state.currentLab) return
    if (activeEntry) {
      setActiveEntry(null)
      return
    }
    playTone(state.save.audioEnabled)
    if (position.y > LAB_EXIT_Y) {
      dispatch({ type: 'LEAVE_LAB' })
      return
    }
    const exhibit = nearbyExhibit(position)
    if (exhibit) {
      setActiveEntry(exhibit.entry)
      dispatch({ type: 'READ_HISTORY_ENTRY', id: exhibit.entry.id })
      return
    }
    if (distance(position, LAB_CONSOLE_TARGET.position) <= LAB_CONSOLE_TARGET.interactionRadius) {
      dispatch({ type: 'START_DIALOGUE', key: `${state.currentLab}-intro` })
    } else setPrompt('Move closer to the center console or a side exhibit')
  }, [activeEntry, dispatch, lab, nearbyExhibit, state.currentLab, state.save.audioEnabled])

  const movement = usePlayerMovement({
    active: Boolean(lab) && !activeEntry,
    initialPosition: LAB_SPAWN.position,
    initialDirection: LAB_SPAWN.direction,
    bounds: LAB_BOUNDS,
    speed: 165,
    audioEnabled: state.save.audioEnabled,
    onPositionChange: updatePrompt,
    onInteract: interact,
  })

  if (!lab) return null

  return (
    <div className={`scene lab-interior ${lab.roomClass}`}>
      <div className="scene-hud lab-hud">
        <div><span>{lab.shortName} LAB</span><strong>{lab.title}</strong></div>
        <div><span>MENTOR</span><strong>{lab.mentor}</strong></div>
      </div>
      <div className="lab-room">
        <div className="lab-backwall"><i /><i /><i /></div>
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
      <div className="interaction-prompt"><span>E</span>{prompt}</div>
      <VirtualControls
        onDirectionChange={movement.input.setDirection}
        onReset={movement.input.resetDirections}
        onInteract={() => interact(movement.positionRef.current)}
      />
      {activeEntry && (
        <HistoryEntryPanel
          entry={activeEntry}
          align={activeEntry === exhibits?.[0] ? 'right' : 'left'}
          onClose={() => setActiveEntry(null)}
        />
      )}
    </div>
  )
}
