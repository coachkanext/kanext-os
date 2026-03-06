"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface PlayerTeam {
  id: string;
  name: string;
  slug: string | null;
  levelKey: string;
  levelName: string;
  conference: string | null;
  confAbbr: string | null;
}

interface PlayerKR {
  finalKr: number | null;
  baseKr: number | null;
  archetype: string | null;
  allArchetypes: string[];
  confidence: number;
  riskPenalty: number;
  riskKeys: string[];
  badgeBoost: number;
  overrideBoost: number;
  overrideKey: string | null;
  krLevelKey: string | null;
}

interface ClusterData {
  score: number | null;
  confidence: number;
  scoredTraits: number;
  totalTraits: number;
}

interface TraitData {
  score: number | null;
  status: string;
  cluster: string;
}

interface PlayerStats {
  gp: number | null;
  gs: number | null;
  mpg: number | null;
  ppg: number | null;
  rpg: number | null;
  apg: number | null;
  spg: number | null;
  bpg: number | null;
  topg: number | null;
  fgPct: number | null;
  threePct: number | null;
  ftPct: number | null;
  orebPg: number | null;
  drebPg: number | null;
  fgaPg: number | null;
  threePaPg: number | null;
  ftaPg: number | null;
  pfPg: number | null;
  usageRate: number | null;
}

interface PlayerTotals {
  gp: number | null;
  gs: number | null;
  min: number | null;
  fgm: number | null;
  fga: number | null;
  threePm: number | null;
  threePa: number | null;
  ftm: number | null;
  fta: number | null;
  pts: number | null;
  orb: number | null;
  drb: number | null;
  trb: number | null;
  ast: number | null;
  tov: number | null;
  stl: number | null;
  blk: number | null;
  pf: number | null;
}

interface TeamStats {
  min: number | null;
  fgm: number | null;
  fga: number | null;
  fta: number | null;
  tov: number | null;
  trb: number | null;
  oppFga: number | null;
  oppTrb: number | null;
}

interface Badge {
  key: string;
  name: string;
  tier: string;
  effect: number;
  component: string;
  group: string | null;
}

interface Risk {
  key: string;
  name: string;
  type: string;
  penalty: number;
  triggers: Record<string, unknown> | null;
}

interface PlayerData {
  id: string;
  name: string;
  position: string | null;
  height: number | null;
  weight: number | null;
  classYear: string | null;
  hometown: string | null;
  highSchool: string | null;
  jerseyNumber: string | null;
  team: PlayerTeam;
  kr: PlayerKR;
  clusters: Record<string, ClusterData>;
  traits: Record<string, TraitData>;
  stats: PlayerStats;
  totals: PlayerTotals;
  teamStats: TeamStats;
  badges: Badge[];
  risks: Risk[];
}

interface SimilarPlayer {
  id: string;
  name: string;
  position: string;
  team: string;
  kr: number;
}

interface SimilarData {
  byPosition: SimilarPlayer[];
  byTeam: SimilarPlayer[];
}

type StatView = "kanext" | "traditional";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const CLUSTER_ORDER = [
  "shooting",
  "finishing",
  "playmaking",
  "on_ball_defense",
  "team_defense",
  "rebounding",
  "frame",
] as const;

const CLUSTER_LABELS: Record<string, string> = {
  shooting: "Shooting",
  finishing: "Finishing",
  playmaking: "Playmaking",
  on_ball_defense: "POA Defense",
  team_defense: "Team Defense",
  rebounding: "Rebounding",
  frame: "Tools",
};

const TRAIT_LABELS: Record<string, string> = {
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
  power_through_contact: "Power / Contact",
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function scoreColor(score: number | null): string {
  if (score == null) return "#cbd5e1";
  if (score >= 90) return "#22c55e";
  if (score >= 80) return "#84cc16";
  if (score >= 70) return "#eab308";
  if (score >= 60) return "#f97316";
  if (score >= 50) return "#ea580c";
  return "#ef4444";
}

function krColor(kr: number | null): string {
  if (kr == null) return "text-slate-400";
  if (kr >= 75) return "text-emerald-400";
  if (kr >= 65) return "text-lime-400";
  if (kr >= 55) return "text-yellow-400";
  if (kr >= 45) return "text-orange-400";
  return "text-red-400";
}

function fmtHeight(inches: number | null): string {
  if (inches == null) return "\u2014";
  const ft = Math.floor(inches / 12);
  const rem = inches % 12;
  return `${ft}'${rem}"`;
}

function fmtPct(v: number | null, dec = 1): string {
  if (v == null) return "\u2014";
  return `${(v * 100).toFixed(dec)}%`;
}

function fmtStat(v: number | null, dec = 1): string {
  if (v == null) return "\u2014";
  return v.toFixed(dec);
}

function fmtInt(v: number | null): string {
  if (v == null) return "\u2014";
  return String(Math.round(v));
}

function safeDiv(a: number | null, b: number | null): number | null {
  if (a == null || b == null || b === 0) return null;
  return a / b;
}

function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length <= 1) return { first: "", last: full };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function formatArchetype(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ------------------------------------------------------------------ */
/* Traditional derived stats (mirrors page.tsx computeDerived)          */
/* ------------------------------------------------------------------ */

interface DerivedStat {
  label: string;
  value: string;
}

function computeTraditional(
  t: PlayerTotals,
  ts: TeamStats
): { perGame: DerivedStat[]; totals: DerivedStat[]; shooting: DerivedStat[]; advanced: DerivedStat[]; scoring: DerivedStat[]; per40: DerivedStat[] } {
  const gp = t.gp ?? 0;
  const min = t.min ?? 0;
  const pg = (v: number | null) => (v != null && gp > 0 ? v / gp : null);
  const p40 = (v: number | null) => (v != null && min > 0 ? (v / min) * 40 : null);

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

  let usgPct: number | null = null;
  if (tmMin5 && min > 0 && teamPoss > 0) {
    usgPct = (playerPoss * tmMin5) / (min * teamPoss);
  }

  let astPct: number | null = null;
  if (tmMin5 && ts.fgm && min > 0) {
    const tmFgOn = (min / tmMin5) * ts.fgm;
    const denom = tmFgOn - (t.fgm ?? 0);
    if (denom > 0) astPct = (t.ast ?? 0) / denom;
  }

  const tovPct = playerPoss > 0 ? (t.tov ?? 0) / playerPoss : null;
  const ftRate = safeDiv(t.fta, t.fga);

  const pts = t.pts ?? 0;
  const pct2pt = pts > 0 ? (twoPm * 2) / pts : null;
  const pct3pt = pts > 0 ? ((t.threePm ?? 0) * 3) / pts : null;
  const pctFt = pts > 0 ? (t.ftm ?? 0) / pts : null;
  const ptsFga = safeDiv(t.pts, t.fga);
  const ppp = playerPoss > 0 ? pts / playerPoss : null;

  return {
    perGame: [
      { label: "MPG", value: fmtStat(pg(t.min)) },
      { label: "PPG", value: fmtStat(pg(t.pts)) },
      { label: "RPG", value: fmtStat(pg(t.trb)) },
      { label: "APG", value: fmtStat(pg(t.ast)) },
      { label: "SPG", value: fmtStat(pg(t.stl)) },
      { label: "BPG", value: fmtStat(pg(t.blk)) },
      { label: "TOPG", value: fmtStat(pg(t.tov)) },
    ],
    totals: [
      { label: "GP", value: fmtInt(t.gp) },
      { label: "GS", value: fmtInt(t.gs) },
      { label: "MIN", value: fmtInt(t.min) },
      { label: "PTS", value: fmtInt(t.pts) },
      { label: "TRB", value: fmtInt(t.trb) },
      { label: "AST", value: fmtInt(t.ast) },
      { label: "FGM", value: fmtInt(t.fgm) },
    ],
    shooting: [
      { label: "FG%", value: fmtPct(fgPct) },
      { label: "3P%", value: fmtPct(threePct) },
      { label: "FT%", value: fmtPct(ftPct) },
      { label: "TS%", value: fmtPct(tsPct) },
      { label: "eFG%", value: fmtPct(efgPct) },
      { label: "2P%", value: fmtPct(twoPct) },
      { label: "3PAr", value: fmtPct(threeParRate) },
    ],
    advanced: [
      { label: "AST%", value: fmtPct(astPct) },
      { label: "USG%", value: fmtPct(usgPct) },
      { label: "TOV%", value: fmtPct(tovPct) },
      { label: "FTr", value: fmtPct(ftRate) },
    ],
    scoring: [
      { label: "%2PT", value: fmtPct(pct2pt) },
      { label: "%3PT", value: fmtPct(pct3pt) },
      { label: "%FT", value: fmtPct(pctFt) },
      { label: "PTS/FGA", value: fmtStat(ptsFga, 2) },
      { label: "PPP", value: fmtStat(ppp, 2) },
    ],
    per40: [
      { label: "PTS/40", value: fmtStat(p40(t.pts)) },
      { label: "REB/40", value: fmtStat(p40(t.trb)) },
      { label: "AST/40", value: fmtStat(p40(t.ast)) },
      { label: "STL/40", value: fmtStat(p40(t.stl)) },
      { label: "BLK/40", value: fmtStat(p40(t.blk)) },
      { label: "TO/40", value: fmtStat(p40(t.tov)) },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function TraitRow({ label, score, status }: { label: string; score: number | null; status: string }) {
  const isScored = status === "SCORED" && score != null;
  const color = scoreColor(isScored ? score : null);
  const pct = isScored ? Math.min(score, 100) : 0;

  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-xs text-slate-400 w-[120px] shrink-0 truncate" title={label}>
        {label}
      </span>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="text-xs font-bold w-8 text-right tabular-nums"
        style={{ color }}
      >
        {isScored ? score : "\u2014"}
      </span>
    </div>
  );
}

function ClusterCard({
  clusterKey,
  cluster,
  traits,
  allTraits,
}: {
  clusterKey: string;
  cluster: ClusterData | undefined;
  traits: { key: string; label: string; score: number | null; status: string }[];
  allTraits: Record<string, TraitData>;
}) {
  const label = CLUSTER_LABELS[clusterKey] || clusterKey;
  const clusterScore = cluster?.score;

  return (
    <div className="bg-[#111] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-black uppercase tracking-wider text-white">
          {label}
        </h4>
        {clusterScore != null && (
          <span
            className="text-lg font-black tabular-nums"
            style={{ color: scoreColor(clusterScore) }}
          >
            {clusterScore}
          </span>
        )}
      </div>
      <div>
        {traits.map((t) => (
          <TraitRow key={t.key} label={t.label} score={t.score} status={t.status} />
        ))}
      </div>
      {cluster && (
        <div className="mt-2 text-[10px] text-slate-500">
          {cluster.scoredTraits}/{cluster.totalTraits} traits scored
        </div>
      )}
    </div>
  );
}

function TradCategory({ title, stats }: { title: string; stats: DerivedStat[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-3">
        {title}
      </h4>
      <div>
        {stats.map((s) => (
          <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
            <span className="text-xs font-medium text-slate-500">{s.label}</span>
            <span className="text-sm font-bold tabular-nums text-slate-900">
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimilarPlayerCard({ player }: { player: SimilarPlayer }) {
  return (
    <Link
      href={`/players/${player.id}`}
      className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
    >
      <span
        className={`text-lg font-black tabular-nums w-10 text-center ${krColor(player.kr)}`}
      >
        {player.kr.toFixed(0)}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-slate-900 truncate">
          {player.name}
        </div>
        <div className="text-xs text-slate-500 truncate">
          {player.team}
        </div>
      </div>
      <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
        {player.position}
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Main Page                                                           */
/* ------------------------------------------------------------------ */

export default function PlayerPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [similar, setSimilar] = useState<SimilarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statView, setStatView] = useState<StatView>("kanext");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/players/${id}`).then((r) => {
        if (!r.ok) throw new Error("Player not found");
        return r.json();
      }),
      fetch(`/api/players/${id}/similar`).then((r) => r.json()),
    ])
      .then(([pData, sData]) => {
        setPlayer(pData.player);
        setSimilar(sData);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-[900px] mx-auto px-4 py-20 text-center">
        <div className="text-slate-400 text-sm">Loading player...</div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="max-w-[900px] mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wide mb-2">
          Player Not Found
        </h1>
        <p className="text-slate-400 text-sm mb-6">{error || "Unknown error"}</p>
        <Link
          href="/"
          className="text-sm font-bold text-slate-900 hover:underline"
        >
          &larr; Back to Player Pool
        </Link>
      </div>
    );
  }

  const { first, last } = splitName(player.name);
  const kr = player.kr.finalKr;
  const trad = computeTraditional(player.totals, player.teamStats);

  // Build traits per cluster from DB data
  const traitsByCluster: Record<
    string,
    { key: string; label: string; score: number | null; status: string }[]
  > = {};
  for (const [key, trait] of Object.entries(player.traits)) {
    const cl = trait.cluster;
    if (!traitsByCluster[cl]) traitsByCluster[cl] = [];
    traitsByCluster[cl].push({
      key,
      label: TRAIT_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      score: trait.score,
      status: trait.status,
    });
  }
  // Sort traits within each cluster: scored first, then alphabetical
  for (const cl of Object.keys(traitsByCluster)) {
    traitsByCluster[cl].sort((a, b) => {
      if (a.status === "SCORED" && b.status !== "SCORED") return -1;
      if (a.status !== "SCORED" && b.status === "SCORED") return 1;
      return a.label.localeCompare(b.label);
    });
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[900px] mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <Link href="/" className="text-slate-400 hover:text-slate-900 transition-colors">
              Home
            </Link>
            <span className="text-slate-300">&gt;</span>
            <span className="text-slate-900">{player.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Card */}
      <div className="bg-[#0a0a0a] text-white">
        <div className="max-w-[900px] mx-auto px-4 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
            {/* Left — KR Score */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-3">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white/20 text-xl font-black">
                  {player.team.slug ? (
                    <img
                      src={`https://a.espncdn.com/i/teamlogos/ncaa/500/${player.team.slug.replace("espn-", "")}.png`}
                      alt={player.team.name}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    player.team.name.charAt(0)
                  )}
                </div>
              </div>
              <div
                className="text-5xl sm:text-6xl font-black tabular-nums leading-none"
                style={{ color: scoreColor(kr) }}
              >
                {kr != null ? kr.toFixed(0) : "\u2014"}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">
                KR Rating
              </div>
              <div className="text-xs text-white/50 mt-2">
                {player.team.levelName}
              </div>
              {player.kr.archetype && (
                <div className="mt-1 px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold uppercase tracking-wider text-white/70">
                  {formatArchetype(player.kr.archetype)}
                </div>
              )}
            </div>

            {/* Right — Player Info */}
            <div className="flex-1 text-center sm:text-left">
              {first && (
                <div className="text-base sm:text-lg font-medium text-white/60 uppercase tracking-wider leading-tight">
                  {first}
                </div>
              )}
              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-none mb-4">
                {last}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                {player.position && (
                  <span className="px-3 py-1 rounded bg-white/15 text-xs font-black uppercase tracking-wider">
                    {player.position}
                  </span>
                )}
                <span className="text-sm text-white/60">
                  {player.team.name}
                </span>
                {player.team.conference && (
                  <>
                    <span className="text-white/20">|</span>
                    <span className="text-sm text-white/40">
                      {player.team.conference}
                    </span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-sm">
                {player.height != null && (
                  <div>
                    <span className="text-white/40 mr-1">HT</span>
                    <span className="font-bold">{fmtHeight(player.height)}</span>
                  </div>
                )}
                {player.weight != null && (
                  <div>
                    <span className="text-white/40 mr-1">WT</span>
                    <span className="font-bold">{player.weight} lbs</span>
                  </div>
                )}
                {player.classYear && (
                  <div>
                    <span className="text-white/40 mr-1">CLASS</span>
                    <span className="font-bold">{player.classYear}</span>
                  </div>
                )}
                {player.jerseyNumber && (
                  <div>
                    <span className="text-white/40 mr-1">#</span>
                    <span className="font-bold">{player.jerseyNumber}</span>
                  </div>
                )}
              </div>

              {/* Quick stats */}
              {player.stats.ppg != null && (
                <div className="flex flex-wrap items-end justify-center sm:justify-start gap-6 mt-6 pt-4 border-t border-white/10">
                  {[
                    { label: "PPG", value: fmtStat(player.stats.ppg) },
                    { label: "RPG", value: fmtStat(player.stats.rpg) },
                    { label: "APG", value: fmtStat(player.stats.apg) },
                    { label: "FG%", value: player.stats.fgPct != null ? `${(player.stats.fgPct * 100).toFixed(1)}%` : "\u2014" },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <div className="text-xl sm:text-2xl font-black tabular-nums">
                        {s.value}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[900px] mx-auto px-4 py-3 flex items-center gap-1">
          <button
            onClick={() => setStatView("kanext")}
            className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded transition-colors ${
              statView === "kanext"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            KaNeXT
          </button>
          <button
            onClick={() => setStatView("traditional")}
            className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded transition-colors ${
              statView === "traditional"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            Traditional
          </button>
        </div>
      </div>

      {/* Stat Grid */}
      <div className="max-w-[900px] mx-auto px-4 py-6">
        {statView === "kanext" ? (
          /* KaNeXT Stat Grid — 3 columns of cluster cards */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1 */}
            <div className="space-y-4">
              {(["shooting", "finishing", "playmaking"] as const).map((ck) => (
                <ClusterCard
                  key={ck}
                  clusterKey={ck}
                  cluster={player.clusters[ck]}
                  traits={traitsByCluster[ck] || []}
                  allTraits={player.traits}
                />
              ))}
            </div>
            {/* Column 2 */}
            <div className="space-y-4">
              {(["on_ball_defense", "team_defense", "rebounding"] as const).map((ck) => (
                <ClusterCard
                  key={ck}
                  clusterKey={ck}
                  cluster={player.clusters[ck]}
                  traits={traitsByCluster[ck] || []}
                  allTraits={player.traits}
                />
              ))}
            </div>
            {/* Column 3 */}
            <div className="space-y-4">
              {(["frame"] as const).map((ck) => (
                <ClusterCard
                  key={ck}
                  clusterKey={ck}
                  cluster={player.clusters[ck]}
                  traits={traitsByCluster[ck] || []}
                  allTraits={player.traits}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Traditional Stat Grid — 3 columns of stat categories */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-4">
              <TradCategory title="Per Game" stats={trad.perGame} />
              <TradCategory title="Totals" stats={trad.totals} />
            </div>
            <div className="space-y-4">
              <TradCategory title="Shooting" stats={trad.shooting} />
              <TradCategory title="Advanced" stats={trad.advanced} />
            </div>
            <div className="space-y-4">
              <TradCategory title="Scoring" stats={trad.scoring} />
              <TradCategory title="Per 40" stats={trad.per40} />
            </div>
          </div>
        )}
      </div>

      {/* Player Info Card */}
      <div className="max-w-[900px] mx-auto px-4 pb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4 border-b-2 border-slate-900 pb-2 inline-block">
            Player Info
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Jersey", value: player.jerseyNumber ? `#${player.jerseyNumber}` : "\u2014" },
              { label: "Class", value: player.classYear || "\u2014" },
              { label: "Hometown", value: player.hometown || "\u2014" },
              { label: "High School", value: player.highSchool || "\u2014" },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  {item.label}
                </div>
                <div className="text-sm font-bold text-slate-900">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KR Intelligence Section */}
      {statView === "kanext" && (
        <div className="max-w-[900px] mx-auto px-4 pb-6">
          <div className="bg-[#0a0a0a] rounded-lg p-5 text-white">
            <h3 className="text-xs font-black uppercase tracking-widest mb-5 border-b border-white/10 pb-2 inline-block">
              KR Intelligence
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Archetype */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                  Archetype
                </div>
                {player.kr.archetype ? (
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded bg-white/15 text-sm font-bold">
                      {formatArchetype(player.kr.archetype)}
                    </span>
                    {player.kr.allArchetypes
                      .filter((a) => a !== player.kr.archetype)
                      .map((a) => (
                        <span
                          key={a}
                          className="px-2 py-0.5 rounded bg-white/5 text-xs text-white/50"
                        >
                          {formatArchetype(a)}
                        </span>
                      ))}
                  </div>
                ) : (
                  <span className="text-sm text-white/30">Not assigned</span>
                )}
              </div>

              {/* Confidence */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                  Confidence
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white/60 transition-all"
                      style={{ width: `${player.kr.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold tabular-nums w-12 text-right">
                    {player.kr.confidence}%
                  </span>
                </div>
              </div>

              {/* System Risks */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                  System Risks
                </div>
                {player.risks.length > 0 ? (
                  <div className="space-y-1">
                    {player.risks.map((risk) => (
                      <div key={risk.key} className="flex items-center gap-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            risk.type === "major" ? "bg-red-500" : "bg-yellow-500"
                          }`}
                        />
                        <span className="text-xs text-white/70 flex-1">
                          {risk.name}
                        </span>
                        <span className="text-xs font-bold text-red-400 tabular-nums">
                          {risk.penalty.toFixed(1)}
                        </span>
                      </div>
                    ))}
                    <div className="text-xs text-white/30 mt-1">
                      Total penalty: {player.kr.riskPenalty.toFixed(1)}
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-white/30">No risks flagged</span>
                )}
              </div>

              {/* Badges */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                  Badges
                </div>
                {player.badges.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {player.badges.map((badge) => (
                      <span
                        key={badge.key}
                        className="px-2 py-0.5 rounded bg-white/10 text-xs text-white/70"
                        title={`${badge.tier} — ${badge.effect > 0 ? "+" : ""}${badge.effect}`}
                      >
                        {badge.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-white/30">No badges earned</span>
                )}
              </div>
            </div>

            {/* KR Breakdown */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">
                KR Breakdown
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                <div>
                  <span className="text-white/40 mr-1">Base KR</span>
                  <span className="font-bold tabular-nums">
                    {player.kr.baseKr?.toFixed(1) ?? "\u2014"}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 mr-1">Badge Boost</span>
                  <span className="font-bold tabular-nums text-emerald-400">
                    +{player.kr.badgeBoost.toFixed(1)}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 mr-1">Risk Penalty</span>
                  <span className="font-bold tabular-nums text-red-400">
                    {player.kr.riskPenalty.toFixed(1)}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 mr-1">Override</span>
                  <span className="font-bold tabular-nums text-emerald-400">
                    +{player.kr.overrideBoost.toFixed(1)}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 mr-1">Final KR</span>
                  <span className="font-black tabular-nums" style={{ color: scoreColor(kr) }}>
                    {kr?.toFixed(1) ?? "\u2014"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Similar Players */}
      {similar && (similar.byPosition.length > 0 || similar.byTeam.length > 0) && (
        <div className="max-w-[900px] mx-auto px-4 pb-10">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4 border-b-2 border-slate-900 pb-2 inline-block">
            Similar Players
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {similar.byPosition.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  By Position — {player.position}
                </div>
                {similar.byPosition.map((sp) => (
                  <SimilarPlayerCard key={sp.id} player={sp} />
                ))}
              </div>
            )}
            {similar.byTeam.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  By Team — {player.team.name}
                </div>
                {similar.byTeam.map((sp) => (
                  <SimilarPlayerCard key={sp.id} player={sp} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
