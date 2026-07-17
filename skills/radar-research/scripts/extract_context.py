#!/usr/bin/env python3
import json
import os
import re
import sys
from pathlib import Path

def extract_project_identity(workspace_root: Path) -> dict:
    """Reads .project-identity to get basic project information."""
    identity_path = workspace_root / ".project-identity"
    if identity_path.exists():
        try:
            with open(identity_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[warn] Failed to read .project-identity: {e}", file=sys.stderr)
    return {}

def scan_documents(workspace_root: Path) -> list[Path]:
    """Scans the workspace for relevant documentation files."""
    doc_extensions = {".md", ".txt"}
    exclude_dirs = {"node_modules", ".git", ".agents", ".antigravitycli", ".brain", ".claude", ".qwen", "tmp", "scratch", "backup"}
    
    found_files = []
    
    # Prioritize root documents first
    for item in workspace_root.iterdir():
        if item.is_file() and item.suffix in doc_extensions:
            # Skip templates/schemas if they are generic
            if any(p in item.name.lower() for p in ["prd", "brief", "design", "readme", "context"]):
                found_files.append(item)
                
    # Scan docs/ directory if it exists
    docs_dir = workspace_root / "docs"
    if docs_dir.exists() and docs_dir.is_dir():
        for root, dirs, files in os.walk(docs_dir):
            # Prune excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            for file in files:
                filepath = Path(root) / file
                if filepath.suffix in doc_extensions:
                    found_files.append(filepath)
                    
    return found_files

def extract_parameters_from_file(filepath: Path) -> dict:
    """Parses a file for competitor URLs, subreddits, category tags, and search keywords."""
    content = ""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"[warn] Failed to read file {filepath.name}: {e}", file=sys.stderr)
        return {}
        
    extracted = {
        "competitors": [],
        "subreddits": [],
        "categories": [],
        "keywords": []
    }
    
    # 1. Look for App Store / Google Play URLs
    app_store_pattern = r"(https?://apps\.apple\.com/[a-z]{2}/app/[^/]+/id\d+)"
    play_store_pattern = r"(https?://play\.google\.com/store/apps/details\?id=[a-zA-Z0-9_\.]+)"
    
    extracted["competitors"].extend(re.findall(app_store_pattern, content))
    extracted["competitors"].extend(re.findall(play_store_pattern, content))
    
    # 2. Look for subreddits like r/LoseIt, r/hypertension, r/meditation
    reddit_pattern = r"\br/([a-zA-Z0-9_]{3,21})\b"
    extracted["subreddits"].extend(re.findall(reddit_pattern, content))
    
    # 3. Look for category keywords
    category_patterns = [
        r"category:\s*([a-zA-Z\-]+)",
        r"genre:\s*([a-zA-Z\-]+)",
        r"store-category:\s*([a-zA-Z\-]+)"
    ]
    for pattern in category_patterns:
        extracted["categories"].extend(re.findall(pattern, content, re.IGNORECASE))
        
    return extracted

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Extracts market research parameters from project docs")
    parser.add_argument("--dry-run", action="store_true", help="Print extracted info without saving to file")
    args = parser.parse_args()
    
    workspace_root = Path(os.getcwd())
    print(f"[*] Scanning workspace: {workspace_root}")
    
    identity = extract_project_identity(workspace_root)
    doc_files = scan_documents(workspace_root)
    
    print(f"[*] Found {len(doc_files)} documentation files to scan.")
    
    aggregated = {
        "competitors": [],
        "subreddits": [],
        "categories": [],
        "keywords": []
    }
    
    for doc in doc_files:
        params = extract_parameters_from_file(doc)
        for key in aggregated:
            aggregated[key].extend(params.get(key, []))
            
    # Clean up and de-duplicate lists
    for key in aggregated:
        aggregated[key] = sorted(list(set(aggregated[key])))
        
    # Deduplicate identity techStack / name into keywords
    project_name = identity.get("projectName", "")
    project_goals = identity.get("projectGoals", [])
    
    # Deduce a primary query from project name / goals
    primary_query = ""
    if project_name:
        primary_query = f"{project_name} features and competitors"
    elif project_goals:
        primary_query = f"{project_goals[0]} competitors"
    else:
        primary_query = "mobile app market trends"
        
    # Niche classification & Category fallback
    # Match projectGoals or techStack with standard App Store categories
    default_store_category = "health-fitness"  # Safe default
    default_niche_tag = "health"
    
    # Analyze text to find better categories
    full_text_context = " ".join(project_goals).lower() + " " + project_name.lower()
    if any(k in full_text_context for k in ["camera", "photo", "dazzcam", "filmcam", "lofi"]):
        default_store_category = "photo-video"
        default_niche_tag = "photography"
    elif any(k in full_text_context for k in ["budget", "finance", "money", "expense"]):
        default_store_category = "finance"
        default_niche_tag = "finance"
    elif any(k in full_text_context for k in ["game", "play", "gaming", "arcade"]):
        default_store_category = "games"
        default_niche_tag = "gaming"
        
    store_category = aggregated["categories"][0] if aggregated["categories"] else default_store_category
    niche_tag = aggregated["categories"][0] if aggregated["categories"] else default_niche_tag
    subreddit = aggregated["subreddits"][0] if aggregated["subreddits"] else "loseit"  # Default subreddit loseit
    
    # Save the consolidated context
    output_data = {
        "projectName": project_name,
        "niche": niche_tag,
        "store_category": store_category,
        "primary_query": primary_query,
        "subreddit": subreddit,
        "all_competitors": aggregated["competitors"],
        "all_subreddits": aggregated["subreddits"],
        "all_categories": aggregated["categories"]
    }
    
    if args.dry_run:
        print("\n=== Dry Run Results ===")
        print(json.dumps(output_data, indent=2, ensure_ascii=False))
    else:
        scratch_dir = workspace_root / "scratch"
        scratch_dir.mkdir(exist_ok=True)
        out_path = scratch_dir / "radar_extracted_context.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        print(f"[+] Extracted context saved to: {out_path}")

if __name__ == "__main__":
    main()
