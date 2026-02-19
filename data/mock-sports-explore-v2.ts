/**
 * Sports Explore V2 — RBAC-gated shelf-based discovery data.
 * 8 shelves with 5-8 items each, keyed to VideoSection RBAC.
 */

import type { VideoSection } from '@/utils/sports-rbac';

// =============================================================================
// TYPES
// =============================================================================

export type ShelfId =
  | 'official_releases'
  | 'game_center'
  | 'player_hub'
  | 'practice_install'
  | 'scouting_opponent'
  | 'recruiting_targets'
  | 'development_clips'
  | 'conference_league';

export type ShelfSort = 'latest' | 'most_watched' | 'staff_picks' | 'kr_linked';

export interface ExploreShelfItem {
  id: string;
  title: string;
  subtitle: string;
  thumbnailColor: string;
  duration: string;
  badge?: string;
  date: string;
  viewCount: number;
  source: string;
}

export interface ExploreShelf {
  id: ShelfId;
  title: string;
  rbacSection: VideoSection;
  items: ExploreShelfItem[];
}

export type ExploreFilterType = 'All' | 'Highlights' | 'Full Game' | 'Cut-ups' | 'Practice' | 'Scout' | 'Dev';
export type ExploreFilterAccess = 'All' | 'Public' | 'Internal' | 'Staff';

export const EXPLORE_TYPE_OPTIONS: ExploreFilterType[] = [
  'All', 'Highlights', 'Full Game', 'Cut-ups', 'Practice', 'Scout', 'Dev',
];

export const EXPLORE_ACCESS_OPTIONS: ExploreFilterAccess[] = [
  'All', 'Public', 'Internal', 'Staff',
];

export const SHELF_SORT_OPTIONS: { key: ShelfSort; label: string }[] = [
  { key: 'latest', label: 'Latest' },
  { key: 'most_watched', label: 'Most Watched' },
  { key: 'staff_picks', label: 'Staff Picks' },
  { key: 'kr_linked', label: 'KR-Linked' },
];

// =============================================================================
// TRENDING
// =============================================================================

export interface TrendingItem {
  id: string;
  title: string;
  subtitle: string;
  thumbnailColor: string;
  viewCount: number;
  badge: 'featured' | 'trending';
  duration: string;
}

export const SPORTS_TRENDING: TrendingItem[] = [
  { id: 'st-1', title: 'FMU vs Lincoln Christian — Full Highlights', subtitle: 'Season Opener · Sun Conference', thumbnailColor: '#1E3A5F', viewCount: 5200, badge: 'featured', duration: '8:42' },
  { id: 'st-2', title: 'Jaylen Carter 32-Point Explosion', subtitle: 'Career High · Feb 14', thumbnailColor: '#2D1B69', viewCount: 3800, badge: 'trending', duration: '4:15' },
  { id: 'st-3', title: 'Dunk of the Week: Carter Poster', subtitle: 'Sun Conference Honors', thumbnailColor: '#1A3D2A', viewCount: 7100, badge: 'trending', duration: '0:48' },
];

// =============================================================================
// DATA — 8 SHELVES
// =============================================================================

export const SPORTS_EXPLORE_SHELVES: ExploreShelf[] = [
  // A) Official Releases
  {
    id: 'official_releases',
    title: 'Official Releases',
    rbacSection: 'explore_official_releases',
    items: [
      { id: 'or-1', title: 'FMU Season Opener Highlights', subtitle: 'vs Lincoln Christian', thumbnailColor: '#1E3A5F', duration: '4:32', badge: 'NEW', date: 'Feb 14', viewCount: 2840, source: 'FMU Athletics' },
      { id: 'or-2', title: 'Media Day 2025-26', subtitle: 'Men\'s Basketball', thumbnailColor: '#2D1B69', duration: '12:15', date: 'Oct 3', viewCount: 1520, source: 'FMU Athletics' },
      { id: 'or-3', title: 'Press Conference: Coach Kalejaiye', subtitle: 'Postseason Update', thumbnailColor: '#0D2137', duration: '18:42', date: 'Feb 10', viewCount: 890, source: 'FMU Media' },
      { id: 'or-4', title: 'Senior Night Ceremony', subtitle: 'Honoring the Class of 2026', thumbnailColor: '#3D1A1A', duration: '8:55', date: 'Feb 8', viewCount: 3200, source: 'FMU Athletics' },
      { id: 'or-5', title: 'Dunk of the Week: Carter', subtitle: 'Transition Slam vs SW Assemblies', thumbnailColor: '#1A3D2A', duration: '0:48', badge: 'TRENDING', date: 'Feb 12', viewCount: 5100, source: 'Sun Conference' },
      { id: 'or-6', title: 'FMU Hype Video 2025-26', subtitle: 'Rise Together', thumbnailColor: '#2A1A3D', duration: '2:15', date: 'Nov 1', viewCount: 7800, source: 'FMU Athletics' },
    ],
  },

  // B) Game Center
  {
    id: 'game_center',
    title: 'Game Center',
    rbacSection: 'explore_game_center',
    items: [
      { id: 'gc-1', title: 'FMU vs Lincoln Christian', subtitle: 'Sun Conference', thumbnailColor: '#1E3A5F', duration: '1:48:22', badge: 'FULL GAME', date: 'Feb 14', viewCount: 420, source: 'Game Film' },
      { id: 'gc-2', title: 'FMU vs SW Assemblies', subtitle: 'Sun Conference', thumbnailColor: '#3D2A1A', duration: '1:52:10', date: 'Feb 8', viewCount: 380, source: 'Game Film' },
      { id: 'gc-3', title: 'FMU vs Mid-America Nazarene', subtitle: 'Sun Conference', thumbnailColor: '#1A3D1A', duration: '1:45:33', date: 'Feb 1', viewCount: 310, source: 'Game Film' },
      { id: 'gc-4', title: 'FMU vs Oklahoma Panhandle', subtitle: 'Non-Conference', thumbnailColor: '#3D1A3D', duration: '1:50:08', date: 'Jan 25', viewCount: 290, source: 'Game Film' },
      { id: 'gc-5', title: 'FMU vs Central Christian', subtitle: 'Sun Conference', thumbnailColor: '#2A3D1A', duration: '1:47:15', date: 'Jan 18', viewCount: 340, source: 'Game Film' },
    ],
  },

  // C) Player Hub
  {
    id: 'player_hub',
    title: 'Player Hub',
    rbacSection: 'explore_player_hub',
    items: [
      { id: 'ph-1', title: 'Jaylen Carter Highlights', subtitle: 'Season Compilation', thumbnailColor: '#2D1B69', duration: '6:18', badge: 'UPDATED', date: 'Feb 14', viewCount: 1200, source: 'Player Channel' },
      { id: 'ph-2', title: 'Marcus Thompson: 3PT Reel', subtitle: '42% from deep', thumbnailColor: '#1E3A5F', duration: '3:45', date: 'Feb 10', viewCount: 780, source: 'Player Channel' },
      { id: 'ph-3', title: 'Devon Williams: Defense Showcase', subtitle: 'On-Ball + Help Side', thumbnailColor: '#3D1A1A', duration: '5:22', date: 'Feb 7', viewCount: 560, source: 'Player Channel' },
      { id: 'ph-4', title: 'Chris Anderson: Playmaking', subtitle: 'Assists + Court Vision', thumbnailColor: '#1A3D2A', duration: '4:55', date: 'Feb 5', viewCount: 430, source: 'Player Channel' },
      { id: 'ph-5', title: 'Team Transition Package', subtitle: 'Fast Break Highlights', thumbnailColor: '#3D2A1A', duration: '7:10', date: 'Feb 3', viewCount: 920, source: 'Coaching Staff' },
      { id: 'ph-6', title: 'Isaiah Brooks: Post Moves', subtitle: 'Low Post Repertoire', thumbnailColor: '#1A1A3D', duration: '4:12', date: 'Jan 30', viewCount: 340, source: 'Player Channel' },
    ],
  },

  // D) Practice + Install
  {
    id: 'practice_install',
    title: 'Practice + Install',
    rbacSection: 'explore_practice_install',
    items: [
      { id: 'pi-1', title: 'Practice: Feb 13 — Transition D', subtitle: 'Full session, 5-on-5 segment', thumbnailColor: '#1A3D1A', duration: '45:20', badge: 'TODAY', date: 'Feb 13', viewCount: 12, source: 'Practice Film' },
      { id: 'pi-2', title: 'Install: Motion Offense v2', subtitle: 'Horns Entry + Flex Action', thumbnailColor: '#2D1B69', duration: '22:15', date: 'Feb 11', viewCount: 18, source: 'Install Clips' },
      { id: 'pi-3', title: 'Install: Press Break vs 2-2-1', subtitle: 'Primary + Secondary Options', thumbnailColor: '#3D1A1A', duration: '15:42', date: 'Feb 9', viewCount: 15, source: 'Install Clips' },
      { id: 'pi-4', title: 'Practice: Feb 6 — Shooting Drills', subtitle: 'Spot-up + Movement Shooting', thumbnailColor: '#1E3A5F', duration: '38:10', date: 'Feb 6', viewCount: 9, source: 'Practice Film' },
      { id: 'pi-5', title: 'Install: BLOB Package', subtitle: '4 Sets — Stagger, Rip, Lob, Flat', thumbnailColor: '#2A3D1A', duration: '18:30', date: 'Feb 4', viewCount: 14, source: 'Install Clips' },
    ],
  },

  // E) Scouting / Opponent
  {
    id: 'scouting_opponent',
    title: 'Scouting / Opponent',
    rbacSection: 'explore_scouting_opponent',
    items: [
      { id: 'so-1', title: 'Lincoln Christian Scout Report', subtitle: 'Next Opponent — Feb 21', thumbnailColor: '#3D2A1A', duration: '28:15', badge: 'PRIORITY', date: 'Feb 13', viewCount: 8, source: 'Scout Team' },
      { id: 'so-2', title: 'LC Tendencies: Half-Court O', subtitle: 'Top 5 Sets + Triggers', thumbnailColor: '#1A3D1A', duration: '14:30', date: 'Feb 12', viewCount: 6, source: 'Scout Team' },
      { id: 'so-3', title: 'LC Key Players: #3 Davis, #11 Hill', subtitle: 'Usage + Shooting Zones', thumbnailColor: '#1E3A5F', duration: '12:18', date: 'Feb 11', viewCount: 5, source: 'Scout Team' },
      { id: 'so-4', title: 'SW Assemblies Post-Mortem', subtitle: 'What Worked + Adjustments', thumbnailColor: '#2D1B69', duration: '20:45', date: 'Feb 9', viewCount: 11, source: 'Coaching Staff' },
      { id: 'so-5', title: 'Conference Opponent Overview', subtitle: 'Sun Conference Top 5 Teams', thumbnailColor: '#3D1A3D', duration: '35:20', date: 'Feb 1', viewCount: 22, source: 'Scout Team' },
    ],
  },

  // F) Recruiting Targets
  {
    id: 'recruiting_targets',
    title: 'Recruiting Targets',
    rbacSection: 'explore_recruiting_targets',
    items: [
      { id: 'rt-1', title: 'Elijah Moore — PG Prospect', subtitle: 'AAU Summer Tape', thumbnailColor: '#2D1B69', duration: '8:42', badge: 'S1', date: 'Feb 10', viewCount: 4, source: 'Recruiting' },
      { id: 'rt-2', title: 'Jordan Hayes — Wing', subtitle: 'HS Junior Season Highlights', thumbnailColor: '#1E3A5F', duration: '6:15', badge: 'S2', date: 'Feb 8', viewCount: 3, source: 'Recruiting' },
      { id: 'rt-3', title: 'Marcus Bell — Big Man', subtitle: 'Post + Face-Up Game', thumbnailColor: '#3D1A1A', duration: '7:30', date: 'Feb 5', viewCount: 5, source: 'Recruiting' },
      { id: 'rt-4', title: 'Transfer Portal: K. Williams', subtitle: 'D2 Guard — 18.3 PPG', thumbnailColor: '#1A3D2A', duration: '5:55', badge: 'PORTAL', date: 'Feb 3', viewCount: 7, source: 'Recruiting' },
      { id: 'rt-5', title: 'Showcase: OKC Exposure Camp', subtitle: 'Top 10 Performers', thumbnailColor: '#3D2A1A', duration: '15:20', date: 'Jan 28', viewCount: 12, source: 'Recruiting' },
    ],
  },

  // G) Development Clips
  {
    id: 'development_clips',
    title: 'Development Clips',
    rbacSection: 'explore_development_clips',
    items: [
      { id: 'dc-1', title: 'Carter: Finishing Through Contact', subtitle: 'Pre/Post Comparison', thumbnailColor: '#1A3D1A', duration: '4:18', badge: 'GROWTH', date: 'Feb 12', viewCount: 6, source: 'Player Dev' },
      { id: 'dc-2', title: 'Thompson: Catch-and-Shoot Mechanics', subtitle: 'Footwork Adjustment', thumbnailColor: '#1E3A5F', duration: '3:45', date: 'Feb 9', viewCount: 4, source: 'Player Dev' },
      { id: 'dc-3', title: 'Williams: Closeout Technique', subtitle: 'Short Closeout vs Long', thumbnailColor: '#2D1B69', duration: '5:10', date: 'Feb 6', viewCount: 5, source: 'Player Dev' },
      { id: 'dc-4', title: 'Anderson: Ball Screen Reads', subtitle: 'Reject vs Snake vs Split', thumbnailColor: '#3D1A1A', duration: '6:22', date: 'Feb 3', viewCount: 3, source: 'Player Dev' },
      { id: 'dc-5', title: 'Brooks: Rim Protection Timing', subtitle: 'Help Side Rotations', thumbnailColor: '#3D2A1A', duration: '4:55', date: 'Jan 30', viewCount: 4, source: 'Player Dev' },
    ],
  },

  // H) Conference / League
  {
    id: 'conference_league',
    title: 'Conference / League',
    rbacSection: 'explore_conference_league',
    items: [
      { id: 'cl-1', title: 'Sun Conference Week 14 Recap', subtitle: 'Standings + Top Plays', thumbnailColor: '#2A3D1A', duration: '8:30', badge: 'NEW', date: 'Feb 14', viewCount: 1800, source: 'Sun Conference' },
      { id: 'cl-2', title: 'NAIA Top 25 Poll Update', subtitle: 'FMU Moves to #8', thumbnailColor: '#1E3A5F', duration: '5:15', date: 'Feb 12', viewCount: 2400, source: 'NAIA' },
      { id: 'cl-3', title: 'Player of the Week: J. Carter', subtitle: 'Sun Conference Honors', thumbnailColor: '#2D1B69', duration: '2:45', date: 'Feb 10', viewCount: 3100, source: 'Sun Conference' },
      { id: 'cl-4', title: 'Conference Tournament Preview', subtitle: 'Bracket Projections', thumbnailColor: '#3D1A3D', duration: '12:20', date: 'Feb 8', viewCount: 1500, source: 'Sun Conference' },
      { id: 'cl-5', title: 'NAIA National Tournament Info', subtitle: 'Qualifying + Format', thumbnailColor: '#1A3D2A', duration: '6:45', date: 'Feb 1', viewCount: 4200, source: 'NAIA' },
      { id: 'cl-6', title: 'Sun Conference All-Star Selections', subtitle: 'Mid-Season Honors', thumbnailColor: '#3D2A1A', duration: '3:10', date: 'Jan 25', viewCount: 2800, source: 'Sun Conference' },
    ],
  },
];
