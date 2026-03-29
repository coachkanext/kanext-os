#!/usr/bin/env python3
"""
Export national player pool data from PostgreSQL to JSON files.
These JSON files are consumed by the React Native app's data adapter.

Usage:
    cd services/player-pool && python3 export_to_json.py

Output:
    ../../data/national-pool-players.json
    ../../data/national-pool-ratings.json
    ../../data/national-pool-stats.json
    ../../data/national-pool-scholarship.json
"""

from __future__ import annotations

import json
import os
import sys
from decimal import Decimal

import psycopg

DB_DSN = "dbname=kanext_player_pool host=localhost port=5432"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")

# Level key -> display-friendly level name
LEVEL_MAP = {
    "hs_prep_postgrad": "HS",
    "njcaa_d3": "JUCO D3",
    "njcaa_d2": "JUCO D2",
    "njcaa_d1": "JUCO D1",
    "cccaa": "3C2A",
    "naia": "NAIA",
    "uscaa": "USCAA",
    "nccaa_d2": "NCCAA D2",
    "nccaa_d1": "NCCAA D1",
    "ncaa_d3": "NCAA D3",
    "ncaa_d2": "NCAA D2",
    "ncaa_d1_low_major": "NCAA D1 LM",
    "ncaa_d1_mid_major": "NCAA D1 MM",
    "ncaa_d1": "NCAA D1",
    "ncaa_d1_high_major": "NCAA D1 HM",
    "professional": "Pro",
}

# DB cluster name (v3) -> frontend cluster name (v2-compatible keys)
CLUSTER_MAP = {
    "shooting": "shooting",
    "finishing": "finishing",
    "playmaking": "playmaking",
    "poa_defense": "on_ball_defense",   # v3 → v2 display name
    "team_defense": "team_defense",
    "rebounding": "rebounding",
    "tools": "physical",                 # v3 → v2 display name
    "iq": "iq",                          # new in v3 — frontend ignores unknown keys
}

# v3 engine position (PG/SG/SF/PF/C) → v2 app position (PG/CG/W/F/B)
V3_TO_V2_POS = {"PG": "PG", "SG": "CG", "SF": "W", "PF": "F", "C": "B"}


def _f(v) -> float | None:
    """Convert Decimal/None to float."""
    if v is None:
        return None
    return float(v) if isinstance(v, Decimal) else v


def _fmt_height(inches) -> str:
    if not inches:
        return ""
    inches = int(inches)
    return f"{inches // 12}'{inches % 12}\""


def _normalize_class_year(raw: str | None) -> str:
    """Normalize class year strings to consistent format."""
    if not raw:
        return ""
    r = raw.strip().lower().rstrip(".")
    MAP = {
        "fr": "Fr.", "freshman": "Fr.", "fy": "Fr.", "r-fr": "R-Fr.",
        "so": "So.", "sophomore": "So.", "r-so": "R-So.",
        "jr": "Jr.", "junior": "Jr.", "r-jr": "R-Jr.",
        "sr": "Sr.", "senior": "Sr.", "r-sr": "R-Sr.", "gr": "Gr.",
        "graduate": "Gr.", "grad": "Gr.",
    }
    return MAP.get(r, raw.strip())


def _infer_position(positions: list[str] | None, ppg, apg, rpg, bpg, stl,
                     mpg, oreb, fga) -> str:
    """Infer canonical position from declared_positions or stats."""
    # First try declared positions
    PM = {
        "PG": "PG", "CG": "CG", "W": "W", "F": "F", "B": "B",
        "SG": "CG", "SF": "W", "PF": "F", "C": "B",
        "G": None,  # ambiguous — infer from stats
        "G/F": "W", "F/C": "F", "W/F": "W",
        "PF/C": "F", "SF/PF": "F", "C/F": "F", "G/W": "CG",
        "WING": "W", "GUARD": None,
    }
    if positions and len(positions) > 0 and positions[0]:
        mapped = PM.get(positions[0].upper())
        if mapped is not None:
            return mapped
        # "G" or "Guard" — need stats to disambiguate

    # Stat-based inference
    apg_v = float(apg) if apg is not None else 0
    rpg_v = float(rpg) if rpg is not None else 0
    bpg_v = float(bpg) if bpg is not None else 0
    stl_v = float(stl) if stl is not None else 0
    ppg_v = float(ppg) if ppg is not None else 0
    oreb_v = float(oreb) if oreb is not None else 0
    fga_v = float(fga) if fga is not None else 0

    # Big: high rebounds + blocks
    if rpg_v >= 6 and bpg_v >= 1.0:
        return "B"
    if rpg_v >= 8:
        return "B"

    # Forward: moderate rebounds, low assists
    if rpg_v >= 5 and apg_v < 3:
        return "F"

    # Point guard: high assists
    if apg_v >= 4:
        return "PG"
    if apg_v >= 3 and stl_v >= 1.0:
        return "PG"

    # Combo guard: moderate assists + scoring
    if apg_v >= 2 and ppg_v >= 8:
        return "CG"

    # If declared "G" / "Guard" with low assists → CG
    if positions and len(positions) > 0:
        tag = (positions[0] or "").upper()
        if tag in ("G", "GUARD"):
            return "PG" if apg_v >= 2.5 else "CG"

    # Wing: default for players with balanced stats or no data
    if ppg_v >= 5 and rpg_v >= 3 and apg_v < 3:
        return "W"

    # Forward: if rebounds dominate
    if rpg_v > apg_v * 2 and rpg_v >= 3:
        return "F"

    # Guard-like: more assists/steals relative to rebounds
    if apg_v > rpg_v:
        return "PG"

    return "W"  # ultimate fallback


def export_players(conn) -> list[dict]:
    """Export all players with stats, team, level info, and v3 KR data.

    Uses DISTINCT ON (p.id, t.name) to collapse duplicate team records created
    when multiple scrapers (ESPN slug 'espn-N', ncaa_scraper slug 'ncaa-N') both
    insert the same school. Within each (player, team-name) group, the row with
    the most games_played is kept; ties broken by best KR then most recent insert.
    Players who legitimately transferred (different team names) keep all rows.
    """
    cur = conn.cursor()
    cur.execute("""
        WITH best_row AS (
            SELECT DISTINCT ON (p.id, t.name)
                p.id,
                p.full_name,
                p.height_inches,
                p.weight_lbs,
                p.declared_positions,
                p.state_origin,
                p.country_origin,
                p.city_origin,
                p.high_school,
                pts.class_year,
                pts.jersey_number,
                pts.portal_entry_date,
                t.name AS team_name,
                c.name AS conference_name,
                cl.level_key,
                cl.display_name AS level_display,
                pss.games_played,
                pss.games_started,
                pss.minutes_per_game,
                pss.pts_per_game,
                pss.reb_per_game,
                pss.ast_per_game,
                pss.stl_per_game,
                pss.blk_per_game,
                pss.to_per_game,
                pss.fg_pct,
                pss.three_pct,
                pss.ft_pct,
                pss.oreb_per_game,
                pss.dreb_per_game,
                pss.fga_per_game,
                pss.three_pa_per_game,
                pss.fta_per_game,
                pss.pf_per_game,
                pss.usage_rate,
                pss.bpr_season_avg,
                pss.bpr_trend,
                NULL::numeric AS kr,
                NULL::numeric AS okr,
                NULL::numeric AS dkr,
                NULL::text    AS primary_archetype,
                NULL::text[]  AS all_archetypes,
                NULL::numeric AS confidence_pct,
                NULL::text    AS kr_position,
                NULL::text    AS impact_modifier
            FROM players p
            JOIN player_team_seasons pts ON pts.player_id = p.id
            JOIN team_seasons ts ON ts.id = pts.team_season_id
            JOIN teams t ON t.id = ts.team_id
            LEFT JOIN conferences c ON c.id = t.conference_id
            LEFT JOIN competitive_levels cl ON cl.id = t.competitive_level_id
            LEFT JOIN player_season_stats pss ON pss.player_team_season_id = pts.id
            WHERE ts.season = '2025-26'
            ORDER BY p.id, t.name,
                     COALESCE(pss.games_played, 0) DESC,
                     pts.created_at DESC
        )
        SELECT * FROM best_row
        ORDER BY kr DESC NULLS LAST, full_name
    """)

    players = []
    for row in cur.fetchall():
        (
            pid, full_name, height_in, weight, positions, state, country, city,
            high_school, class_year, jersey, portal_date,
            team, conference, level_key, level_display,
            gp, gs, mpg, ppg, rpg, apg, spg, bpg, topg,
            fg_pct, three_pct, ft_pct, oreb, dreb, fga, threepa, fta, pf,
            usage, bpr_avg, bpr_trend,
            kr, okr, dkr, primary_archetype, all_archetypes,
            confidence_pct, kr_position, impact_modifier
        ) = row

        name_parts = full_name.split(" ", 1) if full_name else ["", ""]
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        # Use v3 position (mapped to v2) when available, else infer from stats
        if kr_position and kr_position in V3_TO_V2_POS:
            pos = V3_TO_V2_POS[kr_position]
        else:
            pos = _infer_position(positions, ppg, apg, rpg, bpg, spg, mpg, oreb, fga)

        players.append({
            "id": str(pid),
            "firstName": first_name,
            "lastName": last_name,
            "fullName": full_name or "",
            "position": pos,
            "height": _fmt_height(height_in),
            "heightInches": _f(height_in),
            "weight": _f(weight),
            "classYear": _normalize_class_year(class_year),
            "jerseyNumber": jersey or "",
            "school": team or "",
            "conference": conference or "",
            "levelKey": level_key or "",
            "levelDisplay": level_display or LEVEL_MAP.get(level_key or "", ""),
            "state": state or "",
            "country": country or "USA",
            "city": city or "",
            "highSchool": high_school or "",
            "portalEntryDate": str(portal_date) if portal_date else None,
            "kr": _f(kr),
            "offKR": _f(okr),
            "defKR": _f(dkr),
            "archetype": primary_archetype or "",
            "secondaryArchetypes": list(all_archetypes or []),
            "confidence": int(confidence_pct) if confidence_pct is not None else None,
            "impactModifier": impact_modifier or "",
            "clusters": {},  # filled in by export_clusters below
            "gp": _f(gp),
            "gs": _f(gs),
            "mpg": _f(mpg),
            "ppg": _f(ppg),
            "rpg": _f(rpg),
            "apg": _f(apg),
            "spg": _f(spg),
            "bpg": _f(bpg),
            "topg": _f(topg),
            "fgPct": _f(fg_pct),
            "threePct": _f(three_pct),
            "ftPct": _f(ft_pct),
            "orebPg": _f(oreb),
            "drebPg": _f(dreb),
            "fgaPg": _f(fga),
            "threePaPg": _f(threepa),
            "ftaPg": _f(fta),
            "pfPg": _f(pf),
            "usageRate": _f(usage),
            "bprAvg": _f(bpr_avg),
            "bprTrend": _f(bpr_trend),
        })

    print(f"  Players: {len(players)}")
    return players


def export_clusters(conn) -> dict[str, dict[str, float]]:
    """Export v3 cluster scores keyed by player_team_season_id."""
    cur = conn.cursor()
    cur.execute("""
        SELECT
            pc.player_team_season_id,
            pc.cluster,
            pc.score
        FROM player_clusters_v3 pc
        JOIN player_team_seasons pts ON pc.player_team_season_id = pts.id
        JOIN team_seasons ts ON pts.team_season_id = ts.id
        WHERE ts.season = '2025-26'
        ORDER BY pc.player_team_season_id, pc.cluster
    """)

    clusters: dict[str, dict[str, float]] = {}
    for pts_id, cluster, score in cur.fetchall():
        pts_id = str(pts_id)
        if pts_id not in clusters:
            clusters[pts_id] = {}
        mapped = CLUSTER_MAP.get(cluster)
        if mapped and score is not None:
            clusters[pts_id][mapped] = round(float(score), 1)

    print(f"  Cluster records: {len(clusters)} player-seasons")
    return clusters


def export_scholarship_nil(conn) -> dict[str, dict]:
    """Export scholarship/NIL allocations keyed by player ID."""
    cur = conn.cursor()
    cur.execute("""
        SELECT
            p.id AS player_id,
            sna.tier,
            sna.recommended_scholarship_pct,
            sna.scholarship_equivalent,
            sna.recommended_nil_amount,
            sna.off_fit_pct,
            sna.def_fit_pct,
            sna.overall_fit_pct,
            sna.need_scarcity,
            sna.scholarship_justification,
            sna.nil_justification,
            sna.warnings
        FROM scholarship_nil_allocations sna
        JOIN player_team_seasons pts ON sna.player_team_season_id = pts.id
        JOIN players p ON pts.player_id = p.id
        JOIN team_seasons ts ON pts.team_season_id = ts.id
        WHERE ts.season = '2025-26'
    """)

    result: dict[str, dict] = {}
    for row in cur.fetchall():
        (pid, tier, schol_pct, schol_equiv, nil_amt,
         off_fit, def_fit, overall_fit, scarcity,
         schol_just, nil_just, warnings) = row
        result[str(pid)] = {
            "tier": tier,
            "scholarshipPct": _f(schol_pct),
            "scholarshipEquivalent": _f(schol_equiv),
            "nilAmount": _f(nil_amt),
            "offFitPct": _f(off_fit),
            "defFitPct": _f(def_fit),
            "overallFitPct": _f(overall_fit),
            "needScarcity": scarcity,
            "scholarshipJustification": schol_just,
            "nilJustification": nil_just,
            "warnings": warnings or [],
        }

    print(f"  Scholarship/NIL records: {len(result)}")
    return result


def export_badges(conn) -> dict[str, list[dict]]:
    """Export v3 player badges keyed by player_team_season_id."""
    cur = conn.cursor()
    cur.execute("""
        SELECT
            pb.player_team_season_id,
            pb.badge_name,
            pb.cluster,
            pb.tier,
            pb.effect
        FROM player_badges_v3 pb
        JOIN player_team_seasons pts ON pb.player_team_season_id = pts.id
        JOIN team_seasons ts ON pts.team_season_id = ts.id
        WHERE ts.season = '2025-26'
        ORDER BY pb.player_team_season_id, pb.tier DESC, pb.badge_name
    """)

    badges: dict[str, list[dict]] = {}
    for pts_id, name, cluster, tier, effect in cur.fetchall():
        pts_id = str(pts_id)
        if pts_id not in badges:
            badges[pts_id] = []
        mapped_cluster = CLUSTER_MAP.get(cluster, cluster)
        badges[pts_id].append({
            "name": name,
            "cluster": mapped_cluster,
            "tier": tier,
            "effect": _f(effect),
        })

    total = sum(len(v) for v in badges.values())
    print(f"  Badge records: {total} across {len(badges)} player-seasons")
    return badges


def export_team_systems(conn) -> dict[str, dict]:
    """Export OSIE/DSIE team system identities."""
    cur = conn.cursor()
    cur.execute("""
        SELECT
            t.name AS team_name,
            tsi.off_primary_system,
            tsi.off_system_score,
            tsi.def_primary_system,
            tsi.def_system_score,
            tsi.pace100,
            tsi.pace_band
        FROM team_system_identity tsi
        JOIN team_seasons ts ON tsi.team_season_id = ts.id
        JOIN teams t ON ts.team_id = t.id
        WHERE ts.season = '2025-26'
        ORDER BY tsi.snapshot_date DESC
    """)

    systems: dict[str, dict] = {}
    for row in cur.fetchall():
        team, off_sys, off_score, def_sys, def_score, pace, pace_band = row
        if team not in systems:
            systems[team] = {
                "offSystem": off_sys,
                "offSystemScore": _f(off_score),
                "defSystem": def_sys,
                "defSystemScore": _f(def_score),
                "pace100": _f(pace),
                "paceBand": pace_band,
            }

    print(f"  Team systems: {len(systems)}")
    return systems


def main():
    print("Connecting to PostgreSQL...")
    conn = psycopg.connect(DB_DSN)

    print("Exporting data...")
    players = export_players(conn)

    # Build pts_id → player lookup for cluster/badge merge
    # export_players() now includes pts_id for this purpose — we need to add it
    # Re-query pts_ids for season players to link clusters/badges
    cur = conn.cursor()
    cur.execute("""
        SELECT pts.id AS pts_id, p.id AS player_id
        FROM player_team_seasons pts
        JOIN players p ON pts.player_id = p.id
        JOIN team_seasons ts ON ts.id = pts.team_season_id
        WHERE ts.season = '2025-26'
    """)
    pts_to_player: dict[str, str] = {str(r[0]): str(r[1]) for r in cur.fetchall()}

    clusters = export_clusters(conn)
    badges   = export_badges(conn)

    # Merge clusters and badges into player objects by player_id
    # (pts_id-keyed data → player_id-keyed merge)
    player_clusters: dict[str, dict] = {}
    player_badges: dict[str, list]   = {}
    for pts_id, player_id in pts_to_player.items():
        if pts_id in clusters:
            player_clusters[player_id] = clusters[pts_id]
        if pts_id in badges:
            player_badges[player_id] = badges[pts_id]

    for p in players:
        pid = p["id"]
        if pid in player_clusters:
            p["clusters"] = player_clusters[pid]
        if pid in player_badges:
            p["badges"] = player_badges[pid]

    # Write single combined file
    os.makedirs(OUT_DIR, exist_ok=True)
    out_path = os.path.join(OUT_DIR, "national-pool.json")
    with open(out_path, "w") as f:
        json.dump({
            "players": players,
            "exportedAt": __import__("datetime").datetime.now().isoformat(),
            "counts": {
                "players": len(players),
                "withKR": sum(1 for p in players if p["kr"] is not None),
                "withStats": sum(1 for p in players if p["gp"] is not None),
                "withHeight": sum(1 for p in players if p["heightInches"] is not None),
                "withWeight": sum(1 for p in players if p["weight"] is not None),
            },
        }, f, indent=None, default=str)

    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"\nWrote {out_path} ({size_mb:.1f} MB)")
    with_kr = sum(1 for p in players if p["kr"] is not None)
    with_stats = sum(1 for p in players if p["gp"] is not None)
    print(f"  {len(players)} players, {with_kr} with KR, {with_stats} with stats")

    conn.close()
    print("Done.")


if __name__ == "__main__":
    main()
