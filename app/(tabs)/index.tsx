/**
 * Home Screen
 * Mode-aware dashboard showing contextual information.
 * Per spec: Home displays key stats and quick actions for the current mode.
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, ScrollView, StyleSheet, Pressable, InteractionManager, Text, Dimensions, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/core';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import PagerView from 'react-native-pager-view';
import { PagedTabBar } from '@/components/ui/paged-tab-bar';
import { EdgeHoldAdvance } from '@/components/ui/edge-hold-advance';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { RosterContent, DepthChartView, DEPTH_CHART_BY_SEASON, CURRENT_SEASON } from '@/components/roster-content';
import { UnitsView } from '@/components/depth-chart/depth-chart-units';
import { KRDetailsSheet } from '@/components/kr-details-sheet';
import { PlayerPoolContent, PlayerPoolContentV2 } from '@/app/coach/recruiting';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import type { Archetype } from '@/data/system-demand-profiles';
import { Colors, Spacing, BorderRadius, ModeColors, Brand, MODE_ACCENT } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useAppContext, useMode, useMembershipId } from '@/context/app-context';
import type { Mode, OffensiveStyle, DefensiveStyle } from '@/types';
import { RECRUITING_BOARD } from '@/data/recruitingBoard';
import { openTeamCard } from '@/utils/global-entity-sheets';

// Mock data imports (other modes)

// Carroll College data
import { KaNeXT_GAMES, KaNeXT_GAMES_BY_ID, KaNeXT_LEADERS, KaNeXT_STANDINGS, KaNeXT_NEWS, KaNeXT_RECORD, KaNeXT_LAST_GAME, KaNeXT_LAST_GAME_ID, KaNeXT_NEXT_GAME, KaNeXT_NEXT_GAME_ID, KaNeXT_SEASON_COMPLETE, KaNeXT_GAME_BPR, getBPRColor, KaNeXT_GAME_IMPACT, getPGISColor, getTGISColor, tgisToDisplay, KaNeXT_PREGAME, ROSTER_KR, DNA_OFFENSE_POOL, DNA_DEFENSE_POOL, DNA_TEMPO_POOL, jerseyArchetypeMap, POSITIVE_IMPACT, NEGATIVE_IMPACT, type PregameSnapshot, type ClusterRating } from '@/data/fmu';
import { TeamSheet as LocalTeamSheet } from '@/components/entity-sheets/team-sheet';
import { consumeHomeReset, registerHomeResetCallback } from '@/utils/global-home';
import { getSportsRole, type SportsRoleLens } from '@/utils/sports-rbac';
import { registerTeamSheetHandlers } from '@/utils/global-team-sheet';
import { SportsGamePlanV2 } from '@/components/game-plan/sports-game-plan-v2';
import { GamePlanPage } from '@/components/game-plan/game-plan-page';
import { SportsCalendarV2 } from '@/components/calendar/sports-calendar-v2';
import { SportsStatsV2 } from '@/components/stats/sports-stats-v2';
import { SportsSimulationV2 } from '@/components/simulation/sports-simulation-v2';
import { SimulationPage } from '@/components/simulation/simulation-page';
import { DevelopmentPage } from '@/components/development/development-page';
import { StatisticsPage } from '@/components/stats/statistics-page';
import { AlertsPage } from '@/components/alerts/alerts-page';
import { SportsDevelopmentV2 } from '@/components/development/sports-development-v2';
import { getKRColor } from '@/utils/kr-display';
import { TicketsSheet } from '@/components/commerce/tickets-sheet';
import { StoreSheet } from '@/components/commerce/store-sheet';
import { SupportSheet } from '@/components/commerce/support-sheet';
import { CommunityHome } from '@/components/community/community-home';
import { BusinessHome } from '@/components/business/business-home';
import { ChurchHome as ChurchHomeComponent } from '@/components/church/church-home';
import { EducationHome as EducationHomeComponent } from '@/components/education/education-home';
import { BusinessProvider } from '@/context/business-context';
import { ChurchProvider } from '@/context/church-context';
import { EducationProvider } from '@/context/education-context';
import { EmptyModeShell, type ShellTab } from '@/components/ui/empty-mode-shell';

// =============================================================================
// EMPTY MODE SHELL TAB CONFIGS
// =============================================================================

const SPORTS_HOME_TABS: ShellTab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'sportscourt', emptyTitle: 'No Data Yet', emptyDescription: 'Your dashboard will populate as games and events are added.' },
  { id: 'calendar', label: 'Schedule', icon: 'calendar', emptyTitle: 'No Events', emptyDescription: 'Schedule games and events to get started.' },
  { id: 'roster', label: 'Roster', icon: 'person.2.fill', emptyTitle: 'No Players', emptyDescription: 'Add players to build your roster.' },
  { id: 'recruiting', label: 'Recruiting', icon: 'star.circle.fill', emptyTitle: 'No Prospects', emptyDescription: 'Start scouting to build your recruiting board.' },
];

const BUSINESS_HOME_TABS: ShellTab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'chart.bar', emptyTitle: 'No Data Yet', emptyDescription: 'Your dashboard will populate as your business grows.' },
  { id: 'calendar', label: 'Schedule', icon: 'calendar', emptyTitle: 'No Events', emptyDescription: 'Schedule meetings and milestones to get started.' },
  { id: 'vault', label: 'Vault', icon: 'lock.fill', emptyTitle: 'No Documents', emptyDescription: 'Upload documents to build your data room.' },
  { id: 'deals', label: 'Deals', icon: 'briefcase.fill', emptyTitle: 'No Deals', emptyDescription: 'Add deals to build your pipeline.' },
];

const CHURCH_HOME_TABS: ShellTab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'house.fill', emptyTitle: 'No Data Yet', emptyDescription: 'Your dashboard will populate as your church grows.' },
  { id: 'calendar', label: 'Schedule', icon: 'calendar', emptyTitle: 'No Events', emptyDescription: 'Schedule services and events to get started.' },
  { id: 'ministries', label: 'Ministries', icon: 'person.3', emptyTitle: 'No Ministries', emptyDescription: 'Create ministries to organize your church.' },
  { id: 'connect', label: 'Connect', icon: 'heart', emptyTitle: 'No Connections', emptyDescription: 'Start connecting with your community.' },
];

// =============================================================================
// COMING SOON — placeholder for modes not yet launched
// =============================================================================

function ComingSoonPage({ mode }: { mode: Mode }) {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingBottom: insets.bottom + 80 }]}>
      <ThemedText style={styles.comingSoonTitle}>Coming Soon</ThemedText>
      <ThemedText style={styles.comingSoonSubtitle}>
        This mode is under development.{'\n'}Stay tuned for updates.
      </ThemedText>
    </ThemedView>
  );
}

// =============================================================================
// SPORTS HOME (v1.1 Spec - Team Hub Home / Coach HQ)
// Mental model: Video-game hub for a coach.
// NOT a SaaS dashboard. NOT a chatbot entry point.
// Shows: state, identity, and motion — nothing else.
// =============================================================================

// Sports Home — 4-tab PagerView layout (Dashboard + Roster + Calendar + Recruiting)
type DrillDownId = 'stats' | 'game-plan' | 'simulation' | 'development' | 'alerts' | 'recruiting';

const HOME_TABS: { id: string; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'roster', label: 'Roster' },
  { id: 'calendar', label: 'Schedule' },
  { id: 'recruiting', label: 'Recruiting' },
];

// Domain section cards shown on Dashboard pill (5 remaining after roster/recruiting promoted)
const DOMAIN_CARD_DEFS: { id: DrillDownId; title: string; icon: IconSymbolName }[] = [
  { id: 'stats', title: 'Statistics', icon: 'chart.bar.fill' },
  { id: 'game-plan', title: 'Game Plan', icon: 'sportscourt.fill' },
  { id: 'simulation', title: 'Simulation', icon: 'play.circle.fill' },
  { id: 'development', title: 'Development', icon: 'arrow.up.right.circle.fill' },
  { id: 'alerts', title: 'Alerts & Decisions', icon: 'bell.badge.fill' },
  { id: 'recruiting', title: 'Recruiting', icon: 'star.circle.fill' },
];

/** RBAC: which domain cards are hidden per role */
const DOMAIN_HIDDEN: Record<SportsRoleLens, Set<DrillDownId>> = {
  R0: new Set(),
  R1: new Set(),
  R2: new Set(),
  R3: new Set(),
  R4: new Set(),
  R5: new Set(['game-plan', 'simulation', 'recruiting']),
  R6: new Set(['game-plan', 'simulation', 'development', 'recruiting']),
  R7: new Set(['game-plan', 'simulation', 'development', 'stats', 'recruiting']),
  R8: new Set(['game-plan', 'simulation', 'recruiting']),
  R9: new Set(['game-plan', 'simulation', 'development', 'stats', 'recruiting']),
  R10: new Set(['game-plan', 'simulation', 'development', 'stats', 'recruiting']),
  R11: new Set(['game-plan', 'simulation', 'development', 'recruiting']),
  R12: new Set(['game-plan', 'simulation', 'development', 'recruiting']),
  R13: new Set(['game-plan', 'simulation', 'development']),
};

// KaNeXT logo
const KaNeXT_LOGO = require('@/assets/images/kx-logo.png');

// KaNeXT team state — derived from real data
const fmuStreak = KaNeXT_STANDINGS.find((r) => r.team === 'Carroll College')?.streak ?? '—';
const DEMO_TEAM_STATE = {
  name: 'Carroll College',
  level: 'NAIA',
  conference: 'Frontier Conference',
  record: KaNeXT_RECORD.overall,
  confRecord: KaNeXT_RECORD.conference,
  streak: fmuStreak,
};

const DEMO_TODAY = {
  activity: KaNeXT_SEASON_COMPLETE ? 'Off-Season' : 'In-Season',
  lastGame: KaNeXT_LAST_GAME
    ? { opponent: KaNeXT_LAST_GAME.opponent, result: KaNeXT_LAST_GAME.result, score: KaNeXT_LAST_GAME.score, location: KaNeXT_LAST_GAME.location }
    : { opponent: 'Unknown', result: '—', score: '—', location: 'Home' },
  nextGame: KaNeXT_NEXT_GAME
    ? { opponent: KaNeXT_NEXT_GAME.opponent, date: KaNeXT_NEXT_GAME.date, location: KaNeXT_NEXT_GAME.location }
    : null,
};

// Conference Pulse — derived data
const confHash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); };

const KaNeXT_CONF_POSITION = KaNeXT_STANDINGS.findIndex(r => r.team === 'Carroll College') + 1;

const CONF_TOP3_TRADITIONAL = KaNeXT_STANDINGS.slice(0, 3).map(r => {
  const h = confHash(r.team);
  const kr = r.team === 'Carroll College' ? 74 : 58 + (h % 28);
  return { team: r.team, kr };
});

const NEXT_CONF_GAMES = KaNeXT_SEASON_COMPLETE
  ? []
  : KaNeXT_GAMES.filter(g => (g.status === 'upcoming' || g.status === 'live') && g.gameType === 'CONF').slice(0, 3);

// Game IDs for routing
const LAST_GAME_ID = KaNeXT_LAST_GAME_ID;

// =============================================================================
// OPPONENT HELPERS (used by Recent BPR bottom sheet)
// =============================================================================









// ── Opponent depth chart helpers (used by Dashboard recent sheet) ──
const OPP_ARCHETYPE_MAP_HOME: Record<string, Archetype> = {
  'Shot Creator': 'pick_and_roll_operator', 'Floor General': 'primary_ball_handler',
  'Scoring Wing': 'secondary_creator_wing', 'Stretch Big': 'stretch_big',
  'Rim Runner': 'vertical_spacer', 'Two-Way Wing': 'two_way_wing',
  '3&D Guard': 'three_and_d_wing', 'Post Anchor': 'rim_protector_anchor',
  'Slasher': 'slasher_rim_pressure_wing', 'Playmaking Guard': 'connector_guard_wing',
};
const DNA_OFF_MAP_HOME: Record<string, OffensiveStyle> = {
  'Spread Pick & Roll': 'spread_pick_and_roll', 'Five-Out Motion': 'five_out_motion',
  'Motion Read & React': 'motion_read_react', 'Pace & Space': 'pace_and_space',
  'Dribble Drive': 'dribble_drive', 'Princeton': 'princeton', 'Flex': 'flex',
  'Swing': 'swing', 'Post-Centric': 'post_centric', 'Moreyball': 'moreyball', 'Heliocentric': 'heliocentric',
};
const DNA_DEF_MAP_HOME: Record<string, DefensiveStyle> = {
  'Containment Man': 'containment_man', 'Pack Line': 'pack_line', 'Pressure Man': 'pressure_man',
  'Switch Everything': 'switch_everything', 'Ice / No Middle': 'ice_no_middle',
  'Zone (Structured)': 'zone_structured', 'Matchup Zone': 'matchup_zone', 'Press': 'press', 'Junk / Special': 'junk_special',
};
const OPP_POSITIONS_HOME = ['Point Guard', 'Combo Guard', 'Wing', 'Forward', 'Big'] as const;
const OPP_EXTRA_NAMES_HOME = ['J. Williams', 'D. Harris', 'M. Johnson', 'T. Davis', 'K. Robinson', 'C. Taylor', 'R. Clark', 'A. Moore'];
const OPP_CLUSTER_MAP_HOME: Record<string, keyof import('@/data/roster-data').ClusterRatings> = {
  'Shooting': 'shooting', 'Finishing': 'finishing', 'Playmaking': 'playmaking',
  'OB Defense': 'on_ball_defense', 'Team Defense': 'team_defense', 'Rebounding': 'rebounding', 'Physical': 'physical',
};
function buildOpponentDepthChart(pregame: PregameSnapshot) {
  type CR = import('@/data/roster-data').ClusterRatings;
  const teamClusters: CR = { shooting: 60, finishing: 60, playmaking: 60, on_ball_defense: 60, team_defense: 60, rebounding: 60, physical: 60 };
  for (const cr of pregame.clusterRatings) { const key = OPP_CLUSTER_MAP_HOME[cr.cluster]; if (key) teamClusters[key] = cr.rating; }
  const threats = pregame.oppThreats.slice(0, 3);
  const playerClusters: Record<string, CR> = {};
  const playerPhysicals: Record<string, { height: string; weight: number }> = {};
  const depthChart: { position: string; players: any[] }[] = [];
  const POS_HT = [74, 75, 78, 80, 82], POS_WT = [180, 190, 205, 220, 240];
  for (let i = 0; i < 5; i++) {
    const pos = OPP_POSITIONS_HOME[i]; const t = threats[i]; const sn = `${i+1}`; const bn = `${i+6}`;
    const name = t?.name ?? OPP_EXTRA_NAMES_HOME[i % 8]; const kr = t?.kr ?? pregame.oppKR - i*2;
    const arch = t ? (OPP_ARCHETYPE_MAP_HOME[t.archetype] ?? 'two_way_wing') : 'two_way_wing';
    const v = (i*7+3)%11-5;
    const sc: CR = { shooting: Math.max(20,Math.min(98,teamClusters.shooting+v)), finishing: Math.max(20,Math.min(98,teamClusters.finishing-v+2)), playmaking: Math.max(20,Math.min(98,teamClusters.playmaking+(i<2?8:-4))), on_ball_defense: Math.max(20,Math.min(98,teamClusters.on_ball_defense+v-1)), team_defense: Math.max(20,Math.min(98,teamClusters.team_defense+(i>=3?6:-3))), rebounding: Math.max(20,Math.min(98,teamClusters.rebounding+(i>=3?5:-2))), physical: Math.max(20,Math.min(98,teamClusters.physical+(i>=3?7:-3))) };
    playerClusters[sn] = sc;
    const bc: CR = { shooting: Math.max(20,sc.shooting-8), finishing: Math.max(20,sc.finishing-6), playmaking: Math.max(20,sc.playmaking-7), on_ball_defense: Math.max(20,sc.on_ball_defense-5), team_defense: Math.max(20,sc.team_defense-6), rebounding: Math.max(20,sc.rebounding-5), physical: Math.max(20,sc.physical-4) };
    playerClusters[bn] = bc;
    const hi = POS_HT[i]+((i*3+1)%5)-2; const hf = Math.floor(hi/12); const hr = hi%12;
    playerPhysicals[sn] = { height: `${hf}-${hr}`, weight: POS_WT[i]+((i*7)%15)-5 };
    playerPhysicals[bn] = { height: `${hf}-${Math.max(0,hr-1)}`, weight: POS_WT[i]-10+((i*5)%10) };
    depthChart.push({ position: pos, players: [
      { name, number: sn, kr, minutes: 28-i, archetypes: [arch], roleDefinition: '', coachNote: '' },
      { name: OPP_EXTRA_NAMES_HOME[(i+3)%8], number: bn, kr: Math.max(40,kr-10), minutes: 12+i, archetypes: ['two_way_wing'], roleDefinition: '', coachNote: '' },
    ]});
  }
  return { depthChart, playerClusters, playerPhysicals };
}
function parseDNASystems(dna: string[]): { off: OffensiveStyle; def: DefensiveStyle; tempo: string } {
  let off: OffensiveStyle = 'motion_read_react'; let def: DefensiveStyle = 'containment_man'; let tempo = 'Moderate';
  for (const line of dna) {
    if (line.startsWith('Offense: ')) off = DNA_OFF_MAP_HOME[line.replace('Offense: ', '')] ?? off;
    else if (line.startsWith('Defense: ')) def = DNA_DEF_MAP_HOME[line.replace('Defense: ', '')] ?? def;
    else if (line.startsWith('Tempo: ')) tempo = line.replace('Tempo: ', '');
  }
  return { off, def, tempo };
}

function SportsHome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const membershipId = useMembershipId();

  // RBAC + PagerView
  const sportsRole = getSportsRole(membershipId);
  const pagerRef = useRef<PagerView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [drillDown, setDrillDown] = useState<DrillDownId | null>(null);

  const visibleCards = useMemo(() => {
    const hidden = DOMAIN_HIDDEN[sportsRole];
    return DOMAIN_CARD_DEFS.filter(c => !hidden.has(c.id));
  }, [sportsRole]);

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  // Reset to dashboard overview
  const resetToHome = useCallback(() => {
    setDrillDown(null);
    setActiveIndex(0);
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

  // Commerce sheets
  const [ticketsVisible, setTicketsVisible] = useState(false);
  const [storeVisible, setStoreVisible] = useState(false);
  const [supportVisible, setSupportVisible] = useState(false);

  // Upcoming home games (for tickets card)
  const upcomingHomeGames = useMemo(() => KaNeXT_GAMES.filter(g => g.location === 'Home' && g.status === 'upcoming'), []);
  const nextHomeGame = upcomingHomeGames[0];

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

  // Drill-down back label
  const drillLabel = drillDown ? DOMAIN_CARD_DEFS.find(c => c.id === drillDown)?.title ?? '' : '';

  return (
    <View style={styles.sportsHomeContainer}>
      {drillDown ? (
        drillDown === 'game-plan' ? (
          <GamePlanPage onBack={() => setDrillDown(null)} />
        ) : drillDown === 'simulation' ? (
          <SimulationPage onBack={() => setDrillDown(null)} />
        ) : drillDown === 'development' ? (
          <DevelopmentPage onBack={() => setDrillDown(null)} />
        ) : drillDown === 'stats' ? (
          <StatisticsPage onBack={() => setDrillDown(null)} />
        ) : drillDown === 'alerts' ? (
          <AlertsPage onBack={() => setDrillDown(null)} />
        ) : (
          <>
            {/* ===== DRILL-DOWN BACK BAR ===== */}
            <Pressable
              style={styles.drillBackBar}
              onPress={() => setDrillDown(null)}
              accessibilityRole="button"
              accessibilityLabel={`Back to Dashboard`}
            >
              <IconSymbol name="chevron.left" size={18} color={accent} />
              <Text style={[styles.drillBackText, { color: accent }]}>Dashboard</Text>
              <Text style={[styles.drillBackTitle, { color: colors.text }]}>{drillLabel}</Text>
            </Pressable>

            {/* ===== DRILL-DOWN DETAIL ===== */}
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8 }}>Coming Soon</Text>
              <Text style={{ fontSize: 14, color: '#A1A1AA', textAlign: 'center', paddingHorizontal: 40 }}>
                {drillLabel} is under development.
              </Text>
            </View>
          </>
        )
      ) : (
        <>
          {/* ===== TAB BAR ===== */}
          <PagedTabBar
            tabs={HOME_TABS}
            activeIndex={activeIndex}
            onTabPress={handleTabPress}
            accentColor={MODE_ACCENT.sports}
          />

          {/* ===== SWIPEABLE CONTENT ===== */}
          <EdgeHoldAdvance activeIndex={activeIndex} tabCount={HOME_TABS.length} onAdvance={handleTabPress} wrap>
            <PagerView
              ref={pagerRef}
              style={{ flex: 1 }}
              initialPage={0}
              onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
            >
              {/* Dashboard */}
              <View key="dashboard" style={{ flex: 1 }}>
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                  {/* ===== BLOCK 1 — VIDEO HERO ===== */}
                  {(() => {
                    const liveGame = KaNeXT_GAMES.find(g => g.status === 'live');
                    // Determine hero context: live → upcoming (within 3 days) → last game recap → film fallback
                    let heroTitle = '';
                    let heroSubtitle = '';
                    let heroBadge = '';
                    let badgeColor = accent;
                    let badgePulse = false;

                    if (liveGame) {
                      heroTitle = `Carroll vs ${liveGame.opponent}`;
                      heroSubtitle = `LIVE · ${liveGame.clock ?? ''} · Carroll ${liveGame.score ?? ''}`;
                      heroBadge = 'LIVE';
                      badgeColor = '#EF4444';
                      badgePulse = true;
                    } else if (KaNeXT_NEXT_GAME) {
                      heroTitle = `Carroll vs ${KaNeXT_NEXT_GAME.opponent}`;
                      const loc = KaNeXT_NEXT_GAME.location === 'Home' ? 'Home' : 'Away';
                      heroSubtitle = `${KaNeXT_NEXT_GAME.date} · ${loc} · Conference Matchup`;
                      heroBadge = 'NEXT';
                      badgeColor = accent;
                    } else if (KaNeXT_LAST_GAME) {
                      const wl = KaNeXT_LAST_GAME.result === 'W' ? 'W' : 'L';
                      heroTitle = `Carroll vs ${KaNeXT_LAST_GAME.opponent}`;
                      heroSubtitle = `Final · ${wl} ${KaNeXT_LAST_GAME.score} · Full Game Recap`;
                      heroBadge = 'RECAP';
                      badgeColor = '#A1A1AA';
                    } else {
                      heroTitle = 'Practice Film — Defensive Rotations';
                      heroSubtitle = 'Film Room · Season Review';
                      heroBadge = 'FILM';
                      badgeColor = accent;
                    }

                    return (
                      <View style={styles.videoHero}>
                        <LinearGradient
                          colors={['#0B0F14', '#0B0F14', '#0B0F14']}
                          style={styles.heroGradient}
                        >
                          {/* Play Button */}
                          <Pressable style={styles.heroPlayButton}>
                            <IconSymbol name="play.circle.fill" size={56} color="rgba(255,255,255,0.7)" />
                          </Pressable>

                          {/* Badge */}
                          <View style={[styles.heroBadge, { backgroundColor: badgeColor }]}>
                            {badgePulse && <View style={styles.heroBadgeDot} />}
                            <Text style={styles.heroBadgeText}>{heroBadge}</Text>
                          </View>

                          {/* Text block at bottom */}
                          <View style={styles.heroTextBlock}>
                            <ThemedText style={styles.heroTitle} numberOfLines={2}>
                              {heroTitle}
                            </ThemedText>
                            <ThemedText style={styles.heroSubtitle} numberOfLines={2}>
                              {heroSubtitle}
                            </ThemedText>
                          </View>
                        </LinearGradient>
                      </View>
                    );
                  })()}

                  {/* ===== BLOCK 2 — NEXT GAME BLOCK (dark card) ===== */}
                  {(() => {
                    // When season is complete, show tournament TBD
                    const isTBD = !KaNeXT_NEXT_GAME;
                    const nextGame = (!isTBD && KaNeXT_NEXT_GAME_ID) ? KaNeXT_GAMES_BY_ID[KaNeXT_NEXT_GAME_ID] : null;
                    const oppName = isTBD ? 'TBD' : KaNeXT_NEXT_GAME!.opponent;
                    const oppHue = confHash(oppName) % 360;
                    const oppInitials = isTBD ? '?' : oppName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                    const pregame = (!isTBD && KaNeXT_NEXT_GAME_ID) ? KaNeXT_PREGAME[KaNeXT_NEXT_GAME_ID] : null;
                    const oppKR = pregame?.oppKR ?? nextGame?.opponentKR ?? 0;
                    const krGap = pregame?.krGap ?? 0;
                    const winPct = isTBD ? 0 : Math.min(92, Math.max(28, Math.round(50 + krGap * 0.8)));
                    const winColor = winPct >= 60 ? '#22C55E' : winPct >= 45 ? '#F59E0B' : '#EF4444';
                    const gameTypeLabel = isTBD ? 'TOURNAMENT' : (nextGame?.gameType ?? 'NON-CONF');
                    const gameTypeColor = isTBD ? accent : gameTypeLabel === 'CONF' ? accent : '#A1A1AA';
                    const gameTypeBg = isTBD ? `${accent}22` : gameTypeLabel === 'CONF' ? `${accent}22` : '#52525B22';
                    const oppRecord = isTBD ? '' : (nextGame?.opponentRecord ?? '');
                    const oppConf = isTBD ? '' : 'Frontier Conference';
                    const dateLine = isTBD
                      ? 'NAA Conference Tournament · TBD'
                      : `${nextGame?.date ?? KaNeXT_NEXT_GAME!.date} · ${nextGame?.gameTime ?? ''} · ${nextGame?.venue ?? KaNeXT_NEXT_GAME!.location}`;
                    return (
                      <Pressable
                        onPress={() => { setDrillDown('game-plan'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                        style={({ pressed }) => [styles.ngBlock, pressed && { opacity: 0.85 }]}
                      >
                        <View style={styles.ngBlockAccent} />
                        <View style={styles.ngBlockBody}>
                          {/* Label */}
                          <Text style={styles.ngLabel}>{isTBD ? 'POSTSEASON' : 'NEXT GAME'}</Text>

                          {/* Teams row */}
                          <View style={styles.ngTeamsRow}>
                            <View style={styles.ngTeamSide}>
                              <Image source={KaNeXT_LOGO} style={styles.ngLogo} />
                              <Text style={styles.ngTeamName} numberOfLines={1}>FL Memorial</Text>
                              <Text style={styles.ngTeamRecord}>{KaNeXT_RECORD.overall}</Text>
                            </View>

                            <Text style={styles.ngVsText}>vs</Text>

                            {isTBD ? (
                              <View style={styles.ngTeamSide}>
                                <View style={[styles.ngOppCircle, { backgroundColor: '#333' }]}>
                                  <Text style={styles.ngOppInitials}>?</Text>
                                </View>
                                <Text style={styles.ngTeamName}>TBD</Text>
                                <Text style={styles.ngTeamRecord}>Opponent TBD</Text>
                              </View>
                            ) : (
                              <Pressable
                                style={styles.ngTeamSide}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  openTeamCard({
                                    name: oppName,
                                    record: oppRecord,
                                    conference: oppConf,
                                    teamKR: oppKR,
                                  });
                                }}
                              >
                                <View style={[styles.ngOppCircle, { backgroundColor: `hsl(${oppHue}, 50%, 35%)` }]}>
                                  <Text style={styles.ngOppInitials}>{oppInitials}</Text>
                                </View>
                                <Text style={styles.ngTeamName} numberOfLines={1}>{oppName}</Text>
                                <Text style={styles.ngTeamRecord}>{oppRecord}{oppConf ? ` · ${oppConf}` : ''}</Text>
                              </Pressable>
                            )}
                          </View>

                          {/* Date / time / venue */}
                          <Text style={styles.ngInfoLine}>{dateLine}</Text>

                          {/* Pill row */}
                          <View style={styles.ngPillRow}>
                            <View style={[styles.ngPill, { backgroundColor: gameTypeBg }]}>
                              <Text style={[styles.ngPillText, { color: gameTypeColor }]}>{gameTypeLabel}</Text>
                            </View>
                            {!isTBD && (
                              <>
                                <View style={[styles.ngPill, { backgroundColor: `${getKRColor(oppKR)}22` }]}>
                                  <Text style={[styles.ngPillText, { color: getKRColor(oppKR) }]}>KR {oppKR}</Text>
                                  <View style={[styles.ngPillDot, { backgroundColor: getKRColor(oppKR) }]} />
                                </View>
                                <View style={[styles.ngPill, { backgroundColor: `${winColor}22` }]}>
                                  <Text style={[styles.ngPillText, { color: winColor }]}>WIN {winPct}%</Text>
                                  <View style={[styles.ngPillDot, { backgroundColor: winColor }]} />
                                </View>
                              </>
                            )}
                          </View>

                          {/* Action buttons */}
                          <View style={styles.ngActionsRow}>
                            <Pressable
                              style={styles.ngActionBtn}
                              onPress={(e) => { e.stopPropagation(); setTicketsVisible(true); }}
                            >
                              <Text style={styles.ngActionBtnText}>Buy Tickets</Text>
                            </Pressable>
                            <Pressable
                              style={styles.ngActionBtn}
                              onPress={(e) => { e.stopPropagation(); console.log('Watch / Live Stats'); }}
                            >
                              <Text style={styles.ngActionBtnText}>Watch</Text>
                            </Pressable>
                            <Pressable
                              style={[styles.ngActionBtn, styles.ngActionBtnPrimary]}
                              onPress={(e) => { e.stopPropagation(); setDrillDown('game-plan'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                            >
                              <Text style={[styles.ngActionBtnText, { color: '#fff' }]}>Game Plan</Text>
                            </Pressable>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })()}

                  {/* ===== BLOCK 3 — COMMERCE ROW ===== */}
                  <View style={styles.commerceRow}>
                    <Pressable style={[styles.commerceCard, { backgroundColor: colors.card, borderTopColor: MODE_ACCENT.sports }]} onPress={() => setTicketsVisible(true)}>
                      <Text style={[styles.commerceTitle, { color: colors.text }]}>Tickets</Text>
                      <Text style={[styles.commerceDetail, { color: colors.textSecondary }]} numberOfLines={1}>
                        {nextHomeGame ? `vs ${nextHomeGame.opponent.length > 12 ? nextHomeGame.opponent.slice(0, 12) + '…' : nextHomeGame.opponent} · ${nextHomeGame.date}` : 'No upcoming games'}
                      </Text>
                      {upcomingHomeGames.length > 0 && (
                        <Text style={[styles.commerceSubtext, { color: colors.textTertiary }]}>
                          {upcomingHomeGames.length} home game{upcomingHomeGames.length !== 1 ? 's' : ''} left
                        </Text>
                      )}
                    </Pressable>
                    <Pressable style={[styles.commerceCard, { backgroundColor: colors.card, borderTopColor: MODE_ACCENT.sports }]} onPress={() => setStoreVisible(true)}>
                      <Text style={[styles.commerceTitle, { color: colors.text }]}>Store</Text>
                      <Text style={[styles.commerceDetail, { color: colors.textSecondary }]} numberOfLines={1}>Official Saints Gear</Text>
                    </Pressable>
                    <Pressable style={[styles.commerceCard, { backgroundColor: colors.card, borderTopColor: MODE_ACCENT.sports }]} onPress={() => setSupportVisible(true)}>
                      <Text style={[styles.commerceTitle, { color: colors.text }]}>Support</Text>
                      <Text style={[styles.commerceDetail, { color: colors.textSecondary }]} numberOfLines={1}>Back the Fighting Saints</Text>
                    </Pressable>
                  </View>

                  {/* ===== BLOCK 4 — TEAM SNAPSHOT ===== */}
                  <Pressable
                    onPress={() => { openTeamSheet(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                    style={({ pressed }) => [styles.snapshotCard, pressed && { opacity: 0.85 }]}
                  >
                    <View style={styles.snapshotRow}>
                      <View style={styles.snapshotKRBlock}>
                        <Text style={styles.snapshotKRLabel}>TEAM KR</Text>
                        <Text style={[styles.snapshotKRValue, { color: getKRColor(liveTeamKR) }]}>{liveTeamKR}</Text>
                      </View>
                      <View style={{ flex: 1, gap: 6 }}>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <View style={styles.snapshotPill}>
                            <Text style={styles.snapshotPillLabel}>OFF</Text>
                            <Text style={[styles.snapshotPillValue, { color: getKRColor(liveOffKR) }]}>{liveOffKR}</Text>
                          </View>
                          <View style={styles.snapshotPill}>
                            <Text style={styles.snapshotPillLabel}>DEF</Text>
                            <Text style={[styles.snapshotPillValue, { color: getKRColor(liveDefKR) }]}>{liveDefKR}</Text>
                          </View>
                        </View>
                        <Text style={styles.snapshotSystem} numberOfLines={1}>
                          {selectedOffSystem} / {selectedDefSystem}
                        </Text>
                        <Text style={styles.snapshotRecord}>
                          {KaNeXT_RECORD.overall} · {KaNeXT_RECORD.conference} conf
                        </Text>
                      </View>
                      <IconSymbol name="chevron.right" size={14} color="rgba(255,255,255,0.4)" />
                    </View>
                  </Pressable>

                  {/* ===== BLOCK 5 — DOMAIN GRID (2×3) ===== */}
                  <View style={styles.domainGrid}>
                    {visibleCards.map(card => (
                      <Pressable
                        key={card.id}
                        onPress={() => {
                          if (card.id === 'recruiting') {
                            pagerRef.current?.setPage(3);
                          } else {
                            setDrillDown(card.id);
                          }
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={({ pressed }) => [
                          styles.domainGridCard,
                          { backgroundColor: colors.card, borderColor: colors.border, width: (Dimensions.get('window').width - Spacing.md * 2 - 10) / 2 },
                          pressed && { opacity: 0.7 },
                        ]}
                      >
                        <View style={[styles.domainGridIcon, { backgroundColor: `${accent}18` }]}>
                          <IconSymbol name={card.icon} size={16} color={accent} />
                        </View>
                        <Text style={[styles.domainGridTitle, { color: colors.text }]} numberOfLines={1}>{card.title}</Text>
                        <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Roster */}
              <View key="roster" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8 }}>Coming Soon</Text>
                <Text style={{ fontSize: 14, color: '#A1A1AA', textAlign: 'center', paddingHorizontal: 40 }}>Roster is under development.</Text>
              </View>

              {/* Calendar */}
              <View key="calendar" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8 }}>Coming Soon</Text>
                <Text style={{ fontSize: 14, color: '#A1A1AA', textAlign: 'center', paddingHorizontal: 40 }}>Schedule is under development.</Text>
              </View>

              {/* Recruiting */}
              <View key="recruiting" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8 }}>Coming Soon</Text>
                <Text style={{ fontSize: 14, color: '#A1A1AA', textAlign: 'center', paddingHorizontal: 40 }}>Recruiting is under development.</Text>
              </View>
            </PagerView>
          </EdgeHoldAdvance>
        </>
      )}

      {/* KR Details Bottom Sheet */}
      <KRDetailsSheet
        visible={krSheetVisible}
        onClose={() => setKrSheetVisible(false)}
      />

      {/* Recent BPR Bottom Sheet */}
      <BottomSheet visible={!!recentSheet} onClose={closeRecentSheet} >
        {recentSheet && (() => {
          const opp = recentSheet.opponent;
          const recentImpact = recentSheet.gameStatus === 'final' && recentSheet.gameId ? KaNeXT_GAME_IMPACT[recentSheet.gameId] : null;
          const recentPregame = recentSheet.gameStatus === 'upcoming' && recentSheet.gameId ? KaNeXT_PREGAME[recentSheet.gameId] : null;
          return (
            <>
                {/* Header */}
                {(() => {
                  const recentGame = recentSheet.gameId ? KaNeXT_GAMES.find((g) => g.id === recentSheet.gameId) : null;
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
                        const pg = recentSheet.gameId ? KaNeXT_PREGAME[recentSheet.gameId] : null;
                        const sm = recentSheet.score?.match(/(\d+)-(\d+)/);
                        const fmuS = sm ? parseInt(sm[1]) : 0;
                        const oppS = sm ? parseInt(sm[2]) : 0;
                        const isW = fmuS > oppS;
                        const actualMargin = fmuS - oppS;
                        const actualTotal = fmuS + oppS;
                        const spread = pg ? Math.round(pg.krGap * 0.4) : 0;
                        const spreadStr = spread > 0 ? `Carroll -${Math.abs(spread)}.5` : spread < 0 ? `Carroll +${Math.abs(spread)}.5` : 'PK';
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
                          <View style={{ marginHorizontal: Spacing.lg, marginBottom: Spacing.md, backgroundColor: '#0B0F14', borderRadius: BorderRadius.lg, padding: Spacing.md }}>
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
                            <View style={{ backgroundColor: '#0B0F14', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 10 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: atsCover ? '#22C55E' : '#EF4444' }}>ATS: {atsStr}</Text>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: actualTotal > preTotal + 0.5 ? accent : accent }}>O/U: {ouStr}</Text>
                              </View>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                              <Text style={{ fontSize: 11, color: '#888' }}>Pre Proj: <Text style={{ fontWeight: '700', color: '#ccc' }}>{fmuProj}–{oppProj} ({projMargin > 0 ? '+' : ''}{projMargin})</Text></Text>
                              <Text style={{ fontSize: 11, color: '#888' }}>Actual: <Text style={{ fontWeight: '700', color: isW ? '#22C55E' : '#EF4444' }}>{fmuS}–{oppS} ({actualMargin > 0 ? '+' : ''}{actualMargin})</Text></Text>
                            </View>
                            <Text style={{ fontSize: 11, color: '#888' }}>Miss: <Text style={{ fontWeight: '700', color: Math.abs(miss) <= 3 ? '#22C55E' : Math.abs(miss) <= 7 ? accent : '#EF4444' }}>{miss > 0 ? '+' : ''}{miss} pts</Text></Text>
                            <Text style={{ fontSize: 10, color: '#666', marginTop: 6, lineHeight: 14 }}>
                              {isW === (projMargin > 0) ? 'Model called it correctly' : `Model favored ${projMargin > 0 ? 'Carroll' : 'opponent'}`}; missed by {Math.abs(miss)} pts.
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
                        const spreadStr = spread > 0 ? `Carroll -${Math.abs(spread)}.5` : spread < 0 ? `Carroll +${Math.abs(spread)}.5` : 'PK';
                        const winPct = Math.min(92, Math.max(28, Math.round(50 + recentPregame.krGap * 0.8)));
                        const fmuProj = Math.round(72 + (ourKR - 60) * 0.3);
                        const oppProj = Math.round(72 + (recentPregame.oppKR - 60) * 0.3);
                        const simConf = Math.min(95, Math.max(55, Math.round(70 + Math.abs(recentPregame.krGap) * 0.6)));
                        const keys = (recentPregame.ourEdge ?? []).slice(0, 3);
                        return (
                          <View style={{ marginHorizontal: Spacing.lg, marginBottom: Spacing.md, backgroundColor: '#0B0F14', borderRadius: BorderRadius.lg, padding: Spacing.md }}>
                            {/* Gambling-level metrics row */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                              <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>LINE</Text>
                                <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>{spreadStr}</Text>
                              </View>
                              <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>WIN%</Text>
                                <Text style={{ fontSize: 14, fontWeight: '800', color: winPct >= 60 ? '#22C55E' : winPct <= 40 ? '#EF4444' : accent }}>{winPct}%</Text>
                              </View>
                              <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>TOTAL</Text>
                                <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>{fmuProj + oppProj}.5</Text>
                              </View>
                              <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>CONF</Text>
                                <View style={{ backgroundColor: `${accent}20`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                                  <Text style={{ fontSize: 13, fontWeight: '800', color: accent }}>Sim {simConf}%</Text>
                                </View>
                              </View>
                            </View>
                            {/* Projection strip */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0F14', borderRadius: 8, paddingVertical: 6, marginBottom: 10 }}>
                              <Text style={{ fontSize: 15, fontWeight: '800', color: fmuProj >= oppProj ? '#22C55E' : '#EF4444' }}>{fmuProj >= oppProj ? 'W' : 'L'} {fmuProj}–{oppProj}</Text>
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

      {/* ===== TEAM SHEET (universal) ===== */}
      <LocalTeamSheet
        visible={teamSheetOpen}
        onClose={closeTeamSheet}
        data={{
          name: 'Carroll College',
          conference: 'Frontier Conference',
          level: 'NAIA',
          teamKR: liveTeamKR,
          offKR: liveOffKR,
          defKR: liveDefKR,
          record: KaNeXT_RECORD.overall,
          confRecord: KaNeXT_RECORD.conference,
          osie: selectedOffSystem,
          dsie: selectedDefSystem,
        }}
      />

      {/* ===== COMMERCE SHEETS ===== */}
      <TicketsSheet visible={ticketsVisible} onClose={() => setTicketsVisible(false)} colors={colors} />
      <StoreSheet visible={storeVisible} onClose={() => setStoreVisible(false)} colors={colors} />
      <SupportSheet visible={supportVisible} onClose={() => setSupportVisible(false)} colors={colors} />
    </View>
  );
}

// =============================================================================
// MODE SELECTOR
// =============================================================================

const MODE_OPTIONS: { mode: Mode; label: string }[] = [
  { mode: 'sports', label: 'Athletics' },
  { mode: 'competition', label: 'Competition' },
  { mode: 'church', label: 'Church' },
  { mode: 'education', label: 'Education' },
  { mode: 'business', label: 'Business' },
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

  // Sports — full dashboard
  if (mode === 'sports') {
    return <SportsHome />;
  }

  // Competition — coming soon
  if (mode === 'competition') {
    return <ComingSoonPage mode="competition" />;
  }

  // Business — empty shell
  if (mode === 'business') {
    return (
      <ThemedView style={styles.container}>
        <EmptyModeShell tabs={BUSINESS_HOME_TABS} />
      </ThemedView>
    );
  }

  // Church — empty shell
  if (mode === 'church') {
    return (
      <ThemedView style={styles.container}>
        <EmptyModeShell tabs={CHURCH_HOME_TABS} />
      </ThemedView>
    );
  }

  // Education — coming soon
  if (mode === 'education') {
    return <ComingSoonPage mode="education" />;
  }

  // Fallback — empty shell
  return (
    <ThemedView style={styles.container}>
      <EmptyModeShell tabs={SPORTS_HOME_TABS} />
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Sports Home
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

  // Drill-Down Back Bar
  drillBackBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 4,
  },
  drillBackText: {
    fontSize: 15,
    fontWeight: '600',
  },
  drillBackTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 'auto',
  },

  // Command Strip KPI Chips
  kpiChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 110,
    gap: 2,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  kpiSub: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Domain Section Cards
  domainCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
  domainCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  domainCardIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  domainCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    flex: 1,
  },
  domainCardPreview: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    paddingLeft: 40,
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
  pulseChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#2F3336' },
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
    borderColor: '#2F3336',
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

  // Video Hero
  videoHero: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  heroGradient: {
    aspectRatio: 16 / 9,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 20,
  },
  heroPlayButton: {
    position: 'absolute',
    top: '35%',
  },
  heroBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  heroTextBlock: {
    width: '100%',
    alignItems: 'center',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    textAlign: 'center',
  },

  // Next Game Block (dark card)
  ngBlock: {
    backgroundColor: '#0B0F14',
    borderRadius: 12,
    overflow: 'hidden' as const,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  ngBlockAccent: {
    height: 3,
    backgroundColor: '#1D9BF0',
  },
  ngBlockBody: {
    padding: 14,
  },
  ngLabel: {
    color: '#1D9BF0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  ngTeamsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
  },
  ngTeamSide: {
    alignItems: 'center' as const,
    gap: 4,
    flex: 1,
  },
  ngLogo: {
    width: 44,
    height: 44,
    resizeMode: 'contain' as const,
  },
  ngTeamName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center' as const,
    letterSpacing: -0.2,
  },
  ngTeamRecord: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center' as const,
  },
  ngVsText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 14,
    fontWeight: '700',
  },
  ngOppCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  ngOppInitials: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  ngInfoLine: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  ngPillRow: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    gap: 8,
    marginTop: 4,
  },
  ngPill: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  ngPillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ngPillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  ngActionsRow: {
    flexDirection: 'row' as const,
    gap: 8,
    marginTop: 12,
  },
  ngActionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  ngActionBtnText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  ngActionBtnPrimary: {
    backgroundColor: '#1D9BF0',
    borderColor: '#1D9BF0',
  },

  // Commerce Row
  commerceRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  commerceCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.lg,
    borderTopWidth: 2,
    gap: 3,
  },
  commerceTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  commerceDetail: {
    fontSize: 11,
    fontWeight: '500',
  },
  commerceSubtext: {
    fontSize: 10,
    fontWeight: '500',
  },

  // Rich Statistics Card
  statsRichRecord: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
  },
  statsRichConf: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  statsPreviewRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  statsPreviewPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#2F3336',
    alignItems: 'center',
  },
  statsPreviewPillLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 0.3,
  },
  statsPreviewPillValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 1,
  },
  statsLast5Row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  statsLast5Label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginRight: 2,
  },
  statsLast5Dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // Rich Domain Cards (Game Plan, Simulation, Development)
  richCardHeadline: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  richCardSubline: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  richCardSystemLine: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 6,
  },
  richCardAlert: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },

  // Team Snapshot Card (Block 4)
  snapshotCard: {
    backgroundColor: '#0B0F14',
    borderRadius: 14,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  snapshotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  snapshotKRBlock: {
    alignItems: 'center',
    gap: 2,
  },
  snapshotKRLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 0.5,
  },
  snapshotKRValue: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1.5,
    lineHeight: 40,
  },
  snapshotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2F3336',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  snapshotPillLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 0.3,
  },
  snapshotPillValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  snapshotSystem: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
  },
  snapshotRecord: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },

  // Domain Grid (Block 5 — 2×3)
  domainGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  domainGridCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  domainGridIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  domainGridTitle: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },

  // Coming Soon
  comingSoonBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  comingSoonLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  comingSoonTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 40,
    marginBottom: 12,
  },
  comingSoonSubtitle: {
    fontSize: 15,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 22,
  },

});
