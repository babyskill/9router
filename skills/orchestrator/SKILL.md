---
name: orchestrator
description: Intelligent dispatcher — analyzes context and delegates to the right skill or workflow
---

# Orchestrator Skill

## Purpose
Route user requests to the correct workflow or skill based on context analysis.

## Routing Logic

### 1. Slash Command Detection
```
User input starts with `/` → Load workflow file directly
  /plan     → workflows/lifecycle/plan.md
  /code     → workflows/lifecycle/code.md
  /debug    → workflows/lifecycle/debug.md
  ...etc (see GEMINI.md § 2)
```

### 2. Intent Detection (No slash command)
```yaml
code_intent:
  keywords: ["implement", "build", "create", "add", "code", "fix", "viết", "tạo"]
  action: Suggest `/code` or `/codeExpert`

debug_intent:
  keywords: ["error", "bug", "crash", "fix", "lỗi", "sửa", "fail"]
  action: Suggest `/debug` or `/debugExpert`

plan_intent:
  keywords: ["plan", "design", "architect", "how to", "strategy", "thiết kế"]
  action: Suggest `/plan` or `/planExpert`

context_intent:
  keywords: ["remember", "save", "continue", "where was I", "nhớ", "tiếp"]
  action: Suggest `/recap` or `/save-brain`

ads_intent:
  keywords: ["ads", "campaign", "CPI", "ROAS", "quảng cáo"]
  action: Suggest `/ads-audit` or `/adsExpert`
```

### 3. Fallback
```
No match → Ask clarifying question (max 2 times)
Still unclear → Suggest `/help`
```

## Planning & Delegation Mapping

Khi thực hiện lập kế hoạch (`/plan` hoặc `implementation_plan.md` + `task.md`), Orchestrator bắt buộc phải phân rã công việc và tự động gán runner thích hợp cho từng task trong `task.md` theo định dạng: `- [ ] (runner) [Title]: Description | Files: file1,file2 | After: index1`

Quy tắc ánh xạ runner và lệnh gọi CLI được quản lý động thông qua `model-registry.mjs`. Nhãn runner được gán tự động resolve thành canonical model ID, và hệ thống tự động build CLI command & tham số động dựa trên profile cấu hình trong registry:
- `(qwen)` / `(deepseek)`: Sửa đổi logic lập trình thuần túy, backend, database, thuật toán (Resolve sang `qwen` hoặc `deepseek`).
- `(codex)`: Giao diện UI, layout, styling, assets, assets generation (Resolve sang `codex`).
- `(spark)`: Tác vụ code nhẹ, cục bộ, yêu cầu tốc độ nhanh và tối ưu chi phí (Resolve sang `gpt-5.3-codex-spark`).
- `(claude)` / `(fable5)` hoặc `(codex)` / `(gpt-5.6-sol)`: Logic phức tạp đa lớp, thiết kế kiến trúc hệ thống, lý luận sâu (Resolve sang `fable` hoặc `gpt-5.6-sol`).
- `(agy)` / `(flash)` hoặc `(research)`: Phân tích codebase, chẩn đoán lỗi, đọc tài liệu, chạy test/build và xác thực (Resolve sang `gemini-3.5-flash`).
- `(critic)` / `(fable5)` / `(gpt-5.6-sol)`: Audit chất lượng code, bảo mật, edge cases và duyệt/phê duyệt kết quả (Resolve sang `fable` hoặc `gpt-5.6-sol`).

## Auto-Activation
This skill is always active. It runs as the first layer before any other processing.
