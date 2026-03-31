/**
 * Universal Program Sheet — Education Mode
 * Program "truth page" with 10 RBAC-gated tabs.
 * This is the CONTENT component — the parent handles the bottom sheet wrapper.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';

const ACCENT = MODE_ACCENT.education;
import { useColorScheme } from '@/hooks/use-color-scheme';

import {
  type Program,
  type Student,
  type Course,
  type StaffMember,
  STUDENTS,
  COURSES,
  STAFF_MEMBERS,
  getStudentsByProgram,
  getCoursesByProgram,
  getStudentsWithHolds,
  getStudentsAtRisk,
} from '@/data/mock-education-v2';

import {
  type EducationRoleLens,
  type ProgramTab,
  getProgramSheetTabs,
  isFullAccess,
  isProgramDirector,
  isStudentOrParent,
  canViewGrades,
} from '@/utils/education-rbac';

// =============================================================================
// PROPS
// =============================================================================

interface UniversalProgramSheetProps {
  program: Program;
  roleLens: EducationRoleLens;
  onClose: () => void;
  onSelectStudent?: (studentId: string) => void;
  onSelectCourse?: (courseId: string) => void;
}

// =============================================================================
// STATUS / LEVEL HELPERS
// =============================================================================

const LEVEL_COLORS: Record<string, string> = {
  certificate: '#9C9790',
  associate: ACCENT,
  bachelor: '#5A8A6E',
  master: '#B8943E',
  doctoral: '#B85C5C',
};

const PROGRAM_STATUS_COLORS: Record<string, string> = {
  active: '#5A8A6E',
  inactive: '#9C9790',
  under_review: '#B8943E',
};

const STUDENT_STATUS_COLORS: Record<string, string> = {
  applicant: ACCENT,
  enrolled: '#5A8A6E',
  leave: '#B8943E',
  withdrawn: '#B85C5C',
  alumni: '#9C9790',
};

const COURSE_STATUS_COLORS: Record<string, string> = {
  active: '#5A8A6E',
  completed: '#9C9790',
  planned: ACCENT,
  cancelled: '#B85C5C',
};

const HOLD_TYPE_COLORS: Record<string, string> = {
  financial: '#B85C5C',
  academic: '#B8943E',
  conduct: '#B85C5C',
};

const RISK_COLORS: Record<string, string> = {
  low: '#5A8A6E',
  medium: '#B8943E',
  high: '#B85C5C',
};

const BUDGET_CATEGORY_COLORS: Record<string, string> = {
  personnel: ACCENT,
  facilities: '#B8943E',
  technology: '#5A8A6E',
  scholarships: '#B85C5C',
  operations: '#9C9790',
  marketing: ACCENT,
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  current: '#5A8A6E',
  delinquent: '#B85C5C',
  deferred: '#B8943E',
  paid_in_full: '#5A8A6E',
};

const COMPLIANCE_STATUS_COLORS: Record<string, string> = {
  compliant: '#5A8A6E',
  pending: '#B8943E',
  non_compliant: '#B85C5C',
  under_review: ACCENT,
  not_applicable: '#9C9790',
};

const ACCREDITATION_STATUS_COLORS: Record<string, string> = {
  accredited: '#5A8A6E',
  provisional: '#B8943E',
  under_review: ACCENT,
  revoked: '#B85C5C',
};

// =============================================================================
// INLINE MOCK DATA (program-specific)
// =============================================================================

const MOCK_PROGRAM_DESCRIPTION = 'The Sports Management program prepares students for leadership roles in athletic administration, facility management, event operations, and sports marketing. Combining business fundamentals with sports-specific coursework, the program produces graduates who are ready to lead in professional, collegiate, and community sports organizations.';

const MOCK_MISSION = 'To develop ethical, innovative, and analytically skilled leaders who will advance the sports industry through strategic management, inclusive practices, and a commitment to excellence in all aspects of athletic administration.';

const MOCK_ACCREDITATION = {
  body: 'COSMA (Commission on Sport Management Accreditation)',
  status: 'accredited' as const,
  lastReview: 'Sep 2024',
  nextReview: 'Sep 2031',
  notes: 'Full accreditation renewed for 7-year cycle. No conditions or recommendations.',
};

const MOCK_KEY_DATES = [
  { id: 'kd-1', event: 'Spring Application Deadline', date: 'Dec 1, 2025', status: 'passed' as const },
  { id: 'kd-2', event: 'Spring Semester Begins', date: 'Jan 13, 2026', status: 'passed' as const },
  { id: 'kd-3', event: 'Midterm Grades Due', date: 'Mar 13, 2026', status: 'upcoming' as const },
  { id: 'kd-4', event: 'Fall Registration Opens', date: 'Apr 1, 2026', status: 'upcoming' as const },
  { id: 'kd-5', event: 'Spring Semester Ends', date: 'May 8, 2026', status: 'upcoming' as const },
  { id: 'kd-6', event: 'Graduation Ceremony', date: 'May 15, 2026', status: 'upcoming' as const },
  { id: 'kd-7', event: 'Summer Session Begins', date: 'Jun 1, 2026', status: 'upcoming' as const },
  { id: 'kd-8', event: 'Fall Application Deadline', date: 'Jul 1, 2026', status: 'upcoming' as const },
];

const DATE_STATUS_COLORS: Record<string, string> = {
  passed: '#9C9790',
  upcoming: ACCENT,
  today: '#5A8A6E',
};

const MOCK_CONTACT_INFO = {
  director: 'Dr. Sarah Thomas',
  email: 'sportsmanagement@university.edu',
  phone: '(555) 123-4567',
  office: 'Business Building, Suite 300',
  website: 'university.edu/sports-management',
};

const MOCK_FACULTY = [
  { id: 'fac-1', name: 'Dr. Sarah Thomas', role: 'Program Director', department: 'Sports Management', specialization: 'Athletic Administration', status: 'active' as const },
  { id: 'fac-2', name: 'Dr. James Patel', role: 'Associate Professor', department: 'Sports Management', specialization: 'Sports Analytics', status: 'active' as const },
  { id: 'fac-3', name: 'Prof. Linda Kim', role: 'Assistant Professor', department: 'Sports Management', specialization: 'Sports Marketing', status: 'active' as const },
  { id: 'fac-4', name: 'Dr. Robert Nguyen', role: 'Associate Professor', department: 'Sports Management', specialization: 'Sports Ethics & Law', status: 'active' as const },
  { id: 'fac-5', name: 'Prof. Amanda Davis', role: 'Lecturer', department: 'Sports Management', specialization: 'Event Operations', status: 'active' as const },
];

const MOCK_STAFF = [
  { id: 'staff-1', name: 'Maria Chen', role: 'Academic Advisor', department: 'Student Services', status: 'active' as const },
  { id: 'staff-2', name: 'James Park', role: 'Career Counselor', department: 'Career Services', status: 'active' as const },
  { id: 'staff-3', name: 'Lisa Johnson', role: 'Program Coordinator', department: 'Sports Management', status: 'active' as const },
  { id: 'staff-4', name: 'Dr. Williams', role: 'Academic Advisor', department: 'Sports Management', status: 'active' as const },
];

const MOCK_ACTIVE_COURSES = [
  { id: 'mc-1', code: 'SMG-301', name: 'Sports Management 301', instructor: 'Dr. Thomas', enrolled: 12, capacity: 35, status: 'active' as const },
  { id: 'mc-2', code: 'KIN-210', name: 'Kinesiology 210', instructor: 'Dr. Patel', enrolled: 28, capacity: 30, status: 'active' as const },
  { id: 'mc-3', code: 'SPA-400', name: 'Sports Analytics', instructor: 'Prof. Kim', enrolled: 18, capacity: 25, status: 'active' as const },
  { id: 'mc-4', code: 'SPE-350', name: 'Sports Ethics', instructor: 'Dr. Nguyen', enrolled: 22, capacity: 30, status: 'active' as const },
  { id: 'mc-5', code: 'SPL-310', name: 'Sports Law', instructor: 'Prof. Davis', enrolled: 20, capacity: 30, status: 'active' as const },
  { id: 'mc-6', code: 'SMK-280', name: 'Sports Marketing', instructor: 'Prof. Kim', enrolled: 25, capacity: 30, status: 'active' as const },
];

const MOCK_COMPLETED_COURSES = [
  { id: 'cc-1', code: 'SMG-101', name: 'Intro to Sports Mgmt', instructor: 'Dr. Thomas', term: 'Fall 2025', avgGrade: 'B+' },
  { id: 'cc-2', code: 'BUS-200', name: 'Business Fundamentals', instructor: 'Dr. Adams', term: 'Fall 2025', avgGrade: 'B' },
  { id: 'cc-3', code: 'COM-150', name: 'Communications', instructor: 'Prof. Rivera', term: 'Fall 2025', avgGrade: 'B+' },
];

const MOCK_PLANNED_COURSES = [
  { id: 'pc-1', code: 'SMG-401', name: 'Strategic Sports Mgmt', term: 'Fall 2026', status: 'planned' as const },
  { id: 'pc-2', code: 'SMG-490', name: 'Sports Mgmt Capstone', term: 'Spring 2027', status: 'planned' as const },
  { id: 'pc-3', code: 'INT-400', name: 'Sports Industry Internship', term: 'Summer 2026', status: 'planned' as const },
];

const MOCK_STUDENT_ROSTER = [
  { id: 'sr-1', studentId: 'STU-001', name: 'Marcus Johnson', status: 'enrolled' as const, gpa: 3.42, holds: [] as string[], riskLevel: 'low' as const },
  { id: 'sr-2', studentId: 'STU-002', name: 'Aisha Williams', status: 'enrolled' as const, gpa: 3.85, holds: [] as string[], riskLevel: 'low' as const },
  { id: 'sr-3', studentId: 'STU-003', name: 'David Chen', status: 'enrolled' as const, gpa: 3.12, holds: [] as string[], riskLevel: 'low' as const },
  { id: 'sr-4', studentId: 'STU-004', name: 'Sophia Martinez', status: 'enrolled' as const, gpa: 2.65, holds: ['academic'] as string[], riskLevel: 'high' as const },
  { id: 'sr-5', studentId: 'STU-005', name: 'Tyler Washington', status: 'enrolled' as const, gpa: 3.55, holds: [] as string[], riskLevel: 'low' as const },
  { id: 'sr-6', studentId: 'STU-006', name: 'Emma Thompson', status: 'enrolled' as const, gpa: 3.92, holds: [] as string[], riskLevel: 'low' as const },
  { id: 'sr-7', studentId: 'STU-007', name: 'Jordan Lee', status: 'enrolled' as const, gpa: 1.85, holds: ['financial', 'academic'] as string[], riskLevel: 'high' as const },
  { id: 'sr-8', studentId: 'STU-008', name: 'Olivia Brown', status: 'enrolled' as const, gpa: 3.48, holds: [] as string[], riskLevel: 'low' as const },
  { id: 'sr-9', studentId: 'STU-009', name: 'Jamal Davis', status: 'enrolled' as const, gpa: 2.95, holds: ['financial'] as string[], riskLevel: 'medium' as const },
  { id: 'sr-10', studentId: 'STU-010', name: 'Grace Kim', status: 'enrolled' as const, gpa: 3.78, holds: [] as string[], riskLevel: 'low' as const },
  { id: 'sr-11', studentId: 'STU-011', name: 'Nathan Park', status: 'enrolled' as const, gpa: 2.80, holds: [] as string[], riskLevel: 'medium' as const },
  { id: 'sr-12', studentId: 'STU-012', name: 'Isabella Nguyen', status: 'withdrawn' as const, gpa: 2.10, holds: [] as string[], riskLevel: 'high' as const },
  { id: 'sr-13', studentId: 'STU-013', name: 'Ethan Williams', status: 'leave' as const, gpa: 3.20, holds: [] as string[], riskLevel: 'medium' as const },
  { id: 'sr-14', studentId: 'STU-014', name: 'Mia Robinson', status: 'enrolled' as const, gpa: 3.65, holds: [] as string[], riskLevel: 'low' as const },
  { id: 'sr-15', studentId: 'STU-015', name: 'Liam Foster', status: 'enrolled' as const, gpa: 3.10, holds: [] as string[], riskLevel: 'low' as const },
];

const MOCK_CALENDAR = [
  { id: 'cal-1', event: 'Spring Registration Opens', date: 'Nov 1, 2025', type: 'registration' as const },
  { id: 'cal-2', event: 'Spring Semester Begins', date: 'Jan 13, 2026', type: 'academic' as const },
  { id: 'cal-3', event: 'Add/Drop Deadline', date: 'Jan 27, 2026', type: 'registration' as const },
  { id: 'cal-4', event: 'Midterm Exams', date: 'Mar 2-6, 2026', type: 'exam' as const },
  { id: 'cal-5', event: 'Midterm Grades Due', date: 'Mar 13, 2026', type: 'academic' as const },
  { id: 'cal-6', event: 'Spring Break', date: 'Mar 16-20, 2026', type: 'break' as const },
  { id: 'cal-7', event: 'Fall Registration Opens', date: 'Apr 1, 2026', type: 'registration' as const },
  { id: 'cal-8', event: 'Withdrawal Deadline', date: 'Apr 10, 2026', type: 'registration' as const },
  { id: 'cal-9', event: 'Final Exams', date: 'May 4-8, 2026', type: 'exam' as const },
  { id: 'cal-10', event: 'Final Grades Due', date: 'May 15, 2026', type: 'academic' as const },
  { id: 'cal-11', event: 'Graduation Ceremony', date: 'May 22, 2026', type: 'ceremony' as const },
  { id: 'cal-12', event: 'Summer Session I Begins', date: 'Jun 1, 2026', type: 'academic' as const },
];

const CALENDAR_TYPE_COLORS: Record<string, string> = {
  registration: ACCENT,
  academic: '#5A8A6E',
  exam: '#B85C5C',
  break: '#B8943E',
  ceremony: '#9C9790',
};

const MOCK_OPERATIONS = {
  rooms: [
    { id: 'rm-1', name: 'BUS 204', type: 'Lecture Hall', capacity: 35, assigned: 'SMG-301' },
    { id: 'rm-2', name: 'SCI 108', type: 'Lecture Room', capacity: 30, assigned: 'KIN-210' },
    { id: 'rm-3', name: 'TECH 301', type: 'Computer Lab', capacity: 25, assigned: 'SPA-400' },
    { id: 'rm-4', name: 'HUM 115', type: 'Seminar Room', capacity: 30, assigned: 'SPE-350' },
    { id: 'rm-5', name: 'LAW 220', type: 'Lecture Room', capacity: 30, assigned: 'SPL-310' },
  ],
  equipment: [
    { item: 'Projectors + Screens (5)', status: 'operational' as const },
    { item: 'Sports Analytics Software Licenses (25)', status: 'operational' as const },
    { item: 'Lecture Capture Systems (3)', status: 'maintenance' as const },
    { item: 'Student Polling Clickers (100)', status: 'operational' as const },
    { item: 'Video Conferencing Equipment (2)', status: 'operational' as const },
  ],
  budgetRequests: [
    { id: 'br-1', title: 'Analytics Lab Upgrade', amount: '$45,000', status: 'approved' as const, date: 'Jan 15, 2026' },
    { id: 'br-2', title: 'Guest Speaker Series Funding', amount: '$8,000', status: 'pending' as const, date: 'Feb 1, 2026' },
    { id: 'br-3', title: 'Conference Travel — Faculty', amount: '$12,000', status: 'pending' as const, date: 'Feb 10, 2026' },
  ],
  staffingNeeds: [
    { role: 'Adjunct Instructor — Sports Marketing', status: 'searching' as const, priority: 'high' },
    { role: 'Lab Assistant — Analytics', status: 'filled' as const, priority: 'low' },
    { role: 'Administrative Coordinator', status: 'filled' as const, priority: 'low' },
  ],
};

const EQUIPMENT_STATUS_COLORS: Record<string, string> = {
  operational: '#5A8A6E',
  maintenance: '#B8943E',
  broken: '#B85C5C',
};

const BUDGET_REQUEST_STATUS_COLORS: Record<string, string> = {
  approved: '#5A8A6E',
  pending: '#B8943E',
  denied: '#B85C5C',
};

const STAFFING_STATUS_COLORS: Record<string, string> = {
  filled: '#5A8A6E',
  searching: '#B8943E',
  urgent: '#B85C5C',
};

const MOCK_FINANCE = {
  budgetAllocated: '$1,250,000',
  budgetSpent: '$780,000',
  budgetRemaining: '$470,000',
  spendByCategory: [
    { category: 'Personnel', amount: '$520,000', percentage: 67, color: ACCENT },
    { category: 'Facilities', amount: '$95,000', percentage: 12, color: '#B8943E' },
    { category: 'Technology', amount: '$65,000', percentage: 8, color: '#5A8A6E' },
    { category: 'Scholarships', amount: '$60,000', percentage: 8, color: '#B85C5C' },
    { category: 'Operations', amount: '$25,000', percentage: 3, color: '#9C9790' },
    { category: 'Marketing', amount: '$15,000', percentage: 2, color: ACCENT },
  ],
  scholarshipFunds: {
    total: '$200,000',
    awarded: '$140,000',
    remaining: '$60,000',
    recipients: 8,
  },
  outstandingBalances: {
    total: '$42,500',
    students: 5,
    averageBalance: '$8,500',
  },
};

const MOCK_PAYMENT_RAILS = {
  activePlans: 28,
  currentPlans: 22,
  delinquentAccounts: 3,
  delinquentTotal: '$12,800',
  refundQueue: [
    { id: 'ref-1', student: 'Isabella Nguyen', amount: '$3,200', reason: 'Withdrawal — prorated refund', status: 'pending' as const, date: 'Feb 5, 2026' },
    { id: 'ref-2', student: 'Ethan Williams', amount: '$1,800', reason: 'Leave of absence — partial refund', status: 'processing' as const, date: 'Feb 10, 2026' },
  ],
  financialAid: {
    totalAwarded: '$450,000',
    federalAid: '$280,000',
    institutionalAid: '$120,000',
    externalScholarships: '$50,000',
    studentsReceiving: 35,
    averagePackage: '$12,857',
  },
};

const REFUND_STATUS_COLORS: Record<string, string> = {
  pending: '#B8943E',
  processing: ACCENT,
  completed: '#5A8A6E',
  denied: '#B85C5C',
};

const MOCK_COMPLIANCE = {
  accreditation: {
    body: 'COSMA',
    status: 'compliant' as const,
    requirements: [
      { id: 'acc-1', requirement: 'Curriculum Standards', status: 'compliant' as const, lastAudit: 'Sep 2024' },
      { id: 'acc-2', requirement: 'Faculty Qualifications', status: 'compliant' as const, lastAudit: 'Sep 2024' },
      { id: 'acc-3', requirement: 'Student Learning Outcomes', status: 'compliant' as const, lastAudit: 'Sep 2024' },
      { id: 'acc-4', requirement: 'Program Assessment Plan', status: 'under_review' as const, lastAudit: 'Jan 2026' },
    ],
  },
  ferpa: {
    status: 'compliant' as const,
    lastTraining: 'Aug 2025',
    nextTraining: 'Aug 2026',
    incidents: 0,
  },
  titleIX: {
    status: 'compliant' as const,
    coordinatorTrained: true,
    reportingUpToDate: true,
  },
  auditItems: [
    { id: 'aud-1', title: 'Annual Program Assessment Report', dueDate: 'Jun 30, 2026', status: 'in_progress' as const },
    { id: 'aud-2', title: 'Student Outcomes Data Submission', dueDate: 'May 15, 2026', status: 'not_started' as const },
    { id: 'aud-3', title: 'Faculty Credential Verification', dueDate: 'Aug 1, 2026', status: 'not_started' as const },
    { id: 'aud-4', title: 'Budget Reconciliation', dueDate: 'Jul 15, 2026', status: 'not_started' as const },
  ],
};

const AUDIT_STATUS_COLORS: Record<string, string> = {
  in_progress: ACCENT,
  not_started: '#9C9790',
  completed: '#5A8A6E',
  overdue: '#B85C5C',
};

const MOCK_REPORTS = {
  enrollmentTrends: [
    { term: 'Fall 2023', enrolled: 38, new: 15, graduated: 8 },
    { term: 'Spring 2024', enrolled: 35, new: 5, graduated: 0 },
    { term: 'Fall 2024', enrolled: 42, new: 18, graduated: 10 },
    { term: 'Spring 2025', enrolled: 40, new: 6, graduated: 0 },
    { term: 'Fall 2025', enrolled: 48, new: 20, graduated: 12 },
    { term: 'Spring 2026', enrolled: 45, new: 8, graduated: 0 },
  ],
  retentionMetrics: {
    firstToSecondYear: 88,
    overallRetention: 82,
    attritionRate: 18,
  },
  gradeDistributions: {
    programGPA: 3.15,
    averageByYear: [
      { year: 'Freshman', gpa: 2.85 },
      { year: 'Sophomore', gpa: 3.05 },
      { year: 'Junior', gpa: 3.25 },
      { year: 'Senior', gpa: 3.45 },
    ],
  },
  graduationRates: {
    fourYear: 65,
    fiveYear: 82,
    sixYear: 88,
    totalGraduates: 142,
    averageTimeToGraduation: '4.3 years',
  },
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function UniversalProgramSheet({
  program,
  roleLens,
  onClose,
  onSelectStudent,
  onSelectCourse,
}: UniversalProgramSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const tabs = useMemo(() => getProgramSheetTabs(roleLens), [roleLens]);
  const [activeTab, setActiveTab] = useState<ProgramTab>(tabs[0]?.id ?? 'overview');

  const fullAccess = isFullAccess(roleLens);
  const programDir = isProgramDirector(roleLens);
  const gradesVisible = canViewGrades(roleLens);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <ProgramHeader
        program={program}
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
        {activeTab === 'overview' && <OverviewTab colors={colors} program={program} />}
        {activeTab === 'people' && <PeopleTab colors={colors} />}
        {activeTab === 'courses' && <CoursesTab colors={colors} onSelectCourse={onSelectCourse} />}
        {activeTab === 'students' && (
          <StudentsTab colors={colors} roleLens={roleLens} gradesVisible={gradesVisible} onSelectStudent={onSelectStudent} />
        )}
        {activeTab === 'calendar' && <CalendarTab colors={colors} />}
        {activeTab === 'operations' && <OperationsTab colors={colors} />}
        {activeTab === 'finance' && <FinanceTab colors={colors} roleLens={roleLens} />}
        {activeTab === 'payment_rails' && <PaymentRailsTab colors={colors} roleLens={roleLens} />}
        {activeTab === 'compliance' && <ComplianceTab colors={colors} roleLens={roleLens} />}
        {activeTab === 'reports' && <ReportsTab colors={colors} />}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// HEADER
// =============================================================================

function ProgramHeader({
  program,
  roleLens,
  colors,
  fullAccess,
  programDir,
  onClose,
}: {
  program: Program;
  roleLens: EducationRoleLens;
  colors: typeof Colors.light;
  fullAccess: boolean;
  programDir: boolean;
  onClose: () => void;
}) {
  const enrolledCount = MOCK_STUDENT_ROSTER.filter((s) => s.status === 'enrolled').length;
  const atRiskCount = MOCK_STUDENT_ROSTER.filter((s) => s.riskLevel === 'high').length;

  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      {/* Top row: name + close */}
      <View style={styles.headerTopRow}>
        <View style={{ flex: 1 }}>
          <ThemedText style={[styles.programName, { color: colors.text }]}>
            {program.name}
          </ThemedText>
        </View>
        <Pressable onPress={onClose} hitSlop={12}>
          <IconSymbol name="xmark" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Pills: level + status */}
      <View style={styles.pillRow}>
        <View
          style={[
            styles.levelPill,
            { backgroundColor: (LEVEL_COLORS[program.level] ?? '#9C9790') + '1A' },
          ]}
        >
          <ThemedText
            style={[
              styles.levelPillText,
              { color: LEVEL_COLORS[program.level] ?? '#9C9790' },
            ]}
          >
            {program.level.charAt(0).toUpperCase() + program.level.slice(1)}
          </ThemedText>
        </View>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: (PROGRAM_STATUS_COLORS[program.status] ?? '#9C9790') + '1A' },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: PROGRAM_STATUS_COLORS[program.status] ?? '#9C9790' },
            ]}
          />
          <ThemedText
            style={[
              styles.statusPillText,
              { color: PROGRAM_STATUS_COLORS[program.status] ?? '#9C9790' },
            ]}
          >
            {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
          </ThemedText>
        </View>
      </View>

      {/* KPIs (gated) */}
      {(fullAccess || programDir) && (
        <View style={styles.quickChipRow}>
          <View style={[styles.quickChip, { backgroundColor: ACCENT + '22' }]}>
            <IconSymbol name="person.2.fill" size={12} color={ACCENT} />
            <ThemedText style={[styles.quickChipText, { color: ACCENT }]}>
              {enrolledCount} Enrolled
            </ThemedText>
          </View>
          {atRiskCount > 0 && (
            <View style={[styles.quickChip, { backgroundColor: '#B85C5C22' }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#B85C5C" />
              <ThemedText style={[styles.quickChipText, { color: '#B85C5C' }]}>
                {atRiskCount} At Risk
              </ThemedText>
            </View>
          )}
          <View style={[styles.quickChip, { backgroundColor: '#5A8A6E22' }]}>
            <IconSymbol name="book.fill" size={12} color="#5A8A6E" />
            <ThemedText style={[styles.quickChipText, { color: '#5A8A6E' }]}>
              {program.creditsRequired} Credits Req
            </ThemedText>
          </View>
        </View>
      )}

      {/* Action icons */}
      <View style={styles.actionRow}>
        {fullAccess && (
          <ActionIcon icon="plus.rectangle.fill" label="Create Course" colors={colors} />
        )}
        {(fullAccess || programDir) && (
          <ActionIcon icon="bubble.left.fill" label="Msg Staff" colors={colors} />
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
  colors,
  program,
}: {
  colors: typeof Colors.light;
  program: Program;
}) {
  return (
    <View>
      {/* Program Description */}
      <SectionCard title="Program Description" colors={colors}>
        <ThemedText style={[styles.bodyText, { color: colors.text }]}>
          {MOCK_PROGRAM_DESCRIPTION}
        </ThemedText>
      </SectionCard>

      {/* Mission */}
      <SectionCard title="Mission" colors={colors}>
        <ThemedText style={[styles.bodyText, { color: colors.text, fontStyle: 'italic' }]}>
          {MOCK_MISSION}
        </ThemedText>
      </SectionCard>

      {/* Accreditation */}
      <SectionCard title="Accreditation" colors={colors}>
        <InfoRow label="Body" value={MOCK_ACCREDITATION.body} colors={colors} />
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>Status</ThemedText>
          <View style={[styles.accreditationBadge, { backgroundColor: (ACCREDITATION_STATUS_COLORS[MOCK_ACCREDITATION.status] ?? '#9C9790') + '22' }]}>
            <ThemedText style={[styles.accreditationText, { color: ACCREDITATION_STATUS_COLORS[MOCK_ACCREDITATION.status] ?? '#9C9790' }]}>
              {MOCK_ACCREDITATION.status.toUpperCase()}
            </ThemedText>
          </View>
        </View>
        <InfoRow label="Last Review" value={MOCK_ACCREDITATION.lastReview} colors={colors} />
        <InfoRow label="Next Review" value={MOCK_ACCREDITATION.nextReview} colors={colors} />
        <ThemedText style={[styles.captionText, { color: colors.textTertiary, marginTop: Spacing.xs }]}>
          {MOCK_ACCREDITATION.notes}
        </ThemedText>
      </SectionCard>

      {/* Key Dates */}
      <SectionCard title="Key Dates" colors={colors}>
        {MOCK_KEY_DATES.map((kd) => (
          <View
            key={kd.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View
              style={[
                styles.calendarStatusBar,
                { backgroundColor: DATE_STATUS_COLORS[kd.status] ?? '#9C9790' },
              ]}
            />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {kd.event}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {kd.date}
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.statusLabel,
                { color: DATE_STATUS_COLORS[kd.status] ?? '#9C9790' },
              ]}
            >
              {kd.status.toUpperCase()}
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      {/* Contact Info */}
      <SectionCard title="Contact" colors={colors}>
        <InfoRow label="Director" value={MOCK_CONTACT_INFO.director} colors={colors} />
        <InfoRow label="Email" value={MOCK_CONTACT_INFO.email} colors={colors} />
        <InfoRow label="Phone" value={MOCK_CONTACT_INFO.phone} colors={colors} />
        <InfoRow label="Office" value={MOCK_CONTACT_INFO.office} colors={colors} />
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TAB 2: PEOPLE
// =============================================================================

function PeopleTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <View>
      {/* Faculty */}
      <SectionCard title="Faculty" colors={colors}>
        {MOCK_FACULTY.map((person) => (
          <Pressable
            key={person.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View style={[styles.personAvatar, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[styles.personInitials, { color: colors.textSecondary }]}>
                {person.name.split(' ').map((n) => n[0]).join('')}
              </ThemedText>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {person.name}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {person.role} · {person.specialization}
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </Pressable>
        ))}
      </SectionCard>

      {/* Staff + Advisors */}
      <SectionCard title="Staff + Advisors" colors={colors}>
        {MOCK_STAFF.map((person) => (
          <Pressable
            key={person.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View style={[styles.personAvatar, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[styles.personInitials, { color: colors.textSecondary }]}>
                {person.name.split(' ').map((n) => n[0]).join('')}
              </ThemedText>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {person.name}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {person.role} · {person.department}
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </Pressable>
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
  onSelectCourse,
}: {
  colors: typeof Colors.light;
  onSelectCourse?: (courseId: string) => void;
}) {
  return (
    <View>
      {/* Active Courses */}
      <SectionCard title="Active Courses" colors={colors}>
        {MOCK_ACTIVE_COURSES.map((course) => (
          <Pressable
            key={course.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
            onPress={() => onSelectCourse?.(course.id)}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {course.code} — {course.name}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {course.instructor} · {course.enrolled}/{course.capacity} enrolled
              </ThemedText>
            </View>
            <View style={[styles.enrollmentBadge, { backgroundColor: course.enrolled >= course.capacity * 0.9 ? '#B8943E22' : '#5A8A6E22' }]}>
              <ThemedText style={[styles.enrollmentText, { color: course.enrolled >= course.capacity * 0.9 ? '#B8943E' : '#5A8A6E' }]}>
                {Math.round((course.enrolled / course.capacity) * 100)}%
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </Pressable>
        ))}
      </SectionCard>

      {/* Completed Courses */}
      <SectionCard title="Completed Courses" colors={colors}>
        {MOCK_COMPLETED_COURSES.map((course) => (
          <Pressable
            key={course.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
            onPress={() => onSelectCourse?.(course.id)}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {course.code} — {course.name}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {course.instructor} · {course.term} · Avg: {course.avgGrade}
              </ThemedText>
            </View>
            <IconSymbol name="checkmark.circle.fill" size={16} color="#5A8A6E" />
          </Pressable>
        ))}
      </SectionCard>

      {/* Planned Courses */}
      <SectionCard title="Planned Courses" colors={colors}>
        {MOCK_PLANNED_COURSES.map((course) => (
          <View
            key={course.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {course.code} — {course.name}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {course.term}
              </ThemedText>
            </View>
            <ThemedText style={[styles.statusLabel, { color: ACCENT }]}>
              PLANNED
            </ThemedText>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TAB 4: STUDENTS (ED1/ED3 only)
// =============================================================================

function StudentsTab({
  colors,
  roleLens,
  gradesVisible,
  onSelectStudent,
}: {
  colors: typeof Colors.light;
  roleLens: EducationRoleLens;
  gradesVisible: boolean;
  onSelectStudent?: (studentId: string) => void;
}) {
  const [filter, setFilter] = useState<'all' | 'enrolled' | 'at_risk' | 'on_hold'>('all');

  const filteredStudents = useMemo(() => {
    switch (filter) {
      case 'enrolled':
        return MOCK_STUDENT_ROSTER.filter((s) => s.status === 'enrolled');
      case 'at_risk':
        return MOCK_STUDENT_ROSTER.filter((s) => s.riskLevel === 'high');
      case 'on_hold':
        return MOCK_STUDENT_ROSTER.filter((s) => s.holds.length > 0);
      default:
        return MOCK_STUDENT_ROSTER;
    }
  }, [filter]);

  const enrolledCount = MOCK_STUDENT_ROSTER.filter((s) => s.status === 'enrolled').length;
  const atRiskCount = MOCK_STUDENT_ROSTER.filter((s) => s.riskLevel === 'high').length;
  const onHoldCount = MOCK_STUDENT_ROSTER.filter((s) => s.holds.length > 0).length;

  return (
    <View>
      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipRow}
      >
        {[
          { key: 'all' as const, label: `All (${MOCK_STUDENT_ROSTER.length})` },
          { key: 'enrolled' as const, label: `Enrolled (${enrolledCount})` },
          { key: 'at_risk' as const, label: `At Risk (${atRiskCount})` },
          { key: 'on_hold' as const, label: `On Hold (${onHoldCount})` },
        ].map((chip) => (
          <Pressable
            key={chip.key}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === chip.key ? '#FFFFFF' : colors.card,
                borderColor: filter === chip.key ? '#FFFFFF' : colors.border,
              },
            ]}
            onPress={() => setFilter(chip.key)}
          >
            <ThemedText
              style={[
                styles.filterChipText,
                { color: filter === chip.key ? '#000000' : colors.textSecondary },
              ]}
            >
              {chip.label}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {/* Student Roster */}
      <SectionCard title={`Students (${filteredStudents.length})`} colors={colors}>
        {filteredStudents.map((student) => (
          <Pressable
            key={student.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
            onPress={() => onSelectStudent?.(student.studentId)}
          >
            <View style={[styles.personAvatar, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[styles.personInitials, { color: colors.textSecondary }]}>
                {student.name.split(' ').map((n) => n[0]).join('')}
              </ThemedText>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {student.name}
                </ThemedText>
                {student.holds.length > 0 && (
                  <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#B85C5C" />
                )}
              </View>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                {gradesVisible ? ` · GPA: ${student.gpa.toFixed(2)}` : ''}
                {student.holds.length > 0 ? ` · ${student.holds.length} hold${student.holds.length > 1 ? 's' : ''}` : ''}
              </ThemedText>
            </View>
            <View style={styles.riskAndChevron}>
              {student.riskLevel !== 'low' && (
                <View
                  style={[
                    styles.riskBadge,
                    { backgroundColor: (RISK_COLORS[student.riskLevel] ?? '#9C9790') + '22' },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.riskText,
                      { color: RISK_COLORS[student.riskLevel] ?? '#9C9790' },
                    ]}
                  >
                    {student.riskLevel.toUpperCase()}
                  </ThemedText>
                </View>
              )}
              <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
            </View>
          </Pressable>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TAB 5: CALENDAR
// =============================================================================

function CalendarTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <View>
      <SectionCard title="Academic Calendar" colors={colors}>
        {MOCK_CALENDAR.map((event) => (
          <View
            key={event.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View
              style={[
                styles.calendarStatusBar,
                { backgroundColor: CALENDAR_TYPE_COLORS[event.type] ?? '#9C9790' },
              ]}
            />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {event.event}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {event.date}
              </ThemedText>
            </View>
            <View
              style={[
                styles.calendarTypeBadge,
                { backgroundColor: (CALENDAR_TYPE_COLORS[event.type] ?? '#9C9790') + '22' },
              ]}
            >
              <ThemedText
                style={[
                  styles.calendarTypeText,
                  { color: CALENDAR_TYPE_COLORS[event.type] ?? '#9C9790' },
                ]}
              >
                {event.type.toUpperCase()}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TAB 6: OPERATIONS (ED1/ED3 only)
// =============================================================================

function OperationsTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <View>
      {/* Room / Facility Assignments */}
      <SectionCard title="Room Assignments" colors={colors}>
        {MOCK_OPERATIONS.rooms.map((room) => (
          <View
            key={room.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <IconSymbol name="mappin.and.ellipse" size={16} color={colors.textSecondary} />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {room.name} — {room.type}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                Capacity: {room.capacity} · Assigned to: {room.assigned}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>

      {/* Equipment */}
      <SectionCard title="Equipment" colors={colors}>
        {MOCK_OPERATIONS.equipment.map((eq, index) => (
          <View
            key={index}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {eq.item}
              </ThemedText>
            </View>
            <View
              style={[
                styles.equipmentBadge,
                { backgroundColor: (EQUIPMENT_STATUS_COLORS[eq.status] ?? '#9C9790') + '22' },
              ]}
            >
              <ThemedText
                style={[
                  styles.equipmentText,
                  { color: EQUIPMENT_STATUS_COLORS[eq.status] ?? '#9C9790' },
                ]}
              >
                {eq.status.toUpperCase()}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>

      {/* Budget Requests */}
      <SectionCard title="Budget Requests" colors={colors}>
        {MOCK_OPERATIONS.budgetRequests.map((req) => (
          <View
            key={req.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {req.title}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {req.amount} · Submitted: {req.date}
              </ThemedText>
            </View>
            <View
              style={[
                styles.budgetReqBadge,
                { backgroundColor: (BUDGET_REQUEST_STATUS_COLORS[req.status] ?? '#9C9790') + '22' },
              ]}
            >
              <ThemedText
                style={[
                  styles.budgetReqText,
                  { color: BUDGET_REQUEST_STATUS_COLORS[req.status] ?? '#9C9790' },
                ]}
              >
                {req.status.toUpperCase()}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>

      {/* Staffing */}
      <SectionCard title="Staffing" colors={colors}>
        {MOCK_OPERATIONS.staffingNeeds.map((need, index) => (
          <View
            key={index}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {need.role}
              </ThemedText>
            </View>
            <View
              style={[
                styles.staffingBadge,
                { backgroundColor: (STAFFING_STATUS_COLORS[need.status] ?? '#9C9790') + '22' },
              ]}
            >
              <ThemedText
                style={[
                  styles.staffingText,
                  { color: STAFFING_STATUS_COLORS[need.status] ?? '#9C9790' },
                ]}
              >
                {need.status.toUpperCase()}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TAB 7: FINANCE (ED1 summary / ED3 full)
// =============================================================================

function FinanceTab({
  colors,
  roleLens,
}: {
  colors: typeof Colors.light;
  roleLens: EducationRoleLens;
}) {
  const isDetailedView = roleLens === 'ED3';

  return (
    <View>
      {/* Budget Overview */}
      <SectionCard title="Budget Overview" colors={colors}>
        <View style={styles.financeGrid}>
          <FinanceCard
            label="Allocated"
            value={MOCK_FINANCE.budgetAllocated}
            subtitle="FY 2025-26"
            color={ACCENT}
            colors={colors}
          />
          <FinanceCard
            label="Spent"
            value={MOCK_FINANCE.budgetSpent}
            subtitle={`${Math.round(780000 / 1250000 * 100)}% utilized`}
            color="#B8943E"
            colors={colors}
          />
        </View>
        <View style={[styles.remainingHighlight, { backgroundColor: '#5A8A6E22', borderColor: '#5A8A6E33' }]}>
          <ThemedText style={[styles.remainingLabel, { color: '#5A8A6E' }]}>Remaining</ThemedText>
          <ThemedText style={[styles.remainingValue, { color: '#5A8A6E' }]}>{MOCK_FINANCE.budgetRemaining}</ThemedText>
        </View>
      </SectionCard>

      {/* Spend by Category */}
      <SectionCard title="Spend by Category" colors={colors}>
        {MOCK_FINANCE.spendByCategory.map((cat, index) => (
          <View
            key={index}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {cat.category}
              </ThemedText>
            </View>
            <ThemedText style={[styles.categoryAmount, { color: colors.text }]}>
              {cat.amount}
            </ThemedText>
            <ThemedText style={[styles.categoryPercent, { color: colors.textSecondary }]}>
              {cat.percentage}%
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      {/* Scholarship Funds */}
      <SectionCard title="Scholarship Funds" colors={colors}>
        <View style={styles.statRow}>
          <StatBlock label="Total" value={MOCK_FINANCE.scholarshipFunds.total} color={ACCENT} colors={colors} />
          <StatBlock label="Awarded" value={MOCK_FINANCE.scholarshipFunds.awarded} color="#5A8A6E" colors={colors} />
          <StatBlock label="Remaining" value={MOCK_FINANCE.scholarshipFunds.remaining} color="#B8943E" colors={colors} />
        </View>
        <ThemedText style={[styles.captionText, { color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.xs }]}>
          {MOCK_FINANCE.scholarshipFunds.recipients} scholarship recipients this academic year
        </ThemedText>
      </SectionCard>

      {/* Outstanding Balances */}
      {isDetailedView && (
        <SectionCard title="Outstanding Student Balances" colors={colors}>
          <View style={styles.statRow}>
            <StatBlock label="Total Owed" value={MOCK_FINANCE.outstandingBalances.total} color="#B85C5C" colors={colors} />
            <StatBlock label="Students" value={String(MOCK_FINANCE.outstandingBalances.students)} color="#B8943E" colors={colors} />
            <StatBlock label="Avg Balance" value={MOCK_FINANCE.outstandingBalances.averageBalance} color="#B85C5C" colors={colors} />
          </View>
        </SectionCard>
      )}
    </View>
  );
}

// =============================================================================
// TAB 8: PAYMENT RAILS (ED1 summary / ED3 full)
// =============================================================================

function PaymentRailsTab({
  colors,
  roleLens,
}: {
  colors: typeof Colors.light;
  roleLens: EducationRoleLens;
}) {
  const isDetailedView = roleLens === 'ED3';

  return (
    <View>
      {/* Payment Plans Overview */}
      <SectionCard title="Payment Plans Overview" colors={colors}>
        <View style={styles.statRow}>
          <StatBlock label="Active Plans" value={String(MOCK_PAYMENT_RAILS.activePlans)} color={ACCENT} colors={colors} />
          <StatBlock label="Current" value={String(MOCK_PAYMENT_RAILS.currentPlans)} color="#5A8A6E" colors={colors} />
          <StatBlock label="Delinquent" value={String(MOCK_PAYMENT_RAILS.delinquentAccounts)} color="#B85C5C" colors={colors} />
        </View>
      </SectionCard>

      {/* Delinquent Accounts */}
      <SectionCard title="Delinquent Accounts" colors={colors}>
        <View style={[styles.delinquentHighlight, { backgroundColor: '#B85C5C22', borderColor: '#B85C5C33' }]}>
          <ThemedText style={[styles.delinquentLabel, { color: '#B85C5C' }]}>Total Delinquent</ThemedText>
          <ThemedText style={[styles.delinquentValue, { color: '#B85C5C' }]}>{MOCK_PAYMENT_RAILS.delinquentTotal}</ThemedText>
          <ThemedText style={[styles.captionText, { color: '#B85C5C' }]}>
            {MOCK_PAYMENT_RAILS.delinquentAccounts} accounts require follow-up
          </ThemedText>
        </View>
      </SectionCard>

      {/* Refund Queue */}
      {isDetailedView && (
        <SectionCard title="Refund Queue" colors={colors}>
          {MOCK_PAYMENT_RAILS.refundQueue.length === 0 ? (
            <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
              No pending refunds
            </ThemedText>
          ) : (
            MOCK_PAYMENT_RAILS.refundQueue.map((refund) => (
              <View
                key={refund.id}
                style={[styles.listRow, { borderBottomColor: colors.border }]}
              >
                <View
                  style={[
                    styles.refundStatusBadge,
                    { backgroundColor: (REFUND_STATUS_COLORS[refund.status] ?? '#9C9790') + '22' },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.refundStatusText,
                      { color: REFUND_STATUS_COLORS[refund.status] ?? '#9C9790' },
                    ]}
                  >
                    {refund.status.toUpperCase()}
                  </ThemedText>
                </View>
                <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                  <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                    {refund.student} — {refund.amount}
                  </ThemedText>
                  <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                    {refund.reason} · {refund.date}
                  </ThemedText>
                </View>
              </View>
            ))
          )}
        </SectionCard>
      )}

      {/* Financial Aid Status */}
      <SectionCard title="Financial Aid Summary" colors={colors}>
        <View style={styles.statRow}>
          <StatBlock label="Total Awarded" value={MOCK_PAYMENT_RAILS.financialAid.totalAwarded} color="#5A8A6E" colors={colors} />
          <StatBlock label="Recipients" value={String(MOCK_PAYMENT_RAILS.financialAid.studentsReceiving)} color={ACCENT} colors={colors} />
        </View>
        {isDetailedView && (
          <View style={{ marginTop: Spacing.sm }}>
            <InfoRow label="Federal Aid" value={MOCK_PAYMENT_RAILS.financialAid.federalAid} colors={colors} />
            <InfoRow label="Institutional" value={MOCK_PAYMENT_RAILS.financialAid.institutionalAid} colors={colors} />
            <InfoRow label="External" value={MOCK_PAYMENT_RAILS.financialAid.externalScholarships} colors={colors} />
            <InfoRow label="Avg Package" value={MOCK_PAYMENT_RAILS.financialAid.averagePackage} colors={colors} />
          </View>
        )}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TAB 9: COMPLIANCE (ED1 limited / ED3 full)
// =============================================================================

function ComplianceTab({
  colors,
  roleLens,
}: {
  colors: typeof Colors.light;
  roleLens: EducationRoleLens;
}) {
  const isDetailedView = roleLens === 'ED3';

  return (
    <View>
      {/* Accreditation Requirements */}
      <SectionCard title="Accreditation Requirements" colors={colors}>
        {MOCK_COMPLIANCE.accreditation.requirements.map((req) => (
          <View
            key={req.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <IconSymbol
              name={req.status === 'compliant' ? 'checkmark.shield.fill' : 'shield.fill'}
              size={16}
              color={COMPLIANCE_STATUS_COLORS[req.status] ?? '#9C9790'}
            />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {req.requirement}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                Last audit: {req.lastAudit}
              </ThemedText>
            </View>
            <View
              style={[
                styles.complianceBadge,
                { backgroundColor: (COMPLIANCE_STATUS_COLORS[req.status] ?? '#9C9790') + '22' },
              ]}
            >
              <ThemedText
                style={[
                  styles.complianceText,
                  { color: COMPLIANCE_STATUS_COLORS[req.status] ?? '#9C9790' },
                ]}
              >
                {req.status.replace('_', ' ').toUpperCase()}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>

      {/* FERPA */}
      <SectionCard title="FERPA Compliance" colors={colors}>
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>Status</ThemedText>
          <View style={[styles.complianceBadge, { backgroundColor: (COMPLIANCE_STATUS_COLORS[MOCK_COMPLIANCE.ferpa.status] ?? '#9C9790') + '22' }]}>
            <ThemedText style={[styles.complianceText, { color: COMPLIANCE_STATUS_COLORS[MOCK_COMPLIANCE.ferpa.status] ?? '#9C9790' }]}>
              {MOCK_COMPLIANCE.ferpa.status.toUpperCase()}
            </ThemedText>
          </View>
        </View>
        <InfoRow label="Last Training" value={MOCK_COMPLIANCE.ferpa.lastTraining} colors={colors} />
        <InfoRow label="Next Training" value={MOCK_COMPLIANCE.ferpa.nextTraining} colors={colors} />
        <InfoRow label="Incidents" value={String(MOCK_COMPLIANCE.ferpa.incidents)} colors={colors} />
      </SectionCard>

      {/* Title IX */}
      <SectionCard title="Title IX" colors={colors}>
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>Status</ThemedText>
          <View style={[styles.complianceBadge, { backgroundColor: (COMPLIANCE_STATUS_COLORS[MOCK_COMPLIANCE.titleIX.status] ?? '#9C9790') + '22' }]}>
            <ThemedText style={[styles.complianceText, { color: COMPLIANCE_STATUS_COLORS[MOCK_COMPLIANCE.titleIX.status] ?? '#9C9790' }]}>
              {MOCK_COMPLIANCE.titleIX.status.toUpperCase()}
            </ThemedText>
          </View>
        </View>
        <InfoRow label="Coordinator Trained" value={MOCK_COMPLIANCE.titleIX.coordinatorTrained ? 'Yes' : 'No'} colors={colors} />
        <InfoRow label="Reporting Up-to-Date" value={MOCK_COMPLIANCE.titleIX.reportingUpToDate ? 'Yes' : 'No'} colors={colors} />
      </SectionCard>

      {/* Audit Items */}
      {isDetailedView && (
        <SectionCard title="Audit Items" colors={colors}>
          {MOCK_COMPLIANCE.auditItems.map((item) => (
            <View
              key={item.id}
              style={[styles.listRow, { borderBottomColor: colors.border }]}
            >
              <View
                style={[
                  styles.auditDot,
                  { backgroundColor: AUDIT_STATUS_COLORS[item.status] ?? '#9C9790' },
                ]}
              />
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {item.title}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  Due: {item.dueDate}
                </ThemedText>
              </View>
              <ThemedText
                style={[
                  styles.statusLabel,
                  { color: AUDIT_STATUS_COLORS[item.status] ?? '#9C9790' },
                ]}
              >
                {item.status.replace('_', ' ').toUpperCase()}
              </ThemedText>
            </View>
          ))}
        </SectionCard>
      )}
    </View>
  );
}

// =============================================================================
// TAB 10: REPORTS (ED1/ED3 only)
// =============================================================================

function ReportsTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <View>
      {/* Enrollment Trends */}
      <SectionCard title="Enrollment Trends" colors={colors}>
        <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
          <ThemedText style={[styles.tableHeaderCell, styles.termCol, { color: colors.textTertiary }]}>Term</ThemedText>
          <ThemedText style={[styles.tableHeaderCell, styles.numColSm, { color: colors.textTertiary }]}>Enrolled</ThemedText>
          <ThemedText style={[styles.tableHeaderCell, styles.numColSm, { color: colors.textTertiary }]}>New</ThemedText>
          <ThemedText style={[styles.tableHeaderCell, styles.numColSm, { color: colors.textTertiary }]}>Grad</ThemedText>
        </View>
        {MOCK_REPORTS.enrollmentTrends.map((term, index) => (
          <View
            key={index}
            style={[styles.tableRow, { borderBottomColor: colors.border }]}
          >
            <ThemedText style={[styles.tableCell, styles.termCol, { color: colors.text }]}>
              {term.term}
            </ThemedText>
            <ThemedText style={[styles.tableCell, styles.numColSm, { color: colors.text, fontWeight: '600' }]}>
              {term.enrolled}
            </ThemedText>
            <ThemedText style={[styles.tableCell, styles.numColSm, { color: '#5A8A6E' }]}>
              +{term.new}
            </ThemedText>
            <ThemedText style={[styles.tableCell, styles.numColSm, { color: colors.textSecondary }]}>
              {term.graduated}
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      {/* Retention Metrics */}
      <SectionCard title="Retention Metrics" colors={colors}>
        <View style={styles.statRow}>
          <StatBlock label="1st → 2nd Year" value={`${MOCK_REPORTS.retentionMetrics.firstToSecondYear}%`} color="#5A8A6E" colors={colors} />
          <StatBlock label="Overall" value={`${MOCK_REPORTS.retentionMetrics.overallRetention}%`} color={ACCENT} colors={colors} />
          <StatBlock label="Attrition" value={`${MOCK_REPORTS.retentionMetrics.attritionRate}%`} color="#B85C5C" colors={colors} />
        </View>
      </SectionCard>

      {/* Grade Distributions */}
      <SectionCard title="Grade Distributions" colors={colors}>
        <View style={[styles.gpaHighlight, { backgroundColor: ACCENT + '22', borderColor: ACCENT + '33' }]}>
          <ThemedText style={[styles.gpaLabel, { color: ACCENT }]}>Program Average GPA</ThemedText>
          <ThemedText style={[styles.gpaValue, { color: ACCENT }]}>{MOCK_REPORTS.gradeDistributions.programGPA.toFixed(2)}</ThemedText>
        </View>
        {MOCK_REPORTS.gradeDistributions.averageByYear.map((year, index) => (
          <View
            key={index}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <ThemedText style={[styles.bodyText, { color: colors.text, flex: 1 }]}>
              {year.year}
            </ThemedText>
            <ThemedText style={[styles.gpaInline, { color: year.gpa >= 3.0 ? '#5A8A6E' : '#B8943E' }]}>
              {year.gpa.toFixed(2)}
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      {/* Graduation Rates */}
      <SectionCard title="Graduation Rates" colors={colors}>
        <View style={styles.statRow}>
          <StatBlock label="4-Year" value={`${MOCK_REPORTS.graduationRates.fourYear}%`} color="#5A8A6E" colors={colors} />
          <StatBlock label="5-Year" value={`${MOCK_REPORTS.graduationRates.fiveYear}%`} color={ACCENT} colors={colors} />
          <StatBlock label="6-Year" value={`${MOCK_REPORTS.graduationRates.sixYear}%`} color="#B8943E" colors={colors} />
        </View>
        <ThemedText style={[styles.captionText, { color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm }]}>
          {MOCK_REPORTS.graduationRates.totalGraduates} total graduates · Avg time: {MOCK_REPORTS.graduationRates.averageTimeToGraduation}
        </ThemedText>
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
  programName: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  levelPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  levelPillText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    width: 110,
  },
  infoValue: {
    fontSize: 13,
    flex: 1,
  },

  // Calendar
  calendarStatusBar: {
    width: 3,
    height: 32,
    borderRadius: 2,
  },
  calendarTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  calendarTypeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Accreditation
  accreditationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  accreditationText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // People
  personAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personInitials: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Courses
  enrollmentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.xs,
  },
  enrollmentText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Students
  filterChipRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  riskAndChevron: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  riskBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  riskText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Operations
  equipmentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  equipmentText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  budgetReqBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  budgetReqText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  staffingBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  staffingText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Finance
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
  remainingHighlight: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  remainingLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  remainingValue: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 2,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryAmount: {
    fontSize: 13,
    fontWeight: '600',
    width: 80,
    textAlign: 'right',
  },
  categoryPercent: {
    fontSize: 12,
    width: 36,
    textAlign: 'right',
  },

  // Payment Rails
  delinquentHighlight: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  delinquentLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  delinquentValue: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 2,
  },
  refundStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    minWidth: 70,
    alignItems: 'center',
  },
  refundStatusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Compliance
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
  auditDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Reports
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
  termCol: {
    flex: 1,
  },
  numColSm: {
    width: 56,
    textAlign: 'right',
  },
  gpaHighlight: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  gpaLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gpaValue: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 2,
  },
  gpaInline: {
    fontSize: 16,
    fontWeight: '700',
  },
});
