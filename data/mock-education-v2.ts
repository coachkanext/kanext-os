/**
 * Mock Education V2 Data — Complete data layer for Education Mode.
 * Organizations | Programs | Students | Courses | Grades | Advising | Billing
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
  { id: 'fmu', name: 'KaNeXT Sports', abbreviation: 'KaNeXT', type: 'university', city: 'Miami Gardens', state: 'FL', status: 'active' },
  { id: 'kanext-academy', name: 'KaNeXT Academy', abbreviation: 'KXA', type: 'academy', city: 'Miami', state: 'FL', status: 'active' },
];

// =============================================================================
// PROGRAMS DATA
// =============================================================================

export const PROGRAMS: Program[] = [
  {
    id: 'prog-adalp',
    name: 'Athletic Department Academic Liaison Program',
    orgId: 'fmu',
    level: 'bachelor',
    status: 'active',
    enrollmentCount: 45,
    retentionRisk: 'low',
    creditsRequired: 120,
  },
];

// =============================================================================
// STAFF MEMBERS DATA
// =============================================================================

export const STAFF_MEMBERS: StaffMember[] = [
  { id: 'staff-1', name: 'Dr. Angela Morris', role: 'Program Director', department: 'Academic Affairs', orgId: 'fmu', email: 'a.morris@fmu.edu' },
  { id: 'staff-2', name: 'Prof. David Osei', role: 'Instructor — Sports Management', department: 'Business & Sport', orgId: 'fmu', email: 'd.osei@fmu.edu' },
  { id: 'staff-3', name: 'Prof. Linda Reyes', role: 'Instructor — Kinesiology', department: 'Health Sciences', orgId: 'fmu', email: 'l.reyes@fmu.edu' },
  { id: 'staff-4', name: 'Karen Mitchell', role: 'Administrative Coordinator', department: 'Academic Affairs', orgId: 'fmu', email: 'k.mitchell@fmu.edu' },
];

// =============================================================================
// STUDENTS DATA
// =============================================================================

export const STUDENTS: Student[] = [
  // 8 enrolled
  {
    id: 'stu-01',
    name: 'Marcus Johnson',
    orgId: 'fmu',
    programId: 'prog-adalp',
    status: 'enrolled',
    holds: ['none'],
    creditsCompleted: 78,
    creditsRequired: 120,
    gpa: 3.42,
    attendanceRisk: 'low',
    cohort: 'Fall 2023',
    email: 'm.johnson@fmu.edu',
    advisorId: 'staff-1',
  },
  {
    id: 'stu-02',
    name: 'Destiny Williams',
    orgId: 'fmu',
    programId: 'prog-adalp',
    status: 'enrolled',
    holds: ['none'],
    creditsCompleted: 90,
    creditsRequired: 120,
    gpa: 3.81,
    attendanceRisk: 'low',
    cohort: 'Fall 2022',
    email: 'd.williams@fmu.edu',
    advisorId: 'staff-1',
    parentId: 'parent-01',
  },
  {
    id: 'stu-03',
    name: 'Jaylen Carter',
    orgId: 'fmu',
    programId: 'prog-adalp',
    status: 'enrolled',
    holds: ['financial'],
    creditsCompleted: 45,
    creditsRequired: 120,
    gpa: 2.78,
    attendanceRisk: 'medium',
    cohort: 'Spring 2024',
    email: 'j.carter@fmu.edu',
    phone: '(305) 555-0147',
    advisorId: 'staff-1',
  },
  {
    id: 'stu-04',
    name: 'Aaliyah Brooks',
    orgId: 'fmu',
    programId: 'prog-adalp',
    status: 'enrolled',
    holds: ['none'],
    creditsCompleted: 60,
    creditsRequired: 120,
    gpa: 3.15,
    attendanceRisk: 'low',
    cohort: 'Fall 2023',
    email: 'a.brooks@fmu.edu',
    advisorId: 'staff-1',
    parentId: 'parent-02',
  },
  {
    id: 'stu-05',
    name: 'Terrence Okafor',
    orgId: 'fmu',
    programId: 'prog-adalp',
    status: 'enrolled',
    holds: ['none'],
    creditsCompleted: 33,
    creditsRequired: 120,
    gpa: 3.55,
    attendanceRisk: 'low',
    cohort: 'Spring 2024',
    email: 't.okafor@fmu.edu',
    advisorId: 'staff-1',
  },
  {
    id: 'stu-06',
    name: 'Kayla Thomas',
    orgId: 'fmu',
    programId: 'prog-adalp',
    status: 'enrolled',
    holds: ['none'],
    creditsCompleted: 15,
    creditsRequired: 120,
    gpa: 2.95,
    attendanceRisk: 'high',
    cohort: 'Fall 2025',
    email: 'k.thomas@fmu.edu',
    advisorId: 'staff-1',
  },
  {
    id: 'stu-07',
    name: 'Brandon Mitchell',
    orgId: 'fmu',
    programId: 'prog-adalp',
    status: 'enrolled',
    holds: ['none'],
    creditsCompleted: 54,
    creditsRequired: 120,
    gpa: 3.22,
    attendanceRisk: 'low',
    cohort: 'Fall 2023',
    email: 'b.mitchell@fmu.edu',
    advisorId: 'staff-1',
  },
  {
    id: 'stu-08',
    name: 'Imani Davis',
    orgId: 'fmu',
    programId: 'prog-adalp',
    status: 'enrolled',
    holds: ['none'],
    creditsCompleted: 72,
    creditsRequired: 120,
    gpa: 3.68,
    attendanceRisk: 'low',
    cohort: 'Spring 2023',
    email: 'i.davis@fmu.edu',
    advisorId: 'staff-1',
  },
  // 2 applicants
  {
    id: 'stu-09',
    name: 'Xavier Green',
    orgId: 'fmu',
    programId: 'prog-adalp',
    status: 'applicant',
    holds: ['none'],
    creditsCompleted: 0,
    creditsRequired: 120,
    gpa: 0,
    attendanceRisk: 'low',
    cohort: 'Fall 2026',
    email: 'x.green@gmail.com',
  },
  {
    id: 'stu-10',
    name: 'Brianna Sanchez',
    orgId: 'fmu',
    programId: 'prog-adalp',
    status: 'applicant',
    holds: ['none'],
    creditsCompleted: 0,
    creditsRequired: 120,
    gpa: 0,
    attendanceRisk: 'low',
    cohort: 'Fall 2026',
    email: 'b.sanchez@outlook.com',
  },
  // 1 on leave
  {
    id: 'stu-11',
    name: 'DeAndre Washington',
    orgId: 'fmu',
    programId: 'prog-adalp',
    status: 'leave',
    holds: ['none'],
    creditsCompleted: 48,
    creditsRequired: 120,
    gpa: 2.51,
    attendanceRisk: 'medium',
    cohort: 'Spring 2024',
    email: 'd.washington@fmu.edu',
    advisorId: 'staff-1',
  },
  // 1 alumni
  {
    id: 'stu-12',
    name: 'Jasmine Reed',
    orgId: 'fmu',
    programId: 'prog-adalp',
    status: 'alumni',
    holds: ['none'],
    creditsCompleted: 120,
    creditsRequired: 120,
    gpa: 3.74,
    attendanceRisk: 'low',
    cohort: 'Fall 2021',
    email: 'j.reed@alumni.fmu.edu',
  },
];

// =============================================================================
// COURSES DATA
// =============================================================================

export const COURSES: Course[] = [
  {
    id: 'crs-smg301',
    name: 'Sports Management 301',
    code: 'SMG-301',
    orgId: 'fmu',
    programId: 'prog-adalp',
    term: 'Spring 2026',
    meetingTimes: 'Mon/Wed 10:00 AM – 11:15 AM',
    instructorId: 'staff-2',
    instructorName: 'Prof. David Osei',
    status: 'active',
    enrolledCount: 28,
    capacity: 35,
  },
  {
    id: 'crs-kin201',
    name: 'Kinesiology 201',
    code: 'KIN-201',
    orgId: 'fmu',
    programId: 'prog-adalp',
    term: 'Spring 2026',
    meetingTimes: 'Tue/Thu 1:00 PM – 2:15 PM',
    instructorId: 'staff-3',
    instructorName: 'Prof. Linda Reyes',
    status: 'active',
    enrolledCount: 32,
    capacity: 40,
  },
  {
    id: 'crs-eng101',
    name: 'English Composition 101',
    code: 'ENG-101',
    orgId: 'fmu',
    programId: 'prog-adalp',
    term: 'Fall 2025',
    meetingTimes: 'Mon/Wed/Fri 9:00 AM – 9:50 AM',
    instructorId: 'staff-2',
    instructorName: 'Prof. David Osei',
    status: 'completed',
    enrolledCount: 30,
    capacity: 35,
  },
  {
    id: 'crs-stat200',
    name: 'Statistics 200',
    code: 'STAT-200',
    orgId: 'fmu',
    programId: 'prog-adalp',
    term: 'Fall 2025',
    meetingTimes: 'Tue/Thu 10:30 AM – 11:45 AM',
    instructorId: 'staff-3',
    instructorName: 'Prof. Linda Reyes',
    status: 'completed',
    enrolledCount: 26,
    capacity: 30,
  },
];

// =============================================================================
// COURSE SESSIONS DATA — 2 per active course
// =============================================================================

export const COURSE_SESSIONS: CourseSession[] = [
  // Sports Management 301
  {
    id: 'sess-01',
    courseId: 'crs-smg301',
    date: '2026-02-17',
    time: '10:00 AM',
    topic: 'Revenue Models in Collegiate Athletics',
    type: 'lecture',
    status: 'upcoming',
  },
  {
    id: 'sess-02',
    courseId: 'crs-smg301',
    date: '2026-02-19',
    time: '10:00 AM',
    topic: 'NIL Case Study Workshop',
    type: 'workshop',
    status: 'upcoming',
  },
  // Kinesiology 201
  {
    id: 'sess-03',
    courseId: 'crs-kin201',
    date: '2026-02-17',
    time: '1:00 PM',
    topic: 'Biomechanics of the Knee Joint',
    type: 'lecture',
    status: 'upcoming',
  },
  {
    id: 'sess-04',
    courseId: 'crs-kin201',
    date: '2026-02-19',
    time: '1:00 PM',
    topic: 'Motion Capture Lab — Gait Analysis',
    type: 'lab',
    status: 'upcoming',
  },
  // English Composition 101 (completed)
  {
    id: 'sess-05',
    courseId: 'crs-eng101',
    date: '2025-12-08',
    time: '9:00 AM',
    topic: 'Final Essay Review Session',
    type: 'seminar',
    status: 'completed',
  },
  {
    id: 'sess-06',
    courseId: 'crs-eng101',
    date: '2025-12-12',
    time: '9:00 AM',
    topic: 'Final Examination',
    type: 'exam',
    status: 'completed',
  },
  // Statistics 200 (completed)
  {
    id: 'sess-07',
    courseId: 'crs-stat200',
    date: '2025-12-09',
    time: '10:30 AM',
    topic: 'Regression Analysis Review',
    type: 'lecture',
    status: 'completed',
  },
  {
    id: 'sess-08',
    courseId: 'crs-stat200',
    date: '2025-12-11',
    time: '10:30 AM',
    topic: 'Final Examination',
    type: 'exam',
    status: 'completed',
  },
];

// =============================================================================
// ASSIGNMENTS DATA
// =============================================================================

export const ASSIGNMENTS: Assignment[] = [
  // Sports Management 301
  {
    id: 'asgn-01',
    courseId: 'crs-smg301',
    title: 'Revenue Model Analysis Paper',
    type: 'paper',
    dueDate: '2026-02-28',
    maxPoints: 100,
    status: 'upcoming',
  },
  {
    id: 'asgn-02',
    courseId: 'crs-smg301',
    title: 'Midterm Exam',
    type: 'exam',
    dueDate: '2026-03-12',
    maxPoints: 150,
    status: 'upcoming',
  },
  // Kinesiology 201
  {
    id: 'asgn-03',
    courseId: 'crs-kin201',
    title: 'Gait Analysis Lab Report',
    type: 'project',
    dueDate: '2026-02-24',
    maxPoints: 80,
    status: 'upcoming',
  },
  {
    id: 'asgn-04',
    courseId: 'crs-kin201',
    title: 'Chapter 5-7 Quiz',
    type: 'quiz',
    dueDate: '2026-02-20',
    maxPoints: 50,
    status: 'upcoming',
  },
  // English Composition 101 (completed — graded)
  {
    id: 'asgn-05',
    courseId: 'crs-eng101',
    title: 'Final Argumentative Essay',
    type: 'paper',
    dueDate: '2025-12-10',
    maxPoints: 200,
    status: 'graded',
  },
  // Statistics 200 (completed — graded)
  {
    id: 'asgn-06',
    courseId: 'crs-stat200',
    title: 'Final Exam — Applied Statistics',
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
  // Grades for ENG-101 Final Essay (asgn-05)
  { id: 'gr-01', studentId: 'stu-01', courseId: 'crs-eng101', assignmentId: 'asgn-05', score: 172, maxPoints: 200, letterGrade: 'B+' },
  { id: 'gr-02', studentId: 'stu-02', courseId: 'crs-eng101', assignmentId: 'asgn-05', score: 190, maxPoints: 200, letterGrade: 'A' },
  { id: 'gr-03', studentId: 'stu-03', courseId: 'crs-eng101', assignmentId: 'asgn-05', score: 148, maxPoints: 200, letterGrade: 'C+' },
  { id: 'gr-04', studentId: 'stu-04', courseId: 'crs-eng101', assignmentId: 'asgn-05', score: 164, maxPoints: 200, letterGrade: 'B' },
  { id: 'gr-05', studentId: 'stu-05', courseId: 'crs-eng101', assignmentId: 'asgn-05', score: 182, maxPoints: 200, letterGrade: 'A-' },
  { id: 'gr-06', studentId: 'stu-08', courseId: 'crs-eng101', assignmentId: 'asgn-05', score: 186, maxPoints: 200, letterGrade: 'A-' },

  // Grades for STAT-200 Final Exam (asgn-06)
  { id: 'gr-07', studentId: 'stu-01', courseId: 'crs-stat200', assignmentId: 'asgn-06', score: 168, maxPoints: 200, letterGrade: 'B' },
  { id: 'gr-08', studentId: 'stu-02', courseId: 'crs-stat200', assignmentId: 'asgn-06', score: 184, maxPoints: 200, letterGrade: 'A-' },
  { id: 'gr-09', studentId: 'stu-04', courseId: 'crs-stat200', assignmentId: 'asgn-06', score: 156, maxPoints: 200, letterGrade: 'B-' },
  { id: 'gr-10', studentId: 'stu-07', courseId: 'crs-stat200', assignmentId: 'asgn-06', score: 162, maxPoints: 200, letterGrade: 'B' },
  { id: 'gr-11', studentId: 'stu-08', courseId: 'crs-stat200', assignmentId: 'asgn-06', score: 178, maxPoints: 200, letterGrade: 'B+' },
  { id: 'gr-12', studentId: 'stu-05', courseId: 'crs-stat200', assignmentId: 'asgn-06', score: 174, maxPoints: 200, letterGrade: 'B+' },
];

// =============================================================================
// ADVISING NOTES DATA
// =============================================================================

export const ADVISING_NOTES: AdvisingNote[] = [
  {
    id: 'adv-01',
    studentId: 'stu-03',
    advisorId: 'staff-1',
    date: '2026-02-10',
    summary: 'Discussed financial hold on account. Student is working with Financial Aid to resolve unpaid tuition balance. Explored part-time work-study options. Student seemed motivated to resolve quickly.',
    nextStep: 'Follow up with Financial Aid office on work-study eligibility',
    nextMeeting: '2026-02-24',
  },
  {
    id: 'adv-02',
    studentId: 'stu-06',
    advisorId: 'staff-1',
    date: '2026-02-07',
    summary: 'Attendance review — student has missed 4 of last 10 sessions across two courses. Discussed personal challenges affecting class attendance. Created action plan with weekly check-ins.',
    nextStep: 'Weekly attendance check-in via email each Friday',
    nextMeeting: '2026-02-21',
  },
  {
    id: 'adv-03',
    studentId: 'stu-02',
    advisorId: 'staff-1',
    date: '2026-01-28',
    summary: 'Senior planning session. On track to graduate Spring 2026 with 90 credits completed. Reviewed remaining 30 credits needed. Discussed capstone project options and potential graduate programs.',
    nextStep: 'Submit capstone topic proposal by March 1',
    nextMeeting: '2026-03-04',
  },
];

// =============================================================================
// ADVISING TASKS DATA
// =============================================================================

export const ADVISING_TASKS: AdvisingTask[] = [
  {
    id: 'atask-01',
    studentId: 'stu-03',
    title: 'Complete midterm grade review',
    dueDate: '2026-02-19',
    owner: 'Dr. Angela Morris',
    status: 'pending',
  },
  {
    id: 'atask-02',
    studentId: 'stu-06',
    title: 'Schedule spring advising sessions',
    dueDate: '2026-02-24',
    owner: 'Dr. Angela Morris',
    status: 'pending',
  },
];

// =============================================================================
// STUDENT HOLDS DATA
// =============================================================================

export const STUDENT_HOLDS: StudentHold[] = [
  {
    id: 'hold-01',
    studentId: 'stu-03',
    type: 'financial',
    reason: 'Unpaid tuition balance — $3,200 outstanding for Spring 2026 semester',
    placedDate: '2026-01-15',
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
    studentId: 'stu-03',
    totalAmount: 12000,
    paidAmount: 4000,
    installments: 4,
    nextDue: '2026-03-01',
    status: 'active',
  },
];

// =============================================================================
// TRANSACTIONS DATA
// =============================================================================

export const TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-01',
    studentId: 'stu-03',
    date: '2026-01-10',
    description: 'Spring 2026 Tuition — Installment 1',
    amount: 4000,
    type: 'payment',
  },
  {
    id: 'txn-02',
    studentId: 'stu-03',
    date: '2025-12-15',
    description: 'Spring 2026 Tuition Charge',
    amount: 12000,
    type: 'charge',
  },
  {
    id: 'txn-03',
    studentId: 'stu-02',
    date: '2026-01-05',
    description: 'Spring 2026 Tuition — Full Payment',
    amount: 11500,
    type: 'payment',
  },
  {
    id: 'txn-04',
    studentId: 'stu-01',
    date: '2026-01-12',
    description: 'Lab Fee Refund — KIN-201 section change',
    amount: 150,
    type: 'refund',
  },
];

// =============================================================================
// DEGREE REQUIREMENTS DATA
// =============================================================================

export const DEGREE_REQUIREMENTS: DegreeRequirement[] = [
  {
    id: 'dreq-01',
    programId: 'prog-adalp',
    category: 'General Education',
    name: 'Core General Education',
    creditsRequired: 30,
    status: 'in_progress',
  },
  {
    id: 'dreq-02',
    programId: 'prog-adalp',
    category: 'Major Courses',
    name: 'Sports Management Core',
    creditsRequired: 36,
    status: 'in_progress',
  },
  {
    id: 'dreq-03',
    programId: 'prog-adalp',
    category: 'Major Courses',
    name: 'Kinesiology + Health Sciences',
    creditsRequired: 18,
    status: 'in_progress',
  },
  {
    id: 'dreq-04',
    programId: 'prog-adalp',
    category: 'Electives',
    name: 'Free Electives',
    creditsRequired: 18,
    status: 'not_started',
  },
  {
    id: 'dreq-05',
    programId: 'prog-adalp',
    category: 'Practicum',
    name: 'Athletic Department Practicum',
    creditsRequired: 12,
    status: 'not_started',
  },
  {
    id: 'dreq-06',
    programId: 'prog-adalp',
    category: 'Capstone',
    name: 'Senior Capstone Project',
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
