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
  {
    id: 'gf-1',
    title: 'vs Texas Southern',
    opponent: 'Texas Southern',
    date: '2025-02-08',
    duration: 5820,
    thumbnailColor: '#8B0000',
    category: 'conference',
    status: 'watched',
    tags: ['Half-Court Offense', 'Man-to-Man'],
    result: 'W',
    score: '78-65',
  },
  {
    id: 'gf-2',
    title: 'vs Prairie View A&M',
    opponent: 'Prairie View A&M',
    date: '2025-02-05',
    duration: 6120,
    thumbnailColor: '#4B0082',
    category: 'conference',
    status: 'in-progress',
    tags: ['Zone Defense', 'Fast Break'],
    result: 'W',
    score: '82-71',
  },
  {
    id: 'gf-3',
    title: 'vs Grambling State',
    opponent: 'Grambling State',
    date: '2025-01-29',
    duration: 5940,
    thumbnailColor: '#FFD700',
    category: 'conference',
    status: 'watched',
    tags: ['Pick & Roll', 'Help & Recover'],
    result: 'L',
    score: '68-72',
  },
  {
    id: 'gf-4',
    title: 'vs Southern',
    opponent: 'Southern',
    date: '2025-01-25',
    duration: 6300,
    thumbnailColor: '#00508B',
    category: 'conference',
    status: 'new',
    tags: ['Transition Offense', 'Full-Court Press'],
    result: 'W',
    score: '91-84',
  },
  {
    id: 'gf-5',
    title: 'vs Alcorn State',
    opponent: 'Alcorn State',
    date: '2025-01-18',
    duration: 5700,
    thumbnailColor: '#4B0082',
    category: 'conference',
    status: 'watched',
    tags: ['Post-Up', 'Zone Defense'],
    result: 'W',
    score: '75-60',
  },
  {
    id: 'gf-6',
    title: 'vs Jackson State',
    opponent: 'Jackson State',
    date: '2025-01-11',
    duration: 6060,
    thumbnailColor: '#003DA5',
    category: 'conference',
    status: 'new',
    tags: ['Fast Break', 'Transition Defense'],
    result: 'L',
    score: '70-77',
  },
];

export const PRACTICE_SESSIONS: PracticeSession[] = [
  {
    id: 'ps-1',
    title: 'Pre-Game Shootaround',
    date: '2025-02-08',
    duration: 2700,
    thumbnailColor: '#2E4A2E',
    category: 'shootaround',
    status: 'watched',
    tags: ['Shooting', 'Pre-Game'],
    focusArea: 'Shooting',
  },
  {
    id: 'ps-2',
    title: 'Defensive Rotation Drill',
    date: '2025-02-06',
    duration: 3600,
    thumbnailColor: '#4A2E2E',
    category: 'drill',
    status: 'in-progress',
    tags: ['Defense', 'Rotations'],
    focusArea: 'Defensive Rotations',
  },
  {
    id: 'ps-3',
    title: 'Full Practice — Offensive Sets',
    date: '2025-02-04',
    duration: 5400,
    thumbnailColor: '#2E3A4A',
    category: 'full',
    status: 'new',
    tags: ['Offense', 'Sets', 'Walk-Through'],
    focusArea: 'Offensive Sets',
  },
  {
    id: 'ps-4',
    title: 'Conditioning & Scrimmage',
    date: '2025-02-02',
    duration: 4200,
    thumbnailColor: '#3A3A2E',
    category: 'scrimmage',
    status: 'watched',
    tags: ['Conditioning', 'Scrimmage'],
    focusArea: 'Conditioning',
  },
];

export const BREAKDOWN_CLIPS: BreakdownClip[] = [
  {
    id: 'bc-1',
    title: 'Pick & Roll Coverage — TSU',
    date: '2025-02-09',
    duration: 180,
    thumbnailColor: '#8B4513',
    category: 'offense',
    status: 'new',
    tags: ['Pick & Roll', 'Offensive Breakdown'],
    gameRef: 'vs Texas Southern',
  },
  {
    id: 'bc-2',
    title: 'Transition Buckets — PVAMU',
    date: '2025-02-06',
    duration: 145,
    thumbnailColor: '#2E4A4A',
    category: 'offense',
    status: 'watched',
    tags: ['Transition Offense', 'Fast Break'],
    gameRef: 'vs Prairie View A&M',
  },
  {
    id: 'bc-3',
    title: 'Zone Breakers — Grambling',
    date: '2025-01-30',
    duration: 210,
    thumbnailColor: '#4A3A2E',
    category: 'offense',
    status: 'in-progress',
    tags: ['Zone Defense', 'Offensive Sets'],
    gameRef: 'vs Grambling State',
  },
  {
    id: 'bc-4',
    title: 'Press Break Execution',
    date: '2025-01-26',
    duration: 165,
    thumbnailColor: '#2E2E4A',
    category: 'special',
    status: 'new',
    tags: ['Full-Court Press', 'Inbounds Plays'],
    gameRef: 'vs Southern',
  },
  {
    id: 'bc-5',
    title: 'Post Defense Breakdowns',
    date: '2025-01-19',
    duration: 195,
    thumbnailColor: '#4A2E3A',
    category: 'defense',
    status: 'watched',
    tags: ['Post-Up', 'Man-to-Man'],
    gameRef: 'vs Alcorn State',
  },
  {
    id: 'bc-6',
    title: 'Turnover Sequences — JSU',
    date: '2025-01-12',
    duration: 130,
    thumbnailColor: '#3A4A2E',
    category: 'transition',
    status: 'new',
    tags: ['Transition Defense', 'Turnovers'],
    gameRef: 'vs Jackson State',
  },
  {
    id: 'bc-7',
    title: 'End-of-Half Execution',
    date: '2025-02-08',
    duration: 90,
    thumbnailColor: '#4A4A2E',
    category: 'special',
    status: 'watched',
    tags: ['End of Clock', 'Half-Court Offense'],
    gameRef: 'vs Texas Southern',
  },
  {
    id: 'bc-8',
    title: 'Help Side Rotations Reel',
    date: '2025-02-05',
    duration: 155,
    thumbnailColor: '#2E3A3A',
    category: 'defense',
    status: 'in-progress',
    tags: ['Help & Recover', 'Zone Defense'],
    gameRef: 'vs Prairie View A&M',
  },
];

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
    speaker: 'Pastor Dipo Kalejaiye',
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
    speaker: 'Pastor Dipo Kalejaiye',
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
    speaker: 'Pastor Dipo Kalejaiye',
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
    speaker: 'Pastor Dipo Kalejaiye',
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
    speaker: 'Pastor Dipo Kalejaiye',
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
    facilitator: 'Pastor Dipo Kalejaiye',
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
    facilitator: 'Pastor & Mrs. Kalejaiye',
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
    professor: 'Dr. Marcus Thompson',
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
