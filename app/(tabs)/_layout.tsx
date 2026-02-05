/**
 * KaNeXT OS Tab Layout
 * Bottom navigation: Home | Search | Nexus | Activity | Organization
 * Same across all modes - icons are consistent, behavior is mode-contextual.
 */

import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol, SymbolViewProps } from '@/components/ui/icon-symbol';
import { Colors, Layout } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';

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
  const { state, setPendingLandingTab } = useAppContext();
  const hasNavigated = useRef(false);

  // Handle landing navigation based on pendingLandingTab
  // Rule A: After first mode pick → land on HOME
  // Rule B: Normal app launch → land on NEXUS (default initialRouteName)
  useEffect(() => {
    if (hasNavigated.current) return;

    if (state.pendingLandingTab === 'home') {
      // First-time mode selection: navigate to Home
      hasNavigated.current = true;
      router.replace('/(tabs)' as any);
      setPendingLandingTab(null);
    }
    // If pendingLandingTab is null, keep default (nexus via initialRouteName)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.pendingLandingTab]);

  return (
    <Tabs
      initialRouteName="nexus"
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? Layout.tabBarHeight : 60,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="house.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="magnifyingglass" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="nexus"
        options={{
          title: 'Nexus',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="sparkles" color={color} focused={focused} />
          ),
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
