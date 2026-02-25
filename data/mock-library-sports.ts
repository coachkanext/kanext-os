/**
 * Sports Library — Structured Archive
 * 5 folders: Games, Practice, Clips, Playlists, Saved
 * Rendering context: Assistant Coach / Recruiting Coordinator (A2, V3)
 */

// =============================================================================
// TYPES
// =============================================================================

export type LibraryFolderId = 'games' | 'practice' | 'clips' | 'playlists' | 'saved';

export interface LibraryFolder {
  id: LibraryFolderId;
  name: string;
  description: string;
  icon: string;
  colorStrip: string;
  itemCount: number;
}

export interface GameEntry {
  id: string;
  opponent: string;
  date: string;
  result?: 'W' | 'L';
  score?: string;
  duration: string;
  season: string;
  visibilityClass: 0 | 3;
  thumbnailColor: string;
}

export interface PracticeEntry {
  id: string;
  title: string;
  date: string;
  duration: string;
  tag?: string;
  visibilityClass: 0 | 3;
  thumbnailColor: string;
}

export interface ClipEntry {
  id: string;
  title: string;
  date: string;
  duration: string;
  tagGroup: string;
  visibilityClass: 0 | 3;
  thumbnailColor: string;
}

export interface PlaylistEntry {
  id: string;
  name: string;
  clipCount: number;
  lastUpdated: string;
  thumbnailColor: string;
}

export interface SavedEntry {
  id: string;
  title: string;
  source: string;
  date: string;
  duration: string;
  type: 'game' | 'clip' | 'practice' | 'reel';
  visibilityClass: 0 | 3;
  thumbnailColor: string;
}

// =============================================================================
// FOLDERS
// =============================================================================

export const LIBRARY_FOLDERS: LibraryFolder[] = [
  {
    id: 'games',
    name: 'Games',
    description: 'Full game film grouped by season',
    icon: 'sportscourt.fill',
    colorStrip: '#22C55E',
    itemCount: 14,
  },
  {
    id: 'practice',
    name: 'Practice',
    description: 'Practice sessions grouped by date',
    icon: 'figure.run',
    colorStrip: '#1D9BF0',
    itemCount: 10,
  },
  {
    id: 'clips',
    name: 'Clips',
    description: 'Tagged clips organized by category',
    icon: 'scissors',
    colorStrip: '#F59E0B',
    itemCount: 18,
  },
  {
    id: 'playlists',
    name: 'Playlists',
    description: 'Coach-created structured playlists',
    icon: 'list.bullet.rectangle.portrait',
    colorStrip: '#A855F7',
    itemCount: 5,
  },
  {
    id: 'saved',
    name: 'Saved',
    description: 'Videos saved from Feed, Explore, and Rooms',
    icon: 'bookmark.fill',
    colorStrip: '#EF4444',
    itemCount: 8,
  },
];

// =============================================================================
// GAMES — grouped by season
// =============================================================================

export const GAME_ENTRIES: GameEntry[] = [
  // 2024-25
  { id: 'ge-1', opponent: 'Lincoln Memorial', date: 'Feb 22, 2025', result: 'W', score: '78-65', duration: '1:42:10', season: '2024-25', visibilityClass: 3, thumbnailColor: '#1A2E1A' },
  { id: 'ge-2', opponent: 'Kentucky State', date: 'Feb 18, 2025', result: 'L', score: '68-71', duration: '1:38:22', season: '2024-25', visibilityClass: 3, thumbnailColor: '#2E1A1A' },
  { id: 'ge-3', opponent: 'Central State', date: 'Feb 14, 2025', result: 'W', score: '82-70', duration: '1:45:00', season: '2024-25', visibilityClass: 3, thumbnailColor: '#1A2E2E' },
  { id: 'ge-4', opponent: 'Miles College', date: 'Feb 8, 2025', result: 'W', score: '75-62', duration: '1:36:50', season: '2024-25', visibilityClass: 3, thumbnailColor: '#1A2E1A' },
  { id: 'ge-5', opponent: 'Stillman College', date: 'Jan 28, 2025', result: 'W', score: '88-74', duration: '1:41:30', season: '2024-25', visibilityClass: 3, thumbnailColor: '#1A1A1A' },
  { id: 'ge-6', opponent: 'Tuskegee (Opponent Film)', date: 'Jan 20, 2025', duration: '1:40:15', season: '2024-25', visibilityClass: 0, thumbnailColor: '#2E1A2E' },
  { id: 'ge-7', opponent: 'Alabama A&M (Opponent Film)', date: 'Jan 12, 2025', duration: '1:39:45', season: '2024-25', visibilityClass: 0, thumbnailColor: '#2E2E2E' },
  { id: 'ge-8', opponent: 'Clark Atlanta', date: 'Jan 4, 2025', result: 'W', score: '80-68', duration: '1:44:20', season: '2024-25', visibilityClass: 3, thumbnailColor: '#0B1A2E' },
  { id: 'ge-9', opponent: 'Fort Valley State', date: 'Dec 14, 2024', result: 'W', score: '72-65', duration: '1:38:10', season: '2024-25', visibilityClass: 3, thumbnailColor: '#1A0B2E' },
  // 2023-24
  { id: 'ge-10', opponent: 'Morehouse', date: 'Mar 2, 2024', result: 'L', score: '64-70', duration: '1:43:15', season: '2023-24', visibilityClass: 3, thumbnailColor: '#2E0B1A' },
  { id: 'ge-11', opponent: 'Tuskegee', date: 'Feb 24, 2024', result: 'W', score: '77-68', duration: '1:46:00', season: '2023-24', visibilityClass: 3, thumbnailColor: '#0B2E1A' },
  { id: 'ge-12', opponent: 'Kentucky State', date: 'Feb 10, 2024', result: 'W', score: '85-72', duration: '1:40:30', season: '2023-24', visibilityClass: 3, thumbnailColor: '#1A1A2E' },
  // 2022-23
  { id: 'ge-13', opponent: 'Miles College', date: 'Feb 18, 2023', result: 'W', score: '70-63', duration: '1:42:45', season: '2022-23', visibilityClass: 3, thumbnailColor: '#2E2E0B' },
  { id: 'ge-14', opponent: 'Albany State', date: 'Jan 21, 2023', result: 'L', score: '61-68', duration: '1:39:20', season: '2022-23', visibilityClass: 3, thumbnailColor: '#0B0B2E' },
];

export function getGameSeasons(): string[] {
  const seasons = [...new Set(GAME_ENTRIES.map((g) => g.season))];
  return seasons.sort().reverse();
}

export function getGamesBySeason(season: string, userVisibility: number): GameEntry[] {
  return GAME_ENTRIES.filter(
    (g) => g.season === season && g.visibilityClass <= userVisibility,
  );
}

// =============================================================================
// PRACTICE — grouped by date
// =============================================================================

export const PRACTICE_ENTRIES: PracticeEntry[] = [
  { id: 'pe-1', title: 'Full Practice — Feb 24', date: 'Feb 24', duration: '1:55:00', tag: 'Pre-game', visibilityClass: 3, thumbnailColor: '#0B1A2E' },
  { id: 'pe-2', title: 'Walkthrough — Feb 23', date: 'Feb 23', duration: '45:00', tag: 'Install', visibilityClass: 3, thumbnailColor: '#1A2E2E' },
  { id: 'pe-3', title: 'Shootaround — Feb 22', date: 'Feb 22', duration: '35:00', tag: 'Shooting', visibilityClass: 3, thumbnailColor: '#2E1A0B' },
  { id: 'pe-4', title: 'Full Practice — Feb 21', date: 'Feb 21', duration: '2:05:00', tag: 'Scrimmage', visibilityClass: 3, thumbnailColor: '#0B2E1A' },
  { id: 'pe-5', title: 'Full Practice — Feb 18', date: 'Feb 18', duration: '1:50:00', tag: 'Pre-game', visibilityClass: 3, thumbnailColor: '#2E2E1A' },
  { id: 'pe-6', title: 'Film Session — Feb 17', date: 'Feb 17', duration: '40:00', visibilityClass: 3, thumbnailColor: '#1A0B2E' },
  { id: 'pe-7', title: 'Full Practice — Feb 14', date: 'Feb 14', duration: '1:48:00', tag: 'Install', visibilityClass: 3, thumbnailColor: '#0B1A1A' },
  { id: 'pe-8', title: 'Shootaround — Feb 13', date: 'Feb 13', duration: '30:00', tag: 'Shooting', visibilityClass: 3, thumbnailColor: '#1A1A2E' },
  { id: 'pe-9', title: 'Full Practice — Feb 10', date: 'Feb 10', duration: '1:58:00', tag: 'Scrimmage', visibilityClass: 3, thumbnailColor: '#2E0B2E' },
  { id: 'pe-10', title: 'Conditioning — Feb 8', date: 'Feb 8', duration: '25:00', visibilityClass: 3, thumbnailColor: '#0B2E2E' },
];

export function getFilteredPractice(userVisibility: number): PracticeEntry[] {
  return PRACTICE_ENTRIES.filter((p) => p.visibilityClass <= userVisibility);
}

// =============================================================================
// CLIPS — grouped by tag
// =============================================================================

export const CLIP_TAG_GROUPS = [
  'Shooting',
  'Defense',
  'Transition',
  'ATO',
  'Ball Screen',
  'Zone',
  'Press',
] as const;

export const CLIP_ENTRIES: ClipEntry[] = [
  // Shooting
  { id: 'ce-1', title: 'Catch & Shoot — Carter', date: 'Feb 22', duration: '2:15', tagGroup: 'Shooting', visibilityClass: 3, thumbnailColor: '#1A2E0B' },
  { id: 'ce-2', title: 'Off-Screen 3s — Thompson', date: 'Feb 18', duration: '1:45', tagGroup: 'Shooting', visibilityClass: 3, thumbnailColor: '#0B1A2E' },
  { id: 'ce-3', title: 'Pull-Up Jumpers Reel', date: 'Feb 10', duration: '3:20', tagGroup: 'Shooting', visibilityClass: 3, thumbnailColor: '#2E1A0B' },
  // Defense
  { id: 'ce-4', title: 'Closeout Technique Reel', date: 'Feb 21', duration: '4:10', tagGroup: 'Defense', visibilityClass: 3, thumbnailColor: '#0B2E1A' },
  { id: 'ce-5', title: 'Help-Side Rotations', date: 'Feb 14', duration: '3:30', tagGroup: 'Defense', visibilityClass: 3, thumbnailColor: '#1A0B2E' },
  { id: 'ce-6', title: 'Defensive Stops vs Lincoln Memorial', date: 'Feb 8', duration: '2:50', tagGroup: 'Defense', visibilityClass: 3, thumbnailColor: '#2E0B1A' },
  // Transition
  { id: 'ce-7', title: 'Fast Break Finishes', date: 'Feb 20', duration: '3:00', tagGroup: 'Transition', visibilityClass: 3, thumbnailColor: '#0B0B2E' },
  { id: 'ce-8', title: 'Transition D Recovery', date: 'Feb 12', duration: '2:40', tagGroup: 'Transition', visibilityClass: 3, thumbnailColor: '#2E2E0B' },
  // ATO
  { id: 'ce-9', title: 'ATO: Horns Flare', date: 'Feb 22', duration: '1:30', tagGroup: 'ATO', visibilityClass: 3, thumbnailColor: '#1A1A0B' },
  { id: 'ce-10', title: 'ATO: Side Lob', date: 'Feb 14', duration: '1:15', tagGroup: 'ATO', visibilityClass: 3, thumbnailColor: '#0B1A1A' },
  { id: 'ce-11', title: 'ATO: Stack Action', date: 'Feb 4', duration: '1:45', tagGroup: 'ATO', visibilityClass: 3, thumbnailColor: '#1A0B1A' },
  // Ball Screen
  { id: 'ce-12', title: 'PnR Reads — Mentor', date: 'Feb 19', duration: '4:00', tagGroup: 'Ball Screen', visibilityClass: 3, thumbnailColor: '#2E1A2E' },
  { id: 'ce-13', title: 'Drop Coverage Counters', date: 'Feb 11', duration: '2:20', tagGroup: 'Ball Screen', visibilityClass: 3, thumbnailColor: '#0B2E2E' },
  // Zone
  { id: 'ce-14', title: 'Zone Attack: 2-3 Overload', date: 'Feb 17', duration: '3:15', tagGroup: 'Zone', visibilityClass: 3, thumbnailColor: '#2E0B2E' },
  { id: 'ce-15', title: 'Zone Attack: 1-3-1 Gaps', date: 'Feb 6', duration: '2:50', tagGroup: 'Zone', visibilityClass: 3, thumbnailColor: '#1A2E1A' },
  // Press
  { id: 'ce-16', title: 'Press Break vs 2-2-1', date: 'Feb 20', duration: '2:30', tagGroup: 'Press', visibilityClass: 3, thumbnailColor: '#2E2E2E' },
  { id: 'ce-17', title: 'Press Break vs 1-2-1-1', date: 'Feb 13', duration: '2:10', tagGroup: 'Press', visibilityClass: 3, thumbnailColor: '#1A1A1A' },
  { id: 'ce-18', title: 'Full Court Press Clips', date: 'Jan 28', duration: '3:40', tagGroup: 'Press', visibilityClass: 3, thumbnailColor: '#0B0F1A' },
];

export function getClipTagGroups(): string[] {
  return [...new Set(CLIP_ENTRIES.map((c) => c.tagGroup))];
}

export function getClipsByTag(tag: string, userVisibility: number): ClipEntry[] {
  return CLIP_ENTRIES.filter(
    (c) => c.tagGroup === tag && c.visibilityClass <= userVisibility,
  );
}

export function getFilteredClips(userVisibility: number): ClipEntry[] {
  return CLIP_ENTRIES.filter((c) => c.visibilityClass <= userVisibility);
}

// =============================================================================
// PLAYLISTS
// =============================================================================

export const PLAYLIST_ENTRIES: PlaylistEntry[] = [
  { id: 'pl-1', name: 'Pregame Prep — Tuskegee', clipCount: 12, lastUpdated: '2 hours ago', thumbnailColor: '#2E1A0B' },
  { id: 'pl-2', name: 'Offensive Sets Install', clipCount: 8, lastUpdated: '1 day ago', thumbnailColor: '#0B2E1A' },
  { id: 'pl-3', name: 'Defensive Breakdowns', clipCount: 15, lastUpdated: '3 days ago', thumbnailColor: '#1A0B2E' },
  { id: 'pl-4', name: 'Player Dev: Carter', clipCount: 6, lastUpdated: '5 days ago', thumbnailColor: '#2E0B1A' },
  { id: 'pl-5', name: 'Recruiting Highlights', clipCount: 10, lastUpdated: '1 week ago', thumbnailColor: '#0B1A1A' },
];

// =============================================================================
// SAVED
// =============================================================================

export const SAVED_ENTRIES: SavedEntry[] = [
  { id: 'se-1', title: 'Zone Attack Breakdown', source: 'Feed — Coach Miller', date: 'Feb 24', duration: '8:45', type: 'clip', visibilityClass: 3, thumbnailColor: '#1A2E0B' },
  { id: 'se-2', title: 'SIAC Tournament Preview', source: 'Explore — Conference', date: 'Feb 22', duration: '18:20', type: 'clip', visibilityClass: 0, thumbnailColor: '#0B2E1A' },
  { id: 'se-3', title: 'Transition Offense Masterclass', source: 'Feed — System Post', date: 'Feb 20', duration: '12:30', type: 'reel', visibilityClass: 0, thumbnailColor: '#2E1A2E' },
  { id: 'se-4', title: 'vs Central State — Full Game', source: 'Rooms — Game Room', date: 'Feb 14', duration: '1:45:00', type: 'game', visibilityClass: 3, thumbnailColor: '#1A2E2E' },
  { id: 'se-5', title: 'Practice Inbounds Sets', source: 'Rooms — Practice Room', date: 'Feb 12', duration: '8:30', type: 'practice', visibilityClass: 3, thumbnailColor: '#0B1A2E' },
  { id: 'se-6', title: 'Pregame Hype Reel', source: 'Feed — Media Team', date: 'Feb 10', duration: '2:15', type: 'reel', visibilityClass: 0, thumbnailColor: '#2E0B1A' },
  { id: 'se-7', title: 'Alabama A&M Tendencies', source: 'Rooms — Scout Room', date: 'Feb 8', duration: '7:45', type: 'clip', visibilityClass: 0, thumbnailColor: '#1A0B1A' },
  { id: 'se-8', title: 'Defensive Stops Reel', source: 'Feed — Highlights', date: 'Feb 5', duration: '3:20', type: 'clip', visibilityClass: 3, thumbnailColor: '#0B0F1A' },
];

export function getFilteredSaved(userVisibility: number): SavedEntry[] {
  return SAVED_ENTRIES.filter((s) => s.visibilityClass <= userVisibility);
}
