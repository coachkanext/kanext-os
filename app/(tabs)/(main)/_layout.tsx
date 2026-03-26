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
      screenOptions={{
        headerShown: false,
        animation: 'none' as const,
        gestureEnabled: false,
        fullScreenGestureEnabled: false,
        contentStyle: { backgroundColor: '#F5EFE4' },
      }}
      screenListeners={({ navigation }) => ({
        focus: () => {
          innerNavRef.current = navigation;
          resetFooter();
          closeSidePanel();
        },
        beforeRemove: () => {
          resetFooter();
        },
      })}
    >
      <Stack.Screen name="index" />
      {/* Messages */}
      <Stack.Screen name="messages/index" />
      <Stack.Screen name="messages/new-message" />
      <Stack.Screen name="messages/new-channel" />
      <Stack.Screen name="messages/new-email" />
      <Stack.Screen name="messages/[threadId]" />
      <Stack.Screen name="messages/email-thread" />
      <Stack.Screen name="messages/room-info" />
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
      <Stack.Screen name="phone/vm/[id]" />
      <Stack.Screen name="phone/blocked" />
      <Stack.Screen name="phone/settings" />
      {/* Mode */}
      <Stack.Screen name="mode/index" />
      {/* Agenda */}
      <Stack.Screen name="agenda/index" />
      {/* Social */}
      <Stack.Screen name="social/index" />
      <Stack.Screen
        name="social/create"
        options={{ presentation: 'fullScreenModal', gestureEnabled: false } as any}
      />
      <Stack.Screen name="social/edit" />
      <Stack.Screen name="social/publish" />
      <Stack.Screen name="social/person" />
      <Stack.Screen name="social/brand" />
      <Stack.Screen name="social/grid-feed" />
      <Stack.Screen name="social/profile-reels" />
      <Stack.Screen name="social/edit-profile" />
      <Stack.Screen name="social/your-posts" />
      <Stack.Screen name="social/saved" />
      <Stack.Screen name="social/drafts" />
      <Stack.Screen name="social/analytics" />
      <Stack.Screen name="social/following" />
      <Stack.Screen name="social/settings" />
      {/* Season */}
      <Stack.Screen name="season/index" />
      {/* Roster */}
      <Stack.Screen name="roster/index" />
      {/* Media */}
      <Stack.Screen name="media/index" />
      {/* Recruits / Prospects / Leads / Outreach / Admissions */}
      <Stack.Screen name="recruits/index" />
      {/* Give */}
      <Stack.Screen name="give/index" />
      {/* Fund */}
      <Stack.Screen name="fund/index" />
      {/* Store / Give */}
      <Stack.Screen name="store/index" />
      {/* KayTV */}
      <Stack.Screen name="kaytv/index" />
      <Stack.Screen name="kaytv/player" />
      <Stack.Screen name="kaytv/search" />
      <Stack.Screen
        name="kaytv/upload"
        options={{ presentation: 'fullScreenModal', gestureEnabled: false } as any}
      />
      <Stack.Screen name="kaytv/see-all" />
      {/* KayStudios */}
      <Stack.Screen name="kaystudios/index" />
      <Stack.Screen name="kaystudios/detail" />
      <Stack.Screen name="kaystudios/search" />
      <Stack.Screen name="kaystudios/experience" />
      {/* Pulse */}
      <Stack.Screen name="pulse/index" />
      {/* Profile */}
      <Stack.Screen name="profile/index" />
      {/* Members */}
      <Stack.Screen name="members/index" />
      {/* Outreach */}
      <Stack.Screen name="outreach/index" />
      {/* Network */}
      <Stack.Screen name="network/index" />
      {/* Earn */}
      <Stack.Screen name="earn/index" />
      {/* Deals */}
      <Stack.Screen name="deals/index" />
      <Stack.Screen name="deals/contact" />
      {/* Hub */}
      <Stack.Screen name="hub/index" />
      <Stack.Screen name="hub/newsletter-compose" />
      <Stack.Screen name="hub/community" />
      <Stack.Screen name="hub/dept-detail" />
      <Stack.Screen name="hub/group-detail" />
      <Stack.Screen name="hub/announcement-compose" />
      <Stack.Screen name="hub/care-request" />
      <Stack.Screen name="hub/education" />
      <Stack.Screen name="hub/edu-announcement" />
      <Stack.Screen name="hub/campus" />
      {/* Admissions */}
      <Stack.Screen name="admissions/index" />
    </Stack>
  );
}
