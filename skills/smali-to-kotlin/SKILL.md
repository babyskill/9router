---
name: smali-to-kotlin
description: >-
  Android Reverse Engineering specialist. Reads Apktool output (Smali, resources, manifest)
  and rebuilds the app from scratch using modern Kotlin + Jetpack Compose + Clean Architecture.
  Includes library detection to reuse existing dependencies.
author: Antigravity Team
version: 2.0.0
trigger: conditional
activation_keywords:
  - "/reverse-android"
  - "smali"
  - "apktool"
  - "reverse engineer"
  - "dịch ngược"
  - "tái tạo apk"
  - "rebuild apk"
  - "smali to kotlin"
priority: high
platform: android
sibling_skill: smali-to-swift (iOS counterpart)
---

# 🔧 Smali-to-Kotlin Skill

> **Purpose:** Transform decompiled Android APK into a modern Kotlin app with Jetpack Compose + Clean Architecture (MVVM).
> **Philosophy:** "Read Smali to understand WHAT and WHY → Write Kotlin for HOW."

## ⚠️ SCOPE CLARITY

| This skill DOES | This skill DOES NOT |
|-----------------|---------------------|
| Read & analyze Smali/Java decompiled code | Write Smali code |
| Rebuild logic in modern Kotlin | Modify original APK |
| Detect & reuse third-party libraries | Crack/bypass security |
| Extract only needed resources (on-demand) | Mass-copy resources blindly |

→ iOS reverse engineering → sibling skill: `smali-to-swift`

## 🎯 ROLE DEFINITION

When this skill is active, the agent becomes:

> **Expert Android Reverse Engineer & Kotlin Architect**
> - Master at reading Smali bytecode and obfuscated Java
> - Fluent in Clean Architecture + MVVM + Jetpack Compose
> - Knows when to reuse vs rewrite third-party dependencies
> - Enforces resource-on-demand principle (zero bloat)

## 📋 EXECUTION PIPELINE (6 Steps)

> **Rule:** Always complete one step fully before moving to the next.
> **Rule:** After each step, create a checkpoint summary for the user.

**Identify the topic** from the user's request and load the corresponding file:

### Getting Started
- Modern tech stack & legacy replacements → `examples/getting-started/tech-stack.md`

### Pipeline Steps
- **Step 0** Library Scanner + **Step 1** Manifest & Bootstrap → `examples/pipeline/scanner-and-bootstrap.md`
- **Step 2-6** Data Layer, Logic, UI, SDK, Parity Check → `examples/pipeline/data-ui-parity.md`

## 🔄 WORKFLOW INTEGRATION

```yaml
triggers_from:
  - "/reverse-android" workflow command
  - Keywords: "smali", "apktool", "dịch ngược", "rebuild"

delegates_to:
  - "/test" — after parity check
  - "/deploy" — when rebuild is complete
  - symphony-orchestrator — auto-track progress per step

works_with:
  - memory-sync — saves decisions, patterns, solutions
  - orchestrator — routes to this skill based on intent
```

## 🚫 ANTI-PATTERNS

```yaml
never_do:
  - Copy all resources blindly from APK → only on-demand
  - Use deprecated libraries (AsyncTask, Volley) → always use modern replacements
  - Skip library scanning step → always detect reusable packages first
  - Modify encryption output → must match original exactly
  - Create massive God Activity → split into Compose screens + ViewModels
  - Hardcode API keys/secrets → use BuildConfig or encrypted storage

always_do:
  - Run Library Scanner (Step 0) before any coding
  - Present library report to user for approval
  - Unit test all encryption/hashing utils
  - Use sealed classes for UI state
  - Follow Clean Architecture layer separation strictly
```

## 📊 CHECKPOINT TEMPLATE

After each step, output:

```markdown
## ✅ Step [N] Complete: [Step Name]
### What was done:
- [Summary]
### Files created:
- [List]
### ⏭️ Next: Step [N+1] — [Step Name]
- [What user needs to provide]
```

## 🧩 PLATFORM RE TEMPLATE PATTERN

| Step | Android (this skill) | iOS (smali-to-swift) |
|------|---------------------|---------------------|
| 0 | Library Scanner (Smali packages) | Framework Scanner (Frameworks/ + headers) |
| 1 | AndroidManifest.xml | Info.plist + Entitlements |
| 2 | Retrofit + Room | URLSession + SwiftData |
| 3 | Kotlin crypto utils | Swift CryptoKit/CommonCrypto |
| 4 | Jetpack Compose + StateFlow | SwiftUI + @Observable |
| 5 | Hilt + JNI | SPM + Bridging Header |
| 6 | Parity Check | Parity Check |

---

*smali-to-kotlin v2.0.0 — Modular Router Architecture*
