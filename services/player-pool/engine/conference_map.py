"""
NCAA Division 1 Men's Basketball — Conference Map (2025-26 season)

Maps team names (both ESPN full names and short names) to their conference.
Covers 5 high-major conferences and 5 mid-major conferences.

High-major:  ACC, Big Ten, Big 12, SEC, Big East
Mid-major:   Mountain West, Atlantic 10, American, WCC, MVC

Also provides:
  - assign_d1_tier(team_conference) → ncaa_d1_high_major / mid_major / low_major
  - normalize_conference(conf) → canonical conference name
"""
from __future__ import annotations
from typing import Optional, Dict, List, Tuple


# ═══════════════════════════════════════════════════════════════════════════
# D1 TIER ASSIGNMENT — Conference → HM/MM/LM
# ═══════════════════════════════════════════════════════════════════════════

HIGH_MAJOR_CONFERENCES = {
    "ACC",
    "Big Ten",
    "Big 12",
    "SEC",
    "Big East",
}

MID_MAJOR_CONFERENCES = {
    "Mountain West",
    "Atlantic 10",
    "American",
    "American Athletic",
    "WCC",
    "West Coast",
    "Missouri Valley",
    "MVC",
}


def normalize_conference(conf: str) -> str:
    if not conf:
        return ""
    c = conf.strip()
    if c in {"American Athletic Conference", "AAC"}:
        return "American"
    if c in {"West Coast Conference"}:
        return "West Coast"
    if c in {"Mountain West Conference"}:
        return "Mountain West"
    if c in {"Atlantic 10 Conference", "A-10", "A10"}:
        return "Atlantic 10"
    if c in {"Missouri Valley Conference"}:
        return "Missouri Valley"
    if c in {"Big Ten Conference"}:
        return "Big Ten"
    if c in {"Southeastern Conference"}:
        return "SEC"
    if c in {"Atlantic Coast Conference"}:
        return "ACC"
    if c in {"Big 12 Conference"}:
        return "Big 12"
    if c in {"Big East Conference"}:
        return "Big East"
    return c


def assign_d1_tier(team_conference: str) -> str:
    """Map a conference name to ncaa_d1_high_major / mid_major / low_major."""
    c = normalize_conference(team_conference)
    if c in HIGH_MAJOR_CONFERENCES:
        return "ncaa_d1_high_major"
    if c in MID_MAJOR_CONFERENCES:
        return "ncaa_d1_mid_major"
    return "ncaa_d1_low_major"

# ── helpers ────────────────────────────────────────────────────────────
def _expand(conf: str, teams: List[Tuple[str, str]]) -> Dict[str, str]:
    """
    Given a conference name and a list of (short_name, full_name) tuples,
    return a dict mapping both variants to the conference.
    """
    m: Dict[str, str] = {}
    for short, full in teams:
        m[short] = conf
        m[full] = conf
    return m


# ── ACC (18 teams) ────────────────────────────────────────────────────
_ACC = [
    ("Boston College",  "Boston College Eagles"),
    ("California",      "California Golden Bears"),
    ("Cal",             "Cal Golden Bears"),
    ("Clemson",         "Clemson Tigers"),
    ("Duke",            "Duke Blue Devils"),
    ("Florida State",   "Florida State Seminoles"),
    ("Georgia Tech",    "Georgia Tech Yellow Jackets"),
    ("Louisville",      "Louisville Cardinals"),
    ("Miami",           "Miami Hurricanes"),
    ("Miami (FL)",      "Miami (FL) Hurricanes"),
    ("NC State",        "NC State Wolfpack"),
    ("North Carolina",  "North Carolina Tar Heels"),
    ("Notre Dame",      "Notre Dame Fighting Irish"),
    ("Pitt",            "Pitt Panthers"),
    ("Pittsburgh",      "Pittsburgh Panthers"),
    ("SMU",             "SMU Mustangs"),
    ("Stanford",        "Stanford Cardinal"),
    ("Syracuse",        "Syracuse Orange"),
    ("Virginia",        "Virginia Cavaliers"),
    ("Virginia Tech",   "Virginia Tech Hokies"),
    ("Wake Forest",     "Wake Forest Demon Deacons"),
]

# ── Big Ten (18 teams) ───────────────────────────────────────────────
_BIG_TEN = [
    ("Illinois",        "Illinois Fighting Illini"),
    ("Indiana",         "Indiana Hoosiers"),
    ("Iowa",            "Iowa Hawkeyes"),
    ("Maryland",        "Maryland Terrapins"),
    ("Michigan State",  "Michigan State Spartans"),
    ("Michigan",        "Michigan Wolverines"),
    ("Minnesota",       "Minnesota Golden Gophers"),
    ("Nebraska",        "Nebraska Cornhuskers"),
    ("Northwestern",    "Northwestern Wildcats"),
    ("Ohio State",      "Ohio State Buckeyes"),
    ("Oregon",          "Oregon Ducks"),
    ("Penn State",      "Penn State Nittany Lions"),
    ("Penn St.",        "Penn State Nittany Lions"),
    ("Purdue",          "Purdue Boilermakers"),
    ("Rutgers",         "Rutgers Scarlet Knights"),
    ("UCLA",            "UCLA Bruins"),
    ("USC",             "USC Trojans"),
    ("Washington",      "Washington Huskies"),
    ("Wisconsin",       "Wisconsin Badgers"),
]

# ── Big 12 (16 teams) ────────────────────────────────────────────────
_BIG_12 = [
    ("Arizona",         "Arizona Wildcats"),
    ("Arizona State",   "Arizona State Sun Devils"),
    ("Baylor",          "Baylor Bears"),
    ("BYU",             "BYU Cougars"),
    ("Cincinnati",      "Cincinnati Bearcats"),
    ("Colorado",        "Colorado Buffaloes"),
    ("Houston",         "Houston Cougars"),
    ("Iowa State",      "Iowa State Cyclones"),
    ("Kansas",          "Kansas Jayhawks"),
    ("Kansas State",    "Kansas State Wildcats"),
    ("Kansas St.",      "Kansas State Wildcats"),
    ("Oklahoma State",  "Oklahoma State Cowboys"),
    ("TCU",             "TCU Horned Frogs"),
    ("Texas Tech",      "Texas Tech Red Raiders"),
    ("UCF",             "UCF Knights"),
    ("Utah",            "Utah Utes"),
    ("West Virginia",   "West Virginia Mountaineers"),
]

# ── SEC (16 teams) ───────────────────────────────────────────────────
_SEC = [
    ("Alabama",         "Alabama Crimson Tide"),
    ("Arkansas",        "Arkansas Razorbacks"),
    ("Auburn",          "Auburn Tigers"),
    ("Florida",         "Florida Gators"),
    ("Georgia",         "Georgia Bulldogs"),
    ("Kentucky",        "Kentucky Wildcats"),
    ("LSU",             "LSU Tigers"),
    ("Mississippi State","Mississippi State Bulldogs"),
    ("Missouri",        "Missouri Tigers"),
    ("Oklahoma",        "Oklahoma Sooners"),
    ("Ole Miss",        "Ole Miss Rebels"),
    ("South Carolina",  "South Carolina Gamecocks"),
    ("Tennessee",       "Tennessee Volunteers"),
    ("Texas",           "Texas Longhorns"),
    ("Texas A&M",       "Texas A&M Aggies"),
    ("Vanderbilt",      "Vanderbilt Commodores"),
]

# ── Big East (11 teams) ──────────────────────────────────────────────
_BIG_EAST = [
    ("Butler",          "Butler Bulldogs"),
    ("UConn",           "UConn Huskies"),
    ("Connecticut",     "Connecticut Huskies"),
    ("Creighton",       "Creighton Bluejays"),
    ("DePaul",          "DePaul Blue Demons"),
    ("Georgetown",      "Georgetown Hoyas"),
    ("Marquette",       "Marquette Golden Eagles"),
    ("Providence",      "Providence Friars"),
    ("Seton Hall",      "Seton Hall Pirates"),
    ("St. John's",      "St. John's Red Storm"),
    ("Villanova",       "Villanova Wildcats"),
    ("Xavier",          "Xavier Musketeers"),
]

# ── Mountain West (12 teams) ─────────────────────────────────────────
_MOUNTAIN_WEST = [
    ("Air Force",       "Air Force Falcons"),
    ("Boise State",     "Boise State Broncos"),
    ("Colorado State",  "Colorado State Rams"),
    ("Fresno State",    "Fresno State Bulldogs"),
    ("Grand Canyon",    "Grand Canyon Antelopes"),
    ("Nevada",          "Nevada Wolf Pack"),
    ("New Mexico",      "New Mexico Lobos"),
    ("San Diego State", "San Diego State Aztecs"),
    ("San Jose State",  "San Jose State Spartans"),
    ("UNLV",            "UNLV Rebels"),
    ("Utah State",      "Utah State Aggies"),
    ("Utah St.",        "Utah State Aggies"),
    ("Wyoming",         "Wyoming Cowboys"),
]

# ── Atlantic 10 (14 teams) ───────────────────────────────────────────
_ATLANTIC_10 = [
    ("Davidson",        "Davidson Wildcats"),
    ("Dayton",          "Dayton Flyers"),
    ("Duquesne",        "Duquesne Dukes"),
    ("Fordham",         "Fordham Rams"),
    ("George Mason",    "George Mason Patriots"),
    ("George Washington","George Washington Revolutionaries"),
    ("GW",              "GW Revolutionaries"),
    ("La Salle",        "La Salle Explorers"),
    ("Loyola Chicago",  "Loyola Chicago Ramblers"),
    ("Rhode Island",    "Rhode Island Rams"),
    ("Richmond",        "Richmond Spiders"),
    ("Saint Joseph's",  "Saint Joseph's Hawks"),
    ("St. Joseph's",    "St. Joseph's Hawks"),
    ("Saint Louis",     "Saint Louis Billikens"),
    ("St. Bonaventure", "St. Bonaventure Bonnies"),
    ("VCU",             "VCU Rams"),
]

# ── American (AAC) (13 teams) ────────────────────────────────────────
_AMERICAN = [
    ("Charlotte",       "Charlotte 49ers"),
    ("East Carolina",   "East Carolina Pirates"),
    ("ECU",             "East Carolina Pirates"),
    ("FAU",             "Florida Atlantic Owls"),
    ("Florida Atlantic","Florida Atlantic Owls"),
    ("Memphis",         "Memphis Tigers"),
    ("North Texas",     "North Texas Mean Green"),
    ("Rice",            "Rice Owls"),
    ("South Florida",   "South Florida Bulls"),
    ("USF",             "South Florida Bulls"),
    ("Temple",          "Temple Owls"),
    ("Tulane",          "Tulane Green Wave"),
    ("Tulsa",           "Tulsa Golden Hurricane"),
    ("UAB",             "UAB Blazers"),
    ("UTSA",            "UTSA Roadrunners"),
    ("Wichita State",   "Wichita State Shockers"),
]

# ── WCC / West Coast (12 teams) ──────────────────────────────────────
_WCC = [
    ("Gonzaga",         "Gonzaga Bulldogs"),
    ("Loyola Marymount","Loyola Marymount Lions"),
    ("LMU",             "Loyola Marymount Lions"),
    ("Oregon State",    "Oregon State Beavers"),
    ("Pacific",         "Pacific Tigers"),
    ("Pepperdine",      "Pepperdine Waves"),
    ("Portland",        "Portland Pilots"),
    ("Saint Mary's",    "Saint Mary's Gaels"),
    ("St. Mary's",      "St. Mary's Gaels"),
    ("San Diego",       "San Diego Toreros"),
    ("San Francisco",   "San Francisco Dons"),
    ("Santa Clara",     "Santa Clara Broncos"),
    ("Seattle",         "Seattle U Redhawks"),
    ("Seattle U",       "Seattle U Redhawks"),
    ("Washington State","Washington State Cougars"),
    ("Washington St.",  "Washington State Cougars"),
    ("Wazzu",           "Washington State Cougars"),
]

# ── MVC / Missouri Valley (11 teams) ─────────────────────────────────
_MVC = [
    ("Belmont",         "Belmont Bruins"),
    ("Bradley",         "Bradley Braves"),
    ("Drake",           "Drake Bulldogs"),
    ("Evansville",      "Evansville Purple Aces"),
    ("Illinois State",  "Illinois State Redbirds"),
    ("Indiana State",   "Indiana State Sycamores"),
    ("Murray State",    "Murray State Racers"),
    ("Northern Iowa",   "Northern Iowa Panthers"),
    ("UNI",             "Northern Iowa Panthers"),
    ("Southern Illinois","Southern Illinois Salukis"),
    ("SIU",             "Southern Illinois Salukis"),
    ("Missouri State",  "Missouri State Bears"),
    ("Missouri St.",    "Missouri State Bears"),
    ("UIC",             "UIC Flames"),
    ("Valparaiso",      "Valparaiso Beacons"),
]


# ── Build the master map ─────────────────────────────────────────────
NCAA_D1_CONFERENCE_MAP: Dict[str, str] = {}
for _conf, _teams in [
    ("ACC",           _ACC),
    ("Big Ten",       _BIG_TEN),
    ("Big 12",        _BIG_12),
    ("SEC",           _SEC),
    ("Big East",      _BIG_EAST),
    ("Mountain West", _MOUNTAIN_WEST),
    ("Atlantic 10",   _ATLANTIC_10),
    ("American",      _AMERICAN),
    ("WCC",           _WCC),
    ("MVC",           _MVC),
]:
    NCAA_D1_CONFERENCE_MAP.update(_expand(_conf, _teams))


# ── Convenience lookup ────────────────────────────────────────────────
def get_conference(team_name: str) -> Optional[str]:
    """
    Look up conference by team name.  Tries exact match first,
    then case-insensitive match.
    """
    hit = NCAA_D1_CONFERENCE_MAP.get(team_name)
    if hit:
        return hit
    # case-insensitive fallback
    lower = team_name.lower()
    for key, val in NCAA_D1_CONFERENCE_MAP.items():
        if key.lower() == lower:
            return val
    return None


def resolve_d1_conference(team_name: str, db_conference: str | None = None) -> str:
    """Resolve conference for an NCAA D1 team.

    Priority:
      1. Name-based lookup in conference map (most complete)
      2. DB conference if available
      3. Empty string (will be defaulted to low major)
    """
    # Try name-based lookup first (covers both ESPN short + full names)
    conf = get_conference(team_name)
    if conf:
        return conf
    # Fall back to DB conference
    if db_conference:
        return normalize_conference(db_conference)
    return ""


# ── Quick sanity check ────────────────────────────────────────────────
if __name__ == "__main__":
    print(f"Total entries in NCAA_D1_CONFERENCE_MAP: {len(NCAA_D1_CONFERENCE_MAP)}")
    print()
    # count unique short names per conference
    from collections import Counter
    conf_counts = Counter(NCAA_D1_CONFERENCE_MAP.values())
    for c, n in sorted(conf_counts.items(), key=lambda x: -x[1]):
        print(f"  {c:15s}  {n:3d} entries")
    print()
    # spot checks
    tests = [
        "Duke", "Duke Blue Devils",
        "Alabama", "Alabama Crimson Tide",
        "Gonzaga", "Gonzaga Bulldogs",
        "UConn", "Connecticut Huskies",
        "Kansas", "Kansas Jayhawks",
        "Memphis", "Memphis Tigers",
        "Belmont", "Belmont Bruins",
        "VCU", "VCU Rams",
        "San Diego State", "San Diego State Aztecs",
        "Cal", "California Golden Bears",
    ]
    for t in tests:
        print(f"  {t:35s} -> {get_conference(t)}")
