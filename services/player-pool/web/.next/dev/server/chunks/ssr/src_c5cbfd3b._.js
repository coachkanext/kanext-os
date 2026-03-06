module.exports = [
"[project]/src/components/filter-drawer/sort-options.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ADVANCED_SORT_OPTIONS",
    ()=>ADVANCED_SORT_OPTIONS,
    "DEFAULT_KANEXT_SORT",
    ()=>DEFAULT_KANEXT_SORT,
    "DEFAULT_TRADITIONAL_SORT",
    ()=>DEFAULT_TRADITIONAL_SORT,
    "KANEXT_CLUSTERS",
    ()=>KANEXT_CLUSTERS,
    "KANEXT_TOP_OPTIONS",
    ()=>KANEXT_TOP_OPTIONS,
    "PER40_SORT_OPTIONS",
    ()=>PER40_SORT_OPTIONS,
    "PER_GAME_SORT_OPTIONS",
    ()=>PER_GAME_SORT_OPTIONS,
    "SCORING_SORT_OPTIONS",
    ()=>SCORING_SORT_OPTIONS,
    "SHOOTING_SORT_OPTIONS",
    ()=>SHOOTING_SORT_OPTIONS,
    "TOTALS_SORT_OPTIONS",
    ()=>TOTALS_SORT_OPTIONS,
    "TRADITIONAL_CATEGORIES",
    ()=>TRADITIONAL_CATEGORIES
]);
const PER_GAME_SORT_OPTIONS = [
    {
        key: "mpg",
        label: "MPG",
        defaultDirection: "desc"
    },
    {
        key: "ppg",
        label: "PPG",
        defaultDirection: "desc"
    },
    {
        key: "rpg",
        label: "RPG",
        defaultDirection: "desc"
    },
    {
        key: "apg",
        label: "APG",
        defaultDirection: "desc"
    },
    {
        key: "spg",
        label: "SPG",
        defaultDirection: "desc"
    },
    {
        key: "bpg",
        label: "BPG",
        defaultDirection: "desc"
    },
    {
        key: "topg",
        label: "TOPG",
        defaultDirection: "asc"
    }
];
const TOTALS_SORT_OPTIONS = [
    {
        key: "gp",
        label: "GP",
        defaultDirection: "desc"
    },
    {
        key: "gs",
        label: "GS",
        defaultDirection: "desc"
    },
    {
        key: "total_min",
        label: "MIN",
        defaultDirection: "desc"
    },
    {
        key: "total_pts",
        label: "PTS",
        defaultDirection: "desc"
    },
    {
        key: "total_trb",
        label: "TRB",
        defaultDirection: "desc"
    },
    {
        key: "total_ast",
        label: "AST",
        defaultDirection: "desc"
    },
    {
        key: "total_fgm",
        label: "FGM",
        defaultDirection: "desc"
    }
];
const SHOOTING_SORT_OPTIONS = [
    {
        key: "fg_pct",
        label: "FG%",
        defaultDirection: "desc"
    },
    {
        key: "three_pct",
        label: "3P%",
        defaultDirection: "desc"
    },
    {
        key: "ft_pct",
        label: "FT%",
        defaultDirection: "desc"
    },
    {
        key: "ts_pct",
        label: "TS%",
        defaultDirection: "desc"
    },
    {
        key: "efg_pct",
        label: "eFG%",
        defaultDirection: "desc"
    },
    {
        key: "two_pct",
        label: "2P%",
        defaultDirection: "desc"
    },
    {
        key: "three_par",
        label: "3PAr",
        defaultDirection: "desc"
    }
];
const ADVANCED_SORT_OPTIONS = [
    {
        key: "ast_pct",
        label: "AST%",
        defaultDirection: "desc"
    },
    {
        key: "usg_pct",
        label: "USG%",
        defaultDirection: "desc"
    },
    {
        key: "tov_pct",
        label: "TOV%",
        defaultDirection: "asc"
    },
    {
        key: "stl_pct",
        label: "STL%",
        defaultDirection: "desc"
    },
    {
        key: "blk_pct",
        label: "BLK%",
        defaultDirection: "desc"
    },
    {
        key: "reb_pct",
        label: "REB%",
        defaultDirection: "desc"
    },
    {
        key: "per",
        label: "PER",
        defaultDirection: "desc"
    }
];
const SCORING_SORT_OPTIONS = [
    {
        key: "pct_2pt",
        label: "%2PT",
        defaultDirection: "desc"
    },
    {
        key: "pct_3pt",
        label: "%3PT",
        defaultDirection: "desc"
    },
    {
        key: "pct_ft",
        label: "%FT",
        defaultDirection: "desc"
    },
    {
        key: "ft_rate",
        label: "FTr",
        defaultDirection: "desc"
    },
    {
        key: "pts_fga",
        label: "PTS/FGA",
        defaultDirection: "desc"
    },
    {
        key: "ppp",
        label: "PPP",
        defaultDirection: "desc"
    }
];
const PER40_SORT_OPTIONS = [
    {
        key: "pts_40",
        label: "PTS/40",
        defaultDirection: "desc"
    },
    {
        key: "reb_40",
        label: "REB/40",
        defaultDirection: "desc"
    },
    {
        key: "ast_40",
        label: "AST/40",
        defaultDirection: "desc"
    },
    {
        key: "stl_40",
        label: "STL/40",
        defaultDirection: "desc"
    },
    {
        key: "blk_40",
        label: "BLK/40",
        defaultDirection: "desc"
    },
    {
        key: "to_40",
        label: "TO/40",
        defaultDirection: "asc"
    }
];
const TRADITIONAL_CATEGORIES = [
    {
        key: "per_game",
        label: "Per Game",
        options: PER_GAME_SORT_OPTIONS
    },
    {
        key: "totals",
        label: "Totals",
        options: TOTALS_SORT_OPTIONS
    },
    {
        key: "shooting",
        label: "Shooting",
        options: SHOOTING_SORT_OPTIONS
    },
    {
        key: "advanced",
        label: "Advanced",
        options: ADVANCED_SORT_OPTIONS
    },
    {
        key: "scoring",
        label: "Scoring",
        options: SCORING_SORT_OPTIONS
    },
    {
        key: "per40",
        label: "Per 40",
        options: PER40_SORT_OPTIONS
    }
];
const KANEXT_TOP_OPTIONS = [
    {
        key: "kr",
        label: "KR",
        defaultDirection: "desc"
    }
];
const KANEXT_CLUSTERS = [
    {
        key: "shooting",
        label: "Shooting",
        defaultDirection: "desc",
        traits: [
            {
                key: "trait_3pt_spot_up",
                label: "3PT Spot-Up"
            },
            {
                key: "trait_3pt_movement",
                label: "3PT Movement"
            },
            {
                key: "trait_3pt_pull_up",
                label: "3PT Pull-Up"
            },
            {
                key: "trait_3pt_deep_range",
                label: "3PT Deep Range"
            },
            {
                key: "trait_midrange_shotmaking",
                label: "Midrange Shotmaking"
            },
            {
                key: "trait_free_throw",
                label: "Free Throw"
            }
        ]
    },
    {
        key: "finishing",
        label: "Finishing",
        defaultDirection: "desc",
        traits: [
            {
                key: "trait_rim_pressure",
                label: "Rim Pressure"
            },
            {
                key: "trait_contact_finishing",
                label: "Contact Finishing"
            },
            {
                key: "trait_touch_craft",
                label: "Touch / Craft"
            },
            {
                key: "trait_foul_draw",
                label: "Foul Draw"
            },
            {
                key: "trait_vertical_finishing",
                label: "Vertical Finishing"
            },
            {
                key: "trait_transition_finishing",
                label: "Transition Finishing"
            }
        ]
    },
    {
        key: "playmaking",
        label: "Playmaking",
        defaultDirection: "desc",
        traits: [
            {
                key: "trait_advantage_creation",
                label: "Advantage Creation"
            },
            {
                key: "trait_passing_vision",
                label: "Passing Vision"
            },
            {
                key: "trait_passing_execution",
                label: "Passing Execution"
            },
            {
                key: "trait_advantage_passing",
                label: "Advantage Passing"
            },
            {
                key: "trait_transition_playmaking",
                label: "Transition Playmaking"
            },
            {
                key: "trait_ball_security",
                label: "Ball Security"
            },
            {
                key: "trait_connector_creation",
                label: "Connector Creation"
            }
        ]
    },
    {
        key: "poa_defense",
        label: "POA Defense",
        defaultDirection: "desc",
        traits: [
            {
                key: "trait_containment",
                label: "Containment"
            },
            {
                key: "trait_screen_navigation",
                label: "Screen Navigation"
            },
            {
                key: "trait_ball_pressure",
                label: "Ball Pressure"
            },
            {
                key: "trait_closeout_recovery",
                label: "Closeout & Recovery"
            },
            {
                key: "trait_deflections",
                label: "Deflections"
            },
            {
                key: "trait_steal_timing",
                label: "Steal Timing"
            },
            {
                key: "trait_foul_discipline",
                label: "Foul Discipline"
            }
        ]
    },
    {
        key: "team_defense",
        label: "Team Defense",
        defaultDirection: "desc",
        traits: [
            {
                key: "trait_help_rotation",
                label: "Help & Rotation"
            },
            {
                key: "trait_rim_protection",
                label: "Rim Protection"
            },
            {
                key: "trait_closeout_execution",
                label: "Closeout Execution"
            },
            {
                key: "trait_off_ball_positioning",
                label: "Off-Ball Positioning"
            },
            {
                key: "trait_communication_qb",
                label: "Communication & QB"
            },
            {
                key: "trait_versatility",
                label: "Versatility"
            },
            {
                key: "trait_team_foul_discipline",
                label: "Team Foul Discipline"
            }
        ]
    },
    {
        key: "rebounding",
        label: "Rebounding",
        defaultDirection: "desc",
        traits: [
            {
                key: "trait_defensive_rebounding",
                label: "Defensive Rebounding"
            },
            {
                key: "trait_offensive_rebounding",
                label: "Offensive Rebounding"
            },
            {
                key: "trait_box_out",
                label: "Box-Out"
            },
            {
                key: "trait_rebound_range",
                label: "Rebound Range"
            },
            {
                key: "trait_hands",
                label: "Hands"
            },
            {
                key: "trait_second_jump",
                label: "Second-Jump / Tip Ability"
            }
        ]
    },
    {
        key: "tools",
        label: "Tools",
        defaultDirection: "desc",
        traits: [
            {
                key: "trait_height",
                label: "Height"
            },
            {
                key: "trait_length",
                label: "Length"
            },
            {
                key: "trait_strength",
                label: "Strength"
            },
            {
                key: "trait_speed",
                label: "Speed"
            },
            {
                key: "trait_lateral_quickness",
                label: "Lateral Quickness"
            },
            {
                key: "trait_vertical_pop",
                label: "Vertical Pop"
            },
            {
                key: "trait_motor",
                label: "Motor"
            },
            {
                key: "trait_endurance",
                label: "Endurance"
            }
        ]
    },
    {
        key: "iq",
        label: "IQ",
        defaultDirection: "desc",
        traits: [
            {
                key: "trait_decision_speed",
                label: "Decision Speed"
            },
            {
                key: "trait_read_accuracy",
                label: "Read Accuracy"
            },
            {
                key: "trait_shot_decision",
                label: "Shot Decision"
            },
            {
                key: "trait_play_discipline",
                label: "Play Discipline"
            },
            {
                key: "trait_risk_management",
                label: "Risk Management"
            },
            {
                key: "trait_situation_iq",
                label: "Situation IQ"
            }
        ]
    }
];
const DEFAULT_TRADITIONAL_SORT = {
    key: "ppg",
    direction: "desc"
};
const DEFAULT_KANEXT_SORT = {
    key: "kr",
    direction: "desc"
};
}),
"[project]/src/components/filter-drawer/drawer-main.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DrawerMain
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$sort$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/filter-drawer/sort-options.ts [app-ssr] (ecmascript)");
"use client";
;
;
/* Build a human-readable label for the current sort */ function sortLabel(sort, statView) {
    // Search Traditional categories
    for (const cat of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$sort$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TRADITIONAL_CATEGORIES"]){
        const opt = cat.options.find((o)=>o.key === sort.key);
        if (opt) return `${opt.label} ${sort.direction === "desc" ? "\u2193" : "\u2191"}`;
    }
    // Search KaNeXT top options
    for (const opt of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$sort$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KANEXT_TOP_OPTIONS"]){
        if (opt.key === sort.key) return `${opt.label} ${sort.direction === "desc" ? "\u2193" : "\u2191"}`;
    }
    // Search KaNeXT clusters
    for (const cluster of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$sort$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KANEXT_CLUSTERS"]){
        if (cluster.key === sort.key) return `${cluster.label} ${sort.direction === "desc" ? "\u2193" : "\u2191"}`;
        for (const trait of cluster.traits){
            if (trait.key === sort.key) return `${trait.label} ${sort.direction === "desc" ? "\u2193" : "\u2191"}`;
        }
    }
    return sort.key;
}
function DrawerMain({ levelKey, teamIds, positions, archetypes, sort, statView, levels, onNavigate, onReset, onApply, onClose }) {
    const levelLabel = levelKey ? levels.find((l)=>l.levelKey === levelKey)?.displayName ?? levelKey : "All";
    const teamLabel = teamIds.length === 0 ? "All" : `${teamIds.length} selected`;
    const posLabel = positions.length === 0 ? "All" : `${positions.length} selected`;
    const archLabel = archetypes.length === 0 ? "All" : `${archetypes.length} selected`;
    const sortValue = sortLabel(sort, statView);
    const rows = [
        {
            label: "Level",
            value: levelLabel,
            screen: "level"
        },
        {
            label: "Teams",
            value: teamLabel,
            screen: "teams"
        },
        {
            label: "Position",
            value: posLabel,
            screen: "position"
        },
        {
            label: "Archetype",
            value: archLabel,
            screen: "archetype"
        },
        {
            label: "Sort By",
            value: sortValue,
            screen: "sort"
        },
        {
            label: "Updates",
            value: "\u2014",
            screen: "updates"
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between px-5 py-4 border-b border-slate-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-base font-bold text-slate-900",
                        children: "Filter & Sort"
                    }, void 0, false, {
                        fileName: "[project]/src/components/filter-drawer/drawer-main.tsx",
                        lineNumber: 79,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onClose,
                        className: "p-1 hover:bg-slate-100 rounded transition-colors",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-5 h-5 text-slate-500",
                            fill: "none",
                            stroke: "currentColor",
                            viewBox: "0 0 24 24",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: 2,
                                d: "M6 18L18 6M6 6l12 12"
                            }, void 0, false, {
                                fileName: "[project]/src/components/filter-drawer/drawer-main.tsx",
                                lineNumber: 82,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/filter-drawer/drawer-main.tsx",
                            lineNumber: 81,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/filter-drawer/drawer-main.tsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/filter-drawer/drawer-main.tsx",
                lineNumber: 78,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto",
                children: rows.map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>onNavigate(row.screen),
                        className: "w-full flex items-center justify-between px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-semibold text-slate-900",
                                children: row.label
                            }, void 0, false, {
                                fileName: "[project]/src/components/filter-drawer/drawer-main.tsx",
                                lineNumber: 95,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-slate-500",
                                        children: row.value
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/filter-drawer/drawer-main.tsx",
                                        lineNumber: 97,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-4 h-4 text-slate-400",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M9 5l7 7-7 7"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/filter-drawer/drawer-main.tsx",
                                            lineNumber: 99,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/filter-drawer/drawer-main.tsx",
                                        lineNumber: 98,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/filter-drawer/drawer-main.tsx",
                                lineNumber: 96,
                                columnNumber: 13
                            }, this)
                        ]
                    }, row.screen, true, {
                        fileName: "[project]/src/components/filter-drawer/drawer-main.tsx",
                        lineNumber: 90,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/filter-drawer/drawer-main.tsx",
                lineNumber: 88,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between px-5 py-4 border-t border-slate-200 bg-white",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onReset,
                        className: "text-sm font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors",
                        children: "Reset Filters"
                    }, void 0, false, {
                        fileName: "[project]/src/components/filter-drawer/drawer-main.tsx",
                        lineNumber: 108,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onApply,
                        className: "px-5 py-2.5 bg-slate-900 text-white text-sm font-bold uppercase tracking-wider rounded hover:bg-slate-800 transition-colors",
                        children: "Apply Filters"
                    }, void 0, false, {
                        fileName: "[project]/src/components/filter-drawer/drawer-main.tsx",
                        lineNumber: 114,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/filter-drawer/drawer-main.tsx",
                lineNumber: 107,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/filter-drawer/drawer-main.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/filter-drawer/drawer-level.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DrawerLevel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
"use client";
;
const LEVEL_ORDER = [
    {
        key: null,
        label: "All"
    },
    {
        key: "ncaa_d1",
        label: "NCAA D1"
    },
    {
        key: "ncaa_d2",
        label: "NCAA D2"
    },
    {
        key: "ncaa_d3",
        label: "NCAA D3"
    },
    {
        key: "naia",
        label: "NAIA"
    },
    {
        key: "njcaa_d1",
        label: "NJCAA D1"
    },
    {
        key: "njcaa_d2",
        label: "NJCAA D2"
    },
    {
        key: "njcaa_d3",
        label: "NJCAA D3"
    },
    {
        key: "cccaa",
        label: "CCCAA"
    }
];
function DrawerLevel({ levels, selected, onSelect, onBack, onClose }) {
    // Only show levels that exist in the fetched data (plus "All")
    const availableKeys = new Set(levels.map((l)=>l.levelKey));
    const options = LEVEL_ORDER.filter((o)=>o.key === null || availableKeys.has(o.key));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 px-5 py-4 border-b border-slate-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onBack,
                        className: "p-1 hover:bg-slate-100 rounded transition-colors",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-5 h-5 text-slate-600",
                            fill: "none",
                            stroke: "currentColor",
                            viewBox: "0 0 24 24",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: 2,
                                d: "M15 19l-7-7 7-7"
                            }, void 0, false, {
                                fileName: "[project]/src/components/filter-drawer/drawer-level.tsx",
                                lineNumber: 36,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/filter-drawer/drawer-level.tsx",
                            lineNumber: 35,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/filter-drawer/drawer-level.tsx",
                        lineNumber: 34,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "flex-1 text-base font-bold text-slate-900",
                        children: "Level"
                    }, void 0, false, {
                        fileName: "[project]/src/components/filter-drawer/drawer-level.tsx",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onClose,
                        className: "p-1 hover:bg-slate-100 rounded transition-colors",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-5 h-5 text-slate-500",
                            fill: "none",
                            stroke: "currentColor",
                            viewBox: "0 0 24 24",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: 2,
                                d: "M6 18L18 6M6 6l12 12"
                            }, void 0, false, {
                                fileName: "[project]/src/components/filter-drawer/drawer-level.tsx",
                                lineNumber: 42,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/filter-drawer/drawer-level.tsx",
                            lineNumber: 41,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/filter-drawer/drawer-level.tsx",
                        lineNumber: 40,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/filter-drawer/drawer-level.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto",
                children: options.map((opt)=>{
                    const active = selected === opt.key;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>onSelect(opt.key),
                        className: "w-full flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? "border-slate-900" : "border-slate-300"}`,
                                children: active && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "w-2.5 h-2.5 rounded-full bg-slate-900"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/filter-drawer/drawer-level.tsx",
                                    lineNumber: 62,
                                    columnNumber: 28
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/filter-drawer/drawer-level.tsx",
                                lineNumber: 57,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `text-sm ${active ? "font-bold text-slate-900" : "text-slate-700"}`,
                                children: opt.label
                            }, void 0, false, {
                                fileName: "[project]/src/components/filter-drawer/drawer-level.tsx",
                                lineNumber: 64,
                                columnNumber: 15
                            }, this)
                        ]
                    }, opt.key ?? "__all", true, {
                        fileName: "[project]/src/components/filter-drawer/drawer-level.tsx",
                        lineNumber: 52,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/components/filter-drawer/drawer-level.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/filter-drawer/drawer-level.tsx",
        lineNumber: 31,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/filter-drawer/filter-drawer.tsx [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FilterDrawer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$drawer$2d$main$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/filter-drawer/drawer-main.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$drawer$2d$level$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/filter-drawer/drawer-level.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$sort$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/filter-drawer/sort-options.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
/* ------------------------------------------------------------------ */ /* Default filters                                                     */ /* ------------------------------------------------------------------ */ const EMPTY_FILTERS = {
    levelKey: null,
    teamIds: [],
    positions: [],
    archetypes: []
};
const POSITIONS = [
    "PG",
    "CG",
    "SG",
    "SF",
    "PF",
    "C"
];
const ARCHETYPES = [
    "Shooter",
    "Shot Creator",
    "Rim Pressure",
    "Playmaker",
    "Point-of-Attack Defender",
    "Help Defender",
    "Rim Protector",
    "Rebounder",
    "Stretch Big",
    "Connector"
];
;
/* ------------------------------------------------------------------ */ /* Sub-screen header (shared by conference & teams)                    */ /* ------------------------------------------------------------------ */ function SubHeader({ title, onBack, onClose }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-3 px-5 py-4 border-b border-slate-200",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onBack,
                className: "p-1 hover:bg-slate-100 rounded transition-colors",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    className: "w-5 h-5 text-slate-600",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M15 19l-7-7 7-7"
                    }, void 0, false, {
                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                        lineNumber: 83,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                    lineNumber: 82,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "flex-1 text-base font-bold text-slate-900",
                children: title
            }, void 0, false, {
                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                lineNumber: 86,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onClose,
                className: "p-1 hover:bg-slate-100 rounded transition-colors",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    className: "w-5 h-5 text-slate-500",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M6 18L18 6M6 6l12 12"
                    }, void 0, false, {
                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                        lineNumber: 89,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                    lineNumber: 88,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
        lineNumber: 80,
        columnNumber: 5
    }, this);
}
/* ------------------------------------------------------------------ */ /* Search input (shared by conference & teams)                         */ /* ------------------------------------------------------------------ */ function SearchInput({ value, onChange, placeholder }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "px-5 py-3 border-b border-slate-100",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    type: "text",
                    value: value,
                    onChange: (e)=>onChange(e.target.value),
                    placeholder: placeholder,
                    className: "w-full h-9 pl-9 pr-3 text-sm bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent"
                }, void 0, false, {
                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                    lineNumber: 112,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    }, void 0, false, {
                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                        lineNumber: 125,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                    lineNumber: 119,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
            lineNumber: 111,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
        lineNumber: 110,
        columnNumber: 5
    }, this);
}
/* ------------------------------------------------------------------ */ /* Checkbox row                                                        */ /* ------------------------------------------------------------------ */ function CheckRow({ label, sublabel, checked, onChange }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
        className: "flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "checkbox",
                checked: checked,
                onChange: (e)=>onChange(e.target.checked),
                className: "w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 shrink-0"
            }, void 0, false, {
                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                lineNumber: 154,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "flex-1 min-w-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm text-slate-800 block truncate",
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                        lineNumber: 161,
                        columnNumber: 9
                    }, this),
                    sublabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs text-slate-400 block truncate",
                        children: sublabel
                    }, void 0, false, {
                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                        lineNumber: 163,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                lineNumber: 160,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
        lineNumber: 153,
        columnNumber: 5
    }, this);
}
/* ------------------------------------------------------------------ */ /* Teams sub-screen (grouped by conference)                            */ /* ------------------------------------------------------------------ */ const LEVEL_LABELS = {
    ncaa_d1: "NCAA D1",
    ncaa_d2: "NCAA D2",
    ncaa_d3: "NCAA D3",
    naia: "NAIA",
    njcaa_d1: "NJCAA D1",
    njcaa_d2: "NJCAA D2",
    njcaa_d3: "NJCAA D3",
    cccaa: "CCCAA"
};
function TeamsScreen({ levelKey, selectedIds, onToggle, onToggleAll, onBack, onClose }) {
    const [teams, setTeams] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [expanded, setExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setLoading(true);
        const params = new URLSearchParams();
        if (levelKey) params.set("levelKey", levelKey);
        fetch(`/api/filters/teams?${params}`).then((r)=>r.json()).then((d)=>setTeams(d.teams)).finally(()=>setLoading(false));
    }, [
        levelKey
    ]);
    const filtered = teams.filter((t)=>t.name.toLowerCase().includes(search.toLowerCase()));
    const allVisible = filtered.map((t)=>t.id);
    const allChecked = allVisible.length > 0 && allVisible.every((id)=>selectedIds.includes(id));
    const toggleExpand = (key)=>setExpanded((prev)=>({
                ...prev,
                [key]: !prev[key]
            }));
    // Build grouped structure: Level → Conference → Teams
    function buildGroups(teamList) {
        // Group teams by levelKey first
        const byLevel = {};
        for (const t of teamList){
            (byLevel[t.levelKey] ??= []).push(t);
        }
        // For each level, group by conference
        const levelOrder = Object.keys(LEVEL_LABELS);
        const result = [];
        for (const lk of levelOrder){
            const lvlTeams = byLevel[lk];
            if (!lvlTeams || lvlTeams.length === 0) continue;
            const byConf = {};
            const noConf = [];
            for (const t of lvlTeams){
                if (t.conferenceId && t.conferenceName) {
                    (byConf[t.conferenceId] ??= []).push(t);
                } else {
                    noConf.push(t);
                }
            }
            const conferences = [];
            // Add conference groups sorted by name
            const confEntries = Object.entries(byConf).sort((a, b)=>{
                const nameA = a[1][0]?.conferenceName ?? "";
                const nameB = b[1][0]?.conferenceName ?? "";
                return nameA.localeCompare(nameB);
            });
            for (const [confId, confTeams] of confEntries){
                conferences.push({
                    id: confId,
                    name: confTeams[0].conferenceName ?? "Unknown",
                    teams: confTeams.sort((a, b)=>a.name.localeCompare(b.name))
                });
            }
            // Add unaffiliated teams as a single group
            if (noConf.length > 0) {
                conferences.push({
                    id: null,
                    name: "Independent",
                    teams: noConf.sort((a, b)=>a.name.localeCompare(b.name))
                });
            }
            result.push({
                levelKey: lk,
                label: LEVEL_LABELS[lk] ?? lk,
                conferences
            });
        }
        return result;
    }
    // When a specific level is selected, just show conference accordion
    // When "All" is selected, show level → conference two-level accordion
    const groups = buildGroups(filtered);
    const isSingleLevel = levelKey !== null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SubHeader, {
                title: "Teams",
                onBack: onBack,
                onClose: onClose
            }, void 0, false, {
                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                lineNumber: 306,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SearchInput, {
                value: search,
                onChange: setSearch,
                placeholder: "Search teams..."
            }, void 0, false, {
                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                lineNumber: 307,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto",
                children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-5 py-10 text-center text-sm text-slate-400",
                    children: "Loading..."
                }, void 0, false, {
                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                    lineNumber: 311,
                    columnNumber: 11
                }, this) : filtered.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-5 py-10 text-center text-sm text-slate-400",
                    children: teams.length === 0 ? "No teams available" : "No teams match your search"
                }, void 0, false, {
                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                    lineNumber: 313,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "flex items-center gap-3 px-5 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "checkbox",
                                    checked: allChecked,
                                    onChange: (e)=>onToggleAll(allVisible, e.target.checked),
                                    className: "w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 shrink-0"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                    lineNumber: 320,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sm font-semibold text-slate-900",
                                    children: [
                                        "Select All (",
                                        filtered.length,
                                        ")"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                    lineNumber: 326,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                            lineNumber: 319,
                            columnNumber: 13
                        }, this),
                        groups.map((lvlGroup)=>{
                            const hasConferences = lvlGroup.conferences.some((c)=>c.id !== null);
                            if (isSingleLevel && !hasConferences) {
                                // Single level with no conferences — flat list
                                return lvlGroup.conferences.map((confGroup)=>confGroup.teams.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CheckRow, {
                                            label: t.name,
                                            checked: selectedIds.includes(t.id),
                                            onChange: ()=>onToggle(t.id)
                                        }, t.id, false, {
                                            fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                            lineNumber: 338,
                                            columnNumber: 21
                                        }, this)));
                            }
                            if (isSingleLevel && hasConferences) {
                                // Single level with conferences — conference accordion
                                return lvlGroup.conferences.map((confGroup)=>{
                                    const confKey = `conf-${confGroup.id ?? "ind"}`;
                                    const confTeamIds = confGroup.teams.map((t)=>t.id);
                                    const confAllChecked = confTeamIds.length > 0 && confTeamIds.every((id)=>selectedIds.includes(id));
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>toggleExpand(confKey),
                                                className: "w-full flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100 text-left",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs font-bold text-slate-500 uppercase tracking-wider",
                                                        children: [
                                                            confGroup.name,
                                                            " (",
                                                            confGroup.teams.length,
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                        lineNumber: 360,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        className: `w-4 h-4 text-slate-400 transition-transform ${expanded[confKey] ? "rotate-180" : ""}`,
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        viewBox: "0 0 24 24",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            strokeLinecap: "round",
                                                            strokeLinejoin: "round",
                                                            strokeWidth: 2,
                                                            d: "M19 9l-7 7-7-7"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                            lineNumber: 369,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                        lineNumber: 363,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                lineNumber: 356,
                                                columnNumber: 23
                                            }, this),
                                            expanded[confKey] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "flex items-center gap-3 px-5 py-2.5 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "checkbox",
                                                                checked: confAllChecked,
                                                                onChange: (e)=>onToggleAll(confTeamIds, e.target.checked),
                                                                className: "w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 shrink-0"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                                lineNumber: 376,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs font-semibold text-slate-600",
                                                                children: [
                                                                    "Select All (",
                                                                    confGroup.teams.length,
                                                                    ")"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                                lineNumber: 382,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                        lineNumber: 375,
                                                        columnNumber: 27
                                                    }, this),
                                                    confGroup.teams.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CheckRow, {
                                                            label: t.name,
                                                            checked: selectedIds.includes(t.id),
                                                            onChange: ()=>onToggle(t.id)
                                                        }, t.id, false, {
                                                            fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                            lineNumber: 387,
                                                            columnNumber: 29
                                                        }, this))
                                                ]
                                            }, void 0, true)
                                        ]
                                    }, confKey, true, {
                                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                        lineNumber: 355,
                                        columnNumber: 21
                                    }, this);
                                });
                            }
                            // Multi-level view — level header → conference accordion
                            const lvlKey = `lvl-${lvlGroup.levelKey}`;
                            const lvlTeamIds = lvlGroup.conferences.flatMap((c)=>c.teams.map((t)=>t.id));
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>toggleExpand(lvlKey),
                                        className: "w-full flex items-center justify-between px-5 py-3 bg-slate-100 border-b border-slate-200 text-left",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-black text-slate-700 uppercase tracking-wider",
                                                children: [
                                                    lvlGroup.label,
                                                    " (",
                                                    lvlTeamIds.length,
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                lineNumber: 410,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: `w-4 h-4 text-slate-400 transition-transform ${expanded[lvlKey] ? "rotate-180" : ""}`,
                                                fill: "none",
                                                stroke: "currentColor",
                                                viewBox: "0 0 24 24",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    strokeWidth: 2,
                                                    d: "M19 9l-7 7-7-7"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                    lineNumber: 419,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                lineNumber: 413,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                        lineNumber: 406,
                                        columnNumber: 19
                                    }, this),
                                    expanded[lvlKey] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: hasConferences ? // Conference sub-accordions
                                        lvlGroup.conferences.map((confGroup)=>{
                                            const confKey = `${lvlKey}-conf-${confGroup.id ?? "ind"}`;
                                            const confTeamIds = confGroup.teams.map((t)=>t.id);
                                            const confAllChecked = confTeamIds.length > 0 && confTeamIds.every((id)=>selectedIds.includes(id));
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>toggleExpand(confKey),
                                                        className: "w-full flex items-center justify-between px-5 py-2.5 pl-8 bg-slate-50 border-b border-slate-100 text-left",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs font-bold text-slate-500 uppercase tracking-wider",
                                                                children: [
                                                                    confGroup.name,
                                                                    " (",
                                                                    confGroup.teams.length,
                                                                    ")"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                                lineNumber: 436,
                                                                columnNumber: 33
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                className: `w-3.5 h-3.5 text-slate-400 transition-transform ${expanded[confKey] ? "rotate-180" : ""}`,
                                                                fill: "none",
                                                                stroke: "currentColor",
                                                                viewBox: "0 0 24 24",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                    strokeLinecap: "round",
                                                                    strokeLinejoin: "round",
                                                                    strokeWidth: 2,
                                                                    d: "M19 9l-7 7-7-7"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                                    lineNumber: 445,
                                                                    columnNumber: 35
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                                lineNumber: 439,
                                                                columnNumber: 33
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                        lineNumber: 432,
                                                        columnNumber: 31
                                                    }, this),
                                                    expanded[confKey] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "flex items-center gap-3 px-5 pl-8 py-2 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "checkbox",
                                                                        checked: confAllChecked,
                                                                        onChange: (e)=>onToggleAll(confTeamIds, e.target.checked),
                                                                        className: "w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 shrink-0"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                                        lineNumber: 451,
                                                                        columnNumber: 37
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-xs font-semibold text-slate-600",
                                                                        children: [
                                                                            "Select All (",
                                                                            confGroup.teams.length,
                                                                            ")"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                                        lineNumber: 457,
                                                                        columnNumber: 37
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                                lineNumber: 450,
                                                                columnNumber: 35
                                                            }, this),
                                                            confGroup.teams.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CheckRow, {
                                                                    label: t.name,
                                                                    checked: selectedIds.includes(t.id),
                                                                    onChange: ()=>onToggle(t.id)
                                                                }, t.id, false, {
                                                                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                                    lineNumber: 462,
                                                                    columnNumber: 37
                                                                }, this))
                                                        ]
                                                    }, void 0, true)
                                                ]
                                            }, confKey, true, {
                                                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                lineNumber: 431,
                                                columnNumber: 29
                                            }, this);
                                        }) : // No conferences — flat team list under level
                                        lvlGroup.conferences.flatMap((confGroup)=>confGroup.teams.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CheckRow, {
                                                    label: t.name,
                                                    checked: selectedIds.includes(t.id),
                                                    onChange: ()=>onToggle(t.id)
                                                }, t.id, false, {
                                                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                    lineNumber: 478,
                                                    columnNumber: 29
                                                }, this)))
                                    }, void 0, false)
                                ]
                            }, lvlKey, true, {
                                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                lineNumber: 405,
                                columnNumber: 17
                            }, this);
                        })
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                lineNumber: 309,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
        lineNumber: 305,
        columnNumber: 5
    }, this);
}
/* ------------------------------------------------------------------ */ /* Position sub-screen                                                 */ /* ------------------------------------------------------------------ */ function PositionScreen({ selectedIds, onToggle, onToggleAll, onBack, onClose }) {
    const allChecked = POSITIONS.length > 0 && POSITIONS.every((p)=>selectedIds.includes(p));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SubHeader, {
                title: "Position",
                onBack: onBack,
                onClose: onClose
            }, void 0, false, {
                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                lineNumber: 520,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "flex items-center gap-3 px-5 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "checkbox",
                                checked: allChecked,
                                onChange: (e)=>onToggleAll(POSITIONS, e.target.checked),
                                className: "w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 shrink-0"
                            }, void 0, false, {
                                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                lineNumber: 524,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-semibold text-slate-900",
                                children: [
                                    "Select All (",
                                    POSITIONS.length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                lineNumber: 530,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                        lineNumber: 523,
                        columnNumber: 9
                    }, this),
                    POSITIONS.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CheckRow, {
                            label: p,
                            checked: selectedIds.includes(p),
                            onChange: ()=>onToggle(p)
                        }, p, false, {
                            fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                            lineNumber: 535,
                            columnNumber: 11
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                lineNumber: 521,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
        lineNumber: 519,
        columnNumber: 5
    }, this);
}
/* ------------------------------------------------------------------ */ /* Archetype sub-screen                                                */ /* ------------------------------------------------------------------ */ function ArchetypeScreen({ selectedIds, onToggle, onToggleAll, onBack, onClose }) {
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const filtered = ARCHETYPES.filter((a)=>a.toLowerCase().includes(search.toLowerCase()));
    const allChecked = filtered.length > 0 && filtered.every((a)=>selectedIds.includes(a));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SubHeader, {
                title: "Archetype",
                onBack: onBack,
                onClose: onClose
            }, void 0, false, {
                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                lineNumber: 574,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SearchInput, {
                value: search,
                onChange: setSearch,
                placeholder: "Search archetypes..."
            }, void 0, false, {
                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                lineNumber: 575,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto",
                children: filtered.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-5 py-10 text-center text-sm text-slate-400",
                    children: "No archetypes match your search"
                }, void 0, false, {
                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                    lineNumber: 578,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "flex items-center gap-3 px-5 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "checkbox",
                                    checked: allChecked,
                                    onChange: (e)=>onToggleAll(filtered, e.target.checked),
                                    className: "w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 shrink-0"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                    lineNumber: 584,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sm font-semibold text-slate-900",
                                    children: [
                                        "Select All (",
                                        filtered.length,
                                        ")"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                    lineNumber: 590,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                            lineNumber: 583,
                            columnNumber: 13
                        }, this),
                        filtered.map((a)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CheckRow, {
                                label: a,
                                checked: selectedIds.includes(a),
                                onChange: ()=>onToggle(a)
                            }, a, false, {
                                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                lineNumber: 595,
                                columnNumber: 15
                            }, this))
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                lineNumber: 576,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
        lineNumber: 573,
        columnNumber: 5
    }, this);
}
/* ------------------------------------------------------------------ */ /* Updates sub-screen (placeholder)                                    */ /* ------------------------------------------------------------------ */ function UpdatesScreen({ onBack, onClose }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SubHeader, {
                title: "Updates",
                onBack: onBack,
                onClose: onClose
            }, void 0, false, {
                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                lineNumber: 622,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-sm text-slate-400",
                    children: "Coming soon"
                }, void 0, false, {
                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                    lineNumber: 624,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                lineNumber: 623,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
        lineNumber: 621,
        columnNumber: 5
    }, this);
}
/* ------------------------------------------------------------------ */ /* Sort sub-screen                                                     */ /* ------------------------------------------------------------------ */ function RadioDot({ active }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? "border-slate-900" : "border-slate-300"}`,
        children: active && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "w-2.5 h-2.5 rounded-full bg-slate-900"
        }, void 0, false, {
            fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
            lineNumber: 641,
            columnNumber: 18
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
        lineNumber: 636,
        columnNumber: 5
    }, this);
}
function SortScreen({ sort, statView, traditionalMode, onSwitchView, onSwitchTraditionalMode, onSelectSort, onBack, onClose }) {
    const [expandedSections, setExpandedSections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const toggleSection = (key)=>setExpandedSections((prev)=>({
                ...prev,
                [key]: !prev[key]
            }));
    const handleSort = (key, defaultDir)=>{
        if (sort.key === key) {
            onSelectSort({
                key,
                direction: sort.direction === "desc" ? "asc" : "desc"
            });
        } else {
            onSelectSort({
                key,
                direction: defaultDir
            });
        }
    };
    const handleTraditionalSort = (categoryKey, sortKey, defaultDir)=>{
        if (statView !== "traditional") onSwitchView("traditional");
        if (traditionalMode !== categoryKey) {
            onSwitchTraditionalMode(categoryKey);
        }
        handleSort(sortKey, defaultDir);
    };
    const handleKanextSort = (key, defaultDir)=>{
        if (statView !== "kanext") onSwitchView("kanext");
        handleSort(key, defaultDir);
    };
    const traditionalExpanded = expandedSections["__traditional"] ?? false;
    const kanextExpanded = expandedSections["__kanext"] ?? false;
    // Check if any traditional sort is active
    const hasTraditionalSort = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$sort$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TRADITIONAL_CATEGORIES"].some((cat)=>cat.options.some((o)=>o.key === sort.key));
    // Check if any kanext sort is active
    const hasKanextSort = !hasTraditionalSort && (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$sort$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KANEXT_TOP_OPTIONS"].some((o)=>o.key === sort.key) || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$sort$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KANEXT_CLUSTERS"].some((c)=>c.key === sort.key || c.traits.some((t)=>t.key === sort.key)));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SubHeader, {
                title: "Sort By",
                onBack: onBack,
                onClose: onClose
            }, void 0, false, {
                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                lineNumber: 706,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>toggleSection("__traditional"),
                        className: "w-full flex items-center justify-between px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `text-sm font-semibold ${hasTraditionalSort ? "text-slate-900" : "text-slate-900"}`,
                                children: [
                                    "Traditional",
                                    hasTraditionalSort && statView === "traditional" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-2 text-xs font-normal text-slate-400",
                                        children: "Active"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                        lineNumber: 717,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                lineNumber: 714,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: `w-4 h-4 text-slate-400 transition-transform ${traditionalExpanded ? "rotate-180" : ""}`,
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 2,
                                    d: "M19 9l-7 7-7-7"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                    lineNumber: 726,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                lineNumber: 720,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                        lineNumber: 710,
                        columnNumber: 9
                    }, this),
                    traditionalExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$sort$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TRADITIONAL_CATEGORIES"].map((cat)=>{
                            const catExpanded = expandedSections[cat.key] ?? false;
                            const hasActiveSortInCategory = cat.options.some((o)=>o.key === sort.key);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>toggleSection(cat.key),
                                        className: "w-full flex items-center justify-between pl-10 pr-5 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `text-sm ${hasActiveSortInCategory ? "font-bold text-slate-900" : "font-medium text-slate-700"}`,
                                                children: [
                                                    cat.label,
                                                    hasActiveSortInCategory && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "ml-2 text-xs text-slate-400",
                                                        children: cat.options.find((o)=>o.key === sort.key)?.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                        lineNumber: 744,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                lineNumber: 741,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: `w-4 h-4 text-slate-400 transition-transform ${catExpanded ? "rotate-180" : ""}`,
                                                fill: "none",
                                                stroke: "currentColor",
                                                viewBox: "0 0 24 24",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    strokeWidth: 2,
                                                    d: "M19 9l-7 7-7-7"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                    lineNumber: 755,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                lineNumber: 749,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                        lineNumber: 737,
                                        columnNumber: 19
                                    }, this),
                                    catExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-slate-50 border-b border-slate-100",
                                        children: cat.options.map((opt)=>{
                                            const active = sort.key === opt.key;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleTraditionalSort(cat.key, opt.key, opt.defaultDirection),
                                                className: "w-full flex items-center gap-3 pl-16 pr-5 py-2.5 hover:bg-slate-100 transition-colors text-left",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(RadioDot, {
                                                        active: active
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                        lineNumber: 769,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `text-sm ${active ? "font-bold text-slate-900" : "text-slate-600"}`,
                                                        children: [
                                                            opt.label,
                                                            active && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "ml-1 text-slate-400",
                                                                children: sort.direction === "desc" ? "\u2193" : "\u2191"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                                lineNumber: 773,
                                                                columnNumber: 33
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                        lineNumber: 770,
                                                        columnNumber: 29
                                                    }, this)
                                                ]
                                            }, opt.key, true, {
                                                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                lineNumber: 764,
                                                columnNumber: 27
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                        lineNumber: 760,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, cat.key, true, {
                                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                lineNumber: 736,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                        lineNumber: 731,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>toggleSection("__kanext"),
                        className: "w-full flex items-center justify-between px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-semibold text-slate-900",
                                children: [
                                    "KaNeXT",
                                    hasKanextSort && statView === "kanext" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-2 text-xs font-normal text-slate-400",
                                        children: "Active"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                        lineNumber: 797,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                lineNumber: 794,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: `w-4 h-4 text-slate-400 transition-transform ${kanextExpanded ? "rotate-180" : ""}`,
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 2,
                                    d: "M19 9l-7 7-7-7"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                    lineNumber: 806,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                lineNumber: 800,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                        lineNumber: 790,
                        columnNumber: 9
                    }, this),
                    kanextExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$sort$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KANEXT_TOP_OPTIONS"].map((opt)=>{
                                const active = sort.key === opt.key;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>handleKanextSort(opt.key, opt.defaultDirection),
                                    className: "w-full flex items-center gap-3 pl-10 pr-5 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(RadioDot, {
                                            active: active
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                            lineNumber: 821,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `text-sm ${active ? "font-bold text-slate-900" : "text-slate-700"}`,
                                            children: [
                                                opt.label,
                                                active && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "ml-1 text-slate-400",
                                                    children: sort.direction === "desc" ? "\u2193" : "\u2191"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                    lineNumber: 825,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                            lineNumber: 822,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, opt.key, true, {
                                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                    lineNumber: 816,
                                    columnNumber: 17
                                }, this);
                            }),
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$sort$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KANEXT_CLUSTERS"].map((cluster)=>{
                                const active = sort.key === cluster.key;
                                const clusterExpanded = expandedSections[cluster.key] ?? false;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center border-b border-slate-100",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleKanextSort(cluster.key, cluster.defaultDirection),
                                                    className: "flex-1 flex items-center gap-3 pl-10 pr-5 py-3 hover:bg-slate-50 transition-colors text-left",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(RadioDot, {
                                                            active: active
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                            lineNumber: 845,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `text-sm ${active ? "font-bold text-slate-900" : "text-slate-700"}`,
                                                            children: [
                                                                cluster.label,
                                                                active && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "ml-1 text-slate-400",
                                                                    children: sort.direction === "desc" ? "\u2193" : "\u2191"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                                    lineNumber: 849,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                            lineNumber: 846,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                    lineNumber: 841,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>toggleSection(cluster.key),
                                                    className: "px-4 py-3 hover:bg-slate-50 transition-colors",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        className: `w-4 h-4 text-slate-400 transition-transform ${clusterExpanded ? "rotate-180" : ""}`,
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        viewBox: "0 0 24 24",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            strokeLinecap: "round",
                                                            strokeLinejoin: "round",
                                                            strokeWidth: 2,
                                                            d: "M19 9l-7 7-7-7"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                            lineNumber: 865,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                        lineNumber: 859,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                    lineNumber: 855,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                            lineNumber: 840,
                                            columnNumber: 19
                                        }, this),
                                        clusterExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-slate-50 border-b border-slate-100",
                                            children: cluster.traits.map((trait)=>{
                                                const traitActive = sort.key === trait.key;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleKanextSort(trait.key, "desc"),
                                                    className: "w-full flex items-center gap-3 pl-20 pr-5 py-2.5 hover:bg-slate-100 transition-colors text-left",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(RadioDot, {
                                                            active: traitActive
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                            lineNumber: 880,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `text-xs ${traitActive ? "font-bold text-slate-900" : "text-slate-500"}`,
                                                            children: [
                                                                trait.label,
                                                                traitActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "ml-1 text-slate-400",
                                                                    children: sort.direction === "desc" ? "\u2193" : "\u2191"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                                    lineNumber: 884,
                                                                    columnNumber: 33
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                            lineNumber: 881,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, trait.key, true, {
                                                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                                    lineNumber: 875,
                                                    columnNumber: 27
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                            lineNumber: 871,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, cluster.key, true, {
                                    fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                                    lineNumber: 839,
                                    columnNumber: 17
                                }, this);
                            })
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                        lineNumber: 811,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                lineNumber: 708,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
        lineNumber: 705,
        columnNumber: 5
    }, this);
}
function FilterDrawer({ open, onClose, appliedFilters, onApply, statView, onSwitchView, traditionalMode, onSwitchTraditionalMode }) {
    const [draft, setDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        ...EMPTY_FILTERS,
        sort: appliedFilters.sort
    });
    const [screen, setScreen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("main");
    const [levels, setLevels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const panelRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Fetch levels once
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetch("/api/filters/levels").then((r)=>r.json()).then((d)=>setLevels(d.levels));
    }, []);
    // Reset draft & screen when drawer opens
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (open) {
            setDraft({
                ...appliedFilters
            });
            setScreen("main");
        }
    }, [
        open,
        appliedFilters
    ]);
    // Lock body scroll when open
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (open) {
            document.body.style.overflow = "hidden";
            return ()=>{
                document.body.style.overflow = "";
            };
        }
    }, [
        open
    ]);
    // Escape key closes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!open) return;
        const handler = (e)=>{
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return ()=>window.removeEventListener("keydown", handler);
    }, [
        open,
        onClose
    ]);
    /* Draft mutators */ const selectLevel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((levelKey)=>{
        setDraft((prev)=>({
                ...prev,
                levelKey,
                teamIds: []
            }));
    }, []);
    const toggleTeam = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>{
        setDraft((prev)=>({
                ...prev,
                teamIds: prev.teamIds.includes(id) ? prev.teamIds.filter((t)=>t !== id) : [
                    ...prev.teamIds,
                    id
                ]
            }));
    }, []);
    const toggleAllTeams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((ids, checked)=>{
        setDraft((prev)=>{
            if (checked) {
                const merged = new Set([
                    ...prev.teamIds,
                    ...ids
                ]);
                return {
                    ...prev,
                    teamIds: Array.from(merged)
                };
            } else {
                const remove = new Set(ids);
                return {
                    ...prev,
                    teamIds: prev.teamIds.filter((t)=>!remove.has(t))
                };
            }
        });
    }, []);
    const togglePosition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>{
        setDraft((prev)=>({
                ...prev,
                positions: prev.positions.includes(id) ? prev.positions.filter((p)=>p !== id) : [
                    ...prev.positions,
                    id
                ]
            }));
    }, []);
    const toggleAllPositions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((ids, checked)=>{
        setDraft((prev)=>{
            if (checked) {
                const merged = new Set([
                    ...prev.positions,
                    ...ids
                ]);
                return {
                    ...prev,
                    positions: Array.from(merged)
                };
            } else {
                const remove = new Set(ids);
                return {
                    ...prev,
                    positions: prev.positions.filter((p)=>!remove.has(p))
                };
            }
        });
    }, []);
    const toggleArchetype = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>{
        setDraft((prev)=>({
                ...prev,
                archetypes: prev.archetypes.includes(id) ? prev.archetypes.filter((a)=>a !== id) : [
                    ...prev.archetypes,
                    id
                ]
            }));
    }, []);
    const toggleAllArchetypes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((ids, checked)=>{
        setDraft((prev)=>{
            if (checked) {
                const merged = new Set([
                    ...prev.archetypes,
                    ...ids
                ]);
                return {
                    ...prev,
                    archetypes: Array.from(merged)
                };
            } else {
                const remove = new Set(ids);
                return {
                    ...prev,
                    archetypes: prev.archetypes.filter((a)=>!remove.has(a))
                };
            }
        });
    }, []);
    const selectSort = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((sort)=>{
        setDraft((prev)=>({
                ...prev,
                sort
            }));
    }, []);
    const resetDraft = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const defaultSort = statView === "traditional" ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$sort$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_TRADITIONAL_SORT"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$sort$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_KANEXT_SORT"];
        setDraft({
            ...EMPTY_FILTERS,
            sort: defaultSort
        });
    }, [
        statView
    ]);
    const applyAndClose = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        onApply(draft);
        onClose();
    }, [
        draft,
        onApply,
        onClose
    ]);
    /* Render */ return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`,
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                lineNumber: 1041,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: panelRef,
                className: `fixed inset-y-0 left-0 w-full sm:w-[420px] bg-white shadow-2xl z-50 transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`,
                children: [
                    screen === "main" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$drawer$2d$main$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        levelKey: draft.levelKey,
                        teamIds: draft.teamIds,
                        positions: draft.positions,
                        archetypes: draft.archetypes,
                        sort: draft.sort,
                        statView: statView,
                        levels: levels,
                        onNavigate: setScreen,
                        onReset: resetDraft,
                        onApply: applyAndClose,
                        onClose: onClose
                    }, void 0, false, {
                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                        lineNumber: 1056,
                        columnNumber: 11
                    }, this),
                    screen === "level" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$drawer$2d$level$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        levels: levels,
                        selected: draft.levelKey,
                        onSelect: (k)=>{
                            selectLevel(k);
                            setScreen("main");
                        },
                        onBack: ()=>setScreen("main"),
                        onClose: onClose
                    }, void 0, false, {
                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                        lineNumber: 1072,
                        columnNumber: 11
                    }, this),
                    screen === "teams" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TeamsScreen, {
                        levelKey: draft.levelKey,
                        selectedIds: draft.teamIds,
                        onToggle: toggleTeam,
                        onToggleAll: toggleAllTeams,
                        onBack: ()=>setScreen("main"),
                        onClose: onClose
                    }, void 0, false, {
                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                        lineNumber: 1085,
                        columnNumber: 11
                    }, this),
                    screen === "position" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PositionScreen, {
                        selectedIds: draft.positions,
                        onToggle: togglePosition,
                        onToggleAll: toggleAllPositions,
                        onBack: ()=>setScreen("main"),
                        onClose: onClose
                    }, void 0, false, {
                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                        lineNumber: 1096,
                        columnNumber: 11
                    }, this),
                    screen === "archetype" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ArchetypeScreen, {
                        selectedIds: draft.archetypes,
                        onToggle: toggleArchetype,
                        onToggleAll: toggleAllArchetypes,
                        onBack: ()=>setScreen("main"),
                        onClose: onClose
                    }, void 0, false, {
                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                        lineNumber: 1106,
                        columnNumber: 11
                    }, this),
                    screen === "sort" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SortScreen, {
                        sort: draft.sort,
                        statView: statView,
                        traditionalMode: traditionalMode,
                        onSwitchView: (view)=>{
                            const defaultSort = view === "traditional" ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$sort$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_TRADITIONAL_SORT"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$sort$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_KANEXT_SORT"];
                            selectSort(defaultSort);
                            onSwitchView(view);
                        },
                        onSwitchTraditionalMode: onSwitchTraditionalMode,
                        onSelectSort: selectSort,
                        onBack: ()=>setScreen("main"),
                        onClose: onClose
                    }, void 0, false, {
                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                        lineNumber: 1116,
                        columnNumber: 11
                    }, this),
                    screen === "updates" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(UpdatesScreen, {
                        onBack: ()=>setScreen("main"),
                        onClose: onClose
                    }, void 0, false, {
                        fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                        lineNumber: 1133,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/filter-drawer/filter-drawer.tsx",
                lineNumber: 1049,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/src/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$filter$2d$drawer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/components/filter-drawer/filter-drawer.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$sort$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/filter-drawer/sort-options.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
/* ------------------------------------------------------------------ */ /* Derived stat computation                                            */ /* ------------------------------------------------------------------ */ function safeDiv(num, den) {
    return den === 0 ? null : num / den;
}
function computeDerived(p) {
    const fgPct = safeDiv(p.fgm, p.fga);
    const threePct = safeDiv(p.threePm, p.threePa);
    const ftPct = safeDiv(p.ftm, p.fta);
    const efgPct = safeDiv(p.fgm + 0.5 * p.threePm, p.fga);
    const tsPct = safeDiv(p.pts, 2 * (p.fga + 0.44 * p.fta));
    const tovPct = safeDiv(p.tov, p.fga + 0.44 * p.fta + p.tov);
    // Shooting additions
    const twoPm = p.fgm - p.threePm;
    const twoPa = p.fga - p.threePa;
    const twoPct = safeDiv(twoPm, twoPa);
    const threeParRate = safeDiv(p.threePa, p.fga);
    // USG% (requires team data)
    let usgPct = null;
    if (p.teamMin && p.teamFga != null && p.teamFta != null && p.teamTov != null && p.min > 0) {
        const playerPoss = p.fga + 0.44 * p.fta + p.tov;
        const teamPoss = p.teamFga + 0.44 * p.teamFta + p.teamTov;
        if (teamPoss > 0) {
            usgPct = 100 * (playerPoss * (p.teamMin / 5)) / (p.min * teamPoss);
        }
    }
    const per40 = (x)=>p.min === 0 ? null : x / p.min * 40;
    // Advanced stats (require team + opponent data)
    const tmMin5 = p.teamMin ? p.teamMin / 5 : null;
    let astPct = null;
    if (tmMin5 && p.teamFgm != null && p.min > 0) {
        const tmFgWhileOn = p.min / tmMin5 * p.teamFgm;
        const denom = tmFgWhileOn - p.fgm;
        if (denom > 0) astPct = 100 * p.ast / denom;
    }
    let stlPct = null;
    if (tmMin5 && p.oppPoss != null && p.min > 0 && p.oppPoss > 0) {
        stlPct = 100 * (p.stl * tmMin5) / (p.min * p.oppPoss);
    }
    let blkPct = null;
    if (tmMin5 && p.oppFga != null && p.min > 0 && p.oppFga > 0) {
        blkPct = 100 * (p.blk * tmMin5) / (p.min * p.oppFga);
    }
    let rebPct = null;
    if (tmMin5 && p.teamTrb != null && p.oppTrb != null && p.min > 0) {
        const totalReb = p.teamTrb + p.oppTrb;
        if (totalReb > 0) rebPct = 100 * (p.trb * tmMin5) / (p.min * totalReb);
    }
    // PER — requires league averages, null until connected
    const per = null;
    // Scoring breakdown
    const pct2pt = p.pts > 0 ? twoPm * 2 / p.pts * 100 : null;
    const pct3pt = p.pts > 0 ? p.threePm * 3 / p.pts * 100 : null;
    const pctFt = p.pts > 0 ? p.ftm / p.pts * 100 : null;
    const ftRate = safeDiv(p.fta, p.fga);
    const ptsFga = safeDiv(p.pts, p.fga);
    const indivPoss = p.fga + 0.44 * p.fta + p.tov;
    const ppp = indivPoss > 0 ? p.pts / indivPoss : null;
    return {
        // Per-game
        mpg: safeDiv(p.min, p.gp),
        ppg: safeDiv(p.pts, p.gp),
        rpg: safeDiv(p.trb, p.gp),
        apg: safeDiv(p.ast, p.gp),
        spg: safeDiv(p.stl, p.gp),
        bpg: safeDiv(p.blk, p.gp),
        topg: safeDiv(p.tov, p.gp),
        // Totals
        gp: p.gp,
        gs: p.gs,
        totalMin: p.min,
        totalPts: p.pts,
        totalTrb: p.trb,
        totalAst: p.ast,
        totalFgm: p.fgm,
        // Shooting
        fgPct: fgPct != null ? fgPct * 100 : null,
        threePct: threePct != null ? threePct * 100 : null,
        ftPct: ftPct != null ? ftPct * 100 : null,
        tsPct: tsPct != null ? tsPct * 100 : null,
        efgPct: efgPct != null ? efgPct * 100 : null,
        twoPct: twoPct != null ? twoPct * 100 : null,
        threeParRate: threeParRate != null ? threeParRate * 100 : null,
        // Advanced
        astPct,
        usgPct,
        tovPct: tovPct != null ? tovPct * 100 : null,
        stlPct,
        blkPct,
        rebPct,
        per,
        // Scoring
        pct2pt,
        pct3pt,
        pctFt,
        ftRate: ftRate != null ? ftRate * 100 : null,
        ptsFga,
        ppp,
        // Per-40
        pts40: per40(p.pts),
        reb40: per40(p.trb),
        ast40: per40(p.ast),
        stl40: per40(p.stl),
        blk40: per40(p.blk),
        to40: per40(p.tov)
    };
}
const PER_GAME_CHIPS = [
    {
        key: "mpg",
        label: "MPG",
        decimals: 1,
        sortKey: "mpg",
        defaultDir: "desc"
    },
    {
        key: "ppg",
        label: "PPG",
        decimals: 1,
        sortKey: "ppg",
        defaultDir: "desc"
    },
    {
        key: "rpg",
        label: "RPG",
        decimals: 1,
        sortKey: "rpg",
        defaultDir: "desc"
    },
    {
        key: "apg",
        label: "APG",
        decimals: 1,
        sortKey: "apg",
        defaultDir: "desc"
    },
    {
        key: "spg",
        label: "SPG",
        decimals: 1,
        sortKey: "spg",
        defaultDir: "desc"
    },
    {
        key: "bpg",
        label: "BPG",
        decimals: 1,
        sortKey: "bpg",
        defaultDir: "desc"
    },
    {
        key: "topg",
        label: "TOPG",
        decimals: 1,
        sortKey: "topg",
        defaultDir: "asc"
    }
];
const TOTALS_CHIPS = [
    {
        key: "gp",
        label: "GP",
        decimals: 0,
        sortKey: "gp",
        defaultDir: "desc"
    },
    {
        key: "gs",
        label: "GS",
        decimals: 0,
        sortKey: "gs",
        defaultDir: "desc"
    },
    {
        key: "totalMin",
        label: "MIN",
        decimals: 0,
        sortKey: "total_min",
        defaultDir: "desc"
    },
    {
        key: "totalPts",
        label: "PTS",
        decimals: 0,
        sortKey: "total_pts",
        defaultDir: "desc"
    },
    {
        key: "totalTrb",
        label: "TRB",
        decimals: 0,
        sortKey: "total_trb",
        defaultDir: "desc"
    },
    {
        key: "totalAst",
        label: "AST",
        decimals: 0,
        sortKey: "total_ast",
        defaultDir: "desc"
    },
    {
        key: "totalFgm",
        label: "FGM",
        decimals: 0,
        sortKey: "total_fgm",
        defaultDir: "desc"
    }
];
const SHOOTING_CHIPS = [
    {
        key: "fgPct",
        label: "FG%",
        decimals: 1,
        suffix: "%",
        sortKey: "fg_pct",
        defaultDir: "desc"
    },
    {
        key: "threePct",
        label: "3P%",
        decimals: 1,
        suffix: "%",
        sortKey: "three_pct",
        defaultDir: "desc"
    },
    {
        key: "ftPct",
        label: "FT%",
        decimals: 1,
        suffix: "%",
        sortKey: "ft_pct",
        defaultDir: "desc"
    },
    {
        key: "tsPct",
        label: "TS%",
        decimals: 1,
        suffix: "%",
        sortKey: "ts_pct",
        defaultDir: "desc"
    },
    {
        key: "efgPct",
        label: "eFG%",
        decimals: 1,
        suffix: "%",
        sortKey: "efg_pct",
        defaultDir: "desc"
    },
    {
        key: "twoPct",
        label: "2P%",
        decimals: 1,
        suffix: "%",
        sortKey: "two_pct",
        defaultDir: "desc"
    },
    {
        key: "threeParRate",
        label: "3PAr",
        decimals: 1,
        suffix: "%",
        sortKey: "three_par",
        defaultDir: "desc"
    }
];
const ADVANCED_CHIPS = [
    {
        key: "astPct",
        label: "AST%",
        decimals: 1,
        suffix: "%",
        sortKey: "ast_pct",
        defaultDir: "desc"
    },
    {
        key: "usgPct",
        label: "USG%",
        decimals: 1,
        suffix: "%",
        sortKey: "usg_pct",
        defaultDir: "desc"
    },
    {
        key: "tovPct",
        label: "TOV%",
        decimals: 1,
        suffix: "%",
        sortKey: "tov_pct",
        defaultDir: "asc"
    },
    {
        key: "stlPct",
        label: "STL%",
        decimals: 1,
        suffix: "%",
        sortKey: "stl_pct",
        defaultDir: "desc"
    },
    {
        key: "blkPct",
        label: "BLK%",
        decimals: 1,
        suffix: "%",
        sortKey: "blk_pct",
        defaultDir: "desc"
    },
    {
        key: "rebPct",
        label: "REB%",
        decimals: 1,
        suffix: "%",
        sortKey: "reb_pct",
        defaultDir: "desc"
    },
    {
        key: "per",
        label: "PER",
        decimals: 1,
        sortKey: "per",
        defaultDir: "desc"
    }
];
const SCORING_CHIPS = [
    {
        key: "pct2pt",
        label: "%2PT",
        decimals: 1,
        suffix: "%",
        sortKey: "pct_2pt",
        defaultDir: "desc"
    },
    {
        key: "pct3pt",
        label: "%3PT",
        decimals: 1,
        suffix: "%",
        sortKey: "pct_3pt",
        defaultDir: "desc"
    },
    {
        key: "pctFt",
        label: "%FT",
        decimals: 1,
        suffix: "%",
        sortKey: "pct_ft",
        defaultDir: "desc"
    },
    {
        key: "ftRate",
        label: "FTr",
        decimals: 1,
        suffix: "%",
        sortKey: "ft_rate",
        defaultDir: "desc"
    },
    {
        key: "ptsFga",
        label: "PTS/FGA",
        decimals: 2,
        sortKey: "pts_fga",
        defaultDir: "desc"
    },
    {
        key: "ppp",
        label: "PPP",
        decimals: 2,
        sortKey: "ppp",
        defaultDir: "desc"
    }
];
const PER40_CHIPS = [
    {
        key: "pts40",
        label: "PTS/40",
        decimals: 1,
        sortKey: "pts_40",
        defaultDir: "desc"
    },
    {
        key: "reb40",
        label: "REB/40",
        decimals: 1,
        sortKey: "reb_40",
        defaultDir: "desc"
    },
    {
        key: "ast40",
        label: "AST/40",
        decimals: 1,
        sortKey: "ast_40",
        defaultDir: "desc"
    },
    {
        key: "stl40",
        label: "STL/40",
        decimals: 1,
        sortKey: "stl_40",
        defaultDir: "desc"
    },
    {
        key: "blk40",
        label: "BLK/40",
        decimals: 1,
        sortKey: "blk_40",
        defaultDir: "desc"
    },
    {
        key: "to40",
        label: "TO/40",
        decimals: 1,
        sortKey: "to_40",
        defaultDir: "asc"
    }
];
// KaNeXT view: show per-game stats until KR engine is re-run
const KANEXT_CHIPS = [
    {
        key: "ppg",
        label: "PPG",
        decimals: 1,
        isPrimary: true,
        sortKey: "ppg",
        defaultDir: "desc"
    },
    {
        key: "rpg",
        label: "RPG",
        decimals: 1,
        sortKey: "rpg",
        defaultDir: "desc"
    },
    {
        key: "apg",
        label: "APG",
        decimals: 1,
        sortKey: "apg",
        defaultDir: "desc"
    },
    {
        key: "spg",
        label: "SPG",
        decimals: 1,
        sortKey: "spg",
        defaultDir: "desc"
    },
    {
        key: "bpg",
        label: "BPG",
        decimals: 1,
        sortKey: "bpg",
        defaultDir: "desc"
    },
    {
        key: "fgPct",
        label: "FG%",
        decimals: 1,
        suffix: "%",
        sortKey: "fg_pct",
        defaultDir: "desc"
    },
    {
        key: "threePct",
        label: "3P%",
        decimals: 1,
        suffix: "%",
        sortKey: "three_pct",
        defaultDir: "desc"
    }
];
/* ------------------------------------------------------------------ */ /* Format helpers                                                      */ /* ------------------------------------------------------------------ */ function fmtDerived(val, decimals, suffix) {
    if (val == null) return "\u2014";
    return `${val.toFixed(decimals)}${suffix ?? ""}`;
}
/* ------------------------------------------------------------------ */ /* API fetch helper                                                    */ /* ------------------------------------------------------------------ */ const PAGE_SIZE = 50;
function buildApiUrl(search, filters, limit, offset) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filters.levelKey) params.set("levelKey", filters.levelKey);
    if (filters.teamIds.length > 0) params.set("teamIds", filters.teamIds.join(","));
    if (filters.positions.length > 0) params.set("positions", filters.positions.join(","));
    params.set("sort", filters.sort.key);
    params.set("dir", filters.sort.direction);
    params.set("limit", String(limit));
    params.set("offset", String(offset));
    return `/api/players?${params}`;
}
/* ------------------------------------------------------------------ */ /* Component                                                           */ /* ------------------------------------------------------------------ */ const DEFAULT_FILTERS = {
    levelKey: null,
    teamIds: [],
    positions: [],
    archetypes: [],
    sort: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$sort$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_KANEXT_SORT"]
};
function Home() {
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [debouncedSearch, setDebouncedSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [drawerOpen, setDrawerOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [appliedFilters, setAppliedFilters] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        ...DEFAULT_FILTERS
    });
    const [statView, setStatView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("kanext");
    const [traditionalMode, setTraditionalMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("per_game");
    const [players, setPlayers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [total, setTotal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [loadingMore, setLoadingMore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const fetchRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    // Debounce search input (300ms)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const timer = setTimeout(()=>setDebouncedSearch(search), 300);
        return ()=>clearTimeout(timer);
    }, [
        search
    ]);
    // Fetch players when filters/search change (reset to page 1)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const id = ++fetchRef.current;
        setLoading(true);
        fetch(buildApiUrl(debouncedSearch, appliedFilters, PAGE_SIZE, 0)).then((r)=>r.json()).then((data)=>{
            if (id !== fetchRef.current) return; // stale
            setPlayers(data.players);
            setTotal(data.total);
        }).finally(()=>{
            if (id === fetchRef.current) setLoading(false);
        });
    }, [
        debouncedSearch,
        appliedFilters
    ]);
    // Load more
    const loadMore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setLoadingMore(true);
        const id = ++fetchRef.current;
        fetch(buildApiUrl(debouncedSearch, appliedFilters, PAGE_SIZE, players.length)).then((r)=>r.json()).then((data)=>{
            if (id !== fetchRef.current) return;
            setPlayers((prev)=>[
                    ...prev,
                    ...data.players
                ]);
            setTotal(data.total);
        }).finally(()=>{
            if (id === fetchRef.current) setLoadingMore(false);
        });
    }, [
        debouncedSearch,
        appliedFilters,
        players.length
    ]);
    const hasActiveFilters = appliedFilters.levelKey !== null || appliedFilters.teamIds.length > 0 || appliedFilters.positions.length > 0 || appliedFilters.archetypes.length > 0;
    const switchView = (view)=>{
        setStatView(view);
        const defaultSort = view === "traditional" ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$sort$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_TRADITIONAL_SORT"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$sort$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_KANEXT_SORT"];
        setAppliedFilters((prev)=>({
                ...prev,
                sort: defaultSort
            }));
    };
    const resetFilters = ()=>{
        setSearch("");
        setDebouncedSearch("");
        const defaultSort = statView === "traditional" ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$sort$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_TRADITIONAL_SORT"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$sort$2d$options$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_KANEXT_SORT"];
        setAppliedFilters({
            ...DEFAULT_FILTERS,
            sort: defaultSort
        });
    };
    const handleChipSort = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((chip)=>{
        setAppliedFilters((prev)=>{
            if (prev.sort.key === chip.sortKey) {
                // Toggle direction
                return {
                    ...prev,
                    sort: {
                        key: chip.sortKey,
                        direction: prev.sort.direction === "desc" ? "asc" : "desc"
                    }
                };
            }
            return {
                ...prev,
                sort: {
                    key: chip.sortKey,
                    direction: chip.defaultDir
                }
            };
        });
    }, []);
    const tradChipMap = {
        per_game: PER_GAME_CHIPS,
        totals: TOTALS_CHIPS,
        shooting: SHOOTING_CHIPS,
        advanced: ADVANCED_CHIPS,
        scoring: SCORING_CHIPS,
        per40: PER40_CHIPS
    };
    const tradChips = tradChipMap[traditionalMode];
    const hasMore = players.length < total;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-[#0a0a0a] text-white",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-[900px] mx-auto px-4 pt-12 pb-10 flex flex-col items-center text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-4xl sm:text-5xl font-black tracking-tight mb-2",
                            children: "KANEXT"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 427,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-lg sm:text-xl font-bold tracking-widest text-white/70 mb-8",
                            children: "PLAYER POOL"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 430,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-2xl sm:text-3xl font-black uppercase tracking-wide mb-3",
                            children: "Men's Basketball Ratings"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 434,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-white/60 text-base mb-8 max-w-lg",
                            children: "Check out every player rating in the KaNeXT Player Pool."
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 437,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative w-full max-w-md",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    value: search,
                                    onChange: (e)=>setSearch(e.target.value),
                                    placeholder: "Search Player",
                                    className: "w-full h-12 pl-4 pr-12 text-base bg-white/10 border border-white/20 rounded-full text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 442,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40",
                                    fill: "none",
                                    stroke: "currentColor",
                                    viewBox: "0 0 24 24",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        strokeWidth: 2,
                                        d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 455,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 449,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 441,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 426,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 425,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-b border-slate-200 bg-white",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "max-w-[900px] mx-auto px-4 py-3 flex items-center gap-4 flex-wrap",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setDrawerOpen(true),
                                className: `flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider rounded transition-colors ${hasActiveFilters ? "bg-slate-900 text-white ring-2 ring-slate-400 ring-offset-1" : "bg-slate-900 text-white hover:bg-slate-800"}`,
                                children: [
                                    "Filter",
                                    hasActiveFilters && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "w-2 h-2 rounded-full bg-white"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 480,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-4 h-4",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 488,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 482,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 470,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm text-slate-500",
                                children: [
                                    "Showing",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-semibold text-slate-900",
                                        children: players.length.toLocaleString()
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 500,
                                        columnNumber: 13
                                    }, this),
                                    " ",
                                    "of",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-semibold text-slate-900",
                                        children: total.toLocaleString()
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 504,
                                        columnNumber: 13
                                    }, this),
                                    " ",
                                    total === 1 ? "result" : "results"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 498,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: resetFilters,
                                className: "text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors",
                                children: "Reset all"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 511,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 468,
                        columnNumber: 9
                    }, this),
                    hasActiveFilters && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "max-w-[900px] mx-auto px-4 pb-3 flex flex-wrap gap-2",
                        children: [
                            appliedFilters.levelKey && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "px-2.5 py-1 bg-slate-100 text-xs font-semibold text-slate-700 rounded-full",
                                children: appliedFilters.levelKey.replace("_", " ").toUpperCase()
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 523,
                                columnNumber: 15
                            }, this),
                            appliedFilters.teamIds.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "px-2.5 py-1 bg-slate-100 text-xs font-semibold text-slate-700 rounded-full",
                                children: [
                                    appliedFilters.teamIds.length,
                                    " team",
                                    appliedFilters.teamIds.length !== 1 ? "s" : ""
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 528,
                                columnNumber: 15
                            }, this),
                            appliedFilters.positions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "px-2.5 py-1 bg-slate-100 text-xs font-semibold text-slate-700 rounded-full",
                                children: appliedFilters.positions.join(", ")
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 533,
                                columnNumber: 15
                            }, this),
                            appliedFilters.archetypes.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "px-2.5 py-1 bg-slate-100 text-xs font-semibold text-slate-700 rounded-full",
                                children: [
                                    appliedFilters.archetypes.length,
                                    " archetype",
                                    appliedFilters.archetypes.length !== 1 ? "s" : ""
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 538,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 521,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 467,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-[900px] mx-auto px-4 py-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs font-black text-slate-900 uppercase tracking-widest mb-4 border-b-2 border-slate-900 pb-2 inline-block",
                        children: "Player"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 549,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3",
                        children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white border border-slate-200 rounded-lg px-6 py-12 text-center text-slate-400",
                            children: "Loading players..."
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 556,
                            columnNumber: 13
                        }, this) : players.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white border border-slate-200 rounded-lg px-6 py-12 text-center text-slate-400",
                            children: "No players match the current filters."
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 560,
                            columnNumber: 13
                        }, this) : players.map((player)=>{
                            const derived = computeDerived(player);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-4 px-5 py-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                href: `/players/${player.id}`,
                                                className: "flex items-center gap-4 flex-1 min-w-0 hover:opacity-80 transition-opacity",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center shrink-0 overflow-hidden",
                                                        children: player.teamSlug?.startsWith("espn-") ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                    src: `https://a.espncdn.com/i/teamlogos/ncaa/500/${player.teamSlug.replace("espn-", "")}.png`,
                                                                    alt: player.teamAbbr,
                                                                    className: "w-8 h-8 object-contain",
                                                                    onError: (e)=>{
                                                                        const img = e.target;
                                                                        img.style.display = "none";
                                                                        const fallback = img.nextElementSibling;
                                                                        if (fallback) fallback.style.display = "";
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 577,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-xs font-black text-white tracking-tight",
                                                                    style: {
                                                                        display: "none"
                                                                    },
                                                                    children: player.teamAbbr.substring(0, 3)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 588,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-xs font-black text-white tracking-tight",
                                                            children: player.teamAbbr.substring(0, 3)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/page.tsx",
                                                            lineNumber: 593,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 574,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-bold text-[15px] text-slate-900 truncate",
                                                        children: player.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 598,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 573,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 shrink-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "hidden sm:inline px-2 py-0.5 rounded bg-slate-100 text-[11px] font-bold text-slate-500 uppercase",
                                                        children: player.teamAbbr
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 604,
                                                        columnNumber: 23
                                                    }, this),
                                                    player.confAbbr && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "hidden sm:inline px-2 py-0.5 rounded bg-slate-100 text-[11px] font-bold text-slate-500 uppercase",
                                                        children: player.confAbbr
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 608,
                                                        columnNumber: 25
                                                    }, this),
                                                    player.position && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "px-2 py-0.5 rounded bg-slate-100 text-[11px] font-bold text-slate-700 uppercase",
                                                        children: player.position
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 613,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 603,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 572,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border-t border-slate-100 bg-slate-50/50 px-5 py-3",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-end",
                                            children: statView === "kanext" ? /* KaNeXT chips — per-game stats until KR is re-computed */ KANEXT_CHIPS.map((chip)=>{
                                                const val = derived[chip.key];
                                                const isPrimary = chip.isPrimary === true;
                                                const isActive = appliedFilters.sort.key === chip.sortKey;
                                                const arrow = isActive ? appliedFilters.sort.direction === "desc" ? " \u2193" : " \u2191" : "";
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>handleChipSort(chip),
                                                    className: `flex flex-col items-center flex-1 cursor-pointer transition-colors ${isPrimary ? "border-r border-slate-200 mr-2 pr-2" : ""} ${isActive ? "bg-slate-100 rounded-md -mx-0.5 px-0.5" : ""}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isActive ? "text-slate-900 underline underline-offset-2" : "text-slate-400"}`,
                                                            children: [
                                                                chip.label,
                                                                arrow
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/page.tsx",
                                                            lineNumber: 641,
                                                            columnNumber: 31
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `font-black tabular-nums ${isPrimary ? "text-2xl sm:text-3xl text-slate-900" : isActive ? "text-base sm:text-lg text-slate-900" : "text-base sm:text-lg text-slate-700"}`,
                                                            children: fmtDerived(val, chip.decimals, chip.suffix)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/page.tsx",
                                                            lineNumber: 646,
                                                            columnNumber: 31
                                                        }, this)
                                                    ]
                                                }, chip.key, true, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 631,
                                                    columnNumber: 29
                                                }, this);
                                            }) : /* Traditional chips */ tradChips.map((chip, i)=>{
                                                const val = derived[chip.key];
                                                const isLast = i === tradChips.length - 1;
                                                const isActive = appliedFilters.sort.key === chip.sortKey;
                                                const arrow = isActive ? appliedFilters.sort.direction === "desc" ? " \u2193" : " \u2191" : "";
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>handleChipSort(chip),
                                                    className: `flex flex-col items-center flex-1 cursor-pointer transition-colors ${!isLast ? "border-r border-slate-200" : ""} ${isActive ? "bg-slate-100 rounded-md -mx-0.5 px-0.5" : ""}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isActive ? "text-slate-900 underline underline-offset-2" : "text-slate-400"}`,
                                                            children: [
                                                                chip.label,
                                                                arrow
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/page.tsx",
                                                            lineNumber: 676,
                                                            columnNumber: 31
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `text-base sm:text-lg font-black tabular-nums ${isActive ? "text-slate-900" : "text-slate-700"}`,
                                                            children: fmtDerived(val, chip.decimals, chip.suffix)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/page.tsx",
                                                            lineNumber: 681,
                                                            columnNumber: 31
                                                        }, this)
                                                    ]
                                                }, chip.key, true, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 668,
                                                    columnNumber: 29
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 622,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 621,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, player.id, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 567,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 554,
                        columnNumber: 9
                    }, this),
                    !loading && hasMore && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-6 text-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: loadMore,
                            disabled: loadingMore,
                            className: "px-8 py-3 bg-slate-900 text-white text-sm font-bold uppercase tracking-wider rounded hover:bg-slate-800 transition-colors disabled:opacity-50",
                            children: loadingMore ? "Loading..." : "Load More"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 701,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 700,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 547,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$filter$2d$drawer$2f$filter$2d$drawer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"], {
                open: drawerOpen,
                onClose: ()=>setDrawerOpen(false),
                appliedFilters: appliedFilters,
                onApply: setAppliedFilters,
                statView: statView,
                onSwitchView: switchView,
                traditionalMode: traditionalMode,
                onSwitchTraditionalMode: setTraditionalMode
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 713,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
];

//# sourceMappingURL=src_c5cbfd3b._.js.map