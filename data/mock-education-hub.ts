/**
 * Mock data for Education Hub — Lincoln University demo (HBCU, est. 1854).
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
  name: 'Lincoln University',
  tagline: 'Excellence. Integrity. Service.',
  established: 1854,
  location: 'Jefferson City, MO',
  description:
    'Lincoln University is a historically Black university committed to providing a comprehensive education to students of diverse backgrounds. We prepare leaders who serve their communities and the world.',
  mission:
    'To provide high quality, affordable education that prepares students for careers, graduate study, and engaged citizenship.',
  avatarInitials: 'LU',
  coverHue: 28,
  studentFacultyRatio: '14:1',
  programs: 42,
  accreditation: 'HLC',
  accreditationStatus: 'Good Standing',
  accreditationNext: 'Spring 2028',
  website: 'https://lincolnu.edu',
  admissionsEmail: 'admissions@lincolnu.edu',
  admissionsPhone: '(573) 681-5599',
};

// ── Admin Analytics ───────────────────────────────────────────────────────────

export const EDUCATION_ANALYTICS = {
  totalEnrollment:        3247,
  enrollmentTrend:        +2.1,
  retentionRate:          84,
  retentionTrend:         +1.2,
  graduationRate:         71,
  graduationTrend:        +0.8,
  avgGpa:                 3.1,
  gpaTrend:               +0.05,
  financialAid:           4800000,
  financialAidTrend:      +5.3,
  applicationsPending:    142,
  applicationsTrend:      +18.4,
};

// ── Admin Chart (6 semesters) ─────────────────────────────────────────────────

export const EDUCATION_CHART_DATA: EduChartPoint[] = [
  { label: 'F21', enrollment: 3050, retention: 81, graduation: 68 },
  { label: 'S22', enrollment: 2940, retention: 82, graduation: 69 },
  { label: 'F22', enrollment: 3110, retention: 83, graduation: 70 },
  { label: 'S23', enrollment: 3020, retention: 83, graduation: 70 },
  { label: 'F23', enrollment: 3180, retention: 84, graduation: 71 },
  { label: 'S24', enrollment: 3247, retention: 84, graduation: 71 },
];

export function getEduChartMax(metric: EduChartMetric): number {
  return Math.max(...EDUCATION_CHART_DATA.map(d => d[metric]));
}

// ── Departments ───────────────────────────────────────────────────────────────

export const EDUCATION_DEPARTMENTS: EduDepartment[] = [
  {
    id: 'dep1', name: 'Business & Economics', chair: 'Dr. Sandra Moore',
    chairInitials: 'SM', chairHue: 28,
    facultyCount: 18, studentCount: 620, courseCount: 44,
    description: 'Preparing future business leaders through rigorous academic programs in accounting, finance, marketing, and entrepreneurship.',
  },
  {
    id: 'dep2', name: 'Natural Sciences', chair: 'Dr. Robert Chen',
    chairInitials: 'RC', chairHue: 150,
    facultyCount: 22, studentCount: 480, courseCount: 56,
    description: 'Advancing scientific inquiry through programs in biology, chemistry, physics, environmental science, and pre-medicine.',
  },
  {
    id: 'dep3', name: 'Liberal Arts & Humanities', chair: 'Dr. James Williams',
    chairInitials: 'JW', chairHue: 200,
    facultyCount: 20, studentCount: 540, courseCount: 60,
    description: 'Cultivating critical thinkers and communicators through English, history, philosophy, communications, and political science.',
  },
  {
    id: 'dep4', name: 'School of Education', chair: 'Dr. Angela Davis',
    chairInitials: 'AD', chairHue: 280,
    facultyCount: 14, studentCount: 310, courseCount: 38,
    description: 'Training the next generation of educators through evidence-based programs in early childhood, K-12, and higher education.',
  },
  {
    id: 'dep5', name: 'Athletics & Physical Ed.', chair: 'Coach Kevin Harris',
    chairInitials: 'KH', chairHue: 0,
    facultyCount: 12, studentCount: 245, courseCount: 22,
    description: 'Developing student athletes who excel in the classroom and in competition. NCAA Division II. 10 varsity sports.',
  },
];

// ── Course Catalog ────────────────────────────────────────────────────────────

export const COURSE_CATALOG: Course[] = [
  {
    id: 'cat1', code: 'ENG-301', title: 'Advanced Composition', credits: 3,
    instructor: 'Dr. T. Williams', instructorInitials: 'TW', schedule: 'MWF 10:00 AM',
    room: 'Langston 201', enrollment: 22, capacity: 28,
    department: 'Liberal Arts', prerequisites: ['ENG-201'],
  },
  {
    id: 'cat2', code: 'MATH-305', title: 'Linear Algebra', credits: 3,
    instructor: 'Prof. R. Chen', instructorInitials: 'RC', schedule: 'TTh 11:00 AM',
    room: 'Science 104', enrollment: 18, capacity: 24,
    department: 'Natural Sciences', prerequisites: ['MATH-202'],
  },
  {
    id: 'cat3', code: 'BUS-401', title: 'Strategic Management', credits: 3,
    instructor: 'Dr. S. Moore', instructorInitials: 'SM', schedule: 'MW 3:30 PM',
    room: 'Business 302', enrollment: 30, capacity: 35,
    department: 'Business', prerequisites: ['BUS-315'],
  },
  {
    id: 'cat4', code: 'COMM-310', title: 'Mass Media & Society', credits: 3,
    instructor: 'Prof. P. Davis', instructorInitials: 'PD', schedule: 'TTh 2:00 PM',
    room: 'Fine Arts 105', enrollment: 25, capacity: 30,
    department: 'Liberal Arts', prerequisites: [],
  },
  {
    id: 'cat5', code: 'BUS-350', title: 'Entrepreneurship', credits: 3,
    instructor: 'Dr. M. Johnson', instructorInitials: 'MJ', schedule: 'MWF 1:00 PM',
    room: 'Business 201', enrollment: 28, capacity: 28,
    department: 'Business', prerequisites: ['BUS-201'],
  },
];

// ── Student Courses (Sammy — current semester) ────────────────────────────────

export const MY_COURSES: StudentCourse[] = [
  {
    id: 'c1', code: 'ENG-201', title: 'English Literature', credits: 3,
    instructor: 'Dr. T. Williams', instructorInitials: 'TW', schedule: 'TTh 10:00\u201311:15 AM',
    room: 'Langston Hall 201', enrollment: 26, capacity: 30,
    department: 'Liberal Arts', prerequisites: ['ENG-101'],
    grade: 'B+', attendance: 95,
  },
  {
    id: 'c2', code: 'MATH-202', title: 'Calculus II', credits: 4,
    instructor: 'Prof. R. Chen', instructorInitials: 'RC', schedule: 'MWF 9:00\u20139:50 AM',
    room: 'Science Hall 104', enrollment: 22, capacity: 25,
    department: 'Natural Sciences', prerequisites: ['MATH-201'],
    grade: 'A-', attendance: 92,
  },
  {
    id: 'c3', code: 'BUS-315', title: 'Business Ethics', credits: 3,
    instructor: 'Dr. M. Johnson', instructorInitials: 'MJ', schedule: 'MW 2:00\u20133:15 PM',
    room: 'Business Hall 302', enrollment: 28, capacity: 30,
    department: 'Business', prerequisites: ['BUS-201'],
    grade: 'A', attendance: 98,
  },
  {
    id: 'c4', code: 'COMM-201', title: 'Public Speaking', credits: 3,
    instructor: 'Prof. P. Davis', instructorInitials: 'PD', schedule: 'TTh 1:00\u20132:15 PM',
    room: 'Fine Arts 105', enrollment: 20, capacity: 24,
    department: 'Liberal Arts', prerequisites: [],
    grade: 'B', attendance: 88,
  },
];

// ── Assignments ───────────────────────────────────────────────────────────────

export const COURSE_ASSIGNMENTS: Record<string, Assignment[]> = {
  c1: [
    { id: 'a1', title: 'Essay: Symbolism in Modern Lit', dueDate: 'Jul 25', status: 'graded', points: 100, earned: 91 },
    { id: 'a2', title: 'Reading Quiz 5', dueDate: 'Jul 30', status: 'submitted', points: 25 },
    { id: 'a3', title: 'Final Research Paper', dueDate: 'Aug 10', status: 'pending', points: 200 },
  ],
  c2: [
    { id: 'a4', title: 'Problem Set 6', dueDate: 'Jul 26', status: 'graded', points: 50, earned: 47 },
    { id: 'a5', title: 'Quiz 4', dueDate: 'Aug 1', status: 'pending', points: 40 },
    { id: 'a6', title: 'Midterm Exam', dueDate: 'Aug 8', status: 'pending', points: 150 },
  ],
  c3: [
    { id: 'a7', title: 'Case Study: Corporate Ethics', dueDate: 'Jul 28', status: 'graded', points: 100, earned: 96 },
    { id: 'a8', title: 'Group Presentation', dueDate: 'Aug 5', status: 'submitted', points: 80 },
    { id: 'a9', title: 'Final Exam', dueDate: 'Aug 12', status: 'pending', points: 200 },
  ],
  c4: [
    { id: 'a10', title: 'Impromptu Speech 3', dueDate: 'Jul 29', status: 'graded', points: 60, earned: 54 },
    { id: 'a11', title: 'Debate Participation', dueDate: 'Aug 6', status: 'pending', points: 50 },
    { id: 'a12', title: 'Persuasive Speech', dueDate: 'Aug 13', status: 'pending', points: 100 },
  ],
};

// ── Degree Progress ───────────────────────────────────────────────────────────

export const DEGREE_PROGRESS = {
  totalCredits: 120,
  completed: 68,
  inProgress: 13,
  gpa: 3.4,
  expectedGraduation: 'May 2025',
  requirements: [
    { name: 'Core Curriculum',    completed: 27, required: 30 },
    { name: 'Business Major',     completed: 27, required: 48 },
    { name: 'Comm Minor',         completed: 9,  required: 18 },
    { name: 'Free Electives',     completed: 5,  required: 24 },
  ] as DegreeRequirement[],
};

// ── Student Profile ───────────────────────────────────────────────────────────

export const STUDENT_PROFILE = {
  name: 'Sammy Kalejaiye',
  id: 'LU-2021-0847',
  major: 'Business Administration',
  minor: 'Communications',
  year: 'Junior',
  gpa: 3.4,
  creditsCompleted: 68,
  creditsRequired: 120,
  advisorName: 'Dr. Patricia Moore',
  advisorHandle: '@pmoore',
  enrollmentStatus: 'Full-time',
  deansListSemesters: ['Fall 2022', 'Spring 2023'],
  housing: { building: 'Morrison Hall', room: '214', roommate: 'Devon Clarke' },
  financialAid: {
    grants: 6000,
    scholarships: 2500,
    loans: 4000,
    workstudy: 1500,
    tuitionCharged: 14200,
    aidApplied: 14000,
    balance: 200,
    dueDate: 'Aug 15, 2024',
  },
};

// ── Campus Organizations ──────────────────────────────────────────────────────

export const CAMPUS_ORGS: CampusOrg[] = [
  {
    id: 'org1', name: 'Student Government Association', type: 'academic',
    president: 'Nia Sanders', presidentInitials: 'NS',
    memberCount: 45, schedule: 'Mondays 5:00 PM, Union 210',
    description: 'The voice of the student body. SGA advocates for student interests, manages student activity fees, and leads campus-wide initiatives.',
    isOpen: true, requiresApproval: true,
  },
  {
    id: 'org2', name: 'Black Student Union', type: 'cultural',
    president: 'Marcus Thompson', presidentInitials: 'MT',
    memberCount: 120, schedule: 'Wednesdays 7:00 PM, Cultural Center',
    description: 'Celebrating and preserving Black culture, history, and excellence. Hosting campus events, speaker series, and community service.',
    isOpen: true, requiresApproval: false,
  },
  {
    id: 'org3', name: 'Entrepreneurship Club', type: 'academic',
    president: 'Jordan Williams', presidentInitials: 'JW',
    memberCount: 38, schedule: 'Thursdays 6:00 PM, Business Hall 202',
    description: 'Empowering student founders through workshops, pitch competitions, mentorship, and connections to the startup ecosystem.',
    isOpen: true, requiresApproval: false,
  },
  {
    id: 'org4', name: 'Debate Team', type: 'academic',
    president: 'Alex Kim', presidentInitials: 'AK',
    memberCount: 22, schedule: 'Tuesdays 4:00 PM, Fine Arts 101',
    description: 'Competitive debate in NEDA and CEDA formats. Developing critical thinking, research, and public speaking at the regional and national level.',
    isOpen: false, requiresApproval: true,
  },
  {
    id: 'org5', name: 'Athletics Council', type: 'athletic',
    president: 'Devon Clarke', presidentInitials: 'DC',
    memberCount: 60, schedule: 'Fridays 3:00 PM, Rec Center 101',
    description: 'Connecting student athletes across all Lincoln University varsity and intramural sports. Advocacy, community service, and academic support.',
    isOpen: true, requiresApproval: false,
  },
];

// ── Admin Activity Feed ───────────────────────────────────────────────────────

export const ADMIN_ACTIVITY: EduActivity[] = [
  { id: 'act1', icon: 'person.fill.badge.plus',  message: '8 new applications received',           detail: '+8 apps',        timeAgo: '1h ago',  type: 'application' },
  { id: 'act2', icon: 'doc.text.fill',            message: 'Grade submissions due in 3 days',        detail: '14 pending',     timeAgo: '2h ago',  type: 'grade'       },
  { id: 'act3', icon: 'star.fill',                message: 'Dr. Williams submitted final grades',    detail: 'ENG-201',        timeAgo: '4h ago',  type: 'grade'       },
  { id: 'act4', icon: 'dollarsign.circle.fill',   message: 'Financial aid disbursement processed',   detail: '$240,000',       timeAgo: '8h ago',  type: 'financial'   },
  { id: 'act5', icon: 'person.fill.badge.plus',  message: '3 new faculty hires approved',           detail: 'Business Dept',  timeAgo: '1d ago',  type: 'faculty'     },
  { id: 'act6', icon: 'chart.line.uptrend.xyaxis',message: 'Applications up 18% from last cycle',   detail: '142 pending',    timeAgo: '2d ago',  type: 'application' },
];

// ── Academic Calendar ─────────────────────────────────────────────────────────

export const ACADEMIC_CALENDAR = [
  { label: 'Summer Term Ends',          date: 'Aug 16, 2024' },
  { label: 'Fall 2024 Registration',    date: 'Jul 29 \u2013 Aug 9' },
  { label: 'Fall Semester Begins',      date: 'Aug 26, 2024' },
  { label: 'Labor Day (No Classes)',    date: 'Sep 2, 2024' },
  { label: 'Midterm Exams',             date: 'Oct 14\u201318, 2024' },
  { label: 'Thanksgiving Break',        date: 'Nov 27 \u2013 Dec 1' },
  { label: 'Fall Finals',               date: 'Dec 9\u201313, 2024' },
];
