---
name: video-edit
description: "Biên tập video dọc (9:16) từ EDL JSON: cắt shot, nhạc nền, captions PNG (không dùng drawtext), decor overlays, guardrail chống timeline vô hạn."
version: 0.1.0
trigger: conditional
activation_keywords:
  - "biên tập video"
  - "render video"
  - "dựng video"
  - "caption video"
  - "edit video"
---

## Usage

```bash
python ~/.gemini/antigravity/skills/video-edit/scripts/video_edit.py render \
  --edl <path-to-edl.json> \
  --project-root <repo-root> \
  --out <output.mp4> \
  --preset cinematic \
  --crf 23 \
  --badge tip --badge-duration 3
```

## Requirements

- ffmpeg + ffprobe on PATH
- Python + Pillow (PIL)
- Fonts in `<repo-root>/assets/fonts/` (fallback to macOS Arial)
- Optional overlays in `<repo-root>/assets/overlays/`

## Notes

- Không dùng `drawtext` để tránh lỗi thiếu filter trên một số bản ffmpeg.
- Guardrails: mỗi PNG overlay input được giới hạn `-t`, và output bị `trim` + `-shortest` để không bao giờ kéo dài vô hạn.
