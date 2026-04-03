/**
 * Education Hub — Lincoln University Oakland.
 * RBAC demo: President sees institution dashboard, LMS admin, analytics;
 * Student sees courses, grades, degree audit.
 *
 * Tabs (President): Dashboard / Academics / LMS Admin / Analytics
 * Tabs (Student):   My Courses / Grades / Degree Audit
 *
 * Role pair: President / Student via useDemoRole('education')
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, Pressable, ScrollView,
  StyleSheet, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useDemoRole } from '@/utils/demo-role-store';
import { useAppContext } from '@/context/app-context';
import { hideFooter, showFooter, resetFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import {
  EDUCATION_PROFILE,
  EDUCATION_ANALYTICS,
  EDUCATION_CHART_DATA,
  EDUCATION_DEPARTMENTS,
  COURSE_CATALOG,
  ADMIN_ACTIVITY,
  ACADEMIC_CALENDAR,
  getEduChartMax,
  type EduChartMetric,
} from '@/data/mock-education-hub';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H  = 52;
const PILL_ROW_H = 48;
const BAR_MAX_H  = 90;

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

type PresidentTab = 'Dashboard' | 'Academics' | 'LMS Admin' | 'Analytics';
type StudentTab   = 'My Courses' | 'Grades' | 'Degree Audit';
type AnyTab       = PresidentTab | StudentTab;

const PRESIDENT_TABS: PresidentTab[] = ['Dashboard', 'Academics', 'LMS Admin', 'Analytics'];
const STUDENT_TABS:   StudentTab[]   = ['My Courses', 'Grades', 'Degree Audit'];

// ── Mock data not in mock-education-hub ───────────────────────────────────────

const PROGRAMS = [
  { id: 'p1', name: 'BA Business Administration', enrollment: 89,  faculty: 6,  completion: 68 },
  { id: 'p2', name: 'BS Diagnostic Imaging',       enrollment: 76,  faculty: 5,  completion: 74 },
  { id: 'p3', name: 'MBA',                          enrollment: 124, faculty: 9,  completion: 71 },
  { id: 'p4', name: 'MS IBFM',                      enrollment: 98,  faculty: 7,  completion: 69 },
  { id: 'p5', name: 'DBA',                          enrollment: 49,  faculty: 4,  completion: 82 },
];

const UPCOMING_EVENTS = [
  { id: 'e1', title: 'Board Meeting',        date: 'Apr 15, 2026',    icon: 'calendar.badge.clock' },
  { id: 'e2', title: 'WSCUC Site Visit',     date: 'May 2–4, 2026',   icon: 'checkmark.seal.fill' },
  { id: 'e3', title: 'Commencement',         date: 'Jun 12, 2026',    icon: 'graduationcap.fill' },
];

const FACULTY_DIRECTORY = [
  { id: 'f1', name: 'Dr. Themistoclis Pantos', dept: 'Business Programs',        courses: 'MBA-501, BUS-301',  tenured: true,  initials: 'TP', hue: 0   },
  { id: 'f2', name: 'Ms. Marina Kay',           dept: 'Diagnostic Imaging',       courses: 'DI-201, DI-301',   tenured: true,  initials: 'MK', hue: 200 },
  { id: 'f3', name: 'Dr. Mohamed Tailab',       dept: 'Graduate Programs',        courses: 'MBA-601, DBA-701',  tenured: false, initials: 'MT', hue: 120 },
  { id: 'f4', name: 'Prof. A. Reyes',            dept: 'Business Programs',        courses: 'BUS-401',           tenured: false, initials: 'AR', hue: 40  },
  { id: 'f5', name: 'Dr. M. Brodsky',            dept: 'Graduate Programs',        courses: 'MBA-601',           tenured: true,  initials: 'MB', hue: 280 },
  { id: 'f6', name: 'Dr. Alexander Anokhin',    dept: 'QA & Accreditation',       courses: 'DBA-801',           tenured: true,  initials: 'AA', hue: 160 },
];

const ACTIVE_COURSES_LMS = [
  { id: 'lms1', code: 'BUS-401', title: 'Business Strategy',             instructor: 'Dr. Pantos',   enrolled: 28, avgGrade: 'B+', completion: 72 },
  { id: 'lms2', code: 'DI-201',  title: 'Sonographic Physics',           instructor: 'Ms. Kay',      enrolled: 18, avgGrade: 'B',  completion: 68 },
  { id: 'lms3', code: 'MBA-501', title: 'Financial Management',          instructor: 'Dr. Pantos',   enrolled: 22, avgGrade: 'A-', completion: 81 },
  { id: 'lms4', code: 'BUS-401', title: 'International Finance',         instructor: 'Prof. Reyes',  enrolled: 20, avgGrade: 'B-', completion: 60 },
  { id: 'lms5', code: 'MBA-601', title: 'DBA Research Methods',          instructor: 'Dr. Brodsky',  enrolled: 12, avgGrade: 'A',  completion: 88 },
  { id: 'lms6', code: 'DI-301',  title: 'Abdominal Sonography',          instructor: 'Ms. Kay',      enrolled: 16, avgGrade: 'B+', completion: 64 },
  { id: 'lms7', code: 'MBA-520', title: 'Global Strategy',               instructor: 'Dr. Tailab',   enrolled: 19, avgGrade: 'B',  completion: 55 },
  { id: 'lms8', code: 'DBA-701', title: 'Organizational Leadership',     instructor: 'Dr. Tailab',   enrolled: 14, avgGrade: 'A-', completion: 77 },
];

const GRADE_SUBMISSIONS = [
  { id: 'gs1', instructor: 'Dr. Pantos',  course: 'MBA-501', submitted: true  },
  { id: 'gs2', instructor: 'Ms. Kay',     course: 'DI-201',  submitted: true  },
  { id: 'gs3', instructor: 'Prof. Reyes', course: 'BUS-401', submitted: false },
  { id: 'gs4', instructor: 'Dr. Brodsky', course: 'MBA-601', submitted: true  },
  { id: 'gs5', instructor: 'Dr. Tailab',  course: 'DBA-701', submitted: false },
  { id: 'gs6', instructor: 'Dr. Anokhin', course: 'DBA-801', submitted: true  },
];

// ── Student mock data ─────────────────────────────────────────────────────────

type StudentGrade = 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+';

const MY_COURSES_DATA = [
  {
    id: 'sc1', code: 'BUS 401', title: 'Business Strategy',
    instructor: 'Prof. Johnson', schedule: 'Mon/Wed 6–8pm', room: 'Room 201',
    grade: 'A-' as StudentGrade,
    modules: [
      { id: 'm1', title: 'Week 1: Introduction',   hasRead: true, hasAssignment: true  },
      { id: 'm2', title: 'Week 2: Core Concepts',  hasRead: true, hasAssignment: true  },
      { id: 'm3', title: 'Week 3: Application',    hasRead: false, hasAssignment: false },
    ],
  },
  {
    id: 'sc2', code: 'MKT 350', title: 'Digital Marketing',
    instructor: 'Prof. Chen', schedule: 'Tue/Thu 6–8pm', room: 'Room 105',
    grade: 'B+' as StudentGrade,
    modules: [
      { id: 'm4', title: 'Week 1: Introduction',  hasRead: true, hasAssignment: true  },
      { id: 'm5', title: 'Week 2: Core Concepts', hasRead: true, hasAssignment: false },
      { id: 'm6', title: 'Week 3: Application',   hasRead: false, hasAssignment: false },
    ],
  },
  {
    id: 'sc3', code: 'MBA 520', title: 'Financial Management',
    instructor: 'Prof. Williams', schedule: 'Mon 7–9pm', room: 'Room 302',
    grade: 'A' as StudentGrade,
    modules: [
      { id: 'm7', title: 'Week 1: Introduction',  hasRead: true, hasAssignment: true  },
      { id: 'm8', title: 'Week 2: Core Concepts', hasRead: true, hasAssignment: true  },
      { id: 'm9', title: 'Week 3: Application',   hasRead: true, hasAssignment: false },
    ],
  },
  {
    id: 'sc4', code: 'MBA 510', title: 'Leadership',
    instructor: 'Prof. Davis', schedule: 'Wed 7–9pm', room: 'Room 201',
    grade: 'B' as StudentGrade,
    modules: [
      { id: 'm10', title: 'Week 1: Introduction',  hasRead: true, hasAssignment: true  },
      { id: 'm11', title: 'Week 2: Core Concepts', hasRead: false, hasAssignment: false },
      { id: 'm12', title: 'Week 3: Application',   hasRead: false, hasAssignment: false },
    ],
  },
];

const DEGREE_COURSES = [
  { id: 'dc1', code: 'MBA 500', title: 'Foundations of Business',    credits: 3, status: 'complete'    as const },
  { id: 'dc2', code: 'MBA 510', title: 'Leadership',                 credits: 3, status: 'complete'    as const },
  { id: 'dc3', code: 'MBA 515', title: 'Marketing Management',       credits: 3, status: 'complete'    as const },
  { id: 'dc4', code: 'MBA 520', title: 'Financial Management',       credits: 3, status: 'complete'    as const },
  { id: 'dc5', code: 'MKT 350', title: 'Digital Marketing',          credits: 3, status: 'in-progress' as const },
  { id: 'dc6', code: 'MBA 601', title: 'Capstone Project',           credits: 3, status: 'remaining'   as const },
];

const CUMULATIVE_GPA = '3.4';
const SPRING_GPA     = '3.6';

// ── Helpers ───────────────────────────────────────────────────────────────────

function gradeColor(grade: string, C: ComponentColors): string {
  if (grade.startsWith('A')) return GAIN;
  if (grade.startsWith('B')) return C.label;
  return HEAT;
}

function statusDotColor(status: 'complete' | 'in-progress' | 'remaining'): string {
  if (status === 'complete')    return GAIN;
  if (status === 'in-progress') return CAUTION;
  return '#E0DBD4'; // Mist
}

// ── ProgressBar ───────────────────────────────────────────────────────────────

function ProgressBar({ pct, color, height = 6 }: { pct: number; color: string; height?: number }) {
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
      <View style={{ height, borderRadius: height / 2, width: `${Math.min(100, Math.max(0, pct))}%` as any, backgroundColor: color }} />
    </View>
  );
}

// ── SecH ──────────────────────────────────────────────────────────────────────

function SecH({ title, C, marginTop = 4 }: { title: string; C: ComponentColors; marginTop?: number }) {
  return <Text style={[shS.t, { color: C.label, marginTop }]}>{title}</Text>;
}
const shS = StyleSheet.create({ t: { fontSize: 17, fontWeight: '700', marginBottom: 12 } });

// ── StatPill ──────────────────────────────────────────────────────────────────

function StatPill({ label, value, C }: { label: string; value: string; C: ComponentColors }) {
  return (
    <View style={[spS.pill, { backgroundColor: C.surface }]}>
      <Text style={[spS.value, { color: C.label }]}>{value}</Text>
      <Text style={[spS.label, { color: C.secondary }]}>{label}</Text>
    </View>
  );
}
const spS = StyleSheet.create({
  pill:  { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 },
  value: { fontSize: 20, fontWeight: '800' },
  label: { fontSize: 12 },
});

// ── MetricCard ────────────────────────────────────────────────────────────────

function MetricCard({ icon, label, value, sub, C }: {
  icon: string; label: string; value: string; sub?: string; C: ComponentColors;
}) {
  return (
    <View style={[mcS.card, { backgroundColor: C.surface }]}>
      <IconSymbol name={icon as any} size={18} color={C.secondary} />
      <Text style={[mcS.value, { color: C.label }]}>{value}</Text>
      <Text style={[mcS.label, { color: C.secondary }]}>{label}</Text>
      {sub ? <Text style={[mcS.sub, { color: C.muted }]}>{sub}</Text> : null}
    </View>
  );
}
const mcS = StyleSheet.create({
  card:  { flex: 1, borderRadius: 14, padding: 14, gap: 5, alignItems: 'flex-start' },
  value: { fontSize: 20, fontWeight: '800' },
  label: { fontSize: 12, fontWeight: '500' },
  sub:   { fontSize: 11 },
});

// ── EnrollmentBarChart ────────────────────────────────────────────────────────

function EnrollmentBarChart({ C }: { C: ComponentColors }) {
  const metric: EduChartMetric = 'enrollment';
  const max = getEduChartMax(metric);
  return (
    <View style={[ecS.wrap, { backgroundColor: C.surface }]}>
      <Text style={[ecS.chartTitle, { color: C.secondary }]}>12-Month Enrollment Trend</Text>
      <View style={ecS.bars}>
        {EDUCATION_CHART_DATA.map(pt => {
          const h = max > 0 ? Math.round((pt[metric] / max) * BAR_MAX_H) : 4;
          return (
            <View key={pt.label} style={ecS.barCol}>
              <View style={ecS.track}>
                <View style={[ecS.bar, { height: h, backgroundColor: C.accent }]} />
              </View>
              <Text style={[ecS.lbl, { color: C.muted }]}>{pt.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
const ecS = StyleSheet.create({
  wrap:       { borderRadius: 14, padding: 14, marginBottom: 16 },
  chartTitle: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  bars:       { flexDirection: 'row', alignItems: 'flex-end', height: BAR_MAX_H + 20, gap: 6 },
  barCol:     { flex: 1, alignItems: 'center', gap: 4 },
  track:      { flex: 1, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar:        { width: '75%', borderRadius: 3, minHeight: 4 },
  lbl:        { fontSize: 9, fontWeight: '500' },
});

// ── ProgramBar ────────────────────────────────────────────────────────────────

function ProgramBar({ prog, maxEnrollment, C }: {
  prog: typeof PROGRAMS[0]; maxEnrollment: number; C: ComponentColors;
}) {
  const pct = maxEnrollment > 0 ? (prog.enrollment / maxEnrollment) * 100 : 0;
  return (
    <View style={pbS.row}>
      <Text style={[pbS.name, { color: C.label }]} numberOfLines={1}>{prog.name}</Text>
      <View style={pbS.barWrap}>
        <View style={[pbS.track, { backgroundColor: C.separator }]}>
          <View style={[pbS.fill, { width: `${pct}%` as any, backgroundColor: C.accent }]} />
        </View>
        <Text style={[pbS.count, { color: C.secondary }]}>{prog.enrollment}</Text>
      </View>
    </View>
  );
}
const pbS = StyleSheet.create({
  row:    { marginBottom: 10 },
  name:   { fontSize: 13, fontWeight: '500', marginBottom: 5 },
  barWrap:{ flexDirection: 'row', alignItems: 'center', gap: 8 },
  track:  { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  fill:   { height: 8, borderRadius: 4 },
  count:  { fontSize: 13, fontWeight: '700', width: 32, textAlign: 'right' },
});

// ── FunnelBar ─────────────────────────────────────────────────────────────────

function FunnelBar({ label, count, pct, maxCount, C }: {
  label: string; count: number; pct: string; maxCount: number; C: ComponentColors;
}) {
  const barPct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <View style={fbS.row}>
      <View style={fbS.labelWrap}>
        <Text style={[fbS.label, { color: C.label }]}>{label}</Text>
        <Text style={[fbS.pct, { color: C.secondary }]}>{pct}</Text>
      </View>
      <View style={fbS.barWrap}>
        <View style={[fbS.track, { backgroundColor: C.separator }]}>
          <View style={[fbS.fill, { width: `${barPct}%` as any, backgroundColor: C.accent }]} />
        </View>
        <Text style={[fbS.count, { color: C.secondary }]}>{count}</Text>
      </View>
    </View>
  );
}
const fbS = StyleSheet.create({
  row:      { marginBottom: 12 },
  labelWrap:{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label:    { fontSize: 13, fontWeight: '600' },
  pct:      { fontSize: 12 },
  barWrap:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track:    { flex: 1, height: 10, borderRadius: 5, overflow: 'hidden' },
  fill:     { height: 10, borderRadius: 5 },
  count:    { fontSize: 13, fontWeight: '700', width: 36, textAlign: 'right' },
});

// ── CourseCard (student) ──────────────────────────────────────────────────────

function CourseCard({ course, expanded, onToggle, C }: {
  course: typeof MY_COURSES_DATA[0];
  expanded: boolean;
  onToggle: () => void;
  C: ComponentColors;
}) {
  const gc = gradeColor(course.grade, C);
  return (
    <Pressable onPress={onToggle} style={[ccS.card, { backgroundColor: C.surface }]}>
      <View style={ccS.top}>
        <View style={ccS.info}>
          <Text style={[ccS.title, { color: C.label }]}>{course.title}</Text>
          <Text style={[ccS.code, { color: C.secondary }]}>{course.code} · {course.instructor}</Text>
          <Text style={[ccS.sched, { color: C.muted }]}>{course.schedule} · {course.room}</Text>
        </View>
        <View style={ccS.right}>
          <Text style={[ccS.grade, { color: gc }]}>{course.grade}</Text>
          <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={13} color={C.muted} />
        </View>
      </View>

      {expanded && (
        <View style={[ccS.modules, { borderTopColor: C.separator }]}>
          <Text style={[ccS.modulesTitle, { color: C.label }]}>Course Modules</Text>
          {course.modules.map((mod, idx) => (
            <View
              key={mod.id}
              style={[
                ccS.modRow,
                idx < course.modules.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
            >
              <Text style={[ccS.modTitle, { color: C.label }]}>{mod.title}</Text>
              <View style={ccS.modActions}>
                <Pressable
                  style={[ccS.modBtn, { borderColor: mod.hasRead ? GAIN : C.separator }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <IconSymbol name={mod.hasRead ? 'checkmark' : 'book.closed'} size={11} color={mod.hasRead ? GAIN : C.muted} />
                  <Text style={[ccS.modBtnTxt, { color: mod.hasRead ? GAIN : C.muted }]}>Read</Text>
                </Pressable>
                <Pressable
                  style={[ccS.modBtn, { borderColor: mod.hasAssignment ? GAIN : C.separator }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <IconSymbol name={mod.hasAssignment ? 'checkmark' : 'pencil'} size={11} color={mod.hasAssignment ? GAIN : C.muted} />
                  <Text style={[ccS.modBtnTxt, { color: mod.hasAssignment ? GAIN : C.muted }]}>Assignment</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}
const ccS = StyleSheet.create({
  card:        { borderRadius: 14, padding: 14, marginBottom: 10 },
  top:         { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  info:        { flex: 1, gap: 3 },
  title:       { fontSize: 15, fontWeight: '700' },
  code:        { fontSize: 12 },
  sched:       { fontSize: 11 },
  right:       { alignItems: 'flex-end', gap: 6 },
  grade:       { fontSize: 22, fontWeight: '800' },
  modules:     { marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, gap: 4 },
  modulesTitle:{ fontSize: 13, fontWeight: '700', marginBottom: 6 },
  modRow:      { paddingVertical: 9, gap: 6 },
  modTitle:    { fontSize: 13, fontWeight: '500' },
  modActions:  { flexDirection: 'row', gap: 8 },
  modBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  modBtnTxt:   { fontSize: 11, fontWeight: '600' },
});

// ── Education Hub Screen ──────────────────────────────────────────────────────

export default function EducationHubScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ctx   = useAppContext(); // available for future org-context reads

  const [role, cycleRole, roleCycles] = useDemoRole('education');
  const isPresident = role === roleCycles[0]; // 'President'

  const defaultTab = isPresident ? 'Dashboard' : 'My Courses';

  const [activeTab, setActiveTab]         = useState<AnyTab>(defaultTab);
  const [dropdownOpen, setDropdown]       = useState(false);
  const [pillsVisible, setPillsVisible]   = useState(false);
  const [expandedCourseId, setExpandedId] = useState<string | null>(null);

  const pillsAnim  = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const topBarH    = insets.top + TOP_BAR_H;

  // Reset tab when role changes
  const prevRole = useRef(role);
  if (prevRole.current !== role) {
    prevRole.current = role;
    const next = isPresident ? 'Dashboard' : 'My Courses';
    if (activeTab !== next) {
      setActiveTab(next as AnyTab);
      setDropdown(false);
      setPillsVisible(false);
      pillsAnim.setValue(0);
    }
  }

  const tabs = isPresident ? PRESIDENT_TABS : STUDENT_TABS;

  const contentPaddingTop = topBarH + (pillsVisible ? PILL_ROW_H : 0) + 8;

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  const handleTabSelect = useCallback((tab: AnyTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    setDropdown(false);
    setPillsVisible(false);
    pillsAnim.setValue(0);
    setExpandedId(null);
  }, [pillsAnim]);

  // ── President: Dashboard ───────────────────────────────────────────────────

  const renderPresidentDashboard = () => {
    const maxProg = Math.max(...PROGRAMS.map(p => p.enrollment));
    return (
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
      >
        {/* Institution overview card */}
        <View style={[s.instCard, { backgroundColor: C.surface }]}>
          <Text style={[s.instName, { color: C.label }]}>Lincoln University</Text>
          <Text style={[s.instMeta, { color: C.secondary }]}>Oakland, California · Est. 1919</Text>
          <View style={[s.instRow, { marginTop: 8 }]}>
            <View style={[s.instBadge, { backgroundColor: C.bg }]}>
              <Text style={[s.instBadgeTxt, { color: C.secondary }]}>436 enrolled</Text>
            </View>
            <View style={[s.instBadge, { backgroundColor: C.bg }]}>
              <IconSymbol name="checkmark.seal.fill" size={12} color={GAIN} />
              <Text style={[s.instBadgeTxt, { color: GAIN }]}>WSCUC Accredited</Text>
            </View>
          </View>
        </View>

        {/* Stat pills */}
        <View style={s.statPillsRow}>
          <StatPill label="Enrollment" value="436" C={C} />
          <StatPill label="Retention" value="78%" C={C} />
          <StatPill label="Graduation" value="62%" C={C} />
        </View>

        {/* Metric cards */}
        <View style={[s.metricsRow, { marginBottom: 16 }]}>
          <MetricCard icon="dollarsign.circle.fill" label="Tuition Revenue" value="$2.1M" sub="YTD" C={C} />
          <MetricCard icon="tray.fill"              label="Applications"    value="312"   sub="this cycle" C={C} />
          <MetricCard icon="person.3.fill"          label="Faculty Count"   value="38"    C={C} />
        </View>

        {/* 12-month enrollment bar chart */}
        <EnrollmentBarChart C={C} />

        {/* Program enrollment breakdown */}
        <SecH title="Program Enrollment" C={C} />
        <View style={[s.section, { backgroundColor: C.surface, marginBottom: 16 }]}>
          {PROGRAMS.map((prog) => (
            <ProgramBar key={prog.id} prog={prog} maxEnrollment={maxProg} C={C} />
          ))}
        </View>

        {/* Upcoming events */}
        <SecH title="Upcoming Events" C={C} />
        <View style={[s.section, { backgroundColor: C.surface, gap: 0 }]}>
          {UPCOMING_EVENTS.map((ev, idx) => (
            <View
              key={ev.id}
              style={[
                s.eventRow,
                idx < UPCOMING_EVENTS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
            >
              <View style={[s.eventIconWrap, { backgroundColor: C.bg }]}>
                <IconSymbol name={ev.icon as any} size={16} color={C.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.eventTitle, { color: C.label }]}>{ev.title}</Text>
                <Text style={[s.eventDate, { color: C.secondary }]}>{ev.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // ── President: Academics ───────────────────────────────────────────────────

  const renderPresidentAcademics = () => {
    return (
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
      >
        <SecH title="Programs" C={C} />
        {PROGRAMS.map((prog) => (
          <Pressable
            key={prog.id}
            style={[s.progCard, { backgroundColor: C.surface }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.progCardTop}>
              <Text style={[s.progName, { color: C.label }]}>{prog.name}</Text>
              <View style={[s.progBadge, { backgroundColor: C.bg }]}>
                <Text style={[s.progBadgeTxt, { color: C.secondary }]}>{prog.enrollment} students</Text>
              </View>
            </View>
            <View style={s.progStats}>
              <Text style={[s.progStat, { color: C.secondary }]}>
                <Text style={{ fontWeight: '700', color: C.label }}>{prog.faculty}</Text> faculty
              </Text>
              <Text style={[s.progStat, { color: C.secondary }]}>
                <Text style={{ fontWeight: '700', color: prog.completion >= 75 ? GAIN : C.label }}>{prog.completion}%</Text> completion
              </Text>
            </View>
            <View style={{ marginTop: 8 }}>
              <ProgressBar pct={prog.completion} color={prog.completion >= 75 ? GAIN : C.accent} />
            </View>
          </Pressable>
        ))}

        <SecH title="Faculty Directory" C={C} marginTop={8} />
        <View style={[s.section, { backgroundColor: C.surface, gap: 0 }]}>
          {FACULTY_DIRECTORY.map((fac, idx) => (
            <View
              key={fac.id}
              style={[
                s.facRow,
                idx < FACULTY_DIRECTORY.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
            >
              <View style={[s.facAvatar, { backgroundColor: `hsl(${fac.hue},42%,28%)` }]}>
                <Text style={s.facInitials}>{fac.initials}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[s.facName, { color: C.label }]}>{fac.name}</Text>
                <Text style={[s.facDept, { color: C.secondary }]}>{fac.dept}</Text>
                <Text style={[s.facCourses, { color: C.muted }]}>{fac.courses}</Text>
              </View>
              {fac.tenured && (
                <View style={[s.tenureBadge, { backgroundColor: `${C.accent}18` }]}>
                  <Text style={[s.tenureTxt, { color: C.accent }]}>Tenured</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // ── President: LMS Admin ───────────────────────────────────────────────────

  const renderPresidentLMSAdmin = () => {
    return (
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
      >
        <SecH title="Active Courses" C={C} />
        {ACTIVE_COURSES_LMS.map((course) => (
          <View key={course.id} style={[s.lmsCard, { backgroundColor: C.surface }]}>
            <View style={s.lmsCardTop}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[s.lmsTitle, { color: C.label }]}>{course.title}</Text>
                <Text style={[s.lmsMeta, { color: C.secondary }]}>{course.code} · {course.instructor}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={[s.lmsGrade, { color: gradeColor(course.avgGrade, C) }]}>{course.avgGrade}</Text>
                <Text style={[s.lmsEnrolled, { color: C.muted }]}>{course.enrolled} enrolled</Text>
              </View>
            </View>
            <View style={{ marginTop: 8, gap: 3 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[s.lmsCompLbl, { color: C.muted }]}>Completion</Text>
                <Text style={[s.lmsCompPct, { color: course.completion >= 75 ? GAIN : C.accent }]}>{course.completion}%</Text>
              </View>
              <ProgressBar pct={course.completion} color={course.completion >= 75 ? GAIN : C.accent} />
            </View>
          </View>
        ))}

        <SecH title="Grade Submission Status" C={C} marginTop={8} />
        <View style={[s.section, { backgroundColor: C.surface, gap: 0 }]}>
          {GRADE_SUBMISSIONS.map((gs, idx) => (
            <View
              key={gs.id}
              style={[
                s.gsRow,
                idx < GRADE_SUBMISSIONS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
            >
              <View style={[s.gsDot, { backgroundColor: gs.submitted ? GAIN : CAUTION }]} />
              <View style={{ flex: 1 }}>
                <Text style={[s.gsInstructor, { color: C.label }]}>{gs.instructor}</Text>
                <Text style={[s.gsCourse, { color: C.secondary }]}>{gs.course}</Text>
              </View>
              <Text style={[s.gsStatus, { color: gs.submitted ? GAIN : CAUTION }]}>
                {gs.submitted ? 'Submitted' : 'Pending'}
              </Text>
            </View>
          ))}
        </View>

        {/* Create Course button */}
        <Pressable
          style={[s.createBtn, { backgroundColor: C.accent }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <IconSymbol name="plus" size={16} color="#FFFFFF" />
          <Text style={s.createBtnTxt}>Create Course</Text>
        </Pressable>
      </ScrollView>
    );
  };

  // ── President: Analytics ───────────────────────────────────────────────────

  const renderPresidentAnalytics = () => {
    const funnelSteps = [
      { label: 'Applications', count: 312, pct: '100%' },
      { label: 'Admits',       count: 187, pct: '60%'  },
      { label: 'Deposits',     count: 89,  pct: '48%'  },
      { label: 'Enrolled',     count: 436, pct: '100% (total cohort)' },
    ];
    const maxFunnel = 436;

    return (
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
      >
        {/* Enrollment funnel */}
        <SecH title="Enrollment Funnel" C={C} />
        <View style={[s.section, { backgroundColor: C.surface, marginBottom: 16 }]}>
          {funnelSteps.map((step) => (
            <FunnelBar
              key={step.label}
              label={step.label}
              count={step.count}
              pct={step.pct}
              maxCount={maxFunnel}
              C={C}
            />
          ))}
        </View>

        {/* Analytics metric cards */}
        <SecH title="Key Metrics" C={C} />
        <View style={s.metricsRow}>
          <MetricCard
            icon="exclamationmark.triangle.fill"
            label="At-Risk Students"
            value="23"
            C={C}
          />
          <MetricCard
            icon="dollarsign.circle"
            label="Financial Outstanding"
            value="$142K"
            C={C}
          />
          <MetricCard
            icon="arrow.up.right"
            label="Applications YoY"
            value="+8%"
            C={C}
          />
        </View>

        {/* Recent activity */}
        <SecH title="Recent Activity" C={C} marginTop={8} />
        <View style={[s.section, { backgroundColor: C.surface, gap: 0 }]}>
          {ADMIN_ACTIVITY.map((item, idx) => (
            <View
              key={item.id}
              style={[
                s.actRow,
                idx < ADMIN_ACTIVITY.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
            >
              <View style={[s.actIcon, { backgroundColor: C.bg }]}>
                <IconSymbol
                  name={item.icon as any}
                  size={14}
                  color={item.type === 'financial' ? GAIN : item.type === 'application' ? C.accent : C.secondary}
                />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[s.actMsg, { color: C.label }]} numberOfLines={2}>{item.message}</Text>
                <Text style={[s.actDetail, { color: C.secondary }]}>{item.detail} · {item.timeAgo}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // ── Student: My Courses ────────────────────────────────────────────────────

  const renderStudentMyCourses = () => {
    return (
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
      >
        {/* Next due highlight */}
        <View style={[s.dueCard, { backgroundColor: `${CAUTION}18`, borderColor: `${CAUTION}44` }]}>
          <View style={s.dueCardLeft}>
            <IconSymbol name="exclamationmark.circle.fill" size={16} color={CAUTION} />
            <View>
              <Text style={[s.dueCardTitle, { color: C.label }]}>MBA 520 Case Study</Text>
              <Text style={[s.dueCardSub, { color: CAUTION }]}>Due in 3 days</Text>
            </View>
          </View>
          <Pressable
            style={[s.dueCardBtn, { backgroundColor: CAUTION }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={s.dueCardBtnTxt}>Open</Text>
          </Pressable>
        </View>

        {/* Semester label */}
        <Text style={[s.semLabel, { color: C.secondary }]}>Spring 2026</Text>

        {/* Course cards */}
        {MY_COURSES_DATA.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            expanded={expandedCourseId === course.id}
            onToggle={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setExpandedId(expandedCourseId === course.id ? null : course.id);
            }}
            C={C}
          />
        ))}
      </ScrollView>
    );
  };

  // ── Student: Grades ────────────────────────────────────────────────────────

  const renderStudentGrades = () => {
    return (
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
      >
        {/* Cumulative GPA prominent display */}
        <View style={[s.gpaCard, { backgroundColor: C.surface }]}>
          <Text style={[s.gpaBig, { color: C.label }]}>{CUMULATIVE_GPA}</Text>
          <Text style={[s.gpaCardLabel, { color: C.secondary }]}>Cumulative GPA</Text>
        </View>

        {/* Spring 2026 grades */}
        <SecH title="Spring 2026" C={C} />
        <View style={[s.section, { backgroundColor: C.surface, gap: 0, marginBottom: 8 }]}>
          {MY_COURSES_DATA.map((course, idx) => {
            const gc = gradeColor(course.grade, C);
            const pctMap: Record<string, number> = { A: 100, 'A-': 93, 'B+': 88, B: 85, 'B-': 80, 'C+': 77 };
            const pct = pctMap[course.grade] ?? 85;
            return (
              <View
                key={course.id}
                style={[
                  s.gradeRow,
                  idx < MY_COURSES_DATA.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                ]}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[s.gradeCourse, { color: C.label }]}>{course.title}</Text>
                  <Text style={[s.gradeCode, { color: C.secondary }]}>{course.code}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 2 }}>
                  <Text style={[s.gradeLetter, { color: gc }]}>{course.grade}</Text>
                  <Text style={[s.gradePct, { color: C.muted }]}>{pct}%</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Running GPA */}
        <View style={[s.runningGpaRow, { backgroundColor: C.surface }]}>
          <Text style={[s.runningGpaLabel, { color: C.secondary }]}>Spring 2026 GPA</Text>
          <Text style={[s.runningGpaVal, { color: C.label }]}>{SPRING_GPA}</Text>
        </View>

        {/* Transcript request button */}
        <Pressable
          style={[s.transcriptBtn, { borderColor: C.accent }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="doc.text" size={15} color={C.accent} />
          <Text style={[s.transcriptBtnTxt, { color: C.accent }]}>Request Transcript</Text>
        </Pressable>
      </ScrollView>
    );
  };

  // ── Student: Degree Audit ──────────────────────────────────────────────────

  const renderStudentDegreeAudit = () => {
    const totalCredits   = 42;
    const completedCredits = 28;
    const pct = (completedCredits / totalCredits) * 100;

    return (
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
      >
        {/* Program header */}
        <View style={[s.auditHeader, { backgroundColor: C.surface }]}>
          <Text style={[s.auditDegree, { color: C.label }]}>MBA (Business Administration)</Text>
          <View style={s.auditProgress}>
            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[s.auditCredLabel, { color: C.secondary }]}>{completedCredits} / {totalCredits} credits completed</Text>
                <Text style={[s.auditCredPct, { color: C.accent }]}>{Math.round(pct)}%</Text>
              </View>
              <ProgressBar pct={pct} color={C.accent} height={8} />
            </View>
          </View>
          <View style={s.auditMeta}>
            <Text style={[s.auditMetaItem, { color: C.secondary }]}>
              <Text style={{ fontWeight: '600', color: C.label }}>Estimated Graduation: </Text>
              May 2027
            </Text>
          </View>
        </View>

        {/* Course rows */}
        <SecH title="Required Courses" C={C} />
        <View style={[s.section, { backgroundColor: C.surface, gap: 0 }]}>
          {DEGREE_COURSES.map((dc, idx) => (
            <View
              key={dc.id}
              style={[
                s.degreeRow,
                idx < DEGREE_COURSES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
            >
              <View style={[s.degreeDot, { backgroundColor: statusDotColor(dc.status) }]} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[s.degreeCourse, { color: C.label }]}>{dc.title}</Text>
                <Text style={[s.degreeCode, { color: C.secondary }]}>{dc.code} · {dc.credits} credits</Text>
              </View>
              <Text style={[
                s.degreeStatus,
                {
                  color: dc.status === 'complete' ? GAIN
                    : dc.status === 'in-progress' ? CAUTION
                    : C.muted,
                },
              ]}>
                {dc.status === 'complete' ? 'Complete'
                  : dc.status === 'in-progress' ? 'In Progress'
                  : 'Remaining'}
              </Text>
            </View>
          ))}
        </View>

        {/* Advisor card */}
        <SecH title="Academic Advisor" C={C} marginTop={8} />
        <View style={[s.advisorCard, { backgroundColor: C.surface }]}>
          <View style={[s.advisorAvatar, { backgroundColor: C.bg }]}>
            <Text style={[s.advisorInitials, { color: C.accent }]}>SK</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[s.advisorName, { color: C.label }]}>Dr. Sarah Kim</Text>
            <Text style={[s.advisorEmail, { color: C.secondary }]}>sarah.kim@lincolnuca.edu</Text>
          </View>
          <Pressable
            style={[s.advisorBtn, { backgroundColor: C.accent }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={s.advisorBtnTxt}>Email</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  };

  // ── Render dispatch ────────────────────────────────────────────────────────

  const renderContent = () => {
    if (isPresident) {
      if (activeTab === 'Dashboard') return renderPresidentDashboard();
      if (activeTab === 'Academics') return renderPresidentAcademics();
      if (activeTab === 'LMS Admin') return renderPresidentLMSAdmin();
      if (activeTab === 'Analytics') return renderPresidentAnalytics();
      return renderPresidentDashboard();
    }
    if (activeTab === 'My Courses')  return renderStudentMyCourses();
    if (activeTab === 'Grades')      return renderStudentGrades();
    if (activeTab === 'Degree Audit') return renderStudentDegreeAudit();
    return renderStudentMyCourses();
  };

  // ── Top bar ────────────────────────────────────────────────────────────────

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      {renderContent()}

      {/* Fixed top bar */}
      <View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg, height: topBarH }]}>
        <View style={s.topBar}>

          {/* Left: hamburger */}
          <View style={s.topBarSide}>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
              hitSlop={12}
            >
              <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
            </Pressable>
          </View>

          {/* Center: dropdown pill */}
          <View style={s.dropdownPillWrap}>
            <Pressable
              style={[s.dropdownPill, { backgroundColor: C.surfacePressed }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDropdown(v => !v); }}
            >
              <Text style={[s.dropdownPillTxt, { color: C.label }]}>{activeTab}</Text>
              <IconSymbol name="chevron.down" size={12} color={C.secondary} />
            </Pressable>
          </View>

          {/* Right: role pill */}
          <View style={[s.topBarSide, { alignItems: 'flex-end' }]}>
            <RolePill
              role={role}
              onPress={cycleRole}
              accentColor="#1A1714"
              isPrimary={isPresident}
            />
          </View>
        </View>
      </View>

      {/* Dropdown menu */}
      {dropdownOpen && (
        <>
          <Pressable style={[StyleSheet.absoluteFillObject, { zIndex: 98 }]} onPress={() => setDropdown(false)} />
          <View style={[s.dropdown, { top: insets.top + 56, backgroundColor: C.bg, borderColor: C.separator, zIndex: 99 }]}>
            {(tabs as AnyTab[]).map((tab) => (
              <Pressable key={tab} style={s.dropdownOption} onPress={() => handleTabSelect(tab)}>
                <Text style={[
                  s.dropdownOptionTxt,
                  { color: tab === activeTab ? C.label : C.secondary },
                  tab === activeTab && { fontWeight: '700' },
                ]}>
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen:           { flex: 1 },

  // Top bar
  topBarWrap:       { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, justifyContent: 'flex-end' },
  topBar:           { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide:       { width: 86, justifyContent: 'center' },
  dropdownPillWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dropdownPill:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6 },
  dropdownPillTxt:  { fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },

  // Dropdown
  dropdown: {
    position: 'absolute', left: '50%', marginLeft: -110, minWidth: 220,
    borderRadius: 14, borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 12, elevation: 8, overflow: 'hidden',
  },
  dropdownOption:    { paddingVertical: 14, paddingHorizontal: 20 },
  dropdownOptionTxt: { fontSize: 15 },

  // Shared section container
  section: { borderRadius: 16, padding: 16, marginBottom: 16 },

  // Stat pills row
  statPillsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },

  // Metrics row (3-up)
  metricsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },

  // Institution card
  instCard:    { borderRadius: 16, padding: 16, marginBottom: 16 },
  instName:    { fontSize: 20, fontWeight: '800' },
  instMeta:    { fontSize: 13, marginTop: 3 },
  instRow:     { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  instBadge:   { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  instBadgeTxt:{ fontSize: 12, fontWeight: '500' },

  // Event rows
  eventRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  eventIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  eventTitle:  { fontSize: 14, fontWeight: '600' },
  eventDate:   { fontSize: 12, marginTop: 2 },

  // Program card (Academics tab)
  progCard:    { borderRadius: 14, padding: 14, marginBottom: 10 },
  progCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  progName:    { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  progBadge:   { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  progBadgeTxt:{ fontSize: 11, fontWeight: '600' },
  progStats:   { flexDirection: 'row', gap: 16 },
  progStat:    { fontSize: 12 },

  // Faculty rows
  facRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  facAvatar:   { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  facInitials: { fontSize: 13, fontWeight: '800', color: '#fff' },
  facName:     { fontSize: 14, fontWeight: '600' },
  facDept:     { fontSize: 12 },
  facCourses:  { fontSize: 11 },
  tenureBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tenureTxt:   { fontSize: 10, fontWeight: '700' },

  // LMS card
  lmsCard:     { borderRadius: 14, padding: 14, marginBottom: 10 },
  lmsCardTop:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  lmsTitle:    { fontSize: 14, fontWeight: '700' },
  lmsMeta:     { fontSize: 12 },
  lmsGrade:    { fontSize: 18, fontWeight: '800' },
  lmsEnrolled: { fontSize: 11 },
  lmsCompLbl:  { fontSize: 11 },
  lmsCompPct:  { fontSize: 11, fontWeight: '700' },

  // Grade submission rows
  gsRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  gsDot:       { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  gsInstructor:{ fontSize: 14, fontWeight: '600' },
  gsCourse:    { fontSize: 12, marginTop: 1 },
  gsStatus:    { fontSize: 12, fontWeight: '700' },

  // Create course button
  createBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, marginTop: 4, marginBottom: 8 },
  createBtnTxt:  { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  // Analytics
  actRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  actIcon:   { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actMsg:    { fontSize: 13, fontWeight: '500' },
  actDetail: { fontSize: 11 },

  // Student: Next Due card
  dueCard:    { borderRadius: 14, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  dueCardLeft:{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  dueCardTitle: { fontSize: 14, fontWeight: '700' },
  dueCardSub:   { fontSize: 12, marginTop: 2, fontWeight: '600' },
  dueCardBtn:   { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  dueCardBtnTxt:{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' },

  // Semester label
  semLabel: { fontSize: 13, fontWeight: '600', marginBottom: 10 },

  // Grades tab
  gpaCard:      { borderRadius: 16, padding: 20, marginBottom: 16, alignItems: 'center', gap: 4 },
  gpaBig:       { fontSize: 52, fontWeight: '800', lineHeight: 60 },
  gpaCardLabel: { fontSize: 14 },

  gradeRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  gradeCourse: { fontSize: 14, fontWeight: '600' },
  gradeCode:   { fontSize: 12 },
  gradeLetter: { fontSize: 22, fontWeight: '800' },
  gradePct:    { fontSize: 11 },

  runningGpaRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 12, padding: 14, marginBottom: 16 },
  runningGpaLabel: { fontSize: 14, fontWeight: '500' },
  runningGpaVal:   { fontSize: 18, fontWeight: '800' },

  transcriptBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  transcriptBtnTxt: { fontSize: 14, fontWeight: '600' },

  // Degree Audit
  auditHeader:     { borderRadius: 16, padding: 16, marginBottom: 16, gap: 10 },
  auditDegree:     { fontSize: 17, fontWeight: '800' },
  auditProgress:   { gap: 6 },
  auditCredLabel:  { fontSize: 13 },
  auditCredPct:    { fontSize: 13, fontWeight: '700' },
  auditMeta:       { gap: 4 },
  auditMetaItem:   { fontSize: 13 },

  degreeRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 13 },
  degreeDot:    { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  degreeCourse: { fontSize: 14, fontWeight: '600' },
  degreeCode:   { fontSize: 12 },
  degreeStatus: { fontSize: 12, fontWeight: '600' },

  advisorCard:    { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, marginBottom: 16 },
  advisorAvatar:  { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  advisorInitials:{ fontSize: 15, fontWeight: '800' },
  advisorName:    { fontSize: 15, fontWeight: '700' },
  advisorEmail:   { fontSize: 12 },
  advisorBtn:     { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  advisorBtnTxt:  { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
});
