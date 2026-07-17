---
name: prompt-to-monochrome
description: Convert text descriptions or design layout specs into ultra-lightweight, high-contrast, black-and-white (monochrome) images (sketches/silhouettes) using optimized prompt wrappers.
version: 1.0.0
trigger: conditional
activation_keywords:
  - "convert prompt to image"
  - "tạo ảnh đen trắng"
  - "sketch"
  - "monochrome representation"
  - "lineart wireframe"
---

# 🎨 Prompt to Monochrome Image Converter (Verbatim Prompt rendering)

**Purpose**: Chuyển đổi nguyên văn (verbatim) nội dung text prompt hoặc tài liệu chỉ dẫn dài thành hình ảnh đen trắng có độ tương phản cao (monochrome PNG). Điều này giúp mô hình đa phương thức (multimodal models) đọc được toàn bộ prompt thông qua OCR chỉ với **258 tokens cố định**, tiết kiệm tới 90% dung lượng và token context so với việc gửi prompt dưới dạng văn bản thô.

## 🚀 Hoạt động (Core Logic)

### 1. Phân tích văn bản
Khi nhận diện trigger (yêu cầu chuyển prompt thành ảnh), AI đọc toàn bộ file text prompt hoặc văn bản chỉ dẫn được yêu cầu.

### 2. Biên dịch hình ảnh văn bản (Text-to-Image Rendering)
AI thực thi script `scripts/prompt_to_text_image.py` để tự động:
- Tải phông chữ Monospace/Courier sắc nét.
- Tự động wrap dòng (line wrapping) phù hợp với độ rộng canvas (mặc định 800px).
- Tính toán chiều cao canvas động dựa trên số lượng dòng chữ.
- Kết xuất ra ảnh nhị phân 1-bit (Pure Black & White PNG) siêu nhẹ.

```bash
python3 scripts/prompt_to_text_image.py \
  --input scratch/prompt.txt \
  --output scratch/prompt_as_image.png \
  --width 800 \
  --font-size 16
```

### 3. Handoff & Token Audit
AI trả về link ảnh đen trắng chứa văn bản và báo cáo:
- **Kích thước file**: Thường chỉ từ 3KB - 15KB tùy thuộc vào độ dài prompt.
- **Token Tiết kiệm**:
  - Token text thô gốc: [Số lượng token của file text prompt].
  - Token ảnh OCR: **258 tokens** (Mức cố định của Gemini).
  - Phần trăm token tiết kiệm được.
