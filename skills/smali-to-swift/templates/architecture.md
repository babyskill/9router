# 🏗️ Architecture Blueprint: [App Name] (iOS)

**Generated:** [Date]
**Based on:** App Map v[date]

---

## 📐 Layer Map

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
│ ├── Network/ (APIClient)           │
│ ├── Local/ (SwiftData, Keychain)   │
│ └── Repositories/ (impls)          │
├─────────────────────────────────────┤
│ DI                                  │
│ └── AppContainer.swift             │
└─────────────────────────────────────┘
```

---

## 🗂️ Feature → File Mapping

| Feature | Domain Model | Repository | UseCase | Screen(s) | ViewModel |
|---------|-------------|-----------|---------|-----------|-----------|

---

## 🌐 API Endpoints

| # | Method | Endpoint | Auth | Notes |
|---|--------|----------|------|-------|

**Base URL:** `[extracted]`

---

## 💾 Data Schema

| Model | Key Fields | Source | Storage |
|-------|-----------|--------|---------|

---

## 📁 Xcode Project Structure

```
App/
├── App.swift
├── AppDelegate.swift
├── DI/AppContainer.swift
├── Data/Network/
├── Data/Local/
├── Data/Repositories/
├── Domain/Models/
├── Domain/Repositories/
├── Domain/UseCases/
├── Presentation/Navigation/
├── Presentation/Theme/
├── Presentation/Components/
├── Presentation/Screens/
├── Utilities/
└── Resources/
```

---

## 🔢 Build Order

| # | Phase | Scope | Complexity |
|---|-------|-------|-----------|

**Suggested first feature:** [Name] — because [reason]

---

## 🔧 Tech Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|

---

> **Next:** Pick feature → Phase 2 (Blueprint)
