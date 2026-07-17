---
name: clarify-gate
description: >-
  Gate 0.5 — Requirement Clarification. Trước khi code feature MODERATE/COMPLEX:
  tự tra evidence chốt điểm rõ, rồi hỏi user 0-5 câu trúng đích (gộp 1 lượt, có
  default). Disambiguation feature ĐÃ biết cần làm — KHÁC brainstorm-agent (ideation).
version: 1.0.0
trigger: conditional
activation_keywords:
  - "MODERATE"
  - "COMPLEX"
  - "feature mới"
  - "implement"
  - "build feature"
priority: high
---

<!-- ⚠️ GATE 0.5 — Clarify ONLY. Không code trong gate này. Output = Assumptions Ledger đã chốt. -->

# 🎯 Clarify Gate — Requirement Disambiguation

> **Purpose:** Loại bỏ giả định sai TRƯỚC khi tốn công code, bằng cách tự tra được thì tự chốt, còn lại hỏi user 0-5 câu trúng đích.

## ⚠️ SCOPE

| LÀM | KHÔNG làm |
|-----|-----------|
| Tra evidence tự chốt điểm mơ hồ | Code / sửa file |
| Hỏi 0-5 câu gộp 1 lượt, có default | Hỏi 1-câu/lần kiểu Socratic (→ brainstorm-agent) |
| Fold đáp án vào BRIEF/mini-plan | Khai phá ý tưởng mơ hồ (→ brainstorm-agent) |
| Chốt Assumptions Ledger | Tạo artifact mới thừa thãi |

## 🚦 KÍCH HOẠT

```yaml
run_when:    orchestrator triage = MODERATE hoặc COMPLEX
skip_when:
  - triage = TRIVIAL                       # code thẳng
  - Câu hỏi-đáp / giải thích (không code)
  - User nói rõ "cứ làm đi" / "skip hỏi"
  - .kiro/specs/ có requirements.md đầy đủ  # đã có spec → không hỏi lại
  - Feature đã có BRIEF.md/design.md chốt   # đã qua Gate 1/2
escalate_to_brainstorm_when: >
  Sau Pha A vẫn còn >5 điểm mơ hồ HOẶC bản thân "làm gì" còn chưa rõ
  → đây là ideation, không phải disambiguation → chuyển brainstorm-agent (Gate 1).
```

## 🧠 PROCESS (2 pha trong `<thinking>`, rồi mới hỏi)

### Pha A — Tự trả lời (Evidence > Assumptions)
Liệt kê MỌI điểm mơ hồ tiềm năng. Với từng điểm, thử tra theo thứ tự:
1. `CODEBASE.md` / `docs/steering/` — convention, tech stack, structure
2. GitNexus `query({search_query})` / `context({name})` — flow & symbol có sẵn
3. grep code + git history — pattern đã dùng trong repo
4. `.kiro/specs/` / BRIEF.md / design.md — spec đã chốt

➡️ **Tra được → tự chốt, KHÔNG đưa vào danh sách hỏi.** Ghi vào Assumptions Ledger dạng *"Chốt từ evidence: [X] vì [nguồn]"*.

### Pha B — Lọc câu hỏi qua Rubric 4-Test
Điểm mơ hồ còn lại sau Pha A phải qua **cả 4** test, trượt bất kỳ → loại:

| Test | Câu hỏi tự vấn |
|------|----------------|
| 1. Decision-relevant | Có ≥2 đáp án hợp lý dẫn tới **code khác nhau** không? Không → bỏ. |
| 2. Không tự tra được | Chắc chắn Pha A không trả lời được? Tra được → về Pha A. |
| 3. Có default đề xuất | Mình đề xuất được 1 phương án "Recommended" hợp lý không? |
| 4. Trả lời 1 cụm từ | User gật/chọn nhanh được không? Mở lan man → gọt lại hoặc bỏ. |

### Pha C — Quyết định N câu (Adaptive 0-5)

| Số câu sống sót | Hành động |
|---|---|
| **0** | Không hỏi. In *"📌 Giả định: [X, Y]. Sai thì báo tôi ngay."* → code. |
| **1-2** | Gọi `AskUserQuestion` gộp, mỗi câu 1 option đánh **(Recommended)**. |
| **3-5** | Gọi `AskUserQuestion` gộp 1 lượt. Dư >5 → tự quyết phần ít rủi ro nhất, chỉ hỏi 5 đắt nhất. |
| **>5** | STOP. Đây là ideation → escalate `brainstorm-agent` (Gate 1). |

### 5 trục sinh câu hỏi (rank theo "sai giả định này tốn nhất")
1. **Scope / Non-goals** — làm gì, KHÔNG làm gì trong lần này
2. **Data / State model** — schema, nguồn dữ liệu, trạng thái
3. **UX / luồng chính** — hành vi mong đợi, happy path
4. **Tích hợp / ràng buộc** — API, thư viện, platform, dependency có sẵn
5. **Edge cases / lỗi** — offline, rỗng, quyền, giới hạn

## 📤 OUTPUT — Assumptions Ledger

Sau khi có đáp án (hoặc 0 câu), chốt 1 block gọn (fold vào BRIEF.md nếu qua Gate 1, hoặc mini-plan của `/create-feature`):

```markdown
## 🔒 Assumptions Ledger — [feature]
- ✅ Chốt từ evidence: [điểm] — [nguồn]
- ✅ Chốt từ user: [câu hỏi] → [đáp án]
- ⚠️ Giả định (chưa xác nhận, low-risk): [điểm] — sai thì báo
```

## 🔗 HANDOFF

```
Sau Assumptions Ledger:
→ COMPLEX  : tiếp Gate 1 (brainstorm nếu cần) / Gate 2 (spec-gate)
→ MODERATE : thẳng /create-feature hoặc /code với ledger làm ràng buộc
```

## 🚫 Anti-Patterns

```yaml
never_do:
  - Hỏi cái tự grep/CODEBASE.md tra được (question theater)
  - Hỏi câu không đổi cách code (trang trí)
  - Bắn >5 câu cùng lúc (→ escalate brainstorm thay vì spam)
  - Hỏi 1-câu/lần kiểu Socratic (đó là brainstorm-agent)
  - Code khi chưa chốt ledger
always_do:
  - Chạy Pha A tự tra TRƯỚC khi nghĩ đến việc hỏi
  - Mỗi câu hỏi kèm 1 default (Recommended)
  - Gộp mọi câu vào 1 lượt AskUserQuestion
  - Chốt Assumptions Ledger trước khi handoff
```

## 🧩 Ranh giới với brainstorm-agent

| | **clarify-gate** (Gate 0.5) | **brainstorm-agent** (Gate 1) |
|---|---|---|
| Dùng khi | Đã biết *làm gì*, chốt *làm thế nào* | Ý tưởng mơ hồ, cần khai phá |
| Nhịp | Batch 0-5, nhanh, có default | 1 câu/lần, Socratic, dài |
| Output | Assumptions Ledger → code | BRIEF.md |
| Escalate | >5 điểm mơ hồ → chuyển sang → | ← nhận khi cần ideate |

---

*clarify-gate v1.0.0 — Gate 0.5 Requirement Disambiguation*
