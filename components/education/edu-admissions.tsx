/**
 * Education Admissions — 4-view admissions management system.
 * Views: Pipeline | Inbox | Cohorts | Analytics
 *
 * RBAC:
 *   E1/E2 — All views, full pipeline access, analytics, yield data
 *   E3    — Pipeline (read-only) + limited analytics
 *   E4    — No access (show "Admissions Portal" CTA to apply)
 *   E5    — Limited Pipeline (public-facing stats only) + "Apply Now" CTA
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { EducationRoleLens } from '@/utils/education-rbac';
import {
  isPresident,
  isDeanLevel,
  isFacultyLevel,
  isStudent,
  isEnrolled,
} from '@/utils/education-rbac';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  role?: EducationRoleLens;
  onSwitchTab?: (index: number) => void;
}

type AdmissionsView = 'pipeline' | 'inbox' | 'cohorts' | 'analytics';

const ADMISSIONS_PILLS: { key: AdmissionsView; label: string }[] = [
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'inbox', label: 'Inbox' },
  { key: 'cohorts', label: 'Cohorts' },
  { key: 'analytics', label: 'Analytics' },
];

// =============================================================================
// INLINE MOCK DATA — PIPELINE
// =============================================================================

interface PipelineStage {
  id: string;
  label: string;
  count: number;
  color: string;
  conversionRate: number;
  weekChange: number;
  recentActivity: { name: string; action: string; time: string }[];
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'inquiry',
    label: 'Inquiry',
    count: 42850,
    color: '#1D9BF0',
    conversionRate: 43.0,
    weekChange: 384,
    recentActivity: [
      { name: 'Marcus Williams', action: 'Submitted info request', time: '12 min ago' },
      { name: 'Priya Gupta', action: 'Attended virtual tour', time: '28 min ago' },
      { name: 'Jordan Hayes', action: 'Downloaded viewbook', time: '45 min ago' },
    ],
  },
  {
    id: 'applied',
    label: 'Applied',
    count: 18420,
    color: '#1D9BF0',
    conversionRate: 91.2,
    weekChange: 342,
    recentActivity: [
      { name: 'Sofia Ramirez', action: 'Application submitted', time: '8 min ago' },
      { name: 'Derek Chen', action: 'Transcripts received', time: '1 hr ago' },
      { name: 'Amara Osei', action: 'Fee waiver approved', time: '2 hr ago' },
    ],
  },
  {
    id: 'review',
    label: 'Review',
    count: 6840,
    color: '#1D9BF0',
    conversionRate: 72.4,
    weekChange: -128,
    recentActivity: [
      { name: 'Tyler Brooks', action: 'Assigned to reviewer J. Park', time: '15 min ago' },
      { name: 'Nina Patel', action: 'Second read requested', time: '1 hr ago' },
      { name: 'Elijah Thompson', action: 'Committee review scheduled', time: '3 hr ago' },
    ],
  },
  {
    id: 'admitted',
    label: 'Admitted',
    count: 8640,
    color: '#22C55E',
    conversionRate: 47.7,
    weekChange: 216,
    recentActivity: [
      { name: 'Maya Johnson', action: 'Admit letter sent', time: '22 min ago' },
      { name: 'Liam O\'Brien', action: 'Merit scholarship offered', time: '1 hr ago' },
      { name: 'Zara Ahmed', action: 'Honors invite sent', time: '4 hr ago' },
    ],
  },
  {
    id: 'deposited',
    label: 'Deposited',
    count: 4120,
    color: '#F59E0B',
    conversionRate: 79.6,
    weekChange: 94,
    recentActivity: [
      { name: 'Caleb Washington', action: 'Deposit confirmed ($400)', time: '35 min ago' },
      { name: 'Hannah Lee', action: 'Housing preference submitted', time: '2 hr ago' },
      { name: 'David Kim', action: 'Orientation registered', time: '5 hr ago' },
    ],
  },
  {
    id: 'enrolled',
    label: 'Enrolled',
    count: 3280,
    color: '#22C55E',
    conversionRate: 100,
    weekChange: 68,
    recentActivity: [
      { name: 'Aisha Robinson', action: 'Course registration complete', time: '1 hr ago' },
      { name: 'Chris Martinez', action: 'Immunization docs uploaded', time: '3 hr ago' },
      { name: 'Fatima Al-Salem', action: 'Meal plan selected', time: '6 hr ago' },
    ],
  },
];

// Pipeline summary for public (E5)
const PUBLIC_PIPELINE_STATS = {
  totalApplicants: '18,400+',
  acceptanceRate: '46.9%',
  avgClassSize: '3,280',
  applicationDeadline: 'March 15, 2026',
  earlyActionDeadline: 'November 1, 2025',
  regularDecision: 'March 15, 2026',
  notificationDate: 'April 1, 2026',
  depositDeadline: 'May 1, 2026',
};

// =============================================================================
// INLINE MOCK DATA — INBOX
// =============================================================================

type InboxPriority = 'high' | 'medium' | 'low';
type InboxStatus = 'pending' | 'assigned' | 'in-review' | 'needs-info' | 'escalated';

interface InboxApplication {
  id: string;
  name: string;
  email: string;
  submittedDate: string;
  daysInQueue: number;
  priority: InboxPriority;
  status: InboxStatus;
  assignedReviewer: string | null;
  type: 'freshman' | 'transfer' | 'graduate' | 'international';
  gpa: number;
  testScore: string;
  flagNotes: string;
  documentsComplete: boolean;
  slaBreached: boolean;
}

const INBOX_APPLICATIONS: InboxApplication[] = [
  { id: 'app-001', name: 'Jasmine Taylor', email: 'j.taylor@email.com', submittedDate: 'Feb 12', daysInQueue: 6, priority: 'high', status: 'pending', assignedReviewer: null, type: 'freshman', gpa: 3.92, testScore: 'SAT 1420', flagNotes: 'Legacy applicant, Presidential Scholar nominee', documentsComplete: true, slaBreached: false },
  { id: 'app-002', name: 'Ryan Nakamura', email: 'r.nak@email.com', submittedDate: 'Feb 10', daysInQueue: 8, priority: 'high', status: 'escalated', assignedReviewer: 'Mark Stevens', type: 'freshman', gpa: 3.88, testScore: 'ACT 33', flagNotes: 'Recruited athlete (basketball), coach recommendation', documentsComplete: true, slaBreached: true },
  { id: 'app-003', name: 'Fatima Hassan', email: 'f.hassan@email.com', submittedDate: 'Feb 11', daysInQueue: 7, priority: 'high', status: 'in-review', assignedReviewer: 'Jenna Park', type: 'international', gpa: 3.95, testScore: 'SAT 1480', flagNotes: 'International — visa sponsorship required', documentsComplete: true, slaBreached: false },
  { id: 'app-004', name: 'Carlos Gutierrez', email: 'c.gut@email.com', submittedDate: 'Feb 13', daysInQueue: 5, priority: 'medium', status: 'assigned', assignedReviewer: 'Carlos Mendez', type: 'transfer', gpa: 3.45, testScore: 'N/A', flagNotes: 'Transfer from community college, 62 credits', documentsComplete: true, slaBreached: false },
  { id: 'app-005', name: 'Emily Richardson', email: 'e.rich@email.com', submittedDate: 'Feb 14', daysInQueue: 4, priority: 'medium', status: 'needs-info', assignedReviewer: 'Tamika Johnson', type: 'freshman', gpa: 3.67, testScore: 'SAT 1280', flagNotes: 'Missing second recommendation letter', documentsComplete: false, slaBreached: false },
  { id: 'app-006', name: 'Amir Patel', email: 'a.patel@email.com', submittedDate: 'Feb 15', daysInQueue: 3, priority: 'medium', status: 'pending', assignedReviewer: null, type: 'freshman', gpa: 3.71, testScore: 'ACT 29', flagNotes: 'First-generation, strong community service', documentsComplete: true, slaBreached: false },
  { id: 'app-007', name: 'Destiny Brown', email: 'd.brown@email.com', submittedDate: 'Feb 9', daysInQueue: 9, priority: 'high', status: 'in-review', assignedReviewer: 'Jenna Park', type: 'freshman', gpa: 4.0, testScore: 'SAT 1520', flagNotes: 'Valedictorian, full scholarship consideration', documentsComplete: true, slaBreached: true },
  { id: 'app-008', name: 'Lucas Kim', email: 'l.kim@email.com', submittedDate: 'Feb 16', daysInQueue: 2, priority: 'low', status: 'pending', assignedReviewer: null, type: 'graduate', gpa: 3.58, testScore: 'GRE 318', flagNotes: 'MS Computer Science applicant', documentsComplete: true, slaBreached: false },
  { id: 'app-009', name: 'Mia Torres', email: 's.mitchell@email.com', submittedDate: 'Feb 8', daysInQueue: 10, priority: 'high', status: 'escalated', assignedReviewer: 'Mark Stevens', type: 'freshman', gpa: 3.85, testScore: 'ACT 31', flagNotes: 'SLA breached — expedited review needed', documentsComplete: true, slaBreached: true },
  { id: 'app-010', name: 'Wei Zhang', email: 'w.zhang@email.com', submittedDate: 'Feb 14', daysInQueue: 4, priority: 'medium', status: 'assigned', assignedReviewer: 'David Okafor', type: 'international', gpa: 3.78, testScore: 'SAT 1360', flagNotes: 'International — TOEFL 108, financial docs pending', documentsComplete: false, slaBreached: false },
];

const INBOX_SUMMARY = {
  totalPending: 142,
  avgDaysInQueue: 5.8,
  slaBreaches: 18,
  needsAssignment: 34,
  needsInfo: 22,
  escalated: 8,
  reviewedToday: 47,
  targetReviewsPerDay: 60,
};

const PRIORITY_COLOR: Record<InboxPriority, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#A1A1AA',
};

const STATUS_COLOR: Record<InboxStatus, string> = {
  pending: '#A1A1AA',
  assigned: '#1D9BF0',
  'in-review': '#1D9BF0',
  'needs-info': '#F59E0B',
  escalated: '#EF4444',
};

const STATUS_LABEL: Record<InboxStatus, string> = {
  pending: 'Pending',
  assigned: 'Assigned',
  'in-review': 'In Review',
  'needs-info': 'Needs Info',
  escalated: 'Escalated',
};

// =============================================================================
// INLINE MOCK DATA — COHORTS
// =============================================================================

interface CohortDemographic {
  label: string;
  value: number;
  color: string;
}

interface DiversityTarget {
  label: string;
  target: number;
  actual: number;
  color: string;
}

interface Cohort {
  id: string;
  name: string;
  term: string;
  targetSize: number;
  currentSize: number;
  admitted: number;
  deposited: number;
  yieldProjection: number;
  avgGPA: number;
  avgSAT: number;
  meltRate: number;
  demographics: CohortDemographic[];
  diversityTargets: DiversityTarget[];
  topStates: { state: string; count: number }[];
}

const COHORTS: Cohort[] = [
  {
    id: 'cohort-f26',
    name: 'Fall 2026 Freshman',
    term: 'Fall 2026',
    targetSize: 3400,
    currentSize: 3280,
    admitted: 8640,
    deposited: 4120,
    yieldProjection: 37.9,
    avgGPA: 3.67,
    avgSAT: 1280,
    meltRate: 4.8,
    demographics: [
      { label: 'In-State', value: 58, color: '#1D9BF0' },
      { label: 'Out-of-State', value: 31, color: '#1D9BF0' },
      { label: 'International', value: 11, color: '#22C55E' },
    ],
    diversityTargets: [
      { label: 'First-Generation', target: 35, actual: 34, color: '#F59E0B' },
      { label: 'Underrepresented Minority', target: 30, actual: 28, color: '#1D9BF0' },
      { label: 'Pell Eligible', target: 25, actual: 23, color: '#1D9BF0' },
      { label: 'Rural/Underserved', target: 15, actual: 12, color: '#22C55E' },
      { label: 'STEM Interest', target: 40, actual: 42, color: '#1D9BF0' },
    ],
    topStates: [
      { state: 'Georgia', count: 1240 },
      { state: 'Tennessee', count: 380 },
      { state: 'North Carolina', count: 290 },
      { state: 'South Carolina', count: 245 },
      { state: 'Texas', count: 210 },
      { state: 'California', count: 185 },
      { state: 'New York', count: 165 },
      { state: 'Virginia', count: 142 },
    ],
  },
  {
    id: 'cohort-s27',
    name: 'Spring 2027 Transfer',
    term: 'Spring 2027',
    targetSize: 420,
    currentSize: 186,
    admitted: 580,
    deposited: 248,
    yieldProjection: 32.1,
    avgGPA: 3.42,
    avgSAT: 0,
    meltRate: 6.2,
    demographics: [
      { label: 'In-State', value: 72, color: '#1D9BF0' },
      { label: 'Out-of-State', value: 24, color: '#1D9BF0' },
      { label: 'International', value: 4, color: '#22C55E' },
    ],
    diversityTargets: [
      { label: 'First-Generation', target: 40, actual: 38, color: '#F59E0B' },
      { label: 'Underrepresented Minority', target: 32, actual: 30, color: '#1D9BF0' },
      { label: 'Pell Eligible', target: 30, actual: 28, color: '#1D9BF0' },
      { label: 'Community College', target: 65, actual: 68, color: '#22C55E' },
      { label: 'STEM Interest', target: 35, actual: 31, color: '#1D9BF0' },
    ],
    topStates: [
      { state: 'Georgia', count: 134 },
      { state: 'Alabama', count: 18 },
      { state: 'Tennessee', count: 12 },
      { state: 'Tennessee', count: 8 },
    ],
  },
];

// =============================================================================
// INLINE MOCK DATA — ANALYTICS
// =============================================================================

interface YoYTrend {
  year: string;
  applications: number;
  admitted: number;
  enrolled: number;
  acceptRate: number;
  yieldRate: number;
}

const YOY_TRENDS: YoYTrend[] = [
  { year: '2021-22', applications: 12840, admitted: 6820, enrolled: 2680, acceptRate: 53.1, yieldRate: 39.3 },
  { year: '2022-23', applications: 14260, admitted: 7180, enrolled: 2840, acceptRate: 50.3, yieldRate: 39.6 },
  { year: '2023-24', applications: 15890, admitted: 7640, enrolled: 2960, acceptRate: 48.1, yieldRate: 38.7 },
  { year: '2024-25', applications: 17020, admitted: 8120, enrolled: 3120, acceptRate: 47.7, yieldRate: 38.4 },
  { year: '2025-26', applications: 18420, admitted: 8640, enrolled: 3280, acceptRate: 46.9, yieldRate: 37.9 },
];

const GEOGRAPHIC_DISTRIBUTION = [
  { region: 'Southeast', percentage: 48, count: 8840, color: '#1D9BF0' },
  { region: 'Northeast', percentage: 18, count: 3316, color: '#1D9BF0' },
  { region: 'Midwest', percentage: 12, count: 2210, color: '#22C55E' },
  { region: 'West', percentage: 10, count: 1842, color: '#F59E0B' },
  { region: 'Southwest', percentage: 6, count: 1105, color: '#1D9BF0' },
  { region: 'International', percentage: 6, count: 1107, color: '#1D9BF0' },
];

const TOP_FEEDER_SCHOOLS = [
  { id: 'fs-1', name: 'Westlake High School', city: 'Nashville, TN', applicants: 42, admitted: 28, enrolled: 18 },
  { id: 'fs-2', name: 'North Gwinnett High School', city: 'Suwanee, GA', applicants: 38, admitted: 22, enrolled: 14 },
  { id: 'fs-3', name: 'Brookwood High School', city: 'Snellville, GA', applicants: 35, admitted: 20, enrolled: 12 },
  { id: 'fs-4', name: 'Peachtree Ridge High School', city: 'Suwanee, GA', applicants: 32, admitted: 18, enrolled: 11 },
  { id: 'fs-5', name: 'South Forsyth High School', city: 'Cumming, GA', applicants: 30, admitted: 19, enrolled: 13 },
  { id: 'fs-6', name: 'Wheeler High School', city: 'Marietta, GA', applicants: 28, admitted: 16, enrolled: 10 },
  { id: 'fs-7', name: 'Hillgrove High School', city: 'Powder Springs, GA', applicants: 26, admitted: 15, enrolled: 9 },
  { id: 'fs-8', name: 'Milton High School', city: 'Milton, GA', applicants: 25, admitted: 17, enrolled: 12 },
  { id: 'fs-9', name: 'Lassiter High School', city: 'Marietta, GA', applicants: 24, admitted: 14, enrolled: 8 },
  { id: 'fs-10', name: 'Lambert High School', city: 'Suwanee, GA', applicants: 22, admitted: 13, enrolled: 9 },
];

const ANALYTICS_SUMMARY = {
  totalApps: 18420,
  yoyGrowth: '+8.2%',
  admitRate: 46.9,
  yieldRate: 37.9,
  medianGPA: 3.67,
  medianSAT: 1280,
  medianACT: 28,
  firstGenPct: 34,
  pellEligiblePct: 23,
  diversityIndex: 0.82,
  outOfStatePct: 42,
  internationalPct: 11.5,
  avgAidPackage: '$28,400',
  totalAidAwarded: '$86.4M',
};

const APPLICATION_BY_MONTH = [
  { month: 'Sep', count: 820 },
  { month: 'Oct', count: 2140 },
  { month: 'Nov', count: 4680 },
  { month: 'Dec', count: 3420 },
  { month: 'Jan', count: 4860 },
  { month: 'Feb', count: 2500 },
];

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
// VIEW: PIPELINE
// =============================================================================

function PipelineView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  // E5 sees public-facing stats only
  if (role === 'E5') {
    return (
      <View style={s.viewContainer}>
        <SectionHeader title="ADMISSIONS AT A GLANCE" colors={colors} />
        <Card colors={colors}>
          <View style={s.statsGrid}>
            <View style={s.statBox}>
              <ThemedText style={[s.statValue, { color: colors.text }]}>{PUBLIC_PIPELINE_STATS.totalApplicants}</ThemedText>
              <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Applicants</ThemedText>
            </View>
            <View style={s.statBox}>
              <ThemedText style={[s.statValue, { color: colors.text }]}>{PUBLIC_PIPELINE_STATS.acceptanceRate}</ThemedText>
              <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Accept Rate</ThemedText>
            </View>
            <View style={s.statBox}>
              <ThemedText style={[s.statValue, { color: colors.text }]}>{PUBLIC_PIPELINE_STATS.avgClassSize}</ThemedText>
              <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Class Size</ThemedText>
            </View>
          </View>
        </Card>

        <SectionHeader title="KEY DATES" colors={colors} />
        <Card colors={colors}>
          {[
            { label: 'Early Action', date: PUBLIC_PIPELINE_STATS.earlyActionDeadline },
            { label: 'Regular Decision', date: PUBLIC_PIPELINE_STATS.regularDecision },
            { label: 'Notification', date: PUBLIC_PIPELINE_STATS.notificationDate },
            { label: 'Enrollment Deposit', date: PUBLIC_PIPELINE_STATS.depositDeadline },
          ].map((item, idx) => (
            <View
              key={item.label}
              style={[s.dateRow, idx < 3 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
            >
              <ThemedText style={[s.dateLabel, { color: colors.textSecondary }]}>{item.label}</ThemedText>
              <ThemedText style={[s.dateValue, { color: colors.text }]}>{item.date}</ThemedText>
            </View>
          ))}
        </Card>

        <Pressable
          style={({ pressed }) => [s.ctaButton, { backgroundColor: '#1D9BF0', opacity: pressed ? 0.8 : 1 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <IconSymbol name="pencil.and.outline" size={16} color="#FFFFFF" />
          <ThemedText style={s.ctaText}>Apply Now</ThemedText>
        </Pressable>
      </View>
    );
  }

  // E3 sees read-only pipeline
  const isReadOnly = isFacultyLevel(role) && !isDeanLevel(role);

  return (
    <View style={s.viewContainer}>
      {/* Pipeline overview stats */}
      {isDeanLevel(role) && (
        <>
          <SectionHeader title="PIPELINE OVERVIEW" colors={colors} />
          <Card colors={colors}>
            <View style={s.statsGrid}>
              <View style={s.statBox}>
                <ThemedText style={[s.statValue, { color: colors.text }]}>42,850</ThemedText>
                <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Inquiries</ThemedText>
                <ThemedText style={[s.statChange, { color: '#22C55E' }]}>+12% YoY</ThemedText>
              </View>
              <View style={s.statBox}>
                <ThemedText style={[s.statValue, { color: colors.text }]}>18,420</ThemedText>
                <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Applied</ThemedText>
                <ThemedText style={[s.statChange, { color: '#22C55E' }]}>+8.2% YoY</ThemedText>
              </View>
              <View style={s.statBox}>
                <ThemedText style={[s.statValue, { color: colors.text }]}>3,280</ThemedText>
                <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Enrolled</ThemedText>
                <ThemedText style={[s.statChange, { color: '#22C55E' }]}>+4.2% YoY</ThemedText>
              </View>
              <View style={s.statBox}>
                <ThemedText style={[s.statValue, { color: colors.text }]}>46.9%</ThemedText>
                <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Accept Rate</ThemedText>
              </View>
              <View style={s.statBox}>
                <ThemedText style={[s.statValue, { color: colors.text }]}>37.9%</ThemedText>
                <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Yield Rate</ThemedText>
              </View>
              <View style={s.statBox}>
                <ThemedText style={[s.statValue, { color: colors.text }]}>6,840</ThemedText>
                <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>In Review</ThemedText>
              </View>
            </View>
          </Card>
        </>
      )}

      {/* Kanban-style pipeline stages */}
      <SectionHeader title={isReadOnly ? 'PIPELINE STAGES (READ-ONLY)' : 'PIPELINE STAGES'} colors={colors} count={PIPELINE_STAGES.length} />
      {PIPELINE_STAGES.map((stage) => {
        const isExpanded = expandedStage === stage.id;
        return (
          <Pressable
            key={stage.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setExpandedStage(isExpanded ? null : stage.id);
            }}
          >
            <Card colors={colors}>
              <View style={s.stageHeader}>
                <View style={[s.stageDot, { backgroundColor: stage.color }]} />
                <View style={s.stageInfo}>
                  <ThemedText style={[s.stageLabel, { color: colors.text }]}>{stage.label}</ThemedText>
                  <ThemedText style={[s.stageCount, { color: colors.textSecondary }]}>
                    {stage.count.toLocaleString()} candidates
                  </ThemedText>
                </View>
                <View style={s.stageRight}>
                  {isDeanLevel(role) && (
                    <View style={s.stageMetrics}>
                      <ThemedText style={[s.conversionRate, { color: stage.color }]}>
                        {stage.conversionRate}%
                      </ThemedText>
                      <ThemedText style={[s.conversionLabel, { color: colors.textTertiary }]}>conv.</ThemedText>
                    </View>
                  )}
                  <ThemedText style={[s.weekChange, { color: stage.weekChange >= 0 ? '#22C55E' : '#EF4444' }]}>
                    {stage.weekChange >= 0 ? '+' : ''}{stage.weekChange}/wk
                  </ThemedText>
                </View>
                <IconSymbol
                  name={isExpanded ? 'chevron.up' : 'chevron.down' as any}
                  size={14}
                  color={colors.textTertiary}
                />
              </View>

              {/* Stage progress bar */}
              <View style={s.stageBarContainer}>
                <View style={[s.stageBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                  <View
                    style={[
                      s.stageBarFill,
                      {
                        width: `${Math.min((stage.count / PIPELINE_STAGES[0].count) * 100, 100)}%`,
                        backgroundColor: stage.color,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Expanded: recent activity */}
              {isExpanded && isDeanLevel(role) && (
                <View style={s.activityContainer}>
                  <View style={[s.divider, { backgroundColor: colors.border }]} />
                  <ThemedText style={[s.activityTitle, { color: colors.textSecondary }]}>Recent Activity</ThemedText>
                  {stage.recentActivity.map((activity, idx) => (
                    <View key={idx} style={s.activityRow}>
                      <View style={[s.activityDot, { backgroundColor: stage.color + '60' }]} />
                      <View style={s.activityContent}>
                        <ThemedText style={[s.activityName, { color: colors.text }]}>{activity.name}</ThemedText>
                        <ThemedText style={[s.activityAction, { color: colors.textSecondary }]}>{activity.action}</ThemedText>
                      </View>
                      <ThemedText style={[s.activityTime, { color: colors.textTertiary }]}>{activity.time}</ThemedText>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          </Pressable>
        );
      })}

      {/* Overall funnel conversion */}
      {isDeanLevel(role) && (
        <>
          <SectionHeader title="FUNNEL CONVERSION" colors={colors} />
          <Card colors={colors}>
            <View style={s.conversionChain}>
              {PIPELINE_STAGES.map((stage, idx) => (
                <React.Fragment key={stage.id}>
                  <View style={s.conversionNode}>
                    <View style={[s.conversionCircle, { borderColor: stage.color }]}>
                      <ThemedText style={[s.conversionPct, { color: stage.color }]}>
                        {Math.round((stage.count / PIPELINE_STAGES[0].count) * 100)}%
                      </ThemedText>
                    </View>
                    <ThemedText style={[s.conversionNodeLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                      {stage.label}
                    </ThemedText>
                  </View>
                  {idx < PIPELINE_STAGES.length - 1 && (
                    <View style={[s.conversionArrow, { backgroundColor: colors.textTertiary }]} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </Card>
        </>
      )}
    </View>
  );
}

// =============================================================================
// VIEW: INBOX
// =============================================================================

function InboxView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [filterStatus, setFilterStatus] = useState<InboxStatus | 'all'>('all');

  const filtered = filterStatus === 'all'
    ? INBOX_APPLICATIONS
    : INBOX_APPLICATIONS.filter((a) => a.status === filterStatus);

  return (
    <View style={s.viewContainer}>
      {/* Inbox summary */}
      <SectionHeader title="INBOX TRIAGE" colors={colors} />
      <Card colors={colors}>
        <View style={s.statsGrid}>
          <View style={s.statBox}>
            <ThemedText style={[s.statValue, { color: colors.text }]}>{INBOX_SUMMARY.totalPending}</ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Pending</ThemedText>
          </View>
          <View style={s.statBox}>
            <ThemedText style={[s.statValue, { color: INBOX_SUMMARY.slaBreaches > 10 ? '#EF4444' : colors.text }]}>
              {INBOX_SUMMARY.slaBreaches}
            </ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>SLA Breaches</ThemedText>
          </View>
          <View style={s.statBox}>
            <ThemedText style={[s.statValue, { color: colors.text }]}>{INBOX_SUMMARY.avgDaysInQueue}d</ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Avg Queue</ThemedText>
          </View>
          <View style={s.statBox}>
            <ThemedText style={[s.statValue, { color: colors.text }]}>{INBOX_SUMMARY.needsAssignment}</ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Unassigned</ThemedText>
          </View>
          <View style={s.statBox}>
            <ThemedText style={[s.statValue, { color: colors.text }]}>{INBOX_SUMMARY.needsInfo}</ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Needs Info</ThemedText>
          </View>
          <View style={s.statBox}>
            <ThemedText style={[s.statValue, { color: colors.text }]}>
              {INBOX_SUMMARY.reviewedToday}/{INBOX_SUMMARY.targetReviewsPerDay}
            </ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Today</ThemedText>
          </View>
        </View>

        {/* Progress toward daily target */}
        <View style={s.dailyProgress}>
          <View style={[s.progressBarBg, { backgroundColor: colors.backgroundTertiary }]}>
            <View
              style={[
                s.progressBarFill,
                {
                  width: `${Math.min((INBOX_SUMMARY.reviewedToday / INBOX_SUMMARY.targetReviewsPerDay) * 100, 100)}%`,
                  backgroundColor: INBOX_SUMMARY.reviewedToday >= INBOX_SUMMARY.targetReviewsPerDay ? '#22C55E' : '#1D9BF0',
                },
              ]}
            />
          </View>
          <ThemedText style={[s.progressLabel, { color: colors.textTertiary }]}>
            {Math.round((INBOX_SUMMARY.reviewedToday / INBOX_SUMMARY.targetReviewsPerDay) * 100)}% of daily review target
          </ThemedText>
        </View>
      </Card>

      {/* Status filter pills */}
      <View style={s.filterRow}>
        {(['all', 'pending', 'assigned', 'in-review', 'needs-info', 'escalated'] as const).map((status) => {
          const isActive = filterStatus === status;
          const label = status === 'all' ? 'All' : STATUS_LABEL[status as InboxStatus];
          return (
            <Pressable
              key={status}
              style={[
                s.filterPill,
                { backgroundColor: isActive ? colors.text + 'E0' : colors.backgroundSecondary },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFilterStatus(status);
              }}
            >
              <ThemedText style={[s.filterPillText, { color: isActive ? colors.background : colors.textSecondary }]}>
                {label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Application list */}
      <SectionHeader title="APPLICATIONS" colors={colors} count={filtered.length} />
      {filtered.map((app) => (
        <Card key={app.id} colors={colors}>
          <View style={s.inboxHeader}>
            <View style={s.inboxNameRow}>
              <View style={[s.priorityDot, { backgroundColor: PRIORITY_COLOR[app.priority] }]} />
              <ThemedText style={[s.inboxName, { color: colors.text }]}>{app.name}</ThemedText>
              {app.slaBreached && (
                <View style={[s.slaBadge, { backgroundColor: '#EF444420' }]}>
                  <ThemedText style={[s.slaText, { color: '#EF4444' }]}>SLA</ThemedText>
                </View>
              )}
            </View>
            <View style={[s.statusBadge, { backgroundColor: STATUS_COLOR[app.status] + '20' }]}>
              <ThemedText style={[s.statusText, { color: STATUS_COLOR[app.status] }]}>
                {STATUS_LABEL[app.status]}
              </ThemedText>
            </View>
          </View>

          <View style={s.inboxDetails}>
            <View style={s.inboxDetailRow}>
              <ThemedText style={[s.inboxDetailLabel, { color: colors.textTertiary }]}>Type</ThemedText>
              <ThemedText style={[s.inboxDetailValue, { color: colors.textSecondary }]}>
                {app.type.charAt(0).toUpperCase() + app.type.slice(1)}
              </ThemedText>
            </View>
            <View style={s.inboxDetailRow}>
              <ThemedText style={[s.inboxDetailLabel, { color: colors.textTertiary }]}>GPA</ThemedText>
              <ThemedText style={[s.inboxDetailValue, { color: colors.textSecondary }]}>{app.gpa}</ThemedText>
            </View>
            <View style={s.inboxDetailRow}>
              <ThemedText style={[s.inboxDetailLabel, { color: colors.textTertiary }]}>Test</ThemedText>
              <ThemedText style={[s.inboxDetailValue, { color: colors.textSecondary }]}>{app.testScore}</ThemedText>
            </View>
            <View style={s.inboxDetailRow}>
              <ThemedText style={[s.inboxDetailLabel, { color: colors.textTertiary }]}>Queue</ThemedText>
              <ThemedText style={[s.inboxDetailValue, { color: app.daysInQueue >= 7 ? '#EF4444' : colors.textSecondary }]}>
                {app.daysInQueue}d
              </ThemedText>
            </View>
          </View>

          {app.assignedReviewer && (
            <View style={s.reviewerRow}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.reviewerText, { color: colors.textTertiary }]}>
                Reviewer: {app.assignedReviewer}
              </ThemedText>
            </View>
          )}

          <ThemedText style={[s.flagNotes, { color: colors.textSecondary }]} numberOfLines={2}>
            {app.flagNotes}
          </ThemedText>

          {!app.documentsComplete && (
            <View style={[s.missingDocsBadge, { backgroundColor: '#F59E0B20' }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={11} color="#F59E0B" />
              <ThemedText style={[s.missingDocsText, { color: '#F59E0B' }]}>Documents incomplete</ThemedText>
            </View>
          )}

          <ThemedText style={[s.inboxSubmitted, { color: colors.textTertiary }]}>
            Submitted {app.submittedDate}
          </ThemedText>
        </Card>
      ))}
    </View>
  );
}

// =============================================================================
// VIEW: COHORTS
// =============================================================================

function CohortsView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  return (
    <View style={s.viewContainer}>
      {COHORTS.map((cohort) => {
        const fillPct = Math.round((cohort.currentSize / cohort.targetSize) * 100);
        const onTrack = fillPct >= 85;

        return (
          <View key={cohort.id} style={s.cohortBlock}>
            <SectionHeader title={cohort.name.toUpperCase()} colors={colors} />

            {/* Cohort summary card */}
            <Card colors={colors}>
              <View style={s.cohortHeaderRow}>
                <ThemedText style={[s.cohortTerm, { color: colors.text }]}>{cohort.term}</ThemedText>
                <View style={[s.trackBadge, { backgroundColor: onTrack ? '#22C55E20' : '#F59E0B20' }]}>
                  <ThemedText style={[s.trackText, { color: onTrack ? '#22C55E' : '#F59E0B' }]}>
                    {onTrack ? 'On Track' : 'Behind Target'}
                  </ThemedText>
                </View>
              </View>

              <View style={s.statsGrid}>
                <View style={s.statBox}>
                  <ThemedText style={[s.statValue, { color: colors.text }]}>{cohort.targetSize.toLocaleString()}</ThemedText>
                  <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Target</ThemedText>
                </View>
                <View style={s.statBox}>
                  <ThemedText style={[s.statValue, { color: colors.text }]}>{cohort.currentSize.toLocaleString()}</ThemedText>
                  <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Current</ThemedText>
                </View>
                <View style={s.statBox}>
                  <ThemedText style={[s.statValue, { color: colors.text }]}>{cohort.admitted.toLocaleString()}</ThemedText>
                  <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Admitted</ThemedText>
                </View>
                <View style={s.statBox}>
                  <ThemedText style={[s.statValue, { color: colors.text }]}>{cohort.deposited.toLocaleString()}</ThemedText>
                  <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Deposited</ThemedText>
                </View>
                <View style={s.statBox}>
                  <ThemedText style={[s.statValue, { color: colors.text }]}>{cohort.yieldProjection}%</ThemedText>
                  <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Yield Proj.</ThemedText>
                </View>
                <View style={s.statBox}>
                  <ThemedText style={[s.statValue, { color: colors.text }]}>{cohort.meltRate}%</ThemedText>
                  <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Melt Rate</ThemedText>
                </View>
              </View>

              {/* Fill progress */}
              <View style={s.cohortProgress}>
                <View style={s.cohortProgressHeader}>
                  <ThemedText style={[s.cohortProgressLabel, { color: colors.textSecondary }]}>Enrollment Progress</ThemedText>
                  <ThemedText style={[s.cohortProgressPct, { color: colors.text }]}>{fillPct}%</ThemedText>
                </View>
                <View style={[s.progressBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                  <View style={[s.progressBarFill, { width: `${fillPct}%`, backgroundColor: onTrack ? '#22C55E' : '#F59E0B' }]} />
                </View>
              </View>

              {/* Academics */}
              {cohort.avgSAT > 0 && (
                <View style={s.cohortAcademics}>
                  <ThemedText style={[s.cohortAcademicsText, { color: colors.textSecondary }]}>
                    Avg GPA: {cohort.avgGPA} {'\u00B7'} Avg SAT: {cohort.avgSAT}
                  </ThemedText>
                </View>
              )}
            </Card>

            {/* Demographics breakdown */}
            <Card colors={colors}>
              <ThemedText style={[s.cardTitle, { color: colors.text }]}>Geographic Breakdown</ThemedText>
              {cohort.demographics.map((demo) => (
                <View key={demo.label} style={s.demoRow}>
                  <View style={s.demoLabelContainer}>
                    <View style={[s.demoDot, { backgroundColor: demo.color }]} />
                    <ThemedText style={[s.demoLabel, { color: colors.textSecondary }]}>{demo.label}</ThemedText>
                  </View>
                  <View style={s.demoBarContainer}>
                    <View style={[s.demoBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                      <View style={[s.demoBarFill, { width: `${demo.value}%`, backgroundColor: demo.color }]} />
                    </View>
                  </View>
                  <ThemedText style={[s.demoPct, { color: colors.text }]}>{demo.value}%</ThemedText>
                </View>
              ))}
            </Card>

            {/* Diversity targets */}
            {isDeanLevel(role) && (
              <Card colors={colors}>
                <ThemedText style={[s.cardTitle, { color: colors.text }]}>Diversity Targets</ThemedText>
                {cohort.diversityTargets.map((dt) => {
                  const met = dt.actual >= dt.target;
                  return (
                    <View key={dt.label} style={s.diversityRow}>
                      <View style={s.diversityLabelContainer}>
                        <ThemedText style={[s.diversityLabel, { color: colors.textSecondary }]}>{dt.label}</ThemedText>
                      </View>
                      <View style={s.diversityBarContainer}>
                        <View style={[s.diversityBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                          {/* Target marker */}
                          <View style={[s.diversityTargetMarker, { left: `${dt.target}%`, backgroundColor: colors.textTertiary }]} />
                          {/* Actual fill */}
                          <View style={[s.diversityBarFill, { width: `${dt.actual}%`, backgroundColor: met ? '#22C55E' : dt.color }]} />
                        </View>
                      </View>
                      <View style={s.diversityValues}>
                        <ThemedText style={[s.diversityActual, { color: met ? '#22C55E' : dt.color }]}>{dt.actual}%</ThemedText>
                        <ThemedText style={[s.diversityTarget, { color: colors.textTertiary }]}>/ {dt.target}%</ThemedText>
                      </View>
                    </View>
                  );
                })}
              </Card>
            )}

            {/* Top states */}
            <Card colors={colors}>
              <ThemedText style={[s.cardTitle, { color: colors.text }]}>Top Feeder States</ThemedText>
              {cohort.topStates.map((st, idx) => (
                <View
                  key={st.state}
                  style={[
                    s.feederRow,
                    idx < cohort.topStates.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                  ]}
                >
                  <ThemedText style={[s.feederRank, { color: colors.textTertiary }]}>{idx + 1}</ThemedText>
                  <ThemedText style={[s.feederState, { color: colors.text }]}>{st.state}</ThemedText>
                  <ThemedText style={[s.feederCount, { color: colors.textSecondary }]}>{st.count}</ThemedText>
                </View>
              ))}
            </Card>
          </View>
        );
      })}
    </View>
  );
}

// =============================================================================
// VIEW: ANALYTICS
// =============================================================================

function AnalyticsView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  // E3 gets limited analytics
  const isLimited = isFacultyLevel(role) && !isDeanLevel(role);

  return (
    <View style={s.viewContainer}>
      {/* Summary metrics */}
      <SectionHeader title="KEY METRICS" colors={colors} />
      <Card colors={colors}>
        <View style={s.statsGrid}>
          <View style={s.statBox}>
            <ThemedText style={[s.statValue, { color: colors.text }]}>{ANALYTICS_SUMMARY.totalApps.toLocaleString()}</ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Applications</ThemedText>
            <ThemedText style={[s.statChange, { color: '#22C55E' }]}>{ANALYTICS_SUMMARY.yoyGrowth}</ThemedText>
          </View>
          <View style={s.statBox}>
            <ThemedText style={[s.statValue, { color: colors.text }]}>{ANALYTICS_SUMMARY.admitRate}%</ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Admit Rate</ThemedText>
          </View>
          <View style={s.statBox}>
            <ThemedText style={[s.statValue, { color: colors.text }]}>{ANALYTICS_SUMMARY.yieldRate}%</ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Yield Rate</ThemedText>
          </View>
        </View>
        {!isLimited && (
          <View style={s.statsGrid}>
            <View style={s.statBox}>
              <ThemedText style={[s.statValue, { color: colors.text }]}>{ANALYTICS_SUMMARY.medianGPA}</ThemedText>
              <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Median GPA</ThemedText>
            </View>
            <View style={s.statBox}>
              <ThemedText style={[s.statValue, { color: colors.text }]}>{ANALYTICS_SUMMARY.medianSAT}</ThemedText>
              <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Median SAT</ThemedText>
            </View>
            <View style={s.statBox}>
              <ThemedText style={[s.statValue, { color: colors.text }]}>{ANALYTICS_SUMMARY.medianACT}</ThemedText>
              <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Median ACT</ThemedText>
            </View>
          </View>
        )}
      </Card>

      {/* YoY Trends table */}
      <SectionHeader title="APPLICATION TRENDS (5-YEAR)" colors={colors} />
      <Card colors={colors}>
        {/* Header row */}
        <View style={s.trendHeaderRow}>
          <ThemedText style={[s.trendHeaderCell, s.trendYearCol, { color: colors.textTertiary }]}>Year</ThemedText>
          <ThemedText style={[s.trendHeaderCell, s.trendNumCol, { color: colors.textTertiary }]}>Apps</ThemedText>
          <ThemedText style={[s.trendHeaderCell, s.trendNumCol, { color: colors.textTertiary }]}>Admit</ThemedText>
          <ThemedText style={[s.trendHeaderCell, s.trendNumCol, { color: colors.textTertiary }]}>Enroll</ThemedText>
          <ThemedText style={[s.trendHeaderCell, s.trendPctCol, { color: colors.textTertiary }]}>Rate</ThemedText>
          {!isLimited && (
            <ThemedText style={[s.trendHeaderCell, s.trendPctCol, { color: colors.textTertiary }]}>Yield</ThemedText>
          )}
        </View>
        {YOY_TRENDS.map((trend, idx) => {
          const isCurrent = idx === YOY_TRENDS.length - 1;
          return (
            <View
              key={trend.year}
              style={[
                s.trendRow,
                isCurrent && { backgroundColor: colors.backgroundTertiary },
                idx < YOY_TRENDS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <ThemedText style={[s.trendCell, s.trendYearCol, { color: isCurrent ? colors.text : colors.textSecondary, fontWeight: isCurrent ? '700' : '400' }]}>
                {trend.year}
              </ThemedText>
              <ThemedText style={[s.trendCell, s.trendNumCol, { color: colors.text }]}>
                {(trend.applications / 1000).toFixed(1)}K
              </ThemedText>
              <ThemedText style={[s.trendCell, s.trendNumCol, { color: colors.text }]}>
                {(trend.admitted / 1000).toFixed(1)}K
              </ThemedText>
              <ThemedText style={[s.trendCell, s.trendNumCol, { color: colors.text }]}>
                {(trend.enrolled / 1000).toFixed(1)}K
              </ThemedText>
              <ThemedText style={[s.trendCell, s.trendPctCol, { color: colors.text }]}>
                {trend.acceptRate}%
              </ThemedText>
              {!isLimited && (
                <ThemedText style={[s.trendCell, s.trendPctCol, { color: colors.text }]}>
                  {trend.yieldRate}%
                </ThemedText>
              )}
            </View>
          );
        })}
      </Card>

      {/* Application volume by month */}
      {!isLimited && (
        <>
          <SectionHeader title="APPLICATIONS BY MONTH" colors={colors} />
          <Card colors={colors}>
            {APPLICATION_BY_MONTH.map((month) => {
              const maxCount = Math.max(...APPLICATION_BY_MONTH.map((m) => m.count));
              const barPct = Math.round((month.count / maxCount) * 100);
              return (
                <View key={month.month} style={s.monthRow}>
                  <ThemedText style={[s.monthLabel, { color: colors.textSecondary }]}>{month.month}</ThemedText>
                  <View style={s.monthBarContainer}>
                    <View style={[s.monthBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                      <View style={[s.monthBarFill, { width: `${barPct}%`, backgroundColor: '#1D9BF0' }]} />
                    </View>
                  </View>
                  <ThemedText style={[s.monthCount, { color: colors.text }]}>{month.count.toLocaleString()}</ThemedText>
                </View>
              );
            })}
          </Card>
        </>
      )}

      {/* Geographic distribution */}
      <SectionHeader title="GEOGRAPHIC DISTRIBUTION" colors={colors} />
      <Card colors={colors}>
        {GEOGRAPHIC_DISTRIBUTION.map((geo) => (
          <View key={geo.region} style={s.geoRow}>
            <View style={s.geoLabelContainer}>
              <View style={[s.geoDot, { backgroundColor: geo.color }]} />
              <ThemedText style={[s.geoLabel, { color: colors.textSecondary }]}>{geo.region}</ThemedText>
            </View>
            <View style={s.geoBarContainer}>
              <View style={[s.geoBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                <View style={[s.geoBarFill, { width: `${geo.percentage}%`, backgroundColor: geo.color }]} />
              </View>
            </View>
            <View style={s.geoValues}>
              <ThemedText style={[s.geoPct, { color: colors.text }]}>{geo.percentage}%</ThemedText>
              {!isLimited && (
                <ThemedText style={[s.geoCount, { color: colors.textTertiary }]}>{geo.count.toLocaleString()}</ThemedText>
              )}
            </View>
          </View>
        ))}
      </Card>

      {/* Applicant profile (admin) */}
      {isDeanLevel(role) && (
        <>
          <SectionHeader title="APPLICANT PROFILE" colors={colors} />
          <Card colors={colors}>
            <View style={s.profileGrid}>
              <View style={s.profileItem}>
                <ThemedText style={[s.profileValue, { color: colors.text }]}>{ANALYTICS_SUMMARY.firstGenPct}%</ThemedText>
                <ThemedText style={[s.profileLabel, { color: colors.textSecondary }]}>First-Gen</ThemedText>
              </View>
              <View style={s.profileItem}>
                <ThemedText style={[s.profileValue, { color: colors.text }]}>{ANALYTICS_SUMMARY.pellEligiblePct}%</ThemedText>
                <ThemedText style={[s.profileLabel, { color: colors.textSecondary }]}>Pell Eligible</ThemedText>
              </View>
              <View style={s.profileItem}>
                <ThemedText style={[s.profileValue, { color: colors.text }]}>{ANALYTICS_SUMMARY.outOfStatePct}%</ThemedText>
                <ThemedText style={[s.profileLabel, { color: colors.textSecondary }]}>Out-of-State</ThemedText>
              </View>
              <View style={s.profileItem}>
                <ThemedText style={[s.profileValue, { color: colors.text }]}>{ANALYTICS_SUMMARY.internationalPct}%</ThemedText>
                <ThemedText style={[s.profileLabel, { color: colors.textSecondary }]}>International</ThemedText>
              </View>
              <View style={s.profileItem}>
                <ThemedText style={[s.profileValue, { color: colors.text }]}>{ANALYTICS_SUMMARY.diversityIndex}</ThemedText>
                <ThemedText style={[s.profileLabel, { color: colors.textSecondary }]}>Diversity Idx</ThemedText>
              </View>
              <View style={s.profileItem}>
                <ThemedText style={[s.profileValue, { color: colors.text }]}>{ANALYTICS_SUMMARY.avgAidPackage}</ThemedText>
                <ThemedText style={[s.profileLabel, { color: colors.textSecondary }]}>Avg Aid Pkg</ThemedText>
              </View>
            </View>
          </Card>
        </>
      )}

      {/* Top feeder schools (admin) */}
      {isDeanLevel(role) && (
        <>
          <SectionHeader title="TOP FEEDER SCHOOLS" colors={colors} count={TOP_FEEDER_SCHOOLS.length} />
          <Card colors={colors}>
            {/* Table header */}
            <View style={s.feederSchoolHeader}>
              <ThemedText style={[s.feederSchoolRank, { color: colors.textTertiary }]}>#</ThemedText>
              <ThemedText style={[s.feederSchoolName, { color: colors.textTertiary }]}>School</ThemedText>
              <ThemedText style={[s.feederSchoolNum, { color: colors.textTertiary }]}>Apps</ThemedText>
              <ThemedText style={[s.feederSchoolNum, { color: colors.textTertiary }]}>Adm</ThemedText>
              <ThemedText style={[s.feederSchoolNum, { color: colors.textTertiary }]}>Enr</ThemedText>
            </View>
            {TOP_FEEDER_SCHOOLS.map((school, idx) => (
              <View
                key={school.id}
                style={[
                  s.feederSchoolRow,
                  idx < TOP_FEEDER_SCHOOLS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <ThemedText style={[s.feederSchoolRank, { color: colors.textTertiary }]}>{idx + 1}</ThemedText>
                <View style={s.feederSchoolNameCol}>
                  <ThemedText style={[s.feederSchoolNameText, { color: colors.text }]} numberOfLines={1}>{school.name}</ThemedText>
                  <ThemedText style={[s.feederSchoolCity, { color: colors.textTertiary }]}>{school.city}</ThemedText>
                </View>
                <ThemedText style={[s.feederSchoolNum, { color: colors.textSecondary }]}>{school.applicants}</ThemedText>
                <ThemedText style={[s.feederSchoolNum, { color: colors.textSecondary }]}>{school.admitted}</ThemedText>
                <ThemedText style={[s.feederSchoolNum, { color: colors.textSecondary }]}>{school.enrolled}</ThemedText>
              </View>
            ))}
          </Card>
        </>
      )}

      {/* Financial aid summary (admin) */}
      {isDeanLevel(role) && (
        <>
          <SectionHeader title="FINANCIAL AID IMPACT" colors={colors} />
          <Card colors={colors}>
            <View style={s.statsGrid}>
              <View style={s.statBox}>
                <ThemedText style={[s.statValue, { color: colors.text }]}>{ANALYTICS_SUMMARY.totalAidAwarded}</ThemedText>
                <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Total Awarded</ThemedText>
              </View>
              <View style={s.statBox}>
                <ThemedText style={[s.statValue, { color: colors.text }]}>{ANALYTICS_SUMMARY.avgAidPackage}</ThemedText>
                <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Avg Package</ThemedText>
              </View>
              <View style={s.statBox}>
                <ThemedText style={[s.statValue, { color: colors.text }]}>{ANALYTICS_SUMMARY.pellEligiblePct}%</ThemedText>
                <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Pell Eligible</ThemedText>
              </View>
            </View>
          </Card>
        </>
      )}
    </View>
  );
}

// =============================================================================
// STUDENT CTA (E4)
// =============================================================================

function StudentPortalCTA({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={s.ctaContainer}>
      <Card colors={colors}>
        <View style={s.ctaContent}>
          <IconSymbol name="doc.text.fill" size={40} color={colors.textSecondary} />
          <ThemedText style={[s.ctaTitle, { color: colors.text }]}>Admissions Portal</ThemedText>
          <ThemedText style={[s.ctaDescription, { color: colors.textSecondary }]}>
            Check your application status, submit documents, and track your admissions journey.
          </ThemedText>
          <Pressable
            style={({ pressed }) => [s.ctaButton, { backgroundColor: '#1D9BF0', opacity: pressed ? 0.8 : 1 }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <IconSymbol name="arrow.right" size={14} color="#FFFFFF" />
            <ThemedText style={s.ctaText}>Open Admissions Portal</ThemedText>
          </Pressable>
        </View>
      </Card>

      <Card colors={colors}>
        <ThemedText style={[s.cardTitle, { color: colors.text }]}>Your Status</ThemedText>
        <View style={s.statusTimeline}>
          {[
            { label: 'Application Submitted', complete: true, date: 'Jan 15, 2026' },
            { label: 'Documents Received', complete: true, date: 'Jan 22, 2026' },
            { label: 'Under Review', complete: false, date: 'In Progress' },
            { label: 'Decision Released', complete: false, date: 'Expected Apr 1' },
          ].map((step, idx) => (
            <View key={step.label} style={s.timelineRow}>
              <View style={s.timelineIconCol}>
                <View style={[s.timelineCircle, { backgroundColor: step.complete ? '#22C55E' : colors.backgroundTertiary, borderColor: step.complete ? '#22C55E' : colors.border }]}>
                  {step.complete && <IconSymbol name="checkmark" size={10} color="#FFFFFF" />}
                </View>
                {idx < 3 && <View style={[s.timelineLine, { backgroundColor: step.complete ? '#22C55E' : colors.border }]} />}
              </View>
              <View style={s.timelineContent}>
                <ThemedText style={[s.timelineLabel, { color: step.complete ? colors.text : colors.textSecondary }]}>{step.label}</ThemedText>
                <ThemedText style={[s.timelineDate, { color: colors.textTertiary }]}>{step.date}</ThemedText>
              </View>
            </View>
          ))}
        </View>
      </Card>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function EduAdmissions({ colors, role = 'E1', onSwitchTab }: Props) {
  const [activeView, setActiveView] = useState<AdmissionsView>('pipeline');

  // E4 students see the portal CTA, no view toggle
  if (isStudent(role)) {
    return (
      <ScrollView
        style={[s.container, { backgroundColor: colors.background }]}
        contentContainerStyle={s.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <StudentPortalCTA colors={colors} />
        <View style={s.bottomSpacer} />
      </ScrollView>
    );
  }

  // Determine which pills to show based on role
  const visiblePills = role === 'E5'
    ? ADMISSIONS_PILLS.filter((p) => p.key === 'pipeline')
    : isFacultyLevel(role) && !isDeanLevel(role)
      ? ADMISSIONS_PILLS.filter((p) => p.key === 'pipeline' || p.key === 'analytics')
      : ADMISSIONS_PILLS;

  // Reset active view if current view not available for role
  const effectiveView = visiblePills.some((p) => p.key === activeView) ? activeView : visiblePills[0].key;

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      {/* Pill toggle row */}
      {visiblePills.length > 1 && (
        <View style={s.pillRow}>
          {visiblePills.map((pill) => {
            const isActive = effectiveView === pill.key;
            return (
              <Pressable
                key={pill.key}
                style={[s.pill, { backgroundColor: isActive ? colors.text + 'E0' : colors.backgroundSecondary }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveView(pill.key);
                }}
              >
                <ThemedText style={[s.pillText, { color: isActive ? colors.background : colors.textSecondary }]}>
                  {pill.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      )}

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {effectiveView === 'pipeline' && <PipelineView colors={colors} role={role} />}
        {effectiveView === 'inbox' && <InboxView colors={colors} role={role} />}
        {effectiveView === 'cohorts' && <CohortsView colors={colors} role={role} />}
        {effectiveView === 'analytics' && <AnalyticsView colors={colors} role={role} />}
        <View style={s.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  viewContainer: { gap: Spacing.sm },
  bottomSpacer: { height: 120 },

  // Pill toggle
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Stats grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  statBox: { width: '30%', alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  statChange: { fontSize: 10, fontWeight: '600', marginTop: 2 },

  divider: { height: StyleSheet.hairlineWidth, marginVertical: Spacing.sm },
  cardTitle: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.sm },

  // Pipeline stages
  stageHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stageDot: { width: 10, height: 10, borderRadius: 5 },
  stageInfo: { flex: 1 },
  stageLabel: { fontSize: 15, fontWeight: '700' },
  stageCount: { fontSize: 12 },
  stageRight: { alignItems: 'flex-end', marginRight: 4 },
  stageMetrics: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  conversionRate: { fontSize: 14, fontWeight: '700' },
  conversionLabel: { fontSize: 9 },
  weekChange: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  stageBarContainer: { marginTop: Spacing.sm },
  stageBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  stageBarFill: { height: '100%', borderRadius: 3 },

  // Activity (expanded)
  activityContainer: { marginTop: Spacing.xs },
  activityTitle: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 8 },
  activityDot: { width: 6, height: 6, borderRadius: 3 },
  activityContent: { flex: 1 },
  activityName: { fontSize: 13, fontWeight: '600' },
  activityAction: { fontSize: 11 },
  activityTime: { fontSize: 10 },

  // Conversion chain
  conversionChain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.sm },
  conversionNode: { alignItems: 'center', width: 46 },
  conversionCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  conversionPct: { fontSize: 9, fontWeight: '700' },
  conversionNodeLabel: { fontSize: 8, fontWeight: '600', marginTop: 3, textAlign: 'center' },
  conversionArrow: { width: 8, height: 1, marginHorizontal: 1, marginBottom: 14 },

  // Public dates
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  dateLabel: { fontSize: 13 },
  dateValue: { fontSize: 13, fontWeight: '600' },

  // CTA button
  ctaContainer: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  ctaContent: { alignItems: 'center', paddingVertical: Spacing.lg, gap: Spacing.sm },
  ctaTitle: { fontSize: 20, fontWeight: '700' },
  ctaDescription: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: Spacing.md },
  ctaButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: BorderRadius.lg, marginTop: Spacing.sm },
  ctaText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  // Student timeline
  statusTimeline: { gap: 0 },
  timelineRow: { flexDirection: 'row', gap: Spacing.sm },
  timelineIconCol: { alignItems: 'center', width: 24 },
  timelineCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  timelineLine: { width: 1.5, flex: 1, marginVertical: 2 },
  timelineContent: { flex: 1, paddingBottom: Spacing.md },
  timelineLabel: { fontSize: 14, fontWeight: '600' },
  timelineDate: { fontSize: 12, marginTop: 2 },

  // Progress bar
  dailyProgress: { marginTop: Spacing.xs },
  progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressBarFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: 11 },

  // Inbox filter pills
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm },
  filterPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full },
  filterPillText: { fontSize: 11, fontWeight: '600' },

  // Inbox cards
  inboxHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  inboxNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  inboxName: { fontSize: 15, fontWeight: '700' },
  slaBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: BorderRadius.sm },
  slaText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  statusText: { fontSize: 10, fontWeight: '700' },
  inboxDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.xs },
  inboxDetailRow: { flexDirection: 'row', gap: 4, alignItems: 'baseline' },
  inboxDetailLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3 },
  inboxDetailValue: { fontSize: 12, fontWeight: '600' },
  reviewerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, marginBottom: 2 },
  reviewerText: { fontSize: 11 },
  flagNotes: { fontSize: 12, lineHeight: 16, marginTop: 4 },
  missingDocsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.sm, marginTop: 6, alignSelf: 'flex-start' },
  missingDocsText: { fontSize: 10, fontWeight: '600' },
  inboxSubmitted: { fontSize: 10, marginTop: 6 },

  // Cohort
  cohortBlock: { marginBottom: Spacing.md },
  cohortHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  cohortTerm: { fontSize: 16, fontWeight: '700' },
  trackBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  trackText: { fontSize: 11, fontWeight: '600' },
  cohortProgress: { marginTop: Spacing.xs },
  cohortProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cohortProgressLabel: { fontSize: 12 },
  cohortProgressPct: { fontSize: 14, fontWeight: '700' },
  cohortAcademics: { marginTop: Spacing.sm },
  cohortAcademicsText: { fontSize: 12, textAlign: 'center' },

  // Demographics
  demoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 8 },
  demoLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 100 },
  demoDot: { width: 8, height: 8, borderRadius: 4 },
  demoLabel: { fontSize: 12 },
  demoBarContainer: { flex: 1 },
  demoBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  demoBarFill: { height: '100%', borderRadius: 4 },
  demoPct: { fontSize: 13, fontWeight: '700', width: 40, textAlign: 'right' },

  // Diversity targets
  diversityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 10 },
  diversityLabelContainer: { width: 110 },
  diversityLabel: { fontSize: 11 },
  diversityBarContainer: { flex: 1 },
  diversityBarBg: { height: 8, borderRadius: 4, overflow: 'hidden', position: 'relative' },
  diversityTargetMarker: { position: 'absolute', top: 0, width: 2, height: '100%', zIndex: 1 },
  diversityBarFill: { height: '100%', borderRadius: 4 },
  diversityValues: { flexDirection: 'row', alignItems: 'baseline', gap: 2, width: 60 },
  diversityActual: { fontSize: 12, fontWeight: '700' },
  diversityTarget: { fontSize: 9 },

  // Feeder states
  feederRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: Spacing.sm },
  feederRank: { fontSize: 11, width: 18, textAlign: 'center' },
  feederState: { fontSize: 13, fontWeight: '600', flex: 1 },
  feederCount: { fontSize: 13, fontWeight: '600' },

  // Analytics trends table
  trendHeaderRow: { flexDirection: 'row', paddingBottom: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#2F3336' },
  trendHeaderCell: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  trendRow: { flexDirection: 'row', paddingVertical: 8, borderRadius: BorderRadius.sm },
  trendCell: { fontSize: 12 },
  trendYearCol: { width: 65 },
  trendNumCol: { width: 50, textAlign: 'right' },
  trendPctCol: { width: 48, textAlign: 'right' },

  // Application by month
  monthRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 8 },
  monthLabel: { fontSize: 12, width: 32 },
  monthBarContainer: { flex: 1 },
  monthBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  monthBarFill: { height: '100%', borderRadius: 4 },
  monthCount: { fontSize: 12, fontWeight: '600', width: 44, textAlign: 'right' },

  // Geographic distribution
  geoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 8 },
  geoLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 100 },
  geoDot: { width: 8, height: 8, borderRadius: 4 },
  geoLabel: { fontSize: 12 },
  geoBarContainer: { flex: 1 },
  geoBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  geoBarFill: { height: '100%', borderRadius: 4 },
  geoValues: { width: 55, alignItems: 'flex-end' },
  geoPct: { fontSize: 12, fontWeight: '700' },
  geoCount: { fontSize: 9 },

  // Applicant profile
  profileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  profileItem: { width: '30%', alignItems: 'center', paddingVertical: 4 },
  profileValue: { fontSize: 16, fontWeight: '700' },
  profileLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 2 },

  // Top feeder schools table
  feederSchoolHeader: { flexDirection: 'row', alignItems: 'center', paddingBottom: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#2F3336' },
  feederSchoolRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  feederSchoolRank: { fontSize: 11, width: 22, textAlign: 'center' },
  feederSchoolName: { flex: 1, fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  feederSchoolNameCol: { flex: 1 },
  feederSchoolNameText: { fontSize: 13, fontWeight: '600' },
  feederSchoolCity: { fontSize: 10, marginTop: 1 },
  feederSchoolNum: { fontSize: 12, fontWeight: '600', width: 38, textAlign: 'right' },
});
