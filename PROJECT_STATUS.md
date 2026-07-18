# PROJECT ORIGIN - Project Status

Updated: 2026-07-18

## Completed systems

- React, Vite, and strict TypeScript browser application with a reducer-driven game state machine.
- Fixed 960 x 540 logical game viewport, centered 16:9 scaling, letterboxing, safe-area support, portrait rotation overlay, and logical pointer conversion.
- PROJECT ORIGIN title screen with New Game, save-aware Continue, and persisted sound setting.
- Mandatory 33-second survival-origin opening, name entry, and academy arrival.
- Continuous delta-time-normalized WASD/arrow movement, Enter/E/Space interaction, and mobile landscape virtual controls.
- Academy hub with the CV, ML, NLP, and locked Research Lab doors.
- Walkable lab interiors, mentor terminals, early exits, and named return spawn points for every door.
- Reusable portrait/typewriter/choice dialogue system.
- localStorage save/continue with defensive loading and safe defaults.
- Compact lab-completion and achievement presentation.
- Deterministic procedural pixel art and Web Audio tones with no remote assets or backend.

## Completed Computer Vision content

- Stage 1 - Image Classification: six original pixel-art objects assigned to Living, Machine, or Object.
- Stage 2 - Spot the Difference: three predefined, touch-friendly roadside differences.
- Stage 3 - Object Location: class selection and predefined Car, Tree, and Street Lamp target rectangles.
- Final Boss - Autonomous Driving:
  - three distinct live daytime driving rounds;
  - pause freezes the exact current scene frame;
  - five deterministic labeling targets per round;
  - 80% pass threshold, retries, hints, and per-round results;
  - final simulated object-detection and avoidance replay.
- CV progress persists from stage 0 through 4 and resumes at the next incomplete activity.
- Completion sets `completedLabs.cv`, unlocks `MACHINES_FIRST_SIGHT`, adds the persistent eye upgrade, and returns through `hub-from-cv`.

## Completed Machine Learning content

- Professor Pattern introduction with the shared mentor-left/player-right dialogue presentation.
- Stage 1 - Supervised Learning:
  - six original pixel-art examples labeled as Animal, Vehicle, or Fruit;
  - select-an-example/select-a-label pointer and keyboard interaction;
  - permanent correct assignments, retry feedback, and a new pear prediction;
  - post-success explanation and collapsed Learn More section.
- Stage 2 - Decision Boundary:
  - deterministic blue and orange data clusters;
  - large rotate-left, rotate-right, move-left, and move-right controls;
  - continuous accuracy, highlighted mistakes, forgiving 90% threshold, and retries;
  - post-success explanation and collapsed Learn More section.
- Stage 3 - Cat Feature Decision Tree:
  - original pixel-art cat and the required five Yes/No feature questions;
  - growing five-node tree with visible Yes/No branches and highlighted route;
  - `PREDICTION: CAT`, retry feedback, explanation, and Learn More section.
- Final Boss - Factory Quality Inspection:
  - bright industrial simulation, moving conveyor rollers, scanner, and Normal/Defective stations;
  - six deterministic training examples with visible defects and labeled-dataset indicator;
  - three feature checks that build a defect-feature indicator;
  - short production-mark memory story beat;
  - simulated classifier, automatic sorting, one uncertain wrong prediction, player correction, and automatic completion of the remaining products;
  - final labeled examples, correct classifications, accuracy, and sorted-product result.
- Every ML activity allows unlimited retry and shows Professor Pattern's stage hint after two errors.
- ML progress persists from stage 0 through 4 and resumes at the next incomplete activity.
- Completion sets `completedLabs.ml`, unlocks `PATTERN_FINDER` / Pattern Finder, adds the persistent processing-light pulse, and returns through `hub-from-ml` facing down.
- Completed ML records can replay the whole training sequence without changing saved completion.

## Current architecture

- `src/App.tsx` selects a scene from the current reducer screen and active lab.
- `src/game/GameContext.tsx` owns reducer state and persists every save-state change.
- `src/game/reducer.ts` owns navigation, CV/ML stage progression, achievements, and named hub return spawns.
- `src/game/storage.ts` owns the `project-origin-save-v1` localStorage record, migration defaults, stage clamping, and defensive parsing.
- `src/game/coordinates.ts` owns the logical resolution, responsive fit calculation, and client-to-logical pointer conversion.
- `src/hooks/useSceneInput.ts` and `src/hooks/usePlayerMovement.ts` share keyboard/touch input and movement behavior.
- `src/data/maps.ts`, `src/data/labs.ts`, `src/data/cvLab.ts`, and `src/data/mlLab.ts` keep maps and deterministic activity configuration separate from scenes.
- `src/scenes/CvLabScene.tsx` and `src/scenes/MlLabScene.tsx` own their independent sequential lab flows.
- CSS builds the procedural pixel-art presentation; CV and ML extensions are isolated in `src/styles/cv.css` and `src/styles/ml.css`.

## Important reusable components

- `GameViewport`: responsive scaling and logical pointer coordinates.
- `PixelButton`: consistent keyboard-friendly pixel button.
- `PixelRobot`: shared protagonist sprite with walking direction plus persistent CV and ML upgrade variants.
- `Portrait`: player, system, and mentor portraits plus persistent player upgrades.
- `VirtualControls`: multi-pointer mobile D-pad and interaction control.
- `DialogueScene`: speaker portraits, typewriter text, response choices, and touch/keyboard advancement.
- `usePlayerMovement`: scene-agnostic continuous movement and interaction handling.
- Lab stage shells, success overlays, transient retry feedback, deterministic data helpers, and replay-choice screens provide patterns for the future NLP lab.

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

- CV uses stage values 0-4.
- ML uses stage values 0-4.
- NLP remains on the original placeholder completion flow.
- Save loading merges missing fields with defaults and clamps CV/ML progress safely.
- Saves made by the former one-button ML placeholder are migrated back to ML stage 0 unless they contain the new `PATTERN_FINDER` completion marker.

## Known limitations

- Natural Language Processing still uses its placeholder activity.
- The Research Lab remains locked until CV, ML, and NLP are complete; the final Research ending is intentionally not implemented.
- Automated coverage targets reducer navigation, movement math, responsive coordinates, CV data/boss calculations, and ML data/scoring helpers. Scene-level automation is currently a documented manual browser pass rather than a checked-in end-to-end suite.
- Audio is intentionally limited to generated UI tones.
- Collision is deliberately simple and rectangular for the hackathon scope.
- The factory classifier is an explicitly labeled deterministic simulation, not real model inference.

## Next planned phases

1. Implement the complete Natural Language Processing Lab without changing the finished CV or ML flows.
2. Add NLP stage persistence, achievement, and visual upgrade using the existing reducer/save patterns.
3. Implement the final Research Lab ending only after all three foundation labs are complete.
4. Consider a small checked-in browser smoke suite if the project moves beyond the hackathon MVP.

## Verification completed

- Production build passes with strict TypeScript checks.
- 5 Vitest files pass with 27 total tests.
- New Game, mandatory opening, name entry, Continue, hub movement, all four hub doors, early lab exit, and named CV/ML/NLP/Research return behavior were exercised in the browser.
- Mobile D-pad movement was exercised at 844 x 390.
- Responsive frame and no-scroll behavior were checked at 1920 x 1080, 1366 x 768, 844 x 390, and 740 x 360.
- Mobile dialogue, supervised learning, decision boundary, decision tree, and factory boss layouts were visually checked.
- The full ML sequence was completed with at least two intentional errors in every stage; all hints and retries appeared.
- Refresh after saved ML Stage 1 restored Stage 2 on the next lab entry.
- The uncertain factory prediction was first confirmed incorrectly, then corrected successfully without restarting.
- ML completion, Pattern Finder, stage 4 persistence, processing upgrade, and exact `hub-from-ml` spawn were verified.
- The full unchanged CV sequence and all three CV boss rounds were replayed successfully after ML integration.
- CV completion, Machine's First Sight, eye upgrade, and exact `hub-from-cv` spawn were verified alongside the ML upgrade.
- Browser console check reported no errors or warnings.
