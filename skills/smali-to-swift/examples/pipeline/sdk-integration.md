# Step 5: Third-party SDK & Native Library Integration 📦

**Input:** Framework Report from Step 0.

## Tasks

### 1. Swift Package Manager setup

```swift
// Package.swift dependencies (or Xcode SPM UI)
dependencies: [
    .package(url: "https://github.com/firebase/firebase-ios-sdk", from: "11.0.0"),
    .package(url: "https://github.com/onevcat/Kingfisher", from: "7.12.0"),
    .package(url: "https://github.com/kishikawakatsumi/KeychainAccess", from: "4.2.2"),
]
```

### 2. Native C/C++ libraries

```swift
// Bridging header for C libraries
// App-Bridging-Header.h
#include "native_crypto.h"

// Swift usage
func callNativeFunction() -> String {
    let result = native_function_name(param)
    return String(cString: result)
}
```

### 3. App lifecycle for SDK init

```swift
@main
struct MyApp: App {
    @UIApplicationDelegateAdaptor private var appDelegate: AppDelegate
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        FirebaseApp.configure()
        // Other SDK initialization
        return true
    }
}
```

## Step 6: Parity Check & Quality Gate ✅

**Per-module checklist:**
1. **Branch Coverage:** Review all conditional paths from disassembly
2. **API Parity:** Same requests/responses as original
3. **Data Parity:** Crypto output matches, local storage compatible
4. **UI Parity:** Screen-by-screen comparison
5. **Performance:**
   - Instruments profiling
   - No unnecessary @State re-renders
   - Proper actor isolation (no data races)
