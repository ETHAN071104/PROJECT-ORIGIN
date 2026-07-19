# PROJECT ORIGIN - Project Status

Updated: 2026-07-19

## Completed systems

- React, Vite, and strict TypeScript browser application with a reducer-driven game state machine.
- Fixed 960 x 540 logical game viewport with centered 16:9 scaling, letterboxing, safe-area support, a portrait rotation overlay, and logical pointer conversion.
- Screenshot-guided PROJECT ORIGIN archive title screen with a dedicated pixel-art academy backdrop, New Game, save-aware Continue, separate Creator Record and Project Record panels, and persisted sound setting.
- Creator Record presents Ethan Lim's creator, role, education, Malaysia location, project statement, and keyboard/touch-accessible GitHub and LinkedIn links. Project Record keeps the game format, curriculum, input, and project description separate from the biography.
- Home Settings offers English and Simplified Chinese. The selected language updates the current screen immediately, persists across Continue and refresh, survives New Game, and keeps curriculum answer IDs and scoring language-independent.
- Mandatory survival-origin opening, name entry, academy arrival, continuous keyboard movement, mobile landscape controls, and named door return spawns.
- Compact AI Academy hub with walkable CV, ML, NLP, and foundation-gated DL buildings around an environmental ORIGIN plaza, plus independent History/People and gated Research branches.
- Reusable portrait, typewriter, choice-dialogue, achievement, stage-success, hint, and replay systems.
- Defensive `localStorage` save/continue, stage clamping, legacy placeholder migration, persisted ending completion, and generated Web Audio tones.
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
  - final-title validation accepts both `Attention Is All You Need` and `All You Need Is Attention`, including their corresponding Chinese presentation order;
  - ceremonial `TRANSFORMER ARCHIVE RESTORED` sequence with 2017, `Attention Is All You Need`, historical context, Lexi explanation, and a distinct completion tone.
- Stage 0-4 persistence, `LANGUAGE_DECODER` / Language Decoder, replay mode, decoded academy signs, mouth/chest communication light, portrait voice-wave treatment, and `hub-from-nlp` return are complete.

## Completed Deep Learning content

- DL remains sealed until CV, ML, and NLP are complete. Its Hub interaction reports `THREE FOUNDATIONAL MODULES REQUIRED` with per-module status before unlock, then displays `DEEP LEARNING LAB ONLINE`.
- NODE-9 introduction uses the shared mentor-left/player-right dialogue flow, followed by the standard walkable lab terminal and resume/replay structure.
- Stage 1 - Neural Path:
  - exactly three deterministic connection grids with two, three, then four color pairs;
  - pointer-coordinate drag tracing that works across mobile touch cells, tap-by-tap fallback, one-step drag backtracking, orthogonal-only paths, collision/crossing prevention, endpoint-connectivity validation that accepts multiple valid routes, Reset, Undo, unlimited retry, and a dismissible two-error NODE-9 hint;
  - connection cells render direction-aware glow arms and circular junctions instead of a fixed vertical line;
  - post-stage explanation and Learn More note clearly label the grid as a connectivity analogy rather than a literal neural circuit.
- Stage 2 - Power the Network:
  - exactly three deterministic layered signal routes;
  - one visible transformation choice per layer, live arithmetic, current output, fixed maximum target, intentionally mixed upper/lower maximum-choice positions, Reset, unlimited retry, and a two-error hint;
  - the interface explicitly labels its visible multipliers as a conceptual analogy for learned weights.
- Stage 3 - Tune the Neuron:
  - deterministic pixel interference controlled by a circular knob, minus/plus buttons, pointer dragging, Arrow/A/D keys, and numeric confirmation;
  - the recovered digits remain unreadable interference blocks until displayed clarity reaches at least 98 percent;
  - fixed recovery numbers `3`, `67`, and `2012`, authored target angles/tolerances, unlimited retry, and a two-error hint;
  - the completion note records 2012 and AlexNet's ImageNet result as a historical deep-learning milestone.
- Final Boss - Gradient Descent Core:
  - exactly three deterministic loss curves with visible trajectory, current loss, step count, best loss, learning-rate controls, and round-three start-position choices;
  - real iterative parameter updates with deterministic `overshot`, `too slow`, `unstable`, `converged`, and `local minimum` outcomes;
  - unlimited retry, a two-failure NODE-9 hint, a final loss/gradient explanation, and a ceremonial Neural Core activation.
- Stage 0-4 persistence, `NEURAL_CORE_ONLINE` / Neural Core Online, replay, procedural DL audio cues, a persistent antenna/core upgrade, `hub-from-dl` return, Lab Signals `4 / 4`, and East Gate unlock are complete.
- Every mentor hint can now be closed after it appears, without resetting the activity.

## Completed world-map and navigation revision

- The world now uses four playable, flat 2D pixel-game maps: Hub, AI History Events, People of AI Gallery, and Research Lab Complex.
- Hub remains a compact asymmetric Academy campus with CV, ML, NLP, and foundation-gated DL buildings around the environmental ORIGIN emblem.
- Research is an independent east branch from Hub after DL completion. History is an optional south branch and is never required to reach Research.
- AI History Events continues south into People Gallery; People returns north to Events and has no Research exit.
- Centralized named spawns cover `hub-from-history`, `hub-from-research`, `history-events-from-hub`, `history-events-from-people`, `people-from-events`, and `research-from-hub`. Every arrival faces away and starts outside the immediate transition trigger.
- Research Lab Complex retains its three sealed future-module wings, converging final corridor, and ARCHIVE ZERO Final Gate without a structural redesign.
- Hub starts in a quiet, low-energy night state. Completing CV restores a warmer day palette and clearer campus visibility.
- Completing ML powers animated relays and data conduits. Completing NLP decodes campus signs and unlocks `F` voice expression using do/re/mi/fa/so tone choices.
- Completing all three foundation labs activates DL, but the east route remains sealed. Completing DL powers direct Hub-to-Research traversal and makes the ARCHIVE ZERO origin path eligible.
- The available DL building displays a quest exclamation mark, completed lab doors display a check badge, the unvisited History route gains a guide marker after the first Lab, the unvisited Research route gains one after all four Labs, and the Hub HUD includes a save-preserving Home button back to the title menu.
- South/north History traversal, east/west Research traversal, named return spawns, keyboard controls, and contextual mobile interaction/voice buttons are complete.

## Completed History Events and People Gallery content

- Every foundational Lab interior keeps its central gameplay terminal and adds two optional side exhibits: Shakey and AlexNet in CV, Arthur Samuel and AlphaGo in ML, ELIZA and the Transformer in NLP, and backpropagation popularization and Deep Belief Nets in DL.
- Every Lab interior now also has two cyan plants in white pixel pots, a readable subject-specific whiteboard, and a themed workbench. CV displays a camera and two lenses; ML, NLP, and DL use data, language, and neural-network props respectively.
- The shared exhibit component supports `E`, Enter, Space, touch interaction, close controls, concise first pages, optional Why It Matters pages, read-state lights, and opposite-side panels that do not cover the player.
- `src/data/historyArchive.ts` centralizes all historical entries, people records, Modern Builders wording, categories, dates, and original procedural icon keys.
- AI History Events contains only event terminals: 12 chronological records from 1950 through 2023, including the 1986 backpropagation-popularization milestone, paired Shakey/ELIZA, Claude/Gemini, and the explicit limited-timeline archive note.
- The separate People of AI Gallery contains only eight contributor terminals for Alan Turing, John McCarthy, Arthur Samuel, Geoffrey Hinton, Yoshua Bengio, Yann LeCun, Fei-Fei Li, and Demis Hassabis.
- The optional Modern Builders display uses contribution-based wording for Jensen Huang, Sam Altman, and Dario Amodei and explicitly credits the wider communities that build modern AI.
- History reading and traversal remain optional and never gate direct Hub-to-Research travel.

## Completed contextual HUD and Voice ability

- `src/game/interactions.ts` centralizes interaction candidates and selects one nearest in-range target with deterministic distance, priority, and ID ordering.
- Empty exploration space renders no E prompt and no mobile interaction button. Lab doors, terminals, exhibits, contributor displays, map returns, future doors, and ARCHIVE ZERO expose one contextual action only while in range.
- Desktop E/Enter/Space and the mobile E button call the same active action; blocking archive/Research panels suppress map interaction.
- NLP completion exposes permanent desktop and touch Voice controls during Hub, History Events, People Gallery, and Research exploration. Dialogue/panels, mini-games, title, intro, and result scenes do not expose it.
- Voice produces randomized do/re/mi/fa/so tones, three pixel-note particles, respects Sound On/Off, and applies a 550 ms cooldown.

## Completed mobile immersion and PWA shell

- Touch-mobile detection combines coarse-pointer, hover, touch-point, and viewport signals; standalone mode uses display-mode plus the safe iOS standalone flag.
- Non-standalone mobile browsers receive a pixel-art setup gate with user-triggered fullscreen, Install App, clear unsupported/rejected fallback, and Continue in Browser.
- Exiting an entered fullscreen session clears held input, pauses movement in place, and offers Return to Fullscreen or Continue in Browser without resetting the current scene or Lab.
- The existing portrait guard, fixed 960 x 540 logical frame, ResizeObserver scaling, pointer conversion, safe areas, and browser fallback remain intact.
- Touch controls suppress browser selection, tap highlight, drag, context-menu, and callout behavior. A held D-pad direction continues moving until pointer release or cancellation instead of requiring repeated taps.
- `manifest.webmanifest`, 192/512 pixel icons, production service-worker registration, runtime build-asset caching, standalone display, and offline navigation shell are complete. No API cache exists.

## Completed Research Lab Complex structure

- The Research map now progresses from a west entrance through Reinforcement Learning, Generative AI, and Agent Intelligence wings to the final corridor and ARCHIVE ZERO.
- All three future-module doors are visibly distinct, explicitly marked `FUTURE MODULE / LOCKED / COMING SOON / TO BE UPDATED`, and cannot be entered.
- The final corridor visually transitions toward unknown technology, converges cables around the ORIGIN symbol, and reacts with all four restored module lights.
- ARCHIVE ZERO has a layered crown, cyan-violet energy rails, a multi-part lock core, a `FINAL ACCESS` foundation, and persistent open/accessed visual states.
- ARCHIVE ZERO scans CV, ML, NLP, and DL as restored, displays `FOUNDATIONAL INTELLIGENCE RESTORED` and `ORIGIN RECORD DETECTED`, then exposes the explicit `ORIGIN PATH OPEN` action.
- After the ending, the gate remains softly active with `ORIGIN RECORD ACCESSED`; replay requires a deliberate gate interaction.

## Completed ARCHIVE ZERO ending

- The reducer admits the ending only when all four Labs are complete, Research is active, and the Final Gate has been reached.
- The gate scan and opening lead into a silent Origin Chamber with ordinary HUD, Voice, and free movement suppressed.
- The player controls ORI for exactly three short forward inputs via W, Arrow Up, or one touch-forward control, then softly contacts a colossal mechanical leg.
- A stepped camera tilt reveals one foreground original humanoid giant and several silent background silhouettes. A close-up softly wakes one eye/core with `AWAITING BUILDERS`; there is no combat, threat speech, villain reveal, or second ending.
- Three paced message cards deliver the small-beginnings, continued-learning, and future-AI-developer invitation before the PROJECT ORIGIN logo and tagline.
- `RETURN TO TITLE` and `CONTINUE EXPLORING` are keyboard/touch accessible. Both persist completion; Continue Exploring returns to `research-from-ending` before the gate.
- Continue/reload resumes Research and never replays the cinematic automatically. ARCHIVE ZERO offers an explicit replay path after completion.
- Gate, impact, reveal, and core cues are locally generated and respect the saved audio toggle.

## Academy completion and Research state

- Completing the third foundation lab awards `AI_AWAKENED` regardless of which lab is finished last and never duplicates the achievement.
- The three foundation flags activate DL and award `AI_AWAKENED`; they do not open the east route.
- Completing DL awards `NEURAL_CORE_ONLINE`, returns the player outside DL facing away from its door, powers the Hub route beacon, and unlocks the Hall route.
- Navigation is now Hub east → Research Lab Complex → ARCHIVE ZERO, while the independent optional branch is Hub south → AI History Events south → People of AI Gallery.
- Research exploration and the Final Gate become available after DL; entering the restored ARCHIVE ZERO path starts the completed origin-reveal ending.

## Current architecture

- `src/App.tsx` selects a scene from the reducer screen and active lab.
- `src/game/GameContext.tsx` owns reducer state, persists every normal save-state change, and exposes a non-persisting development-only ending preview.
- `src/i18n/i18n.ts` owns the Simplified Chinese game dictionary and safe dynamic-label patterns; `src/hooks/useDomTranslation.ts` localizes visible text and accessibility labels while preserving canonical gameplay data.
- `src/game/reducer.ts` owns the independent History and Research branches, foundation/DL gates, monotonic CV/ML/NLP/DL progress, achievements, named spawns, optional history reads, Final Gate eligibility, ending completion, and both ending exits.
- `src/game/storage.ts` owns `project-origin-save-v1`, safe four-lab/world/ending defaults, stage clamping, and legacy placeholder migrations.
- `src/data/maps.ts` owns Hub/History/People/Research bounds, targets, transition thresholds, and named spawns.
- `src/data/historyArchive.ts` owns all Lab exhibits, Hall timeline entries, People of AI records, and Modern Builders content.
- `src/data/cvLab.ts`, `src/data/mlLab.ts`, `src/data/nlpLab.ts`, and `src/data/dlLab.ts` keep deterministic teaching content and answer helpers separate from presentation.
- `src/scenes/HubScene.tsx`, `src/scenes/HistoryMapScene.tsx`, `src/scenes/PeopleMapScene.tsx`, and `src/scenes/ResearchMapScene.tsx` own four-map traversal, while the four Lab scenes keep their independent sequential flows.
- `src/scenes/EndingScene.tsx` owns the timed phase sequence, three-step input, giant reveal, final text, and exit choices; `src/styles/ending.css` owns its procedural pixel-art staging.
- `src/audio/audio.ts` generates the ending gate, impact, reveal, and core cues without remote audio assets.
- `src/game/interactions.ts` and `src/components/InteractionPrompt.tsx` own contextual target selection and the single shared E HUD contract.
- `src/game/immersive.ts` and `src/components/GameViewport.tsx` own touch-mobile detection, fullscreen/install state, input pausing, and standalone launch behavior.
- `src/hooks/useVoiceExpression.ts` owns NLP-unlocked `F` note selection, playback, and the short-lived map expression bubble.
- `src/styles/maps.css` owns the flat pixel-map system; `cv.css`, `ml.css`, `nlp.css`, and `dl.css` isolate each lab's procedural visual extension.
- Shared `PixelRobot` and `Portrait` components compose the persistent vision, learning, communication, and neural-core upgrades.

## Save-data structure

Storage key: `project-origin-save-v1`

```ts
{
  playerName: string
  introCompleted: boolean
  completedLabs: { cv: boolean; ml: boolean; nlp: boolean; dl: boolean }
  stageProgress: { cv: number; ml: number; nlp: number; dl: number }
  achievements: string[]
  audioEnabled: boolean
  language: 'en' | 'zh-CN'
  endingCompleted: boolean
  worldProgress: {
    hallVisited: boolean
    researchVisited: boolean
    finalGateReached: boolean
    readExhibitIds: string[]
    lastMap: 'hub' | 'history' | 'people' | 'research'
    lastSpawn: string
  }
}
```

- Every implemented lab uses stage values 0-4 and resumes at the next incomplete stage.
- Loading merges missing fields with defaults and clamps every stage to 0-4.
- Three-lab saves migrate with `completedLabs.dl = false` and `stageProgress.dl = 0` without changing the existing player, settings, lab progress, or achievements.
- Saves from former CV, ML, or NLP placeholder completions resume the corresponding real curriculum unless the new completion achievement is present.
- Saves without world progress receive safe Hub defaults. Valid History/People/Research visits, optional read IDs, Final Gate state, last map, and named entry spawn persist across refresh. Former corridor spawn IDs migrate to the new branches.
- Saves without an ending flag receive `endingCompleted = false`. Completed endings preserve every Lab, achievement, history record, and audio preference while resuming at `research-from-ending` without automatic replay.
- Saves without a valid language receive `language = 'en'`. English and Simplified Chinese selections persist, and starting a new game preserves the current language and sound preferences.

## Known limitations

- The three named Future Module wings remain intentionally sealed `COMING SOON` content; the completed ARCHIVE ZERO sequence is the only ending.
- The complete four-Lab curriculum click-through was not rerun because the Lab mini-games were deliberately unchanged; eligibility, migration, persistence, and post-ending navigation are covered by reducer/storage tests, with the final cinematic covered by a non-persisting development preview.
- iOS/iPadOS does not expose the standard install prompt or general element fullscreen consistently; the game therefore shows Add to Home Screen guidance and preserves Continue in Browser rather than claiming success.
- Service workers and native installation require a secure production origin (HTTPS, with localhost accepted for development). Vite development mode intentionally does not register the service worker to avoid stale local bundles.
- Audio remains intentionally limited to generated tones.
- Collision is deliberately simple and rectangular for the hackathon scope.
- Prediction bars, factory classification, and all displayed model behavior are transparent deterministic teaching simulations, not real inference.

## Next planned phase

1. Perform the planned global art, lighting, character, portrait, and environmental-detail pass across all four maps.
2. Consider a small checked-in browser smoke suite if the project moves beyond the hackathon MVP.
3. Expand the visibly sealed Future Module wings only in a later curriculum release; do not add another ending.

## Current revision verification

- Production build passes strict TypeScript checks.
- 13 Vitest files pass with 76 total tests.
- Reducer coverage verifies Hub/History/People/Research navigation plus ending eligibility, Final Gate triggering, completion persistence, safe Continue Exploring, Return to Title, and no automatic replay on Continue.
- Storage coverage verifies legacy corridor-spawn migration, History/People persistence without Research access, safe Hub fallback for invalid locked Research, default-false ending migration, and preservation of a completed ending at `research-from-ending`.
- Archive-data coverage verifies exactly eight Lab exhibits, 12 chronological event records, eight primary contributor records, unique IDs, and historically careful 1986 backpropagation wording.
- Interaction tests verify hidden empty-space state, nearest-target selection, and deterministic priority ties. Browser traversal verified no desktop/mobile E control in empty Hub space and matching CV labels/actions when in range.
- Voice tests verify the five syllables, permanent post-NLP exploration availability, non-exploration suppression, and the 550 ms cooldown.
- Immersion tests verify mobile-gate state, desktop/standalone bypass, non-UA touch detection, unsupported/rejected fullscreen fallback, and safe orientation-lock rejection.
- Browser traversal verified Hub south to the 12-event History map, continued south to the separate eight-person People Gallery, and returned north through both boundaries to Hub on a one-of-four save.
- History Events and People Gallery were visually checked as separate rooms with no mixed record types. The fixed frame, no-scroll layout, and virtual controls were checked at 844 x 390 and 740 x 360; the portrait guard was checked at 390 x 844.
- Mobile browser QA at 844 x 390 verified two-color touch dragging and completion in DL Stage 1, held-D-pad movement without selection, mixed DL Stage 2 answer positions, hidden Stage 3 digits at 96 percent and readable digits at 98 percent, and both History and Research route markers.
- CV, ML, and NLP Lab interiors were visually checked in the running game: whiteboards and workbench props remained legible, both plants stayed inside the frame, and neither history exhibit was obscured. The CV camera and two lenses were specifically verified.
- The non-persisting `?qa=ending` development preview verified the Final Gate scan/opening, three-input walk, impact, giant tilt/close-up, all message blocks, both ending choices, and the safe post-ending Research return without altering the normal saved game.
- Ending layout checks passed at 1920 x 1080, 1366 x 768, 844 x 390, and 740 x 360 with no logical-frame overflow; the portrait guard passed at 390 x 844.
- PWA output contains a standalone manifest, valid 192 x 192 and 512 x 512 PNG icons, service worker, and production offline-shell resources.
- Title-page browser QA verified both record dialogs, safe new-tab attributes on both creator links, initial focus, Escape closing, focus return, and the menu staying inside the fixed frame.

## Prior verification archive

- Production build passes strict TypeScript checks.
- 10 Vitest files pass with 53 total tests.
- Reducer coverage verifies the full gated route Hub → Hall → Research, both return spawns, optional read-state persistence, Final Gate state without an automatic ending, and safe Continue behavior on the last unlocked world map.
- Storage coverage verifies migration from saves without world fields, preservation of valid Hall/Research state, filtering of invalid read IDs, and safe fallback to the Hub when foundational access is incomplete.
- Archive-data coverage verifies exactly eight Lab exhibits, 11 chronological Hall records, eight primary contributor records, unique IDs, and historically careful 1986 backpropagation wording.
- Browser traversal verified the locked East Gate on a one-of-four save and the unlocked East Gate routing to Hall rather than directly to Research on a four-of-four save.
- Browser traversal verified Hall west → Hub, Hall east → Research, and Research west → the Hall's east-side named spawn.
- All eight Lab exhibits opened, advanced to Why It Matters, and closed through keyboard interaction. All eight People of AI records and the Modern Builders community display opened correctly.
- All three future-module panels opened as `ACCESS LOCKED`; ARCHIVE ZERO displayed four restored module checks, the required record messages, and remained in Research with no ending transition.
- Hall/Research layouts, no-scroll framing, visible future doors, virtual controls, opposite-side non-overlapping panels, and touch close interaction were checked at 1920 x 1080, 1366 x 768, 844 x 390, and 740 x 360. The portrait guard was checked at 390 x 844.
- Refresh plus Continue restored Hall of Origins as the last world map after entering through the powered East Gate.
- Reducer coverage verifies that DL cannot open before CV/ML/NLP, that the east route cannot open before DL, that DL progress is monotonic, and that completion produces stage 4, `NEURAL_CORE_ONLINE`, `hub-from-dl`, and powered Research access without an automatic ending.
- Data coverage verifies exactly three rounds per ordinary DL stage, authored and alternate valid connection routes, rejected missing/overlapping routes, visible signal arithmetic and maxima, deterministic tuning targets, and successful plus failed Gradient Descent outcomes including local minimum.
- Storage coverage verifies safe migration from the former three-lab save structure and fresh four-lab defaults.
- The running local title, Hub, Lab interior, Hall, and Research scenes passed browser DOM and visual smoke checks after implementation; the unchanged DL mini-game sequence remains covered by its existing unit and prior manual checks.
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
