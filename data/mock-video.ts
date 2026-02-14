/**
 * Mock Video Data
 * Types, mock data, and helpers for the Media/Video tab.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface VideoGame {
  id: string;
  opponent: string;
  date: string;
  result: 'W' | 'L';
  score: string;
  tags: string[];
  thumbnailColor: string;
  clipCount: number;
  duration: number; // seconds
}

export interface VideoClip {
  id: string;
  title: string;
  gameId?: string;
  type: 'highlight' | 'breakdown' | 'drill' | 'scout';
  duration: number; // seconds
  source: string;
  tags: string[];
  thumbnailColor: string;
}

export interface ScoutPack {
  id: string;
  opponent: string;
  date: string;
  clipCount: number;
  coverColor: string;
  tags: string[];
}

export interface PlayerChannel {
  id: string;
  name: string;
  number: string;
  position: string;
  clipCount: number;
  avatarInitials: string;
}

export type VideoFilter = 'all' | 'games' | 'practice' | 'highlights' | 'scout';

export interface Reel {
  id: string;
  title: string;
  caption: string;
  duration: number;
  thumbnailColor: string;
  playerTag?: { name: string; number: string };
  teamTag?: string;
  tags: string[];
  source: string;
  likes: number;
  saves: number;
  createdAt: string;
}

export interface WatchHistoryItem {
  id: string;
  contentId: string;
  contentType: 'game' | 'clip' | 'reel';
  title: string;
  thumbnailColor: string;
  duration: number;
  watchedAt: string;
  progress: number; // 0–100
}

export interface RecruitClip extends VideoClip {
  recruitId: string;
  recruitName: string;
  school: string;
  position: string;
  classYear: string;
  krOverall?: number;
}

export type ShareVisibility = 'public' | 'org' | 'team' | 'staff' | 'assigned';

// =============================================================================
// HELPERS
// =============================================================================

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function getResultColor(result: 'W' | 'L'): string {
  return result === 'W' ? '#4CAF50' : '#EF4444';
}

export const VIDEO_FILTERS: { key: VideoFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'games', label: 'Games' },
  { key: 'practice', label: 'Practice' },
  { key: 'highlights', label: 'Reels' },
  { key: 'scout', label: 'Scout' },
];

// =============================================================================
// MOCK VIDEO GAMES
// =============================================================================

export const MOCK_VIDEO_GAMES: VideoGame[] = [
  {
    id: 'vg-1',
    opponent: 'Coastal Carolina',
    date: 'Feb 12, 2026',
    result: 'W',
    score: '81-74',
    tags: ['Conference', 'Home'],
    thumbnailColor: '#1a472a',
    clipCount: 24,
    duration: 7200,
  },
  {
    id: 'vg-2',
    opponent: 'UNC Asheville',
    date: 'Feb 8, 2026',
    result: 'L',
    score: '69-72',
    tags: ['Conference', 'Away'],
    thumbnailColor: '#1e3a5f',
    clipCount: 18,
    duration: 6840,
  },
  {
    id: 'vg-3',
    opponent: 'Radford',
    date: 'Feb 5, 2026',
    result: 'W',
    score: '77-65',
    tags: ['Conference', 'Home'],
    thumbnailColor: '#8b0000',
    clipCount: 21,
    duration: 6600,
  },
  {
    id: 'vg-4',
    opponent: 'Winthrop',
    date: 'Feb 1, 2026',
    result: 'W',
    score: '85-78',
    tags: ['Conference', 'Away'],
    thumbnailColor: '#4a0e4e',
    clipCount: 19,
    duration: 7020,
  },
  {
    id: 'vg-5',
    opponent: 'Charleston Southern',
    date: 'Jan 28, 2026',
    result: 'W',
    score: '72-61',
    tags: ['Conference', 'Home'],
    thumbnailColor: '#003366',
    clipCount: 16,
    duration: 6420,
  },
  {
    id: 'vg-6',
    opponent: 'USC Upstate',
    date: 'Jan 25, 2026',
    result: 'L',
    score: '64-70',
    tags: ['Conference', 'Away'],
    thumbnailColor: '#006400',
    clipCount: 20,
    duration: 6780,
  },
  {
    id: 'vg-7',
    opponent: 'Gardner-Webb',
    date: 'Jan 21, 2026',
    result: 'W',
    score: '88-75',
    tags: ['Conference', 'Home'],
    thumbnailColor: '#8b4513',
    clipCount: 22,
    duration: 6960,
  },
  {
    id: 'vg-8',
    opponent: 'Presbyterian',
    date: 'Jan 18, 2026',
    result: 'W',
    score: '91-68',
    tags: ['Conference', 'Home'],
    thumbnailColor: '#191970',
    clipCount: 15,
    duration: 6300,
  },
  {
    id: 'vg-9',
    opponent: 'Longwood',
    date: 'Jan 14, 2026',
    result: 'W',
    score: '79-73',
    tags: ['Conference', 'Away'],
    thumbnailColor: '#0047ab',
    clipCount: 17,
    duration: 6660,
  },
  {
    id: 'vg-10',
    opponent: 'Campbell',
    date: 'Jan 11, 2026',
    result: 'W',
    score: '76-71',
    tags: ['Conference', 'Home'],
    thumbnailColor: '#ff6600',
    clipCount: 23,
    duration: 7140,
  },
];

// =============================================================================
// MOCK VIDEO CLIPS
// =============================================================================

export const MOCK_VIDEO_CLIPS: VideoClip[] = [
  {
    id: 'vc-1',
    title: 'Marcus Johnson 22-pt Performance',
    gameId: 'vg-1',
    type: 'highlight',
    duration: 194,
    source: 'Hudl',
    tags: ['Offense', 'Player Highlight'],
    thumbnailColor: '#1a472a',
  },
  {
    id: 'vc-2',
    title: 'Transition Defense Breakdown',
    gameId: 'vg-1',
    type: 'breakdown',
    duration: 312,
    source: 'Hudl',
    tags: ['Defense', 'Coaching'],
    thumbnailColor: '#2d2d2d',
  },
  {
    id: 'vc-3',
    title: 'Ball Screen Coverage Drill',
    type: 'drill',
    duration: 245,
    source: 'Practice',
    tags: ['Defense', 'Drill'],
    thumbnailColor: '#333333',
  },
  {
    id: 'vc-4',
    title: 'Campbell Zone Press — Last 3 Games',
    type: 'scout',
    duration: 480,
    source: 'Synergy',
    tags: ['Scout', 'Opponent'],
    thumbnailColor: '#ff6600',
  },
  {
    id: 'vc-5',
    title: 'Deon Williams Block Party',
    gameId: 'vg-3',
    type: 'highlight',
    duration: 87,
    source: 'Hudl',
    tags: ['Defense', 'Player Highlight'],
    thumbnailColor: '#8b0000',
  },
  {
    id: 'vc-6',
    title: '3-Point Shooting Reps — Feb 13',
    type: 'drill',
    duration: 360,
    source: 'Practice',
    tags: ['Offense', 'Drill'],
    thumbnailColor: '#2a2a2a',
  },
  {
    id: 'vc-7',
    title: 'Pick & Roll Execution vs Winthrop',
    gameId: 'vg-4',
    type: 'breakdown',
    duration: 268,
    source: 'Hudl',
    tags: ['Offense', 'Coaching'],
    thumbnailColor: '#4a0e4e',
  },
  {
    id: 'vc-8',
    title: 'Tyler Roberts — Playmaking Cuts',
    gameId: 'vg-4',
    type: 'highlight',
    duration: 154,
    source: 'Hudl',
    tags: ['Offense', 'Player Highlight'],
    thumbnailColor: '#4a0e4e',
  },
  {
    id: 'vc-9',
    title: 'Winthrop Transition Offense Study',
    type: 'scout',
    duration: 520,
    source: 'Synergy',
    tags: ['Scout', 'Opponent'],
    thumbnailColor: '#4a0e4e',
  },
  {
    id: 'vc-10',
    title: 'End-of-Game Situations — Shell Work',
    type: 'drill',
    duration: 420,
    source: 'Practice',
    tags: ['Offense', 'Defense', 'Drill'],
    thumbnailColor: '#1c1c1c',
  },
  {
    id: 'vc-11',
    title: 'Andre Harris Defensive Rotations',
    gameId: 'vg-1',
    type: 'breakdown',
    duration: 205,
    source: 'Hudl',
    tags: ['Defense', 'Coaching'],
    thumbnailColor: '#1a472a',
  },
  {
    id: 'vc-12',
    title: 'Full Court Press Break Sets',
    type: 'drill',
    duration: 300,
    source: 'Practice',
    tags: ['Offense', 'Drill'],
    thumbnailColor: '#252525',
  },
  {
    id: 'vc-13',
    title: 'UNC Asheville — Loss Review',
    gameId: 'vg-2',
    type: 'breakdown',
    duration: 445,
    source: 'Hudl',
    tags: ['Review', 'Coaching'],
    thumbnailColor: '#1e3a5f',
  },
  {
    id: 'vc-14',
    title: 'Top 10 Plays — January',
    type: 'highlight',
    duration: 180,
    source: 'YouTube',
    tags: ['Highlight', 'Monthly'],
    thumbnailColor: '#3d3d3d',
  },
  {
    id: 'vc-15',
    title: 'USC Upstate Half-Court Sets',
    type: 'scout',
    duration: 390,
    source: 'Synergy',
    tags: ['Scout', 'Opponent'],
    thumbnailColor: '#006400',
  },
  {
    id: 'vc-16',
    title: 'Free Throw Routine Reps',
    type: 'drill',
    duration: 210,
    source: 'Practice',
    tags: ['Shooting', 'Drill'],
    thumbnailColor: '#1e1e1e',
  },
  {
    id: 'vc-17',
    title: 'Pregame Warmup — Coastal',
    gameId: 'vg-1',
    type: 'highlight',
    duration: 120,
    source: 'YouTube',
    tags: ['Pregame'],
    thumbnailColor: '#1a472a',
  },
  {
    id: 'vc-18',
    title: 'Zone Defense Adjustments — Feb Film',
    type: 'breakdown',
    duration: 340,
    source: 'Hudl',
    tags: ['Defense', 'Coaching'],
    thumbnailColor: '#2e2e2e',
  },
];

// =============================================================================
// MOCK SCOUT PACKS
// =============================================================================

export const MOCK_SCOUT_PACKS: ScoutPack[] = [
  {
    id: 'sp-1',
    opponent: 'Campbell',
    date: 'Feb 15, 2026',
    clipCount: 12,
    coverColor: '#ff6600',
    tags: ['Next Game', 'Conference'],
  },
  {
    id: 'sp-2',
    opponent: 'Longwood',
    date: 'Feb 19, 2026',
    clipCount: 8,
    coverColor: '#0047ab',
    tags: ['Upcoming', 'Conference'],
  },
  {
    id: 'sp-3',
    opponent: 'Winthrop',
    date: 'Feb 22, 2026',
    clipCount: 10,
    coverColor: '#4a0e4e',
    tags: ['Upcoming', 'Conference'],
  },
  {
    id: 'sp-4',
    opponent: 'Gardner-Webb',
    date: 'Feb 26, 2026',
    clipCount: 6,
    coverColor: '#8b4513',
    tags: ['Upcoming', 'Conference'],
  },
  {
    id: 'sp-5',
    opponent: 'UNC Asheville',
    date: 'Mar 1, 2026',
    clipCount: 14,
    coverColor: '#1e3a5f',
    tags: ['Revenge', 'Conference'],
  },
];

// =============================================================================
// MOCK PLAYER CHANNELS
// =============================================================================

export const MOCK_PLAYER_CHANNELS: PlayerChannel[] = [
  { id: 'pc-1', name: 'Marcus Johnson', number: '5', position: 'SG', clipCount: 34, avatarInitials: 'MJ' },
  { id: 'pc-2', name: 'Deon Williams', number: '23', position: 'PF', clipCount: 28, avatarInitials: 'DW' },
  { id: 'pc-3', name: 'Tyler Roberts', number: '12', position: 'PG', clipCount: 31, avatarInitials: 'TR' },
  { id: 'pc-4', name: 'Andre Harris', number: '3', position: 'SF', clipCount: 22, avatarInitials: 'AH' },
  { id: 'pc-5', name: 'Chris Thompson', number: '44', position: 'C', clipCount: 18, avatarInitials: 'CT' },
  { id: 'pc-6', name: 'Jamal Peterson', number: '11', position: 'PG', clipCount: 15, avatarInitials: 'JP' },
  { id: 'pc-7', name: 'Brandon Lewis', number: '32', position: 'PF', clipCount: 20, avatarInitials: 'BL' },
  { id: 'pc-8', name: 'Kevin Scott', number: '2', position: 'SG', clipCount: 12, avatarInitials: 'KS' },
  { id: 'pc-9', name: 'David Brown', number: '15', position: 'SF', clipCount: 9, avatarInitials: 'DB' },
  { id: 'pc-10', name: 'Ryan Mitchell', number: '24', position: 'C', clipCount: 7, avatarInitials: 'RM' },
];

// =============================================================================
// MOCK REELS
// =============================================================================

export const MOCK_REELS: Reel[] = [
  {
    id: 'reel-1',
    title: 'Marcus Johnson 22-pt Performance',
    caption: 'MJ was COOKING tonight. 22 pts on 8/12 shooting.',
    duration: 45,
    thumbnailColor: '#1a472a',
    playerTag: { name: 'Marcus Johnson', number: '5' },
    teamTag: 'FMU Lions',
    tags: ['Offense', 'Scoring'],
    source: 'Hudl',
    likes: 234,
    saves: 45,
    createdAt: '2026-02-12',
  },
  {
    id: 'reel-2',
    title: 'Deon Williams Block Party',
    caption: '5 blocks in one half. Built different.',
    duration: 32,
    thumbnailColor: '#8b0000',
    playerTag: { name: 'Deon Williams', number: '23' },
    teamTag: 'FMU Lions',
    tags: ['Defense', 'Blocks'],
    source: 'Hudl',
    likes: 189,
    saves: 38,
    createdAt: '2026-02-05',
  },
  {
    id: 'reel-3',
    title: 'Tyler Roberts — Playmaking Cuts',
    caption: 'Reading the defense like a book. 9 assists.',
    duration: 38,
    thumbnailColor: '#4a0e4e',
    playerTag: { name: 'Tyler Roberts', number: '12' },
    teamTag: 'FMU Lions',
    tags: ['Offense', 'Assists'],
    source: 'Hudl',
    likes: 156,
    saves: 29,
    createdAt: '2026-02-01',
  },
  {
    id: 'reel-4',
    title: 'Top 10 Plays — January',
    caption: 'The best of January. Which one was YOUR favorite?',
    duration: 60,
    thumbnailColor: '#3d3d3d',
    teamTag: 'FMU Lions',
    tags: ['Highlight', 'Monthly'],
    source: 'YouTube',
    likes: 412,
    saves: 87,
    createdAt: '2026-01-31',
  },
  {
    id: 'reel-5',
    title: 'Andre Harris Lockdown D',
    caption: 'Held his man to 2/11 from the field.',
    duration: 28,
    thumbnailColor: '#1a472a',
    playerTag: { name: 'Andre Harris', number: '3' },
    teamTag: 'FMU Lions',
    tags: ['Defense', 'Lockdown'],
    source: 'Hudl',
    likes: 98,
    saves: 22,
    createdAt: '2026-02-12',
  },
  {
    id: 'reel-6',
    title: 'Chris Thompson Double-Double',
    caption: '14 pts, 12 rebs. Dominant in the paint.',
    duration: 42,
    thumbnailColor: '#003366',
    playerTag: { name: 'Chris Thompson', number: '44' },
    teamTag: 'FMU Lions',
    tags: ['Offense', 'Rebounding'],
    source: 'Hudl',
    likes: 134,
    saves: 31,
    createdAt: '2026-01-28',
  },
  {
    id: 'reel-7',
    title: 'Pregame Warmup Energy',
    caption: 'The energy before tipoff was CRAZY.',
    duration: 22,
    thumbnailColor: '#1a472a',
    teamTag: 'FMU Lions',
    tags: ['Pregame', 'Culture'],
    source: 'YouTube',
    likes: 267,
    saves: 54,
    createdAt: '2026-02-12',
  },
  {
    id: 'reel-8',
    title: 'Jamal Peterson Crossover Sequence',
    caption: 'Ankles were broken. No recovery.',
    duration: 18,
    thumbnailColor: '#8b4513',
    playerTag: { name: 'Jamal Peterson', number: '11' },
    teamTag: 'FMU Lions',
    tags: ['Offense', 'Handles'],
    source: 'Hudl',
    likes: 321,
    saves: 67,
    createdAt: '2026-01-21',
  },
  {
    id: 'reel-9',
    title: 'Full Court Press Break',
    caption: 'Breaking the press with precision passing.',
    duration: 35,
    thumbnailColor: '#252525',
    teamTag: 'FMU Lions',
    tags: ['Offense', 'Scheme'],
    source: 'Practice',
    likes: 76,
    saves: 18,
    createdAt: '2026-02-10',
  },
  {
    id: 'reel-10',
    title: 'Kevin Scott Corner 3s',
    caption: '4/4 from the corner. Automatic.',
    duration: 25,
    thumbnailColor: '#191970',
    playerTag: { name: 'Kevin Scott', number: '2' },
    teamTag: 'FMU Lions',
    tags: ['Offense', 'Shooting'],
    source: 'Hudl',
    likes: 145,
    saves: 33,
    createdAt: '2026-01-18',
  },
  {
    id: 'reel-11',
    title: 'Brandon Lewis Putback Dunks',
    caption: 'Second-chance points machine.',
    duration: 30,
    thumbnailColor: '#0047ab',
    playerTag: { name: 'Brandon Lewis', number: '32' },
    teamTag: 'FMU Lions',
    tags: ['Offense', 'Dunks'],
    source: 'Hudl',
    likes: 198,
    saves: 41,
    createdAt: '2026-01-14',
  },
  {
    id: 'reel-12',
    title: 'End-of-Game Execution',
    caption: 'Down 3 with 30 seconds left. Ice in their veins.',
    duration: 48,
    thumbnailColor: '#ff6600',
    teamTag: 'FMU Lions',
    tags: ['Clutch', 'Highlight'],
    source: 'YouTube',
    likes: 389,
    saves: 78,
    createdAt: '2026-01-11',
  },
];

// =============================================================================
// MOCK WATCH HISTORY
// =============================================================================

export const MOCK_WATCH_HISTORY: WatchHistoryItem[] = [
  { id: 'wh-1', contentId: 'vg-1', contentType: 'game', title: 'vs Coastal Carolina', thumbnailColor: '#1a472a', duration: 7200, watchedAt: '2026-02-13', progress: 65 },
  { id: 'wh-2', contentId: 'vc-2', contentType: 'clip', title: 'Transition Defense Breakdown', thumbnailColor: '#2d2d2d', duration: 312, watchedAt: '2026-02-13', progress: 100 },
  { id: 'wh-3', contentId: 'reel-1', contentType: 'reel', title: 'MJ 22-pt Performance', thumbnailColor: '#1a472a', duration: 45, watchedAt: '2026-02-12', progress: 100 },
  { id: 'wh-4', contentId: 'vg-2', contentType: 'game', title: 'vs UNC Asheville', thumbnailColor: '#1e3a5f', duration: 6840, watchedAt: '2026-02-10', progress: 40 },
  { id: 'wh-5', contentId: 'vc-7', contentType: 'clip', title: 'Pick & Roll Execution', thumbnailColor: '#4a0e4e', duration: 268, watchedAt: '2026-02-09', progress: 80 },
  { id: 'wh-6', contentId: 'reel-4', contentType: 'reel', title: 'Top 10 Plays — January', thumbnailColor: '#3d3d3d', duration: 60, watchedAt: '2026-02-08', progress: 100 },
  { id: 'wh-7', contentId: 'vg-3', contentType: 'game', title: 'vs Radford', thumbnailColor: '#8b0000', duration: 6600, watchedAt: '2026-02-06', progress: 100 },
  { id: 'wh-8', contentId: 'vc-13', contentType: 'clip', title: 'UNC Asheville — Loss Review', thumbnailColor: '#1e3a5f', duration: 445, watchedAt: '2026-02-05', progress: 55 },
];

// =============================================================================
// MOCK RECRUIT CLIPS
// =============================================================================

export const MOCK_RECRUIT_CLIPS: RecruitClip[] = [
  { id: 'rc-1', title: 'Jaylen Carter — Senior Mixtape', recruitId: 'r-1', recruitName: 'Jaylen Carter', school: 'Oak Hill Academy', position: 'PG', classYear: '2026', krOverall: 82, type: 'highlight', duration: 240, source: 'Hudl', tags: ['Recruit', 'PG'], thumbnailColor: '#2a4a2a' },
  { id: 'rc-2', title: 'Marcus Williams — State Championship', recruitId: 'r-2', recruitName: 'Marcus Williams', school: 'DeMatha Catholic', position: 'SG', classYear: '2026', krOverall: 78, type: 'highlight', duration: 180, source: 'MaxPreps', tags: ['Recruit', 'SG'], thumbnailColor: '#3a2a5a' },
  { id: 'rc-3', title: 'DeAndre Thompson — AAU Season', recruitId: 'r-3', recruitName: 'DeAndre Thompson', school: 'Montverde Academy', position: 'SF', classYear: '2027', krOverall: 85, type: 'highlight', duration: 300, source: 'YouTube', tags: ['Recruit', 'SF'], thumbnailColor: '#5a2a2a' },
  { id: 'rc-4', title: 'Chris Evans — Defensive Showcase', recruitId: 'r-4', recruitName: 'Chris Evans', school: 'IMG Academy', position: 'PF', classYear: '2026', krOverall: 74, type: 'scout', duration: 210, source: 'Synergy', tags: ['Recruit', 'PF'], thumbnailColor: '#2a3a5a' },
  { id: 'rc-5', title: 'Tyler Brown — 30-Point Game', recruitId: 'r-5', recruitName: 'Tyler Brown', school: 'Findlay Prep', position: 'SG', classYear: '2026', krOverall: 80, type: 'highlight', duration: 195, source: 'Hudl', tags: ['Recruit', 'SG'], thumbnailColor: '#4a4a2a' },
  { id: 'rc-6', title: 'Jordan Mitchell — Summer League', recruitId: 'r-6', recruitName: 'Jordan Mitchell', school: 'Sunrise Christian', position: 'C', classYear: '2027', krOverall: 76, type: 'highlight', duration: 270, source: 'YouTube', tags: ['Recruit', 'C'], thumbnailColor: '#2a5a4a' },
  { id: 'rc-7', title: 'David Lee — Pick & Pop Specialist', recruitId: 'r-7', recruitName: 'David Lee', school: 'La Lumiere', position: 'PF', classYear: '2026', krOverall: 71, type: 'scout', duration: 165, source: 'Synergy', tags: ['Recruit', 'PF'], thumbnailColor: '#5a3a2a' },
  { id: 'rc-8', title: 'Amir Johnson — Floor General', recruitId: 'r-8', recruitName: 'Amir Johnson', school: 'Brewster Academy', position: 'PG', classYear: '2027', krOverall: 88, type: 'highlight', duration: 225, source: 'Hudl', tags: ['Recruit', 'PG'], thumbnailColor: '#3a5a2a' },
];
