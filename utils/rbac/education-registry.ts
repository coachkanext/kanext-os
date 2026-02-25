/**
 * Education Mode RBAC Registry — Constitutional 4D Role Definitions
 *
 * Maps membership_id -> Education Role Lens (E0-E13), then provides declarative
 * visibility matrices for every tab/section across Home, Org, Dashboard, and Pill views.
 *
 * Each role is defined by four dimensions per the Universal RBAC Constitution:
 *   Authority (A0-A5) . Domain Scope . Visibility (V0-V5) . Decision Access (D0-D5)
 *
 * E0:  System Owner           E7:  Faculty
 * E1:  President              E8:  Academic Advisor
 * E2:  Provost / VP Academic  E9:  Admissions Officer
 * E3:  VP Student Affairs     E10: Financial Aid Officer
 * E4:  VP Finance / CFO       E11: Student
 * E5:  Dean                   E12: Alumni
 * E6:  Department Chair       E13: Board of Trustees
 */

import {
  type UniversalRoleDefinition,
  Authority,
  Visibility as Vis,
  Decision,
} from './constitution';
import { isSystemOwner } from './system';

// =============================================================================
// ROLE LENS
// =============================================================================

export type EducationRoleLens =
  | 'E0' | 'E1' | 'E2' | 'E3' | 'E4' | 'E5' | 'E6' | 'E7'
  | 'E8' | 'E9' | 'E10' | 'E11' | 'E12' | 'E13';

export type EducationVisibility = 'full' | 'exact' | 'limited' | 'hidden';

export const EDUCATION_ROLE_LABELS: Record<EducationRoleLens, string> = {
  E0: 'System Owner',
  E1: 'President',
  E2: 'Provost / VP Academic',
  E3: 'VP Student Affairs',
  E4: 'VP Finance / CFO',
  E5: 'Dean',
  E6: 'Department Chair',
  E7: 'Faculty',
  E8: 'Academic Advisor',
  E9: 'Admissions Officer',
  E10: 'Financial Aid Officer',
  E11: 'Student',
  E12: 'Alumni',
  E13: 'Board of Trustees',
};

// =============================================================================
// 4D ROLE DEFINITIONS
// =============================================================================

export const EDUCATION_ROLES: Record<EducationRoleLens, UniversalRoleDefinition> = {
  E0:  { id: 'E0',  label: 'System Owner',         authority: Authority.Institutional, scope: 'global',     visibility: Vis.Institutional, decision: Decision.Institutional },
  E1:  { id: 'E1',  label: 'President',             authority: Authority.Institutional, scope: 'global',     visibility: Vis.Institutional, decision: Decision.Institutional },
  E2:  { id: 'E2',  label: 'Provost / VP Academic', authority: Authority.DomainGov,     scope: 'domain',     visibility: Vis.Strategic,     decision: Decision.Strategic },
  E3:  { id: 'E3',  label: 'VP Student Affairs',    authority: Authority.ProgramGov,    scope: 'program',    visibility: Vis.Competitive,   decision: Decision.Tactical },
  E4:  { id: 'E4',  label: 'VP Finance / CFO',      authority: Authority.ProgramGov,    scope: 'sub-domain', visibility: Vis.Competitive,   decision: Decision.Tactical, domainLane: 'finance' },
  E5:  { id: 'E5',  label: 'Dean',                  authority: Authority.DomainGov,     scope: 'domain',     visibility: Vis.Strategic,     decision: Decision.Strategic },
  E6:  { id: 'E6',  label: 'Department Chair',      authority: Authority.ProgramGov,    scope: 'program',    visibility: Vis.Competitive,   decision: Decision.Tactical },
  E7:  { id: 'E7',  label: 'Faculty',               authority: Authority.Execution,     scope: 'program',    visibility: Vis.Tactical,      decision: Decision.Operational },
  E8:  { id: 'E8',  label: 'Academic Advisor',      authority: Authority.Execution,     scope: 'sub-domain', visibility: Vis.Tactical,      decision: Decision.Operational, domainLane: 'academic' },
  E9:  { id: 'E9',  label: 'Admissions Officer',    authority: Authority.Execution,     scope: 'sub-domain', visibility: Vis.Tactical,      decision: Decision.Operational, domainLane: 'admissions' },
  E10: { id: 'E10', label: 'Financial Aid Officer', authority: Authority.Execution,     scope: 'sub-domain', visibility: Vis.Tactical,      decision: Decision.Operational, domainLane: 'finance' },
  E11: { id: 'E11', label: 'Student',               authority: Authority.Personal,      scope: 'personal',   visibility: Vis.Community,     decision: Decision.Self, isSelfOnly: true },
  E12: { id: 'E12', label: 'Alumni',                authority: Authority.Observer,       scope: 'personal',   visibility: Vis.Public,        decision: Decision.None, isExternal: true },
  E13: { id: 'E13', label: 'Board of Trustees',     authority: Authority.Observer,       scope: 'personal',   visibility: Vis.Public,        decision: Decision.None, isExternal: true },
};

// Helper to build a 14-column row concisely
type V = EducationVisibility;
function r(
  e0: V, e1: V, e2: V, e3: V, e4: V, e5: V, e6: V,
  e7: V, e8: V, e9: V, e10: V, e11: V, e12: V, e13: V,
): Record<EducationRoleLens, V> {
  return {
    E0: e0, E1: e1, E2: e2, E3: e3, E4: e4, E5: e5, E6: e6,
    E7: e7, E8: e8, E9: e9, E10: e10, E11: e11, E12: e12, E13: e13,
  };
}

// =============================================================================
// HOME TAB VISIBILITY
// =============================================================================

export type EducationHomeTab =
  | 'dashboard' | 'calendar' | 'academics' | 'campus' | 'people'
  | 'admissions' | 'athletics' | 'financial' | 'housing' | 'policies';

//                                                  E0      E1      E2      E3        E4        E5        E6        E7        E8        E9        E10       E11       E12       E13
const EDU_HOME_TAB_MATRIX: Record<EducationHomeTab, Record<EducationRoleLens, V>> = {
  dashboard:  r('full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'full'),
  calendar:   r('full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'full',    'limited', 'full'),
  academics:  r('full', 'full',    'full',    'full',    'limited', 'full',    'full',    'full',    'full',    'hidden',  'hidden',  'limited', 'limited', 'full'),
  campus:     r('full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  people:     r('full', 'full',    'full',    'full',    'limited', 'full',    'full',    'full',    'full',    'limited', 'hidden',  'limited', 'hidden',  'full'),
  admissions: r('full', 'full',    'full',    'limited', 'hidden',  'limited', 'limited', 'limited', 'limited', 'full',    'hidden',  'limited', 'hidden',  'full'),
  athletics:  r('full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  financial:  r('full', 'full',    'full',    'limited', 'full',    'limited', 'limited', 'limited', 'limited', 'hidden',  'full',    'limited', 'hidden',  'full'),
  housing:    r('full', 'full',    'full',    'full',    'limited', 'full',    'full',    'full',    'full',    'limited', 'hidden',  'full',    'hidden',  'full'),
  policies:   r('full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'full'),
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

//                                                E0      E1      E2      E3        E4        E5        E6        E7        E8        E9        E10       E11       E12       E13
const EDU_ORG_TAB_MATRIX: Record<EducationOrgTab, Record<EducationRoleLens, V>> = {
  institutions:    r('full', 'full', 'full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'full'),
  people:          r('full', 'full', 'full',    'full',    'limited', 'full',    'full',    'full',    'full',    'limited', 'hidden',  'limited', 'hidden',  'full'),
  rooms:           r('full', 'full', 'full',    'full',    'limited', 'full',    'full',    'full',    'limited', 'hidden',  'hidden',  'limited', 'hidden',  'full'),
  operations:      r('full', 'full', 'full',    'full',    'full',    'limited', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'full'),
  finance:         r('full', 'full', 'full',    'limited', 'full',    'limited', 'limited', 'hidden',  'hidden',  'hidden',  'limited', 'hidden',  'hidden',  'full'),
  'payment-rails': r('full', 'full', 'full',    'hidden',  'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'full'),
  compliance:      r('full', 'full', 'full',    'limited', 'limited', 'limited', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'full'),
  facilities:      r('full', 'full', 'full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'hidden',  'hidden',  'limited', 'hidden',  'full'),
  resources:       r('full', 'full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'full',    'limited', 'full'),
  sponsors:        r('full', 'full', 'full',    'hidden',  'limited', 'limited', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'limited', 'full'),
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

//                                                             E0      E1      E2      E3        E4        E5        E6        E7        E8        E9        E10       E11       E12       E13
const EDU_DASHBOARD_SECTION_MATRIX: Record<EduDashboardSection, Record<EducationRoleLens, V>> = {
  video_hero:             r('full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  next_event:             r('full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  action_row:             r('full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'limited', 'full'),
  institutional_metrics:  r('full', 'full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'hidden',  'full'),
  academic_health:        r('full', 'full',    'full',    'limited', 'hidden',  'full',    'limited', 'limited', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'limited'),
  student_success:        r('full', 'full',    'full',    'full',    'hidden',  'full',    'limited', 'limited', 'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  campus_life:            r('full', 'full',    'full',    'full',    'limited', 'full',    'full',    'full',    'full',    'limited', 'hidden',  'limited', 'limited', 'full'),
  advancement:            r('full', 'full',    'full',    'hidden',  'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'limited', 'full'),
  accreditation:          r('full', 'full',    'full',    'hidden',  'hidden',  'limited', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'full'),
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
  E0: [
    { id: 'system-overview', label: 'System Overview', icon: 'gearshape.fill' },
    { id: 'enrollment', label: 'Enrollment', icon: 'person.3.fill' },
    { id: 'budget', label: 'Budget Overview', icon: 'dollarsign.circle.fill' },
    { id: 'audit-log', label: 'Audit Log', icon: 'doc.text.fill' },
  ],
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
    { id: 'student-life', label: 'Student Life', icon: 'person.3.fill' },
    { id: 'housing', label: 'Housing', icon: 'house.fill' },
    { id: 'campus-safety', label: 'Campus Safety', icon: 'shield.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
  ],
  E4: [
    { id: 'budget', label: 'Budget Overview', icon: 'dollarsign.circle.fill' },
    { id: 'finance', label: 'Financial Reports', icon: 'chart.bar.fill' },
    { id: 'payment-rails', label: 'Payment Rails', icon: 'creditcard.fill' },
  ],
  E5: [
    { id: 'my-college', label: 'My College', icon: 'building.columns.fill' },
    { id: 'faculty', label: 'Faculty', icon: 'person.2.fill' },
    { id: 'curriculum', label: 'Curriculum', icon: 'doc.text.fill' },
    { id: 'students', label: 'Students', icon: 'person.3.fill' },
  ],
  E6: [
    { id: 'my-department', label: 'My Department', icon: 'building.columns.fill' },
    { id: 'courses', label: 'Courses', icon: 'book.fill' },
    { id: 'faculty', label: 'Faculty', icon: 'person.2.fill' },
  ],
  E7: [
    { id: 'my-courses', label: 'My Courses', icon: 'book.fill' },
    { id: 'grading', label: 'Grading', icon: 'checkmark.circle.fill' },
    { id: 'office-hours', label: 'Office Hours', icon: 'clock.fill' },
    { id: 'research', label: 'Research', icon: 'magnifyingglass' },
  ],
  E8: [
    { id: 'my-advisees', label: 'My Advisees', icon: 'person.3.fill' },
    { id: 'schedule', label: 'Schedule', icon: 'calendar' },
    { id: 'degree-audit', label: 'Degree Audit', icon: 'doc.text.fill' },
  ],
  E9: [
    { id: 'applications', label: 'Applications', icon: 'doc.text.fill' },
    { id: 'prospects', label: 'Prospects', icon: 'person.badge.plus' },
    { id: 'events', label: 'Open Days', icon: 'calendar' },
  ],
  E10: [
    { id: 'aid-packages', label: 'Aid Packages', icon: 'dollarsign.circle.fill' },
    { id: 'scholarships', label: 'Scholarships', icon: 'doc.text.fill' },
    { id: 'applications', label: 'Applications', icon: 'person.3.fill' },
  ],
  E11: [
    { id: 'my-schedule', label: 'My Schedule', icon: 'calendar' },
    { id: 'grades', label: 'Grades', icon: 'chart.bar.fill' },
    { id: 'financial-aid', label: 'Financial Aid', icon: 'dollarsign.circle.fill' },
    { id: 'campus-map', label: 'Campus Map', icon: 'map.fill' },
  ],
  E12: [
    { id: 'alumni-network', label: 'Alumni Network', icon: 'person.3.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'give', label: 'Give', icon: 'heart.fill' },
  ],
  E13: [
    { id: 'board-report', label: 'Board Report', icon: 'doc.text.fill' },
    { id: 'budget', label: 'Budget Overview', icon: 'dollarsign.circle.fill' },
    { id: 'strategic-plan', label: 'Strategic Plan', icon: 'map.fill' },
    { id: 'compliance', label: 'Compliance', icon: 'checkmark.seal.fill' },
  ],
};

export function getEduQuickActions(role: EducationRoleLens): EducationQuickAction[] {
  return EDU_QUICK_ACTIONS[role] || EDU_QUICK_ACTIONS.E11 || [];
}

// =============================================================================
// VISIBILITY HELPERS (constitutional rewrites where noted)
// =============================================================================

export function isPresident(role: EducationRoleLens): boolean {
  return role === 'E0' || role === 'E1';
}

/** Constitutional rewrite: Dean-level = authority >= DomainGov (A4). */
export function isDeanLevel(role: EducationRoleLens): boolean {
  return EDUCATION_ROLES[role].authority >= Authority.DomainGov;
}

/** Constitutional rewrite: Faculty-level = authority >= Execution (A2). */
export function isFacultyLevel(role: EducationRoleLens): boolean {
  return EDUCATION_ROLES[role].authority >= Authority.Execution;
}

export function isStudent(role: EducationRoleLens): boolean {
  return role === 'E11';
}

export function isEnrolled(role: EducationRoleLens): boolean {
  return role === 'E0' || role === 'E1' || role === 'E2' || role === 'E3'
    || role === 'E4' || role === 'E5' || role === 'E6' || role === 'E7'
    || role === 'E8' || role === 'E9' || role === 'E10' || role === 'E11';
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
  if (role === 'E12') return all.filter((t) => t.id === 'overview');
  // Students see everything except roster
  if (role === 'E11') return all.filter((t) => t.id !== 'roster');
  return all;
}

export function getProgramSheetTabs(role: EducationRoleLens): { id: ProgramTab; label: string }[] {
  const all: { id: ProgramTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'students', label: 'Students' },
    { id: 'outcomes', label: 'Outcomes' },
  ];
  if (role === 'E12') return all.filter((t) => t.id === 'overview');
  if (role === 'E11') return all.filter((t) => t.id !== 'students');
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
  if (role === 'E12') return [];
  if (role === 'E11') return all.filter((t) => t.id !== 'financial');
  return all;
}

export function isFullAccess(role: EducationRoleLens): boolean {
  return role === 'E0' || role === 'E1';
}

export function isProgramDirector(role: EducationRoleLens): boolean {
  return isDeanLevel(role);
}

export function isStudentOrParent(role: EducationRoleLens): boolean {
  return role === 'E11';
}

export function canViewGrades(role: EducationRoleLens): boolean {
  return role !== 'E12';
}

// =============================================================================
// ROLE MAPPING
// =============================================================================

const EDUCATION_MEMBERSHIP_MAP: Record<string, EducationRoleLens> = {
  mem_edu_kx_provost: 'E2',
  mem_edu_kx_vp_student_affairs: 'E3',
  mem_edu_kx_vp_finance: 'E4',
  mem_edu_kx_dean: 'E5',
  mem_edu_kx_chair: 'E6',
  mem_edu_kx_faculty: 'E7',
  mem_edu_kx_advisor: 'E8',
  mem_edu_kx_admissions: 'E9',
  mem_edu_kx_financial_aid: 'E10',
  mem_edu_kx_student: 'E11',
  mem_edu_kx_alumnus: 'E12',
  mem_edu_kx_trustee: 'E13',
  // Legacy mappings
  mem_edu_kx_student_services: 'E3',
  mem_edu_kx_registrar: 'E8',
  mem_edu_kx_facilities: 'E7',
  mem_edu_kx_parent: 'E11',
  mem_edu_kx_prospect: 'E9',
  mem_edu_kx_donor: 'E12',
  mem_edu_kx_accreditor: 'E13',
};

export function getEducationRole(membershipId: string): EducationRoleLens {
  if (isSystemOwner(membershipId)) return 'E0';
  return EDUCATION_MEMBERSHIP_MAP[membershipId] ?? 'E11';
}

export function mapRoleToEducationLens(role: string): EducationRoleLens {
  switch (role) {
    case 'system_owner':
      return 'E0';
    case 'president':
    case 'chancellor':
    case 'superintendent':
      return 'E1';
    case 'provost':
    case 'vp_academic':
      return 'E2';
    case 'vp_student_affairs':
    case 'student_services':
    case 'counselor':
      return 'E3';
    case 'vp_finance':
    case 'cfo':
      return 'E4';
    case 'dean':
      return 'E5';
    case 'department_chair':
      return 'E6';
    case 'faculty':
    case 'professor':
    case 'instructor':
      return 'E7';
    case 'advisor':
    case 'academic_advisor':
    case 'registrar':
      return 'E8';
    case 'admissions':
    case 'admissions_officer':
    case 'prospective':
    case 'applicant':
      return 'E9';
    case 'financial_aid':
    case 'financial_aid_officer':
      return 'E10';
    case 'student':
    case 'undergraduate':
    case 'graduate':
    case 'parent':
    case 'guardian':
      return 'E11';
    case 'alumnus':
    case 'alumni':
    case 'donor':
    case 'endowment':
      return 'E12';
    case 'trustee':
    case 'board_member':
    case 'accreditor':
    case 'evaluator':
      return 'E13';
    case 'facilities':
    case 'campus_ops':
    case 'staff':
    case 'compliance_officer':
      return 'E7';
    case 'visitor':
    case 'public':
      return 'E11';
    default:
      return 'E11';
  }
}

// =============================================================================
// HOME PILL VISIBILITY (4-pill layout)
// =============================================================================

export type EducationHomePill = 'dashboard' | 'calendar' | 'faculty' | 'admissions';

//                                                        E0     E1     E2     E3     E4     E5     E6     E7       E8       E9       E10      E11      E12      E13
const EDU_HOME_PILL_MATRIX: Record<EducationHomePill, Record<EducationRoleLens, V>> = {
  dashboard:  r('full', 'full', 'full', 'full', 'full', 'full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  calendar:   r('full', 'full', 'full', 'full', 'full', 'full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  faculty:    r('full', 'full', 'full', 'full', 'full', 'full', 'full',    'full',    'full',    'limited', 'hidden',  'full',    'limited', 'full'),
  admissions: r('full', 'full', 'full', 'full', 'full', 'full', 'full',    'limited', 'limited', 'full',    'hidden',  'limited', 'hidden',  'full'),
};

export function getEducationVisiblePills(role: EducationRoleLens): EducationHomePill[] {
  return (Object.keys(EDU_HOME_PILL_MATRIX) as EducationHomePill[])
    .filter((pill) => EDU_HOME_PILL_MATRIX[pill][role] !== 'hidden');
}
