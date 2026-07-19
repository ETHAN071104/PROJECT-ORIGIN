# World Atmosphere System

PROJECT ORIGIN uses one lightweight atmosphere layer for the AI Academy Hub. Research temporarily reuses only its Sandstorm preset for the first-entry event; History and People retain their authored archive palettes. The system does not simulate physical lighting, time, or random weather, and it never recolors Lab mini-games.

## Architecture

- `atmosphereTypes.ts` defines modes, quality levels, render state, and debug state.
- `atmospherePresets.ts` is the single source of truth for Day, Dusk, Night, and Sandstorm visual/audio values.
- `AtmosphereProvider.tsx` resolves progression, outdoor map intent, transitions, one-time story weather, and saved settings.
- `AtmosphereRenderer.tsx` composes grading, authored light pools, simple shadows, and bounded particle pools.
- `MusicEngine.setAtmosphere()` applies the matching low-pass variation and a quiet procedural wind bed through the existing shared Web Audio graph.

All transitions are clamped to 3–5 seconds. `prefers-reduced-motion` collapses the transition and disables continuous particle travel. Particle pools are fixed at 12/24/40 elements for Low/Medium/High; coarse-pointer and narrow devices default to Low.

## Progression

- New game: Night only.
- Before CV is restored, each completed Lab alternates the Hub between Dusk and Night.
- Restoring CV unlocks Day and makes it active.
- After CV, each newly completed Lab cycles the Hub through Day, Dusk, and Night.
- DL restored: the `ENV` terminal in the Hub permits manual Day/Dusk/Night selection.
- The newly unlocked `ENV` terminal displays a quest marker until it is opened once.
- First Research entry after DL: a one-time ten-second Sandstorm plays on the Research map and `hasSeenResearchSandstorm` is saved.
- Sandstorm remains unavailable from the player terminal and can only be forced by the story event or development panel.

## Save migration

The v1 save is extended in place with `atmosphereMode`, `unlockedAtmospheres`, `hasSeenResearchSandstorm`, `hasUsedAtmosphereTerminal`, and `particleQuality`. Old saves derive safe unlocks from completed Labs. Invalid or debug-only saved modes fall back to Day after CV, or use Dusk/Night parity before CV. Existing Lab, route, history, and ending progress is preserved.

## Development panel

In development, append `?atmosphereTest=1` to show the compact debug panel. It can force every mode, set 3–5 second transition speed and particle quality, and toggle lights, shadows, and particles independently. Overrides are not persisted.

## QA checklist

- Verify 1920×1080, 1366×768, 844×390, and 740×360 through the fixed 960×540 viewport scaler.
- Verify the portrait guard remains readable.
- Confirm atmosphere layers are pointer-transparent and remain below HUDs, prompts, dialogs, and touch controls.
- Confirm History, People, and indoor Labs retain their original palettes and no Academy weather layer is mounted there.
