# 📐 Phase 2: Blueprint + UI Design (Per Feature) — iOS

> **Zoom Level:** 2 — Feature Detail
> **Goal:** Design contracts AND code UI visual shell for ONE feature.
> **Input:** Architecture Blueprint (Phase 1) + user's chosen feature.
> **Output:** Approved contracts + Working SwiftUI shell with mock data.

---

## ⛔ OUTPUT RULE

```
PART A — Contracts (signatures only):
  ✅ Protocol definitions, struct/enum types
  ✅ APIClient endpoint definitions (signature only, no body)
  ✅ ViewState struct, ViewAction enum
  ❌ Function body implementations (use fatalError("TODO"))

PART B — UI (visual code):
  ✅ Full SwiftUI code for screen
  ✅ Hardcoded mock data (using ViewState from Part A)
  ✅ Real resources (icons, colors, images extracted in 2.7)
  ✅ #Preview for ALL states (normal, loading, error, empty)
  ❌ Real ViewModel connection — use parameter defaults
  ❌ Real API calls
  ❌ Business logic
```

---

## 📋 Sub-steps

### 2.1: Deep Source Reading

Read class-dump headers + Hopper pseudo-code for the chosen feature.

**What to extract:**
- Class hierarchy (@interface, @protocol)
- Property declarations → model fields
- Method signatures → API contracts
- String constants → URLs, keys
- Delegate/callback patterns → async contract signatures

**ObjC Header Quick Ref:**
```objc
@interface ClassName : SuperClass <Protocol1, Protocol2>
@property (nonatomic, copy) NSString *name;     // → let name: String
@property (nonatomic, strong) NSArray *items;    // → let items: [Item]
@property (nonatomic, assign) BOOL isActive;     // → let isActive: Bool
@property (nullable, nonatomic, copy) NSString *bio; // → let bio: String?
- (void)fetchDataWithCompletion:(void (^)(id, NSError *))completion;
  // → func fetchData() async throws -> Data
@end
```

See `objc-reading-guide.md` for comprehensive guide.

### 2.2: Domain Model Contracts

```swift
// Domain model
struct User: Identifiable, Sendable {
    let id: String
    let fullName: String
    let email: String
    let avatarURL: URL?
    let isVerified: Bool
}

// DTO (from API)
struct UserDTO: Codable {
    let userId: String
    let fullName: String
    let email: String
    let avatarUrl: String?
    let isVerified: Bool

    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case fullName = "full_name"
        case email
        case avatarUrl = "avatar_url"
        case isVerified = "is_verified"
    }

    func toDomain() -> User {
        User(id: userId, fullName: fullName, email: email,
             avatarURL: avatarUrl.flatMap(URL.init), isVerified: isVerified)
    }
}
```

### 2.3: Repository Contract

```swift
protocol AuthRepository: Sendable {
    func login(email: String, password: String) async throws -> User
    func register(name: String, email: String, password: String) async throws -> User
    func logout() async
    func isLoggedIn() -> Bool
    func currentUser() async -> User?
}
```

### 2.4: API Contract

```swift
enum AuthEndpoint {
    case login(email: String, password: String)
    case register(name: String, email: String, password: String)
    case currentUser

    var path: String { /* ... */ }
    var method: HTTPMethod { /* ... */ }
    // Signature only, no URLRequest body yet
}
```

### 2.5: UseCase Signatures

```swift
struct LoginUseCase {
    private let authRepo: AuthRepository

    func execute(email: String, password: String) async throws -> User {
        fatalError("TODO: implement in Phase 3")
    }
}
```

### 2.6: UI State Design

```swift
// State
struct LoginViewState {
    var email: String = ""
    var password: String = ""
    var isLoading: Bool = false
    var error: String? = nil
    var isPasswordVisible: Bool = false
}

// Actions (user interactions)
enum LoginAction {
    case updateEmail(String)
    case updatePassword(String)
    case togglePasswordVisibility
    case submit
}

// Events (one-time navigation/alerts)
enum LoginEvent {
    case navigateToHome
    case showError(String)
}

// Mock data for Preview
extension LoginViewState {
    static let normal = LoginViewState(email: "user@example.com")
    static let loading = LoginViewState(isLoading: true)
    static let error = LoginViewState(error: "Invalid credentials")
}
```

### 2.7: Resource Extraction ⭐ (Before UI code!)

> **Why here?** UI code (2.8) needs real assets. If resources come later, UI will be full of placeholders — defeating the purpose of visual parity.

**Process:**
1. Extract from `Assets.car` (use `acextract` or screen captures)
2. Extract from IPA bundle: png, pdf, json, fonts
3. Copy ONLY needed resources to new Xcode project `Assets.xcassets`
4. Map string tables to `Localizable.xcstrings`

**Output:**
```markdown
### 📦 Resources for [Screen]
- Images: [list from Assets.xcassets]
- Colors: [list — add to Color extension or asset catalog]
- Strings: [list — add to Localizable.xcstrings]
- Fonts: [custom fonts if any]
✅ All accessible in SwiftUI
```

### 2.8: UI Implementation — Visual Shell ⭐

> **Goal:** Code the screen with HARDCODED mock data. Pixel-perfect visual parity with original app.

**Rules:**
```
✅ MUST DO:
  - Use ViewState from 2.6 (hardcode sample values as defaults)
  - Use REAL resources extracted in 2.7
  - Display ALL visual elements from original app
  - Match: spacing, font size, colors, icon placement
  - Code ALL states: normal, loading, error, empty
  - Create #Preview for each state

❌ MUST NOT:
  - Connect real ViewModel (use parameter defaults)
  - Call real APIs
  - Code business logic
  - Use DI/injection
```

**Pattern — Stateless View:**
```swift
struct LoginScreenContent: View {
    var state: LoginViewState = .normal   // Hardcoded default
    var onAction: (LoginAction) -> Void = { _ in }  // No-op default

    var body: some View {
        VStack(spacing: 24) {
            // Logo — real resource from 2.7
            Image("app_logo")
                .resizable()
                .frame(width: 120, height: 120)

            Spacer().frame(height: 24)

            // Email
            TextField("Email", text: .constant(state.email))
                .textFieldStyle(.roundedBorder)
                .keyboardType(.emailAddress)
                .textContentType(.emailAddress)

            // Password with toggle
            HStack {
                if state.isPasswordVisible {
                    TextField("Password", text: .constant(state.password))
                } else {
                    SecureField("Password", text: .constant(state.password))
                }
                Button { onAction(.togglePasswordVisibility) } label: {
                    Image(systemName: state.isPasswordVisible ? "eye.slash" : "eye")
                        .foregroundColor(.secondary)
                }
            }
            .textFieldStyle(.roundedBorder)

            // Login Button
            Button { onAction(.submit) } label: {
                if state.isLoading {
                    ProgressView()
                        .tint(.white)
                } else {
                    Text("Login")
                        .fontWeight(.semibold)
                }
            }
            .frame(maxWidth: .infinity, minHeight: 50)
            .background(Color.accentColor)
            .foregroundColor(.white)
            .cornerRadius(12)
            .disabled(state.isLoading)

            // Error
            if let error = state.error {
                Text(error)
                    .foregroundColor(.red)
                    .font(.caption)
            }
        }
        .padding(24)
    }
}

// ===== PREVIEWS =====
#Preview("Normal") {
    LoginScreenContent(state: .normal)
}

#Preview("Loading") {
    LoginScreenContent(state: .loading)
}

#Preview("Error") {
    LoginScreenContent(state: .error)
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
- [ ] iOS conventions followed (safe area, etc.)
- [ ] Dynamic Type support
- [ ] Looks good on different iPhone sizes
```

---

## 📊 Output: Feature Blueprint + UI

Structured document with contracts + screen screenshots.

---

## ✅ Gate (MANDATORY)

```
"📐 Blueprint + UI cho [Feature] xong:

📝 Contracts:
  - [N] domain models
  - [N] repository protocols
  - [N] use case signatures
  - [N] API endpoints

🎨 UI:
  - [Screen] implemented with mock data
  - Resources: [N] images, [N] strings, [N] colors
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
