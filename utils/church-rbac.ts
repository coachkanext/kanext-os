/**
 * Church Mode RBAC — 5-level role lens visibility matrix.
 * C1: Senior Pastor (Full access)
 * C2: Elder / Board
 * C3: Staff
 * C4: Member
 * C5: Visitor / Public
 */

// =============================================================================
// ROLE LEVELS
// =============================================================================

export type ChurchRoleLens = 'C1' | 'C2' | 'C3' | 'C4' | 'C5';

export type ChurchVisibility = 'full' | 'exact' | 'limited' | 'hidden';

export const CHURCH_ROLE_LABELS: Record<ChurchRoleLens, string> = {
  C1: 'Senior Pastor',
  C2: 'Elder / Board',
  C3: 'Staff',
  C4: 'Member',
  C5: 'Visitor / Public',
};

// =============================================================================
// HOME TAB VISIBILITY
// =============================================================================

export type ChurchHomeTab =
  | 'dashboard' | 'calendar' | 'worship' | 'community' | 'serve'
  | 'give' | 'events' | 'prayer' | 'messages' | 'discipleship';

const CHURCH_HOME_TAB_MATRIX: Record<ChurchHomeTab, Record<ChurchRoleLens, ChurchVisibility>> = {
  dashboard:    { C1: 'full', C2: 'full', C3: 'full', C4: 'limited', C5: 'limited' },
  calendar:     { C1: 'full', C2: 'full', C3: 'full', C4: 'limited', C5: 'limited' },
  worship:      { C1: 'full', C2: 'full', C3: 'full', C4: 'full',    C5: 'limited' },
  community:    { C1: 'full', C2: 'full', C3: 'full', C4: 'full',    C5: 'limited' },
  serve:        { C1: 'full', C2: 'full', C3: 'full', C4: 'limited', C5: 'hidden' },
  give:         { C1: 'full', C2: 'full', C3: 'full', C4: 'full',    C5: 'limited' },
  events:       { C1: 'full', C2: 'full', C3: 'full', C4: 'full',    C5: 'full' },
  prayer:       { C1: 'full', C2: 'full', C3: 'full', C4: 'full',    C5: 'hidden' },
  messages:     { C1: 'full', C2: 'full', C3: 'full', C4: 'full',    C5: 'full' },
  discipleship: { C1: 'full', C2: 'full', C3: 'full', C4: 'limited', C5: 'hidden' },
};

export function getChurchHomeTabVisibility(tab: ChurchHomeTab, role: ChurchRoleLens): ChurchVisibility {
  return CHURCH_HOME_TAB_MATRIX[tab]?.[role] ?? 'hidden';
}

// =============================================================================
// ORG TAB VISIBILITY
// =============================================================================

export type ChurchOrgTab =
  | 'ministries' | 'people' | 'rooms' | 'operations' | 'finance'
  | 'payment-rails' | 'compliance' | 'facilities' | 'resources' | 'donations';

const CHURCH_ORG_TAB_MATRIX: Record<ChurchOrgTab, Record<ChurchRoleLens, ChurchVisibility>> = {
  ministries:      { C1: 'full', C2: 'full',    C3: 'full',    C4: 'limited', C5: 'limited' },
  people:          { C1: 'full', C2: 'full',    C3: 'full',    C4: 'limited', C5: 'hidden' },
  rooms:           { C1: 'full', C2: 'full',    C3: 'full',    C4: 'hidden',  C5: 'hidden' },
  operations:      { C1: 'full', C2: 'full',    C3: 'limited', C4: 'hidden',  C5: 'hidden' },
  finance:         { C1: 'full', C2: 'full',    C3: 'limited', C4: 'hidden',  C5: 'hidden' },
  'payment-rails': { C1: 'full', C2: 'full',    C3: 'hidden',  C4: 'hidden',  C5: 'hidden' },
  compliance:      { C1: 'full', C2: 'full',    C3: 'limited', C4: 'hidden',  C5: 'hidden' },
  facilities:      { C1: 'full', C2: 'full',    C3: 'full',    C4: 'limited', C5: 'hidden' },
  resources:       { C1: 'full', C2: 'full',    C3: 'full',    C4: 'limited', C5: 'hidden' },
  donations:       { C1: 'full', C2: 'full',    C3: 'limited', C4: 'limited', C5: 'limited' },
};

export function getChurchOrgTabVisibility(tab: ChurchOrgTab, role: ChurchRoleLens): ChurchVisibility {
  return CHURCH_ORG_TAB_MATRIX[tab]?.[role] ?? 'hidden';
}

export function getVisibleChurchOrgTabs(role: ChurchRoleLens): ChurchOrgTab[] {
  return (Object.keys(CHURCH_ORG_TAB_MATRIX) as ChurchOrgTab[])
    .filter((tab) => CHURCH_ORG_TAB_MATRIX[tab][role] !== 'hidden');
}

// =============================================================================
// QUICK ACTIONS BY ROLE
// =============================================================================

export interface ChurchQuickAction {
  id: string;
  label: string;
  icon: string;
}

const CHURCH_QUICK_ACTIONS: Record<ChurchRoleLens, ChurchQuickAction[]> = {
  C1: [
    { id: 'worship-plan', label: 'Worship Plan', icon: 'music.note.list' },
    { id: 'sermon-prep', label: 'Sermon Prep', icon: 'book.fill' },
    { id: 'staff-meeting', label: 'Staff Meeting', icon: 'person.3.fill' },
    { id: 'budget-review', label: 'Budget Review', icon: 'dollarsign.circle.fill' },
    { id: 'prayer-wall', label: 'Prayer Wall', icon: 'hands.sparkles.fill' },
    { id: 'announcements', label: 'Announcements', icon: 'megaphone.fill' },
  ],
  C2: [
    { id: 'board-meeting', label: 'Board Meeting', icon: 'person.3.fill' },
    { id: 'budget-review', label: 'Budget Review', icon: 'dollarsign.circle.fill' },
    { id: 'policy-review', label: 'Policy Review', icon: 'doc.text.fill' },
    { id: 'staff-oversight', label: 'Staff Oversight', icon: 'person.2.fill' },
  ],
  C3: [
    { id: 'my-ministries', label: 'My Ministries', icon: 'heart.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'volunteer-schedule', label: 'Volunteer Schedule', icon: 'clock.fill' },
    { id: 'announcements', label: 'Announcements', icon: 'megaphone.fill' },
  ],
  C4: [
    { id: 'worship', label: 'Watch Worship', icon: 'play.circle.fill' },
    { id: 'give', label: 'Give', icon: 'heart.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'prayer', label: 'Prayer Request', icon: 'hands.sparkles.fill' },
  ],
  C5: [
    { id: 'visit', label: 'Plan a Visit', icon: 'mappin.and.ellipse' },
    { id: 'worship', label: 'Watch Online', icon: 'play.circle.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
  ],
};

export function getChurchQuickActions(role: ChurchRoleLens): ChurchQuickAction[] {
  return CHURCH_QUICK_ACTIONS[role] || CHURCH_QUICK_ACTIONS.C5;
}

// =============================================================================
// VISIBILITY HELPERS
// =============================================================================

export function isSeniorPastor(role: ChurchRoleLens): boolean {
  return role === 'C1';
}

export function isElderLevel(role: ChurchRoleLens): boolean {
  return role === 'C1' || role === 'C2';
}

export function isStaffLevel(role: ChurchRoleLens): boolean {
  return role === 'C1' || role === 'C2' || role === 'C3';
}

export function isMember(role: ChurchRoleLens): boolean {
  return role !== 'C5';
}

// =============================================================================
// ROLE MAPPING
// =============================================================================

// =============================================================================
// BACKWARD COMPAT — used by universal-member-sheet, universal-ministry-sheet,
// universal-service-sheet from previous session
// =============================================================================

export type MemberTab = 'overview' | 'giving' | 'groups' | 'notes' | 'ministry_involvement' | 'schedule_attendance' | 'care_followup' | 'tasks_workflow' | 'messages' | 'safety_compliance' | 'admin';
export type MinistryTab = 'overview' | 'members' | 'schedule' | 'budget' | 'people' | 'operations' | 'safety_compliance' | 'content_media' | 'notes';
export type ServiceTab = 'overview' | 'team' | 'setlist' | 'notes' | 'agenda' | 'assignments' | 'run_of_show' | 'ops_checklist' | 'attendance' | 'incidents' | 'recap_followup';

export function getMemberSheetTabs(role: ChurchRoleLens): { id: MemberTab; label: string }[] {
  const all: { id: MemberTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'giving', label: 'Giving' },
    { id: 'groups', label: 'Groups' },
    { id: 'notes', label: 'Notes' },
  ];
  if (role === 'C4' || role === 'C5') return all.filter((t) => t.id === 'overview' || t.id === 'groups');
  return all;
}

export function getMinistrySheetTabs(role: ChurchRoleLens): { id: MinistryTab; label: string }[] {
  const all: { id: MinistryTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'members', label: 'Members' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'budget', label: 'Budget' },
  ];
  if (role === 'C4' || role === 'C5') return all.filter((t) => t.id === 'overview');
  return all;
}

export function getServiceSheetTabs(role: ChurchRoleLens): { id: ServiceTab; label: string }[] {
  const all: { id: ServiceTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'team', label: 'Team' },
    { id: 'setlist', label: 'Setlist' },
    { id: 'notes', label: 'Notes' },
  ];
  if (role === 'C5') return all.filter((t) => t.id === 'overview');
  return all;
}

export function isMinistryLevel(role: ChurchRoleLens): boolean {
  return isStaffLevel(role);
}

// =============================================================================
// ROLE MAPPING
// =============================================================================

export function mapRoleToChurchLens(role: string): ChurchRoleLens {
  switch (role) {
    case 'senior_pastor':
    case 'lead_pastor':
    case 'pastor':
      return 'C1';
    case 'elder':
    case 'board':
    case 'deacon':
      return 'C2';
    case 'staff':
    case 'worship_leader':
    case 'youth_pastor':
      return 'C3';
    case 'member':
    case 'regular':
      return 'C4';
    case 'visitor':
    case 'public':
    case 'guest':
      return 'C5';
    default:
      return 'C5';
  }
}
