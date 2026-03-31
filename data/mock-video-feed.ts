/**
 * Mock Video Feed Data — Instagram-style stories + posts for Video Home.
 * Mode-keyed exports for all 5 modes.
 */

import type { Mode } from '@/types';

export type StoryTag = 'Game' | 'Practice' | 'Clip' | 'Recruiting' | 'Service' | 'Sermon' | 'Worship' | 'Event' | 'Training' | 'Announcement';

export interface StoryClip {
  clipId: string;
  thumbnailColor: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  durationSeconds: number;
  tag: StoryTag;
  caption?: string;
  gameId?: string;
  playerId?: string;
}

export interface StoryCircle {
  id: string;
  name: string;
  initials: string;
  hasNew: boolean;
  isYou?: boolean;
  ringColor?: string;
  tag?: StoryTag;
  clips?: StoryClip[];
  visibilityClass?: 0 | 2 | 3;
  orgId?: string;
  programId?: string;
  publishedAt?: Date;
  expiresAt?: Date;
}

export interface FeedPostMedia {
  type: 'clip' | 'reel' | 'photo';
  title: string;
  thumbnailColor?: string;
  duration?: string;
  views?: number;
}

export interface VideoFeedPost {
  id: string;
  authorName: string;
  authorInitials: string;
  authorRole: string;
  timestamp: Date;
  caption: string;
  media?: FeedPostMedia;
  likes: number;
  comments: number;
  liked?: boolean;
  saved?: boolean;
  visibilityClass?: 0 | 2 | 3;
}

const now = new Date();
const ago = (minutes: number) => new Date(now.getTime() - minutes * 60000);
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000);
const expires = (published: Date) => new Date(published.getTime() + 24 * 3600000);

const MOCK_ORG = 'org-carroll';
const MOCK_PROGRAM = 'prog-mbb';

// =============================================================================
// SPORTS — Story Circles + Feed Posts
// Ordered: "Your Story" first, then newest publishedAt → oldest
// =============================================================================

export const STORY_CIRCLES: StoryCircle[] = [
  { id: 'st-you', name: 'Your Story', initials: 'AM', hasNew: false, isYou: true, ringColor: '#FFFFFF',
    orgId: MOCK_ORG, programId: MOCK_PROGRAM },
  {
    id: 'st-2', name: 'Coach Brooks', initials: 'CB', hasNew: true, ringColor: '#1A1714',
    tag: 'Game', visibilityClass: 0,
    orgId: MOCK_ORG, programId: MOCK_PROGRAM,
    publishedAt: hoursAgo(1), expiresAt: expires(hoursAgo(1)),
    clips: [
      { clipId: 'st2-c1', thumbnailColor: '#0F172A', durationSeconds: 12, tag: 'Game', caption: 'Transition D highlights vs Coastal' },
      { clipId: 'st2-c2', thumbnailColor: '#1A2332', durationSeconds: 18, tag: 'Game', caption: 'Key 4th quarter possessions' },
      { clipId: 'st2-c3', thumbnailColor: '#1E293B', durationSeconds: 10, tag: 'Game', caption: 'Post-game locker room' },
    ],
  },
  {
    id: 'st-1', name: 'Coach Miller', initials: 'CM', hasNew: true, ringColor: '#1A1714',
    tag: 'Practice', visibilityClass: 3,
    orgId: MOCK_ORG, programId: MOCK_PROGRAM,
    publishedAt: hoursAgo(2), expiresAt: expires(hoursAgo(2)),
    clips: [
      { clipId: 'st1-c1', thumbnailColor: '#1A2332', durationSeconds: 15, tag: 'Practice', caption: 'Half-court sets walkthrough' },
      { clipId: 'st1-c2', thumbnailColor: '#1E293B', durationSeconds: 20, tag: 'Practice', caption: 'Zone offense reps — looking sharp' },
    ],
  },
  {
    id: 'st-7', name: 'Staff Room', initials: 'SR', hasNew: true, ringColor: '#B8943E',
    tag: 'Recruiting', visibilityClass: 3,
    orgId: MOCK_ORG, programId: MOCK_PROGRAM,
    publishedAt: hoursAgo(3), expiresAt: expires(hoursAgo(3)),
    clips: [
      { clipId: 'st7-c1', thumbnailColor: '#422006', durationSeconds: 22, tag: 'Recruiting', caption: 'Top 5 portal targets — scouting notes' },
    ],
  },
  {
    id: 'st-3', name: 'E. Carter', initials: 'EC', hasNew: true, ringColor: '#5A8A6E',
    tag: 'Clip', visibilityClass: 0,
    orgId: MOCK_ORG, programId: MOCK_PROGRAM,
    publishedAt: hoursAgo(5), expiresAt: expires(hoursAgo(5)),
    clips: [
      { clipId: 'st3-c1', thumbnailColor: '#14532D', durationSeconds: 25, tag: 'Clip', caption: 'Pre-game workout session' },
    ],
  },
  {
    id: 'st-5', name: 'K. Mentor', initials: 'KM', hasNew: true, ringColor: '#1A1714',
    tag: 'Practice', visibilityClass: 3,
    orgId: MOCK_ORG, programId: MOCK_PROGRAM,
    publishedAt: hoursAgo(8), expiresAt: expires(hoursAgo(8)),
    clips: [
      { clipId: 'st5-c1', thumbnailColor: '#172554', durationSeconds: 18, tag: 'Practice', caption: 'Ball screen reads — film room cut' },
      { clipId: 'st5-c2', thumbnailColor: '#1E3A5F', durationSeconds: 14, tag: 'Clip', caption: 'Pregame warmup vibes' },
    ],
  },
  {
    id: 'st-4', name: 'E. Selden', initials: 'ES', hasNew: false,
    visibilityClass: 0,
    orgId: MOCK_ORG, programId: MOCK_PROGRAM,
    publishedAt: hoursAgo(14), expiresAt: expires(hoursAgo(14)),
    clips: [
      { clipId: 'st4-c1', thumbnailColor: '#1E293B', durationSeconds: 8, tag: 'Clip' },
    ],
  },
  {
    id: 'st-6', name: 'A. Noel', initials: 'AN', hasNew: false,
    visibilityClass: 0,
    orgId: MOCK_ORG, programId: MOCK_PROGRAM,
    publishedAt: hoursAgo(18), expiresAt: expires(hoursAgo(18)),
    clips: [
      { clipId: 'st6-c1', thumbnailColor: '#1E293B', durationSeconds: 10, tag: 'Clip' },
    ],
  },
  {
    id: 'st-8', name: 'Game Ops', initials: 'GO', hasNew: false,
    tag: 'Game', visibilityClass: 0,
    orgId: MOCK_ORG, programId: MOCK_PROGRAM,
    publishedAt: hoursAgo(22), expiresAt: expires(hoursAgo(22)),
    clips: [
      { clipId: 'st8-c1', thumbnailColor: '#1A1A2E', durationSeconds: 15, tag: 'Game', caption: 'Arena setup timelapse' },
      { clipId: 'st8-c2', thumbnailColor: '#16213E', durationSeconds: 12, tag: 'Game', caption: 'Halftime show prep' },
    ],
  },
];

export const VIDEO_FEED_POSTS: VideoFeedPost[] = [
  {
    id: 'vfp-1',
    authorName: 'Coach Brooks',
    authorInitials: 'CB',
    authorRole: 'Video Coord',
    timestamp: ago(15),
    caption: 'Transition defense breakdown from the Coastal Carolina game. Watch how we recover on the weak side — this is what we need Saturday.',
    media: { type: 'clip', title: 'Transition Defense — Coastal Carolina', thumbnailColor: '#0B0F14', duration: '4:12', views: 248 },
    likes: 12,
    comments: 4,
    visibilityClass: 3,
  },
  {
    id: 'vfp-2',
    authorName: 'Coach Miller',
    authorInitials: 'CM',
    authorRole: 'Assistant',
    timestamp: ago(45),
    caption: 'Updated the Campbell scouting cuts. Their zone press is the biggest concern — clip package is ready for film session.',
    media: { type: 'clip', title: 'Campbell Zone Press Breakdown', thumbnailColor: '#0B0F14', duration: '6:45', views: 184 },
    likes: 8,
    comments: 2,
    visibilityClass: 3,
  },
  {
    id: 'vfp-3',
    authorName: 'Elijah Carter',
    authorInitials: 'EC',
    authorRole: 'Player · #4',
    timestamp: ago(120),
    caption: 'Locked in. Getting extra reps before Saturday.',
    media: { type: 'reel', title: 'Pre-Game Workout', thumbnailColor: '#0B0F14', duration: '0:32', views: 1240 },
    likes: 24,
    comments: 7,
    liked: true,
    visibilityClass: 0,
  },
  {
    id: 'vfp-4',
    authorName: 'Carroll Athletics',
    authorInitials: 'CC',
    authorRole: 'System',
    timestamp: ago(180),
    caption: 'FINAL — Carroll 81, Coastal Carolina 74. FG: 48.3% | REB: 38 | AST: 19 | TO: 11. Full game highlights available.',
    media: { type: 'clip', title: 'Game Highlights — vs Coastal Carolina', thumbnailColor: '#0B0F14', duration: '8:22', views: 3420 },
    likes: 31,
    comments: 9,
    visibilityClass: 0,
  },
  {
    id: 'vfp-5',
    authorName: 'Coach Turner',
    authorInitials: 'CT',
    authorRole: 'Strength',
    timestamp: ago(300),
    caption: 'Marcus Johnson 3PT shooting — 7-day rolling avg up from 34.1% to 38.3%. Extra reps are paying off. Keep pushing.',
    likes: 15,
    comments: 3,
    visibilityClass: 3,
  },
  {
    id: 'vfp-6',
    authorName: 'Keon Mentor',
    authorInitials: 'KM',
    authorRole: 'Player · #11',
    timestamp: ago(420),
    caption: 'Ball screen reads from yesterday\'s practice. Working on making the right read every time.',
    media: { type: 'reel', title: 'Ball Screen Decision Making', thumbnailColor: '#0B0F14', duration: '0:48', views: 892 },
    likes: 18,
    comments: 5,
    liked: true,
    visibilityClass: 0,
  },
  {
    id: 'vfp-7',
    authorName: 'Coach Miller',
    authorInitials: 'CM',
    authorRole: 'Assistant',
    timestamp: ago(600),
    caption: 'Mid-range package highlights for Marcus Johnson. This pull-up game is getting dangerous.',
    media: { type: 'clip', title: 'Marcus Johnson — Mid-Range Package', thumbnailColor: '#0B0F14', duration: '3:18', views: 567 },
    likes: 22,
    comments: 6,
    saved: true,
    visibilityClass: 0,
  },
];

// =============================================================================
// CHURCH — Story Circles + Feed Posts
// =============================================================================

const CHURCH_ORG = 'org-2819church';
const CHURCH_CAMPUS = 'campus-main';

const CHURCH_STORY_CIRCLES: StoryCircle[] = [
  { id: 'cs-you', name: 'Your Story', initials: 'AM', hasNew: false, isYou: true, ringColor: '#FFFFFF',
    orgId: CHURCH_ORG, programId: CHURCH_CAMPUS },
  {
    id: 'cs-1', name: 'Pastor Philip', initials: 'PM', hasNew: true, ringColor: '#1A1714',
    tag: 'Sermon', visibilityClass: 0,
    orgId: CHURCH_ORG, programId: CHURCH_CAMPUS,
    publishedAt: hoursAgo(1), expiresAt: expires(hoursAgo(1)),
    clips: [
      { clipId: 'cs1-c1', thumbnailColor: '#1A1040', durationSeconds: 15, tag: 'Sermon', caption: 'Faith Forward Pt. 4 — key moment' },
      { clipId: 'cs1-c2', thumbnailColor: '#1E1248', durationSeconds: 20, tag: 'Sermon', caption: 'Altar call — powerful response' },
    ],
  },
  {
    id: 'cs-2', name: 'Worship Team', initials: 'WT', hasNew: true, ringColor: '#1A1714',
    tag: 'Worship', visibilityClass: 0,
    orgId: CHURCH_ORG, programId: CHURCH_CAMPUS,
    publishedAt: hoursAgo(2), expiresAt: expires(hoursAgo(2)),
    clips: [
      { clipId: 'cs2-c1', thumbnailColor: '#1A0F3A', durationSeconds: 18, tag: 'Worship', caption: 'Great Is Thy Faithfulness — live' },
      { clipId: 'cs2-c2', thumbnailColor: '#221450', durationSeconds: 14, tag: 'Worship', caption: 'Spontaneous worship moment' },
    ],
  },
  {
    id: 'cs-3', name: 'Youth Dir.', initials: 'YD', hasNew: true, ringColor: '#5A8A6E',
    tag: 'Event', visibilityClass: 3,
    orgId: CHURCH_ORG, programId: CHURCH_CAMPUS,
    publishedAt: hoursAgo(4), expiresAt: expires(hoursAgo(4)),
    clips: [
      { clipId: 'cs3-c1', thumbnailColor: '#0F2818', durationSeconds: 22, tag: 'Event', caption: 'Youth retreat bonfire night' },
    ],
  },
  {
    id: 'cs-4', name: 'Deacon Board', initials: 'DB', hasNew: false,
    tag: 'Announcement', visibilityClass: 2,
    orgId: CHURCH_ORG, programId: CHURCH_CAMPUS,
    publishedAt: hoursAgo(6), expiresAt: expires(hoursAgo(6)),
    clips: [
      { clipId: 'cs4-c1', thumbnailColor: '#1A1A2E', durationSeconds: 12, tag: 'Announcement', caption: 'Building fund update — March milestone' },
    ],
  },
  {
    id: 'cs-5', name: 'Outreach', initials: 'OR', hasNew: true, ringColor: '#B8943E',
    tag: 'Event', visibilityClass: 0,
    orgId: CHURCH_ORG, programId: CHURCH_CAMPUS,
    publishedAt: hoursAgo(8), expiresAt: expires(hoursAgo(8)),
    clips: [
      { clipId: 'cs5-c1', thumbnailColor: '#2A1A08', durationSeconds: 16, tag: 'Event', caption: 'Saturday outreach — 200 families served' },
      { clipId: 'cs5-c2', thumbnailColor: '#331E0A', durationSeconds: 12, tag: 'Event', caption: 'Prayer stations in the community' },
    ],
  },
  {
    id: 'cs-6', name: 'Women Min.', initials: 'WM', hasNew: true, ringColor: '#1A1714',
    tag: 'Event', visibilityClass: 2,
    orgId: CHURCH_ORG, programId: CHURCH_CAMPUS,
    publishedAt: hoursAgo(10), expiresAt: expires(hoursAgo(10)),
    clips: [
      { clipId: 'cs6-c1', thumbnailColor: '#1A1040', durationSeconds: 20, tag: 'Event', caption: 'Women\'s fellowship brunch highlights' },
    ],
  },
  {
    id: 'cs-7', name: 'Media Team', initials: 'MT', hasNew: false,
    tag: 'Announcement', visibilityClass: 2,
    orgId: CHURCH_ORG, programId: CHURCH_CAMPUS,
    publishedAt: hoursAgo(14), expiresAt: expires(hoursAgo(14)),
    clips: [
      { clipId: 'cs7-c1', thumbnailColor: '#16213E', durationSeconds: 10, tag: 'Announcement', caption: 'New camera setup — live stream upgrade' },
    ],
  },
  {
    id: 'cs-8', name: '2819 Church Live', initials: 'IC', hasNew: true, ringColor: '#1A1714',
    tag: 'Service', visibilityClass: 0,
    orgId: CHURCH_ORG, programId: CHURCH_CAMPUS,
    publishedAt: hoursAgo(3), expiresAt: expires(hoursAgo(3)),
    clips: [
      { clipId: 'cs8-c1', thumbnailColor: '#0F172A', durationSeconds: 25, tag: 'Service', caption: 'Sunday service opening — full house' },
      { clipId: 'cs8-c2', thumbnailColor: '#1A2332', durationSeconds: 18, tag: 'Service', caption: 'Praise break — the Spirit moved' },
    ],
  },
];

const CHURCH_FEED_POSTS: VideoFeedPost[] = [
  {
    id: 'cfp-1',
    authorName: 'Pastor Philip Anthony Mitchell',
    authorInitials: 'DK',
    authorRole: 'Senior Pastor',
    timestamp: ago(30),
    caption: '"Walking in Faith" — this week\'s message from the Faith Forward series. If you missed Sunday, catch the full sermon here.',
    media: { type: 'clip', title: 'Walking in Faith — Faith Forward Pt. 4', thumbnailColor: '#0B0F14', duration: '42:18', views: 1840 },
    likes: 89,
    comments: 14,
    visibilityClass: 0,
  },
  {
    id: 'cfp-2',
    authorName: 'Worship Team',
    authorInitials: 'WT',
    authorRole: 'Music Ministry',
    timestamp: ago(90),
    caption: 'Sunday worship highlights — "Great Is Thy Faithfulness" brought the house down. Praise was in the building.',
    media: { type: 'reel', title: 'Worship Highlights — Feb 15', thumbnailColor: '#0B0F14', duration: '3:12', views: 2450 },
    likes: 156,
    comments: 23,
    liked: true,
    visibilityClass: 0,
  },
  {
    id: 'cfp-3',
    authorName: '2819 Church Youth',
    authorInitials: 'YD',
    authorRole: 'Youth Ministry',
    timestamp: ago(240),
    caption: 'Youth retreat recap — 3 days of fellowship, worship, and growth. These kids showed up and showed out for God.',
    media: { type: 'clip', title: 'Youth Retreat 2026 — Full Recap', thumbnailColor: '#0B0F14', duration: '5:44', views: 987 },
    likes: 201,
    comments: 45,
    visibilityClass: 2,
  },
  {
    id: 'cfp-4',
    authorName: '2819 Church',
    authorInitials: '28',
    authorRole: 'System',
    timestamp: ago(360),
    caption: 'Baptism Sunday recap — 7 new believers publicly declared their faith. Watch the celebration.',
    media: { type: 'clip', title: 'Baptism Sunday — February 2026', thumbnailColor: '#0B0F14', duration: '12:35', views: 3120 },
    likes: 287,
    comments: 52,
    visibilityClass: 0,
  },
  {
    id: 'cfp-5',
    authorName: 'Deacon Williams',
    authorInitials: 'DW',
    authorRole: 'Deacon Board',
    timestamp: ago(480),
    caption: 'Community outreach highlights from Saturday. We served 200+ families with groceries and prayer. God is good.',
    media: { type: 'photo', title: 'Outreach Saturday — Feb 14', thumbnailColor: '#0B0F14' },
    likes: 134,
    comments: 18,
    visibilityClass: 0,
  },
  {
    id: 'cfp-6',
    authorName: 'Sister Adeyemi',
    authorInitials: 'SA',
    authorRole: 'Bible Study Lead',
    timestamp: ago(600),
    caption: 'Wednesday Bible Study recap — "The Armor of God" series continues. Ephesians 6:10-18 broke open for us.',
    media: { type: 'clip', title: 'Bible Study — Armor of God Pt. 3', thumbnailColor: '#0B0F14', duration: '38:22', views: 645 },
    likes: 67,
    comments: 11,
    saved: true,
    visibilityClass: 2,
  },
  {
    id: 'cfp-7',
    authorName: 'Media Team',
    authorInitials: 'MT',
    authorRole: 'Production',
    timestamp: ago(720),
    caption: 'Behind the scenes of our live stream upgrade. New cameras, new angles, same Spirit.',
    media: { type: 'reel', title: 'BTS — Stream Setup', thumbnailColor: '#0B0F14', duration: '1:15', views: 478 },
    likes: 45,
    comments: 8,
    visibilityClass: 2,
  },
];

// =============================================================================
// EDUCATION — Story Circles + Feed Posts
// =============================================================================

const EDUCATION_STORY_CIRCLES: StoryCircle[] = [
  { id: 'es-you', name: 'Your Story', initials: 'AM', hasNew: false, isYou: true, ringColor: '#FFFFFF' },
  { id: 'es-1', name: 'Dean Morris', initials: 'DM', hasNew: true, ringColor: '#1A1714' },
  { id: 'es-2', name: 'Prof. Adebayo', initials: 'PA', hasNew: true, ringColor: '#5A8A6E' },
  { id: 'es-3', name: 'Student Gov', initials: 'SG', hasNew: true, ringColor: '#B8943E' },
  { id: 'es-4', name: 'Howard Athletics', initials: 'HA', hasNew: true, ringColor: '#B85C5C' },
  { id: 'es-5', name: 'Campus Life', initials: 'CL', hasNew: false },
  { id: 'es-6', name: 'Library', initials: 'LB', hasNew: false },
  { id: 'es-7', name: 'Aviation Dept', initials: 'AV', hasNew: true, ringColor: '#1A1714' },
  { id: 'es-8', name: 'Alumni Assoc', initials: 'AA', hasNew: false },
];

const EDUCATION_FEED_POSTS: VideoFeedPost[] = [
  {
    id: 'efp-1',
    authorName: 'Howard Athletics',
    authorInitials: 'HA',
    authorRole: 'Athletics Department',
    timestamp: ago(20),
    caption: 'Fighting Saints basketball season highlights — 16-8, Frontier Conference contenders. This team is built different.',
    media: { type: 'clip', title: 'Fighting Saints 2025-26 Season Highlights', thumbnailColor: '#0B0F14', duration: '6:15', views: 4120 },
    likes: 312,
    comments: 47,
  },
  {
    id: 'efp-2',
    authorName: 'Howard University',
    authorInitials: 'HU',
    authorRole: 'University',
    timestamp: ago(150),
    caption: 'Spring 2026 campus tour — explore our Washington DC campus. New science building looking amazing.',
    media: { type: 'clip', title: 'Howard Campus Tour — Spring 2026', thumbnailColor: '#0B0F14', duration: '3:48', views: 2890 },
    likes: 145,
    comments: 18,
  },
  {
    id: 'efp-3',
    authorName: 'Aviation Program',
    authorInitials: 'AP',
    authorRole: 'Academics',
    timestamp: ago(300),
    caption: 'HBCU aviation excellence — first solo flights of the semester. Congratulations to our new pilots!',
    media: { type: 'reel', title: 'Solo Flight Day — Spring 2026', thumbnailColor: '#0B0F14', duration: '2:22', views: 5670 },
    likes: 487,
    comments: 62,
    liked: true,
  },
  {
    id: 'efp-4',
    authorName: 'Prof. Adebayo',
    authorInitials: 'PA',
    authorRole: 'Computer Science',
    timestamp: ago(420),
    caption: 'Lecture recording now available — "Introduction to Machine Learning" guest lecture. Great Q&A at the end.',
    media: { type: 'clip', title: 'CS 401 — Intro to Machine Learning', thumbnailColor: '#0B0F14', duration: '52:10', views: 890 },
    likes: 78,
    comments: 15,
  },
  {
    id: 'efp-5',
    authorName: 'Student Government',
    authorInitials: 'SG',
    authorRole: 'Student Council',
    timestamp: ago(540),
    caption: 'Homecoming 2026 highlight reel is HERE. What a week. Howard, we showed out.',
    media: { type: 'reel', title: 'Homecoming 2026 — Best Moments', thumbnailColor: '#0B0F14', duration: '4:45', views: 8340 },
    likes: 623,
    comments: 91,
    liked: true,
  },
  {
    id: 'efp-6',
    authorName: 'Howard University',
    authorInitials: 'HU',
    authorRole: 'System',
    timestamp: ago(660),
    caption: 'Dean\'s List ceremony — Spring 2026. 142 students recognized for academic excellence.',
    media: { type: 'clip', title: 'Dean\'s List Ceremony — Spring 2026', thumbnailColor: '#0B0F14', duration: '18:30', views: 1560 },
    likes: 198,
    comments: 34,
  },
  {
    id: 'efp-7',
    authorName: 'Research Office',
    authorInitials: 'RO',
    authorRole: 'Graduate Studies',
    timestamp: ago(780),
    caption: 'Student research presentations from the annual symposium. Outstanding work across all departments.',
    media: { type: 'clip', title: 'Research Symposium 2026 — Highlights', thumbnailColor: '#0B0F14', duration: '8:12', views: 670 },
    likes: 56,
    comments: 9,
    saved: true,
  },
];

// =============================================================================
// BUSINESS — Story Circles + Feed Posts
// =============================================================================

const BUSINESS_STORY_CIRCLES: StoryCircle[] = [
  { id: 'bs-you', name: 'Your Story', initials: 'AM', hasNew: false, isYou: true, ringColor: '#FFFFFF' },
  { id: 'bs-1', name: 'Alex M.', initials: 'AM', hasNew: true, ringColor: '#1A1714' },
  { id: 'bs-2', name: 'Product', initials: 'PR', hasNew: true, ringColor: '#5A8A6E' },
  { id: 'bs-3', name: 'Demo Day', initials: 'DD', hasNew: true, ringColor: '#B8943E' },
  { id: 'bs-4', name: 'Engineering', initials: 'EN', hasNew: true, ringColor: '#1A1714' },
  { id: 'bs-5', name: 'Marketing', initials: 'MK', hasNew: false },
  { id: 'bs-6', name: 'Investors', initials: 'IV', hasNew: false },
  { id: 'bs-7', name: 'Press', initials: 'PS', hasNew: true, ringColor: '#1A1714' },
  { id: 'bs-8', name: 'Culture', initials: 'CU', hasNew: false },
];

const BUSINESS_FEED_POSTS: VideoFeedPost[] = [
  {
    id: 'bfp-1',
    authorName: 'Valuetainment',
    authorInitials: 'VT',
    authorRole: 'Product',
    timestamp: ago(25),
    caption: 'Product demo walkthrough — V2 feature preview for investor partners. Mode switching, film room, and the new simulation engine.',
    media: { type: 'clip', title: 'Valuetainment V2 — Full Demo', thumbnailColor: '#0B0F14', duration: '14:32', views: 1240 },
    likes: 67,
    comments: 12,
  },
  {
    id: 'bfp-2',
    authorName: 'Alex Morgan',
    authorInitials: 'SK',
    authorRole: 'Founder & CEO',
    timestamp: ago(180),
    caption: 'Behind the scenes: building the sports OS that runs itself. Founder diary #12 — on focus and iteration.',
    media: { type: 'reel', title: 'Founder Diary #12', thumbnailColor: '#0B0F14', duration: '1:45', views: 3420 },
    likes: 134,
    comments: 28,
    liked: true,
  },
  {
    id: 'bfp-3',
    authorName: 'Valuetainment Press',
    authorInitials: 'VP',
    authorRole: 'Communications',
    timestamp: ago(360),
    caption: 'MLK Truth Classic announcement — 16-team tournament, $3M+ Year 1. Building something that matters.',
    media: { type: 'clip', title: 'MLK Truth Classic — Official Reveal', thumbnailColor: '#0B0F14', duration: '2:18', views: 5680 },
    likes: 203,
    comments: 41,
  },
  {
    id: 'bfp-4',
    authorName: 'Engineering',
    authorInitials: 'EN',
    authorRole: 'Team Update',
    timestamp: ago(480),
    caption: 'Sprint 14 demo — new bottom sheet system, pager view navigation, and the recruiting 4-view workspace. Ship it.',
    media: { type: 'clip', title: 'Sprint 14 Demo — Engineering', thumbnailColor: '#0B0F14', duration: '22:05', views: 890 },
    likes: 45,
    comments: 8,
  },
  {
    id: 'bfp-5',
    authorName: 'Customer Success',
    authorInitials: 'CS',
    authorRole: 'Partnerships',
    timestamp: ago(600),
    caption: 'Howard University testimonial — hear how Coach K uses Valuetainment to manage recruiting, film, and game planning.',
    media: { type: 'clip', title: 'Customer Story — Howard University', thumbnailColor: '#0B0F14', duration: '4:48', views: 2340 },
    likes: 112,
    comments: 19,
    saved: true,
  },
  {
    id: 'bfp-6',
    authorName: 'Marketing',
    authorInitials: 'MK',
    authorRole: 'Growth',
    timestamp: ago(720),
    caption: 'Conference highlight reel from HBCU Tech Summit. Valuetainment was the talk of the floor.',
    media: { type: 'reel', title: 'HBCU Tech Summit — Valuetainment Booth', thumbnailColor: '#0B0F14', duration: '0:58', views: 4560 },
    likes: 189,
    comments: 33,
  },
  {
    id: 'bfp-7',
    authorName: 'Valuetainment',
    authorInitials: 'VT',
    authorRole: 'System',
    timestamp: ago(900),
    caption: 'All-hands meeting recording now available. Q1 recap, Q2 roadmap, and team shoutouts inside.',
    media: { type: 'clip', title: 'All-Hands — February 2026', thumbnailColor: '#0B0F14', duration: '45:12', views: 780 },
    likes: 34,
    comments: 6,
  },
];

// =============================================================================
// COMMUNITY — Story Circles + Feed Posts
// =============================================================================

const COMMUNITY_STORY_CIRCLES: StoryCircle[] = [
  { id: 'ks-you', name: 'Your Story', initials: 'AM', hasNew: false, isYou: true, ringColor: '#FFFFFF' },
  { id: 'ks-1', name: 'Race Dir.', initials: 'RD', hasNew: true, ringColor: '#B85C5C' },
  { id: 'ks-2', name: 'M. Kane', initials: 'MK', hasNew: true, ringColor: '#B8943E' },
  { id: 'ks-3', name: 'Apex Racing', initials: 'AR', hasNew: true, ringColor: '#5A8A6E' },
  { id: 'ks-4', name: 'Onboards', initials: 'OB', hasNew: true, ringColor: '#1A1714' },
  { id: 'ks-5', name: 'Stewards', initials: 'ST', hasNew: false },
  { id: 'ks-6', name: 'Grid Girls', initials: 'GG', hasNew: false },
  { id: 'ks-7', name: '3SSB Live', initials: '3S', hasNew: true, ringColor: '#1A1714' },
  { id: 'ks-8', name: 'Fan Zone', initials: 'FZ', hasNew: false },
];

const COMMUNITY_FEED_POSTS: VideoFeedPost[] = [
  {
    id: 'kfp-1',
    authorName: 'Adidas 3SSB',
    authorInitials: '3S',
    authorRole: 'League',
    timestamp: ago(35),
    caption: 'Race 6 recap — Apex Racing dominates at Laguna Seca. Kane takes the checkered flag with a 2.4s gap. Championship lead extends to 18 points.',
    media: { type: 'clip', title: 'Race 6 Highlights — Laguna Seca', thumbnailColor: '#0B0F14', duration: '8:12', views: 12400 },
    likes: 543,
    comments: 89,
  },
  {
    id: 'kfp-2',
    authorName: 'Apex Racing',
    authorInitials: 'AR',
    authorRole: 'Team',
    timestamp: ago(120),
    caption: 'Car setup deep-dive — how we tuned for Laguna\'s corkscrew. Aero balance, suspension geometry, and tire strategy all played a role.',
    media: { type: 'clip', title: 'Setup Breakdown — Laguna Seca', thumbnailColor: '#0B0F14', duration: '4:56', views: 3450 },
    likes: 234,
    comments: 41,
  },
  {
    id: 'kfp-3',
    authorName: '3SSB Media',
    authorInitials: '3M',
    authorRole: 'Media',
    timestamp: ago(300),
    caption: 'Driver spotlight: Marcus Kane leads championship after 6 rounds. Onboard footage from his pole position qualifying lap.',
    media: { type: 'reel', title: 'Kane — Qualifying Onboard', thumbnailColor: '#0B0F14', duration: '1:38', views: 8900 },
    likes: 378,
    comments: 56,
    liked: true,
  },
  {
    id: 'kfp-4',
    authorName: 'Pit Lane',
    authorInitials: 'PL',
    authorRole: 'Broadcast',
    timestamp: ago(420),
    caption: 'Pit stop of the race — Apex Racing crew completes a 2.8s tire change under pressure. Watch the choreography.',
    media: { type: 'reel', title: 'Pit Stop Perfection — Race 6', thumbnailColor: '#0B0F14', duration: '0:45', views: 6780 },
    likes: 412,
    comments: 67,
  },
  {
    id: 'kfp-5',
    authorName: 'Adidas 3SSB',
    authorInitials: '3S',
    authorRole: 'System',
    timestamp: ago(540),
    caption: 'Podium ceremony — P1 Kane, P2 Reeves, P3 Tanaka. Full post-race interviews and champagne celebrations.',
    media: { type: 'clip', title: 'Podium Ceremony — Laguna Seca', thumbnailColor: '#0B0F14', duration: '6:30', views: 4560 },
    likes: 267,
    comments: 38,
  },
  {
    id: 'kfp-6',
    authorName: 'Track Walks',
    authorInitials: 'TW',
    authorRole: 'Content',
    timestamp: ago(660),
    caption: 'Pre-race track walk — Laguna Seca circuit breakdown. Turn-by-turn analysis with driver commentary.',
    media: { type: 'clip', title: 'Track Walk — Laguna Seca', thumbnailColor: '#0B0F14', duration: '12:18', views: 2340 },
    likes: 156,
    comments: 22,
    saved: true,
  },
  {
    id: 'kfp-7',
    authorName: 'Fan Zone',
    authorInitials: 'FZ',
    authorRole: 'Community',
    timestamp: ago(780),
    caption: 'Fan cam highlights from the grandstands. The energy at Turn 8 was absolutely electric.',
    media: { type: 'reel', title: 'Fan Cam — Race 6', thumbnailColor: '#0B0F14', duration: '2:05', views: 5120 },
    likes: 298,
    comments: 44,
  },
];

// =============================================================================
// MODE-KEYED EXPORTS
// =============================================================================

export const STORY_CIRCLES_BY_MODE: Record<Mode, StoryCircle[]> = {
  sports: STORY_CIRCLES,
  church: CHURCH_STORY_CIRCLES,
  education: EDUCATION_STORY_CIRCLES,
  business: BUSINESS_STORY_CIRCLES,
  competition: COMMUNITY_STORY_CIRCLES,
};

export const FEED_POSTS_BY_MODE: Record<Mode, VideoFeedPost[]> = {
  sports: VIDEO_FEED_POSTS,
  church: CHURCH_FEED_POSTS,
  education: EDUCATION_FEED_POSTS,
  business: BUSINESS_FEED_POSTS,
  competition: COMMUNITY_FEED_POSTS,
};
