---
name: claude-cli-orchestrator
description: Guide and instructions for executing and orchestrating Claude Code CLI subprocesses.
---

# Claude CLI Orchestrator Instruction Guide

This skill coordinates how agents and runners execute the Claude Code CLI (`claude`) tool. Follow these instructions strictly:

## 1. Location & Execution
- **Do NOT use `npx`:** Running `npx @anthropic-ai/claude-code` downloads the package repeatedly, ignores global configuration, and is extremely slow.
- **Direct Command:** Always execute the `claude` binary. 
- **Path Resolution:** 
  - Standard path `claude` is automatically symlinked to `~/.local/bin/claude` during installation.
  - If a command-not-found error occurs, fallback to the absolute home path `/Users/trungkientn/.claude/local/claude` or call `findClaudePath()`.

## 2. Command Line Arguments & Model Choices
- **Model parameter flags:** You can use `-m` or `--model` followed by one of the accepted model choices.
- **Accepted Model Choices:** Only use `'sonnet'`, `'opus'`, or `'fable'` (do NOT use `'fable-5'` or full model names like `claude-3-5-sonnet` as they are unrecognized by this CLI and will cause model errors).
  - **Correct:** `claude -m sonnet`, `claude --model sonnet`, `claude -m opus`, `claude -m fable`
  - **Incorrect (Fails):** `claude --model claude-3-5-sonnet`, `claude --model fable-5`
- **Strict Planning Rule (Tuyệt đối KHÔNG dùng Sonnet cho lập kế hoạch):**
  - **CẤM** sử dụng hoặc tự ý chuyển sang model `'sonnet'` cho các nhiệm vụ lập kế hoạch (Architecture Planning, Blueprint Design, G2 Spec Gate).
  - **BẮT BUỘC** sử dụng các model có tư duy cao nhất là `'fable'` (ưu tiên) hoặc `'opus'` cho mọi tác vụ lập kế hoạch để đảm bảo chất lượng thiết kế.
- **Fast Execution & Stdin Redirection:** 
  - Always append `< /dev/null` to direct shell executions (or set standard input to `'ignore'` in Node spawns). If omitted, Claude Code will pause for 3 seconds printing: `Warning: no stdin data received in 3s`.
  - Batch execution template:
    `claude -m sonnet -p "Your prompt" --print --no-session-persistence --permission-mode bypassPermissions < /dev/null`

## 3. Environment & Token Management
- **OAuth Authentication:** The long-lived OAuth token `CLAUDE_CODE_OAUTH_TOKEN` is saved globally inside `~/.awkit/config.json`.
- **Environment Ingestion:** AWKit runners automatically read this file and populate `process.env.CLAUDE_CODE_OAUTH_TOKEN` when spawning. Do not prompt the user for it.
