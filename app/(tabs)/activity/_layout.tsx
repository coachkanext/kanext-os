/**
 * Messages Nested Tabs Layout
 * Top segmented control: Feed | Chat | Requests | Alerts
 */

import { Tabs } from 'expo-router';
import React from 'react';

import { MessagesSegmentedControl } from '@/components/messages/messages-segmented-control';

export default function ActivityLayout() {
  return (
    <Tabs
      tabBar={(props) => <MessagesSegmentedControl {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Feed' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="requests" options={{ title: 'Requests' }} />
      <Tabs.Screen name="alerts" options={{ title: 'Alerts' }} />
    </Tabs>
  );
}
