module.exports = [
"[project]/src/components/stat-view-toggle.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StatViewToggle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
"use client";
;
const OPTIONS = [
    {
        value: "totals",
        label: "Totals"
    },
    {
        value: "perGame",
        label: "Per Game"
    },
    {
        value: "per40",
        label: "Per 40"
    }
];
function StatViewToggle({ value, onChange }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs font-medium text-slate-500 uppercase tracking-wide",
                children: "Stat View"
            }, void 0, false, {
                fileName: "[project]/src/components/stat-view-toggle.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex bg-slate-100 rounded p-0.5",
                children: OPTIONS.map((o)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>onChange(o.value),
                        className: `px-3 py-1 text-sm font-medium rounded transition-colors ${value === o.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`,
                        children: o.label
                    }, o.value, false, {
                        fileName: "[project]/src/components/stat-view-toggle.tsx",
                        lineNumber: 25,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/stat-view-toggle.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/stat-view-toggle.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/data-table.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DataTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function DataTable({ columns, data, onRowClick, defaultSortKey, defaultSortDir = "desc" }) {
    const [sortKey, setSortKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(defaultSortKey ?? "");
    const [sortDir, setSortDir] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(defaultSortDir);
    const handleSort = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((key, sortable)=>{
        if (sortable === false) return;
        if (sortKey === key) {
            setSortDir((d)=>d === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("desc");
        }
    }, [
        sortKey
    ]);
    const sorted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!sortKey) return data;
        const col = columns.find((c)=>c.key === sortKey);
        if (!col) return data;
        const getter = col.getSortValue ?? col.getValue;
        return [
            ...data
        ].sort((a, b)=>{
            const va = getter(a);
            const vb = getter(b);
            if (typeof va === "number" && typeof vb === "number") {
                return sortDir === "asc" ? va - vb : vb - va;
            }
            const sa = String(va);
            const sb = String(vb);
            return sortDir === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa);
        });
    }, [
        data,
        sortKey,
        sortDir,
        columns
    ]);
    // Build column groups
    const groups = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const result = [];
        let current = "";
        let span = 0;
        for (const col of columns){
            const g = col.group ?? "";
            if (g === current) {
                span++;
            } else {
                if (span > 0) result.push({
                    label: current,
                    span
                });
                current = g;
                span = 1;
            }
        }
        if (span > 0) result.push({
            label: current,
            span
        });
        return result;
    }, [
        columns
    ]);
    const hasGroups = groups.some((g)=>g.label !== "");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "overflow-x-auto border border-slate-200 rounded-lg",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            className: "w-full text-sm",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                    children: [
                        hasGroups && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            className: "bg-slate-800 text-slate-300",
                            children: groups.map((g, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    colSpan: g.span,
                                    className: "px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-center border-b border-slate-700",
                                    children: g.label
                                }, i, false, {
                                    fileName: "[project]/src/components/data-table.tsx",
                                    lineNumber: 94,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/data-table.tsx",
                            lineNumber: 92,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            className: "bg-slate-900 text-slate-200",
                            children: columns.map((col)=>{
                                const active = sortKey === col.key;
                                const clickable = col.sortable !== false;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    onClick: ()=>handleSort(col.key, col.sortable),
                                    className: `px-3 py-2 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap ${col.align === "left" ? "text-left" : "text-center"} ${clickable ? "cursor-pointer select-none hover:bg-slate-800" : ""} ${active ? "bg-slate-800" : ""}`,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "inline-flex items-center gap-1",
                                        children: [
                                            col.label,
                                            clickable && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] opacity-40",
                                                children: active ? sortDir === "asc" ? "\u25B2" : "\u25BC" : "\u21C5"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/data-table.tsx",
                                                lineNumber: 121,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/data-table.tsx",
                                        lineNumber: 118,
                                        columnNumber: 19
                                    }, this)
                                }, col.key, false, {
                                    fileName: "[project]/src/components/data-table.tsx",
                                    lineNumber: 109,
                                    columnNumber: 17
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/components/data-table.tsx",
                            lineNumber: 104,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/data-table.tsx",
                    lineNumber: 90,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                    children: sorted.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            colSpan: columns.length,
                            className: "px-4 py-12 text-center text-slate-400",
                            children: "No data"
                        }, void 0, false, {
                            fileName: "[project]/src/components/data-table.tsx",
                            lineNumber: 138,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/data-table.tsx",
                        lineNumber: 137,
                        columnNumber: 13
                    }, this) : sorted.map((row, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            onClick: ()=>onRowClick?.(row),
                            className: `border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"} ${onRowClick ? "cursor-pointer hover:bg-blue-50/60" : "hover:bg-slate-50"}`,
                            children: columns.map((col)=>{
                                const active = sortKey === col.key;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: `px-3 py-1.5 whitespace-nowrap ${col.align === "left" ? "text-left" : "text-center"} ${active ? "bg-blue-50/40" : ""}`,
                                    children: col.render ? col.render(row) : col.getValue(row)
                                }, col.key, false, {
                                    fileName: "[project]/src/components/data-table.tsx",
                                    lineNumber: 161,
                                    columnNumber: 21
                                }, this);
                            })
                        }, i, false, {
                            fileName: "[project]/src/components/data-table.tsx",
                            lineNumber: 147,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/components/data-table.tsx",
                    lineNumber: 135,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/data-table.tsx",
            lineNumber: 89,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/data-table.tsx",
        lineNumber: 88,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/lib/stats.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LEVEL_KEYS",
    ()=>LEVEL_KEYS,
    "LEVEL_LABELS",
    ()=>LEVEL_LABELS,
    "astTo",
    ()=>astTo,
    "efgPct",
    ()=>efgPct,
    "fmtDec",
    ()=>fmtDec,
    "fmtHeight",
    ()=>fmtHeight,
    "fmtInt",
    ()=>fmtInt,
    "fmtKr",
    ()=>fmtKr,
    "fmtPct",
    ()=>fmtPct,
    "fmtStat",
    ()=>fmtStat,
    "per40",
    ()=>per40,
    "perGame",
    ()=>perGame,
    "tsPct",
    ()=>tsPct
]);
const LEVEL_LABELS = {
    ncaa_d1: "NCAA D1",
    ncaa_d2: "NCAA D2",
    ncaa_d3: "NCAA D3",
    naia: "NAIA",
    njcaa_d1: "NJCAA D1",
    njcaa_d2: "NJCAA D2",
    njcaa_d3: "NJCAA D3",
    cccaa: "CCCAA"
};
const LEVEL_KEYS = Object.keys(LEVEL_LABELS);
function fmtInt(n) {
    if (n == null) return "";
    return Math.round(n).toString();
}
function fmtDec(n) {
    if (n == null) return "";
    return n.toFixed(1);
}
function fmtPct(num, den) {
    if (num == null || den == null || den === 0) return "";
    return (num / den * 100).toFixed(1) + "%";
}
function perGame(val, gp) {
    if (val == null || gp === 0) return null;
    return val / gp;
}
function per40(val, min) {
    if (val == null || min === 0) return null;
    return val / min * 40;
}
function fmtStat(val, view, gp, min) {
    if (val == null) return "";
    switch(view){
        case "totals":
            return fmtInt(val);
        case "perGame":
            return fmtDec(perGame(val, gp));
        case "per40":
            return fmtDec(per40(val, min));
    }
}
function fmtHeight(inches) {
    if (inches == null) return "";
    const ft = Math.floor(inches / 12);
    const rem = inches % 12;
    return `${ft}'${rem}"`;
}
function efgPct(fgm, threePm, fga) {
    if (fga === 0) return "";
    return ((fgm + 0.5 * threePm) / fga * 100).toFixed(1) + "%";
}
function tsPct(pts, fga, fta) {
    const den = 2 * (fga + 0.44 * fta);
    if (den === 0) return "";
    return (pts / den * 100).toFixed(1) + "%";
}
function astTo(ast, to) {
    if (to === 0) return "";
    return (ast / to).toFixed(1);
}
function fmtKr(val) {
    if (val == null) return "--";
    return val.toFixed(1);
}
}),
"[project]/src/lib/columns.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "categoryLeaderColumns",
    ()=>categoryLeaderColumns,
    "comparisonColumns",
    ()=>comparisonColumns,
    "gameByGameColumns",
    ()=>gameByGameColumns,
    "gameHighsColumns",
    ()=>gameHighsColumns,
    "opponentOverallColumns",
    ()=>opponentOverallColumns,
    "playerDetailColumns",
    ()=>playerDetailColumns,
    "playerGameLogColumns",
    ()=>playerGameLogColumns,
    "playerKrColumns",
    ()=>playerKrColumns,
    "playerOverviewColumns",
    ()=>playerOverviewColumns,
    "rosterKrColumns",
    ()=>rosterKrColumns,
    "rosterOverviewColumns",
    ()=>rosterOverviewColumns,
    "simpleGameLogColumns",
    ()=>simpleGameLogColumns,
    "splitColumns",
    ()=>splitColumns,
    "teamCoverageColumns",
    ()=>teamCoverageColumns,
    "teamOverallColumns",
    ()=>teamOverallColumns
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/stats.ts [app-ssr] (ecmascript)");
;
;
function playerOverviewColumns(view) {
    const s = (val, row)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtStat"])(val, view, row.gp, row.min);
    return [
        {
            key: "name",
            label: "Player",
            group: "",
            sortable: false,
            align: "left",
            getValue: (r)=>r.name
        },
        {
            key: "team",
            label: "Team",
            group: "",
            sortable: false,
            align: "left",
            getValue: (r)=>r.teamName
        },
        {
            key: "level",
            label: "Level",
            group: "",
            sortable: false,
            getValue: (r)=>r.level
        },
        {
            key: "conf",
            label: "Conf",
            group: "",
            sortable: false,
            getValue: (r)=>r.conference
        },
        {
            key: "pos",
            label: "Pos",
            group: "",
            sortable: false,
            getValue: (r)=>r.position
        },
        {
            key: "ht",
            label: "Ht",
            group: "",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtHeight"])(r.heightInches),
            getSortValue: (r)=>r.heightInches ?? 0
        },
        {
            key: "class",
            label: "Class",
            group: "",
            sortable: false,
            getValue: (r)=>r.classYear
        },
        {
            key: "gp",
            label: "GP",
            group: "Games",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.gp),
            getSortValue: (r)=>r.gp
        },
        {
            key: "gs",
            label: "GS",
            group: "Games",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.gs),
            getSortValue: (r)=>r.gs
        },
        {
            key: "min",
            label: "MIN",
            group: "Games",
            getValue: (r)=>s(r.min, r),
            getSortValue: (r)=>r.min
        },
        {
            key: "mpg",
            label: "MPG",
            group: "Games",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.min / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.min / r.gp : 0
        },
        {
            key: "pts",
            label: "PTS",
            group: "Scoring",
            getValue: (r)=>s(r.pts, r),
            getSortValue: (r)=>r.pts
        },
        {
            key: "ppg",
            label: "PPG",
            group: "Scoring",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.pts / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.pts / r.gp : 0
        },
        {
            key: "trb",
            label: "TRB",
            group: "Rebounds",
            getValue: (r)=>s(r.trb, r),
            getSortValue: (r)=>r.trb
        },
        {
            key: "rpg",
            label: "RPG",
            group: "Rebounds",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.trb / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.trb / r.gp : 0
        },
        {
            key: "ast",
            label: "AST",
            group: "Playmaking",
            getValue: (r)=>s(r.ast, r),
            getSortValue: (r)=>r.ast
        },
        {
            key: "apg",
            label: "APG",
            group: "Playmaking",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.ast / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.ast / r.gp : 0
        },
        {
            key: "fgPct",
            label: "FG%",
            group: "Shooting",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtPct"])(r.fgm, r.fga),
            getSortValue: (r)=>r.fga ? r.fgm / r.fga : 0
        },
        {
            key: "3pPct",
            label: "3P%",
            group: "Shooting",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtPct"])(r.threePm, r.threePa),
            getSortValue: (r)=>r.threePa ? r.threePm / r.threePa : 0
        },
        {
            key: "ftPct",
            label: "FT%",
            group: "Shooting",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtPct"])(r.ftm, r.fta),
            getSortValue: (r)=>r.fta ? r.ftm / r.fta : 0
        }
    ];
}
function playerKrColumns() {
    return [
        {
            key: "name",
            label: "Player",
            sortable: false,
            align: "left",
            getValue: (r)=>r.name
        },
        {
            key: "team",
            label: "Team",
            sortable: false,
            align: "left",
            getValue: (r)=>r.teamName
        },
        {
            key: "level",
            label: "Level",
            sortable: false,
            getValue: (r)=>r.level
        },
        {
            key: "conf",
            label: "Conf",
            sortable: false,
            getValue: (r)=>r.conference
        },
        {
            key: "pos",
            label: "Pos",
            sortable: false,
            getValue: (r)=>r.position
        },
        {
            key: "archetype",
            label: "Archetype",
            sortable: false,
            getValue: (r)=>r.archetype ?? "--"
        },
        {
            key: "confidence",
            label: "Conf.",
            sortable: false,
            getValue: (r)=>r.confidence ?? "--"
        },
        {
            key: "kr",
            label: "KR",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtKr"])(r.kr),
            getSortValue: (r)=>r.kr ?? 0
        },
        {
            key: "krOff",
            label: "Off KR",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtKr"])(r.krOff),
            getSortValue: (r)=>r.krOff ?? 0
        },
        {
            key: "krDef",
            label: "Def KR",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtKr"])(r.krDef),
            getSortValue: (r)=>r.krDef ?? 0
        },
        {
            key: "krShooting",
            label: "Shooting",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtKr"])(r.krShooting),
            getSortValue: (r)=>r.krShooting ?? 0
        },
        {
            key: "krFinishing",
            label: "Finishing",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtKr"])(r.krFinishing),
            getSortValue: (r)=>r.krFinishing ?? 0
        },
        {
            key: "krPlaymaking",
            label: "Playmaking",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtKr"])(r.krPlaymaking),
            getSortValue: (r)=>r.krPlaymaking ?? 0
        },
        {
            key: "krPoaDefense",
            label: "POA Def",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtKr"])(r.krPoaDefense),
            getSortValue: (r)=>r.krPoaDefense ?? 0
        },
        {
            key: "krTeamDefense",
            label: "Team Def",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtKr"])(r.krTeamDefense),
            getSortValue: (r)=>r.krTeamDefense ?? 0
        },
        {
            key: "krRebounding",
            label: "Rebounding",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtKr"])(r.krRebounding),
            getSortValue: (r)=>r.krRebounding ?? 0
        },
        {
            key: "krTools",
            label: "Tools",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtKr"])(r.krTools),
            getSortValue: (r)=>r.krTools ?? 0
        },
        {
            key: "krIq",
            label: "IQ",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtKr"])(r.krIq),
            getSortValue: (r)=>r.krIq ?? 0
        }
    ];
}
/* ------------------------------------------------------------------ */ /* 3. teamCoverageColumns — 7 cols for /teams index                    */ /* ------------------------------------------------------------------ */ const STATUS_COLORS = {
    Complete: "bg-green-100 text-green-800",
    Partial: "bg-yellow-100 text-yellow-800",
    Missing: "bg-red-100 text-red-800"
};
function teamCoverageColumns() {
    return [
        {
            key: "name",
            label: "Team",
            sortable: false,
            align: "left",
            getValue: (r)=>r.name
        },
        {
            key: "level",
            label: "Level",
            sortable: false,
            getValue: (r)=>r.level
        },
        {
            key: "conf",
            label: "Conference",
            sortable: false,
            getValue: (r)=>r.conference
        },
        {
            key: "players",
            label: "Players",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.playerCount),
            getSortValue: (r)=>r.playerCount
        },
        {
            key: "games",
            label: "Games",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.gameCount),
            getSortValue: (r)=>r.gameCount
        },
        {
            key: "lastUpdated",
            label: "Last Updated",
            getValue: (r)=>r.lastUpdated ?? "--",
            getSortValue: (r)=>r.lastUpdated ?? ""
        },
        {
            key: "status",
            label: "Coverage",
            getValue: (r)=>r.coverageStatus,
            render: (r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: `px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[r.coverageStatus] ?? ""}`,
                    children: r.coverageStatus
                }, void 0, false, {
                    fileName: "[project]/src/lib/columns.tsx",
                    lineNumber: 106,
                    columnNumber: 9
                }, this)
        }
    ];
}
function rosterOverviewColumns(view) {
    const s = (val, row)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtStat"])(val, view, row.gp, row.min);
    return [
        {
            key: "name",
            label: "Player",
            group: "",
            sortable: false,
            align: "left",
            getValue: (r)=>r.name
        },
        {
            key: "pos",
            label: "Pos",
            group: "",
            sortable: false,
            getValue: (r)=>r.position
        },
        {
            key: "ht",
            label: "Ht",
            group: "",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtHeight"])(r.heightInches),
            getSortValue: (r)=>r.heightInches ?? 0
        },
        {
            key: "class",
            label: "Class",
            group: "",
            sortable: false,
            getValue: (r)=>r.classYear
        },
        {
            key: "gp",
            label: "GP",
            group: "Games",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.gp),
            getSortValue: (r)=>r.gp
        },
        {
            key: "gs",
            label: "GS",
            group: "Games",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.gs),
            getSortValue: (r)=>r.gs
        },
        {
            key: "min",
            label: "MIN",
            group: "Games",
            getValue: (r)=>s(r.min, r),
            getSortValue: (r)=>r.min
        },
        {
            key: "mpg",
            label: "MPG",
            group: "Games",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.min / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.min / r.gp : 0
        },
        {
            key: "pts",
            label: "PTS",
            group: "Scoring",
            getValue: (r)=>s(r.pts, r),
            getSortValue: (r)=>r.pts
        },
        {
            key: "ppg",
            label: "PPG",
            group: "Scoring",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.pts / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.pts / r.gp : 0
        },
        {
            key: "trb",
            label: "TRB",
            group: "Rebounds",
            getValue: (r)=>s(r.trb, r),
            getSortValue: (r)=>r.trb
        },
        {
            key: "rpg",
            label: "RPG",
            group: "Rebounds",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.trb / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.trb / r.gp : 0
        },
        {
            key: "ast",
            label: "AST",
            group: "Playmaking",
            getValue: (r)=>s(r.ast, r),
            getSortValue: (r)=>r.ast
        },
        {
            key: "apg",
            label: "APG",
            group: "Playmaking",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.ast / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.ast / r.gp : 0
        },
        {
            key: "fgPct",
            label: "FG%",
            group: "Shooting",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtPct"])(r.fgm, r.fga),
            getSortValue: (r)=>r.fga ? r.fgm / r.fga : 0
        },
        {
            key: "3pPct",
            label: "3P%",
            group: "Shooting",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtPct"])(r.threePm, r.threePa),
            getSortValue: (r)=>r.threePa ? r.threePm / r.threePa : 0
        },
        {
            key: "ftPct",
            label: "FT%",
            group: "Shooting",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtPct"])(r.ftm, r.fta),
            getSortValue: (r)=>r.fta ? r.ftm / r.fta : 0
        }
    ];
}
function rosterKrColumns() {
    return [
        {
            key: "name",
            label: "Player",
            sortable: false,
            align: "left",
            getValue: (r)=>r.name
        },
        {
            key: "pos",
            label: "Pos",
            sortable: false,
            getValue: (r)=>r.position
        },
        {
            key: "archetype",
            label: "Archetype",
            sortable: false,
            getValue: (r)=>r.archetype ?? "--"
        },
        {
            key: "confidence",
            label: "Conf.",
            sortable: false,
            getValue: (r)=>r.confidence ?? "--"
        },
        {
            key: "kr",
            label: "KR",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtKr"])(r.kr),
            getSortValue: (r)=>r.kr ?? 0
        },
        {
            key: "krOff",
            label: "Off KR",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtKr"])(r.krOff),
            getSortValue: (r)=>r.krOff ?? 0
        },
        {
            key: "krDef",
            label: "Def KR",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtKr"])(r.krDef),
            getSortValue: (r)=>r.krDef ?? 0
        },
        {
            key: "krShooting",
            label: "Shooting",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtKr"])(r.krShooting),
            getSortValue: (r)=>r.krShooting ?? 0
        },
        {
            key: "krFinishing",
            label: "Finishing",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtKr"])(r.krFinishing),
            getSortValue: (r)=>r.krFinishing ?? 0
        },
        {
            key: "krPlaymaking",
            label: "Playmaking",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtKr"])(r.krPlaymaking),
            getSortValue: (r)=>r.krPlaymaking ?? 0
        },
        {
            key: "krPoaDefense",
            label: "POA Def",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtKr"])(r.krPoaDefense),
            getSortValue: (r)=>r.krPoaDefense ?? 0
        },
        {
            key: "krTeamDefense",
            label: "Team Def",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtKr"])(r.krTeamDefense),
            getSortValue: (r)=>r.krTeamDefense ?? 0
        },
        {
            key: "krRebounding",
            label: "Rebounding",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtKr"])(r.krRebounding),
            getSortValue: (r)=>r.krRebounding ?? 0
        },
        {
            key: "krTools",
            label: "Tools",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtKr"])(r.krTools),
            getSortValue: (r)=>r.krTools ?? 0
        },
        {
            key: "krIq",
            label: "IQ",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtKr"])(r.krIq),
            getSortValue: (r)=>r.krIq ?? 0
        }
    ];
}
function teamOverallColumns(view) {
    const s = (val, row)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtStat"])(val, view, row.gp, row.min);
    return [
        {
            key: "gp",
            label: "GP",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.gp),
            getSortValue: (r)=>r.gp
        },
        {
            key: "min",
            label: "MIN",
            getValue: (r)=>s(r.min, r),
            getSortValue: (r)=>r.min
        },
        {
            key: "fgm",
            label: "FGM",
            getValue: (r)=>s(r.fgm, r),
            getSortValue: (r)=>r.fgm
        },
        {
            key: "fga",
            label: "FGA",
            getValue: (r)=>s(r.fga, r),
            getSortValue: (r)=>r.fga
        },
        {
            key: "fgPct",
            label: "FG%",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtPct"])(r.fgm, r.fga),
            getSortValue: (r)=>r.fga ? r.fgm / r.fga : 0
        },
        {
            key: "3pm",
            label: "3PM",
            getValue: (r)=>s(r.threePm, r),
            getSortValue: (r)=>r.threePm
        },
        {
            key: "3pa",
            label: "3PA",
            getValue: (r)=>s(r.threePa, r),
            getSortValue: (r)=>r.threePa
        },
        {
            key: "3pPct",
            label: "3P%",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtPct"])(r.threePm, r.threePa),
            getSortValue: (r)=>r.threePa ? r.threePm / r.threePa : 0
        },
        {
            key: "ftm",
            label: "FTM",
            getValue: (r)=>s(r.ftm, r),
            getSortValue: (r)=>r.ftm
        },
        {
            key: "fta",
            label: "FTA",
            getValue: (r)=>s(r.fta, r),
            getSortValue: (r)=>r.fta
        },
        {
            key: "ftPct",
            label: "FT%",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtPct"])(r.ftm, r.fta),
            getSortValue: (r)=>r.fta ? r.ftm / r.fta : 0
        },
        {
            key: "pts",
            label: "PTS",
            getValue: (r)=>s(r.pts, r),
            getSortValue: (r)=>r.pts
        },
        {
            key: "ppg",
            label: "PPG",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.pts / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.pts / r.gp : 0
        },
        {
            key: "orb",
            label: "ORB",
            getValue: (r)=>s(r.orb, r),
            getSortValue: (r)=>r.orb
        },
        {
            key: "drb",
            label: "DRB",
            getValue: (r)=>s(r.drb, r),
            getSortValue: (r)=>r.drb
        },
        {
            key: "trb",
            label: "TRB",
            getValue: (r)=>s(r.trb, r),
            getSortValue: (r)=>r.trb
        },
        {
            key: "rpg",
            label: "RPG",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.trb / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.trb / r.gp : 0
        },
        {
            key: "ast",
            label: "AST",
            getValue: (r)=>s(r.ast, r),
            getSortValue: (r)=>r.ast
        },
        {
            key: "apg",
            label: "APG",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.ast / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.ast / r.gp : 0
        },
        {
            key: "to",
            label: "TO",
            getValue: (r)=>s(r.to, r),
            getSortValue: (r)=>r.to
        },
        {
            key: "topg",
            label: "TOPG",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.to / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.to / r.gp : 0
        },
        {
            key: "stl",
            label: "STL",
            getValue: (r)=>s(r.stl, r),
            getSortValue: (r)=>r.stl
        },
        {
            key: "spg",
            label: "SPG",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.stl / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.stl / r.gp : 0
        },
        {
            key: "blk",
            label: "BLK",
            getValue: (r)=>s(r.blk, r),
            getSortValue: (r)=>r.blk
        },
        {
            key: "bpg",
            label: "BPG",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.blk / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.blk / r.gp : 0
        },
        {
            key: "pf",
            label: "PF",
            getValue: (r)=>s(r.pf, r),
            getSortValue: (r)=>r.pf
        }
    ];
}
function opponentOverallColumns(view) {
    return teamOverallColumns(view).map((col)=>({
            ...col,
            key: `opp_${col.key}`,
            label: `Opp ${col.label}`
        }));
}
function comparisonColumns() {
    return [
        {
            key: "stat",
            label: "Stat",
            sortable: false,
            align: "left",
            getValue: (r)=>r.stat
        },
        {
            key: "team",
            label: "Team",
            sortable: false,
            getValue: (r)=>r.team
        },
        {
            key: "opponent",
            label: "Opponent",
            sortable: false,
            getValue: (r)=>r.opponent
        }
    ];
}
function splitColumns() {
    return [
        {
            key: "label",
            label: "Split",
            sortable: false,
            align: "left",
            getValue: (r)=>r.label
        },
        {
            key: "gp",
            label: "GP",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.gp),
            getSortValue: (r)=>r.gp
        },
        {
            key: "ppg",
            label: "PPG",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.pts / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.pts / r.gp : 0
        },
        {
            key: "oppPpg",
            label: "Opp PPG",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.oppPpg),
            getSortValue: (r)=>r.oppPpg
        },
        {
            key: "fgPct",
            label: "FG%",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtPct"])(r.fgm, r.fga),
            getSortValue: (r)=>r.fga ? r.fgm / r.fga : 0
        },
        {
            key: "3pPct",
            label: "3P%",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtPct"])(r.threePm, r.threePa),
            getSortValue: (r)=>r.threePa ? r.threePm / r.threePa : 0
        },
        {
            key: "ftPct",
            label: "FT%",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtPct"])(r.ftm, r.fta),
            getSortValue: (r)=>r.fta ? r.ftm / r.fta : 0
        },
        {
            key: "rpg",
            label: "RPG",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.trb / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.trb / r.gp : 0
        },
        {
            key: "apg",
            label: "APG",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.ast / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.ast / r.gp : 0
        },
        {
            key: "topg",
            label: "TOPG",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.to / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.to / r.gp : 0
        },
        {
            key: "spg",
            label: "SPG",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.stl / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.stl / r.gp : 0
        },
        {
            key: "bpg",
            label: "BPG",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.blk / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.blk / r.gp : 0
        }
    ];
}
function gameByGameColumns() {
    return [
        {
            key: "date",
            label: "Date",
            align: "left",
            getValue: (r)=>r.date,
            getSortValue: (r)=>r.date
        },
        {
            key: "opp",
            label: "Opponent",
            align: "left",
            sortable: false,
            getValue: (r)=>r.opponent
        },
        {
            key: "result",
            label: "Result",
            sortable: false,
            getValue: (r)=>r.result
        },
        {
            key: "score",
            label: "Score",
            sortable: false,
            getValue: (r)=>`${r.teamScore}-${r.oppScore}`
        },
        {
            key: "min",
            label: "MIN",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.min),
            getSortValue: (r)=>r.min
        },
        {
            key: "fg",
            label: "FGM-FGA",
            sortable: false,
            getValue: (r)=>`${r.fgm}-${r.fga}`
        },
        {
            key: "3p",
            label: "3PM-3PA",
            sortable: false,
            getValue: (r)=>`${r.threePm}-${r.threePa}`
        },
        {
            key: "ft",
            label: "FTM-FTA",
            sortable: false,
            getValue: (r)=>`${r.ftm}-${r.fta}`
        },
        {
            key: "orb",
            label: "ORB",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.orb),
            getSortValue: (r)=>r.orb
        },
        {
            key: "drb",
            label: "DRB",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.drb),
            getSortValue: (r)=>r.drb
        },
        {
            key: "trb",
            label: "TRB",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.trb),
            getSortValue: (r)=>r.trb
        },
        {
            key: "ast",
            label: "AST",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.ast),
            getSortValue: (r)=>r.ast
        },
        {
            key: "to",
            label: "TO",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.to),
            getSortValue: (r)=>r.to
        },
        {
            key: "stl",
            label: "STL",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.stl),
            getSortValue: (r)=>r.stl
        },
        {
            key: "blk",
            label: "BLK",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.blk),
            getSortValue: (r)=>r.blk
        },
        {
            key: "pf",
            label: "PF",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.pf),
            getSortValue: (r)=>r.pf
        },
        {
            key: "pts",
            label: "PTS",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.pts),
            getSortValue: (r)=>r.pts
        }
    ];
}
function simpleGameLogColumns() {
    return [
        {
            key: "date",
            label: "Date",
            align: "left",
            getValue: (r)=>r.date,
            getSortValue: (r)=>r.date
        },
        {
            key: "opp",
            label: "Opponent",
            align: "left",
            sortable: false,
            getValue: (r)=>r.opponent
        },
        {
            key: "result",
            label: "Result",
            sortable: false,
            getValue: (r)=>r.result
        },
        {
            key: "score",
            label: "Score",
            sortable: false,
            getValue: (r)=>`${r.teamScore}-${r.oppScore}`
        }
    ];
}
function playerDetailColumns(view) {
    const s = (val, row)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtStat"])(val, view, row.gp, row.min);
    return [
        {
            key: "gp",
            label: "GP",
            group: "Games",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.gp),
            getSortValue: (r)=>r.gp
        },
        {
            key: "gs",
            label: "GS",
            group: "Games",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.gs),
            getSortValue: (r)=>r.gs
        },
        {
            key: "min",
            label: "MIN",
            group: "Games",
            getValue: (r)=>s(r.min, r),
            getSortValue: (r)=>r.min
        },
        {
            key: "mpg",
            label: "MPG",
            group: "Games",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.min / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.min / r.gp : 0
        },
        {
            key: "fgm",
            label: "FGM",
            group: "Shooting",
            getValue: (r)=>s(r.fgm, r),
            getSortValue: (r)=>r.fgm
        },
        {
            key: "fga",
            label: "FGA",
            group: "Shooting",
            getValue: (r)=>s(r.fga, r),
            getSortValue: (r)=>r.fga
        },
        {
            key: "fgPct",
            label: "FG%",
            group: "Shooting",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtPct"])(r.fgm, r.fga),
            getSortValue: (r)=>r.fga ? r.fgm / r.fga : 0
        },
        {
            key: "3pm",
            label: "3PM",
            group: "Shooting",
            getValue: (r)=>s(r.threePm, r),
            getSortValue: (r)=>r.threePm
        },
        {
            key: "3pa",
            label: "3PA",
            group: "Shooting",
            getValue: (r)=>s(r.threePa, r),
            getSortValue: (r)=>r.threePa
        },
        {
            key: "3pPct",
            label: "3P%",
            group: "Shooting",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtPct"])(r.threePm, r.threePa),
            getSortValue: (r)=>r.threePa ? r.threePm / r.threePa : 0
        },
        {
            key: "ftm",
            label: "FTM",
            group: "Shooting",
            getValue: (r)=>s(r.ftm, r),
            getSortValue: (r)=>r.ftm
        },
        {
            key: "fta",
            label: "FTA",
            group: "Shooting",
            getValue: (r)=>s(r.fta, r),
            getSortValue: (r)=>r.fta
        },
        {
            key: "ftPct",
            label: "FT%",
            group: "Shooting",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtPct"])(r.ftm, r.fta),
            getSortValue: (r)=>r.fta ? r.ftm / r.fta : 0
        },
        {
            key: "pts",
            label: "PTS",
            group: "Scoring",
            getValue: (r)=>s(r.pts, r),
            getSortValue: (r)=>r.pts
        },
        {
            key: "ppg",
            label: "PPG",
            group: "Scoring",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.pts / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.pts / r.gp : 0
        },
        {
            key: "orb",
            label: "ORB",
            group: "Rebounds",
            getValue: (r)=>s(r.orb, r),
            getSortValue: (r)=>r.orb
        },
        {
            key: "drb",
            label: "DRB",
            group: "Rebounds",
            getValue: (r)=>s(r.drb, r),
            getSortValue: (r)=>r.drb
        },
        {
            key: "trb",
            label: "TRB",
            group: "Rebounds",
            getValue: (r)=>s(r.trb, r),
            getSortValue: (r)=>r.trb
        },
        {
            key: "rpg",
            label: "RPG",
            group: "Rebounds",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.trb / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.trb / r.gp : 0
        },
        {
            key: "ast",
            label: "AST",
            group: "Playmaking",
            getValue: (r)=>s(r.ast, r),
            getSortValue: (r)=>r.ast
        },
        {
            key: "apg",
            label: "APG",
            group: "Playmaking",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.ast / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.ast / r.gp : 0
        },
        {
            key: "to",
            label: "TO",
            group: "Playmaking",
            getValue: (r)=>s(r.to, r),
            getSortValue: (r)=>r.to
        },
        {
            key: "topg",
            label: "TOPG",
            group: "Playmaking",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.to / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.to / r.gp : 0
        },
        {
            key: "astTo",
            label: "AST/TO",
            group: "Playmaking",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["astTo"])(r.ast, r.to),
            getSortValue: (r)=>r.to ? r.ast / r.to : 0
        },
        {
            key: "stl",
            label: "STL",
            group: "Defense",
            getValue: (r)=>s(r.stl, r),
            getSortValue: (r)=>r.stl
        },
        {
            key: "spg",
            label: "SPG",
            group: "Defense",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.stl / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.stl / r.gp : 0
        },
        {
            key: "blk",
            label: "BLK",
            group: "Defense",
            getValue: (r)=>s(r.blk, r),
            getSortValue: (r)=>r.blk
        },
        {
            key: "bpg",
            label: "BPG",
            group: "Defense",
            getValue: (r)=>r.gp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtDec"])(r.blk / r.gp) : "",
            getSortValue: (r)=>r.gp ? r.blk / r.gp : 0
        },
        {
            key: "pf",
            label: "PF",
            group: "Disc.",
            getValue: (r)=>s(r.pf, r),
            getSortValue: (r)=>r.pf
        },
        {
            key: "efg",
            label: "eFG%",
            group: "Efficiency",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["efgPct"])(r.fgm, r.threePm, r.fga),
            getSortValue: (r)=>r.fga ? (r.fgm + 0.5 * r.threePm) / r.fga : 0
        },
        {
            key: "ts",
            label: "TS%",
            group: "Efficiency",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tsPct"])(r.pts, r.fga, r.fta),
            getSortValue: (r)=>{
                const d = 2 * (r.fga + 0.44 * r.fta);
                return d ? r.pts / d : 0;
            }
        },
        {
            key: "astToRatio",
            label: "AST/TO",
            group: "Efficiency",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["astTo"])(r.ast, r.to),
            getSortValue: (r)=>r.to ? r.ast / r.to : 0
        }
    ];
}
function playerGameLogColumns() {
    return [
        {
            key: "date",
            label: "Date",
            align: "left",
            getValue: (r)=>r.date,
            getSortValue: (r)=>r.date
        },
        {
            key: "opp",
            label: "Opponent",
            align: "left",
            sortable: false,
            getValue: (r)=>r.opponent
        },
        {
            key: "result",
            label: "Result",
            sortable: false,
            getValue: (r)=>`${r.result} ${r.teamScore}-${r.oppScore}`
        },
        {
            key: "min",
            label: "MIN",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.min),
            getSortValue: (r)=>r.min
        },
        {
            key: "fg",
            label: "FGM-FGA",
            sortable: false,
            getValue: (r)=>`${r.fgm}-${r.fga}`
        },
        {
            key: "3p",
            label: "3PM-3PA",
            sortable: false,
            getValue: (r)=>`${r.threePm}-${r.threePa}`
        },
        {
            key: "ft",
            label: "FTM-FTA",
            sortable: false,
            getValue: (r)=>`${r.ftm}-${r.fta}`
        },
        {
            key: "orb",
            label: "ORB",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.orb),
            getSortValue: (r)=>r.orb
        },
        {
            key: "drb",
            label: "DRB",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.drb),
            getSortValue: (r)=>r.drb
        },
        {
            key: "trb",
            label: "TRB",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.trb),
            getSortValue: (r)=>r.trb
        },
        {
            key: "ast",
            label: "AST",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.ast),
            getSortValue: (r)=>r.ast
        },
        {
            key: "to",
            label: "TO",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.to),
            getSortValue: (r)=>r.to
        },
        {
            key: "stl",
            label: "STL",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.stl),
            getSortValue: (r)=>r.stl
        },
        {
            key: "blk",
            label: "BLK",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.blk),
            getSortValue: (r)=>r.blk
        },
        {
            key: "pf",
            label: "PF",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.pf),
            getSortValue: (r)=>r.pf
        },
        {
            key: "pts",
            label: "PTS",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.pts),
            getSortValue: (r)=>r.pts
        }
    ];
}
function gameHighsColumns() {
    return [
        {
            key: "category",
            label: "Category",
            sortable: false,
            align: "left",
            getValue: (r)=>r.category
        },
        {
            key: "value",
            label: "Value",
            getValue: (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$stats$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmtInt"])(r.value),
            getSortValue: (r)=>r.value
        },
        {
            key: "opponent",
            label: "Opponent",
            sortable: false,
            getValue: (r)=>r.opponent
        },
        {
            key: "date",
            label: "Date",
            sortable: false,
            getValue: (r)=>r.date
        }
    ];
}
function categoryLeaderColumns() {
    return [
        {
            key: "category",
            label: "Category",
            sortable: false,
            align: "left",
            getValue: (r)=>r.category
        },
        {
            key: "rank",
            label: "Rank",
            getValue: (r)=>`#${r.rank}`,
            getSortValue: (r)=>r.rank
        },
        {
            key: "value",
            label: "Value",
            sortable: false,
            getValue: (r)=>r.value
        }
    ];
}
}),
"[project]/src/app/teams/[teamId]/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TeamPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$stat$2d$view$2d$toggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/stat-view-toggle.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$data$2d$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/data-table.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$columns$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/columns.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
const TABS = [
    {
        key: "roster",
        label: "Roster"
    },
    {
        key: "teamStats",
        label: "Team Stats"
    },
    {
        key: "gameLog",
        label: "Game Log"
    }
];
function TeamPage() {
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useParams"])();
    const teamId = params.teamId;
    const [tab, setTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("roster");
    const [rosterView, setRosterView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("perGame");
    const [statsView, setStatsView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("perGame");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [team, setTeam] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [roster, setRoster] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [teamStats, setTeamStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [gameLog, setGameLog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetch(`/api/teams/${teamId}`).then((r)=>r.json()).then((data)=>{
            setTeam(data.team);
            setRoster(data.roster ?? []);
            setTeamStats(data.teamStats ? [
                data.teamStats
            ] : []);
            setGameLog(data.gameLog ?? []);
            setLoading(false);
        });
    }, [
        teamId
    ]);
    const rosterCols = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$columns$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["playerColumns"])(rosterView), [
        rosterView
    ]);
    const statsCols = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$columns$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["teamStatsColumns"])(statsView), [
        statsView
    ]);
    const gameCols = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$columns$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["gameLogColumns"])(), []);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-12 text-slate-400",
            children: "Loading..."
        }, void 0, false, {
            fileName: "[project]/src/app/teams/[teamId]/page.tsx",
            lineNumber: 56,
            columnNumber: 12
        }, this);
    }
    if (!team) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-12 text-slate-400",
            children: "Team not found"
        }, void 0, false, {
            fileName: "[project]/src/app/teams/[teamId]/page.tsx",
            lineNumber: 60,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl font-bold tracking-tight",
                        children: team.name
                    }, void 0, false, {
                        fileName: "[project]/src/app/teams/[teamId]/page.tsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-slate-500",
                        children: [
                            team.level,
                            " · ",
                            team.conference,
                            " · ",
                            team.season,
                            team.wins != null && ` \u00b7 ${team.wins}-${team.losses}`
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/teams/[teamId]/page.tsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/teams/[teamId]/page.tsx",
                lineNumber: 66,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1 border-b border-slate-200 mb-4",
                children: TABS.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setTab(t.key),
                        className: `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"}`,
                        children: t.label
                    }, t.key, false, {
                        fileName: "[project]/src/app/teams/[teamId]/page.tsx",
                        lineNumber: 77,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/teams/[teamId]/page.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this),
            tab === "roster" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-end mb-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$stat$2d$view$2d$toggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            value: rosterView,
                            onChange: setRosterView
                        }, void 0, false, {
                            fileName: "[project]/src/app/teams/[teamId]/page.tsx",
                            lineNumber: 95,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/teams/[teamId]/page.tsx",
                        lineNumber: 94,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$data$2d$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        columns: rosterCols,
                        data: roster,
                        defaultSortKey: "ppg"
                    }, void 0, false, {
                        fileName: "[project]/src/app/teams/[teamId]/page.tsx",
                        lineNumber: 97,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            tab === "teamStats" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-end mb-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$stat$2d$view$2d$toggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            value: statsView,
                            onChange: setStatsView
                        }, void 0, false, {
                            fileName: "[project]/src/app/teams/[teamId]/page.tsx",
                            lineNumber: 104,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/teams/[teamId]/page.tsx",
                        lineNumber: 103,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$data$2d$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        columns: statsCols,
                        data: teamStats
                    }, void 0, false, {
                        fileName: "[project]/src/app/teams/[teamId]/page.tsx",
                        lineNumber: 106,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            tab === "gameLog" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$data$2d$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                columns: gameCols,
                data: gameLog,
                defaultSortKey: "date",
                defaultSortDir: "desc"
            }, void 0, false, {
                fileName: "[project]/src/app/teams/[teamId]/page.tsx",
                lineNumber: 111,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
}),
];

//# sourceMappingURL=src_9b86924e._.js.map