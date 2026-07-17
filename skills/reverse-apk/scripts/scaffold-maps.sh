#!/usr/bin/env bash
# scaffold-maps.sh — copy the 4 canonical map templates into <APK_DIR>/_re_map/
# Does NOT overwrite existing files (safe to re-run). Usage: scaffold-maps.sh <APK_DIR>
set -euo pipefail
APK_DIR="${1:-}"
[[ -z "$APK_DIR" || ! -d "$APK_DIR" ]] && { echo "Usage: scaffold-maps.sh <APK_DIR>" >&2; exit 1; }
APK_DIR="$(cd "$APK_DIR" && pwd)"
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$APK_DIR/_re_map"
mkdir -p "$DEST"
for f in 01_APP_MAP 02_SCREEN_INVENTORY 03_RESOURCE_INVENTORY 04_TECHNICAL_FINDINGS; do
  if [[ -f "$DEST/$f.md" ]]; then
    echo "  skip (exists): $f.md"
  else
    cp "$SKILL_DIR/templates/$f.md" "$DEST/$f.md"
    echo "  created: $f.md"
  fi
done
echo "==> Maps scaffolded in: $DEST"
echo "    Fill them using the raw inventory in $DEST/raw/"
