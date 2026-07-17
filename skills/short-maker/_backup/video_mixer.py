import argparse
import glob
import json
import os
import subprocess
import sys
from pathlib import Path


def get_duration(filepath: Path) -> float:
    cmd = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(filepath)
    ]
    try:
        output = subprocess.check_output(cmd, text=True).strip()
        return float(output)
    except Exception as e:
        print(f"Error getting duration for {filepath}: {e}")
        return 0.0


def check_has_audio(filepath: Path) -> bool:
    cmd = [
        "ffprobe", "-v", "error",
        "-select_streams", "a",
        "-show_entries", "stream=codec_type",
        "-of", "csv=p=0",
        str(filepath)
    ]
    try:
        output = subprocess.check_output(cmd, text=True).strip()
        return len(output) > 0
    except Exception:
        return False


def ensure_dir(path: Path) -> Path:
    path.mkdir(parents=True, exist_ok=True)
    return path


# Supported FFmpeg xfade transitions
SUPPORTED_TRANSITIONS = [
    'fade', 'slideleft', 'slideright', 'circlecrop',
    'dissolve', 'wipeleft', 'wiperight',
    'smoothleft', 'smoothright', 'smoothup', 'smoothdown',
]


def load_storyboard_transitions(project_dir: Path) -> list:
    """Read per-scene transitions from storyboard.json if available."""
    sb_path = project_dir / "storyboard.json"
    if not sb_path.exists():
        return []
    try:
        with open(sb_path, 'r') as f:
            data = json.load(f)
        transitions = []
        for scene in data.get('scenes', []):
            t = scene.get('transition', 'fade')
            if t not in SUPPORTED_TRANSITIONS:
                t = 'fade'
            transitions.append(t)
        return transitions
    except Exception as e:
        print(f"Warning: Could not read storyboard.json: {e}")
        return []


def main():
    parser = argparse.ArgumentParser(description="Auto-Mixer cho Short Maker bằng FFmpeg")
    parser.add_argument("--project-dir", required=True, help="Thư mục project chứa outputs (ví dụ: outputs/promo-app)")
    parser.add_argument("--fade-duration", type=float, default=1.0, help="Thời gian crossfade giữa các cảnh (giây)")
    parser.add_argument("--bgm-volume", type=float, default=0.1, help="Âm lượng nhạc nền (0.0 đến 1.0)")
    parser.add_argument("--chroma-bg", type=str, help="Đường dẫn đến ảnh/video nền để thay thế phông xanh")
    parser.add_argument("--chroma-color", type=str, default="0x00FF00", help="Mã màu phông xanh (mặc định: 0x00FF00)")
    parser.add_argument("--chroma-sim", type=float, default=0.3, help="Độ tương đồng màu (0.01 - 1.0, mặc định: 0.3)")
    parser.add_argument("--chroma-blend", type=float, default=0.2, help="Độ mượt viền (0.0 - 1.0, mặc định: 0.2)")
    args = parser.parse_args()

    project_dir = Path(args.project_dir)
    segments_dir = project_dir / "segments"
    tts_dir = project_dir / "tts"
    audio_dir = project_dir / "audio"
    temp_dir = ensure_dir(project_dir / "temp")
    final_dir = ensure_dir(project_dir / "final")

    if not segments_dir.exists() or not tts_dir.exists():
        print(f"Error: Thư mục segments hoặc tts không tồn tại trong {project_dir}")
        sys.exit(1)

    # Liệt kê các cảnh
    video_files = sorted(glob.glob(str(segments_dir / "*.mp4")))
    if not video_files:
        print("Không tìm thấy video nào trong segments/")
        sys.exit(1)

    scenes = []
    for v_path in video_files:
        v_path = Path(v_path)
        scene_name = v_path.stem  # vd: scene-01
        
        # Tìm file TTS tương ứng (mp3 hoặc wav)
        tts_path = tts_dir / f"{scene_name}.mp3"
        if not tts_path.exists():
            tts_path = tts_dir / f"{scene_name}.wav"
            
        if not tts_path.exists():
            print(f"Thêm cảnh {scene_name} nhưng KHÔNG có file âm thanh TTS.")
            scenes.append({"video": v_path, "audio": None})
        else:
            scenes.append({"video": v_path, "audio": tts_path})

    print(f"Bắt đầu mix {len(scenes)} cảnh...")

    # Bước 1: Render từng cảnh riêng lẻ (Loop video để khớp với audio)
    ready_scenes = []
    for idx, scene in enumerate(scenes):
        out_scene = temp_dir / f"ready_{idx:02d}.mp4"
        ready_scenes.append(out_scene)
        
        # Tiết kiệm thời gian nếu render rồi
        if out_scene.exists():
            print(f" - [Skip] Cảnh {idx+1} đã được chuẩn bị.")
            continue

        print(f" - [Render] Chuẩn bị cảnh {idx+1}...")
        if scene["audio"]:
            # Dùng stream_loop để loop video nếu nó ngắn hơn audio
            cmd = [
                "ffmpeg", "-y",
                "-stream_loop", "-1", "-i", str(scene["video"]),
                "-i", str(scene["audio"]),
                "-c:v", "libx264", "-c:a", "aac",
                "-map", "0:v:0", "-map", "1:a:0",
                "-shortest", "-pix_fmt", "yuv420p",
                str(out_scene)
            ]
        else:
            # Ưu tiên Native Voice của Veo 3 nếu không có file TTS ngoài.
            # Nếu video không có audio stream, thêm audio âm câm để mix tránh lỗi acrossfade.
            has_audio = check_has_audio(scene["video"])
            if has_audio:
                cmd = [
                    "ffmpeg", "-y",
                    "-i", str(scene["video"]),
                    "-c:v", "libx264", "-c:a", "aac", "-pix_fmt", "yuv420p",
                    str(out_scene)
                ]
            else:
                cmd = [
                    "ffmpeg", "-y",
                    "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
                    "-i", str(scene["video"]),
                    "-c:v", "libx264", "-c:a", "aac",
                    "-map", "1:v:0", "-map", "0:a:0",
                    "-shortest", "-pix_fmt", "yuv420p",
                    str(out_scene)
                ]
        
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

    # Bước 2: Ghép các cảnh bằng XFade (Chuyển cảnh nhẹ nhàng)
    # Load per-scene transitions from storyboard.json
    scene_transitions = load_storyboard_transitions(project_dir)
    print("Bắt đầu Crossfade nối màn...")
    merged_output = temp_dir / "merged_crossfaded.mp4"
    fade_d = args.fade_duration

    if len(ready_scenes) == 1:
        merged_output = ready_scenes[0]
    else:
        # Tính toán duration để tính offset
        durations = [get_duration(f) for f in ready_scenes]
        
        filter_complex = ""
        inputs = []
        
        for i, sc in enumerate(ready_scenes):
            inputs.extend(["-i", str(sc)])

        offsets = []
        current_offset = 0.0
        
        for i in range(len(durations) - 1):
            current_offset += durations[i] - fade_d
            offsets.append(current_offset)

        # Build video filter with per-scene transitions
        v_labels = [f"[{i}:v]" for i in range(len(ready_scenes))]
        for i in range(len(offsets)):
            # Get transition for this join (from scene i to i+1)
            transition_type = 'fade'  # default
            if i < len(scene_transitions):
                t = scene_transitions[i]
                if t != 'none':
                    transition_type = t
            
            last_out = v_labels[0]
            next_in = v_labels[i+1]
            out_label = f"[v{i+1}]"
            
            if i < len(scene_transitions) and scene_transitions[i] == 'none':
                # No transition — simple concat (handled by offset = duration)
                filter_complex += f"{last_out}{next_in}xfade=transition=fade:duration=0.01:offset={offsets[i]}{out_label}; "
            else:
                filter_complex += f"{last_out}{next_in}xfade=transition={transition_type}:duration={fade_d}:offset={offsets[i]}{out_label}; "
            v_labels[0] = out_label  # Cập nhật pipe hiện tại
            
            print(f"   Scene {i+1} → {i+2}: transition={transition_type}")
        
        # Build audio filter
        a_labels = [f"[{i}:a]" for i in range(len(ready_scenes))]
        for i in range(len(offsets)):
            last_out = a_labels[0]
            next_in = a_labels[i+1]
            out_label = f"[a{i+1}]"
            filter_complex += f"{last_out}{next_in}acrossfade=d={fade_d}{out_label}; "
            a_labels[0] = out_label

        cmd_merge = ["ffmpeg", "-y"] + inputs + [
            "-filter_complex", filter_complex.strip(" ;"),
            "-map", v_labels[0],
            "-map", a_labels[0],
            "-c:v", "libx264", "-c:a", "aac", "-pix_fmt", "yuv420p",
            str(merged_output)
        ]
        
        print("   Đang render crossfade... (có thể mất vài phút)")
        subprocess.run(cmd_merge, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

    # Bước 2.5: Ghép hình nền tách phông xanh (nếu có)
    if args.chroma_bg and os.path.exists(args.chroma_bg):
        print(f"Bắt đầu tách phông xanh và ghép nền: {args.chroma_bg}...")
        merged_chroma = temp_dir / "merged_chroma.mp4"
        bg_ext = Path(args.chroma_bg).suffix.lower()
        is_image = bg_ext in ['.png', '.jpg', '.jpeg']

        filter_complex = (
            f"[0:v][1:v]scale2ref=w=iw:h=ih[bg][ref];"
            f"[ref]colorkey={args.chroma_color}:{args.chroma_sim}:{args.chroma_blend}[ckout];"
            f"[bg][ckout]overlay=shortest=1"
        )

        if is_image:
            cmd_chroma = [
                "ffmpeg", "-y",
                "-loop", "1", "-framerate", "30", "-i", str(args.chroma_bg),
                "-i", str(merged_output),
                "-filter_complex", filter_complex,
                "-c:v", "libx264", "-c:a", "copy", "-pix_fmt", "yuv420p",
                str(merged_chroma)
            ]
        else:
            cmd_chroma = [
                "ffmpeg", "-y",
                "-stream_loop", "-1", "-i", str(args.chroma_bg),
                "-i", str(merged_output),
                "-filter_complex", filter_complex,
                "-c:v", "libx264", "-c:a", "copy", "-pix_fmt", "yuv420p",
                str(merged_chroma)
            ]
        
        subprocess.run(cmd_chroma, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        merged_output = merged_chroma

    # Bước 3: Lồng nhạc nền
    bgm_file = audio_dir / "bgm.mp3"
    final_output = final_dir / "promo-final.mp4"
    
    if bgm_file.exists():
        print(f"Mix nhạc nền (âm lượng {args.bgm_volume})...")
        cmd_bgm = [
            "ffmpeg", "-y",
            "-i", str(merged_output),
            "-stream_loop", "-1", "-i", str(bgm_file),
            "-filter_complex", f"[1:a]volume={args.bgm_volume}[bgm];[0:a][bgm]amix=inputs=2:duration=first:dropout_transition=2[a]",
            "-map", "0:v:0", "-map", "[a]",
            "-c:v", "copy", "-c:a", "aac",
            str(final_output)
        ]
        subprocess.run(cmd_bgm, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    else:
        print("Không tìm thấy bgm.mp3, bỏ qua mix nhạc nền.")
        import shutil
        shutil.copy(merged_output, final_output)

    print(f"\n✅ Hoàn tất! Video lưu tại: {final_output}")


if __name__ == "__main__":
    main()
