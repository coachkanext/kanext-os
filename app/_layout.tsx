/**
 * KaNeXT OS Root Layout
 * Entry point with launch sequence, global providers, and navigation structure.
 *
 * Boot Sequence:
 * 1. Cold launch → Show BootSplash FIRST (2.5s visible + fade out)
 * 2. After splash fades → Check if first run
 *    - First run (no saved mode) → ModeGate
 *    - Has saved mode → Normal navigation
 * 3. Mode selection from ModeGate → Direct to app (no splash)
 */

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreenModule from 'expo-splash-screen';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';

import { SplashScreen } from '@/components/splash-screen';
import { ModeGate } from '@/components/mode-gate';
import { GlobalHeader } from '@/components/global-header';
import { AppProvider, useAppContext } from '@/context/app-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
 * App Shell - handles first-run gate vs normal navigation
 * Only rendered AFTER boot splash completes
 */
function AppShell() {
  const colorScheme = useColorScheme();
  const { state } = useAppContext();

  // Show loading while checking persisted state
  if (state.isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colorScheme === 'dark' ? '#000' : '#FFF' }]}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#FFF' : '#000'} />
      </View>
    );
  }

  // Show mode gate on first run (no tabs)
  if (state.isFirstRun) {
    return <ModeGate />;
  }

  // Normal navigation with tabs + global header
  return (
    <View style={styles.container}>
      <GlobalHeader />
      <View style={styles.stackContainer}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="modal"
            options={{ presentation: 'modal', title: 'Modal' }}
          />
        </Stack>
      </View>
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);

  // Boot splash guard: uses module-level flag to ensure it only shows ONCE per app session.
  // Initialize from the module flag so remounts don't reset this.
  const [bootSplashVisible, setBootSplashVisible] = useState(() => !BOOT_SPLASH_COMPLETED);

  // Extra guard: useRef to prevent any race conditions within a single mount
  const splashCompletedRef = useRef(BOOT_SPLASH_COMPLETED);

  useEffect(() => {
    // Initialize app
    async function prepare() {
      try {
        // Add any async initialization here (fonts, data, etc.)
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  const handleBootSplashComplete = useCallback(async () => {
    // Guard: only complete once
    if (splashCompletedRef.current) return;

    // Set module-level flag FIRST to prevent any future remounts from showing splash
    BOOT_SPLASH_COMPLETED = true;
    splashCompletedRef.current = true;

    // Hide native splash (if still visible)
    await SplashScreenModule.hideAsync();
    // Now show the app content
    setBootSplashVisible(false);
  }, []);

  // Show nothing until ready
  if (!isReady) {
    return null;
  }

  // BOOT SPLASH: Show FIRST, blocking everything else
  // This runs ONCE per cold app launch, before ModeGate or app content.
  // Double-check module flag to prevent any edge cases where state might reset.
  if (bootSplashVisible && !BOOT_SPLASH_COMPLETED) {
    return (
      <View style={styles.container}>
        <SplashScreen onAnimationComplete={handleBootSplashComplete} />
        <StatusBar style="light" />
      </View>
    );
  }

  // After boot splash completes, show the app
  return (
    <AppProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={styles.container}>
          <AppShell />
        </View>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stackContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
