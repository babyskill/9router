# Case Study: Witny the Owl (FitWitness Simple)

## Overview
**Witny** is the official mascot for "FitWitness Simple", an app utilizing a SpriteCook/WitnyGame engine to visualize health and onboarding data. The mascot uses a pixel-art style, evoking nostalgia while maintaining a gamified coaching presence.

## 1. Character Concept
- **Form**: A small, wise, but cute owl.
- **Personality**: A gentle observer and guide. Not overly energetic, but reliable and encouraging.
- **Art Style**: 16-bit Pixel Art.
- **Color Palette**: Muted earthy tones (browns, tans) with bright yellow eyes for expressiveness.

## 2. Emotional and Action States

For the integration into the app's onboarding and daily tracking, specific sprite states were generated:

### Core Movement (Game Engine)
- `idle`: Witny standing still, blinking occasionally. (Default anchor state)
- `walk`: A 4-frame walking animation for navigating between UI sections.
- `run`: Faster movement for achieving goals.
- `jump_front`: Used for active celebrations or transitioning.
- `hurt`: Used when a user breaks a streak or inputs negative health metrics.
- `death`: (Rare) Used for extreme gamified fail-states or complete account resets.

### Onboarding Expansion (For Quiz Funnels)
Using the `mascot-designer` playbook, Witny was extended for the Quiz Funnel:
- `greeting`: Witny waves a wing at the user on the Splash screen.
- `thinking`: Witny taps their head with a wing when asking "What's your current weight?"
- `empathizing`: Witny looks down with drooping eyes when the user selects "I feel tired often" (Normalization).
- `analyzing`: Witny wears tiny pixel glasses and reads a book during the "Hold on, analyzing your profile..." Labor Illusion screen.

## 3. Integration Learnings

1. **Asset Management**: Pixel art creates many files. Grouping them into folders by state (e.g., `assets/mascot/witny/idle/`) or exporting as a unified `.aseprite` JSON spritesheet was critical for developer handoff.
2. **Animation Over Static**: Because it's pixel art, a static image feels "dead". Even the `idle` state needed a 2-frame breathing animation to maintain the "Virtual Coach" presence.
3. **UI Overlay**: Witny was designed with a transparent background so it could float above the standard iOS/Android native UI, breaking the grid and making the app feel alive.
