/**
 * Comms Nested Tabs Layout
 * Top text-segmented navigation: Feed | Search | Inbox | Activity | Lists
 */

import { Tabs } from 'expo-router';
import React from 'react';

import { CommsTabBar } from '@/components/messages/comms-tab-bar';

export default function CommsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CommsTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarPosition: 'top',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Feed' }} />
      <Tabs.Screen name="explore" options={{ title: 'Search' }} />
      <Tabs.Screen name="chat" options={{ title: 'Inbox' }} />
      <Tabs.Screen name="alerts" options={{ title: 'Activity' }} />
      <Tabs.Screen name="lists" options={{ title: 'Lists' }} />
      <Tabs.Screen name="requests" options={{ href: null }} />
    </Tabs>
  );
}
