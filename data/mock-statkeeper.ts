/**
 * Mock data for StatKeeper — game setup & live stat tracking
 * Lincoln University vs Howard University (MEAC matchup)
 */

export interface GamePlayer {
  id: string;
  number: string;
  firstName: string;
  lastName: string;
  teamId: 'home' | 'away';
  isOnCourt: boolean;
  hue: number;
}

// ── Lincoln University Men's Basketball — 10 players (5 starters, 5 bench) ──

export const MOCK_HOME_ROSTER: GamePlayer[] = [
  { id: 'h1',  number: '1',  firstName: 'Marcus',  lastName: 'Johnson',  teamId: 'home', isOnCourt: true,  hue: 185 },
  { id: 'h2',  number: '3',  firstName: 'DeShawn', lastName: 'Williams', teamId: 'home', isOnCourt: true,  hue: 185 },
  { id: 'h3',  number: '11', firstName: 'Jordan',  lastName: 'Carter',   teamId: 'home', isOnCourt: true,  hue: 185 },
  { id: 'h4',  number: '23', firstName: 'Tyrese',  lastName: 'Brown',    teamId: 'home', isOnCourt: true,  hue: 185 },
  { id: 'h5',  number: '30', firstName: 'Darius',  lastName: 'Moore',    teamId: 'home', isOnCourt: true,  hue: 185 },
  { id: 'h6',  number: '4',  firstName: 'Kahlil',  lastName: 'Davis',    teamId: 'home', isOnCourt: false, hue: 185 },
  { id: 'h7',  number: '10', firstName: 'Elijah',  lastName: 'Thomas',   teamId: 'home', isOnCourt: false, hue: 185 },
  { id: 'h8',  number: '12', firstName: 'Camren',  lastName: 'Lewis',    teamId: 'home', isOnCourt: false, hue: 185 },
  { id: 'h9',  number: '21', firstName: 'Jaylen',  lastName: 'Harris',   teamId: 'home', isOnCourt: false, hue: 185 },
  { id: 'h10', number: '33', firstName: 'Kofi',    lastName: 'Anderson', teamId: 'home', isOnCourt: false, hue: 185 },
];

// ── Howard University — 10 players (5 starters, 5 bench) ─────────────────────

export const MOCK_AWAY_ROSTER: GamePlayer[] = [
  { id: 'a1',  number: '0',  firstName: 'Isaiah',  lastName: 'Campbell', teamId: 'away', isOnCourt: true,  hue: 215 },
  { id: 'a2',  number: '3',  firstName: 'Robert',  lastName: 'Jackson',  teamId: 'away', isOnCourt: true,  hue: 215 },
  { id: 'a3',  number: '12', firstName: 'Davion',  lastName: 'Green',    teamId: 'away', isOnCourt: true,  hue: 215 },
  { id: 'a4',  number: '24', firstName: 'Miles',   lastName: 'Robinson', teamId: 'away', isOnCourt: true,  hue: 215 },
  { id: 'a5',  number: '5',  firstName: 'Tevin',   lastName: 'Brooks',   teamId: 'away', isOnCourt: true,  hue: 215 },
  { id: 'a6',  number: '2',  firstName: 'Dontae',  lastName: 'Powell',   teamId: 'away', isOnCourt: false, hue: 215 },
  { id: 'a7',  number: '11', firstName: 'Travis',  lastName: 'White',    teamId: 'away', isOnCourt: false, hue: 215 },
  { id: 'a8',  number: '13', firstName: 'Nate',    lastName: 'Young',    teamId: 'away', isOnCourt: false, hue: 215 },
  { id: 'a9',  number: '20', firstName: 'Bernard', lastName: 'King',     teamId: 'away', isOnCourt: false, hue: 215 },
  { id: 'a10', number: '32', firstName: 'Devion',  lastName: 'Taylor',   teamId: 'away', isOnCourt: false, hue: 215 },
];

// ── Game metadata defaults ────────────────────────────────────────────────────

export const MOCK_GAME_META = {
  homeName: 'Lincoln',
  awayName: 'Howard',
  gameType: 'Conference' as const,
  halfMinutes: 20,
};
