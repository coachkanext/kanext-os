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
