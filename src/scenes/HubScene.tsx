import { useCallback, useMemo, useRef, useState } from 'react'
import { playTone } from '../audio/audio'
import { InteractionPrompt } from '../components/InteractionPrompt'
import { PixelRobot } from '../components/PixelRobot'
import { VirtualControls } from '../components/VirtualControls'
import { VoiceParticles } from '../components/VoiceParticles'
import {
  HUB_BOUNDS,
  HUB_EAST_TRANSITION_MAX_Y,
  HUB_EAST_TRANSITION_MIN_Y,
  HUB_EAST_TRANSITION_X,
  HUB_SOUTH_TRANSITION_MAX_X,
  HUB_SOUTH_TRANSITION_MIN_X,
  HUB_SOUTH_TRANSITION_Y,
  HUB_SPAWNS,
  HUB_TARGETS,
} from '../data/maps'
import { useGame } from '../game/GameContext'
import { sameActiveInteractable, selectActiveInteractable, type ActiveInteractable, type InteractionCandidate } from '../game/interactions'
import { allLabsComplete, foundationsComplete } from '../game/reducer'
import type { LabId, Point } from '../game/types'
import { usePlayerMovement } from '../hooks/usePlayerMovement'
import { isVoiceAbilityAvailable, useVoiceExpression } from '../hooks/useVoiceExpression'
import { AtmosphereRenderer } from '../world/atmosphere/AtmosphereRenderer'
import { useAtmosphere } from '../world/atmosphere/AtmosphereProvider'

export function HubScene() {
  const { state, dispatch } = useGame()
  const atmosphere = useAtmosphere()
  const dayUnlocked = state.save.completedLabs.cv
  const learningRestored = state.save.completedLabs.ml
  const languageRestored = state.save.completedLabs.nlp
  const dlOnline = foundationsComplete(state.save)
  const routesPowered = allLabsComplete(state.save)
  const historyQuestAvailable = Object.values(state.save.completedLabs).some(Boolean) && !state.save.worldProgress.hallVisited
  const researchQuestAvailable = routesPowered && !state.save.worldProgress.researchVisited
  const environmentQuestAvailable = state.save.completedLabs.dl && !state.save.hasUsedAtmosphereTerminal
  const foundationStatus = `CV ${state.save.completedLabs.cv ? 'OK' : '--'} / ML ${state.save.completedLabs.ml ? 'OK' : '--'} / NLP ${state.save.completedLabs.nlp ? 'OK' : '--'}`
  const transitioned = useRef(false)
  const spawn = HUB_SPAWNS[state.hubSpawn]
  const voiceAvailable = isVoiceAbilityAvailable(languageRestored, true)
  const voice = useVoiceExpression(voiceAvailable, state.save.audioEnabled)
  const [atmospherePanelOpen, setAtmospherePanelOpen] = useState(false)

  const openAtmosphereTerminal = useCallback(() => {
    if (!state.save.completedLabs.dl) return
    if (!state.save.hasUsedAtmosphereTerminal) dispatch({ type: 'ACKNOWLEDGE_ATMOSPHERE_TERMINAL' })
    playTone(state.save.audioEnabled, 'confirm')
    setAtmospherePanelOpen(true)
  }, [dispatch, state.save.audioEnabled, state.save.completedLabs.dl, state.save.hasUsedAtmosphereTerminal])

  const candidates = useMemo<readonly InteractionCandidate[]>(() => HUB_TARGETS.map((target) => {
    if (target.id === 'east-gate') return {
      ...target,
      id: 'east-gate',
      type: 'transition' as const,
      priority: 90,
      actionLabel: routesPowered ? 'Enter Research Complex' : 'East Gate requires DL',
    }
    if (target.id === 'history-gate') return {
      ...target,
      id: 'history-gate',
      type: 'transition' as const,
      priority: 90,
      actionLabel: 'Enter AI History Archive',
    }
    if (target.id === 'atmosphere-terminal') return {
      ...target,
      id: 'atmosphere-terminal',
      type: 'terminal' as const,
      priority: 75,
      actionLabel: state.save.completedLabs.dl ? 'Use Environment Control' : 'Environment Control is dormant',
    }
    if (target.id === 'dl') return {
      ...target,
      id: 'lab-dl',
      type: 'lab' as const,
      priority: 70,
      actionLabel: dlOnline ? 'Enter DL Lab' : 'DL Lab requires CV, ML and NLP',
    }
    return {
      ...target,
      id: `lab-${target.id}`,
      type: 'lab' as const,
      priority: 70,
      actionLabel: `Enter ${target.id.toUpperCase()} Lab`,
    }
  }), [dlOnline, routesPowered, state.save.completedLabs.dl])

  const [activeInteractable, setActiveInteractable] = useState<ActiveInteractable | null>(() => (
    selectActiveInteractable(spawn.position, candidates)
  ))

  const setActiveForPosition = useCallback((position: Point) => {
    const next = selectActiveInteractable(position, candidates)
    setActiveInteractable((current) => sameActiveInteractable(current, next) ? current : next)
  }, [candidates])

  const enterHistoryRoute = useCallback(() => {
    if (transitioned.current) return
    transitioned.current = true
    setActiveInteractable(null)
    playTone(state.save.audioEnabled, 'confirm')
    dispatch({ type: 'ENTER_HISTORY_ROUTE' })
  }, [dispatch, state.save.audioEnabled])

  const enterResearchRoute = useCallback(() => {
    if (transitioned.current) return
    if (!routesPowered) {
      playTone(state.save.audioEnabled, 'incorrect')
      return
    }
    transitioned.current = true
    setActiveInteractable(null)
    playTone(state.save.audioEnabled, 'confirm')
    dispatch({ type: 'ENTER_RESEARCH_ROUTE' })
  }, [dispatch, routesPowered, state.save.audioEnabled])

  const updatePosition = useCallback((position: Point) => {
    if (
      position.x >= HUB_EAST_TRANSITION_X
      && position.y >= HUB_EAST_TRANSITION_MIN_Y
      && position.y <= HUB_EAST_TRANSITION_MAX_Y
    ) {
      if (routesPowered) enterResearchRoute()
      else setActiveForPosition(position)
      return
    }
    if (
      position.y >= HUB_SOUTH_TRANSITION_Y
      && position.x >= HUB_SOUTH_TRANSITION_MIN_X
      && position.x <= HUB_SOUTH_TRANSITION_MAX_X
    ) {
      enterHistoryRoute()
      return
    }
    setActiveForPosition(position)
  }, [enterHistoryRoute, enterResearchRoute, routesPowered, setActiveForPosition])

  const interact = useCallback(() => {
    if (!activeInteractable || transitioned.current) return
    if (activeInteractable.id === 'east-gate') return enterResearchRoute()
    if (activeInteractable.id === 'history-gate') return enterHistoryRoute()
    if (activeInteractable.id === 'atmosphere-terminal') {
      if (!state.save.completedLabs.dl) {
        playTone(state.save.audioEnabled, 'incorrect')
        return
      }
      openAtmosphereTerminal()
      return
    }

    const lab = activeInteractable.id.replace('lab-', '') as LabId
    if (lab === 'dl' && !dlOnline) {
      playTone(state.save.audioEnabled, 'incorrect')
      return
    }
    playTone(state.save.audioEnabled, 'confirm')
    dispatch({ type: 'ENTER_LAB', lab })
  }, [activeInteractable, dispatch, dlOnline, enterHistoryRoute, enterResearchRoute, openAtmosphereTerminal, state.save.audioEnabled, state.save.completedLabs.dl])

  const movement = usePlayerMovement({
    active: !transitioned.current && !atmospherePanelOpen,
    initialPosition: spawn.position,
    initialDirection: spawn.direction,
    bounds: HUB_BOUNDS,
    speed: 155,
    audioEnabled: state.save.audioEnabled,
    onPositionChange: updatePosition,
    onInteract: interact,
  })

  const mapClasses = [
    'hub-map',
    'atmosphere-host',
    atmosphere.mode === 'night' ? 'is-night' : 'is-day',
    `is-${atmosphere.mode}`,
    learningRestored ? 'has-learning' : '',
    languageRestored ? 'has-language' : '',
    routesPowered ? 'research-route-active' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="scene hub-scene">
      <div className="scene-hud campus-hud">
        <button type="button" className="hub-home-button" onClick={() => { playTone(state.save.audioEnabled, 'confirm'); dispatch({ type: 'RETURN_TO_TITLE' }) }}><i aria-hidden="true" />HOME</button>
        <div><span>UNIT</span><strong>{state.save.playerName}</strong></div>
        <div className="hub-title"><span>AI ACADEMY</span><strong>{`${atmosphere.mode.toUpperCase()} CAMPUS`}</strong></div>
        <div><span>LAB SIGNALS</span><strong>{Object.values(state.save.completedLabs).filter(Boolean).length} / 4</strong></div>
      </div>

      <div className={mapClasses} aria-label={`${atmosphere.mode} AI Academy campus map`}>
        <AtmosphereRenderer map="hub" />
        <div className="campus-stars" aria-hidden="true" />
        <div className="campus-path path-north" /><div className="campus-path path-west" />
        <div className="campus-path path-southwest" /><div className="campus-path path-east" />
        <div className="campus-path path-entry" />
        <div className="plaza-pavers" aria-hidden="true" />

        <CampusLabBuilding id="cv" label="CV" completed={state.save.completedLabs.cv} />
        <CampusLabBuilding id="ml" label="ML" completed={state.save.completedLabs.ml} />
        <CampusLabBuilding id="nlp" label="NLP" completed={state.save.completedLabs.nlp} />
        <CampusLabBuilding id="dl" label="DL" completed={state.save.completedLabs.dl} locked={!dlOnline} questAvailable={dlOnline && !state.save.completedLabs.dl} />

        {dlOnline && !state.save.completedLabs.dl && <div className="dl-online-notice" role="status"><i />DEEP LEARNING LAB ONLINE</div>}

        <div className="origin-plaza" aria-label="ORIGIN academy emblem">
          <div className="origin-mark"><i /><i /><i /><i /><b>ORIGIN</b></div>
        </div>

        <div className="east-gate" aria-label="East gate to the Research route">
          {researchQuestAvailable && <span className="route-quest-marker research-quest-marker" aria-label="New Research task available">!</span>}
          <i className="gate-post gate-post-top" /><i className="gate-post gate-post-bottom" />
          <span>{languageRestored ? 'EAST' : 'E_ST'}</span><b aria-hidden="true">›</b>
          <div className="gate-beacon"><i /></div>
        </div>
        <div className="history-south-gate" aria-label="South gate to the AI History Archive">
          {historyQuestAvailable && <span className="route-quest-marker history-quest-marker" aria-label="New History task available">!</span>}
          <i /><span>HISTORY</span><b>↓</b><i />
        </div>

        <AcademySign className="sign-plaza" decoded={languageRestored} text="CENTRAL QUAD" cipher="C?NTR_L // QD" />
        <AcademySign className="sign-route" decoded={languageRestored} text="RESEARCH →" cipher="R?S_//CH →" />
        <AcademySign className="sign-history" decoded={languageRestored} text="HISTORY ↓" cipher="H?ST_RY ↓" />

        <CampusTree className="tree-nw" /><CampusTree className="tree-n" /><CampusTree className="tree-ne" />
        <CampusTree className="tree-w" /><CampusTree className="tree-se" /><CampusTree className="tree-s" />
        <CampusLamp className="lamp-one" /><CampusLamp className="lamp-two" /><CampusLamp className="lamp-three" />
        <CampusLamp className="lamp-four" /><CampusLamp className="lamp-five" />
        <div className="campus-bench bench-west"><i /><b /></div>
        <div className="campus-bench bench-east"><i /><b /></div>

        <div className="system-relay relay-one"><i /><i /><i /></div>
        <div className="system-relay relay-two"><i /><i /><i /></div>
        <div className="system-conduit conduit-one" /><div className="system-conduit conduit-two" />
        <button type="button" className={`academy-atmosphere-terminal ${state.save.completedLabs.dl ? 'is-online' : ''}`} aria-label="Academy environment control terminal" onClick={openAtmosphereTerminal}>
          {environmentQuestAvailable && <em className="env-quest-marker" aria-label="New environment control available">!</em>}
          <i /><b>ENV</b><span>{state.save.completedLabs.dl ? atmosphere.mode.toUpperCase() : 'OFFLINE'}</span>
        </button>

        <div ref={movement.playerRef} className="player-on-map" style={movement.playerStyle} data-player-direction={movement.direction}>
          <VoiceParticles expression={voice.expression} />
          <PixelRobot direction={movement.direction} walking={movement.walking} visionUpgraded={dayUnlocked} learningUpgraded={learningRestored} communicationUpgraded={languageRestored} deepLearningUpgraded={state.save.completedLabs.dl} />
        </div>
      </div>

      <div className="map-action-hints">
        <InteractionPrompt active={activeInteractable} />
        {voiceAvailable && <div className="voice-prompt"><span>F</span>VOICE</div>}
      </div>
      <VirtualControls
        onDirectionChange={movement.input.setDirection}
        onReset={movement.input.resetDirections}
        onInteract={activeInteractable ? interact : undefined}
        interactionLabel={activeInteractable?.actionLabel}
        onExpress={voiceAvailable ? voice.express : undefined}
      />
      {atmospherePanelOpen && (
        <section className="atmosphere-terminal-panel" role="dialog" aria-modal="true" aria-label="Academy environment control">
          <span>ACADEMY SYSTEM</span><h2>ENVIRONMENT CONTROL</h2><p>Select a restored campus atmosphere.</p>
          <div>{state.save.unlockedAtmospheres.filter((mode) => mode !== 'sandstorm').map((mode) => <button type="button" key={mode} className={atmosphere.mode === mode ? 'is-active' : ''} onClick={() => atmosphere.setMode(mode)}>{mode}</button>)}</div>
          <button type="button" className="atmosphere-terminal-close" onClick={() => setAtmospherePanelOpen(false)}>CLOSE</button>
        </section>
      )}
    </div>
  )
}

function CampusLabBuilding({ id, label, completed, locked = false, questAvailable = false }: { id: LabId; label: string; completed: boolean; locked?: boolean; questAvailable?: boolean }) {
  const fullName = id === 'cv' ? 'Computer Vision' : id === 'ml' ? 'Machine Learning' : id === 'nlp' ? 'Natural Language' : 'Deep Learning'
  return (
    <section className={`campus-lab campus-lab-${id} ${completed ? 'is-complete' : ''} ${locked ? 'is-locked' : ''}`} aria-label={`${fullName} Lab${completed ? ', restored' : locked ? ', dormant' : ''}`}>
      {questAvailable && <span className="lab-quest-marker" aria-label="New lab task available">!</span>}
      <div className="campus-lab-roof"><span className="lab-symbol"><i /><i /><i /></span><b /></div>
      <div className="campus-lab-face">
        <i className="lab-window window-left" /><i className="lab-window window-right" />
        <span className="campus-lab-plaque">{label}</span>
        <div className="campus-lab-door"><i />{locked && <span className="pixel-padlock" />}{completed && <span className="lab-complete-check" aria-label="Lab complete">✓</span>}</div>
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
