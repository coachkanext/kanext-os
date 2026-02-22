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
    id: 'sports_kx',
    title: 'KaNeXT Sports',
    subtitle: 'Athletic Programs',
    category: 'organization',
    mode: 'sports',
    route: '/organization',
  },
  // Members (Players) - route to program players
  {
    id: 'player-johnson',
    title: 'Marcus Reed',
    subtitle: 'PG • #1 • Senior',
    category: 'member',
    mode: 'sports',
    route: '/organization/programs/varsity/players/player-johnson',
  },
  {
    id: 'player-williams',
    title: 'Devon Carter',
    subtitle: 'C • #32 • Junior',
    category: 'member',
    mode: 'sports',
    route: '/organization/programs/varsity/players/player-williams',
  },
  {
    id: 'player-garcia',
    title: 'Jordan Blake',
    subtitle: 'SG • #24 • Sophomore',
    category: 'member',
    mode: 'sports',
    route: '/organization/programs/varsity/players/player-garcia',
  },
  {
    id: 'player-thompson',
    title: 'Tyler Quinn',
    subtitle: 'SF • #15 • Freshman',
    category: 'member',
    mode: 'sports',
    route: '/organization/programs/varsity/players/player-thompson',
  },
  // Members (Staff) - route to program staff
  {
    id: 'coach-davis',
    title: 'Coach Ray Bennett',
    subtitle: 'Head Coach',
    category: 'member',
    mode: 'sports',
    route: '/organization/programs/varsity/staff/coach-davis',
  },
  {
    id: 'coach-mitchell',
    title: 'Coach Mia Torres',
    subtitle: 'Assistant Coach',
    category: 'member',
    mode: 'sports',
    route: '/organization/programs/varsity/staff/coach-mitchell',
  },
  // Events - route to program events
  {
    id: 'game-simpson',
    title: 'vs Westlake College',
    subtitle: 'Feb 8, 2026 • Home',
    category: 'event',
    mode: 'sports',
    route: '/organization/programs/varsity/events/game-simpson',
  },
  {
    id: 'game-central',
    title: 'vs Eastridge Tech',
    subtitle: 'Feb 15, 2026 • Away',
    category: 'event',
    mode: 'sports',
    route: '/organization/programs/varsity/events/game-central',
  },
  {
    id: 'tournament-conf',
    title: 'Conference Tournament',
    subtitle: 'Mar 4-7, 2026 • Neutral',
    category: 'event',
    mode: 'sports',
    route: '/organization/programs/varsity/events/tournament-conf',
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
    route: '/organization/programs/varsity/media',
  },
];

// =============================================================================
// BUSINESS MODE RESULTS
// =============================================================================

const BUSINESS_RESULTS: SearchResult[] = [
  // Organization
  {
    id: 'biz_kx',
    title: 'KaNeXT Business',
    subtitle: 'Institutional OS + Governed Intelligence',
    category: 'organization',
    mode: 'business',
    route: '/organization',
  },
  // Members - route to leadership
  {
    id: 'board-1',
    title: 'Alex Morgan',
    subtitle: 'Founder & CEO',
    category: 'member',
    mode: 'business',
    route: '/organization/leadership',
  },
  {
    id: 'board-2',
    title: 'Dr. Lisa Grant',
    subtitle: 'Board Member • KX Ventures',
    category: 'member',
    mode: 'business',
    route: '/organization/governance',
  },
  // Documents - route to documents screen
  {
    id: 'doc-1',
    title: 'Series Seed Pitch Deck',
    subtitle: 'Investor Materials • Updated Jan 2026',
    category: 'document',
    mode: 'business',
    route: '/organization/documents',
  },
  {
    id: 'doc-11',
    title: '2026 Product Roadmap',
    subtitle: 'Roadmap • Updated Jan 2026',
    category: 'document',
    mode: 'business',
    route: '/organization/documents',
  },
  // Domains
  {
    id: 'domain-sports',
    title: 'Sports Domain',
    subtitle: 'Active • Athletic Programs',
    category: 'record',
    mode: 'business',
    route: '/organization/domains',
  },
  // Metrics
  {
    id: 'metrics-mrr',
    title: 'Company Metrics',
    subtitle: 'MRR, Growth, Runway',
    category: 'record',
    mode: 'business',
    route: '/organization/metrics',
  },
];

// =============================================================================
// CHURCH MODE RESULTS
// =============================================================================

const CHURCH_RESULTS: SearchResult[] = [
  // Organization
  {
    id: 'church_kx',
    title: 'KaNeXT Church',
    subtitle: 'Nashville, TN',
    category: 'organization',
    mode: 'church',
    route: '/organization',
  },
  // Members (Leadership)
  {
    id: 'leader-1',
    title: 'Pastor David Reeves',
    subtitle: 'Senior Pastor',
    category: 'member',
    mode: 'church',
    route: '/organization/leadership',
  },
  {
    id: 'leader-2',
    title: 'Pastor Lisa Grant',
    subtitle: 'Associate Pastor',
    category: 'member',
    mode: 'church',
    route: '/organization/leadership',
  },
  // Campuses
  {
    id: 'church_kx_main',
    title: 'KaNeXT Church — Main Campus',
    subtitle: 'Nashville, TN',
    category: 'organization',
    mode: 'church',
    route: '/organization/campuses/church_kx_main',
  },
  // Ministries
  {
    id: 'ministry-youth',
    title: 'Teens/Youth',
    subtitle: 'Youth Ministry',
    category: 'ministry',
    mode: 'church',
    route: '/organization/ministries/ministry-youth',
  },
  {
    id: 'ministry-children',
    title: 'Children\'s Church',
    subtitle: 'Ages 2-12',
    category: 'ministry',
    mode: 'church',
    route: '/organization/ministries/ministry-children',
  },
  {
    id: 'ministry-prayer',
    title: 'Hotline to Heaven',
    subtitle: 'Prayer Ministry',
    category: 'ministry',
    mode: 'church',
    route: '/organization/ministries/ministry-prayer',
  },
  // Messages
  {
    id: 'msg-1',
    title: 'Walking in Faith',
    subtitle: 'Sunday Message • Feb 2, 2026',
    category: 'message',
    mode: 'church',
    route: '/organization/messages',
  },
  // Giving
  {
    id: 'giving',
    title: 'Give Online',
    subtitle: 'Tithes, Offerings, Missions',
    category: 'record',
    mode: 'church',
    route: '/organization/giving',
  },
  // Connect
  {
    id: 'connect',
    title: 'Connect With Us',
    subtitle: 'New Here? Start Here',
    category: 'record',
    mode: 'church',
    route: '/organization/connect',
  },
];

// =============================================================================
// EDUCATION MODE RESULTS
// =============================================================================

const EDUCATION_RESULTS: SearchResult[] = [
  // Organization
  {
    id: 'edu_kx',
    title: 'KaNeXT Education',
    subtitle: 'Academic Institution',
    category: 'organization',
    mode: 'education',
    route: '/organization',
  },
  // Members (Faculty)
  {
    id: 'faculty-1',
    title: 'Dr. Nicole Harris',
    subtitle: 'President',
    category: 'member',
    mode: 'education',
    route: '/organization/members/faculty-1',
  },
  {
    id: 'faculty-2',
    title: 'Dr. Robert Kim',
    subtitle: 'Provost & VP Academic Affairs',
    category: 'member',
    mode: 'education',
    route: '/organization/members/faculty-2',
  },
  {
    id: 'faculty-3',
    title: 'Dr. Rachel Brooks',
    subtitle: 'Dean of Students',
    category: 'member',
    mode: 'education',
    route: '/organization/members/faculty-3',
  },
  // Events - Terms
  {
    id: 'term-spring-2026',
    title: 'Spring 2026',
    subtitle: 'Jan 13 - May 12, 2026',
    category: 'event',
    mode: 'education',
    route: '/organization/events/term-spring-2026',
  },
  {
    id: 'term-fall-2025',
    title: 'Fall 2025',
    subtitle: 'Aug 26 - Dec 15, 2025',
    category: 'event',
    mode: 'education',
    route: '/organization/events/term-fall-2025',
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
  {
    id: 'archive',
    title: 'Academic Archive',
    subtitle: 'Past Years & History',
    category: 'record',
    mode: 'education',
    route: '/organization/archive',
  },
  // Leadership
  {
    id: 'leadership',
    title: 'Faculty & Leadership',
    subtitle: 'Administration & Staff',
    category: 'record',
    mode: 'education',
    route: '/organization/leadership',
  },
];

// =============================================================================
// COMBINED DATA
// =============================================================================

const ALL_RESULTS: Record<Mode, SearchResult[]> = {
  sports: SPORTS_RESULTS,
  business: BUSINESS_RESULTS,
  church: CHURCH_RESULTS,
  education: EDUCATION_RESULTS,
  competition: [],
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
