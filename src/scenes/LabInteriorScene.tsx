import { useCallback, useState } from 'react'
import { playTone } from '../audio/audio'
import { PixelRobot } from '../components/PixelRobot'
import { VirtualControls } from '../components/VirtualControls'
import { labs } from '../data/labs'
import { LAB_BOUNDS, LAB_CONSOLE_Y, LAB_EXIT_Y, LAB_SPAWN } from '../data/maps'
import { useGame } from '../game/GameContext'
import type { Point } from '../game/types'
import { usePlayerMovement } from '../hooks/usePlayerMovement'

export function LabInteriorScene() {
  const { state, dispatch } = useGame()
  const [prompt, setPrompt] = useState('Approach the console')
  const lab = state.currentLab ? labs[state.currentLab] : null

  const updatePrompt = useCallback((position: Point) => {
    const nextPrompt = position.y < LAB_CONSOLE_Y
      ? 'Activate mentor console'
      : position.y > LAB_EXIT_Y
        ? 'Return to academy'
        : 'Approach the console'
    setPrompt((current) => current === nextPrompt ? current : nextPrompt)
  }, [])

  const interact = useCallback((position: Point) => {
    if (!lab || !state.currentLab) return
    playTone(state.save.audioEnabled)
    if (position.y < LAB_CONSOLE_Y) dispatch({ type: 'START_DIALOGUE', key: `${state.currentLab}-intro` })
    else if (position.y > LAB_EXIT_Y) dispatch({ type: 'LEAVE_LAB' })
  }, [dispatch, lab, state.currentLab, state.save.audioEnabled])

  const movement = usePlayerMovement({
    active: Boolean(lab),
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
        <div className="room-cable cable-a" /><div className="room-cable cable-b" />
        <div className="lab-floor-grid" />
        <div className="lab-exit">EXIT</div>
        <div ref={movement.playerRef} className="player-in-lab" style={movement.playerStyle} data-player-direction={movement.direction}>
          <PixelRobot direction={movement.direction} walking={movement.walking} visionUpgraded={state.save.completedLabs.cv} learningUpgraded={state.save.completedLabs.ml} communicationUpgraded={state.save.completedLabs.nlp} />
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
