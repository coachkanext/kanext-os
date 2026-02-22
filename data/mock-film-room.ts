/**
 * Mock Film Room Data
 * Types and mock data for all 5 Film Room modes:
 * Sports, Church, Education, Business, Community.
 */

// =============================================================================
// SHARED TYPES
// =============================================================================

export type FilmStatus = 'new' | 'watched' | 'in-progress';

// =============================================================================
// SPORTS FILM ROOM
// =============================================================================

export interface FilmTag {
  id: string;
  label: string;
  category: 'offense' | 'defense' | 'transition' | 'special';
  count: number;
}

export interface GameFilm {
  id: string;
  title: string;
  opponent: string;
  date: string;
  duration: number; // seconds
  thumbnailColor: string;
  category: string;
  status: FilmStatus;
  tags: string[];
  result?: 'W' | 'L';
  score?: string;
  data_source?: string;
}

export interface PracticeSession {
  id: string;
  title: string;
  date: string;
  duration: number;
  thumbnailColor: string;
  category: string;
  status: FilmStatus;
  tags: string[];
  focusArea: string;
  data_source?: string;
}

export interface BreakdownClip {
  id: string;
  title: string;
  date: string;
  duration: number;
  thumbnailColor: string;
  category: string;
  status: FilmStatus;
  tags: string[];
  gameRef: string;
  data_source?: string;
}

export const FILM_TAGS: FilmTag[] = [
  { id: 'ft-1', label: 'Half-Court Offense', category: 'offense', count: 14 },
  { id: 'ft-2', label: 'Fast Break', category: 'offense', count: 9 },
  { id: 'ft-3', label: 'Pick & Roll', category: 'offense', count: 11 },
  { id: 'ft-4', label: 'Post-Up', category: 'offense', count: 6 },
  { id: 'ft-5', label: 'Man-to-Man', category: 'defense', count: 12 },
  { id: 'ft-6', label: 'Zone Defense', category: 'defense', count: 8 },
  { id: 'ft-7', label: 'Full-Court Press', category: 'defense', count: 5 },
  { id: 'ft-8', label: 'Help & Recover', category: 'defense', count: 7 },
  { id: 'ft-9', label: 'Transition Offense', category: 'transition', count: 10 },
  { id: 'ft-10', label: 'Transition Defense', category: 'transition', count: 6 },
  { id: 'ft-11', label: 'Inbounds Plays', category: 'special', count: 4 },
  { id: 'ft-12', label: 'End of Clock', category: 'special', count: 3 },
];

export const GAME_FILMS: GameFilm[] = [
  // ── KaNeXT — Feb 2026 KaNeXT Conference games ─────────────────────────
  {
    id: 'gf-1',
    title: 'vs St. Thomas',
    opponent: 'St. Thomas',
    date: '2026-02-15',
    duration: 5820,
    thumbnailColor: '#1E3A5F',
    category: 'conference',
    status: 'new',
    tags: ['Half-Court Offense', 'Man-to-Man', 'Full-Court Press'],
    result: 'W',
    score: '81-73',
    data_source: 'demo_seed',
  },
  {
    id: 'gf-2',
    title: 'vs Warner',
    opponent: 'Warner',
    date: '2026-02-11',
    duration: 6120,
    thumbnailColor: '#8B0000',
    category: 'conference',
    status: 'in-progress',
    tags: ['Zone Defense', 'Fast Break', 'Pick & Roll'],
    result: 'W',
    score: '76-68',
    data_source: 'demo_seed',
  },
  {
    id: 'gf-3',
    title: 'vs Coastal Georgia',
    opponent: 'Coastal Georgia',
    date: '2026-02-08',
    duration: 5940,
    thumbnailColor: '#003DA5',
    category: 'conference',
    status: 'watched',
    tags: ['Transition Offense', 'Help & Recover'],
    result: 'L',
    score: '65-71',
    data_source: 'demo_seed',
  },
  {
    id: 'gf-4',
    title: 'vs Webber International',
    opponent: 'Webber International',
    date: '2026-02-04',
    duration: 6300,
    thumbnailColor: '#4B0082',
    category: 'conference',
    status: 'watched',
    tags: ['Post-Up', 'Full-Court Press'],
    result: 'W',
    score: '88-79',
    data_source: 'demo_seed',
  },
  {
    id: 'gf-5',
    title: 'vs Ave Maria',
    opponent: 'Ave Maria',
    date: '2026-01-28',
    duration: 5700,
    thumbnailColor: '#FFD700',
    category: 'conference',
    status: 'watched',
    tags: ['Half-Court Offense', 'Zone Defense'],
    result: 'W',
    score: '92-77',
    data_source: 'demo_seed',
  },
];

export const PRACTICE_SESSIONS: PracticeSession[] = [
  {
    id: 'ps-1',
    title: 'Pre-Game Shootaround — St. Thomas',
    date: '2026-02-15',
    duration: 2700,
    thumbnailColor: '#2E4A2E',
    category: 'shootaround',
    status: 'watched',
    tags: ['Shooting', 'Pre-Game'],
    focusArea: 'Shooting',
    data_source: 'demo_seed',
  },
  {
    id: 'ps-2',
    title: 'Defensive Rotation Drill — Press Break',
    date: '2026-02-13',
    duration: 3600,
    thumbnailColor: '#4A2E2E',
    category: 'drill',
    status: 'in-progress',
    tags: ['Defense', 'Rotations', 'Press Break'],
    focusArea: 'Defensive Rotations',
    data_source: 'demo_seed',
  },
  {
    id: 'ps-3',
    title: 'Full Practice — Offensive Sets vs Zone',
    date: '2026-02-10',
    duration: 5400,
    thumbnailColor: '#2E3A4A',
    category: 'full',
    status: 'watched',
    tags: ['Offense', 'Sets', 'Zone Attack'],
    focusArea: 'Offensive Sets',
    data_source: 'demo_seed',
  },
  {
    id: 'ps-4',
    title: 'Conditioning & Scrimmage',
    date: '2026-02-07',
    duration: 4200,
    thumbnailColor: '#3A3A2E',
    category: 'scrimmage',
    status: 'watched',
    tags: ['Conditioning', 'Scrimmage'],
    focusArea: 'Conditioning',
    data_source: 'demo_seed',
  },
];

export const BREAKDOWN_CLIPS: BreakdownClip[] = [
  {
    id: 'bc-1',
    title: 'Press Break Execution — St. Thomas',
    date: '2026-02-16',
    duration: 180,
    thumbnailColor: '#1E3A5F',
    category: 'offense',
    status: 'new',
    tags: ['Full-Court Press', 'Half-Court Offense'],
    gameRef: 'vs St. Thomas',
    data_source: 'demo_seed',
  },
  {
    id: 'bc-2',
    title: 'Fast Break Buckets — Warner',
    date: '2026-02-12',
    duration: 145,
    thumbnailColor: '#8B0000',
    category: 'offense',
    status: 'watched',
    tags: ['Fast Break', 'Transition Offense'],
    gameRef: 'vs Warner',
    data_source: 'demo_seed',
  },
  {
    id: 'bc-3',
    title: 'Help Side Breakdowns — Coastal Georgia',
    date: '2026-02-09',
    duration: 210,
    thumbnailColor: '#003DA5',
    category: 'defense',
    status: 'in-progress',
    tags: ['Help & Recover', 'Man-to-Man'],
    gameRef: 'vs Coastal Georgia',
    data_source: 'demo_seed',
  },
  {
    id: 'bc-4',
    title: 'Pick & Roll Coverage — Webber',
    date: '2026-02-05',
    duration: 165,
    thumbnailColor: '#4B0082',
    category: 'offense',
    status: 'watched',
    tags: ['Pick & Roll', 'Offensive Breakdown'],
    gameRef: 'vs Webber International',
    data_source: 'demo_seed',
  },
  {
    id: 'bc-5',
    title: 'Zone Attack Sequences — Ave Maria',
    date: '2026-01-29',
    duration: 195,
    thumbnailColor: '#FFD700',
    category: 'offense',
    status: 'watched',
    tags: ['Zone Defense', 'Offensive Sets'],
    gameRef: 'vs Ave Maria',
    data_source: 'demo_seed',
  },
  {
    id: 'bc-6',
    title: 'Turnover Sequences — Coastal Georgia',
    date: '2026-02-09',
    duration: 130,
    thumbnailColor: '#3A4A2E',
    category: 'transition',
    status: 'new',
    tags: ['Transition Defense', 'Turnovers'],
    gameRef: 'vs Coastal Georgia',
    data_source: 'demo_seed',
  },
  {
    id: 'bc-7',
    title: 'End-of-Half Execution — St. Thomas',
    date: '2026-02-16',
    duration: 90,
    thumbnailColor: '#4A4A2E',
    category: 'special',
    status: 'new',
    tags: ['End of Clock', 'Half-Court Offense'],
    gameRef: 'vs St. Thomas',
    data_source: 'demo_seed',
  },
  {
    id: 'bc-8',
    title: 'Post Defense Reel — Warner',
    date: '2026-02-12',
    duration: 155,
    thumbnailColor: '#2E3A3A',
    category: 'defense',
    status: 'in-progress',
    tags: ['Post-Up', 'Man-to-Man'],
    gameRef: 'vs Warner',
    data_source: 'demo_seed',
  },
];

// =============================================================================
// SPORTS — VIDEO FEED POSTS & STORIES (demo_seed)
// =============================================================================

export interface VideoFeedPost {
  id: string;
  title: string;
  caption: string;
  date: string;
  duration: number;
  thumbnailColor: string;
  category: 'highlight' | 'practice' | 'team-content' | 'behind-scenes';
  author: string;
  viewCount: number;
  likeCount: number;
  data_source?: string;
}

export interface StoryItem {
  id: string;
  title: string;
  date: string;
  duration: number;
  thumbnailColor: string;
  category: 'game-day' | 'travel' | 'community' | 'recruiting';
  slideCount: number;
  viewed: boolean;
  data_source?: string;
}

export const VIDEO_FEED_POSTS: VideoFeedPost[] = [
  {
    id: 'vfp-1',
    title: 'Lions Win! KaNeXT 81, St. Thomas 73',
    caption: 'Highlights from tonight\'s conference win at Lehman Center. The Lions forced 22 turnovers and shot 48% from the field. #FMULions #SunConference',
    date: '2026-02-15',
    duration: 145,
    thumbnailColor: '#1E3A5F',
    category: 'highlight',
    author: 'KaNeXT Athletics',
    viewCount: 1240,
    likeCount: 187,
    data_source: 'demo_seed',
  },
  {
    id: 'vfp-2',
    title: 'Practice Intensity — Conference Tournament Prep',
    caption: 'The Lions are locked in. Coach Carter running the squad through defensive rotations ahead of the tournament push. #WorkHard #FMUBasketball',
    date: '2026-02-13',
    duration: 92,
    thumbnailColor: '#2E4A2E',
    category: 'practice',
    author: 'KaNeXT Basketball',
    viewCount: 680,
    likeCount: 94,
    data_source: 'demo_seed',
  },
  {
    id: 'vfp-3',
    title: 'Team Meal — Bonding Off the Court',
    caption: 'KaNeXT MBB team dinner in Miami Gardens before the homestretch. These moments matter as much as the game reps. #FMUFamily #LionPride',
    date: '2026-02-10',
    duration: 65,
    thumbnailColor: '#F59E0B',
    category: 'team-content',
    author: 'KaNeXT Basketball',
    viewCount: 520,
    likeCount: 112,
    data_source: 'demo_seed',
  },
];

export const STORY_ITEMS: StoryItem[] = [
  {
    id: 'story-1',
    title: 'Game Day vs St. Thomas',
    date: '2026-02-15',
    duration: 30,
    thumbnailColor: '#1E3A5F',
    category: 'game-day',
    slideCount: 8,
    viewed: false,
    data_source: 'demo_seed',
  },
  {
    id: 'story-2',
    title: 'Road Trip — Warner Game',
    date: '2026-02-11',
    duration: 25,
    thumbnailColor: '#8B0000',
    category: 'game-day',
    slideCount: 6,
    viewed: true,
    data_source: 'demo_seed',
  },
];

/** Get video feed posts sorted by date (most recent first) */
export function getVideoFeedPosts(): VideoFeedPost[] {
  return [...VIDEO_FEED_POSTS].sort((a, b) => b.date.localeCompare(a.date));
}

/** Get story items sorted by date (most recent first) */
export function getStoryItems(): StoryItem[] {
  return [...STORY_ITEMS].sort((a, b) => b.date.localeCompare(a.date));
}

// =============================================================================
// CHURCH FILM ROOM (Ministry Rooms)
// =============================================================================

export interface SermonRecording {
  id: string;
  title: string;
  speaker: string;
  date: string;
  duration: number;
  thumbnailColor: string;
  category: string;
  status: FilmStatus;
  tags: string[];
  seriesName: string;
}

export interface TeachingSession {
  id: string;
  title: string;
  facilitator: string;
  date: string;
  duration: number;
  thumbnailColor: string;
  category: string;
  status: FilmStatus;
  tags: string[];
  topic: string;
}

export interface MinistryEvent {
  id: string;
  title: string;
  date: string;
  duration: number;
  thumbnailColor: string;
  category: string;
  status: FilmStatus;
  tags: string[];
  eventType: string;
}

export const SERMON_RECORDINGS: SermonRecording[] = [
  {
    id: 'sr-1',
    title: 'Walking in Purpose',
    speaker: 'Pastor Dipo Carter',
    date: '2025-02-09',
    duration: 3600,
    thumbnailColor: '#5B2C6F',
    category: 'sermon',
    status: 'new',
    tags: ['Purpose', 'Faith'],
    seriesName: 'Kingdom Identity',
  },
  {
    id: 'sr-2',
    title: 'The Power of Agreement',
    speaker: 'Pastor Dipo Carter',
    date: '2025-02-02',
    duration: 3300,
    thumbnailColor: '#1A5276',
    category: 'sermon',
    status: 'watched',
    tags: ['Unity', 'Prayer'],
    seriesName: 'Kingdom Identity',
  },
  {
    id: 'sr-3',
    title: 'Positioned for Breakthrough',
    speaker: 'Pastor Dipo Carter',
    date: '2025-01-26',
    duration: 3900,
    thumbnailColor: '#7B241C',
    category: 'sermon',
    status: 'in-progress',
    tags: ['Breakthrough', 'Positioning'],
    seriesName: 'Doors of Destiny',
  },
  {
    id: 'sr-4',
    title: 'Renewing Your Mind',
    speaker: 'Pastor Dipo Carter',
    date: '2025-01-19',
    duration: 3450,
    thumbnailColor: '#196F3D',
    category: 'sermon',
    status: 'watched',
    tags: ['Mindset', 'Transformation'],
    seriesName: 'Doors of Destiny',
  },
  {
    id: 'sr-5',
    title: 'Generational Blessings',
    speaker: 'Pastor Dipo Carter',
    date: '2025-01-12',
    duration: 3150,
    thumbnailColor: '#7D6608',
    category: 'sermon',
    status: 'new',
    tags: ['Generational', 'Blessings', 'Legacy'],
    seriesName: 'Legacy Builders',
  },
];

export const TEACHING_SESSIONS: TeachingSession[] = [
  {
    id: 'ts-1',
    title: 'Foundations of Faith',
    facilitator: 'Minister Grace Adeyemi',
    date: '2025-02-05',
    duration: 2700,
    thumbnailColor: '#1B4F72',
    category: 'bible-study',
    status: 'new',
    tags: ['Foundations', 'New Believers'],
    topic: 'Bible Study — Hebrews 11',
  },
  {
    id: 'ts-2',
    title: 'Prayer & Intercession Workshop',
    facilitator: 'Elder David Okonkwo',
    date: '2025-01-29',
    duration: 3000,
    thumbnailColor: '#6C3483',
    category: 'workshop',
    status: 'watched',
    tags: ['Prayer', 'Intercession', 'Workshop'],
    topic: 'Prayer Strategies',
  },
  {
    id: 'ts-3',
    title: 'Leadership Development',
    facilitator: 'Pastor Dipo Carter',
    date: '2025-01-22',
    duration: 2400,
    thumbnailColor: '#1E8449',
    category: 'leadership',
    status: 'in-progress',
    tags: ['Leadership', 'Ministry'],
    topic: 'Servant Leadership',
  },
  {
    id: 'ts-4',
    title: 'Marriage Enrichment Session',
    facilitator: 'Pastor & Mrs. Carter',
    date: '2025-01-15',
    duration: 3600,
    thumbnailColor: '#922B21',
    category: 'family',
    status: 'new',
    tags: ['Marriage', 'Family', 'Relationships'],
    topic: 'Strengthening Bonds',
  },
];

export const MINISTRY_EVENTS: MinistryEvent[] = [
  {
    id: 'me-1',
    title: 'Youth Conference 2025',
    date: '2025-02-01',
    duration: 7200,
    thumbnailColor: '#2E86C1',
    category: 'conference',
    status: 'in-progress',
    tags: ['Youth', 'Conference'],
    eventType: 'Conference',
  },
  {
    id: 'me-2',
    title: 'Worship Night — January',
    date: '2025-01-24',
    duration: 5400,
    thumbnailColor: '#884EA0',
    category: 'worship',
    status: 'watched',
    tags: ['Worship', 'Music'],
    eventType: 'Worship Night',
  },
  {
    id: 'me-3',
    title: 'Community Outreach Day',
    date: '2025-01-11',
    duration: 4800,
    thumbnailColor: '#27AE60',
    category: 'outreach',
    status: 'new',
    tags: ['Outreach', 'Community', 'Service'],
    eventType: 'Outreach',
  },
];

// =============================================================================
// EDUCATION FILM ROOM (Classrooms)
// =============================================================================

export interface LectureRecording {
  id: string;
  title: string;
  courseCode: string;
  professor: string;
  date: string;
  duration: number;
  thumbnailColor: string;
  category: string;
  status: FilmStatus;
  tags: string[];
  topic: string;
}

export interface LabSession {
  id: string;
  title: string;
  labName: string;
  date: string;
  duration: number;
  thumbnailColor: string;
  category: string;
  status: FilmStatus;
  tags: string[];
  equipmentTags: string[];
}

export const LECTURE_RECORDINGS: LectureRecording[] = [
  {
    id: 'lr-1',
    title: 'Intro to Data Structures',
    courseCode: 'CS 201',
    professor: 'Dr. James Mitchell',
    date: '2025-02-10',
    duration: 4500,
    thumbnailColor: '#2874A6',
    category: 'lecture',
    status: 'new',
    tags: ['CS', 'Data Structures'],
    topic: 'Binary Trees & Traversal',
  },
  {
    id: 'lr-2',
    title: 'African American Literature',
    courseCode: 'ENG 315',
    professor: 'Dr. Sharon Williams',
    date: '2025-02-07',
    duration: 4200,
    thumbnailColor: '#6C3483',
    category: 'lecture',
    status: 'watched',
    tags: ['English', 'Literature'],
    topic: 'Harlem Renaissance Poetry',
  },
  {
    id: 'lr-3',
    title: 'Organic Chemistry II',
    courseCode: 'CHEM 302',
    professor: 'Dr. Patricia Evans',
    date: '2025-02-05',
    duration: 4800,
    thumbnailColor: '#1E8449',
    category: 'lecture',
    status: 'in-progress',
    tags: ['Chemistry', 'Organic'],
    topic: 'Nucleophilic Substitution',
  },
  {
    id: 'lr-4',
    title: 'Principles of Marketing',
    courseCode: 'BUS 240',
    professor: 'Dr. Alex Morgan',
    date: '2025-02-03',
    duration: 3900,
    thumbnailColor: '#CA6F1E',
    category: 'lecture',
    status: 'new',
    tags: ['Business', 'Marketing'],
    topic: 'Digital Marketing Strategy',
  },
  {
    id: 'lr-5',
    title: 'Physics — Electromagnetism',
    courseCode: 'PHYS 202',
    professor: 'Dr. Angela Davis',
    date: '2025-01-31',
    duration: 4500,
    thumbnailColor: '#2E4053',
    category: 'lecture',
    status: 'watched',
    tags: ['Physics', 'Electromagnetism'],
    topic: "Maxwell's Equations",
  },
  {
    id: 'lr-6',
    title: 'History of Civil Rights',
    courseCode: 'HIST 410',
    professor: 'Dr. Robert Jackson',
    date: '2025-01-28',
    duration: 4200,
    thumbnailColor: '#7B241C',
    category: 'lecture',
    status: 'new',
    tags: ['History', 'Civil Rights'],
    topic: 'Montgomery Bus Boycott',
  },
];

export const LAB_SESSIONS: LabSession[] = [
  {
    id: 'ls-1',
    title: 'Organic Chem Lab — Synthesis',
    labName: 'Chemistry Lab 204',
    date: '2025-02-06',
    duration: 5400,
    thumbnailColor: '#1A5276',
    category: 'lab',
    status: 'in-progress',
    tags: ['Chemistry', 'Lab'],
    equipmentTags: ['Spectrometer', 'Fume Hood', 'Distillation Kit'],
  },
  {
    id: 'ls-2',
    title: 'Physics Lab — Circuits',
    labName: 'Engineering Lab 112',
    date: '2025-02-01',
    duration: 3600,
    thumbnailColor: '#2E4053',
    category: 'lab',
    status: 'watched',
    tags: ['Physics', 'Circuits'],
    equipmentTags: ['Oscilloscope', 'Multimeter', 'Breadboard'],
  },
  {
    id: 'ls-3',
    title: 'CS Lab — Algorithm Workshop',
    labName: 'Computer Lab 301',
    date: '2025-01-30',
    duration: 4200,
    thumbnailColor: '#2874A6',
    category: 'lab',
    status: 'new',
    tags: ['CS', 'Algorithms'],
    equipmentTags: ['Workstation', 'Whiteboard'],
  },
];

// =============================================================================
// BUSINESS FILM ROOM (Workspaces)
// =============================================================================

export interface MeetingRecording {
  id: string;
  title: string;
  date: string;
  duration: number;
  thumbnailColor: string;
  category: string;
  status: FilmStatus;
  tags: string[];
  attendeesCount: number;
  actionItemsCount: number;
}

export interface TrainingVideo {
  id: string;
  title: string;
  moduleName: string;
  date: string;
  duration: number;
  thumbnailColor: string;
  category: string;
  status: FilmStatus;
  tags: string[];
  completionPct: number;
}

export const MEETING_RECORDINGS: MeetingRecording[] = [
  {
    id: 'mr-1',
    title: 'Q1 Strategy Review',
    date: '2025-02-10',
    duration: 3600,
    thumbnailColor: '#1A5276',
    category: 'strategy',
    status: 'new',
    tags: ['Strategy', 'Q1', 'Leadership'],
    attendeesCount: 12,
    actionItemsCount: 5,
  },
  {
    id: 'mr-2',
    title: 'Product Roadmap Sync',
    date: '2025-02-07',
    duration: 2700,
    thumbnailColor: '#6C3483',
    category: 'product',
    status: 'in-progress',
    tags: ['Product', 'Roadmap'],
    attendeesCount: 8,
    actionItemsCount: 3,
  },
  {
    id: 'mr-3',
    title: 'Board Meeting — January',
    date: '2025-01-30',
    duration: 5400,
    thumbnailColor: '#1E8449',
    category: 'board',
    status: 'watched',
    tags: ['Board', 'Governance'],
    attendeesCount: 15,
    actionItemsCount: 7,
  },
  {
    id: 'mr-4',
    title: 'Engineering Stand-Up Recap',
    date: '2025-01-27',
    duration: 1800,
    thumbnailColor: '#CA6F1E',
    category: 'engineering',
    status: 'watched',
    tags: ['Engineering', 'Sprint'],
    attendeesCount: 6,
    actionItemsCount: 2,
  },
  {
    id: 'mr-5',
    title: 'Investor Relations Call',
    date: '2025-01-20',
    duration: 2400,
    thumbnailColor: '#7B241C',
    category: 'investor',
    status: 'new',
    tags: ['Investor', 'Finance'],
    attendeesCount: 4,
    actionItemsCount: 4,
  },
];

export const TRAINING_VIDEOS: TrainingVideo[] = [
  {
    id: 'tv-1',
    title: 'Onboarding — Company Culture',
    moduleName: 'Culture & Values',
    date: '2025-02-01',
    duration: 1800,
    thumbnailColor: '#2E86C1',
    category: 'onboarding',
    status: 'watched',
    tags: ['Onboarding', 'Culture'],
    completionPct: 100,
  },
  {
    id: 'tv-2',
    title: 'Security Awareness Training',
    moduleName: 'InfoSec Essentials',
    date: '2025-01-25',
    duration: 2400,
    thumbnailColor: '#922B21',
    category: 'compliance',
    status: 'in-progress',
    tags: ['Security', 'Compliance'],
    completionPct: 65,
  },
  {
    id: 'tv-3',
    title: 'Leadership Development — Module 3',
    moduleName: 'Effective Delegation',
    date: '2025-01-18',
    duration: 3000,
    thumbnailColor: '#1E8449',
    category: 'leadership',
    status: 'new',
    tags: ['Leadership', 'Management'],
    completionPct: 0,
  },
  {
    id: 'tv-4',
    title: 'Sales Enablement Workshop',
    moduleName: 'Consultative Selling',
    date: '2025-01-10',
    duration: 2700,
    thumbnailColor: '#7D6608',
    category: 'sales',
    status: 'watched',
    tags: ['Sales', 'Workshop'],
    completionPct: 100,
  },
];

// =============================================================================
// COMMUNITY FILM ROOM (Paddock)
// =============================================================================

export interface CompetitionFootage {
  id: string;
  title: string;
  eventName: string;
  track: string;
  date: string;
  duration: number;
  thumbnailColor: string;
  category: string;
  status: FilmStatus;
  tags: string[];
  result: string;
}

export interface EventRecording {
  id: string;
  title: string;
  date: string;
  duration: number;
  thumbnailColor: string;
  category: string;
  status: FilmStatus;
  tags: string[];
  eventType: string;
}

export const COMPETITION_FOOTAGE: CompetitionFootage[] = [
  {
    id: 'cf-1',
    title: 'Sprint Finals — Regional',
    eventName: '2025 Regional Championship',
    track: 'Wilkerson Track Complex',
    date: '2025-02-08',
    duration: 420,
    thumbnailColor: '#8B0000',
    category: 'sprint',
    status: 'new',
    tags: ['Sprint', 'Finals', '100m'],
    result: '1st — 10.42s',
  },
  {
    id: 'cf-2',
    title: 'Relay Heats — Invitational',
    eventName: 'Heritage Invitational',
    track: 'Lions Stadium',
    date: '2025-02-01',
    duration: 360,
    thumbnailColor: '#00508B',
    category: 'relay',
    status: 'watched',
    tags: ['Relay', '4x100m'],
    result: '2nd — 40.87s',
  },
  {
    id: 'cf-3',
    title: 'Long Jump Competition',
    eventName: 'SWAC Indoor Meet',
    track: 'Convention Center Arena',
    date: '2025-01-25',
    duration: 540,
    thumbnailColor: '#4B0082',
    category: 'field',
    status: 'in-progress',
    tags: ['Field', 'Long Jump'],
    result: '3rd — 7.21m',
  },
  {
    id: 'cf-4',
    title: '400m Dash — Time Trial',
    eventName: 'Intra-Squad Meet',
    track: 'Home Track',
    date: '2025-01-18',
    duration: 300,
    thumbnailColor: '#2E4A2E',
    category: 'sprint',
    status: 'watched',
    tags: ['Sprint', '400m', 'Time Trial'],
    result: 'PR — 47.31s',
  },
  {
    id: 'cf-5',
    title: 'Hurdles Prelims — Conference',
    eventName: 'SWAC Conference Meet',
    track: 'Memorial Stadium',
    date: '2025-01-11',
    duration: 480,
    thumbnailColor: '#4A2E2E',
    category: 'hurdles',
    status: 'new',
    tags: ['Hurdles', '110m'],
    result: '4th — 14.15s',
  },
];

export const EVENT_RECORDINGS: EventRecording[] = [
  {
    id: 'er-1',
    title: 'Club Meeting — February',
    date: '2025-02-06',
    duration: 3600,
    thumbnailColor: '#2E86C1',
    category: 'meeting',
    status: 'new',
    tags: ['Meeting', 'Monthly'],
    eventType: 'Club Meeting',
  },
  {
    id: 'er-2',
    title: 'Coaching Clinic — Sprint Mechanics',
    date: '2025-01-28',
    duration: 5400,
    thumbnailColor: '#884EA0',
    category: 'clinic',
    status: 'in-progress',
    tags: ['Clinic', 'Coaching', 'Sprint'],
    eventType: 'Coaching Clinic',
  },
  {
    id: 'er-3',
    title: 'Awards Banquet 2024',
    date: '2025-01-15',
    duration: 7200,
    thumbnailColor: '#D4AC0D',
    category: 'ceremony',
    status: 'watched',
    tags: ['Awards', 'Ceremony'],
    eventType: 'Awards Banquet',
  },
];

// =============================================================================
// HELPERS
// =============================================================================

export function formatFilmDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatFilmDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getStatusColor(status: FilmStatus): string {
  switch (status) {
    case 'new': return '#6AA9FF';
    case 'in-progress': return '#F59E0B';
    case 'watched': return '#22C55E';
  }
}

export function getStatusLabel(status: FilmStatus): string {
  switch (status) {
    case 'new': return 'NEW';
    case 'in-progress': return 'IN PROGRESS';
    case 'watched': return 'WATCHED';
  }
}
