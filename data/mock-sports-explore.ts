/**
 * Mock data for Sports Explore page (Media tab).
 * YouTube-style discovery homepage for sports content.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface HeroFeature {
  id: string;
  homeTeam: string;
  homeInitials: string;
  awayTeam: string;
  awayInitials: string;
  league: string;
  hookText: string;
  date: string;
  badgeText: string;
  thumbnailColor: string;
}

export interface GameCard {
  id: string;
  homeTeam: string;
  homeInitials: string;
  awayTeam: string;
  awayInitials: string;
  score?: string;
  date: string;
  badge?: string;
  duration: string;
  thumbnailColor: string;
  isLive?: boolean;
}

export interface ContinueWatchingItem {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  progress: number; // 0-1
  thumbnailColor: string;
}

export interface ProgramTile {
  id: string;
  name: string;
  initials: string;
  conference: string;
  record: string;
  thumbnailColor: string;
}

export interface PlayerSpotlight {
  id: string;
  name: string;
  position: string;
  team: string;
  stat: string;
  thumbnailColor: string;
}

export interface EventCard {
  id: string;
  title: string;
  date: string;
  location: string;
  type: 'showcase' | 'tournament' | 'camp' | 'combine';
  thumbnailColor: string;
}

export interface CoachPick {
  id: string;
  title: string;
  subtitle: string;
  authorName: string;
  thumbnailColor: string;
  duration: string;
}

export type ExploreFilterScope = 'All' | 'College' | 'Prep';
export type ExploreSort = 'Trending' | 'Recent' | 'Top Rated';

// =============================================================================
// HERO FEATURE
// =============================================================================

export const HERO_FEATURE: HeroFeature = {
  id: 'hero-1',
  homeTeam: 'KaNeXT Sports',
  homeInitials: 'KaNeXT',
  awayTeam: 'Webber International',
  awayInitials: 'WIU',
  league: 'KaNeXT Conference',
  hookText: 'Lions look to clinch home court — must-win conference showdown',
  date: 'Sat, Feb 21',
  badgeText: 'FEATURED',
  thumbnailColor: '#1D9BF0',
};

// =============================================================================
// CONTINUE WATCHING
// =============================================================================

export const CONTINUE_WATCHING: ContinueWatchingItem[] = [
  { id: 'cw-1', title: 'KaNeXT vs Thomas University', subtitle: 'Full Game Replay', duration: '1:48:32', progress: 0.65, thumbnailColor: '#1D9BF0' },
  { id: 'cw-2', title: 'Marcus Reed Highlights', subtitle: '2025-26 Season Mix', duration: '8:44', progress: 0.3, thumbnailColor: '#FFFFFF' },
  { id: 'cw-3', title: 'KaNeXT Conference Weekly', subtitle: 'Episode 18 — Race Heats Up', duration: '22:15', progress: 0.82, thumbnailColor: '#22C55E' },
  { id: 'cw-4', title: 'Defensive Film Study', subtitle: 'Zone Press Breakdown', duration: '14:20', progress: 0.45, thumbnailColor: '#1D9BF0' },
  { id: 'cw-5', title: 'KaNeXT vs Warner University', subtitle: 'Full Game Replay', duration: '1:52:10', progress: 0.12, thumbnailColor: '#EF4444' },
];

// =============================================================================
// TOP GAMES
// =============================================================================

export const TOP_GAMES: GameCard[] = [
  { id: 'tg-1', homeTeam: 'KaNeXT Sports', homeInitials: 'KaNeXT', awayTeam: 'Webber Intl', awayInitials: 'WIU', date: 'Feb 21', badge: 'UPCOMING', duration: 'TBD', thumbnailColor: '#1D9BF0' },
  { id: 'tg-2', homeTeam: 'Warner', homeInitials: 'WAR', awayTeam: 'Ave Maria', awayInitials: 'AVE', date: 'Feb 20', badge: 'UPCOMING', duration: 'TBD', thumbnailColor: '#1D9BF0' },
  { id: 'tg-3', homeTeam: 'KaNeXT Sports', homeInitials: 'KaNeXT', awayTeam: 'Thomas Univ', awayInitials: 'THO', score: '82-74', date: 'Feb 15', duration: '1:48:32', thumbnailColor: '#1D9BF0' },
  { id: 'tg-4', homeTeam: 'Southeastern', homeInitials: 'SEU', awayTeam: 'Keiser', awayInitials: 'KEI', score: '91-88', date: 'Feb 15', badge: 'OT', duration: '2:05:10', thumbnailColor: '#F59E0B' },
  { id: 'tg-5', homeTeam: 'St. Thomas', homeInitials: 'STU', awayTeam: 'Webber Intl', awayInitials: 'WIU', score: '67-71', date: 'Feb 13', duration: '1:44:20', thumbnailColor: '#1D9BF0' },
  { id: 'tg-6', homeTeam: 'Ave Maria', homeInitials: 'AVE', awayTeam: 'Johnson', awayInitials: 'JU', score: '79-65', date: 'Feb 13', duration: '1:46:55', thumbnailColor: '#22C55E' },
  { id: 'tg-7', homeTeam: 'KaNeXT Sports', homeInitials: 'KaNeXT', awayTeam: 'Warner', awayInitials: 'WAR', score: '88-76', date: 'Feb 11', duration: '1:52:10', thumbnailColor: '#1D9BF0' },
  { id: 'tg-8', homeTeam: 'Keiser', homeInitials: 'KEI', awayTeam: 'Southeastern', awayInitials: 'SEU', score: '73-80', date: 'Feb 11', duration: '1:50:00', thumbnailColor: '#EF4444' },
];

// =============================================================================
// NEW UPLOADS
// =============================================================================

export const NEW_UPLOADS: GameCard[] = [
  { id: 'nu-1', homeTeam: 'KaNeXT', homeInitials: 'KaNeXT', awayTeam: 'Thomas', awayInitials: 'THO', score: '82-74', date: '2h ago', duration: '1:48:32', thumbnailColor: '#1D9BF0' },
  { id: 'nu-2', homeTeam: 'SEU', homeInitials: 'SEU', awayTeam: 'Keiser', awayInitials: 'KEI', score: '91-88', date: '5h ago', badge: 'OT', duration: '2:05:10', thumbnailColor: '#F59E0B' },
  { id: 'nu-3', homeTeam: 'Warner', homeInitials: 'WAR', awayTeam: 'St. Thomas', awayInitials: 'STU', score: '85-79', date: '8h ago', duration: '1:50:22', thumbnailColor: '#1D9BF0' },
  { id: 'nu-4', homeTeam: 'Ave Maria', homeInitials: 'AVE', awayTeam: 'Johnson', awayInitials: 'JU', score: '79-65', date: '1d ago', duration: '1:46:55', thumbnailColor: '#22C55E' },
  { id: 'nu-5', homeTeam: 'KaNeXT', homeInitials: 'KaNeXT', awayTeam: 'Warner', awayInitials: 'WAR', score: '88-76', date: '3d ago', duration: '1:52:10', thumbnailColor: '#1D9BF0' },
  { id: 'nu-6', homeTeam: 'Webber', homeInitials: 'WIU', awayTeam: 'Southeastern', awayInitials: 'SEU', score: '70-68', date: '3d ago', duration: '1:42:18', thumbnailColor: '#1D9BF0' },
];

// =============================================================================
// TRENDING PROGRAMS
// =============================================================================

export const TRENDING_PROGRAMS: ProgramTile[] = [
  { id: 'tp-1', name: 'KaNeXT Sports', initials: 'KaNeXT', conference: 'KaNeXT Conference', record: '18-8', thumbnailColor: '#1D9BF0' },
  { id: 'tp-2', name: 'Southeastern', initials: 'SEU', conference: 'KaNeXT Conference', record: '20-6', thumbnailColor: '#1D9BF0' },
  { id: 'tp-3', name: 'Keiser', initials: 'KEI', conference: 'KaNeXT Conference', record: '17-9', thumbnailColor: '#EF4444' },
  { id: 'tp-4', name: 'Warner', initials: 'WAR', conference: 'KaNeXT Conference', record: '15-11', thumbnailColor: '#F59E0B' },
  { id: 'tp-5', name: 'Ave Maria', initials: 'AVE', conference: 'KaNeXT Conference', record: '14-12', thumbnailColor: '#22C55E' },
  { id: 'tp-6', name: 'Webber International', initials: 'WIU', conference: 'KaNeXT Conference', record: '16-10', thumbnailColor: '#1D9BF0' },
  { id: 'tp-7', name: 'St. Thomas', initials: 'STU', conference: 'KaNeXT Conference', record: '13-13', thumbnailColor: '#1D9BF0' },
  { id: 'tp-8', name: 'Thomas University', initials: 'THO', conference: 'KaNeXT Conference', record: '11-15', thumbnailColor: '#52525B' },
];

// =============================================================================
// PLAYERS TO WATCH
// =============================================================================

export const PLAYERS_TO_WATCH: PlayerSpotlight[] = [
  { id: 'pw-1', name: 'Marcus Reed', position: 'PG', team: 'KaNeXT Sports', stat: '18.5 PPG / 7.1 APG', thumbnailColor: '#1D9BF0' },
  { id: 'pw-2', name: 'Devon Carter', position: 'B', team: 'KaNeXT Sports', stat: '14.0 PPG / 10.2 RPG', thumbnailColor: '#1D9BF0' },
  { id: 'pw-3', name: 'Paul Diomande', position: 'F', team: 'KaNeXT Sports', stat: '15.5 PPG / 8.0 RPG', thumbnailColor: '#1D9BF0' },
  { id: 'pw-4', name: 'Alex Morgan', position: 'CG', team: 'Southeastern', stat: '22.3 PPG / 4.1 APG', thumbnailColor: '#1D9BF0' },
  { id: 'pw-5', name: 'DeShawn Carter', position: 'F', team: 'Keiser', stat: '16.8 PPG / 9.4 RPG', thumbnailColor: '#EF4444' },
  { id: 'pw-6', name: 'Jaylen Mitchell', position: 'CG', team: 'Warner', stat: '19.2 PPG / 3.8 SPG', thumbnailColor: '#F59E0B' },
  { id: 'pw-7', name: 'Tyrell Adams', position: 'PG', team: 'Ave Maria', stat: '14.6 PPG / 8.2 APG', thumbnailColor: '#22C55E' },
  { id: 'pw-8', name: 'Chris Patterson', position: 'B', team: 'Webber Intl', stat: '12.4 PPG / 11.0 RPG', thumbnailColor: '#1D9BF0' },
];

// =============================================================================
// EVENTS & SHOWCASES
// =============================================================================

export const EVENTS_SHOWCASES: EventCard[] = [
  { id: 'ev-1', title: 'KaNeXT Conference Tournament', date: 'Mar 1-4', location: 'Lakeland, FL', type: 'tournament', thumbnailColor: '#F59E0B' },
  { id: 'ev-2', title: 'NAIA National Championship', date: 'Mar 18-24', location: 'Kansas City, MO', type: 'tournament', thumbnailColor: '#22C55E' },
  { id: 'ev-3', title: 'MLK Truth Classic', date: 'Jan 2027', location: 'Miami, FL', type: 'showcase', thumbnailColor: '#FFFFFF' },
  { id: 'ev-4', title: 'South Ridgemont Prep Showcase', date: 'Apr 12-14', location: 'Fort Lauderdale, FL', type: 'showcase', thumbnailColor: '#1D9BF0' },
  { id: 'ev-5', title: 'NAIA Combine', date: 'May 8-10', location: 'Nashville, TN', type: 'combine', thumbnailColor: '#1D9BF0' },
  { id: 'ev-6', title: 'Elite Camp Series', date: 'Jun 15-20', location: 'Orlando, FL', type: 'camp', thumbnailColor: '#EF4444' },
];

// =============================================================================
// COACH PICKS
// =============================================================================

export const COACH_PICKS: CoachPick[] = [
  { id: 'cp-1', title: 'Zone Press Breakdown', subtitle: 'How KaNeXT dismantled Thomas\'s zone — film session', authorName: 'Coach K', thumbnailColor: '#1D9BF0', duration: '14:32' },
  { id: 'cp-2', title: 'PnR Decision-Making Masterclass', subtitle: 'Marcus Reed reads vs traps and switches', authorName: 'Coach K', thumbnailColor: '#FFFFFF', duration: '11:15' },
  { id: 'cp-3', title: 'Transition Defense Principles', subtitle: 'Getting back, matching up, protecting the paint', authorName: 'Coach K', thumbnailColor: '#22C55E', duration: '18:44' },
  { id: 'cp-4', title: 'NAIA Scouting: Top 10 Guards', subtitle: 'Who to watch in the conference tournament', authorName: 'Scout Team', thumbnailColor: '#1D9BF0', duration: '22:08' },
  { id: 'cp-5', title: 'Recruiting Film: Spring Class', subtitle: 'Top prospects for the 2027 class', authorName: 'Scout Team', thumbnailColor: '#1D9BF0', duration: '16:50' },
];

// =============================================================================
// FILTER OPTIONS
// =============================================================================

export const EXPLORE_SCOPE_OPTIONS: ExploreFilterScope[] = ['All', 'College', 'Prep'];
export const EXPLORE_SORT_OPTIONS: ExploreSort[] = ['Trending', 'Recent', 'Top Rated'];
