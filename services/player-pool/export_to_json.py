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
    "ncaa_d1_high_major": "NCAA D1 HM",
    "professional": "Pro",
}

# DB cluster name -> app cluster name
CLUSTER_MAP = {
    "shooting": "shooting",
    "finishing": "finishing",
    "playmaking": "playmaking",
    "on_ball_defense": "perimeter_defense",
    "team_defense": "interior_defense",
    "rebounding": "rebounding",
    "physical": "frame",
}


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


def export_players(conn) -> list[dict]:
    """Export all players with KR, archetype, team, level info."""
    cur = conn.cursor()
    cur.execute("""
        SELECT
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
            kr.overall_kr,
            kr.base_off_kr,
            kr.base_def_kr,
            kr.primary_archetype,
            kr.secondary_archetypes,
            kr.confidence_pct,
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
            pss.bpr_trend
        FROM players p
        JOIN player_team_seasons pts ON pts.player_id = p.id
        JOIN team_seasons ts ON ts.id = pts.team_season_id
        JOIN teams t ON t.id = ts.team_id
        LEFT JOIN conferences c ON c.id = t.conference_id
        LEFT JOIN competitive_levels cl ON cl.id = t.competitive_level_id
        LEFT JOIN player_kr kr ON kr.player_team_season_id = pts.id
        LEFT JOIN player_season_stats pss ON pss.player_team_season_id = pts.id
        WHERE ts.season = '2025-26'
        ORDER BY kr.overall_kr DESC NULLS LAST, p.full_name
    """)

    players = []
    for row in cur.fetchall():
        (
            pid, full_name, height_in, weight, positions, state, country, city,
            high_school, class_year, jersey, portal_date,
            team, conference, level_key, level_display,
            kr, off_kr, def_kr, archetype, sec_archetypes, confidence,
            gp, gs, mpg, ppg, rpg, apg, spg, bpg, topg,
            fg_pct, three_pct, ft_pct, oreb, dreb, fga, threepa, fta, pf,
            usage, bpr_avg, bpr_trend
        ) = row

        name_parts = full_name.split(" ", 1) if full_name else ["", ""]
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        # Position mapping
        pos = "SF"
        if positions and len(positions) > 0:
            pm = {"PG": "PG", "SG": "SG", "SF": "SF", "PF": "PF", "C": "C",
                  "G": "PG", "F": "PF", "CG": "SG", "W": "SF", "B": "C"}
            pos = pm.get(positions[0].upper(), "SF") if positions[0] else "SF"

        players.append({
            "id": str(pid),
            "firstName": first_name,
            "lastName": last_name,
            "fullName": full_name or "",
            "position": pos,
            "height": _fmt_height(height_in),
            "heightInches": _f(height_in),
            "weight": _f(weight),
            "classYear": class_year or "",
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
            "offKR": _f(off_kr),
            "defKR": _f(def_kr),
            "archetype": archetype or "",
            "secondaryArchetypes": sec_archetypes or [],
            "confidence": _f(confidence),
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
    """Export cluster scores keyed by player ID."""
    cur = conn.cursor()
    cur.execute("""
        SELECT
            p.id AS player_id,
            pkc.cluster,
            pkc.score
        FROM player_kr_clusters pkc
        JOIN player_kr pk ON pkc.player_kr_id = pk.id
        JOIN player_team_seasons pts ON pk.player_team_season_id = pts.id
        JOIN players p ON pts.player_id = p.id
        JOIN team_seasons ts ON pts.team_season_id = ts.id
        WHERE ts.season = '2025-26'
        ORDER BY p.id, pkc.cluster
    """)

    clusters: dict[str, dict[str, float]] = {}
    for pid, cluster, score in cur.fetchall():
        pid = str(pid)
        if pid not in clusters:
            clusters[pid] = {
                "shooting": 50, "finishing": 50, "playmaking": 50,
                "perimeter_defense": 50, "interior_defense": 50,
                "rebounding": 50, "frame": 50,
            }
        mapped = CLUSTER_MAP.get(cluster)
        if mapped and score is not None:
            clusters[pid][mapped] = round(float(score))

    print(f"  Cluster records: {len(clusters)}")
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
    clusters = export_clusters(conn)
    scholarship = export_scholarship_nil(conn)
    team_systems = export_team_systems(conn)

    # Merge clusters into players for a single file
    for p in players:
        pid = p["id"]
        p["clusters"] = clusters.get(pid, {
            "shooting": 50, "finishing": 50, "playmaking": 50,
            "perimeter_defense": 50, "interior_defense": 50,
            "rebounding": 50, "frame": 50,
        })
        sna = scholarship.get(pid)
        if sna:
            p["scholarship"] = sna

    # Write single combined file
    os.makedirs(OUT_DIR, exist_ok=True)
    out_path = os.path.join(OUT_DIR, "national-pool.json")
    with open(out_path, "w") as f:
        json.dump({
            "players": players,
            "teamSystems": team_systems,
            "exportedAt": __import__("datetime").datetime.now().isoformat(),
            "counts": {
                "players": len(players),
                "withKR": sum(1 for p in players if p["kr"] is not None),
                "withStats": sum(1 for p in players if p["gp"] is not None),
                "withScholarship": len(scholarship),
                "teamSystems": len(team_systems),
            },
        }, f, indent=None, default=str)

    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"\nWrote {out_path} ({size_mb:.1f} MB)")
    print(f"  {len(players)} players, {sum(1 for p in players if p['kr'])} with KR")

    conn.close()
    print("Done.")


if __name__ == "__main__":
    main()
