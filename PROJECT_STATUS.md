# PROJECT ORIGIN - Project Status

Updated: 2026-07-18

## Completed systems

- React, Vite, and strict TypeScript browser application with a reducer-driven game state machine.
- Fixed 960 x 540 logical game viewport with centered 16:9 scaling, letterboxing, safe-area support, a portrait rotation overlay, and logical pointer conversion.
- Screenshot-guided PROJECT ORIGIN archive title screen with a dedicated pixel-art academy backdrop, New Game, save-aware Continue, Developer Details, and persisted sound setting.
- Mandatory survival-origin opening, name entry, academy arrival, continuous keyboard movement, mobile landscape controls, and named door return spawns.
- Compact AI Academy hub with walkable CV, ML, NLP, and locked DL buildings around an environmental ORIGIN plaza, plus a separate eastbound Research perimeter map.
- Reusable portrait, typewriter, choice-dialogue, achievement, stage-success, hint, and replay systems.
- Defensive `localStorage` save/continue, stage clamping, legacy placeholder migration, and generated Web Audio tones.
- Procedural pixel-art presentation with no remote assets, backend, or live AI inference.

## Completed Computer Vision content

- Stage 1 - Image Classification with six original objects and Living, Machine, or Object labels.
- Stage 2 - Spot the Difference with three predefined roadside differences.
- Stage 3 - Object Location with Car, Tree, and Street Lamp target rectangles.
- Final Boss - Autonomous Driving with three deterministic rounds, pause, labeling, retries, hints, scoring, and a final simulated detection replay.
- Stage 0-4 persistence, `MACHINES_FIRST_SIGHT`, the persistent eye upgrade, replay, and `hub-from-cv` return are complete.

## Completed Machine Learning content

- Stage 1 - Supervised Learning with six labeled examples and a pear prediction.
- Stage 2 - Decision Boundary with direct line controls, live accuracy, highlighted mistakes, and a 90% threshold.
- Stage 3 - Cat Feature Decision Tree with five feature questions and a visible prediction route.
- Final Boss - Factory Quality Inspection with training examples, feature checks, production-memory beat, simulated classifier, uncertain case, correction, and results.
- Unlimited retry, two-error hints, explanations, Learn More sections, Stage 0-4 persistence, `PATTERN_FINDER`, the processing-light upgrade, replay, and `hub-from-ml` return are complete.

## Completed Natural Language Processing content

- LEXI-7 introduction with three short setup lines, a player response choice, and a concise language/context handoff.
- Stage 1 - Tokenization:
  - three connected-strip rounds for `Robots can learn`, `Machines understand patterns`, and `Hello, robot!`;
  - selectable boundary seams, reset/confirm, exact answer validation, unlimited retry, and punctuation as separate tokens;
  - two-error Lexi hint plus explanation and tokenizer-variability Learn More note.
- Stage 2 - Next Word Prediction:
  - three required context prompts and choices;
  - fixed probability values rendered as visible bars only after selection;
  - explicit `SIMULATED PREDICTION // PREDEFINED` label, most-likely validation, unlimited retry, two-error hint, explanation, and Learn More note.
- Stage 3 - Similar Meanings:
  - Happy/Joyful, Large/Big, Quick/Fast, and Begin/Start matching;
  - locked correct pairs, visible SVG connection lines, wrong-pair retry, and two-error hint;
  - Happy/Joyful/Cheerful semantic neighborhood with Engine visibly distant and a clear “related, not exact” explanation.
- Final Boss - Transformer Archive:
  - explicit `INTRO`, three sentence-ordering rounds, `ATTENTION`, final-title ordering, `TRANSFORMER_ACTIVATION`, and `COMPLETE` phases;
  - selectable word tiles with large left/right controls, reset, confirm, unlimited retry, and two-error hint;
  - pronoun-reference question with a glowing robot-to-`it` connection;
  - ceremonial `TRANSFORMER ARCHIVE RESTORED` sequence with 2017, `Attention Is All You Need`, historical context, Lexi explanation, and a distinct completion tone.
- Stage 0-4 persistence, `LANGUAGE_DECODER` / Language Decoder, replay mode, decoded academy signs, mouth/chest communication light, portrait voice-wave treatment, and `hub-from-nlp` return are complete.

## Completed world-map redesign

- Replaced the former presentation-board layout with two playable, flat 2D pixel-game maps.
- Hub Map is a compact, asymmetric academy campus with CV, ML, NLP, and locked DL buildings surrounding a small ORIGIN ground emblem.
- The former central Research building is removed. Walking through the east gate now changes maps to a dedicated Research perimeter.
- Research Map contains one dominant final facility, a long approach road, checkpoint scanner, fences, light pylons, cables, and sparse research towers.
- Hub starts in a quiet, low-energy night state. Completing CV restores a warmer day palette and clearer campus visibility.
- Completing ML powers animated relays and data conduits. Completing NLP decodes campus signs and unlocks `F` voice expression using do/re/mi/fa/so tone choices.
- Completing all three foundation labs powers the east-route beacon and Research scanner while the final facility remains sealed for Phase 5.
- Right-edge and left-edge walk transitions, named return spawns, keyboard controls, and mobile interaction/voice buttons are complete.

## Foundation completion and Research state

- Completing the third foundation lab awards `AI_AWAKENED` regardless of which lab is finished last and never duplicates the achievement.
- All three completion flags visually power the Hub route beacon and Research checkpoint scanner while the facility remains sealed.
- Interacting with powered Research shows the persisted “powered, Phase 5 access pending” Academy Core message and returns to the Research perimeter.
- Research does not open and the ending does not play in Phase 4. The existing ending scene remains dormant for the future Research phase.

## Current architecture

- `src/App.tsx` selects a scene from the reducer screen and active lab.
- `src/game/GameContext.tsx` owns reducer state and persists every save-state change.
- `src/game/reducer.ts` owns navigation, monotonic CV/ML/NLP progress, achievements, named spawns, and the sealed Research state.
- `src/game/storage.ts` owns `project-origin-save-v1`, safe defaults, stage clamping, and legacy placeholder migrations.
- `src/data/maps.ts` owns Hub/Research bounds, targets, transition thresholds, and named spawns.
- `src/data/cvLab.ts`, `src/data/mlLab.ts`, and `src/data/nlpLab.ts` keep deterministic teaching content and answer helpers separate from presentation.
- `src/scenes/HubScene.tsx` and `src/scenes/ResearchMapScene.tsx` own the two-map campus traversal, while the three lab scenes own their independent sequential flows.
- `src/hooks/useVoiceExpression.ts` owns NLP-unlocked `F` note selection, playback, and the short-lived map expression bubble.
- `src/styles/maps.css` owns the flat pixel-map system; `cv.css`, `ml.css`, and `nlp.css` isolate each lab's procedural visual extension.
- Shared `PixelRobot` and `Portrait` components compose the persistent vision, learning, and communication upgrades.

## Save-data structure

Storage key: `project-origin-save-v1`

```ts
{
  playerName: string
  introCompleted: boolean
  completedLabs: { cv: boolean; ml: boolean; nlp: boolean }
  stageProgress: { cv: number; ml: number; nlp: number }
  achievements: string[]
  audioEnabled: boolean
}
```

- Every foundation lab uses stage values 0-4 and resumes at the next incomplete stage.
- Loading merges missing fields with defaults and clamps every stage to 0-4.
- Saves from former CV, ML, or NLP placeholder completions resume the corresponding real curriculum unless the new completion achievement is present.

## Known limitations

- The Research Lab interior and final ending remain intentionally unimplemented until Phase 5.
- Scene-level browser checks are documented manual passes rather than a checked-in end-to-end suite.
- Audio remains intentionally limited to generated tones.
- Collision is deliberately simple and rectangular for the hackathon scope.
- Prediction bars, factory classification, and all displayed model behavior are transparent deterministic teaching simulations, not real inference.

## Next planned phase

1. Build the Research Lab and final narrative ending without reopening or rewriting the completed foundation labs.
2. Add final-game progression after the already persisted Research-powered state.
3. Consider a small checked-in browser smoke suite if the project moves beyond the hackathon MVP.

## Verification completed

- Production build passes strict TypeScript checks.
- 7 Vitest files pass with 34 total tests.
- Hub-to-Research east-edge travel, Research-to-Hub west-edge return, named east-gate spawn, and sealed Research interaction were exercised in the browser.
- Full NLP sequence completed in the browser with at least two intentional errors in every activity and the boss; every retry and hint appeared.
- Refresh after NLP Stages 1, 2, and 3 resumed at the next stage on normal lab entry.
- Refresh after NLP completion preserved stage 4, Language Decoder, readable academy signs, communication upgrade, and replay mode.
- Tokenization accepted the exact required word/punctuation splits.
- Prediction rounds displayed the required fixed probabilities and explicit simulation label.
- Semantic pairs locked, connection state persisted during the activity, and the extended neighborhood appeared.
- All three sentence-ordering rounds, the incorrect then correct attention answer, final title ordering, activation sequence, and final completion were exercised.
- Responsive frame and visible controls were checked at 1920 x 1080, 1366 x 768, 844 x 390, and 740 x 360; the portrait rotation guard was checked at 390 x 844.
- CV Image Classification and ML Supervised Learning were re-entered through their normal hub/interior/dialogue paths after NLP completion.
- Reducer coverage verifies monotonic NLP progress, Language Decoder, AI Awakened for any lab completion order, powered Research dialogue, and the absence of an automatic ending.
- A clean preview load reported no browser console errors or warnings.
- Title-screen design QA passed against the supplied 16:9 reference after checking layout, typography, colors, raster asset fidelity, Developer Details, keyboard focus, sound toggle, New Game, and the no-save Continue state.
