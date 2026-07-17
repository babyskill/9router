#!/usr/bin/env python3
"""Build a GUI asset contact sheet from catalog raw files."""

from __future__ import annotations

import argparse
import json
import math
import shutil
import subprocess
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--run-dir", required=True)
    parser.add_argument("--output", default="qa/contact_sheet.png")
    parser.add_argument("--background", default="#FFF9F1")
    args = parser.parse_args()

    run_dir = Path(args.run_dir)
    catalog = json.loads((run_dir / "catalog.json").read_text(encoding="utf-8"))
    images = [run_dir / pack["rawFile"] for pack in catalog.get("packs", []) if (run_dir / pack["rawFile"]).exists()]
    if not images:
        raise SystemExit("no raw pack images found")

    output = run_dir / args.output
    output.parent.mkdir(parents=True, exist_ok=True)

    magick = shutil.which("magick")
    montage = shutil.which("montage")
    if magick:
        tile_cols = min(3, max(1, math.ceil(math.sqrt(len(images)))))
        tile = f"{tile_cols}x"
        subprocess.run(
            [magick, "montage", *map(str, images), "-tile", tile, "-geometry", "+18+18", "-background", args.background, str(output)],
            check=True,
        )
    elif montage:
        subprocess.run(
            [montage, *map(str, images), "-tile", "3x", "-geometry", "+18+18", "-background", args.background, str(output)],
            check=True,
        )
    else:
        raise SystemExit("ImageMagick not found: install magick or montage to build contact sheet")

    print(output)


if __name__ == "__main__":
    main()
