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
    backgroundColor: '#0B0F14', // Prevents seeing through during animation
  },
  stackContainer: {
    flex: 1,
  },
});
