/**
 * Mock data for Sports mode.
 * Lincoln University Blue Tigers Men's Basketball
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

export interface Player {
  id: string;
  name: string;
  number: string;
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
  height: string;
  weight: string;
  classYear: 'FR' | 'SO' | 'JR' | 'SR' | 'GR';
  hometown: string;
  highSchool?: string;
  previousSchool?: string;
}

export interface RosterEntry {
  player: Player;
  role: 'starter' | 'rotation' | 'development';
  scholarshipPercent: number;
  nilAmount: number;
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
  isConference: boolean;
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
  id: 'lincoln-university',
  name: 'Lincoln University',
  nickname: 'Blue Tigers',
  location: 'Jefferson City, MO',
  conference: 'MIAA',
  division: 'NCAA Division II',
  founded: 1866,
  colors: {
    primary: '#003366',
    secondary: '#FFD700',
  },
  description: 'Lincoln University is a historically black university located in Jefferson City, Missouri. The Blue Tigers compete in the Mid-America Intercollegiate Athletics Association (MIAA) at the NCAA Division II level.',
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
    description: 'The flagship program competing at the NCAA Division II level in the MIAA conference.',
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
          id: 'player-johnson',
          name: 'Marcus Johnson',
          number: '1',
          position: 'PG',
          height: '6\'1"',
          weight: '175 lbs',
          classYear: 'SR',
          hometown: 'St. Louis, MO',
          highSchool: 'Kirkwood HS',
        },
        role: 'starter',
        scholarshipPercent: 100,
        nilAmount: 5000,
      },
      {
        player: {
          id: 'player-williams',
          name: 'DeShawn Williams',
          number: '32',
          position: 'C',
          height: '6\'10"',
          weight: '245 lbs',
          classYear: 'JR',
          hometown: 'Kansas City, MO',
          previousSchool: 'Coffeyville CC',
        },
        role: 'starter',
        scholarshipPercent: 100,
        nilAmount: 4000,
      },
      {
        player: {
          id: 'player-garcia',
          name: 'Anthony Garcia',
          number: '24',
          position: 'SG',
          height: '6\'4"',
          weight: '195 lbs',
          classYear: 'SO',
          hometown: 'Dallas, TX',
          highSchool: 'DeSoto HS',
        },
        role: 'starter',
        scholarshipPercent: 75,
        nilAmount: 2000,
      },
      {
        player: {
          id: 'player-thompson',
          name: 'Jaylen Thompson',
          number: '15',
          position: 'SF',
          height: '6\'6"',
          weight: '210 lbs',
          classYear: 'FR',
          hometown: 'Chicago, IL',
          highSchool: 'Simeon HS',
        },
        role: 'rotation',
        scholarshipPercent: 50,
        nilAmount: 1000,
      },
      {
        player: {
          id: 'player-harris',
          name: 'Kevin Harris',
          number: '23',
          position: 'PF',
          height: '6\'8"',
          weight: '225 lbs',
          classYear: 'SR',
          hometown: 'Memphis, TN',
          previousSchool: 'Three Rivers CC',
        },
        role: 'starter',
        scholarshipPercent: 100,
        nilAmount: 3500,
      },
      {
        player: {
          id: 'player-davis',
          name: 'Terrance Davis',
          number: '11',
          position: 'PG',
          height: '5\'11"',
          weight: '165 lbs',
          classYear: 'JR',
          hometown: 'Indianapolis, IN',
          highSchool: 'Pike HS',
        },
        role: 'rotation',
        scholarshipPercent: 50,
        nilAmount: 1500,
      },
      {
        player: {
          id: 'player-moore',
          name: 'Brandon Moore',
          number: '3',
          position: 'SG',
          height: '6\'3"',
          weight: '185 lbs',
          classYear: 'SO',
          hometown: 'Atlanta, GA',
          highSchool: 'Westlake HS',
        },
        role: 'rotation',
        scholarshipPercent: 25,
        nilAmount: 500,
      },
      {
        player: {
          id: 'player-jackson',
          name: 'Chris Jackson',
          number: '21',
          position: 'SF',
          height: '6\'5"',
          weight: '200 lbs',
          classYear: 'JR',
          hometown: 'Detroit, MI',
          previousSchool: 'Vincennes',
        },
        role: 'rotation',
        scholarshipPercent: 75,
        nilAmount: 2000,
      },
      {
        player: {
          id: 'player-white',
          name: 'Darius White',
          number: '44',
          position: 'PF',
          height: '6\'7"',
          weight: '220 lbs',
          classYear: 'FR',
          hometown: 'Houston, TX',
          highSchool: 'Yates HS',
        },
        role: 'development',
        scholarshipPercent: 25,
        nilAmount: 0,
      },
      {
        player: {
          id: 'player-robinson',
          name: 'Marcus Robinson',
          number: '5',
          position: 'C',
          height: '6\'9"',
          weight: '235 lbs',
          classYear: 'SO',
          hometown: 'Birmingham, AL',
          highSchool: 'Huffman HS',
        },
        role: 'rotation',
        scholarshipPercent: 50,
        nilAmount: 1000,
      },
    ],
    schedule: [
      // Completed games
      {
        id: 'game-culver',
        opponent: 'Culver-Stockton',
        date: new Date('2026-02-01'),
        time: '7:00 PM',
        location: 'Jason Gym',
        venue: 'home',
        status: 'final',
        result: { homeScore: 82, awayScore: 71, isWin: true },
        isConference: false,
      },
      {
        id: 'game-harris-stowe',
        opponent: 'Harris-Stowe',
        date: new Date('2026-02-04'),
        time: '7:00 PM',
        location: 'Jason Gym',
        venue: 'home',
        status: 'final',
        result: { homeScore: 78, awayScore: 65, isWin: true },
        isConference: false,
      },
      // Upcoming games
      {
        id: 'game-simpson',
        opponent: 'Simpson College',
        date: new Date('2026-02-08'),
        time: '3:00 PM',
        location: 'Jason Gym',
        venue: 'home',
        status: 'upcoming',
        isConference: false,
      },
      {
        id: 'game-central',
        opponent: 'Central Methodist',
        date: new Date('2026-02-15'),
        time: '7:00 PM',
        location: 'Puckett Fieldhouse',
        venue: 'away',
        status: 'upcoming',
        isConference: true,
      },
      {
        id: 'game-missouri-western',
        opponent: 'Missouri Western',
        date: new Date('2026-02-18'),
        time: '7:30 PM',
        location: 'MWSU Fieldhouse',
        venue: 'away',
        status: 'upcoming',
        isConference: true,
      },
      {
        id: 'game-northwest',
        opponent: 'Northwest Missouri',
        date: new Date('2026-02-22'),
        time: '4:00 PM',
        location: 'Jason Gym',
        venue: 'home',
        status: 'upcoming',
        isConference: true,
      },
      {
        id: 'game-pittsburg',
        opponent: 'Pittsburg State',
        date: new Date('2026-02-25'),
        time: '7:00 PM',
        location: 'John Lance Arena',
        venue: 'away',
        status: 'upcoming',
        isConference: true,
      },
    ],
    record: {
      overall: { wins: 16, losses: 6 },
      conference: { wins: 10, losses: 4 },
      home: { wins: 10, losses: 1 },
      away: { wins: 6, losses: 5 },
      streak: 'W2',
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
// HELPERS
// =============================================================================

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
