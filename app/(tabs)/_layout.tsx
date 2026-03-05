/**
 * KaNeXT OS — 3-Tab Bottom Navigation
 *
 * Tabs (left → right, glyphs only):
 *   Home | Nexus | Wallet
 *
 * Rules:
 * - UNIVERSAL across ALL MODES (no exceptions)
 * - Glyph icons only (no text labels)
 * - Order is fixed and must never change per mode
 * - Nexus is the center anchor (primary) and always present
 * - Long-press Home → Mode Switcher
 * - Nexus double-tap → Split Nexus, long-press → Search + Voice
 *
 * Visual: jet black bar, white active icon inside subtle bubble,
 * dark gray inactive icons, no mode accent color.
 */

import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useRef, useCallback } from 'react';
import { View, Platform, StyleSheet } from 'react-native';

import * as Haptics from 'expo-haptics';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol, SymbolViewProps } from '@/components/ui/icon-symbol';
import { Layout } from '@/constants/theme';
import { openSearchOverlay } from '@/utils/global-search-overlay';
import { openSplitNexus } from '@/utils/global-split-nexus';
import { triggerKXTransition } from '@/utils/global-transition';
import { openModeSwitcher } from '@/utils/global-mode-switcher';
import { startGlobalVoice } from '@/utils/global-voice';

// Always-dark tab bar palette — no mode accent, black and white only
const TAB = {
  bg: '#000000',
  border: '#2F3336',
  active: '#FFFFFF',
  inactive: '#52525B',
  bubble: 'rgba(255, 255, 255, 0.10)',
};

// Standard tab icon with bubble when active
function TabIcon({
  name,
  focused,
  size = 34,
}: {
  name: SymbolViewProps['name'];
  focused: boolean;
  size?: number;
}) {
  return (
    <View style={[tabStyles.bubble, focused && tabStyles.bubbleActive]}>
      <IconSymbol
        size={size}
        name={name}
        color={focused ? TAB.active : TAB.inactive}
      />
    </View>
  );
}

const tabStyles = StyleSheet.create({
  bubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleActive: {
    backgroundColor: TAB.bubble,
  },
});

export default function TabLayout() {
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

  // Home tab button: long-press → Mode Switcher + transition
  const HomeTabButton = useCallback(
    (props: any) => (
      <HapticTab
        {...props}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          openModeSwitcher();
        }}
        onPress={(e: any) => {
          triggerKXTransition();
          props.onPress?.(e);
        }}
      />
    ),
    []
  );

  // Nexus tab button: long-press → search + voice, double-tap → split Nexus
  const lastNexusTapRef = useRef(0);
  const NexusTabButton = useCallback(
    (props: any) => (
      <HapticTab
        {...props}
        onLongPress={() => {
          openSearchOverlay();
          startGlobalVoice();
        }}
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

  // Wallet tab button: no long-press gesture (unassigned)
  const WalletTabButton = useCallback(
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

  // Post-auth default: route to Home
  useEffect(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    const timer = setTimeout(() => {
      router.replace('/(tabs)/' as any);
    }, 50);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: TAB.active,
        tabBarInactiveTintColor: TAB.inactive,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: TAB.bg,
          borderTopColor: TAB.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === 'ios' ? Layout.tabBarHeight : 60,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 8,
        },
        headerShown: false,
        tabBarButton: TransitionTab,
      }}
    >
      {/* Visible tabs: Home | Nexus | Wallet */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="house.fill" focused={focused} />
          ),
          tabBarButton: HomeTabButton,
        }}
      />
      <Tabs.Screen
        name="nexus"
        options={{
          title: 'Nexus',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="sparkles" focused={focused} size={38} />
          ),
          tabBarButton: NexusTabButton,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="creditcard.fill" focused={focused} />
          ),
          tabBarButton: WalletTabButton,
        }}
      />

      {/* Hidden tabs — preserved but not visible in tab bar */}
      <Tabs.Screen name="media" options={{ href: null }} />
      <Tabs.Screen name="activity" options={{ href: null }} />
      <Tabs.Screen name="organization" options={{ href: null }} />
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="home" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
