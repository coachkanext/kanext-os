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
        contentStyle: { backgroundColor: '#FFFFFF' },
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
      <Stack.Screen name="phone/calls" />
      <Stack.Screen name="phone/contacts" />
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
      <Stack.Screen name="agenda/reminders" />
      <Stack.Screen name="agenda/tasks" />
      <Stack.Screen name="agenda/availability" />
      <Stack.Screen name="agenda/categories" />
      <Stack.Screen name="agenda/reports" />
      <Stack.Screen name="agenda/follower-events" />
      <Stack.Screen name="agenda/sports-coach-calendar" />
      <Stack.Screen name="agenda/sports-player-calendar" />
      <Stack.Screen name="agenda/booking/index" />
      <Stack.Screen name="agenda/booking/time" />
      <Stack.Screen name="agenda/booking/confirm" />
      <Stack.Screen name="agenda/booking/success" />
      <Stack.Screen name="agenda/settings" />
      <Stack.Screen name="agenda/help" />
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
      <Stack.Screen name="social/scheduled" />
      <Stack.Screen name="social/analytics" />
      <Stack.Screen name="social/following" />
      <Stack.Screen name="social/channel" />
      <Stack.Screen name="social/settings" />
      <Stack.Screen name="social/help" />
      <Stack.Screen name="social/channels" />
      <Stack.Screen name="social/posting-policy" />
      {/* Season */}
      <Stack.Screen name="season/index" />
      {/* Roster */}
      <Stack.Screen name="roster/index" />
      <Stack.Screen name="roster/depth-chart" />
      <Stack.Screen name="roster/gap-analysis" />
      <Stack.Screen name="roster/player-profile" />
      <Stack.Screen name="roster/my-profile" />
      <Stack.Screen name="roster/staff" />
      <Stack.Screen name="roster/scholarships" />
      <Stack.Screen name="roster/medical" />
      {/* Media */}
      <Stack.Screen name="media/index" />
      {/* Recruits / Prospects / Leads / Outreach / Admissions */}
      <Stack.Screen name="recruits/index" />
      {/* Give */}
      <Stack.Screen name="give/index" />
      <Stack.Screen name="give/giving-dashboard" />
      <Stack.Screen name="give/campaigns" />
      <Stack.Screen name="give/donors" />
      <Stack.Screen name="give/history" />
      <Stack.Screen name="give/my-history" />
      <Stack.Screen name="give/fund-management" />
      <Stack.Screen name="give/tax-receipts" />
      <Stack.Screen name="give/give-settings" />
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
      <Stack.Screen name="kaytv/my-channel" />
      <Stack.Screen name="kaytv/analytics" />
      <Stack.Screen name="kaytv/manage-videos" />
      <Stack.Screen name="kaytv/explore" />
      <Stack.Screen name="kaytv/library" />
      <Stack.Screen name="kaytv/sermons" />
      <Stack.Screen name="kaytv/settings" />
      <Stack.Screen name="kaytv/help" />
      {/* KayStudios */}
      <Stack.Screen name="kaystudios/index" />
      <Stack.Screen name="kaystudios/channel" />
      <Stack.Screen name="kaystudios/manage-channel" />
      <Stack.Screen name="kaystudios/detail" />
      <Stack.Screen name="kaystudios/search" />
      <Stack.Screen name="kaystudios/experience" />
      <Stack.Screen name="kaystudios/explore" />
      <Stack.Screen name="kaystudios/library" />
      <Stack.Screen name="kaystudios/create" />
      <Stack.Screen name="kaystudios/analytics" />
      <Stack.Screen name="kaystudios/reviews" />
      <Stack.Screen name="kaystudios/settings" />
      <Stack.Screen name="kaystudios/community-courses" />
      <Stack.Screen name="kaystudios/community-learn" />
      <Stack.Screen name="kaystudios/community-games" />
      <Stack.Screen name="kaystudios/community-kids" />
      <Stack.Screen name="kaystudios/help" />
      {/* Pulse */}
      <Stack.Screen name="pulse/index" />
      {/* Profile */}
      <Stack.Screen name="profile/index" />
      {/* Members */}
      <Stack.Screen name="members/index" />
      <Stack.Screen name="members/households" />
      <Stack.Screen name="members/visitors" />
      <Stack.Screen name="members/import-export" />
      <Stack.Screen name="members/role-definitions" />
      <Stack.Screen name="members/attendance-policies" />
      <Stack.Screen name="members/privacy-settings" />
      {/* Outreach */}
      <Stack.Screen name="outreach/index" />
      <Stack.Screen name="outreach/campaigns" />
      <Stack.Screen name="outreach/events" />
      <Stack.Screen name="outreach/follow-up" />
      <Stack.Screen name="outreach/source-tracking" />
      <Stack.Screen name="outreach/invite" />
      {/* Network */}
      <Stack.Screen name="network/index" />
      <Stack.Screen name="network/moderation" />
      <Stack.Screen name="network/weekly-prompt" />
      {/* Store (Personal) */}
      <Stack.Screen name="store/orders" />
      <Stack.Screen name="store/customers" />
      <Stack.Screen name="store/analytics" />
      <Stack.Screen name="store/subscriptions" />
      <Stack.Screen name="store/coupons" />
      <Stack.Screen name="store/settings" />
      <Stack.Screen name="store/help" />
      {/* Deals */}
      <Stack.Screen name="deals/index" />
      <Stack.Screen name="deals/contact" />
      <Stack.Screen name="deals/customize-stages" />
      <Stack.Screen name="deals/templates" />
      {/* Hub */}
      <Stack.Screen name="hub/index" />
      <Stack.Screen name="hub/newsletter-compose" />
      <Stack.Screen name="hub/community" />
      <Stack.Screen name="hub/dept-detail" />
      <Stack.Screen name="hub/group-detail" />
      <Stack.Screen name="hub/announcement-compose" />
      <Stack.Screen name="hub/care-request" />
      <Stack.Screen name="hub/services" />
      <Stack.Screen name="hub/groups" />
      <Stack.Screen name="hub/volunteers" />
      <Stack.Screen name="hub/care-requests" />
      <Stack.Screen name="hub/check-in" />
      <Stack.Screen name="hub/education" />
      <Stack.Screen name="hub/edu-announcement" />
      <Stack.Screen name="hub/campus" />
      <Stack.Screen name="hub/sports" />
      <Stack.Screen name="hub/my-page" />
      <Stack.Screen name="hub/subscribers" />
      <Stack.Screen name="hub/earnings" />
      <Stack.Screen name="hub/creator-tools" />
      <Stack.Screen name="hub/settings" />
      <Stack.Screen name="hub/help" />
      <Stack.Screen name="hub/new-followers" />
      {/* StatKeeper */}
      <Stack.Screen
        name="statkeeper/index"
        options={{ headerShown: false, animation: 'none', gestureEnabled: false, fullScreenGestureEnabled: false } as any}
      />
      {/* KayPay */}
      <Stack.Screen name="kaypay/index" />
      <Stack.Screen name="kaypay/wallet" />
      <Stack.Screen name="kaypay/earnings" />
      <Stack.Screen name="kaypay/company-finances" />
      <Stack.Screen name="kaypay/institutional-finances" />
      <Stack.Screen name="kaypay/giving" />
      <Stack.Screen name="kaypay/program-finances" />
      <Stack.Screen name="kaypay/card" />
      <Stack.Screen name="kaypay/pay" />
      <Stack.Screen name="kaypay/invest" />
      <Stack.Screen name="kaypay/invoices" />
      <Stack.Screen name="kaypay/tax" />
      <Stack.Screen name="kaypay/savings-goals" />
      <Stack.Screen name="kaypay/transactions" />
      <Stack.Screen name="kaypay/settings" />
      <Stack.Screen name="kaypay/church-finances" />
      <Stack.Screen name="kaypay/budget" />
      <Stack.Screen name="kaypay/payroll" />
      {/* KayPay — Personal sub-screens */}
      <Stack.Screen name="kaypay/personal-earnings" />
      <Stack.Screen name="kaypay/personal-activity" />
      <Stack.Screen name="kaypay/personal-card" />
      <Stack.Screen name="kaypay/personal-tax" />
      <Stack.Screen name="kaypay/personal-linked-banks" />
      <Stack.Screen name="kaypay/personal-invoices" />
      <Stack.Screen name="kaypay/personal-savings" />
      <Stack.Screen name="kaypay/help" />
      {/* Workforce */}
      <Stack.Screen name="workforce/index" />
      <Stack.Screen name="workforce/directory" />
      <Stack.Screen name="workforce/departments" />
      <Stack.Screen name="workforce/hiring" />
      <Stack.Screen name="workforce/performance" />
      <Stack.Screen name="workforce/contact" />
      <Stack.Screen name="workforce/settings" />
      <Stack.Screen name="workforce/help" />
      {/* Booster */}
      <Stack.Screen name="booster/index" />
      <Stack.Screen name="booster/dashboard" />
      <Stack.Screen name="booster/nil" />
      <Stack.Screen name="booster/campaigns" />
      <Stack.Screen name="booster/events" />
      <Stack.Screen name="booster/my-nil" />
      <Stack.Screen name="booster/shop" />
      {/* Admissions */}
      <Stack.Screen name="admissions/index" />
      <Stack.Screen name="admissions/pipeline" />
      <Stack.Screen name="admissions/applications" />
      <Stack.Screen name="admissions/campaigns" />
      <Stack.Screen name="admissions/analytics" />
      <Stack.Screen name="admissions/my-application" />
      <Stack.Screen name="admissions/financial-aid" />
      {/* Business Mode Row 2 */}
      <Stack.Screen name="hub/business" />
      <Stack.Screen name="team/index" />
      <Stack.Screen name="inquiries/index" />
      <Stack.Screen name="inquiries/pipeline" />
      <Stack.Screen name="inquiries/leads" />
      <Stack.Screen name="inquiries/contacts" />
      <Stack.Screen name="inquiries/analytics" />
      <Stack.Screen name="inquiries/support" />
      <Stack.Screen name="inquiries/settings" />
      <Stack.Screen name="inquiries/help" />
      <Stack.Screen name="business-store/index" />
      <Stack.Screen name="business-store/store" />
      <Stack.Screen name="business-store/orders" />
      <Stack.Screen name="business-store/subscriptions" />
      <Stack.Screen name="business-store/customers" />
      <Stack.Screen name="business-store/analytics" />
      <Stack.Screen name="business-store/purchases" />
      <Stack.Screen name="business-store/settings" />
      <Stack.Screen name="business-store/help" />
      {/* Portfolio */}
      <Stack.Screen name="portfolio/index" />
      <Stack.Screen name="portfolio/press" />
      <Stack.Screen name="portfolio/testimonials" />
      <Stack.Screen name="portfolio/archive" />
      <Stack.Screen name="portfolio/credentials" />
      <Stack.Screen name="portfolio/settings" />
      <Stack.Screen name="portfolio/help" />
      <Stack.Screen name="personal-inquiries/settings" />
      <Stack.Screen name="personal-inquiries/help" />
      <Stack.Screen name="personal-inquiries/archive" options={{ headerShown: false }} />
      {/* Settings */}
      <Stack.Screen name="settings/index" />
      <Stack.Screen name="settings/profile" />
      <Stack.Screen name="settings/security" />
      <Stack.Screen name="settings/notifications" />
      <Stack.Screen name="settings/privacy" />
      <Stack.Screen name="settings/kpay" />
      <Stack.Screen name="settings/appearance" />
      <Stack.Screen name="settings/language" />
      <Stack.Screen name="settings/help" />
      <Stack.Screen name="settings/about" />
      <Stack.Screen name="settings/brand-profile" />
      <Stack.Screen name="settings/members" />
      <Stack.Screen name="settings/customization" />
      <Stack.Screen name="settings/permissions" />
      <Stack.Screen name="settings/billing" />
      <Stack.Screen name="settings/data-export" />
      <Stack.Screen name="settings/integrations" />
      <Stack.Screen name="settings/danger-zone" />
    </Stack>
  );
}
