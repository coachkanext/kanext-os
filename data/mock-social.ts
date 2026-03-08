/**
 * Mock data for Social screen — stories, feed posts, reels.
 * Placeholder images from picsum.photos.
 */

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
  caption: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  musicTrack?: string;
}

// ── Stories ──

const STORY_USERS: StoryUser[] = [
  {
    id: 'su1',
    name: 'You',
    username: '@you',
    initials: 'YO',
    isYou: true,
    hasUnseenStory: false,
    storyFrames: [],
  },
  {
    id: 'su2',
    name: 'Coach W',
    username: '@coachwilliams',
    initials: 'CW',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'sf1', type: 'image', uri: 'https://picsum.photos/seed/story1/400/700', duration: 5000, timestamp: new Date('2026-03-08T08:00:00') },
      { id: 'sf2', type: 'image', uri: 'https://picsum.photos/seed/story2/400/700', duration: 5000, timestamp: new Date('2026-03-08T08:05:00') },
    ],
  },
  {
    id: 'su3',
    name: 'James R',
    username: '@jrod23',
    initials: 'JR',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'sf3', type: 'image', uri: 'https://picsum.photos/seed/story3/400/700', duration: 5000, timestamp: new Date('2026-03-08T07:30:00') },
    ],
  },
  {
    id: 'su4',
    name: 'Sarah C',
    username: '@schen',
    initials: 'SC',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'sf4', type: 'image', uri: 'https://picsum.photos/seed/story4/400/700', duration: 5000, timestamp: new Date('2026-03-08T06:00:00') },
      { id: 'sf5', type: 'image', uri: 'https://picsum.photos/seed/story5/400/700', duration: 5000, timestamp: new Date('2026-03-08T06:10:00') },
      { id: 'sf6', type: 'image', uri: 'https://picsum.photos/seed/story6/400/700', duration: 5000, timestamp: new Date('2026-03-08T06:20:00') },
    ],
  },
  {
    id: 'su5',
    name: 'Marcus J',
    username: '@mjohnson',
    initials: 'MJ',
    hasUnseenStory: false,
    storyFrames: [
      { id: 'sf7', type: 'image', uri: 'https://picsum.photos/seed/story7/400/700', duration: 5000, timestamp: new Date('2026-03-07T20:00:00') },
    ],
  },
  {
    id: 'su6',
    name: 'Lisa P',
    username: '@lisapark',
    initials: 'LP',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'sf8', type: 'image', uri: 'https://picsum.photos/seed/story8/400/700', duration: 5000, timestamp: new Date('2026-03-08T09:00:00') },
    ],
  },
  {
    id: 'su7',
    name: 'Pastor D',
    username: '@pastordavis',
    initials: 'PD',
    hasUnseenStory: false,
    storyFrames: [
      { id: 'sf9', type: 'image', uri: 'https://picsum.photos/seed/story9/400/700', duration: 5000, timestamp: new Date('2026-03-07T18:00:00') },
      { id: 'sf10', type: 'image', uri: 'https://picsum.photos/seed/story10/400/700', duration: 5000, timestamp: new Date('2026-03-07T18:15:00') },
    ],
  },
  {
    id: 'su8',
    name: 'Alex K',
    username: '@akim',
    initials: 'AK',
    hasUnseenStory: true,
    storyFrames: [
      { id: 'sf11', type: 'image', uri: 'https://picsum.photos/seed/story11/400/700', duration: 5000, timestamp: new Date('2026-03-08T10:00:00') },
    ],
  },
];

// ── Feed Posts ──

const FEED_POSTS: FeedPost[] = [
  {
    id: 'fp1',
    author: { id: 'a1', name: 'Coach Williams', username: '@coachwilliams', initials: 'CW' },
    media: [{ type: 'image', uri: 'https://picsum.photos/seed/post1/600/600', aspectRatio: 1 }],
    caption: 'Great practice today! The team is looking sharp heading into the weekend. 💪',
    likeCount: 142,
    commentCount: 23,
    isLiked: false,
    isBookmarked: false,
    timestamp: new Date('2026-03-08T14:30:00'),
  },
  {
    id: 'fp2',
    author: { id: 'a2', name: 'James Rodriguez', username: '@jrod23', initials: 'JR' },
    media: [{ type: 'image', uri: 'https://picsum.photos/seed/post2/600/750', aspectRatio: 1.25 }],
    caption: 'Film session with the squad. Breaking down plays for Friday night. 🎬',
    likeCount: 89,
    commentCount: 12,
    isLiked: true,
    isBookmarked: false,
    timestamp: new Date('2026-03-08T12:15:00'),
  },
  {
    id: 'fp3',
    author: { id: 'a3', name: 'Sarah Chen', username: '@schen', initials: 'SC' },
    media: [{ type: 'image', uri: 'https://picsum.photos/seed/post3/600/400', aspectRatio: 0.667 }],
    caption: 'Q1 numbers are in and they are looking good. Proud of this team.',
    likeCount: 67,
    commentCount: 8,
    isLiked: false,
    isBookmarked: true,
    timestamp: new Date('2026-03-08T10:00:00'),
  },
  {
    id: 'fp4',
    author: { id: 'a4', name: 'Marcus Johnson', username: '@mjohnson', initials: 'MJ' },
    media: [{ type: 'image', uri: 'https://picsum.photos/seed/post4/600/600', aspectRatio: 1 }],
    caption: 'New kicks for the season. Who else is excited? 👟',
    likeCount: 234,
    commentCount: 45,
    isLiked: false,
    isBookmarked: false,
    timestamp: new Date('2026-03-07T22:00:00'),
  },
  {
    id: 'fp5',
    author: { id: 'a5', name: 'Lisa Park', username: '@lisapark', initials: 'LP' },
    media: [{ type: 'image', uri: 'https://picsum.photos/seed/post5/600/800', aspectRatio: 1.333 }],
    caption: 'Behind the scenes at today\'s team photoshoot. 📸',
    likeCount: 178,
    commentCount: 19,
    isLiked: false,
    isBookmarked: false,
    timestamp: new Date('2026-03-07T18:30:00'),
  },
  {
    id: 'fp6',
    author: { id: 'a6', name: 'Pastor Davis', username: '@pastordavis', initials: 'PD' },
    media: [{ type: 'image', uri: 'https://picsum.photos/seed/post6/600/600', aspectRatio: 1 }],
    caption: 'Sunday service was incredible. Thank you to everyone who came out. 🙏',
    likeCount: 312,
    commentCount: 56,
    isLiked: true,
    isBookmarked: false,
    timestamp: new Date('2026-03-07T15:00:00'),
  },
  {
    id: 'fp7',
    author: { id: 'a7', name: 'Alex Kim', username: '@akim', initials: 'AK' },
    media: [{ type: 'image', uri: 'https://picsum.photos/seed/post7/600/450', aspectRatio: 0.75 }],
    caption: 'Data never lies. Prepping the analytics dashboard for the coaching staff.',
    likeCount: 45,
    commentCount: 6,
    isLiked: false,
    isBookmarked: false,
    timestamp: new Date('2026-03-07T11:00:00'),
  },
  {
    id: 'fp8',
    author: { id: 'a8', name: 'Coach Thompson', username: '@cthompson', initials: 'CT' },
    media: [{ type: 'image', uri: 'https://picsum.photos/seed/post8/600/600', aspectRatio: 1 }],
    caption: 'Scouting trip highlights. Some real talent out there this year.',
    likeCount: 98,
    commentCount: 14,
    isLiked: false,
    isBookmarked: false,
    timestamp: new Date('2026-03-06T20:00:00'),
  },
  {
    id: 'fp9',
    author: { id: 'a2', name: 'James Rodriguez', username: '@jrod23', initials: 'JR' },
    media: [{ type: 'image', uri: 'https://picsum.photos/seed/post9/600/750', aspectRatio: 1.25 }],
    caption: 'Recovery day. Ice bath and stretching. The grind never stops.',
    likeCount: 156,
    commentCount: 28,
    isLiked: false,
    isBookmarked: false,
    timestamp: new Date('2026-03-06T16:00:00'),
  },
  {
    id: 'fp10',
    author: { id: 'a9', name: 'Rachel Green', username: '@rgreen', initials: 'RG' },
    media: [{ type: 'image', uri: 'https://picsum.photos/seed/post10/600/600', aspectRatio: 1 }],
    caption: 'Worship practice for the Easter service. It\'s going to be special. 🎵',
    likeCount: 201,
    commentCount: 34,
    isLiked: false,
    isBookmarked: false,
    timestamp: new Date('2026-03-06T14:00:00'),
  },
];

// ── Reels ──

const REELS: SocialReel[] = [
  {
    id: 'r1',
    creator: { id: 'a4', name: 'Marcus Johnson', username: '@mjohnson', initials: 'MJ' },
    videoUri: 'https://picsum.photos/seed/reel1/400/700',
    caption: 'Pregame warmup routine 🔥 #gameday',
    likeCount: 1243,
    commentCount: 89,
    shareCount: 45,
    isLiked: false,
    isBookmarked: false,
    musicTrack: 'Original Audio - @mjohnson',
  },
  {
    id: 'r2',
    creator: { id: 'a1', name: 'Coach Williams', username: '@coachwilliams', initials: 'CW' },
    videoUri: 'https://picsum.photos/seed/reel2/400/700',
    caption: 'Play breakdown: the pick and roll that won the game',
    likeCount: 876,
    commentCount: 123,
    shareCount: 67,
    isLiked: true,
    isBookmarked: false,
    musicTrack: 'Coach Talk - @coachwilliams',
  },
  {
    id: 'r3',
    creator: { id: 'a2', name: 'James Rodriguez', username: '@jrod23', initials: 'JR' },
    videoUri: 'https://picsum.photos/seed/reel3/400/700',
    caption: 'Day in the life of a college athlete 🏀',
    likeCount: 2341,
    commentCount: 234,
    shareCount: 156,
    isLiked: false,
    isBookmarked: false,
    musicTrack: 'Trending Sound - Various',
  },
  {
    id: 'r4',
    creator: { id: 'a5', name: 'Lisa Park', username: '@lisapark', initials: 'LP' },
    videoUri: 'https://picsum.photos/seed/reel4/400/700',
    caption: 'Office tour: where the magic happens ✨',
    likeCount: 567,
    commentCount: 45,
    shareCount: 23,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 'r5',
    creator: { id: 'a6', name: 'Pastor Davis', username: '@pastordavis', initials: 'PD' },
    videoUri: 'https://picsum.photos/seed/reel5/400/700',
    caption: '60 seconds of encouragement for your day 🙏',
    likeCount: 3456,
    commentCount: 456,
    shareCount: 234,
    isLiked: false,
    isBookmarked: true,
    musicTrack: 'Peaceful Piano - Ambient',
  },
  {
    id: 'r6',
    creator: { id: 'a7', name: 'Alex Kim', username: '@akim', initials: 'AK' },
    videoUri: 'https://picsum.photos/seed/reel6/400/700',
    caption: 'Data viz tip: making charts that actually tell a story 📊',
    likeCount: 432,
    commentCount: 67,
    shareCount: 89,
    isLiked: false,
    isBookmarked: false,
    musicTrack: 'Lo-fi Study - Beats',
  },
];

// ── Helpers ──

export function getStories(): StoryUser[] {
  return STORY_USERS;
}

export function getFeedPosts(): FeedPost[] {
  return FEED_POSTS;
}

export function getReels(): SocialReel[] {
  return REELS;
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
