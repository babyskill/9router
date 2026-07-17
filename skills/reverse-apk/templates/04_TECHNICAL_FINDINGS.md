# 04 — Technical Findings

> Technical map of the app. Feed this to `smali-to-kotlin` before rebuild.
> Evidence-based: cite smali path / file. Do NOT trust decompiled code 100%.

## Architecture clues
- UI toolkit (Views / Compose / Flutter / Unity):
- Pattern (MVVM / MVP / MVI):
- DI (Dagger / Hilt / Koin / none):
- Module/package layout:

## Networking
- Client (Retrofit / OkHttp / Volley / Ktor):
- Base URL(s) — see `raw/41_hosts.txt`:
- Auth headers / interceptors:
- Endpoints (see `raw/40_urls.txt`):

## Auth / session
- Mechanism (token / OAuth / Firebase Auth):
- Token storage:
- Refresh logic:

## Storage
- See `raw/50_storage_hints.txt`
- SharedPreferences keys:
- Database (Room / SQLite / Realm):
- DataStore:

## Background work
- WorkManager / JobScheduler / Services / AlarmManager:
- Receivers (see `raw/12_receivers.txt`):

## Third-party SDKs
_See `raw/31_known_sdks.txt` & `raw/30_sdk_package_signatures.txt`._
| SDK | Purpose | Replaceable? |
|-----|---------|--------------|
| | | |

## Telemetry
- Analytics:
- Crash reporting:
- Push (FCM / OneSignal):

## Monetization
- Ads SDK:
- Billing / IAP / RevenueCat:

## Permissions (see `raw/14_permissions.txt`)
- Sensitive permissions & why:

## Security-sensitive logic
- Root/tamper detection:
- Encryption / key storage:
- Obfuscation level (ProGuard/R8):
- ⚠️ Items needing manual verification (decompile may be wrong):

## Rebuild risks
- [ ]
