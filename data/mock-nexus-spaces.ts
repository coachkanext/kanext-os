/**
 * Mock data — Shared Spaces for Nexus Page 2.
 * Group AI workspaces where multiple people collaborate with Nexus.
 */

export interface SharedSpace {
  id: string;
  name: string;
  initials: string;
  memberCount: number;
  lastMessage: string;
  lastSender: string;
  timestamp: Date;
  unread: boolean;
  pinned: boolean;
  muted: boolean;
}

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

const MOCK_SPACES: SharedSpace[] = [
  {
    id: 'sp1',
    name: 'Coaching Staff',
    initials: 'CS',
    memberCount: 8,
    lastMessage: 'Nexus pulled the film clips from last week',
    lastSender: 'Nexus',
    timestamp: hoursAgo(1),
    unread: true,
    pinned: false,
    muted: false,
  },
  {
    id: 'sp2',
    name: 'Recruiting Board',
    initials: 'RB',
    memberCount: 5,
    lastMessage: 'Updated the 2027 prospect rankings',
    lastSender: 'Coach Davis',
    timestamp: hoursAgo(3),
    unread: false,
    pinned: true,
    muted: false,
  },
  {
    id: 'sp3',
    name: 'Game Day Prep',
    initials: 'GP',
    memberCount: 12,
    lastMessage: 'Weather forecast looks clear for Saturday',
    lastSender: 'Nexus',
    timestamp: hoursAgo(6),
    unread: true,
    pinned: false,
    muted: false,
  },
  {
    id: 'sp4',
    name: 'Budget Committee',
    initials: 'BC',
    memberCount: 4,
    lastMessage: 'Q3 travel expenses are within budget',
    lastSender: 'Sarah Chen',
    timestamp: hoursAgo(18),
    unread: false,
    pinned: false,
    muted: false,
  },
  {
    id: 'sp5',
    name: 'Staff Wellness',
    initials: 'SW',
    memberCount: 15,
    lastMessage: 'Team lunch scheduled for Thursday',
    lastSender: 'Coach Miller',
    timestamp: hoursAgo(24),
    unread: false,
    pinned: false,
    muted: true,
  },
];

export function getSharedSpaces(): SharedSpace[] {
  return MOCK_SPACES;
}
