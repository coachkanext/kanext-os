/**
 * Mock Video Feed Data — Instagram-style stories + posts for Video Home.
 */

export interface StoryCircle {
  id: string;
  name: string;
  initials: string;
  hasNew: boolean;
  isYou?: boolean;
}

export interface FeedPostMedia {
  type: 'clip' | 'reel' | 'photo';
  title: string;
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
}

const now = new Date();
const ago = (minutes: number) => new Date(now.getTime() - minutes * 60000);

export const STORY_CIRCLES: StoryCircle[] = [
  { id: 'st-you', name: 'Your Story', initials: 'SK', hasNew: false, isYou: true },
  { id: 'st-1', name: 'Coach Miller', initials: 'CM', hasNew: true },
  { id: 'st-2', name: 'Coach Brooks', initials: 'CB', hasNew: true },
  { id: 'st-3', name: 'E. Carter', initials: 'EC', hasNew: true },
  { id: 'st-4', name: 'E. Selden', initials: 'ES', hasNew: false },
  { id: 'st-5', name: 'K. Mentor', initials: 'KM', hasNew: true },
  { id: 'st-6', name: 'A. Noel', initials: 'AN', hasNew: false },
  { id: 'st-7', name: 'Staff Room', initials: 'SR', hasNew: true },
  { id: 'st-8', name: 'Game Ops', initials: 'GO', hasNew: false },
];

export const VIDEO_FEED_POSTS: VideoFeedPost[] = [
  {
    id: 'vfp-1',
    authorName: 'Coach Brooks',
    authorInitials: 'CB',
    authorRole: 'Video Coord',
    timestamp: ago(15),
    caption: 'Transition defense breakdown from the Coastal Carolina game. Watch how we recover on the weak side — this is what we need Saturday.',
    media: { type: 'clip', title: 'Transition Defense — Coastal Carolina' },
    likes: 12,
    comments: 4,
  },
  {
    id: 'vfp-2',
    authorName: 'Coach Miller',
    authorInitials: 'CM',
    authorRole: 'Assistant',
    timestamp: ago(45),
    caption: 'Updated the Campbell scouting cuts. Their zone press is the biggest concern — clip package is ready for film session.',
    media: { type: 'clip', title: 'Campbell Zone Press Breakdown' },
    likes: 8,
    comments: 2,
  },
  {
    id: 'vfp-3',
    authorName: 'Elijah Carter',
    authorInitials: 'EC',
    authorRole: 'Player · #4',
    timestamp: ago(120),
    caption: 'Locked in. Getting extra reps before Saturday.',
    media: { type: 'reel', title: 'Pre-Game Workout' },
    likes: 24,
    comments: 7,
    liked: true,
  },
  {
    id: 'vfp-4',
    authorName: 'KaNeXT',
    authorInitials: 'KX',
    authorRole: 'System',
    timestamp: ago(180),
    caption: 'FINAL — FMU 81, Coastal Carolina 74. FG: 48.3% | REB: 38 | AST: 19 | TO: 11. Full game highlights available.',
    media: { type: 'clip', title: 'Game Highlights — vs Coastal Carolina' },
    likes: 31,
    comments: 9,
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
  },
  {
    id: 'vfp-6',
    authorName: 'Keon Mentor',
    authorInitials: 'KM',
    authorRole: 'Player · #11',
    timestamp: ago(420),
    caption: 'Ball screen reads from yesterday\'s practice. Working on making the right read every time.',
    media: { type: 'reel', title: 'Ball Screen Decision Making' },
    likes: 18,
    comments: 5,
    liked: true,
  },
  {
    id: 'vfp-7',
    authorName: 'Coach Miller',
    authorInitials: 'CM',
    authorRole: 'Assistant',
    timestamp: ago(600),
    caption: 'Mid-range package highlights for Marcus Johnson. This pull-up game is getting dangerous.',
    media: { type: 'clip', title: 'Marcus Johnson — Mid-Range Package' },
    likes: 22,
    comments: 6,
    saved: true,
  },
];
