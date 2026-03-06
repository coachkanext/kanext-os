"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import FilterDrawer from "@/components/filter-drawer/filter-drawer";
import { DEFAULT_KANEXT_SORT, DEFAULT_TRADITIONAL_SORT } from "@/components/filter-drawer/filter-drawer";
import type { AppliedFilters, StatView, TraditionalMode } from "@/types/filters";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Player {
  id: string;
  name: string;
  team: string;
  teamAbbr: string;
  teamSlug: string | null;
  teamLogo: string | null;
  conference: string | null;
  confAbbr: string | null;
  confLogo: string | null;
  position: string | null;
  levelKey: string | null;
  levelDisplay: string | null;
  height: number | null;
  weight: number | null;
  classYear: string | null;
  jerseyNumber: string | null;
  // Raw season totals
  gp: number;
  gs: number;
  min: number;
  fgm: number;
  fga: number;
  threePm: number;
  threePa: number;
  ftm: number;
  fta: number;
  pts: number;
  orb: number;
  drb: number;
  trb: number;
  ast: number;
  tov: number;
  stl: number;
  blk: number;
  pf: number;
  // Team totals
  teamMin: number | null;
  teamFgm: number | null;
  teamFga: number | null;
  teamFta: number | null;
  teamTov: number | null;
  teamTrb: number | null;
  // Opponent totals
  oppFga: number | null;
  oppTrb: number | null;
  oppPoss: number | null;
  // KaNeXT stats
  kr: number | null;
  krOffense: number | null;
  krDefense: number | null;
  krShooting: number | null;
  krFinishing: number | null;
  krPlaymaking: number | null;
  krPoaDefense: number | null;
  krTeamDefense: number | null;
  krRebounding: number | null;
  krTools: number | null;
  krIq: number | null;
}

/* ------------------------------------------------------------------ */
/* Derived stat computation                                            */
/* ------------------------------------------------------------------ */

function safeDiv(num: number, den: number): number | null {
  return den === 0 ? null : num / den;
}

function computeDerived(p: Player) {
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
  let usgPct: number | null = null;
  if (p.teamMin && p.teamFga != null && p.teamFta != null && p.teamTov != null && p.min > 0) {
    const playerPoss = p.fga + 0.44 * p.fta + p.tov;
    const teamPoss = p.teamFga + 0.44 * p.teamFta + p.teamTov;
    if (teamPoss > 0) {
      usgPct = 100 * (playerPoss * (p.teamMin / 5)) / (p.min * teamPoss);
    }
  }

  const per40 = (x: number) => (p.min === 0 ? null : (x / p.min) * 40);

  // Advanced stats (require team + opponent data)
  const tmMin5 = p.teamMin ? p.teamMin / 5 : null;

  let astPct: number | null = null;
  if (tmMin5 && p.teamFgm != null && p.min > 0) {
    const tmFgWhileOn = (p.min / tmMin5) * p.teamFgm;
    const denom = tmFgWhileOn - p.fgm;
    if (denom > 0) astPct = 100 * p.ast / denom;
  }

  let stlPct: number | null = null;
  if (tmMin5 && p.oppPoss != null && p.min > 0 && p.oppPoss > 0) {
    stlPct = 100 * (p.stl * tmMin5) / (p.min * p.oppPoss);
  }

  let blkPct: number | null = null;
  if (tmMin5 && p.oppFga != null && p.min > 0 && p.oppFga > 0) {
    blkPct = 100 * (p.blk * tmMin5) / (p.min * p.oppFga);
  }

  let rebPct: number | null = null;
  if (tmMin5 && p.teamTrb != null && p.oppTrb != null && p.min > 0) {
    const totalReb = p.teamTrb + p.oppTrb;
    if (totalReb > 0) rebPct = 100 * (p.trb * tmMin5) / (p.min * totalReb);
  }

  // PER — requires league averages, null until connected
  const per: number | null = null;

  // Scoring breakdown
  const pct2pt = p.pts > 0 ? (twoPm * 2) / p.pts * 100 : null;
  const pct3pt = p.pts > 0 ? (p.threePm * 3) / p.pts * 100 : null;
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
    to40: per40(p.tov),
  };
}

/* ------------------------------------------------------------------ */
/* Stat chip definitions                                               */
/* ------------------------------------------------------------------ */

interface DerivedChip {
  key: string;
  label: string;
  decimals: number;
  suffix?: string;
  isPrimary?: boolean;
  sortKey: string;
  defaultDir: "asc" | "desc";
}

const PER_GAME_CHIPS: DerivedChip[] = [
  { key: "mpg", label: "MPG", decimals: 1, sortKey: "mpg", defaultDir: "desc" },
  { key: "ppg", label: "PPG", decimals: 1, sortKey: "ppg", defaultDir: "desc" },
  { key: "rpg", label: "RPG", decimals: 1, sortKey: "rpg", defaultDir: "desc" },
  { key: "apg", label: "APG", decimals: 1, sortKey: "apg", defaultDir: "desc" },
  { key: "spg", label: "SPG", decimals: 1, sortKey: "spg", defaultDir: "desc" },
  { key: "bpg", label: "BPG", decimals: 1, sortKey: "bpg", defaultDir: "desc" },
  { key: "topg", label: "TOPG", decimals: 1, sortKey: "topg", defaultDir: "asc" },
];

const TOTALS_CHIPS: DerivedChip[] = [
  { key: "gp", label: "GP", decimals: 0, sortKey: "gp", defaultDir: "desc" },
  { key: "gs", label: "GS", decimals: 0, sortKey: "gs", defaultDir: "desc" },
  { key: "totalMin", label: "MIN", decimals: 0, sortKey: "total_min", defaultDir: "desc" },
  { key: "totalPts", label: "PTS", decimals: 0, sortKey: "total_pts", defaultDir: "desc" },
  { key: "totalTrb", label: "TRB", decimals: 0, sortKey: "total_trb", defaultDir: "desc" },
  { key: "totalAst", label: "AST", decimals: 0, sortKey: "total_ast", defaultDir: "desc" },
  { key: "totalFgm", label: "FGM", decimals: 0, sortKey: "total_fgm", defaultDir: "desc" },
];

const SHOOTING_CHIPS: DerivedChip[] = [
  { key: "fgPct", label: "FG%", decimals: 1, suffix: "%", sortKey: "fg_pct", defaultDir: "desc" },
  { key: "threePct", label: "3P%", decimals: 1, suffix: "%", sortKey: "three_pct", defaultDir: "desc" },
  { key: "ftPct", label: "FT%", decimals: 1, suffix: "%", sortKey: "ft_pct", defaultDir: "desc" },
  { key: "tsPct", label: "TS%", decimals: 1, suffix: "%", sortKey: "ts_pct", defaultDir: "desc" },
  { key: "efgPct", label: "eFG%", decimals: 1, suffix: "%", sortKey: "efg_pct", defaultDir: "desc" },
  { key: "twoPct", label: "2P%", decimals: 1, suffix: "%", sortKey: "two_pct", defaultDir: "desc" },
  { key: "threeParRate", label: "3PAr", decimals: 1, suffix: "%", sortKey: "three_par", defaultDir: "desc" },
];

const ADVANCED_CHIPS: DerivedChip[] = [
  { key: "astPct", label: "AST%", decimals: 1, suffix: "%", sortKey: "ast_pct", defaultDir: "desc" },
  { key: "usgPct", label: "USG%", decimals: 1, suffix: "%", sortKey: "usg_pct", defaultDir: "desc" },
  { key: "tovPct", label: "TOV%", decimals: 1, suffix: "%", sortKey: "tov_pct", defaultDir: "asc" },
  { key: "stlPct", label: "STL%", decimals: 1, suffix: "%", sortKey: "stl_pct", defaultDir: "desc" },
  { key: "blkPct", label: "BLK%", decimals: 1, suffix: "%", sortKey: "blk_pct", defaultDir: "desc" },
  { key: "rebPct", label: "REB%", decimals: 1, suffix: "%", sortKey: "reb_pct", defaultDir: "desc" },
  { key: "per", label: "PER", decimals: 1, sortKey: "per", defaultDir: "desc" },
];

const SCORING_CHIPS: DerivedChip[] = [
  { key: "pct2pt", label: "%2PT", decimals: 1, suffix: "%", sortKey: "pct_2pt", defaultDir: "desc" },
  { key: "pct3pt", label: "%3PT", decimals: 1, suffix: "%", sortKey: "pct_3pt", defaultDir: "desc" },
  { key: "pctFt", label: "%FT", decimals: 1, suffix: "%", sortKey: "pct_ft", defaultDir: "desc" },
  { key: "ftRate", label: "FTr", decimals: 1, suffix: "%", sortKey: "ft_rate", defaultDir: "desc" },
  { key: "ptsFga", label: "PTS/FGA", decimals: 2, sortKey: "pts_fga", defaultDir: "desc" },
  { key: "ppp", label: "PPP", decimals: 2, sortKey: "ppp", defaultDir: "desc" },
];

const PER40_CHIPS: DerivedChip[] = [
  { key: "pts40", label: "PTS/40", decimals: 1, sortKey: "pts_40", defaultDir: "desc" },
  { key: "reb40", label: "REB/40", decimals: 1, sortKey: "reb_40", defaultDir: "desc" },
  { key: "ast40", label: "AST/40", decimals: 1, sortKey: "ast_40", defaultDir: "desc" },
  { key: "stl40", label: "STL/40", decimals: 1, sortKey: "stl_40", defaultDir: "desc" },
  { key: "blk40", label: "BLK/40", decimals: 1, sortKey: "blk_40", defaultDir: "desc" },
  { key: "to40", label: "TO/40", decimals: 1, sortKey: "to_40", defaultDir: "asc" },
];

// KaNeXT view: show per-game stats until KR engine is re-run
const KANEXT_CHIPS: DerivedChip[] = [
  { key: "ppg", label: "PPG", decimals: 1, isPrimary: true, sortKey: "ppg", defaultDir: "desc" },
  { key: "rpg", label: "RPG", decimals: 1, sortKey: "rpg", defaultDir: "desc" },
  { key: "apg", label: "APG", decimals: 1, sortKey: "apg", defaultDir: "desc" },
  { key: "spg", label: "SPG", decimals: 1, sortKey: "spg", defaultDir: "desc" },
  { key: "bpg", label: "BPG", decimals: 1, sortKey: "bpg", defaultDir: "desc" },
  { key: "fgPct", label: "FG%", decimals: 1, suffix: "%", sortKey: "fg_pct", defaultDir: "desc" },
  { key: "threePct", label: "3P%", decimals: 1, suffix: "%", sortKey: "three_pct", defaultDir: "desc" },
];

/* ------------------------------------------------------------------ */
/* Format helpers                                                      */
/* ------------------------------------------------------------------ */

function fmtDerived(val: number | null, decimals: number, suffix?: string): string {
  if (val == null) return "\u2014";
  return `${val.toFixed(decimals)}${suffix ?? ""}`;
}

/* ------------------------------------------------------------------ */
/* API fetch helper                                                    */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 50;

function buildApiUrl(
  search: string,
  filters: AppliedFilters,
  limit: number,
  offset: number,
): string {
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

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_FILTERS: AppliedFilters = {
  levelKey: null,
  teamIds: [],
  positions: [],
  archetypes: [],
  sort: DEFAULT_KANEXT_SORT,
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({ ...DEFAULT_FILTERS });
  const [statView, setStatView] = useState<StatView>("kanext");
  const [traditionalMode, setTraditionalMode] = useState<TraditionalMode>("per_game");

  const [players, setPlayers] = useState<Player[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const fetchRef = useRef(0);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch players when filters/search change (reset to page 1)
  useEffect(() => {
    const id = ++fetchRef.current;
    setLoading(true);

    fetch(buildApiUrl(debouncedSearch, appliedFilters, PAGE_SIZE, 0))
      .then((r) => r.json())
      .then((data) => {
        if (id !== fetchRef.current) return; // stale
        setPlayers(data.players);
        setTotal(data.total);
      })
      .finally(() => {
        if (id === fetchRef.current) setLoading(false);
      });
  }, [debouncedSearch, appliedFilters]);

  // Load more
  const loadMore = useCallback(() => {
    setLoadingMore(true);
    const id = ++fetchRef.current;

    fetch(buildApiUrl(debouncedSearch, appliedFilters, PAGE_SIZE, players.length))
      .then((r) => r.json())
      .then((data) => {
        if (id !== fetchRef.current) return;
        setPlayers((prev) => [...prev, ...data.players]);
        setTotal(data.total);
      })
      .finally(() => {
        if (id === fetchRef.current) setLoadingMore(false);
      });
  }, [debouncedSearch, appliedFilters, players.length]);

  const hasActiveFilters =
    appliedFilters.levelKey !== null ||
    appliedFilters.teamIds.length > 0 ||
    appliedFilters.positions.length > 0 ||
    appliedFilters.archetypes.length > 0;

  const switchView = (view: StatView) => {
    setStatView(view);
    const defaultSort = view === "traditional" ? DEFAULT_TRADITIONAL_SORT : DEFAULT_KANEXT_SORT;
    setAppliedFilters((prev) => ({ ...prev, sort: defaultSort }));
  };

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    const defaultSort = statView === "traditional" ? DEFAULT_TRADITIONAL_SORT : DEFAULT_KANEXT_SORT;
    setAppliedFilters({ ...DEFAULT_FILTERS, sort: defaultSort });
  };

  const handleChipSort = useCallback((chip: DerivedChip) => {
    setAppliedFilters((prev) => {
      if (prev.sort.key === chip.sortKey) {
        // Toggle direction
        return {
          ...prev,
          sort: { key: chip.sortKey, direction: prev.sort.direction === "desc" ? "asc" : "desc" },
        };
      }
      return { ...prev, sort: { key: chip.sortKey, direction: chip.defaultDir } };
    });
  }, []);

  const tradChipMap: Record<TraditionalMode, DerivedChip[]> = {
    per_game: PER_GAME_CHIPS,
    totals: TOTALS_CHIPS,
    shooting: SHOOTING_CHIPS,
    advanced: ADVANCED_CHIPS,
    scoring: SCORING_CHIPS,
    per40: PER40_CHIPS,
  };
  const tradChips = tradChipMap[traditionalMode];

  const hasMore = players.length < total;

  return (
    <>
      {/* Hero */}
      <div className="bg-[#0a0a0a] text-white">
        <div className="max-w-[900px] mx-auto px-4 pt-12 pb-10 flex flex-col items-center text-center">
          <div className="text-4xl sm:text-5xl font-black tracking-tight mb-2">
            KANEXT
          </div>
          <div className="text-lg sm:text-xl font-bold tracking-widest text-white/70 mb-8">
            PLAYER POOL
          </div>

          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wide mb-3">
            Men&apos;s Basketball Ratings
          </h1>
          <p className="text-white/60 text-base mb-8 max-w-lg">
            Check out every player rating in the KaNeXT Player Pool.
          </p>

          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Player"
              className="w-full h-12 pl-4 pr-12 text-base bg-white/10 border border-white/20 rounded-full text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
            />
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter strip */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-[900px] mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          {/* Filter button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider rounded transition-colors ${
              hasActiveFilters
                ? "bg-slate-900 text-white ring-2 ring-slate-400 ring-offset-1"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            Filter
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-white" />
            )}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </button>

          {/* Results count */}
          <span className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {players.length.toLocaleString()}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900">
              {total.toLocaleString()}
            </span>{" "}
            {total === 1 ? "result" : "results"}
          </span>

          {/* Reset */}
          <button
            onClick={resetFilters}
            className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            Reset all
          </button>
        </div>

        {/* Active filter summary chips */}
        {hasActiveFilters && (
          <div className="max-w-[900px] mx-auto px-4 pb-3 flex flex-wrap gap-2">
            {appliedFilters.levelKey && (
              <span className="px-2.5 py-1 bg-slate-100 text-xs font-semibold text-slate-700 rounded-full">
                {appliedFilters.levelKey.replace("_", " ").toUpperCase()}
              </span>
            )}
            {appliedFilters.teamIds.length > 0 && (
              <span className="px-2.5 py-1 bg-slate-100 text-xs font-semibold text-slate-700 rounded-full">
                {appliedFilters.teamIds.length} team{appliedFilters.teamIds.length !== 1 ? "s" : ""}
              </span>
            )}
            {appliedFilters.positions.length > 0 && (
              <span className="px-2.5 py-1 bg-slate-100 text-xs font-semibold text-slate-700 rounded-full">
                {appliedFilters.positions.join(", ")}
              </span>
            )}
            {appliedFilters.archetypes.length > 0 && (
              <span className="px-2.5 py-1 bg-slate-100 text-xs font-semibold text-slate-700 rounded-full">
                {appliedFilters.archetypes.length} archetype{appliedFilters.archetypes.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Player list */}
      <div className="max-w-[900px] mx-auto px-4 py-6">
        {/* Section header */}
        <div className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 border-b-2 border-slate-900 pb-2 inline-block">
          Player
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white border border-slate-200 rounded-lg px-6 py-12 text-center text-slate-400">
              Loading players...
            </div>
          ) : players.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg px-6 py-12 text-center text-slate-400">
              No players match the current filters.
            </div>
          ) : (
            players.map((player) => {
              const derived = computeDerived(player);
              return (
                <div
                  key={player.id}
                  className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Identity strip */}
                  <div className="flex items-center gap-4 px-5 py-4">
                    <Link href={`/players/${player.id}`} className="flex items-center gap-4 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center shrink-0 overflow-hidden">
                        {player.teamSlug?.startsWith("espn-") ? (
                          <>
                            <img
                              src={`https://a.espncdn.com/i/teamlogos/ncaa/500/${player.teamSlug.replace("espn-", "")}.png`}
                              alt={player.teamAbbr}
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.style.display = "none";
                                const fallback = img.nextElementSibling as HTMLElement | null;
                                if (fallback) fallback.style.display = "";
                              }}
                            />
                            <span className="text-xs font-black text-white tracking-tight" style={{ display: "none" }}>
                              {player.teamAbbr.substring(0, 3)}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-black text-white tracking-tight">
                            {player.teamAbbr.substring(0, 3)}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-[15px] text-slate-900 truncate">
                        {player.name}
                      </span>
                    </Link>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline px-2 py-0.5 rounded bg-slate-100 text-[11px] font-bold text-slate-500 uppercase">
                        {player.teamAbbr}
                      </span>
                      {player.confAbbr && (
                        <span className="hidden sm:inline px-2 py-0.5 rounded bg-slate-100 text-[11px] font-bold text-slate-500 uppercase">
                          {player.confAbbr}
                        </span>
                      )}
                      {player.position && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-bold text-slate-700 uppercase">
                          {player.position}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats strip */}
                  <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
                    <div className="flex items-end">
                      {statView === "kanext" ? (
                        /* KaNeXT chips — per-game stats until KR is re-computed */
                        KANEXT_CHIPS.map((chip) => {
                          const val = derived[chip.key as keyof typeof derived] as number | null;
                          const isPrimary = chip.isPrimary === true;
                          const isActive = appliedFilters.sort.key === chip.sortKey;
                          const arrow = isActive ? (appliedFilters.sort.direction === "desc" ? " \u2193" : " \u2191") : "";
                          return (
                            <button
                              key={chip.key}
                              type="button"
                              onClick={() => handleChipSort(chip)}
                              className={`flex flex-col items-center flex-1 cursor-pointer transition-colors ${
                                isPrimary
                                  ? "border-r border-slate-200 mr-2 pr-2"
                                  : ""
                              } ${isActive ? "bg-slate-100 rounded-md -mx-0.5 px-0.5" : ""}`}
                            >
                              <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                                isActive ? "text-slate-900 underline underline-offset-2" : "text-slate-400"
                              }`}>
                                {chip.label}{arrow}
                              </span>
                              <span
                                className={`font-black tabular-nums ${
                                  isPrimary
                                    ? "text-2xl sm:text-3xl text-slate-900"
                                    : isActive
                                      ? "text-base sm:text-lg text-slate-900"
                                      : "text-base sm:text-lg text-slate-700"
                                }`}
                              >
                                {fmtDerived(val, chip.decimals, chip.suffix)}
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        /* Traditional chips */
                        tradChips.map((chip, i) => {
                          const val = derived[chip.key as keyof typeof derived] as number | null;
                          const isLast = i === tradChips.length - 1;
                          const isActive = appliedFilters.sort.key === chip.sortKey;
                          const arrow = isActive ? (appliedFilters.sort.direction === "desc" ? " \u2193" : " \u2191") : "";
                          return (
                            <button
                              key={chip.key}
                              type="button"
                              onClick={() => handleChipSort(chip)}
                              className={`flex flex-col items-center flex-1 cursor-pointer transition-colors ${
                                !isLast ? "border-r border-slate-200" : ""
                              } ${isActive ? "bg-slate-100 rounded-md -mx-0.5 px-0.5" : ""}`}
                            >
                              <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                                isActive ? "text-slate-900 underline underline-offset-2" : "text-slate-400"
                              }`}>
                                {chip.label}{arrow}
                              </span>
                              <span className={`text-base sm:text-lg font-black tabular-nums ${
                                isActive ? "text-slate-900" : "text-slate-700"
                              }`}>
                                {fmtDerived(val, chip.decimals, chip.suffix)}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Load More */}
        {!loading && hasMore && (
          <div className="mt-6 text-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-8 py-3 bg-slate-900 text-white text-sm font-bold uppercase tracking-wider rounded hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        appliedFilters={appliedFilters}
        onApply={setAppliedFilters}
        statView={statView}
        onSwitchView={switchView}
        traditionalMode={traditionalMode}
        onSwitchTraditionalMode={setTraditionalMode}
      />
    </>
  );
}
