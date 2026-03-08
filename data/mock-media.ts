/**
 * Mock Media / Browse Data
 * Types, mock data, and helpers for the Media screen Browse + Library pages.
 * Mode-keyed exports for all 4 modes.
 */

import type { Mode } from '@/types';
import { formatDuration } from '@/data/mock-video';

// =============================================================================
// TYPES
// =============================================================================

export interface BrowseVideo {
  id: string;
  title: string;
  creator: string;
  creatorInitials: string;
  thumbnailColor: string;
  thumbnailUrl?: string;
  duration: number; // seconds
  viewCount: number;
  timestamp: string; // "3 days ago", "2 hours ago"
  isLive?: boolean;
}

export interface BrowseCategory {
  id: string;
  label: string;
  videos: BrowseVideo[];
}

export interface PlaylistItem {
  id: string;
  name: string;
  videoCount: number;
  thumbnailColors: string[]; // 4 colors for grid cover
}

// =============================================================================
// HELPERS
// =============================================================================

export function formatViewCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K views`;
  return `${n} views`;
}

export function formatVideoTime(seconds: number): string {
  return formatDuration(seconds);
}

// Unsplash direct image helper (public, hotlinkable, auto-cropped)
const u = (id: string, w = 640, h = 360) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&q=80`;

// =============================================================================
// SPORTS MODE — Browse Categories
// =============================================================================

const SPORTS_BROWSE: BrowseCategory[] = [
  {
    id: 'sb-live',
    label: 'Live Now',
    videos: [
      { id: 'sbv-1', title: 'Carroll vs Campbell — LIVE', creator: 'Fighting Saints TV', creatorInitials: 'FS', thumbnailColor: '#EF4444', thumbnailUrl: u('photo-1546519638-68e109498ffc'), duration: 0, viewCount: 1240, timestamp: 'Streaming now', isLive: true },
      { id: 'sbv-2', title: 'Halftime Show — Marching Band', creator: 'Carroll Athletics', creatorInitials: 'CA', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1471295253337-3ceaaedca402'), duration: 0, viewCount: 430, timestamp: 'Streaming now', isLive: true },
    ],
  },
  {
    id: 'sb-team',
    label: 'Your Team',
    videos: [
      { id: 'sbv-3', title: 'Marcus Johnson 22-pt Performance', creator: 'Carroll Athletics', creatorInitials: 'CA', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1504450758481-7338eba7524a'), duration: 194, viewCount: 2340, timestamp: '3 days ago' },
      { id: 'sbv-4', title: 'Deon Williams Block Party', creator: 'Carroll Athletics', creatorInitials: 'CA', thumbnailColor: '#EF4444', thumbnailUrl: u('photo-1519861531473-9200262188bf'), duration: 87, viewCount: 1890, timestamp: '1 week ago' },
      { id: 'sbv-5', title: 'Tyler Roberts — Playmaking Cuts', creator: 'Carroll Athletics', creatorInitials: 'CA', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1574623452334-9e0bd3668cae'), duration: 154, viewCount: 1560, timestamp: '2 weeks ago' },
      { id: 'sbv-6', title: 'Top 10 Plays — January', creator: 'Carroll Athletics', creatorInitials: 'CA', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1608245449230-4ac19066d2d0'), duration: 180, viewCount: 4120, timestamp: '3 weeks ago' },
    ],
  },
  {
    id: 'sb-trending',
    label: 'Trending',
    videos: [
      { id: 'sbv-7', title: 'Conference Tournament Preview', creator: 'Big South Network', creatorInitials: 'BS', thumbnailColor: '#1D9BF0', thumbnailUrl: u('photo-1540747913346-19e32dc3e97e'), duration: 720, viewCount: 12400, timestamp: '1 day ago' },
      { id: 'sbv-8', title: 'March Madness Bracket Breakdown', creator: 'NCAA', creatorInitials: 'NC', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1587280501635-68a0e82cd5ff'), duration: 1200, viewCount: 89000, timestamp: '2 days ago' },
      { id: 'sbv-9', title: 'Transition Defense Masterclass', creator: 'Coaching Clinic', creatorInitials: 'CC', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1559692048-79a3f837883d'), duration: 480, viewCount: 5600, timestamp: '4 days ago' },
      { id: 'sbv-10', title: 'Top Dunks of the Week', creator: 'Dunk Central', creatorInitials: 'DC', thumbnailColor: '#F59E0B', thumbnailUrl: u('photo-1628779238951-be2c9f2a59f4'), duration: 300, viewCount: 34000, timestamp: '5 days ago' },
    ],
  },
  {
    id: 'sb-recent',
    label: 'Recent Uploads',
    videos: [
      { id: 'sbv-11', title: 'Pregame Warmup — Campbell', creator: 'Carroll Athletics', creatorInitials: 'CA', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1461896836934-bd45ba055fe7'), duration: 120, viewCount: 890, timestamp: '2 hours ago' },
      { id: 'sbv-12', title: 'Practice Highlights — Feb 14', creator: 'Coach Film', creatorInitials: 'CF', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1552674605-db6ffd4facb5'), duration: 360, viewCount: 456, timestamp: '8 hours ago' },
      { id: 'sbv-13', title: 'Film Room — Zone Press Break', creator: 'Coach Film', creatorInitials: 'CF', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1517649763962-0c623066013b'), duration: 420, viewCount: 234, timestamp: '1 day ago' },
    ],
  },
  {
    id: 'sb-games',
    label: 'Full Games',
    videos: [
      { id: 'sbv-14', title: 'vs Coastal Carolina — Full Game', creator: 'Fighting Saints TV', creatorInitials: 'FS', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1505666287802-931dc83948e5'), duration: 7200, viewCount: 3400, timestamp: '3 days ago' },
      { id: 'sbv-15', title: 'vs UNC Asheville — Full Game', creator: 'Fighting Saints TV', creatorInitials: 'FS', thumbnailColor: '#1D9BF0', thumbnailUrl: u('photo-1459865264687-595d652de67e'), duration: 6840, viewCount: 2100, timestamp: '1 week ago' },
      { id: 'sbv-16', title: 'vs Radford — Full Game', creator: 'Fighting Saints TV', creatorInitials: 'FS', thumbnailColor: '#EF4444', thumbnailUrl: u('photo-1577471488278-16eec37ffcc2'), duration: 6600, viewCount: 1800, timestamp: '2 weeks ago' },
    ],
  },
  {
    id: 'sb-coaching',
    label: 'Coaching Film',
    videos: [
      { id: 'sbv-17', title: 'Transition Defense Breakdown', creator: 'Coach Film', creatorInitials: 'CF', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1511886929837-354d827aae26'), duration: 312, viewCount: 780, timestamp: '3 days ago' },
      { id: 'sbv-18', title: 'Pick & Roll Execution vs Winthrop', creator: 'Coach Film', creatorInitials: 'CF', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1475403614135-5f1aa0eb5015'), duration: 268, viewCount: 560, timestamp: '2 weeks ago' },
      { id: 'sbv-19', title: 'Zone Defense Adjustments — Feb Film', creator: 'Coach Film', creatorInitials: 'CF', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1518407613690-d9fc990e795f'), duration: 340, viewCount: 345, timestamp: '3 weeks ago' },
    ],
  },
];

const SPORTS_FEATURED: BrowseVideo = {
  id: 'sf-1',
  title: 'Carroll vs Campbell — LIVE',
  creator: 'Fighting Saints TV',
  creatorInitials: 'FS',
  thumbnailColor: '#EF4444',
  thumbnailUrl: u('photo-1504450758481-7338eba7524a', 800, 400),
  duration: 0,
  viewCount: 1240,
  timestamp: 'Streaming now',
  isLive: true,
};

// =============================================================================
// CHURCH MODE — Browse Categories
// =============================================================================

const CHURCH_BROWSE: BrowseCategory[] = [
  {
    id: 'cb-live',
    label: 'Live Now',
    videos: [
      { id: 'cbv-1', title: 'Sunday Service — LIVE', creator: '2819 Church', creatorInitials: '28', thumbnailColor: '#EF4444', thumbnailUrl: u('photo-1438032005730-c779502df39b'), duration: 0, viewCount: 320, timestamp: 'Streaming now', isLive: true },
    ],
  },
  {
    id: 'cb-church',
    label: 'Your Church',
    videos: [
      { id: 'cbv-2', title: 'Walking in Faith — Full Sermon', creator: 'Pastor Mitchell', creatorInitials: 'PM', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1507692049790-de58290a4334'), duration: 2535, viewCount: 1240, timestamp: '3 days ago' },
      { id: 'cbv-3', title: 'Baptism Sunday — 7 New Believers', creator: '2819 Church', creatorInitials: '28', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1473177104440-ffee2f376098'), duration: 540, viewCount: 890, timestamp: '2 weeks ago' },
      { id: 'cbv-4', title: 'Worship Night Highlights', creator: '2819 Worship', creatorInitials: '2W', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1510915361894-db8b60106cb1'), duration: 378, viewCount: 650, timestamp: '3 weeks ago' },
      { id: 'cbv-5', title: 'Youth Retreat — Day 1 Recap', creator: '2819 Youth', creatorInitials: '2Y', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1529156069898-49953e39b3ac'), duration: 300, viewCount: 287, timestamp: '1 week ago' },
    ],
  },
  {
    id: 'cb-trending',
    label: 'Trending',
    videos: [
      { id: 'cbv-6', title: 'Don\'t Quit — 1 Min Encouragement', creator: 'Pastor Mitchell', creatorInitials: 'PM', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1470071459604-3b5ec3a7fe05'), duration: 60, viewCount: 6120, timestamp: '4 days ago' },
      { id: 'cbv-7', title: 'Easter Worship Prep — BTS', creator: '2819 Worship', creatorInitials: '2W', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1508672019048-805c876b67e2'), duration: 180, viewCount: 1450, timestamp: '2 days ago' },
      { id: 'cbv-8', title: 'Community Outreach Recap', creator: '2819 Church', creatorInitials: '28', thumbnailColor: '#22C55E', thumbnailUrl: u('photo-1469571486292-0ba58a3f068b'), duration: 420, viewCount: 1980, timestamp: '1 week ago' },
    ],
  },
  {
    id: 'cb-sermons',
    label: 'Sermons',
    videos: [
      { id: 'cbv-9', title: 'Faith Forward Series — Pt. 1', creator: 'Pastor Mitchell', creatorInitials: 'PM', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1447752875215-b2761acb3c5d'), duration: 2700, viewCount: 980, timestamp: '3 weeks ago' },
      { id: 'cbv-10', title: 'Faith Forward Series — Pt. 2', creator: 'Pastor Mitchell', creatorInitials: 'PM', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1504052434569-70ad5836ab65'), duration: 2400, viewCount: 870, timestamp: '2 weeks ago' },
      { id: 'cbv-11', title: 'Armor of God Study — Pt. 3', creator: 'Pastor Mitchell', creatorInitials: 'PM', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1499209974431-9dddcece7f88'), duration: 2400, viewCount: 560, timestamp: '1 week ago' },
    ],
  },
  {
    id: 'cb-worship',
    label: 'Worship',
    videos: [
      { id: 'cbv-12', title: 'Great Is Thy Faithfulness — Full', creator: '2819 Worship', creatorInitials: '2W', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1493225457124-a3eb161ffa5f'), duration: 360, viewCount: 1340, timestamp: '3 days ago' },
      { id: 'cbv-13', title: 'Praise & Worship — Jan 25', creator: '2819 Worship', creatorInitials: '2W', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1501281668745-f7f57925c3b4'), duration: 480, viewCount: 780, timestamp: '3 weeks ago' },
    ],
  },
  {
    id: 'cb-recent',
    label: 'Recent Uploads',
    videos: [
      { id: 'cbv-14', title: 'Choir Rehearsal — Easter Prep', creator: '2819 Choir', creatorInitials: '2C', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1514320291840-2e0a9bf2a9ae'), duration: 1800, viewCount: 145, timestamp: '5 hours ago' },
      { id: 'cbv-15', title: 'Prayer Night Atmosphere', creator: '2819 Church', creatorInitials: '28', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1504052434569-70ad5836ab65'), duration: 300, viewCount: 234, timestamp: '1 day ago' },
    ],
  },
];

const CHURCH_FEATURED: BrowseVideo = {
  id: 'cf-1',
  title: 'Sunday Service — LIVE',
  creator: '2819 Church',
  creatorInitials: '28',
  thumbnailColor: '#0081CA',
  thumbnailUrl: u('photo-1438032005730-c779502df39b', 800, 400),
  duration: 0,
  viewCount: 320,
  timestamp: 'Streaming now',
  isLive: true,
};

// =============================================================================
// EDUCATION MODE — Browse Categories
// =============================================================================

const EDUCATION_BROWSE: BrowseCategory[] = [
  {
    id: 'eb-live',
    label: 'Live Now',
    videos: [
      { id: 'ebv-1', title: 'CS 401 — Machine Learning (Live)', creator: 'Prof. Adebayo', creatorInitials: 'PA', thumbnailColor: '#EF4444', thumbnailUrl: u('photo-1517694712202-14dd9538aa97'), duration: 0, viewCount: 89, timestamp: 'Streaming now', isLive: true },
    ],
  },
  {
    id: 'eb-campus',
    label: 'Your Campus',
    videos: [
      { id: 'ebv-2', title: 'Solo Flight Day — 6 Cadets Soar', creator: 'Howard Aviation', creatorInitials: 'HA', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1540962351504-03099e0a754b'), duration: 525, viewCount: 3400, timestamp: '1 week ago' },
      { id: 'ebv-3', title: 'Homecoming 2026 — Best Moments', creator: 'Howard', creatorInitials: 'HU', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1523050854058-8df90110c9f1'), duration: 270, viewCount: 5600, timestamp: '4 days ago' },
      { id: 'ebv-4', title: 'Dean\'s List Walk', creator: 'Howard', creatorInitials: 'HU', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1541339907198-e08756dedf3f'), duration: 300, viewCount: 456, timestamp: '2 weeks ago' },
      { id: 'ebv-5', title: 'Campus Tour — Spring 2026', creator: 'Howard Admissions', creatorInitials: 'AD', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1562774053-701939374585'), duration: 420, viewCount: 6780, timestamp: '3 weeks ago' },
    ],
  },
  {
    id: 'eb-trending',
    label: 'Trending',
    videos: [
      { id: 'ebv-6', title: 'Fighting Saints Basketball Highlights', creator: 'Howard Athletics', creatorInitials: 'FA', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1546519638-68e109498ffc'), duration: 228, viewCount: 8900, timestamp: '1 day ago' },
      { id: 'ebv-7', title: 'Student Talent Show Highlights', creator: 'Campus Life', creatorInitials: 'CL', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1514525253161-7a46d19cd819'), duration: 300, viewCount: 15600, timestamp: '2 weeks ago' },
      { id: 'ebv-8', title: 'AI in Healthcare — Research Spotlight', creator: 'Dr. Chen', creatorInitials: 'DC', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1532094349884-543bc11b234d'), duration: 1100, viewCount: 1200, timestamp: '9 days ago' },
    ],
  },
  {
    id: 'eb-lectures',
    label: 'Lectures',
    videos: [
      { id: 'ebv-9', title: 'ML Lecture — Neural Networks', creator: 'Prof. Adebayo', creatorInitials: 'PA', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1555949963-ff9fe0c870eb'), duration: 1200, viewCount: 450, timestamp: '2 days ago' },
      { id: 'ebv-10', title: 'Genomics — Guest Lecture', creator: 'Biology Dept', creatorInitials: 'BD', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1530210124550-912dc1381cb8'), duration: 2700, viewCount: 230, timestamp: '2 weeks ago' },
      { id: 'ebv-11', title: 'Study Skills Workshop', creator: 'Prof. Morris', creatorInitials: 'DM', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1456513080510-7bf3a84b82f8'), duration: 2400, viewCount: 180, timestamp: '3 weeks ago' },
    ],
  },
  {
    id: 'eb-events',
    label: 'Campus Events',
    videos: [
      { id: 'ebv-12', title: 'Research Symposium — Panel A', creator: 'Graduate Studies', creatorInitials: 'GS', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1540575467063-178a50a2fd60'), duration: 3600, viewCount: 340, timestamp: '9 days ago' },
      { id: 'ebv-13', title: 'Student Government Speeches', creator: 'Student Gov', creatorInitials: 'SG', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1475721027785-f74eccf877e2'), duration: 600, viewCount: 890, timestamp: '2 weeks ago' },
      { id: 'ebv-14', title: 'Spring Orientation Recap', creator: 'Howard', creatorInitials: 'HU', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1523580494863-6f3031224c94'), duration: 480, viewCount: 1200, timestamp: '1 month ago' },
    ],
  },
  {
    id: 'eb-recent',
    label: 'Recent Uploads',
    videos: [
      { id: 'ebv-15', title: 'Lab Tour — New Science Building', creator: 'Howard Campus', creatorInitials: 'HC', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1567168544230-6b0cf76b1c7c'), duration: 480, viewCount: 678, timestamp: '6 hours ago' },
      { id: 'ebv-16', title: 'Research Spotlight — AI Lab', creator: 'Howard Research', creatorInitials: 'HR', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1485827404703-89b55fcc595e'), duration: 210, viewCount: 345, timestamp: '1 day ago' },
    ],
  },
];

const EDUCATION_FEATURED: BrowseVideo = {
  id: 'ef-1',
  title: 'Solo Flight Day — 6 Cadets Soar',
  creator: 'Howard Aviation Program',
  creatorInitials: 'HA',
  thumbnailColor: '#003A63',
  thumbnailUrl: u('photo-1540962351504-03099e0a754b', 800, 400),
  duration: 525,
  viewCount: 3400,
  timestamp: '1 week ago',
};

// =============================================================================
// BUSINESS MODE — Browse Categories
// =============================================================================

const BUSINESS_BROWSE: BrowseCategory[] = [
  {
    id: 'bb-live',
    label: 'Live Now',
    videos: [
      { id: 'bbv-1', title: 'All-Hands — February (Live)', creator: 'Valuetainment', creatorInitials: 'VT', thumbnailColor: '#EF4444', thumbnailUrl: u('photo-1515187029135-18ee286d815b'), duration: 0, viewCount: 32, timestamp: 'Streaming now', isLive: true },
    ],
  },
  {
    id: 'bb-company',
    label: 'Your Company',
    videos: [
      { id: 'bbv-2', title: 'V2 — Full Product Demo', creator: 'Product Team', creatorInitials: 'PT', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1531482615713-2afd69097998'), duration: 900, viewCount: 2100, timestamp: '4 days ago' },
      { id: 'bbv-3', title: 'Sprint 14 — Film Room Feature', creator: 'Engineering', creatorInitials: 'EN', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1498050108023-c5249f4df085'), duration: 600, viewCount: 890, timestamp: '1 week ago' },
      { id: 'bbv-4', title: 'Founder Diary #12 — On Focus', creator: 'Alex Morgan', creatorInitials: 'SK', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1507003211169-0a1dd7228f2d'), duration: 202, viewCount: 950, timestamp: '4 days ago' },
      { id: 'bbv-5', title: 'Mode Switching Deep-Dive', creator: 'Product Team', creatorInitials: 'PT', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1460925895917-afdab827c52f'), duration: 480, viewCount: 670, timestamp: '4 days ago' },
    ],
  },
  {
    id: 'bb-trending',
    label: 'Trending',
    videos: [
      { id: 'bbv-6', title: 'HBCU Tech Summit — Booth Highlights', creator: 'Marketing', creatorInitials: 'MK', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1540575467063-178a50a2fd60'), duration: 240, viewCount: 1800, timestamp: '2 weeks ago' },
      { id: 'bbv-7', title: 'MLK Truth Classic — Full Reveal', creator: 'Valuetainment', creatorInitials: 'VT', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1504450758481-7338eba7524a'), duration: 420, viewCount: 12300, timestamp: '3 weeks ago' },
      { id: 'bbv-8', title: 'Customer Testimonial — Coach K', creator: 'Customer Success', creatorInitials: 'CS', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1557804506-669a67965ba0'), duration: 300, viewCount: 4560, timestamp: '2 days ago' },
    ],
  },
  {
    id: 'bb-demos',
    label: 'Product Demos',
    videos: [
      { id: 'bbv-9', title: 'V2 Demo in 60 Seconds', creator: 'Product Team', creatorInitials: 'PT', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1551650975-87deedd944c3'), duration: 60, viewCount: 5670, timestamp: '4 days ago' },
      { id: 'bbv-10', title: 'Design System Overview — V2', creator: 'Design', creatorInitials: 'DS', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1545235617-9465d2a55698'), duration: 900, viewCount: 340, timestamp: '2 weeks ago' },
    ],
  },
  {
    id: 'bb-culture',
    label: 'Culture',
    videos: [
      { id: 'bbv-11', title: 'Office Tour — Miami', creator: 'Valuetainment', creatorInitials: 'VT', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1497366216548-37526070297c'), duration: 168, viewCount: 678, timestamp: '1 month ago' },
      { id: 'bbv-12', title: 'Team Standup Energy', creator: 'Valuetainment', creatorInitials: 'VT', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1522071820081-009f0129c71c'), duration: 120, viewCount: 189, timestamp: '1 day ago' },
    ],
  },
  {
    id: 'bb-recent',
    label: 'Recent Uploads',
    videos: [
      { id: 'bbv-13', title: 'Sprint 14 Highlights', creator: 'Engineering', creatorInitials: 'EN', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1519389950473-47ba0277781c'), duration: 252, viewCount: 234, timestamp: '3 hours ago' },
      { id: 'bbv-14', title: 'Competitive Landscape Analysis', creator: 'Strategy', creatorInitials: 'ST', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1551288049-bebda4e38f71'), duration: 1500, viewCount: 120, timestamp: '1 day ago' },
    ],
  },
];

const BUSINESS_FEATURED: BrowseVideo = {
  id: 'bf-1',
  title: 'Valuetainment V2 — Full Product Demo',
  creator: 'Product Team',
  creatorInitials: 'PT',
  thumbnailColor: '#1D9BF0',
  thumbnailUrl: u('photo-1531482615713-2afd69097998', 800, 400),
  duration: 900,
  viewCount: 2100,
  timestamp: '4 days ago',
};

// =============================================================================
// MODE-KEYED EXPORTS
// =============================================================================

export const BROWSE_CATEGORIES_BY_MODE: Record<Mode, BrowseCategory[]> = {
  sports: SPORTS_BROWSE,
  church: CHURCH_BROWSE,
  education: EDUCATION_BROWSE,
  business: BUSINESS_BROWSE,
};

export const FEATURED_BY_MODE: Record<Mode, BrowseVideo> = {
  sports: SPORTS_FEATURED,
  church: CHURCH_FEATURED,
  education: EDUCATION_FEATURED,
  business: BUSINESS_FEATURED,
};

// =============================================================================
// LIBRARY DATA (Mode-agnostic)
// =============================================================================

export const PLAYLISTS: PlaylistItem[] = [
  { id: 'pl-1', name: 'Favorites', videoCount: 24, thumbnailColors: ['#EF4444', '#1D9BF0', '#0B0F14', '#22C55E'] },
  { id: 'pl-2', name: 'Watch Later', videoCount: 12, thumbnailColors: ['#0B0F14', '#F59E0B', '#0B0F14', '#1D9BF0'] },
  { id: 'pl-3', name: 'Coaching Film', videoCount: 18, thumbnailColors: ['#0B0F14', '#0B0F14', '#EF4444', '#0B0F14'] },
  { id: 'pl-4', name: 'Top Plays', videoCount: 8, thumbnailColors: ['#F59E0B', '#0B0F14', '#1D9BF0', '#EF4444'] },
  { id: 'pl-5', name: 'Opponent Prep', videoCount: 15, thumbnailColors: ['#1D9BF0', '#22C55E', '#0B0F14', '#A1A1AA'] },
];

export const SAVED_VIDEOS: BrowseVideo[] = [
  { id: 'sv-1', title: 'Marcus Johnson 22-pt Performance', creator: 'Carroll Athletics', creatorInitials: 'CA', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1504450758481-7338eba7524a'), duration: 194, viewCount: 2340, timestamp: '3 days ago' },
  { id: 'sv-2', title: 'Conference Tournament Preview', creator: 'Big South Network', creatorInitials: 'BS', thumbnailColor: '#1D9BF0', thumbnailUrl: u('photo-1540747913346-19e32dc3e97e'), duration: 720, viewCount: 12400, timestamp: '1 day ago' },
  { id: 'sv-3', title: 'Pick & Roll Execution vs Winthrop', creator: 'Coach Film', creatorInitials: 'CF', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1475403614135-5f1aa0eb5015'), duration: 268, viewCount: 560, timestamp: '2 weeks ago' },
  { id: 'sv-4', title: 'March Madness Bracket Breakdown', creator: 'NCAA', creatorInitials: 'NC', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1587280501635-68a0e82cd5ff'), duration: 1200, viewCount: 89000, timestamp: '2 days ago' },
  { id: 'sv-5', title: 'Transition Defense Masterclass', creator: 'Coaching Clinic', creatorInitials: 'CC', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1559692048-79a3f837883d'), duration: 480, viewCount: 5600, timestamp: '4 days ago' },
];

export const DOWNLOADS: BrowseVideo[] = [
  { id: 'dl-1', title: 'vs Coastal Carolina — Full Game', creator: 'Fighting Saints TV', creatorInitials: 'FS', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1505666287802-931dc83948e5'), duration: 7200, viewCount: 3400, timestamp: '3 days ago' },
  { id: 'dl-2', title: 'Film Room — Zone Press Break', creator: 'Coach Film', creatorInitials: 'CF', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1518407613690-d9fc990e795f'), duration: 420, viewCount: 234, timestamp: '1 day ago' },
  { id: 'dl-3', title: 'Transition Defense Breakdown', creator: 'Coach Film', creatorInitials: 'CF', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1511886929837-354d827aae26'), duration: 312, viewCount: 780, timestamp: '3 days ago' },
];

export const YOUR_UPLOADS: BrowseVideo[] = [
  { id: 'up-1', title: 'Practice Highlights — Feb 14', creator: 'You', creatorInitials: 'ME', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1552674605-db6ffd4facb5'), duration: 360, viewCount: 456, timestamp: '8 hours ago' },
  { id: 'up-2', title: 'Pregame Warmup — Campbell', creator: 'You', creatorInitials: 'ME', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1461896836934-bd45ba055fe7'), duration: 120, viewCount: 890, timestamp: '2 hours ago' },
  { id: 'up-3', title: 'Drill Footage — Ball Screen', creator: 'You', creatorInitials: 'ME', thumbnailColor: '#0B0F14', thumbnailUrl: u('photo-1519861531473-9200262188bf'), duration: 245, viewCount: 123, timestamp: '3 days ago' },
];
