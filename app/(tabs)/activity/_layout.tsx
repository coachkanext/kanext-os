/**
 * Messages Layout
 * Top tabs handled by PagerView inside index.tsx (Inbox | Rooms | Requests | Pinned).
 * 4-tab swipeable hub — sub-footer hidden.
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
