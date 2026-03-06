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
    "query",
    ()=>query,
    "queryOne",
    ()=>queryOne
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/node_modules/pg)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["Pool"]({
    host: "localhost",
    port: 5432,
    database: "kanext_player_pool"
});
async function query(sql, params) {
    const { rows } = await pool.query(sql, params);
    return rows;
}
async function queryOne(sql, params) {
    const rows = await query(sql, params);
    return rows[0] ?? null;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/api/teams/[teamId]/players/[playerId]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
async function GET(_req, { params }) {
    const { teamId, playerId } = await params;
    // Player bio
    const player = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryOne"])(`SELECT
      p.id,
      p.full_name AS name,
      t.id AS "teamId",
      t.name AS "teamName",
      cl.display_name AS level,
      cl.level_key AS "levelKey",
      COALESCE(c.name, '') AS conference,
      t.conference_id AS "conferenceId",
      COALESCE(array_to_string(p.declared_positions, '/'), '') AS position,
      p.height_inches AS "heightInches",
      COALESCE(pts.class_year, '') AS "classYear"
    FROM players p
    JOIN player_team_seasons pts ON pts.player_id = p.id
    JOIN team_seasons ts ON ts.id = pts.team_season_id
    JOIN teams t ON t.id = ts.team_id
    JOIN competitive_levels cl ON cl.id = t.competitive_level_id
    LEFT JOIN conferences c ON c.id = t.conference_id
    WHERE p.id = $1 AND t.id = $2`, [
        playerId,
        teamId
    ]);
    if (!player) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Player not found"
        }, {
            status: 404
        });
    }
    const conferenceId = player.conferenceId;
    // Overall season totals
    const overall = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryOne"])(`SELECT
      $1::uuid AS "playerId",
      COUNT(pgs.id)::int AS gp,
      SUM(CASE WHEN pgs.started THEN 1 ELSE 0 END)::int AS gs,
      COALESCE(SUM(pgs.minutes), 0)::float AS min,
      COALESCE(SUM(pgs.fgm), 0)::int AS fgm,
      COALESCE(SUM(pgs.fga), 0)::int AS fga,
      COALESCE(SUM(pgs.three_pm), 0)::int AS "threePm",
      COALESCE(SUM(pgs.three_pa), 0)::int AS "threePa",
      COALESCE(SUM(pgs.ftm), 0)::int AS ftm,
      COALESCE(SUM(pgs.fta), 0)::int AS fta,
      COALESCE(SUM(pgs.pts), 0)::int AS pts,
      COALESCE(SUM(pgs.oreb), 0)::int AS orb,
      COALESCE(SUM(pgs.dreb), 0)::int AS drb,
      COALESCE(SUM(pgs.reb), 0)::int AS trb,
      COALESCE(SUM(pgs.ast), 0)::int AS ast,
      COALESCE(SUM(pgs.turnovers), 0)::int AS "to",
      COALESCE(SUM(pgs.stl), 0)::int AS stl,
      COALESCE(SUM(pgs.blk), 0)::int AS blk,
      COALESCE(SUM(pgs.pf), 0)::int AS pf
    FROM player_game_stats pgs
    JOIN player_team_seasons pts ON pts.id = pgs.player_team_season_id
    JOIN team_seasons ts ON ts.id = pts.team_season_id
    WHERE pts.player_id = $1 AND ts.team_id = $2`, [
        playerId,
        teamId
    ]);
    // Game log with conference detection
    const gameLog = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT
      g.id AS "gameId",
      TO_CHAR(g.game_date, 'YYYY-MM-DD') AS date,
      opp_t.name AS opponent,
      CASE
        WHEN g.home_team_season_id = ts.id AND g.home_score > g.away_score THEN 'W'
        WHEN g.away_team_season_id = ts.id AND g.away_score > g.home_score THEN 'W'
        ELSE 'L'
      END AS result,
      CASE
        WHEN g.home_team_season_id = ts.id THEN g.home_score
        ELSE g.away_score
      END AS "teamScore",
      CASE
        WHEN g.home_team_season_id = ts.id THEN g.away_score
        ELSE g.home_score
      END AS "oppScore",
      (g.home_team_season_id = ts.id) AS "isHome",
      CASE
        WHEN t_home.conference_id = t_away.conference_id
          AND t_home.conference_id IS NOT NULL
        THEN 'CONF'
        ELSE 'NON_CONF'
      END AS "gameType",
      pgs.started,
      COALESCE(pgs.minutes, 0)::float AS min,
      COALESCE(pgs.fgm, 0)::int AS fgm,
      COALESCE(pgs.fga, 0)::int AS fga,
      COALESCE(pgs.three_pm, 0)::int AS "threePm",
      COALESCE(pgs.three_pa, 0)::int AS "threePa",
      COALESCE(pgs.ftm, 0)::int AS ftm,
      COALESCE(pgs.fta, 0)::int AS fta,
      COALESCE(pgs.pts, 0)::int AS pts,
      COALESCE(pgs.oreb, 0)::int AS orb,
      COALESCE(pgs.dreb, 0)::int AS drb,
      COALESCE(pgs.reb, 0)::int AS trb,
      COALESCE(pgs.ast, 0)::int AS ast,
      COALESCE(pgs.turnovers, 0)::int AS "to",
      COALESCE(pgs.stl, 0)::int AS stl,
      COALESCE(pgs.blk, 0)::int AS blk,
      COALESCE(pgs.pf, 0)::int AS pf
    FROM player_game_stats pgs
    JOIN player_team_seasons pts ON pts.id = pgs.player_team_season_id
    JOIN team_seasons ts ON ts.id = pts.team_season_id
    JOIN games g ON g.id = pgs.game_id
    JOIN team_seasons home_ts ON home_ts.id = g.home_team_season_id
    JOIN teams t_home ON t_home.id = home_ts.team_id
    JOIN team_seasons away_ts ON away_ts.id = g.away_team_season_id
    JOIN teams t_away ON t_away.id = away_ts.team_id
    LEFT JOIN team_seasons opp_ts ON opp_ts.id = CASE
      WHEN g.home_team_season_id = ts.id THEN g.away_team_season_id
      ELSE g.home_team_season_id
    END
    LEFT JOIN teams opp_t ON opp_t.id = opp_ts.team_id
    WHERE pts.player_id = $1 AND ts.team_id = $2
    ORDER BY g.game_date DESC`, [
        playerId,
        teamId
    ]);
    const sumStats = (games)=>{
        const gp = games.length;
        const sum = (key)=>games.reduce((s, g)=>s + (Number(g[key]) || 0), 0);
        const gs = games.filter((g)=>g.started === true).length;
        return {
            playerId,
            gp,
            gs,
            min: sum("min"),
            fgm: sum("fgm"),
            fga: sum("fga"),
            threePm: sum("threePm"),
            threePa: sum("threePa"),
            ftm: sum("ftm"),
            fta: sum("fta"),
            pts: sum("pts"),
            orb: sum("orb"),
            drb: sum("drb"),
            trb: sum("trb"),
            ast: sum("ast"),
            to: sum("to"),
            stl: sum("stl"),
            blk: sum("blk"),
            pf: sum("pf")
        };
    };
    const confGames = gameLog.filter((g)=>g.gameType === "CONF");
    const nonConfGames = gameLog.filter((g)=>g.gameType === "NON_CONF");
    const homeGames = gameLog.filter((g)=>g.isHome === true);
    const awayGames = gameLog.filter((g)=>g.isHome === false);
    const conferenceStats = sumStats(confGames);
    const nonConferenceStats = sumStats(nonConfGames);
    const splits = [
        {
            label: "Home",
            ...sumStats(homeGames)
        },
        {
            label: "Away",
            ...sumStats(awayGames)
        }
    ];
    // Game highs
    const STAT_CATS = [
        {
            key: "pts",
            label: "Points"
        },
        {
            key: "trb",
            label: "Rebounds"
        },
        {
            key: "ast",
            label: "Assists"
        },
        {
            key: "stl",
            label: "Steals"
        },
        {
            key: "blk",
            label: "Blocks"
        },
        {
            key: "threePm",
            label: "3PM"
        },
        {
            key: "ftm",
            label: "FTM"
        },
        {
            key: "min",
            label: "Minutes"
        }
    ];
    const gameHighs = STAT_CATS.map(({ key, label })=>{
        let best = null;
        let maxVal = -1;
        for (const g of gameLog){
            const v = Number(g[key]) || 0;
            if (v > maxVal) {
                maxVal = v;
                best = g;
            }
        }
        return {
            category: label,
            value: maxVal,
            opponent: best ? String(best.opponent ?? "") : "",
            date: best ? String(best.date ?? "") : ""
        };
    });
    // Category leaders — rank this player among teammates
    const teamRankings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT
      pts.player_id AS "playerId",
      SUM(pgs.pts)::int AS pts,
      SUM(pgs.reb)::int AS trb,
      SUM(pgs.ast)::int AS ast,
      SUM(pgs.stl)::int AS stl,
      SUM(pgs.blk)::int AS blk,
      SUM(pgs.three_pm)::int AS "threePm",
      CASE WHEN SUM(pgs.fta) > 0
        THEN ROUND((SUM(pgs.ftm)::numeric / SUM(pgs.fta)) * 100, 1)
        ELSE 0
      END AS "ftPct",
      COUNT(pgs.id)::int AS gp
    FROM player_game_stats pgs
    JOIN player_team_seasons pts ON pts.id = pgs.player_team_season_id
    JOIN team_seasons ts ON ts.id = pts.team_season_id
    WHERE ts.team_id = $1
    GROUP BY pts.player_id
    ORDER BY SUM(pgs.pts) DESC`, [
        teamId
    ]);
    const LEADER_CATS = [
        {
            key: "pts",
            label: "Points",
            perGame: true
        },
        {
            key: "trb",
            label: "Rebounds",
            perGame: true
        },
        {
            key: "ast",
            label: "Assists",
            perGame: true
        },
        {
            key: "stl",
            label: "Steals",
            perGame: true
        },
        {
            key: "blk",
            label: "Blocks",
            perGame: true
        },
        {
            key: "threePm",
            label: "3-Pointers",
            perGame: true
        },
        {
            key: "ftPct",
            label: "FT%",
            perGame: false
        }
    ];
    const categoryLeaders = LEADER_CATS.map(({ key, label, perGame })=>{
        const sorted = [
            ...teamRankings
        ].sort((a, b)=>{
            const va = perGame ? (Number(a[key]) || 0) / (Number(a.gp) || 1) : Number(a[key]) || 0;
            const vb = perGame ? (Number(b[key]) || 0) / (Number(b.gp) || 1) : Number(b[key]) || 0;
            return vb - va;
        });
        const idx = sorted.findIndex((r)=>r.playerId === playerId);
        const rank = idx + 1;
        const playerRow = sorted[idx];
        const val = playerRow ? perGame ? ((Number(playerRow[key]) || 0) / (Number(playerRow.gp) || 1)).toFixed(1) : `${playerRow[key]}%` : "--";
        return {
            category: label,
            rank,
            value: val
        };
    }).filter((c)=>c.rank <= 3);
    // KR — placeholder nulls for now
    const kr = {
        kr: null,
        krOff: null,
        krDef: null,
        krShooting: null,
        krFinishing: null,
        krPlaymaking: null,
        krPoaDefense: null,
        krTeamDefense: null,
        krRebounding: null,
        krTools: null,
        krIq: null,
        position: null,
        archetype: null,
        confidence: null
    };
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        player,
        overall,
        conferenceStats,
        nonConferenceStats,
        splits,
        gameLog,
        gameHighs,
        categoryLeaders,
        kr
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__57bd3c74._.js.map