/**
 * Education Mode RBAC — 13-level role lens visibility matrix.
 * E1:  President / Chancellor
 * E2:  Provost / Dean
 * E3:  Department Chair / Faculty
 * E4:  Student Services / Counseling
 * E5:  Registrar / Compliance
 * E6:  Facilities / Campus Ops
 * E7:  Student
 * E8:  Parent / Guardian
 * E9:  Alumnus
 * E10: Prospective Student
 * E11: Donor / Endowment
 * E12: Accreditor / External Evaluator
 * E13: Board of Trustees
 */

import { isSystemOwner } from '@/utils/system-rbac';

// =============================================================================
// ROLE LEVELS
// =============================================================================

export type EducationRoleLens =
  | 'E1' | 'E2' | 'E3' | 'E4' | 'E5' | 'E6' | 'E7'
  | 'E8' | 'E9' | 'E10' | 'E11' | 'E12' | 'E13';

export type EducationVisibility = 'full' | 'exact' | 'limited' | 'hidden';

export const EDUCATION_ROLE_LABELS: Record<EducationRoleLens, string> = {
  E1: 'President / Chancellor',
  E2: 'Provost / Dean',
  E3: 'Department Chair / Faculty',
  E4: 'Student Services / Counseling',
  E5: 'Registrar / Compliance',
  E6: 'Facilities / Campus Ops',
  E7: 'Student',
  E8: 'Parent / Guardian',
  E9: 'Alumnus',
  E10: 'Prospective Student',
  E11: 'Donor / Endowment',
  E12: 'Accreditor / External Evaluator',
  E13: 'Board of Trustees',
};

// Helper to build a 13-column row concisely
type V = EducationVisibility;
function r(e1: V, e2: V, e3: V, e4: V, e5: V, e6: V, e7: V, e8: V, e9: V, e10: V, e11: V, e12: V, e13: V): Record<EducationRoleLens, V> {
  return { E1: e1, E2: e2, E3: e3, E4: e4, E5: e5, E6: e6, E7: e7, E8: e8, E9: e9, E10: e10, E11: e11, E12: e12, E13: e13 };
}

// =============================================================================
// HOME TAB VISIBILITY
// =============================================================================

export type EducationHomeTab =
  | 'dashboard' | 'calendar' | 'academics' | 'campus' | 'people'
  | 'admissions' | 'athletics' | 'financial' | 'housing' | 'policies';

//                                                  E1      E2      E3        E4        E5        E6        E7        E8        E9        E10       E11       E12       E13
const EDU_HOME_TAB_MATRIX: Record<EducationHomeTab, Record<EducationRoleLens, V>> = {
  dashboard:  r('full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'hidden',  'full'),
  calendar:   r('full',    'full',    'full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'hidden',  'full'),
  academics:  r('full',    'full',    'full',    'full',    'full',    'hidden',  'limited', 'limited', 'limited', 'limited', 'hidden',  'hidden',  'full'),
  campus:     r('full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'hidden',  'full'),
  people:     r('full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'full'),
  admissions: r('full',    'full',    'limited', 'limited', 'full',    'hidden',  'limited', 'limited', 'hidden',  'full',    'hidden',  'hidden',  'full'),
  athletics:  r('full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'hidden',  'full'),
  financial:  r('full',    'full',    'limited', 'limited', 'full',    'hidden',  'limited', 'limited', 'hidden',  'hidden',  'limited', 'hidden',  'full'),
  housing:    r('full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'hidden',  'limited', 'hidden',  'hidden',  'full'),
  policies:   r('full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'limited', 'hidden',  'hidden',  'full'),
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

//                                                E1      E2      E3        E4        E5        E6        E7        E8        E9        E10       E11       E12       E13
const EDU_ORG_TAB_MATRIX: Record<EducationOrgTab, Record<EducationRoleLens, V>> = {
  institutions:    r('full', 'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'full'),
  people:          r('full', 'full',    'full',    'full',    'full',    'limited', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'full'),
  rooms:           r('full', 'full',    'full',    'full',    'full',    'full',    'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'full'),
  operations:      r('full', 'full',    'limited', 'limited', 'limited', 'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'full'),
  finance:         r('full', 'full',    'limited', 'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'limited', 'hidden',  'full'),
  'payment-rails': r('full', 'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'full'),
  compliance:      r('full', 'full',    'limited', 'hidden',  'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'limited', 'full'),
  facilities:      r('full', 'full',    'full',    'limited', 'limited', 'full',    'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'full'),
  resources:       r('full', 'full',    'full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'hidden',  'full'),
  sponsors:        r('full', 'full',    'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'limited', 'hidden',  'full',    'hidden',  'full'),
};

export function getEduOrgTabVisibility(tab: EducationOrgTab, role: EducationRoleLens): EducationVisibility {
  return EDU_ORG_TAB_MATRIX[tab]?.[role] ?? 'hidden';
}

export function getVisibleEduOrgTabs(role: EducationRoleLens): EducationOrgTab[] {
  return (Object.keys(EDU_ORG_TAB_MATRIX) as EducationOrgTab[])
    .filter((tab) => EDU_ORG_TAB_MATRIX[tab][role] !== 'hidden');
}

// =============================================================================
// DASHBOARD SECTION VISIBILITY
// =============================================================================

export type EduDashboardSection =
  | 'video_hero' | 'next_event' | 'action_row' | 'institutional_metrics'
  | 'academic_health' | 'student_success' | 'campus_life' | 'advancement' | 'accreditation';

//                                                             E1      E2      E3        E4        E5        E6        E7        E8        E9        E10       E11       E12       E13
const EDU_DASHBOARD_SECTION_MATRIX: Record<EduDashboardSection, Record<EducationRoleLens, V>> = {
  video_hero:             r('full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'hidden',  'full'),
  next_event:             r('full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'hidden',  'full'),
  action_row:             r('full',    'full',    'full',    'full',    'full',    'hidden',  'full',    'limited', 'limited', 'full',    'hidden',  'hidden',  'full'),
  institutional_metrics:  r('full',    'full',    'limited', 'limited', 'limited', 'hidden',  'limited', 'limited', 'hidden',  'limited', 'limited', 'hidden',  'full'),
  academic_health:        r('full',    'full',    'limited', 'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'limited'),
  student_success:        r('full',    'full',    'limited', 'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  campus_life:            r('full',    'full',    'full',    'full',    'hidden',  'limited', 'limited', 'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'full'),
  advancement:            r('full',    'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'limited', 'hidden',  'limited', 'hidden',  'full'),
  accreditation:          r('full',    'full',    'hidden',  'hidden',  'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'limited', 'full'),
};

export function canSeeEduDashboardSection(section: EduDashboardSection, role: EducationRoleLens): EducationVisibility {
  return EDU_DASHBOARD_SECTION_MATRIX[section]?.[role] ?? 'hidden';
}

// =============================================================================
// QUICK ACTIONS BY ROLE
// =============================================================================

export interface EducationQuickAction {
  id: string;
  label: string;
  icon: string;
}

const EDU_QUICK_ACTIONS: Partial<Record<EducationRoleLens, EducationQuickAction[]>> = {
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
  E7: [
    { id: 'my-schedule', label: 'My Schedule', icon: 'calendar' },
    { id: 'grades', label: 'Grades', icon: 'chart.bar.fill' },
    { id: 'financial-aid', label: 'Financial Aid', icon: 'dollarsign.circle.fill' },
    { id: 'campus-map', label: 'Campus Map', icon: 'map.fill' },
  ],
  E10: [
    { id: 'apply', label: 'Apply Now', icon: 'pencil.and.outline' },
    { id: 'visit', label: 'Plan a Visit', icon: 'mappin.and.ellipse' },
    { id: 'programs', label: 'Programs', icon: 'book.fill' },
  ],
};

export function getEduQuickActions(role: EducationRoleLens): EducationQuickAction[] {
  return EDU_QUICK_ACTIONS[role] || EDU_QUICK_ACTIONS.E10 || [];
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
  return role === 'E7';
}

export function isEnrolled(role: EducationRoleLens): boolean {
  return role === 'E1' || role === 'E2' || role === 'E3' || role === 'E4'
    || role === 'E5' || role === 'E6' || role === 'E7';
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
  // External roles see overview only
  if (role === 'E10' || role === 'E12') return all.filter((t) => t.id === 'overview');
  // Students see everything except roster
  if (role === 'E7' || role === 'E8') return all.filter((t) => t.id !== 'roster');
  return all;
}

export function getProgramSheetTabs(role: EducationRoleLens): { id: ProgramTab; label: string }[] {
  const all: { id: ProgramTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'students', label: 'Students' },
    { id: 'outcomes', label: 'Outcomes' },
  ];
  if (role === 'E10' || role === 'E12') return all.filter((t) => t.id === 'overview');
  if (role === 'E7' || role === 'E8') return all.filter((t) => t.id !== 'students');
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
  if (role === 'E10' || role === 'E12') return [];
  if (role === 'E7' || role === 'E8') return all.filter((t) => t.id !== 'financial');
  return all;
}

export function isFullAccess(role: EducationRoleLens): boolean {
  return role === 'E1';
}

export function isProgramDirector(role: EducationRoleLens): boolean {
  return isDeanLevel(role);
}

export function isStudentOrParent(role: EducationRoleLens): boolean {
  return role === 'E7' || role === 'E8';
}

export function canViewGrades(role: EducationRoleLens): boolean {
  return role !== 'E10' && role !== 'E12';
}

// =============================================================================
// ROLE MAPPING
// =============================================================================

// =============================================================================
// MEMBERSHIP → LENS (direct membership_id mapping for ActiveView)
// =============================================================================

const EDUCATION_MEMBERSHIP_MAP: Record<string, EducationRoleLens> = {
  mem_edu_kx_provost: 'E2',
  mem_edu_kx_chair: 'E3',
  mem_edu_kx_student_services: 'E4',
  mem_edu_kx_registrar: 'E5',
  mem_edu_kx_facilities: 'E6',
  mem_edu_kx_student: 'E7',
  mem_edu_kx_parent: 'E8',
  mem_edu_kx_alumnus: 'E9',
  mem_edu_kx_prospect: 'E10',
  mem_edu_kx_donor: 'E11',
  mem_edu_kx_accreditor: 'E12',
  mem_edu_kx_trustee: 'E13',
};

export function getEducationRole(membershipId: string): EducationRoleLens {
  if (isSystemOwner(membershipId)) return 'E1';
  return EDUCATION_MEMBERSHIP_MAP[membershipId] ?? 'E10';
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
    case 'department_chair':
    case 'instructor':
      return 'E3';
    case 'student_services':
    case 'counselor':
    case 'advisor':
      return 'E4';
    case 'registrar':
    case 'compliance_officer':
      return 'E5';
    case 'facilities':
    case 'campus_ops':
    case 'staff':
      return 'E6';
    case 'student':
    case 'undergraduate':
    case 'graduate':
      return 'E7';
    case 'parent':
    case 'guardian':
      return 'E8';
    case 'alumnus':
    case 'alumni':
      return 'E9';
    case 'prospective':
    case 'applicant':
    case 'visitor':
    case 'public':
      return 'E10';
    case 'donor':
    case 'endowment':
      return 'E11';
    case 'accreditor':
    case 'evaluator':
      return 'E12';
    case 'trustee':
    case 'board_member':
      return 'E13';
    default:
      return 'E10';
  }
}

// =============================================================================
// HOME PILL VISIBILITY (4-pill layout)
// =============================================================================

export type EducationHomePill = 'dashboard' | 'calendar' | 'faculty' | 'admissions';

//                                                        E1     E2     E3     E4     E5     E6     E7     E8     E9     E10    E11    E12    E13
const EDU_HOME_PILL_MATRIX: Record<EducationHomePill, Record<EducationRoleLens, V>> = {
  dashboard:  r('full', 'full', 'full', 'full', 'full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  calendar:   r('full', 'full', 'full', 'full', 'full', 'full',    'full',    'full',    'full',    'full',    'full',    'hidden',  'full'),
  faculty:    r('full', 'full', 'full', 'full', 'full', 'limited', 'full',    'limited', 'limited', 'limited', 'hidden',  'hidden',  'full'),
  admissions: r('full', 'full', 'full', 'full', 'full', 'hidden',  'limited', 'limited', 'hidden',  'full',    'hidden',  'hidden',  'full'),
};

export function getEducationVisiblePills(role: EducationRoleLens): EducationHomePill[] {
  return (Object.keys(EDU_HOME_PILL_MATRIX) as EducationHomePill[])
    .filter((pill) => EDU_HOME_PILL_MATRIX[pill][role] !== 'hidden');
}
