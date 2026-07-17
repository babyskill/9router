# ObjC → Swift Type Mapping Reference

## Property Types → Swift

```objc
@property (nonatomic, copy) NSString *name;        // → let name: String
@property (nonatomic, strong) NSArray *items;       // → let items: [Any] (refine type)
@property (nonatomic, assign) BOOL isActive;        // → let isActive: Bool
@property (nonatomic, assign) NSInteger count;      // → let count: Int
@property (nonatomic, assign) CGFloat height;       // → let height: CGFloat
@property (nonatomic, strong) NSDictionary *meta;   // → let meta: [String: Any]
@property (nonatomic, strong) NSDate *createdAt;    // → let createdAt: Date
@property (nonatomic, strong) NSURL *imageURL;      // → let imageURL: URL?
@property (nonatomic, strong) NSData *data;         // → let data: Data
@property (nullable, nonatomic, copy) NSString *bio; // → let bio: String?
```

## Method Signatures → Swift

```objc
- (void)fetchUserWithId:(NSString *)userId completion:(void (^)(UserModel *, NSError *))completion;
// → func fetchUser(id: String) async throws -> User

+ (instancetype)sharedInstance;
// → static let shared = ClassName()

- (BOOL)validateEmail:(NSString *)email;
// → func validateEmail(_ email: String) -> Bool
```

## Delegate Patterns → Swift

```objc
@protocol UserServiceDelegate <NSObject>
- (void)userServiceDidFetchUser:(UserModel *)user;
- (void)userServiceDidFailWithError:(NSError *)error;
@end
```

```swift
// Replace with async/await:
func fetchUser() async throws -> User
// Or AsyncStream for multiple values:
func userUpdates() -> AsyncStream<User>
```

## Blocks → Closures / async

```objc
typedef void (^CompletionHandler)(NSData * _Nullable data, NSError * _Nullable error);
- (void)requestWithCompletion:(CompletionHandler)completion;
```

```swift
// Modern Swift: drop the callback, use async
func request() async throws -> Data
```
