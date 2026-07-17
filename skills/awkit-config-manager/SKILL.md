---
name: awkit-config-manager
description: Quản lý, cấu hình và tinh chỉnh các vai trò mô hình (orchestrator, reasoning, runner, audit) cùng model profiles (CLI, params, capabilities) trong AWKit.
---

# SKILL: awkit-config-manager

## Purpose
Hướng dẫn các AI agent cách đọc, cập nhật và quản lý cấu hình phân vai trò mô hình động cùng thông số năng lực (model profiles) trong hệ thống AWKit một cách chính xác.

---

## 1. Vị trí Lưu trữ Cấu hình
Khi cần kiểm tra trực tiếp hoặc thực hiện thay đổi cấu trúc dữ liệu lớn, hãy tìm đến các tệp cấu hình vật lý sau:
1. **Global Configuration File**: `~/.awkit/config.json` (Lưu trữ cài đặt âm thanh, timeouts, token OAuth, và phân vai trò models global).
2. **Global Model Profiles Database**: `~/.awkit/models.json` (Lưu trữ chi phí, tốc độ, chất lượng, vision capability, đường dẫn CLI, và danh sách params của từng mô hình).
3. **Local Project Configuration**: `.project-identity` tại thư mục làm việc hiện tại (Ghi đè cấu hình gán vai trò models và settings cho riêng project đó nếu chạy lệnh kèm cờ `--local`).

---

## 2. Các Lệnh CLI Quản lý Cấu hình
Sử dụng công cụ `run_command` để thực thi các lệnh quản lý cấu hình của AWKit. Cấm sửa đổi trực tiếp các tệp cấu hình nếu CLI có hỗ trợ tương đương.

### 2.1. Đọc và Liệt kê Cấu hình
- **Liệt kê toàn bộ mô hình và alias đăng ký trong AWKit registry (offline/cached/phản hồi nhanh)**:
  ```bash
  awkit model
  ```
  *(Hiển thị bảng Model ID, aliases, CLI binary, status khả dụng và call pattern từ file cache cấu hình cục bộ).*

- **Kiểm tra trạng thái online thực tế và hạn ngạch quota của các IDE (agy, claude, codex, qwen)**:
  ```bash
  awkit model list
  ```
  *(Truy vấn trực tiếp các CLI con để lấy thông tin hoạt động và hạn ngạch thực tế).*

- **Liệt kê toàn bộ cấu hình settings và bảng vai trò mô hình hiện tại**:
  ```bash
  awkit config list [--local]
  ```
  
- **Xem danh sách chi tiết tất cả Model Profiles & CLI Status qua config**:
  ```bash
  awkit config models
  ```

- **Đọc thông số năng lực chi tiết của một mô hình**:
  ```bash
  awkit config model-profile <model_id>
  ```
  *Ví dụ: `awkit config model-profile qwen` (Hiển thị Display Name, CLI Binary, Params, và Capabilities).*

---

### 2.2. Thiết lập Vai trò Mô hình (Model Roles)
Các vai trò khả dụng bao gồm: `orchestrator`, `reasoning`, `runner`, `audit`.

- **Cập nhật danh sách ưu tiên vai trò (Global)**:
  ```bash
  awkit config models.<role> "<model_id_1>, <model_id_2>"
  ```
  *Ví dụ: `awkit config models.runner "qwen, deepseek, spark"`.*

- **Cập nhật danh sách ưu tiên vai trò cho riêng dự án hiện tại (Local)**:
  ```bash
  awkit config models.<role> "<model_id_1>, <model_id_2>" --local
  ```

---

### 2.3. Cập nhật Model Profiles cụ thể
- **Thay đổi CLI Binary của mô hình**:
  ```bash
  awkit config model-profile <model_id> cli "<binary_or_path>"
  ```
  *Ví dụ: `awkit config model-profile qwen cli "/usr/local/bin/qwen-coder"`.*

- **Thay đổi Tham số Params CLI**:
  ```bash
  awkit config model-profile <model_id> params "<arg1>,<arg2>,<arg3>"
  ```
  *Ví dụ: `awkit config model-profile deepseek params "-p,{prompt}"`.*

- **Thiết lập năng lực Vision**:
  ```bash
  awkit config model-profile <model_id> vision <true|false>
  ```

- **Thay đổi chỉ số Capabilities (Cost, Speed, Quality: từ 1 đến 5)**:
  ```bash
  awkit config model-profile <model_id> <cost|speed|quality> <value>
  ```

- **Xóa một cấu hình mô hình custom**:
  ```bash
  awkit config model-profile <model_id> delete
  ```

---

## 3. Thiết lập Trực quan qua TUI (Khuyên Dùng cho User)
Khi hướng dẫn User chỉnh sửa cấu hình hoặc khi AI chạy các tác vụ tương tác, hãy khởi chạy trình TUI Config Selector:
```bash
awkit
```
- Sử dụng phím **Up/Down** để di chuyển.
- Nhấn **Space/Enter** để thay đổi nhanh Toggle hoặc mở cửa sổ nhập liệu vai trò.
- Chọn **Model Profiles Editor** để vào danh sách mô hình con.
- Nhấn **`+`** để thêm mô hình mới, nhấn **`-`** trong profile fields để xóa mô hình đang chọn.

---

## 4. Kiểm thử Chức năng Mô hình (Testing Model Functionality)
Khi nhận được yêu cầu kiểm thử chức năng mô hình (Testing Model Functionality), chạy kịch bản thử nghiệm, hoặc xác minh hoạt động tự động của runner/worker:
1. **Tuyệt đối KHÔNG tự viết kịch bản test mới hoặc đi dò code từng file**. AWKit đã cung cấp sẵn bộ kiểm thử tích hợp (Integration Smoke Tests) tự động toàn diện.
2. **Kiểm tra khả năng phản hồi thực tế của một mô hình thông qua CLI**:
   Sử dụng lệnh chính thức của AWKit thay vì tự viết script spawn CLI:
   ```bash
   awkit config test-model <model_id> [prompt]
   ```
   *Ví dụ: `awkit config test-model qwen "Hello"` hoặc `awkit config test-model gemini-3.5-flash`.*
3. **Lệnh CLI kiểm thử tích hợp toàn bộ hệ thống worker/Symphony**:
   ```bash
   node scripts/tests/autopilot-smoke.js
   ```
4. **Các kịch bản được tự động kiểm tra bao gồm**:
   - Foreground single-run execution (Task claim và complete qua mock runner).
   - Background worker mode (Graceful startup, PID locks, status reporting via CLI, graceful stop).
   - Crash recovery (Kill -9, stale locks cleanup, dead worker tasks reclamation).
5. **Xác minh kết quả**:
   - Đảm bảo toàn bộ **17/17 tests** trả về kết quả `passed`.
   - Tiến trình test tự động dọn dẹp dữ liệu thử nghiệm trong DB sau khi chạy xong.
