# 🔬 ObjC/ARM Reading Guide for AI

> Quick reference for interpreting Objective-C headers (class-dump) and ARM disassembly (Hopper/IDA) when reverse engineering iOS apps.
> Used by the `smali-to-swift` skill during Steps 1-6.

---

## 📝 Class-Dump Header Basics

### Interface Declaration
```objc
@interface MyViewController : UIViewController <UITableViewDelegate, UITableViewDataSource>

// Properties
@property (nonatomic, strong) UITableView *tableView;
@property (nonatomic, copy) NSString *titleText;
@property (nonatomic, assign) BOOL isLoading;
@property (nonatomic, assign) NSInteger currentPage;
@property (nullable, nonatomic, weak) id<MyDelegate> delegate;

// Instance methods
- (void)fetchDataWithCompletion:(void (^)(NSArray *, NSError *))completion;
- (BOOL)validateEmail:(NSString *)email;

// Class methods
+ (instancetype)sharedInstance;
+ (NSString *)formatDate:(NSDate *)date;

@end
```

### → Swift Translation
```swift
final class MyViewModel: Observable {
    var items: [Item] = []
    var titleText: String = ""
    var isLoading: Bool = false
    var currentPage: Int = 0
    
    func fetchData() async throws -> [Item] { ... }
    func validateEmail(_ email: String) -> Bool { ... }
    
    static let shared = MyViewModel()
    static func formatDate(_ date: Date) -> String { ... }
}
```

---

## 🔑 Type Mappings: ObjC → Swift

### Primitive Types
```
BOOL                → Bool
NSInteger           → Int
NSUInteger          → UInt
CGFloat             → CGFloat
double              → Double
float               → Float
void                → Void
char *              → UnsafePointer<CChar>
```

### Object Types
```
NSString *          → String
NSMutableString *   → String (var)
NSArray *           → [Any] (refine element type from context)
NSMutableArray *    → [Any] (var)
NSDictionary *      → [String: Any] (refine types)
NSMutableDictionary → [String: Any] (var)
NSSet *             → Set<AnyHashable>
NSNumber *          → Int / Double / Bool (depending on context)
NSData *            → Data
NSDate *            → Date
NSURL *             → URL
NSError *           → Error (use Swift error handling)
id                  → Any
id<Protocol>        → some Protocol
instancetype        → Self
NSNull              → nil (optional)
```

### UIKit → SwiftUI
```
UIView              → some View (custom)
UILabel             → Text
UIImageView         → Image / AsyncImage
UIButton            → Button
UITextField         → TextField
UITextView          → TextEditor
UISwitch            → Toggle
UISlider            → Slider
UIProgressView      → ProgressView(.linear)
UIActivityIndicator → ProgressView()
UIStackView         → VStack / HStack
UIScrollView        → ScrollView
UITableView         → List / LazyVStack
UICollectionView    → LazyVGrid / LazyHGrid
UINavigationBar     → navigationTitle + toolbar
UITabBar            → TabView
UISegmentedControl  → Picker(.segmented)
UIPageControl       → TabView(.page)
UIAlertController   → .alert / .confirmationDialog
UISearchBar         → .searchable modifier
```

---

## 📐 Property Attributes → Swift

```objc
// Memory management
(strong)   → let/var (default in Swift, ARC handles)
(weak)     → weak var
(copy)     → let (for value types like String)
(assign)   → var (for primitives)
(retain)   → same as strong

// Atomicity
(nonatomic) → default in Swift (no action needed)
(atomic)    → actor isolation or locks (if thread-safe needed)

// Nullability
(nullable)    → Type?    (Optional)
(nonnull)     → Type     (Non-optional)
(_Nullable)   → Type?
(_Nonnull)    → Type
(null_unspecified) → Type! (IUO — avoid, use ? instead)

// Readability
(readonly)  → let / private(set) var
(readwrite) → var
```

---

## 🎯 Common ObjC Patterns → Swift

### 1. Singleton
```objc
+ (instancetype)sharedInstance {
    static MyClass *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{ instance = [[self alloc] init]; });
    return instance;
}
```
```swift
final class MyClass {
    static let shared = MyClass()
    private init() {}
}
```

### 2. Delegate Pattern
```objc
@protocol DataServiceDelegate <NSObject>
- (void)dataService:(DataService *)service didFetchItems:(NSArray<Item *> *)items;
- (void)dataService:(DataService *)service didFailWithError:(NSError *)error;
@optional
- (void)dataServiceDidStartLoading:(DataService *)service;
@end
```
```swift
// Modern Swift: Replace with async/await
func fetchItems() async throws -> [Item]

// Or if streaming updates needed:
func itemUpdates() -> AsyncStream<[Item]>
```

### 3. Block/Closure Callbacks
```objc
typedef void (^CompletionBlock)(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error);

- (void)requestURL:(NSURL *)url completion:(CompletionBlock)completion;
```
```swift
// Modern: async/await
func request(url: URL) async throws -> (Data, URLResponse)
```

### 4. Notification Observer
```objc
[[NSNotificationCenter defaultCenter] addObserver:self
    selector:@selector(handleNotification:)
    name:@"UserDidLogin"
    object:nil];
```
```swift
// Modern: AsyncSequence
for await _ in NotificationCenter.default.notifications(named: .userDidLogin) {
    // handle
}
```

### 5. GCD Dispatch
```objc
dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    NSData *data = [self fetchData];
    dispatch_async(dispatch_get_main_queue(), ^{
        [self updateUI:data];
    });
});
```
```swift
Task {
    let data = await fetchData()
    // SwiftUI automatically updates on MainActor via @Observable
}
```

### 6. NSUserDefaults
```objc
[[NSUserDefaults standardUserDefaults] setObject:@"value" forKey:@"key"];
NSString *value = [[NSUserDefaults standardUserDefaults] stringForKey:@"key"];
```
```swift
// SwiftUI
@AppStorage("key") var value: String = ""

// Or typed wrapper
enum UserDefaultsKeys {
    @UserDefaultsBacked(key: "key", defaultValue: "")
    static var value: String
}
```

### 7. KVO (Key-Value Observing)
```objc
[self addObserver:self forKeyPath:@"model.name" options:NSKeyValueObservingOptionNew context:nil];

- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary *)change context:(void *)context {
    // update UI
}
```
```swift
// Modern: @Observable handles this automatically
@Observable
class ViewModel {
    var name: String = ""  // SwiftUI auto-observes changes
}
```

### 8. Error Handling
```objc
NSError *error = nil;
NSData *data = [self processDataWithError:&error];
if (error) {
    NSLog(@"Error: %@", error.localizedDescription);
}
```
```swift
do {
    let data = try processData()
} catch {
    print("Error: \(error.localizedDescription)")
}
```

---

## 🔍 ARM Disassembly (Hopper/IDA) Quick Reference

### Function Prologue
```arm
; Hopper pseudo-code is usually readable C-like code
; Focus on understanding the LOGIC, not the assembly

int -[MyClass fetchData](void * self, void * _cmd) {
    r0 = [self apiClient];           // Access property
    r1 = @selector(getData:);        // Method selector
    r0 = [r0 getData:r1];           // Call method
    return r0;
}
```

### String Constants (Finding API URLs)
```arm
; Look for CFSTR or @"..." patterns
adr  x0, aHttpsApiExamp  ; "https://api.example.com"
adr  x1, aApiV1Users     ; "/api/v1/users"
```

### Conditional Branches
```arm
; Compare and branch
cmp  w0, #0               ; if (result == 0)
b.eq label_true           ; goto true branch
b.ne label_false           ; goto false branch

; In Hopper pseudo-code:
if (r0 == 0x0) {
    // true branch
} else {
    // false branch
}
```

### Method Calls (ObjC Runtime)
```arm
; objc_msgSend = calling an ObjC method
bl   _objc_msgSend         ; [obj method]
bl   _objc_msgSend$stret   ; [obj methodReturningStruct]

; In Hopper pseudo-code:
r0 = [r0 stringByAppendingString:r1];
```

---

## 🎯 High-Value Patterns to Look For

### API Base URL
```objc
// In class-dump headers or disassembly
#define kBaseURL @"https://api.example.com/v1"
// or
static NSString *const BaseURL = @"https://api.example.com";
```

### Keychain Keys
```objc
[SSKeychain setPassword:token forService:@"MyApp" account:@"auth_token"];
```

### Encryption
```objc
#import <CommonCrypto/CommonCryptor.h>
CCCrypt(kCCEncrypt, kCCAlgorithmAES128, kCCOptionPKCS7Padding, ...);

// or
#import <CommonCrypto/CommonDigest.h>
CC_MD5(data.bytes, (CC_LONG)data.length, result);
CC_SHA256(data.bytes, (CC_LONG)data.length, result);
```

### URL Schemes (Deep Links)
```xml
<!-- In Info.plist -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>myapp</string>
        </array>
    </dict>
</array>
```

### Push Notification Token
```objc
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken;
```

---

## 🔐 Obfuscation in iOS

iOS apps are **less commonly obfuscated** than Android, but look for:

### Symbol Stripping
- Release builds strip debug symbols
- class-dump still extracts ObjC class/method names
- Swift symbols may be mangled: `_$s7MyClass10fetchDataSSyF`
- Use `swift-demangle` to decode: `xcrun swift-demangle <mangled_name>`

### String Encryption
```objc
// Encrypted strings decoded at runtime
+ (NSString *)decryptString:(NSString *)encrypted;
```
**Strategy:** Find the decryption method, understand algorithm, then decrypt.

### Anti-Debug / Jailbreak Detection
```objc
// Common patterns to look for (and note for re-implementation or removal)
+ (BOOL)isJailbroken;
+ (BOOL)isDebugged;
sysctl(CTL_KERN, KERN_PROC, ...);  // debug check
access("/Applications/Cydia.app", F_OK);  // jailbreak check
```

---

*objc-reading-guide v1.0.0 — AI reference for ObjC header & ARM disassembly interpretation*
