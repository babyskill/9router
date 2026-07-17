# 🏗️ Architecture Blueprint: [App Name]

**Generated:** [Date]
**Based on:** App Map v[date]

---

## 📐 Layer Map

```
┌─────────────────────────────────────┐
│ Presentation                        │
│ ├── screens/ ([N] screens)          │
│ ├── navigation/ (NavGraph + Routes) │
│ ├── theme/ (Material 3 Theme)      │
│ └── components/ (Shared UI)        │
├─────────────────────────────────────┤
│ Domain                              │
│ ├── model/ ([N] business models)    │
│ ├── repository/ ([N] interfaces)   │
│ └── usecase/ ([N] use cases)        │
├─────────────────────────────────────┤
│ Data                                │
│ ├── remote/ ([N] API services)     │
│ ├── local/ (Room DB, DataStore)    │
│ └── repository/ ([N] impls)        │
├─────────────────────────────────────┤
│ DI (Hilt)                           │
│ └── modules/ (Network, DB, Repo)   │
└─────────────────────────────────────┘
```

---

## 🗂️ Feature → File Mapping

| Feature | Domain Model | Repository | UseCase | Screen(s) | ViewModel |
|---------|-------------|-----------|---------|-----------|-----------|
| Auth | User, Token | AuthRepo | LoginUC, RegisterUC | Login, Register | AuthVM |
| Home | [Model] | [Repo] | [UC] | Home | HomeVM |
| Profile | [Model] | [Repo] | [UC] | Profile, Edit | ProfileVM |
| Settings | [Model] | [Repo] | [UC] | Settings | SettingsVM |
| ... | ... | ... | ... | ... | ... |

---

## 🌐 API Endpoints

| # | Method | Endpoint | Auth | Notes |
|---|--------|----------|------|-------|
| 1 | POST | /auth/login | No | JWT response |
| 2 | GET | /users/me | Bearer | User profile |
| ... | ... | ... | ... | ... |

**Base URL:** `[extracted from Smali]`
**Auth Type:** [Bearer token / API key / Custom]

---

## 💾 Data Schema

| Model | Key Fields | Source | Storage |
|-------|-----------|--------|---------|
| User | id, name, email, avatar | API + Local | Room |
| Settings | theme, lang, notif | Local only | DataStore |
| ... | ... | ... | ... |

---

## 📁 Project Structure

```
app/src/main/java/[package]/
├── App.kt
├── di/
│   ├── AppModule.kt
│   ├── NetworkModule.kt
│   └── DatabaseModule.kt
├── data/
│   ├── remote/
│   │   ├── api/
│   │   ├── dto/
│   │   └── interceptor/
│   ├── local/
│   │   ├── db/
│   │   ├── dao/
│   │   ├── entity/
│   │   └── datastore/
│   └── repository/
├── domain/
│   ├── model/
│   ├── repository/
│   └── usecase/
├── presentation/
│   ├── navigation/
│   ├── theme/
│   ├── components/
│   └── screens/
│       ├── splash/
│       ├── auth/
│       ├── home/
│       └── .../
└── util/
```

---

## 🔢 Build Order

| # | Phase | Scope | Complexity |
|---|-------|-------|-----------|
| 1 | 🟢 Setup | Project + DI skeleton + Theme | Low |
| 2 | 🟢 Models | Domain data classes | Low |
| 3 | 🟡 Data | API + Room + DataStore | Medium |
| 4 | 🟡 Utils | Crypto, formatters (parity test!) | Medium |
| 5 | 🔴 Feature: [First] | Blueprint → Build | High |
| 6 | 🔴 Feature: [Second] | Blueprint → Build | High |
| ... | ... | ... | ... |
| N | 🔴 Final | Parity check + QA | High |

**Suggested first feature:** [Name] — because [reason]

---

## 🔧 Tech Stack Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| UI Framework | Jetpack Compose + Material 3 | Modern, declarative |
| DI | Hilt | Standard Android DI |
| Network | Retrofit + OkHttp | [Keep/Replace based on scan] |
| JSON | Kotlin Serialization | Type-safe, KMP ready |
| Image Loading | [Coil / Keep Glide] | [reason] |
| Local DB | Room | [reason] |
| Preferences | DataStore | Replaces SharedPreferences |
| Async | Coroutines + Flow | Modern concurrency |

---

> **Next:** Anh muốn bắt đầu từ feature nào?
> Em suggest: **[Feature]** vì [reason].
> → Pick feature → Phase 2 (Blueprint)
