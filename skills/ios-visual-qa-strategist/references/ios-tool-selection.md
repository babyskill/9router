# iOS Tool Selection

Choose the cheapest reliable tool for the assertion.

## Maestro

Use Maestro when:

- testing end-to-end user flows
- tapping visible text or accessibility identifiers
- capturing screenshots during flow checkpoints
- validating onboarding, auth, forms, tabs, sheets, and common navigation

Avoid Maestro as the only evidence for:

- low-level UIKit/SwiftUI component behavior
- hidden business logic
- persistence unless paired with relaunch or data checks

## XCTest / XCUITest

Use XCTest or XCUITest when:

- the repo already has UI tests
- deterministic assertions are more important than ad hoc exploration
- testing accessibility identifiers, navigation state, or repeated regression flows
- needing CI-ready tests after an exploratory bug is found

Prefer adding or updating tests only after the exploratory visual pass identifies stable assertions.

## simctl

Use `simctl` when:

- launching, terminating, or relaunching the app
- resetting permissions or app data
- recording screenshots or videos when project policy allows
- controlling simulator state in a repeatable way

Respect project wrappers and automation rules for build/test commands.

## Accessibility Tree

Use accessibility output when:

- checking whether a control exists, is enabled, or has expected text
- avoiding redundant screenshots after navigation
- confirming screen identity cheaply
- extracting labels from dense UIs

Accessibility does not prove layout quality. Capture a screenshot when visual arrangement matters.

## Logs

Use logs when:

- confirming network, persistence, analytics, or error conditions
- explaining why a visible state failed to update
- distinguishing UI bug from backend/data issue

Logs do not prove what the user saw. Pair them with screenshot evidence for user-facing failures.
