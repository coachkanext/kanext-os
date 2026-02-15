/**
 * Home Screen
 * Mode-aware dashboard showing contextual information.
 * Per spec: Home displays key stats and quick actions for the current mode.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput, InteractionManager, Image, Text } from 'react-native';
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
import { UnitsView } from '@/components/depth-chart/depth-chart-units';
import { KRDetailsSheet } from '@/components/kr-details-sheet';
import { PlayerPoolContent } from '@/app/coach/recruiting';
import { StatsContent } from '@/app/coach/stats';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import type { Archetype } from '@/data/system-demand-profiles';
import { Colors, Spacing, BorderRadius, ModeColors, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext, useMode } from '@/context/app-context';
import type { Mode, OffensiveStyle, DefensiveStyle } from '@/types';

// Mock data imports (other modes)
import { COMPANY_METRICS, formatCurrency } from '@/data/mock-enterprise';
import { CAMPUSES, MESSAGES } from '@/data/mock-church';
import { getCurrentTerm, getUpcomingEvents, INSTITUTIONAL_METRICS } from '@/data/mock-education';

// FMU data
import { FMU_GAMES, FMU_GAMES_BY_ID, FMU_LEADERS, FMU_STANDINGS, FMU_NEWS, FMU_RECORD, FMU_LAST_GAME, FMU_LAST_GAME_ID, FMU_NEXT_GAME, FMU_NEXT_GAME_ID, FMU_SEASON_COMPLETE, FMU_GAME_BPR, getBPRColor, FMU_GAME_IMPACT, getPGISColor, getTGISColor, tgisToDisplay, FMU_PREGAME, ROSTER_KR, DNA_OFFENSE_POOL, DNA_DEFENSE_POOL, DNA_TEMPO_POOL, jerseyArchetypeMap, POSITIVE_IMPACT, NEGATIVE_IMPACT, type PregameSnapshot, type ClusterRating } from '@/data/fmu';
import { TeamQuickSheet } from '@/components/team-quick-sheet';
import { LiveGamePanel } from '@/components/live-game-panel';
import { consumeHomeReset, registerHomeResetCallback } from '@/utils/global-home';
import { registerTeamSheetHandlers } from '@/utils/global-team-sheet';
import { GOVERNING_BODIES } from '@/data/governing-bodies';

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
  { id: 'schedule', label: 'Schedule' },
  { id: 'roster', label: 'Roster' },
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

// Conference Pulse — derived data
const confHash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); };

const FMU_CONF_POSITION = FMU_STANDINGS.findIndex(r => r.team === 'Florida Memorial') + 1;

const CONF_TOP3_TRADITIONAL = FMU_STANDINGS.slice(0, 3).map(r => {
  const h = confHash(r.team);
  const kr = r.team === 'Florida Memorial' ? 74 : 58 + (h % 28);
  return { team: r.team, kr };
});

const NEXT_CONF_GAMES = FMU_SEASON_COMPLETE
  ? []
  : FMU_GAMES.filter(g => (g.status === 'upcoming' || g.status === 'live') && g.gameType === 'CONF').slice(0, 3);

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
// Map display archetype labels → typed Archetype keys for the universal PlayerSheet
const OPP_ARCHETYPE_MAP: Record<string, Archetype> = {
  'Shot Creator': 'pick_and_roll_operator',
  'Floor General': 'primary_ball_handler',
  'Scoring Wing': 'secondary_creator_wing',
  'Stretch Big': 'stretch_big',
  'Rim Runner': 'vertical_spacer',
  'Two-Way Wing': 'two_way_wing',
  '3&D Guard': 'three_and_d_wing',
  'Post Anchor': 'rim_protector_anchor',
  'Slasher': 'slasher_rim_pressure_wing',
  'Playmaking Guard': 'connector_guard_wing',
};

// Map DNA display labels → typed system values
const DNA_OFF_MAP: Record<string, OffensiveStyle> = {
  'Spread Pick & Roll': 'spread_pick_and_roll',
  'Five-Out Motion': 'five_out_motion',
  'Motion Read & React': 'motion_read_react',
  'Pace & Space': 'pace_and_space',
  'Dribble Drive': 'dribble_drive',
  'Princeton': 'princeton',
  'Flex': 'flex',
  'Swing': 'swing',
  'Post-Centric': 'post_centric',
  'Moreyball': 'moreyball',
  'Heliocentric': 'heliocentric',
};

const DNA_DEF_MAP: Record<string, DefensiveStyle> = {
  'Containment Man': 'containment_man',
  'Pack Line': 'pack_line',
  'Pressure Man': 'pressure_man',
  'Switch Everything': 'switch_everything',
  'Ice / No Middle': 'ice_no_middle',
  'Zone (Structured)': 'zone_structured',
  'Matchup Zone': 'matchup_zone',
  'Press': 'press',
  'Junk / Special': 'junk_special',
};

// ── Build opponent depth chart from pregame data ──

const OPP_POSITIONS = ['Point Guard', 'Combo Guard', 'Wing', 'Forward', 'Big'] as const;
const OPP_EXTRA_NAMES = ['J. Williams', 'D. Harris', 'M. Johnson', 'T. Davis', 'K. Robinson', 'C. Taylor', 'R. Clark', 'A. Moore'];
const OPP_CLUSTER_MAP: Record<string, keyof import('@/data/roster-data').ClusterRatings> = {
  'Shooting': 'shooting',
  'Finishing': 'finishing',
  'Playmaking': 'playmaking',
  'OB Defense': 'perimeter_defense',
  'Team Defense': 'interior_defense',
  'Rebounding': 'rebounding',
  'Physical': 'frame',
};

function buildOpponentDepthChart(pregame: PregameSnapshot) {
  type CR = import('@/data/roster-data').ClusterRatings;

  // Team-level cluster ratings → base cluster object
  const teamClusters: CR = {
    shooting: 60, finishing: 60, playmaking: 60,
    perimeter_defense: 60, interior_defense: 60, rebounding: 60, frame: 60,
  };
  for (const cr of pregame.clusterRatings) {
    const key = OPP_CLUSTER_MAP[cr.cluster];
    if (key) teamClusters[key] = cr.rating;
  }

  // Build 5 starters (3 from threats + 2 generated) + bench
  const threats = pregame.oppThreats.slice(0, 3);
  const playerClusters: Record<string, CR> = {};
  const playerPhysicals: Record<string, { height: string; weight: number }> = {};
  const depthChart: { position: string; players: any[] }[] = [];

  // Position-based height/weight baselines
  const POS_HT_BASE = [74, 75, 78, 80, 82]; // inches: PG, CG, W, F, B
  const POS_WT_BASE = [180, 190, 205, 220, 240];

  for (let posIdx = 0; posIdx < 5; posIdx++) {
    const pos = OPP_POSITIONS[posIdx];
    const threat = threats[posIdx]; // undefined for idx 3,4
    const starterNum = `${posIdx + 1}`;
    const benchNum = `${posIdx + 6}`;

    // Starter
    const starterName = threat?.name ?? OPP_EXTRA_NAMES[posIdx % OPP_EXTRA_NAMES.length];
    const starterKR = threat?.kr ?? pregame.oppKR - (posIdx * 2);
    const starterArch = threat ? (OPP_ARCHETYPE_MAP[threat.archetype] ?? 'two_way_wing') : 'two_way_wing';

    // Vary clusters per player around team baseline
    const variation = (posIdx * 7 + 3) % 11 - 5;
    const starterCl: CR = {
      shooting: Math.max(20, Math.min(98, teamClusters.shooting + variation)),
      finishing: Math.max(20, Math.min(98, teamClusters.finishing - variation + 2)),
      playmaking: Math.max(20, Math.min(98, teamClusters.playmaking + (posIdx < 2 ? 8 : -4))),
      perimeter_defense: Math.max(20, Math.min(98, teamClusters.perimeter_defense + variation - 1)),
      interior_defense: Math.max(20, Math.min(98, teamClusters.interior_defense + (posIdx >= 3 ? 6 : -3))),
      rebounding: Math.max(20, Math.min(98, teamClusters.rebounding + (posIdx >= 3 ? 5 : -2))),
      frame: Math.max(20, Math.min(98, teamClusters.frame + (posIdx >= 3 ? 7 : -3))),
    };
    playerClusters[starterNum] = starterCl;

    // Bench player — slightly lower
    const benchName = OPP_EXTRA_NAMES[(posIdx + 3) % OPP_EXTRA_NAMES.length];
    const benchCl: CR = {
      shooting: Math.max(20, starterCl.shooting - 8),
      finishing: Math.max(20, starterCl.finishing - 6),
      playmaking: Math.max(20, starterCl.playmaking - 7),
      perimeter_defense: Math.max(20, starterCl.perimeter_defense - 5),
      interior_defense: Math.max(20, starterCl.interior_defense - 6),
      rebounding: Math.max(20, starterCl.rebounding - 5),
      frame: Math.max(20, starterCl.frame - 4),
    };
    playerClusters[benchNum] = benchCl;

    // Generate height/weight per position
    const htInches = POS_HT_BASE[posIdx] + ((posIdx * 3 + 1) % 5) - 2;
    const htFeet = Math.floor(htInches / 12);
    const htRem = htInches % 12;
    playerPhysicals[starterNum] = { height: `${htFeet}-${htRem}`, weight: POS_WT_BASE[posIdx] + ((posIdx * 7) % 15) - 5 };
    playerPhysicals[benchNum] = { height: `${htFeet}-${Math.max(0, htRem - 1)}`, weight: POS_WT_BASE[posIdx] - 10 + ((posIdx * 5) % 10) };

    depthChart.push({
      position: pos,
      players: [
        { name: starterName, number: starterNum, kr: starterKR, minutes: 28 - posIdx, archetypes: [starterArch], roleDefinition: '', coachNote: '' },
        { name: benchName, number: benchNum, kr: Math.max(40, starterKR - 10), minutes: 12 + posIdx, archetypes: ['two_way_wing'], roleDefinition: '', coachNote: '' },
      ],
    });
  }

  return { depthChart, playerClusters, playerPhysicals };
}

function parseDNASystems(dna: string[]): { off: OffensiveStyle; def: DefensiveStyle; tempo: string } {
  let off: OffensiveStyle = 'motion_read_react';
  let def: DefensiveStyle = 'containment_man';
  let tempo = 'Moderate';
  for (const line of dna) {
    if (line.startsWith('Offense: ')) {
      const label = line.replace('Offense: ', '');
      off = DNA_OFF_MAP[label] ?? off;
    } else if (line.startsWith('Defense: ')) {
      const label = line.replace('Defense: ', '');
      def = DNA_DEF_MAP[label] ?? def;
    } else if (line.startsWith('Tempo: ')) {
      tempo = line.replace('Tempo: ', '');
    }
  }
  return { off, def, tempo };
}


function ScheduleHub({ colors, router, openLiveTrigger, jumpToStandings }: { colors: typeof Colors.light; router: any; openLiveTrigger?: number; jumpToStandings?: number }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ScheduleTab>('feed');
  const [standingsMode, setStandingsMode] = useState<'traditional' | 'kr'>('traditional');
  const [standingsScope, setStandingsScope] = useState<'college' | 'global'>('college');
  const [standingsView, setStandingsView] = useState<'conference' | 'division' | 'national'>('conference');
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);
  const [expandedKRTeam, setExpandedKRTeam] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedLeader, setExpandedLeader] = useState<string | null>(null);
  const [oppKRSheet, setOppKRSheet] = useState<{ opponent: string; kr: number; record: string; gameId?: string; gameStatus?: string; score?: string } | null>(null);
  const [activePGIS, setActivePGIS] = useState(0);
  const [fullPGISOpen, setFullPGISOpen] = useState(false);
  const [expandedLive, setExpandedLive] = useState(false);

  // When parent triggers live open, switch to feed tab and expand
  useEffect(() => {
    if (openLiveTrigger && openLiveTrigger > 0) {
      setActiveTab('feed');
      setExpandedLive(true);
    }
  }, [openLiveTrigger]);

  // When parent triggers jump-to-standings, switch to standings tab with conference view
  useEffect(() => {
    if (jumpToStandings && jumpToStandings > 0) {
      setActiveTab('standings');
      setStandingsScope('college');
      setStandingsView('conference');
    }
  }, [jumpToStandings]);

  const openSheet = useCallback((data: { opponent: string; kr: number; record: string; gameId?: string; gameStatus?: string; score?: string }) => {
    setOppKRSheet(data);
  }, []);

  const closeSheet = useCallback(() => {
    setOppKRSheet(null);
  }, []);

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
            {/* Pinned Live Game — Media Card with Screen */}
            {sortedGames.filter((g) => g.status === 'live').map((game) => (
              <View key={game.id} style={{ marginBottom: Spacing.md }}>
                <Pressable
                  style={({ pressed }) => [{ backgroundColor: '#000', borderRadius: BorderRadius.lg, overflow: 'hidden' as const }, pressed && { opacity: 0.85 }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setExpandedLive((prev) => !prev);
                  }}
                >
                  <View style={{ height: 180, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' }}>
                      <IconSymbol name="play.fill" size={24} color="#fff" />
                    </View>
                  </View>
                  <View style={{ padding: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', marginRight: 6 }} />
                      <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: '#EF4444' }}>LIVE</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1, flexShrink: 1, marginRight: 12 }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }} numberOfLines={1}>
                          {game.location === 'Home' ? 'vs' : '@'} {game.opponent}{game.opponentKR ? ` (${game.opponentKR})` : ''}
                        </Text>
                        {game.opponentRecord ? <Text style={{ fontSize: 13, color: '#999', marginTop: 2 }}>{game.opponentRecord}</Text> : null}
                      </View>
                      <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                        {game.score ? <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff' }}>{game.score}</Text> : null}
                        {game.clock ? <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{game.clock}</Text> : null}
                      </View>
                    </View>
                  </View>
                </Pressable>
                {expandedLive && <LiveGamePanel gameId={game.id} game={FMU_GAMES_BY_ID[game.id]} colors={colors} />}
              </View>
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
                            {(() => { const sw = 50 + (confHash(game.opponent ?? '') % 30); return (
                              <Text style={{ fontSize: 11, fontWeight: '600', color: sw >= 50 ? '#4CAF50' : '#EF4444', marginTop: 2 }}>Sim {sw}%</Text>
                            ); })()}
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
                              {(() => { const sw = 50 + (confHash(game.opponent ?? '') % 30); return (
                                <Text style={{ fontSize: 11, fontWeight: '600', color: sw >= 50 ? '#4CAF50' : '#EF4444', marginTop: 2 }}>Sim {sw}%</Text>
                              ); })()}
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
        {activeTab === 'standings' && (() => {
          // ── Mock data generators ──
          const hashStr = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); };

          const MOCK_TEAM_NAMES = [
            'Northfield', 'Crestview', 'Ridgemont', 'Lakewood', 'Harborside',
            'Westbridge', 'Irondale', 'Clearwater', 'Stonehill', 'Ashford',
            'Riverside', 'Summit Valley', 'Pinehurst', 'Oakdale', 'Brookfield',
          ];

          const generateDivisionStandings = (divisionId: string) => {
            return MOCK_TEAM_NAMES.map((team, i) => {
              const h = hashStr(divisionId + team);
              const overallW = 10 + (h % 16);
              const overallL = 4 + ((h >> 4) % 14);
              const confW = Math.min(overallW, 3 + ((h >> 2) % 10));
              const confL = Math.min(overallL, 1 + ((h >> 6) % 7));
              const streaks = ['W1','W2','W3','W4','L1','L2','L3'];
              const streak = streaks[(h >> 8) % streaks.length];
              const kr = 55 + ((h >> 3) % 35);
              const trend = (h % 5 === 0) ? (1 + ((h >> 4) % 4)) : (h % 3 === 0) ? -(1 + ((h >> 4) % 3)) : 0;
              return { rank: 0, team, confW, confL, overallW, overallL, streak, kr, trend };
            }).sort((a, b) => b.overallW - a.overallW || a.overallL - b.overallL)
              .map((r, i) => ({ ...r, rank: i + 1 }));
          };

          // ── NAIA Top 25 poll data ──
          const NAIA_POLL = [
            { rank: 1, team: 'Loyola (LA)', record: '22-2', prev: 1 },
            { rank: 2, team: 'Indiana Wesleyan', record: '21-3', prev: 2 },
            { rank: 3, team: 'Oklahoma City', record: '20-3', prev: 4 },
            { rank: 4, team: 'Life Pacific', record: '20-4', prev: 3 },
            { rank: 5, team: 'Benedictine (KS)', record: '19-4', prev: 8 },
            { rank: 6, team: 'Freed-Hardeman', record: '19-4', prev: 6 },
            { rank: 7, team: 'Georgetown (KY)', record: '18-5', prev: 5 },
            { rank: 8, team: 'William Penn', record: '18-5', prev: 9 },
            { rank: 9, team: 'Southeastern', record: '18-5', prev: 7 },
            { rank: 10, team: 'Carroll (MT)', record: '19-4', prev: 10 },
            { rank: 11, team: 'Olivet Nazarene', record: '18-5', prev: 12 },
            { rank: 12, team: 'Concordia (NE)', record: '18-5', prev: 11 },
            { rank: 13, team: 'Bethel (IN)', record: '17-6', prev: 14 },
            { rank: 14, team: 'Jamestown', record: '17-5', prev: 16 },
            { rank: 15, team: 'MidAmerica Nazarene', record: '17-6', prev: 13 },
            { rank: 16, team: 'Science & Arts (OK)', record: '17-6', prev: 15 },
            { rank: 17, team: 'Campbellsville', record: '16-6', prev: 18 },
            { rank: 18, team: 'Marian (IN)', record: '16-7', prev: 17 },
            { rank: 19, team: 'Wayland Baptist', record: '16-6', prev: 20 },
            { rank: 20, team: 'IU South Bend', record: '16-7', prev: 22 },
            { rank: 21, team: 'Thomas More', record: '16-7', prev: 19 },
            { rank: 22, team: 'Vanguard', record: '15-7', prev: 21 },
            { rank: 23, team: 'Cornerstone', record: '15-7', prev: 24 },
            { rank: 24, team: 'Grace (IN)', record: '15-7', prev: 23 },
            { rank: 25, team: 'Lindsey Wilson', record: '15-8', prev: 25 },
          ];

          // ── KR data ──
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
            { rank: 11, team: 'Carroll (MT)', kr: 82, trend: -1 },
            { rank: 12, team: 'Olivet Nazarene', kr: 81, trend: 2 },
            { rank: 13, team: 'Concordia (NE)', kr: 81, trend: 0 },
            { rank: 14, team: 'Bethel (IN)', kr: 80, trend: 3 },
            { rank: 15, team: 'Jamestown', kr: 80, trend: 1 },
            { rank: 16, team: 'MidAmerica Nazarene', kr: 79, trend: -2 },
            { rank: 17, team: 'Science & Arts (OK)', kr: 79, trend: 0 },
            { rank: 18, team: 'Campbellsville', kr: 78, trend: 1 },
            { rank: 19, team: 'Marian (IN)', kr: 78, trend: -1 },
            { rank: 20, team: 'Wayland Baptist', kr: 77, trend: 2 },
            { rank: 21, team: 'IU South Bend', kr: 77, trend: 0 },
            { rank: 22, team: 'Thomas More', kr: 76, trend: -3 },
            { rank: 23, team: 'Vanguard', kr: 76, trend: 1 },
            { rank: 24, team: 'Cornerstone', kr: 75, trend: 0 },
            { rank: 25, team: 'Grace (IN)', kr: 75, trend: -1 },
            { rank: 38, team: 'Florida Memorial', kr: 74, trend: 3 },
          ];

          const KR_CONF = FMU_STANDINGS.map((row) => {
            const h = hashStr(row.team);
            const kr = row.team === 'Florida Memorial' ? 74 : 58 + (h % 28);
            const trend = row.team === 'Florida Memorial' ? 3 : h % 5 === 0 ? (1 + ((h >> 4) % 4)) : h % 3 === 0 ? -(1 + ((h >> 4) % 3)) : 0;
            return { rank: 0, team: row.team, kr, trend };
          }).sort((a, b) => b.kr - a.kr).map((r, i) => ({ ...r, rank: i + 1 }));

          const trendDisplay = (t: number) => {
            if (t > 0) return { text: `▲ ${t}`, color: '#66BB6A' };
            if (t < 0) return { text: `▼ ${Math.abs(t)}`, color: '#EF4444' };
            return { text: '—', color: colors.textTertiary };
          };

          // ── Division chips from GOVERNING_BODIES ──
          const divisionChips: { id: string; label: string }[] = [];
          for (const body of GOVERNING_BODIES) {
            if (body.divisions) {
              for (const div of body.divisions) {
                divisionChips.push({ id: div.id, label: `${body.label} ${div.label}` });
              }
            } else {
              divisionChips.push({ id: body.id, label: body.label });
            }
          }

          // ── Section label ──
          const sectionLabel = standingsView === 'conference'
            ? 'SUN CONFERENCE'
            : standingsView === 'national'
              ? 'NAIA'
              : selectedDivisions.length > 0
                ? selectedDivisions.map(id => (divisionChips.find((c) => c.id === id)?.label ?? '').toUpperCase()).join('  /  ')
                : '';

          // ── Build table data based on current view ──
          const divStandings = standingsView === 'division' && selectedDivisions.length > 0
            ? selectedDivisions.flatMap(id => generateDivisionStandings(id).map(r => ({ ...r, divId: id })))
            : [];

          // ── KR Row with expand/collapse ──
          const renderKRTable = (krData: { rank: number; team: string; kr: number; trend: number }[], showFmuGap: boolean) => (
            <View style={[shStyles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={[shStyles.krHeaderRow, { borderBottomColor: colors.divider, backgroundColor: colors.backgroundSecondary }]}>
                <ThemedText style={[shStyles.krHeaderRank, { color: colors.textTertiary }]}>#</ThemedText>
                <ThemedText style={[shStyles.standingsTeamHeader, { color: colors.textTertiary }]}>TEAM</ThemedText>
                <ThemedText style={[shStyles.standingsColHeader, { color: colors.textTertiary }]}>KR</ThemedText>
                <ThemedText style={[shStyles.standingsColHeader, { color: colors.textTertiary }]}>TREND</ThemedText>
              </View>
              {krData.map((row, index) => {
                const isFmu = row.team === 'Florida Memorial';
                const showGap = showFmuGap && index === krData.length - 1 && row.rank > 10;
                const td = trendDisplay(row.trend);
                const isExpanded = expandedKRTeam === row.team;
                // Off/Def KR derivation
                const h = hashStr(row.team);
                const offKR = Math.min(100, Math.max(0, Math.round(row.kr * 0.53 + h % 5)));
                const defKR = Math.min(100, Math.max(0, Math.round(row.kr * 0.47 + h % 4)));
                return (
                  <View key={row.team}>
                    {isFmu && <View style={[shStyles.krFmuDivider, { backgroundColor: colors.text + '20' }]} />}
                    {!isFmu && index > 0 && !showGap && <View style={[shStyles.divider, { backgroundColor: colors.divider }]} />}
                    {showGap && (
                      <View style={[shStyles.krGapRow, { borderColor: colors.divider }]}>
                        <ThemedText style={[shStyles.krGapText, { color: colors.textTertiary }]}>···</ThemedText>
                      </View>
                    )}
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setExpandedKRTeam(isExpanded ? null : row.team);
                      }}
                      style={[shStyles.krRow, isFmu && { backgroundColor: colors.text + '0A' }]}
                    >
                      <ThemedText style={[shStyles.krRankNum, { color: isFmu ? colors.text : colors.textTertiary }]}>{row.rank}</ThemedText>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={[shStyles.krTeamName, { color: colors.text, fontWeight: isFmu ? '700' : '500' }]}>{row.team}</ThemedText>
                      </View>
                      <ThemedText style={[shStyles.krScore, { color: isFmu ? colors.text : colors.textSecondary }]}>{row.kr}</ThemedText>
                      <ThemedText style={[shStyles.krTrend, { color: td.color }]}>{td.text}</ThemedText>
                    </Pressable>
                    {isExpanded && (
                      <View style={{ flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: 6, paddingLeft: Spacing.md + 38, gap: 20, backgroundColor: colors.backgroundSecondary }}>
                        <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>Off KR: <ThemedText style={{ fontWeight: '700', color: colors.text }}>{offKR}</ThemedText></ThemedText>
                        <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>Def KR: <ThemedText style={{ fontWeight: '700', color: colors.text }}>{defKR}</ThemedText></ThemedText>
                      </View>
                    )}
                    {isFmu && index < krData.length - 1 && <View style={[shStyles.krFmuDivider, { backgroundColor: colors.text + '20' }]} />}
                  </View>
                );
              })}
            </View>
          );

          // ── Traditional table renderer ──
          const renderTraditionalConfTable = (rows: { team: string; confW: number; confL: number; overallW: number; overallL: number; streak: string }[]) => (
            <View style={[shStyles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={[shStyles.standingsHeaderRow, { borderBottomColor: colors.divider }]}>
                <ThemedText style={[shStyles.standingsTeamHeader, { color: colors.textTertiary }]}>TEAM</ThemedText>
                <ThemedText style={[shStyles.standingsColHeader, { color: colors.textTertiary }]}>CONF</ThemedText>
                <ThemedText style={[shStyles.standingsColHeader, { color: colors.textTertiary }]}>OVR</ThemedText>
                <ThemedText style={[shStyles.standingsColHeader, { color: colors.textTertiary }]}>STK</ThemedText>
              </View>
              {rows.map((row, index) => {
                const isFmu = row.team === 'Florida Memorial';
                return (
                  <View key={`${index}-${row.team}`}>
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
          );

          const renderPollTable = (rows: { rank: number; team: string; record: string; prev: number }[]) => (
            <View style={[shStyles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={[shStyles.standingsHeaderRow, { borderBottomColor: colors.divider }]}>
                <ThemedText style={[shStyles.krHeaderRank, { color: colors.textTertiary }]}>#</ThemedText>
                <ThemedText style={[shStyles.standingsTeamHeader, { color: colors.textTertiary }]}>TEAM</ThemedText>
                <ThemedText style={[shStyles.standingsColHeader, { color: colors.textTertiary }]}>REC</ThemedText>
                <ThemedText style={[shStyles.standingsColHeader, { color: colors.textTertiary }]}>PV</ThemedText>
              </View>
              {rows.map((row, index) => (
                <View key={row.team}>
                  {index > 0 && <View style={[shStyles.divider, { backgroundColor: colors.divider }]} />}
                  <View style={shStyles.standingsRow}>
                    <View style={shStyles.standingsTeamCol}>
                      <ThemedText style={[shStyles.standingsRank, { color: colors.textTertiary }]}>{row.rank}</ThemedText>
                      <ThemedText style={[shStyles.standingsTeamName, { color: colors.text }]}>{row.team}</ThemedText>
                    </View>
                    <ThemedText style={[shStyles.standingsRecord, { color: colors.text }]}>{row.record}</ThemedText>
                    <ThemedText style={[shStyles.standingsRecord, { color: colors.textTertiary }]}>{row.prev}</ThemedText>
                  </View>
                </View>
              ))}
            </View>
          );

          return (
            <View>
              {/* ── 3a. Mode Toggle ── */}
              <View style={shStyles.standingsToggleRow}>
                {(['traditional', 'kr'] as const).map((m) => {
                  const active = standingsMode === m;
                  return (
                    <Pressable
                      key={m}
                      style={[shStyles.standingsTogglePill, { backgroundColor: active ? colors.text + 'E0' : colors.backgroundSecondary }]}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStandingsMode(m); setExpandedKRTeam(null); }}
                    >
                      <ThemedText style={[shStyles.standingsToggleText, { color: active ? colors.background : colors.textSecondary }]}>
                        {m === 'traditional' ? 'Traditional' : 'KaNeXT (KR)'}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>

              {/* ── 3b. Scope Chips ── */}
              <View style={shStyles.krScopeRow}>
                {(['college', 'global'] as const).map((s) => {
                  const active = standingsScope === s;
                  return (
                    <Pressable
                      key={s}
                      style={[shStyles.krScopePill, { backgroundColor: active ? colors.text : colors.backgroundSecondary }]}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStandingsScope(s); }}
                    >
                      <ThemedText style={[shStyles.krScopePillText, { color: active ? colors.background : colors.textSecondary }]}>
                        {s === 'college' ? 'College' : 'Global'}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>

              {/* ── Global placeholder ── */}
              {standingsScope === 'global' && (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                  <ThemedText style={{ fontSize: 15, color: colors.textTertiary }}>Coming soon</ThemedText>
                </View>
              )}

              {/* ── College content ── */}
              {standingsScope === 'college' && (
                <View>
                  {/* ── 3c. View Chips ── */}
                  <View style={shStyles.krScopeRow}>
                    {(['conference', 'division', 'national'] as const).map((v) => {
                      const active = standingsView === v;
                      return (
                        <Pressable
                          key={v}
                          style={[shStyles.krScopePill, { backgroundColor: active ? colors.text : colors.backgroundSecondary }]}
                          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStandingsView(v); setExpandedKRTeam(null); }}
                        >
                          <ThemedText style={[shStyles.krScopePillText, { color: active ? colors.background : colors.textSecondary }]}>
                            {v === 'conference' ? 'Conference' : v === 'division' ? 'Division' : 'National'}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* ── 3d. Division Picker ── */}
                  {standingsView === 'division' && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm }}>
                      {divisionChips.map((chip) => {
                        const active = selectedDivisions.includes(chip.id);
                        return (
                          <Pressable
                            key={chip.id}
                            style={[shStyles.krScopePill, { backgroundColor: active ? Brand.primary : colors.backgroundSecondary }]}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              setSelectedDivisions(prev => active ? prev.filter(id => id !== chip.id) : [...prev, chip.id]);
                              setExpandedKRTeam(null);
                            }}
                          >
                            <ThemedText style={[shStyles.krScopePillText, { color: active ? '#fff' : colors.textSecondary }]}>
                              {chip.label}
                            </ThemedText>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}

                  {/* ── 3e. Section Label ── */}
                  {standingsView === 'division' && selectedDivisions.length === 0 ? (
                    <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                      <ThemedText style={{ fontSize: 14, color: colors.textTertiary }}>Select a division</ThemedText>
                    </View>
                  ) : (
                    <>
                      {sectionLabel !== '' && (
                        <ThemedText style={[shStyles.sectionLabel, { color: colors.textSecondary }]}>{sectionLabel}</ThemedText>
                      )}

                      {/* ── 3f. Traditional Mode Tables ── */}
                      {standingsMode === 'traditional' && (
                        <>
                          {standingsView === 'conference' && renderTraditionalConfTable(FMU_STANDINGS)}
                          {standingsView === 'division' && selectedDivisions.length > 0 && renderTraditionalConfTable(divStandings)}
                          {standingsView === 'national' && renderPollTable(NAIA_POLL)}
                        </>
                      )}

                      {/* ── 3g. KR Mode Tables ── */}
                      {standingsMode === 'kr' && (
                        <>
                          {standingsView === 'conference' && renderKRTable(KR_CONF, false)}
                          {standingsView === 'division' && selectedDivisions.length > 0 && (() => {
                            const divKR = divStandings.map((r) => ({
                              rank: r.rank,
                              team: r.team,
                              kr: r.kr,
                              trend: r.trend,
                            })).sort((a, b) => b.kr - a.kr).map((r, i) => ({ ...r, rank: i + 1 }));
                            return renderKRTable(divKR, false);
                          })()}
                          {standingsView === 'national' && renderKRTable(KR_NATIONAL, true)}
                        </>
                      )}
                    </>
                  )}
                </View>
              )}
            </View>
          );
        })()}

        {/* ── News Tab ── */}
        {activeTab === 'news' && (
          <View style={{ gap: Spacing.md }}>
            {FMU_NEWS.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [{ backgroundColor: colors.backgroundSecondary, borderRadius: BorderRadius.lg, overflow: 'hidden' as const }, pressed && { opacity: 0.85 }]}
              >
                {/* Video preview thumbnail */}
                <View style={{ height: 160, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' }}>
                    <IconSymbol name="play.fill" size={20} color="#fff" />
                  </View>
                  <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: item.type === 'Highlights' ? 'rgba(255,180,0,0.85)' : 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: item.type === 'Highlights' ? '#000' : '#fff', letterSpacing: 0.3 }}>{item.type.toUpperCase()}</Text>
                  </View>
                </View>
                {/* Info */}
                <View style={{ padding: 12 }}>
                  <ThemedText style={{ fontSize: 15, fontWeight: '700', color: colors.text }} numberOfLines={2}>{item.headline}</ThemedText>
                  <ThemedText style={{ fontSize: 12, color: colors.textTertiary, marginTop: 4 }}>{item.date}</ThemedText>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Opponent KR Bottom Sheet */}
      <BottomSheet visible={!!oppKRSheet} onClose={closeSheet} useModal>
        {oppKRSheet && (() => {
          const opp = oppKRSheet.opponent;
          const sheetGameId = oppKRSheet.gameId ?? '';
          const impact = oppKRSheet.gameStatus === 'final' && sheetGameId ? FMU_GAME_IMPACT[sheetGameId] : null;
          const pregame = oppKRSheet.gameStatus === 'upcoming' && sheetGameId ? FMU_PREGAME[sheetGameId] : null;

          return (
            <>
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
                    </View>
                  );
                })()}

                {/* TGIS + PGIS for completed games, Pregame Snapshot for upcoming */}
                {impact ? (
                    <>
                      {/* Postgame Gambling Block */}
                      {(() => {
                        const pg = sheetGameId ? FMU_PREGAME[sheetGameId] : null;
                        const sm = oppKRSheet.score?.match(/(\d+)-(\d+)/);
                        const fmuS = sm ? parseInt(sm[1]) : 0;
                        const oppS = sm ? parseInt(sm[2]) : 0;
                        const isW = fmuS > oppS;
                        const actualMargin = fmuS - oppS;
                        const actualTotal = fmuS + oppS;
                        const spread = pg ? Math.round(pg.krGap * 0.4) : 0;
                        const spreadStr = spread > 0 ? `FMU -${Math.abs(spread)}.5` : spread < 0 ? `FMU +${Math.abs(spread)}.5` : 'PK';
                        const preWinPct = pg ? Math.min(92, Math.max(28, Math.round(50 + pg.krGap * 0.8))) : 50;
                        const ourKR = pg ? pg.oppKR + pg.krGap : 74;
                        const fmuProj = Math.round(72 + (ourKR - 60) * 0.3);
                        const oppProj = pg ? Math.round(72 + (pg.oppKR - 60) * 0.3) : 72;
                        const preTotal = fmuProj + oppProj;
                        const simConf = pg ? Math.min(95, Math.max(55, Math.round(70 + Math.abs(pg.krGap) * 0.6))) : 70;
                        const projMargin = fmuProj - oppProj;
                        const miss = actualMargin - projMargin;
                        // ATS: did FMU cover the spread?
                        const atsMargin = actualMargin + (spread > 0 ? -spread - 0.5 : -spread + 0.5);
                        const atsCover = spread > 0 ? actualMargin > spread + 0.5 : actualMargin > spread - 0.5;
                        const atsStr = `${atsMargin > 0 ? '+' : ''}${atsMargin.toFixed(1)}`;
                        // O/U
                        const ouDiff = actualTotal - (preTotal + 0.5);
                        const ouStr = `${actualTotal > preTotal + 0.5 ? 'Over' : 'Under'} (${ouDiff > 0 ? '+' : ''}${ouDiff.toFixed(1)})`;
                        return (
                          <View style={{ marginHorizontal: Spacing.lg, marginBottom: Spacing.md, backgroundColor: '#1a1a1a', borderRadius: BorderRadius.lg, padding: Spacing.md }}>
                            {/* Pre-game metrics */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                              <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>LINE</Text>
                                <Text style={{ fontSize: 13, fontWeight: '800', color: '#aaa' }}>{spreadStr}</Text>
                              </View>
                              <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>WIN%</Text>
                                <Text style={{ fontSize: 13, fontWeight: '800', color: '#aaa' }}>{preWinPct}%</Text>
                              </View>
                              <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>TOTAL</Text>
                                <Text style={{ fontSize: 13, fontWeight: '800', color: '#aaa' }}>{preTotal}.5</Text>
                              </View>
                              <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>CONF</Text>
                                <Text style={{ fontSize: 13, fontWeight: '800', color: '#aaa' }}>Sim {simConf}%</Text>
                              </View>
                            </View>
                            {/* Outcome row */}
                            <View style={{ backgroundColor: '#2a2a2a', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 10 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: atsCover ? '#4ade80' : '#f87171' }}>ATS: {atsStr}</Text>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: actualTotal > preTotal + 0.5 ? '#fbbf24' : '#60a5fa' }}>O/U: {ouStr}</Text>
                              </View>
                            </View>
                            {/* Projection strip */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                              <Text style={{ fontSize: 11, color: '#888' }}>Pre Proj: <Text style={{ fontWeight: '700', color: '#ccc' }}>{fmuProj}–{oppProj} ({projMargin > 0 ? '+' : ''}{projMargin})</Text></Text>
                              <Text style={{ fontSize: 11, color: '#888' }}>Actual: <Text style={{ fontWeight: '700', color: isW ? '#4ade80' : '#f87171' }}>{fmuS}–{oppS} ({actualMargin > 0 ? '+' : ''}{actualMargin})</Text></Text>
                            </View>
                            <Text style={{ fontSize: 11, color: '#888' }}>Miss: <Text style={{ fontWeight: '700', color: Math.abs(miss) <= 3 ? '#4ade80' : Math.abs(miss) <= 7 ? '#fbbf24' : '#f87171' }}>{miss > 0 ? '+' : ''}{miss} pts</Text></Text>
                            {/* Verdict */}
                            <Text style={{ fontSize: 10, color: '#666', marginTop: 6, lineHeight: 14 }}>
                              {isW === (projMargin > 0) ? 'Model called it correctly' : `Model favored ${projMargin > 0 ? 'FMU' : 'opponent'}`}; missed by {Math.abs(miss)} pts.
                            </Text>
                          </View>
                        );
                      })()}

                      {/* Our Depth Chart with PGIS */}
                      <UnitsView
                        depthChart={DEPTH_CHART_BY_SEASON[CURRENT_SEASON]}
                        gameImpact={impact ?? undefined}
                        hideSystems
                        statLeaders={[...impact.starters, ...impact.bench]
                          .sort((a, b) => b.pgis - a.pgis)
                          .slice(0, 3)
                          .map((p) => ({ label: 'PGIS', name: p.name.split(' ').slice(1).join(' ') || p.name, value: `${p.pgis > 0 ? '+' : ''}${p.pgis}` }))}
                      />
                    </>
                ) : pregame ? (() => {
                  const opp = buildOpponentDepthChart(pregame);
                  const oppSys = parseDNASystems(pregame.theirDNA);
                  const threats = pregame.oppThreats ?? [];
                  const oppStatLeaders = [
                    { label: 'PPG', name: threats[0]?.name.split(' ').slice(1).join(' ') ?? '—', value: ((threats[0]?.kr ?? 60) * 0.28 + 3.5).toFixed(1) },
                    { label: 'RPG', name: threats[2]?.name.split(' ').slice(1).join(' ') ?? threats[1]?.name.split(' ').slice(1).join(' ') ?? '—', value: ((threats[2]?.kr ?? threats[1]?.kr ?? 60) * 0.09 + 2.0).toFixed(1) },
                    { label: 'APG', name: threats[1]?.name.split(' ').slice(1).join(' ') ?? '—', value: ((threats[1]?.kr ?? 60) * 0.06 + 1.5).toFixed(1) },
                  ];
                  return (
                    <>
                      {(() => {
                        const ourKR = pregame.oppKR + pregame.krGap;
                        const spread = Math.round(pregame.krGap * 0.4);
                        const spreadStr = spread > 0 ? `FMU -${Math.abs(spread)}.5` : spread < 0 ? `FMU +${Math.abs(spread)}.5` : 'PK';
                        const winPct = Math.min(92, Math.max(28, Math.round(50 + pregame.krGap * 0.8)));
                        const fmuProj = Math.round(72 + (ourKR - 60) * 0.3);
                        const oppProj = Math.round(72 + (pregame.oppKR - 60) * 0.3);
                        const simConf = Math.min(95, Math.max(55, Math.round(70 + Math.abs(pregame.krGap) * 0.6)));
                        const keys = (pregame.ourEdge ?? []).slice(0, 3);
                        return (
                          <View style={{ marginHorizontal: Spacing.lg, marginBottom: Spacing.md, backgroundColor: '#1a1a1a', borderRadius: BorderRadius.lg, padding: Spacing.md }}>
                            {/* Gambling-level metrics row */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                              <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>LINE</Text>
                                <Text style={{ fontSize: 14, fontWeight: '800', color: '#f5f5f5' }}>{spreadStr}</Text>
                              </View>
                              <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>WIN%</Text>
                                <Text style={{ fontSize: 14, fontWeight: '800', color: winPct >= 60 ? '#4ade80' : winPct <= 40 ? '#f87171' : '#fbbf24' }}>{winPct}%</Text>
                              </View>
                              <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>TOTAL</Text>
                                <Text style={{ fontSize: 14, fontWeight: '800', color: '#f5f5f5' }}>{fmuProj + oppProj}.5</Text>
                              </View>
                              <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>CONF</Text>
                                <View style={{ backgroundColor: '#2563eb20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#60a5fa' }}>Sim {simConf}%</Text>
                                </View>
                              </View>
                            </View>
                            {/* Projection strip */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2a2a2a', borderRadius: 8, paddingVertical: 6, marginBottom: 10 }}>
                              <Text style={{ fontSize: 15, fontWeight: '800', color: fmuProj >= oppProj ? '#4ade80' : '#f87171' }}>{fmuProj >= oppProj ? 'W' : 'L'} {fmuProj}–{oppProj}</Text>
                            </View>
                            {/* Keys (mini) */}
                            {keys.length > 0 && keys.map((key: string, i: number) => (
                              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: i < keys.length - 1 ? 6 : 0 }}>
                                <Text style={{ fontSize: 12, fontWeight: '800', color: '#888', width: 18 }}>{i + 1})</Text>
                                <Text style={{ fontSize: 12, color: '#ccc', flex: 1, lineHeight: 17 }}>{key}</Text>
                              </View>
                            ))}
                          </View>
                        );
                      })()}
                      <UnitsView
                        depthChart={opp.depthChart}
                        playerClusters={opp.playerClusters}
                        playerPhysicals={opp.playerPhysicals}
                        initialOffStyle={oppSys.off}
                        initialDefStyle={oppSys.def}
                        initialTempo={oppSys.tempo}
                        hideSystems
                        statLeaders={oppStatLeaders}
                      />
                    </>
                  );
                })() : null}
            </>
          );
        })()}
      </BottomSheet>
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
  const [openLiveTrigger, setOpenLiveTrigger] = useState(0);
  const [jumpToStandings, setJumpToStandings] = useState(0);

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
  const [activeRecentPGIS, setActiveRecentPGIS] = useState(0);
  const [fullRecentPGISOpen, setFullRecentPGISOpen] = useState(false);
  const openRecentSheet = useCallback((data: { opponent: string; kr: number; record: string; gameId: string; gameStatus: string; score?: string }) => {
    setRecentSheet(data);
  }, []);

  const closeRecentSheet = useCallback(() => {
    setRecentSheet(null);
  }, []);

  // Team profile bottom sheet
  const [teamSheetOpen, setTeamSheetOpen] = useState(false);
  const openTeamSheet = useCallback(() => {
    setTeamSheetOpen(true);
  }, []);

  const closeTeamSheet = useCallback(() => {
    setTeamSheetOpen(false);
  }, []);

  // Register global team sheet handlers so any page can open it
  useEffect(() => {
    registerTeamSheetHandlers(openTeamSheet, closeTeamSheet);
  }, [openTeamSheet, closeTeamSheet]);

  // Team system selection state
  const [selectedOffSystem, setSelectedOffSystem] = useState('Motion Read & React');
  const [selectedDefSystem, setSelectedDefSystem] = useState('Pack Line');
  const [selectedTempo, setSelectedTempo] = useState('Moderate');

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
          <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' }}>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openTeamSheet(); }}
              onLongPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); openTeamSheet(); }}
              delayLongPress={300}
            >
              <Image source={FMU_SEAL} style={{ width: 64, height: 64, marginRight: 14 }} resizeMode="contain" />
            </Pressable>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.5 }}>
                {DEMO_TEAM_STATE.name}
              </ThemedText>
              <ThemedText style={{ fontSize: 13, fontWeight: '500', color: colors.textTertiary, marginTop: 2 }}>
                {DEMO_TEAM_STATE.level} {'\u00B7'} {DEMO_TEAM_STATE.conference}
              </ThemedText>
            </View>
            <View style={{ alignItems: 'center', backgroundColor: colors.text + '0F', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 }}>
              <ThemedText style={{ fontSize: 26, fontWeight: '800', color: colors.text, lineHeight: 30 }}>
                {liveTeamKR}
              </ThemedText>
              <ThemedText style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, marginTop: 2 }}>
                O {liveOffKR} · D {liveDefKR}
              </ThemedText>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'stretch' }}>
            <ThemedText style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
              {DEMO_TEAM_STATE.record}
            </ThemedText>
            <ThemedText style={{ fontSize: 14, fontWeight: '500', color: colors.textTertiary }}>
              ({DEMO_TEAM_STATE.confRecord} conf)
            </ThemedText>
            <View style={{ backgroundColor: DEMO_TEAM_STATE.streak.startsWith('W') ? '#4CAF5020' : '#EF444420', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
              <ThemedText style={{ fontSize: 12, fontWeight: '700', color: DEMO_TEAM_STATE.streak.startsWith('W') ? '#4CAF50' : '#EF4444' }}>
                {DEMO_TEAM_STATE.streak}
              </ThemedText>
            </View>
            <View style={{ backgroundColor: colors.text + '10', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
              <ThemedText style={{ fontSize: 12, fontWeight: '600', color: colors.textTertiary }}>{DEMO_TEAM_STATE.tier}</ThemedText>
            </View>
          </View>
        </View>

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
                  setActiveHubIndex(1);
                  pagerRef.current?.setPage(1);
                  setOpenLiveTrigger((prev) => prev + 1);
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
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1, flexShrink: 1, marginRight: 12 }}>
                        <ThemedText style={{ fontSize: 16, fontWeight: '700', color: '#fff' }} numberOfLines={1}>
                          {liveGame.location === 'Home' ? 'vs' : '@'} {liveGame.opponent}{liveGame.opponentKR ? ` (${liveGame.opponentKR})` : ''}
                        </ThemedText>
                        <ThemedText style={{ fontSize: 13, color: '#999', marginTop: 2 }}>
                          {liveGame.opponentRecord ?? ''}
                        </ThemedText>
                      </View>
                      <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                        {liveGame.score && (
                          <ThemedText style={{ fontSize: 18, fontWeight: '700', color: '#fff' }}>{liveGame.score}</ThemedText>
                        )}
                        {liveGame.clock && (
                          <ThemedText style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{liveGame.clock}</ThemedText>
                        )}
                      </View>
                    </View>
                  </>
                ) : (
                  <>
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
                        {(() => { const sw = 50 + (confHash(game.opponent ?? '') % 30); return (
                          <Text style={{ fontSize: 11, fontWeight: '600', color: sw >= 50 ? '#4CAF50' : '#EF4444', marginTop: 2 }}>Sim {sw}%</Text>
                        ); })()}
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
                        {(() => { const sw = 50 + (confHash(game.opponent ?? '') % 30); return (
                          <Text style={{ fontSize: 11, fontWeight: '600', color: sw >= 50 ? '#4CAF50' : '#EF4444', marginTop: 2 }}>Sim {sw}%</Text>
                        ); })()}
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
          {/* Row 1 — Standing */}
          <View style={styles.statusRow}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <ThemedText style={[styles.statusLabel, { color: colors.textSecondary }]}>Standing</ThemedText>
              <View style={[styles.pulseConfChip, { backgroundColor: colors.tint + '20' }]}>
                <Text style={[styles.pulseConfChipText, { color: colors.tint }]}>Conf: {FMU_RECORD.conference}</Text>
              </View>
            </View>
            <ThemedText style={[styles.statusValue, { color: colors.text }]}>
              {FMU_CONF_POSITION > 0 ? `${FMU_CONF_POSITION}${FMU_CONF_POSITION === 1 ? 'st' : FMU_CONF_POSITION === 2 ? 'nd' : FMU_CONF_POSITION === 3 ? 'rd' : 'th'} in Sun Conference` : 'Sun Conference'}
            </ThemedText>
          </View>
          <View style={[styles.contextDivider, { backgroundColor: colors.divider }]} />

          {/* Row 2 — Top 3 */}
          <View style={styles.statusRow}>
            <ThemedText style={[styles.statusLabel, { color: colors.textSecondary }]}>Top 3</ThemedText>
            <View style={styles.pulseChipRow}>
              {CONF_TOP3_TRADITIONAL.map((entry, i) => (
                <View key={i} style={[styles.pulseChip, { backgroundColor: colors.tint + '15' }]}>
                  <Text style={[styles.pulseChipText, { color: colors.text }]}>{entry.team} ({entry.kr})</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={[styles.contextDivider, { backgroundColor: colors.divider }]} />

          {/* Row 3 — Next Conf. Games / Final Record */}
          <View style={styles.statusRow}>
            <ThemedText style={[styles.statusLabel, { color: colors.textSecondary }]}>
              {FMU_SEASON_COMPLETE ? 'Final Record' : 'Next Conf. Games'}
            </ThemedText>
            {FMU_SEASON_COMPLETE ? (
              <ThemedText style={[styles.statusValue, { color: colors.text }]}>
                {FMU_RECORD.overall} overall {'\u00B7'} {FMU_RECORD.conference} conference
              </ThemedText>
            ) : NEXT_CONF_GAMES.length > 0 ? (
              NEXT_CONF_GAMES.map((g, i) => {
                const loc = g.location === 'Home' ? 'vs' : '@';
                const simWin = 50 + (confHash(g.opponent ?? '') % 30);
                return (
                  <View key={i} style={styles.pulseGameRow}>
                    <Text style={[styles.pulseGameText, { color: colors.textTertiary }]}>
                      {g.date} {'\u00B7'} {loc} {g.opponent}{g.gameTime ? ` \u00B7 ${g.gameTime}` : ''}
                    </Text>
                    <View style={[styles.pulseSimChip, { backgroundColor: simWin >= 50 ? '#4CAF5020' : '#EF444420' }]}>
                      <Text style={[styles.pulseSimText, { color: simWin >= 50 ? '#4CAF50' : '#EF4444' }]}>Sim {simWin}%</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <ThemedText style={[styles.statusValue, { color: colors.textTertiary }]}>
                No conference games scheduled
              </ThemedText>
            )}
          </View>

          {/* Footer — View full standings */}
          <View style={[styles.contextDivider, { backgroundColor: colors.divider }]} />
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveHubIndex(1);
              pagerRef.current?.setPage(1);
              setJumpToStandings(prev => prev + 1);
            }}
            style={styles.pulseFooter}
          >
            <Text style={[styles.pulseFooterText, { color: colors.tint }]}>View full standings →</Text>
          </Pressable>
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

        {/* Page 1: Schedule (full Games Hub) */}
        <View key="schedule" style={{ flex: 1 }}>
          <ScheduleHub colors={colors} router={router} openLiveTrigger={openLiveTrigger} jumpToStandings={jumpToStandings} />
        </View>

        {/* Page 2: Roster */}
        <ScrollView
          key="roster"
          style={styles.sportsScrollView}
          contentContainerStyle={styles.rosterScrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <RosterContent teamKR={liveTeamKR} offKR={liveOffKR} defKR={liveDefKR} onLogoPress={openTeamSheet} onLogoLongPress={openTeamSheet} onOpenStatistics={() => { pagerRef.current?.setPage(4); }} />
        </ScrollView>

        {/* Page 3: Recruiting (National Pool) */}
        <View key="recruiting" style={{ flex: 1 }}>
          <PlayerPoolContent />
        </View>

        {/* Page 4: Stats (inline) */}
        <View key="stats" style={{ flex: 1 }}>
          <StatsContent />
        </View>

        {/* Page 5: Game Ops (Depth Chart) */}
        <ScrollView
          key="game-ops"
          style={styles.sportsScrollView}
          contentContainerStyle={styles.sportsScrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <DepthChartView depthChart={DEPTH_CHART_BY_SEASON[CURRENT_SEASON]} />
        </ScrollView>

        {/* Page 6: Program */}
        <ScrollView
          key="program"
          style={styles.sportsScrollView}
          contentContainerStyle={styles.sportsScrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <ProgramContextSection />
        </ScrollView>

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
      <BottomSheet visible={!!recentSheet} onClose={closeRecentSheet} >
        {recentSheet && (() => {
          const opp = recentSheet.opponent;
          const recentImpact = recentSheet.gameStatus === 'final' && recentSheet.gameId ? FMU_GAME_IMPACT[recentSheet.gameId] : null;
          const recentPregame = recentSheet.gameStatus === 'upcoming' && recentSheet.gameId ? FMU_PREGAME[recentSheet.gameId] : null;
          return (
            <>
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
                    </View>
                  );
                })()}

                {/* TGIS + PGIS for completed games, Pregame Snapshot for upcoming */}
                {recentImpact ? (
                    <>
                      {/* Postgame Gambling Block */}
                      {(() => {
                        const pg = recentSheet.gameId ? FMU_PREGAME[recentSheet.gameId] : null;
                        const sm = recentSheet.score?.match(/(\d+)-(\d+)/);
                        const fmuS = sm ? parseInt(sm[1]) : 0;
                        const oppS = sm ? parseInt(sm[2]) : 0;
                        const isW = fmuS > oppS;
                        const actualMargin = fmuS - oppS;
                        const actualTotal = fmuS + oppS;
                        const spread = pg ? Math.round(pg.krGap * 0.4) : 0;
                        const spreadStr = spread > 0 ? `FMU -${Math.abs(spread)}.5` : spread < 0 ? `FMU +${Math.abs(spread)}.5` : 'PK';
                        const preWinPct = pg ? Math.min(92, Math.max(28, Math.round(50 + pg.krGap * 0.8))) : 50;
                        const ourKR = pg ? pg.oppKR + pg.krGap : 74;
                        const fmuProj = Math.round(72 + (ourKR - 60) * 0.3);
                        const oppProj = pg ? Math.round(72 + (pg.oppKR - 60) * 0.3) : 72;
                        const preTotal = fmuProj + oppProj;
                        const simConf = pg ? Math.min(95, Math.max(55, Math.round(70 + Math.abs(pg.krGap) * 0.6))) : 70;
                        const projMargin = fmuProj - oppProj;
                        const miss = actualMargin - projMargin;
                        const atsMargin = actualMargin + (spread > 0 ? -spread - 0.5 : -spread + 0.5);
                        const atsCover = spread > 0 ? actualMargin > spread + 0.5 : actualMargin > spread - 0.5;
                        const atsStr = `${atsMargin > 0 ? '+' : ''}${atsMargin.toFixed(1)}`;
                        const ouDiff = actualTotal - (preTotal + 0.5);
                        const ouStr = `${actualTotal > preTotal + 0.5 ? 'Over' : 'Under'} (${ouDiff > 0 ? '+' : ''}${ouDiff.toFixed(1)})`;
                        return (
                          <View style={{ marginHorizontal: Spacing.lg, marginBottom: Spacing.md, backgroundColor: '#1a1a1a', borderRadius: BorderRadius.lg, padding: Spacing.md }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                              <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>LINE</Text>
                                <Text style={{ fontSize: 13, fontWeight: '800', color: '#aaa' }}>{spreadStr}</Text>
                              </View>
                              <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>WIN%</Text>
                                <Text style={{ fontSize: 13, fontWeight: '800', color: '#aaa' }}>{preWinPct}%</Text>
                              </View>
                              <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>TOTAL</Text>
                                <Text style={{ fontSize: 13, fontWeight: '800', color: '#aaa' }}>{preTotal}.5</Text>
                              </View>
                              <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>CONF</Text>
                                <Text style={{ fontSize: 13, fontWeight: '800', color: '#aaa' }}>Sim {simConf}%</Text>
                              </View>
                            </View>
                            <View style={{ backgroundColor: '#2a2a2a', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 10 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: atsCover ? '#4ade80' : '#f87171' }}>ATS: {atsStr}</Text>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: actualTotal > preTotal + 0.5 ? '#fbbf24' : '#60a5fa' }}>O/U: {ouStr}</Text>
                              </View>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                              <Text style={{ fontSize: 11, color: '#888' }}>Pre Proj: <Text style={{ fontWeight: '700', color: '#ccc' }}>{fmuProj}–{oppProj} ({projMargin > 0 ? '+' : ''}{projMargin})</Text></Text>
                              <Text style={{ fontSize: 11, color: '#888' }}>Actual: <Text style={{ fontWeight: '700', color: isW ? '#4ade80' : '#f87171' }}>{fmuS}–{oppS} ({actualMargin > 0 ? '+' : ''}{actualMargin})</Text></Text>
                            </View>
                            <Text style={{ fontSize: 11, color: '#888' }}>Miss: <Text style={{ fontWeight: '700', color: Math.abs(miss) <= 3 ? '#4ade80' : Math.abs(miss) <= 7 ? '#fbbf24' : '#f87171' }}>{miss > 0 ? '+' : ''}{miss} pts</Text></Text>
                            <Text style={{ fontSize: 10, color: '#666', marginTop: 6, lineHeight: 14 }}>
                              {isW === (projMargin > 0) ? 'Model called it correctly' : `Model favored ${projMargin > 0 ? 'FMU' : 'opponent'}`}; missed by {Math.abs(miss)} pts.
                            </Text>
                          </View>
                        );
                      })()}

                      {/* Our Depth Chart with PGIS */}
                      <UnitsView
                        depthChart={DEPTH_CHART_BY_SEASON[CURRENT_SEASON]}
                        gameImpact={recentImpact ?? undefined}
                        hideSystems
                        statLeaders={[...recentImpact.starters, ...recentImpact.bench]
                          .sort((a, b) => b.pgis - a.pgis)
                          .slice(0, 3)
                          .map((p) => ({ label: 'PGIS', name: p.name.split(' ').slice(1).join(' ') || p.name, value: `${p.pgis > 0 ? '+' : ''}${p.pgis}` }))}
                      />
                    </>
                ) : recentPregame ? (() => {
                  const opp = buildOpponentDepthChart(recentPregame);
                  const oppSys = parseDNASystems(recentPregame.theirDNA);
                  const threats2 = recentPregame.oppThreats ?? [];
                  const oppStatLeaders2 = [
                    { label: 'PPG', name: threats2[0]?.name.split(' ').slice(1).join(' ') ?? '—', value: ((threats2[0]?.kr ?? 60) * 0.28 + 3.5).toFixed(1) },
                    { label: 'RPG', name: threats2[2]?.name.split(' ').slice(1).join(' ') ?? threats2[1]?.name.split(' ').slice(1).join(' ') ?? '—', value: ((threats2[2]?.kr ?? threats2[1]?.kr ?? 60) * 0.09 + 2.0).toFixed(1) },
                    { label: 'APG', name: threats2[1]?.name.split(' ').slice(1).join(' ') ?? '—', value: ((threats2[1]?.kr ?? 60) * 0.06 + 1.5).toFixed(1) },
                  ];
                  return (
                    <>
                      {(() => {
                        const ourKR = recentPregame.oppKR + recentPregame.krGap;
                        const spread = Math.round(recentPregame.krGap * 0.4);
                        const spreadStr = spread > 0 ? `FMU -${Math.abs(spread)}.5` : spread < 0 ? `FMU +${Math.abs(spread)}.5` : 'PK';
                        const winPct = Math.min(92, Math.max(28, Math.round(50 + recentPregame.krGap * 0.8)));
                        const fmuProj = Math.round(72 + (ourKR - 60) * 0.3);
                        const oppProj = Math.round(72 + (recentPregame.oppKR - 60) * 0.3);
                        const simConf = Math.min(95, Math.max(55, Math.round(70 + Math.abs(recentPregame.krGap) * 0.6)));
                        const keys = (recentPregame.ourEdge ?? []).slice(0, 3);
                        return (
                          <View style={{ marginHorizontal: Spacing.lg, marginBottom: Spacing.md, backgroundColor: '#1a1a1a', borderRadius: BorderRadius.lg, padding: Spacing.md }}>
                            {/* Gambling-level metrics row */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                              <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>LINE</Text>
                                <Text style={{ fontSize: 14, fontWeight: '800', color: '#f5f5f5' }}>{spreadStr}</Text>
                              </View>
                              <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>WIN%</Text>
                                <Text style={{ fontSize: 14, fontWeight: '800', color: winPct >= 60 ? '#4ade80' : winPct <= 40 ? '#f87171' : '#fbbf24' }}>{winPct}%</Text>
                              </View>
                              <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>TOTAL</Text>
                                <Text style={{ fontSize: 14, fontWeight: '800', color: '#f5f5f5' }}>{fmuProj + oppProj}.5</Text>
                              </View>
                              <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>CONF</Text>
                                <View style={{ backgroundColor: '#2563eb20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#60a5fa' }}>Sim {simConf}%</Text>
                                </View>
                              </View>
                            </View>
                            {/* Projection strip */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2a2a2a', borderRadius: 8, paddingVertical: 6, marginBottom: 10 }}>
                              <Text style={{ fontSize: 15, fontWeight: '800', color: fmuProj >= oppProj ? '#4ade80' : '#f87171' }}>{fmuProj >= oppProj ? 'W' : 'L'} {fmuProj}–{oppProj}</Text>
                            </View>
                            {/* Keys (mini) */}
                            {keys.length > 0 && keys.map((key: string, i: number) => (
                              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: i < keys.length - 1 ? 6 : 0 }}>
                                <Text style={{ fontSize: 12, fontWeight: '800', color: '#888', width: 18 }}>{i + 1})</Text>
                                <Text style={{ fontSize: 12, color: '#ccc', flex: 1, lineHeight: 17 }}>{key}</Text>
                              </View>
                            ))}
                          </View>
                        );
                      })()}
                      <UnitsView
                        depthChart={opp.depthChart}
                        playerClusters={opp.playerClusters}
                        playerPhysicals={opp.playerPhysicals}
                        initialOffStyle={oppSys.off}
                        initialDefStyle={oppSys.def}
                        initialTempo={oppSys.tempo}
                        hideSystems
                        statLeaders={oppStatLeaders2}
                      />
                    </>
                  );
                })() : null}
            </>
          );
        })()}
      </BottomSheet>

      {/* ===== TEAM QUICK SHEET ===== */}
      <TeamQuickSheet
        visible={teamSheetOpen}
        onClose={closeTeamSheet}
        teamKR={liveTeamKR}
        offKR={liveOffKR}
        defKR={liveDefKR}
        offSystemName={selectedOffSystem}
        defSystemName={selectedDefSystem}
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
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },

  // ===== SPORTS HOME STYLES (v2) =====

  // Team Hub Tabs (ESPN-style header row)
  hubTabsContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingTop: 4,
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
    borderBottomWidth: 2.5,
  },
  hubTabLabel: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  hubTabLabelActive: {
    fontWeight: '700',
  },

  // Team Truth Header
  teamStateSection: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: 14,
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
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  contextDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },

  // Status Row (for Current Status card)
  statusRow: {
    paddingVertical: 13,
    paddingHorizontal: Spacing.md,
    gap: 4,
  },
  statusRowTappable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: Spacing.md,
  },
  statusRowContent: {
    flex: 1,
    gap: 4,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Conference Pulse
  pulseChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  pulseChipText: { fontSize: 12, fontWeight: '600' },
  pulseChipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 6 },
  pulseGameRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  pulseGameText: { fontSize: 13, fontWeight: '500' },
  pulseConfChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  pulseConfChipText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  pulseFooter: { paddingVertical: 14, paddingHorizontal: Spacing.md, alignItems: 'center' },
  pulseFooterText: { fontSize: 13, fontWeight: '600' },
  pulseSimChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginLeft: 10 },
  pulseSimText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },

  // Pregame Packet Button
  pregamePacketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.md,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  pregamePacketText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },

  // Next Game Card (Home)
  nextGameCardHome: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  nextLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 5,
  },
  nextOpponent: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  nextMeta: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 3,
  },

  // Recent (Last 3) Section
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  miniStreakBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
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
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  recentOpponent: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  recentMeta: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  recentRight: {
    alignItems: 'flex-end',
    gap: 5,
    marginLeft: 12,
  },
  recentPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  recentPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  recentScore: {
    fontSize: 15,
    fontWeight: '800',
  },
  upcomingDateTime: {
    fontSize: 14,
    fontWeight: '800',
  },

  // BPR inline panel (recent games)
  bprPanel: {
    paddingHorizontal: Spacing.md,
    paddingTop: 6,
    paddingBottom: Spacing.md,
  },
  bprPanelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  bprPanelName: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
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
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 12,
  },

  // Schedule Row (upcoming games — matches games.tsx)
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 10,
  },
  scheduleDateCol: {
    width: 70,
  },
  scheduleDateText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  scheduleLocationText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  scheduleOpponent: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },

  // Action Card
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    letterSpacing: -0.2,
  },
  actionSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 2,
  },

  // Info Card
  infoCard: {
    borderRadius: 16,
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
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
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
    borderRadius: 16,
    marginBottom: Spacing.lg,
  },
  highlightContent: {
    marginLeft: Spacing.sm,
  },
  highlightTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  highlightSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 3,
  },

  // Event Row
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  eventDate: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  eventMonth: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  eventDay: {
    fontSize: 18,
    fontWeight: '800',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  eventDesc: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 2,
  },

});
