/**
 * Messages Layout
 * Top tabs handled by PagerView inside index.tsx (Inbox | Groups | Requests).
 * Sub-footer hidden — all navigation is via swipeable top tabs.
 */

import { Tabs } from 'expo-router';
import React from 'react';

export default function MessagesLayout() {
  return (
    <Tabs
      tabBar={() => null}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Messages' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat', href: null }} />
      <Tabs.Screen name="explore" options={{ title: 'Search', href: null }} />
      <Tabs.Screen name="alerts" options={{ title: 'Activity', href: null }} />
      <Tabs.Screen name="lists" options={{ title: 'Lists', href: null }} />
      <Tabs.Screen name="requests" options={{ title: 'Requests', href: null }} />
    </Tabs>
  );
}
