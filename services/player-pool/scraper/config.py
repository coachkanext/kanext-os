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

# ── USCAA ──
USCAA_BASE_URL = "https://uscaa.prestosports.com"
USCAA_LEVEL_KEY = "uscaa"

# ── NCCAA (Sidearm Sports — NOT PrestoSports) ──
NCCAA_BASE_URL = "https://thenccaa.org"
NCCAA_API_URL = "https://thenccaa.org/services/conf_stats.ashx"
NCCAA_SPORT_PATHS = {
    "d1": "mbball",
    "d2": "mbball2",
}
NCCAA_DIV_TO_LEVEL_KEY = {
    "d1": "nccaa_d1",
    "d2": "nccaa_d2",
}
NCCAA_DIV_DISPLAY = {
    "d1": "NCCAA Division I",
    "d2": "NCCAA Division II",
}
# Sidearm uses "year" param that maps to the start of the academic year
# For season 2025-26, the year param is "2025"
NCCAA_YEAR = "2025"

# ── NCAA ──
NCAA_BASE_URL = "https://stats.ncaa.org"
NCAA_SPORT_CODE = "MBB"
NCAA_ACADEMIC_YEAR = "2026.0"  # 2025-26 season
NCAA_DIV_TO_LEVEL_KEY = {
    "1": "ncaa_d1",
    "2": "ncaa_d2",
    "3": "ncaa_d3",
}
NCAA_DIV_DISPLAY = {
    "1": "NCAA Division I",
    "2": "NCAA Division II",
    "3": "NCAA Division III",
}
# stat_seq IDs for individual player ranking pages
NCAA_STAT_SEQ = {
    "ppg":     "136.0",   # Points Per Game: FGM, 3FG, FT, PTS, PPG
    "rpg":     "137.0",   # Rebounds Per Game: REB, RPG
    "apg":     "140.0",   # Assists Per Game: AST, APG
    "spg":     "139.0",   # Steals Per Game: ST, STPG
    "bpg":     "138.0",   # Blocks Per Game: BLKS, BKPG
    "fg_pct":  "141.0",   # Field Goal %: FGM, FGA, FG%
    "3p_pct":  "143.0",   # Three-Point %: 3FG, 3FGA, 3FG%
    "ft_pct":  "142.0",   # Free Throw %: FT, FTA, FT%
    "ato":     "473.0",   # Assist/Turnover Ratio: AST, TO, Ratio
    "mpg":     "628.0",   # Minutes Per Game: MP, MPG
    "oreb_pg": "856.0",   # Offensive Rebounds/G: ORebs, RPG
    "dreb_pg": "858.0",   # Defensive Rebounds/G: DRebs, RPG
    "total_reb": "601.0", # Total Rebounds: ORebs, DRebs, REB
}
# Team stat_seq IDs
NCAA_TEAM_STAT_SEQ = {
    "scoring_offense": "145.0",  # GM, W-L, PTS, PPG
    "win_pct":         "168.0",  # W, L, Pct
}

# Legacy aliases (used by existing NJCAA codepaths)
BASE_URL = NJCAA_BASE_URL
DIVISIONS = NJCAA_DIVISIONS
DIV_TO_LEVEL_KEY = NJCAA_DIV_TO_LEVEL_KEY
DIV_DISPLAY = NJCAA_DIV_DISPLAY
