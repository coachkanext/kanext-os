/**
 * Personal Agenda — Creator calendar for Personal mode.
 * Monochrome design system. No blue. No accent.
 * Matches the Athletics Calendar (sports-coach-calendar) pattern exactly.
 */

import React, { useMemo, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { openDipsonSheet } from '@/utils/global-dipson-sheet';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { FollowerEventsScreen } from './follower-events';

// ── Event type color constants ─────────────────────────────────────────────────

const TYPE_COLORS: Record<EventType, string> = {
  content:  '#8B2500',  // ember light
  meetings: '#9C9790',  // drift
  bookings: '#5A8A6E',  // gain
  deals:    '#B8943E',  // caution
  personal: '#C7C1BB',  // mist
};

// ── Types ─────────────────────────────────────────────────────────────────────

type EventType = 'content' | 'meetings' | 'bookings' | 'deals' | 'personal';
type FilterType = 'All' | EventType;

type Event = {
  id: number;
  type: EventType;
  title: string;
  time: string;
  subtitle: string;
  day: string;
  dayKey: string;
};

type DayGroup = {
  day: string;
  dayKey: string;
  events: Event[];
};

// ── Icon mapping ──────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<EventType, string> = {
  content:  'rectangle.stack',
  meetings: 'phone',
  bookings: 'calendar.badge.checkmark',
  deals:    'briefcase',
  personal: 'person.fill',
};

// ── Filter config ─────────────────────────────────────────────────────────────

const FILTER_CHIPS: FilterType[] = ['All', 'Content', 'Meetings', 'Bookings', 'Deals', 'Personal'];

function filterLabel(f: FilterType): string {
  return f;
}

function filterToType(f: FilterType): EventType | null {
  if (f === 'All') return null;
  return f.toLowerCase() as EventType;
}

// ── Mock events ───────────────────────────────────────────────────────────────

const EVENTS: Event[] = [
  // SUN APR 12
  { id: 1,  type: 'content',  title: 'YouTube Video Shoot',       time: '10:00 AM', subtitle: 'Studio session — Spring collection',  day: 'SUN APR 12', dayKey: '2026-04-12' },
  { id: 2,  type: 'meetings', title: 'Brand Call — Nike',          time: '2:00 PM',  subtitle: 'Partnership discussion',               day: 'SUN APR 12', dayKey: '2026-04-12' },
  // MON APR 13
  { id: 3,  type: 'content',  title: 'Podcast Recording',          time: '9:00 AM',  subtitle: 'Episode 42 — Guest: Alex Chen',         day: 'MON APR 13', dayKey: '2026-04-13' },
  { id: 4,  type: 'bookings', title: 'Coaching Session',           time: '1:00 PM',  subtitle: 'Marcus J. · 60 min',                   day: 'MON APR 13', dayKey: '2026-04-13' },
  { id: 5,  type: 'deals',    title: 'Proposal Due — Adidas',      time: '5:00 PM',  subtitle: 'Spring campaign pitch',                 day: 'MON APR 13', dayKey: '2026-04-13' },
  // TUE APR 14
  { id: 6,  type: 'content',  title: 'Instagram Reel Shoot',       time: '11:00 AM', subtitle: 'Product collab content',                day: 'TUE APR 14', dayKey: '2026-04-14' },
  { id: 7,  type: 'meetings', title: 'Team Weekly Sync',           time: '3:00 PM',  subtitle: 'All hands · 45 min',                    day: 'TUE APR 14', dayKey: '2026-04-14' },
  // WED APR 15
  { id: 8,  type: 'bookings', title: '1:1 Consultation',           time: '10:00 AM', subtitle: 'Taylor S. · Strategy session',          day: 'WED APR 15', dayKey: '2026-04-15' },
  { id: 9,  type: 'content',  title: 'Newsletter Draft',           time: '2:00 PM',  subtitle: 'April Edition',                         day: 'WED APR 15', dayKey: '2026-04-15' },
  { id: 10, type: 'personal', title: 'Dentist Appointment',        time: '4:30 PM',  subtitle: 'Annual checkup',                        day: 'WED APR 15', dayKey: '2026-04-15' },
  // THU APR 16
  { id: 11, type: 'deals',    title: 'Contract Review — Puma',     time: '11:00 AM', subtitle: 'Legal + manager call',                  day: 'THU APR 16', dayKey: '2026-04-16' },
  { id: 12, type: 'content',  title: 'TikTok Shoot',               time: '3:00 PM',  subtitle: 'Trending audio · 3 clips',              day: 'THU APR 16', dayKey: '2026-04-16' },
  // FRI APR 17
  { id: 13, type: 'bookings', title: 'Group Coaching Call',        time: '12:00 PM', subtitle: '8 subscribers · Zoom',                  day: 'FRI APR 17', dayKey: '2026-04-17' },
  { id: 14, type: 'meetings', title: 'Press Interview',            time: '3:00 PM',  subtitle: 'Complex Magazine',                      day: 'FRI APR 17', dayKey: '2026-04-17' },
  // SAT APR 18
  { id: 15, type: 'content',  title: 'BTS Photoshoot',             time: '10:00 AM', subtitle: 'NYC photoshoot day',                    day: 'SAT APR 18', dayKey: '2026-04-18' },
  { id: 16, type: 'personal', title: 'Family Dinner',              time: '7:00 PM',  subtitle: '',                                      day: 'SAT APR 18', dayKey: '2026-04-18' },
  // Next week
  { id: 17, type: 'content',  title: 'YouTube Thumbnail Design',   time: '9:00 AM',  subtitle: 'April batch',                           day: 'SUN APR 19', dayKey: '2026-04-19' },
  { id: 18, type: 'deals',    title: 'Deal Deadline — Puma',       time: '12:00 PM', subtitle: 'Final decision needed',                 day: 'SUN APR 19', dayKey: '2026-04-19' },
  { id: 19, type: 'meetings', title: 'Quarterly Strategy Call',    time: '10:00 AM', subtitle: 'Team + manager',                        day: 'MON APR 20', dayKey: '2026-04-20' },
  { id: 20, type: 'bookings', title: 'VIP Consultation',           time: '2:00 PM',  subtitle: 'Jordan K. · 90 min',                   day: 'MON APR 20', dayKey: '2026-04-20' },
  { id: 21, type: 'content',  title: 'Podcast Recording',          time: '11:00 AM', subtitle: 'Episode 43 — Solo',                     day: 'TUE APR 21', dayKey: '2026-04-21' },
  { id: 22, type: 'personal', title: 'Gym — Recovery Day',         time: '8:00 AM',  subtitle: '',                                      day: 'WED APR 22', dayKey: '2026-04-22' },
  { id: 23, type: 'deals',    title: 'Brand Pitch — Lululemon',    time: '3:00 PM',  subtitle: 'Initial meeting',                       day: 'THU APR 23', dayKey: '2026-04-23' },
  { id: 24, type: 'content',  title: 'Content Planning Session',   time: '10:00 AM', subtitle: 'May calendar',                          day: 'FRI APR 24', dayKey: '2026-04-24' },
  { id: 25, type: 'bookings', title: 'Inner Circle Q&A Call',      time: '1:00 PM',  subtitle: '12 members · Live Zoom',                day: 'SAT APR 25', dayKey: '2026-04-25' },
];

// ── Week strip (hardcoded for demo, Apr 12-18 2026) ───────────────────────────

const WEEK_DAYS = [
  { key: '2026-04-12', abbr: 'SUN', num: '12', isToday: true  },
  { key: '2026-04-13', abbr: 'MON', num: '13', isToday: false },
  { key: '2026-04-14', abbr: 'TUE', num: '14', isToday: false },
  { key: '2026-04-15', abbr: 'WED', num: '15', isToday: false },
  { key: '2026-04-16', abbr: 'THU', num: '16', isToday: false },
  { key: '2026-04-17', abbr: 'FRI', num: '17', isToday: false },
  { key: '2026-04-18', abbr: 'SAT', num: '18', isToday: false },
];

// ── Dipson suggestion chips ────────────────────────────────────────────────────

const DIPSON_CHIPS = [
  "What's my content schedule this week?",
  "When's my next brand call?",
  'Schedule a booking slot for Thursday',
  'What deals close this week?',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildDayGroups(events: Event[], filter: FilterType): DayGroup[] {
  const typeFilter = filterToType(filter);
  const filtered = typeFilter ? events.filter(e => e.type === typeFilter) : events;

  const map = new Map<string, DayGroup>();
  for (const ev of filtered) {
    if (!map.has(ev.dayKey)) {
      map.set(ev.dayKey, { day: ev.day, dayKey: ev.dayKey, events: [] });
    }
    map.get(ev.dayKey)!.events.push(ev);
  }

  return Array.from(map.values()).sort((a, b) => a.dayKey.localeCompare(b.dayKey));
}

function getDotsForDay(dayKey: string, filter: FilterType): EventType[] {
  const typeFilter = filterToType(filter);
  const evs = EVENTS.filter(e => e.dayKey === dayKey && (!typeFilter || e.type === typeFilter));
  // Unique types, max 3 dots
  const seen = new Set<EventType>();
  const dots: EventType[] = [];
  for (const ev of evs) {
    if (!seen.has(ev.type) && dots.length < 3) {
      seen.add(ev.type);
      dots.push(ev.type);
    }
  }
  return dots;
}

// ── Event card ────────────────────────────────────────────────────────────────

function EventCard({ event, C, s }: { event: Event; C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  const borderColor = TYPE_COLORS[event.type];
  const iconName = TYPE_ICONS[event.type];

  return (
    <Pressable
      style={[s.eventCard, { backgroundColor: C.surface, borderLeftColor: borderColor }]}
      onPress={() => Haptics.selectionAsync()}
    >
      <View style={s.eventCardInner}>
        <View style={s.eventCardLeft}>
          <View style={s.eventCardIconRow}>
            <IconSymbol name={iconName as any} size={14} color={borderColor} />
            <Text style={[s.eventCardTitle, { color: C.label }]}>{event.title}</Text>
          </View>
          {event.subtitle ? (
            <Text style={[s.eventCardSubtitle, { color: C.secondary }]}>{event.subtitle}</Text>
          ) : null}
        </View>
        <Text style={[s.eventCardTime, { color: C.secondary }]}>{event.time}</Text>
      </View>
    </Pressable>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function AgendaScreen() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('personal:agenda');
  const isOwner = role === roleCycles[0];

  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [selectedDayKey, setSelectedDayKey] = useState<string>('2026-04-12');

  const scrollRef = useRef<ScrollView>(null);
  const dayOffsets = useRef<Map<string, number>>(new Map());

  useFocusEffect(useCallback(() => {
    resetFooter();
  }, []));

  const dayGroups = useMemo(
    () => buildDayGroups(EVENTS, activeFilter),
    [activeFilter],
  );

  const handleDayPress = useCallback((dayKey: string) => {
    Haptics.selectionAsync();
    setSelectedDayKey(dayKey);
    const offset = dayOffsets.current.get(dayKey);
    if (offset !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: offset, animated: true });
    }
  }, []);

  const contentBottom = insets.bottom + 80;

  if (!isOwner) return <FollowerEventsScreen />;

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
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

          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Calendar</Text>
            </View>
          </View>

          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={[s.scrollContent, { paddingTop: insets.top + 52 + 8, paddingBottom: contentBottom }]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* ── Filter Pills ─────────────────────────────────────────────────────── */}
        <View style={[s.filterRow, { borderBottomColor: C.separator }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filterScrollContent}
          >
            {FILTER_CHIPS.map((chip) => {
              const active = activeFilter === chip;
              const typeKey = filterToType(chip);
              const dotColor = typeKey ? TYPE_COLORS[typeKey] : null;
              return (
                <Pressable
                  key={chip}
                  style={[
                    s.filterPill,
                    {
                      backgroundColor: active ? C.label : 'transparent',
                      borderColor: active ? C.label : C.separator,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setActiveFilter(chip);
                  }}
                >
                  {dotColor ? (
                    <View style={[s.filterDot, { backgroundColor: active ? C.bg : dotColor }]} />
                  ) : null}
                  <Text style={[s.filterPillText, { color: active ? C.bg : C.label }]}>
                    {filterLabel(chip)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Ask Dipson Card ──────────────────────────────────────────────────── */}
        <Pressable
          style={[s.dipsonCard, { backgroundColor: C.label }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openDipsonSheet('Calendar');
          }}
        >
          <View style={s.dipsonRow}>
            <IconSymbol name="sparkles" size={18} color={C.bg} />
            <View style={{ flex: 1 }}>
              <Text style={[s.dipsonTitle, { color: C.bg }]}>Ask Dipson</Text>
              <Text style={[s.dipsonSub, { color: C.bg + 'AA' }]}>Tap to ask about your schedule</Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={C.bg + '66'} />
          </View>

          {/* Suggestion chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.dipsonChipsContent}
          >
            {DIPSON_CHIPS.map((chip) => (
              <Pressable
                key={chip}
                style={[s.dipsonChip, { borderColor: C.bg + '33' }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  openDipsonSheet(chip);
                }}
              >
                <Text style={[s.dipsonChipText, { color: C.bg + 'CC' }]}>{chip}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Pressable>

        {/* ── Week Strip ───────────────────────────────────────────────────────── */}
        <View style={[s.weekStripContainer, { borderBottomColor: C.separator }]}>
          <View style={s.weekDayRow}>
            {WEEK_DAYS.map((day) => {
              const selected = selectedDayKey === day.key;
              const dots = getDotsForDay(day.key, activeFilter);
              return (
                <Pressable
                  key={day.key}
                  style={s.weekDayCell}
                  onPress={() => handleDayPress(day.key)}
                >
                  <Text style={[s.weekDayAbbr, { color: selected ? C.label : C.secondary }]}>
                    {day.abbr}
                  </Text>
                  <View style={[
                    s.weekDayNum,
                    selected && { backgroundColor: C.label },
                  ]}>
                    <Text style={[
                      s.weekDayNumText,
                      { color: selected ? C.bg : C.label },
                    ]}>
                      {day.num}
                    </Text>
                  </View>
                  <View style={s.weekDotsRow}>
                    {dots.map((t, i) => (
                      <View
                        key={i}
                        style={[s.weekDot, { backgroundColor: TYPE_COLORS[t] }]}
                      />
                    ))}
                    {dots.length === 0 && <View style={s.weekDotEmpty} />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Event List ───────────────────────────────────────────────────────── */}
        <View style={s.eventList}>
          {dayGroups.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={[s.emptyText, { color: C.secondary }]}>No events for this category.</Text>
            </View>
          ) : (
            dayGroups.map((group) => (
              <View
                key={group.dayKey}
                onLayout={(e) => {
                  dayOffsets.current.set(group.dayKey, e.nativeEvent.layout.y);
                }}
              >
                {/* Day header */}
                <View style={[s.dayHeader, { borderBottomColor: C.separator }]}>
                  <Text style={[s.dayHeaderText, { color: C.secondary }]}>
                    {group.day}
                  </Text>
                </View>

                {/* Event cards */}
                <View style={s.dayCardStack}>
                  {group.events.map((ev) => (
                    <EventCard key={ev.id} event={ev} C={C} s={s} />
                  ))}
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>

      {/* ── FAB ──────────────────────────────────────────────────────────────── */}
      <Pressable
        style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 65 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Alert.alert(
            'Add Event',
            'Choose event type',
            [
              { text: 'Content',  onPress: () => {} },
              { text: 'Meeting',  onPress: () => {} },
              { text: 'Booking',  onPress: () => {} },
              { text: 'Deal',     onPress: () => {} },
              { text: 'Personal', onPress: () => {} },
              { text: 'Cancel', style: 'cancel' },
            ],
          );
        }}
      >
        <IconSymbol name="plus" size={24} color={C.bg} />
      </Pressable>

    </View>
  );
}

// ── makeStyles ────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },

    // Top bar
    topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
    topBar: {
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    kBtn: { width: 44, height: 36, justifyContent: 'center' },
    titlePill: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderWidth: 1,
    },
    titleText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },

    // Scroll
    scrollContent: {
      gap: 0,
    },

    // Filter row
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    filterScrollContent: {
      paddingLeft: 16,
      paddingRight: 16,
      gap: 8,
      flexGrow: 0,
    },
    filterPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      borderRadius: 20,
      borderWidth: 1.5,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    filterDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
    },
    filterPillText: {
      fontSize: 12,
      fontWeight: '600',
    },

    // Dipson card
    dipsonCard: {
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 16,
      padding: 14,
    },
    dipsonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 10,
    },
    dipsonTitle: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 2,
    },
    dipsonSub: {
      fontSize: 12,
      lineHeight: 16,
    },
    dipsonChipsContent: {
      gap: 8,
      paddingRight: 4,
    },
    dipsonChip: {
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    dipsonChipText: {
      fontSize: 11,
      fontWeight: '500',
    },

    // Week strip
    weekStripContainer: {
      marginTop: 12,
      paddingBottom: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    weekDayRow: {
      flexDirection: 'row',
      paddingHorizontal: 8,
    },
    weekDayCell: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
    },
    weekDayAbbr: {
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 0.4,
    },
    weekDayNum: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    weekDayNumText: {
      fontSize: 14,
      fontWeight: '600',
    },
    weekDotsRow: {
      flexDirection: 'row',
      gap: 3,
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

    // Event list
    eventList: {
      paddingTop: 8,
    },
    emptyState: {
      paddingVertical: 48,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
    },

    // Day header
    dayHeader: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      marginTop: 4,
    },
    dayHeaderText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.7,
      textTransform: 'uppercase',
    },

    // Day card stack
    dayCardStack: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 8,
    },

    // Event card
    eventCard: {
      borderRadius: 12,
      borderLeftWidth: 4,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    eventCardInner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    eventCardLeft: {
      flex: 1,
      gap: 3,
    },
    eventCardIconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    eventCardTitle: {
      fontSize: 14,
      fontWeight: '700',
      flexShrink: 1,
    },
    eventCardSubtitle: {
      fontSize: 12,
      lineHeight: 16,
    },
    eventCardTime: {
      fontSize: 12,
      flexShrink: 0,
    },

    // FAB
    fab: {
      position: 'absolute',
      right: 16,
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
