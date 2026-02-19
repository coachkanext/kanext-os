/**
 * Mock data for Sports mode.
 * FMU Men's Basketball
 */

// =============================================================================
// TYPES (extended from base types)
// =============================================================================

export interface Staff {
  id: string;
  name: string;
  title: string;
  role: 'head_coach' | 'assistant_coach' | 'coordinator' | 'trainer' | 'director';
  programId?: string;
  bio?: string;
  headshot?: string;
  phone?: string;
  email?: string;
}

export interface SeasonStats {
  gp: number;
  gs: number;
  mpg: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fgPct: number;
  threePct: number;
  ftPct: number;
}

export interface CareerSeason {
  year: string;
  team: string;
  level: string;
  stats: SeasonStats;
}

export interface Player {
  id: string;
  name: string;
  number: string;
  position: 'PG' | 'CG' | 'W' | 'F' | 'B';
  height: string;
  weight: string;
  classYear: 'FR' | 'SO' | 'JR' | 'SR' | 'GR';
  hometown: string;
  highSchool?: string;
  previousSchool?: string;
}

export interface PlayerProfile extends Player {
  bio?: string;
  careerTimeline: CareerSeason[];
}

export interface RosterEntry {
  player: Player;
  role: 'starter' | 'rotation' | 'development';
  scholarshipPercent: number;
  nilAmount: number;
}

export interface PlayerGameStats {
  playerId: string;
  playerName: string;
  playerNumber: string;
  minutes: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  fgMade: number;
  fgAttempted: number;
  threeMade: number;
  threeAttempted: number;
  ftMade: number;
  ftAttempted: number;
}

export interface BoxScore {
  teamStats: {
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    turnovers: number;
    fgPct: number;
    threePct: number;
    ftPct: number;
  };
  playerStats: PlayerGameStats[];
}

export interface Game {
  id: string;
  opponent: string;
  date: Date;
  time: string;
  location: string;
  venue: 'home' | 'away' | 'neutral';
  status: 'upcoming' | 'live' | 'final';
  result?: {
    homeScore: number;
    awayScore: number;
    isWin: boolean;
  };
  boxScore?: BoxScore;
  isConference: boolean;
}

export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  type: 'video' | 'article' | 'photo_gallery' | 'audio';
  source: string;
  url: string;
  thumbnail?: string;
  date: Date;
  duration?: string;
}

export interface SeasonRecord {
  overall: { wins: number; losses: number };
  conference: { wins: number; losses: number };
  home: { wins: number; losses: number };
  away: { wins: number; losses: number };
  streak: string;
}

export interface ProgramData {
  id: string;
  name: string;
  level: 'varsity' | 'development_1' | 'development_2' | 'postgrad';
  sport: string;
  description: string;
  staff: Staff[];
  roster: RosterEntry[];
  schedule: Game[];
  record: SeasonRecord;
}

// =============================================================================
// INSTITUTION DATA
// =============================================================================

export const INSTITUTION = {
  id: 'fmu',
  name: 'Florida Memorial University',
  nickname: 'Lions',
  location: 'Miami Gardens, FL',
  conference: 'Sun Conference',
  division: 'NAIA',
  founded: 1879,
  colors: {
    primary: '#003DA5',
    secondary: '#FFB81C',
  },
  description: 'Florida Memorial University is a private HBCU located in Miami Gardens, Florida. The basketball program competes in the NAIA Sun Conference.',
};

// =============================================================================
// LEADERSHIP (Institution-level)
// =============================================================================

export const INSTITUTION_LEADERSHIP: Staff[] = [
  {
    id: 'ad-wilson',
    name: 'Dr. Marcus Wilson',
    title: 'Athletic Director',
    role: 'director',
    bio: 'Dr. Wilson has served as Athletic Director since 2019, overseeing all 14 varsity sports programs.',
  },
  {
    id: 'assoc-ad-jones',
    name: 'Michelle Jones',
    title: 'Associate Athletic Director',
    role: 'director',
    bio: 'Michelle oversees compliance, student-athlete services, and academic support.',
  },
];

// =============================================================================
// PROGRAMS
// =============================================================================

export const PROGRAMS: ProgramData[] = [
  {
    id: 'varsity',
    name: 'Varsity',
    level: 'varsity',
    sport: "Men's Basketball",
    description: 'The flagship program competing at the NAIA level as an independent.',
    staff: [
      {
        id: 'coach-davis',
        name: 'James Davis',
        title: 'Head Coach',
        role: 'head_coach',
        programId: 'varsity',
        bio: 'Coach Davis enters his 8th season leading the Blue Tigers, compiling a 142-78 record.',
      },
      {
        id: 'coach-mitchell',
        name: 'Sarah Mitchell',
        title: 'Associate Head Coach',
        role: 'assistant_coach',
        programId: 'varsity',
        bio: 'Coach Mitchell specializes in player development and defensive strategies.',
      },
      {
        id: 'coach-brown',
        name: 'Marcus Brown',
        title: 'Assistant Coach',
        role: 'assistant_coach',
        programId: 'varsity',
        bio: 'Coach Brown handles recruiting and offensive scouting.',
      },
    ],
    roster: [
      {
        player: {
          id: 'player-bwilliams',
          name: 'Brandon Williams',
          number: '1',
          position: 'PG',
          height: '5\'10"',
          weight: '165 lbs',
          classYear: 'SR',
          hometown: 'Oakland, CA',
        },
        role: 'starter',
        scholarshipPercent: 100,
        nilAmount: 0,
      },
      {
        player: {
          id: 'player-plantey',
          name: 'Chris Plantey',
          number: '2',
          position: 'CG',
          height: '6\'2"',
          weight: '185 lbs',
          classYear: 'JR',
          hometown: 'Oakland, CA',
        },
        role: 'rotation',
        scholarshipPercent: 50,
        nilAmount: 0,
      },
      {
        player: {
          id: 'player-mckesey',
          name: 'Claude McKesey',
          number: '3',
          position: 'PG',
          height: '6\'0"',
          weight: '175 lbs',
          classYear: 'SO',
          hometown: 'Oakland, CA',
        },
        role: 'starter',
        scholarshipPercent: 100,
        nilAmount: 0,
      },
      {
        player: {
          id: 'player-manzo',
          name: 'Samuel Manzo',
          number: '5',
          position: 'CG',
          height: '—',
          weight: '—',
          classYear: 'FR',
          hometown: '—',
        },
        role: 'rotation',
        scholarshipPercent: 0,
        nilAmount: 0,
      },
      {
        player: {
          id: 'player-wall',
          name: 'Samuel Wall',
          number: '6',
          position: 'CG',
          height: '6\'3"',
          weight: '190 lbs',
          classYear: 'JR',
          hometown: 'Oakland, CA',
        },
        role: 'rotation',
        scholarshipPercent: 50,
        nilAmount: 0,
      },
      {
        player: {
          id: 'player-hernandez',
          name: 'Adrian Hernandez',
          number: '10',
          position: 'CG',
          height: '6\'1"',
          weight: '180 lbs',
          classYear: 'SO',
          hometown: 'Oakland, CA',
        },
        role: 'rotation',
        scholarshipPercent: 50,
        nilAmount: 0,
      },
      {
        player: {
          id: 'player-kalejaiye',
          name: 'Laolu Kalejaiye',
          number: '11',
          position: 'CG',
          height: '6\'4"',
          weight: '195 lbs',
          classYear: 'SR',
          hometown: 'Oakland, CA',
        },
        role: 'starter',
        scholarshipPercent: 100,
        nilAmount: 0,
      },
      {
        player: {
          id: 'player-chtelan',
          name: 'Nathan Chtelan',
          number: '15',
          position: 'W',
          height: '6\'5"',
          weight: '210 lbs',
          classYear: 'JR',
          hometown: 'Oakland, CA',
        },
        role: 'starter',
        scholarshipPercent: 100,
        nilAmount: 0,
      },
      {
        player: {
          id: 'player-bansraj',
          name: 'Nicholas Bansraj',
          number: '20',
          position: 'F',
          height: '6\'6"',
          weight: '215 lbs',
          classYear: 'SO',
          hometown: 'Oakland, CA',
        },
        role: 'rotation',
        scholarshipPercent: 50,
        nilAmount: 0,
      },
      {
        player: {
          id: 'player-diomande',
          name: 'Paul Diomande',
          number: '21',
          position: 'F',
          height: '6\'7"',
          weight: '220 lbs',
          classYear: 'JR',
          hometown: 'Oakland, CA',
        },
        role: 'starter',
        scholarshipPercent: 100,
        nilAmount: 0,
      },
    ],
    schedule: [],
    record: {
      overall: { wins: 0, losses: 0 },
      conference: { wins: 0, losses: 0 },
      home: { wins: 0, losses: 0 },
      away: { wins: 0, losses: 0 },
      streak: '—',
    },
  },
  {
    id: 'dev-1',
    name: 'Development I',
    level: 'development_1',
    sport: "Men's Basketball",
    description: 'Development program for players preparing to compete at the varsity level.',
    staff: [
      {
        id: 'coach-taylor',
        name: 'Robert Taylor',
        title: 'Development Coach',
        role: 'assistant_coach',
        programId: 'dev-1',
        bio: 'Coach Taylor focuses on fundamental skill development and game preparation.',
      },
    ],
    roster: [],
    schedule: [],
    record: {
      overall: { wins: 8, losses: 4 },
      conference: { wins: 0, losses: 0 },
      home: { wins: 5, losses: 1 },
      away: { wins: 3, losses: 3 },
      streak: 'W1',
    },
  },
  {
    id: 'dev-2',
    name: 'Development II',
    level: 'development_2',
    sport: "Men's Basketball",
    description: 'Entry-level development program focusing on fundamentals and conditioning.',
    staff: [],
    roster: [],
    schedule: [],
    record: {
      overall: { wins: 6, losses: 6 },
      conference: { wins: 0, losses: 0 },
      home: { wins: 4, losses: 2 },
      away: { wins: 2, losses: 4 },
      streak: 'L1',
    },
  },
  {
    id: 'postgrad',
    name: 'Postgrad',
    level: 'postgrad',
    sport: "Men's Basketball",
    description: 'Program for post-graduate players seeking additional development before moving on.',
    staff: [],
    roster: [],
    schedule: [],
    record: {
      overall: { wins: 4, losses: 2 },
      conference: { wins: 0, losses: 0 },
      home: { wins: 3, losses: 0 },
      away: { wins: 1, losses: 2 },
      streak: 'W2',
    },
  },
];

// =============================================================================
// PLAYER PROFILES (with career data)
// =============================================================================

export const PLAYER_PROFILES: Record<string, PlayerProfile> = {
  'player-bwilliams': {
    id: 'player-bwilliams',
    name: 'Brandon Williams',
    number: '1',
    position: 'PG',
    height: '5\'10"',
    weight: '165 lbs',
    classYear: 'SR',
    hometown: 'Oakland, CA',
    bio: 'A veteran point guard and floor general, Brandon leads the team with his court vision and scoring ability. A key contributor on both ends of the floor.',
    careerTimeline: [],
  },
  'player-plantey': {
    id: 'player-plantey',
    name: 'Chris Plantey',
    number: '2',
    position: 'CG',
    height: '6\'2"',
    weight: '185 lbs',
    classYear: 'JR',
    hometown: 'Oakland, CA',
    bio: 'A reliable two-way guard who brings energy and hustle every game. Chris is a steady presence in the rotation.',
    careerTimeline: [],
  },
  'player-mckesey': {
    id: 'player-mckesey',
    name: 'Claude McKesey',
    number: '3',
    position: 'PG',
    height: '6\'0"',
    weight: '175 lbs',
    classYear: 'SO',
    hometown: 'Oakland, CA',
    bio: 'A dynamic playmaker who can score and distribute. Claude brings a high basketball IQ and competitiveness to every possession.',
    careerTimeline: [],
  },
  'player-manzo': {
    id: 'player-manzo',
    name: 'Samuel Manzo',
    number: '5',
    position: 'CG',
    height: '—',
    weight: '—',
    classYear: 'FR',
    hometown: '—',
    bio: 'Bio coming soon.',
    careerTimeline: [],
  },
  'player-wall': {
    id: 'player-wall',
    name: 'Samuel Wall',
    number: '6',
    position: 'CG',
    height: '6\'3"',
    weight: '190 lbs',
    classYear: 'JR',
    hometown: 'Oakland, CA',
    bio: 'A versatile guard who contributes on both ends. Samuel provides quality depth and can defend multiple positions.',
    careerTimeline: [],
  },
  'player-hernandez': {
    id: 'player-hernandez',
    name: 'Adrian Hernandez',
    number: '10',
    position: 'CG',
    height: '6\'1"',
    weight: '180 lbs',
    classYear: 'SO',
    hometown: 'Oakland, CA',
    bio: 'A sharpshooter from beyond the arc, Adrian stretches the floor and creates space for the offense. His three-point shooting is a constant threat.',
    careerTimeline: [],
  },
  'player-kalejaiye': {
    id: 'player-kalejaiye',
    name: 'Laolu Kalejaiye',
    number: '11',
    position: 'CG',
    height: '6\'4"',
    weight: '195 lbs',
    classYear: 'SR',
    hometown: 'Oakland, CA',
    bio: 'The team\'s leading scorer and most explosive offensive player. Laolu can take over games with his scoring ability, particularly from three-point range.',
    careerTimeline: [],
  },
  'player-chtelan': {
    id: 'player-chtelan',
    name: 'Nathan Chtelan',
    number: '15',
    position: 'W',
    height: '6\'5"',
    weight: '210 lbs',
    classYear: 'JR',
    hometown: 'Oakland, CA',
    bio: 'A physical forward who can score inside and out. Nathan brings toughness, rebounding, and scoring punch to the lineup.',
    careerTimeline: [],
  },
  'player-bansraj': {
    id: 'player-bansraj',
    name: 'Nicholas Bansraj',
    number: '20',
    position: 'F',
    height: '6\'6"',
    weight: '215 lbs',
    classYear: 'SO',
    hometown: 'Oakland, CA',
    bio: 'A developing forward with length and athleticism. Nicholas continues to grow his game and provides energy off the bench.',
    careerTimeline: [],
  },
  'player-diomande': {
    id: 'player-diomande',
    name: 'Paul Diomande',
    number: '21',
    position: 'F',
    height: '6\'7"',
    weight: '220 lbs',
    classYear: 'JR',
    hometown: 'Oakland, CA',
    bio: 'A strong and physical forward who anchors the frontcourt. Paul brings rebounding, defense, and interior scoring to the lineup.',
    careerTimeline: [],
  },
};

// =============================================================================
// MEDIA
// =============================================================================

export const MEDIA_ITEMS: MediaItem[] = [];

// =============================================================================
// HELPERS
// =============================================================================

export function getPlayerProfile(playerId: string): PlayerProfile | undefined {
  return PLAYER_PROFILES[playerId];
}

export function getMediaItems(): MediaItem[] {
  return MEDIA_ITEMS.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function getProgramById(id: string): ProgramData | undefined {
  return PROGRAMS.find((p) => p.id === id);
}

export function getVarsityProgram(): ProgramData {
  return PROGRAMS.find((p) => p.level === 'varsity')!;
}

export function getUpcomingGames(programId: string, limit = 3): Game[] {
  const program = getProgramById(programId);
  if (!program) return [];

  return program.schedule
    .filter((g) => g.status === 'upcoming')
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, limit);
}

export function getLastGame(programId: string): Game | undefined {
  const program = getProgramById(programId);
  if (!program) return undefined;

  const completedGames = program.schedule
    .filter((g) => g.status === 'final')
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return completedGames[0];
}

export function getNextGame(programId: string): Game | undefined {
  const program = getProgramById(programId);
  if (!program) return undefined;

  const upcomingGames = program.schedule
    .filter((g) => g.status === 'upcoming')
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return upcomingGames[0];
}

export function formatRecord(record: { wins: number; losses: number }): string {
  return `${record.wins}-${record.losses}`;
}

export function formatGameDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatGameResult(game: Game): string {
  if (!game.result) return '';
  const { homeScore, awayScore, isWin } = game.result;
  const prefix = isWin ? 'W' : 'L';
  return game.venue === 'home'
    ? `${prefix} ${homeScore}-${awayScore}`
    : `${prefix} ${awayScore}-${homeScore}`;
}

export function getProgramLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    varsity: 'Varsity',
    development_1: 'Development I',
    development_2: 'Development II',
    postgrad: 'Postgrad',
  };
  return labels[level] || level;
}

export function getPositionName(position: string): string {
  const names: Record<string, string> = {
    PG: 'Point Guard',
    CG: 'Combo Guard',
    W: 'Wing',
    F: 'Forward',
    B: 'Big',
  };
  return names[position] || position;
}

export function getClassYearName(classYear: string): string {
  const names: Record<string, string> = {
    FR: 'Freshman',
    SO: 'Sophomore',
    JR: 'Junior',
    SR: 'Senior',
    GR: 'Graduate',
  };
  return names[classYear] || classYear;
}

export function formatStatValue(value: number, decimals = 1): string {
  return value.toFixed(decimals);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// =============================================================================
// RECRUITING TYPES
// =============================================================================

export type Division = 'NCAA_D1' | 'NCAA_D2' | 'NCAA_D3' | 'NAIA' | 'NJCAA' | 'CCCAA';

export interface NationalPlayer {
  id: string;
  name: string;
  position: 'PG' | 'CG' | 'W' | 'F' | 'B';
  height: string;
  weight: string;
  classYear: 'FR' | 'SO' | 'JR' | 'SR' | 'GR';
  currentTeam: string;
  currentDivision: Division;
  hometown: string;
  stats: SeasonStats;
  transferStatus?: 'available' | 'committed' | 'exploring';
  graduatingYear?: number;
}

export type RecruitingStatus = 'watching' | 'priority' | 'contacted' | 'offered' | 'committed' | 'archived';
export type RecruitingPriority = 'A' | 'B' | 'C';

export interface RecruitingTarget {
  id: string;
  playerId: string;
  player: NationalPlayer;
  programId: string;
  status: RecruitingStatus;
  priority: RecruitingPriority;
  fitPercent?: number;
  notes?: string;
  nextStep?: string;
  nextStepDate?: Date;
  recruiter?: string;
  plannedScholarship?: number;
  plannedNil?: number;
  lastUpdated: Date;
  addedDate: Date;
}

// =============================================================================
// NATIONAL PLAYER POOL DATA
// =============================================================================

export const NATIONAL_PLAYERS: NationalPlayer[] = [
  {
    id: 'np-jaylen-brooks',
    name: 'Jaylen Brooks',
    position: 'PG',
    height: '6\'1"',
    weight: '175 lbs',
    classYear: 'JR',
    currentTeam: 'Central Methodist',
    currentDivision: 'NAIA',
    hometown: 'Kansas City, MO',
    transferStatus: 'available',
    stats: { gp: 28, gs: 28, mpg: 32.5, ppg: 18.4, rpg: 3.2, apg: 6.8, spg: 1.9, bpg: 0.1, fgPct: 44.2, threePct: 38.1, ftPct: 82.3 },
  },
  {
    id: 'np-marcus-wells',
    name: 'Marcus Wells',
    position: 'CG',
    height: '6\'4"',
    weight: '195 lbs',
    classYear: 'SR',
    currentTeam: 'William Jewell',
    currentDivision: 'NCAA_D2',
    hometown: 'St. Louis, MO',
    transferStatus: 'exploring',
    stats: { gp: 30, gs: 30, mpg: 34.1, ppg: 16.2, rpg: 4.5, apg: 2.8, spg: 1.2, bpg: 0.3, fgPct: 46.8, threePct: 41.2, ftPct: 79.5 },
  },
  {
    id: 'np-darius-coleman',
    name: 'Darius Coleman',
    position: 'W',
    height: '6\'6"',
    weight: '210 lbs',
    classYear: 'SO',
    currentTeam: 'Drury',
    currentDivision: 'NCAA_D2',
    hometown: 'Springfield, MO',
    transferStatus: 'available',
    stats: { gp: 26, gs: 18, mpg: 25.3, ppg: 12.8, rpg: 5.9, apg: 1.4, spg: 0.8, bpg: 0.6, fgPct: 48.5, threePct: 35.6, ftPct: 71.2 },
  },
  {
    id: 'np-tre-washington',
    name: 'Tre Washington',
    position: 'F',
    height: '6\'7"',
    weight: '225 lbs',
    classYear: 'JR',
    currentTeam: 'Missouri S&T',
    currentDivision: 'NCAA_D2',
    hometown: 'Rolla, MO',
    transferStatus: 'available',
    stats: { gp: 29, gs: 29, mpg: 30.8, ppg: 14.6, rpg: 8.2, apg: 1.9, spg: 0.6, bpg: 1.4, fgPct: 52.1, threePct: 32.8, ftPct: 68.9 },
  },
  {
    id: 'np-anthony-harris',
    name: 'Anthony Harris',
    position: 'B',
    height: '6\'10"',
    weight: '245 lbs',
    classYear: 'SR',
    currentTeam: 'Truman State',
    currentDivision: 'NCAA_D2',
    hometown: 'Columbia, MO',
    transferStatus: 'exploring',
    stats: { gp: 27, gs: 27, mpg: 28.4, ppg: 11.5, rpg: 9.1, apg: 1.1, spg: 0.4, bpg: 2.3, fgPct: 58.6, threePct: 0, ftPct: 65.4 },
  },
  {
    id: 'np-kevin-jones',
    name: 'Kevin Jones',
    position: 'PG',
    height: '5\'11"',
    weight: '165 lbs',
    classYear: 'FR',
    currentTeam: 'State Fair CC',
    currentDivision: 'NJCAA',
    hometown: 'Sedalia, MO',
    stats: { gp: 30, gs: 25, mpg: 28.2, ppg: 14.8, rpg: 2.8, apg: 5.4, spg: 2.1, bpg: 0.0, fgPct: 42.3, threePct: 36.5, ftPct: 78.9 },
  },
  {
    id: 'np-chris-taylor',
    name: 'Chris Taylor',
    position: 'CG',
    height: '6\'3"',
    weight: '185 lbs',
    classYear: 'SO',
    currentTeam: 'Moberly Area CC',
    currentDivision: 'NJCAA',
    hometown: 'Moberly, MO',
    stats: { gp: 32, gs: 32, mpg: 31.5, ppg: 19.2, rpg: 3.9, apg: 2.2, spg: 1.5, bpg: 0.2, fgPct: 45.8, threePct: 39.4, ftPct: 84.1 },
  },
  {
    id: 'np-malik-brown',
    name: 'Malik Brown',
    position: 'W',
    height: '6\'5"',
    weight: '200 lbs',
    classYear: 'JR',
    currentTeam: 'Northwest Missouri State',
    currentDivision: 'NCAA_D2',
    hometown: 'Maryville, MO',
    transferStatus: 'available',
    stats: { gp: 28, gs: 22, mpg: 26.7, ppg: 13.1, rpg: 4.8, apg: 2.1, spg: 1.1, bpg: 0.4, fgPct: 47.2, threePct: 37.8, ftPct: 76.3 },
  },
  {
    id: 'np-devon-carter',
    name: 'Devon Carter',
    position: 'F',
    height: '6\'8"',
    weight: '235 lbs',
    classYear: 'GR',
    currentTeam: 'UCM',
    currentDivision: 'NCAA_D2',
    hometown: 'Warrensburg, MO',
    transferStatus: 'available',
    stats: { gp: 31, gs: 31, mpg: 32.1, ppg: 15.8, rpg: 7.6, apg: 2.4, spg: 0.7, bpg: 1.1, fgPct: 51.4, threePct: 34.2, ftPct: 72.8 },
  },
  {
    id: 'np-jermaine-scott',
    name: 'Jermaine Scott',
    position: 'B',
    height: '6\'9"',
    weight: '250 lbs',
    classYear: 'SO',
    currentTeam: 'Pittsburg State',
    currentDivision: 'NCAA_D2',
    hometown: 'Pittsburg, KS',
    stats: { gp: 25, gs: 12, mpg: 18.6, ppg: 8.4, rpg: 6.2, apg: 0.8, spg: 0.3, bpg: 1.8, fgPct: 54.2, threePct: 0, ftPct: 62.1 },
  },
  {
    id: 'np-isaiah-mitchell',
    name: 'Isaiah Mitchell',
    position: 'PG',
    height: '6\'2"',
    weight: '180 lbs',
    classYear: 'JR',
    currentTeam: 'Evangel',
    currentDivision: 'NAIA',
    hometown: 'Springfield, MO',
    transferStatus: 'exploring',
    stats: { gp: 29, gs: 29, mpg: 33.8, ppg: 16.9, rpg: 3.5, apg: 7.2, spg: 1.6, bpg: 0.1, fgPct: 43.5, threePct: 37.2, ftPct: 80.6 },
  },
  {
    id: 'np-xavier-green',
    name: 'Xavier Green',
    position: 'CG',
    height: '6\'5"',
    weight: '205 lbs',
    classYear: 'SR',
    currentTeam: 'Missouri Western',
    currentDivision: 'NCAA_D2',
    hometown: 'St. Joseph, MO',
    transferStatus: 'available',
    stats: { gp: 30, gs: 28, mpg: 29.4, ppg: 14.7, rpg: 4.2, apg: 3.1, spg: 1.3, bpg: 0.5, fgPct: 45.9, threePct: 40.1, ftPct: 81.2 },
  },
];

// =============================================================================
// RECRUITING BOARD DATA
// =============================================================================

export const RECRUITING_TARGETS: RecruitingTarget[] = [
  {
    id: 'rt-jaylen-brooks',
    playerId: 'np-jaylen-brooks',
    player: NATIONAL_PLAYERS.find((p) => p.id === 'np-jaylen-brooks')!,
    programId: 'mbb-varsity',
    status: 'priority',
    priority: 'A',
    fitPercent: 92,
    notes: 'Elite ball-handler with court vision. Would immediately compete for starting PG role.',
    nextStep: 'Schedule campus visit',
    nextStepDate: new Date('2026-02-15'),
    recruiter: 'Coach Thompson',
    plannedScholarship: 100,
    plannedNil: 15000,
    lastUpdated: new Date('2026-02-03'),
    addedDate: new Date('2026-01-10'),
  },
  {
    id: 'rt-marcus-wells',
    playerId: 'np-marcus-wells',
    player: NATIONAL_PLAYERS.find((p) => p.id === 'np-marcus-wells')!,
    programId: 'mbb-varsity',
    status: 'contacted',
    priority: 'A',
    fitPercent: 88,
    notes: 'Proven scorer at D2 level. Great 3-point shooting would stretch the floor.',
    nextStep: 'Follow up call',
    nextStepDate: new Date('2026-02-10'),
    recruiter: 'Coach Williams',
    plannedScholarship: 75,
    plannedNil: 12000,
    lastUpdated: new Date('2026-02-01'),
    addedDate: new Date('2026-01-15'),
  },
  {
    id: 'rt-darius-coleman',
    playerId: 'np-darius-coleman',
    player: NATIONAL_PLAYERS.find((p) => p.id === 'np-darius-coleman')!,
    programId: 'mbb-varsity',
    status: 'watching',
    priority: 'B',
    fitPercent: 78,
    notes: 'Versatile wing with length. Still developing but high ceiling.',
    lastUpdated: new Date('2026-01-28'),
    addedDate: new Date('2026-01-20'),
  },
  {
    id: 'rt-tre-washington',
    playerId: 'np-tre-washington',
    player: NATIONAL_PLAYERS.find((p) => p.id === 'np-tre-washington')!,
    programId: 'mbb-varsity',
    status: 'offered',
    priority: 'A',
    fitPercent: 85,
    notes: 'Physical presence inside. Double-double machine who can protect the rim.',
    nextStep: 'Awaiting decision',
    recruiter: 'Coach Thompson',
    plannedScholarship: 100,
    plannedNil: 18000,
    lastUpdated: new Date('2026-02-04'),
    addedDate: new Date('2025-12-01'),
  },
  {
    id: 'rt-chris-taylor',
    playerId: 'np-chris-taylor',
    player: NATIONAL_PLAYERS.find((p) => p.id === 'np-chris-taylor')!,
    programId: 'mbb-varsity',
    status: 'priority',
    priority: 'B',
    fitPercent: 82,
    notes: 'Pure scorer from JUCO. Needs to improve defense but offensive upside is significant.',
    nextStep: 'In-home visit',
    nextStepDate: new Date('2026-02-12'),
    recruiter: 'Coach Williams',
    plannedScholarship: 100,
    plannedNil: 10000,
    lastUpdated: new Date('2026-02-02'),
    addedDate: new Date('2026-01-05'),
  },
  {
    id: 'rt-malik-brown',
    playerId: 'np-malik-brown',
    player: NATIONAL_PLAYERS.find((p) => p.id === 'np-malik-brown')!,
    programId: 'mbb-varsity',
    status: 'watching',
    priority: 'C',
    fitPercent: 71,
    notes: 'Solid all-around player. Good depth option if primary targets fall through.',
    lastUpdated: new Date('2026-01-25'),
    addedDate: new Date('2026-01-22'),
  },
  {
    id: 'rt-devon-carter',
    playerId: 'np-devon-carter',
    player: NATIONAL_PLAYERS.find((p) => p.id === 'np-devon-carter')!,
    programId: 'mbb-varsity',
    status: 'contacted',
    priority: 'B',
    fitPercent: 80,
    notes: 'Graduate transfer with one year of eligibility. Immediate impact player.',
    nextStep: 'Send offer',
    nextStepDate: new Date('2026-02-08'),
    recruiter: 'Coach Thompson',
    plannedScholarship: 50,
    plannedNil: 8000,
    lastUpdated: new Date('2026-02-01'),
    addedDate: new Date('2026-01-18'),
  },
];

// =============================================================================
// RECRUITING HELPERS
// =============================================================================

export function getNationalPlayers(): NationalPlayer[] {
  return NATIONAL_PLAYERS;
}

export function getNationalPlayerById(playerId: string): NationalPlayer | undefined {
  return NATIONAL_PLAYERS.find((p) => p.id === playerId);
}

export function getRecruitingTargets(programId?: string): RecruitingTarget[] {
  if (programId) {
    return RECRUITING_TARGETS.filter((t) => t.programId === programId);
  }
  return RECRUITING_TARGETS;
}

export function getRecruitingTargetsByStatus(status: RecruitingStatus, programId?: string): RecruitingTarget[] {
  return getRecruitingTargets(programId).filter((t) => t.status === status);
}

export function getRecruitingTargetsByPriority(priority: RecruitingPriority, programId?: string): RecruitingTarget[] {
  return getRecruitingTargets(programId).filter((t) => t.priority === priority);
}

export function getRecruitingTargetForPlayer(playerId: string, programId?: string): RecruitingTarget | undefined {
  return getRecruitingTargets(programId).find((t) => t.playerId === playerId);
}

export function getDivisionLabel(division: Division): string {
  const labels: Record<Division, string> = {
    NCAA_D1: 'NCAA D1',
    NCAA_D2: 'NCAA D2',
    NCAA_D3: 'NCAA D3',
    NAIA: 'NAIA',
    NJCAA: 'JUCO',
    CCCAA: 'CCCAA',
  };
  return labels[division];
}

export function getRecruitingStatusLabel(status: RecruitingStatus): string {
  const labels: Record<RecruitingStatus, string> = {
    watching: 'Watching',
    priority: 'Priority',
    contacted: 'Contacted',
    offered: 'Offered',
    committed: 'Committed',
    archived: 'Archived',
  };
  return labels[status];
}

export function getRecruitingStatusColor(status: RecruitingStatus): string {
  const colors: Record<RecruitingStatus, string> = {
    watching: '#555555',
    priority: '#6e6e6e',
    contacted: '#d4d4d4',
    offered: '#ffffff',
    committed: '#f5f5f5',
    archived: '#555555',
  };
  return colors[status];
}
