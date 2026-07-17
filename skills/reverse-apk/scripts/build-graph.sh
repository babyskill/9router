#!/usr/bin/env bash
# build-graph.sh — emit a Graphviz nav graph (nodes = activities, edges = explicit
# startActivity targets found in smali). Best-effort; pairs well with `gitnexus analyze`.
# Usage: build-graph.sh <APK_DIR>  ->  <APK_DIR>/_re_map/nav-graph.dot
set -euo pipefail
APK_DIR="${1:-}"
[[ -z "$APK_DIR" || ! -d "$APK_DIR" ]] && { echo "Usage: build-graph.sh <APK_DIR>" >&2; exit 1; }
APK_DIR="$(cd "$APK_DIR" && pwd)"
OUT="$APK_DIR/_re_map"; mkdir -p "$OUT"
DOT="$OUT/nav-graph.dot"
SMALI_DIRS=$(find "$APK_DIR" -maxdepth 1 -type d -name 'smali*')

{
  echo 'digraph nav {'
  echo '  rankdir=LR; node [shape=box, style=rounded];'
  # nodes: activities from manifest inventory if present
  if [[ -f "$OUT/raw/10_activities.txt" ]]; then
    while IFS= read -r a; do
      [[ -z "$a" ]] && continue
      short="${a##*.}"
      echo "  \"$short\";"
    done < "$OUT/raw/10_activities.txt"
  fi
  # edges: "const-class ... ActivityB" inside ActivityA.smali => A -> B (heuristic)
  for d in $SMALI_DIRS; do
    grep -rlE 'Landroid.*startActivity|const-class.*Activity;' "$d" 2>/dev/null || true
  done | sort -u | while IFS= read -r f; do
    [[ -z "$f" ]] && continue
    src="$(basename "$f" .smali)"
    grep -oE 'L[a-zA-Z0-9/_$]*Activity;' "$f" 2>/dev/null \
      | sed -E 's#.*/([A-Za-z0-9_$]+);#\1#' | sort -u | while IFS= read -r dst; do
        [[ -n "$dst" && "$dst" != "$src" ]] && echo "  \"$src\" -> \"$dst\";"
      done
  done | sort -u
  echo '}'
} > "$DOT"

echo "==> Nav graph: $DOT"
echo "    Render: dot -Tpng \"$DOT\" -o \"$OUT/nav-graph.png\"  (needs graphviz)"
echo "    Richer graph: run \`npx gitnexus analyze\` on the decompiled source, then use gitnexus-intelligence."
