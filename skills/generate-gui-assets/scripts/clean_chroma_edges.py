#!/usr/bin/env python3
"""Clean leftover chroma-key fringe from transparent PNG assets.

This is intentionally conservative: it only targets low-alpha pixels close to the
configured key color, then bleeds nearby foreground RGB into fully transparent
edge pixels so image scaling cannot sample hidden chroma color.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image


DEFAULT_PATHS = (
    "assets/ui/icons/v2/final",
    "assets/mascot/v2/final",
    "assets/mascot/v3/final",
    "assets/illustrations/v1/final",
)


def smoothstep(edge0: float, edge1: float, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def shifted(values: np.ndarray, dy: int, dx: int) -> np.ndarray:
    out = np.zeros_like(values)
    src_y0 = max(0, -dy)
    src_y1 = values.shape[0] - max(0, dy)
    src_x0 = max(0, -dx)
    src_x1 = values.shape[1] - max(0, dx)
    dst_y0 = max(0, dy)
    dst_y1 = values.shape[0] - max(0, -dy)
    dst_x0 = max(0, dx)
    dst_x1 = values.shape[1] - max(0, -dx)
    out[dst_y0:dst_y1, dst_x0:dst_x1] = values[src_y0:src_y1, src_x0:src_x1]
    return out


def bleed_rgb(
    rgb: np.ndarray,
    alpha: np.ndarray,
    chroma_mask: np.ndarray,
    target_mask: np.ndarray,
    iterations: int,
) -> np.ndarray:
    result = rgb.copy()
    valid = (alpha > 8) & ~chroma_mask
    seed = valid.copy()
    remaining = target_mask.copy()

    for _ in range(iterations):
        accum = np.zeros_like(result, dtype=np.float32)
        counts = np.zeros(alpha.shape, dtype=np.float32)

        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dy == 0 and dx == 0:
                    continue
                neighbor_valid = shifted(seed, dy, dx)
                fill = remaining & neighbor_valid
                if not np.any(fill):
                    continue
                neighbor_rgb = shifted(result, dy, dx)
                accum[fill] += neighbor_rgb[fill]
                counts[fill] += 1.0

        filled = counts > 0
        if not np.any(filled):
            break
        result[filled] = np.clip(accum[filled] / counts[filled, None], 0, 255).astype(np.uint8)
        seed[filled] = True
        remaining[filled] = False

    return result


def expand_mask(mask: np.ndarray, iterations: int) -> np.ndarray:
    result = mask.copy()
    for _ in range(iterations):
        expanded = result.copy()
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dy == 0 and dx == 0:
                    continue
                expanded |= shifted(result, dy, dx)
        if np.array_equal(expanded, result):
            break
        result = expanded
    return result


def clean_array(
    rgba: np.ndarray,
    key: tuple[int, int, int],
    hard_dist: float,
    soft_dist: float,
    max_alpha: int,
    bleed_iterations: int,
    edge_despill: bool,
    edge_radius: int,
    edge_strength: float,
) -> tuple[np.ndarray, dict[str, int]]:
    arr = rgba.copy()
    rgb = arr[..., :3].astype(np.float32)
    alpha = arr[..., 3].astype(np.float32)
    key_rgb = np.array(key, dtype=np.float32)
    dist = np.sqrt(np.sum((rgb - key_rgb) ** 2, axis=2))

    candidate = (alpha > 0) & (alpha <= max_alpha) & (dist < soft_dist)
    hard = candidate & (dist <= hard_dist)
    feather = candidate & (dist > hard_dist)

    matte = smoothstep(hard_dist, soft_dist, dist)
    new_alpha = alpha.copy()
    new_alpha[hard] = 0.0
    new_alpha[feather] = np.minimum(new_alpha[feather], alpha[feather] * matte[feather])

    old_a = np.clip(alpha / 255.0, 1.0 / 255.0, 1.0)
    unmixed = (rgb - key_rgb * (1.0 - old_a[..., None])) / old_a[..., None]
    spill = candidate & ~hard
    rgb[spill] = np.clip(unmixed[spill], 0, 255)

    chroma_mask = dist < soft_dist
    rgb_uint8 = np.clip(rgb, 0, 255).astype(np.uint8)
    alpha_uint8 = np.clip(np.rint(new_alpha), 0, 255).astype(np.uint8)
    near_foreground = expand_mask(alpha_uint8 > 8, min(3, bleed_iterations))
    hidden_chroma = (alpha <= 8) & chroma_mask & near_foreground
    rgb_uint8 = bleed_rgb(rgb_uint8, alpha_uint8, chroma_mask, hidden_chroma, bleed_iterations)

    arr[..., :3] = rgb_uint8
    arr[..., 3] = alpha_uint8

    edge_pixels = 0
    if edge_despill:
        arr, edge_pixels = despill_opaque_edge(arr, edge_radius, edge_strength, bleed_iterations)

    changed = np.any(arr != rgba, axis=2)
    stats = {
        "changed": int(np.count_nonzero(changed)),
        "keyed": int(np.count_nonzero(hard)),
        "feathered": int(np.count_nonzero(feather)),
        "edge": edge_pixels,
    }
    return arr, stats


def despill_opaque_edge(
    rgba: np.ndarray,
    radius: int,
    strength: float,
    bleed_iterations: int,
) -> tuple[np.ndarray, int]:
    arr = rgba.copy()
    rgb = arr[..., :3].astype(np.uint8)
    alpha = arr[..., 3]
    opaque = alpha > 8
    edge = expand_mask(~opaque, radius) & opaque

    r = rgb[..., 0].astype(np.int16)
    g = rgb[..., 1].astype(np.int16)
    b = rgb[..., 2].astype(np.int16)
    magenta_score = (np.minimum(r, b) - g) + (b - g)
    edge_spill = (
        edge
        & (r > 130)
        & (b > 115)
        & ((np.minimum(r, b) - g) > 22)
        & ((b - g) > 18)
    )
    if not np.any(edge_spill):
        return arr, 0

    repaired_rgb = bleed_rgb(rgb, alpha, edge_spill, edge_spill, bleed_iterations)
    matte = smoothstep(55.0, 275.0, magenta_score.astype(np.float32))
    new_alpha = alpha.astype(np.float32)
    new_alpha[edge_spill] *= 1.0 - np.clip(strength, 0.0, 1.0) * matte[edge_spill]

    arr[..., :3] = repaired_rgb
    arr[..., 3] = np.clip(np.rint(new_alpha), 0, 255).astype(np.uint8)
    return arr, int(np.count_nonzero(edge_spill))


def png_paths(paths: list[str]) -> list[Path]:
    files: list[Path] = []
    for item in paths:
        path = Path(item)
        if path.is_file() and path.suffix.lower() == ".png":
            files.append(path)
        elif path.is_dir():
            files.extend(sorted(path.rglob("*.png")))
    return sorted(set(files))


def parse_key(value: str) -> tuple[int, int, int]:
    raw = value.strip().lstrip("#")
    if len(raw) != 6:
        raise argparse.ArgumentTypeError("key must be a 6-digit hex color")
    return tuple(int(raw[i : i + 2], 16) for i in (0, 2, 4))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("paths", nargs="*", default=list(DEFAULT_PATHS))
    parser.add_argument("--key", type=parse_key, default=parse_key("#ff00ff"))
    parser.add_argument("--hard-dist", type=float, default=42.0)
    parser.add_argument("--soft-dist", type=float, default=118.0)
    parser.add_argument("--max-alpha", type=int, default=180)
    parser.add_argument("--bleed-iterations", type=int, default=10)
    parser.add_argument("--edge-despill", action="store_true")
    parser.add_argument("--edge-radius", type=int, default=3)
    parser.add_argument("--edge-strength", type=float, default=0.75)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    files = png_paths(args.paths)
    totals = {"files": 0, "changed": 0, "keyed": 0, "feathered": 0}

    for path in files:
        original = np.array(Image.open(path).convert("RGBA"))
        cleaned, stats = clean_array(
            original,
            args.key,
            args.hard_dist,
            args.soft_dist,
            args.max_alpha,
            args.bleed_iterations,
            args.edge_despill,
            args.edge_radius,
            args.edge_strength,
        )
        if stats["changed"] == 0:
            continue

        totals["files"] += 1
        totals["changed"] += stats["changed"]
        totals["keyed"] += stats["keyed"]
        totals["feathered"] += stats["feathered"]
        totals["edge"] = totals.get("edge", 0) + stats["edge"]
        action = "cleaned" if args.apply else "would clean"
        print(
            f"{action} {path}: changed={stats['changed']} "
            f"keyed={stats['keyed']} feathered={stats['feathered']} edge={stats['edge']}"
        )
        if args.apply:
            Image.fromarray(cleaned, "RGBA").save(path)

    mode = "APPLIED" if args.apply else "DRY_RUN"
    print(
        f"{mode} files={totals['files']} changed={totals['changed']} "
        f"keyed={totals['keyed']} feathered={totals['feathered']} edge={totals.get('edge', 0)}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
