#!/bin/bash
# Wrapper to run the autonomous research pipeline
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 "$SCRIPT_DIR/run_auto_research.py" "$@"
