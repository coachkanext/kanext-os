/**
 * Home Stack — nested inside the Home tab.
 * All screens (home, messages, threads, sections, phone) live in one flat Stack.
 * Back navigation: swipe-right on Nexus icon (handled in universal-footer).
 * Swipe-right on page → opens side panel (handled in root _layout.tsx).
 * Native back gestures disabled — Nexus swipe is the only back mechanism.
 */

import { Stack } from 'expo-router';
import { resetFooter } from '@/utils/global-footer-hide';
import { closeSidePanel } from '@/utils/global-side-panel';

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
        focus: () => { resetFooter(); closeSidePanel(); },
      }}
    >
      <Stack.Screen name="index" />
      {/* Messages */}
      <Stack.Screen name="messages/index" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="messages/[threadId]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="messages/search" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="messages/filters" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="messages/channels" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="messages/notifications" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="messages/archived" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="messages/blocked" options={{ animation: 'slide_from_right' }} />
      {/* Phone */}
      <Stack.Screen name="phone/index" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="phone/recent" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="phone/dialpad" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="phone/favorites" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="phone/voicemail" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="phone/blocked" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="phone/settings" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
