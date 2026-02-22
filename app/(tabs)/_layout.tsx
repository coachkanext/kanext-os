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
import { Colors, Layout, ModeColors, MODE_ACCENT } from '@/constants/theme';
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
        tabBarActiveTintColor: MODE_ACCENT[mode],
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: '#2F3336',
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
