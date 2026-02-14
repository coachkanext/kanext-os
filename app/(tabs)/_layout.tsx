/**
 * KaNeXT OS Tab Layout
 * Bottom navigation: Home | Search | Nexus | Activity | Organization
 * Same across all modes - icons are consistent, behavior is mode-contextual.
 */

import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useRef, useCallback } from 'react';
import { Platform, Text, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol, SymbolViewProps } from '@/components/ui/icon-symbol';
import { Colors, Layout } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { openAvatarDrawer } from '@/utils/global-drawer';
import { startGlobalVoice } from '@/utils/global-voice';
import { openFinder } from '@/utils/global-finder';
import { triggerKXTransition } from '@/utils/global-transition';
import { requestHomeReset } from '@/utils/global-home';

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

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
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

  // Nexus tab button: long-press → voice, double-tap → Ask Nexus
  const lastNexusTapRef = useRef(0);
  const NexusTabButton = useCallback(
    (props: any) => (
      <HapticTab
        {...props}
        onLongPress={startGlobalVoice}
        onPress={(e: any) => {
          const now = Date.now();
          if (now - lastNexusTapRef.current < 350) {
            // Double-tap detected → open Universal Finder
            lastNexusTapRef.current = 0;
            openFinder();
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

  // Always open to Nexus on app launch
  useEffect(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    // Small delay to ensure tabs are mounted before navigating
    const timer = setTimeout(() => {
      router.replace('/(tabs)/nexus' as any);
    }, 50);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Tabs
      initialRouteName="nexus"
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
          title: 'Media',
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
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="figure.mind.and.body" color={color} focused={focused} />
          ),
          tabBarButton: NexusTabButton,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Comms',
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
  nexusN: {
    fontSize: 22,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -1,
  },
});
