---
name: ios-visual-qa-strategist
description: Plan and execute iOS app QA with adaptive visual reasoning and minimal screenshots. Use when Codex needs to test an iOS, Swift, SwiftUI, UIKit, Xcode, or App Store build by inspecting screenshots, simulator/device state, accessibility output, logs, Maestro/XCTest flows, or user-provided screen images; especially when the goal is to infer the highest-value test path while reducing redundant screenshot capture.
---

# iOS Visual QA Strategist

Use this skill to act as a QA strategist that sees the app like a user, reasons from available screen evidence, and captures only the screenshots needed to prove meaningful UI state.

## Core Principle

Prefer cheap evidence before visual evidence:

1. Read specs, tasks, source, route definitions, accessibility identifiers, and known flows.
2. Use accessibility tree, test logs, console logs, and deterministic assertions to navigate.
3. Capture screenshots only at high-value visual checkpoints.
4. Let each screenshot answer multiple assertions.
5. State confidence honestly when a flow was inferred rather than fully observed.

Do not treat screenshots as the only source of truth. Screenshots are strong for layout, content, and visible state; they are weak for persistence, network correctness, analytics, hidden navigation state, and business logic.

## Workflow

### 1. Establish Test Context

Identify:

- app target, scheme, simulator/device, OS version, and launch method
- feature under test and expected user outcome
- available automation tools: Maestro, XCTest, simctl, accessibility inspector, app logs, existing test files
- visual artifacts already provided by the user or stored in `docs/design/`, `docs/screenshots/`, `.kiro/specs/`, or test output folders

If this is an AWKit-managed project, respect its build/test wrapper rules. Do not bypass project automation by calling native build commands when the project requires a wrapper.

### 2. Build a Screen Model

Before interacting heavily, infer:

- entry points and navigation graph
- critical flows and the shortest representative path through them
- states that need visual proof: initial, loading, populated, empty, error, disabled, modal, keyboard, permission, and destructive-confirmation
- likely layout risks: text overflow, clipped controls, hidden safe-area content, keyboard overlap, dynamic type, localization, long names, and dark mode

For unfamiliar codebases, search for accessibility identifiers, screen names, route names, SwiftUI `View` types, UIKit controllers, and existing UI tests.

### 3. Write a Minimal-Capture Test Plan

Create a concise test plan with:

- primary user flow
- secondary/risk flows
- evidence type for each step: `accessibility`, `log`, `assertion`, `screenshot`, or `user-provided-image`
- screenshot budget and the reason each screenshot is worth taking
- stop conditions: what evidence is enough to pass, fail, or request clarification

Read `references/minimal-capture-policy.md` when deciding screenshot budget.

### 4. Execute Adaptively

For each step:

1. Predict expected screen state.
2. Navigate using the least expensive reliable signal.
3. Verify with accessibility/log/assertion first.
4. Capture a screenshot only when visual proof adds information.
5. Inspect the screenshot for multiple checks before taking another.
6. If the screenshot contradicts the predicted state, revise the test plan instead of continuing blindly.

Read `references/visual-reasoning-heuristics.md` when analyzing screenshots.
Read `references/ios-tool-selection.md` when choosing between Maestro, XCTest, simctl, and manual simulator interaction.

### 5. Report Findings

Always report:

- flows tested and flows intentionally skipped
- screenshot count and why each screenshot was necessary
- pass/fail findings with evidence
- visual issues, functional issues, and uncertainty separated
- recommended next test with the highest information gain

Use clear confidence labels:

- `High`: observed directly with screenshot or deterministic assertion
- `Medium`: verified through accessibility/logs and inferred visual continuity
- `Low`: inferred from code/spec only or blocked by missing evidence

## Screenshot Budget Rules

Default target for a single feature smoke pass:

- 1 entry screenshot
- 1 screenshot per distinct screen class
- 1 screenshot for the most important post-action state
- 1 failure screenshot when a bug is found

Add more only when the new capture can answer a question that the previous evidence cannot.

## Anti-Patterns

- Do not screenshot after every tap.
- Do not continue a scripted path after the visible state diverges from the plan.
- Do not mark visual QA complete using only logs or accessibility when the user asked for visual inspection.
- Do not ignore accessibility output; it often removes the need for another screenshot.
- Do not over-test low-risk decorative states while skipping checkout, auth, save, delete, onboarding, or permission flows.

## Resources

- `references/minimal-capture-policy.md` - screenshot budget and capture decision rules
- `references/visual-reasoning-heuristics.md` - what to inspect in screenshots
- `references/ios-tool-selection.md` - choosing iOS QA tools and evidence types
