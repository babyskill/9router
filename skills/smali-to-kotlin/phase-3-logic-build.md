# 🔨 Phase 3: Logic Build (Per Feature) — Android

> **Zoom Level:** 3 — Code Implementation
> **Goal:** Code logic behind the APPROVED UI shell for ONE feature.
> **Input:** Approved Blueprint + Working UI Shell from Phase 2.
> **Output:** Feature fully wired — UI + logic connected.

---

## ✅ PREREQUISITES

Before writing ANY logic code, confirm:
- [ ] Phase 0 App Map: approved
- [ ] Phase 1 Architecture Blueprint: approved
- [ ] Phase 2 Contracts: approved for THIS feature
- [ ] Phase 2 UI Shell: approved, runs in Preview/device

> ⚠️ If UI is not approved yet, STOP. Go back to Phase 2.

---

## 📋 Implementation Order

### 3.1: Domain Layer

Implement from contracts defined in Phase 2:

1. **Models** — data classes (already drafted in 2.2, now create actual files)
2. **Repository interfaces** — (already drafted in 2.3, create files)
3. **UseCases** — implement invoke() with repository calls

```kotlin
class LoginUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(email: String, password: String): Result<User> {
        return authRepository.login(email, password)
    }
}
```

### 3.2: Data Layer

1. **DTOs** — @Serializable data classes matching API JSON
2. **API interfaces** — Retrofit with correct annotations
3. **Room entities + DAOs** (if applicable)
4. **DataStore** setup (if applicable)
5. **Repository implementation** — offline-first pattern

```kotlin
class AuthRepositoryImpl @Inject constructor(
    private val api: AuthApi,
    private val tokenStore: TokenDataStore
) : AuthRepository {

    override suspend fun login(email: String, password: String): Result<User> {
        return runCatching {
            val response = api.login(LoginRequest(email, password))
            tokenStore.saveToken(response.accessToken)
            response.user.toDomain()
        }
    }

    override fun isLoggedIn(): Flow<Boolean> {
        return tokenStore.tokenFlow.map { it.isNotEmpty() }
    }
}
```

### 3.3: DI Module

```kotlin
@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    abstract fun bindAuthRepository(impl: AuthRepositoryImpl): AuthRepository
}
```

### 3.4: ViewModel

Implement using UiState + Events + Actions from Phase 2.6:

```kotlin
@HiltViewModel
class LoginViewModel @Inject constructor(
    private val loginUseCase: LoginUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState = _uiState.asStateFlow()

    private val _events = MutableSharedFlow<LoginEvent>()
    val events = _events.asSharedFlow()

    fun onAction(action: LoginAction) {
        when (action) {
            is LoginAction.UpdateEmail -> _uiState.update { it.copy(email = action.email) }
            is LoginAction.UpdatePassword -> _uiState.update { it.copy(password = action.password) }
            LoginAction.TogglePasswordVisibility -> _uiState.update {
                it.copy(isPasswordVisible = !it.isPasswordVisible)
            }
            LoginAction.Submit -> login()
        }
    }

    private fun login() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            loginUseCase(uiState.value.email, uiState.value.password)
                .onSuccess { user -> _events.emit(LoginEvent.NavigateToHome(user)) }
                .onFailure { e -> _uiState.update { it.copy(error = e.message, isLoading = false) } }
        }
    }
}
```

### 3.5: Wire UI ↔ Logic ⭐ (NOT "code new UI")

> **This step does NOT create new UI.** The UI already exists from Phase 2.8.
> Only CONNECT the existing UI shell to the real ViewModel.

**Changes needed on the UI shell:**

```kotlin
// Phase 2 code stays as the STATELESS "Content" composable (for Preview):
@Composable
fun LoginScreenContent(
    uiState: LoginUiState = LoginUiState(),
    onAction: (LoginAction) -> Unit = {}
) {
    // ... all UI code from Phase 2.8 — DO NOT MODIFY
}

// ADD a NEW wrapper that wires ViewModel:
@Composable
fun LoginScreen(
    viewModel: LoginViewModel = hiltViewModel(),
    onNavigateToHome: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) {
        viewModel.events.collect { event ->
            when (event) {
                is LoginEvent.NavigateToHome -> onNavigateToHome()
                is LoginEvent.ShowSnackbar -> { /* snackbar */ }
            }
        }
    }

    // Delegate to stateless content composable
    LoginScreenContent(
        uiState = uiState,
        onAction = viewModel::onAction
    )
}
```

**Wire Checklist:**
- [ ] Replace hardcoded defaults → ViewModel state
- [ ] Connect UI actions → ViewModel.onAction()
- [ ] Bind navigation events
- [ ] Connect loading/error states
- [ ] Previews still work (they use the stateless Content composable)

### 3.6: Integration Test ⭐

Verify UI + logic end-to-end:

```markdown
### 🧪 Integration: [Feature]

Functional:
- [ ] API calls succeed, data displays on UI
- [ ] Loading state shows/hides at right time
- [ ] Error state displays correct message
- [ ] Navigation works as expected
- [ ] Form validation works

Data:
- [ ] Request format matches original app
- [ ] Response parses correctly
- [ ] Token/session stored properly
- [ ] Crypto output matches original (if applicable)

Edge Cases:
- [ ] Empty input handling
- [ ] Network error handling
- [ ] Back navigation
```

---

## 🔒 CRYPTO UTILS (Special Handling)

If the feature involves encryption/hashing:

1. Read Smali carefully — exact algorithm, padding, encoding
2. Implement in Kotlin — preserve exact input/output
3. Unit test IMMEDIATELY with known pairs

```kotlin
object CryptoUtils {
    fun hashMd5(input: String): String {
        val md = MessageDigest.getInstance("MD5")
        return md.digest(input.toByteArray())
            .joinToString("") { "%02x".format(it) }
    }
}

// MANDATORY test
class CryptoUtilsTest {
    @Test
    fun `md5 matches original app output`() {
        assertEquals("expected_hash", CryptoUtils.hashMd5("known_input"))
    }
}
```

> ⚠️ Crypto functions MUST produce identical output. Any mismatch breaks server communication.

---

## ✅ Checkpoint

```markdown
## ✅ Feature Complete: [Feature Name]

### Files created:
- domain/model/User.kt
- domain/repository/AuthRepository.kt
- domain/usecase/LoginUseCase.kt
- data/remote/api/AuthApi.kt
- data/remote/dto/LoginRequest.kt, LoginResponse.kt
- data/repository/AuthRepositoryImpl.kt
- di/RepositoryModule.kt
- presentation/screens/auth/LoginViewModel.kt
- presentation/screens/auth/LoginScreen.kt ← wired (from Phase 2)
- presentation/screens/auth/LoginUiState.kt

### Tests:
- [ ] Crypto utils verified (if applicable)
- [ ] API contract matches original
- [ ] UI + Logic e2e works

### ⏭️ Next Feature: [Name]
→ Return to Phase 2 (Blueprint + UI Design)
```

---

## 🔄 Feature Loop

```
Phase 2 (Blueprint + UI for Feature X) → GATE → Phase 3 (Logic for X) → Checkpoint
    ↓
Phase 2 (Blueprint + UI for Feature Y) → GATE → Phase 3 (Logic for Y) → Checkpoint
    ↓
... (repeat for all features from Architecture Build Order)
    ↓
Phase 4: Final Parity Check & Quality Gate
```

---

*Phase 3: Logic Build — Wire logic behind approved UI*
