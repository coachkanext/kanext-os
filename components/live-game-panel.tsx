/**
 * LiveGamePanel — Inline expandable live game content for the Home Schedule Hub.
 * Renders the 4-tab switcher (Plays / Box / Team / Leaders) with all sub-tab content.
 * Extracted from game-detail.tsx live tab (lines 948-1240).
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import {
  KaNeXT_GAME_STATS,
  KaNeXT_BOX_SCORES,
  KaNeXT_LEADERS,
  type BoxScoreLine,
} from '@/data/fmu';
import { MOCK_ROSTER } from '@/data/mock-roster';

// ── Types ──

type PbpCategory = 'scoring' | 'foul' | 'sub' | 'timeout' | 'other';

interface PlayByPlayEvent {
  id: string;
  team: 'Carroll' | string;
  text: string;
  scoreAt: string;
  category: PbpCategory;
}

interface KaNeXTGame {
  opponent: string;
  date: string;
  location: string;
  status: 'upcoming' | 'live' | 'final';
  score?: string;
  clock?: string;
}

// ── Constants ──

const PBP_FILTER_OPTIONS: { key: PbpCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'scoring', label: 'Scoring' },
  { key: 'foul', label: 'Fouls' },
  { key: 'sub', label: 'Subs' },
  { key: 'timeout', label: 'Timeouts' },
];

const LO_SCORING_PTS: Record<string, number> = {
  fg2_make: 2, fg3_make: 3, ft_make: 1,
};

// ── Helper Functions (from game-detail.tsx) ──

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
      team: evt.team === 'LU' ? 'Carroll' : opponentAbbr,
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

function mockBoxScore(teamName: string, teamScore: number, names?: string[]): BoxScoreLine[] {
  let h = 0;
  for (let i = 0; i < teamName.length; i++) h = ((h << 5) - h + teamName.charCodeAt(i)) | 0;
  const seed = (n: number) => { h = ((h << 5) - h + n) | 0; return Math.abs(h); };

  const DEFAULT_NAMES = ['Johnson', 'Williams', 'Davis', 'Brown', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson'];
  const MOCK_NAMES = names ?? DEFAULT_NAMES;
  const count = 8 + (seed(1) % 3);
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

function generateMockPbp(opponent: string, fmuScore: number, oppScore: number) {
  let h = 0;
  for (let i = 0; i < opponent.length; i++) h = ((h << 5) - h + opponent.charCodeAt(i)) | 0;
  const seed = () => { h = ((h << 5) - h + 0x5bd1e995) | 0; return Math.abs(h) % 1000; };
  const KaNeXT_NAMES = ['Selden', 'Morgan', 'Turner', 'Lewis', 'Carter', 'Noel', 'Thomas'];
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
  const entries: { time: string; half: '1st' | '2nd'; team: 'fmu' | 'opp'; text: string; score: string }[] = [];
  let fR = 0, oR = 0;
  const total = 80 + (seed() % 30), mid = Math.floor(total / 2);
  for (let i = 0; i < total; i++) {
    const half: '1st' | '2nd' = i < mid ? '1st' : '2nd';
    const minLeft = i < mid ? 20 - Math.floor((i / mid) * 20) : 20 - Math.floor(((i - mid) / (total - mid)) * 20);
    const sec = seed() % 60;
    const isFmu = seed() % 2 === 0;
    const names = isFmu ? KaNeXT_NAMES : OPP_NAMES;
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

// ── Props ──

interface LiveGamePanelProps {
  gameId: string;
  game: KaNeXTGame;
  colors: typeof Colors.light;
}

// ── Component ──

export function LiveGamePanel({ gameId, game, colors }: LiveGamePanelProps) {
  const [liveSubTab, setLiveSubTab] = useState<'plays' | 'box' | 'team' | 'leaders'>('plays');
  const [pbpFilter, setPbpFilter] = useState<PbpCategory | 'all'>('all');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [liveBoxTeam, setLiveBoxTeam] = useState<'fmu' | 'opp'>('fmu');
  const [gameOpsData, setGameOpsData] = useState<any>(null);

  const opponentAbbr = game.opponent.substring(0, 3).toUpperCase();

  // Load GameOps data from AsyncStorage
  useEffect(() => {
    const loadGameOps = async () => {
      try {
        const json = await AsyncStorage.getItem(`kx:gameOps:${gameId}`);
        if (json) {
          const parsed = JSON.parse(json);
          if (parsed.phase && parsed.phase !== 'setup') {
            setGameOpsData(parsed);
          }
        }
      } catch {
        // ignore
      }
    };
    loadGameOps();
  }, [gameId]);

  // ── Derived data ──
  const hasGameOps = !!gameOpsData;
  const gameOpsEvents = hasGameOps ? (gameOpsData.events ?? []) : [];

  const mockStats = KaNeXT_GAME_STATS[gameId];
  const stats = hasGameOps ? computeGameOpsTeamStats(gameOpsEvents) : mockStats;

  const effectiveLuScore = hasGameOps ? String(gameOpsData.luScore) : (game.score ? game.score.replace(/[WL]\s?/, '').split('-')[0] : '0');
  const effectiveOppScore = hasGameOps ? String(gameOpsData.oppScore) : (game.score ? game.score.replace(/[WL]\s?/, '').split('-')[1] : '0');

  const pbpEvents: PlayByPlayEvent[] = hasGameOps
    ? convertGameOpsToPlayByPlay(gameOpsEvents, opponentAbbr)
    : (() => {
        if (game.status !== 'live' && game.status !== 'final') return [];
        const fmuPts = parseInt(game.score?.replace(/[WL]\s?/, '').split('-')[0] ?? '0') || 0;
        const oppPts = parseInt(game.score?.replace(/[WL]\s?/, '').split('-')[1] ?? '0') || 0;
        const entries = generateMockPbp(game.opponent, fmuPts, oppPts);
        const liveEntries = game.status === 'live' ? entries.slice(0, Math.floor(entries.length * 0.65)) : entries;
        return liveEntries.reverse().map((e, i): PlayByPlayEvent => ({
          id: `mock-${i}`,
          team: e.team === 'fmu' ? 'Carroll' : opponentAbbr,
          text: e.text,
          scoreAt: e.score,
          category: e.text.includes('makes') || e.text.includes('misses') || e.text.includes('dunk') || e.text.includes('free throw')
            ? 'scoring'
            : e.text.includes('Foul') ? 'foul'
            : 'other',
        }));
      })();

  const filteredPbp = pbpFilter === 'all' ? pbpEvents : pbpEvents.filter((e) => e.category === pbpFilter);

  const realBoxScore = hasGameOps ? computeGameOpsBoxScore(gameOpsEvents) : (KaNeXT_BOX_SCORES[gameId] ?? []);
  const KaNeXT_MOCK_NAMES = ['Selden', 'Morgan', 'Turner', 'Lewis', 'Carter', 'Noel', 'Thomas', 'Brewer', 'Morris', 'Thompson'];
  const effectiveBoxScore = realBoxScore.length > 0 ? realBoxScore : mockBoxScore('Carroll College', parseInt(effectiveLuScore) || 0, KaNeXT_MOCK_NAMES);
  const oppBoxScore = mockBoxScore(game.opponent, parseInt(effectiveOppScore) || 0);

  return (
    <View style={s.container}>
      {/* ── 4-Tab Switcher ── */}
      <View style={[s.liveTabRow, { backgroundColor: colors.backgroundSecondary }]}>
        {(['plays', 'box', 'team', 'leaders'] as const).map((tab) => {
          const label = tab === 'plays' ? 'Plays' : tab === 'box' ? 'Box' : tab === 'team' ? 'Team' : 'Leaders';
          const active = liveSubTab === tab;
          return (
            <Pressable
              key={tab}
              style={[s.liveTab, active && s.liveTabActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setLiveSubTab(tab);
              }}
            >
              <Text style={[s.liveTabText, { color: active ? colors.text : colors.textTertiary }, active && s.liveTabTextActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ═══ PLAYS TAB ═══ */}
      {liveSubTab === 'plays' && (<>
        <Pressable
          style={s.filterToggle}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setFiltersExpanded((prev) => !prev);
          }}
        >
          <Text style={[s.filterToggleText, { color: colors.textTertiary }]}>
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
          <View style={s.filterRow}>
            {PBP_FILTER_OPTIONS.map((opt) => {
              const isActive = pbpFilter === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  style={[s.filterChip, { backgroundColor: isActive ? colors.text : colors.backgroundSecondary }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setPbpFilter(opt.key);
                  }}
                >
                  <Text style={[s.filterChipText, { color: isActive ? colors.background : colors.textSecondary }]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
        {filteredPbp.length > 0 ? (
          <View style={[s.pbpCard, { backgroundColor: colors.backgroundSecondary }]}>
            {filteredPbp.map((event, index) => {
              const isLU = event.team === 'Carroll';
              return (
                <View key={event.id}>
                  {index > 0 && <View style={[s.divider, { backgroundColor: colors.divider }]} />}
                  <View style={s.pbpRow}>
                    <View style={[s.pbpTeamBadge, { backgroundColor: isLU ? colors.text + '15' : colors.backgroundTertiary }]}>
                      <Text style={[s.pbpTeamText, { color: isLU ? colors.text : colors.textSecondary }]}>
                        {event.team === 'Carroll' ? 'Carroll' : opponentAbbr}
                      </Text>
                    </View>
                    <Text style={[s.pbpAction, { color: colors.text }]} numberOfLines={2}>{event.text}</Text>
                    <Text style={[s.pbpScore, { color: colors.textTertiary }]}>{event.scoreAt}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={s.emptyState}>
              <Text style={[s.emptyText, { color: colors.textTertiary }]}>
                No {pbpFilter !== 'all' ? pbpFilter : ''} events yet.
              </Text>
            </View>
          </View>
        )}
      </>)}

      {/* ═══ BOX TAB ═══ */}
      {liveSubTab === 'box' && (() => {
        const boxLines = liveBoxTeam === 'fmu' ? effectiveBoxScore : oppBoxScore;
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
            <View style={s.liveBoxTeamRow}>
              {(['fmu', 'opp'] as const).map((t) => {
                const active = liveBoxTeam === t;
                return (
                  <Pressable
                    key={t}
                    style={[s.liveBoxTeamPill, { backgroundColor: active ? colors.text : colors.backgroundSecondary }]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLiveBoxTeam(t); }}
                  >
                    <Text style={[s.liveBoxTeamText, { color: active ? colors.background : colors.textSecondary }]}>
                      {t === 'fmu' ? 'Carroll' : opponentAbbr}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={[s.liveBoxTable, { backgroundColor: colors.backgroundSecondary }]}>
                {/* Header */}
                <View style={[s.liveBoxHeaderRow, { borderBottomColor: colors.divider }]}>
                  {BOX_COMPACT_COLS.map((col) => (
                    <Text key={col.key} style={[s.liveBoxHeaderCell, { width: col.width, color: colors.textTertiary }, col.key === 'name' && { textAlign: 'left' as const }]}>
                      {col.label}
                    </Text>
                  ))}
                </View>
                {/* Player rows */}
                {boxLines.map((player, idx) => (
                  <View key={idx} style={[s.liveBoxRow, idx < boxLines.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider }]}>
                    {BOX_COMPACT_COLS.map((col) => (
                      <Text key={col.key} style={[s.liveBoxCell, { width: col.width, color: col.key === 'name' ? colors.text : colors.textSecondary }, col.key === 'name' && { textAlign: 'left' as const, fontWeight: '600' }]}>
                        {getCellVal(player, col.key)}
                      </Text>
                    ))}
                  </View>
                ))}
                {/* Totals */}
                <View style={[s.liveBoxRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                  {BOX_COMPACT_COLS.map((col) => {
                    let val = '';
                    if (col.key === 'name') val = 'TOTAL';
                    else if (col.key === 'min') val = '';
                    else val = String(boxLines.reduce((sum, p) => sum + ((p as any)[col.key] ?? 0), 0));
                    return (
                      <Text key={col.key} style={[s.liveBoxCell, { width: col.width, color: colors.text, fontWeight: '700' }, col.key === 'name' && { textAlign: 'left' as const }]}>
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
        const parseStat = (str: string) => {
          const m = str.match(/^(\d+)-(\d+)\s*\((\d+\.?\d*)%\)$/);
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
          <View style={[s.liveTeamCard, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={s.liveTeamHeader}>
              <Text style={[s.liveTeamHeaderName, { color: colors.text }]}>KXT</Text>
              <Text style={[s.liveTeamHeaderName, { color: colors.text }]}>{opponentAbbr}</Text>
            </View>
            {rows.map((row, i) => {
              const isPctRow = row.label.includes('%');
              const fmuWins = row.label === 'TO' ? row.fmuN < row.oppN : row.fmuN > row.oppN;
              const oppWins = row.label === 'TO' ? row.oppN < row.fmuN : row.oppN > row.fmuN;
              return (
                <View key={row.label}>
                  {i > 0 && <View style={[s.divider, { backgroundColor: colors.divider }]} />}
                  <View style={s.liveTeamStatRow}>
                    <Text style={[s.liveTeamStatVal, { color: fmuWins ? colors.text : colors.textTertiary }]}>{row.fmu}</Text>
                    <Text style={[s.liveTeamStatLabel, { color: isPctRow ? colors.textTertiary : colors.textSecondary }]}>{row.label}</Text>
                    <Text style={[s.liveTeamStatVal, { color: oppWins ? colors.text : colors.textTertiary, textAlign: 'right' }]}>{row.opp}</Text>
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
                <Text style={[s.liveLeaderCatLabel, { color: colors.textTertiary }]}>{cat.label}</Text>
                <View style={s.liveLeaderSplit}>
                  {/* KaNeXT side */}
                  <View style={[s.liveLeaderCol, { backgroundColor: colors.backgroundSecondary }]}>
                    <Text style={[s.liveLeaderTeamLabel, { color: colors.textTertiary }]}>KXT</Text>
                    {topN(fmuBox, cat.key).map((p, i) => (
                      <View key={i} style={s.liveLeaderRow}>
                        <Text style={[s.liveLeaderName, { color: colors.text }]}>{p.name}</Text>
                        <Text style={[s.liveLeaderStat, { color: colors.text }]}>{p[cat.key]}</Text>
                      </View>
                    ))}
                  </View>
                  {/* OPP side */}
                  <View style={[s.liveLeaderCol, { backgroundColor: colors.backgroundSecondary }]}>
                    <Text style={[s.liveLeaderTeamLabel, { color: colors.textTertiary }]}>{opponentAbbr}</Text>
                    {topN(oppBox, cat.key).map((p, i) => (
                      <View key={i} style={s.liveLeaderRow}>
                        <Text style={[s.liveLeaderName, { color: colors.text }]}>{p.name}</Text>
                        <Text style={[s.liveLeaderStat, { color: colors.text }]}>{p[cat.key]}</Text>
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
  );
}

// ── Styles ──

const s = StyleSheet.create({
  container: {
    marginTop: Spacing.sm,
  },
  // Tab row
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
    borderBottomColor: '#EF4444',
  },
  liveTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  liveTabTextActive: {
    fontWeight: '700',
  },
  // Filter
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
  // PBP
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
  // Card / divider
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    padding: Spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: Spacing.lg,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
  // Box score
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
  // Team stats
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
  // Leaders
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
