/**
 * Education Hub — operational center for schools, universities, training programs.
 * RBAC flip: admin/dean sees enrollment dashboard, student sees campus life,
 * parent sees their student's info.
 * Three views: Overview / Academics / Student Life via centered dropdown pill.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, Pressable, ScrollView,
  StyleSheet, Animated, TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { hideFooter, showFooter, resetFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import {
  EDUCATION_PROFILE, EDUCATION_ANALYTICS, EDUCATION_CHART_DATA,
  EDUCATION_DEPARTMENTS, COURSE_CATALOG, MY_COURSES, COURSE_ASSIGNMENTS,
  DEGREE_PROGRESS, CAMPUS_ORGS, STUDENT_PROFILE, ADMIN_ACTIVITY, ACADEMIC_CALENDAR,
  getEduChartMax,
  type EduChartMetric, type StudentCourse, type CampusOrg, type OrgType,
} from '@/data/mock-education-hub';

type EduTab  = 'Overview' | 'Academics' | 'Student Life';
type EduRole = 'admin' | 'student' | 'parent';

const OVERVIEW_ADMIN_PILLS  = ['All', 'Enrollment', 'Financial', 'Accreditation', 'Applications'];
const ACADEMICS_ADMIN_PILLS = ['All', 'Departments', 'Courses', 'Grades'];
const ACADEMICS_STU_PILLS   = ['All', 'My Courses', 'Catalog', 'Grades', 'Degree Progress'];
const LIFE_ADMIN_PILLS      = ['All', 'Clubs', 'Housing', 'Dining', 'Facilities'];
const LIFE_STU_PILLS        = ['All', 'Clubs', 'My Orgs', 'Housing', 'Dining', 'Resources'];

const TOP_BAR_H  = 52;
const PILL_ROW_H = 48;
const BAR_MAX_H  = 100;

function pillsForTab(tab: EduTab, role: EduRole): string[] {
  if (tab === 'Overview')     return role === 'admin' ? OVERVIEW_ADMIN_PILLS : [];
  if (tab === 'Academics')    return role === 'admin' ? ACADEMICS_ADMIN_PILLS : role === 'student' ? ACADEMICS_STU_PILLS : [];
  return role === 'admin' ? LIFE_ADMIN_PILLS : role === 'student' ? LIFE_STU_PILLS : [];
}

function nextRole(r: EduRole): EduRole { return r === 'admin' ? 'student' : r === 'student' ? 'parent' : 'admin'; }
function roleLabel(r: EduRole): string { return r === 'admin' ? 'Dean' : r === 'student' ? 'Student' : 'Parent'; }

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ icon, value, label, trend, C }: {
  icon: string; value: string; label: string; trend: number; C: ComponentColors;
}) {
  const up = trend >= 0;
  return (
    <View style={[stC.card, { backgroundColor: C.surface }]}>
      <IconSymbol name={icon as any} size={20} color={C.accent} />
      <Text style={[stC.value, { color: C.label }]}>{value}</Text>
      <Text style={[stC.label, { color: C.secondary }]}>{label}</Text>
      {trend !== 0 && (
        <View style={[stC.badge, { backgroundColor: up ? '#5A8A6E22' : '#B85C5C22' }]}>
          <Text style={[stC.badgeText, { color: up ? '#5A8A6E' : '#B85C5C' }]}>
            {up ? '+' : ''}{trend}{Math.abs(trend) < 5 ? '%' : ''}
          </Text>
        </View>
      )}
    </View>
  );
}
const stC = StyleSheet.create({
  card:      { width: 120, borderRadius: 14, padding: 14, gap: 6, marginRight: 10, alignItems: 'flex-start' },
  value:     { fontSize: 22, fontWeight: '800' },
  label:     { fontSize: 12 },
  badge:     { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});

// ── Bar Chart ─────────────────────────────────────────────────────────────────

function EduBarChart({ metric, C }: { metric: EduChartMetric; C: ComponentColors }) {
  const max = getEduChartMax(metric);
  return (
    <View style={[bcS.wrap, { backgroundColor: C.surface }]}>
      <View style={bcS.bars}>
        {EDUCATION_CHART_DATA.map(pt => {
          const h = max > 0 ? Math.round((pt[metric] / max) * BAR_MAX_H) : 4;
          return (
            <View key={pt.label} style={bcS.barCol}>
              <View style={bcS.track}>
                <View style={[bcS.bar, { height: h, backgroundColor: C.accent }]} />
              </View>
              <Text style={[bcS.lbl, { color: C.muted }]}>{pt.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
const bcS = StyleSheet.create({
  wrap:   { borderRadius: 14, padding: 14, marginBottom: 20 },
  bars:   { flexDirection: 'row', alignItems: 'flex-end', height: BAR_MAX_H + 24, gap: 6 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  track:  { flex: 1, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar:    { width: '80%', borderRadius: 4, minHeight: 4 },
  lbl:    { fontSize: 9, fontWeight: '500' },
});

// ── Course Row (student, expandable) ─────────────────────────────────────────

function CourseRow({ course, expanded, onToggle, router, C }: {
  course: StudentCourse; expanded: boolean; onToggle: () => void; router: any; C: ComponentColors;
}) {
  const assignments = COURSE_ASSIGNMENTS[course.id] ?? [];
  const gradeColor = course.grade.startsWith('A') ? '#5A8A6E' : course.grade.startsWith('B') ? C.label : '#3B82F6';
  return (
    <Pressable onPress={onToggle} style={[crw.card, { backgroundColor: C.surface }]}>
      <View style={crw.row}>
        <View style={crw.info}>
          <Text style={[crw.title, { color: C.label }]}>{course.title}</Text>
          <Text style={[crw.code, { color: C.secondary }]}>{course.code} · {course.credits} cr · {course.instructor}</Text>
          <Text style={[crw.schedule, { color: C.muted }]}>{course.schedule} · {course.room}</Text>
        </View>
        <View style={crw.right}>
          <Text style={[crw.grade, { color: gradeColor }]}>{course.grade}</Text>
          <Text style={[crw.attn, { color: C.muted }]}>{course.attendance}% attn</Text>
          <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={12} color={C.muted} />
        </View>
      </View>
      {expanded && (
        <View style={[crw.detail, { borderTopColor: C.separator }]}>
          <Text style={[crw.detailTitle, { color: C.label }]}>Assignments</Text>
          {assignments.map(a => (
            <View key={a.id} style={[crw.asgRow, { borderBottomColor: C.separator }]}>
              <View style={crw.asgLeft}>
                <IconSymbol
                  name={a.status === 'graded' ? 'checkmark.circle.fill' : a.status === 'submitted' ? 'clock.fill' : 'circle'}
                  size={14}
                  color={a.status === 'graded' ? '#5A8A6E' : a.status === 'submitted' ? '#1D9BF0' : C.muted}
                />
                <View>
                  <Text style={[crw.asgTitle, { color: C.label }]}>{a.title}</Text>
                  <Text style={[crw.asgDue, { color: C.muted }]}>Due {a.dueDate}</Text>
                </View>
              </View>
              <Text style={[crw.asgPts, { color: a.status === 'graded' ? C.label : C.muted }]}>
                {a.status === 'graded' && a.earned != null ? `${a.earned}/${a.points}` : `/${a.points}`}
              </Text>
            </View>
          ))}
          <Pressable
            style={[crw.roomBtn, { borderColor: C.separator }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/(main)/messages' as any); }}
          >
            <IconSymbol name="bubble.left.fill" size={14} color={C.secondary} />
            <Text style={[crw.roomBtnText, { color: C.secondary }]}>Course Room</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}
const crw = StyleSheet.create({
  card:       { borderRadius: 14, padding: 14, marginBottom: 10 },
  row:        { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  info:       { flex: 1, gap: 3 },
  title:      { fontSize: 15, fontWeight: '700' },
  code:       { fontSize: 12 },
  schedule:   { fontSize: 11 },
  right:      { alignItems: 'flex-end', gap: 4 },
  grade:      { fontSize: 20, fontWeight: '800' },
  attn:       { fontSize: 10 },
  detail:     { marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, gap: 6 },
  detailTitle:{ fontSize: 13, fontWeight: '700', marginBottom: 4 },
  asgRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  asgLeft:    { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  asgTitle:   { fontSize: 13, fontWeight: '500' },
  asgDue:     { fontSize: 11, marginTop: 1 },
  asgPts:     { fontSize: 12, fontWeight: '600' },
  roomBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5 },
  roomBtnText:{ fontSize: 13, fontWeight: '600' },
});

// ── Catalog Course Row (student registration) ──────────────────────────────

function CatalogCourse({ course, registered, onRegister, C }: {
  course: typeof COURSE_CATALOG[0]; registered: boolean; onRegister: () => void; C: ComponentColors;
}) {
  const full = course.enrollment >= course.capacity;
  return (
    <View style={[catS.card, { backgroundColor: C.surface }]}>
      <View style={catS.row}>
        <View style={catS.info}>
          <Text style={[catS.title, { color: C.label }]}>{course.title}</Text>
          <Text style={[catS.sub, { color: C.secondary }]}>{course.code} · {course.credits} cr · {course.instructor}</Text>
          <Text style={[catS.sched, { color: C.muted }]}>{course.schedule} · {course.room}</Text>
          {course.prerequisites.length > 0 && (
            <Text style={[catS.prereq, { color: C.muted }]}>Prereq: {course.prerequisites.join(', ')}</Text>
          )}
        </View>
        <View style={catS.right}>
          <Text style={[catS.seats, { color: full ? '#B85C5C' : '#5A8A6E' }]}>
            {full ? 'Full' : `${course.capacity - course.enrollment} seats`}
          </Text>
          <Pressable
            style={[catS.regBtn, registered ? { backgroundColor: C.surfacePressed } : full ? { borderWidth: 1, borderColor: C.separator } : { backgroundColor: C.accent }]}
            onPress={() => { if (!registered && !full) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onRegister(); } }}
          >
            <Text style={[catS.regText, { color: registered ? C.secondary : full ? C.muted : '#fff' }]}>
              {registered ? 'Added' : full ? 'Full' : 'Register'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
const catS = StyleSheet.create({
  card:   { borderRadius: 14, padding: 14, marginBottom: 10 },
  row:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  info:   { flex: 1, gap: 3 },
  title:  { fontSize: 14, fontWeight: '700' },
  sub:    { fontSize: 12 },
  sched:  { fontSize: 11 },
  prereq: { fontSize: 11, fontStyle: 'italic' },
  right:  { alignItems: 'flex-end', gap: 8 },
  seats:  { fontSize: 11, fontWeight: '700' },
  regBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  regText:{ fontSize: 12, fontWeight: '700' },
});

// ── Dept Card (admin, expandable) ─────────────────────────────────────────────

function DeptCard({ dept, expanded, onToggle, C }: {
  dept: typeof EDUCATION_DEPARTMENTS[0]; expanded: boolean; onToggle: () => void; C: ComponentColors;
}) {
  return (
    <Pressable onPress={onToggle} style={[dpS.card, { backgroundColor: C.surface }]}>
      <View style={dpS.row}>
        <View style={[dpS.iconWrap, { backgroundColor: `hsl(${dept.chairHue},42%,28%)` }]}>
          <Text style={dpS.iconText}>{dept.chairInitials}</Text>
        </View>
        <View style={dpS.info}>
          <Text style={[dpS.name, { color: C.label }]}>{dept.name}</Text>
          <Text style={[dpS.chair, { color: C.secondary }]}>Chair: {dept.chair}</Text>
          <Text style={[dpS.stats, { color: C.muted }]}>
            {dept.facultyCount} faculty · {dept.studentCount} students · {dept.courseCount} courses
          </Text>
        </View>
        <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={14} color={C.muted} />
      </View>
      {expanded && (
        <View style={[dpS.detail, { borderTopColor: C.separator }]}>
          <Text style={[dpS.desc, { color: C.secondary }]}>{dept.description}</Text>
          <View style={dpS.actions}>
            {['Add Course', 'Manage Faculty'].map(lbl => (
              <Pressable key={lbl} style={[dpS.actionBtn, { borderColor: C.separator }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <Text style={[dpS.actionText, { color: C.accent }]}>{lbl}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </Pressable>
  );
}
const dpS = StyleSheet.create({
  card:      { borderRadius: 14, padding: 14, marginBottom: 10 },
  row:       { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconWrap:  { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  iconText:  { fontSize: 14, fontWeight: '800', color: '#fff' },
  info:      { flex: 1, gap: 3 },
  name:      { fontSize: 15, fontWeight: '700' },
  chair:     { fontSize: 12 },
  stats:     { fontSize: 11 },
  detail:    { marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, gap: 10 },
  desc:      { fontSize: 13, lineHeight: 19 },
  actions:   { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  actionText:{ fontSize: 12, fontWeight: '700' },
});

// ── Org Card (student life, expandable) ───────────────────────────────────────

function OrgCard({ org, expanded, onToggle, isJoined, onJoin, C }: {
  org: CampusOrg; expanded: boolean; onToggle: () => void;
  isJoined: boolean; onJoin: () => void; C: ComponentColors;
}) {
  const typeColors: Record<OrgType, string> = {
    academic: '#1D9BF0', social: C.accent, athletic: '#990000',
    cultural: '#3B82F6', service: '#5A8A6E',
  };
  const tc = typeColors[org.type];
  return (
    <Pressable onPress={onToggle} style={[orgS.card, { backgroundColor: C.surface }]}>
      <View style={orgS.row}>
        <View style={orgS.info}>
          <View style={orgS.titleRow}>
            <Text style={[orgS.name, { color: C.label }]}>{org.name}</Text>
            <View style={[orgS.typeBadge, { backgroundColor: `${tc}20` }]}>
              <Text style={[orgS.typeText, { color: tc }]}>{org.type}</Text>
            </View>
          </View>
          <Text style={[orgS.sub, { color: C.secondary }]}>{org.president} · {org.memberCount} members</Text>
          <Text style={[orgS.schedule, { color: C.muted }]}>{org.schedule}</Text>
        </View>
        <View style={orgS.right}>
          {!org.isOpen && <View style={[orgS.closedBadge, { backgroundColor: '#B85C5C22' }]}>
            <Text style={orgS.closedText}>Closed</Text>
          </View>}
          <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={14} color={C.muted} />
        </View>
      </View>
      {expanded && (
        <View style={[orgS.detail, { borderTopColor: C.separator }]}>
          <Text style={[orgS.desc, { color: C.secondary }]}>{org.description}</Text>
          <View style={orgS.actionRow}>
            <Pressable
              style={[orgS.btn,
                isJoined ? { backgroundColor: C.surfacePressed }
                : org.isOpen ? { backgroundColor: C.accent }
                : { borderWidth: 1.5, borderColor: C.separator }
              ]}
              onPress={() => { if (org.isOpen && !isJoined) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onJoin(); } }}
            >
              <Text style={[orgS.btnText, { color: isJoined ? C.secondary : org.isOpen ? '#fff' : C.muted }]}>
                {isJoined ? 'Joined' : org.isOpen ? (org.requiresApproval ? 'Request to Join' : 'Join') : 'Closed'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </Pressable>
  );
}
const orgS = StyleSheet.create({
  card:        { borderRadius: 14, padding: 14, marginBottom: 10 },
  row:         { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  info:        { flex: 1, gap: 3 },
  titleRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name:        { fontSize: 14, fontWeight: '700', flexShrink: 1 },
  typeBadge:   { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  typeText:    { fontSize: 10, fontWeight: '700' },
  sub:         { fontSize: 12 },
  schedule:    { fontSize: 11 },
  right:       { alignItems: 'flex-end', gap: 6 },
  closedBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  closedText:  { fontSize: 10, fontWeight: '700', color: '#B85C5C' },
  detail:      { marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, gap: 10 },
  desc:        { fontSize: 13, lineHeight: 19 },
  actionRow:   { flexDirection: 'row', gap: 8 },
  btn:         { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  btnText:     { fontSize: 13, fontWeight: '700' },
});

// ── Degree Progress Section ───────────────────────────────────────────────────

function DegreeProgressSection({ C }: { C: ComponentColors }) {
  const p = DEGREE_PROGRESS;
  const pct = p.completed / p.totalCredits;
  return (
    <View style={dgS.container}>
      <View style={[dgS.overviewCard, { backgroundColor: C.surface }]}>
        <View style={dgS.overviewTop}>
          <View>
            <Text style={[dgS.creditsNum, { color: C.label }]}>{p.completed}<Text style={[dgS.creditsTotal, { color: C.secondary }]}> / {p.totalCredits}</Text></Text>
            <Text style={[dgS.creditsLabel, { color: C.secondary }]}>credits completed</Text>
          </View>
          <View style={dgS.overviewRight}>
            <Text style={[dgS.gpaNum, { color: C.accent }]}>{p.gpa}</Text>
            <Text style={[dgS.gpaLabel, { color: C.secondary }]}>GPA</Text>
          </View>
        </View>
        <View style={[dgS.mainTrack, { backgroundColor: C.surfacePressed }]}>
          <View style={[dgS.mainFill, { width: `${pct * 100}%` as any, backgroundColor: C.accent }]} />
        </View>
        <Text style={[dgS.graduation, { color: C.secondary }]}>Expected graduation: {p.expectedGraduation}</Text>
      </View>

      {p.requirements.map(req => {
        const rPct = Math.min(req.completed / req.required, 1);
        return (
          <View key={req.name} style={[dgS.reqRow, { borderBottomColor: C.separator }]}>
            <View style={dgS.reqTop}>
              <Text style={[dgS.reqName, { color: C.label }]}>{req.name}</Text>
              <Text style={[dgS.reqNums, { color: C.secondary }]}>{req.completed} / {req.required} cr</Text>
            </View>
            <View style={[dgS.reqTrack, { backgroundColor: C.surfacePressed }]}>
              <View style={[dgS.reqFill, { width: `${rPct * 100}%` as any, backgroundColor: rPct >= 1 ? '#5A8A6E' : C.accent }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}
const dgS = StyleSheet.create({
  container:    { marginBottom: 20 },
  overviewCard: { borderRadius: 16, padding: 16, marginBottom: 14, gap: 12 },
  overviewTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  creditsNum:   { fontSize: 30, fontWeight: '800' },
  creditsTotal: { fontSize: 18, fontWeight: '400' },
  creditsLabel: { fontSize: 12, marginTop: 2 },
  overviewRight:{ alignItems: 'flex-end' },
  gpaNum:       { fontSize: 28, fontWeight: '800' },
  gpaLabel:     { fontSize: 12 },
  mainTrack:    { height: 8, borderRadius: 4, overflow: 'hidden' },
  mainFill:     { height: 8, borderRadius: 4 },
  graduation:   { fontSize: 12 },
  reqRow:       { paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, gap: 7 },
  reqTop:       { flexDirection: 'row', justifyContent: 'space-between' },
  reqName:      { fontSize: 13, fontWeight: '600' },
  reqNums:      { fontSize: 13 },
  reqTrack:     { height: 5, borderRadius: 3, overflow: 'hidden' },
  reqFill:      { height: 5, borderRadius: 3 },
});

// ── Section Header ────────────────────────────────────────────────────────────

function SecH({ title, C }: { title: string; C: ComponentColors }) {
  return <Text style={[secHs.t, { color: C.label }]}>{title}</Text>;
}
const secHs = StyleSheet.create({ t: { fontSize: 17, fontWeight: '700', marginBottom: 12, marginTop: 4 } });

// ── Education Hub Screen ──────────────────────────────────────────────────────

export default function EducationHubScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, setRole]               = useState<EduRole>('admin');
  const [activeTab, setActiveTab]     = useState<EduTab>('Overview');
  const [dropdownOpen, setDropdown]   = useState(false);
  const [filterPillsVisible, setPillsVisible] = useState(false);
  const [selectedPill, setSelectedPill] = useState('All');
  const [chartMetric, setChartMetric] = useState<EduChartMetric>('enrollment');
  const [expandedCourseId, setExpandedCourseId]   = useState<string | null>(null);
  const [expandedCatalogId, setExpandedCatalogId] = useState<string | null>(null);
  const [expandedDeptId, setExpandedDeptId]       = useState<string | null>(null);
  const [expandedOrgId, setExpandedOrgId]         = useState<string | null>(null);
  const [registeredCourses, setRegistered]  = useState<Set<string>>(new Set());
  const [joinedOrgs, setJoinedOrgs]         = useState<Set<string>>(new Set(['org2']));
  const [showMaintenanceForm, setShowMaint] = useState(false);
  const [maintText, setMaintText]           = useState('');

  const pillsRevealAnim = useRef(new Animated.Value(0)).current;
  const lastScrollY     = useRef(0);
  const topBarH         = insets.top + TOP_BAR_H;
  const contentPaddingTop = topBarH + (filterPillsVisible ? PILL_ROW_H : 0) + 8;

  const pills = pillsForTab(activeTab, role);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  const togglePills = useCallback(() => {
    setPillsVisible(prev => {
      const next = !prev;
      Animated.timing(pillsRevealAnim, { toValue: next ? 1 : 0, duration: 200, useNativeDriver: false }).start();
      return next;
    });
  }, [pillsRevealAnim]);

  const handleTabSelect = useCallback((tab: EduTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    setDropdown(false);
    setSelectedPill('All');
    setPillsVisible(false);
    pillsRevealAnim.setValue(0);
  }, [pillsRevealAnim]);

  const handleRoleChange = useCallback(() => {
    Haptics.selectionAsync();
    setRole(r => {
      const next = nextRole(r);
      setSelectedPill('All');
      setPillsVisible(false);
      pillsRevealAnim.setValue(0);
      return next;
    });
  }, [pillsRevealAnim]);

  // ── Admin Overview ────────────────────────────────────────────────────────

  const renderAdminOverview = () => {
    const a = EDUCATION_ANALYTICS;
    const showAll  = selectedPill === 'All';
    const showEnrl = showAll || selectedPill === 'Enrollment';
    const showFin  = showAll || selectedPill === 'Financial';
    const showAccr = showAll || selectedPill === 'Accreditation';
    const showApps = showAll || selectedPill === 'Applications';

    return (
      <ScrollView onScroll={handleScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}>

        {/* Stats */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {(showAll || showEnrl) && <StatCard icon="person.3.fill" value={a.totalEnrollment.toLocaleString()} label="Enrolled" trend={a.enrollmentTrend} C={C} />}
          {showEnrl && <StatCard icon="arrow.up.right.circle.fill" value={`${a.retentionRate}%`} label="Retention" trend={a.retentionTrend} C={C} />}
          {showEnrl && <StatCard icon="graduationcap.fill" value={`${a.graduationRate}%`} label="Graduation" trend={a.graduationTrend} C={C} />}
          {showEnrl && <StatCard icon="chart.bar.fill" value={String(a.avgGpa)} label="Avg GPA" trend={a.gpaTrend} C={C} />}
          {showFin && <StatCard icon="dollarsign.circle.fill" value={`$${(a.financialAid / 1000000).toFixed(1)}M`} label="Fin Aid" trend={a.financialAidTrend} C={C} />}
          {(showAll || showApps) && <StatCard icon="tray.fill" value={String(a.applicationsPending)} label="Applications" trend={a.applicationsTrend} C={C} />}
        </ScrollView>

        {/* Chart */}
        {(showAll || showEnrl) && (
          <>
            <SecH title="Semester Trend" C={C} />
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              {(['enrollment', 'retention', 'graduation'] as EduChartMetric[]).map(m => (
                <Pressable key={m}
                  style={[s.metBtn, chartMetric === m ? { backgroundColor: C.label } : { borderColor: C.separator, borderWidth: 1 }]}
                  onPress={() => { Haptics.selectionAsync(); setChartMetric(m); }}>
                  <Text style={[s.metBtnTxt, { color: chartMetric === m ? C.bg : C.secondary }]}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
            <EduBarChart metric={chartMetric} C={C} />
          </>
        )}

        {/* Accreditation */}
        {(showAll || showAccr) && (
          <>
            <SecH title="Accreditation" C={C} />
            <View style={[s.accrCard, { backgroundColor: '#5A8A6E18', borderColor: '#5A8A6E44' }]}>
              <View style={s.accrRow}>
                <IconSymbol name="checkmark.seal.fill" size={24} color="#5A8A6E" />
                <View style={s.accrInfo}>
                  <Text style={[s.accrBody, { color: C.label }]}>{EDUCATION_PROFILE.accreditation}</Text>
                  <Text style={[s.accrStatus, { color: '#5A8A6E' }]}>{EDUCATION_PROFILE.accreditationStatus}</Text>
                </View>
                <View>
                  <Text style={[s.accrNextLbl, { color: C.muted }]}>Next Review</Text>
                  <Text style={[s.accrNextDate, { color: C.label }]}>{EDUCATION_PROFILE.accreditationNext}</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Applications */}
        {(showAll || showApps) && (
          <>
            <SecH title="Quick Actions" C={C} />
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Applications', icon: 'tray.fill', action: () => {} },
                { label: 'Announce',     icon: 'megaphone.fill', action: () => router.push('/(tabs)/(main)/hub/edu-announcement' as any) },
                { label: 'Run Report',   icon: 'chart.bar.doc.horizontal', action: () => {} },
              ].map(btn => (
                <Pressable key={btn.label} style={[s.actionBtn, { backgroundColor: C.surface }]} onPress={btn.action}>
                  <IconSymbol name={btn.icon as any} size={20} color={C.accent} />
                  <Text style={[s.actionBtnTxt, { color: C.label }]}>{btn.label}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Activity */}
        {showAll && (
          <>
            <SecH title="Recent Activity" C={C} />
            <View style={[s.section, { backgroundColor: C.surface }]}>
              {ADMIN_ACTIVITY.map((item, idx) => (
                <View key={item.id} style={[s.actRow, idx < ADMIN_ACTIVITY.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
                  <View style={[s.actIcon, { backgroundColor: C.surfacePressed }]}>
                    <IconSymbol name={item.icon as any} size={15} color={item.type === 'financial' ? '#5A8A6E' : item.type === 'grade' ? C.accent : C.secondary} />
                  </View>
                  <View style={s.actInfo}>
                    <Text style={[s.actMsg, { color: C.label }]} numberOfLines={1}>{item.message}</Text>
                    <Text style={[s.actDetail, { color: C.secondary }]}>{item.detail} · {item.timeAgo}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    );
  };

  // ── Student Overview ──────────────────────────────────────────────────────

  const renderStudentOverview = () => {
    const p = EDUCATION_PROFILE;
    const sp = STUDENT_PROFILE;
    return (
      <ScrollView onScroll={handleScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}>
        {/* Hero */}
        <View style={s.heroCenter}>
          <View style={[s.heroAvatar, { backgroundColor: `hsl(${p.coverHue},55%,30%)` }]}>
            <Text style={s.heroAvatarTxt}>{p.avatarInitials}</Text>
          </View>
          <Text style={[s.heroName, { color: C.label }]}>{p.name}</Text>
          <Text style={[s.heroTagline, { color: C.secondary }]}>{p.tagline}</Text>
          <Text style={[s.heroEst, { color: C.muted }]}>Est. {p.established} · {p.location}</Text>
        </View>

        {/* Student card */}
        <View style={[s.studentCard, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <View style={s.studentCardRow}>
            <View>
              <Text style={[s.studentName, { color: C.label }]}>{sp.name}</Text>
              <Text style={[s.studentMeta, { color: C.secondary }]}>{sp.year} · {sp.major}</Text>
              <Text style={[s.studentId, { color: C.muted }]}>{sp.id}</Text>
            </View>
            <View style={s.studentCardRight}>
              <Text style={[s.gpaNum, { color: C.accent }]}>{sp.gpa}</Text>
              <Text style={[s.gpaLbl, { color: C.secondary }]}>GPA</Text>
            </View>
          </View>
          {sp.deansListSemesters.length > 0 && (
            <View style={[s.deansListBadge, { backgroundColor: '#5A8A6E18' }]}>
              <IconSymbol name="star.fill" size={12} color="#5A8A6E" />
              <Text style={[s.deansListText, { color: '#5A8A6E' }]}>
                Dean's List: {sp.deansListSemesters.join(', ')}
              </Text>
            </View>
          )}
        </View>

        {/* Quick Links */}
        <SecH title="Quick Access" C={C} />
        <View style={s.quickGrid}>
          {[
            { label: 'My Classes',     icon: 'book.fill',                  action: () => { setActiveTab('Academics'); setSelectedPill('My Courses'); } },
            { label: 'My Grades',      icon: 'chart.bar.fill',             action: () => { setActiveTab('Academics'); setSelectedPill('Grades'); } },
            { label: 'Financial Aid',  icon: 'dollarsign.circle.fill',     action: () => {} },
            { label: 'My Advisor',     icon: 'person.crop.circle.badge.checkmark', action: () => {} },
          ].map(ql => (
            <Pressable key={ql.label} style={[s.quickBtn, { backgroundColor: C.surface }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); ql.action(); }}>
              <IconSymbol name={ql.icon as any} size={22} color={C.accent} />
              <Text style={[s.quickBtnTxt, { color: C.label }]}>{ql.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Academic Calendar */}
        <SecH title="Academic Calendar" C={C} />
        <View style={[s.section, { backgroundColor: C.surface }]}>
          {ACADEMIC_CALENDAR.slice(0, 5).map((ev, idx) => (
            <View key={ev.label} style={[s.calRow, idx < 4 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
              <Text style={[s.calLabel, { color: C.label }]}>{ev.label}</Text>
              <Text style={[s.calDate, { color: C.secondary }]}>{ev.date}</Text>
            </View>
          ))}
        </View>

        {/* Stats */}
        <SecH title="By the Numbers" C={C} />
        <View style={[s.statsCard, { backgroundColor: C.surface }]}>
          {[
            { label: 'Students', value: EDUCATION_ANALYTICS.totalEnrollment.toLocaleString() },
            { label: 'Programs', value: String(p.programs) },
            { label: 'Stu:Faculty', value: p.studentFacultyRatio },
          ].map((st, idx) => (
            <React.Fragment key={st.label}>
              {idx > 0 && <View style={[s.statsDivider, { backgroundColor: C.separator }]} />}
              <View style={s.statsItem}>
                <Text style={[s.statsNum, { color: C.label }]}>{st.value}</Text>
                <Text style={[s.statsLbl, { color: C.secondary }]}>{st.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    );
  };

  // ── Parent Overview ───────────────────────────────────────────────────────

  const renderParentOverview = () => {
    const sp = STUDENT_PROFILE;
    const fa = sp.financialAid;
    return (
      <ScrollView onScroll={handleScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}>
        {/* Student Card */}
        <SecH title="Your Student" C={C} />
        <View style={[s.studentCard, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <View style={s.studentCardRow}>
            <View>
              <Text style={[s.studentName, { color: C.label }]}>{sp.name}</Text>
              <Text style={[s.studentMeta, { color: C.secondary }]}>{sp.year} · {sp.major}</Text>
              <Text style={[s.studentId, { color: C.muted }]}>{sp.enrollmentStatus}</Text>
            </View>
            <View style={s.studentCardRight}>
              <Text style={[s.gpaNum, { color: C.accent }]}>{sp.gpa}</Text>
              <Text style={[s.gpaLbl, { color: C.secondary }]}>GPA</Text>
            </View>
          </View>
        </View>

        {/* Courses */}
        <SecH title="Current Classes" C={C} />
        <View style={[s.section, { backgroundColor: C.surface }]}>
          {MY_COURSES.map((c, idx) => (
            <View key={c.id} style={[s.parentCourse, idx < MY_COURSES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
              <Text style={[s.parentCourseName, { color: C.label }]}>{c.title}</Text>
              <Text style={[s.parentCourseMeta, { color: C.secondary }]}>{c.schedule}</Text>
              <View style={[s.parentGrade, { backgroundColor: `${C.accent}18` }]}>
                <Text style={[s.parentGradeText, { color: C.accent }]}>{c.grade}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Financial */}
        <SecH title="Financial Account" C={C} />
        <View style={[s.finCard, { backgroundColor: C.surface }]}>
          <View style={s.finRow}>
            <Text style={[s.finLabel, { color: C.secondary }]}>Tuition Charged</Text>
            <Text style={[s.finValue, { color: C.label }]}>${fa.tuitionCharged.toLocaleString()}</Text>
          </View>
          <View style={s.finRow}>
            <Text style={[s.finLabel, { color: C.secondary }]}>Aid Applied</Text>
            <Text style={[s.finValue, { color: '#5A8A6E' }]}>-${fa.aidApplied.toLocaleString()}</Text>
          </View>
          <View style={[s.finRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, paddingTop: 10, marginTop: 4 }]}>
            <Text style={[s.finLabel, { color: C.label, fontWeight: '700' }]}>Balance Due</Text>
            <Text style={[s.finBalance, { color: fa.balance > 0 ? '#3B82F6' : '#5A8A6E' }]}>${fa.balance.toLocaleString()}</Text>
          </View>
          <Text style={[s.finDue, { color: C.muted }]}>Due {fa.dueDate}</Text>
          <Pressable style={[s.finBtn, { backgroundColor: C.label }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <Text style={[s.finBtnTxt, { color: C.bg }]}>Make Payment</Text>
          </Pressable>
        </View>

        {/* Advisor */}
        <SecH title="Academic Advisor" C={C} />
        <View style={[s.advisorCard, { backgroundColor: C.surface }]}>
          <View style={[s.advisorAvatar, { backgroundColor: C.surfacePressed }]}>
            <Text style={[s.advisorInitials, { color: C.label }]}>PM</Text>
          </View>
          <View style={s.advisorInfo}>
            <Text style={[s.advisorName, { color: C.label }]}>{sp.advisorName}</Text>
            <Text style={[s.advisorHandle, { color: C.secondary }]}>{sp.advisorHandle}</Text>
          </View>
          <Pressable style={[s.advisorBtn, { backgroundColor: C.accent }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <Text style={s.advisorBtnTxt}>Contact</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  };

  // ── Admin Academics ───────────────────────────────────────────────────────

  const renderAdminAcademics = () => {
    const showAll   = selectedPill === 'All';
    const showDepts = showAll || selectedPill === 'Departments';
    const showCrs   = showAll || selectedPill === 'Courses';

    return (
      <ScrollView onScroll={handleScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}>
        {showDepts && (
          <>
            <SecH title="Departments" C={C} />
            {EDUCATION_DEPARTMENTS.map(d => (
              <DeptCard key={d.id} dept={d} expanded={expandedDeptId === d.id}
                onToggle={() => setExpandedDeptId(expandedDeptId === d.id ? null : d.id)} C={C} />
            ))}
            <Pressable style={[s.createBtn, { borderColor: C.separator }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
              <IconSymbol name="plus" size={16} color={C.accent} />
              <Text style={[s.createBtnTxt, { color: C.accent }]}>Add Department</Text>
            </Pressable>
          </>
        )}
        {showCrs && (
          <>
            <SecH title="Course Catalog" C={C} />
            {COURSE_CATALOG.map(c => (
              <View key={c.id} style={[s.adminCourse, { backgroundColor: C.surface }]}>
                <View style={s.adminCourseLeft}>
                  <Text style={[s.adminCourseTitle, { color: C.label }]}>{c.title}</Text>
                  <Text style={[s.adminCourseMeta, { color: C.secondary }]}>{c.code} · {c.instructor} · {c.schedule}</Text>
                </View>
                <View style={s.adminCourseRight}>
                  <Text style={[s.adminSeats, { color: c.enrollment >= c.capacity ? '#B85C5C' : '#5A8A6E' }]}>
                    {c.enrollment}/{c.capacity}
                  </Text>
                  <Text style={[s.adminSeatsLbl, { color: C.muted }]}>enrolled</Text>
                </View>
              </View>
            ))}
            <Pressable style={[s.createBtn, { borderColor: C.separator }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
              <IconSymbol name="plus" size={16} color={C.accent} />
              <Text style={[s.createBtnTxt, { color: C.accent }]}>Create Course</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    );
  };

  // ── Student Academics ─────────────────────────────────────────────────────

  const renderStudentAcademics = () => {
    const sp = STUDENT_PROFILE;
    if (selectedPill === 'Degree Progress') {
      return (
        <ScrollView onScroll={handleScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}>
          <SecH title="Degree Progress" C={C} />
          <DegreeProgressSection C={C} />
        </ScrollView>
      );
    }
    if (selectedPill === 'Catalog') {
      return (
        <ScrollView onScroll={handleScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}>
          <SecH title="Course Catalog" C={C} />
          {COURSE_CATALOG.map(c => (
            <CatalogCourse key={c.id} course={c} registered={registeredCourses.has(c.id)}
              onRegister={() => setRegistered(prev => new Set([...prev, c.id]))} C={C} />
          ))}
        </ScrollView>
      );
    }
    if (selectedPill === 'Grades') {
      return (
        <ScrollView onScroll={handleScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}>
          <SecH title="My Grades" C={C} />
          <View style={[s.section, { backgroundColor: C.surface }]}>
            <View style={s.gpaHeader}>
              <Text style={[s.gpaBig, { color: C.accent }]}>{sp.gpa}</Text>
              <Text style={[s.gpaHeaderLbl, { color: C.secondary }]}>Cumulative GPA</Text>
              {sp.deansListSemesters.length > 0 && (
                <View style={[s.deansListBadge, { backgroundColor: '#5A8A6E18' }]}>
                  <IconSymbol name="star.fill" size={12} color="#5A8A6E" />
                  <Text style={[s.deansListText, { color: '#5A8A6E' }]}>Dean's List</Text>
                </View>
              )}
            </View>
          </View>
          <SecH title="Current Semester" C={C} />
          <View style={[s.section, { backgroundColor: C.surface }]}>
            {MY_COURSES.map((c, idx) => {
              const gc = c.grade.startsWith('A') ? '#5A8A6E' : c.grade.startsWith('B') ? C.label : '#3B82F6';
              return (
                <View key={c.id} style={[s.gradeRow, idx < MY_COURSES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
                  <View style={s.gradeInfo}>
                    <Text style={[s.gradeCourse, { color: C.label }]}>{c.title}</Text>
                    <Text style={[s.gradeCode, { color: C.secondary }]}>{c.code}</Text>
                  </View>
                  <Text style={[s.gradeLetter, { color: gc }]}>{c.grade}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      );
    }
    // All or My Courses
    return (
      <ScrollView onScroll={handleScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}>
        <SecH title="My Courses" C={C} />
        {MY_COURSES.map(c => (
          <CourseRow key={c.id} course={c} expanded={expandedCourseId === c.id}
            onToggle={() => setExpandedCourseId(expandedCourseId === c.id ? null : c.id)}
            router={router} C={C} />
        ))}
        {selectedPill === 'All' && (
          <>
            <SecH title="Degree Progress" C={C} />
            <DegreeProgressSection C={C} />
            <SecH title="Academic Advisor" C={C} />
            <View style={[s.advisorCard, { backgroundColor: C.surface }]}>
              <View style={[s.advisorAvatar, { backgroundColor: C.surfacePressed }]}>
                <Text style={[s.advisorInitials, { color: C.label }]}>PM</Text>
              </View>
              <View style={s.advisorInfo}>
                <Text style={[s.advisorName, { color: C.label }]}>{sp.advisorName}</Text>
                <Text style={[s.advisorHandle, { color: C.secondary }]}>{sp.advisorHandle}</Text>
              </View>
              <Pressable style={[s.advisorBtn, { backgroundColor: C.accent }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <Text style={s.advisorBtnTxt}>Meet</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    );
  };

  // ── Parent Academics ──────────────────────────────────────────────────────

  const renderParentAcademics = () => (
    <ScrollView onScroll={handleScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}>
      <SecH title="Current Courses" C={C} />
      <View style={[s.section, { backgroundColor: C.surface }]}>
        {MY_COURSES.map((c, idx) => (
          <View key={c.id} style={[s.parentCourse, idx < MY_COURSES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
            <Text style={[s.parentCourseName, { color: C.label }]}>{c.title}</Text>
            <Text style={[s.parentCourseMeta, { color: C.secondary }]}>{c.schedule} · {c.instructor}</Text>
            <View style={[s.parentGrade, { backgroundColor: `${C.accent}18` }]}>
              <Text style={[s.parentGradeText, { color: C.accent }]}>{c.grade}</Text>
            </View>
          </View>
        ))}
      </View>
      <SecH title="Degree Progress" C={C} />
      <DegreeProgressSection C={C} />
    </ScrollView>
  );

  // ── Admin Student Life ────────────────────────────────────────────────────

  const renderAdminStudentLife = () => {
    const showAll  = selectedPill === 'All';
    const showClub = showAll || selectedPill === 'Clubs';
    return (
      <ScrollView onScroll={handleScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}>
        {showClub && (
          <>
            <SecH title="Clubs & Organizations" C={C} />
            {CAMPUS_ORGS.map(org => (
              <View key={org.id} style={[s.adminOrgCard, { backgroundColor: C.surface }]}>
                <Text style={[s.adminOrgName, { color: C.label }]}>{org.name}</Text>
                <Text style={[s.adminOrgMeta, { color: C.secondary }]}>Pres: {org.president} · {org.memberCount} members</Text>
                <Text style={[s.adminOrgSched, { color: C.muted }]}>{org.schedule}</Text>
              </View>
            ))}
            <Pressable style={[s.createBtn, { borderColor: C.separator }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
              <IconSymbol name="plus" size={16} color={C.accent} />
              <Text style={[s.createBtnTxt, { color: C.accent }]}>Create Organization</Text>
            </Pressable>
          </>
        )}
        {(showAll || selectedPill === 'Housing') && (
          <>
            <SecH title="Housing Overview" C={C} />
            <View style={[s.housingCard, { backgroundColor: C.surface }]}>
              {[
                { label: 'Morrison Hall',  occupancy: '94%', rooms: 120 },
                { label: 'Lincoln Hall',   occupancy: '88%', rooms: 80 },
                { label: 'Heritage House', occupancy: '72%', rooms: 60 },
              ].map((h, idx) => (
                <View key={h.label} style={[s.housingRow, idx < 2 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
                  <Text style={[s.housingName, { color: C.label }]}>{h.label}</Text>
                  <Text style={[s.housingOcc, { color: C.secondary }]}>{h.rooms} rooms · {h.occupancy} full</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    );
  };

  // ── Student Student Life ──────────────────────────────────────────────────

  const renderStudentStudentLife = () => {
    const sp = STUDENT_PROFILE;
    const showAll   = selectedPill === 'All';
    const showClub  = showAll || selectedPill === 'Clubs';
    const showMyOrg = selectedPill === 'My Orgs';
    const showHouse = showAll || selectedPill === 'Housing';
    const showDine  = showAll || selectedPill === 'Dining';
    const showRes   = showAll || selectedPill === 'Resources';

    const orgsToShow = showMyOrg
      ? CAMPUS_ORGS.filter(o => joinedOrgs.has(o.id))
      : CAMPUS_ORGS;

    return (
      <ScrollView onScroll={handleScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}>
        {(showClub || showMyOrg) && (
          <>
            <SecH title={showMyOrg ? 'My Organizations' : 'Clubs & Organizations'} C={C} />
            {orgsToShow.map(org => (
              <OrgCard key={org.id} org={org} expanded={expandedOrgId === org.id}
                onToggle={() => setExpandedOrgId(expandedOrgId === org.id ? null : org.id)}
                isJoined={joinedOrgs.has(org.id)}
                onJoin={() => setJoinedOrgs(prev => new Set([...prev, org.id]))} C={C} />
            ))}
          </>
        )}
        {showHouse && (
          <>
            <SecH title="My Housing" C={C} />
            <View style={[s.section, { backgroundColor: C.surface }]}>
              <View style={[s.housingRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
                <Text style={[s.housingName, { color: C.label }]}>{sp.housing.building}</Text>
                <Text style={[s.housingOcc, { color: C.secondary }]}>Room {sp.housing.room}</Text>
              </View>
              <View style={s.housingRow}>
                <Text style={[s.housingName, { color: C.label }]}>Roommate</Text>
                <Text style={[s.housingOcc, { color: C.secondary }]}>{sp.housing.roommate}</Text>
              </View>
            </View>
            {!showMaintenanceForm ? (
              <Pressable style={[s.maintBtn, { borderColor: C.separator }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowMaint(true); }}>
                <IconSymbol name="wrench.and.screwdriver" size={16} color={C.accent} />
                <Text style={[s.maintBtnTxt, { color: C.accent }]}>Submit Maintenance Request</Text>
              </Pressable>
            ) : (
              <View style={[s.maintForm, { backgroundColor: C.surface }]}>
                <Text style={[s.maintFormTitle, { color: C.label }]}>Maintenance Request</Text>
                <TextInput
                  style={[s.maintInput, { color: C.label, borderColor: C.inputBorder }]}
                  value={maintText} onChangeText={setMaintText}
                  placeholder="Describe the issue…" placeholderTextColor={C.muted}
                  multiline textAlignVertical="top"
                />
                <View style={s.maintFormBtns}>
                  <Pressable style={[s.maintFormBtn, { borderWidth: 1, borderColor: C.separator }]} onPress={() => setShowMaint(false)}>
                    <Text style={[s.maintFormBtnTxt, { color: C.secondary }]}>Cancel</Text>
                  </Pressable>
                  <Pressable style={[s.maintFormBtn, { backgroundColor: C.accent }]} onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setShowMaint(false); setMaintText(''); }}>
                    <Text style={[s.maintFormBtnTxt, { color: '#fff' }]}>Submit</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </>
        )}
        {showDine && (
          <>
            <SecH title="Dining" C={C} />
            <View style={[s.section, { backgroundColor: C.surface }]}>
              <View style={[s.housingRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
                <Text style={[s.housingName, { color: C.label }]}>Meal Plan</Text>
                <Text style={[s.housingOcc, { color: C.secondary }]}>14 meals/week</Text>
              </View>
              <View style={[s.housingRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
                <Text style={[s.housingName, { color: C.label }]}>Balance</Text>
                <Text style={[s.housingOcc, { color: '#5A8A6E' }]}>$142.50</Text>
              </View>
              <View style={s.housingRow}>
                <Text style={[s.housingName, { color: C.label }]}>Cafeteria Hours</Text>
                <Text style={[s.housingOcc, { color: C.secondary }]}>7 AM – 9 PM</Text>
              </View>
            </View>
          </>
        )}
        {showRes && (
          <>
            <SecH title="Campus Resources" C={C} />
            {[
              { label: 'Tutoring Center',   detail: 'Mon–Fri 9 AM–6 PM',   icon: 'pencil.and.outline' },
              { label: 'Library',           detail: 'Open 8 AM–10 PM',     icon: 'books.vertical.fill' },
              { label: 'Health Services',   detail: 'Campus Clinic Bldg A', icon: 'cross.fill' },
              { label: 'Career Center',     detail: 'Student Union Rm 110', icon: 'briefcase.fill' },
            ].map(r => (
              <Pressable key={r.label} style={[s.resourceRow, { backgroundColor: C.surface }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <View style={[s.resourceIcon, { backgroundColor: C.surfacePressed }]}>
                  <IconSymbol name={r.icon as any} size={18} color={C.accent} />
                </View>
                <View style={s.resourceInfo}>
                  <Text style={[s.resourceName, { color: C.label }]}>{r.label}</Text>
                  <Text style={[s.resourceDetail, { color: C.secondary }]}>{r.detail}</Text>
                </View>
                <IconSymbol name="chevron.right" size={14} color={C.muted} />
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    );
  };

  // ── Parent Student Life ───────────────────────────────────────────────────

  const renderParentStudentLife = () => {
    const sp = STUDENT_PROFILE;
    return (
      <ScrollView onScroll={handleScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}>
        <SecH title="Housing" C={C} />
        <View style={[s.section, { backgroundColor: C.surface }]}>
          <View style={[s.housingRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
            <Text style={[s.housingName, { color: C.label }]}>{sp.housing.building}</Text>
            <Text style={[s.housingOcc, { color: C.secondary }]}>Room {sp.housing.room}</Text>
          </View>
          <View style={s.housingRow}>
            <Text style={[s.housingName, { color: C.label }]}>Roommate</Text>
            <Text style={[s.housingOcc, { color: C.secondary }]}>{sp.housing.roommate}</Text>
          </View>
        </View>
        <SecH title="Meal Plan" C={C} />
        <View style={[s.section, { backgroundColor: C.surface }]}>
          <View style={[s.housingRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
            <Text style={[s.housingName, { color: C.label }]}>Plan</Text>
            <Text style={[s.housingOcc, { color: C.secondary }]}>14 meals / week</Text>
          </View>
          <View style={s.housingRow}>
            <Text style={[s.housingName, { color: C.label }]}>Dining Balance</Text>
            <Text style={[s.housingOcc, { color: '#5A8A6E' }]}>$142.50 remaining</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const renderContent = () => {
    if (activeTab === 'Overview') {
      if (role === 'admin')   return renderAdminOverview();
      if (role === 'student') return renderStudentOverview();
      return renderParentOverview();
    }
    if (activeTab === 'Academics') {
      if (role === 'admin')   return renderAdminAcademics();
      if (role === 'student') return renderStudentAcademics();
      return renderParentAcademics();
    }
    if (role === 'admin')   return renderAdminStudentLife();
    if (role === 'student') return renderStudentStudentLife();
    return renderParentStudentLife();
  };

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      {renderContent()}

      {/* ── Fixed Top Bar ── */}
      <View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={s.topBar}>
          <View style={s.topBarSide}>
            {role === 'admin' ? (
              <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
                <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
              </Pressable>
            ) : null}
          </View>

          <View style={s.dropdownPillWrap}>
            <Pressable style={[s.dropdownPill, { backgroundColor: C.surfacePressed }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDropdown(v => !v); }}>
              <Text style={[s.dropdownPillTxt, { color: C.label }]}>{activeTab}</Text>
              <IconSymbol name="chevron.down" size={12} color={C.secondary} />
            </Pressable>
          </View>

          <View style={[s.topBarSide, { alignItems: 'flex-end', flexDirection: 'row', gap: 10 }]}>
            <Pressable style={[s.roleToggle, { backgroundColor: role === 'admin' ? C.accent : role === 'student' ? C.label : C.surfacePressed }]}
              onPress={handleRoleChange}>
              <Text style={[s.roleToggleTxt, { color: role === 'parent' ? C.secondary : '#fff' }]}>
                {roleLabel(role)}
              </Text>
            </Pressable>
            {pills.length > 0 && (
              <Pressable onPress={togglePills} hitSlop={12}>
                <IconSymbol
                  name={filterPillsVisible || selectedPill !== 'All' ? 'line.3.horizontal.decrease.circle.fill' : 'line.3.horizontal.decrease.circle'}
                  size={22}
                  color={filterPillsVisible || selectedPill !== 'All' ? C.accent : C.label}
                />
              </Pressable>
            )}
          </View>
        </View>

        {/* Pills */}
        <Animated.View style={{ height: pillsRevealAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILL_ROW_H] }), opacity: pillsRevealAnim, overflow: 'hidden' }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillsContent}
            style={[s.pillsRow, { borderTopColor: C.separator }]}>
            {pills.map(pill => {
              const active = pill === selectedPill;
              return (
                <Pressable key={pill} style={[s.pill, active ? { backgroundColor: C.label } : { borderColor: C.separator }]}
                  onPress={() => { Haptics.selectionAsync(); setSelectedPill(pill); }}>
                  <Text style={[s.pillTxt, { color: active ? C.bg : C.secondary }, active && { fontWeight: '600' }]}>{pill}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>

      {/* Dropdown */}
      {dropdownOpen && (
        <>
          <Pressable style={[StyleSheet.absoluteFillObject, { zIndex: 98 }]} onPress={() => setDropdown(false)} />
          <View style={[s.dropdown, { top: insets.top + 56, backgroundColor: C.bg, borderColor: C.separator, zIndex: 99 }]}>
            {(['Overview', 'Academics', 'Student Life'] as EduTab[]).map(tab => (
              <Pressable key={tab} style={s.dropdownOption} onPress={() => handleTabSelect(tab)}>
                <Text style={[s.dropdownOptionTxt, { color: tab === activeTab ? C.label : C.secondary }, tab === activeTab && { fontWeight: '600' }]}>
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* Admin FAB */}
      {role === 'admin' && (
        <Pressable
          style={[s.fab, { bottom: insets.bottom + 49 + 16, backgroundColor: C.label }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/(tabs)/(main)/hub/edu-announcement' as any); }}
        >
          <IconSymbol name="megaphone.fill" size={20} color={C.bg} />
        </Pressable>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1 },
  topBarWrap:     { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar:         { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide:     { width: 86, justifyContent: 'center' },
  dropdownPillWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dropdownPill:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6 },
  dropdownPillTxt:{ fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  dropdown: {
    position: 'absolute', left: '50%', marginLeft: -110, minWidth: 220,
    borderRadius: 14, borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 12, elevation: 8, overflow: 'hidden',
  },
  dropdownOption:    { paddingVertical: 14, paddingHorizontal: 20 },
  dropdownOptionTxt: { fontSize: 15 },
  pillsRow:     { height: PILL_ROW_H, borderTopWidth: StyleSheet.hairlineWidth },
  pillsContent: { paddingHorizontal: 12, alignItems: 'center', gap: 8 },
  pill:         { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  pillTxt:      { fontSize: 13 },
  roleToggle:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  roleToggleTxt:  { fontSize: 11, fontWeight: '700' },
  section:   { borderRadius: 16, padding: 16, marginBottom: 20 },
  metBtn:    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  metBtnTxt: { fontSize: 12, fontWeight: '600' },
  actionBtn:  { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 6 },
  actionBtnTxt:{ fontSize: 12, fontWeight: '600' },
  actRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  actIcon:   { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actInfo:   { flex: 1 },
  actMsg:    { fontSize: 14, fontWeight: '500' },
  actDetail: { fontSize: 12, marginTop: 2 },
  accrCard:  { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 20 },
  accrRow:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  accrInfo:  { flex: 1 },
  accrBody:  { fontSize: 16, fontWeight: '700' },
  accrStatus:{ fontSize: 13, marginTop: 2 },
  accrNextLbl: { fontSize: 11 },
  accrNextDate:{ fontSize: 13, fontWeight: '600' },
  heroCenter:    { alignItems: 'center', paddingTop: 16, paddingBottom: 20 },
  heroAvatar:    { width: 72, height: 72, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  heroAvatarTxt: { fontSize: 24, fontWeight: '800', color: '#fff' },
  heroName:      { fontSize: 22, fontWeight: '800', marginBottom: 5 },
  heroTagline:   { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 6 },
  heroEst:       { fontSize: 12 },
  studentCard:   { borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1 },
  studentCardRow:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  studentName:   { fontSize: 17, fontWeight: '700' },
  studentMeta:   { fontSize: 13, marginTop: 3 },
  studentId:     { fontSize: 11, marginTop: 2 },
  studentCardRight: { alignItems: 'flex-end' },
  gpaNum:        { fontSize: 28, fontWeight: '800' },
  gpaLbl:        { fontSize: 12 },
  deansListBadge:{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginTop: 10, alignSelf: 'flex-start' },
  deansListText: { fontSize: 12, fontWeight: '600' },
  quickGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  quickBtn:      { width: '47%', borderRadius: 14, padding: 14, alignItems: 'center', gap: 8 },
  quickBtnTxt:   { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  calRow:        { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  calLabel:      { fontSize: 14, fontWeight: '500', flex: 1 },
  calDate:       { fontSize: 13 },
  statsCard:     { borderRadius: 14, flexDirection: 'row', overflow: 'hidden', marginBottom: 20 },
  statsItem:     { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statsNum:      { fontSize: 18, fontWeight: '800' },
  statsLbl:      { fontSize: 11, marginTop: 2 },
  statsDivider:  { width: StyleSheet.hairlineWidth },
  gpaHeader:     { alignItems: 'center', paddingVertical: 8, gap: 4 },
  gpaBig:        { fontSize: 40, fontWeight: '800' },
  gpaHeaderLbl:  { fontSize: 13 },
  gradeRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  gradeInfo:     { flex: 1 },
  gradeCourse:   { fontSize: 14, fontWeight: '600' },
  gradeCode:     { fontSize: 12, marginTop: 2 },
  gradeLetter:   { fontSize: 22, fontWeight: '800' },
  parentCourse:  { paddingVertical: 14, flexDirection: 'row', alignItems: 'center' },
  parentCourseName: { flex: 1, fontSize: 14, fontWeight: '600' },
  parentCourseMeta: { fontSize: 12, marginTop: 2 },
  parentGrade:   { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  parentGradeText:{ fontSize: 14, fontWeight: '800' },
  finCard:       { borderRadius: 16, padding: 16, marginBottom: 20, gap: 8 },
  finRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  finLabel:      { fontSize: 14 },
  finValue:      { fontSize: 14, fontWeight: '600' },
  finBalance:    { fontSize: 20, fontWeight: '800' },
  finDue:        { fontSize: 12, textAlign: 'right', marginTop: 2 },
  finBtn:        { paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  finBtnTxt:     { fontSize: 14, fontWeight: '700' },
  advisorCard:   { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, marginBottom: 20 },
  advisorAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  advisorInitials: { fontSize: 14, fontWeight: '700' },
  advisorInfo:   { flex: 1 },
  advisorName:   { fontSize: 15, fontWeight: '700' },
  advisorHandle: { fontSize: 12, marginTop: 2 },
  advisorBtn:    { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
  advisorBtnTxt: { fontSize: 13, fontWeight: '700', color: '#fff' },
  adminCourse:   { borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  adminCourseLeft:  { flex: 1 },
  adminCourseTitle: { fontSize: 13, fontWeight: '600' },
  adminCourseMeta:  { fontSize: 11, marginTop: 2 },
  adminCourseRight: { alignItems: 'flex-end' },
  adminSeats:    { fontSize: 14, fontWeight: '700' },
  adminSeatsLbl: { fontSize: 10 },
  adminOrgCard:  { borderRadius: 12, padding: 12, marginBottom: 8 },
  adminOrgName:  { fontSize: 14, fontWeight: '700' },
  adminOrgMeta:  { fontSize: 12, marginTop: 3 },
  adminOrgSched: { fontSize: 11, marginTop: 2 },
  housingCard:   { borderRadius: 14, padding: 16, marginBottom: 20 },
  housingRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11 },
  housingName:   { fontSize: 14, fontWeight: '600' },
  housingOcc:    { fontSize: 13 },
  maintBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', marginBottom: 20 },
  maintBtnTxt:   { fontSize: 13, fontWeight: '600' },
  maintForm:     { borderRadius: 14, padding: 14, marginBottom: 20, gap: 10 },
  maintFormTitle:{ fontSize: 14, fontWeight: '700' },
  maintInput:    { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, minHeight: 80 },
  maintFormBtns: { flexDirection: 'row', gap: 10 },
  maintFormBtn:  { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  maintFormBtnTxt:{ fontSize: 13, fontWeight: '700' },
  resourceRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 12, marginBottom: 8 },
  resourceIcon:  { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  resourceInfo:  { flex: 1 },
  resourceName:  { fontSize: 14, fontWeight: '600' },
  resourceDetail:{ fontSize: 12, marginTop: 2 },
  createBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', marginTop: 4, marginBottom: 24 },
  createBtnTxt:  { fontSize: 14, fontWeight: '600' },
  fab: {
    position: 'absolute', right: 24, width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4, zIndex: 20,
  },
});
