## Section E: Dashboards (one per mode)

### E1. Sports Dashboard -- app/(tabs)/index.tsx

(Note: same file as A3 -- included again here for reviewer convenience)

```typescript
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
import { useAppContext, useMode, useMembershipId } from '@/context/app-context';
import type { Mode, OffensiveStyle, DefensiveStyle } from '@/types';
import { RECRUITING_BOARD } from '@/data/recruitingBoard';
import { openTeamCard } from '@/utils/global-entity-sheets';

// Mock data imports (other modes)

// FMU data
import { FMU_GAMES, FMU_GAMES_BY_ID, FMU_LEADERS, FMU_STANDINGS, FMU_NEWS, FMU_RECORD, FMU_LAST_GAME, FMU_LAST_GAME_ID, FMU_NEXT_GAME, FMU_NEXT_GAME_ID, FMU_SEASON_COMPLETE, FMU_GAME_BPR, getBPRColor, FMU_GAME_IMPACT, getPGISColor, getTGISColor, tgisToDisplay, FMU_PREGAME, ROSTER_KR, DNA_OFFENSE_POOL, DNA_DEFENSE_POOL, DNA_TEMPO_POOL, jerseyArchetypeMap, POSITIVE_IMPACT, NEGATIVE_IMPACT, type PregameSnapshot, type ClusterRating } from '@/data/fmu';
import { TeamQuickSheet } from '@/components/team-quick-sheet';
import { consumeHomeReset, registerHomeResetCallback } from '@/utils/global-home';
import { getSportsRole, type SportsRoleLens } from '@/utils/sports-rbac';
import { registerTeamSheetHandlers } from '@/utils/global-team-sheet';
import { SportsGamePlanV2 } from '@/components/game-plan/sports-game-plan-v2';
import { SportsCalendarV2 } from '@/components/calendar/sports-calendar-v2';
import { SportsStatsV2 } from '@/components/stats/sports-stats-v2';
import { TEAM_IDENTITY as STATS_TEAM_IDENTITY, TEAM_AVERAGES as STATS_TEAM_AVERAGES, LAST_5 as STATS_LAST_5 } from '@/data/mock-stats-v2';
import { SportsSimulationV2 } from '@/components/simulation/sports-simulation-v2';
import { SportsDevelopmentV2 } from '@/components/development/sports-development-v2';
import { GAME_PLANS } from '@/data/mock-game-plan-v2';
import { MOCK_KEISER_GAME } from '@/data/mock-simulation-v2';
import { PROGRESS_SNAPSHOT, PLAYER_PLANS, WEEKLY_PLANS, EVIDENCE_QUEUE_EXTENDED, TRANSFER_METRICS } from '@/data/mock-development-v2';
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

// =============================================================================
// SPORTS HOME (v1.1 Spec - Team Hub Home / Coach HQ)
// Mental model: Video-game hub for a coach.
// NOT a SaaS dashboard. NOT a chatbot entry point.
// Shows: state, identity, and motion — nothing else.
// =============================================================================

// Sports Home — 4-tab PagerView layout (Dashboard + Roster + Calendar + Recruiting)
type DrillDownId = 'stats' | 'game-plan' | 'simulation' | 'development' | 'alerts';

const HOME_TABS: { id: string; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'roster', label: 'Roster' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'recruiting', label: 'Recruiting' },
];

// Domain section cards shown on Dashboard pill (5 remaining after roster/recruiting promoted)
const DOMAIN_CARD_DEFS: { id: DrillDownId; title: string; icon: IconSymbolName }[] = [
  { id: 'stats', title: 'Statistics', icon: 'chart.bar.fill' },
  { id: 'game-plan', title: 'Game Plan', icon: 'sportscourt.fill' },
  { id: 'simulation', title: 'Simulation', icon: 'play.circle.fill' },
  { id: 'development', title: 'Development', icon: 'arrow.up.right.circle.fill' },
  { id: 'alerts', title: 'Alerts & Decisions', icon: 'bell.badge.fill' },
];

/** RBAC: which domain cards are hidden per role */
const DOMAIN_HIDDEN: Record<SportsRoleLens, Set<DrillDownId>> = {
  R1: new Set(),
  R2: new Set(['game-plan', 'simulation', 'development']),
  R3: new Set(),
  R4: new Set(['game-plan', 'simulation', 'development']),
  R5: new Set(['game-plan', 'simulation', 'development']),
};

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
  'OB Defense': 'perimeter_defense', 'Team Defense': 'interior_defense', 'Rebounding': 'rebounding', 'Physical': 'frame',
};
function buildOpponentDepthChart(pregame: PregameSnapshot) {
  type CR = import('@/data/roster-data').ClusterRatings;
  const teamClusters: CR = { shooting: 60, finishing: 60, playmaking: 60, perimeter_defense: 60, interior_defense: 60, rebounding: 60, frame: 60 };
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
    const sc: CR = { shooting: Math.max(20,Math.min(98,teamClusters.shooting+v)), finishing: Math.max(20,Math.min(98,teamClusters.finishing-v+2)), playmaking: Math.max(20,Math.min(98,teamClusters.playmaking+(i<2?8:-4))), perimeter_defense: Math.max(20,Math.min(98,teamClusters.perimeter_defense+v-1)), interior_defense: Math.max(20,Math.min(98,teamClusters.interior_defense+(i>=3?6:-3))), rebounding: Math.max(20,Math.min(98,teamClusters.rebounding+(i>=3?5:-2))), frame: Math.max(20,Math.min(98,teamClusters.frame+(i>=3?7:-3))) };
    playerClusters[sn] = sc;
    const bc: CR = { shooting: Math.max(20,sc.shooting-8), finishing: Math.max(20,sc.finishing-6), playmaking: Math.max(20,sc.playmaking-7), perimeter_defense: Math.max(20,sc.perimeter_defense-5), interior_defense: Math.max(20,sc.interior_defense-6), rebounding: Math.max(20,sc.rebounding-5), frame: Math.max(20,sc.frame-4) };
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
  const upcomingHomeGames = useMemo(() => FMU_GAMES.filter(g => g.location === 'Home' && g.status === 'upcoming'), []);
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

  // Computed card previews
  const previews = useMemo((): Record<DrillDownId, string> => {
    const topScorer = FMU_LEADERS[0];
    const topReb = [...FMU_LEADERS].sort((a, b) => b.rpg - a.rpg)[0];
    const nextOpp = FMU_NEXT_GAME?.opponent ?? 'TBD';
    const nextPre = FMU_NEXT_GAME_ID ? FMU_PREGAME[FMU_NEXT_GAME_ID] : null;
    return {
      stats: `${topScorer?.name.split(' ').pop()} ${topScorer?.ppg} PPG · ${topReb?.name.split(' ').pop()} ${topReb?.rpg} RPG · #${FMU_CONF_POSITION} Sun Conf`,
      'game-plan': `vs ${nextOpp}${nextPre ? ` · KR ${nextPre.oppKR}` : ''}`,
      simulation: 'Season Projection: 22-8 · Tournament: 74% advance',
      development: '2 practice plans · 4 drill assignments · 3 evidence items pending',
      alerts: 'Recruiting: 2 responses due · Compliance: 1 form overdue',
    };
  }, [liveTeamKR]);

  // Drill-down back label
  const drillLabel = drillDown ? DOMAIN_CARD_DEFS.find(c => c.id === drillDown)?.title ?? '' : '';

  return (
    <View style={styles.sportsHomeContainer}>
      {drillDown ? (
        <>
          {/* ===== DRILL-DOWN BACK BAR ===== */}
          <Pressable
            style={styles.drillBackBar}
            onPress={() => setDrillDown(null)}
            accessibilityRole="button"
            accessibilityLabel={`Back to Dashboard`}
          >
            <IconSymbol name="chevron.left" size={18} color={colors.tint} />
            <Text style={[styles.drillBackText, { color: colors.tint }]}>Dashboard</Text>
            <Text style={[styles.drillBackTitle, { color: colors.text }]}>{drillLabel}</Text>
          </Pressable>

          {/* ===== DRILL-DOWN DETAIL ===== */}
          <View style={{ flex: 1 }}>
            {drillDown === 'stats' && <SportsStatsV2 />}
            {drillDown === 'game-plan' && <SportsGamePlanV2 />}
            {drillDown === 'simulation' && <SportsSimulationV2 />}
            {drillDown === 'development' && <SportsDevelopmentV2 />}
            {drillDown === 'alerts' && (
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.md, gap: Spacing.sm }}>
                <View style={[styles.domainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.domainCardTitle, { color: colors.text }]}>Alerts & Decisions Queue</Text>
                  <Text style={[styles.domainCardPreview, { color: colors.textSecondary, marginTop: 8 }]}>
                    Recruiting: 2 recruit responses due{'\n'}
                    Compliance: 1 eligibility form overdue{'\n'}
                    Travel: Away game booking approval needed{'\n'}
                    Finance: Equipment purchase request pending
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </>
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
                    const liveGame = FMU_GAMES.find(g => g.status === 'live');
                    // Determine hero context: live → upcoming (within 3 days) → last game recap → film fallback
                    let heroTitle = '';
                    let heroSubtitle = '';
                    let heroBadge = '';
                    let badgeColor = '#1E40AF';
                    let badgePulse = false;

                    if (liveGame) {
                      heroTitle = `FMU Lions vs ${liveGame.opponent}`;
                      heroSubtitle = `LIVE · ${liveGame.clock ?? ''} · FMU ${liveGame.score ?? ''}`;
                      heroBadge = 'LIVE';
                      badgeColor = '#EF4444';
                      badgePulse = true;
                    } else if (FMU_NEXT_GAME) {
                      heroTitle = `FMU Lions vs ${FMU_NEXT_GAME.opponent}`;
                      const loc = FMU_NEXT_GAME.location === 'Home' ? 'Home' : 'Away';
                      heroSubtitle = `${FMU_NEXT_GAME.date} · ${loc} · Conference Matchup`;
                      heroBadge = 'NEXT';
                      badgeColor = '#1E40AF';
                    } else if (FMU_LAST_GAME) {
                      const wl = FMU_LAST_GAME.result === 'W' ? 'W' : 'L';
                      heroTitle = `FMU Lions vs ${FMU_LAST_GAME.opponent}`;
                      heroSubtitle = `Final · ${wl} ${FMU_LAST_GAME.score} · Full Game Recap`;
                      heroBadge = 'RECAP';
                      badgeColor = '#6B7280';
                    } else {
                      heroTitle = 'Practice Film — Defensive Rotations';
                      heroSubtitle = 'Film Room · Season Review';
                      heroBadge = 'FILM';
                      badgeColor = '#7C3AED';
                    }

                    return (
                      <View style={styles.videoHero}>
                        <LinearGradient
                          colors={['#0a1628', '#162a4a', '#0a1628']}
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
                    const isTBD = !FMU_NEXT_GAME;
                    const nextGame = (!isTBD && FMU_NEXT_GAME_ID) ? FMU_GAMES_BY_ID[FMU_NEXT_GAME_ID] : null;
                    const oppName = isTBD ? 'TBD' : FMU_NEXT_GAME!.opponent;
                    const oppHue = confHash(oppName) % 360;
                    const oppInitials = isTBD ? '?' : oppName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                    const pregame = (!isTBD && FMU_NEXT_GAME_ID) ? FMU_PREGAME[FMU_NEXT_GAME_ID] : null;
                    const oppKR = pregame?.oppKR ?? nextGame?.opponentKR ?? 0;
                    const krGap = pregame?.krGap ?? 0;
                    const winPct = isTBD ? 0 : Math.min(92, Math.max(28, Math.round(50 + krGap * 0.8)));
                    const winColor = winPct >= 60 ? '#22C55E' : winPct >= 45 ? '#F59E0B' : '#EF4444';
                    const gameTypeLabel = isTBD ? 'TOURNAMENT' : (nextGame?.gameType ?? 'NON-CONF');
                    const gameTypeColor = isTBD ? '#c084fc' : gameTypeLabel === 'CONF' ? '#60a5fa' : '#a1a1aa';
                    const gameTypeBg = isTBD ? '#7c3aed22' : gameTypeLabel === 'CONF' ? '#2563eb22' : '#71717a22';
                    const oppRecord = isTBD ? '' : (nextGame?.opponentRecord ?? '');
                    const oppConf = isTBD ? '' : 'Sun Conference';
                    const dateLine = isTBD
                      ? 'NAIA National Tournament · TBD'
                      : `${nextGame?.date ?? FMU_NEXT_GAME!.date} · ${nextGame?.gameTime ?? ''} · ${nextGame?.venue ?? FMU_NEXT_GAME!.location}`;
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
                              <Image source={FMU_SEAL} style={styles.ngLogo} />
                              <Text style={styles.ngTeamName} numberOfLines={1}>FL Memorial</Text>
                              <Text style={styles.ngTeamRecord}>{FMU_RECORD.overall}</Text>
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
                      <Text style={[styles.commerceDetail, { color: colors.textSecondary }]} numberOfLines={1}>Official FMU Lions Gear</Text>
                    </Pressable>
                    <Pressable style={[styles.commerceCard, { backgroundColor: colors.card, borderTopColor: MODE_ACCENT.sports }]} onPress={() => setSupportVisible(true)}>
                      <Text style={[styles.commerceTitle, { color: colors.text }]}>Support</Text>
                      <Text style={[styles.commerceDetail, { color: colors.textSecondary }]} numberOfLines={1}>Back the Lions</Text>
                    </Pressable>
                  </View>

                  {/* ===== REMAINING DOMAIN CARDS ===== */}
                  <View style={{ paddingHorizontal: Spacing.md, gap: Spacing.sm }}>
                    {visibleCards.map(card => {
                      // Rich Statistics card
                      if (card.id === 'stats') {
                        const netRtg = STATS_TEAM_AVERAGES.netRtg;
                        return (
                          <Pressable
                            key={card.id}
                            onPress={() => { setDrillDown(card.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                            style={({ pressed }) => [
                              styles.domainCard,
                              { backgroundColor: '#181616', borderColor: colors.border, borderTopWidth: 2, borderTopColor: MODE_ACCENT.sports },
                              pressed && { opacity: 0.7 },
                            ]}
                          >
                            <View style={styles.domainCardHeader}>
                              <View style={[styles.domainCardIconWrap, { backgroundColor: `${colors.tint}18` }]}>
                                <IconSymbol name={card.icon} size={16} color={colors.tint} />
                              </View>
                              <Text style={[styles.domainCardTitle, { color: colors.text }]}>{card.title}</Text>
                              <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
                            </View>
                            {/* Record */}
                            <View style={{ paddingLeft: 40 }}>
                              <Text style={[styles.statsRichRecord, { color: colors.text }]}>{STATS_TEAM_IDENTITY.record}</Text>
                              <Text style={[styles.statsRichConf, { color: colors.textSecondary }]}>{STATS_TEAM_IDENTITY.confRecord} {STATS_TEAM_IDENTITY.conference}</Text>
                              {/* 3 Stat Pills */}
                              <View style={[styles.statsPreviewRow]}>
                                <View style={styles.statsPreviewPill}>
                                  <Text style={styles.statsPreviewPillLabel}>PPG</Text>
                                  <Text style={[styles.statsPreviewPillValue, { color: colors.text }]}>{STATS_TEAM_AVERAGES.ppg}</Text>
                                </View>
                                <View style={styles.statsPreviewPill}>
                                  <Text style={styles.statsPreviewPillLabel}>OPP</Text>
                                  <Text style={[styles.statsPreviewPillValue, { color: colors.text }]}>{STATS_TEAM_AVERAGES.oppPpg}</Text>
                                </View>
                                <View style={styles.statsPreviewPill}>
                                  <Text style={styles.statsPreviewPillLabel}>NET</Text>
                                  <Text style={[styles.statsPreviewPillValue, { color: netRtg >= 0 ? '#22c55e' : '#ef4444' }]}>
                                    {netRtg > 0 ? '+' : ''}{netRtg.toFixed(1)}
                                  </Text>
                                </View>
                              </View>
                              {/* Last 5 Dots */}
                              <View style={styles.statsLast5Row}>
                                <Text style={[styles.statsLast5Label, { color: colors.textTertiary }]}>L5</Text>
                                {STATS_LAST_5.map((g, i) => (
                                  <View key={i} style={[styles.statsLast5Dot, { backgroundColor: g.result === 'W' ? '#22c55e' : '#ef4444' }]} />
                                ))}
                              </View>
                            </View>
                          </Pressable>
                        );
                      }

                      // Rich Game Plan card
                      if (card.id === 'game-plan') {
                        const activePlan = GAME_PLANS.find((gp) => gp.header.status === 'in-review') ?? GAME_PLANS[0];
                        const gph = activePlan.header;
                        const wpRaw = gph.simWinPct;
                        const wpColor = wpRaw >= 60 ? '#22c55e' : wpRaw >= 45 ? '#F59E0B' : '#ef4444';
                        const tendencyNote = activePlan.scoutNotes.find((n) => n.category === 'tendency');
                        const oppSystem = tendencyNote?.title ?? 'Man Defense';
                        return (
                          <Pressable
                            key={card.id}
                            onPress={() => { setDrillDown(card.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                            style={({ pressed }) => [
                              styles.domainCard,
                              { backgroundColor: '#181616', borderColor: colors.border, borderTopWidth: 2, borderTopColor: MODE_ACCENT.sports },
                              pressed && { opacity: 0.7 },
                            ]}
                          >
                            <View style={styles.domainCardHeader}>
                              <View style={[styles.domainCardIconWrap, { backgroundColor: `${colors.tint}18` }]}>
                                <IconSymbol name={card.icon} size={16} color={colors.tint} />
                              </View>
                              <Text style={[styles.domainCardTitle, { color: colors.text }]}>{card.title}</Text>
                              <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
                            </View>
                            <View style={{ paddingLeft: 40 }}>
                              <Text style={[styles.richCardHeadline, { color: colors.text }]}>vs {gph.opponent}</Text>
                              <Text style={[styles.richCardSubline, { color: colors.textSecondary }]}>{gph.date} · {gph.location} · {gph.status}</Text>
                              <View style={styles.statsPreviewRow}>
                                <View style={styles.statsPreviewPill}>
                                  <Text style={styles.statsPreviewPillLabel}>WIN%</Text>
                                  <Text style={[styles.statsPreviewPillValue, { color: wpColor }]}>{wpRaw}%</Text>
                                </View>
                                <View style={styles.statsPreviewPill}>
                                  <Text style={styles.statsPreviewPillLabel}>CONF</Text>
                                  <Text style={[styles.statsPreviewPillValue, { color: colors.text }]}>{gph.simConfidence}%</Text>
                                </View>
                              </View>
                              <Text style={[styles.richCardSystemLine, { color: colors.textTertiary }]}>
                                OPP: {oppSystem}
                              </Text>
                            </View>
                          </Pressable>
                        );
                      }

                      // Rich Simulation card
                      if (card.id === 'simulation') {
                        const sim = MOCK_KEISER_GAME;
                        const wpMid = sim.win_pct.mid;
                        const wpColor = wpMid >= 60 ? '#22c55e' : wpMid >= 45 ? '#F59E0B' : '#ef4444';
                        return (
                          <Pressable
                            key={card.id}
                            onPress={() => { setDrillDown(card.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                            style={({ pressed }) => [
                              styles.domainCard,
                              { backgroundColor: '#181616', borderColor: colors.border, borderTopWidth: 2, borderTopColor: MODE_ACCENT.sports },
                              pressed && { opacity: 0.7 },
                            ]}
                          >
                            <View style={styles.domainCardHeader}>
                              <View style={[styles.domainCardIconWrap, { backgroundColor: `${colors.tint}18` }]}>
                                <IconSymbol name={card.icon} size={16} color={colors.tint} />
                              </View>
                              <Text style={[styles.domainCardTitle, { color: colors.text }]}>{card.title}</Text>
                              <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
                            </View>
                            <View style={{ paddingLeft: 40 }}>
                              <Text style={[styles.richCardHeadline, { color: colors.text }]}>vs {sim.team_b}</Text>
                              <View style={styles.statsPreviewRow}>
                                <View style={styles.statsPreviewPill}>
                                  <Text style={styles.statsPreviewPillLabel}>WIN%</Text>
                                  <Text style={[styles.statsPreviewPillValue, { color: wpColor }]}>{wpMid}%</Text>
                                </View>
                                <View style={styles.statsPreviewPill}>
                                  <Text style={styles.statsPreviewPillLabel}>MARGIN</Text>
                                  <Text style={[styles.statsPreviewPillValue, { color: colors.text }]}>+{sim.margin.mid}</Text>
                                </View>
                                <View style={styles.statsPreviewPill}>
                                  <Text style={styles.statsPreviewPillLabel}>CONF</Text>
                                  <Text style={[styles.statsPreviewPillValue, { color: colors.text }]}>{sim.sim_confidence_pct}%</Text>
                                </View>
                              </View>
                              <Text style={[styles.richCardSystemLine, { color: colors.textTertiary }]}>
                                {sim.sim_version} · Pace {sim.projected_pace}
                              </Text>
                            </View>
                          </Pressable>
                        );
                      }

                      // Rich Development card
                      if (card.id === 'development') {
                        const snap = PROGRESS_SNAPSHOT;
                        const activePlans = PLAYER_PLANS.length;
                        const pendingEvidence = EVIDENCE_QUEUE_EXTENDED.filter((e) => e.status === 'pending').length;
                        const negativeTransfers = TRANSFER_METRICS.filter((t) => t.transferLabel === 'negative').length;
                        return (
                          <Pressable
                            key={card.id}
                            onPress={() => { setDrillDown(card.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                            style={({ pressed }) => [
                              styles.domainCard,
                              { backgroundColor: '#181616', borderColor: colors.border, borderTopWidth: 2, borderTopColor: MODE_ACCENT.sports },
                              pressed && { opacity: 0.7 },
                            ]}
                          >
                            <View style={styles.domainCardHeader}>
                              <View style={[styles.domainCardIconWrap, { backgroundColor: `${colors.tint}18` }]}>
                                <IconSymbol name={card.icon} size={16} color={colors.tint} />
                              </View>
                              <Text style={[styles.domainCardTitle, { color: colors.text }]}>{card.title}</Text>
                              <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
                            </View>
                            <View style={{ paddingLeft: 40 }}>
                              <View style={styles.statsPreviewRow}>
                                <View style={styles.statsPreviewPill}>
                                  <Text style={styles.statsPreviewPillLabel}>PLANS</Text>
                                  <Text style={[styles.statsPreviewPillValue, { color: colors.text }]}>{activePlans}</Text>
                                </View>
                                <View style={styles.statsPreviewPill}>
                                  <Text style={styles.statsPreviewPillLabel}>SCORE</Text>
                                  <Text style={[styles.statsPreviewPillValue, { color: MODE_ACCENT.sports }]}>{snap.overallScore}</Text>
                                </View>
                                <View style={styles.statsPreviewPill}>
                                  <Text style={styles.statsPreviewPillLabel}>Δ WEEK</Text>
                                  <Text style={[styles.statsPreviewPillValue, { color: '#22c55e' }]}>+{snap.deltaFromLastWeek}</Text>
                                </View>
                              </View>
                              <Text style={[styles.richCardSubline, { color: colors.textSecondary, marginTop: 6 }]}>
                                {WEEKLY_PLANS[0].weekLabel} active · {pendingEvidence} evidence pending
                              </Text>
                              {negativeTransfers > 0 && (
                                <Text style={[styles.richCardAlert, { color: '#EF4444' }]}>
                                  {negativeTransfers} negative transfer{negativeTransfers !== 1 ? 's' : ''} flagged
                                </Text>
                              )}
                            </View>
                          </Pressable>
                        );
                      }

                      // Default domain card (alerts, etc.)
                      return (
                        <Pressable
                          key={card.id}
                          onPress={() => { setDrillDown(card.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                          style={({ pressed }) => [
                            styles.domainCard,
                            { backgroundColor: colors.card, borderColor: colors.border },
                            pressed && { opacity: 0.7 },
                          ]}
                        >
                          <View style={styles.domainCardHeader}>
                            <View style={[styles.domainCardIconWrap, { backgroundColor: `${colors.tint}18` }]}>
                              <IconSymbol name={card.icon} size={16} color={colors.tint} />
                            </View>
                            <Text style={[styles.domainCardTitle, { color: colors.text }]}>{card.title}</Text>
                            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
                          </View>
                          <Text style={[styles.domainCardPreview, { color: colors.textSecondary }]}>
                            {previews[card.id]}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>

              {/* Roster */}
              <View key="roster" style={{ flex: 1 }}>
                <ScrollView style={styles.sportsScrollView} contentContainerStyle={styles.rosterScrollContent} showsVerticalScrollIndicator={false} nestedScrollEnabled>
                  <RosterContent teamKR={liveTeamKR} offKR={liveOffKR} defKR={liveDefKR} onLogoLongPress={openTeamSheet} onOpenStatistics={() => { setActiveIndex(0); pagerRef.current?.setPage(0); setDrillDown('stats'); }} onKRPress={() => setKrSheetVisible(true)} />
                </ScrollView>
              </View>

              {/* Calendar */}
              <View key="calendar" style={{ flex: 1 }}>
                <SportsCalendarV2 colors={colors} />
              </View>

              {/* Recruiting */}
              <View key="recruiting" style={{ flex: 1 }}>
                <PlayerPoolContentV2 colors={colors} />
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

  // Sports mode handles its own scroll (sticky header)
  if (mode === 'sports') {
    return (
      <ThemedView style={styles.container}>
        <SportsHome />
      </ThemedView>
    );
  }

  // Competition mode handles its own scroll (hub tabs)
  if (mode === 'competition') {
    return (
      <ThemedView style={styles.container}>
        <CommunityHome />
      </ThemedView>
    );
  }

  // Business mode handles its own scroll (9-tab pager + RBAC)
  if (mode === 'business') {
    return (
      <BusinessProvider>
        <BusinessHome />
      </BusinessProvider>
    );
  }

  // Church mode handles its own scroll (hub tabs + RBAC)
  if (mode === 'church') {
    return (
      <ChurchProvider>
        <ChurchHomeComponent />
      </ChurchProvider>
    );
  }

  // Education mode handles its own scroll (hub tabs + RBAC)
  if (mode === 'education') {
    return (
      <EducationProvider>
        <EducationHomeComponent />
      </EducationProvider>
    );
  }

  // Fallback
  return (
    <ChurchProvider>
      <ChurchHomeComponent />
    </ChurchProvider>
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
    backgroundColor: '#181616',
    borderRadius: 12,
    overflow: 'hidden' as const,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  ngBlockAccent: {
    height: 3,
    backgroundColor: '#1E40AF',
  },
  ngBlockBody: {
    padding: 14,
  },
  ngLabel: {
    color: '#1E40AF',
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
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
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
    backgroundColor: 'rgba(255,255,255,0.06)',
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

});

```

### E2. Business Dashboard -- components/biz-home/biz-dashboard-v2.tsx

```typescript
/**
 * Biz Dashboard V2 — Full rewrite
 *
 * 7 RBAC-gated blocks + 3 bottom sheets + domain card drill-downs.
 * Luxury dark card aesthetic — investor-grade visual polish.
 *
 * Blocks:
 *  1. Video Hero (all roles)
 *  2. Next Event (RBAC)
 *  3. Action Row — Deck / Data Room / Invest (per-card RBAC)
 *  4. Pipeline — 4 metrics with exact/banded/hidden per role
 *  5. Proof — Institutions, Active Views, IP Docs
 *  6. Top Deals (RBAC, B2b anonymized)
 *  7. Domain Cards — Cap Table, Metrics, Updates (per-card RBAC)
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useBusiness } from '@/context/business-context';
import {
  BIZ_HERO,
  BIZ_EVENTS,
  BIZ_ACTION_ROW,
  BIZ_DOMAIN_CARDS,
  TRACTION_METRICS,
  FUNDRAISE_METRICS,
  PIPELINE_SUMMARY,
  DEALS,
  DEAL_STAGE_LABELS,
  type BizActionCardId,
  type BizDomainCardId,
  type BizDealStage,
} from '@/data/mock-business-home';
import {
  isDashboardBlockVisible,
  isActionCardVisible,
  getPipelineMetricVisibility,
  isBizDomainCardVisible,
  type BusinessRoleLens,
} from '@/utils/business-rbac';
import { openPersonCard } from '@/utils/global-entity-sheets';

import { BizDeckSheet } from '@/components/commerce/biz-deck-sheet';
import { BizDataRoomSheet } from '@/components/commerce/biz-data-room-sheet';
import { BizInvestSheet } from '@/components/commerce/biz-invest-sheet';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  INVESTOR: '#22C55E',
  PARTNER: '#3B82F6',
  INTERNAL: '#6B7280',
  DEMO: '#8B5CF6',
};

const ATTENDEE_ROLE_COLORS: Record<string, string> = {
  founder: '#F59E0B',
  investor: '#22C55E',
  advisor: '#8B5CF6',
  board: '#3B82F6',
  partner: '#EC4899',
  staff: '#6B7280',
  press: '#EF4444',
  legal: '#6B7280',
};

const STAGE_COLORS: Record<string, string> = {
  lead: '#6B7280',
  contacted: '#3B82F6',
  meeting_set: '#8B5CF6',
  proposal_sent: '#F59E0B',
  negotiating: '#F97316',
  due_diligence: '#EC4899',
  closed_won: '#10B981',
  closed_lost: '#EF4444',
};

export function BizDashboardV2({ colors, accent }: Props) {
  const { viewAsRole } = useBusiness();

  // Sheet state
  const [showDeck, setShowDeck] = useState(false);
  const [showDataRoom, setShowDataRoom] = useState(false);
  const [showInvest, setShowInvest] = useState(false);
  const [drillDown, setDrillDown] = useState<BizDomainCardId | null>(null);

  const nextEvent = BIZ_EVENTS.find((e) => e.status === 'upcoming');

  const handleActionCard = useCallback((id: BizActionCardId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (id) {
      case 'deck': setShowDeck(true); break;
      case 'data_room': setShowDataRoom(true); break;
      case 'invest': setShowInvest(true); break;
    }
  }, []);

  const handleDomainCard = useCallback((id: BizDomainCardId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDrillDown(id);
  }, []);

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Block 1: Video Hero ── */}
        {isDashboardBlockVisible('video_hero', viewAsRole) && (
          <View style={styles.heroWrapper}>
            <LinearGradient colors={['#0a0618', '#1a0a2e', '#0a0618']} style={styles.heroGradient}>
              {/* Subtle inner vignette */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.6)']}
                style={styles.heroScrim}
              />
              {BIZ_HERO.isLive && (
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <ThemedText style={styles.liveText}>LIVE</ThemedText>
                </View>
              )}
              <Pressable style={styles.playButton}>
                <View style={styles.playRing}>
                  <IconSymbol name="play.fill" size={24} color="rgba(255,255,255,0.9)" />
                </View>
              </Pressable>
              <View style={styles.heroOverlay}>
                <ThemedText style={styles.heroTitle}>{BIZ_HERO.title}</ThemedText>
                <ThemedText style={styles.heroSubtitle}>{BIZ_HERO.subtitle}</ThemedText>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* ── Block 2: Next Event ── */}
        {isDashboardBlockVisible('next_event', viewAsRole) && nextEvent && (
          <View style={styles.darkCard}>
            <View style={[styles.cardAccentStripe, { backgroundColor: accent }]} />
            <View style={styles.eventHeader}>
              <ThemedText style={[styles.sectionLabel, { color: accent }]}>NEXT EVENT</ThemedText>
              <View style={[styles.eventTypeBadge, { backgroundColor: (EVENT_TYPE_COLORS[nextEvent.eventType] ?? '#6B7280') + '18' }]}>
                <View style={[styles.microDot, { backgroundColor: EVENT_TYPE_COLORS[nextEvent.eventType] ?? '#6B7280' }]} />
                <ThemedText style={[styles.eventTypeText, { color: EVENT_TYPE_COLORS[nextEvent.eventType] ?? '#6B7280' }]}>
                  {nextEvent.eventType}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={styles.eventTitle}>{nextEvent.title}</ThemedText>
            <ThemedText style={styles.eventMeta}>
              {nextEvent.date} · {nextEvent.time} · {nextEvent.location}
            </ThemedText>
            <View style={styles.attendeeRow}>
              {nextEvent.attendees.slice(0, 4).map((a) => (
                <View key={a.name} style={[styles.attendeePill, { backgroundColor: (ATTENDEE_ROLE_COLORS[a.role] ?? '#6B7280') + '12' }]}>
                  <View style={[styles.attendeeDot, { backgroundColor: ATTENDEE_ROLE_COLORS[a.role] ?? '#6B7280' }]} />
                  <ThemedText style={styles.attendeeName}>{a.name}</ThemedText>
                </View>
              ))}
              {nextEvent.attendees.length > 4 && (
                <ThemedText style={styles.attendeeMore}>+{nextEvent.attendees.length - 4} more</ThemedText>
              )}
            </View>
          </View>
        )}

        {/* ── Block 3: Action Row ── */}
        {isDashboardBlockVisible('action_row', viewAsRole) && (
          <View style={styles.actionRow}>
            {BIZ_ACTION_ROW.filter((card) => isActionCardVisible(card.id, viewAsRole)).map((card) => (
              <Pressable
                key={card.id}
                style={styles.actionCard}
                onPress={() => handleActionCard(card.id)}
              >
                <View style={[styles.actionIconWrap, { backgroundColor: card.color + '18' }]}>
                  <IconSymbol name={card.icon as any} size={22} color={card.color} />
                </View>
                <ThemedText style={styles.actionTitle}>{card.title}</ThemedText>
                <ThemedText style={styles.actionDetail} numberOfLines={2}>{card.detail}</ThemedText>
              </Pressable>
            ))}
          </View>
        )}

        {/* ── Block 4: Pipeline ── */}
        {isDashboardBlockVisible('pipeline', viewAsRole) && (
          <View style={styles.darkCard}>
            <View style={[styles.cardAccentStripe, { backgroundColor: '#22C55E' }]} />
            <ThemedText style={[styles.sectionLabel, { color: accent }]}>PIPELINE</ThemedText>
            <View style={styles.metricsRow}>
              <PipelineMetric
                label="Total Value"
                value={formatValue(PIPELINE_SUMMARY.totalPipelineValue)}
                color="#22C55E"
                metric="total_value"
                role={viewAsRole}
              />
              <PipelineMetric
                label="Active Deals"
                value={String(PIPELINE_SUMMARY.activeDeals)}
                color={accent}
                metric="active_deals"
                role={viewAsRole}
              />
              <PipelineMetric
                label="Win Rate"
                value={`${(PIPELINE_SUMMARY.winRate * 100).toFixed(0)}%`}
                color="#fff"
                metric="win_rate"
                role={viewAsRole}
              />
              <PipelineMetric
                label="Raised"
                value={`$${(FUNDRAISE_METRICS.raised / 1_000).toFixed(0)}K`}
                color="#3B82F6"
                metric="raised"
                role={viewAsRole}
              />
            </View>
          </View>
        )}

        {/* ── Block 5: Proof ── */}
        {isDashboardBlockVisible('proof', viewAsRole) && (
          <View style={styles.statsRow}>
            <StatBlock label="Institutions" value={String(TRACTION_METRICS.institutions)} accent={accent} />
            <StatBlock label="Active Views" value={String(TRACTION_METRICS.activeViews)} accent={accent} />
            <StatBlock label="IP Docs" value={String(TRACTION_METRICS.ipDocs)} accent={accent} />
          </View>
        )}

        {/* ── Block 6: Top Deals ── */}
        {isDashboardBlockVisible('top_deals', viewAsRole) && (
          <View style={styles.darkCard}>
            <View style={[styles.cardAccentStripe, { backgroundColor: '#F59E0B' }]} />
            <ThemedText style={[styles.sectionLabel, { color: accent }]}>TOP DEALS</ThemedText>
            {DEALS.filter((d) => d.priority === 'high').slice(0, 3).map((deal, i, arr) => {
              const isAnonymized = viewAsRole === 'B2b';
              const stageColor = STAGE_COLORS[deal.stage] ?? '#6B7280';
              const stageLabel = DEAL_STAGE_LABELS[deal.stage] ?? deal.stage;
              return (
                <Pressable
                  key={deal.id}
                  style={[styles.dealRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => openPersonCard({
                    name: isAnonymized ? 'Undisclosed' : deal.contactName,
                    role: isAnonymized ? 'Investor' : deal.company,
                  })}
                >
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.dealName}>
                      {isAnonymized ? 'Undisclosed Investor' : deal.contactName}
                    </ThemedText>
                    <View style={styles.dealSubRow}>
                      <ThemedText style={styles.dealCompany}>
                        {isAnonymized ? 'Confidential' : deal.company}
                      </ThemedText>
                      <View style={[styles.stagePill, { backgroundColor: stageColor + '18' }]}>
                        <View style={[styles.stageDot, { backgroundColor: stageColor }]} />
                        <ThemedText style={[styles.stageText, { color: stageColor }]}>
                          {isAnonymized ? 'Active' : stageLabel}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  <ThemedText style={[styles.dealValue, { color: accent }]}>
                    {deal.value != null ? formatValue(deal.value) : '--'}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* ── Block 7: Domain Cards ── */}
        {isDashboardBlockVisible('domain_cards', viewAsRole) && (
          <View style={styles.domainSection}>
            {BIZ_DOMAIN_CARDS.filter((card) => isBizDomainCardVisible(card.id, viewAsRole)).map((card) => (
              <Pressable
                key={card.id}
                style={styles.domainCard}
                onPress={() => handleDomainCard(card.id)}
              >
                <View style={[styles.cardAccentStripe, { backgroundColor: card.accent }]} />
                <View style={styles.domainHeader}>
                  <View style={[styles.domainIconWrap, { backgroundColor: card.accent + '18' }]}>
                    <IconSymbol name={card.icon as any} size={16} color={card.accent} />
                  </View>
                  <ThemedText style={styles.domainTitle}>{card.title}</ThemedText>
                  <IconSymbol name="chevron.right" size={12} color="rgba(255,255,255,0.25)" />
                </View>
                <ThemedText style={styles.domainPreview} numberOfLines={2}>{card.preview}</ThemedText>
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Bottom Sheets ── */}
      <BizDeckSheet visible={showDeck} onClose={() => setShowDeck(false)} colors={colors} />
      <BizDataRoomSheet visible={showDataRoom} onClose={() => setShowDataRoom(false)} colors={colors} role={viewAsRole} />
      <BizInvestSheet visible={showInvest} onClose={() => setShowInvest(false)} colors={colors} />
    </>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function PipelineMetric({
  label, value, color, metric, role,
}: {
  label: string; value: string; color: string;
  metric: 'total_value' | 'active_deals' | 'win_rate' | 'raised';
  role: BusinessRoleLens;
}) {
  const vis = getPipelineMetricVisibility(metric, role);
  if (vis === 'hidden') return null;

  const displayValue = vis === 'banded' ? bandValue(value) : value;

  return (
    <View style={styles.metricsItem}>
      <ThemedText style={[styles.metricsValue, { color }]}>{displayValue}</ThemedText>
      <ThemedText style={styles.metricsLabel}>{label}</ThemedText>
    </View>
  );
}

function StatBlock({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View style={styles.statBlock}>
      <ThemedText style={[styles.statValue, { color: accent }]}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function formatValue(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function bandValue(v: string): string {
  const num = parseFloat(v.replace(/[$%KM,]/g, ''));
  if (isNaN(num)) return v;
  if (v.includes('M')) {
    const lower = Math.floor(num);
    return `$${lower}-${lower + 1}M`;
  }
  if (v.includes('K')) {
    const lower = Math.floor(num / 50) * 50;
    return `$${lower}-${lower + 50}K`;
  }
  if (v.includes('%')) {
    const lower = Math.floor(num / 5) * 5;
    return `${lower}-${lower + 5}%`;
  }
  return `~${v}`;
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

  // ─── Video Hero ───
  heroWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
  },
  heroGradient: {
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    top: '40%',
  },
  liveBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  playButton: { zIndex: 1 },
  playRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
  },
  heroOverlay: { position: 'absolute', bottom: 18, left: 18, right: 18 },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 0.2,
  },

  // ─── Dark Card (shared) ───
  darkCard: {
    backgroundColor: '#181616',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardAccentStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  // ─── Next Event ───
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  microDot: { width: 5, height: 5, borderRadius: 2.5 },
  eventTypeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  eventTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  eventMeta: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 12,
  },
  attendeeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  attendeePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  attendeeDot: { width: 5, height: 5, borderRadius: 2.5 },
  attendeeName: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '600',
  },
  attendeeMore: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '500' },

  // ─── Action Row ───
  actionRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  actionCard: {
    flex: 1,
    backgroundColor: '#181616',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 14,
    alignItems: 'center',
    gap: 8,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  actionDetail: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
  },

  // ─── Pipeline ───
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 2 },
  metricsItem: { alignItems: 'center', flex: 1 },
  metricsValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  metricsLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 4,
    textTransform: 'uppercase',
  },

  // ─── Proof ───
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statBlock: {
    flex: 1,
    backgroundColor: '#181616',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -1,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 4,
    textTransform: 'uppercase',
  },

  // ─── Top Deals ───
  dealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  dealName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  dealSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  dealCompany: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '500' },
  dealValue: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginLeft: 10,
  },
  stagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stageDot: { width: 4, height: 4, borderRadius: 2 },
  stageText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.2 },

  // ─── Domain Cards ───
  domainSection: { gap: 8, marginBottom: 12 },
  domainCard: {
    backgroundColor: '#181616',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 16,
    overflow: 'hidden',
  },
  domainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  domainIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  domainTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  domainPreview: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    marginLeft: 40,
  },
});

```

### E3. Church Dashboard -- components/church-home/church-dashboard-v2.tsx

```typescript
/**
 * Church Dashboard V2 — ICCLA
 *
 * Layout: Video Hero → Next Service → Commerce Row (3 text-stack cards) →
 * Ministry Health → Growth Metrics (2×2) → 3 Bottom Sheets.
 * All sections RBAC-gated via canSeeChurchDashboardSection().
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import {
  CHURCH_HERO,
  CHURCH_SERVICES,
  MINISTRY_HEALTH_SUMMARY,
  GROWTH_DASHBOARD,
  RECENT_SERMONS,
  PRAYER_REQUESTS,
  ACTIVE_CAMPAIGN,
} from '@/data/mock-church-home';
import {
  canSeeChurchDashboardSection,
  type ChurchRoleLens,
  type ChurchDashboardSection,
} from '@/utils/church-rbac';

import { ChurchGiveSheet } from '@/components/commerce/church-give-sheet';
import { ChurchSermonsSheet } from '@/components/commerce/church-sermons-sheet';
import { ChurchPrayerSheet } from '@/components/commerce/church-prayer-sheet';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accent: string;
  role?: ChurchRoleLens;
}

const GOLD = '#FBBF24';

const STATUS_DOT: Record<string, string> = {
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
};

const TREND_DIR_ICON: Record<string, string> = {
  up: 'arrow.up.right',
  flat: 'arrow.right',
  down: 'arrow.down.right',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function ChurchDashboardV2({ colors, accent, role = 'C1' }: Props) {
  const nextService = CHURCH_SERVICES.find((s) => s.status === 'upcoming');

  // Bottom sheet state
  const [giveVisible, setGiveVisible] = useState(false);
  const [sermonsVisible, setSermonsVisible] = useState(false);
  const [prayerVisible, setPrayerVisible] = useState(false);

  // RBAC helper
  const canSee = useCallback(
    (section: ChurchDashboardSection) =>
      canSeeChurchDashboardSection(section, role) !== 'hidden',
    [role],
  );

  // Derived data for commerce row subtitles
  const latestSermon = RECENT_SERMONS[0];
  const activePrayerCount = PRAYER_REQUESTS.filter((p) => !p.isPraise).length;
  const buildingFundPct = Math.round((ACTIVE_CAMPAIGN.raised / ACTIVE_CAMPAIGN.target) * 100);

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Video Hero ── */}
        {canSee('video_hero') && (
          <View style={styles.heroContainer}>
            <LinearGradient
              colors={['#1a1030', '#0d0d1a', '#000']}
              style={styles.heroGradient}
            >
              <Pressable style={styles.playButton}>
                <IconSymbol name="play.circle.fill" size={56} color="rgba(255,255,255,0.7)" />
              </Pressable>

              {CHURCH_HERO.isLive && (
                <View style={styles.liveBadge}>
                  <ThemedText style={styles.liveText}>LIVE</ThemedText>
                </View>
              )}

              <View style={styles.heroTextBlock}>
                {CHURCH_HERO.seriesName && (
                  <ThemedText style={[styles.seriesLabel, { color: accent }]}>
                    {CHURCH_HERO.seriesName}
                  </ThemedText>
                )}
                <ThemedText style={styles.heroTitle}>{CHURCH_HERO.title}</ThemedText>
                <ThemedText style={styles.heroSpeaker}>{CHURCH_HERO.subtitle}</ThemedText>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* ── Next Service Card ── */}
        {canSee('next_service') && nextService && (
          <Pressable
            style={[styles.nextEventCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <ThemedText style={[styles.nextEventLabel, { color: accent }]}>NEXT SERVICE</ThemedText>
            <ThemedText style={[styles.nextEventTitle, { color: colors.text }]}>
              {nextService.title}
            </ThemedText>
            <ThemedText style={[styles.nextEventMeta, { color: colors.textSecondary }]}>
              {nextService.date} · {nextService.time}
            </ThemedText>
            {nextService.speaker && (
              <ThemedText style={[styles.nextEventSpeaker, { color: colors.textSecondary }]}>
                {nextService.speaker}
              </ThemedText>
            )}
            {nextService.seriesName && (
              <ThemedText style={[styles.nextEventSeries, { color: accent }]}>
                {nextService.seriesName}
              </ThemedText>
            )}
          </Pressable>
        )}

        {/* ── Commerce Row (3 text-stack cards) ── */}
        {canSee('commerce_row') && (
          <View style={styles.commerceRow}>
            <Pressable style={styles.commerceCard} onPress={() => setGiveVisible(true)}>
              <View style={[styles.commerceTopBorder, { backgroundColor: GOLD }]} />
              <ThemedText style={styles.commerceTitle}>Give</ThemedText>
              <ThemedText style={styles.commerceSubtitle}>Building Fund 2026</ThemedText>
              <ThemedText style={styles.commerceDetail}>{buildingFundPct}% to goal</ThemedText>
            </Pressable>
            <Pressable style={styles.commerceCard} onPress={() => setSermonsVisible(true)}>
              <View style={[styles.commerceTopBorder, { backgroundColor: GOLD }]} />
              <ThemedText style={styles.commerceTitle}>Sermons</ThemedText>
              <ThemedText style={styles.commerceSubtitle} numberOfLines={1}>
                {latestSermon?.title ?? 'Latest sermon'}
              </ThemedText>
              <ThemedText style={styles.commerceDetail}>
                {latestSermon?.date ?? ''}
              </ThemedText>
            </Pressable>
            <Pressable style={styles.commerceCard} onPress={() => setPrayerVisible(true)}>
              <View style={[styles.commerceTopBorder, { backgroundColor: GOLD }]} />
              <ThemedText style={styles.commerceTitle}>Prayer</ThemedText>
              <ThemedText style={styles.commerceSubtitle}>
                {activePrayerCount} active requests
              </ThemedText>
            </Pressable>
          </View>
        )}

        {/* ── Ministry Health ── */}
        {canSee('ministry_health') && (
          <View style={styles.darkCard}>
            <View style={[styles.darkCardAccent, { backgroundColor: GOLD }]} />
            <View style={styles.darkCardContent}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>Ministry Health</ThemedText>
                <ThemedText style={styles.sectionBadge}>
                  {MINISTRY_HEALTH_SUMMARY.activeCount} Active
                </ThemedText>
              </View>

              {/* Top 3 */}
              {MINISTRY_HEALTH_SUMMARY.top3.map((m) => (
                <View key={m.name} style={styles.ministryRow}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.ministryName}>{m.name}</ThemedText>
                    <ThemedText style={styles.ministryLeader}>{m.leader}</ThemedText>
                  </View>
                  <View style={styles.ministryStats}>
                    <ThemedText style={styles.ministryMembers}>{m.members}</ThemedText>
                    <View style={styles.trendPill}>
                      <IconSymbol
                        name={TREND_DIR_ICON[m.trendDir] as any}
                        size={10}
                        color={m.trendDir === 'up' ? '#22C55E' : m.trendDir === 'down' ? '#EF4444' : '#6B7280'}
                      />
                      <ThemedText style={[
                        styles.trendText,
                        { color: m.trendDir === 'up' ? '#22C55E' : m.trendDir === 'down' ? '#EF4444' : '#6B7280' },
                      ]}>
                        {m.trend}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              ))}

              {/* Flagged Alerts */}
              {MINISTRY_HEALTH_SUMMARY.flagged.length > 0 && (
                <View style={styles.alertSection}>
                  {MINISTRY_HEALTH_SUMMARY.flagged.map((f) => (
                    <View key={f.name} style={styles.alertRow}>
                      <View style={[styles.alertDot, { backgroundColor: '#F59E0B' }]} />
                      <ThemedText style={styles.alertText}>
                        <ThemedText style={styles.alertName}>{f.name}: </ThemedText>
                        {f.alert}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Growth Metrics (2×2) ── */}
        {canSee('growth_metrics') && (
          <View style={styles.darkCard}>
            <View style={[styles.darkCardAccent, { backgroundColor: GOLD }]} />
            <View style={styles.darkCardContent}>
              <ThemedText style={styles.sectionTitle}>Growth Metrics</ThemedText>
              <View style={styles.metricsGrid}>
                {GROWTH_DASHBOARD.map((metric) => (
                  <View key={metric.label} style={styles.metricCell}>
                    <ThemedText style={styles.metricValue}>{metric.value}</ThemedText>
                    <View style={styles.metricLabelRow}>
                      <View style={[styles.statusDot, { backgroundColor: STATUS_DOT[metric.status] ?? '#6B7280' }]} />
                      <ThemedText style={styles.metricLabel}>{metric.label}</ThemedText>
                    </View>
                    <ThemedText style={styles.metricDetail}>{metric.detail}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Bottom Sheets ── */}
      <ChurchGiveSheet visible={giveVisible} onClose={() => setGiveVisible(false)} colors={colors as any} />
      <ChurchSermonsSheet visible={sermonsVisible} onClose={() => setSermonsVisible(false)} colors={colors as any} />
      <ChurchPrayerSheet visible={prayerVisible} onClose={() => setPrayerVisible(false)} colors={colors as any} />
    </>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

  // Hero
  heroContainer: { borderRadius: 16, overflow: 'hidden', marginBottom: 14 },
  heroGradient: { aspectRatio: 16 / 9, justifyContent: 'flex-end', alignItems: 'center', padding: 20 },
  playButton: { position: 'absolute', top: '35%' },
  liveBadge: { position: 'absolute', top: 14, right: 14, backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  heroTextBlock: { width: '100%', alignItems: 'center' },
  seriesLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  heroSpeaker: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },

  // Next Event
  nextEventCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 14 },
  nextEventLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  nextEventTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  nextEventMeta: { fontSize: 12, marginTop: 2 },
  nextEventSpeaker: { fontSize: 12, marginTop: 2 },
  nextEventSeries: { fontSize: 11, fontWeight: '600', fontStyle: 'italic', marginTop: 4 },

  // Commerce Row (text-stack)
  commerceRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  commerceCard: {
    flex: 1, backgroundColor: '#181616', borderRadius: 12, padding: 12,
    overflow: 'hidden',
  },
  commerceTopBorder: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  commerceTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 2 },
  commerceSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 3 },
  commerceDetail: { color: 'rgba(255,255,255,0.35)', fontSize: 9, marginTop: 2 },

  // Dark card (Ministry Health, Growth Metrics)
  darkCard: {
    backgroundColor: '#181616', borderRadius: 12, overflow: 'hidden', marginBottom: 12,
  },
  darkCardAccent: { height: 3 },
  darkCardContent: { padding: 14 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  sectionBadge: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600' },

  // Ministry Health rows
  ministryRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  ministryName: { color: '#fff', fontSize: 13, fontWeight: '700' },
  ministryLeader: { color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 1 },
  ministryStats: { alignItems: 'flex-end', gap: 2 },
  ministryMembers: { color: '#fff', fontSize: 16, fontWeight: '800' },
  trendPill: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  trendText: { fontSize: 10, fontWeight: '700' },

  // Flagged alerts
  alertSection: { marginTop: 10 },
  alertRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 6 },
  alertDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },
  alertText: { color: '#F59E0B', fontSize: 11, flex: 1 },
  alertName: { fontWeight: '700' },

  // Growth Metrics 2x2
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  metricCell: { width: '50%', paddingVertical: 8, paddingHorizontal: 4 },
  metricValue: { color: '#fff', fontSize: 20, fontWeight: '800' },
  metricLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  metricLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
  metricDetail: { color: 'rgba(255,255,255,0.35)', fontSize: 9, marginTop: 2 },
});

```

### E4. Education Dashboard -- components/edu-home/edu-dashboard-v2.tsx

```typescript
/**
 * Education Dashboard V2 — FMU
 *
 * Full dashboard: Video Hero → Next Event → Action Row (3 text-stack cards) →
 * Institutional Metrics (2×3 grid) → Academic Health (school summaries) →
 * 4 RBAC-gated Domain Cards → 3 Bottom Sheets.
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import {
  EDU_HERO,
  EDU_EVENTS,
  EDU_EVENT_CATEGORY_COLORS,
  INSTITUTIONAL_METRICS,
  SCHOOL_HEALTH,
  STUDENT_SUCCESS_SUMMARY,
  CAMPUS_LIFE_SUMMARY,
  ADVANCEMENT_SUMMARY,
  ACCREDITATION_SUMMARY,
} from '@/data/mock-education-home';
import { openPersonCard } from '@/utils/global-entity-sheets';
import {
  canSeeEduDashboardSection,
  type EducationRoleLens,
} from '@/utils/education-rbac';

import { EduApplySheet } from '@/components/commerce/edu-apply-sheet';
import { EduCatalogSheet } from '@/components/commerce/edu-catalog-sheet';
import { EduFinancialAidSheet } from '@/components/commerce/edu-financial-aid-sheet';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accent: string;
  role?: EducationRoleLens;
}

const TEAL = '#14B8A6';

const STATUS_DOT: Record<string, string> = {
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function EduDashboardV2({ colors, accent, role = 'E10' }: Props) {
  const nextEvent = EDU_EVENTS.find((e) => e.status === 'upcoming');

  // Bottom sheet state
  const [applyVisible, setApplyVisible] = useState(false);
  const [catalogVisible, setCatalogVisible] = useState(false);
  const [aidVisible, setAidVisible] = useState(false);

  // RBAC helper
  const canSee = useCallback(
    (section: Parameters<typeof canSeeEduDashboardSection>[0]) =>
      canSeeEduDashboardSection(section, role) !== 'hidden',
    [role],
  );

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Video Hero ── */}
        {canSee('video_hero') && (
          <Pressable style={styles.heroContainer}>
            <LinearGradient
              colors={['#0a2e1a', '#0d1a0f', '#000']}
              style={styles.heroGradient}
            >
              <View style={styles.playButton}>
                <IconSymbol name="play.fill" size={28} color="#fff" />
              </View>
              {EDU_HERO.isLive && (
                <View style={styles.liveBadge}>
                  <ThemedText style={styles.liveText}>LIVE</ThemedText>
                </View>
              )}
              <View style={styles.heroOverlay}>
                <ThemedText style={styles.heroTitle}>{EDU_HERO.title}</ThemedText>
                <ThemedText style={styles.heroSubtitle}>{EDU_HERO.subtitle}</ThemedText>
                {EDU_HERO.instructor && (
                  <Pressable
                    onPress={() =>
                      openPersonCard({ name: EDU_HERO.instructor!, role: 'Speaker', status: 'active' })
                    }
                  >
                    <ThemedText style={styles.heroInstructor}>{EDU_HERO.instructor}</ThemedText>
                  </Pressable>
                )}
              </View>
            </LinearGradient>
          </Pressable>
        )}

        {/* ── Next Event Card ── */}
        {canSee('next_event') && nextEvent && (
          <View style={[styles.nextEventCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[styles.nextEventLabel, { color: accent }]}>NEXT EVENT</ThemedText>
            <ThemedText style={[styles.nextEventTitle, { color: colors.text }]}>{nextEvent.title}</ThemedText>
            <ThemedText style={[styles.nextEventMeta, { color: colors.textSecondary }]}>
              {nextEvent.date} · {nextEvent.time}
            </ThemedText>
            <View style={[styles.nextEventBadge, { backgroundColor: EDU_EVENT_CATEGORY_COLORS[nextEvent.category] + '22' }]}>
              <ThemedText style={[styles.nextEventBadgeText, { color: EDU_EVENT_CATEGORY_COLORS[nextEvent.category] }]}>
                {nextEvent.category.replace('_', ' ')}
              </ThemedText>
            </View>
          </View>
        )}

        {/* ── Action Row (3 text-stack cards) ── */}
        {canSee('action_row') && (
          <View style={styles.actionRow}>
            <Pressable style={styles.actionCard} onPress={() => setApplyVisible(true)}>
              <View style={[styles.actionTopBorder, { backgroundColor: TEAL }]} />
              <ThemedText style={styles.actionTitle}>Apply</ThemedText>
              <ThemedText style={styles.actionSubtitle}>Start your application</ThemedText>
            </Pressable>
            <Pressable style={styles.actionCard} onPress={() => setCatalogVisible(true)}>
              <View style={[styles.actionTopBorder, { backgroundColor: TEAL }]} />
              <ThemedText style={styles.actionTitle}>Catalog</ThemedText>
              <ThemedText style={styles.actionSubtitle}>Browse programs</ThemedText>
            </Pressable>
            <Pressable style={styles.actionCard} onPress={() => setAidVisible(true)}>
              <View style={[styles.actionTopBorder, { backgroundColor: TEAL }]} />
              <ThemedText style={styles.actionTitle}>Financial Aid</ThemedText>
              <ThemedText style={styles.actionSubtitle}>Scholarships & tuition</ThemedText>
            </Pressable>
          </View>
        )}

        {/* ── Institutional Metrics (2×3 grid) ── */}
        {canSee('institutional_metrics') && (
          <View style={styles.metricsCard}>
            <ThemedText style={styles.sectionTitle}>Institutional Health</ThemedText>
            <View style={styles.metricsGrid}>
              <MetricCell label="Enrollment" value={String(INSTITUTIONAL_METRICS.enrollment.value)} trend={INSTITUTIONAL_METRICS.enrollment.trend} status={INSTITUTIONAL_METRICS.enrollment.status} />
              <MetricCell label="Retention" value={INSTITUTIONAL_METRICS.retention.value} trend={INSTITUTIONAL_METRICS.retention.trend} status={INSTITUTIONAL_METRICS.retention.status} />
              <MetricCell label="Grad Rate (4yr)" value={INSTITUTIONAL_METRICS.graduationRate.value4yr} status={INSTITUTIONAL_METRICS.graduationRate.status} />
              <MetricCell label="Student:Faculty" value={INSTITUTIONAL_METRICS.studentFacultyRatio.value} status={INSTITUTIONAL_METRICS.studentFacultyRatio.status} />
              <MetricCell label="Avg GPA" value={INSTITUTIONAL_METRICS.avgGPA.value} status={INSTITUTIONAL_METRICS.avgGPA.status} />
              <MetricCell label="Revenue Target" value={INSTITUTIONAL_METRICS.financialHealth.revenueTarget} status={INSTITUTIONAL_METRICS.financialHealth.status} />
            </View>
          </View>
        )}

        {/* ── Academic Health ── */}
        {canSee('academic_health') && (
          <View style={styles.healthCard}>
            <ThemedText style={styles.sectionTitle}>Academic Health</ThemedText>
            {SCHOOL_HEALTH.map((school) => (
              <View key={school.name} style={styles.schoolRow}>
                <View style={styles.schoolHeader}>
                  <ThemedText style={styles.schoolName}>{school.name}</ThemedText>
                  <ThemedText style={styles.schoolStats}>
                    {school.programCount} programs · {school.enrolledStudents} students · {school.avgGPA.toFixed(2)} GPA · {school.facultyCount} faculty
                  </ThemedText>
                </View>
                {school.alerts.map((alert, i) => (
                  <View key={i} style={styles.alertRow}>
                    <View style={[styles.alertDot, { backgroundColor: '#F59E0B' }]} />
                    <ThemedText style={styles.alertText}>{alert}</ThemedText>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* ── Domain Cards ── */}
        {canSee('student_success') && (
          <View style={styles.domainCard}>
            <View style={[styles.domainAccent, { backgroundColor: '#3B82F6' }]} />
            <View style={styles.domainContent}>
              <View style={styles.domainHeader}>
                <IconSymbol name="person.fill.checkmark" size={18} color="#3B82F6" />
                <ThemedText style={styles.domainTitle}>Student Success</ThemedText>
              </View>
              <View style={styles.domainPills}>
                <DomainPill label={`${STUDENT_SUCCESS_SUMMARY.atRiskCount} At-Risk`} color="#EF4444" />
                <DomainPill label={`${STUDENT_SUCCESS_SUMMARY.interventionRate}% Intervention`} color="#22C55E" />
              </View>
            </View>
          </View>
        )}

        {canSee('campus_life') && (
          <View style={styles.domainCard}>
            <View style={[styles.domainAccent, { backgroundColor: '#8B5CF6' }]} />
            <View style={styles.domainContent}>
              <View style={styles.domainHeader}>
                <IconSymbol name="building.2.fill" size={18} color="#8B5CF6" />
                <ThemedText style={styles.domainTitle}>Campus Life</ThemedText>
              </View>
              <View style={styles.domainPills}>
                <DomainPill label={`${CAMPUS_LIFE_SUMMARY.activeOrgs} Orgs`} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.domainMeta}>{CAMPUS_LIFE_SUMMARY.nextCampusEvent}</ThemedText>
            </View>
          </View>
        )}

        {canSee('advancement') && (
          <View style={styles.domainCard}>
            <View style={[styles.domainAccent, { backgroundColor: '#F59E0B' }]} />
            <View style={styles.domainContent}>
              <View style={styles.domainHeader}>
                <IconSymbol name="gift.fill" size={18} color="#F59E0B" />
                <ThemedText style={styles.domainTitle}>Advancement</ThemedText>
              </View>
              <View style={styles.domainPills}>
                <DomainPill label={`$${(ADVANCEMENT_SUMMARY.annualGivingTotal / 1_000_000).toFixed(1)}M / $${(ADVANCEMENT_SUMMARY.goal / 1_000_000).toFixed(1)}M`} color="#F59E0B" />
                <DomainPill label={`${ADVANCEMENT_SUMMARY.majorGiftProspects} Major Prospects`} color="#F59E0B" />
              </View>
            </View>
          </View>
        )}

        {canSee('accreditation') && (
          <View style={styles.domainCard}>
            <View style={[styles.domainAccent, { backgroundColor: '#10B981' }]} />
            <View style={styles.domainContent}>
              <View style={styles.domainHeader}>
                <IconSymbol name="checkmark.seal.fill" size={18} color="#10B981" />
                <ThemedText style={styles.domainTitle}>Accreditation</ThemedText>
              </View>
              <ThemedText style={styles.domainStatus}>{ACCREDITATION_SUMMARY.status}</ThemedText>
              <ThemedText style={styles.domainMeta}>{ACCREDITATION_SUMMARY.nextMilestone}</ThemedText>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Bottom Sheets ── */}
      <EduApplySheet visible={applyVisible} onClose={() => setApplyVisible(false)} colors={colors as any} />
      <EduCatalogSheet visible={catalogVisible} onClose={() => setCatalogVisible(false)} colors={colors as any} />
      <EduFinancialAidSheet visible={aidVisible} onClose={() => setAidVisible(false)} colors={colors as any} />
    </>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function MetricCell({ label, value, trend, status }: { label: string; value: string; trend?: string; status: string }) {
  return (
    <View style={styles.metricCell}>
      <View style={styles.metricValueRow}>
        <ThemedText style={styles.metricValue}>{value}</ThemedText>
        {trend && <ThemedText style={styles.metricTrend}>{trend}</ThemedText>}
      </View>
      <View style={styles.metricLabelRow}>
        <View style={[styles.statusDot, { backgroundColor: STATUS_DOT[status] ?? '#6B7280' }]} />
        <ThemedText style={styles.metricLabel}>{label}</ThemedText>
      </View>
    </View>
  );
}

function DomainPill({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.domainPill, { backgroundColor: color + '22' }]}>
      <ThemedText style={[styles.domainPillText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

  // Hero
  heroContainer: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  heroGradient: { aspectRatio: 16 / 9, justifyContent: 'center', alignItems: 'center' },
  playButton: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  liveBadge: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
  },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14 },
  heroTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  heroSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  heroInstructor: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4, textDecorationLine: 'underline' },

  // Next Event
  nextEventCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12 },
  nextEventLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  nextEventTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  nextEventMeta: { fontSize: 12, marginBottom: 8 },
  nextEventBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  nextEventBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  // Action Row
  actionRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  actionCard: {
    flex: 1, backgroundColor: '#181616', borderRadius: 12, padding: 12,
    overflow: 'hidden',
  },
  actionTopBorder: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  actionTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 2 },
  actionSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 2 },

  // Institutional Metrics
  metricsCard: {
    backgroundColor: '#181616', borderRadius: 12, padding: 14, marginBottom: 12,
  },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 10 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  metricCell: { width: '33.33%', paddingVertical: 8, paddingHorizontal: 4 },
  metricValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  metricValue: { color: '#fff', fontSize: 18, fontWeight: '800' },
  metricTrend: { color: '#22C55E', fontSize: 10, fontWeight: '700' },
  metricLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  metricLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },

  // Academic Health
  healthCard: {
    backgroundColor: '#181616', borderRadius: 12, padding: 14, marginBottom: 12,
  },
  schoolRow: { marginBottom: 10 },
  schoolHeader: { marginBottom: 4 },
  schoolName: { color: '#fff', fontSize: 13, fontWeight: '700' },
  schoolStats: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 2 },
  alertRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4 },
  alertDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },
  alertText: { color: '#F59E0B', fontSize: 11, flex: 1 },

  // Domain Cards
  domainCard: {
    backgroundColor: '#181616', borderRadius: 12, overflow: 'hidden', marginBottom: 10,
  },
  domainAccent: { height: 3 },
  domainContent: { padding: 14 },
  domainHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  domainTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  domainPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  domainPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  domainPillText: { fontSize: 10, fontWeight: '700' },
  domainStatus: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 2 },
  domainMeta: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
});

```

### E5. Competition Dashboard -- components/competition/comp-dashboard-v2.tsx

```typescript
/**
 * Competition Dashboard V2
 * - Video Hero with LinearGradient + LIVE badge + play button
 * - Next Event Card (next round from RACE_ROUNDS)
 * - Commerce Row (3 text-stack cards: Tickets, Store, Paddock)
 * - Driver Standings (top 5, team color bars, last race badge)
 * - Team Standings (top 5, color bars, driver count, best position)
 * - Domain Cards (Race Ops, Technical, Entries) — RBAC-gated
 * - 3 commerce bottom sheets
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import {
  COMP_HERO,
  RACE_ROUNDS,
  DRIVER_STANDINGS,
  CONSTRUCTOR_STANDINGS,
  GRID_TEAMS,
  ENTRIES_CONFIRMED,
  COMPLIANCE_DATA,
  MAX_GRID_SIZE,
  STEWARD_PENDING_DECISIONS,
  HOMOLOGATION_DEADLINE,
} from '@/data/mock-competition-home';
import { openDriverCard, openTeamCard } from '@/utils/global-entity-sheets';
import {
  canSeeDashboardSection,
  type CompetitionRoleLens,
} from '@/utils/competition-rbac';
import { CompTicketsSheet } from '@/components/commerce/comp-tickets-sheet';
import { CompStoreSheet } from '@/components/commerce/comp-store-sheet';
import { CompPaddockSheet } from '@/components/commerce/comp-paddock-sheet';

interface Props {
  colors: typeof Colors.light;
  accent: string;
  role?: CompetitionRoleLens;
}

export function CompDashboardV2({ colors, accent, role = 'CO10' }: Props) {
  const nextRound = RACE_ROUNDS.find((r) => r.status === 'next');
  const topDrivers = DRIVER_STANDINGS.slice(0, 5);
  const topTeams = CONSTRUCTOR_STANDINGS.slice(0, 5);
  const upcomingRounds = RACE_ROUNDS.filter((r) => r.status !== 'completed');

  const [ticketsVisible, setTicketsVisible] = useState(false);
  const [storeVisible, setStoreVisible] = useState(false);
  const [paddockVisible, setPaddockVisible] = useState(false);

  // Domain card preview data
  const confirmedEntries = ENTRIES_CONFIRMED.filter((e) => e.status === 'confirmed').length;
  const pendingWildcards = ENTRIES_CONFIRMED.filter(
    (e) => e.type === 'wildcard' && e.status === 'pending',
  ).length;
  const compliancePassed = COMPLIANCE_DATA.filter((c) => c.scrutineering === 'passed').length;
  const complianceTotal = COMPLIANCE_DATA.length;

  const leaderPoints = topDrivers[0]?.points ?? 0;

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ─── Video Hero ──────────────────────────────────────────── */}
        <View style={styles.heroWrapper}>
          <LinearGradient
            colors={['#1a0a0a', '#0d0d0d', '#000']}
            style={styles.heroGradient}
          >
            <Pressable style={styles.playButton}>
              <IconSymbol name="play.fill" size={28} color="#fff" />
            </Pressable>
            <View style={styles.heroOverlay}>
              {COMP_HERO.isLive && (
                <View style={styles.liveBadge}>
                  <ThemedText style={styles.liveText}>LIVE</ThemedText>
                </View>
              )}
              <ThemedText style={styles.heroTitle}>{COMP_HERO.title}</ThemedText>
              <ThemedText style={styles.heroSubtitle}>{COMP_HERO.subtitle}</ThemedText>
            </View>
          </LinearGradient>
        </View>

        {/* ─── Next Event Card ─────────────────────────────────────── */}
        {nextRound && (
          <View style={[styles.nextEventCard, { backgroundColor: colors.card, borderColor: accent }]}>
            <View style={styles.nextEventHeader}>
              <View style={[styles.roundBadge, { backgroundColor: accent }]}>
                <ThemedText style={styles.roundBadgeText}>R{nextRound.round}</ThemedText>
              </View>
              <View style={[styles.nextLabel, { backgroundColor: accent + '22' }]}>
                <ThemedText style={[styles.nextLabelText, { color: accent }]}>NEXT RACE</ThemedText>
              </View>
            </View>
            <ThemedText style={[styles.nextEventName, { color: colors.text }]}>{nextRound.name}</ThemedText>
            <ThemedText style={[styles.nextEventMeta, { color: colors.textSecondary }]}>
              {nextRound.venue}, {nextRound.city} {'\u00B7'} {nextRound.date}
            </ThemedText>

            <View style={styles.weekendSchedule}>
              <ThemedText style={[styles.weekendRow, { color: colors.textSecondary }]}>
                Fri {nextRound.weekendDates.fri} {'\u00B7'} Practice + Qualifying
              </ThemedText>
              <ThemedText style={[styles.weekendRow, { color: colors.textSecondary }]}>
                Sat {nextRound.weekendDates.sat} {'\u00B7'} Wildcard Heats + Finals
              </ThemedText>
              <ThemedText style={[styles.weekendRow, { color: colors.textSecondary }]}>
                Sun {nextRound.weekendDates.sun} {'\u00B7'} K-1 Grand Prix
              </ThemedText>
            </View>

            {nextRound.defendingWinner && (
              <Pressable
                style={styles.defendingRow}
                onPress={() =>
                  openDriverCard({ name: nextRound.defendingWinner!, number: '', team: '' })
                }
              >
                <ThemedText style={[styles.defendingLabel, { color: colors.textSecondary }]}>
                  Defending Winner
                </ThemedText>
                <ThemedText style={[styles.defendingName, { color: accent }]}>
                  {nextRound.defendingWinner}
                </ThemedText>
              </Pressable>
            )}
          </View>
        )}

        {/* ─── Commerce Row (Text-Stack Cards) ─────────────────────── */}
        <View style={styles.commerceRow}>
          <Pressable
            style={[styles.commerceCard, { backgroundColor: colors.card, borderTopColor: accent }]}
            onPress={() => setTicketsVisible(true)}
          >
            <ThemedText style={[styles.commerceCardTitle, { color: colors.text }]}>Tickets</ThemedText>
            <ThemedText style={[styles.commerceCardSub, { color: colors.textSecondary }]} numberOfLines={1}>
              {nextRound ? nextRound.name : 'Next race'} {'\u00B7'} {nextRound?.date ?? ''}
            </ThemedText>
            <ThemedText style={[styles.commerceCardMeta, { color: colors.textTertiary }]}>
              {upcomingRounds.length} round{upcomingRounds.length !== 1 ? 's' : ''} remaining
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.commerceCard, { backgroundColor: colors.card, borderTopColor: accent }]}
            onPress={() => setStoreVisible(true)}
          >
            <ThemedText style={[styles.commerceCardTitle, { color: colors.text }]}>Store</ThemedText>
            <ThemedText style={[styles.commerceCardSub, { color: colors.textSecondary }]} numberOfLines={1}>
              Official K-1 Racing Gear
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.commerceCard, { backgroundColor: colors.card, borderTopColor: accent }]}
            onPress={() => setPaddockVisible(true)}
          >
            <ThemedText style={[styles.commerceCardTitle, { color: colors.text }]}>Paddock</ThemedText>
            <ThemedText style={[styles.commerceCardSub, { color: colors.textSecondary }]} numberOfLines={1}>
              VIP & Hospitality
            </ThemedText>
          </Pressable>
        </View>

        {/* ─── Driver Standings (Top 5) ────────────────────────────── */}
        <ThemedText style={[styles.sectionHeader, { color: accent }]}>DRIVER STANDINGS</ThemedText>
        <View style={[styles.standingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {topDrivers.map((d, i) => {
            const teamColor = getTeamColor(d.team);
            const gap = d.points - leaderPoints;
            return (
              <Pressable
                key={d.position}
                style={[
                  styles.standingsRow,
                  i < topDrivers.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
                onPress={() =>
                  openDriverCard({ name: d.name, number: '', team: d.team, points: d.points, wins: d.wins, podiums: d.podiums })
                }
              >
                <ThemedText style={[styles.standingsPos, { color: i === 0 ? accent : colors.textSecondary }]}>
                  {d.position}
                </ThemedText>
                <View style={[styles.teamColorBar, { backgroundColor: teamColor }]} />
                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={[styles.standingsName, { color: i === 0 ? accent : colors.text, fontWeight: i === 0 ? '700' : '400' }]}
                  >
                    {d.name}
                  </ThemedText>
                  <ThemedText style={[styles.standingsTeam, { color: colors.textSecondary }]}>
                    {d.team}{gap < 0 ? ` \u00B7 ${gap} pts` : ''}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.standingsPoints, { color: colors.text }]}>{d.points} pts</ThemedText>
                {d.lastRaceResult != null && <LastRaceBadge result={d.lastRaceResult} />}
                <DeltaIndicator delta={d.delta} colors={colors} />
              </Pressable>
            );
          })}
        </View>
        <Pressable style={styles.seeAllLink}>
          <ThemedText style={[styles.seeAllText, { color: accent }]}>See Full Standings</ThemedText>
        </Pressable>

        {/* ─── Team Standings (Top 5) ──────────────────────────────── */}
        <ThemedText style={[styles.sectionHeader, { color: accent, marginTop: 8 }]}>TEAM STANDINGS</ThemedText>
        <View style={[styles.standingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {topTeams.map((t, i) => {
            const teamColor = getTeamColor(t.name);
            const bestDriverPos = Math.min(
              ...DRIVER_STANDINGS.filter((d) => t.drivers.includes(d.name)).map((d) => d.position),
            );
            return (
              <Pressable
                key={t.position}
                style={[
                  styles.standingsRow,
                  i < topTeams.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
                onPress={() => openTeamCard({ name: t.name, category: t.category })}
              >
                <ThemedText style={[styles.standingsPos, { color: i === 0 ? accent : colors.textSecondary }]}>
                  {t.position}
                </ThemedText>
                <View style={[styles.teamColorBar, { backgroundColor: teamColor }]} />
                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={[styles.standingsName, { color: i === 0 ? accent : colors.text, fontWeight: i === 0 ? '700' : '400' }]}
                  >
                    {t.name}
                  </ThemedText>
                  <ThemedText style={[styles.standingsTeam, { color: colors.textSecondary }]}>
                    {t.drivers.length} drivers {'\u00B7'} best P{bestDriverPos}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.standingsPoints, { color: colors.text }]}>{t.points} pts</ThemedText>
              </Pressable>
            );
          })}
        </View>
        <Pressable style={styles.seeAllLink}>
          <ThemedText style={[styles.seeAllText, { color: accent }]}>See Full Standings</ThemedText>
        </Pressable>

        {/* ─── Domain Cards (RBAC-gated) ───────────────────────────── */}
        {canSeeDashboardSection('race_ops', role) && (
          <Pressable style={[styles.domainCard, { borderTopColor: accent }]}>
            <View style={styles.domainHeader}>
              <IconSymbol name="flag.2.crossed.fill" size={16} color={accent} />
              <ThemedText style={[styles.domainTitle, { color: colors.text }]}>Race Ops</ThemedText>
              <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
            </View>
            <ThemedText style={[styles.domainPreview, { color: colors.textSecondary }]}>
              {nextRound ? `Weekend schedule: ${nextRound.weekendDates.fri} - ${nextRound.weekendDates.sun}` : 'No upcoming races'}
            </ThemedText>
            <ThemedText style={[styles.domainPreview, { color: colors.textSecondary }]}>
              {STEWARD_PENDING_DECISIONS} steward decision{STEWARD_PENDING_DECISIONS !== 1 ? 's' : ''} pending
            </ThemedText>
          </Pressable>
        )}

        {canSeeDashboardSection('technical', role) && (
          <Pressable style={[styles.domainCard, { borderTopColor: accent }]}>
            <View style={styles.domainHeader}>
              <IconSymbol name="wrench.and.screwdriver.fill" size={16} color={accent} />
              <ThemedText style={[styles.domainTitle, { color: colors.text }]}>Technical</ThemedText>
              <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
            </View>
            <ThemedText style={[styles.domainPreview, { color: colors.textSecondary }]}>
              Scrutineering: {compliancePassed}/{complianceTotal} passed
            </ThemedText>
            <ThemedText style={[styles.domainPreview, { color: colors.textSecondary }]}>
              Homologation deadline: {HOMOLOGATION_DEADLINE}
            </ThemedText>
          </Pressable>
        )}

        {canSeeDashboardSection('entries', role) && (
          <Pressable style={[styles.domainCard, { borderTopColor: accent }]}>
            <View style={styles.domainHeader}>
              <IconSymbol name="person.crop.rectangle.stack.fill" size={16} color={accent} />
              <ThemedText style={[styles.domainTitle, { color: colors.text }]}>Entries</ThemedText>
              <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
            </View>
            <ThemedText style={[styles.domainPreview, { color: colors.textSecondary }]}>
              {confirmedEntries}/{MAX_GRID_SIZE} entries confirmed
            </ThemedText>
            <ThemedText style={[styles.domainPreview, { color: colors.textSecondary }]}>
              {pendingWildcards} pending wildcard{pendingWildcards !== 1 ? 's' : ''}
            </ThemedText>
          </Pressable>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ─── Bottom Sheets ──────────────────────────────────────── */}
      <CompTicketsSheet
        visible={ticketsVisible}
        onClose={() => setTicketsVisible(false)}
        colors={colors as any}
      />
      <CompStoreSheet
        visible={storeVisible}
        onClose={() => setStoreVisible(false)}
        colors={colors as any}
      />
      <CompPaddockSheet
        visible={paddockVisible}
        onClose={() => setPaddockVisible(false)}
        colors={colors as any}
      />
    </>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function getTeamColor(teamName: string): string {
  const team = GRID_TEAMS.find((t) => t.name === teamName);
  return team?.color ?? '#6B7280';
}

function LastRaceBadge({ result }: { result: number | 'DNF' | 'DNS' }) {
  let bg: string;
  let label: string;
  if (result === 'DNF') {
    bg = '#EF4444';
    label = 'DNF';
  } else if (result === 'DNS') {
    bg = '#6B7280';
    label = 'DNS';
  } else if (result === 1) {
    bg = '#FFD700';
    label = 'P1';
  } else if (result === 2) {
    bg = '#C0C0C0';
    label = 'P2';
  } else if (result === 3) {
    bg = '#CD7F32';
    label = 'P3';
  } else {
    bg = 'rgba(255,255,255,0.08)';
    label = `P${result}`;
  }
  return (
    <View style={[badgeStyles.badge, { backgroundColor: bg }]}>
      <ThemedText style={badgeStyles.badgeText}>{label}</ThemedText>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.5,
  },
});

function DeltaIndicator({ delta, colors }: { delta: number; colors: typeof Colors.light }) {
  if (delta > 0) {
    return <ThemedText style={[styles.delta, { color: '#22C55E' }]}>{'\u25B2'}{delta}</ThemedText>;
  }
  if (delta < 0) {
    return <ThemedText style={[styles.delta, { color: '#EF4444' }]}>{'\u25BC'}{Math.abs(delta)}</ThemedText>;
  }
  return <ThemedText style={[styles.delta, { color: colors.textTertiary }]}>{'\u2014'}</ThemedText>;
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

  // Hero
  heroWrapper: { borderRadius: 16, overflow: 'hidden', marginBottom: 14 },
  heroGradient: {
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  liveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  heroSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },

  // Next Event
  nextEventCard: { borderRadius: 12, borderWidth: 2, padding: 14, marginBottom: 14 },
  nextEventHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  roundBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBadgeText: { color: '#000', fontSize: 12, fontWeight: '800' },
  nextLabel: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  nextLabelText: { fontSize: 10, fontWeight: '700' },
  nextEventName: { fontSize: 17, fontWeight: '700' },
  nextEventMeta: { fontSize: 12, marginTop: 3 },
  weekendSchedule: { marginTop: 10, gap: 4 },
  weekendRow: { fontSize: 11 },
  defendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  defendingLabel: { fontSize: 11 },
  defendingName: { fontSize: 12, fontWeight: '700' },

  // Commerce Row (text-stack cards)
  commerceRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  commerceCard: {
    flex: 1,
    borderTopWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 3,
  },
  commerceCardTitle: { fontSize: 13, fontWeight: '700' },
  commerceCardSub: { fontSize: 11, fontWeight: '500' },
  commerceCardMeta: { fontSize: 10, fontWeight: '500' },

  // Standings
  sectionHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  standingsCard: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  standingsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  standingsPos: { width: 24, fontSize: 14, fontWeight: '700' },
  teamColorBar: { width: 3, height: 28, borderRadius: 1.5 },
  standingsName: { fontSize: 14 },
  standingsTeam: { fontSize: 10, marginTop: 1 },
  standingsPoints: { fontSize: 13, fontWeight: '700', marginRight: 4 },
  delta: { fontSize: 10, fontWeight: '600', width: 28, textAlign: 'right' },

  seeAllLink: { alignSelf: 'center', paddingVertical: 8, marginBottom: 4 },
  seeAllText: { fontSize: 12, fontWeight: '700' },

  // Domain Cards
  domainCard: {
    backgroundColor: '#181616',
    borderTopWidth: 2,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 4,
  },
  domainHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  domainTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  domainPreview: { fontSize: 11 },
});

```
