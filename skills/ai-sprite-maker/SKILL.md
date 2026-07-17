---
name: ai-sprite-maker
description: "Interactive AI Sprite Generator. Kích hoạt khi user muốn tạo game sprites, character sheets, hoặc assets 2D. Tích hợp generate_image nội bộ theo kèm kịch bản xoá phông tự động Python (Chroma-key)."
version: 1.0.0
trigger: conditional
activation_keywords:
  - "tạo sprite"
  - "làm sprite"
  - "game asset"
  - "cắt nền sprite"
---

# 🎨 AI Sprite Maker Skill

> **Purpose:** Tự động hoá quy trình tạo Game Sprites (nhân vật, vật phẩm) qua AI, từ khâu lên ý tưởng đến lúc xuất file `.png` nền trong suốt hoàn chỉnh.
> **Scope:** Kết hợp `generate_image`, và xử lý hậu kỳ cắt/nền xuyên thấu qua script Python cục bộ.

## 🚀 Luồng tương tác (Interactive Flow)

### Bước 1: Khảo sát cấu hình (The Interview)
Trước khi vẽ, hãy hỏi người dùng các thông tin cơ bản, GỢI MỞ KÈM VÍ DỤ để user dễ hình dung:
- **Chủ thể:** (e.g., Hiệp sĩ, quái vật, rương báu, hoặc "một chú mèo dễ thương").
- **Góc nhìn (Perspective):** Vẫn giữ các thuật ngữ chuyên ngành nhưng kèm giải thích ngắn. (e.g. *Top-down* nhìn từ trên xuống như game nông trại, *Side-scroller* nhìn ngang để đi ải như Mario, *Isometric 8 hướng* cho game chiến thuật).
- **Trạng thái & Hoạt ảnh (Animation/Frames):** Giải thích cho user hiểu rằng sprite dùng trong game thường bao gồm nhiều khung hình (frames). Ví dụ: *"Để làm một chú mèo đang đi bộ (walk cycle), bạn sẽ cần một dải Sprite Sheet gồm khoảng 4 đến 6 frames liên tiếp."* Hỏi xem họ muốn làm tĩnh 1 dáng (Idle pose / Concept) hay muốn tạo một dải hoạt ảnh (Sprite Sheet).
- **Phong cách (Art Style):** (e.g. Pixel art 16-bit cổ điển, Vector cel-shaded, 3D Render).

### Bước 1.5: Áp dụng Tiêu chuẩn Lưới (Grid Protocol)
Để đảm bảo ảnh AI sinh ra khớp 100% với tham số cắt ảnh của Python, hệ thống QUI ĐỊNH CÁC CHUẨN GRID SAU:
1. **Chuẩn Action Đơn (Đi/Chạy/Idle ngang):** Lưới `4x1` hoặc `6x1` (1 hàng ngang).
   - *Ép vào Prompt:* `ensure exactly 4 frames arranged in a perfectly straight 4x1 horizontal grid layout, 1 row only`.
   - *Tham số Python chạy ngầm:* `--align 4x1`
2. **Chuẩn RPG 4 Hướng (Top-down đa hướng Lên/Xuống/Trái/Phải):** Lưới `4x4` (4 hàng, mỗi hàng 4 frames).
   - *Ép vào Prompt:* `ensure exactly a 4x4 grid layout, 4 equal rows and 4 equal columns, precise character sheet formatting, aligned grid`.
   - *Tham số Python chạy ngầm:* `--align 4x4`
3. **Chuẩn Ảnh Tĩnh (Concept/Avatar):** Dùng cắt nền bình thường. KHÔNG ép keyword grid, KHÔNG gọi kèm hàm `--align`.

### Bước 2: Sinh ảnh (Generation)
Sau khi chốt ý tưởng, AI đối chiếu với Grid Protocol bên trên để hoàn thiện prompt.

#### Lựa chọn Model (Model Triage):
1. **Standard (Internal):** Sử dụng tool `generate_image` nội bộ cho các yêu cầu thông thường.
2. **Premium (OpenRouter GPT-5.4):** Nếu người dùng yêu cầu chất lượng cao, "studio quality", hoặc chỉ định rõ "GPT-5.4/OpenRouter", hãy sử dụng script với đầy đủ tham số Art Direction:
   ```bash
   python3 ~/.gemini/antigravity/scripts/openrouter_image_gen.py generate \
     --prompt "{prompt}" \
     --style "{style_hint}" \
     --lighting "soft studio" \
     --out "assets/generated/{filename}.webp"
   ```
   *Mẹo: Dùng `edit` subcommand nếu muốn biến đổi một phác thảo/ảnh thô có sẵn thành sprite chuẩn phong cách.*

#### Cấu hình Prompt:
- LUÔN kết hợp chặt chẽ các keyword về chuẩn Grid Layout (nếu là ảnh động) như đã định nghĩa ở Bước 1.5.
- **ĐỂ TRÁNH BỊ CHÈN CHỮ VÀO FRAME:** LUÔN thêm keyword: `no text, no wording, no watermark, no labels, no frame numbers, clean blank spacing`.
- **🚫 CẤM DÙNG "Nền trong suốt"**: TUYỆT ĐỐI KHÔNG thêm từ khóa "transparent background", "nền trong suốt". Việc này sẽ sinh ra nền caro giả (fake checkerboard) không thể xoá.
- BẮT BUỘC dùng kỹ thuật "Codex Hatch Pet": Chèn đoạn hậu tố nền xanh sau đây để script Python Chroma-key nhận toạ độ cắt: 
  `solid bright green background #00FF00, high contrast, clean distinct edges, isolated subject, no shadows cast on the background.` (Hoặc dùng `solid white background #FFFFFF` nếu chủ thể có màu xanh lá).
- Đặt ImageName mô tả đúng chủ thể, kết thúc bằng `_raw` (vd: `cat_walk_4x1_raw`).

### Bước 3: Hậu kỳ (Post-Processing)
Ngay khi ảnh thô sinh ra thành công, AI tự động gọi script Python để xử lý ảnh final.

- **Kỹ thuật Codex Hatch Pet (Chuyên nghiệp):** Sử dụng `remove_chroma_key.py` để gỡ nền xanh/trắng với khả năng despill (xoá ám xanh cạnh) và soft-matte.
```bash
# Đối với nền xanh lá #00FF00
python3 ~/.gemini/antigravity/skills/ai-sprite-maker/scripts/remove_chroma_key.py --input <đường_dẫn_raw> --out <đường_dẫn_final> --key-color #00FF00 --soft-matte --spill-cleanup --edge-feather 0.5
```

- **Đối với Sprite Sheet (Căn lưới):** Sử dụng `process_sprites.py` để vừa gỡ nền vừa căn chỉnh các frame vào lưới đồng nhất.
```bash
python3 ~/.gemini/antigravity/skills/ai-sprite-maker/scripts/process_sprites.py <đường_dẫn_raw> <đường_dẫn_final> [--align CxR]
```

- **Đối với Dải hoạt ảnh (Sprite Sheet):** KIÊN QUYẾT TỰ ĐỘNG bổ sung tham số `--align SốCộtxSốHàng` để tự động căn lề thẳng tắp mặt đất cho mọi frame hình. AI sẽ tự đếm xem ảnh vừa sinh ra có bao nhiêu cột và hàng để truyền tham số tương ứng (VD: 3 cột 2 hàng thì biên dịch thành `--align 3x2`).
Nhờ vậy nhân vật sẽ chạy mượt mà ngay trên Canvas JS/Unity mà người dùng KHÔNG CẦN chỉnh tay (zero manual intervention).
```bash
python ~/.gemini/antigravity/skills/ai-sprite-maker/scripts/process_sprites.py <đường_raw> <đường_final> --align 3x2
```

### Bước 4: Nghiệm thu & Preview Animation (Review & Test)
Sau khi xử lý thành công, hãy thực hiện các việc sau:
1. Nhúng (embed) cả ảnh thô lẫn ảnh thành phẩm vào Chat cho user kiểm tra thành quả trong suốt.
2. **NẾU LÀ SPRITE SHEET (Ảnh động):** BẮT BUỘC tạo nhanh một file `preview.html` lưu cùng thư mục với ảnh final. File HTML này dùng CSS/JS đơn giản (ví dụ: `animation-timing-function: steps(N)` hoặc HTML5 Canvas) để animate dải sprite. Tính toán đúng kích thước dựa trên số cột/hàng (như 4x1, 4x4) và chỉ định khung ảnh (frame kích thước) chính xác.
3. Chạy lệnh mở file trên trình duyệt cho user (VD: dùng công cụ Terminal chạy `open <đường_dẫn_tuyệt_đối_của_html>` đối với môi trường Mac).
4. Khuyến khích user test hoạt ảnh trực tiếp. Hỏi user tốc độ (speed) và độ mượt (smoothness) có ổn không.
5. **Tùy chọn: Gói thành Video/GIF Animation (Mới):** Nếu user muốn tạo hẳn file ảnh động (GIF) hoặc Video (MP4) để chia sẻ:
   - Sử dụng script `animate_sprite.py` được cung cấp trong skill.
   - Ví dụ lệnh cắt sprite 4x1 thành GIF (tốc độ 100ms, phóng to 2x):
     ```bash
     python ~/.gemini/antigravity/skills/ai-sprite-maker/scripts/animate_sprite.py <đường_final.png> <đường_ra.gif> --grid 4x1 --duration 100 --scale 2.0
     ```
   - Xuất ra MP4 (Yêu cầu hệ thống cài sẵn `ffmpeg`, đổi đuôi thành `.mp4`):
     ```bash
     python ~/.gemini/antigravity/skills/ai-sprite-maker/scripts/animate_sprite.py <đường_final.png> <đường_ra.mp4> --grid 4x1
     ```
6. Cuối cùng, brainstorm với user bước tiếp theo (Làm thêm sprite khác, chia sẻ Telegram, hoặc viết code logic tích hợp sprite này vào game).---

## 🛠 Script Python Xoá Nền (Chroma-key)
Skill đính kèm một script Python không phụ thuộc AI nặng tại:
`~/.gemini/antigravity/skills/ai-sprite-maker/scripts/process_sprites.py`

*(Yêu cầu thiết bị có cài đặt module `Pillow` trong môi trường Python: `pip install Pillow`).*
