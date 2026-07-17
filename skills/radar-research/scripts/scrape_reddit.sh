#!/bin/bash
# Wrapper to scrape a subreddit
if [ -z "$1" ]; then
  echo '{"ok": false, "error": "Missing subreddit argument. Usage: scrape_reddit.sh --subreddit <name> [--category <cat>]"}'
  exit 1
fi
python -m radar_cli reddit scrape "$@" --json
