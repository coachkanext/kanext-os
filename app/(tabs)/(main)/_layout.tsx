/**
 * Home Stack — nested inside the Home tab.
 * All screens (home, messages, threads, sections) live in one flat Stack.
 * Back navigation: swipe-right on Nexus icon (handled in universal-footer).
 * Swipe-right on page → opens side panel (handled in root _layout.tsx).
 * Native back gestures disabled — Nexus swipe is the only back mechanism.
 */

import { Stack } from 'expo-router';
import { resetFooter } from '@/utils/global-footer-hide';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
        gestureEnabled: false,
        fullScreenGestureEnabled: false,
        contentStyle: { backgroundColor: '#000000' },
      }}
      screenListeners={{
        focus: () => resetFooter(),
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="messages/index" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="messages/[threadId]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="phone/index" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
