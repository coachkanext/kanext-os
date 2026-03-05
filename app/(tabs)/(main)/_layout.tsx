/**
 * Home Stack — nested inside the Home tab.
 * Pushing icon screens (messages, section) within this Stack
 * keeps the 3-tab footer visible at all times.
 * Swipe gestures disabled — swipe is reserved for tab switching.
 */

import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        contentStyle: { backgroundColor: '#000000' },
      }}
    />
  );
}
