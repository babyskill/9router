# 📐 Phase 2: Blueprint (Block View — per feature)

> **Zoom Level:** 2 — Feature Detail
> **Goal:** Design contracts, interfaces, and state for ONE specific feature.
> **Input:** Architecture Blueprint (Phase 1) + user's chosen feature.
> **Output:** Feature Blueprint with code signatures. **NO implementation bodies yet.**

---

## ⛔ OUTPUT RULE

```
✅ ALLOWED: Interface/protocol signatures, data class definitions, sealed classes
✅ ALLOWED: Retrofit interface with @GET/@POST annotations (no body)
✅ ALLOWED: UiState sealed class, Event sealed class
❌ BLOCKED: Function body implementations (use TODO() or // ... )
❌ BLOCKED: Full ViewModel logic, full Composable implementations
⚠️ EXCEPTION: Simple data class fields are OK (they ARE the contract)
```

---

## 📋 Sub-steps (per feature)

### 2.1: Deep Smali Reading

Read the Smali/Java files specifically for the chosen feature.

**What to extract:**
- Class hierarchy (extends, implements)
- Field declarations → model properties
- Method signatures → API contracts
- String constants → URLs, keys, messages
- Control flow → business rules (document, don't code)

**Smali Reading Quick Ref:**
```
.field → class fields (properties)
.method → method start
.end method → method end
invoke-virtual → instance method call
invoke-static → static method call
const-string → string literal
new-instance → object creation
if-eqz/if-nez → conditional branches
```

### 2.2: Domain Model Contracts

Define data classes with exact field mapping:

```kotlin
// Domain model
data class User(
    val id: String,
    val fullName: String,
    val email: String,
    val avatarUrl: String?,
    val isVerified: Boolean
)

// DTO (from API)
@Serializable
data class UserDto(
    @SerialName("user_id") val userId: String,
    @SerialName("full_name") val fullName: String,
    @SerialName("email") val email: String,
    @SerialName("avatar_url") val avatarUrl: String?,
    @SerialName("is_verified") val isVerified: Boolean
)
```

### 2.3: Repository Contract

Define interfaces (NO implementation):

```kotlin
interface AuthRepository {
    suspend fun login(email: String, password: String): Result<User>
    suspend fun register(name: String, email: String, password: String): Result<User>
    suspend fun logout()
    fun isLoggedIn(): Flow<Boolean>
    fun getCurrentUser(): Flow<User?>
}
```

### 2.4: API Contract

Define Retrofit interface:

```kotlin
interface AuthApi {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): RegisterResponse

    @GET("auth/me")
    suspend fun getCurrentUser(@Header("Authorization") token: String): UserDto
}
```

### 2.5: UseCase Signatures

```kotlin
class LoginUseCase(private val authRepo: AuthRepository) {
    suspend operator fun invoke(email: String, password: String): Result<User>
    // Implementation: TODO()
}
```

### 2.6: UI State Design

This is CRITICAL — design UiState + Events BEFORE coding the ViewModel:

```kotlin
// State
data class LoginUiState(
    val email: String = "",
    val password: String = "",
    val isLoading: Boolean = false,
    val error: String? = null,
    val isPasswordVisible: Boolean = false
)

// Events (one-time actions)
sealed interface LoginEvent {
    data class NavigateToHome(val user: User) : LoginEvent
    data class ShowSnackbar(val message: String) : LoginEvent
}

// Actions (user interactions)
sealed interface LoginAction {
    data class UpdateEmail(val email: String) : LoginAction
    data class UpdatePassword(val password: String) : LoginAction
    data object TogglePasswordVisibility : LoginAction
    data object Submit : LoginAction
}
```

### 2.7: UI Wireframe

Describe the screen layout in structured text (NOT code):

```markdown
### LoginScreen Wireframe
┌──────────────────────┐
│     [App Logo]       │
│                      │
│ ┌──────────────────┐ │
│ │ Email TextField  │ │
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │ Password Field 👁│ │
│ └──────────────────┘ │
│                      │
│ [═══ Login Button ══]│
│                      │
│   Forgot Password?   │
│   Don't have account?│
│      Register        │
└──────────────────────┘

Behaviors:
- Email: validate format on focus lost
- Password: toggle visibility icon
- Button: disabled when loading, show progress
- Error: Snackbar at bottom
- Success: Navigate to HomeScreen
```

---

## 📊 Output: Feature Blueprint

Present a clean summary:

```markdown
## 📐 Blueprint: [Feature Name]

### Smali Analysis Summary
- Files analyzed: [list]
- Key observations: [patterns, encryption, special logic]

### Contracts
- Domain Models: [list with field count]
- Repository Interface: [method signatures]
- API Interface: [endpoint signatures]
- UseCases: [list]

### UI Design
- UiState: [field list]
- Events: [list]
- Actions: [list]
- Wireframe: [see above]

### Dependencies
- Depends on: [other features/modules]
- Depended by: [features that need this]

### Estimated Files
| File | Layer | Type |
|------|-------|------|
| User.kt | Domain/Model | Data class |
| AuthRepository.kt | Domain/Repository | Interface |
| AuthRepositoryImpl.kt | Data/Repository | Implementation |
| AuthApi.kt | Data/Remote | Retrofit interface |
| LoginUseCase.kt | Domain/UseCase | Class |
| LoginViewModel.kt | Presentation | ViewModel |
| LoginScreen.kt | Presentation | Composable |
```

---

## ✅ Gate

```
"📐 Blueprint cho [Feature] xong. Anh xem contracts có ổn không?
Khi OK em sẽ bắt đầu implement (Phase 3)."

→ User approves → Proceed to Phase 3 (Implementation) for this feature
→ User wants changes → Adjust blueprint
```

---

*Phase 2: Blueprint — Contracts before code*
