(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/players/[id]/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PlayerPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
/* ------------------------------------------------------------------ */ /* Constants                                                           */ /* ------------------------------------------------------------------ */ const CLUSTER_ORDER = [
    "shooting",
    "finishing",
    "playmaking",
    "on_ball_defense",
    "team_defense",
    "rebounding",
    "frame"
];
const CLUSTER_LABELS = {
    shooting: "Shooting",
    finishing: "Finishing",
    playmaking: "Playmaking",
    on_ball_defense: "POA Defense",
    team_defense: "Team Defense",
    rebounding: "Rebounding",
    frame: "Tools"
};
const TRAIT_LABELS = {
    // shooting
    spot_up_3pt: "3PT Spot-Up",
    movement_3pt: "3PT Movement",
    otd_3pt: "3PT Catch & Shoot",
    deep_range_3pt: "Deep Range",
    "2pt_jumper_otd": "Mid-Range OTD",
    "2pt_jumper_cs": "Mid-Range C&S",
    free_throw: "Free Throw",
    // finishing
    close_finishing: "Close Finishing",
    layup_finishing: "Layup Finishing",
    dunk_finishing: "Dunk Finishing",
    floater_runner: "Floater / Runner",
    foul_draw_rate: "Foul Draw",
    // playmaking
    passing_vision: "Passing Vision",
    passing_accuracy: "Passing Accuracy",
    drive_and_kick: "Drive & Kick",
    ball_security: "Ball Security",
    transition_playmaking: "Transition PMK",
    hockey_assist_creation: "Hockey Assist",
    screen_assist_creation: "Screen Assist",
    // on_ball_defense
    on_ball_containment: "Containment",
    screen_navigation: "Screen Nav",
    ball_pressure: "Ball Pressure",
    perimeter_shot_contest: "Shot Contest",
    perimeter_disruption: "Disruption",
    steal: "Steal",
    perimeter_foul_discipline: "Foul Discipline",
    off_ball_denial: "Off-Ball Denial",
    // team_defense
    help_defense_interior: "Help Defense",
    rim_deterrence: "Rim Deterrence",
    block: "Block",
    vertical_contest: "Vertical Contest",
    interior_positioning: "Interior Position",
    interior_disruption: "Interior Disruption",
    roll_man_defense: "Roll Man Defense",
    post_defense: "Post Defense",
    interior_foul_discipline: "Int. Foul Disc.",
    // rebounding
    defensive_rebounding: "Defensive REB",
    offensive_rebounding: "Offensive REB",
    box_out_effectiveness: "Box-Out",
    rebound_range_tracking: "Rebound Range",
    rebound_to_playmaking: "REB to Playmaking",
    rebound_conversion: "REB Conversion",
    // frame (tools)
    speed_with_ball: "Speed w/ Ball",
    speed_without_ball: "Speed w/o Ball",
    lateral_quickness: "Lateral Quickness",
    vertical_pop: "Vertical Pop",
    strength_functional: "Strength",
    acceleration_burst: "Acceleration",
    deceleration_stop: "Deceleration",
    change_of_direction: "Change of Dir.",
    power_through_contact: "Power / Contact"
};
/* ------------------------------------------------------------------ */ /* Helpers                                                             */ /* ------------------------------------------------------------------ */ function scoreColor(score) {
    if (score == null) return "#cbd5e1";
    if (score >= 90) return "#22c55e";
    if (score >= 80) return "#84cc16";
    if (score >= 70) return "#eab308";
    if (score >= 60) return "#f97316";
    if (score >= 50) return "#ea580c";
    return "#ef4444";
}
function krColor(kr) {
    if (kr == null) return "text-slate-400";
    if (kr >= 75) return "text-emerald-400";
    if (kr >= 65) return "text-lime-400";
    if (kr >= 55) return "text-yellow-400";
    if (kr >= 45) return "text-orange-400";
    return "text-red-400";
}
function fmtHeight(inches) {
    if (inches == null) return "\u2014";
    const ft = Math.floor(inches / 12);
    const rem = inches % 12;
    return `${ft}'${rem}"`;
}
function fmtPct(v, dec = 1) {
    if (v == null) return "\u2014";
    return `${(v * 100).toFixed(dec)}%`;
}
function fmtStat(v, dec = 1) {
    if (v == null) return "\u2014";
    return v.toFixed(dec);
}
function fmtInt(v) {
    if (v == null) return "\u2014";
    return String(Math.round(v));
}
function safeDiv(a, b) {
    if (a == null || b == null || b === 0) return null;
    return a / b;
}
function splitName(full) {
    const parts = full.trim().split(/\s+/);
    if (parts.length <= 1) return {
        first: "",
        last: full
    };
    return {
        first: parts[0],
        last: parts.slice(1).join(" ")
    };
}
function formatArchetype(key) {
    return key.replace(/_/g, " ").replace(/\b\w/g, (c)=>c.toUpperCase());
}
function computeTraditional(t, ts) {
    const gp = t.gp ?? 0;
    const min = t.min ?? 0;
    const pg = (v)=>v != null && gp > 0 ? v / gp : null;
    const p40 = (v)=>v != null && min > 0 ? v / min * 40 : null;
    const fgPct = safeDiv(t.fgm, t.fga);
    const twoPm = (t.fgm ?? 0) - (t.threePm ?? 0);
    const twoPa = (t.fga ?? 0) - (t.threePa ?? 0);
    const twoPct = safeDiv(twoPm, twoPa);
    const threePct = safeDiv(t.threePm, t.threePa);
    const ftPct = safeDiv(t.ftm, t.fta);
    const efgPct = t.fga ? ((t.fgm ?? 0) + 0.5 * (t.threePm ?? 0)) / t.fga : null;
    const tsPct = t.fga ? (t.pts ?? 0) / (2 * ((t.fga ?? 0) + 0.44 * (t.fta ?? 0))) : null;
    const threeParRate = safeDiv(t.threePa, t.fga);
    const tmMin5 = ts.min ? ts.min / 5 : null;
    const playerPoss = (t.fga ?? 0) + 0.44 * (t.fta ?? 0) + (t.tov ?? 0);
    const teamPoss = (ts.fga ?? 0) + 0.44 * (ts.fta ?? 0) + (ts.tov ?? 0);
    let usgPct = null;
    if (tmMin5 && min > 0 && teamPoss > 0) {
        usgPct = playerPoss * tmMin5 / (min * teamPoss);
    }
    let astPct = null;
    if (tmMin5 && ts.fgm && min > 0) {
        const tmFgOn = min / tmMin5 * ts.fgm;
        const denom = tmFgOn - (t.fgm ?? 0);
        if (denom > 0) astPct = (t.ast ?? 0) / denom;
    }
    const tovPct = playerPoss > 0 ? (t.tov ?? 0) / playerPoss : null;
    const ftRate = safeDiv(t.fta, t.fga);
    const pts = t.pts ?? 0;
    const pct2pt = pts > 0 ? twoPm * 2 / pts : null;
    const pct3pt = pts > 0 ? (t.threePm ?? 0) * 3 / pts : null;
    const pctFt = pts > 0 ? (t.ftm ?? 0) / pts : null;
    const ptsFga = safeDiv(t.pts, t.fga);
    const ppp = playerPoss > 0 ? pts / playerPoss : null;
    return {
        perGame: [
            {
                label: "MPG",
                value: fmtStat(pg(t.min))
            },
            {
                label: "PPG",
                value: fmtStat(pg(t.pts))
            },
            {
                label: "RPG",
                value: fmtStat(pg(t.trb))
            },
            {
                label: "APG",
                value: fmtStat(pg(t.ast))
            },
            {
                label: "SPG",
                value: fmtStat(pg(t.stl))
            },
            {
                label: "BPG",
                value: fmtStat(pg(t.blk))
            },
            {
                label: "TOPG",
                value: fmtStat(pg(t.tov))
            }
        ],
        totals: [
            {
                label: "GP",
                value: fmtInt(t.gp)
            },
            {
                label: "GS",
                value: fmtInt(t.gs)
            },
            {
                label: "MIN",
                value: fmtInt(t.min)
            },
            {
                label: "PTS",
                value: fmtInt(t.pts)
            },
            {
                label: "TRB",
                value: fmtInt(t.trb)
            },
            {
                label: "AST",
                value: fmtInt(t.ast)
            },
            {
                label: "FGM",
                value: fmtInt(t.fgm)
            }
        ],
        shooting: [
            {
                label: "FG%",
                value: fmtPct(fgPct)
            },
            {
                label: "3P%",
                value: fmtPct(threePct)
            },
            {
                label: "FT%",
                value: fmtPct(ftPct)
            },
            {
                label: "TS%",
                value: fmtPct(tsPct)
            },
            {
                label: "eFG%",
                value: fmtPct(efgPct)
            },
            {
                label: "2P%",
                value: fmtPct(twoPct)
            },
            {
                label: "3PAr",
                value: fmtPct(threeParRate)
            }
        ],
        advanced: [
            {
                label: "AST%",
                value: fmtPct(astPct)
            },
            {
                label: "USG%",
                value: fmtPct(usgPct)
            },
            {
                label: "TOV%",
                value: fmtPct(tovPct)
            },
            {
                label: "FTr",
                value: fmtPct(ftRate)
            }
        ],
        scoring: [
            {
                label: "%2PT",
                value: fmtPct(pct2pt)
            },
            {
                label: "%3PT",
                value: fmtPct(pct3pt)
            },
            {
                label: "%FT",
                value: fmtPct(pctFt)
            },
            {
                label: "PTS/FGA",
                value: fmtStat(ptsFga, 2)
            },
            {
                label: "PPP",
                value: fmtStat(ppp, 2)
            }
        ],
        per40: [
            {
                label: "PTS/40",
                value: fmtStat(p40(t.pts))
            },
            {
                label: "REB/40",
                value: fmtStat(p40(t.trb))
            },
            {
                label: "AST/40",
                value: fmtStat(p40(t.ast))
            },
            {
                label: "STL/40",
                value: fmtStat(p40(t.stl))
            },
            {
                label: "BLK/40",
                value: fmtStat(p40(t.blk))
            },
            {
                label: "TO/40",
                value: fmtStat(p40(t.tov))
            }
        ]
    };
}
/* ------------------------------------------------------------------ */ /* Sub-components                                                      */ /* ------------------------------------------------------------------ */ function TraitRow({ label, score, status }) {
    const isScored = status === "SCORED" && score != null;
    const color = scoreColor(isScored ? score : null);
    const pct = isScored ? Math.min(score, 100) : 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2 py-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs text-slate-400 w-[120px] shrink-0 truncate",
                title: label,
                children: label
            }, void 0, false, {
                fileName: "[project]/src/app/players/[id]/page.tsx",
                lineNumber: 419,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 h-2 bg-slate-800 rounded-full overflow-hidden",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-full rounded-full transition-all",
                    style: {
                        width: `${pct}%`,
                        backgroundColor: color
                    }
                }, void 0, false, {
                    fileName: "[project]/src/app/players/[id]/page.tsx",
                    lineNumber: 423,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/players/[id]/page.tsx",
                lineNumber: 422,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs font-bold w-8 text-right tabular-nums",
                style: {
                    color
                },
                children: isScored ? score : "\u2014"
            }, void 0, false, {
                fileName: "[project]/src/app/players/[id]/page.tsx",
                lineNumber: 428,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/players/[id]/page.tsx",
        lineNumber: 418,
        columnNumber: 5
    }, this);
}
_c = TraitRow;
function ClusterCard({ clusterKey, cluster, traits, allTraits }) {
    const label = CLUSTER_LABELS[clusterKey] || clusterKey;
    const clusterScore = cluster?.score;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-[#111] rounded-lg p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                        className: "text-sm font-black uppercase tracking-wider text-white",
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/src/app/players/[id]/page.tsx",
                        lineNumber: 455,
                        columnNumber: 9
                    }, this),
                    clusterScore != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-lg font-black tabular-nums",
                        style: {
                            color: scoreColor(clusterScore)
                        },
                        children: clusterScore
                    }, void 0, false, {
                        fileName: "[project]/src/app/players/[id]/page.tsx",
                        lineNumber: 459,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/players/[id]/page.tsx",
                lineNumber: 454,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: traits.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TraitRow, {
                        label: t.label,
                        score: t.score,
                        status: t.status
                    }, t.key, false, {
                        fileName: "[project]/src/app/players/[id]/page.tsx",
                        lineNumber: 469,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/players/[id]/page.tsx",
                lineNumber: 467,
                columnNumber: 7
            }, this),
            cluster && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-2 text-[10px] text-slate-500",
                children: [
                    cluster.scoredTraits,
                    "/",
                    cluster.totalTraits,
                    " traits scored"
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/players/[id]/page.tsx",
                lineNumber: 473,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/players/[id]/page.tsx",
        lineNumber: 453,
        columnNumber: 5
    }, this);
}
_c1 = ClusterCard;
function TradCategory({ title, stats }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white border border-slate-200 rounded-lg p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                className: "text-sm font-black uppercase tracking-wider text-slate-900 mb-3",
                children: title
            }, void 0, false, {
                fileName: "[project]/src/app/players/[id]/page.tsx",
                lineNumber: 484,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: stats.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-medium text-slate-500",
                                children: s.label
                            }, void 0, false, {
                                fileName: "[project]/src/app/players/[id]/page.tsx",
                                lineNumber: 490,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-bold tabular-nums text-slate-900",
                                children: s.value
                            }, void 0, false, {
                                fileName: "[project]/src/app/players/[id]/page.tsx",
                                lineNumber: 491,
                                columnNumber: 13
                            }, this)
                        ]
                    }, s.label, true, {
                        fileName: "[project]/src/app/players/[id]/page.tsx",
                        lineNumber: 489,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/players/[id]/page.tsx",
                lineNumber: 487,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/players/[id]/page.tsx",
        lineNumber: 483,
        columnNumber: 5
    }, this);
}
_c2 = TradCategory;
function SimilarPlayerCard({ player }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: `/players/${player.id}`,
        className: "flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `text-lg font-black tabular-nums w-10 text-center ${krColor(player.kr)}`,
                children: player.kr.toFixed(0)
            }, void 0, false, {
                fileName: "[project]/src/app/players/[id]/page.tsx",
                lineNumber: 507,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 min-w-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-sm font-bold text-slate-900 truncate",
                        children: player.name
                    }, void 0, false, {
                        fileName: "[project]/src/app/players/[id]/page.tsx",
                        lineNumber: 513,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-slate-500 truncate",
                        children: player.team
                    }, void 0, false, {
                        fileName: "[project]/src/app/players/[id]/page.tsx",
                        lineNumber: 516,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/players/[id]/page.tsx",
                lineNumber: 512,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600 uppercase",
                children: player.position
            }, void 0, false, {
                fileName: "[project]/src/app/players/[id]/page.tsx",
                lineNumber: 520,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/players/[id]/page.tsx",
        lineNumber: 503,
        columnNumber: 5
    }, this);
}
_c3 = SimilarPlayerCard;
function PlayerPage() {
    _s();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const id = params.id;
    const [player, setPlayer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [similar, setSimilar] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [statView, setStatView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("kanext");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlayerPage.useEffect": ()=>{
            if (!id) return;
            setLoading(true);
            setError(null);
            Promise.all([
                fetch(`/api/players/${id}`).then({
                    "PlayerPage.useEffect": (r)=>{
                        if (!r.ok) throw new Error("Player not found");
                        return r.json();
                    }
                }["PlayerPage.useEffect"]),
                fetch(`/api/players/${id}/similar`).then({
                    "PlayerPage.useEffect": (r)=>r.json()
                }["PlayerPage.useEffect"])
            ]).then({
                "PlayerPage.useEffect": ([pData, sData])=>{
                    setPlayer(pData.player);
                    setSimilar(sData);
                }
            }["PlayerPage.useEffect"]).catch({
                "PlayerPage.useEffect": (e)=>setError(e.message)
            }["PlayerPage.useEffect"]).finally({
                "PlayerPage.useEffect": ()=>setLoading(false)
            }["PlayerPage.useEffect"]);
        }
    }["PlayerPage.useEffect"], [
        id
    ]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-[900px] mx-auto px-4 py-20 text-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-slate-400 text-sm",
                children: "Loading player..."
            }, void 0, false, {
                fileName: "[project]/src/app/players/[id]/page.tsx",
                lineNumber: 564,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/players/[id]/page.tsx",
            lineNumber: 563,
            columnNumber: 7
        }, this);
    }
    if (error || !player) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-[900px] mx-auto px-4 py-20 text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-2xl font-black text-slate-900 uppercase tracking-wide mb-2",
                    children: "Player Not Found"
                }, void 0, false, {
                    fileName: "[project]/src/app/players/[id]/page.tsx",
                    lineNumber: 572,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-slate-400 text-sm mb-6",
                    children: error || "Unknown error"
                }, void 0, false, {
                    fileName: "[project]/src/app/players/[id]/page.tsx",
                    lineNumber: 575,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/",
                    className: "text-sm font-bold text-slate-900 hover:underline",
                    children: "← Back to Player Pool"
                }, void 0, false, {
                    fileName: "[project]/src/app/players/[id]/page.tsx",
                    lineNumber: 576,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/players/[id]/page.tsx",
            lineNumber: 571,
            columnNumber: 7
        }, this);
    }
    const { first, last } = splitName(player.name);
    const kr = player.kr.finalKr;
    const trad = computeTraditional(player.totals, player.teamStats);
    // Build traits per cluster from DB data
    const traitsByCluster = {};
    for (const [key, trait] of Object.entries(player.traits)){
        const cl = trait.cluster;
        if (!traitsByCluster[cl]) traitsByCluster[cl] = [];
        traitsByCluster[cl].push({
            key,
            label: TRAIT_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c)=>c.toUpperCase()),
            score: trait.score,
            status: trait.status
        });
    }
    // Sort traits within each cluster: scored first, then alphabetical
    for (const cl of Object.keys(traitsByCluster)){
        traitsByCluster[cl].sort((a, b)=>{
            if (a.status === "SCORED" && b.status !== "SCORED") return -1;
            if (a.status !== "SCORED" && b.status === "SCORED") return 1;
            return a.label.localeCompare(b.label);
        });
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white border-b border-slate-200",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-[900px] mx-auto px-4 py-3",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 text-xs font-bold uppercase tracking-wider",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/",
                                className: "text-slate-400 hover:text-slate-900 transition-colors",
                                children: "Home"
                            }, void 0, false, {
                                fileName: "[project]/src/app/players/[id]/page.tsx",
                                lineNumber: 620,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-slate-300",
                                children: ">"
                            }, void 0, false, {
                                fileName: "[project]/src/app/players/[id]/page.tsx",
                                lineNumber: 623,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-slate-900",
                                children: player.name
                            }, void 0, false, {
                                fileName: "[project]/src/app/players/[id]/page.tsx",
                                lineNumber: 624,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/players/[id]/page.tsx",
                        lineNumber: 619,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/players/[id]/page.tsx",
                    lineNumber: 618,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/players/[id]/page.tsx",
                lineNumber: 617,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-[#0a0a0a] text-white",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-[900px] mx-auto px-4 py-8 sm:py-12",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col items-center shrink-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-3",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white/20 text-xl font-black",
                                            children: player.team.slug ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: `https://a.espncdn.com/i/teamlogos/ncaa/500/${player.team.slug.replace("espn-", "")}.png`,
                                                alt: player.team.name,
                                                className: "w-12 h-12 object-contain",
                                                onError: (e)=>{
                                                    e.target.style.display = "none";
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/players/[id]/page.tsx",
                                                lineNumber: 638,
                                                columnNumber: 21
                                            }, this) : player.team.name.charAt(0)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/players/[id]/page.tsx",
                                            lineNumber: 636,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                        lineNumber: 635,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-5xl sm:text-6xl font-black tabular-nums leading-none",
                                        style: {
                                            color: scoreColor(kr)
                                        },
                                        children: kr != null ? kr.toFixed(0) : "\u2014"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                        lineNumber: 651,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1",
                                        children: "KR Rating"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                        lineNumber: 657,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-white/50 mt-2",
                                        children: player.team.levelName
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                        lineNumber: 660,
                                        columnNumber: 15
                                    }, this),
                                    player.kr.archetype && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-1 px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold uppercase tracking-wider text-white/70",
                                        children: formatArchetype(player.kr.archetype)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                        lineNumber: 664,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/players/[id]/page.tsx",
                                lineNumber: 634,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 text-center sm:text-left",
                                children: [
                                    first && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-base sm:text-lg font-medium text-white/60 uppercase tracking-wider leading-tight",
                                        children: first
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                        lineNumber: 673,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-3xl sm:text-5xl font-black uppercase tracking-tight leading-none mb-4",
                                        children: last
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                        lineNumber: 677,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4",
                                        children: [
                                            player.position && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "px-3 py-1 rounded bg-white/15 text-xs font-black uppercase tracking-wider",
                                                children: player.position
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/players/[id]/page.tsx",
                                                lineNumber: 683,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm text-white/60",
                                                children: player.team.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/players/[id]/page.tsx",
                                                lineNumber: 687,
                                                columnNumber: 17
                                            }, this),
                                            player.team.conference && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-white/20",
                                                        children: "|"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                                        lineNumber: 692,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm text-white/40",
                                                        children: player.team.conference
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                                        lineNumber: 693,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                        lineNumber: 681,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-sm",
                                        children: [
                                            player.height != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-white/40 mr-1",
                                                        children: "HT"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                                        lineNumber: 703,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-bold",
                                                        children: fmtHeight(player.height)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                                        lineNumber: 704,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/players/[id]/page.tsx",
                                                lineNumber: 702,
                                                columnNumber: 19
                                            }, this),
                                            player.weight != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-white/40 mr-1",
                                                        children: "WT"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                                        lineNumber: 709,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-bold",
                                                        children: [
                                                            player.weight,
                                                            " lbs"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                                        lineNumber: 710,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/players/[id]/page.tsx",
                                                lineNumber: 708,
                                                columnNumber: 19
                                            }, this),
                                            player.classYear && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-white/40 mr-1",
                                                        children: "CLASS"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                                        lineNumber: 715,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-bold",
                                                        children: player.classYear
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                                        lineNumber: 716,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/players/[id]/page.tsx",
                                                lineNumber: 714,
                                                columnNumber: 19
                                            }, this),
                                            player.jerseyNumber && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-white/40 mr-1",
                                                        children: "#"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                                        lineNumber: 721,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-bold",
                                                        children: player.jerseyNumber
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                                        lineNumber: 722,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/players/[id]/page.tsx",
                                                lineNumber: 720,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                        lineNumber: 700,
                                        columnNumber: 15
                                    }, this),
                                    player.stats.ppg != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap items-end justify-center sm:justify-start gap-6 mt-6 pt-4 border-t border-white/10",
                                        children: [
                                            {
                                                label: "PPG",
                                                value: fmtStat(player.stats.ppg)
                                            },
                                            {
                                                label: "RPG",
                                                value: fmtStat(player.stats.rpg)
                                            },
                                            {
                                                label: "APG",
                                                value: fmtStat(player.stats.apg)
                                            },
                                            {
                                                label: "FG%",
                                                value: player.stats.fgPct != null ? `${(player.stats.fgPct * 100).toFixed(1)}%` : "\u2014"
                                            }
                                        ].map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xl sm:text-2xl font-black tabular-nums",
                                                        children: s.value
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                                        lineNumber: 737,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-[10px] font-bold uppercase tracking-widest text-white/40",
                                                        children: s.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                                        lineNumber: 740,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, s.label, true, {
                                                fileName: "[project]/src/app/players/[id]/page.tsx",
                                                lineNumber: 736,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                        lineNumber: 729,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/players/[id]/page.tsx",
                                lineNumber: 671,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/players/[id]/page.tsx",
                        lineNumber: 632,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/players/[id]/page.tsx",
                    lineNumber: 631,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/players/[id]/page.tsx",
                lineNumber: 630,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white border-b border-slate-200",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-[900px] mx-auto px-4 py-3 flex items-center gap-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setStatView("kanext"),
                            className: `px-4 py-2 text-sm font-bold uppercase tracking-wider rounded transition-colors ${statView === "kanext" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`,
                            children: "KaNeXT"
                        }, void 0, false, {
                            fileName: "[project]/src/app/players/[id]/page.tsx",
                            lineNumber: 755,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setStatView("traditional"),
                            className: `px-4 py-2 text-sm font-bold uppercase tracking-wider rounded transition-colors ${statView === "traditional" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`,
                            children: "Traditional"
                        }, void 0, false, {
                            fileName: "[project]/src/app/players/[id]/page.tsx",
                            lineNumber: 765,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/players/[id]/page.tsx",
                    lineNumber: 754,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/players/[id]/page.tsx",
                lineNumber: 753,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-[900px] mx-auto px-4 py-6",
                children: statView === "kanext" ? /* KaNeXT Stat Grid — 3 columns of cluster cards */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4",
                            children: [
                                "shooting",
                                "finishing",
                                "playmaking"
                            ].map((ck)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ClusterCard, {
                                    clusterKey: ck,
                                    cluster: player.clusters[ck],
                                    traits: traitsByCluster[ck] || [],
                                    allTraits: player.traits
                                }, ck, false, {
                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                    lineNumber: 786,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/players/[id]/page.tsx",
                            lineNumber: 784,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4",
                            children: [
                                "on_ball_defense",
                                "team_defense",
                                "rebounding"
                            ].map((ck)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ClusterCard, {
                                    clusterKey: ck,
                                    cluster: player.clusters[ck],
                                    traits: traitsByCluster[ck] || [],
                                    allTraits: player.traits
                                }, ck, false, {
                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                    lineNumber: 798,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/players/[id]/page.tsx",
                            lineNumber: 796,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4",
                            children: [
                                "frame"
                            ].map((ck)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ClusterCard, {
                                    clusterKey: ck,
                                    cluster: player.clusters[ck],
                                    traits: traitsByCluster[ck] || [],
                                    allTraits: player.traits
                                }, ck, false, {
                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                    lineNumber: 810,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/players/[id]/page.tsx",
                            lineNumber: 808,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/players/[id]/page.tsx",
                    lineNumber: 782,
                    columnNumber: 11
                }, this) : /* Traditional Stat Grid — 3 columns of stat categories */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TradCategory, {
                                    title: "Per Game",
                                    stats: trad.perGame
                                }, void 0, false, {
                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                    lineNumber: 824,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TradCategory, {
                                    title: "Totals",
                                    stats: trad.totals
                                }, void 0, false, {
                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                    lineNumber: 825,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/players/[id]/page.tsx",
                            lineNumber: 823,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TradCategory, {
                                    title: "Shooting",
                                    stats: trad.shooting
                                }, void 0, false, {
                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                    lineNumber: 828,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TradCategory, {
                                    title: "Advanced",
                                    stats: trad.advanced
                                }, void 0, false, {
                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                    lineNumber: 829,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/players/[id]/page.tsx",
                            lineNumber: 827,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TradCategory, {
                                    title: "Scoring",
                                    stats: trad.scoring
                                }, void 0, false, {
                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                    lineNumber: 832,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TradCategory, {
                                    title: "Per 40",
                                    stats: trad.per40
                                }, void 0, false, {
                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                    lineNumber: 833,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/players/[id]/page.tsx",
                            lineNumber: 831,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/players/[id]/page.tsx",
                    lineNumber: 822,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/players/[id]/page.tsx",
                lineNumber: 779,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-[900px] mx-auto px-4 pb-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white border border-slate-200 rounded-lg p-5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-xs font-black uppercase tracking-widest text-slate-900 mb-4 border-b-2 border-slate-900 pb-2 inline-block",
                            children: "Player Info"
                        }, void 0, false, {
                            fileName: "[project]/src/app/players/[id]/page.tsx",
                            lineNumber: 842,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 sm:grid-cols-4 gap-4",
                            children: [
                                {
                                    label: "Jersey",
                                    value: player.jerseyNumber ? `#${player.jerseyNumber}` : "\u2014"
                                },
                                {
                                    label: "Class",
                                    value: player.classYear || "\u2014"
                                },
                                {
                                    label: "Hometown",
                                    value: player.hometown || "\u2014"
                                },
                                {
                                    label: "High School",
                                    value: player.highSchool || "\u2014"
                                }
                            ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1",
                                            children: item.label
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/players/[id]/page.tsx",
                                            lineNumber: 853,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-sm font-bold text-slate-900",
                                            children: item.value
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/players/[id]/page.tsx",
                                            lineNumber: 856,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, item.label, true, {
                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                    lineNumber: 852,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/players/[id]/page.tsx",
                            lineNumber: 845,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/players/[id]/page.tsx",
                    lineNumber: 841,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/players/[id]/page.tsx",
                lineNumber: 840,
                columnNumber: 7
            }, this),
            statView === "kanext" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-[900px] mx-auto px-4 pb-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-[#0a0a0a] rounded-lg p-5 text-white",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-xs font-black uppercase tracking-widest mb-5 border-b border-white/10 pb-2 inline-block",
                            children: "KR Intelligence"
                        }, void 0, false, {
                            fileName: "[project]/src/app/players/[id]/page.tsx",
                            lineNumber: 867,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 sm:grid-cols-2 gap-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2",
                                            children: "Archetype"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/players/[id]/page.tsx",
                                            lineNumber: 874,
                                            columnNumber: 17
                                        }, this),
                                        player.kr.archetype ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "px-3 py-1 rounded bg-white/15 text-sm font-bold",
                                                    children: formatArchetype(player.kr.archetype)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                                    lineNumber: 879,
                                                    columnNumber: 21
                                                }, this),
                                                player.kr.allArchetypes.filter((a)=>a !== player.kr.archetype).map((a)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "px-2 py-0.5 rounded bg-white/5 text-xs text-white/50",
                                                        children: formatArchetype(a)
                                                    }, a, false, {
                                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                                        lineNumber: 885,
                                                        columnNumber: 25
                                                    }, this))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/players/[id]/page.tsx",
                                            lineNumber: 878,
                                            columnNumber: 19
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm text-white/30",
                                            children: "Not assigned"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/players/[id]/page.tsx",
                                            lineNumber: 894,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                    lineNumber: 873,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2",
                                            children: "Confidence"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/players/[id]/page.tsx",
                                            lineNumber: 900,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 h-3 bg-white/10 rounded-full overflow-hidden",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-full rounded-full bg-white/60 transition-all",
                                                        style: {
                                                            width: `${player.kr.confidence}%`
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                                        lineNumber: 905,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                                    lineNumber: 904,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm font-bold tabular-nums w-12 text-right",
                                                    children: [
                                                        player.kr.confidence,
                                                        "%"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                                    lineNumber: 910,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/players/[id]/page.tsx",
                                            lineNumber: 903,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                    lineNumber: 899,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2",
                                            children: "System Risks"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/players/[id]/page.tsx",
                                            lineNumber: 918,
                                            columnNumber: 17
                                        }, this),
                                        player.risks.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-1",
                                            children: [
                                                player.risks.map((risk)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `w-1.5 h-1.5 rounded-full shrink-0 ${risk.type === "major" ? "bg-red-500" : "bg-yellow-500"}`
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/players/[id]/page.tsx",
                                                                lineNumber: 925,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs text-white/70 flex-1",
                                                                children: risk.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/players/[id]/page.tsx",
                                                                lineNumber: 930,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs font-bold text-red-400 tabular-nums",
                                                                children: risk.penalty.toFixed(1)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/players/[id]/page.tsx",
                                                                lineNumber: 933,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, risk.key, true, {
                                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                                        lineNumber: 924,
                                                        columnNumber: 23
                                                    }, this)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-xs text-white/30 mt-1",
                                                    children: [
                                                        "Total penalty: ",
                                                        player.kr.riskPenalty.toFixed(1)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                                    lineNumber: 938,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/players/[id]/page.tsx",
                                            lineNumber: 922,
                                            columnNumber: 19
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm text-white/30",
                                            children: "No risks flagged"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/players/[id]/page.tsx",
                                            lineNumber: 943,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                    lineNumber: 917,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2",
                                            children: "Badges"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/players/[id]/page.tsx",
                                            lineNumber: 949,
                                            columnNumber: 17
                                        }, this),
                                        player.badges.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2",
                                            children: player.badges.map((badge)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "px-2 py-0.5 rounded bg-white/10 text-xs text-white/70",
                                                    title: `${badge.tier} — ${badge.effect > 0 ? "+" : ""}${badge.effect}`,
                                                    children: badge.name
                                                }, badge.key, false, {
                                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                                    lineNumber: 955,
                                                    columnNumber: 23
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/players/[id]/page.tsx",
                                            lineNumber: 953,
                                            columnNumber: 19
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm text-white/30",
                                            children: "No badges earned"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/players/[id]/page.tsx",
                                            lineNumber: 965,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                    lineNumber: 948,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/players/[id]/page.tsx",
                            lineNumber: 871,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-6 pt-4 border-t border-white/10",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3",
                                    children: "KR Breakdown"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                    lineNumber: 972,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap gap-x-8 gap-y-2 text-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-white/40 mr-1",
                                                    children: "Base KR"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                                    lineNumber: 977,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold tabular-nums",
                                                    children: player.kr.baseKr?.toFixed(1) ?? "\u2014"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                                    lineNumber: 978,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/players/[id]/page.tsx",
                                            lineNumber: 976,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-white/40 mr-1",
                                                    children: "Badge Boost"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                                    lineNumber: 983,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold tabular-nums text-emerald-400",
                                                    children: [
                                                        "+",
                                                        player.kr.badgeBoost.toFixed(1)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                                    lineNumber: 984,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/players/[id]/page.tsx",
                                            lineNumber: 982,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-white/40 mr-1",
                                                    children: "Risk Penalty"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                                    lineNumber: 989,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold tabular-nums text-red-400",
                                                    children: player.kr.riskPenalty.toFixed(1)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                                    lineNumber: 990,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/players/[id]/page.tsx",
                                            lineNumber: 988,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-white/40 mr-1",
                                                    children: "Override"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                                    lineNumber: 995,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold tabular-nums text-emerald-400",
                                                    children: [
                                                        "+",
                                                        player.kr.overrideBoost.toFixed(1)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                                    lineNumber: 996,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/players/[id]/page.tsx",
                                            lineNumber: 994,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-white/40 mr-1",
                                                    children: "Final KR"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                                    lineNumber: 1001,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-black tabular-nums",
                                                    style: {
                                                        color: scoreColor(kr)
                                                    },
                                                    children: kr?.toFixed(1) ?? "\u2014"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                                    lineNumber: 1002,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/players/[id]/page.tsx",
                                            lineNumber: 1000,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/players/[id]/page.tsx",
                                    lineNumber: 975,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/players/[id]/page.tsx",
                            lineNumber: 971,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/players/[id]/page.tsx",
                    lineNumber: 866,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/players/[id]/page.tsx",
                lineNumber: 865,
                columnNumber: 9
            }, this),
            similar && (similar.byPosition.length > 0 || similar.byTeam.length > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-[900px] mx-auto px-4 pb-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-xs font-black uppercase tracking-widest text-slate-900 mb-4 border-b-2 border-slate-900 pb-2 inline-block",
                        children: "Similar Players"
                    }, void 0, false, {
                        fileName: "[project]/src/app/players/[id]/page.tsx",
                        lineNumber: 1015,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
                        children: [
                            similar.byPosition.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white border border-slate-200 rounded-lg p-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3",
                                        children: [
                                            "By Position — ",
                                            player.position
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                        lineNumber: 1021,
                                        columnNumber: 17
                                    }, this),
                                    similar.byPosition.map((sp)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SimilarPlayerCard, {
                                            player: sp
                                        }, sp.id, false, {
                                            fileName: "[project]/src/app/players/[id]/page.tsx",
                                            lineNumber: 1025,
                                            columnNumber: 19
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/players/[id]/page.tsx",
                                lineNumber: 1020,
                                columnNumber: 15
                            }, this),
                            similar.byTeam.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white border border-slate-200 rounded-lg p-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3",
                                        children: [
                                            "By Team — ",
                                            player.team.name
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/players/[id]/page.tsx",
                                        lineNumber: 1031,
                                        columnNumber: 17
                                    }, this),
                                    similar.byTeam.map((sp)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SimilarPlayerCard, {
                                            player: sp
                                        }, sp.id, false, {
                                            fileName: "[project]/src/app/players/[id]/page.tsx",
                                            lineNumber: 1035,
                                            columnNumber: 19
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/players/[id]/page.tsx",
                                lineNumber: 1030,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/players/[id]/page.tsx",
                        lineNumber: 1018,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/players/[id]/page.tsx",
                lineNumber: 1014,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
_s(PlayerPage, "UO84DyPa+QIqY195WeTY9unfsps=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"]
    ];
});
_c4 = PlayerPage;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "TraitRow");
__turbopack_context__.k.register(_c1, "ClusterCard");
__turbopack_context__.k.register(_c2, "TradCategory");
__turbopack_context__.k.register(_c3, "SimilarPlayerCard");
__turbopack_context__.k.register(_c4, "PlayerPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/next/navigation.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/navigation.js [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=_2fb93713._.js.map