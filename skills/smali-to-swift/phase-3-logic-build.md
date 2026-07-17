# 🔨 Phase 3: Logic Build (Per Feature) — iOS

> **Zoom Level:** 3 — Code Implementation
> **Goal:** Code logic behind the APPROVED UI shell for ONE feature.
> **Input:** Approved Blueprint + Working SwiftUI Shell from Phase 2.
> **Output:** Feature fully wired — UI + logic connected.

---

## ✅ PREREQUISITES

Before writing ANY logic code, confirm:
- [ ] Phase 0 App Map: approved
- [ ] Phase 1 Architecture Blueprint: approved
- [ ] Phase 2 Contracts: approved for THIS feature
- [ ] Phase 2 UI Shell: approved, runs in Preview/Simulator

> ⚠️ If UI is not approved yet, STOP. Go back to Phase 2.

---

## 📋 Implementation Order

### 3.1: Domain Layer

Implement from contracts defined in Phase 2:

1. **Models** — structs (already drafted in 2.2, create actual files)
2. **Repository protocols** — (already drafted in 2.3, create files)
3. **UseCases** — implement execute() with repository calls

```swift
struct LoginUseCase {
    private let authRepo: AuthRepository

    func execute(email: String, password: String) async throws -> User {
        try await authRepo.login(email: email, password: password)
    }
}
```

### 3.2: Data Layer

1. **DTOs** — Codable structs matching API JSON
2. **API Client** — async URLSession with proper error handling
3. **SwiftData @Model** classes (if applicable)
4. **Keychain / UserDefaults** wrappers (if applicable)
5. **Repository implementation** — offline-first pattern

```swift
final class AuthRepositoryImpl: AuthRepository {
    private let apiClient: APIClient
    private let tokenStore: TokenStore

    func login(email: String, password: String) async throws -> User {
        let dto = try await apiClient.request(
            AuthEndpoint.login(email: email, password: password),
            responseType: LoginResponseDTO.self
        )
        await tokenStore.save(dto.accessToken)
        return dto.user.toDomain()
    }

    func isLoggedIn() -> Bool {
        tokenStore.hasToken
    }
}
```

### 3.3: DI Container

```swift
@MainActor
final class AppContainer {
    // Singletons
    lazy var apiClient = APIClient(baseURL: Config.apiBaseURL)
    lazy var tokenStore = TokenStore()

    // Repositories
    lazy var authRepository: AuthRepository = AuthRepositoryImpl(
        apiClient: apiClient,
        tokenStore: tokenStore
    )

    // UseCases
    func makeLoginUseCase() -> LoginUseCase {
        LoginUseCase(authRepo: authRepository)
    }

    // ViewModels
    func makeLoginViewModel() -> LoginViewModel {
        LoginViewModel(loginUseCase: makeLoginUseCase())
    }
}
```

### 3.4: ViewModel

Implement using ViewState + Events + Actions from Phase 2.6:

```swift
@Observable
final class LoginViewModel {
    var state = LoginViewState()

    private let loginUseCase: LoginUseCase
    private var onEvent: ((LoginEvent) -> Void)?

    init(loginUseCase: LoginUseCase) {
        self.loginUseCase = loginUseCase
    }

    func setEventHandler(_ handler: @escaping (LoginEvent) -> Void) {
        self.onEvent = handler
    }

    func handle(_ action: LoginAction) {
        switch action {
        case .updateEmail(let email):
            state.email = email
        case .updatePassword(let password):
            state.password = password
        case .togglePasswordVisibility:
            state.isPasswordVisible.toggle()
        case .submit:
            login()
        }
    }

    private func login() {
        state.isLoading = true
        state.error = nil
        Task {
            do {
                let _ = try await loginUseCase.execute(
                    email: state.email,
                    password: state.password
                )
                state.isLoading = false
                onEvent?(.navigateToHome)
            } catch {
                state.isLoading = false
                state.error = error.localizedDescription
            }
        }
    }
}
```

### 3.5: Wire UI ↔ Logic ⭐ (NOT "code new UI")

> **This step does NOT create new UI.** The UI already exists from Phase 2.8.
> Only CONNECT the existing UI shell to the real ViewModel.

**Changes needed on the UI shell:**

```swift
// Phase 2 code stays as the STATELESS "Content" view (for Preview):
struct LoginScreenContent: View {
    var state: LoginViewState = .normal
    var onAction: (LoginAction) -> Void = { _ in }

    var body: some View {
        // ... all UI code from Phase 2.8 — DO NOT MODIFY
    }
}

// Previews still work:
#Preview("Normal") { LoginScreenContent(state: .normal) }
#Preview("Loading") { LoginScreenContent(state: .loading) }

// ADD a NEW wrapper that wires ViewModel:
struct LoginScreen: View {
    @State private var viewModel: LoginViewModel
    var onNavigateToHome: () -> Void

    init(container: AppContainer, onNavigateToHome: @escaping () -> Void) {
        _viewModel = State(initialValue: container.makeLoginViewModel())
        self.onNavigateToHome = onNavigateToHome
    }

    var body: some View {
        LoginScreenContent(
            state: viewModel.state,
            onAction: viewModel.handle
        )
        .onAppear {
            viewModel.setEventHandler { event in
                switch event {
                case .navigateToHome:
                    onNavigateToHome()
                case .showError(let msg):
                    // handle
                    break
                }
            }
        }
    }
}
```

**Wire Checklist:**
- [ ] Wrapper view injects ViewModel from DI container
- [ ] State bindings: ViewModel.state → Content view
- [ ] Action bindings: Content onAction → ViewModel.handle()
- [ ] Event handling: navigation, alerts
- [ ] Previews still work (they use the stateless Content view)

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
- [ ] App backgrounding/foregrounding
```

---

## 🔒 CRYPTO UTILS (Special Handling)

If the feature involves encryption/hashing:

1. Read disassembly carefully — exact algorithm, padding, encoding
2. Implement in Swift — preserve exact input/output
3. Unit test IMMEDIATELY with known pairs

```swift
import CryptoKit
import CommonCrypto

enum CryptoUtils {
    static func md5Hash(_ input: String) -> String {
        let data = Data(input.utf8)
        var digest = [UInt8](repeating: 0, count: Int(CC_MD5_DIGEST_LENGTH))
        data.withUnsafeBytes { CC_MD5($0.baseAddress, CC_LONG(data.count), &digest) }
        return digest.map { String(format: "%02x", $0) }.joined()
    }
}

// MANDATORY test
final class CryptoUtilsTests: XCTestCase {
    func testMD5MatchesOriginal() {
        XCTAssertEqual("expected_hash", CryptoUtils.md5Hash("known_input"))
    }
}
```

> ⚠️ Crypto functions MUST produce identical output. Any mismatch breaks server communication.

---

## ✅ Checkpoint

```markdown
## ✅ Feature Complete: [Feature Name]

### Files created:
- Domain/Models/User.swift
- Domain/Repositories/AuthRepository.swift
- Domain/UseCases/LoginUseCase.swift
- Data/Network/Endpoints/AuthEndpoint.swift
- Data/Network/DTOs/LoginRequestDTO.swift, LoginResponseDTO.swift
- Data/Repositories/AuthRepositoryImpl.swift
- DI/AppContainer.swift (updated)
- Presentation/Screens/Auth/LoginViewModel.swift
- Presentation/Screens/Auth/LoginScreen.swift ← wired (from Phase 2)

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
