import { useCallback, useRef, useState } from 'react'
import { playTone } from '../audio/audio'
import { PixelRobot } from '../components/PixelRobot'
import { VirtualControls } from '../components/VirtualControls'
import { RESEARCH_BOUNDS, RESEARCH_DOOR, RESEARCH_SPAWN, RESEARCH_WEST_TRANSITION_X } from '../data/maps'
import { useGame } from '../game/GameContext'
import { allLabsComplete } from '../game/reducer'
import type { Point } from '../game/types'
import { usePlayerMovement } from '../hooks/usePlayerMovement'
import { useVoiceExpression } from '../hooks/useVoiceExpression'

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)

export function ResearchMapScene() {
  const { state, dispatch } = useGame()
  const powered = allLabsComplete(state.save)
  const languageRestored = state.save.completedLabs.nlp
  const [prompt, setPrompt] = useState(powered ? 'The final scanner is awake' : 'The sealed facility waits in silence')
  const transitioned = useRef(false)
  const voice = useVoiceExpression(languageRestored, state.save.audioEnabled)

  const returnToHub = useCallback(() => {
    if (transitioned.current) return
    transitioned.current = true
    playTone(state.save.audioEnabled, 'confirm')
    dispatch({ type: 'RETURN_TO_HUB' })
  }, [dispatch, state.save.audioEnabled])

  const updatePrompt = useCallback((position: Point) => {
    if (position.x <= RESEARCH_WEST_TRANSITION_X && position.y >= 275) {
      returnToHub()
      return
    }
    const nearDoor = distance(position, RESEARCH_DOOR.position) <= RESEARCH_DOOR.interactionRadius
    const nextPrompt = nearDoor
      ? powered ? 'Press E to scan the powered final gate' : 'Press E to inspect the sealed final gate'
      : position.x < 170 ? 'Walk left to return to the Academy' : 'Follow the violet road to the main scanner'
    setPrompt((current) => current === nextPrompt ? current : nextPrompt)
  }, [powered, returnToHub])

  const interact = useCallback((position: Point) => {
    if (distance(position, RESEARCH_DOOR.position) > RESEARCH_DOOR.interactionRadius) {
      setPrompt('The scanner is at the end of the violet road')
      return
    }
    playTone(state.save.audioEnabled, powered ? 'confirm' : 'alarm')
    dispatch({ type: 'OPEN_RESEARCH' })
  }, [dispatch, powered, state.save.audioEnabled])

  const movement = usePlayerMovement({
    active: true,
    initialPosition: RESEARCH_SPAWN.position,
    initialDirection: RESEARCH_SPAWN.direction,
    bounds: RESEARCH_BOUNDS,
    speed: 155,
    audioEnabled: state.save.audioEnabled,
    onPositionChange: updatePrompt,
    onInteract: interact,
  })

  return (
    <div className="scene research-map-scene">
      <div className="scene-hud research-hud">
        <div><span>SECTOR</span><strong>ORIGIN—EAST</strong></div>
        <div className="hub-title"><span>RESEARCH PERIMETER</span><strong>FINAL FACILITY</strong></div>
        <div><span>SCANNER</span><strong>{powered ? 'ONLINE' : 'SEALED'}</strong></div>
      </div>

      <div className={`research-map ${powered ? 'is-powered' : 'is-sealed'}`} aria-label="Research perimeter map at night">
        <div className="research-ground-grid" aria-hidden="true" />
        <div className="research-road road-main" /><div className="research-road road-approach" />
        <div className="research-fence fence-top"><i /><i /><i /><i /><i /><i /></div>
        <div className="research-fence fence-bottom"><i /><i /><i /><i /><i /></div>

        <section className="research-facility" aria-label={`Research Lab, ${powered ? 'scanner online but sealed' : 'sealed'}`}>
          <div className="facility-crown"><i /><i /><b /><span /></div>
          <div className="facility-wing wing-left"><i /><b /></div>
          <div className="facility-wing wing-right"><i /><b /></div>
          <div className="facility-main">
            <i className="facility-window window-a" /><i className="facility-window window-b" />
            <span className="facility-plaque">RESEARCH</span>
            <div className="facility-door"><i /><b /><span /></div>
          </div>
        </section>

        <div className="research-checkpoint" aria-label="Research gate scanner"><i /><i /><b /><span /></div>
        <ResearchTower className="tower-one" /><ResearchTower className="tower-two" />
        <ResearchLamp className="research-lamp-one" /><ResearchLamp className="research-lamp-two" />
        <ResearchLamp className="research-lamp-three" /><ResearchLamp className="research-lamp-four" />
        <div className="research-cable cable-one" /><div className="research-cable cable-two" />
        <div className="academy-return-sign">‹ {languageRestored ? 'ACADEMY' : '_C_D?MY'}</div>

        <div ref={movement.playerRef} className="player-on-map" style={movement.playerStyle} data-player-direction={movement.direction}>
          {voice.expression && <span key={voice.expression.id} className="voice-note-bubble research-note">♪ {voice.expression.note}</span>}
          <PixelRobot direction={movement.direction} walking={movement.walking} visionUpgraded={state.save.completedLabs.cv} learningUpgraded={state.save.completedLabs.ml} communicationUpgraded={languageRestored} />
        </div>
      </div>

      <div className="map-action-hints">
        <div className="interaction-prompt research-prompt"><span>E</span>{prompt}</div>
        {languageRestored && <div className="voice-prompt research-voice"><span>F</span>VOICE</div>}
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

function ResearchTower({ className }: { className: string }) {
  return <div className={`research-tower ${className}`}><i /><i /><b /><span /></div>
}

function ResearchLamp({ className }: { className: string }) {
  return <div className={`research-lamp ${className}`}><i /><b /></div>
}
