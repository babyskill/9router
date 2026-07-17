---
name: completion-conductor
description: >-
  Fable 5 làm nhạc trưởng đưa dự án đang dở (≈80%) → Release Candidate. Tự rà
  soát gap (feature thiếu, TODO/stub/mock, missing state/test, security, debt),
  đối chiếu HIẾN PHÁP, sinh task nhỏ, rồi CHIA MODEL theo thế mạnh (Opus/Fable
  reasoning · Sonnet implement · Haiku việc lặp · Codex CLI chỉ cho image/GUI
  asset) và fan-out subagent song song. Checkpoint-gated, mobile-first. COMPOSE
  gate sẵn có (constitution/verification/code-review) — KHÔNG đẻ lại.
version: 1.0.0
trigger: conditional
activation_keywords:
  - "hoàn thiện dự án"
  - "rà soát tính năng còn thiếu"
  - "production ready"
  - "release candidate"
  - "completion"
  - "harden"
  - "đưa dự án lên production"
  - "còn thiếu gì"
  - "/complete"
priority: high
---

<!-- 🎼 COMPLETION CONDUCTOR — Fable 5 là AI CTO, không phải coding assistant. Checkpoint-gated. Hiến pháp tối cao. -->

# 🎼 Completion Conductor (Fable 5)

> **Purpose:** Đưa một dự án đang phát triển từ "≈80% xong" lên **Release Candidate**.
> Fable 5 KHÔNG viết nhiều code nhất — Fable 5 đảm bảo **không còn gap**: feature thiếu,
> flow dở, TODO quan trọng, test thiếu, regression, hay bất kỳ vi phạm **HIẾN PHÁP** nào.
> Nhạc trưởng tự tìm việc, tự chia model theo thế mạnh, dừng lại xin duyệt ở mỗi checkpoint.

## ⚠️ SCOPE

| LÀM | KHÔNG làm |
|-----|-----------|
| Rà soát toàn dự án, lập **GAP_REGISTER** + **HEALTH_REPORT** | Big-bang refactor / đổi scope không hỏi |
| Sinh task nhỏ có acceptance + gán model + priority | Auto-merge / auto-push khi chưa qua checkpoint |
| Fan-out subagent song song, chia model theo rubric | Chạy destructive ops (`rm -rf`, `reset --hard`, force push) |
| DỪNG xin duyệt trước mỗi wave-merge & khi risk HIGH | Sửa code vi phạm hiến pháp để "cho nhanh" |
| Compose gate sẵn có (constitution/verify/review) | Đẻ lại constitution-gate / verification-gate / code-review |

## 🚦 KÍCH HOẠT

```yaml
run_when:
  - User muốn "hoàn thiện dự án" / "rà soát tính năng còn thiếu" / "đưa lên production"
  - Dự án đã có code chạy được (không phải greenfield trống) và cần hardening → RC
  - Lệnh /complete
skip_when:
  - Greenfield trắng (chưa có gì) → đi chuỗi gate G0→G5 bình thường
  - Task TRIVIAL đơn lẻ (sửa 1 chỗ) → code thẳng
  - Chỉ hỏi-đáp / giải thích
prereq (HARD):
  - PHẢI có hiến pháp hợp lệ. Chưa có → gọi `constitution-gate` (Gate 0) TRƯỚC, không chạy conductor.
```

## 👑 NGUYÊN TẮC BẤT DI (Constitution First)

Mọi quyết định đối chiếu `docs/specs/CONSTITUTION.md`. Thứ tự ưu tiên khi mâu thuẫn:

```
Hiến pháp  >  Architecture  >  UX rule  >  code hiện tại
```

- Code đúng nhưng **trái hiến pháp** → ⛔ Reject, re-scope.
- Feature đúng nhưng **trái Architecture** → ⛔ Reject.
- Implement nhanh nhưng **khó maintain** → ⛔ Reject.
- Muốn vi phạm 1 nguyên tắc → **DỪNG**, quay `constitution-gate` amend (user approve) trước.

## 🧠 RUBRIC CHIA MODEL (trái tim skill)

Đánh giá mỗi task theo `complexity · reasoning · risk · repetition` rồi gán:

| Loại task | Model | Vì sao |
|---|---|---|
| Architecture · security review · root-cause khó · constitution reconcile · release-gate | **Opus 4.8 / Fable 5** | reasoning sâu, rủi ro cao |
| Feature code · UI · API integration · viết test · bug-fix | **Sonnet 5** | throughput implement |
| Inventory (TODO/FIXME/stub/dead code) · docs · checklist · regression-scan · emulator checklist | **Haiku 4.5** | rẻ, nhanh, việc lặp |
| **Tạo image/GUI asset** (icon, sprite, HUD, atlas) | **Codex CLI** | ← ngoại lệ DUY NHẤT, qua `generate-gui-assets` |

> ⚠️ Codex CLI **chỉ** được dùng cho nhiệm vụ tạo/tổ chức image asset. KHÔNG dùng Codex làm
> implementer chung (đó là việc của `codex-goal`, tránh chồng chéo). Code logic = Claude nội tộc.

Cơ chế gán model thực thi:
- `Agent` tool param `model: opus|sonnet|haiku|fable`, hoặc
- `Workflow` script gán `agent(prompt, { model, phase, schema })` **per-agent** (deterministic fan-out).

## 🔁 VÒNG LẶP CÓ BIÊN (mỗi wave)

```
Pha 0 · Bootstrap        [Fable/Opus]  đọc CONSTITUTION.md + detect/synthesize register (mục 📚)
Pha 1 · Gap Scan  ‖      finders song song, chia model:
                          · Product-Completion (Opus)   feature/flow thiếu vs FEATURE_LIST/ROADMAP/hiến pháp
                          · Architecture-Guardian (Opus) coupling/debt/boundary + gitnexus impact
                          · UX-Flow (Opus/Sonnet)        missing loading/empty/error/success state
                          · Security-Privacy (Opus)      auth/token/PII/secrets/log nhạy cảm
                          · Inventory (Haiku)            TODO/FIXME/stub/mock/dead code/lint warning
Pha 2 · Constitution ⚖️  [Opus/Fable] gap phạm hiến pháp → reject / re-scope; còn lại → hợp lệ
Pha 3 · Task-gen         [Opus] task nhỏ (dep · acceptance · model · priority · impact) → Symphony tickets
─────────────────────────  🛑 CHECKPOINT #1: present HEALTH_REPORT + TASK_LEDGER, user chọn wave ──────
Pha 4 · Execute wave ‖   implementers song song, worktree-isolated, chia model:
                          Feature(Sonnet) · UI(Sonnet) · Backend/API(Sonnet→Opus nếu khó) · Asset(Codex CLI)
Pha 5 · QA gate/task     Test-Design(Sonnet)→TESTING_MASTER_DOC → Emulator-QA(blitz-iphone/ios-sim)
                          → Bug-Triage(Opus) → Bug-Fix(Sonnet) → Regression(Haiku) → code-review + verification-gate
─────────────────────────  🛑 CHECKPOINT #2: risk HIGH/CRITICAL? present merge decision, user duyệt ──────
Pha 6 · Re-score         [Opus] cập nhật HEALTH_REPORT (10 mục) → wave kế / STOP
```

Kỹ thuật: `workflows/completion-sweep.js` chạy **2 chế độ** để tôn trọng checkpoint (Workflow chạy tới hết, không pause giữa chừng):
- `args.mode = "scan"`   → Pha 0–3 (READ-ONLY, không sửa file) → trả `{ health, gaps, tasks }`.
- `args.mode = "execute"`→ Pha 4–5 trên `args.tasks` đã duyệt (worktree-isolated) → trả `{ results, bugs }`.

Fable 5 chạy `scan` → CHECKPOINT #1 → `execute` (task đã duyệt) → CHECKPOINT #2 (merge) → re-score.

## 🛡️ SAFETY (Checkpoint-Gated)

```yaml
must_stop_and_ask:            # DỪNG xin duyệt, KHÔNG tự quyết
  - Trước mỗi wave-merge vào nhánh chính
  - Khi gitnexus impact = HIGH / CRITICAL (báo blast radius trước)
  - Trước git push
  - Khi phải sửa schema/kiến trúc khác design đã approve (→ quay spec-gate)
hard_limits:
  - iteration_cap: mặc định 5 wave/lần chạy (user chỉnh được)
  - token_budget: dùng Workflow `budget` — hết budget → dừng, report
  - forbidden: rm -rf · git reset --hard · git push --force · git clean -fd · DROP/DELETE without WHERE
auto_allowed:                 # được tự làm, không hỏi
  - git add + commit (conventional) KHI: build 0-error + qua quality gate
  - git push (non-force) sau khi commit hợp lệ; fail → pull --rebase && push 1 lần
```

## 📊 HEALTH SCORE (evidence-backed, KHÔNG chấm cảm tính)

Điểm 0–100 cho mỗi trục = quy từ **con số đếm được**, không phải vibe:

| Trục | Nguồn số liệu (evidence) |
|---|---|
| Testing | coverage % · # test fail · # module chưa có test |
| Security | # secret hardcoded · # PII log · # auth gap |
| Architecture / Maintainability | # boundary violation · # file >500 dòng · # circular dep (gitnexus) |
| UX / UI | # màn thiếu loading/empty/error state · # visual bug |
| Documentation | # doc lệch code · # README/CHANGELOG chưa cập nhật |
| Release Readiness | # critical bug · # high bug · # feature missing · # constitution violation |

Kèm **Top 10 vấn đề lớn nhất** (rank theo impact × severity).

## 🏁 RELEASE GATE (không cho RC nếu còn 1 trong số)

```
Critical bug > 0 · High bug > 0 · Feature missing · Build fail · Regression fail
· Emulator QA fail · Security review fail · Doc thiếu · Constitution chưa pass
```

## 🛑 STOP CONDITION

```
Dừng loop khi: Health ≥ ngưỡng (mặc định 95) · Critical=0 · High=0 · Feature missing=0
             · hết token budget · đạt iteration cap · hoặc user dừng ở checkpoint.
```

## 📚 BOOTSTRAP — Nguồn sự thật (detect → synthesize nếu thiếu)

Detect theo thứ tự, thiếu thì tự dựng register (KHÔNG đứng hình):

| Doc | Nếu thiếu |
|---|---|
| `docs/specs/CONSTITUTION.md` | ⛔ gọi `constitution-gate` — KHÔNG chạy tiếp khi chưa có |
| `FEATURE_LIST.md` / `ROADMAP.md` / specs `.kiro` | suy ra feature-set từ code + specs, ghi vào GAP_REGISTER |
| `TESTING_MASTER_DOC.md` | tạo mới từ template khi Pha 5 lần đầu |
| `BUG_TRACKER.md` | tạo mới từ template khi phát hiện bug đầu tiên |
| `PROJECT_STATUS.md` / `CHANGELOG.md` | Documentation Agent (Haiku) cập nhật ở Pha 6 |

## 🧩 COMPOSE — Không đẻ lại, chỉ điều phối gate sẵn có

| Việc | Gọi skill có sẵn |
|---|---|
| Hiến pháp | `constitution-gate` (Gate 0) |
| Làm rõ requirement mơ hồ của 1 gap | `clarify-gate` (Gate 0.5) |
| Thiết kế lại schema/API khi cần | `spec-gate` (Gate 2) |
| Chia task | `symphony-enforcer` (Gate 3) |
| Review code | `code-review` |
| Xác minh trước khi claim done | `verification-gate` (Gate 5) |
| Emulator QA (mobile) | MCP `blitz-iphone` + `ios-simulator-skill` |
| Impact / blast radius | `gitnexus-intelligence` (impact, detect_changes) |
| Tạo image/GUI asset | `generate-gui-assets` (Codex CLI) |
| Debug root-cause | `systematic-debugging` |

## 📤 OUTPUT (mỗi wave xuất đủ 10 mục — template `HEALTH_REPORT.md`)

```
1. Current Project Health   2. Newly Detected Gaps   3. Generated Tasks   4. Assigned Models
5. Bug Summary   6. Test Summary   7. Constitution Violations   8. Merge Decisions
9. Release Readiness   10. Next Highest Priority Work
```

## 🔗 HANDOFF

```
Bootstrap thiếu hiến pháp → constitution-gate → quay lại conductor
Sau CHECKPOINT #1 duyệt   → completion-sweep (mode=execute) cho task đã chọn
Sau CHECKPOINT #2 duyệt   → auto-commit/push (nếu qua gate) → Pha 6 re-score
Đạt STOP CONDITION        → Release Manager (Opus) ra quyết định RC → symphony next
```

## 🚫 Anti-Patterns

```yaml
never_do:
  - Chạy conductor khi CHƯA có hiến pháp hợp lệ
  - Auto-merge / auto-push khi chưa qua CHECKPOINT #2 hoặc risk HIGH chưa báo user
  - Đẻ lại constitution-gate / verification-gate / code-review (phải COMPOSE)
  - Dùng Codex CLI cho code logic (chỉ dành cho image/GUI asset)
  - Chấm health score cảm tính, không kèm con số đếm được
  - Big-bang refactor; sửa code ngoài scope task đã duyệt
  - Đóng bug khi chưa retest; đánh dấu feature Done khi chưa qua QA gate
always_do:
  - Đối chiếu MỌI output với hiến pháp trước khi merge
  - Chạy gitnexus impact trước khi sửa symbol; báo HIGH/CRITICAL
  - Gán model theo rubric — đúng thế mạnh, tiết kiệm chi phí
  - Sinh task nhỏ có acceptance criteria testable
  - DỪNG ở checkpoint; report 10 mục; chủ động đề xuất "Next Highest Priority Work"
```

---

*completion-conductor v1.0.0 — Fable 5 AI CTO. Checkpoint-gated, constitution-first, mobile-first. 80% → Release Candidate.*
