"""
Generate ncaa_d3_batch*.txt files for ALL D3 teams.

Queries ncaa-api.henrygd.me for the full D3 team list, excludes teams
already in existing batch files, and writes new batches of 20 teams each.

Usage:
    python3 gen_d3_batches.py [--dry-run]

Output: batches/ncaa_d3_batch5.txt, batch6.txt, ... (continues numbering)
"""
from __future__ import annotations

import os
import sys
import time
import httpx

BATCH_DIR = os.path.join(os.path.dirname(__file__), "batches")
BATCH_SIZE = 20
NCAA_API   = "https://ncaa-api.henrygd.me"
DRY_RUN    = "--dry-run" in sys.argv


def fetch_d3_teams() -> list[tuple[str, str]]:
    """Return [(slug, name), ...] for every D3 basketball team."""
    url = f"{NCAA_API}/team/basketball-men/d3"
    print(f"Fetching {url} ...")
    r = httpx.get(url, follow_redirects=True, timeout=60)
    r.raise_for_status()
    data = r.json()

    teams = []
    # Response structure: {"data": {"all_conferences": [{"teams": [...]}]}}
    for conf in data.get("data", {}).get("all_conferences", []):
        for team in conf.get("teams", []):
            slug = team.get("slug") or team.get("seo_slug") or ""
            name = team.get("name", "")
            if slug and name:
                teams.append((slug, name))
    return teams


def load_existing_slugs() -> set[str]:
    """Load all slugs already in ncaa_d3_batch*.txt files."""
    slugs: set[str] = set()
    for fname in os.listdir(BATCH_DIR):
        if not fname.startswith("ncaa_d3_batch"):
            continue
        with open(os.path.join(BATCH_DIR, fname)) as f:
            for line in f:
                line = line.strip()
                if "|" in line:
                    slugs.add(line.split("|")[0].strip())
    return slugs


def next_batch_number() -> int:
    """Find the next available batch number."""
    n = 1
    for fname in os.listdir(BATCH_DIR):
        if fname.startswith("ncaa_d3_batch") and fname.endswith(".txt"):
            try:
                num = int(fname.replace("ncaa_d3_batch", "").replace(".txt", ""))
                n = max(n, num + 1)
            except ValueError:
                pass
    return n


def main():
    all_teams   = fetch_d3_teams()
    print(f"  {len(all_teams)} total D3 teams from NCAA API")

    existing    = load_existing_slugs()
    print(f"  {len(existing)} slugs already in existing batch files")

    new_teams   = [(s, n) for s, n in all_teams if s not in existing]
    print(f"  {len(new_teams)} new teams to batch\n")

    if not new_teams:
        print("Nothing to do — all D3 teams already have batch files.")
        return

    batch_num   = next_batch_number()
    batches_written = 0

    for i in range(0, len(new_teams), BATCH_SIZE):
        chunk = new_teams[i:i + BATCH_SIZE]
        fname = os.path.join(BATCH_DIR, f"ncaa_d3_batch{batch_num}.txt")
        if DRY_RUN:
            print(f"[dry-run] Would write {fname} ({len(chunk)} teams):")
            for slug, name in chunk:
                print(f"  {slug}|{name}")
        else:
            with open(fname, "w") as f:
                for slug, name in chunk:
                    f.write(f"{slug}|{name}\n")
            print(f"Wrote {fname} ({len(chunk)} teams)")
        batch_num += 1
        batches_written += 1

    print(f"\n{'[dry-run] ' if DRY_RUN else ''}Done — {batches_written} batch files, {len(new_teams)} teams total.")
    if not DRY_RUN:
        print("\nNext step — run the box-score scraper for each new batch:")
        for i in range(4 + 1, 4 + batches_written + 1):
            print(f"  python3 ncaa_api_scraper.py batches/ncaa_d3_batch{i}.txt d3")
        print("\nThen backfill season stats:")
        print("  python3 backfill_player_season_stats.py ncaa_d3")
        print("\nThen re-export:")
        print("  python3 export_to_json.py")


if __name__ == "__main__":
    main()
