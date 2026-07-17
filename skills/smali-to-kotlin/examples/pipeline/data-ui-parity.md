# Step 2: Data Layer Reconstruction 💾

**Input:** Smali/Java code for API endpoints, JSON models, database queries.

## Tasks

### 1. Models: POJO/Smali → Kotlin data class
- Use `@Serializable` (kotlinx.serialization) or `@JsonClass` (Moshi)
- Preserve JSON field names with `@SerialName`

### 2. API Layer
- Extract base URL, endpoints, headers from Smali
- Create Retrofit `@GET/@POST` interfaces
- Identify auth patterns (token, API key, custom headers)

### 3. Local Storage
- SQLite queries → Room entities + DAOs
- SharedPreferences keys → DataStore schema

### 4. Repository
- Create interface in `domain/repository/`
- Implement in `data/repository/`
- Use Flow for reactive data streams

## Smali Reading Tips

```
Finding API base URL:
  const-string → "https://" or "http://"
  .field → BASE_URL or API_URL

Finding endpoints:
  StringBuilder + append patterns
  Annotation patterns (@GET, @POST in obfuscated form)

Finding JSON parsing:
  JSONObject, JSONArray usage
  Gson.fromJson / TypeToken patterns
```

---

# Step 3: Core Logic & Utils Reconstruction 🧮

**Input:** Smali for encryption, hashing, time formatting, custom utils.

## Tasks

1. Translate mathematical/encryption logic from Smali → Kotlin
   - Preserve exact input/output signatures (server compatibility)
   - Use `object` for stateless utils, extension functions for type-specific
2. Map encoding patterns:
   - MD5/SHA hashing → `MessageDigest`
   - AES/DES encryption → `javax.crypto.Cipher`
   - Base64 → `android.util.Base64` or `java.util.Base64`
   - Custom obfuscation → reverse step-by-step
3. **Verification:** Unit tests comparing output with original app

> ⚠️ Encryption/hashing MUST produce identical output. Any mismatch breaks server communication.

---

# Step 4: UI & ViewModel Reconstruction (Per Screen) 🎨

**Input:** `layout_xxx.xml` + Smali for Activity/Fragment.

## XML → Compose Migration

```
LinearLayout (vertical)     → Column
LinearLayout (horizontal)   → Row
FrameLayout                 → Box
RelativeLayout              → Box with alignment
RecyclerView                → LazyColumn / LazyGrid
ScrollView                  → verticalScroll modifier
ImageView                   → Image / AsyncImage (Coil)
TextView                    → Text
EditText                    → TextField / OutlinedTextField
Button                      → Button / TextButton
ProgressBar                 → CircularProgressIndicator
CardView                    → Card (Material 3)
Toolbar/ActionBar           → TopAppBar (Material 3)
BottomNavigationView        → NavigationBar (Material 3)
TabLayout + ViewPager       → TabRow + HorizontalPager
SwipeRefreshLayout          → pullRefresh modifier
```

## ViewModel Pattern

```kotlin
sealed interface ScreenUiState {
    data object Loading : ScreenUiState
    data class Success(val data: ScreenData) : ScreenUiState
    data class Error(val message: String) : ScreenUiState
}
```

- Expose via `StateFlow` from ViewModel
- Handle one-time events via `SharedFlow` (navigation, snackbar)

---

# Step 5-6: SDK Integration + Parity Check

## SDK Integration

1. Keep `.so` files in `jniLibs/`, declare `external fun` matching C/C++ signatures
2. Add latest stable versions to `build.gradle.kts`
3. Use Version Catalogs (`libs.versions.toml`)
4. Initialize in `@HiltAndroidApp Application` class

## Parity Check (Per-Module)

1. **Branch Coverage:** All `if-else`, `when`, `try-catch` paths from Smali
2. **API Parity:** Same request/response formats
3. **Data Parity:** Local storage read/write matches
4. **UI Parity:** Screen-by-screen comparison
5. **Performance:** R8 rules, Compose stability, coroutine scope management
