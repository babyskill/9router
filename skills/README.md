# 🧠 NeuralMemory Skill Pack

> Recall Through Activation, Not Search.

NeuralMemory là bộ nhớ sinh học cho AI — không tìm kiếm, mà **kích hoạt liên tưởng**
qua mạng neuron. Skill pack này tích hợp NeuralMemory engine vào AWK framework.

---

## Why NeuralMemory vs RAG?

| Aspect | RAG / Vector Search | NeuralMemory |
|--------|---------------------|--------------|
| **Model** | Search engine | Human brain |
| **Query** | "Find similar text" | "Recall through activation" |
| **Relationships** | None (just similarity) | Explicit: `CAUSED_BY`, `LEADS_TO`, `DISCUSSED` |
| **Time awareness** | None | Temporal topology built-in |
| **Causality** | None | "Why?" and "When?" questions |
| **Forgetting** | Never (stale data) | Natural decay + priority |

---

## Install

Các NeuralMemory skills được cài đặt và kích hoạt mặc định trong runtime:
- `nm-memory-sync` — Drop-in upgrade cho ambient memory-sync
- `nm-memory-intake` — Structured memory creation từ notes
- `nm-memory-audit` — 6-dimension quality review
- `nm-memory-evolution` — Evidence-based memory optimization

---

## Prerequisites

```bash
# 1. Install NeuralMemory Python package
pip install neural-memory

# 2. Configure MCP server in your AI tool
# Add to MCP config:
# { "mcpServers": { "neural-memory": { "command": "nmem", "args": ["server"] } } }

# 3. Initialize a brain
nmem init
```

---

## 🌐 Default 9router Capabilities (Upstream)

| Capability | Copy link below and paste to your AI |
|---|---|
| **Entry / Setup** (start here) | https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router/SKILL.md |
| Chat / code-gen | https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router-chat/SKILL.md |
| Image generation | https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router-image/SKILL.md |
| Video generation (xAI Grok Imagine) | https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router-video/SKILL.md |
| Text-to-speech | https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router-tts/SKILL.md |
| Speech-to-text | https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router-stt/SKILL.md |
| Embeddings | https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router-embeddings/SKILL.md |
| Web search | https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router-web-search/SKILL.md |
| Web fetch (URL → markdown) | https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router-web-fetch/SKILL.md |

## Skills (NeuralMemory Custom)

### `nm-memory-sync` (Core)
**Replaces:** `memory-sync` / `ambient-brain`  
**Trigger:** Auto-activate on session start, debug, new task, errors  
**Enhancement:** Uses NeuralMemory's associative graph instead of flat-file keyword matching

```
OLD: "keyword overlap > 2" → fuzzy recall  
NEW: spreading activation → associative reflex recall
```

### `nm-memory-intake`
**Trigger:** `/memory-intake "messy notes..."` hoặc sau planning sessions  
**Role:** Memory Intake Specialist  
**Process:** Triage → Clarify → Enrich → Deduplicate → Batch Store → Report

### `nm-memory-audit`
**Trigger:** `/memory-audit` hoặc tuần một lần  
**Role:** Memory Quality Inspector  
**Dimensions:** Purity · Freshness · Coverage · Clarity · Relevance · Structure

### `nm-memory-evolution`
**Trigger:** `/memory-evolution "focus area"` hoặc sau sprint  
**Role:** Memory Evolution Strategist  
**Process:** Analysis → Opportunities → Consolidate/Enrich/Prune → Normalize

---

## Typical Usage

```
# Sau planning session
/memory-intake "Meeting notes: chose Redis for cache, Bob handles migration, deadline Friday"

# Weekly cleanup  
/memory-audit

# Sau sprint
/memory-evolution "focus on auth topic"

# AI auto-sync runs on every session start (nm-memory-sync)
```

---

## Workflows

| Command | Description |
|---------|-------------|
| `/nm-recall` | Query NeuralMemory với associative recall |
| `/nm-snapshot` | Export current brain state to JSON |
| `/nm-import` | Import project decisions/errors into brain |

---

*NeuralMemory Skill Pack for AWK v7.0 · Created by Kien AI*
