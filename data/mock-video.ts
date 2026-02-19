/**
 * Mock Video Data
 * Types, mock data, and helpers for the Media/Video tab.
 * Mode-keyed exports for all 5 modes.
 */

import type { Mode } from '@/types';

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
  { id: 'pc-1', name: 'Marcus Johnson', number: '5', position: 'CG', clipCount: 34, avatarInitials: 'MJ' },
  { id: 'pc-2', name: 'Deon Williams', number: '23', position: 'F', clipCount: 28, avatarInitials: 'DW' },
  { id: 'pc-3', name: 'Tyler Roberts', number: '12', position: 'PG', clipCount: 31, avatarInitials: 'TR' },
  { id: 'pc-4', name: 'Andre Harris', number: '3', position: 'W', clipCount: 22, avatarInitials: 'AH' },
  { id: 'pc-5', name: 'Chris Thompson', number: '44', position: 'B', clipCount: 18, avatarInitials: 'CT' },
  { id: 'pc-6', name: 'Jamal Peterson', number: '11', position: 'PG', clipCount: 15, avatarInitials: 'JP' },
  { id: 'pc-7', name: 'Brandon Lewis', number: '32', position: 'F', clipCount: 20, avatarInitials: 'BL' },
  { id: 'pc-8', name: 'Kevin Scott', number: '2', position: 'CG', clipCount: 12, avatarInitials: 'KS' },
  { id: 'pc-9', name: 'David Brown', number: '15', position: 'W', clipCount: 9, avatarInitials: 'DB' },
  { id: 'pc-10', name: 'Ryan Mitchell', number: '24', position: 'B', clipCount: 7, avatarInitials: 'RM' },
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
  { id: 'rc-2', title: 'Marcus Williams — State Championship', recruitId: 'r-2', recruitName: 'Marcus Williams', school: 'DeMatha Catholic', position: 'CG', classYear: '2026', krOverall: 78, type: 'highlight', duration: 180, source: 'MaxPreps', tags: ['Recruit', 'CG'], thumbnailColor: '#3a2a5a' },
  { id: 'rc-3', title: 'DeAndre Thompson — AAU Season', recruitId: 'r-3', recruitName: 'DeAndre Thompson', school: 'Montverde Academy', position: 'W', classYear: '2027', krOverall: 85, type: 'highlight', duration: 300, source: 'YouTube', tags: ['Recruit', 'W'], thumbnailColor: '#5a2a2a' },
  { id: 'rc-4', title: 'Chris Evans — Defensive Showcase', recruitId: 'r-4', recruitName: 'Chris Evans', school: 'IMG Academy', position: 'F', classYear: '2026', krOverall: 74, type: 'scout', duration: 210, source: 'Synergy', tags: ['Recruit', 'F'], thumbnailColor: '#2a3a5a' },
  { id: 'rc-5', title: 'Tyler Brown — 30-Point Game', recruitId: 'r-5', recruitName: 'Tyler Brown', school: 'Findlay Prep', position: 'CG', classYear: '2026', krOverall: 80, type: 'highlight', duration: 195, source: 'Hudl', tags: ['Recruit', 'CG'], thumbnailColor: '#4a4a2a' },
  { id: 'rc-6', title: 'Jordan Mitchell — Summer League', recruitId: 'r-6', recruitName: 'Jordan Mitchell', school: 'Sunrise Christian', position: 'B', classYear: '2027', krOverall: 76, type: 'highlight', duration: 270, source: 'YouTube', tags: ['Recruit', 'B'], thumbnailColor: '#2a5a4a' },
  { id: 'rc-7', title: 'David Lee — Pick & Pop Specialist', recruitId: 'r-7', recruitName: 'David Lee', school: 'La Lumiere', position: 'F', classYear: '2026', krOverall: 71, type: 'scout', duration: 165, source: 'Synergy', tags: ['Recruit', 'F'], thumbnailColor: '#5a3a2a' },
  { id: 'rc-8', title: 'Amir Johnson — Floor General', recruitId: 'r-8', recruitName: 'Amir Johnson', school: 'Brewster Academy', position: 'PG', classYear: '2027', krOverall: 88, type: 'highlight', duration: 225, source: 'Hudl', tags: ['Recruit', 'PG'], thumbnailColor: '#3a5a2a' },
];

// =============================================================================
// CHURCH MODE — Service recordings, sermon clips, ministry channels, etc.
// =============================================================================

const CHURCH_VIDEO_GAMES: VideoGame[] = [
  { id: 'cvg-1', opponent: 'Sunday Service — Feb 15', date: 'Feb 15, 2026', result: 'W', score: '320 attended', tags: ['Sunday', 'Main Service'], thumbnailColor: '#1B2044', clipCount: 8, duration: 5400 },
  { id: 'cvg-2', opponent: 'Sunday Service — Feb 8', date: 'Feb 8, 2026', result: 'W', score: '285 attended', tags: ['Sunday', 'Main Service'], thumbnailColor: '#2D1044', clipCount: 7, duration: 5100 },
  { id: 'cvg-3', opponent: 'Wednesday Bible Study — Feb 12', date: 'Feb 12, 2026', result: 'W', score: '68 attended', tags: ['Midweek', 'Teaching'], thumbnailColor: '#0A2A1A', clipCount: 4, duration: 3600 },
  { id: 'cvg-4', opponent: 'Youth Service — Feb 7', date: 'Feb 7, 2026', result: 'W', score: '45 attended', tags: ['Youth', 'Friday Night'], thumbnailColor: '#1A2A0A', clipCount: 5, duration: 4200 },
  { id: 'cvg-5', opponent: 'Baptism Sunday — Feb 1', date: 'Feb 1, 2026', result: 'W', score: '7 baptized', tags: ['Special', 'Baptism'], thumbnailColor: '#0A1A2A', clipCount: 10, duration: 6000 },
  { id: 'cvg-6', opponent: 'Sunday Service — Jan 25', date: 'Jan 25, 2026', result: 'W', score: '298 attended', tags: ['Sunday', 'Main Service'], thumbnailColor: '#2A1A0A', clipCount: 6, duration: 5200 },
  { id: 'cvg-7', opponent: 'Prayer Night — Jan 22', date: 'Jan 22, 2026', result: 'W', score: '52 attended', tags: ['Prayer', 'Evening'], thumbnailColor: '#1A0A2A', clipCount: 3, duration: 3000 },
  { id: 'cvg-8', opponent: 'Sunday Service — Jan 18', date: 'Jan 18, 2026', result: 'W', score: '310 attended', tags: ['Sunday', 'Main Service'], thumbnailColor: '#0A2A2A', clipCount: 7, duration: 5300 },
];

const CHURCH_VIDEO_CLIPS: VideoClip[] = [
  { id: 'cvc-1', title: 'Walking in Faith — Sermon Highlight', gameId: 'cvg-1', type: 'highlight', duration: 480, source: 'Live Stream', tags: ['Sermon', 'Faith Forward'], thumbnailColor: '#1B2044' },
  { id: 'cvc-2', title: 'Great Is Thy Faithfulness — Full', gameId: 'cvg-1', type: 'highlight', duration: 360, source: 'Live Stream', tags: ['Worship', 'Hymn'], thumbnailColor: '#2D1044' },
  { id: 'cvc-3', title: 'Armor of God Study — Pt. 3', gameId: 'cvg-3', type: 'breakdown', duration: 2400, source: 'Recording', tags: ['Teaching', 'Bible Study'], thumbnailColor: '#0A2A1A' },
  { id: 'cvc-4', title: 'Youth Retreat — Day 1 Recap', type: 'highlight', duration: 300, source: 'YouTube', tags: ['Youth', 'Retreat'], thumbnailColor: '#1A2A0A' },
  { id: 'cvc-5', title: 'Baptism Celebration — 7 New Believers', gameId: 'cvg-5', type: 'highlight', duration: 540, source: 'Live Stream', tags: ['Baptism', 'Celebration'], thumbnailColor: '#0A1A2A' },
  { id: 'cvc-6', title: 'Choir Rehearsal — Easter Prep', type: 'drill', duration: 1800, source: 'Recording', tags: ['Choir', 'Rehearsal'], thumbnailColor: '#2A1A2A' },
  { id: 'cvc-7', title: 'Outreach Saturday — Community Service', type: 'highlight', duration: 420, source: 'YouTube', tags: ['Outreach', 'Community'], thumbnailColor: '#1A2A1A' },
  { id: 'cvc-8', title: 'Pastor Dipo — Leadership Teaching', type: 'breakdown', duration: 1800, source: 'Recording', tags: ['Leadership', 'Teaching'], thumbnailColor: '#2A0A1A' },
  { id: 'cvc-9', title: 'Worship Team — Sound Check & Setup', type: 'drill', duration: 900, source: 'Recording', tags: ['Production', 'Setup'], thumbnailColor: '#1A1A2A' },
  { id: 'cvc-10', title: 'Guest Speaker — Dr. Olu Adeyemi', type: 'scout', duration: 2700, source: 'Live Stream', tags: ['Guest', 'Conference'], thumbnailColor: '#0A0A2A' },
];

const CHURCH_SCOUT_PACKS: ScoutPack[] = [
  { id: 'csp-1', opponent: 'Easter Service Planning', date: 'Apr 20, 2026', clipCount: 8, coverColor: '#7C3AED', tags: ['Upcoming', 'Special'] },
  { id: 'csp-2', opponent: 'Revival Week', date: 'Mar 15, 2026', clipCount: 12, coverColor: '#EF4444', tags: ['Upcoming', 'Revival'] },
  { id: 'csp-3', opponent: 'Community Outreach — March', date: 'Mar 8, 2026', clipCount: 6, coverColor: '#22C55E', tags: ['Upcoming', 'Outreach'] },
  { id: 'csp-4', opponent: 'Youth Conference', date: 'Mar 22, 2026', clipCount: 10, coverColor: '#3B82F6', tags: ['Youth', 'Conference'] },
  { id: 'csp-5', opponent: 'Worship Night', date: 'Feb 28, 2026', clipCount: 5, coverColor: '#EC4899', tags: ['Next Event', 'Worship'] },
];

const CHURCH_PLAYER_CHANNELS: PlayerChannel[] = [
  { id: 'cpc-1', name: 'Pastor Dipo Kalejaiye', number: '', position: 'Senior Pastor', clipCount: 42, avatarInitials: 'DK' },
  { id: 'cpc-2', name: 'Worship Team', number: '', position: 'Music Ministry', clipCount: 28, avatarInitials: 'WT' },
  { id: 'cpc-3', name: 'Youth Ministry', number: '', position: 'Youth Director', clipCount: 18, avatarInitials: 'YM' },
  { id: 'cpc-4', name: 'Deacon Board', number: '', position: 'Leadership', clipCount: 12, avatarInitials: 'DB' },
  { id: 'cpc-5', name: 'Women\'s Ministry', number: '', position: 'Ministry', clipCount: 15, avatarInitials: 'WM' },
  { id: 'cpc-6', name: 'Men\'s Fellowship', number: '', position: 'Ministry', clipCount: 10, avatarInitials: 'MF' },
  { id: 'cpc-7', name: 'Children\'s Church', number: '', position: 'Ministry', clipCount: 8, avatarInitials: 'CC' },
  { id: 'cpc-8', name: 'Media Team', number: '', position: 'Production', clipCount: 22, avatarInitials: 'MT' },
];

const CHURCH_REELS: Reel[] = [
  { id: 'creel-1', title: 'Walking in Faith — Sermon Clip', caption: 'This word hit different. Faith Forward series continues.', duration: 58, thumbnailColor: '#1B2044', teamTag: 'ICCLA', tags: ['Sermon', 'Faith'], source: 'Live Stream', likes: 345, saves: 78, createdAt: '2026-02-15' },
  { id: 'creel-2', title: 'Worship Highlights — Feb 15', caption: '"Great Is Thy Faithfulness" — the presence was tangible.', duration: 42, thumbnailColor: '#2D1044', teamTag: 'ICCLA', tags: ['Worship', 'Praise'], source: 'Live Stream', likes: 456, saves: 112, createdAt: '2026-02-15' },
  { id: 'creel-3', title: 'Youth Retreat Moments', caption: '3 days of fellowship and growth. These kids are on fire.', duration: 35, thumbnailColor: '#0A2A1A', teamTag: 'ICCLA Youth', tags: ['Youth', 'Retreat'], source: 'YouTube', likes: 287, saves: 65, createdAt: '2026-02-08' },
  { id: 'creel-4', title: 'Baptism Sunday — 7 New Believers', caption: 'Heaven is rejoicing. Welcome to the family of faith.', duration: 50, thumbnailColor: '#0A1A2A', teamTag: 'ICCLA', tags: ['Baptism', 'Celebration'], source: 'Live Stream', likes: 523, saves: 134, createdAt: '2026-02-01' },
  { id: 'creel-5', title: 'Outreach Saturday Recap', caption: '200+ families served. This is what the church is for.', duration: 28, thumbnailColor: '#1A2A1A', teamTag: 'ICCLA', tags: ['Outreach', 'Community'], source: 'YouTube', likes: 198, saves: 45, createdAt: '2026-02-14' },
  { id: 'creel-6', title: 'Pastor Dipo — "Don\'t Quit"', caption: 'One minute that might change your week. Keep going.', duration: 60, thumbnailColor: '#2A0A1A', teamTag: 'ICCLA', tags: ['Encouragement', 'Sermon'], source: 'Live Stream', likes: 612, saves: 189, createdAt: '2026-01-25' },
  { id: 'creel-7', title: 'Choir Rehearsal BTS', caption: 'Easter prep is underway. Something special is coming.', duration: 22, thumbnailColor: '#2A1A2A', teamTag: 'ICCLA', tags: ['BTS', 'Choir'], source: 'Recording', likes: 145, saves: 32, createdAt: '2026-02-12' },
  { id: 'creel-8', title: 'Prayer Night Atmosphere', caption: 'When the saints pray, things shift. Join us next Thursday.', duration: 30, thumbnailColor: '#1A0A2A', teamTag: 'ICCLA', tags: ['Prayer', 'Worship'], source: 'Live Stream', likes: 234, saves: 56, createdAt: '2026-01-22' },
];

const CHURCH_WATCH_HISTORY: WatchHistoryItem[] = [
  { id: 'cwh-1', contentId: 'cvg-1', contentType: 'game', title: 'Sunday Service — Feb 15', thumbnailColor: '#1B2044', duration: 5400, watchedAt: '2026-02-15', progress: 100 },
  { id: 'cwh-2', contentId: 'cvc-3', contentType: 'clip', title: 'Armor of God Study — Pt. 3', thumbnailColor: '#0A2A1A', duration: 2400, watchedAt: '2026-02-12', progress: 75 },
  { id: 'cwh-3', contentId: 'creel-1', contentType: 'reel', title: 'Walking in Faith — Clip', thumbnailColor: '#1B2044', duration: 58, watchedAt: '2026-02-15', progress: 100 },
  { id: 'cwh-4', contentId: 'cvg-5', contentType: 'game', title: 'Baptism Sunday — Feb 1', thumbnailColor: '#0A1A2A', duration: 6000, watchedAt: '2026-02-02', progress: 60 },
  { id: 'cwh-5', contentId: 'cvc-8', contentType: 'clip', title: 'Leadership Teaching', thumbnailColor: '#2A0A1A', duration: 1800, watchedAt: '2026-02-10', progress: 100 },
  { id: 'cwh-6', contentId: 'creel-4', contentType: 'reel', title: 'Baptism Sunday — 7 New Believers', thumbnailColor: '#0A1A2A', duration: 50, watchedAt: '2026-02-01', progress: 100 },
];

// =============================================================================
// EDUCATION MODE — Lectures, campus events, department channels, etc.
// =============================================================================

const EDUCATION_VIDEO_GAMES: VideoGame[] = [
  { id: 'evg-1', opponent: 'CS 401 — Machine Learning Lecture', date: 'Feb 14, 2026', result: 'W', score: '89 students', tags: ['Lecture', 'Computer Science'], thumbnailColor: '#1A1A2A', clipCount: 5, duration: 4800 },
  { id: 'evg-2', opponent: 'Homecoming Convocation', date: 'Feb 10, 2026', result: 'W', score: '1200 attended', tags: ['Event', 'Campus'], thumbnailColor: '#2A2A0A', clipCount: 12, duration: 7200 },
  { id: 'evg-3', opponent: 'Aviation Solo Flight Day', date: 'Feb 7, 2026', result: 'W', score: '6 solos', tags: ['Aviation', 'Achievement'], thumbnailColor: '#1A2A3A', clipCount: 8, duration: 3600 },
  { id: 'evg-4', opponent: 'Research Symposium — Panel A', date: 'Feb 5, 2026', result: 'W', score: '15 presentations', tags: ['Research', 'Graduate'], thumbnailColor: '#1A0A2A', clipCount: 15, duration: 10800 },
  { id: 'evg-5', opponent: 'Dean\'s List Ceremony', date: 'Feb 3, 2026', result: 'W', score: '142 honored', tags: ['Ceremony', 'Academic'], thumbnailColor: '#0A1A2A', clipCount: 6, duration: 5400 },
  { id: 'evg-6', opponent: 'BIO 301 — Guest Lecture: Genomics', date: 'Jan 30, 2026', result: 'W', score: '67 students', tags: ['Lecture', 'Biology'], thumbnailColor: '#0A2A1A', clipCount: 3, duration: 4200 },
  { id: 'evg-7', opponent: 'Student Talent Show', date: 'Jan 24, 2026', result: 'W', score: '450 attended', tags: ['Event', 'Culture'], thumbnailColor: '#2A1A2A', clipCount: 10, duration: 5400 },
  { id: 'evg-8', opponent: 'Spring Orientation', date: 'Jan 15, 2026', result: 'W', score: '280 new students', tags: ['Orientation', 'Campus'], thumbnailColor: '#0A2A2A', clipCount: 7, duration: 4800 },
];

const EDUCATION_VIDEO_CLIPS: VideoClip[] = [
  { id: 'evc-1', title: 'ML Lecture — Neural Networks Overview', gameId: 'evg-1', type: 'breakdown', duration: 1200, source: 'Recording', tags: ['Lecture', 'CS'], thumbnailColor: '#1A1A2A' },
  { id: 'evc-2', title: 'Homecoming Highlights — Best Moments', gameId: 'evg-2', type: 'highlight', duration: 300, source: 'YouTube', tags: ['Event', 'Highlights'], thumbnailColor: '#2A2A0A' },
  { id: 'evc-3', title: 'First Solo Flight — Cadet Williams', gameId: 'evg-3', type: 'highlight', duration: 180, source: 'YouTube', tags: ['Aviation', 'Achievement'], thumbnailColor: '#1A2A3A' },
  { id: 'evc-4', title: 'Research: AI in Healthcare — Dr. Chen', gameId: 'evg-4', type: 'breakdown', duration: 1800, source: 'Recording', tags: ['Research', 'Presentation'], thumbnailColor: '#1A0A2A' },
  { id: 'evc-5', title: 'Campus Tour — Spring 2026', type: 'highlight', duration: 420, source: 'YouTube', tags: ['Campus', 'Tour'], thumbnailColor: '#0A2A2A' },
  { id: 'evc-6', title: 'Study Skills Workshop — Prof. Morris', type: 'drill', duration: 2400, source: 'Recording', tags: ['Workshop', 'Academic'], thumbnailColor: '#2A1A0A' },
  { id: 'evc-7', title: 'Genomics Lecture — Guest Speaker', gameId: 'evg-6', type: 'breakdown', duration: 2700, source: 'Recording', tags: ['Lecture', 'Biology'], thumbnailColor: '#0A2A1A' },
  { id: 'evc-8', title: 'Student Government Election Speeches', type: 'highlight', duration: 600, source: 'Live Stream', tags: ['Student Gov', 'Election'], thumbnailColor: '#2A0A2A' },
  { id: 'evc-9', title: 'Lab Tour — New Science Building', type: 'scout', duration: 480, source: 'YouTube', tags: ['Facilities', 'Tour'], thumbnailColor: '#1A2A1A' },
  { id: 'evc-10', title: 'Writing Center — Essay Workshop', type: 'drill', duration: 1800, source: 'Recording', tags: ['Workshop', 'Writing'], thumbnailColor: '#2A2A1A' },
];

const EDUCATION_SCOUT_PACKS: ScoutPack[] = [
  { id: 'esp-1', opponent: 'Spring Commencement', date: 'May 10, 2026', clipCount: 6, coverColor: '#3B82F6', tags: ['Upcoming', 'Ceremony'] },
  { id: 'esp-2', opponent: 'STEM Fair', date: 'Mar 20, 2026', clipCount: 10, coverColor: '#22C55E', tags: ['Upcoming', 'Academic'] },
  { id: 'esp-3', opponent: 'Alumni Weekend', date: 'Mar 14, 2026', clipCount: 8, coverColor: '#F59E0B', tags: ['Upcoming', 'Alumni'] },
  { id: 'esp-4', opponent: 'Spring Athletic Awards', date: 'Apr 25, 2026', clipCount: 5, coverColor: '#EF4444', tags: ['Athletics', 'Ceremony'] },
  { id: 'esp-5', opponent: 'Research Symposium — Spring', date: 'Apr 8, 2026', clipCount: 14, coverColor: '#7C3AED', tags: ['Research', 'Academic'] },
];

const EDUCATION_PLAYER_CHANNELS: PlayerChannel[] = [
  { id: 'epc-1', name: 'Prof. Adebayo', number: '', position: 'Computer Science', clipCount: 38, avatarInitials: 'PA' },
  { id: 'epc-2', name: 'Dean Morris', number: '', position: 'Administration', clipCount: 15, avatarInitials: 'DM' },
  { id: 'epc-3', name: 'Aviation Dept', number: '', position: 'Academics', clipCount: 24, avatarInitials: 'AV' },
  { id: 'epc-4', name: 'FMU Athletics', number: '', position: 'Athletics', clipCount: 42, avatarInitials: 'FA' },
  { id: 'epc-5', name: 'Student Government', number: '', position: 'Student Life', clipCount: 18, avatarInitials: 'SG' },
  { id: 'epc-6', name: 'Research Office', number: '', position: 'Graduate Studies', clipCount: 20, avatarInitials: 'RO' },
  { id: 'epc-7', name: 'Campus Life', number: '', position: 'Student Affairs', clipCount: 28, avatarInitials: 'CL' },
  { id: 'epc-8', name: 'Alumni Association', number: '', position: 'External Relations', clipCount: 12, avatarInitials: 'AA' },
];

const EDUCATION_REELS: Reel[] = [
  { id: 'ereel-1', title: 'Solo Flight Day', caption: 'HBCU aviation excellence. Our cadets took to the sky today.', duration: 45, thumbnailColor: '#1A2A3A', teamTag: 'FMU Aviation', tags: ['Aviation', 'Achievement'], source: 'YouTube', likes: 1240, saves: 312, createdAt: '2026-02-07' },
  { id: 'ereel-2', title: 'Homecoming 2026 — Best Moments', caption: 'What a week. FMU showed out. Every single moment.', duration: 55, thumbnailColor: '#2A2A0A', teamTag: 'FMU', tags: ['Homecoming', 'Culture'], source: 'YouTube', likes: 2340, saves: 567, createdAt: '2026-02-10' },
  { id: 'ereel-3', title: 'Lions Basketball Highlights', caption: '16-8 and counting. Sun Conference contenders.', duration: 38, thumbnailColor: '#1A1A2A', teamTag: 'FMU Athletics', tags: ['Athletics', 'Basketball'], source: 'YouTube', likes: 890, saves: 198, createdAt: '2026-02-13' },
  { id: 'ereel-4', title: 'Dean\'s List Walk', caption: '142 students honored. Academic excellence on display.', duration: 30, thumbnailColor: '#0A1A2A', teamTag: 'FMU', tags: ['Academic', 'Ceremony'], source: 'Recording', likes: 456, saves: 89, createdAt: '2026-02-03' },
  { id: 'ereel-5', title: 'New Science Building Tour', caption: 'State-of-the-art labs. The future is being built here.', duration: 42, thumbnailColor: '#0A2A2A', teamTag: 'FMU Campus', tags: ['Facilities', 'Tour'], source: 'YouTube', likes: 678, saves: 145, createdAt: '2026-01-28' },
  { id: 'ereel-6', title: 'Student Talent Show Highlights', caption: 'The talent on this campus is UNREAL.', duration: 50, thumbnailColor: '#2A1A2A', teamTag: 'FMU', tags: ['Culture', 'Talent'], source: 'YouTube', likes: 1560, saves: 378, createdAt: '2026-01-24' },
  { id: 'ereel-7', title: 'Research Spotlight — AI Lab', caption: 'Student research making real-world impact.', duration: 35, thumbnailColor: '#1A0A2A', teamTag: 'FMU Research', tags: ['Research', 'STEM'], source: 'Recording', likes: 345, saves: 78, createdAt: '2026-02-05' },
  { id: 'ereel-8', title: 'Campus Life — Day in the Life', caption: 'What a day at FMU looks like. Miami Gardens, baby.', duration: 48, thumbnailColor: '#2A0A1A', teamTag: 'FMU', tags: ['Campus', 'Culture'], source: 'YouTube', likes: 980, saves: 234, createdAt: '2026-01-20' },
];

const EDUCATION_WATCH_HISTORY: WatchHistoryItem[] = [
  { id: 'ewh-1', contentId: 'evg-1', contentType: 'game', title: 'CS 401 — ML Lecture', thumbnailColor: '#1A1A2A', duration: 4800, watchedAt: '2026-02-14', progress: 80 },
  { id: 'ewh-2', contentId: 'evc-2', contentType: 'clip', title: 'Homecoming Highlights', thumbnailColor: '#2A2A0A', duration: 300, watchedAt: '2026-02-10', progress: 100 },
  { id: 'ewh-3', contentId: 'ereel-1', contentType: 'reel', title: 'Solo Flight Day', thumbnailColor: '#1A2A3A', duration: 45, watchedAt: '2026-02-07', progress: 100 },
  { id: 'ewh-4', contentId: 'evg-4', contentType: 'game', title: 'Research Symposium', thumbnailColor: '#1A0A2A', duration: 10800, watchedAt: '2026-02-05', progress: 35 },
  { id: 'ewh-5', contentId: 'evc-5', contentType: 'clip', title: 'Campus Tour', thumbnailColor: '#0A2A2A', duration: 420, watchedAt: '2026-02-04', progress: 100 },
  { id: 'ewh-6', contentId: 'ereel-2', contentType: 'reel', title: 'Homecoming Reel', thumbnailColor: '#2A2A0A', duration: 55, watchedAt: '2026-02-10', progress: 100 },
];

// =============================================================================
// BUSINESS MODE — Product demos, all-hands, conferences, team channels, etc.
// =============================================================================

const BUSINESS_VIDEO_GAMES: VideoGame[] = [
  { id: 'bvg-1', opponent: 'All-Hands Meeting — February', date: 'Feb 14, 2026', result: 'W', score: '32 attended', tags: ['All-Hands', 'Company'], thumbnailColor: '#0A0A2A', clipCount: 8, duration: 5400 },
  { id: 'bvg-2', opponent: 'KaNeXT V2 Demo Day', date: 'Feb 10, 2026', result: 'W', score: '85 viewers', tags: ['Demo', 'Product'], thumbnailColor: '#1A1A2A', clipCount: 12, duration: 3600 },
  { id: 'bvg-3', opponent: 'Sprint 14 Demo', date: 'Feb 7, 2026', result: 'W', score: '18 attendees', tags: ['Sprint', 'Engineering'], thumbnailColor: '#1A2A1A', clipCount: 6, duration: 2700 },
  { id: 'bvg-4', opponent: 'HBCU Tech Summit — Day 1', date: 'Feb 3, 2026', result: 'W', score: '500+ booth visits', tags: ['Conference', 'External'], thumbnailColor: '#1A1A1A', clipCount: 15, duration: 7200 },
  { id: 'bvg-5', opponent: 'Investor Update — Q1 Preview', date: 'Jan 30, 2026', result: 'W', score: '12 investors', tags: ['Investor', 'Finance'], thumbnailColor: '#2A0A1A', clipCount: 4, duration: 3000 },
  { id: 'bvg-6', opponent: 'Sprint 13 Demo', date: 'Jan 24, 2026', result: 'W', score: '16 attendees', tags: ['Sprint', 'Engineering'], thumbnailColor: '#0A2A0A', clipCount: 5, duration: 2400 },
  { id: 'bvg-7', opponent: 'MLK Truth Classic Press Conf.', date: 'Jan 20, 2026', result: 'W', score: '45 media', tags: ['Press', 'Event'], thumbnailColor: '#2A1A0A', clipCount: 8, duration: 3600 },
  { id: 'bvg-8', opponent: 'All-Hands Meeting — January', date: 'Jan 10, 2026', result: 'W', score: '30 attended', tags: ['All-Hands', 'Company'], thumbnailColor: '#0A1A0A', clipCount: 7, duration: 4800 },
];

const BUSINESS_VIDEO_CLIPS: VideoClip[] = [
  { id: 'bvc-1', title: 'KaNeXT V2 — Full Product Demo', gameId: 'bvg-2', type: 'highlight', duration: 900, source: 'Recording', tags: ['Product', 'Demo'], thumbnailColor: '#1A1A2A' },
  { id: 'bvc-2', title: 'Mode Switching Deep-Dive', gameId: 'bvg-2', type: 'breakdown', duration: 480, source: 'Recording', tags: ['Product', 'Feature'], thumbnailColor: '#2A1A2A' },
  { id: 'bvc-3', title: 'Sprint 14 — Film Room Feature', gameId: 'bvg-3', type: 'breakdown', duration: 600, source: 'Recording', tags: ['Engineering', 'Sprint'], thumbnailColor: '#1A2A1A' },
  { id: 'bvc-4', title: 'FMU Customer Testimonial', type: 'highlight', duration: 300, source: 'Recording', tags: ['Customer', 'Testimonial'], thumbnailColor: '#2A0A1A' },
  { id: 'bvc-5', title: 'HBCU Tech Summit — Booth Highlights', gameId: 'bvg-4', type: 'highlight', duration: 240, source: 'YouTube', tags: ['Conference', 'Marketing'], thumbnailColor: '#1A1A1A' },
  { id: 'bvc-6', title: 'Onboarding Walkthrough — New Hires', type: 'drill', duration: 1200, source: 'Recording', tags: ['Onboarding', 'HR'], thumbnailColor: '#2A2A1A' },
  { id: 'bvc-7', title: 'Investor Pitch Deck Walkthrough', gameId: 'bvg-5', type: 'scout', duration: 1800, source: 'Recording', tags: ['Investor', 'Finance'], thumbnailColor: '#2A0A1A' },
  { id: 'bvc-8', title: 'MLK Truth Classic — Full Reveal', gameId: 'bvg-7', type: 'highlight', duration: 420, source: 'YouTube', tags: ['Press', 'Event'], thumbnailColor: '#2A1A0A' },
  { id: 'bvc-9', title: 'Design System Overview — V2', type: 'drill', duration: 900, source: 'Recording', tags: ['Design', 'Documentation'], thumbnailColor: '#1A0A2A' },
  { id: 'bvc-10', title: 'Competitive Landscape Analysis', type: 'scout', duration: 1500, source: 'Recording', tags: ['Strategy', 'Research'], thumbnailColor: '#0A2A1A' },
];

const BUSINESS_SCOUT_PACKS: ScoutPack[] = [
  { id: 'bsp-1', opponent: 'Series A Prep', date: 'Mar 15, 2026', clipCount: 8, coverColor: '#22C55E', tags: ['Finance', 'Milestone'] },
  { id: 'bsp-2', opponent: 'Product Hunt Launch', date: 'Mar 1, 2026', clipCount: 6, coverColor: '#EF4444', tags: ['Marketing', 'Launch'] },
  { id: 'bsp-3', opponent: 'SXSW Conference', date: 'Mar 8, 2026', clipCount: 12, coverColor: '#F59E0B', tags: ['Conference', 'External'] },
  { id: 'bsp-4', opponent: 'Q2 Planning Offsite', date: 'Mar 20, 2026', clipCount: 10, coverColor: '#3B82F6', tags: ['Strategy', 'Company'] },
  { id: 'bsp-5', opponent: 'Customer Advisory Board', date: 'Feb 28, 2026', clipCount: 5, coverColor: '#7C3AED', tags: ['Customer', 'Feedback'] },
];

const BUSINESS_PLAYER_CHANNELS: PlayerChannel[] = [
  { id: 'bpc-1', name: 'Product Team', number: '', position: 'Product', clipCount: 34, avatarInitials: 'PT' },
  { id: 'bpc-2', name: 'Engineering', number: '', position: 'Engineering', clipCount: 28, avatarInitials: 'EN' },
  { id: 'bpc-3', name: 'Marketing', number: '', position: 'Growth', clipCount: 22, avatarInitials: 'MK' },
  { id: 'bpc-4', name: 'Customer Success', number: '', position: 'Support', clipCount: 18, avatarInitials: 'CS' },
  { id: 'bpc-5', name: 'Sammy Kalejaiye', number: '', position: 'CEO / Founder', clipCount: 45, avatarInitials: 'SK' },
  { id: 'bpc-6', name: 'Design', number: '', position: 'Design', clipCount: 15, avatarInitials: 'DS' },
  { id: 'bpc-7', name: 'Finance & Ops', number: '', position: 'Operations', clipCount: 10, avatarInitials: 'FO' },
  { id: 'bpc-8', name: 'Partnerships', number: '', position: 'BD', clipCount: 12, avatarInitials: 'PA' },
];

const BUSINESS_REELS: Reel[] = [
  { id: 'breel-1', title: 'Founder Diary #12', caption: 'On focus and iteration. Building the OS that runs itself.', duration: 55, thumbnailColor: '#0A1A3A', teamTag: 'KaNeXT', tags: ['Founder', 'Culture'], source: 'Recording', likes: 345, saves: 78, createdAt: '2026-02-10' },
  { id: 'breel-2', title: 'V2 Demo in 60 Seconds', caption: 'The entire KaNeXT V2 experience in one minute flat.', duration: 60, thumbnailColor: '#1A1A2A', teamTag: 'KaNeXT', tags: ['Product', 'Demo'], source: 'Recording', likes: 567, saves: 145, createdAt: '2026-02-10' },
  { id: 'breel-3', title: 'HBCU Tech Summit — Booth Energy', caption: 'The energy at our booth was unmatched. Thank you everyone who stopped by.', duration: 35, thumbnailColor: '#1A1A1A', teamTag: 'KaNeXT', tags: ['Conference', 'Culture'], source: 'YouTube', likes: 890, saves: 198, createdAt: '2026-02-03' },
  { id: 'breel-4', title: 'Sprint 14 Highlights', caption: 'Film room, bottom sheets, pager views. We shipped a LOT.', duration: 42, thumbnailColor: '#1A2A1A', teamTag: 'KaNeXT Eng', tags: ['Engineering', 'Sprint'], source: 'Recording', likes: 234, saves: 56, createdAt: '2026-02-07' },
  { id: 'breel-5', title: 'MLK Truth Classic Announcement', caption: '16 teams. $3M+ Year 1. This is bigger than basketball.', duration: 48, thumbnailColor: '#2A1A0A', teamTag: 'KaNeXT', tags: ['Event', 'Press'], source: 'YouTube', likes: 1230, saves: 312, createdAt: '2026-01-20' },
  { id: 'breel-6', title: 'Customer Love — FMU Testimonial', caption: '"This changed how we operate as a program." — Coach K', duration: 38, thumbnailColor: '#2A0A1A', teamTag: 'KaNeXT', tags: ['Customer', 'Testimonial'], source: 'Recording', likes: 456, saves: 98, createdAt: '2026-02-12' },
  { id: 'breel-7', title: 'Office Tour — Miami', caption: 'Where the magic happens. Quick tour of the KaNeXT HQ.', duration: 28, thumbnailColor: '#0A0A2A', teamTag: 'KaNeXT', tags: ['Culture', 'Office'], source: 'YouTube', likes: 678, saves: 156, createdAt: '2026-01-15' },
  { id: 'breel-8', title: 'Team Standup Energy', caption: 'This is how we start every day. Alignment, energy, execution.', duration: 20, thumbnailColor: '#1A0A1A', teamTag: 'KaNeXT', tags: ['Culture', 'Team'], source: 'Recording', likes: 189, saves: 42, createdAt: '2026-02-14' },
];

const BUSINESS_WATCH_HISTORY: WatchHistoryItem[] = [
  { id: 'bwh-1', contentId: 'bvg-1', contentType: 'game', title: 'All-Hands — February', thumbnailColor: '#0A0A2A', duration: 5400, watchedAt: '2026-02-14', progress: 100 },
  { id: 'bwh-2', contentId: 'bvc-1', contentType: 'clip', title: 'V2 Product Demo', thumbnailColor: '#1A1A2A', duration: 900, watchedAt: '2026-02-10', progress: 100 },
  { id: 'bwh-3', contentId: 'breel-1', contentType: 'reel', title: 'Founder Diary #12', thumbnailColor: '#0A1A3A', duration: 55, watchedAt: '2026-02-10', progress: 100 },
  { id: 'bwh-4', contentId: 'bvg-4', contentType: 'game', title: 'HBCU Tech Summit', thumbnailColor: '#1A1A1A', duration: 7200, watchedAt: '2026-02-03', progress: 50 },
  { id: 'bwh-5', contentId: 'bvc-4', contentType: 'clip', title: 'FMU Testimonial', thumbnailColor: '#2A0A1A', duration: 300, watchedAt: '2026-02-12', progress: 100 },
  { id: 'bwh-6', contentId: 'breel-5', contentType: 'reel', title: 'MLK Classic Announcement', thumbnailColor: '#2A1A0A', duration: 48, watchedAt: '2026-01-20', progress: 100 },
];

// =============================================================================
// COMMUNITY MODE — Races, qualifying, onboard footage, driver channels, etc.
// =============================================================================

const COMMUNITY_VIDEO_GAMES: VideoGame[] = [
  { id: 'kvg-1', opponent: 'Race 6 — Laguna Seca', date: 'Feb 14, 2026', result: 'W', score: 'P1 — Kane', tags: ['Race', 'Championship'], thumbnailColor: '#2A0A0A', clipCount: 18, duration: 5400 },
  { id: 'kvg-2', opponent: 'Qualifying — Laguna Seca', date: 'Feb 13, 2026', result: 'W', score: 'Pole — Kane', tags: ['Qualifying', 'Championship'], thumbnailColor: '#1A1A0A', clipCount: 8, duration: 2400 },
  { id: 'kvg-3', opponent: 'Race 5 — Road America', date: 'Feb 1, 2026', result: 'W', score: 'P2 — Kane', tags: ['Race', 'Championship'], thumbnailColor: '#0A2A0A', clipCount: 15, duration: 5100 },
  { id: 'kvg-4', opponent: 'Qualifying — Road America', date: 'Jan 31, 2026', result: 'L', score: 'P3 — Kane', tags: ['Qualifying', 'Championship'], thumbnailColor: '#0A1A2A', clipCount: 6, duration: 2100 },
  { id: 'kvg-5', opponent: 'Race 4 — Barber Motorsports', date: 'Jan 18, 2026', result: 'W', score: 'P1 — Kane', tags: ['Race', 'Championship'], thumbnailColor: '#2A1A0A', clipCount: 16, duration: 4800 },
  { id: 'kvg-6', opponent: 'Race 3 — Circuit of the Americas', date: 'Jan 5, 2026', result: 'L', score: 'P4 — Kane', tags: ['Race', 'Championship'], thumbnailColor: '#1A0A2A', clipCount: 12, duration: 5400 },
  { id: 'kvg-7', opponent: 'Race 2 — Sebring', date: 'Dec 15, 2025', result: 'W', score: 'P1 — Kane', tags: ['Race', 'Championship'], thumbnailColor: '#0A2A2A', clipCount: 14, duration: 5100 },
  { id: 'kvg-8', opponent: 'Race 1 — Homestead', date: 'Dec 1, 2025', result: 'W', score: 'P2 — Kane', tags: ['Race', 'Season Opener'], thumbnailColor: '#2A2A0A', clipCount: 10, duration: 4500 },
];

const COMMUNITY_VIDEO_CLIPS: VideoClip[] = [
  { id: 'kvc-1', title: 'Kane Qualifying Lap — Onboard', gameId: 'kvg-2', type: 'highlight', duration: 98, source: 'Onboard', tags: ['Qualifying', 'Onboard'], thumbnailColor: '#1A1A0A' },
  { id: 'kvc-2', title: 'Race 6 — Full Highlights', gameId: 'kvg-1', type: 'highlight', duration: 480, source: 'Broadcast', tags: ['Race', 'Highlights'], thumbnailColor: '#2A0A0A' },
  { id: 'kvc-3', title: 'Pit Stop Analysis — Race 6', gameId: 'kvg-1', type: 'breakdown', duration: 360, source: 'Telemetry', tags: ['Pit Stop', 'Strategy'], thumbnailColor: '#0A2A0A' },
  { id: 'kvc-4', title: 'Turn 4 Incident — Multi-Angle', gameId: 'kvg-1', type: 'breakdown', duration: 240, source: 'Broadcast', tags: ['Incident', 'Stewards'], thumbnailColor: '#2A1A0A' },
  { id: 'kvc-5', title: 'Corkscrew Section — Onboard Comparison', gameId: 'kvg-1', type: 'scout', duration: 180, source: 'Onboard', tags: ['Onboard', 'Analysis'], thumbnailColor: '#1A2A0A' },
  { id: 'kvc-6', title: 'Setup Walkthrough — Laguna Seca', type: 'drill', duration: 600, source: 'Team', tags: ['Setup', 'Technical'], thumbnailColor: '#0A1A2A' },
  { id: 'kvc-7', title: 'Track Walk — Laguna Seca Circuit', type: 'scout', duration: 720, source: 'YouTube', tags: ['Track Walk', 'Preview'], thumbnailColor: '#1A2A2A' },
  { id: 'kvc-8', title: 'Tire Degradation Study — Race 5', gameId: 'kvg-3', type: 'breakdown', duration: 540, source: 'Telemetry', tags: ['Tire', 'Strategy'], thumbnailColor: '#0A2A0A' },
  { id: 'kvc-9', title: 'Podium Ceremony — Laguna Seca', gameId: 'kvg-1', type: 'highlight', duration: 300, source: 'Broadcast', tags: ['Podium', 'Celebration'], thumbnailColor: '#0A0A2A' },
  { id: 'kvc-10', title: 'Pre-Race Grid Walk', gameId: 'kvg-1', type: 'drill', duration: 420, source: 'Broadcast', tags: ['Grid', 'Pre-Race'], thumbnailColor: '#2A2A0A' },
];

const COMMUNITY_SCOUT_PACKS: ScoutPack[] = [
  { id: 'ksp-1', opponent: 'Race 7 — Mid-Ohio', date: 'Feb 28, 2026', clipCount: 10, coverColor: '#EF4444', tags: ['Next Race', 'Championship'] },
  { id: 'ksp-2', opponent: 'Race 8 — VIR', date: 'Mar 14, 2026', clipCount: 8, coverColor: '#22C55E', tags: ['Upcoming', 'Championship'] },
  { id: 'ksp-3', opponent: 'Reeves — Rival Analysis', date: 'Feb 20, 2026', clipCount: 12, coverColor: '#3B82F6', tags: ['Rival', 'Analysis'] },
  { id: 'ksp-4', opponent: 'Tanaka — Rival Analysis', date: 'Feb 22, 2026', clipCount: 9, coverColor: '#F59E0B', tags: ['Rival', 'Analysis'] },
  { id: 'ksp-5', opponent: 'Wet Weather Prep', date: 'Feb 25, 2026', clipCount: 6, coverColor: '#7C3AED', tags: ['Preparation', 'Weather'] },
];

const COMMUNITY_PLAYER_CHANNELS: PlayerChannel[] = [
  { id: 'kpc-1', name: 'Marcus Kane', number: '1', position: 'Lead Driver', clipCount: 48, avatarInitials: 'MK' },
  { id: 'kpc-2', name: 'Apex Racing', number: '', position: 'Team', clipCount: 62, avatarInitials: 'AR' },
  { id: 'kpc-3', name: 'Jake Reeves', number: '7', position: 'Rival Driver', clipCount: 24, avatarInitials: 'JR' },
  { id: 'kpc-4', name: 'Yuki Tanaka', number: '33', position: 'Rival Driver', clipCount: 18, avatarInitials: 'YT' },
  { id: 'kpc-5', name: 'Race Control', number: '', position: 'Officials', clipCount: 15, avatarInitials: 'RC' },
  { id: 'kpc-6', name: 'Pit Crew', number: '', position: 'Team', clipCount: 22, avatarInitials: 'PC' },
  { id: 'kpc-7', name: 'K-1 Media', number: '', position: 'Broadcast', clipCount: 35, avatarInitials: 'K1' },
  { id: 'kpc-8', name: 'Strategy Room', number: '', position: 'Engineering', clipCount: 28, avatarInitials: 'SR' },
];

const COMMUNITY_REELS: Reel[] = [
  { id: 'kreel-1', title: 'Kane — Qualifying Onboard', caption: 'Pole position. 1:23.456. Track record. Listen to that engine.', duration: 42, thumbnailColor: '#1A1A0A', playerTag: { name: 'Marcus Kane', number: '1' }, teamTag: 'Apex Racing', tags: ['Qualifying', 'Onboard'], source: 'Onboard', likes: 2340, saves: 567, createdAt: '2026-02-13' },
  { id: 'kreel-2', title: 'Race 6 — Last 5 Laps', caption: '2.4 second gap. Kane controlled the race from start to finish.', duration: 58, thumbnailColor: '#2A0A0A', teamTag: 'K-1', tags: ['Race', 'Highlights'], source: 'Broadcast', likes: 3450, saves: 789, createdAt: '2026-02-14' },
  { id: 'kreel-3', title: 'Pit Stop Perfection', caption: '2.8 seconds. Clean left, clean right. Textbook execution.', duration: 25, thumbnailColor: '#0A2A0A', teamTag: 'Apex Racing', tags: ['Pit Stop', 'Team'], source: 'Broadcast', likes: 1890, saves: 412, createdAt: '2026-02-14' },
  { id: 'kreel-4', title: 'Podium Champagne', caption: 'P1 Kane. P2 Reeves. P3 Tanaka. The champagne was earned.', duration: 30, thumbnailColor: '#0A0A2A', teamTag: 'K-1', tags: ['Podium', 'Celebration'], source: 'Broadcast', likes: 2670, saves: 598, createdAt: '2026-02-14' },
  { id: 'kreel-5', title: 'Corkscrew Send — Side by Side', caption: 'Kane and Reeves going wheel to wheel through the corkscrew. Absolute cinema.', duration: 18, thumbnailColor: '#2A1A0A', playerTag: { name: 'Marcus Kane', number: '1' }, teamTag: 'K-1', tags: ['Battle', 'Highlight'], source: 'Broadcast', likes: 4560, saves: 1023, createdAt: '2026-02-14' },
  { id: 'kreel-6', title: 'Track Walk — Laguna Seca', caption: 'Turn by turn with Marcus Kane. Every corner matters.', duration: 48, thumbnailColor: '#1A2A2A', playerTag: { name: 'Marcus Kane', number: '1' }, teamTag: 'Apex Racing', tags: ['Track Walk', 'Preview'], source: 'YouTube', likes: 980, saves: 234, createdAt: '2026-02-12' },
  { id: 'kreel-7', title: 'Fan Energy — Turn 8', caption: 'The crowd at Turn 8 was ELECTRIC. This is what racing is all about.', duration: 22, thumbnailColor: '#2A1A2A', teamTag: 'K-1', tags: ['Fans', 'Atmosphere'], source: 'YouTube', likes: 1560, saves: 345, createdAt: '2026-02-14' },
  { id: 'kreel-8', title: 'Post-Race Interview — Kane', caption: '"The car was perfect today. Big thanks to the team." — Marcus Kane', duration: 35, thumbnailColor: '#0A1A0A', playerTag: { name: 'Marcus Kane', number: '1' }, teamTag: 'Apex Racing', tags: ['Interview', 'Post-Race'], source: 'Broadcast', likes: 1230, saves: 278, createdAt: '2026-02-14' },
];

const COMMUNITY_WATCH_HISTORY: WatchHistoryItem[] = [
  { id: 'kwh-1', contentId: 'kvg-1', contentType: 'game', title: 'Race 6 — Laguna Seca', thumbnailColor: '#2A0A0A', duration: 5400, watchedAt: '2026-02-14', progress: 100 },
  { id: 'kwh-2', contentId: 'kvc-1', contentType: 'clip', title: 'Kane Qualifying Onboard', thumbnailColor: '#1A1A0A', duration: 98, watchedAt: '2026-02-13', progress: 100 },
  { id: 'kwh-3', contentId: 'kreel-2', contentType: 'reel', title: 'Last 5 Laps', thumbnailColor: '#2A0A0A', duration: 58, watchedAt: '2026-02-14', progress: 100 },
  { id: 'kwh-4', contentId: 'kvg-3', contentType: 'game', title: 'Race 5 — Road America', thumbnailColor: '#0A2A0A', duration: 5100, watchedAt: '2026-02-01', progress: 75 },
  { id: 'kwh-5', contentId: 'kvc-3', contentType: 'clip', title: 'Pit Stop Analysis', thumbnailColor: '#0A2A0A', duration: 360, watchedAt: '2026-02-14', progress: 100 },
  { id: 'kwh-6', contentId: 'kreel-5', contentType: 'reel', title: 'Corkscrew Send', thumbnailColor: '#2A1A0A', duration: 18, watchedAt: '2026-02-14', progress: 100 },
];

// =============================================================================
// MODE-KEYED EXPORTS
// =============================================================================

export const VIDEO_GAMES_BY_MODE: Record<Mode, VideoGame[]> = {
  sports: MOCK_VIDEO_GAMES,
  church: CHURCH_VIDEO_GAMES,
  education: EDUCATION_VIDEO_GAMES,
  business: BUSINESS_VIDEO_GAMES,
  competition: COMMUNITY_VIDEO_GAMES,
};

export const VIDEO_CLIPS_BY_MODE: Record<Mode, VideoClip[]> = {
  sports: MOCK_VIDEO_CLIPS,
  church: CHURCH_VIDEO_CLIPS,
  education: EDUCATION_VIDEO_CLIPS,
  business: BUSINESS_VIDEO_CLIPS,
  competition: COMMUNITY_VIDEO_CLIPS,
};

export const SCOUT_PACKS_BY_MODE: Record<Mode, ScoutPack[]> = {
  sports: MOCK_SCOUT_PACKS,
  church: CHURCH_SCOUT_PACKS,
  education: EDUCATION_SCOUT_PACKS,
  business: BUSINESS_SCOUT_PACKS,
  competition: COMMUNITY_SCOUT_PACKS,
};

export const PLAYER_CHANNELS_BY_MODE: Record<Mode, PlayerChannel[]> = {
  sports: MOCK_PLAYER_CHANNELS,
  church: CHURCH_PLAYER_CHANNELS,
  education: EDUCATION_PLAYER_CHANNELS,
  business: BUSINESS_PLAYER_CHANNELS,
  competition: COMMUNITY_PLAYER_CHANNELS,
};

export const REELS_BY_MODE: Record<Mode, Reel[]> = {
  sports: MOCK_REELS,
  church: CHURCH_REELS,
  education: EDUCATION_REELS,
  business: BUSINESS_REELS,
  competition: COMMUNITY_REELS,
};

export const WATCH_HISTORY_BY_MODE: Record<Mode, WatchHistoryItem[]> = {
  sports: MOCK_WATCH_HISTORY,
  church: CHURCH_WATCH_HISTORY,
  education: EDUCATION_WATCH_HISTORY,
  business: BUSINESS_WATCH_HISTORY,
  competition: COMMUNITY_WATCH_HISTORY,
};

export const RECRUIT_CLIPS_BY_MODE: Record<Mode, RecruitClip[]> = {
  sports: MOCK_RECRUIT_CLIPS,
  church: [],
  education: [],
  business: [],
  competition: [],
};

// =============================================================================
// TRENDING BY MODE
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

export const TRENDING_BY_MODE: Record<Mode, TrendingItem[]> = {
  sports: [], // Sports uses SPORTS_TRENDING from mock-sports-explore-v2
  church: [
    { id: 'ct-1', title: 'Walking in Faith — Full Sermon', subtitle: 'Pastor Dipo · Faith Forward Series', thumbnailColor: '#1B2044', viewCount: 1240, badge: 'featured', duration: '42:15' },
    { id: 'ct-2', title: 'Baptism Sunday — 7 New Believers', subtitle: 'Celebration Service · Feb 1', thumbnailColor: '#0A1A2A', viewCount: 890, badge: 'trending', duration: '12:30' },
    { id: 'ct-3', title: 'Worship Night Highlights', subtitle: 'ICCLA Worship Team', thumbnailColor: '#2D1044', viewCount: 650, badge: 'trending', duration: '6:18' },
  ],
  education: [
    { id: 'et-1', title: 'Solo Flight Day — 6 Cadets Soar', subtitle: 'FMU Aviation Program', thumbnailColor: '#1A2A3A', viewCount: 3400, badge: 'featured', duration: '8:45' },
    { id: 'et-2', title: 'Homecoming 2026 — Best Moments', subtitle: 'Campus Life · FMU', thumbnailColor: '#2A2A0A', viewCount: 5600, badge: 'trending', duration: '4:30' },
    { id: 'et-3', title: 'AI in Healthcare — Research Spotlight', subtitle: 'Dr. Chen · Graduate Studies', thumbnailColor: '#1A0A2A', viewCount: 1200, badge: 'featured', duration: '18:20' },
  ],
  business: [
    { id: 'bt-1', title: 'KaNeXT V2 — Full Product Demo', subtitle: 'Demo Day · 85 Viewers', thumbnailColor: '#1A1A2A', viewCount: 2100, badge: 'featured', duration: '15:00' },
    { id: 'bt-2', title: 'HBCU Tech Summit — Booth Highlights', subtitle: 'Conference · 500+ Visits', thumbnailColor: '#1A1A1A', viewCount: 1800, badge: 'trending', duration: '4:00' },
    { id: 'bt-3', title: 'Founder Diary #12 — On Focus', subtitle: 'Sammy Kalejaiye', thumbnailColor: '#0A1A3A', viewCount: 950, badge: 'featured', duration: '3:22' },
  ],
  competition: [
    { id: 'kt-1', title: 'Race 6 — Last 5 Laps at Laguna Seca', subtitle: 'Kane P1 · Championship Round', thumbnailColor: '#2A0A0A', viewCount: 8900, badge: 'featured', duration: '12:30' },
    { id: 'kt-2', title: 'Corkscrew Send — Side by Side', subtitle: 'Kane vs Reeves · Wheel to Wheel', thumbnailColor: '#2A1A0A', viewCount: 12400, badge: 'trending', duration: '0:48' },
    { id: 'kt-3', title: 'Pit Stop Perfection — 2.8 Seconds', subtitle: 'Apex Racing Crew', thumbnailColor: '#0A2A0A', viewCount: 5600, badge: 'trending', duration: '1:15' },
  ],
};
