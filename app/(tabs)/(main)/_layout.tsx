/**
 * Home Stack — nested inside the Home tab.
 * All screens (home, messages, threads, sections) live in one flat Stack.
 * Swipe-right = back on every screen except home (root).
 * No nested stacks — keeps gesture propagation simple.
 */

import { Stack } from 'expo-router';
import { resetFooter } from '@/utils/global-footer-hide';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        contentStyle: { backgroundColor: '#000000' },
      }}
      screenListeners={{
        focus: () => resetFooter(),
      }}
    >
      <Stack.Screen name="index" options={{ gestureEnabled: false, fullScreenGestureEnabled: false }} />
      <Stack.Screen name="messages/index" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="messages/[threadId]" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
