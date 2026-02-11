/**
 * Home Screen
 * Mode-aware dashboard showing contextual information.
 * Per spec: Home displays key stats and quick actions for the current mode.
 */

import React, { useState, useCallback, useRef } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import PagerView from 'react-native-pager-view';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { ProgramContextSection } from '@/components/program-context-section';
import { RosterContent, DepthChartView, DEPTH_CHART_BY_SEASON, CURRENT_SEASON } from '@/components/roster-content';
import { KRDetailsSheet } from '@/components/kr-details-sheet';
import { PlayerPoolContent } from '@/app/coach/recruiting';
import { Colors, Spacing, BorderRadius, ModeColors, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext, useMode } from '@/context/app-context';
import type { Mode } from '@/types';

// Mock data imports (other modes)
import { COMPANY_METRICS, formatCurrency } from '@/data/mock-enterprise';
import { CAMPUSES, MESSAGES } from '@/data/mock-church';
import { getCurrentTerm, getUpcomingEvents, INSTITUTIONAL_METRICS } from '@/data/mock-education';

// FMU data
import { FMU_GAMES, FMU_LEADERS, FMU_STANDINGS, FMU_NEWS, FMU_RECORD, FMU_LAST_GAME, FMU_LAST_GAME_ID, FMU_NEXT_GAME, FMU_NEXT_GAME_ID, FMU_SEASON_COMPLETE } from '@/data/fmu';

// =============================================================================
// SHARED COMPONENTS
// =============================================================================

interface QuickStatProps {
  label: string;
  value: string;
  icon: IconSymbolName;
  color: string;
  colors: typeof Colors.light;
}

function QuickStat({ label, value, icon, color, colors }: QuickStatProps) {
  return (
    <View style={[styles.quickStat, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.quickStatIcon, { backgroundColor: color + '15' }]}>
        <IconSymbol name={icon} size={20} color={color} />
      </View>
      <ThemedText style={[styles.quickStatValue, { color }]}>{value}</ThemedText>
      <ThemedText style={[styles.quickStatLabel, { color: colors.textTertiary }]}>
        {label}
      </ThemedText>
    </View>
  );
}

interface ActionCardProps {
  title: string;
  subtitle: string;
  icon: IconSymbolName;
  color: string;
  colors: typeof Colors.light;
  onPress: () => void;
}

function ActionCard({ title, subtitle, icon, color, colors, onPress }: ActionCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionCard,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
        <IconSymbol name={icon} size={22} color={color} />
      </View>
      <View style={styles.actionContent}>
        <ThemedText style={styles.actionTitle}>{title}</ThemedText>
        <ThemedText style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </ThemedText>
      </View>
    </Pressable>
  );
}

// =============================================================================
// SPORTS HOME (v1.1 Spec - Team Hub Home / Coach HQ)
// Mental model: Video-game hub for a coach.
// NOT a SaaS dashboard. NOT a chatbot entry point.
// Shows: state, identity, and motion — nothing else.
// =============================================================================

// Team Hub Tabs - swipeable top tabs (all inline, bottom tab bar stays visible)
const TEAM_HUB_TABS = [
  { id: 'home', label: 'Home' },
  { id: 'roster', label: 'Roster' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'stats', label: 'Statistics' },
  { id: 'game-ops', label: 'Game Ops' },
  { id: 'program', label: 'Program' },
  { id: 'recruiting', label: 'Recruiting' },
  { id: 'development', label: 'Development' },
];

// FMU team state — derived from real data
const fmuStreak = FMU_STANDINGS.find((r) => r.team === 'Florida Memorial')?.streak ?? '—';
const DEMO_TEAM_STATE = {
  rating: 74,
  offRating: 77,
  defRating: 71,
  level: 'NAIA',
  conference: 'Sun Conference',
  record: `${FMU_RECORD.overall} (${FMU_RECORD.conference})`,
  streak: fmuStreak,
  confStanding: '5th in Sun Conference',
};

const DEMO_TODAY = {
  activity: FMU_SEASON_COMPLETE ? 'Off-Season' : 'In-Season',
  lastGame: FMU_LAST_GAME
    ? { opponent: FMU_LAST_GAME.opponent, result: FMU_LAST_GAME.result, score: FMU_LAST_GAME.score, location: FMU_LAST_GAME.location }
    : { opponent: 'Unknown', result: '—', score: '—', location: 'Home' },
  nextGame: FMU_NEXT_GAME
    ? { opponent: FMU_NEXT_GAME.opponent, date: FMU_NEXT_GAME.date, location: FMU_NEXT_GAME.location }
    : null,
};

const DEMO_CONFERENCE_PULSE = {
  standing: '5th in Sun Conference',
  top3: ['Ave Maria', 'Keiser', 'Southeastern'],
  nextConfGames: FMU_SEASON_COMPLETE
    ? [] as string[]
    : FMU_GAMES
        .filter((g) => g.status === 'upcoming' || g.status === 'live')
        .slice(0, 3)
        .map((g) => `${g.date} ${g.location === 'Home' ? 'vs' : '@'} ${g.opponent}`),
};

// Game IDs for routing
const LAST_GAME_ID = FMU_LAST_GAME_ID;

const SEASON_YEARS = [
  { id: '2025-26', label: '2025-26' },
  { id: '2024-25', label: '2024-25' },
  { id: '2023-24', label: '2023-24' },
];

// Team Hub Tabs Component (scrollable header row synced with PagerView)
function TeamHubTabs({
  colors,
  activeIndex,
  onTabPress,
}: {
  colors: typeof Colors.light;
  activeIndex: number;
  onTabPress: (index: number) => void;
}) {
  const tabScrollRef = useRef<ScrollView>(null);
  const tabLayoutsRef = useRef<{ x: number; width: number }[]>([]);

  const scrollToTab = useCallback((index: number) => {
    const layout = tabLayoutsRef.current[index];
    if (layout && tabScrollRef.current) {
      tabScrollRef.current.scrollTo({
        x: Math.max(0, layout.x - 40),
        animated: true,
      });
    }
  }, []);

  // Auto-scroll when active tab changes
  React.useEffect(() => {
    scrollToTab(activeIndex);
  }, [activeIndex, scrollToTab]);

  return (
    <View style={[styles.hubTabsContainer, { borderBottomColor: colors.divider }]}>
      <ScrollView
        ref={tabScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hubTabsContent}
      >
        {TEAM_HUB_TABS.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <Pressable
              key={tab.id}
              onLayout={(e) => {
                tabLayoutsRef.current[index] = {
                  x: e.nativeEvent.layout.x,
                  width: e.nativeEvent.layout.width,
                };
              }}
              style={[
                styles.hubTab,
                isActive && [styles.hubTabActive, { borderBottomColor: colors.text }],
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onTabPress(index);
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
  );
}

// Placeholder for tabs not yet built
function TabPlaceholder({
  icon,
  label,
  colors,
}: {
  icon: IconSymbolName;
  label: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={styles.placeholderContainer}>
      <IconSymbol name={icon} size={40} color={colors.textTertiary} />
      <ThemedText style={[styles.placeholderLabel, { color: colors.text }]}>
        {label}
      </ThemedText>
      <ThemedText style={[styles.placeholderSubtext, { color: colors.textTertiary }]}>
        Coming soon
      </ThemedText>
    </View>
  );
}

// =============================================================================
// SCHEDULE HUB (mirrors games.tsx layout)
// =============================================================================

type ScheduleTab = 'feed' | 'standings' | 'news';
const SCHEDULE_TABS: { key: ScheduleTab; label: string }[] = [
  { key: 'feed', label: 'Games' },
  { key: 'standings', label: 'Standings' },
  { key: 'news', label: 'News' },
];


function ScheduleHub({ colors, router }: { colors: typeof Colors.light; router: any }) {
  const [activeTab, setActiveTab] = useState<ScheduleTab>('feed');
  const [standingsView, setStandingsView] = useState<'official' | 'kr'>('official');
  const [krScope, setKrScope] = useState<'national' | 'conference'>('national');
  const [search, setSearch] = useState('');

  const q = search.trim().toLowerCase();
  const filtered = q
    ? FMU_GAMES.filter((g) =>
        g.opponent.toLowerCase().includes(q) ||
        g.date.toLowerCase().includes(q) ||
        g.location.toLowerCase().includes(q))
    : FMU_GAMES;

  const nextGameData = FMU_NEXT_GAME_ID ? FMU_GAMES.find((g) => g.id === FMU_NEXT_GAME_ID) : undefined;
  const liveGames = filtered.filter((g) => g.status === 'live' && g.id !== FMU_NEXT_GAME_ID);
  const upcomingGames = filtered.filter((g) => g.status === 'upcoming' && g.id !== FMU_NEXT_GAME_ID);
  const completedGames = [...filtered.filter((g) => g.status === 'final')].reverse();

  const navigateToGame = (gameId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/coach/game-detail', params: { gameId } } as any);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Inner Tab Pills */}
      <View style={[shStyles.tabRow, { backgroundColor: colors.background }]}>
        {SCHEDULE_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[shStyles.tabPill, { backgroundColor: isActive ? colors.text + 'E0' : colors.backgroundSecondary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab.key);
              }}
            >
              <ThemedText style={[shStyles.tabText, { color: isActive ? colors.background : colors.textSecondary }]}>
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={shStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {/* ── Feed Tab ── */}
        {activeTab === 'feed' && (
          <View>
            {/* A) Pinned Next Game Card */}
            {nextGameData?.status === 'live' ? (
              <Pressable
                style={({ pressed }) => [
                  shStyles.liveGameCard,
                  { backgroundColor: colors.backgroundSecondary },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => { if (FMU_NEXT_GAME_ID) navigateToGame(FMU_NEXT_GAME_ID); }}
              >
                {/* Top row: LIVE badge + opponent | KR + record */}
                <View style={shStyles.liveCardTopRow}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={shStyles.liveCardBadge}>● LIVE</ThemedText>
                    <ThemedText style={[shStyles.liveCardOpponent, { color: colors.text }]}>
                      {FMU_NEXT_GAME?.opponent}
                    </ThemedText>
                  </View>
                  <View style={shStyles.liveCardRight}>
                    <ThemedText style={shStyles.liveCardKR}>KR {(() => { let h = 0; const n = FMU_NEXT_GAME?.opponent ?? ''; for (let i = 0; i < n.length; i++) h = ((h << 5) - h + n.charCodeAt(i)) | 0; return 58 + (Math.abs(h) % 28); })()}</ThemedText>
                    {nextGameData.opponentRecord && (
                      <ThemedText style={[shStyles.liveCardRecord, { color: colors.textTertiary }]}>{nextGameData.opponentRecord}</ThemedText>
                    )}
                  </View>
                </View>
                {/* Bottom row: date + score/clock */}
                <View style={shStyles.liveCardBottomRow}>
                  <ThemedText style={[shStyles.liveCardMeta, { color: colors.textSecondary }]}>
                    {FMU_NEXT_GAME?.date} · {FMU_NEXT_GAME?.location}
                  </ThemedText>
                  {nextGameData.score && (
                    <ThemedText style={shStyles.liveCardScore}>
                      {nextGameData.score} · {nextGameData.clock}
                    </ThemedText>
                  )}
                </View>
                {/* Down arrow */}
                <View style={shStyles.liveCardArrow}>
                  <IconSymbol name="chevron.down" size={14} color={colors.textTertiary + '60'} />
                </View>
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  shStyles.nextGameCard,
                  { backgroundColor: colors.backgroundSecondary },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => {
                  if (FMU_NEXT_GAME_ID) navigateToGame(FMU_NEXT_GAME_ID);
                }}
                disabled={!FMU_NEXT_GAME_ID}
              >
                <View style={shStyles.nextGameContent}>
                  <ThemedText style={[shStyles.nextGameLabel, { color: colors.textTertiary }]}>NEXT GAME</ThemedText>
                  {FMU_SEASON_COMPLETE ? (
                    <ThemedText style={[shStyles.nextGameOpponent, { color: colors.textSecondary }]}>
                      No upcoming games scheduled
                    </ThemedText>
                  ) : (
                    <>
                      <ThemedText style={[shStyles.nextGameOpponent, { color: colors.text }]}>
                        {FMU_NEXT_GAME?.opponent}
                        {nextGameData?.opponentRecord ? (
                          <ThemedText style={[shStyles.oppRecord, { color: colors.textTertiary }]}>
                            {'  '}{nextGameData.opponentRecord}
                          </ThemedText>
                        ) : null}
                      </ThemedText>
                      <ThemedText style={[shStyles.nextGameMeta, { color: colors.textSecondary }]}>
                        {FMU_NEXT_GAME?.date} · {FMU_NEXT_GAME?.location}
                      </ThemedText>
                    </>
                  )}
                </View>
                {!FMU_SEASON_COMPLETE && (
                  <IconSymbol name="chevron.right" size={13} color={colors.textTertiary + '80'} />
                )}
              </Pressable>
            )}

            {/* B) Search Bar */}
            <View style={[shStyles.searchBar, { backgroundColor: colors.backgroundSecondary }]}>
              <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
              <TextInput
                style={[shStyles.searchInput, { color: colors.text }]}
                placeholder="Search games..."
                placeholderTextColor={colors.textTertiary}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* C) Upcoming Section */}
            {upcomingGames.length > 0 && (
              <>
                <ThemedText style={[shStyles.sectionLabel, { color: colors.textSecondary }]}>UPCOMING</ThemedText>
                <View style={[shStyles.card, { backgroundColor: colors.backgroundSecondary, marginBottom: Spacing.md }]}>
                  {upcomingGames.map((game, index) => (
                    <View key={game.id}>
                      {index > 0 && <View style={[shStyles.divider, { backgroundColor: colors.divider }]} />}
                      <Pressable
                        style={({ pressed }) => [shStyles.gameRow, pressed && { opacity: 0.7 }]}
                        onPress={() => navigateToGame(game.id)}
                      >
                        <View style={shStyles.gameRowLeft}>
                          <ThemedText style={[shStyles.opponentText, { color: colors.text }]}>
                            {game.opponent}
                            {game.opponentRecord ? (
                              <ThemedText style={[shStyles.oppRecord, { color: colors.textTertiary }]}>
                                {'  '}{game.opponentRecord}
                              </ThemedText>
                            ) : null}
                          </ThemedText>
                          <ThemedText style={[shStyles.metaText, { color: colors.textSecondary }]}>
                            {game.date} · {game.location}
                          </ThemedText>
                          {game.gameType && (
                            <View style={[shStyles.gameTypePill, { backgroundColor: colors.textTertiary + '14' }]}>
                              <ThemedText style={[shStyles.gameTypeText, { color: colors.textTertiary }]}>{game.gameType}</ThemedText>
                            </View>
                          )}
                        </View>
                        <IconSymbol name="chevron.right" size={13} color={colors.textTertiary + '80'} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* D) Completed Section */}
            {completedGames.length > 0 && (
              <>
                <ThemedText style={[shStyles.sectionLabel, { color: colors.textSecondary }]}>COMPLETED</ThemedText>
                <View style={[shStyles.card, { backgroundColor: colors.backgroundSecondary }]}>
                  {completedGames.map((game, index) => {
                    // Month separator logic
                    const month = game.date.split(' ')[0]; // e.g. "Feb"
                    const prevMonth = index > 0 ? completedGames[index - 1].date.split(' ')[0] : null;
                    const MONTH_FULL: Record<string, string> = {
                      Jan: 'JANUARY', Feb: 'FEBRUARY', Mar: 'MARCH', Apr: 'APRIL',
                      Oct: 'OCTOBER', Nov: 'NOVEMBER', Dec: 'DECEMBER',
                    };
                    const showMonthLabel = month !== prevMonth;

                    return (
                      <View key={game.id}>
                        {index > 0 && !showMonthLabel && <View style={[shStyles.divider, { backgroundColor: colors.divider }]} />}
                        {showMonthLabel && (
                          <View>
                            {index > 0 && <View style={[shStyles.divider, { backgroundColor: colors.divider }]} />}
                            <ThemedText style={[shStyles.monthLabel, { color: colors.textTertiary }]}>
                              {MONTH_FULL[month] ?? month.toUpperCase()}
                            </ThemedText>
                          </View>
                        )}
                        <Pressable
                          style={({ pressed }) => [shStyles.gameRow, pressed && { opacity: 0.7 }]}
                          onPress={() => navigateToGame(game.id)}
                        >
                          <View style={shStyles.gameRowLeft}>
                            <ThemedText style={[shStyles.opponentText, { color: colors.text }]}>{game.opponent}</ThemedText>
                            <ThemedText style={[shStyles.metaText, { color: colors.textSecondary }]}>
                              {game.date} · {game.location}
                            </ThemedText>
                            {game.gameType && (
                              <View style={[shStyles.gameTypePill, { backgroundColor: colors.textTertiary + '14' }]}>
                                <ThemedText style={[shStyles.gameTypeText, { color: colors.textTertiary }]}>{game.gameType}</ThemedText>
                              </View>
                            )}
                          </View>
                          <View style={shStyles.gameRowRight}>
                            <View style={[shStyles.statusPill, { backgroundColor: colors.textTertiary + '18' }]}>
                              <ThemedText style={[shStyles.statusText, { color: colors.textSecondary }]}>FINAL</ThemedText>
                            </View>
                            {game.score && (
                              <ThemedText style={[shStyles.scoreText, {
                                color: game.score.startsWith('W') ? '#66BB6A' : game.score.startsWith('L') ? '#E57373' : colors.text,
                              }]}>
                                {game.score}
                              </ThemedText>
                            )}
                          </View>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </>
            )}

            {/* E) Empty States */}
            {q && upcomingGames.length === 0 && completedGames.length === 0 && (
              <View style={shStyles.emptyState}>
                <ThemedText style={[shStyles.emptyText, { color: colors.textTertiary }]}>No games match your search</ThemedText>
              </View>
            )}
            {!q && completedGames.length === 0 && (
              <View style={shStyles.emptyState}>
                <ThemedText style={[shStyles.emptyText, { color: colors.textTertiary }]}>No completed games yet</ThemedText>
              </View>
            )}
          </View>
        )}

        {/* ── Standings Tab ── */}
        {activeTab === 'standings' && (
          <View>
            {/* ── Toggle: Official / KR Rankings ── */}
            <View style={shStyles.standingsToggleRow}>
              {(['official', 'kr'] as const).map((v) => {
                const active = standingsView === v;
                return (
                  <Pressable
                    key={v}
                    style={[shStyles.standingsTogglePill, { backgroundColor: active ? colors.text + 'E0' : colors.backgroundSecondary }]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStandingsView(v); }}
                  >
                    <ThemedText style={[shStyles.standingsToggleText, { color: active ? colors.background : colors.textSecondary }]}>
                      {v === 'official' ? 'Conference' : 'KR Rankings'}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            {/* ═══ OFFICIAL ═══ */}
            {standingsView === 'official' && (
              <View>
                <ThemedText style={[shStyles.sectionLabel, { color: colors.textSecondary }]}>SUN CONFERENCE</ThemedText>
                <View style={[shStyles.card, { backgroundColor: colors.backgroundSecondary }]}>
                  <View style={[shStyles.standingsHeaderRow, { borderBottomColor: colors.divider }]}>
                    <ThemedText style={[shStyles.standingsTeamHeader, { color: colors.textTertiary }]}>TEAM</ThemedText>
                    <ThemedText style={[shStyles.standingsColHeader, { color: colors.textTertiary }]}>CONF</ThemedText>
                    <ThemedText style={[shStyles.standingsColHeader, { color: colors.textTertiary }]}>OVR</ThemedText>
                    <ThemedText style={[shStyles.standingsColHeader, { color: colors.textTertiary }]}>STK</ThemedText>
                  </View>
                  {FMU_STANDINGS.map((row, index) => {
                    const isFmu = row.team === 'Florida Memorial';
                    return (
                      <View key={row.team}>
                        {index > 0 && <View style={[shStyles.divider, { backgroundColor: colors.divider }]} />}
                        <View style={[shStyles.standingsRow, isFmu && { backgroundColor: colors.text + '08' }]}>
                          <View style={shStyles.standingsTeamCol}>
                            <ThemedText style={[shStyles.standingsRank, { color: colors.textTertiary }]}>{index + 1}</ThemedText>
                            <ThemedText style={[shStyles.standingsTeamName, { color: colors.text, fontWeight: isFmu ? '700' : '500' }]}>{row.team}</ThemedText>
                          </View>
                          <ThemedText style={[shStyles.standingsRecord, { color: colors.text }]}>{row.confW}-{row.confL}</ThemedText>
                          <ThemedText style={[shStyles.standingsRecord, { color: colors.textSecondary }]}>{row.overallW}-{row.overallL}</ThemedText>
                          <ThemedText style={[shStyles.standingsStreak, { color: row.streak.startsWith('W') ? '#66BB6A' : '#EF4444' }]}>{row.streak}</ThemedText>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ═══ KR RANKINGS ═══ */}
            {standingsView === 'kr' && (() => {
              const KR_NATIONAL = [
                { rank: 1, team: 'Loyola (LA)', kr: 91, trend: 2 },
                { rank: 2, team: 'Indiana Wesleyan', kr: 89, trend: 0 },
                { rank: 3, team: 'Oklahoma City', kr: 88, trend: 1 },
                { rank: 4, team: 'Life Pacific', kr: 87, trend: -1 },
                { rank: 5, team: 'Benedictine (KS)', kr: 86, trend: 3 },
                { rank: 6, team: 'Freed-Hardeman', kr: 85, trend: 0 },
                { rank: 7, team: 'Georgetown (KY)', kr: 84, trend: -2 },
                { rank: 8, team: 'William Penn', kr: 84, trend: 1 },
                { rank: 9, team: 'Lindsey Wilson', kr: 83, trend: 0 },
                { rank: 10, team: 'Westmont', kr: 82, trend: 4 },
                { rank: 24, team: 'Florida Memorial', kr: 74, trend: 3 },
              ];
              const KR_CONF = FMU_STANDINGS.map((row) => {
                let h = 0;
                for (let c = 0; c < row.team.length; c++) h = ((h << 5) - h + row.team.charCodeAt(c)) | 0;
                const kr = row.team === 'Florida Memorial' ? 74 : 58 + (Math.abs(h) % 28);
                const trend = row.team === 'Florida Memorial' ? 3 : Math.abs(h) % 5 === 0 ? (1 + (Math.abs(h >> 4) % 4)) : Math.abs(h) % 3 === 0 ? -(1 + (Math.abs(h >> 4) % 3)) : 0;
                return { rank: 0, team: row.team, kr, trend };
              }).sort((a, b) => b.kr - a.kr).map((r, i) => ({ ...r, rank: i + 1 }));

              const krData = krScope === 'national' ? KR_NATIONAL : KR_CONF;

              const trendDisplay = (t: number) => {
                if (t > 0) return { text: `▲ ${t}`, color: '#66BB6A' };
                if (t < 0) return { text: `▼ ${Math.abs(t)}`, color: '#EF4444' };
                return { text: '—', color: colors.textTertiary };
              };

              return (
                <View>
                  {/* Scope pills */}
                  <View style={shStyles.krScopeRow}>
                    {(['national', 'conference'] as const).map((s) => {
                      const active = krScope === s;
                      return (
                        <Pressable
                          key={s}
                          style={[shStyles.krScopePill, { backgroundColor: active ? colors.text : colors.backgroundSecondary }]}
                          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setKrScope(s); }}
                        >
                          <ThemedText style={[shStyles.krScopePillText, { color: active ? colors.background : colors.textSecondary }]}>
                            {s === 'national' ? 'National' : 'Conference'}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>

                  <ThemedText style={[shStyles.sectionLabel, { color: colors.textSecondary }]}>
                    {krScope === 'national' ? 'NATIONAL' : 'SUN CONFERENCE'}
                  </ThemedText>
                  <View style={[shStyles.card, { backgroundColor: colors.backgroundSecondary }]}>
                    {/* Sticky-feel header */}
                    <View style={[shStyles.krHeaderRow, { borderBottomColor: colors.divider, backgroundColor: colors.backgroundSecondary }]}>
                      <ThemedText style={[shStyles.krHeaderRank, { color: colors.textTertiary }]}>#</ThemedText>
                      <ThemedText style={[shStyles.standingsTeamHeader, { color: colors.textTertiary }]}>TEAM</ThemedText>
                      <ThemedText style={[shStyles.standingsColHeader, { color: colors.textTertiary }]}>KR</ThemedText>
                      <ThemedText style={[shStyles.standingsColHeader, { color: colors.textTertiary }]}>TREND</ThemedText>
                    </View>
                    {krData.map((row, index) => {
                      const isFmu = row.team === 'Florida Memorial';
                      const showGap = krScope === 'national' && index === krData.length - 1 && row.rank > 10;
                      const td = trendDisplay(row.trend);
                      return (
                        <View key={row.team}>
                          {/* Thick divider above FMU */}
                          {isFmu && <View style={[shStyles.krFmuDivider, { backgroundColor: colors.text + '20' }]} />}
                          {/* Normal divider or gap */}
                          {!isFmu && index > 0 && !showGap && <View style={[shStyles.divider, { backgroundColor: colors.divider }]} />}
                          {showGap && (
                            <View style={[shStyles.krGapRow, { borderColor: colors.divider }]}>
                              <ThemedText style={[shStyles.krGapText, { color: colors.textTertiary }]}>···</ThemedText>
                            </View>
                          )}
                          <View style={[
                            shStyles.krRow,
                            isFmu && { backgroundColor: colors.text + '0A' },
                          ]}>
                            <ThemedText style={[shStyles.krRankNum, { color: isFmu ? colors.text : colors.textTertiary }]}>{row.rank}</ThemedText>
                            <View style={{ flex: 1 }}>
                              <ThemedText style={[shStyles.krTeamName, { color: colors.text, fontWeight: isFmu ? '700' : '500' }]}>{row.team}</ThemedText>
                            </View>
                            <ThemedText style={[shStyles.krScore, { color: isFmu ? colors.text : colors.textSecondary }]}>{row.kr}</ThemedText>
                            <ThemedText style={[shStyles.krTrend, { color: td.color }]}>{td.text}</ThemedText>
                          </View>
                          {/* Thick divider below FMU */}
                          {isFmu && index < krData.length - 1 && <View style={[shStyles.krFmuDivider, { backgroundColor: colors.text + '20' }]} />}
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })()}
          </View>
        )}

        {/* ── News Tab ── */}
        {activeTab === 'news' && (
          <View style={[shStyles.card, { backgroundColor: colors.backgroundSecondary }]}>
            {FMU_NEWS.map((item, index) => (
              <View key={item.id}>
                {index > 0 && <View style={[shStyles.divider, { backgroundColor: colors.divider }]} />}
                <View style={shStyles.newsRow}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[shStyles.newsType, { color: colors.textTertiary }]}>{item.type}</ThemedText>
                    <ThemedText style={[shStyles.newsHeadline, { color: colors.text }]}>{item.headline}</ThemedText>
                    <ThemedText style={[shStyles.newsDate, { color: colors.textTertiary }]}>{item.date}</ThemedText>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Schedule Hub styles
const shStyles = StyleSheet.create({
  tabRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: 16, gap: 6 },
  tabPill: { flex: 1, paddingVertical: 6, borderRadius: 18, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '600' },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: 0, paddingBottom: 40 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 10, gap: 8, marginBottom: Spacing.md },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  card: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: Spacing.md },
  gameRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  gameRowLeft: { flex: 1 },
  opponentText: { fontSize: 15, fontWeight: '600' },
  metaText: { fontSize: 13, marginTop: 2 },
  gameRowRight: { alignItems: 'flex-end', gap: 4 },
  scoreText: { fontSize: 14, fontWeight: '600' },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, gap: 4 },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  sectionLabel: { fontSize: 13, fontWeight: '600', letterSpacing: 0.5, marginBottom: 10, marginLeft: 4 },
  standingsHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  standingsTeamHeader: { flex: 1, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  standingsColHeader: { width: 50, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textAlign: 'center' },
  standingsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 10 },
  standingsTeamCol: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  standingsRank: { fontSize: 13, fontWeight: '600', width: 24, textAlign: 'right' as const, fontVariant: ['tabular-nums'] as any },
  standingsTeamName: { fontSize: 14, fontWeight: '500' },
  standingsRecord: { width: 50, fontSize: 13, fontWeight: '500', textAlign: 'center', fontVariant: ['tabular-nums'] as any },
  standingsStreak: { width: 50, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  standingsToggleRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.sm },
  standingsTogglePill: { flex: 1, paddingVertical: 8, borderRadius: 18, alignItems: 'center' },
  standingsToggleText: { fontSize: 13, fontWeight: '600' },
  krScopeRow: { flexDirection: 'row', gap: 6, marginBottom: Spacing.sm },
  krScopePill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14 },
  krScopePillText: { fontSize: 12, fontWeight: '600' },
  krHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  krHeaderRank: { width: 28, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textAlign: 'right' as const, marginRight: 10 },
  krRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 9 },
  krRankNum: { width: 28, fontSize: 13, fontWeight: '600', textAlign: 'right' as const, marginRight: 10, fontVariant: ['tabular-nums'] as any },
  krTeamName: { fontSize: 14 },
  krScore: { width: 50, fontSize: 14, fontWeight: '700', textAlign: 'center', fontVariant: ['tabular-nums'] as any },
  krTrend: { width: 50, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  krFmuDivider: { height: 2 },
  krGapRow: { alignItems: 'center', paddingVertical: 4, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
  krGapText: { fontSize: 14, letterSpacing: 4 },
  newsRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: 8 },
  newsType: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 },
  newsHeadline: { fontSize: 15, fontWeight: '500', lineHeight: 20 },
  newsDate: { fontSize: 12, marginTop: 4 },
  emptyState: { padding: Spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: 15 },
  nextGameCard: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md + 4, flexDirection: 'row' as const, alignItems: 'center' as const },
  nextGameContent: { flex: 1 },
  nextGameLabel: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.5, marginBottom: 4 },
  nextGameOpponent: { fontSize: 17, fontWeight: '700' as const },
  nextGameMeta: { fontSize: 13, marginTop: 2 },
  oppRecord: { fontSize: 13, fontWeight: '400' as const },
  gameTypePill: { alignSelf: 'flex-start' as const, marginTop: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  gameTypeText: { fontSize: 10, fontWeight: '600' as const, letterSpacing: 0.3 },
  monthLabel: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 0.5, paddingVertical: 8, paddingHorizontal: Spacing.md },
});

function SportsHome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  // Active hub tab index (synced with PagerView)
  const [activeHubIndex, setActiveHubIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  // KR details sheet
  const [krSheetVisible, setKrSheetVisible] = useState(false);

  // Season year picker
  const [selectedYear, setSelectedYear] = useState('2025-26');
  const [yearPickerOpen, setYearPickerOpen] = useState(false);

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  // Pregame packet shown when there's a next game
  const showPregamePacket = FMU_NEXT_GAME != null;

  // Home tab content — GM/HC Dashboard
  const renderHomeContent = () => {
    return (
      <>
        {/* ===== 1) TEAM TRUTH HEADER ===== */}
        <View style={styles.teamStateSection}>
          {/* Big Rating + KR badge */}
          <View style={styles.ratingRow}>
            <ThemedText style={styles.ratingNumber}>
              {DEMO_TEAM_STATE.rating}
            </ThemedText>
            <Pressable
              style={[styles.krBadge, { backgroundColor: colors.backgroundSecondary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setKrSheetVisible(true);
              }}
            >
              <ThemedText style={[styles.krLabel, { color: colors.textSecondary }]}>KR</ThemedText>
            </Pressable>
          </View>

          {/* Team KR Tier */}
          <ThemedText style={[styles.tierLabel, { color: colors.textTertiary }]}>
            Regional Power
          </ThemedText>

          {/* Team + Level + Conference */}
          <ThemedText style={[styles.metaLine, { color: colors.textSecondary }]}>
            Florida Memorial · {DEMO_TEAM_STATE.level} · {DEMO_TEAM_STATE.conference}
          </ThemedText>

          {/* Record + Streak badge */}
          <View style={styles.recordRow}>
            <ThemedText style={[styles.recordText, { color: colors.text }]}>
              {DEMO_TEAM_STATE.record}
            </ThemedText>
            <View style={[
              styles.streakBadge,
              { backgroundColor: DEMO_TEAM_STATE.streak.startsWith('W') ? '#4CAF5020' : '#FF572220' },
            ]}>
              <ThemedText style={[
                styles.streakText,
                { color: DEMO_TEAM_STATE.streak.startsWith('W') ? '#4CAF50' : '#FF5722' },
              ]}>
                {DEMO_TEAM_STATE.streak}
              </ThemedText>
            </View>
          </View>

          {/* Year Picker */}
          <View style={styles.yearPickerWrapper}>
            <Pressable
              style={[styles.yearPickerButton, { backgroundColor: colors.backgroundSecondary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setYearPickerOpen(!yearPickerOpen);
              }}
            >
              <ThemedText style={[styles.yearPickerText, { color: colors.textSecondary }]}>
                {selectedYear}
              </ThemedText>
              <IconSymbol
                name={yearPickerOpen ? 'chevron.up' : 'chevron.down'}
                size={10}
                color={colors.textTertiary}
              />
            </Pressable>
            {yearPickerOpen && (
              <View style={[styles.yearPickerDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {SEASON_YEARS.map((year) => (
                  <Pressable
                    key={year.id}
                    style={[
                      styles.yearPickerOption,
                      selectedYear === year.id && { backgroundColor: colors.backgroundSecondary },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedYear(year.id);
                      setYearPickerOpen(false);
                    }}
                  >
                    <ThemedText style={[
                      styles.yearPickerOptionText,
                      { color: selectedYear === year.id ? colors.text : colors.textSecondary },
                    ]}>
                      {year.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* ===== PREGAME SCOUTING REPORT (button) ===== */}
        {DEMO_TODAY.nextGame && (
          <Pressable
            style={({ pressed }) => [
              styles.pregamePacketButton,
              { backgroundColor: colors.backgroundSecondary },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/coach/game-detail?gameId=${FMU_NEXT_GAME_ID}` as any);
            }}
          >
            <ThemedText style={[styles.pregamePacketText, { color: colors.text }]}>
              Pregame Scouting Report
            </ThemedText>
          </Pressable>
        )}

        {/* ===== 2) NEXT + LAST GAME ===== */}
        <View style={[styles.contextCard, { backgroundColor: colors.backgroundSecondary }]}>
          {/* Next Game → Game Detail (pregame) */}
          {DEMO_TODAY.nextGame ? (
            <>
              <Pressable
                style={({ pressed }) => [styles.statusRowTappable, pressed && { opacity: 0.7 }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/coach/game-detail?gameId=${FMU_NEXT_GAME_ID}` as any);
                }}
              >
                <View style={styles.statusRowContent}>
                  <ThemedText style={[styles.statusLabel, { color: colors.textSecondary }]}>
                    Next Game
                  </ThemedText>
                  <ThemedText style={[styles.statusValue, { color: colors.text }]}>
                    {DEMO_TODAY.nextGame.date} {DEMO_TODAY.nextGame.location === 'Home' ? 'vs' : '@'} {DEMO_TODAY.nextGame.opponent}
                  </ThemedText>
                </View>
              </Pressable>
              <View style={[styles.contextDivider, { backgroundColor: colors.divider }]} />
            </>
          ) : (
            <>
              <View style={styles.statusRow}>
                <ThemedText style={[styles.statusLabel, { color: colors.textSecondary }]}>
                  Next Game
                </ThemedText>
                <ThemedText style={[styles.statusValue, { color: colors.text }]}>
                  No upcoming games
                </ThemedText>
              </View>
              <View style={[styles.contextDivider, { backgroundColor: colors.divider }]} />
            </>
          )}

          {/* Last Game → Game Detail (postgame) */}
          <Pressable
            style={({ pressed }) => [styles.statusRowTappable, pressed && { opacity: 0.7 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/coach/game-detail?gameId=${LAST_GAME_ID}` as any);
            }}
          >
            <View style={styles.statusRowContent}>
              <ThemedText style={[styles.statusLabel, { color: colors.textSecondary }]}>
                Last Game
              </ThemedText>
              <ThemedText style={[styles.statusValue, { color: colors.text }]}>
                {DEMO_TODAY.lastGame.result} {DEMO_TODAY.lastGame.score} {DEMO_TODAY.lastGame.location === 'Home' ? 'vs' : '@'} {DEMO_TODAY.lastGame.opponent}
              </ThemedText>
            </View>
          </Pressable>
        </View>

        {/* ===== 3) CONFERENCE PULSE ===== */}
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          CONFERENCE PULSE
        </ThemedText>
        <View style={[styles.contextCard, { backgroundColor: colors.backgroundSecondary }]}>
          {/* Standing */}
          <View style={styles.statusRow}>
            <ThemedText style={[styles.statusLabel, { color: colors.textSecondary }]}>
              Standing
            </ThemedText>
            <ThemedText style={[styles.statusValue, { color: colors.text }]}>
              {DEMO_CONFERENCE_PULSE.standing ?? DEMO_TEAM_STATE.conference}
            </ThemedText>
          </View>
          <View style={[styles.contextDivider, { backgroundColor: colors.divider }]} />

          {/* Top 3 */}
          <View style={styles.statusRow}>
            <ThemedText style={[styles.statusLabel, { color: colors.textSecondary }]}>
              Top 3
            </ThemedText>
            <ThemedText style={[styles.statusValue, { color: colors.textTertiary }]}>
              {DEMO_CONFERENCE_PULSE.top3.length > 0
                ? DEMO_CONFERENCE_PULSE.top3.join(', ')
                : 'No conference standings'}
            </ThemedText>
          </View>
          <View style={[styles.contextDivider, { backgroundColor: colors.divider }]} />

          {/* Next Conference Games / Season Record */}
          <View style={styles.statusRow}>
            <ThemedText style={[styles.statusLabel, { color: colors.textSecondary }]}>
              {FMU_SEASON_COMPLETE ? 'Final Record' : 'Next Conf. Games'}
            </ThemedText>
            <ThemedText style={[styles.statusValue, { color: colors.textTertiary }]}>
              {FMU_SEASON_COMPLETE
                ? `${FMU_RECORD.overall} overall · ${FMU_RECORD.conference} conference`
                : DEMO_CONFERENCE_PULSE.nextConfGames.length > 0
                  ? DEMO_CONFERENCE_PULSE.nextConfGames.join(', ')
                  : 'No conference games scheduled'}
            </ThemedText>
          </View>
        </View>

      </>
    );
  };

  return (
    <View style={styles.sportsHomeContainer}>
      {/* ===== STICKY TABS ===== */}
      <TeamHubTabs colors={colors} activeIndex={activeHubIndex} onTabPress={handleTabPress} />

      {/* ===== SWIPEABLE CONTENT ===== */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={(e) => setActiveHubIndex(e.nativeEvent.position)}
      >
        {/* Page 0: Home */}
        <ScrollView
          key="home"
          style={styles.sportsScrollView}
          contentContainerStyle={styles.sportsScrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {renderHomeContent()}
        </ScrollView>

        {/* Page 1: Roster */}
        <ScrollView
          key="roster"
          style={styles.sportsScrollView}
          contentContainerStyle={styles.rosterScrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <RosterContent />
        </ScrollView>

        {/* Page 2: Schedule (full Games Hub) */}
        <View key="schedule" style={{ flex: 1 }}>
          <ScheduleHub colors={colors} router={router} />
        </View>

        {/* Page 3: Stats */}
        <ScrollView
          key="stats"
          style={styles.sportsScrollView}
          contentContainerStyle={styles.sportsScrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <ThemedText style={[styles.sectionHeader, { color: colors.textTertiary }]}>
            SEASON LEADERS
          </ThemedText>
          {[...FMU_LEADERS].sort((a, b) => b.ppg - a.ppg).slice(0, 10).map((leader) => (
            <View
              key={leader.firebaseId}
              style={[styles.leaderStatRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.leaderStatLeft}>
                <ThemedText style={[styles.leaderStatName, { color: colors.text }]}>
                  {leader.name}
                </ThemedText>
                <ThemedText style={[styles.leaderStatSub, { color: colors.textTertiary }]}>
                  #{leader.number} · {leader.gamesPlayed} GP
                </ThemedText>
              </View>
              <View style={styles.leaderStatRight}>
                <ThemedText style={[styles.leaderStatVal, { color: colors.text }]}>
                  {leader.ppg.toFixed(1)}
                </ThemedText>
                <ThemedText style={[styles.leaderStatLabel, { color: colors.textTertiary }]}>PPG</ThemedText>
              </View>
              <View style={styles.leaderStatRight}>
                <ThemedText style={[styles.leaderStatVal, { color: colors.text }]}>
                  {leader.rpg.toFixed(1)}
                </ThemedText>
                <ThemedText style={[styles.leaderStatLabel, { color: colors.textTertiary }]}>RPG</ThemedText>
              </View>
              <View style={styles.leaderStatRight}>
                <ThemedText style={[styles.leaderStatVal, { color: colors.text }]}>
                  {leader.apg.toFixed(1)}
                </ThemedText>
                <ThemedText style={[styles.leaderStatLabel, { color: colors.textTertiary }]}>APG</ThemedText>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Page 4: Game Ops (Depth Chart) */}
        <ScrollView
          key="game-ops"
          style={styles.sportsScrollView}
          contentContainerStyle={styles.sportsScrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <DepthChartView depthChart={DEPTH_CHART_BY_SEASON[CURRENT_SEASON]} />
        </ScrollView>

        {/* Page 5: Program */}
        <ScrollView
          key="program"
          style={styles.sportsScrollView}
          contentContainerStyle={styles.sportsScrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <ProgramContextSection />
        </ScrollView>

        {/* Page 6: Recruiting (Player Pool) */}
        <View key="recruiting" style={{ flex: 1 }}>
          <PlayerPoolContent />
        </View>

        {/* Page 7: Development */}
        <ScrollView
          key="development"
          contentContainerStyle={styles.placeholderPage}
          nestedScrollEnabled
        >
          <TabPlaceholder icon="arrow.up.right" label="Development" colors={colors} />
        </ScrollView>
      </PagerView>

      {/* KR Details Bottom Sheet */}
      <KRDetailsSheet
        visible={krSheetVisible}
        onClose={() => setKrSheetVisible(false)}
      />
    </View>
  );
}

// =============================================================================
// ENTERPRISE HOME
// =============================================================================

function EnterpriseHome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const modeColors = ModeColors.enterprise;
  const { state } = useAppContext();

  const roleLabel = state.operatingRole === 'founder' ? 'Founder' :
                    state.operatingRole === 'investor' ? 'Investor' : 'Viewer';

  return (
    <>
      {/* Welcome */}
      <View style={styles.welcomeSection}>
        <ThemedText style={styles.welcomeGreeting}>Welcome back,</ThemedText>
        <ThemedText style={styles.welcomeName}>{roleLabel}</ThemedText>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <QuickStat
          label="MRR"
          value={formatCurrency(COMPANY_METRICS.mrr)}
          icon="chart.bar.fill"
          color={modeColors.primary}
          colors={colors}
        />
        <QuickStat
          label="Customers"
          value={COMPANY_METRICS.customers.toString()}
          icon="person.3.fill"
          color={modeColors.primary}
          colors={colors}
        />
        <QuickStat
          label="Runway"
          value={`${COMPANY_METRICS.runway}mo`}
          icon="calendar"
          color={modeColors.primary}
          colors={colors}
        />
      </View>

      {/* Quick Actions */}
      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        DATA ROOM
      </ThemedText>
      <ActionCard
        title="Documents"
        subtitle="Investor materials and governance"
        icon="doc.fill"
        color={modeColors.primary}
        colors={colors}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/organization/documents');
        }}
      />
      <ActionCard
        title="Governance"
        subtitle="Board and advisors"
        icon="person.3.fill"
        color={modeColors.primary}
        colors={colors}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/organization/governance');
        }}
      />
      <ActionCard
        title="Run Scenario"
        subtitle="AI-powered analysis"
        icon="sparkles"
        color={Brand.nexus}
        colors={colors}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/nexus');
        }}
      />

      {/* Company Info */}
      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        COMPANY STATUS
      </ThemedText>
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.infoRow}>
          <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>Stage</ThemedText>
          <ThemedText style={styles.infoValue}>Pre-Seed</ThemedText>
        </View>
        <View style={[styles.infoDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.infoRow}>
          <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>Raised</ThemedText>
          <ThemedText style={styles.infoValue}>{formatCurrency(COMPANY_METRICS.raised)}</ThemedText>
        </View>
        <View style={[styles.infoDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.infoRow}>
          <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>Team</ThemedText>
          <ThemedText style={styles.infoValue}>{COMPANY_METRICS.teamSize} members</ThemedText>
        </View>
      </View>
    </>
  );
}

// =============================================================================
// CHURCH HOME
// =============================================================================

function ChurchHome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const modeColors = ModeColors.church;

  const mainCampus = CAMPUSES[0];
  const nextService = mainCampus?.serviceTimes[0];

  return (
    <>
      {/* Welcome */}
      <View style={styles.welcomeSection}>
        <ThemedText style={styles.welcomeGreeting}>Welcome home,</ThemedText>
        <ThemedText style={styles.welcomeName}>Friend</ThemedText>
      </View>

      {/* Next Service */}
      <View style={[styles.highlightCard, { backgroundColor: modeColors.primary }]}>
        <IconSymbol name="calendar" size={24} color="#FFFFFF" />
        <View style={styles.highlightContent}>
          <ThemedText style={styles.highlightTitle}>Next Service</ThemedText>
          <ThemedText style={styles.highlightSubtitle}>
            {nextService ? `${nextService.day} at ${nextService.time}` : 'Sunday at 10:00 AM'}
          </ThemedText>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <QuickStat
          label="Campuses"
          value={CAMPUSES.length.toString()}
          icon="building.2.fill"
          color={modeColors.primary}
          colors={colors}
        />
        <QuickStat
          label="Messages"
          value={MESSAGES.length.toString()}
          icon="play.circle.fill"
          color={modeColors.primary}
          colors={colors}
        />
      </View>

      {/* Quick Actions */}
      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        QUICK ACTIONS
      </ThemedText>
      <ActionCard
        title="Watch Messages"
        subtitle="Recent sermons and teachings"
        icon="play.circle.fill"
        color={modeColors.primary}
        colors={colors}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/organization/messages');
        }}
      />
      <ActionCard
        title="Give"
        subtitle="Tithes, offerings, and donations"
        icon="heart.fill"
        color={modeColors.primary}
        colors={colors}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/organization/giving');
        }}
      />
      <ActionCard
        title="Connect"
        subtitle="Get involved in our community"
        icon="person.badge.plus"
        color={modeColors.primary}
        colors={colors}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/organization/connect');
        }}
      />

      {/* Campus Info */}
      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        MY CAMPUS
      </ThemedText>
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.infoRow}>
          <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>Campus</ThemedText>
          <ThemedText style={styles.infoValue}>{mainCampus?.shortName || 'ICCLA'}</ThemedText>
        </View>
        <View style={[styles.infoDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.infoRow}>
          <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>Location</ThemedText>
          <ThemedText style={styles.infoValue}>{mainCampus?.location || 'Los Angeles, CA'}</ThemedText>
        </View>
      </View>
    </>
  );
}

// =============================================================================
// EDUCATION HOME
// =============================================================================

function EducationHome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const modeColors = ModeColors.education;

  const currentTerm = getCurrentTerm();
  const upcomingEvents = getUpcomingEvents(2);

  return (
    <>
      {/* Welcome */}
      <View style={styles.welcomeSection}>
        <ThemedText style={styles.welcomeGreeting}>Good morning,</ThemedText>
        <ThemedText style={styles.welcomeName}>Dr. Hart</ThemedText>
      </View>

      {/* Current Term */}
      <View style={[styles.highlightCard, { backgroundColor: modeColors.primary }]}>
        <IconSymbol name="graduationcap.fill" size={24} color="#FFFFFF" />
        <View style={styles.highlightContent}>
          <ThemedText style={styles.highlightTitle}>{currentTerm?.name || 'Spring 2026'}</ThemedText>
          <ThemedText style={styles.highlightSubtitle}>Current Term</ThemedText>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <QuickStat
          label="Enrollment"
          value={INSTITUTIONAL_METRICS.enrollment.total.toString()}
          icon="person.3.fill"
          color={modeColors.primary}
          colors={colors}
        />
        <QuickStat
          label="Programs"
          value={INSTITUTIONAL_METRICS.academics.programs.toString()}
          icon="rectangle.stack.fill"
          color={modeColors.primary}
          colors={colors}
        />
        <QuickStat
          label="Faculty"
          value={INSTITUTIONAL_METRICS.academics.facultyCount.toString()}
          icon="person.fill"
          color={modeColors.primary}
          colors={colors}
        />
      </View>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            UPCOMING
          </ThemedText>
          {upcomingEvents.map((event) => (
            <View
              key={event.id}
              style={[styles.eventRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.eventDate, { backgroundColor: modeColors.primary + '15' }]}>
                <ThemedText style={[styles.eventMonth, { color: modeColors.primary }]}>
                  {event.date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                </ThemedText>
                <ThemedText style={[styles.eventDay, { color: modeColors.primary }]}>
                  {event.date.getDate()}
                </ThemedText>
              </View>
              <View style={styles.eventInfo}>
                <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
                {event.description && (
                  <ThemedText style={[styles.eventDesc, { color: colors.textSecondary }]}>
                    {event.description}
                  </ThemedText>
                )}
              </View>
            </View>
          ))}
        </>
      )}

      {/* Quick Actions */}
      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        QUICK ACTIONS
      </ThemedText>
      <ActionCard
        title="Academic Calendar"
        subtitle="View full schedule"
        icon="calendar"
        color={modeColors.primary}
        colors={colors}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/organization/schedule');
        }}
      />
      <ActionCard
        title="Institutional Metrics"
        subtitle="Enrollment and outcomes"
        icon="chart.bar.fill"
        color={modeColors.primary}
        colors={colors}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/organization/metrics');
        }}
      />
      <ActionCard
        title="Archive"
        subtitle="Past academic years"
        icon="archivebox.fill"
        color={modeColors.primary}
        colors={colors}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/organization/archive');
        }}
      />
    </>
  );
}

// =============================================================================
// MODE SELECTOR
// =============================================================================

const MODE_OPTIONS: { mode: Mode; label: string }[] = [
  { mode: 'sports', label: 'Athletics' },
  { mode: 'church', label: 'Church' },
  { mode: 'enterprise', label: 'Enterprise' },
  { mode: 'education', label: 'Education' },
];

function getModeLabel(mode: Mode): string {
  return MODE_OPTIONS.find((o) => o.mode === mode)?.label ?? mode;
}

function ModeSelector() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const mode = useMode();
  const { switchMode } = useAppContext();
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback((selected: Mode) => {
    if (selected !== mode) {
      switchMode(selected);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setOpen(false);
  }, [mode, switchMode]);

  return (
    <View style={styles.modeSelectorWrapper}>
      <Pressable
        style={styles.modeSelectorRow}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setOpen((v) => !v);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Current mode: ${getModeLabel(mode)}. Tap to change.`}
      >
        <ThemedText style={[styles.modeSelectorText, { color: colors.text }]}>
          {getModeLabel(mode)}
        </ThemedText>
        <View style={styles.modeSelectorDot} />
      </Pressable>

      {open && (
        <>
          <Pressable style={styles.dropdownBackdrop} onPress={() => setOpen(false)} />
          <View style={[styles.dropdownCard, { backgroundColor: colors.card }]}>
            {MODE_OPTIONS.map((option) => {
              const isActive = option.mode === mode;
              return (
                <Pressable
                  key={option.mode}
                  style={({ pressed }) => [
                    styles.dropdownOption,
                    pressed && { opacity: 0.6 },
                  ]}
                  onPress={() => handleSelect(option.mode)}
                >
                  <ThemedText
                    style={[
                      styles.dropdownOptionText,
                      { color: colors.text },
                      isActive && styles.dropdownOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                  {isActive && <View style={styles.dropdownActiveDot} />}
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { state } = useAppContext();
  const mode = useMode();

  // Sports mode handles its own scroll (sticky header)
  if (mode === 'sports') {
    return (
      <ThemedView style={styles.container}>
        <SportsHome />
      </ThemedView>
    );
  }

  // Other modes use shared ScrollView wrapper
  const renderModeContent = () => {
    switch (mode) {
      case 'enterprise':
        return <EnterpriseHome />;
      case 'church':
        return <ChurchHome />;
      case 'education':
        return <EducationHome />;
      default:
        return <EnterpriseHome />;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderModeContent()}
      </ScrollView>
    </ThemedView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Mode Selector
  modeSelectorWrapper: {
    zIndex: 100,
    alignItems: 'center',
  },
  modeSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  modeSelectorText: {
    fontSize: 16,
    fontWeight: '700',
  },
  modeSelectorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
  },

  // Mode Dropdown
  dropdownBackdrop: {
    ...StyleSheet.absoluteFillObject,
    top: -500,
    bottom: -5000,
    left: -500,
    right: -500,
    zIndex: 99,
  },
  dropdownCard: {
    position: 'absolute',
    top: 42,
    zIndex: 100,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.xs,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    gap: 8,
  },
  dropdownOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownOptionTextActive: {
    fontWeight: '700',
  },
  dropdownActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Sports Home (sticky header layout)
  sportsHomeContainer: {
    flex: 1,
  },
  sportsScrollView: {
    flex: 1,
  },
  sportsScrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  rosterScrollContent: {
    flexGrow: 1,
  },
  pagerView: {
    flex: 1,
  },
  placeholderPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 120,
  },
  placeholderContainer: {
    alignItems: 'center',
    gap: 12,
  },
  placeholderLabel: {
    fontSize: 20,
    fontWeight: '600',
  },
  placeholderSubtext: {
    fontSize: 14,
    fontWeight: '400',
  },

  // Schedule tab
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  scheduleGameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 6,
  },
  scheduleGameLeft: {
    flex: 1,
    gap: 2,
  },
  scheduleGameDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  scheduleGameOpp: {
    fontSize: 15,
    fontWeight: '600',
  },
  scheduleGameScore: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Stats / Leaders tab
  leaderStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 6,
  },
  leaderStatLeft: {
    flex: 1,
    gap: 2,
  },
  leaderStatName: {
    fontSize: 15,
    fontWeight: '600',
  },
  leaderStatSub: {
    fontSize: 12,
    fontWeight: '400',
  },
  leaderStatRight: {
    alignItems: 'center',
    width: 50,
  },
  leaderStatVal: {
    fontSize: 16,
    fontWeight: '700',
  },
  leaderStatLabel: {
    fontSize: 10,
    fontWeight: '500',
  },

  // Welcome
  welcomeSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  welcomeGreeting: {
    fontSize: 16,
    opacity: 0.7,
  },
  welcomeName: {
    fontSize: 28,
    fontWeight: '700',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  quickStat: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  quickStatIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  quickStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // Section Title
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },

  // ===== SPORTS HOME STYLES (v1.1) =====

  // Team Hub Tabs (ESPN-style header row)
  hubTabsContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
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

  // Team Truth Header
  teamStateSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingNumber: {
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: -2,
    lineHeight: 72,
  },
  tierLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: -2,
    marginBottom: 4,
  },
  krBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  krLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  subRatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  subRatingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  subRatingLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subRatingValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  metaLine: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    lineHeight: 18,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  recordText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  streakBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Year Picker
  yearPickerWrapper: {
    alignItems: 'center',
    marginTop: 6,
    zIndex: 10,
  },
  yearPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
  },
  yearPickerText: {
    fontSize: 13,
    fontWeight: '500',
  },
  yearPickerDropdown: {
    position: 'absolute',
    top: 30,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    minWidth: 120,
  },
  yearPickerOption: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  yearPickerOptionText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Program Context Card
  contextCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  contextDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },

  // Status Row (for Current Status card)
  statusRow: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    gap: 4,
  },
  statusRowTappable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  statusRowContent: {
    flex: 1,
    gap: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '400',
  },

  // Pregame Packet Button
  pregamePacketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    gap: 10,
  },
  pregamePacketText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },

  // Action Card
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  // Info Card
  infoCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },

  // Highlight Card
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  highlightContent: {
    marginLeft: Spacing.sm,
  },
  highlightTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  highlightSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginTop: 2,
  },

  // Event Row
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  eventDate: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  eventMonth: {
    fontSize: 10,
    fontWeight: '600',
  },
  eventDay: {
    fontSize: 18,
    fontWeight: '700',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  eventDesc: {
    fontSize: 13,
    marginTop: 2,
  },

});
