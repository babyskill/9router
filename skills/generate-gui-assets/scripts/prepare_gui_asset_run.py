#!/usr/bin/env python3
"""Prepare a GUI asset generation run folder and catalog."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


def parse_pack(value: str) -> dict:
    parts = value.split(":", 2)
    if len(parts) != 3:
        raise argparse.ArgumentTypeError("pack must be id:grid:icon1,icon2")
    pack_id, grid, icons_csv = parts
    icons = [item.strip() for item in icons_csv.split(",") if item.strip()]
    if not pack_id or "x" not in grid or not icons:
        raise argparse.ArgumentTypeError("pack must include id, grid like 4x3, and icons")
    return {"id": pack_id.strip(), "grid": grid.strip(), "icons": icons}


def prompt_for_pack(pack: dict, style_notes: str, chroma_key: str, phase: str) -> str:
    phase_line = (
        "Mode: PREVIEW. Prioritize style and semantic fidelity for approval before bulk generation."
        if phase == "preview"
        else "Mode: BULK. Keep style locked to approved preview and maximize consistency across many packs."
    )
    return "\n".join(
        [
            f"Create one GUI icon atlas on a flat {chroma_key} chroma-key background.",
            phase_line,
            f"Style: {style_notes}.",
            f"Grid: {pack['grid']}, equal cells, centered icons, 10% safe margin.",
            "Icons in row order: " + ", ".join(pack["icons"]) + ".",
            (
                "Quality rules: no text, no labels, no shadows, no glow, no guides, "
                "no duplicate generic placeholders, no clipping, no overlap, no scenery."
            ),
            "Output only the atlas image.",
        ]
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--output-root", default="assets/ui/generated")
    parser.add_argument("--style-notes", required=True)
    parser.add_argument("--chroma-key", default="#FF00FF")
    parser.add_argument("--phase", choices=["preview", "bulk"], default="preview")
    parser.add_argument("--pack", action="append", type=parse_pack, required=True)
    args = parser.parse_args()

    run_dir = Path(args.output_root) / args.run_id
    raw_dir = run_dir / "raw"
    prompts_dir = run_dir / "prompts"
    qa_dir = run_dir / "qa"
    for directory in (raw_dir, prompts_dir, qa_dir):
        directory.mkdir(parents=True, exist_ok=True)

    packs = []
    for pack in args.pack:
        prompt_path = prompts_dir / f"{pack['id']}.txt"
        prompt_path.write_text(prompt_for_pack(pack, args.style_notes, args.chroma_key, args.phase), encoding="utf-8")
        packs.append(
            {
                "id": pack["id"],
                "grid": pack["grid"],
                "icons": pack["icons"],
                "promptFile": str(prompt_path.relative_to(run_dir)),
                "rawFile": str((raw_dir / f"{pack['id']}.png").relative_to(run_dir)),
                "source": None,
                "qa": {"state": "pending", "notes": ""},
            }
        )

    catalog = {
        "runId": args.run_id,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "phase": args.phase,
        "styleNotes": args.style_notes,
        "chromaKey": args.chroma_key,
        "packs": packs,
    }
    (run_dir / "catalog.json").write_text(json.dumps(catalog, indent=2) + "\n", encoding="utf-8")
    print(run_dir)


if __name__ == "__main__":
    main()
