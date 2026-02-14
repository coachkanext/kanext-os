/**
 * Media Nested Tabs Layout
 * Sub-footer navigation: Home | Reels | Create | Inbox | You
 * Renders custom tab bar (VideoSubFooter) above the main app tab bar.
 */

import { Tabs } from 'expo-router';
import React from 'react';

import { VideoSubFooter } from '@/components/media/video-sub-footer';

export default function MediaLayout() {
  return (
    <Tabs
      tabBar={(props) => <VideoSubFooter {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="reels" options={{ title: 'Reels' }} />
      <Tabs.Screen name="create" options={{ title: 'Create' }} />
      <Tabs.Screen name="inbox" options={{ title: 'Inbox' }} />
      <Tabs.Screen name="library" options={{ title: 'Library', href: null }} />
      <Tabs.Screen name="you" options={{ title: 'You' }} />
    </Tabs>
  );
}
