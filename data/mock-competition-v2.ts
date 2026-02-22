/**
 * Mock Competition V2 Data — Complete data layer for all 5 v2 Competition tabs.
 * Standings | Teams | Race Week Ops | Rules | Tech & Compliance
 */

// =============================================================================
// STANDINGS TYPES
// =============================================================================

export type StandingsView = 'drivers' | 'teams' | 'constructors' | 'crew';

export interface TeamStanding {
  teamId: string;
  position: number;
  teamName: string;
  abbreviation: string;
  teamColor: string;
  points: number;
  wins: number;
  podiums: number;
  reliability: number;
  gap: string;
}

export interface CrewStanding {
  position: number;
  name: string;
  role: string;
  teamName: string;
  teamColor: string;
  points: number;
}

export interface PointsSwingScenario {
  id: string;
  title: string;
  description: string;
  probability: 'high' | 'medium' | 'low';
  impacts: {
    driverName: string;
    teamColor: string;
    currentPos: number;
    projectedPos: number;
    delta: number;
  }[];
}

export interface PenaltyLedgerEntry {
  id: string;
  date: string;
  driverName: string;
  teamColor: string;
  infraction: string;
  penalty: string;
  race: string;
  pointsDeducted: number;
}

export interface LeverageBattle {
  id: string;
  title: string;
  driver1: { name: string; team: string; color: string; points: number };
  driver2: { name: string; team: string; color: string; points: number };
  gap: string;
  racesRemaining: number;
  clinchScenario: string;
}

// =============================================================================
// TEAMS TYPES
// =============================================================================

export interface TeamV2 {
  id: string;
  name: string;
  abbreviation: string;
  primaryColor: string;
  owner: string;
  homeTrack: string;
  wins: number;
  points: number;
  founded: number;
  budget: string;
  championships: number;
  principal: string;
  headquarters: string;
}

export interface TeamPerson {
  id: string;
  name: string;
  initials: string;
  role: string;
  department: string;
  since: string;
}

export interface TeamCar {
  id: string;
  carNumber: string;
  driverName: string;
  liveryColor: string;
  chassis: string;
  engine: string;
  weight: string;
  topSpeed: string;
}

export interface TeamComplianceItem {
  id: string;
  item: string;
  status: 'compliant' | 'warning' | 'non_compliant' | 'pending';
  lastChecked: string;
}

// =============================================================================
// RACE WEEK OPS TYPES
// =============================================================================

export interface RaceWeekSession {
  id: string;
  name: string;
  type: 'practice' | 'qualifying' | 'race' | 'setup' | 'inspection';
  status: 'completed' | 'live' | 'upcoming' | 'delayed';
  startTime: string;
  endTime: string;
  track: string;
  weather?: string;
}

export interface TeamReadiness {
  teamId: string;
  teamName: string;
  abbreviation: string;
  teamColor: string;
  overallReady: boolean;
  techInspection: 'pass' | 'fail' | 'pending';
  safetyCheck: 'pass' | 'fail' | 'pending';
  credentialing: 'pass' | 'fail' | 'pending';
}

export interface RaceIncident {
  id: string;
  lap: number;
  time: string;
  severity: 'minor' | 'moderate' | 'major';
  status: 'under_review' | 'decided' | 'no_action';
  description: string;
  driversInvolved: string[];
  decision: string;
}

// =============================================================================
// RULES TYPES
// =============================================================================

export interface RuleArticle {
  id: string;
  section: string;
  articleNumber: string;
  title: string;
  summary: string;
  category: 'race' | 'technical' | 'safety' | 'sporting';
}

export interface RulingCase {
  id: string;
  title: string;
  date: string;
  race: string;
  parties: string[];
  ruling: string;
  penalty: string;
  precedent: boolean;
}

export interface PenaltyCatalogEntry {
  id: string;
  infraction: string;
  minPenalty: string;
  maxPenalty: string;
  pointsRange: string;
  examples: string;
}

export interface PointsTableEntry {
  position: number;
  points: number;
  bonus?: string;
}

// =============================================================================
// COMPLIANCE TYPES
// =============================================================================

export type ComplianceWorkspace = 'eligibility' | 'homologation' | 'cost_cap' | 'safety_cert' | 'sponsorship' | 'audit_log';

export interface ComplianceEntity {
  id: string;
  workspace: ComplianceWorkspace;
  name: string;
  type: string;
  status: 'approved' | 'pending' | 'flagged' | 'expired';
  teamName: string;
  teamColor: string;
  lastInspected: string;
  expiresAt: string;
  notes?: string;
}

export interface ComplianceAuditEntry {
  id: string;
  workspace: ComplianceWorkspace;
  action: string;
  entity: string;
  actor: string;
  timestamp: string;
  details: string;
}

export interface ComplianceSummary {
  workspace: ComplianceWorkspace;
  label: string;
  icon: string;
  total: number;
  approved: number;
  pending: number;
  flagged: number;
}

// =============================================================================
// STANDINGS DATA — Team Championship
// =============================================================================

export const TEAM_STANDINGS: TeamStanding[] = [
  { teamId: 't-1', position: 1, teamName: 'Apex Racing', abbreviation: 'APX', teamColor: '#EF4444', points: 312, wins: 4, podiums: 9, reliability: 96, gap: 'Leader' },
  { teamId: 't-2', position: 2, teamName: 'Velocity Works', abbreviation: 'VEL', teamColor: '#3B82F6', points: 287, wins: 3, podiums: 8, reliability: 92, gap: '−25' },
  { teamId: 't-3', position: 3, teamName: 'Phoenix Motorsport', abbreviation: 'PHX', teamColor: '#F59E0B', points: 256, wins: 2, podiums: 7, reliability: 88, gap: '−56' },
  { teamId: 't-4', position: 4, teamName: 'Zenith Racing', abbreviation: 'ZEN', teamColor: '#22C55E', points: 241, wins: 2, podiums: 6, reliability: 94, gap: '−71' },
  { teamId: 't-5', position: 5, teamName: 'Shadow GP', abbreviation: 'SHD', teamColor: '#7C3AED', points: 198, wins: 1, podiums: 4, reliability: 85, gap: '−114' },
  { teamId: 't-6', position: 6, teamName: 'Titan Racing', abbreviation: 'TTN', teamColor: '#EC4899', points: 167, wins: 0, podiums: 3, reliability: 90, gap: '−145' },
  { teamId: 't-7', position: 7, teamName: 'Nova Speed', abbreviation: 'NVA', teamColor: '#06B6D4', points: 145, wins: 0, podiums: 1, reliability: 82, gap: '−167' },
  { teamId: 't-8', position: 8, teamName: 'Iron Circuit', abbreviation: 'IRC', teamColor: '#6B7280', points: 132, wins: 0, podiums: 1, reliability: 78, gap: '−180' },
];

// =============================================================================
// STANDINGS DATA — Crew Championship
// =============================================================================

export const CREW_STANDINGS: CrewStanding[] = [
  { position: 1, name: 'Mike Chen', role: 'Lead Engineer', teamName: 'Apex Racing', teamColor: '#EF4444', points: 142 },
  { position: 2, name: 'Sarah Mills', role: 'Lead Engineer', teamName: 'Velocity Works', teamColor: '#3B82F6', points: 128 },
  { position: 3, name: 'Raj Patel', role: 'Race Strategist', teamName: 'Phoenix Motorsport', teamColor: '#F59E0B', points: 115 },
  { position: 4, name: 'Elena Rossi', role: 'Race Strategist', teamName: 'Zenith Racing', teamColor: '#22C55E', points: 108 },
  { position: 5, name: 'Tom Harris', role: 'Lead Mechanic', teamName: 'Apex Racing', teamColor: '#EF4444', points: 96 },
  { position: 6, name: 'Ana Gutierrez', role: 'Pit Crew Chief', teamName: 'Shadow GP', teamColor: '#7C3AED', points: 89 },
  { position: 7, name: 'James Wright', role: 'Lead Engineer', teamName: 'Titan Racing', teamColor: '#EC4899', points: 76 },
  { position: 8, name: 'Yuki Sato', role: 'Data Analyst', teamName: 'Nova Speed', teamColor: '#06B6D4', points: 64 },
];

// =============================================================================
// STANDINGS DATA — Points Swing Simulator
// =============================================================================

export const POINTS_SWING_SCENARIOS: PointsSwingScenario[] = [
  {
    id: 'ps-1',
    title: 'Vasquez wins Portland + Laguna Seca',
    description: 'If Leo Vasquez wins the final 3 races and Nadia Patel finishes outside the top 5, Vasquez clinches the title at the Lonestar GP.',
    probability: 'medium',
    impacts: [
      { driverName: 'Leo Vasquez', teamColor: '#EF4444', currentPos: 1, projectedPos: 1, delta: 0 },
      { driverName: 'Nadia Patel', teamColor: '#3B82F6', currentPos: 2, projectedPos: 3, delta: -1 },
      { driverName: 'Yuki Tanaka', teamColor: '#F59E0B', currentPos: 3, projectedPos: 2, delta: 1 },
      { driverName: 'Sofia Torres', teamColor: '#22C55E', currentPos: 4, projectedPos: 4, delta: 0 },
    ],
  },
  {
    id: 'ps-2',
    title: 'Patel wins + Vasquez DNF',
    description: 'A mechanical failure for Vasquez at Portland coupled with a Patel victory would narrow the championship lead to just 3 points.',
    probability: 'low',
    impacts: [
      { driverName: 'Nadia Patel', teamColor: '#3B82F6', currentPos: 2, projectedPos: 1, delta: 1 },
      { driverName: 'Leo Vasquez', teamColor: '#EF4444', currentPos: 1, projectedPos: 2, delta: -1 },
      { driverName: 'Yuki Tanaka', teamColor: '#F59E0B', currentPos: 3, projectedPos: 3, delta: 0 },
      { driverName: 'Jake Morrison', teamColor: '#EF4444', currentPos: 5, projectedPos: 4, delta: 1 },
    ],
  },
  {
    id: 'ps-3',
    title: 'Status quo — top 4 finish in position',
    description: 'If the top 4 drivers each finish in their current championship position at the remaining races, Vasquez takes the title by 22+ points.',
    probability: 'high',
    impacts: [
      { driverName: 'Leo Vasquez', teamColor: '#EF4444', currentPos: 1, projectedPos: 1, delta: 0 },
      { driverName: 'Nadia Patel', teamColor: '#3B82F6', currentPos: 2, projectedPos: 2, delta: 0 },
      { driverName: 'Yuki Tanaka', teamColor: '#F59E0B', currentPos: 3, projectedPos: 3, delta: 0 },
      { driverName: 'Sofia Torres', teamColor: '#22C55E', currentPos: 4, projectedPos: 4, delta: 0 },
    ],
  },
];

// =============================================================================
// STANDINGS DATA — Penalty Ledger
// =============================================================================

export const PENALTY_LEDGER: PenaltyLedgerEntry[] = [
  { id: 'pl-1', date: 'Jul 18', driverName: 'Carlos Mendez', teamColor: '#7C3AED', infraction: 'Causing a collision — Turn 8 contact with Fletcher', penalty: '5-second time penalty', race: 'Mountain Circuit', pointsDeducted: 2 },
  { id: 'pl-2', date: 'Jul 4', driverName: 'Jake Morrison', teamColor: '#EF4444', infraction: 'Track limits abuse — 5 violations in qualifying', penalty: 'Qualifying lap deleted, grid penalty -2', race: 'Independence GP', pointsDeducted: 0 },
  { id: 'pl-3', date: 'Jun 28', driverName: 'Grace Kim', teamColor: '#7C3AED', infraction: 'Unsafe release from pit box', penalty: '10-second stop-go penalty', race: 'Summer Showdown', pointsDeducted: 1 },
  { id: 'pl-4', date: 'Jun 14', driverName: 'Ryan Fletcher', teamColor: '#EC4899', infraction: 'Ignoring blue flags — 4 marshalling posts', penalty: '5-second time penalty', race: 'Virginia Classic', pointsDeducted: 1 },
  { id: 'pl-5', date: 'May 31', driverName: 'Tyler Brooks', teamColor: '#6B7280', infraction: 'Pit lane speeding — 48 km/h (limit 40)', penalty: 'Drive-through penalty', race: 'Sebring Sprint', pointsDeducted: 0 },
  { id: 'pl-6', date: 'May 17', driverName: 'Yuki Tanaka', teamColor: '#F59E0B', infraction: 'Jump start — transponder confirmed early movement', penalty: 'Drive-through penalty', race: 'Barber Invitational', pointsDeducted: 1 },
];

// =============================================================================
// STANDINGS DATA — Leverage Battles
// =============================================================================

export const LEVERAGE_BATTLES: LeverageBattle[] = [
  {
    id: 'lb-1',
    title: 'Championship Battle',
    driver1: { name: 'Leo Vasquez', team: 'Apex Racing', color: '#EF4444', points: 178 },
    driver2: { name: 'Nadia Patel', team: 'Velocity Works', color: '#3B82F6', points: 156 },
    gap: '22 pts',
    racesRemaining: 3,
    clinchScenario: 'Vasquez clinches with a win + Patel P5 or worse at Portland',
  },
  {
    id: 'lb-2',
    title: 'Fight for P3',
    driver1: { name: 'Yuki Tanaka', team: 'Phoenix Motorsport', color: '#F59E0B', points: 148 },
    driver2: { name: 'Sofia Torres', team: 'Zenith Racing', color: '#22C55E', points: 142 },
    gap: '6 pts',
    racesRemaining: 3,
    clinchScenario: 'Either driver can clinch P3 with 2 consecutive podiums + rival outside top 6',
  },
  {
    id: 'lb-3',
    title: 'Midfield Battle',
    driver1: { name: 'Jake Morrison', team: 'Apex Racing', color: '#EF4444', points: 134 },
    driver2: { name: 'Marcus Bell', team: 'Velocity Works', color: '#3B82F6', points: 131 },
    gap: '3 pts',
    racesRemaining: 3,
    clinchScenario: 'Razor-thin margin — any single position swap changes the order',
  },
];

// =============================================================================
// TEAMS DATA — Team Profiles
// =============================================================================

export const TEAMS_V2: TeamV2[] = [
  { id: 't-1', name: 'Apex Racing', abbreviation: 'APX', primaryColor: '#EF4444', owner: 'Marcus Kane', homeTrack: 'COTA', wins: 4, points: 312, founded: 2019, budget: '$2.4M', championships: 2, principal: 'Marcus Kane', headquarters: 'Austin, TX' },
  { id: 't-2', name: 'Velocity Works', abbreviation: 'VEL', primaryColor: '#3B82F6', owner: 'Lisa Grant', homeTrack: 'Laguna Seca', wins: 3, points: 287, founded: 2020, budget: '$2.1M', championships: 1, principal: 'Lisa Grant', headquarters: 'Monterey, CA' },
  { id: 't-3', name: 'Phoenix Motorsport', abbreviation: 'PHX', primaryColor: '#F59E0B', owner: 'David Okafor', homeTrack: 'Road Atlanta', wins: 2, points: 256, founded: 2018, budget: '$1.9M', championships: 1, principal: 'David Okafor', headquarters: 'Nashville, TN' },
  { id: 't-4', name: 'Zenith Racing', abbreviation: 'ZEN', primaryColor: '#22C55E', owner: 'Anna Petrov', homeTrack: 'Watkins Glen', wins: 2, points: 241, founded: 2021, budget: '$1.8M', championships: 0, principal: 'Anna Petrov', headquarters: 'Ithaca, NY' },
  { id: 't-5', name: 'Shadow GP', abbreviation: 'SHD', primaryColor: '#7C3AED', owner: 'James Wright', homeTrack: 'Barber Motorsports', wins: 1, points: 198, founded: 2020, budget: '$1.6M', championships: 0, principal: 'James Wright', headquarters: 'Birmingham, AL' },
  { id: 't-6', name: 'Titan Racing', abbreviation: 'TTN', primaryColor: '#EC4899', owner: 'Lisa Rodriguez', homeTrack: 'Mid-Ohio', wins: 0, points: 167, founded: 2022, budget: '$1.4M', championships: 0, principal: 'Lisa Rodriguez', headquarters: 'Columbus, OH' },
  { id: 't-7', name: 'Nova Speed', abbreviation: 'NVA', primaryColor: '#06B6D4', owner: 'Kai Tanaka', homeTrack: 'Sebring', wins: 0, points: 145, founded: 2023, budget: '$1.2M', championships: 0, principal: 'Kai Tanaka', headquarters: 'Sebring, FL' },
  { id: 't-8', name: 'Iron Circuit', abbreviation: 'IRC', primaryColor: '#6B7280', owner: 'Mike Thompson', homeTrack: 'VIR', wins: 0, points: 132, founded: 2022, budget: '$1.1M', championships: 0, principal: 'Mike Thompson', headquarters: 'Charlottesville, VA' },
];

// =============================================================================
// TEAMS DATA — Personnel (keyed by team ID)
// =============================================================================

export const TEAM_PERSONNEL: Record<string, TeamPerson[]> = {
  't-1': [
    { id: 'tp-1', name: 'Mike Chen', initials: 'MC', role: 'Lead Engineer', department: 'Engineering', since: '2019' },
    { id: 'tp-2', name: 'Tom Harris', initials: 'TH', role: 'Lead Mechanic', department: 'Pit Crew', since: '2020' },
    { id: 'tp-3', name: 'Laura Blake', initials: 'LB', role: 'Strategist', department: 'Racing Ops', since: '2021' },
  ],
  't-2': [
    { id: 'tp-4', name: 'Sarah Mills', initials: 'SM', role: 'Lead Engineer', department: 'Engineering', since: '2020' },
    { id: 'tp-5', name: 'Oscar Cruz', initials: 'OC', role: 'Aerodynamicist', department: 'Technical', since: '2021' },
    { id: 'tp-6', name: 'Jenny Park', initials: 'JP', role: 'Data Analyst', department: 'Performance', since: '2022' },
  ],
  't-3': [
    { id: 'tp-7', name: 'Raj Patel', initials: 'RP', role: 'Race Strategist', department: 'Racing Ops', since: '2018' },
    { id: 'tp-8', name: 'Maria Gonzalez', initials: 'MG', role: 'Chief Mechanic', department: 'Pit Crew', since: '2019' },
  ],
  't-4': [
    { id: 'tp-9', name: 'Elena Rossi', initials: 'ER', role: 'Race Strategist', department: 'Racing Ops', since: '2021' },
    { id: 'tp-10', name: 'Daniel Kim', initials: 'DK', role: 'Performance Engineer', department: 'Engineering', since: '2022' },
  ],
  't-5': [
    { id: 'tp-11', name: 'Ana Gutierrez', initials: 'AG', role: 'Pit Crew Chief', department: 'Pit Crew', since: '2020' },
    { id: 'tp-12', name: 'Ben Turner', initials: 'BT', role: 'Engineer', department: 'Engineering', since: '2021' },
  ],
  't-6': [
    { id: 'tp-13', name: 'James Wright', initials: 'JW', role: 'Lead Engineer', department: 'Engineering', since: '2022' },
  ],
  't-7': [
    { id: 'tp-14', name: 'Yuki Sato', initials: 'YS', role: 'Data Analyst', department: 'Performance', since: '2023' },
  ],
  't-8': [
    { id: 'tp-15', name: 'Chris Nelson', initials: 'CN', role: 'Lead Mechanic', department: 'Pit Crew', since: '2022' },
  ],
};

// =============================================================================
// TEAMS DATA — Cars (keyed by team ID)
// =============================================================================

export const TEAM_CARS: Record<string, TeamCar[]> = {
  't-1': [
    { id: 'tc-1', carNumber: '7', driverName: 'Leo Vasquez', liveryColor: '#EF4444', chassis: 'APX-K1 Mk4', engine: 'Rotax 125cc Evo', weight: '170 kg', topSpeed: '148 km/h' },
    { id: 'tc-2', carNumber: '11', driverName: 'Jake Morrison', liveryColor: '#DC2626', chassis: 'APX-K1 Mk4', engine: 'Rotax 125cc Evo', weight: '170 kg', topSpeed: '147 km/h' },
  ],
  't-2': [
    { id: 'tc-3', carNumber: '22', driverName: 'Nadia Patel', liveryColor: '#3B82F6', chassis: 'VEL-Sprint S3', engine: 'Rotax 125cc Evo', weight: '171 kg', topSpeed: '146 km/h' },
    { id: 'tc-4', carNumber: '5', driverName: 'Marcus Bell', liveryColor: '#2563EB', chassis: 'VEL-Sprint S3', engine: 'Rotax 125cc Evo', weight: '172 kg', topSpeed: '145 km/h' },
  ],
  't-3': [
    { id: 'tc-5', carNumber: '33', driverName: 'Yuki Tanaka', liveryColor: '#F59E0B', chassis: 'PHX-Raptor R2', engine: 'Rotax 125cc Evo', weight: '170 kg', topSpeed: '147 km/h' },
    { id: 'tc-6', carNumber: '8', driverName: 'Andre Williams', liveryColor: '#D97706', chassis: 'PHX-Raptor R2', engine: 'Rotax 125cc Evo', weight: '171 kg', topSpeed: '145 km/h' },
  ],
  't-4': [
    { id: 'tc-7', carNumber: '44', driverName: 'Sofia Torres', liveryColor: '#22C55E', chassis: 'ZEN-Pulse P1', engine: 'Rotax 125cc Evo', weight: '170 kg', topSpeed: '146 km/h' },
    { id: 'tc-8', carNumber: '16', driverName: 'Emma Lindqvist', liveryColor: '#16A34A', chassis: 'ZEN-Pulse P1', engine: 'Rotax 125cc Evo', weight: '171 kg', topSpeed: '144 km/h' },
  ],
  't-5': [
    { id: 'tc-9', carNumber: '99', driverName: 'Carlos Mendez', liveryColor: '#7C3AED', chassis: 'SHD-Phantom V2', engine: 'Rotax 125cc Evo', weight: '172 kg', topSpeed: '145 km/h' },
    { id: 'tc-10', carNumber: '18', driverName: 'Grace Kim', liveryColor: '#6D28D9', chassis: 'SHD-Phantom V2', engine: 'Rotax 125cc Evo', weight: '170 kg', topSpeed: '144 km/h' },
  ],
  't-6': [
    { id: 'tc-11', carNumber: '3', driverName: 'Ryan Fletcher', liveryColor: '#EC4899', chassis: 'TTN-Force F1', engine: 'Rotax 125cc Evo', weight: '171 kg', topSpeed: '144 km/h' },
    { id: 'tc-12', carNumber: '27', driverName: 'Mia Santos', liveryColor: '#DB2777', chassis: 'TTN-Force F1', engine: 'Rotax 125cc Evo', weight: '170 kg', topSpeed: '143 km/h' },
  ],
  't-7': [
    { id: 'tc-13', carNumber: '41', driverName: 'Zach Cooper', liveryColor: '#06B6D4', chassis: 'NVA-Bolt B1', engine: 'Rotax 125cc Evo', weight: '172 kg', topSpeed: '143 km/h' },
    { id: 'tc-14', carNumber: '14', driverName: 'Priya Sharma', liveryColor: '#0891B2', chassis: 'NVA-Bolt B1', engine: 'Rotax 125cc Evo', weight: '171 kg', topSpeed: '142 km/h' },
  ],
  't-8': [
    { id: 'tc-15', carNumber: '21', driverName: 'Tyler Brooks', liveryColor: '#6B7280', chassis: 'IRC-Stealth X1', engine: 'Rotax 125cc Evo', weight: '173 kg', topSpeed: '142 km/h' },
    { id: 'tc-16', carNumber: '36', driverName: 'Olivia Dunn', liveryColor: '#4B5563', chassis: 'IRC-Stealth X1', engine: 'Rotax 125cc Evo', weight: '170 kg', topSpeed: '141 km/h' },
  ],
};

// =============================================================================
// TEAMS DATA — Compliance Items (keyed by team ID)
// =============================================================================

export const TEAM_COMPLIANCE_ITEMS: Record<string, TeamComplianceItem[]> = {
  't-1': [
    { id: 'ci-1', item: 'Engine seals integrity', status: 'compliant', lastChecked: 'Jul 18, 2026' },
    { id: 'ci-2', item: 'Minimum weight certification', status: 'compliant', lastChecked: 'Jul 18, 2026' },
    { id: 'ci-3', item: 'Safety gear inspection', status: 'compliant', lastChecked: 'Jul 17, 2026' },
    { id: 'ci-4', item: 'Fuel sample conformity', status: 'compliant', lastChecked: 'Jul 18, 2026' },
  ],
  't-2': [
    { id: 'ci-5', item: 'Engine seals integrity', status: 'compliant', lastChecked: 'Jul 18, 2026' },
    { id: 'ci-6', item: 'Minimum weight certification', status: 'compliant', lastChecked: 'Jul 18, 2026' },
    { id: 'ci-7', item: 'Safety gear inspection', status: 'warning', lastChecked: 'Jul 15, 2026' },
    { id: 'ci-8', item: 'Fuel sample conformity', status: 'compliant', lastChecked: 'Jul 18, 2026' },
  ],
  't-3': [
    { id: 'ci-9', item: 'Engine seals integrity', status: 'compliant', lastChecked: 'Jul 18, 2026' },
    { id: 'ci-10', item: 'Minimum weight certification', status: 'compliant', lastChecked: 'Jul 18, 2026' },
    { id: 'ci-11', item: 'Safety gear inspection', status: 'compliant', lastChecked: 'Jul 17, 2026' },
  ],
  't-4': [
    { id: 'ci-12', item: 'Engine seals integrity', status: 'compliant', lastChecked: 'Jul 18, 2026' },
    { id: 'ci-13', item: 'Minimum weight certification', status: 'pending', lastChecked: 'Jul 12, 2026' },
    { id: 'ci-14', item: 'Tire allocation tracking', status: 'compliant', lastChecked: 'Jul 18, 2026' },
  ],
  't-5': [
    { id: 'ci-15', item: 'Engine seals integrity', status: 'non_compliant', lastChecked: 'Jul 18, 2026' },
    { id: 'ci-16', item: 'Minimum weight certification', status: 'compliant', lastChecked: 'Jul 18, 2026' },
    { id: 'ci-17', item: 'Data logger conformity', status: 'warning', lastChecked: 'Jul 16, 2026' },
  ],
  't-6': [
    { id: 'ci-18', item: 'Engine seals integrity', status: 'compliant', lastChecked: 'Jul 18, 2026' },
    { id: 'ci-19', item: 'Safety gear inspection', status: 'compliant', lastChecked: 'Jul 17, 2026' },
  ],
  't-7': [
    { id: 'ci-20', item: 'Engine seals integrity', status: 'compliant', lastChecked: 'Jul 18, 2026' },
    { id: 'ci-21', item: 'Chassis homologation', status: 'pending', lastChecked: 'Jul 10, 2026' },
  ],
  't-8': [
    { id: 'ci-22', item: 'Engine seals integrity', status: 'compliant', lastChecked: 'Jul 18, 2026' },
    { id: 'ci-23', item: 'Minimum weight certification', status: 'compliant', lastChecked: 'Jul 18, 2026' },
  ],
};

// =============================================================================
// RACE WEEK OPS DATA — Sessions (Thunder Classic — Portland)
// =============================================================================

export const RACE_WEEK_SESSIONS: RaceWeekSession[] = [
  { id: 'rws-1', name: 'Paddock Setup & Inspection', type: 'setup', status: 'completed', startTime: 'Thu 8:00 AM', endTime: 'Thu 12:00 PM', track: 'Portland International Raceway', weather: 'Sunny · 68°F' },
  { id: 'rws-2', name: 'Pre-Race Technical Inspection', type: 'inspection', status: 'completed', startTime: 'Thu 1:00 PM', endTime: 'Thu 5:00 PM', track: 'Portland International Raceway', weather: 'Sunny · 72°F' },
  { id: 'rws-3', name: 'Free Practice 1', type: 'practice', status: 'completed', startTime: 'Fri 9:00 AM', endTime: 'Fri 10:00 AM', track: 'Portland International Raceway', weather: 'Partly Cloudy · 65°F' },
  { id: 'rws-4', name: 'Free Practice 2', type: 'practice', status: 'completed', startTime: 'Fri 2:00 PM', endTime: 'Fri 3:00 PM', track: 'Portland International Raceway', weather: 'Cloudy · 63°F' },
  { id: 'rws-5', name: 'Qualifying', type: 'qualifying', status: 'live', startTime: 'Sat 10:00 AM', endTime: 'Sat 11:30 AM', track: 'Portland International Raceway', weather: 'Partly Cloudy · 70°F' },
  { id: 'rws-6', name: 'Thunder Classic — Feature Race', type: 'race', status: 'upcoming', startTime: 'Sun 2:00 PM', endTime: 'Sun 4:00 PM', track: 'Portland International Raceway', weather: 'Partly Cloudy · 72°F' },
];

// =============================================================================
// RACE WEEK OPS DATA — Team Readiness
// =============================================================================

export const TEAM_READINESS: TeamReadiness[] = [
  { teamId: 't-1', teamName: 'Apex Racing', abbreviation: 'APX', teamColor: '#EF4444', overallReady: true, techInspection: 'pass', safetyCheck: 'pass', credentialing: 'pass' },
  { teamId: 't-2', teamName: 'Velocity Works', abbreviation: 'VEL', teamColor: '#3B82F6', overallReady: true, techInspection: 'pass', safetyCheck: 'pass', credentialing: 'pass' },
  { teamId: 't-3', teamName: 'Phoenix Motorsport', abbreviation: 'PHX', teamColor: '#F59E0B', overallReady: true, techInspection: 'pass', safetyCheck: 'pass', credentialing: 'pass' },
  { teamId: 't-4', teamName: 'Zenith Racing', abbreviation: 'ZEN', teamColor: '#22C55E', overallReady: true, techInspection: 'pass', safetyCheck: 'pass', credentialing: 'pass' },
  { teamId: 't-5', teamName: 'Shadow GP', abbreviation: 'SHD', teamColor: '#7C3AED', overallReady: false, techInspection: 'fail', safetyCheck: 'pass', credentialing: 'pass' },
  { teamId: 't-6', teamName: 'Titan Racing', abbreviation: 'TTN', teamColor: '#EC4899', overallReady: true, techInspection: 'pass', safetyCheck: 'pass', credentialing: 'pass' },
  { teamId: 't-7', teamName: 'Nova Speed', abbreviation: 'NVA', teamColor: '#06B6D4', overallReady: false, techInspection: 'pass', safetyCheck: 'pending', credentialing: 'pending' },
  { teamId: 't-8', teamName: 'Iron Circuit', abbreviation: 'IRC', teamColor: '#6B7280', overallReady: true, techInspection: 'pass', safetyCheck: 'pass', credentialing: 'pass' },
];

// =============================================================================
// RACE WEEK OPS DATA — Incidents
// =============================================================================

export const RACE_INCIDENTS: RaceIncident[] = [
  { id: 'ri-1', lap: 3, time: 'Sat 10:14 AM', severity: 'minor', status: 'no_action', description: 'Light contact between Kim and Brooks at Turn 3 during qualifying out-laps. Both drivers continued without damage.', driversInvolved: ['Grace Kim (#18)', 'Tyler Brooks (#21)'], decision: 'Racing incident — no further action.' },
  { id: 'ri-2', lap: 8, time: 'Sat 10:28 AM', severity: 'moderate', status: 'decided', description: 'Mendez pushed wide by Santos at Turn 7 chicane, losing position. Santos gained a lasting advantage by cutting the corner.', driversInvolved: ['Carlos Mendez (#99)', 'Mia Santos (#27)'], decision: 'Santos ordered to give back position. 5-second time penalty if not complied within 3 laps.' },
  { id: 'ri-3', lap: 12, time: 'Sat 10:42 AM', severity: 'major', status: 'under_review', description: 'Williams had a front-right tire blow-out entering Turn 11 at high speed. Kart slid into tire barriers. Driver OK, red flag for barrier repair.', driversInvolved: ['Andre Williams (#8)'], decision: 'Under investigation — tire supplier notified, all teams instructed to check tire pressures.' },
  { id: 'ri-4', lap: 15, time: 'Sat 10:56 AM', severity: 'minor', status: 'decided', description: 'Cooper exceeded track limits at Turn 1 on 3 consecutive laps during qualifying push lap.', driversInvolved: ['Zach Cooper (#41)'], decision: 'Affected lap times deleted. Final qualifying position adjusted.' },
];

// =============================================================================
// RULES DATA — Rule Articles
// =============================================================================

export const RULE_ARTICLES: RuleArticle[] = [
  { id: 'ra-1', section: 'Race Procedures', articleNumber: '1.01', title: 'Grid Formation & Start Procedure', summary: 'All karts must be in grid position 5 minutes before the formation lap. A rolling start is initiated by the pace kart at a speed not exceeding 60 km/h. Jump starts result in an automatic drive-through penalty.', category: 'race' },
  { id: 'ra-2', section: 'Race Procedures', articleNumber: '1.02', title: 'Pit Lane Entry & Exit', summary: 'Pit lane speed limit is 40 km/h. Karts must enter and exit the pit lane in a safe and controlled manner. Crossing the blend line on pit exit incurs a 5-second time penalty.', category: 'race' },
  { id: 'ra-3', section: 'Race Procedures', articleNumber: '1.03', title: 'Safety Car Deployment', summary: 'When the safety car is deployed, all karts must reduce speed and form a single-file line behind the safety car. Overtaking is prohibited until the safety car enters the pit lane and the green flag is shown.', category: 'race' },
  { id: 'ra-4', section: 'Race Procedures', articleNumber: '1.04', title: 'Race Restart Procedure', summary: 'After a red flag period, the race restarts from the grid in the order of the last completed lap. A 5-minute board is shown before the restart formation lap begins.', category: 'race' },
  { id: 'ra-5', section: 'Technical Regulations', articleNumber: '2.01', title: 'Engine Specifications', summary: 'All K-1 karts must use the homologated Rotax 125cc engine package. Engine seals must be intact at all times. Modification of the exhaust system, carburetor, or ignition timing is strictly prohibited.', category: 'technical' },
  { id: 'ra-6', section: 'Technical Regulations', articleNumber: '2.02', title: 'Chassis & Bodywork', summary: 'Chassis must conform to CIK-FIA homologation standards. Maximum kart width: 140 cm. Bodywork must be complete and undamaged at the start of each session. Minimum weight including driver: 170 kg.', category: 'technical' },
  { id: 'ra-7', section: 'Technical Regulations', articleNumber: '2.03', title: 'Tire Regulations', summary: 'Only K-1 homologated tires (supplied by official partner) may be used. Maximum tire allocation per race weekend: 2 sets dry, 1 set wet. Tire warmers are prohibited.', category: 'technical' },
  { id: 'ra-8', section: 'Technical Regulations', articleNumber: '2.04', title: 'Data Logging & Telemetry', summary: 'Only the standard K-1 data logger is permitted. Real-time telemetry transmission to the pit wall is allowed during practice and qualifying only. During races, only GPS position data may be transmitted.', category: 'technical' },
  { id: 'ra-9', section: 'Safety Standards', articleNumber: '3.01', title: 'Personal Protective Equipment', summary: 'All drivers must wear FIA-approved helmet (Snell SA2020 or newer), fire-resistant suit, gloves, and boots at all times on track. Rib protectors are mandatory for all age categories.', category: 'safety' },
  { id: 'ra-10', section: 'Safety Standards', articleNumber: '3.02', title: 'Track Safety Requirements', summary: 'All race circuits must have FIA Grade C minimum certification. Tire barriers at all high-speed corners. Medical team and ambulance on standby within 60 seconds of any track position.', category: 'safety' },
  { id: 'ra-11', section: 'Safety Standards', articleNumber: '3.03', title: 'Incident Response Protocol', summary: 'Any driver involved in a contact incident must be assessed by the medical team before returning to the track. Race control may mandate a pit-lane observation period of up to 3 laps.', category: 'safety' },
  { id: 'ra-12', section: 'Sporting Regulations', articleNumber: '4.01', title: 'Driver Conduct & Sportsmanship', summary: 'Drivers must conduct themselves in a manner consistent with K-1 values. Deliberate contact, blocking, or weaving on straights is prohibited. Repeated unsportsmanlike behavior may result in championship point deductions.', category: 'sporting' },
  { id: 'ra-13', section: 'Sporting Regulations', articleNumber: '4.02', title: 'Track Limits & Defending', summary: 'Drivers must keep at least two wheels within the white track boundary lines at all times. One defensive move per straight is permitted. Pushing another driver off track results in a penalty.', category: 'sporting' },
  { id: 'ra-14', section: 'Sporting Regulations', articleNumber: '4.03', title: 'Championship Eligibility', summary: 'Drivers must compete in a minimum of 8 out of 12 rounds to be eligible for championship classification. Teams must declare their driver lineup no later than 48 hours before each race weekend.', category: 'sporting' },
  { id: 'ra-15', section: 'Sporting Regulations', articleNumber: '4.04', title: 'Protest & Appeals Process', summary: 'Protests must be filed within 30 minutes of the provisional results being posted. A $200 protest fee is required (refunded if upheld). The K-1 Stewards Panel has final authority on race-day decisions; championship-level appeals go to the K-1 Tribunal.', category: 'sporting' },
];

// =============================================================================
// RULES DATA — Ruling Cases
// =============================================================================

export const RULING_CASES: RulingCase[] = [
  { id: 'rc-1', title: 'Kane vs. Torres — Turn 6 Contact', date: 'Feb 15, 2026', race: 'Laguna Seca Grand Prix', parties: ['Marcus Kane (#7)', 'Liam Torres (#23)'], ruling: 'Kane was found predominantly at fault for initiating contact while attempting an overtake on the inside of Turn 6. Torres was forced wide and lost two positions.', penalty: '5-second time penalty applied to Kane\'s race result; 2 penalty points on license.', precedent: true },
  { id: 'rc-2', title: 'Reyes — Pit Lane Speeding', date: 'Feb 8, 2026', race: 'Sonoma Sprint', parties: ['Diego Reyes (#45)'], ruling: 'Reyes entered pit lane at 47 km/h, exceeding the 40 km/h limit by 7 km/h. Infringement confirmed by pit lane speed trap data.', penalty: 'Drive-through penalty served during race; no additional points.', precedent: false },
  { id: 'rc-3', title: 'Rising Sun Motorsport — Fuel Irregularity', date: 'Feb 1, 2026', race: 'COTA Endurance 500', parties: ['Rising Sun Motorsport', 'Yuki Tanaka (#11)'], ruling: 'Post-race fuel sample analysis showed non-conforming octane level (102.3 vs. 101.0 max). Team attributed to supplier error. Stewards acknowledged mitigating circumstances but rule is strict liability.', penalty: 'Disqualification from race results; team fined $5,000. No championship points deducted due to mitigating factors.', precedent: true },
  { id: 'rc-4', title: 'Park — Unsafe Release', date: 'Jan 25, 2026', race: 'Barber Motorsports Clash', parties: ['Aiden Park (#3)', 'Apex Racing'], ruling: 'Park was released from his pit box into the path of Kai Okafor. Okafor had to take avoiding action. Deemed an unsafe release by the team, not the driver.', penalty: '10-second stop-go penalty applied to Park; team reprimand.', precedent: false },
  { id: 'rc-5', title: 'Okafor — Track Limits Violation', date: 'Jan 18, 2026', race: 'Road Atlanta Challenge', parties: ['Kai Okafor (#88)'], ruling: 'Okafor exceeded track limits at Turn 10 on 4 occasions during qualifying. Fastest lap (where violation occurred) deleted. Grid position adjusted from P4 to P6.', penalty: 'Qualifying lap time deleted; grid position adjusted.', precedent: false },
  { id: 'rc-6', title: 'Multi-Kart Incident — Lap 1 Chain Reaction', date: 'Jan 11, 2026', race: 'Sebring Karting Classic', parties: ['Diego Reyes (#45)', 'Kai Okafor (#88)', 'Nadia Petrov (#14)'], ruling: 'Lap 1 Turn 3 chain reaction caused by Reyes locking up into Okafor, who then collected Petrov. Stewards classified as a racing incident given the proximity of the start. No single driver found predominantly at fault.', penalty: 'No penalty — classified as racing incident.', precedent: true },
];

// =============================================================================
// RULES DATA — Penalty Catalog
// =============================================================================

export const PENALTY_CATALOG: PenaltyCatalogEntry[] = [
  { id: 'pc-1', infraction: 'Jump Start', minPenalty: 'Drive-through', maxPenalty: '10-second stop-go', pointsRange: '0-2 pts', examples: 'Moving before the green light/flag signal. Sensor data from transponder used to verify.' },
  { id: 'pc-2', infraction: 'Causing a Collision', minPenalty: '5-second time penalty', maxPenalty: 'Disqualification', pointsRange: '2-6 pts', examples: 'Deliberate or reckless contact with another kart. Severity assessed by stewards.' },
  { id: 'pc-3', infraction: 'Pit Lane Speeding', minPenalty: 'Drive-through', maxPenalty: 'Drive-through + fine', pointsRange: '0-1 pts', examples: 'Exceeding 40 km/h pit lane speed limit. Measured by timing loop at pit entry.' },
  { id: 'pc-4', infraction: 'Track Limits Abuse', minPenalty: 'Lap time deleted', maxPenalty: '5-second time penalty', pointsRange: '0 pts', examples: 'Gaining a lasting advantage by leaving the track. Three warnings before penalty.' },
  { id: 'pc-5', infraction: 'Unsafe Release', minPenalty: '5-second time penalty', maxPenalty: '10-second stop-go', pointsRange: '0-2 pts', examples: 'Releasing a kart from pit box into path of another. Team penalized.' },
  { id: 'pc-6', infraction: 'Ignoring Blue Flags', minPenalty: '5-second time penalty', maxPenalty: 'Drive-through', pointsRange: '1-2 pts', examples: 'Failure to yield to a lapping kart within 3 flag marshal points.' },
  { id: 'pc-7', infraction: 'Technical Non-Compliance', minPenalty: 'Fine ($1,000)', maxPenalty: 'Disqualification + points strip', pointsRange: '0-12 pts', examples: 'Modification to sealed components, non-conforming fuel, underweight kart.' },
  { id: 'pc-8', infraction: 'Unsportsmanlike Conduct', minPenalty: 'Reprimand', maxPenalty: 'Race ban + fine', pointsRange: '2-8 pts', examples: 'Aggressive driving, deliberate blocking, verbal abuse of officials.' },
];

// =============================================================================
// RULES DATA — Points Table
// =============================================================================

export const POINTS_TABLE: PointsTableEntry[] = [
  { position: 1, points: 25, bonus: '+3 Pole Position' },
  { position: 2, points: 18 },
  { position: 3, points: 15 },
  { position: 4, points: 12 },
  { position: 5, points: 10 },
  { position: 6, points: 8 },
  { position: 7, points: 6 },
  { position: 8, points: 4 },
  { position: 9, points: 2 },
  { position: 10, points: 1, bonus: '+1 Fastest Lap' },
];

// =============================================================================
// COMPLIANCE DATA — Entities
// =============================================================================

export const COMPLIANCE_ENTITIES: ComplianceEntity[] = [
  // Eligibility
  { id: 'ce-1', workspace: 'eligibility', name: 'Leo Vasquez', type: 'Driver License', status: 'approved', teamName: 'Apex Racing', teamColor: '#EF4444', lastInspected: 'Jul 15, 2026', expiresAt: 'Dec 31, 2026' },
  { id: 'ce-2', workspace: 'eligibility', name: 'Nadia Patel', type: 'Driver License', status: 'approved', teamName: 'Velocity Works', teamColor: '#3B82F6', lastInspected: 'Jul 15, 2026', expiresAt: 'Dec 31, 2026' },
  { id: 'ce-3', workspace: 'eligibility', name: 'Andre Williams', type: 'Driver License', status: 'pending', teamName: 'Phoenix Motorsport', teamColor: '#F59E0B', lastInspected: 'Jul 10, 2026', expiresAt: 'Aug 30, 2026', notes: 'Medical recertification required after Turn 11 incident' },
  { id: 'ce-4', workspace: 'eligibility', name: 'Grace Kim', type: 'Driver License', status: 'approved', teamName: 'Shadow GP', teamColor: '#7C3AED', lastInspected: 'Jul 14, 2026', expiresAt: 'Dec 31, 2026' },
  // Homologation
  { id: 'ce-5', workspace: 'homologation', name: 'APX-K1 Mk4 Chassis', type: 'Chassis', status: 'approved', teamName: 'Apex Racing', teamColor: '#EF4444', lastInspected: 'Jul 18, 2026', expiresAt: 'Dec 31, 2026' },
  { id: 'ce-6', workspace: 'homologation', name: 'VEL-Sprint S3 Chassis', type: 'Chassis', status: 'approved', teamName: 'Velocity Works', teamColor: '#3B82F6', lastInspected: 'Jul 18, 2026', expiresAt: 'Dec 31, 2026' },
  { id: 'ce-7', workspace: 'homologation', name: 'NVA-Bolt B1 Chassis', type: 'Chassis', status: 'flagged', teamName: 'Nova Speed', teamColor: '#06B6D4', lastInspected: 'Jul 16, 2026', expiresAt: 'Aug 15, 2026', notes: 'Front wing non-standard — requires re-homologation' },
  { id: 'ce-8', workspace: 'homologation', name: 'SHD-Phantom V2 Engine', type: 'Engine', status: 'flagged', teamName: 'Shadow GP', teamColor: '#7C3AED', lastInspected: 'Jul 18, 2026', expiresAt: 'Jul 31, 2026', notes: 'Seal #4 showed signs of tampering — under review' },
  // Cost Cap
  { id: 'ce-9', workspace: 'cost_cap', name: 'Apex Racing — 2026 Budget', type: 'Budget Report', status: 'approved', teamName: 'Apex Racing', teamColor: '#EF4444', lastInspected: 'Jul 1, 2026', expiresAt: 'Dec 31, 2026' },
  { id: 'ce-10', workspace: 'cost_cap', name: 'Shadow GP — 2026 Budget', type: 'Budget Report', status: 'pending', teamName: 'Shadow GP', teamColor: '#7C3AED', lastInspected: 'Jun 15, 2026', expiresAt: 'Sep 30, 2026', notes: 'Q2 report overdue — awaiting submission' },
  { id: 'ce-11', workspace: 'cost_cap', name: 'Nova Speed — 2026 Budget', type: 'Budget Report', status: 'approved', teamName: 'Nova Speed', teamColor: '#06B6D4', lastInspected: 'Jul 1, 2026', expiresAt: 'Dec 31, 2026' },
  // Safety Certification
  { id: 'ce-12', workspace: 'safety_cert', name: 'Portland International Raceway', type: 'Track Cert', status: 'approved', teamName: 'K-1 League', teamColor: '#22C55E', lastInspected: 'Jul 25, 2026', expiresAt: 'Jan 31, 2027' },
  { id: 'ce-13', workspace: 'safety_cert', name: 'Medical Crew — Portland', type: 'Medical Team', status: 'approved', teamName: 'K-1 League', teamColor: '#22C55E', lastInspected: 'Jul 28, 2026', expiresAt: 'Aug 2, 2026' },
  { id: 'ce-14', workspace: 'safety_cert', name: 'Fire Suppression Systems', type: 'Safety Equipment', status: 'expired', teamName: 'K-1 League', teamColor: '#22C55E', lastInspected: 'Jun 1, 2026', expiresAt: 'Jul 15, 2026', notes: 'Annual re-certification overdue — scheduled for Jul 29' },
  // Sponsorship
  { id: 'ce-15', workspace: 'sponsorship', name: 'Nike — Title Sponsor', type: 'Title Sponsor', status: 'approved', teamName: 'K-1 League', teamColor: '#22C55E', lastInspected: 'Jul 1, 2026', expiresAt: 'Dec 31, 2027' },
  { id: 'ce-16', workspace: 'sponsorship', name: 'Red Bull — Energy Partner', type: 'Associate Sponsor', status: 'approved', teamName: 'K-1 League', teamColor: '#22C55E', lastInspected: 'Jul 1, 2026', expiresAt: 'Dec 31, 2026' },
  { id: 'ce-17', workspace: 'sponsorship', name: 'Pirelli — Tire Supplier', type: 'Technical Partner', status: 'pending', teamName: 'K-1 League', teamColor: '#22C55E', lastInspected: 'Jun 20, 2026', expiresAt: 'Sep 30, 2026', notes: '2027 renewal under negotiation' },
];

// =============================================================================
// COMPLIANCE DATA — Audit Log
// =============================================================================

export const COMPLIANCE_AUDIT_LOG: ComplianceAuditEntry[] = [
  { id: 'al-1', workspace: 'homologation', action: 'Flagged', entity: 'SHD-Phantom V2 Engine', actor: 'Kenji Tanaka (Chief Inspector)', timestamp: 'Jul 18, 2026 4:32 PM', details: 'Engine seal #4 showed evidence of thermal damage. Sent to lab for further analysis.' },
  { id: 'al-2', workspace: 'eligibility', action: 'Approved', entity: 'Leo Vasquez — Driver License', actor: 'FIA Medical Panel', timestamp: 'Jul 15, 2026 10:15 AM', details: 'Annual medical clearance passed. Vision, cardiac, and neurological tests all within limits.' },
  { id: 'al-3', workspace: 'cost_cap', action: 'Submitted', entity: 'Apex Racing — Q2 Budget', actor: 'Marcus Kane (Team Principal)', timestamp: 'Jul 1, 2026 9:00 AM', details: 'Q2 2026 financial report submitted. Total spend: $1.18M of $2.4M cap.' },
  { id: 'al-4', workspace: 'safety_cert', action: 'Approved', entity: 'Portland International Raceway', actor: 'FIA Track Inspector', timestamp: 'Jul 25, 2026 2:00 PM', details: 'All barriers, run-off areas, and medical facilities meet FIA Grade C requirements.' },
  { id: 'al-5', workspace: 'homologation', action: 'Flagged', entity: 'NVA-Bolt B1 Chassis', actor: 'Kenji Tanaka (Chief Inspector)', timestamp: 'Jul 16, 2026 11:45 AM', details: 'Front wing endplate measured 3mm beyond homologation spec. Team given 48h to rectify.' },
  { id: 'al-6', workspace: 'sponsorship', action: 'Initiated', entity: 'Pirelli — 2027 Renewal', actor: 'K-1 Commercial Dept.', timestamp: 'Jun 20, 2026 3:30 PM', details: 'Renewal discussions started. Current deal expires Sep 30. Terms under review.' },
  { id: 'al-7', workspace: 'eligibility', action: 'Pending', entity: 'Andre Williams — Medical Recert', actor: 'FIA Medical Panel', timestamp: 'Jul 10, 2026 1:00 PM', details: 'Post-incident medical observation period started. Full recertification required before next race.' },
  { id: 'al-8', workspace: 'safety_cert', action: 'Flagged', entity: 'Fire Suppression Systems', actor: 'Sarah Nakamura (Chief Steward)', timestamp: 'Jul 16, 2026 9:00 AM', details: 'Annual certification expired Jul 15. Re-inspection scheduled for Jul 29.' },
  { id: 'al-9', workspace: 'cost_cap', action: 'Pending', entity: 'Shadow GP — Q2 Budget', actor: 'K-1 Financial Audit', timestamp: 'Jul 15, 2026 5:00 PM', details: 'Q2 report not received by deadline. Reminder sent to team principal.' },
  { id: 'al-10', workspace: 'eligibility', action: 'Approved', entity: 'Grace Kim — Driver License', actor: 'FIA Medical Panel', timestamp: 'Jul 14, 2026 11:30 AM', details: 'All clearances current. License valid through end of 2026 season.' },
];

// =============================================================================
// COMPLIANCE DATA — Summaries (for dashboard grid)
// =============================================================================

export const COMPLIANCE_SUMMARIES: ComplianceSummary[] = [
  { workspace: 'eligibility', label: 'Eligibility', icon: 'person.text.rectangle', total: 4, approved: 3, pending: 1, flagged: 0 },
  { workspace: 'homologation', label: 'Homologation', icon: 'car.fill', total: 4, approved: 2, pending: 0, flagged: 2 },
  { workspace: 'cost_cap', label: 'Cost Cap', icon: 'dollarsign.circle.fill', total: 3, approved: 2, pending: 1, flagged: 0 },
  { workspace: 'safety_cert', label: 'Safety Cert', icon: 'shield.checkered', total: 3, approved: 2, pending: 0, flagged: 1 },
  { workspace: 'sponsorship', label: 'Sponsorship', icon: 'building.2.fill', total: 3, approved: 2, pending: 1, flagged: 0 },
  { workspace: 'audit_log', label: 'Audit Log', icon: 'doc.text.magnifyingglass', total: 10, approved: 4, pending: 3, flagged: 3 },
];

// =============================================================================
// UNIVERSAL SHEET TYPES
// =============================================================================

export type SeriesFormat = 'league' | 'tournament';
export type SeriesStatus = 'preseason' | 'live' | 'completed';
export type EntrantStatus = 'active' | 'under_review' | 'suspended' | 'withdrawn';
export type EventStatus = 'upcoming' | 'live' | 'completed';
export type SessionType = 'practice' | 'qualifying' | 'main' | 'media' | 'tech' | 'ceremony' | 'wildcard';
export type SessionStatus = 'scheduled' | 'live' | 'delayed' | 'red_flag' | 'complete';
export type IncidentType = 'protest' | 'penalty' | 'safety';
export type IncidentStatus = 'new' | 'assigned' | 'under_review' | 'decided' | 'closed';
export type PayoutStatus = 'locked' | 'hold' | 'released' | 'pending';
export type DeliverableStatus = 'on_track' | 'at_risk' | 'overdue' | 'delivered';
export type StandingsState = 'provisional' | 'under_review' | 'official';
export type GateState = 'cleared' | 'pending' | 'blocked';
export type DirectiveStatus = 'draft' | 'published' | 'expired';

export interface SeriesObject {
  id: string;
  name: string;
  logo?: string;
  format: SeriesFormat;
  season: string;
  status: SeriesStatus;
  nextKeyDate: string;
  entrantsCount: number;
  eventsCount: number;
  currentPhase: string;
  opsBlockers: number;
  financeReady: boolean;
  complianceIncidents: number;
}

export interface EntrantObject {
  id: string;
  seriesId: string;
  name: string;
  logo?: string;
  type: 'team' | 'entry';
  rank: number;
  points: number;
  status: EntrantStatus;
  teamColor: string;
  contactRep: string;
  recentResults: { event: string; finish: number }[];
  credentialsStatus: 'complete' | 'pending' | 'missing';
  complianceDocsComplete: number;
  complianceDocsTotal: number;
  payoutEligible: string;
  payoutStatus: PayoutStatus;
  sponsorDeliverablesDue: number;
  atRiskFlags: string[];
}

export interface EventObject {
  id: string;
  seriesId: string;
  name: string;
  venue: string;
  location: string;
  dateRange: string;
  status: EventStatus;
  sessionsCount: number;
  opsBlockers: number;
  nextSession: string;
}

export interface EventSession {
  id: string;
  eventId: string;
  name: string;
  type: SessionType;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  owner: string;
  dependencies: string[];
  format?: string;
  participantsScope?: string;
}

export interface EventIncident {
  id: string;
  eventId: string;
  type: IncidentType;
  title: string;
  description: string;
  status: IncidentStatus;
  owner: string;
  driversInvolved: string[];
  filedAt: string;
  impactFlags: string[];
}

export interface PayoutItem {
  id: string;
  entrantName: string;
  amount: string;
  status: PayoutStatus;
  reason?: string;
  gatesCleared: number;
  gatesTotal: number;
}

export interface SponsorDeliverable {
  id: string;
  sponsorName: string;
  title: string;
  dueDate: string;
  status: DeliverableStatus;
  owner: string;
  eventId?: string;
}

export interface StandingsGate {
  id: string;
  label: string;
  status: GateState;
  owner: string;
  dueTime: string;
}

export interface RuleCategory {
  id: string;
  title: string;
  purpose: string;
  lastUpdated: string;
  activeDirectives: number;
  visibility: 'public' | 'restricted';
}

export interface ActiveDirective {
  id: string;
  title: string;
  effectiveStart: string;
  effectiveEnd: string;
  scope: string;
  owner: string;
  tags: string[];
  status: DirectiveStatus;
  impactFlags: string[];
}

export interface RuleInterpretation {
  id: string;
  ruleRef: string;
  title: string;
  summary: string;
  issuedBy: string;
  issuedDate: string;
  status: 'active' | 'superseded';
  visibility: 'public' | 'restricted';
}

export interface RuleChangeLog {
  id: string;
  title: string;
  type: 'amendment' | 'bulletin' | 'interpretation' | 'directive';
  effectiveDate: string;
  approvedBy: string;
  categories: string[];
  visibility: 'public' | 'restricted';
}

export interface OpsTask {
  id: string;
  title: string;
  owner: string;
  deadline: string;
  status: 'open' | 'blocker' | 'done';
  impactFlags: string[];
  department: string;
}

export interface Announcement {
  id: string;
  title: string;
  severity: 'info' | 'important' | 'urgent';
  audience: 'staff' | 'teams' | 'public';
  content: string;
  postedAt: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  contactEmail?: string;
}

// =============================================================================
// UNIVERSAL SHEET DATA — Series
// =============================================================================

export const SERIES_LIST: SeriesObject[] = [
  {
    id: 'series-k1',
    name: 'KaNeXT League',
    format: 'league',
    season: '2026 Season',
    status: 'live',
    nextKeyDate: 'Next: Round 3 · Aug 2 · Portland GP',
    entrantsCount: 16,
    eventsCount: 8,
    currentPhase: 'Mid-Season',
    opsBlockers: 2,
    financeReady: true,
    complianceIncidents: 1,
  },
  {
    id: 'series-btw',
    name: 'BTW Memorial Classic',
    format: 'tournament',
    season: '2026',
    status: 'upcoming',
    nextKeyDate: 'Next: Opening Round · Aug 15',
    entrantsCount: 24,
    eventsCount: 3,
    currentPhase: 'Registration',
    opsBlockers: 0,
    financeReady: false,
    complianceIncidents: 0,
  },
];

// =============================================================================
// UNIVERSAL SHEET DATA — Entrants (12 entries for K-1)
// =============================================================================

export const ENTRANT_LIST: EntrantObject[] = [
  { id: 'ent-1', seriesId: 'series-k1', name: 'Apex Racing #1', type: 'entry', rank: 1, points: 312, status: 'active', teamColor: '#EF4444', contactRep: 'Marcus Kane', recentResults: [{ event: 'Rd 1', finish: 1 }, { event: 'Rd 2', finish: 2 }], credentialsStatus: 'complete', complianceDocsComplete: 8, complianceDocsTotal: 8, payoutEligible: '$125,000', payoutStatus: 'released', sponsorDeliverablesDue: 0, atRiskFlags: [] },
  { id: 'ent-2', seriesId: 'series-k1', name: 'Apex Racing #2', type: 'entry', rank: 5, points: 198, status: 'active', teamColor: '#EF4444', contactRep: 'Marcus Kane', recentResults: [{ event: 'Rd 1', finish: 4 }, { event: 'Rd 2', finish: 6 }], credentialsStatus: 'complete', complianceDocsComplete: 8, complianceDocsTotal: 8, payoutEligible: '$45,000', payoutStatus: 'released', sponsorDeliverablesDue: 0, atRiskFlags: [] },
  { id: 'ent-3', seriesId: 'series-k1', name: 'Velocity Works #3', type: 'entry', rank: 2, points: 287, status: 'active', teamColor: '#3B82F6', contactRep: 'Nadia Patel', recentResults: [{ event: 'Rd 1', finish: 2 }, { event: 'Rd 2', finish: 1 }], credentialsStatus: 'complete', complianceDocsComplete: 8, complianceDocsTotal: 8, payoutEligible: '$110,000', payoutStatus: 'released', sponsorDeliverablesDue: 1, atRiskFlags: [] },
  { id: 'ent-4', seriesId: 'series-k1', name: 'Velocity Works #4', type: 'entry', rank: 7, points: 145, status: 'active', teamColor: '#3B82F6', contactRep: 'Nadia Patel', recentResults: [{ event: 'Rd 1', finish: 8 }, { event: 'Rd 2', finish: 5 }], credentialsStatus: 'complete', complianceDocsComplete: 7, complianceDocsTotal: 8, payoutEligible: '$30,000', payoutStatus: 'pending', sponsorDeliverablesDue: 0, atRiskFlags: [] },
  { id: 'ent-5', seriesId: 'series-k1', name: 'Phoenix Motorsport #5', type: 'entry', rank: 3, points: 256, status: 'active', teamColor: '#F59E0B', contactRep: 'Andre Williams', recentResults: [{ event: 'Rd 1', finish: 3 }, { event: 'Rd 2', finish: 3 }], credentialsStatus: 'pending', complianceDocsComplete: 6, complianceDocsTotal: 8, payoutEligible: '$85,000', payoutStatus: 'released', sponsorDeliverablesDue: 0, atRiskFlags: ['Medical recertification required'] },
  { id: 'ent-6', seriesId: 'series-k1', name: 'Zenith Racing #6', type: 'entry', rank: 4, points: 241, status: 'active', teamColor: '#22C55E', contactRep: 'Sofia Torres', recentResults: [{ event: 'Rd 1', finish: 5 }, { event: 'Rd 2', finish: 4 }], credentialsStatus: 'complete', complianceDocsComplete: 8, complianceDocsTotal: 8, payoutEligible: '$70,000', payoutStatus: 'released', sponsorDeliverablesDue: 0, atRiskFlags: [] },
  { id: 'ent-7', seriesId: 'series-k1', name: 'Shadow GP #7', type: 'entry', rank: 6, points: 167, status: 'under_review', teamColor: '#7C3AED', contactRep: 'Grace Kim', recentResults: [{ event: 'Rd 1', finish: 6 }, { event: 'Rd 2', finish: 7 }], credentialsStatus: 'pending', complianceDocsComplete: 5, complianceDocsTotal: 8, payoutEligible: '$55,000', payoutStatus: 'hold', sponsorDeliverablesDue: 1, atRiskFlags: ['Engine seal under review', 'Missing compliance docs'] },
  { id: 'ent-8', seriesId: 'series-k1', name: 'Shadow GP #8', type: 'entry', rank: 10, points: 89, status: 'active', teamColor: '#7C3AED', contactRep: 'Grace Kim', recentResults: [{ event: 'Rd 1', finish: 10 }, { event: 'Rd 2', finish: 9 }], credentialsStatus: 'complete', complianceDocsComplete: 7, complianceDocsTotal: 8, payoutEligible: '$15,000', payoutStatus: 'pending', sponsorDeliverablesDue: 0, atRiskFlags: [] },
  { id: 'ent-9', seriesId: 'series-k1', name: 'Titan Racing #9', type: 'entry', rank: 8, points: 132, status: 'active', teamColor: '#EC4899', contactRep: 'Diego Mendez', recentResults: [{ event: 'Rd 1', finish: 7 }, { event: 'Rd 2', finish: 8 }], credentialsStatus: 'complete', complianceDocsComplete: 8, complianceDocsTotal: 8, payoutEligible: '$25,000', payoutStatus: 'released', sponsorDeliverablesDue: 0, atRiskFlags: [] },
  { id: 'ent-10', seriesId: 'series-k1', name: 'Nova Speed #10', type: 'entry', rank: 9, points: 112, status: 'active', teamColor: '#06B6D4', contactRep: 'Yuki Sato', recentResults: [{ event: 'Rd 1', finish: 9 }, { event: 'Rd 2', finish: 10 }], credentialsStatus: 'complete', complianceDocsComplete: 7, complianceDocsTotal: 8, payoutEligible: '$20,000', payoutStatus: 'pending', sponsorDeliverablesDue: 0, atRiskFlags: ['Front wing non-standard'] },
  { id: 'ent-11', seriesId: 'series-k1', name: 'Iron Circuit #11', type: 'entry', rank: 11, points: 76, status: 'active', teamColor: '#6B7280', contactRep: 'Tom Harris', recentResults: [{ event: 'Rd 1', finish: 11 }, { event: 'Rd 2', finish: 11 }], credentialsStatus: 'complete', complianceDocsComplete: 8, complianceDocsTotal: 8, payoutEligible: '$10,000', payoutStatus: 'pending', sponsorDeliverablesDue: 0, atRiskFlags: [] },
  { id: 'ent-12', seriesId: 'series-k1', name: 'Iron Circuit #12', type: 'entry', rank: 12, points: 56, status: 'active', teamColor: '#6B7280', contactRep: 'Tom Harris', recentResults: [{ event: 'Rd 1', finish: 12 }, { event: 'Rd 2', finish: 12 }], credentialsStatus: 'complete', complianceDocsComplete: 8, complianceDocsTotal: 8, payoutEligible: '$5,000', payoutStatus: 'pending', sponsorDeliverablesDue: 0, atRiskFlags: [] },
];

// =============================================================================
// UNIVERSAL SHEET DATA — Events (2 under K-1)
// =============================================================================

export const EVENT_LIST: EventObject[] = [
  { id: 'evt-1', seriesId: 'series-k1', name: 'Round 1 · Laguna Seca GP', venue: 'Laguna Seca Raceway', location: 'Monterey, CA', dateRange: 'Jun 20–22, 2026', status: 'completed', sessionsCount: 7, opsBlockers: 0, nextSession: '' },
  { id: 'evt-2', seriesId: 'series-k1', name: 'Round 2 · Portland Thunder Classic', venue: 'Portland International Raceway', location: 'Portland, OR', dateRange: 'Jul 28–Aug 2, 2026', status: 'live', sessionsCount: 7, opsBlockers: 2, nextSession: 'Qualifying — Q3' },
];

// =============================================================================
// UNIVERSAL SHEET DATA — Event Sessions (Round 2)
// =============================================================================

export const EVENT_SESSIONS: EventSession[] = [
  { id: 'es-1', eventId: 'evt-2', name: 'Free Practice 1', type: 'practice', startTime: 'Fri 9:00 AM', endTime: 'Fri 10:30 AM', status: 'complete', owner: 'Race Director', dependencies: [], format: '90 min', participantsScope: 'All entries' },
  { id: 'es-2', eventId: 'evt-2', name: 'Free Practice 2', type: 'practice', startTime: 'Fri 2:00 PM', endTime: 'Fri 3:30 PM', status: 'complete', owner: 'Race Director', dependencies: [], format: '90 min', participantsScope: 'All entries' },
  { id: 'es-3', eventId: 'evt-2', name: 'Tech Inspection', type: 'tech', startTime: 'Sat 8:00 AM', endTime: 'Sat 11:00 AM', status: 'complete', owner: 'Chief Inspector', dependencies: ['Scrutineering docs submitted'], format: 'Sequential', participantsScope: 'All entries' },
  { id: 'es-4', eventId: 'evt-2', name: 'Qualifying', type: 'qualifying', startTime: 'Sat 2:00 PM', endTime: 'Sat 3:30 PM', status: 'live', owner: 'Race Director', dependencies: ['Tech inspection cleared', 'Safety briefing attended'], format: 'Q1/Q2/Q3 knockout', participantsScope: 'All entries' },
  { id: 'es-5', eventId: 'evt-2', name: 'Wildcard Qualifier', type: 'wildcard', startTime: 'Sat 5:00 PM', endTime: 'Sat 6:00 PM', status: 'scheduled', owner: 'Race Director', dependencies: ['Qualifying complete', 'Wildcard entries cleared'], format: '30 min sprint', participantsScope: '2 wildcard entries' },
  { id: 'es-6', eventId: 'evt-2', name: 'Media Day Appearances', type: 'media', startTime: 'Sat 12:00 PM', endTime: 'Sat 1:30 PM', status: 'complete', owner: 'Media Director', dependencies: [], format: 'Press conference + interviews', participantsScope: 'Top 6 drivers' },
  { id: 'es-7', eventId: 'evt-2', name: 'Portland Thunder Classic — Main Race', type: 'main', startTime: 'Sun 2:00 PM', endTime: 'Sun 4:00 PM', status: 'scheduled', owner: 'Race Director', dependencies: ['Race start clearance', 'Fire suppression certified', 'Broadcast lock confirmed'], format: '65 laps', participantsScope: 'All entries' },
];

// =============================================================================
// UNIVERSAL SHEET DATA — Incidents
// =============================================================================

export const EVENT_INCIDENTS: EventIncident[] = [
  { id: 'inc-1', eventId: 'evt-2', type: 'protest', title: 'Shadow GP Engine Seal Protest', description: 'Apex Racing filed protest against Shadow GP #7 engine seal irregularity detected during Rd 2 tech inspection.', status: 'under_review', owner: 'Chief Steward', driversInvolved: ['Grace Kim'], filedAt: 'Jul 29, 2026 5:15 PM', impactFlags: ['Blocks Start', 'Compliance Risk'] },
  { id: 'inc-2', eventId: 'evt-1', type: 'penalty', title: 'Phoenix #5 Unsafe Pit Release', description: '5-second time penalty applied for unsafe pit release during Rd 1 main race lap 23.', status: 'decided', owner: 'Chief Steward', driversInvolved: ['Andre Williams'], filedAt: 'Jun 22, 2026 3:45 PM', impactFlags: [] },
];

// =============================================================================
// UNIVERSAL SHEET DATA — Payouts
// =============================================================================

export const PAYOUT_ITEMS: PayoutItem[] = [
  { id: 'pay-1', entrantName: 'Apex Racing #1', amount: '$125,000', status: 'released', gatesCleared: 5, gatesTotal: 5 },
  { id: 'pay-2', entrantName: 'Velocity Works #3', amount: '$110,000', status: 'released', gatesCleared: 5, gatesTotal: 5 },
  { id: 'pay-3', entrantName: 'Shadow GP #7', amount: '$55,000', status: 'hold', reason: 'Engine protest pending — payout blocked until resolution', gatesCleared: 3, gatesTotal: 5 },
  { id: 'pay-4', entrantName: 'Phoenix Motorsport #5', amount: '$85,000', status: 'released', gatesCleared: 5, gatesTotal: 5 },
  { id: 'pay-5', entrantName: 'Nova Speed #10', amount: '$20,000', status: 'pending', reason: 'Awaiting results certification', gatesCleared: 4, gatesTotal: 5 },
];

// =============================================================================
// UNIVERSAL SHEET DATA — Sponsor Deliverables
// =============================================================================

export const SPONSOR_DELIVERABLES: SponsorDeliverable[] = [
  { id: 'sd-1', sponsorName: 'Nike', title: 'Courtside lounge activation walk-through', dueDate: 'Today 4:00 PM', status: 'at_risk', owner: 'Partnerships Director', eventId: 'evt-2' },
  { id: 'sd-2', sponsorName: 'Red Bull', title: 'Grid walk branded content drop', dueDate: 'Tomorrow 10:00 AM', status: 'on_track', owner: 'Media Director', eventId: 'evt-2' },
  { id: 'sd-3', sponsorName: 'Pirelli', title: 'Tire analysis segment for broadcast', dueDate: 'Today 1:00 PM', status: 'delivered', owner: 'Broadcast Producer', eventId: 'evt-2' },
  { id: 'sd-4', sponsorName: 'Nike', title: 'Post-race podium branded backdrop', dueDate: 'Sun 4:30 PM', status: 'on_track', owner: 'Ops Coordinator', eventId: 'evt-2' },
];

// =============================================================================
// UNIVERSAL SHEET DATA — Standings Gates (governs official → payout flow)
// =============================================================================

export const STANDINGS_GATES: StandingsGate[] = [
  { id: 'sg-1', label: 'Tech Inspection Cleared', status: 'cleared', owner: 'Chief Inspector', dueTime: 'Sat 11:00 AM' },
  { id: 'sg-2', label: 'Protests Resolved', status: 'pending', owner: 'Chief Steward', dueTime: 'Sun 6:00 PM' },
  { id: 'sg-3', label: 'Safety Incidents Closed', status: 'cleared', owner: 'Safety Director', dueTime: 'Sun 5:00 PM' },
  { id: 'sg-4', label: 'Broadcast Package Locked', status: 'pending', owner: 'Broadcast Producer', dueTime: 'Sun 1:00 PM' },
  { id: 'sg-5', label: 'Payout Inputs Verified', status: 'blocked', owner: 'Finance Officer', dueTime: 'Sun 8:00 PM' },
];

// =============================================================================
// RULES DATA — Categories (K-1 grounded)
// =============================================================================

export const RULE_CATEGORIES: RuleCategory[] = [
  { id: 'rc-1', title: 'Vehicle Eligibility', purpose: 'Define what can enter the championship.', lastUpdated: 'Jan 15, 2026', activeDirectives: 0, visibility: 'public' },
  { id: 'rc-2', title: 'Teams, Entries & Grid', purpose: 'Team structure, entry requirements, grid procedures.', lastUpdated: 'Jan 15, 2026', activeDirectives: 0, visibility: 'public' },
  { id: 'rc-3', title: 'Cost Cap Regulations', purpose: '$10M car-only cost cap. Inside/outside cap definitions.', lastUpdated: 'Mar 1, 2026', activeDirectives: 0, visibility: 'public' },
  { id: 'rc-4', title: 'Sporting Format', purpose: 'Weekend structure, session definitions, points system.', lastUpdated: 'Jan 15, 2026', activeDirectives: 1, visibility: 'public' },
  { id: 'rc-5', title: 'Wildcard System', purpose: '1–2 wildcard slots per event, qualifier process.', lastUpdated: 'Feb 10, 2026', activeDirectives: 0, visibility: 'public' },
  { id: 'rc-6', title: 'Championships & Awards', purpose: 'Drivers, Constructors, Crew championships + awards criteria.', lastUpdated: 'Jan 15, 2026', activeDirectives: 0, visibility: 'public' },
  { id: 'rc-7', title: 'Tech & Compliance Procedures', purpose: 'Scrutineering, clearance statuses, inspection escalation.', lastUpdated: 'Jul 18, 2026', activeDirectives: 0, visibility: 'public' },
  { id: 'rc-8', title: 'Penalties, Protests & Appeals', purpose: 'Filing, evidence, steward panel, sanctions, appeal process.', lastUpdated: 'Jun 22, 2026', activeDirectives: 0, visibility: 'public' },
  { id: 'rc-9', title: 'Media, Rights & Content Rules', purpose: 'Filming, takedowns, broadcast precedence, obligations.', lastUpdated: 'Jan 15, 2026', activeDirectives: 0, visibility: 'public' },
  { id: 'rc-10', title: 'Sponsor & Commercial Obligations', purpose: 'Branding, activation, conflict policy, deliverables.', lastUpdated: 'Jan 15, 2026', activeDirectives: 0, visibility: 'public' },
];

// =============================================================================
// RULES DATA — Active Directives
// =============================================================================

export const ACTIVE_DIRECTIVES: ActiveDirective[] = [
  { id: 'dir-1', title: 'Round 3 — Weather Contingency Schedule Directive', effectiveStart: 'Aug 1, 2026', effectiveEnd: 'Aug 2, 2026', scope: 'All entries', owner: 'Race Director', tags: ['Ops', 'Safety', 'Broadcast'], status: 'draft', impactFlags: ['Blocks Start', 'Broadcast Risk'] },
];

// =============================================================================
// RULES DATA — Interpretations
// =============================================================================

export const RULE_INTERPRETATIONS: RuleInterpretation[] = [
  { id: 'ri-1', ruleRef: 'Cost Cap §4.2', title: 'Treatment of replacement aero kits as spares', summary: 'Replacement aero components used during race weekends count as spares under the inside-cap allocation, not as new development parts.', issuedBy: 'Commissioner', issuedDate: 'Apr 15, 2026', status: 'active', visibility: 'restricted' },
  { id: 'ri-2', ruleRef: 'Sporting Format §2.1', title: 'Red flag restart procedure clarification', summary: 'In the event of a red flag after lap 40, the race will not be restarted if fewer than 10 laps remain. Results will be declared at the last completed lap.', issuedBy: 'Chief Steward', issuedDate: 'Jun 25, 2026', status: 'active', visibility: 'public' },
];

// =============================================================================
// RULES DATA — Change Log
// =============================================================================

export const RULE_CHANGE_LOG: RuleChangeLog[] = [
  { id: 'rcl-1', title: 'Updated scrutineering clearance statuses', type: 'amendment', effectiveDate: 'Jul 18, 2026', approvedBy: 'Commissioner', categories: ['Tech & Compliance'], visibility: 'public' },
  { id: 'rcl-2', title: 'Red flag restart interpretation published', type: 'interpretation', effectiveDate: 'Jun 25, 2026', approvedBy: 'Chief Steward', categories: ['Sporting Format'], visibility: 'public' },
  { id: 'rcl-3', title: 'Unsafe pit release penalty matrix updated', type: 'amendment', effectiveDate: 'Jun 22, 2026', approvedBy: 'Commissioner', categories: ['Penalties, Protests & Appeals'], visibility: 'public' },
  { id: 'rcl-4', title: 'Aero kit cost cap interpretation issued', type: 'interpretation', effectiveDate: 'Apr 15, 2026', approvedBy: 'Commissioner', categories: ['Cost Cap Regulations'], visibility: 'restricted' },
  { id: 'rcl-5', title: 'Wildcard qualifier timing adjusted', type: 'bulletin', effectiveDate: 'Feb 10, 2026', approvedBy: 'Race Director', categories: ['Wildcard System', 'Sporting Format'], visibility: 'public' },
];

// =============================================================================
// DASHBOARD DATA — Ops Tasks
// =============================================================================

export const OPS_TASKS: OpsTask[] = [
  { id: 'ot-1', title: 'Broadcast package lock — missing sponsor slate', owner: 'Broadcast Producer', deadline: 'Today 1:00 PM', status: 'blocker', impactFlags: ['Broadcast Risk', 'Sponsor Risk'], department: 'Broadcast' },
  { id: 'ot-2', title: '2 entries missing compliance docs', owner: 'Compliance Officer', deadline: 'Today 5:00 PM', status: 'blocker', impactFlags: ['Blocks Start', 'Compliance Risk'], department: 'Compliance' },
  { id: 'ot-3', title: 'Grid walk security briefing', owner: 'Ops Coordinator', deadline: 'Tomorrow 8:00 AM', status: 'open', impactFlags: [], department: 'Ops' },
  { id: 'ot-4', title: 'Post-race podium setup verification', owner: 'Ops Coordinator', deadline: 'Sun 12:00 PM', status: 'open', impactFlags: [], department: 'Ops' },
  { id: 'ot-5', title: 'Fire suppression re-certification', owner: 'Safety Director', deadline: 'Today 5:00 PM', status: 'open', impactFlags: ['Safety Risk'], department: 'Safety' },
];

// =============================================================================
// DASHBOARD DATA — Announcements
// =============================================================================

export const ANNOUNCEMENTS: Announcement[] = [
  { id: 'ann-1', title: 'Weather Contingency — Portland Round', severity: 'important', audience: 'teams', content: 'Potential thunderstorms forecast for Sunday. Contingency schedule under review.', postedAt: 'Jul 30, 2026' },
  { id: 'ann-2', title: 'Qualifying Format Update', severity: 'info', audience: 'public', content: 'Q1/Q2/Q3 knockout qualifying confirmed for all remaining rounds.', postedAt: 'Jul 28, 2026' },
  { id: 'ann-3', title: 'Fire Suppression Certification Notice', severity: 'urgent', audience: 'staff', content: 'Annual fire suppression re-certification overdue. Must be resolved before race day.', postedAt: 'Jul 29, 2026' },
];

// =============================================================================
// DASHBOARD DATA — Staff Directory
// =============================================================================

export const STAFF_DIRECTORY: StaffMember[] = [
  { id: 'staff-1', name: 'Sarah Nakamura', role: 'Chief Steward', department: 'Integrity', contactEmail: 's.nakamura@k1racing.com' },
  { id: 'staff-2', name: 'James Wright', role: 'Race Director', department: 'Racing Ops', contactEmail: 'j.wright@k1racing.com' },
  { id: 'staff-3', name: 'Maria Rodriguez', role: 'Media Director', department: 'Broadcast & Media', contactEmail: 'm.rodriguez@k1racing.com' },
  { id: 'staff-4', name: 'Kenji Tanaka', role: 'Chief Inspector', department: 'Tech & Compliance', contactEmail: 'k.tanaka@k1racing.com' },
  { id: 'staff-5', name: 'Lisa Chen', role: 'Partnerships Director', department: 'Commercial', contactEmail: 'l.chen@k1racing.com' },
  { id: 'staff-6', name: 'David Kim', role: 'Finance Officer', department: 'Finance', contactEmail: 'd.kim@k1racing.com' },
  { id: 'staff-7', name: 'Alex Okafor', role: 'Safety Director', department: 'Safety', contactEmail: 'a.okafor@k1racing.com' },
  { id: 'staff-8', name: 'Priya Sharma', role: 'Ops Coordinator', department: 'Event Ops', contactEmail: 'p.sharma@k1racing.com' },
];

// =============================================================================
// HELPERS
// =============================================================================

export function getSeriesById(id: string): SeriesObject | undefined {
  return SERIES_LIST.find((s) => s.id === id);
}

export function getEntrantsBySeries(seriesId: string): EntrantObject[] {
  return ENTRANT_LIST.filter((e) => e.seriesId === seriesId);
}

export function getEventsBySeries(seriesId: string): EventObject[] {
  return EVENT_LIST.filter((e) => e.seriesId === seriesId);
}

export function getSessionsByEvent(eventId: string): EventSession[] {
  return EVENT_SESSIONS.filter((s) => s.eventId === eventId);
}

export function getIncidentsByEvent(eventId: string): EventIncident[] {
  return EVENT_INCIDENTS.filter((i) => i.eventId === eventId);
}

export function getAtRiskEntrants(): EntrantObject[] {
  return ENTRANT_LIST.filter((e) => e.atRiskFlags.length > 0 || e.status === 'under_review');
}

export function getBlockerTasks(): OpsTask[] {
  return OPS_TASKS.filter((t) => t.status === 'blocker');
}

export function getUpcomingDeliverables(): SponsorDeliverable[] {
  return SPONSOR_DELIVERABLES.filter((d) => d.status !== 'delivered');
}
