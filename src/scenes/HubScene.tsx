import { useCallback, useState } from 'react'
import { playTone } from '../audio/audio'
import { PixelRobot } from '../components/PixelRobot'
import { VirtualControls } from '../components/VirtualControls'
import { HUB_BOUNDS, HUB_DOORS, HUB_SPAWNS, type HubDoor } from '../data/maps'
import { useGame } from '../game/GameContext'
import { allLabsComplete } from '../game/reducer'
import type { Point } from '../game/types'
import { usePlayerMovement } from '../hooks/usePlayerMovement'

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)

function nearestDoor(position: Point): HubDoor {
  return HUB_DOORS.reduce((best, door) => distance(position, door.position) < distance(position, best.position) ? door : best)
}

export function HubScene() {
  const { state, dispatch } = useGame()
  const [prompt, setPrompt] = useState('Explore the academy')
  const researchOpen = allLabsComplete(state.save)
  const spawn = HUB_SPAWNS[state.hubSpawn]

  const updatePrompt = useCallback((position: Point) => {
    const door = nearestDoor(position)
    const nextPrompt = distance(position, door.position) <= door.interactionRadius
      ? `Press E to enter ${door.id === 'research' ? 'Research' : door.id.toUpperCase()} Lab`
      : 'Explore the academy'
    setPrompt((current) => current === nextPrompt ? current : nextPrompt)
  }, [])

  const interact = useCallback((position: Point) => {
    const door = nearestDoor(position)
    if (distance(position, door.position) > door.interactionRadius) {
      setPrompt('Move closer to a lab door')
      return
    }
    playTone(state.save.audioEnabled)
    if (door.id === 'research') dispatch({ type: 'OPEN_RESEARCH' })
    else dispatch({ type: 'ENTER_LAB', lab: door.id })
  }, [dispatch, state.save.audioEnabled])

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

  return (
    <div className="scene hub-scene">
      <div className="scene-hud">
        <div><span>UNIT</span><strong>{state.save.playerName}</strong></div>
        <div className="hub-title"><span>AI ACADEMY</span><strong>CENTRAL PLAZA</strong></div>
        <div><span>LAB SIGNALS</span><strong>{Object.values(state.save.completedLabs).filter(Boolean).length} / 3</strong></div>
      </div>
      <div className="hub-map">
        <div className="map-path path-vertical" /><div className="map-path path-horizontal" />
        <LabBuilding label="VISION" completed={state.save.completedLabs.cv} className="building-cv" />
        <LabBuilding label="PATTERN" completed={state.save.completedLabs.ml} className="building-ml" />
        <LabBuilding label="LANGUAGE" completed={state.save.completedLabs.nlp} className="building-nlp" />
        <LabBuilding label="RESEARCH" completed={researchOpen} locked={!researchOpen} className="building-research" />
        <div className="plaza-core"><i /><span>ORIGIN</span></div>
        <Tree className="tree-a" /><Tree className="tree-b" /><Tree className="tree-c" /><Tree className="tree-d" />
        <Lamp className="lamp-a" /><Lamp className="lamp-b" /><Lamp className="lamp-c" /><Lamp className="lamp-d" />
        <div ref={movement.playerRef} className="player-on-map" style={movement.playerStyle} data-player-direction={movement.direction}>
          <PixelRobot direction={movement.direction} walking={movement.walking} visionUpgraded={state.save.completedLabs.cv} learningUpgraded={state.save.completedLabs.ml} />
        </div>
      </div>
      <div className="interaction-prompt"><span>E</span>{prompt}</div>
      <VirtualControls
        onDirectionChange={movement.input.setDirection}
        onReset={movement.input.resetDirections}
        onInteract={() => interact(movement.positionRef.current)}
      />
    </div>
  )
}

function LabBuilding({ label, completed, locked = false, className }: { label: string; completed: boolean; locked?: boolean; className: string }) {
  return (
    <div className={`lab-building ${className} ${completed ? 'is-complete' : ''} ${locked ? 'is-locked' : ''}`}>
      <div className="building-roof"><i /></div>
      <div className="building-face"><span>{label}</span><div className="lab-door">{locked ? 'LOCK' : completed ? 'OK' : ''}</div></div>
    </div>
  )
}

function Tree({ className }: { className: string }) {
  return <div className={`pixel-tree ${className}`}><i /><b /></div>
}

function Lamp({ className }: { className: string }) {
  return <div className={`pixel-lamp ${className}`}><i /><b /></div>
}
