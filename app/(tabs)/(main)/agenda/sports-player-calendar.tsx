/**
 * Sports Player Calendar — Athletics Agenda for Laolu Kalejaiye #11 G
 *
 * Player-perspective schedule: games (report/bus/tipoff), practice (focus area
 * visible, no drill plan), film, classes, study hall, workouts, travel,
 * meetings, and personal events.
 *
 * If role === Head Coach → redirect to sports-coach-calendar.
 */

import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Types ──────────────────────────────────────────────────────────────────────

type EventCategory =
  | 'all'
  | 'games'
  | 'practice'
  | 'film'
  | 'classes'
  | 'studyhall'
  | 'workouts'
  | 'travel'
  | 'meetings'
  | 'personal';

interface DayEvent {
  id: string;
  category: Exclude<EventCategory, 'all'>;
  time: string;        // display string, e.g. "6:00 AM"
  sortHour: number;    // for ordering within a day
  title: string;
  subtitle?: string;
  detail?: string;
  extra?: string;
  location?: string;
  duration?: string;
  expanded?: boolean;
}

interface DayData {
  date: string;          // ISO: 'YYYY-MM-DD'
  label: string;         // 'Mon Apr 7'
  dayLetter: string;     // 'M'
  dayNum: number;        // 7
  events: DayEvent[];
}

// ── Static week data Apr 7–13 2026 ────────────────────────────────────────────

const WEEK_APR7: DayData[] = [
  {
    date: '2026-04-07',
    label: 'Mon Apr 7',
    dayLetter: 'M',
    dayNum: 7,
    events: [
      {
        id: 'mon-1',
        category: 'workouts',
        time: '6:00 AM',
        sortHour: 6,
        title: 'Weight Room',
        subtitle: 'From My Development Plan',
        location: 'Weight Room',
        duration: '60 min',
      },
      {
        id: 'mon-2',
        category: 'classes',
        time: '9:00 AM',
        sortHour: 9,
        title: 'MGMT 301 — Business Strategy',
        subtitle: 'Prof. Williams · Rm 204',
        duration: '50 min',
      },
      {
        id: 'mon-3',
        category: 'classes',
        time: '11:00 AM',
        sortHour: 11,
        title: 'KINE 201 — Sports Science',
        subtitle: 'Prof. Davis · Rm 112',
        duration: '50 min',
      },
      {
        id: 'mon-4',
        category: 'film',
        time: '2:00 PM',
        sortHour: 14,
        title: 'Film Session',
        subtitle: 'Assigned: Menlo Opponent Film — Guards',
        extra: 'My Playlist: 3-Point Attempts',
        location: 'Film Room B',
        duration: '60 min',
      },
      {
        id: 'mon-5',
        category: 'practice',
        time: '7:00 PM',
        sortHour: 19,
        title: 'Practice',
        subtitle: 'Focus: TRANSITION D',
        detail: 'Cannot view full drill breakdown',
        location: 'Main Gym',
        duration: '2 hrs',
      },
    ],
  },
  {
    date: '2026-04-08',
    label: 'Tue Apr 8',
    dayLetter: 'T',
    dayNum: 8,
    events: [
      {
        id: 'tue-1',
        category: 'classes',
        time: '1:00 PM',
        sortHour: 13,
        title: 'ENGL 210 — Technical Writing',
        subtitle: 'Prof. Lee · Rm 315',
        duration: '50 min',
      },
      {
        id: 'tue-2',
        category: 'meetings',
        time: '2:00 PM',
        sortHour: 14,
        title: 'Individual Meeting',
        subtitle: 'with Coach Kalejaiye',
        location: "Coach's Office",
        duration: '30 min',
      },
      {
        id: 'tue-3',
        category: 'classes',
        time: '3:00 PM',
        sortHour: 15,
        title: 'HIST 102 — American History',
        subtitle: 'Prof. Chen · Rm 201',
        duration: '50 min',
      },
      {
        id: 'tue-4',
        category: 'studyhall',
        time: '6:00 PM',
        sortHour: 18,
        title: 'Study Hall',
        subtitle: 'Required — 2 hrs/week minimum',
        detail: 'Your GPA: 3.2 — not at-risk',
        location: 'Library Room 3',
        duration: '2 hrs',
      },
    ],
  },
  {
    date: '2026-04-09',
    label: 'Wed Apr 9',
    dayLetter: 'W',
    dayNum: 9,
    events: [
      {
        id: 'wed-1',
        category: 'workouts',
        time: '6:00 AM',
        sortHour: 6,
        title: 'Weight Room',
        subtitle: 'From My Development Plan',
        location: 'Weight Room',
        duration: '60 min',
      },
      {
        id: 'wed-2',
        category: 'classes',
        time: '9:00 AM',
        sortHour: 9,
        title: 'MGMT 301 — Business Strategy',
        subtitle: 'Prof. Williams · Rm 204',
        duration: '50 min',
      },
      {
        id: 'wed-3',
        category: 'classes',
        time: '11:00 AM',
        sortHour: 11,
        title: 'KINE 201 — Sports Science',
        subtitle: 'Prof. Davis · Rm 112',
        duration: '50 min',
      },
      {
        id: 'wed-4',
        category: 'travel',
        time: '1:00 PM',
        sortHour: 13,
        title: 'AWAY TRIP — Depart',
        subtitle: 'Bus departs 1:00 PM from Facility',
        extra: 'Return: Apr 10 est. 8:00 AM',
        detail: 'Pack: Away uniform, travel sweats, toiletries, charger',
      },
      {
        id: 'wed-5',
        category: 'games',
        time: '6:00 PM',
        sortHour: 18,
        title: 'LU vs Menlo College',
        subtitle: 'Report: 4:30 PM  ·  Bus: 5:00 PM  ·  Tipoff: 6:00 PM',
        extra: 'Pack: Away uniform, warm-ups, earbuds, travel snacks',
        location: 'Menlo College — Away',
        detail: 'AWAY',
      },
    ],
  },
  {
    date: '2026-04-10',
    label: 'Thu Apr 10',
    dayLetter: 'T',
    dayNum: 10,
    events: [
      {
        id: 'thu-1',
        category: 'travel',
        time: '8:00 AM',
        sortHour: 8,
        title: 'Return from Away Trip',
        subtitle: 'Est. arrival 8:00 AM at Facility',
        detail: 'No classes today — travel day',
      },
    ],
  },
  {
    date: '2026-04-11',
    label: 'Fri Apr 11',
    dayLetter: 'F',
    dayNum: 11,
    events: [
      {
        id: 'fri-1',
        category: 'meetings',
        time: '11:00 AM',
        sortHour: 11,
        title: 'Academic Advisor',
        subtitle: 'Scholarship check-in',
        location: 'Academic Center 210',
        duration: '30 min',
      },
      {
        id: 'fri-2',
        category: 'practice',
        time: '3:00 PM',
        sortHour: 15,
        title: 'Practice',
        subtitle: 'Focus: GAME PREP',
        detail: 'Cannot view full drill breakdown',
        location: 'Main Gym',
        duration: '90 min',
      },
    ],
  },
  {
    date: '2026-04-12',
    label: 'Sat Apr 12',
    dayLetter: 'S',
    dayNum: 12,
    events: [
      {
        id: 'sat-1',
        category: 'workouts',
        time: '10:00 AM',
        sortHour: 10,
        title: 'Individual Skill Work',
        subtitle: 'From My Development Plan',
        location: 'Practice Court',
        duration: '90 min',
      },
    ],
  },
  {
    date: '2026-04-13',
    label: 'Sun Apr 13',
    dayLetter: 'S',
    dayNum: 13,
    events: [],
  },
];

// ── Category filter config ─────────────────────────────────────────────────────

const CATEGORIES: { key: EventCategory; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'games',     label: 'Games' },
  { key: 'practice',  label: 'Practice' },
  { key: 'film',      label: 'Film' },
  { key: 'classes',   label: 'Classes' },
  { key: 'studyhall', label: 'Study Hall' },
  { key: 'workouts',  label: 'Workouts' },
  { key: 'travel',    label: 'Travel' },
  { key: 'meetings',  label: 'Meetings' },
  { key: 'personal',  label: 'Personal' },
];

const TODAY_DATE = '2026-04-10'; // Apr 10 matches currentDate

// ── Helpers ───────────────────────────────────────────────────────────────────

function hasDot(events: DayEvent[], filter: EventCategory): boolean {
  if (events.length === 0) return false;
  if (filter === 'all') return true;
  return events.some((e) => e.category === filter);
}

function categoryAccent(
  category: Exclude<EventCategory, 'all'>,
  C: ComponentColors,
): string {
  switch (category) {
    case 'games':     return C.label;
    case 'practice':  return C.mist;
    case 'film':      return C.caution;
    case 'classes':   return C.label;
    case 'studyhall': return C.caution;
    case 'workouts':  return C.secondary;
    case 'travel':    return C.label;
    case 'meetings':  return C.secondary;
    case 'personal':  return C.secondary;
    default:          return C.label;
  }
}

function categoryIcon(category: Exclude<EventCategory, 'all'>): string {
  switch (category) {
    case 'games':     return 'sportscourt.fill';
    case 'practice':  return 'figure.basketball';
    case 'film':      return 'video.fill';
    case 'classes':   return 'book.fill';
    case 'studyhall': return 'graduationcap.fill';
    case 'workouts':  return 'figure.run';
    case 'travel':    return 'airplane';
    case 'meetings':  return 'person.fill';
    case 'personal':  return 'star.fill';
    default:          return 'calendar';
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TodayCard({ C }: { C: ComponentColors }) {
  const s = makeStyles(C);
  return (
    <View style={s.todayCard}>
      <View style={s.todayRow}>
        <View style={s.todayBadge}>
          <Text style={s.todayBadgeText}>TODAY</Text>
        </View>
        <Text style={s.todayDot}>·</Text>
        <Text style={s.todayDateLabel}>Thursday, Apr 10</Text>
      </View>
      <Text style={s.todayNextLabel}>Next event</Text>
      <Text style={s.todayNextEvent}>Return from Away Trip — est. 8:00 AM</Text>
      <Text style={s.todaySubNote}>Travel day · No classes scheduled</Text>
    </View>
  );
}

interface EventCardProps {
  event: DayEvent;
  C: ComponentColors;
}

function GameCard({ event, C }: EventCardProps) {
  const s = makeStyles(C);
  const [expanded, setExpanded] = useState(false);
  const isAway = event.detail === 'AWAY';

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setExpanded((v) => !v);
      }}
      style={[s.card, s.gameCard]}
    >
      <View style={s.cardHeader}>
        <View style={s.cardIconWrap}>
          <IconSymbol name="sportscourt.fill" size={14} color={C.paper} />
        </View>
        <View style={s.cardHeaderTextWrap}>
          <Text style={s.gameTitle}>{event.title}</Text>
          <View style={s.gameHomeBadge}>
            <Text style={[s.gameHomeBadgeText, { color: isAway ? C.heat : C.gain }]}>
              {isAway ? 'AWAY' : 'HOME'}
            </Text>
          </View>
        </View>
        <Text style={s.cardTime}>{event.time}</Text>
      </View>

      <Text style={s.gameTimeline}>{event.subtitle}</Text>
      {event.location && (
        <Text style={s.gameLoc}>{event.location}</Text>
      )}

      {expanded && (
        <View style={s.gameExpanded}>
          <View style={s.expandDivider} />
          <Text style={s.expandLabel}>What to bring</Text>
          <Text style={s.expandValue}>{event.extra}</Text>
        </View>
      )}

      <View style={s.expandCaret}>
        <IconSymbol
          name={expanded ? 'chevron.up' : 'chevron.down'}
          size={11}
          color={C.drift}
        />
      </View>
    </Pressable>
  );
}

function PracticeCard({ event, C }: EventCardProps) {
  const s = makeStyles(C);
  return (
    <View style={[s.card, s.practiceCard]}>
      <View style={s.cardHeader}>
        <View style={[s.cardIconWrap, { backgroundColor: C.mist }]}>
          <IconSymbol name="figure.basketball" size={14} color={C.label} />
        </View>
        <View style={s.cardHeaderTextWrap}>
          <Text style={[s.cardTitle, { color: C.label }]}>{event.title}</Text>
          {event.subtitle && (
            <Text style={s.focusTag}>{event.subtitle}</Text>
          )}
        </View>
        <Text style={s.cardTime}>{event.time}</Text>
      </View>
      <Text style={s.cardMeta}>
        {event.duration}{event.location ? ` · ${event.location}` : ''}
      </Text>
      {event.detail && (
        <Text style={s.coachOnlyNote}>{event.detail}</Text>
      )}
    </View>
  );
}

function FilmCard({ event, C }: EventCardProps) {
  const s = makeStyles(C);
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert('Opening My Film', 'Loading your assigned playlist...');
      }}
      style={[s.card, s.filmCard]}
    >
      <View style={s.cardHeader}>
        <View style={[s.cardIconWrap, { backgroundColor: C.caution }]}>
          <IconSymbol name="video.fill" size={14} color={C.paper} />
        </View>
        <View style={s.cardHeaderTextWrap}>
          <Text style={[s.cardTitle, { color: C.label }]}>{event.title}</Text>
        </View>
        <Text style={s.cardTime}>{event.time}</Text>
      </View>
      {event.subtitle && (
        <Text style={s.filmPlaylist}>{event.subtitle}</Text>
      )}
      {event.extra && (
        <Text style={[s.filmPlaylist, { color: C.caution }]}>{event.extra}</Text>
      )}
      <Text style={s.cardMeta}>
        {event.duration}{event.location ? ` · ${event.location}` : ''}
      </Text>
    </Pressable>
  );
}

function ClassCard({ event, C }: EventCardProps) {
  const s = makeStyles(C);
  return (
    <View style={[s.card, { borderLeftColor: C.separator, borderLeftWidth: 3 }]}>
      <View style={s.cardHeader}>
        <View style={[s.cardIconWrap, { backgroundColor: C.surface }]}>
          <IconSymbol name="book.fill" size={14} color={C.label} />
        </View>
        <View style={s.cardHeaderTextWrap}>
          <Text style={[s.cardTitle, { color: C.label }]}>{event.title}</Text>
          {event.subtitle && (
            <Text style={s.classSubtitle}>{event.subtitle}</Text>
          )}
        </View>
        <Text style={s.cardTime}>{event.time}</Text>
      </View>
      {event.duration && (
        <Text style={s.cardMeta}>{event.duration}</Text>
      )}
    </View>
  );
}

function StudyHallCard({ event, C }: EventCardProps) {
  const s = makeStyles(C);
  return (
    <View style={[s.card, s.studyHallCard]}>
      <View style={s.cardHeader}>
        <View style={[s.cardIconWrap, { backgroundColor: C.caution }]}>
          <IconSymbol name="graduationcap.fill" size={14} color={C.paper} />
        </View>
        <View style={s.cardHeaderTextWrap}>
          <View style={s.studyHallBadge}>
            <Text style={s.studyHallBadgeText}>MANDATORY</Text>
          </View>
          <Text style={[s.cardTitle, { color: C.label }]}>{event.title}</Text>
        </View>
        <Text style={s.cardTime}>{event.time}</Text>
      </View>
      <Text style={s.cardMeta}>
        {event.duration}{event.location ? ` · ${event.location}` : ''}
      </Text>
      {event.detail && (
        <Text style={s.studyHallNote}>{event.detail}</Text>
      )}
    </View>
  );
}

function WorkoutCard({ event, C }: EventCardProps) {
  const s = makeStyles(C);
  return (
    <View style={[s.card]}>
      <View style={s.cardHeader}>
        <View style={[s.cardIconWrap, { backgroundColor: C.surface }]}>
          <IconSymbol name="figure.run" size={14} color={C.secondary} />
        </View>
        <View style={s.cardHeaderTextWrap}>
          <Text style={[s.cardTitle, { color: C.label }]}>{event.title}</Text>
          {event.subtitle && (
            <Text style={[s.classSubtitle, { color: C.secondary }]}>{event.subtitle}</Text>
          )}
        </View>
        <Text style={s.cardTime}>{event.time}</Text>
      </View>
      <Text style={s.cardMeta}>
        {event.duration}{event.location ? ` · ${event.location}` : ''}
      </Text>
    </View>
  );
}

function TravelCard({ event, C }: EventCardProps) {
  const s = makeStyles(C);
  return (
    <View style={[s.card, s.travelCard]}>
      <View style={s.cardHeader}>
        <View style={[s.cardIconWrap, { backgroundColor: C.label }]}>
          <IconSymbol name="airplane" size={14} color={C.paper} />
        </View>
        <View style={s.cardHeaderTextWrap}>
          <Text style={s.travelTitle}>
            {event.title}
          </Text>
        </View>
        <Text style={[s.cardTime, { color: C.drift }]}>{event.time}</Text>
      </View>
      {event.subtitle && (
        <Text style={s.travelMeta}>{event.subtitle}</Text>
      )}
      {event.extra && (
        <Text style={s.travelMeta}>{event.extra}</Text>
      )}
      {event.detail && (
        <Text style={[s.travelMeta, { color: C.caution }]}>{event.detail}</Text>
      )}
    </View>
  );
}

function MeetingCard({ event, C }: EventCardProps) {
  const s = makeStyles(C);
  return (
    <View style={[s.card]}>
      <View style={s.cardHeader}>
        <View style={[s.cardIconWrap, { backgroundColor: C.surface }]}>
          <IconSymbol name="person.fill" size={14} color={C.secondary} />
        </View>
        <View style={s.cardHeaderTextWrap}>
          <Text style={[s.cardTitle, { color: C.label }]}>{event.title}</Text>
          {event.subtitle && (
            <Text style={s.classSubtitle}>{event.subtitle}</Text>
          )}
        </View>
        <Text style={s.cardTime}>{event.time}</Text>
      </View>
      <Text style={s.cardMeta}>
        {event.duration}{event.location ? ` · ${event.location}` : ''}
      </Text>
    </View>
  );
}

function PersonalCard({ event, C }: EventCardProps) {
  const s = makeStyles(C);
  return (
    <View style={[s.card, { borderLeftColor: C.secondary, borderLeftWidth: 3 }]}>
      <View style={s.cardHeader}>
        <View style={[s.cardIconWrap, { backgroundColor: C.surface }]}>
          <IconSymbol name="star.fill" size={14} color={C.secondary} />
        </View>
        <View style={s.cardHeaderTextWrap}>
          <Text style={[s.cardTitle, { color: C.secondary }]}>{event.title}</Text>
          {event.subtitle && (
            <Text style={s.classSubtitle}>{event.subtitle}</Text>
          )}
        </View>
        <Text style={s.cardTime}>{event.time}</Text>
      </View>
    </View>
  );
}

function RestDayCard({ C }: { C: ComponentColors }) {
  const s = makeStyles(C);
  return (
    <View style={s.restCard}>
      <IconSymbol name="moon.fill" size={18} color={C.secondary} />
      <Text style={s.restLabel}>Rest Day</Text>
      <Text style={s.restSub}>No events scheduled. Recovery is part of training.</Text>
    </View>
  );
}

function DipsonBanner({ C }: { C: ComponentColors }) {
  const s = makeStyles(C);
  const prompts = [
    'What time is practice tomorrow?',
    "When's our next away game?",
    'Schedule tutoring for Thursday',
  ];
  return (
    <View style={s.dipsonCard}>
      <View style={s.dipsonRow}>
        <IconSymbol name="sparkles" size={16} color={C.gain} />
        <Text style={s.dipsonTitle}>Ask Dipson</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.dipsonPrompts}
      >
        {prompts.map((p) => (
          <Pressable
            key={p}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('Dipson', `Opening: "${p}"`);
            }}
            style={s.dipsonChip}
          >
            <Text style={s.dipsonChipText}>{p}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// ── Event dispatcher ─────────────────────────────────────────────────────────

function EventCard({ event, C }: EventCardProps) {
  switch (event.category) {
    case 'games':     return <GameCard event={event} C={C} />;
    case 'practice':  return <PracticeCard event={event} C={C} />;
    case 'film':      return <FilmCard event={event} C={C} />;
    case 'classes':   return <ClassCard event={event} C={C} />;
    case 'studyhall': return <StudyHallCard event={event} C={C} />;
    case 'workouts':  return <WorkoutCard event={event} C={C} />;
    case 'travel':    return <TravelCard event={event} C={C} />;
    case 'meetings':  return <MeetingCard event={event} C={C} />;
    case 'personal':  return <PersonalCard event={event} C={C} />;
    default:          return null;
  }
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function SportsPlayerCalendar() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s = makeStyles(C);

  const [role, cycleRole, roleCycles] = useDemoRole('sports:agenda');
  const isHeadCoach = role === roleCycles[0];
  const isAdminRole = isHeadCoach;

  const [selectedDay, setSelectedDay] = useState<string>(TODAY_DATE);
  const [activeFilter, setActiveFilter] = useState<EventCategory>('all');

  useFocusEffect(
    useCallback(() => {
      resetFooter();
      if (isHeadCoach) {
        router.replace('/(tabs)/(main)/agenda/sports-coach-calendar' as any);
      }
    }, [isHeadCoach]),
  );

  const currentDay = useMemo<DayData>(
    () => WEEK_APR7.find((d) => d.date === selectedDay) ?? WEEK_APR7[0],
    [selectedDay],
  );

  const visibleEvents = useMemo<DayEvent[]>(() => {
    const evts = [...currentDay.events].sort((a, b) => a.sortHour - b.sortHour);
    if (activeFilter === 'all') return evts;
    return evts.filter((e) => e.category === activeFilter);
  }, [currentDay, activeFilter]);

  const isToday = selectedDay === TODAY_DATE;

  const handleFAB = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Add Event',
      'Select event type',
      [
        { text: 'Practice (view only)', onPress: () => {} },
        { text: 'Game (view only)',     onPress: () => {} },
        { text: 'Film Session',         onPress: () => Alert.alert('Add Film Session', 'Coming soon') },
        { text: 'Class',                onPress: () => Alert.alert('Add Class', 'Coming soon') },
        { text: 'Study Hall',           onPress: () => Alert.alert('Add Study Hall', 'Coming soon') },
        { text: 'Workout',              onPress: () => Alert.alert('Add Workout', 'Coming soon') },
        { text: 'Meeting',              onPress: () => Alert.alert('Add Meeting', 'Coming soon') },
        { text: 'Personal',             onPress: () => Alert.alert('Add Personal Event', 'Coming soon') },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  }, []);

  return (
    <View style={[s.root, { paddingBottom: insets.bottom + 80 }]}>
      {/* ── Top Bar ──────────────────────────────────────────────────────────── */}
      <View style={[s.topBar, { paddingTop: insets.top + 6 }]}>
        <KMenuButton onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} />

        <View style={s.titlePill}>
          <Text style={s.titlePillText}>Team Feed</Text>
        </View>

        <RolePill
          role={role}
          onPress={cycleRole}
          isPrimary={isAdminRole}
        />
      </View>

      {/* ── Player identity strip ─────────────────────────────────────────── */}
      <View style={s.playerStrip}>
        <Text style={s.playerName}>Laolu Kalejaiye</Text>
        <Text style={s.playerBadge}>#11  ·  Guard</Text>
      </View>

      {/* ── Category filter pills ────────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
        style={s.filterScroll}
      >
        {CATEGORIES.map((cat) => {
          const active = activeFilter === cat.key;
          return (
            <Pressable
              key={cat.key}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveFilter(cat.key);
              }}
              style={[
                s.filterPill,
                active
                  ? { backgroundColor: C.activePill, borderColor: C.activePill }
                  : { backgroundColor: C.surface, borderColor: C.separator },
              ]}
            >
              <Text style={[s.filterPillText, { color: active ? C.activePillText : C.secondary }]}>
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── Week selector ────────────────────────────────────────────────────── */}
      <View style={s.weekNav}>
        <Pressable
          onPress={() => Haptics.selectionAsync()}
          style={s.weekArrow}
        >
          <IconSymbol name="chevron.left" size={14} color={C.secondary} />
        </Pressable>

        <Text style={s.weekLabel}>APR 7 – 13</Text>

        <Pressable
          onPress={() => Haptics.selectionAsync()}
          style={s.weekArrow}
        >
          <IconSymbol name="chevron.right" size={14} color={C.secondary} />
        </Pressable>
      </View>

      {/* ── Day cells ────────────────────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.dayCellsRow}
        style={s.dayCellsScroll}
      >
        {WEEK_APR7.map((day) => {
          const sel = day.date === selectedDay;
          const dot = hasDot(day.events, activeFilter);
          const isT = day.date === TODAY_DATE;
          return (
            <Pressable
              key={day.date}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedDay(day.date);
              }}
              style={[
                s.dayCell,
                sel && { backgroundColor: C.activePill, borderColor: C.activePill },
                !sel && isT && { borderColor: C.label },
              ]}
            >
              <Text style={[s.dayCellLetter, sel ? { color: C.activePillText } : { color: C.secondary }]}>
                {day.dayLetter}
              </Text>
              <Text style={[s.dayCellNum, sel ? { color: C.activePillText } : { color: C.label }]}>
                {day.dayNum}
              </Text>
              {dot && (
                <View style={[s.dayCellDot, { backgroundColor: sel ? C.activePillText : C.label }]} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── Scrollable day content ───────────────────────────────────────────── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Today card — pinned when viewing current week and today selected */}
        {isToday && <TodayCard C={C} />}

        {/* Day header */}
        <Text style={s.dayHeader}>{currentDay.label}</Text>

        {/* Events */}
        {visibleEvents.length === 0 && currentDay.events.length === 0 ? (
          <RestDayCard C={C} />
        ) : visibleEvents.length === 0 ? (
          <View style={s.emptyFilter}>
            <Text style={s.emptyFilterText}>No {activeFilter} events today.</Text>
          </View>
        ) : (
          visibleEvents.map((event) => (
            <View key={event.id} style={s.eventWrap}>
              <EventCard event={event} C={C} />
            </View>
          ))
        )}

        {/* + Add personal event */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Add Personal Event', 'Coming soon');
          }}
          style={s.addPersonalBtn}
        >
          <IconSymbol name="plus" size={13} color={C.secondary} />
          <Text style={s.addPersonalText}>Add personal event</Text>
        </Pressable>

        {/* Dipson banner */}
        <DipsonBanner C={C} />
      </ScrollView>

      {/* ── FAB ──────────────────────────────────────────────────────────────── */}
      <Pressable
        onPress={handleFAB}
        style={[s.fab, { bottom: insets.bottom + 64 }]}
      >
        <IconSymbol name="plus" size={20} color={C.paper} />
        <Text style={s.fabLabel}>Add Event</Text>
      </Pressable>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    // Root
    root: {
      flex: 1,
      backgroundColor: C.bg,
    },

    // Top bar
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 10,
      backgroundColor: C.bg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.separator,
    },
    titlePill: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: C.separator,
      backgroundColor: C.surface,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    titlePillText: {
      fontSize: 13,
      fontWeight: '700',
      color: C.label,
      letterSpacing: 0.2,
    },

    // Player identity
    playerStrip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 6,
      gap: 8,
    },
    playerName: {
      fontSize: 15,
      fontWeight: '700',
      color: C.label,
    },
    playerBadge: {
      fontSize: 13,
      color: C.secondary,
      fontWeight: '500',
    },

    // Category filter
    filterScroll: {
      flexGrow: 0,
    },
    filterRow: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 8,
      flexDirection: 'row',
    },
    filterPill: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 16,
      borderWidth: 1,
    },
    filterPillText: {
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.2,
    },

    // Week navigation
    weekNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 6,
      gap: 12,
    },
    weekArrow: {
      padding: 6,
    },
    weekLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: C.label,
      letterSpacing: 0.8,
    },

    // Day cells
    dayCellsScroll: {
      flexGrow: 0,
    },
    dayCellsRow: {
      paddingHorizontal: 16,
      paddingBottom: 10,
      gap: 8,
      flexDirection: 'row',
    },
    dayCell: {
      width: 38,
      height: 58,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.separator,
      backgroundColor: C.surface,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    dayCellLetter: {
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 0.4,
    },
    dayCellNum: {
      fontSize: 16,
      fontWeight: '700',
    },
    dayCellDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      marginTop: 2,
    },

    // Main scroll
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 24,
      gap: 10,
    },

    // Day header
    dayHeader: {
      fontSize: 13,
      fontWeight: '700',
      color: C.secondary,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginTop: 8,
      marginBottom: 2,
    },

    // Today card
    todayCard: {
      backgroundColor: '#1A1714',
      borderRadius: 14,
      padding: 16,
      marginTop: 10,
      gap: 4,
    },
    todayRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6,
    },
    todayBadge: {
      backgroundColor: '#5A8A6E',
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    todayBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.8,
    },
    todayDot: {
      color: '#8A837C',
      fontSize: 14,
    },
    todayDateLabel: {
      fontSize: 12,
      color: '#8A837C',
      fontWeight: '500',
    },
    todayNextLabel: {
      fontSize: 11,
      color: '#8A837C',
      fontWeight: '600',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    todayNextEvent: {
      fontSize: 15,
      fontWeight: '700',
      color: '#F0E8DC',
    },
    todaySubNote: {
      fontSize: 12,
      color: '#8A837C',
      marginTop: 2,
    },

    // Shared card base
    card: {
      backgroundColor: C.surface,
      borderRadius: 12,
      padding: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.separator,
      gap: 6,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    cardIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: C.mist,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    cardHeaderTextWrap: {
      flex: 1,
      gap: 2,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: C.label,
    },
    cardTime: {
      fontSize: 11,
      fontWeight: '600',
      color: C.secondary,
      letterSpacing: 0.2,
      flexShrink: 0,
    },
    cardMeta: {
      fontSize: 12,
      color: C.secondary,
      marginLeft: 38,
    },

    // Game card
    gameCard: {
      backgroundColor: '#1A1714',
      borderColor: '#3D352E',
    },
    gameTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: '#F0E8DC',
      letterSpacing: 0.2,
    },
    gameHomeBadge: {
      marginTop: 2,
    },
    gameHomeBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.6,
    },
    gameTimeline: {
      fontSize: 12,
      color: '#8A837C',
      marginLeft: 38,
      lineHeight: 18,
    },
    gameLoc: {
      fontSize: 12,
      color: '#8A837C',
      marginLeft: 38,
    },
    gameExpanded: {
      marginLeft: 38,
      gap: 4,
    },
    expandDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: '#3D352E',
      marginVertical: 6,
    },
    expandLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: '#8A837C',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    expandValue: {
      fontSize: 13,
      color: '#F0E8DC',
      lineHeight: 19,
    },
    expandCaret: {
      alignSelf: 'center',
      marginTop: 2,
    },

    // Practice card
    practiceCard: {
      backgroundColor: C.bg,
      borderColor: C.mist,
    },
    focusTag: {
      fontSize: 11,
      fontWeight: '700',
      color: C.label,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    coachOnlyNote: {
      fontSize: 11,
      color: C.secondary,
      fontStyle: 'italic',
      marginLeft: 38,
    },

    // Film card
    filmCard: {
      borderLeftWidth: 3,
      borderLeftColor: C.caution,
    },
    filmPlaylist: {
      fontSize: 12,
      color: C.secondary,
      marginLeft: 38,
    },

    // Class card
    classSubtitle: {
      fontSize: 12,
      color: C.secondary,
    },

    // Study Hall card
    studyHallCard: {
      borderLeftWidth: 3,
      borderLeftColor: C.caution,
    },
    studyHallBadge: {
      alignSelf: 'flex-start',
      backgroundColor: C.caution,
      borderRadius: 5,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginBottom: 2,
    },
    studyHallBadgeText: {
      fontSize: 9,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.8,
    },
    studyHallNote: {
      fontSize: 11,
      color: C.secondary,
      marginLeft: 38,
      fontStyle: 'italic',
    },

    // Travel card
    travelCard: {
      backgroundColor: '#1A1714',
      borderColor: '#3D352E',
    },
    travelTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: '#F0E8DC',
      letterSpacing: 0.4,
    },
    travelMeta: {
      fontSize: 12,
      color: '#8A837C',
      marginLeft: 38,
      lineHeight: 18,
    },

    // Event wrap
    eventWrap: {
      marginBottom: 2,
    },

    // Rest day
    restCard: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
      gap: 8,
    },
    restLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: C.secondary,
    },
    restSub: {
      fontSize: 12,
      color: C.secondary,
      textAlign: 'center',
      paddingHorizontal: 32,
    },

    // Empty filter
    emptyFilter: {
      paddingVertical: 30,
      alignItems: 'center',
    },
    emptyFilterText: {
      fontSize: 13,
      color: C.secondary,
    },

    // Add personal event
    addPersonalBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 12,
      paddingHorizontal: 4,
    },
    addPersonalText: {
      fontSize: 13,
      color: C.secondary,
      fontWeight: '500',
    },

    // Dipson banner
    dipsonCard: {
      backgroundColor: '#1A1714',
      borderRadius: 14,
      padding: 16,
      gap: 12,
      marginTop: 4,
    },
    dipsonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    dipsonTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: '#F0E8DC',
    },
    dipsonPrompts: {
      gap: 8,
      paddingRight: 4,
    },
    dipsonChip: {
      backgroundColor: '#261D17',
      borderRadius: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: '#3D352E',
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    dipsonChipText: {
      fontSize: 12,
      color: '#8A837C',
      fontWeight: '500',
    },

    // FAB
    fab: {
      position: 'absolute',
      right: 20,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.label,
      borderRadius: 24,
      paddingHorizontal: 18,
      paddingVertical: 12,
      gap: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.18,
      shadowRadius: 6,
      elevation: 6,
    },
    fabLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: C.paper,
    },
  });
}
