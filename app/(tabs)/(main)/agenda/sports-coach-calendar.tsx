/**
 * Sports Coach Calendar — Athletics Agenda for Head Coach.
 * ESPN schedule graphics meets 2K coaching dashboard.
 * Spec: full April 2026 GAAC basketball schedule with rich card types.
 *
 * Head Coach only — redirects Player to sports-player-calendar on focus.
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
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';


// ── Semantic color constants ──────────────────────────────────────────────────

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';
const DARK    = '#1A1714';

// ── Types ─────────────────────────────────────────────────────────────────────

type EventCategory = 'game' | 'practice' | 'film' | 'recruiting' | 'travel' | 'academic' | 'meeting';

type FilterCategory = 'All' | EventCategory;

interface BaseEvent {
  id: string;
  date: Date;
  category: EventCategory;
}

interface GameEvent extends BaseEvent {
  category: 'game';
  opponent: string;
  opponentKR: number;
  ourKR: number;
  time: string;
  location: string;
  homeAway: 'Home' | 'Away';
  broadcast?: string;
}

interface PracticeEvent extends BaseEvent {
  category: 'practice';
  focus: string;
  duration: string;
  time: string;
  location: string;
}

interface FilmEvent extends BaseEvent {
  category: 'film';
  playlist: string;
  time: string;
}

interface RecruitingEvent extends BaseEvent {
  category: 'recruiting';
  prospectName: string;
  position: string;
  school: string;
  visitType: 'Official Visit' | 'Campus Visit';
  time: string;
}

interface TravelStep {
  icon: string;
  time: string;
  detail: string;
}

interface TravelEvent extends BaseEvent {
  category: 'travel';
  destination: string;
  steps: TravelStep[];
  returnDate?: Date;
}

interface AcademicEvent extends BaseEvent {
  category: 'academic';
  title: string;
  atRisk: string[];
}

interface MeetingEvent extends BaseEvent {
  category: 'meeting';
  title: string;
  attendees: string[];
  icon: string;
}

type CalendarEvent =
  | GameEvent
  | PracticeEvent
  | FilmEvent
  | RecruitingEvent
  | TravelEvent
  | AcademicEvent
  | MeetingEvent;

// ── Date helpers ──────────────────────────────────────────────────────────────

function d(month: number, day: number, year = 2026): Date {
  return new Date(year, month - 1, day);
}

const DAY_ABBR = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const MON_ABBR = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function formatStickyHeader(date: Date): string {
  return `${DAY_ABBR[date.getDay()]} ${MON_ABBR[date.getMonth()]} ${date.getDate()}`;
}

// ── Full April 2026 Schedule Data ─────────────────────────────────────────────

const EVENTS: CalendarEvent[] = [
  // Apr 7 Mon
  {
    id: 'film-apr7',
    date: d(4, 7),
    category: 'film',
    time: '2:00 PM',
    playlist: 'Menlo Opponent Film — Guards',
  },
  {
    id: 'practice-apr7',
    date: d(4, 7),
    category: 'practice',
    focus: 'TRANSITION D + SHELL DRILL',
    duration: '2 hrs',
    time: '7:00 AM',
    location: 'Main Gym',
  },
  {
    id: 'meeting-apr7',
    date: d(4, 7),
    category: 'meeting',
    title: 'Staff Meeting',
    attendees: ['WM', 'SK', 'TJ'],
    icon: 'person.3.fill',
    time: '9:00 PM',
  } as MeetingEvent & { time: string },

  // Apr 8 Tue
  {
    id: 'film-apr8',
    date: d(4, 8),
    category: 'film',
    time: '9:00 AM',
    playlist: 'Individual Film — LK & BW',
  },
  {
    id: 'recruiting-apr8',
    date: d(4, 8),
    category: 'recruiting',
    time: '10:00 AM',
    prospectName: 'J. Davis',
    position: 'PG',
    school: 'Lincoln HS',
    visitType: 'Official Visit',
  },
  {
    id: 'practice-apr8',
    date: d(4, 8),
    category: 'practice',
    focus: 'SHOOTING + CONDITIONING',
    duration: '90 min',
    time: '3:00 PM',
    location: 'Main Gym',
  },

  // Apr 9 Thu — Away Game at Menlo + Travel
  {
    id: 'travel-apr9',
    date: d(4, 9),
    category: 'travel',
    destination: 'Menlo College, Atherton CA',
    steps: [
      { icon: 'bus.fill',          time: '1:00 PM',  detail: 'Team Bus Departs Campus' },
      { icon: 'building.2.fill',   time: '4:00 PM',  detail: 'Marriott Oakland Check-In' },
      { icon: 'sportscourt.fill',  time: '5:00 PM',  detail: 'Shootaround — Menlo Gym' },
      { icon: 'basketball.fill',   time: '6:00 PM',  detail: 'Game vs Menlo College' },
      { icon: 'arrow.uturn.left',  time: 'Apr 10 8:00 AM', detail: 'Return Bus Departs' },
    ],
    returnDate: d(4, 10),
  },
  {
    id: 'game-apr9',
    date: d(4, 9),
    category: 'game',
    opponent: 'Menlo',
    opponentKR: 72,
    ourKR: 78,
    time: '6:00 PM',
    location: 'Menlo College Gym, Atherton CA',
    homeAway: 'Away',
  },

  // Apr 10 Fri — Return from travel
  // No additional events (return day)

  // Apr 11 Sat
  {
    id: 'academic-apr11',
    date: d(4, 11),
    category: 'academic',
    title: 'Grade Check Deadline',
    atRisk: ['C. McKesey', 'A. Hernandez'],
  },

  // Apr 12 Sat
  {
    id: 'meeting-apr12',
    date: d(4, 12),
    category: 'meeting',
    title: 'AD Meeting',
    attendees: ['WM', 'AD Johnson'],
    icon: 'person.fill',
    time: '10:00 AM',
  } as MeetingEvent & { time: string },

  // Apr 14 Mon
  {
    id: 'practice-apr14',
    date: d(4, 14),
    category: 'practice',
    focus: 'HALF-COURT O + PNR',
    duration: '2 hrs',
    time: '7:00 AM',
    location: 'Main Gym',
  },
  {
    id: 'film-apr14',
    date: d(4, 14),
    category: 'film',
    time: '11:00 AM',
    playlist: 'Dominican Scouting — Perimeter Defense',
  },
  {
    id: 'meeting-apr14',
    date: d(4, 14),
    category: 'meeting',
    title: 'Staff Meeting',
    attendees: ['WM', 'SK', 'TJ'],
    icon: 'person.3.fill',
    time: '9:00 PM',
  } as MeetingEvent & { time: string },

  // Apr 15 Tue
  {
    id: 'practice-apr15',
    date: d(4, 15),
    category: 'practice',
    focus: 'OPPONENT SCOUT WALK-THRU',
    duration: '60 min',
    time: '2:00 PM',
    location: 'Film Room',
  },
  {
    id: 'recruiting-apr15',
    date: d(4, 15),
    category: 'recruiting',
    time: '1:00 PM',
    prospectName: 'M. Okonkwo',
    position: 'SF',
    school: 'Oakland HS',
    visitType: 'Campus Visit',
  },

  // Apr 16 Thu — Home Game vs Dominican
  {
    id: 'practice-apr16-morn',
    date: d(4, 16),
    category: 'practice',
    focus: 'PREGAME WALKTHROUGH',
    duration: '45 min',
    time: '10:00 AM',
    location: 'Main Gym',
  },
  {
    id: 'game-apr16',
    date: d(4, 16),
    category: 'game',
    opponent: 'Dominican',
    opponentKR: 68,
    ourKR: 78,
    time: '7:00 PM',
    location: 'Sullivan Gym — Home',
    homeAway: 'Home',
    broadcast: 'KTV Live',
  },

  // Apr 17 Fri
  {
    id: 'film-apr17',
    date: d(4, 17),
    category: 'film',
    time: '9:00 AM',
    playlist: 'Dominican Postgame Film — Full Team',
  },

  // Apr 21 Mon — Away Game at Cal Maritime
  {
    id: 'practice-apr21',
    date: d(4, 21),
    category: 'practice',
    focus: 'CAL MARITIME SCOUT PREP',
    duration: '90 min',
    time: '8:00 AM',
    location: 'Main Gym',
  },
  {
    id: 'game-apr21',
    date: d(4, 21),
    category: 'game',
    opponent: 'Cal Maritime',
    opponentKR: 64,
    ourKR: 78,
    time: '7:00 PM',
    location: 'Cal Maritime Gym, Vallejo CA',
    homeAway: 'Away',
  },

  // Apr 22 Tue
  {
    id: 'film-apr22',
    date: d(4, 22),
    category: 'film',
    time: '10:00 AM',
    playlist: 'Cal Maritime Postgame Film',
  },
  {
    id: 'practice-apr22',
    date: d(4, 22),
    category: 'practice',
    focus: 'RECOVERY + INDIVIDUAL WORK',
    duration: '60 min',
    time: '3:00 PM',
    location: 'Main Gym',
  },

  // Apr 23 Wed
  {
    id: 'practice-apr23',
    date: d(4, 23),
    category: 'practice',
    focus: 'DEFENSIVE ROTATIONS',
    duration: '2 hrs',
    time: '7:00 AM',
    location: 'Main Gym',
  },

  // Apr 24 Thu
  {
    id: 'practice-apr24',
    date: d(4, 24),
    category: 'practice',
    focus: 'LIVE 5-ON-5 + TEMPO',
    duration: '2 hrs',
    time: '7:00 AM',
    location: 'Main Gym',
  },

  // Apr 25 Fri
  {
    id: 'academic-apr25',
    date: d(4, 25),
    category: 'academic',
    title: 'Eligibility Certification Window',
    atRisk: ['B. Torres'],
  },

  // Apr 28 Mon
  {
    id: 'meeting-apr28',
    date: d(4, 28),
    category: 'meeting',
    title: 'Staff Meeting',
    attendees: ['WM', 'SK', 'TJ'],
    icon: 'person.3.fill',
    time: '9:00 PM',
  } as MeetingEvent & { time: string },
  {
    id: 'practice-apr28',
    date: d(4, 28),
    category: 'practice',
    focus: 'END-OF-SEASON EVAL + CONDITIONING',
    duration: '2 hrs',
    time: '7:00 AM',
    location: 'Main Gym',
  },
];

// Sort events by date then by time within day
const SORTED_EVENTS = [...EVENTS].sort((a, b) => a.date.getTime() - b.date.getTime());

// ── Category config ───────────────────────────────────────────────────────────

interface CategoryConfig {
  label: string;
  dot: string;
  borderColor: string;
}

const CATEGORY_CONFIG: Record<FilterCategory, CategoryConfig> = {
  All:        { label: 'All',        dot: '',       borderColor: '' },
  game:       { label: 'Games',      dot: DARK,     borderColor: DARK },
  practice:   { label: 'Practice',   dot: '',       borderColor: '' },
  film:       { label: 'Film',       dot: CAUTION,  borderColor: CAUTION },
  recruiting: { label: 'Recruiting', dot: GAIN,     borderColor: GAIN },
  travel:     { label: 'Travel',     dot: '',       borderColor: '' },
  academic:   { label: 'Academic',   dot: GAIN,     borderColor: GAIN },
  meeting:    { label: 'Meetings',   dot: '',       borderColor: '' },
};

const FILTER_ORDER: FilterCategory[] = [
  'All', 'game', 'practice', 'film', 'recruiting', 'travel', 'academic', 'meeting',
];

// ── Compliance periods ────────────────────────────────────────────────────────

type CompliancePeriod = 'Contact' | 'Evaluation' | 'Dead';

function getCompliancePeriod(date: Date): CompliancePeriod | null {
  const m = date.getMonth() + 1;
  const day = date.getDate();
  if (m === 4 && day >= 1 && day <= 15) return 'Contact';
  if (m === 4 && day >= 16 && day <= 30) return 'Dead';
  return null;
}

function complianceBg(period: CompliancePeriod): string {
  if (period === 'Contact')    return GAIN;
  if (period === 'Dead')       return HEAT;
  if (period === 'Evaluation') return CAUTION;
  return GAIN;
}

function complianceLabel(period: CompliancePeriod): string {
  if (period === 'Contact')    return 'CONTACT PERIOD';
  if (period === 'Dead')       return 'DEAD PERIOD';
  if (period === 'Evaluation') return 'EVALUATION PERIOD';
  return '';
}

// ── Week builder ──────────────────────────────────────────────────────────────

function getWeekDays(anchor: Date): Date[] {
  const result: Date[] = [];
  const sun = new Date(anchor);
  sun.setDate(anchor.getDate() - anchor.getDay());
  for (let i = 0; i < 7; i++) {
    const day = new Date(sun);
    day.setDate(sun.getDate() + i);
    result.push(day);
  }
  return result;
}

function primaryDotColor(events: CalendarEvent[], C: ComponentColors): string {
  if (events.some(e => e.category === 'game'))       return C.label;
  if (events.some(e => e.category === 'travel'))     return C.separator;
  if (events.some(e => e.category === 'recruiting')) return GAIN;
  if (events.some(e => e.category === 'film'))       return CAUTION;
  if (events.some(e => e.category === 'academic'))   return GAIN;
  if (events.some(e => e.category === 'practice'))   return C.secondary;
  if (events.some(e => e.category === 'meeting'))    return C.secondary;
  return C.separator;
}

// ── Day group builder ─────────────────────────────────────────────────────────

interface DayGroup {
  date: Date;
  events: CalendarEvent[];
}

function buildDayGroups(events: CalendarEvent[], filter: FilterCategory): DayGroup[] {
  const map = new Map<string, DayGroup>();
  const filtered = filter === 'All' ? events : events.filter(e => e.category === filter);

  for (const ev of filtered) {
    const key = `${ev.date.getFullYear()}-${ev.date.getMonth()}-${ev.date.getDate()}`;
    if (!map.has(key)) {
      map.set(key, { date: ev.date, events: [] });
    }
    map.get(key)!.events.push(ev);
  }

  return Array.from(map.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
}

// ── Sub-components ────────────────────────────────────────────────────────────

function GameCard({ event, C, s }: { event: GameEvent; C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  return (
    <View style={s.gameCard}>
      {/* Score graphic row */}
      <View style={s.gameScoreRow}>
        {/* Our team badge */}
        <View style={[s.teamBadge, { backgroundColor: GAIN }]}>
          <Text style={s.teamBadgeInit}>LU</Text>
          <Text style={s.teamBadgeKR}>{event.ourKR} KR</Text>
        </View>

        <View style={s.gameVsBlock}>
          <Text style={[s.gameVsText, { color: C.secondary }]}>VS</Text>
          <View style={[s.homeAwayPill, { backgroundColor: event.homeAway === 'Home' ? GAIN + '33' : HEAT + '33' }]}>
            <Text style={[s.homeAwayText, { color: event.homeAway === 'Home' ? GAIN : HEAT }]}>
              {event.homeAway === 'Home' ? 'HOME' : 'AWAY'}
            </Text>
          </View>
        </View>

        {/* Opponent badge */}
        <View style={[s.teamBadge, { backgroundColor: C.surface }]}>
          <Text style={[s.teamBadgeInit, { color: C.label }]}>{event.opponent.substring(0, 3).toUpperCase()}</Text>
          <Text style={[s.teamBadgeKR, { color: C.secondary }]}>{event.opponentKR} KR</Text>
        </View>
      </View>

      {/* Meta row */}
      <View style={s.gameMeta}>
        <IconSymbol name="clock" size={12} color={C.secondary} />
        <Text style={[s.gameMetaText, { color: C.secondary }]}>{event.time}</Text>
        <View style={s.gameDot} />
        <IconSymbol name="mappin" size={12} color={C.secondary} />
        <Text style={[s.gameMetaText, { color: C.secondary }]} numberOfLines={1}>
          {event.location}
        </Text>
      </View>

      {/* Broadcast + Pregame row */}
      <View style={s.gameBottomRow}>
        {event.broadcast ? (
          <View style={[s.broadcastPill, { backgroundColor: CAUTION + '22', borderColor: CAUTION + '55' }]}>
            <IconSymbol name="antenna.radiowaves.left.and.right" size={11} color={CAUTION} />
            <Text style={[s.broadcastText, { color: CAUTION }]}>{event.broadcast}</Text>
          </View>
        ) : (
          <View />
        )}
        <Pressable
          style={s.pregameBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Scouting Report', `Opening scouting report for ${event.opponent}`);
          }}
        >
          <Text style={[s.pregameBtnText, { color: CAUTION }]}>Pregame Prep</Text>
          <IconSymbol name="chevron.right" size={12} color={CAUTION} />
        </Pressable>
      </View>
    </View>
  );
}

function PracticeCard({ event, C, s }: { event: PracticeEvent; C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  return (
    <Pressable
      style={[s.leftBorderCard, { backgroundColor: C.surface, borderLeftColor: C.secondary }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert('Practice Plan', `Opening practice plan: ${event.focus}`);
      }}
    >
      <Text style={[s.practiceTitle, { color: C.label }]}>{event.focus}</Text>
      <View style={s.cardMetaRow}>
        <IconSymbol name="clock" size={12} color={C.secondary} />
        <Text style={[s.cardMetaText, { color: C.secondary }]}>{event.time} · {event.duration}</Text>
        <View style={[s.metaDot, { backgroundColor: C.separator }]} />
        <IconSymbol name="mappin" size={12} color={C.secondary} />
        <Text style={[s.cardMetaText, { color: C.secondary }]}>{event.location}</Text>
      </View>
    </Pressable>
  );
}

function FilmCard({ event, C, s }: { event: FilmEvent; C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  return (
    <Pressable
      style={[s.leftBorderCard, { backgroundColor: C.surface, borderLeftColor: CAUTION }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert('Film Room', `Opening film room: ${event.playlist}`);
      }}
    >
      <View style={s.filmHeader}>
        <IconSymbol name="film.fill" size={15} color={CAUTION} />
        <Text style={[s.filmTitle, { color: C.label }]}>Film Session</Text>
        <Text style={[s.filmTime, { color: C.secondary }]}>{event.time}</Text>
      </View>
      <Text style={[s.filmPlaylist, { color: C.secondary }]}>{event.playlist}</Text>
    </Pressable>
  );
}

function RecruitingCard({ event, complianceOn, C, s }: { event: RecruitingEvent; complianceOn: boolean; C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  const period = getCompliancePeriod(event.date);
  return (
    <View style={[s.leftBorderCard, { backgroundColor: C.surface, borderLeftColor: GAIN }]}>
      <View style={s.recruitHeader}>
        <IconSymbol name="person.fill" size={14} color={GAIN} />
        <Text style={[s.recruitName, { color: C.label }]}>{event.prospectName}</Text>
        <View style={[s.positionPill, { backgroundColor: GAIN + '22' }]}>
          <Text style={[s.positionText, { color: GAIN }]}>{event.position}</Text>
        </View>
      </View>
      <Text style={[s.recruitSchool, { color: C.secondary }]}>{event.time} · {event.school}</Text>
      <View style={s.recruitBadgeRow}>
        <View style={[s.visitPill, { backgroundColor: C.separator }]}>
          <Text style={[s.visitText, { color: C.label }]}>{event.visitType}</Text>
        </View>
        {complianceOn && period && (
          <View style={[s.compliancePill, { backgroundColor: complianceBg(period) + '33', borderColor: complianceBg(period) + '55' }]}>
            <Text style={[s.compliancePillText, { color: complianceBg(period) }]}>{complianceLabel(period)}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function TravelCard({ event, C, s }: { event: TravelEvent; C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  return (
    <View style={s.travelCard}>
      <View style={s.travelHeader}>
        <IconSymbol name="airplane" size={16} color="#FFFFFF" />
        <Text style={s.travelTitle}>Travel — {event.destination}</Text>
      </View>
      <View style={s.travelTimeline}>
        {event.steps.map((step, idx) => (
          <View key={idx} style={s.travelStep}>
            <View style={s.travelStepIconWrap}>
              <IconSymbol name={step.icon as any} size={13} color="rgba(255,255,255,0.7)" />
              {idx < event.steps.length - 1 && <View style={s.travelStepLine} />}
            </View>
            <View style={s.travelStepContent}>
              <Text style={s.travelStepTime}>{step.time}</Text>
              <Text style={s.travelStepDetail}>{step.detail}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function AcademicCard({ event, C, s }: { event: AcademicEvent; C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  return (
    <View style={[s.leftBorderCard, { backgroundColor: C.surface, borderLeftColor: GAIN }]}>
      <View style={s.academicHeader}>
        <IconSymbol name="book.fill" size={14} color={GAIN} />
        <Text style={[s.academicTitle, { color: C.label }]}>{event.title}</Text>
      </View>
      {event.atRisk.length > 0 && (
        <View style={s.atRiskRow}>
          <Text style={[s.atRiskLabel, { color: C.secondary }]}>At Risk: </Text>
          {event.atRisk.map((name, idx) => (
            <View key={idx} style={[s.atRiskPill, { backgroundColor: HEAT + '22', borderColor: HEAT + '44' }]}>
              <Text style={[s.atRiskName, { color: HEAT }]}>{name}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function MeetingCard({ event, C, s }: { event: MeetingEvent & { time?: string }; C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  return (
    <View style={[s.meetingCard, { backgroundColor: C.surface }]}>
      <View style={s.meetingHeader}>
        <IconSymbol name={event.icon as any} size={14} color={C.secondary} />
        <Text style={[s.meetingTitle, { color: C.label }]}>{event.title}</Text>
        {(event as any).time && (
          <Text style={[s.meetingTime, { color: C.secondary }]}>{(event as any).time}</Text>
        )}
      </View>
      <View style={s.attendeeRow}>
        {event.attendees.map((init, idx) => (
          <View key={idx} style={[s.attendeeChip, { backgroundColor: C.separator }]}>
            <Text style={[s.attendeeText, { color: C.label }]}>{init}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function SportsCoachCalendarScreen() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, cycleRole, roleCycles] = useDemoRole('sports:agenda');
  const isHeadCoach = role === roleCycles[0];

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [activeFilter, setActiveFilter] = useState<FilterCategory>('All');
  const [selectedDay, setSelectedDay] = useState<Date>(d(4, 10));
  const [complianceOn, setComplianceOn] = useState(false);

  // Week anchor: track which week the selected day lives in
  const weekDays = useMemo(() => getWeekDays(selectedDay), [selectedDay]);

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isHeadCoach) {
      router.replace('/(tabs)/(main)/agenda/sports-player-calendar' as any);
    }
  }, [isHeadCoach]));

  // Events on each day of the visible week (for dots)
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of SORTED_EVENTS) {
      const key = `${ev.date.getFullYear()}-${ev.date.getMonth()}-${ev.date.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, []);

  const dayGroups = useMemo(
    () => buildDayGroups(SORTED_EVENTS, activeFilter),
    [activeFilter],
  );

  const scrollRef = useRef<ScrollView>(null);

  const handleDayPress = useCallback((day: Date) => {
    Haptics.selectionAsync();
    setSelectedDay(day);
  }, []);

  const handleWeekNav = useCallback((dir: -1 | 1) => {
    Haptics.selectionAsync();
    setSelectedDay(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + dir * 7);
      return next;
    });
  }, []);

  const renderEventCard = useCallback((ev: CalendarEvent) => {
    switch (ev.category) {
      case 'game':
        return <GameCard key={ev.id} event={ev} C={C} s={s} />;
      case 'practice':
        return <PracticeCard key={ev.id} event={ev} C={C} s={s} />;
      case 'film':
        return <FilmCard key={ev.id} event={ev} C={C} s={s} />;
      case 'recruiting':
        return <RecruitingCard key={ev.id} event={ev} complianceOn={complianceOn} C={C} s={s} />;
      case 'travel':
        return <TravelCard key={ev.id} event={ev} C={C} s={s} />;
      case 'academic':
        return <AcademicCard key={ev.id} event={ev} C={C} s={s} />;
      case 'meeting':
        return <MeetingCard key={ev.id} event={ev as any} C={C} s={s} />;
      default:
        return null;
    }
  }, [C, s, complianceOn]);

  const contentBottom = insets.bottom + 80;

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
              <Text style={[s.titleText, { color: C.label }]}>LU Men's Basketball</Text>
            </View>
          </View>

          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isHeadCoach} />
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

        {/* ── Category Filter Pills ────────────────────────────────────────────── */}
        <View style={[s.filterRow, { borderBottomColor: C.separator }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filterScrollContent}
          >
            {FILTER_ORDER.map((cat) => {
              const config = CATEGORY_CONFIG[cat];
              const active = activeFilter === cat;
              const dotColor = config.dot;
              return (
                <Pressable
                  key={cat}
                  style={[
                    s.filterPill,
                    {
                      backgroundColor: active ? C.activePill : 'transparent',
                      borderColor: active ? C.activePill : C.separator,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setActiveFilter(cat);
                  }}
                >
                  {dotColor ? (
                    <View style={[s.filterDot, { backgroundColor: active ? C.activePillText : dotColor }]} />
                  ) : null}
                  <Text style={[s.filterPillText, { color: active ? C.activePillText : C.secondary }]}>
                    {config.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Compliance toggle */}
          <Pressable
            style={[
              s.complianceToggle,
              {
                backgroundColor: complianceOn ? GAIN + '22' : C.surface,
                borderColor: complianceOn ? GAIN + '66' : C.separator,
              },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setComplianceOn(v => !v);
            }}
          >
            <Text style={[s.complianceToggleText, { color: complianceOn ? GAIN : C.secondary }]}>
              Compliance
            </Text>
          </Pressable>
        </View>

        {/* ── Dipson Banner ────────────────────────────────────────────────────── */}
        <Pressable
          style={[s.dipsonCard, { backgroundColor: DARK }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Dipson', 'Opening Dipson AI assistant');
          }}
        >
          <View style={s.dipsonRow}>
            <IconSymbol name="sparkles" size={18} color={GAIN} />
            <View style={{ flex: 1 }}>
              <Text style={s.dipsonTitle}>Ask Dipson</Text>
              <Text style={s.dipsonSub}>
                "What's the schedule this week?" · "When's next recruiting dead period?" · "Schedule film for Thursday guards"
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color="rgba(255,255,255,0.4)" />
          </View>
        </Pressable>

        {/* ── Week Strip ───────────────────────────────────────────────────────── */}
        <View style={[s.weekViewContainer, { borderBottomColor: C.separator }]}>
          {/* Week navigation */}
          <View style={s.weekNavRow}>
            <Pressable onPress={() => handleWeekNav(-1)} style={s.weekNavBtn} hitSlop={8}>
              <IconSymbol name="chevron.left" size={16} color={C.secondary} />
            </Pressable>
            <Text style={[s.weekMonthLabel, { color: C.label }]}>
              {MON_ABBR[weekDays[0].getMonth()]} {weekDays[0].getFullYear()}
            </Text>
            <Pressable onPress={() => handleWeekNav(1)} style={s.weekNavBtn} hitSlop={8}>
              <IconSymbol name="chevron.right" size={16} color={C.secondary} />
            </Pressable>
          </View>

          {/* Day columns */}
          <View style={s.weekDayRow}>
            {weekDays.map((day) => {
              const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
              const dayEvents = eventsByDay.get(key) ?? [];
              const isSelected = sameDay(day, selectedDay);
              const isToday = sameDay(day, new Date());
              const dotColor = dayEvents.length > 0 ? primaryDotColor(dayEvents, C) : null;

              return (
                <Pressable
                  key={key}
                  style={s.weekDayCell}
                  onPress={() => handleDayPress(day)}
                >
                  <Text style={[s.weekDayLabel, { color: isSelected ? C.bg : C.secondary }]}>
                    {DAY_ABBR[day.getDay()]}
                  </Text>
                  <View style={[
                    s.weekDayNum,
                    isSelected && { backgroundColor: C.label },
                    isToday && !isSelected && { borderWidth: 1.5, borderColor: C.label },
                  ]}>
                    <Text style={[
                      s.weekDayNumText,
                      { color: isSelected ? C.bg : C.label },
                    ]}>
                      {day.getDate()}
                    </Text>
                  </View>
                  {dotColor && (
                    <View style={[s.weekDot, { backgroundColor: dotColor }]} />
                  )}
                  {!dotColor && <View style={s.weekDotEmpty} />}
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
            dayGroups.map((group) => {
              const period = getCompliancePeriod(group.date);
              const hasRecruiting = group.events.some(e => e.category === 'recruiting');

              return (
                <View key={`${group.date.getTime()}`}>
                  {/* Sticky day header */}
                  <View style={[s.dayHeader, { borderBottomColor: C.separator }]}>
                    <Text style={[s.dayHeaderText, { color: C.secondary }]}>
                      {formatStickyHeader(group.date)}
                    </Text>
                  </View>

                  {/* Compliance banner */}
                  {complianceOn && hasRecruiting && period && (
                    <View style={[s.complianceBanner, { backgroundColor: complianceBg(period) }]}>
                      <IconSymbol name="shield.fill" size={12} color="#FFFFFF" />
                      <Text style={s.complianceBannerText}>{complianceLabel(period)}</Text>
                    </View>
                  )}

                  {/* Event cards */}
                  <View style={s.dayCardStack}>
                    {group.events.map(ev => renderEventCard(ev))}
                  </View>
                </View>
              );
            })
          )}
        </View>

      </ScrollView>

      {/* ── FAB ─────────────────────────────────────────────────────────────────── */}
      <Pressable
        style={[s.fab, { backgroundColor: C.label, bottom: 49 + insets.bottom + 16 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Alert.alert(
            'Add Event',
            'Choose event type',
            [
              { text: 'Game',        onPress: () => {} },
              { text: 'Practice',    onPress: () => {} },
              { text: 'Film Session',onPress: () => {} },
              { text: 'Recruiting',  onPress: () => {} },
              { text: 'Travel',      onPress: () => {} },
              { text: 'Academic',    onPress: () => {} },
              { text: 'Meeting',     onPress: () => {} },
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
      gap: 5,
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderWidth: 1,
    },
    titleText: { fontSize: 13, fontWeight: '700' },
    rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },

    // Scroll
    scrollContent: {
      paddingTop: 0,
      gap: 0,
    },

    // Filter row
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      gap: 8,
    },
    filterScrollContent: {
      paddingLeft: 16,
      paddingRight: 8,
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

    // Compliance toggle
    complianceToggle: {
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 6,
      marginRight: 12,
      flexShrink: 0,
    },
    complianceToggleText: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.2,
    },

    // Dipson card
    dipsonCard: {
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 14,
      padding: 14,
    },
    dipsonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    dipsonTitle: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 3,
    },
    dipsonSub: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: 11,
      lineHeight: 16,
    },

    // Week view
    weekViewContainer: {
      marginTop: 12,
      paddingBottom: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    weekNavRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    weekNavBtn: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    weekMonthLabel: {
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.3,
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
    weekDayLabel: {
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

    // Compliance banner
    complianceBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginHorizontal: 16,
      marginTop: 8,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    complianceBannerText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.5,
    },

    // Day card stack
    dayCardStack: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 10,
    },

    // Left-border card base (practice, film, recruiting, academic)
    leftBorderCard: {
      borderRadius: 12,
      borderLeftWidth: 3,
      padding: 12,
      gap: 6,
    },

    // Game card
    gameCard: {
      backgroundColor: DARK,
      borderRadius: 14,
      padding: 14,
      gap: 12,
    },
    gameScoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    teamBadge: {
      flex: 1,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
      gap: 4,
    },
    teamBadgeInit: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    teamBadgeKR: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 11,
      fontWeight: '600',
    },
    gameVsBlock: {
      alignItems: 'center',
      gap: 6,
    },
    gameVsText: {
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 1,
    },
    homeAwayPill: {
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    homeAwayText: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    gameMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    gameMetaText: {
      fontSize: 12,
      flex: 1,
    },
    gameDot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    metaDot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
    },
    gameBottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    broadcastPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      borderRadius: 8,
      borderWidth: 1,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    broadcastText: {
      fontSize: 11,
      fontWeight: '700',
    },
    pregameBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
    },
    pregameBtnText: {
      fontSize: 12,
      fontWeight: '600',
    },

    // Practice card
    practiceTitle: {
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
    cardMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    cardMetaText: {
      fontSize: 12,
    },

    // Film card
    filmHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    filmTitle: {
      fontSize: 14,
      fontWeight: '700',
      flex: 1,
    },
    filmTime: {
      fontSize: 12,
    },
    filmPlaylist: {
      fontSize: 12,
      paddingLeft: 2,
    },

    // Recruiting card
    recruitHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    recruitName: {
      fontSize: 14,
      fontWeight: '700',
      flex: 1,
    },
    positionPill: {
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    positionText: {
      fontSize: 11,
      fontWeight: '700',
    },
    recruitSchool: {
      fontSize: 12,
    },
    recruitBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    visitPill: {
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    visitText: {
      fontSize: 11,
      fontWeight: '600',
    },
    compliancePill: {
      borderRadius: 8,
      borderWidth: 1,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    compliancePillText: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.3,
    },

    // Travel card
    travelCard: {
      backgroundColor: DARK,
      borderRadius: 14,
      padding: 14,
      gap: 12,
    },
    travelHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    travelTitle: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
      flex: 1,
    },
    travelTimeline: {
      gap: 0,
    },
    travelStep: {
      flexDirection: 'row',
      gap: 10,
    },
    travelStepIconWrap: {
      alignItems: 'center',
      width: 20,
    },
    travelStepLine: {
      width: 1.5,
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.15)',
      marginTop: 2,
      minHeight: 20,
    },
    travelStepContent: {
      flex: 1,
      paddingBottom: 12,
    },
    travelStepTime: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: 11,
      fontWeight: '600',
    },
    travelStepDetail: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 13,
      fontWeight: '500',
    },

    // Academic card
    academicHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    academicTitle: {
      fontSize: 14,
      fontWeight: '700',
      flex: 1,
    },
    atRiskRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
    },
    atRiskLabel: {
      fontSize: 12,
    },
    atRiskPill: {
      borderRadius: 6,
      borderWidth: 1,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    atRiskName: {
      fontSize: 11,
      fontWeight: '600',
    },

    // Meeting card
    meetingCard: {
      borderRadius: 12,
      padding: 12,
      gap: 8,
    },
    meetingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },
    meetingTitle: {
      fontSize: 14,
      fontWeight: '700',
      flex: 1,
    },
    meetingTime: {
      fontSize: 12,
    },
    attendeeRow: {
      flexDirection: 'row',
      gap: 6,
      flexWrap: 'wrap',
    },
    attendeeChip: {
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    attendeeText: {
      fontSize: 11,
      fontWeight: '600',
    },

    // FAB
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
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  });
}
