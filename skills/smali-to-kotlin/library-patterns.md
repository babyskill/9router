# 📦 Library Detection Patterns

> Reference database for Step 0 (Library Scanner).
> Agent uses these patterns to identify third-party libraries from Smali package structure.

---

## 🟢 Network & API

| Package Pattern | Library | Latest Replacement | Action |
|----------------|---------|-------------------|--------|
| `com/squareup/retrofit2` | Retrofit 2 | Keep (current) | Add to build.gradle |
| `com/squareup/okhttp3` | OkHttp 3 | Keep (current) | Add to build.gradle |
| `com/android/volley` | Volley | Retrofit + OkHttp | Replace |
| `com/squareup/okhttp` | OkHttp 2 | OkHttp 4 | Upgrade |
| `com/loopj/android` | AsyncHttpClient | Retrofit | Replace |
| `org/apache/http` | Apache HTTP | OkHttp | Replace |
| `com/squareup/moshi` | Moshi | Keep (current) | Add to build.gradle |
| `com/google/gson` | Gson | kotlinx.serialization | Evaluate |

---

## 🟡 Image Loading

| Package Pattern | Library | Latest Replacement | Action |
|----------------|---------|-------------------|--------|
| `com/bumptech/glide` | Glide | Coil (Compose-native) | Evaluate |
| `com/squareup/picasso` | Picasso | Coil | Replace |
| `com/facebook/fresco` | Fresco | Coil | Replace |
| `com/nostra13/universalimageloader` | UIL | Coil | Replace |
| `io/coil` | Coil | Keep (current) | Add to build.gradle |

---

## 🔵 Reactive Programming

| Package Pattern | Library | Latest Replacement | Action |
|----------------|---------|-------------------|--------|
| `io/reactivex/rxjava3` | RxJava 3 | Coroutines + Flow | Gradual migrate |
| `io/reactivex/rxjava2` | RxJava 2 | Coroutines + Flow | Replace |
| `io/reactivex` | RxJava 1 | Coroutines + Flow | Replace |
| `io/reactivex/rxandroid` | RxAndroid | Dispatchers.Main | Replace |

---

## 🟠 Dependency Injection

| Package Pattern | Library | Latest Replacement | Action |
|----------------|---------|-------------------|--------|
| `dagger/hilt` | Hilt | Keep (current) | Add to build.gradle |
| `com/google/dagger` | Dagger 2 | Hilt | Upgrade |
| `org/koin` | Koin | Keep or Hilt | Evaluate |
| `toothpick` | Toothpick | Hilt | Replace |

---

## 🟣 Firebase & Google

| Package Pattern | Library | Action |
|----------------|---------|--------|
| `com/google/firebase/analytics` | Firebase Analytics | Add latest |
| `com/google/firebase/crashlytics` | Crashlytics | Add latest |
| `com/google/firebase/messaging` | FCM | Add latest |
| `com/google/firebase/auth` | Firebase Auth | Add latest |
| `com/google/firebase/firestore` | Firestore | Add latest |
| `com/google/firebase/database` | Realtime DB | Add latest |
| `com/google/firebase/storage` | Cloud Storage | Add latest |
| `com/google/firebase/config` | Remote Config | Add latest |
| `com/google/android/gms/ads` | AdMob | Add latest |
| `com/google/android/gms/auth` | Google Sign-In | Add latest |
| `com/google/android/gms/maps` | Google Maps | Add latest |
| `com/google/android/gms/location` | Location Services | Add latest |
| `com/google/android/play` | Play Core | Add latest |

---

## 🔴 Social SDKs

| Package Pattern | Library | Action |
|----------------|---------|--------|
| `com/facebook/login` | Facebook Login | Add latest |
| `com/facebook/share` | Facebook Share | Add latest |
| `com/facebook/appevents` | Facebook Analytics | Add latest |
| `com/twitter` | Twitter SDK | Evaluate (deprecated?) |
| `com/kakao` | Kakao SDK | Add latest |
| `com/linecorp` | LINE SDK | Add latest |

---

## 🟤 UI & Animation

| Package Pattern | Library | Latest Replacement | Action |
|----------------|---------|-------------------|--------|
| `com/airbnb/lottie` | Lottie | Keep (has Compose support) | Add to build.gradle |
| `com/github/bumptech/glide` | Glide Transformations | Compose modifiers | Evaluate |
| `com/makeramen/roundedimageview` | RoundedImageView | Compose `clip(CircleShape)` | Replace |
| `de/hdodenhof/circleimageview` | CircleImageView | Compose `clip(CircleShape)` | Replace |
| `com/github/chrisbanes` | PhotoView | Compose zoomable | Replace |
| `com/google/android/material` | Material Components | Material 3 (Compose) | Upgrade |
| `com/jakewharton/butterknife` | Butterknife | Not needed (Compose) | Remove |
| `androidx/viewpager2` | ViewPager2 | HorizontalPager (Compose) | Replace |
| `androidx/cardview` | CardView | Card (Material 3 Compose) | Replace |
| `androidx/recyclerview` | RecyclerView | LazyColumn/LazyGrid | Replace |
| `androidx/swiperefreshlayout` | SwipeRefresh | pullRefresh modifier | Replace |
| `com/github/PhilJay/MPAndroidChart` | MPAndroidChart | Vico / Compose Charts | Evaluate |

---

## ⚪ Database & Storage

| Package Pattern | Library | Latest Replacement | Action |
|----------------|---------|-------------------|--------|
| `androidx/room` | Room | Keep (current) | Add to build.gradle |
| `io/realm` | Realm | Room | Evaluate |
| `net/sqlcipher` | SQLCipher | Room + encrypted | Keep |
| `com/google/protobuf` | Protocol Buffers | Keep | Add to build.gradle |
| `com/tencent/mmkv` | MMKV | DataStore | Evaluate |

---

## ⚫ Utility

| Package Pattern | Library | Latest Replacement | Action |
|----------------|---------|-------------------|--------|
| `com/jakewharton/timber` | Timber | Keep (current) | Add to build.gradle |
| `org/greenrobot/eventbus` | EventBus | SharedFlow | Replace |
| `com/google/zxing` | ZXing (QR/Barcode) | ML Kit Barcode | Evaluate |
| `com/journeyapps/barcodescanner` | ZXing Android | ML Kit Barcode | Evaluate |
| `com/github/permissions` | Various permission libs | Accompanist Permissions | Replace |
| `pub/devrel/easypermissions` | EasyPermissions | Accompanist Permissions | Replace |
| `org/jsoup` | Jsoup | Keep (HTML parsing) | Add to build.gradle |
| `com/google/android/exoplayer2` | ExoPlayer | Media3 ExoPlayer | Upgrade |
| `androidx/media3` | Media3 | Keep (current) | Add to build.gradle |

---

## 🔐 Security & Encryption

| Package Pattern | Library | Action |
|----------------|---------|--------|
| `com/scottyab/rootbeer` | RootBeer | Evaluate |
| `io/jsonwebtoken` | JJWT | Keep |
| `org/bouncycastle` | BouncyCastle | Keep |
| `net/sqlcipher` | SQLCipher | Keep |

---

## 🔍 Detection Strategy

### Step 1: Directory Scan
```bash
# List all top-level smali packages
ls -d smali/*/
ls -d smali_classes*/*/   # multi-dex apps

# Find specific library patterns
find smali/ -maxdepth 3 -type d | sort
```

### Step 2: Classify Each Package
```
For each detected package:
  1. Match against patterns above
  2. If MATCH → categorize (Keep / Replace / Upgrade / Evaluate)
  3. If NO MATCH → mark as "Unknown — investigate"
  4. If app's own package → mark as "App Code — rebuild in Kotlin"
```

### Step 3: Check Native Libraries
```bash
# List native libraries
ls lib/*/
file lib/arm64-v8a/*.so   # identify library type

# Common native libs:
libfb*.so          → Facebook SDK
libreact*.so       → React Native
libflutter*.so     → Flutter engine
libhermes*.so      → Hermes JS engine (React Native)
libsqlcipher*.so   → SQLCipher encrypted DB
libmmkv*.so        → MMKV storage
```

### Step 4: Generate Report
Use the template from SKILL.md Step 0 output format.

---

*library-patterns v1.0.0 — Reference database for APK library detection*
