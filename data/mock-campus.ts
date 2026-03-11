/**
 * Mock data for Campus screen — education mode.
 * 3 pages: Classes, Programs, Performance.
 * Pattern follows data/mock-office.ts.
 */

// ── Page 0: Classes ──

export type ClassStatus = 'active' | 'upcoming' | 'completed';
export type ClassFilter = 'all' | 'active' | 'upcoming' | 'completed';

export interface ClassItem {
  id: string;
  code: string;
  name: string;
  instructorName: string;
  instructorInitials: string;
  schedule: string;
  room: string;
  enrolled: number;
  capacity: number;
  status: ClassStatus;
  department: string;
}

export interface TermInfo {
  name: string;
  dateRange: string;
}

// ── Page 1: Programs ──

export type DegreeType = 'BS' | 'BA' | 'MS' | 'MBA' | 'Certificate';
export type ProgramFilter = 'all' | 'undergraduate' | 'graduate' | 'certificate' | 'online';

export interface ProgramItem {
  id: string;
  name: string;
  department: string;
  degreeType: DegreeType;
  enrolledCount: number;
  accredited: boolean;
  totalCredits: number;
}

// ── Page 2: Performance ──

export type AcademicTimeRange = 'term' | 'year' | 'all';

export interface AcademicKpi {
  id: string;
  metricName: string;
  currentValue: string;
  trend: 'up' | 'down' | 'flat';
  changePercent: string;
  sparkBars: number[];
  invertTrend?: boolean;
}

export interface DepartmentMetric {
  id: string;
  department: string;
  enrollment: number;
  avgGpa: string;
  retentionPercent: number;
  facultyCount: number;
  studentFacultyRatio: string;
}

export interface AtRiskStudent {
  id: string;
  name: string;
  initials: string;
  reason: string;
  department: string;
  gpa: string;
}

export interface NexusInsight {
  id: string;
  text: string;
  icon: string;
}

// ── Mock Data ──

export const CURRENT_TERM: TermInfo = {
  name: 'Spring 2026',
  dateRange: 'Jan 13 — May 8',
};

export const DEPARTMENTS = ['All', 'Business', 'Sciences', 'Arts', 'Education', 'Engineering', 'Nursing', 'Law'];

export const CLASSES: ClassItem[] = [
  { id: 'cl1', code: 'BUS 301', name: 'Institutional Management', instructorName: 'Dr. Williams', instructorInitials: 'DW', schedule: 'MWF 10:00 AM', room: 'Founders 204', enrolled: 28, capacity: 35, status: 'active', department: 'Business' },
  { id: 'cl2', code: 'CHEM 201', name: 'Organic Chemistry I', instructorName: 'Dr. Patel', instructorInitials: 'DP', schedule: 'TTh 1:00 PM', room: 'Science Hall 110', enrolled: 32, capacity: 35, status: 'active', department: 'Sciences' },
  { id: 'cl3', code: 'ENG 102', name: 'English Composition II', instructorName: 'Prof. Carter', instructorInitials: 'PC', schedule: 'MWF 9:00 AM', room: 'Liberal Arts 305', enrolled: 25, capacity: 30, status: 'active', department: 'Arts' },
  { id: 'cl4', code: 'EDUC 410', name: 'Student Teaching Seminar', instructorName: 'Dr. Thompson', instructorInitials: 'DT', schedule: 'W 4:00 PM', room: 'Education Bldg 201', enrolled: 15, capacity: 20, status: 'active', department: 'Education' },
  { id: 'cl5', code: 'CS 350', name: 'Data Structures', instructorName: 'Dr. Kim', instructorInitials: 'DK', schedule: 'TTh 11:00 AM', room: 'Engineering 102', enrolled: 40, capacity: 40, status: 'active', department: 'Engineering' },
  { id: 'cl6', code: 'NURS 320', name: 'Pharmacology', instructorName: 'Dr. Okafor', instructorInitials: 'DO', schedule: 'MWF 2:00 PM', room: 'Health Sciences 205', enrolled: 28, capacity: 30, status: 'active', department: 'Nursing' },
  { id: 'cl7', code: 'BUS 450', name: 'Strategic Management', instructorName: 'Dr. Williams', instructorInitials: 'DW', schedule: 'TTh 3:30 PM', room: 'Founders 310', enrolled: 22, capacity: 30, status: 'active', department: 'Business' },
  { id: 'cl8', code: 'PHYS 101', name: 'Intro to Physics', instructorName: 'Dr. Chen', instructorInitials: 'DC', schedule: 'MWF 11:00 AM', room: 'Science Hall 200', enrolled: 35, capacity: 40, status: 'active', department: 'Sciences' },
  { id: 'cl9', code: 'ART 210', name: 'Digital Design', instructorName: 'Prof. Rivera', instructorInitials: 'PR', schedule: 'TTh 10:00 AM', room: 'Arts Center 105', enrolled: 18, capacity: 20, status: 'active', department: 'Arts' },
  { id: 'cl10', code: 'CS 480', name: 'Machine Learning', instructorName: 'Dr. Kim', instructorInitials: 'DK', schedule: 'MWF 1:00 PM', room: 'Engineering 204', enrolled: 30, capacity: 35, status: 'upcoming', department: 'Engineering' },
  { id: 'cl11', code: 'BUS 201', name: 'Accounting I', instructorName: 'Prof. Morgan', instructorInitials: 'PM', schedule: 'Online · Async', room: 'Online', enrolled: 45, capacity: 50, status: 'upcoming', department: 'Business' },
  { id: 'cl12', code: 'EDUC 301', name: 'Curriculum Design', instructorName: 'Dr. Thompson', instructorInitials: 'DT', schedule: 'TTh 2:00 PM', room: 'Education Bldg 105', enrolled: 20, capacity: 25, status: 'completed', department: 'Education' },
];

export const PROGRAMS: ProgramItem[] = [
  { id: 'pg1', name: 'BS in Business Administration', department: 'Business', degreeType: 'BS', enrolledCount: 342, accredited: true, totalCredits: 120 },
  { id: 'pg2', name: 'BS in Computer Science', department: 'Engineering', degreeType: 'BS', enrolledCount: 285, accredited: true, totalCredits: 128 },
  { id: 'pg3', name: 'BA in English', department: 'Arts', degreeType: 'BA', enrolledCount: 156, accredited: true, totalCredits: 120 },
  { id: 'pg4', name: 'BS in Nursing', department: 'Nursing', degreeType: 'BS', enrolledCount: 198, accredited: true, totalCredits: 124 },
  { id: 'pg5', name: 'MS in Education', department: 'Education', degreeType: 'MS', enrolledCount: 87, accredited: true, totalCredits: 36 },
  { id: 'pg6', name: 'MBA', department: 'Business', degreeType: 'MBA', enrolledCount: 134, accredited: true, totalCredits: 48 },
  { id: 'pg7', name: 'BS in Biology', department: 'Sciences', degreeType: 'BS', enrolledCount: 210, accredited: true, totalCredits: 124 },
  { id: 'pg8', name: 'BA in Political Science', department: 'Arts', degreeType: 'BA', enrolledCount: 120, accredited: true, totalCredits: 120 },
  { id: 'pg9', name: 'Certificate in Data Analytics', department: 'Engineering', degreeType: 'Certificate', enrolledCount: 45, accredited: true, totalCredits: 18 },
  { id: 'pg10', name: 'BS in Mechanical Engineering', department: 'Engineering', degreeType: 'BS', enrolledCount: 175, accredited: true, totalCredits: 132 },
];

export const ACADEMIC_KPIS: AcademicKpi[] = [
  { id: 'ak1', metricName: 'Overall Enrollment', currentValue: '3,842', trend: 'up', changePercent: '4.2%', sparkBars: [60, 65, 68, 72, 75, 80, 85] },
  { id: 'ak2', metricName: 'Retention Rate', currentValue: '89%', trend: 'up', changePercent: '2.1%', sparkBars: [78, 80, 82, 84, 85, 87, 89] },
  { id: 'ak3', metricName: 'Average GPA', currentValue: '3.14', trend: 'up', changePercent: '0.08', sparkBars: [70, 72, 71, 73, 74, 75, 78] },
  { id: 'ak4', metricName: 'Graduation Rate', currentValue: '72%', trend: 'up', changePercent: '3.5%', sparkBars: [55, 58, 60, 63, 65, 68, 72] },
  { id: 'ak5', metricName: 'Course Completion', currentValue: '94%', trend: 'up', changePercent: '1.2%', sparkBars: [85, 87, 88, 90, 91, 93, 94] },
  { id: 'ak6', metricName: 'Student-Faculty Ratio', currentValue: '16:1', trend: 'down', changePercent: '0.8', sparkBars: [75, 72, 70, 68, 65, 62, 60], invertTrend: true },
];

export const DEPARTMENT_METRICS: DepartmentMetric[] = [
  { id: 'dm1', department: 'Business', enrollment: 476, avgGpa: '3.21', retentionPercent: 91, facultyCount: 28, studentFacultyRatio: '17:1' },
  { id: 'dm2', department: 'Sciences', enrollment: 385, avgGpa: '3.08', retentionPercent: 87, facultyCount: 32, studentFacultyRatio: '12:1' },
  { id: 'dm3', department: 'Arts', enrollment: 276, avgGpa: '3.35', retentionPercent: 85, facultyCount: 22, studentFacultyRatio: '13:1' },
  { id: 'dm4', department: 'Education', enrollment: 187, avgGpa: '3.42', retentionPercent: 93, facultyCount: 15, studentFacultyRatio: '12:1' },
  { id: 'dm5', department: 'Engineering', enrollment: 460, avgGpa: '3.05', retentionPercent: 88, facultyCount: 30, studentFacultyRatio: '15:1' },
  { id: 'dm6', department: 'Nursing', enrollment: 198, avgGpa: '3.28', retentionPercent: 95, facultyCount: 18, studentFacultyRatio: '11:1' },
];

export const AT_RISK_STUDENTS: AtRiskStudent[] = [
  { id: 'ar1', name: 'Marcus Johnson', initials: 'MJ', reason: 'GPA below 2.0', department: 'Engineering', gpa: '1.85' },
  { id: 'ar2', name: 'Ashley Green', initials: 'AG', reason: 'Attendance < 70%', department: 'Arts', gpa: '2.45' },
  { id: 'ar3', name: 'Tyler Brooks', initials: 'TB', reason: '3+ missing assignments', department: 'Business', gpa: '2.12' },
  { id: 'ar4', name: 'Jasmine Lee', initials: 'JL', reason: 'GPA below 2.0', department: 'Sciences', gpa: '1.92' },
  { id: 'ar5', name: 'Devon Carter', initials: 'DC', reason: 'Attendance < 70%', department: 'Engineering', gpa: '2.38' },
];

export const NEXUS_INSIGHTS: NexusInsight[] = [
  { id: 'ni1', text: 'BUS 301 has 15% higher completion rate than last term', icon: 'sparkles' },
  { id: 'ni2', text: 'Sciences department retention dropped 8% — 3 students withdrew', icon: 'sparkles' },
  { id: 'ni3', text: '12 students are on track to graduate this term', icon: 'sparkles' },
  { id: 'ni4', text: 'CS 350 is at full capacity — 8 students on waitlist', icon: 'sparkles' },
];

// ── Helpers ──

export function getClasses(filter?: ClassFilter, department?: string): ClassItem[] {
  let result = CLASSES;
  if (filter && filter !== 'all') {
    result = result.filter((c) => c.status === filter);
  }
  if (department && department !== 'All') {
    result = result.filter((c) => c.department === department);
  }
  return result;
}

export function getClassSummary(): { total: number; active: number; upcoming: number; completed: number } {
  return {
    total: CLASSES.length,
    active: CLASSES.filter((c) => c.status === 'active').length,
    upcoming: CLASSES.filter((c) => c.status === 'upcoming').length,
    completed: CLASSES.filter((c) => c.status === 'completed').length,
  };
}

export function getPrograms(filter?: ProgramFilter): ProgramItem[] {
  if (!filter || filter === 'all') return PROGRAMS;
  if (filter === 'undergraduate') return PROGRAMS.filter((p) => p.degreeType === 'BS' || p.degreeType === 'BA');
  if (filter === 'graduate') return PROGRAMS.filter((p) => p.degreeType === 'MS' || p.degreeType === 'MBA');
  if (filter === 'certificate') return PROGRAMS.filter((p) => p.degreeType === 'Certificate');
  // 'online' — no online-only flag in mock, return empty for now
  return [];
}

export function getAcademicKpis(_range: AcademicTimeRange): AcademicKpi[] {
  // All ranges return same data for now (mock)
  return ACADEMIC_KPIS;
}
