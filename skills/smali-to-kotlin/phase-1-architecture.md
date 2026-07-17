# 🏗️ Phase 1: Architecture (District View)

> **Zoom Level:** 1 — Architecture Design
> **Goal:** Design the overall architecture BEFORE writing any code.
> **Input:** Completed App Map from Phase 0.
> **Output:** Architecture Blueprint (layer maps, feature tables, API list). **NO CODE BODIES.**

---

## ⛔ OUTPUT RULE

```
✅ ALLOWED: Architecture diagrams, layer maps, feature-to-file mapping tables, API endpoint tables
✅ ALLOWED: File paths, package names, dependency lists
❌ BLOCKED: Function bodies, implementation details, actual Kotlin code
⚠️ EXCEPTION: build.gradle.kts skeleton (plugin + dependency declarations only)
```

---

## 📋 Sub-steps

### 1.1: Layer Design

Design Clean Architecture layers based on App Map:

```
┌─────────────────────────────────────┐
│ Presentation                        │
│ ├── screens/ ([N] screens)          │
│ ├── navigation/ (NavGraph)          │
│ └── theme/ (Material3)             │
├─────────────────────────────────────┤
│ Domain                              │
│ ├── model/ ([N] business models)    │
│ ├── repository/ ([N] interfaces)   │
│ └── usecase/ ([N] use cases)        │
├─────────────────────────────────────┤
│ Data                                │
│ ├── remote/ ([N] API services)     │
│ ├── local/ (Room, DataStore)       │
│ └── repository/ (implementations)  │
├─────────────────────────────────────┤
│ DI                                  │
│ └── modules/ (Network, DB, Repo)   │
└─────────────────────────────────────┘
```

### 1.2: Feature → File Mapping

Map each feature to its Clean Architecture components:

| Feature | Domain Model | Repository | UseCase | Screen | ViewModel |
|---------|-------------|-----------|---------|--------|-----------|
| Auth | User, Token | AuthRepo | LoginUC | Login | AuthVM |
| Home | Data | HomeRepo | GetDataUC | Home | HomeVM |
| ... | ... | ... | ... | ... | ... |

### 1.3: API Endpoint Inventory

Extract ALL API endpoints from Smali analysis:

| # | Method | Endpoint | Auth | Request | Response | Notes |
|---|--------|----------|------|---------|----------|-------|
| 1 | POST | /auth/login | No | email, pwd | JWT token | - |
| 2 | GET | /users/me | Bearer | - | User object | - |

**How to find in Smali:**
```
Look for: const-string → "https://" or "http://"
Look for: .field → BASE_URL, API_URL
Look for: StringBuilder + append patterns (endpoint construction)
Look for: annotation patterns (@GET, @POST in okhttp/retrofit)
```

### 1.4: Data Schema Inventory

List ALL data structures found:

| Model | Fields (key ones) | Source | Storage |
|-------|-------------------|--------|---------|
| User | id, name, email, avatar | API | Room + Memory |
| Settings | theme, language, notifications | Local | DataStore |

### 1.5: Project Structure

Propose directory structure based on features:

```
app/src/main/java/com/package/
├── App.kt
├── di/ (AppModule, NetworkModule, DatabaseModule)
├── data/
│   ├── remote/api/ ([N] Retrofit interfaces)
│   ├── remote/dto/ (DTOs)
│   ├── local/db/ (Room)
│   ├── local/datastore/ (DataStore)
│   └── repository/ (Implementations)
├── domain/
│   ├── model/ (Business models)
│   ├── repository/ (Interfaces)
│   └── usecase/ (Use cases)
├── presentation/
│   ├── navigation/ (NavGraph, Routes)
│   ├── theme/ (Colors, Typography, Theme)
│   ├── components/ (Shared composables)
│   └── screens/
│       ├── splash/
│       ├── auth/
│       ├── home/
│       └── [feature]/
└── util/ (Extensions, helpers)
```

### 1.6: Build Order Suggestion

Recommend order based on dependency graph:

```
1. 🟢 Project setup + DI skeleton + Theme
2. 🟢 Domain models (data classes — no logic)
3. 🟡 Data layer (API interfaces + Room entities)
4. 🟡 Core utils (crypto, formatters — need parity testing)
5. 🔴 UI screens (per-feature, starting from auth)
6. 🔴 SDK integration + Parity check
```

### 1.7: Tech Stack Decisions

Confirm decisions from Phase 0 Library Report:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Image Loading | Coil (replace Glide) | Modern, Compose-native |
| JSON | Kotlin Serialization | Type-safe, no reflection |
| ... | ... | ... |

---

## 📊 Output: Architecture Blueprint

Use template from `templates/architecture.md`. Must include:

1. **Layer Map** — ASCII architecture diagram with counts
2. **Feature Table** — feature → file mapping
3. **API Inventory** — all endpoints found
4. **Data Schema** — all models with key fields
5. **Project Structure** — proposed directory tree
6. **Build Order** — suggested implementation sequence
7. **Tech Decisions** — confirmed choices

---

## ✅ Gate

```
"🏗️ Architecture Blueprint xong. Anh muốn bắt đầu từ feature nào?
Em suggest: [Feature X] vì [reason — e.g., nhiều feature khác phụ thuộc]."

→ User picks feature → Proceed to Phase 2 (Blueprint) for that feature
→ User wants changes → Adjust architecture
```

---

*Phase 1: Architecture — Design before you build*
