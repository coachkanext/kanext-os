/**
 * Church Dashboard — 2819 Church
 *
 * 5-block vertical scroll (single scroll, no structural invention):
 *   Block 1 — Hero Video (LIVE | NEXT | RECAP | SERMON)
 *   Block 2 — Next Event Card (campus-scoped)
 *   Block 3 — Engagement Row (Give · Events · Serve)
 *   Block 4 — Ministry Snapshot (role-centered)
 *   Block 5 — Domain Grid (2×3, routes to existing tabs)
 *
 * RBAC: Public sermon visible to V0+. Internal media respects campus scope.
 * Multi-campus: Dashboard always reflects active campus only.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ImpactFeedbackStyle } from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';
import {
  CHURCH_HERO,
  CHURCH_SERVICES,
  CHURCH_CALENDAR_EVENTS,
} from '@/data/mock-church-home';
import { type ChurchRoleLens } from '@/utils/church-rbac';
import { ChurchGiveSheet } from '@/components/commerce/church-give-sheet';
import { ChurchEventDetailSheet } from '@/components/church/church-event-detail-sheet';
import { getEnrichedEvent, fromCalendarEvent, type ChurchEvent } from '@/data/mock-church-events';

const ACCENT = MODE_ACCENT.church;

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accent: string;
  role?: ChurchRoleLens;
  onSwitchTab?: (index: number) => void;
}

// =============================================================================
// MOCK — Ministry Snapshot (role-centered demo: Children's Teacher @ 2819)
// =============================================================================

const MINISTRY_SNAPSHOT = {
  ministryName: 'Formation Kids',
  role: "Children's Teacher",
  nextClassDate: 'Sunday, Mar 2',
  nextClassTime: '9:30 AM',
  room: "Children's Wing",
  volunteerCount: 24,
  childrenCount: 38,
  campus: '2819 Church',
};

// =============================================================================
// DOMAIN GRID ITEMS
// =============================================================================

interface DomainItem {
  id: string;
  label: string;
  icon: IconSymbolName;
  color: string;
}

const DOMAIN_ITEMS: DomainItem[] = [
  { id: 'services', label: 'Services', icon: 'play.circle.fill', color: '#1A1714' },
  { id: 'ministries', label: 'Ministries', icon: 'heart.fill', color: '#B85C5C' },
  { id: 'community', label: 'Community', icon: 'person.3.fill', color: '#5A8A6E' },
  { id: 'teaching', label: 'Teaching', icon: 'book.fill', color: '#B8943E' },
  { id: 'prayer', label: 'Prayer', icon: 'hands.sparkles.fill', color: '#1A1714' },
  { id: 'care', label: 'Care', icon: 'heart.circle.fill', color: '#1A1714' },
];

// =============================================================================
// HELPERS
// =============================================================================

function formatEventDate(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function formatEventTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ChurchDashboardV2({ colors, accent, role = 'C8', onSwitchTab }: Props) {
  const [giveVisible, setGiveVisible] = useState(false);
  const [eventSheetVisible, setEventSheetVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);

  // ── Hero badge logic ──
  const liveService = CHURCH_SERVICES.find((s) => s.isLive);
  const nextService = CHURCH_SERVICES.find((s) => s.status === 'upcoming');
  const lastService = [...CHURCH_SERVICES].reverse().find((s) => s.status === 'past');

  let heroBadge: string;
  let heroBadgeColor: string;
  let heroTitle: string;
  let heroSubtitle: string;

  if (liveService) {
    heroBadge = 'LIVE';
    heroBadgeColor = '#B85C5C';
    heroTitle = liveService.title;
    heroSubtitle = `${liveService.speaker} · LIVE NOW`;
  } else if (nextService) {
    heroBadge = 'NEXT';
    heroBadgeColor = accent;
    heroTitle = nextService.topic || nextService.title;
    heroSubtitle = `${nextService.speaker} · ${nextService.date} · ${nextService.time}`;
  } else if (lastService) {
    heroBadge = 'RECAP';
    heroBadgeColor = '#9C9790';
    heroTitle = lastService.topic || lastService.title;
    heroSubtitle = `${lastService.speaker} · ${lastService.date}`;
  } else {
    heroBadge = 'SERMON';
    heroBadgeColor = accent;
    heroTitle = CHURCH_HERO.title;
    heroSubtitle = CHURCH_HERO.subtitle;
  }

  const seriesName = CHURCH_HERO.seriesName;

  // ── Next event (campus-scoped) ──
  const now = new Date();
  const nextEvent = CHURCH_CALENDAR_EVENTS.find((e) => e.startDatetime > now) || CHURCH_CALENDAR_EVENTS[0];

  return (
    <>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ════════════════════════════════════════════════════════════════════
            BLOCK 1 — HERO VIDEO
            ════════════════════════════════════════════════════════════════════ */}
        <Pressable
          style={({ pressed }) => [s.heroContainer, pressed && { opacity: 0.9 }]}
          onPress={() => Haptics.impactAsync(ImpactFeedbackStyle.Light)}
        >
          <LinearGradient colors={['#0B0F14', '#111827', '#0B0F14']} style={s.heroGradient}>
            <View style={s.playButton}>
              <IconSymbol name="play.circle.fill" size={56} color="rgba(255,255,255,0.7)" />
            </View>

            <View style={[s.heroBadge, { backgroundColor: heroBadgeColor }]}>
              {heroBadge === 'LIVE' && <View style={s.liveDot} />}
              <ThemedText style={s.heroBadgeText}>{heroBadge}</ThemedText>
            </View>

            <View style={s.heroTextBlock}>
              {seriesName && (
                <ThemedText style={[s.seriesLabel, { color: accent }]}>{seriesName}</ThemedText>
              )}
              <ThemedText style={s.heroTitle}>{heroTitle}</ThemedText>
              <ThemedText style={s.heroSubtitle}>{heroSubtitle}</ThemedText>
            </View>
          </LinearGradient>
        </Pressable>

        {/* ════════════════════════════════════════════════════════════════════
            BLOCK 2 — NEXT EVENT CARD
            ════════════════════════════════════════════════════════════════════ */}
        {nextEvent && (
          <Pressable
            style={({ pressed }) => [
              s.nextEventCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => {
              Haptics.impactAsync(ImpactFeedbackStyle.Light);
              const enriched = getEnrichedEvent(nextEvent.id) || fromCalendarEvent(nextEvent);
              setSelectedEvent(enriched);
              setEventSheetVisible(true);
            }}
          >
            <View style={s.nextEventHeader}>
              <ThemedText style={[s.nextEventLabel, { color: accent }]}>NEXT EVENT</ThemedText>
              <View style={[s.campusBadge, { borderColor: accent }]}>
                <ThemedText style={[s.campusBadgeText, { color: accent }]}>2819 Church</ThemedText>
              </View>
            </View>
            <ThemedText style={[s.nextEventTitle, { color: colors.text }]}>
              {nextEvent.title}
            </ThemedText>
            <View style={s.nextEventMetaRow}>
              <IconSymbol name="calendar" size={12} color={colors.textSecondary} />
              <ThemedText style={[s.nextEventMetaText, { color: colors.textSecondary }]}>
                {formatEventDate(nextEvent.startDatetime)}
              </ThemedText>
            </View>
            <View style={s.nextEventMetaRow}>
              <IconSymbol name="clock" size={12} color={colors.textSecondary} />
              <ThemedText style={[s.nextEventMetaText, { color: colors.textSecondary }]}>
                {formatEventTime(nextEvent.startDatetime)}
              </ThemedText>
            </View>
            {nextEvent.location && (
              <View style={s.nextEventMetaRow}>
                <IconSymbol name="mappin.and.ellipse" size={12} color={colors.textSecondary} />
                <ThemedText style={[s.nextEventMetaText, { color: colors.textSecondary }]}>
                  {nextEvent.location}
                </ThemedText>
              </View>
            )}
            <View style={s.nextEventArrow}>
              <IconSymbol name="chevron.right" size={14} color={colors.textSecondary} />
            </View>
          </Pressable>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            BLOCK 3 — ENGAGEMENT ROW (Give · Events · Serve)
            ════════════════════════════════════════════════════════════════════ */}
        <View style={s.engagementRow}>
          <Pressable
            style={({ pressed }) => [s.engagementCard, pressed && { opacity: 0.7 }]}
            onPress={() => {
              Haptics.impactAsync(ImpactFeedbackStyle.Light);
              setGiveVisible(true);
            }}
          >
            <View style={[s.engagementIcon, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
              <IconSymbol name="heart.fill" size={20} color="#B85C5C" />
            </View>
            <ThemedText style={s.engagementLabel}>Give</ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [s.engagementCard, pressed && { opacity: 0.7 }]}
            onPress={() => {
              Haptics.impactAsync(ImpactFeedbackStyle.Light);
              onSwitchTab?.(1);
            }}
          >
            <View style={[s.engagementIcon, { backgroundColor: 'rgba(29,155,240,0.15)' }]}>
              <IconSymbol name="calendar" size={20} color="#1A1714" />
            </View>
            <ThemedText style={s.engagementLabel}>Events</ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [s.engagementCard, pressed && { opacity: 0.7 }]}
            onPress={() => {
              Haptics.impactAsync(ImpactFeedbackStyle.Light);
              onSwitchTab?.(2);
            }}
          >
            <View style={[s.engagementIcon, { backgroundColor: 'rgba(34,197,94,0.15)' }]}>
              <IconSymbol name="hand.raised.fill" size={20} color="#5A8A6E" />
            </View>
            <ThemedText style={s.engagementLabel}>Serve</ThemedText>
          </Pressable>
        </View>

        {/* ════════════════════════════════════════════════════════════════════
            BLOCK 4 — MINISTRY SNAPSHOT (role-centered)
            ════════════════════════════════════════════════════════════════════ */}
        <View style={s.darkCard}>
          <View style={[s.darkCardAccent, { backgroundColor: accent }]} />
          <View style={s.darkCardContent}>
            <View style={s.snapshotHeader}>
              <View style={{ flex: 1 }}>
                <ThemedText style={s.snapshotMinistry}>{MINISTRY_SNAPSHOT.ministryName}</ThemedText>
                <ThemedText style={s.snapshotRole}>
                  {MINISTRY_SNAPSHOT.role} · {MINISTRY_SNAPSHOT.campus}
                </ThemedText>
              </View>
              <View style={[s.snapshotBadge, { borderColor: accent }]}>
                <IconSymbol name="figure.and.child.holdinghands" size={14} color={accent} />
              </View>
            </View>

            <View style={s.snapshotGrid}>
              <View style={s.snapshotItem}>
                <IconSymbol name="calendar" size={14} color="#9C9790" />
                <ThemedText style={s.snapshotItemLabel}>Next Class</ThemedText>
                <ThemedText style={s.snapshotItemValue}>{MINISTRY_SNAPSHOT.nextClassDate}</ThemedText>
                <ThemedText style={s.snapshotItemDetail}>{MINISTRY_SNAPSHOT.nextClassTime}</ThemedText>
              </View>
              <View style={s.snapshotItem}>
                <IconSymbol name="door.left.hand.open" size={14} color="#9C9790" />
                <ThemedText style={s.snapshotItemLabel}>Room</ThemedText>
                <ThemedText style={s.snapshotItemValue}>{MINISTRY_SNAPSHOT.room}</ThemedText>
              </View>
              <View style={s.snapshotItem}>
                <IconSymbol name="person.3.fill" size={14} color="#9C9790" />
                <ThemedText style={s.snapshotItemLabel}>Volunteers</ThemedText>
                <ThemedText style={s.snapshotItemValue}>{MINISTRY_SNAPSHOT.volunteerCount}</ThemedText>
              </View>
              <View style={s.snapshotItem}>
                <IconSymbol name="figure.and.child.holdinghands" size={14} color="#9C9790" />
                <ThemedText style={s.snapshotItemLabel}>Children</ThemedText>
                <ThemedText style={s.snapshotItemValue}>{MINISTRY_SNAPSHOT.childrenCount}</ThemedText>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [s.snapshotAction, pressed && { opacity: 0.7 }]}
              onPress={() => Haptics.impactAsync(ImpactFeedbackStyle.Light)}
            >
              <ThemedText style={[s.snapshotActionText, { color: accent }]}>
                Open in Ministries
              </ThemedText>
              <IconSymbol name="chevron.right" size={12} color={accent} />
            </Pressable>
          </View>
        </View>

        {/* ════════════════════════════════════════════════════════════════════
            BLOCK 5 — DOMAIN GRID (2×3)
            ════════════════════════════════════════════════════════════════════ */}
        <View style={s.domainGrid}>
          {DOMAIN_ITEMS.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [s.domainCard, pressed && { opacity: 0.7 }]}
              onPress={() => Haptics.impactAsync(ImpactFeedbackStyle.Light)}
            >
              <View style={[s.domainIconCircle, { backgroundColor: `${item.color}20` }]}>
                <IconSymbol name={item.icon} size={22} color={item.color} />
              </View>
              <ThemedText style={s.domainLabel}>{item.label}</ThemedText>
            </Pressable>
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── Bottom Sheets ── */}
      <ChurchGiveSheet visible={giveVisible} onClose={() => setGiveVisible(false)} colors={colors as any} />
      <ChurchEventDetailSheet
        visible={eventSheetVisible}
        onClose={() => setEventSheetVisible(false)}
        event={selectedEvent}
        colors={colors}
        accent={accent}
      />
    </>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },

  // Hero
  heroContainer: { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  heroGradient: { aspectRatio: 16 / 9, justifyContent: 'flex-end', alignItems: 'center', padding: 20 },
  playButton: { position: 'absolute', top: '35%' },
  heroBadge: {
    position: 'absolute', top: 14, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  heroBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  heroTextBlock: { width: '100%', alignItems: 'center' },
  seriesLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center', marginBottom: 4 },
  heroSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 12, letterSpacing: 0.2, textAlign: 'center' },

  // Next Event
  nextEventCard: {
    borderRadius: 14, borderWidth: StyleSheet.hairlineWidth,
    padding: 16, marginBottom: 16, position: 'relative',
  },
  nextEventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  nextEventLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  campusBadge: {
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  campusBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  nextEventTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 },
  nextEventMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  nextEventMetaText: { fontSize: 12, letterSpacing: 0.1 },
  nextEventArrow: { position: 'absolute', right: 16, top: '50%' },

  // Engagement Row
  engagementRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  engagementCard: {
    flex: 1, backgroundColor: '#0B0F14', borderRadius: 14,
    padding: 16, alignItems: 'center', gap: 8,
  },
  engagementIcon: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  engagementLabel: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: -0.2 },

  // Dark card (Ministry Snapshot)
  darkCard: { backgroundColor: '#0B0F14', borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  darkCardAccent: { height: 3 },
  darkCardContent: { padding: 16 },

  // Snapshot
  snapshotHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  snapshotMinistry: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: -0.3 },
  snapshotRole: { color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 0.2, marginTop: 2 },
  snapshotBadge: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  snapshotGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  snapshotItem: { width: '50%', paddingVertical: 8, paddingRight: 8 },
  snapshotItemLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 4 },
  snapshotItemValue: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: -0.2, marginTop: 2 },
  snapshotItemDetail: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 1 },
  snapshotAction: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 12, paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#2F3336',
  },
  snapshotActionText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },

  // Domain Grid
  domainGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  domainCard: {
    width: '31%', flexGrow: 1,
    backgroundColor: '#0B0F14', borderRadius: 14,
    padding: 16, alignItems: 'center', gap: 8,
  },
  domainIconCircle: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  domainLabel: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: -0.1 },
});
