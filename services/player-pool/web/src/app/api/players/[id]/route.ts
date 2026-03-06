import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Main player data
  const { rows } = await pool.query(
    `SELECT
       p.id,
       p.full_name,
       p.height_inches,
       p.weight_lbs,
       p.declared_positions,
       p.city_origin,
       p.state_origin,
       p.high_school,
       pts.jersey_number,
       pts.class_year,
       pts.id AS pts_id,
       t.name AS team_name,
       t.slug AS team_slug,
       t.id AS team_id,
       cl.level_key,
       cl.display_name AS level_name,
       c.name AS conf_name,
       c.abbreviation AS conf_abbr,
       kr.npd_final_kr,
       kr.college_kr_base,
       kr.primary_archetype,
       kr.all_archetypes,
       kr.confidence_pct,
       kr.system_risk_penalty,
       kr.system_risk_keys,
       kr.position,
       kr.level_key AS kr_level_key,
       kr.badge_boost,
       kr.override_boost,
       kr.override_key,
       ss.games_played,
       ss.games_started,
       ss.minutes_per_game,
       ss.pts_per_game,
       ss.reb_per_game,
       ss.ast_per_game,
       ss.stl_per_game,
       ss.blk_per_game,
       ss.to_per_game,
       ss.fg_pct,
       ss.three_pct,
       ss.ft_pct,
       ss.oreb_per_game,
       ss.dreb_per_game,
       ss.fga_per_game,
       ss.three_pa_per_game,
       ss.fta_per_game,
       ss.pf_per_game,
       ss.usage_rate,
       st.gp AS tot_gp,
       st.gs AS tot_gs,
       st.min_total,
       st.fgm,
       st.fga,
       st.three_pm,
       st.three_pa,
       st.ftm,
       st.fta,
       st.pts,
       st.orb,
       st.drb,
       st.trb,
       st.ast,
       st.tov,
       st.stl,
       st.blk,
       st.pf,
       tss.min AS team_min,
       tss.fgm AS team_fgm,
       tss.fga AS team_fga,
       tss.fta AS team_fta,
       tss.tov AS team_tov,
       tss.trb AS team_trb,
       tss.opp_fga,
       tss.opp_trb
     FROM players p
     JOIN player_team_seasons pts ON pts.player_id = p.id
     JOIN team_seasons ts ON ts.id = pts.team_season_id
     JOIN teams t ON t.id = ts.team_id
     JOIN competitive_levels cl ON cl.id = t.competitive_level_id
     LEFT JOIN conferences c ON c.id = t.conference_id
     LEFT JOIN player_kr_v2 kr ON kr.player_team_season_id = pts.id
     LEFT JOIN player_season_stats ss ON ss.player_team_season_id = pts.id
     LEFT JOIN player_season_totals st ON st.player_team_season_id = pts.id
     LEFT JOIN team_season_stats tss ON tss.team_id = t.id
     WHERE p.id = $1
     LIMIT 1`,
    [id]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const r = rows[0];
  const ptsId = r.pts_id;

  // Clusters, traits, badges, risks — parallel
  const [clustersRes, traitsRes, badgesRes, risksRes] = await Promise.all([
    pool.query(
      `SELECT cluster, score, confidence_pct, scored_traits, total_traits
       FROM player_clusters_v2
       WHERE player_team_season_id = $1
       ORDER BY cluster`,
      [ptsId]
    ),
    pool.query(
      `SELECT trait_key, cluster, score, status
       FROM player_traits_v2
       WHERE player_team_season_id = $1
       ORDER BY cluster, trait_key`,
      [ptsId]
    ),
    pool.query(
      `SELECT badge_key, badge_name, tier, effect, component, badge_group
       FROM player_badges_v2
       WHERE player_team_season_id = $1
       ORDER BY badge_key`,
      [ptsId]
    ),
    pool.query(
      `SELECT risk_key, risk_name, risk_type, penalty, trigger_values
       FROM player_system_risks_v2
       WHERE player_team_season_id = $1
       ORDER BY risk_type, risk_key`,
      [ptsId]
    ),
  ]);

  const clusters: Record<
    string,
    { score: number | null; confidence: number; scoredTraits: number; totalTraits: number }
  > = {};
  for (const c of clustersRes.rows) {
    clusters[c.cluster] = {
      score: c.score != null ? Number(c.score) : null,
      confidence: Number(c.confidence_pct) || 0,
      scoredTraits: c.scored_traits || 0,
      totalTraits: c.total_traits || 0,
    };
  }

  const traits: Record<string, { score: number | null; status: string; cluster: string }> = {};
  for (const t of traitsRes.rows) {
    traits[t.trait_key] = {
      score: t.score != null ? Number(t.score) : null,
      status: t.status,
      cluster: t.cluster,
    };
  }

  const n = (v: unknown) => (v != null ? Number(v) : null);

  const player = {
    id: r.id,
    name: r.full_name,
    position: r.position || (r.declared_positions?.[0] ?? null),
    height: n(r.height_inches),
    weight: n(r.weight_lbs),
    classYear: r.class_year || null,
    hometown:
      r.city_origin && r.state_origin
        ? `${r.city_origin}, ${r.state_origin}`
        : r.city_origin || r.state_origin || null,
    highSchool: r.high_school || null,
    jerseyNumber: r.jersey_number || null,
    team: {
      id: r.team_id,
      name: r.team_name,
      slug: r.team_slug,
      levelKey: r.level_key,
      levelName: r.level_name,
      conference: r.conf_name || null,
      confAbbr: r.conf_abbr || null,
    },
    kr: {
      finalKr: n(r.npd_final_kr),
      baseKr: n(r.college_kr_base),
      archetype: r.primary_archetype || null,
      allArchetypes: r.all_archetypes || [],
      confidence: Number(r.confidence_pct) || 0,
      riskPenalty: n(r.system_risk_penalty) || 0,
      riskKeys: r.system_risk_keys || [],
      badgeBoost: n(r.badge_boost) || 0,
      overrideBoost: n(r.override_boost) || 0,
      overrideKey: r.override_key || null,
      krLevelKey: r.kr_level_key || null,
    },
    clusters,
    traits,
    stats: {
      gp: n(r.games_played),
      gs: n(r.games_started),
      mpg: n(r.minutes_per_game),
      ppg: n(r.pts_per_game),
      rpg: n(r.reb_per_game),
      apg: n(r.ast_per_game),
      spg: n(r.stl_per_game),
      bpg: n(r.blk_per_game),
      topg: n(r.to_per_game),
      fgPct: n(r.fg_pct),
      threePct: n(r.three_pct),
      ftPct: n(r.ft_pct),
      orebPg: n(r.oreb_per_game),
      drebPg: n(r.dreb_per_game),
      fgaPg: n(r.fga_per_game),
      threePaPg: n(r.three_pa_per_game),
      ftaPg: n(r.fta_per_game),
      pfPg: n(r.pf_per_game),
      usageRate: n(r.usage_rate),
    },
    totals: {
      gp: n(r.tot_gp),
      gs: n(r.tot_gs),
      min: n(r.min_total),
      fgm: n(r.fgm),
      fga: n(r.fga),
      threePm: n(r.three_pm),
      threePa: n(r.three_pa),
      ftm: n(r.ftm),
      fta: n(r.fta),
      pts: n(r.pts),
      orb: n(r.orb),
      drb: n(r.drb),
      trb: n(r.trb),
      ast: n(r.ast),
      tov: n(r.tov),
      stl: n(r.stl),
      blk: n(r.blk),
      pf: n(r.pf),
    },
    teamStats: {
      min: n(r.team_min),
      fgm: n(r.team_fgm),
      fga: n(r.team_fga),
      fta: n(r.team_fta),
      tov: n(r.team_tov),
      trb: n(r.team_trb),
      oppFga: n(r.opp_fga),
      oppTrb: n(r.opp_trb),
    },
    badges: badgesRes.rows.map((b) => ({
      key: b.badge_key,
      name: b.badge_name,
      tier: b.tier,
      effect: Number(b.effect),
      component: b.component,
      group: b.badge_group || null,
    })),
    risks: risksRes.rows.map((rk) => ({
      key: rk.risk_key,
      name: rk.risk_name,
      type: rk.risk_type,
      penalty: Number(rk.penalty),
      triggers: rk.trigger_values || null,
    })),
  };

  return NextResponse.json({ player });
}
