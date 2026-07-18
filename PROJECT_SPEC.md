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
- MVP labs: Computer Vision, Machine Learning, Natural Language Processing, and a locked Research Lab.
- Deep Learning is not part of the MVP.

## Non-negotiable constraints

- Use one consistent, original pixel-art visual language.
- Support desktop and mobile. Mobile gameplay is landscape only.
- Desktop movement: WASD or arrow keys.
- Desktop interaction: Enter, E, or Space.
- Mobile input: virtual D-pad and one large interaction button.
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
  completedLabs: { cv: boolean; ml: boolean; nlp: boolean }
  stageProgress: { cv: number; ml: number; nlp: number }
  achievements: string[]
  audioEnabled: boolean
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

Build one tiny hub with a central plaza, three accessible labs, a locked Research Lab, trees, lamps, signs, and academy technology. Labs can be entered in any order. The Research Lab unlocks only after all three labs are completed. Do not add quests, roaming NPCs, item collection, large maps, complex collision, or multiple floors.

Each tiny lab interior lets the player walk to a terminal, interact, meet the mentor, and begin ordered learning stages. The Computer Vision Lab is fully playable. Machine Learning and Natural Language Processing retain placeholder activities until their dedicated implementation passes.

## Computer Vision Lab

The Computer Vision Lab is a four-stage sequential module led by LENS-01. The first playthrough cannot skip stages. Every activity uses mouse, touch, and native keyboard focus controls, permits unlimited retries, gives immediate feedback, reveals a humorous hint after two mistakes, and explains the concept only after successful interaction.

1. Image Classification: classify cat, car, tree, street lamp, robot, and apple images into Living, Machine, and Object categories.
2. Spot the Difference: find three clear feature changes across two roadside scenes.
3. Object Location: select Car, Tree, or Street Lamp and mark one car, two trees, and two street lamps using predefined touch-friendly rectangles.
4. Autonomous Driving: clear three deterministic daytime road rounds by pausing each live scene in place, labeling five frozen targets, and reaching 80 percent accuracy. Then watch a clearly labeled machine-vision replay steer around another car.

CV progress uses `stageProgress.cv` values from 0 through 4. Each successfully completed activity is persisted immediately. Leaving or reloading resumes at the next incomplete stage. Completing the boss sets `completedLabs.cv`, unlocks `MACHINES_FIRST_SIGHT`, adds the protagonist eye upgrade, and returns the player outside the CV Lab door through the existing named spawn-point system.

## First implementation pass

- Project architecture and this specification.
- Title screen and save-aware continuation.
- Mandatory timed intro and name entry.
- Responsive frame, landscape handling, keyboard controls, and virtual controls.
- Walkable academy hub and three small lab interiors.
- Locked Research Lab door.
- Reusable dialogue system.
- localStorage save/continue.
- Complete Computer Vision Lab stages.
- Placeholder stage screens remain for Machine Learning and Natural Language Processing.
