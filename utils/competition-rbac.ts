/**
 * Competition Mode RBAC — 4-level role lens visibility matrix.
 * C1: League Owner + Commissioner (Full access)
 * C2: Tournament Director / Event Director (Full access, event-scoped)
 * C3: Speaker + Tournament Advisor (Limited advisory)
 * C4: Fan / General Viewer (Public only)
 */

// =============================================================================
// ROLE LEVELS
// =============================================================================

export type CompetitionRoleLens = 'C1' | 'C2' | 'C3' | 'C4';

export type Visibility = 'full' | 'limited' | 'hidden';

export const COMPETITION_ROLE_LABELS: Record<CompetitionRoleLens, string> = {
  C1: 'Owner / Commissioner',
  C2: 'Tournament Director',
  C3: 'Advisor',
  C4: 'Public',
};

// =============================================================================
// SERIES SHEET TAB VISIBILITY
// =============================================================================

export type SeriesTab =
  | 'dashboard' | 'standings' | 'calendar' | 'events' | 'ops'
  | 'rules' | 'tech_compliance' | 'finance' | 'payment_rails'
  | 'venues' | 'sponsors' | 'media';

const SERIES_TAB_MATRIX: Record<SeriesTab, Record<CompetitionRoleLens, Visibility>> = {
  dashboard:       { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
  standings:       { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
  calendar:        { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
  events:          { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
  ops:             { C1: 'full', C2: 'full', C3: 'limited', C4: 'hidden' },
  rules:           { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
  tech_compliance: { C1: 'full', C2: 'full', C3: 'limited', C4: 'hidden' },
  finance:         { C1: 'full', C2: 'full', C3: 'hidden',  C4: 'hidden' },
  payment_rails:   { C1: 'full', C2: 'full', C3: 'hidden',  C4: 'hidden' },
  venues:          { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
  sponsors:        { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
  media:           { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
};

export function getSeriesSheetTabs(role: CompetitionRoleLens): { id: SeriesTab; label: string; visibility: Visibility }[] {
  const labels: Record<SeriesTab, string> = {
    dashboard: 'Dashboard', standings: 'Standings', calendar: 'Calendar',
    events: 'Events', ops: 'Ops', rules: 'Rules', tech_compliance: 'Tech + Compliance',
    finance: 'Finance', payment_rails: 'Payment Rails', venues: 'Venues',
    sponsors: 'Sponsors', media: 'Media',
  };
  return (Object.keys(SERIES_TAB_MATRIX) as SeriesTab[])
    .filter((tab) => SERIES_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: SERIES_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// ENTRANT SHEET TAB VISIBILITY
// =============================================================================

export type EntrantTab =
  | 'overview' | 'roster' | 'performance' | 'compliance' | 'payouts' | 'media_obligations';

const ENTRANT_TAB_MATRIX: Record<EntrantTab, Record<CompetitionRoleLens, Visibility>> = {
  overview:           { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
  roster:             { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
  performance:        { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
  compliance:         { C1: 'full', C2: 'full', C3: 'limited', C4: 'hidden' },
  payouts:            { C1: 'full', C2: 'full', C3: 'hidden',  C4: 'hidden' },
  media_obligations:  { C1: 'full', C2: 'full', C3: 'limited', C4: 'hidden' },
};

export function getEntrantSheetTabs(role: CompetitionRoleLens): { id: EntrantTab; label: string; visibility: Visibility }[] {
  const labels: Record<EntrantTab, string> = {
    overview: 'Overview', roster: 'Roster / Personnel', performance: 'Performance',
    compliance: 'Compliance', payouts: 'Payouts', media_obligations: 'Media Obligations',
  };
  return (Object.keys(ENTRANT_TAB_MATRIX) as EntrantTab[])
    .filter((tab) => ENTRANT_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: ENTRANT_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// EVENT SHEET TAB VISIBILITY
// =============================================================================

export type EventTab =
  | 'agenda' | 'sessions' | 'ops' | 'live_control' | 'results'
  | 'incidents' | 'payouts' | 'media_deliverables';

const EVENT_TAB_MATRIX: Record<EventTab, Record<CompetitionRoleLens, Visibility>> = {
  agenda:             { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
  sessions:           { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
  ops:                { C1: 'full', C2: 'full', C3: 'limited', C4: 'hidden' },
  live_control:       { C1: 'full', C2: 'full', C3: 'hidden',  C4: 'hidden' },
  results:            { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
  incidents:          { C1: 'full', C2: 'full', C3: 'limited', C4: 'hidden' },
  payouts:            { C1: 'full', C2: 'full', C3: 'hidden',  C4: 'hidden' },
  media_deliverables: { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
};

export function getEventSheetTabs(role: CompetitionRoleLens): { id: EventTab; label: string; visibility: Visibility }[] {
  const labels: Record<EventTab, string> = {
    agenda: 'Agenda', sessions: 'Sessions', ops: 'Ops', live_control: 'Live Control',
    results: 'Results', incidents: 'Incidents', payouts: 'Payouts',
    media_deliverables: 'Media Deliverables',
  };
  return (Object.keys(EVENT_TAB_MATRIX) as EventTab[])
    .filter((tab) => EVENT_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: EVENT_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// DASHBOARD MODULE VISIBILITY
// =============================================================================

export type DashboardModule =
  | 'header' | 'today_next' | 'live_status' | 'format_snapshot'
  | 'standings_bracket' | 'schedule_snapshot' | 'media_storylines'
  | 'announcements' | 'ops_taskboard' | 'staff_contacts'
  | 'officials_compliance' | 'sponsors_revenue' | 'governance' | 'audit_trail';

const DASHBOARD_MODULE_MATRIX: Record<DashboardModule, Record<CompetitionRoleLens, Visibility>> = {
  header:             { C1: 'full', C2: 'full', C3: 'full',    C4: 'full' },
  today_next:         { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
  live_status:        { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
  format_snapshot:    { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
  standings_bracket:  { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
  schedule_snapshot:  { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
  media_storylines:   { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
  announcements:      { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
  ops_taskboard:      { C1: 'full', C2: 'full', C3: 'hidden',  C4: 'hidden' },
  staff_contacts:     { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
  officials_compliance: { C1: 'full', C2: 'full', C3: 'hidden', C4: 'hidden' },
  sponsors_revenue:   { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
  governance:         { C1: 'full', C2: 'hidden', C3: 'hidden', C4: 'hidden' },
  audit_trail:        { C1: 'full', C2: 'full', C3: 'hidden',  C4: 'hidden' },
};

export function getDashboardModules(role: CompetitionRoleLens): { id: DashboardModule; visibility: Visibility }[] {
  return (Object.keys(DASHBOARD_MODULE_MATRIX) as DashboardModule[])
    .filter((mod) => DASHBOARD_MODULE_MATRIX[mod][role] !== 'hidden')
    .map((mod) => ({ id: mod, visibility: DASHBOARD_MODULE_MATRIX[mod][role] }));
}

// =============================================================================
// QUICK ACTIONS BY ROLE
// =============================================================================

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
}

const QUICK_ACTIONS: Record<CompetitionRoleLens, QuickAction[]> = {
  C1: [
    { id: 'live-ops', label: 'Open Live Ops', icon: 'antenna.radiowaves.left.and.right' },
    { id: 'publish-schedule', label: 'Publish Schedule', icon: 'calendar.badge.plus' },
    { id: 'update-bracket', label: 'Update Bracket/Standings', icon: 'chart.bar.fill' },
    { id: 'announcement', label: 'Post Announcement', icon: 'megaphone.fill' },
    { id: 'staff-invites', label: 'Staff / Invites', icon: 'person.badge.plus' },
    { id: 'finance', label: 'Finance Snapshot', icon: 'dollarsign.circle.fill' },
    { id: 'governance', label: 'Governance Docs', icon: 'doc.text.fill' },
  ],
  C2: [
    { id: 'live-ops', label: 'Open Live Ops', icon: 'antenna.radiowaves.left.and.right' },
    { id: 'publish-schedule', label: 'Publish Schedule', icon: 'calendar.badge.plus' },
    { id: 'update-bracket', label: 'Update Bracket', icon: 'chart.bar.fill' },
    { id: 'announcement', label: 'Post Announcement', icon: 'megaphone.fill' },
    { id: 'staff', label: 'Staff / Assignments', icon: 'person.2.fill' },
    { id: 'incident-log', label: 'Incident Log', icon: 'exclamationmark.triangle.fill' },
  ],
  C3: [
    { id: 'schedule', label: 'View Schedule', icon: 'calendar' },
    { id: 'bracket', label: 'View Bracket', icon: 'chart.bar.fill' },
    { id: 'advisor-pack', label: 'Open Advisor Pack', icon: 'doc.text.fill' },
    { id: 'media', label: 'View Media', icon: 'play.rectangle.fill' },
  ],
  C4: [
    { id: 'bracket', label: 'View Bracket/Standings', icon: 'chart.bar.fill' },
    { id: 'schedule', label: 'View Schedule', icon: 'calendar' },
    { id: 'highlights', label: 'Watch Highlights', icon: 'play.rectangle.fill' },
  ],
};

export function getQuickActions(role: CompetitionRoleLens): QuickAction[] {
  return QUICK_ACTIONS[role] || QUICK_ACTIONS.C4;
}

// =============================================================================
// ROLE MAPPING
// =============================================================================

// =============================================================================
// MEMBERSHIP → LENS (direct membership_id mapping for ActiveView)
// =============================================================================

const COMPETITION_MEMBERSHIP_MAP: Record<string, CompetitionRoleLens> = {
  mem_comp_k1_owner_commish: 'C1',
  mem_comp_btw_director: 'C2',
  mem_comp_mlk_advisor: 'C3',
  mem_comp_valuetainment_public: 'C4',
};

export function getCompetitionRole(membershipId: string): CompetitionRoleLens {
  return COMPETITION_MEMBERSHIP_MAP[membershipId] ?? 'C4';
}

export function mapRoleToCompetitionLens(role: string): CompetitionRoleLens {
  switch (role) {
    case 'league_admin':
    case 'commissioner':
    case 'owner':
      return 'C1';
    case 'tournament_director':
    case 'event_director':
    case 'race_director':
      return 'C2';
    case 'advisor':
    case 'speaker':
      return 'C3';
    case 'fan':
    case 'viewer':
    case 'public':
    default:
      return 'C4';
  }
}

// =============================================================================
// VISIBILITY HELPERS
// =============================================================================

export function canSeeModule(module: DashboardModule, role: CompetitionRoleLens): boolean {
  return DASHBOARD_MODULE_MATRIX[module][role] !== 'hidden';
}

export function isFullAccess(role: CompetitionRoleLens): boolean {
  return role === 'C1' || role === 'C2';
}

export function isStaffOrAbove(role: CompetitionRoleLens): boolean {
  return role === 'C1' || role === 'C2';
}

// =============================================================================
// ORG TAB VISIBILITY (10 tabs in Competition Organization)
// =============================================================================

export type CompOrgTab =
  | 'series' | 'people' | 'rooms' | 'operations' | 'finance'
  | 'payment-rails' | 'compliance' | 'assets' | 'reports' | 'sponsors';

const COMP_ORG_TAB_MATRIX: Record<CompOrgTab, Record<CompetitionRoleLens, Visibility>> = {
  series:         { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
  people:         { C1: 'full', C2: 'full', C3: 'limited', C4: 'hidden' },
  rooms:          { C1: 'full', C2: 'full', C3: 'limited', C4: 'hidden' },
  operations:     { C1: 'full', C2: 'full', C3: 'limited', C4: 'hidden' },
  finance:        { C1: 'full', C2: 'full', C3: 'hidden',  C4: 'hidden' },
  'payment-rails':{ C1: 'full', C2: 'full', C3: 'hidden',  C4: 'hidden' },
  compliance:     { C1: 'full', C2: 'full', C3: 'limited', C4: 'hidden' },
  assets:         { C1: 'full', C2: 'full', C3: 'limited', C4: 'hidden' },
  reports:        { C1: 'full', C2: 'full', C3: 'limited', C4: 'hidden' },
  sponsors:       { C1: 'full', C2: 'full', C3: 'limited', C4: 'limited' },
};

export function getCompOrgTabVisibility(tab: CompOrgTab, role: CompetitionRoleLens): Visibility {
  return COMP_ORG_TAB_MATRIX[tab]?.[role] ?? 'hidden';
}

export function getVisibleCompOrgTabs(role: CompetitionRoleLens): CompOrgTab[] {
  return (Object.keys(COMP_ORG_TAB_MATRIX) as CompOrgTab[])
    .filter((tab) => COMP_ORG_TAB_MATRIX[tab][role] !== 'hidden');
}

// =============================================================================
// HOME PILL VISIBILITY (4-pill layout)
// =============================================================================

export type CompetitionHomePill = 'dashboard' | 'calendar' | 'grid' | 'entries';

const COMP_HOME_PILL_MATRIX: Record<CompetitionHomePill, Record<CompetitionRoleLens, Visibility>> = {
  dashboard: { C1: 'full', C2: 'full', C3: 'full',   C4: 'full' },
  calendar:  { C1: 'full', C2: 'full', C3: 'full',   C4: 'full' },
  grid:      { C1: 'full', C2: 'full', C3: 'full',   C4: 'full' },
  entries:   { C1: 'full', C2: 'full', C3: 'full',   C4: 'full' },
};

export function getCompetitionVisiblePills(role: CompetitionRoleLens): CompetitionHomePill[] {
  return (Object.keys(COMP_HOME_PILL_MATRIX) as CompetitionHomePill[])
    .filter((pill) => COMP_HOME_PILL_MATRIX[pill][role] !== 'hidden');
}
