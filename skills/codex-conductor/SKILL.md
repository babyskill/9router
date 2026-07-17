---
name: codex-conductor
description: >-
  Three-Agent Flow — Antigravity proactively invokes Codex CLI (headless)
  for debugging, code review, logic verification, and plan auditing.
  Codex is READ-ONLY: it inspects and reports to .md files, never edits code.
metadata:
  stage: core
  version: "1.1"
  requires: codex (npm i -g @openai/codex)
  tags: [conductor, codex, debug, review, logic, verification, delegation]
agent: Inspector
trigger: conditional
invocation-type: auto
priority: 5
---

<!-- ⚠️ INSPECT ONLY — Codex TUYỆT ĐỐI KHÔNG sửa code. Output = .md reports. approval-mode suggest. -->

# 🔍 Codex Conductor — Router

> **Purpose:** Gọi Codex CLI qua terminal khi cần rà soát logic, debug, review code chuyên sâu.
> **Key:** Codex = Inspector (báo cáo .md). TUYỆT ĐỐI KHÔNG sửa code.

## 📋 Topic Index

| Topic | Khi nào load | File |
|-------|-------------|------|
| 6 prompt templates (bug, review, logic, test, plan, refactor) | Khi cần invoke Codex | `examples/prompt-templates.md` |

## ⚠️ Three-Agent Model

```
Antigravity (IDE) = Executor — code, implement, create
Gemini CLI        = Strategist — analysis, architecture, planning
Codex CLI         = Inspector — debug, review, verify, test
```

## 🔧 Prerequisites

```bash
which codex || command -v codex
# If not installed: npm i -g @openai/codex
```

## 🎯 Trigger Conditions

```yaml
auto_trigger:
  high: Bug report | Pre-commit review (>3 files) | Logic verification | Plan review | Refactor verification
  medium (confirm): Test generation | Security audit | Performance analysis
  never: Simple questions | UI-only changes | Docs edits
```

## 🔧 CLI Invocation

### Mode 1: Quick Analysis
```bash
cd <PROJECT_ROOT> && timeout 120 codex \
  "<PROMPT>. DO NOT edit any files." \
  --approval-mode suggest -q 2>/dev/null
```

### Mode 2: Deep Inspection
```bash
cd <PROJECT_ROOT> && timeout 180 codex exec \
  "<PROMPT>. DO NOT edit any files." \
  --json 2>/dev/null
```

### Safety Rules
- ALWAYS `--approval-mode suggest` (read-only)
- ALWAYS inject "DO NOT edit any files"
- Timeout: 120s quick, 180s deep
- CLI fails → fallback gracefully
- NEVER pass secrets in prompt

## 🔄 Integration Flow

```
1. Detect trigger → 2. Check codex installed
3. "🔍 Đang gọi Codex CLI [mục đích]..."
4. Build prompt → 5. Run command
6. Capture output → 7. Save to codex-reports/<type>-<date>.md
8. Summarize findings → 9. Act on findings
```

### Error Handling

| Event | Action |
|-------|--------|
| Success | Parse → save report → summarize → suggest fixes |
| Timeout | "⏳ Timed out (>120s)" → fallback Antigravity-only |
| Error | Check `codex --version` → suggest install |
| Not installed | Ask user to install |

## 📁 Report Structure

```
<project_root>/codex-reports/     # Gitignored recommended
├── bug-analysis-<date>.md
├── review-<date>.md
├── logic-analysis-<date>.md
└── ...
```

## 🚫 Anti-Patterns

```yaml
never_do:
  - Let Codex edit source code (EVER)
  - Use --approval-mode auto (ALWAYS suggest)
  - Pass API keys/tokens in prompts
  - Block without timeout
  - Call CLI >3 times per task

always_do:
  - Mention "🔍 Đang gọi Codex CLI..."
  - Include "DO NOT edit any files" in EVERY prompt
  - Save reports to codex-reports/
  - Fall back gracefully if unavailable
```

## 🧩 Relationships

```
Uses:      run_command (to invoke CLI)
Enhances:  /debug, /code, /refactor, /plan
Parallel:  gemini-conductor (different role, can coexist)
Independent of: NeuralMemory
```

## ⚙️ Configuration & Control Techniques

### 1. Check Runner Status
Verify if the Codex runner is enabled globally:
```bash
awkit config codex
```

### 2. Enable/Disable Runner
To temporarily disable Codex runner (forcing fallback to Gemini standard models) or enable it:
```bash
awkit config codex off
awkit config codex on
```

### 3. Check All Runners
```bash
awkit config runners
```

### 4. Active Routing & Fallback
If `codex` is disabled or unavailable on the system, the pipeline automatically routes UI design tasks (Gate 2.5 shell design) to **Gemini Flash** via `agy` CLI using `gemini-3.5-flash` and performs automatic HTML code extraction to save code to `assets/ui/demo_preview.html`.

---

*codex-conductor v1.2 — Modular Router Architecture*

