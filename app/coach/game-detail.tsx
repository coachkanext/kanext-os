/**
 * Game Detail Screen
 * Single container for Pregame / Live / Report tabs.
 *
 * Default tab is context-aware:
 * - UPCOMING → Pregame
 * - LIVE → Live
 * - FINAL → Report
 */

import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TabFooter } from '@/components/tab-footer';
import { useIsAuthenticated } from '@/context/auth-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/core';
import { MOCK_ROSTER } from '@/data/mock-roster';
import {
  FMU_GAMES_BY_ID,
  FMU_SCOUTING_NOTES,
  FMU_KEYS_TO_GAME,
  FMU_GAME_STATS,
  FMU_GAME_FLOW,
  FMU_BOX_SCORES,
  FMU_LEADERS,
  FMU_RECORD,
  placeholderRecord,
  isConfGame,
  type BoxScoreLine,
} from '@/data/fmu';
import { triggerGameOps } from '@/utils/global-game-ops';

// ── Game Data ──

type GameStatus = 'upcoming' | 'live' | 'final';

interface GameData {
  opponent: string;
  date: string;
  location: string;
  status: GameStatus;
  score?: string;
  clock?: string;
  streamUrl?: string;
}

const ALL_GAMES: Record<string, GameData> = FMU_GAMES_BY_ID;

type DetailTab = 'prep' | 'live' | 'report' | 'replay';

const TABS: { key: DetailTab; label: string }[] = [
  { key: 'prep', label: 'Pregame' },
  { key: 'live', label: 'Live' },
  { key: 'report', label: 'Report' },
  { key: 'replay', label: 'Watch Replay' },
];

function defaultTab(status: GameStatus): DetailTab {
  switch (status) {
    case 'live': return 'live';
    case 'final': return 'report';
    default: return 'prep';
  }
}

const SCOUTING_NOTES: Record<string, string[]> = FMU_SCOUTING_NOTES;

const DEFAULT_SCOUTING_NOTES = [
  'Scouting notes will be available as game day approaches.',
  'Check back for opponent analysis and top threats.',
];

const KEYS_TO_GAME: Record<string, [string, string, string]> = FMU_KEYS_TO_GAME;

const DEFAULT_KEYS: [string, string, string] = ['Control the tempo', 'Execute the game plan', 'Play tough defense'];

// Game stats from FMU bridge
const GAME_STATS = FMU_GAME_STATS;

// ── Game Flow (score at end of each period) ──
interface ScoreSnapshot { label: string; fmu: number; opp: number }

const GAME_FLOW = FMU_GAME_FLOW;

// ── Box Score (player stat lines) ──
const BOX_SCORE = FMU_BOX_SCORES;


// ── Play-by-Play data (most recent first) ──
type PbpCategory = 'scoring' | 'foul' | 'sub' | 'timeout' | 'other';

interface PlayByPlayEvent {
  id: string;
  team: 'FMU' | string;
  text: string;
  scoreAt: string; // running score at time of event
  category: PbpCategory;
}

const PLAY_BY_PLAY: Record<string, PlayByPlayEvent[]> = {
  '_demo-removed': [
    // Most recent first — Q2 in progress, 4:12 remaining
    { id: 'pbp-28', team: 'CSEB', text: 'CSEB — Made 2PT (Paint)', scoreAt: '34-28', category: 'scoring' },
    { id: 'pbp-27', team: 'LU', text: 'Kalejaiye Made 2PT (Midrange)', scoreAt: '34-26', category: 'scoring' },
    { id: 'pbp-26', team: 'LU', text: 'McKesey Made FT (1 of 1)', scoreAt: '32-26', category: 'scoring' },
    { id: 'pbp-25', team: 'CSEB', text: 'Foul on CSEB — Shooting', scoreAt: '31-26', category: 'foul' },
    { id: 'pbp-24', team: 'CSEB', text: 'CSEB — Made 2PT (Fastbreak)', scoreAt: '31-26', category: 'scoring' },
    { id: 'pbp-23', team: 'LU', text: 'Williams Made 2PT (Layup)', scoreAt: '31-24', category: 'scoring' },
    { id: 'pbp-22', team: 'LU', text: 'SUB — Plantey in, Manzo out', scoreAt: '29-24', category: 'sub' },
    { id: 'pbp-21', team: 'CSEB', text: 'CSEB — Made 2PT (Paint)', scoreAt: '29-24', category: 'scoring' },
    { id: 'pbp-20', team: 'LU', text: 'Kalejaiye Made 3PT', scoreAt: '29-22', category: 'scoring' },
    { id: 'pbp-19', team: 'CSEB', text: 'CSEB — Made 3PT', scoreAt: '26-22', category: 'scoring' },
    { id: 'pbp-18', team: 'LU', text: 'Chtelan Made 2PT (Floater)', scoreAt: '26-19', category: 'scoring' },
    { id: 'pbp-17', team: 'LU', text: 'TIMEOUT — Lincoln', scoreAt: '24-19', category: 'timeout' },
    { id: 'pbp-16', team: 'CSEB', text: 'CSEB — Made 2PT (Layup)', scoreAt: '24-19', category: 'scoring' },
    { id: 'pbp-15', team: 'LU', text: 'McKesey Made 3PT', scoreAt: '24-17', category: 'scoring' },
    { id: 'pbp-14', team: 'CSEB', text: 'CSEB — Made FT (1 of 2)', scoreAt: '21-17', category: 'scoring' },
    { id: 'pbp-13', team: 'LU', text: 'Foul on Diomande — Shooting', scoreAt: '21-16', category: 'foul' },
    { id: 'pbp-12', team: 'LU', text: 'Williams Made 2PT (Driving)', scoreAt: '21-16', category: 'scoring' },
    // ── End of Q1 — LU 19, CSEB 16 ──
    { id: 'pbp-11', team: 'CSEB', text: 'CSEB — Made 2PT (Putback)', scoreAt: '19-16', category: 'scoring' },
    { id: 'pbp-10', team: 'LU', text: 'Kalejaiye Made 2PT (Turnaround)', scoreAt: '19-14', category: 'scoring' },
    { id: 'pbp-09', team: 'CSEB', text: 'CSEB — Made 3PT', scoreAt: '17-14', category: 'scoring' },
    { id: 'pbp-08', team: 'LU', text: 'Diomande Made 2PT (Dunk)', scoreAt: '17-11', category: 'scoring' },
    { id: 'pbp-07', team: 'CSEB', text: 'CSEB — Made 2PT (Floater)', scoreAt: '15-11', category: 'scoring' },
    { id: 'pbp-06', team: 'LU', text: 'Williams Made 3PT', scoreAt: '15-9', category: 'scoring' },
    { id: 'pbp-05', team: 'CSEB', text: 'CSEB — Made 2PT (Layup)', scoreAt: '12-9', category: 'scoring' },
    { id: 'pbp-04', team: 'LU', text: 'Chtelan Made 3PT', scoreAt: '12-7', category: 'scoring' },
    { id: 'pbp-03', team: 'CSEB', text: 'CSEB — Made FT (2 of 2)', scoreAt: '9-7', category: 'scoring' },
    { id: 'pbp-02b', team: 'LU', text: 'Foul on McKesey — Shooting', scoreAt: '9-5', category: 'foul' },
    { id: 'pbp-02', team: 'LU', text: 'McKesey Made 2PT (Midrange)', scoreAt: '9-5', category: 'scoring' },
    { id: 'pbp-01d', team: 'CSEB', text: 'TIMEOUT — CSEB', scoreAt: '7-5', category: 'timeout' },
    { id: 'pbp-01c', team: 'CSEB', text: 'CSEB — Made 3PT', scoreAt: '7-5', category: 'scoring' },
    { id: 'pbp-01b', team: 'LU', text: 'Kalejaiye Made 2PT (Layup)', scoreAt: '7-2', category: 'scoring' },
    { id: 'pbp-01a', team: 'LU', text: 'Williams Made 2PT (Driving)', scoreAt: '5-2', category: 'scoring' },
    { id: 'pbp-00b', team: 'CSEB', text: 'CSEB — Made 2PT (Layup)', scoreAt: '3-2', category: 'scoring' },
    { id: 'pbp-00a', team: 'LU', text: 'Kalejaiye Made 3PT', scoreAt: '3-0', category: 'scoring' },
  ],
};

const PBP_FILTER_OPTIONS: { key: PbpCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'scoring', label: 'Scoring' },
  { key: 'foul', label: 'Fouls' },
  { key: 'sub', label: 'Subs' },
  { key: 'timeout', label: 'Timeouts' },
];

// ── Game Ops → Game Detail Data Converters ──

const LO_SCORING_PTS: Record<string, number> = {
  fg2_make: 2, fg3_make: 3, ft_make: 1,
};

function gameOpsFormatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function gameOpsPeriodLabel(period: number, format: string): string {
  if (format === 'halves') return period === 1 ? '1H' : period === 2 ? '2H' : `OT${period - 2}`;
  return period <= 4 ? `Q${period}` : `OT${period - 4}`;
}

function gameOpsEventToText(evt: any): string {
  const name = evt.playerName || '';
  switch (evt.type) {
    case 'fg2_make': return `${name} Made 2PT`;
    case 'fg2_miss': return `${name} Missed 2PT`;
    case 'fg3_make': return `${name} Made 3PT`;
    case 'fg3_miss': return `${name} Missed 3PT`;
    case 'ft_make': return `${name} Made FT`;
    case 'ft_miss': return `${name} Missed FT`;
    case 'reb_off': return `${name} Off Rebound`;
    case 'reb_def': return `${name} Def Rebound`;
    case 'ast': return `${name} Assist`;
    case 'stl': return `${name} Steal`;
    case 'blk': return `${name} Block`;
    case 'to': return `${name} Turnover`;
    case 'foul_personal': return `${name} Foul`;
    case 'foul_team': return 'Team Foul';
    case 'sub_in': return `Sub: ${name} IN`;
    case 'sub_out': return `Sub: ${name} OUT`;
    case 'timeout_us': return 'Timeout';
    case 'timeout_opp': return 'Timeout';
    default: return evt.type;
  }
}

function gameOpsEventCategory(type: string): PbpCategory {
  if (type.includes('make') || type.includes('miss')) return 'scoring';
  if (type.includes('foul')) return 'foul';
  if (type === 'sub_in' || type === 'sub_out') return 'sub';
  if (type.includes('timeout')) return 'timeout';
  return 'other';
}

function convertGameOpsToPlayByPlay(events: any[], opponentAbbr: string): PlayByPlayEvent[] {
  let luScore = 0;
  let oppScore = 0;
  const pbp: PlayByPlayEvent[] = [];
  for (const evt of events) {
    if (['period_start', 'period_end', 'game_end'].includes(evt.type)) continue;
    const pts = LO_SCORING_PTS[evt.type] ?? 0;
    if (evt.team === 'LU') luScore += pts;
    else oppScore += pts;
    pbp.push({
      id: evt.id,
      team: evt.team === 'LU' ? 'FMU' : opponentAbbr,
      text: gameOpsEventToText(evt),
      scoreAt: `${luScore}-${oppScore}`,
      category: gameOpsEventCategory(evt.type),
    });
  }
  return pbp.reverse();
}

function computeGameOpsTeamStats(events: any[]) {
  let fgm = 0, fga = 0, tpm = 0, tpa = 0, ftm = 0, fta = 0, reb = 0, to = 0;
  for (const evt of events) {
    if (evt.team !== 'LU' || !evt.playerId) continue;
    switch (evt.type) {
      case 'fg2_make': fgm++; fga++; break;
      case 'fg2_miss': fga++; break;
      case 'fg3_make': fgm++; fga++; tpm++; tpa++; break;
      case 'fg3_miss': fga++; tpa++; break;
      case 'ft_make': ftm++; fta++; break;
      case 'ft_miss': fta++; break;
      case 'reb_off': case 'reb_def': reb++; break;
      case 'to': to++; break;
    }
  }
  const fgPct = fga > 0 ? ((fgm / fga) * 100).toFixed(1) : '0.0';
  const tpPct = tpa > 0 ? ((tpm / tpa) * 100).toFixed(1) : '0.0';
  const ftPct = fta > 0 ? ((ftm / fta) * 100).toFixed(1) : '0.0';
  return {
    teamFG: `${fgm}-${fga} (${fgPct}%)`,
    team3P: `${tpm}-${tpa} (${tpPct}%)`,
    teamFT: `${ftm}-${fta} (${ftPct}%)`,
    teamReb: `${reb}`,
    teamTO: `${to}`,
  };
}

function computeGameOpsPlayerStats(events: any[]) {
  const stats: Record<string, { pts: number; reb: number; ast: number; stl: number; blk: number; to: number; pf: number; fgm: number; fga: number; tpm: number; tpa: number; ftm: number; fta: number }> = {};
  for (const evt of events) {
    if (evt.team !== 'LU' || !evt.playerId) continue;
    if (!stats[evt.playerId]) {
      stats[evt.playerId] = { pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0, pf: 0, fgm: 0, fga: 0, tpm: 0, tpa: 0, ftm: 0, fta: 0 };
    }
    const s = stats[evt.playerId];
    switch (evt.type) {
      case 'fg2_make': s.pts += 2; s.fgm++; s.fga++; break;
      case 'fg2_miss': s.fga++; break;
      case 'fg3_make': s.pts += 3; s.fgm++; s.fga++; s.tpm++; s.tpa++; break;
      case 'fg3_miss': s.fga++; s.tpa++; break;
      case 'ft_make': s.pts += 1; s.ftm++; s.fta++; break;
      case 'ft_miss': s.fta++; break;
      case 'reb_off': case 'reb_def': s.reb++; break;
      case 'ast': s.ast++; break;
      case 'stl': s.stl++; break;
      case 'blk': s.blk++; break;
      case 'to': s.to++; break;
      case 'foul_personal': s.pf++; break;
    }
  }
  return stats;
}

const SEASON_LEADERS = [...FMU_LEADERS].sort((a, b) => b.ppg - a.ppg).slice(0, 3).map((l) => {
  const lastName = l.name.split(' ').pop() || l.name;
  return { name: lastName, line: `${l.ppg} ppg, ${l.rpg} rpg, ${l.apg} apg` };
});

// ── NBA-style Box Score column definitions ──
const BOX_COLS: { key: string; label: string; width: number }[] = [
  { key: 'name', label: 'PLAYER', width: 90 },
  { key: 'min', label: 'MIN', width: 40 },
  { key: 'fg', label: 'FG', width: 50 },
  { key: 'threePt', label: '3PT', width: 50 },
  { key: 'ft', label: 'FT', width: 50 },
  { key: 'reb', label: 'REB', width: 38 },
  { key: 'ast', label: 'AST', width: 38 },
  { key: 'stl', label: 'STL', width: 38 },
  { key: 'blk', label: 'BLK', width: 38 },
  { key: 'to', label: 'TO', width: 34 },
  { key: 'pf', label: 'PF', width: 34 },
  { key: 'plusMinus', label: '+/-', width: 38 },
  { key: 'pts', label: 'PTS', width: 38 },
];

function getBoxCellValue(player: BoxScoreLine, key: string): string {
  switch (key) {
    case 'name': return player.name;
    case 'min': return player.min;
    case 'fg': return player.fg;
    case 'threePt': return player.threePt;
    case 'ft': return player.ft;
    case 'reb': return String(player.reb);
    case 'ast': return String(player.ast);
    case 'stl': return String(player.stl);
    case 'blk': return String(player.blk);
    case 'to': return String(player.to);
    case 'pf': return String(player.pf);
    case 'plusMinus': return '—';
    case 'pts': return String(player.pts);
    default: return '—';
  }
}

function sumMadeAtt(lines: BoxScoreLine[], field: 'fg' | 'threePt' | 'ft'): string {
  let m = 0, a = 0;
  for (const l of lines) {
    const parts = l[field].split('-');
    m += parseInt(parts[0]) || 0;
    a += parseInt(parts[1]) || 0;
  }
  return `${m}-${a}`;
}

// Generate mock opponent box score from opponent name + score (deterministic)
function mockBoxScore(teamName: string, teamScore: number, names?: string[]): BoxScoreLine[] {
  let h = 0;
  for (let i = 0; i < teamName.length; i++) h = ((h << 5) - h + teamName.charCodeAt(i)) | 0;
  const seed = (n: number) => { h = ((h << 5) - h + n) | 0; return Math.abs(h); };

  const DEFAULT_NAMES = ['Johnson', 'Williams', 'Davis', 'Brown', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson'];
  const MOCK_NAMES = names ?? DEFAULT_NAMES;
  const count = 8 + (seed(1) % 3); // 8-10 players
  const players: BoxScoreLine[] = [];
  let ptsLeft = teamScore;

  for (let i = 0; i < count; i++) {
    const isStarter = i < 5;
    const min = isStarter ? 25 + (seed(i + 10) % 13) : 8 + (seed(i + 20) % 15);
    const sharePct = isStarter ? 0.15 + (seed(i + 30) % 10) / 100 : 0.04 + (seed(i + 40) % 6) / 100;
    const pts = i < count - 1 ? Math.round(teamScore * sharePct) : Math.max(0, ptsLeft);
    ptsLeft -= pts;
    const fgm = Math.round(pts * 0.38);
    const fga = fgm + 2 + (seed(i + 50) % 5);
    const tpm = Math.round(pts * 0.12);
    const tpa = tpm + (seed(i + 60) % 3);
    const ftm = Math.max(0, pts - fgm * 2 - tpm);
    const fta = ftm + (seed(i + 70) % 2);
    const reb = isStarter ? 3 + (seed(i + 80) % 6) : 1 + (seed(i + 90) % 4);
    const ast = isStarter ? 1 + (seed(i + 100) % 5) : seed(i + 110) % 3;
    const stl = seed(i + 120) % 3;
    const blk = seed(i + 130) % 2;
    const to = seed(i + 140) % 4;
    const pf = seed(i + 150) % 4;
    players.push({
      name: MOCK_NAMES[i % MOCK_NAMES.length],
      min: String(min),
      pts, reb, ast,
      fg: `${fgm}-${fga}`, threePt: `${tpm}-${tpa}`, ft: `${ftm}-${fta}`,
      stl, blk, to, pf,
    });
  }
  return players.sort((a, b) => b.pts - a.pts);
}

interface PbpEntry { time: string; half: '1st' | '2nd'; team: 'fmu' | 'opp'; text: string; score: string; }
function generateMockPbp(opponent: string, fmuScore: number, oppScore: number): PbpEntry[] {
  let h = 0;
  for (let i = 0; i < opponent.length; i++) h = ((h << 5) - h + opponent.charCodeAt(i)) | 0;
  const seed = () => { h = ((h << 5) - h + 0x5bd1e995) | 0; return Math.abs(h) % 1000; };
  const FMU_NAMES = ['Selden', 'Morgan', 'Turner', 'Lewis', 'Carter', 'Noel', 'Thomas'];
  const OPP_NAMES = ['Johnson', 'Williams', 'Davis', 'Brown', 'Wilson', 'Anderson', 'Taylor'];
  const plays = [
    (n: string) => `${n} makes a layup`, (n: string) => `${n} makes a 3-pointer`,
    (n: string) => `${n} misses a jumper`, (n: string) => `${n} makes a free throw`,
    (n: string) => `${n} misses a free throw`, (n: string) => `${n} with a dunk`,
    (n: string) => `Turnover by ${n}`, (n: string) => `${n} steal`,
    (n: string) => `${n} defensive rebound`, (n: string) => `${n} offensive rebound`,
    (n: string) => `Foul on ${n}`, (n: string) => `${n} makes a mid-range jumper`,
    (n: string) => `${n} blocked`, (n: string) => `${n} assist`,
  ];
  const entries: PbpEntry[] = [];
  let fR = 0, oR = 0;
  const total = 80 + (seed() % 30), mid = Math.floor(total / 2);
  for (let i = 0; i < total; i++) {
    const half: '1st' | '2nd' = i < mid ? '1st' : '2nd';
    const minLeft = i < mid ? 20 - Math.floor((i / mid) * 20) : 20 - Math.floor(((i - mid) / (total - mid)) * 20);
    const sec = seed() % 60;
    const isFmu = seed() % 2 === 0;
    const names = isFmu ? FMU_NAMES : OPP_NAMES;
    const name = names[seed() % names.length];
    const tpl = plays[seed() % plays.length];
    const pIdx = seed() % plays.length;
    if (pIdx === 0 || pIdx === 5 || pIdx === 11) { if (isFmu) fR += 2; else oR += 2; }
    else if (pIdx === 1) { if (isFmu) fR += 3; else oR += 3; }
    else if (pIdx === 3) { if (isFmu) fR += 1; else oR += 1; }
    entries.push({ time: `${minLeft}:${String(sec).padStart(2, '0')}`, half, team: isFmu ? 'fmu' : 'opp', text: tpl(name), score: `${fR}-${oR}` });
  }
  if (entries.length > 0) entries[entries.length - 1].score = `${fmuScore}-${oppScore}`;
  return entries;
}

function getBoxTotalsValue(lines: BoxScoreLine[], key: string): string {
  switch (key) {
    case 'name': return 'TOTAL';
    case 'min': return '';
    case 'fg': return sumMadeAtt(lines, 'fg');
    case 'threePt': return sumMadeAtt(lines, 'threePt');
    case 'ft': return sumMadeAtt(lines, 'ft');
    case 'reb': return String(lines.reduce((s, l) => s + l.reb, 0));
    case 'ast': return String(lines.reduce((s, l) => s + l.ast, 0));
    case 'stl': return String(lines.reduce((s, l) => s + l.stl, 0));
    case 'blk': return String(lines.reduce((s, l) => s + l.blk, 0));
    case 'to': return String(lines.reduce((s, l) => s + l.to, 0));
    case 'pf': return String(lines.reduce((s, l) => s + l.pf, 0));
    case 'plusMinus': return '';
    case 'pts': return String(lines.reduce((s, l) => s + l.pts, 0));
    default: return '';
  }
}

function computeGameOpsBoxScore(events: any[]): BoxScoreLine[] {
  const playerStats = computeGameOpsPlayerStats(events);
  return MOCK_ROSTER
    .filter((p) => playerStats[p.id])
    .sort((a, b) => (playerStats[b.id]?.pts ?? 0) - (playerStats[a.id]?.pts ?? 0))
    .map((p) => {
      const s = playerStats[p.id];
      const lastName = p.name.split(' ').pop() || p.name;
      return {
        name: lastName, min: '—', pts: s.pts, reb: s.reb, ast: s.ast,
        fg: `${s.fgm}-${s.fga}`, threePt: `${s.tpm}-${s.tpa}`, ft: `${s.ftm}-${s.fta}`,
        stl: s.stl, blk: s.blk, to: s.to, pf: s.pf,
      };
    });
}

function computeGameOpsGameFlow(events: any[], periodFormat: string): ScoreSnapshot[] {
  const periodScores: Record<number, { fmu: number; opp: number }> = {};
  let fmuScore = 0;
  let oppScore = 0;
  for (const evt of events) {
    const pts = LO_SCORING_PTS[evt.type] ?? 0;
    if (evt.team === 'LU') fmuScore += pts;
    else oppScore += pts;
    if (pts > 0) {
      periodScores[evt.period] = { fmu: fmuScore, opp: oppScore };
    }
  }
  return Object.entries(periodScores)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([period, scores]) => ({
      label: gameOpsPeriodLabel(Number(period), periodFormat),
      fmu: scores.fmu,
      opp: scores.opp,
    }));
}

// ── Main Component ──

export default function GameDetailScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();

  const isAuthenticated = useIsAuthenticated();

  const game = ALL_GAMES[gameId ?? ''] ?? { opponent: 'Unknown', date: '—', location: '—', status: 'upcoming' as GameStatus };
  const [activeTab, setActiveTab] = useState<DetailTab>(() => defaultTab(game.status));

  const [pbpFilter, setPbpFilter] = useState<PbpCategory | 'all'>('all');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [showGameActions, setShowGameActions] = useState(false);
  const [boxScoreTeam, setBoxScoreTeam] = useState<'fmu' | 'opp'>('fmu');
  const [boxScoreExpanded, setBoxScoreExpanded] = useState(false);
  const [espnTab, setEspnTab] = useState<'gamecast' | 'boxscore' | 'pbp' | 'teamstats'>('gamecast');
  const [liveSubTab, setLiveSubTab] = useState<'plays' | 'box' | 'team' | 'leaders'>('plays');
  const [liveBoxTeam, setLiveBoxTeam] = useState<'fmu' | 'opp'>('fmu');
  // Shot chart filter state
  const [shotPeriods, setShotPeriods] = useState<Set<string>>(new Set());
  const [shotPlayTypes, setShotPlayTypes] = useState<Set<string>>(new Set());
  const [shotPlayers, setShotPlayers] = useState<Set<string>>(new Set());
  const [shotFilterSheet, setShotFilterSheet] = useState<'periods' | 'playTypes' | 'players' | null>(null);
  const [shotPlayerTeam, setShotPlayerTeam] = useState<'fmu' | 'opp'>('fmu');
  const scrollRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<Record<string, number>>({});

  const scoutingNotes = SCOUTING_NOTES[game.opponent] ?? DEFAULT_SCOUTING_NOTES;
  const keys = KEYS_TO_GAME[game.opponent] ?? DEFAULT_KEYS;
  const opponentAbbr = game.opponent.substring(0, 3).toUpperCase();

  // ── Live Ops data from AsyncStorage ──
  const [gameOpsData, setGameOpsData] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      const loadGameOps = async () => {
        try {
          const json = await AsyncStorage.getItem(`kx:gameOps:${gameId ?? ''}`);
          if (json) {
            const parsed = JSON.parse(json);
            if (parsed.phase && parsed.phase !== 'setup') {
              setGameOpsData(parsed);
            } else {
              setGameOpsData(null);
            }
          } else {
            setGameOpsData(null);
          }
        } catch {
          setGameOpsData(null);
        }
      };
      loadGameOps();
      setEspnTab('gamecast');
    }, [gameId])
  );

  // ── Derived data (Live Ops overrides mock when available) ──
  const hasGameOps = !!gameOpsData;
  const gameOpsEvents = hasGameOps ? (gameOpsData.events ?? []) : [];

  const mockStats = GAME_STATS[gameId ?? ''];
  const stats = hasGameOps
    ? computeGameOpsTeamStats(gameOpsEvents)
    : mockStats;

  const isWin = hasGameOps
    ? gameOpsData.luScore > gameOpsData.oppScore
    : game.score?.startsWith('W');
  const isLoss = hasGameOps
    ? gameOpsData.luScore < gameOpsData.oppScore
    : game.score?.startsWith('L');

  const pbpEvents: PlayByPlayEvent[] = hasGameOps
    ? convertGameOpsToPlayByPlay(gameOpsEvents, opponentAbbr)
    : (PLAY_BY_PLAY[gameId ?? ''] ?? (() => {
        // Generate mock PBP for live games with no stored data
        if (game.status !== 'live' && game.status !== 'final') return [];
        const fmuPts = parseInt(game.score?.replace(/[WL]\s?/, '').split('-')[0] ?? '0') || 0;
        const oppPts = parseInt(game.score?.replace(/[WL]\s?/, '').split('-')[1] ?? '0') || 0;
        const entries = generateMockPbp(game.opponent, fmuPts, oppPts);
        // For live games, only show events through the current period (~60% of plays for 2H)
        const liveEntries = game.status === 'live' ? entries.slice(0, Math.floor(entries.length * 0.65)) : entries;
        return liveEntries.reverse().map((e, i): PlayByPlayEvent => ({
          id: `mock-${i}`,
          team: e.team === 'fmu' ? 'FMU' : opponentAbbr,
          text: e.text,
          scoreAt: e.score,
          category: e.text.includes('makes') || e.text.includes('misses') || e.text.includes('dunk') || e.text.includes('free throw')
            ? 'scoring'
            : e.text.includes('Foul') ? 'foul'
            : e.text.includes('Turnover') || e.text.includes('steal') || e.text.includes('rebound') || e.text.includes('blocked') || e.text.includes('assist') ? 'other'
            : 'other',
        }));
      })());
  const filteredPbp = pbpFilter === 'all' ? pbpEvents : pbpEvents.filter((e) => e.category === pbpFilter);

  // Effective values for Live/Report display
  const effectiveLuScore = hasGameOps ? String(gameOpsData.luScore) : (game.score ? game.score.replace(/[WL]\s?/, '').split('-')[0] : '0');
  const effectiveOppScore = hasGameOps ? String(gameOpsData.oppScore) : (game.score ? game.score.replace(/[WL]\s?/, '').split('-')[1] : '0');
  const effectiveClock = hasGameOps
    ? `${gameOpsPeriodLabel(gameOpsData.period, gameOpsData.periodFormat ?? 'halves')} ${gameOpsFormatClock(gameOpsData.clockSeconds ?? 0)}`
    : game.clock;
  const effectiveIsLive = hasGameOps ? gameOpsData.phase === 'active' : game.status === 'live';
  const effectiveScoreStr = hasGameOps
    ? (gameOpsData.phase === 'locked'
        ? `${isWin ? 'W' : isLoss ? 'L' : 'T'} ${gameOpsData.luScore}-${gameOpsData.oppScore}`
        : `${gameOpsData.luScore}-${gameOpsData.oppScore}`)
    : game.score;
  const effectiveHasReport = hasGameOps || ((game.status === 'live' || game.status === 'final') && !!game.score);
  const realBoxScore = hasGameOps ? computeGameOpsBoxScore(gameOpsEvents) : (BOX_SCORE[gameId ?? ''] ?? []);
  const FMU_MOCK_NAMES = ['Selden', 'Morgan', 'Turner', 'Lewis', 'Carter', 'Noel', 'Thomas', 'Brewer', 'Morris', 'Thompson'];
  const effectiveBoxScore = realBoxScore.length > 0 ? realBoxScore : mockBoxScore('Florida Memorial', parseInt(effectiveLuScore) || 0, FMU_MOCK_NAMES);
  const effectiveGameFlow = hasGameOps ? computeGameOpsGameFlow(gameOpsEvents, gameOpsData?.periodFormat ?? 'halves') : (GAME_FLOW[gameId ?? ''] ?? []);
  const oppBoxScore = mockBoxScore(game.opponent, parseInt(effectiveOppScore) || 0);
  const isFinalNoOps = game.status === 'final' && !hasGameOps;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Top App Bar (utility only) ── */}
      <View style={[styles.appBar, { borderBottomColor: colors.divider }]}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: pressed ? colors.backgroundSecondary : 'transparent' },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <IconSymbol name="chevron.left" size={20} color={colors.text} />
        </Pressable>
        <Text style={[styles.appBarTitle, { color: colors.textSecondary }]}>Game</Text>
        <View style={styles.appBarRight}>
          {activeTab === 'live' && hasGameOps && (
            <Pressable
              style={({ pressed }) => [
                styles.appBarIcon,
                { backgroundColor: pressed ? colors.backgroundSecondary : 'transparent' },
              ]}
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                await AsyncStorage.removeItem(`kx:gameOps:${gameId ?? ''}`);
                setGameOpsData(null);
                triggerGameOps(gameId ?? '', game.opponent);
                router.navigate('/(tabs)/nexus' as any);
              }}
            >
              <IconSymbol name="arrow.uturn.backward" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Fixed Scoreboard + Pills (completed games) ── */}
      {(() => {
        if (!isFinalNoOps) return null;
        const oppRecord = placeholderRecord(game.opponent, isConfGame(game.opponent));
        return (
          <View style={[styles.scoreboardCard, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.scoreboardRow}>
              <View style={styles.scoreboardSide}>
                <View>
                  <Text style={[styles.scoreboardAbbr, { color: colors.text }]}>{opponentAbbr}</Text>
                  <Text style={[styles.scoreboardRecord, { color: colors.textTertiary }]}>{oppRecord}</Text>
                </View>
                <View style={[styles.scoreboardIcon, { backgroundColor: colors.backgroundTertiary }]}>
                  <Text style={[styles.scoreboardIconText, { color: colors.textSecondary }]}>{opponentAbbr.charAt(0)}</Text>
                </View>
                <Text style={[styles.scoreboardBigScore, { color: !isWin ? colors.text : colors.textTertiary }]}>{effectiveOppScore}</Text>
              </View>
              <View style={styles.scoreboardCenter}>
                <Text style={[styles.scoreboardFinal, { color: colors.textTertiary }]}>Final</Text>
                <Text style={[styles.scoreboardArrow, { color: colors.text }]}>{isWin ? '▸' : '◂'}</Text>
              </View>
              <View style={[styles.scoreboardSide, { flexDirection: 'row-reverse' }]}>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.scoreboardAbbr, { color: colors.text }]}>FMU</Text>
                  <Text style={[styles.scoreboardRecord, { color: colors.textTertiary }]}>{FMU_RECORD.overall}</Text>
                </View>
                <View style={[styles.scoreboardIcon, { backgroundColor: colors.text + '15' }]}>
                  <Text style={[styles.scoreboardIconText, { color: colors.text }]}>F</Text>
                </View>
                <Text style={[styles.scoreboardBigScore, { color: isWin ? colors.text : colors.textTertiary }]}>{effectiveLuScore}</Text>
              </View>
            </View>

            {/* ESPN-style pills */}
            <View style={[styles.espnTabRow, { borderTopColor: colors.divider }]}>
              {([
                { key: 'gamecast', label: 'KaNeXTCast' },
                { key: 'boxscore', label: 'Box Score' },
                { key: 'pbp', label: 'Play-by-Play' },
                { key: 'teamstats', label: 'Team Stats' },
              ] as const).map((tab) => {
                const isActive = espnTab === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    style={[styles.espnTab, isActive && styles.espnTabActive]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setEspnTab(tab.key);
                      if (tab.key === 'boxscore') {
                        router.navigate({ pathname: '/coach/box-score' as any, params: { gameId: gameId ?? '' } });
                      } else if (tab.key === 'pbp') {
                        router.navigate({ pathname: '/coach/play-by-play' as any, params: { gameId: gameId ?? '' } });
                      } else if (tab.key === 'teamstats') {
                        router.navigate({ pathname: '/coach/team-stats' as any, params: { gameId: gameId ?? '' } });
                      } else {
                        scrollRef.current?.scrollTo({ y: 0, animated: true });
                      }
                    }}
                  >
                    <Text style={[
                      styles.espnTabText,
                      { color: isActive ? colors.text : colors.textTertiary },
                      isActive && styles.espnTabTextActive,
                    ]}>
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })()}

      {/* ── Content ── */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {(() => {
          if (isFinalNoOps) return null; // scoreboard already rendered above

          /* ── Standard header for non-final games ── */
          return (
            <>
              <View style={styles.gameHeader}>
                <Text style={[styles.gameTitle, { color: colors.text }]}>
                  {game.location === 'Home' ? 'vs' : '@'} {game.opponent}
                </Text>
                <Text style={[styles.gameMeta, { color: colors.textSecondary }]}>
                  {game.date} · {game.location}
                </Text>
                {game.status === 'live' && (
                  <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={[styles.liveText, { color: '#EF4444' }]}>
                      LIVE · {game.clock}
                    </Text>
                  </View>
                )}
              </View>

              {/* ── Inner Game Tabs (non-final only, hidden for live) ── */}
              {game.status !== 'live' && (
                <View style={[styles.tabRow, { backgroundColor: colors.background }]}>
                  {TABS.filter((tab) => {
                    if (tab.key === 'replay') return false;
                    if (game.status === 'upcoming' && tab.key !== 'prep') return false;
                    return true;
                  }).map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                      <Pressable
                        key={tab.key}
                        style={[
                          styles.tabPill,
                          { backgroundColor: isActive ? colors.text : colors.backgroundSecondary },
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setActiveTab(tab.key);
                        }}
                      >
                        <Text
                          style={[
                            styles.tabText,
                            { color: isActive ? colors.background : colors.textSecondary },
                          ]}
                        >
                          {tab.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </>
          );
        })()}

        {/* ══════════ PREP TAB ══════════ */}
        {activeTab === 'prep' && (
          <View>
            {/* Video Countdown (upcoming games only) */}
            {game.status === 'upcoming' && (() => {
              // Parse game date for countdown
              const MONTH_MAP: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
              const parts = game.date.split(' ');
              let gameDate: Date | null = null;
              if (parts.length >= 2) {
                const m = MONTH_MAP[parts[0]];
                const d = parseInt(parts[1]);
                if (m !== undefined && !isNaN(d)) {
                  const y = m >= 9 ? 2025 : 2026;
                  gameDate = new Date(y, m, d, 19, 0); // 7 PM tip-off
                }
              }
              const now = new Date();
              const diff = gameDate ? gameDate.getTime() - now.getTime() : 0;
              const totalHours = Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
              const days = Math.floor(totalHours / 24);
              const hours = totalHours % 24;
              const mins = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));

              return (
                <View style={[styles.videoCountdownCard, { backgroundColor: colors.backgroundSecondary }]}>
                  {/* Dark video placeholder */}
                  <View style={styles.videoPlaceholder}>
                    <View style={styles.videoPlayCircle}>
                      <IconSymbol name="play.fill" size={28} color="#fff" />
                    </View>
                  </View>

                  {/* Countdown */}
                  <View style={styles.countdownRow}>
                    {days > 0 && (
                      <View style={styles.countdownUnit}>
                        <Text style={[styles.countdownNum, { color: colors.text }]}>{days}</Text>
                        <Text style={[styles.countdownLabel, { color: colors.textTertiary }]}>DAYS</Text>
                      </View>
                    )}
                    {days > 0 && <Text style={[styles.countdownSep, { color: colors.textTertiary }]}>:</Text>}
                    <View style={styles.countdownUnit}>
                      <Text style={[styles.countdownNum, { color: colors.text }]}>{hours}</Text>
                      <Text style={[styles.countdownLabel, { color: colors.textTertiary }]}>HRS</Text>
                    </View>
                    <Text style={[styles.countdownSep, { color: colors.textTertiary }]}>:</Text>
                    <View style={styles.countdownUnit}>
                      <Text style={[styles.countdownNum, { color: colors.text }]}>{String(mins).padStart(2, '0')}</Text>
                      <Text style={[styles.countdownLabel, { color: colors.textTertiary }]}>MIN</Text>
                    </View>
                  </View>

                  {/* KaNeXT Video button */}
                  <Pressable
                    style={({ pressed }) => [styles.kanextVideoBtn, pressed && { opacity: 0.8 }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                  >
                    <IconSymbol name="play.fill" size={14} color="#fff" />
                    <Text style={styles.kanextVideoBtnText}>KaNeXT Video</Text>
                  </Pressable>
                </View>
              );
            })()}

            {/* Game Info */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              GAME INFO
            </Text>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <InfoRow label="Opponent" value={game.opponent} colors={colors} />
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              <InfoRow label="Date" value={game.date} colors={colors} />
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              <InfoRow label="Venue" value={game.location} colors={colors} />
            </View>

            {/* Scouting Notes — concise bullets */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
              SCOUTING NOTES
            </Text>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              {scoutingNotes.map((note, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={[styles.bulletDot, { color: colors.textTertiary }]}>{'\u2022'}</Text>
                  <Text style={[styles.bulletText, { color: colors.text }]}>{note}</Text>
                </View>
              ))}
            </View>

            {/* Keys to the Game — exactly 3, focused on our execution */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
              KEYS TO THE GAME
            </Text>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              {keys.map((key, i) => (
                <View key={i}>
                  {i > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
                  <View style={styles.keyRow}>
                    <View style={[styles.keyBadge, { backgroundColor: colors.backgroundTertiary }]}>
                      <Text style={[styles.keyNumber, { color: colors.text }]}>{i + 1}</Text>
                    </View>
                    <Text style={[styles.keyText, { color: colors.text }]}>{key}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ══════════ LIVE TAB (Viewer Mode) ══════════ */}
        {(activeTab === 'live' || game.status === 'live') && (
          <View>
            {/* ── Live Header: Score + Clock + Period ── */}
            <View style={[styles.liveHeader, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={styles.liveScoreRow}>
                <View style={styles.liveTeamCol}>
                  <Text style={[styles.liveTeamName, { color: colors.text }]}>FMU</Text>
                  <Text style={[styles.liveScoreNum, { color: colors.text }]}>
                    {effectiveLuScore}
                  </Text>
                </View>

                <View style={styles.liveCenterCol}>
                  {effectiveIsLive ? (
                    <>
                      <View style={styles.liveIndicatorRow}>
                        <View style={styles.liveDotAnim} />
                        <Text style={styles.liveBadgeText}>LIVE</Text>
                      </View>
                      <Text style={[styles.liveClockText, { color: colors.text }]}>{effectiveClock}</Text>
                    </>
                  ) : (hasGameOps && gameOpsData.phase === 'locked') || game.status === 'final' ? (
                    <Text style={[styles.livePeriodText, { color: colors.textTertiary }]}>FINAL</Text>
                  ) : (
                    <Text style={[styles.livePeriodText, { color: colors.textTertiary }]}>PRE-GAME</Text>
                  )}
                </View>

                <View style={styles.liveTeamCol}>
                  <Text style={[styles.liveTeamName, { color: colors.text }]}>{opponentAbbr}</Text>
                  <Text style={[styles.liveScoreNum, { color: colors.text }]}>
                    {effectiveOppScore}
                  </Text>
                </View>
              </View>

              {/* Watch Live CTA (secondary action) */}
              {game.status === 'live' && (
                game.streamUrl ? (
                  <Pressable
                    style={({ pressed }) => [
                      styles.watchLiveBtn,
                      { backgroundColor: colors.backgroundTertiary },
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      if (game.streamUrl) WebBrowser.openBrowserAsync(game.streamUrl);
                    }}
                  >
                    <IconSymbol name="play.fill" size={14} color={colors.text} />
                    <Text style={[styles.watchLiveBtnText, { color: colors.text }]}>Watch Live</Text>
                  </Pressable>
                ) : (
                  <View style={[styles.streamUnavailableBtn, { backgroundColor: colors.backgroundTertiary }]}>
                    <Text style={[styles.streamUnavailableText, { color: colors.textTertiary }]}>
                      Stream Unavailable
                    </Text>
                  </View>
                )
              )}
            </View>

            {/* ── 4-Tab Switcher ── */}
            <View style={[styles.liveTabRow, { backgroundColor: colors.backgroundSecondary }]}>
              {(['plays', 'box', 'team', 'leaders'] as const).map((tab) => {
                const label = tab === 'plays' ? 'Plays' : tab === 'box' ? 'Box' : tab === 'team' ? 'Team' : 'Leaders';
                const active = liveSubTab === tab;
                return (
                  <Pressable
                    key={tab}
                    style={[styles.liveTab, active && styles.liveTabActive]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setLiveSubTab(tab);
                    }}
                  >
                    <Text style={[styles.liveTabText, { color: active ? colors.text : colors.textTertiary }, active && styles.liveTabTextActive]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* ═══ PLAYS TAB ═══ */}
            {liveSubTab === 'plays' && (<>
              {/* Filter inside Plays */}
              <Pressable
                style={styles.filterToggle}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFiltersExpanded((prev) => !prev);
                }}
              >
                <Text style={[styles.filterToggleText, { color: colors.textTertiary }]}>
                  {filtersExpanded ? 'Hide Filters' : 'Filter'}
                  {pbpFilter !== 'all' ? ` · ${PBP_FILTER_OPTIONS.find((f) => f.key === pbpFilter)?.label}` : ''}
                </Text>
                <IconSymbol
                  name={filtersExpanded ? 'chevron.up' : 'chevron.down'}
                  size={12}
                  color={colors.textTertiary}
                />
              </Pressable>
              {filtersExpanded && (
                <View style={styles.filterRow}>
                  {PBP_FILTER_OPTIONS.map((opt) => {
                    const isActive = pbpFilter === opt.key;
                    return (
                      <Pressable
                        key={opt.key}
                        style={[styles.filterChip, { backgroundColor: isActive ? colors.text : colors.backgroundSecondary }]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setPbpFilter(opt.key);
                        }}
                      >
                        <Text style={[styles.filterChipText, { color: isActive ? colors.background : colors.textSecondary }]}>{opt.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
              {filteredPbp.length > 0 ? (
                <View style={[styles.pbpCard, { backgroundColor: colors.backgroundSecondary }]}>
                  {filteredPbp.map((event, index) => {
                    const isLU = event.team === 'FMU';
                    return (
                      <View key={event.id}>
                        {index > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
                        <View style={styles.pbpRow}>
                          <View style={[styles.pbpTeamBadge, { backgroundColor: isLU ? colors.text + '15' : colors.backgroundTertiary }]}>
                            <Text style={[styles.pbpTeamText, { color: isLU ? colors.text : colors.textSecondary }]}>
                              {event.team === 'FMU' ? 'FMU' : opponentAbbr}
                            </Text>
                          </View>
                          <Text style={[styles.pbpAction, { color: colors.text }]} numberOfLines={2}>{event.text}</Text>
                          <Text style={[styles.pbpScore, { color: colors.textTertiary }]}>{event.scoreAt}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                      No {pbpFilter !== 'all' ? pbpFilter : ''} events yet.
                    </Text>
                  </View>
                </View>
              )}
            </>)}

            {/* ═══ BOX TAB ═══ */}
            {liveSubTab === 'box' && (() => {
              const boxLines = liveBoxTeam === 'fmu' ? effectiveBoxScore : oppBoxScore;
              const teamLabel = liveBoxTeam === 'fmu' ? 'FMU' : opponentAbbr;
              const BOX_COMPACT_COLS: { key: string; label: string; width: number }[] = [
                { key: 'name', label: 'PLAYER', width: 80 },
                { key: 'min', label: 'MIN', width: 36 },
                { key: 'pts', label: 'PTS', width: 36 },
                { key: 'reb', label: 'REB', width: 36 },
                { key: 'ast', label: 'AST', width: 36 },
                { key: 'to', label: 'TO', width: 32 },
                { key: 'pf', label: 'PF', width: 32 },
              ];
              const getCellVal = (p: BoxScoreLine, key: string): string => {
                switch (key) {
                  case 'name': return p.name;
                  case 'min': return p.min;
                  case 'pts': return String(p.pts);
                  case 'reb': return String(p.reb);
                  case 'ast': return String(p.ast);
                  case 'to': return String(p.to);
                  case 'pf': return String(p.pf);
                  default: return '—';
                }
              };
              return (
                <View>
                  {/* Team toggle */}
                  <View style={styles.liveBoxTeamRow}>
                    {(['fmu', 'opp'] as const).map((t) => {
                      const active = liveBoxTeam === t;
                      return (
                        <Pressable
                          key={t}
                          style={[styles.liveBoxTeamPill, { backgroundColor: active ? colors.text : colors.backgroundSecondary }]}
                          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLiveBoxTeam(t); }}
                        >
                          <Text style={[styles.liveBoxTeamText, { color: active ? colors.background : colors.textSecondary }]}>
                            {t === 'fmu' ? 'FMU' : opponentAbbr}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={[styles.liveBoxTable, { backgroundColor: colors.backgroundSecondary }]}>
                      {/* Header */}
                      <View style={[styles.liveBoxHeaderRow, { borderBottomColor: colors.divider }]}>
                        {BOX_COMPACT_COLS.map((col) => (
                          <Text key={col.key} style={[styles.liveBoxHeaderCell, { width: col.width, color: colors.textTertiary }, col.key === 'name' && { textAlign: 'left' }]}>
                            {col.label}
                          </Text>
                        ))}
                      </View>
                      {/* Player rows */}
                      {boxLines.map((player, idx) => (
                        <View key={idx} style={[styles.liveBoxRow, idx < boxLines.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider }]}>
                          {BOX_COMPACT_COLS.map((col) => (
                            <Text key={col.key} style={[styles.liveBoxCell, { width: col.width, color: col.key === 'name' ? colors.text : colors.textSecondary }, col.key === 'name' && { textAlign: 'left', fontWeight: '600' }]}>
                              {getCellVal(player, col.key)}
                            </Text>
                          ))}
                        </View>
                      ))}
                      {/* Totals */}
                      <View style={[styles.liveBoxRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                        {BOX_COMPACT_COLS.map((col) => {
                          let val = '';
                          if (col.key === 'name') val = 'TOTAL';
                          else if (col.key === 'min') val = '';
                          else val = String(boxLines.reduce((s, p) => s + ((p as any)[col.key] ?? 0), 0));
                          return (
                            <Text key={col.key} style={[styles.liveBoxCell, { width: col.width, color: colors.text, fontWeight: '700' }, col.key === 'name' && { textAlign: 'left' }]}>
                              {val}
                            </Text>
                          );
                        })}
                      </View>
                    </View>
                  </ScrollView>
                </View>
              );
            })()}

            {/* ═══ TEAM TAB ═══ */}
            {liveSubTab === 'team' && (() => {
              const fmuPts = parseInt(effectiveLuScore) || 0;
              const oppPts = parseInt(effectiveOppScore) || 0;
              // Parse FMU stats
              const parseStat = (s: string) => {
                const m = s.match(/^(\d+)-(\d+)\s*\((\d+\.?\d*)%\)$/);
                if (!m) return null;
                return { made: parseInt(m[1]), att: parseInt(m[2]), pct: parseFloat(m[3]) };
              };
              const fmuFG = stats ? parseStat(stats.teamFG) : null;
              const fmu3P = stats ? parseStat(stats.team3P) : null;
              const fmuFT = stats ? parseStat(stats.teamFT) : null;
              const fmuReb = stats ? parseInt(stats.teamReb) || 0 : 0;
              const fmuTO = stats ? parseInt(stats.teamTO) || 0 : 0;
              // Deterministic opponent stats
              let h = 0;
              for (let i = 0; i < game.opponent.length; i++) h = ((h << 5) - h + game.opponent.charCodeAt(i)) | 0;
              const seed = (n: number) => { h = ((h << 5) - h + n) | 0; return Math.abs(h); };
              const oppFGA = (fmuFG?.att ?? 60) + (seed(1) % 8) - 4;
              const oppFGM = Math.round(oppFGA * (0.38 + (seed(2) % 15) / 100));
              const opp3PA = (fmu3P?.att ?? 20) + (seed(3) % 6) - 3;
              const opp3PM = Math.round(opp3PA * (0.25 + (seed(4) % 12) / 100));
              const oppFTA = (fmuFT?.att ?? 15) + (seed(5) % 8) - 4;
              const oppFTM = Math.round(oppFTA * (0.60 + (seed(6) % 20) / 100));
              const oppReb = fmuReb + (seed(7) % 12) - 6;
              const oppTO = fmuTO + (seed(8) % 6) - 3;
              const oppAST = 8 + (seed(9) % 10);
              const oppSTL = 3 + (seed(10) % 6);
              const oppBLK = 1 + (seed(11) % 5);
              const fmuAST = 6 + (seed(12) % 12);
              const fmuSTL = 3 + (seed(13) % 6);
              const fmuBLK = 2 + (seed(14) % 5);

              type TSRow = { label: string; fmu: string; opp: string; fmuN: number; oppN: number };
              const rows: TSRow[] = [
                { label: 'FG', fmu: `${fmuFG?.made ?? 0}-${fmuFG?.att ?? 0}`, opp: `${oppFGM}-${oppFGA}`, fmuN: fmuFG?.pct ?? 0, oppN: oppFGA > 0 ? (oppFGM / oppFGA) * 100 : 0 },
                { label: 'FG%', fmu: `${Math.round(fmuFG?.pct ?? 0)}%`, opp: `${oppFGA > 0 ? Math.round((oppFGM / oppFGA) * 100) : 0}%`, fmuN: fmuFG?.pct ?? 0, oppN: oppFGA > 0 ? (oppFGM / oppFGA) * 100 : 0 },
                { label: '3PT', fmu: `${fmu3P?.made ?? 0}-${fmu3P?.att ?? 0}`, opp: `${opp3PM}-${opp3PA}`, fmuN: fmu3P?.made ?? 0, oppN: opp3PM },
                { label: '3PT%', fmu: `${Math.round(fmu3P?.pct ?? 0)}%`, opp: `${opp3PA > 0 ? Math.round((opp3PM / opp3PA) * 100) : 0}%`, fmuN: fmu3P?.pct ?? 0, oppN: opp3PA > 0 ? (opp3PM / opp3PA) * 100 : 0 },
                { label: 'FT', fmu: `${fmuFT?.made ?? 0}-${fmuFT?.att ?? 0}`, opp: `${oppFTM}-${oppFTA}`, fmuN: fmuFT?.made ?? 0, oppN: oppFTM },
                { label: 'FT%', fmu: `${Math.round(fmuFT?.pct ?? 0)}%`, opp: `${oppFTA > 0 ? Math.round((oppFTM / oppFTA) * 100) : 0}%`, fmuN: fmuFT?.pct ?? 0, oppN: oppFTA > 0 ? (oppFTM / oppFTA) * 100 : 0 },
                { label: 'REB', fmu: String(fmuReb), opp: String(oppReb), fmuN: fmuReb, oppN: oppReb },
                { label: 'AST', fmu: String(fmuAST), opp: String(oppAST), fmuN: fmuAST, oppN: oppAST },
                { label: 'TO', fmu: String(fmuTO), opp: String(oppTO), fmuN: fmuTO, oppN: oppTO },
                { label: 'STL', fmu: String(fmuSTL), opp: String(oppSTL), fmuN: fmuSTL, oppN: oppSTL },
                { label: 'BLK', fmu: String(fmuBLK), opp: String(oppBLK), fmuN: fmuBLK, oppN: oppBLK },
              ];
              return (
                <View style={[styles.liveTeamCard, { backgroundColor: colors.backgroundSecondary }]}>
                  {/* Team header */}
                  <View style={styles.liveTeamHeader}>
                    <Text style={[styles.liveTeamHeaderName, { color: colors.text }]}>FMU</Text>
                    <Text style={[styles.liveTeamHeaderName, { color: colors.text }]}>{opponentAbbr}</Text>
                  </View>
                  {rows.map((row, i) => {
                    const isPctRow = row.label.includes('%');
                    const fmuWins = row.label === 'TO' ? row.fmuN < row.oppN : row.fmuN > row.oppN;
                    const oppWins = row.label === 'TO' ? row.oppN < row.fmuN : row.oppN > row.fmuN;
                    return (
                      <View key={row.label}>
                        {i > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
                        <View style={styles.liveTeamStatRow}>
                          <Text style={[styles.liveTeamStatVal, { color: fmuWins ? colors.text : colors.textTertiary }]}>{row.fmu}</Text>
                          <Text style={[styles.liveTeamStatLabel, { color: isPctRow ? colors.textTertiary : colors.textSecondary }]}>{row.label}</Text>
                          <Text style={[styles.liveTeamStatVal, { color: oppWins ? colors.text : colors.textTertiary, textAlign: 'right' }]}>{row.opp}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            })()}

            {/* ═══ LEADERS TAB ═══ */}
            {liveSubTab === 'leaders' && (() => {
              const fmuBox = effectiveBoxScore;
              const oppBox = oppBoxScore;
              const topN = (arr: BoxScoreLine[], key: 'pts' | 'reb' | 'ast', n = 3) =>
                [...arr].sort((a, b) => b[key] - a[key]).slice(0, n);
              const cats: { label: string; key: 'pts' | 'reb' | 'ast' }[] = [
                { label: 'POINTS', key: 'pts' },
                { label: 'REBOUNDS', key: 'reb' },
                { label: 'ASSISTS', key: 'ast' },
              ];
              return (
                <View>
                  {cats.map((cat) => (
                    <View key={cat.key} style={{ marginBottom: Spacing.md }}>
                      <Text style={[styles.liveLeaderCatLabel, { color: colors.textTertiary }]}>{cat.label}</Text>
                      <View style={styles.liveLeaderSplit}>
                        {/* FMU side */}
                        <View style={[styles.liveLeaderCol, { backgroundColor: colors.backgroundSecondary }]}>
                          <Text style={[styles.liveLeaderTeamLabel, { color: colors.textTertiary }]}>FMU</Text>
                          {topN(fmuBox, cat.key).map((p, i) => (
                            <View key={i} style={styles.liveLeaderRow}>
                              <Text style={[styles.liveLeaderName, { color: colors.text }]}>{p.name}</Text>
                              <Text style={[styles.liveLeaderStat, { color: colors.text }]}>{p[cat.key]}</Text>
                            </View>
                          ))}
                        </View>
                        {/* OPP side */}
                        <View style={[styles.liveLeaderCol, { backgroundColor: colors.backgroundSecondary }]}>
                          <Text style={[styles.liveLeaderTeamLabel, { color: colors.textTertiary }]}>{opponentAbbr}</Text>
                          {topN(oppBox, cat.key).map((p, i) => (
                            <View key={i} style={styles.liveLeaderRow}>
                              <Text style={[styles.liveLeaderName, { color: colors.text }]}>{p.name}</Text>
                              <Text style={[styles.liveLeaderStat, { color: colors.text }]}>{p[cat.key]}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              );
            })()}
          </View>
        )}

        {/* ══════════ REPORT TAB (ESPN-style — shown for final & live) ══════════ */}
        {activeTab === 'report' && (
          <View>
            {effectiveHasReport ? (
              <>
                {/* For live games that still show report, keep a compact score header */}
                {effectiveIsLive && (
                  <View style={[styles.resultCard, { backgroundColor: colors.backgroundSecondary }]}>
                    <View style={styles.reportStatusBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.reportLiveText}>LIVE</Text>
                    </View>
                    <Text style={[styles.resultScore, { color: colors.text }]}>
                      {effectiveLuScore}-{effectiveOppScore}
                    </Text>
                    <Text style={[styles.resultMeta, { color: colors.textSecondary }]}>
                      {game.location === 'Home' ? 'vs' : '@'} {game.opponent} · {effectiveClock}
                    </Text>
                  </View>
                )}

                {/* ═══ KANEXTCAST ═══ */}
                <View onLayout={(e) => { sectionRefs.current['gamecast'] = e.nativeEvent.layout.y; }} />
                {/* 1. Video / Replay Card */}
                <Pressable
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    // Placeholder — no actual replay yet
                  }}
                >
                  <View style={[styles.videoCard, { backgroundColor: colors.backgroundSecondary }]}>
                    <View style={[styles.videoThumb, { backgroundColor: colors.backgroundTertiary }]}>
                      <IconSymbol name="play.fill" size={36} color={colors.text + '90'} />
                      <View style={styles.videoDuration}>
                        <Text style={styles.videoDurationText}>0:22</Text>
                      </View>
                    </View>
                    <View style={styles.videoInfo}>
                      <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={2}>
                        FMU {isWin ? 'defeats' : 'falls to'} {game.opponent} {effectiveLuScore}-{effectiveOppScore}
                      </Text>
                      <Text style={[styles.videoSource, { color: colors.textTertiary }]}>
                        Highlights · {game.date}
                      </Text>
                    </View>
                  </View>
                </Pressable>

                {/* Watch Replay button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.watchReplayBtn,
                    { backgroundColor: colors.backgroundSecondary },
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    // Placeholder — no replay yet
                  }}
                >
                  <IconSymbol name="play.fill" size={14} color={colors.text} />
                  <Text style={[styles.watchReplayText, { color: colors.text }]}>KaNeXt Video Replay</Text>
                </Pressable>

                {/* 2. Box Score (score-by-half table) */}

                {effectiveGameFlow.length > 0 && (
                  <>
                  <View style={[styles.card, { backgroundColor: colors.backgroundSecondary, marginTop: Spacing.lg }]}>
                    {/* Column headers */}
                    <View style={styles.halfTableRow}>
                      <View style={styles.halfTableTeamCol} />
                      {effectiveGameFlow.map((s) => (
                        <Text key={s.label} style={[styles.halfTableHeader, { color: colors.textTertiary }]}>{s.label}</Text>
                      ))}
                      <Text style={[styles.halfTableHeader, { color: colors.textTertiary, fontWeight: '700' }]}>T</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                    {/* Opponent row */}
                    <View style={styles.halfTableRow}>
                      <View style={styles.halfTableTeamCol}>
                        <View style={[styles.halfTableIcon, { backgroundColor: colors.backgroundTertiary }]}>
                          <Text style={[styles.halfTableIconText, { color: colors.textSecondary }]}>{opponentAbbr.charAt(0)}</Text>
                        </View>
                        <Text style={[styles.halfTableTeamName, { color: colors.text }]}>{game.opponent}</Text>
                      </View>
                      {effectiveGameFlow.map((s, i) => {
                        const prev = i > 0 ? effectiveGameFlow[i - 1].opp : 0;
                        return <Text key={s.label} style={[styles.halfTableVal, { color: colors.textSecondary }]}>{s.opp - prev}</Text>;
                      })}
                      <Text style={[styles.halfTableVal, { color: colors.text, fontWeight: '700' }]}>{effectiveOppScore}</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                    {/* FMU row */}
                    <View style={styles.halfTableRow}>
                      <View style={styles.halfTableTeamCol}>
                        <View style={[styles.halfTableIcon, { backgroundColor: colors.text + '15' }]}>
                          <Text style={[styles.halfTableIconText, { color: colors.text }]}>F</Text>
                        </View>
                        <Text style={[styles.halfTableTeamName, { color: colors.text }]}>Florida Memorial</Text>
                      </View>
                      {effectiveGameFlow.map((s, i) => {
                        const prev = i > 0 ? effectiveGameFlow[i - 1].fmu : 0;
                        return <Text key={s.label} style={[styles.halfTableVal, { color: colors.textSecondary }]}>{s.fmu - prev}</Text>;
                      })}
                      <Text style={[styles.halfTableVal, { color: colors.text, fontWeight: '700' }]}>{effectiveLuScore}</Text>
                    </View>
                  </View>
                  </>
                )}

                {/* 3. Game Leaders (ESPN side-by-side) */}
                {effectiveBoxScore.length > 0 && (() => {
                  const fmuPts = [...effectiveBoxScore].sort((a, b) => b.pts - a.pts)[0];
                  const fmuReb = [...effectiveBoxScore].sort((a, b) => b.reb - a.reb)[0];
                  const fmuAst = [...effectiveBoxScore].sort((a, b) => b.ast - a.ast)[0];
                  const oppPts = [...oppBoxScore].sort((a, b) => b.pts - a.pts)[0];
                  const oppReb = [...oppBoxScore].sort((a, b) => b.reb - a.reb)[0];
                  const oppAst = [...oppBoxScore].sort((a, b) => b.ast - a.ast)[0];

                  // Format FG as "made/att FG"
                  const fgSub = (p: BoxScoreLine | undefined) => {
                    if (!p) return '';
                    return `${p.fg.replace('-', '/')} FG, ${p.ft.replace('-', '/')} FT`;
                  };
                  const rebSub = (p: BoxScoreLine | undefined) => {
                    if (!p) return '';
                    return `${p.min} MIN`;
                  };
                  const astSub = (p: BoxScoreLine | undefined) => {
                    if (!p) return '';
                    return `${p.to} TO, ${p.min} MIN`;
                  };

                  const categories = [
                    { label: 'Points', opp: oppPts, fmu: fmuPts, oppVal: oppPts?.pts ?? 0, fmuVal: fmuPts?.pts ?? 0, oppSub: fgSub(oppPts), fmuSub: fgSub(fmuPts) },
                    { label: 'Rebounds', opp: oppReb, fmu: fmuReb, oppVal: oppReb?.reb ?? 0, fmuVal: fmuReb?.reb ?? 0, oppSub: rebSub(oppReb), fmuSub: rebSub(fmuReb) },
                    { label: 'Assists', opp: oppAst, fmu: fmuAst, oppVal: oppAst?.ast ?? 0, fmuVal: fmuAst?.ast ?? 0, oppSub: astSub(oppAst), fmuSub: astSub(fmuAst) },
                  ];

                  return (
                    <>
                      <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                        GAME LEADERS
                      </Text>
                      <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
                        {/* Team header row */}
                        <View style={styles.glTeamHeader}>
                          <View style={styles.glTeamLeft}>
                            <View style={[styles.glTeamIcon, { backgroundColor: colors.backgroundTertiary }]}>
                              <Text style={[styles.glTeamIconText, { color: colors.textSecondary }]}>{opponentAbbr.charAt(0)}</Text>
                            </View>
                            <Text style={[styles.glTeamName, { color: colors.text }]}>{opponentAbbr}</Text>
                          </View>
                          <View style={styles.glTeamRight}>
                            <Text style={[styles.glTeamName, { color: colors.text }]}>FMU</Text>
                            <View style={[styles.glTeamIcon, { backgroundColor: colors.text + '15' }]}>
                              <Text style={[styles.glTeamIconText, { color: colors.text }]}>F</Text>
                            </View>
                          </View>
                        </View>

                        {categories.map((cat) => (
                          <View key={cat.label}>
                            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                            <View style={styles.glCatBlock}>
                              {/* Top row: [avatar] [stat]  label  [stat] [avatar] */}
                              <View style={styles.glTopRow}>
                                <View style={styles.glTopLeft}>
                                  <View style={[styles.glAvatar, { backgroundColor: colors.backgroundTertiary }]}>
                                    <Text style={[styles.glAvatarText, { color: colors.textTertiary }]}>
                                      {cat.opp?.name?.charAt(0) ?? '?'}
                                    </Text>
                                  </View>
                                  <Text style={[styles.glStatNum, { color: colors.text }]}>{cat.oppVal}</Text>
                                </View>
                                <Text style={[styles.glCatLabel, { color: colors.textSecondary }]}>{cat.label}</Text>
                                <View style={styles.glTopRight}>
                                  <Text style={[styles.glStatNum, { color: colors.text }]}>{cat.fmuVal}</Text>
                                  <View style={[styles.glAvatar, { backgroundColor: colors.text + '15' }]}>
                                    <Text style={[styles.glAvatarText, { color: colors.text }]}>
                                      {cat.fmu?.name?.charAt(0) ?? '?'}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                              {/* Bottom row: name + sub on each side */}
                              <View style={styles.glBottomRow}>
                                <View style={styles.glBottomLeft}>
                                  <Text style={[styles.glPlayerName, { color: colors.text }]}>{cat.opp?.name ?? '—'}</Text>
                                  <Text style={[styles.glSubline, { color: colors.textTertiary }]}>{cat.oppSub}</Text>
                                </View>
                                <View style={styles.glBottomRight}>
                                  <Text style={[styles.glPlayerName, { color: colors.text }]}>{cat.fmu?.name ?? '—'}</Text>
                                  <Text style={[styles.glSubline, { color: colors.textTertiary }]}>{cat.fmuSub}</Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        ))}

                        {/* Full Box Score link */}
                        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                        <Pressable
                          style={({ pressed }) => [styles.glFullLink, pressed && { opacity: 0.7 }]}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setBoxScoreExpanded(true);
                          }}
                        >
                          <Text style={[styles.glFullLinkText, { color: colors.textSecondary }]}>Full Box Score</Text>
                        </Pressable>
                      </View>
                    </>
                  );
                })()}

                {/* 3b. Shot Chart */}
                {effectiveBoxScore.length > 0 && (() => {
                  // Generate deterministic mock shot data from box score — now per-player with shot type
                  type Shot = { x: number; y: number; made: boolean; isThree: boolean; player: string; half: '1st Half' | '2nd Half' };
                  const generateShots = (lines: BoxScoreLine[], teamSeed: number): Shot[] => {
                    let h = teamSeed;
                    const rng = () => { h = ((h << 5) - h + 0x5bd1e995) | 0; return (Math.abs(h) % 1000) / 1000; };
                    const shots: Shot[] = [];
                    for (const p of lines) {
                      const fgParts = p.fg.split('-');
                      const fgm = parseInt(fgParts[0]) || 0;
                      const fga = parseInt(fgParts[1]) || 0;
                      const tpParts = p.threePt.split('-');
                      const tpm = parseInt(tpParts[0]) || 0;
                      const tpa = parseInt(tpParts[1]) || 0;
                      // three-point attempts first, rest are 2pt
                      for (let s = 0; s < fga; s++) {
                        const isThree = s < tpa;
                        const made = isThree ? s < tpm : (s - tpa) < (fgm - tpm);
                        const half: Shot['half'] = rng() < 0.5 ? '1st Half' : '2nd Half';
                        let x: number, y: number;
                        if (isThree) {
                          const angle = rng();
                          if (angle < 0.2) { x = 0.02 + rng() * 0.08; y = 0.02 + rng() * 0.12; }
                          else if (angle < 0.4) { x = 0.02 + rng() * 0.08; y = 0.86 + rng() * 0.12; }
                          else { x = 0.30 + rng() * 0.15; y = 0.08 + rng() * 0.84; }
                        } else {
                          const zone = rng();
                          if (zone < 0.55) {
                            x = 0.08 + rng() * 0.22; y = 0.25 + rng() * 0.50;
                          } else {
                            x = 0.15 + rng() * 0.25; y = 0.10 + rng() * 0.80;
                          }
                        }
                        shots.push({ x, y, made, isThree, player: p.name, half });
                      }
                    }
                    return shots;
                  };

                  let fmuSeed = 0;
                  for (let i = 0; i < 'FMU'.length; i++) fmuSeed = ((fmuSeed << 5) - fmuSeed + 'FMU'.charCodeAt(i)) | 0;
                  let oppSeed = 0;
                  for (let i = 0; i < game.opponent.length; i++) oppSeed = ((oppSeed << 5) - oppSeed + game.opponent.charCodeAt(i)) | 0;

                  const allFmuShots = generateShots(effectiveBoxScore, fmuSeed);
                  const allOppShots = generateShots(oppBoxScore, oppSeed);

                  // Apply filters
                  const filterShots = (shots: Shot[]) => {
                    let filtered = shots;
                    if (shotPeriods.size > 0) filtered = filtered.filter(s => shotPeriods.has(s.half));
                    if (shotPlayTypes.size > 0) {
                      filtered = filtered.filter(s => {
                        if (s.isThree && s.made && shotPlayTypes.has('3PT Made')) return true;
                        if (s.isThree && !s.made && shotPlayTypes.has('3PT Missed')) return true;
                        if (!s.isThree && s.made && shotPlayTypes.has('2PT FG Made')) return true;
                        if (!s.isThree && !s.made && shotPlayTypes.has('2PT FG Missed')) return true;
                        return false;
                      });
                    }
                    if (shotPlayers.size > 0) filtered = filtered.filter(s => shotPlayers.has(s.player));
                    return filtered;
                  };
                  const fmuShots = filterShots(allFmuShots);
                  const oppShots = filterShots(allOppShots);

                  const COURT_COLOR = '#D2B48C';
                  const LINE_COLOR = '#B8976A';
                  const FMU_COLOR = colors.text;
                  const OPP_COLOR = '#6B8E6B';

                  return (
                    <>
                      <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
                        SHOT CHART
                      </Text>
                      <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
                        {/* Filter pills */}
                        <View style={styles.shotFilterRow}>
                          {([
                            { key: 'periods' as const, label: shotPeriods.size > 0 ? `${shotPeriods.size} Period${shotPeriods.size > 1 ? 's' : ''}` : 'All Periods' },
                            { key: 'playTypes' as const, label: shotPlayTypes.size > 0 ? `${shotPlayTypes.size} Type${shotPlayTypes.size > 1 ? 's' : ''}` : 'All Play Types' },
                            { key: 'players' as const, label: shotPlayers.size > 0 ? `${shotPlayers.size} Player${shotPlayers.size > 1 ? 's' : ''}` : 'All Players' },
                          ]).map((pill) => {
                            const active = pill.key === 'periods' ? shotPeriods.size > 0 : pill.key === 'playTypes' ? shotPlayTypes.size > 0 : shotPlayers.size > 0;
                            return (
                              <Pressable
                                key={pill.key}
                                style={[styles.shotChip, active && { backgroundColor: colors.text }]}
                                onPress={() => {
                                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                  setShotFilterSheet(pill.key);
                                }}
                              >
                                <Text style={[styles.shotChipText, { color: active ? colors.background : colors.text }]}>{pill.label}</Text>
                                <IconSymbol name="chevron.down" size={10} color={active ? colors.background : colors.textTertiary} />
                              </Pressable>
                            );
                          })}
                        </View>

                        {/* Court container */}
                        <View style={[styles.shotCourtWrap, { backgroundColor: COURT_COLOR }]}>
                          <View style={[styles.shotHalfLine, { backgroundColor: LINE_COLOR }]} />
                          <View style={[styles.shotPaint, { left: 0, borderColor: LINE_COLOR }]} />
                          <View style={[styles.shotPaint, { right: 0, borderColor: LINE_COLOR }]} />
                          <View style={[styles.shotFTCircle, { left: '10%', borderColor: LINE_COLOR }]} />
                          <View style={[styles.shotFTCircle, { right: '10%', borderColor: LINE_COLOR }]} />
                          <View style={[styles.shotCenterCircle, { borderColor: LINE_COLOR }]} />
                          <View style={[styles.shotThreeArc, { left: -20, borderColor: LINE_COLOR }]} />
                          <View style={[styles.shotThreeArc, { right: -20, borderColor: LINE_COLOR }]} />

                          <View style={styles.shotTeamLabels}>
                            <View style={[styles.shotTeamBadge, { backgroundColor: OPP_COLOR + '30' }]}>
                              <Text style={[styles.shotTeamBadgeText, { color: OPP_COLOR }]}>{opponentAbbr.charAt(0)}</Text>
                            </View>
                            <View style={[styles.shotTeamBadge, { backgroundColor: FMU_COLOR + '15' }]}>
                              <Text style={[styles.shotTeamBadgeText, { color: FMU_COLOR }]}>F</Text>
                            </View>
                          </View>

                          {oppShots.map((s, i) => (
                            <View key={`o${i}`} style={[styles.shotDot, { left: `${s.x * 50}%`, top: `${s.y * 100}%`, backgroundColor: s.made ? OPP_COLOR : 'transparent', borderColor: OPP_COLOR }]} />
                          ))}
                          {fmuShots.map((s, i) => (
                            <View key={`f${i}`} style={[styles.shotDot, { right: `${s.x * 50}%`, top: `${s.y * 100}%`, backgroundColor: s.made ? FMU_COLOR : 'transparent', borderColor: FMU_COLOR }]} />
                          ))}
                        </View>

                        {/* Legend */}
                        <View style={styles.shotLegend}>
                          <View style={styles.shotLegendSide}>
                            <Text style={[styles.shotLegendLabel, { color: colors.textSecondary }]}>Shot Made</Text>
                            <View style={[styles.shotLegendDot, { backgroundColor: OPP_COLOR, borderColor: OPP_COLOR }]} />
                            <Text style={[styles.shotLegendLabel, { color: colors.textSecondary, marginLeft: 8 }]}>Shot Missed</Text>
                            <View style={[styles.shotLegendDot, { backgroundColor: 'transparent', borderColor: OPP_COLOR }]} />
                          </View>
                          <View style={[styles.shotLegendDivider, { backgroundColor: colors.divider }]} />
                          <View style={styles.shotLegendSide}>
                            <View style={[styles.shotLegendDot, { backgroundColor: FMU_COLOR, borderColor: FMU_COLOR }]} />
                            <Text style={[styles.shotLegendLabel, { color: colors.textSecondary }]}>Shot Made</Text>
                            <View style={[styles.shotLegendDot, { backgroundColor: 'transparent', borderColor: FMU_COLOR, marginLeft: 8 }]} />
                            <Text style={[styles.shotLegendLabel, { color: colors.textSecondary }]}>Shot Missed</Text>
                          </View>
                        </View>

                        {/* Full Play-By-Play link */}
                        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                        <Pressable
                          style={({ pressed }) => [styles.glFullLink, pressed && { opacity: 0.7 }]}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.navigate({ pathname: '/coach/play-by-play' as any, params: { gameId: gameId ?? '' } });
                          }}
                        >
                          <Text style={[styles.glFullLinkText, { color: '#c8102e' }]}>Full Play-By-Play</Text>
                        </Pressable>
                      </View>
                    </>
                  );
                })()}

                {/* ═══ TEAM STATS (ESPN comparison) ═══ */}
                <View onLayout={(e) => { sectionRefs.current['teamstats'] = e.nativeEvent.layout.y; }} />
                {(<>
                {stats && (() => {
                  // Parse FMU stats
                  const parseStat = (s: string) => {
                    const m = s.match(/^(\d+)-(\d+)\s*\((\d+\.?\d*)%\)$/);
                    if (!m) return null;
                    return { made: parseInt(m[1]), att: parseInt(m[2]), pct: parseFloat(m[3]) };
                  };
                  const fmuFG = parseStat(stats.teamFG);
                  const fmu3P = parseStat(stats.team3P);
                  const fmuFT = parseStat(stats.teamFT);
                  const fmuReb = parseInt(stats.teamReb) || 0;
                  const fmuTO = parseInt(stats.teamTO) || 0;

                  // Generate deterministic opponent stats
                  let h = 0;
                  for (let i = 0; i < game.opponent.length; i++) h = ((h << 5) - h + game.opponent.charCodeAt(i)) | 0;
                  const seed = (n: number) => { h = ((h << 5) - h + n) | 0; return Math.abs(h); };
                  const oppFGA = (fmuFG?.att ?? 60) + (seed(1) % 8) - 4;
                  const oppFGM = Math.round(oppFGA * (0.38 + (seed(2) % 15) / 100));
                  const opp3PA = (fmu3P?.att ?? 20) + (seed(3) % 6) - 3;
                  const opp3PM = Math.round(opp3PA * (0.25 + (seed(4) % 12) / 100));
                  const oppFTA = (fmuFT?.att ?? 15) + (seed(5) % 8) - 4;
                  const oppFTM = Math.round(oppFTA * (0.60 + (seed(6) % 20) / 100));
                  const oppReb = fmuReb + (seed(7) % 12) - 6;
                  const oppTO = fmuTO + (seed(8) % 6) - 3;

                  const oppFGPct = oppFGA > 0 ? Math.round((oppFGM / oppFGA) * 100) : 0;
                  const opp3PPct = opp3PA > 0 ? Math.round((opp3PM / opp3PA) * 100) : 0;
                  const oppFTPct = oppFTA > 0 ? Math.round((oppFTM / oppFTA) * 100) : 0;

                  const fmuPts = parseInt(effectiveLuScore) || 0;
                  const oppPts = parseInt(effectiveOppScore) || 0;
                  const pctLedFmu = fmuPts > oppPts ? 93 : (fmuPts === oppPts ? 50 : 7 + (seed(9) % 15));
                  const pctLedOpp = 100 - pctLedFmu;
                  const largestLeadFmu = fmuPts > oppPts ? Math.max(3, Math.round((fmuPts - oppPts) * (1.2 + (seed(10) % 5) / 10))) : (seed(11) % 4);
                  const largestLeadOpp = oppPts > fmuPts ? Math.max(3, Math.round((oppPts - fmuPts) * (1.2 + (seed(12) % 5) / 10))) : (seed(13) % 4);

                  type CompRow = { label: string; leftVal: string; leftSub?: string; rightVal: string; rightSub?: string; leftNum: number; rightNum: number };
                  const rows: CompRow[] = [
                    { label: 'Field Goal %', leftVal: `${Math.round(fmuFG?.pct ?? 0)}%`, leftSub: `(${fmuFG?.made}-${fmuFG?.att})`, rightVal: `${oppFGPct}%`, rightSub: `(${oppFGM}-${oppFGA})`, leftNum: fmuFG?.pct ?? 0, rightNum: oppFGPct },
                    { label: 'Three Point %', leftVal: `${Math.round(fmu3P?.pct ?? 0)}%`, leftSub: `(${fmu3P?.made}-${fmu3P?.att})`, rightVal: `${opp3PPct}%`, rightSub: `(${opp3PM}-${opp3PA})`, leftNum: fmu3P?.pct ?? 0, rightNum: opp3PPct },
                    { label: 'Free Throw %', leftVal: `${Math.round(fmuFT?.pct ?? 0)}%`, leftSub: `(${fmuFT?.made}-${fmuFT?.att})`, rightVal: `${oppFTPct}%`, rightSub: `(${oppFTM}-${oppFTA})`, leftNum: fmuFT?.pct ?? 0, rightNum: oppFTPct },
                    { label: 'Turnovers', leftVal: String(fmuTO), rightVal: String(oppTO), leftNum: fmuTO, rightNum: oppTO },
                    { label: 'Rebounds', leftVal: String(fmuReb), rightVal: String(oppReb), leftNum: fmuReb, rightNum: oppReb },
                    { label: 'Percent Led', leftVal: `${pctLedFmu}%`, rightVal: `${pctLedOpp}%`, leftNum: pctLedFmu, rightNum: pctLedOpp },
                    { label: 'Largest Lead', leftVal: String(largestLeadFmu), rightVal: String(largestLeadOpp), leftNum: largestLeadFmu, rightNum: largestLeadOpp },
                  ];

                  return (
                    <>
                      <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
                        TEAM STATS
                      </Text>
                      <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
                        {/* Team header */}
                        <View style={styles.compTeamRow}>
                          <View style={styles.compTeamLeft}>
                            <View style={[styles.compTeamIcon, { backgroundColor: colors.backgroundTertiary }]}>
                              <Text style={[styles.compTeamIconText, { color: colors.textSecondary }]}>{opponentAbbr.charAt(0)}</Text>
                            </View>
                            <Text style={[styles.compTeamAbbr, { color: colors.text }]}>{opponentAbbr}</Text>
                          </View>
                          <View style={[styles.compTeamLeft, { flexDirection: 'row-reverse' }]}>
                            <View style={[styles.compTeamIcon, { backgroundColor: colors.text + '15' }]}>
                              <Text style={[styles.compTeamIconText, { color: colors.text }]}>F</Text>
                            </View>
                            <Text style={[styles.compTeamAbbr, { color: colors.text }]}>FMU</Text>
                          </View>
                        </View>

                        {rows.map((row, i) => {
                          const total = row.leftNum + row.rightNum;
                          const leftPct = total > 0 ? (row.leftNum / total) * 100 : 50;
                          const rightPct = total > 0 ? (row.rightNum / total) * 100 : 50;
                          const leftWins = row.label === 'Turnovers' ? row.leftNum < row.rightNum : row.leftNum > row.rightNum;
                          const rightWins = row.label === 'Turnovers' ? row.rightNum < row.leftNum : row.rightNum > row.leftNum;
                          return (
                            <View key={row.label}>
                              {i > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
                              <View style={styles.compStatBlock}>
                                <View style={styles.compValRow}>
                                  <View style={styles.compValLeft}>
                                    <Text style={[styles.compBigVal, { color: leftWins ? colors.text : colors.textTertiary }]}>{row.leftVal}</Text>
                                    {row.leftSub && <Text style={[styles.compSubVal, { color: colors.textTertiary }]}> {row.leftSub}</Text>}
                                  </View>
                                  <Text style={[styles.compLabel, { color: colors.textSecondary }]}>{row.label}</Text>
                                  <View style={[styles.compValLeft, { flexDirection: 'row-reverse' }]}>
                                    <Text style={[styles.compBigVal, { color: rightWins ? colors.text : colors.textTertiary }]}>{row.rightVal}</Text>
                                    {row.rightSub && <Text style={[styles.compSubVal, { color: colors.textTertiary }]}> {row.rightSub}</Text>}
                                  </View>
                                </View>
                                <View style={styles.compBarRow}>
                                  <View style={[styles.compBarLeft, { flex: leftPct, backgroundColor: leftWins ? colors.textTertiary : colors.backgroundTertiary }]} />
                                  <View style={{ width: 3 }} />
                                  <View style={[styles.compBarRight, { flex: rightPct, backgroundColor: rightWins ? colors.text : colors.backgroundTertiary }]} />
                                </View>
                              </View>
                            </View>
                          );
                        })}

                        {/* Full Team Stats link */}
                        <View style={[styles.divider, { backgroundColor: colors.divider, marginTop: Spacing.sm }]} />
                        <Pressable
                          style={styles.compFullLink}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.navigate({ pathname: '/coach/team-stats' as any, params: { gameId: gameId ?? '' } });
                          }}
                        >
                          <Text style={[styles.compFullLinkText, { color: '#c8102e' }]}>Full Team Stats</Text>
                        </Pressable>
                      </View>
                    </>
                  );
                })()}

                {/* Nexus Analysis CTA */}
                <Pressable
                  style={({ pressed }) => [
                    styles.nexusCard,
                    { backgroundColor: colors.backgroundSecondary, marginTop: Spacing.lg },
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.navigate('/(tabs)/nexus' as any);
                  }}
                >
                  <IconSymbol name="sparkles" size={20} color={colors.text} />
                  <Text style={[styles.nexusText, { color: colors.text }]}>
                    Analyze this game in Nexus
                  </Text>
                  <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
                </Pressable>
                </>)}
              </>
            ) : (
              <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={styles.emptyState}>
                  <IconSymbol name="doc.text.fill" size={32} color={colors.textTertiary} />
                  <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                    Game report available once the game begins.
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ── Game Actions Bottom Sheet ── */}
      <Modal
        visible={showGameActions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGameActions(false)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setShowGameActions(false)} />
          <View style={[styles.sheetContent, { backgroundColor: colors.background, paddingBottom: insets.bottom + Spacing.md }]}>
            <View style={[styles.sheetHeader, { borderBottomColor: colors.divider }]}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>Game Actions</Text>
              <Pressable onPress={() => setShowGameActions(false)}>
                <IconSymbol name="xmark" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Watch Live */}
            <Pressable
              style={[styles.sheetRow, { opacity: game.streamUrl ? 1 : 0.4 }]}
              disabled={!game.streamUrl}
              onPress={() => {
                setShowGameActions(false);
                if (game.streamUrl) WebBrowser.openBrowserAsync(game.streamUrl);
              }}
            >
              <IconSymbol name="play.fill" size={18} color={colors.text} />
              <Text style={[styles.sheetRowText, { color: colors.text }]}>Watch Live</Text>
              {!game.streamUrl && (
                <Text style={[styles.sheetRowMeta, { color: colors.textTertiary }]}>No link set</Text>
              )}
            </Pressable>

            {/* Open Report (Live) */}
            <Pressable
              style={styles.sheetRow}
              onPress={() => {
                setShowGameActions(false);
                setActiveTab('report');
              }}
            >
              <IconSymbol name="tablecells" size={18} color={colors.text} />
              <Text style={[styles.sheetRowText, { color: colors.text }]}>Open Report (Live)</Text>
            </Pressable>

            {/* Share Game Link */}
            <Pressable
              style={styles.sheetRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowGameActions(false);
              }}
            >
              <IconSymbol name="square.and.arrow.up" size={18} color={colors.text} />
              <Text style={[styles.sheetRowText, { color: colors.text }]}>Share Game Link</Text>
            </Pressable>

            {/* Enter Game Ops */}
            <Pressable
              style={styles.sheetRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowGameActions(false);
                router.push({ pathname: '/coach/game-ops', params: { gameId: gameId ?? '' } } as any);
              }}
            >
              <IconSymbol name="plus.circle.fill" size={18} color={colors.text} />
              <Text style={[styles.sheetRowText, { color: colors.text }]}>Enter Game Ops</Text>
            </Pressable>

            {/* Set/Update Stream Link (Coach/Admin) */}
            <View style={[styles.sheetDivider, { backgroundColor: colors.divider }]} />
            <Pressable
              style={styles.sheetRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowGameActions(false);
              }}
            >
              <IconSymbol name="link" size={18} color={colors.text} />
              <Text style={[styles.sheetRowText, { color: colors.text }]}>
                {game.streamUrl ? 'Update Stream Link' : 'Add Stream Link'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Shot Chart Filter Sheet */}
      <Modal visible={shotFilterSheet !== null} transparent animationType="slide">
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setShotFilterSheet(null)} />
          <View style={[styles.sheetContent, { backgroundColor: colors.background, paddingBottom: insets.bottom + Spacing.md }]}>
            <View style={[styles.sheetHeader, { borderBottomColor: colors.divider }]}>
              <Pressable onPress={() => {
                if (shotFilterSheet === 'periods') setShotPeriods(new Set());
                else if (shotFilterSheet === 'playTypes') setShotPlayTypes(new Set());
                else if (shotFilterSheet === 'players') setShotPlayers(new Set());
              }}>
                <Text style={[styles.filterResetText, { color: colors.textTertiary }]}>Reset</Text>
              </Pressable>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                {shotFilterSheet === 'periods' ? 'Periods' : shotFilterSheet === 'playTypes' ? 'Play Types' : 'Players'}
              </Text>
              <Pressable onPress={() => setShotFilterSheet(null)}>
                <Text style={[styles.filterDoneText, { color: colors.text }]}>Done</Text>
              </Pressable>
            </View>

            {/* Periods */}
            {shotFilterSheet === 'periods' && (
              <View style={styles.filterList}>
                {['1st Half', '2nd Half'].map((period) => {
                  const on = shotPeriods.has(period);
                  return (
                    <Pressable
                      key={period}
                      style={[styles.filterOption, { borderBottomColor: colors.divider }]}
                      onPress={() => { const n = new Set(shotPeriods); on ? n.delete(period) : n.add(period); setShotPeriods(n); }}
                    >
                      <Text style={[styles.filterOptionText, { color: colors.text }]}>{period}</Text>
                      <View style={[styles.filterCheckbox, { borderColor: on ? colors.text : colors.textTertiary, backgroundColor: on ? colors.text : 'transparent' }]}>
                        {on && <IconSymbol name="checkmark" size={12} color={colors.background} />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* Play Types */}
            {shotFilterSheet === 'playTypes' && (
              <View style={styles.filterList}>
                {[
                  { key: '2PT FG Made', label: '2PT FG Made' },
                  { key: '2PT FG Missed', label: '2PT FG Missed' },
                  { key: '3PT Made', label: '3PT Made' },
                  { key: '3PT Missed', label: '3PT Missed' },
                ].map((item) => {
                  const on = shotPlayTypes.has(item.key);
                  return (
                    <Pressable
                      key={item.key}
                      style={[styles.filterOption, { borderBottomColor: colors.divider }]}
                      onPress={() => { const n = new Set(shotPlayTypes); on ? n.delete(item.key) : n.add(item.key); setShotPlayTypes(n); }}
                    >
                      <Text style={[styles.filterOptionText, { color: colors.text }]}>{item.label}</Text>
                      <View style={[styles.filterCheckbox, { borderColor: on ? colors.text : colors.textTertiary, backgroundColor: on ? colors.text : 'transparent' }]}>
                        {on && <IconSymbol name="checkmark" size={12} color={colors.background} />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* Players */}
            {shotFilterSheet === 'players' && (() => {
              const playerNames = shotPlayerTeam === 'fmu'
                ? effectiveBoxScore.map(p => p.name)
                : oppBoxScore.map(p => p.name);
              return (
                <View style={styles.filterList}>
                  <View style={styles.filterTeamToggle}>
                    {(['fmu', 'opp'] as const).map((t) => {
                      const active = shotPlayerTeam === t;
                      return (
                        <Pressable
                          key={t}
                          style={[styles.filterTeamPill, { backgroundColor: active ? colors.text + 'E0' : colors.backgroundTertiary }]}
                          onPress={() => setShotPlayerTeam(t)}
                        >
                          <Text style={[styles.filterTeamPillText, { color: active ? colors.background : colors.textSecondary }]}>
                            {t === 'fmu' ? 'FMU' : opponentAbbr}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <Pressable
                    style={[styles.filterOption, { borderBottomColor: colors.divider }]}
                    onPress={() => {
                      const allSelected = playerNames.every(n => shotPlayers.has(n));
                      const n = new Set(shotPlayers);
                      if (allSelected) playerNames.forEach(name => n.delete(name));
                      else playerNames.forEach(name => n.add(name));
                      setShotPlayers(n);
                    }}
                  >
                    <Text style={[styles.filterOptionText, { color: colors.text, fontWeight: '600' }]}>Select All</Text>
                    <View style={[styles.filterCheckbox, {
                      borderColor: playerNames.every(n => shotPlayers.has(n)) ? colors.text : colors.textTertiary,
                      backgroundColor: playerNames.every(n => shotPlayers.has(n)) ? colors.text : 'transparent',
                    }]}>
                      {playerNames.every(n => shotPlayers.has(n)) && <IconSymbol name="checkmark" size={12} color={colors.background} />}
                    </View>
                  </Pressable>
                  {playerNames.map((name) => {
                    const on = shotPlayers.has(name);
                    return (
                      <Pressable
                        key={name}
                        style={[styles.filterOption, { borderBottomColor: colors.divider }]}
                        onPress={() => { const nn = new Set(shotPlayers); on ? nn.delete(name) : nn.add(name); setShotPlayers(nn); }}
                      >
                        <Text style={[styles.filterOptionText, { color: colors.text }]}>{name}</Text>
                        <View style={[styles.filterCheckbox, { borderColor: on ? colors.text : colors.textTertiary, backgroundColor: on ? colors.text : 'transparent' }]}>
                          {on && <IconSymbol name="checkmark" size={12} color={colors.background} />}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              );
            })()}
          </View>
        </View>
      </Modal>

      <TabFooter activeTab="Home" />
    </View>
  );
}

// ── Shared Info Row ──

function InfoRow({ label, value, colors }: { label: string; value: string; colors: typeof Colors.light }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

// ── Game Flow Chart (score margin over time) ──

function GameFlowChart({ snapshots, colors }: { snapshots: ScoreSnapshot[]; colors: typeof Colors.light }) {
  const maxScore = Math.max(...snapshots.flatMap((s) => [s.fmu, s.opp]));
  const barScale = maxScore > 0 ? 100 / maxScore : 1;

  return (
    <View>
      {/* Legend */}
      <View style={styles.flowLegend}>
        <View style={styles.flowLegendItem}>
          <View style={[styles.flowLegendDot, { backgroundColor: colors.text }]} />
          <Text style={[styles.flowLegendLabel, { color: colors.textSecondary }]}>FMU</Text>
        </View>
        <View style={styles.flowLegendItem}>
          <View style={[styles.flowLegendDot, { backgroundColor: colors.textTertiary }]} />
          <Text style={[styles.flowLegendLabel, { color: colors.textSecondary }]}>OPP</Text>
        </View>
      </View>

      {/* Period bars */}
      {snapshots.map((snap, i) => {
        const margin = snap.fmu - snap.opp;
        return (
          <View key={i} style={styles.flowPeriodRow}>
            <Text style={[styles.flowPeriodLabel, { color: colors.textTertiary }]}>{snap.label}</Text>
            <View style={styles.flowBarContainer}>
              {/* FMU bar */}
              <View style={styles.flowBarRow}>
                <View
                  style={[
                    styles.flowBar,
                    { width: `${snap.fmu * barScale}%`, backgroundColor: colors.text },
                  ]}
                />
                <Text style={[styles.flowBarValue, { color: colors.text }]}>{snap.fmu}</Text>
              </View>
              {/* OPP bar */}
              <View style={styles.flowBarRow}>
                <View
                  style={[
                    styles.flowBar,
                    { width: `${snap.opp * barScale}%`, backgroundColor: colors.textTertiary + '60' },
                  ]}
                />
                <Text style={[styles.flowBarValue, { color: colors.textTertiary }]}>{snap.opp}</Text>
              </View>
            </View>
            <Text
              style={[
                styles.flowMargin,
                { color: margin > 0 ? '#f5f5f5' : margin < 0 ? '#EF4444' : colors.textTertiary },
              ]}
            >
              {margin > 0 ? `+${margin}` : margin === 0 ? 'TIE' : `${margin}`}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // App bar (utility only)
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    height: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  appBarTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  appBarRight: {
    flexDirection: 'row',
    gap: 8,
  },
  appBarIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },

  // Primary game header
  gameHeader: {
    marginBottom: Spacing.md,
  },
  gameTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gameTitle: {
    fontSize: 26,
    fontWeight: '700',
    flex: 1,
  },
  gameMeta: {
    fontSize: 15,
    marginTop: 4,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  liveText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scoreResult: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
  },

  // Tab segmented control
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Section labels
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },

  // Cards
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    padding: Spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },

  // Info rows (shared)
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Scouting bullet notes
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 6,
  },
  bulletDot: {
    fontSize: 16,
    lineHeight: 21,
    marginTop: 1,
  },
  bulletText: {
    fontSize: 14,
    lineHeight: 21,
    flex: 1,
  },
  scoutingCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
  },
  scoutingCtaText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },

  // Keys to the game
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  keyBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  keyText: {
    fontSize: 15,
    flex: 1,
  },

  // Live header (Viewer Mode)
  liveHeader: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  liveScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveTeamCol: {
    flex: 1,
    alignItems: 'center',
  },
  liveTeamName: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  liveScoreNum: {
    fontSize: 44,
    fontWeight: '700',
  },
  liveCenterCol: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  liveDotAnim: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  liveBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#EF4444',
  },
  liveClockText: {
    fontSize: 16,
    fontWeight: '600',
  },
  livePeriodText: {
    fontSize: 14,
    fontWeight: '600',
  },
  watchLiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  watchLiveBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  streamUnavailableBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  streamUnavailableText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Filters (collapsed by default)
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  filterToggleText: {
    fontSize: 13,
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Play-by-play stream
  pbpCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  pbpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 10,
  },
  pbpTeamBadge: {
    width: 36,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  pbpTeamText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  pbpAction: {
    fontSize: 14,
    flex: 1,
  },
  pbpScore: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 48,
    textAlign: 'right',
  },

  // Result card (Report tab)
  resultCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    padding: Spacing.md,
    alignItems: 'center',
  },
  reportStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportLiveText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#EF4444',
  },
  resultOutcome: {
    fontSize: 20,
    fontWeight: '700',
  },
  resultScore: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 4,
  },
  resultMeta: {
    fontSize: 13,
    marginTop: 6,
  },

  // ESPN-style horizontal scoreboard (completed games)
  scoreboardCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
  },
  scoreboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreboardSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  scoreboardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreboardIconText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scoreboardAbbr: {
    fontSize: 14,
    fontWeight: '700',
  },
  scoreboardRecord: {
    fontSize: 11,
    marginTop: 1,
  },
  scoreboardBigScore: {
    fontSize: 32,
    fontWeight: '700',
  },
  scoreboardCenter: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  scoreboardFinal: {
    fontSize: 13,
    fontWeight: '500',
  },
  scoreboardArrow: {
    fontSize: 14,
    marginTop: 2,
  },
  espnTabRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.md,
  },
  espnTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  espnTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#c8102e',
  },
  espnTabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  espnTabTextActive: {
    fontWeight: '700',
  },

  // Video card
  videoCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  videoThumb: {
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  videoDurationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  videoInfo: {
    padding: Spacing.md,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  videoSource: {
    fontSize: 12,
    marginTop: 4,
  },
  watchReplayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    marginTop: Spacing.sm,
  },
  watchReplayText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Score-by-half table
  halfTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  halfTableTeamCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  halfTableIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halfTableIconText: {
    fontSize: 11,
    fontWeight: '700',
  },
  halfTableTeamName: {
    fontSize: 14,
    fontWeight: '500',
  },
  halfTableHeader: {
    width: 44,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  halfTableVal: {
    width: 44,
    textAlign: 'center',
    fontSize: 14,
  },

  // Game Leaders (ESPN side-by-side)
  glTeamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  glTeamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  glTeamRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  glTeamIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glTeamIconText: {
    fontSize: 13,
    fontWeight: '700',
  },
  glTeamName: {
    fontSize: 15,
    fontWeight: '700',
  },
  glCatBlock: {
    paddingVertical: 14,
  },
  glTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  glTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  glTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    justifyContent: 'flex-end',
  },
  glAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glAvatarText: {
    fontSize: 15,
    fontWeight: '600',
  },
  glStatNum: {
    fontSize: 24,
    fontWeight: '700',
  },
  glCatLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    width: 80,
  },
  glBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  glBottomLeft: {
    flex: 1,
  },
  glBottomRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  glPlayerName: {
    fontSize: 13,
    fontWeight: '600',
  },
  glSubline: {
    fontSize: 11,
    marginTop: 2,
  },
  glFullLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  glFullLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Shot Chart
  shotCourtWrap: {
    aspectRatio: 1.88,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  shotHalfLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
  },
  shotPaint: {
    position: 'absolute',
    top: '28%',
    width: '15%',
    height: '44%',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  shotFTCircle: {
    position: 'absolute',
    top: '35%',
    width: '12%',
    height: '30%',
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  shotCenterCircle: {
    position: 'absolute',
    left: '43%',
    top: '35%',
    width: '14%',
    height: '30%',
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  shotThreeArc: {
    position: 'absolute',
    top: '5%',
    width: '45%',
    height: '90%',
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  shotTeamLabels: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  shotTeamBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shotTeamBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  shotDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    marginLeft: -4,
    marginTop: -4,
  },
  shotLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  shotLegendSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shotLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  shotLegendDivider: {
    width: 1,
    height: 16,
    marginHorizontal: 4,
  },
  shotLegendLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  shotFilterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  shotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.3)',
  },
  shotChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  filterResetText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterDoneText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterList: {
    paddingHorizontal: Spacing.md,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filterOptionText: {
    fontSize: 15,
  },
  filterCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTeamToggle: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: Spacing.sm,
  },
  filterTeamPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  filterTeamPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Inline Play-by-Play (report tab)
  pbpHalfHeader: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
  },
  pbpHalfHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pbpTimeCol: {
    width: 42,
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  pbpTeamDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pbpPlayText: {
    flex: 1,
    fontSize: 14,
  },
  pbpScoreCol: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  pbpInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },

  // Leaders (Report tab)
  leaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  leaderName: {
    fontSize: 15,
    fontWeight: '600',
  },
  leaderLine: {
    fontSize: 14,
  },

  // Nexus card
  nexusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  nexusText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },

  // ESPN comparison team stats
  compTeamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  compTeamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compTeamIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compTeamIconText: {
    fontSize: 13,
    fontWeight: '700',
  },
  compTeamAbbr: {
    fontSize: 14,
    fontWeight: '700',
  },
  compStatBlock: {
    paddingVertical: 12,
  },
  compValRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  compValLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flex: 1,
  },
  compBigVal: {
    fontSize: 18,
    fontWeight: '700',
  },
  compSubVal: {
    fontSize: 12,
    fontWeight: '500',
  },
  compLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  compBarRow: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  compBarLeft: {
    height: 6,
    borderRadius: 3,
  },
  compBarRight: {
    height: 6,
    borderRadius: 3,
  },
  compFullLink: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  compFullLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Game flow chart
  flowLegend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  flowLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flowLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  flowLegendLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  flowPeriodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  flowPeriodLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 32,
  },
  flowBarContainer: {
    flex: 1,
    gap: 3,
  },
  flowBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 14,
  },
  flowBar: {
    height: 10,
    borderRadius: 5,
    minWidth: 4,
  },
  flowBarValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  flowMargin: {
    fontSize: 12,
    fontWeight: '700',
    width: 36,
    textAlign: 'right',
  },

  // Box score team toggle
  boxToggleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  boxTogglePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  boxToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Box score table (NBA-style, column widths set via BOX_COLS)
  boxHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
  },
  boxHeaderCell: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  boxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
  },
  boxCell: {
    fontSize: 12,
  },

  // Game Actions bottom sheet
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
  },
  sheetRowText: {
    fontSize: 16,
    flex: 1,
  },
  sheetRowMeta: {
    fontSize: 13,
  },
  sheetDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.md,
  },

  // Body text
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: Spacing.lg,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },

  // Video Countdown (upcoming pregame)
  videoCountdownCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  videoPlaceholder: {
    height: 200,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlayCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: 4,
  },
  countdownUnit: {
    alignItems: 'center',
    minWidth: 48,
  },
  countdownNum: {
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  countdownLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
  countdownSep: {
    fontSize: 28,
    fontWeight: '300',
    marginBottom: 14,
  },
  kanextVideoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#c8102e',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  kanextVideoBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Live 4-tab switcher ──
  liveTabRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  liveTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  liveTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#c8102e',
  },
  liveTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  liveTabTextActive: {
    fontWeight: '700',
  },

  // ── Box tab (live) ──
  liveBoxTeamRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  liveBoxTeamPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
  },
  liveBoxTeamText: {
    fontSize: 12,
    fontWeight: '700',
  },
  liveBoxTable: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    minWidth: '100%',
  },
  liveBoxHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  liveBoxHeaderCell: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  liveBoxRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
  },
  liveBoxCell: {
    fontSize: 13,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },

  // ── Team tab (live) ──
  liveTeamCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    padding: Spacing.md,
  },
  liveTeamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  liveTeamHeaderName: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  liveTeamStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  liveTeamStatVal: {
    width: 60,
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  liveTeamStatLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // ── Leaders tab (live) ──
  liveLeaderCatLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  liveLeaderSplit: {
    flexDirection: 'row',
    gap: 8,
  },
  liveLeaderCol: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  liveLeaderTeamLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  liveLeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  liveLeaderName: {
    fontSize: 13,
    fontWeight: '500',
  },
  liveLeaderStat: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
