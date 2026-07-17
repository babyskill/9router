---
name: android-re-analyzer
description: >-
  Android APK/XAPK/JAR/AAR decompiler & API extractor. Decompiles Android packages
  using jadx and Fernflower/Vineflower, traces call flows from UI to network layer,
  and produces structured API documentation. Complements smali-to-kotlin (rebuild)
  by focusing on analysis & extraction.
author: SimoneAvogadro (adapted by Antigravity Team)
version: 1.0.0
license: Apache-2.0
original_repo: https://github.com/SimoneAvogadro/android-reverse-engineering-skill
trigger: conditional
activation_keywords:
  - "/decompile"
  - "decompile apk"
  - "reverse engineer android"
  - "extract api"
  - "jadx"
  - "fernflower"
  - "vineflower"
  - "find api endpoints"
  - "trace call flow"
  - "analyze apk"
  - "dịch ngược apk"
  - "phân tích apk"
priority: high
platform: android
---

# 🔍 Android RE Analyzer Skill

> **Purpose:** Decompile Android APK/XAPK/JAR/AAR → Analyze structure → Extract & document HTTP APIs.
> **Philosophy:** "Scan → Understand → Document" — analysis & extraction, not rebuilding.

---

## ⚠️ SCOPE CLARITY

| This skill DOES | This skill DOES NOT |
|-----------------|---------------------|
| Decompile APK/XAPK/JAR/AAR to Java source | Rebuild app in modern Kotlin |
| Extract HTTP API endpoints & auth patterns | Write new production code |
| Trace call flows from UI → Network | Modify or repackage APKs |
| Analyze app architecture & manifest | Crack/bypass security |
| Handle obfuscated code (ProGuard/R8) | Deploy to Play Store |
| Auto-install dependencies (jadx, etc.) | Handle iOS apps |

**For rebuilding apps** → delegate to `smali-to-kotlin` skill
**For iOS reverse engineering** → delegate to `smali-to-swift` skill

---

## 🎯 ROLE DEFINITION

When this skill is active, the agent becomes:

> **Expert Android Reverse Engineer & API Analyst**
> - Master at navigating decompiled Java source (obfuscated or clean)
> - Fluent in Retrofit, OkHttp, Volley API patterns
> - Knows how to trace DI (Dagger/Hilt) bindings to find implementations
> - Uses dual-engine decompilation for maximum accuracy

---

## 🛠️ PREREQUISITES

Required: **Java JDK 17+** and **jadx**.
Optional (recommended): **Vineflower** (Fernflower fork) and **dex2jar**.

Check dependencies:
```bash
bash SKILL_ROOT/scripts/check-deps.sh
```

Install missing ones:
```bash
bash SKILL_ROOT/scripts/install-dep.sh <dep>
# Available: java, jadx, vineflower, dex2jar, apktool, adb
```

> `SKILL_ROOT` = path to this skill directory (e.g. `~/.gemini/antigravity/skills/android-re-analyzer`)

---

## 📋 EXECUTION PIPELINE (5 Phases)

> **Rule:** Complete each phase before proceeding to the next.
> **Rule:** After each phase, summarize findings for the user.

### Phase 1: Verify & Install Dependencies

**Action:** Run `check-deps.sh`. If missing required deps → run `install-dep.sh <dep>`.
Re-run check after installation. Do NOT proceed until all required deps are OK.

For optional deps (vineflower, dex2jar), ask user if they want them installed.
Recommend both for best results.

---

### Phase 2: Decompile

**Action:** Run the decompile script:
```bash
bash SKILL_ROOT/scripts/decompile.sh [OPTIONS] <file>
```

Options:
- `-o <dir>` — output directory (default: `<filename>-decompiled`)
- `--deobf` — enable deobfuscation (for obfuscated apps)
- `--no-res` — skip resources, code only (faster)
- `--engine ENGINE` — `jadx` (default), `fernflower`, or `both`

**Engine selection:**

| Situation | Engine |
|---|---|
| First pass on any APK | `jadx` |
| JAR/AAR library analysis | `fernflower` |
| jadx output has warnings | `both` (compare) |
| Complex lambdas/generics | `fernflower` |
| Quick overview of large APK | `jadx --no-res` |

XAPK files are auto-extracted and each APK inside is decompiled separately.

---

### Phase 3: Analyze Structure

1. **Read `AndroidManifest.xml`:**
   - Identify launcher Activity, Application class
   - List Activities, Services, BroadcastReceivers, ContentProviders
   - Note permissions (especially INTERNET, ACCESS_NETWORK_STATE)

2. **Survey package structure** under `<output>/sources/`:
   - Distinguish app code from third-party libraries
   - Look for packages: `api`, `network`, `data`, `repository`, `service`, `retrofit`

3. **Identify architecture pattern:**
   - MVP: `Presenter` classes
   - MVVM: `ViewModel` + `LiveData`/`StateFlow`
   - Clean Architecture: `domain`, `data`, `presentation` packages

---

### Phase 4: Trace Call Flows

Follow execution paths from entry points to network calls:

1. Start from Activities identified in Phase 3
2. Follow initialization: `Application.onCreate()` → HTTP client setup
3. Trace user actions: `onClick()` → ViewModel → Repository → API service
4. Map DI bindings (`@Module`, `@Provides`, `@Binds`, `@Inject`)
5. Handle obfuscated code: use strings, annotations, and library APIs as anchors

See `SKILL_ROOT/references/call-flow-analysis.md` for detailed grep commands and techniques.

---

### Phase 5: Extract & Document APIs

**Action:** Run API search script:
```bash
bash SKILL_ROOT/scripts/find-api-calls.sh <output>/sources/
# Targeted: --retrofit, --okhttp, --volley, --urls, --auth
```

For each endpoint, document:
```markdown
### `METHOD /path/to/endpoint`
- **Source**: `com.example.api.ApiService` (file:line)
- **Base URL**: `https://api.example.com/v1`
- **Path params**: `id` (String)
- **Query params**: `page` (int), `limit` (int)
- **Headers**: `Authorization: Bearer <token>`
- **Request body**: `LoginRequest { email: String, password: String }`
- **Response type**: `ApiResponse<User>`
- **Called from**: `LoginActivity → ViewModel → Repository → ApiService`
```

See `SKILL_ROOT/references/api-extraction-patterns.md` for all search patterns.

---

## 🔄 WORKFLOW INTEGRATION

```yaml
triggers_from:
  - "/decompile" workflow command
  - Keywords: "decompile", "extract api", "analyze apk", "jadx"

delegates_to:
  - smali-to-kotlin — when user wants to rebuild the app after analysis
  - smali-to-swift — when user wants iOS equivalent

works_with:
  - memory-sync — saves analysis findings, API docs
  - symphony-orchestrator — tracks progress per phase
  - orchestrator — routes to this skill based on intent

independent_from:
  - brainstorm-agent
  - ios-engineer
```

---

## 🚫 ANTI-PATTERNS

```yaml
never_do:
  - Skip dependency check → always verify tools are available first
  - Guess at API endpoints → always use grep patterns to find them
  - Ignore obfuscation → use --deobf and string-based tracing
  - Assume app architecture → verify from code before tracing

always_do:
  - Run check-deps.sh before any decompilation
  - Offer dual-engine decompilation when jadx has warnings
  - Document every discovered API endpoint with the template
  - Report architecture pattern before tracing call flows
  - Ask user before proceeding to rebuild (delegate to smali-to-kotlin)
```

---

## 📚 REFERENCES

Detailed guides available in `SKILL_ROOT/references/`:
- `setup-guide.md` — Installing Java, jadx, Vineflower, dex2jar
- `jadx-usage.md` — jadx CLI options and workflows
- `fernflower-usage.md` — Fernflower/Vineflower CLI options
- `api-extraction-patterns.md` — Library-specific grep patterns
- `call-flow-analysis.md` — Techniques for tracing call flows

---

*android-re-analyzer v1.0.0 — Based on SimoneAvogadro/android-reverse-engineering-skill (Apache 2.0)*
*Adapted for Antigravity by Antigravity Team*
