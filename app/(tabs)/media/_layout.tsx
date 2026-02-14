/**
 * Media Nested Tabs Layout
 * Sub-footer navigation: Home | Reels | Create | Library | You
 * Renders custom tab bar (VideoSubFooter) above the main app tab bar.
 */

import { Tabs } from 'expo-router';
import React from 'react';

import { VideoSubFooter } from '@/components/media/video-sub-footer';
import { useOperatingRole } from '@/context/app-context';
import type { Role } from '@/types';

const CREATOR_ROLES: Role[] = [
  'founder',
  'admin',
  'head_coach',
  'assistant_coach',
  'gm',
  'student_athlete',
  'staff',
];

export default function MediaLayout() {
  const role = useOperatingRole();
  const canCreate = CREATOR_ROLES.includes(role);

  return (
    <Tabs
      tabBar={(props) => <VideoSubFooter {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="reels" options={{ title: 'Reels' }} />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          href: canCreate ? undefined : null,
        }}
      />
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
      <Tabs.Screen name="you" options={{ title: 'You' }} />
    </Tabs>
  );
}
