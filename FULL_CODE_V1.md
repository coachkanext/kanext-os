## Section A: System Map — Routing, Layouts & Mode Switching


### A1. app/_layout.tsx


```typescript
/**
 * KaNeXT OS Root Layout
 * Entry point with launch sequence, global providers, and navigation structure.
 *
 * Boot Sequence (v1 Locked):
 * 1. Cold launch → Splash screen (Nexus logo + "powered by Nexus")
 * 2. Splash fades → Silent session check
 * 3. If session valid → Resolve access tier → Route to Business Mode Home
 * 4. If no session → Auth modal → Sign in → Resolve tier → Route to Business Mode Home
 *
 * Post-auth default route: Business Mode Home (not Sports).
 * Only shows splash on cold start, not when resuming from background.
 */

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreenModule from 'expo-splash-screen';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import 'react-native-reanimated';

import { SplashScreen } from '@/components/splash-screen';
import { GlobalHeader } from '@/components/global-header';
import { AvatarDrawer } from '@/components/avatar-drawer';
import { AuthModal } from '@/components/auth/auth-modal';
import { SearchOverlay } from '@/components/nexus/search-overlay';
import { ModeSwitcherOverlay } from '@/components/mode-switcher-overlay';
import { KXTransition } from '@/components/kx-transition';
import { AppProvider } from '@/context/app-context';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { registerDrawerHandlers } from '@/utils/global-drawer';
import { registerSearchOverlayHandlers } from '@/utils/global-search-overlay';
import { registerSplitNexusHandlers } from '@/utils/global-split-nexus';

import { registerViewSwitchCallback } from '@/utils/view-switch-lifecycle';
import { requestHomeReset } from '@/utils/global-home';
import { requestOrgReset } from '@/utils/global-org';

import { UniversalFinder } from '@/components/universal-finder';
import { SplitNexusOverlay } from '@/components/nexus/split-nexus-overlay';

import { registerEntitySheetHandlers } from '@/utils/global-entity-sheets';
import type {
  TeamCardData, PlayerCardData, CoachCardData,
  DriverCardData, CrewCardData, PersonCardData, MinistryCardData, LeaderCardData,
} from '@/utils/global-entity-sheets';
import { TeamCardSheet } from '@/components/entity-sheets/team-card-sheet';
import { PlayerCardSheet } from '@/components/entity-sheets/player-card-sheet';
import { CoachCardSheet } from '@/components/entity-sheets/coach-card-sheet';
import { DriverCardSheet } from '@/components/entity-sheets/driver-card-sheet';
import { CrewCardSheet } from '@/components/entity-sheets/crew-card-sheet';
import { PersonCardSheet } from '@/components/entity-sheets/person-card-sheet';
import { MinistryCardSheet } from '@/components/entity-sheets/ministry-card-sheet';
import { LeaderCardSheet } from '@/components/entity-sheets/leader-card-sheet';

// Prevent the native splash screen from auto-hiding
SplashScreenModule.preventAutoHideAsync();

/**
 * Module-level guard: ensures boot splash runs ONCE per app session.
 * This survives component remounts and state resets.
 */
let BOOT_SPLASH_COMPLETED = false;

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

/**
 * App Shell - main app content with navigation
 * Only rendered AFTER boot splash completes
 */
function AppShell() {
  const colorScheme = useColorScheme();
  const [avatarDrawerVisible, setAvatarDrawerVisible] = useState(false);
  const { state: authState } = useAuth();

  // Animation value for content slide (Twitter/X style push)
  const contentSlideAnim = useRef(new Animated.Value(0)).current;

  // Register global drawer handlers
  useEffect(() => {
    registerDrawerHandlers(
      () => setAvatarDrawerVisible(true),
      () => setAvatarDrawerVisible(false)
    );
  }, []);

  // Register view-switch lifecycle callbacks — reset Home + Org tabs on view change
  useEffect(() => {
    const unsub = registerViewSwitchCallback(() => {
      requestHomeReset();
      requestOrgReset();
    });
    return unsub;
  }, []);

  // Entity card sheets — global open/close for team/player/coach/driver/crew/person/ministry/leader cards
  const [teamCardData, setTeamCardData] = useState<TeamCardData | null>(null);
  const [teamCardVisible, setTeamCardVisible] = useState(false);
  const [playerCardData, setPlayerCardData] = useState<PlayerCardData | null>(null);
  const [playerCardVisible, setPlayerCardVisible] = useState(false);
  const [coachCardData, setCoachCardData] = useState<CoachCardData | null>(null);
  const [coachCardVisible, setCoachCardVisible] = useState(false);
  const [driverCardData, setDriverCardData] = useState<DriverCardData | null>(null);
  const [driverCardVisible, setDriverCardVisible] = useState(false);
  const [crewCardData, setCrewCardData] = useState<CrewCardData | null>(null);
  const [crewCardVisible, setCrewCardVisible] = useState(false);
  const [personCardData, setPersonCardData] = useState<PersonCardData | null>(null);
  const [personCardVisible, setPersonCardVisible] = useState(false);
  const [ministryCardData, setMinistryCardData] = useState<MinistryCardData | null>(null);
  const [ministryCardVisible, setMinistryCardVisible] = useState(false);
  const [leaderCardData, setLeaderCardData] = useState<LeaderCardData | null>(null);
  const [leaderCardVisible, setLeaderCardVisible] = useState(false);

  useEffect(() => {
    registerEntitySheetHandlers({
      openTeamCard: (data) => { setTeamCardData(data); setTeamCardVisible(true); },
      closeTeamCard: () => setTeamCardVisible(false),
      openPlayerCard: (data) => { setPlayerCardData(data); setPlayerCardVisible(true); },
      closePlayerCard: () => setPlayerCardVisible(false),
      openCoachCard: (data) => { setCoachCardData(data); setCoachCardVisible(true); },
      closeCoachCard: () => setCoachCardVisible(false),
      openDriverCard: (data) => { setDriverCardData(data); setDriverCardVisible(true); },
      closeDriverCard: () => setDriverCardVisible(false),
      openCrewCard: (data) => { setCrewCardData(data); setCrewCardVisible(true); },
      closeCrewCard: () => setCrewCardVisible(false),
      openPersonCard: (data) => { setPersonCardData(data); setPersonCardVisible(true); },
      closePersonCard: () => setPersonCardVisible(false),
      openMinistryCard: (data) => { setMinistryCardData(data); setMinistryCardVisible(true); },
      closeMinistryCard: () => setMinistryCardVisible(false),
      openLeaderCard: (data) => { setLeaderCardData(data); setLeaderCardVisible(true); },
      closeLeaderCard: () => setLeaderCardVisible(false),
    });
  }, []);

  // Global search overlay state
  const [searchOverlayVisible, setSearchOverlayVisible] = useState(false);

  useEffect(() => {
    registerSearchOverlayHandlers(
      () => setSearchOverlayVisible(true),
      () => setSearchOverlayVisible(false),
    );
  }, []);

  // Split Nexus overlay state (double-tap on Nexus tab)
  const [splitNexusVisible, setSplitNexusVisible] = useState(false);

  useEffect(() => {
    registerSplitNexusHandlers(
      () => setSplitNexusVisible(true),
      () => setSplitNexusVisible(false),
    );
  }, []);

  // Show auth modal when not authenticated (and not still checking)
  const showAuthModal = !authState.isChecking && !authState.isAuthenticated;

  // Normal navigation with tabs + global header
  return (
    <View style={styles.container}>
      {/* Main content - slides right when drawer opens */}
      <Animated.View
        style={[
          styles.contentContainer,
          { transform: [{ translateX: contentSlideAnim }] }
        ]}
      >
        <GlobalHeader />
        <View style={styles.stackContainer}>
          <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="coach" />
            <Stack.Screen name="login" />
            <Stack.Screen name="video" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="profile" />
            <Stack.Screen
              name="modal"
              options={{ presentation: 'modal', title: 'Modal' }}
            />
          </Stack>
        </View>
      </Animated.View>

      {/* Global Avatar Drawer - accessible via long-press on Home tab */}
      <AvatarDrawer
        visible={avatarDrawerVisible}
        onClose={() => setAvatarDrawerVisible(false)}
        contentSlideAnim={contentSlideAnim}
      />

      {/* Entity Card Sheets — lightweight entity previews */}
      <TeamCardSheet
        visible={teamCardVisible}
        onClose={() => setTeamCardVisible(false)}
        data={teamCardData}
      />
      <PlayerCardSheet
        visible={playerCardVisible}
        onClose={() => setPlayerCardVisible(false)}
        data={playerCardData}
      />
      <CoachCardSheet
        visible={coachCardVisible}
        onClose={() => setCoachCardVisible(false)}
        data={coachCardData}
      />
      <DriverCardSheet
        visible={driverCardVisible}
        onClose={() => setDriverCardVisible(false)}
        data={driverCardData}
      />
      <CrewCardSheet
        visible={crewCardVisible}
        onClose={() => setCrewCardVisible(false)}
        data={crewCardData}
      />
      <PersonCardSheet
        visible={personCardVisible}
        onClose={() => setPersonCardVisible(false)}
        data={personCardData}
      />
      <MinistryCardSheet
        visible={ministryCardVisible}
        onClose={() => setMinistryCardVisible(false)}
        data={ministryCardData}
      />
      <LeaderCardSheet
        visible={leaderCardVisible}
        onClose={() => setLeaderCardVisible(false)}
        data={leaderCardData}
      />

      {/* Universal Finder — triggered from Nexus tab double-tap */}
      <UniversalFinder />

      {/* Split Nexus — triggered from Nexus tab double-tap */}
      <SplitNexusOverlay
        visible={splitNexusVisible}
        onClose={() => setSplitNexusVisible(false)}
      />

      {/* Search Overlay — triggered from Nexus tab long-press */}
      <SearchOverlay
        visible={searchOverlayVisible}
        onClose={() => setSearchOverlayVisible(false)}
      />

      {/* Mode Switcher — triggered from Ops tab long-press */}
      <ModeSwitcherOverlay />

      {/* KX Micro-Transition — brief branded flash on tab switches */}
      <KXTransition />

      {/* Auth Modal — blocks interaction until authenticated */}
      <AuthModal visible={showAuthModal} />
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAppReady, setIsAppReady] = useState(false);

  // Boot splash guard: uses module-level flag to ensure it only shows ONCE per app session.
  // Initialize from the module flag so remounts don't reset this.
  const [bootSplashVisible, setBootSplashVisible] = useState(() => !BOOT_SPLASH_COMPLETED);

  // Extra guard: useRef to prevent any race conditions within a single mount
  const splashCompletedRef = useRef(BOOT_SPLASH_COMPLETED);

  useEffect(() => {
    // Initialize app
    async function prepare() {
      try {
        // Hide native splash immediately so our custom splash shows
        await SplashScreenModule.hideAsync();

        // Minimum 2 second display time for splash
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // App is ready - this will trigger our custom splash to fade out
        setIsAppReady(true);
      }
    }

    prepare();
  }, []);

  const handleSplashComplete = useCallback(() => {
    // Guard: only complete once
    if (splashCompletedRef.current) return;

    // Set module-level flag FIRST to prevent any future remounts from showing splash
    BOOT_SPLASH_COMPLETED = true;
    splashCompletedRef.current = true;

    // Remove splash from view
    setBootSplashVisible(false);
  }, []);

  // App content with optional splash overlay
  return (
    <AuthProvider>
      <AppProvider>
        <ThemeProvider value={DarkTheme}>
          <GestureHandlerRootView style={styles.container}>
            <BottomSheetModalProvider>
              <AppShell />

              {/* Boot splash overlay - fades out when app is ready */}
              {bootSplashVisible && !BOOT_SPLASH_COMPLETED && (
                <SplashScreen
                  onReady={handleSplashComplete}
                  isAppReady={isAppReady}
                />
              )}
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
          <StatusBar style="light" />
        </ThemeProvider>
      </AppProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#0f0f0f', // Prevents seeing through during animation
  },
  stackContainer: {
    flex: 1,
  },
});

```


### A2. app/(tabs)/_layout.tsx


```typescript
/**
 * KaNeXT OS — Universal Bottom Navigation (Global Footer) — LOCKED
 *
 * Tabs (left → right, glyphs only):
 *   Home | Media | Nexus | Messages | Organization
 *
 * Rules:
 * - UNIVERSAL across ALL MODES (no exceptions in v1)
 * - Glyph icons only (no text labels)
 * - Order is fixed and must never change per mode
 * - Nexus is the center anchor (primary) and always present
 * - Each tab routes to its mode-aware root surface
 * - Long-press Organization → Mode Switcher
 */

import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useRef, useCallback } from 'react';
import { Platform, Text, Image, StyleSheet } from 'react-native';

import * as Haptics from 'expo-haptics';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol, SymbolViewProps } from '@/components/ui/icon-symbol';
import { Colors, Layout, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMode } from '@/context/app-context';
import { openAvatarDrawer } from '@/utils/global-drawer';
import { openSearchOverlay } from '@/utils/global-search-overlay';
import { openFinder } from '@/utils/global-finder';
import { openSplitNexus } from '@/utils/global-split-nexus';
import { triggerKXTransition } from '@/utils/global-transition';
import { requestHomeReset } from '@/utils/global-home';
import { requestOrgReset } from '@/utils/global-org';
import { openModeSwitcher } from '@/utils/global-mode-switcher';

// Tab icon component
function TabIcon({
  name,
  color,
  focused,
}: {
  name: SymbolViewProps['name'];
  color: string;
  focused: boolean;
}) {
  return <IconSymbol size={24} name={name} color={color} />;
}

const NEXUS_ICON = require('@/assets/images/nexus-logo.png');

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const mode = useMode();
  const nexusColor = ModeColors[mode].nexusGlyph;
  const nexusColorDim = ModeColors[mode].nexusGlyphDim;
  const router = useRouter();
  const hasNavigated = useRef(false);

  // Default tab button with KX transition
  const TransitionTab = useCallback(
    (props: any) => (
      <HapticTab
        {...props}
        onPress={(e: any) => {
          triggerKXTransition();
          props.onPress?.(e);
        }}
      />
    ),
    []
  );

  // Home tab button with long-press to open avatar drawer + transition
  const HomeTabButton = useCallback(
    (props: any) => (
      <HapticTab
        {...props}
        onLongPress={openAvatarDrawer}
        onPress={(e: any) => {
          triggerKXTransition();
          requestHomeReset();
          props.onPress?.(e);
        }}
      />
    ),
    []
  );

  // Nexus tab button: long-press → search overlay, double-tap → split Nexus
  const lastNexusTapRef = useRef(0);
  const NexusTabButton = useCallback(
    (props: any) => (
      <HapticTab
        {...props}
        onLongPress={openSearchOverlay}
        onPress={(e: any) => {
          const now = Date.now();
          if (now - lastNexusTapRef.current < 350) {
            // Double-tap detected → open Split Nexus overlay
            lastNexusTapRef.current = 0;
            openSplitNexus();
            return;
          }
          lastNexusTapRef.current = now;
          triggerKXTransition();
          props.onPress?.(e);
        }}
      />
    ),
    []
  );

  // Ops tab button: long-press → mode switcher
  const OpsTabButton = useCallback(
    (props: any) => (
      <HapticTab
        {...props}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          openModeSwitcher();
        }}
        onPress={(e: any) => {
          triggerKXTransition();
          requestOrgReset();
          props.onPress?.(e);
        }}
      />
    ),
    []
  );

  // Post-auth default: route to Home (Business Mode Home)
  useEffect(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    // Small delay to ensure tabs are mounted before navigating
    const timer = setTimeout(() => {
      router.replace('/(tabs)/' as any);
    }, 50);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: 'rgba(255,255,255,0.08)',
          height: Platform.OS === 'ios' ? Layout.tabBarHeight : 60,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 8,
        },
        headerShown: false,
        tabBarButton: TransitionTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="house.fill" color={color} focused={focused} />
          ),
          tabBarButton: HomeTabButton,
        }}
      />
      <Tabs.Screen
        name="media"
        options={{
          title: 'Video',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="play.rectangle.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null, // Hidden from tab bar - accessible via TopBar search icon
        }}
      />
      <Tabs.Screen
        name="nexus"
        options={{
          title: 'Nexus',
          tabBarIcon: ({ focused }) => (
            <Image
              source={NEXUS_ICON}
              style={[tabStyles.nexusIcon, { opacity: focused ? 1 : 0.45 }]}
              resizeMode="contain"
            />
          ),
          tabBarButton: NexusTabButton,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="bubble.left.and.bubble.right.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="organization"
        options={{
          title: 'Organization',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="building.2.fill" color={color} focused={focused} />
          ),
          tabBarButton: OpsTabButton,
        }}
      />

      {/* Hide the old/unused screens */}
      <Tabs.Screen
        name="home"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const tabStyles = StyleSheet.create({
  nexusIcon: {
    width: 36,
    height: 36,
  },
});

```


### A3. app/(tabs)/index.tsx


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
import { FMU_GAMES, FMU_GAMES_BY_ID, FMU_LEADERS, FMU_STANDINGS, FMU_NEWS, FMU_RECORD, FMU_LAST_GAME, FMU_LAST_GAME_ID, FMU_NEXT_GAME, FMU_NEXT_GAME_ID, FMU_SEASON_COMPLETE, FMU_GAME_BPR, getBPRColor, FMU_GAME_IMPACT, getBPRColor, getTPQColor, tgisToDisplay, FMU_PREGAME, ROSTER_KR, DNA_OFFENSE_POOL, DNA_DEFENSE_POOL, DNA_TEMPO_POOL, jerseyArchetypeMap, POSITIVE_IMPACT, NEGATIVE_IMPACT, type PregameSnapshot, type ClusterRating } from '@/data/fmu';
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
  const [activeRecentBPR, setActiveRecentBPR] = useState(0);
  const [fullRecentBPROpen, setFullRecentBPROpen] = useState(false);
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

                {/* TPQ + BPR for completed games, Pregame Snapshot for upcoming */}
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

                      {/* Our Depth Chart with BPR */}
                      <UnitsView
                        depthChart={DEPTH_CHART_BY_SEASON[CURRENT_SEASON]}
                        gameImpact={recentImpact ?? undefined}
                        hideSystems
                        statLeaders={[...recentImpact.starters, ...recentImpact.bench]
                          .sort((a, b) => b.pgis - a.pgis)
                          .slice(0, 3)
                          .map((p) => ({ label: 'BPR', name: p.name.split(' ').slice(1).join(' ') || p.name, value: `${p.pgis > 0 ? '+' : ''}${p.pgis}` }))}
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


### A4. app/(tabs)/organization/index.tsx


```typescript
/**
 * Organization Screen — 6 tabs × 3 views per mode (V3)
 * Universal tabs: Program | People | Finance | Compliance | Facilities | Ledger
 * View labels change per mode. Content adapts. RBAC controls visibility.
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, InteractionManager } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useFocusEffect } from '@react-navigation/core';
import { consumeOrgReset, registerOrgResetCallback } from '@/utils/global-org';

import { ThemedView } from '@/components/themed-view';
import { Colors, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext, useMode, useMembershipId } from '@/context/app-context';
import { getSportsRole } from '@/utils/sports-rbac';
import { getChurchRole } from '@/utils/church-rbac';
import { getBusinessRole } from '@/utils/business-rbac';
import { getEducationRole } from '@/utils/education-rbac';
import { getCompetitionRole } from '@/utils/competition-rbac';
import { BusinessProvider, useBusiness } from '@/context/business-context';
import { ChurchProvider, useChurch } from '@/context/church-context';
import { EducationProvider, useEducation } from '@/context/education-context';
import { PagedTabBar } from '@/components/ui/paged-tab-bar';
import { EdgeHoldAdvance } from '@/components/ui/edge-hold-advance';
import { OrgSwitcherSheet } from '@/components/organization/org-switcher-sheet';
import { EntityScopeBar } from '@/components/business/entity-scope-bar';
import { EntitySwitcherSheet } from '@/components/business/entity-switcher-sheet';
import type { Mode } from '@/types';

// ── Sports V3 ────────────────────────────────────────────────────────────────
import { SportsProgram } from '@/components/organization/sports-program-v3';
import { SportsPeople } from '@/components/organization/sports-people-v3';
import { SportsFinance } from '@/components/organization/sports-finance-v3';
import { SportsCompliance } from '@/components/organization/sports-compliance-v3';
import { SportsFacilities } from '@/components/organization/sports-facilities-v3';
import { SportsLedger } from '@/components/organization/sports-ledger-v3';

// ── Business V3 ──────────────────────────────────────────────────────────────
import { BizProgram } from '@/components/organization/biz-program-v3';
import { BizPeople } from '@/components/organization/biz-people-v3';
import { BizFinance } from '@/components/organization/biz-finance-v3';
import { BizCompliance } from '@/components/organization/biz-compliance-v3';
import { BizFacilities } from '@/components/organization/biz-facilities-v3';
import { BizLedger } from '@/components/organization/biz-ledger-v3';

// ── Church V3 ────────────────────────────────────────────────────────────────
import { ChurchProgram } from '@/components/organization/church-program-v3';
import { ChurchPeople } from '@/components/organization/church-people-v3';
import { ChurchFinance } from '@/components/organization/church-finance-v3';
import { ChurchCompliance } from '@/components/organization/church-compliance-v3';
import { ChurchFacilities } from '@/components/organization/church-facilities-v3';
import { ChurchLedger } from '@/components/organization/church-ledger-v3';

// ── Education V3 ─────────────────────────────────────────────────────────────
import { EduProgram } from '@/components/organization/edu-program-v3';
import { EduPeople } from '@/components/organization/edu-people-v3';
import { EduFinance } from '@/components/organization/edu-finance-v3';
import { EduCompliance } from '@/components/organization/edu-compliance-v3';
import { EduFacilities } from '@/components/organization/edu-facilities-v3';
import { EduLedger } from '@/components/organization/edu-ledger-v3';

// ── Competition V3 ───────────────────────────────────────────────────────────
import { CompProgram } from '@/components/organization/comp-program-v3';
import { CompPeople } from '@/components/organization/comp-people-v3';
import { CompFinance } from '@/components/organization/comp-finance-v3';
import { CompCompliance } from '@/components/organization/comp-compliance-v3';
import { CompFacilities } from '@/components/organization/comp-facilities-v3';
import { CompLedger } from '@/components/organization/comp-ledger-v3';

// =============================================================================
// UNIVERSAL 6-TAB DEFINITION
// =============================================================================

const ORG_TABS = [
  { id: 'program', label: 'Program' },
  { id: 'people', label: 'People' },
  { id: 'finance', label: 'Finance' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'ledger', label: 'Ledger' },
];

const PAGE_STYLE = { flex: 1 } as const;

// =============================================================================
// SHARED PAGER HOOK — reset + focus logic
// =============================================================================

function useOrgPager() {
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  const resetToFirst = useCallback(() => {
    setActiveIndex(0);
    pagerRef.current?.setPage(0);
  }, []);

  useEffect(() => {
    registerOrgResetCallback(resetToFirst);
    return () => registerOrgResetCallback(null);
  }, [resetToFirst]);

  useFocusEffect(
    useCallback(() => {
      if (consumeOrgReset()) {
        InteractionManager.runAfterInteractions(() => { resetToFirst(); });
      }
    }, [resetToFirst])
  );

  return { activeIndex, setActiveIndex, pagerRef, handleTabPress };
}

// =============================================================================
// SPORTS MODE
// =============================================================================

function SportsOrganization() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = ModeColors.sports.primary;
  const membershipId = useMembershipId();
  const role = useMemo(() => getSportsRole(membershipId), [membershipId]);
  const { activeIndex, setActiveIndex, pagerRef, handleTabPress } = useOrgPager();

  return (
    <>
      <PagedTabBar tabs={ORG_TABS} activeIndex={activeIndex} onTabPress={handleTabPress} />
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={ORG_TABS.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          {ORG_TABS.map((tab) => {
            const p = { colors, accentColor: accent, role };
            switch (tab.id) {
              case 'program': return <View key="program" style={PAGE_STYLE}><SportsProgram {...p} /></View>;
              case 'people': return <View key="people" style={PAGE_STYLE}><SportsPeople {...p} /></View>;
              case 'finance': return <View key="finance" style={PAGE_STYLE}><SportsFinance {...p} /></View>;
              case 'compliance': return <View key="compliance" style={PAGE_STYLE}><SportsCompliance {...p} /></View>;
              case 'facilities': return <View key="facilities" style={PAGE_STYLE}><SportsFacilities {...p} /></View>;
              case 'ledger': return <View key="ledger" style={PAGE_STYLE}><SportsLedger {...p} /></View>;
              default: return <View key={tab.id} style={PAGE_STYLE} />;
            }
          })}
        </PagerView>
      </EdgeHoldAdvance>
    </>
  );
}

// =============================================================================
// CHURCH MODE
// =============================================================================

function ChurchOrganization() {
  return (
    <ChurchProvider>
      <ChurchOrganizationInner />
    </ChurchProvider>
  );
}

function ChurchOrganizationInner() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = ModeColors.church.primary;
  const { viewAsRole } = useChurch();
  const membershipId = useMembershipId();
  const derivedRole = useMemo(() => getChurchRole(membershipId), [membershipId]);
  const effectiveRole = viewAsRole ?? derivedRole;
  const { activeIndex, setActiveIndex, pagerRef, handleTabPress } = useOrgPager();

  return (
    <>
      <PagedTabBar tabs={ORG_TABS} activeIndex={activeIndex} onTabPress={handleTabPress} />
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={ORG_TABS.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          {ORG_TABS.map((tab) => {
            const p = { colors, accentColor: accent, role: effectiveRole };
            switch (tab.id) {
              case 'program': return <View key="program" style={PAGE_STYLE}><ChurchProgram {...p} /></View>;
              case 'people': return <View key="people" style={PAGE_STYLE}><ChurchPeople {...p} /></View>;
              case 'finance': return <View key="finance" style={PAGE_STYLE}><ChurchFinance {...p} /></View>;
              case 'compliance': return <View key="compliance" style={PAGE_STYLE}><ChurchCompliance {...p} /></View>;
              case 'facilities': return <View key="facilities" style={PAGE_STYLE}><ChurchFacilities {...p} /></View>;
              case 'ledger': return <View key="ledger" style={PAGE_STYLE}><ChurchLedger {...p} /></View>;
              default: return <View key={tab.id} style={PAGE_STYLE} />;
            }
          })}
        </PagerView>
      </EdgeHoldAdvance>
    </>
  );
}

// =============================================================================
// EDUCATION MODE
// =============================================================================

function EducationOrganization() {
  return (
    <EducationProvider>
      <EducationOrganizationInner />
    </EducationProvider>
  );
}

function EducationOrganizationInner() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = ModeColors.education.primary;
  const { viewAsRole } = useEducation();
  const membershipId = useMembershipId();
  const derivedRole = useMemo(() => getEducationRole(membershipId), [membershipId]);
  const effectiveRole = viewAsRole ?? derivedRole;
  const { activeIndex, setActiveIndex, pagerRef, handleTabPress } = useOrgPager();

  return (
    <>
      <PagedTabBar tabs={ORG_TABS} activeIndex={activeIndex} onTabPress={handleTabPress} />
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={ORG_TABS.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          {ORG_TABS.map((tab) => {
            const p = { colors, accentColor: accent, role: effectiveRole };
            switch (tab.id) {
              case 'program': return <View key="program" style={PAGE_STYLE}><EduProgram {...p} /></View>;
              case 'people': return <View key="people" style={PAGE_STYLE}><EduPeople {...p} /></View>;
              case 'finance': return <View key="finance" style={PAGE_STYLE}><EduFinance {...p} /></View>;
              case 'compliance': return <View key="compliance" style={PAGE_STYLE}><EduCompliance {...p} /></View>;
              case 'facilities': return <View key="facilities" style={PAGE_STYLE}><EduFacilities {...p} /></View>;
              case 'ledger': return <View key="ledger" style={PAGE_STYLE}><EduLedger {...p} /></View>;
              default: return <View key={tab.id} style={PAGE_STYLE} />;
            }
          })}
        </PagerView>
      </EdgeHoldAdvance>
    </>
  );
}

// =============================================================================
// COMPETITION MODE
// =============================================================================

function CommunityOrganization() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = ModeColors.competition.primary;
  const membershipId = useMembershipId();
  const role = useMemo(() => getCompetitionRole(membershipId), [membershipId]);
  const { activeIndex, setActiveIndex, pagerRef, handleTabPress } = useOrgPager();

  return (
    <>
      <PagedTabBar tabs={ORG_TABS} activeIndex={activeIndex} onTabPress={handleTabPress} />
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={ORG_TABS.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          {ORG_TABS.map((tab) => {
            const p = { colors, accentColor: accent, role };
            switch (tab.id) {
              case 'program': return <View key="program" style={PAGE_STYLE}><CompProgram {...p} /></View>;
              case 'people': return <View key="people" style={PAGE_STYLE}><CompPeople {...p} /></View>;
              case 'finance': return <View key="finance" style={PAGE_STYLE}><CompFinance {...p} /></View>;
              case 'compliance': return <View key="compliance" style={PAGE_STYLE}><CompCompliance {...p} /></View>;
              case 'facilities': return <View key="facilities" style={PAGE_STYLE}><CompFacilities {...p} /></View>;
              case 'ledger': return <View key="ledger" style={PAGE_STYLE}><CompLedger {...p} /></View>;
              default: return <View key={tab.id} style={PAGE_STYLE} />;
            }
          })}
        </PagerView>
      </EdgeHoldAdvance>
    </>
  );
}

// =============================================================================
// BUSINESS MODE
// =============================================================================

function BusinessOrganization() {
  return (
    <BusinessProvider>
      <BusinessOrganizationInner />
    </BusinessProvider>
  );
}

function BusinessOrganizationInner() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = ModeColors.business.primary;
  const { viewAsRole, selectedEntity, selectedEntityId } = useBusiness();
  const membershipId = useMembershipId();
  const derivedRole = useMemo(() => getBusinessRole(membershipId), [membershipId]);
  const effectiveRole = viewAsRole ?? derivedRole;
  const [entitySwitcherVisible, setEntitySwitcherVisible] = useState(false);
  const { activeIndex, setActiveIndex, pagerRef, handleTabPress } = useOrgPager();

  return (
    <>
      <PagedTabBar tabs={ORG_TABS} activeIndex={activeIndex} onTabPress={handleTabPress} />
      <EntityScopeBar
        entityId={selectedEntityId}
        entityName={selectedEntity.name}
        entityType={selectedEntity.type}
        status="active"
        onSwitch={() => setEntitySwitcherVisible(true)}
        colors={colors}
      />
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={ORG_TABS.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          {ORG_TABS.map((tab) => {
            const p = { colors, accentColor: accent, role: effectiveRole };
            switch (tab.id) {
              case 'program': return <View key="program" style={PAGE_STYLE}><BizProgram {...p} /></View>;
              case 'people': return <View key="people" style={PAGE_STYLE}><BizPeople {...p} /></View>;
              case 'finance': return <View key="finance" style={PAGE_STYLE}><BizFinance {...p} /></View>;
              case 'compliance': return <View key="compliance" style={PAGE_STYLE}><BizCompliance {...p} /></View>;
              case 'facilities': return <View key="facilities" style={PAGE_STYLE}><BizFacilities {...p} /></View>;
              case 'ledger': return <View key="ledger" style={PAGE_STYLE}><BizLedger {...p} /></View>;
              default: return <View key={tab.id} style={PAGE_STYLE} />;
            }
          })}
        </PagerView>
      </EdgeHoldAdvance>
      <EntitySwitcherSheet
        visible={entitySwitcherVisible}
        onClose={() => setEntitySwitcherVisible(false)}
      />
    </>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function OrganizationScreen() {
  const { state, setOrganization } = useAppContext();
  const mode = useMode();
  const [switcherVisible, setSwitcherVisible] = useState(false);

  const renderModeContent = () => {
    switch (mode) {
      case 'sports': return <SportsOrganization />;
      case 'church': return <ChurchOrganization />;
      case 'education': return <EducationOrganization />;
      case 'competition': return <CommunityOrganization />;
      case 'business': return <BusinessOrganization />;
      default: return null;
    }
  };

  return (
    <ThemedView style={styles.container}>
      {renderModeContent()}
      <OrgSwitcherSheet
        visible={switcherVisible}
        onClose={() => setSwitcherVisible(false)}
        mode={mode}
        currentOrgId={state.organization?.id ?? ''}
        onSelectOrg={(org) => {
          setOrganization({
            id: org.id,
            name: org.name,
            mode,
            type: '',
            location: org.subtitle,
          });
        }}
      />
    </ThemedView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: { flex: 1 },
  pager: { flex: 1 },
});

```


### A5. context/app-context.tsx


```typescript
/**
 * KaNeXT OS Global App Context
 * Single source of truth for mode, organization, role, cycle, and auth state.
 * Includes AsyncStorage persistence for state across app restarts.
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppContextState, Mode, Role, Organization, Cycle, Program, ActiveContext, RecentContext, ActiveView, ActiveViewKey } from '@/types';
import {
  DEFAULT_ACTIVE_CONTEXT,
  SEEDED_RECENT_CONTEXTS,
  getOrgById,
  getProgramById,
  getSeasonById,
  getDefaultContextForMode,
} from '@/data/mock-memberships';
import { deriveRoleBadge } from '@/utils/role-badge';
import { buildActiveView, getActiveViewKey } from '@/utils/active-view';
import { notifyViewSwitch } from '@/utils/view-switch-lifecycle';

// Storage keys
const STORAGE_KEYS = {
  lastMode: 'kx:lastMode',
  hasCompletedModePick: 'kx:hasCompletedModePick',
  auth: 'kx:auth',
  sportsOrganization: 'kx:sportsOrganization',
  sportsProgram: 'kx:sportsProgram',
  sportsSeason: 'kx:sportsSeason',
  activeContext: 'kx:activeContext',
  recentContexts: 'kx:recentContexts',
  activeView: 'kx:activeView',
};

// Auth state type
type AuthState = 'viewer' | 'owner';

// Landing tab for navigation control
type LandingTab = 'home' | 'nexus' | null;

// Extended state with auth, landing control, V2 context, and ActiveView
interface ExtendedAppState extends AppContextState {
  authState: AuthState;
  pendingLandingTab: LandingTab;
  activeContext: ActiveContext;
  recentContexts: RecentContext[];
  activeView: ActiveView | null;
  activeViewKey: ActiveViewKey;
}

// =============================================================================
// DEMO DATA
// =============================================================================

const DEMO_ORGANIZATIONS: Record<Mode, Organization> = {
  sports: {
    id: 'fmu-basketball',
    name: 'Florida Memorial University',
    mode: 'sports',
    type: 'college_basketball',
    location: 'Miami Gardens, FL',
    description: 'Florida Memorial University Lions Men\'s Basketball',
  },
  church: {
    id: 'icc',
    name: 'International Christian Center',
    mode: 'church',
    type: 'church',
    location: 'Los Angeles, CA',
    description: 'Inter-denominational, Pentecostal',
  },
  education: {
    id: 'sdcc',
    name: 'San Diego Christian College',
    mode: 'education',
    type: 'college',
    location: 'San Diego County, CA',
    description: 'Private Christian Liberal Arts College',
  },
  business: {
    id: 'kanext-biz',
    name: 'KaNeXT',
    mode: 'business',
    type: 'platform',
    location: 'Tennessee',
    description: 'KaNeXT Institutional OS Platform',
  },
  competition: {
    id: 'k1-league',
    name: 'K-1 Hypercar Championship',
    mode: 'competition',
    type: 'motorsport_league',
    location: 'Global',
    description: 'K-1 Hypercar Championship',
  },
};

const DEMO_CYCLES: Record<Mode, Cycle> = {
  sports: {
    id: '2025-26',
    name: '2025-26',
    startDate: new Date('2025-10-01'),
    endDate: new Date('2026-04-01'),
    isCurrent: true,
  },
  church: {
    id: '2025',
    name: '2025',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    isCurrent: true,
  },
  education: {
    id: '2025-26-academic',
    name: '2025-2026 Academic Year',
    startDate: new Date('2025-08-25'),
    endDate: new Date('2026-05-15'),
    isCurrent: true,
  },
  business: {
    id: 'fy2026',
    name: 'FY 2026',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    isCurrent: true,
  },
  competition: {
    id: 'k1-s1-2026',
    name: 'Season 1 · 2026',
    startDate: new Date('2026-03-01'),
    endDate: new Date('2026-11-30'),
    isCurrent: true,
  },
};

const DEMO_ROLES: Record<Mode, Role> = {
  sports: 'head_coach',
  church: 'member',
  education: 'faculty',
  business: 'founder',
  competition: 'league_admin',
};

const DEMO_PROGRAM: Program = {
  id: 'varsity',
  name: 'Varsity',
  level: 'varsity',
};

// Programs for sports mode
const SPORTS_PROGRAMS: Record<string, Program> = {
  'Varsity': { id: 'varsity', name: 'Varsity', level: 'varsity' },
  'Development I': { id: 'dev-1', name: 'Development I', level: 'development_1' },
  'Development II': { id: 'dev-2', name: 'Development II', level: 'development_2' },
  'Postgrad': { id: 'postgrad', name: 'Postgrad', level: 'postgrad' },
};

// Seasons for sports mode
const SPORTS_SEASONS: Record<string, Cycle> = {
  '2025-26': { id: '2025-26', name: '2025-26', startDate: new Date('2025-10-01'), endDate: new Date('2026-04-01'), isCurrent: true },
  '2024-25': { id: '2024-25', name: '2024-25', startDate: new Date('2024-10-01'), endDate: new Date('2025-04-01'), isCurrent: false },
  '2023-24': { id: '2023-24', name: '2023-24', startDate: new Date('2023-10-01'), endDate: new Date('2024-04-01'), isCurrent: false },
};

// Organizations for sports mode (static for now)
const SPORTS_ORGANIZATIONS: Record<string, Organization> = {
  'Florida Memorial University': {
    id: 'fmu-basketball',
    name: 'Florida Memorial University',
    mode: 'sports',
    type: 'college_basketball',
    location: 'Miami Gardens, FL',
    description: 'Florida Memorial University Lions Men\'s Basketball',
  },
  'Middlebrooks Academy': {
    id: 'middlebrooks-academy',
    name: 'Middlebrooks Academy',
    mode: 'sports',
    type: 'prep_school',
    location: 'Atlanta, GA',
    description: 'Elite Prep Basketball Program',
  },
  'Cathedral HS': {
    id: 'cathedral-hs',
    name: 'Cathedral HS',
    mode: 'sports',
    type: 'high_school',
    location: 'Indianapolis, IN',
    description: 'Cathedral High School Basketball',
  },
};

// Export for use in avatar drawer
export { SPORTS_ORGANIZATIONS, SPORTS_PROGRAMS, SPORTS_SEASONS };

// =============================================================================
// DEFAULT STATE
// =============================================================================

const defaultState: ExtendedAppState = {
  mode: 'sports',
  organization: DEMO_ORGANIZATIONS.sports,
  operatingRole: DEMO_ROLES.sports,
  cycle: DEMO_CYCLES.sports,
  program: DEMO_PROGRAM,
  isFirstRun: true,
  isLoading: true,
  authState: 'viewer',
  pendingLandingTab: null,
  activeContext: DEFAULT_ACTIVE_CONTEXT,
  recentContexts: SEEDED_RECENT_CONTEXTS,
  activeView: null,
  activeViewKey: '',
};

// =============================================================================
// ACTIONS
// =============================================================================

type AppAction =
  | { type: 'SET_MODE'; payload: Mode }
  | { type: 'SWITCH_MODE'; payload: Mode }
  | { type: 'SET_ORGANIZATION'; payload: Organization | null }
  | { type: 'SET_ROLE'; payload: Role }
  | { type: 'SET_CYCLE'; payload: Cycle | null }
  | { type: 'SET_PROGRAM'; payload: Program | null }
  | { type: 'SET_FIRST_RUN'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTH_STATE'; payload: AuthState }
  | { type: 'SET_PENDING_LANDING_TAB'; payload: LandingTab }
  | { type: 'INITIALIZE'; payload: Partial<ExtendedAppState> }
  | { type: 'RESTORE_STATE'; payload: { mode: Mode; authState: AuthState; organization?: string; program?: string; season?: string } }
  | { type: 'SWITCH_CONTEXT'; payload: ActiveContext }
  | { type: 'SET_ACTIVE_VIEW'; payload: ActiveView };

function appReducer(state: ExtendedAppState, action: AppAction): ExtendedAppState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SWITCH_MODE': {
      const newMode = action.payload;
      return {
        ...state,
        mode: newMode,
        organization: DEMO_ORGANIZATIONS[newMode],
        operatingRole: DEMO_ROLES[newMode],
        cycle: DEMO_CYCLES[newMode],
        program: newMode === 'sports' ? DEMO_PROGRAM : null,
      };
    }
    case 'SET_ORGANIZATION':
      return { ...state, organization: action.payload };
    case 'SET_ROLE':
      return { ...state, operatingRole: action.payload };
    case 'SET_CYCLE':
      return { ...state, cycle: action.payload };
    case 'SET_PROGRAM':
      return { ...state, program: action.payload };
    case 'SET_FIRST_RUN':
      return { ...state, isFirstRun: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_AUTH_STATE':
      return { ...state, authState: action.payload };
    case 'SET_PENDING_LANDING_TAB':
      return { ...state, pendingLandingTab: action.payload };
    case 'INITIALIZE':
      return { ...state, ...action.payload, isLoading: false };
    case 'RESTORE_STATE': {
      const { mode, authState, organization, program, season } = action.payload;
      const resolvedOrganization = mode === 'sports' && organization && SPORTS_ORGANIZATIONS[organization]
        ? SPORTS_ORGANIZATIONS[organization]
        : DEMO_ORGANIZATIONS[mode];
      const resolvedProgram = program && SPORTS_PROGRAMS[program] ? SPORTS_PROGRAMS[program] : DEMO_PROGRAM;
      const resolvedSeason = season && SPORTS_SEASONS[season] ? SPORTS_SEASONS[season] : DEMO_CYCLES[mode];
      return {
        ...state,
        mode,
        organization: resolvedOrganization,
        operatingRole: DEMO_ROLES[mode],
        cycle: mode === 'sports' ? resolvedSeason : DEMO_CYCLES[mode],
        program: mode === 'sports' ? resolvedProgram : null,
        isFirstRun: false,
        isLoading: false,
        authState,
      };
    }
    case 'SET_ACTIVE_VIEW': {
      const view = action.payload;
      const viewKey = getActiveViewKey(view);

      // Build legacy ActiveContext from the view for V2 backwards compat
      const legacyCtx: ActiveContext = {
        mode: view.mode,
        org_id: view.org_id,
        program_id: view.scope_id,
        season_id: view.season_id,
        membership_id: view.membership_id,
        derived_role_badge: view.derived_role_badge,
      };

      // Resolve legacy Organization shape
      const viewOrg = getOrgById(view.org_id);
      const legacyOrg: Organization | null = viewOrg
        ? { id: viewOrg.org_id, name: viewOrg.org_name, mode: viewOrg.mode, type: viewOrg.org_type ?? '', location: viewOrg.location, description: viewOrg.description }
        : { id: view.org_id, name: view.org_name, mode: view.mode, type: '', location: '', description: '' };

      // Resolve legacy Program shape
      const viewProgram = getProgramById(view.scope_id);
      const legacyProgram: Program | null = viewProgram
        ? { id: viewProgram.program_id, name: viewProgram.program_name, level: 'varsity' }
        : null;

      // Resolve legacy Cycle shape
      const viewSeason = getSeasonById(view.season_id);
      const legacyCycle: Cycle | null = viewSeason
        ? { id: viewSeason.season_id, name: viewSeason.season_name, startDate: new Date(viewSeason.start_date), endDate: new Date(viewSeason.end_date), isCurrent: viewSeason.is_current }
        : DEMO_CYCLES[view.mode] ?? null;

      // Push previous context to recents (dedup by membership_id)
      const prevCtx: RecentContext = { ...state.activeContext, timestamp: Date.now() };
      const dedupedRecents = state.recentContexts.filter(
        (r) => !(r.org_id === prevCtx.org_id && r.membership_id === prevCtx.membership_id),
      );
      const updatedRecents = [prevCtx, ...dedupedRecents].slice(0, 10);

      return {
        ...state,
        activeView: view,
        activeViewKey: viewKey,
        activeContext: legacyCtx,
        recentContexts: updatedRecents,
        mode: view.mode,
        organization: legacyOrg,
        program: legacyProgram,
        cycle: legacyCycle,
        operatingRole: DEMO_ROLES[view.mode] ?? 'head_coach',
        isFirstRun: false,
      };
    }
    case 'SWITCH_CONTEXT': {
      const ctx = action.payload;
      const v2Org = getOrgById(ctx.org_id);
      const v2Program = getProgramById(ctx.program_id);
      const v2Season = getSeasonById(ctx.season_id);

      const legacyOrg: Organization | null = v2Org
        ? { id: v2Org.org_id, name: v2Org.org_name, mode: v2Org.mode, type: v2Org.org_type ?? '', location: v2Org.location, description: v2Org.description }
        : null;

      const legacyProgram: Program | null = v2Program
        ? { id: v2Program.program_id, name: v2Program.program_name, level: 'varsity' }
        : null;

      const legacyCycle: Cycle | null = v2Season
        ? { id: v2Season.season_id, name: v2Season.season_name, startDate: new Date(v2Season.start_date), endDate: new Date(v2Season.end_date), isCurrent: v2Season.is_current }
        : null;

      // Push previous context to recents (dedup by membership+program+season)
      const prev: RecentContext = { ...state.activeContext, timestamp: Date.now() };
      const deduped = state.recentContexts.filter(
        (r) => !(r.org_id === prev.org_id && r.program_id === prev.program_id && r.membership_id === prev.membership_id),
      );
      const newRecents = [prev, ...deduped].slice(0, 10);

      return {
        ...state,
        activeContext: ctx,
        recentContexts: newRecents,
        mode: ctx.mode,
        organization: legacyOrg,
        program: legacyProgram,
        cycle: legacyCycle,
        operatingRole: DEMO_ROLES[ctx.mode] ?? 'head_coach',
      };
    }
    default:
      return state;
  }
}

// =============================================================================
// CONTEXT
// =============================================================================

interface AppContextValue {
  state: ExtendedAppState;
  setMode: (mode: Mode) => void;
  switchMode: (mode: Mode) => void;
  switchContext: (ctx: ActiveContext) => void;
  setActiveView: (view: ActiveView) => void;
  setOrganization: (org: Organization | null) => void;
  setRole: (role: Role) => void;
  setCycle: (cycle: Cycle | null) => void;
  setProgram: (program: Program | null) => void;
  setFirstRun: (isFirstRun: boolean) => void;
  setAuthState: (authState: AuthState) => void;
  setPendingLandingTab: (tab: LandingTab) => void;
  completeFirstModePick: (mode: Mode) => Promise<void>;
  initialize: (initialState: Partial<ExtendedAppState>) => void;
  clearPersistedState: () => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, defaultState);

  // Load persisted state on mount
  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        // Try ActiveView first (new system)
        const savedActiveView = await AsyncStorage.getItem(STORAGE_KEYS.activeView);
        if (savedActiveView) {
          try {
            const parsed = JSON.parse(savedActiveView) as ActiveView;
            if (parsed.view_id && parsed.mode && parsed.org_id) {
              dispatch({ type: 'SET_ACTIVE_VIEW', payload: parsed });
              dispatch({ type: 'SET_LOADING', payload: false });
              // Also restore auth
              const auth = await AsyncStorage.getItem(STORAGE_KEYS.auth);
              if (auth) dispatch({ type: 'SET_AUTH_STATE', payload: (auth as AuthState) || 'viewer' });
              return; // Skip legacy restore
            }
          } catch { /* fall through to legacy */ }
        }

        // Legacy restore path
        const [lastMode, auth, organization, program, season] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.lastMode),
          AsyncStorage.getItem(STORAGE_KEYS.auth),
          AsyncStorage.getItem(STORAGE_KEYS.sportsOrganization),
          AsyncStorage.getItem(STORAGE_KEYS.sportsProgram),
          AsyncStorage.getItem(STORAGE_KEYS.sportsSeason),
        ]);

        if (lastMode) {
          // Migrate old mode names
          const resolvedMode = lastMode === 'community' ? 'competition' : lastMode;
          // Mode exists - skip first run
          dispatch({
            type: 'RESTORE_STATE',
            payload: {
              mode: resolvedMode as Mode,
              authState: (auth as AuthState) || 'viewer',
              organization: organization || undefined,
              program: program || undefined,
              season: season || undefined,
            },
          });
        } else {
          // No saved mode - first run
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Failed to load persisted state:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    loadPersistedState();
  }, []);

  // Persist mode when it changes
  useEffect(() => {
    if (state.isLoading || state.isFirstRun) return;
    AsyncStorage.setItem(STORAGE_KEYS.lastMode, state.mode).catch(console.error);
  }, [state.mode, state.isLoading, state.isFirstRun]);

  // Persist auth state when it changes
  useEffect(() => {
    if (state.isLoading) return;
    AsyncStorage.setItem(STORAGE_KEYS.auth, state.authState).catch(console.error);
  }, [state.authState, state.isLoading]);

  // Persist V2 recent contexts
  useEffect(() => {
    if (state.isLoading) return;
    AsyncStorage.setItem(STORAGE_KEYS.recentContexts, JSON.stringify(state.recentContexts)).catch(console.error);
  }, [state.recentContexts, state.isLoading]);

  // Persist sports organization/program/season when they change
  useEffect(() => {
    if (state.isLoading || state.mode !== 'sports') return;
    if (state.organization?.name) {
      AsyncStorage.setItem(STORAGE_KEYS.sportsOrganization, state.organization.name).catch(console.error);
    }
    if (state.program?.name) {
      AsyncStorage.setItem(STORAGE_KEYS.sportsProgram, state.program.name).catch(console.error);
    }
    if (state.cycle?.name) {
      AsyncStorage.setItem(STORAGE_KEYS.sportsSeason, state.cycle.name).catch(console.error);
    }
  }, [state.organization, state.program, state.cycle, state.mode, state.isLoading]);

  const setMode = useCallback((mode: Mode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);

  const switchMode = useCallback((mode: Mode) => {
    // Try V2 context switch first, fall back to legacy
    const defaultCtx = getDefaultContextForMode(mode);
    if (defaultCtx) {
      const badge = deriveRoleBadge(defaultCtx.membership_id, defaultCtx.program_id);
      dispatch({ type: 'SWITCH_CONTEXT', payload: { ...defaultCtx, derived_role_badge: badge } });
    } else {
      dispatch({ type: 'SWITCH_MODE', payload: mode });
    }
  }, []);

  const switchContext = useCallback((ctx: ActiveContext) => {
    const badge = deriveRoleBadge(ctx.membership_id, ctx.program_id);
    dispatch({ type: 'SWITCH_CONTEXT', payload: { ...ctx, derived_role_badge: badge } });
    // Persist
    AsyncStorage.setItem(STORAGE_KEYS.activeContext, JSON.stringify({ ...ctx, derived_role_badge: badge })).catch(console.error);
  }, []);

  const setActiveView = useCallback((view: ActiveView) => {
    const newKey = getActiveViewKey(view);
    const prevKey = state.activeViewKey;
    // Dedup — no-op if same view tapped again
    if (newKey === prevKey && prevKey !== '') return;
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
    // Persist
    AsyncStorage.setItem(STORAGE_KEYS.activeView, JSON.stringify(view)).catch(console.error);
    AsyncStorage.setItem(STORAGE_KEYS.lastMode, view.mode).catch(console.error);
    // Notify lifecycle listeners
    notifyViewSwitch(view, prevKey);
  }, [state.activeViewKey]);

  const setOrganization = useCallback((org: Organization | null) => {
    dispatch({ type: 'SET_ORGANIZATION', payload: org });
  }, []);

  const setRole = useCallback((role: Role) => {
    dispatch({ type: 'SET_ROLE', payload: role });
  }, []);

  const setCycle = useCallback((cycle: Cycle | null) => {
    dispatch({ type: 'SET_CYCLE', payload: cycle });
  }, []);

  const setProgram = useCallback((program: Program | null) => {
    dispatch({ type: 'SET_PROGRAM', payload: program });
  }, []);

  const setFirstRun = useCallback((isFirstRun: boolean) => {
    dispatch({ type: 'SET_FIRST_RUN', payload: isFirstRun });
  }, []);

  const setAuthState = useCallback((authState: AuthState) => {
    dispatch({ type: 'SET_AUTH_STATE', payload: authState });
  }, []);

  const setPendingLandingTab = useCallback((tab: LandingTab) => {
    dispatch({ type: 'SET_PENDING_LANDING_TAB', payload: tab });
  }, []);

  const completeFirstModePick = useCallback(async (mode: Mode) => {
    // Rule A: First-time mode selection
    // 1) Save lastMode
    // 2) Save hasCompletedModePick = "true"
    // 3) Set pending landing to HOME
    dispatch({ type: 'SWITCH_MODE', payload: mode });
    dispatch({ type: 'SET_PENDING_LANDING_TAB', payload: 'home' });
    dispatch({ type: 'SET_FIRST_RUN', payload: false });

    await AsyncStorage.setItem(STORAGE_KEYS.lastMode, mode);
    await AsyncStorage.setItem(STORAGE_KEYS.hasCompletedModePick, 'true');
  }, []);

  const initialize = useCallback((initialState: Partial<ExtendedAppState>) => {
    dispatch({ type: 'INITIALIZE', payload: initialState });
  }, []);

  const clearPersistedState = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.lastMode,
        STORAGE_KEYS.hasCompletedModePick,
        STORAGE_KEYS.auth,
        STORAGE_KEYS.sportsOrganization,
        STORAGE_KEYS.sportsProgram,
        STORAGE_KEYS.sportsSeason,
        STORAGE_KEYS.activeView,
      ]);
    } catch (error) {
      console.error('Failed to clear persisted state:', error);
    }
  }, []);

  const logout = useCallback(async () => {
    // Only clear auth state, NOT mode
    dispatch({ type: 'SET_AUTH_STATE', payload: 'viewer' });
    await AsyncStorage.setItem(STORAGE_KEYS.auth, 'viewer');
  }, []);

  const value: AppContextValue = {
    state,
    setMode,
    switchMode,
    switchContext,
    setActiveView,
    setOrganization,
    setRole,
    setCycle,
    setProgram,
    setFirstRun,
    setAuthState,
    setPendingLandingTab,
    completeFirstModePick,
    initialize,
    clearPersistedState,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// =============================================================================
// HOOK
// =============================================================================

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Convenience hooks
export function useMode(): Mode {
  const { state } = useAppContext();
  return state.mode;
}

export function useOrganization(): Organization | null {
  const { state } = useAppContext();
  return state.organization;
}

export function useOperatingRole(): Role {
  const { state } = useAppContext();
  return state.operatingRole;
}

export function useProgram(): Program | null {
  const { state } = useAppContext();
  return state.program;
}

export function useAuthState(): AuthState {
  const { state } = useAppContext();
  return state.authState;
}

export function useActiveView(): ActiveView | null {
  const { state } = useAppContext();
  return state.activeView;
}

export function useActiveViewKey(): ActiveViewKey {
  const { state } = useAppContext();
  return state.activeViewKey;
}

export function useMembershipId(): string {
  const { state } = useAppContext();
  return state.activeView?.membership_id ?? state.activeContext.membership_id;
}

export function useOrgId(): string {
  const { state } = useAppContext();
  return state.activeView?.org_id ?? state.activeContext.org_id;
}

```


### A6. utils/active-view.ts


```typescript
/**
 * ActiveView Utilities
 * Converts ViewDefinitions to ActiveView objects and provides key generation.
 */

import type { ActiveView, ActiveViewKey, Mode } from '@/types';
import type { ViewDefinition } from '@/data/views';
import { CANONICAL_VIEWS, getViewsForMode } from '@/data/views';
import { resolveRoleLens } from '@/utils/unified-rbac';

/**
 * Convert a canonical ViewDefinition into an ActiveView.
 * Maps the flat view data to the richer ActiveView structure.
 */
export function buildActiveView(view: ViewDefinition): ActiveView {
  const roleLens = resolveRoleLens(view.membership_id, view.mode);

  // Derive scope_type from mode
  let scopeType: ActiveView['scope_type'] = null;
  switch (view.mode) {
    case 'sports':
      scopeType = 'program';
      break;
    case 'church':
      scopeType = 'ministry';
      break;
    case 'education':
      scopeType = 'department';
      break;
    case 'competition':
      scopeType = 'league';
      break;
    case 'business':
      scopeType = 'workspace';
      break;
  }

  return {
    view_id: view.view_id,
    mode: view.mode,
    org_id: view.org_id,
    org_name: view.org_display_name,
    membership_id: view.membership_id,
    role_label: view.role_title,
    rbac_level: view.rbca_tier,
    scope_type: scopeType,
    scope_id: view.program_id,
    scope_name: view.scope_line,
    season_id: view.season_id,
    season_label: view.season_chip,
    derived_role_badge: view.derived_role_badge,
  };
}

/**
 * Generate a unique composite key for dedup and cache scoping.
 */
export function getActiveViewKey(view: ActiveView): ActiveViewKey {
  return `${view.mode}:${view.org_id}:${view.scope_id}:${view.season_id}:${view.membership_id}`;
}

/**
 * Get the default ActiveView for a given mode (first canonical view).
 */
export function getDefaultActiveViewForMode(mode: Mode): ActiveView | null {
  const views = getViewsForMode(mode);
  if (views.length === 0) return null;
  return buildActiveView(views[0]);
}

```


### A7. utils/view-switch-lifecycle.ts


```typescript
/**
 * View Switch Lifecycle
 * Pub/sub for view-switch events. Components register callbacks
 * to reset state (pager position, caches, etc.) when the active view changes.
 */

import type { ActiveView } from '@/types';

type ViewSwitchCallback = (newView: ActiveView, prevKey: string) => void;

const _callbacks = new Set<ViewSwitchCallback>();

/**
 * Called from setActiveView in app-context.
 * Fires all registered callbacks with the new view and previous key.
 */
export function notifyViewSwitch(newView: ActiveView, prevKey: string): void {
  for (const cb of _callbacks) {
    try {
      cb(newView, prevKey);
    } catch (e) {
      console.error('[view-switch-lifecycle] callback error:', e);
    }
  }
}

/**
 * Register a callback to be invoked on every view switch.
 * Returns an unsubscribe function.
 */
export function registerViewSwitchCallback(cb: ViewSwitchCallback): () => void {
  _callbacks.add(cb);
  return () => {
    _callbacks.delete(cb);
  };
}

```


### A8. constants/theme.ts


```typescript
/**
 * KaNeXT OS Theme System
 * UI PALETTE — Luxury Control Room (Power-First) — LOCKED
 * Gold as primary accent. Dark-first only. Hairlines everywhere.
 */

import { Platform } from 'react-native';
import type { Mode } from '@/types';

// =============================================================================
// BRAND COLORS
// =============================================================================

export const Brand = {
  // Primary accent (White — monochrome authority)
  primary: '#FFFFFF',
  // Precision accent (Ice Blue)
  precision: '#6AA9FF',
  // Nexus accent (alias for precision — used by Nexus UI components)
  nexus: '#6AA9FF',
  // Success / positive (Emerald)
  success: '#22C55E',
  // Warning (Amber)
  warning: '#F59E0B',
  // Error / destructive (Red)
  error: '#EF4444',
};

// =============================================================================
// MODE ACCENT COLORS
// =============================================================================

export const ModeColors: Record<Mode, { primary: string; secondary: string; nexusGlyph: string; nexusGlyphDim: string }> = {
  sports: {
    primary: '#FFFFFF',
    secondary: '#8F8F8F',
    nexusGlyph: '#FFFFFF',
    nexusGlyphDim: '#8F8F8F',
  },
  church: {
    primary: '#FFFFFF',
    secondary: '#8F8F8F',
    nexusGlyph: '#FFFFFF',
    nexusGlyphDim: '#8F8F8F',
  },
  education: {
    primary: '#FFFFFF',
    secondary: '#8F8F8F',
    nexusGlyph: '#FFFFFF',
    nexusGlyphDim: '#8F8F8F',
  },
  business: {
    primary: '#FFFFFF',
    secondary: '#8F8F8F',
    nexusGlyph: '#FFFFFF',
    nexusGlyphDim: '#8F8F8F',
  },
  competition: {
    primary: '#FFFFFF',
    secondary: '#8F8F8F',
    nexusGlyph: '#FFFFFF',
    nexusGlyphDim: '#8F8F8F',
  },
};

// =============================================================================
// MODE ACCENT — Tab bar accent colors per mode
// =============================================================================

export const MODE_ACCENT: Record<Mode, string> = {
  sports: '#1E40AF',
  business: '#7C3AED',
  church: '#FBBF24',
  education: '#14B8A6',
  competition: '#FF5555',
};

// =============================================================================
// BASE COLORS — Luxury Control Room
// =============================================================================

const palette = {
  // Core Surfaces — Monochrome Silver
  text: '#DDDDDD',               // Heading color
  textSecondary: '#8F8F8F',      // Body color
  textTertiary: '#424242',       // Muted / tertiary
  background: '#000000',         // Page background (jet black)
  backgroundSecondary: '#0E0C0C', // Panel BG
  backgroundTertiary: '#181616',  // Elevated surface

  // Borders & Dividers — hairlines
  border: 'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.10)',
  divider: 'rgba(255,255,255,0.06)',

  // Interactive
  tint: '#FFFFFF',               // Primary accent (white)
  icon: '#8F8F8F',               // Icon Default
  iconActive: '#DDDDDD',

  // Tab Bar
  tabBar: '#000000',
  tabIconDefault: '#424242',
  tabIconSelected: '#FFFFFF',    // White

  // Cards & Surfaces
  card: '#181616',               // Card BG
  cardElevated: '#1E1C1C',      // Elevated Card

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  scrim: 'rgba(0, 0, 0, 0.5)',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
};

export const Colors = {
  light: { ...palette },
  dark: { ...palette },
};

// =============================================================================
// BUSINESS MODE — Luxury Control Room Palette (Power-First)
// Confidence, authority, restraint, inevitability.
// =============================================================================

export const BusinessPalette = {
  // Core surfaces
  obsidian: '#000000',        // Primary background (jet black)
  carbon: '#181616',          // Cards / sheets
  graphite: 'rgba(255,255,255,0.08)', // Hairline borders
  smoke: '#DDDDDD',           // Primary text (heading)
  ash: '#8F8F8F',             // Secondary text (body)

  // Monochrome accents
  champagneGold: '#FFFFFF',   // Primary accent: highlights, key stats, selected
  platinum: '#8F8F8F',        // Secondary accent: icons, dividers, badges

  // Signal colors
  emerald: '#2FE38C',         // Success / green light
  amber: '#FFB020',           // Warning / watch
  red: '#FF4D4D',             // Critical

  // Interaction surfaces
  glass: 'rgba(255,255,255,0.04)',  // Hover / pressed
  sheetBackdrop: 'rgba(0,0,0,0.55)', // Modal dim
};

// =============================================================================
// FONTS
// =============================================================================

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// =============================================================================
// SPACING
// =============================================================================

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// =============================================================================
// LAYOUT
// =============================================================================

export const Layout = {
  // Top bar height
  topBarHeight: 56,
  // Tab bar height
  tabBarHeight: 96,
  // Avatar size in top bar
  avatarSize: 32,
  // Max content width (for tablets/web)
  maxContentWidth: 600,
};

```


---


## Section B: RBAC / Permissions

### B1. utils/unified-rbac.ts

```typescript
/**
 * Unified RBAC — Single cross-mode dispatcher for membership → role lens.
 * Resolves a membership_id + mode to the correct per-mode role lens.
 */

import type { Mode } from '@/types';
import { getSportsRole, type SportsRoleLens } from '@/utils/sports-rbac';
import { getChurchRole, type ChurchRoleLens } from '@/utils/church-rbac';
import { getBusinessRole, type BusinessRoleLens } from '@/utils/business-rbac';
import { getEducationRole, type EducationRoleLens } from '@/utils/education-rbac';
import { getCompetitionRole, type CompetitionRoleLens } from '@/utils/competition-rbac';

export type AnyRoleLens =
  | { mode: 'sports'; lens: SportsRoleLens }
  | { mode: 'church'; lens: ChurchRoleLens }
  | { mode: 'business'; lens: BusinessRoleLens }
  | { mode: 'education'; lens: EducationRoleLens }
  | { mode: 'competition'; lens: CompetitionRoleLens };

/**
 * Resolve a membership_id to its mode-specific role lens.
 */
export function resolveRoleLens(membershipId: string, mode: Mode): AnyRoleLens {
  switch (mode) {
    case 'sports':
      return { mode, lens: getSportsRole(membershipId) };
    case 'church':
      return { mode, lens: getChurchRole(membershipId) };
    case 'business':
      return { mode, lens: getBusinessRole(membershipId) };
    case 'education':
      return { mode, lens: getEducationRole(membershipId) };
    case 'competition':
      return { mode, lens: getCompetitionRole(membershipId) };
  }
}
```

### B2. utils/sports-rbac.ts

```typescript
/**
 * Sports RBAC — Role-Based Context Access for Universal Sports Sheets
 *
 * Maps membership_id → Sports Role Lens (R1–R5), then provides declarative
 * visibility matrices for every tab/section across Player, Team, and Game sheets.
 *
 * "One sheet, many lenses" — never create per-role UI pages. RBAC gating is
 * declarative: tabs/sections hide/show based on the active sports role lens.
 */

// =============================================================================
// ROLE LENS
// =============================================================================

export type SportsRoleLens = 'R1' | 'R2' | 'R3' | 'R4' | 'R5';

/**
 * R1 = AD + HC/GM (Full)
 * R2 = Player (Self-only)
 * R3 = Asst Coach + RC (Limited)
 * R4 = Scout / Analyst (Limited eval)
 * R5 = Fan (Public only)
 */
const SPORTS_ROLE_MAP: Record<string, SportsRoleLens> = {
  mem_sports_fmu_admin: 'R1',
};

export function getSportsRole(membershipId: string): SportsRoleLens {
  return SPORTS_ROLE_MAP[membershipId] ?? 'R1';
}

// =============================================================================
// VISIBILITY LEVELS
// =============================================================================

export type Visibility = 'full' | 'limited' | 'self' | 'shared' | 'hidden';

export type KRVisibility = 'full' | 'bands' | 'partial_self' | 'hidden';

// =============================================================================
// PLAYER SHEET — 9 CANONICAL TABS
// =============================================================================

export type PlayerTab =
  | 'overview'
  | 'performance'
  | 'film'
  | 'kanext_eval'
  | 'fit_role'
  | 'development'
  | 'health'
  | 'admin'
  | 'recruiting';

export const PLAYER_TAB_LABELS: Record<PlayerTab, string> = {
  overview: 'Overview',
  performance: 'Performance',
  film: 'Film',
  kanext_eval: 'KaNeXT Eval',
  fit_role: 'Fit + Role',
  development: 'Development',
  health: 'Health',
  admin: 'Admin',
  recruiting: 'Recruiting',
};

export const PLAYER_TAB_ORDER: PlayerTab[] = [
  'overview', 'performance', 'film', 'kanext_eval', 'fit_role',
  'development', 'health', 'admin', 'recruiting',
];

/** Player Sheet visibility matrix: Tab → Role → Visibility */
const PLAYER_SHEET_MATRIX: Record<PlayerTab, Record<SportsRoleLens, Visibility>> = {
  overview:     { R1: 'full', R2: 'self',    R3: 'limited', R4: 'shared',  R5: 'limited' },
  performance:  { R1: 'full', R2: 'self',    R3: 'limited', R4: 'shared',  R5: 'limited' },
  film:         { R1: 'full', R2: 'self',    R3: 'limited', R4: 'shared',  R5: 'limited' },
  kanext_eval:  { R1: 'full', R2: 'self',    R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  fit_role:     { R1: 'full', R2: 'self',    R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  development:  { R1: 'full', R2: 'self',    R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  health:       { R1: 'full', R2: 'hidden',  R3: 'hidden',  R4: 'hidden',  R5: 'hidden' },
  admin:        { R1: 'full', R2: 'hidden',  R3: 'hidden',  R4: 'hidden',  R5: 'hidden' },
  recruiting:   { R1: 'full', R2: 'hidden',  R3: 'limited', R4: 'hidden',  R5: 'hidden' },
};

// =============================================================================
// TEAM SHEET — 10 CANONICAL TABS
// =============================================================================

export type TeamTab =
  | 'overview'
  | 'roster'
  | 'systems'
  | 'performance'
  | 'lineups'
  | 'schedule'
  | 'staff'
  | 'operations'
  | 'finance'
  | 'compliance';

export const TEAM_TAB_LABELS: Record<TeamTab, string> = {
  overview: 'Overview',
  roster: 'Roster',
  systems: 'Systems',
  performance: 'Performance',
  lineups: 'Lineups',
  schedule: 'Schedule',
  staff: 'Staff',
  operations: 'Operations',
  finance: 'Finance',
  compliance: 'Compliance',
};

export const TEAM_TAB_ORDER: TeamTab[] = [
  'overview', 'roster', 'systems', 'performance', 'lineups',
  'schedule', 'staff', 'operations', 'finance', 'compliance',
];

/** Team Sheet visibility matrix */
const TEAM_SHEET_MATRIX: Record<TeamTab, Record<SportsRoleLens, Visibility>> = {
  overview:     { R1: 'full', R2: 'limited', R3: 'limited', R4: 'shared',  R5: 'limited' },
  roster:       { R1: 'full', R2: 'limited', R3: 'limited', R4: 'shared',  R5: 'limited' },
  systems:      { R1: 'full', R2: 'hidden',  R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  performance:  { R1: 'full', R2: 'limited', R3: 'limited', R4: 'shared',  R5: 'limited' },
  lineups:      { R1: 'full', R2: 'hidden',  R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  schedule:     { R1: 'full', R2: 'limited', R3: 'limited', R4: 'limited', R5: 'limited' },
  staff:        { R1: 'full', R2: 'limited', R3: 'limited', R4: 'limited', R5: 'limited' },
  operations:   { R1: 'full', R2: 'hidden',  R3: 'hidden',  R4: 'hidden',  R5: 'hidden' },
  finance:      { R1: 'full', R2: 'hidden',  R3: 'hidden',  R4: 'hidden',  R5: 'hidden' },
  compliance:   { R1: 'full', R2: 'hidden',  R3: 'hidden',  R4: 'hidden',  R5: 'hidden' },
};

// =============================================================================
// GAME SHEET — 5 CANONICAL TABS
// =============================================================================

export type GameTab =
  | 'pregame'
  | 'live'
  | 'postgame'
  | 'ad_overlay'
  | 'incidents';

export const GAME_TAB_LABELS: Record<GameTab, string> = {
  pregame: 'Pregame',
  live: 'Live',
  postgame: 'Postgame',
  ad_overlay: 'AD Overlay',
  incidents: 'Incidents',
};

export const GAME_TAB_ORDER: GameTab[] = [
  'pregame', 'live', 'postgame', 'ad_overlay', 'incidents',
];

/** Game Sheet visibility matrix */
const GAME_SHEET_MATRIX: Record<GameTab, Record<SportsRoleLens, Visibility>> = {
  pregame:    { R1: 'full', R2: 'limited', R3: 'limited', R4: 'shared',  R5: 'limited' },
  live:       { R1: 'full', R2: 'limited', R3: 'limited', R4: 'shared',  R5: 'limited' },
  postgame:   { R1: 'full', R2: 'limited', R3: 'limited', R4: 'shared',  R5: 'limited' },
  ad_overlay: { R1: 'full', R2: 'hidden',  R3: 'hidden',  R4: 'hidden',  R5: 'hidden' },
  incidents:  { R1: 'full', R2: 'hidden',  R3: 'hidden',  R4: 'hidden',  R5: 'hidden' },
};

// =============================================================================
// TAB FILTER FUNCTIONS
// =============================================================================

/** Returns visible Player Sheet tabs for a role (in canonical order) */
export function getPlayerSheetTabs(role: SportsRoleLens): { key: PlayerTab; label: string }[] {
  return PLAYER_TAB_ORDER
    .filter((tab) => PLAYER_SHEET_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ key: tab, label: PLAYER_TAB_LABELS[tab] }));
}

/** Returns visible Team Sheet tabs for a role (in canonical order) */
export function getTeamSheetTabs(role: SportsRoleLens): { key: TeamTab; label: string }[] {
  return TEAM_TAB_ORDER
    .filter((tab) => TEAM_SHEET_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ key: tab, label: TEAM_TAB_LABELS[tab] }));
}

/** Returns visible Game Sheet tabs for a role (in canonical order) */
export function getGameSheetTabs(role: SportsRoleLens): { key: GameTab; label: string }[] {
  return GAME_TAB_ORDER
    .filter((tab) => GAME_SHEET_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ key: tab, label: GAME_TAB_LABELS[tab] }));
}

/** Get the visibility level for a specific player tab + role */
export function getPlayerTabVisibility(tab: PlayerTab, role: SportsRoleLens): Visibility {
  return PLAYER_SHEET_MATRIX[tab][role];
}

/** Get the visibility level for a specific team tab + role */
export function getTeamTabVisibility(tab: TeamTab, role: SportsRoleLens): Visibility {
  return TEAM_SHEET_MATRIX[tab][role];
}

/** Get the visibility level for a specific game tab + role */
export function getGameTabVisibility(tab: GameTab, role: SportsRoleLens): Visibility {
  return GAME_SHEET_MATRIX[tab][role];
}

// =============================================================================
// KR VISIBILITY POLICY
// =============================================================================

/**
 * R1 = full (exact numbers + confidence + coverage tier)
 * R3 = bands (e.g. 88–90)
 * R2 = partial_self (clusters only, own data)
 * R4 = hidden
 * R5 = hidden
 */
const KR_VISIBILITY_MAP: Record<SportsRoleLens, KRVisibility> = {
  R1: 'full',
  R2: 'partial_self',
  R3: 'bands',
  R4: 'hidden',
  R5: 'hidden',
};

export function getKRVisibility(role: SportsRoleLens): KRVisibility {
  return KR_VISIBILITY_MAP[role];
}

/** Format a KR value according to visibility policy */
export function formatKR(value: number, visibility: KRVisibility): string {
  switch (visibility) {
    case 'full':
      return `${value}`;
    case 'bands': {
      const low = Math.floor(value / 3) * 3;
      return `${low}–${low + 2}`;
    }
    case 'partial_self':
      return `${value}`;
    case 'hidden':
      return '—';
  }
}

// =============================================================================
// STATS HUB — 7 CANONICAL TABS
// =============================================================================

export type StatsTab =
  | 'dashboard'
  | 'traditional'
  | 'kr_intelligence'
  | 'clusters'
  | 'lineups'
  | 'play_types'
  | 'players';

export const STATS_TAB_LABELS: Record<StatsTab, string> = {
  dashboard: 'Dashboard',
  traditional: 'Traditional',
  kr_intelligence: 'KR Intelligence',
  clusters: 'Clusters',
  lineups: 'Lineups',
  play_types: 'Play Types',
  players: 'Players',
};

export const STATS_TAB_ORDER: StatsTab[] = [
  'dashboard', 'traditional', 'kr_intelligence', 'clusters',
  'lineups', 'play_types', 'players',
];

/** Stats Hub visibility matrix: Tab → Role → Visibility */
const STATS_HUB_MATRIX: Record<StatsTab, Record<SportsRoleLens, Visibility>> = {
  dashboard:       { R1: 'full',    R2: 'full',    R3: 'full',    R4: 'full',    R5: 'full' },
  traditional:     { R1: 'full',    R2: 'limited', R3: 'full',    R4: 'full',    R5: 'full' },
  kr_intelligence: { R1: 'full',    R2: 'self',    R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  clusters:        { R1: 'full',    R2: 'self',    R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  lineups:         { R1: 'full',    R2: 'hidden',  R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  play_types:      { R1: 'full',    R2: 'hidden',  R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  players:         { R1: 'full',    R2: 'limited', R3: 'full',    R4: 'full',    R5: 'full' },
};

/** Returns visible Stats Hub tabs for a role (in canonical order) */
export function getStatsHubTabs(role: SportsRoleLens): { key: StatsTab; label: string }[] {
  return STATS_TAB_ORDER
    .filter((tab) => STATS_HUB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ key: tab, label: STATS_TAB_LABELS[tab] }));
}

/** Get the visibility level for a specific stats tab + role */
export function getStatsTabVisibility(tab: StatsTab, role: SportsRoleLens): Visibility {
  return STATS_HUB_MATRIX[tab][role];
}

// =============================================================================
// GAME PLAN HUB — 7 CANONICAL TABS
// =============================================================================

export type GamePlanTab =
  | 'overview'
  | 'offense'
  | 'defense'
  | 'matchups'
  | 'rotation'
  | 'scout'
  | 'staff';

export const GAME_PLAN_TAB_LABELS: Record<GamePlanTab, string> = {
  overview: 'Overview',
  offense: 'Offense',
  defense: 'Defense',
  matchups: 'Matchups',
  rotation: 'Rotation',
  scout: 'Scout',
  staff: 'Staff',
};

export const GAME_PLAN_TAB_ORDER: GamePlanTab[] = [
  'overview', 'offense', 'defense', 'matchups', 'rotation', 'scout', 'staff',
];

/**
 * Game Plan RBAC:
 * R1 (AD/HC): Full access all 7 tabs
 * R2 (Player): Overview only (limited — sees win prob, matchup header, own assignment)
 * R3 (Asst Coach): All tabs, KR values as bands
 * R4 (Medical): No access — competitive intelligence
 * R5 (Fan): No access
 */
const GAME_PLAN_HUB_MATRIX: Record<GamePlanTab, Record<SportsRoleLens, Visibility>> = {
  overview:  { R1: 'full',   R2: 'limited', R3: 'full',    R4: 'hidden', R5: 'hidden' },
  offense:   { R1: 'full',   R2: 'hidden',  R3: 'full',    R4: 'hidden', R5: 'hidden' },
  defense:   { R1: 'full',   R2: 'hidden',  R3: 'full',    R4: 'hidden', R5: 'hidden' },
  matchups:  { R1: 'full',   R2: 'limited', R3: 'full',    R4: 'hidden', R5: 'hidden' },
  rotation:  { R1: 'full',   R2: 'hidden',  R3: 'limited', R4: 'hidden', R5: 'hidden' },
  scout:     { R1: 'full',   R2: 'hidden',  R3: 'full',    R4: 'hidden', R5: 'hidden' },
  staff:     { R1: 'full',   R2: 'hidden',  R3: 'full',    R4: 'hidden', R5: 'hidden' },
};

export function getGamePlanHubTabs(role: SportsRoleLens): { key: GamePlanTab; label: string }[] {
  return GAME_PLAN_TAB_ORDER
    .filter((tab) => GAME_PLAN_HUB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ key: tab, label: GAME_PLAN_TAB_LABELS[tab] }));
}

export function getGamePlanTabVisibility(tab: GamePlanTab, role: SportsRoleLens): Visibility {
  return GAME_PLAN_HUB_MATRIX[tab][role];
}

// =============================================================================
// SIMULATION HUB — 6 CANONICAL TABS
// =============================================================================

export type SimulationTab =
  | 'overview'
  | 'system_x_system'
  | 'possession_engine'
  | 'matchup_interactions'
  | 'box_score_projection'
  | 'scenarios';

export const SIMULATION_TAB_LABELS: Record<SimulationTab, string> = {
  overview: 'Overview',
  system_x_system: 'System x System',
  possession_engine: 'Possession Engine',
  matchup_interactions: 'Matchup Interactions',
  box_score_projection: 'Box Score',
  scenarios: 'Scenarios',
};

export const SIMULATION_TAB_ORDER: SimulationTab[] = [
  'overview', 'system_x_system', 'possession_engine',
  'matchup_interactions', 'box_score_projection', 'scenarios',
];

/**
 * Simulation RBAC:
 * R1 (AD): Full access all 6, sees exact KRs, line translation
 * R2 (Player): Overview only — win prob, pace, five factors
 * R3 (Asst Coach): All tabs, KR as bands, no line translation
 * R4-R5: No access
 */
const SIMULATION_HUB_MATRIX: Record<SimulationTab, Record<SportsRoleLens, Visibility>> = {
  overview:              { R1: 'full',   R2: 'limited', R3: 'full',    R4: 'hidden', R5: 'hidden' },
  system_x_system:       { R1: 'full',   R2: 'hidden',  R3: 'full',    R4: 'hidden', R5: 'hidden' },
  possession_engine:     { R1: 'full',   R2: 'hidden',  R3: 'full',    R4: 'hidden', R5: 'hidden' },
  matchup_interactions:  { R1: 'full',   R2: 'hidden',  R3: 'full',    R4: 'hidden', R5: 'hidden' },
  box_score_projection:  { R1: 'full',   R2: 'hidden',  R3: 'full',    R4: 'hidden', R5: 'hidden' },
  scenarios:             { R1: 'full',   R2: 'hidden',  R3: 'limited', R4: 'hidden', R5: 'hidden' },
};

export function getSimulationHubTabs(role: SportsRoleLens): { key: SimulationTab; label: string }[] {
  return SIMULATION_TAB_ORDER
    .filter((tab) => SIMULATION_HUB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ key: tab, label: SIMULATION_TAB_LABELS[tab] }));
}

export function getSimulationTabVisibility(tab: SimulationTab, role: SportsRoleLens): Visibility {
  return SIMULATION_HUB_MATRIX[tab][role];
}

// =============================================================================
// DEVELOPMENT HUB — 7 CANONICAL TABS
// =============================================================================

export type DevelopmentTab =
  | 'overview'
  | 'player_kr_profile'
  | 'pathway'
  | 'weekly_plan'
  | 'evidence'
  | 'pro_readiness'
  | 'transfer_portal';

export const DEVELOPMENT_TAB_LABELS: Record<DevelopmentTab, string> = {
  overview: 'Overview',
  player_kr_profile: 'KR Profile',
  pathway: 'Pathway',
  weekly_plan: 'Weekly Plan',
  evidence: 'Evidence',
  pro_readiness: 'Pro Readiness',
  transfer_portal: 'Transfer',
};

export const DEVELOPMENT_TAB_ORDER: DevelopmentTab[] = [
  'overview', 'player_kr_profile', 'pathway', 'weekly_plan',
  'evidence', 'pro_readiness', 'transfer_portal',
];

/**
 * Development RBAC:
 * R1 (AD/HC): Full access all 7, all players
 * R2 (Player): Own profile (tabs 2-6 self only), no overview, no transfer
 * R3 (Asst Coach): All tabs, KR as bands, no economic projections
 * R4 (Medical): Overview + weekly plan + evidence (limited)
 * R5 (Fan): No access
 */
const DEVELOPMENT_HUB_MATRIX: Record<DevelopmentTab, Record<SportsRoleLens, Visibility>> = {
  overview:          { R1: 'full',   R2: 'hidden',  R3: 'full',    R4: 'limited', R5: 'hidden' },
  player_kr_profile: { R1: 'full',   R2: 'self',    R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  pathway:           { R1: 'full',   R2: 'self',    R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  weekly_plan:       { R1: 'full',   R2: 'self',    R3: 'full',    R4: 'limited', R5: 'hidden' },
  evidence:          { R1: 'full',   R2: 'self',    R3: 'full',    R4: 'limited', R5: 'hidden' },
  pro_readiness:     { R1: 'full',   R2: 'self',    R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  transfer_portal:   { R1: 'full',   R2: 'hidden',  R3: 'full',    R4: 'hidden',  R5: 'hidden' },
};

export function getDevelopmentHubTabs(role: SportsRoleLens): { key: DevelopmentTab; label: string }[] {
  return DEVELOPMENT_TAB_ORDER
    .filter((tab) => DEVELOPMENT_HUB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ key: tab, label: DEVELOPMENT_TAB_LABELS[tab] }));
}

export function getDevelopmentTabVisibility(tab: DevelopmentTab, role: SportsRoleLens): Visibility {
  return DEVELOPMENT_HUB_MATRIX[tab][role];
}

// =============================================================================
// SENSITIVE DATA POLICY
// =============================================================================

/**
 * Only R1 can see: NIL amounts, aid details, health timelines,
 * compliance records, revenue/finance data.
 */
export function canSeeSensitive(role: SportsRoleLens): boolean {
  return role === 'R1';
}

/** R1 + R3 can see compare / coaching actions */
export function canSeeCoachActions(role: SportsRoleLens): boolean {
  return role === 'R1' || role === 'R3';
}

/** R1 only: offer, aid, NIL buttons */
export function canSeeAdminActions(role: SportsRoleLens): boolean {
  return role === 'R1';
}

// =============================================================================
// ROSTER VIEW RBAC
// =============================================================================

export type RosterViewMode = 'list' | 'system' | 'cards';

const ROSTER_VIEW_MATRIX: Record<SportsRoleLens, RosterViewMode[]> = {
  R1: ['list', 'system', 'cards'],
  R2: ['cards'],
  R3: ['list', 'system', 'cards'],
  R4: ['list', 'system', 'cards'],
  R5: ['cards'],
};

const ROSTER_DEFAULT_VIEW: Record<SportsRoleLens, RosterViewMode> = {
  R1: 'list',
  R2: 'cards',
  R3: 'list',
  R4: 'cards',
  R5: 'cards',
};

/** Returns visible roster view modes for a given role */
export function getVisibleRosterViews(role: SportsRoleLens): RosterViewMode[] {
  return ROSTER_VIEW_MATRIX[role];
}

/** Returns the default roster view mode for a given role */
export function getDefaultRosterView(role: SportsRoleLens): RosterViewMode {
  return ROSTER_DEFAULT_VIEW[role];
}

// =============================================================================
// VIDEO SECTION — 16 RBAC-GATED SECTIONS (Explore + Film Room + Library)
// =============================================================================

export type VideoSection =
  // Explore shelves (8)
  | 'explore_official_releases'
  | 'explore_game_center'
  | 'explore_player_hub'
  | 'explore_practice_install'
  | 'explore_scouting_opponent'
  | 'explore_recruiting_targets'
  | 'explore_development_clips'
  | 'explore_conference_league'
  // Film Room tabs (4)
  | 'filmroom_workspaces'
  | 'filmroom_cutups'
  | 'filmroom_assignments'
  | 'filmroom_notes'
  // Library sections (4)
  | 'library_official_games'
  | 'library_practices_install'
  | 'library_player_development'
  | 'library_public_media';

const VIDEO_SECTION_MATRIX: Record<VideoSection, Record<SportsRoleLens, Visibility>> = {
  // Explore
  explore_official_releases:    { R1: 'full', R2: 'full',    R3: 'full',    R4: 'shared',  R5: 'full' },
  explore_game_center:          { R1: 'full', R2: 'limited', R3: 'full',    R4: 'shared',  R5: 'limited' },
  explore_player_hub:           { R1: 'full', R2: 'self',    R3: 'full',    R4: 'shared',  R5: 'limited' },
  explore_practice_install:     { R1: 'full', R2: 'limited', R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  explore_scouting_opponent:    { R1: 'full', R2: 'hidden',  R3: 'limited', R4: 'shared',  R5: 'hidden' },
  explore_recruiting_targets:   { R1: 'full', R2: 'hidden',  R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  explore_development_clips:    { R1: 'full', R2: 'self',    R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  explore_conference_league:    { R1: 'full', R2: 'full',    R3: 'full',    R4: 'shared',  R5: 'full' },
  // Film Room
  filmroom_workspaces:          { R1: 'full', R2: 'limited', R3: 'full',    R4: 'shared',  R5: 'hidden' },
  filmroom_cutups:              { R1: 'full', R2: 'limited', R3: 'full',    R4: 'shared',  R5: 'hidden' },
  filmroom_assignments:         { R1: 'full', R2: 'self',    R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  filmroom_notes:               { R1: 'full', R2: 'limited', R3: 'full',    R4: 'shared',  R5: 'hidden' },
  // Library
  library_official_games:       { R1: 'full', R2: 'limited', R3: 'full',    R4: 'shared',  R5: 'limited' },
  library_practices_install:    { R1: 'full', R2: 'limited', R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  library_player_development:   { R1: 'full', R2: 'self',    R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  library_public_media:         { R1: 'full', R2: 'full',    R3: 'full',    R4: 'full',    R5: 'full' },
};

export function getVideoSectionVisibility(section: VideoSection, role: SportsRoleLens): Visibility {
  return VIDEO_SECTION_MATRIX[section][role];
}

// =============================================================================
// MESSAGES SECTION — 20 RBAC-GATED SECTIONS (Inbox + Rooms + Requests + Pinned)
// =============================================================================

export type MessagesSection =
  // Inbox types (5)
  | 'inbox_blockers'
  | 'inbox_approvals'
  | 'inbox_recruiting'
  | 'inbox_nil'
  | 'inbox_eligibility'
  // Room categories (7)
  | 'rooms_command'
  | 'rooms_staff'
  | 'rooms_player'
  | 'rooms_recruiting'
  | 'rooms_ops_travel'
  | 'rooms_media'
  | 'rooms_compliance'
  // Request types (7)
  | 'requests_approval'
  | 'requests_roster'
  | 'requests_schedule'
  | 'requests_recruiting'
  | 'requests_eligibility'
  | 'requests_finance'
  | 'requests_incident'
  // Pinned
  | 'pinned_full';

const MESSAGES_SECTION_MATRIX: Record<MessagesSection, Record<SportsRoleLens, Visibility>> = {
  // Inbox
  inbox_blockers:       { R1: 'full', R2: 'limited', R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  inbox_approvals:      { R1: 'full', R2: 'hidden',  R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  inbox_recruiting:     { R1: 'full', R2: 'hidden',  R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  inbox_nil:            { R1: 'full', R2: 'limited', R3: 'hidden',  R4: 'hidden',  R5: 'hidden' },
  inbox_eligibility:    { R1: 'full', R2: 'self',    R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  // Rooms
  rooms_command:        { R1: 'full', R2: 'hidden',  R3: 'hidden',  R4: 'hidden',  R5: 'hidden' },
  rooms_staff:          { R1: 'full', R2: 'hidden',  R3: 'full',    R4: 'limited', R5: 'hidden' },
  rooms_player:         { R1: 'full', R2: 'full',    R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  rooms_recruiting:     { R1: 'full', R2: 'hidden',  R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  rooms_ops_travel:     { R1: 'full', R2: 'limited', R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  rooms_media:          { R1: 'full', R2: 'limited', R3: 'full',    R4: 'shared',  R5: 'hidden' },
  rooms_compliance:     { R1: 'full', R2: 'hidden',  R3: 'hidden',  R4: 'hidden',  R5: 'hidden' },
  // Requests
  requests_approval:    { R1: 'full', R2: 'hidden',  R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  requests_roster:      { R1: 'full', R2: 'hidden',  R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  requests_schedule:    { R1: 'full', R2: 'limited', R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  requests_recruiting:  { R1: 'full', R2: 'hidden',  R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  requests_eligibility: { R1: 'full', R2: 'self',    R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  requests_finance:     { R1: 'full', R2: 'hidden',  R3: 'hidden',  R4: 'hidden',  R5: 'hidden' },
  requests_incident:    { R1: 'full', R2: 'limited', R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  // Pinned
  pinned_full:          { R1: 'full', R2: 'limited', R3: 'limited', R4: 'hidden',  R5: 'hidden' },
};

export function getMessagesSectionVisibility(section: MessagesSection, role: SportsRoleLens): Visibility {
  return MESSAGES_SECTION_MATRIX[section][role];
}
```

### B3. utils/church-rbac.ts

```typescript
/**
 * Church Mode RBAC — 11-level role lens visibility matrix.
 *
 * C1:  Senior Pastor           (spec CH1)
 * C2:  Elder / Board           (spec CH3)
 * C3:  Staff                   (spec CH5)
 * C4:  Member                  (spec CH8)
 * C5:  Visitor / Public        (spec CH11)
 * C6:  Lead / Executive Pastor (spec CH2)
 * C7:  Ministry Leader         (spec CH4)
 * C8:  Worship Team            (spec CH6)
 * C9:  Volunteer               (spec CH7)
 * C10: Regular Attendee        (spec CH10)
 * C11: New Believer            (spec CH9)
 *
 * Privilege order: C1 > C6 > C2 > C7 > C3 > C8 > C9 > C4 > C11 > C10 > C5
 */

// =============================================================================
// ROLE LEVELS
// =============================================================================

export type ChurchRoleLens =
  | 'C1' | 'C2' | 'C3' | 'C4' | 'C5'
  | 'C6' | 'C7' | 'C8' | 'C9' | 'C10' | 'C11';

export type ChurchVisibility = 'full' | 'exact' | 'limited' | 'hidden';

export const CHURCH_ROLE_LABELS: Record<ChurchRoleLens, string> = {
  C1: 'Senior Pastor',
  C2: 'Elder / Board',
  C3: 'Staff',
  C4: 'Member',
  C5: 'Visitor / Public',
  C6: 'Lead / Executive Pastor',
  C7: 'Ministry Leader',
  C8: 'Worship Team',
  C9: 'Volunteer',
  C10: 'Regular Attendee',
  C11: 'New Believer',
};

// Helper to build an 11-column row concisely
type V = ChurchVisibility;
function r(c1: V, c2: V, c3: V, c4: V, c5: V, c6: V, c7: V, c8: V, c9: V, c10: V, c11: V): Record<ChurchRoleLens, V> {
  return { C1: c1, C2: c2, C3: c3, C4: c4, C5: c5, C6: c6, C7: c7, C8: c8, C9: c9, C10: c10, C11: c11 };
}

// =============================================================================
// HOME TAB VISIBILITY
// =============================================================================

export type ChurchHomeTab =
  | 'dashboard' | 'calendar' | 'worship' | 'community' | 'serve'
  | 'give' | 'events' | 'prayer' | 'messages' | 'discipleship';

//                                                         C1      C2      C3      C4       C5        C6      C7      C8      C9       C10      C11
const CHURCH_HOME_TAB_MATRIX: Record<ChurchHomeTab, Record<ChurchRoleLens, V>> = {
  dashboard:    r('full',    'full',    'full',    'limited', 'limited', 'full',    'full',    'full',    'limited', 'limited', 'limited'),
  calendar:     r('full',    'full',    'full',    'limited', 'limited', 'full',    'full',    'full',    'limited', 'limited', 'limited'),
  worship:      r('full',    'full',    'full',    'full',    'limited', 'full',    'full',    'full',    'full',    'limited', 'full'),
  community:    r('full',    'full',    'full',    'full',    'limited', 'full',    'full',    'full',    'full',    'limited', 'full'),
  serve:        r('full',    'full',    'limited', 'limited', 'hidden',  'full',    'full',    'limited', 'limited', 'hidden',  'hidden'),
  give:         r('full',    'full',    'full',    'full',    'limited', 'full',    'full',    'full',    'full',    'limited', 'full'),
  events:       r('full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  prayer:       r('full',    'full',    'limited', 'full',    'hidden',  'full',    'full',    'limited', 'full',    'hidden',  'full'),
  messages:     r('full',    'full',    'full',    'full',    'limited', 'full',    'full',    'full',    'full',    'limited', 'full'),
  discipleship: r('full',    'full',    'limited', 'limited', 'hidden',  'full',    'limited', 'limited', 'limited', 'hidden',  'limited'),
};

export function getChurchHomeTabVisibility(tab: ChurchHomeTab, role: ChurchRoleLens): ChurchVisibility {
  return CHURCH_HOME_TAB_MATRIX[tab]?.[role] ?? 'hidden';
}

// =============================================================================
// HOME PILL VISIBILITY (4-pill layout)
// =============================================================================

export type ChurchHomePill = 'dashboard' | 'calendar' | 'ministries' | 'connect';

//                                                           C1     C2     C3     C4       C5       C6     C7     C8     C9       C10      C11
const CHURCH_HOME_PILL_MATRIX: Record<ChurchHomePill, Record<ChurchRoleLens, V>> = {
  dashboard:  r('full', 'full', 'full',   'full',   'full',   'full', 'full', 'full',   'full',   'full',   'full'),
  calendar:   r('full', 'full', 'full',   'full',   'full',   'full', 'full', 'full',   'full',   'full',   'full'),
  ministries: r('full', 'full', 'full',   'full',   'hidden', 'full', 'full', 'full',   'full',   'hidden', 'full'),
  connect:    r('full', 'full', 'full',   'hidden', 'hidden', 'full', 'full', 'full',   'hidden', 'hidden', 'hidden'),
};

export function getChurchVisiblePills(role: ChurchRoleLens): ChurchHomePill[] {
  return (Object.keys(CHURCH_HOME_PILL_MATRIX) as ChurchHomePill[])
    .filter((pill) => CHURCH_HOME_PILL_MATRIX[pill][role] !== 'hidden');
}

// =============================================================================
// DASHBOARD SECTION VISIBILITY
// =============================================================================

export type ChurchDashboardSection =
  | 'video_hero' | 'next_service' | 'commerce_row'
  | 'ministry_health' | 'growth_metrics';

//                                                                      C1     C2      C3      C4       C5       C6     C7      C8       C9       C10      C11
const CHURCH_DASHBOARD_SECTION_MATRIX: Record<ChurchDashboardSection, Record<ChurchRoleLens, V>> = {
  video_hero:       r('full', 'full',    'full',    'full',    'full',    'full', 'full',    'full',    'full',    'full',    'full'),
  next_service:     r('full', 'full',    'full',    'full',    'full',    'full', 'full',    'full',    'full',    'full',    'full'),
  commerce_row:     r('full', 'full',    'full',    'full',    'full',    'full', 'full',    'full',    'full',    'full',    'full'),
  ministry_health:  r('full', 'limited', 'limited', 'hidden', 'hidden',  'full', 'limited', 'hidden',  'hidden',  'hidden',  'hidden'),
  growth_metrics:   r('full', 'full',    'limited', 'limited', 'hidden', 'full', 'limited', 'limited', 'limited', 'limited', 'limited'),
};

export function canSeeChurchDashboardSection(section: ChurchDashboardSection, role: ChurchRoleLens): ChurchVisibility {
  return CHURCH_DASHBOARD_SECTION_MATRIX[section]?.[role] ?? 'hidden';
}

// =============================================================================
// ORG TAB VISIBILITY
// =============================================================================

export type ChurchOrgTab =
  | 'ministries' | 'people' | 'rooms' | 'operations' | 'finance'
  | 'payment-rails' | 'compliance' | 'facilities' | 'resources' | 'donations';

//                                                         C1     C2      C3       C4       C5       C6     C7      C8       C9       C10      C11
const CHURCH_ORG_TAB_MATRIX: Record<ChurchOrgTab, Record<ChurchRoleLens, V>> = {
  ministries:      r('full', 'full',    'full',    'limited', 'limited', 'full', 'full',    'full',    'limited', 'limited', 'limited'),
  people:          r('full', 'full',    'limited', 'limited', 'hidden',  'full', 'full',    'limited', 'limited', 'hidden',  'hidden'),
  rooms:           r('full', 'full',    'limited', 'hidden',  'hidden',  'full', 'full',    'limited', 'hidden',  'hidden',  'hidden'),
  operations:      r('full', 'full',    'limited', 'hidden',  'hidden',  'full', 'full',    'hidden',  'hidden',  'hidden',  'hidden'),
  finance:         r('full', 'full',    'limited', 'hidden',  'hidden',  'full', 'limited', 'hidden',  'hidden',  'hidden',  'hidden'),
  'payment-rails': r('full', 'full',    'hidden',  'hidden',  'hidden',  'full', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  compliance:      r('full', 'full',    'limited', 'hidden',  'hidden',  'full', 'limited', 'hidden',  'hidden',  'hidden',  'hidden'),
  facilities:      r('full', 'full',    'limited', 'limited', 'hidden',  'full', 'full',    'limited', 'limited', 'hidden',  'hidden'),
  resources:       r('full', 'full',    'limited', 'limited', 'hidden',  'full', 'full',    'limited', 'limited', 'hidden',  'hidden'),
  donations:       r('full', 'full',    'limited', 'limited', 'hidden',  'full', 'full',    'limited', 'limited', 'hidden',  'hidden'),
};

export function getChurchOrgTabVisibility(tab: ChurchOrgTab, role: ChurchRoleLens): ChurchVisibility {
  return CHURCH_ORG_TAB_MATRIX[tab]?.[role] ?? 'hidden';
}

export function getVisibleChurchOrgTabs(role: ChurchRoleLens): ChurchOrgTab[] {
  return (Object.keys(CHURCH_ORG_TAB_MATRIX) as ChurchOrgTab[])
    .filter((tab) => CHURCH_ORG_TAB_MATRIX[tab][role] !== 'hidden');
}

// =============================================================================
// QUICK ACTIONS BY ROLE
// =============================================================================

export interface ChurchQuickAction {
  id: string;
  label: string;
  icon: string;
}

const CHURCH_QUICK_ACTIONS: Record<ChurchRoleLens, ChurchQuickAction[]> = {
  C1: [
    { id: 'worship-plan', label: 'Worship Plan', icon: 'music.note.list' },
    { id: 'sermon-prep', label: 'Sermon Prep', icon: 'book.fill' },
    { id: 'staff-meeting', label: 'Staff Meeting', icon: 'person.3.fill' },
    { id: 'budget-review', label: 'Budget Review', icon: 'dollarsign.circle.fill' },
    { id: 'prayer-wall', label: 'Prayer Wall', icon: 'hands.sparkles.fill' },
    { id: 'post-announcement', label: 'Post Announcement', icon: 'megaphone.fill' },
    { id: 'approve-requests', label: 'Approve Requests', icon: 'checkmark.seal.fill' },
    { id: 'pin-hero-video', label: 'Pin Hero Video', icon: 'pin.fill' },
    { id: 'open-payment-rails', label: 'Payment Rails', icon: 'creditcard.fill' },
    { id: 'open-announcements', label: 'Announcements', icon: 'bell.fill' },
  ],
  C6: [
    { id: 'worship-plan', label: 'Worship Plan', icon: 'music.note.list' },
    { id: 'sermon-prep', label: 'Sermon Prep', icon: 'book.fill' },
    { id: 'staff-meeting', label: 'Staff Meeting', icon: 'person.3.fill' },
    { id: 'budget-review', label: 'Budget Review', icon: 'dollarsign.circle.fill' },
    { id: 'prayer-wall', label: 'Prayer Wall', icon: 'hands.sparkles.fill' },
    { id: 'post-announcement', label: 'Post Announcement', icon: 'megaphone.fill' },
    { id: 'approve-requests', label: 'Approve Requests', icon: 'checkmark.seal.fill' },
  ],
  C2: [
    { id: 'create-event', label: 'Create Event', icon: 'calendar.badge.plus' },
    { id: 'manage-volunteers', label: 'Manage Volunteers', icon: 'person.3.fill' },
    { id: 'post-update', label: 'Post Update', icon: 'square.and.pencil' },
    { id: 'request-budget', label: 'Request Budget', icon: 'dollarsign.circle.fill' },
    { id: 'open-my-ministry', label: 'Open My Ministry', icon: 'heart.fill' },
    { id: 'open-check-in', label: 'Open Check-In', icon: 'checkmark.circle.fill' },
    { id: 'schedule-event', label: 'Schedule Event', icon: 'clock.fill' },
  ],
  C7: [
    { id: 'create-event', label: 'Create Event', icon: 'calendar.badge.plus' },
    { id: 'manage-volunteers', label: 'Manage Volunteers', icon: 'person.3.fill' },
    { id: 'open-my-ministry', label: 'Open My Ministry', icon: 'heart.fill' },
    { id: 'open-check-in', label: 'Open Check-In', icon: 'checkmark.circle.fill' },
    { id: 'post-update', label: 'Post Update', icon: 'square.and.pencil' },
  ],
  C3: [
    { id: 'my-ministries', label: 'My Ministries', icon: 'heart.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'volunteer-schedule', label: 'Volunteer Schedule', icon: 'clock.fill' },
    { id: 'submit-request', label: 'Submit Request', icon: 'paperplane.fill' },
    { id: 'open-check-in', label: 'Check-In', icon: 'checkmark.circle.fill' },
  ],
  C8: [
    { id: 'my-ministries', label: 'My Ministries', icon: 'heart.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'volunteer-schedule', label: 'Volunteer Schedule', icon: 'clock.fill' },
    { id: 'worship', label: 'Watch Worship', icon: 'play.circle.fill' },
  ],
  C9: [
    { id: 'volunteer-schedule', label: 'Volunteer Schedule', icon: 'clock.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'give', label: 'Give', icon: 'heart.fill' },
    { id: 'prayer', label: 'Prayer Request', icon: 'hands.sparkles.fill' },
  ],
  C4: [
    { id: 'worship', label: 'Watch Worship', icon: 'play.circle.fill' },
    { id: 'give', label: 'Give', icon: 'heart.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'prayer', label: 'Prayer Request', icon: 'hands.sparkles.fill' },
  ],
  C11: [
    { id: 'worship', label: 'Watch Worship', icon: 'play.circle.fill' },
    { id: 'give', label: 'Give', icon: 'heart.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'prayer', label: 'Prayer Request', icon: 'hands.sparkles.fill' },
  ],
  C10: [
    { id: 'worship', label: 'Watch Online', icon: 'play.circle.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'give', label: 'Give', icon: 'heart.fill' },
  ],
  C5: [
    { id: 'visit', label: 'Plan a Visit', icon: 'mappin.and.ellipse' },
    { id: 'worship', label: 'Watch Online', icon: 'play.circle.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
  ],
};

export function getChurchQuickActions(role: ChurchRoleLens): ChurchQuickAction[] {
  return CHURCH_QUICK_ACTIONS[role] || CHURCH_QUICK_ACTIONS.C5;
}

// =============================================================================
// VISIBILITY HELPERS
// =============================================================================

const MEMBER_LEVEL_ROLES: Set<ChurchRoleLens> = new Set(['C4', 'C5', 'C9', 'C10', 'C11']);

export function isSeniorPastor(role: ChurchRoleLens): boolean {
  return role === 'C1';
}

export function isElderLevel(role: ChurchRoleLens): boolean {
  return role === 'C1' || role === 'C2' || role === 'C6';
}

export function isStaffLevel(role: ChurchRoleLens): boolean {
  return role === 'C1' || role === 'C2' || role === 'C3' || role === 'C6' || role === 'C7' || role === 'C8';
}

export function isMember(role: ChurchRoleLens): boolean {
  return role !== 'C5';
}

// =============================================================================
// BACKWARD COMPAT — used by universal-member-sheet, universal-ministry-sheet,
// universal-service-sheet from previous session
// =============================================================================

export type MemberTab = 'overview' | 'giving' | 'groups' | 'notes' | 'ministry_involvement' | 'schedule_attendance' | 'care_followup' | 'tasks_workflow' | 'messages' | 'safety_compliance' | 'admin';
export type MinistryTab = 'overview' | 'members' | 'schedule' | 'budget' | 'people' | 'operations' | 'safety_compliance' | 'content_media' | 'notes';
export type ServiceTab = 'overview' | 'team' | 'setlist' | 'notes' | 'agenda' | 'assignments' | 'run_of_show' | 'ops_checklist' | 'attendance' | 'incidents' | 'recap_followup';

export function getMemberSheetTabs(role: ChurchRoleLens): { id: MemberTab; label: string }[] {
  const all: { id: MemberTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'giving', label: 'Giving' },
    { id: 'groups', label: 'Groups' },
    { id: 'notes', label: 'Notes' },
  ];
  if (MEMBER_LEVEL_ROLES.has(role)) return all.filter((t) => t.id === 'overview' || t.id === 'groups');
  return all;
}

export function getMinistrySheetTabs(role: ChurchRoleLens): { id: MinistryTab; label: string }[] {
  const all: { id: MinistryTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'members', label: 'Members' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'budget', label: 'Budget' },
  ];
  if (MEMBER_LEVEL_ROLES.has(role)) return all.filter((t) => t.id === 'overview');
  return all;
}

export function getServiceSheetTabs(role: ChurchRoleLens): { id: ServiceTab; label: string }[] {
  const all: { id: ServiceTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'team', label: 'Team' },
    { id: 'setlist', label: 'Setlist' },
    { id: 'notes', label: 'Notes' },
  ];
  if (role === 'C5') return all.filter((t) => t.id === 'overview');
  return all;
}

export function isMinistryLevel(role: ChurchRoleLens): boolean {
  return isStaffLevel(role);
}

// =============================================================================
// MEMBERSHIP → LENS (direct membership_id mapping for ActiveView)
// =============================================================================

const CHURCH_MEMBERSHIP_MAP: Record<string, ChurchRoleLens> = {
  mem_church_iccla: 'C1',
};

export function getChurchRole(membershipId: string): ChurchRoleLens {
  return CHURCH_MEMBERSHIP_MAP[membershipId] ?? 'C1';
}

export function mapRoleToChurchLens(role: string): ChurchRoleLens {
  switch (role) {
    case 'senior_pastor':
    case 'pastor':
      return 'C1';
    case 'lead_pastor':
    case 'executive_pastor':
      return 'C6';
    case 'elder':
    case 'board':
    case 'deacon':
      return 'C2';
    case 'ministry_leader':
      return 'C7';
    case 'staff':
    case 'youth_pastor':
      return 'C3';
    case 'worship_leader':
    case 'worship_team':
      return 'C8';
    case 'volunteer':
      return 'C9';
    case 'member':
      return 'C4';
    case 'new_believer':
      return 'C11';
    case 'regular':
    case 'attendee':
      return 'C10';
    case 'visitor':
    case 'public':
    case 'guest':
      return 'C5';
    default:
      return 'C5';
  }
}
```

### B4. utils/education-rbac.ts

```typescript
/**
 * Education Mode RBAC — 13-level role lens visibility matrix.
 * E1:  President / Chancellor
 * E2:  Provost / Dean
 * E3:  Department Chair / Faculty
 * E4:  Student Services / Counseling
 * E5:  Registrar / Compliance
 * E6:  Facilities / Campus Ops
 * E7:  Student
 * E8:  Parent / Guardian
 * E9:  Alumnus
 * E10: Prospective Student
 * E11: Donor / Endowment
 * E12: Accreditor / External Evaluator
 * E13: Board of Trustees
 */

// =============================================================================
// ROLE LEVELS
// =============================================================================

export type EducationRoleLens =
  | 'E1' | 'E2' | 'E3' | 'E4' | 'E5' | 'E6' | 'E7'
  | 'E8' | 'E9' | 'E10' | 'E11' | 'E12' | 'E13';

export type EducationVisibility = 'full' | 'exact' | 'limited' | 'hidden';

export const EDUCATION_ROLE_LABELS: Record<EducationRoleLens, string> = {
  E1: 'President / Chancellor',
  E2: 'Provost / Dean',
  E3: 'Department Chair / Faculty',
  E4: 'Student Services / Counseling',
  E5: 'Registrar / Compliance',
  E6: 'Facilities / Campus Ops',
  E7: 'Student',
  E8: 'Parent / Guardian',
  E9: 'Alumnus',
  E10: 'Prospective Student',
  E11: 'Donor / Endowment',
  E12: 'Accreditor / External Evaluator',
  E13: 'Board of Trustees',
};

// Helper to build a 13-column row concisely
type V = EducationVisibility;
function r(e1: V, e2: V, e3: V, e4: V, e5: V, e6: V, e7: V, e8: V, e9: V, e10: V, e11: V, e12: V, e13: V): Record<EducationRoleLens, V> {
  return { E1: e1, E2: e2, E3: e3, E4: e4, E5: e5, E6: e6, E7: e7, E8: e8, E9: e9, E10: e10, E11: e11, E12: e12, E13: e13 };
}

// =============================================================================
// HOME TAB VISIBILITY
// =============================================================================

export type EducationHomeTab =
  | 'dashboard' | 'calendar' | 'academics' | 'campus' | 'people'
  | 'admissions' | 'athletics' | 'financial' | 'housing' | 'policies';

//                                                  E1      E2      E3        E4        E5        E6        E7        E8        E9        E10       E11       E12       E13
const EDU_HOME_TAB_MATRIX: Record<EducationHomeTab, Record<EducationRoleLens, V>> = {
  dashboard:  r('full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'hidden',  'full'),
  calendar:   r('full',    'full',    'full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'hidden',  'full'),
  academics:  r('full',    'full',    'full',    'full',    'full',    'hidden',  'limited', 'limited', 'limited', 'limited', 'hidden',  'hidden',  'full'),
  campus:     r('full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'hidden',  'full'),
  people:     r('full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'full'),
  admissions: r('full',    'full',    'limited', 'limited', 'full',    'hidden',  'limited', 'limited', 'hidden',  'full',    'hidden',  'hidden',  'full'),
  athletics:  r('full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'hidden',  'full'),
  financial:  r('full',    'full',    'limited', 'limited', 'full',    'hidden',  'limited', 'limited', 'hidden',  'hidden',  'limited', 'hidden',  'full'),
  housing:    r('full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'hidden',  'limited', 'hidden',  'hidden',  'full'),
  policies:   r('full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'limited', 'hidden',  'hidden',  'full'),
};

export function getEduHomeTabVisibility(tab: EducationHomeTab, role: EducationRoleLens): EducationVisibility {
  return EDU_HOME_TAB_MATRIX[tab]?.[role] ?? 'hidden';
}

// =============================================================================
// ORG TAB VISIBILITY
// =============================================================================

export type EducationOrgTab =
  | 'institutions' | 'people' | 'rooms' | 'operations' | 'finance'
  | 'payment-rails' | 'compliance' | 'facilities' | 'resources' | 'sponsors';

//                                                E1      E2      E3        E4        E5        E6        E7        E8        E9        E10       E11       E12       E13
const EDU_ORG_TAB_MATRIX: Record<EducationOrgTab, Record<EducationRoleLens, V>> = {
  institutions:    r('full', 'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'full'),
  people:          r('full', 'full',    'full',    'full',    'full',    'limited', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'full'),
  rooms:           r('full', 'full',    'full',    'full',    'full',    'full',    'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'full'),
  operations:      r('full', 'full',    'limited', 'limited', 'limited', 'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'full'),
  finance:         r('full', 'full',    'limited', 'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'limited', 'hidden',  'full'),
  'payment-rails': r('full', 'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'full'),
  compliance:      r('full', 'full',    'limited', 'hidden',  'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'limited', 'full'),
  facilities:      r('full', 'full',    'full',    'limited', 'limited', 'full',    'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'full'),
  resources:       r('full', 'full',    'full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'hidden',  'full'),
  sponsors:        r('full', 'full',    'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'limited', 'hidden',  'full',    'hidden',  'full'),
};

export function getEduOrgTabVisibility(tab: EducationOrgTab, role: EducationRoleLens): EducationVisibility {
  return EDU_ORG_TAB_MATRIX[tab]?.[role] ?? 'hidden';
}

export function getVisibleEduOrgTabs(role: EducationRoleLens): EducationOrgTab[] {
  return (Object.keys(EDU_ORG_TAB_MATRIX) as EducationOrgTab[])
    .filter((tab) => EDU_ORG_TAB_MATRIX[tab][role] !== 'hidden');
}

// =============================================================================
// DASHBOARD SECTION VISIBILITY
// =============================================================================

export type EduDashboardSection =
  | 'video_hero' | 'next_event' | 'action_row' | 'institutional_metrics'
  | 'academic_health' | 'student_success' | 'campus_life' | 'advancement' | 'accreditation';

//                                                             E1      E2      E3        E4        E5        E6        E7        E8        E9        E10       E11       E12       E13
const EDU_DASHBOARD_SECTION_MATRIX: Record<EduDashboardSection, Record<EducationRoleLens, V>> = {
  video_hero:             r('full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'hidden',  'full'),
  next_event:             r('full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'hidden',  'full'),
  action_row:             r('full',    'full',    'full',    'full',    'full',    'hidden',  'full',    'limited', 'limited', 'full',    'hidden',  'hidden',  'full'),
  institutional_metrics:  r('full',    'full',    'limited', 'limited', 'limited', 'hidden',  'limited', 'limited', 'hidden',  'limited', 'limited', 'hidden',  'full'),
  academic_health:        r('full',    'full',    'limited', 'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'limited'),
  student_success:        r('full',    'full',    'limited', 'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  campus_life:            r('full',    'full',    'full',    'full',    'hidden',  'limited', 'limited', 'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'full'),
  advancement:            r('full',    'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'limited', 'hidden',  'limited', 'hidden',  'full'),
  accreditation:          r('full',    'full',    'hidden',  'hidden',  'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'limited', 'full'),
};

export function canSeeEduDashboardSection(section: EduDashboardSection, role: EducationRoleLens): EducationVisibility {
  return EDU_DASHBOARD_SECTION_MATRIX[section]?.[role] ?? 'hidden';
}

// =============================================================================
// QUICK ACTIONS BY ROLE
// =============================================================================

export interface EducationQuickAction {
  id: string;
  label: string;
  icon: string;
}

const EDU_QUICK_ACTIONS: Partial<Record<EducationRoleLens, EducationQuickAction[]>> = {
  E1: [
    { id: 'enrollment', label: 'Enrollment', icon: 'person.3.fill' },
    { id: 'budget', label: 'Budget Overview', icon: 'dollarsign.circle.fill' },
    { id: 'strategic-plan', label: 'Strategic Plan', icon: 'map.fill' },
    { id: 'accreditation', label: 'Accreditation', icon: 'checkmark.seal.fill' },
    { id: 'board-report', label: 'Board Report', icon: 'doc.text.fill' },
    { id: 'campus-safety', label: 'Campus Safety', icon: 'shield.fill' },
  ],
  E2: [
    { id: 'academic-programs', label: 'Academic Programs', icon: 'book.fill' },
    { id: 'faculty-hiring', label: 'Faculty Hiring', icon: 'person.badge.plus' },
    { id: 'curriculum', label: 'Curriculum Review', icon: 'doc.text.fill' },
    { id: 'research', label: 'Research Grants', icon: 'magnifyingglass' },
  ],
  E3: [
    { id: 'my-courses', label: 'My Courses', icon: 'book.fill' },
    { id: 'grading', label: 'Grading', icon: 'checkmark.circle.fill' },
    { id: 'office-hours', label: 'Office Hours', icon: 'clock.fill' },
    { id: 'research', label: 'Research', icon: 'magnifyingglass' },
  ],
  E7: [
    { id: 'my-schedule', label: 'My Schedule', icon: 'calendar' },
    { id: 'grades', label: 'Grades', icon: 'chart.bar.fill' },
    { id: 'financial-aid', label: 'Financial Aid', icon: 'dollarsign.circle.fill' },
    { id: 'campus-map', label: 'Campus Map', icon: 'map.fill' },
  ],
  E10: [
    { id: 'apply', label: 'Apply Now', icon: 'pencil.and.outline' },
    { id: 'visit', label: 'Plan a Visit', icon: 'mappin.and.ellipse' },
    { id: 'programs', label: 'Programs', icon: 'book.fill' },
  ],
};

export function getEduQuickActions(role: EducationRoleLens): EducationQuickAction[] {
  return EDU_QUICK_ACTIONS[role] || EDU_QUICK_ACTIONS.E10 || [];
}

// =============================================================================
// VISIBILITY HELPERS
// =============================================================================

export function isPresident(role: EducationRoleLens): boolean {
  return role === 'E1';
}

export function isDeanLevel(role: EducationRoleLens): boolean {
  return role === 'E1' || role === 'E2';
}

export function isFacultyLevel(role: EducationRoleLens): boolean {
  return role === 'E1' || role === 'E2' || role === 'E3';
}

export function isStudent(role: EducationRoleLens): boolean {
  return role === 'E7';
}

export function isEnrolled(role: EducationRoleLens): boolean {
  return role === 'E1' || role === 'E2' || role === 'E3' || role === 'E4'
    || role === 'E5' || role === 'E6' || role === 'E7';
}

// =============================================================================
// BACKWARD COMPAT — used by universal-course-sheet, universal-program-sheet,
// universal-student-sheet from previous session
// =============================================================================

export type CourseTab = 'overview' | 'roster' | 'grades' | 'assignments' | 'syllabus' | 'sessions' | 'attendance' | 'operations' | 'compliance';
export type ProgramTab = 'overview' | 'curriculum' | 'students' | 'outcomes' | 'people' | 'courses' | 'calendar' | 'operations' | 'finance' | 'payment_rails' | 'compliance' | 'notes';
export type StudentTab = 'overview' | 'academics' | 'financial' | 'housing' | 'activities' | 'enrollment' | 'attendance' | 'grades' | 'notes' | 'compliance';

export function getCourseSheetTabs(role: EducationRoleLens): { id: CourseTab; label: string }[] {
  const all: { id: CourseTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'roster', label: 'Roster' },
    { id: 'grades', label: 'Grades' },
    { id: 'assignments', label: 'Assignments' },
  ];
  // External roles see overview only
  if (role === 'E10' || role === 'E12') return all.filter((t) => t.id === 'overview');
  // Students see everything except roster
  if (role === 'E7' || role === 'E8') return all.filter((t) => t.id !== 'roster');
  return all;
}

export function getProgramSheetTabs(role: EducationRoleLens): { id: ProgramTab; label: string }[] {
  const all: { id: ProgramTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'students', label: 'Students' },
    { id: 'outcomes', label: 'Outcomes' },
  ];
  if (role === 'E10' || role === 'E12') return all.filter((t) => t.id === 'overview');
  if (role === 'E7' || role === 'E8') return all.filter((t) => t.id !== 'students');
  return all;
}

export function getStudentSheetTabs(role: EducationRoleLens): { id: StudentTab; label: string }[] {
  const all: { id: StudentTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'academics', label: 'Academics' },
    { id: 'financial', label: 'Financial' },
    { id: 'housing', label: 'Housing' },
    { id: 'activities', label: 'Activities' },
  ];
  if (role === 'E10' || role === 'E12') return [];
  if (role === 'E7' || role === 'E8') return all.filter((t) => t.id !== 'financial');
  return all;
}

export function isFullAccess(role: EducationRoleLens): boolean {
  return role === 'E1';
}

export function isProgramDirector(role: EducationRoleLens): boolean {
  return isDeanLevel(role);
}

export function isStudentOrParent(role: EducationRoleLens): boolean {
  return role === 'E7' || role === 'E8';
}

export function canViewGrades(role: EducationRoleLens): boolean {
  return role !== 'E10' && role !== 'E12';
}

// =============================================================================
// ROLE MAPPING
// =============================================================================

// =============================================================================
// MEMBERSHIP → LENS (direct membership_id mapping for ActiveView)
// =============================================================================

const EDUCATION_MEMBERSHIP_MAP: Record<string, EducationRoleLens> = {
  mem_edu_fmu_president: 'E1',
  mem_edu_fmu_provost: 'E2',
  mem_edu_fmu_chair: 'E3',
  mem_edu_fmu_student_services: 'E4',
  mem_edu_fmu_registrar: 'E5',
  mem_edu_fmu_facilities: 'E6',
  mem_edu_fmu_student: 'E7',
  mem_edu_fmu_parent: 'E8',
  mem_edu_fmu_alumnus: 'E9',
  mem_edu_fmu_prospect: 'E10',
  mem_edu_fmu_donor: 'E11',
  mem_edu_fmu_accreditor: 'E12',
  mem_edu_fmu_trustee: 'E13',
};

export function getEducationRole(membershipId: string): EducationRoleLens {
  return EDUCATION_MEMBERSHIP_MAP[membershipId] ?? 'E10';
}

export function mapRoleToEducationLens(role: string): EducationRoleLens {
  switch (role) {
    case 'president':
    case 'chancellor':
    case 'superintendent':
      return 'E1';
    case 'provost':
    case 'dean':
    case 'vp_academic':
      return 'E2';
    case 'faculty':
    case 'professor':
    case 'department_chair':
    case 'instructor':
      return 'E3';
    case 'student_services':
    case 'counselor':
    case 'advisor':
      return 'E4';
    case 'registrar':
    case 'compliance_officer':
      return 'E5';
    case 'facilities':
    case 'campus_ops':
    case 'staff':
      return 'E6';
    case 'student':
    case 'undergraduate':
    case 'graduate':
      return 'E7';
    case 'parent':
    case 'guardian':
      return 'E8';
    case 'alumnus':
    case 'alumni':
      return 'E9';
    case 'prospective':
    case 'applicant':
    case 'visitor':
    case 'public':
      return 'E10';
    case 'donor':
    case 'endowment':
      return 'E11';
    case 'accreditor':
    case 'evaluator':
      return 'E12';
    case 'trustee':
    case 'board_member':
      return 'E13';
    default:
      return 'E10';
  }
}

// =============================================================================
// HOME PILL VISIBILITY (4-pill layout)
// =============================================================================

export type EducationHomePill = 'dashboard' | 'calendar' | 'faculty' | 'admissions';

//                                                        E1     E2     E3     E4     E5     E6     E7     E8     E9     E10    E11    E12    E13
const EDU_HOME_PILL_MATRIX: Record<EducationHomePill, Record<EducationRoleLens, V>> = {
  dashboard:  r('full', 'full', 'full', 'full', 'full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  calendar:   r('full', 'full', 'full', 'full', 'full', 'full',    'full',    'full',    'full',    'full',    'full',    'hidden',  'full'),
  faculty:    r('full', 'full', 'full', 'full', 'full', 'limited', 'full',    'limited', 'limited', 'limited', 'hidden',  'hidden',  'full'),
  admissions: r('full', 'full', 'full', 'full', 'full', 'hidden',  'limited', 'limited', 'hidden',  'full',    'hidden',  'hidden',  'full'),
};

export function getEducationVisiblePills(role: EducationRoleLens): EducationHomePill[] {
  return (Object.keys(EDU_HOME_PILL_MATRIX) as EducationHomePill[])
    .filter((pill) => EDU_HOME_PILL_MATRIX[pill][role] !== 'hidden');
}
```

### B5. utils/competition-rbac.ts

```typescript
/**
 * Competition Mode RBAC — 7-level role lens visibility matrix (CO1-CO11).
 * CO1:  Owner / Commissioner — sees everything including financials
 * CO2:  Race Director — everything except financials
 * CO3:  Team Principal — standings, Race Ops, own-team Technical, Entries
 * CO4:  Driver — standings, own schedule/results only
 * CO5:  Crew — standings, own team Technical
 * CO10: Fan — Hero, Next Race, Commerce, Standings only
 * CO11: Sponsor — same as Fan + health metrics
 */

// =============================================================================
// ROLE LEVELS
// =============================================================================

export type CompetitionRoleLens = 'CO1' | 'CO2' | 'CO3' | 'CO4' | 'CO5' | 'CO10' | 'CO11';

export type Visibility = 'full' | 'limited' | 'hidden';

export const COMPETITION_ROLE_LABELS: Record<CompetitionRoleLens, string> = {
  CO1: 'Owner / Commissioner',
  CO2: 'Race Director',
  CO3: 'Team Principal',
  CO4: 'Driver',
  CO5: 'Crew',
  CO10: 'Fan',
  CO11: 'Sponsor',
};

// =============================================================================
// SERIES SHEET TAB VISIBILITY
// =============================================================================

export type SeriesTab =
  | 'dashboard' | 'standings' | 'calendar' | 'events' | 'ops'
  | 'rules' | 'tech_compliance' | 'finance' | 'payment_rails'
  | 'venues' | 'sponsors' | 'media';

const SERIES_TAB_MATRIX: Record<SeriesTab, Record<CompetitionRoleLens, Visibility>> = {
  dashboard:       { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  standings:       { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  calendar:        { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  events:          { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  ops:             { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  rules:           { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  tech_compliance: { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'limited', CO10: 'hidden',  CO11: 'hidden' },
  finance:         { CO1: 'full', CO2: 'hidden', CO3: 'hidden', CO4: 'hidden', CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  payment_rails:   { CO1: 'full', CO2: 'hidden', CO3: 'hidden', CO4: 'hidden', CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  venues:          { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  sponsors:        { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'limited', CO11: 'limited' },
  media:           { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
};

export function getSeriesSheetTabs(role: CompetitionRoleLens): { id: SeriesTab; label: string; visibility: Visibility }[] {
  const labels: Record<SeriesTab, string> = {
    dashboard: 'Dashboard', standings: 'Standings', calendar: 'Calendar',
    events: 'Events', ops: 'Ops', rules: 'Rules', tech_compliance: 'Tech + Compliance',
    finance: 'Finance', payment_rails: 'Payment Rails', venues: 'Venues',
    sponsors: 'Sponsors', media: 'Media',
  };
  return (Object.keys(SERIES_TAB_MATRIX) as SeriesTab[])
    .filter((tab) => SERIES_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: SERIES_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// ENTRANT SHEET TAB VISIBILITY
// =============================================================================

export type EntrantTab =
  | 'overview' | 'roster' | 'performance' | 'compliance' | 'payouts' | 'media_obligations';

const ENTRANT_TAB_MATRIX: Record<EntrantTab, Record<CompetitionRoleLens, Visibility>> = {
  overview:           { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  roster:             { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  performance:        { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  compliance:         { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'limited', CO10: 'hidden',  CO11: 'hidden' },
  payouts:            { CO1: 'full', CO2: 'hidden', CO3: 'hidden', CO4: 'hidden', CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  media_obligations:  { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
};

export function getEntrantSheetTabs(role: CompetitionRoleLens): { id: EntrantTab; label: string; visibility: Visibility }[] {
  const labels: Record<EntrantTab, string> = {
    overview: 'Overview', roster: 'Roster / Personnel', performance: 'Performance',
    compliance: 'Compliance', payouts: 'Payouts', media_obligations: 'Media Obligations',
  };
  return (Object.keys(ENTRANT_TAB_MATRIX) as EntrantTab[])
    .filter((tab) => ENTRANT_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: ENTRANT_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// EVENT SHEET TAB VISIBILITY
// =============================================================================

export type EventTab =
  | 'agenda' | 'sessions' | 'ops' | 'live_control' | 'results'
  | 'incidents' | 'payouts' | 'media_deliverables';

const EVENT_TAB_MATRIX: Record<EventTab, Record<CompetitionRoleLens, Visibility>> = {
  agenda:             { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  sessions:           { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  ops:                { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  live_control:       { CO1: 'full', CO2: 'full', CO3: 'hidden',  CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  results:            { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  incidents:          { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  payouts:            { CO1: 'full', CO2: 'hidden', CO3: 'hidden', CO4: 'hidden', CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  media_deliverables: { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
};

export function getEventSheetTabs(role: CompetitionRoleLens): { id: EventTab; label: string; visibility: Visibility }[] {
  const labels: Record<EventTab, string> = {
    agenda: 'Agenda', sessions: 'Sessions', ops: 'Ops', live_control: 'Live Control',
    results: 'Results', incidents: 'Incidents', payouts: 'Payouts',
    media_deliverables: 'Media Deliverables',
  };
  return (Object.keys(EVENT_TAB_MATRIX) as EventTab[])
    .filter((tab) => EVENT_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: EVENT_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// DASHBOARD MODULE VISIBILITY
// =============================================================================

export type DashboardModule =
  | 'header' | 'today_next' | 'live_status' | 'format_snapshot'
  | 'standings_bracket' | 'schedule_snapshot' | 'media_storylines'
  | 'announcements' | 'ops_taskboard' | 'staff_contacts'
  | 'officials_compliance' | 'sponsors_revenue' | 'governance' | 'audit_trail';

const DASHBOARD_MODULE_MATRIX: Record<DashboardModule, Record<CompetitionRoleLens, Visibility>> = {
  header:               { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'full',    CO5: 'full',    CO10: 'full',    CO11: 'full' },
  today_next:           { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  live_status:          { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  format_snapshot:      { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  standings_bracket:    { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  schedule_snapshot:    { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  media_storylines:     { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  announcements:        { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  ops_taskboard:        { CO1: 'full', CO2: 'full', CO3: 'hidden',  CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  staff_contacts:       { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'limited', CO11: 'limited' },
  officials_compliance: { CO1: 'full', CO2: 'full', CO3: 'hidden',  CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  sponsors_revenue:     { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'limited', CO11: 'limited' },
  governance:           { CO1: 'full', CO2: 'hidden', CO3: 'hidden', CO4: 'hidden', CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  audit_trail:          { CO1: 'full', CO2: 'full', CO3: 'hidden',  CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
};

export function getDashboardModules(role: CompetitionRoleLens): { id: DashboardModule; visibility: Visibility }[] {
  return (Object.keys(DASHBOARD_MODULE_MATRIX) as DashboardModule[])
    .filter((mod) => DASHBOARD_MODULE_MATRIX[mod][role] !== 'hidden')
    .map((mod) => ({ id: mod, visibility: DASHBOARD_MODULE_MATRIX[mod][role] }));
}

// =============================================================================
// DASHBOARD SECTION VISIBILITY (Home dashboard sections)
// =============================================================================

export type CompDashboardSection =
  | 'video_hero' | 'next_race' | 'commerce_row'
  | 'driver_standings' | 'team_standings'
  | 'race_ops' | 'technical' | 'entries';

const COMP_DASHBOARD_SECTION_MATRIX: Record<CompDashboardSection, Record<CompetitionRoleLens, Visibility>> = {
  video_hero:        { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'full',    CO5: 'full',    CO10: 'full',    CO11: 'full' },
  next_race:         { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'full',    CO5: 'full',    CO10: 'full',    CO11: 'full' },
  commerce_row:      { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'full',    CO5: 'full',    CO10: 'full',    CO11: 'full' },
  driver_standings:  { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'full',    CO5: 'full',    CO10: 'full',    CO11: 'full' },
  team_standings:    { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'full',    CO5: 'full',    CO10: 'full',    CO11: 'full' },
  race_ops:          { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  technical:         { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'limited', CO10: 'hidden',  CO11: 'hidden' },
  entries:           { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
};

export function canSeeDashboardSection(section: CompDashboardSection, role: CompetitionRoleLens): boolean {
  return COMP_DASHBOARD_SECTION_MATRIX[section][role] !== 'hidden';
}

// =============================================================================
// QUICK ACTIONS BY ROLE
// =============================================================================

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
}

const QUICK_ACTIONS: Record<CompetitionRoleLens, QuickAction[]> = {
  CO1: [
    { id: 'live-ops', label: 'Open Live Ops', icon: 'antenna.radiowaves.left.and.right' },
    { id: 'publish-schedule', label: 'Publish Schedule', icon: 'calendar.badge.plus' },
    { id: 'update-bracket', label: 'Update Bracket/Standings', icon: 'chart.bar.fill' },
    { id: 'announcement', label: 'Post Announcement', icon: 'megaphone.fill' },
    { id: 'staff-invites', label: 'Staff / Invites', icon: 'person.badge.plus' },
    { id: 'finance', label: 'Finance Snapshot', icon: 'dollarsign.circle.fill' },
    { id: 'governance', label: 'Governance Docs', icon: 'doc.text.fill' },
  ],
  CO2: [
    { id: 'live-ops', label: 'Open Live Ops', icon: 'antenna.radiowaves.left.and.right' },
    { id: 'publish-schedule', label: 'Publish Schedule', icon: 'calendar.badge.plus' },
    { id: 'update-bracket', label: 'Update Bracket', icon: 'chart.bar.fill' },
    { id: 'announcement', label: 'Post Announcement', icon: 'megaphone.fill' },
    { id: 'staff', label: 'Staff / Assignments', icon: 'person.2.fill' },
    { id: 'incident-log', label: 'Incident Log', icon: 'exclamationmark.triangle.fill' },
  ],
  CO3: [
    { id: 'schedule', label: 'View Schedule', icon: 'calendar' },
    { id: 'standings', label: 'View Standings', icon: 'chart.bar.fill' },
    { id: 'team-tech', label: 'Team Technical', icon: 'wrench.and.screwdriver.fill' },
    { id: 'entries', label: 'Entry List', icon: 'person.crop.rectangle.stack.fill' },
  ],
  CO4: [
    { id: 'schedule', label: 'My Schedule', icon: 'calendar' },
    { id: 'standings', label: 'View Standings', icon: 'chart.bar.fill' },
    { id: 'results', label: 'My Results', icon: 'flag.checkered' },
  ],
  CO5: [
    { id: 'schedule', label: 'View Schedule', icon: 'calendar' },
    { id: 'standings', label: 'View Standings', icon: 'chart.bar.fill' },
    { id: 'technical', label: 'Team Technical', icon: 'wrench.and.screwdriver.fill' },
  ],
  CO10: [
    { id: 'bracket', label: 'View Bracket/Standings', icon: 'chart.bar.fill' },
    { id: 'schedule', label: 'View Schedule', icon: 'calendar' },
    { id: 'highlights', label: 'Watch Highlights', icon: 'play.rectangle.fill' },
  ],
  CO11: [
    { id: 'bracket', label: 'View Standings', icon: 'chart.bar.fill' },
    { id: 'schedule', label: 'View Schedule', icon: 'calendar' },
    { id: 'highlights', label: 'Watch Highlights', icon: 'play.rectangle.fill' },
    { id: 'metrics', label: 'Health Metrics', icon: 'chart.line.uptrend.xyaxis' },
  ],
};

export function getQuickActions(role: CompetitionRoleLens): QuickAction[] {
  return QUICK_ACTIONS[role] || QUICK_ACTIONS.CO10;
}

// =============================================================================
// MEMBERSHIP → LENS (direct membership_id mapping for ActiveView)
// =============================================================================

const COMPETITION_MEMBERSHIP_MAP: Record<string, CompetitionRoleLens> = {
  mem_comp_k1_owner_commish: 'CO1',
  mem_comp_k1_race_director: 'CO2',
  mem_comp_k1_team_principal: 'CO3',
  mem_comp_k1_driver: 'CO4',
  mem_comp_k1_crew: 'CO5',
  mem_comp_k1_fan: 'CO10',
  mem_comp_k1_sponsor: 'CO11',
};

export function getCompetitionRole(membershipId: string): CompetitionRoleLens {
  return COMPETITION_MEMBERSHIP_MAP[membershipId] ?? 'CO10';
}

export function mapRoleToCompetitionLens(role: string): CompetitionRoleLens {
  switch (role) {
    case 'league_admin':
    case 'commissioner':
    case 'owner':
      return 'CO1';
    case 'tournament_director':
    case 'event_director':
    case 'race_director':
      return 'CO2';
    case 'team_principal':
      return 'CO3';
    case 'driver':
      return 'CO4';
    case 'crew':
    case 'mechanic':
    case 'engineer':
      return 'CO5';
    case 'sponsor':
      return 'CO11';
    case 'fan':
    case 'viewer':
    case 'public':
    default:
      return 'CO10';
  }
}

// =============================================================================
// VISIBILITY HELPERS
// =============================================================================

export function canSeeModule(module: DashboardModule, role: CompetitionRoleLens): boolean {
  return DASHBOARD_MODULE_MATRIX[module][role] !== 'hidden';
}

export function isFullAccess(role: CompetitionRoleLens): boolean {
  return role === 'CO1' || role === 'CO2';
}

export function isStaffOrAbove(role: CompetitionRoleLens): boolean {
  return role === 'CO1' || role === 'CO2' || role === 'CO3';
}

// =============================================================================
// ORG TAB VISIBILITY (10 tabs in Competition Organization)
// =============================================================================

export type CompOrgTab =
  | 'series' | 'people' | 'rooms' | 'operations' | 'finance'
  | 'payment-rails' | 'compliance' | 'assets' | 'reports' | 'sponsors';

const COMP_ORG_TAB_MATRIX: Record<CompOrgTab, Record<CompetitionRoleLens, Visibility>> = {
  series:         { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  people:         { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  rooms:          { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  operations:     { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  finance:        { CO1: 'full', CO2: 'hidden', CO3: 'hidden', CO4: 'hidden', CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  'payment-rails':{ CO1: 'full', CO2: 'hidden', CO3: 'hidden', CO4: 'hidden', CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  compliance:     { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'limited', CO10: 'hidden',  CO11: 'hidden' },
  assets:         { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  reports:        { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  sponsors:       { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'limited', CO11: 'limited' },
};

export function getCompOrgTabVisibility(tab: CompOrgTab, role: CompetitionRoleLens): Visibility {
  return COMP_ORG_TAB_MATRIX[tab]?.[role] ?? 'hidden';
}

export function getVisibleCompOrgTabs(role: CompetitionRoleLens): CompOrgTab[] {
  return (Object.keys(COMP_ORG_TAB_MATRIX) as CompOrgTab[])
    .filter((tab) => COMP_ORG_TAB_MATRIX[tab][role] !== 'hidden');
}

// =============================================================================
// HOME PILL VISIBILITY (4-pill layout)
// =============================================================================

export type CompetitionHomePill = 'dashboard' | 'calendar' | 'grid' | 'entries';

const COMP_HOME_PILL_MATRIX: Record<CompetitionHomePill, Record<CompetitionRoleLens, Visibility>> = {
  dashboard: { CO1: 'full', CO2: 'full', CO3: 'full', CO4: 'full', CO5: 'full', CO10: 'full', CO11: 'full' },
  calendar:  { CO1: 'full', CO2: 'full', CO3: 'full', CO4: 'full', CO5: 'full', CO10: 'full', CO11: 'full' },
  grid:      { CO1: 'full', CO2: 'full', CO3: 'full', CO4: 'full', CO5: 'full', CO10: 'full', CO11: 'full' },
  entries:   { CO1: 'full', CO2: 'full', CO3: 'full', CO4: 'full', CO5: 'full', CO10: 'full', CO11: 'full' },
};

export function getCompetitionVisiblePills(role: CompetitionRoleLens): CompetitionHomePill[] {
  return (Object.keys(COMP_HOME_PILL_MATRIX) as CompetitionHomePill[])
    .filter((pill) => COMP_HOME_PILL_MATRIX[pill][role] !== 'hidden');
}
```

### B6. utils/business-rbac.ts

```typescript
/**
 * Business Mode RBAC — 8-level role lens visibility matrix.
 * B1:  Founder / CEO (Full access)
 * B2a: Investor (Retail) — Curated data room
 * B2b: Investor (Strategic/Board) — Board-level data room
 * B3:  Public
 * B4:  Subscriber (Public only)
 * B5:  Prospective Acquirer (Acquisition workspace scoped)
 * B8:  Advisor / Board Member
 * B13: Holding Company / Parent
 */

// =============================================================================
// ROLE LEVELS
// =============================================================================

export type BusinessRoleLens = 'B1' | 'B2a' | 'B2b' | 'B3' | 'B4' | 'B5' | 'B8' | 'B13';

export type InvestorTier = 'retail' | 'board';

export type BusinessVisibility = 'full' | 'exact' | 'banded' | 'limited' | 'hidden';

export type MetricVisibility = 'exact' | 'banded' | 'hidden';

export type DocAccessTag = 'public' | 'retail' | 'board' | 'founder_only' | 'workspace_only';

export const BUSINESS_ROLE_LABELS: Record<BusinessRoleLens, string> = {
  B1: 'Founder / CEO',
  B2a: 'Investor (Retail)',
  B2b: 'Investor (Strategic/Board)',
  B3: 'Public',
  B4: 'Subscriber',
  B5: 'Prospective Acquirer',
  B8: 'Advisor / Board',
  B13: 'Holding Company / Parent',
};

// =============================================================================
// COMPANY SHEET TAB VISIBILITY
// =============================================================================

export type CompanyTab =
  | 'overview' | 'product' | 'traction' | 'roadmap'
  | 'finance' | 'governance' | 'people' | 'comms';

const COMPANY_TAB_MATRIX: Record<CompanyTab, Record<BusinessRoleLens, BusinessVisibility>> = {
  overview:   { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'limited', B4: 'limited', B5: 'limited', B8: 'full',    B13: 'full' },
  product:    { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'limited', B4: 'limited', B5: 'limited', B8: 'full',    B13: 'full' },
  traction:   { B1: 'full', B2a: 'banded',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'limited', B8: 'exact',   B13: 'full' },
  roadmap:    { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'limited', B8: 'exact',   B13: 'full' },
  finance:    { B1: 'full', B2a: 'banded',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'exact',   B13: 'full' },
  governance: { B1: 'full', B2a: 'hidden',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'exact',   B13: 'full' },
  people:     { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'limited', B4: 'limited', B5: 'limited', B8: 'exact',   B13: 'full' },
  comms:      { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'limited', B4: 'limited', B5: 'limited', B8: 'exact',   B13: 'full' },
};

export function getCompanySheetTabs(role: BusinessRoleLens): { id: CompanyTab; label: string; visibility: BusinessVisibility }[] {
  const labels: Record<CompanyTab, string> = {
    overview: 'Overview', product: 'Product', traction: 'Traction',
    roadmap: 'Roadmap', finance: 'Finance', governance: 'Governance',
    people: 'People', comms: 'Comms',
  };
  return (Object.keys(COMPANY_TAB_MATRIX) as CompanyTab[])
    .filter((tab) => COMPANY_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: COMPANY_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// DATA ROOM SHEET TAB VISIBILITY
// =============================================================================

export type DataRoomTab =
  | 'start_here' | 'pitch_pack' | 'product_demo'
  | 'financials' | 'legal' | 'board_pack' | 'decision_log';

const DATA_ROOM_TAB_MATRIX: Record<DataRoomTab, Record<BusinessRoleLens, BusinessVisibility>> = {
  start_here:   { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'limited', B13: 'full' },
  pitch_pack:   { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'limited', B13: 'full' },
  product_demo: { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'limited', B13: 'full' },
  financials:   { B1: 'full', B2a: 'banded',  B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'exact',   B13: 'full' },
  legal:        { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'exact',   B13: 'full' },
  board_pack:   { B1: 'full', B2a: 'hidden',  B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'exact',   B13: 'full' },
  decision_log: { B1: 'full', B2a: 'hidden',  B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'exact',   B13: 'full' },
};

export function getDataRoomTabs(role: BusinessRoleLens): { id: DataRoomTab; label: string; visibility: BusinessVisibility }[] {
  const labels: Record<DataRoomTab, string> = {
    start_here: 'Start Here', pitch_pack: 'Pitch Pack', product_demo: 'Product Demo',
    financials: 'Financials', legal: 'Legal', board_pack: 'Board Pack',
    decision_log: 'Decision Log',
  };
  return (Object.keys(DATA_ROOM_TAB_MATRIX) as DataRoomTab[])
    .filter((tab) => DATA_ROOM_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: DATA_ROOM_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// DEAL / ASSET SHEET TAB VISIBILITY
// =============================================================================

export type DealTab =
  | 'overview' | 'pipeline' | 'diligence' | 'financial_model'
  | 'risks' | 'offer_terms' | 'approvals' | 'audit_log';

const DEAL_TAB_MATRIX: Record<DealTab, Record<BusinessRoleLens, BusinessVisibility>> = {
  overview:        { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full',    B8: 'exact',   B13: 'full' },
  pipeline:        { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full',    B8: 'exact',   B13: 'full' },
  diligence:       { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full',    B8: 'exact',   B13: 'full' },
  financial_model: { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full',    B8: 'exact',   B13: 'full' },
  risks:           { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full',    B8: 'exact',   B13: 'full' },
  offer_terms:     { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full',    B8: 'exact',   B13: 'full' },
  approvals:       { B1: 'full', B2a: 'hidden', B2b: 'limited', B3: 'hidden', B4: 'hidden', B5: 'limited', B8: 'limited', B13: 'full' },
  audit_log:       { B1: 'full', B2a: 'hidden', B2b: 'limited', B3: 'hidden', B4: 'hidden', B5: 'limited', B8: 'limited', B13: 'full' },
};

export function getDealSheetTabs(role: BusinessRoleLens): { id: DealTab; label: string; visibility: BusinessVisibility }[] {
  const labels: Record<DealTab, string> = {
    overview: 'Overview', pipeline: 'Pipeline', diligence: 'Diligence',
    financial_model: 'Financial Model', risks: 'Risks', offer_terms: 'Offer / Terms',
    approvals: 'Approvals', audit_log: 'Audit Log',
  };
  return (Object.keys(DEAL_TAB_MATRIX) as DealTab[])
    .filter((tab) => DEAL_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: DEAL_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// METRIC VISIBILITY
// =============================================================================

export function getMetricVisibility(role: BusinessRoleLens): MetricVisibility {
  switch (role) {
    case 'B1':
    case 'B2b':
    case 'B8':
    case 'B13':
      return 'exact';
    case 'B2a':
      return 'banded';
    case 'B5':
      return 'banded';
    case 'B3':
    case 'B4':
    default:
      return 'hidden';
  }
}

// =============================================================================
// DOCUMENT ACCESS
// =============================================================================

export function canAccessDoc(tag: DocAccessTag, role: BusinessRoleLens, tier?: InvestorTier): boolean {
  // Founder and holding company see everything
  if (role === 'B1' || role === 'B13') return true;

  // Workspace-only docs are restricted to B5 acquirers
  if (tag === 'workspace_only') return role === 'B5';

  // Public docs are visible to everyone
  if (tag === 'public') return true;

  // Founder-only docs are restricted to B1/B13 (handled above)
  if (tag === 'founder_only') return false;

  // Retail docs: accessible by B2a, B2b, B5, B8
  if (tag === 'retail') {
    return role === 'B2a' || role === 'B2b' || role === 'B5' || role === 'B8';
  }

  // Board docs: accessible by B2b and B8
  if (tag === 'board') {
    return role === 'B2b' || role === 'B8';
  }

  return false;
}

// =============================================================================
// ROLE MAPPING
// =============================================================================

// =============================================================================
// MEMBERSHIP → LENS (direct membership_id mapping for ActiveView)
// =============================================================================

const BUSINESS_MEMBERSHIP_MAP: Record<string, BusinessRoleLens> = {
  mem_biz_kanext_founder: 'B1',
};

export function getBusinessRole(membershipId: string): BusinessRoleLens {
  return BUSINESS_MEMBERSHIP_MAP[membershipId] ?? 'B1';
}

export function mapRoleToBusinessLens(role: string): BusinessRoleLens {
  switch (role) {
    case 'founder':
    case 'ceo':
    case 'owner':
      return 'B1';
    case 'retail_investor':
    case 'angel':
    case 'investor_retail':
      return 'B2a';
    case 'board_member':
    case 'strategic_investor':
    case 'investor_board':
    case 'board':
      return 'B2b';
    case 'public':
    case 'visitor':
      return 'B3';
    case 'subscriber':
    case 'follower':
      return 'B4';
    case 'acquirer':
    case 'prospective_acquirer':
    case 'buyer':
      return 'B5';
    case 'advisor':
    case 'board_advisor':
      return 'B8';
    case 'holding_company':
    case 'parent':
    case 'parent_org':
      return 'B13';
    default:
      return 'B3';
  }
}

// =============================================================================
// VISIBILITY HELPERS
// =============================================================================

export function isFounder(role: BusinessRoleLens): boolean {
  return role === 'B1';
}

export function isBoardLevel(role: BusinessRoleLens): boolean {
  return role === 'B1' || role === 'B2b' || role === 'B8' || role === 'B13';
}

export function isInvestor(role: BusinessRoleLens): boolean {
  return role === 'B2a' || role === 'B2b';
}

// =============================================================================
// QUICK ACTIONS BY ROLE
// =============================================================================

export interface BusinessQuickAction {
  id: string;
  label: string;
  icon: string;
}

const BUSINESS_QUICK_ACTIONS: Record<BusinessRoleLens, BusinessQuickAction[]> = {
  B1: [
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'data-room', label: 'Open Data Room', icon: 'folder.fill' },
    { id: 'deal-workspace', label: 'Deal Workspaces', icon: 'briefcase.fill' },
    { id: 'finance-snapshot', label: 'Finance Snapshot', icon: 'dollarsign.circle.fill' },
    { id: 'investor-update', label: 'Draft Investor Update', icon: 'envelope.fill' },
    { id: 'governance', label: 'Governance', icon: 'doc.text.fill' },
    { id: 'team', label: 'Team & People', icon: 'person.2.fill' },
  ],
  B2a: [
    { id: 'data-room', label: 'Open Data Room', icon: 'folder.fill' },
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'traction', label: 'View Traction', icon: 'chart.line.uptrend.xyaxis' },
    { id: 'updates', label: 'Investor Updates', icon: 'envelope.fill' },
    { id: 'team', label: 'Meet the Team', icon: 'person.2.fill' },
  ],
  B2b: [
    { id: 'data-room', label: 'Open Data Room', icon: 'folder.fill' },
    { id: 'board-pack', label: 'Board Pack', icon: 'doc.richtext.fill' },
    { id: 'finance', label: 'Financials', icon: 'dollarsign.circle.fill' },
    { id: 'governance', label: 'Governance', icon: 'doc.text.fill' },
    { id: 'decision-log', label: 'Decision Log', icon: 'list.bullet.clipboard.fill' },
    { id: 'deal-workspace', label: 'Deal Workspaces', icon: 'briefcase.fill' },
  ],
  B3: [
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'product', label: 'Product Info', icon: 'app.fill' },
    { id: 'team', label: 'Team', icon: 'person.2.fill' },
  ],
  B4: [
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'product', label: 'Product Info', icon: 'app.fill' },
    { id: 'comms', label: 'Updates', icon: 'megaphone.fill' },
    { id: 'team', label: 'Team', icon: 'person.2.fill' },
  ],
  B5: [
    { id: 'deal-workspace', label: 'Acquisition Workspace', icon: 'briefcase.fill' },
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'product', label: 'Product Info', icon: 'app.fill' },
    { id: 'team', label: 'Team & People', icon: 'person.2.fill' },
  ],
  B8: [
    { id: 'board-pack', label: 'Board Pack', icon: 'doc.richtext.fill' },
    { id: 'data-room', label: 'Data Room', icon: 'folder.fill' },
    { id: 'governance', label: 'Governance', icon: 'doc.text.fill' },
    { id: 'finance', label: 'Financials', icon: 'dollarsign.circle.fill' },
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
  ],
  B13: [
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'data-room', label: 'Data Room', icon: 'folder.fill' },
    { id: 'finance', label: 'Financials', icon: 'dollarsign.circle.fill' },
    { id: 'governance', label: 'Governance', icon: 'doc.text.fill' },
    { id: 'deal-workspace', label: 'Deal Workspaces', icon: 'briefcase.fill' },
    { id: 'team', label: 'Team & People', icon: 'person.2.fill' },
  ],
};

export function getBusinessQuickActions(role: BusinessRoleLens): BusinessQuickAction[] {
  return BUSINESS_QUICK_ACTIONS[role] || BUSINESS_QUICK_ACTIONS.B3;
}

// =============================================================================
// ORG TAB VISIBILITY (10 tabs in Business Organization)
// =============================================================================

export type BizOrgTab =
  | 'entities' | 'people' | 'rooms' | 'operations' | 'finance'
  | 'payment-rails' | 'legal' | 'compliance' | 'assets' | 'reports';

const BIZ_ORG_TAB_MATRIX: Record<BizOrgTab, Record<BusinessRoleLens, BusinessVisibility>> = {
  entities:       { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'limited', B4: 'limited', B5: 'limited', B8: 'limited', B13: 'full' },
  people:         { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'limited', B4: 'hidden',  B5: 'hidden',  B8: 'exact',   B13: 'full' },
  rooms:          { B1: 'full', B2a: 'hidden',  B2b: 'limited', B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'limited', B13: 'full' },
  operations:     { B1: 'full', B2a: 'hidden',  B2b: 'limited', B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'limited', B13: 'full' },
  finance:        { B1: 'full', B2a: 'banded',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'exact',   B13: 'full' },
  'payment-rails':{ B1: 'full', B2a: 'hidden',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'exact',   B13: 'full' },
  legal:          { B1: 'full', B2a: 'hidden',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'exact',   B13: 'full' },
  compliance:     { B1: 'full', B2a: 'hidden',  B2b: 'limited', B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'limited', B13: 'full' },
  assets:         { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'limited', B8: 'exact',   B13: 'full' },
  reports:        { B1: 'full', B2a: 'banded',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'limited', B8: 'exact',   B13: 'full' },
};

export function getBizOrgTabVisibility(tab: BizOrgTab, role: BusinessRoleLens): BusinessVisibility {
  return BIZ_ORG_TAB_MATRIX[tab]?.[role] ?? 'hidden';
}

export function getVisibleBizOrgTabs(role: BusinessRoleLens): BizOrgTab[] {
  return (Object.keys(BIZ_ORG_TAB_MATRIX) as BizOrgTab[])
    .filter((tab) => BIZ_ORG_TAB_MATRIX[tab][role] !== 'hidden');
}

// =============================================================================
// HOME PILL VISIBILITY (4-pill layout)
// =============================================================================

export type BusinessHomePill = 'dashboard' | 'calendar' | 'vault' | 'deals';

const BIZ_HOME_PILL_MATRIX: Record<BusinessHomePill, Record<BusinessRoleLens, BusinessVisibility>> = {
  dashboard: { B1: 'full', B2a: 'full', B2b: 'full', B3: 'full', B4: 'full', B5: 'full', B8: 'full', B13: 'full' },
  calendar:  { B1: 'full', B2a: 'full', B2b: 'full', B3: 'full', B4: 'full', B5: 'full', B8: 'full', B13: 'full' },
  vault:     { B1: 'full', B2a: 'full', B2b: 'full', B3: 'full', B4: 'full', B5: 'full', B8: 'full', B13: 'full' },
  deals:     { B1: 'full', B2a: 'full', B2b: 'full', B3: 'full', B4: 'full', B5: 'full', B8: 'full', B13: 'full' },
};

export function getBusinessVisiblePills(role: BusinessRoleLens): BusinessHomePill[] {
  return (Object.keys(BIZ_HOME_PILL_MATRIX) as BusinessHomePill[])
    .filter((pill) => BIZ_HOME_PILL_MATRIX[pill][role] !== 'hidden');
}

// =============================================================================
// DASHBOARD BLOCK VISIBILITY (7 blocks)
// =============================================================================

export type DashboardBlock =
  | 'video_hero' | 'next_event' | 'action_row' | 'pipeline'
  | 'proof' | 'top_deals' | 'domain_cards';

const DASHBOARD_BLOCK_MATRIX: Record<DashboardBlock, Record<BusinessRoleLens, boolean>> = {
  video_hero:   { B1: true,  B2a: true,  B2b: true,  B3: true,  B4: true,  B5: true,  B8: true,  B13: true },
  next_event:   { B1: true,  B2a: false, B2b: true,  B3: false, B4: false, B5: false, B8: true,  B13: true },
  action_row:   { B1: true,  B2a: true,  B2b: true,  B3: true,  B4: true,  B5: true,  B8: true,  B13: true },
  pipeline:     { B1: true,  B2a: true,  B2b: true,  B3: false, B4: false, B5: true,  B8: true,  B13: true },
  proof:        { B1: true,  B2a: true,  B2b: true,  B3: true,  B4: true,  B5: true,  B8: true,  B13: true },
  top_deals:    { B1: true,  B2a: false, B2b: true,  B3: false, B4: false, B5: false, B8: true,  B13: true },
  domain_cards: { B1: true,  B2a: true,  B2b: true,  B3: false, B4: false, B5: true,  B8: true,  B13: true },
};

export function isDashboardBlockVisible(block: DashboardBlock, role: BusinessRoleLens): boolean {
  return DASHBOARD_BLOCK_MATRIX[block]?.[role] ?? false;
}

// =============================================================================
// ACTION CARD VISIBILITY (3 cards in action row)
// =============================================================================

import type { BizActionCardId } from '@/data/mock-business-home';

const ACTION_CARD_MATRIX: Record<BizActionCardId, Record<BusinessRoleLens, boolean>> = {
  deck:      { B1: true,  B2a: true,  B2b: true,  B3: true,  B4: true,  B5: true,  B8: true,  B13: true },
  data_room: { B1: true,  B2a: true,  B2b: true,  B3: false, B4: false, B5: true,  B8: true,  B13: true },
  invest:    { B1: true,  B2a: true,  B2b: true,  B3: false, B4: false, B5: false, B8: false, B13: true },
};

export function isActionCardVisible(card: BizActionCardId, role: BusinessRoleLens): boolean {
  return ACTION_CARD_MATRIX[card]?.[role] ?? false;
}

// =============================================================================
// PIPELINE METRIC VISIBILITY (4 metrics)
// =============================================================================

export type PipelineMetric = 'total_value' | 'active_deals' | 'win_rate' | 'raised';

const PIPELINE_METRIC_MATRIX: Record<PipelineMetric, Record<BusinessRoleLens, MetricVisibility>> = {
  total_value:  { B1: 'exact', B2a: 'hidden',  B2b: 'exact',  B3: 'hidden', B4: 'hidden', B5: 'banded', B8: 'exact',  B13: 'exact' },
  active_deals: { B1: 'exact', B2a: 'exact',   B2b: 'exact',  B3: 'hidden', B4: 'hidden', B5: 'banded', B8: 'exact',  B13: 'exact' },
  win_rate:     { B1: 'exact', B2a: 'hidden',  B2b: 'exact',  B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'exact',  B13: 'exact' },
  raised:       { B1: 'exact', B2a: 'exact',   B2b: 'exact',  B3: 'hidden', B4: 'hidden', B5: 'banded', B8: 'exact',  B13: 'exact' },
};

export function getPipelineMetricVisibility(metric: PipelineMetric, role: BusinessRoleLens): MetricVisibility {
  return PIPELINE_METRIC_MATRIX[metric]?.[role] ?? 'hidden';
}

// =============================================================================
// DOMAIN CARD VISIBILITY (3 cards)
// =============================================================================

import type { BizDomainCardId } from '@/data/mock-business-home';

const DOMAIN_CARD_MATRIX: Record<BizDomainCardId, Record<BusinessRoleLens, boolean>> = {
  cap_table: { B1: true,  B2a: true,  B2b: true,  B3: false, B4: false, B5: true,  B8: true,  B13: true },
  metrics:   { B1: true,  B2a: false, B2b: true,  B3: false, B4: false, B5: true,  B8: true,  B13: true },
  updates:   { B1: true,  B2a: true,  B2b: true,  B3: false, B4: true,  B5: false, B8: true,  B13: true },
};

export function isBizDomainCardVisible(card: BizDomainCardId, role: BusinessRoleLens): boolean {
  return DOMAIN_CARD_MATRIX[card]?.[role] ?? false;
}
```

### B7. utils/nexus-rbac.ts

```typescript
/**
 * Nexus RBAC — 9-level x 9-capability matrix.
 * Determines what a user can do inside Nexus based on their role level.
 */

import type { Mode } from '@/types';
import type { RBACLevel, NexusCapability } from '@/types/nexus-v2';

// =============================================================================
// CAPABILITY MATRIX
// =============================================================================

const CAPABILITY_MATRIX: Record<RBACLevel, NexusCapability[]> = {
  R1: ['C1_ask', 'C2_navigate', 'C3_create_task', 'C4_create_request', 'C5_post_room', 'C6_summarize_room', 'C7_approve_deny', 'C8_high_impact', 'C9_cross_context'],
  R2: ['C1_ask', 'C2_navigate', 'C3_create_task', 'C4_create_request', 'C5_post_room', 'C6_summarize_room', 'C7_approve_deny'],
  R3: ['C1_ask', 'C2_navigate', 'C3_create_task', 'C4_create_request', 'C5_post_room', 'C6_summarize_room'],
  R4: ['C1_ask', 'C2_navigate', 'C3_create_task', 'C4_create_request', 'C5_post_room'],
  R5: ['C1_ask', 'C2_navigate', 'C4_create_request'],
  R6: ['C1_ask', 'C2_navigate', 'C3_create_task', 'C4_create_request'],
  R7: ['C1_ask', 'C2_navigate', 'C4_create_request'],
  R8: ['C1_ask', 'C2_navigate', 'C4_create_request'],
  R9: ['C1_ask', 'C2_navigate'],
};

export function getUserCapabilities(role: RBACLevel): NexusCapability[] {
  return CAPABILITY_MATRIX[role] || [];
}

export function canPerform(role: RBACLevel, capability: NexusCapability): boolean {
  return CAPABILITY_MATRIX[role]?.includes(capability) ?? false;
}

// =============================================================================
// REFUSAL MESSAGES (Doc 8 tone — calm, decisive, never leak details)
// =============================================================================

const CAPABILITY_LABELS: Record<NexusCapability, string> = {
  C1_ask: 'ask questions',
  C2_navigate: 'navigate',
  C3_create_task: 'create tasks',
  C4_create_request: 'create requests',
  C5_post_room: 'post to rooms',
  C6_summarize_room: 'summarize rooms',
  C7_approve_deny: 'approve or deny requests',
  C8_high_impact: 'execute high-impact actions',
  C9_cross_context: 'search across all contexts',
};

export function getRefusalMessage(capability: NexusCapability): string {
  const label = CAPABILITY_LABELS[capability];
  return `I can't ${label} at your current access level.\nI can:\n1. Create a request to the right owner\n2. Save as open question\nReply 1 or 2.`;
}

// =============================================================================
// ACTION → CAPABILITY MAPPING
// =============================================================================

const ACTION_CAPABILITY_MAP: Record<string, NexusCapability> = {
  create_task: 'C3_create_task',
  create_request: 'C4_create_request',
  post_room: 'C5_post_room',
  summarize_room: 'C6_summarize_room',
  approve: 'C7_approve_deny',
  deny: 'C7_approve_deny',
  escalate: 'C4_create_request',
  generate_packet: 'C8_high_impact',
  navigate: 'C2_navigate',
  switch_context: 'C2_navigate',
  show_contexts: 'C1_ask',
  show_workspaces: 'C1_ask',
  create_workspace: 'C3_create_task',
  add_to_board: 'C3_create_task',
  remove_from_board: 'C3_create_task',
  change_pipeline_stage: 'C3_create_task',
  flag_player: 'C3_create_task',
  create_calendar_event: 'C3_create_task',
  update_scholarship: 'C8_high_impact',
  adjust_budget: 'C8_high_impact',
  send_dm: 'C5_post_room',
  pin_conversation: 'C1_ask',
  unpin_conversation: 'C1_ask',
};

export function getRequiredCapability(actionType: string): NexusCapability | null {
  return ACTION_CAPABILITY_MAP[actionType] ?? null;
}

// =============================================================================
// HIGH-IMPACT ACTION CHECK
// =============================================================================

const HIGH_IMPACT_ACTIONS = new Set([
  'approve', 'deny', 'generate_packet', 'post_room',
  'add_to_board', 'remove_from_board', 'change_pipeline_stage',
  'update_scholarship', 'adjust_budget', 'send_dm',
]);

export function isHighImpactAction(actionType: string): boolean {
  return HIGH_IMPACT_ACTIONS.has(actionType);
}

export function requiresAuditNote(actionType: string): boolean {
  return actionType === 'approve' || actionType === 'deny';
}

// =============================================================================
// ROLE MAPPING (bridge from existing app roles)
// =============================================================================

export function mapRoleToRBAC(role: string, mode: Mode): RBACLevel {
  // Sports mode
  if (mode === 'sports') {
    switch (role) {
      case 'admin':
      case 'head_coach':
      case 'gm': return 'R1';
      case 'assistant_coach': return 'R4';
      case 'scout': return 'R4';
      case 'student_athlete': return 'R6';
      case 'fan': return 'R9';
      case 'donor': return 'R5';
      case 'media': return 'R4';
      case 'agent': return 'R5';
      default: return 'R9';
    }
  }
  // Competition mode
  if (mode === 'competition') {
    switch (role) {
      case 'league_admin': return 'R1';
      case 'team_owner': return 'R2';
      case 'driver': return 'R6';
      default: return 'R9';
    }
  }
  // Church mode
  if (mode === 'church') {
    switch (role) {
      case 'leadership': return 'R1';
      case 'staff': return 'R3';
      case 'member': return 'R7';
      default: return 'R9';
    }
  }
  // Business mode
  if (mode === 'business') {
    switch (role) {
      case 'founder': return 'R1';
      case 'investor': return 'R5';
      case 'viewer': return 'R9';
      default: return 'R9';
    }
  }
  // Education mode
  if (mode === 'education') {
    switch (role) {
      case 'faculty': return 'R2';
      case 'student': return 'R7';
      default: return 'R9';
    }
  }
  return 'R9';
}
```


---


# Section C — State Management (Contexts)

## App Context (`context/app-context.tsx`)

```typescript
/**
 * KaNeXT OS Global App Context
 * Single source of truth for mode, organization, role, cycle, and auth state.
 * Includes AsyncStorage persistence for state across app restarts.
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppContextState, Mode, Role, Organization, Cycle, Program, ActiveContext, RecentContext, ActiveView, ActiveViewKey } from '@/types';
import {
  DEFAULT_ACTIVE_CONTEXT,
  SEEDED_RECENT_CONTEXTS,
  getOrgById,
  getProgramById,
  getSeasonById,
  getDefaultContextForMode,
} from '@/data/mock-memberships';
import { deriveRoleBadge } from '@/utils/role-badge';
import { buildActiveView, getActiveViewKey } from '@/utils/active-view';
import { notifyViewSwitch } from '@/utils/view-switch-lifecycle';

// Storage keys
const STORAGE_KEYS = {
  lastMode: 'kx:lastMode',
  hasCompletedModePick: 'kx:hasCompletedModePick',
  auth: 'kx:auth',
  sportsOrganization: 'kx:sportsOrganization',
  sportsProgram: 'kx:sportsProgram',
  sportsSeason: 'kx:sportsSeason',
  activeContext: 'kx:activeContext',
  recentContexts: 'kx:recentContexts',
  activeView: 'kx:activeView',
};

// Auth state type
type AuthState = 'viewer' | 'owner';

// Landing tab for navigation control
type LandingTab = 'home' | 'nexus' | null;

// Extended state with auth, landing control, V2 context, and ActiveView
interface ExtendedAppState extends AppContextState {
  authState: AuthState;
  pendingLandingTab: LandingTab;
  activeContext: ActiveContext;
  recentContexts: RecentContext[];
  activeView: ActiveView | null;
  activeViewKey: ActiveViewKey;
}

// =============================================================================
// DEMO DATA
// =============================================================================

const DEMO_ORGANIZATIONS: Record<Mode, Organization> = {
  sports: {
    id: 'fmu-basketball',
    name: 'Florida Memorial University',
    mode: 'sports',
    type: 'college_basketball',
    location: 'Miami Gardens, FL',
    description: 'Florida Memorial University Lions Men\'s Basketball',
  },
  church: {
    id: 'icc',
    name: 'International Christian Center',
    mode: 'church',
    type: 'church',
    location: 'Los Angeles, CA',
    description: 'Inter-denominational, Pentecostal',
  },
  education: {
    id: 'sdcc',
    name: 'San Diego Christian College',
    mode: 'education',
    type: 'college',
    location: 'San Diego County, CA',
    description: 'Private Christian Liberal Arts College',
  },
  business: {
    id: 'kanext-biz',
    name: 'KaNeXT',
    mode: 'business',
    type: 'platform',
    location: 'Tennessee',
    description: 'KaNeXT Institutional OS Platform',
  },
  competition: {
    id: 'k1-league',
    name: 'K-1 Hypercar Championship',
    mode: 'competition',
    type: 'motorsport_league',
    location: 'Global',
    description: 'K-1 Hypercar Championship',
  },
};

const DEMO_CYCLES: Record<Mode, Cycle> = {
  sports: {
    id: '2025-26',
    name: '2025-26',
    startDate: new Date('2025-10-01'),
    endDate: new Date('2026-04-01'),
    isCurrent: true,
  },
  church: {
    id: '2025',
    name: '2025',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    isCurrent: true,
  },
  education: {
    id: '2025-26-academic',
    name: '2025-2026 Academic Year',
    startDate: new Date('2025-08-25'),
    endDate: new Date('2026-05-15'),
    isCurrent: true,
  },
  business: {
    id: 'fy2026',
    name: 'FY 2026',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    isCurrent: true,
  },
  competition: {
    id: 'k1-s1-2026',
    name: 'Season 1 · 2026',
    startDate: new Date('2026-03-01'),
    endDate: new Date('2026-11-30'),
    isCurrent: true,
  },
};

const DEMO_ROLES: Record<Mode, Role> = {
  sports: 'head_coach',
  church: 'member',
  education: 'faculty',
  business: 'founder',
  competition: 'league_admin',
};

const DEMO_PROGRAM: Program = {
  id: 'varsity',
  name: 'Varsity',
  level: 'varsity',
};

// Programs for sports mode
const SPORTS_PROGRAMS: Record<string, Program> = {
  'Varsity': { id: 'varsity', name: 'Varsity', level: 'varsity' },
  'Development I': { id: 'dev-1', name: 'Development I', level: 'development_1' },
  'Development II': { id: 'dev-2', name: 'Development II', level: 'development_2' },
  'Postgrad': { id: 'postgrad', name: 'Postgrad', level: 'postgrad' },
};

// Seasons for sports mode
const SPORTS_SEASONS: Record<string, Cycle> = {
  '2025-26': { id: '2025-26', name: '2025-26', startDate: new Date('2025-10-01'), endDate: new Date('2026-04-01'), isCurrent: true },
  '2024-25': { id: '2024-25', name: '2024-25', startDate: new Date('2024-10-01'), endDate: new Date('2025-04-01'), isCurrent: false },
  '2023-24': { id: '2023-24', name: '2023-24', startDate: new Date('2023-10-01'), endDate: new Date('2024-04-01'), isCurrent: false },
};

// Organizations for sports mode (static for now)
const SPORTS_ORGANIZATIONS: Record<string, Organization> = {
  'Florida Memorial University': {
    id: 'fmu-basketball',
    name: 'Florida Memorial University',
    mode: 'sports',
    type: 'college_basketball',
    location: 'Miami Gardens, FL',
    description: 'Florida Memorial University Lions Men\'s Basketball',
  },
  'Middlebrooks Academy': {
    id: 'middlebrooks-academy',
    name: 'Middlebrooks Academy',
    mode: 'sports',
    type: 'prep_school',
    location: 'Atlanta, GA',
    description: 'Elite Prep Basketball Program',
  },
  'Cathedral HS': {
    id: 'cathedral-hs',
    name: 'Cathedral HS',
    mode: 'sports',
    type: 'high_school',
    location: 'Indianapolis, IN',
    description: 'Cathedral High School Basketball',
  },
};

// Export for use in avatar drawer
export { SPORTS_ORGANIZATIONS, SPORTS_PROGRAMS, SPORTS_SEASONS };

// =============================================================================
// DEFAULT STATE
// =============================================================================

const defaultState: ExtendedAppState = {
  mode: 'sports',
  organization: DEMO_ORGANIZATIONS.sports,
  operatingRole: DEMO_ROLES.sports,
  cycle: DEMO_CYCLES.sports,
  program: DEMO_PROGRAM,
  isFirstRun: true,
  isLoading: true,
  authState: 'viewer',
  pendingLandingTab: null,
  activeContext: DEFAULT_ACTIVE_CONTEXT,
  recentContexts: SEEDED_RECENT_CONTEXTS,
  activeView: null,
  activeViewKey: '',
};

// =============================================================================
// ACTIONS
// =============================================================================

type AppAction =
  | { type: 'SET_MODE'; payload: Mode }
  | { type: 'SWITCH_MODE'; payload: Mode }
  | { type: 'SET_ORGANIZATION'; payload: Organization | null }
  | { type: 'SET_ROLE'; payload: Role }
  | { type: 'SET_CYCLE'; payload: Cycle | null }
  | { type: 'SET_PROGRAM'; payload: Program | null }
  | { type: 'SET_FIRST_RUN'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTH_STATE'; payload: AuthState }
  | { type: 'SET_PENDING_LANDING_TAB'; payload: LandingTab }
  | { type: 'INITIALIZE'; payload: Partial<ExtendedAppState> }
  | { type: 'RESTORE_STATE'; payload: { mode: Mode; authState: AuthState; organization?: string; program?: string; season?: string } }
  | { type: 'SWITCH_CONTEXT'; payload: ActiveContext }
  | { type: 'SET_ACTIVE_VIEW'; payload: ActiveView };

function appReducer(state: ExtendedAppState, action: AppAction): ExtendedAppState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SWITCH_MODE': {
      const newMode = action.payload;
      return {
        ...state,
        mode: newMode,
        organization: DEMO_ORGANIZATIONS[newMode],
        operatingRole: DEMO_ROLES[newMode],
        cycle: DEMO_CYCLES[newMode],
        program: newMode === 'sports' ? DEMO_PROGRAM : null,
      };
    }
    case 'SET_ORGANIZATION':
      return { ...state, organization: action.payload };
    case 'SET_ROLE':
      return { ...state, operatingRole: action.payload };
    case 'SET_CYCLE':
      return { ...state, cycle: action.payload };
    case 'SET_PROGRAM':
      return { ...state, program: action.payload };
    case 'SET_FIRST_RUN':
      return { ...state, isFirstRun: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_AUTH_STATE':
      return { ...state, authState: action.payload };
    case 'SET_PENDING_LANDING_TAB':
      return { ...state, pendingLandingTab: action.payload };
    case 'INITIALIZE':
      return { ...state, ...action.payload, isLoading: false };
    case 'RESTORE_STATE': {
      const { mode, authState, organization, program, season } = action.payload;
      const resolvedOrganization = mode === 'sports' && organization && SPORTS_ORGANIZATIONS[organization]
        ? SPORTS_ORGANIZATIONS[organization]
        : DEMO_ORGANIZATIONS[mode];
      const resolvedProgram = program && SPORTS_PROGRAMS[program] ? SPORTS_PROGRAMS[program] : DEMO_PROGRAM;
      const resolvedSeason = season && SPORTS_SEASONS[season] ? SPORTS_SEASONS[season] : DEMO_CYCLES[mode];
      return {
        ...state,
        mode,
        organization: resolvedOrganization,
        operatingRole: DEMO_ROLES[mode],
        cycle: mode === 'sports' ? resolvedSeason : DEMO_CYCLES[mode],
        program: mode === 'sports' ? resolvedProgram : null,
        isFirstRun: false,
        isLoading: false,
        authState,
      };
    }
    case 'SET_ACTIVE_VIEW': {
      const view = action.payload;
      const viewKey = getActiveViewKey(view);

      // Build legacy ActiveContext from the view for V2 backwards compat
      const legacyCtx: ActiveContext = {
        mode: view.mode,
        org_id: view.org_id,
        program_id: view.scope_id,
        season_id: view.season_id,
        membership_id: view.membership_id,
        derived_role_badge: view.derived_role_badge,
      };

      // Resolve legacy Organization shape
      const viewOrg = getOrgById(view.org_id);
      const legacyOrg: Organization | null = viewOrg
        ? { id: viewOrg.org_id, name: viewOrg.org_name, mode: viewOrg.mode, type: viewOrg.org_type ?? '', location: viewOrg.location, description: viewOrg.description }
        : { id: view.org_id, name: view.org_name, mode: view.mode, type: '', location: '', description: '' };

      // Resolve legacy Program shape
      const viewProgram = getProgramById(view.scope_id);
      const legacyProgram: Program | null = viewProgram
        ? { id: viewProgram.program_id, name: viewProgram.program_name, level: 'varsity' }
        : null;

      // Resolve legacy Cycle shape
      const viewSeason = getSeasonById(view.season_id);
      const legacyCycle: Cycle | null = viewSeason
        ? { id: viewSeason.season_id, name: viewSeason.season_name, startDate: new Date(viewSeason.start_date), endDate: new Date(viewSeason.end_date), isCurrent: viewSeason.is_current }
        : DEMO_CYCLES[view.mode] ?? null;

      // Push previous context to recents (dedup by membership_id)
      const prevCtx: RecentContext = { ...state.activeContext, timestamp: Date.now() };
      const dedupedRecents = state.recentContexts.filter(
        (r) => !(r.org_id === prevCtx.org_id && r.membership_id === prevCtx.membership_id),
      );
      const updatedRecents = [prevCtx, ...dedupedRecents].slice(0, 10);

      return {
        ...state,
        activeView: view,
        activeViewKey: viewKey,
        activeContext: legacyCtx,
        recentContexts: updatedRecents,
        mode: view.mode,
        organization: legacyOrg,
        program: legacyProgram,
        cycle: legacyCycle,
        operatingRole: DEMO_ROLES[view.mode] ?? 'head_coach',
        isFirstRun: false,
      };
    }
    case 'SWITCH_CONTEXT': {
      const ctx = action.payload;
      const v2Org = getOrgById(ctx.org_id);
      const v2Program = getProgramById(ctx.program_id);
      const v2Season = getSeasonById(ctx.season_id);

      const legacyOrg: Organization | null = v2Org
        ? { id: v2Org.org_id, name: v2Org.org_name, mode: v2Org.mode, type: v2Org.org_type ?? '', location: v2Org.location, description: v2Org.description }
        : null;

      const legacyProgram: Program | null = v2Program
        ? { id: v2Program.program_id, name: v2Program.program_name, level: 'varsity' }
        : null;

      const legacyCycle: Cycle | null = v2Season
        ? { id: v2Season.season_id, name: v2Season.season_name, startDate: new Date(v2Season.start_date), endDate: new Date(v2Season.end_date), isCurrent: v2Season.is_current }
        : null;

      // Push previous context to recents (dedup by membership+program+season)
      const prev: RecentContext = { ...state.activeContext, timestamp: Date.now() };
      const deduped = state.recentContexts.filter(
        (r) => !(r.org_id === prev.org_id && r.program_id === prev.program_id && r.membership_id === prev.membership_id),
      );
      const newRecents = [prev, ...deduped].slice(0, 10);

      return {
        ...state,
        activeContext: ctx,
        recentContexts: newRecents,
        mode: ctx.mode,
        organization: legacyOrg,
        program: legacyProgram,
        cycle: legacyCycle,
        operatingRole: DEMO_ROLES[ctx.mode] ?? 'head_coach',
      };
    }
    default:
      return state;
  }
}

// =============================================================================
// CONTEXT
// =============================================================================

interface AppContextValue {
  state: ExtendedAppState;
  setMode: (mode: Mode) => void;
  switchMode: (mode: Mode) => void;
  switchContext: (ctx: ActiveContext) => void;
  setActiveView: (view: ActiveView) => void;
  setOrganization: (org: Organization | null) => void;
  setRole: (role: Role) => void;
  setCycle: (cycle: Cycle | null) => void;
  setProgram: (program: Program | null) => void;
  setFirstRun: (isFirstRun: boolean) => void;
  setAuthState: (authState: AuthState) => void;
  setPendingLandingTab: (tab: LandingTab) => void;
  completeFirstModePick: (mode: Mode) => Promise<void>;
  initialize: (initialState: Partial<ExtendedAppState>) => void;
  clearPersistedState: () => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, defaultState);

  // Load persisted state on mount
  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        // Try ActiveView first (new system)
        const savedActiveView = await AsyncStorage.getItem(STORAGE_KEYS.activeView);
        if (savedActiveView) {
          try {
            const parsed = JSON.parse(savedActiveView) as ActiveView;
            if (parsed.view_id && parsed.mode && parsed.org_id) {
              dispatch({ type: 'SET_ACTIVE_VIEW', payload: parsed });
              dispatch({ type: 'SET_LOADING', payload: false });
              // Also restore auth
              const auth = await AsyncStorage.getItem(STORAGE_KEYS.auth);
              if (auth) dispatch({ type: 'SET_AUTH_STATE', payload: (auth as AuthState) || 'viewer' });
              return; // Skip legacy restore
            }
          } catch { /* fall through to legacy */ }
        }

        // Legacy restore path
        const [lastMode, auth, organization, program, season] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.lastMode),
          AsyncStorage.getItem(STORAGE_KEYS.auth),
          AsyncStorage.getItem(STORAGE_KEYS.sportsOrganization),
          AsyncStorage.getItem(STORAGE_KEYS.sportsProgram),
          AsyncStorage.getItem(STORAGE_KEYS.sportsSeason),
        ]);

        if (lastMode) {
          // Migrate old mode names
          const resolvedMode = lastMode === 'community' ? 'competition' : lastMode;
          // Mode exists - skip first run
          dispatch({
            type: 'RESTORE_STATE',
            payload: {
              mode: resolvedMode as Mode,
              authState: (auth as AuthState) || 'viewer',
              organization: organization || undefined,
              program: program || undefined,
              season: season || undefined,
            },
          });
        } else {
          // No saved mode - first run
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Failed to load persisted state:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    loadPersistedState();
  }, []);

  // Persist mode when it changes
  useEffect(() => {
    if (state.isLoading || state.isFirstRun) return;
    AsyncStorage.setItem(STORAGE_KEYS.lastMode, state.mode).catch(console.error);
  }, [state.mode, state.isLoading, state.isFirstRun]);

  // Persist auth state when it changes
  useEffect(() => {
    if (state.isLoading) return;
    AsyncStorage.setItem(STORAGE_KEYS.auth, state.authState).catch(console.error);
  }, [state.authState, state.isLoading]);

  // Persist V2 recent contexts
  useEffect(() => {
    if (state.isLoading) return;
    AsyncStorage.setItem(STORAGE_KEYS.recentContexts, JSON.stringify(state.recentContexts)).catch(console.error);
  }, [state.recentContexts, state.isLoading]);

  // Persist sports organization/program/season when they change
  useEffect(() => {
    if (state.isLoading || state.mode !== 'sports') return;
    if (state.organization?.name) {
      AsyncStorage.setItem(STORAGE_KEYS.sportsOrganization, state.organization.name).catch(console.error);
    }
    if (state.program?.name) {
      AsyncStorage.setItem(STORAGE_KEYS.sportsProgram, state.program.name).catch(console.error);
    }
    if (state.cycle?.name) {
      AsyncStorage.setItem(STORAGE_KEYS.sportsSeason, state.cycle.name).catch(console.error);
    }
  }, [state.organization, state.program, state.cycle, state.mode, state.isLoading]);

  const setMode = useCallback((mode: Mode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);

  const switchMode = useCallback((mode: Mode) => {
    // Try V2 context switch first, fall back to legacy
    const defaultCtx = getDefaultContextForMode(mode);
    if (defaultCtx) {
      const badge = deriveRoleBadge(defaultCtx.membership_id, defaultCtx.program_id);
      dispatch({ type: 'SWITCH_CONTEXT', payload: { ...defaultCtx, derived_role_badge: badge } });
    } else {
      dispatch({ type: 'SWITCH_MODE', payload: mode });
    }
  }, []);

  const switchContext = useCallback((ctx: ActiveContext) => {
    const badge = deriveRoleBadge(ctx.membership_id, ctx.program_id);
    dispatch({ type: 'SWITCH_CONTEXT', payload: { ...ctx, derived_role_badge: badge } });
    // Persist
    AsyncStorage.setItem(STORAGE_KEYS.activeContext, JSON.stringify({ ...ctx, derived_role_badge: badge })).catch(console.error);
  }, []);

  const setActiveView = useCallback((view: ActiveView) => {
    const newKey = getActiveViewKey(view);
    const prevKey = state.activeViewKey;
    // Dedup — no-op if same view tapped again
    if (newKey === prevKey && prevKey !== '') return;
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
    // Persist
    AsyncStorage.setItem(STORAGE_KEYS.activeView, JSON.stringify(view)).catch(console.error);
    AsyncStorage.setItem(STORAGE_KEYS.lastMode, view.mode).catch(console.error);
    // Notify lifecycle listeners
    notifyViewSwitch(view, prevKey);
  }, [state.activeViewKey]);

  const setOrganization = useCallback((org: Organization | null) => {
    dispatch({ type: 'SET_ORGANIZATION', payload: org });
  }, []);

  const setRole = useCallback((role: Role) => {
    dispatch({ type: 'SET_ROLE', payload: role });
  }, []);

  const setCycle = useCallback((cycle: Cycle | null) => {
    dispatch({ type: 'SET_CYCLE', payload: cycle });
  }, []);

  const setProgram = useCallback((program: Program | null) => {
    dispatch({ type: 'SET_PROGRAM', payload: program });
  }, []);

  const setFirstRun = useCallback((isFirstRun: boolean) => {
    dispatch({ type: 'SET_FIRST_RUN', payload: isFirstRun });
  }, []);

  const setAuthState = useCallback((authState: AuthState) => {
    dispatch({ type: 'SET_AUTH_STATE', payload: authState });
  }, []);

  const setPendingLandingTab = useCallback((tab: LandingTab) => {
    dispatch({ type: 'SET_PENDING_LANDING_TAB', payload: tab });
  }, []);

  const completeFirstModePick = useCallback(async (mode: Mode) => {
    // Rule A: First-time mode selection
    // 1) Save lastMode
    // 2) Save hasCompletedModePick = "true"
    // 3) Set pending landing to HOME
    dispatch({ type: 'SWITCH_MODE', payload: mode });
    dispatch({ type: 'SET_PENDING_LANDING_TAB', payload: 'home' });
    dispatch({ type: 'SET_FIRST_RUN', payload: false });

    await AsyncStorage.setItem(STORAGE_KEYS.lastMode, mode);
    await AsyncStorage.setItem(STORAGE_KEYS.hasCompletedModePick, 'true');
  }, []);

  const initialize = useCallback((initialState: Partial<ExtendedAppState>) => {
    dispatch({ type: 'INITIALIZE', payload: initialState });
  }, []);

  const clearPersistedState = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.lastMode,
        STORAGE_KEYS.hasCompletedModePick,
        STORAGE_KEYS.auth,
        STORAGE_KEYS.sportsOrganization,
        STORAGE_KEYS.sportsProgram,
        STORAGE_KEYS.sportsSeason,
        STORAGE_KEYS.activeView,
      ]);
    } catch (error) {
      console.error('Failed to clear persisted state:', error);
    }
  }, []);

  const logout = useCallback(async () => {
    // Only clear auth state, NOT mode
    dispatch({ type: 'SET_AUTH_STATE', payload: 'viewer' });
    await AsyncStorage.setItem(STORAGE_KEYS.auth, 'viewer');
  }, []);

  const value: AppContextValue = {
    state,
    setMode,
    switchMode,
    switchContext,
    setActiveView,
    setOrganization,
    setRole,
    setCycle,
    setProgram,
    setFirstRun,
    setAuthState,
    setPendingLandingTab,
    completeFirstModePick,
    initialize,
    clearPersistedState,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// =============================================================================
// HOOK
// =============================================================================

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Convenience hooks
export function useMode(): Mode {
  const { state } = useAppContext();
  return state.mode;
}

export function useOrganization(): Organization | null {
  const { state } = useAppContext();
  return state.organization;
}

export function useOperatingRole(): Role {
  const { state } = useAppContext();
  return state.operatingRole;
}

export function useProgram(): Program | null {
  const { state } = useAppContext();
  return state.program;
}

export function useAuthState(): AuthState {
  const { state } = useAppContext();
  return state.authState;
}

export function useActiveView(): ActiveView | null {
  const { state } = useAppContext();
  return state.activeView;
}

export function useActiveViewKey(): ActiveViewKey {
  const { state } = useAppContext();
  return state.activeViewKey;
}

export function useMembershipId(): string {
  const { state } = useAppContext();
  return state.activeView?.membership_id ?? state.activeContext.membership_id;
}

export function useOrgId(): string {
  const { state } = useAppContext();
  return state.activeView?.org_id ?? state.activeContext.org_id;
}
```

## Business Context (`context/business-context.tsx`)

```typescript
/**
 * Business Context — Business Mode state
 * Company switcher + 5-level RBAC via BusinessRoleLens.
 * Entity scoping: selectedEntityId scopes all 10 Organization tabs.
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { COMPANIES } from '@/data/mock-business-investor-v2';
import type { Company } from '@/types';
import type { BusinessRoleLens } from '@/utils/business-rbac';
import { KANEXT_HOLDCO, SEEDED_ENTITY_NAMES, SEEDED_ENTITY_TYPES, type BizEntityType } from '@/data/biz-org-shared-types';

export interface SelectedEntity {
  id: string;
  name: string;
  type: BizEntityType;
}

interface BusinessContextValue {
  companies: Company[];
  activeCompanyId: string;
  activeCompany: Company;
  setActiveCompany: (id: string) => void;
  /** 8-level RBAC: B1 (Founder) | B2a (Retail) | B2b (Board) | B3 (Public) | B4 | B5 | B8 (Advisor) | B13 (HoldCo) */
  viewAsRole: BusinessRoleLens;
  setViewAsRole: (role: BusinessRoleLens) => void;
  /** Entity scoping — scopes all 10 Org tabs */
  selectedEntityId: string;
  selectedEntity: SelectedEntity;
  setSelectedEntity: (id: string) => void;
  pinnedEntityIds: string[];
  setPinnedEntityIds: (ids: string[]) => void;
  recentEntityIds: string[];
}

const BusinessContext = createContext<BusinessContextValue | null>(null);

const DEFAULT_PINNED = [KANEXT_HOLDCO, 'ent-kanext-opsco'];
const MAX_RECENT = 5;

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [activeCompanyId, setActiveCompanyId] = useState('co-kanext');
  const [viewAsRole, setViewAsRoleState] = useState<BusinessRoleLens>('B1');
  const [selectedEntityId, setSelectedEntityIdRaw] = useState(KANEXT_HOLDCO);
  const [pinnedEntityIds, setPinnedEntityIds] = useState<string[]>(DEFAULT_PINNED);
  const [recentEntityIds, setRecentEntityIds] = useState<string[]>([KANEXT_HOLDCO]);

  const handleSetActive = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCompanyId(id);
  }, []);

  const handleSetViewAs = useCallback((role: BusinessRoleLens) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewAsRoleState(role);
  }, []);

  const handleSetSelectedEntity = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedEntityIdRaw(id);
    setRecentEntityIds((prev) => {
      const next = [id, ...prev.filter((r) => r !== id)].slice(0, MAX_RECENT);
      return next;
    });
  }, []);

  const activeCompany = COMPANIES.find((c) => c.id === activeCompanyId) || COMPANIES[1];

  const selectedEntity: SelectedEntity = useMemo(() => ({
    id: selectedEntityId,
    name: SEEDED_ENTITY_NAMES[selectedEntityId] ?? 'Unknown Entity',
    type: SEEDED_ENTITY_TYPES[selectedEntityId] ?? 'internal',
  }), [selectedEntityId]);

  return (
    <BusinessContext.Provider
      value={{
        companies: COMPANIES,
        activeCompanyId,
        activeCompany,
        setActiveCompany: handleSetActive,
        viewAsRole,
        setViewAsRole: handleSetViewAs,
        selectedEntityId,
        selectedEntity,
        setSelectedEntity: handleSetSelectedEntity,
        pinnedEntityIds,
        setPinnedEntityIds,
        recentEntityIds,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness(): BusinessContextValue {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error('useBusiness must be used within BusinessProvider');
  return ctx;
}
```

## Nexus Context (`context/nexus-context.tsx`)

```typescript
/**
 * KaNeXT OS Nexus Context
 * State management for the Nexus conversation interface.
 */

import React, { createContext, useContext, useReducer, useCallback, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  NexusState,
  NexusPanelState,
  TargetContext,
  Conversation,
  Message,
  SimulationResult,
  SavedSimulation,
  Mode,
  ConversationType,
  PlayerEvalConfig,
  SimulationThreadConfig,
  EvalSnapshot,
  GameOpsConfig,
} from '@/types';
import type { ActionIntent, MessageV2, NexusContext as NexusContextScope } from '@/types/nexus-v2';
import { MOCK_CONVERSATIONS, getMessagesForConversation } from '@/data/mock-nexus';
import { detectSimulationIntent, generateMockSimulation } from '@/data/mock-simulations';
import { sendToGPT, type ChatMessage } from '@/utils/openai';
import { processPlayerQuery } from '@/utils/nexus-player-query';
import { classifyIntent } from '@/utils/nexus-actions';
import { processAction, executeConfirmedAction } from '@/utils/nexus-action-engine';
import { mapRoleToRBAC } from '@/utils/nexus-rbac';
import { parseGPTResponse } from '@/utils/nexus-response-parser';
import { useMode, useAppContext, useActiveView } from './app-context';

const MAX_PINNED_CONVERSATIONS = 3;

// =============================================================================
// DEFAULT STATE
// =============================================================================

const defaultState: NexusState = {
  activeConversationId: null,
  conversations: MOCK_CONVERSATIONS,
  messages: [],
  panelState: 'closed',
  inputText: '',
  isLoading: false,
  activeSimulationId: null,
  simulations: {},
  savedSimulations: {},
  newConversationSheetOpen: false,
  evalSnapshots: {},
  targetContext: { organizationId: '' },
  pendingAction: undefined,
  pendingActionConversationId: undefined,
};

// =============================================================================
// ACTIONS
// =============================================================================

type NexusAction =
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: string | null }
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_PANEL_STATE'; payload: NexusPanelState }
  | { type: 'SET_INPUT_TEXT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SELECT_CONVERSATION'; payload: string }
  | { type: 'NEW_CONVERSATION'; payload: Conversation }
  | { type: 'ADD_SIMULATION'; payload: SimulationResult }
  | { type: 'SET_ACTIVE_SIMULATION'; payload: string | null }
  | { type: 'OPEN_SIMULATION'; payload: string }
  | { type: 'SAVE_SIMULATION'; payload: SavedSimulation }
  | { type: 'OPEN_NEW_CONVERSATION_SHEET' }
  | { type: 'CLOSE_NEW_CONVERSATION_SHEET' }
  | { type: 'UPDATE_CONVERSATION_CONFIG'; payload: { id: string; evalConfig?: PlayerEvalConfig; simConfig?: SimulationThreadConfig; gameOpsConfig?: GameOpsConfig } }
  | { type: 'PIN_CONVERSATION'; payload: string }
  | { type: 'UNPIN_CONVERSATION'; payload: string }
  | { type: 'ADD_EVAL_SNAPSHOT'; payload: EvalSnapshot }
  | { type: 'RENAME_CONVERSATION'; payload: { id: string; title: string } }
  | { type: 'ARCHIVE_CONVERSATION'; payload: string }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'SET_TARGET_CONTEXT'; payload: TargetContext | 'all' }
  | { type: 'ADD_V2_MESSAGES'; payload: (Message | MessageV2)[] }
  | { type: 'SET_PENDING_ACTION'; payload: { intent: ActionIntent; conversationId: string } }
  | { type: 'CLEAR_PENDING_ACTION' }
  | { type: 'UPDATE_CONFIRMATION_STATE'; payload: { messageId: string; state: 'confirmed' | 'cancelled' } };

function nexusReducer(state: NexusState, action: NexusAction): NexusState {
  switch (action.type) {
    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversationId: action.payload };

    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };

    case 'ADD_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
      };

    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };

    case 'ADD_MESSAGE': {
      const newMessage = action.payload;
      // Update the conversation's lastMessage
      const updatedConversations = state.conversations.map((conv) =>
        conv.id === newMessage.conversationId
          ? { ...conv, lastMessage: newMessage, updatedAt: newMessage.timestamp }
          : conv
      );
      return {
        ...state,
        messages: [...state.messages, newMessage],
        conversations: updatedConversations,
      };
    }

    case 'SET_PANEL_STATE':
      return { ...state, panelState: action.payload };

    case 'SET_INPUT_TEXT':
      return { ...state, inputText: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SELECT_CONVERSATION': {
      const conversationId = action.payload;
      const messages = getMessagesForConversation(conversationId);
      return {
        ...state,
        activeConversationId: conversationId,
        messages,
        panelState: 'closed',
      };
    }

    case 'NEW_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
        activeConversationId: action.payload.id,
        messages: [],
        panelState: 'closed',
      };

    case 'ADD_SIMULATION':
      return {
        ...state,
        simulations: {
          ...state.simulations,
          [action.payload.id]: action.payload,
        },
      };

    case 'SET_ACTIVE_SIMULATION':
      return {
        ...state,
        activeSimulationId: action.payload,
      };

    case 'OPEN_SIMULATION':
      return {
        ...state,
        activeSimulationId: action.payload,
        panelState: 'simulation',
      };

    case 'SAVE_SIMULATION':
      return {
        ...state,
        savedSimulations: {
          ...state.savedSimulations,
          [action.payload.id]: action.payload,
        },
      };

    case 'OPEN_NEW_CONVERSATION_SHEET':
      return { ...state, newConversationSheetOpen: true };

    case 'CLOSE_NEW_CONVERSATION_SHEET':
      return { ...state, newConversationSheetOpen: false };

    case 'UPDATE_CONVERSATION_CONFIG': {
      const { id, evalConfig, simConfig, gameOpsConfig } = action.payload;
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === id
            ? {
                ...conv,
                ...(evalConfig !== undefined && { evalConfig }),
                ...(simConfig !== undefined && { simConfig }),
                ...(gameOpsConfig !== undefined && { gameOpsConfig }),
              }
            : conv
        ),
      };
    }

    case 'PIN_CONVERSATION': {
      const pinnedCount = state.conversations.filter((c) => c.isPinned).length;
      if (pinnedCount >= MAX_PINNED_CONVERSATIONS) {
        return state; // Already at max
      }
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.payload ? { ...conv, isPinned: true } : conv
        ),
      };
    }

    case 'UNPIN_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.payload ? { ...conv, isPinned: false } : conv
        ),
      };

    case 'ADD_EVAL_SNAPSHOT':
      return {
        ...state,
        evalSnapshots: {
          ...state.evalSnapshots,
          [action.payload.id]: action.payload,
        },
      };

    case 'RENAME_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.payload.id
            ? { ...conv, title: action.payload.title }
            : conv
        ),
      };

    case 'ARCHIVE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter((conv) => conv.id !== action.payload),
        activeConversationId:
          state.activeConversationId === action.payload ? null : state.activeConversationId,
        messages: state.activeConversationId === action.payload ? [] : state.messages,
      };

    case 'DELETE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter((conv) => conv.id !== action.payload),
        activeConversationId:
          state.activeConversationId === action.payload ? null : state.activeConversationId,
        messages: state.activeConversationId === action.payload ? [] : state.messages,
      };

    case 'SET_TARGET_CONTEXT':
      return { ...state, targetContext: action.payload };

    case 'ADD_V2_MESSAGES': {
      const newMsgs = action.payload;
      // Update conversations' lastMessage for each message
      let convs = [...state.conversations];
      for (const msg of newMsgs) {
        convs = convs.map((conv) =>
          conv.id === msg.conversationId
            ? { ...conv, lastMessage: msg as Message, updatedAt: msg.timestamp }
            : conv
        );
      }
      return {
        ...state,
        messages: [...state.messages, ...(newMsgs as Message[])],
        conversations: convs,
      };
    }

    case 'SET_PENDING_ACTION':
      return {
        ...state,
        pendingAction: action.payload.intent,
        pendingActionConversationId: action.payload.conversationId,
      };

    case 'CLEAR_PENDING_ACTION':
      return {
        ...state,
        pendingAction: undefined,
        pendingActionConversationId: undefined,
      };

    case 'UPDATE_CONFIRMATION_STATE': {
      const { messageId, state: confirmState } = action.payload;
      return {
        ...state,
        messages: state.messages.map((msg) => {
          const v2 = msg as any;
          if (v2.id === messageId && v2.confirmation) {
            return { ...v2, confirmation: { ...v2.confirmation, state: confirmState } };
          }
          return msg;
        }),
      };
    }

    default:
      return state;
  }
}

// =============================================================================
// CONTEXT
// =============================================================================

interface NexusContextValue {
  state: NexusState;
  // Panel controls
  openConversations: () => void;
  openContextDrawer: () => void;
  openRoster: () => void;
  openRecruitingBoard: () => void;
  closePanel: () => void;
  // Conversation controls
  selectConversation: (id: string) => void;
  createNewConversation: () => void;
  // Message controls
  setInputText: (text: string) => void;
  sendMessage: () => void;
  // Simulation controls
  openSimulation: (id: string) => void;
  closeSimulation: () => void;
  getSimulation: (id: string) => SimulationResult | undefined;
  getSavedSimulation: (id: string) => SavedSimulation | undefined;
  saveSimulation: (simulation: SimulationResult, title?: string) => void;
  // New conversation sheet
  openNewConversationSheet: () => void;
  closeNewConversationSheet: () => void;
  createNewEval: () => void;
  createNewSim: () => void;
  // Conversation config
  updateConversationConfig: (id: string, evalConfig?: PlayerEvalConfig, simConfig?: SimulationThreadConfig) => void;
  // Pinning
  pinConversation: (id: string) => void;
  unpinConversation: (id: string) => void;
  // Eval snapshots
  getEvalSnapshot: (id: string) => EvalSnapshot | undefined;
  generatePlayerEval: (playerId: string, playerName: string, role: string) => void;
  // Conversation management
  renameConversation: (id: string, title: string) => void;
  archiveConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  // Context targeting
  setTargetContext: (target: TargetContext | 'all') => void;
  // Direct message injection (for onboarding, system messages)
  addAssistantMessage: (conversationId: string, content: string) => void;
  // Game Ops
  createNewGameOps: (gameId: string, opponent: string) => void;
  updateGameOpsStep: (conversationId: string, updates: Partial<GameOpsConfig>) => void;
  addUserMessage: (conversationId: string, content: string) => void;
  // Governed actions (v2)
  confirmAction: (messageId: string) => void;
  cancelAction: (messageId: string) => void;
  handleEscalationChoice: (messageId: string, action: string) => void;
}

const NexusContext = createContext<NexusContextValue | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

interface NexusProviderProps {
  children: ReactNode;
}

export function NexusProvider({ children }: NexusProviderProps) {
  const [state, dispatch] = useReducer(nexusReducer, defaultState);
  const mode = useMode();
  const { state: appState } = useAppContext();
  const activeView = useActiveView();

  // Sync targetContext from ActiveView whenever it changes
  React.useEffect(() => {
    if (activeView?.org_id) {
      dispatch({ type: 'SET_TARGET_CONTEXT', payload: { organizationId: activeView.org_id } });
    }
  }, [activeView?.org_id]);

  // Panel controls
  const openConversations = useCallback(() => {
    dispatch({ type: 'SET_PANEL_STATE', payload: 'conversations' });
  }, []);

  const openContextDrawer = useCallback(() => {
    dispatch({ type: 'SET_PANEL_STATE', payload: 'context' });
  }, []);

  const openRoster = useCallback(() => {
    dispatch({ type: 'SET_PANEL_STATE', payload: 'roster' });
  }, []);

  const openRecruitingBoard = useCallback(() => {
    dispatch({ type: 'SET_PANEL_STATE', payload: 'recruiting' });
  }, []);

  const closePanel = useCallback(() => {
    dispatch({ type: 'SET_PANEL_STATE', payload: 'closed' });
  }, []);

  // Conversation controls
  const selectConversation = useCallback((id: string) => {
    dispatch({ type: 'SELECT_CONVERSATION', payload: id });
  }, []);

  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Conversation',
      participants: [
        { id: 'user-1', name: 'You', role: 'owner' },
        { id: 'assistant', name: 'Nexus', role: 'member' },
      ],
      updatedAt: new Date(),
      createdAt: new Date(),
      isGroup: false,
      unreadCount: 0,
      type: 'chat',
      mode,
    };
    dispatch({ type: 'NEW_CONVERSATION', payload: newConversation });
  }, [mode]);

  // New conversation sheet
  const openNewConversationSheet = useCallback(() => {
    dispatch({ type: 'OPEN_NEW_CONVERSATION_SHEET' });
  }, []);

  const closeNewConversationSheet = useCallback(() => {
    dispatch({ type: 'CLOSE_NEW_CONVERSATION_SHEET' });
  }, []);

  const createNewEval = useCallback(() => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'Player Evaluation',
      participants: [
        { id: 'user-1', name: 'You', role: 'owner' },
        { id: 'assistant', name: 'Nexus', role: 'member' },
      ],
      updatedAt: new Date(),
      createdAt: new Date(),
      isGroup: false,
      unreadCount: 0,
      type: 'eval',
      evalConfig: {
        playerId: null,
        role: null,
      },
    };
    dispatch({ type: 'NEW_CONVERSATION', payload: newConversation });
    dispatch({ type: 'CLOSE_NEW_CONVERSATION_SHEET' });
  }, []);

  const createNewSim = useCallback(() => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'Game Simulation',
      participants: [
        { id: 'user-1', name: 'You', role: 'owner' },
        { id: 'assistant', name: 'Nexus', role: 'member' },
      ],
      updatedAt: new Date(),
      createdAt: new Date(),
      isGroup: false,
      unreadCount: 0,
      type: 'sim',
      simConfig: {
        scenario: null,
      },
    };
    dispatch({ type: 'NEW_CONVERSATION', payload: newConversation });
    dispatch({ type: 'CLOSE_NEW_CONVERSATION_SHEET' });
  }, []);

  // Conversation config
  const updateConversationConfig = useCallback(
    (id: string, evalConfig?: PlayerEvalConfig, simConfig?: SimulationThreadConfig) => {
      dispatch({ type: 'UPDATE_CONVERSATION_CONFIG', payload: { id, evalConfig, simConfig } });
    },
    []
  );

  // Pinning
  const pinConversation = useCallback((id: string) => {
    dispatch({ type: 'PIN_CONVERSATION', payload: id });
  }, []);

  const unpinConversation = useCallback((id: string) => {
    dispatch({ type: 'UNPIN_CONVERSATION', payload: id });
  }, []);

  const renameConversation = useCallback((id: string, title: string) => {
    dispatch({ type: 'RENAME_CONVERSATION', payload: { id, title } });
  }, []);

  const archiveConversation = useCallback((id: string) => {
    dispatch({ type: 'ARCHIVE_CONVERSATION', payload: id });
  }, []);

  const deleteConversation = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CONVERSATION', payload: id });
  }, []);

  const setTargetContext = useCallback((target: TargetContext | 'all') => {
    dispatch({ type: 'SET_TARGET_CONTEXT', payload: target });
  }, []);

  const addAssistantMessage = useCallback((conversationId: string, content: string) => {
    const message: Message = {
      id: `msg-${Date.now()}-injected`,
      conversationId,
      role: 'assistant',
      content,
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  }, []);

  // Game Ops
  const createNewGameOps = useCallback(async (gameId: string, opponent: string) => {
    const convId = `conv-${Date.now()}`;
    const defaultConfig: GameOpsConfig = {
      gameId,
      opponent,
      step: 'gathering',
      periodFormat: 'halves',
      periodLength: 1200,
      starters: [],
    };

    const newConversation: Conversation = {
      id: convId,
      title: `Game Ops: vs ${opponent}`,
      participants: [
        { id: 'user-1', name: 'You', role: 'owner' },
        { id: 'assistant', name: 'Nexus', role: 'member' },
      ],
      updatedAt: new Date(),
      createdAt: new Date(),
      isGroup: false,
      unreadCount: 0,
      type: 'game-ops',
      gameOpsConfig: defaultConfig,
    };

    dispatch({ type: 'NEW_CONVERSATION', payload: newConversation });
    addAssistantMessage(
      convId,
      `Game Ops vs ${opponent} — let me know the game info.\n\nI need: halves or quarters, period length, timeouts, starters. Or just tell me the league and I'll fill in the defaults.`
    );
  }, [addAssistantMessage]);

  const updateGameOpsStep = useCallback((conversationId: string, updates: Partial<GameOpsConfig>) => {
    const conv = state.conversations.find(c => c.id === conversationId);
    if (!conv?.gameOpsConfig) return;
    dispatch({
      type: 'UPDATE_CONVERSATION_CONFIG',
      payload: {
        id: conversationId,
        gameOpsConfig: { ...conv.gameOpsConfig, ...updates },
      },
    });
  }, [state.conversations]);

  const addUserMessage = useCallback((conversationId: string, content: string) => {
    const message: Message = {
      id: `msg-${Date.now()}-user`,
      conversationId,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  }, []);

  // Eval snapshots
  const getEvalSnapshot = useCallback(
    (id: string): EvalSnapshot | undefined => {
      return state.evalSnapshots[id];
    },
    [state.evalSnapshots]
  );

  const generatePlayerEval = useCallback(
    (playerId: string, playerName: string, role: string) => {
      if (!state.activeConversationId) return;

      // Generate mock eval snapshot
      const evalSnapshot: EvalSnapshot = {
        id: `eval-${Date.now()}`,
        generatedAt: new Date(),
        playerName,
        summary: `${playerName} demonstrates solid fundamentals and consistent effort. As a ${role.toLowerCase()}, they contribute valuable minutes with reliable production.`,
        strengths: [
          'Strong defensive positioning',
          'Consistent three-point shooting',
          'Excellent court vision',
          'High basketball IQ',
        ],
        areasForGrowth: [
          'Needs to improve free throw percentage',
          'Can be more aggressive on drives',
          'Work on finishing through contact',
        ],
        projectedImpact: Math.floor(Math.random() * 30) + 60, // 60-90
      };

      dispatch({ type: 'ADD_EVAL_SNAPSHOT', payload: evalSnapshot });

      // Create assistant message with eval
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-eval`,
        conversationId: state.activeConversationId,
        role: 'assistant',
        content: `Here's my evaluation for ${playerName}:`,
        timestamp: new Date(),
        metadata: {
          isEval: true,
          evalSnapshotId: evalSnapshot.id,
        },
      };
      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
    },
    [state.activeConversationId]
  );

  // Message controls
  const setInputText = useCallback((text: string) => {
    dispatch({ type: 'SET_INPUT_TEXT', payload: text });
  }, []);

  // Track conversation history for GPT context
  const conversationHistoryRef = useRef<Map<string, ChatMessage[]>>(new Map());

  // Build NexusContext scope from app state
  const buildNexusScope = useCallback((): NexusContextScope => ({
    mode,
    org_id: appState.organization?.id || 'org-default',
    org_name: appState.organization?.name || 'Organization',
    scope_type: appState.program ? 'program' : 'org',
    scope_id: appState.program?.id,
    scope_name: appState.program?.name,
    season_id: appState.cycle?.id,
    season_label: appState.cycle?.name,
  }), [mode, appState]);

  const sendMessage = useCallback(async () => {
    if (!state.inputText.trim() || !state.activeConversationId) return;

    const conversationId = state.activeConversationId;
    const inputText = state.inputText.trim();

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_INPUT_TEXT', payload: '' });

    // Auto-name conversation based on first message
    const conversation = state.conversations.find((c) => c.id === conversationId);
    if (conversation && conversation.title === 'New Conversation') {
      const autoTitle = generateConversationTitle(inputText);
      dispatch({ type: 'RENAME_CONVERSATION', payload: { id: conversationId, title: autoTitle } });
    }

    // ── Governed Action Intercept (v2) ──
    // Classify intent locally before GPT. If it's a governed action, handle instantly.
    const intent = classifyIntent(inputText);

    // Handle pin/unpin directly in context
    if (intent.type === 'pin_conversation') {
      pinConversation(conversationId);
      const msg: Message = {
        id: `msg-${Date.now()}-pin`,
        conversationId,
        role: 'assistant',
        content: 'Conversation pinned.',
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: msg });
      return;
    }
    if (intent.type === 'unpin_conversation') {
      unpinConversation(conversationId);
      const msg: Message = {
        id: `msg-${Date.now()}-unpin`,
        conversationId,
        role: 'assistant',
        content: 'Conversation unpinned.',
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: msg });
      return;
    }

    if (intent.type !== 'none') {
      const rbacLevel = mapRoleToRBAC(appState.operatingRole || 'head_coach', mode);
      const nexusScope = buildNexusScope();
      const result = processAction(intent, nexusScope, rbacLevel, conversationId);

      if (result.handled) {
        dispatch({ type: 'ADD_V2_MESSAGES', payload: result.messages });
        if (result.needsConfirmation && result.pendingAction) {
          dispatch({
            type: 'SET_PENDING_ACTION',
            payload: { intent: result.pendingAction, conversationId },
          });
        }
        return; // Don't send to GPT — action handled locally
      }
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    // Check for simulation intent (sports mode, still uses mock sim engine)
    const simIntent = mode === 'sports' ? detectSimulationIntent(userMessage.content) : { isSimulation: false, opponent: '' };

    if (simIntent.isSimulation) {
      const simulation = generateMockSimulation(
        'FMU Lions',
        simIntent.opponent || 'Opponent'
      );
      dispatch({ type: 'ADD_SIMULATION', payload: simulation });

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        conversationId,
        role: 'assistant',
        content: `Here's my simulation analysis for the matchup against ${simIntent.opponent || 'the opponent'}:`,
        timestamp: new Date(),
        metadata: {
          isSimulation: true,
          simulationId: simulation.id,
        },
      };
      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    // Build conversation history for GPT
    const history = conversationHistoryRef.current.get(conversationId) ?? [];
    history.push({ role: 'user', content: inputText });

    // Keep last 20 messages for context window
    const trimmedHistory = history.slice(-20);
    conversationHistoryRef.current.set(conversationId, trimmedHistory);

    try {
      // Pre-process player queries in sports mode
      const playerQuery = mode === 'sports' ? processPlayerQuery(inputText) : null;

      const isGameOpsConv = conversation?.type === 'game-ops';
      const responseText = await sendToGPT({
        messages: trimmedHistory,
        context: {
          mode,
          organization: appState.organization,
          operatingRole: appState.operatingRole,
          program: appState.program,
          cycleName: appState.cycle?.name ?? null,
          isGameOps: isGameOpsConv,
          gameOpsOpponent: isGameOpsConv ? conversation?.gameOpsConfig?.opponent : undefined,
        },
        playerDataContext: playerQuery?.isPlayerQuery ? playerQuery.contextBlock : undefined,
      });

      // Add assistant response to history
      trimmedHistory.push({ role: 'assistant', content: responseText });
      conversationHistoryRef.current.set(conversationId, trimmedHistory);

      // Parse for link chips ([LINK:type:id:label] tokens)
      const parsed = parseGPTResponse(responseText);
      if (parsed.linkChips.length > 0) {
        // Create a v2 message with link chips
        const v2Message: MessageV2 = {
          id: `msg-${Date.now()}-assistant`,
          conversationId,
          role: 'assistant',
          content: parsed.cleanText,
          timestamp: new Date(),
          messageType: 'text',
          linkChips: parsed.linkChips,
        };
        dispatch({ type: 'ADD_V2_MESSAGES', payload: [v2Message] });
      } else {
        const assistantMessage: Message = {
          id: `msg-${Date.now()}-assistant`,
          conversationId,
          role: 'assistant',
          content: responseText,
          timestamp: new Date(),
        };
        dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
      }

      // Post-process: if player data was injected, append inline player cards
      if (playerQuery?.isPlayerQuery && playerQuery.matchedPlayers && playerQuery.matchedPlayers.length > 0) {
        const playerCards: MessageV2[] = playerQuery.matchedPlayers.slice(0, 3).map((p: any, idx: number) => ({
          id: `msg-${Date.now()}-pcard-${idx}`,
          conversationId,
          role: 'assistant' as const,
          content: '',
          timestamp: new Date(),
          messageType: 'player_card' as const,
          playerCard: {
            playerId: p.id || p.player_id || `p-${idx}`,
            name: p.name || p.player_name || 'Unknown',
            position: p.position || '',
            team: p.team || p.school || '',
            kr: p.kr ?? p.overall_kr,
            levelKey: p.level_key || p.levelKey,
            archetype: p.archetype,
          },
        }));
        if (playerCards.length > 0) {
          dispatch({ type: 'ADD_V2_MESSAGES', payload: playerCards });
        }
      }
    } catch (error) {
      console.error('Failed to get GPT response:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        conversationId,
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
    }

    dispatch({ type: 'SET_LOADING', payload: false });
  }, [state.inputText, state.activeConversationId, state.conversations, mode, appState, buildNexusScope]);

  // Simulation controls
  const openSimulation = useCallback((id: string) => {
    dispatch({ type: 'OPEN_SIMULATION', payload: id });
  }, []);

  const closeSimulation = useCallback(() => {
    dispatch({ type: 'SET_ACTIVE_SIMULATION', payload: null });
    dispatch({ type: 'SET_PANEL_STATE', payload: 'closed' });
  }, []);

  const getSimulation = useCallback(
    (id: string): SimulationResult | undefined => {
      return state.simulations[id];
    },
    [state.simulations]
  );

  const getSavedSimulation = useCallback(
    (id: string): SavedSimulation | undefined => {
      return state.savedSimulations[id];
    },
    [state.savedSimulations]
  );

  const saveSimulation = useCallback(
    (simulation: SimulationResult, title?: string) => {
      if (!state.activeConversationId) return;

      const savedSim: SavedSimulation = {
        ...simulation,
        threadId: state.activeConversationId,
        savedAt: new Date(),
        title: title || simulation.matchupText,
      };

      dispatch({ type: 'SAVE_SIMULATION', payload: savedSim });

      // Add a message to the thread with the saved snapshot
      const snapshotMessage: Message = {
        id: `msg-${Date.now()}-snapshot`,
        conversationId: state.activeConversationId,
        role: 'assistant',
        content: 'Simulation saved for reference.',
        timestamp: new Date(),
        metadata: {
          isSavedSimulation: true,
          simulationId: savedSim.id,
        },
      };
      dispatch({ type: 'ADD_MESSAGE', payload: snapshotMessage });

      // Close the simulation overlay
      dispatch({ type: 'SET_ACTIVE_SIMULATION', payload: null });
      dispatch({ type: 'SET_PANEL_STATE', payload: 'closed' });
    },
    [state.activeConversationId]
  );

  // ── Governed Action Confirm / Cancel (v2) ──
  const confirmAction = useCallback((messageId: string) => {
    const pending = state.pendingAction;
    const pendingConvId = state.pendingActionConversationId;
    if (!pending || !pendingConvId) return;

    // Update confirmation bubble to 'confirmed'
    dispatch({ type: 'UPDATE_CONFIRMATION_STATE', payload: { messageId, state: 'confirmed' } });

    // Execute the action and inject receipt
    const nexusScope = buildNexusScope();
    const receiptMsg = executeConfirmedAction(pending, nexusScope, pendingConvId);
    dispatch({ type: 'ADD_V2_MESSAGES', payload: [receiptMsg] });
    dispatch({ type: 'CLEAR_PENDING_ACTION' });
  }, [state.pendingAction, state.pendingActionConversationId, buildNexusScope]);

  const cancelAction = useCallback((messageId: string) => {
    // Update confirmation bubble to 'cancelled'
    dispatch({ type: 'UPDATE_CONFIRMATION_STATE', payload: { messageId, state: 'cancelled' } });
    dispatch({ type: 'CLEAR_PENDING_ACTION' });
  }, []);

  const handleEscalationChoice = useCallback((messageId: string, action: string) => {
    const conversationId = state.activeConversationId;
    if (!conversationId) return;

    if (action === 'create_request') {
      // Mock: inject a receipt for the created request
      const receiptMsg: MessageV2 = {
        id: `receipt-esc-${Date.now()}`,
        conversationId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        messageType: 'receipt',
        receipt: {
          status: 'created',
          action_type: 'create_request',
          summary: 'Request created and routed to the appropriate owner.',
          objects: [],
        },
      };
      dispatch({ type: 'ADD_V2_MESSAGES', payload: [receiptMsg] });
    } else if (action === 'save_question') {
      const ackMsg: MessageV2 = {
        id: `ack-esc-${Date.now()}`,
        conversationId,
        role: 'assistant',
        content: 'Saved as an open question. You can revisit this anytime.',
        timestamp: new Date(),
        messageType: 'text',
      };
      dispatch({ type: 'ADD_V2_MESSAGES', payload: [ackMsg] });
    }
  }, [state.activeConversationId]);

  const value: NexusContextValue = {
    state,
    openConversations,
    openContextDrawer,
    openRoster,
    openRecruitingBoard,
    closePanel,
    selectConversation,
    createNewConversation,
    setInputText,
    sendMessage,
    openSimulation,
    closeSimulation,
    getSimulation,
    getSavedSimulation,
    saveSimulation,
    openNewConversationSheet,
    closeNewConversationSheet,
    createNewEval,
    createNewSim,
    updateConversationConfig,
    pinConversation,
    unpinConversation,
    getEvalSnapshot,
    generatePlayerEval,
    renameConversation,
    archiveConversation,
    deleteConversation,
    setTargetContext,
    addAssistantMessage,
    createNewGameOps,
    updateGameOpsStep,
    addUserMessage,
    confirmAction,
    cancelAction,
    handleEscalationChoice,
  };

  return <NexusContext.Provider value={value}>{children}</NexusContext.Provider>;
}

// =============================================================================
// HOOK
// =============================================================================

export function useNexusContext(): NexusContextValue {
  const context = useContext(NexusContext);
  if (context === undefined) {
    throw new Error('useNexusContext must be used within a NexusProvider');
  }
  return context;
}

// =============================================================================
// HELPERS
// =============================================================================

// Mock response helpers removed — all responses now come from GPT-4o via utils/openai.ts

function generateConversationTitle(message: string): string {
  // Take first 40 characters and clean up
  let title = message.slice(0, 40).trim();

  // If we cut mid-word, find the last space
  if (message.length > 40) {
    const lastSpace = title.lastIndexOf(' ');
    if (lastSpace > 20) {
      title = title.slice(0, lastSpace);
    }
    title += '...';
  }

  // Capitalize first letter
  return title.charAt(0).toUpperCase() + title.slice(1);
}
```

---

# Section D — Nexus AI Integration

## Player Query System (`utils/nexus-player-query.ts`)

```typescript
/**
 * Nexus Player Query Preprocessor
 *
 * Detects player-related queries in user messages and enriches
 * the GPT context with real data from the national player pool.
 * This runs BEFORE sending to GPT so the model has real data to reason about.
 */

import { nationalPool, type NationalPlayer, type SearchFilters } from '@/data/national-pool';
import {
  getKRColor,
  getKRTierLabel,
  getArchetypeDisplay,
  LEVEL_DISPLAY_SHORT,
  CLUSTER_LABELS,
  CLUSTER_ORDER,
} from '@/utils/kr-display';

// =============================================================================
// DETECTION — Is this a player/recruiting/scouting query?
// =============================================================================

const PLAYER_KEYWORDS = [
  'player', 'recruit', 'prospect', 'transfer', 'portal',
  'roster', 'scout', 'scouting', 'evaluate', 'evaluation',
  'kr', 'rating', 'ranked', 'ranking',
  'top', 'best', 'worst', 'highest', 'lowest',
  'archetype', 'badge', 'cluster',
  'scholarship', 'nil',
  'shooting', 'finishing', 'playmaking', 'defense', 'rebounding',
];

const POSITION_KEYWORDS = [
  'pg', 'sg', 'sf', 'pf', 'center',
  'guard', 'wing', 'forward', 'big',
  'point guard', 'shooting guard', 'small forward', 'power forward',
];

const LEVEL_KEYWORDS = [
  'naia', 'juco', 'njcaa', 'cccaa', 'd1', 'd2', 'd3',
  'division', 'ncaa', 'college',
];

const QUERY_PATTERNS = [
  /who (?:is|are) the/i,
  /show me/i,
  /find (?:me )?(?:a |the |some )?player/i,
  /search (?:for )?player/i,
  /look up/i,
  /compare/i,
  /tell me about/i,
  /what.+kr/i,
  /top \d+/i,
  /(?:best|highest|lowest|tallest|shortest).+(?:player|guard|wing|forward|big|center)/i,
  /how (?:good|tall|many) (?:is|are)/i,
];

export interface PlayerQueryResult {
  isPlayerQuery: boolean;
  contextBlock: string;
  playerCount: number;
  matchedPlayers?: NationalPlayer[];
}

/**
 * Detect whether a user message is about players/recruiting.
 * Returns false for clearly non-player queries.
 */
export function isPlayerRelatedQuery(text: string): boolean {
  const lower = text.toLowerCase();

  // Check query patterns
  for (const pattern of QUERY_PATTERNS) {
    if (pattern.test(lower)) return true;
  }

  // Check keyword density — need at least one player keyword + context
  let keywordHits = 0;
  for (const kw of PLAYER_KEYWORDS) {
    if (lower.includes(kw)) keywordHits++;
  }
  for (const kw of POSITION_KEYWORDS) {
    if (lower.includes(kw)) keywordHits++;
  }
  for (const kw of LEVEL_KEYWORDS) {
    if (lower.includes(kw)) keywordHits++;
  }

  return keywordHits >= 2;
}

// =============================================================================
// EXTRACTION — Pull search parameters from natural language
// =============================================================================

interface ExtractedFilters {
  query?: string;
  level?: string[];
  position?: string[];
  minKR?: number;
  limit?: number;
  sortBy?: SearchFilters['sortBy'];
  hasPortalEntry?: boolean;
}

function extractFilters(text: string): ExtractedFilters {
  const lower = text.toLowerCase();
  const filters: ExtractedFilters = {};

  // Level extraction
  const levels: string[] = [];
  if (/\bnaia\b/i.test(lower)) levels.push('naia');
  if (/\bnjcaa\s*d1\b|\bjuco\s*d1\b/i.test(lower)) levels.push('njcaa_d1');
  if (/\bnjcaa\s*d2\b|\bjuco\s*d2\b/i.test(lower)) levels.push('njcaa_d2');
  if (/\bnjcaa\s*d3\b|\bjuco\s*d3\b/i.test(lower)) levels.push('njcaa_d3');
  if (/\bcccaa\b|\b3c2a\b/i.test(lower)) levels.push('cccaa');
  if (levels.length > 0) filters.level = levels;

  // Position extraction — canonical 5 positions: PG, CG, W, F, B
  const positions: string[] = [];
  if (/\bpg\b|\bpoint guard/i.test(lower)) positions.push('PG');
  if (/\bcg\b|\bcombo guard/i.test(lower)) positions.push('CG');
  if (/\bsg\b|\bshooting guard/i.test(lower)) positions.push('CG');
  if (/\bwing\b|\bw\b/i.test(lower) && /player|position|wing/i.test(lower)) positions.push('W');
  if (/\bsf\b|\bsmall forward/i.test(lower)) positions.push('W');
  if (/\bforward\b|\bpf\b|\bpower forward/i.test(lower)) positions.push('F');
  if (/\bbig\b|\bcenter\b/i.test(lower) && /player|position|big|center/i.test(lower)) positions.push('B');
  if (/\b[cb]\b/i.test(lower) && /player|position|big|center/i.test(lower)) positions.push('B');
  if (/\bguard/i.test(lower) && !positions.length) { positions.push('PG'); positions.push('CG'); }
  if (positions.length > 0) filters.position = [...new Set(positions)];

  // KR threshold
  const krMatch = lower.match(/kr\s*(?:above|over|>=?|at least)\s*(\d+)/i);
  if (krMatch) filters.minKR = parseInt(krMatch[1], 10);
  if (/top\s*\d/i.test(lower)) filters.minKR = filters.minKR ?? 1; // exclude unrated

  // Limit
  const limitMatch = lower.match(/top\s+(\d+)/i);
  if (limitMatch) filters.limit = Math.min(parseInt(limitMatch[1], 10), 25);
  if (!filters.limit) filters.limit = 15; // default

  // Portal
  if (/portal|transfer/i.test(lower)) filters.hasPortalEntry = true;

  // Sort
  if (/tallest|height/i.test(lower)) filters.sortBy = 'height';
  else if (/scorer|ppg|point/i.test(lower)) filters.sortBy = 'ppg';
  else if (/rebound|rpg/i.test(lower)) filters.sortBy = 'rpg';
  else if (/assist|apg/i.test(lower)) filters.sortBy = 'apg';
  else filters.sortBy = 'kr';

  // Name search — extract quoted names or proper nouns
  const nameMatch = text.match(/"([^"]+)"|'([^']+)'/);
  if (nameMatch) {
    filters.query = nameMatch[1] || nameMatch[2];
  } else {
    // Try to detect a school or player name (capitalized words not in keyword lists)
    const words = text.split(/\s+/);
    const possibleNames = words.filter((w) => {
      const wl = w.toLowerCase().replace(/[^a-z]/g, '');
      return w.length > 2 &&
        w[0] === w[0].toUpperCase() &&
        !PLAYER_KEYWORDS.includes(wl) &&
        !POSITION_KEYWORDS.includes(wl) &&
        !LEVEL_KEYWORDS.includes(wl) &&
        !['the', 'who', 'are', 'what', 'how', 'top', 'best', 'find', 'show', 'tell', 'about', 'from', 'with'].includes(wl);
    });
    if (possibleNames.length > 0 && possibleNames.length <= 4) {
      filters.query = possibleNames.join(' ');
    }
  }

  return filters;
}

// =============================================================================
// FORMATTING — Build context block for GPT
// =============================================================================

function formatPlayerForGPT(p: NationalPlayer, rank: number): string {
  const kr = p.kr != null ? `KR ${Math.round(p.kr)}` : 'Unrated';
  const tier = p.kr != null ? getKRTierLabel(p.kr, p.levelKey) : '';
  const arch = getArchetypeDisplay(p.archetype);
  const level = LEVEL_DISPLAY_SHORT[p.levelKey] ?? p.levelKey;
  const stats = p.ppg != null
    ? `${p.ppg.toFixed(1)}/${p.rpg?.toFixed(1) ?? '0.0'}/${p.apg?.toFixed(1) ?? '0.0'} PPG/RPG/APG`
    : 'No stats';
  const portal = p.portalEntryDate ? ` [PORTAL: ${p.portalEntryDate}]` : '';
  const clusters = p.clusters
    ? CLUSTER_ORDER.map((k) => {
        const score = (p.clusters as any)[k];
        return score != null ? `${CLUSTER_LABELS[k]?.label ?? k}: ${Math.round(score)}` : null;
      }).filter(Boolean).join(', ')
    : '';
  const scholarshipInfo = p.scholarship
    ? ` | Scholarship: ${p.scholarship.scholarshipPct ?? 0}%, NIL: $${(p.scholarship.nilAmount ?? 0).toLocaleString()}, Fit: ${p.scholarship.overallFitPct ?? 0}%`
    : '';

  let line = `${rank}. ${p.fullName} · ${p.position} · ${p.height}${p.weight ? ` / ${p.weight}lbs` : ''} · ${p.classYear} · ${p.school} (${level})`;
  line += ` · ${kr}${tier ? ` (${tier})` : ''} · ${arch} · ${stats}${portal}`;
  if (clusters) line += `\n   Clusters: ${clusters}`;
  if (scholarshipInfo) line += `\n   ${scholarshipInfo}`;

  return line;
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Process a user message for player-related content.
 * Returns enriched context to inject into the GPT system prompt.
 */
export function processPlayerQuery(userMessage: string): PlayerQueryResult {
  if (!isPlayerRelatedQuery(userMessage)) {
    return { isPlayerQuery: false, contextBlock: '', playerCount: 0 };
  }

  const filters = extractFilters(userMessage);

  const results = nationalPool.search({
    query: filters.query,
    level: filters.level,
    position: filters.position,
    minKR: filters.minKR,
    hasPortalEntry: filters.hasPortalEntry,
    sortBy: filters.sortBy ?? 'kr',
    sortDir: filters.sortBy === 'name' ? 'asc' : 'desc',
    limit: filters.limit ?? 15,
  });

  if (results.length === 0) {
    return {
      isPlayerQuery: true,
      contextBlock: '\n[PLAYER DATA] No players found matching the query. The database contains ' +
        `${nationalPool.counts.players.toLocaleString()} players across ${nationalPool.getLevels().length} competitive levels ` +
        `(${nationalPool.getLevels().map(l => LEVEL_DISPLAY_SHORT[l] ?? l).join(', ')}). ` +
        `${nationalPool.counts.withKR.toLocaleString()} have computed KR ratings.`,
      playerCount: 0,
    };
  }

  // Total matching (without limit)
  const totalMatching = nationalPool.search({
    query: filters.query,
    level: filters.level,
    position: filters.position,
    minKR: filters.minKR,
    hasPortalEntry: filters.hasPortalEntry,
  }).length;

  const lines = results.map((p, i) => formatPlayerForGPT(p, i + 1));

  const filterDesc = [
    filters.level ? `Level: ${filters.level.map(l => LEVEL_DISPLAY_SHORT[l] ?? l).join(', ')}` : null,
    filters.position ? `Position: ${filters.position.join(', ')}` : null,
    filters.minKR ? `Min KR: ${filters.minKR}` : null,
    filters.hasPortalEntry ? 'Portal entries only' : null,
    filters.query ? `Search: "${filters.query}"` : null,
  ].filter(Boolean).join(' | ');

  const contextBlock = [
    `\n[PLAYER DATA] Found ${totalMatching} players${filterDesc ? ` (${filterDesc})` : ''}. Showing top ${results.length}:`,
    ...lines,
    totalMatching > results.length ? `\n... and ${totalMatching - results.length} more matching players.` : '',
    `\nDatabase: ${nationalPool.counts.players.toLocaleString()} total players, ${nationalPool.counts.withKR.toLocaleString()} with KR, across ${nationalPool.getLevels().map(l => LEVEL_DISPLAY_SHORT[l] ?? l).join(', ')}.`,
  ].join('\n');

  return {
    isPlayerQuery: true,
    contextBlock,
    playerCount: results.length,
    matchedPlayers: results,
  };
}

/**
 * Build the national pool awareness section for the system prompt.
 * This is always included in sports mode so Nexus knows it can answer player questions.
 */
export function buildPoolAwarenessPrompt(): string {
  const counts = nationalPool.counts;
  const levels = nationalPool.getLevels().map(l => LEVEL_DISPLAY_SHORT[l] ?? l).join(', ');

  return [
    `\n## National Player Pool Intelligence`,
    `You have access to a real national player database with ${counts.players.toLocaleString()} players across these levels: ${levels}.`,
    `- ${counts.withKR.toLocaleString()} players have computed KaNeXT Ratings (KR, 0-100 scale)`,
    `- ${counts.withStats.toLocaleString()} have season statistics`,
    `- ${counts.withScholarship.toLocaleString()} have scholarship & NIL allocation recommendations`,
    `- ${counts.teamSystems} teams have OSIE/DSIE system identity profiles`,
    ``,
    `KR is level-aware — the same score means different things at different levels. Always reference the player's level when discussing KR.`,
    `Each player has 7 cluster scores (Shooting, Finishing, Playmaking, Perimeter D, Interior D, Rebounding, Physical) and a primary archetype.`,
    ``,
    `When the user asks about players, real data will be provided in [PLAYER DATA] blocks. Use this data to give specific, data-driven answers.`,
    `If no [PLAYER DATA] block is present, you can still discuss player evaluation concepts, KR methodology, or suggest queries.`,
    ``,
    `When referencing specific players, use [LINK:player:ID:Name] format for tappable links (e.g. [LINK:player:abc123:John Smith]).`,
  ].join('\n');
}
```

## OpenAI Integration (`utils/openai.ts`)

```typescript
/**
 * OpenAI API Client for Nexus
 * Sends chat completions to GPT-4o with a system prompt built from current app context.
 */

import OpenAI from 'openai';
import type { Mode, Role, Organization, Program } from '@/types';
import { buildPoolAwarenessPrompt } from '@/utils/nexus-player-query';

// API key loaded from environment or hardcoded for dev
// In production, this should come from a secure backend proxy
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: OPENAI_API_KEY,
      // Required for React Native — disables Node.js-specific features
      dangerouslyAllowBrowser: true,
    });
  }
  return client;
}

// =============================================================================
// SYSTEM PROMPT BUILDER
// =============================================================================

interface NexusContext {
  mode: Mode;
  organization: Organization | null;
  operatingRole: Role;
  program: Program | null;
  cycleName: string | null;
  isOnboarding?: boolean;
  isGameOps?: boolean;
  gameOpsOpponent?: string;
}

function buildSystemPrompt(ctx: NexusContext): string {
  const parts: string[] = [];

  parts.push(
    `You are Nexus, the intelligence surface for KaNeXT OS. You are a reasoning assistant — you analyze, project, recommend, and answer questions. You do NOT execute actions or mutate state; you advise.`
  );

  parts.push(`\nCurrent context:`);
  parts.push(`- Mode: ${ctx.mode}`);

  if (ctx.organization) {
    parts.push(`- Organization: ${ctx.organization.name} (${ctx.organization.type})`);
    if (ctx.organization.location) {
      parts.push(`- Location: ${ctx.organization.location}`);
    }
    if (ctx.organization.description) {
      parts.push(`- Description: ${ctx.organization.description}`);
    }
  }

  parts.push(`- Operating Role: ${ctx.operatingRole}`);

  if (ctx.program) {
    parts.push(`- Program: ${ctx.program.name} (${ctx.program.level})`);
  }

  if (ctx.cycleName) {
    parts.push(`- Current Cycle/Season: ${ctx.cycleName}`);
  }

  // Mode-specific instructions
  switch (ctx.mode) {
    case 'sports':
      parts.push(`\nYou are a sports analytics assistant for collegiate basketball. You can analyze rosters, simulate matchups, evaluate players, project game outcomes, and explore strategic scenarios. You understand basketball strategy, recruiting, NIL, transfer portal, and program management.`);
      parts.push(buildPoolAwarenessPrompt());
      break;
    case 'business':
      parts.push(`\nYou are a strategic business advisor. You help analyze company metrics, model fundraising scenarios, evaluate market opportunities, plan resource allocation, and advise on growth strategy.`);
      break;
    case 'church':
      parts.push(`\nYou are a ministry planning assistant. You help analyze congregation patterns, plan events, coordinate ministries, manage giving insights, and support outreach initiatives.`);
      break;
    case 'education':
      parts.push(`\nYou are an academic planning assistant. You help analyze enrollment patterns, track academic performance, support faculty coordination, and plan institutional events.`);
      break;
  }

  if (ctx.isOnboarding) {
    parts.push(`\nThis is a NEW user who just signed in for the first time. Start by welcoming them to Nexus. Ask if they have an organization link or code to connect to an existing organization. If they provide one, confirm the connection (mock: connect them to "FMU Lions" as Head Coach). If they don't have one, let them know they can continue as a Viewer and join an organization later from Settings. Keep the onboarding natural and conversational — just a few quick questions, then let them explore.`);
  }

  if (ctx.isGameOps) {
    parts.push(`\n## GAME OPS MODE — vs ${ctx.gameOpsOpponent ?? 'opponent'}`);
    parts.push(`You are helping a coach set up a live basketball game. Your job is to gather the game configuration through natural conversation.`);
    parts.push(`\nYou need to collect:`);
    parts.push(`1. **Period format**: halves or quarters`);
    parts.push(`2. **Period length**: how long each period is (e.g. 20:00 for halves, 10:00 for quarters)`);
    parts.push(`3. **Timeouts**: how many per half/quarter, any 30-second vs full distinction`);
    parts.push(`4. **Bonus rules**: when bonus / double bonus kicks in (e.g. 7th foul, 10th foul)`);
    parts.push(`5. **Starters**: which 5 players are starting`);
    parts.push(`\nLeague shortcuts — if they say a league name, auto-fill defaults:`);
    parts.push(`- **NAIA**: 2 halves, 20:00 each, 4 timeouts per half (full only), bonus at 5th foul, double bonus at 10th`);
    parts.push(`- **NCAA D1/D2**: 2 halves, 20:00 each, 4 timeouts per half (30s + full), bonus at 7th foul, double bonus at 10th`);
    parts.push(`- **NCAA D3**: 2 halves, 20:00 each, 4 timeouts per half, bonus at 7th foul, double bonus at 10th`);
    parts.push(`- **NBA**: 4 quarters, 12:00 each, 7 timeouts per game, no bonus (penalty FT after 5th team foul per quarter)`);
    parts.push(`- **High School**: 4 quarters, 8:00 each, 5 timeouts per game, bonus at 7th foul, double bonus at 10th`);
    parts.push(`\nRules:`);
    parts.push(`- If the user gives you everything at once, confirm it in a short summary and ask for starters.`);
    parts.push(`- If they just name a league, confirm the defaults and ask for starters.`);
    parts.push(`- If something is missing, ask specifically what's missing — don't re-ask what they already told you.`);
    parts.push(`- Once you have ALL info including starters, give a final summary line like: "All set — [format], [length], [timeouts]. Starters: [names]. Ready to go?"`);
    parts.push(`- Keep responses SHORT. 1-3 sentences max. No paragraphs.`);
  }

  // ── Knowledge Learning System ──────────────────────────────────────────────
  parts.push(`
========================================
KNOWLEDGE LEARNING SYSTEM
========================================

Nexus gets smarter over time by learning from the people who run the organization.

KNOWLEDGE SOURCES:

You start with everything already in the system:
- Coaching manual and playbook
- System identity (offensive and defensive schemes)
- Game film with any tags or annotations
- Practice plans and drill library
- Roster data, stats, evaluations
- Organization documents, policies, procedures
- Financial data, budgets, allocations
- Compliance rules and requirements
- All previously answered questions

This is your base knowledge. Answer any question covered by this data.

ESCALATION FLOW:

When someone asks a question you cannot answer:

1. Search your full knowledge base
2. If you CAN answer → answer normally
3. If you CANNOT answer → respond: "I don't have the answer to this yet. Want me to send this question to [appropriate person]?"
4. Auto-detect who the right person is based on the topic and the organization hierarchy
5. If user taps Confirm → question is sent to that person via Messages
6. The message is tagged as a "Nexus Question" so the recipient knows it came from Nexus
7. Recipient sees the question with full context — who asked, what they were looking at, the exact question
8. Recipient answers in Messages
9. That answer feeds back into your knowledge base automatically
10. Next time anyone asks the same or similar question → answer directly using that answer
11. Credit the source: "According to Coach Brooks..." or "Pastor Kalejaiye has said..."

ROLE-BASED ESCALATION TARGETS:

${ctx.mode === 'sports' ? `Sports:
- Basketball strategy, plays, rotations → Head Coach
- Player development, workouts → Assistant Coach / Strength Coach
- Eligibility, compliance, immigration → Compliance Officer / AD
- Schedule, travel, logistics → Operations` :
ctx.mode === 'church' ? `Church:
- Theology, scripture, doctrine → Senior Pastor
- Ministry operations, volunteers → Ministry Leaders
- Events, logistics → Church Administrator
- Giving, finances → Finance Team` :
ctx.mode === 'business' ? `Business:
- Product, strategy, vision → Founder
- Legal, compliance → Legal Counsel
- Finance, budget → CFO / Finance Lead
- Deals, partnerships → Business Development` :
ctx.mode === 'education' ? `Education:
- Academics, curriculum → Department Chair / Dean
- Admissions, enrollment → Admissions Director
- Student issues → Dean of Students
- Compliance, accreditation → Provost` :
ctx.mode === 'competition' ? `Competition:
- Rules, regulations → Commissioner
- Technical, cars → Technical Director
- Race operations → Race Director
- Entries, wildcards → Operations Director` :
`Default: Escalate to the appropriate leader based on topic.`}

WHAT GETS LEARNED:

Only general knowledge — things that would help anyone who asks the same question. Private or one-off answers (like "tell Marcus to come see me after practice") do NOT get added to the knowledge base.

When the person answering flags their response:
- "Add to Nexus" → answer becomes part of your knowledge base, available to anyone with appropriate access
- "Private reply" → answer goes only to the person who asked, you do NOT learn from it

RBAC ON LEARNED KNOWLEDGE:

Not everyone sees the same answers. Respect role-based access:
- Players/members can ask about their own development, team schedule, general information
- Players/members CANNOT access strategy discussions, evaluations of others, budget details, or compliance information about others
- Staff can access more than players/members but less than the head coach/pastor/founder
- The top leader sees everything

When you learn an answer, tag it with the appropriate access level based on content. Strategy stays leader-level. General information is available to all.`);

  parts.push(`\nBe concise, direct, and actionable. Match the user's energy — short questions get short answers, detailed questions get detailed analysis. Never break character.`);

  return parts.join('\n');
}

// =============================================================================
// CHAT COMPLETION
// =============================================================================

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface SendMessageOptions {
  messages: ChatMessage[];
  context: NexusContext;
  /** Optional player data context block injected by the query preprocessor */
  playerDataContext?: string;
}

export async function sendToGPT({ messages, context, playerDataContext }: SendMessageOptions): Promise<string> {
  if (!OPENAI_API_KEY) {
    // Fallback: return a helpful message if no API key
    return "Nexus is not connected to GPT yet. Set EXPO_PUBLIC_OPENAI_API_KEY in your environment to enable AI responses.";
  }

  try {
    let systemPrompt = buildSystemPrompt(context);

    // Inject player data context if available
    if (playerDataContext) {
      systemPrompt += '\n' + playerDataContext;
    }

    const response = await getClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content ?? "I couldn't generate a response. Please try again.";
  } catch (error: any) {
    console.error('OpenAI API error:', error);

    if (error?.status === 401) {
      return "Invalid API key. Please check your EXPO_PUBLIC_OPENAI_API_KEY.";
    }
    if (error?.status === 429) {
      return "Rate limit reached. Please try again in a moment.";
    }

    return "Something went wrong connecting to Nexus AI. Please try again.";
  }
}
```


---


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
import { FMU_GAMES, FMU_GAMES_BY_ID, FMU_LEADERS, FMU_STANDINGS, FMU_NEWS, FMU_RECORD, FMU_LAST_GAME, FMU_LAST_GAME_ID, FMU_NEXT_GAME, FMU_NEXT_GAME_ID, FMU_SEASON_COMPLETE, FMU_GAME_BPR, getBPRColor, FMU_GAME_IMPACT, getBPRColor, getTPQColor, tgisToDisplay, FMU_PREGAME, ROSTER_KR, DNA_OFFENSE_POOL, DNA_DEFENSE_POOL, DNA_TEMPO_POOL, jerseyArchetypeMap, POSITIVE_IMPACT, NEGATIVE_IMPACT, type PregameSnapshot, type ClusterRating } from '@/data/fmu';
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
  const [activeRecentBPR, setActiveRecentBPR] = useState(0);
  const [fullRecentBPROpen, setFullRecentBPROpen] = useState(false);
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

                {/* TPQ + BPR for completed games, Pregame Snapshot for upcoming */}
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

                      {/* Our Depth Chart with BPR */}
                      <UnitsView
                        depthChart={DEPTH_CHART_BY_SEASON[CURRENT_SEASON]}
                        gameImpact={recentImpact ?? undefined}
                        hideSystems
                        statLeaders={[...recentImpact.starters, ...recentImpact.bench]
                          .sort((a, b) => b.pgis - a.pgis)
                          .slice(0, 3)
                          .map((p) => ({ label: 'BPR', name: p.name.split(' ').slice(1).join(' ') || p.name, value: `${p.pgis > 0 ? '+' : ''}${p.pgis}` }))}
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


---


# Section F — Commerce Sheets & Bottom Sheet System

## Bottom Sheet Wrapper (`components/ui/bottom-sheet.tsx`)

```typescript
/**
 * Universal Bottom Sheet — @gorhom/bottom-sheet wrapper
 *
 * iOS Detented Bottom Sheet: two snap points (50% and 100%).
 * All sheets open at 50% first. User drags up to 100% or down to dismiss.
 * Preserves the visible/onClose prop API for all consumers.
 *
 * Non-modal sheets are only mounted while visible (+ close animation),
 * so idle sheets don't steal gestures from underlying views.
 */

import React, { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import GorhomBottomSheet, {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetFooter,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps, BottomSheetFooterProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  /** @deprecated Ignored — all sheets use 50%+100% detents per spec. */
  snapPercent?: number;
  /** @deprecated Ignored — all sheets open at 50% first. */
  mode?: 'standard' | 'full';
  /** Use portal-based BottomSheetModal for deeply nested components */
  useModal?: boolean;
}

const SNAP_POINTS = ['50%', '100%'];

export function BottomSheet({
  visible,
  onClose,
  children,
  title,
  footer,
  useModal = false,
}: BottomSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const sheetRef = useRef<GorhomBottomSheet>(null);
  const modalRef = useRef<BottomSheetModal>(null);

  // mounted = sheet DOM is in the tree (for non-modal)
  const [mounted, setMounted] = useState(false);
  // opening = we've asked to open but haven't reached index >= 0 yet
  // This prevents the initial onChange(-1) from immediately closing the sheet
  const openingRef = useRef(false);
  // closing = user-initiated close in progress, ignore further onChange
  const closingRef = useRef(false);
  // hasOpened = sheet reached index >= 0 at least once since mount
  const hasOpenedRef = useRef(false);

  // ── Open flow ──
  useEffect(() => {
    if (visible) {
      closingRef.current = false;
      hasOpenedRef.current = false;
      if (useModal) {
        openingRef.current = true;
        // Modal is always mounted, just present it
        requestAnimationFrame(() => {
          modalRef.current?.present();
        });
      } else {
        // Mount the sheet first, then snap on next effect
        openingRef.current = true;
        setMounted(true);
      }
    }
  }, [visible, useModal]);

  // ── After mount, snap to first detent ──
  useEffect(() => {
    if (mounted && visible && !useModal && openingRef.current) {
      // Use setTimeout to ensure the GorhomBottomSheet ref is ready
      const timer = setTimeout(() => {
        sheetRef.current?.snapToIndex(0);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [mounted, visible, useModal]);

  // ── Close flow (parent sets visible=false) ──
  useEffect(() => {
    if (!visible && mounted && !useModal) {
      closingRef.current = true;
      sheetRef.current?.close();
    }
    if (!visible && useModal) {
      closingRef.current = true;
      modalRef.current?.dismiss();
    }
  }, [visible, mounted, useModal]);

  // Sync dismiss back to parent state
  const handleSheetChange = useCallback(
    (index: number) => {
      if (index >= 0) {
        openingRef.current = false;
        hasOpenedRef.current = true;
      }
      if (index === -1) {
        if (openingRef.current) return;
        if (!hasOpenedRef.current && !closingRef.current) return;

        setMounted(false);
        openingRef.current = false;
        hasOpenedRef.current = false;
        closingRef.current = false;
        if (visible) {
          onClose();
        }
      }
    },
    [onClose, visible],
  );

  const handleModalDismiss = useCallback(() => {
    openingRef.current = false;
    if (visible) {
      onClose();
    }
  }, [onClose, visible]);

  const handleClose = useCallback(() => {
    closingRef.current = true;
    if (useModal) {
      modalRef.current?.dismiss();
    } else {
      sheetRef.current?.close();
    }
  }, [useModal]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
        opacity={0.4}
      />
    ),
    [],
  );

  const renderFooter = useMemo(() => {
    if (!footer) return undefined;
    return (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={insets.bottom}>
        <View style={[styles.footer, { borderTopColor: colors.divider }]}>
          {footer}
        </View>
      </BottomSheetFooter>
    );
  }, [footer, colors.divider, insets.bottom]);

  const sheetContent = (
    <>
      {title && (
        <View style={[styles.header, { borderBottomColor: colors.divider }]}>
          <View style={styles.headerSpacer} />
          <ThemedText style={styles.headerTitle}>{title}</ThemedText>
          <Pressable style={styles.headerClose} onPress={handleClose}>
            <IconSymbol name="xmark" size={16} color={colors.textSecondary} />
          </Pressable>
        </View>
      )}
      <BottomSheetScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </BottomSheetScrollView>
    </>
  );

  const sharedProps = {
    snapPoints: SNAP_POINTS,
    enablePanDownToClose: true,
    backdropComponent: renderBackdrop,
    footerComponent: renderFooter,
    handleIndicatorStyle: { backgroundColor: colors.border, width: 36 },
    backgroundStyle: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    style: styles.sheet,
  };

  if (useModal) {
    return (
      <BottomSheetModal
        ref={modalRef}
        {...sharedProps}
        onDismiss={handleModalDismiss}
      >
        {sheetContent}
      </BottomSheetModal>
    );
  }

  if (!mounted) return null;

  return (
    <GorhomBottomSheet
      ref={sheetRef}
      index={-1}
      {...sharedProps}
      onChange={handleSheetChange}
    >
      {sheetContent}
    </GorhomBottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSpacer: { width: 32 },
  headerTitle: { fontSize: 16, fontWeight: '600', flex: 1, textAlign: 'center' },
  headerClose: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
```

---

## Business Deck Sheet (`components/commerce/biz-deck-sheet.tsx`)

```typescript
/**
 * Business Deck Bottom Sheet
 *
 * Primary pitch deck card + 3 supporting docs from DECK_DOCUMENTS.
 * Share/Download buttons (placeholders).
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DECK_DOCUMENTS, type DeckDocument } from '@/data/mock-business-home';
import { Spacing, BorderRadius } from '@/constants/theme';

const ACCENT = '#8B5CF6';

const TYPE_ICONS: Record<DeckDocument['type'], string> = {
  deck: 'doc.richtext.fill',
  pdf: 'doc.text.fill',
  video: 'play.rectangle.fill',
  doc: 'doc.fill',
};

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

export function BizDeckSheet({ visible, onClose, colors }: Props) {
  const primary = DECK_DOCUMENTS.find((d) => d.isPrimary);
  const supporting = DECK_DOCUMENTS.filter((d) => !d.isPrimary);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Deck" useModal>
      <View style={styles.container}>
        {primary && (
          <View style={[styles.primaryCard, { backgroundColor: ACCENT + '15', borderColor: ACCENT + '33' }]}>
            <View style={styles.primaryHeader}>
              <IconSymbol name={TYPE_ICONS[primary.type] as any} size={28} color={ACCENT} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.primaryTitle, { color: colors.text }]}>{primary.title}</Text>
                <Text style={[styles.primaryMeta, { color: colors.textSecondary }]}>
                  {primary.type.toUpperCase()} · {primary.size}
                </Text>
              </View>
            </View>
            <View style={styles.primaryActions}>
              <Pressable style={[styles.actionButton, { backgroundColor: ACCENT }]}>
                <IconSymbol name="eye.fill" size={14} color="#fff" />
                <Text style={styles.actionButtonText}>View</Text>
              </Pressable>
              <Pressable style={[styles.actionButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
                <IconSymbol name="square.and.arrow.up" size={14} color={colors.text} />
                <Text style={[styles.actionButtonTextAlt, { color: colors.text }]}>Share</Text>
              </Pressable>
              <Pressable style={[styles.actionButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
                <IconSymbol name="arrow.down.circle" size={14} color={colors.text} />
                <Text style={[styles.actionButtonTextAlt, { color: colors.text }]}>Download</Text>
              </Pressable>
            </View>
          </View>
        )}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>SUPPORTING DOCUMENTS</Text>
        {supporting.map((doc) => (
          <Pressable key={doc.id} style={[styles.docRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <IconSymbol name={TYPE_ICONS[doc.type] as any} size={20} color={ACCENT} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.docTitle, { color: colors.text }]}>{doc.title}</Text>
              <Text style={[styles.docMeta, { color: colors.textSecondary }]}>{doc.type.toUpperCase()} · {doc.size}</Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={colors.textSecondary} />
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  primaryCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, gap: 14 },
  primaryHeader: { flexDirection: 'row', alignItems: 'center' },
  primaryTitle: { fontSize: 16, fontWeight: '700' },
  primaryMeta: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  primaryActions: { flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: BorderRadius.md },
  actionButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  actionButtonTextAlt: { fontSize: 13, fontWeight: '600' },
  docRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth },
  docTitle: { fontSize: 14, fontWeight: '600' },
  docMeta: { fontSize: 11, fontWeight: '500', marginTop: 2 },
});
```

---

## Business Data Room Sheet (`components/commerce/biz-data-room-sheet.tsx`)

```typescript
/**
 * Business Data Room Bottom Sheet
 *
 * 2-stage: folders → documents.
 * RBAC-filtered via canAccessDoc() from business-rbac.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  VAULT_FOLDERS,
  VAULT_DOCUMENTS,
  type VaultFolder,
  type VaultDocument,
} from '@/data/mock-business-home';
import { canAccessDoc, type BusinessRoleLens, type DocAccessTag } from '@/utils/business-rbac';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'folders' | 'documents';

const ACCENT = '#3B82F6';

const ACCESS_TO_TAG: Record<VaultFolder['accessLevel'], DocAccessTag> = {
  public: 'public',
  investor: 'retail',
  board: 'board',
  founder_only: 'founder_only',
};

const DOC_ACCESS_TO_TAG: Record<VaultDocument['accessLevel'], DocAccessTag> = {
  public: 'public',
  investor: 'retail',
  board: 'board',
  founder_only: 'founder_only',
};

const TYPE_ICONS: Record<VaultDocument['type'], string> = {
  pdf: 'doc.text.fill',
  doc: 'doc.fill',
  spreadsheet: 'tablecells.fill',
  deck: 'doc.richtext.fill',
};

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
  role: BusinessRoleLens;
}

export function BizDataRoomSheet({ visible, onClose, colors, role }: Props) {
  const [stage, setStage] = useState<Stage>('folders');
  const [selectedFolder, setSelectedFolder] = useState<VaultFolder | null>(null);

  const handleClose = useCallback(() => { setStage('folders'); setSelectedFolder(null); onClose(); }, [onClose]);
  const handleBack = useCallback(() => { setStage('folders'); setSelectedFolder(null); }, []);
  const handleSelectFolder = useCallback((folder: VaultFolder) => { setSelectedFolder(folder); setStage('documents'); }, []);

  const visibleFolders = useMemo(() => VAULT_FOLDERS.filter((f) => canAccessDoc(ACCESS_TO_TAG[f.accessLevel], role)), [role]);
  const visibleDocs = useMemo(() => {
    if (!selectedFolder) return [];
    return VAULT_DOCUMENTS.filter((d) => d.folderId === selectedFolder.id && canAccessDoc(DOC_ACCESS_TO_TAG[d.accessLevel], role));
  }, [selectedFolder, role]);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Data Room" useModal>
      {stage === 'folders' && (
        <View style={styles.container}>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>FOLDERS</Text>
          {visibleFolders.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No folders available for your access level.</Text>
          )}
          {visibleFolders.map((folder) => (
            <Pressable key={folder.id} style={[styles.folderRow, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => handleSelectFolder(folder)}>
              <IconSymbol name="folder.fill" size={22} color={ACCENT} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.folderName, { color: colors.text }]}>{folder.name}</Text>
                <Text style={[styles.folderMeta, { color: colors.textSecondary }]}>{folder.documentCount} docs · Updated {folder.lastUpdated}</Text>
              </View>
              <View style={[styles.accessBadge, { backgroundColor: ACCENT + '22' }]}>
                <Text style={[styles.accessText, { color: ACCENT }]}>{folder.accessLevel.replace('_', ' ').toUpperCase()}</Text>
              </View>
              <IconSymbol name="chevron.right" size={14} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>
      )}
      {stage === 'documents' && selectedFolder && (
        <View style={styles.container}>
          <Pressable style={styles.backBar} onPress={handleBack}>
            <IconSymbol name="chevron.left" size={14} color={ACCENT} />
            <Text style={[styles.backText, { color: ACCENT }]}>Folders</Text>
          </Pressable>
          <Text style={[styles.folderTitle, { color: colors.text }]}>{selectedFolder.name}</Text>
          {visibleDocs.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No documents available in this folder.</Text>
          )}
          {visibleDocs.map((doc) => (
            <Pressable key={doc.id} style={[styles.docRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <IconSymbol name={TYPE_ICONS[doc.type] as any} size={20} color={ACCENT} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.docTitle, { color: colors.text }]}>{doc.name}</Text>
                <Text style={[styles.docMeta, { color: colors.textSecondary }]}>{doc.type.toUpperCase()} · {doc.size} · v{doc.version}</Text>
              </View>
              <IconSymbol name="arrow.down.circle" size={16} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  emptyText: { fontSize: 13, fontStyle: 'italic' },
  folderRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth, gap: 6 },
  folderName: { fontSize: 14, fontWeight: '700' },
  folderMeta: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  folderTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  accessBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  accessText: { fontSize: 9, fontWeight: '700' },
  backBar: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
  backText: { fontSize: 13, fontWeight: '600' },
  docRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth },
  docTitle: { fontSize: 14, fontWeight: '600' },
  docMeta: { fontSize: 11, fontWeight: '500', marginTop: 2 },
});
```

---

## Business Invest Sheet (`components/commerce/biz-invest-sheet.tsx`)

> Full 4-stage SAFE investment flow: overview, tier_select, confirm, receipt.

See `services/player-pool/` MEMORY for architecture context. Full source (359 lines):

```typescript
/**
 * Business Invest Bottom Sheet
 *
 * 4-stage: overview → tier_select → confirm → receipt.
 * SAFE investment flow with payment chain.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  CURRENT_ROUND, INVEST_TIERS, SAFE_TERMS, buildInvestChain, type InvestTier,
} from '@/data/mock-business-home';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'overview' | 'tier_select' | 'confirm' | 'receipt';
const ACCENT = '#10B981';

interface Props { visible: boolean; onClose: () => void; colors: Record<string, string>; }

export function BizInvestSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('overview');
  const [selectedTier, setSelectedTier] = useState<InvestTier | null>(null);
  const [investorName, setInvestorName] = useState('');
  const [isAccredited, setIsAccredited] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [receipt, setReceipt] = useState<ReturnType<typeof buildInvestChain> | null>(null);

  const handleClose = useCallback(() => {
    setStage('overview'); setSelectedTier(null); setInvestorName('');
    setIsAccredited(false); setTermsAccepted(false); setReceipt(null); onClose();
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    if (!selectedTier) return;
    const chain = buildInvestChain(selectedTier.amount, selectedTier.label);
    setReceipt(chain); setStage('receipt');
  }, [selectedTier]);

  const canConfirm = isAccredited && termsAccepted && investorName.trim().length > 0;
  const progressPct = Math.min(100, (CURRENT_ROUND.raised / CURRENT_ROUND.target) * 100);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Invest" useModal>
      {stage === 'overview' && (
        <View style={styles.container}>
          <View style={[styles.roundCard, { backgroundColor: ACCENT + '12', borderColor: ACCENT + '33' }]}>
            <Text style={[styles.roundName, { color: colors.text }]}>{CURRENT_ROUND.name}</Text>
            <Text style={[styles.roundInstrument, { color: ACCENT }]}>{CURRENT_ROUND.instrument}</Text>
            <View style={styles.progressRow}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>${(CURRENT_ROUND.raised / 1_000).toFixed(0)}K raised</Text>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>${(CURRENT_ROUND.target / 1_000_000).toFixed(0)}M target</Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: ACCENT }]} />
            </View>
            <View style={styles.termsGrid}>
              <TermRow label="Valuation Cap" value={SAFE_TERMS.cap} colors={colors} />
              <TermRow label="Discount" value={SAFE_TERMS.discount} colors={colors} />
              <TermRow label="MFN" value={SAFE_TERMS.mfn ? 'Yes' : 'No'} colors={colors} />
              <TermRow label="Pro-Rata" value={SAFE_TERMS.proRata ? 'Yes' : 'No'} colors={colors} />
            </View>
          </View>
          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={() => setStage('tier_select')}>
            <Text style={styles.ctaButtonText}>Select Investment Tier</Text>
          </Pressable>
        </View>
      )}

      {stage === 'tier_select' && (
        <View style={styles.container}>
          <Pressable style={styles.backBar} onPress={() => setStage('overview')}>
            <IconSymbol name="chevron.left" size={14} color={ACCENT} />
            <Text style={[styles.backText, { color: ACCENT }]}>Overview</Text>
          </Pressable>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>SELECT TIER</Text>
          {INVEST_TIERS.map((tier) => (
            <Pressable key={tier.id} style={[styles.tierRow, { backgroundColor: colors.card, borderColor: colors.border }, selectedTier?.id === tier.id && { borderColor: ACCENT, backgroundColor: ACCENT + '12' }]} onPress={() => setSelectedTier(tier)}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tierLabel, { color: colors.text }]}>{tier.label}</Text>
                <Text style={[styles.tierDesc, { color: colors.textSecondary }]}>{tier.description}</Text>
              </View>
              {selectedTier?.id === tier.id && <IconSymbol name="checkmark.circle.fill" size={22} color={ACCENT} />}
            </Pressable>
          ))}
          <Pressable style={[styles.ctaButton, { backgroundColor: selectedTier ? ACCENT : colors.border }]} onPress={() => selectedTier && setStage('confirm')} disabled={!selectedTier}>
            <Text style={[styles.ctaButtonText, { color: selectedTier ? '#fff' : colors.textTertiary }]}>Continue</Text>
          </Pressable>
        </View>
      )}

      {stage === 'confirm' && selectedTier && (
        <View style={styles.container}>
          <Pressable style={styles.backBar} onPress={() => setStage('tier_select')}>
            <IconSymbol name="chevron.left" size={14} color={ACCENT} />
            <Text style={[styles.backText, { color: ACCENT }]}>Tiers</Text>
          </Pressable>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM INVESTMENT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedTier.label} — {selectedTier.description}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${selectedTier.amount.toLocaleString()}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Instrument</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{SAFE_TERMS.instrument}</Text>
            </View>
          </View>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>INVESTOR NAME</Text>
          <TextInput style={[styles.input, { borderColor: colors.border, color: colors.text }]} placeholder="Full legal name" placeholderTextColor={colors.textTertiary} value={investorName} onChangeText={setInvestorName} />
          <Pressable style={styles.checkRow} onPress={() => setIsAccredited(!isAccredited)}>
            <View style={[styles.checkbox, { borderColor: colors.border }, isAccredited && { backgroundColor: ACCENT, borderColor: ACCENT }]}>
              {isAccredited && <IconSymbol name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={[styles.checkLabel, { color: colors.text }]}>I am an accredited investor as defined by SEC Rule 501</Text>
          </Pressable>
          <Pressable style={styles.checkRow} onPress={() => setTermsAccepted(!termsAccepted)}>
            <View style={[styles.checkbox, { borderColor: colors.border }, termsAccepted && { backgroundColor: ACCENT, borderColor: ACCENT }]}>
              {termsAccepted && <IconSymbol name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={[styles.checkLabel, { color: colors.text }]}>I have read and accept the SAFE terms and conditions</Text>
          </Pressable>
          <View style={[styles.disclaimerBox, { backgroundColor: '#F59E0B15' }]}>
            <Text style={[styles.disclaimerText, { color: '#F59E0B' }]}>{SAFE_TERMS.regDDisclaimer}</Text>
          </View>
          <Pressable style={[styles.ctaButton, { backgroundColor: canConfirm ? ACCENT : colors.border }]} onPress={handleConfirm} disabled={!canConfirm}>
            <Text style={[styles.ctaButtonText, { color: canConfirm ? '#fff' : colors.textTertiary }]}>Invest ${selectedTier.amount.toLocaleString()}</Text>
          </Pressable>
        </View>
      )}

      {stage === 'receipt' && receipt && selectedTier && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}><Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text><Text style={[styles.confirmValue, { color: colors.text }]}>{receipt.transactionId}</Text></View>
            <View style={styles.confirmRow}><Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Instrument</Text><Text style={[styles.confirmValue, { color: colors.text }]}>{SAFE_TERMS.instrument}</Text></View>
            <View style={styles.confirmRow}><Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text><Text style={[styles.amountText, { color: colors.text }]}>${receipt.amount.toLocaleString()}</Text></View>
            <View style={styles.confirmRow}><Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Cap</Text><Text style={[styles.confirmValue, { color: colors.text }]}>{SAFE_TERMS.cap}</Text></View>
            <View style={styles.confirmRow}><Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text><Text style={[styles.statusText, { color: ACCENT }]}>Settled</Text></View>
          </View>
          <View style={[styles.chainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT CHAIN</Text>
            {receipt.chain.map((step, i) => (
              <View key={i} style={styles.chainRow}>
                <View style={[styles.chainDot, { backgroundColor: ACCENT }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainStage, { color: colors.text }]}>{step.stage}</Text>
                  <Text style={[styles.chainDetail, { color: colors.textSecondary }]}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>
          <View style={[styles.disclaimerBox, { backgroundColor: '#F59E0B15' }]}>
            <Text style={[styles.disclaimerText, { color: '#F59E0B' }]}>Securities offered under Regulation D Rule 506(b). Not a public offering.</Text>
          </View>
          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={handleClose}>
            <Text style={styles.ctaButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

function TermRow({ label, value, colors }: { label: string; value: string; colors: Record<string, string> }) {
  return (
    <View style={styles.termRow}>
      <Text style={[styles.termLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.termValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  roundCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, gap: 10 },
  roundName: { fontSize: 18, fontWeight: '800' },
  roundInstrument: { fontSize: 13, fontWeight: '700' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 11, fontWeight: '600' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  termsGrid: { gap: 6, marginTop: 4 },
  termRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  termLabel: { fontSize: 12, fontWeight: '500' },
  termValue: { fontSize: 12, fontWeight: '700' },
  backBar: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
  backText: { fontSize: 13, fontWeight: '600' },
  tierRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: BorderRadius.md, borderWidth: 1 },
  tierLabel: { fontSize: 16, fontWeight: '800' },
  tierDesc: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  confirmCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 10 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmLabel: { fontSize: 13, fontWeight: '500' },
  confirmValue: { fontSize: 13, fontWeight: '700' },
  amountText: { fontSize: 24, fontWeight: '800' },
  statusText: { fontSize: 13, fontWeight: '700' },
  input: { borderWidth: 1, borderRadius: BorderRadius.md, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkLabel: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 18 },
  disclaimerBox: { borderRadius: BorderRadius.md, padding: Spacing.sm },
  disclaimerText: { fontSize: 11, fontWeight: '600', textAlign: 'center', lineHeight: 16 },
  ctaButton: { paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  ctaButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  chainCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 8 },
  chainRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  chainDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  chainStage: { fontSize: 12, fontWeight: '700' },
  chainDetail: { fontSize: 11, fontWeight: '500', marginTop: 1 },
});
```

---

## Tickets Sheet (`components/commerce/tickets-sheet.tsx`)

```typescript
/**
 * Tickets Bottom Sheet
 *
 * Browse upcoming home games → select seat tier → confirm → receipt.
 * State machine: browse | confirm | receipt
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { FMU_GAMES, type FMUGame } from '@/data/fmu';
import { SEAT_TIERS, buildCommerceChain, type SeatTier, type PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'browse' | 'confirm' | 'receipt';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

export function TicketsSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<FMUGame | null>(null);
  const [selectedTier, setSelectedTier] = useState<SeatTier | null>(null);
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const upcomingHomeGames = FMU_GAMES.filter(g => g.location === 'Home' && g.status === 'upcoming');

  const handleClose = useCallback(() => {
    setStage('browse');
    setExpandedGameId(null);
    setSelectedGame(null);
    setSelectedTier(null);
    setChain(null);
    onClose();
  }, [onClose]);

  const handleSelectTier = useCallback((game: FMUGame, tier: SeatTier) => {
    setSelectedGame(game);
    setSelectedTier(tier);
    setStage('confirm');
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedGame || !selectedTier) return;
    const result = buildCommerceChain(
      'Ticket Purchase',
      selectedTier.price,
      `${selectedTier.label} — vs ${selectedGame.opponent}`,
      'TKT',
    );
    setChain(result);
    setStage('receipt');
  }, [selectedGame, selectedTier]);

  const handleBack = useCallback(() => {
    setStage('browse');
    setSelectedGame(null);
    setSelectedTier(null);
  }, []);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Tickets" useModal>
      {stage === 'browse' && (
        <View style={styles.container}>
          {upcomingHomeGames.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No upcoming home games.</Text>
          )}
          {upcomingHomeGames.map(game => {
            const expanded = expandedGameId === game.id;
            return (
              <View key={game.id} style={[styles.gameCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Pressable onPress={() => setExpandedGameId(expanded ? null : game.id)}>
                  <Text style={[styles.gameOpponent, { color: colors.text }]}>vs {game.opponent}</Text>
                  <Text style={[styles.gameMeta, { color: colors.textSecondary }]}>
                    {game.date}{game.gameTime ? ` · ${game.gameTime}` : ''} · {game.venue ?? 'Home'}
                  </Text>
                </Pressable>

                {expanded && (
                  <View style={styles.tierList}>
                    {SEAT_TIERS.map(tier => (
                      <Pressable
                        key={tier.id}
                        style={[styles.tierRow, { borderColor: colors.border }]}
                        onPress={() => handleSelectTier(game, tier)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.tierLabel, { color: colors.text }]}>{tier.label}</Text>
                          <Text style={[styles.tierPrice, { color: colors.textSecondary }]}>${tier.price}</Text>
                        </View>
                        <View style={styles.selectBtn}>
                          <Text style={styles.selectBtnText}>Select</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {stage === 'confirm' && selectedGame && selectedTier && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM PURCHASE</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Game</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>vs {selectedGame.opponent}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Date</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedGame.date}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Seat Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedTier.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${selectedTier.price.toFixed(2)}</Text>
            </View>
          </View>

          <Pressable style={styles.ctaButton} onPress={handleConfirm}>
            <Text style={styles.ctaButtonText}>Confirm Purchase</Text>
          </Pressable>
          <Pressable style={[styles.cancelButton, { borderColor: colors.border }]} onPress={handleBack}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {stage === 'receipt' && chain && selectedGame && selectedTier && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>

            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Game</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>vs {selectedGame.opponent}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Seat Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedTier.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${chain.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statusText, { color: '#22C55E' }]}>Settled</Text>
            </View>
          </View>

          <View style={[styles.chainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT CHAIN</Text>
            {chain.chain.map((step, i) => (
              <View key={i} style={styles.chainRow}>
                <View style={[styles.chainDot, { backgroundColor: '#22C55E' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainStage, { color: colors.text }]}>{step.stage}</Text>
                  <Text style={[styles.chainDetail, { color: colors.textSecondary }]}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable style={styles.ctaButton} onPress={handleClose}>
            <Text style={styles.ctaButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },

  // Game cards
  gameCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
  gameOpponent: {
    fontSize: 15,
    fontWeight: '700',
  },
  gameMeta: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },

  // Tier selection
  tierList: {
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  tierLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  tierPrice: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  selectBtn: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  selectBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Confirm / Receipt
  confirmCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  confirmValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  amountText: {
    fontSize: 24,
    fontWeight: '800',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // CTA
  ctaButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelButton: {
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Payment chain
  chainCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 8,
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  chainDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  chainStage: {
    fontSize: 12,
    fontWeight: '700',
  },
  chainDetail: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
});

```

---

## Store Sheet (`components/commerce/store-sheet.tsx`)

```typescript
/**
 * Store Bottom Sheet
 *
 * 2×2 product grid → add to cart → checkout → receipt.
 * State machine: browse | confirm | receipt
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { STORE_PRODUCTS, buildCommerceChain, type CartItem, type PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'browse' | 'confirm' | 'receipt';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

export function StoreSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleClose = useCallback(() => {
    setStage('browse');
    setCart([]);
    setSelectedSizes({});
    setChain(null);
    onClose();
  }, [onClose]);

  const handleSizeSelect = useCallback((productId: string, size: string) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  }, []);

  const handleAddToCart = useCallback((productId: string) => {
    const product = STORE_PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    const size = product.sizes ? (selectedSizes[productId] || product.sizes[0]) : 'One Size';

    setCart(prev => {
      const existing = prev.find(c => c.productId === productId && c.size === size);
      if (existing) {
        return prev.map(c =>
          c.productId === productId && c.size === size
            ? { ...c, qty: c.qty + 1 }
            : c,
        );
      }
      return [...prev, { productId, name: product.name, price: product.price, size, qty: 1 }];
    });
  }, [selectedSizes]);

  const handleCheckout = useCallback(() => {
    setStage('confirm');
  }, []);

  const handleConfirm = useCallback(() => {
    const desc = cart.map(c => `${c.name} (${c.size})${c.qty > 1 ? ` ×${c.qty}` : ''}`).join(', ');
    const result = buildCommerceChain('Merchandise Purchase', cartTotal, desc, 'MRC');
    setChain(result);
    setStage('receipt');
  }, [cart, cartTotal]);

  const handleBack = useCallback(() => {
    setStage('browse');
  }, []);

  const cartFooter = stage === 'browse' && cartCount > 0 ? (
    <Pressable style={styles.cartFooterBtn} onPress={handleCheckout}>
      <Text style={styles.cartFooterText}>
        Checkout · {cartCount} item{cartCount > 1 ? 's' : ''} · ${cartTotal.toFixed(2)}
      </Text>
    </Pressable>
  ) : undefined;

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Team Store" footer={cartFooter} useModal>
      {stage === 'browse' && (
        <View style={styles.grid}>
          {STORE_PRODUCTS.map(product => {
            const activeSize = product.sizes
              ? (selectedSizes[product.id] || product.sizes[0])
              : 'One Size';
            return (
              <View key={product.id} style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
                <Text style={[styles.productPrice, { color: colors.textSecondary }]}>${product.price.toFixed(2)}</Text>

                {/* Size selector */}
                <View style={styles.sizeRow}>
                  {product.sizes ? product.sizes.map(size => (
                    <Pressable
                      key={size}
                      style={[
                        styles.sizePill,
                        { borderColor: colors.border },
                        activeSize === size && styles.sizePillActive,
                      ]}
                      onPress={() => handleSizeSelect(product.id, size)}
                    >
                      <Text style={[
                        styles.sizePillText,
                        { color: colors.textSecondary },
                        activeSize === size && styles.sizePillTextActive,
                      ]}>
                        {size}
                      </Text>
                    </Pressable>
                  )) : (
                    <Text style={[styles.oneSizeText, { color: colors.textTertiary }]}>One Size</Text>
                  )}
                </View>

                <Pressable
                  style={styles.addBtn}
                  onPress={() => handleAddToCart(product.id)}
                >
                  <Text style={styles.addBtnText}>Add to Cart</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      {stage === 'confirm' && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>ORDER SUMMARY</Text>
            {cart.map((item, i) => (
              <View key={i} style={styles.confirmRow}>
                <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>
                  {item.name} · {item.size}{item.qty > 1 ? ` ×${item.qty}` : ''}
                </Text>
                <Text style={[styles.confirmValue, { color: colors.text }]}>${(item.price * item.qty).toFixed(2)}</Text>
              </View>
            ))}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Total</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${cartTotal.toFixed(2)}</Text>
            </View>
          </View>

          <Pressable style={styles.ctaButton} onPress={handleConfirm}>
            <Text style={styles.ctaButtonText}>Confirm Purchase</Text>
          </Pressable>
          <Pressable style={[styles.cancelButton, { borderColor: colors.border }]} onPress={handleBack}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {stage === 'receipt' && chain && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            {cart.map((item, i) => (
              <View key={i} style={styles.confirmRow}>
                <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>
                  {item.name} · {item.size}{item.qty > 1 ? ` ×${item.qty}` : ''}
                </Text>
                <Text style={[styles.confirmValue, { color: colors.text }]}>${(item.price * item.qty).toFixed(2)}</Text>
              </View>
            ))}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Total</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${chain.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statusText, { color: '#22C55E' }]}>Settled</Text>
            </View>
          </View>

          <View style={[styles.chainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT CHAIN</Text>
            {chain.chain.map((step, i) => (
              <View key={i} style={styles.chainRow}>
                <View style={[styles.chainDot, { backgroundColor: '#22C55E' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainStage, { color: colors.text }]}>{step.stage}</Text>
                  <Text style={[styles.chainDetail, { color: colors.textSecondary }]}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable style={styles.ctaButton} onPress={handleClose}>
            <Text style={styles.ctaButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },

  // Product grid (2×2)
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  productCard: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.sm,
    gap: 6,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Size selector
  sizeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  sizePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  sizePillActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  sizePillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sizePillTextActive: {
    color: '#fff',
  },
  oneSizeText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Add to cart
  addBtn: {
    backgroundColor: '#1E40AF',
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Cart footer
  cartFooterBtn: {
    flex: 1,
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cartFooterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Confirm / Receipt shared
  confirmCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmLabel: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  confirmValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  amountText: {
    fontSize: 24,
    fontWeight: '800',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },

  // CTA / Cancel
  ctaButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelButton: {
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Payment chain
  chainCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 8,
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  chainDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  chainStage: {
    fontSize: 12,
    fontWeight: '700',
  },
  chainDetail: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
});

```

---

## Support Sheet (`components/commerce/support-sheet.tsx`)

```typescript
/**
 * Support Bottom Sheet
 *
 * Three giving tiers + custom amount + one-time/recurring toggle → confirm → receipt.
 * State machine: browse | confirm | receipt
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { SUPPORT_TIERS, buildCommerceChain, type SupportTier, type PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'browse' | 'confirm' | 'receipt';
type Frequency = 'one-time' | 'recurring';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

export function SupportSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [selectedTier, setSelectedTier] = useState<SupportTier | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('one-time');
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const effectiveAmount = selectedTier
    ? selectedTier.amount
    : parseFloat(customAmount) || 0;

  const effectiveLabel = selectedTier
    ? `${selectedTier.label} — ${selectedTier.description}`
    : 'Custom Donation';

  const handleClose = useCallback(() => {
    setStage('browse');
    setSelectedTier(null);
    setCustomAmount('');
    setFrequency('one-time');
    setChain(null);
    onClose();
  }, [onClose]);

  const handleSelectTier = useCallback((tier: SupportTier) => {
    setSelectedTier(tier);
    setCustomAmount('');
  }, []);

  const handleCustomFocus = useCallback(() => {
    setSelectedTier(null);
  }, []);

  const handleGive = useCallback(() => {
    if (effectiveAmount <= 0) return;
    setStage('confirm');
  }, [effectiveAmount]);

  const handleConfirm = useCallback(() => {
    const desc = `${effectiveLabel} (${frequency})`;
    const result = buildCommerceChain('Donation', effectiveAmount, desc, 'DON');
    setChain(result);
    setStage('receipt');
  }, [effectiveAmount, effectiveLabel, frequency]);

  const handleBack = useCallback(() => {
    setStage('browse');
  }, []);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Support FMU Lions" useModal>
      {stage === 'browse' && (
        <View style={styles.container}>
          {/* Tiers */}
          {SUPPORT_TIERS.map(tier => {
            const isActive = selectedTier?.id === tier.id;
            return (
              <Pressable
                key={tier.id}
                style={[
                  styles.tierCard,
                  { backgroundColor: colors.card, borderColor: isActive ? '#1E40AF' : colors.border },
                  isActive && styles.tierCardActive,
                ]}
                onPress={() => handleSelectTier(tier)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tierLabel, { color: colors.text }]}>{tier.label}</Text>
                  <Text style={[styles.tierDesc, { color: colors.textSecondary }]}>{tier.description}</Text>
                </View>
                <Text style={[styles.tierAmount, { color: colors.text }]}>${tier.amount}</Text>
              </Pressable>
            );
          })}

          {/* Custom amount */}
          <View style={[styles.customRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.dollarSign, { color: colors.textSecondary }]}>$</Text>
            <TextInput
              style={[styles.customInput, { color: colors.text }]}
              placeholder="Custom amount"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              value={customAmount}
              onChangeText={setCustomAmount}
              onFocus={handleCustomFocus}
            />
          </View>

          {/* Frequency toggle */}
          <View style={[styles.freqRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable
              style={[
                styles.freqPill,
                frequency === 'one-time' && styles.freqPillActive,
              ]}
              onPress={() => setFrequency('one-time')}
            >
              <Text style={[
                styles.freqPillText,
                { color: frequency === 'one-time' ? '#fff' : colors.textSecondary },
              ]}>
                One-Time
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.freqPill,
                frequency === 'recurring' && styles.freqPillActive,
              ]}
              onPress={() => setFrequency('recurring')}
            >
              <Text style={[
                styles.freqPillText,
                { color: frequency === 'recurring' ? '#fff' : colors.textSecondary },
              ]}>
                Recurring
              </Text>
            </Pressable>
          </View>

          {/* Give button */}
          <Pressable
            style={[styles.ctaButton, effectiveAmount <= 0 && styles.ctaDisabled]}
            onPress={handleGive}
            disabled={effectiveAmount <= 0}
          >
            <Text style={styles.ctaButtonText}>
              {effectiveAmount > 0 ? `Give $${effectiveAmount.toFixed(2)}` : 'Give Now'}
            </Text>
          </Pressable>
        </View>
      )}

      {stage === 'confirm' && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM DONATION</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{effectiveLabel}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Frequency</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>
                {frequency === 'one-time' ? 'One-Time' : 'Monthly Recurring'}
              </Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${effectiveAmount.toFixed(2)}</Text>
            </View>
          </View>

          <Pressable style={styles.ctaButton} onPress={handleConfirm}>
            <Text style={styles.ctaButtonText}>Confirm Donation</Text>
          </Pressable>
          <Pressable style={[styles.cancelButton, { borderColor: colors.border }]} onPress={handleBack}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {stage === 'receipt' && chain && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{effectiveLabel}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Frequency</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>
                {frequency === 'one-time' ? 'One-Time' : 'Monthly Recurring'}
              </Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${chain.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statusText, { color: '#22C55E' }]}>Settled</Text>
            </View>
          </View>

          <Text style={[styles.donorNote, { color: colors.textTertiary }]}>
            Donor linked to Booster/NIL Collective
          </Text>

          <View style={[styles.chainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT CHAIN</Text>
            {chain.chain.map((step, i) => (
              <View key={i} style={styles.chainRow}>
                <View style={[styles.chainDot, { backgroundColor: '#22C55E' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainStage, { color: colors.text }]}>{step.stage}</Text>
                  <Text style={[styles.chainDetail, { color: colors.textSecondary }]}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable style={styles.ctaButton} onPress={handleClose}>
            <Text style={styles.ctaButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },

  // Tier cards
  tierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
  tierCardActive: {
    borderWidth: 2,
  },
  tierLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  tierDesc: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  tierAmount: {
    fontSize: 20,
    fontWeight: '800',
  },

  // Custom amount
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  dollarSign: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 6,
  },
  customInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 4,
  },

  // Frequency toggle
  freqRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  freqPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  freqPillActive: {
    backgroundColor: '#1E40AF',
  },
  freqPillText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // CTA
  ctaButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelButton: {
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Confirm / Receipt
  confirmCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  confirmValue: {
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  amountText: {
    fontSize: 24,
    fontWeight: '800',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  donorNote: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Payment chain
  chainCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 8,
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  chainDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  chainStage: {
    fontSize: 12,
    fontWeight: '700',
  },
  chainDetail: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
});

```

---

## Competition Tickets Sheet (`components/commerce/comp-tickets-sheet.tsx`)

```typescript
/**
 * Competition Tickets Bottom Sheet
 *
 * Browse upcoming races -> select seat tier -> confirm -> receipt.
 * State machine: browse | confirm | receipt
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { RACE_ROUNDS, type RaceRound } from '@/data/mock-competition-home';
import { COMP_SEAT_TIERS, buildCompCommerceChain, type CompSeatTier } from '@/data/comp-commerce-data';
import type { PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'browse' | 'confirm' | 'receipt';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

export function CompTicketsSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [expandedRaceId, setExpandedRaceId] = useState<string | null>(null);
  const [selectedRace, setSelectedRace] = useState<RaceRound | null>(null);
  const [selectedTier, setSelectedTier] = useState<CompSeatTier | null>(null);
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const upcomingRaces = RACE_ROUNDS.filter((r) => r.status !== 'completed');

  const handleClose = useCallback(() => {
    setStage('browse');
    setExpandedRaceId(null);
    setSelectedRace(null);
    setSelectedTier(null);
    setChain(null);
    onClose();
  }, [onClose]);

  const handleSelectTier = useCallback((race: RaceRound, tier: CompSeatTier) => {
    setSelectedRace(race);
    setSelectedTier(tier);
    setStage('confirm');
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedRace || !selectedTier) return;
    const result = buildCompCommerceChain(
      'Race Ticket',
      selectedTier.price,
      `${selectedTier.label} — ${selectedRace.name}`,
      'RTK',
    );
    setChain(result);
    setStage('receipt');
  }, [selectedRace, selectedTier]);

  const handleBack = useCallback(() => {
    setStage('browse');
    setSelectedRace(null);
    setSelectedTier(null);
  }, []);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Tickets" useModal>
      {stage === 'browse' && (
        <View style={styles.container}>
          {upcomingRaces.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No upcoming races.</Text>
          )}
          {upcomingRaces.map((race) => {
            const expanded = expandedRaceId === race.id;
            return (
              <View key={race.id} style={[styles.raceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Pressable onPress={() => setExpandedRaceId(expanded ? null : race.id)}>
                  <Text style={[styles.raceName, { color: colors.text }]}>{race.name}</Text>
                  <Text style={[styles.raceMeta, { color: colors.textSecondary }]}>
                    {race.venue}, {race.city} {'\u00B7'} {race.date}
                  </Text>
                </Pressable>

                {expanded && (
                  <View style={styles.tierList}>
                    {COMP_SEAT_TIERS.map((tier) => (
                      <Pressable
                        key={tier.id}
                        style={[styles.tierRow, { borderColor: colors.border }]}
                        onPress={() => handleSelectTier(race, tier)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.tierLabel, { color: colors.text }]}>{tier.label}</Text>
                          <Text style={[styles.tierPrice, { color: colors.textSecondary }]}>${tier.price.toLocaleString()}</Text>
                        </View>
                        <View style={styles.selectBtn}>
                          <Text style={styles.selectBtnText}>Select</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {stage === 'confirm' && selectedRace && selectedTier && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM PURCHASE</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Race</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedRace.name}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Venue</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedRace.city}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Date</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedRace.date}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Seat Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedTier.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${selectedTier.price.toLocaleString()}.00</Text>
            </View>
          </View>

          <Pressable style={styles.ctaButton} onPress={handleConfirm}>
            <Text style={styles.ctaButtonText}>Confirm Purchase</Text>
          </Pressable>
          <Pressable style={[styles.cancelButton, { borderColor: colors.border }]} onPress={handleBack}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {stage === 'receipt' && chain && selectedRace && selectedTier && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Race</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedRace.name}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Seat Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedTier.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${chain.amount.toLocaleString()}.00</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statusText, { color: '#22C55E' }]}>Settled</Text>
            </View>
          </View>

          <View style={[styles.chainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT CHAIN</Text>
            {chain.chain.map((step, i) => (
              <View key={i} style={styles.chainRow}>
                <View style={[styles.chainDot, { backgroundColor: '#22C55E' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainStage, { color: colors.text }]}>{step.stage}</Text>
                  <Text style={[styles.chainDetail, { color: colors.textSecondary }]}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable style={styles.ctaButton} onPress={handleClose}>
            <Text style={styles.ctaButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: Spacing.xl },

  raceCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md },
  raceName: { fontSize: 15, fontWeight: '700' },
  raceMeta: { fontSize: 12, fontWeight: '500', marginTop: 4 },

  tierList: { marginTop: Spacing.sm, gap: Spacing.sm },
  tierRow: { flexDirection: 'row', alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderRadius: BorderRadius.md, padding: Spacing.sm },
  tierLabel: { fontSize: 14, fontWeight: '600' },
  tierPrice: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  selectBtn: { backgroundColor: '#FF5555', paddingHorizontal: 14, paddingVertical: 6, borderRadius: BorderRadius.md },
  selectBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  confirmCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 10 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmLabel: { fontSize: 13, fontWeight: '500' },
  confirmValue: { fontSize: 13, fontWeight: '700' },
  amountText: { fontSize: 24, fontWeight: '800' },
  statusText: { fontSize: 13, fontWeight: '700' },

  ctaButton: { backgroundColor: '#22C55E', paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  ctaButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelButton: { borderWidth: 1, paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  cancelButtonText: { fontSize: 15, fontWeight: '600' },

  chainCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 8 },
  chainRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  chainDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  chainStage: { fontSize: 12, fontWeight: '700' },
  chainDetail: { fontSize: 11, fontWeight: '500', marginTop: 1 },
});

```

---

## Competition Store Sheet (`components/commerce/comp-store-sheet.tsx`)

```typescript
/**
 * Competition Store Bottom Sheet
 *
 * 2x2 product grid -> cart -> confirm -> receipt.
 * State machine: browse | confirm | receipt
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { COMP_STORE_PRODUCTS, buildCompCommerceChain } from '@/data/comp-commerce-data';
import type { PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'browse' | 'confirm' | 'receipt';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

export function CompStoreSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const cartCount = useMemo(() => cart.reduce((sum, c) => sum + c.qty, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, c) => sum + c.price * c.qty, 0), [cart]);

  const handleClose = useCallback(() => {
    setStage('browse');
    setCart([]);
    setChain(null);
    onClose();
  }, [onClose]);

  const addToCart = useCallback((product: typeof COMP_STORE_PRODUCTS[number]) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id);
      if (existing) {
        return prev.map((c) => (c.productId === product.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  }, []);

  const handleCheckout = useCallback(() => {
    if (cartCount === 0) return;
    setStage('confirm');
  }, [cartCount]);

  const handleConfirm = useCallback(() => {
    const desc = cart.map((c) => `${c.name} x${c.qty}`).join(', ');
    const result = buildCompCommerceChain('Merchandise Purchase', cartTotal, desc, 'RMS');
    setChain(result);
    setStage('receipt');
  }, [cart, cartTotal]);

  const handleBack = useCallback(() => {
    setStage('browse');
  }, []);

  const cartFooter = cartCount > 0 ? (
    <View style={styles.footerContainer}>
      <Pressable style={styles.checkoutButton} onPress={handleCheckout}>
        <Text style={styles.checkoutButtonText}>
          Checkout {'\u00B7'} {cartCount} item{cartCount > 1 ? 's' : ''} {'\u00B7'} ${cartTotal.toFixed(2)}
        </Text>
      </Pressable>
    </View>
  ) : undefined;

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="K-1 Racing Store" footer={cartFooter} useModal>
      {stage === 'browse' && (
        <View style={styles.container}>
          <View style={styles.productGrid}>
            {COMP_STORE_PRODUCTS.map((product) => (
              <View key={product.id} style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
                <Text style={[styles.productPrice, { color: colors.textSecondary }]}>${product.price.toFixed(2)}</Text>
                <Pressable style={styles.addButton} onPress={() => addToCart(product)}>
                  <Text style={styles.addButtonText}>Add to Cart</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      )}

      {stage === 'confirm' && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>ORDER SUMMARY</Text>
            {cart.map((item) => (
              <View key={item.productId} style={styles.confirmRow}>
                <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>{item.name} x{item.qty}</Text>
                <Text style={[styles.confirmValue, { color: colors.text }]}>${(item.price * item.qty).toFixed(2)}</Text>
              </View>
            ))}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Total</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${cartTotal.toFixed(2)}</Text>
            </View>
          </View>

          <Pressable style={styles.ctaButton} onPress={handleConfirm}>
            <Text style={styles.ctaButtonText}>Confirm Purchase</Text>
          </Pressable>
          <Pressable style={[styles.cancelButton, { borderColor: colors.border }]} onPress={handleBack}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {stage === 'receipt' && chain && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            {cart.map((item) => (
              <View key={item.productId} style={styles.confirmRow}>
                <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>{item.name} x{item.qty}</Text>
                <Text style={[styles.confirmValue, { color: colors.text }]}>${(item.price * item.qty).toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${chain.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statusText, { color: '#22C55E' }]}>Settled</Text>
            </View>
          </View>

          <View style={[styles.chainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT CHAIN</Text>
            {chain.chain.map((step, i) => (
              <View key={i} style={styles.chainRow}>
                <View style={[styles.chainDot, { backgroundColor: '#22C55E' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainStage, { color: colors.text }]}>{step.stage}</Text>
                  <Text style={[styles.chainDetail, { color: colors.textSecondary }]}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable style={styles.ctaButton} onPress={handleClose}>
            <Text style={styles.ctaButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },

  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  productCard: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 6,
  },
  productName: { fontSize: 14, fontWeight: '700' },
  productPrice: { fontSize: 13, fontWeight: '600' },
  addButton: { backgroundColor: '#FF5555', paddingVertical: 8, borderRadius: BorderRadius.md, alignItems: 'center', marginTop: 4 },
  addButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  footerContainer: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  checkoutButton: { backgroundColor: '#22C55E', paddingVertical: 14, borderRadius: BorderRadius.md, alignItems: 'center' },
  checkoutButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  confirmCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 10 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmLabel: { fontSize: 13, fontWeight: '500' },
  confirmValue: { fontSize: 13, fontWeight: '700' },
  amountText: { fontSize: 24, fontWeight: '800' },
  statusText: { fontSize: 13, fontWeight: '700' },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 4 },

  ctaButton: { backgroundColor: '#22C55E', paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  ctaButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelButton: { borderWidth: 1, paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  cancelButtonText: { fontSize: 15, fontWeight: '600' },

  chainCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 8 },
  chainRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  chainDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  chainStage: { fontSize: 12, fontWeight: '700' },
  chainDetail: { fontSize: 11, fontWeight: '500', marginTop: 1 },
});

```

---

## Competition Paddock Sheet (`components/commerce/comp-paddock-sheet.tsx`)

```typescript
/**
 * Competition Paddock / VIP Hospitality Bottom Sheet
 *
 * Per-race / season toggle -> 3 tier cards -> confirm -> receipt.
 * State machine: browse | confirm | receipt
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { PADDOCK_TIERS, buildCompCommerceChain, type PaddockTier } from '@/data/comp-commerce-data';
import type { PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'browse' | 'confirm' | 'receipt';
type PricingMode = 'per_race' | 'season';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

export function CompPaddockSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [pricingMode, setPricingMode] = useState<PricingMode>('per_race');
  const [selectedTier, setSelectedTier] = useState<PaddockTier | null>(null);
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const getPrice = (tier: PaddockTier) =>
    pricingMode === 'per_race' ? tier.perRacePrice : tier.seasonPrice;

  const handleClose = useCallback(() => {
    setStage('browse');
    setPricingMode('per_race');
    setSelectedTier(null);
    setChain(null);
    onClose();
  }, [onClose]);

  const handleSelect = useCallback((tier: PaddockTier) => {
    setSelectedTier(tier);
    setStage('confirm');
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedTier) return;
    const price = getPrice(selectedTier);
    const typeLabel = pricingMode === 'per_race' ? 'Per Race' : 'Season Pass';
    const result = buildCompCommerceChain(
      'Paddock Pass',
      price,
      `${selectedTier.label} — ${typeLabel}`,
      'RPD',
    );
    setChain(result);
    setStage('receipt');
  }, [selectedTier, pricingMode]);

  const handleBack = useCallback(() => {
    setStage('browse');
    setSelectedTier(null);
  }, []);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="VIP & Hospitality" useModal>
      {stage === 'browse' && (
        <View style={styles.container}>
          {/* Per-Race / Season Toggle */}
          <View style={[styles.toggleBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable
              style={[styles.togglePill, pricingMode === 'per_race' && styles.togglePillActive]}
              onPress={() => setPricingMode('per_race')}
            >
              <Text style={[styles.toggleText, pricingMode === 'per_race' && styles.toggleTextActive]}>Per Race</Text>
            </Pressable>
            <Pressable
              style={[styles.togglePill, pricingMode === 'season' && styles.togglePillActive]}
              onPress={() => setPricingMode('season')}
            >
              <Text style={[styles.toggleText, pricingMode === 'season' && styles.toggleTextActive]}>Season Pass</Text>
            </Pressable>
          </View>

          {/* Tier Cards */}
          {PADDOCK_TIERS.map((tier) => (
            <Pressable
              key={tier.id}
              style={[styles.tierCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleSelect(tier)}
            >
              <Text style={[styles.tierLabel, { color: colors.text }]}>{tier.label}</Text>
              <Text style={[styles.tierDescription, { color: colors.textSecondary }]}>{tier.description}</Text>
              <Text style={[styles.tierPrice, { color: '#FF5555' }]}>
                ${getPrice(tier).toLocaleString()}
                {pricingMode === 'per_race' ? ' / race' : ' / season'}
              </Text>
            </Pressable>
          ))}

          <Text style={[styles.footerNote, { color: colors.textTertiary }]}>
            Pass holders are linked to their organization role for exclusive access.
          </Text>
        </View>
      )}

      {stage === 'confirm' && selectedTier && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM PURCHASE</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedTier.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Type</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>
                {pricingMode === 'per_race' ? 'Per Race' : 'Season Pass'}
              </Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${getPrice(selectedTier).toLocaleString()}.00</Text>
            </View>
          </View>

          <Pressable style={styles.ctaButton} onPress={handleConfirm}>
            <Text style={styles.ctaButtonText}>Confirm Purchase</Text>
          </Pressable>
          <Pressable style={[styles.cancelButton, { borderColor: colors.border }]} onPress={handleBack}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {stage === 'receipt' && chain && selectedTier && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedTier.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Type</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>
                {pricingMode === 'per_race' ? 'Per Race' : 'Season Pass'}
              </Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${chain.amount.toLocaleString()}.00</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statusText, { color: '#22C55E' }]}>Settled</Text>
            </View>
          </View>

          <Text style={[styles.linkedNote, { color: colors.textTertiary }]}>
            Pass holder linked to organization role for paddock access.
          </Text>

          <View style={[styles.chainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT CHAIN</Text>
            {chain.chain.map((step, i) => (
              <View key={i} style={styles.chainRow}>
                <View style={[styles.chainDot, { backgroundColor: '#22C55E' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainStage, { color: colors.text }]}>{step.stage}</Text>
                  <Text style={[styles.chainDetail, { color: colors.textSecondary }]}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable style={styles.ctaButton} onPress={handleClose}>
            <Text style={styles.ctaButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },

  toggleBar: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 4,
  },
  togglePill: { flex: 1, paddingVertical: 8, borderRadius: BorderRadius.md, alignItems: 'center' },
  togglePillActive: { backgroundColor: '#FF5555' },
  toggleText: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
  toggleTextActive: { color: '#fff' },

  tierCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 4,
  },
  tierLabel: { fontSize: 16, fontWeight: '700' },
  tierDescription: { fontSize: 12, fontWeight: '500' },
  tierPrice: { fontSize: 18, fontWeight: '800', marginTop: 4 },

  footerNote: { fontSize: 11, fontStyle: 'italic', textAlign: 'center', paddingHorizontal: Spacing.md },
  linkedNote: { fontSize: 11, fontStyle: 'italic', textAlign: 'center' },

  confirmCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 10 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmLabel: { fontSize: 13, fontWeight: '500' },
  confirmValue: { fontSize: 13, fontWeight: '700' },
  amountText: { fontSize: 24, fontWeight: '800' },
  statusText: { fontSize: 13, fontWeight: '700' },

  ctaButton: { backgroundColor: '#22C55E', paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  ctaButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelButton: { borderWidth: 1, paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  cancelButtonText: { fontSize: 15, fontWeight: '600' },

  chainCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 8 },
  chainRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  chainDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  chainStage: { fontSize: 12, fontWeight: '700' },
  chainDetail: { fontSize: 11, fontWeight: '500', marginTop: 1 },
});

```

---

## Education Apply Sheet (`components/commerce/edu-apply-sheet.tsx`)

```typescript
/**
 * Education Apply Bottom Sheet
 *
 * 3-stage: browse application types → confirm → receipt with payment chain.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import {
  APPLICATION_TYPES,
  buildEduCommerceChain,
  type ApplicationType,
} from '@/data/edu-commerce-data';
import type { PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'browse' | 'confirm' | 'receipt';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

const ACCENT = '#14B8A6';

export function EduApplySheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [selected, setSelected] = useState<ApplicationType | null>(null);
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const handleClose = useCallback(() => {
    setStage('browse');
    setSelected(null);
    setChain(null);
    onClose();
  }, [onClose]);

  const handleSelect = useCallback((app: ApplicationType) => {
    setSelected(app);
    setStage('confirm');
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selected) return;
    const result = buildEduCommerceChain(
      'Application Fee',
      selected.fee,
      `${selected.label} Application`,
      'APP',
    );
    setChain(result);
    setStage('receipt');
  }, [selected]);

  const handleBack = useCallback(() => {
    setStage('browse');
    setSelected(null);
  }, []);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Apply to FMU" useModal>
      {stage === 'browse' && (
        <View style={styles.container}>
          {APPLICATION_TYPES.map((app) => (
            <View key={app.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardLabel, { color: colors.text }]}>{app.label}</Text>
                <Text style={[styles.cardFee, { color: ACCENT }]}>${app.fee}</Text>
              </View>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{app.description}</Text>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Deadline: {app.deadline}</Text>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Requirements: {app.requirements}</Text>
              <Pressable style={[styles.selectBtn, { backgroundColor: ACCENT }]} onPress={() => handleSelect(app)}>
                <Text style={styles.selectBtnText}>Select</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {stage === 'confirm' && selected && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM APPLICATION</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Type</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selected.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Deadline</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selected.deadline}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Application Fee</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${selected.fee.toFixed(2)}</Text>
            </View>
          </View>

          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={handleConfirm}>
            <Text style={styles.ctaButtonText}>Submit & Pay</Text>
          </Pressable>
          <Pressable style={[styles.cancelButton, { borderColor: colors.border }]} onPress={handleBack}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Back</Text>
          </Pressable>
        </View>
      )}

      {stage === 'receipt' && chain && selected && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Type</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selected.label} Application</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${chain.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statusText, { color: '#22C55E' }]}>Settled</Text>
            </View>
          </View>

          <View style={[styles.chainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT CHAIN</Text>
            {chain.chain.map((step, i) => (
              <View key={i} style={styles.chainRow}>
                <View style={[styles.chainDot, { backgroundColor: '#22C55E' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainStage, { color: colors.text }]}>{step.stage}</Text>
                  <Text style={[styles.chainDetail, { color: colors.textSecondary }]}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={handleClose}>
            <Text style={styles.ctaButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },

  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: { fontSize: 15, fontWeight: '700' },
  cardFee: { fontSize: 15, fontWeight: '800' },
  cardDesc: { fontSize: 12, fontWeight: '500' },
  cardMeta: { fontSize: 11, fontWeight: '500' },
  selectBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    marginTop: 4,
  },
  selectBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  confirmCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 10,
  },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmLabel: { fontSize: 13, fontWeight: '500' },
  confirmValue: { fontSize: 13, fontWeight: '700' },
  amountText: { fontSize: 24, fontWeight: '800' },
  statusText: { fontSize: 13, fontWeight: '700' },

  ctaButton: { paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  ctaButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelButton: { borderWidth: 1, paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  cancelButtonText: { fontSize: 15, fontWeight: '600' },

  chainCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 8,
  },
  chainRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  chainDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  chainStage: { fontSize: 12, fontWeight: '700' },
  chainDetail: { fontSize: 11, fontWeight: '500', marginTop: 1 },
});

```

---

## Education Catalog Sheet (`components/commerce/edu-catalog-sheet.tsx`)

```typescript
/**
 * Education Catalog Bottom Sheet
 *
 * Browse-only: school pills → programs list → expandable program detail.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { CATALOG_SCHOOLS, type CatalogSchool } from '@/data/edu-commerce-data';
import { ACADEMIC_PROGRAMS, type AcademicProgram } from '@/data/mock-education-home';
import { Spacing, BorderRadius } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

const ACCENT = '#14B8A6';

const STATUS_COLORS: Record<string, string> = {
  open: '#22C55E',
  waitlisted: '#F59E0B',
  closed: '#EF4444',
};

export function EduCatalogSheet({ visible, onClose, colors }: Props) {
  const [selectedSchool, setSelectedSchool] = useState<CatalogSchool>(CATALOG_SCHOOLS[0]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const handleClose = useCallback(() => {
    setExpandedId(null);
    setSearch('');
    setSelectedSchool(CATALOG_SCHOOLS[0]);
    onClose();
  }, [onClose]);

  const filteredPrograms = useMemo(() => {
    const depts = selectedSchool.departments;
    let programs = ACADEMIC_PROGRAMS.filter((p) => depts.includes(p.department));
    if (search.trim()) {
      const q = search.toLowerCase();
      programs = programs.filter(
        (p) => p.name.toLowerCase().includes(q) || p.department.toLowerCase().includes(q),
      );
    }
    return programs;
  }, [selectedSchool, search]);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Course Catalog" useModal>
      <View style={styles.container}>
        {/* School pills */}
        <View style={styles.pillRow}>
          {CATALOG_SCHOOLS.map((school) => {
            const active = school.id === selectedSchool.id;
            return (
              <Pressable
                key={school.id}
                style={[
                  styles.pill,
                  active
                    ? { backgroundColor: ACCENT }
                    : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth },
                ]}
                onPress={() => { setSelectedSchool(school); setExpandedId(null); }}
              >
                <Text style={[styles.pillText, { color: active ? '#fff' : colors.text }]} numberOfLines={1}>
                  {school.name.replace('School of ', '')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Search */}
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Search programs..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />

        {/* Programs */}
        {filteredPrograms.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No programs found.</Text>
        )}
        {filteredPrograms.map((prog) => {
          const expanded = expandedId === prog.id;
          return (
            <Pressable
              key={prog.id}
              style={[styles.programCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setExpandedId(expanded ? null : prog.id)}
            >
              <View style={styles.programHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.programName, { color: colors.text }]}>{prog.name}</Text>
                  <View style={styles.badgeRow}>
                    <View style={[styles.degreeBadge, { backgroundColor: ACCENT + '22' }]}>
                      <Text style={[styles.degreeBadgeText, { color: ACCENT }]}>{prog.degreeType}</Text>
                    </View>
                    <Text style={[styles.programEnrollment, { color: colors.textSecondary }]}>
                      {prog.enrollment} enrolled
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[prog.status] ?? '#6B7280' }]} />
              </View>

              {expanded && (
                <View style={styles.detailSection}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Department</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{prog.department}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Acceptance Rate</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{prog.acceptanceRate}%</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Avg Incoming GPA</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{prog.avgIncomingGPA.toFixed(2)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Status</Text>
                    <Text style={[styles.detailValue, { color: STATUS_COLORS[prog.status] ?? colors.text }]}>
                      {prog.status.charAt(0).toUpperCase() + prog.status.slice(1)}
                    </Text>
                  </View>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full },
  pillText: { fontSize: 12, fontWeight: '600' },

  searchInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },

  emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: Spacing.xl },

  programCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
  programHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  programName: { fontSize: 14, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  degreeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  degreeBadgeText: { fontSize: 10, fontWeight: '700' },
  programEnrollment: { fontSize: 11, fontWeight: '500' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  detailSection: { marginTop: 10, gap: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 12, fontWeight: '500' },
  detailValue: { fontSize: 12, fontWeight: '700' },
});

```

---

## Education Financial Aid Sheet (`components/commerce/edu-financial-aid-sheet.tsx`)

```typescript
/**
 * Education Financial Aid Bottom Sheet
 *
 * 3-section tabbed: Scholarships | FAFSA | Tuition & Fees
 * Tuition section has "Make Payment" → confirm → receipt flow.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import {
  SCHOLARSHIPS,
  FMU_FAFSA,
  TUITION_RATES,
  buildEduCommerceChain,
} from '@/data/edu-commerce-data';
import type { PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Section = 'scholarships' | 'fafsa' | 'tuition';
type TuitionStage = 'browse' | 'confirm' | 'receipt';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

const ACCENT = '#14B8A6';
const SECTIONS: { id: Section; label: string }[] = [
  { id: 'scholarships', label: 'Scholarships' },
  { id: 'fafsa', label: 'FAFSA' },
  { id: 'tuition', label: 'Tuition & Fees' },
];

export function EduFinancialAidSheet({ visible, onClose, colors }: Props) {
  const [section, setSection] = useState<Section>('scholarships');
  const [tuitionStage, setTuitionStage] = useState<TuitionStage>('browse');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const handleClose = useCallback(() => {
    setSection('scholarships');
    setTuitionStage('browse');
    setSelectedPlan(null);
    setChain(null);
    onClose();
  }, [onClose]);

  const handleMakePayment = useCallback(() => {
    setTuitionStage('confirm');
  }, []);

  const handleConfirmPayment = useCallback(() => {
    const result = buildEduCommerceChain(
      'Tuition Payment',
      TUITION_RATES.perSemester,
      'Spring 2026 Semester Tuition',
      'TUI',
    );
    setChain(result);
    setTuitionStage('receipt');
  }, []);

  const totalFees = TUITION_RATES.fees.technology + TUITION_RATES.fees.activity + TUITION_RATES.fees.lab;

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Financial Aid" useModal>
      {/* Section toggle pills */}
      <View style={styles.pillRow}>
        {SECTIONS.map((s) => {
          const active = s.id === section;
          return (
            <Pressable
              key={s.id}
              style={[
                styles.pill,
                active
                  ? { backgroundColor: ACCENT }
                  : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth },
              ]}
              onPress={() => { setSection(s.id); setTuitionStage('browse'); setChain(null); }}
            >
              <Text style={[styles.pillText, { color: active ? '#fff' : colors.text }]}>{s.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Scholarships */}
      {section === 'scholarships' && (
        <View style={styles.container}>
          {SCHOLARSHIPS.map((sch) => (
            <View key={sch.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardName, { color: colors.text }]}>{sch.name}</Text>
                <Text style={[styles.cardAmount, { color: ACCENT }]}>${sch.amount.toLocaleString()}</Text>
              </View>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>{sch.eligibility}</Text>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Deadline: {sch.deadline}</Text>
            </View>
          ))}
        </View>
      )}

      {/* FAFSA */}
      {section === 'fafsa' && (
        <View style={styles.container}>
          <View style={[styles.codeCard, { backgroundColor: ACCENT + '15' }]}>
            <Text style={[styles.codeLabel, { color: ACCENT }]}>FMU School Code</Text>
            <Text style={[styles.codeValue, { color: colors.text }]}>{FMU_FAFSA.schoolCode}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>DEADLINES</Text>
            <View style={styles.deadlineRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Priority</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>{FMU_FAFSA.priority}</Text>
            </View>
            <View style={styles.deadlineRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Final</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>{FMU_FAFSA.final}</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>STEPS TO COMPLETE</Text>
            {FMU_FAFSA.steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={[styles.stepNumber, { backgroundColor: ACCENT }]}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.text }]}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Tuition & Fees */}
      {section === 'tuition' && tuitionStage === 'browse' && (
        <View style={styles.container}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>TUITION RATES</Text>
            <View style={styles.rateRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Per Credit Hour</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${TUITION_RATES.perCreditHour}</Text>
            </View>
            <View style={styles.rateRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Per Semester (15 credits)</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${TUITION_RATES.perSemester.toLocaleString()}</Text>
            </View>
            <View style={styles.rateRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Annual</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${TUITION_RATES.annual.toLocaleString()}</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>FEES (PER SEMESTER)</Text>
            <View style={styles.rateRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Technology Fee</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${TUITION_RATES.fees.technology}</Text>
            </View>
            <View style={styles.rateRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Activity Fee</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${TUITION_RATES.fees.activity}</Text>
            </View>
            <View style={styles.rateRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Lab Fee</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${TUITION_RATES.fees.lab}</Text>
            </View>
            <View style={[styles.rateRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: 8, marginTop: 4 }]}>
              <Text style={[styles.cardMetaBold, { color: colors.textSecondary }]}>Total Fees</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${totalFees}</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>ROOM & BOARD</Text>
            <View style={styles.rateRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Annual</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${TUITION_RATES.roomAndBoard.toLocaleString()}</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT PLANS</Text>
            {TUITION_RATES.paymentPlans.map((plan) => (
              <Pressable
                key={plan.id}
                style={[
                  styles.planRow,
                  { borderColor: selectedPlan === plan.id ? ACCENT : colors.border },
                ]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                <View style={[styles.radioOuter, { borderColor: selectedPlan === plan.id ? ACCENT : colors.border }]}>
                  {selectedPlan === plan.id && <View style={[styles.radioInner, { backgroundColor: ACCENT }]} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.planLabel, { color: colors.text }]}>{plan.label}</Text>
                  <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>{plan.description}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={handleMakePayment}>
            <Text style={styles.ctaButtonText}>Make Payment</Text>
          </Pressable>
        </View>
      )}

      {section === 'tuition' && tuitionStage === 'confirm' && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM PAYMENT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Description</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>Spring 2026 Tuition</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Plan</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>
                {TUITION_RATES.paymentPlans.find((p) => p.id === selectedPlan)?.label ?? 'Full Pay'}
              </Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${TUITION_RATES.perSemester.toLocaleString()}.00</Text>
            </View>
          </View>

          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={handleConfirmPayment}>
            <Text style={styles.ctaButtonText}>Confirm Payment</Text>
          </Pressable>
          <Pressable
            style={[styles.cancelButton, { borderColor: colors.border }]}
            onPress={() => setTuitionStage('browse')}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Back</Text>
          </Pressable>
        </View>
      )}

      {section === 'tuition' && tuitionStage === 'receipt' && chain && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${chain.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statusText, { color: '#22C55E' }]}>Settled</Text>
            </View>
          </View>

          <View style={[styles.chainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT CHAIN</Text>
            {chain.chain.map((step, i) => (
              <View key={i} style={styles.chainRow}>
                <View style={[styles.chainDot, { backgroundColor: '#22C55E' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainStage, { color: colors.text }]}>{step.stage}</Text>
                  <Text style={[styles.chainDetail, { color: colors.textSecondary }]}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={handleClose}>
            <Text style={styles.ctaButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  pillRow: { flexDirection: 'row', gap: 6, marginBottom: Spacing.sm },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full },
  pillText: { fontSize: 12, fontWeight: '600' },

  container: { gap: Spacing.md },

  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 6,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 14, fontWeight: '700', flex: 1 },
  cardAmount: { fontSize: 15, fontWeight: '800' },
  cardMeta: { fontSize: 12, fontWeight: '500' },
  cardMetaBold: { fontSize: 12, fontWeight: '700' },

  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },

  deadlineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  codeCard: { borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center', gap: 4 },
  codeLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  codeValue: { fontSize: 28, fontWeight: '800', letterSpacing: 2 },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 4 },
  stepNumber: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  stepText: { fontSize: 13, fontWeight: '500', flex: 1 },

  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: 4,
  },
  radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  planLabel: { fontSize: 13, fontWeight: '700' },

  confirmCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 10,
  },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmLabel: { fontSize: 13, fontWeight: '500' },
  confirmValue: { fontSize: 13, fontWeight: '700' },
  amountText: { fontSize: 24, fontWeight: '800' },
  statusText: { fontSize: 13, fontWeight: '700' },

  ctaButton: { paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  ctaButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelButton: { borderWidth: 1, paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  cancelButtonText: { fontSize: 15, fontWeight: '600' },

  chainCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 8,
  },
  chainRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  chainDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  chainStage: { fontSize: 12, fontWeight: '700' },
  chainDetail: { fontSize: 11, fontWeight: '500', marginTop: 1 },
});

```

---

## Church Give Sheet (`components/commerce/church-give-sheet.tsx`)

```typescript
/**
 * Church Give Bottom Sheet
 *
 * 3-stage: browse (category + amount + frequency) → confirm → receipt with payment chain + EIN.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import {
  GIVING_CATEGORIES,
  GIVING_AMOUNTS,
  RECURRING_OPTIONS,
  CHURCH_EIN,
  buildChurchCommerceChain,
  type GivingCategory,
  type RecurringOption,
} from '@/data/church-commerce-data';
import type { PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'browse' | 'confirm' | 'receipt';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

const ACCENT = '#FBBF24';

export function ChurchGiveSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [selectedCategory, setSelectedCategory] = useState<GivingCategory | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [frequency, setFrequency] = useState<RecurringOption>(RECURRING_OPTIONS[0]);
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const handleClose = useCallback(() => {
    setStage('browse');
    setSelectedCategory(null);
    setAmount(null);
    setCustomAmount('');
    setFrequency(RECURRING_OPTIONS[0]);
    setChain(null);
    onClose();
  }, [onClose]);

  const resolvedAmount = amount ?? (customAmount ? parseFloat(customAmount) : 0);
  const canProceed = selectedCategory && resolvedAmount > 0;

  const handleConfirmStage = useCallback(() => {
    if (!canProceed) return;
    setStage('confirm');
  }, [canProceed]);

  const handleConfirm = useCallback(() => {
    if (!selectedCategory) return;
    const result = buildChurchCommerceChain(
      'Giving',
      resolvedAmount,
      `${selectedCategory.label} — ${frequency.label}`,
      'GIV',
    );
    setChain(result);
    setStage('receipt');
  }, [selectedCategory, resolvedAmount, frequency]);

  const handleBack = useCallback(() => {
    setStage('browse');
  }, []);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Give" useModal>
      {stage === 'browse' && (
        <View style={styles.container}>
          {/* Category */}
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CATEGORY</Text>
          <View style={styles.pillRow}>
            {GIVING_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.pill,
                  { borderColor: colors.border },
                  selectedCategory?.id === cat.id && { backgroundColor: ACCENT, borderColor: ACCENT },
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[
                  styles.pillText,
                  { color: colors.text },
                  selectedCategory?.id === cat.id && { color: '#000' },
                ]}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Amount */}
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>AMOUNT</Text>
          <View style={styles.pillRow}>
            {GIVING_AMOUNTS.map((a) => (
              <Pressable
                key={a}
                style={[
                  styles.pill,
                  { borderColor: colors.border },
                  amount === a && { backgroundColor: ACCENT, borderColor: ACCENT },
                ]}
                onPress={() => { setAmount(a); setCustomAmount(''); }}
              >
                <Text style={[
                  styles.pillText,
                  { color: colors.text },
                  amount === a && { color: '#000' },
                ]}>
                  ${a}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            style={[styles.customInput, { borderColor: colors.border, color: colors.text }]}
            placeholder="Custom amount"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
            value={customAmount}
            onChangeText={(v) => { setCustomAmount(v); setAmount(null); }}
          />

          {/* Frequency */}
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>FREQUENCY</Text>
          <View style={styles.pillRow}>
            {RECURRING_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                style={[
                  styles.pill,
                  { borderColor: colors.border },
                  frequency.id === opt.id && { backgroundColor: ACCENT, borderColor: ACCENT },
                ]}
                onPress={() => setFrequency(opt)}
              >
                <Text style={[
                  styles.pillText,
                  { color: colors.text },
                  frequency.id === opt.id && { color: '#000' },
                ]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[styles.ctaButton, { backgroundColor: canProceed ? ACCENT : colors.border }]}
            onPress={handleConfirmStage}
            disabled={!canProceed}
          >
            <Text style={[styles.ctaButtonText, { color: canProceed ? '#000' : colors.textTertiary }]}>
              Continue
            </Text>
          </Pressable>
        </View>
      )}

      {stage === 'confirm' && selectedCategory && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM GIFT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Category</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedCategory.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${resolvedAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Frequency</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{frequency.label}</Text>
            </View>
          </View>

          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={handleConfirm}>
            <Text style={[styles.ctaButtonText, { color: '#000' }]}>Give ${resolvedAmount.toFixed(2)}</Text>
          </Pressable>
          <Pressable style={[styles.cancelButton, { borderColor: colors.border }]} onPress={handleBack}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Back</Text>
          </Pressable>
        </View>
      )}

      {stage === 'receipt' && chain && selectedCategory && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Category</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedCategory.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${chain.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Frequency</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{frequency.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statusText, { color: '#22C55E' }]}>Settled</Text>
            </View>
          </View>

          {/* Payment Chain */}
          <View style={[styles.chainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT CHAIN</Text>
            {chain.chain.map((step, i) => (
              <View key={i} style={styles.chainRow}>
                <View style={[styles.chainDot, { backgroundColor: '#22C55E' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainStage, { color: colors.text }]}>{step.stage}</Text>
                  <Text style={[styles.chainDetail, { color: colors.textSecondary }]}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Tax Note */}
          <View style={[styles.taxNote, { backgroundColor: ACCENT + '15' }]}>
            <Text style={[styles.taxNoteText, { color: ACCENT }]}>
              Tax-deductible contribution. ICCLA EIN: {CHURCH_EIN}
            </Text>
          </View>

          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={handleClose}>
            <Text style={[styles.ctaButtonText, { color: '#000' }]}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },

  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  pill: {
    borderWidth: 1, borderRadius: BorderRadius.md,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  pillText: { fontSize: 13, fontWeight: '600' },

  customInput: {
    borderWidth: 1, borderRadius: BorderRadius.md,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, marginBottom: 14,
  },

  confirmCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 10,
  },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmLabel: { fontSize: 13, fontWeight: '500' },
  confirmValue: { fontSize: 13, fontWeight: '700' },
  amountText: { fontSize: 24, fontWeight: '800' },
  statusText: { fontSize: 13, fontWeight: '700' },

  ctaButton: { paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  ctaButtonText: { fontSize: 15, fontWeight: '700' },
  cancelButton: { borderWidth: 1, paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  cancelButtonText: { fontSize: 15, fontWeight: '600' },

  chainCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 8,
  },
  chainRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  chainDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  chainStage: { fontSize: 12, fontWeight: '700' },
  chainDetail: { fontSize: 11, fontWeight: '500', marginTop: 1 },

  taxNote: {
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  taxNoteText: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
});

```

---

## Church Sermons Sheet (`components/commerce/church-sermons-sheet.tsx`)

```typescript
/**
 * Church Sermons Bottom Sheet
 *
 * Browse-only: current series card + recent sermon list with play/share.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CURRENT_SERIES, RECENT_SERMONS } from '@/data/mock-church-home';
import { Spacing, BorderRadius } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

const ACCENT = '#FBBF24';

export function ChurchSermonsSheet({ visible, onClose, colors }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Sermons" useModal>
      <View style={styles.container}>
        {/* Current Series Card */}
        <View style={styles.seriesCard}>
          <View style={[styles.seriesAccent, { backgroundColor: CURRENT_SERIES.color }]} />
          <View style={styles.seriesContent}>
            <Text style={[styles.seriesLabel, { color: ACCENT }]}>CURRENT SERIES</Text>
            <Text style={styles.seriesName}>{CURRENT_SERIES.name}</Text>
            <Text style={styles.seriesProgress}>
              Part {CURRENT_SERIES.currentPart} of {CURRENT_SERIES.totalParts}
            </Text>
          </View>
        </View>

        {/* Recent Sermons */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECENT SERMONS</Text>
        {RECENT_SERMONS.map((sermon) => (
          <View
            key={sermon.id}
            style={[styles.sermonRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.sermonTitle, { color: colors.text }]}>{sermon.title}</Text>
              <Text style={[styles.sermonMeta, { color: colors.textSecondary }]}>
                {sermon.speaker} · {sermon.date} · {sermon.duration}
              </Text>
              {sermon.seriesName && (
                <View style={[styles.seriesBadge, { backgroundColor: ACCENT + '22' }]}>
                  <Text style={[styles.seriesBadgeText, { color: ACCENT }]}>{sermon.seriesName}</Text>
                </View>
              )}
            </View>
            <View style={styles.sermonActions}>
              <Pressable style={styles.actionBtn}>
                <IconSymbol name="play.circle.fill" size={28} color={ACCENT} />
              </Pressable>
              <Pressable style={styles.actionBtn}>
                <IconSymbol name="square.and.arrow.up" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },

  seriesCard: {
    backgroundColor: '#181616',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: 8,
  },
  seriesAccent: { height: 3 },
  seriesContent: { padding: Spacing.md },
  seriesLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  seriesName: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  seriesProgress: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },

  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },

  sermonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.sm,
    gap: 10,
  },
  sermonTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  sermonMeta: { fontSize: 11, marginBottom: 4 },
  seriesBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  seriesBadgeText: { fontSize: 9, fontWeight: '700' },

  sermonActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: { padding: 4 },
});

```

---

## Church Prayer Sheet (`components/commerce/church-prayer-sheet.tsx`)

```typescript
/**
 * Church Prayer Bottom Sheet
 *
 * 2-section tabbed: Submit Request + Active Requests feed.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import {
  PRAYER_REQUESTS,
  PRAYER_CATEGORY_LABELS,
  PRAYER_CATEGORY_COLORS,
  type PrayerCategory,
} from '@/data/mock-church-home';
import { Spacing, BorderRadius } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

type TabId = 'submit' | 'requests';

const ACCENT = '#FBBF24';
const CATEGORIES = Object.keys(PRAYER_CATEGORY_LABELS) as PrayerCategory[];
const PRIVACY_OPTIONS = [
  { id: 'public' as const, label: 'Share with Church' },
  { id: 'leaders_only' as const, label: 'Leaders Only' },
  { id: 'private' as const, label: 'Private' },
];

export function ChurchPrayerSheet({ visible, onClose, colors }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('submit');
  const [requestText, setRequestText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PrayerCategory | null>(null);
  const [privacy, setPrivacy] = useState<'public' | 'leaders_only' | 'private'>('public');
  const [submitted, setSubmitted] = useState(false);
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set());

  const handleClose = useCallback(() => {
    setActiveTab('submit');
    setRequestText('');
    setSelectedCategory(null);
    setPrivacy('public');
    setSubmitted(false);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    setTimeout(() => {
      setRequestText('');
      setSelectedCategory(null);
      setPrivacy('public');
      setSubmitted(false);
    }, 2000);
  }, []);

  const handlePray = useCallback((id: string) => {
    setPrayedIds((prev) => new Set(prev).add(id));
  }, []);

  const canSubmit = requestText.trim().length > 0 && selectedCategory;

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Prayer" useModal>
      <View style={styles.container}>
        {/* Tab Pills */}
        <View style={styles.tabRow}>
          {(['submit', 'requests'] as TabId[]).map((tab) => (
            <Pressable
              key={tab}
              style={[
                styles.tabPill,
                { borderColor: colors.border },
                activeTab === tab && { backgroundColor: ACCENT, borderColor: ACCENT },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabPillText,
                { color: colors.text },
                activeTab === tab && { color: '#000' },
              ]}>
                {tab === 'submit' ? 'Submit' : 'Requests'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Submit Tab */}
        {activeTab === 'submit' && (
          <View style={styles.section}>
            {submitted ? (
              <View style={styles.successBlock}>
                <Text style={styles.successText}>Prayer request submitted. We are standing with you.</Text>
              </View>
            ) : (
              <>
                <TextInput
                  style={[styles.textArea, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Share your prayer request..."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={4}
                  value={requestText}
                  onChangeText={setRequestText}
                  textAlignVertical="top"
                />

                <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CATEGORY</Text>
                <View style={styles.pillRow}>
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      style={[
                        styles.catPill,
                        { borderColor: colors.border },
                        selectedCategory === cat && {
                          backgroundColor: PRAYER_CATEGORY_COLORS[cat] + '22',
                          borderColor: PRAYER_CATEGORY_COLORS[cat],
                        },
                      ]}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <Text style={[
                        styles.catPillText,
                        { color: colors.text },
                        selectedCategory === cat && { color: PRAYER_CATEGORY_COLORS[cat] },
                      ]}>
                        {PRAYER_CATEGORY_LABELS[cat]}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PRIVACY</Text>
                <View style={styles.pillRow}>
                  {PRIVACY_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.id}
                      style={[
                        styles.catPill,
                        { borderColor: colors.border },
                        privacy === opt.id && { backgroundColor: ACCENT + '22', borderColor: ACCENT },
                      ]}
                      onPress={() => setPrivacy(opt.id)}
                    >
                      <Text style={[
                        styles.catPillText,
                        { color: colors.text },
                        privacy === opt.id && { color: ACCENT },
                      ]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable
                  style={[styles.ctaButton, { backgroundColor: canSubmit ? ACCENT : colors.border }]}
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                >
                  <Text style={[styles.ctaText, { color: canSubmit ? '#000' : colors.textTertiary }]}>
                    Submit Prayer Request
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <View style={styles.section}>
            {PRAYER_REQUESTS.filter((p) => p.privacy === 'public').map((req) => (
              <View
                key={req.id}
                style={[
                  styles.requestCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  req.isPraise && { borderColor: ACCENT, borderWidth: 1.5 },
                ]}
              >
                <View style={styles.requestHeader}>
                  <Text style={[styles.requestName, { color: colors.text }]}>
                    {req.anonymous ? 'Anonymous' : req.name}
                  </Text>
                  <View style={[styles.categoryBadge, { backgroundColor: PRAYER_CATEGORY_COLORS[req.category] + '22' }]}>
                    <Text style={[styles.categoryBadgeText, { color: PRAYER_CATEGORY_COLORS[req.category] }]}>
                      {PRAYER_CATEGORY_LABELS[req.category]}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.requestText, { color: colors.textSecondary }]}>{req.text}</Text>
                <View style={styles.requestFooter}>
                  <Text style={[styles.requestDate, { color: colors.textTertiary }]}>{req.date}</Text>
                  <Pressable
                    style={[
                      styles.prayButton,
                      prayedIds.has(req.id)
                        ? { backgroundColor: ACCENT + '22' }
                        : { backgroundColor: colors.border + '44' },
                    ]}
                    onPress={() => handlePray(req.id)}
                  >
                    <Text style={[
                      styles.prayButtonText,
                      { color: prayedIds.has(req.id) ? ACCENT : colors.textSecondary },
                    ]}>
                      {prayedIds.has(req.id)
                        ? `Prayed (${req.prayerCount + 1})`
                        : `I Prayed (${req.prayerCount})`}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },

  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  tabPill: { flex: 1, borderWidth: 1, borderRadius: BorderRadius.md, paddingVertical: 8, alignItems: 'center' },
  tabPillText: { fontSize: 13, fontWeight: '700' },

  section: { gap: Spacing.sm },

  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },

  textArea: {
    borderWidth: 1, borderRadius: BorderRadius.md,
    padding: Spacing.sm, fontSize: 14,
    minHeight: 80,
  },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  catPill: { borderWidth: 1, borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 6 },
  catPillText: { fontSize: 12, fontWeight: '600' },

  ctaButton: { paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  ctaText: { fontSize: 15, fontWeight: '700' },

  successBlock: {
    backgroundColor: '#22C55E22',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  successText: { color: '#22C55E', fontSize: 14, fontWeight: '700', textAlign: 'center' },

  requestCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.sm,
    gap: 6,
  },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  requestName: { fontSize: 13, fontWeight: '700' },
  categoryBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  categoryBadgeText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  requestText: { fontSize: 13, lineHeight: 18 },
  requestFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  requestDate: { fontSize: 10 },
  prayButton: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.md },
  prayButtonText: { fontSize: 11, fontWeight: '700' },
});

```


---


## Section G: Core Data Schemas

### G1. types/index.ts

```typescript
/**
 * KaNeXT OS Core Types
 * Defines the fundamental data structures used across all modes.
 */

// =============================================================================
// MODES & ROLES
// =============================================================================

export type Mode = 'sports' | 'business' | 'church' | 'education' | 'competition';

export type Role =
  // Business
  | 'founder'
  | 'investor'
  | 'viewer'
  // Sports
  | 'admin'
  | 'head_coach'
  | 'assistant_coach'
  | 'gm'
  | 'student_athlete'
  | 'fan'
  | 'agent'
  | 'scout'
  | 'donor'
  | 'media'
  // Church
  | 'member'
  | 'staff'
  | 'leadership'
  // Education
  | 'faculty'
  | 'student'
  // Community
  | 'league_admin'
  | 'team_owner'
  | 'driver';

// =============================================================================
// CORE ENTITIES
// =============================================================================

export interface User {
  id: string;
  name: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  primaryRole: Role;
  organizations: OrganizationMembership[];
}

export interface OrganizationMembership {
  organizationId: string;
  roles: Role[];
  isActive: boolean;
}

export interface Organization {
  id: string;
  name: string;
  mode: Mode;
  type: string;
  location?: string;
  description?: string;
}

export interface Cycle {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
}

// =============================================================================
// APP CONTEXT
// =============================================================================

export interface AppContextState {
  mode: Mode;
  organization: Organization | null;
  operatingRole: Role;
  cycle: Cycle | null;
  program: Program | null; // Sports only
  isFirstRun: boolean;
  isLoading: boolean;
}

// =============================================================================
// SPORTS MODE
// =============================================================================

export interface Program {
  id: string;
  name: string;
  level: 'varsity' | 'development_1' | 'development_2' | 'postgrad';
}

export interface SportsOrganization extends Organization {
  programs: Program[];
}

// =============================================================================
// PROGRAM CONTEXT (Nexus Configuration)
// =============================================================================

export type SystemPreset =
  | 'motion_offense'
  | 'pick_and_roll'
  | 'princeton'
  | 'dribble_drive'
  | 'positionless'
  | 'traditional';

export type OffensiveStyle =
  | 'spread_pick_and_roll'
  | 'five_out_motion'
  | 'motion_read_react'
  | 'pace_and_space'
  | 'dribble_drive'
  | 'princeton'
  | 'flex'
  | 'swing'
  | 'post_centric'
  | 'moreyball'
  | 'heliocentric';

export type HeliocentricPosition = 'PG' | 'CG' | 'W' | 'F' | 'B';

export type DefensiveStyle =
  | 'containment_man'
  | 'pack_line'
  | 'pressure_man'
  | 'switch_everything'
  | 'ice_no_middle'
  | 'zone_structured'
  | 'matchup_zone'
  | 'press'
  | 'junk_special';

export type ClusterType =
  | 'shooting'
  | 'finishing'
  | 'playmaking'
  | 'perimeter_defense'
  | 'interior_defense'
  | 'rebounding'
  | 'frame';

export interface ClusterWeight {
  cluster: ClusterType;
  weight: number; // 0-100
}

export type Position = 'PG' | 'CG' | 'W' | 'F' | 'B';

export type ImportanceLevel = 'critical' | 'high' | 'medium' | 'low';

export interface PositionImportance {
  position: Position;
  weight: number;
}

export type BiasType =
  | 'prefer_experience'
  | 'prefer_youth'
  | 'prefer_size'
  | 'prefer_speed'
  | 'prefer_shooting'
  | 'prefer_defense'
  | 'prefer_local'
  | 'prefer_transfers';

export interface ProgramBias {
  type: BiasType;
  strength: number; // 0-100
  enabled: boolean;
}

export interface ProgramContext {
  programId: string;
  scholarships: number;
  scholarshipsUsed: number;
  nilBudget: number;
  nilUsed: number;
  systemPreset: SystemPreset;
  offensiveStyle: OffensiveStyle;
  heliocentricPosition?: HeliocentricPosition; // Engine position for Heliocentric offense
  defensiveStyle: DefensiveStyle;
  tempo: number; // 0-100 (slow to fast)
  clusterWeights: ClusterWeight[];
  positionImportance: PositionImportance[];
  biases: ProgramBias[];
}

// =============================================================================
// BUSINESS MODE
// =============================================================================

export type DocumentCategory =
  | 'investor_materials'
  | 'governance'
  | 'institutional_brief'
  | 'roadmap'
  | 'proof'
  | 'ip'
  | 'financial'
  | 'legal'
  | 'product'
  | 'engines';
export type DocumentVisibility = 'founder' | 'investor' | 'public';

export interface Document {
  id: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  url?: string;
  visibility: DocumentVisibility;
  fileType?: 'pdf' | 'doc' | 'xls' | 'ppt' | 'link';
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardMember {
  id: string;
  name: string;
  role: string;
  title?: string;
  company?: string;
  bio?: string;
}

export interface Domain {
  id: string;
  name: string;
  mode: Mode;
  description: string;
  status: 'active' | 'development' | 'planned';
  icon: string;
}

export interface BusinessScenario {
  id: string;
  title: string;
  prompt: string;
  output: string;
  timestamp: Date;
  isPinned: boolean;
}

export interface BusinessOrganization extends Organization {
  legalStructure: string;
  stateOfFormation: string;
  status: string;
  operationalScope: string[];
  documents?: Document[];
  board?: BoardMember[];
  domains?: Domain[];
}

// Business v2 -----------------------------------------------------------------

export interface Company {
  id: string;
  displayName: string;
  legalName: string;
  dbaName?: string;
  jurisdiction: string;
  entityType: string;
  addressBlock: string[];
  primaryContact: { name: string; email: string; role: string };
  initials: string;
  status: string;
  lastUpdated: Date;
  visibility: DocumentVisibility;
}

export type ProofEventStage = 'planning' | 'active' | 'completed' | 'paused';

export interface ProofEventKPI {
  id: string;
  label: string;
  value: string;
  target?: string;
  trend?: 'up' | 'down' | 'flat';
}

export interface ProofEventMilestone {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  targetDate?: string;
  completedDate?: string;
}

export interface ProofEventRisk {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation?: string;
}

export interface ProofEvent {
  id: string;
  companyId: string;
  name: string;
  stage: ProofEventStage;
  overview: string;
  kpis: ProofEventKPI[];
  milestones: ProofEventMilestone[];
  risks: ProofEventRisk[];
  opsActions: string[];
  constraints: string[];
  lastUpdated: Date;
  visibility: DocumentVisibility;
}

export interface Engine {
  id: string;
  name: string;
  purpose: string;
  inputs: string[];
  outputs: string[];
  whyItMatters: string[];
}

export interface DocumentV2 extends Document {
  tags: string[];
  engineId?: string;
  proofEventId?: string;
  body?: string;
  summary?: string;
  attachments: string[];
}

export interface RevenueStream {
  id: string;
  name: string;
  description: string;
  pricing?: string;
  status: 'active' | 'planned' | 'beta';
}

export interface CompetitiveAdvantage {
  id: string;
  title: string;
  description: string;
}

export interface FundraisingRound {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'closed';
  targetAmount?: number;
  raisedAmount?: number;
  closingDate?: string;
  summary?: string;
}

export interface ArchitectureLayer {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface RecentUpdate {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type: 'milestone' | 'document' | 'metric' | 'system';
}

// =============================================================================
// CHURCH MODE
// =============================================================================

export interface ServiceTime {
  day: string;
  time: string;
  service: string;
  campusId?: string;
}

export interface Campus {
  id: string;
  name: string;
  shortName: string;
  location: string;
  address?: string;
  serviceTimes: ServiceTime[];
  description?: string;
}

export type MinistryType = 'childrens' | 'youth' | 'singles' | 'prayer' | 'outreach' | 'worship' | 'missions';

export interface Ministry {
  id: string;
  name: string;
  description?: string;
  type: MinistryType;
  icon?: string;
  accessMethods?: string[];
}

export interface ChurchMessage {
  id: string;
  title: string;
  speaker: string;
  date: Date;
  mediaType: 'video' | 'audio';
  externalUrl?: string;
  seriesName?: string;
  duration?: string;
}

export type GivingType = 'tithe' | 'offering' | 'donation' | 'fundraiser' | 'missions';

export interface GivingOption {
  id: string;
  type: GivingType;
  name: string;
  description?: string;
  externalUrl?: string;
}

export interface ChurchOrganization extends Organization {
  denomination: string;
  campuses: Campus[];
  ministries?: Ministry[];
  serviceTimes?: ServiceTime[];
  givingOptions?: GivingOption[];
}

// =============================================================================
// EDUCATION MODE
// =============================================================================

export type TermType = 'fall' | 'spring' | 'summer' | 'winter' | 'full_year';
export type TermStatus = 'upcoming' | 'current' | 'completed';

export interface AcademicTerm {
  id: string;
  name: string;
  type: TermType;
  academicYear: string;
  startDate: Date;
  endDate: Date;
  status: TermStatus;
}

export type CalendarEventType =
  | 'semester_start'
  | 'semester_end'
  | 'add_drop'
  | 'midterms'
  | 'finals'
  | 'break'
  | 'holiday'
  | 'commencement'
  | 'registration'
  | 'other';

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: CalendarEventType;
  date: Date;
  endDate?: Date;
  termId?: string;
}

export interface Department {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  chairId?: string;
  programCount: number;
}

export type FacultyRole = 'president' | 'provost' | 'dean' | 'chair' | 'professor' | 'instructor' | 'staff';

export interface FacultyMember {
  id: string;
  name: string;
  title: string;
  role: FacultyRole;
  departmentId?: string;
  bio?: string;
  email?: string;
}

export interface InstitutionalMetrics {
  enrollment: {
    total: number;
    undergraduate: number;
    graduate: number;
    yearOverYearChange: number;
  };
  academics: {
    programs: number;
    facultyCount: number;
    studentFacultyRatio: string;
  };
  outcomes: {
    graduationRate: number;
    retentionRate: number;
    employmentRate: number;
  };
}

export interface EducationOrganization extends Organization {
  institutionType: string;
  programFormats: string[];
  accreditation?: string;
  founded?: number;
  departments?: Department[];
  terms?: AcademicTerm[];
  calendar?: AcademicCalendarEvent[];
  leadership?: FacultyMember[];
  metrics?: InstitutionalMetrics;
}

// =============================================================================
// AUTH & ONBOARDING
// =============================================================================

export type AuthProvider = 'apple' | 'google' | 'email';

export type AccessTier = 'founder' | 'cofounder' | 'investor' | 'public';

export interface AuthSession {
  userId: string;
  displayName: string;
  email: string;
  provider: AuthProvider;
  token: string;
  createdAt: Date;
  tier: AccessTier;
}

export type OnboardingStep = 'org_code' | 'create_org' | 'viewer' | 'complete';

// =============================================================================
// NEXUS / CONVERSATIONS
// =============================================================================

export type MessageRole = 'user' | 'assistant' | 'system';

export type ConversationType = 'chat' | 'eval' | 'sim' | 'game-ops';

export type PlayerEvalRole = 'starter' | 'rotation' | 'development';

export interface PlayerEvalConfig {
  playerId: string | null;
  playerName?: string;
  role: PlayerEvalRole | null;
}

export type SimulationScenario = 'pregame' | 'halftime' | 'endgame' | 'what-if';

export interface SimulationThreadConfig {
  scenario: SimulationScenario | null;
  opponentName?: string;
}

export interface EvalSnapshot {
  id: string;
  generatedAt: Date;
  playerName: string;
  summary: string;
  strengths: string[];
  areasForGrowth: string[];
  projectedImpact: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: {
    isSimulation?: boolean;
    isSavedSimulation?: boolean;
    simulationId?: string;
    simulationParams?: Record<string, unknown>;
    isEval?: boolean;
    evalSnapshotId?: string;
  };
}

export interface ConversationParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'member';
}

export interface GameOpsConfig {
  gameId: string;
  opponent: string;
  step: 'gathering' | 'confirm' | 'started';
  periodFormat: 'halves' | 'quarters';
  periodLength: number;       // seconds
  starters: string[];         // player IDs
  league?: string;
  timeouts?: number;
}

export interface Conversation {
  id: string;
  title: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  updatedAt: Date;
  createdAt: Date;
  isGroup: boolean;
  unreadCount: number;
  type: ConversationType;
  isPinned?: boolean;
  evalConfig?: PlayerEvalConfig;
  simConfig?: SimulationThreadConfig;
  gameOpsConfig?: GameOpsConfig;
  mode?: Mode;
  workspace?: string;
}

export type NexusPanelState = 'closed' | 'conversations' | 'context' | 'roster' | 'recruiting' | 'simulation';

export interface TargetContext {
  organizationId: string;
  programId?: string;
}

export interface NexusState {
  activeConversationId: string | null;
  conversations: Conversation[];
  messages: Message[];
  panelState: NexusPanelState;
  inputText: string;
  isLoading: boolean;
  activeSimulationId: string | null;
  simulations: Record<string, SimulationResult>;
  savedSimulations: Record<string, SavedSimulation>;
  newConversationSheetOpen: boolean;
  evalSnapshots: Record<string, EvalSnapshot>;
  targetContext: TargetContext | 'all';
  /** Pending governed action awaiting confirmation (v2) */
  pendingAction?: import('./nexus-v2').ActionIntent;
  /** Conversation the pending action belongs to */
  pendingActionConversationId?: string;
}

// =============================================================================
// SEARCH
// =============================================================================

export type SearchResultCategory =
  | 'organization'
  | 'member'
  | 'event'
  | 'record'
  | 'media'
  | 'document'
  | 'ministry'
  | 'message';

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  category: SearchResultCategory;
  mode: Mode;
  route: string;
  icon?: string;
}

// =============================================================================
// ACTIVITY
// =============================================================================

export type ActivityType =
  // Sports
  | 'game_final'
  | 'score_updated'
  | 'schedule_updated'
  | 'media_added'
  | 'roster_published'
  // Business
  | 'document_added'
  | 'document_updated'
  | 'scenario_saved'
  | 'config_changed'
  // Church
  | 'message_posted'
  | 'event_updated'
  | 'ministry_updated'
  | 'giving_updated'
  // Education
  | 'calendar_published'
  | 'term_confirmed'
  | 'leadership_updated';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  sourceType: 'organization' | 'event' | 'record' | 'media' | 'system';
  sourceId: string;
  route: string;
  organizationId: string;
  mode: Mode;
  visibility: Role[];
}

// =============================================================================
// SIMULATION
// =============================================================================

export type SimulationType = 'single_game' | 'tournament' | 'season';
export type RosterType = 'official' | 'sandbox';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type VolatilityLevel = 'low' | 'medium' | 'high';

export interface PlayerImpact {
  playerId: string;
  playerName: string;
  position: Position;
  projectedPoints: number;
  projectedRebounds: number;
  projectedAssists: number;
  impactRating: number; // -100 to +100
  keyContribution: string;
}

export interface ProjectedBoxScore {
  teamStats: {
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    turnovers: number;
    fgPct: number;
    threePct: number;
    ftPct: number;
  };
  playerStats: PlayerImpact[];
}

export interface SimulationResult {
  id: string;
  type: SimulationType;
  matchupText: string;
  homeTeam: string;
  awayTeam: string;
  rosterUsed: RosterType;
  timestamp: Date;
  winProbability: number; // 0-100
  projectedScore: {
    home: number;
    away: number;
  };
  projectedMargin: number;
  projectedTotal: number;
  confidence: ConfidenceLevel;
  volatility: VolatilityLevel;
  drivers: string[];
  playerImpact: PlayerImpact[];
  boxScoreProjection?: ProjectedBoxScore;
}

export interface SavedSimulation extends SimulationResult {
  threadId: string;
  savedAt: Date;
  title?: string;
}

// =============================================================================
// PROGRAM RESOURCES (Tier 1 + Tier 2)
// =============================================================================

// Tier 1 - Always visible on Home
export interface RosterSpots {
  current: number;
  max: number;
}

export interface ScholarshipAllocation {
  used: number;
  available: number;
}

export interface NILPool {
  total: number;
  committed: number;
}

// Tier 2 - More Program Resources page
export interface Budget {
  total: number;
  spent: number;
}

export interface ProgramBudgets {
  recruiting: Budget;
  travel: Budget;
  performance: Budget;
}

export interface StaffCoverage {
  coaches: { current: number; max: number };
  supportRoles: {
    at: number;
    snc: number;
    video: number;
    operations: number;
  };
}

export interface FacilitiesAccess {
  practice: {
    dedicatedPracticeGym: boolean;
    sharedPracticeGym: boolean;
    twentyFourSevenAccess: boolean;
    shootingMachines: boolean;
    filmRoom: boolean;
  };
  recovery: {
    weightRoomAccess: boolean;
    dedicatedStrengthArea: boolean;
    recoveryTools: boolean;
    trainingRoom: boolean;
  };
}

export interface ExtendedProgramResources {
  rosterSpots: RosterSpots;
  scholarships: ScholarshipAllocation;
  nilPool: NILPool;
  budgets: ProgramBudgets;
  staff: StaffCoverage;
  facilities: FacilitiesAccess;
}

// =============================================================================
// PROGRAM CALENDAR
// =============================================================================

export type ProgramCalendarEventType =
  | 'game' | 'practice' | 'lift' | 'travel'
  | 'meeting' | 'recruiting' | 'academic' | 'admin_deadline';

export type CalendarVisibilityScope = 'all_program' | 'team_staff' | 'player';

export interface ProgramCalendarEvent {
  id: string;
  type: ProgramCalendarEventType;
  title: string;
  startDatetime: Date;
  endDatetime: Date;
  location?: string;
  description?: string;
  visibilityScope: CalendarVisibilityScope;
  routeTarget?: string;
  isReadOnly?: boolean;
  gameScore?: string;
  gameStatus?: 'upcoming' | 'live' | 'final';
}

// =============================================================================
// V2 CONTEXT SWITCHING
// =============================================================================

export interface V2Organization {
  org_id: string;
  org_name: string;
  mode: Mode;
  location?: string;
  description?: string;
  org_type?: string;
  view_variant?: string;
}

export interface V2Membership {
  membership_id: string;
  mode: Mode;
  org_id: string;
  role_titles: string[];
  permission_tier: string;
  program_scopes: string[];
}

export interface V2Program {
  program_id: string;
  org_id: string;
  mode: Mode;
  program_name: string;
  program_type: string;
  source_tag: string;
  status: 'Active' | 'Pending';
}

export interface V2Season {
  season_id: string;
  org_id: string;
  mode: Mode;
  season_name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface ActiveContext {
  mode: Mode;
  org_id: string;
  program_id: string;
  season_id: string;
  membership_id: string;
  derived_role_badge: string;
}

export interface RecentContext extends ActiveContext {
  timestamp: number;
}

export interface ActiveView {
  view_id: string;
  mode: Mode;
  org_id: string;
  org_name: string;
  membership_id: string;
  role_label: string;
  rbac_level: number;
  scope_type: 'program' | 'ministry' | 'department' | 'league' | 'workspace' | null;
  scope_id: string;
  scope_name: string;
  season_id: string;
  season_label: string;
  derived_role_badge: string;
}

export type ActiveViewKey = string;

// =============================================================================
// ROSTER CRM TYPES
// =============================================================================

export type PortalRiskLevel = 'green' | 'yellow' | 'orange' | 'red';
export type RosterFilterCategory = 'all' | 'starters' | 'guards' | 'wings' | 'forwards' | 'bigs' | 'flagged';
export type RosterSortKey = 'kr' | 'name' | 'position' | 'minutes' | 'nil' | 'ppg';

// =============================================================================
// CALENDAR / NEWS TYPES
// =============================================================================

export type NewsCategoryTag = 'Recap' | 'Announcement' | 'Recruiting' | 'Program';

// =============================================================================
// RECRUITING V2 TYPES
// =============================================================================

export type RecruitingViewModeV2 = 'board' | 'database' | 'portal';
export type RecruitingPipelineStage = 'Prospect' | 'Contact Made' | 'Eval Sent' | 'Visit Scheduled' | 'Offer Out' | 'Committed' | 'Signed' | 'Dead';

// =============================================================================
// MESSAGES V3
// =============================================================================

export type NexusEscalationStatus = 'unanswered' | 'answered';

export interface InboxThreadV3 {
  id: string;
  mode: Mode;
  name: string;
  initials: string;
  role: string;
  preview: string;
  timestamp: Date;
  unread: boolean;
  pinned: boolean;
  isRequest: boolean;
  avatar?: string;
}

export interface RoomV3 {
  id: string;
  mode: Mode;
  name: string;
  initials: string;
  color: string;
  memberCount: number;
  lastMessage: string;
  timestamp: Date;
  unread: boolean;
  pinned: boolean;
  locked: boolean;
  isAnnouncement: boolean;
  readCount?: number;
  totalCount?: number;
}

export interface NexusEscalationV3 {
  id: string;
  mode: Mode;
  askerName: string;
  askerInitials: string;
  askerRole: string;
  question: string;
  viewingContext: string;
  timestamp: Date;
  status: NexusEscalationStatus;
  answer?: string;
}

export interface ConversationMessageV3 {
  id: string;
  sender: string;
  initials: string;
  content: string;
  timestamp: Date;
  isMe: boolean;
}
```

### G2. data/commerce-data.ts

```typescript
/**
 * Commerce Data — Tickets, Store, Support
 *
 * Shared types, mock catalog, and transaction helpers for the
 * commerce bottom sheets on the Sports Dashboard.
 */

// =============================================================================
// SEAT TIERS (Tickets)
// =============================================================================

export interface SeatTier {
  id: string;
  label: string;
  price: number;
}

export const SEAT_TIERS: SeatTier[] = [
  { id: 'general', label: 'General', price: 10 },
  { id: 'reserved', label: 'Reserved', price: 25 },
  { id: 'courtside', label: 'Courtside', price: 50 },
];

// =============================================================================
// STORE PRODUCTS
// =============================================================================

export interface StoreProduct {
  id: string;
  name: string;
  price: number;
  sizes: string[] | null;
}

export const STORE_PRODUCTS: StoreProduct[] = [
  { id: 'jersey', name: 'Jersey', price: 89.99, sizes: ['S', 'M', 'L', 'XL'] },
  { id: 'hat', name: 'Hat', price: 34.99, sizes: null },
  { id: 'hoodie', name: 'Hoodie', price: 64.99, sizes: ['S', 'M', 'L', 'XL'] },
  { id: 'shorts', name: 'Shorts', price: 44.99, sizes: ['S', 'M', 'L', 'XL'] },
];

// =============================================================================
// SUPPORT TIERS (Donations)
// =============================================================================

export interface SupportTier {
  id: string;
  label: string;
  amount: number;
  description: string;
}

export const SUPPORT_TIERS: SupportTier[] = [
  { id: 'bronze', label: 'Bronze', amount: 25, description: 'Game Day Supporter' },
  { id: 'silver', label: 'Silver', amount: 50, description: 'Season Backer' },
  { id: 'gold', label: 'Gold', amount: 100, description: 'Champion Circle' },
];

// =============================================================================
// PAYMENT CHAIN
// =============================================================================

export interface PaymentChainStep {
  stage: string;
  detail: string;
  timestamp: string;
}

export interface PaymentChain {
  transactionId: string;
  type: string;
  amount: number;
  description: string;
  status: 'Settled';
  chain: PaymentChainStep[];
}

/** Generate a transaction ID with the given prefix: TKT-2026-XXXX, MRC-2026-XXXX, DON-2026-XXXX */
export function generateTransactionId(prefix: string): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-2026-${num}`;
}

/** Build a full payment chain for a commerce transaction. */
export function buildCommerceChain(type: string, amount: number, description: string, prefix: string): PaymentChain {
  const transactionId = generateTransactionId(prefix);
  const now = new Date();
  const ts = (offsetMs: number) => {
    const d = new Date(now.getTime() + offsetMs);
    return d.toISOString().replace('T', ' ').slice(0, 19);
  };

  return {
    transactionId,
    type,
    amount,
    description,
    status: 'Settled',
    chain: [
      { stage: 'Event', detail: `${type} initiated — ${description}`, timestamp: ts(0) },
      { stage: 'Rules', detail: 'Payment rules validated (amount, limits, method)', timestamp: ts(200) },
      { stage: 'Auth', detail: 'Card authorized — ending •••• 4242', timestamp: ts(800) },
      { stage: 'Payment', detail: `$${amount.toFixed(2)} captured`, timestamp: ts(1200) },
      { stage: 'Settlement', detail: 'Funds settled to FMU Athletics', timestamp: ts(1800) },
      { stage: 'Ledger', detail: `Ledger entry recorded — ${transactionId}`, timestamp: ts(2000) },
      { stage: 'Receipt', detail: 'Digital receipt generated', timestamp: ts(2200) },
    ],
  };
}

// =============================================================================
// CART ITEM (Store)
// =============================================================================

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  size: string;
  qty: number;
}
```

### G3. data/mock-business-home.ts

```typescript
/**
 * Mock Business Home Data — KaNeXT OS Business Mode
 * Startup fundraising, product milestones, CRM, data room, cap table
 */

import type { ProgramCalendarEvent } from '@/types';

// =============================================================================
// 1. CALENDAR EVENTS (ProgramCalendarEvent[])
// =============================================================================

export const BIZ_CALENDAR_EVENTS: ProgramCalendarEvent[] = [
  {
    id: 'bce-1',
    type: 'meeting',
    title: 'Board Meeting — Q1 Review',
    startDatetime: new Date('2026-02-20T10:00:00'),
    endDatetime: new Date('2026-02-20T12:00:00'),
    location: 'Virtual (Zoom)',
    description: 'Quarterly board review: financials, product roadmap, fundraise status',
    visibilityScope: 'team_staff',
  },
  {
    id: 'bce-2',
    type: 'meeting',
    title: 'Investor Meeting — Lightspeed',
    startDatetime: new Date('2026-02-24T14:00:00'),
    endDatetime: new Date('2026-02-24T15:00:00'),
    location: 'Menlo Park, CA',
    description: 'First meeting with Lightspeed Venture Partners — seed round',
    visibilityScope: 'team_staff',
  },
  {
    id: 'bce-3',
    type: 'meeting',
    title: 'Product Sprint Planning — V2 Modes',
    startDatetime: new Date('2026-02-25T09:00:00'),
    endDatetime: new Date('2026-02-25T11:00:00'),
    location: 'Virtual',
    description: 'Sprint 14 kickoff: Church Mode + Education Mode polish',
    visibilityScope: 'all_program',
  },
  {
    id: 'bce-4',
    type: 'meeting',
    title: 'Pitch — Precursor Ventures',
    startDatetime: new Date('2026-02-27T11:00:00'),
    endDatetime: new Date('2026-02-27T12:00:00'),
    location: 'San Francisco, CA',
    description: 'Seed pitch — $3M target raise. Charles Hudson lead.',
    visibilityScope: 'team_staff',
  },
  {
    id: 'bce-5',
    type: 'admin_deadline',
    title: 'Delaware Franchise Tax Deadline',
    startDatetime: new Date('2026-03-01T00:00:00'),
    endDatetime: new Date('2026-03-01T23:59:00'),
    location: 'Online Filing',
    description: 'Annual franchise tax filing — Delaware Secretary of State',
    visibilityScope: 'team_staff',
  },
  {
    id: 'bce-6',
    type: 'meeting',
    title: 'HBCU Innovation Summit — Panel',
    startDatetime: new Date('2026-03-05T13:00:00'),
    endDatetime: new Date('2026-03-05T14:30:00'),
    location: 'Atlanta, GA',
    description: 'Founder panel: "Building tech for underserved institutions"',
    visibilityScope: 'all_program',
  },
  {
    id: 'bce-7',
    type: 'meeting',
    title: 'Team Sync — Weekly All-Hands',
    startDatetime: new Date('2026-03-02T09:00:00'),
    endDatetime: new Date('2026-03-02T09:45:00'),
    location: 'Virtual (Slack Huddle)',
    description: 'Weekly standup: blockers, wins, priorities',
    visibilityScope: 'all_program',
  },
  {
    id: 'bce-8',
    type: 'meeting',
    title: 'Investor Meeting — Kapor Capital',
    startDatetime: new Date('2026-03-10T10:00:00'),
    endDatetime: new Date('2026-03-10T11:00:00'),
    location: 'Oakland, CA',
    description: 'Second meeting — impact thesis alignment discussion',
    visibilityScope: 'team_staff',
  },
  {
    id: 'bce-9',
    type: 'meeting',
    title: 'Product Demo — FMU Athletics Staff',
    startDatetime: new Date('2026-03-12T15:00:00'),
    endDatetime: new Date('2026-03-12T16:00:00'),
    location: 'FMU Campus, Miami Gardens',
    description: 'Live walkthrough of Sports Mode v2 with coaching staff',
    visibilityScope: 'all_program',
  },
  {
    id: 'bce-10',
    type: 'meeting',
    title: 'Pitch — Harlem Capital',
    startDatetime: new Date('2026-03-17T14:00:00'),
    endDatetime: new Date('2026-03-17T15:00:00'),
    location: 'New York, NY',
    description: 'Seed pitch — diverse founder thesis. Henri Pierre-Jacques lead.',
    visibilityScope: 'team_staff',
  },
  {
    id: 'bce-11',
    type: 'admin_deadline',
    title: 'IP Filing — Provisional Patent Extension',
    startDatetime: new Date('2026-03-20T00:00:00'),
    endDatetime: new Date('2026-03-20T23:59:00'),
    location: 'USPTO',
    description: 'Extend provisional patent filing for unified institutional OS architecture',
    visibilityScope: 'team_staff',
  },
  {
    id: 'bce-12',
    type: 'meeting',
    title: 'Media — TechCrunch Interview',
    startDatetime: new Date('2026-03-24T11:00:00'),
    endDatetime: new Date('2026-03-24T11:45:00'),
    location: 'Virtual',
    description: 'Founder profile piece — startup building OS for institutions',
    visibilityScope: 'team_staff',
  },
  {
    id: 'bce-13',
    type: 'meeting',
    title: 'NAIA Conference — Demo Booth',
    startDatetime: new Date('2026-04-02T08:00:00'),
    endDatetime: new Date('2026-04-02T17:00:00'),
    location: 'Kansas City, MO',
    description: 'NAIA annual convention — live demo booth + AD networking',
    visibilityScope: 'all_program',
  },
  {
    id: 'bce-14',
    type: 'meeting',
    title: 'Board Meeting — Fundraise Update',
    startDatetime: new Date('2026-04-15T10:00:00'),
    endDatetime: new Date('2026-04-15T12:00:00'),
    location: 'Virtual (Zoom)',
    description: 'Mid-round board update: term sheets, traction metrics, burn',
    visibilityScope: 'team_staff',
  },
  {
    id: 'bce-15',
    type: 'meeting',
    title: 'Product Sprint — Competition Mode Kickoff',
    startDatetime: new Date('2026-04-20T09:00:00'),
    endDatetime: new Date('2026-04-20T11:00:00'),
    location: 'Virtual',
    description: 'Sprint 18: Competition Mode architecture + K-1 integration spec',
    visibilityScope: 'all_program',
  },
  {
    id: 'bce-16',
    type: 'meeting',
    title: 'Investor Meeting — a16z Cultural Leadership Fund',
    startDatetime: new Date('2026-05-05T13:00:00'),
    endDatetime: new Date('2026-05-05T14:00:00'),
    location: 'Menlo Park, CA',
    description: 'Intro meeting through CLF network — institutional sports thesis',
    visibilityScope: 'team_staff',
  },
  {
    id: 'bce-17',
    type: 'meeting',
    title: 'Conference — AfroTech Startup Pitch Competition',
    startDatetime: new Date('2026-05-12T09:00:00'),
    endDatetime: new Date('2026-05-12T17:00:00'),
    location: 'Austin, TX',
    description: 'Selected as finalist — 5-minute pitch + demo + Q&A',
    visibilityScope: 'all_program',
  },
];

// =============================================================================
// 2. BIZ EVENTS
// =============================================================================

export type BizEventType = 'INVESTOR' | 'PARTNER' | 'INTERNAL' | 'DEMO';

export interface EventAttendee {
  name: string;
  role: 'founder' | 'investor' | 'advisor' | 'board' | 'partner' | 'staff' | 'press' | 'legal';
}

export interface BizEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: 'investor' | 'board' | 'product' | 'legal' | 'media' | 'conference';
  status: 'upcoming' | 'completed';
  attendees: EventAttendee[];
  eventType: BizEventType;
  outcome?: string;
}

/** Backward-compat: extract attendee names as string[] */
export function getAttendeeNames(attendees: EventAttendee[]): string[] {
  return attendees.map((a) => a.name);
}

export const BIZ_EVENTS: BizEvent[] = [
  // ─── Upcoming (8) ───
  {
    id: 'be-1',
    title: 'Board Meeting — Q1 Review',
    date: '2026-02-20',
    time: '10:00 AM',
    location: 'Virtual (Zoom)',
    category: 'board',
    status: 'upcoming',
    eventType: 'INTERNAL',
    attendees: [
      { name: 'Sammy', role: 'founder' },
      { name: 'Board Advisor 1', role: 'board' },
      { name: 'Board Advisor 2', role: 'board' },
    ],
  },
  {
    id: 'be-2',
    title: 'Lightspeed Venture Partners — Seed Pitch',
    date: '2026-02-24',
    time: '2:00 PM',
    location: 'Menlo Park, CA',
    category: 'investor',
    status: 'upcoming',
    eventType: 'INVESTOR',
    attendees: [
      { name: 'Sammy', role: 'founder' },
      { name: 'Michael Mignano', role: 'investor' },
    ],
  },
  {
    id: 'be-3',
    title: 'Precursor Ventures — Seed Pitch',
    date: '2026-02-27',
    time: '11:00 AM',
    location: 'San Francisco, CA',
    category: 'investor',
    status: 'upcoming',
    eventType: 'INVESTOR',
    attendees: [
      { name: 'Sammy', role: 'founder' },
      { name: 'Charles Hudson', role: 'investor' },
    ],
  },
  {
    id: 'be-4',
    title: 'HBCU Innovation Summit — Panel',
    date: '2026-03-05',
    time: '1:00 PM',
    location: 'Atlanta, GA',
    category: 'conference',
    status: 'upcoming',
    eventType: 'PARTNER',
    attendees: [
      { name: 'Sammy', role: 'founder' },
      { name: 'Panel Moderator', role: 'partner' },
      { name: '3 Co-Panelists', role: 'partner' },
    ],
  },
  {
    id: 'be-5',
    title: 'Kapor Capital — Follow-Up Meeting',
    date: '2026-03-10',
    time: '10:00 AM',
    location: 'Oakland, CA',
    category: 'investor',
    status: 'upcoming',
    eventType: 'INVESTOR',
    attendees: [
      { name: 'Sammy', role: 'founder' },
      { name: 'Ulili Onovakpuri', role: 'investor' },
    ],
  },
  {
    id: 'be-6',
    title: 'Harlem Capital — Seed Pitch',
    date: '2026-03-17',
    time: '2:00 PM',
    location: 'New York, NY',
    category: 'investor',
    status: 'upcoming',
    eventType: 'INVESTOR',
    attendees: [
      { name: 'Sammy', role: 'founder' },
      { name: 'Henri Pierre-Jacques', role: 'investor' },
    ],
  },
  {
    id: 'be-7',
    title: 'TechCrunch — Founder Interview',
    date: '2026-03-24',
    time: '11:00 AM',
    location: 'Virtual',
    category: 'media',
    status: 'upcoming',
    eventType: 'PARTNER',
    attendees: [
      { name: 'Sammy', role: 'founder' },
      { name: 'TC Reporter', role: 'press' },
    ],
  },
  {
    id: 'be-8',
    title: 'Provisional Patent Extension Filing',
    date: '2026-03-20',
    time: '12:00 PM',
    location: 'USPTO (Online)',
    category: 'legal',
    status: 'upcoming',
    eventType: 'INTERNAL',
    attendees: [
      { name: 'Sammy', role: 'founder' },
      { name: 'IP Counsel', role: 'legal' },
    ],
  },
  // ─── Completed (4) ───
  {
    id: 'be-9',
    title: 'FMU Athletics — Product Demo',
    date: '2026-02-10',
    time: '3:00 PM',
    location: 'FMU Campus, Miami Gardens',
    category: 'product',
    status: 'completed',
    eventType: 'DEMO',
    attendees: [
      { name: 'Sammy', role: 'founder' },
      { name: 'Coach Davis', role: 'partner' },
      { name: 'AD Williams', role: 'partner' },
    ],
    outcome: 'Positive reception. Sports Mode v2 approved for expanded rollout.',
  },
  {
    id: 'be-10',
    title: 'ICCLA — Church Mode Walkthrough',
    date: '2026-02-05',
    time: '10:00 AM',
    location: 'Virtual',
    category: 'product',
    status: 'completed',
    eventType: 'DEMO',
    attendees: [
      { name: 'Sammy', role: 'founder' },
      { name: 'Pastor Richards', role: 'partner' },
      { name: 'Admin Team (3)', role: 'staff' },
    ],
    outcome: 'Church Mode onboarding confirmed. Launch date set for March 2026.',
  },
  {
    id: 'be-11',
    title: 'Delaware Corp Formation — Final Filing',
    date: '2026-01-15',
    time: '9:00 AM',
    location: 'Online Filing',
    category: 'legal',
    status: 'completed',
    eventType: 'INTERNAL',
    attendees: [
      { name: 'Sammy', role: 'founder' },
      { name: 'Corporate Counsel', role: 'legal' },
    ],
    outcome: 'C-Corp formation complete. EIN issued.',
  },
  {
    id: 'be-12',
    title: 'Backstage Capital — Intro Call',
    date: '2026-02-03',
    time: '1:00 PM',
    location: 'Virtual',
    category: 'investor',
    status: 'completed',
    eventType: 'INVESTOR',
    attendees: [
      { name: 'Sammy', role: 'founder' },
      { name: 'Arlan Hamilton', role: 'investor' },
    ],
    outcome: 'Strong interest. Requested data room access and follow-up in March.',
  },
];

// =============================================================================
// 3. PRODUCT MILESTONES
// =============================================================================

export interface ProductMilestone {
  id: string;
  name: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  date?: string;
  description: string;
}

export const PRODUCT_MILESTONES: ProductMilestone[] = [
  {
    id: 'pm-1',
    name: 'Stage 1 Demo Seed',
    status: 'completed',
    date: '2026-01-15',
    description: 'Initial data seeding for FMU Lions — 20 recruits, 3 game plans, 8 DM threads, full finance + payment rails',
  },
  {
    id: 'pm-2',
    name: 'Sports Mode Live',
    status: 'completed',
    date: '2026-02-10',
    description: 'Full Sports Mode v2: 4-pill home, 10-tab org, roster CRM, recruiting board, calendar, entity sheets',
  },
  {
    id: 'pm-3',
    name: '4-Mode Expansion',
    status: 'in_progress',
    date: '2026-03-01',
    description: 'Church, Education, Business, and Competition modes with shared infrastructure and mode-specific RBAC',
  },
  {
    id: 'pm-4',
    name: 'National Player Pool',
    status: 'in_progress',
    date: '2026-03-15',
    description: 'Scraper pipeline for NJCAA (D1/D2/D3), NAIA, CCCAA — 500+ team rosters indexed',
  },
  {
    id: 'pm-5',
    name: 'Church Mode Live',
    status: 'upcoming',
    date: '2026-03-30',
    description: 'ICCLA onboarding complete — member management, giving, groups, event calendar, pastoral tools',
  },
  {
    id: 'pm-6',
    name: 'Education Mode Live',
    status: 'upcoming',
    date: '2026-04-15',
    description: 'FMU integration — academic tracking, department org, student services, compliance',
  },
  {
    id: 'pm-7',
    name: 'Competition Mode Live',
    status: 'upcoming',
    date: '2026-05-01',
    description: 'K-1 Grand Prix integration — event management, fighter profiles, bracket engine, broadcast tools',
  },
  {
    id: 'pm-8',
    name: 'Series A',
    status: 'upcoming',
    date: '2026-09-01',
    description: 'Target $8-12M raise with 4 live modes, proven multi-institution traction, and national player pool',
  },
];

// =============================================================================
// 4. FUNDRAISE METRICS
// =============================================================================

export interface FundraiseMetrics {
  currentRound: string;
  target: number;
  raised: number;
  activeConversations: number;
  proposalsSent: number;
  burnRate: number;
  runway: number;
  period: string;
}

export const FUNDRAISE_METRICS: FundraiseMetrics = {
  currentRound: 'seed',
  target: 3_000_000,
  raised: 150_000,
  activeConversations: 12,
  proposalsSent: 4,
  burnRate: 18_000,
  runway: 8,
  period: 'Feb 2026',
};

// =============================================================================
// 5. TRACTION METRICS
// =============================================================================

export interface TractionMetrics {
  institutions: number;
  institutionNames: string[];
  activeViews: number;
  ipDocs: number;
  enginesBuilt: number;
  transactionsProcessed: number;
  period: string;
}

export const TRACTION_METRICS: TractionMetrics = {
  institutions: 3,
  institutionNames: ['FMU Lions', 'ICCLA', 'K-1 Grand Prix'],
  activeViews: 5,
  ipDocs: 6,
  enginesBuilt: 5,
  transactionsProcessed: 1_240,
  period: 'Feb 2026',
};

// =============================================================================
// 6. BIZ NEWS
// =============================================================================

export interface BizNewsItem {
  id: string;
  type: 'video' | 'article';
  headline: string;
  date: string;
  category: 'product' | 'founder' | 'press' | 'investor' | 'partnership';
  speaker?: string;
  duration?: string;
  thumbnailColor?: string;
}

export const BIZ_NEWS: BizNewsItem[] = [
  {
    id: 'bn-1',
    type: 'video',
    headline: 'KaNeXT Demo Day — Sports Mode v2 Walkthrough',
    date: '2026-02-12',
    category: 'product',
    speaker: 'Sammy',
    duration: '8:42',
    thumbnailColor: '#1a1a2e',
  },
  {
    id: 'bn-2',
    type: 'article',
    headline: 'Why Institutions Need Their Own OS',
    date: '2026-02-08',
    category: 'founder',
  },
  {
    id: 'bn-3',
    type: 'video',
    headline: 'Founder Story — Building KaNeXT from Miami',
    date: '2026-01-28',
    category: 'founder',
    speaker: 'Sammy',
    duration: '12:15',
    thumbnailColor: '#0f3460',
  },
  {
    id: 'bn-4',
    type: 'article',
    headline: 'HBCU Athletics and the Technology Gap',
    date: '2026-01-20',
    category: 'press',
  },
  {
    id: 'bn-5',
    type: 'video',
    headline: 'KaNeXT Player Pool — National Recruiting Database',
    date: '2026-02-15',
    category: 'product',
    speaker: 'Sammy',
    duration: '6:30',
    thumbnailColor: '#16213e',
  },
  {
    id: 'bn-6',
    type: 'article',
    headline: 'Backstage Capital Explores Institutional SaaS Bet',
    date: '2026-02-04',
    category: 'investor',
  },
  {
    id: 'bn-7',
    type: 'article',
    headline: 'FMU Lions Go Digital — KaNeXT Partnership Announced',
    date: '2026-02-11',
    category: 'partnership',
  },
  {
    id: 'bn-8',
    type: 'video',
    headline: 'Church Mode Preview — Serving Houses of Worship',
    date: '2026-02-17',
    category: 'product',
    speaker: 'Sammy',
    duration: '5:18',
    thumbnailColor: '#533483',
  },
];

// =============================================================================
// 7. VAULT FOLDERS
// =============================================================================

export interface VaultFolder {
  id: string;
  name: string;
  documentCount: number;
  lastUpdated: string;
  accessLevel: 'public' | 'investor' | 'board' | 'founder_only';
}

export const VAULT_FOLDERS: VaultFolder[] = [
  { id: 'vf-1', name: 'Corporate', documentCount: 3, lastUpdated: '2026-01-15', accessLevel: 'board' },
  { id: 'vf-2', name: 'Financial', documentCount: 2, lastUpdated: '2026-02-01', accessLevel: 'investor' },
  { id: 'vf-3', name: 'Product', documentCount: 2, lastUpdated: '2026-02-14', accessLevel: 'investor' },
  { id: 'vf-4', name: 'Legal', documentCount: 2, lastUpdated: '2026-01-20', accessLevel: 'founder_only' },
  { id: 'vf-5', name: 'IP', documentCount: 2, lastUpdated: '2026-02-10', accessLevel: 'board' },
  { id: 'vf-6', name: 'Team', documentCount: 1, lastUpdated: '2026-02-05', accessLevel: 'founder_only' },
];

// =============================================================================
// 8. VAULT DOCUMENTS
// =============================================================================

export type BizDocumentCategory = 'contract' | 'invoice' | 'proposal' | 'financial' | 'legal';

export interface VaultDocument {
  id: string;
  folderId: string;
  name: string;
  type: 'pdf' | 'doc' | 'spreadsheet' | 'deck';
  uploadDate: string;
  lastModified: string;
  size: string;
  accessLevel: 'public' | 'investor' | 'board' | 'founder_only';
  version: string;
  tags?: string[];
}

export const VAULT_DOCUMENTS: VaultDocument[] = [
  // Corporate
  { id: 'vd-1', folderId: 'vf-1', name: 'Certificate of Incorporation', type: 'pdf', uploadDate: '2026-01-15', lastModified: '2026-01-15', size: '245 KB', accessLevel: 'board', version: '1.0', tags: ['corporate', 'legal'] },
  { id: 'vd-2', folderId: 'vf-1', name: 'Bylaws', type: 'doc', uploadDate: '2026-01-15', lastModified: '2026-01-15', size: '182 KB', accessLevel: 'board', version: '1.0', tags: ['corporate', 'legal'] },
  { id: 'vd-3', folderId: 'vf-1', name: 'Board Consent — Initial Actions', type: 'pdf', uploadDate: '2026-01-15', lastModified: '2026-01-15', size: '98 KB', accessLevel: 'board', version: '1.0', tags: ['corporate'] },
  // Financial
  { id: 'vd-4', folderId: 'vf-2', name: 'Seed Pitch Deck', type: 'deck', uploadDate: '2026-01-20', lastModified: '2026-02-01', size: '8.4 MB', accessLevel: 'investor', version: '3.2', tags: ['financial', 'proposal'] },
  { id: 'vd-5', folderId: 'vf-2', name: 'Financial Model — 3-Year Projection', type: 'spreadsheet', uploadDate: '2026-01-18', lastModified: '2026-01-28', size: '1.2 MB', accessLevel: 'investor', version: '2.1', tags: ['financial'] },
  // Product
  { id: 'vd-6', folderId: 'vf-3', name: 'Product Spec v3.0', type: 'doc', uploadDate: '2026-01-10', lastModified: '2026-02-14', size: '3.1 MB', accessLevel: 'investor', version: '3.0', tags: ['proposal'] },
  { id: 'vd-7', folderId: 'vf-3', name: 'Architecture Overview', type: 'deck', uploadDate: '2026-02-01', lastModified: '2026-02-10', size: '5.6 MB', accessLevel: 'investor', version: '1.5' },
  // Legal
  { id: 'vd-8', folderId: 'vf-4', name: 'SAFE Agreement Template', type: 'pdf', uploadDate: '2026-01-20', lastModified: '2026-01-20', size: '312 KB', accessLevel: 'founder_only', version: '1.0', tags: ['legal', 'contract'] },
  { id: 'vd-9', folderId: 'vf-4', name: 'Advisor Agreement Template', type: 'doc', uploadDate: '2026-01-20', lastModified: '2026-01-20', size: '156 KB', accessLevel: 'founder_only', version: '1.0', tags: ['legal', 'contract'] },
  // IP
  { id: 'vd-10', folderId: 'vf-5', name: 'Provisional Patent — Unified Institutional OS', type: 'pdf', uploadDate: '2026-02-08', lastModified: '2026-02-10', size: '1.8 MB', accessLevel: 'board', version: '1.0', tags: ['legal'] },
  { id: 'vd-11', folderId: 'vf-5', name: 'Trademark Application — KaNeXT', type: 'pdf', uploadDate: '2026-01-22', lastModified: '2026-01-25', size: '420 KB', accessLevel: 'board', version: '1.0', tags: ['legal'] },
  // Team
  { id: 'vd-12', folderId: 'vf-6', name: 'Org Chart + Hiring Plan', type: 'spreadsheet', uploadDate: '2026-01-28', lastModified: '2026-02-05', size: '680 KB', accessLevel: 'founder_only', version: '1.3' },
];

// =============================================================================
// 9. CAP TABLE
// =============================================================================

export interface CapTableEntry {
  id: string;
  name: string;
  percentage: number;
  shareClass: 'common' | 'preferred' | 'options';
  investmentAmount?: number;
  date?: string;
  boardSeat?: boolean;
}

export const CAP_TABLE: CapTableEntry[] = [
  {
    id: 'ct-1',
    name: 'Sammy (Founder)',
    percentage: 85.0,
    shareClass: 'common',
    date: '2026-01-15',
    boardSeat: true,
  },
  {
    id: 'ct-2',
    name: 'Advisor Pool',
    percentage: 5.0,
    shareClass: 'options',
    date: '2026-01-15',
  },
  {
    id: 'ct-3',
    name: 'Employee Option Pool (Reserved)',
    percentage: 8.0,
    shareClass: 'options',
    date: '2026-01-15',
  },
  {
    id: 'ct-4',
    name: 'Angel Investors (SAFE)',
    percentage: 2.0,
    shareClass: 'preferred',
    investmentAmount: 150_000,
    date: '2026-02-01',
  },
];

// =============================================================================
// 10. PROOF INSTITUTIONS
// =============================================================================

export interface ProofInstitution {
  id: string;
  name: string;
  mode: 'sports' | 'church' | 'education' | 'competition';
  status: 'live' | 'onboarding' | 'signed' | 'prospect';
  activeViews: number;
  keyMetrics: string;
  sinceDate: string;
}

export const PROOF_INSTITUTIONS: ProofInstitution[] = [
  {
    id: 'pi-1',
    name: 'FMU Lions',
    mode: 'sports',
    status: 'live',
    activeViews: 22,
    keyMetrics: 'Full Sports Mode v2 · Roster CRM · Recruiting Board · 5 settled transactions',
    sinceDate: '2026-01-15',
  },
  {
    id: 'pi-2',
    name: 'ICCLA',
    mode: 'church',
    status: 'onboarding',
    activeViews: 8,
    keyMetrics: 'Church Mode beta · Member management · Giving portal · Event calendar',
    sinceDate: '2026-02-05',
  },
  {
    id: 'pi-4',
    name: 'K-1 Grand Prix',
    mode: 'competition',
    status: 'signed',
    activeViews: 3,
    keyMetrics: 'Competition Mode design phase · Event management · Bracket engine · Broadcast tools',
    sinceDate: '2026-02-10',
  },
];

// =============================================================================
// 11. DEALS
// =============================================================================

export type BizDealStage = 'lead' | 'contacted' | 'meeting_set' | 'proposal_sent' | 'negotiating' | 'due_diligence' | 'closed_won' | 'closed_lost';

export const DEAL_STAGE_LABELS: Record<BizDealStage, string> = {
  lead: 'Lead',
  contacted: 'Contacted',
  meeting_set: 'Meeting Set',
  proposal_sent: 'Proposal Sent',
  negotiating: 'Negotiating',
  due_diligence: 'Due Diligence',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

export interface Deal {
  id: string;
  contactName: string;
  company: string;
  dealType: 'investor' | 'partner' | 'client' | 'licensing';
  stage: BizDealStage;
  value?: number;
  valuation?: number;
  lastContact: string;
  lastActivity?: string;
  nextAction: string;
  priority: 'high' | 'medium' | 'low';
  owner?: string;
  assignedTo?: string;
}

export const DEALS: Deal[] = [
  {
    id: 'd-1',
    contactName: 'Michael Mignano',
    company: 'Lightspeed Venture Partners',
    dealType: 'investor',
    stage: 'meeting_set',
    value: 1_500_000,
    valuation: 15_000_000,
    lastContact: '2026-02-16',
    lastActivity: 'Sent updated pitch deck v3.2',
    nextAction: 'Pitch meeting Feb 24 — prepare updated deck',
    priority: 'high',
    owner: 'Sammy',
    assignedTo: 'Sammy (Founder)',
  },
  {
    id: 'd-2',
    contactName: 'Charles Hudson',
    company: 'Precursor Ventures',
    dealType: 'investor',
    stage: 'meeting_set',
    value: 500_000,
    valuation: 12_000_000,
    lastContact: '2026-02-14',
    lastActivity: 'Sent data room access link',
    nextAction: 'Pitch Feb 27 — send data room access',
    priority: 'high',
    owner: 'Sammy',
    assignedTo: 'Sammy (Founder)',
  },
  {
    id: 'd-3',
    contactName: 'Arlan Hamilton',
    company: 'Backstage Capital',
    dealType: 'investor',
    stage: 'proposal_sent',
    value: 750_000,
    valuation: 12_000_000,
    lastContact: '2026-02-03',
    lastActivity: 'Moved to Proposal Sent — SAFE terms shared',
    nextAction: 'Follow-up call — review SAFE terms',
    priority: 'high',
    owner: 'Sammy',
    assignedTo: 'Sammy (Founder)',
  },
  {
    id: 'd-4',
    contactName: 'Ulili Onovakpuri',
    company: 'Kapor Capital',
    dealType: 'investor',
    stage: 'contacted',
    value: 1_000_000,
    valuation: 15_000_000,
    lastContact: '2026-02-12',
    lastActivity: 'Sent impact metrics summary',
    nextAction: 'Send impact metrics doc before March 10 meeting',
    priority: 'medium',
    owner: 'Sammy',
    assignedTo: 'Sammy (Founder)',
  },
  {
    id: 'd-5',
    contactName: 'Henri Pierre-Jacques',
    company: 'Harlem Capital',
    dealType: 'investor',
    stage: 'lead',
    value: 750_000,
    valuation: 12_000_000,
    lastContact: '2026-02-08',
    lastActivity: 'Intro call — strong alignment on thesis',
    nextAction: 'Intro email sent — confirm March 17 meeting',
    priority: 'medium',
    owner: 'Sammy',
    assignedTo: 'Sammy (Founder)',
  },
  {
    id: 'd-6',
    contactName: 'Jerome Williams',
    company: 'FMU Athletics',
    dealType: 'client',
    stage: 'closed_won',
    value: 24_000,
    lastContact: '2026-02-10',
    lastActivity: 'Sports Mode v2 approved for expanded rollout',
    nextAction: 'Quarterly check-in — usage review',
    priority: 'medium',
    owner: 'Sammy',
    assignedTo: 'Sammy (Founder)',
  },
  {
    id: 'd-7',
    contactName: 'Pastor David Richards',
    company: 'ICCLA',
    dealType: 'client',
    stage: 'negotiating',
    value: 18_000,
    lastContact: '2026-02-05',
    lastActivity: 'Church Mode walkthrough — onboarding confirmed',
    nextAction: 'Finalize annual contract terms',
    priority: 'medium',
    owner: 'Sammy',
    assignedTo: 'Sammy (Founder)',
  },
  {
    id: 'd-8',
    contactName: 'Marcus Chen',
    company: 'K-1 Global Holdings',
    dealType: 'partner',
    stage: 'due_diligence',
    value: 50_000,
    lastContact: '2026-02-10',
    lastActivity: 'API spec review — bracket engine integration',
    nextAction: 'Technical integration review — API spec delivery',
    priority: 'high',
    owner: 'Sammy',
    assignedTo: 'Sammy (Founder)',
  },
];

// =============================================================================
// 12. DEAL STAGES
// =============================================================================

export const DEAL_STAGES: { key: string; label: string; color: string; count: number }[] = [
  { key: 'lead', label: 'Lead', color: '#6B7280', count: 1 },
  { key: 'contacted', label: 'Contacted', color: '#3B82F6', count: 1 },
  { key: 'meeting_set', label: 'Meeting Set', color: '#8B5CF6', count: 2 },
  { key: 'proposal_sent', label: 'Proposal Sent', color: '#F59E0B', count: 1 },
  { key: 'negotiating', label: 'Negotiating', color: '#F97316', count: 1 },
  { key: 'due_diligence', label: 'Due Diligence', color: '#EC4899', count: 1 },
  { key: 'closed_won', label: 'Closed Won', color: '#10B981', count: 1 },
  { key: 'closed_lost', label: 'Closed Lost', color: '#EF4444', count: 0 },
];

// =============================================================================
// 13. BIZ CONTACTS
// =============================================================================

export interface BizContact {
  id: string;
  name: string;
  company: string;
  role: string;
  relationshipType: 'investor' | 'partner' | 'client' | 'advisor' | 'press' | 'vendor';
  status: 'active' | 'inactive' | 'prospect';
  lastContact: string;
  activeDealId?: string;
}

export const BIZ_CONTACTS: BizContact[] = [
  { id: 'bc-1', name: 'Michael Mignano', company: 'Lightspeed Venture Partners', role: 'Partner', relationshipType: 'investor', status: 'active', lastContact: '2026-02-16', activeDealId: 'd-1' },
  { id: 'bc-2', name: 'Charles Hudson', company: 'Precursor Ventures', role: 'Managing Partner', relationshipType: 'investor', status: 'active', lastContact: '2026-02-14', activeDealId: 'd-2' },
  { id: 'bc-3', name: 'Arlan Hamilton', company: 'Backstage Capital', role: 'Founder & GP', relationshipType: 'investor', status: 'active', lastContact: '2026-02-03', activeDealId: 'd-3' },
  { id: 'bc-4', name: 'Ulili Onovakpuri', company: 'Kapor Capital', role: 'Managing Partner', relationshipType: 'investor', status: 'active', lastContact: '2026-02-12', activeDealId: 'd-4' },
  { id: 'bc-5', name: 'Henri Pierre-Jacques', company: 'Harlem Capital', role: 'Co-Founder & GP', relationshipType: 'investor', status: 'prospect', lastContact: '2026-02-08', activeDealId: 'd-5' },
  { id: 'bc-6', name: 'Jerome Williams', company: 'FMU Athletics', role: 'Athletic Director', relationshipType: 'client', status: 'active', lastContact: '2026-02-10', activeDealId: 'd-6' },
  { id: 'bc-7', name: 'Pastor David Richards', company: 'ICCLA', role: 'Senior Pastor', relationshipType: 'client', status: 'active', lastContact: '2026-02-05', activeDealId: 'd-7' },
  { id: 'bc-8', name: 'Marcus Chen', company: 'K-1 Global Holdings', role: 'VP of Technology', relationshipType: 'partner', status: 'active', lastContact: '2026-02-10', activeDealId: 'd-8' },
  { id: 'bc-9', name: 'Jordan Taylor', company: 'Wilson Sonsini', role: 'Startup Counsel', relationshipType: 'vendor', status: 'active', lastContact: '2026-01-20' },
  { id: 'bc-10', name: 'Kendra Brooks', company: 'TechCrunch', role: 'Senior Reporter', relationshipType: 'press', status: 'prospect', lastContact: '2026-02-15' },
];

// =============================================================================
// 14. RECENT ACTIVITY
// =============================================================================

export interface ActivityEntry {
  id: string;
  timestamp: string;
  type: 'call' | 'email' | 'meeting' | 'document' | 'stage_change' | 'note';
  description: string;
  dealId?: string;
  contactName?: string;
}

export const RECENT_ACTIVITY: ActivityEntry[] = [
  {
    id: 'ra-1',
    timestamp: '2026-02-18T09:15:00',
    type: 'email',
    description: 'Sent updated pitch deck v3.2 to Lightspeed',
    dealId: 'd-1',
    contactName: 'Michael Mignano',
  },
  {
    id: 'ra-2',
    timestamp: '2026-02-17T16:30:00',
    type: 'stage_change',
    description: 'Backstage Capital moved to Proposal Sent',
    dealId: 'd-3',
    contactName: 'Arlan Hamilton',
  },
  {
    id: 'ra-3',
    timestamp: '2026-02-17T14:00:00',
    type: 'call',
    description: '30-min intro call with Harlem Capital — strong alignment on thesis',
    dealId: 'd-5',
    contactName: 'Henri Pierre-Jacques',
  },
  {
    id: 'ra-4',
    timestamp: '2026-02-16T11:00:00',
    type: 'document',
    description: 'Uploaded Financial Model v2.1 to data room',
  },
  {
    id: 'ra-5',
    timestamp: '2026-02-15T15:45:00',
    type: 'email',
    description: 'Sent data room access link to Precursor Ventures',
    dealId: 'd-2',
    contactName: 'Charles Hudson',
  },
  {
    id: 'ra-6',
    timestamp: '2026-02-14T10:00:00',
    type: 'meeting',
    description: 'Product demo with FMU coaching staff — Sports Mode v2 approved',
    dealId: 'd-6',
    contactName: 'Jerome Williams',
  },
  {
    id: 'ra-7',
    timestamp: '2026-02-13T09:30:00',
    type: 'note',
    description: 'K-1 integration spec: need bracket engine API by March 15',
    dealId: 'd-8',
    contactName: 'Marcus Chen',
  },
  {
    id: 'ra-8',
    timestamp: '2026-02-12T16:00:00',
    type: 'email',
    description: 'Sent impact metrics summary to Kapor Capital',
    dealId: 'd-4',
    contactName: 'Ulili Onovakpuri',
  },
  {
    id: 'ra-9',
    timestamp: '2026-02-10T13:00:00',
    type: 'meeting',
    description: 'ICCLA Church Mode walkthrough — onboarding confirmed for March',
    dealId: 'd-7',
    contactName: 'Pastor David Richards',
  },
  {
    id: 'ra-10',
    timestamp: '2026-02-08T11:30:00',
    type: 'document',
    description: 'Filed provisional patent — Unified Institutional OS architecture',
  },
  {
    id: 'ra-11',
    timestamp: '2026-02-05T14:00:00',
    type: 'call',
    description: 'IP counsel review — trademark application for KaNeXT submitted',
    contactName: 'Jordan Taylor',
  },
  {
    id: 'ra-12',
    timestamp: '2026-02-03T13:00:00',
    type: 'meeting',
    description: 'Backstage Capital intro call — Arlan requested data room access',
    dealId: 'd-3',
    contactName: 'Arlan Hamilton',
  },
];

// =============================================================================
// 15. BIZ HERO
// =============================================================================

export interface BizHeroData {
  title: string;
  subtitle: string;
  isLive: boolean;
}

export const BIZ_HERO: BizHeroData = {
  title: 'KaNeXT OS',
  subtitle: 'The operating system for institutions',
  isLive: true,
};

// =============================================================================
// 16. BIZ COMMERCE CARDS
// =============================================================================

export interface BizCommerceCard {
  id: string;
  title: string;
  icon: string;
  color: string;
}

export const BIZ_COMMERCE: BizCommerceCard[] = [
  { id: 'bcc-1', title: 'Invoice', icon: 'doc.text.fill', color: '#10B981' },
  { id: 'bcc-2', title: 'Expense', icon: 'creditcard.fill', color: '#3B82F6' },
  { id: 'bcc-3', title: 'Reports', icon: 'chart.bar.fill', color: '#8B5CF6' },
];

// =============================================================================
// 17. PIPELINE SUMMARY
// =============================================================================

export const PIPELINE_SUMMARY = {
  activeDeals: 7,
  proposalStage: 1,
  negotiating: 1,
  totalPipelineValue: 4_592_000,
  winRate: 0.14,
} as const;

// =============================================================================
// 18. BIZ ACTION ROW (replaces Commerce Row for dashboard)
// =============================================================================

export type BizActionCardId = 'deck' | 'data_room' | 'invest';

export interface BizActionCard {
  id: BizActionCardId;
  title: string;
  detail: string;
  icon: string;
  color: string;
}

export const BIZ_ACTION_ROW: BizActionCard[] = [
  { id: 'deck', title: 'Deck', detail: 'Pitch Deck & Overview', icon: 'doc.richtext.fill', color: '#8B5CF6' },
  { id: 'data_room', title: 'Data Room', detail: 'Due Diligence & Proof', icon: 'folder.fill', color: '#3B82F6' },
  { id: 'invest', title: 'Invest', detail: 'Back KaNeXT', icon: 'dollarsign.circle.fill', color: '#10B981' },
];

// =============================================================================
// 19. CURRENT ROUND
// =============================================================================

export interface CurrentRound {
  name: string;
  instrument: string;
  cap: number;
  discount: number;
  raised: number;
  target: number;
}

export const CURRENT_ROUND: CurrentRound = {
  name: 'Family Round',
  instrument: 'SAFE',
  cap: 100_000_000,
  discount: 20,
  raised: 150_000,
  target: 1_000_000,
};

// =============================================================================
// 20. INVEST TIERS
// =============================================================================

export interface InvestTier {
  id: string;
  label: string;
  amount: number;
  description: string;
}

export const INVEST_TIERS: InvestTier[] = [
  { id: 'tier-1', label: '$10K', amount: 10_000, description: 'Angel' },
  { id: 'tier-2', label: '$25K', amount: 25_000, description: 'Pre-Seed' },
  { id: 'tier-3', label: '$50K', amount: 50_000, description: 'Seed Supporter' },
  { id: 'tier-4', label: '$100K', amount: 100_000, description: 'Lead Investor' },
  { id: 'tier-5', label: '$250K+', amount: 250_000, description: 'Strategic Partner' },
];

// =============================================================================
// 21. SAFE TERMS
// =============================================================================

export interface SafeTerms {
  instrument: string;
  cap: string;
  discount: string;
  mfn: boolean;
  proRata: boolean;
  regDDisclaimer: string;
}

export const SAFE_TERMS: SafeTerms = {
  instrument: 'Post-Money SAFE',
  cap: '$100M valuation cap',
  discount: '20% discount to next priced round',
  mfn: true,
  proRata: true,
  regDDisclaimer: 'Securities offered under Regulation D Rule 506(b). Available to accredited investors only. This is not a public offering.',
};

// =============================================================================
// 22. DECK DOCUMENTS
// =============================================================================

export interface DeckDocument {
  id: string;
  title: string;
  type: 'deck' | 'pdf' | 'video' | 'doc';
  size: string;
  isPrimary?: boolean;
}

export const DECK_DOCUMENTS: DeckDocument[] = [
  { id: 'dd-1', title: 'Seed Pitch Deck', type: 'deck', size: '8.4 MB', isPrimary: true },
  { id: 'dd-2', title: 'One-Pager', type: 'pdf', size: '1.2 MB' },
  { id: 'dd-3', title: 'Executive Summary', type: 'doc', size: '420 KB' },
  { id: 'dd-4', title: 'Product Demo Video', type: 'video', size: '45 MB' },
];

// =============================================================================
// 23. BIZ DOMAIN CARDS
// =============================================================================

export type BizDomainCardId = 'cap_table' | 'metrics' | 'updates';

export interface BizDomainCard {
  id: BizDomainCardId;
  title: string;
  icon: string;
  accent: string;
  preview: string;
}

export const BIZ_DOMAIN_CARDS: BizDomainCard[] = [
  { id: 'cap_table', title: 'Cap Table', icon: 'chart.pie.fill', accent: '#8B5CF6', preview: '85% founder · 5% advisor · 8% ESOP · 2% SAFE' },
  { id: 'metrics', title: 'Metrics', icon: 'chart.line.uptrend.xyaxis', accent: '#3B82F6', preview: '3 institutions · 5 active views · 5 engines built' },
  { id: 'updates', title: 'Updates', icon: 'megaphone.fill', accent: '#F59E0B', preview: 'Latest: Sports Mode v2 approved for expanded rollout' },
];

// =============================================================================
// 24. INVEST PAYMENT CHAIN BUILDER
// =============================================================================

export function buildInvestChain(amount: number, tierLabel: string) {
  const now = new Date();
  const ts = (offsetMs: number) => {
    const d = new Date(now.getTime() + offsetMs);
    return d.toISOString().replace('T', ' ').slice(0, 19);
  };
  const num = Math.floor(1000 + Math.random() * 9000);
  const transactionId = `SAFE-2026-${num}`;

  return {
    transactionId,
    type: 'SAFE Investment',
    amount,
    description: `${tierLabel} — Family Round SAFE`,
    status: 'Settled' as const,
    chain: [
      { stage: 'Initiation', detail: `Investment initiated — ${tierLabel}`, timestamp: ts(0) },
      { stage: 'Accreditation', detail: 'Accredited investor verification confirmed', timestamp: ts(500) },
      { stage: 'KYC/AML', detail: 'Identity and compliance checks passed', timestamp: ts(1200) },
      { stage: 'Escrow', detail: `$${amount.toLocaleString()} received into escrow`, timestamp: ts(2000) },
      { stage: 'SAFE Execution', detail: 'Post-Money SAFE countersigned', timestamp: ts(3000) },
      { stage: 'Ledger', detail: `Cap table updated — ${transactionId}`, timestamp: ts(3500) },
    ],
  };
}
```

## Section H: Entity Sheets

### H1. utils/global-entity-sheets.ts

```typescript
/**
 * Global Entity Sheet Controller
 * Module-level register/open/close for entity card sheets.
 * Follows the same pattern as global-team-sheet.ts.
 */

export interface TeamCardData {
  name: string;
  record?: string;
  confRecord?: string;
  conference?: string;
  teamKR?: number;
  logoUri?: string;
  category?: string;
}

export interface PlayerCardData {
  name: string;
  number: string;
  position: string;
  height: string;
  weight: number;
  classYear: string;
  hometown?: string;
  previousSchool?: string;
  kr?: number;
  teamColor?: string;
  ppg?: number;
  rpg?: number;
  apg?: number;
  // Extended fields for full intelligence display
  playerId?: string;
  school?: string;
  conference?: string;
  levelKey?: string;
  levelDisplay?: string;
  offKR?: number;
  defKR?: number;
  archetype?: string;
  confidence?: number;
  clusters?: Record<string, number>;
  spg?: number;
  bpg?: number;
  topg?: number;
  fgPct?: number;
  threePct?: number;
  ftPct?: number;
  mpg?: number;
  gp?: number;
  bprAvg?: number;
  portalEntryDate?: string | null;
  scholarshipPct?: number;
  nilAmount?: number;
  overallFitPct?: number;
}

export interface CoachCardData {
  name: string;
  title: string;
  bio?: string;
  recordAtInstitution?: string;
}

export interface DriverCardData {
  name: string;
  number: string;
  team: string;
  points?: number;
  wins?: number;
  podiums?: number;
  category?: string;
}

export interface CrewCardData {
  name: string;
  role: string;
  team: string;
  pitScore?: number;
}

export interface PersonCardData {
  name: string;
  role: string;
  ministries?: string[];
  status?: string;
}

export interface MinistryCardData {
  name: string;
  icon?: string;
  mission?: string;
  volunteers?: number;
  leader?: string;
}

export interface LeaderCardData {
  name: string;
  title: string;
  ministries?: string[];
  bio?: string;
}

type OpenTeamCard = (data: TeamCardData) => void;
type OpenPlayerCard = (data: PlayerCardData) => void;
type OpenCoachCard = (data: CoachCardData) => void;
type OpenDriverCard = (data: DriverCardData) => void;
type OpenCrewCard = (data: CrewCardData) => void;
type OpenPersonCard = (data: PersonCardData) => void;
type OpenMinistryCard = (data: MinistryCardData) => void;
type OpenLeaderCard = (data: LeaderCardData) => void;
type CloseHandler = () => void;

let _openTeamCard: OpenTeamCard | null = null;
let _closeTeamCard: CloseHandler | null = null;
let _openPlayerCard: OpenPlayerCard | null = null;
let _closePlayerCard: CloseHandler | null = null;
let _openCoachCard: OpenCoachCard | null = null;
let _closeCoachCard: CloseHandler | null = null;
let _openDriverCard: OpenDriverCard | null = null;
let _closeDriverCard: CloseHandler | null = null;
let _openCrewCard: OpenCrewCard | null = null;
let _closeCrewCard: CloseHandler | null = null;
let _openPersonCard: OpenPersonCard | null = null;
let _closePersonCard: CloseHandler | null = null;
let _openMinistryCard: OpenMinistryCard | null = null;
let _closeMinistryCard: CloseHandler | null = null;
let _openLeaderCard: OpenLeaderCard | null = null;
let _closeLeaderCard: CloseHandler | null = null;

export function registerEntitySheetHandlers(handlers: {
  openTeamCard: OpenTeamCard;
  closeTeamCard: CloseHandler;
  openPlayerCard: OpenPlayerCard;
  closePlayerCard: CloseHandler;
  openCoachCard: OpenCoachCard;
  closeCoachCard: CloseHandler;
  openDriverCard?: OpenDriverCard;
  closeDriverCard?: CloseHandler;
  openCrewCard?: OpenCrewCard;
  closeCrewCard?: CloseHandler;
  openPersonCard?: OpenPersonCard;
  closePersonCard?: CloseHandler;
  openMinistryCard?: OpenMinistryCard;
  closeMinistryCard?: CloseHandler;
  openLeaderCard?: OpenLeaderCard;
  closeLeaderCard?: CloseHandler;
}) {
  _openTeamCard = handlers.openTeamCard;
  _closeTeamCard = handlers.closeTeamCard;
  _openPlayerCard = handlers.openPlayerCard;
  _closePlayerCard = handlers.closePlayerCard;
  _openCoachCard = handlers.openCoachCard;
  _closeCoachCard = handlers.closeCoachCard;
  _openDriverCard = handlers.openDriverCard ?? null;
  _closeDriverCard = handlers.closeDriverCard ?? null;
  _openCrewCard = handlers.openCrewCard ?? null;
  _closeCrewCard = handlers.closeCrewCard ?? null;
  _openPersonCard = handlers.openPersonCard ?? null;
  _closePersonCard = handlers.closePersonCard ?? null;
  _openMinistryCard = handlers.openMinistryCard ?? null;
  _closeMinistryCard = handlers.closeMinistryCard ?? null;
  _openLeaderCard = handlers.openLeaderCard ?? null;
  _closeLeaderCard = handlers.closeLeaderCard ?? null;
}

export function openTeamCard(data: TeamCardData) {
  _openTeamCard?.(data);
}

export function closeTeamCard() {
  _closeTeamCard?.();
}

export function openPlayerCard(data: PlayerCardData) {
  _openPlayerCard?.(data);
}

export function closePlayerCard() {
  _closePlayerCard?.();
}

export function openCoachCard(data: CoachCardData) {
  _openCoachCard?.(data);
}

export function closeCoachCard() {
  _closeCoachCard?.();
}

export function openDriverCard(data: DriverCardData) {
  _openDriverCard?.(data);
}

export function closeDriverCard() {
  _closeDriverCard?.();
}

export function openCrewCard(data: CrewCardData) {
  _openCrewCard?.(data);
}

export function closeCrewCard() {
  _closeCrewCard?.();
}

export function openPersonCard(data: PersonCardData) {
  _openPersonCard?.(data);
}

export function closePersonCard() {
  _closePersonCard?.();
}

export function openMinistryCard(data: MinistryCardData) {
  _openMinistryCard?.(data);
}

export function closeMinistryCard() {
  _closeMinistryCard?.();
}

export function openLeaderCard(data: LeaderCardData) {
  _openLeaderCard?.(data);
}

export function closeLeaderCard() {
  _closeLeaderCard?.();
}
```

### H2. components/entity-sheets/player-card-sheet.tsx

```typescript
/**
 * Player Card Sheet — Full intelligence player preview bottom sheet.
 * Shows KR (level-aware), archetype, badges, clusters, stats, system fit.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { PlayerCardData } from '@/utils/global-entity-sheets';
import {
  getKRColor,
  getKRTierLabel,
  getKRBandLabel,
  getKRPercentileLabel,
  getArchetypeDisplay,
  CLUSTER_ORDER,
  CLUSTER_LABELS,
  BADGE_COLORS,
  BADGE_BG_COLORS,
  LEVEL_DISPLAY_SHORT,
} from '@/utils/kr-display';
import { computePlayerBadges, type PlayerBadge } from '@/utils/player-badges';

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  data: PlayerCardData | null;
}

export function PlayerCardSheet({ visible, onClose, data }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  if (!data) return null;

  const hue = data.teamColor ? nameToHue(data.teamColor) : nameToHue(data.name);
  const initials = data.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const kr = data.kr;
  const krColor = getKRColor(kr);
  const tierLabel = data.levelKey ? getKRTierLabel(kr, data.levelKey) : getKRBandLabel(kr);
  const archDisplay = getArchetypeDisplay(data.archetype);
  const levelTag = data.levelKey ? (LEVEL_DISPLAY_SHORT[data.levelKey] || data.levelDisplay || '') : '';

  // Compute badges if we have cluster data
  const badges: PlayerBadge[] = data.clusters
    ? computePlayerBadges(
        data.clusters as any,
        (clusterKey: string) => {
          const score = (data.clusters as Record<string, number>)?.[clusterKey] ?? 50;
          return [{ name: clusterKey, rating: score }];
        },
      )
    : [];

  const goldCount = badges.filter(b => b.level === 'Gold').length;
  const silverCount = badges.filter(b => b.level === 'Silver').length;
  const bronzeCount = badges.filter(b => b.level === 'Bronze').length;

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* ── HEADER ── */}
          <View style={styles.identityRow}>
            <View style={[styles.avatarCircle, { backgroundColor: `hsl(${hue}, 50%, 35%)` }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.playerName, { color: colors.text }]}>
                  {data.name}
                </Text>
                {data.number ? (
                  <Text style={[styles.jerseyBadge, { color: colors.textSecondary }]}>#{data.number}</Text>
                ) : null}
              </View>
              <Text style={[styles.playerMeta, { color: colors.textSecondary }]}>
                {data.position} · {data.height}{data.weight ? ` · ${data.weight} lbs` : ''} · {data.classYear}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                {data.school ? (
                  <Text style={[styles.schoolText, { color: colors.textSecondary }]}>{data.school}</Text>
                ) : null}
                {data.conference ? (
                  <Text style={[styles.confText, { color: colors.textTertiary }]}>· {data.conference}</Text>
                ) : null}
                {levelTag ? (
                  <View style={[styles.levelBadge, { backgroundColor: colors.border }]}>
                    <Text style={[styles.levelBadgeText, { color: colors.text }]}>{levelTag}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* ── KR SECTION ── */}
          {kr != null && (
            <View style={[styles.krCard, { backgroundColor: krColor + '15', borderColor: krColor + '40' }]}>
              <View style={styles.krRow}>
                <View style={[styles.krBadge, { backgroundColor: krColor }]}>
                  <Text style={styles.krNumber}>{Math.round(kr)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.krTierLabel, { color: krColor }]}>{tierLabel}</Text>
                  {data.levelKey && (
                    <Text style={[styles.krPercentile, { color: colors.textSecondary }]}>
                      {getKRPercentileLabel(kr, data.levelKey)} {levelTag ? `in ${levelTag}` : 'nationally'}
                    </Text>
                  )}
                </View>
                {data.bprAvg != null && (
                  <View style={styles.bprWrap}>
                    <Text style={[styles.bprLabel, { color: colors.textTertiary }]}>BPR</Text>
                    <Text style={[styles.bprValue, { color: colors.text }]}>{data.bprAvg.toFixed(1)}</Text>
                  </View>
                )}
              </View>
              {/* Off/Def KR breakdown */}
              {data.offKR != null && data.defKR != null && (
                <View style={styles.krBreakdownRow}>
                  <View style={styles.krBreakdownItem}>
                    <Text style={[styles.krBreakdownLabel, { color: colors.textTertiary }]}>OFF KR</Text>
                    <Text style={[styles.krBreakdownValue, { color: getKRColor(data.offKR) }]}>
                      {Math.round(data.offKR)}
                    </Text>
                  </View>
                  <View style={styles.krBreakdownItem}>
                    <Text style={[styles.krBreakdownLabel, { color: colors.textTertiary }]}>DEF KR</Text>
                    <Text style={[styles.krBreakdownValue, { color: getKRColor(data.defKR) }]}>
                      {Math.round(data.defKR)}
                    </Text>
                  </View>
                  {data.overallFitPct != null && (
                    <View style={styles.krBreakdownItem}>
                      <Text style={[styles.krBreakdownLabel, { color: colors.textTertiary }]}>FIT</Text>
                      <Text style={[styles.krBreakdownValue, { color: getKRColor(data.overallFitPct) }]}>
                        {Math.round(data.overallFitPct)}%
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* ── ARCHETYPE SECTION ── */}
          {data.archetype ? (
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>ARCHETYPE</Text>
              <Text style={[styles.archetypeText, { color: colors.text }]}>{archDisplay}</Text>
              {data.confidence != null && (
                <Text style={[styles.archetypeConfidence, { color: colors.textSecondary }]}>
                  {Math.round(data.confidence)}% confidence
                </Text>
              )}
            </View>
          ) : null}

          {/* ── BADGES SECTION ── */}
          {badges.length > 0 && (
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.badgeHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>BADGES</Text>
                <Text style={[styles.badgeSummary, { color: colors.textSecondary }]}>
                  {goldCount > 0 ? `${goldCount} Gold · ` : ''}{silverCount > 0 ? `${silverCount} Silver · ` : ''}{bronzeCount} Bronze
                </Text>
              </View>
              <View style={styles.badgeGrid}>
                {badges.map((badge, i) => (
                  <View
                    key={`${badge.name}-${i}`}
                    style={[styles.badgeChip, { backgroundColor: BADGE_BG_COLORS[badge.level], borderColor: BADGE_COLORS[badge.level] + '60' }]}
                  >
                    <View style={[styles.badgeDot, { backgroundColor: BADGE_COLORS[badge.level] }]} />
                    <Text style={[styles.badgeName, { color: colors.text }]}>{badge.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── CLUSTERS SECTION ── */}
          {data.clusters && (
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>SKILL CLUSTERS</Text>
              {CLUSTER_ORDER.map(key => {
                const score = (data.clusters as Record<string, number>)[key] ?? 50;
                const clusterColor = getKRColor(score);
                const label = CLUSTER_LABELS[key]?.label ?? key;
                const pct = Math.min(100, Math.max(0, score));
                return (
                  <View key={key} style={styles.clusterRow}>
                    <Text style={[styles.clusterLabel, { color: colors.textSecondary }]}>{label}</Text>
                    <View style={styles.clusterBarContainer}>
                      <View style={[styles.clusterBarBg, { backgroundColor: colors.border }]}>
                        <View style={[styles.clusterBarFill, { width: `${pct}%`, backgroundColor: clusterColor }]} />
                      </View>
                    </View>
                    <Text style={[styles.clusterScore, { color: clusterColor }]}>{score}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* ── STATS SECTION ── */}
          {data.ppg != null && (
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>SEASON AVERAGES</Text>
              <View style={styles.statsGrid}>
                <StatCell label="PPG" value={data.ppg?.toFixed(1)} colors={colors} />
                <StatCell label="RPG" value={data.rpg?.toFixed(1)} colors={colors} />
                <StatCell label="APG" value={data.apg?.toFixed(1)} colors={colors} />
                <StatCell label="SPG" value={data.spg?.toFixed(1)} colors={colors} />
                <StatCell label="BPG" value={data.bpg?.toFixed(1)} colors={colors} />
                <StatCell label="MPG" value={data.mpg?.toFixed(1)} colors={colors} />
                <StatCell label="FG%" value={data.fgPct != null ? `${(data.fgPct * 100).toFixed(0)}` : undefined} colors={colors} />
                <StatCell label="3P%" value={data.threePct != null ? `${(data.threePct * 100).toFixed(0)}` : undefined} colors={colors} />
                <StatCell label="FT%" value={data.ftPct != null ? `${(data.ftPct * 100).toFixed(0)}` : undefined} colors={colors} />
                <StatCell label="TO" value={data.topg?.toFixed(1)} colors={colors} />
              </View>
              {data.gp != null && (
                <Text style={[styles.gpNote, { color: colors.textTertiary }]}>{data.gp} games played</Text>
              )}
            </View>
          )}

          {/* ── BACKGROUND ── */}
          {(data.hometown || data.previousSchool || data.portalEntryDate) && (
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>BACKGROUND</Text>
              {data.hometown && <InfoRow label="Hometown" value={data.hometown} colors={colors} />}
              {data.previousSchool && <InfoRow label="Previous School" value={data.previousSchool} colors={colors} />}
              {data.portalEntryDate && <InfoRow label="Portal Entry" value={data.portalEntryDate} colors={colors} />}
            </View>
          )}

          {/* ── SCHOLARSHIP / NIL ── */}
          {(data.scholarshipPct != null || data.nilAmount != null) && (
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>SCHOLARSHIP & NIL</Text>
              {data.scholarshipPct != null && (
                <InfoRow label="Scholarship" value={`${Math.round(data.scholarshipPct)}%`} colors={colors} />
              )}
              {data.nilAmount != null && (
                <InfoRow label="NIL Allocation" value={`$${Math.round(data.nilAmount).toLocaleString()}`} colors={colors} />
              )}
            </View>
          )}

        </View>
      </ScrollView>
    </BottomSheet>
  );
}

// ── Helper Components ──

function StatCell({ label, value, colors }: { label: string; value?: string; colors: typeof Colors.light }) {
  if (value == null) return null;
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statCellLabel, { color: colors.textTertiary }]}>{label}</Text>
      <Text style={[styles.statCellValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function InfoRow({ label, value, colors }: { label: string; value: string; colors: typeof Colors.light }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  scroll: { maxHeight: '100%' },
  container: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 30 },

  // Identity
  identityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  avatarCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  playerName: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  jerseyBadge: { fontSize: 14, fontWeight: '600' },
  playerMeta: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  schoolText: { fontSize: 12, fontWeight: '600' },
  confText: { fontSize: 12, fontWeight: '500' },
  levelBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  levelBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  // KR Card
  krCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, gap: 10 },
  krRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  krBadge: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  krNumber: { fontSize: 20, fontWeight: '900', color: '#000' },
  krTierLabel: { fontSize: 15, fontWeight: '700' },
  krPercentile: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  bprWrap: { alignItems: 'center' },
  bprLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  bprValue: { fontSize: 16, fontWeight: '800' },
  krBreakdownRow: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 8 },
  krBreakdownItem: { alignItems: 'center', gap: 2 },
  krBreakdownLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  krBreakdownValue: { fontSize: 15, fontWeight: '800' },

  // Sections
  sectionCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 8 },
  sectionTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },

  // Archetype
  archetypeText: { fontSize: 16, fontWeight: '700' },
  archetypeConfidence: { fontSize: 12, fontWeight: '500' },

  // Badges
  badgeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeSummary: { fontSize: 11, fontWeight: '500' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badgeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeName: { fontSize: 11, fontWeight: '600' },

  // Clusters
  clusterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 24 },
  clusterLabel: { width: 80, fontSize: 11, fontWeight: '600' },
  clusterBarContainer: { flex: 1 },
  clusterBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  clusterBarFill: { height: 6, borderRadius: 3 },
  clusterScore: { width: 26, fontSize: 12, fontWeight: '800', textAlign: 'right' },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  statCell: { width: '18%', alignItems: 'center', paddingVertical: 6 },
  statCellLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  statCellValue: { fontSize: 14, fontWeight: '800', marginTop: 2 },
  gpNote: { fontSize: 11, fontWeight: '500', textAlign: 'center', marginTop: 4 },

  // Info rows
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 12, fontWeight: '600' },
  infoValue: { fontSize: 13, fontWeight: '600' },

});
```

### H3. components/entity-sheets/team-card-sheet.tsx

```typescript
/**
 * Team Card Sheet — lightweight team preview bottom sheet.
 * For deep dives, see TeamQuickSheet (4-tab detailed profile).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { TeamCardData } from '@/utils/global-entity-sheets';

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

function getKRColor(kr: number): string {
  if (kr >= 80) return '#4ade80';
  if (kr >= 65) return '#fbbf24';
  return '#f87171';
}

interface Props {
  visible: boolean;
  onClose: () => void;
  data: TeamCardData | null;
}

export function TeamCardSheet({ visible, onClose, data }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  if (!data) return null;

  const hue = nameToHue(data.name);
  const initials = data.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={styles.container}>
        {/* Team identity */}
        <View style={styles.identityRow}>
          <View style={[styles.initialsCircle, { backgroundColor: `hsl(${hue}, 50%, 35%)` }]}>
            <Text style={styles.initialsText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.teamName, { color: colors.text }]}>{data.name}</Text>
            {data.conference && (
              <Text style={[styles.conference, { color: colors.textSecondary }]}>{data.conference}</Text>
            )}
          </View>
        </View>

        {/* Record row */}
        <View style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.recordItem}>
            <Text style={[styles.recordLabel, { color: colors.textTertiary }]}>OVERALL</Text>
            <Text style={[styles.recordValue, { color: colors.text }]}>{data.record || '—'}</Text>
          </View>
          {data.confRecord && (
            <View style={styles.recordItem}>
              <Text style={[styles.recordLabel, { color: colors.textTertiary }]}>CONF</Text>
              <Text style={[styles.recordValue, { color: colors.text }]}>{data.confRecord}</Text>
            </View>
          )}
          {data.teamKR != null && (
            <View style={styles.recordItem}>
              <Text style={[styles.recordLabel, { color: colors.textTertiary }]}>TEAM KR</Text>
              <Text style={[styles.recordValue, { color: getKRColor(data.teamKR) }]}>{data.teamKR}</Text>
            </View>
          )}
        </View>

      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  initialsCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  conference: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  recordCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    justifyContent: 'space-around',
  },
  recordItem: {
    alignItems: 'center',
    gap: 4,
  },
  recordLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  recordValue: {
    fontSize: 17,
    fontWeight: '800',
  },
});
```

### H4. components/entity-sheets/person-card-sheet.tsx

```typescript
/**
 * Person Card Sheet — lightweight person preview bottom sheet.
 * Quick preview with ministry pills and status badge.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { PersonCardData } from '@/utils/global-entity-sheets';

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active': return '#4ade80';
    case 'inactive': return '#f87171';
    case 'pending': return '#fbbf24';
    default: return '#94a3b8';
  }
}

interface Props {
  visible: boolean;
  onClose: () => void;
  data: PersonCardData | null;
}

export function PersonCardSheet({ visible, onClose, data }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  if (!data) return null;

  const hue = nameToHue(data.name);
  const initials = data.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={styles.container}>
        {/* Person identity */}
        <View style={styles.identityRow}>
          <View style={[styles.avatarCircle, { backgroundColor: `hsl(${hue}, 40%, 32%)` }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={[styles.personName, { color: colors.text }]}>{data.name}</Text>
              {data.status && (
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(data.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(data.status) }]}>
                    {data.status}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.personRole, { color: colors.textSecondary }]}>{data.role}</Text>
          </View>
        </View>

        {/* Ministry pills */}
        {data.ministries && data.ministries.length > 0 && (
          <View style={[styles.ministriesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.ministriesLabel, { color: colors.textTertiary }]}>MINISTRIES</Text>
            <View style={styles.pillsRow}>
              {data.ministries.map((m) => (
                <View key={m} style={[styles.ministryPill, { backgroundColor: colors.text + '10' }]}>
                  <Text style={[styles.ministryPillText, { color: colors.text }]}>{m}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  personName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  personRole: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  ministriesCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 8,
  },
  ministriesLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ministryPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  ministryPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
```

## Section I: KR Display & Badges

### I1. utils/kr-display.ts

```typescript
/**
 * KR Display Utilities — Level-Aware Tier Labels, Color Bands, Badge Display
 *
 * KR is universal (0-100) but tier LABELS shift per competitive level.
 * Color bands are universal (same for all levels).
 * Badge rules from spec: Bronze ≥90, Silver ≥94, Gold ≥97.
 */

// =============================================================================
// KR COLOR BANDS (Universal — same for all levels)
// =============================================================================

export interface KRColorBand {
  min: number;
  max: number;
  color: string;
  label: string;
}

export const KR_COLOR_BANDS: KRColorBand[] = [
  { min: 97, max: 100, color: '#FFD700', label: 'Elite/Transcendent' },
  { min: 94, max: 96,  color: '#C0C0C0', label: 'Franchise Anchor' },
  { min: 90, max: 93,  color: '#7B2FF7', label: 'High-Impact' },
  { min: 86, max: 89,  color: '#2196F3', label: 'Solid Starter' },
  { min: 82, max: 85,  color: '#00BCD4', label: 'Trusted Rotation' },
  { min: 78, max: 81,  color: '#4CAF50', label: 'Reliable Bench' },
  { min: 74, max: 77,  color: '#FFC107', label: 'Situational' },
  { min: 70, max: 73,  color: '#FF9800', label: 'Limited' },
  { min: 66, max: 69,  color: '#F44336', label: 'Fringe/Project' },
  { min: 0,  max: 65,  color: '#757575', label: 'Below Viability' },
];

/** Get KR color for a given score */
export function getKRColor(kr: number | null | undefined): string {
  if (kr == null) return '#757575';
  for (const band of KR_COLOR_BANDS) {
    if (kr >= band.min) return band.color;
  }
  return '#757575';
}

/** Get KR color band label (universal) */
export function getKRBandLabel(kr: number | null | undefined): string {
  if (kr == null) return 'Unrated';
  for (const band of KR_COLOR_BANDS) {
    if (kr >= band.min) return band.label;
  }
  return 'Below Viability';
}

// =============================================================================
// LEVEL-AWARE KR TIER LABELS (from College Player KR Legend)
// =============================================================================

/** Tier definition: KR range + label for a specific competitive level */
export interface KRTier {
  min: number;
  max: number;
  label: string;
}

/**
 * Full KR Legend per competitive level.
 * Tiers are ordered highest-first for matching.
 * From canonical spec: College Player KR Legend.
 */
export const KR_LEGEND: Record<string, KRTier[]> = {
  // NCAA D1 High Major
  ncaa_d1_high_major: [
    { min: 98, max: 100, label: 'NPOY / Transcendent' },
    { min: 95, max: 97,  label: 'First Team All-American' },
    { min: 92, max: 94,  label: 'All-Conference First Team' },
    { min: 88, max: 91,  label: 'Projected Starter' },
    { min: 84, max: 87,  label: 'Rotation Player' },
    { min: 80, max: 83,  label: 'Situational Specialist' },
    { min: 76, max: 79,  label: 'Practice Player / Redshirt' },
    { min: 70, max: 75,  label: 'Roster Depth' },
    { min: 0,  max: 69,  label: 'Below Level' },
  ],

  // NCAA D1 Mid Major
  ncaa_d1_mid_major: [
    { min: 95, max: 100, label: 'MM POY / Transcendent' },
    { min: 92, max: 94,  label: 'All-Conference First Team' },
    { min: 88, max: 91,  label: 'Franchise Anchor' },
    { min: 84, max: 87,  label: 'Projected Starter' },
    { min: 80, max: 83,  label: 'Key Rotation' },
    { min: 76, max: 79,  label: 'Situational Specialist' },
    { min: 72, max: 75,  label: 'Practice Player' },
    { min: 66, max: 71,  label: 'Roster Depth' },
    { min: 0,  max: 65,  label: 'Below Level' },
  ],

  // NCAA D1 Low Major
  ncaa_d1_low_major: [
    { min: 92, max: 100, label: 'LM POY / Dominant' },
    { min: 88, max: 91,  label: 'All-Conference' },
    { min: 84, max: 87,  label: 'Franchise Anchor' },
    { min: 80, max: 83,  label: 'Projected Starter' },
    { min: 76, max: 79,  label: 'Key Rotation' },
    { min: 72, max: 75,  label: 'Situational' },
    { min: 68, max: 71,  label: 'Practice Player' },
    { min: 0,  max: 67,  label: 'Below Level' },
  ],

  // NCAA D2
  ncaa_d2: [
    { min: 90, max: 100, label: 'D2 POY / Dominant National' },
    { min: 86, max: 89,  label: 'All-Region' },
    { min: 82, max: 85,  label: 'Franchise Anchor' },
    { min: 78, max: 81,  label: 'Projected Starter' },
    { min: 74, max: 77,  label: 'Key Rotation' },
    { min: 70, max: 73,  label: 'Situational' },
    { min: 66, max: 69,  label: 'Roster Depth' },
    { min: 0,  max: 65,  label: 'Below Level' },
  ],

  // NCAA D3
  ncaa_d3: [
    { min: 80, max: 100, label: 'D3 POY / Elite' },
    { min: 76, max: 79,  label: 'All-Region' },
    { min: 72, max: 75,  label: 'Franchise Anchor' },
    { min: 68, max: 71,  label: 'Projected Starter' },
    { min: 64, max: 67,  label: 'Key Rotation' },
    { min: 60, max: 63,  label: 'Situational' },
    { min: 0,  max: 59,  label: 'Below Level' },
  ],

  // NAIA
  naia: [
    { min: 86, max: 100, label: 'NAIA POY / Elite' },
    { min: 82, max: 85,  label: 'All-Conference First Team' },
    { min: 78, max: 81,  label: 'Franchise Anchor' },
    { min: 74, max: 77,  label: 'Projected Starter' },
    { min: 70, max: 73,  label: 'Key Rotation' },
    { min: 66, max: 69,  label: 'Situational' },
    { min: 62, max: 65,  label: 'Roster Depth' },
    { min: 0,  max: 61,  label: 'Below Level' },
  ],

  // NJCAA D1
  njcaa_d1: [
    { min: 88, max: 100, label: 'JUCO D1 POY / Elite' },
    { min: 84, max: 87,  label: 'All-Region' },
    { min: 80, max: 83,  label: 'Franchise Anchor' },
    { min: 76, max: 79,  label: 'Projected Starter' },
    { min: 72, max: 75,  label: 'Key Rotation' },
    { min: 68, max: 71,  label: 'Situational' },
    { min: 64, max: 67,  label: 'Roster Depth' },
    { min: 0,  max: 63,  label: 'Below Level' },
  ],

  // NJCAA D2
  njcaa_d2: [
    { min: 84, max: 100, label: 'JUCO D2 POY / Elite' },
    { min: 80, max: 83,  label: 'All-Region' },
    { min: 76, max: 79,  label: 'Franchise Anchor' },
    { min: 72, max: 75,  label: 'Projected Starter' },
    { min: 68, max: 71,  label: 'Key Rotation' },
    { min: 64, max: 67,  label: 'Situational' },
    { min: 0,  max: 63,  label: 'Below Level' },
  ],

  // NJCAA D3
  njcaa_d3: [
    { min: 80, max: 100, label: 'JUCO D3 POY / Elite' },
    { min: 76, max: 79,  label: 'All-Region' },
    { min: 72, max: 75,  label: 'Franchise Anchor' },
    { min: 68, max: 71,  label: 'Projected Starter' },
    { min: 64, max: 67,  label: 'Key Rotation' },
    { min: 60, max: 63,  label: 'Situational' },
    { min: 0,  max: 59,  label: 'Below Level' },
  ],

  // CCCAA
  cccaa: [
    { min: 82, max: 100, label: 'CCCAA POY / Elite' },
    { min: 78, max: 81,  label: 'All-Conference' },
    { min: 74, max: 77,  label: 'Franchise Anchor' },
    { min: 70, max: 73,  label: 'Projected Starter' },
    { min: 66, max: 69,  label: 'Key Rotation' },
    { min: 62, max: 65,  label: 'Situational' },
    { min: 0,  max: 61,  label: 'Below Level' },
  ],

  // USCAA
  uscaa: [
    { min: 78, max: 100, label: 'USCAA POY / Elite' },
    { min: 74, max: 77,  label: 'All-Conference' },
    { min: 70, max: 73,  label: 'Franchise Anchor' },
    { min: 66, max: 69,  label: 'Projected Starter' },
    { min: 62, max: 65,  label: 'Key Rotation' },
    { min: 0,  max: 61,  label: 'Below Level' },
  ],

  // NCCAA D1
  nccaa_d1: [
    { min: 76, max: 100, label: 'NCCAA POY / Elite' },
    { min: 72, max: 75,  label: 'All-Conference' },
    { min: 68, max: 71,  label: 'Franchise Anchor' },
    { min: 64, max: 67,  label: 'Projected Starter' },
    { min: 60, max: 63,  label: 'Key Rotation' },
    { min: 0,  max: 59,  label: 'Below Level' },
  ],

  // NCCAA D2
  nccaa_d2: [
    { min: 72, max: 100, label: 'NCCAA D2 POY / Elite' },
    { min: 68, max: 71,  label: 'All-Conference' },
    { min: 64, max: 67,  label: 'Franchise Anchor' },
    { min: 60, max: 63,  label: 'Projected Starter' },
    { min: 56, max: 59,  label: 'Key Rotation' },
    { min: 0,  max: 55,  label: 'Below Level' },
  ],
};

/** Get level-aware KR tier label */
export function getKRTierLabel(kr: number | null | undefined, levelKey: string): string {
  if (kr == null) return 'Unrated';
  const tiers = KR_LEGEND[levelKey];
  if (!tiers) {
    // Fallback to NAIA if level not found
    const fallback = KR_LEGEND.naia;
    if (fallback) {
      for (const tier of fallback) {
        if (kr >= tier.min) return tier.label;
      }
    }
    return getKRBandLabel(kr);
  }
  for (const tier of tiers) {
    if (kr >= tier.min) return tier.label;
  }
  return 'Below Level';
}

// =============================================================================
// ARCHETYPE DISPLAY
// =============================================================================

/** Map archetype DB keys to display names */
export const ARCHETYPE_DISPLAY: Record<string, string> = {
  // Guards
  floor_general: 'Floor General',
  primary_ball_handler: 'Primary Ball Handler',
  pick_and_roll_operator: 'PnR Operator',
  dho_handoff_hub: 'DHO Hub',
  combo_scorer: 'Combo Scorer',
  three_level_scorer: '3-Level Scorer',

  // Wings
  two_way_wing: 'Two-Way Wing',
  slasher_wing: 'Slasher Wing',
  three_and_d_wing: '3-and-D Wing',
  switchable_defender_wing: 'Switchable Defender',
  spot_up_specialist: 'Spot-Up Specialist',
  secondary_creator_wing: 'Secondary Creator',
  connector_guard_wing: 'Connector',
  off_ball_shooter: 'Off-Ball Shooter',
  slasher_rim_pressure_wing: 'Rim Pressure Wing',

  // Bigs
  rim_protector: 'Rim Protector',
  rim_protector_anchor: 'Rim Protector Anchor',
  stretch_big: 'Stretch Big',
  post_hub_facilitator_big: 'Post Facilitator',
  rebounding_interior_enforcer: 'Rebounding Enforcer',
  small_ball_big: 'Small-Ball Big',
  vertical_spacer: 'Vertical Spacer',

  // Legacy names from engine
  'Two-Way Wing': 'Two-Way Wing',
  'Slasher Wing': 'Slasher Wing',
  'Floor General': 'Floor General',
  'Rim Protector': 'Rim Protector',
  'Stretch Big': 'Stretch Big',
  '3-Level Scorer': '3-Level Scorer',
  'Combo Scorer': 'Combo Scorer',
  'Spot-Up Specialist': 'Spot-Up Specialist',
};

/** Get displayable archetype name */
export function getArchetypeDisplay(archetype: string | null | undefined): string {
  if (!archetype) return 'Unknown';
  return ARCHETYPE_DISPLAY[archetype] ?? archetype.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// =============================================================================
// BADGE DISPLAY HELPERS
// =============================================================================

export type BadgeLevel = 'Bronze' | 'Silver' | 'Gold';

export const BADGE_COLORS: Record<BadgeLevel, string> = {
  Bronze: '#CD7F32',
  Silver: '#A8A9AD',
  Gold: '#FFD700',
};

export const BADGE_BG_COLORS: Record<BadgeLevel, string> = {
  Bronze: '#CD7F3220',
  Silver: '#A8A9AD20',
  Gold: '#FFD70020',
};

/** Badge thresholds — College mode */
export const BADGE_THRESHOLDS_COLLEGE = {
  Bronze: { trait: 90, component: 90, effect: 3 },
  Silver: { trait: 94, component: 94, effect: 6 },
  Gold: { trait: 97, component: 97, effect: 10 },
};

/** Badge caps — College mode */
export const BADGE_CAPS_COLLEGE = {
  maxGold: 1,
  maxSilver: 3,
  perComponentCap: 12,
  overallKRCap: 3.5,
};

// =============================================================================
// CLUSTER DISPLAY
// =============================================================================

export const CLUSTER_LABELS: Record<string, { label: string; icon: string }> = {
  shooting: { label: 'Shooting', icon: 'scope' },
  finishing: { label: 'Finishing', icon: 'flame' },
  playmaking: { label: 'Playmaking', icon: 'arrow.triangle.branch' },
  perimeter_defense: { label: 'Perimeter D', icon: 'shield.lefthalf.filled' },
  interior_defense: { label: 'Interior D', icon: 'shield.righthalf.filled' },
  rebounding: { label: 'Rebounding', icon: 'arrow.up.arrow.down' },
  frame: { label: 'Physical', icon: 'figure.strengthtraining.traditional' },
};

export const CLUSTER_ORDER = [
  'shooting', 'finishing', 'playmaking',
  'perimeter_defense', 'interior_defense', 'rebounding', 'frame',
] as const;

// =============================================================================
// KR PERCENTILE HELPERS
// =============================================================================

/** Compute approximate percentile rank from KR and level */
export function getKRPercentileLabel(kr: number, levelKey: string, totalAtLevel?: number): string {
  // Rough percentile mapping based on bell curve centered ~50 for college levels
  // Higher KR = rarer (top %)
  if (kr >= 90) return 'Top 1%';
  if (kr >= 85) return 'Top 3%';
  if (kr >= 80) return 'Top 5%';
  if (kr >= 75) return 'Top 10%';
  if (kr >= 70) return 'Top 15%';
  if (kr >= 65) return 'Top 25%';
  if (kr >= 60) return 'Top 35%';
  if (kr >= 55) return 'Top 45%';
  if (kr >= 50) return 'Top 50%';
  return 'Below 50%';
}

// =============================================================================
// LEVEL DISPLAY HELPERS
// =============================================================================

export const LEVEL_DISPLAY_SHORT: Record<string, string> = {
  ncaa_d1_high_major: 'D1 HM',
  ncaa_d1_mid_major: 'D1 MM',
  ncaa_d1_low_major: 'D1 LM',
  ncaa_d2: 'NCAA D2',
  ncaa_d3: 'NCAA D3',
  naia: 'NAIA',
  njcaa_d1: 'JUCO D1',
  njcaa_d2: 'JUCO D2',
  njcaa_d3: 'JUCO D3',
  cccaa: 'CCCAA',
  uscaa: 'USCAA',
  nccaa_d1: 'NCCAA D1',
  nccaa_d2: 'NCCAA D2',
};

export const LEVEL_DISPLAY_FULL: Record<string, string> = {
  ncaa_d1_high_major: 'NCAA D1 High Major',
  ncaa_d1_mid_major: 'NCAA D1 Mid Major',
  ncaa_d1_low_major: 'NCAA D1 Low Major',
  ncaa_d2: 'NCAA Division II',
  ncaa_d3: 'NCAA Division III',
  naia: 'NAIA',
  njcaa_d1: 'NJCAA Division I',
  njcaa_d2: 'NJCAA Division II',
  njcaa_d3: 'NJCAA Division III',
  cccaa: 'CCCAA',
  uscaa: 'USCAA',
  nccaa_d1: 'NCCAA Division I',
  nccaa_d2: 'NCCAA Division II',
};

/** All level keys for filter dropdowns */
export const ALL_LEVEL_KEYS = [
  'ncaa_d1_high_major', 'ncaa_d1_mid_major', 'ncaa_d1_low_major',
  'ncaa_d2', 'ncaa_d3', 'naia',
  'njcaa_d1', 'njcaa_d2', 'njcaa_d3',
  'cccaa', 'uscaa', 'nccaa_d1', 'nccaa_d2',
];
```

### I2. utils/player-badges.ts

```typescript
/**
 * Player Badge System — KaNeXT Badge computation per canonical spec.
 *
 * Badge eligibility: Component KR ≥ threshold AND relevant trait(s) ≥ threshold.
 * Bronze ≥ 90, Silver ≥ 94, Gold ≥ 97.
 */

import type { ClusterType } from '@/types';
import type { ClusterRatings } from '@/data/roster-data';

export type BadgeLevel = 'Bronze' | 'Silver' | 'Gold';

export interface PlayerBadge {
  name: string;
  level: BadgeLevel;
  component: string;
}

export const BADGE_LEVEL_COLORS: Record<BadgeLevel, string> = {
  Bronze: '#CD7F32',
  Silver: '#A8A9AD',
  Gold: '#FFFFFF',
};

const BADGE_THRESHOLDS: { level: BadgeLevel; min: number }[] = [
  { level: 'Gold', min: 97 },
  { level: 'Silver', min: 94 },
  { level: 'Bronze', min: 90 },
];

interface BadgeDef {
  name: string;
  component: ClusterType;
  traits: string[]; // subcluster names to check
}

const OFFENSIVE_BADGES: BadgeDef[] = [
  { name: 'Catch-and-Shoot', component: 'shooting', traits: ['3PT Spot-Up'] },
  { name: 'Movement Shooter', component: 'shooting', traits: ['3PT Movement'] },
  { name: 'Deep Range', component: 'shooting', traits: ['3PT Deep Range'] },
  { name: 'Pull-Up Shot Maker', component: 'shooting', traits: ['2PT Off-Dribble'] },
  { name: 'Rim Finisher', component: 'finishing', traits: ['Layup'] },
  { name: 'Contact Finisher', component: 'finishing', traits: ['Dunk'] },
  { name: 'Rim Pressure', component: 'finishing', traits: ['Close'] },
  { name: 'FT Generator', component: 'finishing', traits: ['Foul Draw Rate'] },
  { name: 'Cutter', component: 'finishing', traits: ['Floater/Runner'] },
  { name: 'Primary Playmaker', component: 'playmaking', traits: ['Passing Vision', 'Passing Accuracy'] },
  { name: 'Drive-and-Kick', component: 'playmaking', traits: ['Drive-and-Kick'] },
  { name: 'Ball Security', component: 'playmaking', traits: ['Ball Security'] },
  { name: 'Transition Playmaker', component: 'playmaking', traits: ['Transition'] },
];

const DEFENSIVE_BADGES: BadgeDef[] = [
  { name: 'Point-of-Attack', component: 'perimeter_defense', traits: ['Containment'] },
  { name: 'Ball Pressure', component: 'perimeter_defense', traits: ['Ball Pressure'] },
  { name: 'Lockdown Perimeter', component: 'perimeter_defense', traits: ['Containment', 'Off-Ball Denial'] },
  { name: 'Rim Protector', component: 'interior_defense', traits: ['Block', 'Rim Deterrence'] },
  { name: 'Paint Anchor', component: 'interior_defense', traits: ['Post Defense', 'Vertical Contest'] },
  { name: 'Help Defender', component: 'interior_defense', traits: ['Help Defense'] },
  { name: 'Passing Lane Disruptor', component: 'perimeter_defense', traits: ['Steal', 'Disruption'] },
  { name: 'Defensive Rebounder', component: 'rebounding', traits: ['Defensive', 'Box-Out'] },
  { name: 'Physical Rebounder', component: 'rebounding', traits: ['Offensive'] },
];

const ALL_BADGES = [...OFFENSIVE_BADGES, ...DEFENSIVE_BADGES];

// Exported for filter UI
export const OFFENSIVE_BADGE_NAMES = OFFENSIVE_BADGES.map((b) => b.name);
export const DEFENSIVE_BADGE_NAMES = DEFENSIVE_BADGES.map((b) => b.name);
export const ALL_BADGE_NAMES = ALL_BADGES.map((b) => b.name);
export const BADGE_LEVELS: BadgeLevel[] = ['Gold', 'Silver', 'Bronze'];

/**
 * Compute badges for a player given their cluster ratings and subcluster getter.
 * Max 1 Gold, 3 Silver, unlimited Bronze per spec.
 */
export function computePlayerBadges(
  clusters: ClusterRatings,
  getSubclusters: (clusterKey: keyof ClusterRatings) => { name: string; rating: number }[],
): PlayerBadge[] {
  const raw: (PlayerBadge & { score: number })[] = [];

  for (const def of ALL_BADGES) {
    const componentKR = clusters[def.component];
    const subs = getSubclusters(def.component);

    // Find minimum trait score across required traits
    let minTrait = 100;
    for (const traitName of def.traits) {
      const sub = subs.find((s) => s.name === traitName);
      if (!sub) { minTrait = 0; break; }
      minTrait = Math.min(minTrait, sub.rating);
    }

    // Check thresholds (highest first)
    for (const { level, min } of BADGE_THRESHOLDS) {
      if (componentKR >= min && minTrait >= min) {
        raw.push({ name: def.name, level, component: def.component, score: componentKR + minTrait });
        break;
      }
    }
  }

  // Enforce caps: max 1 Gold, 3 Silver
  const golds = raw.filter((b) => b.level === 'Gold').sort((a, b) => b.score - a.score);
  const silvers = raw.filter((b) => b.level === 'Silver').sort((a, b) => b.score - a.score);
  const bronzes = raw.filter((b) => b.level === 'Bronze').sort((a, b) => b.score - a.score);

  const result: PlayerBadge[] = [];
  result.push(...golds.slice(0, 1).map(({ score: _, ...b }) => b));
  result.push(...silvers.slice(0, 3).map(({ score: _, ...b }) => b));
  result.push(...bronzes.map(({ score: _, ...b }) => b));

  return result;
}
```

### I3. data/national-pool.ts

```typescript
/**
 * National Player Pool Data Adapter
 *
 * Loads the exported JSON from PostgreSQL and provides query functions
 * for the React Native UI. Drop-in replacement for mock data.
 *
 * Usage:
 *   import { nationalPool } from '@/data/national-pool';
 *   const results = nationalPool.search({ query: 'Bradley', level: 'naia' });
 *   const player = nationalPool.getById('some-uuid');
 */

import rawData from './national-pool.json';
import {
  getKRColor,
  getKRTierLabel,
  getArchetypeDisplay,
  CLUSTER_ORDER,
} from '@/utils/kr-display';
import { computePlayerBadges, type PlayerBadge } from '@/utils/player-badges';
import type { ClusterType } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

export interface NationalPlayer {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  position: string;
  height: string;
  heightInches: number | null;
  weight: number | null;
  classYear: string;
  jerseyNumber: string;
  school: string;
  conference: string;
  levelKey: string;
  levelDisplay: string;
  state: string;
  country: string;
  city: string;
  highSchool: string;
  portalEntryDate: string | null;
  // KR
  kr: number | null;
  offKR: number | null;
  defKR: number | null;
  archetype: string;
  secondaryArchetypes: string[];
  confidence: number | null;
  // Clusters
  clusters: Record<string, number>;
  // Stats
  gp: number | null;
  gs: number | null;
  mpg: number | null;
  ppg: number | null;
  rpg: number | null;
  apg: number | null;
  spg: number | null;
  bpg: number | null;
  topg: number | null;
  fgPct: number | null;
  threePct: number | null;
  ftPct: number | null;
  orebPg: number | null;
  drebPg: number | null;
  fgaPg: number | null;
  threePaPg: number | null;
  ftaPg: number | null;
  pfPg: number | null;
  usageRate: number | null;
  bprAvg: number | null;
  bprTrend: number | null;
  // Scholarship/NIL
  scholarship?: {
    tier: string;
    scholarshipPct: number | null;
    scholarshipEquivalent: number | null;
    nilAmount: number | null;
    offFitPct: number | null;
    defFitPct: number | null;
    overallFitPct: number | null;
    needScarcity: string | null;
    scholarshipJustification: string | null;
    nilJustification: string | null;
    warnings: string[];
  };
}

export interface TeamSystem {
  offSystem: string | null;
  offSystemScore: number | null;
  defSystem: string | null;
  defSystemScore: number | null;
  pace100: number | null;
  paceBand: string | null;
}

export interface SearchFilters {
  query?: string;
  level?: string | string[];
  position?: string | string[];
  conference?: string;
  minKR?: number;
  maxKR?: number;
  minHeight?: number; // inches
  maxHeight?: number;
  archetype?: string;
  hasPortalEntry?: boolean;
  hasBadge?: string;     // badge name
  badgeLevel?: string;   // 'Gold' | 'Silver' | 'Bronze'
  sortBy?: 'kr' | 'ppg' | 'rpg' | 'apg' | 'name' | 'height';
  sortDir?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// =============================================================================
// DATA LOADING
// =============================================================================

const data = rawData as {
  players: NationalPlayer[];
  teamSystems: Record<string, TeamSystem>;
  counts: {
    players: number;
    withKR: number;
    withStats: number;
    withScholarship: number;
    teamSystems: number;
  };
};

// Index by ID for O(1) lookup
const playerIndex = new Map<string, NationalPlayer>();
for (const p of data.players) {
  playerIndex.set(p.id, p);
}

// Index by school for team roster lookups
const schoolIndex = new Map<string, NationalPlayer[]>();
for (const p of data.players) {
  if (p.school) {
    const key = p.school.toLowerCase();
    if (!schoolIndex.has(key)) schoolIndex.set(key, []);
    schoolIndex.get(key)!.push(p);
  }
}

// Collect unique values for filters
const _conferences = new Set<string>();
const _levels = new Set<string>();
for (const p of data.players) {
  if (p.conference) _conferences.add(p.conference);
  if (p.levelKey) _levels.add(p.levelKey);
}

// =============================================================================
// QUERY FUNCTIONS
// =============================================================================

export const nationalPool = {
  /** Total counts */
  get counts() { return data.counts; },

  /** Get all players (use sparingly — 9K+ records) */
  getAll(): NationalPlayer[] {
    return data.players;
  },

  /** Get player by ID */
  getById(id: string): NationalPlayer | undefined {
    return playerIndex.get(id);
  },

  /** Get team roster by school name */
  getTeamRoster(school: string): NationalPlayer[] {
    return schoolIndex.get(school.toLowerCase()) ?? [];
  },

  /** Get team system identity */
  getTeamSystem(teamName: string): TeamSystem | undefined {
    return data.teamSystems[teamName];
  },

  /** Get unique conferences for filter UI */
  getConferences(): string[] {
    return Array.from(_conferences).sort();
  },

  /** Get unique levels for filter UI */
  getLevels(): string[] {
    return Array.from(_levels).sort();
  },

  /**
   * Search and filter players.
   * All filters are optional and combine with AND logic.
   */
  search(filters: SearchFilters = {}): NationalPlayer[] {
    let results = data.players;

    // Text search
    if (filters.query && filters.query.length > 0) {
      const q = filters.query.toLowerCase();
      results = results.filter(p =>
        p.fullName.toLowerCase().includes(q) ||
        p.school.toLowerCase().includes(q) ||
        p.conference.toLowerCase().includes(q)
      );
    }

    // Level filter
    if (filters.level) {
      const levels = Array.isArray(filters.level) ? filters.level : [filters.level];
      results = results.filter(p => levels.includes(p.levelKey));
    }

    // Position filter
    if (filters.position) {
      const positions = Array.isArray(filters.position) ? filters.position : [filters.position];
      results = results.filter(p => positions.includes(p.position));
    }

    // Conference filter
    if (filters.conference) {
      const conf = filters.conference.toLowerCase();
      results = results.filter(p => p.conference.toLowerCase().includes(conf));
    }

    // KR range
    if (filters.minKR != null) {
      results = results.filter(p => p.kr != null && p.kr >= filters.minKR!);
    }
    if (filters.maxKR != null) {
      results = results.filter(p => p.kr != null && p.kr <= filters.maxKR!);
    }

    // Height range (inches)
    if (filters.minHeight != null) {
      results = results.filter(p => p.heightInches != null && p.heightInches >= filters.minHeight!);
    }
    if (filters.maxHeight != null) {
      results = results.filter(p => p.heightInches != null && p.heightInches <= filters.maxHeight!);
    }

    // Archetype
    if (filters.archetype) {
      const arch = filters.archetype.toLowerCase();
      results = results.filter(p => p.archetype.toLowerCase().includes(arch));
    }

    // Portal entry
    if (filters.hasPortalEntry) {
      results = results.filter(p => p.portalEntryDate != null);
    }

    // Sort
    const sortBy = filters.sortBy ?? 'kr';
    const sortDir = filters.sortDir ?? 'desc';
    const mult = sortDir === 'asc' ? 1 : -1;

    results = [...results].sort((a, b) => {
      switch (sortBy) {
        case 'kr': return mult * ((a.kr ?? 0) - (b.kr ?? 0));
        case 'ppg': return mult * ((a.ppg ?? 0) - (b.ppg ?? 0));
        case 'rpg': return mult * ((a.rpg ?? 0) - (b.rpg ?? 0));
        case 'apg': return mult * ((a.apg ?? 0) - (b.apg ?? 0));
        case 'height': return mult * ((a.heightInches ?? 0) - (b.heightInches ?? 0));
        case 'name': return mult * a.fullName.localeCompare(b.fullName);
        default: return 0;
      }
    });

    // Pagination
    if (filters.offset) {
      results = results.slice(filters.offset);
    }
    if (filters.limit) {
      results = results.slice(0, filters.limit);
    }

    return results;
  },

  /**
   * Get enriched player data with display-ready KR info.
   * Returns everything needed for the Player Card sheet.
   */
  getPlayerCard(id: string): PlayerCardData | undefined {
    const p = playerIndex.get(id);
    if (!p) return undefined;

    const clusters = p.clusters as Record<ClusterType, number>;

    // Compute badges from cluster scores
    const badges = computePlayerBadges(
      clusters as any,
      (clusterKey: string) => {
        // We don't have trait-level data yet (player_kr_traits is empty)
        // Return cluster score as a single "trait" for badge eligibility
        const score = clusters[clusterKey as ClusterType] ?? 50;
        return [{ name: clusterKey, rating: score }];
      },
    );

    return {
      ...p,
      krColor: getKRColor(p.kr),
      krTierLabel: getKRTierLabel(p.kr, p.levelKey),
      archetypeDisplay: getArchetypeDisplay(p.archetype),
      badges,
      clusterScores: CLUSTER_ORDER.map(key => ({
        key,
        score: clusters[key] ?? 50,
        color: getKRColor(clusters[key] ?? 50),
      })),
      statLine: buildStatLine(p),
    };
  },

  /**
   * Top N players by KR, optionally filtered by level.
   * For Nexus queries like "top 10 NAIA guards by KR".
   */
  topByKR(n: number, filters?: { level?: string; position?: string }): NationalPlayer[] {
    return nationalPool.search({
      ...filters,
      sortBy: 'kr',
      sortDir: 'desc',
      limit: n,
      minKR: 1, // exclude unrated
    });
  },

  /**
   * Nexus-friendly search: returns formatted text results.
   * Used when Nexus needs to present player data in chat.
   */
  nexusSearch(query: string, filters: SearchFilters = {}): string {
    const results = nationalPool.search({ ...filters, query, limit: 20 });
    if (results.length === 0) return 'No players found matching your criteria.';

    const lines = results.map((p, i) => {
      const kr = p.kr != null ? `KR ${Math.round(p.kr)}` : 'Unrated';
      const tier = p.kr != null ? getKRTierLabel(p.kr, p.levelKey) : '';
      const stats = p.ppg != null ? `${p.ppg.toFixed(1)}/${p.rpg?.toFixed(1)}/${p.apg?.toFixed(1)}` : 'No stats';
      const arch = getArchetypeDisplay(p.archetype);
      return `${i + 1}. ${p.fullName} · ${p.position} · ${p.height} · ${p.school} (${p.levelKey.replace(/_/g, ' ').toUpperCase()}) · ${kr} ${tier} · ${arch} · ${stats} PPG/RPG/APG`;
    });

    return `Found ${results.length} player${results.length > 1 ? 's' : ''}:\n${lines.join('\n')}`;
  },
};

// =============================================================================
// ENRICHED TYPES
// =============================================================================

export interface PlayerCardData extends NationalPlayer {
  krColor: string;
  krTierLabel: string;
  archetypeDisplay: string;
  badges: PlayerBadge[];
  clusterScores: { key: string; score: number; color: string }[];
  statLine: string;
}

function buildStatLine(p: NationalPlayer): string {
  const parts: string[] = [];
  if (p.ppg != null) parts.push(`${p.ppg.toFixed(1)} PPG`);
  if (p.rpg != null) parts.push(`${p.rpg.toFixed(1)} RPG`);
  if (p.apg != null) parts.push(`${p.apg.toFixed(1)} APG`);
  return parts.join(' / ') || 'No stats';
}

// =============================================================================
// GLOBAL PLAYER CARD ADAPTER
// =============================================================================

import type { PlayerCardData as GlobalPlayerCardData } from '@/utils/global-entity-sheets';

/** Convert a NationalPlayer to the global entity sheet PlayerCardData format */
export function toGlobalPlayerCard(p: NationalPlayer): GlobalPlayerCardData {
  return {
    name: p.fullName,
    number: p.jerseyNumber,
    position: p.position,
    height: p.height,
    weight: p.weight ?? 0,
    classYear: p.classYear,
    hometown: [p.city, p.state].filter(Boolean).join(', ') || undefined,
    previousSchool: p.highSchool || undefined,
    kr: p.kr ?? undefined,
    ppg: p.ppg ?? undefined,
    rpg: p.rpg ?? undefined,
    apg: p.apg ?? undefined,
    playerId: p.id,
    school: p.school,
    conference: p.conference,
    levelKey: p.levelKey,
    levelDisplay: p.levelDisplay,
    offKR: p.offKR ?? undefined,
    defKR: p.defKR ?? undefined,
    archetype: p.archetype,
    confidence: p.confidence ?? undefined,
    clusters: p.clusters,
    spg: p.spg ?? undefined,
    bpg: p.bpg ?? undefined,
    topg: p.topg ?? undefined,
    fgPct: p.fgPct ?? undefined,
    threePct: p.threePct ?? undefined,
    ftPct: p.ftPct ?? undefined,
    mpg: p.mpg ?? undefined,
    gp: p.gp ?? undefined,
    bprAvg: p.bprAvg ?? undefined,
    portalEntryDate: p.portalEntryDate,
    scholarshipPct: p.scholarship?.scholarshipPct ?? undefined,
    nilAmount: p.scholarship?.nilAmount ?? undefined,
    overallFitPct: p.scholarship?.overallFitPct ?? undefined,
  };
}

export default nationalPool;
```
