/**
 * Education Mode RBAC — 4-level role lens visibility matrix.
 * ED1: Program Director (Program-level access)
 * ED2: Student (Self-only access)
 * ED3: Full Access (Founder + Head of BBall Ops)
 * ED4: Parent / Guardian (Dependent-only access)
 */

// =============================================================================
// ROLE LEVELS
// =============================================================================

export type EducationRoleLens = 'ED1' | 'ED2' | 'ED3' | 'ED4';

export type EducationVisibility = 'full' | 'limited' | 'self_only' | 'hidden';

export const EDUCATION_ROLE_LABELS: Record<EducationRoleLens, string> = {
  ED1: 'Program Director',
  ED2: 'Student',
  ED3: 'Administrator',
  ED4: 'Parent / Guardian',
};

// =============================================================================
// STUDENT SHEET TAB VISIBILITY
// =============================================================================

export type StudentTab =
  | 'overview' | 'schedule' | 'courses' | 'progress' | 'attendance'
  | 'advising' | 'holds_compliance' | 'billing_payment' | 'documents';

const STUDENT_TAB_MATRIX: Record<StudentTab, Record<EducationRoleLens, EducationVisibility>> = {
  overview:          { ED1: 'limited',   ED2: 'self_only', ED3: 'full', ED4: 'self_only' },
  schedule:          { ED1: 'limited',   ED2: 'self_only', ED3: 'full', ED4: 'limited'   },
  courses:           { ED1: 'limited',   ED2: 'self_only', ED3: 'full', ED4: 'limited'   },
  progress:          { ED1: 'limited',   ED2: 'self_only', ED3: 'full', ED4: 'limited'   },
  attendance:        { ED1: 'limited',   ED2: 'self_only', ED3: 'full', ED4: 'limited'   },
  advising:          { ED1: 'limited',   ED2: 'self_only', ED3: 'full', ED4: 'limited'   },
  holds_compliance:  { ED1: 'limited',   ED2: 'self_only', ED3: 'full', ED4: 'limited'   },
  billing_payment:   { ED1: 'limited',   ED2: 'hidden',    ED3: 'full', ED4: 'limited'   },
  documents:         { ED1: 'limited',   ED2: 'self_only', ED3: 'full', ED4: 'limited'   },
};

export function getStudentSheetTabs(role: EducationRoleLens): { id: StudentTab; label: string; visibility: EducationVisibility }[] {
  const labels: Record<StudentTab, string> = {
    overview: 'Overview',
    schedule: 'Schedule',
    courses: 'Courses',
    progress: 'Progress',
    attendance: 'Attendance',
    advising: 'Advising',
    holds_compliance: 'Holds + Compliance',
    billing_payment: 'Billing + Payment Rails',
    documents: 'Documents',
  };
  return (Object.keys(STUDENT_TAB_MATRIX) as StudentTab[])
    .filter((tab) => STUDENT_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: STUDENT_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// COURSE SHEET TAB VISIBILITY
// =============================================================================

export type CourseTab =
  | 'overview' | 'syllabus' | 'sessions' | 'roster' | 'assignments'
  | 'grades' | 'attendance' | 'operations' | 'compliance';

const COURSE_TAB_MATRIX: Record<CourseTab, Record<EducationRoleLens, EducationVisibility>> = {
  overview:    { ED1: 'limited',   ED2: 'self_only', ED3: 'full', ED4: 'limited' },
  syllabus:    { ED1: 'limited',   ED2: 'self_only', ED3: 'full', ED4: 'limited' },
  sessions:    { ED1: 'limited',   ED2: 'self_only', ED3: 'full', ED4: 'limited' },
  roster:      { ED1: 'limited',   ED2: 'hidden',    ED3: 'full', ED4: 'hidden'  },
  assignments: { ED1: 'limited',   ED2: 'self_only', ED3: 'full', ED4: 'limited' },
  grades:      { ED1: 'limited',   ED2: 'self_only', ED3: 'full', ED4: 'limited' },
  attendance:  { ED1: 'limited',   ED2: 'self_only', ED3: 'full', ED4: 'limited' },
  operations:  { ED1: 'limited',   ED2: 'hidden',    ED3: 'full', ED4: 'hidden'  },
  compliance:  { ED1: 'limited',   ED2: 'hidden',    ED3: 'full', ED4: 'hidden'  },
};

export function getCourseSheetTabs(role: EducationRoleLens): { id: CourseTab; label: string; visibility: EducationVisibility }[] {
  const labels: Record<CourseTab, string> = {
    overview: 'Overview',
    syllabus: 'Syllabus',
    sessions: 'Sessions',
    roster: 'Roster',
    assignments: 'Assignments',
    grades: 'Grades',
    attendance: 'Attendance',
    operations: 'Operations',
    compliance: 'Compliance',
  };
  return (Object.keys(COURSE_TAB_MATRIX) as CourseTab[])
    .filter((tab) => COURSE_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: COURSE_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// PROGRAM SHEET TAB VISIBILITY
// =============================================================================

export type ProgramTab =
  | 'overview' | 'people' | 'courses' | 'students' | 'calendar'
  | 'operations' | 'finance' | 'payment_rails' | 'compliance' | 'reports';

const PROGRAM_TAB_MATRIX: Record<ProgramTab, Record<EducationRoleLens, EducationVisibility>> = {
  overview:      { ED1: 'limited',   ED2: 'limited', ED3: 'full', ED4: 'limited' },
  people:        { ED1: 'limited',   ED2: 'limited', ED3: 'full', ED4: 'limited' },
  courses:       { ED1: 'limited',   ED2: 'limited', ED3: 'full', ED4: 'limited' },
  students:      { ED1: 'limited',   ED2: 'hidden',  ED3: 'full', ED4: 'hidden'  },
  calendar:      { ED1: 'limited',   ED2: 'limited', ED3: 'full', ED4: 'limited' },
  operations:    { ED1: 'limited',   ED2: 'hidden',  ED3: 'full', ED4: 'hidden'  },
  finance:       { ED1: 'limited',   ED2: 'hidden',  ED3: 'full', ED4: 'hidden'  },
  payment_rails: { ED1: 'limited',   ED2: 'hidden',  ED3: 'full', ED4: 'hidden'  },
  compliance:    { ED1: 'limited',   ED2: 'hidden',  ED3: 'full', ED4: 'hidden'  },
  reports:       { ED1: 'limited',   ED2: 'hidden',  ED3: 'full', ED4: 'hidden'  },
};

export function getProgramSheetTabs(role: EducationRoleLens): { id: ProgramTab; label: string; visibility: EducationVisibility }[] {
  const labels: Record<ProgramTab, string> = {
    overview: 'Overview',
    people: 'People',
    courses: 'Courses',
    students: 'Students',
    calendar: 'Calendar',
    operations: 'Operations',
    finance: 'Finance',
    payment_rails: 'Payment Rails',
    compliance: 'Compliance',
    reports: 'Reports',
  };
  return (Object.keys(PROGRAM_TAB_MATRIX) as ProgramTab[])
    .filter((tab) => PROGRAM_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: PROGRAM_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// ROLE MAPPING
// =============================================================================

export function mapRoleToEducationLens(role: string): EducationRoleLens {
  switch (role) {
    case 'program_director':
    case 'director':
    case 'department_head':
      return 'ED1';
    case 'student':
    case 'learner':
      return 'ED2';
    case 'founder':
    case 'admin':
    case 'administrator':
    case 'head_of_ops':
    case 'owner':
      return 'ED3';
    case 'parent':
    case 'guardian':
    case 'family':
    default:
      return 'ED4';
  }
}

// =============================================================================
// VISIBILITY HELPERS
// =============================================================================

export function isFullAccess(role: EducationRoleLens): boolean {
  return role === 'ED3';
}

export function isProgramDirector(role: EducationRoleLens): boolean {
  return role === 'ED1';
}

export function isStudentOrParent(role: EducationRoleLens): boolean {
  return role === 'ED2' || role === 'ED4';
}

/**
 * Grade visibility by role:
 * - ED1 (Program Director): aggregate only — class averages, distribution, no individual grades
 * - ED2 (Student): self only — sees own grades across all enrolled courses
 * - ED3 (Administrator): full — all students, all courses, all grades
 * - ED4 (Parent / Guardian): dependent only — sees linked dependent's grades
 */
export function canViewGrades(role: EducationRoleLens): boolean {
  return role !== 'ED4' || true; // all roles can view some form of grades
}

export type GradeAccessLevel = 'full' | 'aggregate' | 'self' | 'dependent';

export function getGradeAccessLevel(role: EducationRoleLens): GradeAccessLevel {
  switch (role) {
    case 'ED3': return 'full';
    case 'ED1': return 'aggregate';
    case 'ED2': return 'self';
    case 'ED4': return 'dependent';
  }
}

export function canSeeStudentTab(tab: StudentTab, role: EducationRoleLens): boolean {
  return STUDENT_TAB_MATRIX[tab][role] !== 'hidden';
}

export function canSeeCourseTab(tab: CourseTab, role: EducationRoleLens): boolean {
  return COURSE_TAB_MATRIX[tab][role] !== 'hidden';
}

export function canSeeProgramTab(tab: ProgramTab, role: EducationRoleLens): boolean {
  return PROGRAM_TAB_MATRIX[tab][role] !== 'hidden';
}
