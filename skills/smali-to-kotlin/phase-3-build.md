# 🔨 Phase 3: Implementation (Ground View — per feature)

> **Zoom Level:** 3 — Code Implementation
> **Goal:** Write actual, production-quality code for ONE feature.
> **Input:** Approved Blueprint from Phase 2.
> **Output:** Complete implementation files.

---

## ✅ PREREQUISITES

Before writing ANY code, confirm:
- [ ] Phase 0 App Map exists and is approved
- [ ] Phase 1 Architecture Blueprint exists and is approved
- [ ] Phase 2 Feature Blueprint exists for THIS feature and is approved
- [ ] All contracts (interfaces, models, state) are defined in Blueprint

---

## 📋 Implementation Order (per feature)

### 3.1: Domain Layer

1. **Models** — data classes from Blueprint 2.2
2. **Repository interfaces** — from Blueprint 2.3
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
5. **Repository implementation** — offline-first pattern:

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

Implement using UiState + Events from Blueprint:

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
            LoginAction.TogglePasswordVisibility -> _uiState.update { it.copy(isPasswordVisible = !it.isPasswordVisible) }
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

### 3.5: Compose Screen

```kotlin
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

    // Compose UI from Blueprint wireframe
    Scaffold { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Logo, TextFields, Button — matching wireframe
        }
    }
}
```

### 3.6: Resource Extraction (On-Demand)

**ONLY** extract resources used by this screen:
- Drawables referenced in layout XML
- Strings used in this Activity's Smali
- Colors and Dimens for this screen

```bash
# Find drawables used in layout
grep -o '@drawable/[a-z_]*' [apktool_dir]/res/layout/activity_login.xml | sort -u

# Find strings used in Activity smali
grep 'const-string.*R.string' [apktool_dir]/smali/.../LoginActivity.smali
```

---

## 🔒 CRYPTO UTILS (Special Handling)

If the feature involves encryption/hashing:

1. **Read Smali carefully** — exact algorithm, padding, encoding
2. **Implement in Kotlin** — preserve exact input/output
3. **Unit test IMMEDIATELY** — with known pairs from original app

```kotlin
object CryptoUtils {
    fun hashMd5(input: String): String {
        val md = MessageDigest.getInstance("MD5")
        return md.digest(input.toByteArray())
            .joinToString("") { "%02x".format(it) }
    }
}

// TEST (mandatory)
class CryptoUtilsTest {
    @Test
    fun `md5 matches original app output`() {
        // Capture known pairs from running original app
        assertEquals("expected_hash", CryptoUtils.hashMd5("known_input"))
    }
}
```

> ⚠️ Crypto functions MUST produce identical output. Any mismatch breaks server communication.

---

## ✅ Checkpoint (After each feature)

```markdown
## ✅ Feature Complete: [Feature Name]

### Files created:
- domain/model/User.kt
- domain/repository/AuthRepository.kt
- domain/usecase/LoginUseCase.kt
- data/remote/api/AuthApi.kt
- data/remote/dto/LoginRequest.kt, LoginResponse.kt
- data/repository/AuthRepositoryImpl.kt
- presentation/screens/auth/LoginScreen.kt
- presentation/screens/auth/LoginViewModel.kt
- presentation/screens/auth/LoginUiState.kt

### Resources extracted:
- [only what was needed]

### Tests:
- [ ] Crypto utils verified
- [ ] API contract matches original

### ⏭️ Next Feature: [Name]
→ Return to Phase 2 (Blueprint) for this feature
```

---

## 🔄 Loop

```
Phase 2 (Blueprint for Feature X) → Phase 3 (Build Feature X) → Checkpoint
    ↓
Phase 2 (Blueprint for Feature Y) → Phase 3 (Build Feature Y) → Checkpoint
    ↓
... (repeat for all features from Architecture Build Order)
    ↓
Final: Parity Check & Quality Gate
```

---

## ✅ Final Parity Check (After all features)

1. **API Parity** — all endpoints match (headers, body, encoding)
2. **Data Parity** — crypto/hash output identical
3. **UI Parity** — screen-by-screen comparison
4. **Edge Cases** — empty states, errors, offline
5. **Build & Test** — `./gradlew assembleDebug && ./gradlew test && ./gradlew lint`

---

*Phase 3: Implementation — One feature at a time, guided by Blueprint*
