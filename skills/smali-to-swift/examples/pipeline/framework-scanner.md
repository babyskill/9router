# Step 0: Framework Scanner (PRE-STEP — Always First) 🔍

**Purpose:** Scan the IPA structure to identify all third-party frameworks before any coding.

## Process

1. **Scan `Frameworks/` directory:**
   ```
   Frameworks/Alamofire.framework     → Alamofire (network)
   Frameworks/SDWebImage.framework    → SDWebImage (image loading)
   Frameworks/Realm.framework         → Realm (database)
   Frameworks/FBSDKCoreKit.framework  → Facebook SDK
   Frameworks/GoogleSignIn.framework  → Google Sign-In
   ```

2. **Scan class-dump headers for imports:**
   ```
   #import <AFNetworking/...>        → AFNetworking
   #import <Masonry/...>             → Masonry (auto-layout)
   #import <MBProgressHUD/...>       → MBProgressHUD
   @import Firebase;                 → Firebase SDK
   @import GoogleMobileAds;          → AdMob
   ```

3. **Check Mach-O linked frameworks:**
   ```bash
   otool -L Payload/App.app/App | grep -v /System | grep -v /usr/lib
   ```

4. **Check embedded dylibs:**
   ```bash
   find Payload/App.app -name "*.dylib" -o -name "*.framework" | sort
   ```

5. **Check for CocoaPods / SPM markers:**
   ```
   Pods/ directory presence → was using CocoaPods
   .package.resolved → was using SPM
   ```

6. **Output: Framework Detection Report**
   ```markdown
   ## 📦 Framework Detection Report
   
   ### ✅ Can Reuse (add to Package.swift / Podfile)
   | Framework | Detected | Latest Version | Action |
   |-----------|----------|----------------|--------|
   | Alamofire | Frameworks/Alamofire.framework | 5.9.0 | Evaluate |
   | Kingfisher | (header import) | 7.12.0 | Add via SPM |
   
   ### 🔄 Must Replace (legacy)
   | Old Framework | Detected | Modern Replacement |
   |---------------|----------|-------------------|
   | AFNetworking | Frameworks/AFNetworking.framework | URLSession async/await |
   | Masonry | header imports | SwiftUI layout |
   
   ### 🍏 Apple Frameworks Used
   | Framework | Purpose |
   |-----------|---------|
   | MapKit | Maps |
   | CoreLocation | GPS |
   | AVFoundation | Camera/Audio |
   
   ### 📱 Native (.dylib) — Investigate
   | File | Notes |
   |------|-------|
   | libcrypto.dylib | Custom crypto? |
   
   ### ❓ Unknown (investigate)
   | Framework/Import | Notes |
   |------------------|-------|
   | CustomSDK.framework | Proprietary? |
   ```
