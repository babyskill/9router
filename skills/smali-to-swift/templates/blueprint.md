# 📐 Feature Blueprint: [Feature Name] (iOS)

**Generated:** [Date]
**Architecture:** [App Name]
**Feature:** [Feature Name]

---

## 🔍 Header/Disassembly Analysis

| Item | Value |
|------|-------|
| Headers analyzed | [list] |
| Classes found | [count] |
| API calls detected | [count] |
| Delegate patterns | [count] |

### Key Observations
- [Pattern 1]
- [Pattern 2]

---

## 📦 Domain Models

```swift
struct [Model]: Codable, Identifiable, Sendable {
    let field1: Type
    // ...
}
```

---

## 📡 Repository Protocol

```swift
protocol [Feature]Repository: Sendable {
    func [method](...) async throws -> [Type]
}
```

---

## 🧩 UseCase Signatures

```swift
struct [Action]UseCase: Sendable {
    func execute(...) async throws -> [Type]
}
```

---

## 🎨 UI State Design

- ViewModel properties list
- User actions list
- Navigation events list

---

## 🖼️ Screen Wireframe

```
┌────────────────────────┐
│                        │
│    [Layout sketch]     │
│                        │
└────────────────────────┘
```

---

## 📁 Files to Create

| File | Layer | Type |
|------|-------|------|

---

> **Next:** Approve → Phase 3 (Implementation)
