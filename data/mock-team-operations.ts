/**
 * Mock Team Operations Data — Staff, Operations, Finance, Compliance, Lineups, Systems
 * Used by Team Sheet tabs that are R1-only or limited visibility.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface StaffMember {
  name: string;
  title: string;
  role: 'head_coach' | 'assistant' | 'operations' | 'support' | 'admin';
  email: string;
  phone: string;
}

export interface TravelEntry {
  date: string;
  opponent: string;
  departure: string;
  arrival: string;
  hotel?: string;
  status: 'confirmed' | 'pending' | 'tentative';
}

export interface FacilityItem {
  name: string;
  status: 'available' | 'maintenance' | 'reserved';
  nextAvailable?: string;
}

export interface EquipmentItem {
  category: string;
  item: string;
  condition: 'good' | 'fair' | 'replace';
  quantity: number;
}

export interface OperationsData {
  travel: TravelEntry[];
  facilities: FacilityItem[];
  equipment: EquipmentItem[];
}

export interface BudgetLine {
  category: string;
  allocated: number;
  spent: number;
}

export interface FinanceData {
  totalBudget: number;
  breakdown: BudgetLine[];
  scholarshipTotal: number;
  nilPoolTotal: number;
  revenueYTD: number;
}

export interface ComplianceItem {
  id: string;
  label: string;
  status: 'clear' | 'pending' | 'violation';
  date: string;
  note?: string;
}

export interface ComplianceData {
  checklist: ComplianceItem[];
  incidentLog: ComplianceItem[];
}

export interface LineupPlayer {
  jersey: string;
  name: string;
  position: string;
  minutes: number;
}

export interface LineupPreset {
  name: string;
  players: LineupPlayer[];
  netRating: number;
  minutesTogether: number;
}

export interface SystemsData {
  offensiveSystem: { label: string; description: string };
  defensiveSystem: { label: string; description: string };
  tempo: { label: string; possPerGame: number };
}

// =============================================================================
// STAFF
// =============================================================================

export const FMU_STAFF: StaffMember[] = [
  { name: 'Sammy Kalejaiye', title: 'Head Coach / GM', role: 'head_coach', email: 'skalejaiye@fmu.edu', phone: '(305) 555-0100' },
  { name: 'Marcus Williams', title: 'Associate Head Coach', role: 'assistant', email: 'mwilliams@fmu.edu', phone: '(305) 555-0101' },
  { name: 'James Robinson', title: 'Assistant Coach — Defense', role: 'assistant', email: 'jrobinson@fmu.edu', phone: '(305) 555-0102' },
  { name: 'David Thompson', title: 'Assistant Coach — Player Development', role: 'assistant', email: 'dthompson@fmu.edu', phone: '(305) 555-0103' },
  { name: 'Alex Rivera', title: 'Recruiting Coordinator', role: 'assistant', email: 'arivera@fmu.edu', phone: '(305) 555-0104' },
  { name: 'Chris Morgan', title: 'Director of Basketball Operations', role: 'operations', email: 'cmorgan@fmu.edu', phone: '(305) 555-0105' },
  { name: 'Sarah Johnson', title: 'Athletic Trainer', role: 'support', email: 'sjohnson@fmu.edu', phone: '(305) 555-0106' },
  { name: 'Michael Davis', title: 'Strength & Conditioning Coach', role: 'support', email: 'mdavis@fmu.edu', phone: '(305) 555-0107' },
  { name: 'Rachel Kim', title: 'Video Coordinator', role: 'operations', email: 'rkim@fmu.edu', phone: '(305) 555-0108' },
  { name: 'Jordan Peters', title: 'Team Manager', role: 'operations', email: 'jpeters@fmu.edu', phone: '(305) 555-0109' },
];

// =============================================================================
// OPERATIONS
// =============================================================================

export const FMU_OPERATIONS: OperationsData = {
  travel: [
    { date: '2026-02-21', opponent: 'Webber International', departure: '8:00 AM', arrival: '11:30 AM', hotel: 'Holiday Inn Babson Park', status: 'confirmed' },
    { date: '2026-02-25', opponent: 'Ave Maria', departure: '7:00 AM', arrival: '9:30 AM', status: 'confirmed' },
    { date: '2026-03-01', opponent: 'Warner', departure: '10:00 AM', arrival: '2:00 PM', hotel: 'Comfort Inn Lake Wales', status: 'pending' },
  ],
  facilities: [
    { name: 'Main Court — Pratt Whitney Center', status: 'available' },
    { name: 'Practice Gym B', status: 'available' },
    { name: 'Weight Room', status: 'available' },
    { name: 'Film Room', status: 'reserved', nextAvailable: '2026-02-17 3:00 PM' },
    { name: 'Training Room', status: 'available' },
  ],
  equipment: [
    { category: 'Basketballs', item: 'Game balls (Wilson Evolution)', condition: 'good', quantity: 24 },
    { category: 'Basketballs', item: 'Practice balls', condition: 'fair', quantity: 36 },
    { category: 'Uniforms', item: 'Home jerseys', condition: 'good', quantity: 17 },
    { category: 'Uniforms', item: 'Away jerseys', condition: 'good', quantity: 17 },
    { category: 'Training', item: 'Resistance bands', condition: 'fair', quantity: 20 },
    { category: 'Training', item: 'Shooting machine', condition: 'good', quantity: 1 },
    { category: 'Technology', item: 'iPads (film review)', condition: 'good', quantity: 8 },
    { category: 'Technology', item: 'Shot tracking sensors', condition: 'replace', quantity: 4 },
  ],
};

// =============================================================================
// FINANCE
// =============================================================================

export const FMU_FINANCE: FinanceData = {
  totalBudget: 485000,
  breakdown: [
    { category: 'Scholarships & Aid', allocated: 180000, spent: 162000 },
    { category: 'Recruiting', allocated: 45000, spent: 31200 },
    { category: 'Travel', allocated: 72000, spent: 54800 },
    { category: 'Equipment & Uniforms', allocated: 28000, spent: 22500 },
    { category: 'Operations', allocated: 65000, spent: 48700 },
    { category: 'Staff Salaries', allocated: 55000, spent: 45800 },
    { category: 'Performance (Training)', allocated: 25000, spent: 18400 },
    { category: 'Miscellaneous', allocated: 15000, spent: 8200 },
  ],
  scholarshipTotal: 180000,
  nilPoolTotal: 42000,
  revenueYTD: 128000,
};

// =============================================================================
// COMPLIANCE
// =============================================================================

export const FMU_COMPLIANCE: ComplianceData = {
  checklist: [
    { id: 'c1', label: 'APR Report Filed', status: 'clear', date: '2026-01-15' },
    { id: 'c2', label: 'EADA Report Filed', status: 'clear', date: '2025-10-15' },
    { id: 'c3', label: 'Roster Certifications', status: 'clear', date: '2025-11-01' },
    { id: 'c4', label: 'NIL Disclosure Review', status: 'pending', date: '2026-03-01', note: 'Due March 1 — 2 players pending disclosure' },
    { id: 'c5', label: 'Drug Testing Schedule', status: 'clear', date: '2026-01-20' },
    { id: 'c6', label: 'Title IX Compliance', status: 'clear', date: '2025-09-01' },
  ],
  incidentLog: [
    { id: 'i1', label: 'Practice hours exceeded (Week 4)', status: 'violation', date: '2025-10-08', note: 'Exceeded 20-hr weekly limit by 45 min. Self-reported, corrective action taken.' },
    { id: 'i2', label: 'Recruiting contact — dead period', status: 'clear', date: '2025-12-28', note: 'Reviewed and cleared — contact initiated by prospect family, documented.' },
  ],
};

// =============================================================================
// LINEUPS
// =============================================================================

export const FMU_LINEUPS: LineupPreset[] = [
  {
    name: 'Starting Five',
    players: [
      { jersey: '4', name: 'Carter', position: 'PG', minutes: 32 },
      { jersey: '13', name: 'Noel', position: 'CG', minutes: 30 },
      { jersey: '11', name: 'Mentor', position: 'W', minutes: 28 },
      { jersey: '41', name: 'Brewer', position: 'F', minutes: 26 },
      { jersey: '5', name: 'Selden', position: 'B', minutes: 28 },
    ],
    netRating: 8.4,
    minutesTogether: 412,
  },
  {
    name: 'Bench Mob',
    players: [
      { jersey: '15', name: 'Morgan', position: 'PG', minutes: 16 },
      { jersey: '55', name: 'Munir-Jones', position: 'CG', minutes: 18 },
      { jersey: '0', name: 'Thomas', position: 'W', minutes: 20 },
      { jersey: '7', name: 'Moratinos', position: 'F', minutes: 14 },
      { jersey: '1', name: 'Asceric', position: 'B', minutes: 12 },
    ],
    netRating: -2.1,
    minutesTogether: 186,
  },
  {
    name: 'Closing Lineup',
    players: [
      { jersey: '4', name: 'Carter', position: 'PG', minutes: 8 },
      { jersey: '13', name: 'Noel', position: 'CG', minutes: 8 },
      { jersey: '11', name: 'Mentor', position: 'W', minutes: 8 },
      { jersey: '41', name: 'Brewer', position: 'F', minutes: 8 },
      { jersey: '5', name: 'Selden', position: 'B', minutes: 8 },
    ],
    netRating: 12.6,
    minutesTogether: 88,
  },
  {
    name: 'Small Ball',
    players: [
      { jersey: '4', name: 'Carter', position: 'PG', minutes: 6 },
      { jersey: '11', name: 'Mentor', position: 'CG', minutes: 6 },
      { jersey: '13', name: 'Noel', position: 'W', minutes: 6 },
      { jersey: '55', name: 'Munir-Jones', position: 'F', minutes: 6 },
      { jersey: '41', name: 'Brewer', position: 'B', minutes: 6 },
    ],
    netRating: 5.2,
    minutesTogether: 64,
  },
];

// =============================================================================
// SYSTEMS
// =============================================================================

export const FMU_SYSTEMS: SystemsData = {
  offensiveSystem: {
    label: 'Motion Flow',
    description: 'Read-and-react motion offense with PnR triggers. Emphasizes ball movement, back cuts, and DHO actions. Primary ball handler initiates; 4-out-1-in spacing.',
  },
  defensiveSystem: {
    label: 'Switching Man-to-Man',
    description: 'Aggressive switching defense on all screens above the FT line. Drop coverage on big-to-big screens. Help-side rotation emphasis with strong closeouts.',
  },
  tempo: {
    label: 'Moderate Push',
    possPerGame: 68.5,
  },
};

// =============================================================================
// MOCK GAME-DAY REVENUE (for AD Overlay)
// =============================================================================

export interface GameDayRevenue {
  ticketSales: number;
  concessions: number;
  merchandise: number;
  sponsorActivations: number;
  total: number;
  attendance: number;
  capacity: number;
}

export function getGameDayRevenue(gameId: string): GameDayRevenue {
  // Deterministic revenue based on gameId hash
  let h = 0;
  for (let i = 0; i < gameId.length; i++) h = ((h << 5) - h + gameId.charCodeAt(i)) | 0;
  h = Math.abs(h);
  const attendance = 800 + (h % 1200);
  const capacity = 2500;
  return {
    ticketSales: 4000 + (h % 6000),
    concessions: 1200 + (h % 2000),
    merchandise: 500 + (h % 1500),
    sponsorActivations: 2000 + (h % 3000),
    total: 7700 + (h % 12500),
    attendance,
    capacity,
  };
}

// =============================================================================
// MOCK INCIDENTS (for Game Sheet)
// =============================================================================

export interface IncidentReport {
  id: string;
  type: 'ejection' | 'fan_conduct' | 'facility' | 'medical' | 'official';
  description: string;
  time: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
}

export function getGameIncidents(gameId: string): IncidentReport[] {
  // Most games have no incidents; a few have 1-2
  let h = 0;
  for (let i = 0; i < gameId.length; i++) h = ((h << 5) - h + gameId.charCodeAt(i)) | 0;
  if (Math.abs(h) % 4 !== 0) return [];
  return [
    {
      id: `inc-${gameId}-1`,
      type: 'fan_conduct',
      description: 'Fan removed from section 4 for verbal abuse of officials',
      time: '2nd Half — 8:32',
      severity: 'low',
      resolved: true,
    },
  ];
}
