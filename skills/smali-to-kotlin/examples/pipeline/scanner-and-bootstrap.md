# Step 0: Library Scanner (PRE-STEP — Always First) 🔍

**Purpose:** Scan the APK structure to identify all third-party libraries before any coding.

## Process

1. **Scan `smali/` directories** for package patterns:
   ```
   smali/com/google/      → Google SDKs
   smali/com/facebook/    → Facebook SDK
   smali/com/squareup/    → OkHttp, Retrofit, Picasso
   smali/io/reactivex/    → RxJava
   smali/org/greenrobot/  → EventBus
   smali/com/bumptech/    → Glide
   smali/com/airbnb/      → Lottie
   smali/androidx/         → AndroidX (baseline)
   smali/com/jakewharton/ → Butterknife, Timber
   ```

2. **Check `lib/` for native libraries (.so)**:
   ```
   lib/arm64-v8a/*.so     → 64-bit native libs
   lib/armeabi-v7a/*.so   → 32-bit native libs
   ```

3. **Check `assets/` for embedded resources:**
   - ML models (.tflite, .onnx)
   - WebView HTML/JS bundles
   - Config files (JSON, XML)

4. **Output: Library Report**
   ```markdown
   ## 📦 Library Detection Report
   
   ### ✅ Can Reuse (add to build.gradle)
   | Library | Detected Package | Latest Version | Action |
   |---------|-----------------|----------------|--------|
   | Retrofit | com.squareup.retrofit2 | 2.9.0 | Add dependency |
   | OkHttp | com.squareup.okhttp3 | 4.12.0 | Add dependency |
   | Glide | com.bumptech.glide | 4.16.0 | Evaluate → Coil? |
   
   ### 🔄 Must Replace (legacy)
   | Old Library | Detected Package | Replacement |
   |-------------|-----------------|-------------|
   | Volley | com.android.volley | Retrofit |
   | AsyncTask | android.os.AsyncTask | Coroutines |
   
   ### 📱 Native (.so) — Keep As-Is
   | File | Architecture | Notes |
   |------|-------------|-------|
   | libfoo.so | arm64-v8a | Need JNI bridge |
   ```

---

# Step 1: AndroidManifest Analysis & Project Bootstrap 📄

**Input:** User provides `AndroidManifest.xml` from Apktool output.

## Tasks

1. Extract Application ID and original package name
2. List all required permissions (group by category)
3. Identify entry points: Application class, SplashActivity, MainActivity
4. Map all components:
   - Activities → future Compose screens
   - Services → WorkManager candidates?
   - BroadcastReceivers → keep or replace with Flow?
   - ContentProviders → keep or replace with Room?
5. Detect intent-filters for deep links
6. **Output:** Propose Clean Architecture project structure

## Project Structure Template

```
app/src/main/java/com/package/app/
├── App.kt                        # Application class
├── di/                           # Hilt modules
│   ├── AppModule.kt
│   ├── NetworkModule.kt
│   └── DatabaseModule.kt
├── data/                         # Data Layer
│   ├── remote/
│   │   ├── api/                  # Retrofit interfaces
│   │   ├── dto/                  # Data Transfer Objects
│   │   └── interceptor/          # OkHttp interceptors
│   ├── local/
│   │   ├── db/                   # Room database
│   │   ├── dao/                  # Room DAOs
│   │   ├── entity/               # Room entities
│   │   └── datastore/            # DataStore preferences
│   └── repository/               # Repository implementations
├── domain/                       # Domain Layer
│   ├── model/                    # Business models
│   ├── repository/               # Repository interfaces
│   └── usecase/                  # Use cases
├── presentation/                 # Presentation Layer
│   ├── navigation/               # NavGraph + Routes
│   ├── theme/                    # Material 3 Theme
│   ├── components/               # Reusable Compose components
│   └── screens/                  # Feature screens
│       ├── splash/
│       ├── home/
│       └── ...
└── util/                         # Extensions, helpers
```
