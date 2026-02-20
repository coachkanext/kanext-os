/**
 * Mock Competition Home Data — K-1 Racing League
 * Pills: Dashboard, Calendar, Grid, Entries
 */

import type { ProgramCalendarEvent } from '@/types';

// =============================================================================
// RACE CALENDAR EVENTS (ProgramCalendarEvent[])
// =============================================================================

// Helper to build race weekend dates (Fri practice, Sat heats, Sun finals)
function raceWeekend(
  round: number,
  name: string,
  venue: string,
  friDate: string,
  satDate: string,
  sunDate: string,
  status: 'upcoming' | 'final',
): ProgramCalendarEvent[] {
  return [
    {
      id: `comp-cal-r${round}-fri`,
      type: 'practice',
      title: `Round ${round} - ${name} · Practice & Qualifying`,
      startDatetime: new Date(`${friDate}T09:00:00`),
      endDatetime: new Date(`${friDate}T17:00:00`),
      location: venue,
      description: `Free practice sessions and qualifying for Round ${round}`,
      visibilityScope: 'all_program',
      gameStatus: status,
    },
    {
      id: `comp-cal-r${round}-sat`,
      type: 'game',
      title: `Round ${round} - ${name} · Heats`,
      startDatetime: new Date(`${satDate}T10:00:00`),
      endDatetime: new Date(`${satDate}T18:00:00`),
      location: venue,
      description: `Heat races for Round ${round}`,
      visibilityScope: 'all_program',
      gameStatus: status,
    },
    {
      id: `comp-cal-r${round}-sun`,
      type: 'game',
      title: `Round ${round} - ${name} · Finals`,
      startDatetime: new Date(`${sunDate}T12:00:00`),
      endDatetime: new Date(`${sunDate}T17:00:00`),
      location: venue,
      description: `Feature race and podium ceremony for Round ${round}`,
      visibilityScope: 'all_program',
      gameStatus: status,
    },
  ];
}

export const COMP_CALENDAR_EVENTS: ProgramCalendarEvent[] = [
  // Round 1 — Miami (completed)
  ...raceWeekend(1, 'Miami', 'Miami International Autodrome', '2025-02-14', '2025-02-15', '2025-02-16', 'final'),
  // Round 2 — Austin (completed)
  ...raceWeekend(2, 'Austin', 'Circuit of the Americas Karting', '2025-03-14', '2025-03-15', '2025-03-16', 'final'),
  // Round 3 — Charlotte (completed)
  ...raceWeekend(3, 'Charlotte', 'Charlotte Motor Speedway Kart Track', '2025-04-11', '2025-04-12', '2025-04-13', 'final'),
  // Round 4 — Indianapolis (completed)
  ...raceWeekend(4, 'Indianapolis', 'Indianapolis Motor Speedway Kart Circuit', '2025-05-09', '2025-05-10', '2025-05-11', 'final'),
  // Round 5 — Portland (completed)
  ...raceWeekend(5, 'Portland', 'Portland International Raceway Kart Track', '2025-06-06', '2025-06-07', '2025-06-08', 'final'),
  // Round 6 — Detroit (completed)
  ...raceWeekend(6, 'Detroit', 'Belle Isle Street Circuit', '2025-07-11', '2025-07-12', '2025-07-13', 'final'),
  // Round 7 — Nashville (next)
  ...raceWeekend(7, 'Nashville', 'Nashville Street Circuit', '2025-08-08', '2025-08-09', '2025-08-10', 'upcoming'),
  // Round 8 — Laguna Seca (upcoming)
  ...raceWeekend(8, 'Laguna Seca', 'WeatherTech Raceway Laguna Seca Kart Track', '2025-08-29', '2025-08-30', '2025-08-31', 'upcoming'),
  // Round 9 — Road America (upcoming)
  ...raceWeekend(9, 'Road America', 'Road America Karting Complex', '2025-09-19', '2025-09-20', '2025-09-21', 'upcoming'),
  // Round 10 — Atlanta (upcoming)
  ...raceWeekend(10, 'Atlanta', 'Atlanta Motorsports Park', '2025-10-10', '2025-10-11', '2025-10-12', 'upcoming'),
  // Round 11 — Long Beach (upcoming)
  ...raceWeekend(11, 'Long Beach', 'Long Beach Street Circuit', '2025-10-31', '2025-11-01', '2025-11-02', 'upcoming'),
  // Round 12 — Las Vegas (finale, upcoming)
  ...raceWeekend(12, 'Las Vegas', 'Las Vegas Motor Speedway Kart Track', '2025-11-21', '2025-11-22', '2025-11-23', 'upcoming'),
];

// =============================================================================
// RACE SCHEDULE (RaceRound[])
// =============================================================================

export interface RaceRound {
  id: string;
  round: number;
  name: string;
  venue: string;
  city: string;
  date: string;
  time?: string;
  weekendDates: { fri: string; sat: string; sun: string };
  status: 'completed' | 'next' | 'upcoming';
  winner?: string;
  winnerTeam?: string;
  p2?: string;
  p2Team?: string;
  p3?: string;
  p3Team?: string;
  fastestLap?: string;
  entryCount?: number;
  defendingWinner?: string;
  attendance?: number;
}

export const RACE_ROUNDS: RaceRound[] = [
  {
    id: 'rr-1', round: 1, name: 'Miami Grand Prix', venue: 'Miami International Autodrome', city: 'Miami',
    date: 'Feb 16, 2025', weekendDates: { fri: 'Feb 14', sat: 'Feb 15', sun: 'Feb 16' }, status: 'completed',
    winner: 'Marco Alvarez', winnerTeam: 'KaNeXT Works Racing',
    p2: 'Lena Hoffmann', p2Team: 'Apex Motorsport', p3: 'Darius Okonkwo', p3Team: 'Velocity Racing',
    fastestLap: 'Yuki Tanaka', attendance: 12400,
  },
  {
    id: 'rr-2', round: 2, name: 'Austin Classic', venue: 'Circuit of the Americas Karting', city: 'Austin',
    date: 'Mar 16, 2025', weekendDates: { fri: 'Mar 14', sat: 'Mar 15', sun: 'Mar 16' }, status: 'completed',
    winner: 'Lena Hoffmann', winnerTeam: 'Apex Motorsport',
    p2: 'Marco Alvarez', p2Team: 'KaNeXT Works Racing', p3: 'Yuki Tanaka', p3Team: 'Summit Engineering',
    fastestLap: 'Lena Hoffmann', attendance: 9800,
  },
  {
    id: 'rr-3', round: 3, name: 'Charlotte Sprint', venue: 'Charlotte Motor Speedway Kart Track', city: 'Charlotte',
    date: 'Apr 13, 2025', weekendDates: { fri: 'Apr 11', sat: 'Apr 12', sun: 'Apr 13' }, status: 'completed',
    winner: 'Marco Alvarez', winnerTeam: 'KaNeXT Works Racing',
    p2: 'Sofia Petrov', p2Team: 'Apex Motorsport', p3: 'Amir Khalil', p3Team: 'Velocity Racing',
    fastestLap: 'Marco Alvarez', attendance: 11200,
  },
  {
    id: 'rr-4', round: 4, name: 'Indianapolis 100', venue: 'Indianapolis Motor Speedway Kart Circuit', city: 'Indianapolis',
    date: 'May 11, 2025', weekendDates: { fri: 'May 9', sat: 'May 10', sun: 'May 11' }, status: 'completed',
    winner: 'Yuki Tanaka', winnerTeam: 'Summit Engineering',
    p2: 'Marco Alvarez', p2Team: 'KaNeXT Works Racing', p3: 'Darius Okonkwo', p3Team: 'Velocity Racing',
    fastestLap: 'Sofia Petrov', attendance: 15600,
  },
  {
    id: 'rr-5', round: 5, name: 'Portland Challenge', venue: 'Portland International Raceway Kart Track', city: 'Portland',
    date: 'Jun 8, 2025', weekendDates: { fri: 'Jun 6', sat: 'Jun 7', sun: 'Jun 8' }, status: 'completed',
    winner: 'Darius Okonkwo', winnerTeam: 'Velocity Racing',
    p2: 'Kwame Asante', p2Team: 'Titan Performance', p3: 'Elena Cruz', p3Team: 'KaNeXT Works Racing',
    fastestLap: 'Darius Okonkwo', attendance: 8200,
  },
  {
    id: 'rr-6', round: 6, name: 'Detroit Street Race', venue: 'Belle Isle Street Circuit', city: 'Detroit',
    date: 'Jul 13, 2025', weekendDates: { fri: 'Jul 11', sat: 'Jul 12', sun: 'Jul 13' }, status: 'completed',
    winner: 'Marco Alvarez', winnerTeam: 'KaNeXT Works Racing',
    p2: 'Lena Hoffmann', p2Team: 'Apex Motorsport', p3: 'Yuki Tanaka', p3Team: 'Summit Engineering',
    fastestLap: 'Amir Khalil', attendance: 13100,
  },
  {
    id: 'rr-7', round: 7, name: 'Nashville Night Race', venue: 'Nashville Street Circuit', city: 'Nashville',
    date: 'Aug 10, 2025', time: '7:00 PM CT', weekendDates: { fri: 'Aug 8', sat: 'Aug 9', sun: 'Aug 10' },
    status: 'next', entryCount: 22, defendingWinner: 'Marco Alvarez',
  },
  {
    id: 'rr-8', round: 8, name: 'Laguna Seca Showdown', venue: 'WeatherTech Raceway Laguna Seca Kart Track', city: 'Monterey',
    date: 'Aug 31, 2025', time: '3:00 PM PT', weekendDates: { fri: 'Aug 29', sat: 'Aug 30', sun: 'Aug 31' },
    status: 'upcoming', entryCount: 20,
  },
  {
    id: 'rr-9', round: 9, name: 'Road America Enduro', venue: 'Road America Karting Complex', city: 'Elkhart Lake',
    date: 'Sep 21, 2025', time: '2:00 PM CT', weekendDates: { fri: 'Sep 19', sat: 'Sep 20', sun: 'Sep 21' },
    status: 'upcoming', entryCount: 18,
  },
  {
    id: 'rr-10', round: 10, name: 'Atlanta Speedfest', venue: 'Atlanta Motorsports Park', city: 'Atlanta',
    date: 'Oct 12, 2025', time: '3:00 PM ET', weekendDates: { fri: 'Oct 10', sat: 'Oct 11', sun: 'Oct 12' },
    status: 'upcoming',
  },
  {
    id: 'rr-11', round: 11, name: 'Long Beach Grand Prix', venue: 'Long Beach Street Circuit', city: 'Long Beach',
    date: 'Nov 2, 2025', time: '2:00 PM PT', weekendDates: { fri: 'Oct 31', sat: 'Nov 1', sun: 'Nov 2' },
    status: 'upcoming',
  },
  {
    id: 'rr-12', round: 12, name: 'Las Vegas Finale', venue: 'Las Vegas Motor Speedway Kart Track', city: 'Las Vegas',
    date: 'Nov 23, 2025', time: '5:00 PM PT', weekendDates: { fri: 'Nov 21', sat: 'Nov 22', sun: 'Nov 23' },
    status: 'upcoming',
  },
];

// =============================================================================
// STANDINGS — Drivers
// =============================================================================

export interface DriverStanding {
  position: number;
  name: string;
  team: string;
  points: number;
  wins: number;
  podiums: number;
  poles: number;
  fastestLaps: number;
  delta: number;
  lastRaceResult?: number | 'DNF' | 'DNS';
}

export const DRIVER_STANDINGS: DriverStanding[] = [
  { position: 1, name: 'Marco Alvarez', team: 'KaNeXT Works Racing', points: 156, wins: 3, podiums: 5, poles: 2, fastestLaps: 1, delta: 0, lastRaceResult: 1 },
  { position: 2, name: 'Lena Hoffmann', team: 'Apex Motorsport', points: 138, wins: 1, podiums: 5, poles: 2, fastestLaps: 1, delta: 1, lastRaceResult: 2 },
  { position: 3, name: 'Darius Okonkwo', team: 'Velocity Racing', points: 124, wins: 1, podiums: 4, poles: 1, fastestLaps: 1, delta: -1, lastRaceResult: 5 },
  { position: 4, name: 'Yuki Tanaka', team: 'Summit Engineering', points: 118, wins: 1, podiums: 4, poles: 1, fastestLaps: 0, delta: 2, lastRaceResult: 3 },
  { position: 5, name: 'Sofia Petrov', team: 'Apex Motorsport', points: 104, wins: 0, podiums: 3, poles: 0, fastestLaps: 1, delta: -1, lastRaceResult: 6 },
  { position: 6, name: 'Amir Khalil', team: 'Velocity Racing', points: 97, wins: 0, podiums: 2, poles: 0, fastestLaps: 1, delta: 0, lastRaceResult: 4 },
  { position: 7, name: 'Kwame Asante', team: 'Titan Performance', points: 89, wins: 0, podiums: 2, poles: 0, fastestLaps: 0, delta: 1, lastRaceResult: 7 },
  { position: 8, name: 'Jake Morrison', team: 'Grid Iron Motors', points: 82, wins: 0, podiums: 1, poles: 0, fastestLaps: 0, delta: -1, lastRaceResult: 9 },
  { position: 9, name: 'Elena Cruz', team: 'KaNeXT Works Racing', points: 76, wins: 0, podiums: 1, poles: 0, fastestLaps: 0, delta: 0, lastRaceResult: 8 },
  { position: 10, name: 'Ravi Sharma', team: 'Summit Engineering', points: 68, wins: 0, podiums: 1, poles: 0, fastestLaps: 1, delta: 2, lastRaceResult: 10 },
  { position: 11, name: 'Nia Jackson', team: 'Titan Performance', points: 54, wins: 0, podiums: 0, poles: 0, fastestLaps: 0, delta: -1, lastRaceResult: 11 },
  { position: 12, name: 'Cody Bergmann', team: 'Grid Iron Motors', points: 41, wins: 0, podiums: 0, poles: 0, fastestLaps: 0, delta: -1, lastRaceResult: 'DNF' },
];

export const STEWARD_PENDING_DECISIONS = 2;
export const HOMOLOGATION_DEADLINE = 'Aug 1, 2025';

// =============================================================================
// STANDINGS — Constructors
// =============================================================================

export interface ConstructorStanding {
  position: number;
  name: string;
  points: number;
  wins: number;
  oneTwo: number;
  drivers: string[];
  category: 'oem_works' | 'premier_tuner' | 'league_owned' | 'kanext_works';
}

export const CONSTRUCTOR_STANDINGS: ConstructorStanding[] = [
  { position: 1, name: 'Apex Motorsport', points: 242, wins: 1, oneTwo: 1, drivers: ['Lena Hoffmann', 'Sofia Petrov'], category: 'premier_tuner' },
  { position: 2, name: 'KaNeXT Works Racing', points: 232, wins: 3, oneTwo: 0, drivers: ['Marco Alvarez', 'Elena Cruz'], category: 'kanext_works' },
  { position: 3, name: 'Velocity Racing', points: 221, wins: 1, oneTwo: 0, drivers: ['Darius Okonkwo', 'Amir Khalil'], category: 'oem_works' },
  { position: 4, name: 'Summit Engineering', points: 186, wins: 1, oneTwo: 0, drivers: ['Yuki Tanaka', 'Ravi Sharma'], category: 'premier_tuner' },
  { position: 5, name: 'Titan Performance', points: 143, wins: 0, oneTwo: 0, drivers: ['Kwame Asante', 'Nia Jackson'], category: 'league_owned' },
  { position: 6, name: 'Grid Iron Motors', points: 123, wins: 0, oneTwo: 0, drivers: ['Jake Morrison', 'Cody Bergmann'], category: 'oem_works' },
];

// =============================================================================
// STANDINGS — Crew Chiefs
// =============================================================================

export interface CrewStanding {
  position: number;
  name: string;
  team: string;
  points: number;
  pitScore: number;
  operationalDiscipline: number;
  unsafeReleases: number;
  avgPitTime: string;
  role: string;
}

export const CREW_STANDINGS: CrewStanding[] = [
  { position: 1, name: 'Tony Marchetti', team: 'KaNeXT Works Racing', points: 284, pitScore: 96, operationalDiscipline: 94, unsafeReleases: 0, avgPitTime: '6.2s', role: 'Head Mechanic' },
  { position: 2, name: 'Hana Kuroda', team: 'Summit Engineering', points: 268, pitScore: 94, operationalDiscipline: 92, unsafeReleases: 0, avgPitTime: '6.4s', role: 'Chief Engineer' },
  { position: 3, name: 'Diego Vargas', team: 'Apex Motorsport', points: 261, pitScore: 92, operationalDiscipline: 91, unsafeReleases: 1, avgPitTime: '6.5s', role: 'Head Mechanic' },
  { position: 4, name: 'Priya Naidoo', team: 'Velocity Racing', points: 248, pitScore: 90, operationalDiscipline: 88, unsafeReleases: 0, avgPitTime: '6.7s', role: 'Race Engineer' },
  { position: 5, name: 'Mikhail Volkov', team: 'Titan Performance', points: 224, pitScore: 87, operationalDiscipline: 84, unsafeReleases: 2, avgPitTime: '7.0s', role: 'Chief Strategist' },
  { position: 6, name: 'Sarah-Jane Obi', team: 'Grid Iron Motors', points: 198, pitScore: 84, operationalDiscipline: 80, unsafeReleases: 1, avgPitTime: '7.3s', role: 'Head Mechanic' },
];

// =============================================================================
// STANDINGS — Wildcard Cup
// =============================================================================

export interface WildcardStanding {
  position: number;
  name: string;
  car: string;
  rounds: number;
  bestFinish: number;
  points: number;
  status: 'active' | 'eliminated' | 'qualified';
}

export const WILDCARD_CUP_STANDINGS: WildcardStanding[] = [
  { position: 1, name: 'Omar Diallo', car: 'KZ Shifter Kart', rounds: 4, bestFinish: 4, points: 38, status: 'qualified' },
  { position: 2, name: 'Anya Voronova', car: 'Rotax Max', rounds: 5, bestFinish: 5, points: 34, status: 'active' },
  { position: 3, name: 'Tomasz Krawczyk', car: 'KRT Academy Kart', rounds: 3, bestFinish: 6, points: 28, status: 'active' },
  { position: 4, name: 'Kenji Murakami', car: 'Birel ART', rounds: 4, bestFinish: 7, points: 24, status: 'active' },
  { position: 5, name: 'Lucia Fernandez', car: 'Tony Kart Racer', rounds: 3, bestFinish: 8, points: 19, status: 'active' },
  { position: 6, name: 'Noel Baptiste', car: 'CRG Black Mirror', rounds: 2, bestFinish: 9, points: 12, status: 'active' },
  { position: 7, name: 'Isabelle Cheung', car: 'OTK Exprit', rounds: 3, bestFinish: 11, points: 8, status: 'eliminated' },
  { position: 8, name: 'Rafael Gomez', car: 'Praga Dragon', rounds: 1, bestFinish: 14, points: 3, status: 'eliminated' },
];

// =============================================================================
// NEWS
// =============================================================================

export type CompNewsCategory = 'race_recap' | 'onboard' | 'interview' | 'technical' | 'wildcard';

export interface CompNewsItem {
  id: string;
  title: string;
  category: CompNewsCategory;
  thumbnail?: string;
  date: string;
  duration?: string;
  isVideo: boolean;
}

export const COMP_NEWS_CATEGORY_LABELS: Record<CompNewsCategory, string> = {
  race_recap: 'Race Recap',
  onboard: 'Onboard',
  interview: 'Interview',
  technical: 'Technical',
  wildcard: 'Wildcard',
};

export const COMP_NEWS: CompNewsItem[] = [
  {
    id: 'cn-1', title: 'Detroit Recap: Alvarez masterclass in the wet',
    category: 'race_recap', date: 'Jul 14, 2025', duration: '4:32', isVideo: true,
  },
  {
    id: 'cn-2', title: 'Technical deep dive: How Summit unlocked rear grip',
    category: 'technical', date: 'Jul 12, 2025', duration: '8:15', isVideo: true,
  },
  {
    id: 'cn-3', title: 'Wildcard Omar Diallo earns full-season seat for 2026',
    category: 'wildcard', date: 'Jul 10, 2025', isVideo: false,
  },
  {
    id: 'cn-4', title: 'Onboard: Marco Alvarez full qualifying lap — Detroit',
    category: 'onboard', date: 'Jul 8, 2025', duration: '1:47', isVideo: true,
  },
  {
    id: 'cn-5', title: 'Top 10 overtakes of the first half — 2025 Season',
    category: 'race_recap', date: 'Jul 6, 2025', duration: '3:58', isVideo: true,
  },
  {
    id: 'cn-6', title: 'Lena Hoffmann interview: "We have the speed, just need consistency"',
    category: 'interview', date: 'Jul 4, 2025', duration: '5:20', isVideo: true,
  },
  {
    id: 'cn-7', title: 'Wildcard diary: Noel Baptiste prepares for Nashville',
    category: 'wildcard', date: 'Jul 2, 2025', duration: '6:47', isVideo: true,
  },
  {
    id: 'cn-8', title: 'Technical: KaNeXT Works pit crew training breakdown',
    category: 'technical', date: 'Jun 28, 2025', duration: '4:15', isVideo: true,
  },
  {
    id: 'cn-9', title: 'Post-race interview: Darius Okonkwo on his first win',
    category: 'interview', date: 'Jun 9, 2025', duration: '3:45', isVideo: true,
  },
  {
    id: 'cn-10', title: 'Onboard: Portland highlights from Okonkwo\'s cockpit',
    category: 'onboard', date: 'Jun 9, 2025', duration: '3:12', isVideo: true,
  },
];

// =============================================================================
// GRID — Teams
// =============================================================================

export type TeamCategory = 'oem_works' | 'premier_tuner' | 'league_owned' | 'kanext_works';

export const CATEGORY_LABELS: Record<TeamCategory, string> = {
  oem_works: 'OEM Works',
  premier_tuner: 'Premier Tuner',
  league_owned: 'League-Owned',
  kanext_works: 'KaNeXT Works',
};

export interface GridTeam {
  id: string;
  name: string;
  constructor: string;
  carModel: string;
  category: TeamCategory;
  drivers: { name: string; points: number }[];
  crewChief: string;
  points: number;
  capCompliance: 'green' | 'warning';
  homologation: 'approved' | 'pending' | 'expired';
  color: string;
}

export const GRID_TEAMS: GridTeam[] = [
  {
    id: 'gt-1', name: 'KaNeXT Works Racing', constructor: 'KaNeXT Motorsport', carModel: 'KX-1 Shifter',
    category: 'kanext_works', drivers: [{ name: 'Marco Alvarez', points: 156 }, { name: 'Elena Cruz', points: 76 }],
    crewChief: 'Tony Marchetti', points: 232, capCompliance: 'green', homologation: 'approved', color: '#6366F1',
  },
  {
    id: 'gt-2', name: 'Apex Motorsport', constructor: 'Apex Racing Technologies', carModel: 'ART-R1 Evo',
    category: 'premier_tuner', drivers: [{ name: 'Lena Hoffmann', points: 138 }, { name: 'Sofia Petrov', points: 104 }],
    crewChief: 'Diego Vargas', points: 242, capCompliance: 'warning', homologation: 'approved', color: '#EF4444',
  },
  {
    id: 'gt-3', name: 'Velocity Racing', constructor: 'Toyota Gazoo Racing', carModel: 'TGR-K25',
    category: 'oem_works', drivers: [{ name: 'Darius Okonkwo', points: 124 }, { name: 'Amir Khalil', points: 97 }],
    crewChief: 'Priya Naidoo', points: 221, capCompliance: 'green', homologation: 'approved', color: '#14B8A6',
  },
  {
    id: 'gt-4', name: 'Summit Engineering', constructor: 'Summit Kart Works', carModel: 'SK-V2 Pro',
    category: 'premier_tuner', drivers: [{ name: 'Yuki Tanaka', points: 118 }, { name: 'Ravi Sharma', points: 68 }],
    crewChief: 'Hana Kuroda', points: 186, capCompliance: 'green', homologation: 'approved', color: '#F59E0B',
  },
  {
    id: 'gt-5', name: 'Titan Performance', constructor: 'K-1 League Karts', carModel: 'K1-Standard',
    category: 'league_owned', drivers: [{ name: 'Kwame Asante', points: 89 }, { name: 'Nia Jackson', points: 54 }],
    crewChief: 'Mikhail Volkov', points: 143, capCompliance: 'green', homologation: 'approved', color: '#8B5CF6',
  },
  {
    id: 'gt-6', name: 'Grid Iron Motors', constructor: 'Honda Performance Dev.', carModel: 'HPD-KZ1',
    category: 'oem_works', drivers: [{ name: 'Jake Morrison', points: 82 }, { name: 'Cody Bergmann', points: 41 }],
    crewChief: 'Sarah-Jane Obi', points: 123, capCompliance: 'green', homologation: 'approved', color: '#64748B',
  },
];

// =============================================================================
// GRID — Drivers
// =============================================================================

export interface GridDriver {
  id: string;
  name: string;
  number: string;
  team: string;
  teamColor: string;
  car: string;
  type: 'permanent' | 'wildcard';
  position: number;
  points: number;
  wins: number;
  podiums: number;
  poles: number;
  nationality: string;
  status: 'active' | 'injured' | 'suspended';
}

export const GRID_DRIVERS: GridDriver[] = [
  // Permanent drivers (12)
  { id: 'gd-1', name: 'Marco Alvarez', number: '01', team: 'KaNeXT Works Racing', teamColor: '#6366F1', car: 'KX-1 Shifter', type: 'permanent', position: 1, points: 156, wins: 3, podiums: 5, poles: 2, nationality: 'Spain', status: 'active' },
  { id: 'gd-2', name: 'Elena Cruz', number: '02', team: 'KaNeXT Works Racing', teamColor: '#6366F1', car: 'KX-1 Shifter', type: 'permanent', position: 9, points: 76, wins: 0, podiums: 1, poles: 0, nationality: 'Mexico', status: 'active' },
  { id: 'gd-3', name: 'Lena Hoffmann', number: '07', team: 'Apex Motorsport', teamColor: '#EF4444', car: 'ART-R1 Evo', type: 'permanent', position: 2, points: 138, wins: 1, podiums: 5, poles: 2, nationality: 'Germany', status: 'active' },
  { id: 'gd-4', name: 'Sofia Petrov', number: '08', team: 'Apex Motorsport', teamColor: '#EF4444', car: 'ART-R1 Evo', type: 'permanent', position: 5, points: 104, wins: 0, podiums: 3, poles: 0, nationality: 'Bulgaria', status: 'active' },
  { id: 'gd-5', name: 'Darius Okonkwo', number: '14', team: 'Velocity Racing', teamColor: '#14B8A6', car: 'TGR-K25', type: 'permanent', position: 3, points: 124, wins: 1, podiums: 4, poles: 1, nationality: 'Nigeria', status: 'active' },
  { id: 'gd-6', name: 'Amir Khalil', number: '15', team: 'Velocity Racing', teamColor: '#14B8A6', car: 'TGR-K25', type: 'permanent', position: 6, points: 97, wins: 0, podiums: 2, poles: 0, nationality: 'Lebanon', status: 'active' },
  { id: 'gd-7', name: 'Yuki Tanaka', number: '22', team: 'Summit Engineering', teamColor: '#F59E0B', car: 'SK-V2 Pro', type: 'permanent', position: 4, points: 118, wins: 1, podiums: 4, poles: 1, nationality: 'Japan', status: 'active' },
  { id: 'gd-8', name: 'Ravi Sharma', number: '23', team: 'Summit Engineering', teamColor: '#F59E0B', car: 'SK-V2 Pro', type: 'permanent', position: 10, points: 68, wins: 0, podiums: 1, poles: 0, nationality: 'India', status: 'active' },
  { id: 'gd-9', name: 'Kwame Asante', number: '33', team: 'Titan Performance', teamColor: '#8B5CF6', car: 'K1-Standard', type: 'permanent', position: 7, points: 89, wins: 0, podiums: 2, poles: 0, nationality: 'Ghana', status: 'active' },
  { id: 'gd-10', name: 'Nia Jackson', number: '34', team: 'Titan Performance', teamColor: '#8B5CF6', car: 'K1-Standard', type: 'permanent', position: 11, points: 54, wins: 0, podiums: 0, poles: 0, nationality: 'USA', status: 'active' },
  { id: 'gd-11', name: 'Jake Morrison', number: '44', team: 'Grid Iron Motors', teamColor: '#64748B', car: 'HPD-KZ1', type: 'permanent', position: 8, points: 82, wins: 0, podiums: 1, poles: 0, nationality: 'USA', status: 'active' },
  { id: 'gd-12', name: 'Cody Bergmann', number: '45', team: 'Grid Iron Motors', teamColor: '#64748B', car: 'HPD-KZ1', type: 'permanent', position: 12, points: 41, wins: 0, podiums: 0, poles: 0, nationality: 'Australia', status: 'active' },
  // Wildcard drivers (4)
  { id: 'gd-w1', name: 'Omar Diallo', number: '77', team: 'Wildcard', teamColor: '#9CA3AF', car: 'KZ Shifter Kart', type: 'wildcard', position: 13, points: 38, wins: 0, podiums: 0, poles: 0, nationality: 'Senegal', status: 'active' },
  { id: 'gd-w2', name: 'Anya Voronova', number: '78', team: 'Wildcard', teamColor: '#9CA3AF', car: 'Rotax Max', type: 'wildcard', position: 14, points: 34, wins: 0, podiums: 0, poles: 0, nationality: 'Russia', status: 'active' },
  { id: 'gd-w3', name: 'Tomasz Krawczyk', number: '79', team: 'Wildcard', teamColor: '#9CA3AF', car: 'KRT Academy Kart', type: 'wildcard', position: 15, points: 28, wins: 0, podiums: 0, poles: 0, nationality: 'Poland', status: 'active' },
  { id: 'gd-w4', name: 'Kenji Murakami', number: '80', team: 'Wildcard', teamColor: '#9CA3AF', car: 'Birel ART', type: 'wildcard', position: 16, points: 24, wins: 0, podiums: 0, poles: 0, nationality: 'Japan', status: 'active' },
];

// =============================================================================
// GRID — Crew
// =============================================================================

export interface GridCrew {
  id: string;
  name: string;
  team: string;
  role: string;
  position: number;
  points: number;
  pitScore: number;
  operationalDiscipline: number;
  unsafeReleases: number;
  experience: string;
}

export const GRID_CREW: GridCrew[] = [
  { id: 'gc-1', name: 'Tony Marchetti', team: 'KaNeXT Works Racing', role: 'Head Mechanic', position: 1, points: 284, pitScore: 96, operationalDiscipline: 94, unsafeReleases: 0, experience: '12 years' },
  { id: 'gc-2', name: 'Hana Kuroda', team: 'Summit Engineering', role: 'Chief Engineer', position: 2, points: 268, pitScore: 94, operationalDiscipline: 92, unsafeReleases: 0, experience: '9 years' },
  { id: 'gc-3', name: 'Diego Vargas', team: 'Apex Motorsport', role: 'Head Mechanic', position: 3, points: 261, pitScore: 92, operationalDiscipline: 91, unsafeReleases: 1, experience: '15 years' },
  { id: 'gc-4', name: 'Priya Naidoo', team: 'Velocity Racing', role: 'Race Engineer', position: 4, points: 248, pitScore: 90, operationalDiscipline: 88, unsafeReleases: 0, experience: '7 years' },
  { id: 'gc-5', name: 'Mikhail Volkov', team: 'Titan Performance', role: 'Chief Strategist', position: 5, points: 224, pitScore: 87, operationalDiscipline: 84, unsafeReleases: 2, experience: '11 years' },
  { id: 'gc-6', name: 'Sarah-Jane Obi', team: 'Grid Iron Motors', role: 'Head Mechanic', position: 6, points: 198, pitScore: 84, operationalDiscipline: 80, unsafeReleases: 1, experience: '5 years' },
];

// =============================================================================
// ENTRIES — Confirmed
// =============================================================================

export interface EntryConfirmed {
  id: string;
  number: string;
  driver: string;
  team: string;
  type: 'permanent' | 'wildcard';
  status: 'confirmed' | 'pending' | 'withdrawn';
}

export const ENTRY_DEADLINE = 'Aug 4, 2025';
export const MAX_GRID_SIZE = 24;

export const ENTRIES_CONFIRMED: EntryConfirmed[] = [
  // KaNeXT Works Racing
  { id: 'ec-1', number: '01', driver: 'Marco Alvarez', team: 'KaNeXT Works Racing', type: 'permanent', status: 'confirmed' },
  { id: 'ec-2', number: '02', driver: 'Elena Cruz', team: 'KaNeXT Works Racing', type: 'permanent', status: 'confirmed' },
  // Apex Motorsport
  { id: 'ec-3', number: '07', driver: 'Lena Hoffmann', team: 'Apex Motorsport', type: 'permanent', status: 'confirmed' },
  { id: 'ec-4', number: '08', driver: 'Sofia Petrov', team: 'Apex Motorsport', type: 'permanent', status: 'confirmed' },
  // Velocity Racing
  { id: 'ec-5', number: '14', driver: 'Darius Okonkwo', team: 'Velocity Racing', type: 'permanent', status: 'confirmed' },
  { id: 'ec-6', number: '15', driver: 'Amir Khalil', team: 'Velocity Racing', type: 'permanent', status: 'confirmed' },
  // Summit Engineering
  { id: 'ec-7', number: '22', driver: 'Yuki Tanaka', team: 'Summit Engineering', type: 'permanent', status: 'confirmed' },
  { id: 'ec-8', number: '23', driver: 'Ravi Sharma', team: 'Summit Engineering', type: 'permanent', status: 'confirmed' },
  // Titan Performance
  { id: 'ec-9', number: '33', driver: 'Kwame Asante', team: 'Titan Performance', type: 'permanent', status: 'confirmed' },
  { id: 'ec-10', number: '34', driver: 'Nia Jackson', team: 'Titan Performance', type: 'permanent', status: 'confirmed' },
  // Grid Iron Motors
  { id: 'ec-11', number: '44', driver: 'Jake Morrison', team: 'Grid Iron Motors', type: 'permanent', status: 'confirmed' },
  { id: 'ec-12', number: '45', driver: 'Cody Bergmann', team: 'Grid Iron Motors', type: 'permanent', status: 'confirmed' },
  // Wildcards confirmed
  { id: 'ec-13', number: '77', driver: 'Omar Diallo', team: 'Wildcard', type: 'wildcard', status: 'confirmed' },
  { id: 'ec-14', number: '78', driver: 'Anya Voronova', team: 'Wildcard', type: 'wildcard', status: 'confirmed' },
  { id: 'ec-15', number: '79', driver: 'Tomasz Krawczyk', team: 'Wildcard', type: 'wildcard', status: 'confirmed' },
  { id: 'ec-16', number: '80', driver: 'Kenji Murakami', team: 'Wildcard', type: 'wildcard', status: 'confirmed' },
  // Additional wildcards confirmed for Nashville
  { id: 'ec-17', number: '81', driver: 'Lucia Fernandez', team: 'Wildcard', type: 'wildcard', status: 'confirmed' },
  { id: 'ec-18', number: '82', driver: 'Noel Baptiste', team: 'Wildcard', type: 'wildcard', status: 'confirmed' },
  // Pending entries
  { id: 'ec-19', number: '83', driver: 'Isabelle Cheung', team: 'Wildcard', type: 'wildcard', status: 'pending' },
  { id: 'ec-20', number: '84', driver: 'Rafael Gomez', team: 'Wildcard', type: 'wildcard', status: 'pending' },
  { id: 'ec-21', number: '85', driver: 'Andre Williams', team: 'Wildcard', type: 'wildcard', status: 'pending' },
  { id: 'ec-22', number: '86', driver: 'Min-Jun Park', team: 'Wildcard', type: 'wildcard', status: 'pending' },
];

// =============================================================================
// ENTRIES — Wildcard Pipeline
// =============================================================================

export type WildcardPipelineStage = 'applied' | 'scrutineering' | 'heats' | 'final' | 'confirmed';

export interface WildcardEntry {
  id: string;
  name: string;
  team: string;
  car: string;
  stage: WildcardPipelineStage;
  appliedDate: string;
  lastUpdated: string;
  nationality: string;
}

export const WILDCARD_STAGE_LABELS: Record<WildcardPipelineStage, string> = {
  applied: 'Applied',
  scrutineering: 'Scrutineering',
  heats: 'Friday Heats',
  final: 'Saturday Final',
  confirmed: 'Confirmed for GP',
};

export const WILDCARD_PIPELINE: WildcardEntry[] = [
  { id: 'wp-1', name: 'Omar Diallo', team: 'Independent', car: 'KZ Shifter Kart', stage: 'confirmed', appliedDate: 'Jan 15, 2025', lastUpdated: 'Jul 13, 2025', nationality: 'Senegal' },
  { id: 'wp-2', name: 'Anya Voronova', team: 'Independent', car: 'Rotax Max', stage: 'confirmed', appliedDate: 'Jan 18, 2025', lastUpdated: 'Jul 13, 2025', nationality: 'Russia' },
  { id: 'wp-3', name: 'Tomasz Krawczyk', team: 'KRT Academy', car: 'KRT Academy Kart', stage: 'final', appliedDate: 'Feb 2, 2025', lastUpdated: 'Jul 12, 2025', nationality: 'Poland' },
  { id: 'wp-4', name: 'Kenji Murakami', team: 'Independent', car: 'Birel ART', stage: 'final', appliedDate: 'Feb 8, 2025', lastUpdated: 'Jul 12, 2025', nationality: 'Japan' },
  { id: 'wp-5', name: 'Lucia Fernandez', team: 'Independent', car: 'Tony Kart Racer', stage: 'heats', appliedDate: 'Mar 1, 2025', lastUpdated: 'Jul 11, 2025', nationality: 'Argentina' },
  { id: 'wp-6', name: 'Noel Baptiste', team: 'Caribbean Racing Collective', car: 'CRG Black Mirror', stage: 'heats', appliedDate: 'Mar 12, 2025', lastUpdated: 'Jul 11, 2025', nationality: 'Trinidad & Tobago' },
  { id: 'wp-7', name: 'Andre Williams', team: 'Independent', car: 'FA Kart Gold', stage: 'scrutineering', appliedDate: 'Apr 5, 2025', lastUpdated: 'Jul 8, 2025', nationality: 'USA' },
  { id: 'wp-8', name: 'Min-Jun Park', team: 'Seoul Speed Academy', car: 'Kosmic Mercury', stage: 'applied', appliedDate: 'Jun 20, 2025', lastUpdated: 'Jun 20, 2025', nationality: 'South Korea' },
];

export const WILDCARD_STAGE_COLORS: Record<WildcardPipelineStage, string> = {
  applied: '#6B7280',
  scrutineering: '#F59E0B',
  heats: '#3B82F6',
  final: '#8B5CF6',
  confirmed: '#22C55E',
};

// =============================================================================
// ENTRIES — Compliance
// =============================================================================

export interface ComplianceRow {
  id: string;
  team: string;
  driver: string;
  homologation: 'approved' | 'pending' | 'expired';
  capCompliance: 'green' | 'under_review' | 'flagged';
  scrutineering: 'passed' | 'pending' | 'failed';
  techDelegateSignoff: boolean;
}

export const COMPLIANCE_DATA: ComplianceRow[] = [
  // KaNeXT Works Racing
  { id: 'cr-1', team: 'KaNeXT Works Racing', driver: 'Marco Alvarez', homologation: 'approved', capCompliance: 'green', scrutineering: 'passed', techDelegateSignoff: true },
  { id: 'cr-2', team: 'KaNeXT Works Racing', driver: 'Elena Cruz', homologation: 'approved', capCompliance: 'green', scrutineering: 'passed', techDelegateSignoff: true },
  // Apex Motorsport
  { id: 'cr-3', team: 'Apex Motorsport', driver: 'Lena Hoffmann', homologation: 'approved', capCompliance: 'green', scrutineering: 'passed', techDelegateSignoff: true },
  { id: 'cr-4', team: 'Apex Motorsport', driver: 'Sofia Petrov', homologation: 'approved', capCompliance: 'under_review', scrutineering: 'passed', techDelegateSignoff: true },
  // Velocity Racing
  { id: 'cr-5', team: 'Velocity Racing', driver: 'Darius Okonkwo', homologation: 'approved', capCompliance: 'green', scrutineering: 'passed', techDelegateSignoff: true },
  { id: 'cr-6', team: 'Velocity Racing', driver: 'Amir Khalil', homologation: 'approved', capCompliance: 'green', scrutineering: 'passed', techDelegateSignoff: true },
  // Summit Engineering
  { id: 'cr-7', team: 'Summit Engineering', driver: 'Yuki Tanaka', homologation: 'approved', capCompliance: 'green', scrutineering: 'passed', techDelegateSignoff: true },
  { id: 'cr-8', team: 'Summit Engineering', driver: 'Ravi Sharma', homologation: 'approved', capCompliance: 'green', scrutineering: 'pending', techDelegateSignoff: false },
  // Titan Performance
  { id: 'cr-9', team: 'Titan Performance', driver: 'Kwame Asante', homologation: 'approved', capCompliance: 'green', scrutineering: 'passed', techDelegateSignoff: true },
  { id: 'cr-10', team: 'Titan Performance', driver: 'Nia Jackson', homologation: 'approved', capCompliance: 'green', scrutineering: 'pending', techDelegateSignoff: false },
  // Grid Iron Motors
  { id: 'cr-11', team: 'Grid Iron Motors', driver: 'Jake Morrison', homologation: 'approved', capCompliance: 'flagged', scrutineering: 'passed', techDelegateSignoff: true },
  { id: 'cr-12', team: 'Grid Iron Motors', driver: 'Cody Bergmann', homologation: 'pending', capCompliance: 'flagged', scrutineering: 'failed', techDelegateSignoff: false },
  // Wildcards
  { id: 'cr-13', team: 'Wildcard', driver: 'Omar Diallo', homologation: 'approved', capCompliance: 'green', scrutineering: 'passed', techDelegateSignoff: true },
  { id: 'cr-14', team: 'Wildcard', driver: 'Anya Voronova', homologation: 'approved', capCompliance: 'green', scrutineering: 'passed', techDelegateSignoff: true },
  { id: 'cr-15', team: 'Wildcard', driver: 'Tomasz Krawczyk', homologation: 'approved', capCompliance: 'green', scrutineering: 'passed', techDelegateSignoff: true },
  { id: 'cr-16', team: 'Wildcard', driver: 'Kenji Murakami', homologation: 'approved', capCompliance: 'green', scrutineering: 'pending', techDelegateSignoff: false },
  { id: 'cr-17', team: 'Wildcard', driver: 'Lucia Fernandez', homologation: 'approved', capCompliance: 'green', scrutineering: 'passed', techDelegateSignoff: true },
  { id: 'cr-18', team: 'Wildcard', driver: 'Noel Baptiste', homologation: 'pending', capCompliance: 'green', scrutineering: 'pending', techDelegateSignoff: false },
  { id: 'cr-19', team: 'Wildcard', driver: 'Isabelle Cheung', homologation: 'pending', capCompliance: 'green', scrutineering: 'pending', techDelegateSignoff: false },
  { id: 'cr-20', team: 'Wildcard', driver: 'Rafael Gomez', homologation: 'expired', capCompliance: 'green', scrutineering: 'pending', techDelegateSignoff: false },
  { id: 'cr-21', team: 'Wildcard', driver: 'Andre Williams', homologation: 'pending', capCompliance: 'green', scrutineering: 'pending', techDelegateSignoff: false },
  { id: 'cr-22', team: 'Wildcard', driver: 'Min-Jun Park', homologation: 'pending', capCompliance: 'green', scrutineering: 'pending', techDelegateSignoff: false },
  // Reserve / test drivers
  { id: 'cr-23', team: 'KaNeXT Works Racing', driver: 'Lucas Marin', homologation: 'approved', capCompliance: 'green', scrutineering: 'passed', techDelegateSignoff: true },
  { id: 'cr-24', team: 'Apex Motorsport', driver: 'Emma Lindqvist', homologation: 'approved', capCompliance: 'green', scrutineering: 'passed', techDelegateSignoff: true },
];

// =============================================================================
// DASHBOARD — Hero
// =============================================================================

export interface CompHeroData {
  title: string;
  subtitle: string;
  isLive: boolean;
  videoId?: string;
}

export const COMP_HERO: CompHeroData = {
  title: 'K-1 Grand Prix · Round 7 · Nashville',
  subtitle: 'Round 6 Highlights · Alvarez Takes P1',
  isLive: false,
};

// =============================================================================
// DASHBOARD — Commerce Cards
// =============================================================================

export interface CompCommerceCard {
  id: string;
  title: string;
  icon: string;
  color: string;
}

export const COMP_COMMERCE: CompCommerceCard[] = [
  { id: 'tickets', title: 'Tickets', icon: 'ticket.fill', color: '#F59E0B' },
  { id: 'watch', title: 'Watch Live', icon: 'play.rectangle.fill', color: '#3B82F6' },
  { id: 'wildcard', title: 'Wildcard Entry', icon: 'star.fill', color: '#8B5CF6' },
];
