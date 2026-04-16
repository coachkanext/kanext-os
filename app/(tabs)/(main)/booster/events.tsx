/**
 * Booster — Events (Coach only)
 * Ticket revenue, sold tickets, event cards with tier breakdown.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol }    from '@/components/ui/icon-symbol';
import { KMenuButton }   from '@/components/ui/k-menu-button';
import { RolePill }      from '@/components/ui/role-pill';
import { GlassView }     from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel }  from '@/utils/global-side-panel';
import { resetFooter }    from '@/utils/global-footer-hide';
import { useDemoRole }    from '@/utils/demo-role-store';
import { TICKET_GAMES, type TicketGame } from '@/data/mock-sports-hub';

const TOP_BAR_H = 54;
const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

type EventEntry = TicketGame & {
  capacity: number;
  sold: number;
  revenue: number;
  isKTV: boolean;
};

const EXTRA_EVENTS: EventEntry[] = [
  {
    gameId: 'senior-night', opponent: 'Senior Night Celebration', date: 'Apr 15, 2026', time: '6:00 PM', venue: 'Laney College',
    types: [
      { label: 'General Admission', price: 10, available: 180 },
      { label: 'Reserved',          price: 20, available: 60  },
      { label: 'VIP Table',         price: 75, available: 8   },
    ],
    capacity: 500, sold: 248, revenue: 4320, isKTV: true,
  },
  {
    gameId: 'alumni-game', opponent: 'Alumni Game',            date: 'May 3, 2026',  time: '2:00 PM', venue: 'Laney College',
    types: [
      { label: 'General Admission', price: 8,  available: 300 },
      { label: 'Student',           price: 0,  available: 200 },
    ],
    capacity: 500, sold: 120, revenue: 960, isKTV: false,
  },
];

function toEntry(g: TicketGame, capacity: number, sold: number, revenue: number, isKTV: boolean): EventEntry {
  return { ...g, capacity, sold, revenue, isKTV };
}

const ALL_EVENTS: EventEntry[] = [
  toEntry(TICKET_GAMES[0], 500, 368, 4520, true),
  toEntry(TICKET_GAMES[1], 650, 274, 3680, false),
  ...EXTRA_EVENTS,
];

export default function EventsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('sports:booster');
  const isCoach = role === roleCycles[0];
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [ktvToggles, setKtvToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ALL_EVENTS.map(e => [e.gameId, e.isKTV]))
  );

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (!isCoach) router.replace('/(tabs)/(main)/booster/my-nil' as any);
  }, [isCoach, router]);

  if (!isCoach) return null;

  const totalRevenue  = ALL_EVENTS.reduce((s, e) => s + e.revenue, 0);
  const totalSold     = ALL_EVENTS.reduce((s, e) => s + e.sold, 0);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* Top Bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable style={s.iconBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Events</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isCoach} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: totalTopH + 16, paddingBottom: insets.bottom + 100 }}
      >

        {/* Summary stats */}
        <View style={[s.row, { gap: 10, paddingHorizontal: 16, marginBottom: 20 }]}>
          {[
            { label: 'Ticket Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}K`, color: GAIN },
            { label: 'Tickets Sold',   value: `${totalSold}`,                          color: C.label },
            { label: 'Events',         value: `${ALL_EVENTS.length}`,                  color: C.label },
          ].map(stat => (
            <GlassView key={stat.label} tier={1} style={[s.statCard, { flex: 1 }]}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: stat.color }}>{stat.value}</Text>
              <Text style={{ fontSize: 10, color: C.secondary, marginTop: 2 }}>{stat.label}</Text>
            </GlassView>
          ))}
        </View>

        {/* Event cards */}
        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          {ALL_EVENTS.map(event => {
            const isOpen = expandedId === event.gameId;
            const pct    = Math.round((event.sold / event.capacity) * 100);
            const ktvOn  = ktvToggles[event.gameId] ?? false;

            return (
              <GlassView key={event.gameId} tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
                {/* Header */}
                <Pressable
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setExpandedId(isOpen ? null : event.gameId); }}
                  style={({ pressed }) => [{ paddingVertical: 14, paddingHorizontal: 14, opacity: pressed ? 0.7 : 1 }]}
                >
                  <View style={[s.row, { marginBottom: 4 }]}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, flex: 1 }} numberOfLines={1}>{event.opponent}</Text>
                    <IconSymbol name={isOpen ? 'chevron.up' : 'chevron.down'} size={13} color={C.secondary} style={{ marginLeft: 8 }} />
                  </View>
                  <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 10 }}>{event.date} · {event.time} · {event.venue}</Text>

                  {/* Attendance progress */}
                  <View style={[s.progressTrack, { backgroundColor: C.separator, marginBottom: 6 }]}>
                    <View style={[s.progressFill, { width: `${pct}%` as any, backgroundColor: pct >= 90 ? CAUTION : GAIN }]} />
                  </View>
                  <View style={[s.row, { justifyContent: 'space-between' }]}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: GAIN }}>{event.sold} sold</Text>
                    <Text style={{ fontSize: 11, color: C.secondary }}>{pct}% of {event.capacity} cap</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: C.label }}>${event.revenue.toLocaleString()}</Text>
                  </View>
                </Pressable>

                {/* Expanded details */}
                {isOpen && (
                  <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
                    {/* Ticket tiers */}
                    <View style={{ paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: C.secondary, marginBottom: 8 }}>TICKET TIERS</Text>
                      {event.types.map((tier, i) => (
                        <View key={tier.label} style={[
                          s.row, { paddingVertical: 9 },
                          i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                        ]}>
                          <Text style={{ fontSize: 13, color: C.label, flex: 1 }}>{tier.label}</Text>
                          <Text style={{ fontSize: 12, color: C.secondary, marginRight: 12 }}>{tier.available} left</Text>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: tier.price === 0 ? C.secondary : C.label }}>
                            {tier.price === 0 ? 'Free' : `$${tier.price}`}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* KTV toggle */}
                    <View style={[s.row, { paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, gap: 10 }]}>
                      <IconSymbol name="tv.fill" size={15} color={C.secondary} />
                      <Text style={{ fontSize: 13, color: C.label, flex: 1 }}>Stream on KayTV</Text>
                      <Pressable
                        onPress={() => {
                          Haptics.selectionAsync();
                          setKtvToggles(prev => ({ ...prev, [event.gameId]: !prev[event.gameId] }));
                        }}
                        style={[s.toggle, { backgroundColor: ktvOn ? C.label : C.separator }]}
                      >
                        <View style={[s.toggleKnob, { alignSelf: ktvOn ? 'flex-end' : 'flex-start', backgroundColor: C.bg }]} />
                      </Pressable>
                    </View>

                    {/* Actions */}
                    <View style={[s.row, { paddingHorizontal: 14, paddingBottom: 14, gap: 10 }]}>
                      <Pressable
                        style={({ pressed }) => [s.actionBtn, { backgroundColor: C.surface, borderColor: C.separator, flex: 1, opacity: pressed ? 0.7 : 1 }]}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Edit Event', `Editing "${event.opponent}" — coming soon`); }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Edit</Text>
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [s.actionBtn, { backgroundColor: C.surface, borderColor: C.separator, flex: 1, opacity: pressed ? 0.7 : 1 }]}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Share Event', `Share link for "${event.opponent}" — coming soon`); }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Share</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </GlassView>
            );
          })}
        </View>

        {/* Create FAB */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Pressable
            style={({ pressed }) => [s.fab, { backgroundColor: C.label, opacity: pressed ? 0.8 : 1 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('New Event', 'Event builder — coming soon'); }}
          >
            <IconSymbol name="plus" size={18} color={C.bg} />
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg, marginLeft: 8 }}>New Event</Text>
          </Pressable>
        </View>

      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:          { flex: 1 },
    topBarOuter:   { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
    iconBtn:       { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
    titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    row:           { flexDirection: 'row', alignItems: 'center' },
    statCard:      { alignItems: 'center', padding: 12, borderRadius: 12 },
    progressTrack: { height: 5, borderRadius: 3, overflow: 'hidden' },
    progressFill:  { height: 5, borderRadius: 3 },
    actionBtn:     { height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 9, borderWidth: StyleSheet.hairlineWidth },
    fab:           { height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
    toggle:        { width: 42, height: 24, borderRadius: 12, padding: 2, justifyContent: 'center' },
    toggleKnob:    { width: 20, height: 20, borderRadius: 10 },
  });
}
