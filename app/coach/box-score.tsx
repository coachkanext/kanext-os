/**
 * Full Box Score Page
 * NBA-style box score table for both teams.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  KaNeXT_GAMES_BY_ID,
  KaNeXT_BOX_SCORES,
  KaNeXT_RECORD,
  placeholderRecord,
  isConfGame,
  type BoxScoreLine,
} from '@/data/fmu';

// ── Stat columns (ESPN compact: no horizontal scroll) ──

type StatCol = { key: string; label: string; w: number };

const COMPACT_COLS: StatCol[] = [
  { key: 'min', label: 'MIN', w: 30 },
  { key: 'pts', label: 'PTS', w: 28 },
  { key: 'fg', label: 'FG', w: 38 },
  { key: 'threePt', label: '3PT', w: 34 },
  { key: 'reb', label: 'REB', w: 30 },
  { key: 'ast', label: 'AST', w: 28 },
  { key: 'to', label: 'TO', w: 24 },
  { key: 'pf', label: 'PF', w: 24 },
];

const FULL_COLS: StatCol[] = [
  { key: 'min', label: 'MIN', w: 32 },
  { key: 'pts', label: 'PTS', w: 30 },
  { key: 'fg', label: 'FG', w: 40 },
  { key: 'threePt', label: '3PT', w: 36 },
  { key: 'ft', label: 'FT', w: 36 },
  { key: 'reb', label: 'REB', w: 30 },
  { key: 'oreb', label: 'OREB', w: 36 },
  { key: 'dreb', label: 'DREB', w: 36 },
  { key: 'ast', label: 'AST', w: 30 },
  { key: 'stl', label: 'STL', w: 28 },
  { key: 'blk', label: 'BLK', w: 28 },
  { key: 'to', label: 'TO', w: 26 },
  { key: 'pf', label: 'PF', w: 26 },
];

function getCellValue(player: BoxScoreLine, key: string): string {
  switch (key) {
    case 'min': return player.min;
    case 'pts': return String(player.pts);
    case 'fg': return player.fg;
    case 'threePt': return player.threePt;
    case 'ft': return player.ft;
    case 'reb': return String(player.reb);
    case 'oreb': return String(Math.round(player.reb * 0.3));
    case 'dreb': return String(player.reb - Math.round(player.reb * 0.3));
    case 'ast': return String(player.ast);
    case 'stl': return String(player.stl);
    case 'blk': return String(player.blk);
    case 'to': return String(player.to);
    case 'pf': return String(player.pf);
    default: return '—';
  }
}

function sumField(lines: BoxScoreLine[], field: 'fg' | 'threePt' | 'ft'): { str: string; pct: string } {
  let m = 0, a = 0;
  for (const l of lines) {
    const parts = l[field].split('-');
    m += parseInt(parts[0]) || 0;
    a += parseInt(parts[1]) || 0;
  }
  return { str: `${m}-${a}`, pct: a > 0 ? `${Math.round((m / a) * 100)}%` : '—' };
}

function getTotalValue(lines: BoxScoreLine[], key: string): string {
  switch (key) {
    case 'min': return '';
    case 'pts': return String(lines.reduce((s, l) => s + l.pts, 0));
    case 'fg': return sumField(lines, 'fg').str;
    case 'threePt': return sumField(lines, 'threePt').str;
    case 'ft': return sumField(lines, 'ft').str;
    case 'reb': return String(lines.reduce((s, l) => s + l.reb, 0));
    case 'oreb': return String(lines.reduce((s, l) => s + Math.round(l.reb * 0.3), 0));
    case 'dreb': return String(lines.reduce((s, l) => s + (l.reb - Math.round(l.reb * 0.3)), 0));
    case 'ast': return String(lines.reduce((s, l) => s + l.ast, 0));
    case 'stl': return String(lines.reduce((s, l) => s + l.stl, 0));
    case 'blk': return String(lines.reduce((s, l) => s + l.blk, 0));
    case 'to': return String(lines.reduce((s, l) => s + l.to, 0));
    case 'pf': return String(lines.reduce((s, l) => s + l.pf, 0));
    default: return '';
  }
}

function formatPlayerName(name: string): string {
  const initial = name.charAt(0);
  return `${initial}. ${name}`;
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
      min: String(min), pts, reb, ast,
      fg: `${fgm}-${fga}`, threePt: `${tpm}-${tpa}`, ft: `${ftm}-${fta}`,
      stl, blk, to, pf,
    });
  }
  return players.sort((a, b) => b.pts - a.pts);
}

// ── Component ──

type GameStatus = 'upcoming' | 'live' | 'final';

export default function BoxScoreScreen() {
  const router = useRouter();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const game = (KaNeXT_GAMES_BY_ID as Record<string, { opponent: string; date: string; location: string; status: GameStatus; score?: string }>)[gameId ?? '']
    ?? { opponent: 'Unknown', date: '—', location: '—', status: 'upcoming' as GameStatus };

  const opponentAbbr = game.opponent.substring(0, 3).toUpperCase();
  const oppRecord = placeholderRecord(game.opponent, isConfGame(game.opponent));

  // Parse scores
  const scoreStr = game.score ?? '';
  const scoreParts = scoreStr.replace(/[WL]\s?/, '').split('-');
  const fmuScore = parseInt(scoreParts[0]) || 0;
  const oppScore = parseInt(scoreParts[1]) || 0;
  const isWin = fmuScore > oppScore;

  // Box score data
  const [showAllStats, setShowAllStats] = useState(false);
  const STAT_COLS = showAllStats ? FULL_COLS : COMPACT_COLS;

  const BOX_SCORE = KaNeXT_BOX_SCORES as Record<string, BoxScoreLine[]>;
  const KaNeXT_MOCK_NAMES = ['Selden', 'Morgan', 'Turner', 'Lewis', 'Carter', 'Noel', 'Thomas', 'Brewer', 'Morris', 'Thompson'];
  const realBoxScore = BOX_SCORE[gameId ?? ''] ?? [];
  const fmuBoxScore = realBoxScore.length > 0 ? realBoxScore : mockBoxScore('KaNeXT Sports', fmuScore, KaNeXT_MOCK_NAMES);
  const oppBoxScore = mockBoxScore(game.opponent, oppScore);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* App Bar */}
      <View style={[styles.appBar, { borderBottomColor: colors.divider }]}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, { backgroundColor: pressed ? colors.backgroundSecondary : 'transparent' }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.navigate({ pathname: '/coach/game-detail' as any, params: { gameId: gameId ?? '' } }); }}
        >
          <IconSymbol name="chevron.left" size={20} color={colors.text} />
        </Pressable>
        <Text style={[styles.appBarTitle, { color: colors.textSecondary }]}>Game</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Scoreboard + ESPN pills */}
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
            <Text style={[styles.scoreboardBigScore, { color: !isWin ? colors.text : colors.textTertiary }]}>{oppScore}</Text>
          </View>
          <View style={styles.scoreboardCenter}>
            <Text style={[styles.scoreboardFinal, { color: colors.textTertiary }]}>Final</Text>
            <Text style={[styles.scoreboardArrow, { color: colors.text }]}>{isWin ? '▸' : '◂'}</Text>
          </View>
          <View style={[styles.scoreboardSide, { flexDirection: 'row-reverse' }]}>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.scoreboardAbbr, { color: colors.text }]}>KXT</Text>
              <Text style={[styles.scoreboardRecord, { color: colors.textTertiary }]}>{FMU_RECORD.overall}</Text>
            </View>
            <View style={[styles.scoreboardIcon, { backgroundColor: colors.text + '15' }]}>
              <Text style={[styles.scoreboardIconText, { color: colors.text }]}>F</Text>
            </View>
            <Text style={[styles.scoreboardBigScore, { color: isWin ? colors.text : colors.textTertiary }]}>{fmuScore}</Text>
          </View>
        </View>

        <View style={[styles.espnTabRow, { borderTopColor: colors.divider }]}>
          {([
            { key: 'gamecast', label: 'KaNeXTCast' },
            { key: 'boxscore', label: 'Box Score' },
            { key: 'pbp', label: 'Play-by-Play' },
            { key: 'teamstats', label: 'Team Stats' },
          ] as const).map((tab) => {
            const isActive = tab.key === 'boxscore';
            return (
              <Pressable
                key={tab.key}
                style={[styles.espnTab, isActive && styles.espnTabActive]}
                onPress={() => {
                  if (tab.key === 'boxscore') return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (tab.key === 'gamecast') {
                    router.navigate({ pathname: '/coach/game-detail' as any, params: { gameId: gameId ?? '' } });
                  } else if (tab.key === 'pbp') {
                    router.navigate({ pathname: '/coach/play-by-play' as any, params: { gameId: gameId ?? '' } });
                  } else if (tab.key === 'teamstats') {
                    router.navigate({ pathname: '/coach/team-stats' as any, params: { gameId: gameId ?? '' } });
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

      {/* ESPN Box Score Tables */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40, gap: Spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {[
          { label: 'KaNeXT', lines: fmuBoxScore },
          { label: opponentAbbr, lines: oppBoxScore },
        ].map((team) => {
          const starters = team.lines.slice(0, 5);
          const bench = team.lines.slice(5);
          const fgTotals = sumField(team.lines, 'fg');
          const tpTotals = sumField(team.lines, 'threePt');
          const ftTotals = sumField(team.lines, 'ft');

          return (
            <View key={team.label} style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              {/* Team name header + All Stats toggle */}
              <View style={styles.teamHeader}>
                <View style={[styles.teamHeaderIcon, { backgroundColor: team.label === 'KaNeXT' ? colors.text + '15' : colors.backgroundTertiary }]}>
                  <Text style={[styles.teamHeaderIconText, { color: team.label === 'KaNeXT' ? colors.text : colors.textSecondary }]}>
                    {team.label.charAt(0)}
                  </Text>
                </View>
                <Text style={[styles.teamHeaderName, { color: colors.text }]}>{team.label}</Text>
                <View style={{ flex: 1 }} />
                <Pressable
                  style={styles.allStatsToggle}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowAllStats((v) => !v);
                  }}
                >
                  <Text style={[styles.allStatsText, { color: '#c8102e' }]}>
                    {showAllStats ? 'Less' : 'All Stats'}
                  </Text>
                  <IconSymbol
                    name={showAllStats ? 'chevron.left' : 'chevron.right'}
                    size={12}
                    color="#c8102e"
                  />
                </Pressable>
              </View>

              <ScrollView
                horizontal={showAllStats}
                scrollEnabled={showAllStats}
                showsHorizontalScrollIndicator={false}
              >
                <View style={showAllStats ? { width: 520 } : undefined}>
                  {/* Starters */}
                  <View style={[styles.sectionHeaderRow, { borderBottomColor: colors.divider }]}>
                    <Text style={[styles.sectionLabel, { color: colors.text }]}>STARTERS</Text>
                    <View style={styles.statCols}>
                      {STAT_COLS.map((col) => (
                        <Text key={col.key} style={[styles.colHeader, { color: colors.textTertiary, width: col.w }]}>{col.label}</Text>
                      ))}
                    </View>
                  </View>
                  {starters.map((p, i) => (
                    <View key={`s-${i}`} style={[styles.playerRow, { borderBottomColor: colors.divider }]}>
                      <Text style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>
                        {formatPlayerName(p.name)}
                      </Text>
                      <View style={styles.statCols}>
                        {STAT_COLS.map((col) => (
                          <Text
                            key={col.key}
                            style={[
                              styles.statCell,
                              { width: col.w, color: col.key === 'pts' ? colors.text : colors.textSecondary },
                              col.key === 'pts' && { fontWeight: '600' },
                            ]}
                          >
                            {getCellValue(p, col.key)}
                          </Text>
                        ))}
                      </View>
                    </View>
                  ))}

                  {/* Bench */}
                  {bench.length > 0 && (
                    <>
                      <View style={[styles.sectionHeaderRow, { borderBottomColor: colors.divider }]}>
                        <Text style={[styles.sectionLabel, { color: colors.text }]}>BENCH</Text>
                        <View style={styles.statCols}>
                          {STAT_COLS.map((col) => (
                            <Text key={col.key} style={[styles.colHeader, { color: colors.textTertiary, width: col.w }]}>{col.label}</Text>
                          ))}
                        </View>
                      </View>
                      {bench.map((p, i) => (
                        <View key={`b-${i}`} style={[styles.playerRow, { borderBottomColor: colors.divider }]}>
                          <Text style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>
                            {formatPlayerName(p.name)}
                          </Text>
                          <View style={styles.statCols}>
                            {STAT_COLS.map((col) => (
                              <Text
                                key={col.key}
                                style={[
                                  styles.statCell,
                                  { width: col.w, color: col.key === 'pts' ? colors.text : colors.textSecondary },
                                  col.key === 'pts' && { fontWeight: '600' },
                                ]}
                              >
                                {getCellValue(p, col.key)}
                              </Text>
                            ))}
                          </View>
                        </View>
                      ))}
                    </>
                  )}

                  {/* TEAM totals */}
                  <View style={[styles.teamTotalRow, { borderTopColor: colors.divider, borderBottomColor: colors.divider }]}>
                    <Text style={[styles.teamTotalLabel, { color: colors.textSecondary }]}>TEAM</Text>
                    <View style={styles.statCols}>
                      {STAT_COLS.map((col) => (
                        <Text key={col.key} style={[styles.statCell, { width: col.w, color: colors.text, fontWeight: '700' }]}>
                          {getTotalValue(team.lines, col.key)}
                        </Text>
                      ))}
                    </View>
                  </View>

                  {/* Percentage footer */}
                  <View style={styles.pctRow}>
                    <View style={{ flex: 1 }} />
                    <View style={styles.statCols}>
                      {STAT_COLS.map((col) => (
                        <Text key={col.key} style={[styles.statCell, { width: col.w, color: colors.textTertiary, fontWeight: '500' }]}>
                          {col.key === 'fg' ? fgTotals.pct : col.key === 'threePt' ? tpTotals.pct : col.key === 'ft' ? ftTotals.pct : ''}
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  backBtn: {
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
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: Spacing.md,
    paddingBottom: 4,
  },
  teamHeaderIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamHeaderIconText: {
    fontSize: 12,
    fontWeight: '700',
  },
  teamHeaderName: {
    fontSize: 15,
    fontWeight: '700',
  },
  allStatsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  allStatsText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    paddingHorizontal: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
  },
  sectionLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statCols: {
    flexDirection: 'row',
  },
  colHeader: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 11,
  },
  playerName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '400',
    marginRight: 4,
  },
  statCell: {
    fontSize: 12,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  teamTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 11,
  },
  teamTotalLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  pctRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
});
