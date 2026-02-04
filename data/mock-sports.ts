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
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
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
        boxScore: {
          teamStats: {
            points: 82,
            rebounds: 38,
            assists: 18,
            steals: 8,
            blocks: 5,
            turnovers: 12,
            fgPct: 48.2,
            threePct: 36.4,
            ftPct: 78.5,
          },
          playerStats: [
            { playerId: 'player-johnson', playerName: 'Marcus Johnson', playerNumber: '1', minutes: 36, points: 25, rebounds: 4, assists: 8, steals: 2, blocks: 0, turnovers: 3, fouls: 2, fgMade: 9, fgAttempted: 18, threeMade: 4, threeAttempted: 8, ftMade: 3, ftAttempted: 4 },
            { playerId: 'player-williams', playerName: 'DeShawn Williams', playerNumber: '32', minutes: 32, points: 18, rebounds: 12, assists: 2, steals: 1, blocks: 3, turnovers: 2, fouls: 4, fgMade: 8, fgAttempted: 12, threeMade: 0, threeAttempted: 0, ftMade: 2, ftAttempted: 4 },
            { playerId: 'player-harris', playerName: 'Kevin Harris', playerNumber: '23', minutes: 34, points: 16, rebounds: 9, assists: 3, steals: 1, blocks: 1, turnovers: 2, fouls: 3, fgMade: 6, fgAttempted: 11, threeMade: 2, threeAttempted: 5, ftMade: 2, ftAttempted: 2 },
            { playerId: 'player-garcia', playerName: 'Anthony Garcia', playerNumber: '24', minutes: 30, points: 12, rebounds: 3, assists: 2, steals: 2, blocks: 0, turnovers: 1, fouls: 2, fgMade: 4, fgAttempted: 10, threeMade: 3, threeAttempted: 7, ftMade: 1, ftAttempted: 1 },
            { playerId: 'player-thompson', playerName: 'Jaylen Thompson', playerNumber: '15', minutes: 22, points: 6, rebounds: 5, assists: 1, steals: 1, blocks: 1, turnovers: 2, fouls: 3, fgMade: 3, fgAttempted: 6, threeMade: 0, threeAttempted: 2, ftMade: 0, ftAttempted: 0 },
            { playerId: 'player-davis', playerName: 'Terrance Davis', playerNumber: '11', minutes: 14, points: 3, rebounds: 1, assists: 2, steals: 1, blocks: 0, turnovers: 1, fouls: 1, fgMade: 1, fgAttempted: 3, threeMade: 1, threeAttempted: 2, ftMade: 0, ftAttempted: 0 },
            { playerId: 'player-jackson', playerName: 'Chris Jackson', playerNumber: '21', minutes: 18, points: 2, rebounds: 3, assists: 0, steals: 0, blocks: 0, turnovers: 1, fouls: 2, fgMade: 1, fgAttempted: 4, threeMade: 0, threeAttempted: 1, ftMade: 0, ftAttempted: 0 },
            { playerId: 'player-robinson', playerName: 'Marcus Robinson', playerNumber: '5', minutes: 14, points: 0, rebounds: 1, assists: 0, steals: 0, blocks: 0, turnovers: 0, fouls: 2, fgMade: 0, fgAttempted: 2, threeMade: 0, threeAttempted: 0, ftMade: 0, ftAttempted: 0 },
          ],
        },
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
        boxScore: {
          teamStats: {
            points: 78,
            rebounds: 35,
            assists: 16,
            steals: 10,
            blocks: 4,
            turnovers: 10,
            fgPct: 45.8,
            threePct: 33.3,
            ftPct: 82.0,
          },
          playerStats: [
            { playerId: 'player-johnson', playerName: 'Marcus Johnson', playerNumber: '1', minutes: 34, points: 18, rebounds: 3, assists: 7, steals: 3, blocks: 0, turnovers: 2, fouls: 1, fgMade: 7, fgAttempted: 15, threeMade: 2, threeAttempted: 6, ftMade: 2, ftAttempted: 2 },
            { playerId: 'player-williams', playerName: 'DeShawn Williams', playerNumber: '32', minutes: 30, points: 14, rebounds: 10, assists: 1, steals: 0, blocks: 2, turnovers: 1, fouls: 3, fgMade: 6, fgAttempted: 10, threeMade: 0, threeAttempted: 0, ftMade: 2, ftAttempted: 3 },
            { playerId: 'player-harris', playerName: 'Kevin Harris', playerNumber: '23', minutes: 32, points: 20, rebounds: 8, assists: 2, steals: 2, blocks: 1, turnovers: 2, fouls: 2, fgMade: 8, fgAttempted: 14, threeMade: 2, threeAttempted: 4, ftMade: 2, ftAttempted: 2 },
            { playerId: 'player-garcia', playerName: 'Anthony Garcia', playerNumber: '24', minutes: 28, points: 14, rebounds: 4, assists: 3, steals: 2, blocks: 0, turnovers: 1, fouls: 2, fgMade: 5, fgAttempted: 12, threeMade: 2, threeAttempted: 6, ftMade: 2, ftAttempted: 2 },
            { playerId: 'player-thompson', playerName: 'Jaylen Thompson', playerNumber: '15', minutes: 20, points: 8, rebounds: 4, assists: 1, steals: 1, blocks: 1, turnovers: 2, fouls: 4, fgMade: 4, fgAttempted: 7, threeMade: 0, threeAttempted: 1, ftMade: 0, ftAttempted: 0 },
            { playerId: 'player-davis', playerName: 'Terrance Davis', playerNumber: '11', minutes: 16, points: 2, rebounds: 2, assists: 2, steals: 1, blocks: 0, turnovers: 1, fouls: 1, fgMade: 1, fgAttempted: 4, threeMade: 0, threeAttempted: 2, ftMade: 0, ftAttempted: 0 },
            { playerId: 'player-jackson', playerName: 'Chris Jackson', playerNumber: '21', minutes: 22, points: 2, rebounds: 3, assists: 0, steals: 1, blocks: 0, turnovers: 1, fouls: 3, fgMade: 1, fgAttempted: 5, threeMade: 0, threeAttempted: 2, ftMade: 0, ftAttempted: 0 },
            { playerId: 'player-moore', playerName: 'Brandon Moore', playerNumber: '3', minutes: 10, points: 0, rebounds: 1, assists: 0, steals: 0, blocks: 0, turnovers: 0, fouls: 1, fgMade: 0, fgAttempted: 2, threeMade: 0, threeAttempted: 1, ftMade: 0, ftAttempted: 0 },
            { playerId: 'player-robinson', playerName: 'Marcus Robinson', playerNumber: '5', minutes: 8, points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0, fouls: 2, fgMade: 0, fgAttempted: 1, threeMade: 0, threeAttempted: 0, ftMade: 0, ftAttempted: 0 },
          ],
        },
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
// PLAYER PROFILES (with career data)
// =============================================================================

export const PLAYER_PROFILES: Record<string, PlayerProfile> = {
  'player-johnson': {
    id: 'player-johnson',
    name: 'Marcus Johnson',
    number: '1',
    position: 'PG',
    height: '6\'1"',
    weight: '175 lbs',
    classYear: 'SR',
    hometown: 'St. Louis, MO',
    highSchool: 'Kirkwood HS',
    bio: 'A four-year starter and team captain, Marcus has been the engine of the Blue Tigers offense since his freshman year. Known for his court vision and clutch performances, he holds the program record for career assists.',
    careerTimeline: [
      {
        year: '2025-26',
        team: 'Lincoln University',
        level: 'NCAA D2',
        stats: { gp: 22, gs: 22, mpg: 34.2, ppg: 16.8, rpg: 3.2, apg: 7.4, spg: 1.8, bpg: 0.1, fgPct: 45.2, threePct: 38.1, ftPct: 84.5 },
      },
      {
        year: '2024-25',
        team: 'Lincoln University',
        level: 'NCAA D2',
        stats: { gp: 28, gs: 28, mpg: 33.5, ppg: 14.2, rpg: 3.0, apg: 6.8, spg: 1.6, bpg: 0.1, fgPct: 43.8, threePct: 36.5, ftPct: 82.3 },
      },
      {
        year: '2023-24',
        team: 'Lincoln University',
        level: 'NCAA D2',
        stats: { gp: 26, gs: 26, mpg: 31.2, ppg: 12.5, rpg: 2.8, apg: 5.9, spg: 1.4, bpg: 0.0, fgPct: 42.1, threePct: 34.2, ftPct: 80.0 },
      },
      {
        year: '2022-23',
        team: 'Lincoln University',
        level: 'NCAA D2',
        stats: { gp: 24, gs: 20, mpg: 28.4, ppg: 9.8, rpg: 2.5, apg: 4.6, spg: 1.2, bpg: 0.0, fgPct: 40.5, threePct: 32.8, ftPct: 78.5 },
      },
    ],
  },
  'player-williams': {
    id: 'player-williams',
    name: 'DeShawn Williams',
    number: '32',
    position: 'C',
    height: '6\'10"',
    weight: '245 lbs',
    classYear: 'JR',
    hometown: 'Kansas City, MO',
    previousSchool: 'Coffeyville CC',
    bio: 'A dominant presence in the paint, DeShawn transferred from Coffeyville CC where he was a NJCAA All-American. He leads the team in rebounds and blocks while anchoring the defense.',
    careerTimeline: [
      {
        year: '2025-26',
        team: 'Lincoln University',
        level: 'NCAA D2',
        stats: { gp: 22, gs: 22, mpg: 28.5, ppg: 14.2, rpg: 9.8, apg: 1.2, spg: 0.6, bpg: 2.4, fgPct: 58.2, threePct: 0.0, ftPct: 68.5 },
      },
      {
        year: '2024-25',
        team: 'Lincoln University',
        level: 'NCAA D2',
        stats: { gp: 28, gs: 28, mpg: 26.8, ppg: 12.5, rpg: 8.9, apg: 1.0, spg: 0.5, bpg: 2.1, fgPct: 56.8, threePct: 0.0, ftPct: 65.2 },
      },
      {
        year: '2023-24',
        team: 'Coffeyville CC',
        level: 'NJCAA',
        stats: { gp: 32, gs: 32, mpg: 30.2, ppg: 16.8, rpg: 11.2, apg: 1.5, spg: 0.8, bpg: 3.0, fgPct: 62.5, threePct: 0.0, ftPct: 62.0 },
      },
    ],
  },
  'player-garcia': {
    id: 'player-garcia',
    name: 'Anthony Garcia',
    number: '24',
    position: 'SG',
    height: '6\'4"',
    weight: '195 lbs',
    classYear: 'SO',
    hometown: 'Dallas, TX',
    highSchool: 'DeSoto HS',
    bio: 'A sharpshooting guard with a quick release, Anthony emerged as a key contributor midway through his freshman season. His three-point shooting has been crucial to opening up the offense.',
    careerTimeline: [
      {
        year: '2025-26',
        team: 'Lincoln University',
        level: 'NCAA D2',
        stats: { gp: 22, gs: 22, mpg: 30.1, ppg: 13.5, rpg: 3.8, apg: 2.4, spg: 1.2, bpg: 0.2, fgPct: 44.8, threePct: 41.2, ftPct: 86.0 },
      },
      {
        year: '2024-25',
        team: 'Lincoln University',
        level: 'NCAA D2',
        stats: { gp: 26, gs: 12, mpg: 22.5, ppg: 8.2, rpg: 2.5, apg: 1.8, spg: 0.8, bpg: 0.1, fgPct: 42.0, threePct: 38.5, ftPct: 82.5 },
      },
    ],
  },
  'player-thompson': {
    id: 'player-thompson',
    name: 'Jaylen Thompson',
    number: '15',
    position: 'SF',
    height: '6\'6"',
    weight: '210 lbs',
    classYear: 'FR',
    hometown: 'Chicago, IL',
    highSchool: 'Simeon HS',
    bio: 'A highly-recruited prospect from the Chicago powerhouse Simeon HS, Jaylen brings elite athleticism and defensive versatility. He\'s shown flashes of his potential as a two-way player.',
    careerTimeline: [
      {
        year: '2025-26',
        team: 'Lincoln University',
        level: 'NCAA D2',
        stats: { gp: 20, gs: 8, mpg: 18.5, ppg: 7.2, rpg: 4.1, apg: 1.5, spg: 1.0, bpg: 0.5, fgPct: 46.5, threePct: 32.0, ftPct: 72.0 },
      },
    ],
  },
  'player-harris': {
    id: 'player-harris',
    name: 'Kevin Harris',
    number: '23',
    position: 'PF',
    height: '6\'8"',
    weight: '225 lbs',
    classYear: 'SR',
    hometown: 'Memphis, TN',
    previousSchool: 'Three Rivers CC',
    bio: 'A skilled stretch-four who can score inside and out, Kevin has been a consistent double-double threat since joining the program. His leadership and experience have been invaluable.',
    careerTimeline: [
      {
        year: '2025-26',
        team: 'Lincoln University',
        level: 'NCAA D2',
        stats: { gp: 22, gs: 22, mpg: 32.0, ppg: 15.2, rpg: 8.5, apg: 2.2, spg: 0.8, bpg: 1.0, fgPct: 52.5, threePct: 35.8, ftPct: 76.5 },
      },
      {
        year: '2024-25',
        team: 'Lincoln University',
        level: 'NCAA D2',
        stats: { gp: 28, gs: 28, mpg: 30.5, ppg: 13.8, rpg: 7.8, apg: 1.8, spg: 0.7, bpg: 0.8, fgPct: 50.2, threePct: 33.5, ftPct: 74.0 },
      },
      {
        year: '2023-24',
        team: 'Three Rivers CC',
        level: 'NJCAA',
        stats: { gp: 30, gs: 30, mpg: 28.2, ppg: 18.5, rpg: 10.2, apg: 2.5, spg: 1.0, bpg: 1.2, fgPct: 55.0, threePct: 30.0, ftPct: 70.0 },
      },
    ],
  },
  'player-davis': {
    id: 'player-davis',
    name: 'Terrance Davis',
    number: '11',
    position: 'PG',
    height: '5\'11"',
    weight: '165 lbs',
    classYear: 'JR',
    hometown: 'Indianapolis, IN',
    highSchool: 'Pike HS',
    bio: 'A speedy backup point guard known for his defensive intensity and ability to change the tempo of the game. Terrance provides quality minutes and leadership off the bench.',
    careerTimeline: [
      {
        year: '2025-26',
        team: 'Lincoln University',
        level: 'NCAA D2',
        stats: { gp: 22, gs: 0, mpg: 16.2, ppg: 5.8, rpg: 1.5, apg: 3.2, spg: 1.5, bpg: 0.0, fgPct: 42.0, threePct: 35.0, ftPct: 80.0 },
      },
      {
        year: '2024-25',
        team: 'Lincoln University',
        level: 'NCAA D2',
        stats: { gp: 28, gs: 0, mpg: 14.5, ppg: 4.5, rpg: 1.2, apg: 2.8, spg: 1.2, bpg: 0.0, fgPct: 40.5, threePct: 32.0, ftPct: 78.0 },
      },
      {
        year: '2023-24',
        team: 'Lincoln University',
        level: 'NCAA D2',
        stats: { gp: 24, gs: 0, mpg: 10.2, ppg: 2.8, rpg: 0.8, apg: 1.8, spg: 0.8, bpg: 0.0, fgPct: 38.0, threePct: 28.0, ftPct: 75.0 },
      },
    ],
  },
  'player-moore': {
    id: 'player-moore',
    name: 'Brandon Moore',
    number: '3',
    position: 'SG',
    height: '6\'3"',
    weight: '185 lbs',
    classYear: 'SO',
    hometown: 'Atlanta, GA',
    highSchool: 'Westlake HS',
    bio: 'An athletic guard with a high motor, Brandon has improved significantly from his freshman year. His ability to get to the rim and finish through contact makes him a valuable option.',
    careerTimeline: [
      {
        year: '2025-26',
        team: 'Lincoln University',
        level: 'NCAA D2',
        stats: { gp: 20, gs: 0, mpg: 14.8, ppg: 6.2, rpg: 2.2, apg: 1.0, spg: 0.6, bpg: 0.2, fgPct: 48.0, threePct: 30.0, ftPct: 70.0 },
      },
      {
        year: '2024-25',
        team: 'Lincoln University',
        level: 'NCAA D2',
        stats: { gp: 22, gs: 0, mpg: 8.5, ppg: 3.0, rpg: 1.2, apg: 0.5, spg: 0.3, bpg: 0.1, fgPct: 44.0, threePct: 25.0, ftPct: 65.0 },
      },
    ],
  },
  'player-jackson': {
    id: 'player-jackson',
    name: 'Chris Jackson',
    number: '21',
    position: 'SF',
    height: '6\'5"',
    weight: '200 lbs',
    classYear: 'JR',
    hometown: 'Detroit, MI',
    previousSchool: 'Vincennes',
    bio: 'A versatile wing who can defend multiple positions, Chris brings toughness and energy every game. His mid-range game has become a reliable weapon in the half-court offense.',
    careerTimeline: [
      {
        year: '2025-26',
        team: 'Lincoln University',
        level: 'NCAA D2',
        stats: { gp: 22, gs: 2, mpg: 20.5, ppg: 8.5, rpg: 4.2, apg: 1.8, spg: 1.0, bpg: 0.4, fgPct: 47.5, threePct: 33.0, ftPct: 75.0 },
      },
      {
        year: '2024-25',
        team: 'Lincoln University',
        level: 'NCAA D2',
        stats: { gp: 26, gs: 0, mpg: 15.2, ppg: 5.8, rpg: 3.0, apg: 1.2, spg: 0.7, bpg: 0.2, fgPct: 45.0, threePct: 30.0, ftPct: 72.0 },
      },
      {
        year: '2023-24',
        team: 'Vincennes',
        level: 'NJCAA',
        stats: { gp: 30, gs: 28, mpg: 26.5, ppg: 12.2, rpg: 5.8, apg: 2.0, spg: 1.2, bpg: 0.5, fgPct: 50.0, threePct: 32.0, ftPct: 70.0 },
      },
    ],
  },
  'player-white': {
    id: 'player-white',
    name: 'Darius White',
    number: '44',
    position: 'PF',
    height: '6\'7"',
    weight: '220 lbs',
    classYear: 'FR',
    hometown: 'Houston, TX',
    highSchool: 'Yates HS',
    bio: 'A raw but talented freshman with excellent length and athleticism. Darius is still developing his game but shows promise as a future contributor in the frontcourt.',
    careerTimeline: [
      {
        year: '2025-26',
        team: 'Lincoln University',
        level: 'NCAA D2',
        stats: { gp: 12, gs: 0, mpg: 6.5, ppg: 2.2, rpg: 1.8, apg: 0.2, spg: 0.2, bpg: 0.3, fgPct: 52.0, threePct: 0.0, ftPct: 55.0 },
      },
    ],
  },
  'player-robinson': {
    id: 'player-robinson',
    name: 'Marcus Robinson',
    number: '5',
    position: 'C',
    height: '6\'9"',
    weight: '235 lbs',
    classYear: 'SO',
    hometown: 'Birmingham, AL',
    highSchool: 'Huffman HS',
    bio: 'A mobile big man who can protect the rim and finish around the basket, Marcus provides solid depth at center. His conditioning has improved and he\'s ready for an expanded role.',
    careerTimeline: [
      {
        year: '2025-26',
        team: 'Lincoln University',
        level: 'NCAA D2',
        stats: { gp: 20, gs: 0, mpg: 12.5, ppg: 4.8, rpg: 4.5, apg: 0.5, spg: 0.3, bpg: 1.2, fgPct: 55.0, threePct: 0.0, ftPct: 60.0 },
      },
      {
        year: '2024-25',
        team: 'Lincoln University',
        level: 'NCAA D2',
        stats: { gp: 18, gs: 0, mpg: 8.2, ppg: 2.5, rpg: 2.8, apg: 0.2, spg: 0.1, bpg: 0.8, fgPct: 50.0, threePct: 0.0, ftPct: 55.0 },
      },
    ],
  },
};

// =============================================================================
// MEDIA
// =============================================================================

export const MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'media-highlights-culver',
    title: 'Game Highlights: Lincoln 82, Culver-Stockton 71',
    description: 'Watch the top plays from the Blue Tigers victory over Culver-Stockton.',
    type: 'video',
    source: 'YouTube',
    url: 'https://youtube.com/watch?v=example1',
    date: new Date('2026-02-02'),
    duration: '4:32',
  },
  {
    id: 'media-johnson-25',
    title: 'Marcus Johnson 25-Point Performance',
    description: 'Senior point guard Marcus Johnson leads the way with a career-high 25 points.',
    type: 'video',
    source: 'YouTube',
    url: 'https://youtube.com/watch?v=example2',
    date: new Date('2026-02-02'),
    duration: '3:15',
  },
  {
    id: 'media-harris-stowe-recap',
    title: 'Harris-Stowe Game Recap',
    description: 'Blue Tigers extend winning streak with dominant home victory.',
    type: 'article',
    source: 'Lincoln Athletics',
    url: 'https://lincolnblutigers.com/news/example',
    date: new Date('2026-02-05'),
  },
  {
    id: 'media-williams-interview',
    title: 'DeShawn Williams Post-Game Interview',
    description: 'Junior center discusses his double-double performance and team chemistry.',
    type: 'video',
    source: 'YouTube',
    url: 'https://youtube.com/watch?v=example3',
    date: new Date('2026-02-04'),
    duration: '2:45',
  },
  {
    id: 'media-practice-footage',
    title: 'Practice Session: Preparing for Simpson',
    description: 'Behind the scenes look at Blue Tigers practice ahead of Simpson matchup.',
    type: 'video',
    source: 'YouTube',
    url: 'https://youtube.com/watch?v=example4',
    date: new Date('2026-02-06'),
    duration: '5:20',
  },
  {
    id: 'media-season-preview',
    title: '2025-26 Season Preview: Blue Tigers Basketball',
    description: 'A comprehensive look at the roster, schedule, and expectations for the season.',
    type: 'article',
    source: 'MIAA Sports',
    url: 'https://miaasports.com/news/example',
    date: new Date('2025-10-15'),
  },
  {
    id: 'media-photo-gallery',
    title: 'Photo Gallery: vs Harris-Stowe',
    description: 'Game day photos from the Blue Tigers home victory.',
    type: 'photo_gallery',
    source: 'Lincoln Athletics',
    url: 'https://lincolnblutigers.com/gallery/example',
    date: new Date('2026-02-04'),
  },
];

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
    SG: 'Shooting Guard',
    SF: 'Small Forward',
    PF: 'Power Forward',
    C: 'Center',
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
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
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
  assignedCoach?: string;
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
    position: 'SG',
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
    position: 'SF',
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
    position: 'PF',
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
    position: 'C',
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
    position: 'SG',
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
    position: 'SF',
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
    position: 'PF',
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
    position: 'C',
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
    position: 'SG',
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
    assignedCoach: 'Coach Thompson',
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
    assignedCoach: 'Coach Williams',
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
    assignedCoach: 'Coach Thompson',
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
    assignedCoach: 'Coach Williams',
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
    assignedCoach: 'Coach Thompson',
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
    watching: '#6C757D',
    priority: '#E07C24',
    contacted: '#0D6EFD',
    offered: '#6F42C1',
    committed: '#198754',
    archived: '#ADB5BD',
  };
  return colors[status];
}
