---
name: reverse-apk
description: >-
  Phase-1 APK product & technical mapper. Turns a decompiled Android APK into a
  product map, screen inventory, resource inventory and technical findings — then
  scores every screen/flow for rebuild priority. This is ANALYSIS & MAPPING ONLY:
  it does NOT rebuild, refactor, or copy resources. Use it before any rebuild so
  the team behaves like a product owner, not a copy-paste porter.
author: Antigravity Team
version: 1.1.0
license: Apache-2.0
trigger: conditional
activation_keywords:
  - "/reverse-apk"
  - "reverse apk"
  - "phục hồi app"
  - "phục hồi apk"
  - "bản đồ apk"
  - "app map"
  - "screen inventory"
  - "rebuild priority"
  - "map apk"
  - "lập bản đồ apk"
  - "phân tích sản phẩm apk"
priority: high
platform: android
related_skills:
  - android-re-analyzer   # decompile + API/call-flow extraction
  - smali-to-kotlin       # actual rebuild
  - gitnexus-intelligence # node graph / impact analysis
---

# 🗺️ Reverse APK — Product & Rebuild Mapper

> **Mantra:** `APK → hiểu sản phẩm → tạo bản đồ → ưu tiên rebuild`
> **Philosophy:** "Map before you move." Bước 1 là **phân tích + lập bản đồ**, CHƯA rebuild, CHƯA copy hàng loạt.

---

## ⚠️ SCOPE CLARITY

| This skill DOES | This skill DOES NOT |
|-----------------|---------------------|
| Map screens, flows, entry points | Rebuild the app |
| Inventory resources (layout/string/drawable/color) | Copy resources into a new project |
| Inventory technical surface (network/auth/storage/SDK) | Refactor decompiled code |
| Score & order screens for rebuild | Rebuild theo folder decompile |
| Produce 4 canonical map files | Trust decompiled code 100% |

**Cần decompile / trích xuất API** → delegate `android-re-analyzer`.
**Cần rebuild thật** → delegate `smali-to-kotlin` SAU KHI map xong.

---

## 🎯 ROLE DEFINITION

Khi skill active, agent hành xử như **Product Owner + Reverse Engineer**, không phải người đi copy source:

> Câu hỏi đúng KHÔNG phải "File nào copy trước?"
> Mà là: **"Màn hình nào tồn tại? Nó phục vụ flow nào? Nó dùng tài nguyên/API nào?"**

---

## 📤 OUTPUT CONTRACT (4 file bắt buộc)

Sinh ra trong `<APK_DIR>/_re_map/`:

```text
01_APP_MAP.md            # User flows, screen hierarchy, navigation, entry points
02_SCREEN_INVENTORY.md   # Mỗi screen 1 block (purpose, resources, API, states, priority)
03_RESOURCE_INVENTORY.md # Layouts, strings, colors, styles, drawables, assets, native libs
04_TECHNICAL_FINDINGS.md # Architecture, networking, auth, storage, SDK, security-sensitive
```

Raw extraction (máy đọc) nằm ở `<APK_DIR>/_re_map/raw/`.

---

## 📦 SUPPORTING FILES

Skill này đi kèm script + template, không chỉ là hướng dẫn đọc tay:

```text
scripts/static-inventory.sh # extract raw manifest/resource/sdk/API inventory
scripts/scaffold-maps.sh   # create the 4 canonical map files from templates
scripts/build-graph.sh     # best-effort Graphviz activity navigation graph
templates/*.md             # canonical output structure
```

Luôn ưu tiên chạy script trước, rồi mới đọc/suy luận từ raw output. Nếu raw output thiếu dữ kiện,
ghi rõ "unknown / needs manual verification" thay vì đoán.

---

## 🔄 WORKFLOW — 6 PHASES

### Phase 1 — Static Analysis (tự động hoá)
Nếu chưa có APK gốc, có thể tải nhanh trước bằng `justapk`:

```bash
# 1) Tải trực tiếp APK bằng package name
justapk download <package_name> -o <download_dir>

# 2) Merge/collapse split APK (xapk/aab/apk bundle), sau đó trỏ vào thư mục merge
justapk convert <downloaded_file.xapk> -o <APK_DIR>
```

Sau đó chạy script để bóc inventory thô, KHÔNG đọc tay từng file:

```bash
bash scripts/static-inventory.sh <APK_DIR>
```

Script bóc: Manifest, activities/services/receivers/providers, permissions, deep links,
exported components, launcher, layouts, strings/colors/styles, drawables, assets,
native libs, SDK signatures, API endpoints, storage hints (db/SharedPreferences).
→ Ghi vào `<APK_DIR>/_re_map/raw/`.

> ⚠️ Nếu APK **chưa** decompile → gọi `android-re-analyzer` (`/decompile`) trước.

### Phase 2 — Scaffold canonical maps
Tạo 4 file map từ template, không overwrite nếu đã tồn tại:

```bash
bash scripts/scaffold-maps.sh <APK_DIR>
```

Sau đó điền từng file bằng evidence từ `_re_map/raw/`.

### Phase 3 — Product Map → `01_APP_MAP.md`
Từ raw inventory, dựng bản đồ sản phẩm:
`User flows · Screen hierarchy · Entry points · Navigation paths · Core actions ·
Error/Empty states · Payment/Auth states`.
Group layouts thành screens (1 screen có thể gồm nhiều layout/fragment).

### Phase 4 — Navigation graph (khuyến nghị)
Chạy graph builder để có bản đồ activity best-effort:

```bash
bash scripts/build-graph.sh <APK_DIR>
```

Output: `<APK_DIR>/_re_map/nav-graph.dot`. Nếu có Graphviz:

```bash
dot -Tpng <APK_DIR>/_re_map/nav-graph.dot -o <APK_DIR>/_re_map/nav-graph.png
```

### Phase 5 — Technical Map → `04_TECHNICAL_FINDINGS.md`
`Architecture clues · Networking · Auth/session · Storage · Background jobs ·
Push · Analytics · Crash reporting · 3rd-party SDK · Security-sensitive logic`.

### Phase 6 — Rebuild Priority → điền vào `02_SCREEN_INVENTORY.md`
Chấm điểm mỗi screen/flow (1–5) trên 5 trục:
`Business value · Technical dependency · Resource readiness · Risk level · Rebuild complexity`.
Thứ tự ưu tiên mặc định:

```text
App launch → Auth → Home → Core flow → Profile/Settings → Edge cases
```

---

## 🧱 SCREEN BLOCK FORMAT (dùng trong 02_SCREEN_INVENTORY.md)

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
State: Loading / Empty / Error / Success
Rebuild priority:
Notes:
```

---

## 🧰 AWKit / GitNexus integration (tuỳ chọn nhưng khuyến nghị)

- Sau khi map, dùng **GitNexus** để vẽ graph dạng nodes cho dễ hiểu:
  - `npx gitnexus analyze` để index decompiled source.
  - `gitnexus-intelligence` / `gitnexus_query` để truy navigation & call edges.
- Script `scripts/build-graph.sh` xuất `nav-graph.dot` (Graphviz) từ deep links + activity edges.

## 🔎 EVIDENCE RULES

- Mỗi finding kỹ thuật nên trỏ về raw file hoặc smali/resource path cụ thể.
- Không kết luận "app dùng X" chỉ vì thấy package vendor; ghi `likely` nếu chỉ có SDK signature.
- API/auth/storage là vùng rủi ro: ghi rõ evidence path và manual verification item.
- Decompiled control flow có thể sai; priority rebuild dựa trên product flow + evidence, không dựa trên folder tree.

---

## ✅ EXIT CHECKLIST

```text
[ ] _re_map/raw/ đã có inventory thô
[ ] 4 canonical map files đã scaffold từ templates
[ ] nav-graph.dot đã tạo nếu có smali activity edges
[ ] 01_APP_MAP.md: navigation map đầy đủ entry/exit
[ ] 02_SCREEN_INVENTORY.md: mọi screen có block + rebuild priority
[ ] 03_RESOURCE_INVENTORY.md: layout/string/color/drawable/asset/native libs
[ ] 04_TECHNICAL_FINDINGS.md: network/auth/storage/SDK/security
[ ] Rebuild priority list đã sắp xếp → bàn giao cho smali-to-kotlin
```

## 🚫 RISKS (tránh ngay từ đầu)

- Copy toàn bộ resource vào project mới khi chưa hiểu.
- Refactor / rebuild khi chưa map xong.
- Rebuild theo folder decompile.
- Tin 100% mã decompile.
- Bỏ qua permissions/services/receivers, quên mapping API/backend.
