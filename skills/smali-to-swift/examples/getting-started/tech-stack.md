# Modern Tech Stack (Mandatory)

## Core

| Layer | Technology | Replaces |
|-------|-----------|----------|
| **UI** | SwiftUI + iOS 17+ | UIKit Storyboards / XIBs |
| **State** | `@Observable` (Observation framework) | `@ObservableObject` / KVO |
| **Navigation** | NavigationStack + NavigationPath | UINavigationController / segues |
| **DI** | Swift DI (protocol + init injection) | Singletons / Service Locators |

## Data Layer

| Purpose | Technology | Replaces |
|---------|-----------|----------|
| **Network** | URLSession + async/await | AFNetworking / Alamofire (evaluate) |
| **JSON** | Codable (Swift built-in) | NSJSONSerialization / Mantle / ObjectMapper |
| **Local DB** | SwiftData (iOS 17+) or Core Data | Raw SQLite / FMDB / Realm |
| **Preferences** | UserDefaults / @AppStorage | NSUserDefaults direct |
| **Keychain** | KeychainAccess (or custom wrapper) | Raw Security.framework |
| **Image Loading** | AsyncImage / Kingfisher / Nuke | SDWebImage (evaluate) |
| **Async** | Swift Concurrency (async/await, actors) | GCD / NSOperation / PromiseKit |

## Observability

| Purpose | Technology |
|---------|-----------|
| **Crash** | Firebase Crashlytics |
| **Analytics** | Firebase Analytics |
| **Logging** | OSLog / swift-log |

## Replacements Table (Legacy → Modern)

```yaml
always_replace:
  NSURLConnection: "URLSession async/await"
  AFNetworking: "URLSession async/await"
  NSJSONSerialization: "Codable / JSONDecoder"
  Mantle/ObjectMapper: "Codable"
  GCD_dispatch_async: "Task { } / async-await"
  NSOperation: "TaskGroup / async let"
  NSTimer: "Timer.publish (Combine) or Task.sleep"
  UIAlertView: "SwiftUI .alert modifier"
  UIActionSheet: "SwiftUI .confirmationDialog"
  UITableView: "List / LazyVStack"
  UICollectionView: "LazyVGrid / LazyHGrid"
  UIPageViewController: "TabView with .page style"
  Storyboard_segues: "NavigationStack + NavigationLink"
  NSNotificationCenter_addObserver: "NotificationCenter.notifications (AsyncSequence)"
  KVO: "@Observable macro"
  Delegate_patterns: "AsyncStream or closures"
  Target_Action: "SwiftUI action closures"

evaluate_before_replacing:
  Alamofire: "Keep if deeply used for interceptors/retry, otherwise → URLSession"
  SDWebImage: "Replace with AsyncImage + Kingfisher"
  Realm: "Migrate to SwiftData (if iOS 17+)"
  RxSwift: "Migrate to async/await + AsyncSequence (gradual)"
  SnapKit: "Replace with SwiftUI layout"
  Masonry: "Replace with SwiftUI layout"
  MBProgressHUD: "SwiftUI .overlay + ProgressView"
  SVProgressHUD: "SwiftUI .overlay + ProgressView"
  IQKeyboardManager: "SwiftUI handles keyboard automatically"

keep_as_is:
  - "Firebase SDKs (use latest via SPM)"
  - "Google Sign-In"
  - "Facebook SDK (latest)"
  - "Apple frameworks (MapKit, CoreLocation, AVFoundation, etc.)"
  - "Native C/C++ libraries (.dylib)"
  - "CryptoKit (Apple native)"
```
