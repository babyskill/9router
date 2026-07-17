# Modern Tech Stack (Mandatory)

## Core

| Layer | Technology | Replaces |
|-------|-----------|----------|
| **UI** | Jetpack Compose + Material 3 | XML Layouts + findViewById |
| **State** | StateFlow + ViewModel | LiveData / AsyncTask |
| **Navigation** | Navigation Compose | Intent-based navigation |
| **DI** | Hilt (Dagger) | Manual DI / ServiceLocator |

## Data Layer

| Purpose | Technology | Replaces |
|---------|-----------|----------|
| **Network** | Retrofit + OkHttp + Kotlin Serialization | Volley / HttpURLConnection |
| **Local DB** | Room Database | Raw SQLite / SQLiteOpenHelper |
| **Preferences** | DataStore (Proto/Preferences) | SharedPreferences |
| **Image Loading** | Coil | Picasso / Glide (evaluate) |
| **Async** | Kotlin Coroutines + Flow | AsyncTask / Handler / Thread |

## Observability

| Purpose | Technology |
|---------|-----------|
| **Crash** | Firebase Crashlytics |
| **Analytics** | Firebase Analytics |
| **Logging** | Timber |

## Replacements Table (Legacy → Modern)

```yaml
always_replace:
  AsyncTask: "Coroutines (suspend fun / Flow)"
  Volley: "Retrofit + OkHttp"
  HttpURLConnection: "Retrofit + OkHttp"
  Handler/Looper: "Coroutines (Dispatchers.Main)"
  BroadcastReceiver (local): "Flow / EventBus → SharedFlow"
  SharedPreferences: "DataStore"
  SQLiteOpenHelper: "Room"
  ListView/GridView: "LazyColumn/LazyGrid (Compose)"
  findViewById: "Compose state"
  Gson: "Kotlin Serialization (kotlinx.serialization)"
  
evaluate_before_replacing:
  Glide: "Keep if deeply integrated, otherwise → Coil"
  RxJava: "Migrate to Coroutines + Flow (gradual)"
  EventBus: "Replace with SharedFlow"
  Butter Knife: "Not needed in Compose"
  Dagger 2: "Upgrade to Hilt"

keep_as_is:
  - "OkHttp (still current)"
  - "Retrofit (still current)"
  - "Firebase SDKs (use latest version)"
  - "Google Play Services"
  - "Native .so libraries (JNI)"
```
