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
