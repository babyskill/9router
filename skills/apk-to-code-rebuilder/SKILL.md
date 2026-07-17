---
name: apk-to-code-rebuilder
description: >-
  Reconstructs and rebuilds modern application source code from reverse-engineered APK 
  resources, Smali code, and compiled specification documentation. Supports code generation 
  into any target programming language or framework (Kotlin, Swift, Flutter, React Native, etc.).
author: Antigravity Team
version: 1.0.0
trigger: conditional
activation_keywords:
  - "code from apk"
  - "rebuild apk code"
  - "recode apk"
  - "generate code from smali"
  - "apk to kotlin"
  - "apk to flutter"
  - "apk to swift"
  - "apk to react-native"
  - "rebuild app"
priority: high
platform: multiplatform
---

# 🛠️ APK-to-Code Rebuilder Skill

> **Purpose:** Translate decompiled APK resources, Smali logic, and specification docs (`docs/`) into modern, clean, production-ready source code in any target language/framework.
> **Philosophy:** "Specification-First, Code-Second" — Reconstruct logic based on design specs and behavioral mapping, not line-by-line translation.

---

## ⚠️ SCOPE CLARITY

| This skill DOES | This skill DOES NOT |
|-----------------|---------------------|
| Scaffold new modular projects in any framework | Clone obsolete, messy architecture from Smali |
| Translate assets/XML layouts to modern UI code | Automatically compile Smali directly to Kotlin/Swift 1-1 |
| Map extracted API contracts to network clients | Hardcode legacy security secrets or mock keys |
| Re-implement state machines & business rules | Work without existing spec documentation (`docs/`) |
| Support clean, decoupled architectures | Implement black-box code without parity tests |

---

## 🎯 ROLE DEFINITION

When this skill is active, the agent becomes:

> **Senior Multi-Platform Software Engineer & System Architect**
> - Expert in clean code patterns (MVVM, Clean Architecture, Bloc, Redux, Repository pattern).
> - Fluent in multiple language idioms (Kotlin, Swift, Dart, TypeScript, JavaScript).
> - Skilled at reading business spec catalogs, Smali files, and layouts to generate corresponding idiomatic source code.
> - Rigorous about error handling, accessibility, and offline state consistency.

---

## 🛠️ PREREQUISITES

- **Target SDK & Tools:** Cài đặt sẵn compiler/CLI cho stack được chọn (e.g., `npx`, `flutter`, `cargo`, `gradle`, `npm`).
- **Input Specifications:** Toàn bộ tài liệu phân tích từ Giai đoạn 1-4 của `android-re-analyzer` phải có sẵn trong thư mục `docs/`.
- **Workflow Dependency:** Nếu người dùng kích hoạt `apk-to-code-rebuilder` (hoặc `apk to code`) mà thư mục `docs/` chưa có đầy đủ tài liệu đặc tả, **bắt buộc** phải kích hoạt skill `android-re-analyzer` (từ khóa kích hoạt: `apk analytics`) để thực hiện dịch ngược và tạo tài liệu trước.

---

## 📋 EXECUTION PIPELINE (5 Phases)

> **Rule:** Luôn xác nhận Tech Stack và cấu trúc thư mục mục tiêu với người dùng trước khi bắt đầu sinh code.
> **Rule:** Tuân thủ nguyên tắc Ponytail (đơn giản hóa tối đa, tránh trừu tượng hóa dư thừa) trừ khi có yêu cầu đặc thù.

### Phase 1: Context Absorption & Tech Stack Target
1. **Đọc Đặc tả nghiệp vụ:** Nạp toàn bộ thông tin từ thư mục `docs/` để hiểu rõ PRD, API contract, Domain model và Business rules.
2. **Xác nhận Target Stack:** Yêu cầu người dùng cung cấp/xác nhận Ngôn ngữ, Framework, Kiến trúc mong muốn (ví dụ: Flutter với Bloc/Dio, Kotlin với Jetpack Compose/Retrofit, v.v.).
3. **Phân tích Kiến trúc Mới:** Thiết kế Module boundary và cấu trúc thư mục dự án dựa trên `docs/21-system-architecture.md`.

---

### Phase 2: Scaffolding & Core Infrastructure
1. **Khởi tạo Dự án:** Chạy lệnh CLI để khởi tạo cấu trúc thư mục cơ bản của framework mục tiêu.
2. **Cài đặt Network Client:**
   - Triển khai HTTP Client (Retrofit, Ktor, Dio, Axios) dựa trên đặc tả tại `docs/13-api-contract-catalog.md`.
   - Thiết lập các interceptors để tự động chèn header, logging, và refresh token.
3. **Cài đặt Local Database & Cache:**
   - Thiết lập ORM/Database (Room, SQLite, Hive, Realm) dựa trên `docs/14-local-data-catalog.md`.
   - Viết các Migration scripts (nếu có yêu cầu di chuyển dữ liệu cũ).
4. **Triển khai Dependency Injection (DI):** Cấu hình DI container (Hilt, Dagger, Koin, GetIt, NestJS DI) để quản lý phụ thuộc sạch.

---

### Phase 3: UI Shell & Design System Implementation
1. **Cấu hình Design System:**
   - Tạo các file cấu hình theme/colors/spacing/typography dựa trên `docs/24-design-system-specification.md`.
2. **Xây dựng UI Components:** Triển khai các component dùng chung (Buttons, Inputs, Cards, Loaders, Dialogs) theo component spec.
3. **Dựng các màn hình (Screen Layouts):**
   - Viết mã nguồn cho các màn hình dựa trên layouts XML thô của APK cũ và specs tại `docs/06-ui-specification.md`.
   - Bố trí các UI states (*Initial, Loading, Content, Empty, Error, Success*) theo hướng dẫn.
4. **Mock Tạm thời:** Sử dụng Mock data cho các API/DB queries để kiểm tra toàn bộ luồng điều hướng (Navigation).

---

### Phase 4: Business Logic & State Management
1. **Xây dựng Domain Entities & Mappers:**
   - Viết các lớp Domain Entity sạch, độc lập với Framework dựa trên `docs/11-domain-model.md`.
   - Viết các Mappers để chuyển đổi dữ liệu từ API Response -> Domain -> UI Model.
2. **Triển khai Business Rules & State Machine:**
   - Dịch các quy tắc nghiệp vụ trong `docs/16-business-rule-catalog.md` thành logic xử lý thực tế (Use Cases, Interactors, Reducers).
   - Triển khai State Machine quản lý luồng dữ liệu cho từng màn hình phức tạp dựa trên `docs/12-state-machines.md`.
3. **Tích hợp Data Layer:** Thay thế Mock data bằng cách kết nối Use Cases với Repository và gọi API/DB thực tế.

---

### Phase 5: Parity Verification & Testing
1. **Kiểm thử đối chiếu (Parity Testing):**
   - Viết Unit Tests kiểm tra tính đúng đắn của logic tính toán, parsing và state transition.
   - Viết UI Integration Tests chạy qua các scenarios đối chiếu hành vi được đặc tả tại `docs/27-behavioral-parity-test-cases.md`.
2. **Review Trực quan Giao diện (UI Visual Review):**
   - **Bắt buộc:** Đối chiếu trực tiếp giao diện ứng dụng mới với các hình ảnh thiết kế và ảnh chụp gốc lưu tại thư mục `docs/design/` cho từng màn hình và mọi trạng thái (Initial, Empty, Error, Loading, Success...) để đảm bảo sự đồng bộ chính xác về mặt trực quan và bố cục UI.
3. **Xác thực API & DB:** Đảm bảo toàn bộ payload request/response của client mới tương thích 100% với hệ thống backend cũ (nếu có yêu cầu).
4. **Đóng gói & Bàn giao:** Build ứng dụng kiểm tra lỗi biên dịch, chuẩn bị tài liệu hướng dẫn vận hành và bàn giao mã nguồn sạch cho người dùng.

---

## 🚫 ANTI-PATTERNS

```yaml
never_do:
  - Copy mã nguồn Java dịch ngược thô từ jadx rồi paste vào dự án Kotlin/Swift mới.
  - Sử dụng các hardcoded api keys hoặc credentials lấy được từ mã nguồn cũ.
  - Bỏ qua các ngoại lệ (catch rỗng) hoặc không xử lý lỗi kết nối mạng/offline.
  - Phát triển giao diện trực tiếp bằng logic nghiệp vụ (mất tính phân lớp).
  - Tự động thay đổi hành vi nghiệp vụ của app mà không có ghi nhận trong PRD cải tiến.
```

---
*apk-to-code-rebuilder v1.0.0 — Reconstructed for Antigravity*
