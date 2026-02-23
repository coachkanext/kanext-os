/**
 * Competition Mode RBAC — 12-level role lens visibility matrix (CO0-CO11).
 *
 * CO0:  System Owner                CO6:  Team Manager / Head Coach
 * CO1:  Commissioner / League Owner CO7:  Player / Athlete / Driver
 * CO2:  Deputy Commissioner / Ops   CO8:  Team Staff / Crew
 * CO3:  Event Director              CO9:  Media / Broadcaster
 * CO4:  Head Official / Ref Director CO10: Sponsor / Partner
 * CO5:  Official / Referee          CO11: Fan / Public
 */

import { isSystemOwner } from '@/utils/system-rbac';

// =============================================================================
// ROLE LEVELS
// =============================================================================

export type CompetitionRoleLens =
  | 'CO0' | 'CO1' | 'CO2' | 'CO3' | 'CO4' | 'CO5'
  | 'CO6' | 'CO7' | 'CO8' | 'CO9' | 'CO10' | 'CO11';

export type Visibility = 'full' | 'limited' | 'hidden';

export const COMPETITION_ROLE_LABELS: Record<CompetitionRoleLens, string> = {
  CO0: 'System Owner',
  CO1: 'Commissioner / League Owner',
  CO2: 'Deputy Commissioner / Ops',
  CO3: 'Event Director',
  CO4: 'Head Official / Ref Director',
  CO5: 'Official / Referee',
  CO6: 'Team Manager / Head Coach',
  CO7: 'Player / Athlete / Driver',
  CO8: 'Team Staff / Crew',
  CO9: 'Media / Broadcaster',
  CO10: 'Sponsor / Partner',
  CO11: 'Fan / Public',
};

// Helper to build a 12-column row concisely
type CV = Visibility;
function r(
  co0: CV, co1: CV, co2: CV, co3: CV, co4: CV, co5: CV,
  co6: CV, co7: CV, co8: CV, co9: CV, co10: CV, co11: CV,
): Record<CompetitionRoleLens, CV> {
  return {
    CO0: co0, CO1: co1, CO2: co2, CO3: co3, CO4: co4, CO5: co5,
    CO6: co6, CO7: co7, CO8: co8, CO9: co9, CO10: co10, CO11: co11,
  };
}

// =============================================================================
// SERIES SHEET TAB VISIBILITY
// =============================================================================

export type SeriesTab =
  | 'dashboard' | 'standings' | 'calendar' | 'events' | 'ops'
  | 'rules' | 'tech_compliance' | 'finance' | 'payment_rails'
  | 'venues' | 'sponsors' | 'media';

//                                                         CO0     CO1     CO2     CO3     CO4       CO5       CO6       CO7       CO8       CO9       CO10      CO11
const SERIES_TAB_MATRIX: Record<SeriesTab, Record<CompetitionRoleLens, CV>> = {
  dashboard:       r('full', 'full', 'full', 'full',    'full',    'limited', 'full',    'limited', 'limited', 'limited', 'limited', 'limited'),
  standings:       r('full', 'full', 'full', 'full',    'full',    'limited', 'full',    'limited', 'limited', 'limited', 'limited', 'limited'),
  calendar:        r('full', 'full', 'full', 'full',    'full',    'limited', 'full',    'limited', 'limited', 'limited', 'limited', 'limited'),
  events:          r('full', 'full', 'full', 'full',    'full',    'limited', 'full',    'limited', 'limited', 'limited', 'limited', 'limited'),
  ops:             r('full', 'full', 'full', 'full',    'limited', 'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  rules:           r('full', 'full', 'full', 'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'limited', 'limited'),
  tech_compliance: r('full', 'full', 'full', 'full',    'full',    'limited', 'limited', 'hidden',  'limited', 'hidden',  'hidden',  'hidden'),
  finance:         r('full', 'full', 'full', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  payment_rails:   r('full', 'full', 'full', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  venues:          r('full', 'full', 'full', 'full',    'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'limited'),
  sponsors:        r('full', 'full', 'full', 'full',    'hidden',  'hidden',  'limited', 'hidden',  'hidden',  'limited', 'limited', 'limited'),
  media:           r('full', 'full', 'full', 'full',    'limited', 'limited', 'limited', 'limited', 'limited', 'full',    'limited', 'limited'),
};

export function getSeriesSheetTabs(role: CompetitionRoleLens): { id: SeriesTab; label: string; visibility: Visibility }[] {
  const labels: Record<SeriesTab, string> = {
    dashboard: 'Dashboard', standings: 'Standings', calendar: 'Schedule',
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

//                                                           CO0     CO1     CO2     CO3     CO4       CO5       CO6       CO7       CO8       CO9       CO10      CO11
const ENTRANT_TAB_MATRIX: Record<EntrantTab, Record<CompetitionRoleLens, CV>> = {
  overview:           r('full', 'full', 'full', 'full',    'limited', 'limited', 'full',    'limited', 'limited', 'limited', 'limited', 'limited'),
  roster:             r('full', 'full', 'full', 'full',    'limited', 'limited', 'full',    'limited', 'limited', 'limited', 'limited', 'limited'),
  performance:        r('full', 'full', 'full', 'full',    'limited', 'limited', 'full',    'limited', 'limited', 'limited', 'limited', 'limited'),
  compliance:         r('full', 'full', 'full', 'full',    'full',    'limited', 'limited', 'hidden',  'limited', 'hidden',  'hidden',  'hidden'),
  payouts:            r('full', 'full', 'full', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  media_obligations:  r('full', 'full', 'full', 'full',    'hidden',  'hidden',  'limited', 'hidden',  'hidden',  'full',    'hidden',  'hidden'),
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

//                                                       CO0     CO1     CO2     CO3     CO4       CO5       CO6       CO7       CO8       CO9       CO10      CO11
const EVENT_TAB_MATRIX: Record<EventTab, Record<CompetitionRoleLens, CV>> = {
  agenda:             r('full', 'full', 'full', 'full',    'full',    'limited', 'full',    'limited', 'limited', 'limited', 'limited', 'limited'),
  sessions:           r('full', 'full', 'full', 'full',    'full',    'limited', 'full',    'limited', 'limited', 'limited', 'limited', 'limited'),
  ops:                r('full', 'full', 'full', 'full',    'limited', 'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  live_control:       r('full', 'full', 'full', 'full',    'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  results:            r('full', 'full', 'full', 'full',    'full',    'limited', 'full',    'limited', 'limited', 'limited', 'limited', 'limited'),
  incidents:          r('full', 'full', 'full', 'full',    'full',    'limited', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  payouts:            r('full', 'full', 'full', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  media_deliverables: r('full', 'full', 'full', 'full',    'limited', 'limited', 'limited', 'limited', 'limited', 'full',    'limited', 'limited'),
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

//                                                                  CO0     CO1     CO2     CO3     CO4       CO5       CO6       CO7       CO8       CO9       CO10      CO11
const DASHBOARD_MODULE_MATRIX: Record<DashboardModule, Record<CompetitionRoleLens, CV>> = {
  header:               r('full', 'full', 'full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  today_next:           r('full', 'full', 'full', 'full',    'full',    'limited', 'full',    'limited', 'limited', 'limited', 'limited', 'limited'),
  live_status:          r('full', 'full', 'full', 'full',    'full',    'limited', 'full',    'limited', 'limited', 'limited', 'limited', 'limited'),
  format_snapshot:      r('full', 'full', 'full', 'full',    'full',    'limited', 'full',    'limited', 'limited', 'limited', 'limited', 'limited'),
  standings_bracket:    r('full', 'full', 'full', 'full',    'full',    'limited', 'full',    'limited', 'limited', 'limited', 'limited', 'limited'),
  schedule_snapshot:    r('full', 'full', 'full', 'full',    'full',    'limited', 'full',    'limited', 'limited', 'limited', 'limited', 'limited'),
  media_storylines:     r('full', 'full', 'full', 'full',    'limited', 'hidden',  'full',    'limited', 'limited', 'full',    'limited', 'limited'),
  announcements:        r('full', 'full', 'full', 'full',    'full',    'limited', 'full',    'limited', 'limited', 'limited', 'limited', 'limited'),
  ops_taskboard:        r('full', 'full', 'full', 'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  staff_contacts:       r('full', 'full', 'full', 'full',    'limited', 'hidden',  'limited', 'hidden',  'hidden',  'limited', 'limited', 'limited'),
  officials_compliance: r('full', 'full', 'full', 'full',    'full',    'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  sponsors_revenue:     r('full', 'full', 'full', 'full',    'hidden',  'hidden',  'limited', 'hidden',  'hidden',  'limited', 'limited', 'limited'),
  governance:           r('full', 'full', 'full', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  audit_trail:          r('full', 'full', 'full', 'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
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

//                                                                    CO0     CO1     CO2     CO3     CO4       CO5       CO6       CO7       CO8       CO9       CO10      CO11
const COMP_DASHBOARD_SECTION_MATRIX: Record<CompDashboardSection, Record<CompetitionRoleLens, CV>> = {
  video_hero:        r('full', 'full', 'full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  next_race:         r('full', 'full', 'full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  commerce_row:      r('full', 'full', 'full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  driver_standings:  r('full', 'full', 'full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  team_standings:    r('full', 'full', 'full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  race_ops:          r('full', 'full', 'full', 'full',    'limited', 'hidden',  'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  technical:         r('full', 'full', 'full', 'full',    'limited', 'hidden',  'limited', 'hidden',  'limited', 'hidden',  'hidden',  'hidden'),
  entries:           r('full', 'full', 'full', 'full',    'hidden',  'hidden',  'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
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

const QUICK_ACTIONS: Partial<Record<CompetitionRoleLens, QuickAction[]>> = {
  CO0: [
    { id: 'system-overview', label: 'System Overview', icon: 'gearshape.fill' },
    { id: 'live-ops', label: 'Open Live Ops', icon: 'antenna.radiowaves.left.and.right' },
    { id: 'finance', label: 'Finance Snapshot', icon: 'dollarsign.circle.fill' },
    { id: 'audit-log', label: 'Audit Log', icon: 'doc.text.fill' },
  ],
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
    { id: 'event-schedule', label: 'Event Schedule', icon: 'calendar' },
    { id: 'live-ops', label: 'Live Ops', icon: 'antenna.radiowaves.left.and.right' },
    { id: 'incident-log', label: 'Incident Log', icon: 'exclamationmark.triangle.fill' },
    { id: 'media', label: 'Media Deliverables', icon: 'play.rectangle.fill' },
  ],
  CO4: [
    { id: 'officiating', label: 'Officiating', icon: 'flag.fill' },
    { id: 'rules', label: 'Rules', icon: 'doc.text.fill' },
    { id: 'schedule', label: 'Schedule', icon: 'calendar' },
    { id: 'compliance', label: 'Compliance', icon: 'checkmark.seal.fill' },
  ],
  CO5: [
    { id: 'schedule', label: 'My Schedule', icon: 'calendar' },
    { id: 'rules', label: 'Rules', icon: 'doc.text.fill' },
    { id: 'standings', label: 'View Standings', icon: 'chart.bar.fill' },
  ],
  CO6: [
    { id: 'schedule', label: 'View Schedule', icon: 'calendar' },
    { id: 'standings', label: 'View Standings', icon: 'chart.bar.fill' },
    { id: 'team-tech', label: 'Team Technical', icon: 'wrench.and.screwdriver.fill' },
    { id: 'entries', label: 'Entry List', icon: 'person.crop.rectangle.stack.fill' },
  ],
  CO7: [
    { id: 'schedule', label: 'My Schedule', icon: 'calendar' },
    { id: 'standings', label: 'View Standings', icon: 'chart.bar.fill' },
    { id: 'results', label: 'My Results', icon: 'flag.checkered' },
  ],
  CO8: [
    { id: 'schedule', label: 'View Schedule', icon: 'calendar' },
    { id: 'standings', label: 'View Standings', icon: 'chart.bar.fill' },
    { id: 'technical', label: 'Team Technical', icon: 'wrench.and.screwdriver.fill' },
  ],
  CO9: [
    { id: 'schedule', label: 'Event Schedule', icon: 'calendar' },
    { id: 'standings', label: 'View Standings', icon: 'chart.bar.fill' },
    { id: 'media', label: 'Media Center', icon: 'play.rectangle.fill' },
    { id: 'highlights', label: 'Watch Highlights', icon: 'play.circle.fill' },
  ],
  CO10: [
    { id: 'bracket', label: 'View Standings', icon: 'chart.bar.fill' },
    { id: 'schedule', label: 'View Schedule', icon: 'calendar' },
    { id: 'highlights', label: 'Watch Highlights', icon: 'play.rectangle.fill' },
    { id: 'metrics', label: 'Health Metrics', icon: 'chart.line.uptrend.xyaxis' },
  ],
  CO11: [
    { id: 'bracket', label: 'View Bracket/Standings', icon: 'chart.bar.fill' },
    { id: 'schedule', label: 'View Schedule', icon: 'calendar' },
    { id: 'highlights', label: 'Watch Highlights', icon: 'play.rectangle.fill' },
  ],
};

export function getQuickActions(role: CompetitionRoleLens): QuickAction[] {
  return QUICK_ACTIONS[role] || QUICK_ACTIONS.CO11 || [];
}

// =============================================================================
// MEMBERSHIP → LENS (direct membership_id mapping for ActiveView)
// =============================================================================

const COMPETITION_MEMBERSHIP_MAP: Record<string, CompetitionRoleLens> = {
  mem_comp_kx_deputy_commissioner: 'CO2',
  mem_comp_kx_event_director: 'CO3',
  mem_comp_kx_head_official: 'CO4',
  mem_comp_kx_official: 'CO5',
  mem_comp_kx_team_manager: 'CO6',
  mem_comp_kx_player: 'CO7',
  mem_comp_kx_team_staff: 'CO8',
  mem_comp_kx_media: 'CO9',
  mem_comp_kx_sponsor: 'CO10',
  mem_comp_kx_fan: 'CO11',
  // Legacy mappings
  mem_comp_kx_race_director: 'CO3',
  mem_comp_kx_team_principal: 'CO6',
  mem_comp_kx_driver: 'CO7',
  mem_comp_kx_crew: 'CO8',
};

export function getCompetitionRole(membershipId: string): CompetitionRoleLens {
  if (isSystemOwner(membershipId)) return 'CO0';
  return COMPETITION_MEMBERSHIP_MAP[membershipId] ?? 'CO11';
}

export function mapRoleToCompetitionLens(role: string): CompetitionRoleLens {
  switch (role) {
    case 'system_owner':
      return 'CO0';
    case 'league_admin':
    case 'commissioner':
    case 'owner':
      return 'CO1';
    case 'deputy_commissioner':
    case 'ops_director':
      return 'CO2';
    case 'tournament_director':
    case 'event_director':
    case 'race_director':
      return 'CO3';
    case 'head_official':
    case 'ref_director':
      return 'CO4';
    case 'official':
    case 'referee':
      return 'CO5';
    case 'team_principal':
    case 'team_manager':
    case 'head_coach':
      return 'CO6';
    case 'driver':
    case 'player':
    case 'athlete':
      return 'CO7';
    case 'crew':
    case 'mechanic':
    case 'engineer':
    case 'team_staff':
      return 'CO8';
    case 'media':
    case 'broadcaster':
      return 'CO9';
    case 'sponsor':
    case 'partner':
      return 'CO10';
    case 'fan':
    case 'viewer':
    case 'public':
    default:
      return 'CO11';
  }
}

// =============================================================================
// VISIBILITY HELPERS
// =============================================================================

export function canSeeModule(module: DashboardModule, role: CompetitionRoleLens): boolean {
  return DASHBOARD_MODULE_MATRIX[module][role] !== 'hidden';
}

export function isFullAccess(role: CompetitionRoleLens): boolean {
  return role === 'CO0' || role === 'CO1' || role === 'CO2';
}

export function isStaffOrAbove(role: CompetitionRoleLens): boolean {
  return role === 'CO0' || role === 'CO1' || role === 'CO2' || role === 'CO3' || role === 'CO6';
}

// =============================================================================
// ORG TAB VISIBILITY (10 tabs in Competition Organization)
// =============================================================================

export type CompOrgTab =
  | 'series' | 'people' | 'rooms' | 'operations' | 'finance'
  | 'payment-rails' | 'compliance' | 'assets' | 'reports' | 'sponsors';

//                                                          CO0     CO1     CO2     CO3     CO4       CO5       CO6       CO7       CO8       CO9       CO10      CO11
const COMP_ORG_TAB_MATRIX: Record<CompOrgTab, Record<CompetitionRoleLens, CV>> = {
  series:         r('full', 'full', 'full', 'full',    'full',    'limited', 'full',    'limited', 'limited', 'limited', 'limited', 'limited'),
  people:         r('full', 'full', 'full', 'full',    'limited', 'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  rooms:          r('full', 'full', 'full', 'full',    'limited', 'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  operations:     r('full', 'full', 'full', 'full',    'limited', 'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  finance:        r('full', 'full', 'full', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  'payment-rails':r('full', 'full', 'full', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  compliance:     r('full', 'full', 'full', 'full',    'full',    'limited', 'limited', 'hidden',  'limited', 'hidden',  'hidden',  'hidden'),
  assets:         r('full', 'full', 'full', 'full',    'hidden',  'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  reports:        r('full', 'full', 'full', 'full',    'hidden',  'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  sponsors:       r('full', 'full', 'full', 'full',    'hidden',  'hidden',  'limited', 'hidden',  'hidden',  'limited', 'limited', 'limited'),
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

//                                                                  CO0    CO1    CO2    CO3    CO4    CO5    CO6    CO7    CO8    CO9    CO10   CO11
const COMP_HOME_PILL_MATRIX: Record<CompetitionHomePill, Record<CompetitionRoleLens, CV>> = {
  dashboard: r('full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full'),
  calendar:  r('full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full'),
  grid:      r('full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full'),
  entries:   r('full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full'),
};

export function getCompetitionVisiblePills(role: CompetitionRoleLens): CompetitionHomePill[] {
  return (Object.keys(COMP_HOME_PILL_MATRIX) as CompetitionHomePill[])
    .filter((pill) => COMP_HOME_PILL_MATRIX[pill][role] !== 'hidden');
}
