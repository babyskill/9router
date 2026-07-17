#!/bin/bash
# Wrapper to run the unified auto research flow
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 "$SCRIPT_DIR/auto_research.py" "$@"
