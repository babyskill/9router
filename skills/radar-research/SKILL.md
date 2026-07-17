---
name: radar-research
description: >
  Conduct structured mobile app market research using the radar CLI and API.
  Covers App Store data collection (single/bulk fetch, top charts), Reddit community
  scraping, review analysis, data export, and research note management. Use this skill
  when the user asks to research an app niche, analyze competitors, gather user feedback
  from Reddit, or produce a market research report.
version: 1.0.0
trigger: conditional
activation_keywords:
  - "market research"
  - "competitor research"
  - "user research"
  - "competitor analysis"
  - "nghiên cứu thị trường"
  - "nghiên cứu đối thủ"
  - "phân tích đối thủ"
  - "radar"
  - "/radar"
---

# Radar Research — AI Research Skill

> **Project:** radar-tools (Python 3.10+)
> **Skill Location:** `.agents/skills/radar-research`
> **Primary Executable Tools:** Wrappers located in the `scripts/` directory of the skill folder.
> **API Server (optional):** `http://127.0.0.1:8000` — provides Web UI + REST API

---

## 1. Prerequisites — Health Check

Before ANY research task, verify the environment using the packaged health check script:

```bash
.agents/skills/radar-research/scripts/health.sh
```

**Check these fields in output:**
- `db_ok: true` — SQLite database is functional
- `serpapi_configured: true` — Required for App Store fetching
- `reddit_cookies_exists: true` — Required for Reddit scraping
- `chrome_available: true` — Required for Reddit scraping (Selenium)

> [!IMPORTANT]
> If `serpapi_configured` is `false`, App Store commands will fail.
> If `reddit_cookies_exists` or `chrome_available` is `false`, Reddit scraping will fail.
> Report missing prerequisites to the user before proceeding.

---

## 2. Core Packaged Tools (Scripts)

This skill packages ready-to-use command-line wrappers in its `scripts/` directory. Always use them to gather data:

### 2.1 App Store — Fetch Single App (`fetch_app.sh`)

Fetch metadata + reviews for one App Store URL:

```bash
.agents/skills/radar-research/scripts/fetch_app.sh "<APP_STORE_URL>" \
  --category <CATEGORY_NAME> \
  --max-pages 10 \
  --sort mosthelpful
```

**Parameters:**
- `url` (arg 1): Full Apple App Store URL
- `--category`: Research category tag (e.g., `meditation`, `weight-loss`)
- `--max-pages`: Number of review pages to fetch (default: 10)
- `--sort`: `mosthelpful` (default) or `mostrecent`

### 2.2 App Store — Bulk Fetch (`bulk_fetch.sh`)

Fetch multiple apps from a URL list file:

```bash
.agents/skills/radar-research/scripts/bulk_fetch.sh -f urls.txt \
  --category <CATEGORY_NAME> \
  --max-pages 10 \
  --sort mosthelpful
```

**Parameters:**
- `-f/--file`: Text file with one App Store URL per line
- `--stdin`: Read URLs from stdin instead of file
- `--force`: Re-fetch apps that already exist in DB
- `--category`: Research category tag

### 2.3 App Store — Top Charts (`top_charts.sh`)

Fetch current top app rankings from Apple/Google stores:

```bash
.agents/skills/radar-research/scripts/top_charts.sh \
  --store apple \
  --country us \
  --category health-fitness \
  --chart free \
  --limit 20
```

**Parameters:**
- `--store`: `apple`, `google`, `both` (default: both)
- `--country`: ISO country code (default: us)
- `--category`: Category name (default: overall)
- `--chart`: `free`, `paid`, `grossing` (default: free)
- `--limit`: Number of apps to retrieve (default: 20)

### 2.4 Reddit — Scrape Subreddit (`scrape_reddit.sh`)

Scrape posts + comments from a subreddit:

```bash
.agents/skills/radar-research/scripts/scrape_reddit.sh \
  --subreddit loseit \
  --category weight-loss \
  --max-posts 100
```

**Parameters:**
- `--subreddit`: Subreddit name (without `r/`)
- `--category`: Research category tag
- `--max-posts`: Max posts to inspect
- `--cookies`: Path to cookies JSON
- `--no-headless`: Show browser window (debug)
- `--delay`: Seconds between requests


### 2.5 Grok — Research X/Twitter (`grok_research.sh`)

Run Grok's `/research-engineer` agent workflow to scrape and analyze discussions on X/Twitter:

```bash
.agents/skills/radar-research/scripts/grok_research.sh --query "<QUERY>" \
  --category <CATEGORY_NAME> \
  --entity-type <category|app|subreddit>
```

**Parameters:**
- `--query` / `-q` (required): The search query or prompt to run on X/Twitter (e.g. "lofi camera apps").
- `--category`: Research category tag.
- `--entity-id`: Entity ID (default: category name, app id, or subreddit name).

### 2.6 Automated Unified Research (`auto_research.sh`)

Execute the complete multi-channel research pipeline (Reddit + App Store top competitors + Grok X/Twitter) in a single command:

```bash
.agents/skills/radar-research/scripts/auto_research.sh \
  --query "<GROK_QUERY>" \
  --subreddit <SUBREDDIT_NAME> \
  --category <CATEGORY_TAG> \
  --store-category <STORE_CATEGORY_TAG> \
  --limit <COMPETITOR_COUNT>
```

**Parameters:**
- `--query` / `-q` (required): Grok research query (e.g. "blood pressure tracker app features").
- `--subreddit` / `-r` (required): Subreddit to scrape (e.g. "hypertension").
- `--category` / `-c` (required): General research category tag (e.g. "blood-pressure").
- `--store-category` / `-s`: App Store top charts category to query (default: `health-fitness`).
- `--limit` / `-l`: Number of top apps from charts to fetch reviews for (default: 3).

---


## 3. General radar_cli Entrypoint Reference

If the packaged wrappers are not enough, you can call the module directly:

```bash
python -m radar_cli health
python -m radar_cli grok research --query "lofi camera apps" --category photography

python -m radar_cli app list --category meditation --limit 50 --json
python -m radar_cli reddit list --category weight-loss --json
python -m radar_cli job list --json
python -m radar_cli job show <JOB_ID> --json
python -m radar_cli job wait <JOB_ID> --timeout 600 --json
```

---

## 4. REST API Endpoints (Advanced)

When the API server is running (`uvicorn api.main:app`), these endpoints are available:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `GET /api/apps` | GET | List apps (filter by `?category=` or `?tags=`) |
| `GET /api/apps/{product_id}` | GET | Full app detail with rating distribution |
| `GET /api/apps/{product_id}/reviews` | GET | Paginated reviews (`?rating=`, `?limit=`, `?offset=`) |
| `GET /api/apps/{product_id}/export?format=md&scope=full` | GET | Export app profile + reviews as Markdown |
| `GET /api/apps/{product_id}/export?format=csv` | GET | Export reviews as CSV |
| `GET /api/apps/reviews/bulk?category=X&rating=1` | GET | Bulk reviews across apps (filter by tag, rating) |
| `GET /api/apps/reviews/export?category=X&format=md` | GET | Export bulk reviews |
| `GET /api/apps/compare?ids=ID1,ID2` | GET | Side-by-side app comparison |
| `GET /api/apps/compare/export?ids=ID1,ID2&format=md` | GET | Export comparison report |
| `GET /api/reddit/subreddits` | GET | List scraped subreddits |
| `GET /api/reddit/{name}/posts` | GET | Posts + comments (`?search=`, `?limit=`, `?offset=`) |
| `GET /api/reddit/{name}/export?format=md` | GET | Export subreddit data |
| `GET /api/reddit/{name}/stats` | GET | Subreddit statistics |
| `GET /api/research/{entity_type}/{entity_id}/{doc_type}` | GET | Read research notes |
| `PUT /api/research/{entity_type}/{entity_id}/{doc_type}` | PUT | Save research notes |
| `GET /api/categories` | GET | List categories (`?type=app` or `?type=reddit`) |
| `POST /api/categories` | POST | Create category |

---

## 5. Rules for AI Agents

### MUST DO
- **Use the scripts** in `.agents/skills/radar-research/scripts/` to invoke the CLI tool safely.
- **Always run `health.sh` first** to verify prerequisites before starting research.
- **Always specify `--category`** to organize data into logical research groups.
- **Check exit codes**: `0` = success, non-zero = error. Parse the output JSON.

### MUST NOT DO
- **DO NOT** run Reddit scrape without verifying `chrome_available` and `reddit_cookies_exists` via `health.sh`.
- **DO NOT** fetch more than 50 apps in a single bulk operation without user confirmation.
- **DO NOT** use `--force` on bulk fetch unless explicitly asked.
