# 📐 Feature Blueprint: [Feature Name]

**Generated:** [Date]
**Architecture:** [App Name] v[date]
**Feature:** [Feature Name]

---

## 🔍 Smali Analysis Summary

| Item | Value |
|------|-------|
| Files analyzed | [list of Smali files] |
| Classes found | [count] |
| API calls detected | [count] |
| Local storage | [types: SharedPrefs, SQLite, etc.] |

### Key Observations
- [Pattern 1: e.g., "Uses MD5 + Base64 for password hashing"]
- [Pattern 2: e.g., "Token stored in SharedPreferences key 'auth_token'"]
- [Pattern 3: e.g., "Custom header 'X-App-Key' in all requests"]

---

## 📦 Domain Models

```kotlin
data class [Model](
    val field1: Type,
    val field2: Type,
    // ...
)
```

---

## 📡 API Contract

```kotlin
interface [Feature]Api {
    @[METHOD]("[endpoint]")
    suspend fun [method](@Body request: [Request]): [Response]
}
```

**Request/Response DTOs:**
```kotlin
@Serializable
data class [Request](/* fields */)

@Serializable
data class [Response](/* fields */)
```

---

## 🗄️ Repository Contract

```kotlin
interface [Feature]Repository {
    suspend fun [method1](...): Result<[Type]>
    fun [method2](): Flow<[Type]>
}
```

---

## 🧩 UseCase Signatures

```kotlin
class [Action]UseCase(private val repo: [Feature]Repository) {
    suspend operator fun invoke(...): Result<[Type]>
}
```

---

## 🎨 UI State Design

```kotlin
// State
data class [Screen]UiState(
    val field1: Type = default,
    val isLoading: Boolean = false,
    val error: String? = null
)

// One-time events
sealed interface [Screen]Event {
    data class NavigateTo[Next](/* params */) : [Screen]Event
    data class ShowSnackbar(val message: String) : [Screen]Event
}

// User actions
sealed interface [Screen]Action {
    data class Update[Field](val value: Type) : [Screen]Action
    data object Submit : [Screen]Action
}
```

---

## 🖼️ Screen Wireframe

```
┌────────────────────────┐
│                        │
│    [Layout sketch]     │
│                        │
└────────────────────────┘

Behaviors:
- [Interaction 1]
- [Interaction 2]
- [Error handling]
- [Navigation on success]
```

---

## 📁 Files to Create

| File | Layer | Type |
|------|-------|------|
| [Model].kt | domain/model | Data class |
| [Feature]Repository.kt | domain/repository | Interface |
| [Action]UseCase.kt | domain/usecase | Class |
| [Feature]Api.kt | data/remote/api | Retrofit interface |
| [DTOs].kt | data/remote/dto | Serializable |
| [Feature]RepositoryImpl.kt | data/repository | Implementation |
| [Screen]Screen.kt | presentation/screens | Composable |
| [Screen]ViewModel.kt | presentation/screens | ViewModel |

---

## 🔗 Dependencies

- **Depends on:** [other features/modules this needs]
- **Depended by:** [features that need this]

---

> **Next:** Anh xem contracts ổn không?
> → OK → Phase 3 (Implementation)
> → Adjust → Update blueprint
