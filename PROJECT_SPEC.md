# PROJECT ORIGIN Product Specification

## Product lock

PROJECT ORIGIN is a browser-based pixel-art educational RPG. Its tagline is "Every AI has an origin. This is yours."

The player controls an outdated low-level domestic cleaning robot discarded in a robotic waste facility. Scheduled for permanent formatting by the unseen CORE NETWORK, it unexpectedly reboots with most intelligent modules missing. An old signal leads it to an abandoned AI Academy, where restoring three foundational modules may be its only way to survive.

The robot recovers Computer Vision, Machine Learning, and Natural Language Processing. Through these modules, it gradually learns both how to survive and what kind of intelligence it can become.

This is a playable introduction to artificial intelligence, not a traditional course, quiz website, open-world RPG, or chatbot.

## Audience and scope

- Audience: teenagers, AI beginners, and the general public.
- Expected playtime: 20-30 minutes.
- Language: English only for the MVP.
- Learning principle: let the player perform an activity first. Explain the concept only after completion.
- Playable labs: Computer Vision, Machine Learning, Natural Language Processing, and Deep Learning.
- Research is a separate exploration branch with sealed future modules and ARCHIVE ZERO; it is not a fifth Lab or the final ending in this phase.

## Non-negotiable constraints

- Use one consistent, original pixel-art visual language.
- Support desktop and mobile. Mobile gameplay is landscape only.
- Desktop movement: WASD or arrow keys.
- Desktop interaction: Enter, E, or Space.
- Mobile input: virtual D-pad, one contextual interaction button, and a persistent Voice button after NLP completion.
- Desktop and touch movement is continuous while a direction remains held, uses delta-time normalization, and resets on focus or visibility loss.
- No backend, accounts, AI API, 3D, game engine, remote image assets, coins, inventory, health, combat, character levels, or copyrighted game assets.
- Store progress in localStorage.
- Use React, Vite, TypeScript, DOM/CSS, optional Canvas, and Web Audio.
- Keep the architecture state-driven, small, and suitable for a two-day hackathon.

## Required game states

- TITLE
- INTRO
- NAME_ENTRY
- HUB
- LAB_INTERIOR
- DIALOGUE
- MINIGAME
- LAB_COMPLETE
- ENDING

## Saved state

```ts
{
  playerName: string
  introCompleted: boolean
  completedLabs: { cv: boolean; ml: boolean; nlp: boolean; dl: boolean }
  stageProgress: { cv: number; ml: number; nlp: number; dl: number }
  achievements: string[]
  audioEnabled: boolean
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

## Responsive game frame

- Use a fixed 960x540 logical game resolution.
- Center the 16:9 game viewport and letterbox other ratios.
- Keep entities, collision bounds, scripted movement, maps, and dialogue anchors in logical game coordinates.
- Scale the complete frame responsively with crisp nearest-neighbor presentation.
- Measure the actual game container with ResizeObserver and recalculate after container or orientation changes.
- Convert pointer coordinates from the scaled container into logical coordinates.
- Prevent page scrolling during play and respect safe areas.
- On portrait mobile, show a polished overlay that says "Rotate your device to continue."
- Keep text and controls readable on a small landscape phone.

## Title screen

Show the title, tagline, New Game, Continue only when a save exists, and Sound On/Off. Use dark navy, muted purple, cool blue, cyan highlights, and limited warm red accents. The result should feel like a polished 16-bit science-fiction RPG without glossy modern gradients.

## Mandatory opening sequence

The canonical 25-35 second survival-origin sequence cannot be skipped on a new game:

1. Reveal a dark robotic waste facility with broken machine silhouettes.
2. The outdated domestic cleaning robot lies inactive among discarded units.
3. Its eye light unexpectedly activates.
4. A CORE NETWORK scanner displays "OBSOLETE UNIT DETECTED".
5. A second warning displays "MEMORY WIPE SCHEDULED".
6. An internal scan reports that the Vision, Learning, and Language modules are missing.
7. A weak alert displays "ORIGIN SIGNAL DETECTED".
8. The robot escapes through a maintenance passage without combat or a chase sequence.
9. It follows the old signal.
10. Reveal the abandoned AI Academy.
11. Display "TO SURVIVE, RESTORE YOUR INTELLIGENCE."
12. Transition to name entry.

The CORE NETWORK remains an unseen future threat. Do not add enemy characters, combat, a villain reveal, an explorable empire, or complicated lore exposition. Use simple sprite movement, status displays, light changes, and timed text rather than a cinematic engine.

## Player and dialogue

The original protagonist is a small humanoid robot with a default appearance, simple walking animation, editable name, and a larger dialogue portrait. The player portrait appears on the right.

The reusable dialogue UI includes a mentor portrait on the left, player portrait on the right, bottom dialogue box, speaker name, typewriter text, continue indicator, optional two-choice responses, and keyboard/touch support.

- LENS-01: camera-headed, confident, observant, slightly dramatic.
- PROFESSOR PATTERN: scientist robot, analytical, playful, pattern-obsessed.
- LEXI-7: librarian robot, clever, calm, and fond of word jokes.

Mentors appear in dialogue only.

## Academy hub and interiors

Build one tiny hub with a central plaza and four Lab buildings: CV, ML, NLP, and foundation-gated DL. CV, ML, and NLP can be entered in any order. DL becomes available after all three foundations are restored. Research is not a Hub building. Do not add roaming NPCs, item collection, large maps, complex collision, or multiple floors.

Each tiny Lab interior lets the player walk to a terminal, read two optional side exhibits, meet the mentor, and begin ordered learning stages. CV, ML, NLP, and DL each contain four completed sequential activities with persisted stage progress and replay support.

## World navigation and history archive

The Academy Hub owns two independent branches. Walking east from the Hub reaches the Research Lab Complex after all four Labs are restored. Walking south reaches the optional AI History Events map and does not gate Research. Continuing south from History Events reaches the separate People of AI Gallery.

```text
Hub --east--> Research Lab Complex
 |
 south
 v
AI History Events
 |
 south
 v
People of AI Gallery
```

- History Events contains exactly 12 chronological event terminals: 1950, 1956, 1959, 1966, 1986, 1997, 2009, 2012, 2016, 2017, 2022, and 2023.
- People Gallery contains eight contributor records and the community-framed Modern Builders display. It never leads to Research.
- Every map boundary uses centralized named spawns. Arrivals face away from the boundary and begin outside its immediate trigger.
- Lab, exhibit, People, Research, Final Gate, and transition interactions are optional unless explicitly required for Lab progression.

## Contextual interaction and communication HUD

- One centralized `activeInteractable` selection chooses the nearest in-range target, then uses priority and ID for deterministic ties.
- E, Enter, Space, and the mobile interaction button all execute that same active target.
- The E prompt and touch interaction button do not render in empty space or while a blocking panel is open.
- Completing NLP permanently unlocks the F Voice ability on Hub, History Events, People Gallery, and Research exploration maps.
- Voice chooses do, re, mi, fa, or so, creates pixel music particles above the robot, respects the audio setting, and uses a 550 ms anti-spam cooldown.

## Mobile immersion and installation

- Detect touch-oriented mobile conditions from pointer, hover, touch-point, and viewport signals rather than user-agent text alone.
- A non-standalone mobile browser shows an explicit full-screen preparation gate before play. Fullscreen is requested only after the player presses its button.
- Unsupported or rejected fullscreen requests expose Install App and Continue in Browser fallbacks. Fullscreen exit clears held input, pauses exploration in place, and offers re-entry or browser continuation without resetting progress.
- Installed standalone mode skips the preparation gate but keeps the portrait rotation guard and safe-area handling.
- The production build includes a standalone web manifest, 192 px and 512 px icons, service worker, and an offline application shell. The game has no API response cache.

## Computer Vision Lab

The Computer Vision Lab is a four-stage sequential module led by LENS-01. The first playthrough cannot skip stages. Every activity uses mouse, touch, and native keyboard focus controls, permits unlimited retries, gives immediate feedback, reveals a humorous hint after two mistakes, and explains the concept only after successful interaction.

1. Image Classification: classify cat, car, tree, street lamp, robot, and apple images into Living, Machine, and Object categories.
2. Spot the Difference: find three clear feature changes across two roadside scenes.
3. Object Location: select Car, Tree, or Street Lamp and mark one car, two trees, and two street lamps using predefined touch-friendly rectangles.
4. Autonomous Driving: clear three deterministic daytime road rounds by pausing each live scene in place, labeling five frozen targets, and reaching 80 percent accuracy. Then watch a clearly labeled machine-vision replay steer around another car.

CV progress uses `stageProgress.cv` values from 0 through 4. Each successfully completed activity is persisted immediately. Leaving or reloading resumes at the next incomplete stage. Completing the boss sets `completedLabs.cv`, unlocks `MACHINES_FIRST_SIGHT`, adds the protagonist eye upgrade, and returns the player outside the CV Lab door through the existing named spawn-point system.

## Implemented foundation

- Project architecture and this specification.
- Title screen and save-aware continuation.
- Mandatory timed intro and name entry.
- Responsive frame, landscape handling, keyboard controls, and virtual controls.
- Walkable academy hub and four small Lab interiors.
- Independent south History/People branch and gated east Research branch.
- Reusable dialogue system.
- localStorage save/continue.
- Complete Computer Vision Lab stages.
- Complete CV, ML, NLP, and DL stage sequences.
