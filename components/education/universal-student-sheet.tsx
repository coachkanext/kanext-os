/**
 * Universal Student Sheet — Education Mode
 * Student "truth page" with 9 RBAC-gated tabs.
 * This is the CONTENT component — the parent handles the bottom sheet wrapper.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import {
  type Student,
  type Course,
  type StudentGrade,
  type AdvisingNote,
  type StudentHold,
  type PaymentPlan,
  type Transaction,
  type DegreeRequirement,
  type AdvisingTask,
  type Assignment,
  type CourseSession,
  COURSES,
  PROGRAMS,
  EDUCATION_ORGS,
  STAFF_MEMBERS,
  DEGREE_REQUIREMENTS,
  ADVISING_TASKS,
  getGradesByStudent,
  getAdvisingNotes,
  getHoldsByStudent,
  getPaymentPlan,
  getTransactions,
} from '@/data/mock-education-v2';

import {
  type EducationRoleLens,
  type StudentTab,
  getStudentSheetTabs,
  isFullAccess,
  isProgramDirector,
  isStudentOrParent,
  canViewGrades,
} from '@/utils/education-rbac';

// =============================================================================
// PROPS
// =============================================================================

interface UniversalStudentSheetProps {
  student: Student;
  roleLens: EducationRoleLens;
  onClose: () => void;
  onOpenCourse?: (courseId: string) => void;
}

// =============================================================================
// STATUS / HOLD / GRADE HELPERS
// =============================================================================

const STATUS_COLORS: Record<string, string> = {
  applicant: '#1D9BF0',
  enrolled: '#22C55E',
  leave: '#F59E0B',
  withdrawn: '#EF4444',
  alumni: '#A1A1AA',
};

const HOLD_COLORS: Record<string, string> = {
  none: '#22C55E',
  financial: '#EF4444',
  academic: '#F59E0B',
  conduct: '#EF4444',
};

const GRADE_COLORS: Record<string, string> = {
  A: '#22C55E',
  'A-': '#22C55E',
  'B+': '#1D9BF0',
  B: '#1D9BF0',
  'B-': '#1D9BF0',
  'C+': '#F59E0B',
  C: '#F59E0B',
  'C-': '#F59E0B',
  D: '#EF4444',
  F: '#EF4444',
  IP: '#A1A1AA',
  W: '#A1A1AA',
};

const ATTENDANCE_COLORS: Record<string, string> = {
  present: '#22C55E',
  absent: '#EF4444',
  late: '#F59E0B',
  excused: '#A1A1AA',
};

const HOLD_STATUS_COLORS: Record<string, string> = {
  active: '#EF4444',
  resolved: '#22C55E',
  pending: '#F59E0B',
};

const TRANSACTION_TYPE_COLORS: Record<string, string> = {
  tuition: '#EF4444',
  payment: '#22C55E',
  fee: '#F59E0B',
  refund: '#1D9BF0',
  financial_aid: '#22C55E',
  scholarship: '#22C55E',
};

const DOCUMENT_STATUS_COLORS: Record<string, string> = {
  completed: '#22C55E',
  pending: '#F59E0B',
  missing: '#EF4444',
  available: '#1D9BF0',
};

// =============================================================================
// INLINE MOCK DATA (student-specific)
// =============================================================================

const MOCK_SCHEDULE_SESSIONS = [
  { id: 'ss-1', courseName: 'Sports Management 301', day: 'Mon', time: '9:00 AM - 10:15 AM', room: 'BUS 204', type: 'lecture' as const },
  { id: 'ss-2', courseName: 'Kinesiology 210', day: 'Mon', time: '11:00 AM - 12:15 PM', room: 'SCI 108', type: 'lecture' as const },
  { id: 'ss-3', courseName: 'Sports Analytics', day: 'Tue', time: '2:00 PM - 3:30 PM', room: 'TECH 301', type: 'lab' as const },
  { id: 'ss-4', courseName: 'Sports Management 301', day: 'Wed', time: '9:00 AM - 10:15 AM', room: 'BUS 204', type: 'lecture' as const },
  { id: 'ss-5', courseName: 'Kinesiology 210', day: 'Wed', time: '11:00 AM - 12:15 PM', room: 'SCI 108', type: 'lecture' as const },
  { id: 'ss-6', courseName: 'Sports Ethics', day: 'Thu', time: '1:00 PM - 2:15 PM', room: 'HUM 115', type: 'seminar' as const },
  { id: 'ss-7', courseName: 'Sports Analytics', day: 'Thu', time: '2:00 PM - 3:30 PM', room: 'TECH 301', type: 'lab' as const },
  { id: 'ss-8', courseName: 'Sports Law', day: 'Fri', time: '10:00 AM - 11:30 AM', room: 'LAW 220', type: 'lecture' as const },
];

const MOCK_APPOINTMENTS = [
  { id: 'appt-1', title: 'Academic Advising', advisor: 'Dr. Williams', date: 'Feb 20, 2026', time: '2:00 PM', status: 'confirmed' },
  { id: 'appt-2', title: 'Financial Aid Review', advisor: 'Maria Chen', date: 'Feb 25, 2026', time: '10:30 AM', status: 'pending' },
  { id: 'appt-3', title: 'Career Counseling', advisor: 'James Park', date: 'Mar 3, 2026', time: '3:00 PM', status: 'confirmed' },
];

const MOCK_CURRENT_COURSES = [
  { id: 'crs-1', code: 'SMG-301', name: 'Sports Management 301', instructor: 'Dr. Thomas', credits: 3, grade: 'B+', status: 'active' as const },
  { id: 'crs-2', code: 'KIN-210', name: 'Kinesiology 210', instructor: 'Dr. Patel', credits: 3, grade: 'A-', status: 'active' as const },
  { id: 'crs-3', code: 'SPA-400', name: 'Sports Analytics', instructor: 'Prof. Kim', credits: 4, grade: 'A', status: 'active' as const },
  { id: 'crs-4', code: 'SPE-350', name: 'Sports Ethics', instructor: 'Dr. Nguyen', credits: 3, grade: 'B', status: 'active' as const },
  { id: 'crs-5', code: 'SPL-310', name: 'Sports Law', instructor: 'Prof. Davis', credits: 3, grade: 'B+', status: 'active' as const },
];

const MOCK_PAST_COURSES = [
  { id: 'pcrs-1', code: 'SMG-101', name: 'Intro to Sports Mgmt', instructor: 'Dr. Thomas', credits: 3, grade: 'A', status: 'completed' as const },
  { id: 'pcrs-2', code: 'BUS-200', name: 'Business Fundamentals', instructor: 'Dr. Adams', credits: 3, grade: 'B+', status: 'completed' as const },
  { id: 'pcrs-3', code: 'COM-150', name: 'Communications', instructor: 'Prof. Rivera', credits: 3, grade: 'A-', status: 'completed' as const },
  { id: 'pcrs-4', code: 'MTH-120', name: 'Statistics I', instructor: 'Dr. Lee', credits: 3, grade: 'B', status: 'completed' as const },
  { id: 'pcrs-5', code: 'ENG-101', name: 'English Composition', instructor: 'Prof. Garcia', credits: 3, grade: 'A', status: 'completed' as const },
  { id: 'pcrs-6', code: 'PSY-100', name: 'Intro to Psychology', instructor: 'Dr. Moore', credits: 3, grade: 'A-', status: 'completed' as const },
];

const MOCK_DEGREE_AUDIT = [
  { id: 'da-1', requirement: 'Core Business Courses', credits: 12, completed: 9, status: 'in_progress' as const },
  { id: 'da-2', requirement: 'Sports Management Core', credits: 18, completed: 12, status: 'in_progress' as const },
  { id: 'da-3', requirement: 'General Education', credits: 30, completed: 30, status: 'met' as const },
  { id: 'da-4', requirement: 'Science Electives', credits: 6, completed: 6, status: 'met' as const },
  { id: 'da-5', requirement: 'Humanities Electives', credits: 6, completed: 3, status: 'in_progress' as const },
  { id: 'da-6', requirement: 'Internship / Practicum', credits: 6, completed: 0, status: 'missing' as const },
  { id: 'da-7', requirement: 'Capstone Project', credits: 3, completed: 0, status: 'missing' as const },
  { id: 'da-8', requirement: 'Free Electives', credits: 9, completed: 6, status: 'in_progress' as const },
  { id: 'da-9', requirement: 'Sports Analytics Track', credits: 12, completed: 8, status: 'in_progress' as const },
  { id: 'da-10', requirement: 'Ethics + Law', credits: 6, completed: 6, status: 'met' as const },
];

const AUDIT_STATUS_COLORS: Record<string, string> = {
  met: '#22C55E',
  in_progress: '#1D9BF0',
  missing: '#EF4444',
};

const MOCK_ATTENDANCE_RECORDS = [
  { id: 'att-1', date: 'Feb 17, 2026', course: 'Sports Management 301', status: 'present' as const },
  { id: 'att-2', date: 'Feb 17, 2026', course: 'Kinesiology 210', status: 'present' as const },
  { id: 'att-3', date: 'Feb 14, 2026', course: 'Sports Law', status: 'present' as const },
  { id: 'att-4', date: 'Feb 13, 2026', course: 'Sports Ethics', status: 'late' as const },
  { id: 'att-5', date: 'Feb 13, 2026', course: 'Sports Analytics', status: 'present' as const },
  { id: 'att-6', date: 'Feb 12, 2026', course: 'Sports Management 301', status: 'absent' as const },
  { id: 'att-7', date: 'Feb 12, 2026', course: 'Kinesiology 210', status: 'excused' as const },
  { id: 'att-8', date: 'Feb 10, 2026', course: 'Sports Management 301', status: 'present' as const },
  { id: 'att-9', date: 'Feb 10, 2026', course: 'Kinesiology 210', status: 'present' as const },
  { id: 'att-10', date: 'Feb 7, 2026', course: 'Sports Law', status: 'present' as const },
  { id: 'att-11', date: 'Feb 6, 2026', course: 'Sports Ethics', status: 'present' as const },
  { id: 'att-12', date: 'Feb 6, 2026', course: 'Sports Analytics', status: 'present' as const },
];

const MOCK_ADVISING_NOTES_FULL = [
  { id: 'an-1', advisor: 'Dr. Williams', date: 'Feb 10, 2026', summary: 'Discussed course load for Spring semester. Recommended adding Sports Analytics track elective. Student expressed interest in internship placement for Summer 2026.', type: 'academic' as const },
  { id: 'an-2', advisor: 'Maria Chen', date: 'Jan 28, 2026', summary: 'Reviewed financial aid package for Spring. Student qualified for additional merit scholarship ($2,500/semester). FAFSA renewal reminder sent.', type: 'financial' as const },
  { id: 'an-3', advisor: 'Dr. Williams', date: 'Jan 15, 2026', summary: 'Mid-year check-in. GPA trending upward. Cleared for honors track consideration. Need to submit application by March 1.', type: 'academic' as const },
  { id: 'an-4', advisor: 'James Park', date: 'Dec 5, 2025', summary: 'Career counseling session. Explored sports analytics roles. Resume workshop scheduled for February. LinkedIn profile review completed.', type: 'career' as const },
  { id: 'an-5', advisor: 'Dr. Williams', date: 'Nov 20, 2025', summary: 'Pre-registration advising. Mapped remaining requirements for graduation. On track for May 2027 graduation with current pace.', type: 'academic' as const },
];

const ADVISING_NOTE_TYPE_COLORS: Record<string, string> = {
  academic: '#1D9BF0',
  financial: '#22C55E',
  career: '#F59E0B',
  personal: '#A1A1AA',
};

const MOCK_HOLDS = [
  { id: 'hold-1', type: 'financial' as const, reason: 'Outstanding balance — Spring 2026 tuition', status: 'active' as const, createdDate: 'Jan 5, 2026', resolvedDate: null },
  { id: 'hold-2', type: 'academic' as const, reason: 'Missing prerequisite documentation for KIN-210', status: 'resolved' as const, createdDate: 'Dec 15, 2025', resolvedDate: 'Jan 2, 2026' },
];

const MOCK_CONDUCT_CASES = [
  { id: 'cc-1', title: 'Academic Integrity Review', date: 'Oct 15, 2025', status: 'cleared' as const, details: 'Plagiarism allegation in COM-150 final paper. Investigation completed — student cleared after evidence review.' },
];

const MOCK_BALANCE_SUMMARY = {
  totalCharges: '$18,500.00',
  totalPayments: '$14,200.00',
  outstandingBalance: '$4,300.00',
  nextPaymentDue: 'Mar 1, 2026',
  nextPaymentAmount: '$2,150.00',
};

const MOCK_PAYMENT_PLAN = {
  type: '4-Installment Plan',
  status: 'active' as const,
  totalAmount: '$18,500.00',
  paid: '$14,200.00',
  remaining: '$4,300.00',
  installments: [
    { id: 'inst-1', dueDate: 'Sep 1, 2025', amount: '$4,625.00', status: 'paid' as const },
    { id: 'inst-2', dueDate: 'Nov 1, 2025', amount: '$4,625.00', status: 'paid' as const },
    { id: 'inst-3', dueDate: 'Jan 1, 2026', amount: '$4,950.00', status: 'paid' as const },
    { id: 'inst-4', dueDate: 'Mar 1, 2026', amount: '$4,300.00', status: 'pending' as const },
  ],
};

const MOCK_TRANSACTIONS = [
  { id: 'txn-1', date: 'Jan 2, 2026', description: 'Spring 2026 Tuition', amount: '-$8,250.00', type: 'tuition' as const },
  { id: 'txn-2', date: 'Jan 5, 2026', description: 'Student Activity Fee', amount: '-$350.00', type: 'fee' as const },
  { id: 'txn-3', date: 'Jan 5, 2026', description: 'Technology Fee', amount: '-$200.00', type: 'fee' as const },
  { id: 'txn-4', date: 'Jan 10, 2026', description: 'Merit Scholarship', amount: '+$2,500.00', type: 'scholarship' as const },
  { id: 'txn-5', date: 'Jan 10, 2026', description: 'Federal Pell Grant', amount: '+$3,000.00', type: 'financial_aid' as const },
  { id: 'txn-6', date: 'Jan 15, 2026', description: 'Installment Payment', amount: '+$4,950.00', type: 'payment' as const },
  { id: 'txn-7', date: 'Sep 1, 2025', description: 'Fall 2025 Tuition', amount: '-$8,250.00', type: 'tuition' as const },
  { id: 'txn-8', date: 'Sep 5, 2025', description: 'Installment Payment', amount: '+$4,625.00', type: 'payment' as const },
  { id: 'txn-9', date: 'Nov 1, 2025', description: 'Installment Payment', amount: '+$4,625.00', type: 'payment' as const },
];

const PAYMENT_INSTALLMENT_COLORS: Record<string, string> = {
  paid: '#22C55E',
  pending: '#F59E0B',
  overdue: '#EF4444',
};

const MOCK_DOCUMENTS = [
  { id: 'doc-1', title: 'Enrollment Agreement', type: 'enrollment', status: 'completed' as const, date: 'Aug 15, 2025' },
  { id: 'doc-2', title: 'FERPA Consent Form', type: 'consent', status: 'completed' as const, date: 'Aug 15, 2025' },
  { id: 'doc-3', title: 'Emergency Contact Form', type: 'enrollment', status: 'completed' as const, date: 'Aug 15, 2025' },
  { id: 'doc-4', title: 'Official Transcript', type: 'transcript', status: 'available' as const, date: 'Feb 1, 2026' },
  { id: 'doc-5', title: 'Enrollment Verification Letter', type: 'verification', status: 'available' as const, date: 'Feb 10, 2026' },
  { id: 'doc-6', title: 'Financial Aid Award Letter', type: 'financial', status: 'completed' as const, date: 'Jul 20, 2025' },
  { id: 'doc-7', title: 'Health Insurance Waiver', type: 'consent', status: 'pending' as const, date: null },
  { id: 'doc-8', title: 'Accommodation Request Form', type: 'accommodation', status: 'missing' as const, date: null },
  { id: 'doc-9', title: 'Academic Integrity Pledge', type: 'consent', status: 'completed' as const, date: 'Aug 20, 2025' },
  { id: 'doc-10', title: 'Degree Audit Report', type: 'transcript', status: 'available' as const, date: 'Feb 15, 2026' },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function UniversalStudentSheet({
  student,
  roleLens,
  onClose,
  onOpenCourse,
}: UniversalStudentSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const tabs = useMemo(() => getStudentSheetTabs(roleLens), [roleLens]);
  const [activeTab, setActiveTab] = useState<StudentTab>(tabs[0]?.id ?? 'overview');

  const fullAccess = isFullAccess(roleLens);
  const programDir = isProgramDirector(roleLens);
  const studentOrParent = isStudentOrParent(roleLens);
  const gradesVisible = canViewGrades(roleLens);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <StudentHeader
        student={student}
        roleLens={roleLens}
        colors={colors}
        fullAccess={fullAccess}
        gradesVisible={gradesVisible}
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
        {activeTab === 'overview' && (
          <OverviewTab student={student} colors={colors} roleLens={roleLens} fullAccess={fullAccess} />
        )}
        {activeTab === 'schedule' && (
          <ScheduleTab colors={colors} />
        )}
        {activeTab === 'courses' && (
          <CoursesTab colors={colors} roleLens={roleLens} gradesVisible={gradesVisible} onOpenCourse={onOpenCourse} />
        )}
        {activeTab === 'progress' && (
          <ProgressTab student={student} colors={colors} />
        )}
        {activeTab === 'attendance' && (
          <AttendanceTab colors={colors} roleLens={roleLens} programDir={programDir} />
        )}
        {activeTab === 'advising' && (
          <AdvisingTab colors={colors} roleLens={roleLens} />
        )}
        {activeTab === 'holds_compliance' && (
          <HoldsComplianceTab colors={colors} roleLens={roleLens} fullAccess={fullAccess} />
        )}
        {activeTab === 'billing' && (
          <BillingTab colors={colors} roleLens={roleLens} fullAccess={fullAccess} programDir={programDir} />
        )}
        {activeTab === 'documents' && (
          <DocumentsTab colors={colors} roleLens={roleLens} gradesVisible={gradesVisible} />
        )}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// HEADER
// =============================================================================

function StudentHeader({
  student,
  roleLens,
  colors,
  fullAccess,
  gradesVisible,
  onClose,
}: {
  student: Student;
  roleLens: EducationRoleLens;
  colors: typeof Colors.light;
  fullAccess: boolean;
  gradesVisible: boolean;
  onClose: () => void;
}) {
  const initials = student.firstName.charAt(0) + student.lastName.charAt(0);
  const holdType = MOCK_HOLDS.find((h) => h.status === 'active')?.type ?? 'none';

  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      {/* Top row: avatar + name + close */}
      <View style={styles.headerTopRow}>
        <View style={styles.avatarRow}>
          <View style={[styles.avatar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[styles.avatarText, { color: colors.textSecondary }]}>
              {initials}
            </ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.studentName, { color: colors.text }]}>
              {student.firstName} {student.lastName}
            </ThemedText>
            <ThemedText style={[styles.subtitleLabel, { color: colors.textSecondary }]}>
              {student.orgName} · {student.programName}
            </ThemedText>
          </View>
        </View>
        <Pressable onPress={onClose} hitSlop={12}>
          <IconSymbol name="xmark" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Pills: status + hold */}
      <View style={styles.pillRow}>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: (STATUS_COLORS[student.status] ?? '#A1A1AA') + '1A' },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: STATUS_COLORS[student.status] ?? '#A1A1AA' },
            ]}
          />
          <ThemedText
            style={[
              styles.statusPillText,
              { color: STATUS_COLORS[student.status] ?? '#A1A1AA' },
            ]}
          >
            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
          </ThemedText>
        </View>

        {fullAccess && (
          <View
            style={[
              styles.holdPill,
              { backgroundColor: (HOLD_COLORS[holdType] ?? '#A1A1AA') + '1A' },
            ]}
          >
            <ThemedText
              style={[
                styles.holdPillText,
                { color: HOLD_COLORS[holdType] ?? '#A1A1AA' },
              ]}
            >
              {holdType === 'none' ? 'No Holds' : `${holdType.charAt(0).toUpperCase() + holdType.slice(1)} Hold`}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Quick chips */}
      <View style={styles.quickChipRow}>
        <View style={[styles.quickChip, { backgroundColor: '#1D9BF022' }]}>
          <IconSymbol name="book.fill" size={12} color="#1D9BF0" />
          <ThemedText style={[styles.quickChipText, { color: '#1D9BF0' }]}>
            {student.creditsCompleted}/{student.creditsRequired} Credits
          </ThemedText>
        </View>
        {gradesVisible && (
          <View
            style={[
              styles.quickChip,
              { backgroundColor: student.gpa >= 3.0 ? '#22C55E22' : '#F59E0B22' },
            ]}
          >
            <IconSymbol
              name="chart.bar.fill"
              size={12}
              color={student.gpa >= 3.0 ? '#22C55E' : '#F59E0B'}
            />
            <ThemedText
              style={[
                styles.quickChipText,
                { color: student.gpa >= 3.0 ? '#22C55E' : '#F59E0B' },
              ]}
            >
              {student.gpa.toFixed(2)} GPA
            </ThemedText>
          </View>
        )}
        {fullAccess && student.attendanceRisk && (
          <View style={[styles.quickChip, { backgroundColor: '#EF444422' }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#EF4444" />
            <ThemedText style={[styles.quickChipText, { color: '#EF4444' }]}>
              Attendance Risk
            </ThemedText>
          </View>
        )}
      </View>

      {/* Action icons */}
      <View style={styles.actionRow}>
        <ActionIcon icon="bubble.left.fill" label="Message" colors={colors} />
        {(fullAccess || roleLens === 'ED1') && (
          <ActionIcon icon="checkmark.circle.fill" label="Create Task" colors={colors} />
        )}
        {(fullAccess || roleLens === 'ED1') && (
          <ActionIcon icon="doc.badge.plus" label="Request" colors={colors} />
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

function OverviewTab({
  student,
  colors,
  roleLens,
  fullAccess,
}: {
  student: Student;
  colors: typeof Colors.light;
  roleLens: EducationRoleLens;
  fullAccess: boolean;
}) {
  const showContact = fullAccess || roleLens === 'ED2';

  return (
    <View>
      {/* Identity / Contact (gated) */}
      {showContact && (
        <SectionCard title="Identity + Contact" colors={colors}>
          <InfoRow label="Student ID" value={student.studentId} colors={colors} />
          <InfoRow label="Email" value={student.email} colors={colors} />
          <InfoRow label="Phone" value={student.phone} colors={colors} />
          <InfoRow label="Date of Birth" value={student.dateOfBirth} colors={colors} />
          <InfoRow label="Address" value={student.address} colors={colors} />
        </SectionCard>
      )}

      {/* Program + Cohort */}
      <SectionCard title="Program + Cohort" colors={colors}>
        <InfoRow label="Program" value={student.programName} colors={colors} />
        <InfoRow label="Cohort" value={student.cohort} colors={colors} />
        <InfoRow label="Enrollment Date" value={student.enrollmentDate} colors={colors} />
        <InfoRow label="Expected Graduation" value={student.expectedGraduation} colors={colors} />
        <InfoRow label="Academic Standing" value={student.academicStanding} colors={colors} />
      </SectionCard>

      {/* Credits + Standing */}
      <SectionCard title="Credits + Standing" colors={colors}>
        <View style={styles.statRow}>
          <StatBlock
            label="Credits Done"
            value={String(student.creditsCompleted)}
            color="#1D9BF0"
            colors={colors}
          />
          <StatBlock
            label="Credits Req"
            value={String(student.creditsRequired)}
            color="#FFFFFF"
            colors={colors}
          />
          <StatBlock
            label="Current Load"
            value={`${student.currentCredits} cr`}
            color="#22C55E"
            colors={colors}
          />
        </View>
        <View style={[styles.progressBarContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: '#1D9BF0',
                width: `${Math.min((student.creditsCompleted / student.creditsRequired) * 100, 100)}%`,
              },
            ]}
          />
        </View>
        <ThemedText style={[styles.captionText, { color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.xs }]}>
          {Math.round((student.creditsCompleted / student.creditsRequired) * 100)}% complete toward degree
        </ThemedText>
      </SectionCard>

      {/* Key Advisor Notes (gated) */}
      {fullAccess && (
        <SectionCard title="Key Advisor Notes" colors={colors}>
          {MOCK_ADVISING_NOTES_FULL.slice(0, 3).map((note) => (
            <View
              key={note.id}
              style={[styles.listRow, { borderBottomColor: colors.border }]}
            >
              <View
                style={[
                  styles.noteTypeDot,
                  { backgroundColor: ADVISING_NOTE_TYPE_COLORS[note.type] ?? '#A1A1AA' },
                ]}
              />
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {note.advisor} · {note.date}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]} numberOfLines={2}>
                  {note.summary}
                </ThemedText>
              </View>
            </View>
          ))}
        </SectionCard>
      )}
    </View>
  );
}

// =============================================================================
// TAB 2: SCHEDULE
// =============================================================================

function ScheduleTab({ colors }: { colors: typeof Colors.light }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  return (
    <View>
      {/* Week Calendar View */}
      <SectionCard title="Weekly Schedule" colors={colors}>
        {days.map((day) => {
          const sessions = MOCK_SCHEDULE_SESSIONS.filter((s) => s.day === day);
          if (sessions.length === 0) return null;
          return (
            <View key={day}>
              <ThemedText style={[styles.dayHeader, { color: colors.textSecondary }]}>
                {day}
              </ThemedText>
              {sessions.map((session) => (
                <View
                  key={session.id}
                  style={[styles.listRow, { borderBottomColor: colors.border }]}
                >
                  <View style={[styles.sessionTypeBadge, { backgroundColor: session.type === 'lecture' ? '#1D9BF022' : session.type === 'lab' ? '#22C55E22' : '#F59E0B22' }]}>
                    <ThemedText style={[styles.sessionTypeText, { color: session.type === 'lecture' ? '#1D9BF0' : session.type === 'lab' ? '#22C55E' : '#F59E0B' }]}>
                      {session.type.toUpperCase()}
                    </ThemedText>
                  </View>
                  <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                    <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                      {session.courseName}
                    </ThemedText>
                    <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                      {session.time} · {session.room}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          );
        })}
      </SectionCard>

      {/* Appointments */}
      <SectionCard title="Upcoming Appointments" colors={colors}>
        {MOCK_APPOINTMENTS.map((appt) => (
          <View
            key={appt.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <IconSymbol name="calendar" size={16} color={colors.textSecondary} />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {appt.title}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {appt.advisor} · {appt.date} at {appt.time}
              </ThemedText>
            </View>
            <View
              style={[
                styles.apptStatusBadge,
                { backgroundColor: appt.status === 'confirmed' ? '#22C55E22' : '#F59E0B22' },
              ]}
            >
              <ThemedText
                style={[
                  styles.apptStatusText,
                  { color: appt.status === 'confirmed' ? '#22C55E' : '#F59E0B' },
                ]}
              >
                {appt.status.toUpperCase()}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TAB 3: COURSES
// =============================================================================

function CoursesTab({
  colors,
  roleLens,
  gradesVisible,
  onOpenCourse,
}: {
  colors: typeof Colors.light;
  roleLens: EducationRoleLens;
  gradesVisible: boolean;
  onOpenCourse?: (courseId: string) => void;
}) {
  // ED1 = no grades, ED2 = own grades, ED3 = all grades, ED4 = dependent summary
  const showGrades = roleLens === 'ED2' || roleLens === 'ED3';
  const showGradeSummary = roleLens === 'ED4';

  return (
    <View>
      {/* Current Courses */}
      <SectionCard title="Current Courses" colors={colors}>
        {MOCK_CURRENT_COURSES.map((course) => (
          <Pressable
            key={course.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
            onPress={() => onOpenCourse?.(course.id)}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {course.name}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {course.code} · {course.instructor} · {course.credits} credits
              </ThemedText>
            </View>
            {showGrades && (
              <View style={[styles.gradeBadge, { backgroundColor: (GRADE_COLORS[course.grade] ?? '#A1A1AA') + '22' }]}>
                <ThemedText style={[styles.gradeText, { color: GRADE_COLORS[course.grade] ?? '#A1A1AA' }]}>
                  {course.grade}
                </ThemedText>
              </View>
            )}
            {showGradeSummary && (
              <View style={[styles.gradeBadge, { backgroundColor: '#1D9BF022' }]}>
                <ThemedText style={[styles.gradeText, { color: '#1D9BF0' }]}>
                  On Track
                </ThemedText>
              </View>
            )}
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </Pressable>
        ))}
      </SectionCard>

      {/* Past Courses */}
      <SectionCard title="Completed Courses" colors={colors}>
        {MOCK_PAST_COURSES.map((course) => (
          <Pressable
            key={course.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
            onPress={() => onOpenCourse?.(course.id)}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {course.name}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {course.code} · {course.instructor} · {course.credits} credits
              </ThemedText>
            </View>
            {showGrades && (
              <View style={[styles.gradeBadge, { backgroundColor: (GRADE_COLORS[course.grade] ?? '#A1A1AA') + '22' }]}>
                <ThemedText style={[styles.gradeText, { color: GRADE_COLORS[course.grade] ?? '#A1A1AA' }]}>
                  {course.grade}
                </ThemedText>
              </View>
            )}
            {showGradeSummary && (
              <View style={[styles.gradeBadge, { backgroundColor: '#22C55E22' }]}>
                <ThemedText style={[styles.gradeText, { color: '#22C55E' }]}>
                  Passed
                </ThemedText>
              </View>
            )}
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </Pressable>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TAB 4: PROGRESS
// =============================================================================

function ProgressTab({
  student,
  colors,
}: {
  student: Student;
  colors: typeof Colors.light;
}) {
  const creditsRemaining = student.creditsRequired - student.creditsCompleted;
  const semestersNeeded = Math.ceil(creditsRemaining / student.currentCredits);
  const metCount = MOCK_DEGREE_AUDIT.filter((r) => r.status === 'met').length;
  const inProgressCount = MOCK_DEGREE_AUDIT.filter((r) => r.status === 'in_progress').length;
  const missingCount = MOCK_DEGREE_AUDIT.filter((r) => r.status === 'missing').length;

  return (
    <View>
      {/* Degree Audit Checklist */}
      <SectionCard title="Degree Audit" colors={colors}>
        <View style={styles.statRow}>
          <StatBlock label="Met" value={String(metCount)} color="#22C55E" colors={colors} />
          <StatBlock label="In Progress" value={String(inProgressCount)} color="#1D9BF0" colors={colors} />
          <StatBlock label="Missing" value={String(missingCount)} color="#EF4444" colors={colors} />
        </View>
      </SectionCard>

      <SectionCard title="Requirements" colors={colors}>
        {MOCK_DEGREE_AUDIT.map((req) => (
          <View
            key={req.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View
              style={[
                styles.auditStatusIcon,
                { backgroundColor: (AUDIT_STATUS_COLORS[req.status] ?? '#A1A1AA') + '22' },
              ]}
            >
              <IconSymbol
                name={
                  req.status === 'met'
                    ? 'checkmark.circle.fill'
                    : req.status === 'in_progress'
                    ? 'clock.fill'
                    : 'xmark.circle.fill'
                }
                size={14}
                color={AUDIT_STATUS_COLORS[req.status] ?? '#A1A1AA'}
              />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {req.requirement}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {req.completed}/{req.credits} credits completed
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.statusLabel,
                { color: AUDIT_STATUS_COLORS[req.status] ?? '#A1A1AA' },
              ]}
            >
              {req.status === 'met' ? 'MET' : req.status === 'in_progress' ? 'IN PROGRESS' : 'MISSING'}
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      {/* Completion Forecast */}
      <SectionCard title="Completion Forecast" colors={colors}>
        <View style={styles.statRow}>
          <StatBlock
            label="Credits Left"
            value={String(creditsRemaining)}
            color="#F59E0B"
            colors={colors}
          />
          <StatBlock
            label="Semesters"
            value={`~${semestersNeeded}`}
            color="#1D9BF0"
            colors={colors}
          />
          <StatBlock
            label="Target Grad"
            value={student.expectedGraduation.split(',')[0] ?? student.expectedGraduation}
            color="#22C55E"
            colors={colors}
          />
        </View>
        <ThemedText style={[styles.bodyText, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
          At the current pace of {student.currentCredits} credits per semester, degree completion is projected for {student.expectedGraduation}. No schedule adjustments recommended at this time.
        </ThemedText>
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TAB 5: ATTENDANCE
// =============================================================================

function AttendanceTab({
  colors,
  roleLens,
  programDir,
}: {
  colors: typeof Colors.light;
  roleLens: EducationRoleLens;
  programDir: boolean;
}) {
  const presentCount = MOCK_ATTENDANCE_RECORDS.filter((r) => r.status === 'present').length;
  const absentCount = MOCK_ATTENDANCE_RECORDS.filter((r) => r.status === 'absent').length;
  const lateCount = MOCK_ATTENDANCE_RECORDS.filter((r) => r.status === 'late').length;
  const excusedCount = MOCK_ATTENDANCE_RECORDS.filter((r) => r.status === 'excused').length;
  const totalSessions = MOCK_ATTENDANCE_RECORDS.length;
  const attendanceRate = Math.round(((presentCount + excusedCount) / totalSessions) * 100);

  return (
    <View>
      {/* Attendance Summary */}
      <SectionCard title="Attendance Summary" colors={colors}>
        <View style={styles.statRow}>
          <StatBlock label="Rate" value={`${attendanceRate}%`} color={attendanceRate >= 85 ? '#22C55E' : '#F59E0B'} colors={colors} />
          <StatBlock label="Present" value={String(presentCount)} color="#22C55E" colors={colors} />
          <StatBlock label="Absent" value={String(absentCount)} color="#EF4444" colors={colors} />
          <StatBlock label="Late" value={String(lateCount)} color="#F59E0B" colors={colors} />
        </View>
      </SectionCard>

      {/* Attendance Timeline */}
      <SectionCard title="Recent Attendance" colors={colors}>
        {MOCK_ATTENDANCE_RECORDS.map((record) => (
          <View
            key={record.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View
              style={[
                styles.attendanceDot,
                { backgroundColor: ATTENDANCE_COLORS[record.status] ?? '#A1A1AA' },
              ]}
            />
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {record.course}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {record.date}
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.statusLabel,
                { color: ATTENDANCE_COLORS[record.status] ?? '#A1A1AA' },
              ]}
            >
              {record.status.toUpperCase()}
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      {/* Missed Sessions Flags */}
      {absentCount > 0 && (
        <SectionCard title="Missed Session Flags" colors={colors}>
          {MOCK_ATTENDANCE_RECORDS.filter((r) => r.status === 'absent').map((record) => (
            <View
              key={record.id}
              style={[styles.listRow, { borderBottomColor: colors.border }]}
            >
              <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#EF4444" />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {record.course} — {record.date}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: '#EF4444' }]}>
                  Unexcused absence. Follow-up recommended.
                </ThemedText>
              </View>
            </View>
          ))}
        </SectionCard>
      )}

      {/* Outreach Actions (Program Director only) */}
      {programDir && (
        <View style={styles.actionButtonGrid}>
          <ActionButton label="Send Attendance Warning" icon="exclamationmark.bubble.fill" colors={colors} />
          <ActionButton label="Schedule Check-In" icon="calendar.badge.plus" colors={colors} />
          <ActionButton label="Create Outreach Task" icon="person.badge.plus" colors={colors} />
        </View>
      )}
    </View>
  );
}

// =============================================================================
// TAB 6: ADVISING
// =============================================================================

function AdvisingTab({
  colors,
  roleLens,
}: {
  colors: typeof Colors.light;
  roleLens: EducationRoleLens;
}) {
  // ED1 = limited notes, ED2 = own notes, ED3 = full, ED4 = summary
  const showFullNotes = roleLens === 'ED3';
  const showOwnNotes = roleLens === 'ED2';
  const showLimited = roleLens === 'ED1';
  const showSummary = roleLens === 'ED4';

  const visibleNotes = showFullNotes
    ? MOCK_ADVISING_NOTES_FULL
    : showOwnNotes
    ? MOCK_ADVISING_NOTES_FULL
    : showLimited
    ? MOCK_ADVISING_NOTES_FULL.filter((n) => n.type === 'academic').slice(0, 2)
    : MOCK_ADVISING_NOTES_FULL.slice(0, 1);

  return (
    <View>
      {/* Assigned Advisor Info */}
      <SectionCard title="Assigned Advisor" colors={colors}>
        <View style={styles.advisorCard}>
          <View style={[styles.advisorAvatar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[styles.avatarText, { color: colors.textSecondary }]}>DW</ThemedText>
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
              Dr. Williams
            </ThemedText>
            <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
              Academic Advisor · Sports Management Department
            </ThemedText>
            <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
              d.williams@university.edu · Office: BUS 312
            </ThemedText>
          </View>
        </View>
      </SectionCard>

      {/* Next Advising Meeting */}
      <SectionCard title="Next Advising Meeting" colors={colors}>
        <View style={styles.listRow}>
          <IconSymbol name="calendar" size={16} color="#1D9BF0" />
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
              Pre-Registration Advising
            </ThemedText>
            <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
              Feb 20, 2026 · 2:00 PM · Office BUS 312
            </ThemedText>
            <ThemedText style={[styles.captionText, { color: colors.textTertiary }]}>
              Agenda: Fall 2026 course selection, internship placement review
            </ThemedText>
          </View>
        </View>
      </SectionCard>

      {/* Advising Notes */}
      <SectionCard title={showSummary ? 'Advising Summary' : 'Advising Notes'} colors={colors}>
        {showSummary ? (
          <View>
            <ThemedText style={[styles.bodyText, { color: colors.text }]}>
              Student is meeting regularly with academic advisor. GPA trending upward. On track for expected graduation date. No academic concerns flagged.
            </ThemedText>
          </View>
        ) : (
          visibleNotes.map((note) => (
            <View
              key={note.id}
              style={[styles.listRow, { borderBottomColor: colors.border }]}
            >
              <View
                style={[
                  styles.noteTypeBadge,
                  { backgroundColor: (ADVISING_NOTE_TYPE_COLORS[note.type] ?? '#A1A1AA') + '22' },
                ]}
              >
                <ThemedText
                  style={[
                    styles.noteTypeText,
                    { color: ADVISING_NOTE_TYPE_COLORS[note.type] ?? '#A1A1AA' },
                  ]}
                >
                  {note.type.toUpperCase()}
                </ThemedText>
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {note.advisor} · {note.date}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {note.summary}
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
// TAB 7: HOLDS + COMPLIANCE
// =============================================================================

function HoldsComplianceTab({
  colors,
  roleLens,
  fullAccess,
}: {
  colors: typeof Colors.light;
  roleLens: EducationRoleLens;
  fullAccess: boolean;
}) {
  const showConduct = fullAccess;
  const canManageHolds = roleLens === 'ED3';

  return (
    <View>
      {/* Holds List */}
      <SectionCard title="Holds" colors={colors}>
        {MOCK_HOLDS.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No holds on this student record
          </ThemedText>
        ) : (
          MOCK_HOLDS.map((hold) => (
            <View
              key={hold.id}
              style={[styles.listRow, { borderBottomColor: colors.border }]}
            >
              <View
                style={[
                  styles.holdStatusBadge,
                  { backgroundColor: (HOLD_STATUS_COLORS[hold.status] ?? '#A1A1AA') + '22' },
                ]}
              >
                <ThemedText
                  style={[
                    styles.holdStatusText,
                    { color: HOLD_STATUS_COLORS[hold.status] ?? '#A1A1AA' },
                  ]}
                >
                  {hold.status.toUpperCase()}
                </ThemedText>
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {hold.type.charAt(0).toUpperCase() + hold.type.slice(1)} Hold
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {hold.reason}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textTertiary }]}>
                  Created: {hold.createdDate}{hold.resolvedDate ? ` · Resolved: ${hold.resolvedDate}` : ''}
                </ThemedText>
              </View>
            </View>
          ))
        )}
      </SectionCard>

      {/* Conduct Cases (gated) */}
      {showConduct && (
        <SectionCard title="Conduct Cases" colors={colors}>
          {MOCK_CONDUCT_CASES.length === 0 ? (
            <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
              No conduct cases on record
            </ThemedText>
          ) : (
            MOCK_CONDUCT_CASES.map((cc) => (
              <View
                key={cc.id}
                style={[styles.listRow, { borderBottomColor: colors.border }]}
              >
                <IconSymbol name="shield.fill" size={16} color={cc.status === 'cleared' ? '#22C55E' : '#F59E0B'} />
                <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                  <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                    {cc.title}
                  </ThemedText>
                  <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                    {cc.date} · {cc.status.charAt(0).toUpperCase() + cc.status.slice(1)}
                  </ThemedText>
                  <ThemedText style={[styles.captionText, { color: colors.textTertiary }]}>
                    {cc.details}
                  </ThemedText>
                </View>
              </View>
            ))
          )}
        </SectionCard>
      )}

      {/* Accommodations Indicator */}
      <SectionCard title="Accommodations" colors={colors}>
        <View style={styles.listRow}>
          <IconSymbol name="person.fill.checkmark" size={16} color="#1D9BF0" />
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
              Accommodations on File
            </ThemedText>
            <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
              Details restricted to authorized personnel only. Contact Disability Services for specifics.
            </ThemedText>
          </View>
          <View style={[styles.indicatorBadge, { backgroundColor: '#1D9BF022' }]}>
            <ThemedText style={[styles.indicatorText, { color: '#1D9BF0' }]}>YES</ThemedText>
          </View>
        </View>
      </SectionCard>

      {/* Action Buttons (ED3 only) */}
      {canManageHolds && (
        <View style={styles.actionButtonGrid}>
          <ActionButton label="Place Hold" icon="exclamationmark.triangle.fill" colors={colors} />
          <ActionButton label="Release Hold" icon="checkmark.circle.fill" colors={colors} />
        </View>
      )}
    </View>
  );
}

// =============================================================================
// TAB 8: BILLING + PAYMENT RAILS
// =============================================================================

function BillingTab({
  colors,
  roleLens,
  fullAccess,
  programDir,
}: {
  colors: typeof Colors.light;
  roleLens: EducationRoleLens;
  fullAccess: boolean;
  programDir: boolean;
}) {
  const showTransactions = fullAccess;
  const showRefundStatus = fullAccess;
  const canCreatePaymentRequest = roleLens === 'ED1' || roleLens === 'ED3';
  const canManageHolds = roleLens === 'ED3';

  return (
    <View>
      {/* Balance Summary */}
      <SectionCard title="Balance Summary" colors={colors}>
        <View style={styles.financeGrid}>
          <FinanceCard
            label="Total Charges"
            value={MOCK_BALANCE_SUMMARY.totalCharges}
            subtitle="Academic Year 2025-26"
            color="#EF4444"
            colors={colors}
          />
          <FinanceCard
            label="Total Payments"
            value={MOCK_BALANCE_SUMMARY.totalPayments}
            subtitle="Payments + Aid"
            color="#22C55E"
            colors={colors}
          />
        </View>
        <View style={[styles.balanceHighlight, { backgroundColor: '#F59E0B22', borderColor: '#F59E0B33' }]}>
          <ThemedText style={[styles.balanceLabel, { color: '#F59E0B' }]}>Outstanding Balance</ThemedText>
          <ThemedText style={[styles.balanceValue, { color: '#F59E0B' }]}>{MOCK_BALANCE_SUMMARY.outstandingBalance}</ThemedText>
          <ThemedText style={[styles.captionText, { color: '#F59E0B' }]}>
            Next payment: {MOCK_BALANCE_SUMMARY.nextPaymentAmount} due {MOCK_BALANCE_SUMMARY.nextPaymentDue}
          </ThemedText>
        </View>
      </SectionCard>

      {/* Payment Plan Status */}
      <SectionCard title="Payment Plan" colors={colors}>
        <InfoRow label="Plan Type" value={MOCK_PAYMENT_PLAN.type} colors={colors} />
        <InfoRow label="Total" value={MOCK_PAYMENT_PLAN.totalAmount} colors={colors} />
        <InfoRow label="Paid" value={MOCK_PAYMENT_PLAN.paid} colors={colors} />
        <InfoRow label="Remaining" value={MOCK_PAYMENT_PLAN.remaining} colors={colors} />

        <ThemedText style={[styles.subSectionTitle, { color: colors.text, marginTop: Spacing.sm }]}>
          Installments
        </ThemedText>
        {MOCK_PAYMENT_PLAN.installments.map((inst) => (
          <View
            key={inst.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View
              style={[
                styles.installmentDot,
                { backgroundColor: PAYMENT_INSTALLMENT_COLORS[inst.status] ?? '#A1A1AA' },
              ]}
            />
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {inst.amount} — Due {inst.dueDate}
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.statusLabel,
                { color: PAYMENT_INSTALLMENT_COLORS[inst.status] ?? '#A1A1AA' },
              ]}
            >
              {inst.status.toUpperCase()}
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      {/* Transaction Ledger (gated) */}
      {showTransactions && (
        <SectionCard title="Transaction Ledger" colors={colors}>
          {MOCK_TRANSACTIONS.map((txn) => (
            <View
              key={txn.id}
              style={[styles.listRow, { borderBottomColor: colors.border }]}
            >
              <View
                style={[
                  styles.transactionTypeDot,
                  { backgroundColor: TRANSACTION_TYPE_COLORS[txn.type] ?? '#A1A1AA' },
                ]}
              />
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {txn.description}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {txn.date} · {txn.type.replace('_', ' ').charAt(0).toUpperCase() + txn.type.replace('_', ' ').slice(1)}
                </ThemedText>
              </View>
              <ThemedText
                style={[
                  styles.transactionAmount,
                  { color: txn.amount.startsWith('+') ? '#22C55E' : '#EF4444' },
                ]}
              >
                {txn.amount}
              </ThemedText>
            </View>
          ))}
        </SectionCard>
      )}

      {/* Refund Status (gated) */}
      {showRefundStatus && (
        <SectionCard title="Refund Status" colors={colors}>
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No pending refund requests
          </ThemedText>
        </SectionCard>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtonGrid}>
        {canCreatePaymentRequest && (
          <ActionButton label="Create Payment Request" icon="dollarsign.circle.fill" colors={colors} />
        )}
        {canManageHolds && (
          <>
            <ActionButton label="Place Financial Hold" icon="exclamationmark.triangle.fill" colors={colors} />
            <ActionButton label="Release Financial Hold" icon="checkmark.circle.fill" colors={colors} />
          </>
        )}
      </View>
    </View>
  );
}

// =============================================================================
// TAB 9: DOCUMENTS
// =============================================================================

function DocumentsTab({
  colors,
  roleLens,
  gradesVisible,
}: {
  colors: typeof Colors.light;
  roleLens: EducationRoleLens;
  gradesVisible: boolean;
}) {
  // Transcript is gated
  const showTranscript = gradesVisible;

  const enrollmentDocs = MOCK_DOCUMENTS.filter((d) => d.type === 'enrollment');
  const transcriptDocs = MOCK_DOCUMENTS.filter((d) => d.type === 'transcript');
  const verificationDocs = MOCK_DOCUMENTS.filter((d) => d.type === 'verification');
  const consentDocs = MOCK_DOCUMENTS.filter((d) => d.type === 'consent');
  const financialDocs = MOCK_DOCUMENTS.filter((d) => d.type === 'financial');
  const otherDocs = MOCK_DOCUMENTS.filter((d) => d.type === 'accommodation');

  return (
    <View>
      {/* Enrollment Forms */}
      <SectionCard title="Enrollment Forms" colors={colors}>
        {enrollmentDocs.map((doc) => (
          <DocumentRow key={doc.id} doc={doc} colors={colors} />
        ))}
      </SectionCard>

      {/* Transcript (gated) */}
      {showTranscript && (
        <SectionCard title="Transcript" colors={colors}>
          {transcriptDocs.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} colors={colors} />
          ))}
        </SectionCard>
      )}

      {/* Verification Letters */}
      <SectionCard title="Verification Letters" colors={colors}>
        {verificationDocs.map((doc) => (
          <DocumentRow key={doc.id} doc={doc} colors={colors} />
        ))}
      </SectionCard>

      {/* Consents */}
      <SectionCard title="Consents + Agreements" colors={colors}>
        {consentDocs.map((doc) => (
          <DocumentRow key={doc.id} doc={doc} colors={colors} />
        ))}
      </SectionCard>

      {/* Financial Documents */}
      <SectionCard title="Financial Documents" colors={colors}>
        {financialDocs.map((doc) => (
          <DocumentRow key={doc.id} doc={doc} colors={colors} />
        ))}
      </SectionCard>

      {/* Other */}
      {otherDocs.length > 0 && (
        <SectionCard title="Other Documents" colors={colors}>
          {otherDocs.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} colors={colors} />
          ))}
        </SectionCard>
      )}
    </View>
  );
}

function DocumentRow({
  doc,
  colors,
}: {
  doc: { id: string; title: string; type: string; status: string; date: string | null };
  colors: typeof Colors.light;
}) {
  const statusColor = DOCUMENT_STATUS_COLORS[doc.status] ?? '#A1A1AA';

  return (
    <View style={[styles.listRow, { borderBottomColor: colors.border }]}>
      <IconSymbol
        name={
          doc.status === 'completed' || doc.status === 'available'
            ? 'doc.fill'
            : doc.status === 'pending'
            ? 'doc.badge.clock.fill'
            : 'doc.badge.plus'
        }
        size={16}
        color={statusColor}
      />
      <View style={{ flex: 1, marginLeft: Spacing.sm }}>
        <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
          {doc.title}
        </ThemedText>
        {doc.date && (
          <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
            {doc.date}
          </ThemedText>
        )}
      </View>
      <View style={[styles.docStatusBadge, { backgroundColor: statusColor + '22' }]}>
        <ThemedText style={[styles.docStatusText, { color: statusColor }]}>
          {doc.status.toUpperCase()}
        </ThemedText>
      </View>
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

function FinanceCard({
  label,
  value,
  subtitle,
  color,
  colors,
}: {
  label: string;
  value: string;
  subtitle: string;
  color: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={[styles.financeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
        {label}
      </ThemedText>
      <ThemedText style={[styles.financeValue, { color }]}>{value}</ThemedText>
      <ThemedText style={[styles.captionText, { color: colors.textTertiary }]}>
        {subtitle}
      </ThemedText>
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

// =============================================================================
// STYLES
// =============================================================================

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
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  studentName: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  subtitleLabel: {
    fontSize: 13,
    marginTop: 2,
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
  holdPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  holdPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  quickChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  quickChipText: {
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
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.xs,
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
    width: 120,
  },
  infoValue: {
    fontSize: 13,
    flex: 1,
  },

  // Schedule
  dayHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sessionTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    minWidth: 52,
    alignItems: 'center',
  },
  sessionTypeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Appointments
  apptStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  apptStatusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Courses
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.xs,
  },
  gradeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Degree audit
  auditStatusIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Progress bar
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Attendance
  attendanceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Advising
  advisorCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  advisorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  noteTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  noteTypeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Holds
  holdStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  holdStatusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  indicatorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  indicatorText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Billing
  financeGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  financeCard: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 2,
  },
  financeValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  balanceHighlight: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 2,
  },
  installmentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  transactionTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Documents
  docStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  docStatusText: {
    fontSize: 9,
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
