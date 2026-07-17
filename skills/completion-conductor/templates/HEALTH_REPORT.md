# 🩺 Project Health Report — {{PROJECT_NAME}}

> Wave `{{WAVE_NO}}` · {{DATE}} · Conductor: Fable 5 · Constitution: `docs/specs/CONSTITUTION.md`

## 1. Current Project Health

| Trục | Điểm /100 | Evidence (con số đếm được) |
|---|---|---|
| Testing | {{}} | coverage {{}}% · test fail {{}} · module chưa test {{}} |
| Security | {{}} | secret hardcoded {{}} · PII log {{}} · auth gap {{}} |
| Architecture / Maintainability | {{}} | boundary violation {{}} · file >500 dòng {{}} · circular dep {{}} |
| UX / UI | {{}} | màn thiếu state {{}} · visual bug {{}} |
| Documentation | {{}} | doc lệch code {{}} |
| Release Readiness | {{}} | critical {{}} · high {{}} · feature missing {{}} · constitution violation {{}} |
| **Overall** | **{{OVERALL}}/100** | ngưỡng RC = {{THRESHOLD}} |

## 2. Newly Detected Gaps
_Xem chi tiết trong `GAP_REGISTER.md`. Tóm tắt:_
- 🔴 Critical: {{}} · 🟠 High: {{}} · 🟡 Medium: {{}} · ⚪ Low: {{}}

## 3. Generated Tasks
_Xem `TASK_LEDGER.md`. {{N}} task ({{P0}} P0)._

## 4. Assigned Models
| Model | # task | Loại việc |
|---|---|---|
| Opus/Fable | {{}} | architecture · security · root-cause |
| Sonnet | {{}} | feature · ui · api · test · bugfix |
| Haiku | {{}} | inventory · docs · checklist |
| Codex CLI | {{}} | image/GUI asset |

## 5. Bug Summary
| BUG ID | Severity | Owner | Root Cause | Regression Risk | Fix | Retest |
|---|---|---|---|---|---|---|
| {{}} | {{}} | {{}} | {{}} | {{}} | {{}} | {{}} |

## 6. Test Summary
- Unit: {{pass}}/{{total}} · Integration: {{pass}}/{{total}} · Emulator: {{pass}}/{{total}}
- TESTING_MASTER_DOC cập nhật: {{yes/no}}

## 7. Constitution Violations
| Gap/Task | Nguyên tắc | Verdict | Xử lý |
|---|---|---|---|
| {{}} | {{}} | reject/rescope | {{}} |

## 8. Merge Decisions
| Task | QA | Review | gitnexus risk | Quyết định |
|---|---|---|---|---|
| {{}} | pass/fail | approve/changes | LOW/HIGH | merge/hold |

## 9. Release Readiness
```
Critical bug = {{}}   High bug = {{}}   Feature missing = {{}}
Build = {{}}   Regression = {{}}   Emulator = {{}}   Security = {{}}   Constitution = {{}}
→ RELEASE READY: {{TRUE/FALSE}}
```

## 10. Next Highest Priority Work
1. {{}}
2. {{}}
3. {{}}

---
_🛑 Checkpoint: đang chờ user duyệt wave kế / merge. Fable 5 KHÔNG tự merge khi risk HIGH hoặc chưa approve._
