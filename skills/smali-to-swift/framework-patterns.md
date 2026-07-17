# 📦 iOS Framework Detection Patterns

> Reference database for Step 0 (Framework Scanner).
> Agent uses these patterns to identify third-party frameworks from IPA structure, class-dump headers, and Mach-O linked libraries.

---

## 🟢 Network & API

| Detection Pattern | Framework | Latest Replacement | Action |
|-------------------|-----------|-------------------|--------|
| `Alamofire.framework` / `import Alamofire` | Alamofire | URLSession async/await | Evaluate |
| `AFNetworking.framework` / `#import <AFNetworking/...>` | AFNetworking | URLSession async/await | Replace |
| `Moya.framework` | Moya | URLSession + Endpoint enum | Evaluate |
| `Apollo.framework` | Apollo (GraphQL) | Keep (current) | Add via SPM |
| `SocketRocket.framework` / `SRWebSocket` | SocketRocket | URLSessionWebSocketTask | Replace |
| `Starscream.framework` | Starscream | URLSessionWebSocketTask | Evaluate |
| `SwiftyJSON.framework` | SwiftyJSON | Codable (built-in) | Replace |
| `ObjectMapper.framework` | ObjectMapper | Codable | Replace |
| `Mantle.framework` | Mantle | Codable | Replace |

---

## 🟡 Image Loading

| Detection Pattern | Framework | Latest Replacement | Action |
|-------------------|-----------|-------------------|--------|
| `SDWebImage.framework` / `#import <SDWebImage/...>` | SDWebImage | Kingfisher / AsyncImage | Replace |
| `Kingfisher.framework` | Kingfisher | Keep (current) | Add via SPM |
| `Nuke.framework` | Nuke | Keep (current) | Add via SPM |
| `PINRemoteImage.framework` | PINRemoteImage | Kingfisher | Replace |
| `FLAnimatedImage.framework` | FLAnimatedImage | Kingfisher (GIF support) | Replace |

---

## 🔵 Reactive Programming

| Detection Pattern | Framework | Latest Replacement | Action |
|-------------------|-----------|-------------------|--------|
| `RxSwift.framework` / `import RxSwift` | RxSwift | async/await + AsyncSequence | Gradual migrate |
| `RxCocoa.framework` | RxCocoa | SwiftUI bindings | Replace |
| `ReactiveSwift.framework` | ReactiveSwift | async/await + AsyncSequence | Replace |
| `Combine` (Apple built-in) | Combine | Keep or migrate to AsyncSequence | Evaluate |
| `PromiseKit.framework` | PromiseKit | async/await | Replace |

---

## 🟠 UI & Layout

| Detection Pattern | Framework | Latest Replacement | Action |
|-------------------|-----------|-------------------|--------|
| `SnapKit.framework` / `import SnapKit` | SnapKit | SwiftUI layout | Replace |
| `Masonry.framework` / `#import <Masonry/...>` | Masonry | SwiftUI layout | Replace |
| `Cartography.framework` | Cartography | SwiftUI layout | Replace |
| `Lottie.framework` / `import Lottie` | Lottie | Keep (has SwiftUI support) | Add via SPM |
| `SVProgressHUD.framework` | SVProgressHUD | SwiftUI ProgressView | Replace |
| `MBProgressHUD.framework` | MBProgressHUD | SwiftUI ProgressView | Replace |
| `JGProgressHUD.framework` | JGProgressHUD | SwiftUI ProgressView | Replace |
| `IQKeyboardManager.framework` | IQKeyboardManager | SwiftUI keyboard handling | Remove |
| `TTTAttributedLabel.framework` | TTTAttributedLabel | SwiftUI Text + AttributedString | Replace |
| `Hero.framework` | Hero | NavigationTransition / matchedGeometryEffect | Evaluate |
| `DZNEmptyDataSet.framework` | DZNEmptyDataSet | SwiftUI ContentUnavailableView | Replace |
| `SkeletonView.framework` | SkeletonView | SwiftUI .redacted(reason:) | Replace |
| `Charts.framework` (danielgindi) | Charts | Swift Charts (iOS 16+) | Replace |
| `FSCalendar.framework` | FSCalendar | Custom SwiftUI Calendar | Replace |

---

## 🟣 Firebase & Google

| Detection Pattern | Framework | Action |
|-------------------|-----------|--------|
| `FirebaseAnalytics.framework` / `FirebaseCore` | Firebase Analytics | Add latest via SPM |
| `FirebaseCrashlytics.framework` | Crashlytics | Add latest via SPM |
| `FirebaseMessaging.framework` | FCM | Add latest via SPM |
| `FirebaseAuth.framework` | Firebase Auth | Add latest via SPM |
| `FirebaseFirestore.framework` | Firestore | Add latest via SPM |
| `FirebaseDatabase.framework` | Realtime DB | Add latest via SPM |
| `FirebaseStorage.framework` | Cloud Storage | Add latest via SPM |
| `FirebaseRemoteConfig.framework` | Remote Config | Add latest via SPM |
| `GoogleMobileAds.framework` | AdMob | Add latest via SPM |
| `GoogleSignIn.framework` | Google Sign-In | Add latest via SPM |
| `GoogleMaps.framework` | Google Maps | Add via SPM/CocoaPods |
| `GooglePlaces.framework` | Google Places | Add via SPM/CocoaPods |

---

## 🔴 Social SDKs

| Detection Pattern | Framework | Action |
|-------------------|-----------|--------|
| `FBSDKCoreKit.framework` | Facebook Core | Add latest via SPM |
| `FBSDKLoginKit.framework` | Facebook Login | Add latest via SPM |
| `FBSDKShareKit.framework` | Facebook Share | Add latest via SPM |
| `LineSDK.framework` | LINE SDK | Add via SPM |
| `KakaoSDK*.framework` | Kakao SDK | Add via SPM |
| `TwitterKit.framework` | Twitter SDK | Evaluate (deprecated?) |

---

## ⚪ Database & Storage

| Detection Pattern | Framework | Latest Replacement | Action |
|-------------------|-----------|-------------------|--------|
| `Realm.framework` / `RealmSwift.framework` | Realm | SwiftData (iOS 17+) | Evaluate |
| `FMDB.framework` | FMDB (SQLite wrapper) | SwiftData / GRDB | Replace |
| `GRDB.framework` | GRDB.swift | Keep (current) | Add via SPM |
| `MagicalRecord.framework` | MagicalRecord | SwiftData | Replace |
| `CoreData.framework` (Apple) | Core Data | SwiftData (iOS 17+) | Upgrade |
| `KeychainAccess.framework` | KeychainAccess | Keep (current) | Add via SPM |
| `SAMKeychain.framework` | SAMKeychain | KeychainAccess | Replace |
| `MMKV.framework` | MMKV (Tencent) | UserDefaults / @AppStorage | Evaluate |

---

## ⚫ Utility

| Detection Pattern | Framework | Latest Replacement | Action |
|-------------------|-----------|-------------------|--------|
| `CocoaLumberjack.framework` | CocoaLumberjack | OSLog / swift-log | Replace |
| `SwiftyUserDefaults.framework` | SwiftyUserDefaults | @AppStorage | Replace |
| `Then.framework` | Then | Swift closures | Remove (not needed) |
| `R.swift` / `Rswift.framework` | R.swift | Xcode asset symbols | Replace |
| `SwiftGen` | SwiftGen | Xcode asset symbols | Replace |
| `CryptoSwift.framework` | CryptoSwift | CryptoKit (Apple) | Replace |
| `SwiftDate.framework` | SwiftDate | Foundation Date APIs | Evaluate |
| `DeviceKit.framework` | DeviceKit | UIDevice extensions | Evaluate |
| `Reachability.framework` / `ReachabilitySwift` | Reachability | NWPathMonitor (Network) | Replace |
| `ZXingObjC.framework` | ZXing (QR) | AVFoundation / VisionKit (native) | Replace |
| `JWTDecode.framework` | JWTDecode | Keep | Add via SPM |

---

## 🔐 Security

| Detection Pattern | Framework | Action |
|-------------------|-----------|--------|
| `CryptoKit` (Apple) | CryptoKit | Keep (native) |
| `CommonCrypto` (Apple) | CommonCrypto | Keep (for legacy algorithms) |
| `Security.framework` (Apple) | Security | Keep (native) |
| `SSLPinning` headers | Custom SSL pinning | Re-implement with URLSession delegate |

---

## 🔍 Detection Strategy

### Step 1: Embedded Frameworks
```bash
# List all embedded frameworks
ls Payload/App.app/Frameworks/

# Check Mach-O linked libraries
otool -L Payload/App.app/App | grep -v /System | grep -v /usr/lib
```

### Step 2: Class-dump Header Imports
```bash
# Find all imports in dumped headers
grep -rh "#import <" headers/ | sort -u
grep -rh "@import " headers/ | sort -u
grep -rh "import " headers/ | grep -v Foundation | grep -v UIKit | sort -u
```

### Step 3: Binary String Search
```bash
# Find framework identifiers in binary
strings Payload/App.app/App | grep -i "cocoapods\|carthage\|SPM\|alamofire\|firebase"
```

### Step 4: CocoaPods / SPM Markers
```bash
# Check for Pods metadata
find Payload/App.app -name "Pods-*" -o -name "cocoapods*"
# Check for SPM metadata
find Payload/App.app -name "*.package" -o -name "Package.resolved"
```

### Step 5: Classify & Report
```
For each detected framework:
  1. Match against patterns above
  2. Categorize: Keep / Replace / Upgrade / Evaluate
  3. Unknown → investigate purpose via class-dump headers
  4. App's own code → mark for Swift rewrite
```

---

*framework-patterns v1.0.0 — Reference database for IPA framework detection*
