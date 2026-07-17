# Visual Reasoning Heuristics

Inspect screenshots like a focused QA pass, not like a design critique.

## First Pass

Identify:

- current screen name or purpose
- visible user state: logged out, logged in, onboarding, loading, empty, error, populated, editing, confirming
- primary and secondary actions
- whether the screen matches the expected step in the test plan

## Layout Checks

Look for:

- clipped text, truncated labels, ellipses on critical content
- overlapping views, stacked buttons, hidden controls
- safe-area issues at top, bottom, keyboard, Dynamic Island, notch, and home indicator
- scrollability when content exceeds viewport
- tap targets that appear too small or crowded
- modal/sheet height problems
- keyboard covering input or submit buttons

## Content Checks

Look for:

- placeholder content leaking into production flows
- stale loading indicators
- empty state copy that does not match the action available
- inconsistent numbers, dates, currency, units, or language
- missing required data after save/import/sync
- destructive actions without clear confirmation

## State Inference

Use caution when inferring:

- success from a screen transition alone
- network completion from a spinner disappearing
- persistence from visible text before app relaunch
- analytics/tracking from UI state
- permission correctness from a prompt appearing

When inference is not enough, pair the screenshot with logs, accessibility assertions, app relaunch, or a deterministic test.

## Confidence Labels

- High: the screenshot directly shows the claim or a deterministic assertion confirms it.
- Medium: the visible state plus accessibility/log evidence supports the claim.
- Low: the claim depends on code/spec inference without direct observation.
