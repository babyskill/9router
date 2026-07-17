import argparse
import json
import subprocess
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


@dataclass(frozen=True)
class Caption:
    start: float
    end: float
    text: str
    placement: str


def _wrap_text(text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    words = text.split(" ")
    lines: list[str] = []
    cur = ""
    for w in words:
        test = (cur + " " + w).strip()
        if not cur or font.getlength(test) <= max_width:
            cur = test
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def _pick_font(project_root: Path) -> str:
    candidates = [
        project_root / "assets" / "fonts" / "BeVietnamPro-Regular.ttf",
        project_root / "assets" / "fonts" / "Inter-Regular.ttf",
        Path("/System/Library/Fonts/Supplemental/Arial.ttf"),
    ]
    for p in candidates:
        if p.exists():
            return str(p)
    raise FileNotFoundError("No font found. Expected assets/fonts/*.ttf or system Arial.")


def _make_caption_overlay(
    *,
    width: int,
    height: int,
    font_path: str,
    text: str,
    placement: str,
    out_path: Path,
) -> None:
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    is_top = placement == "top"
    font_size = 64 if is_top else 54
    font = ImageFont.truetype(font_path, font_size)

    max_w = int(width * (0.82 if is_top else 0.78))
    lines = _wrap_text(text, font, max_w)
    if not lines:
        img.save(out_path)
        return

    line_h = int(font_size * 1.25)
    text_h = line_h * len(lines)
    text_w = int(max(font.getlength(line) for line in lines))

    pad_x = 44 if is_top else 36
    pad_y = 24 if is_top else 22
    box_w = min(width - 120, text_w + pad_x * 2)
    box_h = min(height - 120, text_h + pad_y * 2)

    cx = width // 2
    box_x0 = cx - box_w // 2
    box_y0 = int(height * 0.10) if is_top else int(height * 0.76)
    box_y0 = min(box_y0, height - box_h - 40)

    draw.rounded_rectangle(
        [box_x0, box_y0, box_x0 + box_w, box_y0 + box_h],
        radius=26,
        fill=(0, 0, 0, 165),
    )

    cur_y = box_y0 + pad_y
    for line in lines:
        lw = font.getlength(line)
        x = cx - lw / 2
        draw.text((x, cur_y), line, font=font, fill=(255, 255, 255, 255))
        cur_y += line_h

    img.save(out_path)


def _load_captions(cfg: dict) -> list[Caption]:
    raw = cfg.get("captions") or []
    caps: list[Caption] = []
    for item in raw:
        start = float(item.get("timelineStart", 0))
        duration = float(item.get("duration", 0))
        text = (item.get("text") or "").strip()
        placement = (item.get("placement") or "bottom").strip().lower()
        if duration <= 0 or not text:
            continue
        caps.append(Caption(start=start, end=start + duration, text=text, placement=placement))
    return caps


def _build_ffmpeg_command(
    *,
    project_root: Path,
    cfg: dict,
    out_mp4: Path,
    preset: str,
    include_captions: bool,
    include_decor: bool,
    crf: int,
    badge: str | None,
    badge_start: float,
    badge_duration: float,
) -> list[str]:
    project = cfg["project"]
    width = int(project.get("width", 1080))
    height = int(project.get("height", 1920))
    fps = int(project.get("fps", 30))

    shots = cfg.get("shots") or []
    if not shots:
        raise ValueError("EDL has no shots")

    total_duration = float(project.get("duration") or 0)
    if total_duration <= 0:
        total_duration = sum(float(s["duration"]) for s in shots)

    args: list[str] = ["ffmpeg", "-hide_banner", "-y"]

    for s in shots:
        args += [
            "-ss",
            f'{float(s.get("sourceStart", 0)):.3f}',
            "-t",
            f'{float(s["duration"]):.3f}',
            "-i",
            str(s["source"]),
        ]

    music = cfg.get("music") or {}
    if not music.get("path"):
        raise ValueError("EDL is missing music.path")

    args += [
        "-ss",
        f'{float(music.get("start", 0)):.3f}',
        "-t",
        f"{total_duration:.3f}",
        "-i",
        str(music["path"]),
    ]

    overlays: list[dict] = []
    overlays_dir = out_mp4.parent / "overlays"
    overlays_dir.mkdir(parents=True, exist_ok=True)

    if include_decor and preset in ("cinematic", "clean"):
        decor_files = []
        if preset == "cinematic":
            decor_files = [
                project_root / "assets" / "overlays" / "vignette_1080x1920.png",
                project_root / "assets" / "overlays" / "grain_1080x1920.png",
            ]
        if preset == "clean":
            decor_files = [
                project_root / "assets" / "overlays" / "bottom_fade_1080x1920.png",
                project_root / "assets" / "overlays" / "top_fade_1080x1920.png",
            ]
        for p in decor_files:
            if p.exists():
                overlays.append({"file": str(p), "start": 0.0, "end": total_duration})

    if include_decor and badge and badge != "none" and badge_duration > 0:
        badge_file = project_root / "assets" / "overlays" / f"badge_{badge}_1080x1920.png"
        if badge_file.exists():
            overlays.append(
                {
                    "file": str(badge_file),
                    "start": max(0.0, badge_start),
                    "end": min(total_duration, max(0.0, badge_start + badge_duration)),
                }
            )

    if include_captions:
        font_path = _pick_font(project_root)
        for i, cap in enumerate(_load_captions(cfg), start=1):
            p = overlays_dir / f"cap_{i:02d}.png"
            _make_caption_overlay(
                width=width,
                height=height,
                font_path=font_path,
                text=cap.text,
                placement=cap.placement,
                out_path=p,
            )
            overlays.append({"file": str(p), "start": cap.start, "end": cap.end})

    for ov in overlays:
        args += ["-loop", "1", "-t", f"{total_duration:.3f}", "-i", ov["file"]]

    audio_input_index = len(shots)
    first_overlay_idx = audio_input_index + 1

    vf_parts: list[str] = []
    for i in range(len(shots)):
        vf_parts.append(
            f"[{i}:v]"
            f"scale={width}:{height}:force_original_aspect_ratio=increase,"
            f"crop={width}:{height},fps={fps},format=yuv420p,setpts=PTS-STARTPTS[v{i}]"
        )

    concat_in = "".join([f"[v{i}]" for i in range(len(shots))])
    vf_parts.append(f"{concat_in}concat=n={len(shots)}:v=1:a=0[vcat]")

    v_prev = "[vcat]"
    for j, ov in enumerate(overlays):
        img_idx = first_overlay_idx + j
        v_next = f"[vo{j}]" if j < len(overlays) - 1 else "[vpre]"
        vf_parts.append(
            f"{v_prev}[{img_idx}:v]overlay=0:0:format=auto:shortest=1:"
            f"enable=between(t\\,{ov['start']:.3f}\\,{ov['end']:.3f}){v_next}"
        )
        v_prev = v_next

    vf_parts.append(f"[vpre]trim=duration={total_duration:.3f},setpts=PTS-STARTPTS[vout]")

    volume = float(music.get("volume", 0.55))
    fade_in = float(music.get("fadeIn", 0.4))
    fade_out = float(music.get("fadeOut", 1.0))
    fade_out_start = max(0.0, total_duration - fade_out)

    vf_parts.append(
        f"[{audio_input_index}:a]atrim=0:{total_duration:.3f},asetpts=PTS-STARTPTS,"
        f"volume={volume},"
        f"afade=t=in:st=0:d={fade_in:.3f},"
        f"afade=t=out:st={fade_out_start:.3f}:d={fade_out:.3f},"
        "aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[aout]"
    )

    out_mp4.parent.mkdir(parents=True, exist_ok=True)

    args += [
        "-filter_complex",
        ";".join(vf_parts),
        "-map",
        "[vout]",
        "-map",
        "[aout]",
        "-shortest",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        str(crf),
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-movflags",
        "+faststart",
        str(out_mp4),
    ]
    return args


def cmd_render(args: argparse.Namespace) -> int:
    project_root = Path(args.project_root).resolve()
    edl_path = Path(args.edl).resolve()
    cfg = json.loads(edl_path.read_text("utf-8"))

    out_mp4 = Path(args.out).resolve() if args.out else (edl_path.parent / "_render" / "final.mp4")
    cmd = _build_ffmpeg_command(
        project_root=project_root,
        cfg=cfg,
        out_mp4=out_mp4,
        preset=args.preset,
        include_captions=not args.no_captions,
        include_decor=not args.no_decor,
        crf=args.crf,
        badge=args.badge,
        badge_start=args.badge_start,
        badge_duration=args.badge_duration,
    )

    subprocess.run(cmd, cwd=str(project_root), check=True)
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(prog="video_edit")
    sub = parser.add_subparsers(dest="command", required=True)

    p_render = sub.add_parser("render")
    p_render.add_argument("--edl", required=True)
    p_render.add_argument("--out", default=None)
    p_render.add_argument("--preset", default="cinematic", choices=["cinematic", "clean", "none"])
    p_render.add_argument("--crf", type=int, default=22)
    p_render.add_argument("--badge", default="none", choices=["none", "tip", "warn", "new", "ok"])
    p_render.add_argument("--badge-start", type=float, default=0.3)
    p_render.add_argument("--badge-duration", type=float, default=2.6)
    p_render.add_argument("--project-root", default=str(Path.cwd()))
    p_render.add_argument("--no-captions", action="store_true")
    p_render.add_argument("--no-decor", action="store_true")
    p_render.set_defaults(func=cmd_render)

    ns = parser.parse_args()
    return int(ns.func(ns))


if __name__ == "__main__":
    raise SystemExit(main())
