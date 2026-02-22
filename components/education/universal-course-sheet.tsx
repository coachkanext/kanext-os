/**
 * Universal Course Sheet — Education Mode
 * Course "truth page" with 9 RBAC-gated tabs.
 * This is the CONTENT component — the parent handles the bottom sheet wrapper.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import {
  type Course,
  type CourseSession,
  type Assignment,
  type Student,
  type StaffMember,
  STUDENTS,
  STAFF_MEMBERS,
  getSessionsByCourse,
  getAssignmentsByCourse,
  getGradesByCourse,
} from '@/data/mock-education-v2';

import {
  type EducationRoleLens,
  type CourseTab,
  getCourseSheetTabs,
  isFullAccess,
  isProgramDirector,
  canViewGrades,
} from '@/utils/education-rbac';

// =============================================================================
// PROPS
// =============================================================================

interface UniversalCourseSheetProps {
  course: Course;
  roleLens: EducationRoleLens;
  onClose: () => void;
  onSelectStudent?: (studentId: string) => void;
}

// =============================================================================
// STATUS / TYPE HELPERS
// =============================================================================

const COURSE_STATUS_COLORS: Record<string, string> = {
  active: '#22C55E',
  completed: '#A1A1AA',
  cancelled: '#EF4444',
  planned: '#1D9BF0',
};

const SESSION_TYPE_COLORS: Record<string, string> = {
  lecture: '#1D9BF0',
  lab: '#22C55E',
  seminar: '#F59E0B',
  exam: '#EF4444',
  workshop: '#A1A1AA',
};

const SESSION_STATUS_COLORS: Record<string, string> = {
  upcoming: '#1D9BF0',
  completed: '#22C55E',
  cancelled: '#EF4444',
  in_progress: '#F59E0B',
};

const ASSIGNMENT_TYPE_COLORS: Record<string, string> = {
  homework: '#1D9BF0',
  quiz: '#F59E0B',
  exam: '#EF4444',
  project: '#22C55E',
  paper: '#A1A1AA',
  presentation: '#1D9BF0',
  lab_report: '#22C55E',
};

const ASSIGNMENT_STATUS_COLORS: Record<string, string> = {
  upcoming: '#1D9BF0',
  open: '#22C55E',
  closed: '#A1A1AA',
  graded: '#22C55E',
};

const ATTENDANCE_RISK_COLORS: Record<string, string> = {
  good: '#22C55E',
  warning: '#F59E0B',
  critical: '#EF4444',
};

const COMPLIANCE_STATUS_COLORS: Record<string, string> = {
  compliant: '#22C55E',
  pending: '#F59E0B',
  non_compliant: '#EF4444',
  not_applicable: '#A1A1AA',
};

// =============================================================================
// INLINE MOCK DATA (course-specific)
// =============================================================================

const MOCK_COURSE_DESCRIPTION = 'This advanced course examines the strategic, operational, and organizational dimensions of sports management in the modern era. Students will explore topics including revenue management, facility operations, athlete relations, sponsorship strategy, media rights, and event management. The course integrates case studies from professional, collegiate, and international sports organizations.';

const MOCK_LEARNING_OBJECTIVES = [
  'Analyze organizational structures within professional and collegiate sports entities',
  'Evaluate strategic decision-making frameworks in sports business contexts',
  'Apply financial management principles to sports organization budgeting',
  'Develop comprehensive event management and operations plans',
  'Assess the impact of media rights and sponsorship on sports revenue models',
  'Examine ethical considerations in athlete management and representation',
];

const MOCK_PREREQUISITES = [
  { code: 'SMG-101', name: 'Introduction to Sports Management', status: 'required' as const },
  { code: 'BUS-200', name: 'Business Fundamentals', status: 'required' as const },
  { code: 'MTH-120', name: 'Statistics I', status: 'recommended' as const },
];

const MOCK_MATERIALS = [
  { title: 'Strategic Sports Management (4th Edition)', author: 'Johnson & Mitchell', type: 'textbook' as const, required: true },
  { title: 'Case Studies in Sports Business', author: 'Williams et al.', type: 'textbook' as const, required: true },
  { title: 'Harvard Business Review — Sports Industry Collection', author: 'Various', type: 'readings' as const, required: false },
  { title: 'Sports Analytics Toolkit (Online)', author: 'MIT Sloan', type: 'software' as const, required: false },
];

const MOCK_SYLLABUS_WEEKS = [
  { week: 1, topic: 'Course Introduction + Sports Industry Overview', readings: 'Ch. 1-2', assignments: 'Syllabus Quiz' },
  { week: 2, topic: 'Organizational Structures in Sports', readings: 'Ch. 3', assignments: 'Discussion Post 1' },
  { week: 3, topic: 'Revenue Management + Ticket Operations', readings: 'Ch. 4-5', assignments: 'Case Study 1' },
  { week: 4, topic: 'Facility Management + Operations', readings: 'Ch. 6', assignments: 'Group Project Proposal' },
  { week: 5, topic: 'Sponsorship Strategy + Activation', readings: 'Ch. 7-8', assignments: 'Discussion Post 2' },
  { week: 6, topic: 'Media Rights + Broadcasting', readings: 'Ch. 9', assignments: 'Midterm Exam' },
  { week: 7, topic: 'Athlete Management + Representation', readings: 'Ch. 10-11', assignments: 'Case Study 2' },
  { week: 8, topic: 'International Sports Management', readings: 'Ch. 12', assignments: 'Discussion Post 3' },
  { week: 9, topic: 'Ethics in Sports Business', readings: 'Ch. 13', assignments: 'Ethics Paper' },
  { week: 10, topic: 'Event Management + Game Day Ops', readings: 'Ch. 14-15', assignments: 'Operations Plan' },
  { week: 11, topic: 'Data Analytics in Sports', readings: 'Supplemental', assignments: 'Analytics Lab' },
  { week: 12, topic: 'Sports Marketing + Brand Strategy', readings: 'Ch. 16', assignments: 'Marketing Plan Draft' },
  { week: 13, topic: 'Legal Issues in Sports', readings: 'Ch. 17', assignments: 'Discussion Post 4' },
  { week: 14, topic: 'Future of Sports Industry', readings: 'Ch. 18', assignments: 'Group Presentation' },
  { week: 15, topic: 'Final Review + Project Presentations', readings: 'Review', assignments: 'Final Exam + Project' },
];

const MOCK_GRADING_BREAKDOWN = [
  { category: 'Midterm Exam', weight: 20, description: 'Comprehensive exam covering weeks 1-6' },
  { category: 'Final Exam', weight: 25, description: 'Cumulative final examination' },
  { category: 'Group Project', weight: 20, description: 'Team-based sports management case analysis' },
  { category: 'Case Studies', weight: 15, description: 'Two individual case study analyses' },
  { category: 'Discussion Posts', weight: 10, description: 'Four weekly discussion contributions' },
  { category: 'Participation', weight: 10, description: 'In-class engagement and attendance' },
];

const MOCK_SESSIONS = [
  { id: 'ses-1', date: 'Feb 17, 2026', topic: 'Sponsorship Strategy + Activation', type: 'lecture' as const, status: 'completed' as const, time: '9:00 AM - 10:15 AM' },
  { id: 'ses-2', date: 'Feb 19, 2026', topic: 'Sponsorship Workshop: Live Case', type: 'workshop' as const, status: 'completed' as const, time: '9:00 AM - 10:15 AM' },
  { id: 'ses-3', date: 'Feb 24, 2026', topic: 'Media Rights + Broadcasting: Overview', type: 'lecture' as const, status: 'upcoming' as const, time: '9:00 AM - 10:15 AM' },
  { id: 'ses-4', date: 'Feb 26, 2026', topic: 'Media Rights: Negotiation Simulation', type: 'seminar' as const, status: 'upcoming' as const, time: '9:00 AM - 10:15 AM' },
  { id: 'ses-5', date: 'Mar 2, 2026', topic: 'Midterm Review Session', type: 'lecture' as const, status: 'upcoming' as const, time: '9:00 AM - 10:15 AM' },
  { id: 'ses-6', date: 'Mar 4, 2026', topic: 'Midterm Exam', type: 'exam' as const, status: 'upcoming' as const, time: '9:00 AM - 10:15 AM' },
  { id: 'ses-7', date: 'Mar 9, 2026', topic: 'Athlete Management + Representation', type: 'lecture' as const, status: 'upcoming' as const, time: '9:00 AM - 10:15 AM' },
  { id: 'ses-8', date: 'Mar 11, 2026', topic: 'Agent Panel Discussion', type: 'seminar' as const, status: 'upcoming' as const, time: '9:00 AM - 10:15 AM' },
  { id: 'ses-9', date: 'Mar 16, 2026', topic: 'International Sports Management', type: 'lecture' as const, status: 'upcoming' as const, time: '9:00 AM - 10:15 AM' },
  { id: 'ses-10', date: 'Mar 18, 2026', topic: 'FIFA/IOC Case Study Workshop', type: 'workshop' as const, status: 'upcoming' as const, time: '9:00 AM - 10:15 AM' },
];

const MOCK_ROSTER = [
  { id: 'rost-1', studentId: 'STU-001', name: 'Marcus Johnson', status: 'enrolled' as const, lastAttendance: 'Feb 17, 2026', attendanceRate: 95 },
  { id: 'rost-2', studentId: 'STU-002', name: 'Aisha Williams', status: 'enrolled' as const, lastAttendance: 'Feb 17, 2026', attendanceRate: 100 },
  { id: 'rost-3', studentId: 'STU-003', name: 'David Chen', status: 'enrolled' as const, lastAttendance: 'Feb 17, 2026', attendanceRate: 88 },
  { id: 'rost-4', studentId: 'STU-004', name: 'Sophia Martinez', status: 'enrolled' as const, lastAttendance: 'Feb 14, 2026', attendanceRate: 76 },
  { id: 'rost-5', studentId: 'STU-005', name: 'Tyler Washington', status: 'enrolled' as const, lastAttendance: 'Feb 17, 2026', attendanceRate: 92 },
  { id: 'rost-6', studentId: 'STU-006', name: 'Emma Thompson', status: 'enrolled' as const, lastAttendance: 'Feb 17, 2026', attendanceRate: 100 },
  { id: 'rost-7', studentId: 'STU-007', name: 'Jordan Lee', status: 'enrolled' as const, lastAttendance: 'Feb 12, 2026', attendanceRate: 68 },
  { id: 'rost-8', studentId: 'STU-008', name: 'Olivia Brown', status: 'enrolled' as const, lastAttendance: 'Feb 17, 2026', attendanceRate: 96 },
  { id: 'rost-9', studentId: 'STU-009', name: 'Jamal Davis', status: 'enrolled' as const, lastAttendance: 'Feb 17, 2026', attendanceRate: 84 },
  { id: 'rost-10', studentId: 'STU-010', name: 'Grace Kim', status: 'enrolled' as const, lastAttendance: 'Feb 17, 2026', attendanceRate: 100 },
  { id: 'rost-11', studentId: 'STU-011', name: 'Nathan Park', status: 'enrolled' as const, lastAttendance: 'Feb 14, 2026', attendanceRate: 80 },
  { id: 'rost-12', studentId: 'STU-012', name: 'Isabella Nguyen', status: 'withdrawn' as const, lastAttendance: 'Jan 28, 2026', attendanceRate: 50 },
];

const MOCK_ASSIGNMENTS = [
  { id: 'asgn-1', title: 'Discussion Post 2: Sponsorship Ethics', type: 'homework' as const, dueDate: 'Feb 21, 2026', maxPoints: 20, status: 'open' as const },
  { id: 'asgn-2', title: 'Case Study 2: Nike Sponsorship Strategy', type: 'paper' as const, dueDate: 'Feb 28, 2026', maxPoints: 100, status: 'upcoming' as const },
  { id: 'asgn-3', title: 'Midterm Exam', type: 'exam' as const, dueDate: 'Mar 4, 2026', maxPoints: 200, status: 'upcoming' as const },
  { id: 'asgn-4', title: 'Group Project: Operations Plan Draft', type: 'project' as const, dueDate: 'Mar 20, 2026', maxPoints: 100, status: 'upcoming' as const },
  { id: 'asgn-5', title: 'Syllabus Quiz', type: 'quiz' as const, dueDate: 'Jan 24, 2026', maxPoints: 10, status: 'graded' as const },
  { id: 'asgn-6', title: 'Discussion Post 1: Industry Trends', type: 'homework' as const, dueDate: 'Jan 31, 2026', maxPoints: 20, status: 'graded' as const },
  { id: 'asgn-7', title: 'Case Study 1: Revenue Management at MSG', type: 'paper' as const, dueDate: 'Feb 7, 2026', maxPoints: 100, status: 'graded' as const },
  { id: 'asgn-8', title: 'Group Project Proposal', type: 'project' as const, dueDate: 'Feb 14, 2026', maxPoints: 50, status: 'graded' as const },
];

const MOCK_GRADE_DISTRIBUTION = {
  classAverage: 83.4,
  median: 85,
  high: 98,
  low: 62,
  distribution: [
    { range: 'A (90-100)', count: 3, percentage: 25 },
    { range: 'B (80-89)', count: 5, percentage: 42 },
    { range: 'C (70-79)', count: 2, percentage: 17 },
    { range: 'D (60-69)', count: 1, percentage: 8 },
    { range: 'F (<60)', count: 1, percentage: 8 },
  ],
};

const MOCK_FULL_GRADEBOOK = [
  { studentId: 'STU-001', name: 'Marcus Johnson', currentGrade: 'B+', percentage: 87 },
  { studentId: 'STU-002', name: 'Aisha Williams', currentGrade: 'A', percentage: 95 },
  { studentId: 'STU-003', name: 'David Chen', currentGrade: 'B', percentage: 83 },
  { studentId: 'STU-004', name: 'Sophia Martinez', currentGrade: 'C+', percentage: 78 },
  { studentId: 'STU-005', name: 'Tyler Washington', currentGrade: 'A-', percentage: 91 },
  { studentId: 'STU-006', name: 'Emma Thompson', currentGrade: 'A', percentage: 98 },
  { studentId: 'STU-007', name: 'Jordan Lee', currentGrade: 'D', percentage: 62 },
  { studentId: 'STU-008', name: 'Olivia Brown', currentGrade: 'B+', percentage: 88 },
  { studentId: 'STU-009', name: 'Jamal Davis', currentGrade: 'B-', percentage: 81 },
  { studentId: 'STU-010', name: 'Grace Kim', currentGrade: 'A-', percentage: 93 },
  { studentId: 'STU-011', name: 'Nathan Park', currentGrade: 'B', percentage: 84 },
];

const MOCK_OWN_GRADES = [
  { assignment: 'Syllabus Quiz', score: 9, maxPoints: 10, percentage: 90 },
  { assignment: 'Discussion Post 1', score: 18, maxPoints: 20, percentage: 90 },
  { assignment: 'Case Study 1', score: 85, maxPoints: 100, percentage: 85 },
  { assignment: 'Group Project Proposal', score: 44, maxPoints: 50, percentage: 88 },
];

const MOCK_ATTENDANCE_AGGREGATE = {
  averageAttendance: 88,
  totalSessions: 12,
  atRiskStudents: [
    { name: 'Jordan Lee', rate: 68, absences: 4 },
    { name: 'Sophia Martinez', rate: 76, absences: 3 },
    { name: 'Nathan Park', rate: 80, absences: 2 },
  ],
};

const MOCK_OWN_ATTENDANCE = [
  { date: 'Feb 17', status: 'present' as const },
  { date: 'Feb 14', status: 'present' as const },
  { date: 'Feb 12', status: 'present' as const },
  { date: 'Feb 10', status: 'present' as const },
  { date: 'Feb 7', status: 'present' as const },
  { date: 'Feb 5', status: 'late' as const },
  { date: 'Feb 3', status: 'present' as const },
  { date: 'Jan 31', status: 'present' as const },
  { date: 'Jan 29', status: 'present' as const },
  { date: 'Jan 27', status: 'absent' as const },
  { date: 'Jan 24', status: 'present' as const },
  { date: 'Jan 22', status: 'present' as const },
];

const OWN_ATTENDANCE_COLORS: Record<string, string> = {
  present: '#22C55E',
  absent: '#EF4444',
  late: '#F59E0B',
  excused: '#A1A1AA',
};

const MOCK_OPERATIONS = {
  room: 'BUS 204',
  capacity: 35,
  enrolled: 12,
  equipment: ['Projector + Screen', 'Whiteboard', 'Lecture Capture System', 'Student Polling Clickers'],
  tas: [
    { name: 'Rachel Foster', role: 'Teaching Assistant', hours: 10 },
    { name: 'Michael Osei', role: 'Grading Assistant', hours: 8 },
  ],
  conflicts: [
    { date: 'Mar 4, 2026', issue: 'Room BUS 204 reserved for faculty meeting 8-9 AM', resolution: 'Requested alternate room BUS 210' },
  ],
};

const MOCK_COMPLIANCE = {
  accommodationsCount: 2,
  titleIXStatus: 'compliant' as const,
  gradeDeadlines: [
    { milestone: 'Midterm Grades Due', date: 'Mar 13, 2026', status: 'upcoming' as const },
    { milestone: 'Final Grades Due', date: 'May 22, 2026', status: 'upcoming' as const },
    { milestone: 'Incomplete Grade Resolution', date: 'Jun 15, 2026', status: 'upcoming' as const },
  ],
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function UniversalCourseSheet({
  course,
  roleLens,
  onClose,
  onSelectStudent,
}: UniversalCourseSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const tabs = useMemo(() => getCourseSheetTabs(roleLens), [roleLens]);
  const [activeTab, setActiveTab] = useState<CourseTab>(tabs[0]?.id ?? 'overview');

  const fullAccess = isFullAccess(roleLens);
  const programDir = isProgramDirector(roleLens);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <CourseHeader
        course={course}
        roleLens={roleLens}
        colors={colors}
        fullAccess={fullAccess}
        programDir={programDir}
        onClose={onClose}
      />

      {/* ================================================================== */}
      {/* TAB BAR */}
      {/* ================================================================== */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              style={[
                styles.tabPill,
                {
                  backgroundColor: isActive ? '#FFFFFF' : colors.card,
                  borderColor: isActive ? '#FFFFFF' : colors.border,
                },
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <ThemedText
                style={[
                  styles.tabPillText,
                  { color: isActive ? '#000000' : colors.textSecondary },
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ================================================================== */}
      {/* TAB CONTENT */}
      {/* ================================================================== */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && <OverviewTab colors={colors} />}
        {activeTab === 'syllabus' && <SyllabusTab colors={colors} />}
        {activeTab === 'sessions' && <SessionsTab colors={colors} />}
        {activeTab === 'roster' && (
          <RosterTab colors={colors} onSelectStudent={onSelectStudent} />
        )}
        {activeTab === 'assignments' && <AssignmentsTab colors={colors} />}
        {activeTab === 'grades' && <GradesTab colors={colors} roleLens={roleLens} />}
        {activeTab === 'attendance' && <AttendanceTab colors={colors} roleLens={roleLens} />}
        {activeTab === 'operations' && <OperationsTab colors={colors} />}
        {activeTab === 'compliance' && <ComplianceTab colors={colors} />}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// HEADER
// =============================================================================

function CourseHeader({
  course,
  roleLens,
  colors,
  fullAccess,
  programDir,
  onClose,
}: {
  course: Course;
  roleLens: EducationRoleLens;
  colors: typeof Colors.light;
  fullAccess: boolean;
  programDir: boolean;
  onClose: () => void;
}) {
  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      {/* Top row: name + close */}
      <View style={styles.headerTopRow}>
        <View style={{ flex: 1 }}>
          <ThemedText style={[styles.courseName, { color: colors.text }]}>
            {course.name}
          </ThemedText>
          <ThemedText style={[styles.subtitleLabel, { color: colors.textSecondary }]}>
            {course.code} · {course.term}
          </ThemedText>
        </View>
        <Pressable onPress={onClose} hitSlop={12}>
          <IconSymbol name="xmark" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Instructor + Meeting Times */}
      <ThemedText style={[styles.instructorLabel, { color: colors.textSecondary }]}>
        {course.instructor} · {course.meetingTimes}
      </ThemedText>

      {/* Pills: status */}
      <View style={styles.pillRow}>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: (COURSE_STATUS_COLORS[course.status] ?? '#A1A1AA') + '1A' },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: COURSE_STATUS_COLORS[course.status] ?? '#A1A1AA' },
            ]}
          />
          <ThemedText
            style={[
              styles.statusPillText,
              { color: COURSE_STATUS_COLORS[course.status] ?? '#A1A1AA' },
            ]}
          >
            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
          </ThemedText>
        </View>
        <View style={[styles.creditsPill, { backgroundColor: '#1D9BF01A' }]}>
          <ThemedText style={[styles.creditsPillText, { color: '#1D9BF0' }]}>
            {course.credits} Credits
          </ThemedText>
        </View>
      </View>

      {/* Action icons */}
      <View style={styles.actionRow}>
        <ActionIcon icon="bubble.left.fill" label="Msg Class" colors={colors} />
        {(fullAccess || programDir) && (
          <ActionIcon icon="megaphone.fill" label="Announce" colors={colors} />
        )}
        {fullAccess && (
          <ActionIcon icon="square.and.arrow.up" label="Export" colors={colors} />
        )}
      </View>
    </View>
  );
}

function ActionIcon({
  icon,
  label,
  colors,
}: {
  icon: string;
  label: string;
  colors: typeof Colors.light;
}) {
  return (
    <Pressable style={styles.actionIconWrap}>
      <View style={[styles.actionIconCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name={icon as any} size={16} color={colors.textSecondary} />
      </View>
      <ThemedText style={[styles.actionIconLabel, { color: colors.textSecondary }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

// =============================================================================
// TAB 1: OVERVIEW
// =============================================================================

function OverviewTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <View>
      {/* Course Description */}
      <SectionCard title="Course Description" colors={colors}>
        <ThemedText style={[styles.bodyText, { color: colors.text }]}>
          {MOCK_COURSE_DESCRIPTION}
        </ThemedText>
      </SectionCard>

      {/* Learning Objectives */}
      <SectionCard title="Learning Objectives" colors={colors}>
        {MOCK_LEARNING_OBJECTIVES.map((objective, index) => (
          <View key={index} style={styles.objectiveRow}>
            <ThemedText style={[styles.objectiveNumber, { color: colors.textTertiary }]}>
              {index + 1}.
            </ThemedText>
            <ThemedText style={[styles.bodyText, { color: colors.text, flex: 1 }]}>
              {objective}
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      {/* Prerequisites */}
      <SectionCard title="Prerequisites" colors={colors}>
        {MOCK_PREREQUISITES.map((prereq, index) => (
          <View
            key={index}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {prereq.code} — {prereq.name}
              </ThemedText>
            </View>
            <View
              style={[
                styles.prereqBadge,
                { backgroundColor: prereq.status === 'required' ? '#EF444422' : '#1D9BF022' },
              ]}
            >
              <ThemedText
                style={[
                  styles.prereqText,
                  { color: prereq.status === 'required' ? '#EF4444' : '#1D9BF0' },
                ]}
              >
                {prereq.status.toUpperCase()}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>

      {/* Materials Required */}
      <SectionCard title="Materials" colors={colors}>
        {MOCK_MATERIALS.map((material, index) => (
          <View
            key={index}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <IconSymbol
              name={material.type === 'textbook' ? 'book.fill' : material.type === 'software' ? 'desktopcomputer' : 'doc.text.fill'}
              size={16}
              color={colors.textSecondary}
            />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {material.title}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {material.author}
              </ThemedText>
            </View>
            {material.required && (
              <View style={[styles.requiredBadge, { backgroundColor: '#EF444422' }]}>
                <ThemedText style={[styles.requiredText, { color: '#EF4444' }]}>REQ</ThemedText>
              </View>
            )}
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TAB 2: SYLLABUS
// =============================================================================

function SyllabusTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <View>
      {/* Week-by-week outline */}
      <SectionCard title="Weekly Topic Outline" colors={colors}>
        {MOCK_SYLLABUS_WEEKS.map((week) => (
          <View
            key={week.week}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View style={[styles.weekBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[styles.weekNumber, { color: colors.textSecondary }]}>
                {week.week}
              </ThemedText>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {week.topic}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                Readings: {week.readings} · Due: {week.assignments}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>

      {/* Grading Breakdown */}
      <SectionCard title="Grading Breakdown" colors={colors}>
        {MOCK_GRADING_BREAKDOWN.map((item, index) => (
          <View
            key={index}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {item.category}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {item.description}
              </ThemedText>
            </View>
            <ThemedText style={[styles.weightText, { color: '#1D9BF0' }]}>
              {item.weight}%
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      {/* Policies Summary */}
      <SectionCard title="Policies" colors={colors}>
        <PolicyRow title="Late Submission" description="10% penalty per day, max 3 days late. No submissions accepted after 3 days without approved extension." colors={colors} />
        <PolicyRow title="Attendance" description="Students are expected to attend all sessions. More than 3 unexcused absences may result in a grade reduction." colors={colors} />
        <PolicyRow title="Academic Integrity" description="All work must be original. Plagiarism will result in automatic failure of the assignment and referral to the Dean of Students." colors={colors} />
        <PolicyRow title="Accommodations" description="Students with documented disabilities should contact Disability Services and provide accommodation letters within the first two weeks." colors={colors} />
        <PolicyRow title="Communication" description="Email responses within 24 hours during business days. Office hours: Tue/Thu 3:00-4:30 PM, BUS 312." colors={colors} />
      </SectionCard>
    </View>
  );
}

function PolicyRow({
  title,
  description,
  colors,
}: {
  title: string;
  description: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={[styles.listRow, { borderBottomColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>{title}</ThemedText>
        <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>{description}</ThemedText>
      </View>
    </View>
  );
}

// =============================================================================
// TAB 3: SESSIONS
// =============================================================================

function SessionsTab({ colors }: { colors: typeof Colors.light }) {
  const upcoming = MOCK_SESSIONS.filter((s) => s.status === 'upcoming');
  const completed = MOCK_SESSIONS.filter((s) => s.status === 'completed');

  return (
    <View>
      {/* Upcoming Sessions */}
      <SectionCard title="Upcoming Sessions" colors={colors}>
        {upcoming.map((session) => (
          <View
            key={session.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View
              style={[
                styles.sessionTypeBadge,
                { backgroundColor: (SESSION_TYPE_COLORS[session.type] ?? '#A1A1AA') + '22' },
              ]}
            >
              <ThemedText
                style={[
                  styles.sessionTypeText,
                  { color: SESSION_TYPE_COLORS[session.type] ?? '#A1A1AA' },
                ]}
              >
                {session.type.toUpperCase()}
              </ThemedText>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {session.topic}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {session.date} · {session.time}
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.statusLabel,
                { color: SESSION_STATUS_COLORS[session.status] ?? '#A1A1AA' },
              ]}
            >
              {session.status.toUpperCase()}
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      {/* Completed Sessions */}
      <SectionCard title="Completed Sessions" colors={colors}>
        {completed.map((session) => (
          <View
            key={session.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View
              style={[
                styles.sessionTypeBadge,
                { backgroundColor: (SESSION_TYPE_COLORS[session.type] ?? '#A1A1AA') + '22' },
              ]}
            >
              <ThemedText
                style={[
                  styles.sessionTypeText,
                  { color: SESSION_TYPE_COLORS[session.type] ?? '#A1A1AA' },
                ]}
              >
                {session.type.toUpperCase()}
              </ThemedText>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {session.topic}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {session.date} · {session.time}
              </ThemedText>
            </View>
            <IconSymbol name="checkmark.circle.fill" size={16} color="#22C55E" />
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TAB 4: ROSTER (ED1/ED3 only)
// =============================================================================

function RosterTab({
  colors,
  onSelectStudent,
}: {
  colors: typeof Colors.light;
  onSelectStudent?: (studentId: string) => void;
}) {
  return (
    <View>
      <SectionCard title={`Class Roster (${MOCK_ROSTER.length} students)`} colors={colors}>
        {/* Table header */}
        <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
          <ThemedText style={[styles.tableHeaderCell, styles.rosterNameCol, { color: colors.textTertiary }]}>
            Student
          </ThemedText>
          <ThemedText style={[styles.tableHeaderCell, styles.rosterStatusCol, { color: colors.textTertiary }]}>
            Status
          </ThemedText>
          <ThemedText style={[styles.tableHeaderCell, styles.rosterAttCol, { color: colors.textTertiary }]}>
            Att %
          </ThemedText>
        </View>

        {MOCK_ROSTER.map((student) => {
          const riskLevel = student.attendanceRate >= 85 ? 'good' : student.attendanceRate >= 75 ? 'warning' : 'critical';
          return (
            <Pressable
              key={student.id}
              style={[styles.tableRow, { borderBottomColor: colors.border }]}
              onPress={() => onSelectStudent?.(student.studentId)}
            >
              <View style={[styles.rosterNameCol, { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }]}>
                <View style={[styles.rosterInitials, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <ThemedText style={[styles.rosterInitialsText, { color: colors.textSecondary }]}>
                    {student.name.split(' ').map((n) => n[0]).join('')}
                  </ThemedText>
                </View>
                <View>
                  <ThemedText style={[styles.tableCell, { color: colors.text }]} numberOfLines={1}>
                    {student.name}
                  </ThemedText>
                  <ThemedText style={[styles.captionText, { color: colors.textTertiary }]}>
                    Last: {student.lastAttendance}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.rosterStatusCol}>
                <View
                  style={[
                    styles.rosterStatusBadge,
                    { backgroundColor: student.status === 'enrolled' ? '#22C55E22' : '#EF444422' },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.rosterStatusText,
                      { color: student.status === 'enrolled' ? '#22C55E' : '#EF4444' },
                    ]}
                  >
                    {student.status.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
              <ThemedText
                style={[
                  styles.tableCell,
                  styles.rosterAttCol,
                  { color: ATTENDANCE_RISK_COLORS[riskLevel] ?? '#A1A1AA', fontWeight: '600' },
                ]}
              >
                {student.attendanceRate}%
              </ThemedText>
            </Pressable>
          );
        })}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TAB 5: ASSIGNMENTS
// =============================================================================

function AssignmentsTab({ colors }: { colors: typeof Colors.light }) {
  const upcomingAssignments = MOCK_ASSIGNMENTS.filter((a) => a.status === 'upcoming' || a.status === 'open');
  const pastAssignments = MOCK_ASSIGNMENTS.filter((a) => a.status === 'graded' || a.status === 'closed');

  return (
    <View>
      {/* Upcoming */}
      <SectionCard title="Upcoming / Open" colors={colors}>
        {upcomingAssignments.map((assignment) => (
          <View
            key={assignment.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View
              style={[
                styles.assignmentTypeBadge,
                { backgroundColor: (ASSIGNMENT_TYPE_COLORS[assignment.type] ?? '#A1A1AA') + '22' },
              ]}
            >
              <ThemedText
                style={[
                  styles.assignmentTypeText,
                  { color: ASSIGNMENT_TYPE_COLORS[assignment.type] ?? '#A1A1AA' },
                ]}
              >
                {assignment.type.replace('_', ' ').toUpperCase()}
              </ThemedText>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {assignment.title}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                Due: {assignment.dueDate} · {assignment.maxPoints} pts
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.statusLabel,
                { color: ASSIGNMENT_STATUS_COLORS[assignment.status] ?? '#A1A1AA' },
              ]}
            >
              {assignment.status.toUpperCase()}
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      {/* Past */}
      <SectionCard title="Past / Graded" colors={colors}>
        {pastAssignments.map((assignment) => (
          <View
            key={assignment.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View
              style={[
                styles.assignmentTypeBadge,
                { backgroundColor: (ASSIGNMENT_TYPE_COLORS[assignment.type] ?? '#A1A1AA') + '22' },
              ]}
            >
              <ThemedText
                style={[
                  styles.assignmentTypeText,
                  { color: ASSIGNMENT_TYPE_COLORS[assignment.type] ?? '#A1A1AA' },
                ]}
              >
                {assignment.type.replace('_', ' ').toUpperCase()}
              </ThemedText>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {assignment.title}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                Due: {assignment.dueDate} · {assignment.maxPoints} pts
              </ThemedText>
            </View>
            <IconSymbol name="checkmark.circle.fill" size={16} color="#22C55E" />
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TAB 6: GRADES
// =============================================================================

function GradesTab({
  colors,
  roleLens,
}: {
  colors: typeof Colors.light;
  roleLens: EducationRoleLens;
}) {
  // ED1 = aggregate stats, ED2 = own grades, ED3 = full gradebook, ED4 = dependent summary
  if (roleLens === 'ED1') {
    return <GradesAggregateView colors={colors} />;
  }
  if (roleLens === 'ED2') {
    return <GradesOwnView colors={colors} />;
  }
  if (roleLens === 'ED3') {
    return <GradesFullView colors={colors} />;
  }
  // ED4
  return <GradesSummaryView colors={colors} />;
}

function GradesAggregateView({ colors }: { colors: typeof Colors.light }) {
  return (
    <View>
      <SectionCard title="Class Statistics" colors={colors}>
        <View style={styles.statRow}>
          <StatBlock label="Average" value={MOCK_GRADE_DISTRIBUTION.classAverage.toFixed(1)} color="#1D9BF0" colors={colors} />
          <StatBlock label="Median" value={String(MOCK_GRADE_DISTRIBUTION.median)} color="#22C55E" colors={colors} />
          <StatBlock label="High" value={String(MOCK_GRADE_DISTRIBUTION.high)} color="#22C55E" colors={colors} />
          <StatBlock label="Low" value={String(MOCK_GRADE_DISTRIBUTION.low)} color="#EF4444" colors={colors} />
        </View>
      </SectionCard>

      <SectionCard title="Grade Distribution" colors={colors}>
        {MOCK_GRADE_DISTRIBUTION.distribution.map((item) => (
          <View
            key={item.range}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <ThemedText style={[styles.distRange, { color: colors.text }]}>{item.range}</ThemedText>
            <View style={styles.distBarContainer}>
              <View
                style={[
                  styles.distBar,
                  { width: `${item.percentage}%`, backgroundColor: '#1D9BF0' },
                ]}
              />
            </View>
            <ThemedText style={[styles.distCount, { color: colors.textSecondary }]}>
              {item.count} ({item.percentage}%)
            </ThemedText>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

function GradesOwnView({ colors }: { colors: typeof Colors.light }) {
  return (
    <View>
      <SectionCard title="My Grades" colors={colors}>
        {MOCK_OWN_GRADES.map((grade, index) => (
          <View
            key={index}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {grade.assignment}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {grade.score}/{grade.maxPoints} points
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.gradePercentage,
                { color: grade.percentage >= 80 ? '#22C55E' : grade.percentage >= 70 ? '#F59E0B' : '#EF4444' },
              ]}
            >
              {grade.percentage}%
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Weighted Average" colors={colors}>
        <View style={styles.statRow}>
          <StatBlock label="Current" value="88%" color="#22C55E" colors={colors} />
          <StatBlock label="Grade" value="B+" color="#1D9BF0" colors={colors} />
          <StatBlock label="Rank" value="3/12" color="#F59E0B" colors={colors} />
        </View>
      </SectionCard>
    </View>
  );
}

function GradesFullView({ colors }: { colors: typeof Colors.light }) {
  return (
    <View>
      <GradesAggregateView colors={colors} />

      <SectionCard title="Full Gradebook" colors={colors}>
        <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
          <ThemedText style={[styles.tableHeaderCell, styles.gradebookNameCol, { color: colors.textTertiary }]}>Student</ThemedText>
          <ThemedText style={[styles.tableHeaderCell, styles.gradebookGradeCol, { color: colors.textTertiary }]}>Grade</ThemedText>
          <ThemedText style={[styles.tableHeaderCell, styles.gradebookPctCol, { color: colors.textTertiary }]}>%</ThemedText>
        </View>
        {MOCK_FULL_GRADEBOOK.map((entry) => (
          <View
            key={entry.studentId}
            style={[styles.tableRow, { borderBottomColor: colors.border }]}
          >
            <ThemedText style={[styles.tableCell, styles.gradebookNameCol, { color: colors.text }]} numberOfLines={1}>
              {entry.name}
            </ThemedText>
            <View style={styles.gradebookGradeCol}>
              <View
                style={[
                  styles.gradeBadge,
                  { backgroundColor: (GRADE_COLORS[entry.currentGrade] ?? '#A1A1AA') + '22' },
                ]}
              >
                <ThemedText style={[styles.gradeText, { color: GRADE_COLORS[entry.currentGrade] ?? '#A1A1AA' }]}>
                  {entry.currentGrade}
                </ThemedText>
              </View>
            </View>
            <ThemedText
              style={[
                styles.tableCell,
                styles.gradebookPctCol,
                { color: entry.percentage >= 80 ? '#22C55E' : entry.percentage >= 70 ? '#F59E0B' : '#EF4444', fontWeight: '600' },
              ]}
            >
              {entry.percentage}
            </ThemedText>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

function GradesSummaryView({ colors }: { colors: typeof Colors.light }) {
  return (
    <View>
      <SectionCard title="Dependent Grade Summary" colors={colors}>
        <ThemedText style={[styles.bodyText, { color: colors.text }]}>
          Your dependent is currently performing well in this course. Current standing is within the top half of the class. All assignments have been submitted on time.
        </ThemedText>
        <View style={[styles.summaryIndicator, { backgroundColor: '#22C55E22', borderColor: '#22C55E33' }]}>
          <IconSymbol name="checkmark.circle.fill" size={20} color="#22C55E" />
          <ThemedText style={[styles.summaryText, { color: '#22C55E' }]}>
            On Track — No concerns flagged
          </ThemedText>
        </View>
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TAB 7: ATTENDANCE
// =============================================================================

function AttendanceTab({
  colors,
  roleLens,
}: {
  colors: typeof Colors.light;
  roleLens: EducationRoleLens;
}) {
  // ED1 = aggregate, ED2 = own, ED3 = full, ED4 = dependent
  if (roleLens === 'ED1') {
    return <AttendanceAggregateView colors={colors} />;
  }
  if (roleLens === 'ED2') {
    return <AttendanceOwnView colors={colors} />;
  }
  if (roleLens === 'ED3') {
    return <AttendanceFullView colors={colors} />;
  }
  return <AttendanceDependentView colors={colors} />;
}

function AttendanceAggregateView({ colors }: { colors: typeof Colors.light }) {
  return (
    <View>
      <SectionCard title="Class Attendance Overview" colors={colors}>
        <View style={styles.statRow}>
          <StatBlock label="Avg Attendance" value={`${MOCK_ATTENDANCE_AGGREGATE.averageAttendance}%`} color="#22C55E" colors={colors} />
          <StatBlock label="Sessions" value={String(MOCK_ATTENDANCE_AGGREGATE.totalSessions)} color="#1D9BF0" colors={colors} />
          <StatBlock label="At Risk" value={String(MOCK_ATTENDANCE_AGGREGATE.atRiskStudents.length)} color="#EF4444" colors={colors} />
        </View>
      </SectionCard>

      <SectionCard title="At-Risk Students (Below 80%)" colors={colors}>
        {MOCK_ATTENDANCE_AGGREGATE.atRiskStudents.map((student, index) => (
          <View
            key={index}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#EF4444" />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {student.name}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {student.absences} absences · {student.rate}% attendance
              </ThemedText>
            </View>
            <ThemedText style={[styles.statusLabel, { color: '#EF4444' }]}>
              {student.rate}%
            </ThemedText>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

function AttendanceOwnView({ colors }: { colors: typeof Colors.light }) {
  const presentCount = MOCK_OWN_ATTENDANCE.filter((a) => a.status === 'present').length;
  const total = MOCK_OWN_ATTENDANCE.length;
  const rate = Math.round((presentCount / total) * 100);

  return (
    <View>
      <SectionCard title="My Attendance" colors={colors}>
        <View style={styles.statRow}>
          <StatBlock label="Rate" value={`${rate}%`} color={rate >= 85 ? '#22C55E' : '#F59E0B'} colors={colors} />
          <StatBlock label="Present" value={String(presentCount)} color="#22C55E" colors={colors} />
          <StatBlock label="Total" value={String(total)} color="#1D9BF0" colors={colors} />
        </View>
      </SectionCard>

      <SectionCard title="Attendance Record" colors={colors}>
        {MOCK_OWN_ATTENDANCE.map((record, index) => (
          <View
            key={index}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View
              style={[
                styles.attendanceDot,
                { backgroundColor: OWN_ATTENDANCE_COLORS[record.status] ?? '#A1A1AA' },
              ]}
            />
            <ThemedText style={[styles.bodyText, { color: colors.text, flex: 1 }]}>
              {record.date}
            </ThemedText>
            <ThemedText
              style={[
                styles.statusLabel,
                { color: OWN_ATTENDANCE_COLORS[record.status] ?? '#A1A1AA' },
              ]}
            >
              {record.status.toUpperCase()}
            </ThemedText>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

function AttendanceFullView({ colors }: { colors: typeof Colors.light }) {
  return (
    <View>
      <AttendanceAggregateView colors={colors} />

      <SectionCard title="Full Attendance by Student" colors={colors}>
        {MOCK_ROSTER.filter((s) => s.status === 'enrolled').map((student) => {
          const riskLevel = student.attendanceRate >= 85 ? 'good' : student.attendanceRate >= 75 ? 'warning' : 'critical';
          return (
            <View
              key={student.id}
              style={[styles.listRow, { borderBottomColor: colors.border }]}
            >
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {student.name}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  Last attended: {student.lastAttendance}
                </ThemedText>
              </View>
              <ThemedText
                style={[
                  styles.attendanceRate,
                  { color: ATTENDANCE_RISK_COLORS[riskLevel] ?? '#A1A1AA' },
                ]}
              >
                {student.attendanceRate}%
              </ThemedText>
            </View>
          );
        })}
      </SectionCard>
    </View>
  );
}

function AttendanceDependentView({ colors }: { colors: typeof Colors.light }) {
  return (
    <View>
      <SectionCard title="Dependent Attendance Summary" colors={colors}>
        <View style={[styles.summaryIndicator, { backgroundColor: '#22C55E22', borderColor: '#22C55E33' }]}>
          <IconSymbol name="checkmark.circle.fill" size={20} color="#22C55E" />
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <ThemedText style={[styles.listRowTitle, { color: '#22C55E' }]}>
              Attendance on Track
            </ThemedText>
            <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
              Your dependent has attended 10 of 12 sessions (83%). One late arrival and one excused absence on record.
            </ThemedText>
          </View>
        </View>
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TAB 8: OPERATIONS (ED1/ED3 only)
// =============================================================================

function OperationsTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <View>
      {/* Room Assignments */}
      <SectionCard title="Room + Facility" colors={colors}>
        <InfoRow label="Room" value={MOCK_OPERATIONS.room} colors={colors} />
        <InfoRow label="Capacity" value={String(MOCK_OPERATIONS.capacity)} colors={colors} />
        <InfoRow label="Enrolled" value={String(MOCK_OPERATIONS.enrolled)} colors={colors} />
        <InfoRow label="Utilization" value={`${Math.round((MOCK_OPERATIONS.enrolled / MOCK_OPERATIONS.capacity) * 100)}%`} colors={colors} />
      </SectionCard>

      {/* Equipment */}
      <SectionCard title="Equipment" colors={colors}>
        {MOCK_OPERATIONS.equipment.map((item, index) => (
          <View
            key={index}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <IconSymbol name="desktopcomputer" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.bodyText, { color: colors.text, flex: 1, marginLeft: Spacing.sm }]}>
              {item}
            </ThemedText>
            <IconSymbol name="checkmark.circle.fill" size={14} color="#22C55E" />
          </View>
        ))}
      </SectionCard>

      {/* TA Assignments */}
      <SectionCard title="Teaching Assistants" colors={colors}>
        {MOCK_OPERATIONS.tas.map((ta, index) => (
          <View
            key={index}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View style={[styles.taAvatar, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[styles.taInitials, { color: colors.textSecondary }]}>
                {ta.name.split(' ').map((n) => n[0]).join('')}
              </ThemedText>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {ta.name}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {ta.role} · {ta.hours} hrs/week
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>

      {/* Scheduling Conflicts */}
      <SectionCard title="Scheduling Conflicts" colors={colors}>
        {MOCK_OPERATIONS.conflicts.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No scheduling conflicts
          </ThemedText>
        ) : (
          MOCK_OPERATIONS.conflicts.map((conflict, index) => (
            <View
              key={index}
              style={[styles.listRow, { borderBottomColor: colors.border }]}
            >
              <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#F59E0B" />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {conflict.date}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {conflict.issue}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: '#1D9BF0' }]}>
                  Resolution: {conflict.resolution}
                </ThemedText>
              </View>
            </View>
          ))
        )}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TAB 9: COMPLIANCE (ED1/ED3 only)
// =============================================================================

function ComplianceTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <View>
      {/* Accommodations Count */}
      <SectionCard title="Accommodations" colors={colors}>
        <View style={styles.listRow}>
          <IconSymbol name="person.fill.checkmark" size={16} color="#1D9BF0" />
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
              Students with Accommodations
            </ThemedText>
            <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
              Details restricted to authorized personnel. Contact Disability Services for specifics.
            </ThemedText>
          </View>
          <View style={[styles.countBadge, { backgroundColor: '#1D9BF022' }]}>
            <ThemedText style={[styles.countText, { color: '#1D9BF0' }]}>
              {MOCK_COMPLIANCE.accommodationsCount}
            </ThemedText>
          </View>
        </View>
      </SectionCard>

      {/* Title IX Compliance */}
      <SectionCard title="Title IX Compliance" colors={colors}>
        <View style={styles.listRow}>
          <IconSymbol name="shield.fill" size={16} color={COMPLIANCE_STATUS_COLORS[MOCK_COMPLIANCE.titleIXStatus] ?? '#A1A1AA'} />
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
              Title IX Status
            </ThemedText>
            <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
              Syllabus includes required Title IX statement. Mandatory reporter training for instructor is current.
            </ThemedText>
          </View>
          <View
            style={[
              styles.complianceBadge,
              { backgroundColor: (COMPLIANCE_STATUS_COLORS[MOCK_COMPLIANCE.titleIXStatus] ?? '#A1A1AA') + '22' },
            ]}
          >
            <ThemedText
              style={[
                styles.complianceText,
                { color: COMPLIANCE_STATUS_COLORS[MOCK_COMPLIANCE.titleIXStatus] ?? '#A1A1AA' },
              ]}
            >
              {MOCK_COMPLIANCE.titleIXStatus.toUpperCase()}
            </ThemedText>
          </View>
        </View>
      </SectionCard>

      {/* Grade Submission Deadlines */}
      <SectionCard title="Grade Submission Deadlines" colors={colors}>
        {MOCK_COMPLIANCE.gradeDeadlines.map((deadline, index) => (
          <View
            key={index}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <IconSymbol name="calendar.badge.clock" size={16} color={colors.textSecondary} />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {deadline.milestone}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {deadline.date}
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.statusLabel,
                { color: '#1D9BF0' },
              ]}
            >
              {deadline.status.toUpperCase()}
            </ThemedText>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// SHARED UI COMPONENTS
// =============================================================================

function SectionCard({
  title,
  colors,
  children,
}: {
  title: string;
  colors: typeof Colors.light;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{title}</ThemedText>
      {children}
    </View>
  );
}

function StatBlock({
  label,
  value,
  color,
  colors,
}: {
  label: string;
  value: string;
  color: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={styles.statBlock}>
      <ThemedText style={[styles.statValue, { color }]}>{value}</ThemedText>
      <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

function InfoRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
      <ThemedText style={[styles.infoValue, { color: colors.text }]}>{value}</ThemedText>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  colors,
}: {
  label: string;
  icon: string;
  colors: typeof Colors.light;
}) {
  return (
    <Pressable style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <IconSymbol name={icon as any} size={16} color={colors.textSecondary} />
      <ThemedText style={[styles.actionButtonText, { color: colors.textSecondary }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const GRADE_COLORS: Record<string, string> = {
  'A': '#22C55E', 'A-': '#22C55E',
  'B+': '#1D9BF0', 'B': '#1D9BF0', 'B-': '#1D9BF0',
  'C+': '#F59E0B', 'C': '#F59E0B', 'C-': '#F59E0B',
  'D': '#EF4444', 'F': '#EF4444',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  courseName: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  subtitleLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  instructorLabel: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  creditsPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  creditsPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: Spacing.lg,
    marginTop: Spacing.md,
  },
  actionIconWrap: {
    alignItems: 'center',
    gap: 4,
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconLabel: {
    fontSize: 10,
  },

  // Tab bar
  tabBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  tabPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Scroll content
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Section card
  sectionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },

  // Text styles
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  captionText: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
  },

  // Stat row
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBlock: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // List row
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  listRowTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Info row
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 100,
  },
  infoValue: {
    fontSize: 13,
    flex: 1,
  },

  // Objectives
  objectiveRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  objectiveNumber: {
    fontSize: 14,
    fontWeight: '600',
    width: 20,
  },

  // Prerequisites
  prereqBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  prereqText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Materials
  requiredBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  requiredText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Syllabus
  weekBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  weightText: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Sessions
  sessionTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  sessionTypeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Roster
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    marginBottom: Spacing.xs,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tableCell: {
    fontSize: 13,
  },
  rosterNameCol: {
    flex: 1,
  },
  rosterStatusCol: {
    width: 80,
    alignItems: 'center',
  },
  rosterAttCol: {
    width: 48,
    textAlign: 'right',
  },
  rosterInitials: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rosterInitialsText: {
    fontSize: 11,
    fontWeight: '700',
  },
  rosterStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  rosterStatusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Assignments
  assignmentTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  assignmentTypeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Grades
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  gradeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  gradePercentage: {
    fontSize: 16,
    fontWeight: '700',
  },
  gradebookNameCol: {
    flex: 1,
  },
  gradebookGradeCol: {
    width: 56,
    alignItems: 'center',
  },
  gradebookPctCol: {
    width: 40,
    textAlign: 'right',
  },
  distRange: {
    fontSize: 13,
    width: 100,
  },
  distBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 6,
    marginHorizontal: Spacing.sm,
    overflow: 'hidden',
  },
  distBar: {
    height: '100%',
    borderRadius: 6,
  },
  distCount: {
    fontSize: 12,
    width: 70,
    textAlign: 'right',
  },
  summaryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Attendance
  attendanceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  attendanceRate: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Operations
  taAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taInitials: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Compliance
  countBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 16,
    fontWeight: '700',
  },
  complianceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  complianceText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Action buttons
  actionButtonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
