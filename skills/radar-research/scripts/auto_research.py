#!/usr/bin/env python3
"""Unified Auto Research Script for radar-tools.
Runs health check, scrapes Reddit, pulls top App Store charts, fetches competitor reviews,
and executes Grok research on X/Twitter.
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path


def run_command(cmd: list[str]) -> dict:
    """Run a CLI command and return its JSON output."""
    try:
        res = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=True
        )
        return json.loads(res.stdout)
    except subprocess.CalledProcessError as e:
        print(f"[error] Command failed: {' '.join(cmd)}", file=sys.stderr)
        print(f"[error] Stderr: {e.stderr}", file=sys.stderr)
        return {"ok": False, "error": e.stderr or str(e)}
    except json.JSONDecodeError as e:
        print(f"[error] Failed to parse JSON response: {e}", file=sys.stderr)
        return {"ok": False, "error": "Invalid JSON response"}


def main() -> None:
    parser = argparse.ArgumentParser(description="Automated multi-channel health research script")
    parser.add_argument("--query", "-q", required=True, help="Search query or topic for Grok research")
    parser.add_argument("--subreddit", "-r", required=True, help="Subreddit name to scrape (without r/)")
    parser.add_argument("--category", "-c", required=True, help="Primary research category tag")
    parser.add_argument("--store-category", "-s", default="health-fitness", help="App Store category/genre (default: health-fitness)")
    parser.add_argument("--limit", "-l", type=int, default=3, help="Number of top apps to fetch reviews for")
    parser.add_argument("--reddit-method", default="rss", choices=["rss", "selenium"], help="Scraping method: rss or selenium")
    
    args = parser.parse_args()
    
    print("=== [1/5] Running Environment Health Check ===")
    health = run_command([sys.executable, "-m", "radar_cli", "health", "--json"])
    if not health.get("db_ok"):
        print("[error] Database is not OK. Aborting research.", file=sys.stderr)
        sys.exit(1)
    print("Environment is healthy.")

    print(f"\n=== [2/5] Scraping & Scoring Subreddit: r/{args.subreddit} ===")
    reddit_scrape = run_command([
        sys.executable, "-m", "radar_cli", "reddit", "scrape",
        "--subreddit", args.subreddit,
        "--category", args.category,
        "--max-posts", "50",
        "--method", args.reddit_method,
        "--json"
    ])
    if reddit_scrape.get("ok") is False:
        print(f"[warn] Reddit scrape failed: {reddit_scrape.get('error')}")
    else:
        print(f"Scraped {reddit_scrape.get('posts_count', 0)} posts.")

    reddit_score = run_command([
        sys.executable, "-m", "radar_cli", "reddit", "score",
        "--subreddit", args.subreddit,
        "--category", args.category,
        "--limit", "10",
        "--json"
    ])
    print(f"Scored posts. Total Buyer Signals: {reddit_score.get('total_buyer', 0)}")

    print(f"\n=== [3/5] Fetching Top Charts & Competitor Reviews ({args.store_category}) ===")
    top_charts = run_command([
        sys.executable, "-m", "radar_cli", "app", "top",
        "--store", "apple",
        "--country", "us",
        "--category", args.store_category,
        "--limit", "5",
        "--json"
    ])
    
    items = top_charts.get("items", [])
    fetched_apps = []
    
    if not items:
        print("[warn] No apps found in top charts.")
    else:
        print(f"Found {len(items)} apps. Fetching reviews for top {args.limit} apps...")
        for i, app in enumerate(items[:args.limit]):
            app_url = app.get("url")
            app_title = app.get("title", "Unknown")
            if not app_url:
                continue
            print(f"  ({i+1}/{args.limit}) Fetching reviews for: {app_title}...")
            app_fetch = run_command([
                sys.executable, "-m", "radar_cli", "app", "fetch",
                app_url,
                "--category", args.category,
                "--max-pages", "5",
                "--json"
            ])
            fetched_apps.append({
                "title": app_title,
                "app_id": app.get("app_id"),
                "url": app_url,
                "status": "success" if app_fetch.get("ok") else "failed"
            })

    print(f"\n=== [4/5] Running Grok Realtime X/Twitter Research ===")
    grok_res = run_command([
        sys.executable, "-m", "radar_cli", "grok", "research",
        "--query", args.query,
        "--category", args.category,
        "--entity-type", "category",
        "--json"
    ])
    
    if grok_res.get("ok"):
        print(f"Grok research finished successfully. Report saved at: {grok_res.get('filepath')}")
    else:
        print(f"[warn] Grok research failed: {grok_res.get('error')}")

    print("\n=== [5/5] Consolidating Research Summary ===")
    summary = {
        "query": args.query,
        "category": args.category,
        "subreddit": args.subreddit,
        "reddit_posts_scraped": reddit_scrape.get("posts_count", 0),
        "reddit_buyer_signals": reddit_score.get("total_buyer", 0),
        "top_competitors_fetched": fetched_apps,
        "grok_research_status": "success" if grok_res.get("ok") else "failed",
        "grok_research_filepath": grok_res.get("filepath")
    }
    
    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
