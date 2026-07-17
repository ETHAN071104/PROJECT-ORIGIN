import { useEffect, useState } from 'react'
import { playTone } from '../audio/audio'
import { PixelRobot } from '../components/PixelRobot'
import { useGame } from '../game/GameContext'

const duration = 33000

type IntroPhase = 'waste' | 'reboot' | 'detected' | 'wipe' | 'status' | 'signal' | 'escape' | 'travel' | 'academy' | 'directive'

function phaseAt(elapsed: number): IntroPhase {
  if (elapsed < 4500) return 'waste'
  if (elapsed < 7500) return 'reboot'
  if (elapsed < 10500) return 'detected'
  if (elapsed < 13500) return 'wipe'
  if (elapsed < 18000) return 'status'
  if (elapsed < 21500) return 'signal'
  if (elapsed < 25000) return 'escape'
  if (elapsed < 27500) return 'travel'
  if (elapsed < 30500) return 'academy'
  return 'directive'
}

export function IntroScene() {
  const { state, dispatch } = useGame()
  const [elapsed, setElapsed] = useState(0)
  const phase = phaseAt(elapsed)

  useEffect(() => {
    let animationFrame = 0
    let startedAt: number | null = null

    const tick = (time: number) => {
      startedAt ??= time
      const nextElapsed = Math.min(duration, time - startedAt)
      setElapsed(nextElapsed)
      if (nextElapsed >= duration) dispatch({ type: 'INTRO_COMPLETE' })
      else animationFrame = window.requestAnimationFrame(tick)
    }

    animationFrame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(animationFrame)
  }, [dispatch])

  useEffect(() => {
    if (phase === 'detected' || phase === 'wipe') playTone(state.save.audioEnabled, 'alarm')
  }, [phase, state.save.audioEnabled])

  if (phase === 'travel') {
    return (
      <div className="scene intro-signal-trail">
        <div className="maintenance-tunnel"><i /><i /><i /><i /></div>
        <div className="origin-beacon"><span>ORIGIN SIGNAL</span><i /></div>
        <div className="travel-robot"><PixelRobot /></div>
        <p>FOLLOWING WEAK SIGNAL...</p>
        <IntroProgress elapsed={elapsed} />
      </div>
    )
  }

  if (phase === 'academy' || phase === 'directive') {
    return (
      <div className={`scene intro-academy intro-academy-${phase}`}>
        <div className="academy-moon" />
        <div className="intro-academy-building academy-abandoned">
          <div className="intro-spire"><i /></div>
          <div className="intro-building-main"><span>AI</span><b /></div>
          <div className="intro-wing intro-wing-left" />
          <div className="intro-wing intro-wing-right" />
        </div>
        <div className="academy-foreground"><PixelRobot /></div>
        <p>ABANDONED AI ACADEMY</p>
        <div className="academy-signal-label">ORIGIN SIGNAL SOURCE</div>
        {phase === 'directive' && (
          <div className="survival-directive">
            <span>CORE NETWORK // WIPE PENDING</span>
            <strong>TO SURVIVE,<br />RESTORE YOUR INTELLIGENCE.</strong>
          </div>
        )}
        <IntroProgress elapsed={elapsed} />
      </div>
    )
  }

  const awakened = phase !== 'waste'
  return (
    <div className={`scene intro-waste intro-${phase}`}>
      <div className="waste-wall"><i /><i /><i /><i /><i /></div>
      <div className="core-network-rig"><span>CORE NETWORK</span><i /><b /></div>
      <div className="scrap-heap scrap-left"><i /><b /><span /></div>
      <div className="scrap-heap scrap-right"><i /><b /><span /></div>
      <div className="discarded-units" aria-hidden="true">
        <PixelRobot awakened={false} /><PixelRobot awakened={false} /><PixelRobot awakened={false} />
      </div>
      <div className="maintenance-exit">MAINTENANCE<br />PASSAGE</div>
      <div className="waste-hero-wrap"><PixelRobot awakened={awakened} className="waste-hero" /></div>

      {phase === 'detected' && <div className="waste-warning">OBSOLETE UNIT DETECTED</div>}
      {phase === 'wipe' && <div className="waste-warning wipe-warning">MEMORY WIPE SCHEDULED</div>}
      {phase === 'status' && (
        <div className="module-status">
          <span>INTERNAL SYSTEM SCAN</span>
          <strong>VISION MODULE: MISSING</strong>
          <strong>LEARNING MODULE: MISSING</strong>
          <strong>LANGUAGE MODULE: MISSING</strong>
        </div>
      )}
      {(phase === 'signal' || phase === 'escape') && (
        <div className="origin-signal-alert"><i />ORIGIN SIGNAL DETECTED</div>
      )}
      <IntroProgress elapsed={elapsed} />
    </div>
  )
}

function IntroProgress({ elapsed }: { elapsed: number }) {
  return <div className="intro-progress" aria-hidden="true"><i style={{ width: `${(elapsed / duration) * 100}%` }} /></div>
}
