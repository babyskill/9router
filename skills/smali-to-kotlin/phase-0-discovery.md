# 🗺️ Phase 0: Discovery (Satellite View)

> **Zoom Level:** 0 — Bird's Eye
> **Goal:** Create an "App Map" — understand WHAT the app is and WHAT it contains.
> **Output:** Diagrams, tables, maps. **NO CODE.**

---

## ⛔ OUTPUT RULE

```
✅ ALLOWED: ASCII diagrams, Mermaid, tables, bullet lists, bash scan commands
❌ BLOCKED: Kotlin/Java code, function signatures, class definitions
```

---

## 📋 Sub-steps

### 0.1: Confirm Input

```
🔧 Android Reverse Engineering bắt đầu!

Em cần biết:
1. Thư mục Apktool output ở đâu?
2. Tên app gốc? Package name?

Chưa chạy Apktool? → apktool d your-app.apk -o ./decompiled/
```

### 0.2: Structure Scan

Quét folder structure để hiểu quy mô app:

```bash
# Top-level packages (app code vs libraries)
find [apktool_dir]/smali -maxdepth 3 -type d | sed 's|.*/smali/||' | sort

# Multi-dex check
find [apktool_dir] -name "smali*" -maxdepth 1 -type d

# Resource overview
ls [apktool_dir]/res/layout/ | wc -l         # Number of layouts
ls [apktool_dir]/res/drawable*/ | wc -l       # Number of drawables
cat [apktool_dir]/res/values/strings.xml | grep '<string' | wc -l  # Strings count
```

### 0.3: Library Detection

Quét smali directories để nhận diện thư viện. Ref: `library-patterns.md`

```bash
# Known library packages
find [apktool_dir]/smali -maxdepth 3 -type d | grep -E "(google|facebook|squareup|airbnb|bumptech|jakewharton|reactivex|greenrobot)" | sort

# Native libraries
find [apktool_dir]/lib -name "*.so" 2>/dev/null

# Assets (ML models, WebView, configs)
ls [apktool_dir]/assets/ 2>/dev/null
```

**Phân loại thành 5 nhóm:**

| Category | Meaning | Action |
|----------|---------|--------|
| ✅ Reuse | Modern, still maintained | Add to build.gradle |
| 🔄 Replace | Legacy/deprecated | Map to modern replacement |
| 🔵 Firebase/Google | Platform SDKs | Use latest version |
| 📱 Native (.so) | JNI libraries | Keep, create bridge |
| 🏷️ App Code | Original app logic | Rebuild in Kotlin |

### 0.4: Manifest Analysis

```bash
cat [apktool_dir]/AndroidManifest.xml
```

Extract:
- Application ID + Package name
- Min/Target SDK
- Permissions (grouped by category)
- Entry points: Application class, Launcher Activity
- All components: Activities, Services, Receivers, Providers
- Deep links / Intent filters

### 0.5: Screen Map

Map Activities → future Compose screens. Draw navigation flow:

```
Activities found → Group by feature → Draw screen graph
```

### 0.6: Complexity Estimate

Rate each area 1-5 dots:
- Data Layer: ●●●○○ (APIs, DB, preferences)
- Core Logic: ●●○○○ (crypto, formatters, utils)
- UI Screens: ●●●●○ (screen count, complex layouts)
- SDK Integration: ●●○○○ (third-party, native libs)

---

## 📊 Output: App Map

Use template from `templates/app-map.md`. Must include:

1. **Identity** — package, SDK levels, screen count
2. **Screen Flow** — navigation graph (ASCII or Mermaid)
3. **Library Landscape** — categorized dependency list
4. **Complexity Estimate** — visual dots rating
5. **Key Observations** — anything notable (obfuscation, unusual patterns)

---

## ✅ Gate

```
"🗺️ Đây là App Map. Anh review xem có gì cần diều chỉnh không?"
→ User approves → Proceed to Phase 1 (Architecture)
→ User has questions → Investigate and update map
```

---

*Phase 0: Discovery — No code, just understanding*
