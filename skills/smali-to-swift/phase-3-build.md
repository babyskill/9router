# 🔨 Phase 3: Implementation (Ground View — per feature) — iOS

> **Zoom Level:** 3 — Code Implementation
> **Goal:** Write actual, production-quality Swift code for ONE feature.
> **Input:** Approved Blueprint from Phase 2.
> **Output:** Complete implementation files.

---

## ✅ PREREQUISITES

Before writing ANY code, confirm:
- [ ] Phase 0 App Map approved
- [ ] Phase 1 Architecture Blueprint approved
- [ ] Phase 2 Feature Blueprint approved for THIS feature
- [ ] All contracts (protocols, models, state) defined in Blueprint

---

## 📋 Implementation Order (per feature)

### 3.1: Domain Layer

1. **Models** — Codable structs from Blueprint 2.2
2. **Repository protocols** — from Blueprint 2.3
3. **UseCases** — implement with repository calls

```swift
struct LoginUseCase: Sendable {
    let authRepository: AuthRepository
    
    func execute(email: String, password: String) async throws -> User {
        try await authRepository.login(email: email, password: password)
    }
}
```

### 3.2: Data Layer

1. **DTOs** — Codable structs matching API JSON
2. **Endpoint definitions** — enum with path/method
3. **APIClient** — URLSession async/await wrapper
4. **SwiftData models** (if applicable)
5. **Repository implementation** — offline-first

```swift
final class AuthRepositoryImpl: AuthRepository, Sendable {
    private let apiClient: APIClient
    private let tokenStore: TokenStore
    
    func login(email: String, password: String) async throws -> User {
        let response: LoginResponse = try await apiClient.request(
            .login(email: email, password: password)
        )
        await tokenStore.save(response.accessToken)
        return response.user.toDomain()
    }
    
    var isLoggedIn: AsyncStream<Bool> {
        tokenStore.tokenStream.map { !$0.isEmpty }.eraseToStream()
    }
}
```

### 3.3: DI Container

```swift
@MainActor
final class AppContainer: Observable {
    private let apiClient: APIClient
    
    lazy var authRepository: AuthRepository = AuthRepositoryImpl(
        apiClient: apiClient,
        tokenStore: tokenStore
    )
    
    lazy var loginUseCase = LoginUseCase(authRepository: authRepository)
}
```

### 3.4: ViewModel

@Observable with properties from Blueprint:

```swift
@Observable
final class LoginViewModel {
    var email = ""
    var password = ""
    var isLoading = false
    var showError = false
    var errorMessage = ""
    var isPasswordVisible = false
    
    private let loginUseCase: LoginUseCase
    
    init(loginUseCase: LoginUseCase) {
        self.loginUseCase = loginUseCase
    }
    
    func login() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let user = try await loginUseCase.execute(email: email, password: password)
            // Navigation handled by parent
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}
```

### 3.5: SwiftUI Screen

```swift
struct LoginScreen: View {
    @State private var viewModel: LoginViewModel
    var onLoginSuccess: (User) -> Void
    
    init(loginUseCase: LoginUseCase, onLoginSuccess: @escaping (User) -> Void) {
        _viewModel = State(initialValue: LoginViewModel(loginUseCase: loginUseCase))
        self.onLoginSuccess = onLoginSuccess
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Logo
                // Email TextField
                TextField("Email", text: $viewModel.email)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .textFieldStyle(.roundedBorder)
                
                // Password SecureField
                // Login Button
                Button("Login") {
                    Task { await viewModel.login() }
                }
                .buttonStyle(.borderedProminent)
                .disabled(viewModel.isLoading)
            }
            .padding(24)
        }
        .overlay { if viewModel.isLoading { ProgressView() } }
        .alert("Error", isPresented: $viewModel.showError) {
            Button("OK") {}
        } message: {
            Text(viewModel.errorMessage)
        }
    }
}
```

### 3.6: Resource Extraction (On-Demand)

**ONLY** extract resources used by this screen:

```bash
# Images from Assets.car (use assetutil)
# Strings from Localizable.strings for this VC
# Colors referenced in storyboard for this screen
```

---

## 🔒 CRYPTO UTILS (Special Handling)

If the feature involves encryption/hashing:

```swift
import CryptoKit
import CommonCrypto

enum CryptoUtils {
    static func md5(_ input: String) -> String {
        let data = Data(input.utf8)
        var digest = [UInt8](repeating: 0, count: Int(CC_MD5_DIGEST_LENGTH))
        data.withUnsafeBytes { CC_MD5($0.baseAddress, CC_LONG(data.count), &digest) }
        return digest.map { String(format: "%02x", $0) }.joined()
    }
    
    static func sha256(_ input: String) -> String {
        SHA256.hash(data: Data(input.utf8))
            .compactMap { String(format: "%02x", $0) }.joined()
    }
}

// XCTest (mandatory)
final class CryptoUtilsTests: XCTestCase {
    func testMD5MatchesOriginal() {
        XCTAssertEqual(CryptoUtils.md5("test"), "098f6bcd4621d373cade4e832627b4f6")
    }
}
```

> ⚠️ Crypto functions MUST produce identical output. Test with known pairs from original app.

---

## ✅ Checkpoint (After each feature)

```markdown
## ✅ Feature Complete: [Feature Name]

### Files created:
- Domain/Models/User.swift
- Domain/Repositories/AuthRepository.swift
- Domain/UseCases/LoginUseCase.swift
- Data/Network/Endpoints/AuthEndpoint.swift
- Data/Network/DTOs/LoginRequest.swift, LoginResponse.swift
- Data/Repositories/AuthRepositoryImpl.swift
- Presentation/Screens/Auth/LoginScreen.swift
- Presentation/Screens/Auth/LoginViewModel.swift

### Resources extracted:
- [only what was needed]

### Tests:
- [ ] Crypto utils verified
- [ ] API contract matches original

### ⏭️ Next Feature: [Name]
→ Return to Phase 2 (Blueprint)
```

---

## 🔄 Loop

```
Phase 2 (Blueprint Feature X) → Phase 3 (Build Feature X) → Checkpoint
    ↓
Phase 2 (Blueprint Feature Y) → Phase 3 (Build Feature Y) → Checkpoint
    ↓
... → Final Parity Check
```

---

## ✅ Final Parity Check

1. **API Parity** — all endpoints match
2. **Data Parity** — crypto output identical
3. **UI Parity** — screen comparison
4. **Build & Test:**
```bash
xcodebuild -scheme App -destination 'generic/platform=iOS' build
xcodebuild -scheme App -destination 'platform=iOS Simulator,name=iPhone 16' test
```

---

*Phase 3: Implementation — One feature at a time, guided by Blueprint*
