/**
 * Home Screen
 * Mode-aware dashboard showing contextual information.
 * Per spec: Home displays key stats and quick actions for the current mode.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput, Animated, PanResponder, Dimensions, InteractionManager, Image, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/core';
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
import { FMU_GAMES, FMU_LEADERS, FMU_STANDINGS, FMU_NEWS, FMU_RECORD, FMU_LAST_GAME, FMU_LAST_GAME_ID, FMU_NEXT_GAME, FMU_NEXT_GAME_ID, FMU_SEASON_COMPLETE, FMU_GAME_BPR, getBPRColor, FMU_GAME_IMPACT, getPGISColor, getTGISColor, tgisToDisplay, FMU_PREGAME, ROSTER_KR, DNA_OFFENSE_POOL, DNA_DEFENSE_POOL, DNA_TEMPO_POOL, jerseyArchetypeMap, POSITIVE_IMPACT, NEGATIVE_IMPACT, type PregameSnapshot, type ClusterRating } from '@/data/fmu';
import { consumeHomeReset, registerHomeResetCallback } from '@/utils/global-home';
import { registerTeamSheetHandlers } from '@/utils/global-team-sheet';

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
  { id: 'recruiting', label: 'Recruiting' },
  { id: 'stats', label: 'Statistics' },
  { id: 'game-ops', label: 'Game Ops' },
  { id: 'program', label: 'Program' },
  { id: 'development', label: 'Development' },
];

// FMU seal logo
const FMU_SEAL = require('@/assets/images/fmu-seal.png');

// FMU team state — derived from real data
const fmuStreak = FMU_STANDINGS.find((r) => r.team === 'Florida Memorial')?.streak ?? '—';
const DEMO_TEAM_STATE = {
  name: 'Florida Memorial',
  level: 'NAIA',
  conference: 'Sun Conference',
  record: FMU_RECORD.overall,
  confRecord: FMU_RECORD.conference,
  streak: fmuStreak,
  tier: 'Regional Power',
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
        .map((g) => `${g.date}${g.gameTime ? ` ${g.gameTime}` : ''} ${g.location === 'Home' ? 'vs' : '@'} ${g.opponent}`),
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


// ── Collapsible Block Header (tap to expand) ──
function CollapsibleHeader({ label, expanded, onToggle, colors }: { label: string; expanded: boolean; onToggle: () => void; colors: typeof Colors.light }) {
  return (
    <Pressable
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggle(); }}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, marginBottom: expanded ? 6 : Spacing.md }}
    >
      <ThemedText style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.5, color: colors.textTertiary }}>{label}</ThemedText>
      <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={10} color={colors.textTertiary} />
    </Pressable>
  );
}

// ── Pregame Snapshot Sheet Content (shared by both sheets) ──
function PregameSheetContent({ pregame, colors, expanded, onToggle }: {
  pregame: PregameSnapshot;
  colors: typeof Colors.light;
  expanded: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  const [activeDriver, setActiveDriver] = useState(0);
  const expectColor = pregame.expectation === 'FAVORED' ? '#4ADE80' : pregame.expectation === 'UNDERDOG' ? '#EF4444' : '#F59E0B';
  const expectBg = pregame.expectation === 'FAVORED' ? '#4ADE8020' : pregame.expectation === 'UNDERDOG' ? '#EF444420' : '#F59E0B20';
  const cardStyle = [shStyles.card, { backgroundColor: colors.backgroundSecondary }] as any;
  const divStyle = [shStyles.divider, { backgroundColor: colors.divider }] as any;
  const sLabel = { fontSize: 11 as number, fontWeight: '600' as const, letterSpacing: 0.5, color: colors.textTertiary };
  const clusters = pregame.clusterRatings ?? [];
  const offClusters = clusters.filter(c => ['Shooting', 'Finishing', 'Playmaking'].includes(c.cluster));
  const defClusters = clusters.filter(c => ['On-Ball Defense', 'Team Defense', 'Rebounding', 'Physical'].includes(c.cluster));
  const offKR = offClusters.length > 0 ? Math.round(offClusters.reduce((s, c) => s + c.rating, 0) / offClusters.length) : null;
  const defKR = defClusters.length > 0 ? Math.round(defClusters.reduce((s, c) => s + c.rating, 0) / defClusters.length) : null;

  return (
    <>
      {/* Expectation badge + spread */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
        <View style={{ paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12, backgroundColor: expectBg }}>
          <ThemedText style={{ fontSize: 13, fontWeight: '800', letterSpacing: 0.5, color: expectColor }}>{pregame.expectation}</ThemedText>
        </View>
        <ThemedText style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
          {pregame.krGap > 0 ? '+' : ''}{Math.round(pregame.krGap * 0.4)}
        </ThemedText>
      </View>
      {/* Off KR / Def KR pills */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
        {offKR != null && (
          <View style={{ backgroundColor: colors.backgroundSecondary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
            <ThemedText style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>OFF {offKR}</ThemedText>
          </View>
        )}
        {defKR != null && (
          <View style={{ backgroundColor: colors.backgroundSecondary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
            <ThemedText style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>DEF {defKR}</ThemedText>
          </View>
        )}
      </View>

      {/* Overall KR pill — tap to expand clusters */}
      <Pressable
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 10, marginBottom: expanded.overallKR ? 0 : Spacing.md }}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggle('overallKR');
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, flex: 1 }}>
          {pregame.theirDNA.map((bullet, i) => {
            const val = bullet.includes(': ') ? bullet.split(': ')[1] : bullet;
            return (
              <View key={i} style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.backgroundSecondary }}>
                <ThemedText style={{ fontSize: 11, fontWeight: '700', color: colors.text }}>{val}</ThemedText>
              </View>
            );
          })}
        </View>
      </Pressable>

      {expanded.overallKR && (
        <View style={{ marginBottom: Spacing.md }}>
          {/* 7 Cluster Ratings */}
          <View style={[cardStyle]}>
            {pregame.clusterRatings.map((cr, i) => {
              const isExpanded = !!expanded[`cl_${i}`];
              const ratingColor = cr.rating >= 75 ? '#4CAF50' : cr.rating >= 55 ? '#FF9800' : '#EF4444';
              return (
                <View key={i}>
                  {i > 0 && <View style={divStyle} />}
                  <Pressable
                    style={{ flexDirection: 'row', alignItems: 'center', padding: Spacing.md }}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onToggle(`cl_${i}`);
                    }}
                  >
                    <ThemedText style={{ flex: 1, fontSize: 14, fontWeight: '600', color: colors.text }}>{cr.cluster}</ThemedText>
                    <ThemedText style={{ fontSize: 15, fontWeight: '700', color: ratingColor, marginRight: 8 }}>{cr.rating}</ThemedText>
                    <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down'} size={12} color={colors.textTertiary} />
                  </Pressable>
                  {isExpanded && (
                    <View style={{ backgroundColor: colors.backgroundTertiary, paddingBottom: 6 }}>
                      {cr.subclusters.map((sc, si) => {
                        const scColor = sc.rating >= 75 ? '#4CAF50' : sc.rating >= 55 ? '#FF9800' : '#EF4444';
                        return (
                          <View key={si} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md + 8, paddingVertical: 5 }}>
                            <ThemedText style={{ flex: 1, fontSize: 12, color: colors.textSecondary }}>{sc.name}</ThemedText>
                            <ThemedText style={{ fontSize: 13, fontWeight: '600', color: scColor }}>{sc.rating}</ThemedText>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* C) System Drivers — swipeable top 3 */}
      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <View style={{ backgroundColor: colors.backgroundSecondary, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12 }}>
          <ThemedText style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.5 }}>SYSTEM DRIVERS</ThemedText>
        </View>
      </View>
      {/* 3 face avatars — tap to select */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: Spacing.md, marginBottom: 10 }}>
        {pregame.oppThreats.slice(0, 3).map((t, i) => {
          const isActive = activeDriver === i;
          return (
            <Pressable
              key={i}
              style={{ alignItems: 'center', flex: 1, opacity: isActive ? 1 : 0.45 }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveDriver(i);
              }}
            >
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center', marginBottom: 4, borderWidth: isActive ? 2 : 0, borderColor: '#FFFFFF' }}>
                <IconSymbol name="person.fill" size={24} color={isActive ? '#FFFFFF' : colors.textTertiary} />
              </View>
              <ThemedText style={{ fontSize: 11, fontWeight: '600', color: colors.text, textAlign: 'center' }}>{t.name}</ThemedText>
            </Pressable>
          );
        })}
      </View>
      {/* Active player detail */}
      {(() => {
        const t = pregame.oppThreats[activeDriver];
        if (!t) return null;
        return (
          <View style={[cardStyle, { marginBottom: Spacing.md }]}>
            <View style={{ padding: Spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <ThemedText style={{ flex: 1, fontSize: 15, fontWeight: '700', color: colors.text }}>
                  {t.name} <ThemedText style={{ fontWeight: '400', color: colors.textTertiary }}>{'\u2014'} {t.archetype}</ThemedText>
                </ThemedText>
                <ThemedText style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary }}>{t.kr} KR</ThemedText>
              </View>
              {t.strengths.map((s, si) => (
                <View key={`s${si}`} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
                  <ThemedText style={{ fontSize: 12, color: '#4CAF50', marginRight: 6, fontWeight: '700' }}>+</ThemedText>
                  <ThemedText style={{ fontSize: 13, color: colors.text, flex: 1 }}>{s}</ThemedText>
                </View>
              ))}
              {t.weaknesses.map((w, wi) => (
                <View key={`w${wi}`} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
                  <ThemedText style={{ fontSize: 12, color: '#EF4444', marginRight: 6, fontWeight: '700' }}>{'\u2013'}</ThemedText>
                  <ThemedText style={{ fontSize: 13, color: colors.text, flex: 1 }}>{w}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        );
      })()}

      {/* Keys to the Game — always visible */}
      <View style={[cardStyle, { marginBottom: Spacing.md, borderWidth: 1, borderColor: colors.divider }]}>
        <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: 6 }}>
          <ThemedText style={{ fontSize: 13, fontWeight: '800', letterSpacing: 0.5, color: colors.text, marginBottom: 8 }}>KEYS TO THE GAME</ThemedText>
        </View>
        {pregame.ourEdge.map((key, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: Spacing.md, paddingBottom: 10 }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.backgroundTertiary, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 1 }}>
              <ThemedText style={{ fontSize: 11, fontWeight: '800', color: colors.text }}>{i + 1}</ThemedText>
            </View>
            <ThemedText style={{ fontSize: 13, color: colors.text, flex: 1, lineHeight: 18 }}>{key}</ThemedText>
          </View>
        ))}
      </View>

    </>
  );
}

function ScheduleHub({ colors, router }: { colors: typeof Colors.light; router: any }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ScheduleTab>('feed');
  const [standingsView, setStandingsView] = useState<'official' | 'kr'>('official');
  const [krScope, setKrScope] = useState<'national' | 'conference'>('national');
  const [search, setSearch] = useState('');
  const [expandedLeader, setExpandedLeader] = useState<string | null>(null);
  const [oppKRSheet, setOppKRSheet] = useState<{ opponent: string; kr: number; record: string; gameId?: string; gameStatus?: string; score?: string } | null>(null);
  const [pregameExpanded, setPregameExpanded] = useState<Record<string, boolean>>({});
  const [activePGIS, setActivePGIS] = useState(0);
  const [fullPGISOpen, setFullPGISOpen] = useState(false);
  const togglePregameBlock = useCallback((key: string) => {
    setPregameExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Sheet animation
  const SHEET_HEIGHT = Dimensions.get('window').height * 0.58;
  const sheetAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const sheetOpen = useRef(false);

  const openSheet = useCallback((data: { opponent: string; kr: number; record: string; gameId?: string; gameStatus?: string; score?: string }) => {
    sheetAnim.stopAnimation();
    backdropAnim.stopAnimation();
    sheetOpen.current = true;
    setOppKRSheet(data);
    sheetAnim.setValue(SHEET_HEIGHT);
    Animated.parallel([
      Animated.spring(sheetAnim, { toValue: 0, useNativeDriver: true, damping: 25, stiffness: 300 }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [SHEET_HEIGHT, sheetAnim, backdropAnim]);

  const closeSheet = useCallback(() => {
    sheetOpen.current = false;
    sheetAnim.stopAnimation();
    backdropAnim.stopAnimation();
    Animated.parallel([
      Animated.spring(sheetAnim, { toValue: SHEET_HEIGHT, useNativeDriver: true, damping: 28, stiffness: 180 }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start(() => {
      if (!sheetOpen.current) setOppKRSheet(null);
    });
  }, [SHEET_HEIGHT, sheetAnim, backdropAnim]);

  // Simple swipe-down tracking
  const touchStartY = useRef(0);
  const sheetScrollOffset = useRef(0);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? FMU_GAMES.filter((g) =>
        g.opponent.toLowerCase().includes(q) ||
        g.date.toLowerCase().includes(q) ||
        g.location.toLowerCase().includes(q))
    : FMU_GAMES;

  // Sort: live games first, then original order
  const sortedGames = [...filtered].sort((a, b) => {
    if (a.status === 'live' && b.status !== 'live') return -1;
    if (a.status !== 'live' && b.status === 'live') return 1;
    return 0;
  });

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
            {/* Pinned Live Game */}
            {sortedGames.filter((g) => g.status === 'live').map((game) => (
              <Pressable
                key={game.id}
                style={({ pressed }) => [shStyles.liveCard, { backgroundColor: colors.backgroundSecondary }, pressed && { opacity: 0.7 }]}
                onPress={() => navigateToGame(game.id)}
              >
                <View style={shStyles.liveCardDot} />
                <View style={{ flex: 1 }}>
                  <ThemedText style={[shStyles.liveCardLabel, { color: '#EF4444' }]}>LIVE</ThemedText>
                  <ThemedText style={[shStyles.opponentText, { color: colors.text }]}>
                    {game.location === 'Home' ? 'vs' : '@'} {game.opponent}
                  </ThemedText>
                  {(game.opponentKR || game.opponentRecord) && (
                    <ThemedText style={[shStyles.krRecordText, { color: colors.textTertiary }]}>
                      {game.opponentKR ? `${game.opponentKR} KR` : ''}{game.opponentKR && game.opponentRecord ? ' · ' : ''}{game.opponentRecord ?? ''}
                    </ThemedText>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {game.score && (
                    <ThemedText style={[shStyles.liveScore, { color: colors.text }]}>{game.score}</ThemedText>
                  )}
                  {game.clock && (
                    <ThemedText style={{ fontSize: 12, color: colors.textTertiary }}>{game.clock}</ThemedText>
                  )}
                </View>
              </Pressable>
            ))}

            {/* Upcoming Games */}
            {(() => {
              const upcoming = sortedGames.filter((g) => g.status === 'upcoming').slice(0, 2);
              if (upcoming.length === 0) return null;
              return (
                <>
                  <ThemedText style={[shStyles.sectionLabel, { color: colors.textSecondary }]}>UPCOMING</ThemedText>
                  <View style={[shStyles.card, { backgroundColor: colors.backgroundSecondary, marginBottom: Spacing.md }]}>
                    {upcoming.map((game, index) => (
                      <View key={game.id}>
                        {index > 0 && <View style={[shStyles.divider, { backgroundColor: colors.divider }]} />}
                        <View style={styles.recentRow}>
                          <Pressable
                            style={({ pressed }) => [{ flex: 1 }, pressed && { opacity: 0.7 }]}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              openSheet({ opponent: game.opponent, kr: game.opponentKR ?? 0, record: game.opponentRecord ?? '', gameId: game.id, gameStatus: game.status });
                            }}
                          >
                            <ThemedText style={[shStyles.opponentText, { color: colors.text }]}>{game.location === 'Home' ? 'vs' : '@'} {game.opponent}{game.opponentKR ? ` (${game.opponentKR})` : ''}</ThemedText>
                            {game.opponentRecord && (
                              <ThemedText style={[styles.recentMeta, { color: colors.textTertiary }]}>
                                {game.opponentRecord}
                              </ThemedText>
                            )}
                            <ThemedText style={[styles.recentMeta, { color: colors.textTertiary }]}>
                              {game.gameType ?? 'NON-CONF'} · {game.venue ?? game.location}
                            </ThemedText>
                          </Pressable>
                          <Pressable
                            style={({ pressed }) => [styles.recentRight, pressed && { opacity: 0.7 }]}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              router.push(`/coach/game-detail?gameId=${game.id}` as any);
                            }}
                          >
                            <ThemedText style={[styles.upcomingDateTime, { color: '#FFFFFF' }]}>
                              {game.date}{game.gameTime ? ` · ${game.gameTime}` : ''}
                            </ThemedText>
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              );
            })()}

            {/* Search between upcoming and completed */}
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

            {/* Completed Games (Recent block style) */}
            {(() => {
              const completed = sortedGames.filter((g) => g.status === 'final' && g.score);
              if (completed.length === 0) return null;

              // Streak badge: show only if last 3 are all W or all L
              const last3 = completed.slice(0, 3).map((g) => g.score?.charAt(0));
              const allWin = last3.length === 3 && last3.every((r) => r === 'W');
              const allLoss = last3.length === 3 && last3.every((r) => r === 'L');
              const streakBadge = allWin ? '3W' : allLoss ? '3L' : null;

              return (
                <>
                  <View style={styles.recentHeader}>
                    <ThemedText style={[shStyles.sectionLabel, { color: colors.textSecondary, marginBottom: 0 }]}>COMPLETED</ThemedText>
                    {streakBadge && (
                      <View style={[styles.miniStreakBadge, { backgroundColor: allWin ? '#4CAF5018' : '#EF444418' }]}>
                        <ThemedText style={[styles.miniStreakText, { color: allWin ? '#4CAF50' : '#EF4444' }]}>
                          {streakBadge}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  <View style={[shStyles.card, { backgroundColor: colors.backgroundSecondary }]}>
                    {completed.map((game, index) => {
                      const isWin = game.score?.startsWith('W');
                      const isLoss = game.score?.startsWith('L');
                      const scoreDisplay = game.score?.replace('-', '–') ?? '';
                      return (
                        <View key={game.id}>
                          {index > 0 && <View style={[shStyles.divider, { backgroundColor: colors.divider }]} />}
                          <View style={styles.recentRow}>
                            <Pressable
                              style={({ pressed }) => [{ flex: 1 }, pressed && { opacity: 0.7 }]}
                              onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                openSheet({ opponent: game.opponent, kr: game.opponentKR ?? 0, record: game.opponentRecord ?? '', gameId: game.id, gameStatus: game.status, score: game.score ?? '' });
                              }}
                            >
                              <ThemedText style={[styles.recentOpponent, { color: colors.text }]}>
                                {game.location === 'Home' ? 'vs' : '@'} {game.opponent}{game.opponentKR ? ` (${game.opponentKR})` : ''}
                              </ThemedText>
                              {game.opponentRecord && (
                                <ThemedText style={[styles.recentMeta, { color: colors.textTertiary }]}>
                                  {game.opponentRecord}
                                </ThemedText>
                              )}
                              <ThemedText style={[styles.recentMeta, { color: colors.textTertiary }]}>
                                {game.date} · {game.gameType ?? 'NON-CONF'} · {game.venue ?? game.location}
                              </ThemedText>
                            </Pressable>
                            <Pressable
                              style={({ pressed }) => [styles.recentRight, pressed && { opacity: 0.7 }]}
                              onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                router.push(`/coach/game-detail?gameId=${game.id}` as any);
                              }}
                            >
                              <View style={[styles.recentPill, { backgroundColor: '#f5f5f518' }]}>
                                <ThemedText style={[styles.recentPillText, { color: '#f5f5f5' }]}>
                                  FINAL
                                </ThemedText>
                              </View>
                              <ThemedText style={[styles.recentScore, { color: isWin ? '#f5f5f5' : isLoss ? '#EF4444' : colors.text }]}>
                                {scoreDisplay}
                              </ThemedText>
                            </Pressable>
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

      {/* Opponent KR Bottom Sheet */}
      {oppKRSheet && (() => {
        const opp = oppKRSheet.opponent;
        const sheetGameId = oppKRSheet.gameId ?? '';
        const impact = oppKRSheet.gameStatus === 'final' && sheetGameId ? FMU_GAME_IMPACT[sheetGameId] : null;
        const pregame = oppKRSheet.gameStatus === 'upcoming' && sheetGameId ? FMU_PREGAME[sheetGameId] : null;

        return (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {/* Backdrop */}
            <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.25)', opacity: backdropAnim }]}>
              <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
            </Animated.View>

            {/* Sheet */}
            <Animated.View
              style={[
                shStyles.oppSheet,
                {
                  backgroundColor: colors.background,
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: SHEET_HEIGHT,
                  transform: [{ translateY: sheetAnim }],
                },
              ]}
            >
              {/* Handle pill — tap or swipe down to close */}
              <Pressable
                onPress={closeSheet}
                onTouchStart={(e) => { touchStartY.current = e.nativeEvent.pageY; }}
                onTouchEnd={(e) => {
                  const dy = e.nativeEvent.pageY - touchStartY.current;
                  if (dy > 30) closeSheet();
                }}
                style={{ alignItems: 'center', paddingVertical: 20, paddingHorizontal: 40 }}
                hitSlop={20}
              >
                <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
              </Pressable>

              {/* Sheet body */}
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                showsVerticalScrollIndicator={false}
                bounces
                scrollEventThrottle={16}
                onScroll={(e) => { sheetScrollOffset.current = e.nativeEvent.contentOffset.y; }}
                onScrollEndDrag={(e) => {
                  if (sheetScrollOffset.current <= 0 && e.nativeEvent.contentOffset.y < -40) {
                    closeSheet();
                  }
                }}
              >
                {/* Header */}
                {(() => {
                  const sheetGame = sheetGameId ? FMU_GAMES.find((g) => g.id === sheetGameId) : null;
                  return (
                    <View style={{ alignItems: 'center', marginBottom: Spacing.md }}>
                      <ThemedText style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>
                        {sheetGame ? `${sheetGame.location === 'Home' ? 'vs' : '@'} ` : ''}{opp}{oppKRSheet.kr ? ` (${oppKRSheet.kr})` : ''}
                      </ThemedText>
                      <ThemedText style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>{oppKRSheet.record}</ThemedText>
                      {sheetGame && (
                        <ThemedText style={{ fontSize: 12, color: colors.textTertiary, marginTop: 4 }}>
                          {sheetGame.date}{sheetGame.gameTime ? ` · ${sheetGame.gameTime}` : ''} · {sheetGame.gameType ?? 'NON-CONF'} · {sheetGame.venue ?? sheetGame.location}
                        </ThemedText>
                      )}
                      {oppKRSheet.score ? (() => {
                        const isWin = oppKRSheet.score.startsWith('W');
                        const isLoss = oppKRSheet.score.startsWith('L');
                        const resultColor = isWin ? '#4ADE80' : isLoss ? '#EF4444' : colors.text;
                        // ATS: compare actual margin to pregame spread
                        // Score format: "W fmu-opp" or "L fmu-opp" — first number always FMU
                        const pregameData = sheetGameId ? FMU_PREGAME[sheetGameId] : null;
                        const scoreMatch = oppKRSheet.score.match(/(\d+)-(\d+)/);
                        let atsText = '';
                        if (pregameData && scoreMatch) {
                          const spread = Math.round(pregameData.krGap * 0.4);
                          const fmuScore = parseInt(scoreMatch[1]);
                          const oppScore = parseInt(scoreMatch[2]);
                          const actualMargin = fmuScore - oppScore;
                          const ats = actualMargin - spread;
                          atsText = ats >= 0 ? `+${ats}` : `${ats}`;
                        }
                        return (
                          <>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                              <View style={{ paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12, backgroundColor: isWin ? '#4ADE8020' : isLoss ? '#EF444420' : colors.backgroundSecondary }}>
                                <ThemedText style={{ fontSize: 13, fontWeight: '800', letterSpacing: 0.5, color: resultColor }}>
                                  {isWin ? 'WIN' : isLoss ? 'LOSS' : 'FINAL'}
                                </ThemedText>
                              </View>
                            </View>
                            <ThemedText style={{ fontSize: 15, fontWeight: '700', color: resultColor, marginTop: 4 }}>
                              {oppKRSheet.score.replace('-', '–')}{atsText ? ` (${atsText})` : ''}
                            </ThemedText>
                          </>
                        );
                      })() : null}
                    </View>
                  );
                })()}

                {/* TGIS + PGIS for completed games, Pregame Snapshot for upcoming */}
                {impact ? (
                    <>
                      {/* TGIS Block */}
                      <View style={{ backgroundColor: colors.backgroundSecondary, borderRadius: BorderRadius.lg, padding: Spacing.md, marginHorizontal: Spacing.md, marginBottom: Spacing.md }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <ThemedText style={{ fontSize: 13, fontWeight: '800', letterSpacing: 0.5, color: colors.text }}>GAME SCORE</ThemedText>
                          <View style={{ backgroundColor: getTGISColor(impact.tgis) + '20', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <ThemedText style={{ fontSize: 12, fontWeight: '700', color: getTGISColor(impact.tgis) }}>
                              {impact.tgisLabel}
                            </ThemedText>
                            <ThemedText style={{ fontSize: 11, fontWeight: '600', color: getTGISColor(impact.tgis), opacity: 0.7 }}>
                              {tgisToDisplay(impact.tgis).toFixed(1)}
                            </ThemedText>
                          </View>
                        </View>
                        {impact.drivers.map((d, i) => (
                          <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: i === 0 ? 0 : 6 }}>
                            <ThemedText style={{ fontSize: 13, color: colors.textTertiary, marginRight: 8 }}>{'\u2022'}</ThemedText>
                            <ThemedText style={{ fontSize: 13, color: colors.textSecondary, flex: 1 }}>{d}</ThemedText>
                          </View>
                        ))}
                      </View>

                      {/* Player Impact Score — top 3 */}
                      {(() => {
                        const top3 = [...impact.starters, ...impact.bench].sort((a, b) => b.pgis - a.pgis).slice(0, 3);
                        if (top3.length === 0) return null;
                        const activeP = top3[activePGIS] ?? top3[0];
                        return (
                          <>
                            {/* Centered pill */}
                            <View style={{ alignItems: 'center', marginBottom: 10 }}>
                              <View style={{ backgroundColor: colors.backgroundSecondary, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12 }}>
                                <ThemedText style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.5 }}>PLAYER IMPACT SCORE</ThemedText>
                              </View>
                            </View>
                            {/* 3 face avatars — tap to select */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: Spacing.md, marginBottom: 10 }}>
                              {top3.map((p, i) => {
                                const isActive = activePGIS === i;
                                return (
                                  <Pressable
                                    key={i}
                                    style={{ alignItems: 'center', flex: 1, opacity: isActive ? 1 : 0.45 }}
                                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActivePGIS(i); }}
                                  >
                                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center', marginBottom: 4, borderWidth: isActive ? 2 : 0, borderColor: getPGISColor(p.pgis) }}>
                                      <IconSymbol name="person.fill" size={24} color={isActive ? getPGISColor(p.pgis) : colors.textTertiary} />
                                    </View>
                                    <ThemedText style={{ fontSize: 11, fontWeight: '600', color: colors.text, textAlign: 'center' }}>{p.name.split(' ').pop()}</ThemedText>
                                  </Pressable>
                                );
                              })}
                            </View>
                            {/* Active player detail */}
                            <View style={[shStyles.card, { backgroundColor: colors.backgroundSecondary, marginBottom: Spacing.md }]}>
                              <View style={{ padding: Spacing.md }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                  <ThemedText style={{ flex: 1, fontSize: 15, fontWeight: '700', color: colors.text }}>
                                    {activeP.name} <ThemedText style={{ fontWeight: '400', color: colors.textTertiary }}>{'\u2014'} {activeP.archetype}</ThemedText>
                                  </ThemedText>
                                  <ThemedText style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary }}>{activeP.kr} KR</ThemedText>
                                </View>
                                {activeP.positives.map((s, si) => (
                                  <View key={`p${si}`} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
                                    <ThemedText style={{ fontSize: 12, color: '#4CAF50', marginRight: 6, fontWeight: '700' }}>+</ThemedText>
                                    <ThemedText style={{ fontSize: 13, color: colors.text, flex: 1 }}>{s}</ThemedText>
                                  </View>
                                ))}
                                {activeP.negatives.map((w, wi) => (
                                  <View key={`n${wi}`} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
                                    <ThemedText style={{ fontSize: 12, color: '#EF4444', marginRight: 6, fontWeight: '700' }}>{'\u2013'}</ThemedText>
                                    <ThemedText style={{ fontSize: 13, color: colors.text, flex: 1 }}>{w}</ThemedText>
                                  </View>
                                ))}
                              </View>
                            </View>

                            {/* Full PGIS button */}
                            <Pressable
                              style={({ pressed }) => [{ alignItems: 'center' as const, paddingVertical: 10, marginBottom: Spacing.md, backgroundColor: colors.backgroundSecondary, borderRadius: BorderRadius.lg }, pressed && { opacity: 0.7 }]}
                              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFullPGISOpen(!fullPGISOpen); }}
                            >
                              <ThemedText style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>Full PGIS</ThemedText>
                            </Pressable>

                            {fullPGISOpen && (
                              <>
                                {/* Starters */}
                                <ThemedText style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.5, color: colors.textTertiary, marginBottom: 6, paddingHorizontal: Spacing.md }}>
                                  STARTERS
                                </ThemedText>
                                <View style={[shStyles.card, { backgroundColor: colors.backgroundSecondary, marginBottom: Spacing.md }]}>
                                  {impact.starters.map((p, i) => (
                                    <View key={i}>
                                      {i > 0 && <View style={[shStyles.divider, { backgroundColor: colors.divider }]} />}
                                      <View style={{ flexDirection: 'row', alignItems: 'center', padding: Spacing.md }}>
                                        <View style={{ flex: 1 }}>
                                          <ThemedText style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                                            {p.name} <ThemedText style={{ fontSize: 12, color: colors.textTertiary, fontWeight: '400' }}>{p.archetype}</ThemedText>
                                          </ThemedText>
                                        </View>
                                        <View style={{ backgroundColor: getPGISColor(p.pgis) + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                                          <ThemedText style={{ fontSize: 12, fontWeight: '700', color: getPGISColor(p.pgis) }}>
                                            {p.pgis > 0 ? '+' : ''}{p.pgis}
                                          </ThemedText>
                                        </View>
                                      </View>
                                    </View>
                                  ))}
                                </View>

                                {/* Bench */}
                                {impact.bench.length > 0 && (
                                  <>
                                    <ThemedText style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.5, color: colors.textTertiary, marginBottom: 6, paddingHorizontal: Spacing.md }}>
                                      BENCH
                                    </ThemedText>
                                    <View style={[shStyles.card, { backgroundColor: colors.backgroundSecondary, marginBottom: Spacing.md }]}>
                                      {impact.bench.map((p, i) => (
                                        <View key={i}>
                                          {i > 0 && <View style={[shStyles.divider, { backgroundColor: colors.divider }]} />}
                                          <View style={{ flexDirection: 'row', alignItems: 'center', padding: Spacing.md }}>
                                            <View style={{ flex: 1 }}>
                                              <ThemedText style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                                                {p.name} <ThemedText style={{ fontSize: 12, color: colors.textTertiary, fontWeight: '400' }}>{p.archetype}</ThemedText>
                                              </ThemedText>
                                            </View>
                                            <View style={{ backgroundColor: getPGISColor(p.pgis) + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                                              <ThemedText style={{ fontSize: 12, fontWeight: '700', color: getPGISColor(p.pgis) }}>
                                                {p.pgis > 0 ? '+' : ''}{p.pgis}
                                              </ThemedText>
                                            </View>
                                          </View>
                                        </View>
                                      ))}
                                    </View>
                                  </>
                                )}
                              </>
                            )}
                          </>
                        );
                      })()}
                    </>
                ) : pregame ? (
                  <PregameSheetContent pregame={pregame} colors={colors} expanded={pregameExpanded} onToggle={togglePregameBlock} />
                ) : null}
              </ScrollView>
            </Animated.View>
          </View>
        );
      })()}
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
  krRecordText: { fontSize: 13, fontWeight: '500', marginTop: 2 },
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
  upcomingDate: { fontSize: 13, fontWeight: '700' },
  oppSheet: { borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, paddingHorizontal: Spacing.md, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 20 },
  oppKRPill: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: BorderRadius.lg, gap: 2 },
  liveCard: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderLeftWidth: 3, borderLeftColor: '#EF4444', gap: 10 },
  liveCardDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  liveCardLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  liveScore: { fontSize: 18, fontWeight: '700' },
  emptyState: { padding: Spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: 15 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: 12 },
  leaderBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.sm, minWidth: 44, alignItems: 'center' },
  leaderCategory: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  leaderName: { fontSize: 15, fontWeight: '500' },
  leaderValue: { fontSize: 16, fontWeight: '700' },
  leaderSubRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 10, paddingLeft: Spacing.md + 44 + 12, gap: 12 },
  leaderSubRank: { fontSize: 13, fontWeight: '600', width: 16 },
  leaderSubName: { fontSize: 14, fontWeight: '400' },
  leaderSubValue: { fontSize: 14, fontWeight: '600' },
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
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ hubTab?: string }>();

  // Active hub tab index (synced with PagerView)
  const initialTab = params.hubTab ? parseInt(params.hubTab, 10) : 0;
  const [activeHubIndex, setActiveHubIndex] = useState(initialTab);
  const pagerRef = useRef<PagerView>(null);

  // Reset PagerView to page 0 (the main Home hub)
  const resetToHome = useCallback(() => {
    setActiveHubIndex(0);
    pagerRef.current?.setPage(0);
  }, []);

  // Register immediate callback so pressing Home while already focused resets the pager
  useEffect(() => {
    registerHomeResetCallback(resetToHome);
    return () => registerHomeResetCallback(null);
  }, [resetToHome]);

  // When screen gains focus, check if TabFooter requested a reset to Home tab
  useFocusEffect(
    React.useCallback(() => {
      if (consumeHomeReset()) {
        InteractionManager.runAfterInteractions(() => {
          resetToHome();
        });
      }
    }, [])
  );

  // Navigate to requested hub tab when params change
  React.useEffect(() => {
    if (params.hubTab) {
      const idx = parseInt(params.hubTab, 10);
      if (!isNaN(idx) && idx !== activeHubIndex) {
        setActiveHubIndex(idx);
        pagerRef.current?.setPage(idx);
      }
    }
  }, [params.hubTab]);

  // KR details sheet
  const [krSheetVisible, setKrSheetVisible] = useState(false);

  // Recent BPR bottom sheet — always mounted, visibility toggled via animation
  const [recentSheet, setRecentSheet] = useState<{ opponent: string; kr: number; record: string; gameId: string; gameStatus: string; score?: string } | null>(null);
  const [recentPregameExpanded, setRecentPregameExpanded] = useState<Record<string, boolean>>({});
  const [activeRecentPGIS, setActiveRecentPGIS] = useState(0);
  const [fullRecentPGISOpen, setFullRecentPGISOpen] = useState(false);
  const toggleRecentPregameBlock = useCallback((key: string) => {
    setRecentPregameExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);
  const RECENT_SHEET_HEIGHT = Dimensions.get('window').height * 0.58;
  const recentSheetScrollOffset = useRef(0);
  const recentSheetAnim = useRef(new Animated.Value(RECENT_SHEET_HEIGHT)).current;
  const recentBackdropAnim = useRef(new Animated.Value(0)).current;
  const recentTouchStartY = useRef(0);
  const recentSheetOpen = useRef(false);

  const openRecentSheet = useCallback((data: { opponent: string; kr: number; record: string; gameId: string; gameStatus: string; score?: string }) => {
    recentSheetAnim.stopAnimation();
    recentBackdropAnim.stopAnimation();
    recentSheetOpen.current = true;
    setRecentSheet(data);
    recentSheetAnim.setValue(RECENT_SHEET_HEIGHT);
    Animated.parallel([
      Animated.spring(recentSheetAnim, { toValue: 0, useNativeDriver: true, damping: 25, stiffness: 300 }),
      Animated.timing(recentBackdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [RECENT_SHEET_HEIGHT, recentSheetAnim, recentBackdropAnim]);

  const closeRecentSheet = useCallback(() => {
    recentSheetOpen.current = false;
    recentSheetAnim.stopAnimation();
    recentBackdropAnim.stopAnimation();
    Animated.parallel([
      Animated.spring(recentSheetAnim, { toValue: RECENT_SHEET_HEIGHT, useNativeDriver: true, damping: 28, stiffness: 180 }),
      Animated.timing(recentBackdropAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start(() => {
      if (!recentSheetOpen.current) setRecentSheet(null);
    });
  }, [RECENT_SHEET_HEIGHT, recentSheetAnim, recentBackdropAnim]);

  // Team profile bottom sheet
  const [teamSheetOpen, setTeamSheetOpen] = useState(false);
  const TEAM_SHEET_HEIGHT = Dimensions.get('window').height * 0.55;
  const teamSheetAnim = useRef(new Animated.Value(Dimensions.get('window').height * 0.55)).current;
  const teamBackdropAnim = useRef(new Animated.Value(0)).current;
  const teamSheetOpenRef = useRef(false);
  const teamTouchStartY = useRef(0);
  const teamSheetScrollOffset = useRef(0);

  const openTeamSheet = useCallback(() => {
    teamSheetAnim.stopAnimation();
    teamBackdropAnim.stopAnimation();
    teamSheetOpenRef.current = true;
    setTeamSheetOpen(true);
    teamSheetAnim.setValue(TEAM_SHEET_HEIGHT);
    Animated.parallel([
      Animated.spring(teamSheetAnim, { toValue: 0, useNativeDriver: true, damping: 25, stiffness: 300 }),
      Animated.timing(teamBackdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [TEAM_SHEET_HEIGHT, teamSheetAnim, teamBackdropAnim]);

  const closeTeamSheet = useCallback(() => {
    teamSheetOpenRef.current = false;
    teamSheetAnim.stopAnimation();
    teamBackdropAnim.stopAnimation();
    Animated.parallel([
      Animated.spring(teamSheetAnim, { toValue: TEAM_SHEET_HEIGHT, useNativeDriver: true, damping: 28, stiffness: 180 }),
      Animated.timing(teamBackdropAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start(() => {
      if (!teamSheetOpenRef.current) setTeamSheetOpen(false);
    });
  }, [TEAM_SHEET_HEIGHT, teamSheetAnim, teamBackdropAnim]);

  // Register global team sheet handlers so any page can open it
  useEffect(() => {
    registerTeamSheetHandlers(openTeamSheet, closeTeamSheet);
  }, [openTeamSheet, closeTeamSheet]);

  // System drivers active player
  const [activeDriver, setActiveDriver] = useState(0);

  // Team system selection state
  const [selectedOffSystem, setSelectedOffSystem] = useState('Motion Read & React');
  const [selectedDefSystem, setSelectedDefSystem] = useState('Pack Line');
  const [selectedTempo, setSelectedTempo] = useState('Moderate');
  const [offDropdownOpen, setOffDropdownOpen] = useState(false);
  const [defDropdownOpen, setDefDropdownOpen] = useState(false);
  const [tempoDropdownOpen, setTempoDropdownOpen] = useState(false);

  // System-adjusted KR: each system has a modifier seeded from its name
  const systemKRModifier = useCallback((system: string, base: number) => {
    let hash = 0;
    for (let i = 0; i < system.length; i++) hash = ((hash << 5) - hash) + system.charCodeAt(i);
    const mod = ((Math.abs(hash) % 15) - 7); // -7 to +7
    return Math.max(40, Math.min(95, base + mod));
  }, []);

  // Compute live team KR from selected systems
  const baseOffKRHome = 72;
  const baseDefKRHome = 76;
  const liveOffKR = systemKRModifier(selectedOffSystem, baseOffKRHome);
  const liveDefKR = systemKRModifier(selectedDefSystem, baseDefKRHome);
  const liveTeamKR = Math.round((liveOffKR * 53 + liveDefKR * 47) / 100);

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
        {/* ===== 1) TEAM IDENTITY HEADER ===== */}
        <View style={styles.teamStateSection}>
          {/* Row 1: Logo + Identity */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', alignSelf: 'stretch' }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openTeamSheet(); }}>
              <Image source={FMU_SEAL} style={{ width: 72, height: 72, marginRight: 12 }} resizeMode="contain" />
            </Pressable>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 20, fontWeight: '800', color: colors.text, letterSpacing: -0.3 }}>
                {DEMO_TEAM_STATE.name} ({liveTeamKR})
              </ThemedText>
              <ThemedText style={{ fontSize: 13, color: colors.textTertiary, marginTop: 2 }}>
                {DEMO_TEAM_STATE.level} {'\u00B7'} {DEMO_TEAM_STATE.conference} {'\u00B7'} {DEMO_TEAM_STATE.tier}
              </ThemedText>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
                <ThemedText style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
                  {DEMO_TEAM_STATE.record} ({DEMO_TEAM_STATE.confRecord})
                </ThemedText>
                <View style={{ backgroundColor: DEMO_TEAM_STATE.streak.startsWith('W') ? '#4CAF5020' : '#EF444420', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                  <ThemedText style={{ fontSize: 11, fontWeight: '700', color: DEMO_TEAM_STATE.streak.startsWith('W') ? '#4CAF50' : '#EF4444' }}>
                    {DEMO_TEAM_STATE.streak}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

        </View>
        <View style={{ height: 10 }} />

        {/* ===== MEDIA CARD: Live Feed or Highlight Reel ===== */}
        {(() => {
          const liveGame = FMU_GAMES.find((g) => g.status === 'live');
          const isLive = !!liveGame;

          return (
            <Pressable
              style={({ pressed }) => [{
                backgroundColor: '#000',
                borderRadius: BorderRadius.lg,
                marginTop: Spacing.sm,
                overflow: 'hidden' as const,
              }, pressed && { opacity: 0.85 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (isLive) {
                  router.push(`/coach/game-detail?gameId=${liveGame.id}` as any);
                }
              }}
            >
              {/* Video placeholder */}
              <View style={{ height: 180, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' }}>
                  <IconSymbol name="play.fill" size={24} color="#fff" />
                </View>
              </View>

              {/* Info overlay */}
              <View style={{ padding: 12 }}>
                {isLive ? (
                  <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' }} />
                      <ThemedText style={{ fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: '#EF4444' }}>LIVE</ThemedText>
                    </View>
                    <ThemedText style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>
                      {liveGame.location === 'Home' ? 'vs' : '@'} {liveGame.opponent}{liveGame.opponentKR ? ` (${liveGame.opponentKR})` : ''}
                    </ThemedText>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <ThemedText style={{ fontSize: 13, color: '#999' }}>
                        {liveGame.opponentRecord ?? ''}
                      </ThemedText>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {liveGame.score && (
                          <ThemedText style={{ fontSize: 18, fontWeight: '700', color: '#fff' }}>{liveGame.score}</ThemedText>
                        )}
                        {liveGame.clock && (
                          <ThemedText style={{ fontSize: 12, color: '#999' }}>{liveGame.clock}</ThemedText>
                        )}
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    <ThemedText style={{ fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: '#F59E0B', marginBottom: 4 }}>HIGHLIGHT REEL</ThemedText>
                    <ThemedText style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>
                      FMU Lions 2025-26 Season Highlights
                    </ThemedText>
                    <ThemedText style={{ fontSize: 13, color: '#999', marginTop: 4 }}>
                      Top plays and moments from this season
                    </ThemedText>
                  </>
                )}
              </View>
            </Pressable>
          );
        })()}

        {/* ===== 2) UPCOMING (Next 3) ===== */}
        {(() => {
          const upcomingGames = FMU_GAMES.filter((g) => g.status === 'upcoming').slice(0, 2);
          if (upcomingGames.length === 0) return null;
          return (
            <>
              <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: Spacing.md, marginBottom: 0 }]}>
                UPCOMING
              </ThemedText>
              <View style={[styles.contextCard, { backgroundColor: colors.backgroundSecondary }]}>
                {upcomingGames.map((game, index) => (
                  <View key={game.id}>
                    {index > 0 && <View style={[styles.contextDivider, { backgroundColor: colors.divider }]} />}
                    <View style={styles.recentRow}>
                      <Pressable
                        style={({ pressed }) => [{ flex: 1 }, pressed && { opacity: 0.7 }]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          openRecentSheet({ opponent: game.opponent, kr: game.opponentKR ?? 0, record: game.opponentRecord ?? '', gameId: game.id, gameStatus: game.status });
                        }}
                      >
                        <ThemedText style={[styles.recentOpponent, { color: colors.text }]}>
                          {game.location === 'Home' ? 'vs' : '@'} {game.opponent}{game.opponentKR ? ` (${game.opponentKR})` : ''}
                        </ThemedText>
                        {game.opponentRecord && (
                          <ThemedText style={[styles.recentMeta, { color: colors.textTertiary }]}>
                            {game.opponentRecord}
                          </ThemedText>
                        )}
                        <ThemedText style={[styles.recentMeta, { color: colors.textTertiary }]}>
                          {game.gameType ?? 'NON-CONF'} · {game.venue ?? game.location}
                        </ThemedText>
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [styles.recentRight, pressed && { opacity: 0.7 }]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          router.push(`/coach/game-detail?gameId=${game.id}` as any);
                        }}
                      >
                        <ThemedText style={[styles.upcomingDateTime, { color: '#FFFFFF' }]}>
                          {game.date}{game.gameTime ? ` · ${game.gameTime}` : ''}
                        </ThemedText>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            </>
          );
        })()}

        {/* ===== 3) RECENT (Last 3) ===== */}
        {(() => {
          const recentGames = FMU_GAMES.filter((g) => g.status === 'final' && g.score).slice(-3).reverse();
          if (recentGames.length === 0) return null;

          // Streak badge: show only if all 3 are W or all 3 are L
          const results = recentGames.map((g) => g.score?.charAt(0));
          const allWin = results.length === 3 && results.every((r) => r === 'W');
          const allLoss = results.length === 3 && results.every((r) => r === 'L');
          const streakBadge = allWin ? '3W' : allLoss ? '3L' : null;

          return (
            <>
              <View style={styles.recentHeader}>
                <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: Spacing.md, marginBottom: 0 }]}>
                  RECENT
                </ThemedText>
                {streakBadge && (
                  <View style={[styles.miniStreakBadge, { backgroundColor: allWin ? '#4CAF5018' : '#EF444418' }]}>
                    <ThemedText style={[styles.miniStreakText, { color: allWin ? '#4CAF50' : '#EF4444' }]}>
                      {streakBadge}
                    </ThemedText>
                  </View>
                )}
              </View>
              <View style={[styles.contextCard, { backgroundColor: colors.backgroundSecondary }]}>
                {recentGames.map((game, index) => {
                  const isWin = game.score?.startsWith('W');
                  const isLoss = game.score?.startsWith('L');
                  // Format score: "W 74-96" → "W 74–96"
                  const scoreDisplay = game.score?.replace('-', '–') ?? '';
                  return (
                    <View key={game.id}>
                    {index > 0 && <View style={[styles.contextDivider, { backgroundColor: colors.divider }]} />}
                    <View style={styles.recentRow}>
                      <Pressable
                        style={({ pressed }) => [{ flex: 1 }, pressed && { opacity: 0.7 }]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          openRecentSheet({ opponent: game.opponent, kr: game.opponentKR ?? 0, record: game.opponentRecord ?? '', gameId: game.id, gameStatus: game.status, score: game.score ?? '' });
                        }}
                      >
                        <ThemedText style={[styles.recentOpponent, { color: colors.text }]}>
                          {game.location === 'Home' ? 'vs' : '@'} {game.opponent}{game.opponentKR ? ` (${game.opponentKR})` : ''}
                        </ThemedText>
                        {game.opponentRecord && (
                          <ThemedText style={[styles.recentMeta, { color: colors.textTertiary }]}>
                            {game.opponentRecord}
                          </ThemedText>
                        )}
                        <ThemedText style={[styles.recentMeta, { color: colors.textTertiary }]}>
                          {game.date} · {game.gameType ?? 'NON-CONF'} · {game.venue ?? game.location}
                        </ThemedText>
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [styles.recentRight, pressed && { opacity: 0.7 }]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          router.push(`/coach/game-detail?gameId=${game.id}` as any);
                        }}
                      >
                        <View style={[styles.recentPill, { backgroundColor: '#f5f5f518' }]}>
                          <ThemedText style={[styles.recentPillText, { color: '#f5f5f5' }]}>
                            FINAL
                          </ThemedText>
                        </View>
                        <ThemedText style={[styles.recentScore, { color: isWin ? '#f5f5f5' : isLoss ? '#EF4444' : colors.text }]}>
                          {scoreDisplay}
                        </ThemedText>
                      </Pressable>
                    </View>
                    </View>
                  );
                })}
              </View>
            </>
          );
        })()}

        {/* ===== 4) CONFERENCE PULSE ===== */}
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
          <RosterContent teamKR={liveTeamKR} onLogoPress={openTeamSheet} />
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

        {/* Page 6: Recruiting (National Pool) */}
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

      {/* Recent BPR Bottom Sheet */}
      {recentSheet && (() => {
        const opp = recentSheet.opponent;
        const recentImpact = recentSheet.gameStatus === 'final' && recentSheet.gameId ? FMU_GAME_IMPACT[recentSheet.gameId] : null;
        const recentPregame = recentSheet.gameStatus === 'upcoming' && recentSheet.gameId ? FMU_PREGAME[recentSheet.gameId] : null;
        return (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {/* Backdrop */}
            <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.25)', opacity: recentBackdropAnim }]}>
              <Pressable style={StyleSheet.absoluteFill} onPress={closeRecentSheet} />
            </Animated.View>

            {/* Sheet */}
            <Animated.View
              style={[
                shStyles.oppSheet,
                {
                  backgroundColor: colors.background,
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: RECENT_SHEET_HEIGHT,
                  transform: [{ translateY: recentSheetAnim }],
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: -4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 20,
                },
              ]}
            >
              {/* Handle pill — tap or swipe down to close */}
              <Pressable
                onPress={closeRecentSheet}
                onTouchStart={(e) => { recentTouchStartY.current = e.nativeEvent.pageY; }}
                onTouchEnd={(e) => {
                  const dy = e.nativeEvent.pageY - recentTouchStartY.current;
                  if (dy > 30) closeRecentSheet();
                }}
                style={{ alignItems: 'center', paddingVertical: 20, paddingHorizontal: 40 }}
                hitSlop={20}
              >
                <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
              </Pressable>

              {/* Sheet body */}
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                showsVerticalScrollIndicator={false}
                bounces
                scrollEventThrottle={16}
                onScroll={(e) => { recentSheetScrollOffset.current = e.nativeEvent.contentOffset.y; }}
                onScrollEndDrag={(e) => {
                  if (recentSheetScrollOffset.current <= 0 && e.nativeEvent.contentOffset.y < -40) {
                    closeRecentSheet();
                  }
                }}
              >
                {/* Header */}
                {(() => {
                  const recentGame = recentSheet.gameId ? FMU_GAMES.find((g) => g.id === recentSheet.gameId) : null;
                  return (
                    <View style={{ alignItems: 'center', marginBottom: Spacing.md }}>
                      <ThemedText style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>
                        {recentGame ? `${recentGame.location === 'Home' ? 'vs' : '@'} ` : ''}{opp}{recentSheet.kr ? ` (${recentSheet.kr})` : ''}
                      </ThemedText>
                      <ThemedText style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>{recentSheet.record}</ThemedText>
                      {recentGame && (
                        <ThemedText style={{ fontSize: 12, color: colors.textTertiary, marginTop: 4 }}>
                          {recentGame.date}{recentGame.gameTime ? ` · ${recentGame.gameTime}` : ''} · {recentGame.gameType ?? 'NON-CONF'} · {recentGame.venue ?? recentGame.location}
                        </ThemedText>
                      )}
                      {recentSheet.score ? (() => {
                        const isWin = recentSheet.score!.startsWith('W');
                        const isLoss = recentSheet.score!.startsWith('L');
                        const resultColor = isWin ? '#4ADE80' : isLoss ? '#EF4444' : colors.text;
                        // Score format: "W fmu-opp" or "L fmu-opp" — first number always FMU
                        const pregameData = recentSheet.gameId ? FMU_PREGAME[recentSheet.gameId] : null;
                        const scoreMatch = recentSheet.score!.match(/(\d+)-(\d+)/);
                        let atsText = '';
                        if (pregameData && scoreMatch) {
                          const spread = Math.round(pregameData.krGap * 0.4);
                          const fmuScore = parseInt(scoreMatch[1]);
                          const oppScore = parseInt(scoreMatch[2]);
                          const actualMargin = fmuScore - oppScore;
                          const ats = actualMargin - spread;
                          atsText = ats >= 0 ? `+${ats}` : `${ats}`;
                        }
                        return (
                          <>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                              <View style={{ paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12, backgroundColor: isWin ? '#4ADE8020' : isLoss ? '#EF444420' : colors.backgroundSecondary }}>
                                <ThemedText style={{ fontSize: 13, fontWeight: '800', letterSpacing: 0.5, color: resultColor }}>
                                  {isWin ? 'WIN' : isLoss ? 'LOSS' : 'FINAL'}
                                </ThemedText>
                              </View>
                            </View>
                            <ThemedText style={{ fontSize: 15, fontWeight: '700', color: resultColor, marginTop: 4 }}>
                              {recentSheet.score!.replace('-', '–')}{atsText ? ` (${atsText})` : ''}
                            </ThemedText>
                          </>
                        );
                      })() : null}
                    </View>
                  );
                })()}

                {/* TGIS + PGIS for completed games, Pregame Snapshot for upcoming */}
                {recentImpact ? (
                    <>
                      {/* TGIS Block */}
                      <View style={{ backgroundColor: colors.backgroundSecondary, borderRadius: BorderRadius.lg, padding: Spacing.md, marginHorizontal: Spacing.md, marginBottom: Spacing.md }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <ThemedText style={{ fontSize: 13, fontWeight: '800', letterSpacing: 0.5, color: colors.text }}>GAME SCORE</ThemedText>
                          <View style={{ backgroundColor: getTGISColor(recentImpact.tgis) + '20', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <ThemedText style={{ fontSize: 12, fontWeight: '700', color: getTGISColor(recentImpact.tgis) }}>
                              {recentImpact.tgisLabel}
                            </ThemedText>
                            <ThemedText style={{ fontSize: 11, fontWeight: '600', color: getTGISColor(recentImpact.tgis), opacity: 0.7 }}>
                              {tgisToDisplay(recentImpact.tgis).toFixed(1)}
                            </ThemedText>
                          </View>
                        </View>
                        {recentImpact.drivers.map((d, i) => (
                          <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: i === 0 ? 0 : 6 }}>
                            <ThemedText style={{ fontSize: 13, color: colors.textTertiary, marginRight: 8 }}>{'\u2022'}</ThemedText>
                            <ThemedText style={{ fontSize: 13, color: colors.textSecondary, flex: 1 }}>{d}</ThemedText>
                          </View>
                        ))}
                      </View>

                      {/* Player Impact Score — top 3 */}
                      {(() => {
                        const top3 = [...recentImpact.starters, ...recentImpact.bench].sort((a, b) => b.pgis - a.pgis).slice(0, 3);
                        if (top3.length === 0) return null;
                        const activeP = top3[activeRecentPGIS] ?? top3[0];
                        return (
                          <>
                            {/* Centered pill */}
                            <View style={{ alignItems: 'center', marginBottom: 10 }}>
                              <View style={{ backgroundColor: colors.backgroundSecondary, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12 }}>
                                <ThemedText style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.5 }}>PLAYER IMPACT SCORE</ThemedText>
                              </View>
                            </View>
                            {/* 3 face avatars — tap to select */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: Spacing.md, marginBottom: 10 }}>
                              {top3.map((p, i) => {
                                const isActive = activeRecentPGIS === i;
                                return (
                                  <Pressable
                                    key={i}
                                    style={{ alignItems: 'center', flex: 1, opacity: isActive ? 1 : 0.45 }}
                                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveRecentPGIS(i); }}
                                  >
                                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center', marginBottom: 4, borderWidth: isActive ? 2 : 0, borderColor: getPGISColor(p.pgis) }}>
                                      <IconSymbol name="person.fill" size={24} color={isActive ? getPGISColor(p.pgis) : colors.textTertiary} />
                                    </View>
                                    <ThemedText style={{ fontSize: 11, fontWeight: '600', color: colors.text, textAlign: 'center' }}>{p.name.split(' ').pop()}</ThemedText>
                                  </Pressable>
                                );
                              })}
                            </View>
                            {/* Active player detail */}
                            <View style={[shStyles.card, { backgroundColor: colors.backgroundSecondary, marginBottom: Spacing.md }]}>
                              <View style={{ padding: Spacing.md }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                  <ThemedText style={{ flex: 1, fontSize: 15, fontWeight: '700', color: colors.text }}>
                                    {activeP.name} <ThemedText style={{ fontWeight: '400', color: colors.textTertiary }}>{'\u2014'} {activeP.archetype}</ThemedText>
                                  </ThemedText>
                                  <ThemedText style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary }}>{activeP.kr} KR</ThemedText>
                                </View>
                                {activeP.positives.map((s, si) => (
                                  <View key={`p${si}`} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
                                    <ThemedText style={{ fontSize: 12, color: '#4CAF50', marginRight: 6, fontWeight: '700' }}>+</ThemedText>
                                    <ThemedText style={{ fontSize: 13, color: colors.text, flex: 1 }}>{s}</ThemedText>
                                  </View>
                                ))}
                                {activeP.negatives.map((w, wi) => (
                                  <View key={`n${wi}`} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
                                    <ThemedText style={{ fontSize: 12, color: '#EF4444', marginRight: 6, fontWeight: '700' }}>{'\u2013'}</ThemedText>
                                    <ThemedText style={{ fontSize: 13, color: colors.text, flex: 1 }}>{w}</ThemedText>
                                  </View>
                                ))}
                              </View>
                            </View>

                            {/* Full PGIS button */}
                            <Pressable
                              style={({ pressed }) => [{ alignItems: 'center' as const, paddingVertical: 10, marginBottom: Spacing.md, backgroundColor: colors.backgroundSecondary, borderRadius: BorderRadius.lg }, pressed && { opacity: 0.7 }]}
                              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFullRecentPGISOpen(!fullRecentPGISOpen); }}
                            >
                              <ThemedText style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>Full PGIS</ThemedText>
                            </Pressable>

                            {fullRecentPGISOpen && (
                              <>
                                {/* Starters */}
                                <ThemedText style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.5, color: colors.textTertiary, marginBottom: 6, paddingHorizontal: Spacing.md }}>
                                  STARTERS
                                </ThemedText>
                                <View style={[shStyles.card, { backgroundColor: colors.backgroundSecondary, marginBottom: Spacing.md }]}>
                                  {recentImpact.starters.map((p, i) => (
                                    <View key={i}>
                                      {i > 0 && <View style={[shStyles.divider, { backgroundColor: colors.divider }]} />}
                                      <View style={{ flexDirection: 'row', alignItems: 'center', padding: Spacing.md }}>
                                        <View style={{ flex: 1 }}>
                                          <ThemedText style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                                            {p.name} <ThemedText style={{ fontSize: 12, color: colors.textTertiary, fontWeight: '400' }}>{p.archetype}</ThemedText>
                                          </ThemedText>
                                        </View>
                                        <View style={{ backgroundColor: getPGISColor(p.pgis) + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                                          <ThemedText style={{ fontSize: 12, fontWeight: '700', color: getPGISColor(p.pgis) }}>
                                            {p.pgis > 0 ? '+' : ''}{p.pgis}
                                          </ThemedText>
                                        </View>
                                      </View>
                                    </View>
                                  ))}
                                </View>

                                {/* Bench */}
                                {recentImpact.bench.length > 0 && (
                                  <>
                                    <ThemedText style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.5, color: colors.textTertiary, marginBottom: 6, paddingHorizontal: Spacing.md }}>
                                      BENCH
                                    </ThemedText>
                                    <View style={[shStyles.card, { backgroundColor: colors.backgroundSecondary, marginBottom: Spacing.md }]}>
                                      {recentImpact.bench.map((p, i) => (
                                        <View key={i}>
                                          {i > 0 && <View style={[shStyles.divider, { backgroundColor: colors.divider }]} />}
                                          <View style={{ flexDirection: 'row', alignItems: 'center', padding: Spacing.md }}>
                                            <View style={{ flex: 1 }}>
                                              <ThemedText style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                                                {p.name} <ThemedText style={{ fontSize: 12, color: colors.textTertiary, fontWeight: '400' }}>{p.archetype}</ThemedText>
                                              </ThemedText>
                                            </View>
                                            <View style={{ backgroundColor: getPGISColor(p.pgis) + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                                              <ThemedText style={{ fontSize: 12, fontWeight: '700', color: getPGISColor(p.pgis) }}>
                                                {p.pgis > 0 ? '+' : ''}{p.pgis}
                                              </ThemedText>
                                            </View>
                                          </View>
                                        </View>
                                      ))}
                                    </View>
                                  </>
                                )}
                              </>
                            )}
                          </>
                        );
                      })()}
                    </>
                ) : recentPregame ? (
                  <PregameSheetContent pregame={recentPregame} colors={colors} expanded={recentPregameExpanded} onToggle={toggleRecentPregameBlock} />
                ) : null}
              </ScrollView>
            </Animated.View>
          </View>
        );
      })()}

      {/* ===== TEAM PROFILE BOTTOM SHEET ===== */}
      {teamSheetOpen && (() => {
        // Top 3 players by KR, adjusted by system
        const offMod = liveOffKR - baseOffKRHome;
        const defMod = liveDefKR - baseDefKRHome;
        const avgMod = Math.round((offMod + defMod) / 2);
        const leadersWithKR = FMU_LEADERS
          .map((l) => ({ ...l, kr: Math.max(40, Math.min(95, (ROSTER_KR[l.number] ?? 60) + avgMod)) }))
          .sort((a, b) => b.kr - a.kr)
          .slice(0, 3);

        return (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.25)', opacity: teamBackdropAnim }]}>
              <Pressable style={StyleSheet.absoluteFill} onPress={closeTeamSheet} />
            </Animated.View>
            <Animated.View
              style={[
                shStyles.oppSheet,
                {
                  backgroundColor: colors.background,
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: TEAM_SHEET_HEIGHT,
                  transform: [{ translateY: teamSheetAnim }],
                },
              ]}
            >
              <Pressable
                onPress={closeTeamSheet}
                onTouchStart={(e) => { teamTouchStartY.current = e.nativeEvent.pageY; }}
                onTouchEnd={(e) => {
                  const dy = e.nativeEvent.pageY - teamTouchStartY.current;
                  if (dy > 30) closeTeamSheet();
                }}
                style={{ alignItems: 'center', paddingVertical: 20, paddingHorizontal: 40 }}
                hitSlop={20}
              >
                <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
              </Pressable>

              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 20 }}
                showsVerticalScrollIndicator={false}
                bounces
                scrollEventThrottle={16}
                onScroll={(e) => { teamSheetScrollOffset.current = e.nativeEvent.contentOffset.y; }}
                onScrollEndDrag={(e) => {
                  if (teamSheetScrollOffset.current <= 0 && e.nativeEvent.contentOffset.y < -40) {
                    closeTeamSheet();
                  }
                }}
              >
                {/* Team Name + KR */}
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <Image source={FMU_SEAL} style={{ width: 64, height: 64, marginBottom: 8 }} resizeMode="contain" />
                  <ThemedText style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>
                    Florida Memorial ({liveTeamKR})
                  </ThemedText>
                  <ThemedText style={{ fontSize: 13, color: colors.textTertiary, marginTop: 2 }}>
                    NAIA · Sun Conference · Regional Power
                  </ThemedText>
                </View>

                {/* KaNeXT Ratings — tappable with system dropdowns */}
                <ThemedText style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: colors.textTertiary, marginBottom: 8 }}>KaNeXT RATINGS</ThemedText>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
                  <Pressable
                    style={{ flex: 1, paddingTop: 10, paddingBottom: 12, alignItems: 'center', backgroundColor: offDropdownOpen ? '#3a3a5e' : '#2a2a3e', borderRadius: 10 }}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setOffDropdownOpen(!offDropdownOpen); setDefDropdownOpen(false); setTempoDropdownOpen(false); }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '600', color: '#aaa', marginBottom: 4 }}>OFFENSE</Text>
                    <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFFFFF', lineHeight: 32 }}>{liveOffKR}</Text>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: '#7B8794', marginTop: 4 }}>{selectedOffSystem}</Text>
                  </Pressable>
                  <Pressable
                    style={{ flex: 1, paddingTop: 10, paddingBottom: 12, alignItems: 'center', backgroundColor: defDropdownOpen ? '#3a3a5e' : '#2a2a3e', borderRadius: 10 }}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDefDropdownOpen(!defDropdownOpen); setOffDropdownOpen(false); setTempoDropdownOpen(false); }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '600', color: '#aaa', marginBottom: 4 }}>DEFENSE</Text>
                    <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFFFFF', lineHeight: 32 }}>{liveDefKR}</Text>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: '#7B8794', marginTop: 4 }}>{selectedDefSystem}</Text>
                  </Pressable>
                </View>

                {/* Offense system dropdown */}
                {offDropdownOpen && (
                  <View style={{ backgroundColor: '#2a2a3e', borderRadius: 12, marginBottom: 4, overflow: 'hidden' }}>
                    {DNA_OFFENSE_POOL.map((sys) => (
                      <Pressable
                        key={sys}
                        style={({ pressed }) => [{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, backgroundColor: selectedOffSystem === sys ? '#3a3a5e' : 'transparent' }, pressed && { opacity: 0.7 }]}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedOffSystem(sys); setOffDropdownOpen(false); }}
                      >
                        <Text style={{ fontSize: 14, fontWeight: selectedOffSystem === sys ? '700' : '500', color: selectedOffSystem === sys ? '#FFFFFF' : '#999' }}>{sys}</Text>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>{systemKRModifier(sys, baseOffKRHome)}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                {/* Defense system dropdown */}
                {defDropdownOpen && (
                  <View style={{ backgroundColor: '#2a2a3e', borderRadius: 12, marginBottom: 4, overflow: 'hidden' }}>
                    {DNA_DEFENSE_POOL.map((sys) => (
                      <Pressable
                        key={sys}
                        style={({ pressed }) => [{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, backgroundColor: selectedDefSystem === sys ? '#3a3a5e' : 'transparent' }, pressed && { opacity: 0.7 }]}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedDefSystem(sys); setDefDropdownOpen(false); }}
                      >
                        <Text style={{ fontSize: 14, fontWeight: selectedDefSystem === sys ? '700' : '500', color: selectedDefSystem === sys ? '#FFFFFF' : '#999' }}>{sys}</Text>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>{systemKRModifier(sys, baseDefKRHome)}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                {/* Tempo card */}
                <Pressable
                  style={{ alignItems: 'center', paddingVertical: 8, backgroundColor: tempoDropdownOpen ? '#3a3a5e' : '#2a2a3e', borderRadius: 10, marginBottom: 4 }}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTempoDropdownOpen(!tempoDropdownOpen); setOffDropdownOpen(false); setDefDropdownOpen(false); }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#aaa', marginBottom: 2 }}>TEMPO</Text>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF' }}>{selectedTempo}</Text>
                </Pressable>

                {/* Tempo dropdown */}
                {tempoDropdownOpen && (
                  <View style={{ backgroundColor: '#2a2a3e', borderRadius: 12, marginBottom: 4, overflow: 'hidden' }}>
                    {DNA_TEMPO_POOL.map((tempo) => (
                      <Pressable
                        key={tempo}
                        style={({ pressed }) => [{ paddingVertical: 10, paddingHorizontal: 14, backgroundColor: selectedTempo === tempo ? '#3a3a5e' : 'transparent' }, pressed && { opacity: 0.7 }]}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedTempo(tempo); setTempoDropdownOpen(false); }}
                      >
                        <Text style={{ fontSize: 14, fontWeight: selectedTempo === tempo ? '700' : '500', color: selectedTempo === tempo ? '#FFFFFF' : '#999' }}>{tempo}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                <View style={{ height: 12 }} />

                {/* System Drivers */}
                <View style={{ alignItems: 'center', marginBottom: 10 }}>
                  <View style={{ backgroundColor: colors.backgroundSecondary, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12 }}>
                    <ThemedText style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: colors.textTertiary }}>SYSTEM DRIVERS</ThemedText>
                  </View>
                </View>

                {/* Tappable avatars */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 12 }}>
                  {leadersWithKR.map((player, i) => {
                    const isActive = activeDriver === i;
                    return (
                      <Pressable key={player.firebaseId} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveDriver(i); }} style={{ alignItems: 'center' }}>
                        <View style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: isActive ? '#fff' : colors.border, backgroundColor: colors.backgroundSecondary, justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
                          <IconSymbol name="person.fill" size={22} color={isActive ? '#fff' : colors.textTertiary} />
                        </View>
                        <ThemedText style={{ fontSize: 12, fontWeight: isActive ? '700' : '500', color: isActive ? '#fff' : colors.textTertiary }}>{player.name.split(' ')[0]} {player.name.split(' ').slice(1).join(' ')}</ThemedText>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Active driver detail card */}
                {(() => {
                  const p = leadersWithKR[activeDriver];
                  if (!p) return null;
                  const arch = jerseyArchetypeMap.get(p.number) ?? 'Role Player';
                  const posPool = POSITIVE_IMPACT[arch] ?? POSITIVE_IMPACT['Role Player'];
                  const negPool = NEGATIVE_IMPACT[arch] ?? NEGATIVE_IMPACT['Role Player'];
                  // Top players get more positives
                  const positives = [posPool[0], posPool[1]];
                  const negatives = [negPool[0], negPool[1]];
                  return (
                    <View style={[shStyles.card, { backgroundColor: colors.backgroundSecondary, padding: 14 }]}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <ThemedText style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>
                          {p.name} <ThemedText style={{ fontWeight: '400', color: colors.textTertiary }}>— {arch}</ThemedText>
                        </ThemedText>
                        <ThemedText style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{p.kr} KR</ThemedText>
                      </View>
                      {positives.map((reason, ri) => (
                        <View key={`pos-${ri}`} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: '#4ADE80', marginRight: 8, width: 14 }}>+</Text>
                          <ThemedText style={{ fontSize: 13, color: colors.text, flex: 1 }}>{reason}</ThemedText>
                        </View>
                      ))}
                      {negatives.map((reason, ri) => (
                        <View key={`neg-${ri}`} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: ri < negatives.length - 1 ? 6 : 0 }}>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: '#EF4444', marginRight: 8, width: 14 }}>–</Text>
                          <ThemedText style={{ fontSize: 13, color: colors.text, flex: 1 }}>{reason}</ThemedText>
                        </View>
                      ))}
                    </View>
                  );
                })()}

              </ScrollView>
            </Animated.View>
          </View>
        );
      })()}
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
    alignItems: 'flex-start',
    paddingTop: Spacing.xl,
    paddingBottom: 0,
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
    top: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    minWidth: 120,
    zIndex: 20,
    elevation: 20,
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

  // Next Game Card (Home)
  nextGameCardHome: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  nextLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  nextOpponent: {
    fontSize: 16,
    fontWeight: '700',
  },
  nextMeta: {
    fontSize: 13,
    marginTop: 2,
  },

  // Recent (Last 3) Section
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  miniStreakBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: Spacing.md,
  },
  miniStreakText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
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
  upcomingDateTime: {
    fontSize: 14,
    fontWeight: '800',
  },

  // BPR inline panel (recent games)
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

  // Schedule Row (upcoming games — matches games.tsx)
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
