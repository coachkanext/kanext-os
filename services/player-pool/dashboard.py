#!/usr/bin/env python3
"""
KaNeXT Basketball Intelligence Dashboard
Run: cd services/player-pool && streamlit run dashboard.py
"""
from __future__ import annotations

import streamlit as st
import psycopg
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd

DB_DSN = "dbname=kanext_player_pool host=localhost port=5432"

st.set_page_config(
    page_title="KaNeXT Basketball Intelligence",
    page_icon="🏀",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ═══════════════════════════════════════════════════════════════════════════
# DB CONNECTION
# ═══════════════════════════════════════════════════════════════════════════

@st.cache_resource
def get_conn():
    return psycopg.connect(DB_DSN, autocommit=True)


def q(sql, params=None):
    """Run query and return as DataFrame."""
    conn = get_conn()
    try:
        cur = conn.execute(sql, params)
        cols = [d[0] for d in cur.description] if cur.description else []
        rows = cur.fetchall()
        return pd.DataFrame(rows, columns=cols)
    except Exception as e:
        # Reconnect on stale connection
        st.cache_resource.clear()
        conn = get_conn()
        cur = conn.execute(sql, params)
        cols = [d[0] for d in cur.description] if cur.description else []
        rows = cur.fetchall()
        return pd.DataFrame(rows, columns=cols)


# ═══════════════════════════════════════════════════════════════════════════
# SIDEBAR
# ═══════════════════════════════════════════════════════════════════════════

st.sidebar.title("KaNeXT Intelligence")
st.sidebar.caption("Basketball Dashboard v1.0")

page = st.sidebar.radio("Navigate", [
    "Overview",
    "Scrape Monitor",
    "Player Explorer",
    "KR Distribution",
    "Badge Analytics",
    "Team Systems",
    "Scholarship & NIL",
])

st.sidebar.markdown("---")
if st.sidebar.button("Refresh Data"):
    st.cache_data.clear()
    st.rerun()


# ═══════════════════════════════════════════════════════════════════════════
# CACHED QUERIES
# ═══════════════════════════════════════════════════════════════════════════

@st.cache_data(ttl=30)
def get_overview_stats():
    return q("""
        SELECT
            (SELECT count(*) FROM players) AS total_players,
            (SELECT count(*) FROM teams) AS total_teams,
            (SELECT count(*) FROM games) AS total_games,
            (SELECT count(*) FROM player_game_stats) AS total_pgs,
            (SELECT count(*) FROM player_kr) AS total_kr,
            (SELECT count(*) FROM player_badges) AS total_badges,
            (SELECT count(*) FROM team_seasons WHERE team_overall_kr IS NOT NULL) AS teams_with_kr,
            (SELECT count(*) FROM scholarship_nil_allocations) AS total_sna
    """)


@st.cache_data(ttl=30)
def get_level_stats():
    return q("""
        SELECT cl.level_key,
               count(DISTINCT t.id) AS teams,
               count(DISTINCT g.id) AS games,
               count(DISTINCT p.id) AS players
        FROM competitive_levels cl
        LEFT JOIN teams t ON t.competitive_level_id = cl.id
        LEFT JOIN team_seasons ts ON ts.team_id = t.id AND ts.season = '2025-26'
        LEFT JOIN games g ON g.home_team_season_id = ts.id
        LEFT JOIN player_team_seasons pts ON pts.team_season_id = ts.id
        LEFT JOIN players p ON pts.player_id = p.id
        GROUP BY cl.level_key
        ORDER BY count(DISTINCT p.id) DESC
    """)


@st.cache_data(ttl=60)
def get_kr_players(level_filter=None, min_kr=0, max_kr=100, position=None):
    where = ["kr.overall_kr IS NOT NULL", f"kr.overall_kr >= {min_kr}", f"kr.overall_kr <= {max_kr}"]
    if level_filter and level_filter != "All":
        where.append(f"cl.level_key = '{level_filter}'")
    if position and position != "All":
        where.append(f"kr.primary_archetype IS NOT NULL")
    where_sql = " AND ".join(where)
    return q(f"""
        SELECT p.full_name, p.declared_positions,
               t.name AS team, cl.level_key,
               round(kr.overall_kr::numeric, 1) AS kr,
               round(kr.base_off_kr::numeric, 1) AS off_kr,
               round(kr.base_def_kr::numeric, 1) AS def_kr,
               round(coalesce(kr.final_overall_kr, kr.overall_kr)::numeric, 1) AS final_kr,
               round(coalesce(kr.off_badge_boost, 0)::numeric, 1) AS badge_boost,
               kr.primary_archetype AS archetype,
               kr.confidence_pct AS confidence,
               pss.games_played AS gp,
               round(pss.pts_per_game::numeric, 1) AS ppg,
               round(pss.reb_per_game::numeric, 1) AS rpg,
               round(pss.ast_per_game::numeric, 1) AS apg
        FROM player_kr kr
        JOIN player_team_seasons pts ON kr.player_team_season_id = pts.id
        JOIN players p ON pts.player_id = p.id
        JOIN team_seasons ts ON pts.team_season_id = ts.id
        JOIN teams t ON ts.team_id = t.id
        JOIN competitive_levels cl ON t.competitive_level_id = cl.id
        LEFT JOIN player_season_stats pss ON pss.player_team_season_id = pts.id
        WHERE {where_sql}
        ORDER BY kr.overall_kr DESC
        LIMIT 500
    """)


@st.cache_data(ttl=60)
def get_kr_histogram():
    return q("""
        SELECT cl.level_key,
               round(kr.overall_kr::numeric, 0) AS kr_bucket
        FROM player_kr kr
        JOIN player_team_seasons pts ON kr.player_team_season_id = pts.id
        JOIN team_seasons ts ON pts.team_season_id = ts.id
        JOIN teams t ON ts.team_id = t.id
        JOIN competitive_levels cl ON t.competitive_level_id = cl.id
        WHERE kr.overall_kr IS NOT NULL
    """)


@st.cache_data(ttl=60)
def get_badge_stats():
    return q("""
        SELECT pb.tier,
               pb.cluster,
               pb.badge_name,
               count(*) AS count
        FROM player_badges pb
        GROUP BY pb.tier, pb.cluster, pb.badge_name
        ORDER BY count(*) DESC
    """)


@st.cache_data(ttl=60)
def get_badge_tier_summary():
    return q("""
        SELECT pb.tier, count(*) AS count
        FROM player_badges pb
        GROUP BY pb.tier
        ORDER BY
            CASE pb.tier WHEN 'gold' THEN 1 WHEN 'silver' THEN 2 WHEN 'bronze' THEN 3 END
    """)


@st.cache_data(ttl=60)
def get_team_systems():
    return q("""
        SELECT t.name AS team, cl.level_key,
               c.name AS conference,
               ts.osie_system AS off_system,
               ts.dsie_system AS def_system,
               round(ts.pace100::numeric, 1) AS pace,
               ts.pace_band,
               round(ts.team_overall_kr::numeric, 1) AS team_kr,
               round(ts.team_off_kr::numeric, 1) AS team_off_kr,
               round(ts.team_def_kr::numeric, 1) AS team_def_kr
        FROM team_seasons ts
        JOIN teams t ON ts.team_id = t.id
        JOIN competitive_levels cl ON t.competitive_level_id = cl.id
        LEFT JOIN conferences c ON c.id = t.conference_id
        WHERE ts.season = '2025-26' AND ts.team_overall_kr IS NOT NULL
        ORDER BY ts.team_overall_kr DESC
    """)


@st.cache_data(ttl=60)
def get_scholarship_summary():
    return q("""
        SELECT cl.level_key,
               count(*) AS players,
               round(avg(sna.recommended_scholarship_pct)::numeric, 1) AS avg_schol_pct,
               round(avg(sna.recommended_nil_amount)::numeric, 0) AS avg_nil,
               round(sum(sna.recommended_nil_amount)::numeric, 0) AS total_nil,
               count(CASE WHEN sna.tier = 'star' THEN 1 END) AS stars,
               count(CASE WHEN sna.tier = 'starter' THEN 1 END) AS starters,
               count(CASE WHEN sna.tier = 'rotation' THEN 1 END) AS rotation,
               count(CASE WHEN sna.tier = 'developmental' THEN 1 END) AS developmental
        FROM scholarship_nil_allocations sna
        JOIN player_team_seasons pts ON sna.player_team_season_id = pts.id
        JOIN team_seasons ts ON pts.team_season_id = ts.id
        JOIN teams t ON ts.team_id = t.id
        JOIN competitive_levels cl ON t.competitive_level_id = cl.id
        GROUP BY cl.level_key
        ORDER BY avg(sna.recommended_nil_amount) DESC
    """)


@st.cache_data(ttl=30)
def get_scrape_progress():
    """Per-level scrape coverage using actual player_game_stats rows."""
    return q("""
        SELECT cl.level_key,
               COUNT(DISTINCT t.id) AS teams,
               COUNT(DISTINCT pts.player_id) AS players,
               COUNT(DISTINCT pgs.game_id) AS games,
               COUNT(pgs.id) AS pgs_rows,
               CASE WHEN COUNT(DISTINCT t.id) > 0
                    THEN ROUND(
                        (COUNT(DISTINCT pgs.game_id)::numeric / COUNT(DISTINCT t.id)),
                        1)
                    ELSE 0 END AS avg_games_per_team
        FROM competitive_levels cl
        JOIN teams t ON t.competitive_level_id = cl.id
        JOIN team_seasons ts ON ts.team_id = t.id
        LEFT JOIN player_team_seasons pts ON pts.team_season_id = ts.id
        LEFT JOIN player_game_stats pgs ON pgs.player_team_season_id = pts.id
        GROUP BY cl.level_key
        ORDER BY COUNT(DISTINCT pts.player_id) DESC
    """)


@st.cache_data(ttl=30)
def get_team_scrape_detail(level_key: str):
    """Per-team game counts for a given level."""
    return q("""
        SELECT t.name AS team,
               COUNT(DISTINCT pgs.game_id) AS games,
               COUNT(DISTINCT pts.player_id) AS players,
               COUNT(pgs.id) AS pgs_rows,
               ROUND(AVG(pss.games_played)::numeric, 1) AS avg_gp
        FROM teams t
        JOIN competitive_levels cl ON t.competitive_level_id = cl.id
        JOIN team_seasons ts ON ts.team_id = t.id
        LEFT JOIN player_team_seasons pts ON pts.team_season_id = ts.id
        LEFT JOIN player_game_stats pgs ON pgs.player_team_season_id = pts.id
        LEFT JOIN player_season_stats pss ON pss.player_team_season_id = pts.id
        WHERE cl.level_key = %s
        GROUP BY t.id, t.name
        ORDER BY COUNT(DISTINCT pgs.game_id) DESC
    """, (level_key,))


@st.cache_data(ttl=60)
def get_archetype_distribution():
    return q("""
        SELECT kr.primary_archetype AS archetype,
               cl.level_key,
               count(*) AS count
        FROM player_kr kr
        JOIN player_team_seasons pts ON kr.player_team_season_id = pts.id
        JOIN team_seasons ts ON pts.team_season_id = ts.id
        JOIN teams t ON ts.team_id = t.id
        JOIN competitive_levels cl ON t.competitive_level_id = cl.id
        WHERE kr.primary_archetype IS NOT NULL
        GROUP BY kr.primary_archetype, cl.level_key
        ORDER BY count(*) DESC
    """)


@st.cache_data(ttl=60)
def get_top_badges():
    return q("""
        SELECT p.full_name, t.name AS team, cl.level_key,
               pb.badge_name, pb.tier, pb.cluster,
               round(kr.overall_kr::numeric, 1) AS kr
        FROM player_badges pb
        JOIN player_kr kr ON pb.player_kr_id = kr.id
        JOIN player_team_seasons pts ON kr.player_team_season_id = pts.id
        JOIN players p ON pts.player_id = p.id
        JOIN team_seasons ts ON pts.team_season_id = ts.id
        JOIN teams t ON ts.team_id = t.id
        JOIN competitive_levels cl ON t.competitive_level_id = cl.id
        WHERE pb.tier IN ('gold', 'silver')
        ORDER BY CASE pb.tier WHEN 'gold' THEN 1 WHEN 'silver' THEN 2 END,
                 kr.overall_kr DESC
        LIMIT 100
    """)


# ═══════════════════════════════════════════════════════════════════════════
# PAGES
# ═══════════════════════════════════════════════════════════════════════════

LEVEL_ORDER = [
    "nccaa_d2", "uscaa", "njcaa_d3", "nccaa_d1", "cccaa",
    "njcaa_d2", "naia", "njcaa_d1",
    "ncaa_d3", "ncaa_d2", "ncaa_d1",
    "ncaa_d1_low_major", "ncaa_d1_mid_major", "ncaa_d1_high_major",
]

LEVEL_LABELS = {
    "njcaa_d3": "JUCO D3", "njcaa_d2": "JUCO D2", "njcaa_d1": "JUCO D1",
    "cccaa": "CCCAA", "uscaa": "USCAA",
    "nccaa_d2": "NCCAA D2", "nccaa_d1": "NCCAA D1",
    "naia": "NAIA", "ncaa_d3": "NCAA D3", "ncaa_d2": "NCAA D2",
    "ncaa_d1": "NCAA D1",
    "ncaa_d1_low_major": "D1 Low Major", "ncaa_d1_mid_major": "D1 Mid Major",
    "ncaa_d1_high_major": "D1 High Major",
}


def page_overview():
    st.title("KaNeXT Basketball Intelligence")
    st.caption("Unified player intelligence across all competitive levels")

    stats = get_overview_stats()
    if stats.empty:
        st.warning("No data found. Run the scraper first.")
        return

    r = stats.iloc[0]

    # Top metrics
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total Players", f"{int(r['total_players']):,}")
    c2.metric("Total Teams", f"{int(r['total_teams']):,}")
    c3.metric("Total Games", f"{int(r['total_games']):,}")
    c4.metric("Game Stat Rows", f"{int(r['total_pgs']):,}")

    c5, c6, c7, c8 = st.columns(4)
    c5.metric("Player KRs", f"{int(r['total_kr']):,}")
    c6.metric("Badges Awarded", f"{int(r['total_badges']):,}")
    c7.metric("Teams with KR", f"{int(r['teams_with_kr']):,}")
    c8.metric("Scholarship Allocs", f"{int(r['total_sna']):,}")

    st.markdown("---")

    # Level breakdown
    st.subheader("Data by Competitive Level")
    levels = get_level_stats()
    if not levels.empty:
        levels["level_label"] = levels["level_key"].map(LEVEL_LABELS).fillna(levels["level_key"])
        fig = px.bar(
            levels.sort_values("players", ascending=True),
            x="players", y="level_label",
            orientation="h",
            color="games",
            color_continuous_scale="Blues",
            labels={"players": "Players", "level_label": "Level", "games": "Games"},
            title="Players & Games by Level",
        )
        fig.update_layout(height=400, yaxis_title="")
        st.plotly_chart(fig, use_container_width=True)


def page_scrape_monitor():
    st.title("Scrape Monitor")
    st.caption("Live progress of data collection across all competitive levels")

    progress = get_scrape_progress()
    if progress.empty:
        st.info("No scrape data yet.")
        return

    # Expected games per team for a full season
    EXPECTED_GPT = {
        "njcaa_d1": 27, "njcaa_d2": 27, "njcaa_d3": 27,
        "naia": 27, "cccaa": 27, "uscaa": 20,
        "nccaa_d1": 30, "nccaa_d2": 25,
        "ncaa_d1": 30, "ncaa_d2": 27, "ncaa_d3": 25,
    }

    # Data source info
    DATA_SOURCE = {
        "njcaa_d1": "PrestoSports", "njcaa_d2": "PrestoSports", "njcaa_d3": "PrestoSports",
        "naia": "PrestoSports", "cccaa": "PrestoSports", "uscaa": "PrestoSports",
        "nccaa_d1": "NCCAA (synthetic)", "nccaa_d2": "NCCAA (synthetic)",
        "ncaa_d1": "ESPN API", "ncaa_d2": "No source", "ncaa_d3": "No source",
    }

    progress["level_label"] = progress["level_key"].map(LEVEL_LABELS).fillna(progress["level_key"])
    progress["expected_gpt"] = progress["level_key"].map(EXPECTED_GPT).fillna(25)
    progress["avg_gpt"] = progress["avg_games_per_team"].astype(float)
    progress["pct_complete"] = (progress["avg_gpt"] / progress["expected_gpt"] * 100).clip(0, 100).round(1)
    progress["source"] = progress["level_key"].map(DATA_SOURCE).fillna("Unknown")

    # ── Top metrics ──
    total_pgs = int(progress["pgs_rows"].sum())
    total_games = int(progress["games"].sum())
    total_players = int(progress["players"].sum())
    total_teams = int(progress["teams"].sum())

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total Players", f"{total_players:,}")
    c2.metric("Total Teams", f"{total_teams:,}")
    c3.metric("Total Games", f"{total_games:,}")
    c4.metric("PGS Rows", f"{total_pgs:,}")

    st.markdown("---")

    # ── Per-level progress bars ──
    st.subheader("Full-Game Scrape Progress by Level")

    # Sort by hierarchy
    level_sort = {k: i for i, k in enumerate(LEVEL_ORDER)}
    progress["sort_key"] = progress["level_key"].map(level_sort).fillna(99)
    progress = progress.sort_values("sort_key")

    for _, row in progress.iterrows():
        pct = float(row["pct_complete"])
        avg_gpt = float(row["avg_gpt"])
        expected = int(row["expected_gpt"])
        teams = int(row["teams"])
        games = int(row["games"])
        players = int(row["players"])
        source = row["source"]

        # Status color
        if pct >= 90:
            status = "DONE"
        elif pct >= 50:
            status = "PARTIAL"
        elif avg_gpt > 0:
            status = "STARTED"
        else:
            status = "NO DATA"

        col1, col2 = st.columns([3, 7])
        with col1:
            st.markdown(f"**{row['level_label']}**")
            st.caption(f"{source} | {teams} teams | {players} players")
        with col2:
            st.progress(min(pct / 100, 1.0),
                        text=f"{pct:.0f}% — {avg_gpt:.1f} / {expected} avg G/T | {games:,} games | {status}")

    st.markdown("---")

    # ── Summary chart ──
    st.subheader("Scrape Completion Overview")
    chart_df = progress[["level_label", "pct_complete", "avg_gpt", "expected_gpt"]].copy()
    chart_df = chart_df.sort_values("pct_complete", ascending=True)

    fig = go.Figure()
    fig.add_trace(go.Bar(
        y=chart_df["level_label"],
        x=chart_df["pct_complete"],
        orientation="h",
        marker_color=[
            "#22c55e" if p >= 90 else "#eab308" if p >= 50 else "#ef4444" if p > 0 else "#6b7280"
            for p in chart_df["pct_complete"]
        ],
        text=[f"{p:.0f}%" for p in chart_df["pct_complete"]],
        textposition="auto",
    ))
    fig.add_vline(x=100, line_dash="dash", line_color="gray", annotation_text="Full Season")
    fig.update_layout(
        height=400, xaxis_title="% of Full Season Scraped",
        yaxis_title="", xaxis_range=[0, 110],
        margin=dict(l=0, r=20, t=20, b=40),
    )
    st.plotly_chart(fig, use_container_width=True)

    # ── Drill-down by level ──
    st.markdown("---")
    st.subheader("Team-Level Detail")
    level_pick = st.selectbox(
        "Select level to inspect",
        progress["level_key"].tolist(),
        format_func=lambda x: LEVEL_LABELS.get(x, x),
    )
    if level_pick:
        team_df = get_team_scrape_detail(level_pick)
        if not team_df.empty:
            expected = EXPECTED_GPT.get(level_pick, 25)
            team_df["pct"] = (team_df["games"].astype(float) / expected * 100).clip(0, 100).round(0)
            team_df = team_df.rename(columns={
                "team": "Team", "games": "Games", "players": "Players",
                "pgs_rows": "PGS Rows", "avg_gp": "Avg GP", "pct": "% Complete",
            })
            st.dataframe(team_df, use_container_width=True, hide_index=True, height=400)

            done = len(team_df[team_df["% Complete"] >= 90])
            partial = len(team_df[(team_df["% Complete"] > 0) & (team_df["% Complete"] < 90)])
            empty = len(team_df[team_df["Games"] == 0])
            st.caption(f"Full (>=90%): {done} | Partial: {partial} | No games: {empty}")
        else:
            st.info("No teams found for this level.")

    # ── Recent scrape log ──
    st.markdown("---")
    st.subheader("Recent Scrape Activity")
    logs = q("""
        SELECT url, status_code, scraped_at
        FROM scrape_log
        ORDER BY scraped_at DESC
        LIMIT 20
    """)
    if not logs.empty:
        st.dataframe(logs, use_container_width=True, hide_index=True)


def page_player_explorer():
    st.title("Player Explorer")

    # Filters
    col1, col2, col3 = st.columns(3)
    levels = ["All"] + LEVEL_ORDER
    level_filter = col1.selectbox("Level", levels, format_func=lambda x: LEVEL_LABELS.get(x, x))

    kr_range = col2.slider("KR Range", 0, 100, (0, 100))

    search = col3.text_input("Search Name")

    df = get_kr_players(level_filter, kr_range[0], kr_range[1])

    if df.empty:
        st.info("No players found. Run the KR engine first.")
        return

    if search:
        df = df[df["full_name"].str.contains(search, case=False, na=False)]

    # Color code KR
    st.dataframe(
        df.rename(columns={
            "full_name": "Player", "team": "School", "level_key": "Level",
            "kr": "Base KR", "final_kr": "Final KR", "badge_boost": "Badge +",
            "archetype": "Archetype", "confidence": "Conf%",
            "gp": "GP", "ppg": "PPG", "rpg": "RPG", "apg": "APG",
            "off_kr": "Off KR", "def_kr": "Def KR",
        }),
        use_container_width=True,
        hide_index=True,
        height=600,
    )
    st.caption(f"Showing {len(df)} players")


def page_kr_distribution():
    st.title("KR Distribution")

    df = get_kr_histogram()
    if df.empty:
        st.info("No KR data. Run the engine first.")
        return

    df["level_label"] = df["level_key"].map(LEVEL_LABELS).fillna(df["level_key"])

    # Overall histogram
    fig = px.histogram(
        df, x="kr_bucket", color="level_label",
        nbins=50, barmode="overlay",
        labels={"kr_bucket": "Overall KR", "level_label": "Level"},
        title="KR Score Distribution by Level",
        opacity=0.7,
    )
    fig.update_layout(height=500)
    st.plotly_chart(fig, use_container_width=True)

    # Per-level box plots
    fig2 = px.box(
        df, x="level_label", y="kr_bucket",
        color="level_label",
        labels={"kr_bucket": "Overall KR", "level_label": "Level"},
        title="KR Range by Level",
    )
    fig2.update_layout(height=400, showlegend=False)
    st.plotly_chart(fig2, use_container_width=True)

    # Archetype distribution
    st.subheader("Archetype Distribution")
    arch = get_archetype_distribution()
    if not arch.empty:
        arch["level_label"] = arch["level_key"].map(LEVEL_LABELS).fillna(arch["level_key"])
        fig3 = px.bar(
            arch.groupby("archetype")["count"].sum().reset_index().sort_values("count", ascending=True).tail(15),
            x="count", y="archetype", orientation="h",
            title="Top 15 Archetypes (All Levels)",
            labels={"count": "Players", "archetype": ""},
        )
        fig3.update_layout(height=450)
        st.plotly_chart(fig3, use_container_width=True)


def page_badge_analytics():
    st.title("Badge Analytics")

    tier_summary = get_badge_tier_summary()
    if tier_summary.empty:
        st.info("No badges computed. Run the engine with badge system first.")
        return

    # Tier counts
    c1, c2, c3 = st.columns(3)
    for _, row in tier_summary.iterrows():
        tier = row["tier"]
        count = int(row["count"])
        if tier == "gold":
            c1.metric("Gold Badges", f"{count:,}", delta=None)
        elif tier == "silver":
            c2.metric("Silver Badges", f"{count:,}", delta=None)
        elif tier == "bronze":
            c3.metric("Bronze Badges", f"{count:,}", delta=None)

    st.markdown("---")

    # Badge breakdown
    badges = get_badge_stats()
    if not badges.empty:
        # By cluster
        cluster_counts = badges.groupby("cluster")["count"].sum().reset_index().sort_values("count", ascending=True)
        fig = px.bar(
            cluster_counts, x="count", y="cluster", orientation="h",
            color="cluster",
            title="Badges by Cluster",
            labels={"count": "Total Badges", "cluster": ""},
        )
        fig.update_layout(height=350, showlegend=False)
        st.plotly_chart(fig, use_container_width=True)

        # Top individual badges
        st.subheader("Most Common Badges")
        top_badges = badges.groupby("badge_name")[["count"]].sum().reset_index().sort_values("count", ascending=False).head(20)
        fig2 = px.bar(
            top_badges.sort_values("count", ascending=True),
            x="count", y="badge_name", orientation="h",
            title="Top 20 Most Awarded Badges",
            labels={"count": "Awards", "badge_name": ""},
        )
        fig2.update_layout(height=500)
        st.plotly_chart(fig2, use_container_width=True)

    # Gold & Silver badge holders
    st.subheader("Gold & Silver Badge Holders")
    top_b = get_top_badges()
    if not top_b.empty:
        top_b["level_label"] = top_b["level_key"].map(LEVEL_LABELS).fillna(top_b["level_key"])
        st.dataframe(
            top_b[["full_name", "team", "level_label", "badge_name", "tier", "kr"]].rename(columns={
                "full_name": "Player", "team": "School", "level_label": "Level",
                "badge_name": "Badge", "tier": "Tier", "kr": "KR",
            }),
            use_container_width=True, hide_index=True, height=500,
        )


def page_team_systems():
    st.title("Team Systems (OSIE / DSIE)")

    df = get_team_systems()
    if df.empty:
        st.info("No team system data. Run the engine first.")
        return

    df["level_label"] = df["level_key"].map(LEVEL_LABELS).fillna(df["level_key"])

    # Level filter
    levels = ["All"] + sorted(df["level_label"].unique().tolist())
    level_pick = st.selectbox("Filter by Level", levels)
    if level_pick != "All":
        df = df[df["level_label"] == level_pick]

    # Offensive system distribution
    col1, col2 = st.columns(2)
    with col1:
        off_counts = df["off_system"].value_counts().reset_index()
        off_counts.columns = ["system", "count"]
        fig = px.pie(off_counts, values="count", names="system", title="Offensive Systems")
        fig.update_layout(height=400)
        st.plotly_chart(fig, use_container_width=True)

    with col2:
        def_counts = df["def_system"].value_counts().reset_index()
        def_counts.columns = ["system", "count"]
        fig2 = px.pie(def_counts, values="count", names="system", title="Defensive Systems")
        fig2.update_layout(height=400)
        st.plotly_chart(fig2, use_container_width=True)

    # Team table
    st.subheader("All Teams")
    st.dataframe(
        df[["team", "level_label", "conference", "off_system", "def_system", "pace", "pace_band", "team_kr", "team_off_kr", "team_def_kr"]].rename(columns={
            "team": "Team", "level_label": "Level", "conference": "Conference",
            "off_system": "Off System", "def_system": "Def System",
            "pace": "Pace", "pace_band": "Pace Band",
            "team_kr": "Team KR", "team_off_kr": "Off KR", "team_def_kr": "Def KR",
        }),
        use_container_width=True, hide_index=True, height=500,
    )

    # Pace distribution
    fig3 = px.histogram(df, x="pace", color="level_label", nbins=30,
                        title="Pace Distribution", labels={"pace": "Pace (possessions/game)"})
    fig3.update_layout(height=350)
    st.plotly_chart(fig3, use_container_width=True)


def page_scholarship_nil():
    st.title("Scholarship & NIL Allocation")

    df = get_scholarship_summary()
    if df.empty:
        st.info("No scholarship data. Run the engine first.")
        return

    df["level_label"] = df["level_key"].map(LEVEL_LABELS).fillna(df["level_key"])

    # Summary metrics
    total_nil = df["total_nil"].sum()
    total_players = df["players"].sum()
    st.metric("Total NIL Pool Allocated", f"${int(total_nil):,}")

    # Level breakdown
    fig = px.bar(
        df.sort_values("avg_nil", ascending=True),
        x="avg_nil", y="level_label", orientation="h",
        color="avg_schol_pct",
        color_continuous_scale="Greens",
        title="Avg NIL Amount & Scholarship % by Level",
        labels={"avg_nil": "Avg NIL ($)", "level_label": "Level", "avg_schol_pct": "Avg Schol%"},
    )
    fig.update_layout(height=400)
    st.plotly_chart(fig, use_container_width=True)

    # Tier distribution
    st.subheader("Player Tier Distribution by Level")
    tier_cols = ["stars", "starters", "rotation", "developmental"]
    tier_df = df[["level_label"] + tier_cols].melt(id_vars="level_label", var_name="tier", value_name="count")
    fig2 = px.bar(
        tier_df, x="level_label", y="count", color="tier",
        barmode="stack",
        title="Allocation Tiers",
        labels={"level_label": "Level", "count": "Players", "tier": "Tier"},
    )
    fig2.update_layout(height=400)
    st.plotly_chart(fig2, use_container_width=True)

    # Raw table
    st.subheader("Summary Table")
    st.dataframe(
        df[["level_label", "players", "avg_schol_pct", "avg_nil", "total_nil", "stars", "starters", "rotation", "developmental"]].rename(columns={
            "level_label": "Level", "players": "Players",
            "avg_schol_pct": "Avg Schol%", "avg_nil": "Avg NIL",
            "total_nil": "Total NIL", "stars": "Stars",
            "starters": "Starters", "rotation": "Rotation",
            "developmental": "Dev",
        }),
        use_container_width=True, hide_index=True,
    )


# ═══════════════════════════════════════════════════════════════════════════
# ROUTER
# ═══════════════════════════════════════════════════════════════════════════

PAGES = {
    "Overview": page_overview,
    "Scrape Monitor": page_scrape_monitor,
    "Player Explorer": page_player_explorer,
    "KR Distribution": page_kr_distribution,
    "Badge Analytics": page_badge_analytics,
    "Team Systems": page_team_systems,
    "Scholarship & NIL": page_scholarship_nil,
}

PAGES[page]()
