/**
 * Home Stack — nested inside the Home tab.
 * All screens (home, messages, threads, sections, phone) live in one flat Stack.
 * Back navigation: swipe-right on Nexus icon (handled in universal-footer).
 * Swipe-right on page → opens side panel (handled in root _layout.tsx).
 * Native back gestures disabled — Nexus swipe is the only back mechanism.
 *
 * Animation rule: ONLY footer swipe triggers slide animation.
 * All taps navigate instantly (animation: 'none').
 */

import { Stack } from 'expo-router';
import { resetFooter } from '@/utils/global-footer-hide';
import { closeSidePanel } from '@/utils/global-side-panel';
import { shouldUseSlideAnimation } from '@/utils/global-footer-swipe';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={() => ({
        headerShown: false,
        animation: shouldUseSlideAnimation() ? 'slide_from_right' : 'none',
        gestureEnabled: false,
        fullScreenGestureEnabled: false,
        contentStyle: { backgroundColor: '#000000' },
      })}
      screenListeners={{
        focus: () => { resetFooter(); closeSidePanel(); },
      }}
    >
      <Stack.Screen name="index" />
      {/* Messages */}
      <Stack.Screen name="messages/index" />
      <Stack.Screen name="messages/[threadId]" />
      <Stack.Screen name="messages/search" />
      <Stack.Screen name="messages/filters" />
      <Stack.Screen name="messages/channels" />
      <Stack.Screen name="messages/notifications" />
      <Stack.Screen name="messages/archived" />
      <Stack.Screen name="messages/blocked" />
      {/* Phone */}
      <Stack.Screen name="phone/index" />
      <Stack.Screen name="phone/recent" />
      <Stack.Screen name="phone/dialpad" />
      <Stack.Screen name="phone/favorites" />
      <Stack.Screen name="phone/voicemail" />
      <Stack.Screen name="phone/blocked" />
      <Stack.Screen name="phone/settings" />
    </Stack>
  );
}
