/**
 * Home Stack — nested inside the Home tab.
 * All screens (home, messages, threads, sections, phone) live in one flat Stack.
 * Back navigation: swipe-right on Nexus icon (handled in universal-footer).
 * Swipe-right on page → opens side panel (handled in root _layout.tsx).
 * Native back gestures disabled — Nexus swipe is the only back mechanism.
 *
 * Universal slide animation on all transitions.
 */

import { useRef, useEffect } from 'react';
import { Stack } from 'expo-router';
import { StackActions } from '@react-navigation/native';
import { resetFooter } from '@/utils/global-footer-hide';
import { closeSidePanel } from '@/utils/global-side-panel';
import { registerInnerPopToTop } from '@/utils/global-inner-nav';

export default function HomeLayout() {
  const innerNavRef = useRef<any>(null);

  useEffect(() => {
    return registerInnerPopToTop(() => {
      const nav = innerNavRef.current;
      if (!nav) return;
      const state = nav.getState();
      // Only pop if there's more than 1 screen in the Stack
      if (state && state.routes.length > 1) {
        nav.dispatch(StackActions.popToTop());
      }
    });
  }, []);

  return (
    <Stack
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: 'none' as const,
        gestureEnabled: false,
        fullScreenGestureEnabled: false,
        contentStyle: { backgroundColor: 'transparent' },
        ...(route.name !== 'index' && { presentation: 'containedTransparentModal' as const }),
      })}
      screenListeners={({ navigation }) => ({
        focus: () => {
          innerNavRef.current = navigation;
          resetFooter();
          closeSidePanel();
        },
      })}
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
      {/* Mode */}
      <Stack.Screen name="mode/index" />
      {/* Agenda */}
      <Stack.Screen name="agenda/index" />
      {/* Social */}
      <Stack.Screen name="social/index" />
      {/* Season */}
      <Stack.Screen name="season/index" />
      {/* Roster */}
      <Stack.Screen name="roster/index" />
      {/* Media */}
      <Stack.Screen name="media/index" />
      {/* Store / Give */}
      <Stack.Screen name="store/index" />
      {/* KayTV */}
      <Stack.Screen name="kaytv/index" />
      {/* Profile */}
      <Stack.Screen name="profile/index" />
    </Stack>
  );
}
