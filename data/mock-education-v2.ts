/**
 * Mock Education V2 Data — Complete data layer for Education Mode.
 * Organizations | Programs | Students | Courses | Grades | Advising | Billing
 * Institution: Lincoln University, Oakland CA
 */

// =============================================================================
// ORGANIZATION TYPES
// =============================================================================

export interface EducationOrg {
  id: string;
  name: string;
  abbreviation: string;
  type: 'university' | 'academy' | 'program';
  city: string;
  state: string;
  status: 'active' | 'inactive';
}

// =============================================================================
// PROGRAM TYPES
// =============================================================================

export interface Program {
  id: string;
  name: string;
  orgId: string;
  level: 'certificate' | 'associate' | 'bachelor' | 'master';
  status: 'active' | 'inactive';
  enrollmentCount: number;
  retentionRisk: 'low' | 'medium' | 'high';
  creditsRequired: number;
}

// =============================================================================
// STUDENT TYPES
// =============================================================================

export interface Student {
  id: string;
  name: string;
  orgId: string;
  programId: string;
  status: 'applicant' | 'enrolled' | 'leave' | 'withdrawn' | 'alumni';
  holds: ('none' | 'financial' | 'academic' | 'conduct')[];
  creditsCompleted: number;
  creditsRequired: number;
  gpa: number;
  attendanceRisk: 'low' | 'medium' | 'high';
  cohort: string;
  email?: string;
  phone?: string;
  parentId?: string;
  advisorId?: string;
  photo?: string;
}

// =============================================================================
// COURSE TYPES
// =============================================================================

export interface Course {
  id: string;
  name: string;
  code: string;
  orgId: string;
  programId: string;
  term: string;
  meetingTimes: string;
  instructorId: string;
  instructorName: string;
  status: 'active' | 'completed';
  enrolledCount: number;
  capacity: number;
}

export interface CourseSession {
  id: string;
  courseId: string;
  date: string;
  time: string;
  topic: string;
  type: 'lecture' | 'lab' | 'seminar' | 'exam' | 'workshop';
  status: 'upcoming' | 'completed';
}

// =============================================================================
// ASSIGNMENT + GRADE TYPES
// =============================================================================

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  type: 'homework' | 'quiz' | 'exam' | 'project' | 'paper';
  dueDate: string;
  maxPoints: number;
  status: 'upcoming' | 'submitted' | 'graded';
}

export interface StudentGrade {
  id: string;
  studentId: string;
  courseId: string;
  assignmentId: string;
  score: number;
  maxPoints: number;
  letterGrade?: string;
}

// =============================================================================
// ADVISING TYPES
// =============================================================================

export interface AdvisingNote {
  id: string;
  studentId: string;
  advisorId: string;
  date: string;
  summary: string;
  nextStep?: string;
  nextMeeting?: string;
}

export interface AdvisingTask {
  id: string;
  studentId: string;
  title: string;
  dueDate: string;
  owner: string;
  status: 'pending' | 'completed';
}

// =============================================================================
// HOLDS + COMPLIANCE TYPES
// =============================================================================

export interface StudentHold {
  id: string;
  studentId: string;
  type: 'financial' | 'academic' | 'conduct';
  reason: string;
  placedDate: string;
  owner: string;
  status: 'active' | 'resolved';
}

// =============================================================================
// BILLING + PAYMENT TYPES
// =============================================================================

export interface PaymentPlan {
  id: string;
  studentId: string;
  totalAmount: number;
  paidAmount: number;
  installments: number;
  nextDue: string;
  status: 'active' | 'completed' | 'delinquent';
}

export interface Transaction {
  id: string;
  studentId: string;
  date: string;
  description: string;
  amount: number;
  type: 'charge' | 'payment' | 'refund';
}

// =============================================================================
// STAFF TYPES
// =============================================================================

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  orgId: string;
  email: string;
}

// =============================================================================
// DEGREE REQUIREMENT TYPES
// =============================================================================

export interface DegreeRequirement {
  id: string;
  programId: string;
  category: string;
  name: string;
  creditsRequired: number;
  status: 'met' | 'in_progress' | 'not_started';
}

// =============================================================================
// EDUCATION ORGS DATA
// =============================================================================

export const EDUCATION_ORGS: EducationOrg[] = [
  { id: 'lu-oak', name: 'Lincoln University', abbreviation: 'LU', type: 'university', city: 'Oakland', state: 'CA', status: 'active' },
  { id: 'lu-di', name: 'Lincoln DI Program', abbreviation: 'LU-DI', type: 'program', city: 'Oakland', state: 'CA', status: 'active' },
];

// =============================================================================
// PROGRAMS DATA
// =============================================================================

export const PROGRAMS: Program[] = [
  {
    id: 'prog-mba',
    name: 'Master of Business Administration',
    orgId: 'lu-oak',
    level: 'master',
    status: 'active',
    enrollmentCount: 95,
    retentionRisk: 'low',
    creditsRequired: 36,
  },
  {
    id: 'prog-ba-bus',
    name: 'Bachelor of Arts — Business Administration',
    orgId: 'lu-oak',
    level: 'bachelor',
    status: 'active',
    enrollmentCount: 82,
    retentionRisk: 'low',
    creditsRequired: 120,
  },
  {
    id: 'prog-bs-di',
    name: 'Bachelor of Science — Diagnostic Medical Sonography',
    orgId: 'lu-oak',
    level: 'bachelor',
    status: 'active',
    enrollmentCount: 58,
    retentionRisk: 'low',
    creditsRequired: 120,
  },
  {
    id: 'prog-ms-ibfm',
    name: 'MS International Business & Finance Management',
    orgId: 'lu-oak',
    level: 'master',
    status: 'active',
    enrollmentCount: 68,
    retentionRisk: 'low',
    creditsRequired: 36,
  },
  {
    id: 'prog-ms-fin',
    name: 'MS Finance',
    orgId: 'lu-oak',
    level: 'master',
    status: 'active',
    enrollmentCount: 48,
    retentionRisk: 'low',
    creditsRequired: 36,
  },
  {
    id: 'prog-dba',
    name: 'Doctor of Business Administration',
    orgId: 'lu-oak',
    level: 'master',
    status: 'active',
    enrollmentCount: 35,
    retentionRisk: 'low',
    creditsRequired: 60,
  },
];

// =============================================================================
// STAFF MEMBERS DATA
// =============================================================================

export const STAFF_MEMBERS: StaffMember[] = [
  { id: 'staff-1', name: 'Dr. Themistoclis Pantos', role: 'Provost / Director of Business Programs', department: 'Business Programs', orgId: 'lu-oak', email: 'tpantos@lincolnuca.edu' },
  { id: 'staff-2', name: 'Ms. Marina Kay', role: 'Director of Diagnostic Imaging Laboratory', department: 'Diagnostic Imaging', orgId: 'lu-oak', email: 'mkay@lincolnuca.edu' },
  { id: 'staff-3', name: 'Dr. Mohamed Tailab', role: 'Dean of Students', department: 'Student Affairs', orgId: 'lu-oak', email: 'mtailab@lincolnuca.edu' },
  { id: 'staff-4', name: 'Ms. Maggie Hua', role: 'Director of Admissions & Registrar', department: 'Admissions', orgId: 'lu-oak', email: 'maggiehua@lincolnuca.edu' },
  { id: 'staff-5', name: 'Prof. Wei Zhang', role: 'Instructor — Finance', department: 'Business Programs', orgId: 'lu-oak', email: 'wzhang@lincolnuca.edu' },
  { id: 'staff-6', name: 'Prof. Amara Diallo', role: 'Instructor — Business Communication', department: 'Business Programs', orgId: 'lu-oak', email: 'adiallo@lincolnuca.edu' },
];

// =============================================================================
// STUDENTS DATA
// =============================================================================

export const STUDENTS: Student[] = [
  // 8 enrolled
  {
    id: 'stu-01',
    name: 'Wei Chen',
    orgId: 'lu-oak',
    programId: 'prog-mba',
    status: 'enrolled',
    holds: ['financial'],
    creditsCompleted: 18,
    creditsRequired: 36,
    gpa: 3.51,
    attendanceRisk: 'low',
    cohort: 'Fall 2025',
    email: 'wchen@lincolnuca.edu',
    advisorId: 'staff-3',
  },
  {
    id: 'stu-02',
    name: 'Priya Sharma',
    orgId: 'lu-oak',
    programId: 'prog-ms-ibfm',
    status: 'enrolled',
    holds: ['none'],
    creditsCompleted: 30,
    creditsRequired: 36,
    gpa: 3.78,
    attendanceRisk: 'low',
    cohort: 'Fall 2024',
    email: 'psharma@lincolnuca.edu',
    advisorId: 'staff-3',
  },
  {
    id: 'stu-03',
    name: 'Marcus Johnson',
    orgId: 'lu-oak',
    programId: 'prog-ba-bus',
    status: 'enrolled',
    holds: ['none'],
    creditsCompleted: 75,
    creditsRequired: 120,
    gpa: 3.22,
    attendanceRisk: 'low',
    cohort: 'Fall 2022',
    email: 'mjohnson@lincolnuca.edu',
    advisorId: 'staff-3',
  },
  {
    id: 'stu-04',
    name: 'Ji-Ho Park',
    orgId: 'lu-oak',
    programId: 'prog-ms-fin',
    status: 'enrolled',
    holds: ['none'],
    creditsCompleted: 12,
    creditsRequired: 36,
    gpa: 3.64,
    attendanceRisk: 'low',
    cohort: 'Fall 2025',
    email: 'jihopark@lincolnuca.edu',
    advisorId: 'staff-3',
  },
  {
    id: 'stu-05',
    name: 'Emeka Okonkwo',
    orgId: 'lu-oak',
    programId: 'prog-mba',
    status: 'enrolled',
    holds: ['none'],
    creditsCompleted: 9,
    creditsRequired: 36,
    gpa: 3.38,
    attendanceRisk: 'medium',
    cohort: 'Spring 2025',
    email: 'eokonkwo@lincolnuca.edu',
    advisorId: 'staff-3',
  },
  {
    id: 'stu-06',
    name: 'Lena Müller',
    orgId: 'lu-oak',
    programId: 'prog-bs-di',
    status: 'enrolled',
    holds: ['none'],
    creditsCompleted: 60,
    creditsRequired: 120,
    gpa: 3.15,
    attendanceRisk: 'high',
    cohort: 'Fall 2023',
    email: 'lmuller@lincolnuca.edu',
    advisorId: 'staff-3',
  },
  {
    id: 'stu-07',
    name: 'Gabriel Silva',
    orgId: 'lu-oak',
    programId: 'prog-dba',
    status: 'enrolled',
    holds: ['none'],
    creditsCompleted: 24,
    creditsRequired: 60,
    gpa: 3.42,
    attendanceRisk: 'low',
    cohort: 'Fall 2024',
    email: 'gsilva@lincolnuca.edu',
    advisorId: 'staff-3',
  },
  {
    id: 'stu-08',
    name: 'Aisha Washington',
    orgId: 'lu-oak',
    programId: 'prog-ba-bus',
    status: 'enrolled',
    holds: ['none'],
    creditsCompleted: 90,
    creditsRequired: 120,
    gpa: 3.69,
    attendanceRisk: 'low',
    cohort: 'Fall 2021',
    email: 'awashington@lincolnuca.edu',
    advisorId: 'staff-3',
  },
  // 2 applicants
  {
    id: 'stu-09',
    name: 'Omar Al-Rashidi',
    orgId: 'lu-oak',
    programId: 'prog-mba',
    status: 'applicant',
    holds: ['none'],
    creditsCompleted: 0,
    creditsRequired: 36,
    gpa: 0,
    attendanceRisk: 'low',
    cohort: 'Fall 2026',
    email: 'omar.alrashidi@gmail.com',
  },
  {
    id: 'stu-10',
    name: 'Yuna Kim',
    orgId: 'lu-oak',
    programId: 'prog-ms-fin',
    status: 'applicant',
    holds: ['none'],
    creditsCompleted: 0,
    creditsRequired: 36,
    gpa: 0,
    attendanceRisk: 'low',
    cohort: 'Fall 2026',
    email: 'yunakim94@gmail.com',
  },
  // 1 on leave
  {
    id: 'stu-11',
    name: 'DeAndre Brooks',
    orgId: 'lu-oak',
    programId: 'prog-ba-bus',
    status: 'leave',
    holds: ['none'],
    creditsCompleted: 45,
    creditsRequired: 120,
    gpa: 2.63,
    attendanceRisk: 'medium',
    cohort: 'Spring 2023',
    email: 'dbrooks@lincolnuca.edu',
    advisorId: 'staff-3',
  },
  // 1 alumni
  {
    id: 'stu-12',
    name: 'Jasmine Reed',
    orgId: 'lu-oak',
    programId: 'prog-mba',
    status: 'alumni',
    holds: ['none'],
    creditsCompleted: 36,
    creditsRequired: 36,
    gpa: 3.74,
    attendanceRisk: 'low',
    cohort: 'Fall 2022',
    email: 'jasmine.reed@alumni.lincolnuca.edu',
  },
];

// =============================================================================
// COURSES DATA
// =============================================================================

export const COURSES: Course[] = [
  {
    id: 'crs-mba501',
    name: 'Financial Management',
    code: 'MBA-501',
    orgId: 'lu-oak',
    programId: 'prog-mba',
    term: 'Spring 2026',
    meetingTimes: 'Mon/Wed 6:00 PM – 8:45 PM',
    instructorId: 'staff-1',
    instructorName: 'Dr. Themistoclis Pantos',
    status: 'active',
    enrolledCount: 22,
    capacity: 30,
  },
  {
    id: 'crs-bus301',
    name: 'Business Strategy',
    code: 'BUS-301',
    orgId: 'lu-oak',
    programId: 'prog-ba-bus',
    term: 'Spring 2026',
    meetingTimes: 'Tue/Thu 10:00 AM – 11:15 AM',
    instructorId: 'staff-5',
    instructorName: 'Prof. Wei Zhang',
    status: 'active',
    enrolledCount: 18,
    capacity: 25,
  },
  {
    id: 'crs-di201',
    name: 'Sonographic Physics & Instrumentation',
    code: 'DI-201',
    orgId: 'lu-oak',
    programId: 'prog-bs-di',
    term: 'Spring 2026',
    meetingTimes: 'Mon/Wed/Fri 9:00 AM – 9:50 AM',
    instructorId: 'staff-2',
    instructorName: 'Ms. Marina Kay',
    status: 'active',
    enrolledCount: 14,
    capacity: 18,
  },
  {
    id: 'crs-mba401',
    name: 'International Business',
    code: 'MBA-401',
    orgId: 'lu-oak',
    programId: 'prog-ms-ibfm',
    term: 'Fall 2025',
    meetingTimes: 'Tue/Thu 6:00 PM – 8:45 PM',
    instructorId: 'staff-1',
    instructorName: 'Dr. Themistoclis Pantos',
    status: 'completed',
    enrolledCount: 20,
    capacity: 25,
  },
];

// =============================================================================
// COURSE SESSIONS DATA — 2 per active course, 2 per completed course
// =============================================================================

export const COURSE_SESSIONS: CourseSession[] = [
  // MBA-501 Financial Management (active)
  {
    id: 'sess-01',
    courseId: 'crs-mba501',
    date: '2026-02-16',
    time: '6:00 PM',
    topic: 'Capital Budgeting: NPV & IRR Methods',
    type: 'lecture',
    status: 'upcoming',
  },
  {
    id: 'sess-02',
    courseId: 'crs-mba501',
    date: '2026-02-18',
    time: '6:00 PM',
    topic: 'Portfolio Theory & Risk-Return Tradeoff',
    type: 'workshop',
    status: 'upcoming',
  },
  // BUS-301 Business Strategy (active)
  {
    id: 'sess-03',
    courseId: 'crs-bus301',
    date: '2026-02-17',
    time: '10:00 AM',
    topic: "Porter's Five Forces Framework",
    type: 'lecture',
    status: 'upcoming',
  },
  {
    id: 'sess-04',
    courseId: 'crs-bus301',
    date: '2026-02-19',
    time: '10:00 AM',
    topic: 'Competitive Analysis Case Study Workshop',
    type: 'workshop',
    status: 'upcoming',
  },
  // DI-201 Sonographic Physics (active)
  {
    id: 'sess-05',
    courseId: 'crs-di201',
    date: '2026-02-16',
    time: '9:00 AM',
    topic: 'Transducer Technology & Frequency Selection',
    type: 'lecture',
    status: 'upcoming',
  },
  {
    id: 'sess-06',
    courseId: 'crs-di201',
    date: '2026-02-18',
    time: '9:00 AM',
    topic: 'Image Optimization & Artifact Reduction Lab',
    type: 'lab',
    status: 'upcoming',
  },
  // MBA-401 International Business (completed)
  {
    id: 'sess-07',
    courseId: 'crs-mba401',
    date: '2025-12-09',
    time: '6:00 PM',
    topic: 'Global Supply Chains & Logistics Management',
    type: 'lecture',
    status: 'completed',
  },
  {
    id: 'sess-08',
    courseId: 'crs-mba401',
    date: '2025-12-11',
    time: '6:00 PM',
    topic: 'Emerging Markets: Risk, Entry & Opportunity',
    type: 'seminar',
    status: 'completed',
  },
];

// =============================================================================
// ASSIGNMENTS DATA
// =============================================================================

export const ASSIGNMENTS: Assignment[] = [
  // MBA-501 Financial Management
  {
    id: 'asgn-01',
    courseId: 'crs-mba501',
    title: 'Capital Budgeting Case Analysis',
    type: 'paper',
    dueDate: '2026-03-02',
    maxPoints: 100,
    status: 'upcoming',
  },
  {
    id: 'asgn-02',
    courseId: 'crs-mba501',
    title: 'Midterm Examination',
    type: 'exam',
    dueDate: '2026-03-16',
    maxPoints: 150,
    status: 'upcoming',
  },
  // BUS-301 Business Strategy
  {
    id: 'asgn-03',
    courseId: 'crs-bus301',
    title: 'Industry Competitive Analysis Report',
    type: 'paper',
    dueDate: '2026-02-27',
    maxPoints: 100,
    status: 'upcoming',
  },
  {
    id: 'asgn-04',
    courseId: 'crs-bus301',
    title: 'Porter\'s Five Forces Quiz',
    type: 'quiz',
    dueDate: '2026-02-20',
    maxPoints: 50,
    status: 'upcoming',
  },
  // DI-201 Sonographic Physics
  {
    id: 'asgn-05',
    courseId: 'crs-di201',
    title: 'Transducer Selection Lab Report',
    type: 'project',
    dueDate: '2026-02-25',
    maxPoints: 80,
    status: 'upcoming',
  },
  // MBA-401 International Business (completed — graded)
  {
    id: 'asgn-06',
    courseId: 'crs-mba401',
    title: 'Emerging Markets Entry Strategy Paper',
    type: 'paper',
    dueDate: '2025-12-08',
    maxPoints: 200,
    status: 'graded',
  },
  {
    id: 'asgn-07',
    courseId: 'crs-mba401',
    title: 'Final Examination — International Business',
    type: 'exam',
    dueDate: '2025-12-11',
    maxPoints: 200,
    status: 'graded',
  },
];

// =============================================================================
// STUDENT GRADES DATA
// =============================================================================

export const STUDENT_GRADES: StudentGrade[] = [
  // Grades for MBA-401 Emerging Markets Paper (asgn-06)
  { id: 'gr-01', studentId: 'stu-01', courseId: 'crs-mba401', assignmentId: 'asgn-06', score: 174, maxPoints: 200, letterGrade: 'B+' },
  { id: 'gr-02', studentId: 'stu-02', courseId: 'crs-mba401', assignmentId: 'asgn-06', score: 192, maxPoints: 200, letterGrade: 'A' },
  { id: 'gr-03', studentId: 'stu-04', courseId: 'crs-mba401', assignmentId: 'asgn-06', score: 166, maxPoints: 200, letterGrade: 'B' },
  { id: 'gr-04', studentId: 'stu-05', courseId: 'crs-mba401', assignmentId: 'asgn-06', score: 154, maxPoints: 200, letterGrade: 'C+' },
  { id: 'gr-05', studentId: 'stu-07', courseId: 'crs-mba401', assignmentId: 'asgn-06', score: 180, maxPoints: 200, letterGrade: 'A-' },
  { id: 'gr-06', studentId: 'stu-08', courseId: 'crs-mba401', assignmentId: 'asgn-06', score: 188, maxPoints: 200, letterGrade: 'A-' },

  // Grades for MBA-401 Final Exam (asgn-07)
  { id: 'gr-07', studentId: 'stu-01', courseId: 'crs-mba401', assignmentId: 'asgn-07', score: 168, maxPoints: 200, letterGrade: 'B' },
  { id: 'gr-08', studentId: 'stu-02', courseId: 'crs-mba401', assignmentId: 'asgn-07', score: 186, maxPoints: 200, letterGrade: 'A-' },
  { id: 'gr-09', studentId: 'stu-04', courseId: 'crs-mba401', assignmentId: 'asgn-07', score: 160, maxPoints: 200, letterGrade: 'B-' },
  { id: 'gr-10', studentId: 'stu-05', courseId: 'crs-mba401', assignmentId: 'asgn-07', score: 148, maxPoints: 200, letterGrade: 'C+' },
  { id: 'gr-11', studentId: 'stu-07', courseId: 'crs-mba401', assignmentId: 'asgn-07', score: 176, maxPoints: 200, letterGrade: 'B+' },
  { id: 'gr-12', studentId: 'stu-08', courseId: 'crs-mba401', assignmentId: 'asgn-07', score: 184, maxPoints: 200, letterGrade: 'A-' },
];

// =============================================================================
// ADVISING NOTES DATA
// =============================================================================

export const ADVISING_NOTES: AdvisingNote[] = [
  {
    id: 'adv-01',
    studentId: 'stu-01',
    advisorId: 'staff-3',
    date: '2026-02-12',
    summary: 'Discussed outstanding tuition balance of $6,575 for Spring 2026. As an international student on F-1 visa, Wei is not eligible for federal aid. Payment plan established — first installment paid, second due March 15. Student requested extension and was advised to contact the Bursar directly.',
    nextStep: 'Confirm second installment receipt with Bursar Office by March 20',
    nextMeeting: '2026-03-23',
  },
  {
    id: 'adv-02',
    studentId: 'stu-06',
    advisorId: 'staff-3',
    date: '2026-02-09',
    summary: 'Attendance review — Lena has missed 3 of the last 8 DI-201 sessions. Lab attendance is mandatory per program policy. Discussed personal schedule conflicts related to part-time work. Created action plan with attendance check-ins every two weeks.',
    nextStep: 'Weekly attendance report from Ms. Kay forwarded to Dean of Students each Monday',
    nextMeeting: '2026-02-23',
  },
  {
    id: 'adv-03',
    studentId: 'stu-08',
    advisorId: 'staff-3',
    date: '2026-02-04',
    summary: 'Graduation planning meeting. Aisha is on track to complete BA — Business Administration in Spring 2026 with 90 of 120 credits done. Reviewed final 30 credits remaining. Discussed MBA pathway at Lincoln — she expressed strong interest in enrolling Fall 2026.',
    nextStep: 'Submit MBA application by April 1 deadline; request two faculty recommendation letters',
    nextMeeting: '2026-03-10',
  },
];

// =============================================================================
// ADVISING TASKS DATA
// =============================================================================

export const ADVISING_TASKS: AdvisingTask[] = [
  {
    id: 'atask-01',
    studentId: 'stu-01',
    title: 'Confirm Spring 2026 tuition payment plan installment 2',
    dueDate: '2026-03-20',
    owner: 'Dr. Mohamed Tailab',
    status: 'pending',
  },
  {
    id: 'atask-02',
    studentId: 'stu-06',
    title: 'Review DI-201 attendance report — contact student if below threshold',
    dueDate: '2026-02-23',
    owner: 'Dr. Mohamed Tailab',
    status: 'pending',
  },
];

// =============================================================================
// STUDENT HOLDS DATA
// =============================================================================

export const STUDENT_HOLDS: StudentHold[] = [
  {
    id: 'hold-01',
    studentId: 'stu-01',
    type: 'financial',
    reason: 'Tuition balance outstanding — $6,575 remaining for Spring 2026. Payment plan in progress.',
    placedDate: '2026-01-20',
    owner: 'Office of Student Accounts',
    status: 'active',
  },
];

// =============================================================================
// PAYMENT PLANS DATA
// =============================================================================

export const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'pp-01',
    studentId: 'stu-01',
    totalAmount: 13150,
    paidAmount: 6575,
    installments: 2,
    nextDue: '2026-03-15',
    status: 'active',
  },
];

// =============================================================================
// TRANSACTIONS DATA
// =============================================================================

export const TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-01',
    studentId: 'stu-01',
    date: '2026-01-15',
    description: 'Spring 2026 Tuition — Installment 1 of 2',
    amount: 6575,
    type: 'payment',
  },
  {
    id: 'txn-02',
    studentId: 'stu-01',
    date: '2025-12-10',
    description: 'Spring 2026 Tuition Charge',
    amount: 13150,
    type: 'charge',
  },
  {
    id: 'txn-03',
    studentId: 'stu-02',
    date: '2026-01-08',
    description: 'Spring 2026 Tuition — Full Payment',
    amount: 11260,
    type: 'payment',
  },
  {
    id: 'txn-04',
    studentId: 'stu-03',
    date: '2025-08-20',
    description: 'Fall 2025 Tuition — Full Payment',
    amount: 13150,
    type: 'payment',
  },
];

// =============================================================================
// DEGREE REQUIREMENTS DATA
// =============================================================================

export const DEGREE_REQUIREMENTS: DegreeRequirement[] = [
  {
    id: 'dreq-01',
    programId: 'prog-mba',
    category: 'General Core',
    name: 'MBA General Core (MBA General Core)',
    creditsRequired: 12,
    status: 'in_progress',
  },
  {
    id: 'dreq-02',
    programId: 'prog-mba',
    category: 'Specialization',
    name: 'Specialization Courses',
    creditsRequired: 18,
    status: 'in_progress',
  },
  {
    id: 'dreq-03',
    programId: 'prog-mba',
    category: 'Research',
    name: 'Research Methods',
    creditsRequired: 6,
    status: 'not_started',
  },
];

// =============================================================================
// HELPERS
// =============================================================================

export function getOrgById(id: string): EducationOrg | undefined {
  return EDUCATION_ORGS.find((o) => o.id === id);
}

export function getProgramsByOrg(orgId: string): Program[] {
  return PROGRAMS.filter((p) => p.orgId === orgId);
}

export function getStudentsByProgram(programId: string): Student[] {
  return STUDENTS.filter((s) => s.programId === programId);
}

export function getCoursesByProgram(programId: string): Course[] {
  return COURSES.filter((c) => c.programId === programId);
}

export function getSessionsByCourse(courseId: string): CourseSession[] {
  return COURSE_SESSIONS.filter((s) => s.courseId === courseId);
}

export function getAssignmentsByCourse(courseId: string): Assignment[] {
  return ASSIGNMENTS.filter((a) => a.courseId === courseId);
}

export function getGradesByStudent(studentId: string): StudentGrade[] {
  return STUDENT_GRADES.filter((g) => g.studentId === studentId);
}

export function getGradesByCourse(courseId: string): StudentGrade[] {
  return STUDENT_GRADES.filter((g) => g.courseId === courseId);
}

export function getAdvisingNotes(studentId: string): AdvisingNote[] {
  return ADVISING_NOTES.filter((n) => n.studentId === studentId);
}

export function getHoldsByStudent(studentId: string): StudentHold[] {
  return STUDENT_HOLDS.filter((h) => h.studentId === studentId);
}

export function getPaymentPlan(studentId: string): PaymentPlan | undefined {
  return PAYMENT_PLANS.find((p) => p.studentId === studentId);
}

export function getTransactions(studentId: string): Transaction[] {
  return TRANSACTIONS.filter((t) => t.studentId === studentId);
}

export function getStudentsWithHolds(): Student[] {
  const holdStudentIds = STUDENT_HOLDS.filter((h) => h.status === 'active').map((h) => h.studentId);
  return STUDENTS.filter((s) => holdStudentIds.includes(s.id));
}

export function getStudentsAtRisk(): Student[] {
  return STUDENTS.filter((s) => s.attendanceRisk === 'high' || s.attendanceRisk === 'medium');
}
