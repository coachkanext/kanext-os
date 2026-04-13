/**
 * Follower/Subscriber Calendar screen for Personal Agenda tile.
 * Calendar view with sticky week strip + day-grouped scrolling events.
 * K icon opens follower sidebar (Events / Book a Session).
 * Monochrome design system. No blue. No accent.
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { useDemoRole } from '@/utils/demo-role-store';
import { RolePill } from '@/components/ui/role-pill';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;
const WEEK_STRIP_H = 82;

// ── Types ─────────────────────────────────────────────────────────────────────

type EventType = 'live' | 'virtual' | 'inperson';

type PublicEvent = {
  id: string;
  type: EventType;
  title: string;
  dateDisplay: string;  // 'Wed Apr 15'
  dayKey: string;       // 'YYYY-MM-DD'
  time: string;
  location: string;
};

type DayGroup = {
  header: string;   // 'WED APR 15'
  dayKey: string;
  events: PublicEvent[];
};

// ── Mock data ─────────────────────────────────────────────────────────────────

const PUBLIC_EVENTS: PublicEvent[] = [
  {
    id: '1',
    type: 'live',
    title: 'Monthly Creator Q&A Live',
    dateDisplay: 'Wed Apr 15',
    dayKey: '2026-04-15',
    time: '7:00 PM',
    location: 'Virtual – KTV Live',
  },
  {
    id: '2',
    type: 'virtual',
    title: 'Content Strategy Workshop',
    dateDisplay: 'Fri Apr 17',
    dayKey: '2026-04-17',
    time: '2:00 PM',
    location: 'Zoom',
  },
  {
    id: '3',
    type: 'inperson',
    title: 'Creator Meetup – LA',
    dateDisplay: 'Sun Apr 19',
    dayKey: '2026-04-19',
    time: '6:30 PM',
    location: 'Studio 4, Los Angeles',
  },
  {
    id: '4',
    type: 'live',
    title: 'Product Launch Livestream',
    dateDisplay: 'Thu Apr 23',
    dayKey: '2026-04-23',
    time: '8:00 PM',
    location: 'Virtual – KTV Live',
  },
  {
    id: '5',
    type: 'virtual',
    title: 'Inner Circle Masterclass',
    dateDisplay: 'Tue Apr 29',
    dayKey: '2026-04-29',
    time: '5:00 PM',
    location: 'Private Zoom (Members Only)',
  },
];

// ── Icon mapping ──────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<EventType, string> = {
  live:     'video.fill',
  virtual:  'globe',
  inperson: 'mappin.and.ellipse',
};

// ── Week strip data (Mon Apr 13 = today, through Sun Apr 19) ─────────────────

const WEEK_DAYS = [
  { key: '2026-04-13', abbr: 'MON', num: '13', isToday: true  },
  { key: '2026-04-14', abbr: 'TUE', num: '14', isToday: false },
  { key: '2026-04-15', abbr: 'WED', num: '15', isToday: false },
  { key: '2026-04-16', abbr: 'THU', num: '16', isToday: false },
  { key: '2026-04-17', abbr: 'FRI', num: '17', isToday: false },
  { key: '2026-04-18', abbr: 'SAT', num: '18', isToday: false },
  { key: '2026-04-19', abbr: 'SUN', num: '19', isToday: false },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildDayGroups(events: PublicEvent[]): DayGroup[] {
  const map = new Map<string, DayGroup>();
  for (const ev of events) {
    if (!map.has(ev.dayKey)) {
      map.set(ev.dayKey, {
        header: ev.dateDisplay.toUpperCase(),
        dayKey: ev.dayKey,
        events: [],
      });
    }
    map.get(ev.dayKey)!.events.push(ev);
  }
  return Array.from(map.values()).sort((a, b) => a.dayKey.localeCompare(b.dayKey));
}

function dayHasEvents(dayKey: string): boolean {
  return PUBLIC_EVENTS.some(ev => ev.dayKey === dayKey);
}

// ── Event card ────────────────────────────────────────────────────────────────

function EventCard({
  event,
  isRsvpd,
  onToggleRsvp,
  C,
  s,
}: {
  event: PublicEvent;
  isRsvpd: boolean;
  onToggleRsvp: (id: string) => void;
  C: ComponentColors;
  s: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={[s.eventCard, { backgroundColor: C.surface }]}>
      {/* Left: icon circle */}
      <View style={[s.iconCircle, { backgroundColor: C.separator }]}>
        <IconSymbol name={TYPE_ICONS[event.type] as any} size={16} color={C.label} />
      </View>

      {/* Center: event info */}
      <View style={s.eventInfo}>
        <Text style={[s.eventTitle, { color: C.label }]} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={[s.eventMeta, { color: C.secondary }]} numberOfLines={1}>
          {event.dateDisplay}  ·  {event.time}
        </Text>
        <Text style={[s.eventLocation, { color: C.secondary }]} numberOfLines={1}>
          {event.location}
        </Text>
      </View>

      {/* Right: RSVP button */}
      <Pressable
        style={[
          s.rsvpBtn,
          isRsvpd
            ? { backgroundColor: C.activePill }
            : { borderWidth: 1, borderColor: C.separator },
        ]}
        onPress={() => {
          Haptics.selectionAsync();
          onToggleRsvp(event.id);
        }}
        hitSlop={6}
      >
        <Text style={[s.rsvpText, { color: isRsvpd ? C.activePillText : C.label }]}>
          {isRsvpd ? 'Going' : 'RSVP'}
        </Text>
      </Pressable>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function FollowerEventsScreen() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole] = useDemoRole('personal:agenda');
  const [rsvpIds, setRsvpIds] = useState<Set<string>>(new Set());
  const [selectedDayKey, setSelectedDayKey] = useState('2026-04-13');

  const scrollRef = useRef<ScrollView>(null);
  const dayOffsets = useRef<Map<string, number>>(new Map());

  useFocusEffect(useCallback(() => {
    resetFooter();
  }, []));

  const dayGroups = useMemo(() => buildDayGroups(PUBLIC_EVENTS), []);

  const handleDayPress = useCallback((dayKey: string) => {
    Haptics.selectionAsync();
    setSelectedDayKey(dayKey);
    const offset = dayOffsets.current.get(dayKey);
    if (offset !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: offset, animated: true });
    }
  }, []);

  const handleToggleRsvp = useCallback((id: string) => {
    setRsvpIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const weekStripTop = insets.top + TOP_BAR_H;

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>

      {/* ── Top bar (absolute, fades on scroll) ──────────────────────────────── */}
      <Animated.View
        style={[
          s.topBarOuter,
          {
            paddingTop: insets.top,
            backgroundColor: C.bg,
            borderBottomColor: C.separator,
            opacity,
          },
        ]}
      >
        <View style={s.topBar}>
          {/* K menu button → opens follower sidebar */}
          <Pressable
            style={s.kBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openSidePanel();
            }}
            hitSlop={8}
          >
            <KMenuButton />
          </Pressable>

          {/* Calendar pill */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Calendar</Text>
            </View>
          </View>

          {/* Role pill */}
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={false} />
          </View>
        </View>
      </Animated.View>

      {/* ── Week strip (sticky, sits below top bar) ───────────────────────────── */}
      <View
        style={[
          s.weekStrip,
          {
            top: weekStripTop,
            borderBottomColor: C.separator,
            backgroundColor: C.bg,
          },
        ]}
      >
        <View style={s.weekDayRow}>
          {WEEK_DAYS.map(day => {
            const selected = selectedDayKey === day.key;
            const hasDot = dayHasEvents(day.key);
            return (
              <Pressable
                key={day.key}
                style={s.weekDayCell}
                onPress={() => handleDayPress(day.key)}
              >
                <Text style={[s.weekDayAbbr, { color: selected ? C.label : C.secondary }]}>
                  {day.abbr}
                </Text>
                <View style={[s.weekDayNum, selected && { backgroundColor: C.label }]}>
                  <Text style={[s.weekDayNumText, { color: selected ? C.bg : C.label }]}>
                    {day.num}
                  </Text>
                </View>
                <View style={s.weekDotsRow}>
                  {hasDot
                    ? <View style={[s.weekDot, { backgroundColor: selected ? C.bg : C.label }]} />
                    : <View style={s.weekDotEmpty} />
                  }
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ── Scrolling event list ──────────────────────────────────────────────── */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.scrollContent,
          {
            paddingTop: weekStripTop + WEEK_STRIP_H + 8,
            paddingBottom: insets.bottom + 32,
          },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {dayGroups.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={[s.emptyTitle, { color: C.label }]}>No upcoming events</Text>
            <Text style={[s.emptySub, { color: C.secondary }]}>
              Check back soon for live streams, appearances, and more.
            </Text>
          </View>
        ) : (
          dayGroups.map(group => (
            <View
              key={group.dayKey}
              onLayout={e => {
                dayOffsets.current.set(
                  group.dayKey,
                  e.nativeEvent.layout.y,
                );
              }}
            >
              {/* Day header */}
              <View style={[s.dayHeader, { borderBottomColor: C.separator }]}>
                <Text style={[s.dayHeaderText, { color: C.secondary }]}>
                  {group.header}
                </Text>
              </View>

              {/* Event cards */}
              {group.events.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  isRsvpd={rsvpIds.has(event.id)}
                  onToggleRsvp={handleToggleRsvp}
                  C={C}
                  s={s}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>

    </View>
  );
}

// ── makeStyles ────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    screen: { flex: 1 },

    // Top bar
    topBarOuter: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar: {
      height: TOP_BAR_H,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
    },
    kBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    titlePill: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 14,
      borderWidth: 1,
    },
    titleText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },

    // Week strip
    weekStrip: {
      position: 'absolute',
      left: 0,
      right: 0,
      zIndex: 10,
      height: WEEK_STRIP_H,
      borderBottomWidth: StyleSheet.hairlineWidth,
      justifyContent: 'center',
    },
    weekDayRow: {
      flexDirection: 'row',
      paddingHorizontal: 4,
    },
    weekDayCell: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
    },
    weekDayAbbr: {
      fontSize: 11,
      fontWeight: '600',
      marginBottom: 4,
      letterSpacing: 0.2,
    },
    weekDayNum: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    weekDayNumText: {
      fontSize: 15,
      fontWeight: '700',
    },
    weekDotsRow: {
      flexDirection: 'row',
      gap: 3,
      marginTop: 4,
      height: 6,
      alignItems: 'center',
    },
    weekDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
    },
    weekDotEmpty: {
      width: 5,
      height: 5,
    },

    // Scroll
    scrollContent: {
      paddingHorizontal: 0,
    },

    // Day header
    dayHeader: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    dayHeaderText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
    },

    // Event card
    eventCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: 2,
      borderRadius: 12,
      padding: 14,
      gap: 12,
    },
    iconCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    eventInfo: {
      flex: 1,
      gap: 2,
    },
    eventTitle: {
      fontSize: 14,
      fontWeight: '700',
    },
    eventMeta: {
      fontSize: 12,
    },
    eventLocation: {
      fontSize: 12,
    },

    // RSVP button
    rsvpBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      flexShrink: 0,
    },
    rsvpText: {
      fontSize: 12,
      fontWeight: '600',
    },

    // Empty state
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600',
    },
    emptySub: {
      fontSize: 14,
      textAlign: 'center',
      marginTop: 8,
      paddingHorizontal: 32,
      lineHeight: 20,
    },
  });
}
