/**
 * Mock Education Home Data — KaNeXT (KaNeXT Sports)
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
  academic: '#1D9BF0',
  campus_life: '#1D9BF0',
  athletics: '#EF4444',
  administrative: '#A1A1AA',
  accreditation: '#F59E0B',
};

// =============================================================================
// EVENTS DATA
// =============================================================================

export const EDU_EVENTS: EduEvent[] = [
  {
    id: 'evt-01',
    title: 'Spring 2026 Convocation',
    date: 'Feb 24, 2026',
    time: '10:00 AM',
    location: 'Lou Rawls Performing Arts Center',
    category: 'academic',
    status: 'upcoming',
    speaker: 'President Jaffus Hardrick',
    instructor: 'President Jaffus Hardrick',
    seriesName: 'University Convocation Series',
  },
  {
    id: 'evt-02',
    title: 'HBCU Career & Internship Fair',
    date: 'Mar 5, 2026',
    time: '11:00 AM',
    location: 'Student Center Ballroom',
    category: 'campus_life',
    status: 'upcoming',
  },
  {
    id: 'evt-03',
    title: 'SACS-COC Accreditation Review',
    date: 'Mar 18, 2026',
    time: '9:00 AM',
    location: 'Administration Building',
    category: 'accreditation',
    status: 'upcoming',
    speaker: 'Dr. Angela Morris',
    instructor: 'Dr. Angela Morris',
    seriesName: 'Accreditation Review Series',
  },
  {
    id: 'evt-04',
    title: 'Baseball vs Evergreen',
    date: 'Mar 1, 2026',
    time: '2:00 PM',
    location: 'KaNeXT Baseball Complex',
    category: 'athletics',
    status: 'upcoming',
  },
  {
    id: 'evt-05',
    title: 'Faculty Senate Meeting',
    date: 'Feb 28, 2026',
    time: '3:00 PM',
    location: 'Board Room, Admin Building',
    category: 'administrative',
    status: 'upcoming',
    instructor: 'Dr. Patricia Nkomo',
    seriesName: 'Faculty Senate',
  },
  {
    id: 'evt-06',
    title: 'Fall 2025 Commencement',
    date: 'Dec 12, 2025',
    time: '10:00 AM',
    location: 'Lou Rawls Performing Arts Center',
    category: 'academic',
    status: 'completed',
    attendance: 1420,
    outcome: '187 degrees conferred',
  },
  {
    id: 'evt-07',
    title: 'Homecoming Week Kickoff',
    date: 'Oct 20, 2025',
    time: '6:00 PM',
    location: 'Campus Quad',
    category: 'campus_life',
    status: 'completed',
    attendance: 2100,
    outcome: 'Record attendance',
  },
  {
    id: 'evt-08',
    title: 'Title III Compliance Audit',
    date: 'Nov 14, 2025',
    time: '9:00 AM',
    location: 'Administration Building',
    category: 'accreditation',
    status: 'completed',
    outcome: 'Passed with no findings',
  },
  {
    id: 'evt-09',
    title: 'KaNeXT Football vs Pinecrest',
    date: 'Nov 8, 2025',
    time: '6:00 PM',
    location: 'Nathaniel "Traz" Powell Stadium',
    category: 'athletics',
    status: 'completed',
    attendance: 3200,
    outcome: 'W 28-14',
  },
  {
    id: 'evt-10',
    title: 'Budget Review Committee',
    date: 'Jan 22, 2026',
    time: '2:00 PM',
    location: 'Board Room, Admin Building',
    category: 'administrative',
    status: 'completed',
    outcome: 'FY2026 budget approved',
  },
];

// =============================================================================
// CALENDAR EVENTS (for CalendarHub — ProgramCalendarEvent format)
// =============================================================================

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

function parseDateString(dateStr: string): string {
  // Convert "Feb 24, 2026" to "2026-02-24"
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '2026-02-24';
  return d.toISOString().split('T')[0];
}

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
  campus: '#1D9BF0',
  student: '#1D9BF0',
  faculty: '#22C55E',
  alumni: '#F59E0B',
  athletics: '#EF4444',
  institutional: '#A1A1AA',
};

export const EDU_NEWS: EduNewsItem[] = [
  {
    id: 'news-01',
    headline: 'KaNeXT Receives $2.5M Grant for STEM Building Expansion',
    date: 'Feb 15, 2026',
    category: 'institutional',
    type: 'article',
    summary: 'The Department of Education has awarded KaNeXT Sports a $2.5 million grant for the construction of a new STEM wing.',
  },
  {
    id: 'news-02',
    headline: 'Student Government Announces Spring Elections',
    date: 'Feb 12, 2026',
    category: 'student',
    type: 'article',
    summary: 'SGA elections for the 2026-27 academic year will open March 15 with five contested positions.',
  },
  {
    id: 'news-03',
    headline: 'Dr. Hardrick Keynote: The Future of HBCUs',
    date: 'Feb 10, 2026',
    category: 'faculty',
    type: 'video',
    duration: '18:32',
    speaker: 'President Jaffus Hardrick',
    summary: 'President Hardrick delivered a powerful keynote on the evolving role of HBCUs in American higher education.',
  },
  {
    id: 'news-04',
    headline: 'KaNeXT Baseball Opens Season with Win Streak',
    date: 'Feb 8, 2026',
    category: 'athletics',
    type: 'video',
    duration: '4:15',
    summary: 'The Wolves baseball team started the 2026 season with three consecutive wins, highlighted by a no-hitter from freshman pitcher Darius Cole.',
  },
  {
    id: 'news-05',
    headline: 'Alumni Spotlight: Class of 2015 Entrepreneur Raises $10M',
    date: 'Feb 5, 2026',
    category: 'alumni',
    type: 'article',
    summary: 'KaNeXT alumna Keisha Thompson (Class of 2015) has raised a $10M Series A for her EdTech startup, crediting her KaNeXT education.',
  },
  {
    id: 'news-06',
    headline: 'Campus Safety Upgrades: New Emergency Systems Installed',
    date: 'Feb 3, 2026',
    category: 'campus',
    type: 'article',
    summary: 'KaNeXT has completed installation of 24 new emergency call stations and upgraded campus-wide lighting.',
  },
  {
    id: 'news-07',
    headline: 'Spring Semester Welcome Week Highlights',
    date: 'Jan 28, 2026',
    category: 'student',
    type: 'video',
    duration: '6:45',
    summary: 'A recap of Welcome Week featuring live performances, club fairs, and a record-setting attendance at the student cookout.',
  },
  {
    id: 'news-08',
    headline: 'Faculty Research: New Climate Study Published in Nature',
    date: 'Jan 20, 2026',
    category: 'faculty',
    type: 'article',
    speaker: 'Dr. Raymond Fields',
    summary: 'Dr. Fields and his team published a groundbreaking study on urban heat islands in South Ridgemont HBCUs.',
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
  currentTotal: 1285,
  target: 1400,
  retentionRate: 0.72,
  byClassYear: [
    { label: 'Freshman', count: 410, color: '#1D9BF0' },
    { label: 'Sophomore', count: 320, color: '#1D9BF0' },
    { label: 'Junior', count: 275, color: '#22C55E' },
    { label: 'Senior', count: 215, color: '#F59E0B' },
    { label: 'Graduate', count: 65, color: '#EF4444' },
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
  avgGpa: 2.94,
  graduationRate4yr: 0.31,
  graduationRate6yr: 0.42,
  facultyStudentRatio: '1:14',
  accreditationStatus: 'SACS-COC Accredited',
  nextAccreditationReview: 'March 2026',
  topPrograms: [
    { name: 'Business Administration', enrollment: 185 },
    { name: 'Criminal Justice', enrollment: 142 },
    { name: 'Biology', enrollment: 128 },
    { name: 'Psychology', enrollment: 115 },
    { name: 'Computer Science', enrollment: 98 },
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
  tuitionRevenue: 18_500_000,
  aidDisbursed: 12_200_000,
  endowment: 8_400_000,
  operatingBudget: 42_000_000,
  titleIVStatus: 'Compliant',
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
  title: 'KaNeXT Spring 2026 Convocation',
  subtitle: 'Lou Rawls Performing Arts Center',
  isLive: false,
  instructor: 'President Jaffus Hardrick',
};

export interface EduCommerceItem {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export const EDU_COMMERCE: EduCommerceItem[] = [
  { id: 'apply', label: 'Apply Now', icon: 'doc.text.fill', color: '#1D9BF0' },
  { id: 'catalog', label: 'Course Catalog', icon: 'book.fill', color: '#1D9BF0' },
  { id: 'aid', label: 'Financial Aid', icon: 'dollarsign.circle.fill', color: '#22C55E' },
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
  arts_sciences: '#1D9BF0',
  business: '#F59E0B',
  education: '#22C55E',
  professional: '#1D9BF0',
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
  financialAidStatus: 'approved' | 'pending' | 'not_applied' | 'denied';
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
  { key: 'Inquiry', label: 'Inquiry', color: '#A1A1AA' },
  { key: 'Applied', label: 'Applied', color: '#1D9BF0' },
  { key: 'Accepted', label: 'Accepted', color: '#1D9BF0' },
  { key: 'Deposited', label: 'Deposited', color: '#F59E0B' },
  { key: 'Enrolled', label: 'Enrolled', color: '#22C55E' },
  { key: 'Registered', label: 'Registered', color: '#22C55E' },
];

// =============================================================================
// FACULTY MEMBERS DATA
// =============================================================================

export const FACULTY_MEMBERS: FacultyMember[] = [
  {
    id: 'fac-01',
    name: 'Dr. Angela Morris',
    title: 'Professor of Education',
    department: 'School of Education',
    departmentCategory: 'education',
    tenureStatus: 'tenured',
    status: 'active',
    email: 'a.morris@kanext.edu',
    officeHours: 'Mon/Wed 2:00-4:00 PM',
    specialization: 'Curriculum & Instruction',
  },
  {
    id: 'fac-02',
    name: 'Prof. David Osei',
    title: 'Associate Professor of Business',
    department: 'School of Business',
    departmentCategory: 'business',
    tenureStatus: 'tenure_track',
    status: 'active',
    email: 'd.osei@kanext.edu',
    officeHours: 'Tue/Thu 10:00 AM-12:00 PM',
    specialization: 'Sports Management',
  },
  {
    id: 'fac-03',
    name: 'Prof. Linda Reyes',
    title: 'Associate Professor of Kinesiology',
    department: 'Health Sciences',
    departmentCategory: 'professional',
    tenureStatus: 'tenure_track',
    status: 'active',
    email: 'l.reyes@kanext.edu',
    officeHours: 'Mon/Wed 1:00-3:00 PM',
    specialization: 'Biomechanics',
  },
  {
    id: 'fac-04',
    name: 'Dr. James Whitfield',
    title: 'Professor of Biology',
    department: 'Arts & Sciences',
    departmentCategory: 'arts_sciences',
    tenureStatus: 'tenured',
    status: 'active',
    email: 'j.whitfield@kanext.edu',
    officeHours: 'Tue/Thu 3:00-5:00 PM',
    specialization: 'Molecular Biology',
  },
  {
    id: 'fac-05',
    name: 'Dr. Patricia Nkomo',
    title: 'Professor of English',
    department: 'Arts & Sciences',
    departmentCategory: 'arts_sciences',
    tenureStatus: 'tenured',
    status: 'active',
    email: 'p.nkomo@kanext.edu',
    officeHours: 'Mon/Fri 10:00 AM-12:00 PM',
    specialization: 'African-American Literature',
  },
  {
    id: 'fac-06',
    name: 'Mr. Carlos Rivera',
    title: 'Adjunct Instructor of Mathematics',
    department: 'Arts & Sciences',
    departmentCategory: 'arts_sciences',
    tenureStatus: 'adjunct',
    status: 'adjunct',
    email: 'c.rivera@kanext.edu',
    specialization: 'Applied Statistics',
  },
  {
    id: 'fac-07',
    name: 'Dr. Evelyn Harper',
    title: 'Professor of Nursing',
    department: 'Health Sciences',
    departmentCategory: 'professional',
    tenureStatus: 'tenured',
    status: 'active',
    email: 'e.harper@kanext.edu',
    officeHours: 'Wed/Fri 9:00-11:00 AM',
    specialization: 'Community Health Nursing',
  },
  {
    id: 'fac-08',
    name: 'Dr. Marcus Bell',
    title: 'Assistant Professor of Criminal Justice',
    department: 'Professional Studies',
    departmentCategory: 'professional',
    tenureStatus: 'tenure_track',
    status: 'active',
    email: 'm.bell@kanext.edu',
    officeHours: 'Tue/Thu 1:00-3:00 PM',
    specialization: 'Forensic Psychology',
  },
  {
    id: 'fac-09',
    name: 'Ms. Karen Mitchell',
    title: 'Administrative Coordinator',
    department: 'Academic Affairs',
    departmentCategory: 'education',
    tenureStatus: 'staff',
    status: 'active',
    email: 'k.mitchell@kanext.edu',
  },
  {
    id: 'fac-10',
    name: 'Dr. Robert Chambers',
    title: 'Professor of Accounting',
    department: 'School of Business',
    departmentCategory: 'business',
    tenureStatus: 'tenured',
    status: 'sabbatical',
    email: 'r.chambers@kanext.edu',
    specialization: 'Forensic Accounting',
  },
  {
    id: 'fac-11',
    name: 'Dr. Yolanda Grant',
    title: 'Associate Professor of Psychology',
    department: 'Arts & Sciences',
    departmentCategory: 'arts_sciences',
    tenureStatus: 'tenure_track',
    status: 'active',
    email: 'y.grant@kanext.edu',
    officeHours: 'Mon/Wed 11:00 AM-1:00 PM',
    specialization: 'Developmental Psychology',
  },
  {
    id: 'fac-12',
    name: 'Prof. Samuel Adeyemi',
    title: 'Adjunct Instructor of Computer Science',
    department: 'Arts & Sciences',
    departmentCategory: 'arts_sciences',
    tenureStatus: 'adjunct',
    status: 'adjunct',
    email: 's.adeyemi@kanext.edu',
    specialization: 'Cybersecurity',
  },
  {
    id: 'fac-13',
    name: 'Dr. Diane Foster',
    title: 'Professor of Social Work',
    department: 'Professional Studies',
    departmentCategory: 'professional',
    tenureStatus: 'tenured',
    status: 'on_leave',
    email: 'd.foster@kanext.edu',
    specialization: 'Family Therapy',
  },
  {
    id: 'fac-14',
    name: 'Dr. Terrence Jackson',
    title: 'Dean of Education',
    department: 'School of Education',
    departmentCategory: 'education',
    tenureStatus: 'tenured',
    status: 'active',
    email: 't.jackson@kanext.edu',
    officeHours: 'By appointment',
    specialization: 'Educational Leadership',
  },
  {
    id: 'fac-15',
    name: 'Ms. Andrea Collins',
    title: 'Adjunct Instructor of Music',
    department: 'Arts & Sciences',
    departmentCategory: 'arts_sciences',
    tenureStatus: 'adjunct',
    status: 'adjunct',
    email: 'a.collins@kanext.edu',
    specialization: 'Music Theory & Performance',
  },
];

// =============================================================================
// DEPARTMENTS DATA
// =============================================================================

export const DEPARTMENTS: Department[] = [
  {
    id: 'dept-01',
    name: 'Arts & Sciences',
    category: 'arts_sciences',
    chairName: 'Dr. James Whitfield',
    facultyCount: 18,
    studentEnrollment: 420,
    programs: ['Biology', 'English', 'Mathematics', 'Psychology', 'Computer Science', 'Music'],
    status: 'active',
  },
  {
    id: 'dept-02',
    name: 'School of Business',
    category: 'business',
    chairName: 'Dr. Robert Chambers',
    facultyCount: 12,
    studentEnrollment: 310,
    programs: ['Accounting', 'Sports Management', 'Business Administration', 'Marketing'],
    status: 'active',
  },
  {
    id: 'dept-03',
    name: 'School of Education',
    category: 'education',
    chairName: 'Dr. Terrence Jackson',
    facultyCount: 14,
    studentEnrollment: 280,
    programs: ['Elementary Education', 'Secondary Education', 'Curriculum & Instruction', 'Educational Leadership'],
    status: 'active',
  },
  {
    id: 'dept-04',
    name: 'Health Sciences',
    category: 'professional',
    chairName: 'Dr. Evelyn Harper',
    facultyCount: 10,
    studentEnrollment: 245,
    programs: ['Nursing', 'Kinesiology', 'Public Health'],
    status: 'active',
  },
  {
    id: 'dept-05',
    name: 'Professional Studies',
    category: 'professional',
    chairName: 'Dr. Marcus Bell',
    facultyCount: 8,
    studentEnrollment: 195,
    programs: ['Criminal Justice', 'Social Work', 'Public Administration'],
    status: 'under_review',
  },
];

// =============================================================================
// SENATE COMMITTEES DATA
// =============================================================================

export const SENATE_COMMITTEES: SenateCommittee[] = [
  {
    id: 'senate-01',
    name: 'Academic Standards',
    chair: 'Dr. Patricia Nkomo',
    memberCount: 9,
    nextMeeting: '2026-02-25',
    status: 'active',
    recentActions: [
      'Approved revised GPA requirement for Dean\'s List (3.5 minimum)',
      'Reviewed grade appeal process timeline — shortened to 10 business days',
      'Tabled discussion on pass/fail policy expansion to Spring 2026',
    ],
  },
  {
    id: 'senate-02',
    name: 'Curriculum Review',
    chair: 'Dr. Angela Morris',
    memberCount: 11,
    nextMeeting: '2026-03-04',
    status: 'active',
    recentActions: [
      'Approved new B.S. in Data Analytics program for Fall 2026 launch',
      'Recommended consolidation of ENG-101 and ENG-102 into single 4-credit course',
      'Reviewed cross-listing policy for interdisciplinary courses',
    ],
  },
  {
    id: 'senate-03',
    name: 'Faculty Affairs',
    chair: 'Dr. James Whitfield',
    memberCount: 7,
    nextMeeting: '2026-02-20',
    status: 'active',
    recentActions: [
      'Updated tenure review timeline — dossiers due by October 1 annually',
      'Approved new mentorship program pairing junior and senior faculty',
    ],
  },
  {
    id: 'senate-04',
    name: 'Budget & Planning',
    chair: 'Dr. Robert Chambers',
    memberCount: 6,
    nextMeeting: '2026-03-11',
    status: 'active',
    recentActions: [
      'Endorsed FY27 budget priorities: faculty hiring and lab upgrades',
      'Reviewed departmental allocation model for equity adjustments',
    ],
  },
  {
    id: 'senate-05',
    name: 'Student Success Task Force',
    chair: 'Dr. Yolanda Grant',
    memberCount: 8,
    nextMeeting: '2026-02-27',
    status: 'ad_hoc',
    recentActions: [
      'Piloted early-alert system for at-risk freshmen — 120 students flagged',
      'Proposed peer tutoring expansion in STEM courses',
    ],
  },
  {
    id: 'senate-06',
    name: 'Diversity & Inclusion',
    chair: 'Dr. Diane Foster',
    memberCount: 5,
    nextMeeting: '',
    status: 'inactive',
    recentActions: [
      'Published annual diversity report (AY 2024-25)',
      'Chair on medical leave — committee paused until Spring 2026',
    ],
  },
];

// =============================================================================
// ADMISSIONS SUMMARY DATA
// =============================================================================

export const ADMISSIONS_SUMMARY: AdmissionsSummary = {
  fallTarget: 350,
  totalPipeline: 892,
  acceptanceRate: 64,
  yieldRate: 38,
  deadline: '2026-05-01',
};

// =============================================================================
// ADMISSIONS PIPELINE DATA
// =============================================================================

export const ADMISSIONS_PIPELINE: AdmissionsPipelineEntry[] = [
  { id: 'adm-01', name: 'Tiana Brooks', stage: 'Registered', programOfInterest: 'Nursing', previousInstitution: 'Metro Community College', gpa: 3.72, applicationDate: '2025-10-15', financialAidStatus: 'approved' },
  { id: 'adm-02', name: 'Darius Washington', stage: 'Enrolled', programOfInterest: 'Business Administration', previousInstitution: 'Riverside Community College', gpa: 3.45, applicationDate: '2025-11-02', financialAidStatus: 'approved' },
  { id: 'adm-03', name: 'Jasmine Lee', stage: 'Deposited', programOfInterest: 'Biology', previousInstitution: 'Westside Prep HS', gpa: 3.88, applicationDate: '2025-09-20', financialAidStatus: 'pending' },
  { id: 'adm-04', name: 'Xavier Green', stage: 'Accepted', programOfInterest: 'Sports Management', previousInstitution: 'Central Prep HS', gpa: 3.15, applicationDate: '2025-12-01', financialAidStatus: 'approved' },
  { id: 'adm-05', name: 'Brianna Sanchez', stage: 'Accepted', programOfInterest: 'Psychology', previousInstitution: 'Eastside Academy', gpa: 3.62, applicationDate: '2025-11-18', financialAidStatus: 'pending' },
  { id: 'adm-06', name: 'Alex Morgan', stage: 'Applied', programOfInterest: 'Criminal Justice', previousInstitution: 'Northview Prep HS', gpa: 2.95, applicationDate: '2026-01-08', financialAidStatus: 'not_applied' },
  { id: 'adm-07', name: 'Aaliyah Jenkins', stage: 'Applied', programOfInterest: 'Elementary Education', previousInstitution: 'Northview Prep HS', gpa: 3.38, applicationDate: '2026-01-15', financialAidStatus: 'pending' },
  { id: 'adm-08', name: 'DeShawn Harris', stage: 'Applied', programOfInterest: 'Computer Science', previousInstitution: 'Southside Prep HS', gpa: 3.50, applicationDate: '2026-01-22', financialAidStatus: 'not_applied' },
  { id: 'adm-09', name: 'Imani Davis', stage: 'Inquiry', programOfInterest: 'Nursing', previousInstitution: 'Miramar HS', gpa: 3.20, applicationDate: '2026-02-01', financialAidStatus: 'not_applied' },
  { id: 'adm-10', name: 'Kevin Patterson', stage: 'Inquiry', programOfInterest: 'Music', previousInstitution: 'Homestead Senior HS', gpa: 2.80, applicationDate: '2026-02-05', financialAidStatus: 'not_applied' },
  { id: 'adm-11', name: 'Destiny Moore', stage: 'Inquiry', programOfInterest: 'Public Health', previousInstitution: 'Central Academy HS', gpa: 3.10, applicationDate: '2026-02-10', financialAidStatus: 'not_applied' },
  { id: 'adm-12', name: 'Andre Williams', stage: 'Deposited', programOfInterest: 'Accounting', previousInstitution: 'Coconut Creek HS', gpa: 3.55, applicationDate: '2025-10-28', financialAidStatus: 'approved' },
  { id: 'adm-13', name: 'Kayla Robinson', stage: 'Enrolled', programOfInterest: 'Social Work', previousInstitution: 'Bethune-Cookman Univ.', gpa: 3.30, applicationDate: '2025-09-10', financialAidStatus: 'approved' },
  { id: 'adm-14', name: 'Tyrone Brown', stage: 'Registered', programOfInterest: 'Kinesiology', previousInstitution: 'Everglades HS', gpa: 3.40, applicationDate: '2025-08-25', financialAidStatus: 'approved' },
  { id: 'adm-15', name: 'Shaniqua Taylor', stage: 'Accepted', programOfInterest: 'Marketing', previousInstitution: 'Pembroke Pines Charter HS', gpa: 3.25, applicationDate: '2025-12-12', financialAidStatus: 'not_applied' },
];

// =============================================================================
// ACADEMIC PROGRAMS DATA (for Admissions Programs view)
// =============================================================================

export const ACADEMIC_PROGRAMS: AcademicProgram[] = [
  { id: 'aprog-01', name: 'Biology', degreeType: 'B.S.', level: 'undergraduate', department: 'Arts & Sciences', enrollment: 120, acceptanceRate: 72, avgIncomingGPA: 3.45, status: 'open', enrollmentStatus: 'open' },
  { id: 'aprog-02', name: 'Business Administration', degreeType: 'B.S.', level: 'undergraduate', department: 'School of Business', enrollment: 145, acceptanceRate: 68, avgIncomingGPA: 3.20, status: 'open', enrollmentStatus: 'open' },
  { id: 'aprog-03', name: 'Nursing', degreeType: 'B.S.', level: 'undergraduate', department: 'Health Sciences', enrollment: 85, acceptanceRate: 42, avgIncomingGPA: 3.65, status: 'waitlisted', enrollmentStatus: 'waitlist' },
  { id: 'aprog-04', name: 'Elementary Education', degreeType: 'B.A.', level: 'undergraduate', department: 'School of Education', enrollment: 78, acceptanceRate: 75, avgIncomingGPA: 3.30, status: 'open', enrollmentStatus: 'open' },
  { id: 'aprog-05', name: 'Criminal Justice', degreeType: 'B.S.', level: 'undergraduate', department: 'Professional Studies', enrollment: 95, acceptanceRate: 80, avgIncomingGPA: 3.05, status: 'open', enrollmentStatus: 'open' },
  { id: 'aprog-06', name: 'Sports Management', degreeType: 'B.S.', level: 'undergraduate', department: 'School of Business', enrollment: 65, acceptanceRate: 70, avgIncomingGPA: 3.15, status: 'open', enrollmentStatus: 'open' },
  { id: 'aprog-07', name: 'Psychology', degreeType: 'B.A.', level: 'undergraduate', department: 'Arts & Sciences', enrollment: 110, acceptanceRate: 74, avgIncomingGPA: 3.35, status: 'open', enrollmentStatus: 'open' },
  { id: 'aprog-08', name: 'Computer Science', degreeType: 'B.S.', level: 'undergraduate', department: 'Arts & Sciences', enrollment: 55, acceptanceRate: 60, avgIncomingGPA: 3.50, status: 'open', enrollmentStatus: 'open' },
  { id: 'aprog-09', name: 'Educational Leadership', degreeType: 'Ed.D.', level: 'graduate', department: 'School of Education', enrollment: 28, acceptanceRate: 35, avgIncomingGPA: 3.60, status: 'open', enrollmentStatus: 'open' },
  { id: 'aprog-10', name: 'MBA — Healthcare Administration', degreeType: 'M.B.A.', level: 'graduate', department: 'School of Business', enrollment: 32, acceptanceRate: 45, avgIncomingGPA: 3.40, status: 'open', enrollmentStatus: 'open' },
  { id: 'aprog-11', name: 'Public Health', degreeType: 'M.S.', level: 'graduate', department: 'Health Sciences', enrollment: 22, acceptanceRate: 50, avgIncomingGPA: 3.55, status: 'closed', enrollmentStatus: 'closed' },
  { id: 'aprog-12', name: 'Business Foundations Certificate', degreeType: 'Certificate', level: 'online', department: 'School of Business', enrollment: 40, acceptanceRate: 90, avgIncomingGPA: 2.80, status: 'open', enrollmentStatus: 'open' },
  { id: 'aprog-13', name: 'Data Analytics Certificate', degreeType: 'Certificate', level: 'online', department: 'Arts & Sciences', enrollment: 18, acceptanceRate: 85, avgIncomingGPA: 3.10, status: 'open', enrollmentStatus: 'open' },
];

// =============================================================================
// OUTREACH EVENTS DATA
// =============================================================================

export const OUTREACH_EVENTS: OutreachEvent[] = [
  { id: 'out-01', name: 'Central Prep HS Visit', date: '2026-02-24', type: 'high_school_visit', targetAudience: 'Juniors & Seniors', recruiterName: 'Tamika Johnson', status: 'scheduled' },
  { id: 'out-02', name: 'South Ridgemont College Fair', date: '2026-03-05', type: 'college_fair', targetAudience: 'High School Students', recruiterName: 'Derek Williams', status: 'scheduled' },
  { id: 'out-03', name: 'KaNeXT Spring Open House', date: '2026-03-15', type: 'open_house', targetAudience: 'Prospective Students & Families', recruiterName: 'Tamika Johnson', status: 'scheduled' },
  { id: 'out-04', name: 'Virtual Info Session — Nursing Program', date: '2026-02-28', type: 'virtual_info_session', targetAudience: 'Pre-Nursing Students', recruiterName: 'Alicia Green', status: 'scheduled' },
  { id: 'out-05', name: 'Overtown Community Day', date: '2026-03-22', type: 'community_event', targetAudience: 'Community Members & Adult Learners', recruiterName: 'Marcus Reid', status: 'scheduled' },
  { id: 'out-06', name: 'Northview Prep HS Visit', date: '2026-02-10', type: 'high_school_visit', targetAudience: 'Seniors', leadsGenerated: 18, recruiterName: 'Derek Williams', status: 'completed' },
  { id: 'out-07', name: 'Metro Area College Fair', date: '2026-02-01', type: 'college_fair', targetAudience: 'High School Students', leadsGenerated: 42, recruiterName: 'Tamika Johnson', status: 'completed' },
  { id: 'out-08', name: 'Virtual Info Session — Business Programs', date: '2026-01-25', type: 'virtual_info_session', targetAudience: 'Transfer Students', leadsGenerated: 15, recruiterName: 'Alicia Green', status: 'completed' },
  { id: 'out-09', name: 'Northview Prep HS Visit', date: '2026-01-20', type: 'high_school_visit', targetAudience: 'Juniors & Seniors', leadsGenerated: 22, recruiterName: 'Marcus Reid', status: 'completed' },
  { id: 'out-10', name: 'Liberty City Community Outreach', date: '2026-01-15', type: 'community_event', targetAudience: 'Community Members', leadsGenerated: 8, recruiterName: 'Derek Williams', status: 'completed' },
];

// =============================================================================
// FACULTY & ADMISSIONS HELPERS
// =============================================================================

export function getStageCount(stage: AdmissionsStage): number {
  return ADMISSIONS_PIPELINE.filter((e) => e.stage === stage).length;
}

export function getStageColor(stage: AdmissionsStage): string {
  return ADMISSIONS_STAGES.find((s) => s.key === stage)?.color ?? '#A1A1AA';
}

// =============================================================================
// INSTITUTIONAL METRICS — 6 KPIs for the 2x3 grid
// =============================================================================

export const INSTITUTIONAL_METRICS = {
  enrollment: { value: 1285, trend: '+4%', status: 'green' as const },
  retention: { value: '72%', trend: '+3%', status: 'green' as const },
  graduationRate: { value4yr: '31%', value6yr: '42%', status: 'amber' as const },
  studentFacultyRatio: { value: '14:1', status: 'green' as const },
  avgGPA: { value: '2.87', status: 'green' as const },
  financialHealth: { endowment: '$12.4M', revenueTarget: '96%', status: 'green' as const },
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
  { name: 'Arts & Sciences', programCount: 6, enrolledStudents: 420, avgGPA: 2.91, facultyCount: 18, alerts: [] },
  { name: 'School of Business', programCount: 6, enrolledStudents: 312, avgGPA: 2.94, facultyCount: 12, alerts: [] },
  { name: 'School of Education', programCount: 4, enrolledStudents: 280, avgGPA: 3.05, facultyCount: 14, alerts: ['Accreditation self-study due Apr 15'] },
  { name: 'Health Sciences', programCount: 3, enrolledStudents: 245, avgGPA: 3.12, facultyCount: 10, alerts: [] },
  { name: 'Professional Studies', programCount: 3, enrolledStudents: 195, avgGPA: 2.78, facultyCount: 8, alerts: ['Criminal Justice — enrollment down 22% YoY', 'Aviation — 3 faculty vacancies'] },
];

// =============================================================================
// DOMAIN CARD SUMMARY DATA
// =============================================================================

export const STUDENT_SUCCESS_SUMMARY = { atRiskCount: 23, interventionRate: 78, probationCount: 15, earlyAlertCount: 120 };
export const CAMPUS_LIFE_SUMMARY = { activeOrgs: 32, nextCampusEvent: 'Homecoming Week · Mar 10-15', housingOccupancy: '88%', diningEnrollment: 640 };
export const ADVANCEMENT_SUMMARY = { annualGivingTotal: 1_800_000, goal: 2_500_000, majorGiftProspects: 3, prospectThreshold: '100K+' };
export const ACCREDITATION_SUMMARY = { status: 'SACSCOC — Accredited through 2028', nextMilestone: 'Fifth-Year Report due Sep 2026', selfStudyProgress: '64%' };
