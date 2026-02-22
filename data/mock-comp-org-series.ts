/**
 * Competition Organization Series v2 — Mock Data
 * Full dataset for the 10-tab Comp Org Series Hub.
 */

// =============================================================================
// TYPES
// =============================================================================

export type CompSeriesTabId =
  | 'dashboard'
  | 'active-series'
  | 'formats'
  | 'seasons'
  | 'entrants'
  | 'standings'
  | 'calendar'
  | 'awards'
  | 'history'
  | 'settings';

export interface CompSeriesTab {
  id: CompSeriesTabId;
  label: string;
  icon: string;
}

export interface SeriesDashboardBlock {
  id: string;
  label: string;
  value: string;
  delta: string;
  icon: string;
  color: string;
}

export interface ActiveSeries {
  id: string;
  name: string;
  shortName: string;
  format: string;
  status: 'upcoming' | 'live' | 'completed';
  startDate: string;
  endDate: string;
  entrantCount: number;
  matchCount: number;
  currentRound: string;
  prize: string;
}

export interface SeriesFormat {
  id: string;
  name: string;
  type: 'round-robin' | 'single-elim' | 'double-elim' | 'swiss' | 'group-stage' | 'hybrid';
  description: string;
  maxEntrants: number;
  tiebreakers: string[];
}

export interface Season {
  id: string;
  name: string;
  year: number;
  status: 'planning' | 'active' | 'completed' | 'archived';
  seriesCount: number;
  startDate: string;
  endDate: string;
}

export interface SeriesEntrant {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  seed: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  gd: number;
  status: 'active' | 'eliminated' | 'withdrawn' | 'qualified';
}

export interface StandingsEntry extends SeriesEntrant {
  rank: number;
  form: ('W' | 'L' | 'D')[];
  streak: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: 'match' | 'ceremony' | 'deadline' | 'media' | 'rest-day';
  series: string;
  venue: string;
}

export interface Award {
  id: string;
  name: string;
  recipient: string;
  series: string;
  season: string;
  category: 'individual' | 'team' | 'special';
  date: string;
}

export interface HistoryRecord {
  id: string;
  season: string;
  champion: string;
  runnerUp: string;
  mvp: string;
  totalMatches: number;
  totalGoals: number;
}

export interface SeriesSettingToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const COMP_SERIES_TABS: CompSeriesTab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'chart.bar.fill' },
  { id: 'active-series', label: 'Active Series', icon: 'sportscourt.fill' },
  { id: 'formats', label: 'Formats', icon: 'rectangle.stack.fill' },
  { id: 'seasons', label: 'Seasons', icon: 'calendar' },
  { id: 'entrants', label: 'Entrants', icon: 'person.3.fill' },
  { id: 'standings', label: 'Standings', icon: 'tablecells.fill' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar.badge.clock' },
  { id: 'awards', label: 'Awards', icon: 'crown.fill' },
  { id: 'history', label: 'History', icon: 'clock.fill' },
  { id: 'settings', label: 'Settings', icon: 'gear' },
];

export const COMP_SERIES_SCOPE_CHIPS = [
  'All Series',
  'League',
  'Tournament',
  'Cup',
  'Exhibition',
];

// =============================================================================
// STATUS COLOR MAPS
// =============================================================================

export const SERIES_STATUS_COLOR: Record<ActiveSeries['status'], string> = {
  upcoming: '#1D9BF0',
  live: '#22C55E',
  completed: '#A1A1AA',
};

export const ENTRANT_STATUS_COLOR: Record<SeriesEntrant['status'], string> = {
  active: '#22C55E',
  eliminated: '#EF4444',
  withdrawn: '#A1A1AA',
  qualified: '#1D9BF0',
};

export const SEASON_STATUS_COLOR: Record<Season['status'], string> = {
  planning: '#F59E0B',
  active: '#22C55E',
  completed: '#A1A1AA',
  archived: '#A1A1AA',
};

export const FORMAT_TYPE_LABEL: Record<SeriesFormat['type'], string> = {
  'round-robin': 'Round Robin',
  'single-elim': 'Single Elimination',
  'double-elim': 'Double Elimination',
  'swiss': 'Swiss System',
  'group-stage': 'Group Stage',
  'hybrid': 'Hybrid',
};

export const CALENDAR_EVENT_COLOR: Record<CalendarEvent['type'], string> = {
  match: '#1D9BF0',
  ceremony: '#F59E0B',
  deadline: '#EF4444',
  media: '#1D9BF0',
  'rest-day': '#A1A1AA',
};

export const AWARD_CATEGORY_COLOR: Record<Award['category'], string> = {
  individual: '#1D9BF0',
  team: '#22C55E',
  special: '#F59E0B',
};

// =============================================================================
// MOCK DATA GENERATOR
// =============================================================================

export function getCompSeriesData(_scope: string) {
  // ── Dashboard ──
  const dashboard: SeriesDashboardBlock[] = [
    { id: 'ds-1', label: 'Total Series', value: '12', delta: '+2 this quarter', icon: 'sportscourt.fill', color: '#1D9BF0' },
    { id: 'ds-2', label: 'Active Entrants', value: '148', delta: '+18 from last season', icon: 'person.3.fill', color: '#22C55E' },
    { id: 'ds-3', label: 'Upcoming Matches', value: '37', delta: '12 this week', icon: 'calendar', color: '#F59E0B' },
    { id: 'ds-4', label: 'Prize Pool', value: '$425K', delta: '+$50K vs last year', icon: 'crown.fill', color: '#1D9BF0' },
    { id: 'ds-5', label: 'Live Series', value: '4', delta: '2 in semifinals', icon: 'play.circle.fill', color: '#EF4444' },
    { id: 'ds-6', label: 'Venues Booked', value: '9', delta: '3 pending confirmation', icon: 'mappin.and.ellipse', color: '#1D9BF0' },
  ];

  const quickActions = [
    { id: 'qa-1', label: 'New Series', icon: 'plus.circle.fill', color: '#1D9BF0' },
    { id: 'qa-2', label: 'Schedule Match', icon: 'calendar.badge.plus', color: '#22C55E' },
    { id: 'qa-3', label: 'Add Entrant', icon: 'person.badge.plus', color: '#F59E0B' },
    { id: 'qa-4', label: 'Run Report', icon: 'chart.bar.fill', color: '#1D9BF0' },
    { id: 'qa-5', label: 'Manage Awards', icon: 'crown.fill', color: '#EF4444' },
    { id: 'qa-6', label: 'Broadcast Setup', icon: 'video.fill', color: '#1D9BF0' },
  ];

  const recentActivity = [
    { id: 'ra-1', text: 'KaNeXT Blazers defeated Tom\u2019s Team (PBD) 3\u20131 in K-1 Invitational Round 3', time: '2h ago' },
    { id: 'ra-2', text: 'KaNeXT Church League standings updated \u2014 Blazers move to 2nd place', time: '3h ago' },
    { id: 'ra-3', text: 'PBD Cup quarterfinal draw completed', time: '5h ago' },
    { id: 'ra-4', text: 'New entrant registration: Westside Academy joined Spring Showcase', time: '8h ago' },
    { id: 'ra-5', text: 'K-1 Invitational MVP voting opened for Round 3', time: '10h ago' },
    { id: 'ra-6', text: 'Venue confirmed: Meridian Arena for PBD Cup semifinals', time: '12h ago' },
    { id: 'ra-7', text: 'KaNeXT Church League Round 8 schedule published', time: '1d ago' },
    { id: 'ra-8', text: 'KaNeXT Blazers clinched playoff berth in KaNeXT Church League', time: '1d ago' },
    { id: 'ra-9', text: 'Spring Showcase referee assignments finalized', time: '2d ago' },
    { id: 'ra-10', text: 'Award nominations open for 2025\u201326 Season MVP', time: '2d ago' },
    { id: 'ra-11', text: 'Tom\u2019s Team (PBD) roster update: 2 new signings registered', time: '3d ago' },
    { id: 'ra-12', text: 'PBD Cup group stage results certified', time: '3d ago' },
    { id: 'ra-13', text: 'K-1 Invitational broadcast partnership confirmed with StreamLive', time: '4d ago' },
    { id: 'ra-14', text: 'Penalty review: Yellow card rescinded for match #KI-R2-04', time: '5d ago' },
    { id: 'ra-15', text: 'Season registration deadline extended to March 15', time: '5d ago' },
  ];

  // ── Active Series ──
  const activeSeries: ActiveSeries[] = [
    { id: 'as-1', name: 'KaNeXT Church Premier League', shortName: 'KaNeXT Church', format: 'Round Robin', status: 'live', startDate: 'Sep 2025', endDate: 'May 2026', entrantCount: 16, matchCount: 120, currentRound: 'Matchday 22 of 30', prize: '$150,000' },
    { id: 'as-2', name: 'K-1 Invitational', shortName: 'K-1', format: 'Single Elimination', status: 'live', startDate: 'Jan 2026', endDate: 'Mar 2026', entrantCount: 32, matchCount: 31, currentRound: 'Round of 16', prize: '$75,000' },
    { id: 'as-3', name: 'PBD Cup', shortName: 'PBD', format: 'Group Stage + Knockout', status: 'live', startDate: 'Nov 2025', endDate: 'Apr 2026', entrantCount: 24, matchCount: 52, currentRound: 'Quarterfinals', prize: '$100,000' },
    { id: 'as-4', name: 'Spring Showcase', shortName: 'SS', format: 'Exhibition', status: 'upcoming', startDate: 'Mar 2026', endDate: 'Mar 2026', entrantCount: 12, matchCount: 18, currentRound: 'Pending kickoff', prize: '$10,000' },
    { id: 'as-5', name: 'KaNeXT Church Super Cup', shortName: 'ISC', format: 'Single Elimination', status: 'upcoming', startDate: 'Jun 2026', endDate: 'Jun 2026', entrantCount: 4, matchCount: 3, currentRound: 'Semifinal draw pending', prize: '$50,000' },
    { id: 'as-6', name: 'Fall Classic', shortName: 'FC', format: 'Swiss', status: 'completed', startDate: 'Aug 2025', endDate: 'Oct 2025', entrantCount: 20, matchCount: 60, currentRound: 'Final complete', prize: '$40,000' },
    { id: 'as-7', name: 'Preseason Challenge', shortName: 'PSC', format: 'Round Robin', status: 'completed', startDate: 'Jul 2025', endDate: 'Aug 2025', entrantCount: 8, matchCount: 28, currentRound: 'Final complete', prize: '$5,000' },
    { id: 'as-8', name: 'Holiday Invitational', shortName: 'HI', format: 'Double Elimination', status: 'completed', startDate: 'Dec 2025', endDate: 'Jan 2026', entrantCount: 16, matchCount: 30, currentRound: 'Final complete', prize: '$25,000' },
    { id: 'as-9', name: 'Regional Qualifier', shortName: 'RQ', format: 'Group Stage', status: 'upcoming', startDate: 'Apr 2026', endDate: 'May 2026', entrantCount: 20, matchCount: 40, currentRound: 'Draw pending', prize: '$15,000' },
    { id: 'as-10', name: 'Charity Shield', shortName: 'CS', format: 'Single Elimination', status: 'upcoming', startDate: 'May 2026', endDate: 'May 2026', entrantCount: 2, matchCount: 1, currentRound: 'League champion vs Cup winner', prize: '$20,000' },
    { id: 'as-11', name: 'Summer Invitational', shortName: 'SI', format: 'Hybrid', status: 'upcoming', startDate: 'Jun 2026', endDate: 'Jul 2026', entrantCount: 24, matchCount: 48, currentRound: 'Entries open', prize: '$60,000' },
    { id: 'as-12', name: 'U-19 Development Cup', shortName: 'U19', format: 'Swiss', status: 'live', startDate: 'Jan 2026', endDate: 'Apr 2026', entrantCount: 16, matchCount: 40, currentRound: 'Round 5 of 7', prize: '$8,000' },
    { id: 'as-13', name: 'Masters Invitational', shortName: 'MI', format: 'Round Robin', status: 'upcoming', startDate: 'Apr 2026', endDate: 'Apr 2026', entrantCount: 6, matchCount: 15, currentRound: 'Roster confirmation', prize: '$30,000' },
    { id: 'as-14', name: 'City Derby Series', shortName: 'CDS', format: 'Double Elimination', status: 'completed', startDate: 'Oct 2025', endDate: 'Nov 2025', entrantCount: 8, matchCount: 14, currentRound: 'Final complete', prize: '$12,000' },
    { id: 'as-15', name: 'KaNeXT Church Reserve League', shortName: 'IRL', format: 'Round Robin', status: 'live', startDate: 'Sep 2025', endDate: 'May 2026', entrantCount: 16, matchCount: 120, currentRound: 'Matchday 20 of 30', prize: '$20,000' },
    { id: 'as-16', name: 'All-Star Weekend', shortName: 'ASW', format: 'Exhibition', status: 'upcoming', startDate: 'Feb 2026', endDate: 'Feb 2026', entrantCount: 4, matchCount: 3, currentRound: 'Player voting', prize: '$15,000' },
    { id: 'as-17', name: 'Champions League Playoff', shortName: 'CLP', format: 'Single Elimination', status: 'upcoming', startDate: 'May 2026', endDate: 'Jun 2026', entrantCount: 8, matchCount: 7, currentRound: 'Qualification ongoing', prize: '$200,000' },
    { id: 'as-18', name: 'Winter Classic', shortName: 'WC', format: 'Hybrid', status: 'completed', startDate: 'Dec 2025', endDate: 'Dec 2025', entrantCount: 8, matchCount: 12, currentRound: 'Final complete', prize: '$18,000' },
  ];

  // ── Formats ──
  const formats: SeriesFormat[] = [
    { id: 'fmt-1', name: 'KaNeXT Church Round Robin', type: 'round-robin', description: 'Each team plays every other team twice (home and away). Points awarded: 3 for win, 1 for draw, 0 for loss. Full season league format with relegation.', maxEntrants: 20, tiebreakers: ['Goal Difference', 'Goals Scored', 'Head-to-Head Record', 'Fair Play Points'] },
    { id: 'fmt-2', name: 'K-1 Knockout', type: 'single-elim', description: 'Single-game elimination bracket. Higher seed hosts. Extra time and penalty shootout for drawn matches. No replays.', maxEntrants: 64, tiebreakers: ['Extra Time', 'Penalty Shootout'] },
    { id: 'fmt-3', name: 'PBD Cup Hybrid', type: 'hybrid', description: 'Group stage with 6 groups of 4 teams, followed by knockout rounds from the Round of 16. Top 2 from each group plus 4 best third-placed teams advance.', maxEntrants: 24, tiebreakers: ['Points', 'Goal Difference', 'Goals Scored', 'Disciplinary Record', 'Drawing of Lots'] },
    { id: 'fmt-4', name: 'Swiss Bracket', type: 'swiss', description: 'Teams are paired each round based on current record. No elimination until final rounds. Provides balanced competition with fewer required matches than round-robin.', maxEntrants: 32, tiebreakers: ['Buchholz Score', 'Sonneborn-Berger', 'Direct Encounter', 'Goal Difference'] },
    { id: 'fmt-5', name: 'Double Elimination', type: 'double-elim', description: 'Teams must lose twice to be eliminated. Winners bracket and losers bracket converge in a grand final. Losers bracket champion must beat winners bracket champion twice.', maxEntrants: 16, tiebreakers: ['Bracket Position', 'Head-to-Head'] },
    { id: 'fmt-6', name: 'Group Stage', type: 'group-stage', description: 'Teams divided into groups of 4. Round-robin within each group. Top 2 from each group advance to knockout phase or final standings.', maxEntrants: 32, tiebreakers: ['Points', 'Goal Difference', 'Goals Scored', 'Fair Play'] },
    { id: 'fmt-7', name: 'Exhibition Series', type: 'round-robin', description: 'Non-competitive showcase format. Results do not count toward official standings or rankings. Used for preseason, charity events, and invitational showcases.', maxEntrants: 12, tiebreakers: ['None \u2014 exhibition only'] },
    { id: 'fmt-8', name: 'Promotion Playoff', type: 'single-elim', description: 'End-of-season mini-tournament for teams finishing 3rd through 6th. Winner earns promotion to the next tier or qualifies for a continental competition.', maxEntrants: 4, tiebreakers: ['Extra Time', 'Penalty Shootout', 'Away Goals (legs only)'] },
    { id: 'fmt-9', name: 'Super Cup Format', type: 'single-elim', description: 'One-off match between the league champion and the cup winner. Played at a neutral venue. If drawn, proceeds to extra time and penalties.', maxEntrants: 2, tiebreakers: ['Extra Time', 'Penalty Shootout'] },
    { id: 'fmt-10', name: 'Quad Tournament', type: 'round-robin', description: 'Four-team round-robin played over a single weekend. Each team plays three matches. Used for preseason and invitational events.', maxEntrants: 4, tiebreakers: ['Goal Difference', 'Goals Scored', 'Head-to-Head'] },
    { id: 'fmt-11', name: 'Split Season Hybrid', type: 'hybrid', description: 'Season split into two halves. First half is round-robin to seed teams. Second half is a championship bracket for top 8 and a relegation bracket for bottom 4.', maxEntrants: 16, tiebreakers: ['Points (phase 1)', 'Bracket Position (phase 2)', 'Goal Difference'] },
    { id: 'fmt-12', name: 'Swiss + Knockout', type: 'swiss', description: 'Initial Swiss rounds to determine seeding, followed by a knockout bracket for the top finishers. Combines fairness of Swiss with the excitement of elimination.', maxEntrants: 24, tiebreakers: ['Swiss Points', 'Buchholz', 'Direct Encounter'] },
    { id: 'fmt-13', name: 'Conference Round Robin', type: 'round-robin', description: 'Teams divided into two conferences. Full round-robin within each conference, plus inter-conference matches. Top teams from each conference meet in a championship.', maxEntrants: 24, tiebreakers: ['Conference Record', 'Overall Record', 'Goal Difference'] },
    { id: 'fmt-14', name: 'Seeded Double Elim', type: 'double-elim', description: 'Seeded double-elimination bracket with byes for top seeds. Provides second chances while rewarding regular-season performance through advantageous seeding.', maxEntrants: 16, tiebreakers: ['Bracket Position', 'Seed', 'Head-to-Head'] },
    { id: 'fmt-15', name: 'Festival Format', type: 'group-stage', description: 'Multiple small groups playing shortened matches across a festival day. All teams guaranteed minimum 3 matches. Winners from each group enter a quick-fire knockout.', maxEntrants: 32, tiebreakers: ['Points', 'Goal Difference', 'Fair Play Points'] },
  ];

  // ── Seasons ──
  const seasons: Season[] = [
    { id: 'sn-1', name: '2025\u201326 Championship Season', year: 2026, status: 'active', seriesCount: 12, startDate: 'Jul 2025', endDate: 'Jun 2026' },
    { id: 'sn-2', name: '2024\u201325 Championship Season', year: 2025, status: 'completed', seriesCount: 10, startDate: 'Jul 2024', endDate: 'Jun 2025' },
    { id: 'sn-3', name: '2023\u201324 Championship Season', year: 2024, status: 'archived', seriesCount: 8, startDate: 'Jul 2023', endDate: 'Jun 2024' },
    { id: 'sn-4', name: '2022\u201323 Championship Season', year: 2023, status: 'archived', seriesCount: 7, startDate: 'Jul 2022', endDate: 'Jun 2023' },
    { id: 'sn-5', name: '2026\u201327 Championship Season', year: 2027, status: 'planning', seriesCount: 14, startDate: 'Jul 2026', endDate: 'Jun 2027' },
    { id: 'sn-6', name: '2025 Summer Series', year: 2025, status: 'completed', seriesCount: 3, startDate: 'Jun 2025', endDate: 'Aug 2025' },
    { id: 'sn-7', name: '2026 Summer Series', year: 2026, status: 'planning', seriesCount: 4, startDate: 'Jun 2026', endDate: 'Aug 2026' },
    { id: 'sn-8', name: '2024 Summer Series', year: 2024, status: 'archived', seriesCount: 2, startDate: 'Jun 2024', endDate: 'Aug 2024' },
    { id: 'sn-9', name: '2021\u201322 Inaugural Season', year: 2022, status: 'archived', seriesCount: 4, startDate: 'Sep 2021', endDate: 'May 2022' },
    { id: 'sn-10', name: '2025 Holiday Festival', year: 2025, status: 'completed', seriesCount: 2, startDate: 'Dec 2025', endDate: 'Jan 2026' },
    { id: 'sn-11', name: '2026 Spring Invitational Season', year: 2026, status: 'active', seriesCount: 3, startDate: 'Feb 2026', endDate: 'Apr 2026' },
    { id: 'sn-12', name: '2025 Preseason', year: 2025, status: 'completed', seriesCount: 2, startDate: 'Jul 2025', endDate: 'Aug 2025' },
    { id: 'sn-13', name: '2024 Holiday Festival', year: 2024, status: 'archived', seriesCount: 1, startDate: 'Dec 2024', endDate: 'Jan 2025' },
    { id: 'sn-14', name: '2023 Summer Series', year: 2023, status: 'archived', seriesCount: 2, startDate: 'Jun 2023', endDate: 'Aug 2023' },
    { id: 'sn-15', name: '2026 U-19 Development Season', year: 2026, status: 'active', seriesCount: 2, startDate: 'Jan 2026', endDate: 'Jun 2026' },
  ];

  // ── Entrants ──
  const entrants: SeriesEntrant[] = [
    { id: 'ent-1', name: 'KaNeXT Blazers', shortName: 'KaNeXT', logo: 'flame', seed: 1, wins: 14, losses: 3, draws: 5, points: 47, gd: 22, status: 'active' },
    { id: 'ent-2', name: 'Tom\u2019s Team (PBD)', shortName: 'PBD', logo: 'shield', seed: 2, wins: 13, losses: 4, draws: 5, points: 44, gd: 18, status: 'active' },
    { id: 'ent-3', name: 'Northridge United', shortName: 'NRU', logo: 'star', seed: 3, wins: 12, losses: 5, draws: 5, points: 41, gd: 15, status: 'active' },
    { id: 'ent-4', name: 'Metro FC', shortName: 'MFC', logo: 'circle', seed: 4, wins: 11, losses: 5, draws: 6, points: 39, gd: 12, status: 'active' },
    { id: 'ent-5', name: 'Eastside Athletic', shortName: 'ESA', logo: 'bolt', seed: 5, wins: 10, losses: 6, draws: 6, points: 36, gd: 8, status: 'active' },
    { id: 'ent-6', name: 'Lakewood SC', shortName: 'LSC', logo: 'drop', seed: 6, wins: 10, losses: 7, draws: 5, points: 35, gd: 7, status: 'active' },
    { id: 'ent-7', name: 'Central City FC', shortName: 'CCF', logo: 'building', seed: 7, wins: 9, losses: 7, draws: 6, points: 33, gd: 4, status: 'active' },
    { id: 'ent-8', name: 'Westside Academy', shortName: 'WSA', logo: 'book', seed: 8, wins: 9, losses: 8, draws: 5, points: 32, gd: 2, status: 'active' },
    { id: 'ent-9', name: 'Harbor Town FC', shortName: 'HTF', logo: 'anchor', seed: 9, wins: 8, losses: 8, draws: 6, points: 30, gd: 0, status: 'active' },
    { id: 'ent-10', name: 'Valley Rangers', shortName: 'VR', logo: 'mountain', seed: 10, wins: 7, losses: 9, draws: 6, points: 27, gd: -3, status: 'active' },
    { id: 'ent-11', name: 'Hilltop Dynamo', shortName: 'HD', logo: 'lightning', seed: 11, wins: 7, losses: 10, draws: 5, points: 26, gd: -5, status: 'active' },
    { id: 'ent-12', name: 'Riverside SC', shortName: 'RSC', logo: 'wave', seed: 12, wins: 6, losses: 10, draws: 6, points: 24, gd: -8, status: 'active' },
    { id: 'ent-13', name: 'Bayshore United', shortName: 'BSU', logo: 'sun', seed: 13, wins: 5, losses: 11, draws: 6, points: 21, gd: -11, status: 'eliminated' },
    { id: 'ent-14', name: 'Greenfield Town', shortName: 'GT', logo: 'leaf', seed: 14, wins: 4, losses: 12, draws: 6, points: 18, gd: -15, status: 'eliminated' },
    { id: 'ent-15', name: 'Iron Works SC', shortName: 'IWS', logo: 'hammer', seed: 15, wins: 3, losses: 13, draws: 6, points: 15, gd: -20, status: 'eliminated' },
    { id: 'ent-16', name: 'Docklands FC', shortName: 'DFC', logo: 'ship', seed: 16, wins: 2, losses: 14, draws: 6, points: 12, gd: -26, status: 'eliminated' },
    { id: 'ent-17', name: 'Sunset Athletic', shortName: 'SA', logo: 'sunset', seed: 17, wins: 8, losses: 6, draws: 4, points: 28, gd: 5, status: 'qualified' },
    { id: 'ent-18', name: 'Maple Grove FC', shortName: 'MGF', logo: 'tree', seed: 18, wins: 6, losses: 8, draws: 4, points: 22, gd: -2, status: 'withdrawn' },
    { id: 'ent-19', name: 'Summit FC', shortName: 'SFC', logo: 'peak', seed: 19, wins: 7, losses: 7, draws: 4, points: 25, gd: 1, status: 'active' },
    { id: 'ent-20', name: 'Coastal United', shortName: 'CU', logo: 'ocean', seed: 20, wins: 5, losses: 9, draws: 4, points: 19, gd: -7, status: 'active' },
  ];

  // ── Standings ──
  const standings: StandingsEntry[] = [
    { ...entrants[0], rank: 1, form: ['W', 'W', 'D', 'W', 'W'], streak: 'W4' },
    { ...entrants[1], rank: 2, form: ['W', 'L', 'W', 'W', 'D'], streak: 'D1' },
    { ...entrants[2], rank: 3, form: ['W', 'W', 'W', 'L', 'D'], streak: 'D1' },
    { ...entrants[3], rank: 4, form: ['D', 'W', 'W', 'D', 'W'], streak: 'W1' },
    { ...entrants[4], rank: 5, form: ['L', 'W', 'D', 'W', 'W'], streak: 'W2' },
    { ...entrants[5], rank: 6, form: ['W', 'D', 'L', 'W', 'W'], streak: 'W2' },
    { ...entrants[6], rank: 7, form: ['D', 'D', 'W', 'L', 'W'], streak: 'W1' },
    { ...entrants[7], rank: 8, form: ['L', 'W', 'W', 'D', 'L'], streak: 'L1' },
    { ...entrants[8], rank: 9, form: ['D', 'D', 'L', 'W', 'D'], streak: 'D1' },
    { ...entrants[9], rank: 10, form: ['L', 'D', 'W', 'L', 'D'], streak: 'D1' },
    { ...entrants[10], rank: 11, form: ['L', 'L', 'W', 'D', 'L'], streak: 'L1' },
    { ...entrants[11], rank: 12, form: ['D', 'L', 'L', 'D', 'W'], streak: 'W1' },
    { ...entrants[12], rank: 13, form: ['L', 'L', 'D', 'L', 'D'], streak: 'D1' },
    { ...entrants[13], rank: 14, form: ['L', 'D', 'L', 'L', 'L'], streak: 'L3' },
    { ...entrants[14], rank: 15, form: ['L', 'L', 'L', 'D', 'L'], streak: 'L1' },
    { ...entrants[15], rank: 16, form: ['L', 'L', 'L', 'L', 'D'], streak: 'D1' },
    { ...entrants[16], rank: 17, form: ['W', 'W', 'L', 'W', 'D'], streak: 'D1' },
    { ...entrants[18], rank: 18, form: ['W', 'D', 'L', 'W', 'L'], streak: 'L1' },
    { ...entrants[19], rank: 19, form: ['L', 'L', 'W', 'D', 'L'], streak: 'L1' },
    { ...entrants[17], rank: 20, form: ['L', 'D', 'L', 'L', 'W'], streak: 'W1' },
  ];

  // ── Calendar ──
  const calendar: CalendarEvent[] = [
    { id: 'cal-1', date: '2026-02-17', title: 'KaNeXT Blazers vs Northridge United', type: 'match', series: 'KaNeXT Church Premier League', venue: 'KaNeXT Arena' },
    { id: 'cal-2', date: '2026-02-17', title: 'Tom\u2019s Team vs Metro FC', type: 'match', series: 'KaNeXT Church Premier League', venue: 'PBD Sports Complex' },
    { id: 'cal-3', date: '2026-02-18', title: 'K-1 Invitational R16 \u2014 Match 1', type: 'match', series: 'K-1 Invitational', venue: 'Meridian Arena' },
    { id: 'cal-4', date: '2026-02-18', title: 'K-1 Invitational R16 \u2014 Match 2', type: 'match', series: 'K-1 Invitational', venue: 'Meridian Arena' },
    { id: 'cal-5', date: '2026-02-19', title: 'Transfer Deadline \u2014 KaNeXT Church League', type: 'deadline', series: 'KaNeXT Church Premier League', venue: '\u2014' },
    { id: 'cal-6', date: '2026-02-19', title: 'PBD Cup QF Draw Ceremony', type: 'ceremony', series: 'PBD Cup', venue: 'KaNeXT Church Headquarters' },
    { id: 'cal-7', date: '2026-02-20', title: 'Rest Day \u2014 K-1 Invitational', type: 'rest-day', series: 'K-1 Invitational', venue: '\u2014' },
    { id: 'cal-8', date: '2026-02-20', title: 'Pre-match Press Conference', type: 'media', series: 'PBD Cup', venue: 'Media Center' },
    { id: 'cal-9', date: '2026-02-21', title: 'PBD Cup QF \u2014 KaNeXT vs Eastside', type: 'match', series: 'PBD Cup', venue: 'KaNeXT Arena' },
    { id: 'cal-10', date: '2026-02-21', title: 'PBD Cup QF \u2014 PBD vs Lakewood', type: 'match', series: 'PBD Cup', venue: 'PBD Sports Complex' },
    { id: 'cal-11', date: '2026-02-22', title: 'Eastside vs Central City', type: 'match', series: 'KaNeXT Church Premier League', venue: 'Eastside Stadium' },
    { id: 'cal-12', date: '2026-02-22', title: 'K-1 Invitational R16 \u2014 Match 3', type: 'match', series: 'K-1 Invitational', venue: 'Valley Arena' },
    { id: 'cal-13', date: '2026-02-23', title: 'Award Voting Deadline \u2014 February', type: 'deadline', series: 'KaNeXT Church Premier League', venue: '\u2014' },
    { id: 'cal-14', date: '2026-02-24', title: 'KaNeXT Blazers vs Harbor Town', type: 'match', series: 'KaNeXT Church Premier League', venue: 'KaNeXT Arena' },
    { id: 'cal-15', date: '2026-02-24', title: 'Post-Round Media Day', type: 'media', series: 'K-1 Invitational', venue: 'Press Room' },
    { id: 'cal-16', date: '2026-02-25', title: 'U-19 Dev Cup Round 5 \u2014 Day 1', type: 'match', series: 'U-19 Development Cup', venue: 'Youth Complex' },
    { id: 'cal-17', date: '2026-02-25', title: 'Spring Showcase Registration Deadline', type: 'deadline', series: 'Spring Showcase', venue: '\u2014' },
    { id: 'cal-18', date: '2026-02-26', title: 'U-19 Dev Cup Round 5 \u2014 Day 2', type: 'match', series: 'U-19 Development Cup', venue: 'Youth Complex' },
    { id: 'cal-19', date: '2026-02-27', title: 'Valley Rangers vs Hilltop Dynamo', type: 'match', series: 'KaNeXT Church Premier League', venue: 'Valley Arena' },
    { id: 'cal-20', date: '2026-02-28', title: 'Monthly Board Meeting', type: 'ceremony', series: 'All Series', venue: 'KaNeXT Church Headquarters' },
    { id: 'cal-21', date: '2026-03-01', title: 'Spring Showcase Kickoff Ceremony', type: 'ceremony', series: 'Spring Showcase', venue: 'Meridian Arena' },
    { id: 'cal-22', date: '2026-03-02', title: 'Spring Showcase Day 1 Matches', type: 'match', series: 'Spring Showcase', venue: 'Meridian Arena' },
    { id: 'cal-23', date: '2026-03-03', title: 'K-1 Invitational Quarterfinals Day 1', type: 'match', series: 'K-1 Invitational', venue: 'Meridian Arena' },
    { id: 'cal-24', date: '2026-03-04', title: 'KaNeXT Church League Matchday 23', type: 'match', series: 'KaNeXT Church Premier League', venue: 'Various' },
    { id: 'cal-25', date: '2026-03-05', title: 'Broadcast Rights Review Meeting', type: 'media', series: 'All Series', venue: 'KaNeXT Church Headquarters' },
  ];

  // ── Awards ──
  const awards: Award[] = [
    { id: 'aw-1', name: 'League MVP', recipient: 'Marcus Cole (KaNeXT Blazers)', series: 'KaNeXT Church Premier League', season: '2024\u201325', category: 'individual', date: 'Jun 2025' },
    { id: 'aw-2', name: 'Golden Boot', recipient: 'Jalen Torres (Tom\u2019s Team PBD)', series: 'KaNeXT Church Premier League', season: '2024\u201325', category: 'individual', date: 'Jun 2025' },
    { id: 'aw-3', name: 'Best XI', recipient: 'KaNeXT Blazers (7 players selected)', series: 'KaNeXT Church Premier League', season: '2024\u201325', category: 'team', date: 'Jun 2025' },
    { id: 'aw-4', name: 'K-1 Invitational MVP', recipient: 'Dante Williams (Metro FC)', series: 'K-1 Invitational', season: '2024\u201325', category: 'individual', date: 'Mar 2025' },
    { id: 'aw-5', name: 'PBD Cup Champion', recipient: 'Northridge United', series: 'PBD Cup', season: '2024\u201325', category: 'team', date: 'Apr 2025' },
    { id: 'aw-6', name: 'Fair Play Award', recipient: 'Lakewood SC', series: 'KaNeXT Church Premier League', season: '2024\u201325', category: 'special', date: 'Jun 2025' },
    { id: 'aw-7', name: 'Young Player of the Year', recipient: 'Isaiah Brooks (Eastside Athletic)', series: 'All Series', season: '2024\u201325', category: 'individual', date: 'Jun 2025' },
    { id: 'aw-8', name: 'Coach of the Year', recipient: 'Alex Morgan (KaNeXT Blazers)', series: 'All Series', season: '2024\u201325', category: 'individual', date: 'Jun 2025' },
    { id: 'aw-9', name: 'Best Defense', recipient: 'KaNeXT Blazers (18 goals conceded)', series: 'KaNeXT Church Premier League', season: '2024\u201325', category: 'team', date: 'Jun 2025' },
    { id: 'aw-10', name: 'Fan Choice Award', recipient: 'Tom\u2019s Team (PBD)', series: 'All Series', season: '2024\u201325', category: 'special', date: 'Jun 2025' },
    { id: 'aw-11', name: 'Fall Classic Champion', recipient: 'Metro FC', series: 'Fall Classic', season: '2025\u201326', category: 'team', date: 'Oct 2025' },
    { id: 'aw-12', name: 'Holiday Invitational MVP', recipient: 'Kai Patel (Harbor Town FC)', series: 'Holiday Invitational', season: '2025\u201326', category: 'individual', date: 'Jan 2026' },
    { id: 'aw-13', name: 'Goalkeeper of the Year', recipient: 'Andre Marshall (Northridge United)', series: 'KaNeXT Church Premier League', season: '2024\u201325', category: 'individual', date: 'Jun 2025' },
    { id: 'aw-14', name: 'Spirit of Competition', recipient: 'Central City FC', series: 'All Series', season: '2024\u201325', category: 'special', date: 'Jun 2025' },
    { id: 'aw-15', name: 'City Derby MVP', recipient: 'Ryan Cross (Westside Academy)', series: 'City Derby Series', season: '2025\u201326', category: 'individual', date: 'Nov 2025' },
    { id: 'aw-16', name: 'Preseason Challenge Winner', recipient: 'KaNeXT Blazers', series: 'Preseason Challenge', season: '2025\u201326', category: 'team', date: 'Aug 2025' },
    { id: 'aw-17', name: 'Top Assist Provider', recipient: 'Derek Moyo (Tom\u2019s Team PBD)', series: 'KaNeXT Church Premier League', season: '2024\u201325', category: 'individual', date: 'Jun 2025' },
    { id: 'aw-18', name: 'Community Impact Award', recipient: 'Valley Rangers', series: 'All Series', season: '2024\u201325', category: 'special', date: 'Jun 2025' },
    { id: 'aw-19', name: 'Most Improved Team', recipient: 'Hilltop Dynamo', series: 'KaNeXT Church Premier League', season: '2024\u201325', category: 'team', date: 'Jun 2025' },
    { id: 'aw-20', name: 'Winter Classic Champion', recipient: 'KaNeXT Blazers', series: 'Winter Classic', season: '2025\u201326', category: 'team', date: 'Dec 2025' },
  ];

  // ── History ──
  const history: HistoryRecord[] = [
    { id: 'hist-1', season: '2024\u201325', champion: 'KaNeXT Blazers', runnerUp: 'Tom\u2019s Team (PBD)', mvp: 'Marcus Cole', totalMatches: 284, totalGoals: 712 },
    { id: 'hist-2', season: '2023\u201324', champion: 'Northridge United', runnerUp: 'KaNeXT Blazers', mvp: 'Liam Chen', totalMatches: 248, totalGoals: 638 },
    { id: 'hist-3', season: '2022\u201323', champion: 'Metro FC', runnerUp: 'Northridge United', mvp: 'Jordan Blake', totalMatches: 210, totalGoals: 571 },
    { id: 'hist-4', season: '2021\u201322', champion: 'KaNeXT Blazers', runnerUp: 'Metro FC', mvp: 'Deon Harper', totalMatches: 126, totalGoals: 342 },
    { id: 'hist-5', season: '2025\u201326 (in progress)', champion: 'TBD', runnerUp: 'TBD', mvp: 'TBD', totalMatches: 187, totalGoals: 498 },
    { id: 'hist-6', season: '2024 Summer', champion: 'Eastside Athletic', runnerUp: 'Lakewood SC', mvp: 'Tyrese Hammond', totalMatches: 48, totalGoals: 134 },
    { id: 'hist-7', season: '2025 Summer', champion: 'Tom\u2019s Team (PBD)', runnerUp: 'Central City FC', mvp: 'Jalen Torres', totalMatches: 62, totalGoals: 168 },
    { id: 'hist-8', season: '2023 Summer', champion: 'Harbor Town FC', runnerUp: 'Westside Academy', mvp: 'Kai Patel', totalMatches: 36, totalGoals: 98 },
    { id: 'hist-9', season: '2024 Holiday', champion: 'Northridge United', runnerUp: 'Valley Rangers', mvp: 'Andre Marshall', totalMatches: 15, totalGoals: 44 },
    { id: 'hist-10', season: '2025 Holiday', champion: 'KaNeXT Blazers', runnerUp: 'Hilltop Dynamo', mvp: 'Marcus Cole', totalMatches: 30, totalGoals: 86 },
    { id: 'hist-11', season: '2025 Fall Classic', champion: 'Metro FC', runnerUp: 'Eastside Athletic', mvp: 'Dante Williams', totalMatches: 60, totalGoals: 162 },
    { id: 'hist-12', season: '2025 Preseason', champion: 'KaNeXT Blazers', runnerUp: 'Lakewood SC', mvp: 'Marcus Cole', totalMatches: 28, totalGoals: 76 },
    { id: 'hist-13', season: '2025 City Derby', champion: 'Westside Academy', runnerUp: 'Central City FC', mvp: 'Ryan Cross', totalMatches: 14, totalGoals: 38 },
    { id: 'hist-14', season: '2025 Winter Classic', champion: 'KaNeXT Blazers', runnerUp: 'Tom\u2019s Team (PBD)', mvp: 'Isaiah Brooks', totalMatches: 12, totalGoals: 31 },
    { id: 'hist-15', season: '2026 K-1 (in progress)', champion: 'TBD', runnerUp: 'TBD', mvp: 'TBD', totalMatches: 16, totalGoals: 42 },
  ];

  // ── Settings ──
  const settings: SeriesSettingToggle[] = [
    { id: 'set-1', label: 'Auto-publish schedules', description: 'Automatically publish match schedules once all venues and times are confirmed.', enabled: true },
    { id: 'set-2', label: 'Entrant self-registration', description: 'Allow teams to register for open series without manual approval.', enabled: false },
    { id: 'set-3', label: 'Live score updates', description: 'Push real-time score updates to all series subscribers and public feeds.', enabled: true },
    { id: 'set-4', label: 'Automatic standings', description: 'Recalculate and publish standings automatically after each match result is confirmed.', enabled: true },
    { id: 'set-5', label: 'Require medical clearance', description: 'Require all entrants to submit medical clearance forms before competition.', enabled: true },
    { id: 'set-6', label: 'Broadcast integration', description: 'Enable StreamLive integration for automatic broadcast setup on match days.', enabled: false },
    { id: 'set-7', label: 'Referee auto-assignment', description: 'Automatically assign referees based on availability and certification level.', enabled: false },
    { id: 'set-8', label: 'Award voting', description: 'Enable fan and committee voting for series awards during active seasons.', enabled: true },
    { id: 'set-9', label: 'Transfer window enforcement', description: 'Enforce transfer window rules \u2014 block roster changes outside designated periods.', enabled: true },
    { id: 'set-10', label: 'Post-match reports required', description: 'Require teams to submit post-match reports within 24 hours.', enabled: false },
    { id: 'set-11', label: 'Disciplinary auto-suspension', description: 'Automatically apply suspensions based on accumulated yellow and red cards.', enabled: true },
    { id: 'set-12', label: 'Public standings page', description: 'Make standings and results visible to the public without authentication.', enabled: true },
    { id: 'set-13', label: 'Venue change notifications', description: 'Send automatic notifications to all affected parties when a venue is changed.', enabled: true },
    { id: 'set-14', label: 'Match day media accreditation', description: 'Require media organizations to apply for match day accreditation.', enabled: false },
    { id: 'set-15', label: 'Prize distribution approval', description: 'Require finance committee approval before distributing prize money.', enabled: true },
  ];

  return {
    dashboard,
    quickActions,
    recentActivity,
    activeSeries,
    formats,
    seasons,
    entrants,
    standings,
    calendar,
    awards,
    history,
    settings,
  };
}
