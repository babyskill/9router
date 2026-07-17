# 02 — Screen Inventory & Rebuild Priority

> One block per screen. Group multiple layouts/fragments under the screen they serve.
> Priority axes scored 1–5: Business value · Technical dependency · Resource readiness · Risk · Rebuild complexity.

## Rebuild priority list (fill last, sort by score)
| Rank | Screen | Biz | Dep | ResReady | Risk | Complexity | Order bucket |
|------|--------|-----|-----|----------|------|------------|--------------|
| 1 | | | | | | | App launch |
| 2 | | | | | | | Auth |
| 3 | | | | | | | Home |
| 4 | | | | | | | Core flow |
| 5 | | | | | | | Settings |
| 6 | | | | | | | Edge cases |

> Default order: App launch → Auth → Home → Core flow → Profile/Settings → Edge cases.

---

## Screen blocks

### <Screen name>
```text
Screen name:
Purpose:
User emotion:
Entry point:
Exit paths:
Layout resource:
Drawable dependencies:
String dependencies:
API dependencies:
State:
- Loading:
- Empty:
- Error:
- Success:
Rebuild priority:
Notes:
```

### <Screen name>
```text
Screen name:
Purpose:
User emotion:
Entry point:
Exit paths:
Layout resource:
Drawable dependencies:
String dependencies:
API dependencies:
State:
- Loading:
- Empty:
- Error:
- Success:
Rebuild priority:
Notes:
```
