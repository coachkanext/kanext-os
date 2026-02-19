"""
Scraper configuration — base URLs, rate limits, seasons, DB config.
"""

SPORT = "mbkb"
SEASON = "2025-26"

# robots.txt says Crawl-Delay: 10 for generic user-agents
CRAWL_DELAY = 10  # seconds between requests

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "kanext_player_pool",
}

# ── NJCAA ──
NJCAA_BASE_URL = "https://njcaastats.prestosports.com"
NJCAA_DIVISIONS = ["div1", "div2", "div3"]
NJCAA_DIV_TO_LEVEL_KEY = {
    "div1": "njcaa_d1",
    "div2": "njcaa_d2",
    "div3": "njcaa_d3",
}
NJCAA_DIV_DISPLAY = {
    "div1": "Division I",
    "div2": "Division II",
    "div3": "Division III",
}

# ── NAIA ──
NAIA_BASE_URL = "https://naiastats.prestosports.com"
NAIA_LEVEL_KEY = "naia"

# ── CCCAA (3C2A — California Community Colleges) ──
CCCAA_BASE_URL = "https://cccaa.prestosports.com"
CCCAA_LEVEL_KEY = "cccaa"

# Legacy aliases (used by existing NJCAA codepaths)
BASE_URL = NJCAA_BASE_URL
DIVISIONS = NJCAA_DIVISIONS
DIV_TO_LEVEL_KEY = NJCAA_DIV_TO_LEVEL_KEY
DIV_DISPLAY = NJCAA_DIV_DISPLAY
