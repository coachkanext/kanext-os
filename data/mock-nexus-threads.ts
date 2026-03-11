/**
 * Mock data — Split Screen Threads for Nexus Page 3.
 * Contextual AI conversations started from other screens via @mention.
 */

export interface SplitThread {
  id: string;
  name: string;
  username: string;
  initials: string;
  questionPreview: string;
  contextBadge: string; // "Roster", "Game Plan", "Film", etc.
  status: 'waiting' | 'replied';
  timestamp: Date;
  unread: boolean;
  pinned: boolean;
  muted: boolean;
}

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

const MOCK_THREADS: SplitThread[] = [
  {
    id: 'st1',
    name: 'Marcus Williams',
    username: 'mwilliams',
    initials: 'MW',
    questionPreview: 'What do you think about this defensive alignment?',
    contextBadge: 'Film',
    status: 'replied',
    timestamp: hoursAgo(3),
    unread: true,
    pinned: false,
    muted: false,
  },
  {
    id: 'st2',
    name: 'Coach Thompson',
    username: 'cthompson',
    initials: 'CT',
    questionPreview: 'Can we compare these two recruits side by side?',
    contextBadge: 'Roster',
    status: 'waiting',
    timestamp: hoursAgo(5),
    unread: true,
    pinned: false,
    muted: false,
  },
  {
    id: 'st3',
    name: 'Jordan Blake',
    username: 'jblake',
    initials: 'JB',
    questionPreview: 'Run the red zone efficiency numbers for last 3 games',
    contextBadge: 'Game Plan',
    status: 'replied',
    timestamp: hoursAgo(12),
    unread: false,
    pinned: true,
    muted: false,
  },
  {
    id: 'st4',
    name: 'Riley Patterson',
    username: 'rpatterson',
    initials: 'RP',
    questionPreview: 'How does this player profile compare to our current starters?',
    contextBadge: 'Recruiting',
    status: 'waiting',
    timestamp: hoursAgo(20),
    unread: false,
    pinned: false,
    muted: false,
  },
];

export function getSplitThreads(): SplitThread[] {
  return MOCK_THREADS;
}
