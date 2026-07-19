import { useEffect, useRef, useState, type ReactNode } from 'react'
import { playTone } from '../audio/audio'
import { PixelButton } from '../components/PixelButton'
import { Portrait } from '../components/Portrait'
import {
  ATTENTION_CHOICES,
  ATTENTION_SENTENCE,
  boundariesMatch,
  finalTitleMatches,
  FINAL_TITLE_SCRAMBLED,
  moveWord,
  NLP_EXPLANATIONS,
  NLP_HINTS,
  NLP_LEARN_MORE,
  NLP_STAGE_TITLES,
  ORDERING_ROUNDS,
  orderingMatches,
  PREDICTION_ROUNDS,
  predictionIsLikely,
  SYNONYM_PAIRS,
  SYNONYM_RIGHT_ORDER,
  synonymMatches,
  TOKEN_ROUNDS,
  tokensFromBoundaries,
  type NlpStageNumber,
} from '../data/nlpLab'
import { useGame } from '../game/GameContext'

function NlpStageShell({
  stage,
  wrongAttempts,
  onExit,
  children,
}: {
  stage: NlpStageNumber
  wrongAttempts: number
  onExit: () => void
  children: ReactNode
}) {
  const [hintDismissed, setHintDismissed] = useState(false)
  return (
    <div className="scene nlp-stage-scene lab-nlp">
      <div className="nlp-archive-shelves" aria-hidden="true"><i /><i /><i /><i /><b /><b /></div>
      <header className="nlp-stage-hud">
        <div className="nlp-stage-title">
          <span>{stage === 4 ? 'FINAL BOSS' : `STAGE ${stage}`}</span>
          <strong>{NLP_STAGE_TITLES[stage]}</strong>
        </div>
        <div className="nlp-stage-progress" aria-label={`Natural Language Processing stage ${stage} of 4`}>
          {[1, 2, 3, 4].map((step) => <i key={step} className={step <= stage ? 'is-active' : ''} />)}
        </div>
        <PixelButton variant="secondary" className="nlp-exit-button" onClick={onExit}>Exit Lab</PixelButton>
      </header>
      {wrongAttempts >= 2 && !hintDismissed && (
        <aside className="lexi-hint" role="status">
          <div className="lexi-hint-face" aria-hidden="true"><i /><b /><b /></div>
          <strong>LEXI-7</strong>
          <span>{NLP_HINTS[stage]}</span>
          <button type="button" className="mentor-hint-close" aria-label="Close LEXI-7 hint" onClick={() => setHintDismissed(true)}>×</button>
        </aside>
      )}
      {children}
    </div>
  )
}

function NlpStageSuccess({ stage, onContinue }: { stage: 1 | 2 | 3; onContinue: () => void }) {
  return (
    <div className="nlp-success-overlay" role="dialog" aria-label={`${NLP_STAGE_TITLES[stage]} complete`}>
      <div className="nlp-success-panel">
        <span className="nlp-success-glyph" aria-hidden="true">✓</span>
        <p>LANGUAGE PATTERN RESTORED</p>
        <h2>{NLP_STAGE_TITLES[stage]}</h2>
        <blockquote>{NLP_EXPLANATIONS[stage]}</blockquote>
        <details>
          <summary>Learn More</summary>
          <p>{NLP_LEARN_MORE[stage]}</p>
        </details>
        <PixelButton onClick={onContinue}>Continue</PixelButton>
      </div>
    </div>
  )
}

function TokenizationStage({ onSaved, onContinue, onExit }: { onSaved: () => void; onContinue: () => void; onExit: () => void }) {
  const { state } = useGame()
  const [roundIndex, setRoundIndex] = useState(0)
  const [selected, setSelected] = useState<number[]>([])
  const [roundClear, setRoundClear] = useState(false)
  const [complete, setComplete] = useState(false)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [wrong, setWrong] = useState(false)
  const savedRef = useRef(false)
  const round = TOKEN_ROUNDS[roundIndex]
  const tokenPreview = tokensFromBoundaries(round, selected)

  const toggleBoundary = (index: number) => {
    setWrong(false)
    setSelected((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])
  }

  const confirm = () => {
    if (!boundariesMatch(round, selected)) {
      playTone(state.save.audioEnabled, 'incorrect')
      setWrongAttempts((count) => count + 1)
      setWrong(true)
      return
    }
    playTone(state.save.audioEnabled)
    setWrong(false)
    if (roundIndex === TOKEN_ROUNDS.length - 1) {
      setComplete(true)
      if (!savedRef.current) {
        savedRef.current = true
        onSaved()
      }
    } else setRoundClear(true)
  }

  const nextRound = () => {
    setRoundIndex((index) => index + 1)
    setSelected([])
    setRoundClear(false)
    setWrong(false)
  }

  return (
    <NlpStageShell stage={1} wrongAttempts={wrongAttempts} onExit={onExit}>
      <main className="tokenization-layout">
        <section className="archive-task-card">
          <span>ARCHIVE SENTENCE {roundIndex + 1} / {TOKEN_ROUNDS.length}</span>
          <h2>{round.source}</h2>
          <p>Tap the seams where a token should end.</p>
        </section>
        <section className={`token-strip-panel ${wrong ? 'is-wrong' : ''}`} aria-label="Connected word strip">
          <div className="token-strip">
            {round.pieces.map((piece, index) => (
              <span className="token-piece-wrap" key={`${round.id}-${piece}-${index}`}>
                <b>{piece}</b>
                {index < round.pieces.length - 1 && (
                  <button
                    type="button"
                    className={selected.includes(index) ? 'is-split' : ''}
                    aria-label={`Toggle split after ${piece}`}
                    aria-pressed={selected.includes(index)}
                    onClick={() => toggleBoundary(index)}
                  ><i /></button>
                )}
              </span>
            ))}
          </div>
          <div className="token-preview" aria-label={`Current tokens: ${tokenPreview.join(', ')}`}>
            <span>CURRENT TOKENS</span>
            <div>{tokenPreview.map((token, index) => <b key={`${token}-${index}`}>{token}</b>)}</div>
          </div>
        </section>
        <div className="nlp-action-row"><PixelButton variant="secondary" onClick={() => setSelected([])}>Reset</PixelButton><PixelButton onClick={confirm}>Confirm Splits</PixelButton></div>
      </main>
      {roundClear && (
        <section className="nlp-round-overlay" role="dialog">
          <p>TOKEN SEQUENCE ACCEPTED</p>
          <h2>{tokensFromBoundaries(round, round.correctBoundaries).join(' | ')}</h2>
          <PixelButton onClick={nextRound}>Next Sentence</PixelButton>
        </section>
      )}
      {complete && <NlpStageSuccess stage={1} onContinue={onContinue} />}
    </NlpStageShell>
  )
}

function PredictionStage({ onSaved, onContinue, onExit }: { onSaved: () => void; onContinue: () => void; onExit: () => void }) {
  const { state } = useGame()
  const [roundIndex, setRoundIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [roundClear, setRoundClear] = useState(false)
  const [complete, setComplete] = useState(false)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [wrong, setWrong] = useState(false)
  const savedRef = useRef(false)
  const round = PREDICTION_ROUNDS[roundIndex]

  const confirm = () => {
    if (!selected) return
    if (!predictionIsLikely(round, selected)) {
      playTone(state.save.audioEnabled, 'incorrect')
      setWrongAttempts((count) => count + 1)
      setWrong(true)
      return
    }
    playTone(state.save.audioEnabled)
    setWrong(false)
    if (roundIndex === PREDICTION_ROUNDS.length - 1) {
      setComplete(true)
      if (!savedRef.current) {
        savedRef.current = true
        onSaved()
      }
    } else setRoundClear(true)
  }

  const nextRound = () => {
    setRoundIndex((index) => index + 1)
    setSelected(null)
    setRoundClear(false)
    setWrong(false)
  }

  return (
    <NlpStageShell stage={2} wrongAttempts={wrongAttempts} onExit={onExit}>
      <main className="prediction-layout">
        <section className="prediction-prompt-card">
          <span>CONTEXT WINDOW {roundIndex + 1} / {PREDICTION_ROUNDS.length}</span>
          <h2>{round.prompt}</h2>
          <p>Which word is most likely to come next?</p>
        </section>
        <section className={`word-choice-panel ${wrong ? 'is-wrong' : ''}`}>
          <div className="word-choice-row">
            {round.choices.map((choice) => (
              <button type="button" key={choice.word} className={selected === choice.word ? 'is-selected' : ''} onClick={() => { setSelected(choice.word); setWrong(false) }}>{choice.word}</button>
            ))}
          </div>
          {selected && (
            <div className="probability-display" aria-label="Predefined simulated probabilities">
              <strong>SIMULATED PREDICTION // PREDEFINED</strong>
              {round.choices.map((choice) => (
                <div className={selected === choice.word ? 'is-selected' : ''} key={choice.word}>
                  <span>{choice.word}</span><i><b style={{ width: `${choice.probability}%` }} /></i><em>{choice.probability}%</em>
                </div>
              ))}
            </div>
          )}
        </section>
        <div className="nlp-action-row"><span>{selected ? 'Probabilities revealed. Confirm the strongest contextual fit.' : 'Choose a candidate to reveal the teaching simulation.'}</span><PixelButton disabled={!selected} onClick={confirm}>Confirm Prediction</PixelButton></div>
      </main>
      {roundClear && (
        <section className="nlp-round-overlay" role="dialog"><p>CONTEXT MATCH</p><h2>{round.prompt.replace('___', round.correctWord)}</h2><PixelButton onClick={nextRound}>Next Context</PixelButton></section>
      )}
      {complete && <NlpStageSuccess stage={2} onContinue={onContinue} />}
    </NlpStageShell>
  )
}

function SemanticStage({ onSaved, onContinue, onExit }: { onSaved: () => void; onContinue: () => void; onExit: () => void }) {
  const { state } = useGame()
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [connected, setConnected] = useState<string[]>([])
  const [wrongWord, setWrongWord] = useState<string | null>(null)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [showMap, setShowMap] = useState(false)
  const [complete, setComplete] = useState(false)
  const savedRef = useRef(false)

  const chooseRight = (right: string) => {
    if (!selectedLeft) return
    if (!synonymMatches(selectedLeft, right)) {
      playTone(state.save.audioEnabled, 'incorrect')
      setWrongAttempts((count) => count + 1)
      setWrongWord(right)
      window.setTimeout(() => setWrongWord(null), 520)
      return
    }
    playTone(state.save.audioEnabled)
    const next = [...connected, selectedLeft]
    setConnected(next)
    setSelectedLeft(null)
    if (next.length === SYNONYM_PAIRS.length) setShowMap(true)
  }

  const finishMap = () => {
    setShowMap(false)
    setComplete(true)
    if (!savedRef.current) {
      savedRef.current = true
      onSaved()
    }
  }

  return (
    <NlpStageShell stage={3} wrongAttempts={wrongAttempts} onExit={onExit}>
      <main className="semantic-layout">
        <header><span>SEMANTIC LINK ARRAY</span><strong>{connected.length} / {SYNONYM_PAIRS.length} CONNECTIONS</strong></header>
        <section className="semantic-board" aria-label="Connect words with similar meanings">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {connected.map((left) => {
              const leftIndex = SYNONYM_PAIRS.findIndex((pair) => pair.left === left)
              const right = SYNONYM_PAIRS[leftIndex].right
              const rightIndex = SYNONYM_RIGHT_ORDER.indexOf(right)
              return <line key={left} x1="28" y1={14 + leftIndex * 24} x2="72" y2={14 + rightIndex * 24} />
            })}
          </svg>
          <div className="semantic-column left-column">
            {SYNONYM_PAIRS.map((pair) => <button type="button" key={pair.left} disabled={connected.includes(pair.left)} className={selectedLeft === pair.left ? 'is-selected' : connected.includes(pair.left) ? 'is-locked' : ''} onClick={() => setSelectedLeft(pair.left)}>{pair.left}</button>)}
          </div>
          <div className="semantic-core" aria-hidden="true"><i /><b>≈</b><i /></div>
          <div className="semantic-column right-column">
            {SYNONYM_RIGHT_ORDER.map((right) => {
              const isConnected = connected.some((left) => synonymMatches(left, right))
              return <button type="button" key={right} disabled={isConnected} className={`${isConnected ? 'is-locked' : ''} ${wrongWord === right ? 'is-wrong' : ''}`} onClick={() => chooseRight(right)}>{right}</button>
            })}
          </div>
        </section>
        <p className="nlp-instruction">Choose a word on the left, then connect it to the closest meaning on the right.</p>
      </main>
      {showMap && (
        <section className="semantic-map-overlay" role="dialog" aria-label="Semantic neighborhood">
          <p>SEMANTIC NEIGHBORHOOD EXPANDED</p>
          <h2>Related does not always mean identical.</h2>
          <div className="meaning-map" aria-label="Happy, Joyful, and Cheerful are close while Engine is far away">
            <i className="map-link link-one" /><i className="map-link link-two" />
            <span className="meaning-node node-happy">Happy</span><span className="meaning-node node-joyful">Joyful</span><span className="meaning-node node-cheerful">Cheerful</span><span className="meaning-node node-engine">Engine</span>
          </div>
          <blockquote>LEXI-7: Meaning forms neighborhoods. Context decides which doorstep matters.</blockquote>
          <PixelButton onClick={finishMap}>Record Meaning Map</PixelButton>
        </section>
      )}
      {complete && <NlpStageSuccess stage={3} onContinue={onContinue} />}
    </NlpStageShell>
  )
}

function OrderingConsole({
  order,
  selected,
  onSelected,
  onOrder,
  onReset,
  onConfirm,
  label,
}: {
  order: string[]
  selected: number | null
  onSelected: (index: number) => void
  onOrder: (order: string[]) => void
  onReset: () => void
  onConfirm: () => void
  label: string
}) {
  const move = (offset: -1 | 1) => {
    if (selected === null) return
    const next = moveWord(order, selected, offset)
    if (next === order) return
    onOrder(next)
    onSelected(selected + offset)
  }
  return (
    <div className="ordering-console">
      <div className="word-order" aria-label={label}>
        {order.map((word, index) => <button type="button" key={`${word}-${index}`} className={selected === index ? 'is-selected' : ''} aria-pressed={selected === index} onClick={() => onSelected(index)}>{word}</button>)}
      </div>
      <div className="ordering-controls">
        <button type="button" disabled={selected === null || selected === 0} onClick={() => move(-1)}>◀ Move Left</button>
        <button type="button" disabled={selected === null || selected === order.length - 1} onClick={() => move(1)}>Move Right ▶</button>
        <button type="button" onClick={onReset}>Reset</button>
        <PixelButton onClick={onConfirm}>Confirm Order</PixelButton>
      </div>
    </div>
  )
}

type BossPhase = 'INTRO' | 'SENTENCE' | 'ROUND_CLEAR' | 'ATTENTION' | 'FINAL_TITLE' | 'TRANSFORMER_ACTIVATION' | 'COMPLETE'

function TransformerBossStage({ onComplete, onFinish, onExit }: { onComplete: () => void; onFinish: () => void; onExit: () => void }) {
  const { state } = useGame()
  const [phase, setPhase] = useState<BossPhase>('INTRO')
  const [roundIndex, setRoundIndex] = useState(0)
  const [order, setOrder] = useState([...ORDERING_ROUNDS[0].scrambled])
  const [selected, setSelected] = useState<number | null>(null)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [wrong, setWrong] = useState(false)
  const [attentionLinked, setAttentionLinked] = useState(false)
  const [activationStep, setActivationStep] = useState(0)
  const completionSavedRef = useRef(false)
  const round = ORDERING_ROUNDS[roundIndex]

  useEffect(() => {
    if (phase !== 'TRANSFORMER_ACTIVATION') return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const delays = reduced ? [20, 40, 60] : [420, 980, 1540]
    const timers = delays.map((delay, index) => window.setTimeout(() => setActivationStep(index + 1), delay))
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [phase])

  const reject = () => {
    playTone(state.save.audioEnabled, 'incorrect')
    setWrongAttempts((count) => count + 1)
    setWrong(true)
    window.setTimeout(() => setWrong(false), 560)
  }

  const confirmSentence = () => {
    if (!orderingMatches(order, round.correct)) return reject()
    playTone(state.save.audioEnabled)
    setWrong(false)
    setPhase('ROUND_CLEAR')
  }

  const nextSentence = () => {
    if (roundIndex === ORDERING_ROUNDS.length - 1) {
      setPhase('ATTENTION')
      setSelected(null)
      return
    }
    const nextIndex = roundIndex + 1
    setRoundIndex(nextIndex)
    setOrder([...ORDERING_ROUNDS[nextIndex].scrambled])
    setSelected(null)
    setPhase('SENTENCE')
  }

  const chooseAttention = (choice: string) => {
    if (choice !== 'robot') return reject()
    playTone(state.save.audioEnabled)
    setWrong(false)
    setAttentionLinked(true)
  }

  const startFinalTitle = () => {
    setOrder([...FINAL_TITLE_SCRAMBLED])
    setSelected(null)
    setPhase('FINAL_TITLE')
  }

  const confirmTitle = () => {
    if (!finalTitleMatches(order)) return reject()
    playTone(state.save.audioEnabled, 'complete')
    setWrong(false)
    setActivationStep(0)
    setPhase('TRANSFORMER_ACTIVATION')
  }

  const restoreModule = () => {
    if (!completionSavedRef.current) {
      completionSavedRef.current = true
      onComplete()
    }
    setPhase('COMPLETE')
  }

  return (
    <NlpStageShell stage={4} wrongAttempts={wrongAttempts} onExit={onExit}>
      <div className="archive-readout"><strong>FINAL BOSS // TRANSFORMER ARCHIVE</strong><span>{phase.replaceAll('_', ' ')}</span></div>
      <main className={`transformer-vault phase-${phase.toLowerCase()} ${wrong ? 'is-wrong' : ''}`}>
        <div className="archive-machine" aria-hidden="true"><div className="archive-crown"><i /><i /><i /></div><div className="archive-screen"><span>LEXICON</span><b>{phase === 'COMPLETE' ? 'ONLINE' : 'LOCKED'}</b></div><div className="archive-ports"><i /><i /><i /><i /></div></div>
        <div className="attention-network" aria-hidden="true">{[0, 1, 2, 3, 4].map((node) => <i key={node} />)}<b /><b /><b /><b /></div>
      </main>

      {phase === 'INTRO' && (
        <section className="boss-panel boss-intro" role="dialog">
          <p>LEXI-7 // ARCHIVE BRIEF</p><h2>Restore the Transformer Archive</h2>
          <div className="lexi-brief-lines"><span>Every word can look at every other word.</span><span>Attention helps a model decide what matters now.</span><span>Restore the sentences. Then restore the archive.</span></div>
          <PixelButton onClick={() => setPhase('SENTENCE')}>Begin Restoration</PixelButton>
        </section>
      )}

      {phase === 'SENTENCE' && (
        <section className={`boss-panel sentence-panel ${wrong ? 'is-wrong' : ''}`}>
          <p>SENTENCE FRAGMENT {roundIndex + 1} / {ORDERING_ROUNDS.length}</p><h2>Put the words into a meaningful order.</h2>
          <OrderingConsole order={order} selected={selected} onSelected={setSelected} onOrder={setOrder} onReset={() => { setOrder([...round.scrambled]); setSelected(null) }} onConfirm={confirmSentence} label="Sentence ordering tiles" />
        </section>
      )}

      {phase === 'ROUND_CLEAR' && (
        <section className="boss-panel boss-round-clear" role="dialog"><p>SEQUENCE RESTORED</p><h2>{round.correct.join(' ')}</h2><span>Meaning returns when structure and context work together.</span><PixelButton onClick={nextSentence}>{roundIndex === ORDERING_ROUNDS.length - 1 ? 'Open Attention Core' : 'Next Fragment'}</PixelButton></section>
      )}

      {phase === 'ATTENTION' && (
        <section className={`boss-panel attention-panel ${attentionLinked ? 'is-linked' : ''}`}>
          <p>ATTENTION CHECK // REFERENCE LINK</p>
          <div className="attention-sentence">
            {ATTENTION_SENTENCE.map((word, index) => <span key={`${word}-${index}`} className={word === 'robot' ? 'is-source' : word === 'it' ? 'is-pronoun' : ''}>{word}</span>)}
            {attentionLinked && <i aria-hidden="true" />}
          </div>
          <h2>What does “it” refer to?</h2>
          <div className="attention-choices">{ATTENTION_CHOICES.map((choice) => <PixelButton key={choice} variant={choice === 'robot' && attentionLinked ? 'primary' : 'secondary'} onClick={() => chooseAttention(choice)}>{choice}</PixelButton>)}</div>
          {attentionLinked && <div className="attention-explanation"><strong>CONNECTION WEIGHTED</strong><span>The pronoun points back to “robot.” Attention helps the system connect relevant words across a sentence.</span><PixelButton onClick={startFinalTitle}>Restore Final Record</PixelButton></div>}
        </section>
      )}

      {phase === 'FINAL_TITLE' && (
        <section className={`boss-panel sentence-panel title-order-panel ${wrong ? 'is-wrong' : ''}`}>
          <p>FINAL RECORD // TITLE FRAGMENTS</p><h2>Order the archived title.</h2>
          <OrderingConsole order={order} selected={selected} onSelected={setSelected} onOrder={setOrder} onReset={() => { setOrder([...FINAL_TITLE_SCRAMBLED]); setSelected(null) }} onConfirm={confirmTitle} label="Archived title ordering tiles" />
        </section>
      )}

      {phase === 'TRANSFORMER_ACTIVATION' && (
        <section className={`transformer-activation step-${activationStep}`} role="dialog" aria-label="Transformer archive restored">
          <div className="activation-rings" aria-hidden="true"><i /><i /><i /></div>
          <p>TRANSFORMER ARCHIVE RESTORED</p>
          <span className="archive-year">2017</span>
          <h2>Attention Is All You Need</h2>
          <strong>A PAPER THAT CHANGED MODERN AI</strong>
          <blockquote>LEXI-7: Its transformer architecture used attention to connect context across a sequence. Modern language AI grew from that powerful idea.</blockquote>
          {activationStep >= 3 && <PixelButton onClick={restoreModule}>Restore Language Module</PixelButton>}
        </section>
      )}

      {phase === 'COMPLETE' && (
        <section className="boss-panel archive-complete-panel" role="dialog">
          <p>LANGUAGE MODULE ONLINE</p><h2>Language Decoder</h2>
          <div className="voice-wave-icon" aria-hidden="true"><i /><i /><i /><i /><i /></div>
          <blockquote>LEXI-7: You separated tokens, followed probabilities, linked meanings, and used attention to recover context.</blockquote>
          <PixelButton onClick={onFinish}>Complete Lab</PixelButton>
        </section>
      )}
    </NlpStageShell>
  )
}

function NlpReplayChoice({ onReplay, onExit }: { onReplay: () => void; onExit: () => void }) {
  return (
    <div className="scene nlp-replay-scene lab-nlp">
      <div className="nlp-replay-panel">
        <div className="replay-words" aria-hidden="true"><span>WORD</span><i /><span>MEANING</span><i /><span>CONTEXT</span></div>
        <p>LANGUAGE MODULE ONLINE</p><h2>The archive can hear you clearly.</h2>
        <blockquote>LEXI-7: Welcome back. The dictionaries have agreed to remain in alphabetical order.</blockquote>
        <div><PixelButton onClick={onReplay}>Replay Archive</PixelButton><PixelButton variant="secondary" onClick={onExit}>Return to Academy</PixelButton></div>
      </div>
    </div>
  )
}

export function NlpLabScene() {
  const { state, dispatch } = useGame()
  const initialStage = Math.max(1, Math.min(4, state.save.stageProgress.nlp + 1)) as NlpStageNumber
  const [stage, setStage] = useState<NlpStageNumber>(initialStage)
  const [showReplayChoice, setShowReplayChoice] = useState(state.save.completedLabs.nlp && state.save.stageProgress.nlp >= 4)

  if (state.currentLab !== 'nlp') return null

  const exit = () => dispatch({ type: 'LEAVE_LAB' })
  const saveStage = (completedStage: 1 | 2 | 3) => dispatch({ type: 'RECORD_NLP_STAGE', stage: completedStage })

  if (showReplayChoice) return <NlpReplayChoice onReplay={() => { setStage(1); setShowReplayChoice(false) }} onExit={exit} />
  if (stage === 1) return <TokenizationStage onSaved={() => saveStage(1)} onContinue={() => setStage(2)} onExit={exit} />
  if (stage === 2) return <PredictionStage onSaved={() => saveStage(2)} onContinue={() => setStage(3)} onExit={exit} />
  if (stage === 3) return <SemanticStage onSaved={() => saveStage(3)} onContinue={() => setStage(4)} onExit={exit} />
  return <TransformerBossStage onComplete={() => dispatch({ type: 'COMPLETE_NLP_LAB' })} onFinish={() => dispatch({ type: 'FINISH_NLP_LAB' })} onExit={exit} />
}
