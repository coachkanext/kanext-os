/**
 * Mock Education Home Data — Lincoln University, Oakland CA
 * Feeds Dashboard, Calendar, Events, Metrics, and News views.
 */

import type { ProgramCalendarEvent } from '@/types';

// =============================================================================
// EVENT TYPES
// =============================================================================

export type EduEventCategory = 'academic' | 'campus_life' | 'athletics' | 'administrative' | 'accreditation';

export interface EduEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: EduEventCategory;
  status: 'upcoming' | 'completed';
  speaker?: string;
  instructor?: string;
  seriesName?: string;
  attendance?: number;
  outcome?: string;
}

export const EDU_EVENT_CATEGORY_COLORS: Record<EduEventCategory, string> = {
  academic: '#800000',
  campus_life: '#C41E3A',
  athletics: '#B85C5C',
  administrative: '#9C9790',
  accreditation: '#B8943E',
};

// =============================================================================
// EVENTS DATA
// =============================================================================

export const EDU_EVENTS: EduEvent[] = [
  // ── Upcoming ──────────────────────────────────────────────────────────────
  {
    id: 'evt-01',
    title: 'Spring 2026 Commencement',
    date: 'May 30, 2026',
    time: '10:00 AM',
    location: 'Lincoln University Main Auditorium',
    category: 'academic',
    status: 'upcoming',
    speaker: 'Dr. Mikhail Brodsky',
    instructor: 'Dr. Mikhail Brodsky',
    seriesName: 'Commencement Series',
  },
  {
    id: 'evt-02',
    title: 'WSCUC Reaccreditation Review',
    date: 'Jun 26, 2026',
    time: '9:00 AM',
    location: 'Administration Office',
    category: 'accreditation',
    status: 'upcoming',
    speaker: 'Dr. Alexander Anokhin',
    instructor: 'Dr. Alexander Anokhin',
    seriesName: 'Accreditation Review Series',
  },
  {
    id: 'evt-03',
    title: 'Final Examinations Begin',
    date: 'May 11, 2026',
    time: '8:00 AM',
    location: 'Main Campus',
    category: 'academic',
    status: 'upcoming',
  },
  {
    id: 'evt-04',
    title: 'Spring Recess',
    date: 'Mar 17, 2026',
    time: '12:00 AM',
    location: 'Campus-wide',
    category: 'campus_life',
    status: 'upcoming',
    outcome: 'No classes Mar 17–21',
  },
  {
    id: 'evt-05',
    title: 'Faculty Senate Meeting',
    date: 'Mar 25, 2026',
    time: '3:00 PM',
    location: 'Conference Room',
    category: 'administrative',
    status: 'upcoming',
    instructor: 'Dr. Themistoclis Pantos',
    seriesName: 'Faculty Senate',
  },
  // ── Completed ─────────────────────────────────────────────────────────────
  {
    id: 'evt-06',
    title: 'Fall 2025 Commencement',
    date: 'Dec 13, 2025',
    time: '10:00 AM',
    location: 'Lincoln University Main Auditorium',
    category: 'academic',
    status: 'completed',
    attendance: 280,
    outcome: '50 degrees conferred',
  },
  {
    id: 'evt-07',
    title: 'GAAC Tournament Championship',
    date: 'Mar 8, 2025',
    time: '7:00 PM',
    location: 'Laney College Gymnasium',
    category: 'athletics',
    status: 'completed',
    outcome: 'Men\'s Basketball — Conference Champions',
  },
  {
    id: 'evt-08',
    title: 'WSCUC Interim Review',
    date: 'Nov 5, 2025',
    time: '9:00 AM',
    location: 'Administration Office',
    category: 'accreditation',
    status: 'completed',
    outcome: 'No findings — cleared',
  },
  {
    id: 'evt-09',
    title: 'New Student Orientation',
    date: 'Jan 21, 2026',
    time: '9:00 AM',
    location: 'Main Campus',
    category: 'campus_life',
    status: 'completed',
    attendance: 42,
  },
  {
    id: 'evt-10',
    title: 'Budget Review',
    date: 'Jan 23, 2026',
    time: '2:00 PM',
    location: 'Administration Office',
    category: 'administrative',
    status: 'completed',
    outcome: 'Spring 2026 budget approved',
  },
];

// =============================================================================
// CALENDAR EVENTS (for CalendarHub — ProgramCalendarEvent format)
// =============================================================================

function parseDateString(dateStr: string): string {
  // Convert "May 30, 2026" to "2026-05-30"
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '2026-05-30';
  return d.toISOString().split('T')[0];
}

export const EDU_CALENDAR_EVENTS: ProgramCalendarEvent[] = EDU_EVENTS.filter(
  (e) => e.status === 'upcoming',
).map((e) => ({
  id: e.id,
  type: 'academic' as const,
  title: e.title,
  startDatetime: new Date(`${parseDateString(e.date)} ${e.time}`),
  endDatetime: new Date(new Date(`${parseDateString(e.date)} ${e.time}`).getTime() + 60 * 60 * 1000),
  location: e.location,
  description: e.speaker ? `Speaker: ${e.speaker}` : undefined,
  visibilityScope: 'all_program' as const,
}));

// =============================================================================
// NEWS TYPES & DATA
// =============================================================================

export type EduNewsCategoryTag =
  | 'campus'
  | 'student'
  | 'faculty'
  | 'alumni'
  | 'athletics'
  | 'institutional';

export interface EduNewsItem {
  id: string;
  headline: string;
  date: string;
  category: EduNewsCategoryTag;
  type: 'article' | 'video';
  duration?: string;
  speaker?: string;
  summary: string;
}

export const EDU_NEWS_CATEGORY_COLORS: Record<EduNewsCategoryTag, string> = {
  campus: '#800000',
  student: '#C41E3A',
  faculty: '#5A8A6E',
  alumni: '#B8943E',
  athletics: '#B85C5C',
  institutional: '#9C9790',
};

export const EDU_NEWS: EduNewsItem[] = [
  {
    id: 'news-01',
    headline: 'Lincoln MBA Ranked 4th Among Bay Area Programs',
    date: 'Feb 15, 2026',
    category: 'institutional',
    type: 'article',
    summary: 'The San Francisco Business Times ranked Lincoln University\'s MBA program 4th among Bay Area institutions, citing its international curriculum and flexible schedule for working professionals.',
  },
  {
    id: 'news-02',
    headline: 'WSCUC Reaccreditation on Track for June 2026',
    date: 'Feb 12, 2026',
    category: 'institutional',
    type: 'article',
    speaker: 'Dr. Alexander Anokhin',
    summary: 'Director of QA & Accreditation Compliance Dr. Anokhin confirmed the self-study is 78% complete and the institution remains in good standing ahead of the June 26 site visit.',
  },
  {
    id: 'news-03',
    headline: 'Dr. Brodsky: Building a Global University in Oakland',
    date: 'Feb 10, 2026',
    category: 'faculty',
    type: 'video',
    duration: '12:45',
    speaker: 'Dr. Mikhail Brodsky',
    summary: 'President Brodsky shares his vision for Lincoln University\'s next decade — expanding graduate offerings, deepening international partnerships, and strengthening Oakland community ties.',
  },
  {
    id: 'news-04',
    headline: 'Men\'s Basketball Wins Back-to-Back GAAC Championships',
    date: 'Mar 10, 2025',
    category: 'athletics',
    type: 'article',
    summary: 'The Lincoln Oaklanders men\'s basketball team captured their second consecutive Golden State Athletic Association Conference title, cementing the program\'s status as a Bay Area small-college powerhouse.',
  },
  {
    id: 'news-05',
    headline: 'International Student Spotlight: From 62 Countries to One Campus',
    date: 'Feb 5, 2026',
    category: 'student',
    type: 'article',
    summary: 'Lincoln\'s Spring 2026 student body represents 62 countries of origin. Students share how Oakland\'s diversity mirrors their own international backgrounds and enriches the classroom experience.',
  },
  {
    id: 'news-06',
    headline: 'Lincoln Chronicle Spring 2026 Issue Now Available',
    date: 'Jan 28, 2026',
    category: 'student',
    type: 'article',
    summary: 'The Lincoln Chronicle\'s Spring 2026 edition features student essays on global finance, a recap of the championship season, and an interview with Provost Pantos on curriculum innovation.',
  },
  {
    id: 'news-07',
    headline: 'Diagnostic Imaging Lab Upgrades Complete',
    date: 'Jan 20, 2026',
    category: 'campus',
    type: 'article',
    summary: 'The Diagnostic Imaging Laboratory has completed a major equipment upgrade, adding new ultrasound units and updated simulation software — enhancing hands-on training for BS Diagnostic Medical Sonography students.',
  },
  {
    id: 'news-08',
    headline: 'New DBA Cohort Enrolls for Spring 2026',
    date: 'Jan 15, 2026',
    category: 'faculty',
    type: 'article',
    summary: 'Lincoln\'s Doctor of Business Administration program welcomed its Spring 2026 cohort of 12 advanced doctoral candidates, bringing total DBA enrollment to 35 students across all active cohorts.',
  },
];

// =============================================================================
// ENROLLMENT DATA
// =============================================================================

export interface EnrollmentData {
  currentTotal: number;
  target: number;
  retentionRate: number;
  byClassYear: { label: string; count: number; color: string }[];
}

export const ENROLLMENT_DATA: EnrollmentData = {
  currentTotal: 436,
  target: 460,
  retentionRate: 0.89,
  byClassYear: [
    { label: 'Undergraduate', count: 204, color: '#1A1714' },
    { label: 'Graduate', count: 232, color: '#800000' },
  ],
};

// =============================================================================
// ACADEMIC METRICS
// =============================================================================

export interface AcademicMetrics {
  avgGpa: number;
  graduationRate4yr: number;
  graduationRate6yr: number;
  facultyStudentRatio: string;
  accreditationStatus: string;
  nextAccreditationReview: string;
  topPrograms: { name: string; enrollment: number }[];
}

export const ACADEMIC_METRICS: AcademicMetrics = {
  avgGpa: 3.1,
  graduationRate4yr: 0.69,
  graduationRate6yr: 0.81,
  facultyStudentRatio: '15:1',
  accreditationStatus: 'WSCUC Accredited',
  nextAccreditationReview: 'June 2026',
  topPrograms: [
    { name: 'MBA', enrollment: 95 },
    { name: 'Business Administration', enrollment: 82 },
    { name: 'Diagnostic Imaging', enrollment: 58 },
    { name: 'MS Finance', enrollment: 48 },
    { name: 'DBA', enrollment: 35 },
  ],
};

// =============================================================================
// FINANCIAL METRICS
// =============================================================================

export interface FinancialMetrics {
  tuitionRevenue: number;
  aidDisbursed: number;
  endowment: number;
  operatingBudget: number;
  titleIVStatus: string;
}

export const FINANCIAL_METRICS: FinancialMetrics = {
  tuitionRevenue: 5_300_000,
  aidDisbursed: 0,
  endowment: 0,
  operatingBudget: 7_200_000,
  titleIVStatus: 'Not Title IV Eligible — Institutional Support Only',
};

// =============================================================================
// HERO / COMMERCE / DASHBOARD DATA
// =============================================================================

export interface EduHero {
  title: string;
  subtitle: string;
  isLive: boolean;
  instructor?: string;
}

export const EDU_HERO: EduHero = {
  title: 'Spring 2026 Commencement',
  subtitle: 'Lincoln University Main Auditorium',
  isLive: false,
  instructor: 'Dr. Mikhail Brodsky',
};

export interface EduCommerceItem {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export const EDU_COMMERCE: EduCommerceItem[] = [
  { id: 'apply', label: 'Apply Now', icon: 'doc.text.fill', color: '#800000' },
  { id: 'catalog', label: 'Course Catalog', icon: 'book.fill', color: '#800000' },
  { id: 'aid', label: 'Tuition Info', icon: 'dollarsign.circle.fill', color: '#5A8A6E' },
];

// =============================================================================
// FACULTY TYPES
// =============================================================================

export type TenureStatus = 'tenured' | 'tenure_track' | 'adjunct' | 'staff' | 'on_leave';
export type DepartmentCategory = 'arts_sciences' | 'business' | 'education' | 'professional';

/** Alias for cross-mode consistency (cf. MinistryCategory in church mode) */
export type EduDepartmentCategory = DepartmentCategory;

export const EDU_DEPARTMENT_LABELS: Record<DepartmentCategory, string> = {
  arts_sciences: 'Arts & Sciences',
  business: 'Business',
  education: 'Education',
  professional: 'Professional Studies',
};

export const EDU_DEPARTMENT_COLORS: Record<DepartmentCategory, string> = {
  arts_sciences: '#1A1714',
  business: '#800000',
  education: '#5A8A6E',
  professional: '#C41E3A',
};

export interface FacultyMember {
  id: string;
  name: string;
  title: string;
  department: string;
  departmentCategory: DepartmentCategory;
  tenureStatus: TenureStatus;
  status: 'active' | 'sabbatical' | 'adjunct' | 'on_leave';
  email: string;
  officeHours?: string;
  specialization?: string;
}

export interface Department {
  id: string;
  name: string;
  category: DepartmentCategory;
  chairName: string;
  facultyCount: number;
  studentEnrollment: number;
  programs: string[];
  status: 'active' | 'under_review' | 'probation';
}

export interface SenateCommittee {
  id: string;
  name: string;
  chair: string;
  memberCount: number;
  nextMeeting: string;
  status: 'active' | 'inactive' | 'ad_hoc';
  recentActions: string[];
}

// =============================================================================
// ADMISSIONS TYPES
// =============================================================================

export type AdmissionsStage = 'Inquiry' | 'Applied' | 'Accepted' | 'Deposited' | 'Enrolled' | 'Registered';

export interface AdmissionsPipelineEntry {
  id: string;
  name: string;
  stage: AdmissionsStage;
  programOfInterest: string;
  previousInstitution: string;
  gpa: number;
  applicationDate: string;
  financialAidStatus: 'approved' | 'pending' | 'not_applied' | 'denied' | 'not_applicable';
}

export interface AdmissionsSummary {
  fallTarget: number;
  totalPipeline: number;
  acceptanceRate: number;
  yieldRate: number;
  deadline: string;
}

export interface AcademicProgram {
  id: string;
  name: string;
  degreeType: 'B.A.' | 'B.S.' | 'M.A.' | 'M.S.' | 'M.B.A.' | 'Ed.D.' | 'Certificate';
  level: 'undergraduate' | 'graduate' | 'online';
  department: string;
  enrollment: number;
  acceptanceRate: number;
  avgIncomingGPA: number;
  status: 'open' | 'waitlisted' | 'closed';
  enrollmentStatus: 'open' | 'waitlist' | 'closed';
}

export type OutreachEventType = 'high_school_visit' | 'college_fair' | 'open_house' | 'virtual_info_session' | 'community_event';

export interface OutreachEvent {
  id: string;
  name: string;
  date: string;
  type: OutreachEventType;
  targetAudience: string;
  leadsGenerated?: number;
  recruiterName: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

// =============================================================================
// ADMISSIONS STAGES CONFIG
// =============================================================================

export const ADMISSIONS_STAGES: { key: AdmissionsStage; label: string; color: string }[] = [
  { key: 'Inquiry', label: 'Inquiry', color: '#9C9790' },
  { key: 'Applied', label: 'Applied', color: '#800000' },
  { key: 'Accepted', label: 'Accepted', color: '#C41E3A' },
  { key: 'Deposited', label: 'Deposited', color: '#B8943E' },
  { key: 'Enrolled', label: 'Enrolled', color: '#5A8A6E' },
  { key: 'Registered', label: 'Registered', color: '#5A8A6E' },
];

// =============================================================================
// FACULTY MEMBERS DATA
// =============================================================================

export const FACULTY_MEMBERS: FacultyMember[] = [
  // ── Administration / Full-Time ─────────────────────────────────────────────
  {
    id: 'fac-01',
    name: 'Dr. Mikhail Brodsky',
    title: 'President',
    department: 'Office of the President',
    departmentCategory: 'education',
    tenureStatus: 'tenured',
    status: 'active',
    email: 'president@lincolnuca.edu',
    officeHours: 'By appointment',
    specialization: 'Institutional Leadership',
  },
  {
    id: 'fac-02',
    name: 'Dr. Themistoclis Pantos',
    title: 'Provost, CAO & Director of Business Programs',
    department: 'Business Programs',
    departmentCategory: 'business',
    tenureStatus: 'tenured',
    status: 'active',
    email: 'tpantos@lincolnuca.edu',
    officeHours: 'Mon/Wed 10:00 AM–12:00 PM',
    specialization: 'Business Strategy & International Management',
  },
  {
    id: 'fac-03',
    name: 'Dr. Mohamed Tailab',
    title: 'Dean of Students',
    department: 'Student Affairs',
    departmentCategory: 'education',
    tenureStatus: 'tenured',
    status: 'active',
    email: 'mtailab@lincolnuca.edu',
    officeHours: 'Tue/Thu 9:00 AM–11:00 AM',
    specialization: 'Student Development & Advising',
  },
  {
    id: 'fac-04',
    name: 'Dr. Michael Guerra',
    title: 'Administrative Vice President',
    department: 'Administration',
    departmentCategory: 'education',
    tenureStatus: 'staff',
    status: 'active',
    email: 'mguerra@lincolnuca.edu',
    officeHours: 'By appointment',
    specialization: 'Higher Education Administration',
  },
  {
    id: 'fac-05',
    name: 'Dr. Alexander Anokhin',
    title: 'Director of QA & Accreditation Compliance',
    department: 'Academic Affairs',
    departmentCategory: 'education',
    tenureStatus: 'staff',
    status: 'active',
    email: 'aanokhin@lincolnuca.edu',
    officeHours: 'Mon–Fri 10:00 AM–12:00 PM',
    specialization: 'Quality Assurance & Accreditation',
  },
  {
    id: 'fac-06',
    name: 'Ms. Maggie Hua',
    title: 'Director of Admissions & Registrar',
    department: 'English Language Program',
    departmentCategory: 'education',
    tenureStatus: 'staff',
    status: 'active',
    email: 'maggiehua@lincolnuca.edu',
    officeHours: 'Mon–Fri 9:00 AM–5:00 PM',
    specialization: 'Admissions & Student Records',
  },
  {
    id: 'fac-07',
    name: 'Ms. Reenu Shrestha',
    title: 'Assistant to President / HR / PDSO',
    department: 'Office of the President',
    departmentCategory: 'education',
    tenureStatus: 'staff',
    status: 'active',
    email: 'sreenu@lincolnuca.edu',
    specialization: 'Human Resources & International Student Services',
  },
  {
    id: 'fac-08',
    name: 'Ms. Marina Kay',
    title: 'Director of Diagnostic Imaging Laboratory',
    department: 'Diagnostic Imaging',
    departmentCategory: 'professional',
    tenureStatus: 'tenured',
    status: 'active',
    email: 'mkay@lincolnuca.edu',
    officeHours: 'Tue/Thu 1:00–3:00 PM',
    specialization: 'Diagnostic Medical Sonography',
  },
  {
    id: 'fac-09',
    name: 'Mr. Desmond Gumbs',
    title: 'Director of Athletics',
    department: 'Athletics',
    departmentCategory: 'professional',
    tenureStatus: 'staff',
    status: 'active',
    email: 'dgumbs@lincolnuca.edu',
    specialization: 'Athletics Administration',
  },
  // ── Adjunct Faculty ───────────────────────────────────────────────────────
  {
    id: 'fac-10',
    name: 'Prof. Wei Zhang',
    title: 'Adjunct Instructor of Finance',
    department: 'Business Programs',
    departmentCategory: 'business',
    tenureStatus: 'adjunct',
    status: 'adjunct',
    email: 'wzhang@lincolnuca.edu',
    specialization: 'Corporate Finance & Investment Analysis',
  },
  {
    id: 'fac-11',
    name: 'Prof. Amara Diallo',
    title: 'Adjunct Instructor of Business Communication',
    department: 'Business Programs',
    departmentCategory: 'business',
    tenureStatus: 'adjunct',
    status: 'adjunct',
    email: 'adiallo@lincolnuca.edu',
    specialization: 'Business Communication & Cross-Cultural Management',
  },
  {
    id: 'fac-12',
    name: 'Prof. Jae-Won Kim',
    title: 'Adjunct Instructor of Statistics',
    department: 'Business Programs',
    departmentCategory: 'business',
    tenureStatus: 'adjunct',
    status: 'adjunct',
    email: 'jwkim@lincolnuca.edu',
    specialization: 'Business Statistics & Data Analysis',
  },
  {
    id: 'fac-13',
    name: 'Prof. Carlos Mendez',
    title: 'Adjunct Instructor of Accounting',
    department: 'Business Programs',
    departmentCategory: 'business',
    tenureStatus: 'adjunct',
    status: 'adjunct',
    email: 'cmendez@lincolnuca.edu',
    specialization: 'Managerial Accounting & Taxation',
  },
];

// =============================================================================
// DEPARTMENTS DATA
// =============================================================================

export const DEPARTMENTS: Department[] = [
  {
    id: 'dept-01',
    name: 'Business Programs',
    category: 'business',
    chairName: 'Dr. Themistoclis Pantos',
    facultyCount: 12,
    studentEnrollment: 230,
    programs: ['Business Administration', 'MBA', 'MS Finance', 'DBA', 'MS International Business'],
    status: 'active',
  },
  {
    id: 'dept-02',
    name: 'Diagnostic Imaging',
    category: 'professional',
    chairName: 'Ms. Marina Kay',
    facultyCount: 6,
    studentEnrollment: 80,
    programs: ['Diagnostic Medical Sonography'],
    status: 'active',
  },
  {
    id: 'dept-03',
    name: 'English Language Program',
    category: 'education',
    chairName: 'Ms. Maggie Hua',
    facultyCount: 4,
    studentEnrollment: 46,
    programs: ['Intensive English', 'Academic English', 'Business English'],
    status: 'active',
  },
];

// =============================================================================
// SENATE COMMITTEES DATA
// =============================================================================

export const SENATE_COMMITTEES: SenateCommittee[] = [
  {
    id: 'senate-01',
    name: 'Academic Standards',
    chair: 'Dr. Themistoclis Pantos',
    memberCount: 5,
    nextMeeting: '2026-04-08',
    status: 'active',
    recentActions: [
      'Confirmed minimum 2.6 GPA requirement for undergraduate admission',
      'Reviewed satisfactory academic progress policy for Spring 2026',
      'Approved attendance policy clarifications for hybrid courses',
    ],
  },
  {
    id: 'senate-02',
    name: 'Curriculum Review',
    chair: 'Dr. Mohamed Tailab',
    memberCount: 4,
    nextMeeting: '2026-04-15',
    status: 'active',
    recentActions: [
      'Approved updated DBA dissertation guidelines for 2026 cohort',
      'Reviewed MS International Business curriculum alignment with IACBE standards',
      'Recommended addition of ESG elective to MBA core sequence',
    ],
  },
  {
    id: 'senate-03',
    name: 'Faculty Affairs',
    chair: 'Dr. Alexander Anokhin',
    memberCount: 4,
    nextMeeting: '2026-04-22',
    status: 'active',
    recentActions: [
      'Updated adjunct onboarding checklist for Spring 2026 term',
      'Reviewed professional development fund allocation for full-time faculty',
    ],
  },
];

// =============================================================================
// ADMISSIONS SUMMARY DATA
// =============================================================================

export const ADMISSIONS_SUMMARY: AdmissionsSummary = {
  fallTarget: 120,
  totalPipeline: 156,
  acceptanceRate: 100,
  yieldRate: 72,
  deadline: 'Rolling',
};

// =============================================================================
// ADMISSIONS PIPELINE DATA
// =============================================================================

export const ADMISSIONS_PIPELINE: AdmissionsPipelineEntry[] = [
  { id: 'adm-01', name: 'Marcus Johnson', stage: 'Registered', programOfInterest: 'MBA', previousInstitution: 'San Francisco State University', gpa: 3.45, applicationDate: '2025-10-12', financialAidStatus: 'not_applicable' },
  { id: 'adm-02', name: 'Wei Chen', stage: 'Enrolled', programOfInterest: 'MS Finance', previousInstitution: 'Fudan University', gpa: 3.60, applicationDate: '2025-11-05', financialAidStatus: 'not_applicable' },
  { id: 'adm-03', name: 'Ji-Ho Park', stage: 'Deposited', programOfInterest: 'MBA', previousInstitution: 'Yonsei University', gpa: 3.35, applicationDate: '2025-09-28', financialAidStatus: 'not_applicable' },
  { id: 'adm-04', name: 'Priya Sharma', stage: 'Accepted', programOfInterest: 'MS International Business', previousInstitution: 'University of Mumbai', gpa: 3.20, applicationDate: '2025-12-10', financialAidStatus: 'not_applicable' },
  { id: 'adm-05', name: 'Emeka Okonkwo', stage: 'Accepted', programOfInterest: 'DBA', previousInstitution: 'Lagos Business School', gpa: 3.55, applicationDate: '2025-11-20', financialAidStatus: 'not_applicable' },
  { id: 'adm-06', name: 'Gabriel Silva', stage: 'Applied', programOfInterest: 'MBA', previousInstitution: 'Universidade de São Paulo', gpa: 3.10, applicationDate: '2026-01-08', financialAidStatus: 'not_applied' },
  { id: 'adm-07', name: 'Linh Nguyen', stage: 'Applied', programOfInterest: 'Business Administration', previousInstitution: 'Hanoi University of Science & Technology', gpa: 2.95, applicationDate: '2026-01-14', financialAidStatus: 'not_applied' },
  { id: 'adm-08', name: 'Maria Gonzalez', stage: 'Applied', programOfInterest: 'MS Finance', previousInstitution: 'East Bay Community College', gpa: 3.30, applicationDate: '2026-01-20', financialAidStatus: 'not_applied' },
  { id: 'adm-09', name: 'David Kim', stage: 'Inquiry', programOfInterest: 'MBA', previousInstitution: 'UC Berkeley Extension', gpa: 3.15, applicationDate: '2026-02-03', financialAidStatus: 'not_applied' },
  { id: 'adm-10', name: 'Aisha Washington', stage: 'Inquiry', programOfInterest: 'Business Administration', previousInstitution: 'Laney College', gpa: 2.70, applicationDate: '2026-02-08', financialAidStatus: 'not_applied' },
  { id: 'adm-11', name: 'Yuki Tanaka', stage: 'Inquiry', programOfInterest: 'MS International Business', previousInstitution: 'Keio University', gpa: 3.40, applicationDate: '2026-02-12', financialAidStatus: 'not_applied' },
  { id: 'adm-12', name: 'Omar Hassan', stage: 'Deposited', programOfInterest: 'DBA', previousInstitution: 'American University in Cairo', gpa: 3.70, applicationDate: '2025-10-30', financialAidStatus: 'not_applicable' },
  { id: 'adm-13', name: 'Sofia Reyes', stage: 'Enrolled', programOfInterest: 'MBA', previousInstitution: 'UC Davis', gpa: 3.25, applicationDate: '2025-09-15', financialAidStatus: 'not_applicable' },
  { id: 'adm-14', name: 'Kwame Asante', stage: 'Registered', programOfInterest: 'MS Finance', previousInstitution: 'University of Ghana', gpa: 3.50, applicationDate: '2025-08-28', financialAidStatus: 'not_applicable' },
  { id: 'adm-15', name: 'Natasha Ivanova', stage: 'Accepted', programOfInterest: 'MBA', previousInstitution: 'Moscow State University', gpa: 3.45, applicationDate: '2025-12-18', financialAidStatus: 'not_applicable' },
];

// =============================================================================
// ACADEMIC PROGRAMS DATA (for Admissions Programs view)
// =============================================================================

export const ACADEMIC_PROGRAMS: AcademicProgram[] = [
  { id: 'aprog-01', name: 'Business Administration', degreeType: 'B.A.', level: 'undergraduate', department: 'Business Programs', enrollment: 82, acceptanceRate: 100, avgIncomingGPA: 2.6, status: 'open', enrollmentStatus: 'open' },
  { id: 'aprog-02', name: 'Diagnostic Medical Sonography', degreeType: 'B.S.', level: 'undergraduate', department: 'Diagnostic Imaging', enrollment: 58, acceptanceRate: 100, avgIncomingGPA: 2.8, status: 'open', enrollmentStatus: 'open' },
  { id: 'aprog-03', name: 'MBA', degreeType: 'M.B.A.', level: 'graduate', department: 'Business Programs', enrollment: 95, acceptanceRate: 100, avgIncomingGPA: 3.0, status: 'open', enrollmentStatus: 'open' },
  { id: 'aprog-04', name: 'MS International Business & Finance Management', degreeType: 'M.S.', level: 'graduate', department: 'Business Programs', enrollment: 68, acceptanceRate: 100, avgIncomingGPA: 3.1, status: 'open', enrollmentStatus: 'open' },
  { id: 'aprog-05', name: 'MS Finance', degreeType: 'M.S.', level: 'graduate', department: 'Business Programs', enrollment: 48, acceptanceRate: 100, avgIncomingGPA: 3.2, status: 'open', enrollmentStatus: 'open' },
  { id: 'aprog-06', name: 'DBA', degreeType: 'Ed.D.', level: 'graduate', department: 'Business Programs', enrollment: 35, acceptanceRate: 100, avgIncomingGPA: 3.5, status: 'open', enrollmentStatus: 'open' },
  { id: 'aprog-07', name: 'English Language Program', degreeType: 'Certificate', level: 'undergraduate', department: 'English Language Program', enrollment: 50, acceptanceRate: 100, avgIncomingGPA: 0, status: 'open', enrollmentStatus: 'open' },
];

// =============================================================================
// OUTREACH EVENTS DATA
// =============================================================================

export const OUTREACH_EVENTS: OutreachEvent[] = [
  { id: 'out-01', name: 'Oakland Technical HS Visit', date: '2026-04-07', type: 'high_school_visit', targetAudience: 'Juniors & Seniors', recruiterName: 'Maggie Hua', status: 'scheduled' },
  { id: 'out-02', name: 'Bay Area International Education Fair', date: '2026-04-18', type: 'college_fair', targetAudience: 'International Students & Families', recruiterName: 'Carlos Rivera', status: 'scheduled' },
  { id: 'out-03', name: 'Lincoln Spring Open House', date: '2026-04-25', type: 'open_house', targetAudience: 'Prospective Students & Families', recruiterName: 'Maggie Hua', status: 'scheduled' },
  { id: 'out-04', name: 'Virtual Info Session — MBA Program', date: '2026-04-02', type: 'virtual_info_session', targetAudience: 'Working Professionals', recruiterName: 'Reenu Shrestha', status: 'scheduled' },
  { id: 'out-05', name: 'Oakland Community College Fair', date: '2026-05-02', type: 'community_event', targetAudience: 'Community Members & Transfer Students', recruiterName: 'Carlos Rivera', status: 'scheduled' },
  { id: 'out-06', name: 'Fremont HS Visit', date: '2026-02-17', type: 'high_school_visit', targetAudience: 'Seniors', leadsGenerated: 14, recruiterName: 'Maggie Hua', status: 'completed' },
  { id: 'out-07', name: 'SF Bay Area College Fair', date: '2026-02-07', type: 'college_fair', targetAudience: 'High School & Transfer Students', leadsGenerated: 38, recruiterName: 'Carlos Rivera', status: 'completed' },
  { id: 'out-08', name: 'Virtual Info Session — DBA Program', date: '2026-01-28', type: 'virtual_info_session', targetAudience: 'Graduate-Level Professionals', leadsGenerated: 11, recruiterName: 'Reenu Shrestha', status: 'completed' },
];

// =============================================================================
// FACULTY & ADMISSIONS HELPERS
// =============================================================================

export function getStageCount(stage: AdmissionsStage): number {
  return ADMISSIONS_PIPELINE.filter((e) => e.stage === stage).length;
}

export function getStageColor(stage: AdmissionsStage): string {
  return ADMISSIONS_STAGES.find((s) => s.key === stage)?.color ?? '#9C9790';
}

// =============================================================================
// INSTITUTIONAL METRICS — 6 KPIs for the 2x3 grid
// =============================================================================

export const INSTITUTIONAL_METRICS = {
  enrollment: { value: 436, trend: '+1.9%', status: 'green' as const },
  retention: { value: '89%', trend: '+2%', status: 'green' as const },
  graduationRate: { value4yr: '69%', value6yr: '81%', status: 'green' as const },
  studentFacultyRatio: { value: '15:1', status: 'green' as const },
  avgGPA: { value: '3.10', status: 'green' as const },
  financialHealth: { endowment: 'Not Disclosed', revenueTarget: '94%', status: 'green' as const },
};

// =============================================================================
// SCHOOL HEALTH — per-school summary with alerts
// =============================================================================

export interface SchoolHealth {
  name: string;
  programCount: number;
  enrolledStudents: number;
  avgGPA: number;
  facultyCount: number;
  alerts: string[];
}

export const SCHOOL_HEALTH: SchoolHealth[] = [
  {
    name: 'Business Programs',
    programCount: 5,
    enrolledStudents: 278,
    avgGPA: 3.08,
    facultyCount: 12,
    alerts: ['WSCUC review June 2026 — self-study in progress'],
  },
  {
    name: 'Diagnostic Imaging',
    programCount: 1,
    enrolledStudents: 80,
    avgGPA: 3.15,
    facultyCount: 6,
    alerts: [],
  },
  {
    name: 'English Language Program',
    programCount: 3,
    enrolledStudents: 46,
    avgGPA: 0,
    facultyCount: 4,
    alerts: [],
  },
];

// =============================================================================
// DOMAIN CARD SUMMARY DATA
// =============================================================================

export const STUDENT_SUCCESS_SUMMARY = { atRiskCount: 8, interventionRate: 88, probationCount: 3, earlyAlertCount: 12 };
export const CAMPUS_LIFE_SUMMARY = { activeOrgs: 4, nextCampusEvent: 'Spring Recess · Mar 17–21', housingOccupancy: 'Off-campus', diningEnrollment: 0 };
export const ADVANCEMENT_SUMMARY = { annualGivingTotal: 0, goal: 0, majorGiftProspects: 0, prospectThreshold: 'N/A' };
export const ACCREDITATION_SUMMARY = { status: 'WSCUC — Accredited through June 2026', nextMilestone: 'Reaccreditation Review due June 26, 2026', selfStudyProgress: '78%' };
