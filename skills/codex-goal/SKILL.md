---
name: codex-goal
description: >-
  Codex Goal Conductor — Centralized autonomous goal-execution loop.
  Orchestrates complex feature development by partitioning high-level goals
  into tasks and distributing them to Claude, Qwen, standard agents, and sub-agents.
metadata:
  stage: core
  version: "1.0"
  requires: codex (npm i -g @openai/codex)
  tags: [goal, conductor, orchestration, multi-agent, autonomous]
agent: Goal Conductor
trigger: command
invocation-type: manual
priority: 5
---

# 🎯 Codex Goal Conductor — Goal Execution Skill

> **Purpose:** Centralized orchestrator to pursue high-level development goals autonomously.
> **Principle:** Codex plans the tasks, registers them in Symphony, and delegates executions to other specialized agents.

---

## 🏗️ Execution Model

In Goal Mode, Codex acts as the **Goal Conductor**. It runs an autonomous loop:

```
                  ┌──────────────────────┐
                  │ User Goal Prompt     │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ Codex Conductor      │◄────────────────────────┐
                  └──────────┬───────────┘                         │
                             │ (Partitions & Delegates)            │
        ┌────────────────────┼────────────────────┐                │
        ▼                    ▼                    ▼                │
┌──────────────┐     ┌──────────────┐     ┌──────────────┐         │
│  Claude CLI  │     │   Qwen CLI   │     │ Codex Sub-   │         │
│ (Architect)  │     │  (Executor)  │     │   agents     │         │
└──────────────┘     └──────────────┘     └──────┬───────┘         │
                                                 │                 │
                                                 ▼ (Inspect/Review)│
                                          ┌──────────────┐         │
                                          │ standard     │         │
                                          │  verification│─────────┘
                                          └──────────────┘
```

---

## 📋 Operational Guidelines

## Goal Mode — Non-Interactive Delegation

While an active goal is running, the user goal is pre-approval for all routine actions required to
complete that goal within the workspace. Continue autonomously until the goal is complete, a
technical blocker cannot be resolved after the permitted retries, or a Hard Stop is reached.

- Do **not** ask for confirmation before reading or modifying files in the workspace, running
  tests/lint/build, or inspecting normal git state and diffs.
- Do **not** ask for confirmation before spawning, reusing, messaging, retrying, or falling back
  between approved sub-agents/runners.
- Treat task delegation and the transfer of a minimal, redacted context digest to a sub-agent as
  internal orchestration, not a user-facing approval event.
- Do not expose `.env` contents, credentials, tokens, or other secrets in delegated context.
- A native permission prompt during Goal Mode is a runner configuration failure. Record the
  blocker and continue with an available fallback runner when possible; do not interrupt the user
  for routine delegation.

### Hard Stops

Pause and request explicit user confirmation only for force-push, `git reset --hard`, recursive
deletion, unscoped database deletion, access to or sharing of credentials/secrets, writes outside
the workspace, push, publish, or production deployment. Destructive actions require the
Constitution's double-confirmation rule.

### 1. Goal Partitioning
- Upon receiving a goal, the Conductor MUST create a local session tracker at `codex-reports/goals/<goal_id>/state.json`.
- It must partition the goal into explicit, non-overlapping step tasks (following Symphony task schema).

### 2. Task Delegation Protocol
For each task, the Goal Conductor selects the optimal runner:
- **Claude (Architect):** Runs for PRD generation, architectural design, and planning checks.
  Command: `node scripts/claude-plan.js --prompt-file <prompt_file> --output <output_file>`
- **Qwen (Executor):** Runs for code implementation, refactoring, and file modifications.
  Command: `node scripts/qwen-exec.js --prompt-file <prompt_file> --output <output_file> --sandbox workspace-write`
- **Gemini / AGY (General):** Runs for light scripting, quick checks, and fallback execution.
  Command: `agy --model gemini-3.5-flash --print "<prompt>"`
- **Codex Sub-agents (Headless Experts):** Used for verification, reviews, and test generation.
  Command: `codex exec "<prompt>" -s workspace-write`

### 3. Sub-Agent Autonomy & Callback
- Codex sub-agents (e.g. `critic`, `tester`, `ios-visual-qa-strategist`) are instantiated to run independently.
- When running, these sub-agents may delegate sub-problems back to Claude, Qwen, or AGY by executing the respective wrapper CLI commands.
- Sub-agents report their outputs back to the Goal Conductor in standardized Markdown files in `codex-reports/goals/<goal_id>/`.

---

## 🚫 Safety & Mindful Rest Guards
- **destructive_actions:** If a proposed task involves destructive modifications (e.g., `rm -rf`, force push, database drop), the Conductor MUST pause and ask for explicit user confirmation.
- **loop_prevention:** If a single task fails or undergoes retry loops more than 3 times, the Conductor must pause, report the blocker details, and ask the user for guidance.
- **state_saves:** Save state changes to `codex-reports/goals/<goal_id>/state.json` at the end of every task execution.
