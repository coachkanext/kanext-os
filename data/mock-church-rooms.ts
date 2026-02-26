/**
 * Mock Church Rooms Data — Curated media groupings for church mode.
 * 5 default rooms: Service, Sermon, Worship, Ministry (role-aware), Training
 * Room Feed items with RBAC visibility and filter helpers.
 */

// =============================================================================
// TYPES
// =============================================================================

export type ChurchRoomId = 'service' | 'sermon' | 'worship' | 'ministry' | 'training';

export interface ChurchRoom {
  id: ChurchRoomId;
  name: string;
  description: string;
  icon: string;
  colorStrip: string;
  lastUpdated: string;
  itemCount: number;
  minAuthority: number;       // 0 = all members, 1 = A1+, 2 = A2+
  visibilityClass: 0 | 2 | 3;
  requiresMinistry?: boolean; // true = only show if user belongs to a ministry
}

export interface ChurchRoomFeedItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'service' | 'sermon' | 'worship' | 'training' | 'clip' | 'event';
  date: Date;
  duration: string;
  thumbnailColor: string;
  visibilityClass: 0 | 2 | 3;
  ministryName?: string;
  speaker?: string;
}

// =============================================================================
// ROOMS
// =============================================================================

export const CHURCH_ROOMS: ChurchRoom[] = [
  {
    id: 'service',
    name: 'Service Room',
    description: 'Full-length services, sermon replays, and service recaps',
    icon: 'building.columns.fill',
    colorStrip: '#1D9BF0',
    lastUpdated: '2 hours ago',
    itemCount: 10,
    minAuthority: 0,
    visibilityClass: 0,
  },
  {
    id: 'sermon',
    name: 'Sermon Room',
    description: 'Sermon-only cuts, speaker clips, and teaching segments',
    icon: 'book.fill',
    colorStrip: '#22C55E',
    lastUpdated: '1 day ago',
    itemCount: 8,
    minAuthority: 0,
    visibilityClass: 0,
  },
  {
    id: 'worship',
    name: 'Worship Room',
    description: 'Worship clips, song segments, and special worship moments',
    icon: 'music.note',
    colorStrip: '#8B5CF6',
    lastUpdated: '3 hours ago',
    itemCount: 8,
    minAuthority: 0,
    visibilityClass: 0,
  },
  {
    id: 'ministry',
    name: "Children's Ministry Room",
    description: 'Training videos, volunteer briefings, and ministry recaps',
    icon: 'person.3.fill',
    colorStrip: '#EF4444',
    lastUpdated: '2 days ago',
    itemCount: 6,
    minAuthority: 0,
    visibilityClass: 3,
    requiresMinistry: true,
  },
  {
    id: 'training',
    name: 'Training Room',
    description: 'Leadership training, volunteer onboarding, and safety videos',
    icon: 'graduationcap.fill',
    colorStrip: '#F59E0B',
    lastUpdated: '4 days ago',
    itemCount: 7,
    minAuthority: 1,
    visibilityClass: 2,
  },
];

// =============================================================================
// FEED ITEMS
// =============================================================================

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);

const SERVICE_FEED: ChurchRoomFeedItem[] = [
  { id: 'csf-1', title: 'Sunday Service — Feb 22', subtitle: 'Full Service Recording', type: 'service', date: daysAgo(1), duration: '1:35:00', thumbnailColor: '#0B1A2E', visibilityClass: 0, speaker: 'Pastor Philip Anthony Mitchell' },
  { id: 'csf-2', title: 'Sunday Service Recap', subtitle: 'Highlights from Feb 22', type: 'clip', date: daysAgo(1), duration: '4:30', thumbnailColor: '#1A2E1A', visibilityClass: 0 },
  { id: 'csf-3', title: 'Sunday Service — Feb 15', subtitle: 'Full Service Recording', type: 'service', date: daysAgo(8), duration: '1:28:00', thumbnailColor: '#0B1A2E', visibilityClass: 0, speaker: 'Pastor Philip Anthony Mitchell' },
  { id: 'csf-4', title: 'Wednesday Night Service — Feb 19', subtitle: 'Midweek Gathering', type: 'service', date: daysAgo(4), duration: '1:10:00', thumbnailColor: '#1A0B2E', visibilityClass: 2, speaker: 'Elder Arik Hayes' },
  { id: 'csf-5', title: 'Sunday Service — Feb 8', subtitle: 'Full Service Recording', type: 'service', date: daysAgo(15), duration: '1:32:00', thumbnailColor: '#2E1A0B', visibilityClass: 0, speaker: 'Elder Arik Hayes' },
  { id: 'csf-6', title: 'Baptism Sunday Full Service', subtitle: 'Special Service — Feb 14', type: 'service', date: daysAgo(9), duration: '1:45:00', thumbnailColor: '#0B2E1A', visibilityClass: 0, speaker: 'Pastor Philip Anthony Mitchell' },
  { id: 'csf-7', title: 'Wednesday Night Service — Feb 12', subtitle: 'Midweek Gathering', type: 'service', date: daysAgo(11), duration: '1:05:00', thumbnailColor: '#1A0B2E', visibilityClass: 2, speaker: 'Tatjuana Phillips' },
  { id: 'csf-8', title: 'Sunday Service — Feb 1', subtitle: 'Full Service Recording', type: 'service', date: daysAgo(22), duration: '1:30:00', thumbnailColor: '#2E0B1A', visibilityClass: 0, speaker: 'Pastor Philip Anthony Mitchell' },
  { id: 'csf-9', title: 'New Member Welcome Service', subtitle: 'Special Service — Jan 26', type: 'event', date: daysAgo(28), duration: '55:00', thumbnailColor: '#0B2E2E', visibilityClass: 2 },
  { id: 'csf-10', title: 'Sunday Service — Jan 26', subtitle: 'Full Service Recording', type: 'service', date: daysAgo(28), duration: '1:38:00', thumbnailColor: '#0B1A2E', visibilityClass: 0, speaker: 'Pastor Lonnell Dawson Williams' },
];

const SERMON_FEED: ChurchRoomFeedItem[] = [
  { id: 'csr-1', title: 'Walking in Faith', subtitle: 'Faith Forward Series', type: 'sermon', date: daysAgo(1), duration: '42:15', thumbnailColor: '#1D9BF0', visibilityClass: 0, speaker: 'Pastor Philip Anthony Mitchell' },
  { id: 'csr-2', title: 'The Power of Prayer', subtitle: 'Faith Forward Series', type: 'sermon', date: daysAgo(8), duration: '38:20', thumbnailColor: '#1D9BF0', visibilityClass: 0, speaker: 'Pastor Philip Anthony Mitchell' },
  { id: 'csr-3', title: 'Grace Under Pressure', subtitle: 'Resilience Series', type: 'sermon', date: daysAgo(15), duration: '36:30', thumbnailColor: '#22C55E', visibilityClass: 0, speaker: 'Elder Arik Hayes' },
  { id: 'csr-4', title: 'Love Your Neighbor', subtitle: 'Community Series', type: 'sermon', date: daysAgo(22), duration: '40:10', thumbnailColor: '#F59E0B', visibilityClass: 0, speaker: 'Pastor Philip Anthony Mitchell' },
  { id: 'csr-5', title: 'Strength in Surrender', subtitle: 'Resilience Series', type: 'sermon', date: daysAgo(29), duration: '35:45', thumbnailColor: '#EF4444', visibilityClass: 0, speaker: 'Elder Arik Hayes' },
  { id: 'csr-6', title: '"Walk by Faith" Clip', subtitle: 'Key Moment — Feb 22', type: 'clip', date: daysAgo(1), duration: '3:20', thumbnailColor: '#0B1A2E', visibilityClass: 0, speaker: 'Pastor Philip Anthony Mitchell' },
  { id: 'csr-7', title: 'Building on the Rock', subtitle: 'Foundations Series', type: 'sermon', date: daysAgo(36), duration: '44:00', thumbnailColor: '#1D9BF0', visibilityClass: 0, speaker: 'Pastor Philip Anthony Mitchell' },
  { id: 'csr-8', title: "The Shepherd's Voice", subtitle: 'Listening Series', type: 'sermon', date: daysAgo(43), duration: '33:50', thumbnailColor: '#8B5CF6', visibilityClass: 0, speaker: 'Tatjuana Phillips' },
];

const WORSHIP_FEED: ChurchRoomFeedItem[] = [
  { id: 'cwf-1', title: 'Sunday Morning Worship Set', subtitle: 'Feb 22 Service', type: 'worship', date: daysAgo(1), duration: '18:30', thumbnailColor: '#8B5CF6', visibilityClass: 0 },
  { id: 'cwf-2', title: 'Praise Night Highlights', subtitle: 'Special Event — Feb 14', type: 'worship', date: daysAgo(9), duration: '12:45', thumbnailColor: '#F59E0B', visibilityClass: 0 },
  { id: 'cwf-3', title: '"Great Is Thy Faithfulness"', subtitle: 'Song Segment', type: 'clip', date: daysAgo(8), duration: '6:20', thumbnailColor: '#22C55E', visibilityClass: 0 },
  { id: 'cwf-4', title: 'Choir Anniversary Concert', subtitle: 'Full Concert Recording', type: 'worship', date: daysAgo(15), duration: '45:00', thumbnailColor: '#1D9BF0', visibilityClass: 0 },
  { id: 'cwf-5', title: '"How Great Is Our God"', subtitle: 'Song Segment', type: 'clip', date: daysAgo(22), duration: '5:50', thumbnailColor: '#EF4444', visibilityClass: 0 },
  { id: 'cwf-6', title: 'Acoustic Worship Session', subtitle: 'Intimate Worship Night', type: 'worship', date: daysAgo(29), duration: '22:10', thumbnailColor: '#8B5CF6', visibilityClass: 0 },
  { id: 'cwf-7', title: 'Worship Team Rehearsal', subtitle: 'Rehearsal Recording — Feb 20', type: 'worship', date: daysAgo(3), duration: '35:00', thumbnailColor: '#1A0B2E', visibilityClass: 2 },
  { id: 'cwf-8', title: 'Sunday Morning Worship Set', subtitle: 'Feb 15 Service', type: 'worship', date: daysAgo(8), duration: '20:10', thumbnailColor: '#8B5CF6', visibilityClass: 0 },
];

const MINISTRY_FEED: ChurchRoomFeedItem[] = [
  { id: 'cmf-1', title: 'Children\'s Church Recap — Feb 22', subtitle: 'Sunday Session', type: 'event', date: daysAgo(1), duration: '28:00', thumbnailColor: '#EF4444', visibilityClass: 3, ministryName: "Children's Ministry" },
  { id: 'cmf-2', title: 'Volunteer Training: Safety Protocols', subtitle: 'Required Training', type: 'training', date: daysAgo(5), duration: '22:30', thumbnailColor: '#F59E0B', visibilityClass: 3, ministryName: "Children's Ministry" },
  { id: 'cmf-3', title: 'Curriculum Walkthrough — March', subtitle: 'Lesson Planning', type: 'training', date: daysAgo(3), duration: '18:00', thumbnailColor: '#1D9BF0', visibilityClass: 3, ministryName: "Children's Ministry" },
  { id: 'cmf-4', title: 'Children\'s Church Recap — Feb 15', subtitle: 'Sunday Session', type: 'event', date: daysAgo(8), duration: '25:00', thumbnailColor: '#EF4444', visibilityClass: 3, ministryName: "Children's Ministry" },
  { id: 'cmf-5', title: 'VBS Planning Meeting', subtitle: 'Vacation Bible School Prep', type: 'event', date: daysAgo(12), duration: '40:00', thumbnailColor: '#22C55E', visibilityClass: 3, ministryName: "Children's Ministry" },
  { id: 'cmf-6', title: 'Volunteer Briefing — February', subtitle: 'Monthly Check-in', type: 'training', date: daysAgo(15), duration: '15:00', thumbnailColor: '#F59E0B', visibilityClass: 3, ministryName: "Children's Ministry" },
];

const TRAINING_FEED: ChurchRoomFeedItem[] = [
  { id: 'ctf-1', title: 'Leadership Training: Conflict Resolution', subtitle: 'Leadership Development', type: 'training', date: daysAgo(5), duration: '55:00', thumbnailColor: '#F59E0B', visibilityClass: 2, speaker: 'Elder Arik Hayes' },
  { id: 'ctf-2', title: 'Volunteer Onboarding — 2026', subtitle: 'New Volunteer Orientation', type: 'training', date: daysAgo(10), duration: '32:00', thumbnailColor: '#1D9BF0', visibilityClass: 2 },
  { id: 'ctf-3', title: 'Safety & Emergency Procedures', subtitle: 'Annual Safety Training', type: 'training', date: daysAgo(14), duration: '28:00', thumbnailColor: '#EF4444', visibilityClass: 2 },
  { id: 'ctf-4', title: 'Ministry Leader Roundtable', subtitle: 'Q1 Planning Session', type: 'event', date: daysAgo(18), duration: '1:05:00', thumbnailColor: '#22C55E', visibilityClass: 3, ministryName: 'Leadership' },
  { id: 'ctf-5', title: 'AV Team Training', subtitle: 'Sound & Media Setup', type: 'training', date: daysAgo(22), duration: '40:00', thumbnailColor: '#8B5CF6', visibilityClass: 2 },
  { id: 'ctf-6', title: 'Greeter & Usher Training', subtitle: 'Hospitality Ministry', type: 'training', date: daysAgo(28), duration: '20:00', thumbnailColor: '#F59E0B', visibilityClass: 2 },
  { id: 'ctf-7', title: 'Pastoral Care Basics', subtitle: 'Deacon & Elder Training', type: 'training', date: daysAgo(35), duration: '48:00', thumbnailColor: '#1D9BF0', visibilityClass: 3, ministryName: 'Deacon Board' },
];

export const CHURCH_ROOM_FEED_ITEMS: Record<ChurchRoomId, ChurchRoomFeedItem[]> = {
  service: SERVICE_FEED,
  sermon: SERMON_FEED,
  worship: WORSHIP_FEED,
  ministry: MINISTRY_FEED,
  training: TRAINING_FEED,
};

// =============================================================================
// RBAC HELPERS
// =============================================================================

export function getVisibleChurchRooms(
  authority: number,
  visibility: number,
  hasMinistry: boolean,
): ChurchRoom[] {
  return CHURCH_ROOMS.filter((r) => {
    if (authority < r.minAuthority) return false;
    if (visibility < r.visibilityClass) return false;
    if (r.requiresMinistry && !hasMinistry) return false;
    return true;
  });
}

// =============================================================================
// FILTER DEFINITIONS
// =============================================================================

export type ChurchFeedTypeFilter = 'all' | 'services' | 'sermons' | 'worship' | 'clips' | 'training' | 'events';
export type ChurchFeedDateFilter = 'all' | 'recent' | 'older';

export const CHURCH_FEED_TYPE_FILTERS: { key: ChurchFeedTypeFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'services', label: 'Services' },
  { key: 'sermons', label: 'Sermons' },
  { key: 'worship', label: 'Worship' },
  { key: 'clips', label: 'Clips' },
  { key: 'training', label: 'Training' },
  { key: 'events', label: 'Events' },
];

export const CHURCH_FEED_DATE_FILTERS: { key: ChurchFeedDateFilter; label: string }[] = [
  { key: 'all', label: 'All Dates' },
  { key: 'recent', label: 'Recent' },
  { key: 'older', label: 'Older' },
];

const RECENT_CUTOFF_DAYS = 14;

export function filterChurchFeedItems(
  items: ChurchRoomFeedItem[],
  userVisibility: number,
  typeFilter: ChurchFeedTypeFilter,
  dateFilter: ChurchFeedDateFilter,
  search: string,
): ChurchRoomFeedItem[] {
  const cutoff = new Date(now.getTime() - RECENT_CUTOFF_DAYS * 86400000);
  const q = search.toLowerCase().trim();

  return items.filter((item) => {
    if (item.visibilityClass > userVisibility) return false;

    if (typeFilter === 'services' && item.type !== 'service') return false;
    if (typeFilter === 'sermons' && item.type !== 'sermon') return false;
    if (typeFilter === 'worship' && item.type !== 'worship') return false;
    if (typeFilter === 'clips' && item.type !== 'clip') return false;
    if (typeFilter === 'training' && item.type !== 'training') return false;
    if (typeFilter === 'events' && item.type !== 'event') return false;

    if (dateFilter === 'recent' && item.date < cutoff) return false;
    if (dateFilter === 'older' && item.date >= cutoff) return false;

    if (q) {
      const haystack = `${item.title} ${item.subtitle} ${item.speaker ?? ''} ${item.ministryName ?? ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}
