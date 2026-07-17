---
name: qwen-conductor
description: >-
  Cost-Efficient Execution Flow — Antigravity invokes Qwen CLI
  for boilerplate code generation, routine logic coding, and local code edits.
  Runs on local resources or cost-optimized API providers, saving premium API tokens.
metadata:
  stage: core
  version: "1.0"
  requires: qwen (/Users/trungkientn/.nvm/versions/node/v22.22.0/bin/qwen)
  tags: [conductor, qwen, cli, boilerplate, local, cost-optimized, execution]
agent: Executor
trigger: conditional
invocation-type: auto
priority: 4
---

# 🤖 Qwen Conductor Skill

> **Purpose:** Tự động gọi Qwen Coder CLI qua script wrapper `scripts/qwen-exec.js` khi cần sinh mã nguồn boilerplate, hàm hỗ trợ, hoặc các logic phổ thông.
> **Key Benefit:** Tận dụng mô hình nguồn mở tối ưu cho code (Qwen 2.5 Coder 32B/72B) chạy local/API giá rẻ ➔ Tiết kiệm ~85% chi phí so với gọi Claude cho toàn bộ task.

---

## 🎯 Trigger Conditions

Kích hoạt khi AWKit ở chế độ `cost-optimized` (mặc định) và nhận diện các tác vụ:

```yaml
auto_trigger:
  high_confidence:
    - Boilerplate code generation (new files, routine structures)
    - Simple function/utility implementation (<50 lines of code)
    - Code formatting, lint errors fixing
    - Local unit tests suite generation
    - Script helpers writing
  
  medium_confidence (confirm before running):
    - Refactoring local modules
    - Translation or migration of small packages
```

---

## 🔧 CLI Wrapper Invocation

Hàm execution của AWKit sẽ ủy quyền cho Qwen thông qua wrapper:

```bash
node scripts/qwen-exec.js \
  --prompt "<PROMPT>" \
  --sandbox read-only \
  --output "<OUTPUT_FILE>"
```

### Safety & Sandboxing Rules

```yaml
safety:
  - Luôn chạy Qwen dưới quyền sandbox `read-only` trừ khi có chỉ thị ghi file cụ thể.
  - Phục hồi an toàn (Fallback): Nếu Qwen CLI thoát với mã lỗi khác 0, tự động chuyển sang gọi Gemini CLI (agy) để hoàn thành task viết mã.
  - Sử dụng file input tạm để xử lý các prompt chứa chuỗi và nháy kép phức tạp, tránh lỗi parse shell command.
```

---

## 🔄 Integration Flow

```
1. AWKit nhận diện Gate 4 (Execution - Viết code) ở chế độ Cost-Optimized.
2. Gom specs từ docs/specs/ và implementation_plan.md làm context.
3. Chạy lệnh: run_command("node scripts/qwen-exec.js --prompt '...' --output '...'")
4. Qwen CLI xử lý và ghi code trực tiếp ra file đích.
5. Nếu Qwen lỗi ➔ tự động fallback sang agy (Gemini Flash) viết code.
6. Kết thúc ➔ afplay báo chuông hoàn thành cho User.
```

## ⚙️ Configuration & Control Techniques

### 1. Check Runner Status
Verify if the Qwen runner is enabled globally:
```bash
awkit config qwen
```

### 2. Enable/Disable Runner
To temporarily disable Qwen runner (forcing fallback to Gemini standard models) or enable it:
```bash
awkit config qwen off
awkit config qwen on
```

### 3. Check All Runners
```bash
awkit config runners
```

### 4. Active Routing & Fallback
If `qwen` is disabled or unavailable on the system, the pipeline automatically routes code generation tasks (Gate 4 execution) to **Gemini Flash** via `agy` CLI using `gemini-3.5-flash`.

