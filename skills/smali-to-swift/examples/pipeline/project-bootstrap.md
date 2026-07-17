# Step 1: Info.plist & Entitlements Analysis + Project Bootstrap 📄

**Input:** User provides `Info.plist` + entitlements from IPA.

## Tasks

1. Extract Bundle ID and display name
2. List required permissions (Privacy keys):
   ```
   NSCameraUsageDescription          → Camera
   NSPhotoLibraryUsageDescription    → Photo Library
   NSLocationWhenInUseUsageDescription → Location
   NSMicrophoneUsageDescription      → Microphone
   ```
3. Identify URL Schemes (deep links)
4. Check app capabilities from entitlements:
   ```
   com.apple.developer.associated-domains → Universal Links
   aps-environment → Push Notifications
   com.apple.developer.in-app-payments → Apple Pay
   ```
5. Analyze class-dump headers for entry points:
   - `AppDelegate` → lifecycle logic
   - Root ViewController → initial screen
   - Tab bar / Navigation structure
6. **Output:** Propose Clean Architecture project structure

## Project Structure Template

```
App/
├── App.swift                          # @main entry point
├── AppDelegate.swift                  # UIKit lifecycle (if needed for SDKs)
├── Info.plist
├── Assets.xcassets/
├── DI/                                # Dependency Injection
│   └── AppContainer.swift
├── Data/                              # Data Layer
│   ├── Network/
│   │   ├── APIClient.swift            # URLSession wrapper
│   │   ├── Endpoints/                 # API endpoint definitions
│   │   └── DTOs/                      # Codable response models
│   ├── Local/
│   │   ├── SwiftDataModels/           # @Model classes
│   │   ├── KeychainService.swift
│   │   └── UserDefaultsKeys.swift
│   └── Repositories/                  # Repository implementations
├── Domain/                            # Domain Layer
│   ├── Models/                        # Business models
│   ├── Repositories/                  # Repository protocols
│   └── UseCases/
├── Presentation/                      # Presentation Layer
│   ├── Navigation/
│   │   ├── AppNavigation.swift        # NavigationStack + routes
│   │   └── Route.swift                # Deep link routes
│   ├── Theme/
│   │   ├── AppTheme.swift             # Colors, fonts, spacing
│   │   └── Components/               # Reusable SwiftUI components
│   └── Screens/
│       ├── Launch/
│       │   └── LaunchScreen.swift
│       ├── Auth/
│       │   ├── LoginScreen.swift
│       │   └── LoginViewModel.swift
│       ├── Home/
│       │   ├── HomeScreen.swift
│       │   └── HomeViewModel.swift
│       └── ...
├── Utilities/
│   ├── Extensions/
│   ├── Crypto/                        # Encryption/hashing utils
│   └── Helpers/
└── Resources/
    ├── Localizable.xcstrings
    └── Fonts/
```
