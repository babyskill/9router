# 🏗️ Phase 1: Architecture (District View) — iOS

> **Zoom Level:** 1 — Architecture Design
> **Goal:** Design the overall architecture BEFORE writing any code.
> **Input:** Completed App Map from Phase 0.
> **Output:** Architecture Blueprint (layer maps, feature tables). **NO CODE BODIES.**

---

## ⛔ OUTPUT RULE

```
✅ ALLOWED: Architecture diagrams, layer maps, feature-to-file mapping tables
✅ ALLOWED: File paths, module names, dependency lists
❌ BLOCKED: Function bodies, implementation details, actual Swift code
⚠️ EXCEPTION: SPM dependency declarations only
```

---

## 📋 Sub-steps

### 1.1: Layer Design

Design Clean Architecture layers based on App Map:

```
┌─────────────────────────────────────┐
│ Presentation                        │
│ ├── Screens/ ([N] screens)          │
│ ├── Navigation/ (NavigationStack)   │
│ ├── Theme/ (AppTheme)             │
│ └── Components/ (Shared Views)     │
├─────────────────────────────────────┤
│ Domain                              │
│ ├── Models/ ([N] business models)   │
│ ├── Repositories/ ([N] protocols)  │
│ └── UseCases/ ([N] use cases)       │
├─────────────────────────────────────┤
│ Data                                │
│ ├── Network/ (APIClient, Endpoints) │
│ ├── Local/ (SwiftData, Keychain)   │
│ └── Repositories/ (implementations)│
├─────────────────────────────────────┤
│ DI                                  │
│ └── AppContainer.swift             │
└─────────────────────────────────────┘
```

### 1.2: Feature → File Mapping

| Feature | Domain Model | Repository | UseCase | Screen(s) | ViewModel |
|---------|-------------|-----------|---------|-----------|-----------|
| Auth | User, Token | AuthRepo | LoginUC | Login, Register | AuthVM |
| Home | [Model] | [Repo] | [UC] | Home | HomeVM |
| ... | ... | ... | ... | ... | ... |

### 1.3: API Endpoint Inventory

Extract ALL API endpoints from class-dump headers + disassembly:

| # | Method | Endpoint | Auth | Notes |
|---|--------|----------|------|-------|
| 1 | POST | /auth/login | No | JWT response |
| 2 | GET | /users/me | Bearer | User profile |

**How to find in class-dump/disassembly:**
```
Look for: NSString init with "https://" or "http://"
Look for: properties named baseURL, apiURL, endpoint
Look for: method names like fetchUser, loginWith, getProfile
Look for: AFHTTPSessionManager or NSURLSession usage patterns
```

### 1.4: Data Schema Inventory

| Model | Key Fields | Source | Storage |
|-------|-----------|--------|---------|
| User | id, name, email, avatar | API + Local | SwiftData |
| Settings | theme, lang, notif | Local only | @AppStorage |

### 1.5: Xcode Project Structure

```
App/
├── App.swift                    # @main entry point
├── AppDelegate.swift            # UIKit lifecycle (if needed)
├── Info.plist
├── Assets.xcassets/
├── DI/
│   └── AppContainer.swift
├── Data/
│   ├── Network/
│   │   ├── APIClient.swift
│   │   ├── Endpoints/
│   │   └── DTOs/
│   ├── Local/
│   │   ├── SwiftDataModels/
│   │   ├── KeychainService.swift
│   │   └── UserDefaultsKeys.swift
│   └── Repositories/
├── Domain/
│   ├── Models/
│   ├── Repositories/
│   └── UseCases/
├── Presentation/
│   ├── Navigation/
│   │   ├── AppNavigation.swift
│   │   └── Route.swift
│   ├── Theme/
│   │   ├── AppTheme.swift
│   │   └── Components/
│   └── Screens/
│       ├── Launch/
│       ├── Auth/
│       ├── Home/
│       └── .../
├── Utilities/
│   ├── Extensions/
│   ├── Crypto/
│   └── Helpers/
└── Resources/
    ├── Localizable.xcstrings
    └── Fonts/
```

### 1.6: Build Order

| # | Phase | Scope | Complexity |
|---|-------|-------|-----------|
| 1 | 🟢 Setup | Xcode project + SPM deps + Theme | Low |
| 2 | 🟢 Models | Domain structs | Low |
| 3 | 🟡 Data | APIClient + SwiftData + Keychain | Medium |
| 4 | 🟡 Utils | Crypto, formatters (parity test!) | Medium |
| 5 | 🔴 Feature: [First] | Blueprint → Build | High |
| 6 | 🔴 Feature: [Second] | Blueprint → Build | High |
| N | 🔴 Final | Parity check + QA | High |

### 1.7: Tech Stack Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| UI | SwiftUI + iOS 17+ | Modern, declarative |
| State | @Observable | Latest, no Combine boilerplate |
| Network | URLSession async/await | Apple native, no deps |
| JSON | Codable | Built-in, type-safe |
| Local DB | SwiftData | [or Core Data if < iOS 17] |
| DI | Protocol + init injection | No framework needed |
| Package Manager | SPM | Standard, no CocoaPods |

---

## 📊 Output: Architecture Blueprint

Use template from `templates/architecture.md`.

---

## ✅ Gate

```
"🏗️ Architecture Blueprint xong. Anh muốn bắt đầu từ feature nào?"
→ User picks feature → Phase 2 (Blueprint)
```

---

*Phase 1: Architecture — Design before you build*
