/**
 * Mock Rooms Data — Sports Film Rooms
 * 5 rooms with feed items, RBAC visibility, and filter helpers.
 */

// =============================================================================
// TYPES
// =============================================================================

export type RoomId = 'game' | 'scout' | 'practice' | 'player_dev' | 'recruit';

export interface Room {
  id: RoomId;
  name: string;
  description: string;
  icon: string;
  colorStrip: string;
  lastUpdated: string;
  itemCount: number;
  minAuthority: number;   // 0 = all staff, 2 = A2+
  visibilityClass: 0 | 3;
}

export interface RoomFeedItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'game' | 'clip' | 'practice' | 'recruit_clip';
  date: Date;
  duration: string;
  thumbnailColor: string;
  tags: string[];
  visibilityClass: 0 | 3;
  result?: 'W' | 'L';
  score?: string;
}

// =============================================================================
// ROOMS
// =============================================================================

export const SPORTS_ROOMS: Room[] = [
  {
    id: 'game',
    name: 'Game Room',
    description: 'Full game film, recaps, and opponent breakdowns',
    icon: 'sportscourt.fill',
    colorStrip: '#5A8A6E',
    lastUpdated: '2 hours ago',
    itemCount: 12,
    minAuthority: 0,
    visibilityClass: 0,
  },
  {
    id: 'scout',
    name: 'Scout Room',
    description: 'Opponent scouting reports and tendencies',
    icon: 'binoculars.fill',
    colorStrip: '#B8943E',
    lastUpdated: '1 day ago',
    itemCount: 9,
    minAuthority: 0,
    visibilityClass: 0,
  },
  {
    id: 'practice',
    name: 'Practice Room',
    description: 'Practice sessions, walkthroughs, and drills',
    icon: 'figure.run',
    colorStrip: '#1A1714',
    lastUpdated: '5 hours ago',
    itemCount: 10,
    minAuthority: 0,
    visibilityClass: 3,
  },
  {
    id: 'player_dev',
    name: 'Player Dev Room',
    description: 'Individual workouts, skill sessions, and progress',
    icon: 'person.crop.rectangle.stack',
    colorStrip: '#A855F7',
    lastUpdated: '3 days ago',
    itemCount: 8,
    minAuthority: 0,
    visibilityClass: 3,
  },
  {
    id: 'recruit',
    name: 'Recruit Room',
    description: 'Recruiting film, prospect highlights, and evaluations',
    icon: 'star.circle.fill',
    colorStrip: '#B85C5C',
    lastUpdated: '6 hours ago',
    itemCount: 11,
    minAuthority: 2,
    visibilityClass: 3,
  },
];

// =============================================================================
// FEED ITEMS
// =============================================================================

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);

const GAME_FEED: RoomFeedItem[] = [
  { id: 'gf-1', title: 'vs Lincoln Memorial', subtitle: 'Conference Game', type: 'game', date: daysAgo(1), duration: '1:42:10', thumbnailColor: '#1A2E1A', tags: ['Conference', 'Home'], visibilityClass: 3, result: 'W', score: '78-65' },
  { id: 'gf-2', title: 'Game Recap: Lincoln Memorial', subtitle: 'Coach Miller Breakdown', type: 'clip', date: daysAgo(1), duration: '8:45', thumbnailColor: '#0B1A2E', tags: ['Recap', 'Offense'], visibilityClass: 3 },
  { id: 'gf-3', title: 'vs Kentucky State', subtitle: 'Non-Conference', type: 'game', date: daysAgo(4), duration: '1:38:22', thumbnailColor: '#2E1A1A', tags: ['Non-Conf', 'Away'], visibilityClass: 3, result: 'L', score: '68-71' },
  { id: 'gf-4', title: 'Transition Offense Clips', subtitle: 'vs Kentucky State', type: 'clip', date: daysAgo(4), duration: '4:12', thumbnailColor: '#1A1A2E', tags: ['Transition', 'Offense'], visibilityClass: 3 },
  { id: 'gf-5', title: 'vs Central State', subtitle: 'Conference Game', type: 'game', date: daysAgo(8), duration: '1:45:00', thumbnailColor: '#1A2E2E', tags: ['Conference', 'Home'], visibilityClass: 3, result: 'W', score: '82-70' },
  { id: 'gf-6', title: 'Half-Court Sets Breakdown', subtitle: 'vs Central State', type: 'clip', date: daysAgo(8), duration: '6:30', thumbnailColor: '#2E2E1A', tags: ['Half-Court', 'Sets'], visibilityClass: 3 },
  { id: 'gf-7', title: 'Tuskegee Film Exchange', subtitle: 'Opponent Film', type: 'game', date: daysAgo(12), duration: '1:40:15', thumbnailColor: '#2E1A2E', tags: ['Opponent', 'Exchange'], visibilityClass: 0 },
  { id: 'gf-8', title: 'vs Miles College', subtitle: 'Conference Game', type: 'game', date: daysAgo(15), duration: '1:36:50', thumbnailColor: '#1A2E1A', tags: ['Conference', 'Away'], visibilityClass: 3, result: 'W', score: '75-62' },
  { id: 'gf-9', title: 'Defensive Stops Reel', subtitle: 'Season Highlights', type: 'clip', date: daysAgo(18), duration: '3:20', thumbnailColor: '#0B0F1A', tags: ['Defense', 'Highlights'], visibilityClass: 3 },
  { id: 'gf-10', title: 'vs Stillman College', subtitle: 'Conference Game', type: 'game', date: daysAgo(22), duration: '1:41:30', thumbnailColor: '#1A1A1A', tags: ['Conference', 'Home'], visibilityClass: 3, result: 'W', score: '88-74' },
  { id: 'gf-11', title: 'Alabama A&M Film Exchange', subtitle: 'Opponent Film', type: 'game', date: daysAgo(25), duration: '1:39:45', thumbnailColor: '#2E2E2E', tags: ['Opponent', 'Exchange'], visibilityClass: 0 },
  { id: 'gf-12', title: 'Press Break Clips', subtitle: 'Multiple Games', type: 'clip', date: daysAgo(28), duration: '5:15', thumbnailColor: '#1A0B1A', tags: ['Press Break', 'Offense'], visibilityClass: 3 },
];

const SCOUT_FEED: RoomFeedItem[] = [
  { id: 'sf-1', title: 'Tuskegee Golden Tigers', subtitle: 'Next Opponent — Feb 28', type: 'game', date: daysAgo(1), duration: '1:38:00', thumbnailColor: '#2E1A0B', tags: ['Next Game', 'Scouting'], visibilityClass: 0 },
  { id: 'sf-2', title: 'Tuskegee Tendencies', subtitle: 'Coach Turner Analysis', type: 'clip', date: daysAgo(1), duration: '12:30', thumbnailColor: '#1A2E0B', tags: ['Tendencies', 'Offense'], visibilityClass: 0 },
  { id: 'sf-3', title: 'Alabama A&M Bulldogs', subtitle: 'Conference Opponent', type: 'game', date: daysAgo(5), duration: '1:42:15', thumbnailColor: '#0B1A2E', tags: ['Conference', 'Scouting'], visibilityClass: 0 },
  { id: 'sf-4', title: 'Alabama A&M Zone Defense', subtitle: 'Breakdown Clips', type: 'clip', date: daysAgo(5), duration: '7:45', thumbnailColor: '#1A0B2E', tags: ['Zone', 'Defense'], visibilityClass: 0 },
  { id: 'sf-5', title: 'Fort Valley State Wildcats', subtitle: 'Conference Opponent', type: 'game', date: daysAgo(10), duration: '1:35:50', thumbnailColor: '#2E0B1A', tags: ['Conference', 'Scouting'], visibilityClass: 0 },
  { id: 'sf-6', title: 'SIAC Tournament Preview', subtitle: 'Top 4 Teams Film', type: 'clip', date: daysAgo(12), duration: '18:20', thumbnailColor: '#0B2E1A', tags: ['Tournament', 'Preview'], visibilityClass: 0 },
  { id: 'sf-7', title: 'Morehouse Maroon Tigers', subtitle: 'Non-Conference', type: 'game', date: daysAgo(16), duration: '1:40:00', thumbnailColor: '#2E2E0B', tags: ['Non-Conf', 'Scouting'], visibilityClass: 0 },
  { id: 'sf-8', title: 'Clark Atlanta Panthers', subtitle: 'Conference Opponent', type: 'game', date: daysAgo(20), duration: '1:37:30', thumbnailColor: '#0B0B2E', tags: ['Conference', 'Scouting'], visibilityClass: 0 },
  { id: 'sf-9', title: 'Transition Attack Patterns', subtitle: 'SIAC Top Teams', type: 'clip', date: daysAgo(24), duration: '9:10', thumbnailColor: '#1A1A0B', tags: ['Transition', 'Patterns'], visibilityClass: 0 },
];

const PRACTICE_FEED: RoomFeedItem[] = [
  { id: 'pf-1', title: 'Full Practice — Feb 24', subtitle: 'Pre-game Prep', type: 'practice', date: daysAgo(1), duration: '1:55:00', thumbnailColor: '#0B1A2E', tags: ['Full Practice', 'Pre-game'], visibilityClass: 3 },
  { id: 'pf-2', title: 'Walkthrough — Feb 23', subtitle: 'Offensive Sets Review', type: 'practice', date: daysAgo(2), duration: '45:00', thumbnailColor: '#1A2E2E', tags: ['Walkthrough', 'Offense'], visibilityClass: 3 },
  { id: 'pf-3', title: 'Shootaround — Feb 22', subtitle: 'Morning Shootaround', type: 'practice', date: daysAgo(3), duration: '35:00', thumbnailColor: '#2E1A0B', tags: ['Shootaround'], visibilityClass: 3 },
  { id: 'pf-4', title: 'Full Practice — Feb 21', subtitle: 'Defensive Drills', type: 'practice', date: daysAgo(4), duration: '2:05:00', thumbnailColor: '#0B2E1A', tags: ['Full Practice', 'Defense'], visibilityClass: 3 },
  { id: 'pf-5', title: 'Inbounds Drill Clips', subtitle: 'BLOB + SLOB Sets', type: 'clip', date: daysAgo(5), duration: '8:30', thumbnailColor: '#1A0B2E', tags: ['Inbounds', 'Sets'], visibilityClass: 3 },
  { id: 'pf-6', title: 'Full Practice — Feb 18', subtitle: 'Game Prep', type: 'practice', date: daysAgo(7), duration: '1:50:00', thumbnailColor: '#2E2E1A', tags: ['Full Practice', 'Game Prep'], visibilityClass: 3 },
  { id: 'pf-7', title: 'Conditioning Session', subtitle: 'End of Practice Conditioning', type: 'practice', date: daysAgo(10), duration: '25:00', thumbnailColor: '#0B1A1A', tags: ['Conditioning'], visibilityClass: 3 },
  { id: 'pf-8', title: 'Transition Drill Clips', subtitle: '5-on-5 Fast Break', type: 'clip', date: daysAgo(12), duration: '6:15', thumbnailColor: '#1A1A2E', tags: ['Transition', 'Drill'], visibilityClass: 3 },
  { id: 'pf-9', title: 'Film Session — Feb 12', subtitle: 'Post-Game Review', type: 'practice', date: daysAgo(13), duration: '40:00', thumbnailColor: '#2E0B2E', tags: ['Film Session', 'Review'], visibilityClass: 3 },
  { id: 'pf-10', title: 'Full Practice — Feb 10', subtitle: 'Offensive Install', type: 'practice', date: daysAgo(15), duration: '1:58:00', thumbnailColor: '#0B2E2E', tags: ['Full Practice', 'Offense'], visibilityClass: 3 },
];

const PLAYER_DEV_FEED: RoomFeedItem[] = [
  { id: 'pd-1', title: 'E. Carter — Shooting Workout', subtitle: 'E. Carter', type: 'clip', date: daysAgo(1), duration: '22:00', thumbnailColor: '#1A0B1A', tags: ['Shooting', 'Individual'], visibilityClass: 3 },
  { id: 'pd-2', title: 'K. Mentor — Ball Handling', subtitle: 'K. Mentor', type: 'clip', date: daysAgo(2), duration: '18:30', thumbnailColor: '#0B1A0B', tags: ['Ball Handling', 'Individual'], visibilityClass: 3 },
  { id: 'pd-3', title: 'Post Moves Session', subtitle: 'J. Williams & D. Brown', type: 'clip', date: daysAgo(3), duration: '30:00', thumbnailColor: '#2E0B0B', tags: ['Post Moves', 'Bigs'], visibilityClass: 3 },
  { id: 'pd-4', title: 'A. Noel — Defensive Footwork', subtitle: 'A. Noel', type: 'clip', date: daysAgo(5), duration: '15:45', thumbnailColor: '#0B0B1A', tags: ['Defense', 'Footwork'], visibilityClass: 3 },
  { id: 'pd-5', title: 'Guard Skills Session', subtitle: 'Guards Group', type: 'clip', date: daysAgo(8), duration: '35:00', thumbnailColor: '#1A2E0B', tags: ['Guards', 'Skills'], visibilityClass: 3 },
  { id: 'pd-6', title: 'Free Throw Form Work', subtitle: 'Team-wide', type: 'clip', date: daysAgo(12), duration: '12:00', thumbnailColor: '#2E1A2E', tags: ['Free Throws', 'Form'], visibilityClass: 3 },
  { id: 'pd-7', title: 'E. Carter — Mid-Range', subtitle: 'E. Carter', type: 'clip', date: daysAgo(18), duration: '20:00', thumbnailColor: '#0B2E0B', tags: ['Mid-Range', 'Shooting'], visibilityClass: 3 },
  { id: 'pd-8', title: 'Strength & Agility Clips', subtitle: 'Combine-style Testing', type: 'clip', date: daysAgo(22), duration: '16:30', thumbnailColor: '#1A1A0B', tags: ['Strength', 'Agility'], visibilityClass: 3 },
];

const RECRUIT_FEED: RoomFeedItem[] = [
  { id: 'rf-1', title: 'Marcus Johnson — Highlights', subtitle: 'Marcus Johnson (2026 PG)', type: 'recruit_clip', date: daysAgo(1), duration: '4:30', thumbnailColor: '#2E0B1A', tags: ['PG', '2026', 'Top Target'], visibilityClass: 3 },
  { id: 'rf-2', title: 'Jaylen Brooks — Season Reel', subtitle: 'Jaylen Brooks (2026 SF)', type: 'recruit_clip', date: daysAgo(2), duration: '6:15', thumbnailColor: '#0B2E1A', tags: ['SF', '2026', 'Committed'], visibilityClass: 3 },
  { id: 'rf-3', title: 'Region 3 Showcase', subtitle: 'Showcase Event Film', type: 'game', date: daysAgo(3), duration: '2:10:00', thumbnailColor: '#1A0B2E', tags: ['Showcase', 'Region 3'], visibilityClass: 3 },
  { id: 'rf-4', title: 'David Martinez — Workout', subtitle: 'David Martinez (2026 SG)', type: 'recruit_clip', date: daysAgo(5), duration: '8:00', thumbnailColor: '#2E2E0B', tags: ['SG', '2026', 'Evaluating'], visibilityClass: 3 },
  { id: 'rf-5', title: 'Tyler Washington — Game Film', subtitle: 'Tyler Washington (2027 PF)', type: 'recruit_clip', date: daysAgo(7), duration: '5:45', thumbnailColor: '#0B1A1A', tags: ['PF', '2027', 'Watching'], visibilityClass: 3 },
  { id: 'rf-6', title: 'AAU Summer Circuit Clips', subtitle: 'Multiple Prospects', type: 'clip', date: daysAgo(10), duration: '14:20', thumbnailColor: '#1A2E2E', tags: ['AAU', 'Summer'], visibilityClass: 3 },
  { id: 'rf-7', title: 'Chris Adams — Highlights', subtitle: 'Chris Adams (2026 C)', type: 'recruit_clip', date: daysAgo(13), duration: '3:50', thumbnailColor: '#2E1A0B', tags: ['C', '2026', 'Offered'], visibilityClass: 3 },
  { id: 'rf-8', title: 'JUCO Showcase Film', subtitle: 'Western Region JUCO', type: 'game', date: daysAgo(16), duration: '1:48:00', thumbnailColor: '#0B0B2E', tags: ['JUCO', 'Showcase'], visibilityClass: 3 },
  { id: 'rf-9', title: 'Isaiah Thomas — Transfer Reel', subtitle: 'Isaiah Thomas (Transfer SG)', type: 'recruit_clip', date: daysAgo(19), duration: '5:10', thumbnailColor: '#1A0B0B', tags: ['SG', 'Transfer', 'Portal'], visibilityClass: 3 },
  { id: 'rf-10', title: 'Combine Measurements Tape', subtitle: 'February Combine', type: 'clip', date: daysAgo(22), duration: '10:00', thumbnailColor: '#2E0B2E', tags: ['Combine', 'Measurements'], visibilityClass: 3 },
  { id: 'rf-11', title: 'Local Showcase — Jan', subtitle: 'Local Prospects', type: 'game', date: daysAgo(30), duration: '1:52:00', thumbnailColor: '#0B2E2E', tags: ['Local', 'Showcase'], visibilityClass: 3 },
];

export const ROOM_FEED_ITEMS: Record<RoomId, RoomFeedItem[]> = {
  game: GAME_FEED,
  scout: SCOUT_FEED,
  practice: PRACTICE_FEED,
  player_dev: PLAYER_DEV_FEED,
  recruit: RECRUIT_FEED,
};

// =============================================================================
// RBAC HELPERS
// =============================================================================

export function getVisibleRooms(authority: number, visibility: number): Room[] {
  return SPORTS_ROOMS.filter(
    (r) => authority >= r.minAuthority && visibility >= r.visibilityClass,
  );
}

// =============================================================================
// FILTER DEFINITIONS
// =============================================================================

export type FeedTypeFilter = 'all' | 'games' | 'clips' | 'practice';
export type FeedDateFilter = 'all' | 'recent' | 'older';

export const ROOM_FEED_TYPE_FILTERS: { key: FeedTypeFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'games', label: 'Games' },
  { key: 'clips', label: 'Clips' },
  { key: 'practice', label: 'Practice' },
];

export const ROOM_FEED_DATE_FILTERS: { key: FeedDateFilter; label: string }[] = [
  { key: 'all', label: 'All Dates' },
  { key: 'recent', label: 'Recent' },
  { key: 'older', label: 'Older' },
];

const RECENT_CUTOFF_DAYS = 14;

export function filterFeedItems(
  items: RoomFeedItem[],
  userVisibility: number,
  typeFilter: FeedTypeFilter,
  dateFilter: FeedDateFilter,
  search: string,
): RoomFeedItem[] {
  const cutoff = new Date(now.getTime() - RECENT_CUTOFF_DAYS * 86400000);
  const q = search.toLowerCase().trim();

  return items.filter((item) => {
    if (item.visibilityClass > userVisibility) return false;

    if (typeFilter === 'games' && item.type !== 'game') return false;
    if (typeFilter === 'clips' && item.type !== 'clip' && item.type !== 'recruit_clip') return false;
    if (typeFilter === 'practice' && item.type !== 'practice') return false;

    if (dateFilter === 'recent' && item.date < cutoff) return false;
    if (dateFilter === 'older' && item.date >= cutoff) return false;

    if (q) {
      const haystack = `${item.title} ${item.subtitle} ${item.tags.join(' ')}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}
