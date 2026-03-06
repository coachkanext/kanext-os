module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "pool",
    ()=>pool
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/node_modules/pg)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
function getPool() {
    if (!globalThis._pool) {
        globalThis._pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["Pool"]({
            host: "localhost",
            port: 5432,
            database: "kanext_player_pool"
        });
    }
    return globalThis._pool;
}
const pool = getPool();
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/api/players/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
/* ------------------------------------------------------------------ */ /* Sort-key → SQL expression mapping                                   */ /* ------------------------------------------------------------------ */ const SORT_MAP = {
    // Per-game
    mpg: "pss.minutes_per_game",
    ppg: "pss.pts_per_game",
    rpg: "pss.reb_per_game",
    apg: "pss.ast_per_game",
    spg: "pss.stl_per_game",
    bpg: "pss.blk_per_game",
    topg: "pss.to_per_game",
    // Totals
    gp: "pss.games_played",
    gs: "pss.games_started",
    total_min: "pst.min_total",
    total_pts: "pst.pts",
    total_trb: "pst.trb",
    total_ast: "pst.ast",
    total_fgm: "pst.fgm",
    // Shooting (direct columns)
    fg_pct: "pss.fg_pct",
    three_pct: "pss.three_pct",
    ft_pct: "pss.ft_pct",
    // Shooting (derived)
    ts_pct: "CASE WHEN (pst.fga + 0.44 * pst.fta) > 0 THEN pst.pts::float / (2 * (pst.fga + 0.44 * pst.fta)) END",
    efg_pct: "CASE WHEN pst.fga > 0 THEN (pst.fgm + 0.5 * pst.three_pm)::float / pst.fga END",
    two_pct: "CASE WHEN (pst.fga - pst.three_pa) > 0 THEN (pst.fgm - pst.three_pm)::float / (pst.fga - pst.three_pa) END",
    three_par: "CASE WHEN pst.fga > 0 THEN pst.three_pa::float / pst.fga END",
    // Advanced (derived)
    ast_pct: "CASE WHEN pst.min_total > 0 AND tss.min > 0 AND (5.0 * pst.min_total * tss.fgm / tss.min - pst.fgm) > 0 THEN 100.0 * pst.ast / (5.0 * pst.min_total * tss.fgm / tss.min - pst.fgm) END",
    usg_pct: "CASE WHEN pst.min_total > 0 AND (tss.fga + 0.44 * tss.fta + tss.tov) > 0 THEN (pst.fga + 0.44 * pst.fta + pst.tov)::float * (tss.min / 5.0) / (pst.min_total * (tss.fga + 0.44 * tss.fta + tss.tov)) END",
    tov_pct: "CASE WHEN (pst.fga + 0.44 * pst.fta + pst.tov) > 0 THEN pst.tov::float / (pst.fga + 0.44 * pst.fta + pst.tov) END",
    stl_pct: "NULL",
    blk_pct: "NULL",
    reb_pct: "NULL",
    per: "NULL",
    // Per-40
    pts_40: "CASE WHEN pst.min_total > 0 THEN pst.pts::float / pst.min_total * 40 END",
    reb_40: "CASE WHEN pst.min_total > 0 THEN pst.trb::float / pst.min_total * 40 END",
    ast_40: "CASE WHEN pst.min_total > 0 THEN pst.ast::float / pst.min_total * 40 END",
    stl_40: "CASE WHEN pst.min_total > 0 THEN pst.stl::float / pst.min_total * 40 END",
    blk_40: "CASE WHEN pst.min_total > 0 THEN pst.blk::float / pst.min_total * 40 END",
    to_40: "CASE WHEN pst.min_total > 0 THEN pst.tov::float / pst.min_total * 40 END",
    // Scoring
    pct_2pt: "CASE WHEN pst.pts > 0 THEN ((pst.fgm - pst.three_pm) * 2)::float / pst.pts END",
    pct_3pt: "CASE WHEN pst.pts > 0 THEN (pst.three_pm * 3)::float / pst.pts END",
    pct_ft: "CASE WHEN pst.pts > 0 THEN pst.ftm::float / pst.pts END",
    ft_rate: "CASE WHEN pst.fga > 0 THEN pst.fta::float / pst.fga END",
    pts_fga: "CASE WHEN pst.fga > 0 THEN pst.pts::float / pst.fga END",
    ppp: "CASE WHEN (pst.fga + 0.44 * pst.fta + pst.tov) > 0 THEN pst.pts::float / (pst.fga + 0.44 * pst.fta + pst.tov) END"
};
const DEFAULT_SORT = "pss.pts_per_game";
async function GET(req) {
    const sp = req.nextUrl.searchParams;
    const search = sp.get("search")?.trim() || null;
    const levelKey = sp.get("levelKey") || null;
    const teamIds = sp.get("teamIds")?.split(",").filter(Boolean) || [];
    const positions = sp.get("positions")?.split(",").filter(Boolean) || [];
    const sortKey = sp.get("sort") || "ppg";
    const sortDir = sp.get("dir") === "asc" ? "ASC" : "DESC";
    const limit = Math.min(Math.max(parseInt(sp.get("limit") || "50", 10) || 50, 1), 200);
    const offset = Math.max(parseInt(sp.get("offset") || "0", 10) || 0, 0);
    const sortExpr = SORT_MAP[sortKey] || DEFAULT_SORT;
    /* ---- Build WHERE clauses ---- */ const conditions = [
        "ts.season = '2025-26'",
        "pss.games_played >= 10"
    ];
    const params = [];
    let paramIdx = 1;
    if (search) {
        conditions.push(`p.full_name ILIKE $${paramIdx}`);
        params.push(`%${search}%`);
        paramIdx++;
    }
    if (levelKey) {
        conditions.push(`cl.level_key = $${paramIdx}`);
        params.push(levelKey);
        paramIdx++;
    }
    if (teamIds.length > 0) {
        conditions.push(`t.id = ANY($${paramIdx}::uuid[])`);
        params.push(teamIds);
        paramIdx++;
    }
    if (positions.length > 0) {
        conditions.push(`p.declared_positions && $${paramIdx}::varchar[]`);
        params.push(positions);
        paramIdx++;
    }
    const whereClause = conditions.join(" AND ");
    /* ---- Count query ---- */ const countSql = `
    SELECT COUNT(*) AS total
    FROM players p
    JOIN player_team_seasons pts ON pts.player_id = p.id
    JOIN team_seasons ts ON ts.id = pts.team_season_id
    JOIN teams t ON t.id = ts.team_id
    LEFT JOIN competitive_levels cl ON cl.id = t.competitive_level_id
    LEFT JOIN player_season_stats pss ON pss.player_team_season_id = pts.id
    WHERE ${whereClause}
  `;
    /* ---- Data query ---- */ const dataSql = `
    SELECT
      p.id, p.full_name, p.height_inches, p.weight_lbs, p.declared_positions,
      p.state_origin, p.city_origin, p.high_school,
      pts.class_year, pts.jersey_number,
      t.name AS team_name, t.slug AS team_slug,
      c.name AS conference_name, c.abbreviation AS conf_abbr,
      cl.level_key, cl.display_name AS level_display,
      pss.games_played, pss.games_started, pss.minutes_per_game,
      pss.pts_per_game, pss.reb_per_game, pss.ast_per_game,
      pss.stl_per_game, pss.blk_per_game, pss.to_per_game,
      pss.fg_pct, pss.three_pct, pss.ft_pct,
      pss.oreb_per_game, pss.dreb_per_game,
      pss.fga_per_game, pss.three_pa_per_game, pss.fta_per_game, pss.pf_per_game,
      pst.min_total, pst.fgm, pst.fga, pst.three_pm, pst.three_pa,
      pst.ftm, pst.fta, pst.pts, pst.orb, pst.drb, pst.trb,
      pst.ast, pst.tov, pst.stl, pst.blk, pst.pf,
      tss.min AS team_min, tss.fgm AS team_fgm, tss.fga AS team_fga,
      tss.fta AS team_fta, tss.tov AS team_tov, tss.trb AS team_trb
    FROM players p
    JOIN player_team_seasons pts ON pts.player_id = p.id
    JOIN team_seasons ts ON ts.id = pts.team_season_id
    JOIN teams t ON t.id = ts.team_id
    LEFT JOIN conferences c ON c.id = t.conference_id
    LEFT JOIN competitive_levels cl ON cl.id = t.competitive_level_id
    LEFT JOIN player_season_stats pss ON pss.player_team_season_id = pts.id
    LEFT JOIN player_season_totals pst ON pst.player_team_season_id = pts.id
    LEFT JOIN team_season_stats tss ON tss.team_id = t.id
    WHERE ${whereClause}
    ORDER BY ${sortExpr} ${sortDir} NULLS LAST
    LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
  `;
    const dataParams = [
        ...params,
        limit,
        offset
    ];
    const [countRes, dataRes] = await Promise.all([
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pool"].query(countSql, params),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pool"].query(dataSql, dataParams)
    ]);
    const total = parseInt(countRes.rows[0].total, 10);
    const n = (v)=>v != null ? Number(v) : null;
    const players = dataRes.rows.map((r)=>({
            id: r.id,
            name: r.full_name,
            team: r.team_name,
            teamAbbr: (r.team_slug || r.team_name || "").substring(0, 4).toUpperCase(),
            teamSlug: r.team_slug || null,
            teamLogo: null,
            conference: r.conference_name || null,
            confAbbr: r.conf_abbr || null,
            confLogo: null,
            position: r.declared_positions?.[0] || null,
            levelKey: r.level_key || null,
            levelDisplay: r.level_display || null,
            height: n(r.height_inches),
            weight: n(r.weight_lbs),
            classYear: r.class_year || null,
            jerseyNumber: r.jersey_number || null,
            // Season totals (for client-side derived stat computation)
            gp: n(r.games_played) || 0,
            gs: n(r.games_started) || 0,
            min: n(r.min_total) || 0,
            fgm: n(r.fgm) || 0,
            fga: n(r.fga) || 0,
            threePm: n(r.three_pm) || 0,
            threePa: n(r.three_pa) || 0,
            ftm: n(r.ftm) || 0,
            fta: n(r.fta) || 0,
            pts: n(r.pts) || 0,
            orb: n(r.orb) || 0,
            drb: n(r.drb) || 0,
            trb: n(r.trb) || 0,
            ast: n(r.ast) || 0,
            tov: n(r.tov) || 0,
            stl: n(r.stl) || 0,
            blk: n(r.blk) || 0,
            pf: n(r.pf) || 0,
            // Team totals
            teamMin: n(r.team_min),
            teamFgm: n(r.team_fgm),
            teamFga: n(r.team_fga),
            teamFta: n(r.team_fta),
            teamTov: n(r.team_tov),
            teamTrb: n(r.team_trb),
            // Opponent totals (not available yet)
            oppFga: null,
            oppTrb: null,
            oppPoss: null,
            // KR — excluded until engine re-run
            kr: null,
            krOffense: null,
            krDefense: null,
            krShooting: null,
            krFinishing: null,
            krPlaymaking: null,
            krPoaDefense: null,
            krTeamDefense: null,
            krRebounding: null,
            krTools: null,
            krIq: null
        }));
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        players,
        total,
        limit,
        offset
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__275461f3._.js.map