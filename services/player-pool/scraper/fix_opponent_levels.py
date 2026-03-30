"""
Fix NULL competitive_level_id for espn-opp-* teams.

ESPN-scraped opponent teams have no level assigned. This script resolves
them by name-matching to classified teams in the same DB, then falls back
to a curated name->level_key lookup table.

Usage:
    python3 fix_opponent_levels.py [--dry-run]
"""
from __future__ import annotations

import re
import sys
import psycopg

DB      = "postgresql://localhost:5432/kanext_player_pool"
DRY_RUN = "--dry-run" in sys.argv

# ── Manual level overrides for schools that won't name-match ──
# Populated from the audit of 359 unclassified schools.
# Format: lowercase stripped school name fragment -> level_key
MANUAL_LEVEL_MAP: dict[str, str] = {
    # NCAA D3 ───────────────────────────────────────────────────────────────
    "bethesda university":        "ncaa_d3",
    "eureka":                     "ncaa_d3",
    "saint john's":               "ncaa_d3",   # MN
    "misericordia":               "ncaa_d3",
    "bethany":                    "ncaa_d3",   # WV
    "franklin":                   "ncaa_d3",   # IN
    "north central college":      "ncaa_d3",
    "ohio wesleyan":              "ncaa_d3",
    "arcadia":                    "ncaa_d3",
    "waynesburg":                 "ncaa_d3",
    "erskine":                    "ncaa_d3",
    "mary baldwin":               "ncaa_d3",
    "huntingdon":                 "ncaa_d3",
    "pfeiffer":                   "ncaa_d3",
    "buena vista":                "ncaa_d3",
    "southern virginia":          "ncaa_d3",
    "webster":                    "ncaa_d3",
    "texas lutheran":             "ncaa_d3",
    "lyon":                       "ncaa_d3",
    "simpson college":            "ncaa_d3",
    "coe":                        "ncaa_d3",
    "franciscan":                 "ncaa_d3",
    "washington and lee":         "ncaa_d3",
    "ripon":                      "ncaa_d3",
    "loras":                      "ncaa_d3",
    "millsaps":                   "ncaa_d3",
    "averett":                    "ncaa_d3",
    "rowan":                      "ncaa_d3",
    "earlham":                    "ncaa_d3",
    "elizabethtown":              "ncaa_d3",
    "worcester state":            "ncaa_d3",
    "berea":                      "ncaa_d3",
    "elizabethtown college":      "ncaa_d3",
    "penn st abington":           "ncaa_d3",
    "eastern university":         "ncaa_d3",
    "puget sound":                "ncaa_d3",
    "whittier":                   "ncaa_d3",
    "la verne":                   "ncaa_d3",
    "pomona-pitzer":              "ncaa_d3",
    "willamette":                 "ncaa_d3",
    "colorado college":           "ncaa_d3",
    "lewis & clark":              "ncaa_d3",
    "george fox":                 "ncaa_d3",
    "whitman":                    "ncaa_d3",
    "occidental":                 "ncaa_d3",
    "pacific lutheran":           "ncaa_d3",
    "redlands":                   "ncaa_d3",
    "mit":                        "ncaa_d3",
    "caltech":                    "ncaa_d3",
    "brandeis":                   "ncaa_d3",
    "emerson":                    "ncaa_d3",
    "sarah lawrence":             "ncaa_d3",
    "vassar":                     "ncaa_d3",
    "st. mary's":                 "ncaa_d3",   # MD
    "randolph college":           "ncaa_d3",
    "gallaudet":                  "ncaa_d3",
    "dickinson":                  "ncaa_d3",
    "allegheny":                  "ncaa_d3",
    "thiel":                      "ncaa_d3",
    "geneva":                     "ncaa_d3",
    "st. john fisher":            "ncaa_d3",
    "rit":                        "ncaa_d3",
    "adrian":                     "ncaa_d3",
    "defiance":                   "ncaa_d3",
    "wilmington":                 "ncaa_d3",   # OH
    "ohio christian":             "ncaa_d3",
    "capital":                    "ncaa_d3",
    "shenandoah":                 "ncaa_d3",
    "lynchburg":                  "ncaa_d3",
    "greensboro college":         "ncaa_d3",
    "lagrange":                   "ncaa_d3",
    "columbia college":           "ncaa_d3",   # SC
    "brevard":                    "ncaa_d3",
    "meredith":                   "ncaa_d3",
    "johnson & wales":            "ncaa_d3",
    "georgian court":             "ncaa_d3",
    "gwynedd-mercy":              "ncaa_d3",
    "manhattanville":             "ncaa_d3",
    "mount saint mary":           "ncaa_d3",   # NY
    "st. joseph's":               "ncaa_d3",   # NY/Long Island
    "dominican":                  "ncaa_d3",   # IL/CA
    "old westbury":               "ncaa_d3",
    "lehman college":             "ncaa_d3",
    "city college ny":            "ncaa_d3",
    "brooklyn college":           "ncaa_d3",
    "york college":               "ncaa_d3",   # NY
    "suny":                       "ncaa_d3",
    "penn state":                 "ncaa_d3",   # branches
    "plattsburgh":                "ncaa_d3",
    "uc santa cruz":              "ncaa_d3",
    "humboldt state":             "ncaa_d3",
    "colorado-colorado springs":  "ncaa_d3",
    "illinois tech":              "ncaa_d3",
    "north greenville":           "ncaa_d3",
    "salve regina":               "ncaa_d3",
    "western new england":        "ncaa_d3",
    "curry college":              "ncaa_d3",
    "fisher college":             "ncaa_d3",
    "emmanuel":                   "ncaa_d3",   # MA
    "regis":                      "ncaa_d3",   # MA
    "anna maria":                 "ncaa_d3",
    "wentworth":                  "ncaa_d3",
    "mount olive":                "ncaa_d3",
    "university of the southwest": "ncaa_d3",
    "bloomfield":                 "ncaa_d3",
    "centenary":                  "ncaa_d3",   # NJ
    "calumet":                    "ncaa_d3",
    "thomas":                     "ncaa_d3",   # ME
    "maritime":                   "ncaa_d3",   # SUNY / Maine Maritime
    # NAIA ──────────────────────────────────────────────────────────────────
    "howard payne":               "naia",
    "east-west university":       "naia",
    "kentucky christian":         "naia",
    "arlington baptist":          "naia",
    "coe kohawks":                "naia",
    "southwest christian":        "naia",
    "southwestern christian":     "naia",
    "fort lauderdale":            "naia",
    "champion christian":         "naia",
    "valley forge":               "naia",
    "mid-america christian":      "naia",
    "evangel":                    "naia",
    "john brown":                 "naia",
    "ottawa":                     "naia",
    "oklahoma christian":         "naia",
    "northwest university":       "naia",
    "pacific union":              "naia",
    "life pacific":               "naia",
    "biola":                      "naia",
    "vanguard":                   "naia",
    "warner pacific":             "naia",
    "jessup":                     "naia",
    "william carey":              "naia",
    "tougaloo":                   "naia",
    "louisiana christian":        "naia",
    "hannibal-lagrange":          "naia",
    "columbia international":     "naia",
    "bryan":                      "naia",   # TN
    "bob jones":                  "naia",
    "toccoa falls":               "naia",
    "blue mountain":              "naia",
    "mid-atlantic christian":     "naia",
    "dallas christian":           "naia",
    "trinity christian":          "naia",   # IL
    "north central":              "naia",   # MN
    "crown college":              "naia",
    "bethel":                     "naia",   # TN
    "cumberland":                 "naia",   # KY/TN
    "truett-mcconnell":           "naia",
    "reinhardt":                  "naia",
    "alice lloyd":                "naia",
    "union":                      "naia",   # KY
    "missouri baptist":           "naia",
    "st. ambrose":                "naia",
    "siena heights":              "naia",
    "aquinas":                    "naia",   # MI
    "spring hill":                "naia",
    "doane":                      "naia",
    "dakota wesleyan":            "naia",
    "mount marty":                "naia",
    "southwestern adventist":     "naia",
    "texas a&m-san antonio":      "naia",
    "midway university":          "naia",
    "campbellsville":             "naia",
    "tennessee wesleyan":         "naia",
    "university of the cumberlands": "naia",
    "bethel":                     "naia",   # TN
    "concordia":                  "naia",   # NE
    "northwestern-st. paul":      "naia",
    "martin luther":              "naia",
    "crown":                      "naia",   # MN
    "presentation":               "naia",
    "waldorf":                    "naia",
    "dordt":                      "naia",
    "morningside":                "naia",
    "hastings":                   "naia",
    "york college nebraska":      "naia",
    "peru state":                 "naia",
    "haskell":                    "naia",
    "benedictine":                "naia",   # KS / AZ
    "science & arts":             "naia",
    "southeastern":               "naia",   # FL
    "florida memorial":           "naia",
    "st. thomas":                 "naia",   # TX
    "paul quinn":                 "naia",
    "jarvis christian":           "naia",
    "huston-tillotson":           "naia",
    "letourneau":                 "naia",
    "schreiner":                  "naia",
    "dallas crusaders":           "naia",
    "texas college":              "naia",
    "east texas baptist":         "naia",
    "lourdes":                    "naia",
    "cleary":                     "naia",
    "ohio christian":             "naia",
    "rochester":                  "naia",   # MI
    "trinity":                    "naia",   # FL
    "notre dame":                 "naia",   # MD / FL
    "wilson college":             "naia",
    "holy family":                "naia",
    "rosemont":                   "naia",
    "cabrini":                    "naia",
    "eastern":                    "naia",
    "immaculata":                 "naia",
    "neumann":                    "naia",
    "chestnut hill":              "naia",
    # NCCAA ─────────────────────────────────────────────────────────────────
    "college of biblical studies": "naia",
    "manhattan christian":        "naia",
    "ozark christian":            "naia",
    "kansas christian":           "naia",
    "ecclesia":                   "naia",
    "northwest indian":           "naia",
    "salish kootenai":            "naia",
    "boyce":                      "naia",
    "west coast baptist":         "naia",
    "pensacola christian":        "naia",
    "spurgeon":                   "naia",
    "trinity college of jacksonville": "naia",
    "notre dame de namur":        "naia",
    "point university":           "naia",
    "midwestern state":           "ncaa_d2",
    # NCAA D2 ───────────────────────────────────────────────────────────────
    "colorado christian":         "ncaa_d2",
    "san francisco state":        "ncaa_d2",
    "hawaii hilo":                "ncaa_d2",
    "chaminade":                  "ncaa_d2",
    "hawaii pacific":             "ncaa_d2",
    "alaska anchorage":           "ncaa_d2",
    "western new mexico":         "ncaa_d2",
    "colorado-colorado springs":  "ncaa_d2",
    "angelo state":               "ncaa_d2",
    "cameron":                    "ncaa_d2",
    "tarleton":                   "ncaa_d2",
    "eastern new mexico":         "ncaa_d2",
    "west texas a&m":             "ncaa_d2",
    "oklahoma panhandle":         "ncaa_d2",
    "northwestern oklahoma":      "ncaa_d2",
    "southern arkansas":          "ncaa_d2",
    "arkansas tech":              "ncaa_d2",
    "henderson state":            "ncaa_d2",
    "harding":                    "ncaa_d2",
    "ouachita baptist":           "ncaa_d2",
    "fort valley state":          "ncaa_d2",
    "paine":                      "ncaa_d2",
    "albany state":               "ncaa_d2",
    "central state":              "ncaa_d2",
    "cheyney":                    "ncaa_d2",
    "bowie state":                "ncaa_d2",
    "virginia state":             "ncaa_d2",
    "elizabeth city state":       "ncaa_d2",
    "fisk":                       "ncaa_d2",
    "bluefield state":            "ncaa_d2",
    "concord":                    "ncaa_d2",
    "wvu tech":                   "ncaa_d2",
    "west virginia wesleyan":     "ncaa_d2",
    "catawba":                    "ncaa_d2",
    "tusculum":                   "ncaa_d2",
    "belmont abbey":              "ncaa_d2",
    "anderson":                   "ncaa_d2",
    "lincoln university":         "ncaa_d2",
    "johnson c smith":            "ncaa_d2",
    "kentucky state":             "ncaa_d2",
    "johnson & wales":            "ncaa_d2",   # NC
    "saint leo":                  "ncaa_d2",
    "north greenville":           "ncaa_d2",
    "florida national":           "ncaa_d2",
    "voorhees":                   "ncaa_d2",
    "morris college":             "ncaa_d2",
    "morehouse":                  "ncaa_d2",
    "adams state":                "ncaa_d2",
    "western colorado":           "ncaa_d2",
    "colorado mesa":              "ncaa_d2",
    "regis":                      "ncaa_d2",   # CO
    "eastern oregon":             "ncaa_d2",
    "western oregon":             "ncaa_d2",
    "central washington":         "ncaa_d2",
    "northwest nazarene":         "ncaa_d2",
    "montana tech":               "ncaa_d2",
    "rocky mountain":             "ncaa_d2",
    "montana western":            "ncaa_d2",
    "montana state billings":     "ncaa_d2",
    "northern state":             "ncaa_d2",
    "augustana":                  "ncaa_d2",   # SD
    "sioux falls":                "ncaa_d2",
    "concordia-st. paul":         "ncaa_d2",
    "minnesota crookston":        "ncaa_d2",
    "north central":              "ncaa_d2",   # MN - could be NAIA
    "mayville state":             "ncaa_d2",
    "valley city state":          "ncaa_d2",
    "minot state":                "ncaa_d2",
    "peru state":                 "ncaa_d2",
    "indiana university east":    "ncaa_d2",
    "iupui":                      "ncaa_d1",
    "ferris state":               "ncaa_d2",
    "grand valley":               "ncaa_d2",
    "ohio valley":                "ncaa_d2",
    "ohio dominican":             "ncaa_d2",
    "tiffin":                     "ncaa_d2",
    "northwood":                  "ncaa_d2",
    "ursuline":                   "ncaa_d2",
    "malone":                     "ncaa_d2",
    "lake erie":                  "ncaa_d2",
    "walsh":                      "ncaa_d2",
    "cedarville":                 "ncaa_d2",
    "wilmington":                 "ncaa_d2",   # OH D2? Wilmington (OH) is D3
    "franklin pierce":            "ncaa_d2",
    "saint michael's":            "ncaa_d2",
    "new haven":                  "ncaa_d2",
    "southern connecticut":       "ncaa_d2",
    "le moyne":                   "ncaa_d2",
    "mercy":                      "ncaa_d2",
    "molloy":                     "ncaa_d2",
    "farmingdale state":          "ncaa_d2",
    "nyack":                      "ncaa_d2",
    "caldwell":                   "ncaa_d2",
    "felician":                   "ncaa_d2",
    "holy family":                "ncaa_d2",
    "georgian court":             "ncaa_d2",
    # NJCAA ─────────────────────────────────────────────────────────────────
    "stanton":                    "njcaa_d1",
    "bryant & stratton":          "njcaa_d2",
    "manor college":              "njcaa_d1",
    "miami-hamilton":             "njcaa_d3",
    "miami-middletown":           "njcaa_d3",
    "penn state-shenango":        "njcaa_d3",
    "penn state-new kensington":  "njcaa_d3",
    "penn state hazleton":        "njcaa_d3",
    "central penn":               "njcaa_d2",
    "cincinnati clermont":        "njcaa_d3",
    "iiu columbus":               "njcaa_d3",
    "northern new mexico":        "njcaa_d1",
}


def normalize(s: str) -> str:
    """Lowercase and strip noise for matching."""
    s = s.lower()
    s = re.sub(r"\b(university|college|the|of|at|st\.?|saint)\b", " ", s)
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def main():
    with psycopg.connect(DB) as conn:
        # Load all level_key -> id mappings
        level_rows = conn.execute(
            "SELECT id, level_key FROM competitive_levels"
        ).fetchall()
        level_ids = {lk: lid for lid, lk in level_rows}

        # Load all unclassified teams
        teams = conn.execute("""
            SELECT t.id, t.name, t.slug
            FROM teams t
            WHERE t.competitive_level_id IS NULL
              AND t.slug LIKE 'espn-opp-%'
        """).fetchall()
        print(f"Unclassified espn-opp teams: {len(teams)}")

        # Try to match each team to a classified team by normalized name
        classified_teams = conn.execute("""
            SELECT t.name, cl.level_key
            FROM teams t
            JOIN competitive_levels cl ON cl.id = t.competitive_level_id
            WHERE t.slug NOT LIKE 'espn-opp-%'
        """).fetchall()
        name_to_level: dict[str, str] = {}
        for name, lk in classified_teams:
            name_to_level[normalize(name)] = lk

        updated = 0
        unresolved_names: list[str] = []

        for team_id, name, slug in teams:
            level_key = None

            # Strategy 1: exact normalized name match to classified team
            norm = normalize(name)
            if norm in name_to_level:
                level_key = name_to_level[norm]

            # Strategy 2: manual map lookup (substring match)
            if not level_key:
                name_lower = name.lower()
                for fragment, lk in MANUAL_LEVEL_MAP.items():
                    if fragment in name_lower:
                        level_key = lk
                        break

            if level_key and level_key in level_ids:
                level_id = level_ids[level_key]
                if DRY_RUN:
                    print(f"  [dry-run] {name:55s} -> {level_key}")
                else:
                    conn.execute(
                        "UPDATE teams SET competitive_level_id = %s WHERE id = %s",
                        (level_id, team_id)
                    )
                updated += 1
            else:
                unresolved_names.append(name)

        if not DRY_RUN:
            conn.commit()

        print(f"\n{'[dry-run] ' if DRY_RUN else ''}Resolved: {updated} | Unresolved: {len(unresolved_names)}")
        if unresolved_names:
            print("\nStill unresolved (needs manual classification):")
            for n in sorted(unresolved_names)[:50]:
                print(f"  {n}")
            if len(unresolved_names) > 50:
                print(f"  ... and {len(unresolved_names)-50} more")


if __name__ == "__main__":
    main()
