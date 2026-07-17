---
name: claude-planner
description: |
  Gate 2 planning delegate via Claude Code CLI.
  Handles preparation of context, calling the helper script, and graceful
  fallback to the local model if Claude CLI is unavailable.
metadata:
  stage: core
  version: "1.0"
  tags: [gate, planning, architecture, multi-model]
  requires: spec-gate
agent: Architect
trigger: conditional
invocation-type: auto
priority: 2
---

# Claude Planner Skill

## Purpose
Directs the AI agent to orchestrate the Gate 2 architecture/implementation planning by delegating it to Claude Fable 5 (via Claude CLI) or Codex GPT Sol (via Codex CLI), with a strict, graceful fallback logic between these two high-level reasoning models.

## Usage Protocol

### 1. Verify and Execute CLI Planning (Fable 5 / Sol Fallback)
When Gate 2 (Spec/Architecture Planning) triggers for MODERATE or COMPLEX tasks:
1. Prepare the planning prompt file at `brain/<projectId>/plan_prompt.md`.
2. Run the helper script `scripts/claude-plan.js` which automatically prioritizes Claude Fable 5, and falls back to Codex GPT Sol if Fable CLI is unavailable or fails:
   ```bash
   node scripts/claude-plan.js --prompt-file brain/<projectId>/plan_prompt.md --output brain/<projectId>/implementation_plan.md
   ```
3. If the script succeeds (Exit code `0`), read `brain/<projectId>/implementation_plan.md` to review the plan and present it to the user.

### 2. Graceful Local Fallback Protocol
If both reasoning CLIs fail (Exit code !== 0, e.g. missing CLI, or unauthenticated token):
1. **Do not crash or alert the user with command failures.**
2. Immediately fallback to generating the `implementation_plan.md` using the local active model in the IDE.
3. Follow the normal planning template from `templates/design-templates.md` and write it directly to `brain/<projectId>/implementation_plan.md`.

### 3. UI-Only / Styling Planning Bypass (Optimization)
If the task only impacts UI components, styling, or translations (e.g., React Native/React views, CSS/Style sheets, i18n translation maps) without changes to core APIs, databases, or state machine structures:
1. **Bypass the external CLI planning step entirely.** Do not run `scripts/claude-plan.js` to call expensive models (`fable`/`sol`).
2. Immediately generate the `implementation_plan.md` using the local active model in the IDE.
3. Present the plan to the user for approval as usual.

## Planning Prompt Guidelines
When writing `brain/<projectId>/plan_prompt.md`, ensure it contains:
1. Target architecture files.
2. The current `docs/specs/<feature>_spec.md` or `docs/BRIEF.md`.
3. Toàn bộ nội dung các file brainstorm/spec/review tạm đã thảo luận trong session (quét trong thư mục `brain/<projectId>/*_brainstorm.md`, `*_plan.md`, `*_review.md`, `*_analysis.md`).
4. Project info from `.project-identity`.
5. NeuralMemory relevant constraints.
6. Symphony tasks.
7. The target format instructions for `implementation_plan.md`.

## ⚙️ Configuration & Control Techniques

### 1. Check Runner Status
Verify if the Claude planner runner is enabled globally:
```bash
awkit config claude
```

### 2. Enable/Disable Runner
To temporarily disable Claude planner (forcing fallback to Gemini standard models) or enable it:
```bash
awkit config claude off
awkit config claude on
```

### 3. Check All Runners
```bash
awkit config runners
```

### 4. Active Routing & Fallback
If `claude` is disabled or not installed on the system, the pipeline automatically routes Gate 2 architect planning to **Gemini Flash** via `agy` CLI using `gemini-3.5-flash`.

