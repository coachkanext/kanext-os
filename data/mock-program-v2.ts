/**
 * Mock data for Program v2 — 7-page Program section.
 * Overview, People, Teams, Seasons, Permissions, Audit Log.
 * (System page uses existing ProgramContextSection.)
 */

// =============================================================================
// TYPES
// =============================================================================

export type StaffRole = 'Head Coach' | 'Assistant Coach' | 'Director of Ops' | 'Athletic Trainer' | 'Strength Coach' | 'Video Coordinator' | 'Graduate Assistant' | 'Student Manager';
export type PermissionTier = 'admin' | 'coach' | 'staff' | 'viewer';
export type TeamLevel = 'varsity' | 'jv' | 'prep' | 'dev';
export type SeasonStatus = 'active' | 'completed' | 'archived';
export type AuditAction = 'roster_change' | 'system_update' | 'permission_change' | 'season_lock' | 'game_plan_edit' | 'recruitment_update' | 'setting_change';
export type ComplianceStatus = 'compliant' | 'warning' | 'violation';
export type ClassYear = 'FR' | 'SO' | 'JR' | 'SR' | 'GR';

export interface StaffMember {
  id: string;
  name: string;
  initials: string;
  role: StaffRole;
  teamAssignment: string;
  permissionTier: PermissionTier;
  email: string;
}

export interface AthleteMember {
  id: string;
  name: string;
  number: string;
  position: string;
  classYear: ClassYear;
  team: TeamLevel;
  status: 'active' | 'injured' | 'redshirt' | 'transfer';
}

export interface ProgramTeam {
  id: string;
  name: string;
  level: TeamLevel;
  rosterCount: number;
  record: string;
  headCoach: string;
  season: string;
  status: 'active' | 'offseason';
}

export interface ProgramSeason {
  id: string;
  label: string;
  year: string;
  status: SeasonStatus;
  record: string;
  conferenceFinish: string;
  teamCount: number;
  lockedDate?: string;
}

export interface PermissionRole {
  tier: PermissionTier;
  label: string;
  description: string;
  capabilities: string[];
  memberCount: number;
}

export interface AuditEntry {
  id: string;
  action: AuditAction;
  actor: string;
  description: string;
  timestamp: string;
  detail?: string;
}

export interface ProgramIdentity {
  name: string;
  initials: string;
  organization: string;
  level: string;
  conference: string;
  governingBody: string;
  location: string;
  founded: string;
  colors: string[];
}

export interface ProgramSnapshot {
  teamsCount: number;
  rosterTotal: number;
  staffCount: number;
  lastUpdated: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  route: string;
}

export interface TodayNext {
  nextEvent: string;
  nextEventTime: string;
  nextGame: string;
  nextGameDate: string;
  lastResult: string;
}

export interface ProgramHealth {
  availability: number;
  compliance: ComplianceStatus;
  rotationStability: number;
}

export interface PinnedIntel {
  id: string;
  type: 'sim' | 'game-plan' | 'dev-plan';
  title: string;
  date: string;
}

// =============================================================================
// PROGRAM IDENTITY
// =============================================================================

export const PROGRAM_IDENTITY: ProgramIdentity = {
  name: 'Florida Memorial University',
  initials: 'FMU',
  organization: 'Florida Memorial University Athletics',
  level: 'NAIA',
  conference: 'Sun Conference',
  governingBody: 'NAIA',
  location: 'Miami Gardens, FL',
  founded: '1879',
  colors: ['#1B4F8A', '#FFFFFF'],
};

// =============================================================================
// PROGRAM SNAPSHOT
// =============================================================================

export const PROGRAM_SNAPSHOT: ProgramSnapshot = {
  teamsCount: 2,
  rosterTotal: 15,
  staffCount: 8,
  lastUpdated: 'Feb 16, 2026',
};

// =============================================================================
// QUICK ACTIONS
// =============================================================================

export const QUICK_ACTIONS: QuickAction[] = [
  { id: 'qa-1', label: 'Recruiting', icon: 'person.badge.plus', route: '/coach/recruiting' },
  { id: 'qa-2', label: 'Roster', icon: 'person.3.fill', route: '/coach/roster' },
  { id: 'qa-3', label: 'Game Plan', icon: 'doc.text.fill', route: '' },
  { id: 'qa-4', label: 'Simulation', icon: 'wand.and.stars', route: '' },
  { id: 'qa-5', label: 'Development', icon: 'arrow.up.right', route: '' },
];

// =============================================================================
// TODAY / NEXT
// =============================================================================

export const TODAY_NEXT: TodayNext = {
  nextEvent: 'Full Practice',
  nextEventTime: 'Tomorrow, 2:00 PM',
  nextGame: 'vs Webber International',
  nextGameDate: 'Sat, Feb 21',
  lastResult: 'W 82-74 vs Thomas University',
};

// =============================================================================
// PROGRAM HEALTH
// =============================================================================

export const PROGRAM_HEALTH: ProgramHealth = {
  availability: 87,
  compliance: 'compliant',
  rotationStability: 78,
};

// =============================================================================
// PINNED INTELLIGENCE
// =============================================================================

export const PINNED_INTEL: PinnedIntel[] = [
  { id: 'pi-1', type: 'sim', title: 'FMU vs Webber — 64% Win Prob', date: 'Feb 18' },
  { id: 'pi-2', type: 'game-plan', title: 'Webber Game Plan — Motion Offense Focus', date: 'Feb 17' },
  { id: 'pi-3', type: 'dev-plan', title: 'Week 22 Development Plan', date: 'Feb 17' },
];

// =============================================================================
// STAFF
// =============================================================================

export const STAFF_MEMBERS: StaffMember[] = [
  { id: 'staff-1', name: 'Sammy Kalejaiye', initials: 'SK', role: 'Head Coach', teamAssignment: 'Varsity', permissionTier: 'admin', email: 'skalejaiye@fmu.edu' },
  { id: 'staff-2', name: 'Marcus Johnson', initials: 'MJ', role: 'Assistant Coach', teamAssignment: 'Varsity', permissionTier: 'coach', email: 'mjohnson@fmu.edu' },
  { id: 'staff-3', name: 'David Chen', initials: 'DC', role: 'Assistant Coach', teamAssignment: 'Varsity', permissionTier: 'coach', email: 'dchen@fmu.edu' },
  { id: 'staff-4', name: 'Sarah Thompson', initials: 'ST', role: 'Director of Ops', teamAssignment: 'All Teams', permissionTier: 'staff', email: 'sthompson@fmu.edu' },
  { id: 'staff-5', name: 'James Rivera', initials: 'JR', role: 'Athletic Trainer', teamAssignment: 'All Teams', permissionTier: 'staff', email: 'jrivera@fmu.edu' },
  { id: 'staff-6', name: 'Michael Park', initials: 'MP', role: 'Strength Coach', teamAssignment: 'All Teams', permissionTier: 'staff', email: 'mpark@fmu.edu' },
  { id: 'staff-7', name: 'Tyler Brooks', initials: 'TB', role: 'Video Coordinator', teamAssignment: 'Varsity', permissionTier: 'staff', email: 'tbrooks@fmu.edu' },
  { id: 'staff-8', name: 'Aisha Williams', initials: 'AW', role: 'Graduate Assistant', teamAssignment: 'JV', permissionTier: 'coach', email: 'awilliams@fmu.edu' },
];

// =============================================================================
// ATHLETES
// =============================================================================

export const ATHLETE_MEMBERS: AthleteMember[] = [
  { id: '1', name: 'Brandon Williams', number: '1', position: 'PG', classYear: 'SR', team: 'varsity', status: 'active' },
  { id: '2', name: 'Chris Plantey', number: '2', position: 'CG', classYear: 'JR', team: 'varsity', status: 'active' },
  { id: '3', name: 'Paul Diomande', number: '3', position: 'F', classYear: 'SO', team: 'varsity', status: 'active' },
  { id: '4', name: 'Nathan Chtelan', number: '4', position: 'W', classYear: 'JR', team: 'varsity', status: 'active' },
  { id: '5', name: 'Laolu Kalejaiye', number: '5', position: 'B', classYear: 'SO', team: 'varsity', status: 'active' },
  { id: '6', name: 'David Blake', number: '6', position: 'PG', classYear: 'SR', team: 'varsity', status: 'active' },
  { id: '7', name: 'Marcus Collins', number: '7', position: 'CG', classYear: 'FR', team: 'varsity', status: 'active' },
  { id: '8', name: 'Adrian Hernandez', number: '8', position: 'W', classYear: 'JR', team: 'varsity', status: 'active' },
  { id: '9', name: 'Jaylen Moore', number: '9', position: 'F', classYear: 'SO', team: 'varsity', status: 'active' },
  { id: '10', name: 'Jalen Washington', number: '10', position: 'B', classYear: 'FR', team: 'varsity', status: 'active' },
  { id: '11', name: 'Trevor Hayes', number: '11', position: 'PG', classYear: 'FR', team: 'jv', status: 'active' },
  { id: '12', name: 'Devon Mitchell', number: '12', position: 'CG', classYear: 'FR', team: 'jv', status: 'active' },
  { id: '13', name: 'Isaiah Green', number: '13', position: 'W', classYear: 'FR', team: 'jv', status: 'active' },
  { id: '14', name: 'Caleb Torres', number: '14', position: 'F', classYear: 'FR', team: 'jv', status: 'active' },
  { id: '15', name: 'Elijah Brown', number: '15', position: 'B', classYear: 'FR', team: 'jv', status: 'active' },
];

// =============================================================================
// TEAMS
// =============================================================================

export const PROGRAM_TEAMS: ProgramTeam[] = [
  { id: 'team-varsity', name: 'Varsity', level: 'varsity', rosterCount: 10, record: '18-8', headCoach: 'Sammy Kalejaiye', season: '2025-26', status: 'active' },
  { id: 'team-jv', name: 'JV', level: 'jv', rosterCount: 5, record: '12-4', headCoach: 'Aisha Williams', season: '2025-26', status: 'active' },
];

// =============================================================================
// SEASONS
// =============================================================================

export const PROGRAM_SEASONS: ProgramSeason[] = [
  { id: 'season-2526', label: '2025-26', year: '2025-26', status: 'active', record: '18-8', conferenceFinish: 'TBD', teamCount: 2 },
  { id: 'season-2425', label: '2024-25', year: '2024-25', status: 'completed', record: '14-14', conferenceFinish: '5th', teamCount: 1, lockedDate: 'Apr 1, 2025' },
  { id: 'season-2324', label: '2023-24', year: '2023-24', status: 'archived', record: '10-18', conferenceFinish: '8th', teamCount: 1, lockedDate: 'Apr 1, 2024' },
];

// =============================================================================
// PERMISSIONS
// =============================================================================

export const PERMISSION_ROLES: PermissionRole[] = [
  { tier: 'admin', label: 'Admin', description: 'Full access to all program features, settings, and data.', capabilities: ['All features', 'User management', 'Season lock/unlock', 'Data export', 'System config'], memberCount: 1 },
  { tier: 'coach', label: 'Coach', description: 'Access to coaching tools, game plans, rosters, and development.', capabilities: ['Game plans', 'Roster management', 'Development plans', 'Simulation', 'Film access'], memberCount: 3 },
  { tier: 'staff', label: 'Staff', description: 'Access to operations, scheduling, and support functions.', capabilities: ['Schedule management', 'Injury reports', 'Travel logistics', 'Video upload', 'Equipment'], memberCount: 4 },
  { tier: 'viewer', label: 'Viewer', description: 'Read-only access to public program information.', capabilities: ['View roster', 'View schedule', 'View standings', 'View news'], memberCount: 0 },
];

// =============================================================================
// AUDIT LOG
// =============================================================================

export const AUDIT_LOG: AuditEntry[] = [
  { id: 'aud-1', action: 'game_plan_edit', actor: 'Sammy Kalejaiye', description: 'Updated Webber game plan — offensive adjustments', timestamp: 'Feb 16, 2026 4:32 PM' },
  { id: 'aud-2', action: 'roster_change', actor: 'Marcus Johnson', description: 'Updated Jalen Washington status: rotation eligible', timestamp: 'Feb 15, 2026 3:15 PM' },
  { id: 'aud-3', action: 'system_update', actor: 'Sammy Kalejaiye', description: 'Changed OSIE to Motion Offense (was Flex Cuts)', timestamp: 'Feb 14, 2026 11:22 AM' },
  { id: 'aud-4', action: 'recruitment_update', actor: 'David Chen', description: 'Added 3 new prospects to recruiting board', timestamp: 'Feb 13, 2026 9:45 AM' },
  { id: 'aud-5', action: 'setting_change', actor: 'Sammy Kalejaiye', description: 'Updated cluster weights — Shooting priority increased', timestamp: 'Feb 12, 2026 2:10 PM' },
  { id: 'aud-6', action: 'permission_change', actor: 'Sammy Kalejaiye', description: 'Granted coach permissions to Aisha Williams', timestamp: 'Feb 10, 2026 10:30 AM' },
  { id: 'aud-7', action: 'season_lock', actor: 'System', description: '2024-25 season data locked automatically', timestamp: 'Apr 1, 2025 12:00 AM' },
  { id: 'aud-8', action: 'roster_change', actor: 'Marcus Johnson', description: 'Added Trevor Hayes, Devon Mitchell to JV roster', timestamp: 'Feb 8, 2026 1:45 PM' },
  { id: 'aud-9', action: 'game_plan_edit', actor: 'David Chen', description: 'Created Thomas University scouting report', timestamp: 'Feb 7, 2026 4:00 PM' },
  { id: 'aud-10', action: 'system_update', actor: 'Sammy Kalejaiye', description: 'Updated DSIE to Switching Man (was Pack Line)', timestamp: 'Feb 5, 2026 3:20 PM' },
];

// =============================================================================
// AUDIT ACTION METADATA
// =============================================================================

export const AUDIT_ACTION_META: Record<AuditAction, { label: string; icon: string; color: string }> = {
  roster_change: { label: 'Roster', icon: 'person.3.fill', color: '#6AA9FF' },
  system_update: { label: 'System', icon: 'gearshape.fill', color: '#F59E0B' },
  permission_change: { label: 'Permissions', icon: 'lock.fill', color: '#7A5CFF' },
  season_lock: { label: 'Season', icon: 'lock.shield.fill', color: '#22C55E' },
  game_plan_edit: { label: 'Game Plan', icon: 'doc.text.fill', color: '#FFFFFF' },
  recruitment_update: { label: 'Recruiting', icon: 'person.badge.plus', color: '#06B6D4' },
  setting_change: { label: 'Settings', icon: 'slider.horizontal.3', color: '#8F8F8F' },
};

// =============================================================================
// ROSTER AVAILABILITY (for Program tab snapshot)
// =============================================================================

export interface RosterAvailability {
  available: number;
  injured: number;
  out: number;
  redshirt: number;
}

export const ROSTER_AVAILABILITY: RosterAvailability = {
  available: 13,
  injured: 1,
  out: 0,
  redshirt: 1,
};

// =============================================================================
// SYSTEMS & IDENTITY (OSIE / DSIE)
// =============================================================================

export interface ProgramSystems {
  offenseSystem: string;
  defenseSystem: string;
  offenseProvisional: boolean;
  defenseProvisional: boolean;
  notes: string;
}

export const PROGRAM_SYSTEMS: ProgramSystems = {
  offenseSystem: 'Motion Offense',
  defenseSystem: 'Switching Man',
  offenseProvisional: false,
  defenseProvisional: false,
  notes: 'Motion offense installed Week 18. Still refining secondary actions against zone looks.',
};

// =============================================================================
// UPCOMING SCHEDULE (next 3 games)
// =============================================================================

export interface UpcomingGame {
  id: string;
  opponent: string;
  date: string;
  location: 'Home' | 'Away' | 'Neutral';
  time: string;
}

export const UPCOMING_GAMES: UpcomingGame[] = [
  { id: 'ug-1', opponent: 'Webber International', date: 'Sat, Feb 21', location: 'Home', time: '7:00 PM' },
  { id: 'ug-2', opponent: 'Ave Maria', date: 'Wed, Feb 25', location: 'Away', time: '6:00 PM' },
  { id: 'ug-3', opponent: 'Warner', date: 'Sat, Feb 28', location: 'Home', time: '4:00 PM' },
];

// =============================================================================
// OPERATIONS PULSE
// =============================================================================

export interface OperationsPulse {
  openTasksP0: number;
  openTasksP1: number;
  nextTrip: string | null;
  facilityIssues: number;
}

export const OPS_PULSE: OperationsPulse = {
  openTasksP0: 1,
  openTasksP1: 4,
  nextTrip: 'Ave Maria — Feb 25 (bus departs 11 AM)',
  facilityIssues: 0,
};

// =============================================================================
// FINANCE PULSE
// =============================================================================

export interface FinancePulse {
  budgetTotal: number;
  actualSpend: number;
  pendingApprovals: number;
  payablesDueSoon: number;
}

export const FINANCE_PULSE: FinancePulse = {
  budgetTotal: 85000,
  actualSpend: 62400,
  pendingApprovals: 2,
  payablesDueSoon: 3,
};

// =============================================================================
// PAYMENT RAILS PULSE
// =============================================================================

export interface PaymentRailsPulse {
  recentCollections: number;
  pendingPayouts: number;
  settlementReady: boolean;
}

export const PAYMENT_RAILS_PULSE: PaymentRailsPulse = {
  recentCollections: 4200,
  pendingPayouts: 1,
  settlementReady: true,
};

// =============================================================================
// COMPLIANCE PULSE
// =============================================================================

export interface CompliancePulse {
  dueSoon: number;
  overdue: number;
  trainingCompletion: number;
  openIncidents: number;
}

export const COMPLIANCE_PULSE: CompliancePulse = {
  dueSoon: 2,
  overdue: 0,
  trainingCompletion: 94,
  openIncidents: 0,
};

// =============================================================================
// ROOMS SHORTCUTS
// =============================================================================

export interface ProgramRoomShortcut {
  id: string;
  title: string;
  icon: string;
  unread: number;
}

export const PROGRAM_ROOMS: ProgramRoomShortcut[] = [
  { id: 'pr-1', title: 'Program Staff', icon: 'person.3.fill', unread: 3 },
  { id: 'pr-2', title: 'Recruiting', icon: 'person.badge.plus', unread: 1 },
  { id: 'pr-3', title: 'Operations', icon: 'gearshape.fill', unread: 0 },
  { id: 'pr-4', title: 'Team Room', icon: 'sportscourt.fill', unread: 5 },
];

// =============================================================================
// PROGRAM SETTINGS (permissioned)
// =============================================================================

export interface ProgramSetting {
  id: string;
  section: string;
  label: string;
  description: string;
  type: 'toggle' | 'action';
  enabled?: boolean;
}

export const PROGRAM_SETTINGS: ProgramSetting[] = [
  { id: 'ps-1', section: 'Rooms', label: 'Enable Team Room', description: 'Athletes can access the team room', type: 'toggle', enabled: true },
  { id: 'ps-2', section: 'Rooms', label: 'Auto-create Game Rooms', description: 'Create a room for each upcoming game', type: 'toggle', enabled: true },
  { id: 'ps-3', section: 'Rooms', label: 'Enable Player-to-Player Rooms', description: 'Allow athletes to create direct message rooms', type: 'toggle', enabled: false },
  { id: 'ps-4', section: 'Season', label: 'Lock Season Data', description: 'Prevent edits to completed season records', type: 'action' },
  { id: 'ps-5', section: 'Season', label: 'Archive Season', description: 'Archive the current season and start fresh', type: 'action' },
  { id: 'ps-6', section: 'Program', label: 'Pause Program', description: 'Temporarily disable program operations', type: 'action' },
];
