/**
 * Church Mode RBAC — 3-level role lens visibility matrix.
 * CH1: Ministry-level (Children's + Youth + Singles at ICCLA LA)
 * CH2: Ministry-level (Children's Church Teacher at ICCIE)
 * CH3: Senior Pastor (Full access)
 */

// =============================================================================
// ROLE LEVELS
// =============================================================================

export type ChurchRoleLens = 'CH1' | 'CH2' | 'CH3';

export type ChurchVisibility = 'full' | 'limited' | 'hidden';

export const CHURCH_ROLE_LABELS: Record<ChurchRoleLens, string> = {
  CH1: 'Ministry Leader',
  CH2: 'Ministry Leader',
  CH3: 'Senior Pastor',
};

// =============================================================================
// MEMBER SHEET TAB VISIBILITY
// =============================================================================

export type MemberTab =
  | 'overview' | 'ministry_involvement' | 'schedule_attendance'
  | 'care_followup' | 'tasks_workflow' | 'messages'
  | 'safety_compliance' | 'admin' | 'giving';

const MEMBER_TAB_MATRIX: Record<MemberTab, Record<ChurchRoleLens, ChurchVisibility>> = {
  overview:              { CH1: 'limited', CH2: 'limited', CH3: 'full' },
  ministry_involvement:  { CH1: 'limited', CH2: 'limited', CH3: 'full' },
  schedule_attendance:   { CH1: 'limited', CH2: 'limited', CH3: 'full' },
  care_followup:         { CH1: 'limited', CH2: 'limited', CH3: 'full' },
  tasks_workflow:        { CH1: 'limited', CH2: 'limited', CH3: 'full' },
  messages:              { CH1: 'limited', CH2: 'limited', CH3: 'full' },
  safety_compliance:     { CH1: 'limited', CH2: 'limited', CH3: 'full' },
  admin:                 { CH1: 'hidden',  CH2: 'hidden',  CH3: 'full' },
  giving:                { CH1: 'hidden',  CH2: 'hidden',  CH3: 'full' },
};

export function getMemberSheetTabs(role: ChurchRoleLens): { id: MemberTab; label: string; visibility: ChurchVisibility }[] {
  const labels: Record<MemberTab, string> = {
    overview: 'Overview',
    ministry_involvement: 'Ministry Involvement',
    schedule_attendance: 'Schedule + Attendance',
    care_followup: 'Care + Follow-Up',
    tasks_workflow: 'Tasks + Workflow',
    messages: 'Messages',
    safety_compliance: 'Safety + Compliance',
    admin: 'Admin',
    giving: 'Giving',
  };
  return (Object.keys(MEMBER_TAB_MATRIX) as MemberTab[])
    .filter((tab) => MEMBER_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: MEMBER_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// MINISTRY SHEET TAB VISIBILITY
// =============================================================================

export type MinistryTab =
  | 'overview' | 'people' | 'schedule' | 'operations'
  | 'safety_compliance' | 'budget' | 'content_media' | 'notes';

const MINISTRY_TAB_MATRIX: Record<MinistryTab, Record<ChurchRoleLens, ChurchVisibility>> = {
  overview:          { CH1: 'limited', CH2: 'limited', CH3: 'full' },
  people:            { CH1: 'limited', CH2: 'limited', CH3: 'full' },
  schedule:          { CH1: 'limited', CH2: 'limited', CH3: 'full' },
  operations:        { CH1: 'limited', CH2: 'limited', CH3: 'full' },
  safety_compliance: { CH1: 'limited', CH2: 'limited', CH3: 'full' },
  budget:            { CH1: 'hidden',  CH2: 'hidden',  CH3: 'full' },
  content_media:     { CH1: 'limited', CH2: 'limited', CH3: 'full' },
  notes:             { CH1: 'limited', CH2: 'limited', CH3: 'full' },
};

export function getMinistrySheetTabs(role: ChurchRoleLens): { id: MinistryTab; label: string; visibility: ChurchVisibility }[] {
  const labels: Record<MinistryTab, string> = {
    overview: 'Overview',
    people: 'People',
    schedule: 'Schedule',
    operations: 'Operations',
    safety_compliance: 'Safety + Compliance',
    budget: 'Budget',
    content_media: 'Content + Media',
    notes: 'Notes',
  };
  return (Object.keys(MINISTRY_TAB_MATRIX) as MinistryTab[])
    .filter((tab) => MINISTRY_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: MINISTRY_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// SERVICE / EVENT SHEET TAB VISIBILITY
// =============================================================================

export type ServiceTab =
  | 'agenda' | 'assignments' | 'run_of_show' | 'ops_checklist'
  | 'attendance' | 'incidents' | 'recap_followup';

const SERVICE_TAB_MATRIX: Record<ServiceTab, Record<ChurchRoleLens, ChurchVisibility>> = {
  agenda:          { CH1: 'limited', CH2: 'limited', CH3: 'full' },
  assignments:     { CH1: 'limited', CH2: 'limited', CH3: 'full' },
  run_of_show:     { CH1: 'limited', CH2: 'limited', CH3: 'full' },
  ops_checklist:   { CH1: 'limited', CH2: 'limited', CH3: 'full' },
  attendance:      { CH1: 'limited', CH2: 'limited', CH3: 'full' },
  incidents:       { CH1: 'limited', CH2: 'limited', CH3: 'full' },
  recap_followup:  { CH1: 'limited', CH2: 'limited', CH3: 'full' },
};

export function getServiceSheetTabs(role: ChurchRoleLens): { id: ServiceTab; label: string; visibility: ChurchVisibility }[] {
  const labels: Record<ServiceTab, string> = {
    agenda: 'Agenda',
    assignments: 'Assignments',
    run_of_show: 'Run of Show',
    ops_checklist: 'Ops Checklist',
    attendance: 'Attendance',
    incidents: 'Incidents',
    recap_followup: 'Recap + Follow-Up',
  };
  return (Object.keys(SERVICE_TAB_MATRIX) as ServiceTab[])
    .filter((tab) => SERVICE_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: SERVICE_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// ROLE MAPPING
// =============================================================================

export function mapRoleToChurchLens(role: string): ChurchRoleLens {
  switch (role) {
    case 'senior_pastor':
    case 'lead_pastor':
      return 'CH3';
    case 'ministry_lead':
    case 'ministry_admin':
    case 'teacher':
    case 'coordinator':
      return 'CH1';
    case 'volunteer':
    case 'member':
    case 'visitor':
    default:
      return 'CH1';
  }
}

// =============================================================================
// VISIBILITY HELPERS
// =============================================================================

export function isSeniorPastor(role: ChurchRoleLens): boolean {
  return role === 'CH3';
}

export function isMinistryLevel(role: ChurchRoleLens): boolean {
  return role === 'CH1' || role === 'CH2';
}
