---
name: short-maker
description: |
  Đạo diễn sản xuất video quảng cáo App (App Promo) bằng AI. Tự động hóa quy trình viết kịch bản AIDA,
  quản lý storyboard qua ShortMaker Studio MCP Server, và gọi Google Flow (Veo 3) render video bối cảnh thật
  kèm Native Voice. Hỗ trợ Mimic Mode bóc tách nội dung trending từ YouTube/TikTok.
metadata:
  stage: workflow
  version: "2.0"
  requires: "ShortMaker Studio (MCP Server), google-flow-cli, ffmpeg"
  tags: [video, marketing, ads, app-promo, veo, gflow, tiktok, youtube, shorts, mcp]
trigger: explicit
activation_keywords:
  - "/short"
  - "/promo"
  - "/mimic"
  - "làm video tiktok"
  - "chạy video flow"
---

# 🎬 Short Maker v2.0 (MCP Client Mode)

> **Mục tiêu**: Tối đa hóa traffic miễn phí từ Video ngắn (TikTok, YouTube Shorts, Reels)
> bằng cách tự động sản xuất video quảng cáo App với cấu trúc AIDA hoặc copy (Mimic) hook viral.

## ⚠️ Prerequisites (BẮT BUỘC)

Skill này hoạt động như **MCP Client** — mọi thao tác project/storyboard/render đều gọi qua **ShortMaker Studio MCP Server**.

**Trước khi bắt đầu, KIỂM TRA:**
1. ShortMaker Studio MCP Server đang chạy (IDE đã kết nối qua MCP config)
2. Gọi thử `shortmaker_list_projects` — nếu thành công → MCP Server OK
3. Google Flow auth: kiểm tra `~/.gflow/env` tồn tại. Nếu chưa:
   ```bash
   cd ~/Dev2/MacOS/Shortmaker/scripts/google-flow-cli && PYTHONPATH=. python3 gflow/cli/main.py auth
   ```

## 📡 Chế độ hoạt động (Triggers)

- **Original Mode (`/promo`, `/short`)**: User nhập [Tên App + Tính năng]. AI đóng vai Giám đốc Marketing, lên kịch bản AIDA.
- **Mimic Mode (`/mimic`)**: User cung cấp [Link YouTube/TikTok]. AI trích xuất transcript, phân tích Hook/Pacing, sau đó clone cấu trúc kịch bản đó nhưng áp dụng cho App của user.

## 🧱 Quy trình hoạt động (Mandatory Flow)

**Bảo vệ Credit**: Mọi video Veo 3 đều tốn 20 credit. TUYỆT ĐỐI không gọi render khi chưa có xác nhận từ người dùng qua bước Storyboard Review.

### Giai đoạn 1: Bootstrap Project

Gọi MCP tool để tạo project:
```
shortmaker_create_project(name: "FitWitness Promo", appName: "FitWitness", description: "30s TikTok promo")
```
→ Trả về `projectId` và `path`. Dùng `projectId` cho tất cả các bước sau.

### Giai đoạn 2: Kịch Bản & Character Casting

1. Sinh kịch bản `script.md` (dùng template `aida_script.md` hoặc `mimic_analyzer.md`).
2. **Character Setup** — gọi MCP tool:
   ```
   shortmaker_setup_character(projectId: "...", prompt: "A young Vietnamese woman, long black hair...", seed: "123456")
   ```
3. **Xử lý ảnh tham chiếu**:
   - User cung cấp ảnh → AI phân tích, viết `character_prompt`, copy ảnh vào project dir
   - User không có ảnh → AI thiết kế character, gọi `generate-image` tạo mẫu
4. **Actor Approval**: Trình bày ảnh cho User. CHỈ TIẾP TỤC khi User chốt nhân vật.

### Giai đoạn 3: Storyboard (0 Cost)

Gọi MCP tool lặp lại cho từng scene:
```
shortmaker_add_scene(
  projectId: "...",
  prompt: "A woman standing in a modern gym, looking at her phone...",
  speech: "Tired of forgetting your workouts?",
  duration: 8,
  transition: "fade",
  sceneType: "hook"
)
```

**Quy tắc prompt**:
- **ƯU TIÊN MÔI TRƯỜNG THẬT**: TUYỆT ĐỐI KHÔNG dùng Greenscreen/Chroma key mặc định
- Character prompt sẽ được auto-prepend bởi MCP Server
- BẮT BUỘC truyền `--seed` đã chốt khi render

Sau khi thêm đủ scenes, hướng dẫn User mở **ShortMaker Studio** để review storyboard trực quan.
Hoặc AI tự review bằng:
```
shortmaker_get_storyboard(projectId: "...")
```

Sửa scene nếu cần:
```
shortmaker_update_scene(projectId: "...", sceneId: "scene-01", speech: "Updated narration")
```

**CHỈ TIẾP TỤC khi User xác nhận đã duyệt xong Storyboard.**

### Giai đoạn 4: Render (Batch)

Gọi MCP tool:
```
shortmaker_trigger_render(projectId: "...", fadeDuration: 1.0, bgmVolume: 0.1)
```

User có thể theo dõi tiến trình trên ShortMaker Studio GUI.

## 🔀 Hiệu ứng Chuyển Cảnh (Transitions)

Các hiệu ứng được hỗ trợ (truyền vào `transition` khi `add_scene`):
- `fade` — Chuyển mờ dần (mặc định)
- `slideleft` / `slideright` — Trượt sang trái/phải
- `wipeleft` / `wiperight` — Quét sang trái/phải
- `circlecrop` — Thu nhỏ hình tròn
- `dissolve` — Hòa tan
- `none` — Cắt thẳng, không hiệu ứng

## 🌿 Green Screen (Fallback Option)

Nếu User ĐẶC BIỆT yêu cầu greenscreen:
- Thêm "on a solid chroma green screen background" vào prompt scene
- Render pipeline sẽ tự xử lý chroma key với background được cung cấp

## 📁 Output Convention

Projects được lưu tại `~/ShortMaker-Projects/<project-id>/`:
```
<project-id>/
├── shortmaker.config.json    # Project config (auto-managed)
├── storyboard.json           # Scene data (auto-managed)
├── assets/                   # Character ref, BGM
├── storyboard/               # Scene preview images
├── segments/                 # Rendered video segments
├── tts/                      # TTS audio files
├── temp/                     # Temporary processing files
└── final/                    # Final mixed output
```

## 🎞️ Video Editing & Rendering Engine (macOS & Node.js)

Skill này tích hợp bộ biên tập video tự động thay thế cho pipeline PowerShell cũ, tương thích hoàn toàn với macOS:

### 1. Storyboard Bridge (`scripts/shortmaker-bridge.js`)
Dùng để chuyển đổi `storyboard.json` từ ShortMaker sang định dạng EDL chuẩn:
- **Tải nhạc từ Pixabay**: Tự động tìm kiếm video chủ đề background music, tải xuống và trích xuất audio thành `music.mp3` nếu có `PIXABAY_API_KEY` (fallback về SoundHelix nhạc royalty-free).
- **Tự động hoạt ảnh hóa (Screenshot Animation)**: Nếu không có video segment trong `segments/`, bridge sẽ sử dụng thư viện `effects.js` áp dụng bộ lọc Ken Burns (`zoom-in`, `zoom-out`, `pan-left`, `pan-right`) biến các screenshot tĩnh (`image`) thành video clip.
- **Audio Ducking**: Tự động dìm nhạc nền (xuống `0.15`) trong suốt thời gian có giọng đọc TTS.

**Cách chạy:**
```bash
node scripts/shortmaker-bridge.js --project-dir=<path-to-shortmaker-project> --out-dir=<path-to-videomix-output> [--bgm-volume=0.2]
```

### 2. VideoMix CLI (`scripts/videomix.js`)
Bộ CLI lõi để bootstrap, render và QA video:
- **Tạo dự án**: `node scripts/videomix.js new:cinematic <edl.json> <out-dir> --force` (tạo thư mục, cắt/chuẩn hóa âm thanh và video shot, tạo index.html).
- **Render**: `node scripts/videomix.js render <project-dir>` (chạy hyperframes lint, validate, render).
- **QA**: `node scripts/videomix.js qa <project-dir>` (phát hiện frame đen blackdetect và chụp ảnh kiểm chứng).
- **Video dọc**: `node scripts/videomix.js vertical <input.mp4> <output.mp4>` (sinh video 9:16 với blur background).

## 🔧 MCP Tools Reference

| Tool | Mục đích |
|------|----------|
| `shortmaker_list_projects` | Liệt kê projects hiện có |
| `shortmaker_create_project` | Tạo project mới |
| `shortmaker_setup_character` | Chốt nhân vật (prompt + seed) |
| `shortmaker_add_scene` | Thêm scene vào storyboard |
| `shortmaker_update_scene` | Sửa scene đã có |
| `shortmaker_get_storyboard` | Xem toàn bộ storyboard |
| `shortmaker_trigger_render` | Bắt đầu render pipeline (async, chạy ngầm) |
| `shortmaker_get_render_status` | Kiểm tra tiến trình render đang chạy (polling) |

