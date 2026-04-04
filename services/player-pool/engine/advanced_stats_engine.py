"""
Advanced Stats Computation Engine
Computes advanced stats from existing raw box score data in the DB.

Basketball (from player_season_totals):
  eFG%     = (FGM + 0.5 * 3PM) / FGA
  TS%      = PTS / (2 * (FGA + 0.44 * FTA))
  3P_rate  = 3PA / FGA
  FT_rate  = FTA / FGA
  AST_TOV  = AST / TOV
  Per-40   = stat * 40 / MIN  (pts, reb, ast, stl, blk)
  GameScore= PTS + 0.4*FGM - 0.7*FGA - 0.4*(FTA-FTM) + 0.7*ORB + 0.3*DRB + STL + 0.7*AST + 0.7*BLK - 0.4*PF - TOV

Football QB (from fb_qb_season_stats):
  NCAA passer rating = (8.4*YDS + 330*TD + 100*CMP - 200*INT) / ATT
  AY/A   = (YDS + 20*TD - 45*INT) / ATT
  TD%    = TD / ATT * 100
  INT%   = INT / ATT * 100

Football skill (from fb_skill_season_stats):
  YPC    = rush_yards / rush_att  (when rush_att > 0)
  YPR    = rec_yards / rec       (when rec > 0)
  yards_per_touch = all_purpose_yards / (rush_att + rec)
"""
from __future__ import annotations

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../scraper"))

import psycopg
from psycopg.rows import dict_row
from config import DB_CONFIG


def get_conn():
    return psycopg.connect(
        host=DB_CONFIG["host"],
        port=DB_CONFIG["port"],
        dbname=DB_CONFIG["dbname"],
        row_factory=dict_row,
        autocommit=False,
    )


# ─── Basketball ──────────────────────────────────────────────────────────────

BBALL_CREATE = """
CREATE TABLE IF NOT EXISTS bball_adv_computed (
    player_id        UUID        NOT NULL,
    season           TEXT        NOT NULL,
    team_id          UUID,
    gp               INT,
    -- shooting efficiency
    efg_pct          NUMERIC(6,4),   -- (FGM + 0.5*3PM) / FGA
    ts_pct           NUMERIC(6,4),   -- PTS / (2*(FGA + 0.44*FTA))
    three_p_rate     NUMERIC(6,4),   -- 3PA / FGA
    ft_rate          NUMERIC(6,4),   -- FTA / FGA
    -- playmaking
    ast_tov_ratio    NUMERIC(8,4),   -- AST / TOV
    -- per-40 minute stats (NULL if minutes unavailable or < 10 min)
    pts_per40        NUMERIC(10,4),
    reb_per40        NUMERIC(10,4),
    ast_per40        NUMERIC(10,4),
    stl_per40        NUMERIC(10,4),
    blk_per40        NUMERIC(10,4),
    -- holistic
    game_score       NUMERIC(10,4),  -- Hollinger Game Score (per game avg)
    -- raw totals carried for reference
    pts              INT,
    fgm              INT,
    fga              INT,
    three_pm         INT,
    three_pa         INT,
    ftm              INT,
    fta              INT,
    trb              INT,
    orb              INT,
    drb              INT,
    ast              INT,
    tov              INT,
    stl              INT,
    blk              INT,
    pf               INT,
    min_total        NUMERIC(10,2),
    PRIMARY KEY (player_id, season)
);
"""


def run_basketball(conn):
    print("Computing basketball advanced stats...")

    conn.execute(BBALL_CREATE)

    rows = conn.execute("""
        SELECT
            pst.player_id, ts.season, ts.team_id,
            raw.gp,
            raw.fgm, raw.fga, raw.three_pm, raw.three_pa,
            raw.ftm, raw.fta,
            raw.pts,
            raw.orb, raw.drb, raw.trb,
            raw.ast, raw.tov, raw.stl, raw.blk, raw.pf,
            raw.min_total
        FROM player_season_totals raw
        JOIN player_team_seasons pst ON pst.id = raw.player_team_season_id
        JOIN team_seasons ts ON ts.id = pst.team_season_id
        WHERE raw.fga > 0
    """).fetchall()

    print(f"  Source rows: {len(rows)}")

    records = []
    for r in rows:
        fga   = r["fga"] or 0
        fgm   = r["fgm"] or 0
        tpm   = r["three_pm"] or 0
        tpa   = r["three_pa"] or 0
        ftm   = r["ftm"] or 0
        fta   = r["fta"] or 0
        pts   = r["pts"] or 0
        orb   = r["orb"] or 0
        drb   = r["drb"] or 0
        trb   = r["trb"] or 0
        ast   = r["ast"] or 0
        tov   = r["tov"] or 0
        stl   = r["stl"] or 0
        blk   = r["blk"] or 0
        pf    = r["pf"] or 0
        mins  = float(r["min_total"] or 0)
        gp    = r["gp"] or 0

        # eFG%
        efg = (fgm + 0.5 * tpm) / fga if fga > 0 else None

        # TS%
        ts_denom = 2 * (fga + 0.44 * fta)
        ts = pts / ts_denom if ts_denom > 0 else None

        # 3P rate & FT rate
        three_rate = tpa / fga if fga > 0 else None
        ft_rate    = fta / fga if fga > 0 else None

        # AST/TOV
        ast_tov = ast / tov if tov > 0 else None

        # Per-40 (only when meaningful minutes available — at least 10 total)
        def per40(stat):
            return stat * 40 / mins if mins >= 10 else None

        # Game Score (per-game avg)
        if gp > 0:
            gs = (
                pts - fgm * 0 + 0.4 * fgm - 0.7 * fga
                - 0.4 * (fta - ftm)
                + 0.7 * orb + 0.3 * drb
                + stl + 0.7 * ast + 0.7 * blk
                - 0.4 * pf - tov
            ) / gp
        else:
            gs = None

        records.append((
            r["player_id"], r["season"], r["team_id"], gp,
            round(efg, 4) if efg is not None else None,
            round(ts, 4) if ts is not None else None,
            round(three_rate, 4) if three_rate is not None else None,
            round(ft_rate, 4) if ft_rate is not None else None,
            round(ast_tov, 4) if ast_tov is not None else None,
            round(per40(pts), 4) if per40(pts) is not None else None,
            round(per40(trb), 4) if per40(trb) is not None else None,
            round(per40(ast), 4) if per40(ast) is not None else None,
            round(per40(stl), 4) if per40(stl) is not None else None,
            round(per40(blk), 4) if per40(blk) is not None else None,
            round(gs, 4) if gs is not None else None,
            pts, fgm, fga, tpm, tpa, ftm, fta, trb, orb, drb,
            ast, tov, stl, blk, pf,
            mins if mins > 0 else None,
        ))

    conn.cursor().executemany("""
        INSERT INTO bball_adv_computed (
            player_id, season, team_id, gp,
            efg_pct, ts_pct, three_p_rate, ft_rate, ast_tov_ratio,
            pts_per40, reb_per40, ast_per40, stl_per40, blk_per40,
            game_score,
            pts, fgm, fga, three_pm, three_pa, ftm, fta,
            trb, orb, drb, ast, tov, stl, blk, pf, min_total
        ) VALUES (
            %s,%s,%s,%s, %s,%s,%s,%s,%s, %s,%s,%s,%s,%s, %s,
            %s,%s,%s,%s,%s,%s,%s, %s,%s,%s,%s,%s,%s,%s,%s,%s
        )
        ON CONFLICT (player_id, season) DO UPDATE SET
            team_id       = EXCLUDED.team_id,
            gp            = EXCLUDED.gp,
            efg_pct       = EXCLUDED.efg_pct,
            ts_pct        = EXCLUDED.ts_pct,
            three_p_rate  = EXCLUDED.three_p_rate,
            ft_rate       = EXCLUDED.ft_rate,
            ast_tov_ratio = EXCLUDED.ast_tov_ratio,
            pts_per40     = EXCLUDED.pts_per40,
            reb_per40     = EXCLUDED.reb_per40,
            ast_per40     = EXCLUDED.ast_per40,
            stl_per40     = EXCLUDED.stl_per40,
            blk_per40     = EXCLUDED.blk_per40,
            game_score    = EXCLUDED.game_score,
            pts=EXCLUDED.pts, fgm=EXCLUDED.fgm, fga=EXCLUDED.fga,
            three_pm=EXCLUDED.three_pm, three_pa=EXCLUDED.three_pa,
            ftm=EXCLUDED.ftm, fta=EXCLUDED.fta,
            trb=EXCLUDED.trb, orb=EXCLUDED.orb, drb=EXCLUDED.drb,
            ast=EXCLUDED.ast, tov=EXCLUDED.tov, stl=EXCLUDED.stl,
            blk=EXCLUDED.blk, pf=EXCLUDED.pf, min_total=EXCLUDED.min_total
    """, records)

    conn.commit()
    print(f"  Written {len(records)} rows → bball_adv_computed")

    # Sample top game scores
    sample = conn.execute("""
        SELECT bac.game_score, p.full_name,
               t.name AS team, bac.gp, bac.pts, bac.efg_pct, bac.ts_pct
        FROM bball_adv_computed bac
        JOIN players p ON bac.player_id = p.id
        JOIN teams t ON bac.team_id = t.id
        WHERE bac.gp >= 10
        ORDER BY bac.game_score DESC NULLS LAST
        LIMIT 5
    """).fetchall()

    if sample:
        print("\n  Top Game Scores (min 10 GP):")
        for row in sample:
            print(f"    {row['full_name']:<28} {row['team']:<30} "
                  f"GS={float(row['game_score']):.2f}  "
                  f"PTS={row['pts']}  eFG%={float(row['efg_pct']):.3f}  TS%={float(row['ts_pct']):.3f}  GP={row['gp']}")


# ─── Football QB ─────────────────────────────────────────────────────────────

FB_QB_CREATE = """
CREATE TABLE IF NOT EXISTS fb_qb_adv_computed (
    player_id    UUID    NOT NULL,
    season       TEXT    NOT NULL,
    team_id      UUID,
    -- raw inputs
    comp         INT,
    att          INT,
    pass_yards   INT,
    pass_td      INT,
    interceptions INT,
    -- computed
    ncaa_rating  NUMERIC(8,4),   -- (8.4*YDS + 330*TD + 100*CMP - 200*INT) / ATT
    aya          NUMERIC(8,4),   -- Adjusted Yards per Attempt = (YDS + 20*TD - 45*INT) / ATT
    comp_pct     NUMERIC(6,4),
    td_pct       NUMERIC(6,4),
    int_pct      NUMERIC(6,4),
    ypa          NUMERIC(6,4),
    PRIMARY KEY (player_id, season)
);
"""


def run_football_qb(conn):
    print("\nComputing football QB advanced stats...")

    conn.execute(FB_QB_CREATE)

    rows = conn.execute("""
        SELECT fpts.player_id, fpts.season, fpts.team_id,
               q.comp, q.att, q.pass_yards, q.pass_td,
               q.int AS interceptions
        FROM fb_qb_season_stats q
        JOIN fb_player_team_seasons fpts ON fpts.id = q.player_team_season_id
        WHERE q.att > 0
    """).fetchall()

    print(f"  Source rows: {len(rows)}")

    records = []
    for r in rows:
        att   = r["att"] or 0
        comp  = r["comp"] or 0
        yds   = r["pass_yards"] or 0
        td    = r["pass_td"] or 0
        ints  = r["interceptions"] or 0

        if att == 0:
            continue

        ncaa_rating = (8.4 * yds + 330 * td + 100 * comp - 200 * ints) / att
        aya         = (yds + 20 * td - 45 * ints) / att
        comp_pct    = comp / att
        td_pct      = td / att
        int_pct     = ints / att
        ypa         = yds / att

        records.append((
            r["player_id"], r["season"], r["team_id"],
            comp, att, yds, td, ints,
            round(ncaa_rating, 4),
            round(aya, 4),
            round(comp_pct, 4),
            round(td_pct, 4),
            round(int_pct, 4),
            round(ypa, 4),
        ))

    conn.cursor().executemany("""
        INSERT INTO fb_qb_adv_computed (
            player_id, season, team_id,
            comp, att, pass_yards, pass_td, interceptions,
            ncaa_rating, aya, comp_pct, td_pct, int_pct, ypa
        ) VALUES (%s,%s,%s, %s,%s,%s,%s,%s, %s,%s,%s,%s,%s,%s)
        ON CONFLICT (player_id, season) DO UPDATE SET
            team_id=EXCLUDED.team_id,
            comp=EXCLUDED.comp, att=EXCLUDED.att,
            pass_yards=EXCLUDED.pass_yards, pass_td=EXCLUDED.pass_td,
            interceptions=EXCLUDED.interceptions,
            ncaa_rating=EXCLUDED.ncaa_rating, aya=EXCLUDED.aya,
            comp_pct=EXCLUDED.comp_pct, td_pct=EXCLUDED.td_pct,
            int_pct=EXCLUDED.int_pct, ypa=EXCLUDED.ypa
    """, records)

    conn.commit()
    print(f"  Written {len(records)} rows → fb_qb_adv_computed")

    sample = conn.execute("""
        SELECT q.ncaa_rating, q.aya, p.full_name,
               t.name AS team, q.att, q.pass_yards, q.pass_td, q.interceptions
        FROM fb_qb_adv_computed q
        JOIN fb_players p ON q.player_id = p.id
        JOIN fb_teams t ON q.team_id = t.id
        WHERE q.att >= 100
        ORDER BY q.ncaa_rating DESC NULLS LAST
        LIMIT 5
    """).fetchall()

    if sample:
        print("\n  Top QB Ratings (min 100 attempts):")
        for row in sample:
            print(f"    {row['full_name']:<28} {row['team']:<30} "
                  f"RTG={float(row['ncaa_rating']):.1f}  AY/A={float(row['aya']):.2f}  "
                  f"{row['att']} ATT  {row['pass_yards']} YDS  "
                  f"{row['pass_td']} TD / {row['interceptions']} INT")


# ─── Football Skill Players ───────────────────────────────────────────────────

FB_SKILL_CREATE = """
CREATE TABLE IF NOT EXISTS fb_skill_adv_computed (
    player_id          UUID    NOT NULL,
    season             TEXT    NOT NULL,
    team_id            UUID,
    -- raw inputs
    rush_att           INT,
    rush_yards         INT,
    rush_td            INT,
    receptions         INT,
    rec_yards          INT,
    rec_td             INT,
    all_purpose_yards  INT,
    -- computed
    ypc                NUMERIC(6,4),   -- rush_yards / rush_att
    ypr                NUMERIC(6,4),   -- rec_yards / receptions
    yards_per_touch    NUMERIC(6,4),   -- all_purpose_yards / (rush_att + rec)
    PRIMARY KEY (player_id, season)
);
"""


def run_football_skill(conn):
    print("\nComputing football skill player advanced stats...")

    conn.execute(FB_SKILL_CREATE)

    rows = conn.execute("""
        SELECT fpts.player_id, fpts.season, fpts.team_id,
               s.rush_att, s.rush_yards, s.rush_td,
               s.rec, s.rec_yards, s.rec_td,
               s.all_purpose_yards
        FROM fb_skill_season_stats s
        JOIN fb_player_team_seasons fpts ON fpts.id = s.player_team_season_id
        WHERE s.rush_att > 0 OR s.rec > 0
    """).fetchall()

    print(f"  Source rows: {len(rows)}")

    records = []
    for r in rows:
        rush_att = r["rush_att"] or 0
        rush_yds = r["rush_yards"] or 0
        rush_td  = r["rush_td"] or 0
        rec      = r["rec"] or 0
        rec_yds  = r["rec_yards"] or 0
        rec_td   = r["rec_td"] or 0
        apy      = r["all_purpose_yards"] or 0

        ypc   = round(rush_yds / rush_att, 4) if rush_att > 0 else None
        ypr   = round(rec_yds / rec, 4)       if rec > 0 else None
        touches = rush_att + rec
        ypt   = round(apy / touches, 4)        if touches > 0 else None

        records.append((
            r["player_id"], r["season"], r["team_id"],
            rush_att, rush_yds, rush_td, rec, rec_yds, rec_td, apy,
            ypc, ypr, ypt,
        ))

    conn.cursor().executemany("""
        INSERT INTO fb_skill_adv_computed (
            player_id, season, team_id,
            rush_att, rush_yards, rush_td,
            receptions, rec_yards, rec_td, all_purpose_yards,
            ypc, ypr, yards_per_touch
        ) VALUES (%s,%s,%s, %s,%s,%s,%s,%s,%s,%s, %s,%s,%s)
        ON CONFLICT (player_id, season) DO UPDATE SET
            team_id=EXCLUDED.team_id,
            rush_att=EXCLUDED.rush_att, rush_yards=EXCLUDED.rush_yards,
            rush_td=EXCLUDED.rush_td, receptions=EXCLUDED.receptions,
            rec_yards=EXCLUDED.rec_yards, rec_td=EXCLUDED.rec_td,
            all_purpose_yards=EXCLUDED.all_purpose_yards,
            ypc=EXCLUDED.ypc, ypr=EXCLUDED.ypr,
            yards_per_touch=EXCLUDED.yards_per_touch
    """, records)

    conn.commit()
    print(f"  Written {len(records)} rows → fb_skill_adv_computed")

    # Top rushers by YPC (min 50 carries)
    sample = conn.execute("""
        SELECT s.ypc, s.yards_per_touch, p.full_name,
               t.name AS team, s.rush_att, s.rush_yards, s.rush_td
        FROM fb_skill_adv_computed s
        JOIN fb_players p ON s.player_id = p.id
        JOIN fb_teams t ON s.team_id = t.id
        WHERE s.rush_att >= 50
        ORDER BY s.ypc DESC NULLS LAST
        LIMIT 5
    """).fetchall()

    if sample:
        print("\n  Top Rushers by YPC (min 50 carries):")
        for row in sample:
            print(f"    {row['full_name']:<28} {row['team']:<30} "
                  f"YPC={float(row['ypc']):.2f}  YPT={float(row['yards_per_touch']):.2f}  "
                  f"{row['rush_att']} ATT  {row['rush_yards']} YDS  {row['rush_td']} TD")


# ─── Summary ─────────────────────────────────────────────────────────────────

def print_summary(conn):
    print("\n" + "="*60)
    print("ADVANCED STATS ENGINE — SUMMARY")
    print("="*60)

    tables = [
        ("bball_adv_computed",    "Basketball players with eFG%/TS%/Game Score"),
        ("fb_qb_adv_computed",    "Football QBs with NCAA rating / AY/A"),
        ("fb_skill_adv_computed", "Football skill players with YPC/YPR"),
    ]

    for tbl, desc in tables:
        row = conn.execute(f"SELECT COUNT(*) AS n FROM {tbl}").fetchone()
        print(f"  {tbl:<28} {row['n']:>6} rows  — {desc}")

    # level breakdown for basketball
    print("\n  Basketball adv stats by level:")
    lvl_rows = conn.execute("""
        SELECT cl.level_key, COUNT(*) AS n
        FROM bball_adv_computed bac
        JOIN teams t ON bac.team_id = t.id
        JOIN competitive_levels cl ON t.competitive_level_id = cl.id
        GROUP BY cl.level_key
        ORDER BY n DESC
    """).fetchall()
    for row in lvl_rows:
        print(f"    {row['level_key']:<20} {row['n']:>6}")


# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    with get_conn() as conn:
        run_basketball(conn)
        run_football_qb(conn)
        run_football_skill(conn)
        print_summary(conn)
