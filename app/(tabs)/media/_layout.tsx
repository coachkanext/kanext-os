/**
 * Media Layout
 * Top tabs handled by PagerView inside index.tsx (Feed | Explore | Room | Library).
 * Sub-footer hidden — all navigation is via swipeable top tabs.
 */

import { Tabs } from 'expo-router';
import React from 'react';
import { resetFooter } from '@/utils/global-footer-hide';

export default function MediaLayout() {
  return (
    <Tabs
      tabBar={() => null}
      screenOptions={{
        headerShown: false,
      }}
      screenListeners={{ focus: () => resetFooter() }}
    >
      <Tabs.Screen name="index" options={{ title: 'Media' }} />
      <Tabs.Screen name="reels" options={{ title: 'Reels', href: null }} />
      <Tabs.Screen name="create" options={{ title: 'Create', href: null }} />
      <Tabs.Screen name="inbox" options={{ title: 'Inbox', href: null }} />
      <Tabs.Screen name="library" options={{ title: 'Library', href: null }} />
      <Tabs.Screen name="you" options={{ title: 'You', href: null }} />
    </Tabs>
  );
}
