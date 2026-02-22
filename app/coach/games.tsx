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
import { KaNeXT_GAMES, KaNeXT_LEADERS, KaNeXT_STANDINGS, KaNeXT_NEWS, KaNeXT_GAME_BPR, getBPRColor, type PlayerBPR } from '@/data/fmu';

// Same hub tabs as SportsHome — keeps navigation consistent across coach screens
const HUB_TABS = [
  { id: 'home', label: 'Home', route: '/(tabs)' },
  { id: 'recruiting', label: 'Recruiting', route: '/(tabs)' },
  { id: 'roster', label: 'Roster', route: '/(tabs)' },
  { id: 'schedule', label: 'Schedule', route: '/(tabs)' },
  { id: 'stats', label: 'Stats', route: '/(tabs)' },
  { id: 'game-ops', label: 'Game Ops', route: '/(tabs)' },
  { id: 'program', label: 'Program', route: '/(tabs)' },
  { id: 'development', label: 'Development', route: '/(tabs)' },
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
  gameType?: string;
  opponentKR?: number;
  opponentRecord?: string;
  gameTime?: string;
  venue?: string;
}

const ALL_GAMES: Game[] = KaNeXT_GAMES;

// Derive leaders from Firebase canonical data
type LeaderEntry = { name: string; value: string };

function topN(sorted: typeof KaNeXT_LEADERS, key: 'ppg' | 'rpg' | 'apg' | 'spg' | 'bpg' | 'fgPct' | 'threePct' | 'ftPct', isPct: boolean, n = 3): LeaderEntry[] {
  return sorted.slice(0, n).map((p) => ({
    name: p.name,
    value: isPct ? `${p[key].toFixed(1)}%` : p[key].toFixed(1),
  }));
}

const fbByPpg = [...FMU_LEADERS].sort((a, b) => b.ppg - a.ppg);
const fbByRpg = [...FMU_LEADERS].sort((a, b) => b.rpg - a.rpg);
const fbByApg = [...FMU_LEADERS].sort((a, b) => b.apg - a.apg);
const fbBySpg = [...FMU_LEADERS].sort((a, b) => b.spg - a.spg);
const fbByBpg = [...FMU_LEADERS].sort((a, b) => b.bpg - a.bpg);
const fbByFg = [...FMU_LEADERS].sort((a, b) => b.fgPct - a.fgPct);
const fbBy3p = [...FMU_LEADERS].filter((p) => p.gamesPlayed >= 4).sort((a, b) => b.threePct - a.threePct);
const fbByFt = [...FMU_LEADERS].filter((p) => p.gamesPlayed >= 4).sort((a, b) => b.ftPct - a.ftPct);

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

const NEWS_ITEMS = KaNeXT_NEWS;

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
const STANDINGS = KaNeXT_STANDINGS;

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

// ── Game Row (expandable dropdown) ──

function GameRow({
  game,
  colors,
  expanded,
  onToggle,
  onNavigate,
}: {
  game: Game;
  colors: typeof Colors['light'];
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  return (
    <View>
      <Pressable
        style={({ pressed }) => [styles.gameRow, pressed && { opacity: 0.7 }]}
        onPress={onToggle}
      >
        <View style={styles.gameRowLeft}>
          <View style={styles.opponentRow}>
            <Text style={[styles.opponentText, { color: colors.text }]}>{game.opponent}</Text>
            {game.opponentKR != null && game.opponentKR > 0 && (
              <Text style={[styles.krText, { color: colors.textTertiary }]}>#{game.opponentKR} KR</Text>
            )}
          </View>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {game.date}{game.gameTime ? ` · ${game.gameTime}` : ''} · {game.venue ?? game.location}
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
        <IconSymbol
          name={expanded ? 'chevron.up' : 'chevron.down'}
          size={14}
          color={colors.textTertiary}
          style={{ marginLeft: 8 }}
        />
      </Pressable>

      {expanded && (
        <View style={[styles.gameDropdown, { backgroundColor: colors.backgroundTertiary }]}>
          {game.status === 'final' && KaNeXT_GAME_BPR[game.id] ? (
            <>
              {FMU_GAME_BPR[game.id].slice(0, 8).map((p, i) => (
                <View key={i} style={styles.bprRow}>
                  <View style={styles.bprLeft}>
                    <Text style={[styles.bprName, { color: colors.text }]}>
                      {p.name} <Text style={{ color: colors.textTertiary, fontWeight: '400' }}>{'\u2014'} {p.archetype}</Text>
                    </Text>
                    <Text style={[styles.bprValue, { color: getBPRColor(p.bpr) }]}>
                      BPR {p.bpr > 0 ? '+' : ''}{p.bpr} <Text style={styles.bprLabel}>({p.bprLabel})</Text>
                    </Text>
                  </View>
                  <Text style={[styles.bprKr, { color: colors.textTertiary }]}>KR {p.kr}</Text>
                </View>
              ))}
            </>
          ) : (
            <View style={styles.gameDropdownMeta}>
              {game.gameType && (
                <View style={[styles.gameDropdownTag, { backgroundColor: colors.backgroundSecondary }]}>
                  <Text style={[styles.gameDropdownTagText, { color: colors.textSecondary }]}>{game.gameType}</Text>
                </View>
              )}
              {game.gameTime && (
                <View style={[styles.gameDropdownTag, { backgroundColor: colors.backgroundSecondary }]}>
                  <Text style={[styles.gameDropdownTagText, { color: colors.textSecondary }]}>{game.gameTime}</Text>
                </View>
              )}
              {game.opponentRecord && (
                <Text style={[styles.gameDropdownDetail, { color: colors.textSecondary }]}>
                  Opp Record: {game.opponentRecord}
                </Text>
              )}
              {game.opponentKR != null && game.opponentKR > 0 && (
                <Text style={[styles.gameDropdownDetail, { color: colors.textSecondary }]}>
                  KenPom: #{game.opponentKR}
                </Text>
              )}
            </View>
          )}
          <Pressable
            style={({ pressed }) => [styles.gameDropdownButton, { backgroundColor: colors.text }, pressed && { opacity: 0.8 }]}
            onPress={onNavigate}
          >
            <Text style={[styles.gameDropdownButtonText, { color: colors.background }]}>
              {game.status === 'live' ? 'View Live' : game.status === 'final' ? 'View Report' : 'Game Preview'}
            </Text>
            <IconSymbol name="chevron.right" size={14} color={colors.background} />
          </Pressable>
        </View>
      )}
    </View>
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
  const [expandedGame, setExpandedGame] = useState<string | null>(null);

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

  const upcomingGames = effectiveGames.filter((g) => g.status === 'upcoming');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hub Tabs (same as SportsHome) */}
      <View style={[styles.hubTabsContainer, { borderBottomColor: colors.divider, backgroundColor: colors.background }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hubTabsContent}
          >
            {HUB_TABS.map((tab) => (
                <Pressable
                  key={tab.id}
                  style={styles.hubTab}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.navigate({ pathname: '/(tabs)/index', params: { hubTab: '2' } } as any);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.hubTabLabel,
                      { color: colors.textTertiary },
                    ]}
                  >
                    {tab.label}
                  </ThemedText>
                </Pressable>
            ))}
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
            {/* Pinned Live Game with Screen — same as home page media card */}
            {(() => {
              const liveGame = ALL_GAMES.find((g) => g.status === 'live');
              if (!liveGame) return null;
              return (
                <Pressable
                  style={({ pressed }) => [styles.liveMediaCard, { backgroundColor: '#000' }, pressed && { opacity: 0.85 }]}
                  onPress={() => navigateToGame(liveGame.id)}
                >
                  <View style={styles.liveScreen}>
                    <View style={styles.livePlayBtn}>
                      <IconSymbol name="play.fill" size={24} color="#fff" />
                    </View>
                  </View>
                  <View style={[styles.liveInfoRow, { flexDirection: 'column', alignItems: 'stretch', position: 'relative' }]}>
                    <View style={styles.liveBadgeRow}>
                      <View style={styles.liveCardDot} />
                      <Text style={styles.liveCardLabel}>LIVE</Text>
                    </View>
                    <Text style={[styles.liveOpponentText, { color: '#fff', paddingRight: 100 }]}>
                      {liveGame.location === 'Home' ? 'vs' : '@'} {liveGame.opponent}{liveGame.opponentKR ? ` (${liveGame.opponentKR})` : ''}
                    </Text>
                    {liveGame.opponentRecord && (
                      <Text style={{ fontSize: 13, color: '#999', marginTop: 2 }}>{liveGame.opponentRecord}</Text>
                    )}
                    <View style={{ position: 'absolute', right: 12, top: 12, alignItems: 'flex-end' }}>
                      {liveGame.score && (
                        <Text style={[styles.liveScoreText, { color: '#fff' }]}>{liveGame.score}</Text>
                      )}
                      {liveGame.clock && (
                        <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{liveGame.clock}</Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })()}

            {/* Upcoming games — GameRow with expandable dropdown */}
            {(() => {
              const upcoming = filteredGames.filter((g) => g.status === 'upcoming');
              if (upcoming.length === 0) return null;
              return (
                <>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>UPCOMING</Text>
                  <View style={[styles.card, { backgroundColor: colors.backgroundSecondary, marginBottom: Spacing.md }]}>
                    {upcoming.map((game, index) => (
                      <View key={game.id}>
                        {index > 0 && (
                          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                        )}
                        <GameRow
                          game={game}
                          colors={colors}
                          expanded={expandedGame === game.id}
                          onToggle={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setExpandedGame(expandedGame === game.id ? null : game.id);
                          }}
                          onNavigate={() => navigateToGame(game.id)}
                        />
                      </View>
                    ))}
                  </View>
                </>
              );
            })()}

            {/* Search between upcoming and completed */}
            <View style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary, marginBottom: Spacing.md }]}>
              <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search games..."
                placeholderTextColor={colors.textTertiary}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* Completed games — Recent style with inline BPR panel */}
            {(() => {
              const completed = filteredGames.filter((g) => g.status === 'final');
              if (completed.length === 0) return null;
              return (
                <>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>COMPLETED</Text>
                  <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
                    {completed.map((game, index) => {
                      const isWin = game.score?.startsWith('W');
                      const isLoss = game.score?.startsWith('L');
                      const scoreDisplay = game.score?.replace('-', '–') ?? '';
                      return (
                        <View key={game.id}>
                          {index > 0 && (
                            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                          )}
                          <View>
                            <View style={styles.recentRow}>
                              <Pressable
                                style={({ pressed }) => [{ flex: 1 }, pressed && { opacity: 0.7 }]}
                                onPress={() => {
                                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                  setExpandedGame(expandedGame === game.id ? null : game.id);
                                }}
                              >
                                <Text style={[styles.recentOpponent, { color: colors.text }]}>
                                  {game.location === 'Home' ? 'vs' : '@'} {game.opponent}{game.opponentKR ? ` (${game.opponentKR} KR)` : ''}
                                </Text>
                                {game.opponentRecord && (
                                  <Text style={[styles.recentMeta, { color: colors.textTertiary }]}>
                                    {game.opponentRecord}
                                  </Text>
                                )}
                                <Text style={[styles.recentMeta, { color: colors.textTertiary }]}>
                                  {game.date}{game.gameTime ? ` · ${game.gameTime}` : ''} · {game.gameType ?? 'NON-CONF'} · {game.venue ?? game.location}
                                </Text>
                              </Pressable>
                              <Pressable
                                style={({ pressed }) => [styles.recentRight, pressed && { opacity: 0.7 }]}
                                onPress={() => navigateToGame(game.id)}
                              >
                                <View style={[styles.recentPill, { backgroundColor: '#f5f5f518' }]}>
                                  <Text style={[styles.recentPillText, { color: '#f5f5f5' }]}>
                                    FINAL
                                  </Text>
                                </View>
                                <Text style={[styles.recentScore, { color: isWin ? '#f5f5f5' : isLoss ? '#EF4444' : colors.text }]}>
                                  {scoreDisplay}
                                </Text>
                              </Pressable>
                            </View>

                            {/* Inline BPR Panel */}
                            {expandedGame === game.id && KaNeXT_GAME_BPR[game.id] && (
                              <View style={[styles.bprPanel, { backgroundColor: colors.backgroundTertiary }]}>
                                {FMU_GAME_BPR[game.id].map((p, i) => (
                                  <View key={i} style={styles.bprPanelRow}>
                                    <View style={{ flex: 1 }}>
                                      <Text style={[styles.bprPanelName, { color: colors.text }]}>
                                        {p.name} <Text style={{ color: colors.textTertiary, fontWeight: '400', fontSize: 11 }}>{'\u2014'} {p.archetype}</Text>
                                      </Text>
                                      <Text style={[styles.bprPanelValue, { color: getBPRColor(p.bpr) }]}>
                                        BPR {p.bpr > 0 ? '+' : ''}{p.bpr} <Text style={styles.bprPanelLabel}>({p.bprLabel})</Text>
                                      </Text>
                                    </View>
                                    <Text style={[styles.bprPanelKr, { color: colors.textTertiary }]}>{p.kr} KR</Text>
                                  </View>
                                ))}
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </>
              );
            })()}
          </View>
        )}

        {/* ── Schedule Tab ── */}
        {activeTab === 'schedule' && (
          <View>
            {/* Pinned Live Game with Screen — same as home page media card */}
            {(() => {
              const liveGame = ALL_GAMES.find((g) => g.status === 'live');
              if (!liveGame) return null;
              return (
                <Pressable
                  style={({ pressed }) => [styles.liveMediaCard, { backgroundColor: '#000' }, pressed && { opacity: 0.85 }]}
                  onPress={() => navigateToGame(liveGame.id)}
                >
                  <View style={styles.liveScreen}>
                    <View style={styles.livePlayBtn}>
                      <IconSymbol name="play.fill" size={24} color="#fff" />
                    </View>
                  </View>
                  <View style={[styles.liveInfoRow, { flexDirection: 'column', alignItems: 'stretch', position: 'relative' }]}>
                    <View style={styles.liveBadgeRow}>
                      <View style={styles.liveCardDot} />
                      <Text style={styles.liveCardLabel}>LIVE</Text>
                    </View>
                    <Text style={[styles.liveOpponentText, { color: '#fff', paddingRight: 100 }]}>
                      {liveGame.location === 'Home' ? 'vs' : '@'} {liveGame.opponent}{liveGame.opponentKR ? ` (${liveGame.opponentKR})` : ''}
                    </Text>
                    {liveGame.opponentRecord && (
                      <Text style={{ fontSize: 13, color: '#999', marginTop: 2 }}>{liveGame.opponentRecord}</Text>
                    )}
                    <View style={{ position: 'absolute', right: 12, top: 12, alignItems: 'flex-end' }}>
                      {liveGame.score && (
                        <Text style={[styles.liveScoreText, { color: '#fff' }]}>{liveGame.score}</Text>
                      )}
                      {liveGame.clock && (
                        <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{liveGame.clock}</Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })()}

            {/* Upcoming */}
            {upcomingGames.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>UPCOMING</Text>
                <View style={[styles.card, { backgroundColor: colors.backgroundSecondary, marginBottom: Spacing.md }]}>
                  {upcomingGames.map((game, index) => (
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
                            {game.date}{game.gameTime ? ` · ${game.gameTime}` : ''}
                          </Text>
                          <Text style={[styles.scheduleLocationText, { color: colors.textTertiary }]}>
                            {game.venue ?? game.location}
                          </Text>
                        </View>
                        <Text style={[styles.scheduleOpponent, { color: colors.text }]}>
                          {game.opponent}
                        </Text>
                        {game.status === 'live' && <StatusPill status="live" />}
                        <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Search bar between sections */}
            <View style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary, marginBottom: Spacing.md }]}>
              <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search completed games..."
                placeholderTextColor={colors.textTertiary}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* Completed */}
            {(() => {
              const completed = effectiveGames.filter((g) => g.status === 'final');
              const filtered = search.trim()
                ? completed.filter((g) => g.opponent.toLowerCase().includes(search.toLowerCase()))
                : completed;
              if (completed.length === 0) return null;
              return (
                <>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>COMPLETED</Text>
                  <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
                    {filtered.map((game, index) => (
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
                              {game.date}{game.gameTime ? ` · ${game.gameTime}` : ''}
                            </Text>
                            <Text style={[styles.scheduleLocationText, { color: colors.textTertiary }]}>
                              {game.venue ?? game.location}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.scheduleOpponent, { color: colors.text }]}>
                              {game.opponent}
                            </Text>
                          </View>
                          <Text style={[styles.recentScore, { color: game.score?.startsWith('W') ? '#f5f5f5' : game.score?.startsWith('L') ? '#EF4444' : colors.text }]}>
                            {game.score?.replace('-', '–') ?? ''}
                          </Text>
                          <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} style={{ marginLeft: 8 }} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                </>
              );
            })()}
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
                const isUs = row.team === 'KaNeXT Sports';
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

  // Live game media card
  liveMediaCard: { borderRadius: BorderRadius.lg, overflow: 'hidden', marginBottom: Spacing.md },
  liveScreen: { height: 180, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  livePlayBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  liveInfoRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  liveBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  liveCardDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  liveCardLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: '#EF4444' },
  liveOpponentText: { fontSize: 16, fontWeight: '700' },
  liveScoreText: { fontSize: 18, fontWeight: '700' },

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
  opponentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  opponentText: {
    fontSize: 15,
    fontWeight: '600',
  },
  krText: {
    fontSize: 12,
    fontWeight: '500',
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

  // Game dropdown
  gameDropdown: {
    paddingHorizontal: Spacing.md,
    paddingTop: 4,
    paddingBottom: Spacing.md,
  },
  gameDropdownMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  gameDropdownTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gameDropdownTagText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  gameDropdownDetail: {
    fontSize: 13,
  },
  gameDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    gap: 6,
    marginTop: 12,
  },
  gameDropdownButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // BPR player rows (completed games)
  bprRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  bprLeft: {
    flex: 1,
  },
  bprName: {
    fontSize: 14,
    fontWeight: '600',
  },
  bprValue: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  bprLabel: {
    fontWeight: '400',
    fontSize: 12,
  },
  bprKr: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 12,
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

  // Recent-style completed game rows
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  recentOpponent: {
    fontSize: 15,
    fontWeight: '600',
  },
  recentMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  recentRight: {
    alignItems: 'flex-end',
    gap: 4,
    marginLeft: 12,
  },
  recentPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  recentPillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  recentScore: {
    fontSize: 14,
    fontWeight: '700',
  },

  // BPR inline panel
  bprPanel: {
    paddingHorizontal: Spacing.md,
    paddingTop: 4,
    paddingBottom: Spacing.md,
  },
  bprPanelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
  },
  bprPanelName: {
    fontSize: 14,
    fontWeight: '600',
  },
  bprPanelValue: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  bprPanelLabel: {
    fontWeight: '400',
    fontSize: 12,
  },
  bprPanelKr: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 12,
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
