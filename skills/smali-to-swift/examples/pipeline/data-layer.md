# Step 2: Data Layer Reconstruction 💾

**Input:** User provides class-dump headers + Hopper pseudo-code for network/data classes.

## Tasks

### 1. Models: Convert ObjC interfaces → Swift structs

```objc
// ObjC header (class-dump)
@interface UserModel : NSObject
@property (nonatomic, copy) NSString *userId;
@property (nonatomic, copy) NSString *fullName;
@property (nonatomic, assign) NSInteger age;
@end
```
```swift
// Swift
struct User: Codable, Identifiable {
    let id: String
    let fullName: String
    let age: Int
    
    enum CodingKeys: String, CodingKey {
        case id = "user_id"
        case fullName = "full_name"
        case age
    }
}
```

### 2. API Layer

Extract base URL, endpoints, headers from disassembly. Create async URLSession-based API client:

```swift
actor APIClient {
    private let session: URLSession
    private let baseURL: URL
    
    func request<T: Decodable>(_ endpoint: Endpoint) async throws -> T {
        let (data, response) = try await session.data(for: endpoint.urlRequest(baseURL: baseURL))
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.invalidResponse
        }
        return try JSONDecoder().decode(T.self, from: data)
    }
}
```

### 3. Local Storage

- CoreData models → SwiftData `@Model` classes
- NSUserDefaults keys → `@AppStorage` or typed UserDefaults wrapper
- Keychain items → KeychainAccess wrapper

### 4. Repository Pattern

```swift
// Domain layer - protocol
protocol UserRepository: Sendable {
    func getUser(id: String) async throws -> User
    func login(email: String, password: String) async throws -> AuthToken
}

// Data layer - implementation
final class UserRepositoryImpl: UserRepository {
    private let apiClient: APIClient
    private let modelContext: ModelContext
    
    func getUser(id: String) async throws -> User {
        // offline-first: check local → fetch remote → cache
    }
}
```
