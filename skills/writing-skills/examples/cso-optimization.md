# Antigravity Search Optimization (CSO)

**Critical for discovery:** Future Antigravity needs to FIND your skill.

## 1. Rich Description Field

**Purpose:** Antigravity reads description to decide which skills to load. Make it answer: "Should I read this skill right now?"

**Format:** Start with "Use when..." to focus on triggering conditions.

**CRITICAL: Description = When to Use, NOT What the Skill Does**

The description should ONLY describe triggering conditions. Do NOT summarize the skill's process/workflow.

**Why this matters:** Testing revealed that when a description summarizes the skill's workflow, Antigravity may follow the description instead of reading the full skill content. A description saying "code review between tasks" caused Antigravity to do ONE review, even though the skill's flowchart clearly showed TWO reviews.

```yaml
# ❌ BAD: Summarizes workflow
description: Use when executing plans - executes tasks sequentially with code review between tasks

# ✅ GOOD: Just triggering conditions
description: Use when executing implementation plans with independent tasks in the current session
```

**Content:**
- Use concrete triggers, symptoms, and situations
- Describe the _problem_ not _language-specific symptoms_
- Keep triggers technology-agnostic unless skill is technology-specific
- Write in third person
- **NEVER summarize the skill's process or workflow**

## 2. Keyword Coverage

Use words Antigravity would search for:
- Error messages: "Hook timed out", "ENOTEMPTY", "race condition"
- Symptoms: "flaky", "hanging", "zombie", "pollution"
- Synonyms: "timeout/hang/freeze", "cleanup/teardown/afterEach"
- Tools: Actual commands, library names, file types

## 3. Descriptive Naming

**Use active voice, verb-first:**
- ✅ `creating-skills` not `skill-creation`
- ✅ `condition-based-waiting` not `async-test-helpers`
- Gerunds (-ing) work well for processes

## 4. Token Efficiency (Critical)

**Target word counts:**
- getting-started workflows: <150 words each
- Frequently-loaded skills: <200 words total
- Other skills: <500 words

**Techniques:**
- Move details to tool help (`--help`)
- Use cross-references (not repeated instructions)
- Compress examples
- Eliminate redundancy

## 5. Cross-Referencing Other Skills

- ✅ `**Required skill:** test-driven-development`
- ✅ `See examples/tdd-for-skills.md`
- ❌ Hardcode platform-specific paths like `.agent/skills/...`
- ❌ Force-load with `@...` when a plain reference is enough

**Why no forced load:** it burns context before the agent knows whether the deeper file is actually needed.
