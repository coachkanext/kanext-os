/**
 * KaNeXT OS — Tab Navigation
 *
 * Tabs navigator is kept for state preservation (Nexus conversation, etc.)
 * but the tab bar is completely hidden. Navigation is handled by the
 * universal footer bar rendered in the root layout.
 */

import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';

import { setCurrentTab } from '@/utils/global-semi-circle';
import { resetFooter } from '@/utils/global-footer-hide';

export default function TabLayout() {
  const router = useRouter();
  const hasNavigated = useRef(false);

  // Post-auth default: route to Home
  useEffect(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    const timer = setTimeout(() => {
      router.replace('/(tabs)/(main)' as any);
    }, 50);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Tabs
      initialRouteName="(main)"
      screenListeners={{
        focus: (e) => {
          const route = e.target?.split('-')[0];
          if (route) {
            setCurrentTab(route);
          }
          resetFooter();
        },
      }}
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: { display: 'none', height: 0 },
        headerShown: false,
      }}
    >
      {/* Primary tab — home */}
      <Tabs.Screen name="(main)" options={{ title: 'Home' }} />

      {/* Hidden tabs — preserved but not visible */}
      <Tabs.Screen name="media" options={{ href: null }} />
      <Tabs.Screen name="activity" options={{ href: null }} />
      <Tabs.Screen name="organization" options={{ href: null }} />
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="home" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
