/**
 * Education Dashboard — 10-block RBAC-gated dashboard for Education Mode.
 * Default demo role: E1 (President) — full access.
 *
 * Blocks:
 *   0 — Hero Video (campus montage — video-first, matches business-dashboard-v2 pattern)
 *   1 — Today Strip (command center — classes, deadlines, meetings, events)
 *   2 — Approvals & Decisions (E1/E2 — pending items requiring action)
 *   3 — Enrollment Funnel Pulse (KPI chips + funnel stages)
 *   4 — Student Success Radar (retention, at-risk, GPA trends)
 *   5 — Campus Operations & Safety (active issues, facilities, safety)
 *   6 — Financial Snapshot (E1/E2 — budget, revenue, aid)
 *   7 — Housing Snapshot (occupancy, waitlist, assignments)
 *   8 — People Coverage (faculty seats, staff gaps, roles filled)
 *   9 — Announcements (role-filtered announcements feed)
 */

import React from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';

const ACCENT = MODE_ACCENT.education;
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { EducationRoleLens } from '@/utils/education-rbac';
import {
  isPresident,
  isDeanLevel,
  isFacultyLevel,
  isStudent,
  isEnrolled,
  getEduQuickActions,
} from '@/utils/education-rbac';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  role?: EducationRoleLens;
  onSwitchTab?: (index: number) => void;
}

// =============================================================================
// INLINE MOCK DATA
// =============================================================================

// --- Block 0: Hero Video ---

interface HeroVideoInfo {
  title: string;
  subtitle: string;
  duration: string;
  orgName: string;
  term: string;
  todayDate: string;
  tickerItems: string[];
}

const HERO_VIDEO: HeroVideoInfo = {
  title: 'Montana Tech — Spring 2026 Welcome',
  subtitle: 'Campus life · Athletics · Academics · Chapel',
  duration: '4:18',
  orgName: 'Montana Tech',
  term: 'Spring 2026',
  todayDate: 'Tuesday, Feb 18',
  tickerItems: [
    'Men\'s Basketball vs. Riverside — 7 PM tonight',
    'Spring registration closes Friday',
    'Library extended hours begin for midterm week',
  ],
};

// --- Block 1: Today Strip ---

interface TodayStripItem {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  owner: string;
  time: string;
  type: 'class' | 'deadline' | 'event' | 'meeting' | 'decision';
}

const TODAY_STRIP_ADMIN: TodayStripItem[] = [
  { id: 'ts-1', title: 'Board of Trustees Meeting', badge: 'MEETING', badgeColor: ACCENT, owner: 'President\'s Office', time: '9:00 AM', type: 'meeting' },
  { id: 'ts-2', title: 'Spring Registration Deadline', badge: 'DEADLINE', badgeColor: '#EF4444', owner: 'Registrar', time: '5:00 PM', type: 'deadline' },
  { id: 'ts-3', title: 'Faculty Senate Session', badge: 'EVENT', badgeColor: ACCENT, owner: 'Provost', time: '2:00 PM', type: 'meeting' },
  { id: 'ts-4', title: 'Accreditation Self-Study Review', badge: 'DUE TODAY', badgeColor: '#F59E0B', owner: 'Academic Affairs', time: '4:00 PM', type: 'deadline' },
  { id: 'ts-5', title: 'Financial Aid Batch Approval', badge: 'DECISION', badgeColor: '#22C55E', owner: 'Financial Aid', time: '11:00 AM', type: 'decision' },
];

const TODAY_STRIP_STUDENT: TodayStripItem[] = [
  { id: 'ts-s1', title: 'Organic Chemistry II', badge: 'CLASS', badgeColor: ACCENT, owner: 'Dr. Chen · Sci 204', time: '10:00 AM', type: 'class' },
  { id: 'ts-s2', title: 'Research Paper Due', badge: 'DEADLINE', badgeColor: '#EF4444', owner: 'ENG 302', time: '11:59 PM', type: 'deadline' },
  { id: 'ts-s3', title: 'Study Group — Linear Algebra', badge: 'EVENT', badgeColor: '#22C55E', owner: 'Library 204', time: '3:00 PM', type: 'event' },
  { id: 'ts-s4', title: 'Advising Appointment', badge: 'MEETING', badgeColor: ACCENT, owner: 'Dr. Williams', time: '1:00 PM', type: 'meeting' },
];

interface NextEvent {
  id: string;
  title: string;
  participants: string;
  countdown: string;
  readiness: string;
  readinessColor: string;
}

const NEXT_EVENT_ADMIN: NextEvent = {
  id: 'next-1',
  title: 'Commencement Planning',
  participants: 'Provost / Events',
  countdown: '5 days',
  readiness: 'On Track',
  readinessColor: '#22C55E',
};

const NEXT_EVENT_STUDENT: NextEvent = {
  id: 'next-s1',
  title: 'Midterm Exam — Biology',
  participants: 'Prof. Williams',
  countdown: '2 days',
  readiness: 'Study Needed',
  readinessColor: '#F59E0B',
};

// --- Block 2: Approvals & Decisions ---

interface ApprovalItem {
  id: string;
  title: string;
  type: 'budget' | 'hire' | 'policy' | 'financial_aid' | 'construction' | 'academic';
  requester: string;
  amount?: string;
  urgency: 'high' | 'medium' | 'low';
  submitted: string;
  sla?: string;
}

const APPROVALS: ApprovalItem[] = [
  { id: 'apr-1', title: 'Engineering Lab Equipment Purchase', type: 'budget', requester: 'Dean of Engineering', amount: '$284,000', urgency: 'high', submitted: '2d ago', sla: '48h' },
  { id: 'apr-2', title: 'Tenure-Track Faculty Hire — Biology', type: 'hire', requester: 'Provost', urgency: 'medium', submitted: '4d ago' },
  { id: 'apr-3', title: 'Financial Aid Appeal Batch (12 students)', type: 'financial_aid', requester: 'Financial Aid Director', amount: '$68,400', urgency: 'high', submitted: '1d ago', sla: '24h' },
  { id: 'apr-4', title: 'Academic Integrity Policy Revision', type: 'policy', requester: 'Faculty Senate', urgency: 'medium', submitted: '1w ago' },
  { id: 'apr-5', title: 'Library Renovation Phase 2 Contract', type: 'construction', requester: 'Facilities Director', amount: '$1.2M', urgency: 'low', submitted: '3d ago' },
  { id: 'apr-6', title: 'New Data Science Minor Approval', type: 'academic', requester: 'Dept. of Computer Science', urgency: 'medium', submitted: '5d ago' },
];

const APPROVAL_TYPE_ICON: Record<string, string> = {
  budget: 'dollarsign.circle.fill',
  hire: 'person.badge.plus',
  policy: 'doc.text.fill',
  financial_aid: 'banknote.fill',
  construction: 'hammer.fill',
  academic: 'book.fill',
};

const URGENCY_COLOR: Record<string, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#22C55E',
};

// --- Block 3: Enrollment Funnel Pulse ---

interface EnrollmentKPI {
  id: string;
  label: string;
  exactValue: string;
  bandedValue: string;
  icon: string;
  dotColor?: string;
  trend?: 'up' | 'down' | 'stable';
  trendLabel?: string;
  adminOnly?: boolean;
}

const ENROLLMENT_KPIS: EnrollmentKPI[] = [
  { id: 'total-enrollment', label: 'Enrollment', exactValue: '12,847', bandedValue: '12K–13K', icon: 'person.3.fill', trend: 'up', trendLabel: '+3.2%' },
  { id: 'retention', label: 'Retention', exactValue: '89.4%', bandedValue: '85–90%', icon: 'arrow.counterclockwise', trend: 'up', trendLabel: '+1.1%', adminOnly: true },
  { id: 'graduation-rate', label: 'Graduation', exactValue: '72.8%', bandedValue: '70–75%', icon: 'graduationcap.fill', trend: 'stable', trendLabel: '0.0%', adminOnly: true },
  { id: 'gpa-avg', label: 'Avg GPA', exactValue: '3.24', bandedValue: '3.2–3.3', icon: 'chart.bar.fill', trend: 'up', trendLabel: '+0.04' },
  { id: 'faculty-ratio', label: 'Student:Faculty', exactValue: '14:1', bandedValue: '14:1', icon: 'person.2.fill' },
  { id: 'financial-aid', label: 'Aid Rate', exactValue: '78%', bandedValue: '75–80%', icon: 'dollarsign.circle.fill', dotColor: '#22C55E', adminOnly: true },
];

interface FunnelStage {
  id: string;
  label: string;
  count: number;
  conversionPct: number;
  color: string;
}

const ENROLLMENT_FUNNEL: FunnelStage[] = [
  { id: 'fn-1', label: 'Inquiries', count: 24800, conversionPct: 100, color: ACCENT },
  { id: 'fn-2', label: 'Applications', count: 14200, conversionPct: 57, color: ACCENT },
  { id: 'fn-3', label: 'Admits', count: 8400, conversionPct: 59, color: '#22C55E' },
  { id: 'fn-4', label: 'Deposits', count: 3200, conversionPct: 38, color: '#F59E0B' },
  { id: 'fn-5', label: 'Enrolled', count: 2840, conversionPct: 89, color: ACCENT },
];

// --- Block 4: Student Success Radar ---

interface SuccessMetric {
  id: string;
  label: string;
  value: string;
  icon: string;
  color: string;
  trend?: string;
}

const SUCCESS_METRICS: SuccessMetric[] = [
  { id: 'sm-1', label: 'At-Risk Students', value: '284', icon: 'exclamationmark.triangle.fill', color: '#EF4444', trend: '-12 from last term' },
  { id: 'sm-2', label: 'On Probation', value: '142', icon: 'exclamationmark.circle.fill', color: '#F59E0B', trend: '-8 from last term' },
  { id: 'sm-3', label: 'Dean\'s List', value: '1,847', icon: 'star.fill', color: '#22C55E', trend: '+124 from last term' },
  { id: 'sm-4', label: 'Avg Credits/Student', value: '14.8', icon: 'book.fill', color: ACCENT },
  { id: 'sm-5', label: 'Advising Completion', value: '84%', icon: 'checkmark.circle.fill', color: ACCENT, trend: '+6% from last term' },
  { id: 'sm-6', label: 'Course Completion', value: '94.2%', icon: 'graduationcap.fill', color: ACCENT },
];

interface EarlyAlert {
  id: string;
  student: string;
  issue: string;
  severity: 'high' | 'medium';
  course: string;
  flaggedBy: string;
  daysAgo: number;
}

const EARLY_ALERTS: EarlyAlert[] = [
  { id: 'ea-1', student: 'Alex Morgan', issue: 'Missed 4 consecutive classes', severity: 'high', course: 'BIO 201', flaggedBy: 'Dr. Patel', daysAgo: 1 },
  { id: 'ea-2', student: 'Sarah Kim', issue: 'GPA dropped below 2.0', severity: 'high', course: 'Overall', flaggedBy: 'Academic Advising', daysAgo: 2 },
  { id: 'ea-3', student: 'Andrew Palmer', issue: 'Missing 3 assignments', severity: 'medium', course: 'ENG 302', flaggedBy: 'Prof. Johnson', daysAgo: 3 },
  { id: 'ea-4', student: 'Emily Chen', issue: 'Financial hold — payment overdue', severity: 'high', course: 'N/A', flaggedBy: 'Bursar', daysAgo: 5 },
];

// --- Block 5: Campus Operations & Safety ---

interface CampusIssue {
  id: string;
  title: string;
  type: 'facility' | 'safety' | 'maintenance' | 'it' | 'weather';
  status: 'active' | 'monitoring' | 'resolved';
  location: string;
  time: string;
  impact: 'high' | 'medium' | 'low';
}

const CAMPUS_ISSUES: CampusIssue[] = [
  { id: 'ci-1', title: 'HVAC failure — Science Building', type: 'facility', status: 'active', location: 'Science Bldg, Floors 2–3', time: '1h ago', impact: 'high' },
  { id: 'ci-2', title: 'Water main repair — South Campus', type: 'maintenance', status: 'active', location: 'South Campus Drive', time: '3h ago', impact: 'medium' },
  { id: 'ci-3', title: 'Network outage — Library Wing B', type: 'it', status: 'monitoring', location: 'Library Wing B', time: '45m ago', impact: 'medium' },
  { id: 'ci-4', title: 'Emergency drill scheduled', type: 'safety', status: 'monitoring', location: 'North Campus', time: 'Tomorrow', impact: 'low' },
  { id: 'ci-5', title: 'Parking lot repaving — Lot C', type: 'maintenance', status: 'active', location: 'Parking Lot C', time: '2d ago', impact: 'low' },
];

const ISSUE_TYPE_ICON: Record<string, string> = {
  facility: 'building.2.fill',
  safety: 'shield.fill',
  maintenance: 'wrench.fill',
  it: 'wifi.exclamationmark',
  weather: 'cloud.rain.fill',
};

const ISSUE_STATUS_COLOR: Record<string, string> = {
  active: '#EF4444',
  monitoring: '#F59E0B',
  resolved: '#22C55E',
};

interface SafetyStat {
  label: string;
  value: string;
  color: string;
}

const SAFETY_STATS: SafetyStat[] = [
  { label: 'Open Work Orders', value: '32', color: '#F59E0B' },
  { label: 'Active Incidents', value: '3', color: '#EF4444' },
  { label: 'Days Without Incident', value: '14', color: '#22C55E' },
  { label: 'Safety Score', value: '94', color: ACCENT },
];

// --- Block 6: Financial Snapshot ---

interface FinancialKPI {
  id: string;
  label: string;
  value: string;
  trend?: string;
  trendColor?: string;
  icon: string;
}

const FINANCIAL_KPIS: FinancialKPI[] = [
  { id: 'fk-1', label: 'Revenue YTD', value: '$142.8M', trend: '+4.2% vs plan', trendColor: '#22C55E', icon: 'arrow.up.circle.fill' },
  { id: 'fk-2', label: 'Expenses YTD', value: '$134.6M', trend: '-1.8% vs budget', trendColor: '#22C55E', icon: 'arrow.down.circle.fill' },
  { id: 'fk-3', label: 'Net Position', value: '+$8.2M', icon: 'chart.line.uptrend.xyaxis' },
  { id: 'fk-4', label: 'Endowment', value: '$1.28B', trend: '+8.4% YTD', trendColor: '#22C55E', icon: 'building.columns.fill' },
  { id: 'fk-5', label: 'Cash Reserves', value: '$42.8M', trend: '2.2 mo runway', icon: 'banknote.fill' },
  { id: 'fk-6', label: 'Aid Disbursed', value: '$84.1M', trend: '78% of students', icon: 'dollarsign.circle.fill' },
];

// --- Block 7: Housing Snapshot ---

interface HousingMetric {
  label: string;
  value: string;
  color: string;
}

const HOUSING_METRICS: HousingMetric[] = [
  { label: 'Total Beds', value: '3,200', color: ACCENT },
  { label: 'Occupancy', value: '93.1%', color: '#22C55E' },
  { label: 'Waitlist', value: '142', color: '#F59E0B' },
  { label: 'Open Maint.', value: '32', color: '#EF4444' },
];

interface HousingHall {
  name: string;
  occupancy: number;
  capacity: number;
  status: 'operational' | 'renovation';
}

const HOUSING_HALLS_QUICK: HousingHall[] = [
  { name: 'Eagle Village', occupancy: 720, capacity: 780, status: 'operational' },
  { name: 'Drew Hall', occupancy: 420, capacity: 450, status: 'operational' },
  { name: 'Robinson Hall', occupancy: 308, capacity: 320, status: 'operational' },
  { name: 'University Apts', occupancy: 548, capacity: 600, status: 'operational' },
  { name: 'Whitaker Hall', occupancy: 0, capacity: 240, status: 'renovation' },
];

// --- Block 8: People Coverage ---

interface CoverageMetric {
  label: string;
  filled: number;
  total: number;
  color: string;
}

const PEOPLE_COVERAGE: CoverageMetric[] = [
  { label: 'Faculty Seats', filled: 486, total: 520, color: ACCENT },
  { label: 'Staff Positions', filled: 842, total: 880, color: '#22C55E' },
  { label: 'RA Positions', filled: 54, total: 58, color: ACCENT },
  { label: 'Admin Roles', filled: 124, total: 130, color: '#F59E0B' },
];

interface OpenPosition {
  id: string;
  title: string;
  department: string;
  daysOpen: number;
  priority: 'critical' | 'high' | 'normal';
}

const OPEN_POSITIONS: OpenPosition[] = [
  { id: 'op-1', title: 'Assistant Professor — Biology', department: 'College of Sciences', daysOpen: 42, priority: 'critical' },
  { id: 'op-2', title: 'Director of Admissions', department: 'Enrollment Management', daysOpen: 28, priority: 'high' },
  { id: 'op-3', title: 'Network Engineer', department: 'IT Services', daysOpen: 21, priority: 'high' },
  { id: 'op-4', title: 'Academic Advisor (2)', department: 'Student Success', daysOpen: 14, priority: 'normal' },
  { id: 'op-5', title: 'Residence Life Coordinator', department: 'Housing', daysOpen: 35, priority: 'high' },
];

const PRIORITY_COLOR: Record<string, string> = {
  critical: '#EF4444',
  high: '#F59E0B',
  normal: '#22C55E',
};

// --- Block 9: Announcements ---

interface Announcement {
  id: string;
  text: string;
  timestamp: string;
  category: 'academic' | 'admin' | 'event' | 'safety' | 'financial' | 'athletics' | 'public';
  pinned?: boolean;
}

const ANNOUNCEMENTS: Announcement[] = [
  { id: 'an-1', text: 'Spring 2026 Dean\'s List published — 1,847 students', timestamp: '1h ago', category: 'academic', pinned: true },
  { id: 'an-2', text: 'Board of Trustees approved new engineering program', timestamp: '3h ago', category: 'admin' },
  { id: 'an-3', text: 'Men\'s basketball advances to conference semifinals', timestamp: '5h ago', category: 'athletics' },
  { id: 'an-4', text: 'Financial aid disbursement batch processed — $2.4M', timestamp: '8h ago', category: 'financial' },
  { id: 'an-5', text: 'Homecoming Week schedule finalized', timestamp: '10h ago', category: 'event' },
  { id: 'an-6', text: 'Campus safety drill completed successfully', timestamp: '12h ago', category: 'safety' },
  { id: 'an-7', text: 'New student orientation registration opens March 1', timestamp: '1d ago', category: 'public' },
  { id: 'an-8', text: 'Provost announces curriculum review timeline', timestamp: '1d ago', category: 'academic' },
  { id: 'an-9', text: 'Research grant awarded: $450K from NSF', timestamp: '2d ago', category: 'admin' },
  { id: 'an-10', text: 'Library extended hours begin for midterm week', timestamp: '2d ago', category: 'event' },
  { id: 'an-11', text: 'Title IX annual training deadline — Mar 31', timestamp: '3d ago', category: 'admin' },
  { id: 'an-12', text: 'Campus shuttle route expanded to include South Campus', timestamp: '3d ago', category: 'public' },
];

const ANNOUNCEMENT_VISIBILITY: Record<string, EducationRoleLens[]> = {
  academic: ['E1', 'E2', 'E3', 'E4'],
  admin: ['E1', 'E2'],
  event: ['E1', 'E2', 'E3', 'E4', 'E5'],
  safety: ['E1', 'E2', 'E3', 'E4', 'E5'],
  financial: ['E1', 'E2'],
  athletics: ['E1', 'E2', 'E3', 'E4', 'E5'],
  public: ['E1', 'E2', 'E3', 'E4', 'E5'],
};

function getVisibleAnnouncements(role: EducationRoleLens): Announcement[] {
  return ANNOUNCEMENTS.filter((a) => {
    const allowed = ANNOUNCEMENT_VISIBILITY[a.category];
    return allowed ? allowed.includes(role) : false;
  });
}

// =============================================================================
// SHARED SUB-COMPONENTS
// =============================================================================

function SectionHeader({ title, colors, count }: { title: string; colors: typeof Colors.light; count?: number }) {
  return (
    <View style={sh.headerRow}>
      <ThemedText style={[sh.sectionLabel, { color: colors.textSecondary }]}>{title}</ThemedText>
      {count != null && (
        <View style={[sh.countBadge, { backgroundColor: colors.backgroundTertiary }]}>
          <ThemedText style={[sh.countText, { color: colors.textSecondary }]}>{count}</ThemedText>
        </View>
      )}
    </View>
  );
}

function Card({ colors, children }: { colors: typeof Colors.light; children: React.ReactNode }) {
  return (
    <View style={[sh.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

const sh = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  sectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  countBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
  countText: { fontSize: 10, fontWeight: '600' },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: StyleSheet.hairlineWidth },
});

// =============================================================================
// BLOCK 0 — HERO VIDEO
// =============================================================================

function HeroVideoBlock({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];

  // CTA by role
  let ctaLabel = 'Open Media Center';
  if (isStudent(role)) ctaLabel = 'Watch Campus Highlights';
  else if (!isEnrolled(role)) ctaLabel = 'Watch Featured';

  return (
    <View style={s.heroContainer}>
      <Pressable
        style={({ pressed }) => [
          s.heroCard,
          { backgroundColor: '#0B0F14', opacity: pressed ? 0.9 : 1 },
        ]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        {/* PINNED badge */}
        <View style={s.pinnedBadge}>
          <IconSymbol name="pin.fill" size={10} color="#fff" />
          <ThemedText style={s.pinnedText}>PINNED</ThemedText>
        </View>

        {/* Center play icon */}
        <View style={s.playOverlay}>
          <View style={s.playCircle}>
            <IconSymbol name="play.fill" size={28} color="#fff" />
          </View>
        </View>

        {/* Duration badge */}
        <View style={s.durationBadge}>
          <ThemedText style={s.durationText}>{HERO_VIDEO.duration}</ThemedText>
        </View>

        {/* Bottom overlay — org name, term, today date */}
        <View style={s.bottomOverlay}>
          <ThemedText style={s.heroTitle} numberOfLines={2}>
            {HERO_VIDEO.title}
          </ThemedText>
          <ThemedText style={s.heroSubtitle} numberOfLines={1}>
            {HERO_VIDEO.orgName} {'\u00B7'} {HERO_VIDEO.term} {'\u00B7'} Today: {HERO_VIDEO.todayDate}
          </ThemedText>
        </View>
      </Pressable>

      {/* Announcements ticker below video */}
      {HERO_VIDEO.tickerItems.length > 0 && (
        <View style={[s.tickerRow, { backgroundColor: c.backgroundTertiary, borderColor: c.border }]}>
          <IconSymbol name="megaphone.fill" size={12} color={c.textSecondary} />
          <ThemedText style={[s.tickerText, { color: c.text }]} numberOfLines={1}>
            {HERO_VIDEO.tickerItems[0]}
          </ThemedText>
        </View>
      )}

      {/* CTA row */}
      <Pressable
        style={({ pressed }) => [
          s.heroCTARow,
          { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <IconSymbol name="play.rectangle.fill" size={16} color={c.text} />
        <ThemedText style={[s.heroCTAText, { color: c.text }]}>{ctaLabel}</ThemedText>
        <IconSymbol name="chevron.right" size={12} color={c.textSecondary} />
      </Pressable>
    </View>
  );
}

// =============================================================================
// BLOCK 1 — TODAY STRIP (COMMAND CENTER)
// =============================================================================

function TodayStrip({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const todayItems = isStudent(role) ? TODAY_STRIP_STUDENT : TODAY_STRIP_ADMIN;
  const nextEvent = isStudent(role) ? NEXT_EVENT_STUDENT : NEXT_EVENT_ADMIN;

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="TODAY + NEXT" colors={colors} />
      <View style={s.todayNextRow}>
        {/* TODAY card */}
        <View style={[s.todayCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.cardHeading, { color: colors.text }]}>Today</ThemedText>
          {todayItems.map((item) => (
            <View key={item.id} style={s.todayItem}>
              <View style={s.todayItemTop}>
                <ThemedText style={[s.todayItemTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </ThemedText>
                <View style={[s.todayBadge, { backgroundColor: item.badgeColor + '20' }]}>
                  <ThemedText style={[s.todayBadgeText, { color: item.badgeColor }]}>
                    {item.badge}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[s.todayItemMeta, { color: colors.textSecondary }]}>
                {item.owner} {'\u00B7'} {item.time}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* NEXT card */}
        <View style={[s.nextCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.cardHeading, { color: colors.text }]}>Next</ThemedText>
          <ThemedText style={[s.nextTitle, { color: colors.text }]} numberOfLines={2}>
            {nextEvent.title} {'\u2014'} {nextEvent.participants}
          </ThemedText>
          <View style={s.nextCountdownRow}>
            <IconSymbol name="clock.fill" size={12} color={colors.textSecondary} />
            <ThemedText style={[s.nextCountdown, { color: colors.text }]}>
              {nextEvent.countdown}
            </ThemedText>
          </View>
          <View style={s.nextReadinessRow}>
            <ThemedText style={[s.nextReadinessLabel, { color: colors.textSecondary }]}>
              Status:
            </ThemedText>
            <View style={[s.readinessBadge, { backgroundColor: nextEvent.readinessColor + '20' }]}>
              <ThemedText style={[s.readinessBadgeText, { color: nextEvent.readinessColor }]}>
                {nextEvent.readiness}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

// =============================================================================
// BLOCK 2 — APPROVALS & DECISIONS (E1/E2)
// =============================================================================

function ApprovalsBlock({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  if (!isDeanLevel(role)) return null;

  const items = isPresident(role) ? APPROVALS : APPROVALS.filter((a) => a.type !== 'construction' && a.type !== 'budget');

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="APPROVALS & DECISIONS" colors={colors} count={items.length} />
      <Card colors={colors}>
        {items.map((item, idx) => (
          <Pressable
            key={item.id}
            style={[
              s.approvalRow,
              idx < items.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[s.approvalIconCircle, { backgroundColor: URGENCY_COLOR[item.urgency] + '20' }]}>
              <IconSymbol name={APPROVAL_TYPE_ICON[item.type] as any} size={14} color={URGENCY_COLOR[item.urgency]} />
            </View>
            <View style={s.approvalContent}>
              <ThemedText style={[s.approvalTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <ThemedText style={[s.approvalMeta, { color: colors.textSecondary }]}>
                {item.requester} {'\u00B7'} {item.submitted}
                {item.amount ? ` \u00B7 ${item.amount}` : ''}
              </ThemedText>
            </View>
            <View style={s.approvalRight}>
              <View style={[s.urgencyBadge, { backgroundColor: URGENCY_COLOR[item.urgency] + '20' }]}>
                <ThemedText style={[s.urgencyText, { color: URGENCY_COLOR[item.urgency] }]}>
                  {item.urgency.toUpperCase()}
                </ThemedText>
              </View>
              {item.sla && (
                <ThemedText style={[s.slaBadge, { color: URGENCY_COLOR[item.urgency] }]}>
                  SLA: {item.sla}
                </ThemedText>
              )}
            </View>
          </Pressable>
        ))}
      </Card>
    </View>
  );
}

// =============================================================================
// BLOCK 3 — ENROLLMENT FUNNEL PULSE
// =============================================================================

function EnrollmentFunnelPulse({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const visibleKPIs = ENROLLMENT_KPIS.filter((kpi) => {
    if (kpi.adminOnly && !isFacultyLevel(role)) return false;
    return true;
  });

  const trendColor = (trend?: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return '#22C55E';
    if (trend === 'down') return '#EF4444';
    return colors.textSecondary;
  };

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="ENROLLMENT PULSE" colors={colors} />

      {/* KPI chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.kpiScroll}
      >
        {visibleKPIs.map((kpi) => {
          const displayValue = isDeanLevel(role) ? kpi.exactValue : kpi.bandedValue;
          return (
            <View
              key={kpi.id}
              style={[s.kpiChip, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
            >
              <View style={s.kpiChipHeader}>
                {kpi.dotColor ? (
                  <View style={[s.kpiDot, { backgroundColor: kpi.dotColor }]} />
                ) : (
                  <IconSymbol name={kpi.icon as any} size={12} color={colors.textSecondary} />
                )}
                <ThemedText style={[s.kpiChipLabel, { color: colors.textSecondary }]}>
                  {kpi.label}
                </ThemedText>
              </View>
              <ThemedText style={[s.kpiChipValue, { color: colors.text }]} numberOfLines={1}>
                {displayValue}
              </ThemedText>
              {kpi.trend && kpi.trendLabel && isDeanLevel(role) && (
                <View style={s.trendRow}>
                  <IconSymbol
                    name={kpi.trend === 'up' ? 'arrow.up.right' : kpi.trend === 'down' ? 'arrow.down.right' : 'arrow.right' as any}
                    size={10}
                    color={trendColor(kpi.trend)}
                  />
                  <ThemedText style={[s.trendText, { color: trendColor(kpi.trend) }]}>
                    {kpi.trendLabel}
                  </ThemedText>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Enrollment funnel — E1/E2 only */}
      {isDeanLevel(role) && (
        <Card colors={colors}>
          <ThemedText style={[s.funnelHeading, { color: colors.text }]}>Admissions Funnel</ThemedText>
          {ENROLLMENT_FUNNEL.map((stage, idx) => {
            const barWidth = `${Math.max(10, stage.conversionPct)}%`;
            return (
              <View key={stage.id} style={s.funnelRow}>
                <View style={s.funnelLabelCol}>
                  <ThemedText style={[s.funnelLabel, { color: colors.text }]}>{stage.label}</ThemedText>
                  <ThemedText style={[s.funnelCount, { color: colors.textSecondary }]}>
                    {stage.count.toLocaleString()}
                  </ThemedText>
                </View>
                <View style={s.funnelBarCol}>
                  <View style={[s.funnelBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                    <View style={[s.funnelBarFill, { width: barWidth as any, backgroundColor: stage.color }]} />
                  </View>
                  {idx > 0 && (
                    <ThemedText style={[s.funnelPct, { color: colors.textTertiary }]}>
                      {stage.conversionPct}% conv.
                    </ThemedText>
                  )}
                </View>
              </View>
            );
          })}
        </Card>
      )}
    </View>
  );
}

// =============================================================================
// BLOCK 4 — STUDENT SUCCESS RADAR
// =============================================================================

function StudentSuccessRadar({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  if (!isFacultyLevel(role)) return null;

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="STUDENT SUCCESS RADAR" colors={colors} />

      {/* Metrics grid */}
      <View style={s.successGrid}>
        {SUCCESS_METRICS.map((metric) => (
          <View key={metric.id} style={[s.successTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <IconSymbol name={metric.icon as any} size={16} color={metric.color} />
            <ThemedText style={[s.successValue, { color: colors.text }]}>{metric.value}</ThemedText>
            <ThemedText style={[s.successLabel, { color: colors.textSecondary }]}>{metric.label}</ThemedText>
            {metric.trend && (
              <ThemedText style={[s.successTrend, { color: colors.textTertiary }]} numberOfLines={1}>
                {metric.trend}
              </ThemedText>
            )}
          </View>
        ))}
      </View>

      {/* Early alerts — E1/E2 only */}
      {isDeanLevel(role) && (
        <Card colors={colors}>
          <ThemedText style={[s.earlyAlertHeading, { color: colors.text }]}>Early Alerts</ThemedText>
          {EARLY_ALERTS.map((alert, idx) => (
            <View
              key={alert.id}
              style={[
                s.earlyAlertRow,
                idx < EARLY_ALERTS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.earlyAlertDot, { backgroundColor: alert.severity === 'high' ? '#EF4444' : '#F59E0B' }]} />
              <View style={s.earlyAlertContent}>
                <ThemedText style={[s.earlyAlertStudent, { color: colors.text }]}>{alert.student}</ThemedText>
                <ThemedText style={[s.earlyAlertIssue, { color: colors.textSecondary }]} numberOfLines={1}>
                  {alert.issue}
                </ThemedText>
                <ThemedText style={[s.earlyAlertMeta, { color: colors.textTertiary }]}>
                  {alert.course} {'\u00B7'} Flagged by {alert.flaggedBy} {'\u00B7'} {alert.daysAgo}d ago
                </ThemedText>
              </View>
            </View>
          ))}
        </Card>
      )}
    </View>
  );
}

// =============================================================================
// BLOCK 5 — CAMPUS OPERATIONS & SAFETY
// =============================================================================

function CampusOpsBlock({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  if (!isFacultyLevel(role)) return null;

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="CAMPUS OPERATIONS & SAFETY" colors={colors} />

      {/* Safety stats strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.safetyStatsScroll}
      >
        {SAFETY_STATS.map((stat, idx) => (
          <View key={idx} style={[s.safetyStat, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[s.safetyStatValue, { color: stat.color }]}>{stat.value}</ThemedText>
            <ThemedText style={[s.safetyStatLabel, { color: colors.textSecondary }]}>{stat.label}</ThemedText>
          </View>
        ))}
      </ScrollView>

      {/* Active issues */}
      <Card colors={colors}>
        <ThemedText style={[s.issueHeading, { color: colors.text }]}>Active Issues</ThemedText>
        {CAMPUS_ISSUES.map((issue, idx) => (
          <View
            key={issue.id}
            style={[
              s.issueRow,
              idx < CAMPUS_ISSUES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={[s.issueIconCircle, { backgroundColor: ISSUE_STATUS_COLOR[issue.status] + '15' }]}>
              <IconSymbol name={ISSUE_TYPE_ICON[issue.type] as any} size={14} color={ISSUE_STATUS_COLOR[issue.status]} />
            </View>
            <View style={s.issueContent}>
              <ThemedText style={[s.issueTitle, { color: colors.text }]} numberOfLines={1}>
                {issue.title}
              </ThemedText>
              <ThemedText style={[s.issueMeta, { color: colors.textSecondary }]}>
                {issue.location} {'\u00B7'} {issue.time}
              </ThemedText>
            </View>
            <View style={[s.issueStatusBadge, { backgroundColor: ISSUE_STATUS_COLOR[issue.status] + '20' }]}>
              <View style={[s.issueStatusDot, { backgroundColor: ISSUE_STATUS_COLOR[issue.status] }]} />
              <ThemedText style={[s.issueStatusText, { color: ISSUE_STATUS_COLOR[issue.status] }]}>
                {issue.status.toUpperCase()}
              </ThemedText>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
}

// =============================================================================
// BLOCK 6 — FINANCIAL SNAPSHOT (E1/E2)
// =============================================================================

function FinancialSnapshot({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  if (!isDeanLevel(role)) return null;

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="FINANCIAL SNAPSHOT" colors={colors} />
      <View style={s.finGrid}>
        {FINANCIAL_KPIS.map((kpi) => (
          <View key={kpi.id} style={[s.finTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <IconSymbol name={kpi.icon as any} size={16} color={colors.textSecondary} />
            <ThemedText style={[s.finValue, { color: colors.text }]}>{kpi.value}</ThemedText>
            <ThemedText style={[s.finLabel, { color: colors.textSecondary }]}>{kpi.label}</ThemedText>
            {kpi.trend && (
              <ThemedText style={[s.finTrend, { color: kpi.trendColor || colors.textTertiary }]} numberOfLines={1}>
                {kpi.trend}
              </ThemedText>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

// =============================================================================
// BLOCK 7 — HOUSING SNAPSHOT
// =============================================================================

function HousingSnapshot({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  if (!isFacultyLevel(role)) return null;

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="HOUSING SNAPSHOT" colors={colors} />

      {/* Metrics strip */}
      <View style={s.housingMetricsRow}>
        {HOUSING_METRICS.map((m, idx) => (
          <View key={idx} style={s.housingMetric}>
            <ThemedText style={[s.housingMetricValue, { color: m.color }]}>{m.value}</ThemedText>
            <ThemedText style={[s.housingMetricLabel, { color: colors.textSecondary }]}>{m.label}</ThemedText>
          </View>
        ))}
      </View>

      {/* Quick hall list */}
      {isDeanLevel(role) && (
        <Card colors={colors}>
          {HOUSING_HALLS_QUICK.map((hall, idx) => {
            const pct = hall.capacity > 0 ? Math.round((hall.occupancy / hall.capacity) * 100) : 0;
            const barColor = hall.status === 'renovation' ? '#F59E0B' : pct >= 95 ? '#EF4444' : pct >= 85 ? '#F59E0B' : '#22C55E';
            return (
              <View
                key={hall.name}
                style={[
                  s.hallQuickRow,
                  idx < HOUSING_HALLS_QUICK.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={s.hallQuickContent}>
                  <ThemedText style={[s.hallQuickName, { color: colors.text }]}>{hall.name}</ThemedText>
                  <View style={[s.hallQuickBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                    <View style={[s.hallQuickBarFill, { width: `${pct}%`, backgroundColor: barColor }]} />
                  </View>
                </View>
                <ThemedText style={[s.hallQuickPct, { color: barColor }]}>
                  {hall.status === 'renovation' ? 'RENO' : `${pct}%`}
                </ThemedText>
              </View>
            );
          })}
        </Card>
      )}
    </View>
  );
}

// =============================================================================
// BLOCK 8 — PEOPLE COVERAGE
// =============================================================================

function PeopleCoverage({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  if (!isDeanLevel(role)) return null;

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="PEOPLE COVERAGE" colors={colors} />

      {/* Coverage bars */}
      <Card colors={colors}>
        {PEOPLE_COVERAGE.map((cov, idx) => {
          const pct = Math.round((cov.filled / cov.total) * 100);
          return (
            <View
              key={cov.label}
              style={[
                s.coverageRow,
                idx < PEOPLE_COVERAGE.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={s.coverageLabelCol}>
                <ThemedText style={[s.coverageLabel, { color: colors.text }]}>{cov.label}</ThemedText>
                <ThemedText style={[s.coverageCount, { color: colors.textSecondary }]}>
                  {cov.filled}/{cov.total}
                </ThemedText>
              </View>
              <View style={s.coverageBarCol}>
                <View style={[s.coverageBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                  <View style={[s.coverageBarFill, { width: `${pct}%`, backgroundColor: cov.color }]} />
                </View>
                <ThemedText style={[s.coveragePct, { color: cov.color }]}>{pct}%</ThemedText>
              </View>
            </View>
          );
        })}
      </Card>

      {/* Open positions — E1 only */}
      {isPresident(role) && (
        <Card colors={colors}>
          <ThemedText style={[s.openPosHeading, { color: colors.text }]}>Open Positions</ThemedText>
          {OPEN_POSITIONS.map((pos, idx) => (
            <View
              key={pos.id}
              style={[
                s.openPosRow,
                idx < OPEN_POSITIONS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={s.openPosContent}>
                <ThemedText style={[s.openPosTitle, { color: colors.text }]}>{pos.title}</ThemedText>
                <ThemedText style={[s.openPosDept, { color: colors.textSecondary }]}>
                  {pos.department} {'\u00B7'} {pos.daysOpen}d open
                </ThemedText>
              </View>
              <View style={[s.priorityBadge, { backgroundColor: PRIORITY_COLOR[pos.priority] + '20' }]}>
                <ThemedText style={[s.priorityText, { color: PRIORITY_COLOR[pos.priority] }]}>
                  {pos.priority.toUpperCase()}
                </ThemedText>
              </View>
            </View>
          ))}
        </Card>
      )}
    </View>
  );
}

// =============================================================================
// BLOCK 9 — ANNOUNCEMENTS
// =============================================================================

function AnnouncementsBlock({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const visibleAnnouncements = getVisibleAnnouncements(role).slice(0, 10);

  if (visibleAnnouncements.length === 0) return null;

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="ANNOUNCEMENTS" colors={colors} count={visibleAnnouncements.length} />
      <Card colors={colors}>
        {visibleAnnouncements.map((item, idx) => (
          <Pressable
            key={item.id}
            style={[
              s.announcementRow,
              idx < visibleAnnouncements.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            {item.pinned && (
              <IconSymbol name="pin.fill" size={10} color="#F59E0B" />
            )}
            <View style={s.announcementContent}>
              <ThemedText style={[s.announcementText, { color: colors.text }]} numberOfLines={1}>
                {item.text}
              </ThemedText>
              <ThemedText style={[s.announcementTime, { color: colors.textTertiary }]}>
                {item.timestamp}
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={10} color={colors.textTertiary} />
          </Pressable>
        ))}
      </Card>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function EduDashboard({ colors, role = 'E1', onSwitchTab }: Props) {
  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Block 0 — Hero Video */}
      <HeroVideoBlock colors={colors} role={role} />

      {/* Block 1 — Today Strip */}
      <TodayStrip colors={colors} role={role} />

      {/* Block 2 — Approvals & Decisions (E1/E2) */}
      <ApprovalsBlock colors={colors} role={role} />

      {/* Block 3 — Enrollment Funnel Pulse */}
      <EnrollmentFunnelPulse colors={colors} role={role} />

      {/* Block 4 — Student Success Radar (E3+) */}
      <StudentSuccessRadar colors={colors} role={role} />

      {/* Block 5 — Campus Operations & Safety (E3+) */}
      <CampusOpsBlock colors={colors} role={role} />

      {/* Block 6 — Financial Snapshot (E1/E2) */}
      <FinancialSnapshot colors={colors} role={role} />

      {/* Block 7 — Housing Snapshot (E3+) */}
      <HousingSnapshot colors={colors} role={role} />

      {/* Block 8 — People Coverage (E1/E2) */}
      <PeopleCoverage colors={colors} role={role} />

      {/* Block 9 — Announcements */}
      <AnnouncementsBlock colors={colors} role={role} />

      {/* Bottom spacer */}
      <View style={s.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  // Layout
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  moduleContainer: { marginBottom: Spacing.lg },
  bottomSpacer: { height: 120 },
  cardHeading: { fontSize: 15, fontWeight: '600', marginBottom: Spacing.sm },

  // ---- Block 0: Hero Video ----
  heroContainer: { marginBottom: Spacing.lg },
  heroCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinnedBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  pinnedText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  playOverlay: { alignItems: 'center', justifyContent: 'center' },
  playCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 50,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  durationText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  heroTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 2 },
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  tickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  tickerText: { fontSize: 12, fontWeight: '500', flex: 1 },
  heroCTARow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  heroCTAText: { fontSize: 13, fontWeight: '600', flex: 1 },

  // ---- Block 1: Today Strip ----
  todayNextRow: { flexDirection: 'row', gap: Spacing.sm },
  todayCard: { flex: 1, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: StyleSheet.hairlineWidth },
  nextCard: { flex: 1, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: StyleSheet.hairlineWidth },
  todayItem: { marginBottom: Spacing.sm },
  todayItemTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  todayItemTitle: { fontSize: 13, fontWeight: '600', flex: 1 },
  todayBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  todayBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  todayItemMeta: { fontSize: 11 },
  nextTitle: { fontSize: 13, fontWeight: '600', marginBottom: Spacing.sm, lineHeight: 18 },
  nextCountdownRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  nextCountdown: { fontSize: 14, fontWeight: '700' },
  nextReadinessRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nextReadinessLabel: { fontSize: 11 },
  readinessBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  readinessBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  // ---- Block 2: Approvals ----
  approvalRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  approvalIconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  approvalContent: { flex: 1 },
  approvalTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  approvalMeta: { fontSize: 11 },
  approvalRight: { alignItems: 'flex-end', gap: 2 },
  urgencyBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  urgencyText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  slaBadge: { fontSize: 9, fontWeight: '600' },

  // ---- Block 3: Enrollment Funnel ----
  kpiScroll: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: 2, marginBottom: Spacing.sm },
  kpiChip: { minWidth: 100, paddingHorizontal: 12, paddingVertical: 10, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth },
  kpiChipHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  kpiDot: { width: 6, height: 6, borderRadius: 3 },
  kpiChipLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' },
  kpiChipValue: { fontSize: 14, fontWeight: '700' },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  trendText: { fontSize: 10, fontWeight: '600' },
  funnelHeading: { fontSize: 13, fontWeight: '600', marginBottom: Spacing.sm },
  funnelRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: Spacing.sm },
  funnelLabelCol: { width: 90 },
  funnelLabel: { fontSize: 12, fontWeight: '600' },
  funnelCount: { fontSize: 10 },
  funnelBarCol: { flex: 1 },
  funnelBarBg: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 2 },
  funnelBarFill: { height: '100%', borderRadius: 4 },
  funnelPct: { fontSize: 9 },

  // ---- Block 4: Student Success Radar ----
  successGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  successTile: {
    width: '31%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: 4,
  },
  successValue: { fontSize: 18, fontWeight: '700' },
  successLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3, textAlign: 'center' },
  successTrend: { fontSize: 9, textAlign: 'center' },
  earlyAlertHeading: { fontSize: 13, fontWeight: '600', marginBottom: Spacing.sm },
  earlyAlertRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, gap: Spacing.sm },
  earlyAlertDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  earlyAlertContent: { flex: 1 },
  earlyAlertStudent: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  earlyAlertIssue: { fontSize: 12, marginBottom: 2 },
  earlyAlertMeta: { fontSize: 10 },

  // ---- Block 5: Campus Ops & Safety ----
  safetyStatsScroll: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: 2, marginBottom: Spacing.sm },
  safetyStat: {
    minWidth: 90,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  safetyStatValue: { fontSize: 18, fontWeight: '700' },
  safetyStatLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 2, textAlign: 'center' },
  issueHeading: { fontSize: 13, fontWeight: '600', marginBottom: Spacing.sm },
  issueRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  issueIconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  issueContent: { flex: 1 },
  issueTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  issueMeta: { fontSize: 11 },
  issueStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  issueStatusDot: { width: 5, height: 5, borderRadius: 2.5 },
  issueStatusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // ---- Block 6: Financial Snapshot ----
  finGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  finTile: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  finValue: { fontSize: 18, fontWeight: '700' },
  finLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  finTrend: { fontSize: 10 },

  // ---- Block 7: Housing Snapshot ----
  housingMetricsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.sm },
  housingMetric: { alignItems: 'center' },
  housingMetricValue: { fontSize: 18, fontWeight: '700' },
  housingMetricLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 2 },
  hallQuickRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: Spacing.sm },
  hallQuickContent: { flex: 1 },
  hallQuickName: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  hallQuickBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  hallQuickBarFill: { height: '100%', borderRadius: 3 },
  hallQuickPct: { fontSize: 12, fontWeight: '700', minWidth: 40, textAlign: 'right' },

  // ---- Block 8: People Coverage ----
  coverageRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  coverageLabelCol: { width: 110 },
  coverageLabel: { fontSize: 13, fontWeight: '600' },
  coverageCount: { fontSize: 10 },
  coverageBarCol: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  coverageBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  coverageBarFill: { height: '100%', borderRadius: 4 },
  coveragePct: { fontSize: 12, fontWeight: '700', minWidth: 36, textAlign: 'right' },
  openPosHeading: { fontSize: 13, fontWeight: '600', marginBottom: Spacing.sm },
  openPosRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  openPosContent: { flex: 1 },
  openPosTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  openPosDept: { fontSize: 11 },
  priorityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  priorityText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // ---- Block 9: Announcements ----
  announcementRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  announcementContent: { flex: 1 },
  announcementText: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
  announcementTime: { fontSize: 11 },
});
