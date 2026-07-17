#!/bin/bash
# Wrapper to fetch multiple apps in bulk
if [ -z "$1" ]; then
  echo '{"ok": false, "error": "Missing input file. Usage: bulk_fetch.sh -f <file.txt> [--category <cat>]"}'
  exit 1
fi
python -m radar_cli app bulk "$@" --json
