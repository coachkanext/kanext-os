#!/usr/bin/env python3
"""
KaNeXT MLB FanGraphs Advanced Stats Loader
Source: pybaseball → FanGraphs (batting_stats, pitching_stats)

Loads advanced MLB batting + pitching metrics into:
  mlb_fg_batting   — WAR, wRC+, wOBA, xBA, xSLG, xwOBA, EV, Barrel%, HardHit%, etc.
  mlb_fg_pitching  — WAR, FIP, xFIP, SIERA, ERA-, FIP-, K%, BB%, xERA, etc.

Usage:
    python3 mlb_fg_loader.py           # current season
    python3 mlb_fg_loader.py 2024      # specific season
    python3 mlb_fg_loader.py 2022 2025 # season range
"""
from __future__ import annotations

import sys
import warnings
warnings.filterwarnings("ignore")

import psycopg
from psycopg.rows import dict_row
import pybaseball as pb
pb.cache.enable()

DB_CONFIG = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}

CURRENT_YEAR = 2025


def safe_float(v, ndigits: int = 3):
    try:
        f = float(v)
        return round(f, ndigits) if not (f != f) else None  # NaN check
    except (TypeError, ValueError):
        return None

def safe_int(v):
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return None


def load_batting(conn, season: int):
    print(f"  Loading FanGraphs batting {season}...", flush=True)
    df = pb.batting_stats(season, qual=0)
    print(f"  Got {len(df)} rows", flush=True)

    inserted = updated = 0
    for _, row in df.iterrows():
        fg_id = safe_int(row.get("IDfg"))
        name  = str(row.get("Name", "")).strip()
        if not name:
            continue

        conn.execute("""
            INSERT INTO mlb_fg_batting (
                fg_id, season, name, team, age, g, pa, ab, h, hr, r, rbi,
                bb, so, sb, cs, avg, obp, slg, ops, iso, babip,
                bb_pct, k_pct, woba, wraa, wrc_plus, war,
                ev, la, barrels, barrel_pct, max_ev, hard_hit, hard_hit_pct,
                swstr_pct, csw_pct, xba, xslg, xwoba
            ) VALUES (
                %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
                %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
                %s,%s,%s,%s,%s,%s,
                %s,%s,%s,%s,%s,%s,%s,
                %s,%s,%s,%s,%s
            )
            ON CONFLICT (fg_id, season) DO UPDATE SET
                name=EXCLUDED.name, team=EXCLUDED.team, age=EXCLUDED.age,
                g=EXCLUDED.g, pa=EXCLUDED.pa, ab=EXCLUDED.ab, h=EXCLUDED.h,
                hr=EXCLUDED.hr, r=EXCLUDED.r, rbi=EXCLUDED.rbi,
                bb=EXCLUDED.bb, so=EXCLUDED.so, sb=EXCLUDED.sb, cs=EXCLUDED.cs,
                avg=EXCLUDED.avg, obp=EXCLUDED.obp, slg=EXCLUDED.slg, ops=EXCLUDED.ops,
                iso=EXCLUDED.iso, babip=EXCLUDED.babip,
                bb_pct=EXCLUDED.bb_pct, k_pct=EXCLUDED.k_pct,
                woba=EXCLUDED.woba, wraa=EXCLUDED.wraa, wrc_plus=EXCLUDED.wrc_plus,
                war=EXCLUDED.war, ev=EXCLUDED.ev, la=EXCLUDED.la,
                barrels=EXCLUDED.barrels, barrel_pct=EXCLUDED.barrel_pct,
                max_ev=EXCLUDED.max_ev, hard_hit=EXCLUDED.hard_hit,
                hard_hit_pct=EXCLUDED.hard_hit_pct, swstr_pct=EXCLUDED.swstr_pct,
                csw_pct=EXCLUDED.csw_pct, xba=EXCLUDED.xba, xslg=EXCLUDED.xslg,
                xwoba=EXCLUDED.xwoba
        """, (
            fg_id, season, name, str(row.get("Team", "") or ""), safe_int(row.get("Age")),
            safe_int(row.get("G")), safe_int(row.get("PA")), safe_int(row.get("AB")),
            safe_int(row.get("H")), safe_int(row.get("HR")), safe_int(row.get("R")),
            safe_int(row.get("RBI")), safe_int(row.get("BB")), safe_int(row.get("SO")),
            safe_int(row.get("SB")), safe_int(row.get("CS")),
            safe_float(row.get("AVG")), safe_float(row.get("OBP")), safe_float(row.get("SLG")),
            safe_float(row.get("OPS")), safe_float(row.get("ISO")), safe_float(row.get("BABIP")),
            safe_float(row.get("BB%")), safe_float(row.get("K%")),
            safe_float(row.get("wOBA")), safe_float(row.get("wRAA"), 2),
            safe_int(row.get("wRC+")), safe_float(row.get("WAR"), 2),
            safe_float(row.get("EV"), 2), safe_float(row.get("LA"), 2),
            safe_int(row.get("Barrels")), safe_float(row.get("Barrel%"), 2),
            safe_float(row.get("maxEV"), 2), safe_int(row.get("HardHit")),
            safe_float(row.get("HardHit%"), 2),
            safe_float(row.get("SwStr%")), safe_float(row.get("CSW%")),
            safe_float(row.get("xBA")), safe_float(row.get("xSLG")),
            safe_float(row.get("xwOBA")),
        ))
        inserted += 1

    conn.commit()
    print(f"  ✓ {inserted} batting rows for {season}", flush=True)
    return inserted


def load_pitching(conn, season: int):
    print(f"  Loading FanGraphs pitching {season}...", flush=True)
    df = pb.pitching_stats(season, qual=0)
    print(f"  Got {len(df)} rows", flush=True)

    inserted = 0
    for _, row in df.iterrows():
        fg_id = safe_int(row.get("IDfg"))
        name  = str(row.get("Name", "")).strip()
        if not name:
            continue

        conn.execute("""
            INSERT INTO mlb_fg_pitching (
                fg_id, season, name, team, age, w, l, g, gs, sv, ip,
                h, er, hr, bb, so, tbf, avg, whip, babip,
                era, fip, xfip, siera, era_minus, fip_minus, xfip_minus, war,
                k_pct, bb_pct, k9, bb9, hr9, lob_pct,
                ev, barrel_pct, hard_hit_pct, swstr_pct, csw_pct, xera
            ) VALUES (
                %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
                %s,%s,%s,%s,%s,%s,%s,%s,%s,
                %s,%s,%s,%s,%s,%s,%s,%s,
                %s,%s,%s,%s,%s,%s,
                %s,%s,%s,%s,%s,%s
            )
            ON CONFLICT (fg_id, season) DO UPDATE SET
                name=EXCLUDED.name, team=EXCLUDED.team, age=EXCLUDED.age,
                w=EXCLUDED.w, l=EXCLUDED.l, g=EXCLUDED.g, gs=EXCLUDED.gs,
                sv=EXCLUDED.sv, ip=EXCLUDED.ip, h=EXCLUDED.h, er=EXCLUDED.er,
                hr=EXCLUDED.hr, bb=EXCLUDED.bb, so=EXCLUDED.so, tbf=EXCLUDED.tbf,
                avg=EXCLUDED.avg, whip=EXCLUDED.whip, babip=EXCLUDED.babip,
                era=EXCLUDED.era, fip=EXCLUDED.fip, xfip=EXCLUDED.xfip,
                siera=EXCLUDED.siera, era_minus=EXCLUDED.era_minus,
                fip_minus=EXCLUDED.fip_minus, xfip_minus=EXCLUDED.xfip_minus,
                war=EXCLUDED.war, k_pct=EXCLUDED.k_pct, bb_pct=EXCLUDED.bb_pct,
                k9=EXCLUDED.k9, bb9=EXCLUDED.bb9, hr9=EXCLUDED.hr9,
                lob_pct=EXCLUDED.lob_pct, ev=EXCLUDED.ev,
                barrel_pct=EXCLUDED.barrel_pct, hard_hit_pct=EXCLUDED.hard_hit_pct,
                swstr_pct=EXCLUDED.swstr_pct, csw_pct=EXCLUDED.csw_pct,
                xera=EXCLUDED.xera
        """, (
            fg_id, season, name, str(row.get("Team", "") or ""),
            safe_int(row.get("Age")), safe_int(row.get("W")), safe_int(row.get("L")),
            safe_int(row.get("G")), safe_int(row.get("GS")), safe_int(row.get("SV")),
            safe_float(row.get("IP"), 1),
            safe_int(row.get("H")), safe_int(row.get("ER")), safe_int(row.get("HR")),
            safe_int(row.get("BB")), safe_int(row.get("SO")), safe_int(row.get("TBF")),
            safe_float(row.get("AVG")), safe_float(row.get("WHIP"), 2),
            safe_float(row.get("BABIP")),
            safe_float(row.get("ERA"), 2), safe_float(row.get("FIP"), 2),
            safe_float(row.get("xFIP"), 2), safe_float(row.get("SIERA"), 2),
            safe_float(row.get("ERA-"), 1), safe_float(row.get("FIP-"), 1),
            safe_float(row.get("xFIP-"), 1), safe_float(row.get("WAR"), 2),
            safe_float(row.get("K%")), safe_float(row.get("BB%")),
            safe_float(row.get("K/9"), 2), safe_float(row.get("BB/9"), 2),
            safe_float(row.get("HR/9"), 2), safe_float(row.get("LOB%")),
            safe_float(row.get("EV"), 2), safe_float(row.get("Barrel%"), 2),
            safe_float(row.get("HardHit%"), 2), safe_float(row.get("SwStr%")),
            safe_float(row.get("CSW%")), safe_float(row.get("xERA"), 2),
        ))
        inserted += 1

    conn.commit()
    print(f"  ✓ {inserted} pitching rows for {season}", flush=True)
    return inserted


def print_summary(conn):
    r = conn.execute("SELECT season, COUNT(*) n FROM mlb_fg_batting GROUP BY season ORDER BY season DESC").fetchall()
    print("\n  FanGraphs Batting:")
    for row in r:
        print(f"    {row['season']}: {row['n']} players")
    r = conn.execute("SELECT season, COUNT(*) n FROM mlb_fg_pitching GROUP BY season ORDER BY season DESC").fetchall()
    print("  FanGraphs Pitching:")
    for row in r:
        print(f"    {row['season']}: {row['n']} players")


def main():
    years = []
    if len(sys.argv) == 1:
        years = [CURRENT_YEAR]
    elif len(sys.argv) == 2:
        years = [int(sys.argv[1])]
    elif len(sys.argv) == 3:
        years = list(range(int(sys.argv[1]), int(sys.argv[2]) + 1))

    print(f"=== MLB FanGraphs Loader ===")
    print(f"  Seasons: {years}")

    conn = psycopg.connect(
        host=DB_CONFIG["host"], port=DB_CONFIG["port"], dbname=DB_CONFIG["dbname"],
        row_factory=dict_row, autocommit=False,
    )

    for yr in years:
        print(f"\n[{yr}]")
        load_batting(conn, yr)
        load_pitching(conn, yr)

    print_summary(conn)
    conn.close()


if __name__ == "__main__":
    main()
