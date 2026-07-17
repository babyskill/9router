#!/bin/bash
# Wrapper to run Grok research-engineer workflow
if [ -z "$1" ]; then
  echo '{"ok": false, "error": "Missing query. Usage: grok_research.sh -q <query> [--category <cat>] [--entity-type <type>] [--entity-id <id>]"}'
  exit 1
fi
python -m radar_cli grok research "$@" --json
