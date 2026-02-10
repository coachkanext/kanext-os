/**
 * KaNeXT OS Tab Layout
 * Bottom navigation: Home | Search | Nexus | Activity | Organization
 * Same across all modes - icons are consistent, behavior is mode-contextual.
 */

import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol, SymbolViewProps } from '@/components/ui/icon-symbol';
import { Colors, Layout } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { openAvatarDrawer } from '@/utils/global-drawer';
import { startGlobalVoice } from '@/utils/global-voice';
import { triggerKXTransition } from '@/utils/global-transition';

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
          props.onPress?.(e);
        }}
      />
    ),
    []
  );

  // Nexus tab button with long-press to trigger global voice overlay + transition
  const NexusTabButton = useCallback(
    (props: any) => (
      <HapticTab
        {...props}
        onLongPress={startGlobalVoice}
        onPress={(e: any) => {
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
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? Layout.tabBarHeight : 60,
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
            <TabIcon name="sparkles" color={color} focused={focused} />
          ),
          tabBarButton: NexusTabButton,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="bell.fill" color={color} focused={focused} />
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
