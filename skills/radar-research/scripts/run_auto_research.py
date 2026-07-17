#!/usr/bin/env python3
import json
import os
import subprocess
import sys
from pathlib import Path

def main():
    script_dir = Path(__file__).parent.resolve()
    workspace_root = Path(os.getcwd())
    
    print("=== [Radar Autonomous Pipeline] ===")
    
    # 1. Run context extraction
    print("[*] Extracting project context...")
    extract_script = script_dir / "extract_context.py"
    try:
        subprocess.run([sys.executable, str(extract_script)], check=True)
    except subprocess.CalledProcessError as e:
        print(f"[error] Context extraction failed: {e}", file=sys.stderr)
        sys.exit(1)
        
    context_path = workspace_root / "scratch" / "radar_extracted_context.json"
    if not context_path.exists():
        print("[error] Extracted context file not found.", file=sys.stderr)
        sys.exit(1)
        
    with open(context_path, "r", encoding="utf-8") as f:
        context = json.load(f)
        
    print("[*] Extracted parameters:")
    print(f"  - Project: {context.get('projectName')}")
    print(f"  - Query: {context.get('primary_query')}")
    print(f"  - Subreddit: r/{context.get('subreddit')}")
    print(f"  - Store Category: {context.get('store_category')}")
    print(f"  - Niche: {context.get('niche')}")
    
    # 2. Run health check
    print("\n[*] Running health check...")
    health_script = script_dir / "health.sh"
    try:
        res = subprocess.run([str(health_script)], capture_output=True, text=True, check=True)
        print(res.stdout)
    except subprocess.CalledProcessError as e:
        print(f"[warn] Health check failed or returned warning:\n{e.stderr}", file=sys.stderr)
        # Continue anyway to allow partial results
        
    # 3. Execute auto research
    print("\n[*] Launching auto_research.py...")
    auto_research_script = script_dir / "auto_research.py"
    
    cmd = [
        sys.executable, str(auto_research_script),
        "--query", context.get("primary_query"),
        "--subreddit", context.get("subreddit"),
        "--category", context.get("niche"),
        "--store-category", context.get("store_category"),
        "--limit", "3",
        "--reddit-method", "selenium"
    ]
    
    try:
        # Run and capture output
        process_res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        stdout = process_res.stdout
        print(stdout)
        
        # Parse JSON summary from stdout (it prints JSON at the end)
        summary = {}
        lines = stdout.strip().split("\n")
        json_str = ""
        started = False
        for line in lines:
            if line.strip() == "{":
                started = True
            if started:
                json_str += line + "\n"
                
        if json_str:
            try:
                summary = json.loads(json_str)
            except json.JSONDecodeError:
                print("[warn] Failed to parse JSON summary from stdout.")
                
    except subprocess.CalledProcessError as e:
        print(f"[error] Auto research execution failed:\nStdout: {e.stdout}\nStderr: {e.stderr}", file=sys.stderr)
        sys.exit(1)
        
    # 4. Generate beautiful Markdown report
    print("\n[*] Generating research report...")
    report_dir = workspace_root / "docs" / "research"
    report_dir.mkdir(parents=True, exist_ok=True)
    report_path = report_dir / "market_research_report.md"
    
    grok_report_content = ""
    grok_path_str = summary.get("grok_research_filepath")
    if grok_path_str:
        grok_path = Path(grok_path_str)
        if grok_path.exists():
            try:
                with open(grok_path, "r", encoding="utf-8") as gf:
                    grok_report_content = gf.read()
            except Exception as ge:
                print(f"[warn] Could not read Grok report file: {ge}")
                
    report_md = f"""# Market & Competitive Research Report

> **Project**: {context.get('projectName', 'Unknown')}
> **Generated on**: 2026-07-12
> **Niche/Category**: `{context.get('niche')}` (Store Category: `{context.get('store_category')}`)

---

## 1. Executive Summary

Autonomous market scan was executed with the following targets:
- **Search Query**: "{context.get('primary_query')}"
- **Target Community**: [r/{context.get('subreddit')}](https://reddit.com/r/{context.get('subreddit')})

### Target Parameters & Context
- Extracted Niche Category: `{context.get('niche')}`
- Discovered competitors: {len(context.get('all_competitors', []))} listed in documents.

---

## 2. Reddit User Insights

We scraped `r/{context.get('subreddit')}` to analyze user frustrations, feedback, and potential buyer signals.
- **Posts Scraped**: {summary.get('reddit_posts_scraped', 0)}
- **Buyer Signals Detected**: {summary.get('reddit_buyer_signals', 0)}

---

## 3. App Store Competitor Scan

We checked the top charts for `{context.get('store_category')}` and fetched reviews for key competitors.

| Competitor | App ID | Status | URL |
|------------|--------|--------|-----|
"""

    for comp in summary.get("top_competitors_fetched", []):
        report_md += f"| {comp.get('title')} | `{comp.get('app_id')}` | {comp.get('status')} | [App Store Link]({comp.get('url')}) |\n"
        
    report_md += f"""
---

## 4. Grok Realtime X/Twitter Insights

Below is the detailed intelligence collected from real-time discussions on X/Twitter:

"""
    if grok_report_content:
        report_md += grok_report_content
    else:
        report_md += "*No detailed Grok report was generated or retrieved.*"
        
    report_md += """
---

## 5. Strategic Recommendations

Based on the multi-channel intelligence:
1. **Target Feature Gap**: Identify unmet needs reported on Reddit.
2. **Review/Rating Strategy**: Emulate competitor strengths and avoid top complaints fetched from store reviews.
3. **Keyword Optimization**: Target high-intent queries highlighted by Grok.
"""

    with open(report_path, "w", encoding="utf-8") as rf:
        rf.write(report_md)
        
    print(f"[+] Unified research report successfully generated at: {report_path}")

if __name__ == "__main__":
    main()
