/**
 * Education Academics — 5-view tabbed academic hub.
 * Views: Overview | Courses | Students | Advising | Risk & Interventions
 * RBAC:
 *   E0–E5 — All views, full data (System Owner → Dean)
 *   E6–E7 — All views, limited financial data (Dept Chair / Faculty)
 *   E8–E11 — Overview + Courses only (Advisor / Admissions / FinAid / Student)
 *   E12–E13 — Overview only (Alumni / Board)
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';
import type { EducationRoleLens } from '@/utils/education-rbac';
import {
  isPresident,
  isDeanLevel,
  isFacultyLevel,
  isStudent,
  isEnrolled,
} from '@/utils/education-rbac';

const ACCENT = MODE_ACCENT.education;

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  role?: EducationRoleLens;
  onSwitchTab?: (index: number) => void;
}

type AcademicView = 'overview' | 'courses' | 'students' | 'advising' | 'risk';

interface ViewOption {
  id: AcademicView;
  label: string;
}

// =============================================================================
// VIEW CONFIG — RBAC-filtered
// =============================================================================

const ALL_VIEWS: ViewOption[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'courses', label: 'Courses' },
  { id: 'students', label: 'Students' },
  { id: 'advising', label: 'Advising' },
  { id: 'risk', label: 'Risk' },
];

function getVisibleViews(role: EducationRoleLens): ViewOption[] {
  // External roles (Alumni / Board) — overview only
  if (!isEnrolled(role)) return ALL_VIEWS.filter((v) => v.id === 'overview');
  // Student / Advisor / Admissions / FinAid — overview + courses
  if (isStudent(role) || !isFacultyLevel(role)) return ALL_VIEWS.filter((v) => v.id === 'overview' || v.id === 'courses');
  // E0–E7 — all views
  return ALL_VIEWS;
}

// =============================================================================
// INLINE MOCK DATA — OVERVIEW
// =============================================================================

interface HealthTile {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaType: 'positive' | 'negative' | 'neutral';
  icon: string;
}

const HEALTH_TILES: HealthTile[] = [
  { id: 'ht-1', label: 'Total Enrollment', value: '12,847', delta: '+3.2%', deltaType: 'positive', icon: 'person.3.fill' },
  { id: 'ht-2', label: 'Avg. GPA', value: '3.24', delta: '+0.06', deltaType: 'positive', icon: 'chart.bar.fill' },
  { id: 'ht-3', label: 'Graduation Rate', value: '78.4%', delta: '+1.8%', deltaType: 'positive', icon: 'graduationcap.fill' },
  { id: 'ht-4', label: 'Retention Rate', value: '89.1%', delta: '-0.3%', deltaType: 'negative', icon: 'arrow.triangle.2.circlepath' },
];

interface DeptPerformance {
  id: string;
  name: string;
  abbreviation: string;
  avgGPA: number;
  enrolledStudents: number;
  facultyCount: number;
  courseCount: number;
  retentionRate: number;
  status: 'strong' | 'stable' | 'watch';
}

const DEPT_PERFORMANCE: DeptPerformance[] = [
  { id: 'dp-1', name: 'College of Engineering', abbreviation: 'COE', avgGPA: 3.18, enrolledStudents: 2840, facultyCount: 82, courseCount: 187, retentionRate: 91.2, status: 'strong' },
  { id: 'dp-2', name: 'College of Arts & Sciences', abbreviation: 'CAS', avgGPA: 3.31, enrolledStudents: 4120, facultyCount: 124, courseCount: 342, retentionRate: 87.4, status: 'stable' },
  { id: 'dp-3', name: 'School of Business', abbreviation: 'SOB', avgGPA: 3.12, enrolledStudents: 2210, facultyCount: 56, courseCount: 128, retentionRate: 90.8, status: 'strong' },
  { id: 'dp-4', name: 'School of Education', abbreviation: 'SOE', avgGPA: 3.52, enrolledStudents: 890, facultyCount: 34, courseCount: 64, retentionRate: 93.1, status: 'strong' },
  { id: 'dp-5', name: 'College of Health Sciences', abbreviation: 'CHS', avgGPA: 3.28, enrolledStudents: 1650, facultyCount: 48, courseCount: 112, retentionRate: 88.6, status: 'stable' },
  { id: 'dp-6', name: 'School of Computer Science', abbreviation: 'SCS', avgGPA: 3.08, enrolledStudents: 1890, facultyCount: 42, courseCount: 98, retentionRate: 84.2, status: 'watch' },
  { id: 'dp-7', name: 'College of Fine Arts', abbreviation: 'CFA', avgGPA: 3.44, enrolledStudents: 720, facultyCount: 38, courseCount: 76, retentionRate: 86.0, status: 'stable' },
  { id: 'dp-8', name: 'School of Law', abbreviation: 'SOL', avgGPA: 3.21, enrolledStudents: 480, facultyCount: 28, courseCount: 42, retentionRate: 82.5, status: 'watch' },
];

interface TermSummary {
  term: string;
  startDate: string;
  endDate: string;
  weeksRemaining: number;
  registrationStatus: string;
  midtermStatus: string;
  totalCourses: number;
  totalSections: number;
  avgClassSize: number;
}

const TERM_SUMMARY: TermSummary = {
  term: 'Spring 2026',
  startDate: 'Jan 13, 2026',
  endDate: 'May 8, 2026',
  weeksRemaining: 11,
  registrationStatus: 'Open \u2014 Late Add/Drop',
  midtermStatus: 'In Progress',
  totalCourses: 1248,
  totalSections: 1612,
  avgClassSize: 28,
};

// =============================================================================
// INLINE MOCK DATA — COURSES
// =============================================================================

interface CourseRecord {
  id: string;
  code: string;
  name: string;
  credits: number;
  instructor: string;
  department: string;
  enrollment: number;
  capacity: number;
  schedule: string;
  failRate: number;
  dfwRate: number;
  avgGrade: string;
  riskLevel: 'low' | 'moderate' | 'high';
}

const COURSE_CATALOG: CourseRecord[] = [
  { id: 'crs-1', code: 'CS 301', name: 'Algorithms & Data Structures', credits: 3, instructor: 'Dr. Kim', department: 'SCS', enrollment: 42, capacity: 45, schedule: 'MWF 10:00\u201310:50', failRate: 8.2, dfwRate: 14.6, avgGrade: 'B', riskLevel: 'moderate' },
  { id: 'crs-2', code: 'ENG 201', name: 'British Literature Survey', credits: 3, instructor: 'Dr. Patel', department: 'CAS', enrollment: 28, capacity: 35, schedule: 'TTh 1:00\u20132:15', failRate: 2.1, dfwRate: 5.3, avgGrade: 'B+', riskLevel: 'low' },
  { id: 'crs-3', code: 'BUS 410', name: 'Strategic Management', credits: 3, instructor: 'Prof. Adams', department: 'SOB', enrollment: 38, capacity: 40, schedule: 'MWF 2:00\u20132:50', failRate: 4.8, dfwRate: 9.1, avgGrade: 'B', riskLevel: 'low' },
  { id: 'crs-4', code: 'NUR 350', name: 'Clinical Nursing Practicum', credits: 4, instructor: 'Dr. Hassan', department: 'CHS', enrollment: 24, capacity: 24, schedule: 'MW 7:00\u201311:00', failRate: 6.4, dfwRate: 11.2, avgGrade: 'B', riskLevel: 'moderate' },
  { id: 'crs-5', code: 'ME 220', name: 'Thermodynamics', credits: 3, instructor: 'Dr. Chen', department: 'COE', enrollment: 36, capacity: 40, schedule: 'TTh 9:30\u201310:45', failRate: 12.3, dfwRate: 21.8, avgGrade: 'C+', riskLevel: 'high' },
  { id: 'crs-6', code: 'PSY 100', name: 'Intro to Psychology', credits: 3, instructor: 'Dr. Lopez', department: 'CAS', enrollment: 180, capacity: 200, schedule: 'MWF 11:00\u201311:50', failRate: 3.2, dfwRate: 7.4, avgGrade: 'B+', riskLevel: 'low' },
  { id: 'crs-7', code: 'CS 480', name: 'Machine Learning', credits: 3, instructor: 'Dr. Wang', department: 'SCS', enrollment: 35, capacity: 35, schedule: 'TTh 3:00\u20134:15', failRate: 11.4, dfwRate: 18.9, avgGrade: 'B-', riskLevel: 'high' },
  { id: 'crs-8', code: 'EDU 500', name: 'Foundations of Education', credits: 3, instructor: 'Dr. Park', department: 'SOE', enrollment: 22, capacity: 30, schedule: 'MW 4:00\u20135:15', failRate: 1.8, dfwRate: 4.2, avgGrade: 'A-', riskLevel: 'low' },
  { id: 'crs-9', code: 'CHM 101', name: 'General Chemistry I', credits: 4, instructor: 'Dr. Nguyen', department: 'CAS', enrollment: 148, capacity: 160, schedule: 'MWF 8:00\u20138:50', failRate: 14.7, dfwRate: 24.1, avgGrade: 'C+', riskLevel: 'high' },
  { id: 'crs-10', code: 'ART 210', name: 'Drawing & Composition', credits: 3, instructor: 'Prof. Rivera', department: 'CFA', enrollment: 18, capacity: 20, schedule: 'TTh 10:00\u201312:30', failRate: 1.2, dfwRate: 2.8, avgGrade: 'A-', riskLevel: 'low' },
  { id: 'crs-11', code: 'MTH 251', name: 'Calculus II', credits: 4, instructor: 'Dr. Liu', department: 'CAS', enrollment: 92, capacity: 100, schedule: 'MWF 9:00\u20139:50', failRate: 16.1, dfwRate: 26.5, avgGrade: 'C', riskLevel: 'high' },
  { id: 'crs-12', code: 'LAW 601', name: 'Constitutional Law', credits: 3, instructor: 'Prof. Moore', department: 'SOL', enrollment: 44, capacity: 50, schedule: 'MW 1:00\u20132:30', failRate: 5.3, dfwRate: 8.9, avgGrade: 'B', riskLevel: 'low' },
];

const DEPT_FILTER_OPTIONS = ['All', 'SCS', 'CAS', 'COE', 'SOB', 'CHS', 'SOE', 'CFA', 'SOL'];

// =============================================================================
// INLINE MOCK DATA — STUDENTS
// =============================================================================

interface StudentRecord {
  id: string;
  name: string;
  studentId: string;
  major: string;
  department: string;
  year: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Graduate';
  gpa: number;
  creditsEarned: number;
  creditsRequired: number;
  status: 'good_standing' | 'academic_warning' | 'probation' | 'honors';
  advisor: string;
  atRisk: boolean;
}

const STUDENT_DIRECTORY: StudentRecord[] = [
  { id: 'stu-1', name: 'Amara Johnson', studentId: '900412', major: 'Computer Science', department: 'SCS', year: 'Junior', gpa: 3.78, creditsEarned: 86, creditsRequired: 128, status: 'honors', advisor: 'Dr. Kim', atRisk: false },
  { id: 'stu-2', name: 'Dan Pearson', studentId: '900287', major: 'Mechanical Engineering', department: 'COE', year: 'Senior', gpa: 2.94, creditsEarned: 112, creditsRequired: 132, status: 'good_standing', advisor: 'Dr. Chen', atRisk: false },
  { id: 'stu-3', name: 'Sofia Chen', studentId: '900631', major: 'Nursing', department: 'CHS', year: 'Junior', gpa: 3.52, creditsEarned: 78, creditsRequired: 124, status: 'good_standing', advisor: 'Dr. Hassan', atRisk: false },
  { id: 'stu-4', name: 'Jaylen Thomas', studentId: '900148', major: 'Business Administration', department: 'SOB', year: 'Sophomore', gpa: 1.82, creditsEarned: 32, creditsRequired: 120, status: 'probation', advisor: 'Prof. Adams', atRisk: true },
  { id: 'stu-5', name: 'Priya Patel', studentId: '900509', major: 'Psychology', department: 'CAS', year: 'Senior', gpa: 3.91, creditsEarned: 108, creditsRequired: 120, status: 'honors', advisor: 'Dr. Lopez', atRisk: false },
  { id: 'stu-6', name: 'DeShawn Carter', studentId: '900773', major: 'Computer Science', department: 'SCS', year: 'Freshman', gpa: 2.12, creditsEarned: 14, creditsRequired: 128, status: 'academic_warning', advisor: 'Dr. Kim', atRisk: true },
  { id: 'stu-7', name: 'Emma Rodriguez', studentId: '900324', major: 'English Literature', department: 'CAS', year: 'Junior', gpa: 3.41, creditsEarned: 72, creditsRequired: 120, status: 'good_standing', advisor: 'Dr. Patel', atRisk: false },
  { id: 'stu-8', name: 'Tyler Kim', studentId: '900856', major: 'Electrical Engineering', department: 'COE', year: 'Sophomore', gpa: 1.94, creditsEarned: 28, creditsRequired: 130, status: 'probation', advisor: 'Dr. Chen', atRisk: true },
  { id: 'stu-9', name: 'Aaliyah Brown', studentId: '900491', major: 'Fine Arts', department: 'CFA', year: 'Senior', gpa: 3.67, creditsEarned: 116, creditsRequired: 124, status: 'good_standing', advisor: 'Prof. Rivera', atRisk: false },
  { id: 'stu-10', name: 'Daniel Okafor', studentId: '900205', major: 'Data Science', department: 'SCS', year: 'Graduate', gpa: 3.88, creditsEarned: 24, creditsRequired: 36, status: 'honors', advisor: 'Dr. Wang', atRisk: false },
  { id: 'stu-11', name: 'Kaitlyn Murphy', studentId: '900662', major: 'Chemistry', department: 'CAS', year: 'Freshman', gpa: 2.28, creditsEarned: 12, creditsRequired: 120, status: 'academic_warning', advisor: 'Dr. Nguyen', atRisk: true },
  { id: 'stu-12', name: 'Isaac Martinez', studentId: '900118', major: 'Education Leadership', department: 'SOE', year: 'Graduate', gpa: 3.74, creditsEarned: 42, creditsRequired: 60, status: 'good_standing', advisor: 'Dr. Park', atRisk: false },
];

interface StudentSuccessMetric {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'flat';
}

const STUDENT_SUCCESS_METRICS: StudentSuccessMetric[] = [
  { label: 'At-Risk Students', value: '412', trend: 'down' },
  { label: 'Avg. Time to Degree', value: '4.3 yrs', trend: 'flat' },
  { label: 'First-Gen Success Rate', value: '72.1%', trend: 'up' },
  { label: 'Transfer Credit Rate', value: '68.4%', trend: 'up' },
];

// =============================================================================
// INLINE MOCK DATA — ADVISING
// =============================================================================

interface AdvisingQueueItem {
  id: string;
  studentName: string;
  studentId: string;
  reason: string;
  priority: 'urgent' | 'normal' | 'low';
  status: 'pending' | 'scheduled' | 'in_progress';
  requestedDate: string;
  advisor: string;
}

const ADVISING_QUEUE: AdvisingQueueItem[] = [
  { id: 'aq-1', studentName: 'Jaylen Thomas', studentId: '900148', reason: 'Academic probation review', priority: 'urgent', status: 'pending', requestedDate: 'Feb 14', advisor: 'Prof. Adams' },
  { id: 'aq-2', studentName: 'Tyler Kim', studentId: '900856', reason: 'Course withdrawal request', priority: 'urgent', status: 'scheduled', requestedDate: 'Feb 13', advisor: 'Dr. Chen' },
  { id: 'aq-3', studentName: 'DeShawn Carter', studentId: '900773', reason: 'Academic warning follow-up', priority: 'urgent', status: 'in_progress', requestedDate: 'Feb 12', advisor: 'Dr. Kim' },
  { id: 'aq-4', studentName: 'Kaitlyn Murphy', studentId: '900662', reason: 'Tutoring referral', priority: 'normal', status: 'pending', requestedDate: 'Feb 15', advisor: 'Dr. Nguyen' },
  { id: 'aq-5', studentName: 'Amara Johnson', studentId: '900412', reason: 'Grad school advising', priority: 'low', status: 'scheduled', requestedDate: 'Feb 18', advisor: 'Dr. Kim' },
  { id: 'aq-6', studentName: 'Dan Pearson', studentId: '900287', reason: 'Senior capstone selection', priority: 'normal', status: 'pending', requestedDate: 'Feb 16', advisor: 'Dr. Chen' },
  { id: 'aq-7', studentName: 'Emma Rodriguez', studentId: '900324', reason: 'Study abroad clearance', priority: 'low', status: 'scheduled', requestedDate: 'Feb 19', advisor: 'Dr. Patel' },
];

interface AdvisorCaseload {
  id: string;
  name: string;
  department: string;
  totalStudents: number;
  activeAlerts: number;
  completedSessions: number;
  pendingRequests: number;
  satisfaction: number;
}

const ADVISOR_CASELOADS: AdvisorCaseload[] = [
  { id: 'ac-1', name: 'Dr. Sarah Kim', department: 'SCS', totalStudents: 48, activeAlerts: 3, completedSessions: 126, pendingRequests: 2, satisfaction: 4.7 },
  { id: 'ac-2', name: 'Dr. Robert Chen', department: 'COE', totalStudents: 52, activeAlerts: 4, completedSessions: 108, pendingRequests: 3, satisfaction: 4.4 },
  { id: 'ac-3', name: 'Dr. Ahmed Hassan', department: 'CHS', totalStudents: 38, activeAlerts: 1, completedSessions: 94, pendingRequests: 0, satisfaction: 4.8 },
  { id: 'ac-4', name: 'Prof. Adams', department: 'SOB', totalStudents: 44, activeAlerts: 5, completedSessions: 82, pendingRequests: 4, satisfaction: 4.1 },
  { id: 'ac-5', name: 'Dr. Lopez', department: 'CAS', totalStudents: 56, activeAlerts: 2, completedSessions: 142, pendingRequests: 1, satisfaction: 4.6 },
  { id: 'ac-6', name: 'Dr. Nguyen', department: 'CAS', totalStudents: 42, activeAlerts: 3, completedSessions: 98, pendingRequests: 2, satisfaction: 4.3 },
];

interface CompletionStat {
  label: string;
  value: string;
  subtext: string;
}

const ADVISING_COMPLETION_STATS: CompletionStat[] = [
  { label: 'Sessions This Term', value: '1,284', subtext: '+12% vs last term' },
  { label: 'Avg. Wait Time', value: '2.4 days', subtext: 'Target: < 3 days' },
  { label: 'Completion Rate', value: '94.2%', subtext: 'Scheduled vs completed' },
  { label: 'Student Satisfaction', value: '4.5/5.0', subtext: 'Based on 812 reviews' },
];

// =============================================================================
// INLINE MOCK DATA — RISK & INTERVENTIONS
// =============================================================================

interface AtRiskStudent {
  id: string;
  name: string;
  studentId: string;
  major: string;
  gpa: number;
  riskScore: number;
  riskFactors: string[];
  lastContact: string;
  interventionCount: number;
}

const AT_RISK_STUDENTS: AtRiskStudent[] = [
  { id: 'ar-1', name: 'Jaylen Thomas', studentId: '900148', major: 'Business Administration', gpa: 1.82, riskScore: 92, riskFactors: ['GPA below 2.0', 'Missed midterm', '3 absences'], lastContact: 'Feb 10', interventionCount: 2 },
  { id: 'ar-2', name: 'Tyler Kim', studentId: '900856', major: 'Electrical Engineering', gpa: 1.94, riskScore: 88, riskFactors: ['GPA below 2.0', 'Course withdrawal', 'Financial hold'], lastContact: 'Feb 8', interventionCount: 3 },
  { id: 'ar-3', name: 'DeShawn Carter', studentId: '900773', major: 'Computer Science', gpa: 2.12, riskScore: 74, riskFactors: ['GPA trending down', 'Failed CS prerequisite'], lastContact: 'Feb 12', interventionCount: 1 },
  { id: 'ar-4', name: 'Kaitlyn Murphy', studentId: '900662', major: 'Chemistry', gpa: 2.28, riskScore: 68, riskFactors: ['GPA trending down', 'Low homework completion'], lastContact: 'Feb 6', interventionCount: 1 },
  { id: 'ar-5', name: 'Jason Park', studentId: '900445', major: 'Marketing', gpa: 2.31, riskScore: 61, riskFactors: ['Attendance below 80%', 'Incomplete assignments'], lastContact: 'Feb 4', interventionCount: 0 },
  { id: 'ar-6', name: 'Maria Santos', studentId: '900710', major: 'Nursing', gpa: 2.48, riskScore: 55, riskFactors: ['Clinical evaluation concern', 'Schedule overload'], lastContact: 'Feb 11', interventionCount: 1 },
];

interface Intervention {
  id: string;
  studentName: string;
  type: 'tutoring' | 'counseling' | 'mentoring' | 'academic_plan' | 'financial_aid' | 'schedule_adjustment';
  status: 'active' | 'completed' | 'pending' | 'escalated';
  assignedTo: string;
  startDate: string;
  notes: string;
}

const ACTIVE_INTERVENTIONS: Intervention[] = [
  { id: 'int-1', studentName: 'Jaylen Thomas', type: 'academic_plan', status: 'active', assignedTo: 'Prof. Adams', startDate: 'Feb 1', notes: 'Weekly check-ins, reduced course load next term' },
  { id: 'int-2', studentName: 'Tyler Kim', type: 'tutoring', status: 'active', assignedTo: 'Tutoring Center', startDate: 'Jan 28', notes: 'Physics & Calculus tutoring 3x/week' },
  { id: 'int-3', studentName: 'Tyler Kim', type: 'financial_aid', status: 'pending', assignedTo: 'Financial Aid Office', startDate: 'Feb 10', notes: 'Emergency aid application under review' },
  { id: 'int-4', studentName: 'DeShawn Carter', type: 'mentoring', status: 'active', assignedTo: 'Dr. Kim', startDate: 'Feb 5', notes: 'Peer mentorship program enrollment + study group' },
  { id: 'int-5', studentName: 'Kaitlyn Murphy', type: 'tutoring', status: 'active', assignedTo: 'Tutoring Center', startDate: 'Feb 8', notes: 'Chemistry and lab skills support' },
  { id: 'int-6', studentName: 'Jason Park', type: 'counseling', status: 'pending', assignedTo: 'Student Wellness', startDate: 'Feb 15', notes: 'Initial wellness assessment scheduled' },
  { id: 'int-7', studentName: 'Maria Santos', type: 'schedule_adjustment', status: 'escalated', assignedTo: 'Dr. Hassan', startDate: 'Feb 11', notes: 'Clinical rotation reschedule — needs dean approval' },
  { id: 'int-8', studentName: 'Jaylen Thomas', type: 'counseling', status: 'completed', assignedTo: 'Student Wellness', startDate: 'Jan 20', notes: 'Completed initial assessment, referred to academic plan' },
];

interface EarlyAlert {
  id: string;
  studentName: string;
  courseName: string;
  alertType: 'attendance' | 'grade' | 'engagement' | 'behavior';
  severity: 'critical' | 'warning' | 'info';
  filedBy: string;
  date: string;
  resolved: boolean;
}

const EARLY_ALERTS: EarlyAlert[] = [
  { id: 'ea-1', studentName: 'Jaylen Thomas', courseName: 'BUS 410', alertType: 'grade', severity: 'critical', filedBy: 'Prof. Adams', date: 'Feb 12', resolved: false },
  { id: 'ea-2', studentName: 'Tyler Kim', courseName: 'EE 201', alertType: 'attendance', severity: 'critical', filedBy: 'Dr. Chen', date: 'Feb 10', resolved: false },
  { id: 'ea-3', studentName: 'DeShawn Carter', courseName: 'CS 201', alertType: 'grade', severity: 'warning', filedBy: 'Dr. Kim', date: 'Feb 9', resolved: false },
  { id: 'ea-4', studentName: 'Kaitlyn Murphy', courseName: 'CHM 101', alertType: 'engagement', severity: 'warning', filedBy: 'Dr. Nguyen', date: 'Feb 7', resolved: false },
  { id: 'ea-5', studentName: 'Jason Park', courseName: 'MKT 300', alertType: 'attendance', severity: 'warning', filedBy: 'Prof. Adams', date: 'Feb 6', resolved: false },
  { id: 'ea-6', studentName: 'Maria Santos', courseName: 'NUR 350', alertType: 'grade', severity: 'warning', filedBy: 'Dr. Hassan', date: 'Feb 5', resolved: true },
  { id: 'ea-7', studentName: 'DeShawn Carter', courseName: 'MTH 151', alertType: 'grade', severity: 'critical', filedBy: 'Dr. Liu', date: 'Feb 3', resolved: true },
  { id: 'ea-8', studentName: 'Tyler Kim', courseName: 'PHY 201', alertType: 'grade', severity: 'critical', filedBy: 'Dr. Nguyen', date: 'Jan 30', resolved: true },
];

// =============================================================================
// SHARED SUB-COMPONENTS
// =============================================================================

function SectionHeader({ title, colors, count }: { title: string; colors: typeof Colors.light; count?: number }) {
  return (
    <View style={sh.headerRow}>
      <ThemedText style={[sh.sectionLabel, { color: colors.textSecondary }]}>
        {title}
      </ThemedText>
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

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'active' || status === 'accredited' || status === 'strong' || status === 'good_standing' || status === 'completed' ? '#5A8A6E' :
    status === 'proposed' || status === 'pending' || status === 'stable' || status === 'info' ? ACCENT :
    status === 'under_review' || status === 'conditional' || status === 'watch' || status === 'academic_warning' || status === 'warning' || status === 'scheduled' || status === 'in_progress' ? '#B8943E' :
    status === 'suspended' || status === 'expired' || status === 'probation' || status === 'critical' || status === 'escalated' || status === 'urgent' ? '#B85C5C' :
    status === 'honors' ? ACCENT : '#9C9790';
  return <View style={[sh.statusDot, { backgroundColor: color }]} />;
}

const sh = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  countText: {
    fontSize: 10,
    fontWeight: '600',
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

// =============================================================================
// VIEW: OVERVIEW
// =============================================================================

function OverviewView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  return (
    <>
      {/* Academic Health Tiles */}
      <View style={s.moduleContainer}>
        <SectionHeader title="ACADEMIC HEALTH" colors={colors} />
        <View style={s.tilesGrid}>
          {HEALTH_TILES.map((tile) => (
            <View
              key={tile.id}
              style={[s.healthTile, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={s.tileTopRow}>
                <IconSymbol name={tile.icon as any} size={16} color={colors.textSecondary} />
                <View style={[
                  s.tileDelta,
                  { backgroundColor: tile.deltaType === 'positive' ? '#5A8A6E20' : tile.deltaType === 'negative' ? '#B85C5C20' : colors.backgroundTertiary },
                ]}>
                  <ThemedText style={[s.tileDeltaText, {
                    color: tile.deltaType === 'positive' ? '#5A8A6E' : tile.deltaType === 'negative' ? '#B85C5C' : colors.textSecondary,
                  }]}>
                    {tile.delta}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[s.tileValue, { color: colors.text }]}>{tile.value}</ThemedText>
              <ThemedText style={[s.tileLabel, { color: colors.textSecondary }]}>{tile.label}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Department Performance Grid */}
      {isFacultyLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="DEPARTMENT PERFORMANCE" colors={colors} count={DEPT_PERFORMANCE.length} />
          <Card colors={colors}>
            {/* Header row */}
            <View style={[s.deptPerfRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, paddingBottom: 8, marginBottom: 4 }]}>
              <ThemedText style={[s.deptPerfName, { color: colors.textSecondary, fontSize: 10, fontWeight: '700' }]}>DEPARTMENT</ThemedText>
              <ThemedText style={[s.deptPerfStat, { color: colors.textSecondary, fontSize: 10, fontWeight: '700' }]}>GPA</ThemedText>
              <ThemedText style={[s.deptPerfStat, { color: colors.textSecondary, fontSize: 10, fontWeight: '700' }]}>RET.</ThemedText>
              {isDeanLevel(role) && (
                <ThemedText style={[s.deptPerfStat, { color: colors.textSecondary, fontSize: 10, fontWeight: '700' }]}>ENRL.</ThemedText>
              )}
            </View>
            {DEPT_PERFORMANCE.map((dept, idx) => (
              <View
                key={dept.id}
                style={[
                  s.deptPerfRow,
                  idx < DEPT_PERFORMANCE.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={s.deptPerfNameCol}>
                  <StatusDot status={dept.status} />
                  <ThemedText style={[s.deptPerfName, { color: colors.text }]} numberOfLines={1}>
                    {dept.abbreviation}
                  </ThemedText>
                </View>
                <ThemedText style={[s.deptPerfStat, { color: colors.text }]}>{dept.avgGPA.toFixed(2)}</ThemedText>
                <ThemedText style={[s.deptPerfStat, { color: dept.retentionRate < 85 ? '#B8943E' : colors.text }]}>
                  {dept.retentionRate}%
                </ThemedText>
                {isDeanLevel(role) && (
                  <ThemedText style={[s.deptPerfStat, { color: colors.textSecondary }]}>
                    {dept.enrolledStudents.toLocaleString()}
                  </ThemedText>
                )}
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* Term Summary */}
      <View style={s.moduleContainer}>
        <SectionHeader title="TERM SUMMARY" colors={colors} />
        <Card colors={colors}>
          <View style={s.termHeader}>
            <IconSymbol name="calendar" size={16} color={colors.text} />
            <ThemedText style={[s.termName, { color: colors.text }]}>{TERM_SUMMARY.term}</ThemedText>
          </View>
          <ThemedText style={[s.termDateRange, { color: colors.textSecondary }]}>
            {TERM_SUMMARY.startDate} {'\u2013'} {TERM_SUMMARY.endDate}
          </ThemedText>

          <View style={s.termStatsRow}>
            <View style={s.termStat}>
              <ThemedText style={[s.termStatValue, { color: colors.text }]}>{TERM_SUMMARY.weeksRemaining}</ThemedText>
              <ThemedText style={[s.termStatLabel, { color: colors.textSecondary }]}>Weeks Left</ThemedText>
            </View>
            {isEnrolled(role) && (
              <>
                <View style={[s.termStatDivider, { backgroundColor: colors.border }]} />
                <View style={s.termStat}>
                  <ThemedText style={[s.termStatValue, { color: colors.text }]}>{TERM_SUMMARY.totalCourses.toLocaleString()}</ThemedText>
                  <ThemedText style={[s.termStatLabel, { color: colors.textSecondary }]}>Courses</ThemedText>
                </View>
              </>
            )}
            {isFacultyLevel(role) && (
              <>
                <View style={[s.termStatDivider, { backgroundColor: colors.border }]} />
                <View style={s.termStat}>
                  <ThemedText style={[s.termStatValue, { color: colors.text }]}>{TERM_SUMMARY.avgClassSize}</ThemedText>
                  <ThemedText style={[s.termStatLabel, { color: colors.textSecondary }]}>Avg. Size</ThemedText>
                </View>
              </>
            )}
          </View>

          {isDeanLevel(role) && (
            <View style={s.termStatusRow}>
              <View style={[s.termStatusChip, { backgroundColor: '#B8943E20' }]}>
                <ThemedText style={[s.termStatusText, { color: '#B8943E' }]}>
                  Midterms: {TERM_SUMMARY.midtermStatus}
                </ThemedText>
              </View>
              <View style={[s.termStatusChip, { backgroundColor: '#5A8A6E20' }]}>
                <ThemedText style={[s.termStatusText, { color: '#5A8A6E' }]}>
                  Registration: {TERM_SUMMARY.registrationStatus}
                </ThemedText>
              </View>
            </View>
          )}
        </Card>
      </View>
    </>
  );
}

// =============================================================================
// VIEW: COURSES
// =============================================================================

function CoursesView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  const filtered = COURSE_CATALOG.filter((c) => {
    const matchesSearch = search.length === 0 ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'All' || c.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const riskColor = (level: CourseRecord['riskLevel']) =>
    level === 'high' ? '#B85C5C' : level === 'moderate' ? '#B8943E' : '#5A8A6E';

  return (
    <>
      {/* Search bar */}
      <View style={s.moduleContainer}>
        <View style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textSecondary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search courses..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Department filter pills */}
      <View style={s.moduleContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          {DEPT_FILTER_OPTIONS.map((d) => (
            <Pressable
              key={d}
              style={[
                s.filterPill,
                { backgroundColor: deptFilter === d ? colors.text + '15' : 'transparent', borderColor: colors.border },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDeptFilter(d);
              }}
            >
              <ThemedText style={[s.filterPillText, { color: deptFilter === d ? colors.text : colors.textSecondary }]}>
                {d}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Course list */}
      <View style={s.moduleContainer}>
        <SectionHeader title="COURSE CATALOG" colors={colors} count={filtered.length} />
        <Card colors={colors}>
          {filtered.map((course, idx) => {
            const fillPct = Math.round((course.enrollment / course.capacity) * 100);
            const fillColor = fillPct >= 95 ? '#B85C5C' : fillPct >= 80 ? '#B8943E' : '#5A8A6E';

            return (
              <View
                key={course.id}
                style={[
                  s.courseRow,
                  idx < filtered.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={s.courseLeft}>
                  <View style={s.courseCodeRow}>
                    <ThemedText style={[s.courseCode, { color: colors.text }]}>{course.code}</ThemedText>
                    {isFacultyLevel(role) && (
                      <View style={[s.riskBadge, { backgroundColor: riskColor(course.riskLevel) + '20' }]}>
                        <ThemedText style={[s.riskBadgeText, { color: riskColor(course.riskLevel) }]}>
                          {course.riskLevel.toUpperCase()}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  <ThemedText style={[s.courseName, { color: colors.textSecondary }]} numberOfLines={1}>
                    {course.name}
                  </ThemedText>
                  <ThemedText style={[s.courseSchedule, { color: colors.textTertiary }]}>
                    {course.schedule} {'\u00B7'} {course.instructor}
                  </ThemedText>
                </View>
                <View style={s.courseRight}>
                  <ThemedText style={[s.courseCredits, { color: colors.textSecondary }]}>
                    {course.credits} cr
                  </ThemedText>
                  {isFacultyLevel(role) && (
                    <>
                      <View style={s.enrollmentBar}>
                        <View style={[s.enrollmentFill, { width: `${fillPct}%`, backgroundColor: fillColor }]} />
                      </View>
                      <ThemedText style={[s.enrollmentText, { color: colors.textTertiary }]}>
                        {course.enrollment}/{course.capacity}
                      </ThemedText>
                    </>
                  )}
                </View>
              </View>
            );
          })}
          {filtered.length === 0 && (
            <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>
              No courses match your search.
            </ThemedText>
          )}
        </Card>
      </View>

      {/* Course Risk Profiles (faculty+) */}
      {isFacultyLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="COURSE RISK PROFILES" colors={colors} />
          <Card colors={colors}>
            {/* Header */}
            <View style={[s.riskTableRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, paddingBottom: 8, marginBottom: 4 }]}>
              <ThemedText style={[s.riskTableCode, { color: colors.textSecondary, fontSize: 10, fontWeight: '700' }]}>COURSE</ThemedText>
              <ThemedText style={[s.riskTableStat, { color: colors.textSecondary, fontSize: 10, fontWeight: '700' }]}>FAIL%</ThemedText>
              <ThemedText style={[s.riskTableStat, { color: colors.textSecondary, fontSize: 10, fontWeight: '700' }]}>DFW%</ThemedText>
              <ThemedText style={[s.riskTableStat, { color: colors.textSecondary, fontSize: 10, fontWeight: '700' }]}>AVG</ThemedText>
            </View>
            {COURSE_CATALOG.filter((c) => c.riskLevel !== 'low').sort((a, b) => b.dfwRate - a.dfwRate).map((course, idx, arr) => (
              <View
                key={course.id}
                style={[
                  s.riskTableRow,
                  idx < arr.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={s.riskTableCodeCol}>
                  <StatusDot status={course.riskLevel === 'high' ? 'critical' : 'warning'} />
                  <ThemedText style={[s.riskTableCode, { color: colors.text }]}>{course.code}</ThemedText>
                </View>
                <ThemedText style={[s.riskTableStat, { color: course.failRate > 10 ? '#B85C5C' : '#B8943E' }]}>
                  {course.failRate}%
                </ThemedText>
                <ThemedText style={[s.riskTableStat, { color: course.dfwRate > 20 ? '#B85C5C' : '#B8943E' }]}>
                  {course.dfwRate}%
                </ThemedText>
                <ThemedText style={[s.riskTableStat, { color: colors.textSecondary }]}>
                  {course.avgGrade}
                </ThemedText>
              </View>
            ))}
          </Card>
        </View>
      )}
    </>
  );
}

// =============================================================================
// VIEW: STUDENTS
// =============================================================================

function StudentsView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [search, setSearch] = useState('');
  const [showAtRiskOnly, setShowAtRiskOnly] = useState(false);

  const filtered = STUDENT_DIRECTORY.filter((stu) => {
    const matchesSearch = search.length === 0 ||
      stu.name.toLowerCase().includes(search.toLowerCase()) ||
      stu.studentId.includes(search) ||
      stu.major.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = !showAtRiskOnly || stu.atRisk;
    return matchesSearch && matchesRisk;
  });

  const statusLabel = (status: StudentRecord['status']) => {
    switch (status) {
      case 'good_standing': return 'Good Standing';
      case 'academic_warning': return 'Academic Warning';
      case 'probation': return 'Probation';
      case 'honors': return 'Honors';
    }
  };

  return (
    <>
      {/* Student Success Metrics */}
      <View style={s.moduleContainer}>
        <SectionHeader title="STUDENT SUCCESS METRICS" colors={colors} />
        <View style={s.metricsRow}>
          {STUDENT_SUCCESS_METRICS.map((m) => (
            <View key={m.label} style={[s.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.metricValue, { color: colors.text }]}>{m.value}</ThemedText>
              <ThemedText style={[s.metricLabel, { color: colors.textSecondary }]}>{m.label}</ThemedText>
              <View style={s.metricTrendRow}>
                <IconSymbol
                  name={m.trend === 'up' ? 'arrow.up.right' : m.trend === 'down' ? 'arrow.down.right' : 'arrow.right' as any}
                  size={10}
                  color={m.trend === 'up' ? '#5A8A6E' : m.trend === 'down' ? '#B85C5C' : colors.textTertiary}
                />
                <ThemedText style={[s.metricTrend, {
                  color: m.trend === 'up' ? '#5A8A6E' : m.trend === 'down' ? '#B85C5C' : colors.textTertiary,
                }]}>
                  {m.trend === 'up' ? 'Improving' : m.trend === 'down' ? 'Declining' : 'Stable'}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Search and filters */}
      <View style={s.moduleContainer}>
        <View style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textSecondary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search students..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={[s.filterRow, { marginTop: Spacing.sm }]}>
          <Pressable
            style={[
              s.filterPill,
              { backgroundColor: !showAtRiskOnly ? colors.text + '15' : 'transparent', borderColor: colors.border },
            ]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowAtRiskOnly(false); }}
          >
            <ThemedText style={[s.filterPillText, { color: !showAtRiskOnly ? colors.text : colors.textSecondary }]}>All</ThemedText>
          </Pressable>
          <Pressable
            style={[
              s.filterPill,
              { backgroundColor: showAtRiskOnly ? '#B85C5C20' : 'transparent', borderColor: colors.border },
            ]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowAtRiskOnly(true); }}
          >
            <ThemedText style={[s.filterPillText, { color: showAtRiskOnly ? '#B85C5C' : colors.textSecondary }]}>At-Risk</ThemedText>
          </Pressable>
        </View>
      </View>

      {/* Student Directory */}
      <View style={s.moduleContainer}>
        <SectionHeader title="STUDENT DIRECTORY" colors={colors} count={filtered.length} />
        <Card colors={colors}>
          {filtered.map((stu, idx) => {
            const progressPct = Math.round((stu.creditsEarned / stu.creditsRequired) * 100);
            return (
              <Pressable
                key={stu.id}
                style={[
                  s.studentRow,
                  idx < filtered.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <View style={s.studentLeft}>
                  <View style={s.studentNameRow}>
                    <StatusDot status={stu.status} />
                    <ThemedText style={[s.studentName, { color: colors.text }]} numberOfLines={1}>
                      {stu.name}
                    </ThemedText>
                    {stu.atRisk && (
                      <View style={[s.atRiskChip, { backgroundColor: '#B85C5C20' }]}>
                        <ThemedText style={s.atRiskChipText}>AT RISK</ThemedText>
                      </View>
                    )}
                  </View>
                  <ThemedText style={[s.studentInfo, { color: colors.textSecondary }]}>
                    {stu.major} {'\u00B7'} {stu.year} {'\u00B7'} ID: {stu.studentId}
                  </ThemedText>
                  <ThemedText style={[s.studentSubInfo, { color: colors.textTertiary }]}>
                    {statusLabel(stu.status)} {'\u00B7'} Advisor: {stu.advisor}
                  </ThemedText>
                </View>
                <View style={s.studentRight}>
                  <ThemedText style={[s.studentGPA, { color: stu.gpa < 2.0 ? '#B85C5C' : stu.gpa < 2.5 ? '#B8943E' : colors.text }]}>
                    {stu.gpa.toFixed(2)}
                  </ThemedText>
                  <ThemedText style={[s.studentGPALabel, { color: colors.textTertiary }]}>GPA</ThemedText>
                  <View style={s.studentProgressBar}>
                    <View style={[s.studentProgressFill, { width: `${progressPct}%`, backgroundColor: '#5A8A6E' }]} />
                  </View>
                  <ThemedText style={[s.studentProgressText, { color: colors.textTertiary }]}>
                    {progressPct}%
                  </ThemedText>
                </View>
              </Pressable>
            );
          })}
          {filtered.length === 0 && (
            <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>
              No students match your search.
            </ThemedText>
          )}
        </Card>
      </View>
    </>
  );
}

// =============================================================================
// VIEW: ADVISING
// =============================================================================

function AdvisingView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [queueFilter, setQueueFilter] = useState<'all' | 'urgent' | 'pending'>('all');

  const filteredQueue = ADVISING_QUEUE.filter((item) => {
    if (queueFilter === 'urgent') return item.priority === 'urgent';
    if (queueFilter === 'pending') return item.status === 'pending';
    return true;
  });

  const priorityColor = (p: AdvisingQueueItem['priority']) =>
    p === 'urgent' ? '#B85C5C' : p === 'normal' ? '#B8943E' : ACCENT;

  const statusLabel = (s: AdvisingQueueItem['status']) =>
    s === 'pending' ? 'Pending' : s === 'scheduled' ? 'Scheduled' : 'In Progress';

  return (
    <>
      {/* Completion Stats */}
      <View style={s.moduleContainer}>
        <SectionHeader title="ADVISING METRICS" colors={colors} />
        <View style={s.metricsRow}>
          {ADVISING_COMPLETION_STATS.map((stat) => (
            <View key={stat.label} style={[s.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.metricValue, { color: colors.text }]}>{stat.value}</ThemedText>
              <ThemedText style={[s.metricLabel, { color: colors.textSecondary }]}>{stat.label}</ThemedText>
              <ThemedText style={[s.metricSubtext, { color: colors.textTertiary }]}>{stat.subtext}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Advising Queue */}
      <View style={s.moduleContainer}>
        <SectionHeader title="ADVISING QUEUE" colors={colors} count={filteredQueue.length} />

        <View style={s.filterRow}>
          {(['all', 'urgent', 'pending'] as const).map((f) => (
            <Pressable
              key={f}
              style={[
                s.filterPill,
                { backgroundColor: queueFilter === f ? (f === 'urgent' ? '#B85C5C20' : colors.text + '15') : 'transparent', borderColor: colors.border },
              ]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setQueueFilter(f); }}
            >
              <ThemedText style={[s.filterPillText, { color: queueFilter === f ? (f === 'urgent' ? '#B85C5C' : colors.text) : colors.textSecondary }]}>
                {f === 'all' ? 'All' : f === 'urgent' ? 'Urgent' : 'Pending'}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <Card colors={colors}>
          {filteredQueue.map((item, idx) => (
            <View
              key={item.id}
              style={[
                s.queueRow,
                idx < filteredQueue.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.priorityBar, { backgroundColor: priorityColor(item.priority) }]} />
              <View style={s.queueContent}>
                <View style={s.queueTopRow}>
                  <ThemedText style={[s.queueStudentName, { color: colors.text }]}>{item.studentName}</ThemedText>
                  <View style={[s.queueStatusChip, { backgroundColor: colors.backgroundTertiary }]}>
                    <ThemedText style={[s.queueStatusText, { color: colors.textSecondary }]}>
                      {statusLabel(item.status)}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={[s.queueReason, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.reason}
                </ThemedText>
                <ThemedText style={[s.queueMeta, { color: colors.textTertiary }]}>
                  {item.requestedDate} {'\u00B7'} Advisor: {item.advisor}
                </ThemedText>
              </View>
            </View>
          ))}
          {filteredQueue.length === 0 && (
            <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>
              No items match the current filter.
            </ThemedText>
          )}
        </Card>
      </View>

      {/* Advisor Caseloads */}
      <View style={s.moduleContainer}>
        <SectionHeader title="ADVISOR CASELOADS" colors={colors} count={ADVISOR_CASELOADS.length} />
        <Card colors={colors}>
          {/* Header */}
          <View style={[s.caseloadRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, paddingBottom: 8, marginBottom: 4 }]}>
            <ThemedText style={[s.caseloadName, { color: colors.textSecondary, fontSize: 10, fontWeight: '700' }]}>ADVISOR</ThemedText>
            <ThemedText style={[s.caseloadStat, { color: colors.textSecondary, fontSize: 10, fontWeight: '700' }]}>STU.</ThemedText>
            <ThemedText style={[s.caseloadStat, { color: colors.textSecondary, fontSize: 10, fontWeight: '700' }]}>ALERTS</ThemedText>
            <ThemedText style={[s.caseloadStat, { color: colors.textSecondary, fontSize: 10, fontWeight: '700' }]}>SAT.</ThemedText>
          </View>
          {ADVISOR_CASELOADS.map((advisor, idx) => (
            <Pressable
              key={advisor.id}
              style={[
                s.caseloadRow,
                idx < ADVISOR_CASELOADS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={s.caseloadNameCol}>
                <ThemedText style={[s.caseloadName, { color: colors.text }]} numberOfLines={1}>
                  {advisor.name}
                </ThemedText>
                <ThemedText style={[s.caseloadDept, { color: colors.textTertiary }]}>{advisor.department}</ThemedText>
              </View>
              <ThemedText style={[s.caseloadStat, { color: colors.text }]}>{advisor.totalStudents}</ThemedText>
              <ThemedText style={[s.caseloadStat, { color: advisor.activeAlerts > 3 ? '#B85C5C' : advisor.activeAlerts > 0 ? '#B8943E' : '#5A8A6E' }]}>
                {advisor.activeAlerts}
              </ThemedText>
              <ThemedText style={[s.caseloadStat, { color: advisor.satisfaction >= 4.5 ? '#5A8A6E' : colors.text }]}>
                {advisor.satisfaction}
              </ThemedText>
            </Pressable>
          ))}
        </Card>
      </View>
    </>
  );
}

// =============================================================================
// VIEW: RISK & INTERVENTIONS
// =============================================================================

function RiskView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [alertFilter, setAlertFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');

  const filteredAlerts = EARLY_ALERTS.filter((a) => {
    if (alertFilter === 'unresolved') return !a.resolved;
    if (alertFilter === 'resolved') return a.resolved;
    return true;
  });

  const riskScoreColor = (score: number) =>
    score >= 80 ? '#B85C5C' : score >= 60 ? '#B8943E' : ACCENT;

  const interventionTypeLabel = (type: Intervention['type']) => {
    switch (type) {
      case 'tutoring': return 'Tutoring';
      case 'counseling': return 'Counseling';
      case 'mentoring': return 'Mentoring';
      case 'academic_plan': return 'Academic Plan';
      case 'financial_aid': return 'Financial Aid';
      case 'schedule_adjustment': return 'Schedule Adj.';
    }
  };

  const interventionStatusColor = (status: Intervention['status']) =>
    status === 'active' ? '#5A8A6E' : status === 'completed' ? ACCENT : status === 'pending' ? '#B8943E' : '#B85C5C';

  const alertSeverityColor = (sev: EarlyAlert['severity']) =>
    sev === 'critical' ? '#B85C5C' : sev === 'warning' ? '#B8943E' : ACCENT;

  const alertTypeLabel = (type: EarlyAlert['alertType']) => {
    switch (type) {
      case 'attendance': return 'Attendance';
      case 'grade': return 'Grade';
      case 'engagement': return 'Engagement';
      case 'behavior': return 'Behavior';
    }
  };

  return (
    <>
      {/* Risk Radar — At-Risk Students */}
      <View style={s.moduleContainer}>
        <SectionHeader title="RISK RADAR" colors={colors} count={AT_RISK_STUDENTS.length} />
        {AT_RISK_STUDENTS.map((student) => (
          <Card key={student.id} colors={colors}>
            <View style={s.riskStudentHeader}>
              <View style={s.riskStudentNameRow}>
                <ThemedText style={[s.riskStudentName, { color: colors.text }]}>{student.name}</ThemedText>
                <View style={[s.riskScoreBadge, { backgroundColor: riskScoreColor(student.riskScore) + '20' }]}>
                  <ThemedText style={[s.riskScoreText, { color: riskScoreColor(student.riskScore) }]}>
                    Risk: {student.riskScore}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[s.riskStudentMeta, { color: colors.textSecondary }]}>
                {student.major} {'\u00B7'} GPA: {student.gpa.toFixed(2)} {'\u00B7'} ID: {student.studentId}
              </ThemedText>
            </View>

            {/* Risk Factors */}
            <View style={s.riskFactorsRow}>
              {student.riskFactors.map((factor, i) => (
                <View key={i} style={[s.riskFactorChip, { backgroundColor: '#B85C5C15' }]}>
                  <ThemedText style={s.riskFactorText}>{factor}</ThemedText>
                </View>
              ))}
            </View>

            <View style={s.riskStudentFooter}>
              <ThemedText style={[s.riskStudentFooterText, { color: colors.textTertiary }]}>
                Last Contact: {student.lastContact}
              </ThemedText>
              <ThemedText style={[s.riskStudentFooterText, { color: colors.textTertiary }]}>
                Interventions: {student.interventionCount}
              </ThemedText>
            </View>
          </Card>
        ))}
      </View>

      {/* Intervention Board */}
      <View style={s.moduleContainer}>
        <SectionHeader title="INTERVENTION BOARD" colors={colors} count={ACTIVE_INTERVENTIONS.length} />
        <Card colors={colors}>
          {ACTIVE_INTERVENTIONS.map((intervention, idx) => (
            <View
              key={intervention.id}
              style={[
                s.interventionRow,
                idx < ACTIVE_INTERVENTIONS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.interventionStatusBar, { backgroundColor: interventionStatusColor(intervention.status) }]} />
              <View style={s.interventionContent}>
                <View style={s.interventionTopRow}>
                  <ThemedText style={[s.interventionStudent, { color: colors.text }]}>{intervention.studentName}</ThemedText>
                  <View style={[s.interventionTypeBadge, { backgroundColor: colors.backgroundTertiary }]}>
                    <ThemedText style={[s.interventionTypeText, { color: colors.textSecondary }]}>
                      {interventionTypeLabel(intervention.type)}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={[s.interventionNotes, { color: colors.textSecondary }]} numberOfLines={2}>
                  {intervention.notes}
                </ThemedText>
                <View style={s.interventionMetaRow}>
                  <ThemedText style={[s.interventionMeta, { color: colors.textTertiary }]}>
                    {intervention.assignedTo} {'\u00B7'} Since {intervention.startDate}
                  </ThemedText>
                  <View style={[s.interventionStatusChip, { backgroundColor: interventionStatusColor(intervention.status) + '20' }]}>
                    <ThemedText style={[s.interventionStatusText, { color: interventionStatusColor(intervention.status) }]}>
                      {intervention.status.replace('_', ' ').toUpperCase()}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* Early Alert Log */}
      <View style={s.moduleContainer}>
        <SectionHeader title="EARLY ALERT LOG" colors={colors} count={filteredAlerts.length} />

        <View style={s.filterRow}>
          {(['all', 'unresolved', 'resolved'] as const).map((f) => (
            <Pressable
              key={f}
              style={[
                s.filterPill,
                { backgroundColor: alertFilter === f ? colors.text + '15' : 'transparent', borderColor: colors.border },
              ]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAlertFilter(f); }}
            >
              <ThemedText style={[s.filterPillText, { color: alertFilter === f ? colors.text : colors.textSecondary }]}>
                {f === 'all' ? 'All' : f === 'unresolved' ? 'Unresolved' : 'Resolved'}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <Card colors={colors}>
          {filteredAlerts.map((alert, idx) => (
            <View
              key={alert.id}
              style={[
                s.alertRow,
                idx < filteredAlerts.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.alertSeverityDot, { backgroundColor: alertSeverityColor(alert.severity) }]} />
              <View style={s.alertContent}>
                <View style={s.alertTopRow}>
                  <ThemedText style={[s.alertStudentName, { color: colors.text }]}>{alert.studentName}</ThemedText>
                  <ThemedText style={[s.alertDate, { color: colors.textTertiary }]}>{alert.date}</ThemedText>
                </View>
                <ThemedText style={[s.alertCourse, { color: colors.textSecondary }]}>
                  {alert.courseName} {'\u00B7'} {alertTypeLabel(alert.alertType)}
                </ThemedText>
                <View style={s.alertBottomRow}>
                  <ThemedText style={[s.alertFiler, { color: colors.textTertiary }]}>
                    Filed by: {alert.filedBy}
                  </ThemedText>
                  {alert.resolved && (
                    <View style={[s.alertResolvedBadge, { backgroundColor: '#5A8A6E20' }]}>
                      <ThemedText style={s.alertResolvedText}>RESOLVED</ThemedText>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
          {filteredAlerts.length === 0 && (
            <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>
              No alerts match the current filter.
            </ThemedText>
          )}
        </Card>
      </View>
    </>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function EduAcademics({ colors, role = 'E1', onSwitchTab }: Props) {
  const visibleViews = getVisibleViews(role);
  const [activeView, setActiveView] = useState<AcademicView>(visibleViews[0]?.id ?? 'overview');

  const renderView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView colors={colors} role={role} />;
      case 'courses':
        return <CoursesView colors={colors} role={role} />;
      case 'students':
        return <StudentsView colors={colors} role={role} />;
      case 'advising':
        return <AdvisingView colors={colors} role={role} />;
      case 'risk':
        return <RiskView colors={colors} role={role} />;
      default:
        return <OverviewView colors={colors} role={role} />;
    }
  };

  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* View pill toggle — only show if more than one view */}
      {visibleViews.length > 1 && (
        <View style={s.viewToggleContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.viewToggleRow}>
            {visibleViews.map((view) => {
              const isActive = activeView === view.id;
              return (
                <Pressable
                  key={view.id}
                  style={[
                    s.viewPill,
                    {
                      backgroundColor: isActive ? colors.text + '15' : 'transparent',
                      borderColor: isActive ? colors.text + '30' : colors.border,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveView(view.id);
                  }}
                >
                  <ThemedText style={[s.viewPillText, { color: isActive ? colors.text : colors.textSecondary }]}>
                    {view.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Active view content */}
      {renderView()}

      {/* Bottom spacer */}
      <View style={s.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  moduleContainer: { marginBottom: Spacing.lg },
  bottomSpacer: { height: 120 },

  // View toggle
  viewToggleContainer: { marginBottom: Spacing.lg },
  viewToggleRow: { flexDirection: 'row', gap: Spacing.sm },
  viewPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  viewPillText: { fontSize: 13, fontWeight: '600' },

  // Health tiles grid
  tilesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  healthTile: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tileTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  tileDelta: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  tileDeltaText: { fontSize: 10, fontWeight: '700' },
  tileValue: { fontSize: 22, fontWeight: '700', marginBottom: 2 },
  tileLabel: { fontSize: 11, fontWeight: '500' },

  // Department performance table
  deptPerfRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: Spacing.sm },
  deptPerfNameCol: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  deptPerfName: { fontSize: 13, fontWeight: '600' },
  deptPerfStat: { fontSize: 12, fontWeight: '600', width: 48, textAlign: 'right' },

  // Term summary
  termHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  termName: { fontSize: 18, fontWeight: '700' },
  termDateRange: { fontSize: 13, marginBottom: Spacing.md },
  termStatsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  termStat: { alignItems: 'center' },
  termStatValue: { fontSize: 18, fontWeight: '700' },
  termStatLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  termStatDivider: { width: StyleSheet.hairlineWidth, height: 28 },
  termStatusRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm, flexWrap: 'wrap' },
  termStatusChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.sm },
  termStatusText: { fontSize: 11, fontWeight: '600' },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },

  // Filter pills
  filterRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  filterPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: StyleSheet.hairlineWidth },
  filterPillText: { fontSize: 12, fontWeight: '600' },

  // Course list
  courseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  courseLeft: { flex: 1 },
  courseCodeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 1 },
  courseCode: { fontSize: 13, fontWeight: '700' },
  courseName: { fontSize: 12, marginBottom: 2 },
  courseSchedule: { fontSize: 10 },
  courseRight: { alignItems: 'flex-end', gap: 3 },
  courseCredits: { fontSize: 12, fontWeight: '600' },
  enrollmentBar: { width: 60, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  enrollmentFill: { height: '100%', borderRadius: 2 },
  enrollmentText: { fontSize: 9 },
  riskBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: BorderRadius.sm },
  riskBadgeText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.3 },

  // Course risk table
  riskTableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: Spacing.sm },
  riskTableCodeCol: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  riskTableCode: { fontSize: 12, fontWeight: '600' },
  riskTableStat: { fontSize: 12, fontWeight: '600', width: 48, textAlign: 'right' },

  // Student directory
  studentRow: { paddingVertical: 12, gap: 4, flexDirection: 'row' },
  studentLeft: { flex: 1 },
  studentNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  studentName: { fontSize: 14, fontWeight: '600' },
  studentInfo: { fontSize: 12, marginLeft: 12 },
  studentSubInfo: { fontSize: 10, marginLeft: 12, marginTop: 1 },
  studentRight: { alignItems: 'flex-end', gap: 2, minWidth: 50 },
  studentGPA: { fontSize: 18, fontWeight: '700' },
  studentGPALabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  studentProgressBar: { width: 48, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginTop: 2 },
  studentProgressFill: { height: '100%', borderRadius: 2 },
  studentProgressText: { fontSize: 9 },
  atRiskChip: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: BorderRadius.sm },
  atRiskChipText: { fontSize: 8, fontWeight: '800', color: '#B85C5C', letterSpacing: 0.3 },

  // Metrics row
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  metricCard: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  metricValue: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  metricLabel: { fontSize: 11, fontWeight: '500', marginBottom: 4 },
  metricTrendRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metricTrend: { fontSize: 10, fontWeight: '600' },
  metricSubtext: { fontSize: 10, marginTop: 2 },

  // Advising queue
  queueRow: { flexDirection: 'row', paddingVertical: 10, gap: Spacing.sm },
  priorityBar: { width: 3, borderRadius: 2, minHeight: 40 },
  queueContent: { flex: 1 },
  queueTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  queueStudentName: { fontSize: 14, fontWeight: '600' },
  queueStatusChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  queueStatusText: { fontSize: 10, fontWeight: '600' },
  queueReason: { fontSize: 12, marginBottom: 2 },
  queueMeta: { fontSize: 10 },

  // Caseload table
  caseloadRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: Spacing.sm },
  caseloadNameCol: { flex: 1 },
  caseloadName: { fontSize: 13, fontWeight: '600' },
  caseloadDept: { fontSize: 10, marginTop: 1 },
  caseloadStat: { fontSize: 12, fontWeight: '600', width: 40, textAlign: 'right' },

  // Risk radar
  riskStudentHeader: { marginBottom: Spacing.sm },
  riskStudentNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  riskStudentName: { fontSize: 16, fontWeight: '700' },
  riskScoreBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  riskScoreText: { fontSize: 12, fontWeight: '700' },
  riskStudentMeta: { fontSize: 12 },
  riskFactorsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm },
  riskFactorChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  riskFactorText: { fontSize: 10, fontWeight: '600', color: '#B85C5C' },
  riskStudentFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  riskStudentFooterText: { fontSize: 10 },

  // Intervention board
  interventionRow: { flexDirection: 'row', paddingVertical: 10, gap: Spacing.sm },
  interventionStatusBar: { width: 3, borderRadius: 2, minHeight: 48 },
  interventionContent: { flex: 1 },
  interventionTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  interventionStudent: { fontSize: 14, fontWeight: '600' },
  interventionTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  interventionTypeText: { fontSize: 10, fontWeight: '600' },
  interventionNotes: { fontSize: 12, marginBottom: 4 },
  interventionMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  interventionMeta: { fontSize: 10, flex: 1 },
  interventionStatusChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  interventionStatusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // Early alert log
  alertRow: { flexDirection: 'row', paddingVertical: 10, gap: Spacing.sm },
  alertSeverityDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  alertContent: { flex: 1 },
  alertTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  alertStudentName: { fontSize: 14, fontWeight: '600' },
  alertDate: { fontSize: 10 },
  alertCourse: { fontSize: 12, marginBottom: 3 },
  alertBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  alertFiler: { fontSize: 10 },
  alertResolvedBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: BorderRadius.sm },
  alertResolvedText: { fontSize: 8, fontWeight: '800', color: '#5A8A6E', letterSpacing: 0.3 },

  // Empty state
  emptyText: { fontSize: 13, textAlign: 'center', paddingVertical: Spacing.lg },
});
