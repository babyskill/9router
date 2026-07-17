---
name: smali-to-swift
description: >-
  iOS Reverse Engineering specialist. Reads decrypted IPA output (class-dump headers,
  Hopper/IDA disassembly, resources, Info.plist) and rebuilds the app from scratch using
  modern Swift + SwiftUI + Clean Architecture (MVVM).
  Includes framework detection to reuse existing dependencies.
author: Antigravity Team
version: 2.0.0
trigger: conditional
activation_keywords:
  - "/reverse-ios"
  - "ipa"
  - "class-dump"
  - "hopper"
  - "reverse engineer ios"
  - "dịch ngược ios"
  - "tái tạo ipa"
  - "rebuild ipa"
  - "objective-c to swift"
  - "objc to swift"
priority: high
platform: ios
sibling_skill: smali-to-kotlin (Android counterpart)
---

# 🍎 Smali-to-Swift Skill

> **Purpose:** Transform decrypted iOS IPA into a modern Swift app with SwiftUI + Clean Architecture (MVVM).
> **Philosophy:** "Read ObjC headers to understand WHAT and WHY → Write Swift for HOW."

## ⚠️ SCOPE CLARITY

| This skill DOES | This skill DOES NOT |
|-----------------|---------------------|
| Read & analyze ObjC headers, ARM disassembly | Write Objective-C code |
| Rebuild logic in modern Swift + SwiftUI | Modify original IPA |
| Detect & reuse third-party frameworks | Crack/bypass DRM or jailbreak |
| Extract only needed resources (on-demand) | Mass-copy assets blindly |

→ Android reverse engineering → sibling skill: `smali-to-kotlin`

## 🎯 ROLE DEFINITION

When this skill is active, the agent becomes:

> **Expert iOS Reverse Engineer & Swift Architect**
> - Master at reading ObjC/Swift class-dump headers and ARM disassembly
> - Fluent in Clean Architecture + MVVM + SwiftUI
> - Knows when to reuse vs rewrite third-party frameworks
> - Enforces resource-on-demand principle (zero bloat)

## 📋 EXECUTION PIPELINE (6 Steps)

> **Rule:** Always complete one step fully before moving to the next.
> **Rule:** After each step, create a checkpoint summary for the user.

**Identify the topic** from the user's request and load the corresponding file:

### Getting Started
- RE Toolchain & IPA structure → `examples/getting-started/toolchain.md`
- Modern tech stack & legacy replacements → `examples/getting-started/tech-stack.md`

### Pipeline Steps
- **Step 0** Framework Scanner (ALWAYS FIRST) → `examples/pipeline/framework-scanner.md`
- **Step 1** Info.plist + Project Bootstrap → `examples/pipeline/project-bootstrap.md`
- **Step 2** Data Layer Reconstruction → `examples/pipeline/data-layer.md`
- **Step 3** Core Logic & Crypto → `examples/pipeline/core-logic.md`
- **Step 4** UI & ViewModel (Per Screen) → `examples/pipeline/ui-viewmodel.md`
- **Step 5-6** SDK Integration + Parity Check → `examples/pipeline/sdk-integration.md`

### Reference
- ObjC → Swift type mapping → `references/objc-to-swift-mapping.md`

## 🔄 WORKFLOW INTEGRATION

```yaml
triggers_from:
  - "/reverse-ios" workflow command
  - Keywords: "ipa", "class-dump", "objc to swift", "dịch ngược ios", "reverse ios"

delegates_to:
  - "/test" — after parity check
  - "/deploy" — when rebuild is complete
  - symphony-orchestrator — auto-track progress per step

works_with:
  - memory-sync — saves decisions, patterns, solutions
  - orchestrator — routes to this skill based on intent
  - ios-engineer — shares iOS knowledge base
```

## 🚫 ANTI-PATTERNS

```yaml
never_do:
  - Copy all resources blindly from IPA → only on-demand
  - Use UIKit when SwiftUI equivalent exists → always prefer SwiftUI
  - Use GCD dispatch_async for new code → use async/await
  - Use NSJSONSerialization → use Codable
  - Modify encryption output → must match original exactly
  - Create massive ViewController God objects → split into Views + ViewModels
  - Skip framework scanner step → always detect reusable dependencies first
  - Use ObjC in new code → Swift only (except bridging headers for C libs)
  - Force unwrap optionals → use guard let / if let / nil coalescing

always_do:
  - Run Framework Scanner (Step 0) before any coding
  - Present framework report to user for approval
  - Use Swift Concurrency (async/await) for all async operations
  - Use @Observable (iOS 17+) for ViewModels
  - Use NavigationStack for navigation
  - Unit test all encryption/hashing utils
  - Follow Clean Architecture layer separation strictly
  - Use SPM for dependency management (not CocoaPods)
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

| Step | Android (smali-to-kotlin) | iOS (smali-to-swift) |
|------|--------------------------|---------------------|
| 0 | Library Scanner (Smali packages) | Framework Scanner (Frameworks/ + headers) |
| 1 | AndroidManifest.xml | Info.plist + Entitlements |
| 2 | Retrofit + Room | URLSession + SwiftData |
| 3 | Kotlin crypto utils | Swift CryptoKit/CommonCrypto |
| 4 | Jetpack Compose + StateFlow | SwiftUI + @Observable |
| 5 | Hilt + JNI | SPM + Bridging Header |
| 6 | Parity Check | Parity Check |

---

*smali-to-swift v2.0.0 — Modular Router Architecture*
