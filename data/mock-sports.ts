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
// HELPERS
// =============================================================================

export function getPlayerProfile(playerId: string): PlayerProfile | undefined {
  return PLAYER_PROFILES[playerId];
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
