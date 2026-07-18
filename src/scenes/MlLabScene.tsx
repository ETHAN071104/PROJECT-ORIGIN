import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { playTone } from '../audio/audio'
import { PixelButton } from '../components/PixelButton'
import { Portrait } from '../components/Portrait'
import {
  calculateBoundaryAccuracy,
  CAT_QUESTIONS,
  FEATURE_CHALLENGES,
  ML_CATEGORIES,
  ML_EXPLANATIONS,
  ML_HINTS,
  ML_LEARN_MORE,
  ML_PREDICTION_EXAMPLE,
  ML_STAGE_TITLES,
  ML_TRAINING_EXAMPLES,
  PREDICTION_PRODUCTS,
  productLabel,
  TRAINING_PRODUCTS,
  mlExampleMatches,
  type FactoryProduct,
  type MlCategory,
  type MlExample,
  type MlExampleId,
  type MlStageNumber,
} from '../data/mlLab'
import { useGame } from '../game/GameContext'

function useTransientFeedback(duration = 520) {
  const [feedback, setFeedback] = useState<string | null>(null)
  const timeoutRef = useRef<number | null>(null)

  const flash = useCallback((value: string) => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    setFeedback(value)
    timeoutRef.current = window.setTimeout(() => setFeedback(null), duration)
  }, [duration])

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
  }, [])

  return { feedback, flash }
}

function MlStageShell({
  stage,
  wrongAttempts,
  onExit,
  children,
}: {
  stage: MlStageNumber
  wrongAttempts: number
  onExit: () => void
  children: ReactNode
}) {
  const [hintDismissed, setHintDismissed] = useState(false)
  return (
    <div className="scene ml-stage-scene lab-ml">
      <header className="ml-stage-hud">
        <div className="ml-stage-title">
          <span>{stage === 4 ? 'FINAL BOSS' : `STAGE ${stage}`}</span>
          <strong>{ML_STAGE_TITLES[stage]}</strong>
        </div>
        <div className="ml-stage-progress" aria-label={`Machine Learning stage ${stage} of 4`}>
          {[1, 2, 3, 4].map((step) => <i key={step} className={step <= stage ? 'is-active' : ''} />)}
        </div>
        <PixelButton variant="secondary" className="ml-exit-button" onClick={onExit}>Exit Lab</PixelButton>
      </header>
      {wrongAttempts >= 2 && !hintDismissed && (
        <aside className="pattern-hint" role="status">
          <div className="pattern-hint-face" aria-hidden="true"><i /><i /><b /></div>
          <strong>PROFESSOR PATTERN</strong>
          <span>{ML_HINTS[stage]}</span>
          <button type="button" className="mentor-hint-close" aria-label="Close Professor Pattern hint" onClick={() => setHintDismissed(true)}>×</button>
        </aside>
      )}
      {children}
    </div>
  )
}

function MlStageSuccess({ stage, onContinue }: { stage: 1 | 2 | 3; onContinue: () => void }) {
  return (
    <div className="ml-success-overlay" role="dialog" aria-label={`${ML_STAGE_TITLES[stage]} complete`}>
      <div className="ml-success-panel">
        <span className="ml-success-glyph" aria-hidden="true">✓</span>
        <p>PATTERN FOUND</p>
        <h2>{ML_STAGE_TITLES[stage]}</h2>
        <blockquote>{ML_EXPLANATIONS[stage]}</blockquote>
        <details>
          <summary>Learn More</summary>
          <p>{ML_LEARN_MORE[stage]}</p>
        </details>
        <PixelButton onClick={onContinue}>Continue</PixelButton>
      </div>
    </div>
  )
}

function ExampleArt({ id }: { id: MlExampleId }) {
  return <span className={`ml-example-art ml-art-${id}`} aria-hidden="true"><i /><i /><b /><b /></span>
}

function SupervisedStage({ onSaved, onContinue, onExit }: { onSaved: () => void; onContinue: () => void; onExit: () => void }) {
  const { state } = useGame()
  const [selected, setSelected] = useState<MlExampleId | null>(null)
  const [placed, setPlaced] = useState<Record<string, MlCategory>>({})
  const [predictionMode, setPredictionMode] = useState(false)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [complete, setComplete] = useState(false)
  const savedRef = useRef(false)
  const { feedback, flash } = useTransientFeedback()

  const chooseCategory = (category: MlCategory) => {
    const exampleId = predictionMode ? ML_PREDICTION_EXAMPLE.id : selected
    if (!exampleId) return
    if (!mlExampleMatches(exampleId, category)) {
      playTone(state.save.audioEnabled, 'incorrect')
      setWrongAttempts((count) => count + 1)
      flash(exampleId)
      if (!predictionMode) setSelected(null)
      return
    }

    playTone(state.save.audioEnabled)
    if (predictionMode) {
      setComplete(true)
      if (!savedRef.current) {
        savedRef.current = true
        onSaved()
      }
      return
    }

    const next = { ...placed, [exampleId]: category }
    setPlaced(next)
    setSelected(null)
    if (Object.keys(next).length === ML_TRAINING_EXAMPLES.length) setPredictionMode(true)
  }

  return (
    <MlStageShell stage={1} wrongAttempts={wrongAttempts} onExit={onExit}>
      <main className={`supervised-layout ${predictionMode ? 'is-predicting' : ''}`}>
        <section className="supervised-examples" aria-label="Labeled training examples">
          <header><span>TRAINING EXAMPLES</span><strong>{Object.keys(placed).length} / {ML_TRAINING_EXAMPLES.length} LABELED</strong></header>
          <div>
            {ML_TRAINING_EXAMPLES.map((example) => (
              <button
                type="button"
                key={example.id}
                className={`ml-example-card ${selected === example.id ? 'is-selected' : ''} ${placed[example.id] ? 'is-placed' : ''} ${feedback === example.id ? 'is-wrong' : ''}`}
                disabled={Boolean(placed[example.id]) || predictionMode}
                aria-pressed={selected === example.id}
                onClick={() => setSelected(example.id)}
              >
                <ExampleArt id={example.id} />
                <strong>{example.label}</strong>
                {placed[example.id] && <small>{placed[example.id]}</small>}
              </button>
            ))}
          </div>
        </section>
        <section className="supervised-categories" aria-label="Labeled categories">
          {ML_CATEGORIES.map((category) => (
            <button type="button" key={category} onClick={() => chooseCategory(category)}>
              <strong>{category}</strong>
              <span>{ML_TRAINING_EXAMPLES.filter((example) => placed[example.id] === category).map((example) => <i key={example.id}>{example.label}</i>)}</span>
            </button>
          ))}
        </section>
        {predictionMode && !complete && (
          <section className={`prediction-example ${feedback === ML_PREDICTION_EXAMPLE.id ? 'is-wrong' : ''}`} role="dialog" aria-label="Predict a new example">
            <p>NEW EXAMPLE</p>
            <h2>Based on the examples, where does this belong?</h2>
            <div><ExampleArt id={ML_PREDICTION_EXAMPLE.id} /><strong>{ML_PREDICTION_EXAMPLE.label}</strong></div>
            <span>Choose a labeled category.</span>
          </section>
        )}
      </main>
      <p className="ml-instruction">{predictionMode ? 'Use the labeled examples to predict the new item.' : 'Select an example, then select its correct label.'}</p>
      {complete && <MlStageSuccess stage={1} onContinue={onContinue} />}
    </MlStageShell>
  )
}

function DecisionBoundaryStage({ onSaved, onContinue, onExit }: { onSaved: () => void; onContinue: () => void; onExit: () => void }) {
  const { state } = useGame()
  const [centerX, setCenterX] = useState(34)
  const [angle, setAngle] = useState(30)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [complete, setComplete] = useState(false)
  const { feedback, flash } = useTransientFeedback()
  const result = useMemo(() => calculateBoundaryAccuracy(centerX, angle), [angle, centerX])
  const savedRef = useRef(false)

  const adjustCenter = (amount: number) => setCenterX((value) => Math.max(20, Math.min(80, value + amount)))
  const adjustAngle = (amount: number) => setAngle((value) => Math.max(-50, Math.min(50, value + amount)))
  const submit = () => {
    if (!result.passed) {
      playTone(state.save.audioEnabled, 'incorrect')
      setWrongAttempts((count) => count + 1)
      flash('graph')
      return
    }
    playTone(state.save.audioEnabled)
    setComplete(true)
    if (!savedRef.current) {
      savedRef.current = true
      onSaved()
    }
  }

  return (
    <MlStageShell stage={2} wrongAttempts={wrongAttempts} onExit={onExit}>
      <main className="boundary-layout">
        <section className={`boundary-chart ${feedback === 'graph' ? 'is-wrong' : ''}`} aria-label={`Decision boundary chart, ${result.accuracy}% accuracy`}>
          <div className="boundary-grid" aria-hidden="true" />
          <span className="boundary-axis-label axis-blue">BLUE TEAM</span>
          <span className="boundary-axis-label axis-orange">ORANGE TEAM</span>
          {result.points.map((point) => (
            <i
              key={point.id}
              className={`boundary-point is-${point.group} ${point.correct ? '' : 'is-misclassified'}`}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              title={`${point.group} point${point.correct ? '' : ', currently on the wrong side'}`}
            />
          ))}
          <div className="decision-line" style={{ left: `${centerX}%`, transform: `translate(-50%, -50%) rotate(${angle}deg)` }}><i /></div>
        </section>
        <aside className="boundary-console">
          <div className={`accuracy-readout ${result.passed ? 'is-passing' : ''}`}>
            <span>CLASSIFICATION ACCURACY</span>
            <strong>{result.accuracy}%</strong>
            <small>{result.points.filter((point) => !point.correct).length} dots confused</small>
          </div>
          <div className="boundary-controls" aria-label="Decision line controls">
            <button type="button" onClick={() => adjustAngle(-10)}><span>↺</span>Rotate Left</button>
            <button type="button" onClick={() => adjustAngle(10)}><span>↻</span>Rotate Right</button>
            <button type="button" onClick={() => adjustCenter(-4)}><span>◀</span>Move Left</button>
            <button type="button" onClick={() => adjustCenter(4)}><span>▶</span>Move Right</button>
          </div>
          <PixelButton onClick={submit}>Test Boundary</PixelButton>
        </aside>
      </main>
      <p className="ml-instruction">Move and rotate the line until at least 90% of the dots are separated.</p>
      {complete && <MlStageSuccess stage={2} onContinue={onContinue} />}
    </MlStageShell>
  )
}

function CatArt() {
  return (
    <div className="decision-cat" aria-label="Pixel-art cat">
      <i className="cat-tail" /><i className="cat-body" /><i className="cat-head" />
      <b className="cat-eye cat-eye-left" /><b className="cat-eye cat-eye-right" />
      <span className="cat-whiskers">≡</span><span className="cat-legs"><i /><i /><i /><i /></span>
    </div>
  )
}

function DecisionTreeStage({ onSaved, onContinue, onExit }: { onSaved: () => void; onContinue: () => void; onExit: () => void }) {
  const { state } = useGame()
  const [answers, setAnswers] = useState<boolean[]>([])
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [complete, setComplete] = useState(false)
  const { feedback, flash } = useTransientFeedback()
  const savedRef = useRef(false)
  const current = CAT_QUESTIONS[answers.length]

  const answer = (value: boolean) => {
    if (!current) return
    if (value !== current.answer) {
      playTone(state.save.audioEnabled, 'incorrect')
      setWrongAttempts((count) => count + 1)
      flash(current.id)
      return
    }
    playTone(state.save.audioEnabled)
    const next = [...answers, value]
    setAnswers(next)
    if (next.length === CAT_QUESTIONS.length) {
      setComplete(true)
      if (!savedRef.current) {
        savedRef.current = true
        onSaved()
      }
    }
  }

  return (
    <MlStageShell stage={3} wrongAttempts={wrongAttempts} onExit={onExit}>
      <main className="tree-layout">
        <section className="cat-inspection-card">
          <span>SUBJECT // UNKNOWN</span>
          <CatArt />
          <strong>{complete ? 'PREDICTION: CAT' : 'OBSERVE FEATURES'}</strong>
        </section>
        <section className="tree-question-panel">
          <span>QUESTION {Math.min(answers.length + 1, CAT_QUESTIONS.length)} / {CAT_QUESTIONS.length}</span>
          <h2 className={feedback === current?.id ? 'is-wrong' : ''}>{current?.question ?? 'All feature questions answered.'}</h2>
          {!complete && <div><PixelButton onClick={() => answer(true)}>Yes</PixelButton><PixelButton variant="secondary" onClick={() => answer(false)}>No</PixelButton></div>}
        </section>
        <section className="decision-tree" aria-label="Growing decision tree">
          {CAT_QUESTIONS.map((question, index) => {
            const visible = index <= answers.length
            const chosen = answers[index]
            return (
              <div key={question.id} className={`tree-node ${visible ? 'is-visible' : ''} ${index === answers.length ? 'is-current' : ''}`}>
                <span>{index + 1}</span>
                <strong>{question.question.replace('Does it have ', '').replace('?', '')}</strong>
                <div><i className={chosen === true ? 'is-route' : ''}>YES</i><i className={chosen === false ? 'is-route' : ''}>NO</i></div>
                {index < CAT_QUESTIONS.length - 1 && <b aria-hidden="true" />}
              </div>
            )
          })}
          {complete && <div className="tree-prediction">CAT</div>}
        </section>
      </main>
      <p className="ml-instruction">Answer each feature question and watch the prediction path grow.</p>
      {complete && <MlStageSuccess stage={3} onContinue={onContinue} />}
    </MlStageShell>
  )
}

function FactoryProductArt({ product, highlightFeatures = false }: { product: FactoryProduct; highlightFeatures?: boolean }) {
  const classes = [
    product.crackedScreen ? 'has-cracked-screen' : '',
    product.missingPanel ? 'has-missing-panel' : '',
    product.wrongLight ? 'has-wrong-light' : '',
    product.bentAntenna ? 'has-bent-antenna' : '',
    product.missingWheel ? 'has-missing-wheel' : '',
    highlightFeatures ? 'show-features' : '',
  ].filter(Boolean).join(' ')
  const visibleFeatures = [
    product.crackedScreen ? 'cracked screen' : '',
    product.missingPanel ? 'missing side panel' : '',
    product.wrongLight ? 'red warning light' : '',
    product.bentAntenna ? 'bent antenna' : '',
    product.missingWheel ? 'missing wheel' : '',
  ].filter(Boolean)
  return (
    <div className={`factory-product ${classes}`} aria-label={`${product.name}. ${visibleFeatures.length ? `Visible features: ${visibleFeatures.join(', ')}` : 'All visible parts are present.'}`}>
      <div className="product-antenna"><i /></div>
      <div className="product-head"><span className="product-screen"><i /><b /></span><span className="product-light" /></div>
      <div className="product-body"><span className="product-panel" /><i className="origin-production-mark" /></div>
      <div className="product-wheel wheel-left" /><div className="product-wheel wheel-right" />
      <small>{product.serial}</small>
    </div>
  )
}

type FactoryPhase = 'BRIEF' | 'TRAINING' | 'TRAINING_COMPLETE' | 'FEATURES' | 'STORY' | 'TRAINED' | 'PREDICTING' | 'RESULTS'

function FactoryBossStage({ onComplete, onFinish, onExit }: { onComplete: () => void; onFinish: () => void; onExit: () => void }) {
  const { state } = useGame()
  const [phase, setPhase] = useState<FactoryPhase>('BRIEF')
  const [trainingIndex, setTrainingIndex] = useState(0)
  const [featureIndex, setFeatureIndex] = useState(0)
  const [storyLine, setStoryLine] = useState(0)
  const [predictionIndex, setPredictionIndex] = useState(0)
  const [sortedProducts, setSortedProducts] = useState(0)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const completionSavedRef = useRef(false)
  const { feedback, flash } = useTransientFeedback(650)
  const trainingProduct = TRAINING_PRODUCTS[trainingIndex]
  const featureChallenge = FEATURE_CHALLENGES[featureIndex]
  const predictionProduct = PREDICTION_PRODUCTS[predictionIndex]

  const labelTraining = (label: 'Normal' | 'Defective') => {
    if (label !== productLabel(trainingProduct)) {
      playTone(state.save.audioEnabled, 'incorrect')
      setWrongAttempts((count) => count + 1)
      flash('product')
      return
    }
    playTone(state.save.audioEnabled)
    if (trainingIndex === TRAINING_PRODUCTS.length - 1) setPhase('TRAINING_COMPLETE')
    else setTrainingIndex((index) => index + 1)
  }

  const answerFeature = (value: boolean) => {
    if (value !== featureChallenge.answer) {
      playTone(state.save.audioEnabled, 'incorrect')
      setWrongAttempts((count) => count + 1)
      flash('product')
      return
    }
    playTone(state.save.audioEnabled)
    if (featureIndex === FEATURE_CHALLENGES.length - 1) {
      setStoryLine(0)
      setPhase('STORY')
    } else setFeatureIndex((index) => index + 1)
  }

  const advanceStory = () => {
    playTone(state.save.audioEnabled)
    if (storyLine === 0) setStoryLine(1)
    else setPhase('TRAINED')
  }

  useEffect(() => {
    if (phase !== 'PREDICTING' || !predictionProduct || predictionProduct.uncertain) return
    const timeout = window.setTimeout(() => {
      setSortedProducts((count) => count + 1)
      if (predictionIndex === PREDICTION_PRODUCTS.length - 1) setPhase('RESULTS')
      else setPredictionIndex((index) => index + 1)
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 250 : 1150)
    return () => window.clearTimeout(timeout)
  }, [phase, predictionIndex, predictionProduct])

  useEffect(() => {
    if (phase !== 'RESULTS' || completionSavedRef.current) return
    completionSavedRef.current = true
    onComplete()
  }, [onComplete, phase])

  const resolveUncertain = (label: 'Normal' | 'Defective') => {
    if (label !== productLabel(predictionProduct)) {
      playTone(state.save.audioEnabled, 'incorrect')
      setWrongAttempts((count) => count + 1)
      flash('prediction')
      return
    }
    playTone(state.save.audioEnabled)
    setSortedProducts((count) => count + 1)
    if (predictionIndex === PREDICTION_PRODUCTS.length - 1) setPhase('RESULTS')
    else setPredictionIndex((index) => index + 1)
  }

  const displayedProduct = phase === 'TRAINING' || phase === 'TRAINING_COMPLETE'
    ? trainingProduct
    : phase === 'FEATURES' || phase === 'STORY'
      ? featureChallenge.product
      : phase === 'PREDICTING'
        ? predictionProduct
        : TRAINING_PRODUCTS[0]

  return (
    <MlStageShell stage={4} wrongAttempts={wrongAttempts} onExit={onExit}>
      <div className="factory-readout">
        <strong>{phase === 'BRIEF' ? 'FINAL BOSS // SIMULATION BRIEF' : phase === 'TRAINING' || phase === 'TRAINING_COMPLETE' ? 'PHASE 1 // TRAINING DATA' : phase === 'FEATURES' || phase === 'STORY' ? 'PHASE 2 // FEATURE CHECK' : 'PHASE 3 // MODEL PREDICTION'}</strong>
        <span>ORIGIN INDUSTRIAL QUALITY SIMULATION</span>
      </div>
      <main className="factory-floor">
        <div className="factory-lights" aria-hidden="true"><i /><i /><i /></div>
        <div className="inspection-scanner" aria-hidden="true"><span>SCAN</span><i /></div>
        <div className="classification-station station-normal"><strong>NORMAL</strong><i /></div>
        <div className="classification-station station-defective"><strong>DEFECTIVE</strong><i /></div>
        <div className="factory-conveyor"><i /><i /><i /><i /><i /><i /><i /><i /></div>
        <div key={displayedProduct?.id} className={`factory-product-wrap ${feedback === 'product' || feedback === 'prediction' ? 'is-wrong' : ''} ${phase === 'PREDICTING' ? 'is-scanning' : ''}`}>
          {displayedProduct && <FactoryProductArt product={displayedProduct} highlightFeatures={phase === 'FEATURES' || phase === 'PREDICTING'} />}
        </div>
        {(phase === 'TRAINING' || phase === 'TRAINING_COMPLETE') && (
          <div className="training-dataset" aria-label={`${trainingIndex + (phase === 'TRAINING_COMPLETE' ? 1 : 0)} labeled examples`}>
            <span>LABELED DATA</span>
            <div>{TRAINING_PRODUCTS.map((product, index) => <i key={product.id} className={index < trainingIndex + (phase === 'TRAINING_COMPLETE' ? 1 : 0) ? 'is-filled' : ''} />)}</div>
          </div>
        )}
        {phase === 'FEATURES' && (
          <div className="learned-features"><span>DEFECT FEATURES</span>{FEATURE_CHALLENGES.map((challenge, index) => <i key={challenge.id} className={index < featureIndex ? 'is-learned' : ''}>{challenge.feature.replace(/([A-Z])/g, ' $1')}</i>)}</div>
        )}
        {phase === 'PREDICTING' && predictionProduct && (
          <div className={`simulated-prediction ${predictionProduct.uncertain ? 'is-uncertain' : ''}`}>
            <span>SIMULATED CLASSIFIER ACTIVE</span>
            <strong>{predictionProduct.uncertain ? 'UNCERTAIN' : predictionProduct.simulatedPrediction.toUpperCase()}</strong>
            <small>{predictionProduct.uncertain ? 'CONFIDENCE 51% // REVIEW REQUIRED' : 'AUTO-SORTING'}</small>
          </div>
        )}
      </main>

      {phase === 'BRIEF' && (
        <section className="factory-overlay factory-brief" role="dialog" aria-label="Factory inspection briefing">
          <p>PROFESSOR PATTERN // SIMULATION BRIEF</p>
          <h2>Factory Quality Inspection</h2>
          <blockquote>This production line resembles the facility that discarded you. Label examples, inspect defects, then test the pattern.</blockquote>
          <div><span>6 examples</span><span>3 feature checks</span><span>1 simulated classifier</span></div>
          <PixelButton onClick={() => setPhase('TRAINING')}>Start Inspection</PixelButton>
        </section>
      )}
      {phase === 'TRAINING' && (
        <section className="factory-action-panel">
          <div><span>EXAMPLE {trainingIndex + 1} / {TRAINING_PRODUCTS.length}</span><strong>{trainingProduct.name}</strong></div>
          <p>Label this example.</p>
          <div><PixelButton onClick={() => labelTraining('Normal')}>Normal</PixelButton><PixelButton variant="danger" onClick={() => labelTraining('Defective')}>Defective</PixelButton></div>
        </section>
      )}
      {phase === 'TRAINING_COMPLETE' && (
        <section className="factory-overlay factory-phase-complete" role="dialog">
          <p>PROFESSOR PATTERN</p><h2>Training set recorded</h2>
          <blockquote>Every answer becomes an example.</blockquote>
          <PixelButton onClick={() => setPhase('FEATURES')}>Check Features</PixelButton>
        </section>
      )}
      {phase === 'FEATURES' && (
        <section className="factory-action-panel feature-action-panel">
          <div><span>FEATURE {featureIndex + 1} / {FEATURE_CHALLENGES.length}</span><strong>{featureChallenge.question}</strong></div>
          <p>Inspect the highlighted product.</p>
          <div><PixelButton onClick={() => answerFeature(true)}>Yes</PixelButton><PixelButton variant="secondary" onClick={() => answerFeature(false)}>No</PixelButton></div>
        </section>
      )}
      {phase === 'STORY' && (
        <section className="factory-story" role="dialog" aria-label="Production mark memory">
          <Portrait type="mentor" mentor="ml" active={storyLine === 1} />
          <div><span>{storyLine === 0 ? state.save.playerName : 'PROFESSOR PATTERN'}</span><p>{storyLine === 0 ? 'I have seen this production mark before.' : 'Then your past may contain more patterns than your memory.'}</p><PixelButton onClick={advanceStory}>Continue</PixelButton></div>
          <Portrait type="player" active={storyLine === 0} visionUpgraded={state.save.completedLabs.cv} learningUpgraded={state.save.completedLabs.ml} communicationUpgraded={state.save.completedLabs.nlp} deepLearningUpgraded={state.save.completedLabs.dl} />
        </section>
      )}
      {phase === 'TRAINED' && (
        <section className="factory-overlay model-trained" role="dialog">
          <p>MODEL TRAINING COMPLETE</p><h2>Simulated classifier ready</h2>
          <blockquote>Examples and visible features now guide each deterministic prediction.</blockquote>
          <strong>SIMULATED CLASSIFIER ACTIVE</strong>
          <PixelButton onClick={() => { setPredictionIndex(0); setSortedProducts(0); setPhase('PREDICTING') }}>Run Classifier</PixelButton>
        </section>
      )}
      {phase === 'PREDICTING' && predictionProduct?.uncertain && (
        <section className={`uncertainty-review ${feedback === 'prediction' ? 'is-wrong' : ''}`} role="dialog">
          <span>HUMAN REVIEW REQUIRED</span><strong>MODEL PREDICTION: NORMAL</strong>
          <p>A missing wheel is highlighted. Confirm the prediction or correct it.</p>
          <div><PixelButton variant="secondary" onClick={() => resolveUncertain('Normal')}>Confirm Normal</PixelButton><PixelButton onClick={() => resolveUncertain('Defective')}>Correct: Defective</PixelButton></div>
        </section>
      )}
      {phase === 'RESULTS' && (
        <section className="factory-overlay factory-results" role="dialog" aria-label="Factory inspection results">
          <p>INSPECTION COMPLETE</p><h2>Pattern Finder</h2>
          <blockquote>The machine found patterns in the examples you labeled.</blockquote>
          <div className="factory-result-grid">
            <span><b>6</b>Labeled examples</span><span><b>10 / 10</b>Correct classifications</span><span><b>100%</b>Final accuracy</span><span><b>{sortedProducts}</b>Products sorted</span>
          </div>
          <strong>Learning does not begin with answers. It begins with examples.</strong>
          <PixelButton onClick={onFinish}>Complete Lab</PixelButton>
        </section>
      )}
    </MlStageShell>
  )
}

function MlReplayChoice({ onReplay, onExit }: { onReplay: () => void; onExit: () => void }) {
  return (
    <div className="scene ml-replay-scene lab-ml">
      <div className="ml-replay-panel">
        <div className="replay-chart" aria-hidden="true"><i /><i /><i /><b /></div>
        <p>LEARNING MODULE ONLINE</p>
        <h2>Patterns recorded</h2>
        <blockquote>PROFESSOR PATTERN: I predicted your return. This time I even did it before you arrived.</blockquote>
        <div><PixelButton onClick={onReplay}>Replay Training</PixelButton><PixelButton variant="secondary" onClick={onExit}>Return to Academy</PixelButton></div>
      </div>
    </div>
  )
}

export function MlLabScene() {
  const { state, dispatch } = useGame()
  const initialStage = Math.max(1, Math.min(4, state.save.stageProgress.ml + 1)) as MlStageNumber
  const [stage, setStage] = useState<MlStageNumber>(initialStage)
  const [showReplayChoice, setShowReplayChoice] = useState(state.save.completedLabs.ml && state.save.stageProgress.ml >= 4)

  if (state.currentLab !== 'ml') return null

  const exit = () => dispatch({ type: 'LEAVE_LAB' })
  const saveStage = (completedStage: 1 | 2 | 3) => dispatch({ type: 'RECORD_ML_STAGE', stage: completedStage })

  if (showReplayChoice) return <MlReplayChoice onReplay={() => { setStage(1); setShowReplayChoice(false) }} onExit={exit} />
  if (stage === 1) return <SupervisedStage onSaved={() => saveStage(1)} onContinue={() => setStage(2)} onExit={exit} />
  if (stage === 2) return <DecisionBoundaryStage onSaved={() => saveStage(2)} onContinue={() => setStage(3)} onExit={exit} />
  if (stage === 3) return <DecisionTreeStage onSaved={() => saveStage(3)} onContinue={() => setStage(4)} onExit={exit} />
  return <FactoryBossStage onComplete={() => dispatch({ type: 'COMPLETE_ML_LAB' })} onFinish={() => dispatch({ type: 'FINISH_ML_LAB' })} onExit={exit} />
}
