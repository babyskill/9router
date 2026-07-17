---
name: lucylab-tts
description: |
  Công cụ tạo Text-to-Speech (TTS) sử dụng API của LucyLab với nhiều giọng đọc khác nhau.
  Hỗ trợ tạo giọng đọc từ kịch bản có sẵn, quản lý voice library và xuất file âm thanh chất lượng cao.
metadata:
  stage: workflow
  version: "1.0"
  requires: "python3, requests"
  tags: [tts, lucylab, voice, audio, text-to-speech]
trigger: explicit
activation_keywords:
  - "/lucylab"
  - "/tts"
  - "chuyển văn bản thành giọng nói"
  - "tạo giọng đọc"
  - "đọc script"
  - "tạo tts"
---

# 🎙️ LucyLab TTS (Text-to-Speech Generator)

> **Mục tiêu**: Tự động hóa quá trình tạo giọng đọc (Voiceover) từ văn bản hoặc kịch bản phân cảnh (Scenes) bằng API của LucyLab, hỗ trợ nhiều giọng đọc vùng miền và giới tính khác nhau. Được tách ra thành skill độc lập để dễ dàng gọi từ các workflow khác (ví dụ: short-maker).

## 📡 Chế độ hoạt động (Triggers)

- **Plain Text Mode**: Nhập một đoạn văn bản (text), Tool sẽ dùng một giọng mặc định để đọc toàn bộ.
- **Script Scenes Mode**: Nhập kịch bản phân cảnh (SCENE 1, SCENE 2,...). Tool sẽ tự động phân tách từng câu thoại của mỗi cảnh và gọi LucyLab API để tạo các file lẻ. Rất phù hợp với quá trình tạo video tự động (Short Maker).

## 🧱 Quy trình hoạt động (Mandatory Flow)

0. **Giai đoạn Setup (Authentication)**: AI CẦN PHẢI KIỂM TRA QUYỀN TRUY CẬP TRƯỚC TIÊN:
   - Quét file `.env` (tại thư mục làm việc hiện tại hoặc `~/.gemini/antigravity/.env`) tìm `LUCYLAB_BEARER`. Nếu KHÔNG TỒN TẠI, AI phải yêu cầu người dùng cung cấp API Key của LucyLab để lưu vào `.env`. Tuyệt đối không được chạy script trực tiếp để tránh lỗi do thiếu Authorization.
1. **Chuẩn bị Kịch bản**: Kịch bản cần được đưa vào file text (ví dụ: `script.txt`) chứa thoại, hoặc truyền trực tiếp chữ thông qua `--text`.
2. **Chọn Giọng đọc**: Dựa trên danh sách giọng trong `~/.gemini/antigravity/skills/lucylab-tts/resources/voices_library.json` hoặc truyền trực tiếp `--voice <id>`. Có các template phân nhóm: Nam/Nữ, miền Bắc/Nam.
3. **Thực thi Tạo Audio**: 
   - Tool kích hoạt script Python nằm trong: `~/.gemini/antigravity/skills/lucylab-tts/scripts/lucylab_tts.py`.
   - Tool tự động lấy `LUCYLAB_BEARER` từ `.env` (hỗ trợ .env cục bộ hoặc ~/.gemini/antigravity/.env).
4. **Hậu kiểm Output**: 
   - Files MP3/WAV sẽ được lưu vào thư mục định sẵn (mặc định `outputs/tts-lucylab/<voice-slug>/`) với các file như `scene-01.mp3`, `scene-02.mp3`...
   - Sẵn sàng dùng kết hợp với FFmpeg để ráp vào video.

## 💻 Cấu trúc lệnh (CLI Reference)

Để gọi engine TTS, bạn có thể thực thi lệnh thông qua bash:

```bash
# Đọc một đoạn text đơn giản (không chia cảnh)
python ~/.gemini/antigravity/skills/lucylab-tts/scripts/lucylab_tts.py \
    --text "Chào mừng bạn đến với hệ thống." \
    --voice "12345:Giọng chuẩn" \
    --mode plain \
    --out-dir "outputs/sample"

# Đọc từ kịch bản chia cảnh, chọn nhiều giọng từ thư viện
python ~/.gemini/antigravity/skills/lucylab-tts/scripts/lucylab_tts.py \
    --text-file "script.txt" \
    --mode auto \
    --voice-json "/Users/trungkientn/.gemini/antigravity/skills/lucylab-tts/resources/voices_library.json" \
    --voices "Nam miền Bắc" \
    --out-dir "outputs/tts"
```

> ⚠️ **Lưu ý**: Chắc chắn rằng biến môi trường `LUCYLAB_BEARER` đã được cấu hình trong dự án hiện tại (`.env`) hoặc `~/.gemini/antigravity/skills/lucylab-tts/scripts/.env` để được phép Authentication.
