/**
 * Church Mode RBAC Registry — Constitutional 4D Role Definitions
 *
 * Maps membership_id → Church Role Lens (C0–C11), then provides declarative
 * visibility matrices for every tab/section across Home, Org, and Sheet surfaces.
 *
 * Each role is defined by four dimensions per the Universal RBAC Constitution:
 *   Authority (A0-A5) · Domain Scope · Visibility (V0-V5) · Decision Access (D0-D5)
 *
 * C0:  System Owner           C6:  Volunteer Coordinator
 * C1:  Senior Pastor          C7:  Volunteer
 * C2:  Executive Pastor       C8:  Member
 * C3:  Ministry Director      C9:  Attendee
 * C4:  Ministry Leader        C10: New Believer
 * C5:  Worship Leader         C11: Visitor
 *
 * Privilege order: C0 > C1 > C2 > C3 > C4 > C5 > C6 > C7 > C8 > C9 > C10 > C11
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

export type ChurchRoleLens =
  | 'C0' | 'C1' | 'C2' | 'C3' | 'C4' | 'C5'
  | 'C6' | 'C7' | 'C8' | 'C9' | 'C10' | 'C11';

export type ChurchVisibility = 'full' | 'exact' | 'limited' | 'hidden';

export const CHURCH_ROLE_LABELS: Record<ChurchRoleLens, string> = {
  C0: 'System Owner',
  C1: 'Senior Pastor',
  C2: 'Executive Pastor',
  C3: 'Ministry Director',
  C4: 'Ministry Leader',
  C5: 'Worship Leader',
  C6: 'Volunteer Coordinator',
  C7: 'Volunteer',
  C8: 'Member',
  C9: 'Attendee',
  C10: 'New Believer',
  C11: 'Visitor',
};

// =============================================================================
// 4D ROLE DEFINITIONS
// =============================================================================

export const CHURCH_ROLES: Record<ChurchRoleLens, UniversalRoleDefinition> = {
  C0:  { id: 'C0',  label: 'System Owner',          authority: Authority.Institutional, scope: 'global',     visibility: Vis.Institutional, decision: Decision.Institutional },
  C1:  { id: 'C1',  label: 'Senior Pastor',         authority: Authority.Institutional, scope: 'global',     visibility: Vis.Institutional, decision: Decision.Institutional },
  C2:  { id: 'C2',  label: 'Executive Pastor',      authority: Authority.DomainGov,     scope: 'domain',     visibility: Vis.Strategic,     decision: Decision.Strategic },
  C3:  { id: 'C3',  label: 'Ministry Director',     authority: Authority.ProgramGov,    scope: 'program',    visibility: Vis.Competitive,   decision: Decision.Tactical },
  C4:  { id: 'C4',  label: 'Ministry Leader',       authority: Authority.Execution,     scope: 'program',    visibility: Vis.Tactical,      decision: Decision.Operational },
  C5:  { id: 'C5',  label: 'Worship Leader',        authority: Authority.Execution,     scope: 'sub-domain', visibility: Vis.Tactical,      decision: Decision.Operational, domainLane: 'worship' },
  C6:  { id: 'C6',  label: 'Volunteer Coordinator', authority: Authority.Execution,     scope: 'sub-domain', visibility: Vis.Community,     decision: Decision.Operational, domainLane: 'volunteers' },
  C7:  { id: 'C7',  label: 'Volunteer',             authority: Authority.Personal,      scope: 'personal',   visibility: Vis.Community,     decision: Decision.Self },
  C8:  { id: 'C8',  label: 'Member',                authority: Authority.Observer,       scope: 'personal',   visibility: Vis.Community,     decision: Decision.None },
  C9:  { id: 'C9',  label: 'Attendee',              authority: Authority.Observer,       scope: 'personal',   visibility: Vis.Public,        decision: Decision.None },
  C10: { id: 'C10', label: 'New Believer',          authority: Authority.Observer,       scope: 'personal',   visibility: Vis.Public,        decision: Decision.None },
  C11: { id: 'C11', label: 'Visitor',               authority: Authority.Observer,       scope: 'personal',   visibility: Vis.Public,        decision: Decision.None },
};

// Helper to build a 12-column row concisely
type V = ChurchVisibility;
function r(c0: V, c1: V, c2: V, c3: V, c4: V, c5: V, c6: V, c7: V, c8: V, c9: V, c10: V, c11: V): Record<ChurchRoleLens, V> {
  return { C0: c0, C1: c1, C2: c2, C3: c3, C4: c4, C5: c5, C6: c6, C7: c7, C8: c8, C9: c9, C10: c10, C11: c11 };
}

// =============================================================================
// HOME TAB VISIBILITY
// =============================================================================

export type ChurchHomeTab =
  | 'dashboard' | 'calendar' | 'worship' | 'community' | 'serve'
  | 'give' | 'events' | 'prayer' | 'messages' | 'discipleship';

//                                                         C0      C1      C2      C3      C4       C5       C6       C7       C8       C9       C10      C11
const CHURCH_HOME_TAB_MATRIX: Record<ChurchHomeTab, Record<ChurchRoleLens, V>> = {
  dashboard:    r('full', 'full',    'full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'limited'),
  calendar:     r('full', 'full',    'full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'limited'),
  worship:      r('full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'limited', 'full',    'limited'),
  community:    r('full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'limited', 'full',    'limited'),
  serve:        r('full', 'full',    'full',    'full',    'full',    'limited', 'full',    'limited', 'limited', 'hidden',  'hidden',  'hidden'),
  give:         r('full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'limited', 'full',    'limited'),
  events:       r('full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  prayer:       r('full', 'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'full',    'hidden',  'full',    'hidden'),
  messages:     r('full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'limited', 'full',    'limited'),
  discipleship: r('full', 'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'limited', 'hidden',  'limited', 'hidden'),
};

export function getChurchHomeTabVisibility(tab: ChurchHomeTab, role: ChurchRoleLens): ChurchVisibility {
  return CHURCH_HOME_TAB_MATRIX[tab]?.[role] ?? 'hidden';
}

// =============================================================================
// HOME PILL VISIBILITY (4-pill layout)
// =============================================================================

export type ChurchHomePill = 'dashboard' | 'calendar' | 'ministries' | 'connect';

//                                                           C0     C1     C2     C3     C4      C5      C6      C7      C8      C9       C10      C11
const CHURCH_HOME_PILL_MATRIX: Record<ChurchHomePill, Record<ChurchRoleLens, V>> = {
  dashboard:  r('full', 'full', 'full',   'full',   'full',   'full',   'full',   'full',   'full',   'full',   'full',   'full'),
  calendar:   r('full', 'full', 'full',   'full',   'full',   'full',   'full',   'full',   'full',   'full',   'full',   'full'),
  ministries: r('full', 'full', 'full',   'full',   'full',   'full',   'full',   'full',   'full',   'hidden', 'full',   'hidden'),
  connect:    r('full', 'full', 'full',   'full',   'full',   'full',   'full',   'hidden', 'hidden', 'hidden', 'hidden', 'hidden'),
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

//                                                                      C0     C1      C2      C3      C4       C5       C6       C7       C8       C9       C10      C11
const CHURCH_DASHBOARD_SECTION_MATRIX: Record<ChurchDashboardSection, Record<ChurchRoleLens, V>> = {
  video_hero:       r('full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  next_service:     r('full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  commerce_row:     r('full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  ministry_health:  r('full', 'full',    'full',    'limited', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  growth_metrics:   r('full', 'full',    'full',    'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'limited'),
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

//                                                         C0     C1      C2       C3       C4       C5       C6       C7       C8       C9       C10      C11
const CHURCH_ORG_TAB_MATRIX: Record<ChurchOrgTab, Record<ChurchRoleLens, V>> = {
  ministries:      r('full', 'full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'limited', 'limited'),
  people:          r('full', 'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'limited', 'hidden',  'hidden',  'hidden'),
  rooms:           r('full', 'full',    'full',    'full',    'full',    'limited', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  operations:      r('full', 'full',    'full',    'full',    'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  finance:         r('full', 'full',    'full',    'limited', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  'payment-rails': r('full', 'full',    'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  compliance:      r('full', 'full',    'full',    'limited', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  facilities:      r('full', 'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'hidden',  'hidden',  'hidden'),
  resources:       r('full', 'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'hidden',  'hidden',  'hidden'),
  donations:       r('full', 'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'hidden',  'hidden',  'hidden'),
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

const CHURCH_QUICK_ACTIONS: Partial<Record<ChurchRoleLens, ChurchQuickAction[]>> = {
  C0: [
    { id: 'system-overview', label: 'System Overview', icon: 'gearshape.fill' },
    { id: 'worship-plan', label: 'Worship Plan', icon: 'music.note.list' },
    { id: 'staff-meeting', label: 'Staff Meeting', icon: 'person.3.fill' },
    { id: 'budget-review', label: 'Budget Review', icon: 'dollarsign.circle.fill' },
    { id: 'audit-log', label: 'Audit Log', icon: 'doc.text.fill' },
  ],
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
  C2: [
    { id: 'worship-plan', label: 'Worship Plan', icon: 'music.note.list' },
    { id: 'sermon-prep', label: 'Sermon Prep', icon: 'book.fill' },
    { id: 'staff-meeting', label: 'Staff Meeting', icon: 'person.3.fill' },
    { id: 'budget-review', label: 'Budget Review', icon: 'dollarsign.circle.fill' },
    { id: 'prayer-wall', label: 'Prayer Wall', icon: 'hands.sparkles.fill' },
    { id: 'post-announcement', label: 'Post Announcement', icon: 'megaphone.fill' },
    { id: 'approve-requests', label: 'Approve Requests', icon: 'checkmark.seal.fill' },
  ],
  C3: [
    { id: 'create-event', label: 'Create Event', icon: 'calendar.badge.plus' },
    { id: 'manage-volunteers', label: 'Manage Volunteers', icon: 'person.3.fill' },
    { id: 'post-update', label: 'Post Update', icon: 'square.and.pencil' },
    { id: 'request-budget', label: 'Request Budget', icon: 'dollarsign.circle.fill' },
    { id: 'open-my-ministry', label: 'Open My Ministry', icon: 'heart.fill' },
    { id: 'open-check-in', label: 'Open Check-In', icon: 'checkmark.circle.fill' },
    { id: 'schedule-event', label: 'Schedule Event', icon: 'clock.fill' },
  ],
  C4: [
    { id: 'create-event', label: 'Create Event', icon: 'calendar.badge.plus' },
    { id: 'manage-volunteers', label: 'Manage Volunteers', icon: 'person.3.fill' },
    { id: 'open-my-ministry', label: 'Open My Ministry', icon: 'heart.fill' },
    { id: 'open-check-in', label: 'Open Check-In', icon: 'checkmark.circle.fill' },
    { id: 'post-update', label: 'Post Update', icon: 'square.and.pencil' },
  ],
  C5: [
    { id: 'my-ministries', label: 'My Ministries', icon: 'heart.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'volunteer-schedule', label: 'Volunteer Schedule', icon: 'clock.fill' },
    { id: 'worship', label: 'Watch Worship', icon: 'play.circle.fill' },
  ],
  C6: [
    { id: 'my-ministries', label: 'My Ministries', icon: 'heart.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'manage-volunteers', label: 'Manage Volunteers', icon: 'person.3.fill' },
    { id: 'volunteer-schedule', label: 'Volunteer Schedule', icon: 'clock.fill' },
    { id: 'submit-request', label: 'Submit Request', icon: 'paperplane.fill' },
    { id: 'open-check-in', label: 'Check-In', icon: 'checkmark.circle.fill' },
  ],
  C7: [
    { id: 'volunteer-schedule', label: 'Volunteer Schedule', icon: 'clock.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'give', label: 'Give', icon: 'heart.fill' },
    { id: 'prayer', label: 'Prayer Request', icon: 'hands.sparkles.fill' },
  ],
  C8: [
    { id: 'worship', label: 'Watch Worship', icon: 'play.circle.fill' },
    { id: 'give', label: 'Give', icon: 'heart.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'prayer', label: 'Prayer Request', icon: 'hands.sparkles.fill' },
  ],
  C9: [
    { id: 'worship', label: 'Watch Online', icon: 'play.circle.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'give', label: 'Give', icon: 'heart.fill' },
  ],
  C10: [
    { id: 'worship', label: 'Watch Worship', icon: 'play.circle.fill' },
    { id: 'give', label: 'Give', icon: 'heart.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'prayer', label: 'Prayer Request', icon: 'hands.sparkles.fill' },
  ],
  C11: [
    { id: 'visit', label: 'Plan a Visit', icon: 'mappin.and.ellipse' },
    { id: 'worship', label: 'Watch Online', icon: 'play.circle.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
  ],
};

export function getChurchQuickActions(role: ChurchRoleLens): ChurchQuickAction[] {
  return CHURCH_QUICK_ACTIONS[role] || CHURCH_QUICK_ACTIONS.C11 || [];
}

// =============================================================================
// VISIBILITY HELPERS — Constitutional rewrites
// =============================================================================

const MEMBER_LEVEL_ROLES: Set<ChurchRoleLens> = new Set(['C7', 'C8', 'C9', 'C10', 'C11']);

export function isSeniorPastor(role: ChurchRoleLens): boolean {
  return role === 'C0' || role === 'C1';
}

/** Constitutional: authority >= DomainGov (C0-C2) — pastoral-level access */
export function isPastoralLevel(role: ChurchRoleLens): boolean {
  return CHURCH_ROLES[role].authority >= Authority.DomainGov;
}

/** Backward compat alias for isPastoralLevel */
export function isElderLevel(role: ChurchRoleLens): boolean {
  return isPastoralLevel(role);
}

/** Constitutional: authority >= Execution (C0-C6) — staff-level access */
export function isStaffLevel(role: ChurchRoleLens): boolean {
  return CHURCH_ROLES[role].authority >= Authority.Execution;
}

export function isMember(role: ChurchRoleLens): boolean {
  return role !== 'C11';
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
  if (role === 'C11') return all.filter((t) => t.id === 'overview');
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
  if (isSystemOwner(membershipId)) return 'C0';
  return CHURCH_MEMBERSHIP_MAP[membershipId] ?? 'C1';
}

export function mapRoleToChurchLens(role: string): ChurchRoleLens {
  switch (role) {
    case 'system_owner':
      return 'C0';
    case 'senior_pastor':
    case 'pastor':
      return 'C1';
    case 'lead_pastor':
    case 'executive_pastor':
      return 'C2';
    case 'ministry_director':
    case 'elder':
    case 'board':
    case 'deacon':
      return 'C3';
    case 'ministry_leader':
      return 'C4';
    case 'worship_leader':
    case 'worship_team':
      return 'C5';
    case 'volunteer_coordinator':
      return 'C6';
    case 'volunteer':
      return 'C7';
    case 'member':
      return 'C8';
    case 'regular':
    case 'attendee':
      return 'C9';
    case 'new_believer':
      return 'C10';
    case 'staff':
    case 'youth_pastor':
      return 'C3';
    case 'visitor':
    case 'public':
    case 'guest':
      return 'C11';
    default:
      return 'C11';
  }
}
