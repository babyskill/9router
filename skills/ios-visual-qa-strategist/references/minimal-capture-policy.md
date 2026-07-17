# Minimal Capture Policy

Use screenshots as expensive evidence. Every screenshot must have a reason before it is taken.

## Capture Decision

Take a screenshot when at least one condition is true:

- It is the first visual observation of the feature.
- A new screen class appears.
- The test reaches a visually important state: loaded data, empty state, error state, disabled state, destructive confirmation, permission prompt, modal, sheet, keyboard, or toast.
- Accessibility/log evidence confirms behavior but cannot prove layout or visible content.
- A bug is suspected and the screenshot will preserve evidence.
- The user explicitly asked for visual proof.

Skip a screenshot when:

- The accessibility tree already proves the expected state and no layout risk changed.
- The action only toggled hidden internal state.
- The next step will immediately produce a more informative screen.
- A previous screenshot of the same screen state already proves the assertion.

## Budget Heuristics

For one focused feature:

- 2-4 screenshots is usually enough for smoke QA.
- 4-7 screenshots is reasonable for a multi-screen critical flow.
- More than 7 screenshots needs a clear reason, such as visual regression, localization, dynamic type, dark mode, or a bug investigation.

For broad app exploration:

- Capture one screenshot per major screen category.
- Prefer a contact sheet or grouped artifacts if many screens must be compared.
- Do not exhaustively capture every tab, modal, or variant unless the task is specifically visual inventory.

## High-Information Captures

Prefer screenshots that prove several things at once:

- navigation arrived at the right screen
- important content is visible
- primary action is reachable
- layout respects safe areas
- loading/empty/error state resolved correctly

If a screenshot only proves "the button was tapped", avoid it.

## Failure Captures

When a failure occurs:

1. Capture the failing visible state.
2. Save or summarize the relevant accessibility tree/log excerpt.
3. Note the exact prior action.
4. Stop or branch the test plan; do not keep executing stale assumptions.
