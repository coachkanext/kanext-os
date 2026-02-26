/**
 * Mock Church Library Data — structured folder-first archive.
 * 6 sections: Services, Sermons, Ministries, Training, Playlists, Saved
 * Visibility-gated, campus-scoped, role-aware.
 */

// =============================================================================
// TYPES
// =============================================================================

export type ChurchLibrarySectionId =
  | 'services'
  | 'sermons'
  | 'ministries'
  | 'training'
  | 'playlists'
  | 'saved';

export interface ChurchLibrarySection {
  id: ChurchLibrarySectionId;
  name: string;
  icon: string;
  colorStrip: string;
  itemCount: number;
  visibilityClass: 0 | 2 | 3;
  requiresMinistry?: boolean;
}

export interface ChurchLibraryFolder {
  id: string;
  sectionId: ChurchLibrarySectionId;
  name: string;
  itemCount: number;
}

export interface ChurchLibraryVideo {
  id: string;
  title: string;
  speaker?: string;
  date: Date;
  duration: string;
  thumbnailColor: string;
  visibilityClass: 0 | 2 | 3;
  ministryName?: string;
  series?: string;
  tags?: string[];
}

// =============================================================================
// SECTIONS
// =============================================================================

export const CHURCH_LIBRARY_SECTIONS: ChurchLibrarySection[] = [
  {
    id: 'services',
    name: 'Services',
    icon: 'building.columns.fill',
    colorStrip: '#1D9BF0',
    itemCount: 14,
    visibilityClass: 0,
  },
  {
    id: 'sermons',
    name: 'Sermons',
    icon: 'book.fill',
    colorStrip: '#22C55E',
    itemCount: 12,
    visibilityClass: 0,
  },
  {
    id: 'ministries',
    name: 'Ministries',
    icon: 'person.3.fill',
    colorStrip: '#EF4444',
    itemCount: 8,
    visibilityClass: 3,
    requiresMinistry: true,
  },
  {
    id: 'training',
    name: 'Training',
    icon: 'graduationcap.fill',
    colorStrip: '#F59E0B',
    itemCount: 7,
    visibilityClass: 2,
  },
  {
    id: 'playlists',
    name: 'Playlists',
    icon: 'text.badge.plus',
    colorStrip: '#8B5CF6',
    itemCount: 3,
    visibilityClass: 0,
  },
  {
    id: 'saved',
    name: 'Saved',
    icon: 'bookmark.fill',
    colorStrip: '#1D9BF0',
    itemCount: 5,
    visibilityClass: 0,
  },
];

// =============================================================================
// SUBFOLDERS
// =============================================================================

export const CHURCH_LIBRARY_FOLDERS: Record<ChurchLibrarySectionId, ChurchLibraryFolder[]> = {
  services: [
    { id: 'srv-2026', sectionId: 'services', name: '2026 Services', itemCount: 8 },
    { id: 'srv-2025', sectionId: 'services', name: '2025 Services', itemCount: 6 },
  ],
  sermons: [
    { id: 'ser-speaker', sectionId: 'sermons', name: 'By Speaker', itemCount: 4 },
    { id: 'ser-series', sectionId: 'sermons', name: 'By Series', itemCount: 5 },
    { id: 'ser-topic', sectionId: 'sermons', name: 'By Topic', itemCount: 3 },
  ],
  ministries: [
    { id: 'min-children', sectionId: 'ministries', name: "Children's Ministry", itemCount: 4 },
    { id: 'min-singles', sectionId: 'ministries', name: 'Singles Ministry', itemCount: 4 },
  ],
  training: [
    { id: 'trn-safety', sectionId: 'training', name: 'Volunteer Safety Training', itemCount: 3 },
    { id: 'trn-leadership', sectionId: 'training', name: 'Leadership Development', itemCount: 2 },
    { id: 'trn-orientation', sectionId: 'training', name: 'Orientation', itemCount: 2 },
  ],
  playlists: [
    { id: 'pl-children', sectionId: 'playlists', name: 'Children Lesson Week 1', itemCount: 4 },
    { id: 'pl-singles', sectionId: 'playlists', name: 'Singles Retreat Clips', itemCount: 3 },
    { id: 'pl-worship', sectionId: 'playlists', name: 'Worship Favorites', itemCount: 3 },
  ],
  saved: [], // flat list, no subfolders
};

// =============================================================================
// VIDEO ITEMS PER FOLDER
// =============================================================================

const daysAgo = (d: number) => new Date(Date.now() - d * 86400000);

const SERVICES_2026: ChurchLibraryVideo[] = [
  { id: 'slv-1', title: 'Sunday Service — Feb 22', speaker: 'Pastor Philip Anthony Mitchell', date: daysAgo(4), duration: '1:35:00', thumbnailColor: '#0B1A2E', visibilityClass: 0 },
  { id: 'slv-2', title: 'Wednesday Night — Feb 19', speaker: 'Elder Arik Hayes', date: daysAgo(7), duration: '1:10:00', thumbnailColor: '#1A0B2E', visibilityClass: 2 },
  { id: 'slv-3', title: 'Sunday Service — Feb 15', speaker: 'Pastor Philip Anthony Mitchell', date: daysAgo(11), duration: '1:28:00', thumbnailColor: '#0B1A2E', visibilityClass: 0 },
  { id: 'slv-4', title: 'Baptism Sunday — Feb 14', speaker: 'Pastor Philip Anthony Mitchell', date: daysAgo(12), duration: '1:45:00', thumbnailColor: '#0B2E1A', visibilityClass: 0 },
  { id: 'slv-5', title: 'Wednesday Night — Feb 12', speaker: 'Tatjuana Phillips', date: daysAgo(14), duration: '1:05:00', thumbnailColor: '#1A0B2E', visibilityClass: 2 },
  { id: 'slv-6', title: 'Sunday Service — Feb 8', speaker: 'Elder Arik Hayes', date: daysAgo(18), duration: '1:32:00', thumbnailColor: '#2E1A0B', visibilityClass: 0 },
  { id: 'slv-7', title: 'Sunday Service — Feb 1', speaker: 'Pastor Philip Anthony Mitchell', date: daysAgo(25), duration: '1:30:00', thumbnailColor: '#2E0B1A', visibilityClass: 0 },
  { id: 'slv-8', title: 'Sunday Service — Jan 26', speaker: 'Pastor Lonnell Dawson Williams', date: daysAgo(31), duration: '1:38:00', thumbnailColor: '#0B1A2E', visibilityClass: 0 },
];

const SERVICES_2025: ChurchLibraryVideo[] = [
  { id: 'slv-9', title: 'Christmas Eve Service', speaker: 'Pastor Philip Anthony Mitchell', date: new Date('2025-12-24'), duration: '1:55:00', thumbnailColor: '#2E0B0B', visibilityClass: 0 },
  { id: 'slv-10', title: 'Thanksgiving Service', speaker: 'Elder Arik Hayes', date: new Date('2025-11-23'), duration: '1:20:00', thumbnailColor: '#2E1A0B', visibilityClass: 0 },
  { id: 'slv-11', title: 'Easter Sunday Service', speaker: 'Pastor Philip Anthony Mitchell', date: new Date('2025-04-20'), duration: '2:00:00', thumbnailColor: '#0B2E1A', visibilityClass: 0 },
  { id: 'slv-12', title: 'Church Anniversary Service', speaker: 'Pastor Philip Anthony Mitchell', date: new Date('2025-09-14'), duration: '1:50:00', thumbnailColor: '#1A0B2E', visibilityClass: 0 },
  { id: 'slv-13', title: 'Revival Night — Day 3', speaker: 'Guest Speaker', date: new Date('2025-07-16'), duration: '1:42:00', thumbnailColor: '#2E2E0B', visibilityClass: 0 },
  { id: 'slv-14', title: 'Youth Sunday Service', speaker: 'Tatjuana Phillips', date: new Date('2025-06-08'), duration: '1:25:00', thumbnailColor: '#0B2E2E', visibilityClass: 0 },
];

const SERMONS_BY_SPEAKER: ChurchLibraryVideo[] = [
  { id: 'ssl-1', title: 'Walking in Faith', speaker: 'Pastor Philip Anthony Mitchell', date: daysAgo(4), duration: '42:15', thumbnailColor: '#1D9BF0', visibilityClass: 0, series: 'Faith Forward' },
  { id: 'ssl-2', title: 'Grace Under Pressure', speaker: 'Elder Arik Hayes', date: daysAgo(18), duration: '36:30', thumbnailColor: '#EF4444', visibilityClass: 0, series: 'Resilience' },
  { id: 'ssl-3', title: "The Shepherd's Voice", speaker: 'Tatjuana Phillips', date: daysAgo(46), duration: '33:50', thumbnailColor: '#8B5CF6', visibilityClass: 0, series: 'Listening' },
  { id: 'ssl-4', title: 'Strength in Surrender', speaker: 'Pastor Lonnell Dawson Williams', date: daysAgo(31), duration: '35:45', thumbnailColor: '#22C55E', visibilityClass: 0, series: 'Resilience' },
];

const SERMONS_BY_SERIES: ChurchLibraryVideo[] = [
  { id: 'sse-1', title: 'Walking in Faith', speaker: 'Pastor Philip Anthony Mitchell', date: daysAgo(4), duration: '42:15', thumbnailColor: '#1D9BF0', visibilityClass: 0, series: 'Faith Forward' },
  { id: 'sse-2', title: 'The Power of Prayer', speaker: 'Pastor Philip Anthony Mitchell', date: daysAgo(11), duration: '38:20', thumbnailColor: '#1D9BF0', visibilityClass: 0, series: 'Faith Forward' },
  { id: 'sse-3', title: 'Grace Under Pressure', speaker: 'Elder Arik Hayes', date: daysAgo(18), duration: '36:30', thumbnailColor: '#22C55E', visibilityClass: 0, series: 'Resilience' },
  { id: 'sse-4', title: 'Strength in Surrender', speaker: 'Elder Arik Hayes', date: daysAgo(31), duration: '35:45', thumbnailColor: '#EF4444', visibilityClass: 0, series: 'Resilience' },
  { id: 'sse-5', title: 'Building on the Rock', speaker: 'Pastor Philip Anthony Mitchell', date: daysAgo(39), duration: '44:00', thumbnailColor: '#1D9BF0', visibilityClass: 0, series: 'Foundations' },
];

const SERMONS_BY_TOPIC: ChurchLibraryVideo[] = [
  { id: 'sst-1', title: 'Love Your Neighbor', speaker: 'Pastor Philip Anthony Mitchell', date: daysAgo(25), duration: '40:10', thumbnailColor: '#F59E0B', visibilityClass: 0, tags: ['Community', 'Love'] },
  { id: 'sst-2', title: 'The Power of Prayer', speaker: 'Pastor Philip Anthony Mitchell', date: daysAgo(11), duration: '38:20', thumbnailColor: '#1D9BF0', visibilityClass: 0, tags: ['Prayer', 'Faith'] },
  { id: 'sst-3', title: 'New Year, New Purpose', speaker: 'Pastor Philip Anthony Mitchell', date: daysAgo(53), duration: '41:25', thumbnailColor: '#22C55E', visibilityClass: 0, tags: ['Purpose', 'Vision'] },
];

const MINISTRY_CHILDREN: ChurchLibraryVideo[] = [
  { id: 'mlc-1', title: 'Curriculum Walkthrough — March', date: daysAgo(3), duration: '18:00', thumbnailColor: '#1D9BF0', visibilityClass: 3, ministryName: "Children's Ministry" },
  { id: 'mlc-2', title: 'Volunteer Safety Protocols', date: daysAgo(8), duration: '22:30', thumbnailColor: '#F59E0B', visibilityClass: 3, ministryName: "Children's Ministry" },
  { id: 'mlc-3', title: "Children's Church Recap — Feb 22", date: daysAgo(4), duration: '28:00', thumbnailColor: '#EF4444', visibilityClass: 3, ministryName: "Children's Ministry" },
  { id: 'mlc-4', title: 'VBS Planning Meeting', date: daysAgo(15), duration: '40:00', thumbnailColor: '#22C55E', visibilityClass: 3, ministryName: "Children's Ministry" },
];

const MINISTRY_SINGLES: ChurchLibraryVideo[] = [
  { id: 'mls-1', title: 'Singles Retreat Recap', date: daysAgo(10), duration: '12:00', thumbnailColor: '#8B5CF6', visibilityClass: 3, ministryName: 'Singles Ministry' },
  { id: 'mls-2', title: 'Fellowship Night Highlights', date: daysAgo(20), duration: '8:30', thumbnailColor: '#1D9BF0', visibilityClass: 3, ministryName: 'Singles Ministry' },
  { id: 'mls-3', title: 'Discussion: Navigating Faith', speaker: 'Elder Arik Hayes', date: daysAgo(28), duration: '35:00', thumbnailColor: '#22C55E', visibilityClass: 3, ministryName: 'Singles Ministry' },
  { id: 'mls-4', title: 'Singles Ministry Orientation', date: daysAgo(40), duration: '20:00', thumbnailColor: '#F59E0B', visibilityClass: 3, ministryName: 'Singles Ministry' },
];

const TRAINING_SAFETY: ChurchLibraryVideo[] = [
  { id: 'trs-1', title: 'Fire Safety & Evacuation', date: daysAgo(14), duration: '15:00', thumbnailColor: '#EF4444', visibilityClass: 2 },
  { id: 'trs-2', title: 'Child Protection Protocols', date: daysAgo(22), duration: '28:00', thumbnailColor: '#F59E0B', visibilityClass: 2 },
  { id: 'trs-3', title: 'First Aid Basics', date: daysAgo(35), duration: '20:00', thumbnailColor: '#22C55E', visibilityClass: 2 },
];

const TRAINING_LEADERSHIP: ChurchLibraryVideo[] = [
  { id: 'trl-1', title: 'Conflict Resolution', speaker: 'Elder Arik Hayes', date: daysAgo(8), duration: '55:00', thumbnailColor: '#F59E0B', visibilityClass: 2 },
  { id: 'trl-2', title: 'Servant Leadership Principles', speaker: 'Pastor Philip Anthony Mitchell', date: daysAgo(30), duration: '48:00', thumbnailColor: '#1D9BF0', visibilityClass: 2 },
];

const TRAINING_ORIENTATION: ChurchLibraryVideo[] = [
  { id: 'tro-1', title: 'New Volunteer Onboarding 2026', date: daysAgo(12), duration: '32:00', thumbnailColor: '#1D9BF0', visibilityClass: 2 },
  { id: 'tro-2', title: 'Campus Tour & Policies', date: daysAgo(45), duration: '18:00', thumbnailColor: '#22C55E', visibilityClass: 2 },
];

const PLAYLIST_CHILDREN: ChurchLibraryVideo[] = [
  { id: 'plc-1', title: 'Week 1: Creation Story', date: daysAgo(10), duration: '15:00', thumbnailColor: '#1D9BF0', visibilityClass: 0 },
  { id: 'plc-2', title: 'Week 1: Activity Time', date: daysAgo(10), duration: '8:00', thumbnailColor: '#22C55E', visibilityClass: 0 },
  { id: 'plc-3', title: 'Week 1: Worship Song', date: daysAgo(10), duration: '4:30', thumbnailColor: '#8B5CF6', visibilityClass: 0 },
  { id: 'plc-4', title: 'Week 1: Closing Prayer', date: daysAgo(10), duration: '2:00', thumbnailColor: '#F59E0B', visibilityClass: 0 },
];

const PLAYLIST_SINGLES: ChurchLibraryVideo[] = [
  { id: 'pls-1', title: 'Retreat Welcome Video', date: daysAgo(12), duration: '3:00', thumbnailColor: '#8B5CF6', visibilityClass: 0 },
  { id: 'pls-2', title: 'Session 1: Finding Purpose', speaker: 'Elder Arik Hayes', date: daysAgo(12), duration: '35:00', thumbnailColor: '#22C55E', visibilityClass: 0 },
  { id: 'pls-3', title: 'Worship Highlights', date: daysAgo(12), duration: '12:00', thumbnailColor: '#1D9BF0', visibilityClass: 0 },
];

const PLAYLIST_WORSHIP: ChurchLibraryVideo[] = [
  { id: 'plw-1', title: '"How Great Is Our God"', date: daysAgo(22), duration: '5:50', thumbnailColor: '#EF4444', visibilityClass: 0 },
  { id: 'plw-2', title: '"Great Is Thy Faithfulness"', date: daysAgo(15), duration: '6:20', thumbnailColor: '#22C55E', visibilityClass: 0 },
  { id: 'plw-3', title: 'Acoustic Worship Session', date: daysAgo(29), duration: '22:10', thumbnailColor: '#8B5CF6', visibilityClass: 0 },
];

const SAVED_ITEMS: ChurchLibraryVideo[] = [
  { id: 'sav-1', title: 'Walking in Faith', speaker: 'Pastor Philip Anthony Mitchell', date: daysAgo(4), duration: '42:15', thumbnailColor: '#1D9BF0', visibilityClass: 0, series: 'Faith Forward' },
  { id: 'sav-2', title: 'Sunday Morning Worship Set', date: daysAgo(4), duration: '18:30', thumbnailColor: '#8B5CF6', visibilityClass: 0 },
  { id: 'sav-3', title: 'Baptism Sunday Highlights', date: daysAgo(12), duration: '8:45', thumbnailColor: '#22C55E', visibilityClass: 0 },
  { id: 'sav-4', title: 'Conflict Resolution', speaker: 'Elder Arik Hayes', date: daysAgo(8), duration: '55:00', thumbnailColor: '#F59E0B', visibilityClass: 2 },
  { id: 'sav-5', title: "Children's Church Recap — Feb 22", date: daysAgo(4), duration: '28:00', thumbnailColor: '#EF4444', visibilityClass: 3, ministryName: "Children's Ministry" },
];

// =============================================================================
// FOLDER → VIDEO MAPPING
// =============================================================================

export const CHURCH_FOLDER_VIDEOS: Record<string, ChurchLibraryVideo[]> = {
  'srv-2026': SERVICES_2026,
  'srv-2025': SERVICES_2025,
  'ser-speaker': SERMONS_BY_SPEAKER,
  'ser-series': SERMONS_BY_SERIES,
  'ser-topic': SERMONS_BY_TOPIC,
  'min-children': MINISTRY_CHILDREN,
  'min-singles': MINISTRY_SINGLES,
  'trn-safety': TRAINING_SAFETY,
  'trn-leadership': TRAINING_LEADERSHIP,
  'trn-orientation': TRAINING_ORIENTATION,
  'pl-children': PLAYLIST_CHILDREN,
  'pl-singles': PLAYLIST_SINGLES,
  'pl-worship': PLAYLIST_WORSHIP,
};

// Saved section has no subfolders — videos are flat
export const CHURCH_SAVED_VIDEOS: ChurchLibraryVideo[] = SAVED_ITEMS;

// =============================================================================
// RBAC HELPERS
// =============================================================================

export function getVisibleSections(
  visibility: number,
  hasMinistry: boolean,
): ChurchLibrarySection[] {
  return CHURCH_LIBRARY_SECTIONS.filter((s) => {
    if (visibility < s.visibilityClass) return false;
    if (s.requiresMinistry && !hasMinistry) return false;
    return true;
  });
}

export function filterVideos(
  videos: ChurchLibraryVideo[],
  userVisibility: number,
  search: string,
): ChurchLibraryVideo[] {
  let filtered = videos.filter((v) => v.visibilityClass <= userVisibility);

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        (v.speaker && v.speaker.toLowerCase().includes(q)) ||
        (v.ministryName && v.ministryName.toLowerCase().includes(q)) ||
        (v.series && v.series.toLowerCase().includes(q)) ||
        (v.tags && v.tags.some((t) => t.toLowerCase().includes(q))),
    );
  }

  return filtered;
}
