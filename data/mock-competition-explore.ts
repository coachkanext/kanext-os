/**
 * Mock data for Competition Explore page (Competition YouTube).
 * Discovery homepage for karting/racing competition content.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface FeaturedRace {
  title: string;
  subtitle: string;
  hookText: string;
  badgeText: string;
  ctaLabel: string;
  thumbnailColor: string;
  leftInitials: string;
  rightInitials: string;
}

export interface TopRace {
  id: string;
  title: string;
  track: string;
  date: string;
  duration: string;
  thumbnailColor: string;
  winner: string;
}

export interface DriverSpotlight {
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
  drivers: number;
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
  driverName: string;
  team: string;
  points: number;
  thumbnailColor: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  track: string;
  date: string;
  thumbnailColor: string;
  type: string;
}

export type CompetitionScope = 'All' | 'Races' | 'Drivers' | 'Teams' | 'Technique';

// =============================================================================
// FEATURED RACE
// =============================================================================

export const FEATURED_RACE: FeaturedRace = {
  title: 'K-1 Laguna Seca Grand Prix',
  subtitle: 'Round 6 Highlights',
  hookText: 'Apex Racing dominates \u2014 Marcus Kane extends championship lead',
  badgeText: 'LIVE REPLAY',
  ctaLabel: 'Watch Replay',
  thumbnailColor: '#EF4444',
  leftInitials: 'AR',
  rightInitials: 'K1',
};

// =============================================================================
// TOP RACES
// =============================================================================

export const TOP_RACES: TopRace[] = [
  { id: 'tr-1', title: 'Laguna Seca Grand Prix', track: 'Laguna Seca', date: 'Feb 15', duration: '1:24:30', thumbnailColor: '#EF4444', winner: 'Marcus Kane' },
  { id: 'tr-2', title: 'Sonoma Sprint', track: 'Sonoma Raceway', date: 'Feb 8', duration: '58:45', thumbnailColor: '#F59E0B', winner: 'Liam Torres' },
  { id: 'tr-3', title: 'COTA Endurance 500', track: 'Circuit of the Americas', date: 'Feb 1', duration: '2:10:00', thumbnailColor: '#1B4F8A', winner: 'Yuki Tanaka' },
  { id: 'tr-4', title: 'Barber Motorsports Clash', track: 'Barber Motorsports Park', date: 'Jan 25', duration: '1:12:20', thumbnailColor: '#22C55E', winner: 'Marcus Kane' },
  { id: 'tr-5', title: 'Road Atlanta Challenge', track: 'Road Atlanta', date: 'Jan 18', duration: '1:35:00', thumbnailColor: '#7A5CFF', winner: 'Diego Reyes' },
  { id: 'tr-6', title: 'Sebring Karting Classic', track: 'Sebring International', date: 'Jan 11', duration: '1:18:40', thumbnailColor: '#C2185B', winner: 'Liam Torres' },
  { id: 'tr-7', title: 'Daytona Kart Festival', track: 'Daytona International', date: 'Jan 4', duration: '1:42:15', thumbnailColor: '#6AA9FF', winner: 'Aiden Park' },
  { id: 'tr-8', title: 'Homestead Night Race', track: 'Homestead-Miami', date: 'Dec 28', duration: '1:05:30', thumbnailColor: '#FFFFFF', winner: 'Marcus Kane' },
];

// =============================================================================
// DRIVER SPOTLIGHTS
// =============================================================================

export const DRIVER_SPOTLIGHTS: DriverSpotlight[] = [
  { id: 'ds-1', name: 'Marcus Kane', team: 'Apex Racing', points: 187, thumbnailColor: '#EF4444', position: 1 },
  { id: 'ds-2', name: 'Liam Torres', team: 'Velocity Kart Co.', points: 162, thumbnailColor: '#F59E0B', position: 2 },
  { id: 'ds-3', name: 'Yuki Tanaka', team: 'Rising Sun Motorsport', points: 148, thumbnailColor: '#1B4F8A', position: 3 },
  { id: 'ds-4', name: 'Diego Reyes', team: 'Maximo Racing', points: 135, thumbnailColor: '#22C55E', position: 4 },
  { id: 'ds-5', name: 'Aiden Park', team: 'Apex Racing', points: 121, thumbnailColor: '#EF4444', position: 5 },
  { id: 'ds-6', name: 'Kai Okafor', team: 'Thunder Kart Racing', points: 110, thumbnailColor: '#7A5CFF', position: 6 },
];

// =============================================================================
// TEAM PROFILES
// =============================================================================

export const TEAM_PROFILES: TeamProfile[] = [
  { id: 'tp-1', name: 'Apex Racing', drivers: 4, wins: 8, thumbnailColor: '#EF4444' },
  { id: 'tp-2', name: 'Velocity Kart Co.', drivers: 3, wins: 5, thumbnailColor: '#F59E0B' },
  { id: 'tp-3', name: 'Rising Sun Motorsport', drivers: 3, wins: 4, thumbnailColor: '#1B4F8A' },
  { id: 'tp-4', name: 'Maximo Racing', drivers: 2, wins: 3, thumbnailColor: '#22C55E' },
  { id: 'tp-5', name: 'Thunder Kart Racing', drivers: 3, wins: 2, thumbnailColor: '#7A5CFF' },
  { id: 'tp-6', name: 'Iron Grid Motorsport', drivers: 2, wins: 1, thumbnailColor: '#C2185B' },
];

// =============================================================================
// TECHNIQUE VIDEOS
// =============================================================================

export const TECHNIQUE_VIDEOS: TechniqueVideo[] = [
  { id: 'tv-1', title: 'Trail Braking Masterclass', instructor: 'Coach Rivera', duration: '14:30', thumbnailColor: '#EF4444', difficulty: 'Advanced' },
  { id: 'tv-2', title: 'Optimal Racing Lines 101', instructor: 'Marcus Kane', duration: '10:15', thumbnailColor: '#22C55E', difficulty: 'Beginner' },
  { id: 'tv-3', title: 'Wet Weather Technique', instructor: 'Yuki Tanaka', duration: '12:00', thumbnailColor: '#6AA9FF', difficulty: 'Intermediate' },
  { id: 'tv-4', title: 'Kart Setup & Tuning Guide', instructor: 'Coach Rivera', duration: '18:45', thumbnailColor: '#F59E0B', difficulty: 'Intermediate' },
  { id: 'tv-5', title: 'Overtaking Under Pressure', instructor: 'Diego Reyes', duration: '8:30', thumbnailColor: '#7A5CFF', difficulty: 'Advanced' },
];

// =============================================================================
// CHAMPIONSHIP STANDINGS
// =============================================================================

export const CHAMPIONSHIP_STANDINGS: ChampionshipStanding[] = [
  { id: 'cs-1', driverName: 'Marcus Kane', team: 'Apex Racing', points: 187, thumbnailColor: '#EF4444' },
  { id: 'cs-2', driverName: 'Liam Torres', team: 'Velocity Kart Co.', points: 162, thumbnailColor: '#F59E0B' },
  { id: 'cs-3', driverName: 'Yuki Tanaka', team: 'Rising Sun Motorsport', points: 148, thumbnailColor: '#1B4F8A' },
  { id: 'cs-4', driverName: 'Diego Reyes', team: 'Maximo Racing', points: 135, thumbnailColor: '#22C55E' },
  { id: 'cs-5', driverName: 'Aiden Park', team: 'Apex Racing', points: 121, thumbnailColor: '#EF4444' },
];

// =============================================================================
// UPCOMING EVENTS
// =============================================================================

export const UPCOMING_EVENTS: UpcomingEvent[] = [
  { id: 'ue-1', title: 'Round 7: Watkins Glen GP', track: 'Watkins Glen', date: 'Feb 22', thumbnailColor: '#1B4F8A', type: 'Championship' },
  { id: 'ue-2', title: 'Junior Kart Invitational', track: 'Daytona International', date: 'Mar 1', thumbnailColor: '#22C55E', type: 'Invitational' },
  { id: 'ue-3', title: 'K-1 All-Star Race', track: 'Indianapolis Motor Speedway', date: 'Mar 8', thumbnailColor: '#F59E0B', type: 'Exhibition' },
  { id: 'ue-4', title: 'Season Finale: Miami GP', track: 'Homestead-Miami', date: 'Mar 22', thumbnailColor: '#EF4444', type: 'Championship' },
];

// =============================================================================
// FILTER OPTIONS
// =============================================================================

export const EXPLORE_FILTERS: CompetitionScope[] = ['All', 'Races', 'Drivers', 'Teams', 'Technique'];
