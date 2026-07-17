# 📐 Phase 2: Blueprint + UI Design (Per Feature) — Android

> **Zoom Level:** 2 — Feature Detail
> **Goal:** Design contracts AND code UI visual shell for ONE feature.
> **Input:** Architecture Blueprint (Phase 1) + user's chosen feature.
> **Output:** Approved contracts + Working UI shell with mock data.

---

## ⛔ OUTPUT RULE

```
PART A — Contracts (signatures only):
  ✅ Interface signatures, data class definitions, sealed classes
  ✅ Retrofit interface with @GET/@POST annotations (no body)
  ✅ UiState sealed class, Event sealed class, Action sealed class
  ❌ Function body implementations (use TODO())

PART B — UI (visual code):
  ✅ Full Jetpack Compose code for screen
  ✅ Hardcoded mock data (using UiState from Part A)
  ✅ Real resources (icons, colors, images extracted in 2.7)
  ✅ @Preview for ALL states (normal, loading, error, empty)
  ❌ Real ViewModel connection — use parameter defaults
  ❌ Real API calls
  ❌ Business logic
```

---

## 📋 Sub-steps

### 2.1: Deep Smali Reading

Read Smali/Java files for the chosen feature.

**What to extract:**
- Class hierarchy (extends, implements)
- Field declarations → model properties
- Method signatures → API contracts
- String constants → URLs, keys, messages
- Control flow → business rules (document, don't code)

**Smali Quick Ref:**
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

See `smali-reading-guide.md` for comprehensive guide.

### 2.2: Domain Model Contracts

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

### 2.7: Resource Extraction ⭐ (Before UI code!)

> **Why here?** UI code (2.8) needs real assets. If resources come later, UI will be full of placeholders — defeating the purpose of visual parity.

**Process:**
1. Analyze layout XML to list needed resources:
   ```bash
   grep -o '@drawable/[a-z_]*' [apktool]/res/layout/activity_login.xml | sort -u
   grep -o '@color/[a-z_]*' [apktool]/res/layout/activity_login.xml | sort -u
   grep 'const-string' [apktool]/smali/.../LoginActivity.smali | grep -i string
   ```
2. Copy ONLY needed resources to new project
3. Verify all resources compile

**Output:**
```markdown
### 📦 Resources for [Screen]
- Drawables: [list]
- Colors: [list]
- Strings: [list]
- Dimens: [list]
✅ All accessible
```

### 2.8: UI Implementation — Visual Shell ⭐

> **Goal:** Code the screen with HARDCODED mock data. Pixel-perfect visual parity with original app.

**Rules:**
```
✅ MUST DO:
  - Use UiState from 2.6 (hardcode sample values as defaults)
  - Use REAL resources extracted in 2.7
  - Display ALL visual elements from original app
  - Match: spacing, font size, colors, icon placement
  - Code ALL states: normal, loading, error, empty
  - Create @Preview for each state

❌ MUST NOT:
  - Connect real ViewModel (use parameter defaults)
  - Call real APIs
  - Code business logic
  - Use DI/injection
```

**Pattern — Stateless Composable:**
```kotlin
@Composable
fun LoginScreenContent(
    uiState: LoginUiState = LoginUiState(),  // Hardcoded default
    onAction: (LoginAction) -> Unit = {}      // No-op default
) {
    Scaffold { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Logo — real resource from 2.7
            Image(
                painter = painterResource(R.drawable.app_logo),
                contentDescription = null,
                modifier = Modifier.size(120.dp)
            )
            Spacer(Modifier.height(48.dp))

            // Email
            OutlinedTextField(
                value = uiState.email,
                onValueChange = { onAction(LoginAction.UpdateEmail(it)) },
                label = { Text("Email") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(16.dp))

            // Password with toggle
            OutlinedTextField(
                value = uiState.password,
                onValueChange = { onAction(LoginAction.UpdatePassword(it)) },
                label = { Text("Password") },
                visualTransformation = if (uiState.isPasswordVisible)
                    VisualTransformation.None else PasswordVisualTransformation(),
                trailingIcon = {
                    IconButton(onClick = { onAction(LoginAction.TogglePasswordVisibility) }) {
                        Icon(
                            imageVector = if (uiState.isPasswordVisible)
                                Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = "Toggle password"
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(32.dp))

            // Login Button
            Button(
                onClick = { onAction(LoginAction.Submit) },
                enabled = !uiState.isLoading,
                modifier = Modifier.fillMaxWidth().height(50.dp)
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                } else {
                    Text("Login", style = MaterialTheme.typography.labelLarge)
                }
            }
        }
    }
}

// ===== PREVIEWS =====
@Preview(showBackground = true)
@Composable
private fun NormalPreview() {
    AppTheme { LoginScreenContent(LoginUiState(email = "user@example.com")) }
}

@Preview(showBackground = true)
@Composable
private fun LoadingPreview() {
    AppTheme { LoginScreenContent(LoginUiState(isLoading = true)) }
}

@Preview(showBackground = true)
@Composable
private fun ErrorPreview() {
    AppTheme { LoginScreenContent(LoginUiState(error = "Invalid credentials")) }
}
```

### 2.9: Visual Parity Check ⭐

Compare UI shell with original app screenshot:

```markdown
### 📸 Visual Parity: [Screen Name]

Layout:
- [ ] Structure matches original (components, sections)
- [ ] Spacing between elements correct
- [ ] Alignment matches

Styling:
- [ ] Colors match (background, text, buttons, header)
- [ ] Typography matches (font size, weight)
- [ ] Icons/images correct and positioned
- [ ] Borders, shadows, rounded corners

States:
- [ ] Normal state displays correctly
- [ ] Loading state — progress in right position
- [ ] Error state — error message shows properly
- [ ] Empty state — guidance shown

Platform:
- [ ] Material 3 conventions followed
- [ ] Edge-to-edge / system bars handled
- [ ] Looks good on different screen sizes
```

---

## 📊 Output: Feature Blueprint + UI

Use template from `templates/blueprint.md`.

---

## ✅ Gate (MANDATORY)

```
"📐 Blueprint + UI cho [Feature] xong:

📝 Contracts:
  - [N] domain models
  - [N] repository interfaces
  - [N] use case signatures
  - [N] API endpoints

🎨 UI:
  - [Screen] implemented with mock data
  - Resources: [N] drawables, [N] strings, [N] colors
  - Previews: [N] states (normal, loading, error, empty)

📸 Visual Parity: [OK / cần chỉnh X, Y, Z]

Anh xem UI + contracts ổn không?
→ ✅ Approve → Phase 3 (Logic Build)
→ 🎨 Adjust UI → fix then re-check
→ 📝 Adjust contracts → revise blueprint"
```

> ⚠️ **DO NOT proceed to Phase 3 until user approves BOTH UI and contracts.**

---

*Phase 2: Blueprint + UI Design — See it before you code it*
