/**
 * Mock data for Education Hub — Lincoln University Oakland (est. 1919).
 * Hub user: Oluwadara Samuel "Sammy" Kalejaiye — Assistant Basketball Coach &
 * Recruiting Coordinator, Men's Basketball. STAFF, not a student.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type EduChartMetric = 'enrollment' | 'retention' | 'graduation';
export type OrgType = 'academic' | 'social' | 'athletic' | 'cultural' | 'service';
export type AssignmentStatus = 'pending' | 'submitted' | 'graded';

export interface EduDepartment {
  id: string;
  name: string;
  chair: string;
  chairInitials: string;
  chairHue: number;
  facultyCount: number;
  studentCount: number;
  courseCount: number;
  description: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  instructor: string;
  instructorInitials: string;
  schedule: string;
  room: string;
  enrollment: number;
  capacity: number;
  department: string;
  prerequisites: string[];
}

export interface StudentCourse extends Course {
  grade: string;
  attendance: number;
}

export interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  status: AssignmentStatus;
  points: number;
  earned?: number;
}

export interface CampusOrg {
  id: string;
  name: string;
  type: OrgType;
  president: string;
  presidentInitials: string;
  memberCount: number;
  schedule: string;
  description: string;
  isOpen: boolean;
  requiresApproval: boolean;
}

export interface EduChartPoint {
  label: string;
  enrollment: number;
  retention: number;
  graduation: number;
}

export interface DegreeRequirement {
  name: string;
  completed: number;
  required: number;
}

export interface EduActivity {
  id: string;
  icon: string;
  message: string;
  detail: string;
  timeAgo: string;
  type: 'application' | 'grade' | 'faculty' | 'financial';
}

// ── Education Profile ─────────────────────────────────────────────────────────

export const EDUCATION_PROFILE = {
  name: 'Lincoln University Oakland',
  tagline: 'Affordable. Experienced. Career-Ready.',
  established: 1919,
  chartered: 1926,
  location: 'Oakland, CA',
  address: '401 15th Street, Oakland, CA 94612',
  description:
    'Lincoln University Oakland is a private, non-profit institution founded in 1919 and ' +
    'chartered in 1926. With a Special Focus in Business & Management, Lincoln serves a ' +
    'diverse community of 436 undergraduate and graduate students seeking career-oriented ' +
    'programs in business, finance, and diagnostic medical sonography.',
  mission:
    'To provide affordable educational programs in selected fields of study, delivered by ' +
    'experienced educators, and leading to outstanding employment opportunities for American ' +
    'and international students.',
  avatarInitials: 'LU',
  coverHue: 0,
  colors: { maroon: '#800000', red: '#C41E3A' },
  mascot: 'Oaklanders',
  studentFacultyRatio: '15:1',
  programs: 7,
  accreditation: 'WSCUC',
  accreditationStatus: 'Good Standing',
  accreditationSince: '06/26/2020',
  accreditationNext: '06/26/2026',
  additionalAccreditation: 'IACBE (Business Programs)',
  website: 'https://lincolnuca.edu',
  admissionsEmail: 'admissions@lincolnuca.edu',
  admissionsPhone: '(510) 628-8010',
  applicationFee: 95,
  admissionsPolicy: 'Open Admission',
  onCampusHousing: false,
  federalFinancialAid: false,
  sports: ['Men\'s Basketball (GAAC)', 'Women\'s Basketball', 'Men\'s Soccer', 'Women\'s Soccer'],
  homeVenue: 'Laney College — 900 Fallon St, Oakland, CA',
  keyStaff: [
    { name: 'Dr. Mikhail Brodsky',        title: 'President',                           email: 'president@lincolnuca.edu'          },
    { name: 'Dr. Themistoclis Pantos',    title: 'Provost / CAO & Director, Business',  email: 'tpantos@lincolnuca.edu'            },
    { name: 'Dr. Mohamed Tailab',         title: 'Dean of Students',                    email: 'mtailab@lincolnuca.edu'            },
    { name: 'Dr. Michael Guerra',         title: 'Administrative Vice President',       email: 'mguerra@lincolnuca.edu'            },
    { name: 'Dr. Alexander Anokhin',      title: 'Director of QA & Accreditation',      email: 'aanokhin@lincolnuca.edu'           },
    { name: 'Ms. Maggie Hua',             title: 'Director of Admissions & Registrar',  email: 'maggiehua@lincolnuca.edu'          },
    { name: 'Ms. Reenu Shrestha',         title: 'Assistant to President / HR / PDSO',  email: 'sreenu@lincolnuca.edu'             },
    { name: 'Ms. Yu Zhu Liang',           title: 'Senior Accounting Analyst',           email: 'accountingassistant@lincolnuca.edu'},
    { name: 'Ms. Marina Kay',             title: 'Director, Diagnostic Imaging Lab',    email: 'mkay@lincolnuca.edu'               },
    { name: 'Ms. Nicole Y. Marsh',        title: 'Head Librarian',                      email: 'nmarsh@lincolnuca.edu'             },
    { name: 'Mr. Desmond Gumbs',          title: 'Director of Athletics',               email: 'dgumbs@lincolnuca.edu'             },
    { name: 'Coach William Middlebrooks', title: 'Head Men\'s Basketball Coach',        email: 'wmiddlebrooks@lincolnuca.edu'      },
  ],
};

// ── Admin Analytics ───────────────────────────────────────────────────────────

export const EDUCATION_ANALYTICS = {
  totalEnrollment:        436,
  enrollmentTrend:        +2.3,
  retentionRate:          89,
  retentionTrend:         +1.0,
  graduationRate:         69,
  graduationTrend:        +0.5,
  avgGpa:                 3.1,
  gpaTrend:               +0.04,
  financialAid:           0,
  financialAidTrend:      0,
  applicationsPending:    28,
  applicationsTrend:      +8.2,
};

// ── Admin Chart (6 semesters F21–S24) ────────────────────────────────────────

export const EDUCATION_CHART_DATA: EduChartPoint[] = [
  { label: 'F21', enrollment: 398, retention: 86, graduation: 66 },
  { label: 'S22', enrollment: 385, retention: 87, graduation: 67 },
  { label: 'F22', enrollment: 412, retention: 87, graduation: 67 },
  { label: 'S23', enrollment: 401, retention: 88, graduation: 68 },
  { label: 'F23', enrollment: 428, retention: 89, graduation: 69 },
  { label: 'S24', enrollment: 436, retention: 89, graduation: 69 },
];

export function getEduChartMax(metric: EduChartMetric): number {
  return Math.max(...EDUCATION_CHART_DATA.map(d => d[metric]));
}

// ── Departments ───────────────────────────────────────────────────────────────

export const EDUCATION_DEPARTMENTS: EduDepartment[] = [
  {
    id: 'dep1',
    name: 'Business Programs',
    chair: 'Dr. Themistoclis Pantos',
    chairInitials: 'TP',
    chairHue: 0,
    facultyCount: 12,
    studentCount: 230,
    courseCount: 28,
    description:
      'Offering BA Business Administration, MBA, MS International Business & Finance Management, ' +
      'MS Finance, and DBA programs. Accredited by IACBE. Focused on career-ready outcomes for ' +
      'domestic and international students.',
  },
  {
    id: 'dep2',
    name: 'Diagnostic Medical Sonography',
    chair: 'Ms. Marina Kay',
    chairInitials: 'MK',
    chairHue: 200,
    facultyCount: 6,
    studentCount: 80,
    courseCount: 18,
    description:
      'BS Diagnostic Medical Sonography program preparing students for ARDMS credentialing exams. ' +
      'Hands-on training in the on-campus Diagnostic Imaging Laboratory with clinical practicum ' +
      'rotations at partner Bay Area medical facilities.',
  },
  {
    id: 'dep3',
    name: 'Graduate Programs',
    chair: 'Dr. Themistoclis Pantos',
    chairInitials: 'TP',
    chairHue: 240,
    facultyCount: 9,
    studentCount: 126,
    courseCount: 24,
    description:
      'Serving 232 graduate students across MBA, MS Finance, MS International Business & Finance ' +
      'Management, and DBA programs. Emphasis on applied research, global finance, and executive ' +
      'leadership development.',
  },
];

// ── Course Catalog ────────────────────────────────────────────────────────────

export const COURSE_CATALOG: Course[] = [
  {
    id: 'cat1',
    code: 'BUS-301',
    title: 'Business Strategy',
    credits: 3,
    instructor: 'Dr. T. Pantos',
    instructorInitials: 'TP',
    schedule: 'TTh 10:00 AM',
    room: 'Room 201',
    enrollment: 28,
    capacity: 32,
    department: 'Business Programs',
    prerequisites: ['BUS-201'],
  },
  {
    id: 'cat2',
    code: 'DI-201',
    title: 'Sonographic Physics & Instrumentation',
    credits: 4,
    instructor: 'Ms. M. Kay',
    instructorInitials: 'MK',
    schedule: 'MWF 9:00 AM',
    room: 'Imaging Lab A',
    enrollment: 18,
    capacity: 20,
    department: 'Diagnostic Medical Sonography',
    prerequisites: ['BIO-101', 'PHYS-101'],
  },
  {
    id: 'cat3',
    code: 'MBA-501',
    title: 'Financial Management',
    credits: 3,
    instructor: 'Dr. T. Pantos',
    instructorInitials: 'TP',
    schedule: 'MW 6:00 PM',
    room: 'Room 305',
    enrollment: 22,
    capacity: 25,
    department: 'Graduate Programs',
    prerequisites: ['MBA-500'],
  },
  {
    id: 'cat4',
    code: 'BUS-401',
    title: 'International Finance',
    credits: 3,
    instructor: 'Prof. A. Reyes',
    instructorInitials: 'AR',
    schedule: 'TTh 2:00 PM',
    room: 'Room 210',
    enrollment: 20,
    capacity: 24,
    department: 'Business Programs',
    prerequisites: ['BUS-301', 'MBA-501'],
  },
  {
    id: 'cat5',
    code: 'MBA-601',
    title: 'DBA Research Methods',
    credits: 3,
    instructor: 'Dr. M. Brodsky',
    instructorInitials: 'MB',
    schedule: 'Sat 9:00 AM',
    room: 'Room 410',
    enrollment: 12,
    capacity: 15,
    department: 'Graduate Programs',
    prerequisites: ['MBA-580'],
  },
];

// ── Staff Courses (Sammy is staff — no enrolled courses) ──────────────────────

/** Sammy is staff, not a student. No enrolled courses. */
export const MY_COURSES: StudentCourse[] = [];

// ── Assignments (empty — staff has no course assignments) ─────────────────────

export const COURSE_ASSIGNMENTS: Record<string, Assignment[]> = {};

// ── Degree Progress (N/A — staff member) ─────────────────────────────────────

export const DEGREE_PROGRESS = {
  totalCredits: 0,
  completed: 0,
  inProgress: 0,
  gpa: 0,
  expectedGraduation: 'N/A',
  requirements: [] as DegreeRequirement[],
};

// ── Staff Profile (Sammy Kalejaiye — Assistant Coach & Recruiting Coordinator) ─

export const STUDENT_PROFILE = {
  name: 'Sammy Kalejaiye',
  id: 'LU-STAFF-0001',
  major: 'Assistant Basketball Coach',
  minor: 'Recruiting Coordinator',
  year: 'Staff',
  gpa: 0,
  creditsCompleted: 0,
  creditsRequired: 0,
  advisorName: 'William Middlebrooks',
  advisorHandle: '@wmiddlebrooks',
  enrollmentStatus: 'Staff \u2014 Full-time',
  deansListSemesters: [] as string[],
  housing: null as null,
  financialAid: null as null,
};

// ── Campus Organizations ──────────────────────────────────────────────────────

export const CAMPUS_ORGS: CampusOrg[] = [
  {
    id: 'org1',
    name: 'Student Council',
    type: 'academic',
    president: 'Yuna Park',
    presidentInitials: 'YP',
    memberCount: 22,
    schedule: 'Mondays 5:00 PM, Room 202',
    description:
      'The representative voice of Lincoln University students. The Student Council advocates ' +
      'for student needs, organizes campus events, and collaborates with administration on ' +
      'institutional matters.',
    isOpen: true,
    requiresApproval: true,
  },
  {
    id: 'org2',
    name: 'International Students Association',
    type: 'cultural',
    president: 'Karim Benzali',
    presidentInitials: 'KB',
    memberCount: 85,
    schedule: 'Wednesdays 6:00 PM, Lounge A',
    description:
      'Supporting the 40% international student population at Lincoln University. Hosts ' +
      'cultural events, immigration workshops, and peer mentorship to ease the transition ' +
      'for students from over 30 countries.',
    isOpen: true,
    requiresApproval: false,
  },
  {
    id: 'org3',
    name: 'Business Club',
    type: 'academic',
    president: 'Diego Torres',
    presidentInitials: 'DT',
    memberCount: 40,
    schedule: 'Thursdays 5:30 PM, Room 201',
    description:
      'Bridging classroom theory and real-world practice through speaker series, case ' +
      'competitions, and networking events with Oakland Bay Area business professionals. ' +
      'Open to all Business and Graduate Program students.',
    isOpen: true,
    requiresApproval: false,
  },
  {
    id: 'org4',
    name: 'Athletics Boosters',
    type: 'athletic',
    president: 'Marcus Webb',
    presidentInitials: 'MW',
    memberCount: 30,
    schedule: 'Fridays 4:00 PM, Gym / Laney College',
    description:
      'Supporting Lincoln Oaklanders athletics across Men\'s and Women\'s Basketball and ' +
      'Soccer. Coordinates fan attendance at Laney College home games, organizes spirit ' +
      'events, and raises funds for travel and equipment.',
    isOpen: true,
    requiresApproval: false,
  },
];

// ── Admin Activity Feed ───────────────────────────────────────────────────────

export const ADMIN_ACTIVITY: EduActivity[] = [
  {
    id: 'act1',
    icon: 'person.fill.badge.plus',
    message: '5 new applications submitted this week',
    detail: '+5 apps',
    timeAgo: '2h ago',
    type: 'application',
  },
  {
    id: 'act2',
    icon: 'checkmark.seal.fill',
    message: 'WSCUC accreditation review prep meeting scheduled',
    detail: 'Jun 2026',
    timeAgo: '5h ago',
    type: 'grade',
  },
  {
    id: 'act3',
    icon: 'doc.text.fill',
    message: 'Spring 2026 grade submission deadline reminder',
    detail: 'Due May 16',
    timeAgo: '1d ago',
    type: 'grade',
  },
  {
    id: 'act4',
    icon: 'person.2.fill',
    message: 'Recruiting prospect visit confirmed — Oakland campus tour',
    detail: 'Apr 4, 2026',
    timeAgo: '1d ago',
    type: 'faculty',
  },
  {
    id: 'act5',
    icon: 'chart.line.uptrend.xyaxis',
    message: 'Spring 2026 enrollment steady at 436 students',
    detail: '204 UG · 232 Grad',
    timeAgo: '2d ago',
    type: 'application',
  },
  {
    id: 'act6',
    icon: 'building.2.fill',
    message: 'GAAC season schedule finalized — home games at Laney College',
    detail: '8 home dates',
    timeAgo: '3d ago',
    type: 'faculty',
  },
];

// ── Academic Calendar — Spring 2026 ──────────────────────────────────────────

export const ACADEMIC_CALENDAR = [
  { label: 'Semester Begins / Placement Tests', date: 'Jan 21, 2026'         },
  { label: 'Advising & Registration',           date: 'Jan 22\u201323, 2026' },
  { label: 'Classes Begin',                     date: 'Jan 26, 2026'         },
  { label: 'Add / Drop Deadline',               date: 'Feb 9, 2026'          },
  { label: 'Presidents\u2019 Day (Holiday)',    date: 'Feb 16, 2026'         },
  { label: 'Spring Recess',                     date: 'Mar 17\u201321, 2026' },
  { label: 'Classes Resume',                    date: 'Mar 23, 2026'         },
  { label: 'Final Examinations',                date: 'May 11\u201316, 2026' },
  { label: 'Semester Ends',                     date: 'May 16, 2026'         },
  { label: 'Commencement',                      date: 'May 30, 2026'         },
];
