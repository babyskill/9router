#!/usr/bin/env python3
"""Validate a GUI asset generation catalog."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


VALID_QA_STATES = {"pending", "approved", "regenerate", "rejected"}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--run-dir", required=True)
    args = parser.parse_args()

    run_dir = Path(args.run_dir)
    catalog_path = run_dir / "catalog.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    errors = []

    if not catalog.get("runId"):
        errors.append("missing runId")
    if not catalog.get("packs"):
        errors.append("missing packs")

    for index, pack in enumerate(catalog.get("packs", [])):
        prefix = f"packs[{index}]"
        for key in ("id", "grid", "icons", "promptFile", "rawFile", "qa"):
            if key not in pack:
                errors.append(f"{prefix} missing {key}")
        if pack.get("promptFile") and not (run_dir / pack["promptFile"]).exists():
            errors.append(f"{prefix} promptFile does not exist: {pack['promptFile']}")
        if pack.get("qa", {}).get("state") not in VALID_QA_STATES:
            errors.append(f"{prefix} invalid qa.state")
        if pack.get("rawFile") and pack.get("qa", {}).get("state") == "approved" and not (run_dir / pack["rawFile"]).exists():
            errors.append(f"{prefix} approved rawFile does not exist: {pack['rawFile']}")

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        raise SystemExit(1)

    print("catalog-ok")


if __name__ == "__main__":
    main()
