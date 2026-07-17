---
name: semantic-qa-agent
description: |
  Autonomous QA Agent that uses Hybrid Vision (Screenshots) and Structure (Accessibility Tree)
  to perform semantic testing on mobile and web applications.
metadata:
  stage: core
  version: "1.0"
  tags: [qa, testing, semantic, autonomous, vision, maestro, symphony]
agent: Semantic QA Engineer
allowed-tools:
  - run_command
  - view_file
  - generate_image
  - mcp_pencil_get_screenshot
trigger: symphony task status matches 'review'
invocation-type: auto
priority: 1
---

# Semantic QA Agent Skill

> **Purpose:** Perform intelligent, autonomous QA testing without rigid scripts.
> **Philosophy:** Semantic awareness (Hybrid Tree + Vision) > Coordinate-based testing.

## Protocol: The Semantic Scan Loop

When assigned a task in `review` status, perform the following loop:

### 1. Perception (The Eyes)
- **Structure:** BẮT BUỘC dùng `maestro hierarchy` để lấy UI hierarchy. Tuyệt đối không dùng `adb shell uiautomator dump` hay `xcrun simctl` để lấy structure trừ khi maestro fails hoàn toàn.
- **Vision:** Capture a high-res screenshot to detect custom UI, overlays, or visual glitches (`maestro hierarchy` includes screenshot output optionally, or use OS screenshot tools as fallback).
- **Logs:** Extract system logs (Logcat/OSLog) to detect background crashes or API failures.

### 2. Analysis (The Brain)
- Compare the current UI state against the **Acceptance Criteria** and **Project Specs**.
- Identify the next logical action to achieve the test goal.
- Handle unexpected blockers (e.g., system popups, rate prompts) gracefully.

### 3. Action (The Hands)
- **Execution Engine:** BẮT BUỘC sử dụng Maestro để tương tác. Hãy tự write ra file `flow.yaml` và gọi lệnh `maestro test flow.yaml`.
- **Tuyệt đối CẤM:** Gọi trực tiếp `adb shell input tap ...` hoặc các lệnh tọa độ thô sơ.
- Mọi tương tác phải dựa trên ID, contentDescription, hoặc text trên màn hình để đảm bảo Semantic Flow.

## Integration with Symphony

This agent is part of the **Auto-Healing Vòng lặp**:

1. **Pick Task:** Pull tasks with status `review`.
2. **Execute Test:** Run the Semantic Scan Loop.
3. **Report Result:**
   - ✅ **PASS:** Call `symphony task done <id> -m "QA Approved: Passed all semantic checks."`.
   - ❌ **FAIL:** Call `symphony task reject <id> -m "Bug Report: [Details...]"`.

## Bug Reporting Strategy (Mandatory)
When rejecting a task, follow this template for the feedback message:

```markdown
> ⚠️ QA REJECTED ({date}):
> {Summary of failure}
>
> **Evidence:**
> - Steps to Reproduce: {step 1, step 2...}
> - Crash/Error: {stacktrace or error message}
> - Screenshot: {path_to_artifact}
```

This report will be prepended to the task description for the developer.
