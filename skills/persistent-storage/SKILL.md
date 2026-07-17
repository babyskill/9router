# SKILL: persistent-storage

Cung cấp API và cơ chế lưu trữ dữ liệu key-value bền vững (persistent key-value storage) cho các tài liệu tương tác (Artifacts) trong Antigravity.

---

## 🛠️ API Định nghĩa (Storage API)

Các Artifacts tương tác (HTML/JS chạy trên browser) có thể tương tác với storage thông qua các hàm bất đồng bộ. Đối với AI Agent, bạn có thể gọi trực tiếp thông qua công cụ dòng lệnh (CLI):

```bash
awkit storage set <key> '<json_value>' [--shared]
awkit storage get <key> [--shared]
awkit storage delete <key> [--shared]
awkit storage list [prefix] [--shared]
```

### 1. `storage_get(key, shared?)`
- **Mục tiêu:** Lấy giá trị tương ứng với key.
- **Tham số:** 
  - `key` (String): Độ dài dưới 200 ký tự. Không chứa khoảng trắng, dấu ngoặc kép hoặc dấu gạch chéo.
  - `shared` (Boolean, mặc định: `false`): Nếu `true`, dữ liệu có thể được truy cập bởi tất cả người dùng của artifact đó. Nếu `false`, chỉ người dùng hiện tại truy cập được.
- **Kết quả trả về:** `{ key, value, shared }` hoặc `null` nếu không tìm thấy key (hoặc báo lỗi nếu truy vấn thất bại).

### 2. `storage_set(key, value, shared?)`
- **Mục tiêu:** Lưu trữ hoặc cập nhật giá trị.
- **Tham số:**
  - `key` (String)
  - `value` (String/JSON): Dung lượng tối đa 5MB.
  - `shared` (Boolean)
- **Kết quả trả về:** `{ key, value, shared }` khi thành công.

### 3. `storage_delete(key, shared?)`
- **Mục tiêu:** Xóa key.
- **Kết quả trả về:** `{ key, deleted: true, shared }` khi thành công.

### 4. `storage_list(prefix?, shared?)`
- **Mục tiêu:** Liệt kê các key có prefix được chỉ định.
- **Kết quả trả về:** Danh sách các keys khớp.

---

## 💾 Cơ chế Lưu trữ Cục bộ (Local Persistence Engine)

Tại môi trường runtime, dữ liệu được ánh xạ trực tiếp và lưu trữ bền vững theo hai phương án:
1. **SQLite Database (Sử dụng Symphony DB):** Lưu vào bảng `artifact_storage` với cấu trúc `(key TEXT PRIMARY KEY, value TEXT, shared INTEGER, updated_at TIMESTAMP)`.
2. **File JSON Cục bộ (Chế độ offline):** Lưu trực tiếp vào `.brain/storage.json` của dự án hiện tại.

---

## 💡 Best Practices cho Thiết kế Artifacts

- **Đặt key theo cấp bậc (Hierarchical Keys):** Sử dụng dạng `table_name:record_id` (ví dụ: `todos:todo_1`, `settings:global`).
- **Gom nhóm dữ liệu (Batching):** Hạn chế gọi API ghi/đọc liên tục. Hãy gom các dữ liệu liên quan vào cùng một object JSON lớn để lưu trữ trong một key duy nhất (ví dụ: thay vì lưu từng pixel art, hãy lưu cả ma trận pixel của bảng).
- **Xử lý lỗi (Error Handling):** Bắt buộc sử dụng khối `try-catch` khi gọi các hàm storage. Hiển thị loading indicators hoặc giao diện mềm dẻo cho người dùng thay vì block UI khi truy xuất dữ liệu thất bại.
