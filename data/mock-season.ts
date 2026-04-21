/**
 * Mock data for Season screen — sports mode.
 * 3 pages: Games, Film, Development.
 * Pattern follows data/mock-mode.ts.
 */

// ── Page 0: Games ──

export type GameStatus = 'completed' | 'upcoming' | 'live';

export interface SeasonRecord {
  wins: number;
  losses: number;
  confWins: number;
  confLosses: number;
  confStanding: string;
}

export interface StatLeader {
  label: string;
  playerName: string;
  initials: string;
  value: string;
  playerId: string;
}

export interface TeamKR {
  rating: number;
  trend: 'rising' | 'falling' | 'stable';
}

export interface GameItem {
  id: string;
  opponent: string;
  opponentInitials: string;
  date: string;
  time: string;
  homeAway: 'home' | 'away';
  conference: boolean;
  status: GameStatus;
  // completed:
  score?: string;
  opponentScore?: string;
  result?: 'W' | 'L';
  // upcoming:
  opponentKR?: number;
  winProbability?: number;
  // live:
  liveScore?: string;
  livePeriod?: string;
}

// ── Page 1: Film ──

export type FilmCategory = 'all' | 'game' | 'practice' | 'scouting' | 'clips';

export interface FilmItem {
  id: string;
  title: string;
  category: Exclude<FilmCategory, 'all'>;
  date: string;
  duration: string;
  hasPlayVision: boolean;
  thumbnailColor: string;
  thumbnailUri: string;
}

// Unsplash direct image helper (public, hotlinkable, auto-cropped)
const u = (_id?: string, _w?: number, _h?: number) => '';

// ── Page 2: Development ──

export type DevSection = 'practice' | 'players' | 'health' | 'eligibility';

export interface PracticePlan {
  id: string;
  date: string;
  duration: string;
  focusArea: string;
  drillCount: number;
  upcoming: boolean;
}

export interface DevPlayer {
  id: string;
  name: string;
  initials: string;
  number: string;
  position: string;
  krRating: number;
  krTrend: 'rising' | 'falling' | 'stable';
  devFocus: string;
}

export interface HealthEntry {
  id: string;
  playerName: string;
  initials: string;
  status: 'healthy' | 'day-to-day' | 'out' | 'season-ending';
  injury?: string;
  returnTimeline?: string;
}

export interface EligibilityEntry {
  id: string;
  playerName: string;
  initials: string;
  eligStatus: 'eligible' | 'warning' | 'ineligible';
  gpa: string;
  credits: number;
}

// ── Mock Data ──

export const SEASON_RECORD: SeasonRecord = {
  wins: 18,
  losses: 8,
  confWins: 11,
  confLosses: 5,
  confStanding: '3rd',
};

export const STAT_LEADERS: StatLeader[] = [
  { label: 'PPG', playerName: 'J. Rodriguez', initials: 'JR', value: '18.4', playerId: 'p1' },
  { label: 'RPG', playerName: 'M. Johnson', initials: 'MJ', value: '9.2', playerId: 'p2' },
  { label: 'APG', playerName: 'A. White', initials: 'AW', value: '6.7', playerId: 'p3' },
];

export const TEAM_KR: TeamKR = { rating: 76, trend: 'rising' };

export const GAMES: GameItem[] = [
  // Completed (18)
  { id: 'g1', opponent: 'Northern State', opponentInitials: 'NS', date: 'Nov 6', time: '7:00 PM', homeAway: 'home', conference: false, status: 'completed', score: '82', opponentScore: '68', result: 'W' },
  { id: 'g2', opponent: 'Lakeview Tech', opponentInitials: 'LT', date: 'Nov 10', time: '7:30 PM', homeAway: 'away', conference: false, status: 'completed', score: '71', opponentScore: '75', result: 'L' },
  { id: 'g3', opponent: 'Eastwood University', opponentInitials: 'EU', date: 'Nov 14', time: '2:00 PM', homeAway: 'home', conference: false, status: 'completed', score: '88', opponentScore: '72', result: 'W' },
  { id: 'g4', opponent: 'Ridgemont College', opponentInitials: 'RC', date: 'Nov 20', time: '7:00 PM', homeAway: 'away', conference: false, status: 'completed', score: '64', opponentScore: '69', result: 'L' },
  { id: 'g5', opponent: 'Valley State', opponentInitials: 'VS', date: 'Nov 25', time: '5:00 PM', homeAway: 'home', conference: false, status: 'completed', score: '91', opponentScore: '78', result: 'W' },
  { id: 'g6', opponent: 'Crestview A&M', opponentInitials: 'CA', date: 'Dec 2', time: '7:00 PM', homeAway: 'home', conference: true, status: 'completed', score: '77', opponentScore: '70', result: 'W' },
  { id: 'g7', opponent: 'Pinehurst University', opponentInitials: 'PU', date: 'Dec 6', time: '8:00 PM', homeAway: 'away', conference: true, status: 'completed', score: '65', opponentScore: '72', result: 'L' },
  { id: 'g8', opponent: 'Summit College', opponentInitials: 'SC', date: 'Dec 10', time: '7:00 PM', homeAway: 'home', conference: true, status: 'completed', score: '84', opponentScore: '79', result: 'W' },
  { id: 'g9', opponent: 'Harborview State', opponentInitials: 'HS', date: 'Dec 18', time: '2:00 PM', homeAway: 'away', conference: true, status: 'completed', score: '73', opponentScore: '68', result: 'W' },
  { id: 'g10', opponent: 'Westfield Tech', opponentInitials: 'WT', date: 'Jan 4', time: '7:00 PM', homeAway: 'home', conference: true, status: 'completed', score: '90', opponentScore: '81', result: 'W' },
  { id: 'g11', opponent: 'Oakridge University', opponentInitials: 'OU', date: 'Jan 8', time: '7:30 PM', homeAway: 'away', conference: true, status: 'completed', score: '66', opponentScore: '71', result: 'L' },
  { id: 'g12', opponent: 'Bayshore College', opponentInitials: 'BC', date: 'Jan 14', time: '7:00 PM', homeAway: 'home', conference: true, status: 'completed', score: '85', opponentScore: '74', result: 'W' },
  { id: 'g13', opponent: 'Ironwood State', opponentInitials: 'IS', date: 'Jan 18', time: '4:00 PM', homeAway: 'away', conference: true, status: 'completed', score: '79', opponentScore: '76', result: 'W' },
  { id: 'g14', opponent: 'Crestview A&M', opponentInitials: 'CA', date: 'Jan 25', time: '7:00 PM', homeAway: 'away', conference: true, status: 'completed', score: '70', opponentScore: '78', result: 'L' },
  { id: 'g15', opponent: 'Summit College', opponentInitials: 'SC', date: 'Feb 1', time: '2:00 PM', homeAway: 'away', conference: true, status: 'completed', score: '88', opponentScore: '82', result: 'W' },
  { id: 'g16', opponent: 'Harborview State', opponentInitials: 'HS', date: 'Feb 8', time: '7:00 PM', homeAway: 'home', conference: true, status: 'completed', score: '93', opponentScore: '85', result: 'W' },
  { id: 'g17', opponent: 'Westfield Tech', opponentInitials: 'WT', date: 'Feb 15', time: '8:00 PM', homeAway: 'away', conference: true, status: 'completed', score: '72', opponentScore: '80', result: 'L' },
  { id: 'g18', opponent: 'Pinehurst University', opponentInitials: 'PU', date: 'Feb 22', time: '7:00 PM', homeAway: 'home', conference: true, status: 'completed', score: '81', opponentScore: '74', result: 'W' },
  // Live (1)
  { id: 'g19', opponent: 'Oakridge University', opponentInitials: 'OU', date: 'Mar 1', time: '7:00 PM', homeAway: 'home', conference: true, status: 'live', liveScore: '42-38', livePeriod: '2nd Half' },
  // Upcoming (7)
  { id: 'g20', opponent: 'Bayshore College', opponentInitials: 'BC', date: 'Mar 5', time: '7:30 PM', homeAway: 'away', conference: true, status: 'upcoming', opponentKR: 68, winProbability: 62 },
  { id: 'g21', opponent: 'Ironwood State', opponentInitials: 'IS', date: 'Mar 8', time: '2:00 PM', homeAway: 'home', conference: true, status: 'upcoming', opponentKR: 71, winProbability: 58 },
  { id: 'g22', opponent: 'Lakeview Tech', opponentInitials: 'LT', date: 'Mar 12', time: '7:00 PM', homeAway: 'home', conference: false, status: 'upcoming', opponentKR: 65, winProbability: 70 },
  { id: 'g23', opponent: 'Ridgemont College', opponentInitials: 'RC', date: 'Mar 15', time: '5:00 PM', homeAway: 'away', conference: false, status: 'upcoming', opponentKR: 73, winProbability: 52 },
  { id: 'g24', opponent: 'Conf. Quarterfinal', opponentInitials: 'TBD', date: 'Mar 19', time: 'TBD', homeAway: 'home', conference: true, status: 'upcoming', opponentKR: 70, winProbability: 55 },
  { id: 'g25', opponent: 'Conf. Semifinal', opponentInitials: 'TBD', date: 'Mar 21', time: 'TBD', homeAway: 'away', conference: true, status: 'upcoming', opponentKR: 74, winProbability: 48 },
  { id: 'g26', opponent: 'Conf. Championship', opponentInitials: 'TBD', date: 'Mar 23', time: 'TBD', homeAway: 'away', conference: true, status: 'upcoming', opponentKR: 78, winProbability: 40 },
];

export const FILM_ITEMS: FilmItem[] = [
  // Game Film — full-court basketball action shots
  { id: 'f1', title: 'vs Pinehurst — Full Game', category: 'game', date: 'Feb 22', duration: '2:14:30', hasPlayVision: true, thumbnailColor: '#1E3A5F', thumbnailUri: u('photo-1546519638-68e109498ffc') },
  { id: 'f2', title: 'vs Westfield — Full Game', category: 'game', date: 'Feb 15', duration: '2:08:45', hasPlayVision: true, thumbnailColor: '#2D1B4E', thumbnailUri: u('photo-1504450758481-7338eba7524a') },
  { id: 'f3', title: 'vs Harborview — Full Game', category: 'game', date: 'Feb 8', duration: '2:22:10', hasPlayVision: true, thumbnailColor: '#1B3D2F', thumbnailUri: u('photo-1519861531473-9200262188bf') },
  { id: 'f4', title: 'vs Summit — Full Game', category: 'game', date: 'Feb 1', duration: '2:11:00', hasPlayVision: false, thumbnailColor: '#3D2B1B', thumbnailUri: u('photo-1505666287802-931dc83948e5') },
  // Practice Film — gym / training / drills
  { id: 'f5', title: 'Practice — Half Court Sets', category: 'practice', date: 'Feb 24', duration: '1:45:00', hasPlayVision: false, thumbnailColor: '#1A2744', thumbnailUri: u('photo-1552674605-db6ffd4facb5') },
  { id: 'f6', title: 'Practice — Press Break', category: 'practice', date: 'Feb 20', duration: '0:58:30', hasPlayVision: false, thumbnailColor: '#2A1A3D', thumbnailUri: u('photo-1559692048-79a3f837883d') },
  { id: 'f7', title: 'Practice — Transition D', category: 'practice', date: 'Feb 18', duration: '1:12:00', hasPlayVision: true, thumbnailColor: '#1A3D2A', thumbnailUri: u('photo-1511886929837-354d827aae26') },
  { id: 'f8', title: 'Practice — Free Throws', category: 'practice', date: 'Feb 14', duration: '0:35:20', hasPlayVision: false, thumbnailColor: '#3D3A1A', thumbnailUri: u('photo-1608245449230-4ac19066d2d0') },
  // Scouting — opponent analysis / whiteboard / film room
  { id: 'f9', title: 'Oakridge Scout — Offense', category: 'scouting', date: 'Feb 26', duration: '0:42:15', hasPlayVision: true, thumbnailColor: '#1A1714', thumbnailUri: u('photo-1540747913346-19e32dc3e97e') },
  { id: 'f10', title: 'Bayshore Scout — Defense', category: 'scouting', date: 'Feb 28', duration: '0:38:40', hasPlayVision: true, thumbnailColor: '#37210D', thumbnailUri: u('photo-1587280501635-68a0e82cd5ff') },
  { id: 'f11', title: 'Ironwood Scout — Key Players', category: 'scouting', date: 'Mar 2', duration: '0:28:10', hasPlayVision: false, thumbnailColor: '#21370D', thumbnailUri: u('photo-1517649763962-0c623066013b') },
  // Clips — player highlights, dunks, plays
  { id: 'f12', title: 'Rodriguez — Scoring Highlights', category: 'clips', date: 'Feb 25', duration: '0:08:45', hasPlayVision: false, thumbnailColor: '#371B0D', thumbnailUri: u('photo-1628779238951-be2c9f2a59f4') },
  { id: 'f13', title: 'Johnson — Rebound Reel', category: 'clips', date: 'Feb 23', duration: '0:06:20', hasPlayVision: false, thumbnailColor: '#0D3721', thumbnailUri: u('photo-1471295253337-3ceaaedca402') },
  { id: 'f14', title: 'White — Assist Compilation', category: 'clips', date: 'Feb 21', duration: '0:05:50', hasPlayVision: false, thumbnailColor: '#1A1714', thumbnailUri: u('photo-1475403614135-5f1aa0eb5015') },
  { id: 'f15', title: 'Team — Top 10 Plays Feb', category: 'clips', date: 'Feb 28', duration: '0:03:30', hasPlayVision: false, thumbnailColor: '#37110D', thumbnailUri: u('photo-1577471488278-16eec37ffcc2') },
];

export const PRACTICE_PLANS: PracticePlan[] = [
  { id: 'pp1', date: 'Mar 10', duration: '2h 15m', focusArea: 'Tournament Prep', drillCount: 8, upcoming: true },
  { id: 'pp2', date: 'Mar 8', duration: '2h 00m', focusArea: 'Press Break', drillCount: 6, upcoming: true },
  { id: 'pp3', date: 'Mar 6', duration: '1h 45m', focusArea: 'Shooting', drillCount: 5, upcoming: true },
  { id: 'pp4', date: 'Mar 4', duration: '2h 00m', focusArea: 'Half Court Offense', drillCount: 7, upcoming: false },
  { id: 'pp5', date: 'Mar 2', duration: '1h 30m', focusArea: 'Film Review', drillCount: 3, upcoming: false },
  { id: 'pp6', date: 'Feb 28', duration: '2h 15m', focusArea: 'Transition Defense', drillCount: 8, upcoming: false },
  { id: 'pp7', date: 'Feb 26', duration: '2h 00m', focusArea: 'Zone Offense', drillCount: 6, upcoming: false },
  { id: 'pp8', date: 'Feb 24', duration: '1h 45m', focusArea: 'Free Throws + Conditioning', drillCount: 4, upcoming: false },
];

export const DEV_PLAYERS: DevPlayer[] = [
  { id: 'dp1', name: 'James Rodriguez', initials: 'JR', number: '3', position: 'PG', krRating: 82, krTrend: 'rising', devFocus: 'Defensive IQ' },
  { id: 'dp2', name: 'Marcus Johnson', initials: 'MJ', number: '24', position: 'PF', krRating: 78, krTrend: 'rising', devFocus: 'Three-Point Range' },
  { id: 'dp3', name: 'Andre White', initials: 'AW', number: '11', position: 'SG', krRating: 75, krTrend: 'stable', devFocus: 'Ball Handling' },
  { id: 'dp4', name: 'Devon Carter', initials: 'DC', number: '5', position: 'C', krRating: 72, krTrend: 'rising', devFocus: 'Post Moves' },
  { id: 'dp5', name: 'Tyler Brooks', initials: 'TB', number: '15', position: 'SF', krRating: 70, krTrend: 'falling', devFocus: 'Rebounding' },
  { id: 'dp6', name: 'Chris Lee', initials: 'CL', number: '22', position: 'SG', krRating: 68, krTrend: 'rising', devFocus: 'Off-Ball Movement' },
  { id: 'dp7', name: 'Jordan Ellis', initials: 'JE', number: '1', position: 'PG', krRating: 65, krTrend: 'stable', devFocus: 'Court Vision' },
  { id: 'dp8', name: 'Malik Brown', initials: 'MB', number: '33', position: 'PF', krRating: 63, krTrend: 'rising', devFocus: 'Strength' },
  { id: 'dp9', name: 'Dante Williams', initials: 'DW', number: '10', position: 'SF', krRating: 60, krTrend: 'falling', devFocus: 'Shooting Form' },
  { id: 'dp10', name: 'Ray Cooper', initials: 'RC', number: '44', position: 'C', krRating: 58, krTrend: 'stable', devFocus: 'Footwork' },
  { id: 'dp11', name: 'Isaiah Thomas', initials: 'IT', number: '2', position: 'PG', krRating: 55, krTrend: 'rising', devFocus: 'Decision Making' },
  { id: 'dp12', name: 'Noah Green', initials: 'NG', number: '30', position: 'SF', krRating: 52, krTrend: 'stable', devFocus: 'Conditioning' },
];

export const HEALTH_ROSTER: HealthEntry[] = [
  { id: 'h1', playerName: 'James Rodriguez', initials: 'JR', status: 'healthy' },
  { id: 'h2', playerName: 'Marcus Johnson', initials: 'MJ', status: 'healthy' },
  { id: 'h3', playerName: 'Andre White', initials: 'AW', status: 'healthy' },
  { id: 'h4', playerName: 'Devon Carter', initials: 'DC', status: 'day-to-day', injury: 'Ankle sprain', returnTimeline: '2-3 days' },
  { id: 'h5', playerName: 'Tyler Brooks', initials: 'TB', status: 'healthy' },
  { id: 'h6', playerName: 'Chris Lee', initials: 'CL', status: 'healthy' },
  { id: 'h7', playerName: 'Jordan Ellis', initials: 'JE', status: 'day-to-day', injury: 'Knee soreness', returnTimeline: '1-2 days' },
  { id: 'h8', playerName: 'Malik Brown', initials: 'MB', status: 'out', injury: 'Hamstring strain', returnTimeline: '2-3 weeks' },
  { id: 'h9', playerName: 'Dante Williams', initials: 'DW', status: 'healthy' },
  { id: 'h10', playerName: 'Ray Cooper', initials: 'RC', status: 'healthy' },
  { id: 'h11', playerName: 'Isaiah Thomas', initials: 'IT', status: 'season-ending', injury: 'ACL tear', returnTimeline: '6-9 months' },
  { id: 'h12', playerName: 'Noah Green', initials: 'NG', status: 'healthy' },
];

export const ELIGIBILITY_ROSTER: EligibilityEntry[] = [
  { id: 'e1', playerName: 'James Rodriguez', initials: 'JR', eligStatus: 'eligible', gpa: '3.4', credits: 72 },
  { id: 'e2', playerName: 'Marcus Johnson', initials: 'MJ', eligStatus: 'eligible', gpa: '2.8', credits: 68 },
  { id: 'e3', playerName: 'Andre White', initials: 'AW', eligStatus: 'eligible', gpa: '3.1', credits: 45 },
  { id: 'e4', playerName: 'Devon Carter', initials: 'DC', eligStatus: 'warning', gpa: '2.1', credits: 58 },
  { id: 'e5', playerName: 'Tyler Brooks', initials: 'TB', eligStatus: 'eligible', gpa: '2.9', credits: 90 },
  { id: 'e6', playerName: 'Chris Lee', initials: 'CL', eligStatus: 'eligible', gpa: '3.5', credits: 42 },
  { id: 'e7', playerName: 'Jordan Ellis', initials: 'JE', eligStatus: 'eligible', gpa: '2.7', credits: 30 },
  { id: 'e8', playerName: 'Malik Brown', initials: 'MB', eligStatus: 'warning', gpa: '2.0', credits: 55 },
  { id: 'e9', playerName: 'Dante Williams', initials: 'DW', eligStatus: 'ineligible', gpa: '1.8', credits: 48 },
  { id: 'e10', playerName: 'Ray Cooper', initials: 'RC', eligStatus: 'eligible', gpa: '3.0', credits: 62 },
  { id: 'e11', playerName: 'Isaiah Thomas', initials: 'IT', eligStatus: 'eligible', gpa: '3.2', credits: 28 },
  { id: 'e12', playerName: 'Noah Green', initials: 'NG', eligStatus: 'eligible', gpa: '2.6', credits: 35 },
];

// ── Helpers ──

export function getGames(): GameItem[] {
  return GAMES;
}

export function getFilmItems(category?: FilmCategory): FilmItem[] {
  if (!category || category === 'all') return FILM_ITEMS;
  return FILM_ITEMS.filter((f) => f.category === category);
}

export function getPracticePlans(): PracticePlan[] {
  return PRACTICE_PLANS;
}

export function getDevPlayers(): DevPlayer[] {
  return DEV_PLAYERS;
}

export function getHealthRoster(): HealthEntry[] {
  return HEALTH_ROSTER;
}

export function getEligibilityRoster(): EligibilityEntry[] {
  return ELIGIBILITY_ROSTER;
}
