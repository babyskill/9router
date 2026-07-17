---
name: constitution-gate
description: >-
  Gate 0 — Project Constitution. TRƯỚC mọi task code MODERATE/COMPLEX: bắt buộc
  dự án phải có hiến pháp (CONSTITUTION.md) — CHỈ tập nguyên tắc bất biến. Chưa có
  → DỪNG, neo vào brainstorm/PRD đã có + tổng hợp tài liệu repo, hỏi user 0-5 câu
  về nguyên tắc → tạo hiến pháp, user approve. KHÁC clarify-gate (làm rõ 1 feature).
version: 2.0.0
trigger: conditional
activation_keywords:
  - "MODERATE"
  - "COMPLEX"
  - "implement"
  - "build feature"
  - "code"
  - "hiến pháp"
  - "constitution"
priority: highest
---

<!-- ⚠️ GATE 0 — Constitution ONLY. KHÔNG code, KHÔNG implementation_plan. Artifact DUY NHẤT = CONSTITUTION.md. -->

# 🏛️ Constitution Gate — Project Constitution (Gate 0)

> **Purpose:** Không một dòng code MODERATE/COMPLEX nào được viết khi dự án CHƯA có "hiến pháp" —
> tập **nguyên tắc bất biến** mà mọi spec/task/code về sau phải tuân theo.

## 🚫 HAI LỖI CHẾT NGƯỜI PHẢI TRÁNH (đọc TRƯỚC)

1. **KHÔNG coi đây là task code.** CẤM tạo `implementation_plan.md`, mục "Proposed Changes",
   "Verification Plan", hay bất kỳ code-planning nào. Lập hiến pháp không phải lập trình.
   Gọi thẳng gate này; **artifact DUY NHẤT = tài liệu hiến pháp `.md`**.
2. **KHÔNG trộn tầng.** Hiến pháp CHỈ chứa nguyên tắc bất biến. Config kỹ thuật, rule AI-agent,
   chi tiết feature → thuộc file khác (xem Bảng Phân Tầng). Hỏi/viết sai tầng = vi phạm gate.

## ⚠️ SCOPE

| LÀM | KHÔNG làm |
|-----|-----------|
| Kiểm tra hiến pháp có tồn tại & hợp lệ | Code / sửa feature / tạo implementation_plan |
| Neo vào brainstorm/PRD/BRIEF đã có | Bịa nguyên tắc / tự tra lại từ đầu khi đã có brainstorm |
| Hỏi user 0-5 câu về **nguyên tắc** (khi thiếu) | Hỏi config kỹ thuật / rule AI / chi tiết 1 feature |
| Tạo `CONSTITUTION.md`, xin user approve | Ép >7 nguyên tắc / nhồi tầng kỹ thuật vào hiến pháp |

## 🚦 KÍCH HOẠT

```yaml
run_when:  orchestrator triage = MODERATE hoặc COMPLEX  (chạy TRƯỚC clarify-gate / Gate 1)
skip_when:
  - triage = TRIVIAL                       # sửa nhỏ, code thẳng
  - Câu hỏi-đáp / giải thích (không code)
  - Đã tồn tại hiến pháp hợp lệ (xem Detect) # PASS thẳng, không hỏi lại
  - User nói rõ "bỏ hiến pháp" / "skip constitution"
```

## 🔍 DETECT — Hiến pháp đã tồn tại chưa?

Kiểm tra theo thứ tự, dừng ở file đầu tiên tìm thấy:

1. `docs/specs/CONSTITUTION.md`   ← vị trí chuẩn của dự án
2. `.specify/memory/constitution.md`  ← spec-kit style
3. `AGENTS.md` có mục "Core Principles" đã điền (không còn placeholder `{{...}}`)

```yaml
PASS (skip gate) khi: tìm thấy file + ≥3 nguyên tắc thật + không còn placeholder {{...}}
FAIL (run gate)  khi: không tìm thấy | chỉ có template rỗng | còn placeholder
STALE (cảnh báo) khi: có file nhưng nguyên tắc mâu thuẫn codebase/PRD hiện tại
                      → báo user, đề xuất amend, KHÔNG tự sửa.
```

## 🧩 BẢNG PHÂN TẦNG — cái gì thuộc hiến pháp, cái gì KHÔNG

> Dùng bảng này cho MỌI câu hỏi và MỌI dòng draft. Không thuộc cột trái → chỉ đường sang file đúng, KHÔNG hỏi ở gate này.

| ✅ VÀO hiến pháp (nguyên tắc bất biến) | ❌ RA khỏi hiến pháp → thuộc về |
|---|---|
| Giá trị / triết lý sản phẩm (VD: "không tạo dark pattern") | — |
| Ranh giới đạo đức / an toàn bất khả xâm phạm | — |
| Chuẩn chất lượng cấp dự án (VD: "logic nghiệp vụ phải có test") | — |
| Non-goals vĩnh viễn (dự án dứt khoát KHÔNG làm gì) | — |
| Stack/DB/thư viện/i18n/version cụ thể | → `docs/specs/TECH-SPEC.md` |
| Rule cho AI-agent (auto-commit, ponytail, GitNexus, build cmd) | → `AGENTS.md` / `GEMINI.md` |
| Hành vi/luồng/validation của MỘT feature | → `clarify-gate` (Gate 0.5) |
| Kế hoạch triển khai, task, timeline | → Symphony (Gate 3) |

## 🧠 PROCESS (khi FAIL)

### Pha A — Neo vào cái ĐÃ CÓ trước (Evidence > Assumptions)
**Nguồn 0 (ưu tiên tuyệt đối):** brainstorm/PRD/BRIEF đã chốt. Nếu user vừa brainstorm hiến pháp
→ trích nguyên tắc **verbatim** từ đó, KHÔNG tự nghĩ lại hướng khác ("không như đã brainstorm" = lỗi).

Sau đó bổ sung từ tài liệu repo (dùng `view_file`, KHÔNG grep blind):

| Nguồn | Rút ra (chỉ tầng nguyên tắc) |
|-------|------------------------------|
| Brainstorm/PRD/BRIEF/`docs/specs/*` | Nguyên tắc & giá trị đã cam kết |
| `README.md`, `docs/**` | Vision, ranh giới sản phẩm |
| `CODEBASE.md` / `.project-identity` | Chuẩn/convention cấp dự án (chỉ phần bất biến) |
| `AGENTS.md`/`CLAUDE.md` hiện có | Nguyên tắc governance (đừng chép rule AI vào — chỉ nguyên tắc) |

➡️ Rút được → **draft thẳng** dạng *"Chốt từ evidence: [nguyên tắc] — [nguồn]"*. Không hỏi lại.

### Pha B — Hỏi 0-5 câu, lọc qua Rubric 4-Test
Điểm còn thiếu phải qua **cả 4** test, trượt bất kỳ → loại (không hỏi):

| Test | Tự vấn |
|------|--------|
| 1. Đúng tầng | Có phải **nguyên tắc bất biến** không? (đối chiếu Bảng Phân Tầng). Nếu là tech/AI-rule/feature → ❌ loại, chỉ đường sang file đúng, KHÔNG hỏi. |
| 2. Không tự tra được | Brainstorm/PRD/repo thật sự không có? Có → dùng luôn. |
| 3. Có default đề xuất | Đề xuất được 1 phương án "Recommended" hợp lý không? |
| 4. Trả lời 1 cụm từ | User gật/chọn nhanh được không? |

```yaml
0 câu sống sót: evidence đủ → draft luôn, present cho user duyệt (không hỏi trước).
1-5 câu:        gọi AskUserQuestion GỘP 1 lượt, mỗi câu 1 option (Recommended) + default.
>5 điểm mơ hồ:  dự án chưa đủ chín → gợi ý brainstorm-agent (Gate 1) trước.
```

5 trục sinh câu hỏi (đều ở tầng nguyên tắc, rank theo "sai thì tốn nhất"):
1. **Giá trị / triết lý sản phẩm** — dự án đứng về điều gì? cấm điều gì?
2. **Chuẩn chất lượng** — mức test/review bất di bất dịch?
3. **Ranh giới đạo đức / an toàn** — dữ liệu/PII/quyền — lằn ranh không được vượt?
4. **Non-goals vĩnh viễn** — dứt khoát KHÔNG làm gì?
5. **Nguyên tắc kiến trúc** (chỉ mức bất biến, VD "offline-first") — KHÔNG hỏi stack cụ thể.

### Pha C — Draft + Ratify
1. Draft bản hiến pháp tạm thời dưới dạng artifact phản hồi (RequestFeedback: true) hoặc hiện nội dung nháp trong chat. CẤM tạo file vật lý `docs/specs/CONSTITUTION.md` trong workspace ở bước này.
2. Fill 3–7 nguyên tắc từ Pha A + B. Thay `{{PROJECT_NAME}}`, `{{DATE}}`, `{{USER}}`.
3. Present bản draft gọn: liệt kê nguyên tắc + nguồn mỗi cái + note "tech/AI-rule đã chuyển sang TECH-SPEC/AGENTS.md".
4. **User approve** → Tạo/ghi file `docs/specs/CONSTITUTION.md` vào workspace, set `Version: 1.0.0`, `Ratified: <date>` → hiến pháp thành source-of-truth.
5. Chưa approve → sửa bản draft theo phản hồi, KHÔNG tạo file workspace, KHÔNG chuyển gate tiếp theo, KHÔNG code.

## 📤 OUTPUT
`docs/specs/CONSTITUTION.md` đã ratified (v1.0.0) — CHỈ nguyên tắc. Không có implementation_plan. Dòng xác nhận:
> 🏛️ Hiến pháp v1.0.0 đã chốt — N nguyên tắc. Tech → TECH-SPEC, rule AI → AGENTS.md. Mọi gate sau tuân theo file này.

## 🔗 HANDOFF
```
Sau khi hiến pháp PASS:
→ MODERATE : tiếp Gate 0.5 (clarify-gate)
→ COMPLEX  : tiếp Gate 0.5 (clarify-gate) → Gate 1 (brainstorm-agent)
Mỗi gate sau đối chiếu CONSTITUTION.md; mâu thuẫn → sửa spec, không phá nguyên tắc.
```

## 🚫 Anti-Patterns
```yaml
never_do:
  - Tạo implementation_plan.md / "Proposed Changes" / "Verification Plan" cho việc lập hiến pháp
  - Code MODERATE/COMPLEX khi hiến pháp còn FAIL
  - Trộn tầng: nhét stack/i18n/DB/auto-commit/ponytail vào hiến pháp
  - Hỏi câu về tech-config / rule-AI / chi tiết feature ở gate này
  - Tự nghĩ hướng khác khi user đã brainstorm (phải neo verbatim)
  - Nhồi >7 nguyên tắc / tự sửa hiến pháp đang có mà không approve
always_do:
  - Neo vào brainstorm/PRD/BRIEF TRƯỚC mọi thứ khác
  - Chạy Bảng Phân Tầng cho mọi câu hỏi + mọi dòng draft
  - Mỗi nguyên tắc = 1 câu mệnh lệnh testable + có nguồn
  - Chỉ đường (không hỏi) khi gặp thứ thuộc TECH-SPEC/AGENTS.md/clarify-gate
  - Xin user approve trước khi ratify
```

## 🧩 Ranh giới với các gate khác

| | **constitution-gate** (G0) | **clarify-gate** (G0.5) | **brainstorm-agent** (G1) |
|---|---|---|---|
| Phạm vi | Nguyên tắc toàn dự án, vĩnh viễn | 1 feature, tạm thời | Ý tưởng cần khai phá |
| Output | `CONSTITUTION.md` (nguyên tắc) | Assumptions Ledger | BRIEF.md |
| Tần suất | 1 lần/dự án (amend khi cần) | Mỗi feature | Khi ý tưởng mơ hồ |

---

*constitution-gate v2.0.0 — Gate 0 (hard gate). Chỉ nguyên tắc bất biến, tách 3 tầng, không implementation_plan.*
