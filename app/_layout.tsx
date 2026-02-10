/**
 * KaNeXT OS Root Layout
 * Entry point with launch sequence, global providers, and navigation structure.
 *
 * Boot Sequence:
 * 1. Cold launch → Show X/Twitter style splash (KaNeXT + Powered by Nexus)
 * 2. Splash fades when app is ready → Silent session check
 * 3. If authenticated → Nexus unlocked
 * 4. If not authenticated → Auth modal overlay
 *
 * Only shows splash on cold start, not when resuming from background.
 */

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreenModule from 'expo-splash-screen';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Animated, Keyboard } from 'react-native';
import 'react-native-reanimated';

import { SplashScreen } from '@/components/splash-screen';
import { GlobalHeader } from '@/components/global-header';
import { AvatarDrawer } from '@/components/avatar-drawer';
import { AuthModal } from '@/components/auth/auth-modal';
import { VoiceOverlay } from '@/components/nexus/voice-overlay';
import { KXTransition } from '@/components/kx-transition';
import { AppProvider } from '@/context/app-context';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { registerDrawerHandlers } from '@/utils/global-drawer';
import { registerVoiceHandlers } from '@/utils/global-voice';

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

  // Global voice state — mounted at root so it works from any tab
  const globalTranscriptRef = useRef('');

  const { voiceState, audioLevel, startListening, stopListening } = useSpeechRecognition({
    onTranscript: useCallback((text: string, isFinal: boolean) => {
      globalTranscriptRef.current = text;
    }, []),
  });

  // Register global voice handlers
  useEffect(() => {
    registerVoiceHandlers(
      () => {
        Keyboard.dismiss();
        globalTranscriptRef.current = '';
        startListening();
      },
      () => {
        stopListening();
      }
    );
  }, [startListening, stopListening]);

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

      {/* Global Voice Overlay — triggered from Nexus tab long-press */}
      <VoiceOverlay
        visible={voiceState !== 'idle'}
        voiceState={voiceState}
        audioLevel={audioLevel}
        onStop={stopListening}
      />

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
          <View style={styles.container}>
            <AppShell />

            {/* Boot splash overlay - fades out when app is ready */}
            {bootSplashVisible && !BOOT_SPLASH_COMPLETED && (
              <SplashScreen
                onReady={handleSplashComplete}
                isAppReady={isAppReady}
              />
            )}
          </View>
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
