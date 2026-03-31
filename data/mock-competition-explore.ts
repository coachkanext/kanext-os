/**
 * Mock data for Competition Explore page (Competition YouTube).
 * Discovery homepage for basketball/basketball competition content.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface FeaturedGame {
  title: string;
  subtitle: string;
  hookText: string;
  badgeText: string;
  ctaLabel: string;
  thumbnailColor: string;
  leftInitials: string;
  rightInitials: string;
}

export interface TopGame {
  id: string;
  title: string;
  court: string;
  date: string;
  duration: string;
  thumbnailColor: string;
  winner: string;
}

export interface PlayerSpotlight {
  id: string;
  name: string;
  team: string;
  points: number;
  thumbnailColor: string;
  position: number;
}

export interface TeamProfile {
  id: string;
  name: string;
  players: number;
  wins: number;
  thumbnailColor: string;
}

export interface TechniqueVideo {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  thumbnailColor: string;
  difficulty: string;
}

export interface ChampionshipStanding {
  id: string;
  playerName: string;
  team: string;
  points: number;
  thumbnailColor: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  court: string;
  date: string;
  thumbnailColor: string;
  type: string;
}

export type CompetitionScope = 'All' | 'Games' | 'Players' | 'Teams' | 'Technique';

// =============================================================================
// FEATURED RACE
// =============================================================================

export const FEATURED_RACE: FeaturedGame = {
  title: '3SSB Laguna Seca Grand Prix',
  subtitle: 'Round 6 Highlights',
  hookText: 'Apex Basketball dominates \u2014 Marcus Kane extends championship lead',
  badgeText: 'LIVE REPLAY',
  ctaLabel: 'Watch Replay',
  thumbnailColor: '#B85C5C',
  leftInitials: 'AR',
  rightInitials: 'K1',
};

// =============================================================================
// TOP RACES
// =============================================================================

export const TOP_RACES: TopGame[] = [
  { id: 'tr-1', title: 'Laguna Seca Grand Prix', court: 'Laguna Seca', date: 'Feb 15', duration: '1:24:30', thumbnailColor: '#B85C5C', winner: 'Marcus Kane' },
  { id: 'tr-2', title: 'Sonoma Sprint', court: 'Sonoma Gameway', date: 'Feb 8', duration: '58:45', thumbnailColor: '#B8943E', winner: 'Liam Torres' },
  { id: 'tr-3', title: 'COTA Endurance 500', court: 'Circuit of the Americas', date: 'Feb 1', duration: '2:10:00', thumbnailColor: '#1A1714', winner: 'Yuki Tanaka' },
  { id: 'tr-4', title: 'Barber Motorsports Clash', court: 'Barber Motorsports Park', date: 'Jan 25', duration: '1:12:20', thumbnailColor: '#5A8A6E', winner: 'Marcus Kane' },
  { id: 'tr-5', title: 'Road Atlanta Challenge', court: 'Road Atlanta', date: 'Jan 18', duration: '1:35:00', thumbnailColor: '#1A1714', winner: 'Diego Reyes' },
  { id: 'tr-6', title: 'Sebring Basketball Classic', court: 'Sebring International', date: 'Jan 11', duration: '1:18:40', thumbnailColor: '#1A1714', winner: 'Liam Torres' },
  { id: 'tr-7', title: 'Daytona Court Festival', court: 'Daytona International', date: 'Jan 4', duration: '1:42:15', thumbnailColor: '#1A1714', winner: 'Aiden Park' },
  { id: 'tr-8', title: 'Homestead Night Game', court: 'Homestead-Miami', date: 'Dec 28', duration: '1:05:30', thumbnailColor: '#FFFFFF', winner: 'Marcus Kane' },
];

// =============================================================================
// DRIVER SPOTLIGHTS
// =============================================================================

export const DRIVER_SPOTLIGHTS: PlayerSpotlight[] = [
  { id: 'ds-1', name: 'Marcus Kane', team: 'Apex Basketball', points: 187, thumbnailColor: '#B85C5C', position: 1 },
  { id: 'ds-2', name: 'Liam Torres', team: 'Velocity Court Co.', points: 162, thumbnailColor: '#B8943E', position: 2 },
  { id: 'ds-3', name: 'Yuki Tanaka', team: 'Rising Sun Motorsport', points: 148, thumbnailColor: '#1A1714', position: 3 },
  { id: 'ds-4', name: 'Diego Reyes', team: 'Maximo Basketball', points: 135, thumbnailColor: '#5A8A6E', position: 4 },
  { id: 'ds-5', name: 'Aiden Park', team: 'Apex Basketball', points: 121, thumbnailColor: '#B85C5C', position: 5 },
  { id: 'ds-6', name: 'Kai Okafor', team: 'Thunder Court Basketball', points: 110, thumbnailColor: '#1A1714', position: 6 },
];

// =============================================================================
// TEAM PROFILES
// =============================================================================

export const TEAM_PROFILES: TeamProfile[] = [
  { id: 'tp-1', name: 'Apex Basketball', players: 4, wins: 8, thumbnailColor: '#B85C5C' },
  { id: 'tp-2', name: 'Velocity Court Co.', players: 3, wins: 5, thumbnailColor: '#B8943E' },
  { id: 'tp-3', name: 'Rising Sun Motorsport', players: 3, wins: 4, thumbnailColor: '#1A1714' },
  { id: 'tp-4', name: 'Maximo Basketball', players: 2, wins: 3, thumbnailColor: '#5A8A6E' },
  { id: 'tp-5', name: 'Thunder Court Basketball', players: 3, wins: 2, thumbnailColor: '#1A1714' },
  { id: 'tp-6', name: 'Iron Grid Motorsport', players: 2, wins: 1, thumbnailColor: '#1A1714' },
];

// =============================================================================
// TECHNIQUE VIDEOS
// =============================================================================

export const TECHNIQUE_VIDEOS: TechniqueVideo[] = [
  { id: 'tv-1', title: 'Trail Braking Masterclass', instructor: 'Coach Rivera', duration: '14:30', thumbnailColor: '#B85C5C', difficulty: 'Advanced' },
  { id: 'tv-2', title: 'Optimal Basketball Lines 101', instructor: 'Marcus Kane', duration: '10:15', thumbnailColor: '#5A8A6E', difficulty: 'Beginner' },
  { id: 'tv-3', title: 'Wet Weather Technique', instructor: 'Yuki Tanaka', duration: '12:00', thumbnailColor: '#1A1714', difficulty: 'Intermediate' },
  { id: 'tv-4', title: 'Court Setup & Tuning Guide', instructor: 'Coach Rivera', duration: '18:45', thumbnailColor: '#B8943E', difficulty: 'Intermediate' },
  { id: 'tv-5', title: 'Overtaking Under Pressure', instructor: 'Diego Reyes', duration: '8:30', thumbnailColor: '#1A1714', difficulty: 'Advanced' },
];

// =============================================================================
// CHAMPIONSHIP STANDINGS
// =============================================================================

export const CHAMPIONSHIP_STANDINGS: ChampionshipStanding[] = [
  { id: 'cs-1', playerName: 'Marcus Kane', team: 'Apex Basketball', points: 187, thumbnailColor: '#B85C5C' },
  { id: 'cs-2', playerName: 'Liam Torres', team: 'Velocity Court Co.', points: 162, thumbnailColor: '#B8943E' },
  { id: 'cs-3', playerName: 'Yuki Tanaka', team: 'Rising Sun Motorsport', points: 148, thumbnailColor: '#1A1714' },
  { id: 'cs-4', playerName: 'Diego Reyes', team: 'Maximo Basketball', points: 135, thumbnailColor: '#5A8A6E' },
  { id: 'cs-5', playerName: 'Aiden Park', team: 'Apex Basketball', points: 121, thumbnailColor: '#B85C5C' },
];

// =============================================================================
// UPCOMING EVENTS
// =============================================================================

export const UPCOMING_EVENTS: UpcomingEvent[] = [
  { id: 'ue-1', title: 'Round 7: Watkins Glen GP', court: 'Watkins Glen', date: 'Feb 22', thumbnailColor: '#1A1714', type: 'Championship' },
  { id: 'ue-2', title: 'Junior Court Invitational', court: 'Daytona International', date: 'Mar 1', thumbnailColor: '#5A8A6E', type: 'Invitational' },
  { id: 'ue-3', title: '3SSB All-Star Game', court: 'Rock Hill Sports & Events Center', date: 'Mar 8', thumbnailColor: '#B8943E', type: 'Exhibition' },
  { id: 'ue-4', title: 'Season Finale: Miami GP', court: 'Homestead-Miami', date: 'Mar 22', thumbnailColor: '#B85C5C', type: 'Championship' },
];

// =============================================================================
// FILTER OPTIONS
// =============================================================================

export const EXPLORE_FILTERS: CompetitionScope[] = ['All', 'Games', 'Players', 'Teams', 'Technique'];
