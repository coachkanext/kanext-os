/**
 * Games Hub Screen
 * Four inner tabs: Games | Schedule | Leaders | News
 * Tap any game → game-detail screen (Prep / Live / Report).
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { TabFooter } from '@/components/tab-footer';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/core';
import { FIREBASE_LEADERS } from '@/data/firebase-lincoln';

// Same hub tabs as SportsHome — keeps navigation consistent across coach screens
const HUB_TABS = [
  { id: 'home', label: 'Home', route: '/(tabs)' },
  { id: 'roster', label: 'Roster', route: '/(tabs)' },
  { id: 'games', label: 'Games' },
  { id: 'injuries', label: 'Injuries', route: '/coach/injuries' },
  { id: 'program-context', label: 'Team System', route: '/coach/program-context' },
  { id: 'recruiting', label: 'Recruiting', route: '/coach/recruiting' },
  { id: 'film', label: 'Film', route: '/coach/film' },
];

// ── Demo Data ──

type GameStatus = 'upcoming' | 'live' | 'final';

interface Game {
  id: string;
  opponent: string;
  date: string;
  location: string;
  status: GameStatus;
  score?: string;
  clock?: string;
}

const ALL_GAMES: Game[] = [
  // Final (away losses)
  { id: '-Odr30YnjKA38ZfBZ6qB', opponent: 'UNLV', date: 'Game 1', location: 'Away', status: 'final', score: 'L 59-123' },
  { id: '-OgbmTnXpz994rOErPEo', opponent: 'Loyola Marymount', date: 'Game 2', location: 'Away', status: 'final', score: 'L 54-137' },
  { id: '-OgbzyEnODgmhH7yyXSJ', opponent: 'Pepperdine', date: 'Game 3', location: 'Away', status: 'final', score: 'L 76-113' },
  { id: '-OgcD9jAtLd0IFGX7lwI', opponent: 'UC Irvine', date: 'Game 4', location: 'Away', status: 'final', score: 'L 63-130' },
  { id: '-Ogd2OxdplE_N1hzwR_W', opponent: 'Cal Maritime', date: 'Game 5', location: 'Away', status: 'final', score: 'L 102-108' },
  // Final (wins)
  { id: '-OgdZ7wZowES0FYO8FYE', opponent: 'Ohlone', date: 'Game 6', location: 'Away', status: 'final', score: 'W 90-86' },
  { id: '-OgjOc5JGIhECeCvETY6', opponent: 'Simpson University', date: 'Game 7', location: 'Home', status: 'final', score: 'W 86-79' },
  { id: '-Oi5tiQ8LDRW9FEUs_gf', opponent: 'Cal Maritime', date: 'Game 8', location: 'Home', status: 'final', score: 'W 102-96' },
  { id: '-OjE19psxjUfBfqrHZnB', opponent: 'Cal Miramar', date: 'Game 9', location: 'Home', status: 'final', score: 'W 114-86' },
  { id: '-OjOHCO32yY5URlwq6su', opponent: 'Cal Miramar', date: 'Game 10', location: 'Home', status: 'final', score: 'W 93-73' },
  { id: '-Ojn37CBTNgN9KpQQ22V', opponent: 'Cal Prestige Tigers', date: 'Game 11', location: 'Home', status: 'final', score: 'W 127-60' },
  { id: '-OkM7ZQIrwSjI9U37UGd', opponent: 'Bethesda', date: 'Game 12', location: 'Home', status: 'final', score: 'W 112-88' },
  // Upcoming
  { id: '-OitEKyFF5d9L8N0TgJR', opponent: 'Cal State East Bay', date: 'Game 13', location: 'Away', status: 'live', score: '34-28', clock: 'Q2 4:12' },
];

// Derive leaders from Firebase canonical data
type LeaderEntry = { name: string; value: string };

function topN(sorted: typeof FIREBASE_LEADERS, key: 'ppg' | 'rpg' | 'apg' | 'spg' | 'bpg' | 'fgPct' | 'threePct' | 'ftPct', isPct: boolean, n = 3): LeaderEntry[] {
  return sorted.slice(0, n).map((p) => ({
    name: p.name,
    value: isPct ? `${p[key].toFixed(1)}%` : p[key].toFixed(1),
  }));
}

const fbByPpg = [...FIREBASE_LEADERS].sort((a, b) => b.ppg - a.ppg);
const fbByRpg = [...FIREBASE_LEADERS].sort((a, b) => b.rpg - a.rpg);
const fbByApg = [...FIREBASE_LEADERS].sort((a, b) => b.apg - a.apg);
const fbBySpg = [...FIREBASE_LEADERS].sort((a, b) => b.spg - a.spg);
const fbByBpg = [...FIREBASE_LEADERS].sort((a, b) => b.bpg - a.bpg);
const fbByFg = [...FIREBASE_LEADERS].sort((a, b) => b.fgPct - a.fgPct);
const fbBy3p = [...FIREBASE_LEADERS].filter((p) => p.gamesPlayed >= 4).sort((a, b) => b.threePct - a.threePct);
const fbByFt = [...FIREBASE_LEADERS].filter((p) => p.gamesPlayed >= 4).sort((a, b) => b.ftPct - a.ftPct);

const LEADERS: { category: string; top3: LeaderEntry[] }[] = [
  { category: 'PPG', top3: topN(fbByPpg, 'ppg', false) },
  { category: 'RPG', top3: topN(fbByRpg, 'rpg', false) },
  { category: 'APG', top3: topN(fbByApg, 'apg', false) },
  { category: 'SPG', top3: topN(fbBySpg, 'spg', false) },
  { category: 'BPG', top3: topN(fbByBpg, 'bpg', false) },
  { category: 'FG%', top3: topN(fbByFg, 'fgPct', true) },
  { category: '3P%', top3: topN(fbBy3p, 'threePct', true) },
  { category: 'FT%', top3: topN(fbByFt, 'ftPct', true) },
];

const NEWS_ITEMS = [
  { id: 'n1', headline: 'Lincoln Cruises Past Bethesda 112-88', date: 'Game 12', type: 'Recap' },
  { id: 'n2', headline: 'Lincoln Dominates Cal Prestige Tigers 127-60', date: 'Game 11', type: 'Recap' },
  { id: 'n3', headline: 'Lincoln Secures 93-73 Victory Over Cal Miramar', date: 'Game 10', type: 'Recap' },
  { id: 'n4', headline: 'Kalejaiye Leads 114-86 Rout of Cal Miramar', date: 'Game 9', type: 'Recap' },
];

// ── Types ──

type Tab = 'games' | 'schedule' | 'leaders' | 'standings' | 'news';

const TABS: { key: Tab; label: string }[] = [
  { key: 'games', label: 'Feed' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'leaders', label: 'Leaders' },
  { key: 'standings', label: 'Standings' },
  { key: 'news', label: 'News' },
];

// Demo standings data
const STANDINGS = [
  { team: 'Lincoln', confW: 0, confL: 0, overallW: 7, overallL: 5, streak: 'W7' },
];

const STATUS_COLORS: Record<GameStatus, string> = {
  upcoming: '#6e6e6e',
  live: '#EF4444',
  final: '#f5f5f5',
};

const STATUS_LABELS: Record<GameStatus, string> = {
  upcoming: 'UPCOMING',
  live: 'LIVE',
  final: 'FINAL',
};

// ── Status Pill ──

function StatusPill({ status }: { status: GameStatus }) {
  return (
    <View style={[styles.statusPill, { backgroundColor: STATUS_COLORS[status] + '18' }]}>
      {status === 'live' && <View style={styles.liveDot} />}
      <Text style={[styles.statusText, { color: STATUS_COLORS[status] }]}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

// ── Game Row (shared between Games + Schedule) ──

function GameRow({
  game,
  colors,
  onPress,
}: {
  game: Game;
  colors: typeof Colors['light'];
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.gameRow, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      <View style={styles.gameRowLeft}>
        <Text style={[styles.opponentText, { color: colors.text }]}>{game.opponent}</Text>
        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
          {game.date} · {game.location}
        </Text>
      </View>
      <View style={styles.gameRowRight}>
        <StatusPill status={game.status} />
        {game.score && (
          <Text
            style={[
              styles.scoreText,
              {
                color: game.status === 'final'
                  ? game.score.startsWith('W') ? '#f5f5f5' : game.score.startsWith('L') ? '#EF4444' : colors.text
                  : colors.text,
              },
            ]}
          >
            {game.score}
          </Text>
        )}
        {game.status === 'live' && game.clock && (
          <Text style={[styles.clockText, { color: colors.textTertiary }]}>{game.clock}</Text>
        )}
      </View>
    </Pressable>
  );
}

// ── Main Screen ──

export default function GamesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('games');
  const [search, setSearch] = useState('');
  const [gameOpsMap, setGameOpsMap] = useState<Record<string, any>>({});
  const [expandedLeader, setExpandedLeader] = useState<string | null>(null);

  // Load Game Ops data for all games on focus
  useFocusEffect(
    useCallback(() => {
      const loadAll = async () => {
        const map: Record<string, any> = {};
        for (const game of ALL_GAMES) {
          try {
            const json = await AsyncStorage.getItem(`kx:gameOps:${game.id}`);
            if (json) {
              const parsed = JSON.parse(json);
              if (parsed.phase === 'active' || parsed.phase === 'locked') {
                map[game.id] = parsed;
              }
            }
          } catch {}
        }
        setGameOpsMap(map);
      };
      loadAll();
    }, [])
  );

  // Apply Game Ops overrides to game list
  const effectiveGames: Game[] = ALL_GAMES.map((game) => {
    const lo = gameOpsMap[game.id];
    if (!lo) return game;
    if (lo.phase === 'locked') {
      const isWin = lo.luScore > lo.oppScore;
      return {
        ...game,
        status: 'final' as GameStatus,
        score: `${isWin ? 'W' : lo.luScore < lo.oppScore ? 'L' : 'T'} ${lo.luScore}-${lo.oppScore}`,
        clock: undefined,
      };
    }
    if (lo.phase === 'active') {
      return {
        ...game,
        status: 'live' as GameStatus,
        score: `${lo.luScore}-${lo.oppScore}`,
      };
    }
    return game;
  });

  const navigateToGame = (gameId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/coach/game-detail', params: { gameId } } as any);
  };

  // Sort: live games first, then rest in original order
  const sortedGames = [...effectiveGames].sort((a, b) => {
    if (a.status === 'live' && b.status !== 'live') return -1;
    if (a.status !== 'live' && b.status === 'live') return 1;
    return 0;
  });

  // Filter for Games tab search
  const filteredGames = search.trim()
    ? sortedGames.filter((g) => g.opponent.toLowerCase().includes(search.toLowerCase()))
    : sortedGames;

  const upcomingGames = effectiveGames.filter((g) => g.status === 'upcoming' || g.status === 'live');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hub Tabs (same as SportsHome) */}
      <View style={[styles.hubTabsContainer, { borderBottomColor: colors.divider, backgroundColor: colors.background }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hubTabsContent}
          >
            {HUB_TABS.map((tab) => {
              const isActive = tab.id === 'games';
              return (
                <Pressable
                  key={tab.id}
                  style={[
                    styles.hubTab,
                    isActive && [styles.hubTabActive, { borderBottomColor: colors.text }],
                  ]}
                  onPress={() => {
                    if (tab.id === 'games') return; // already here
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (tab.id === 'home' || tab.id === 'roster') {
                      router.back();
                    } else if (tab.route) {
                      router.replace(tab.route as any);
                    }
                  }}
                >
                  <ThemedText
                    style={[
                      styles.hubTabLabel,
                      { color: isActive ? colors.text : colors.textTertiary },
                      isActive && styles.hubTabLabelActive,
                    ]}
                  >
                    {tab.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

      {/* Tab Bar */}
      <View style={[styles.tabRow, { backgroundColor: colors.background }]}>
        {TABS.map((tab) => {
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

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Games Tab ── */}
        {activeTab === 'games' && (
          <View>
            {/* Search */}
            <View style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary }]}>
              <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search games..."
                placeholderTextColor={colors.textTertiary}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              {filteredGames.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                    No games found.
                  </Text>
                </View>
              ) : (
                filteredGames.map((game, index) => (
                  <View key={game.id}>
                    {index > 0 && (
                      <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                    )}
                    <GameRow game={game} colors={colors} onPress={() => navigateToGame(game.id)} />
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* ── Schedule Tab ── */}
        {activeTab === 'schedule' && (
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            {upcomingGames.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                  No upcoming games.
                </Text>
              </View>
            ) : (
              upcomingGames.map((game, index) => (
                <View key={game.id}>
                  {index > 0 && (
                    <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                  )}
                  <Pressable
                    style={({ pressed }) => [styles.scheduleRow, pressed && { opacity: 0.7 }]}
                    onPress={() => navigateToGame(game.id)}
                  >
                    <View style={styles.scheduleDateCol}>
                      <Text style={[styles.scheduleDateText, { color: colors.text }]}>
                        {game.date}
                      </Text>
                      <Text style={[styles.scheduleLocationText, { color: colors.textTertiary }]}>
                        {game.location}
                      </Text>
                    </View>
                    <Text style={[styles.scheduleOpponent, { color: colors.text }]}>
                      {game.opponent}
                    </Text>
                    {game.status === 'live' && <StatusPill status="live" />}
                    <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
                  </Pressable>
                </View>
              ))
            )}
          </View>
        )}

        {/* ── Leaders Tab ── */}
        {activeTab === 'leaders' && (
          <View>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              SEASON LEADERS
            </Text>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              {LEADERS.map((leader, index) => {
                const isExpanded = expandedLeader === leader.category;
                return (
                  <View key={leader.category}>
                    {index > 0 && (
                      <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                    )}
                    <Pressable
                      style={styles.leaderRow}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setExpandedLeader(isExpanded ? null : leader.category);
                      }}
                    >
                      <View style={[styles.leaderBadge, { backgroundColor: colors.backgroundTertiary }]}>
                        <Text style={[styles.leaderCategory, { color: colors.textSecondary }]}>
                          {leader.category}
                        </Text>
                      </View>
                      <View style={styles.leaderInfo}>
                        <Text style={[styles.leaderName, { color: colors.text }]}>{leader.top3[0].name}</Text>
                      </View>
                      <Text style={[styles.leaderValue, { color: colors.text }]}>{leader.top3[0].value}</Text>
                      <IconSymbol
                        name={isExpanded ? 'chevron.up' : 'chevron.down'}
                        size={14}
                        color={colors.textTertiary}
                      />
                    </Pressable>
                    {isExpanded && leader.top3.slice(1).map((entry, i) => (
                      <View key={i} style={[styles.leaderSubRow, { backgroundColor: colors.backgroundTertiary }]}>
                        <Text style={[styles.leaderRank, { color: colors.textTertiary }]}>{i + 2}</Text>
                        <View style={styles.leaderInfo}>
                          <Text style={[styles.leaderSubName, { color: colors.textSecondary }]}>{entry.name}</Text>
                        </View>
                        <Text style={[styles.leaderSubValue, { color: colors.textSecondary }]}>{entry.value}</Text>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Standings Tab ── */}
        {activeTab === 'standings' && (
          <View>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              STANDINGS
            </Text>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              {/* Table header */}
              <View style={[styles.standingsHeaderRow, { borderBottomColor: colors.divider }]}>
                <Text style={[styles.standingsTeamHeader, { color: colors.textTertiary }]}>TEAM</Text>
                <Text style={[styles.standingsColHeader, { color: colors.textTertiary }]}>CONF</Text>
                <Text style={[styles.standingsColHeader, { color: colors.textTertiary }]}>OVR</Text>
                <Text style={[styles.standingsColHeader, { color: colors.textTertiary }]}>STK</Text>
              </View>
              {STANDINGS.map((row, index) => {
                const isUs = row.team === 'Lincoln';
                return (
                  <View key={row.team}>
                    {index > 0 && (
                      <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                    )}
                    <View style={[styles.standingsRow, isUs && { backgroundColor: colors.backgroundTertiary }]}>
                      <View style={styles.standingsTeamCol}>
                        <Text style={[styles.standingsRank, { color: colors.textTertiary }]}>{index + 1}</Text>
                        <Text style={[styles.standingsTeamName, { color: colors.text }, isUs && { fontWeight: '700' }]}>
                          {row.team}
                        </Text>
                      </View>
                      <Text style={[styles.standingsRecord, { color: colors.text }]}>
                        {row.confW}-{row.confL}
                      </Text>
                      <Text style={[styles.standingsRecord, { color: colors.textSecondary }]}>
                        {row.overallW}-{row.overallL}
                      </Text>
                      <Text style={[styles.standingsStreak, { color: row.streak.startsWith('W') ? '#f5f5f5' : '#EF4444' }]}>
                        {row.streak}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── News Tab ── */}
        {activeTab === 'news' && (
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            {NEWS_ITEMS.map((item, index) => (
              <View key={item.id}>
                {index > 0 && (
                  <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                )}
                <Pressable
                  style={({ pressed }) => [styles.newsRow, pressed && { opacity: 0.7 }]}
                >
                  <View style={styles.newsContent}>
                    <Text style={[styles.newsType, { color: colors.textTertiary }]}>{item.type}</Text>
                    <Text style={[styles.newsHeadline, { color: colors.text }]}>{item.headline}</Text>
                    <Text style={[styles.newsDate, { color: colors.textTertiary }]}>{item.date}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TabFooter activeTab="Home" />
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Hub tabs (mirrors SportsHome)
  hubTabsContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  hubTabsContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  hubTab: {
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  hubTabActive: {
    borderBottomWidth: 2,
  },
  hubTabLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  hubTabLabelActive: {
    fontWeight: '600',
  },

  // Tab bar
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 8,
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

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },

  // Card container
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },

  // Game row (Games tab)
  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  gameRowLeft: {
    flex: 1,
  },
  opponentText: {
    fontSize: 15,
    fontWeight: '600',
  },
  metaText: {
    fontSize: 13,
    marginTop: 2,
  },
  gameRowRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  clockText: {
    fontSize: 12,
  },

  // Status pill
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },

  // Schedule row
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 8,
  },
  scheduleDateCol: {
    width: 70,
  },
  scheduleDateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scheduleLocationText: {
    fontSize: 12,
    marginTop: 2,
  },
  scheduleOpponent: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },

  // Leaders
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 12,
  },
  leaderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    minWidth: 44,
    alignItems: 'center',
  },
  leaderCategory: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    fontSize: 15,
    fontWeight: '500',
  },
  leaderValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  leaderSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    paddingLeft: Spacing.md + 44 + 12, // align with name (badge width + gap)
    gap: 12,
  },
  leaderRank: {
    fontSize: 13,
    fontWeight: '600',
    width: 16,
  },
  leaderSubName: {
    fontSize: 14,
    fontWeight: '400',
  },
  leaderSubValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Standings
  standingsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  standingsTeamHeader: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  standingsColHeader: {
    width: 50,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  standingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  standingsTeamCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  standingsRank: {
    fontSize: 13,
    fontWeight: '600',
    width: 18,
  },
  standingsTeamName: {
    fontSize: 15,
    fontWeight: '500',
  },
  standingsRecord: {
    width: 50,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  standingsStreak: {
    width: 50,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },

  // News
  newsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 8,
  },
  newsContent: {
    flex: 1,
  },
  newsType: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  newsHeadline: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  newsDate: {
    fontSize: 12,
    marginTop: 4,
  },

  // Empty state
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
});
