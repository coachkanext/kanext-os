/**
 * KaNeXT OS Root Layout
 * Entry point with launch sequence, global providers, and navigation structure.
 *
 * Boot Sequence (v1 Locked):
 * 1. Cold launch → Splash screen (Nexus logo + "powered by Nexus")
 * 2. Splash fades → Silent session check
 * 3. If session valid → Resolve access tier → Route to Sports Mode Home
 * 4. If no session → Auth modal → Sign in → Resolve tier → Route to Sports Mode Home
 *
 * Post-auth default route: Sports Mode Home.
 * Only shows splash on cold start, not when resuming from background.
 */

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreenModule from 'expo-splash-screen';
import React, { useEffect, useCallback, useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import 'react-native-reanimated';

import { SplashScreen } from '@/components/splash-screen';
import { AuthModal } from '@/components/auth/auth-modal';
import { SearchOverlay } from '@/components/nexus/search-overlay';
import { OrgDrawer } from '@/components/org-drawer';
import { ModeSwitcherOverlay } from '@/components/mode-switcher-overlay';
import { UniversalFooter } from '@/components/universal-footer';
import { MultitaskingOverlay } from '@/components/multitasking-overlay';
import { KXTransition } from '@/components/kx-transition';
import { AppProvider } from '@/context/app-context';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { MultitaskingProvider } from '@/context/multitasking-context';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider as KXThemeProvider } from '@/context/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useColors } from '@/hooks/use-colors';
import { registerSearchOverlayHandlers } from '@/utils/global-search-overlay';
import { registerSplitNexusHandlers, openSplitNexus, setSplitNexusPendingQuery } from '@/utils/global-split-nexus';
import { registerSettingsPanelHandlers } from '@/utils/global-settings-panel';
import { SettingsPanel } from '@/components/settings-panel';
import { registerSidePanelHandlers } from '@/utils/global-side-panel';
import { SidePanel } from '@/components/side-panel/side-panel';

import { registerViewSwitchCallback } from '@/utils/view-switch-lifecycle';
import { requestHomeReset } from '@/utils/global-home';
import { requestOrgReset } from '@/utils/global-org';
import { resetFooter } from '@/utils/global-footer-hide';
import { shouldUseSlideAnimation, registerAnimRerender } from '@/utils/global-footer-swipe';

import { UniversalFinder } from '@/components/universal-finder';
import { SplitNexusOverlay } from '@/components/nexus/split-nexus-overlay';
import { VoiceOverlay } from '@/components/nexus/voice-overlay';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { registerVoiceHandlers } from '@/utils/global-voice';
import { CallOverlay } from '@/components/call/call-overlay';
import { IncomingCallOverlay } from '@/components/call/incoming-call-overlay';
import { ProfileSheet } from '@/components/ui/profile-sheet';



import { registerEntitySheetHandlers } from '@/utils/global-entity-sheets';
import type {
  TeamCardData, PlayerCardData, CoachCardData, EventCardData,
  DriverCardData, CrewCardData, PersonCardData, MinistryCardData, LeaderCardData,
} from '@/utils/global-entity-sheets';
// Universal entity sheets (single sheet per entity type)
import { TeamSheet } from '@/components/entity-sheets/team-sheet';
import { CoachSheet } from '@/components/entity-sheets/coach-sheet';
import { PlayerSheet } from '@/components/entity-sheets/player-sheet';
import { EventSheet } from '@/components/entity-sheets/event-sheet';
// Non-sports entity sheets (unchanged)
import { DriverCardSheet } from '@/components/entity-sheets/driver-card-sheet';
import { CrewCardSheet } from '@/components/entity-sheets/crew-card-sheet';
import { PersonCardSheet } from '@/components/entity-sheets/person-card-sheet';
import { MinistryCardSheet } from '@/components/entity-sheets/ministry-card-sheet';
import { LeaderCardSheet } from '@/components/entity-sheets/leader-card-sheet';

// Suppress EXVideo native view errors — expo-av fires async promise rejections
// when the native view isn't registered on New Architecture. Videos still play
// when the native module IS available; this just silences the red error banner.
const _origHandler = (global as any).ErrorUtils?.getGlobalHandler?.();
if ((global as any).ErrorUtils) {
  (global as any).ErrorUtils.setGlobalHandler((error: any, isFatal: boolean) => {
    if (error?.message?.includes?.('EXVideo')) return; // Swallow EXVideo errors
    _origHandler?.(error, isFatal);
  });
}

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
  const colors = useColors();
  const { state: authState } = useAuth();

  // Force re-render so screenOptions picks up slide animation flag before navigation
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    return registerAnimRerender(() => forceUpdate((n) => n + 1));
  }, []);

  // Register view-switch lifecycle callbacks — reset Home + Org tabs on view change
  useEffect(() => {
    const unsub = registerViewSwitchCallback(() => {
      requestHomeReset();
      requestOrgReset();
    });
    return unsub;
  }, []);

  // Universal entity sheets (single sheet per entity type)
  const [teamSheetData, setTeamSheetData] = useState<TeamCardData | null>(null);
  const [teamSheetVisible, setTeamSheetVisible] = useState(false);
  const [coachSheetData, setCoachSheetData] = useState<CoachCardData | null>(null);
  const [coachSheetVisible, setCoachSheetVisible] = useState(false);
  const [playerSheetData, setPlayerSheetData] = useState<PlayerCardData | null>(null);
  const [playerSheetVisible, setPlayerSheetVisible] = useState(false);
  const [eventSheetData, setEventSheetData] = useState<EventCardData | null>(null);
  const [eventSheetVisible, setEventSheetVisible] = useState(false);
  // Non-sports entity sheets
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
      // Sports sheets (single sheet per entity)
      openTeamSheet: (data) => { setTeamSheetData(data); setTeamSheetVisible(true); },
      closeTeamSheet: () => setTeamSheetVisible(false),
      openCoachSheet: (data) => { setCoachSheetData(data); setCoachSheetVisible(true); },
      closeCoachSheet: () => setCoachSheetVisible(false),
      openPlayerSheet: (data) => { setPlayerSheetData(data); setPlayerSheetVisible(true); },
      closePlayerSheet: () => setPlayerSheetVisible(false),
      openEventSheet: (data) => { setEventSheetData(data); setEventSheetVisible(true); },
      closeEventSheet: () => setEventSheetVisible(false),
      // Non-sports
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

  // Voice overlay state (hold on Nexus tab)
  const [voiceVisible, setVoiceVisible] = useState(false);

  const { voiceState, audioLevel, startListening, stopListening } = useSpeechRecognition({
    onTranscript: (text, isFinal) => {
      if (isFinal && text.trim()) {
        stopListening();
        setVoiceVisible(false);
        setSplitNexusPendingQuery(text.trim());
        openSplitNexus();
      }
    },
  });

  useEffect(() => {
    registerVoiceHandlers(
      () => { setVoiceVisible(true); startListening(); },
      () => { stopListening(); setVoiceVisible(false); },
    );
  }, [startListening, stopListening]);

  // Settings panel state — DrawerPanel handles scrim + animation internally
  const [settingsPanelVisible, setSettingsPanelVisible] = useState(false);

  const openPanel = useCallback(() => {
    setSettingsPanelVisible(true);
  }, []);

  const dismissPanel = useCallback(() => {
    setSettingsPanelVisible(false);
  }, []);

  useEffect(() => {
    registerSettingsPanelHandlers(openPanel, dismissPanel);
  }, [openPanel, dismissPanel]);

  // Side panel state — DrawerPanel handles scrim + animation internally
  const [sidePanelVisible, setSidePanelVisible] = useState(false);

  const openSidePanelCb = useCallback(() => {
    setSidePanelVisible(true);
  }, []);

  const dismissSidePanelCb = useCallback(() => {
    setSidePanelVisible(false);
  }, []);

  useEffect(() => {
    registerSidePanelHandlers(openSidePanelCb, dismissSidePanelCb);
  }, [openSidePanelCb, dismissSidePanelCb]);

  const router = useRouter();

  // Show onboarding when not authenticated OR when authenticated but new user needs onboarding
  const showAuthModal = !authState.isChecking && (!authState.isAuthenticated || authState.isNewUser);

  // Normal navigation with tabs — edge-to-edge, no header
  const containerDynamic = { flex: 1 as const, backgroundColor: colors.bg };

  return (
    <View style={containerDynamic}>
      {/* Content wrapper */}
      <View style={containerDynamic}>
        <View style={containerDynamic}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: shouldUseSlideAnimation() ? 'slide_from_right' : 'none',
              gestureEnabled: false,
              contentStyle: { backgroundColor: colors.bg },
            }}
            screenListeners={{ focus: () => resetFooter() }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="coach" />
            <Stack.Screen name="login" />
            <Stack.Screen name="nexus" />
            <Stack.Screen name="wallet" options={{ contentStyle: { backgroundColor: colors.bg } }} />
            <Stack.Screen name="video" />
            <Stack.Screen name="settings" />
            {/* section and messages are inside (tabs)/(home) Stack — tab bar stays visible */}
            <Stack.Screen
              name="modal"
              options={{ presentation: 'modal', title: 'Modal' }}
            />
          </Stack>
        </View>
        <UniversalFooter />
      </View>

      {/* Side panels — rendered after content so they overlay it correctly */}
      <SettingsPanel visible={settingsPanelVisible} onClose={dismissPanel} />
      <SidePanel visible={sidePanelVisible} onClose={dismissSidePanelCb} />

      {/* Universal entity sheets (single sheet per entity type) */}
      <TeamSheet
        visible={teamSheetVisible}
        onClose={() => setTeamSheetVisible(false)}
        data={teamSheetData}
      />
      <CoachSheet
        visible={coachSheetVisible}
        onClose={() => setCoachSheetVisible(false)}
        data={coachSheetData}
      />
      <PlayerSheet
        visible={playerSheetVisible}
        onClose={() => setPlayerSheetVisible(false)}
        data={playerSheetData}
      />
      <EventSheet
        visible={eventSheetVisible}
        onClose={() => setEventSheetVisible(false)}
        data={eventSheetData}
      />
      {/* Non-sports entity sheets */}
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

      <UniversalFinder />
      <SplitNexusOverlay visible={splitNexusVisible} onClose={() => setSplitNexusVisible(false)} />
      <VoiceOverlay
        visible={voiceVisible}
        voiceState={voiceState}
        audioLevel={audioLevel}
        onStop={() => { stopListening(); setVoiceVisible(false); }}
      />
      <SearchOverlay visible={searchOverlayVisible} onClose={() => setSearchOverlayVisible(false)} />
      <MultitaskingOverlay />
      <OrgDrawer />
      <ModeSwitcherOverlay />
      <CallOverlay />
      <IncomingCallOverlay />
      <ProfileSheet />
      <KXTransition />
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
    <KXThemeProvider>
    <AuthProvider>
      <AppProvider>
        <MultitaskingProvider>
        <QueryProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <GestureHandlerRootView style={styles.container}>
            <BottomSheetModalProvider>
              <AppShell />

              {/* Boot splash overlay - fades out when app is ready */}
              {bootSplashVisible && !BOOT_SPLASH_COMPLETED ? (
                <SplashScreen
                  onReady={handleSplashComplete}
                  isAppReady={isAppReady}
                />
              ) : null}
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
        </QueryProvider>
        </MultitaskingProvider>
      </AppProvider>
    </AuthProvider>
    </KXThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
