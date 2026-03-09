/**
 * Mock data for Roster screen — sports mode.
 * 3 pages: Players, Management, Board.
 * Pattern follows data/mock-parish.ts / data/mock-office.ts.
 */

// ── Page 0: Players ──

export type PlayerPosition = 'PG' | 'CG' | 'W' | 'F' | 'B';
export type ScholarshipType = 'full' | 'partial' | 'walk-on';
export type EligibilityStatus = 'eligible' | 'warning' | 'ineligible';
export type HealthStatus = 'healthy' | 'day-to-day' | 'out';
export type PlayerFilter = 'all' | 'PG' | 'CG' | 'W' | 'F' | 'B';
export type PlayerSort = 'kr' | 'position' | 'name' | 'class' | 'number';

export interface RosterSummary {
  totalPlayers: number;
  positionBreakdown: Record<PlayerPosition, number>;
  scholarshipCount: number;
}

export interface RosterPlayerItem {
  id: string;
  name: string;
  initials: string;
  jerseyNumber: string;
  position: PlayerPosition;
  krRating: number;
  classYear: string;
  height: string;
  weight: number;
  scholarship: ScholarshipType;
  eligibility: EligibilityStatus;
  health: HealthStatus;
  imageUri: string | null;
}

// ── Page 1: Management ──

export type ManagementSection = 'scholarships' | 'eligibility' | 'health' | 'squads' | 'housing' | 'nil' | 'compliance';

export interface ScholarshipEntry {
  id: string;
  playerName: string;
  initials: string;
  type: ScholarshipType;
  amount: string;
  renewalDate: string;
  status: 'active' | 'expiring' | 'renewed';
}

export interface EligibilityEntry {
  id: string;
  playerName: string;
  initials: string;
  gpa: number;
  creditsCompleted: number;
  creditsNeeded: number;
  status: EligibilityStatus;
}

export interface HealthEntry {
  id: string;
  playerName: string;
  initials: string;
  status: HealthStatus;
  injuryDetail: string | null;
  returnTimeline: string | null;
}

export type SquadType = 'varsity' | 'jv' | 'practice' | 'redshirt' | 'inactive';

export interface SquadEntry {
  id: string;
  playerName: string;
  initials: string;
  position: PlayerPosition;
  squad: SquadType;
  classYear: string;
}

export interface HousingEntry {
  id: string;
  playerName: string;
  initials: string;
  building: string;
  room: string;
  roommate: string | null;
  rentStatus: 'paid' | 'due' | 'overdue' | null;
}

export type NILStatus = 'active' | 'pending' | 'completed' | 'expired';
export type ComplianceStatus = 'approved' | 'under-review' | 'flagged';

export interface NILEntry {
  id: string;
  playerName: string;
  initials: string;
  dealName: string;
  brandName: string;
  dealValue: string;
  nilStatus: NILStatus;
  complianceStatus: ComplianceStatus;
}

export interface ComplianceItem {
  id: string;
  category: string;
  metric: string;
  current: string;
  limit: string;
  status: 'ok' | 'warning' | 'violation';
}

// ── Page 2: Board ──

export type PipelineStage = 'watching' | 'contacted' | 'visited' | 'offered' | 'committed';
export type ProspectFilter = 'all' | 'by-position' | 'by-class' | 'by-level' | 'portal';

export interface ProspectCard {
  id: string;
  name: string;
  initials: string;
  position: PlayerPosition;
  krRating: number;
  currentSchool: string;
  level: string;
  classYear: string;
  stage: PipelineStage;
  inPortal: boolean;
  lastAction: string;
}

// ── Mock Data ──

export const ROSTER_SUMMARY: RosterSummary = {
  totalPlayers: 17,
  positionBreakdown: { PG: 3, CG: 3, W: 4, F: 4, B: 3 },
  scholarshipCount: 13,
};

export const ROSTER_PLAYERS: RosterPlayerItem[] = [
  { id: 'rp1',  name: 'Jaylen Carter',     initials: 'JC', jerseyNumber: '1',  position: 'PG', krRating: 82, classYear: 'Jr.',  height: "6'1",  weight: 185, scholarship: 'full',    eligibility: 'eligible',   health: 'healthy',    imageUri: null },
  { id: 'rp2',  name: 'Marcus Thompson',    initials: 'MT', jerseyNumber: '3',  position: 'CG', krRating: 78, classYear: 'Sr.',  height: "6'3",  weight: 195, scholarship: 'full',    eligibility: 'eligible',   health: 'healthy',    imageUri: null },
  { id: 'rp3',  name: 'DeAndre Williams',   initials: 'DW', jerseyNumber: '5',  position: 'W',  krRating: 75, classYear: 'So.',  height: "6'5",  weight: 210, scholarship: 'full',    eligibility: 'eligible',   health: 'day-to-day', imageUri: null },
  { id: 'rp4',  name: 'Terrence Brooks',    initials: 'TB', jerseyNumber: '10', position: 'F',  krRating: 80, classYear: 'Jr.',  height: "6'7",  weight: 225, scholarship: 'full',    eligibility: 'eligible',   health: 'healthy',    imageUri: null },
  { id: 'rp5',  name: 'Andre Mitchell',     initials: 'AM', jerseyNumber: '12', position: 'B',  krRating: 76, classYear: 'Sr.',  height: "6'9",  weight: 245, scholarship: 'full',    eligibility: 'eligible',   health: 'healthy',    imageUri: null },
  { id: 'rp6',  name: 'Khalil Johnson',     initials: 'KJ', jerseyNumber: '15', position: 'PG', krRating: 68, classYear: 'Fr.',  height: "6'0",  weight: 175, scholarship: 'partial', eligibility: 'eligible',   health: 'healthy',    imageUri: null },
  { id: 'rp7',  name: 'Darius Washington',  initials: 'DWa',jerseyNumber: '20', position: 'CG', krRating: 72, classYear: 'So.',  height: "6'4",  weight: 200, scholarship: 'full',    eligibility: 'warning',    health: 'healthy',    imageUri: null },
  { id: 'rp8',  name: 'Isaiah Green',       initials: 'IG', jerseyNumber: '22', position: 'W',  krRating: 70, classYear: 'Jr.',  height: "6'6",  weight: 215, scholarship: 'full',    eligibility: 'eligible',   health: 'healthy',    imageUri: null },
  { id: 'rp9',  name: 'Cameron Davis',      initials: 'CD', jerseyNumber: '24', position: 'F',  krRating: 74, classYear: 'So.',  height: "6'8",  weight: 230, scholarship: 'full',    eligibility: 'eligible',   health: 'out',        imageUri: null },
  { id: 'rp10', name: 'Xavier Brown',       initials: 'XB', jerseyNumber: '30', position: 'B',  krRating: 66, classYear: 'Fr.',  height: "6'10", weight: 250, scholarship: 'partial', eligibility: 'eligible',   health: 'healthy',    imageUri: null },
  { id: 'rp11', name: 'Jordan Harris',      initials: 'JH', jerseyNumber: '32', position: 'W',  krRating: 64, classYear: 'Fr.',  height: "6'5",  weight: 205, scholarship: 'walk-on', eligibility: 'eligible',   health: 'healthy',    imageUri: null },
  { id: 'rp12', name: 'Brandon Lee',        initials: 'BL', jerseyNumber: '33', position: 'F',  krRating: 71, classYear: 'Gr.',  height: "6'7",  weight: 235, scholarship: 'full',    eligibility: 'eligible',   health: 'healthy',    imageUri: null },
  { id: 'rp13', name: 'Tyler Robinson',     initials: 'TR', jerseyNumber: '35', position: 'B',  krRating: 60, classYear: 'So.',  height: "6'9",  weight: 240, scholarship: 'partial', eligibility: 'ineligible', health: 'healthy',    imageUri: null },
  { id: 'rp14', name: 'Malik Foster',       initials: 'MF', jerseyNumber: '4',  position: 'PG', krRating: 58, classYear: 'Fr.',  height: "5'11", weight: 170, scholarship: 'walk-on', eligibility: 'eligible',   health: 'healthy',    imageUri: null },
  { id: 'rp15', name: 'Devon Clark',        initials: 'DC', jerseyNumber: '11', position: 'CG', krRating: 55, classYear: 'So.',  height: "6'2",  weight: 190, scholarship: 'walk-on', eligibility: 'warning',    health: 'healthy',    imageUri: null },
  { id: 'rp16', name: 'Ryan Simmons',       initials: 'RS', jerseyNumber: '21', position: 'W',  krRating: 62, classYear: 'Jr.',  height: "6'4",  weight: 210, scholarship: 'walk-on', eligibility: 'eligible',   health: 'day-to-day', imageUri: null },
  { id: 'rp17', name: 'Aaron White',        initials: 'AW', jerseyNumber: '44', position: 'F',  krRating: 50, classYear: 'Fr.',  height: "6'6",  weight: 220, scholarship: 'partial', eligibility: 'eligible',   health: 'healthy',    imageUri: null },
];

export const SCHOLARSHIP_ENTRIES: ScholarshipEntry[] = [
  { id: 'sc1', playerName: 'Jaylen Carter',    initials: 'JC', type: 'full',    amount: '$42,000', renewalDate: 'Aug 2026', status: 'active' },
  { id: 'sc2', playerName: 'Marcus Thompson',  initials: 'MT', type: 'full',    amount: '$42,000', renewalDate: 'May 2026', status: 'expiring' },
  { id: 'sc3', playerName: 'Terrence Brooks',  initials: 'TB', type: 'full',    amount: '$42,000', renewalDate: 'Aug 2026', status: 'active' },
  { id: 'sc4', playerName: 'Andre Mitchell',   initials: 'AM', type: 'full',    amount: '$42,000', renewalDate: 'May 2026', status: 'expiring' },
  { id: 'sc5', playerName: 'Khalil Johnson',   initials: 'KJ', type: 'partial', amount: '$21,000', renewalDate: 'Aug 2027', status: 'renewed' },
  { id: 'sc6', playerName: 'Darius Washington',initials: 'DWa',type: 'full',    amount: '$42,000', renewalDate: 'Aug 2026', status: 'active' },
  { id: 'sc7', playerName: 'Xavier Brown',     initials: 'XB', type: 'partial', amount: '$28,000', renewalDate: 'Aug 2027', status: 'active' },
  { id: 'sc8', playerName: 'Aaron White',      initials: 'AW', type: 'partial', amount: '$18,000', renewalDate: 'Aug 2027', status: 'active' },
];

export const ELIGIBILITY_ENTRIES: EligibilityEntry[] = [
  { id: 'el1', playerName: 'Darius Washington', initials: 'DWa', gpa: 2.1,  creditsCompleted: 45, creditsNeeded: 60, status: 'warning' },
  { id: 'el2', playerName: 'Tyler Robinson',    initials: 'TR',  gpa: 1.8,  creditsCompleted: 30, creditsNeeded: 60, status: 'ineligible' },
  { id: 'el3', playerName: 'Devon Clark',       initials: 'DC',  gpa: 2.0,  creditsCompleted: 28, creditsNeeded: 60, status: 'warning' },
  { id: 'el4', playerName: 'Jaylen Carter',     initials: 'JC',  gpa: 3.4,  creditsCompleted: 85, creditsNeeded: 120, status: 'eligible' },
  { id: 'el5', playerName: 'Terrence Brooks',   initials: 'TB',  gpa: 3.1,  creditsCompleted: 80, creditsNeeded: 120, status: 'eligible' },
  { id: 'el6', playerName: 'Brandon Lee',       initials: 'BL',  gpa: 2.9,  creditsCompleted: 130, creditsNeeded: 120, status: 'eligible' },
];

export const HEALTH_ENTRIES: HealthEntry[] = [
  { id: 'he1', playerName: 'DeAndre Williams',  initials: 'DW', status: 'day-to-day', injuryDetail: 'Ankle sprain (left)',   returnTimeline: '2-3 days' },
  { id: 'he2', playerName: 'Cameron Davis',     initials: 'CD', status: 'out',        injuryDetail: 'ACL tear (right knee)', returnTimeline: '6-8 months' },
  { id: 'he3', playerName: 'Ryan Simmons',      initials: 'RS', status: 'day-to-day', injuryDetail: 'Hamstring tightness',   returnTimeline: '1-2 days' },
  { id: 'he4', playerName: 'Jaylen Carter',     initials: 'JC', status: 'healthy',    injuryDetail: null,                    returnTimeline: null },
  { id: 'he5', playerName: 'Terrence Brooks',   initials: 'TB', status: 'healthy',    injuryDetail: null,                    returnTimeline: null },
];

export const SQUAD_ENTRIES: SquadEntry[] = [
  { id: 'sq1',  playerName: 'Jaylen Carter',    initials: 'JC',  position: 'PG', squad: 'varsity',  classYear: 'Jr.' },
  { id: 'sq2',  playerName: 'Marcus Thompson',  initials: 'MT',  position: 'CG', squad: 'varsity',  classYear: 'Sr.' },
  { id: 'sq3',  playerName: 'DeAndre Williams', initials: 'DW',  position: 'W',  squad: 'varsity',  classYear: 'So.' },
  { id: 'sq4',  playerName: 'Terrence Brooks',  initials: 'TB',  position: 'F',  squad: 'varsity',  classYear: 'Jr.' },
  { id: 'sq5',  playerName: 'Andre Mitchell',   initials: 'AM',  position: 'B',  squad: 'varsity',  classYear: 'Sr.' },
  { id: 'sq6',  playerName: 'Darius Washington',initials: 'DWa', position: 'CG', squad: 'varsity',  classYear: 'So.' },
  { id: 'sq7',  playerName: 'Isaiah Green',     initials: 'IG',  position: 'W',  squad: 'varsity',  classYear: 'Jr.' },
  { id: 'sq8',  playerName: 'Cameron Davis',    initials: 'CD',  position: 'F',  squad: 'inactive', classYear: 'So.' },
  { id: 'sq9',  playerName: 'Brandon Lee',      initials: 'BL',  position: 'F',  squad: 'varsity',  classYear: 'Gr.' },
  { id: 'sq10', playerName: 'Khalil Johnson',   initials: 'KJ',  position: 'PG', squad: 'jv',       classYear: 'Fr.' },
  { id: 'sq11', playerName: 'Xavier Brown',     initials: 'XB',  position: 'B',  squad: 'jv',       classYear: 'Fr.' },
  { id: 'sq12', playerName: 'Jordan Harris',    initials: 'JH',  position: 'W',  squad: 'practice', classYear: 'Fr.' },
  { id: 'sq13', playerName: 'Tyler Robinson',   initials: 'TR',  position: 'B',  squad: 'inactive', classYear: 'So.' },
  { id: 'sq14', playerName: 'Malik Foster',     initials: 'MF',  position: 'PG', squad: 'practice', classYear: 'Fr.' },
  { id: 'sq15', playerName: 'Devon Clark',      initials: 'DC',  position: 'CG', squad: 'jv',       classYear: 'So.' },
  { id: 'sq16', playerName: 'Ryan Simmons',     initials: 'RS',  position: 'W',  squad: 'varsity',  classYear: 'Jr.' },
  { id: 'sq17', playerName: 'Aaron White',      initials: 'AW',  position: 'F',  squad: 'redshirt', classYear: 'Fr.' },
];

export const HOUSING_ENTRIES: HousingEntry[] = [
  { id: 'ho1',  playerName: 'Jaylen Carter',    initials: 'JC',  building: 'Eagle Hall',   room: '204A', roommate: 'Marcus Thompson',  rentStatus: 'paid' },
  { id: 'ho2',  playerName: 'Marcus Thompson',  initials: 'MT',  building: 'Eagle Hall',   room: '204A', roommate: 'Jaylen Carter',    rentStatus: 'paid' },
  { id: 'ho3',  playerName: 'DeAndre Williams', initials: 'DW',  building: 'Eagle Hall',   room: '310B', roommate: 'Isaiah Green',     rentStatus: 'paid' },
  { id: 'ho4',  playerName: 'Terrence Brooks',  initials: 'TB',  building: 'Falcon Court', room: '102',  roommate: 'Brandon Lee',      rentStatus: 'due' },
  { id: 'ho5',  playerName: 'Andre Mitchell',   initials: 'AM',  building: 'Falcon Court', room: '105',  roommate: null,               rentStatus: 'paid' },
  { id: 'ho6',  playerName: 'Khalil Johnson',   initials: 'KJ',  building: 'Hawk Suites',  room: '412',  roommate: 'Xavier Brown',     rentStatus: 'paid' },
  { id: 'ho7',  playerName: 'Xavier Brown',     initials: 'XB',  building: 'Hawk Suites',  room: '412',  roommate: 'Khalil Johnson',   rentStatus: 'overdue' },
  { id: 'ho8',  playerName: 'Cameron Davis',    initials: 'CD',  building: 'Falcon Court', room: '108',  roommate: 'Aaron White',      rentStatus: 'paid' },
  { id: 'ho9',  playerName: 'Jordan Harris',    initials: 'JH',  building: 'Hawk Suites',  room: '305',  roommate: 'Malik Foster',     rentStatus: 'paid' },
  { id: 'ho10', playerName: 'Malik Foster',     initials: 'MF',  building: 'Hawk Suites',  room: '305',  roommate: 'Jordan Harris',    rentStatus: 'due' },
];

export const NIL_ENTRIES: NILEntry[] = [
  { id: 'ni1', playerName: 'Jaylen Carter',    initials: 'JC', dealName: 'Social Media Campaign', brandName: 'Nike Basketball',     dealValue: '$15,000', nilStatus: 'active',    complianceStatus: 'approved' },
  { id: 'ni2', playerName: 'Marcus Thompson',  initials: 'MT', dealName: 'Autograph Signing',     brandName: 'Local Auto Dealer',   dealValue: '$3,500',  nilStatus: 'completed', complianceStatus: 'approved' },
  { id: 'ni3', playerName: 'Terrence Brooks',  initials: 'TB', dealName: 'Camp Appearance',        brandName: 'Elite Hoops Academy', dealValue: '$5,000',  nilStatus: 'active',    complianceStatus: 'approved' },
  { id: 'ni4', playerName: 'DeAndre Williams', initials: 'DW', dealName: 'Brand Ambassador',       brandName: 'Gatorade',            dealValue: '$8,000',  nilStatus: 'pending',   complianceStatus: 'under-review' },
  { id: 'ni5', playerName: 'Andre Mitchell',   initials: 'AM', dealName: 'Podcast Appearance',     brandName: 'Courtside Pod',       dealValue: '$1,200',  nilStatus: 'expired',   complianceStatus: 'approved' },
  { id: 'ni6', playerName: 'Jaylen Carter',    initials: 'JC', dealName: 'Trading Card Deal',      brandName: 'Panini',              dealValue: '$12,000', nilStatus: 'pending',   complianceStatus: 'flagged' },
];

export const COMPLIANCE_ITEMS: ComplianceItem[] = [
  { id: 'co1', category: 'Roster',     metric: 'Active Roster Size',      current: '15',     limit: '15',     status: 'ok' },
  { id: 'co2', category: 'Roster',     metric: 'Total Roster Size',       current: '17',     limit: '20',     status: 'ok' },
  { id: 'co3', category: 'Scholarship',metric: 'Scholarships Awarded',    current: '13',     limit: '13',     status: 'warning' },
  { id: 'co4', category: 'Practice',   metric: 'Weekly Practice Hours',   current: '18',     limit: '20',     status: 'ok' },
  { id: 'co5', category: 'Academic',   metric: 'Players Below 2.0 GPA',   current: '1',      limit: '0',      status: 'violation' },
  { id: 'co6', category: 'NIL',        metric: 'Pending NIL Reviews',     current: '2',      limit: 'N/A',    status: 'warning' },
  { id: 'co7', category: 'Housing',    metric: 'Overdue Rent Payments',   current: '1',      limit: '0',      status: 'violation' },
];

export const PIPELINE_COUNTS: Record<PipelineStage, number> = {
  watching: 4,
  contacted: 3,
  visited: 2,
  offered: 2,
  committed: 1,
};

export const PROSPECTS: ProspectCard[] = [
  { id: 'pr1',  name: 'Trevon Adams',     initials: 'TA', position: 'PG', krRating: 85, currentSchool: 'Lincoln Prep',           level: 'HS',   classYear: '2027', stage: 'watching',   inPortal: false, lastAction: 'Added 5 days ago' },
  { id: 'pr2',  name: 'DeSean Moore',     initials: 'DM', position: 'W',  krRating: 79, currentSchool: 'West Oak Academy',       level: 'HS',   classYear: '2027', stage: 'watching',   inPortal: false, lastAction: 'Film reviewed 2 days ago' },
  { id: 'pr3',  name: 'Isaiah Patterson', initials: 'IP', position: 'F',  krRating: 72, currentSchool: 'Coastal CC',             level: 'JUCO', classYear: '2026', stage: 'watching',   inPortal: false, lastAction: 'Added 1 week ago' },
  { id: 'pr4',  name: 'Ahmad Jackson',    initials: 'AJ', position: 'B',  krRating: 68, currentSchool: 'Summit Christian',       level: 'HS',   classYear: '2027', stage: 'watching',   inPortal: false, lastAction: 'Added 3 days ago' },
  { id: 'pr5',  name: 'Marcus Reed',      initials: 'MR', position: 'CG', krRating: 81, currentSchool: 'Metro State',            level: 'D2',   classYear: '2026', stage: 'contacted',  inPortal: true,  lastAction: 'Contacted 3 days ago' },
  { id: 'pr6',  name: 'Kevin Okafor',     initials: 'KO', position: 'F',  krRating: 77, currentSchool: 'Heritage Christian',     level: 'NAIA', classYear: '2026', stage: 'contacted',  inPortal: true,  lastAction: 'Called 1 day ago' },
  { id: 'pr7',  name: 'Jamal Woods',      initials: 'JW', position: 'PG', krRating: 83, currentSchool: 'Valley Central',         level: 'HS',   classYear: '2027', stage: 'contacted',  inPortal: false, lastAction: 'Email sent 2 days ago' },
  { id: 'pr8',  name: 'Chris Daniels',    initials: 'CDa',position: 'W',  krRating: 80, currentSchool: 'Eastside Prep',          level: 'HS',   classYear: '2027', stage: 'visited',    inPortal: false, lastAction: 'Campus visit Mar 5' },
  { id: 'pr9',  name: 'Devon Taylor',     initials: 'DT', position: 'B',  krRating: 74, currentSchool: 'Lakeside CC',            level: 'JUCO', classYear: '2026', stage: 'visited',    inPortal: false, lastAction: 'Campus visit Mar 1' },
  { id: 'pr10', name: 'Elijah Foster',    initials: 'EF', position: 'CG', krRating: 78, currentSchool: 'Southern University',    level: 'D1',   classYear: '2026', stage: 'offered',    inPortal: true,  lastAction: 'Offer sent Mar 4' },
  { id: 'pr11', name: 'Andre Collins',    initials: 'AC', position: 'F',  krRating: 76, currentSchool: 'Northern State',         level: 'D2',   classYear: '2026', stage: 'offered',    inPortal: true,  lastAction: 'Offer sent Feb 28' },
  { id: 'pr12', name: 'Tyrese Williams',  initials: 'TW', position: 'PG', krRating: 88, currentSchool: 'Riverside Academy',      level: 'HS',   classYear: '2026', stage: 'committed',  inPortal: false, lastAction: 'Committed Mar 2' },
];

// ── Helpers ──

export function getPlayers(filter?: PlayerFilter, sort?: PlayerSort): RosterPlayerItem[] {
  let result = [...ROSTER_PLAYERS];
  if (filter && filter !== 'all') {
    result = result.filter((p) => p.position === filter);
  }
  if (sort) {
    switch (sort) {
      case 'kr':
        result.sort((a, b) => b.krRating - a.krRating);
        break;
      case 'position':
        result.sort((a, b) => a.position.localeCompare(b.position));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'class': {
        const order: Record<string, number> = { 'Fr.': 0, 'So.': 1, 'Jr.': 2, 'Sr.': 3, 'Gr.': 4 };
        result.sort((a, b) => (order[a.classYear] ?? 9) - (order[b.classYear] ?? 9));
        break;
      }
      case 'number':
        result.sort((a, b) => parseInt(a.jerseyNumber) - parseInt(b.jerseyNumber));
        break;
    }
  }
  return result;
}

export function getProspects(filter?: ProspectFilter): ProspectCard[] {
  if (!filter || filter === 'all') return PROSPECTS;
  if (filter === 'portal') return PROSPECTS.filter((p) => p.inPortal);
  return PROSPECTS;
}

export function getProspectsByStage(stage: PipelineStage): ProspectCard[] {
  return PROSPECTS.filter((p) => p.stage === stage);
}
