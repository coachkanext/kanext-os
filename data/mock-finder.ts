/**
 * Mock Finder Data — Universal Finder search index.
 * Items sourced from existing mock data (roster, games, recruits).
 */

export type FinderResultType = 'player' | 'recruit' | 'team' | 'game' | 'clip' | 'post';

export interface FinderResult {
  id: string;
  label: string;
  subtitle: string;
  type: FinderResultType;
  icon: string;
  route: string;
}

export const MOCK_FINDER_INDEX: FinderResult[] = [
  // Players
  { id: 'f-1', label: 'Elijah Carter', subtitle: '#4 · PG · Junior', type: 'player', icon: 'person.fill', route: '/(tabs)/organization' },
  { id: 'f-2', label: 'Elisha Selden', subtitle: '#5 · SF · Senior', type: 'player', icon: 'person.fill', route: '/(tabs)/organization' },
  { id: 'f-3', label: 'Keon Mentor', subtitle: '#11 · PG · Sophomore', type: 'player', icon: 'person.fill', route: '/(tabs)/organization' },
  { id: 'f-4', label: 'Ashton Noel', subtitle: '#13 · SG · Junior', type: 'player', icon: 'person.fill', route: '/(tabs)/organization' },
  // Recruits
  { id: 'f-5', label: 'Jaylen Carter', subtitle: '2026 · SF · Official Visit Scheduled', type: 'recruit', icon: 'person.badge.plus', route: '/coach/recruiting' },
  { id: 'f-6', label: 'Devon Williams', subtitle: '2026 · PG · Offer Extended', type: 'recruit', icon: 'person.badge.plus', route: '/coach/recruiting' },
  // Games
  { id: 'f-7', label: 'KaNeXT vs Coastal Carolina', subtitle: 'Final · W 81-74', type: 'game', icon: 'sportscourt.fill', route: '/(tabs)/index' },
  { id: 'f-8', label: 'KaNeXT vs Campbell', subtitle: 'Upcoming · Feb 15', type: 'game', icon: 'sportscourt.fill', route: '/(tabs)/index' },
  { id: 'f-9', label: 'KaNeXT vs UNC Asheville', subtitle: 'Final · L 69-72', type: 'game', icon: 'sportscourt.fill', route: '/(tabs)/index' },
  // Clips
  { id: 'f-10', label: 'Transition Defense Breakdown', subtitle: 'Clip · Coastal Carolina', type: 'clip', icon: 'play.rectangle.fill', route: '/(tabs)/media' },
  { id: 'f-11', label: 'Mid-Range Package Highlights', subtitle: 'Clip · Marcus Johnson', type: 'clip', icon: 'play.rectangle.fill', route: '/(tabs)/media' },
  // Posts
  { id: 'f-12', label: 'Campbell Scouting Report', subtitle: 'Post · Coach Miller', type: 'post', icon: 'doc.text.fill', route: '/(tabs)/activity' },
];
