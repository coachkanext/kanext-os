/**
 * Campus Screen — Lincoln University education mode.
 * RBAC pair: President (admin) / Student via useDemoRole('education').
 *
 * President: full People directory with Students / Faculty / Staff tabs,
 *   GPA, status badges, financial standing, admin record sheets.
 * Student: read-only directory — faculty/staff name + dept + email icon,
 *   peer names + program only (no GPA/financial), own profile card.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  Linking,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { useDemoRole } from '@/utils/demo-role-store';
import { hideFooter, showFooter, resetFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import { KMenuButton } from '@/components/ui/k-menu-button';

// ── Types ─────────────────────────────────────────────────────────────────────

type PeopleTab = 'Students' | 'Faculty' | 'Staff';
type StudentStatus = 'Active' | 'Academic Probation' | 'Financial Hold';
type TenureStatus = 'Tenured' | 'Tenure-Track' | 'Adjunct';

interface Student {
  id: string;
  name: string;
  program: string;
  classYear: string;
  gpa: number;
  status: StudentStatus;
  creditsCompleted: number;
  advisor: string;
  enrollmentDate: string;
  financialStanding: string;
}

interface FacultyMember {
  id: string;
  name: string;
  title: string;
  department: string;
  coursesThisSemester: number;
  tenureStatus: TenureStatus;
  officeHours: string;
  email: string;
  courses: string[];
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
}

// ── Static Data ────────────────────────────────────────────────────────────────

const STUDENTS: Student[] = [
  {
    id: 's1',
    name: 'Marcus Johnson',
    program: 'MBA',
    classYear: '2nd yr',
    gpa: 3.8,
    status: 'Active',
    creditsCompleted: 36,
    advisor: 'Dr. Patricia Johnson',
    enrollmentDate: 'Aug 2023',
    financialStanding: 'Good Standing',
  },
  {
    id: 's2',
    name: 'Aisha Williams',
    program: 'BS DiagImaging',
    classYear: '3rd yr',
    gpa: 3.2,
    status: 'Active',
    creditsCompleted: 72,
    advisor: 'Dr. Robert Chen',
    enrollmentDate: 'Aug 2022',
    financialStanding: 'Good Standing',
  },
  {
    id: 's3',
    name: 'David Chen',
    program: 'DBA',
    classYear: '2nd yr',
    gpa: 3.6,
    status: 'Active',
    creditsCompleted: 30,
    advisor: 'Dr. Ahmad Hassan',
    enrollmentDate: 'Aug 2023',
    financialStanding: 'Good Standing',
  },
  {
    id: 's4',
    name: 'Fatima Okafor',
    program: 'MBA',
    classYear: '1st yr',
    gpa: 2.9,
    status: 'Academic Probation',
    creditsCompleted: 12,
    advisor: 'Dr. Sarah Kim',
    enrollmentDate: 'Jan 2024',
    financialStanding: 'Good Standing',
  },
  {
    id: 's5',
    name: 'James Wilson',
    program: 'MS IBFM',
    classYear: '2nd yr',
    gpa: 3.5,
    status: 'Active',
    creditsCompleted: 24,
    advisor: 'Dr. Patricia Johnson',
    enrollmentDate: 'Aug 2023',
    financialStanding: 'Good Standing',
  },
  {
    id: 's6',
    name: 'Priya Patel',
    program: 'BA BusAdmin',
    classYear: '4th yr',
    gpa: 3.7,
    status: 'Active',
    creditsCompleted: 105,
    advisor: 'Prof. Linda Torres',
    enrollmentDate: 'Aug 2021',
    financialStanding: 'Good Standing',
  },
  {
    id: 's7',
    name: 'Carlos Rivera',
    program: 'MBA',
    classYear: '3rd yr',
    gpa: 3.1,
    status: 'Financial Hold',
    creditsCompleted: 54,
    advisor: 'Dr. Sarah Kim',
    enrollmentDate: 'Aug 2022',
    financialStanding: 'Balance Due',
  },
  {
    id: 's8',
    name: 'Destiny Moore',
    program: 'BS DiagImaging',
    classYear: '2nd yr',
    gpa: 3.4,
    status: 'Active',
    creditsCompleted: 48,
    advisor: 'Dr. Robert Chen',
    enrollmentDate: 'Aug 2023',
    financialStanding: 'Good Standing',
  },
];

const FACULTY: FacultyMember[] = [
  {
    id: 'f1',
    name: 'Dr. Sarah Kim',
    title: 'Associate Professor',
    department: 'Business',
    coursesThisSemester: 3,
    tenureStatus: 'Tenured',
    officeHours: 'Mon/Wed 2–4 PM · Robinson Hall 210',
    email: 'skim@lincoln.edu',
    courses: ['MBA 501: Strategy', 'MBA 612: Leadership', 'MBA 721: Ethics'],
  },
  {
    id: 'f2',
    name: 'Prof. James Liu',
    title: 'Instructor',
    department: 'Diagnostic Imaging',
    coursesThisSemester: 4,
    tenureStatus: 'Adjunct',
    officeHours: 'Tue/Thu 10 AM–12 PM · Health Sciences 104',
    email: 'jliu@lincoln.edu',
    courses: ['DI 201: Anatomy', 'DI 310: Radiography', 'DI 405: Clinical', 'DI 501: Pathology'],
  },
  {
    id: 'f3',
    name: 'Dr. Patricia Johnson',
    title: 'Full Professor',
    department: 'Business',
    coursesThisSemester: 2,
    tenureStatus: 'Tenured',
    officeHours: 'Mon/Fri 1–3 PM · Robinson Hall 301',
    email: 'pjohnson@lincoln.edu',
    courses: ['MBA 601: Finance', 'DBA 810: Quantitative Methods'],
  },
  {
    id: 'f4',
    name: 'Dr. Ahmad Hassan',
    title: 'Assistant Professor',
    department: 'Graduate Business',
    coursesThisSemester: 3,
    tenureStatus: 'Tenure-Track',
    officeHours: 'Wed/Thu 3–5 PM · Robinson Hall 218',
    email: 'ahassan@lincoln.edu',
    courses: ['DBA 701: Research Methods', 'DBA 805: Global Strategy', 'MBA 550: Innovation'],
  },
  {
    id: 'f5',
    name: 'Prof. Linda Torres',
    title: 'Instructor',
    department: 'Business',
    coursesThisSemester: 2,
    tenureStatus: 'Adjunct',
    officeHours: 'Tue 11 AM–1 PM · Robinson Hall 115',
    email: 'ltorres@lincoln.edu',
    courses: ['BUS 201: Accounting', 'BUS 305: Marketing'],
  },
  {
    id: 'f6',
    name: 'Dr. Robert Chen',
    title: 'Full Professor',
    department: 'Health Sciences',
    coursesThisSemester: 3,
    tenureStatus: 'Tenured',
    officeHours: 'Mon/Wed/Fri 10–11 AM · Health Sciences 202',
    email: 'rchen@lincoln.edu',
    courses: ['HS 401: Imaging Science', 'HS 510: Clinical Practice', 'DI 601: Advanced Imaging'],
  },
];

const STAFF: StaffMember[] = [
  {
    id: 'st1',
    name: 'Michael Brown',
    role: 'Registrar',
    department: 'Academic Affairs',
    email: 'mbrown@lincoln.edu',
  },
  {
    id: 'st2',
    name: 'Jennifer Lee',
    role: 'Director of Financial Aid',
    department: 'Student Services',
    email: 'jlee@lincoln.edu',
  },
  {
    id: 'st3',
    name: 'Robert Davis',
    role: 'IT Director',
    department: 'Technology',
    email: 'rdavis@lincoln.edu',
  },
  {
    id: 'st4',
    name: 'Maria Santos',
    role: 'Admissions Coordinator',
    department: 'Admissions',
    email: 'msantos@lincoln.edu',
  },
  {
    id: 'st5',
    name: 'Dr. Kevin Park',
    role: 'Dean of Students',
    department: 'Student Affairs',
    email: 'kpark@lincoln.edu',
  },
  {
    id: 'st6',
    name: 'Angela White',
    role: 'Controller',
    department: 'Finance',
    email: 'awhite@lincoln.edu',
  },
];

const TOP_BAR_H = 52;
const STUDENT_TABS: PeopleTab[] = ['Students', 'Faculty', 'Staff'];
const STUDENT_STATUS_FILTERS = ['All', 'Active', 'Probation', 'Hold'] as const;

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function statusColor(status: StudentStatus, C: ComponentColors): string {
  if (status === 'Academic Probation') return C.heat;
  if (status === 'Financial Hold') return C.caution;
  return C.gain;
}

function statusLabel(status: StudentStatus): string {
  if (status === 'Academic Probation') return 'Probation';
  if (status === 'Financial Hold') return 'Fin. Hold';
  return 'Active';
}

function tenureBg(status: TenureStatus): string {
  if (status === 'Tenured') return '#5A8A6E';
  if (status === 'Tenure-Track') return '#B8943E';
  return '#9C9790';
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionHeader({ title, C }: { title: string; C: ComponentColors }) {
  return (
    <Text style={[sh.text, { color: C.drift }]}>{title.toUpperCase()}</Text>
  );
}
const sh = StyleSheet.create({
  text: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 8, marginTop: 20 },
});

function AvatarCircle({ name, size = 40, C }: { name: string; size?: number; C: ComponentColors }) {
  return (
    <View style={[av.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: C.surface, borderColor: C.separator }]}>
      <Text style={[av.initials, { color: C.label, fontSize: size * 0.32 }]}>{getInitials(name)}</Text>
    </View>
  );
}
const av = StyleSheet.create({
  circle:   { alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0 },
  initials: { fontWeight: '700' },
});

function StatusBadge({ status, C }: { status: StudentStatus; C: ComponentColors }) {
  const color = statusColor(status, C);
  return (
    <View style={[sb.wrap, { backgroundColor: `${color}18` }]}>
      <Text style={[sb.txt, { color }]}>{statusLabel(status)}</Text>
    </View>
  );
}
const sb = StyleSheet.create({
  wrap: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  txt:  { fontSize: 10, fontWeight: '700' },
});

function TenureBadge({ status }: { status: TenureStatus }) {
  const color = tenureBg(status);
  return (
    <View style={[tb.wrap, { backgroundColor: `${color}18` }]}>
      <Text style={[tb.txt, { color }]}>{status}</Text>
    </View>
  );
}
const tb = StyleSheet.create({
  wrap: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  txt:  { fontSize: 10, fontWeight: '700' },
});

// ── President View ─────────────────────────────────────────────────────────────

interface PresidentViewProps {
  role: string;
  cycleRole: () => void;
  roleCycles: string[];
  insets: ReturnType<typeof useSafeAreaInsets>;
  C: ComponentColors;
}

function PresidentView({ role, cycleRole, roleCycles, insets, C }: PresidentViewProps) {
  const [peopleTab, setPeopleTab] = useState<PeopleTab>('Students');
  const [dropdownOpen, setDropdown] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<typeof STUDENT_STATUS_FILTERS[number]>('All');

  // Bottom sheets
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentSheetOpen, setStudentSheetOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);
  const [facultySheetOpen, setFacultySheetOpen] = useState(false);

  const topBarH = insets.top + TOP_BAR_H;
  const { opacity: pvTranslateY, onScroll: handleScroll, scrollEventThrottle: pvSET } = useScrollHeader(topBarH);

  const filteredStudents = STUDENTS.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch = !q || s.name.toLowerCase().includes(q) || s.program.toLowerCase().includes(q);
    const matchesFilter =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && s.status === 'Active') ||
      (statusFilter === 'Probation' && s.status === 'Academic Probation') ||
      (statusFilter === 'Hold' && s.status === 'Financial Hold');
    return matchesSearch && matchesFilter;
  });

  const filteredFaculty = FACULTY.filter(f => {
    const q = search.toLowerCase();
    return !q || f.name.toLowerCase().includes(q) || f.department.toLowerCase().includes(q);
  });

  const filteredStaff = STAFF.filter(st => {
    const q = search.toLowerCase();
    return !q || st.name.toLowerCase().includes(q) || st.role.toLowerCase().includes(q) || st.department.toLowerCase().includes(q);
  });

  const renderStudentsTab = () => (
    <>
      {/* Search */}
      <View style={[pv.searchRow, { backgroundColor: C.surface, borderColor: C.carbon }]}>
        <IconSymbol name="magnifyingglass" size={15} color={C.muted} />
        <TextInput
          style={[pv.searchInput, { color: C.label }]}
          value={search}
          onChangeText={setSearch}
          placeholder="Search students…"
          placeholderTextColor={C.muted}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <IconSymbol name="xmark.circle.fill" size={15} color={C.muted} />
          </Pressable>
        )}
      </View>

      {/* Status filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }} contentContainerStyle={{ gap: 8 }}>
        {STUDENT_STATUS_FILTERS.map(f => {
          const active = statusFilter === f;
          return (
            <Pressable
              key={f}
              style={[pv.filterPill, active ? { backgroundColor: C.label } : { borderColor: C.separator }]}
              onPress={() => { Haptics.selectionAsync(); setStatusFilter(f); }}
            >
              <Text style={[pv.filterPillTxt, { color: active ? C.bg : C.secondary }]}>{f}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Student rows */}
      {filteredStudents.map(s => (
        <Pressable
          key={s.id}
          style={[pv.card, { backgroundColor: C.surface }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelectedStudent(s);
            setStudentSheetOpen(true);
          }}
        >
          <AvatarCircle name={s.name} size={42} C={C} />
          <View style={pv.cardBody}>
            <Text style={[pv.cardName, { color: C.label }]}>{s.name}</Text>
            <Text style={[pv.cardSub, { color: C.secondary }]}>{s.program} · {s.classYear}</Text>
          </View>
          <View style={pv.cardRight}>
            <Text style={[pv.gpaText, { color: C.label }]}>
              {s.gpa.toFixed(1)}
            </Text>
            <StatusBadge status={s.status} C={C} />
          </View>
        </Pressable>
      ))}
    </>
  );

  const renderFacultyTab = () => (
    <>
      {/* Search */}
      <View style={[pv.searchRow, { backgroundColor: C.surface, borderColor: C.carbon }]}>
        <IconSymbol name="magnifyingglass" size={15} color={C.muted} />
        <TextInput
          style={[pv.searchInput, { color: C.label }]}
          value={search}
          onChangeText={setSearch}
          placeholder="Search faculty…"
          placeholderTextColor={C.muted}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <IconSymbol name="xmark.circle.fill" size={15} color={C.muted} />
          </Pressable>
        )}
      </View>

      {filteredFaculty.map(f => (
        <Pressable
          key={f.id}
          style={[pv.card, { backgroundColor: C.surface }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelectedFaculty(f);
            setFacultySheetOpen(true);
          }}
        >
          <AvatarCircle name={f.name} size={42} C={C} />
          <View style={pv.cardBody}>
            <Text style={[pv.cardName, { color: C.label }]}>{f.name}</Text>
            <Text style={[pv.cardSub, { color: C.secondary }]}>{f.title}</Text>
            <Text style={[pv.cardDetail, { color: C.muted }]}>{f.department} · {f.coursesThisSemester} courses</Text>
          </View>
          <TenureBadge status={f.tenureStatus} />
        </Pressable>
      ))}
    </>
  );

  const renderStaffTab = () => (
    <>
      {/* Search */}
      <View style={[pv.searchRow, { backgroundColor: C.surface, borderColor: C.carbon }]}>
        <IconSymbol name="magnifyingglass" size={15} color={C.muted} />
        <TextInput
          style={[pv.searchInput, { color: C.label }]}
          value={search}
          onChangeText={setSearch}
          placeholder="Search staff…"
          placeholderTextColor={C.muted}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <IconSymbol name="xmark.circle.fill" size={15} color={C.muted} />
          </Pressable>
        )}
      </View>

      {filteredStaff.map(st => (
        <View key={st.id} style={[pv.card, { backgroundColor: C.surface }]}>
          <AvatarCircle name={st.name} size={42} C={C} />
          <View style={pv.cardBody}>
            <Text style={[pv.cardName, { color: C.label }]}>{st.name}</Text>
            <Text style={[pv.cardSub, { color: C.secondary }]}>{st.role}</Text>
            <Text style={[pv.cardDetail, { color: C.muted }]}>{st.department}</Text>
          </View>
          <Pressable
            hitSlop={8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Linking.openURL(`mailto:${st.email}`);
            }}
          >
            <IconSymbol name="envelope" size={18} color={C.secondary} />
          </Pressable>
        </View>
      ))}
    </>
  );

  // ── Student Record Sheet ──
  const renderStudentSheet = () => {
    const s = selectedStudent;
    if (!s) return null;
    const color = statusColor(s.status, C);
    return (
      <View style={{ paddingHorizontal: 16 }}>
        {/* Header */}
        <View style={ss.sheetHeader}>
          <AvatarCircle name={s.name} size={52} C={C} />
          <View style={{ flex: 1 }}>
            <Text style={[ss.sheetName, { color: C.label }]}>{s.name}</Text>
            <Text style={[ss.sheetSub, { color: C.secondary }]}>{s.program} · {s.classYear}</Text>
          </View>
          <StatusBadge status={s.status} C={C} />
        </View>

        {/* Stats row */}
        <View style={ss.statsRow}>
          <View style={[ss.statCard, { backgroundColor: C.surface }]}>
            <Text style={[ss.statValue, { color: C.label }]}>{s.gpa.toFixed(1)}</Text>
            <Text style={[ss.statLabel, { color: C.muted }]}>GPA</Text>
          </View>
          <View style={[ss.statCard, { backgroundColor: C.surface }]}>
            <Text style={[ss.statValue, { color: C.label }]}>{s.creditsCompleted}</Text>
            <Text style={[ss.statLabel, { color: C.muted }]}>Credits</Text>
          </View>
          <View style={[ss.statCard, { backgroundColor: C.surface }]}>
            <Text style={[ss.statValue, { color: color }]}>{s.status === 'Active' ? 'Good' : s.status === 'Financial Hold' ? 'Hold' : 'Probation'}</Text>
            <Text style={[ss.statLabel, { color: C.muted }]}>Standing</Text>
          </View>
        </View>

        {/* Detail rows */}
        {[
          { label: 'Program', value: s.program },
          { label: 'Class Year', value: s.classYear },
          { label: 'Enrolled', value: s.enrollmentDate },
          { label: 'Advisor', value: s.advisor },
          { label: 'Financial Standing', value: s.financialStanding },
        ].map(row => (
          <View key={row.label} style={[ss.detailRow, { borderBottomColor: C.separator }]}>
            <Text style={[ss.detailLabel, { color: C.muted }]}>{row.label}</Text>
            <Text style={[ss.detailValue, { color: C.label }]}>{row.value}</Text>
          </View>
        ))}

        {/* Academic flags */}
        {s.status !== 'Active' && (
          <View style={[ss.flagCard, { backgroundColor: `${color}12`, borderColor: `${color}30` }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={14} color={color} />
            <Text style={[ss.flagText, { color }]}>
              {s.status === 'Academic Probation'
                ? 'Student is on academic probation. GPA must improve above 3.0 by end of semester.'
                : 'Student has an outstanding balance. Registration and transcript holds apply.'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // ── Faculty Sheet ──
  const renderFacultySheet = () => {
    const f = selectedFaculty;
    if (!f) return null;
    return (
      <View style={{ paddingHorizontal: 16 }}>
        <View style={ss.sheetHeader}>
          <AvatarCircle name={f.name} size={52} C={C} />
          <View style={{ flex: 1 }}>
            <Text style={[ss.sheetName, { color: C.label }]}>{f.name}</Text>
            <Text style={[ss.sheetSub, { color: C.secondary }]}>{f.title} · {f.department}</Text>
          </View>
          <TenureBadge status={f.tenureStatus} />
        </View>

        {/* Contact */}
        <Pressable
          style={[fs.contactRow, { backgroundColor: C.surface }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL(`mailto:${f.email}`); }}
        >
          <IconSymbol name="envelope" size={15} color={C.secondary} />
          <Text style={[fs.contactTxt, { color: C.label }]}>{f.email}</Text>
        </Pressable>

        {/* Office hours */}
        <View style={[fs.contactRow, { backgroundColor: C.surface }]}>
          <IconSymbol name="clock" size={15} color={C.secondary} />
          <Text style={[fs.contactTxt, { color: C.label }]}>{f.officeHours}</Text>
        </View>

        {/* Courses */}
        <Text style={[fs.sectionHead, { color: C.label }]}>Courses This Semester</Text>
        {f.courses.map((course, idx) => (
          <View key={idx} style={[fs.courseRow, { borderBottomColor: C.separator }]}>
            <View style={[fs.courseDot, { backgroundColor: C.label }]} />
            <Text style={[fs.courseName, { color: C.label }]}>{course}</Text>
          </View>
        ))}
      </View>
    );
  };

  const isPrimary = role === roleCycles[0];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top Bar */}
      <Animated.View style={[pv.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg, opacity: pvTranslateY }]}>
        <View style={pv.topBar}>
          {/* Hamburger */}
          <View style={pv.topBarSide}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
              <KMenuButton />
            </Pressable>
          </View>

          {/* People dropdown */}
          <View style={pv.topBarCenter}>
            <Pressable
              style={[pv.dropdownPill, { backgroundColor: C.surfacePressed }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDropdown(v => !v); }}
            >
              <Text style={[pv.dropdownPillTxt, { color: C.label }]}>{peopleTab}</Text>
              <IconSymbol name="chevron.down" size={12} color={C.secondary} />
            </Pressable>
          </View>

          {/* Role pill */}
          <View style={[pv.topBarSide, { alignItems: 'flex-end' }]}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isPrimary} />
          </View>
        </View>
      </Animated.View>

      {/* Tab dropdown */}
      {dropdownOpen && (
        <>
          <Pressable style={[StyleSheet.absoluteFillObject, { zIndex: 98 }]} onPress={() => setDropdown(false)} />
          <View style={[pv.dropdown, { top: insets.top + 56, backgroundColor: C.bg, borderColor: C.separator, zIndex: 99 }]}>
            {STUDENT_TABS.map(tab => (
              <Pressable
                key={tab}
                style={pv.dropdownOption}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPeopleTab(tab);
                  setDropdown(false);
                  setSearch('');
                  setStatusFilter('All');
                }}
              >
                <Text style={[pv.dropdownOptionTxt, { color: tab === peopleTab ? C.label : C.secondary }, tab === peopleTab && { fontWeight: '700' }]}>
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* Content */}
      <ScrollView
        key={peopleTab}
        style={{ flex: 1 }}
        onScroll={handleScroll}
        scrollEventThrottle={pvSET}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 16, paddingHorizontal: 16, paddingBottom: 120 }}
      >
        {peopleTab === 'Students' && renderStudentsTab()}
        {peopleTab === 'Faculty' && renderFacultyTab()}
        {peopleTab === 'Staff' && renderStaffTab()}
      </ScrollView>

      {/* Student Record Sheet */}
      <BottomSheet visible={studentSheetOpen} onClose={() => setStudentSheetOpen(false)} useModal snapPoints={['50%', '100%']}>
        {renderStudentSheet()}
      </BottomSheet>

      {/* Faculty Sheet */}
      <BottomSheet visible={facultySheetOpen} onClose={() => setFacultySheetOpen(false)} useModal snapPoints={['50%', '100%']}>
        {renderFacultySheet()}
      </BottomSheet>
    </View>
  );
}

// ── Student Directory View ────────────────────────────────────────────────────

interface StudentDirectoryViewProps {
  role: string;
  cycleRole: () => void;
  roleCycles: string[];
  insets: ReturnType<typeof useSafeAreaInsets>;
  C: ComponentColors;
}

function StudentDirectoryView({ role, cycleRole, roleCycles, insets, C }: StudentDirectoryViewProps) {
  const [search, setSearch] = useState('');
  const { opacity: dvTranslateY, onScroll: handleScroll, scrollEventThrottle: dvSET } = useScrollHeader(insets.top + TOP_BAR_H);

  const q = search.toLowerCase();

  const filteredFaculty = FACULTY.filter(
    f => !q || f.name.toLowerCase().includes(q) || f.department.toLowerCase().includes(q),
  );
  const filteredStaff = STAFF.filter(
    st => !q || st.name.toLowerCase().includes(q) || st.role.toLowerCase().includes(q),
  );
  const filteredStudents = STUDENTS.filter(
    s => !q || s.name.toLowerCase().includes(q) || s.program.toLowerCase().includes(q),
  );

  const isPrimary = role === roleCycles[0];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top Bar */}
      <Animated.View style={[pv.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg, opacity: dvTranslateY }]}>
        <View style={pv.topBar}>
          <View style={pv.topBarSide}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
              <KMenuButton />
            </Pressable>
          </View>

          <View style={pv.topBarCenter}>
            <Text style={[pv.centerTitle, { color: C.label }]}>Directory</Text>
          </View>

          <View style={[pv.topBarSide, { alignItems: 'flex-end' }]}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isPrimary} />
          </View>
        </View>
      </Animated.View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        onScroll={handleScroll}
        scrollEventThrottle={dvSET}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 16, paddingHorizontal: 16, paddingBottom: 120 }}
      >
        {/* Search */}
        <View style={[pv.searchRow, { backgroundColor: C.surface, borderColor: C.mist }]}>
          <IconSymbol name="magnifyingglass" size={15} color={C.muted} />
          <TextInput
            style={[pv.searchInput, { color: C.label }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Search directory…"
            placeholderTextColor={C.muted}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={15} color={C.muted} />
            </Pressable>
          )}
        </View>

        {/* Faculty & Staff section */}
        <SectionHeader title="Faculty & Staff" C={C} />
        {[...filteredFaculty.map(f => ({ id: f.id, name: f.name, dept: f.department, email: f.email, sub: f.title, officeHours: f.officeHours })),
          ...filteredStaff.map(st => ({ id: st.id, name: st.name, dept: st.department, email: st.email, sub: st.role, officeHours: '' }))
        ].map(person => (
          <View key={person.id} style={[dv.row, { backgroundColor: C.surface }]}>
            <AvatarCircle name={person.name} size={40} C={C} />
            <View style={dv.rowBody}>
              <Text style={[dv.rowName, { color: C.label }]}>{person.name}</Text>
              <Text style={[dv.rowSub, { color: C.secondary }]}>{person.sub}</Text>
              <Text style={[dv.rowDetail, { color: C.muted }]}>{person.dept}{person.officeHours ? ` · ${person.officeHours}` : ''}</Text>
            </View>
            <Pressable
              hitSlop={12}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Linking.openURL(`mailto:${person.email}`);
              }}
            >
              <IconSymbol name="envelope" size={18} color={C.secondary} />
            </Pressable>
          </View>
        ))}

        {/* Students section */}
        <SectionHeader title="Students" C={C} />
        {filteredStudents.map(s => (
          <View key={s.id} style={[dv.row, { backgroundColor: C.surface }]}>
            <AvatarCircle name={s.name} size={40} C={C} />
            <View style={dv.rowBody}>
              <Text style={[dv.rowName, { color: C.label }]}>{s.name}</Text>
              <Text style={[dv.rowSub, { color: C.secondary }]}>{s.program} · {s.classYear}</Text>
            </View>
            <Pressable
              style={[dv.messageBtn, { borderColor: C.separator }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={[dv.messageBtnTxt, { color: C.secondary }]}>Message</Text>
            </Pressable>
          </View>
        ))}

        {/* My Profile section */}
        <SectionHeader title="My Profile" C={C} />
        <View style={[dv.profileCard, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <View style={dv.profileTop}>
            <AvatarCircle name="Jordan Taylor" size={52} C={C} />
            <View style={{ flex: 1 }}>
              <Text style={[dv.profileName, { color: C.label }]}>Jordan Taylor</Text>
              <Text style={[dv.profileSub, { color: C.secondary }]}>MBA · 2nd Year</Text>
              <View style={dv.profileGpaRow}>
                <Text style={[dv.profileGpaLabel, { color: C.muted }]}>GPA</Text>
                <Text style={[dv.profileGpaValue, { color: C.label }]}>3.6</Text>
              </View>
            </View>
          </View>
          <Pressable
            style={[dv.editBtn, { backgroundColor: C.label }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={[dv.editBtnTxt, { color: C.bg }]}>Edit Profile</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Campus Screen (root) ──────────────────────────────────────────────────────

export default function CampusScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [role, cycleRole, roleCycles] = useDemoRole('education');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const isPresident = role === roleCycles[0];

  if (!isPresident) {
    return (
      <StudentDirectoryView
        role={role}
        cycleRole={cycleRole}
        roleCycles={roleCycles}
        insets={insets}
        C={C}
      />
    );
  }

  return (
    <PresidentView
      role={role}
      cycleRole={cycleRole}
      roleCycles={roleCycles}
      insets={insets}
      C={C}
    />
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const pv = StyleSheet.create({
  topBarWrap:       { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar:           { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide:       { width: 80, justifyContent: 'center' },
  topBarCenter:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerTitle:      { fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
  dropdownPill:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, gap: 6 },
  dropdownPillTxt:  { fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  dropdown: {
    position: 'absolute',
    left: '50%',
    marginLeft: -100,
    minWidth: 200,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  dropdownOption:    { paddingVertical: 14, paddingHorizontal: 20 },
  dropdownOptionTxt: { fontSize: 15 },
  searchRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, marginBottom: 12 },
  searchInput:  { flex: 1, fontSize: 14 },
  filterPill:   { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  filterPillTxt:{ fontSize: 13 },
  card:         { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 12, marginBottom: 8 },
  cardBody:     { flex: 1 },
  cardName:     { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  cardSub:      { fontSize: 12 },
  cardDetail:   { fontSize: 11, marginTop: 2 },
  cardRight:    { alignItems: 'flex-end', gap: 5 },
  gpaText:      { fontSize: 15, fontWeight: '700' },
});

const ss = StyleSheet.create({
  sheetHeader:  { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  sheetName:    { fontSize: 18, fontWeight: '800' },
  sheetSub:     { fontSize: 13, marginTop: 2 },
  statsRow:     { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard:     { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  statValue:    { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  statLabel:    { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  detailLabel:  { fontSize: 13 },
  detailValue:  { fontSize: 13, fontWeight: '600' },
  flagCard:     { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 16 },
  flagText:     { fontSize: 13, flex: 1, lineHeight: 19 },
});

const fs = StyleSheet.create({
  contactRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 12, marginBottom: 8 },
  contactTxt:   { fontSize: 13, flex: 1 },
  sectionHead:  { fontSize: 13, fontWeight: '700', marginTop: 16, marginBottom: 10 },
  courseRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  courseDot:    { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  courseName:   { fontSize: 14, flex: 1 },
});

const dv = StyleSheet.create({
  row:          { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 12, marginBottom: 8 },
  rowBody:      { flex: 1 },
  rowName:      { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  rowSub:       { fontSize: 12 },
  rowDetail:    { fontSize: 11, marginTop: 2 },
  messageBtn:   { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  messageBtnTxt:{ fontSize: 12, fontWeight: '600' },
  profileCard:  { borderRadius: 16, padding: 16, borderWidth: 1, gap: 14 },
  profileTop:   { flexDirection: 'row', alignItems: 'center', gap: 14 },
  profileName:  { fontSize: 17, fontWeight: '800', marginBottom: 3 },
  profileSub:   { fontSize: 13, marginBottom: 6 },
  profileGpaRow:{ flexDirection: 'row', alignItems: 'center', gap: 6 },
  profileGpaLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  profileGpaValue: { fontSize: 15, fontWeight: '700' },
  editBtn:      { paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  editBtnTxt:   { fontSize: 14, fontWeight: '700' },
});
