/**
 * Mock data for KayTV screen.
 * Universal across all modes. Browse, Library, Channels.
 * Streaming and long-form content platform.
 */

import type { Mode } from '@/types';

// ── Helpers ──

const img = (id: string, w = 600, h = 340) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&q=80`;

const thumb = (id: string) => img(id, 320, 180);

// ── Types ──

export interface ContentCard {
  id: string;
  title: string;
  thumbnailUri: string;
  sourceName: string;
  duration?: string;
  isLive?: boolean;
  viewCount: number;
  timestamp: string;
}

export interface ContentRow {
  label: string;
  items: ContentCard[];
}

export interface LibraryItem {
  id: string;
  title: string;
  thumbnailUri: string;
  sourceName: string;
  duration?: string;
  progress?: number; // 0-1 for continue watching
  dateWatched?: string;
  fileSize?: string;
  viewCount?: number;
  visibility?: 'public' | 'private' | 'org-only';
}

export interface ChannelItem {
  id: string;
  name: string;
  avatarInitials: string;
  isOrg: boolean;
  subscriberCount: number;
  contentCount: number;
  lastUpload: string;
  description: string;
  isSubscribed: boolean;
}

export interface PlaylistItem {
  id: string;
  name: string;
  videoCount: number;
  thumbnailUri: string;
}

// ── Featured banner ──

export interface FeaturedBanner {
  title: string;
  subtitle: string;
  imageUri: string;
  isLive: boolean;
}

const FEATURED_BANNERS: Record<Mode, FeaturedBanner> = {
  sports: {
    title: 'LIVE: Eastside vs. Lincoln',
    subtitle: 'Conference semifinal — watch now',
    imageUri: img('photo-1546519638-68e109498ffc', 800, 400),
    isLive: true,
  },
  business: {
    title: 'Q1 All-Hands Recording',
    subtitle: 'Company update from leadership',
    imageUri: img('photo-1497366216548-37526070297c', 800, 400),
    isLive: false,
  },
  church: {
    title: 'Sunday Service — Live',
    subtitle: 'Join worship from anywhere',
    imageUri: img('photo-1438032005730-c779502df39b', 800, 400),
    isLive: true,
  },
  education: {
    title: 'Guest Lecture: Future of AI',
    subtitle: 'Dr. Wilson — Computer Science Department',
    imageUri: img('photo-1524178232363-1fb2b075b655', 800, 400),
    isLive: false,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// BROWSE ROWS — mode-aware
// ═══════════════════════════════════════════════════════════════════════════

const SPORTS_ROWS: ContentRow[] = [
  {
    label: 'Live Now',
    items: [
      { id: 'slv1', title: 'Eastside vs. Lincoln — Semifinal', thumbnailUri: thumb('photo-1546519638-68e109498ffc'), sourceName: 'Lincoln Basketball', isLive: true, viewCount: 1243, timestamp: 'Live' },
      { id: 'slv2', title: 'Valley vs. Central — Quarterfinal', thumbnailUri: thumb('photo-1504450758481-7338eba7524a'), sourceName: 'NJCAA Network', isLive: true, viewCount: 876, timestamp: 'Live' },
    ],
  },
  {
    label: 'Your Team',
    items: [
      { id: 'st1', title: 'Game Highlights: Lincoln 78-65 Riverside', thumbnailUri: thumb('photo-1519861531473-9200262188bf'), sourceName: 'Lincoln Basketball', viewCount: 3456, timestamp: '2d ago', duration: '8:32' },
      { id: 'st2', title: 'Coach Williams Post-Game Interview', thumbnailUri: thumb('photo-1574623452334-9e0bd3668cae'), sourceName: 'Lincoln Basketball', viewCount: 1234, timestamp: '2d ago', duration: '12:15' },
      { id: 'st3', title: 'Practice Highlights — March 7', thumbnailUri: thumb('photo-1552674605-db6ffd4facb5'), sourceName: 'Lincoln Basketball', viewCount: 567, timestamp: '3d ago', duration: '4:45' },
      { id: 'st4', title: 'Scouting Report: Eastside', thumbnailUri: thumb('photo-1534438327276-14e5300c3a48'), sourceName: 'Lincoln Film', viewCount: 234, timestamp: '4d ago', duration: '22:30' },
    ],
  },
  {
    label: 'Trending',
    items: [
      { id: 'str1', title: 'Top 10 Dunks of the Week', thumbnailUri: thumb('photo-1461896836934-bd45ba8a0dce'), sourceName: 'KaNeXT Sports', viewCount: 45200, timestamp: '1d ago', duration: '6:18' },
      { id: 'str2', title: 'March Madness Preview Show', thumbnailUri: thumb('photo-1580087256394-dc596e1c8f4f'), sourceName: 'KaNeXT Sports', viewCount: 23100, timestamp: '3d ago', duration: '34:00' },
      { id: 'str3', title: 'Best Plays: Conference Quarterfinals', thumbnailUri: thumb('photo-1574629810360-7efbbe195018'), sourceName: 'KaNeXT Sports', viewCount: 18700, timestamp: '2d ago', duration: '10:22' },
    ],
  },
  {
    label: 'Highlights',
    items: [
      { id: 'sh1', title: 'Game Recap: NAIA Semifinals', thumbnailUri: thumb('photo-1521572163474-6864f9cf17ab'), sourceName: 'NAIA Network', viewCount: 12300, timestamp: '1d ago', duration: '15:40' },
      { id: 'sh2', title: 'Buzzer Beaters — March 2026', thumbnailUri: thumb('photo-1553062407-98eeb64c6a62'), sourceName: 'KaNeXT Sports', viewCount: 8900, timestamp: '5d ago', duration: '5:12' },
      { id: 'sh3', title: 'Player of the Week: Marcus Johnson', thumbnailUri: thumb('photo-1556821840-3a63f95609a7'), sourceName: 'Lincoln Basketball', viewCount: 4500, timestamp: '6d ago', duration: '3:45' },
    ],
  },
];

const CHURCH_ROWS: ContentRow[] = [
  {
    label: 'Live Now',
    items: [
      { id: 'clv1', title: 'Sunday Service — Pastor Davis', thumbnailUri: thumb('photo-1438032005730-c779502df39b'), sourceName: 'Grace Church', isLive: true, viewCount: 567, timestamp: 'Live' },
    ],
  },
  {
    label: 'Your Church',
    items: [
      { id: 'cc1', title: 'Sunday Sermon: Walking in Faith', thumbnailUri: thumb('photo-1478737270239-2f02b77fc618'), sourceName: 'Grace Church', viewCount: 2345, timestamp: '1d ago', duration: '42:00' },
      { id: 'cc2', title: 'Worship Night Highlights', thumbnailUri: thumb('photo-1516450360452-9312f5e86fc7'), sourceName: 'Grace Church', viewCount: 1234, timestamp: '3d ago', duration: '18:30' },
      { id: 'cc3', title: 'Bible Study: Romans 8', thumbnailUri: thumb('photo-1507692049790-de58290a4334'), sourceName: 'Grace Church', viewCount: 567, timestamp: '5d ago', duration: '55:00' },
    ],
  },
  {
    label: 'Trending',
    items: [
      { id: 'ctr1', title: 'Worship Anthems 2026', thumbnailUri: thumb('photo-1470229722913-7c0e2dbbafd3'), sourceName: 'KaNeXT Worship', viewCount: 34500, timestamp: '2d ago', duration: '1:12:00' },
      { id: 'ctr2', title: 'Easter Planning Guide', thumbnailUri: thumb('photo-1529070538774-1843cb3265df'), sourceName: 'KaNeXT Church', viewCount: 12300, timestamp: '4d ago', duration: '28:00' },
      { id: 'ctr3', title: 'Leadership Summit Keynote', thumbnailUri: thumb('photo-1501281668745-f7f57925c3b4'), sourceName: 'KaNeXT Church', viewCount: 8900, timestamp: '1w ago', duration: '45:00' },
    ],
  },
];

const BUSINESS_ROWS: ContentRow[] = [
  {
    label: 'Your Org',
    items: [
      { id: 'bo1', title: 'Q1 All-Hands Recording', thumbnailUri: thumb('photo-1497366216548-37526070297c'), sourceName: 'Acme Corp', viewCount: 234, timestamp: '1d ago', duration: '58:00' },
      { id: 'bo2', title: 'Product Roadmap Update', thumbnailUri: thumb('photo-1560472355-536de3962603'), sourceName: 'Acme Corp', viewCount: 156, timestamp: '3d ago', duration: '32:00' },
      { id: 'bo3', title: 'New Hire Orientation', thumbnailUri: thumb('photo-1522071820081-009f0129c71c'), sourceName: 'Acme Corp', viewCount: 89, timestamp: '1w ago', duration: '45:00' },
    ],
  },
  {
    label: 'Trending',
    items: [
      { id: 'btr1', title: 'Startup Pitch Competition Finals', thumbnailUri: thumb('photo-1552664730-d307ca884978'), sourceName: 'KaNeXT Business', viewCount: 15600, timestamp: '2d ago', duration: '1:24:00' },
      { id: 'btr2', title: 'Marketing Masterclass', thumbnailUri: thumb('photo-1497215842964-222b430dc094'), sourceName: 'KaNeXT Business', viewCount: 8700, timestamp: '5d ago', duration: '38:00' },
    ],
  },
  {
    label: 'Recommended',
    items: [
      { id: 'br1', title: 'Remote Work Best Practices', thumbnailUri: thumb('photo-1518770660439-4636190af475'), sourceName: 'KaNeXT Business', viewCount: 4500, timestamp: '1w ago', duration: '22:00' },
      { id: 'br2', title: 'Data-Driven Decision Making', thumbnailUri: thumb('photo-1507003211169-0a1dd7228f2d'), sourceName: 'KaNeXT Business', viewCount: 3200, timestamp: '2w ago', duration: '18:30' },
    ],
  },
];

const EDUCATION_ROWS: ContentRow[] = [
  {
    label: 'Your Campus',
    items: [
      { id: 'eo1', title: 'Guest Lecture: Future of AI', thumbnailUri: thumb('photo-1524178232363-1fb2b075b655'), sourceName: 'CS Department', viewCount: 1234, timestamp: '1d ago', duration: '1:10:00' },
      { id: 'eo2', title: 'Spring Commencement Preview', thumbnailUri: thumb('photo-1541339907198-e08756dedf3f'), sourceName: 'University Events', viewCount: 567, timestamp: '3d ago', duration: '5:30' },
      { id: 'eo3', title: 'Chemistry Lab 201 — Lecture 12', thumbnailUri: thumb('photo-1532094349884-543bc11b234d'), sourceName: 'Chemistry Dept', viewCount: 89, timestamp: '2d ago', duration: '48:00' },
    ],
  },
  {
    label: 'Trending',
    items: [
      { id: 'etr1', title: 'TED Talk: Learning to Learn', thumbnailUri: thumb('photo-1497633762265-9d179a990aa6'), sourceName: 'KaNeXT Education', viewCount: 23400, timestamp: '3d ago', duration: '18:00' },
      { id: 'etr2', title: 'Student Showcase 2026', thumbnailUri: thumb('photo-1523050854058-8df90110c9f1'), sourceName: 'KaNeXT Education', viewCount: 8900, timestamp: '1w ago', duration: '42:00' },
    ],
  },
  {
    label: 'Recommended',
    items: [
      { id: 'er1', title: 'Study Techniques That Actually Work', thumbnailUri: thumb('photo-1481627834876-b7833e8f5570'), sourceName: 'KaNeXT Education', viewCount: 12300, timestamp: '2w ago', duration: '14:00' },
      { id: 'er2', title: 'Campus Tour — Virtual', thumbnailUri: thumb('photo-1506521781263-d8422e82f27a'), sourceName: 'Admissions', viewCount: 5600, timestamp: '1mo ago', duration: '8:22' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// LIBRARY DATA
// ═══════════════════════════════════════════════════════════════════════════

const CONTINUE_WATCHING: LibraryItem[] = [
  { id: 'cw1', title: 'Game Highlights: Lincoln 78-65 Riverside', thumbnailUri: thumb('photo-1519861531473-9200262188bf'), sourceName: 'Lincoln Basketball', duration: '8:32', progress: 0.65 },
  { id: 'cw2', title: 'March Madness Preview Show', thumbnailUri: thumb('photo-1580087256394-dc596e1c8f4f'), sourceName: 'KaNeXT Sports', duration: '34:00', progress: 0.3 },
];

const WATCH_HISTORY: LibraryItem[] = [
  { id: 'wh1', title: 'Coach Williams Post-Game Interview', thumbnailUri: thumb('photo-1574623452334-9e0bd3668cae'), sourceName: 'Lincoln Basketball', duration: '12:15', dateWatched: 'Mar 8' },
  { id: 'wh2', title: 'Top 10 Dunks of the Week', thumbnailUri: thumb('photo-1461896836934-bd45ba8a0dce'), sourceName: 'KaNeXT Sports', duration: '6:18', dateWatched: 'Mar 7' },
  { id: 'wh3', title: 'Practice Highlights — March 7', thumbnailUri: thumb('photo-1552674605-db6ffd4facb5'), sourceName: 'Lincoln Basketball', duration: '4:45', dateWatched: 'Mar 7' },
  { id: 'wh4', title: 'Buzzer Beaters — March 2026', thumbnailUri: thumb('photo-1553062407-98eeb64c6a62'), sourceName: 'KaNeXT Sports', duration: '5:12', dateWatched: 'Mar 5' },
];

const SAVED_VIDEOS: LibraryItem[] = [
  { id: 'sv1', title: 'Scouting Report: Eastside', thumbnailUri: thumb('photo-1534438327276-14e5300c3a48'), sourceName: 'Lincoln Film', duration: '22:30' },
  { id: 'sv2', title: 'Best Plays: Conference Quarterfinals', thumbnailUri: thumb('photo-1574629810360-7efbbe195018'), sourceName: 'KaNeXT Sports', duration: '10:22' },
  { id: 'sv3', title: 'Player of the Week: Marcus Johnson', thumbnailUri: thumb('photo-1556821840-3a63f95609a7'), sourceName: 'Lincoln Basketball', duration: '3:45' },
];

const PLAYLISTS: PlaylistItem[] = [
  { id: 'pl1', name: 'Film Study', videoCount: 8, thumbnailUri: thumb('photo-1534438327276-14e5300c3a48') },
  { id: 'pl2', name: 'Game Highlights', videoCount: 14, thumbnailUri: thumb('photo-1461896836934-bd45ba8a0dce') },
  { id: 'pl3', name: 'Training Videos', videoCount: 5, thumbnailUri: thumb('photo-1552674605-db6ffd4facb5') },
];

const DOWNLOADS: LibraryItem[] = [
  { id: 'dl1', title: 'Scouting Report: Eastside', thumbnailUri: thumb('photo-1534438327276-14e5300c3a48'), sourceName: 'Lincoln Film', duration: '22:30', fileSize: '145 MB' },
  { id: 'dl2', title: 'Game Highlights: Lincoln 78-65 Riverside', thumbnailUri: thumb('photo-1519861531473-9200262188bf'), sourceName: 'Lincoln Basketball', duration: '8:32', fileSize: '52 MB' },
];

const YOUR_UPLOADS: LibraryItem[] = [
  { id: 'up1', title: 'Pregame Warmup Routine', thumbnailUri: thumb('photo-1546519638-68e109498ffc'), sourceName: 'You', duration: '3:22', viewCount: 45, visibility: 'org-only' },
  { id: 'up2', title: 'Film Breakdown — Pick & Roll', thumbnailUri: thumb('photo-1504450758481-7338eba7524a'), sourceName: 'You', duration: '15:40', viewCount: 123, visibility: 'public' },
];

// ═══════════════════════════════════════════════════════════════════════════
// CHANNELS DATA
// ═══════════════════════════════════════════════════════════════════════════

export const CHANNEL_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'subscribed', label: 'Subscribed' },
  { key: 'recommended', label: 'Recommended' },
  { key: 'sports', label: 'Sports' },
  { key: 'business', label: 'Business' },
  { key: 'faith', label: 'Faith' },
  { key: 'education', label: 'Education' },
] as const;

const CHANNELS: ChannelItem[] = [
  { id: 'ch1', name: 'Lincoln Basketball', avatarInitials: 'LB', isOrg: true, subscriberCount: 4500, contentCount: 234, lastUpload: '2d ago', description: 'Official channel of Lincoln College Basketball', isSubscribed: true },
  { id: 'ch2', name: 'KaNeXT Sports', avatarInitials: 'KS', isOrg: true, subscriberCount: 125000, contentCount: 1890, lastUpload: '1d ago', description: 'Highlights, analysis, and live events across the KaNeXT ecosystem', isSubscribed: true },
  { id: 'ch3', name: 'Coach Williams', avatarInitials: 'CW', isOrg: false, subscriberCount: 2300, contentCount: 67, lastUpload: '4d ago', description: 'Film breakdowns, coaching tips, and post-game analysis', isSubscribed: true },
  { id: 'ch4', name: 'NAIA Network', avatarInitials: 'NA', isOrg: true, subscriberCount: 34000, contentCount: 890, lastUpload: '1d ago', description: 'Official NAIA game broadcasts and highlights', isSubscribed: false },
  { id: 'ch5', name: 'NJCAA Sports', avatarInitials: 'NJ', isOrg: true, subscriberCount: 28000, contentCount: 654, lastUpload: '2d ago', description: 'NJCAA Division I, II, and III coverage', isSubscribed: false },
  { id: 'ch6', name: 'Grace Church', avatarInitials: 'GC', isOrg: true, subscriberCount: 1200, contentCount: 156, lastUpload: '1d ago', description: 'Sermons, worship recordings, and church events', isSubscribed: true },
  { id: 'ch7', name: 'KaNeXT Education', avatarInitials: 'KE', isOrg: true, subscriberCount: 45000, contentCount: 432, lastUpload: '3d ago', description: 'Lectures, campus events, and educational content', isSubscribed: false },
  { id: 'ch8', name: 'Acme Corp Training', avatarInitials: 'AC', isOrg: true, subscriberCount: 890, contentCount: 45, lastUpload: '1w ago', description: 'Internal training videos and company updates', isSubscribed: false },
];

// ═══════════════════════════════════════════════════════════════════════════
// GETTERS
// ═══════════════════════════════════════════════════════════════════════════

const ROWS_BY_MODE: Record<Mode, ContentRow[]> = {
  sports: SPORTS_ROWS,
  church: CHURCH_ROWS,
  business: BUSINESS_ROWS,
  education: EDUCATION_ROWS,
};

export function getFeaturedBanner(mode?: Mode): FeaturedBanner {
  return FEATURED_BANNERS[mode ?? 'sports'];
}

export function getBrowseRows(mode?: Mode): ContentRow[] {
  return ROWS_BY_MODE[mode ?? 'sports'];
}

export function getContinueWatching(): LibraryItem[] {
  return CONTINUE_WATCHING;
}

export function getWatchHistory(): LibraryItem[] {
  return WATCH_HISTORY;
}

export function getSavedVideos(): LibraryItem[] {
  return SAVED_VIDEOS;
}

export function getPlaylists(): PlaylistItem[] {
  return PLAYLISTS;
}

export function getDownloads(): LibraryItem[] {
  return DOWNLOADS;
}

export function getYourUploads(): LibraryItem[] {
  return YOUR_UPLOADS;
}

export function getChannels(filter?: string): ChannelItem[] {
  if (!filter || filter === 'all') return CHANNELS;
  if (filter === 'subscribed') return CHANNELS.filter((c) => c.isSubscribed);
  if (filter === 'recommended') return CHANNELS.filter((c) => !c.isSubscribed);
  return CHANNELS;
}

export function formatViewCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K views`;
  return `${count} views`;
}

// ═══════════════════════════════════════════════════════════════════════════
// KAYTV FEED — YouTube-style flat video list per mode
// ═══════════════════════════════════════════════════════════════════════════

export interface KayTVFeedItem {
  id: string;
  title: string;
  uploaderName: string;
  uploaderHandle: string;
  uploaderInitials: string;
  brandName: string;       // Organization/brand the video belongs to
  viewCount: number;
  timestamp: Date;
  duration: string;
  mode: string;
  category: string;
  description: string;
  likeCount: number;
  commentCount: number;
  thumbHue: number;
  thumbEmoji: string;
  videoUri?: string | number; // URI string or bundled require() asset
}

export interface KayTVVideoComment {
  id: string;
  authorName: string;
  authorInitials: string;
  text: string;
  likeCount: number;
  timestamp: Date;
}

export interface ExploreRow {
  id: string;
  label: string;
  items: KayTVFeedItem[];
}

export const MOCK_VIDEO_COMMENTS: KayTVVideoComment[] = [
  { id: 'kc1', authorName: 'Jordan H',  authorInitials: 'JH', text: 'This is exactly what we needed. Sharing with the whole team 🔥', likeCount: 24, timestamp: new Date(Date.now() - 3_600_000) },
  { id: 'kc2', authorName: 'Riley T',   authorInitials: 'RT', text: 'The quality keeps getting better every week. Love the production.', likeCount: 11, timestamp: new Date(Date.now() - 10_800_000) },
  { id: 'kc3', authorName: 'Alex R',    authorInitials: 'AR', text: "At 22:30 — that breakdown was so clear. Finally understand this.", likeCount: 8,  timestamp: new Date(Date.now() - 18_000_000) },
  { id: 'kc4', authorName: 'Sam D',     authorInitials: 'SD', text: 'Can we get a follow-up video on this topic?', likeCount: 16, timestamp: new Date(Date.now() - 28_800_000) },
  { id: 'kc5', authorName: 'Maya C',    authorInitials: 'MC', text: 'Watched this twice already. So much value packed in here.', likeCount: 7, timestamp: new Date(Date.now() - 43_200_000) },
];

export const KAYTV_CATEGORIES: Record<string, string[]> = {
  sports:    ['All', 'Games', 'Highlights', 'Press', 'Recruiting'],
  business:  ['All', 'Product', 'Updates', 'Webinars', 'Culture'],
  education: ['All', 'Campus', 'Commencement', 'Student Showcase', 'Orientation'],
  community: ['All', 'Sermons', 'Worship', 'Events', 'Testimonies'],
  personal:  ['All', 'Uploads', 'Saved', 'Watch Later'],
};

// Brands the user is subscribed to within each mode.
// Subscribed brand content floats to top of the Home feed.
export const SUBSCRIBED_BRANDS: Record<string, string[]> = {
  sports:    ['Varsity FC',        'Lincoln Basketball'],
  business:  ['NovaTech',          'Lincoln Basketball'],
  education: ['Lincoln University', 'Lincoln Basketball'],
  community: ['Grace Church',       'Lincoln Basketball'],
  personal:  ['Lincoln Basketball'],
};

export function formatVideoTimestamp(date: Date): string {
  const diff = Date.now() - date.getTime();
  const hr = 3_600_000, day = 86_400_000, wk = 7 * day;
  if (diff < hr)       return `${Math.max(1, Math.floor(diff / 60_000))} min ago`;
  if (diff < day)      return `${Math.floor(diff / hr)} hours ago`;
  if (diff < 7 * day)  return `${Math.floor(diff / day)} days ago`;
  if (diff < 28 * day) return `${Math.floor(diff / wk)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const _N = Date.now();
const _D = 86_400_000;

// ── Bundled game film assets ───────────────────────────────────────────────
const A_PEPPER  = require('@/assets/videos/kaytv-preview.mp4') as number;
const A_LB      = require('@/assets/videos/lb-state.mp4')      as number;
const A_WEBER   = require('@/assets/videos/weber-st.mp4')      as number;
const A_IRVINE  = require('@/assets/videos/irvine.mp4')         as number;
const A_LMU     = require('@/assets/videos/lmu.mp4')            as number;
const A_SIMPSON = require('@/assets/videos/simpson.mp4')        as number;
const A_MAR_W   = require('@/assets/videos/maritime-w.mp4')    as number;
const A_MAR_L   = require('@/assets/videos/maritime-l.mp4')    as number;

// Shared uploader stub for all Lincoln Basketball videos
const _LB = {
  uploaderName: 'Lincoln Basketball', uploaderHandle: '@lincolnbball',
  uploaderInitials: 'LB', brandName: 'Lincoln Basketball', category: 'Games', thumbEmoji: '🏀',
};

// Helper: minutes ago offset
function _minsAgo(m: number) { return new Date(_N - m * 60_000); }

// The 8 real game clips as canonical objects (mode/id assigned per feed below)
const _GAME_PEPPER  = { ..._LB, title: 'Lincoln @ Pepperdine — Laolu 12 Three-Pointers',       thumbHue: 215, duration: '4:12', viewCount: 24800, likeCount: 1840, commentCount: 312, description: 'Laolu drops 12 three-pointers in a dominant road win at Pepperdine.',          videoUri: A_PEPPER  };
const _GAME_LB      = { ..._LB, title: 'Lincoln @ Long Beach State — Laolu 6 Three-Pointers',  thumbHue:  45, duration: '3:48', viewCount: 18400, likeCount: 1340, commentCount: 224, description: 'Six threes in a statement road win at Long Beach State.',                       videoUri: A_LB      };
const _GAME_WEBER   = { ..._LB, title: 'Lincoln @ Weber State — Laolu 4 Three-Pointers',       thumbHue: 270, duration: '3:22', viewCount: 14200, likeCount:  980, commentCount: 156, description: 'Laolu catches fire from three in a big road win at Weber State.',              videoUri: A_WEBER   };
const _GAME_IRVINE  = { ..._LB, title: 'Lincoln @ UC Irvine — Laolu 4 Three-Pointers',         thumbHue: 210, duration: '2:58', viewCount: 12600, likeCount:  890, commentCount: 143, description: 'Four threes and a complete team effort in Irvine.',                            videoUri: A_IRVINE  };
const _GAME_LMU     = { ..._LB, title: 'Lincoln @ LMU — Laolu 2 Three-Pointers',               thumbHue:   0, duration: '2:34', viewCount:  9800, likeCount:  720, commentCount: 118, description: 'Two big threes help Lincoln pull away at LMU.',                                videoUri: A_LMU     };
const _GAME_SIMPSON = { ..._LB, title: 'Lincoln @ Simpson — Laolu 8 Three-Pointers',           thumbHue:  10, duration: '4:05', viewCount: 16200, likeCount: 1120, commentCount: 189, description: 'Career-high eight three-pointers — Laolu goes off at Simpson.',                videoUri: A_SIMPSON };
const _GAME_MAR_W   = { ..._LB, title: 'Lincoln vs Cal Maritime (W) — Laolu 6 Three-Pointers', thumbHue: 205, duration: '3:30', viewCount: 11400, likeCount:  810, commentCount: 134, description: 'Six threes in a convincing home win over Cal Maritime.',                       videoUri: A_MAR_W   };
const _GAME_MAR_L   = { ..._LB, title: 'Lincoln @ Cal Maritime (L) — Laolu 6 Three-Pointers',  thumbHue: 205, duration: '3:15', viewCount: 10200, likeCount:  740, commentCount: 122, description: 'Laolu hit six threes but Lincoln fell short in a tough road game at Maritime.', videoUri: A_MAR_L   };

// ── Sports feed (Varsity FC = subscribed brand + City Athletic = discovery) ──

const FEED_SPORTS: KayTVFeedItem[] = [
  // ── Real game film (featured first) ──
  { id: 'gs1', mode: 'sports', ..._GAME_LB,      timestamp: _minsAgo(5)  },
  { id: 'gs2', mode: 'sports', ..._GAME_MAR_W,   timestamp: _minsAgo(20) },
  { id: 'gs3', mode: 'sports', ..._GAME_PEPPER,  timestamp: _minsAgo(35) },
  { id: 'gs4', mode: 'sports', ..._GAME_WEBER,   timestamp: _minsAgo(50) },
  { id: 'gs5', mode: 'sports', ..._GAME_IRVINE,  timestamp: _minsAgo(65) },
  { id: 'gs6', mode: 'sports', ..._GAME_LMU,     timestamp: _minsAgo(80) },
  { id: 'gs7', mode: 'sports', ..._GAME_SIMPSON, timestamp: _minsAgo(95) },
  { id: 'gs8', mode: 'sports', ..._GAME_MAR_L,   timestamp: _minsAgo(110) },
  // ── Mock feed ──
  { id: 'fsv1',  mode: 'sports', category: 'Games',      brandName: 'Varsity FC', title: 'LMU Game 2 — Full Replay',                                  uploaderName: 'Varsity FC',          uploaderHandle: '@varsityfc',       uploaderInitials: 'VF', viewCount: 14800, timestamp: new Date(_N - 2*3_600_000), duration: '1:47:22', likeCount: 892,  commentCount: 134, thumbHue: 0,   thumbEmoji: '⚽', description: 'Full replay of Game 2 vs. LMU. Watch every possession including overtime.', videoUri: 'file:///Users/sammy/Desktop/Laolu%203/LMU%202.mp4' },
  { id: 'fsv2',  mode: 'sports', category: 'Highlights', brandName: 'Varsity FC', title: 'LB State — 6 Three-Pointers Highlights',                    uploaderName: 'Coach Rodriguez',     uploaderHandle: '@coach_rod',       uploaderInitials: 'CR', viewCount: 8320,  timestamp: new Date(_N - 6*3_600_000), duration: '4:15',    likeCount: 541,  commentCount: 67,  thumbHue: 12,  thumbEmoji: '🔥', description: '6 three-pointers in one game — State tournament performance highlights.', videoUri: 'file:///Users/sammy/Desktop/Laolu%203/LB%20State%206%20Threes.mp4' },
  { id: 'fsv3',  mode: 'sports', category: 'Highlights', brandName: 'Varsity FC', title: 'Tuesday Training Session — Defensive Shape',               uploaderName: 'Coaching Staff',      uploaderHandle: '@varsityfc_staff', uploaderInitials: 'CS', viewCount: 1230,  timestamp: new Date(_N - 1*_D),        duration: '22:08',   likeCount: 89,   commentCount: 14,  thumbHue: 210, thumbEmoji: '🎬', description: 'Full practice film from Tuesday\'s session. Focus on defensive shape and pressing triggers.' },
  { id: 'fsv4',  mode: 'sports', category: 'Press',      brandName: 'Varsity FC', title: 'Post-Match Press Conference — Head Coach',                 uploaderName: 'Varsity FC Media',    uploaderHandle: '@varsityfc_media', uploaderInitials: 'VM', viewCount: 3100,  timestamp: new Date(_N - 2*_D),        duration: '11:44',   likeCount: 178,  commentCount: 29,  thumbHue: 30,  thumbEmoji: '🎙️', description: 'Full post-match press conference after the 2-1 win over Riverside. Coach discusses tactics and key moments.' },
  { id: 'fsv5',  mode: 'sports', category: 'Recruiting', brandName: 'Varsity FC', title: 'Prospect Profile: Marcus J. — Class of 2026',             uploaderName: 'Varsity FC Scouting', uploaderHandle: '@varsityfc_scout', uploaderInitials: 'VS', viewCount: 2500,  timestamp: new Date(_N - 3*_D),        duration: '6:30',    likeCount: 203,  commentCount: 41,  thumbHue: 120, thumbEmoji: '⭐', description: 'Full highlight reel for Marcus J., top Class of 2026 prospect. Breakdown of key attributes and stats.' },
  { id: 'fsv6',  mode: 'sports', category: 'Highlights', brandName: 'Varsity FC', title: 'Marcus Johnson Hat-Trick — Season Best Performance',       uploaderName: 'Varsity FC',          uploaderHandle: '@varsityfc',       uploaderInitials: 'VF', viewCount: 22400, timestamp: new Date(_N - 4*_D),        duration: '3:52',    likeCount: 1840, commentCount: 287, thumbHue: 355, thumbEmoji: '🏆', description: 'Three goals, one incredible performance. Marcus Johnson\'s hat-trick against City Athletic.' },
  { id: 'fsv7',  mode: 'sports', category: 'Games',      brandName: 'Varsity FC', title: 'Condensed Match: Varsity FC vs. City Athletic (3-1)',       uploaderName: 'Varsity FC',          uploaderHandle: '@varsityfc',       uploaderInitials: 'VF', viewCount: 6700,  timestamp: new Date(_N - 5*_D),        duration: '28:14',   likeCount: 445,  commentCount: 78,  thumbHue: 40,  thumbEmoji: '⚽', description: '28-minute condensed version of the City Athletic match with all goals and key moments.' },
  { id: 'fsv8',  mode: 'sports', category: 'Highlights', brandName: 'Varsity FC', title: 'Set Pieces Training — Corner Kick Routines',               uploaderName: 'Coaching Staff',      uploaderHandle: '@varsityfc_staff', uploaderInitials: 'CS', viewCount: 890,   timestamp: new Date(_N - 7*_D),        duration: '18:05',   likeCount: 67,   commentCount: 8,   thumbHue: 220, thumbEmoji: '📋', description: 'Full set piece session from Thursday. Six new corner routines and three free-kick variations.' },
  // City Athletic — discovery (not subscribed)
  { id: 'fsv9',  mode: 'sports', category: 'Games',      brandName: 'City Athletic', title: 'Match Report: City Athletic vs. Northern United (2-0)',  uploaderName: 'City Athletic FC',    uploaderHandle: '@cityathletic',    uploaderInitials: 'CA', viewCount: 5200,  timestamp: new Date(_N - 3*_D),        duration: '6:45',    likeCount: 312,  commentCount: 44,  thumbHue: 195, thumbEmoji: '⚽', description: 'City Athletic continue their winning streak with a 2-0 victory over Northern United. Full match report and highlights.' },
  { id: 'fsv10', mode: 'sports', category: 'Highlights', brandName: 'City Athletic', title: 'City Athletic — Top Goals of the Month',                 uploaderName: 'City Athletic FC',    uploaderHandle: '@cityathletic',    uploaderInitials: 'CA', viewCount: 8900,  timestamp: new Date(_N - 6*_D),        duration: '4:30',    likeCount: 567,  commentCount: 78,  thumbHue: 195, thumbEmoji: '🎯', description: 'The best goals scored by City Athletic FC this month. Some incredible finishes.' },
  { id: 'fsv11', mode: 'sports', category: 'Press',      brandName: 'City Athletic', title: 'City Athletic Pre-Season Press Day 2026',                uploaderName: 'City Athletic Media', uploaderHandle: '@ca_media',        uploaderInitials: 'CA', viewCount: 2100,  timestamp: new Date(_N - 9*_D),        duration: '9:18',    likeCount: 145,  commentCount: 22,  thumbHue: 195, thumbEmoji: '🎙️', description: 'Full pre-season press day coverage. Manager previews the season ahead.' },
  // River Valley FC — discovery (not subscribed)
  { id: 'fsv12', mode: 'sports', category: 'Games',      brandName: 'River Valley FC', title: 'River Valley vs. Eastside FC — Match Highlights (2-1)',  uploaderName: 'RV Media',        uploaderHandle: '@rivervalleyfc', uploaderInitials: 'RV', viewCount: 3800,  timestamp: new Date(_N - 1*_D),  duration: '8:22',  likeCount: 245, commentCount: 38, thumbHue: 170, thumbEmoji: '⚽', description: 'Full match highlights from River Valley FC vs Eastside. Two great goals and a stunning save.' },
  { id: 'fsv13', mode: 'sports', category: 'Highlights', brandName: 'River Valley FC', title: 'River Valley — Top 5 Goals of February 2026',            uploaderName: 'RV Media',        uploaderHandle: '@rivervalleyfc', uploaderInitials: 'RV', viewCount: 6100,  timestamp: new Date(_N - 5*_D),  duration: '3:45',  likeCount: 412, commentCount: 55, thumbHue: 170, thumbEmoji: '🎯', description: 'Our five best goals from February 2026. What a month for River Valley FC.' },
  { id: 'fsv14', mode: 'sports', category: 'Recruiting', brandName: 'River Valley FC', title: 'River Valley FC — Recruiting Highlights 2026',           uploaderName: 'RV Scouting',     uploaderHandle: '@rv_scout',      uploaderInitials: 'RS', viewCount: 1500,  timestamp: new Date(_N - 8*_D),  duration: '5:58',  likeCount: 134, commentCount: 21, thumbHue: 170, thumbEmoji: '⭐', description: 'Showcase video for our 2026 recruiting class. Top prospects in action.' },
];

const FEED_BUSINESS: KayTVFeedItem[] = [
  // ── Real game film ──
  { id: 'gb1', mode: 'business', ..._GAME_PEPPER,  timestamp: _minsAgo(5)  },
  { id: 'gb2', mode: 'business', ..._GAME_LB,      timestamp: _minsAgo(20) },
  { id: 'gb3', mode: 'business', ..._GAME_WEBER,   timestamp: _minsAgo(35) },
  { id: 'gb4', mode: 'business', ..._GAME_IRVINE,  timestamp: _minsAgo(50) },
  { id: 'gb5', mode: 'business', ..._GAME_LMU,     timestamp: _minsAgo(65) },
  { id: 'gb6', mode: 'business', ..._GAME_SIMPSON, timestamp: _minsAgo(80) },
  { id: 'gb7', mode: 'business', ..._GAME_MAR_W,   timestamp: _minsAgo(95) },
  { id: 'gb8', mode: 'business', ..._GAME_MAR_L,   timestamp: _minsAgo(110) },
  // ── Mock feed ──
  { id: 'fbv1', mode: 'business', category: 'Culture',  brandName: 'NovaTech', title: 'Onboarding Series: Day 1 Welcome & Culture',           uploaderName: 'NovaTech HR',         uploaderHandle: '@novatech_hr',       uploaderInitials: 'NH', viewCount: 3420,  timestamp: new Date(_N - 3*3_600_000), duration: '14:22', likeCount: 198, commentCount: 22, thumbHue: 200, thumbEmoji: '🎯', description: 'Welcome to NovaTech. This video covers our mission, values, and what to expect in your first week.' },
  { id: 'fbv2', mode: 'business', category: 'Product',  brandName: 'NovaTech', title: 'Q4 Product Roadmap Presentation',                      uploaderName: 'Alex Rivera (CPO)',   uploaderHandle: '@alex_cpo',          uploaderInitials: 'AR', viewCount: 5100,  timestamp: new Date(_N - 8*3_600_000), duration: '31:48', likeCount: 312, commentCount: 54, thumbHue: 240, thumbEmoji: '🗺️', description: 'Full Q4 roadmap presentation. Covers three major feature releases, infrastructure updates, and customer commitments.' },
  { id: 'fbv3', mode: 'business', category: 'Updates',  brandName: 'NovaTech', title: 'Company-Wide Town Hall — March 2026',                  uploaderName: 'NovaTech CEO',        uploaderHandle: '@ceo_novatech',      uploaderInitials: 'CN', viewCount: 9800,  timestamp: new Date(_N - 2*_D),        duration: '54:10', likeCount: 720, commentCount: 143, thumbHue: 160, thumbEmoji: '📢', description: 'March 2026 all-hands town hall. Covers Q1 results, strategic priorities, and Q&A.' },
  { id: 'fbv4', mode: 'business', category: 'Webinars', brandName: 'NovaTech', title: 'Sales Excellence: Closing Strategies That Work',       uploaderName: 'Sales Enablement',   uploaderHandle: '@novatech_sales',    uploaderInitials: 'SE', viewCount: 2700,  timestamp: new Date(_N - 3*_D),        duration: '47:33', likeCount: 189, commentCount: 31, thumbHue: 25,  thumbEmoji: '💼', description: 'Recorded webinar on modern closing strategies. Covers SPIN selling, objection handling, and pipeline hygiene.' },
  { id: 'fbv5', mode: 'business', category: 'Product',  brandName: 'NovaTech', title: 'Product Demo: Full Platform Walkthrough',              uploaderName: 'Product Team',        uploaderHandle: '@novatech_product',  uploaderInitials: 'PT', viewCount: 4500,  timestamp: new Date(_N - 4*_D),        duration: '22:15', likeCount: 278, commentCount: 43, thumbHue: 190, thumbEmoji: '🖥️', description: 'Complete platform walkthrough for new employees. Covers all core modules and workflows.' },
  { id: 'fbv6', mode: 'business', category: 'Culture',  brandName: 'NovaTech', title: 'Leadership Development: Managing Remote Teams',        uploaderName: 'L&D Team',            uploaderHandle: '@novatech_ld',       uploaderInitials: 'LD', viewCount: 1900,  timestamp: new Date(_N - 6*_D),        duration: '35:40', likeCount: 134, commentCount: 19, thumbHue: 280, thumbEmoji: '🏅', description: 'Part 3 of our Leadership Development series. Focus on async communication and distributed team management.' },
  { id: 'fbv7', mode: 'business', category: 'Product',  brandName: 'NovaTech', title: 'Feature Launch: KaNeXT Analytics Dashboard',          uploaderName: 'Alex Rivera (CPO)',   uploaderHandle: '@alex_cpo',          uploaderInitials: 'AR', viewCount: 7200,  timestamp: new Date(_N - 8*_D),        duration: '8:50',  likeCount: 534, commentCount: 87, thumbHue: 210, thumbEmoji: '📊', description: 'Official launch video for the new analytics dashboard. Live demo, key features, and release notes.' },
  // TechCorp — discovery (not subscribed)
  { id: 'ftv1', mode: 'business', category: 'Product',  brandName: 'TechCorp', title: 'TechCorp AI Suite 2026 — Full Product Demo',          uploaderName: 'TechCorp Demo',  uploaderHandle: '@techcorp',      uploaderInitials: 'TC', viewCount: 11200, timestamp: new Date(_N - 1*_D),  duration: '18:30', likeCount: 845, commentCount: 132, thumbHue: 260, thumbEmoji: '🤖', description: 'Full product demo of TechCorp AI Suite 2026. See how teams use AI to automate their workflows.' },
  { id: 'ftv2', mode: 'business', category: 'Updates',  brandName: 'TechCorp', title: 'TechCorp Year in Review 2025',                        uploaderName: 'TechCorp CEO',   uploaderHandle: '@techcorp_ceo',  uploaderInitials: 'TC', viewCount: 7800,  timestamp: new Date(_N - 4*_D),  duration: '34:12', likeCount: 567, commentCount: 89,  thumbHue: 260, thumbEmoji: '📈', description: '2025 was a big year. Our CEO reflects on key milestones, lessons learned, and what\'s coming in 2026.' },
  { id: 'ftv3', mode: 'business', category: 'Culture',  brandName: 'TechCorp', title: 'Inside TechCorp: How We Build Products',              uploaderName: 'TechCorp Team',  uploaderHandle: '@techcorp_team', uploaderInitials: 'TC', viewCount: 4300,  timestamp: new Date(_N - 7*_D),  duration: '22:05', likeCount: 298, commentCount: 47,  thumbHue: 260, thumbEmoji: '🏗️', description: 'A behind-the-scenes look at how TechCorp\'s product team operates.' },
];

const FEED_EDUCATION: KayTVFeedItem[] = [
  // ── Real game film ──
  { id: 'ge1', mode: 'education', ..._GAME_WEBER,   timestamp: _minsAgo(5)  },
  { id: 'ge2', mode: 'education', ..._GAME_MAR_L,   timestamp: _minsAgo(20) },
  { id: 'ge3', mode: 'education', ..._GAME_PEPPER,  timestamp: _minsAgo(35) },
  { id: 'ge4', mode: 'education', ..._GAME_LB,      timestamp: _minsAgo(50) },
  { id: 'ge5', mode: 'education', ..._GAME_IRVINE,  timestamp: _minsAgo(65) },
  { id: 'ge6', mode: 'education', ..._GAME_LMU,     timestamp: _minsAgo(80) },
  { id: 'ge7', mode: 'education', ..._GAME_SIMPSON, timestamp: _minsAgo(95) },
  { id: 'ge8', mode: 'education', ..._GAME_MAR_W,   timestamp: _minsAgo(110) },
  // ── Mock feed ──
  { id: 'fev1', mode: 'education', category: 'Campus',           brandName: 'Lincoln University', title: 'HIST 301: Civil Rights Movement — Week 8 Lecture',     uploaderName: 'Prof. James Carter',  uploaderHandle: '@prof_carter',      uploaderInitials: 'JC', viewCount: 1840,  timestamp: new Date(_N - 4*3_600_000), duration: '58:32',   likeCount: 123,  commentCount: 18,  thumbHue: 40,  thumbEmoji: '📚', description: 'Week 8 recorded lecture. Covers the Birmingham Campaign, Letter from Birmingham Jail, and the March on Washington.' },
  { id: 'fev2', mode: 'education', category: 'Campus',           brandName: 'Lincoln University', title: 'Campus Tour 2026 — Welcome to Lincoln University',     uploaderName: 'Admissions Office',   uploaderHandle: '@lincoln_admit',    uploaderInitials: 'LA', viewCount: 12300, timestamp: new Date(_N - 1*_D),        duration: '16:45',   likeCount: 890,  commentCount: 112, thumbHue: 140, thumbEmoji: '🏛️', description: 'Official 2026 campus tour. See the new STEM center, the library, residence halls, and athletic facilities.' },
  { id: 'fev3', mode: 'education', category: 'Commencement',     brandName: 'Lincoln University', title: 'Commencement 2025 — Full Ceremony',                    uploaderName: 'Lincoln University',  uploaderHandle: '@lincoln_univ',     uploaderInitials: 'LU', viewCount: 28500, timestamp: new Date(_N - 2*_D),        duration: '2:14:08', likeCount: 2100, commentCount: 430, thumbHue: 50,  thumbEmoji: '🎓', description: 'Full recording of the Class of 2025 commencement ceremony. Includes keynote, degree conferral, and reception.' },
  { id: 'fev4', mode: 'education', category: 'Student Showcase', brandName: 'Lincoln University', title: 'Student Spotlight: Research Award Winners 2026',       uploaderName: 'Student Affairs',     uploaderHandle: '@lincoln_students', uploaderInitials: 'SA', viewCount: 3200,  timestamp: new Date(_N - 3*_D),        duration: '12:20',   likeCount: 245,  commentCount: 38,  thumbHue: 100, thumbEmoji: '🔬', description: 'Recognizing our top 10 undergraduate researchers for the 2025-2026 academic year.' },
  { id: 'fev5', mode: 'education', category: 'Orientation',      brandName: 'Lincoln University', title: 'New Student Orientation: Everything You Need to Know', uploaderName: "Dean's Office",       uploaderHandle: '@lincoln_dean',     uploaderInitials: 'DO', viewCount: 8900,  timestamp: new Date(_N - 5*_D),        duration: '41:55',   likeCount: 567,  commentCount: 74,  thumbHue: 180, thumbEmoji: '🎒', description: 'Complete orientation guide for incoming students. Registration, financial aid, housing, and student life.' },
  { id: 'fev6', mode: 'education', category: 'Campus',           brandName: 'Lincoln University', title: 'CS 210: Data Structures — Binary Trees Explained',     uploaderName: 'Prof. Maria Santos',  uploaderHandle: '@prof_santos',      uploaderInitials: 'MS', viewCount: 2150,  timestamp: new Date(_N - 7*_D),        duration: '44:18',   likeCount: 178,  commentCount: 25,  thumbHue: 220, thumbEmoji: '🖥️', description: 'Full lecture on binary search trees. Includes insertion, deletion, traversal, and complexity analysis.' },
  // State College — discovery (not subscribed)
  { id: 'fsc1', mode: 'education', category: 'Campus',           brandName: 'State College', title: 'State College Fall 2026 Preview — What\'s New',           uploaderName: 'State College',    uploaderHandle: '@statecollege',    uploaderInitials: 'SC', viewCount: 8700,  timestamp: new Date(_N - 2*_D),  duration: '14:18',    likeCount: 634,  commentCount: 88,  thumbHue: 320, thumbEmoji: '🏫', description: 'What\'s new at State College for Fall 2026. New buildings, programs, and student resources.' },
  { id: 'fsc2', mode: 'education', category: 'Student Showcase', brandName: 'State College', title: 'State College Senior Design Finals 2026',                 uploaderName: 'SC Engineering', uploaderHandle: '@sc_engineering',  uploaderInitials: 'SE', viewCount: 4200,  timestamp: new Date(_N - 5*_D),  duration: '1:12:44',  likeCount: 345,  commentCount: 62,  thumbHue: 320, thumbEmoji: '🛠️', description: 'Full recording of 2026 Senior Design Final presentations. Some truly impressive projects this year.' },
  { id: 'fsc3', mode: 'education', category: 'Orientation',      brandName: 'State College', title: 'Welcome to State College — Class of 2026 Orientation',    uploaderName: 'SC Admissions',  uploaderHandle: '@sc_admissions',   uploaderInitials: 'SA', viewCount: 15600, timestamp: new Date(_N - 9*_D),  duration: '28:55',    likeCount: 1120, commentCount: 178, thumbHue: 320, thumbEmoji: '🎓', description: 'Official orientation video for the Class of 2026. Campus resources and how to get started.' },
];

const FEED_COMMUNITY: KayTVFeedItem[] = [
  // ── Real game film ──
  { id: 'gc1', mode: 'community', ..._GAME_IRVINE,  timestamp: _minsAgo(5)  },
  { id: 'gc2', mode: 'community', ..._GAME_LMU,     timestamp: _minsAgo(20) },
  { id: 'gc3', mode: 'community', ..._GAME_PEPPER,  timestamp: _minsAgo(35) },
  { id: 'gc4', mode: 'community', ..._GAME_LB,      timestamp: _minsAgo(50) },
  { id: 'gc5', mode: 'community', ..._GAME_WEBER,   timestamp: _minsAgo(65) },
  { id: 'gc6', mode: 'community', ..._GAME_SIMPSON, timestamp: _minsAgo(80) },
  { id: 'gc7', mode: 'community', ..._GAME_MAR_W,   timestamp: _minsAgo(95) },
  { id: 'gc8', mode: 'community', ..._GAME_MAR_L,   timestamp: _minsAgo(110) },
  // ── Mock feed ──
  { id: 'fcv1', mode: 'community', category: 'Sermons',     brandName: 'Grace Church', title: 'Sunday Service — "Walking in Purpose" | Pastor Davis',  uploaderName: 'Grace Church LA',       uploaderHandle: '@grace_church',    uploaderInitials: 'GC', viewCount: 6700,  timestamp: new Date(_N - 2*_D),  duration: '42:15',   likeCount: 891,  commentCount: 156, thumbHue: 280, thumbEmoji: '✝️', description: 'Full Sunday message by Pastor Davis. Scripture: Jeremiah 29:11. Topic: Walking in the purpose God has for your life.' },
  { id: 'fcv2', mode: 'community', category: 'Worship',     brandName: 'Grace Church', title: 'Worship Night 2026 — Live Recording',                   uploaderName: 'Grace Church Music',    uploaderHandle: '@grace_music',     uploaderInitials: 'GM', viewCount: 9200,  timestamp: new Date(_N - 4*_D),  duration: '1:08:30', likeCount: 1240, commentCount: 203, thumbHue: 50,  thumbEmoji: '🎵', description: 'Full live recording from our annual Worship Night. Features the full band, choir, and special guests.' },
  { id: 'fcv3', mode: 'community', category: 'Events',      brandName: 'Grace Church', title: 'Community Outreach Day — March 2026 Recap',             uploaderName: 'Grace Church Outreach', uploaderHandle: '@grace_outreach',  uploaderInitials: 'GO', viewCount: 3400,  timestamp: new Date(_N - 6*_D),  duration: '9:22',    likeCount: 445,  commentCount: 67,  thumbHue: 120, thumbEmoji: '🤝', description: 'Recap of our March community outreach day. Over 200 volunteers served 850 families across four neighborhoods.' },
  { id: 'fcv4', mode: 'community', category: 'Testimonies', brandName: 'Grace Church', title: '"How Faith Carried Me Through Loss" — Sister Johnson',  uploaderName: 'Grace Church',          uploaderHandle: '@grace_church',    uploaderInitials: 'GC', viewCount: 14800, timestamp: new Date(_N - 8*_D),  duration: '18:44',   likeCount: 2300, commentCount: 412, thumbHue: 340, thumbEmoji: '❤️', description: 'Sister Patricia Johnson shares her powerful testimony of faith through grief and loss.' },
  { id: 'fcv5', mode: 'community', category: 'Sermons',     brandName: 'Grace Church', title: 'Wednesday Bible Study — Romans 8: Deep Dive',           uploaderName: 'Pastor Davis',          uploaderHandle: '@pastor_davis',    uploaderInitials: 'PD', viewCount: 4100,  timestamp: new Date(_N - 9*_D),  duration: '55:18',   likeCount: 678,  commentCount: 98,  thumbHue: 200, thumbEmoji: '📖', description: 'Recorded Wednesday Bible study on Romans 8. We go verse-by-verse through one of Scripture\'s most powerful chapters.' },
  { id: 'fcv6', mode: 'community', category: 'Sermons',     brandName: 'Grace Church', title: '"The Power of Forgiveness" — Easter Sunday Message',    uploaderName: 'Grace Church LA',       uploaderHandle: '@grace_church',    uploaderInitials: 'GC', viewCount: 22100, timestamp: new Date(_N - 12*_D), duration: '47:55',   likeCount: 3400, commentCount: 589, thumbHue: 30,  thumbEmoji: '✝️', description: 'Easter Sunday message on forgiveness, redemption, and the resurrection.' },
  // City Fellowship — discovery (not subscribed)
  { id: 'fcf1', mode: 'community', category: 'Sermons',     brandName: 'City Fellowship', title: '"Grace for Today" — Sunday Sermon | Pastor Wilson',   uploaderName: 'City Fellowship',        uploaderHandle: '@cityfellowship', uploaderInitials: 'CF', viewCount: 8900,  timestamp: new Date(_N - 3*_D),  duration: '38:22', likeCount: 1230, commentCount: 215, thumbHue: 60, thumbEmoji: '✝️', description: 'Pastor Wilson brings a message of grace and renewal from 2 Corinthians 12:9.' },
  { id: 'fcf2', mode: 'community', category: 'Worship',     brandName: 'City Fellowship', title: 'City Fellowship Live Worship — March 2026',           uploaderName: 'CF Worship Team',        uploaderHandle: '@cf_worship',     uploaderInitials: 'CW', viewCount: 12400, timestamp: new Date(_N - 6*_D),  duration: '55:44', likeCount: 1890, commentCount: 312, thumbHue: 60, thumbEmoji: '🎶', description: 'Full live worship set from City Fellowship\'s March 2026 Sunday service.' },
  { id: 'fcf3', mode: 'community', category: 'Events',      brandName: 'City Fellowship', title: 'City Fellowship Community Night — Spring 2026',       uploaderName: 'City Fellowship Events', uploaderHandle: '@cf_events',      uploaderInitials: 'CE', viewCount: 5200,  timestamp: new Date(_N - 10*_D), duration: '12:08', likeCount: 678,  commentCount: 95,  thumbHue: 60, thumbEmoji: '🌟', description: 'Recap of our Spring Community Night. Great fellowship, food, and fun for the whole family.' },
];

const FEED_PERSONAL: KayTVFeedItem[] = [
  // ── Real game film ──
  { id: 'gp1', mode: 'personal', ..._GAME_LMU,     timestamp: _minsAgo(5)  },
  { id: 'gp2', mode: 'personal', ..._GAME_SIMPSON, timestamp: _minsAgo(20) },
  { id: 'gp3', mode: 'personal', ..._GAME_PEPPER,  timestamp: _minsAgo(35) },
  { id: 'gp4', mode: 'personal', ..._GAME_LB,      timestamp: _minsAgo(50) },
  { id: 'gp5', mode: 'personal', ..._GAME_WEBER,   timestamp: _minsAgo(65) },
  { id: 'gp6', mode: 'personal', ..._GAME_IRVINE,  timestamp: _minsAgo(80) },
  { id: 'gp7', mode: 'personal', ..._GAME_MAR_W,   timestamp: _minsAgo(95) },
  { id: 'gp8', mode: 'personal', ..._GAME_MAR_L,   timestamp: _minsAgo(110) },
  // ── Mock feed ──
  { id: 'fpv1', mode: 'personal', category: 'Uploads',     brandName: 'Personal', title: 'My First KayTV Upload — Testing 1 2 3',               uploaderName: 'Sammy K.',         uploaderHandle: '@sammyk',      uploaderInitials: 'SK', viewCount: 42,   timestamp: new Date(_N - 1*_D),        duration: '0:47',  likeCount: 8,  commentCount: 3,  thumbHue: 200, thumbEmoji: '📹', description: 'Just testing the upload feature.' },
  { id: 'fpv2', mode: 'personal', category: 'Saved',       brandName: 'Personal', title: 'Top 10 Plays — Week 7 Highlights Reel',               uploaderName: 'Coach Rodriguez',  uploaderHandle: '@coach_rod',   uploaderInitials: 'CR', viewCount: 8320, timestamp: new Date(_N - 6*3_600_000), duration: '4:15',  likeCount: 541, commentCount: 67, thumbHue: 12,  thumbEmoji: '🔥', description: 'Saved from the sports feed. Great highlights reel.' },
  { id: 'fpv3', mode: 'personal', category: 'Watch Later', brandName: 'Personal', title: 'Q4 Product Roadmap Presentation',                     uploaderName: 'Alex Rivera (CPO)', uploaderHandle: '@alex_cpo',   uploaderInitials: 'AR', viewCount: 5100, timestamp: new Date(_N - 8*3_600_000), duration: '31:48', likeCount: 312, commentCount: 54, thumbHue: 240, thumbEmoji: '🗺️', description: 'Watch later from the business feed.' },
];

const ALL_FEED: KayTVFeedItem[] = [
  ...FEED_SPORTS, ...FEED_BUSINESS, ...FEED_EDUCATION, ...FEED_COMMUNITY, ...FEED_PERSONAL,
];

// Home feed: brands the user is a member of, sorted most recent first.
export function getKayTVFeed(mode: string, category = 'All'): KayTVFeedItem[] {
  const subscribed = SUBSCRIBED_BRANDS[mode] ?? [];
  const items = ALL_FEED.filter(v =>
    v.mode === mode && (subscribed.length === 0 || subscribed.includes(v.brandName))
  );
  const filtered = category === 'All' ? items : items.filter(v => v.category === category);
  return filtered.slice().sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function getAllKayTVFeed(): KayTVFeedItem[] {
  return ALL_FEED;
}

export function getKayTVFeedItem(id: string): KayTVFeedItem | undefined {
  return ALL_FEED.find(v => v.id === id);
}

export function getRelatedFeedItems(video: KayTVFeedItem, limit = 6): KayTVFeedItem[] {
  return ALL_FEED.filter(v => v.id !== video.id && v.mode === video.mode).slice(0, limit);
}

// Explore feed: discovery — brands the user is NOT a member of, within the current mode.
// Rows: Trending / Popular This Week / New Brands / Rising Creators.
export function getExploreRows(mode: string, category = 'All'): ExploreRow[] {
  if (mode === 'personal') return [];
  const subscribed = SUBSCRIBED_BRANDS[mode] ?? [];
  const pool = ALL_FEED.filter(v =>
    v.mode === mode && !subscribed.includes(v.brandName)
  );
  const filtered = category === 'All' ? pool : pool.filter(v => v.category === category);
  if (filtered.length === 0) return [];

  const _7d = 7 * 86_400_000;
  const now = Date.now();

  const trending       = [...filtered].sort((a, b) => b.viewCount - a.viewCount).slice(0, 8);
  const popularWeek    = [...filtered].filter(v => now - v.timestamp.getTime() <= _7d)
                                      .sort((a, b) => b.viewCount - a.viewCount).slice(0, 8);
  const newBrands      = [...filtered].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 8);
  const risingCreators = [...filtered].sort((a, b) => (b.likeCount + b.commentCount) - (a.likeCount + a.commentCount)).slice(0, 8);

  const rows: ExploreRow[] = [];
  if (trending.length)       rows.push({ id: 'trending',      label: 'Trending',           items: trending });
  if (popularWeek.length)    rows.push({ id: 'popular-week',  label: 'Popular This Week',  items: popularWeek });
  if (newBrands.length)      rows.push({ id: 'new-brands',    label: 'New Brands',         items: newBrands });
  if (risingCreators.length) rows.push({ id: 'rising',        label: 'Rising Creators',    items: risingCreators });
  return rows;
}

// Library feeds — all mode-scoped (only shows content from the current mode).
export function getWatchHistoryFeed(mode: string): KayTVFeedItem[] {
  const items = ALL_FEED.filter(v => v.mode === mode);
  return items.slice().sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 6);
}

export function getWatchLaterFeed(mode: string): KayTVFeedItem[] {
  // Simulate watch-later as older items (things saved to come back to)
  const items = ALL_FEED.filter(v => v.mode === mode);
  return items.slice().sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).slice(0, 4);
}

export function getLikedVideosFeed(mode: string): KayTVFeedItem[] {
  const items = ALL_FEED.filter(v => v.mode === mode);
  return items.slice().sort((a, b) => b.likeCount - a.likeCount).slice(0, 5);
}

// ── Panel data ────────────────────────────────────────────────────────────────

export interface KayTVSubscription {
  brandName: string;
  initials: string;
  hue: number;
  handle: string;
  hasNew: boolean;
  newCount: number;
}

export interface KayTVUpload {
  id: string;
  title: string;
  thumbHue: number;
  thumbEmoji: string;
  duration: string;
  viewCount: number;
  publishedDate: string;
  status: 'published' | 'draft';
}

export interface KayTVScheduled {
  id: string;
  title: string;
  thumbHue: number;
  thumbEmoji: string;
  duration: string;
  scheduledDate: string;
}

export interface KayTVChannelStats {
  uploadCount: number;
  totalViews: number;
  subscriberCount: number;
  viewsThisWeek: number;
  topVideoTitle: string;
  subGrowth: number;
}

const SUBSCRIPTIONS: Record<string, KayTVSubscription[]> = {
  sports: [
    { brandName: 'Varsity FC',        initials: 'VF', hue: 40,  handle: '@varsityfc',      hasNew: true,  newCount: 3 },
    { brandName: 'LU Athletics',      initials: 'LA', hue: 220, handle: '@lu_athletics',    hasNew: true,  newCount: 1 },
    { brandName: 'Metro Hoops',       initials: 'MH', hue: 0,   handle: '@metrohoops',      hasNew: false, newCount: 0 },
  ],
  business: [
    { brandName: 'NovaTech',          initials: 'NT', hue: 200, handle: '@novatech',         hasNew: true,  newCount: 2 },
    { brandName: 'KaNeXT',            initials: 'KN', hue: 160, handle: '@kanext',           hasNew: false, newCount: 0 },
    { brandName: 'Apex Ventures',     initials: 'AV', hue: 280, handle: '@apexventures',     hasNew: true,  newCount: 1 },
  ],
  education: [
    { brandName: 'Lincoln University', initials: 'LU', hue: 220, handle: '@lincoln_u',      hasNew: true,  newCount: 5 },
    { brandName: 'LU Athletics',       initials: 'LA', hue: 40,  handle: '@lu_athletics',   hasNew: false, newCount: 0 },
    { brandName: 'STEM Academy',       initials: 'SA', hue: 120, handle: '@stem_academy',   hasNew: true,  newCount: 2 },
  ],
  community: [
    { brandName: 'Grace Church',      initials: 'GC', hue: 30,  handle: '@grace_church',    hasNew: true,  newCount: 1 },
    { brandName: 'City Fellowship',   initials: 'CF', hue: 280, handle: '@cityfellowship',  hasNew: false, newCount: 0 },
    { brandName: 'Hope Ministries',   initials: 'HM', hue: 340, handle: '@hope_ministries', hasNew: true,  newCount: 3 },
  ],
  personal: [
    { brandName: 'Sammy Brand',       initials: 'SB', hue: 15,  handle: '@sammy',           hasNew: false, newCount: 0 },
    { brandName: 'KaNeXT Originals',  initials: 'KO', hue: 200, handle: '@kanext_orig',     hasNew: true,  newCount: 2 },
  ],
};

const MY_CHANNEL: KayTVChannelStats = {
  uploadCount: 24,
  totalViews: 142800,
  subscriberCount: 3400,
  viewsThisWeek: 8920,
  topVideoTitle: 'Season Highlights Reel 2025',
  subGrowth: 12.4,
};

const MY_UPLOADS: KayTVUpload[] = [
  { id: 'mu1', title: 'Championship Recap — Final Score 87–72', thumbHue: 40,  thumbEmoji: '🏆', duration: '8:14',  viewCount: 12400, publishedDate: 'Mar 20', status: 'published' },
  { id: 'mu2', title: 'Post-Game Press Conference',              thumbHue: 220, thumbEmoji: '🎙️', duration: '15:30', viewCount: 4800,  publishedDate: 'Mar 18', status: 'published' },
  { id: 'mu3', title: 'Practice Highlights — New Plays',         thumbHue: 160, thumbEmoji: '🏀', duration: '5:45',  viewCount: 2100,  publishedDate: 'Mar 15', status: 'published' },
  { id: 'mu4', title: 'Season Preview 2026 (Draft)',              thumbHue: 90,  thumbEmoji: '📋', duration: '3:10',  viewCount: 0,     publishedDate: '—',      status: 'draft'     },
];

const SCHEDULED_VIDEOS: KayTVScheduled[] = [
  { id: 'sv1', title: 'Player Profile: Marcus James',    thumbHue: 200, thumbEmoji: '⭐', duration: '6:22', scheduledDate: 'Mar 27, 9:00 AM' },
  { id: 'sv2', title: 'Weekly Roundup — March Week 4',   thumbHue: 40,  thumbEmoji: '📊', duration: '4:15', scheduledDate: 'Mar 28, 8:00 AM' },
];

export function getSubscriptions(mode: string): KayTVSubscription[] {
  return SUBSCRIPTIONS[mode] ?? [];
}

export function getMyChannelStats(): KayTVChannelStats {
  return MY_CHANNEL;
}

export function getMyUploads(): KayTVUpload[] {
  return MY_UPLOADS;
}

export function getScheduledVideos(): KayTVScheduled[] {
  return SCHEDULED_VIDEOS;
}
