# 🗺️ Phase 0: Discovery (Satellite View) — iOS

> **Zoom Level:** 0 — Bird's Eye
> **Goal:** Create an "App Map" — understand WHAT the app is and WHAT it contains.
> **Output:** Diagrams, tables, maps. **NO CODE.**

---

## ⛔ OUTPUT RULE

```
✅ ALLOWED: ASCII diagrams, Mermaid, tables, bullet lists, bash scan commands
❌ BLOCKED: Swift/ObjC code, function signatures, class definitions
```

---

## 📋 Sub-steps

### 0.1: Confirm Input

```
🍎 iOS Reverse Engineering bắt đầu!

Em cần biết:
1. Decrypted .app bundle ở đâu?
2. Class-dump headers ở đâu?
3. Tên app gốc? Bundle ID?

Chưa chuẩn bị?
→ bagbak -o ~/decrypted/ com.example.app
→ class-dump -H ~/decrypted/App.app -o ~/headers/
```

### 0.2: Structure Scan

Quét IPA structure để hiểu quy mô app:

```bash
# Embedded frameworks
ls [app_bundle]/Frameworks/ 2>/dev/null

# Linked libraries (non-system)
otool -L [app_bundle]/[AppName] | grep -v /System | grep -v /usr/lib

# Header imports (from class-dump)
grep -rh "#import <" [headers_dir]/ | sort -u | head -30
grep -rh "@import " [headers_dir]/ | sort -u

# Count ViewControllers
grep -rl "UIViewController" [headers_dir]/ | wc -l

# Resource overview
ls [app_bundle]/*.car [app_bundle]/*.momd [app_bundle]/*.storyboardc 2>/dev/null
find [app_bundle] -name "*.json" -o -name "*.plist" | grep -v Info.plist | sort

# SDK identifiers in binary
strings [app_bundle]/[AppName] | grep -i "cocoapods\|carthage\|firebase\|facebook\|google" | head -20
```

### 0.3: Framework Detection

Scan for third-party frameworks. Ref: `framework-patterns.md`

**Phân loại thành 5 nhóm:**

| Category | Meaning | Action |
|----------|---------|--------|
| ✅ Reuse | Modern, maintained | Add via SPM |
| 🔄 Replace | Legacy/deprecated | Map to modern Swift |
| 🍏 Apple | System frameworks | Use SwiftUI equivalents |
| 📱 Native | C/C++ dylibs | Keep, bridging header |
| 🏷️ App Code | Original app logic | Rebuild in Swift |

### 0.4: Info.plist Analysis

```bash
plutil -p [app_bundle]/Info.plist
codesign -d --entitlements :- [app_bundle]/[AppName] 2>/dev/null
```

Extract:
- Bundle ID, Display Name, Min iOS version
- Privacy permissions (NSCameraUsageDescription, NSLocationWhenInUseUsageDescription, etc.)
- URL Schemes (deep links)
- Capabilities from entitlements (push, Apple Pay, Sign In with Apple, etc.)
- Supported orientations

### 0.5: Screen Map

Analyze class-dump headers for ViewControllers:

```bash
# Find all ViewControllers
grep -rl "UIViewController" [headers_dir]/ | sort

# Find tab bar controllers
grep -rl "UITabBarController" [headers_dir]/

# Find navigation controllers
grep -rl "UINavigationController" [headers_dir]/
```

Map VCs → future SwiftUI screens. Draw navigation flow.

### 0.6: Complexity Estimate

Rate each area 1-5 dots:
- Data Layer: ●●●○○ (APIs, DB, keychain)
- Core Logic: ●●○○○ (crypto, formatters, utils)
- UI Screens: ●●●●○ (screen count, complex layouts)
- SDK Integration: ●●○○○ (third-party, native libs)

---

## 📊 Output: App Map

Use template from `templates/app-map.md`. Must include:

1. **Identity** — bundle ID, min iOS, screen count
2. **Screen Flow** — navigation graph (ASCII or Mermaid)
3. **Framework Landscape** — categorized dependency list
4. **Complexity Estimate** — visual dots rating
5. **Key Observations** — anything notable

---

## ✅ Gate

```
"🗺️ Đây là App Map. Anh review xem có gì cần điều chỉnh không?"
→ User approves → Proceed to Phase 1 (Architecture)
```

---

*Phase 0: Discovery — No code, just understanding*
