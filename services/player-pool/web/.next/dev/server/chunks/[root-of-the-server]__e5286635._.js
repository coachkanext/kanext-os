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
"[project]/src/app/api/teams/[teamId]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
    const { teamId } = await params;
    // Team info
    const team = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryOne"])(`SELECT t.id, t.name,
            cl.display_name AS level,
            COALESCE(c.name, '') AS conference,
            ts.season,
            t.conference_id AS "conferenceId",
            SUM(CASE
              WHEN g.home_team_season_id = ts.id AND g.home_score > g.away_score THEN 1
              WHEN g.away_team_season_id = ts.id AND g.away_score > g.home_score THEN 1
              ELSE 0
            END)::int AS wins,
            SUM(CASE
              WHEN g.home_team_season_id = ts.id AND g.home_score < g.away_score THEN 1
              WHEN g.away_team_season_id = ts.id AND g.away_score < g.home_score THEN 1
              ELSE 0
            END)::int AS losses
    FROM teams t
    JOIN competitive_levels cl ON cl.id = t.competitive_level_id
    JOIN team_seasons ts ON ts.team_id = t.id
    LEFT JOIN conferences c ON c.id = t.conference_id
    LEFT JOIN games g ON (g.home_team_season_id = ts.id OR g.away_team_season_id = ts.id)
      AND g.home_score IS NOT NULL AND g.away_score IS NOT NULL
    WHERE t.id = $1
    GROUP BY t.id, t.name, cl.display_name, c.name, ts.season, t.conference_id`, [
        teamId
    ]);
    if (!team) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Team not found"
        }, {
            status: 404
        });
    }
    // Roster
    const roster = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT
      p.id,
      p.full_name AS name,
      t.id AS "teamId",
      t.name AS "teamName",
      cl.display_name AS level,
      cl.level_key AS "levelKey",
      COALESCE(c.name, '') AS conference,
      COALESCE(array_to_string(p.declared_positions, '/'), '') AS position,
      p.height_inches AS "heightInches",
      COALESCE(pts.class_year, '') AS "classYear",
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
    JOIN teams t ON t.id = ts.team_id
    JOIN competitive_levels cl ON cl.id = t.competitive_level_id
    JOIN players p ON p.id = pts.player_id
    LEFT JOIN conferences c ON c.id = t.conference_id
    WHERE t.id = $1
    GROUP BY p.id, p.full_name, t.id, t.name, cl.display_name, cl.level_key,
             c.name, p.declared_positions, p.height_inches, pts.class_year
    ORDER BY SUM(pgs.pts)::float / NULLIF(COUNT(pgs.id), 0) DESC`, [
        teamId
    ]);
    // Team stats — try team_game_stats first, fallback to player_game_stats aggregation
    let teamStats = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryOne"])(`SELECT
      COUNT(tgs.id)::int AS gp,
      0::float AS min,
      COALESCE(SUM(tgs.fgm), 0)::int AS fgm,
      COALESCE(SUM(tgs.fga), 0)::int AS fga,
      COALESCE(SUM(tgs.three_pm), 0)::int AS "threePm",
      COALESCE(SUM(tgs.three_pa), 0)::int AS "threePa",
      COALESCE(SUM(tgs.ftm), 0)::int AS ftm,
      COALESCE(SUM(tgs.fta), 0)::int AS fta,
      COALESCE(SUM(tgs.pts), 0)::int AS pts,
      COALESCE(SUM(tgs.oreb), 0)::int AS orb,
      COALESCE(SUM(tgs.dreb), 0)::int AS drb,
      COALESCE(SUM(tgs.reb), 0)::int AS trb,
      COALESCE(SUM(tgs.ast), 0)::int AS ast,
      COALESCE(SUM(tgs.turnovers), 0)::int AS "to",
      COALESCE(SUM(tgs.stl), 0)::int AS stl,
      COALESCE(SUM(tgs.blk), 0)::int AS blk,
      COALESCE(SUM(tgs.pf), 0)::int AS pf,
      0::float AS "oppPpg"
    FROM team_game_stats tgs
    JOIN team_seasons ts ON ts.id = tgs.team_season_id
    WHERE ts.team_id = $1`, [
        teamId
    ]);
    // If no team_game_stats data, aggregate from player_game_stats
    if (!teamStats || teamStats.gp === 0) {
        teamStats = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryOne"])(`SELECT
        (SELECT COUNT(DISTINCT g.id)::int
         FROM games g
         JOIN team_seasons ts2 ON ts2.team_id = $1
         WHERE g.home_team_season_id = ts2.id OR g.away_team_season_id = ts2.id
        ) AS gp,
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
        COALESCE(SUM(pgs.pf), 0)::int AS pf,
        0::float AS "oppPpg"
      FROM player_game_stats pgs
      JOIN player_team_seasons pts ON pts.id = pgs.player_team_season_id
      JOIN team_seasons ts ON ts.id = pts.team_season_id
      WHERE ts.team_id = $1`, [
            teamId
        ]);
    }
    // Opponent stats — try team_game_stats self-join, fallback to game scores
    let opponentStats = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryOne"])(`SELECT
      COUNT(opp_tgs.id)::int AS gp,
      0::float AS min,
      COALESCE(SUM(opp_tgs.fgm), 0)::int AS fgm,
      COALESCE(SUM(opp_tgs.fga), 0)::int AS fga,
      COALESCE(SUM(opp_tgs.three_pm), 0)::int AS "threePm",
      COALESCE(SUM(opp_tgs.three_pa), 0)::int AS "threePa",
      COALESCE(SUM(opp_tgs.ftm), 0)::int AS ftm,
      COALESCE(SUM(opp_tgs.fta), 0)::int AS fta,
      COALESCE(SUM(opp_tgs.pts), 0)::int AS pts,
      COALESCE(SUM(opp_tgs.oreb), 0)::int AS orb,
      COALESCE(SUM(opp_tgs.dreb), 0)::int AS drb,
      COALESCE(SUM(opp_tgs.reb), 0)::int AS trb,
      COALESCE(SUM(opp_tgs.ast), 0)::int AS ast,
      COALESCE(SUM(opp_tgs.turnovers), 0)::int AS "to",
      COALESCE(SUM(opp_tgs.stl), 0)::int AS stl,
      COALESCE(SUM(opp_tgs.blk), 0)::int AS blk,
      COALESCE(SUM(opp_tgs.pf), 0)::int AS pf,
      0::float AS "oppPpg"
    FROM team_game_stats tgs
    JOIN team_seasons ts ON ts.id = tgs.team_season_id
    JOIN team_game_stats opp_tgs ON opp_tgs.game_id = tgs.game_id
      AND opp_tgs.team_season_id <> tgs.team_season_id
    WHERE ts.team_id = $1`, [
        teamId
    ]);
    // If no opponent box score data, provide zeroed placeholder
    if (!opponentStats || opponentStats.gp === 0) {
        opponentStats = {
            gp: 0,
            min: 0,
            fgm: 0,
            fga: 0,
            threePm: 0,
            threePa: 0,
            ftm: 0,
            fta: 0,
            pts: 0,
            orb: 0,
            drb: 0,
            trb: 0,
            ast: 0,
            to: 0,
            stl: 0,
            blk: 0,
            pf: 0,
            oppPpg: 0
        };
    }
    // Game log with isHome and gameType
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
      COALESCE(SUM(pgs.minutes), 0)::float AS min,
      COALESCE(SUM(pgs.fgm), 0)::int AS fgm,
      COALESCE(SUM(pgs.fga), 0)::int AS fga,
      COALESCE(SUM(pgs.three_pm), 0)::int AS "threePm",
      COALESCE(SUM(pgs.three_pa), 0)::int AS "threePa",
      COALESCE(SUM(pgs.ftm), 0)::int AS ftm,
      COALESCE(SUM(pgs.fta), 0)::int AS fta,
      COALESCE(SUM(pgs.oreb), 0)::int AS orb,
      COALESCE(SUM(pgs.dreb), 0)::int AS drb,
      COALESCE(SUM(pgs.reb), 0)::int AS trb,
      COALESCE(SUM(pgs.ast), 0)::int AS ast,
      COALESCE(SUM(pgs.turnovers), 0)::int AS "to",
      COALESCE(SUM(pgs.stl), 0)::int AS stl,
      COALESCE(SUM(pgs.blk), 0)::int AS blk,
      COALESCE(SUM(pgs.pf), 0)::int AS pf,
      COALESCE(SUM(pgs.pts), 0)::int AS pts
    FROM games g
    JOIN team_seasons ts ON ts.team_id = $1
      AND (g.home_team_season_id = ts.id OR g.away_team_season_id = ts.id)
    JOIN team_seasons home_ts ON home_ts.id = g.home_team_season_id
    JOIN teams t_home ON t_home.id = home_ts.team_id
    JOIN team_seasons away_ts ON away_ts.id = g.away_team_season_id
    JOIN teams t_away ON t_away.id = away_ts.team_id
    JOIN player_game_stats pgs ON pgs.game_id = g.id
      AND pgs.player_team_season_id IN (
        SELECT id FROM player_team_seasons WHERE team_season_id = ts.id
      )
    LEFT JOIN team_seasons opp_ts ON opp_ts.id = CASE
      WHEN g.home_team_season_id = ts.id THEN g.away_team_season_id
      ELSE g.home_team_season_id
    END
    LEFT JOIN teams opp_t ON opp_t.id = opp_ts.team_id
    GROUP BY g.id, g.game_date, g.home_team_season_id, g.away_team_season_id,
             g.home_score, g.away_score, ts.id, opp_t.name,
             t_home.conference_id, t_away.conference_id
    ORDER BY g.game_date DESC`, [
        teamId
    ]);
    const makeSplit = (label, games)=>{
        const gp = games.length;
        const sum = (key)=>games.reduce((s, g)=>s + (Number(g[key]) || 0), 0);
        return {
            label,
            gp,
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
            pf: sum("pf"),
            oppPpg: gp ? games.reduce((s, g)=>s + Number(g.oppScore || 0), 0) / gp : 0
        };
    };
    const homeGames = gameLog.filter((g)=>g.isHome === true);
    const awayGames = gameLog.filter((g)=>g.isHome === false);
    const confGames = gameLog.filter((g)=>g.gameType === "CONF");
    const nonConfGames = gameLog.filter((g)=>g.gameType === "NON_CONF");
    const splits = [
        makeSplit("Home", homeGames),
        makeSplit("Away", awayGames),
        makeSplit("Conference", confGames),
        makeSplit("Non-Conference", nonConfGames)
    ];
    // Game highs — compute from gameLog in JS
    const STAT_CATS = [
        {
            key: "pts",
            label: "Points"
        },
        {
            key: "fgm",
            label: "FGM"
        },
        {
            key: "fga",
            label: "FGA"
        },
        {
            key: "threePm",
            label: "3PM"
        },
        {
            key: "threePa",
            label: "3PA"
        },
        {
            key: "ftm",
            label: "FTM"
        },
        {
            key: "fta",
            label: "FTA"
        },
        {
            key: "trb",
            label: "Rebounds"
        },
        {
            key: "orb",
            label: "Off Rebounds"
        },
        {
            key: "drb",
            label: "Def Rebounds"
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
            key: "to",
            label: "Turnovers"
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
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        team,
        roster,
        teamStats,
        opponentStats,
        splits,
        gameLog,
        gameHighs
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e5286635._.js.map