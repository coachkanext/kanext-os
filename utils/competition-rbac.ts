/**
 * Competition Mode RBAC — 7-level role lens visibility matrix (CO1-CO11).
 * CO1:  Owner / Commissioner — sees everything including financials
 * CO2:  Race Director — everything except financials
 * CO3:  Team Principal — standings, Race Ops, own-team Technical, Entries
 * CO4:  Driver — standings, own schedule/results only
 * CO5:  Crew — standings, own team Technical
 * CO10: Fan — Hero, Next Race, Commerce, Standings only
 * CO11: Sponsor — same as Fan + health metrics
 */

// =============================================================================
// ROLE LEVELS
// =============================================================================

export type CompetitionRoleLens = 'CO1' | 'CO2' | 'CO3' | 'CO4' | 'CO5' | 'CO10' | 'CO11';

export type Visibility = 'full' | 'limited' | 'hidden';

export const COMPETITION_ROLE_LABELS: Record<CompetitionRoleLens, string> = {
  CO1: 'Owner / Commissioner',
  CO2: 'Race Director',
  CO3: 'Team Principal',
  CO4: 'Driver',
  CO5: 'Crew',
  CO10: 'Fan',
  CO11: 'Sponsor',
};

// =============================================================================
// SERIES SHEET TAB VISIBILITY
// =============================================================================

export type SeriesTab =
  | 'dashboard' | 'standings' | 'calendar' | 'events' | 'ops'
  | 'rules' | 'tech_compliance' | 'finance' | 'payment_rails'
  | 'venues' | 'sponsors' | 'media';

const SERIES_TAB_MATRIX: Record<SeriesTab, Record<CompetitionRoleLens, Visibility>> = {
  dashboard:       { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  standings:       { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  calendar:        { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  events:          { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  ops:             { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  rules:           { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  tech_compliance: { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'limited', CO10: 'hidden',  CO11: 'hidden' },
  finance:         { CO1: 'full', CO2: 'hidden', CO3: 'hidden', CO4: 'hidden', CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  payment_rails:   { CO1: 'full', CO2: 'hidden', CO3: 'hidden', CO4: 'hidden', CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  venues:          { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  sponsors:        { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'limited', CO11: 'limited' },
  media:           { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
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
  overview:           { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  roster:             { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  performance:        { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  compliance:         { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'limited', CO10: 'hidden',  CO11: 'hidden' },
  payouts:            { CO1: 'full', CO2: 'hidden', CO3: 'hidden', CO4: 'hidden', CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  media_obligations:  { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
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
  agenda:             { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  sessions:           { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  ops:                { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  live_control:       { CO1: 'full', CO2: 'full', CO3: 'hidden',  CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  results:            { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  incidents:          { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  payouts:            { CO1: 'full', CO2: 'hidden', CO3: 'hidden', CO4: 'hidden', CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  media_deliverables: { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
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
  header:               { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'full',    CO5: 'full',    CO10: 'full',    CO11: 'full' },
  today_next:           { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  live_status:          { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  format_snapshot:      { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  standings_bracket:    { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  schedule_snapshot:    { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  media_storylines:     { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  announcements:        { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  ops_taskboard:        { CO1: 'full', CO2: 'full', CO3: 'hidden',  CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  staff_contacts:       { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'limited', CO11: 'limited' },
  officials_compliance: { CO1: 'full', CO2: 'full', CO3: 'hidden',  CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  sponsors_revenue:     { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'limited', CO11: 'limited' },
  governance:           { CO1: 'full', CO2: 'hidden', CO3: 'hidden', CO4: 'hidden', CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  audit_trail:          { CO1: 'full', CO2: 'full', CO3: 'hidden',  CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
};

export function getDashboardModules(role: CompetitionRoleLens): { id: DashboardModule; visibility: Visibility }[] {
  return (Object.keys(DASHBOARD_MODULE_MATRIX) as DashboardModule[])
    .filter((mod) => DASHBOARD_MODULE_MATRIX[mod][role] !== 'hidden')
    .map((mod) => ({ id: mod, visibility: DASHBOARD_MODULE_MATRIX[mod][role] }));
}

// =============================================================================
// DASHBOARD SECTION VISIBILITY (Home dashboard sections)
// =============================================================================

export type CompDashboardSection =
  | 'video_hero' | 'next_race' | 'commerce_row'
  | 'driver_standings' | 'team_standings'
  | 'race_ops' | 'technical' | 'entries';

const COMP_DASHBOARD_SECTION_MATRIX: Record<CompDashboardSection, Record<CompetitionRoleLens, Visibility>> = {
  video_hero:        { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'full',    CO5: 'full',    CO10: 'full',    CO11: 'full' },
  next_race:         { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'full',    CO5: 'full',    CO10: 'full',    CO11: 'full' },
  commerce_row:      { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'full',    CO5: 'full',    CO10: 'full',    CO11: 'full' },
  driver_standings:  { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'full',    CO5: 'full',    CO10: 'full',    CO11: 'full' },
  team_standings:    { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'full',    CO5: 'full',    CO10: 'full',    CO11: 'full' },
  race_ops:          { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  technical:         { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'limited', CO10: 'hidden',  CO11: 'hidden' },
  entries:           { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
};

export function canSeeDashboardSection(section: CompDashboardSection, role: CompetitionRoleLens): boolean {
  return COMP_DASHBOARD_SECTION_MATRIX[section][role] !== 'hidden';
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
  CO1: [
    { id: 'live-ops', label: 'Open Live Ops', icon: 'antenna.radiowaves.left.and.right' },
    { id: 'publish-schedule', label: 'Publish Schedule', icon: 'calendar.badge.plus' },
    { id: 'update-bracket', label: 'Update Bracket/Standings', icon: 'chart.bar.fill' },
    { id: 'announcement', label: 'Post Announcement', icon: 'megaphone.fill' },
    { id: 'staff-invites', label: 'Staff / Invites', icon: 'person.badge.plus' },
    { id: 'finance', label: 'Finance Snapshot', icon: 'dollarsign.circle.fill' },
    { id: 'governance', label: 'Governance Docs', icon: 'doc.text.fill' },
  ],
  CO2: [
    { id: 'live-ops', label: 'Open Live Ops', icon: 'antenna.radiowaves.left.and.right' },
    { id: 'publish-schedule', label: 'Publish Schedule', icon: 'calendar.badge.plus' },
    { id: 'update-bracket', label: 'Update Bracket', icon: 'chart.bar.fill' },
    { id: 'announcement', label: 'Post Announcement', icon: 'megaphone.fill' },
    { id: 'staff', label: 'Staff / Assignments', icon: 'person.2.fill' },
    { id: 'incident-log', label: 'Incident Log', icon: 'exclamationmark.triangle.fill' },
  ],
  CO3: [
    { id: 'schedule', label: 'View Schedule', icon: 'calendar' },
    { id: 'standings', label: 'View Standings', icon: 'chart.bar.fill' },
    { id: 'team-tech', label: 'Team Technical', icon: 'wrench.and.screwdriver.fill' },
    { id: 'entries', label: 'Entry List', icon: 'person.crop.rectangle.stack.fill' },
  ],
  CO4: [
    { id: 'schedule', label: 'My Schedule', icon: 'calendar' },
    { id: 'standings', label: 'View Standings', icon: 'chart.bar.fill' },
    { id: 'results', label: 'My Results', icon: 'flag.checkered' },
  ],
  CO5: [
    { id: 'schedule', label: 'View Schedule', icon: 'calendar' },
    { id: 'standings', label: 'View Standings', icon: 'chart.bar.fill' },
    { id: 'technical', label: 'Team Technical', icon: 'wrench.and.screwdriver.fill' },
  ],
  CO10: [
    { id: 'bracket', label: 'View Bracket/Standings', icon: 'chart.bar.fill' },
    { id: 'schedule', label: 'View Schedule', icon: 'calendar' },
    { id: 'highlights', label: 'Watch Highlights', icon: 'play.rectangle.fill' },
  ],
  CO11: [
    { id: 'bracket', label: 'View Standings', icon: 'chart.bar.fill' },
    { id: 'schedule', label: 'View Schedule', icon: 'calendar' },
    { id: 'highlights', label: 'Watch Highlights', icon: 'play.rectangle.fill' },
    { id: 'metrics', label: 'Health Metrics', icon: 'chart.line.uptrend.xyaxis' },
  ],
};

export function getQuickActions(role: CompetitionRoleLens): QuickAction[] {
  return QUICK_ACTIONS[role] || QUICK_ACTIONS.CO10;
}

// =============================================================================
// MEMBERSHIP → LENS (direct membership_id mapping for ActiveView)
// =============================================================================

const COMPETITION_MEMBERSHIP_MAP: Record<string, CompetitionRoleLens> = {
  mem_comp_k1_owner_commish: 'CO1',
  mem_comp_k1_race_director: 'CO2',
  mem_comp_k1_team_principal: 'CO3',
  mem_comp_k1_driver: 'CO4',
  mem_comp_k1_crew: 'CO5',
  mem_comp_k1_fan: 'CO10',
  mem_comp_k1_sponsor: 'CO11',
};

export function getCompetitionRole(membershipId: string): CompetitionRoleLens {
  return COMPETITION_MEMBERSHIP_MAP[membershipId] ?? 'CO10';
}

export function mapRoleToCompetitionLens(role: string): CompetitionRoleLens {
  switch (role) {
    case 'league_admin':
    case 'commissioner':
    case 'owner':
      return 'CO1';
    case 'tournament_director':
    case 'event_director':
    case 'race_director':
      return 'CO2';
    case 'team_principal':
      return 'CO3';
    case 'driver':
      return 'CO4';
    case 'crew':
    case 'mechanic':
    case 'engineer':
      return 'CO5';
    case 'sponsor':
      return 'CO11';
    case 'fan':
    case 'viewer':
    case 'public':
    default:
      return 'CO10';
  }
}

// =============================================================================
// VISIBILITY HELPERS
// =============================================================================

export function canSeeModule(module: DashboardModule, role: CompetitionRoleLens): boolean {
  return DASHBOARD_MODULE_MATRIX[module][role] !== 'hidden';
}

export function isFullAccess(role: CompetitionRoleLens): boolean {
  return role === 'CO1' || role === 'CO2';
}

export function isStaffOrAbove(role: CompetitionRoleLens): boolean {
  return role === 'CO1' || role === 'CO2' || role === 'CO3';
}

// =============================================================================
// ORG TAB VISIBILITY (10 tabs in Competition Organization)
// =============================================================================

export type CompOrgTab =
  | 'series' | 'people' | 'rooms' | 'operations' | 'finance'
  | 'payment-rails' | 'compliance' | 'assets' | 'reports' | 'sponsors';

const COMP_ORG_TAB_MATRIX: Record<CompOrgTab, Record<CompetitionRoleLens, Visibility>> = {
  series:         { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  people:         { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  rooms:          { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  operations:     { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  finance:        { CO1: 'full', CO2: 'hidden', CO3: 'hidden', CO4: 'hidden', CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  'payment-rails':{ CO1: 'full', CO2: 'hidden', CO3: 'hidden', CO4: 'hidden', CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  compliance:     { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'limited', CO10: 'hidden',  CO11: 'hidden' },
  assets:         { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  reports:        { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  sponsors:       { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'limited', CO11: 'limited' },
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
  dashboard: { CO1: 'full', CO2: 'full', CO3: 'full', CO4: 'full', CO5: 'full', CO10: 'full', CO11: 'full' },
  calendar:  { CO1: 'full', CO2: 'full', CO3: 'full', CO4: 'full', CO5: 'full', CO10: 'full', CO11: 'full' },
  grid:      { CO1: 'full', CO2: 'full', CO3: 'full', CO4: 'full', CO5: 'full', CO10: 'full', CO11: 'full' },
  entries:   { CO1: 'full', CO2: 'full', CO3: 'full', CO4: 'full', CO5: 'full', CO10: 'full', CO11: 'full' },
};

export function getCompetitionVisiblePills(role: CompetitionRoleLens): CompetitionHomePill[] {
  return (Object.keys(COMP_HOME_PILL_MATRIX) as CompetitionHomePill[])
    .filter((pill) => COMP_HOME_PILL_MATRIX[pill][role] !== 'hidden');
}
