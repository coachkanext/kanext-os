/**
 * Outreach — Events (Pastor only).
 * Member redirects to outreach/index.
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Constants ──────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;
const GAIN    = '#5A8A6E';

// ── Mock data ─────────────────────────────────────────────────────────────────

const UPCOMING_EVENTS = [
  {
    id: 'ev1',
    name: 'Block Party @ East Side',
    date: 'Apr 19',
    location: '1200 MLK Blvd',
    volunteers: '14 signed up',
    expected: '200+ attendees',
    campaign: 'Easter Community Outreach',
  },
  {
    id: 'ev2',
    name: 'Community Food Bank Drive',
    date: 'Apr 26',
    location: 'ICCLA Parking Lot',
    volunteers: '8 signed up',
    expected: '150+ families',
    campaign: 'Neighborhood Door Canvass',
  },
  {
    id: 'ev3',
    name: 'Back-to-School Drive',
    date: 'Aug 9',
    location: 'ICCLA Main Hall',
    volunteers: '0 signed up',
    expected: '300 kids',
    campaign: 'Back-to-School 2026',
  },
];

const PAST_EVENTS = [
  {
    id: 'pev1',
    name: 'Easter Sunday Outreach',
    date: 'Apr 5',
    location: 'Church Grounds',
    volunteers: '22 participated',
    expected: '500+ attended',
    campaign: 'Easter Community Outreach',
    status: 'Completed',
  },
  {
    id: 'pev2',
    name: 'Spring Neighborhood Walk',
    date: 'Mar 29',
    location: 'Westside District',
    volunteers: '11 participated',
    expected: '80 contacts made',
    campaign: 'Social Media Spring Push',
    status: 'Completed',
  },
];

type UpcomingEvent  = typeof UPCOMING_EVENTS[0];
type PastEvent      = typeof PAST_EVENTS[0];

// ── Component ─────────────────────────────────────────────────────────────────

export default function OutreachEventsScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, cycleRole, roleCycles] = useDemoRole('community:outreach');
  const isPastor = role === roleCycles[0];

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) {
      router.replace('/(tabs)/(main)/outreach' as any);
    }
  }, [isPastor, router]));

  const topBarH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);

  if (!isPastor) return null;

  const renderUpcomingCard = (evt: UpcomingEvent) => (
    <View key={evt.id} style={[s.eventCard, { backgroundColor: C.surface }]}>
      {/* Name */}
      <Text style={[s.eventName, { color: C.label }]}>{evt.name}</Text>

      {/* Meta rows */}
      <View style={s.metaBlock}>
        <View style={s.metaRow}>
          <IconSymbol name="calendar" size={14} color={C.secondary} />
          <Text style={[s.metaText, { color: C.secondary }]}>{evt.date}</Text>
        </View>
        <View style={s.metaRow}>
          <IconSymbol name="mappin" size={14} color={C.secondary} />
          <Text style={[s.metaText, { color: C.secondary }]} numberOfLines={1}>{evt.location}</Text>
        </View>
        <View style={s.metaRow}>
          <IconSymbol name="person.2.fill" size={14} color={C.secondary} />
          <Text style={[s.metaText, { color: C.secondary }]}>{evt.volunteers}</Text>
        </View>
        <View style={s.metaRow}>
          <IconSymbol name="person.fill" size={14} color={C.secondary} />
          <Text style={[s.metaText, { color: C.secondary }]}>{evt.expected}</Text>
        </View>
        <Text style={[s.campaignLink, { color: C.secondary }]}>Campaign: {evt.campaign}</Text>
      </View>

      {/* Action buttons */}
      <View style={[s.actionRow, { borderTopColor: C.separator }]}>
        <Pressable
          style={({ pressed }) => [
            s.actionBtn,
            s.actionBtnOutline,
            { borderColor: C.separator },
            pressed && { opacity: 0.75 },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Manage Event', `Managing: ${evt.name}`, [
              { text: 'Cancel' },
              { text: 'Open' },
            ]);
          }}
        >
          <Text style={[s.actionBtnText, { color: C.label }]}>Manage Event</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            s.actionBtn,
            s.actionBtnOutline,
            { borderColor: C.separator },
            pressed && { opacity: 0.75 },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('View Report', `Report for: ${evt.name}`, [{ text: 'OK' }]);
          }}
        >
          <Text style={[s.actionBtnText, { color: C.label }]}>View Report</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderPastCard = (evt: PastEvent) => (
    <View key={evt.id} style={[s.eventCard, s.pastCard, { backgroundColor: C.surface }]}>
      {/* Header with Completed badge */}
      <View style={s.pastHeader}>
        <Text style={[s.eventName, { color: C.secondary }]}>{evt.name}</Text>
        <View style={[s.completedBadge, { backgroundColor: C.separator }]}>
          <Text style={[s.completedBadgeText, { color: C.secondary }]}>Completed</Text>
        </View>
      </View>

      {/* Meta rows */}
      <View style={s.metaBlock}>
        <View style={s.metaRow}>
          <IconSymbol name="calendar" size={13} color={C.secondary} />
          <Text style={[s.metaText, { color: C.secondary, fontSize: 12 }]}>{evt.date}</Text>
        </View>
        <View style={s.metaRow}>
          <IconSymbol name="mappin" size={13} color={C.secondary} />
          <Text style={[s.metaText, { color: C.secondary, fontSize: 12 }]}>{evt.location}</Text>
        </View>
        <View style={s.metaRow}>
          <IconSymbol name="person.2.fill" size={13} color={C.secondary} />
          <Text style={[s.metaText, { color: C.secondary, fontSize: 12 }]}>{evt.volunteers}</Text>
        </View>
        <View style={s.metaRow}>
          <IconSymbol name="person.fill" size={13} color={C.secondary} />
          <Text style={[s.metaText, { color: C.secondary, fontSize: 12 }]}>{evt.expected}</Text>
        </View>
        <Text style={[s.campaignLink, { color: C.secondary, fontSize: 11 }]}>Campaign: {evt.campaign}</Text>
      </View>

      {/* View Report only */}
      <View style={[s.actionRow, { borderTopColor: C.separator }]}>
        <Pressable
          style={({ pressed }) => [
            s.actionBtn,
            s.actionBtnOutline,
            { borderColor: C.separator },
            pressed && { opacity: 0.75 },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('View Report', `Final report for: ${evt.name}`, [{ text: 'OK' }]);
          }}
        >
          <Text style={[s.actionBtnText, { color: C.secondary }]}>View Report</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: topBarH + 12,
          paddingHorizontal: 16,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* Upcoming Events */}
        <Text style={[s.sectionTitle, { color: C.secondary }]}>Upcoming Events</Text>
        {UPCOMING_EVENTS.map(renderUpcomingCard)}

        {/* Past Events */}
        <Text style={[s.sectionTitle, { color: C.secondary, marginTop: 24 }]}>Past Events</Text>
        {PAST_EVENTS.map(renderPastCard)}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Top bar — position absolute */}
      <Animated.View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg, opacity }]}>
        <View style={s.topBar}>
          <View style={s.topBarSide}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                openSidePanel();
              }}
              hitSlop={12}
            >
              <KMenuButton />
            </Pressable>
          </View>
          <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={[s.titlePillText, { color: C.label }]}>Events</Text>
          </View>
          <View style={[s.topBarSide, { alignItems: 'flex-end' }]}>
            <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={isPastor} />
          </View>
        </View>
      </Animated.View>

      {/* FAB — Create Event */}
      <Pressable
        style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 70 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Alert.alert('Create Event', 'Open event creation form?', [
            { text: 'Cancel' },
            { text: 'Create' },
          ]);
        }}
      >
        <IconSymbol name="plus" size={22} color={C.bg} />
      </Pressable>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:     { flex: 1 },
  topBarWrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar:     { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide: { width: 80, justifyContent: 'center' },
  titlePill: {
    flex: 1,
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  titlePillText: { fontSize: 13, fontWeight: '700' },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  eventCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  pastCard: { opacity: 0.8 },
  pastHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  completedBadge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, flexShrink: 0 },
  completedBadgeText: { fontSize: 11, fontWeight: '600' },

  eventName: { fontSize: 16, fontWeight: '700', marginBottom: 12, flex: 1 },

  metaBlock: { gap: 7, marginBottom: 14 },
  metaRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText:  { fontSize: 13, flex: 1 },
  campaignLink: { fontSize: 12, marginTop: 4 },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionBtnOutline: { borderWidth: 1 },
  actionBtnText:    { fontSize: 13, fontWeight: '600' },

  fab: {
    position: 'absolute',
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
});
