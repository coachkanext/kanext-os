/**
 * Education Mode RBAC — 5-level role lens visibility matrix.
 * E1: President / Chancellor (Full access)
 * E2: Provost / Dean
 * E3: Faculty / Staff
 * E4: Student
 * E5: Public
 */

// =============================================================================
// ROLE LEVELS
// =============================================================================

export type EducationRoleLens = 'E1' | 'E2' | 'E3' | 'E4' | 'E5';

export type EducationVisibility = 'full' | 'exact' | 'limited' | 'hidden';

export const EDUCATION_ROLE_LABELS: Record<EducationRoleLens, string> = {
  E1: 'President / Chancellor',
  E2: 'Provost / Dean',
  E3: 'Faculty / Staff',
  E4: 'Student',
  E5: 'Public',
};

// =============================================================================
// HOME TAB VISIBILITY
// =============================================================================

export type EducationHomeTab =
  | 'dashboard' | 'calendar' | 'academics' | 'campus' | 'people'
  | 'admissions' | 'athletics' | 'financial' | 'housing' | 'policies';

const EDU_HOME_TAB_MATRIX: Record<EducationHomeTab, Record<EducationRoleLens, EducationVisibility>> = {
  dashboard:  { E1: 'full', E2: 'full', E3: 'full', E4: 'limited', E5: 'limited' },
  calendar:   { E1: 'full', E2: 'full', E3: 'full', E4: 'full',    E5: 'limited' },
  academics:  { E1: 'full', E2: 'full', E3: 'full', E4: 'limited', E5: 'limited' },
  campus:     { E1: 'full', E2: 'full', E3: 'full', E4: 'full',    E5: 'full' },
  people:     { E1: 'full', E2: 'full', E3: 'full', E4: 'limited', E5: 'hidden' },
  admissions: { E1: 'full', E2: 'full', E3: 'limited', E4: 'limited', E5: 'full' },
  athletics:  { E1: 'full', E2: 'full', E3: 'full', E4: 'full',    E5: 'full' },
  financial:  { E1: 'full', E2: 'full', E3: 'limited', E4: 'limited', E5: 'hidden' },
  housing:    { E1: 'full', E2: 'full', E3: 'full', E4: 'full',    E5: 'limited' },
  policies:   { E1: 'full', E2: 'full', E3: 'full', E4: 'limited', E5: 'limited' },
};

export function getEduHomeTabVisibility(tab: EducationHomeTab, role: EducationRoleLens): EducationVisibility {
  return EDU_HOME_TAB_MATRIX[tab]?.[role] ?? 'hidden';
}

// =============================================================================
// ORG TAB VISIBILITY
// =============================================================================

export type EducationOrgTab =
  | 'institutions' | 'people' | 'rooms' | 'operations' | 'finance'
  | 'payment-rails' | 'compliance' | 'facilities' | 'resources' | 'sponsors';

const EDU_ORG_TAB_MATRIX: Record<EducationOrgTab, Record<EducationRoleLens, EducationVisibility>> = {
  institutions:    { E1: 'full', E2: 'full',    E3: 'full',    E4: 'limited', E5: 'limited' },
  people:          { E1: 'full', E2: 'full',    E3: 'full',    E4: 'limited', E5: 'hidden' },
  rooms:           { E1: 'full', E2: 'full',    E3: 'full',    E4: 'limited', E5: 'hidden' },
  operations:      { E1: 'full', E2: 'full',    E3: 'limited', E4: 'hidden',  E5: 'hidden' },
  finance:         { E1: 'full', E2: 'full',    E3: 'limited', E4: 'hidden',  E5: 'hidden' },
  'payment-rails': { E1: 'full', E2: 'full',    E3: 'hidden',  E4: 'hidden',  E5: 'hidden' },
  compliance:      { E1: 'full', E2: 'full',    E3: 'limited', E4: 'hidden',  E5: 'hidden' },
  facilities:      { E1: 'full', E2: 'full',    E3: 'full',    E4: 'limited', E5: 'hidden' },
  resources:       { E1: 'full', E2: 'full',    E3: 'full',    E4: 'full',    E5: 'limited' },
  sponsors:        { E1: 'full', E2: 'full',    E3: 'limited', E4: 'hidden',  E5: 'limited' },
};

export function getEduOrgTabVisibility(tab: EducationOrgTab, role: EducationRoleLens): EducationVisibility {
  return EDU_ORG_TAB_MATRIX[tab]?.[role] ?? 'hidden';
}

export function getVisibleEduOrgTabs(role: EducationRoleLens): EducationOrgTab[] {
  return (Object.keys(EDU_ORG_TAB_MATRIX) as EducationOrgTab[])
    .filter((tab) => EDU_ORG_TAB_MATRIX[tab][role] !== 'hidden');
}

// =============================================================================
// QUICK ACTIONS BY ROLE
// =============================================================================

export interface EducationQuickAction {
  id: string;
  label: string;
  icon: string;
}

const EDU_QUICK_ACTIONS: Record<EducationRoleLens, EducationQuickAction[]> = {
  E1: [
    { id: 'enrollment', label: 'Enrollment', icon: 'person.3.fill' },
    { id: 'budget', label: 'Budget Overview', icon: 'dollarsign.circle.fill' },
    { id: 'strategic-plan', label: 'Strategic Plan', icon: 'map.fill' },
    { id: 'accreditation', label: 'Accreditation', icon: 'checkmark.seal.fill' },
    { id: 'board-report', label: 'Board Report', icon: 'doc.text.fill' },
    { id: 'campus-safety', label: 'Campus Safety', icon: 'shield.fill' },
  ],
  E2: [
    { id: 'academic-programs', label: 'Academic Programs', icon: 'book.fill' },
    { id: 'faculty-hiring', label: 'Faculty Hiring', icon: 'person.badge.plus' },
    { id: 'curriculum', label: 'Curriculum Review', icon: 'doc.text.fill' },
    { id: 'research', label: 'Research Grants', icon: 'magnifyingglass' },
  ],
  E3: [
    { id: 'my-courses', label: 'My Courses', icon: 'book.fill' },
    { id: 'grading', label: 'Grading', icon: 'checkmark.circle.fill' },
    { id: 'office-hours', label: 'Office Hours', icon: 'clock.fill' },
    { id: 'research', label: 'Research', icon: 'magnifyingglass' },
  ],
  E4: [
    { id: 'my-schedule', label: 'My Schedule', icon: 'calendar' },
    { id: 'grades', label: 'Grades', icon: 'chart.bar.fill' },
    { id: 'financial-aid', label: 'Financial Aid', icon: 'dollarsign.circle.fill' },
    { id: 'campus-map', label: 'Campus Map', icon: 'map.fill' },
  ],
  E5: [
    { id: 'apply', label: 'Apply Now', icon: 'pencil.and.outline' },
    { id: 'visit', label: 'Plan a Visit', icon: 'mappin.and.ellipse' },
    { id: 'programs', label: 'Programs', icon: 'book.fill' },
  ],
};

export function getEduQuickActions(role: EducationRoleLens): EducationQuickAction[] {
  return EDU_QUICK_ACTIONS[role] || EDU_QUICK_ACTIONS.E5;
}

// =============================================================================
// VISIBILITY HELPERS
// =============================================================================

export function isPresident(role: EducationRoleLens): boolean {
  return role === 'E1';
}

export function isDeanLevel(role: EducationRoleLens): boolean {
  return role === 'E1' || role === 'E2';
}

export function isFacultyLevel(role: EducationRoleLens): boolean {
  return role === 'E1' || role === 'E2' || role === 'E3';
}

export function isStudent(role: EducationRoleLens): boolean {
  return role === 'E4';
}

export function isEnrolled(role: EducationRoleLens): boolean {
  return role !== 'E5';
}

// =============================================================================
// BACKWARD COMPAT — used by universal-course-sheet, universal-program-sheet,
// universal-student-sheet from previous session
// =============================================================================

export type CourseTab = 'overview' | 'roster' | 'grades' | 'assignments' | 'syllabus' | 'sessions' | 'attendance' | 'operations' | 'compliance';
export type ProgramTab = 'overview' | 'curriculum' | 'students' | 'outcomes' | 'people' | 'courses' | 'calendar' | 'operations' | 'finance' | 'payment_rails' | 'compliance' | 'notes';
export type StudentTab = 'overview' | 'academics' | 'financial' | 'housing' | 'activities' | 'enrollment' | 'attendance' | 'grades' | 'notes' | 'compliance';

export function getCourseSheetTabs(role: EducationRoleLens): { id: CourseTab; label: string }[] {
  const all: { id: CourseTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'roster', label: 'Roster' },
    { id: 'grades', label: 'Grades' },
    { id: 'assignments', label: 'Assignments' },
  ];
  if (role === 'E5') return all.filter((t) => t.id === 'overview');
  if (role === 'E4') return all.filter((t) => t.id !== 'roster');
  return all;
}

export function getProgramSheetTabs(role: EducationRoleLens): { id: ProgramTab; label: string }[] {
  const all: { id: ProgramTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'students', label: 'Students' },
    { id: 'outcomes', label: 'Outcomes' },
  ];
  if (role === 'E5') return all.filter((t) => t.id === 'overview');
  if (role === 'E4') return all.filter((t) => t.id !== 'students');
  return all;
}

export function getStudentSheetTabs(role: EducationRoleLens): { id: StudentTab; label: string }[] {
  const all: { id: StudentTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'academics', label: 'Academics' },
    { id: 'financial', label: 'Financial' },
    { id: 'housing', label: 'Housing' },
    { id: 'activities', label: 'Activities' },
  ];
  if (role === 'E5') return [];
  if (role === 'E4') return all.filter((t) => t.id !== 'financial');
  return all;
}

export function isFullAccess(role: EducationRoleLens): boolean {
  return role === 'E1';
}

export function isProgramDirector(role: EducationRoleLens): boolean {
  return isDeanLevel(role);
}

export function isStudentOrParent(role: EducationRoleLens): boolean {
  return role === 'E4';
}

export function canViewGrades(role: EducationRoleLens): boolean {
  return role !== 'E5';
}

// =============================================================================
// ROLE MAPPING
// =============================================================================

// =============================================================================
// MEMBERSHIP → LENS (direct membership_id mapping for ActiveView)
// =============================================================================

const EDUCATION_MEMBERSHIP_MAP: Record<string, EducationRoleLens> = {
  mem_edu_fmu_president: 'E1',
};

export function getEducationRole(membershipId: string): EducationRoleLens {
  return EDUCATION_MEMBERSHIP_MAP[membershipId] ?? 'E1';
}

export function mapRoleToEducationLens(role: string): EducationRoleLens {
  switch (role) {
    case 'president':
    case 'chancellor':
    case 'superintendent':
      return 'E1';
    case 'provost':
    case 'dean':
    case 'vp_academic':
      return 'E2';
    case 'faculty':
    case 'professor':
    case 'staff':
    case 'instructor':
      return 'E3';
    case 'student':
    case 'graduate':
    case 'undergraduate':
      return 'E4';
    case 'public':
    case 'visitor':
    case 'applicant':
      return 'E5';
    default:
      return 'E5';
  }
}

// =============================================================================
// HOME PILL VISIBILITY (4-pill layout)
// =============================================================================

export type EducationHomePill = 'dashboard' | 'calendar' | 'faculty' | 'admissions';

const EDU_HOME_PILL_MATRIX: Record<EducationHomePill, Record<EducationRoleLens, EducationVisibility>> = {
  dashboard:  { E1: 'full', E2: 'full', E3: 'full',   E4: 'full',   E5: 'full' },
  calendar:   { E1: 'full', E2: 'full', E3: 'full',   E4: 'full',   E5: 'full' },
  faculty:    { E1: 'full', E2: 'full', E3: 'full',   E4: 'full',   E5: 'full' },
  admissions: { E1: 'full', E2: 'full', E3: 'full',   E4: 'full',   E5: 'full' },
};

export function getEducationVisiblePills(role: EducationRoleLens): EducationHomePill[] {
  return (Object.keys(EDU_HOME_PILL_MATRIX) as EducationHomePill[])
    .filter((pill) => EDU_HOME_PILL_MATRIX[pill][role] !== 'hidden');
}
