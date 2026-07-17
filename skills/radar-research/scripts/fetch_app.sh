#!/bin/bash
# Wrapper to fetch a single app's details and reviews
if [ -z "$1" ]; then
  echo '{"ok": false, "error": "Missing App Store URL. Usage: fetch_app.sh <URL> [--category <cat>] [--max-pages <num>] [--sort <sort>]"}'
  exit 1
fi
python -m radar_cli app fetch "$@" --json
