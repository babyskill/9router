# 📐 Phase 2: Blueprint (Block View — per feature) — iOS

> **Zoom Level:** 2 — Feature Detail
> **Goal:** Design contracts and state for ONE specific feature.
> **Input:** Architecture Blueprint (Phase 1) + user's chosen feature.
> **Output:** Feature Blueprint with code signatures. **NO implementation bodies yet.**

---

## ⛔ OUTPUT RULE

```
✅ ALLOWED: Protocol signatures, struct definitions, enum cases
✅ ALLOWED: Endpoint definitions (path + method, no body)
✅ ALLOWED: State design (@Observable properties, no logic)
❌ BLOCKED: Function body implementations
❌ BLOCKED: Full ViewModel logic, full View implementations
```

---

## 📋 Sub-steps (per feature)

### 2.1: Deep Header/Disassembly Reading

Read class-dump headers + Hopper pseudo-code for the chosen feature.

**What to extract:**
- Class hierarchy (@interface ... : NSObject)
- Properties → model fields
- Method signatures → API contracts
- String constants → URLs, keys
- Delegate/datasource patterns → business rules

**ObjC Header Reading Quick Ref:**
```objc
@property (nonatomic, copy) NSString *name;     // → let name: String
@property (nonatomic, strong) NSArray *items;    // → let items: [Any]
@property (nonatomic, assign) BOOL isActive;     // → let isActive: Bool
@property (nonatomic, assign) NSInteger count;   // → let count: Int
@property (nullable) NSString *bio;              // → let bio: String?

- (void)fetchWithCompletion:(void(^)(id, NSError*))completion;
// → func fetch() async throws -> T

+ (instancetype)sharedInstance;
// → static let shared = ClassName()
```

### 2.2: Domain Model Contracts

```swift
struct User: Codable, Identifiable, Sendable {
    let id: String
    let fullName: String
    let email: String
    let avatarUrl: String?
    let isVerified: Bool

    enum CodingKeys: String, CodingKey {
        case id = "user_id"
        case fullName = "full_name"
        case email
        case avatarUrl = "avatar_url"
        case isVerified = "is_verified"
    }
}
```

### 2.3: Repository Contract

```swift
protocol AuthRepository: Sendable {
    func login(email: String, password: String) async throws -> User
    func register(name: String, email: String, password: String) async throws -> User
    func logout() async
    var isLoggedIn: AsyncStream<Bool> { get }
    var currentUser: AsyncStream<User?> { get }
}
```

### 2.4: API Contract

```swift
enum AuthEndpoint: Endpoint {
    case login(email: String, password: String)
    case register(name: String, email: String, password: String)
    case currentUser
    
    var path: String { /* ... */ }
    var method: HTTPMethod { /* ... */ }
}
```

### 2.5: UseCase Signatures

```swift
struct LoginUseCase: Sendable {
    let authRepository: AuthRepository
    func execute(email: String, password: String) async throws -> User
    // Implementation: TODO
}
```

### 2.6: UI State Design

```swift
// ViewModel properties (will be @Observable)
// - email: String
// - password: String
// - isLoading: Bool
// - showError: Bool
// - errorMessage: String
// - isPasswordVisible: Bool

// Actions the view can trigger:
// - updateEmail(String)
// - updatePassword(String)
// - togglePasswordVisibility()
// - login()

// Navigation events:
// - navigateToHome(User)
// - showSnackbar(String)
```

### 2.7: UI Wireframe

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
│      Register        │
└──────────────────────┘

Behaviors:
- Email: .textContentType(.emailAddress), .keyboardType(.emailAddress)
- Password: toggle visibility, .textContentType(.password)
- Button: .disabled when loading, overlay ProgressView
- Error: .alert modifier
- Success: NavigationStack push to Home
```

---

## 📊 Output: Feature Blueprint

Use template from `templates/blueprint.md`.

---

## ✅ Gate

```
"📐 Blueprint cho [Feature] xong. Anh xem contracts ổn không?"
→ OK → Phase 3 (Implementation)
→ Adjust → Update blueprint
```

---

*Phase 2: Blueprint — Contracts before code*
