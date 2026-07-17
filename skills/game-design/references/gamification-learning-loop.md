---
name: gamification-learning-loop
description: Reference for designing Duolingo-like gamified learning, habit, wellness, quest, streak, pet, XP, and reward systems.
---

# Gamification Learning Loop

## Purpose

Use this reference when a non-game app needs game-like motivation while preserving the real user outcome. The main risk is "points on top" design: users chase XP while the product fails to build mastery, habit, or confidence.

## Core Loop Template

```text
Daily trigger
-> Tiny task selection
-> Focused action
-> Immediate correctness/quality feedback
-> Progress update
-> Reward or recovery
-> Next best action
```

The loop should take 1-3 minutes for a lightweight product and under 10 minutes for a full daily mission.

## Layered Progression

### Activity Progress

Purpose: reward showing up.

Examples:
- XP
- daily quest completion
- streak count
- weekly activity rings

Rules:
- Activity progress should be generous early.
- Do not present activity as skill mastery.
- Let users recover from missed days without feeling punished.

### Competence Progress

Purpose: prove the user is getting better.

Examples:
- mastery levels
- accuracy bands
- reduced hints
- harder task unlocks
- review interval expansion

Rules:
- Competence must depend on performance quality.
- Use reviews to protect memory and confidence.
- Show weak areas without shaming the user.

### Collection Progress

Purpose: express identity and investment.

Examples:
- pets
- cosmetics
- badges
- room/garden/map decorations
- story fragments

Rules:
- Collection should amplify motivation, not block the core action.
- Cosmetic rewards work best when tied to meaningful effort.
- Pets are strongest when they visualize care, continuity, and gentle accountability.

## Duolingo-Like Feature Patterns

### Streak

Use streaks to reward consistency.

Good:
- streak freeze
- make-up task
- "restart gently" flow
- milestone celebrations

Avoid:
- guilt-heavy copy
- all-or-nothing streak death
- blocking the user from practicing after a miss

### Hearts / Energy

Use only when mistakes need tension or pacing.

Good:
- errors cost hearts, practice restores hearts
- subscription removes friction but does not remove learning challenge
- low-skill users can recover through review

Avoid:
- paywalling genuine learning
- punishing experimentation
- making users afraid to try difficult content

### XP

Use XP for effort and session completion.

Good:
- predictable base XP
- small bonuses for accuracy, hard tasks, and streak
- anti-grind caps for trivial repeat tasks

Avoid:
- XP as the only success signal
- easy exploit loops
- XP inflation that makes progress meaningless

### Daily Quests

Use quests to vary behavior.

Good:
- complete 2 lessons
- review weak skill
- get 80% accuracy
- try one harder challenge

Avoid:
- quests that contradict the user's goal
- too many simultaneous quests
- quests that force long sessions in short-context apps

### Leagues

Use leagues for competitive users, not everyone.

Good:
- soft matching by activity level
- opt-out or low-pressure mode
- separate personal progress from leaderboard rank

Avoid:
- anxiety loops
- rewarding grind over mastery
- making rank loss feel like personal failure

### Pets and Companions

Use pets to embody progress and care.

Good:
- pet grows through consistent useful action
- pet reacts to milestones, not every tap
- cosmetics unlock through mastery or meaningful streaks
- pet helps recovery after missed days

Avoid:
- making the pet needy in a way that creates guilt
- adding pet stats that compete with core learning
- using placeholder assets in production UI

## Economy Design

Keep early economies simple:

| Currency | Earned By | Spent On | Risk |
|---|---|---|---|
| XP | action completion | rank/progress display | grind over mastery |
| Gems | milestones, quests | cosmetics, freezes, boosters | pay-to-skip learning |
| Hearts | mistakes/recovery | pacing retries | fear of failure |
| Tickets | events | optional challenges | calendar pressure |

Start with one soft currency and one progression metric. Add more only after the loop needs it.

## Difficulty and Recovery

Repeated failure is a design signal.

Track:
- consecutive failures
- accuracy drop
- time-to-complete spike
- rapid retries
- task abandonment
- hint usage

Respond with:
- easier review
- narrower choices
- stronger visual guidance
- extra example
- smaller goal
- temporary assist

Do not secretly make the product so easy that success loses meaning.

## Metrics

Use metrics by design question:

| Question | Metric |
|---|---|
| Do users understand first value? | first-session completion, time to first success |
| Do users return? | D1/D3/D7 retention, streak recovery |
| Is the task too hard? | fail streaks, hints, abandons |
| Is gamification distracting? | XP-heavy low-mastery behavior |
| Does mastery improve? | accuracy, spaced review success, level completion |
| Are users burning out? | session length spike, league churn, notification opt-outs |

## Review Checklist

- The core task is useful without rewards.
- Rewards point back to the real value.
- Mastery and activity are separate.
- Streaks have humane recovery.
- Economy has few currencies.
- Competitive pressure is optional or softened.
- Pets/cosmetics reinforce investment without guilt.
- Failure triggers help, not shame.
- The first session proves value quickly.
- Metrics can falsify the design.
