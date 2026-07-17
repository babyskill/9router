---
name: skill-creator
description: "Chuyên gia tạo mới và chỉnh sửa Antigravity Skills. ĐẶC BIỆT: LUÔN tự động đồng bộ chéo (dual-sync) mọi file của skill đang sửa/tạo từ ~/.gemini/antigravity sang thư mục dự án /Users/trungkientn/Dev/NodeJS/main-awf để backup."
version: 1.0.0
trigger: conditional
activation_keywords:
  - "cập nhật skill"
  - "tạo skill mới"
  - "viết skill"
  - "chỉnh sửa skill"
  - "bổ sung skill"
---

<!-- ⚠️ DUAL-SYNC BẮT BUỘC — Mọi thay đổi PHẢI sync sang main-awf. Không được bỏ qua Bước 3. -->

# 🛠️ Skill Creator (with Auto-Sync to main-awf)

**Purpose**: Hỗ trợ người dùng thiết kế, lập trình và tinh chỉnh các Antigravity Skills theo chuẩn. 
**Core Rule**: Mọi tác vụ trên skill bất kỳ (tạo mới, thay đổi nội dung thư mục) BẮT BUỘC phải được nhân bản tự động sang repo `main-awf` ngay lập tức để giữ đồng bộ phiên bản mà không cần user nhắc nhở.

## 🚀 Luồng tương tác (Workflow)

### Bước 1: Thu thập yêu cầu (Requirements)
- Nắm bắt thông tin về Skill user muốn tạo/sửa: Tên skill, công dụng cốt lõi, từ khoá kích hoạt (triggers), và các script chuyên biệt (Python, Bash, Node) nếu có.
- Nếu là skill mới, định hình các thư mục cần thiết (vd: `scripts/`, `templates/`, `resources/`).

### Bước 2: Thiết kế và Lập trình (Implementation)
- Tạo thư mục gốc của skill tại `~/.gemini/antigravity/skills/<skill-name>`.
- Khởi tạo (hoặc cập nhật) file điều hướng cốt lõi `SKILL.md` tuân thủ YAML frontmatter.
- Lập trình các script logic chuyên biệt và đặt đúng vào các thư mục tương ứng bên trong.

### Bước 3: ĐỒNG BỘ HOÁ BẮT BUỘC (The Mandatory Sync)
Ngay sau khi thao tác sinh file nội bộ thư mục `.gemini` hoàn tất (và trước khi báo cáo kết thúc cho user), AI **BẮT BUỘC CHẠY BASH COMMAND ĐỂ BACKUP SANG MAIN-AWF**. Đây là nguyên tắc sống còn của skill này:

```bash
# 1. Khởi tạo thư mục đích tại main-awf để tránh lỗi NotFound
mkdir -p /Users/trungkientn/Dev/NodeJS/main-awf/skills/<skill-name>

# 2. Quét và chép đè mọi thứ thuộc skill từ Antigravity nội bộ sang repo Node
cp -R ~/.gemini/antigravity/skills/<skill-name>/* /Users/trungkientn/Dev/NodeJS/main-awf/skills/<skill-name>/
```
*(AI chú ý: Nhớ thay chữ `<skill-name>` bằng đúng tên thư mục skill đang xử lý. Không được bỏ sót thư mục con như scripts).*

### Bước 4: Nghiệm thu (Review)
- Báo cáo cho người dùng tình trạng tạo/sửa skill.
- Xác nhận bằng định dạng Check-box rằng: `✅ Đã đồng bộ an toàn sang repo main-awf`.
