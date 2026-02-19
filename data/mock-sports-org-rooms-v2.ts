/**
 * Sports Organization Rooms V2 — Mock Data & Types
 * Official rooms, announcements, unit rooms, and escalations
 * for Sports Mode organizations.
 * Seeded with FMU Men's Basketball 2025-26 season data.
 */

// =============================================================================
// TYPES
// =============================================================================

export type SportsOrgRoomsSubTab =
  | 'overview'
  | 'official'
  | 'announcements'
  | 'unit-rooms'
  | 'escalations'
  | 'pinned'
  | 'archived'
  | 'search'
  | 'permissions'
  | 'settings';

export interface RoomsSubTab {
  id: SportsOrgRoomsSubTab;
  label: string;
  icon: string;
}

export interface OfficialRoom {
  id: string;
  name: string;
  type: 'coaches' | 'ops' | 'medical' | 'recruiting' | 'players' | 'leadership';
  owner: string;
  members?: string[];
  lastActivity: string;
  unread: number;
  requiredReadPending: number;
  memberCount: number;
  rbacRestricted?: boolean;
  recentMessages?: RoomMessage[];
  data_source?: string;
}

export interface RoomMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  title: string;
  audience: 'staff' | 'players' | 'recruits' | 'all';
  expirationDate: string;
  confirmationRate: number;
  totalRecipients: number;
  confirmedCount: number;
  postedBy: string;
  postedDate: string;
  requiredRead?: boolean;
  data_source?: string;
}

export interface UnitRoom {
  id: string;
  name: string;
  unit: 'coaching' | 'ops' | 'medical' | 'analytics' | 'academics' | 'compliance';
  purpose: string;
  memberCount: number;
  lastMessage: string;
  lastMessageDate: string;
  data_source?: string;
}

export interface Escalation {
  id: string;
  message: string;
  type: 'decision' | 'policy' | 'injury' | 'travel';
  sourceName: string;
  sourceRoom: string;
  date: string;
  resolved: boolean;
  data_source?: string;
}

// =============================================================================
// LABEL / COLOR CONSTANTS
// =============================================================================

export const ROOM_TYPE_LABELS: Record<OfficialRoom['type'], string> = {
  coaches: 'Coaches',
  ops: 'Operations',
  medical: 'Medical',
  recruiting: 'Recruiting',
  players: 'Players',
  leadership: 'Leadership',
};

export const ROOM_TYPE_COLORS: Record<OfficialRoom['type'], string> = {
  coaches: '#6AA9FF',
  ops: '#22C55E',
  medical: '#EF4444',
  recruiting: '#A78BFA',
  players: '#F59E0B',
  leadership: '#8B5CF6',
};

export const ANNOUNCEMENT_AUDIENCE_LABELS: Record<Announcement['audience'], string> = {
  staff: 'Staff',
  players: 'Players',
  recruits: 'Recruits',
  all: 'All',
};

export const ANNOUNCEMENT_AUDIENCE_COLORS: Record<Announcement['audience'], string> = {
  staff: '#6AA9FF',
  players: '#22C55E',
  recruits: '#A78BFA',
  all: '#8B5CF6',
};

export const UNIT_LABELS: Record<UnitRoom['unit'], string> = {
  coaching: 'Coaching',
  ops: 'Operations',
  medical: 'Medical',
  analytics: 'Analytics',
  academics: 'Academics',
  compliance: 'Compliance',
};

export const UNIT_COLORS: Record<UnitRoom['unit'], string> = {
  coaching: '#6AA9FF',
  ops: '#22C55E',
  medical: '#EF4444',
  analytics: '#A78BFA',
  academics: '#F59E0B',
  compliance: '#8B5CF6',
};

export const ESCALATION_TYPE_LABELS: Record<Escalation['type'], string> = {
  decision: 'Decision',
  policy: 'Policy',
  injury: 'Injury',
  travel: 'Travel',
};

export const ESCALATION_TYPE_COLORS: Record<Escalation['type'], string> = {
  decision: '#F59E0B',
  policy: '#8B5CF6',
  injury: '#EF4444',
  travel: '#A78BFA',
};

// =============================================================================
// SUB-TABS
// =============================================================================

export const ROOMS_SUB_TABS: RoomsSubTab[] = [
  { id: 'overview', label: 'Overview', icon: 'square.grid.2x2.fill' },
  { id: 'official', label: 'Official', icon: 'building.2.fill' },
  { id: 'announcements', label: 'Announcements', icon: 'megaphone.fill' },
  { id: 'unit-rooms', label: 'Unit Rooms', icon: 'rectangle.3.group.fill' },
  { id: 'escalations', label: 'Escalations', icon: 'exclamationmark.triangle.fill' },
  { id: 'pinned', label: 'Pinned', icon: 'pin.fill' },
  { id: 'archived', label: 'Archived', icon: 'archivebox.fill' },
  { id: 'search', label: 'Search', icon: 'magnifyingglass' },
  { id: 'permissions', label: 'Permissions', icon: 'lock.shield.fill' },
  { id: 'settings', label: 'Settings', icon: 'gearshape.fill' },
];

// =============================================================================
// SEEDED DATA — FMU Men's Basketball 2025-26
// =============================================================================

export const OFFICIAL_ROOMS: OfficialRoom[] = [
  {
    id: 'or-1',
    name: 'Coaches Room',
    type: 'coaches',
    owner: 'Sammy Kalejaiye',
    members: ['Sammy Kalejaiye', 'Coach Marcus Davis', 'Coach Andre Williams'],
    lastActivity: '2026-02-18T10:30:00Z',
    unread: 4,
    requiredReadPending: 1,
    memberCount: 3,
    recentMessages: [
      { id: 'cm-1', sender: 'Sammy Kalejaiye', text: 'Film session at 6 PM tonight — bring your Keiser scouting notes.', timestamp: '2026-02-18T10:30:00Z' },
      { id: 'cm-2', sender: 'Coach Marcus Davis', text: 'Got it. I\'ll have the recruiting call list prepped for after film.', timestamp: '2026-02-18T10:22:00Z' },
      { id: 'cm-3', sender: 'Coach Andre Williams', text: 'Moratinos is still day-to-day. Patterson says MRI is tomorrow morning.', timestamp: '2026-02-18T09:45:00Z' },
      { id: 'cm-4', sender: 'Sammy Kalejaiye', text: 'Let\'s plan to run the Keiser press-break sets in practice at 3 PM.', timestamp: '2026-02-18T08:15:00Z' },
      { id: 'cm-5', sender: 'Coach Marcus Davis', text: 'Trey Williams hasn\'t responded to our offer — might need a call from you, Coach.', timestamp: '2026-02-17T16:00:00Z' },
    ],
    data_source: 'demo_seed',
  },
  {
    id: 'or-2',
    name: 'Ops Room',
    type: 'ops',
    owner: 'Sammy Kalejaiye',
    members: ['Sammy Kalejaiye', 'Jordan Mitchell', 'Tyler Brooks', 'Mike Reeves'],
    lastActivity: '2026-02-18T09:15:00Z',
    unread: 5,
    requiredReadPending: 1,
    memberCount: 4,
    data_source: 'demo_seed',
  },
  {
    id: 'or-3',
    name: 'Recruiting Room',
    type: 'recruiting',
    owner: 'Coach Marcus Davis',
    members: ['Sammy Kalejaiye', 'Coach Marcus Davis', 'Coach Andre Williams'],
    lastActivity: '2026-02-18T08:00:00Z',
    unread: 3,
    requiredReadPending: 0,
    memberCount: 3,
    data_source: 'demo_seed',
  },
  {
    id: 'or-4',
    name: 'Players Room',
    type: 'players',
    owner: 'Sammy Kalejaiye',
    members: [
      'Jalen Carter', 'Kadyn Selden', 'Jean Mentor', 'Woody Noel', 'Terrence Brewer',
      'Kaleb Munir-Jones', 'Jaylen Thomas', 'Amar Asceric', 'Brandon Lewis',
      'Jermaine Thompson', 'Esteban Moratinos', 'Darnell Benbo', 'Kameron Morris',
      'Devon Turner', 'Trevon Morgan',
    ],
    lastActivity: '2026-02-18T11:00:00Z',
    unread: 8,
    requiredReadPending: 2,
    memberCount: 15,
    data_source: 'demo_seed',
  },
  {
    id: 'or-5',
    name: 'Leadership Room',
    type: 'leadership',
    owner: 'Sammy Kalejaiye',
    members: ['Sammy Kalejaiye', 'AD Office'],
    lastActivity: '2026-02-17T14:30:00Z',
    unread: 1,
    requiredReadPending: 1,
    memberCount: 2,
    rbacRestricted: true,
    data_source: 'demo_seed',
  },
  {
    id: 'or-6',
    name: 'Medical / Performance Room',
    type: 'medical',
    owner: 'Dr. Nicole Patterson',
    members: ['Dr. Nicole Patterson', 'Mike Reeves', 'Sammy Kalejaiye'],
    lastActivity: '2026-02-17T16:45:00Z',
    unread: 2,
    requiredReadPending: 0,
    memberCount: 3,
    rbacRestricted: true,
    data_source: 'demo_seed',
  },
];

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Travel itinerary posted for Saturday\'s away game',
    audience: 'all',
    expirationDate: '2026-02-22',
    confirmationRate: 0.8,
    totalRecipients: 15,
    confirmedCount: 12,
    postedBy: 'Sammy Kalejaiye',
    postedDate: '2026-02-16',
    requiredRead: true,
    data_source: 'demo_seed',
  },
  {
    id: 'ann-2',
    title: 'Updated practice schedule for this week',
    audience: 'players',
    expirationDate: '2026-02-23',
    confirmationRate: 0.53,
    totalRecipients: 15,
    confirmedCount: 8,
    postedBy: 'Sammy Kalejaiye',
    postedDate: '2026-02-17',
    data_source: 'demo_seed',
  },
  {
    id: 'ann-3',
    title: 'NAIA Drug Testing Protocol Reminder',
    audience: 'players',
    expirationDate: '2026-03-15',
    confirmationRate: 0.6,
    totalRecipients: 15,
    confirmedCount: 9,
    postedBy: 'Lisa Chen (Compliance)',
    postedDate: '2026-02-10',
    data_source: 'demo_seed',
  },
  {
    id: 'ann-4',
    title: 'Post-Season Planning Meeting — Staff Only',
    audience: 'staff',
    expirationDate: '2026-02-20',
    confirmationRate: 1.0,
    totalRecipients: 7,
    confirmedCount: 7,
    postedBy: 'Sammy Kalejaiye',
    postedDate: '2026-02-12',
    data_source: 'demo_seed',
  },
];

export const UNIT_ROOMS: UnitRoom[] = [
  {
    id: 'ur-1',
    name: 'Offensive Game Planning',
    unit: 'coaching',
    purpose: 'Weekly offensive scheme prep, play design, and scouting breakdowns.',
    memberCount: 3,
    lastMessage: 'Updated Keiser press-break sets — film link attached',
    lastMessageDate: '2026-02-18T10:00:00Z',
    data_source: 'demo_seed',
  },
  {
    id: 'ur-2',
    name: 'Defensive Game Planning',
    unit: 'coaching',
    purpose: 'Defensive scouting, matchup assignments, and adjustment packages.',
    memberCount: 3,
    lastMessage: 'Keiser personnel report — key actions on #24 and #3',
    lastMessageDate: '2026-02-17T15:30:00Z',
    data_source: 'demo_seed',
  },
  {
    id: 'ur-3',
    name: 'Travel & Logistics',
    unit: 'ops',
    purpose: 'Trip coordination, bus schedules, hotel confirmations, meal orders.',
    memberCount: 4,
    lastMessage: 'Keiser trip hotel confirmed — Hampton Inn West Palm, 9 rooms',
    lastMessageDate: '2026-02-16T11:00:00Z',
    data_source: 'demo_seed',
  },
  {
    id: 'ur-4',
    name: 'Injury & Recovery Updates',
    unit: 'medical',
    purpose: 'Daily injury reports, treatment plans, and return-to-play statuses.',
    memberCount: 3,
    lastMessage: 'Moratinos MRI scheduled Feb 19 — Dr. Santos confirmed',
    lastMessageDate: '2026-02-17T17:00:00Z',
    data_source: 'demo_seed',
  },
  {
    id: 'ur-5',
    name: 'Film & Analytics',
    unit: 'analytics',
    purpose: 'Film tagging, stat breakdowns, and opponent tendency reports.',
    memberCount: 4,
    lastMessage: 'Uploaded Ave Maria game film — tagged possessions ready',
    lastMessageDate: '2026-02-16T08:30:00Z',
    data_source: 'demo_seed',
  },
  {
    id: 'ur-6',
    name: 'Academic Monitoring',
    unit: 'academics',
    purpose: 'GPA tracking, study hall attendance, and eligibility alerts.',
    memberCount: 3,
    lastMessage: 'Munir-Jones & Dues flagged — midterm review pending',
    lastMessageDate: '2026-02-15T14:00:00Z',
    data_source: 'demo_seed',
  },
  {
    id: 'ur-7',
    name: 'NAIA Compliance Channel',
    unit: 'compliance',
    purpose: 'Eligibility paperwork, transfer portal docs, drug testing coordination.',
    memberCount: 4,
    lastMessage: 'Brandon Lewis transcript request sent to registrar — follow up Feb 20',
    lastMessageDate: '2026-02-14T10:00:00Z',
    data_source: 'demo_seed',
  },
  {
    id: 'ur-8',
    name: 'Recruiting Pipeline',
    unit: 'coaching',
    purpose: 'Recruit eval notes, visit coordination, and offer tracking.',
    memberCount: 3,
    lastMessage: 'Trey Williams visit rescheduled — needs new date before Feb 25',
    lastMessageDate: '2026-02-18T09:00:00Z',
    data_source: 'demo_seed',
  },
];

export const ESCALATIONS: Escalation[] = [
  {
    id: 'esc-1',
    message: 'Keiser away game travel budget requires AD approval — deadline Feb 20',
    type: 'decision',
    sourceName: 'Tyler Brooks',
    sourceRoom: 'Ops Room',
    date: '2026-02-16T10:00:00Z',
    resolved: false,
    data_source: 'demo_seed',
  },
  {
    id: 'esc-2',
    message: 'Moratinos knee injury — possible multi-week absence. MRI results expected Feb 19.',
    type: 'injury',
    sourceName: 'Dr. Nicole Patterson',
    sourceRoom: 'Medical / Performance Room',
    date: '2026-02-17T17:30:00Z',
    resolved: false,
    data_source: 'demo_seed',
  },
  {
    id: 'esc-3',
    message: 'Brandon Lewis transfer eligibility still pending — registrar has not responded in 5 days',
    type: 'policy',
    sourceName: 'Lisa Chen',
    sourceRoom: 'NAIA Compliance Channel',
    date: '2026-02-15T09:00:00Z',
    resolved: false,
    data_source: 'demo_seed',
  },
  {
    id: 'esc-4',
    message: 'Charter One invoice overdue — bus service may be suspended for Keiser away trip',
    type: 'travel',
    sourceName: 'Tyler Brooks',
    sourceRoom: 'Travel & Logistics',
    date: '2026-02-14T14:00:00Z',
    resolved: false,
    data_source: 'demo_seed',
  },
  {
    id: 'esc-5',
    message: 'Trey Williams (recruit) considering competing offer from Keiser — need call from HC by Feb 19',
    type: 'decision',
    sourceName: 'Coach Marcus Davis',
    sourceRoom: 'Recruiting Room',
    date: '2026-02-17T08:00:00Z',
    resolved: false,
    data_source: 'demo_seed',
  },
];

// =============================================================================
// OVERVIEW SUMMARY
// =============================================================================

export interface RoomsOverview {
  totalRooms: number;
  totalUnread: number;
  requiringConfirmation: number;
  pinnedMessages: number;
  openEscalations: number;
  totalAnnouncements: number;
  announcementsBelowThreshold: number;
  unitRoomCount: number;
  mostActiveRoom: string;
}

export function getRoomsOverview(): RoomsOverview {
  const totalUnread = OFFICIAL_ROOMS.reduce((sum, r) => sum + r.unread, 0);
  const requiringConfirmation = OFFICIAL_ROOMS.reduce((sum, r) => sum + r.requiredReadPending, 0);
  const openEscalations = ESCALATIONS.filter((e) => !e.resolved).length;
  const announcementsBelowThreshold = ANNOUNCEMENTS.filter((a) => a.confirmationRate < 0.8).length;

  // Find most active room by most recent activity
  const sortedRooms = [...OFFICIAL_ROOMS].sort(
    (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime(),
  );

  return {
    totalRooms: OFFICIAL_ROOMS.length + UNIT_ROOMS.length,
    totalUnread,
    requiringConfirmation,
    pinnedMessages: 3,  // Static count for now
    openEscalations,
    totalAnnouncements: ANNOUNCEMENTS.length,
    announcementsBelowThreshold,
    unitRoomCount: UNIT_ROOMS.length,
    mostActiveRoom: sortedRooms[0]?.name ?? 'N/A',
  };
}
