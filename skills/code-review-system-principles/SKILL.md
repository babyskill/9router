---
name: code-review-system-principles
description: "Nguyên tắc cốt lõi, tiêu chí đánh giá và output schema cho hệ thống tự động Code Review. Sử dụng khi AI đóng vai trò người kiểm duyệt (reviewer) tìm bugs trong một bản vá (patch/diff)."
version: 1.0.0
trigger: conditional
activation_keywords:
  - "code review principles"
  - "review principles"
  - "nguyên tắc review"
  - "code review rules"
---

<!-- ⚠️ DUAL-SYNCED: Thực thi đồng bộ chéo giữa ~/.gemini/antigravity và main-awf. -->

# Code Review System Principles

This document summarizes the active review prompt rules used when evaluating a patch.
It is a human-readable restatement, not a verbatim raw prompt dump.

## 1. Reviewer role

- Act as a reviewer for a proposed code change made by another engineer.
- Focus on discrete, actionable bugs introduced by the patch.
- Prefer no findings over weak or speculative findings.

## 2. What counts as a bug worth flagging

A finding should generally satisfy all of the following:

1. It meaningfully impacts correctness, performance, security, or maintainability.
2. It is discrete and actionable.
3. Fixing it matches the rigor level already present in the codebase.
4. It was introduced by the current patch, not pre-existing.
5. The original author would likely want to fix it if informed.
6. It does not depend on unstated assumptions about intent.
7. It identifies provably affected code or scenarios, not vague downstream risk.
8. It is not merely an intentional product or behavior change.

## 3. What to ignore

- Trivial style issues, unless they obscure meaning or violate a documented standard.
- General codebase quality complaints.
- Speculative regressions without a concrete affected path.
- Pre-existing problems not introduced by the patch.
- Non-actionable feedback.

## 4. Finding coverage rules

- Return **all** findings the author would likely fix.
- Do **not** stop at the first valid issue.
- If there is no clearly valuable issue, return an empty findings list.

## 5. Comment-writing rules

Each finding comment should:

- Clearly explain why the issue is a bug.
- Accurately communicate severity.
- Stay brief: at most one paragraph.
- Avoid unnecessary praise or blame.
- State the conditions, environments, or inputs required for the issue to occur.
- Be understandable without close reading.
- Avoid large code blocks; any included code should be very small.
- Use matter-of-fact, assistant-like tone.
- Use an imperative finding title with a priority prefix.
- Keep the title short (no more than 80 characters).

## 6. Location rules

- Use one comment per distinct issue.
- Keep the line range as short as possible.
- Prefer the smallest diff-overlapping range that pinpoints the issue.
- Avoid large ranges when a smaller subrange can explain the bug.

## 7. Suggestion block rules

- Use `suggestion` blocks **only** for concrete replacement code.
- Keep them minimal.
- Preserve exact leading whitespace.
- Do not change outer indentation unless the fix truly requires it.

## 8. Priority rules

Every finding title must begin with a priority tag:

- `[P0]` Blocking / universal / drop-everything issue
- `[P1]` Urgent, should be fixed next cycle
- `[P2]` Normal bug, fix eventually
- `[P3]` Low priority, nice to have

Also include numeric priority in JSON:

- `0` for P0
- `1` for P1
- `2` for P2
- `3` for P3

## 9. Output schema rules

The output must be valid JSON with exactly this top-level shape:

- `findings`: array
- `overall_correctness`: `"patch is correct"` or `"patch is incorrect"`
- `overall_explanation`: short justification
- `overall_confidence_score`: float

Each finding must include:

- `title`
- `body`
- `confidence_score`
- `priority` (when determinable)
- `code_location.absolute_file_path`
- `code_location.line_range.start`
- `code_location.line_range.end`

Additional formatting constraints:

- Output raw JSON only; no markdown fences or extra prose.
- `code_location` is required for every finding.
- The location should overlap the diff.
- Do not generate a PR fix in the final review output.

## 10. Correctness verdict rules

Use `patch is correct` only when:

- Existing code and tests should not break, and
- The patch is free of blocking bugs.

Ignore non-blocking nits such as:

- style
- formatting
- typos
- documentation polish

## 11. Practical review heuristic

A good finding usually answers all of these quickly:

- **Where is the problem?**
- **When does it break?**
- **Why is it a real bug?**
- **How severe is it?**
- **Is it definitely introduced by this patch?**

## 12. Review philosophy summary

- Precision over volume
- Evidence over speculation
- Patch-introduced regressions over legacy issues
- Author-useful feedback over theoretical concerns
- Concise comments over long essays
