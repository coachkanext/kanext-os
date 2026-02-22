/**
 * Church Mode RBAC — 11-level role lens visibility matrix.
 *
 * C1:  Senior Pastor           (spec CH1)
 * C2:  Elder / Board           (spec CH3)
 * C3:  Staff                   (spec CH5)
 * C4:  Member                  (spec CH8)
 * C5:  Visitor / Public        (spec CH11)
 * C6:  Lead / Executive Pastor (spec CH2)
 * C7:  Ministry Leader         (spec CH4)
 * C8:  Worship Team            (spec CH6)
 * C9:  Volunteer               (spec CH7)
 * C10: Regular Attendee        (spec CH10)
 * C11: New Believer            (spec CH9)
 *
 * Privilege order: C1 > C6 > C2 > C7 > C3 > C8 > C9 > C4 > C11 > C10 > C5
 */

import { isSystemOwner } from '@/utils/system-rbac';

// =============================================================================
// ROLE LEVELS
// =============================================================================

export type ChurchRoleLens =
  | 'C1' | 'C2' | 'C3' | 'C4' | 'C5'
  | 'C6' | 'C7' | 'C8' | 'C9' | 'C10' | 'C11';

export type ChurchVisibility = 'full' | 'exact' | 'limited' | 'hidden';

export const CHURCH_ROLE_LABELS: Record<ChurchRoleLens, string> = {
  C1: 'Senior Pastor',
  C2: 'Elder / Board',
  C3: 'Staff',
  C4: 'Member',
  C5: 'Visitor / Public',
  C6: 'Lead / Executive Pastor',
  C7: 'Ministry Leader',
  C8: 'Worship Team',
  C9: 'Volunteer',
  C10: 'Regular Attendee',
  C11: 'New Believer',
};

// Helper to build an 11-column row concisely
type V = ChurchVisibility;
function r(c1: V, c2: V, c3: V, c4: V, c5: V, c6: V, c7: V, c8: V, c9: V, c10: V, c11: V): Record<ChurchRoleLens, V> {
  return { C1: c1, C2: c2, C3: c3, C4: c4, C5: c5, C6: c6, C7: c7, C8: c8, C9: c9, C10: c10, C11: c11 };
}

// =============================================================================
// HOME TAB VISIBILITY
// =============================================================================

export type ChurchHomeTab =
  | 'dashboard' | 'calendar' | 'worship' | 'community' | 'serve'
  | 'give' | 'events' | 'prayer' | 'messages' | 'discipleship';

//                                                         C1      C2      C3      C4       C5        C6      C7      C8      C9       C10      C11
const CHURCH_HOME_TAB_MATRIX: Record<ChurchHomeTab, Record<ChurchRoleLens, V>> = {
  dashboard:    r('full',    'full',    'full',    'limited', 'limited', 'full',    'full',    'full',    'limited', 'limited', 'limited'),
  calendar:     r('full',    'full',    'full',    'limited', 'limited', 'full',    'full',    'full',    'limited', 'limited', 'limited'),
  worship:      r('full',    'full',    'full',    'full',    'limited', 'full',    'full',    'full',    'full',    'limited', 'full'),
  community:    r('full',    'full',    'full',    'full',    'limited', 'full',    'full',    'full',    'full',    'limited', 'full'),
  serve:        r('full',    'full',    'limited', 'limited', 'hidden',  'full',    'full',    'limited', 'limited', 'hidden',  'hidden'),
  give:         r('full',    'full',    'full',    'full',    'limited', 'full',    'full',    'full',    'full',    'limited', 'full'),
  events:       r('full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  prayer:       r('full',    'full',    'limited', 'full',    'hidden',  'full',    'full',    'limited', 'full',    'hidden',  'full'),
  messages:     r('full',    'full',    'full',    'full',    'limited', 'full',    'full',    'full',    'full',    'limited', 'full'),
  discipleship: r('full',    'full',    'limited', 'limited', 'hidden',  'full',    'limited', 'limited', 'limited', 'hidden',  'limited'),
};

export function getChurchHomeTabVisibility(tab: ChurchHomeTab, role: ChurchRoleLens): ChurchVisibility {
  return CHURCH_HOME_TAB_MATRIX[tab]?.[role] ?? 'hidden';
}

// =============================================================================
// HOME PILL VISIBILITY (4-pill layout)
// =============================================================================

export type ChurchHomePill = 'dashboard' | 'calendar' | 'ministries' | 'connect';

//                                                           C1     C2     C3     C4       C5       C6     C7     C8     C9       C10      C11
const CHURCH_HOME_PILL_MATRIX: Record<ChurchHomePill, Record<ChurchRoleLens, V>> = {
  dashboard:  r('full', 'full', 'full',   'full',   'full',   'full', 'full', 'full',   'full',   'full',   'full'),
  calendar:   r('full', 'full', 'full',   'full',   'full',   'full', 'full', 'full',   'full',   'full',   'full'),
  ministries: r('full', 'full', 'full',   'full',   'hidden', 'full', 'full', 'full',   'full',   'hidden', 'full'),
  connect:    r('full', 'full', 'full',   'hidden', 'hidden', 'full', 'full', 'full',   'hidden', 'hidden', 'hidden'),
};

export function getChurchVisiblePills(role: ChurchRoleLens): ChurchHomePill[] {
  return (Object.keys(CHURCH_HOME_PILL_MATRIX) as ChurchHomePill[])
    .filter((pill) => CHURCH_HOME_PILL_MATRIX[pill][role] !== 'hidden');
}

// =============================================================================
// DASHBOARD SECTION VISIBILITY
// =============================================================================

export type ChurchDashboardSection =
  | 'video_hero' | 'next_service' | 'commerce_row'
  | 'ministry_health' | 'growth_metrics';

//                                                                      C1     C2      C3      C4       C5       C6     C7      C8       C9       C10      C11
const CHURCH_DASHBOARD_SECTION_MATRIX: Record<ChurchDashboardSection, Record<ChurchRoleLens, V>> = {
  video_hero:       r('full', 'full',    'full',    'full',    'full',    'full', 'full',    'full',    'full',    'full',    'full'),
  next_service:     r('full', 'full',    'full',    'full',    'full',    'full', 'full',    'full',    'full',    'full',    'full'),
  commerce_row:     r('full', 'full',    'full',    'full',    'full',    'full', 'full',    'full',    'full',    'full',    'full'),
  ministry_health:  r('full', 'limited', 'limited', 'hidden', 'hidden',  'full', 'limited', 'hidden',  'hidden',  'hidden',  'hidden'),
  growth_metrics:   r('full', 'full',    'limited', 'limited', 'hidden', 'full', 'limited', 'limited', 'limited', 'limited', 'limited'),
};

export function canSeeChurchDashboardSection(section: ChurchDashboardSection, role: ChurchRoleLens): ChurchVisibility {
  return CHURCH_DASHBOARD_SECTION_MATRIX[section]?.[role] ?? 'hidden';
}

// =============================================================================
// ORG TAB VISIBILITY
// =============================================================================

export type ChurchOrgTab =
  | 'ministries' | 'people' | 'rooms' | 'operations' | 'finance'
  | 'payment-rails' | 'compliance' | 'facilities' | 'resources' | 'donations';

//                                                         C1     C2      C3       C4       C5       C6     C7      C8       C9       C10      C11
const CHURCH_ORG_TAB_MATRIX: Record<ChurchOrgTab, Record<ChurchRoleLens, V>> = {
  ministries:      r('full', 'full',    'full',    'limited', 'limited', 'full', 'full',    'full',    'limited', 'limited', 'limited'),
  people:          r('full', 'full',    'limited', 'limited', 'hidden',  'full', 'full',    'limited', 'limited', 'hidden',  'hidden'),
  rooms:           r('full', 'full',    'limited', 'hidden',  'hidden',  'full', 'full',    'limited', 'hidden',  'hidden',  'hidden'),
  operations:      r('full', 'full',    'limited', 'hidden',  'hidden',  'full', 'full',    'hidden',  'hidden',  'hidden',  'hidden'),
  finance:         r('full', 'full',    'limited', 'hidden',  'hidden',  'full', 'limited', 'hidden',  'hidden',  'hidden',  'hidden'),
  'payment-rails': r('full', 'full',    'hidden',  'hidden',  'hidden',  'full', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  compliance:      r('full', 'full',    'limited', 'hidden',  'hidden',  'full', 'limited', 'hidden',  'hidden',  'hidden',  'hidden'),
  facilities:      r('full', 'full',    'limited', 'limited', 'hidden',  'full', 'full',    'limited', 'limited', 'hidden',  'hidden'),
  resources:       r('full', 'full',    'limited', 'limited', 'hidden',  'full', 'full',    'limited', 'limited', 'hidden',  'hidden'),
  donations:       r('full', 'full',    'limited', 'limited', 'hidden',  'full', 'full',    'limited', 'limited', 'hidden',  'hidden'),
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
    { id: 'post-announcement', label: 'Post Announcement', icon: 'megaphone.fill' },
    { id: 'approve-requests', label: 'Approve Requests', icon: 'checkmark.seal.fill' },
    { id: 'pin-hero-video', label: 'Pin Hero Video', icon: 'pin.fill' },
    { id: 'open-payment-rails', label: 'Payment Rails', icon: 'creditcard.fill' },
    { id: 'open-announcements', label: 'Announcements', icon: 'bell.fill' },
  ],
  C6: [
    { id: 'worship-plan', label: 'Worship Plan', icon: 'music.note.list' },
    { id: 'sermon-prep', label: 'Sermon Prep', icon: 'book.fill' },
    { id: 'staff-meeting', label: 'Staff Meeting', icon: 'person.3.fill' },
    { id: 'budget-review', label: 'Budget Review', icon: 'dollarsign.circle.fill' },
    { id: 'prayer-wall', label: 'Prayer Wall', icon: 'hands.sparkles.fill' },
    { id: 'post-announcement', label: 'Post Announcement', icon: 'megaphone.fill' },
    { id: 'approve-requests', label: 'Approve Requests', icon: 'checkmark.seal.fill' },
  ],
  C2: [
    { id: 'create-event', label: 'Create Event', icon: 'calendar.badge.plus' },
    { id: 'manage-volunteers', label: 'Manage Volunteers', icon: 'person.3.fill' },
    { id: 'post-update', label: 'Post Update', icon: 'square.and.pencil' },
    { id: 'request-budget', label: 'Request Budget', icon: 'dollarsign.circle.fill' },
    { id: 'open-my-ministry', label: 'Open My Ministry', icon: 'heart.fill' },
    { id: 'open-check-in', label: 'Open Check-In', icon: 'checkmark.circle.fill' },
    { id: 'schedule-event', label: 'Schedule Event', icon: 'clock.fill' },
  ],
  C7: [
    { id: 'create-event', label: 'Create Event', icon: 'calendar.badge.plus' },
    { id: 'manage-volunteers', label: 'Manage Volunteers', icon: 'person.3.fill' },
    { id: 'open-my-ministry', label: 'Open My Ministry', icon: 'heart.fill' },
    { id: 'open-check-in', label: 'Open Check-In', icon: 'checkmark.circle.fill' },
    { id: 'post-update', label: 'Post Update', icon: 'square.and.pencil' },
  ],
  C3: [
    { id: 'my-ministries', label: 'My Ministries', icon: 'heart.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'volunteer-schedule', label: 'Volunteer Schedule', icon: 'clock.fill' },
    { id: 'submit-request', label: 'Submit Request', icon: 'paperplane.fill' },
    { id: 'open-check-in', label: 'Check-In', icon: 'checkmark.circle.fill' },
  ],
  C8: [
    { id: 'my-ministries', label: 'My Ministries', icon: 'heart.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'volunteer-schedule', label: 'Volunteer Schedule', icon: 'clock.fill' },
    { id: 'worship', label: 'Watch Worship', icon: 'play.circle.fill' },
  ],
  C9: [
    { id: 'volunteer-schedule', label: 'Volunteer Schedule', icon: 'clock.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'give', label: 'Give', icon: 'heart.fill' },
    { id: 'prayer', label: 'Prayer Request', icon: 'hands.sparkles.fill' },
  ],
  C4: [
    { id: 'worship', label: 'Watch Worship', icon: 'play.circle.fill' },
    { id: 'give', label: 'Give', icon: 'heart.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'prayer', label: 'Prayer Request', icon: 'hands.sparkles.fill' },
  ],
  C11: [
    { id: 'worship', label: 'Watch Worship', icon: 'play.circle.fill' },
    { id: 'give', label: 'Give', icon: 'heart.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'prayer', label: 'Prayer Request', icon: 'hands.sparkles.fill' },
  ],
  C10: [
    { id: 'worship', label: 'Watch Online', icon: 'play.circle.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'give', label: 'Give', icon: 'heart.fill' },
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

const MEMBER_LEVEL_ROLES: Set<ChurchRoleLens> = new Set(['C4', 'C5', 'C9', 'C10', 'C11']);

export function isSeniorPastor(role: ChurchRoleLens): boolean {
  return role === 'C1';
}

export function isElderLevel(role: ChurchRoleLens): boolean {
  return role === 'C1' || role === 'C2' || role === 'C6';
}

export function isStaffLevel(role: ChurchRoleLens): boolean {
  return role === 'C1' || role === 'C2' || role === 'C3' || role === 'C6' || role === 'C7' || role === 'C8';
}

export function isMember(role: ChurchRoleLens): boolean {
  return role !== 'C5';
}

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
  if (MEMBER_LEVEL_ROLES.has(role)) return all.filter((t) => t.id === 'overview' || t.id === 'groups');
  return all;
}

export function getMinistrySheetTabs(role: ChurchRoleLens): { id: MinistryTab; label: string }[] {
  const all: { id: MinistryTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'members', label: 'Members' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'budget', label: 'Budget' },
  ];
  if (MEMBER_LEVEL_ROLES.has(role)) return all.filter((t) => t.id === 'overview');
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
// MEMBERSHIP → LENS (direct membership_id mapping for ActiveView)
// =============================================================================

const CHURCH_MEMBERSHIP_MAP: Record<string, ChurchRoleLens> = {};

export function getChurchRole(membershipId: string): ChurchRoleLens {
  if (isSystemOwner(membershipId)) return 'C1';
  return CHURCH_MEMBERSHIP_MAP[membershipId] ?? 'C1';
}

export function mapRoleToChurchLens(role: string): ChurchRoleLens {
  switch (role) {
    case 'senior_pastor':
    case 'pastor':
      return 'C1';
    case 'lead_pastor':
    case 'executive_pastor':
      return 'C6';
    case 'elder':
    case 'board':
    case 'deacon':
      return 'C2';
    case 'ministry_leader':
      return 'C7';
    case 'staff':
    case 'youth_pastor':
      return 'C3';
    case 'worship_leader':
    case 'worship_team':
      return 'C8';
    case 'volunteer':
      return 'C9';
    case 'member':
      return 'C4';
    case 'new_believer':
      return 'C11';
    case 'regular':
    case 'attendee':
      return 'C10';
    case 'visitor':
    case 'public':
    case 'guest':
      return 'C5';
    default:
      return 'C5';
  }
}
