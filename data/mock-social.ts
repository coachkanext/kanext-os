/**
 * Mock data for Social screen — stories, feed posts, reels.
 * Mode-aware: each mode has its own themed content.
 * Reels use actual video URLs from Mixkit (free, no watermark).
 */

import type { Mode } from '@/types';

// ── Types ──

export interface StoryUser {
  id: string;
  name: string;
  username: string;
  initials: string;
  isYou?: boolean;
  hasUnseenStory: boolean;
  storyFrames: StoryFrame[];
}

export interface StoryFrame {
  id: string;
  type: 'image' | 'video';
  uri: string;
  duration: number;
  timestamp: Date;
}

export interface FeedPost {
  id: string;
  author: PostAuthor;
  media: PostMedia[];
  caption: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  timestamp: Date;
}

export interface PostAuthor {
  id: string;
  name: string;
  username: string;
  initials: string;
}

export interface PostMedia {
  type: 'image' | 'video';
  uri: string;
  aspectRatio: number;
}

export interface SocialReel {
  id: string;
  creator: PostAuthor;
  videoUri: string;
  posterUri?: string;
  caption: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  musicTrack?: string;
}

// ── Helpers ──

// Unsplash direct image helper (public, hotlinkable)
const img = (id: string, w = 600, h = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&q=80`;

// Vertical image for stories / reel posters
const vimg = (id: string) => img(id, 400, 700);

// Mixkit video helper (720p for mobile)
const vid = (id: number) =>
  `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`;

// "You" story (same across modes)
const YOU: StoryUser = {
  id: 'su-you', name: 'You', username: '@you', initials: 'YO',
  isYou: true, hasUnseenStory: false, storyFrames: [],
};

// ═══════════════════════════════════════════════════════════════════════════
// SPORTS MODE
// ═══════════════════════════════════════════════════════════════════════════

const SPORTS_STORIES: StoryUser[] = [
  YOU,
  {
    id: 'ss2', name: 'Coach W', username: '@coachwilliams', initials: 'CW',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'ssf1', type: 'image', uri: vimg('photo-1546519638-68e109498ffc'), duration: 5000, timestamp: new Date('2026-03-08T08:00:00') },
      { id: 'ssf2', type: 'image', uri: vimg('photo-1504450758481-7338eba7524a'), duration: 5000, timestamp: new Date('2026-03-08T08:05:00') },
    ],
  },
  {
    id: 'ss3', name: 'Marcus J', username: '@mjohnson', initials: 'MJ',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'ssf3', type: 'image', uri: vimg('photo-1519861531473-9200262188bf'), duration: 5000, timestamp: new Date('2026-03-08T07:30:00') },
    ],
  },
  {
    id: 'ss4', name: 'James R', username: '@jrod23', initials: 'JR',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'ssf4', type: 'image', uri: vimg('photo-1574623452334-9e0bd3668cae'), duration: 5000, timestamp: new Date('2026-03-08T06:00:00') },
      { id: 'ssf5', type: 'image', uri: vimg('photo-1608245449230-4ac19066d2d0'), duration: 5000, timestamp: new Date('2026-03-08T06:10:00') },
    ],
  },
  {
    id: 'ss5', name: 'Tyler R', username: '@troberts', initials: 'TR',
    hasUnseenStory: false,
    storyFrames: [
      { id: 'ssf6', type: 'image', uri: vimg('photo-1552674605-db6ffd4facb5'), duration: 5000, timestamp: new Date('2026-03-07T20:00:00') },
    ],
  },
  {
    id: 'ss6', name: 'Sarah C', username: '@schen', initials: 'SC',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'ssf7', type: 'image', uri: vimg('photo-1534438327276-14e5300c3a48'), duration: 5000, timestamp: new Date('2026-03-08T09:00:00') },
    ],
  },
  {
    id: 'ss7', name: 'Deon W', username: '@dwilliams', initials: 'DW',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'ssf8', type: 'image', uri: vimg('photo-1461896836934-bd45ba8a0dce'), duration: 5000, timestamp: new Date('2026-03-08T10:00:00') },
    ],
  },
];

const SPORTS_FEED: FeedPost[] = [
  {
    id: 'sfp1',
    author: { id: 'sa1', name: 'Coach Williams', username: '@coachwilliams', initials: 'CW' },
    media: [{ type: 'image', uri: img('photo-1546519638-68e109498ffc'), aspectRatio: 1 }],
    caption: 'Great practice today! The team is looking sharp heading into the weekend.',
    likeCount: 142, commentCount: 23, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-08T14:30:00'),
  },
  {
    id: 'sfp2',
    author: { id: 'sa2', name: 'James Rodriguez', username: '@jrod23', initials: 'JR' },
    media: [{ type: 'image', uri: img('photo-1504450758481-7338eba7524a', 600, 750), aspectRatio: 1.25 }],
    caption: 'Film session with the squad. Breaking down plays for Friday night.',
    likeCount: 89, commentCount: 12, isLiked: true, isBookmarked: false,
    timestamp: new Date('2026-03-08T12:15:00'),
  },
  {
    id: 'sfp3',
    author: { id: 'sa3', name: 'Marcus Johnson', username: '@mjohnson', initials: 'MJ' },
    media: [{ type: 'image', uri: img('photo-1519861531473-9200262188bf'), aspectRatio: 1 }],
    caption: 'New kicks for the season. Who else is excited?',
    likeCount: 234, commentCount: 45, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-07T22:00:00'),
  },
  {
    id: 'sfp4',
    author: { id: 'sa4', name: 'Tyler Roberts', username: '@troberts', initials: 'TR' },
    media: [{ type: 'image', uri: img('photo-1574623452334-9e0bd3668cae', 600, 800), aspectRatio: 1.333 }],
    caption: 'Recovery day. Ice bath and stretching. The grind never stops.',
    likeCount: 156, commentCount: 28, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-07T18:30:00'),
  },
  {
    id: 'sfp5',
    author: { id: 'sa5', name: 'Sarah Chen', username: '@schen', initials: 'SC' },
    media: [{ type: 'image', uri: img('photo-1608245449230-4ac19066d2d0', 600, 400), aspectRatio: 0.667 }],
    caption: 'Data never lies. Prepping the analytics dashboard for the coaching staff.',
    likeCount: 45, commentCount: 6, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-07T11:00:00'),
  },
  {
    id: 'sfp6',
    author: { id: 'sa1', name: 'Coach Williams', username: '@coachwilliams', initials: 'CW' },
    media: [{ type: 'image', uri: img('photo-1552674605-db6ffd4facb5'), aspectRatio: 1 }],
    caption: 'Scouting trip highlights. Some real talent out there this year.',
    likeCount: 98, commentCount: 14, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-06T20:00:00'),
  },
  {
    id: 'sfp7',
    author: { id: 'sa2', name: 'James Rodriguez', username: '@jrod23', initials: 'JR' },
    media: [{ type: 'image', uri: img('photo-1461896836934-bd45ba8a0dce', 600, 750), aspectRatio: 1.25 }],
    caption: 'Behind the scenes at today\'s team photoshoot.',
    likeCount: 178, commentCount: 19, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-06T16:00:00'),
  },
  {
    id: 'sfp8',
    author: { id: 'sa6', name: 'Deon Williams', username: '@dwilliams', initials: 'DW' },
    media: [{ type: 'image', uri: img('photo-1534438327276-14e5300c3a48'), aspectRatio: 1 }],
    caption: 'Pregame focus. Nothing but the game on my mind tonight.',
    likeCount: 312, commentCount: 56, isLiked: true, isBookmarked: false,
    timestamp: new Date('2026-03-06T14:00:00'),
  },
];

const SPORTS_REELS: SocialReel[] = [
  {
    id: 'sr1',
    creator: { id: 'sa3', name: 'Marcus Johnson', username: '@mjohnson', initials: 'MJ' },
    videoUri: vid(44468), posterUri: vimg('photo-1546519638-68e109498ffc'),
    caption: 'Pregame warmup routine #gameday',
    likeCount: 1243, commentCount: 89, shareCount: 45,
    isLiked: false, isBookmarked: false,
    musicTrack: 'Original Audio - @mjohnson',
  },
  {
    id: 'sr2',
    creator: { id: 'sa1', name: 'Coach Williams', username: '@coachwilliams', initials: 'CW' },
    videoUri: vid(744), posterUri: vimg('photo-1504450758481-7338eba7524a'),
    caption: 'Play breakdown: the pick and roll that won the game',
    likeCount: 876, commentCount: 123, shareCount: 67,
    isLiked: true, isBookmarked: false,
    musicTrack: 'Coach Talk - @coachwilliams',
  },
  {
    id: 'sr3',
    creator: { id: 'sa2', name: 'James Rodriguez', username: '@jrod23', initials: 'JR' },
    videoUri: vid(44448), posterUri: vimg('photo-1519861531473-9200262188bf'),
    caption: 'Day in the life of a college athlete',
    likeCount: 2341, commentCount: 234, shareCount: 156,
    isLiked: false, isBookmarked: false,
    musicTrack: 'Trending Sound - Various',
  },
  {
    id: 'sr4',
    creator: { id: 'sa4', name: 'Tyler Roberts', username: '@troberts', initials: 'TR' },
    videoUri: vid(2273), posterUri: vimg('photo-1574623452334-9e0bd3668cae'),
    caption: 'Slam dunk practice after hours',
    likeCount: 3456, commentCount: 234, shareCount: 189,
    isLiked: false, isBookmarked: true,
    musicTrack: 'Hype Mix - DJ Athlete',
  },
  {
    id: 'sr5',
    creator: { id: 'sa5', name: 'Sarah Chen', username: '@schen', initials: 'SC' },
    videoUri: vid(45874), posterUri: vimg('photo-1552674605-db6ffd4facb5'),
    caption: 'Boxing conditioning for cross-training',
    likeCount: 567, commentCount: 45, shareCount: 23,
    isLiked: false, isBookmarked: false,
  },
  {
    id: 'sr6',
    creator: { id: 'sa6', name: 'Deon Williams', username: '@dwilliams', initials: 'DW' },
    videoUri: vid(608), posterUri: vimg('photo-1517649763962-0c623066013b'),
    caption: 'Morning run. Sunrise cardio hits different.',
    likeCount: 789, commentCount: 67, shareCount: 34,
    isLiked: false, isBookmarked: false,
    musicTrack: 'Lo-fi Running - Beats',
  },
  {
    id: 'sr7',
    creator: { id: 'sa2', name: 'James Rodriguez', username: '@jrod23', initials: 'JR' },
    videoUri: vid(43483), posterUri: vimg('photo-1461896836934-bd45ba8a0dce'),
    caption: 'Soccer cross-training with the squad',
    likeCount: 432, commentCount: 56, shareCount: 28,
    isLiked: false, isBookmarked: false,
  },
  {
    id: 'sr8',
    creator: { id: 'sa3', name: 'Marcus Johnson', username: '@mjohnson', initials: 'MJ' },
    videoUri: vid(52104), posterUri: vimg('photo-1534438327276-14e5300c3a48'),
    caption: 'Medicine ball drills for explosive power',
    likeCount: 654, commentCount: 78, shareCount: 41,
    isLiked: false, isBookmarked: false,
    musicTrack: 'Workout Mix - DJ Pump',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// CHURCH MODE
// ═══════════════════════════════════════════════════════════════════════════

const CHURCH_STORIES: StoryUser[] = [
  YOU,
  {
    id: 'cs2', name: 'Pastor D', username: '@pastordavis', initials: 'PD',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'csf1', type: 'image', uri: vimg('photo-1438032005730-c779502df39b'), duration: 5000, timestamp: new Date('2026-03-08T08:00:00') },
      { id: 'csf2', type: 'image', uri: vimg('photo-1478737270239-2f02b77fc618'), duration: 5000, timestamp: new Date('2026-03-08T08:05:00') },
    ],
  },
  {
    id: 'cs3', name: 'Grace M', username: '@gracemiller', initials: 'GM',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'csf3', type: 'image', uri: vimg('photo-1507692049790-de58290a4334'), duration: 5000, timestamp: new Date('2026-03-08T07:30:00') },
    ],
  },
  {
    id: 'cs4', name: 'David T', username: '@dthompson', initials: 'DT',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'csf4', type: 'image', uri: vimg('photo-1516450360452-9312f5e86fc7'), duration: 5000, timestamp: new Date('2026-03-08T06:00:00') },
    ],
  },
  {
    id: 'cs5', name: 'Sister Joy', username: '@sisterjoy', initials: 'SJ',
    hasUnseenStory: false,
    storyFrames: [
      { id: 'csf5', type: 'image', uri: vimg('photo-1470229722913-7c0e2dbbafd3'), duration: 5000, timestamp: new Date('2026-03-07T20:00:00') },
    ],
  },
  {
    id: 'cs6', name: 'Rachel G', username: '@rgreen', initials: 'RG',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'csf6', type: 'image', uri: vimg('photo-1529070538774-1843cb3265df'), duration: 5000, timestamp: new Date('2026-03-08T09:00:00') },
    ],
  },
  {
    id: 'cs7', name: 'Elder J', username: '@elderjames', initials: 'EJ',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'csf7', type: 'image', uri: vimg('photo-1501281668745-f7f57925c3b4'), duration: 5000, timestamp: new Date('2026-03-08T10:00:00') },
    ],
  },
];

const CHURCH_FEED: FeedPost[] = [
  {
    id: 'cfp1',
    author: { id: 'ca1', name: 'Pastor Davis', username: '@pastordavis', initials: 'PD' },
    media: [{ type: 'image', uri: img('photo-1438032005730-c779502df39b'), aspectRatio: 1 }],
    caption: 'Sunday service was incredible. Thank you to everyone who came out.',
    likeCount: 312, commentCount: 56, isLiked: true, isBookmarked: false,
    timestamp: new Date('2026-03-08T15:00:00'),
  },
  {
    id: 'cfp2',
    author: { id: 'ca2', name: 'Grace Miller', username: '@gracemiller', initials: 'GM' },
    media: [{ type: 'image', uri: img('photo-1516450360452-9312f5e86fc7', 600, 750), aspectRatio: 1.25 }],
    caption: 'Worship practice for the Easter service. It\'s going to be special.',
    likeCount: 201, commentCount: 34, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-08T12:00:00'),
  },
  {
    id: 'cfp3',
    author: { id: 'ca3', name: 'David Thompson', username: '@dthompson', initials: 'DT' },
    media: [{ type: 'image', uri: img('photo-1470229722913-7c0e2dbbafd3'), aspectRatio: 1 }],
    caption: 'The choir sounded amazing today. Voices lifted in unison.',
    likeCount: 178, commentCount: 23, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-07T22:00:00'),
  },
  {
    id: 'cfp4',
    author: { id: 'ca4', name: 'Sister Joy', username: '@sisterjoy', initials: 'SJ' },
    media: [{ type: 'image', uri: img('photo-1529070538774-1843cb3265df', 600, 800), aspectRatio: 1.333 }],
    caption: 'Community outreach this weekend. 200 meals served. Grateful hearts.',
    likeCount: 456, commentCount: 67, isLiked: false, isBookmarked: true,
    timestamp: new Date('2026-03-07T18:00:00'),
  },
  {
    id: 'cfp5',
    author: { id: 'ca5', name: 'Rachel Green', username: '@rgreen', initials: 'RG' },
    media: [{ type: 'image', uri: img('photo-1507692049790-de58290a4334', 600, 400), aspectRatio: 0.667 }],
    caption: 'Quiet moments in the sanctuary. Finding peace in stillness.',
    likeCount: 89, commentCount: 12, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-07T11:00:00'),
  },
  {
    id: 'cfp6',
    author: { id: 'ca1', name: 'Pastor Davis', username: '@pastordavis', initials: 'PD' },
    media: [{ type: 'image', uri: img('photo-1478737270239-2f02b77fc618'), aspectRatio: 1 }],
    caption: 'Bible study tonight was powerful. Iron sharpens iron.',
    likeCount: 234, commentCount: 45, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-06T20:00:00'),
  },
  {
    id: 'cfp7',
    author: { id: 'ca6', name: 'Elder James', username: '@elderjames', initials: 'EJ' },
    media: [{ type: 'image', uri: img('photo-1501281668745-f7f57925c3b4', 600, 750), aspectRatio: 1.25 }],
    caption: 'Youth retreat photos are in. These kids are the future.',
    likeCount: 345, commentCount: 28, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-06T16:00:00'),
  },
  {
    id: 'cfp8',
    author: { id: 'ca2', name: 'Grace Miller', username: '@gracemiller', initials: 'GM' },
    media: [{ type: 'image', uri: img('photo-1470229722913-7c0e2dbbafd3'), aspectRatio: 1 }],
    caption: 'New worship album dropping next month. Sneak peek at the studio session.',
    likeCount: 567, commentCount: 89, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-06T14:00:00'),
  },
];

const CHURCH_REELS: SocialReel[] = [
  {
    id: 'cr1',
    creator: { id: 'ca2', name: 'Grace Miller', username: '@gracemiller', initials: 'GM' },
    videoUri: vid(14084), posterUri: vimg('photo-1516450360452-9312f5e86fc7'),
    caption: 'Praise and worship night was everything',
    likeCount: 3456, commentCount: 456, shareCount: 234,
    isLiked: false, isBookmarked: true,
    musicTrack: 'How Great Is Our God - Worship',
  },
  {
    id: 'cr2',
    creator: { id: 'ca1', name: 'Pastor Davis', username: '@pastordavis', initials: 'PD' },
    videoUri: vid(29425), posterUri: vimg('photo-1507692049790-de58290a4334'),
    caption: '60 seconds of encouragement for your day',
    likeCount: 2341, commentCount: 234, shareCount: 156,
    isLiked: false, isBookmarked: false,
    musicTrack: 'Peaceful Piano - Ambient',
  },
  {
    id: 'cr3',
    creator: { id: 'ca3', name: 'David Thompson', username: '@dthompson', initials: 'DT' },
    videoUri: vid(11942), posterUri: vimg('photo-1470229722913-7c0e2dbbafd3'),
    caption: 'Stage setup for Easter weekend. This is going to be incredible.',
    likeCount: 876, commentCount: 89, shareCount: 45,
    isLiked: true, isBookmarked: false,
    musicTrack: 'Original Audio - @dthompson',
  },
  {
    id: 'cr4',
    creator: { id: 'ca5', name: 'Rachel Green', username: '@rgreen', initials: 'RG' },
    videoUri: vid(14106), posterUri: vimg('photo-1501281668745-f7f57925c3b4'),
    caption: 'Worship team rehearsal. New song drops Sunday.',
    likeCount: 1234, commentCount: 123, shareCount: 67,
    isLiked: false, isBookmarked: false,
    musicTrack: 'New Song Preview - Worship Team',
  },
  {
    id: 'cr5',
    creator: { id: 'ca4', name: 'Sister Joy', username: '@sisterjoy', initials: 'SJ' },
    videoUri: vid(4392), posterUri: vimg('photo-1438032005730-c779502df39b'),
    caption: 'Beautiful evening at the church. Grateful for this community.',
    likeCount: 567, commentCount: 45, shareCount: 23,
    isLiked: false, isBookmarked: false,
  },
  {
    id: 'cr6',
    creator: { id: 'ca6', name: 'Elder James', username: '@elderjames', initials: 'EJ' },
    videoUri: vid(23404), posterUri: vimg('photo-1478737270239-2f02b77fc618'),
    caption: 'Family devotional moment. Teaching the next generation.',
    likeCount: 789, commentCount: 67, shareCount: 34,
    isLiked: false, isBookmarked: false,
    musicTrack: 'Grace Upon Grace - Worship',
  },
  {
    id: 'cr7',
    creator: { id: 'ca2', name: 'Grace Miller', username: '@gracemiller', initials: 'GM' },
    videoUri: vid(48507), posterUri: vimg('photo-1529070538774-1843cb3265df'),
    caption: 'Youth night was on fire. These kids know how to worship.',
    likeCount: 1567, commentCount: 178, shareCount: 89,
    isLiked: false, isBookmarked: false,
    musicTrack: 'Youth Night Vibes - DJ Praise',
  },
  {
    id: 'cr8',
    creator: { id: 'ca1', name: 'Pastor Davis', username: '@pastordavis', initials: 'PD' },
    videoUri: vid(22707), posterUri: vimg('photo-1507692049790-de58290a4334'),
    caption: 'The architecture of faith. Every detail tells a story.',
    likeCount: 654, commentCount: 56, shareCount: 28,
    isLiked: false, isBookmarked: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// EDUCATION MODE
// ═══════════════════════════════════════════════════════════════════════════

const EDUCATION_STORIES: StoryUser[] = [
  YOU,
  {
    id: 'es2', name: 'Dr. Wilson', username: '@drwilson', initials: 'DW',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'esf1', type: 'image', uri: vimg('photo-1524178232363-1fb2b075b655'), duration: 5000, timestamp: new Date('2026-03-08T08:00:00') },
      { id: 'esf2', type: 'image', uri: vimg('photo-1497633762265-9d179a990aa6'), duration: 5000, timestamp: new Date('2026-03-08T08:05:00') },
    ],
  },
  {
    id: 'es3', name: 'Sophia L', username: '@sophialee', initials: 'SL',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'esf3', type: 'image', uri: vimg('photo-1541339907198-e08756dedf3f'), duration: 5000, timestamp: new Date('2026-03-08T07:30:00') },
    ],
  },
  {
    id: 'es4', name: 'Dean M', username: '@deanmitchell', initials: 'DM',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'esf4', type: 'image', uri: vimg('photo-1523050854058-8df90110c9f1'), duration: 5000, timestamp: new Date('2026-03-08T06:00:00') },
    ],
  },
  {
    id: 'es5', name: 'Maya C', username: '@mayachen', initials: 'MC',
    hasUnseenStory: false,
    storyFrames: [
      { id: 'esf5', type: 'image', uri: vimg('photo-1481627834876-b7833e8f5570'), duration: 5000, timestamp: new Date('2026-03-07T20:00:00') },
    ],
  },
  {
    id: 'es6', name: 'Prof. T', username: '@proftaylor', initials: 'PT',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'esf6', type: 'image', uri: vimg('photo-1524178232363-1fb2b075b655'), duration: 5000, timestamp: new Date('2026-03-08T09:00:00') },
    ],
  },
  {
    id: 'es7', name: 'Jordan H', username: '@jhart', initials: 'JH',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'esf7', type: 'image', uri: vimg('photo-1497633762265-9d179a990aa6'), duration: 5000, timestamp: new Date('2026-03-08T10:00:00') },
    ],
  },
];

const EDUCATION_FEED: FeedPost[] = [
  {
    id: 'efp1',
    author: { id: 'ea1', name: 'Dr. Wilson', username: '@drwilson', initials: 'DW' },
    media: [{ type: 'image', uri: img('photo-1524178232363-1fb2b075b655'), aspectRatio: 1 }],
    caption: 'Fascinating lecture today on quantum computing. The future is here.',
    likeCount: 142, commentCount: 23, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-08T14:30:00'),
  },
  {
    id: 'efp2',
    author: { id: 'ea2', name: 'Sophia Lee', username: '@sophialee', initials: 'SL' },
    media: [{ type: 'image', uri: img('photo-1541339907198-e08756dedf3f', 600, 750), aspectRatio: 1.25 }],
    caption: 'Graduation is around the corner. Can\'t believe it\'s finally happening!',
    likeCount: 567, commentCount: 89, isLiked: true, isBookmarked: false,
    timestamp: new Date('2026-03-08T12:15:00'),
  },
  {
    id: 'efp3',
    author: { id: 'ea3', name: 'Dean Mitchell', username: '@deanmitchell', initials: 'DM' },
    media: [{ type: 'image', uri: img('photo-1523050854058-8df90110c9f1'), aspectRatio: 1 }],
    caption: 'Campus looking beautiful this spring. Come visit us at the open house.',
    likeCount: 234, commentCount: 34, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-07T22:00:00'),
  },
  {
    id: 'efp4',
    author: { id: 'ea4', name: 'Maya Chen', username: '@mayachen', initials: 'MC' },
    media: [{ type: 'image', uri: img('photo-1497633762265-9d179a990aa6', 600, 800), aspectRatio: 1.333 }],
    caption: 'Study session at the library. Finals week prep starts early.',
    likeCount: 89, commentCount: 12, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-07T18:00:00'),
  },
  {
    id: 'efp5',
    author: { id: 'ea5', name: 'Prof. Taylor', username: '@proftaylor', initials: 'PT' },
    media: [{ type: 'image', uri: img('photo-1481627834876-b7833e8f5570', 600, 400), aspectRatio: 0.667 }],
    caption: 'New additions to the curriculum reading list. Essential reads for fall.',
    likeCount: 67, commentCount: 8, isLiked: false, isBookmarked: true,
    timestamp: new Date('2026-03-07T11:00:00'),
  },
  {
    id: 'efp6',
    author: { id: 'ea2', name: 'Sophia Lee', username: '@sophialee', initials: 'SL' },
    media: [{ type: 'image', uri: img('photo-1524178232363-1fb2b075b655'), aspectRatio: 1 }],
    caption: 'Research presentation went well. Months of work paying off.',
    likeCount: 345, commentCount: 45, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-06T20:00:00'),
  },
  {
    id: 'efp7',
    author: { id: 'ea6', name: 'Jordan Hart', username: '@jhart', initials: 'JH' },
    media: [{ type: 'image', uri: img('photo-1523050854058-8df90110c9f1', 600, 750), aspectRatio: 1.25 }],
    caption: 'Student council meeting. Big plans for spring fest.',
    likeCount: 123, commentCount: 19, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-06T16:00:00'),
  },
  {
    id: 'efp8',
    author: { id: 'ea1', name: 'Dr. Wilson', username: '@drwilson', initials: 'DW' },
    media: [{ type: 'image', uri: img('photo-1497633762265-9d179a990aa6'), aspectRatio: 1 }],
    caption: 'Lab results are in. The experiment was a success.',
    likeCount: 198, commentCount: 28, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-06T14:00:00'),
  },
];

const EDUCATION_REELS: SocialReel[] = [
  {
    id: 'er1',
    creator: { id: 'ea2', name: 'Sophia Lee', username: '@sophialee', initials: 'SL' },
    videoUri: vid(4519), posterUri: vimg('photo-1523050854058-8df90110c9f1'),
    caption: 'Morning walk across campus. Best part of the day.',
    likeCount: 1234, commentCount: 89, shareCount: 45,
    isLiked: false, isBookmarked: false,
    musicTrack: 'Campus Vibes - Lo-fi',
  },
  {
    id: 'er2',
    creator: { id: 'ea4', name: 'Maya Chen', username: '@mayachen', initials: 'MC' },
    videoUri: vid(21595), posterUri: vimg('photo-1481627834876-b7833e8f5570'),
    caption: 'Library tour for the new students. Welcome home.',
    likeCount: 876, commentCount: 67, shareCount: 34,
    isLiked: false, isBookmarked: false,
    musicTrack: 'Study Session - Ambient',
  },
  {
    id: 'er3',
    creator: { id: 'ea1', name: 'Dr. Wilson', username: '@drwilson', initials: 'DW' },
    videoUri: vid(48165), posterUri: vimg('photo-1524178232363-1fb2b075b655'),
    caption: 'Behind the scenes of today\'s lecture. Knowledge is power.',
    likeCount: 567, commentCount: 45, shareCount: 23,
    isLiked: true, isBookmarked: false,
    musicTrack: 'Original Audio - @drwilson',
  },
  {
    id: 'er4',
    creator: { id: 'ea6', name: 'Jordan Hart', username: '@jhart', initials: 'JH' },
    videoUri: vid(4520), posterUri: vimg('photo-1541339907198-e08756dedf3f'),
    caption: 'Campus garden study spot. Straight vibes.',
    likeCount: 2341, commentCount: 234, shareCount: 156,
    isLiked: false, isBookmarked: true,
    musicTrack: 'Chill Beats - Study Mix',
  },
  {
    id: 'er5',
    creator: { id: 'ea5', name: 'Prof. Taylor', username: '@proftaylor', initials: 'PT' },
    videoUri: vid(45831), posterUri: vimg('photo-1497633762265-9d179a990aa6'),
    caption: 'Rare book collection walkthrough. History in your hands.',
    likeCount: 432, commentCount: 34, shareCount: 18,
    isLiked: false, isBookmarked: false,
  },
  {
    id: 'er6',
    creator: { id: 'ea2', name: 'Sophia Lee', username: '@sophialee', initials: 'SL' },
    videoUri: vid(722), posterUri: vimg('photo-1523050854058-8df90110c9f1'),
    caption: 'Morning jog on campus track. Clear mind, ready to learn.',
    likeCount: 654, commentCount: 56, shareCount: 28,
    isLiked: false, isBookmarked: false,
    musicTrack: 'Morning Run - Lo-fi',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// BUSINESS MODE
// ═══════════════════════════════════════════════════════════════════════════

const BUSINESS_STORIES: StoryUser[] = [
  YOU,
  {
    id: 'bs2', name: 'Sarah C', username: '@sarahceo', initials: 'SC',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'bsf1', type: 'image', uri: vimg('photo-1497366216548-37526070297c'), duration: 5000, timestamp: new Date('2026-03-08T08:00:00') },
      { id: 'bsf2', type: 'image', uri: vimg('photo-1560472355-536de3962603'), duration: 5000, timestamp: new Date('2026-03-08T08:05:00') },
    ],
  },
  {
    id: 'bs3', name: 'Lisa P', username: '@lisapark', initials: 'LP',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'bsf3', type: 'image', uri: vimg('photo-1497215842964-222b430dc094'), duration: 5000, timestamp: new Date('2026-03-08T07:30:00') },
    ],
  },
  {
    id: 'bs4', name: 'Mark D', username: '@markdavis', initials: 'MD',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'bsf4', type: 'image', uri: vimg('photo-1552664730-d307ca884978'), duration: 5000, timestamp: new Date('2026-03-08T06:00:00') },
    ],
  },
  {
    id: 'bs5', name: 'Emma W', username: '@emmaw', initials: 'EW',
    hasUnseenStory: false,
    storyFrames: [
      { id: 'bsf5', type: 'image', uri: vimg('photo-1522071820081-009f0129c71c'), duration: 5000, timestamp: new Date('2026-03-07T20:00:00') },
    ],
  },
  {
    id: 'bs6', name: 'Jason L', username: '@jasonlee', initials: 'JL',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'bsf6', type: 'image', uri: vimg('photo-1497366216548-37526070297c'), duration: 5000, timestamp: new Date('2026-03-08T09:00:00') },
    ],
  },
  {
    id: 'bs7', name: 'Amy J', username: '@amydesign', initials: 'AJ',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'bsf7', type: 'image', uri: vimg('photo-1560472355-536de3962603'), duration: 5000, timestamp: new Date('2026-03-08T10:00:00') },
    ],
  },
];

const BUSINESS_FEED: FeedPost[] = [
  {
    id: 'bfp1',
    author: { id: 'ba1', name: 'Sarah Chen', username: '@sarahceo', initials: 'SC' },
    media: [{ type: 'image', uri: img('photo-1497366216548-37526070297c'), aspectRatio: 1 }],
    caption: 'Q1 numbers are in and they are looking good. Proud of this team.',
    likeCount: 234, commentCount: 45, isLiked: false, isBookmarked: true,
    timestamp: new Date('2026-03-08T14:30:00'),
  },
  {
    id: 'bfp2',
    author: { id: 'ba2', name: 'Lisa Park', username: '@lisapark', initials: 'LP' },
    media: [{ type: 'image', uri: img('photo-1560472355-536de3962603', 600, 750), aspectRatio: 1.25 }],
    caption: 'Product roadmap session. Big things coming in Q2.',
    likeCount: 156, commentCount: 28, isLiked: true, isBookmarked: false,
    timestamp: new Date('2026-03-08T12:15:00'),
  },
  {
    id: 'bfp3',
    author: { id: 'ba3', name: 'Mark Davis', username: '@markdavis', initials: 'MD' },
    media: [{ type: 'image', uri: img('photo-1552664730-d307ca884978'), aspectRatio: 1 }],
    caption: 'Team all-hands today. Alignment across the board.',
    likeCount: 89, commentCount: 12, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-07T22:00:00'),
  },
  {
    id: 'bfp4',
    author: { id: 'ba4', name: 'Emma Watson', username: '@emmaw', initials: 'EW' },
    media: [{ type: 'image', uri: img('photo-1522071820081-009f0129c71c', 600, 800), aspectRatio: 1.333 }],
    caption: 'New campaign goes live Monday. The creative team crushed it.',
    likeCount: 345, commentCount: 56, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-07T18:00:00'),
  },
  {
    id: 'bfp5',
    author: { id: 'ba5', name: 'Jason Lee', username: '@jasonlee', initials: 'JL' },
    media: [{ type: 'image', uri: img('photo-1497215842964-222b430dc094', 600, 400), aspectRatio: 0.667 }],
    caption: 'Deep dive into the analytics. Some surprising trends emerging.',
    likeCount: 67, commentCount: 8, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-07T11:00:00'),
  },
  {
    id: 'bfp6',
    author: { id: 'ba1', name: 'Sarah Chen', username: '@sarahceo', initials: 'SC' },
    media: [{ type: 'image', uri: img('photo-1560472355-536de3962603'), aspectRatio: 1 }],
    caption: 'Board meeting wrapped. Strategic direction is set for the year.',
    likeCount: 198, commentCount: 34, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-06T20:00:00'),
  },
  {
    id: 'bfp7',
    author: { id: 'ba6', name: 'Amy Johnson', username: '@amydesign', initials: 'AJ' },
    media: [{ type: 'image', uri: img('photo-1552664730-d307ca884978', 600, 750), aspectRatio: 1.25 }],
    caption: 'Design sprint outcomes. Three new concepts heading to prototype.',
    likeCount: 123, commentCount: 19, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-06T16:00:00'),
  },
  {
    id: 'bfp8',
    author: { id: 'ba2', name: 'Lisa Park', username: '@lisapark', initials: 'LP' },
    media: [{ type: 'image', uri: img('photo-1497366216548-37526070297c'), aspectRatio: 1 }],
    caption: 'Office tour for the new hires. Welcome to the team!',
    likeCount: 456, commentCount: 67, isLiked: false, isBookmarked: false,
    timestamp: new Date('2026-03-06T14:00:00'),
  },
];

const BUSINESS_REELS: SocialReel[] = [
  {
    id: 'br1',
    creator: { id: 'ba2', name: 'Lisa Park', username: '@lisapark', initials: 'LP' },
    videoUri: vid(4809), posterUri: vimg('photo-1560472355-536de3962603'),
    caption: 'Office tour: where the magic happens',
    likeCount: 567, commentCount: 45, shareCount: 23,
    isLiked: false, isBookmarked: false,
  },
  {
    id: 'br2',
    creator: { id: 'ba1', name: 'Sarah Chen', username: '@sarahceo', initials: 'SC' },
    videoUri: vid(914), posterUri: vimg('photo-1497366216548-37526070297c'),
    caption: 'A day in the open office. Innovation happens here.',
    likeCount: 876, commentCount: 89, shareCount: 45,
    isLiked: true, isBookmarked: false,
    musicTrack: 'Office Vibes - Lo-fi',
  },
  {
    id: 'br3',
    creator: { id: 'ba3', name: 'Mark Davis', username: '@markdavis', initials: 'MD' },
    videoUri: vid(13218), posterUri: vimg('photo-1552664730-d307ca884978'),
    caption: 'Sunset strategy session. Best ideas come after hours.',
    likeCount: 1234, commentCount: 123, shareCount: 67,
    isLiked: false, isBookmarked: false,
    musicTrack: 'Hustle & Flow - Beats',
  },
  {
    id: 'br4',
    creator: { id: 'ba4', name: 'Emma Watson', username: '@emmaw', initials: 'EW' },
    videoUri: vid(42664), posterUri: vimg('photo-1522071820081-009f0129c71c'),
    caption: 'Behind the numbers. Data-driven decisions every day.',
    likeCount: 432, commentCount: 34, shareCount: 18,
    isLiked: false, isBookmarked: true,
    musicTrack: 'Original Audio - @emmaw',
  },
  {
    id: 'br5',
    creator: { id: 'ba5', name: 'Jason Lee', username: '@jasonlee', initials: 'JL' },
    videoUri: vid(40766), posterUri: vimg('photo-1497215842964-222b430dc094'),
    caption: 'Morning commute jog. Work-life balance is real.',
    likeCount: 654, commentCount: 56, shareCount: 28,
    isLiked: false, isBookmarked: false,
    musicTrack: 'Morning Run - Beats',
  },
  {
    id: 'br6',
    creator: { id: 'ba6', name: 'Amy Johnson', username: '@amydesign', initials: 'AJ' },
    videoUri: vid(606), posterUri: vimg('photo-1497366216548-37526070297c'),
    caption: 'Pre-work cardio. Start the day strong, finish stronger.',
    likeCount: 789, commentCount: 67, shareCount: 34,
    isLiked: false, isBookmarked: false,
    musicTrack: 'Energy Mix - DJ Focus',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MODE MAPS + GETTERS
// ═══════════════════════════════════════════════════════════════════════════

const STORIES_BY_MODE: Record<Mode, StoryUser[]> = {
  sports: SPORTS_STORIES,
  church: CHURCH_STORIES,
  education: EDUCATION_STORIES,
  business: BUSINESS_STORIES,
};

const FEED_BY_MODE: Record<Mode, FeedPost[]> = {
  sports: SPORTS_FEED,
  church: CHURCH_FEED,
  education: EDUCATION_FEED,
  business: BUSINESS_FEED,
};

const REELS_BY_MODE: Record<Mode, SocialReel[]> = {
  sports: SPORTS_REELS,
  church: CHURCH_REELS,
  education: EDUCATION_REELS,
  business: BUSINESS_REELS,
};

export function getStories(mode?: Mode): StoryUser[] {
  return STORIES_BY_MODE[mode ?? 'sports'];
}

export function getFeedPosts(mode?: Mode): FeedPost[] {
  return FEED_BY_MODE[mode ?? 'sports'];
}

export function getReels(mode?: Mode): SocialReel[] {
  return REELS_BY_MODE[mode ?? 'sports'];
}

export function formatPostTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
