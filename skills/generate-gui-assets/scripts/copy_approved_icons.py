#!/usr/bin/env python3
"""Copy approved extracted GUI icons as-is and write a manifest."""

from __future__ import annotations

import argparse
import json
import shutil
from collections import defaultdict
from pathlib import Path


def unique_name(name: str, seen: defaultdict[str, int]) -> str:
    seen[name] += 1
    if seen[name] == 1:
        return name
    return f"{name}_{seen[name]}"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", required=True)
    parser.add_argument("--run-dir", required=True)
    parser.add_argument("--mapping", required=True, help="JSON list of {source,name} entries")
    parser.add_argument("--technique", default="copy-approved-icons-as-is")
    args = parser.parse_args()

    source_dir = Path(args.source_dir)
    run_dir = Path(args.run_dir)
    mapping = json.loads(Path(args.mapping).read_text(encoding="utf-8"))
    icons_dir = run_dir / "final" / "icons"
    icons_dir.mkdir(parents=True, exist_ok=True)

    seen: defaultdict[str, int] = defaultdict(int)
    records = []
    for item in mapping:
        source_name = item["source"]
        semantic_name = unique_name(item["name"], seen)
        source_path = source_dir / source_name
        if not source_path.exists():
            raise SystemExit(f"missing source icon: {source_path}")
        destination = icons_dir / f"{semantic_name}{source_path.suffix.lower()}"
        shutil.copy2(source_path, destination)
        records.append(
            {
                "name": semantic_name,
                "file": str(destination.relative_to(run_dir / "final")),
                "source": str(source_path),
            }
        )

    manifest = {
        "runId": run_dir.name,
        "sourceDir": str(source_dir),
        "technique": args.technique,
        "icons": records,
    }
    manifest_path = run_dir / "final" / "icons_manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(manifest_path)


if __name__ == "__main__":
    main()
