/**
 * Mock data for Search results.
 * Provides demo search results for all 4 modes.
 */

import type { SearchResult, Mode } from '@/types';

// =============================================================================
// SPORTS MODE RESULTS
// =============================================================================

const SPORTS_RESULTS: SearchResult[] = [
  // Organization
  {
    id: 'lincoln-basketball',
    title: 'Lincoln University',
    subtitle: 'Blue Tigers Men\'s Basketball',
    category: 'organization',
    mode: 'sports',
    route: '/organization',
  },
  // Members (Players)
  {
    id: 'player-johnson',
    title: 'Marcus Johnson',
    subtitle: 'PG • #1 • Senior',
    category: 'member',
    mode: 'sports',
    route: '/organization/players/player-johnson',
  },
  {
    id: 'player-williams',
    title: 'DeShawn Williams',
    subtitle: 'C • #32 • Junior',
    category: 'member',
    mode: 'sports',
    route: '/organization/players/player-williams',
  },
  {
    id: 'player-garcia',
    title: 'Anthony Garcia',
    subtitle: 'SG • #24 • Sophomore',
    category: 'member',
    mode: 'sports',
    route: '/organization/players/player-garcia',
  },
  {
    id: 'player-thompson',
    title: 'Jaylen Thompson',
    subtitle: 'SF • #15 • Freshman',
    category: 'member',
    mode: 'sports',
    route: '/organization/players/player-thompson',
  },
  // Members (Staff)
  {
    id: 'coach-davis',
    title: 'Coach James Davis',
    subtitle: 'Head Coach',
    category: 'member',
    mode: 'sports',
    route: '/organization/staff/coach-davis',
  },
  {
    id: 'coach-mitchell',
    title: 'Coach Sarah Mitchell',
    subtitle: 'Assistant Coach',
    category: 'member',
    mode: 'sports',
    route: '/organization/staff/coach-mitchell',
  },
  // Events
  {
    id: 'game-simpson',
    title: 'vs Simpson College',
    subtitle: 'Feb 8, 2026 • Home',
    category: 'event',
    mode: 'sports',
    route: '/organization/events/game-simpson',
  },
  {
    id: 'game-central',
    title: 'at Central Methodist',
    subtitle: 'Feb 15, 2026 • Away',
    category: 'event',
    mode: 'sports',
    route: '/organization/events/game-central',
  },
  {
    id: 'tournament-conf',
    title: 'Conference Tournament',
    subtitle: 'Mar 4-7, 2026 • Neutral',
    category: 'event',
    mode: 'sports',
    route: '/organization/events/tournament-conf',
  },
  // Records
  {
    id: 'roster-2025-26',
    title: '2025-26 Roster',
    subtitle: 'Varsity • 15 players',
    category: 'record',
    mode: 'sports',
    route: '/organization/programs/varsity/roster',
  },
  {
    id: 'schedule-2025-26',
    title: '2025-26 Schedule',
    subtitle: '28 games',
    category: 'record',
    mode: 'sports',
    route: '/organization/schedule',
  },
  // Media
  {
    id: 'media-highlights',
    title: 'Season Highlights',
    subtitle: 'Video • YouTube',
    category: 'media',
    mode: 'sports',
    route: '/organization/media/media-highlights',
  },
];

// =============================================================================
// ENTERPRISE MODE RESULTS
// =============================================================================

const ENTERPRISE_RESULTS: SearchResult[] = [
  // Organization
  {
    id: 'kanext',
    title: 'KaNeXT',
    subtitle: 'Institutional OS + Governed Intelligence',
    category: 'organization',
    mode: 'enterprise',
    route: '/organization',
  },
  // Members
  {
    id: 'member-founder',
    title: 'Samuel Jenkins',
    subtitle: 'Founder',
    category: 'member',
    mode: 'enterprise',
    route: '/organization/members/member-founder',
  },
  // Documents
  {
    id: 'doc-pitch',
    title: 'Investor Deck',
    subtitle: 'Investor Materials • Updated Jan 2026',
    category: 'document',
    mode: 'enterprise',
    route: '/organization/documents/doc-pitch',
  },
  {
    id: 'doc-roadmap',
    title: 'Product Roadmap',
    subtitle: 'Roadmap • Updated Feb 2026',
    category: 'document',
    mode: 'enterprise',
    route: '/organization/documents/doc-roadmap',
  },
  {
    id: 'doc-governance',
    title: 'Operating Agreement',
    subtitle: 'Governance • Tennessee LLC',
    category: 'document',
    mode: 'enterprise',
    route: '/organization/documents/doc-governance',
  },
];

// =============================================================================
// CHURCH MODE RESULTS
// =============================================================================

const CHURCH_RESULTS: SearchResult[] = [
  // Organization
  {
    id: 'icc',
    title: 'International Christian Center',
    subtitle: 'Los Angeles & Inland Empire',
    category: 'organization',
    mode: 'church',
    route: '/organization',
  },
  // Members (Leadership)
  {
    id: 'pastor-richards',
    title: 'Pastor David Richards',
    subtitle: 'Senior Pastor',
    category: 'member',
    mode: 'church',
    route: '/organization/members/pastor-richards',
  },
  // Ministries
  {
    id: 'ministry-youth',
    title: 'Youth Ministry',
    subtitle: 'Teens & Young Adults',
    category: 'ministry',
    mode: 'church',
    route: '/organization/ministries/ministry-youth',
  },
  {
    id: 'ministry-children',
    title: 'Children\'s Church',
    subtitle: 'Ages 0-12',
    category: 'ministry',
    mode: 'church',
    route: '/organization/ministries/ministry-children',
  },
  {
    id: 'ministry-hotline',
    title: 'Hotline to Heaven',
    subtitle: 'Prayer Support',
    category: 'ministry',
    mode: 'church',
    route: '/organization/ministries/ministry-hotline',
  },
  // Messages
  {
    id: 'message-recent',
    title: 'Walking in Faith',
    subtitle: 'Sunday Message • Feb 2, 2026',
    category: 'message',
    mode: 'church',
    route: '/organization/messages/message-recent',
  },
  // Events
  {
    id: 'event-sunday',
    title: 'Sunday Service',
    subtitle: 'Every Sunday • 10:00 AM',
    category: 'event',
    mode: 'church',
    route: '/organization/events/event-sunday',
  },
];

// =============================================================================
// EDUCATION MODE RESULTS
// =============================================================================

const EDUCATION_RESULTS: SearchResult[] = [
  // Organization
  {
    id: 'sdcc',
    title: 'San Diego Christian College',
    subtitle: 'Private Christian Liberal Arts',
    category: 'organization',
    mode: 'education',
    route: '/organization',
  },
  // Members
  {
    id: 'member-president',
    title: 'Dr. Elizabeth Hart',
    subtitle: 'President',
    category: 'member',
    mode: 'education',
    route: '/organization/members/member-president',
  },
  {
    id: 'member-dean',
    title: 'Dr. Michael Chen',
    subtitle: 'Dean of Academic Affairs',
    category: 'member',
    mode: 'education',
    route: '/organization/members/member-dean',
  },
  // Events
  {
    id: 'event-spring-start',
    title: 'Spring Semester Begins',
    subtitle: 'Jan 13, 2026',
    category: 'event',
    mode: 'education',
    route: '/organization/events/event-spring-start',
  },
  {
    id: 'event-commencement',
    title: 'Commencement 2026',
    subtitle: 'May 15, 2026',
    category: 'event',
    mode: 'education',
    route: '/organization/events/event-commencement',
  },
  // Records
  {
    id: 'schedule-academic',
    title: 'Academic Calendar',
    subtitle: '2025-2026 Year',
    category: 'record',
    mode: 'education',
    route: '/organization/schedule',
  },
];

// =============================================================================
// COMBINED DATA
// =============================================================================

const ALL_RESULTS: Record<Mode, SearchResult[]> = {
  sports: SPORTS_RESULTS,
  enterprise: ENTERPRISE_RESULTS,
  church: CHURCH_RESULTS,
  education: EDUCATION_RESULTS,
};

// =============================================================================
// HELPERS
// =============================================================================

export function getSearchResults(mode: Mode): SearchResult[] {
  return ALL_RESULTS[mode] || [];
}

export function searchInMode(query: string, mode: Mode): SearchResult[] {
  const results = ALL_RESULTS[mode] || [];
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  return results.filter(
    (result) =>
      result.title.toLowerCase().includes(lowerQuery) ||
      result.subtitle?.toLowerCase().includes(lowerQuery)
  );
}

export function groupResultsByCategory(results: SearchResult[]): Map<string, SearchResult[]> {
  const groups = new Map<string, SearchResult[]>();

  for (const result of results) {
    const existing = groups.get(result.category) || [];
    groups.set(result.category, [...existing, result]);
  }

  return groups;
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    organization: 'Organizations',
    member: 'People',
    event: 'Events',
    record: 'Records',
    media: 'Media',
    document: 'Documents',
    ministry: 'Ministries',
    message: 'Messages',
  };
  return labels[category] || category;
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    organization: 'building.2',
    member: 'person',
    event: 'calendar',
    record: 'doc.text',
    media: 'play.rectangle',
    document: 'folder',
    ministry: 'hands.sparkles',
    message: 'text.bubble',
  };
  return icons[category] || 'doc';
}
