#!/usr/bin/env python3
"""Suggest GUI atlas canvas options ordered from large to small."""

from __future__ import annotations

import argparse


CANVAS_ORDER = [
    ("8x6", 48),
    ("8x5", 40),
    ("6x6", 36),
    ("6x5", 30),
    ("7x4", 28),
    ("5x5", 25),
    ("6x4", 24),
    ("4x4", 16),
    ("4x3", 12),
    ("3x3", 9),
]
QUALITY_ORDER = [("6x5", 30), ("5x5", 25), ("6x4", 24), ("4x4", 16), ("4x3", 12), ("3x3", 9), ("8x6", 48)]


def quality_note(grid: str) -> str:
    if grid == "8x6":
        return "maximum throughput, up to 48 icons in one image; use after preview approval"
    if grid in {"8x5", "6x6"}:
        return "high throughput with slightly more breathing room than 8x6"
    if grid in {"6x5", "7x4", "5x5", "6x4"}:
        return "balanced bulk mode for cleaner semantics"
    if grid == "4x4":
        return "quality-priority compact bulk mode"
    return "precision fallback for difficult icon semantics"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--icon-count", type=int, required=True)
    parser.add_argument(
        "--strategy",
        choices=["throughput", "quality"],
        default="throughput",
        help="throughput: recommend max icon count per image; quality: recommend safer dense canvas",
    )
    args = parser.parse_args()

    icon_count = max(1, args.icon_count)
    print(f"icon_count={icon_count}")
    print("canvas_options_large_to_small:")
    for grid, capacity in CANVAS_ORDER:
        fits = "fits" if capacity >= icon_count else "does_not_fit"
        print(f"- {grid} capacity={capacity} {fits} note=\"{quality_note(grid)}\"")

    if args.strategy == "throughput":
        recommended = "8x6"
    else:
        recommended = next((grid for grid, capacity in QUALITY_ORDER if capacity >= icon_count), "5x5")
    print(f"strategy={args.strategy}")
    print(f"recommended_grid={recommended}")


if __name__ == "__main__":
    main()
