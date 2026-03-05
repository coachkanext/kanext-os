/**
 * Home Stack — nested inside the Home tab.
 * Pushing icon screens (messages, section) within this Stack.
 * Full-screen swipe-back enabled — swipe left from anywhere to go back.
 */

import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        contentStyle: { backgroundColor: '#000000' },
      }}
    />
  );
}
