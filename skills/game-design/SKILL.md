---
name: game-design
description: Use when designing or reviewing games, gamified apps, Duolingo-like learning loops, quests, streaks, reward systems, difficulty curves, onboarding, player psychology, or progression economies.
---

# Game Design

## Overview

Use this skill to turn game or gamified-app ideas into durable player systems. It is strongest for Duolingo-like products where learning, habits, quests, streaks, pets, levels, currencies, badges, leagues, and daily missions must feel motivating without becoming noisy or manipulative.

This is a design skill, not an engine implementation skill. Pair it with `game-developer`, `expo-game-development`, `godot-game-development`, `generate-gui-assets`, or `hatch-pet` only after the design loop is clear.

## When to Use

Use for:
- New game or gamification concept discovery.
- Duolingo-like learning, fitness, wellness, language, habit, finance, or productivity apps.
- Quest, streak, XP, level, badge, pet, league, season pass, or reward economy design.
- Difficulty curve, onboarding, pacing, player error, puzzle, UI choice, and visual guidance reviews.
- Diagnosing "too hard", "boring", "players churn", "quests feel repetitive", "rewards feel cheap", or "gamification feels pasted on".

Do not use for:
- Pure engine architecture or frame-rate optimization. Use an implementation skill.
- Dark-pattern monetization or coercive retention. Keep player agency, clarity, and recovery paths.
- Adding points/badges before the core behavior is intrinsically useful.

## Core Rule

Design the behavior loop before designing rewards.

Every gamified feature must answer:
1. What real user action are we helping?
2. What immediate feedback makes that action understandable?
3. What long-term progression makes repeated action meaningful?
4. What recovery path prevents shame, burnout, or rage quit?
5. What evidence will prove the loop works?

## Gamification Architecture

For Duolingo-like products, define these layers in order:

| Layer | Question | Common Outputs |
|---|---|---|
| Core behavior | What useful action repeats daily? | lesson, workout, reflection, review, scan, check-in |
| Core loop | What happens in one repeatable session? | start task -> action -> feedback -> reward -> next prompt |
| Learning/progression | How does skill or mastery increase? | units, mastery levels, spaced repetition, unlocks |
| Motivation | Why return tomorrow? | streak, daily quest, pet care, leagues, visible progress |
| Economy | What is earned/spent and why? | XP, hearts, gems, energy, cosmetics, boosters |
| Safety | How do users recover? | streak freeze, easier review, hints, make-up quests |
| Evidence | How do we test it? | retention, completion, frustration, replay, abandon rates |

## Duolingo-Like Pattern

Use this pattern when the app is learning, habit, health, or self-improvement oriented:

1. Define one short session that can complete in 1-3 minutes.
2. Make success visible within 5 seconds of finishing.
3. Use streaks to reward consistency, not perfection.
4. Use XP for activity, but mastery/progress for competence.
5. Add quests that vary the route, not the purpose.
6. Let pets/cosmetics express investment without blocking learning.
7. Use leagues carefully; offer opt-out or soft grouping for anxious users.
8. Build recovery mechanics before punishment mechanics.
9. Tune difficulty with "slightly above current skill", not arbitrary scarcity.
10. Test whether users remember the real value, not only the reward.

## Design Workflow

### 1. Frame the Product

Capture:
- Target user and current pain.
- Desired repeated behavior.
- Current ability and motivation.
- Session length and real-world context.
- One sentence game promise: "This product helps users ___ by ___ every day."

### 2. Define Pillars

Choose 3 action-oriented pillars. Avoid theme-only pillars.

Good:
- Practice in tiny sessions.
- Recover from missed days.
- See visible mastery growth.

Weak:
- Cute world.
- RPG feel.
- Lots of badges.

### 3. Build the Core Loop

Write the loop as verbs:

```text
Prompt -> Choose task -> Act -> Get feedback -> Earn progress -> Prepare next action
```

If the loop is not useful without rewards, redesign it before adding rewards.

### 4. Design Progression

Separate:
- Activity progress: XP, daily quest, streak.
- Competence progress: mastery, level, lesson accuracy, reduced hints.
- Collection progress: pet, cosmetics, badges, story, decorations.

Do not let collection progress pretend to be competence.

### 5. Design Rewards and Punishments

Prefer:
- Positive feedback for effort.
- Clear mastery signals for skill.
- Gentle loss aversion with repair paths.
- Variable quests, not variable truth.

Avoid:
- Shame copy after missed days.
- Punishment that blocks the useful action.
- Random rewards that obscure learning.
- Too many currencies before users understand why they matter.

### 6. Tune Difficulty and Pacing

Use:
- `flow-state-design-framework.md` for challenge vs skill.
- `dynamic-difficulty-adjustment.md` for repeated failure.
- `doubling-halving-balance.md` for fast variable testing.
- `experience-pacing-structure.md` for attention windows.

### 7. Review UX and Psychology

Use:
- `hicks-law-decision-optimization.md` when menus or quests have too many choices.
- `fitts-law-ui-aiming.md` for touch targets and fast actions.
- `visual-player-guidance.md` for attention and affordance.
- `player-error-handling.md` for recoverable mistakes.
- `player-psychology-decisions.md` for risk/reward and bias.
- `fundamental-attribution-error-testing.md` when interpreting user complaints.

### 8. Test the Loop

Create pressure scenarios before implementation:
- New user completes first session without explanation.
- Returning user missed 2 days and tries to recover.
- Low-skill user fails 3 times.
- High-skill user completes too easily.
- User ignores rewards and tries to complete the real task.
- User chases rewards while avoiding the real task.

For each scenario, record expected behavior, failure signal, metric, and design response.

## Reference Routing

| Need | Load |
|---|---|
| End-to-end concept to iteration | `references/game-design-methodology.md` |
| Game pillars, 80/20, scope tradeoffs | `references/game-development-planning.md` |
| Duolingo-like loops and retention checklist | `references/gamification-learning-loop.md` |
| Flow and difficulty curves | `references/flow-state-design-framework.md` |
| Dynamic difficulty and frustration recovery | `references/dynamic-difficulty-adjustment.md` |
| Reward, punishment, streak, XP, economy | `references/reinforcement-feedback-systems.md` |
| Character/pet/stat progression | `references/character-optimization-design.md` |
| Quest, level, puzzle, challenge design | `references/game-competency-puzzle-design.md` |
| Pacing, attention, session length | `references/experience-pacing-structure.md` |
| UI choice overload | `references/hicks-law-decision-optimization.md` |
| Touch target and aiming ergonomics | `references/fitts-law-ui-aiming.md` |
| Visual affordance and guidance | `references/visual-player-guidance.md` |
| Player mistakes and recovery | `references/player-error-handling.md` |
| Player psychology and risk decisions | `references/player-psychology-decisions.md` |
| Testing and attribution bias | `references/game-prototyping-testing.md` and `references/fundamental-attribution-error-testing.md` |
| Theme/narrative cohesion | `references/synergy-thematic-design.md` and `references/environmental-storytelling-technique.md` |

## Output Formats

### Concept Brief

Return:
- Product promise.
- Target user and repeated behavior.
- 3 pillars.
- Core loop.
- Progression layers.
- Reward/economy sketch.
- Difficulty and recovery plan.
- MVP scope and rejected ideas.
- Test scenarios.

### Feature Review

Return:
- What user behavior the feature supports.
- Where it sits in the loop.
- Motivation impact.
- Competence impact.
- Economy impact.
- Risks and abuse cases.
- Metrics to validate.
- Recommendation: keep, simplify, redesign, or remove.

### Balance Pass

Return:
- Variables to test.
- Doubling/halving experiment.
- Expected player behavior changes.
- Failure thresholds.
- Safe adjustment range.
- Telemetry needed.

## Common Mistakes

- Adding XP before the core action is satisfying.
- Making streak loss too punitive.
- Using random rewards to hide weak content.
- Treating all users as competitive.
- Confusing completion with mastery.
- Adding pets/cosmetics without a meaningful investment loop.
- Overloading the home screen with quests, leagues, shop, battle pass, events, and popups.
- Assuming player failure is user incompetence before checking design clarity.

## Quality Bar

A strong game-design answer must be specific enough to implement, but not so detailed that it invents unnecessary systems. Prefer one coherent loop over five disconnected mechanics.
