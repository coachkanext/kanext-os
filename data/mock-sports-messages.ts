/**
 * Sports Messages — RBAC-gated inbox threads, rooms, requests, and pinned items.
 * Institutional-grade mock data for Sports mode messaging.
 */

import type { MessagesSection } from '@/utils/sports-rbac';

// =============================================================================
// ENUMS + TYPES
// =============================================================================

export type ThreadPriority = 'blocker' | 'approval' | 'due_24h' | 'normal';
export type ThreadUrgency = 'critical' | 'high' | 'medium' | 'low';
export type RoomCategory = 'command' | 'staff' | 'player' | 'recruiting' | 'ops_travel' | 'media' | 'compliance';
export type RequestType = 'approval' | 'roster' | 'schedule' | 'recruiting' | 'eligibility' | 'finance' | 'incident';
export type RequestStatus = 'pending' | 'approved' | 'denied' | 'escalated';
export type ImpactFlag = 'blocks_practice' | 'blocks_travel' | 'blocks_game' | 'blocks_eligibility' | 'blocks_publish';
export type PinnedItemType = 'room' | 'thread' | 'request' | 'queue';

export interface SportsInboxThread {
  id: string;
  title: string;
  sender: string;
  senderInitials: string;
  preview: string;
  time: string;
  priority: ThreadPriority;
  labels: string[];
  unreadCount: number;
  rbacSection: MessagesSection;
}

export interface SportsRoom {
  id: string;
  title: string;
  category: RoomCategory;
  avatarInitials: string;
  avatarColor: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  hasBlocker: boolean;
  hasDeadline: boolean;
  memberCount: number;
  rbacSection: MessagesSection;
}

export interface SportsRequest {
  id: string;
  type: RequestType;
  title: string;
  submitter: string;
  submitterInitials: string;
  dueDate: string;
  isOverdue: boolean;
  impactFlags: ImpactFlag[];
  status: RequestStatus;
  auditTrail: { action: string; by: string; date: string }[];
  rbacSection: MessagesSection;
}

export interface PinnedItem {
  id: string;
  title: string;
  type: PinnedItemType;
  subtitle: string;
  icon: string;
  urgency: ThreadUrgency;
  rbacSection: MessagesSection;
}

// =============================================================================
// HELPERS
// =============================================================================

export function getPriorityOrder(priority: ThreadPriority): number {
  switch (priority) {
    case 'blocker': return 0;
    case 'approval': return 1;
    case 'due_24h': return 2;
    case 'normal': return 3;
  }
}

export function getPriorityColor(priority: ThreadPriority): string {
  switch (priority) {
    case 'blocker': return '#EF4444';
    case 'approval': return '#F59E0B';
    case 'due_24h': return '#1D9BF0';
    case 'normal': return '#A1A1AA';
  }
}

export function getPriorityLabel(priority: ThreadPriority): string {
  switch (priority) {
    case 'blocker': return 'Blocker';
    case 'approval': return 'Approval';
    case 'due_24h': return 'Due <24h';
    case 'normal': return '';
  }
}

export function getUrgencyColor(urgency: ThreadUrgency): string {
  switch (urgency) {
    case 'critical': return '#EF4444';
    case 'high': return '#F59E0B';
    case 'medium': return '#1D9BF0';
    case 'low': return '#A1A1AA';
  }
}

export function getRequestTypeLabel(type: RequestType): string {
  switch (type) {
    case 'approval': return 'Approval';
    case 'roster': return 'Roster';
    case 'schedule': return 'Schedule';
    case 'recruiting': return 'Recruiting';
    case 'eligibility': return 'Eligibility';
    case 'finance': return 'Finance';
    case 'incident': return 'Incident';
  }
}

export function getRequestTypeColor(type: RequestType): string {
  switch (type) {
    case 'approval': return '#F59E0B';
    case 'roster': return '#1D9BF0';
    case 'schedule': return '#1D9BF0';
    case 'recruiting': return '#1D9BF0';
    case 'eligibility': return '#EF4444';
    case 'finance': return '#22C55E';
    case 'incident': return '#EF4444';
  }
}

export function getRequestStatusColor(status: RequestStatus): string {
  switch (status) {
    case 'pending': return '#F59E0B';
    case 'approved': return '#22C55E';
    case 'denied': return '#EF4444';
    case 'escalated': return '#1D9BF0';
  }
}

export function getImpactFlagLabel(flag: ImpactFlag): string {
  switch (flag) {
    case 'blocks_practice': return 'Practice';
    case 'blocks_travel': return 'Travel';
    case 'blocks_game': return 'Game';
    case 'blocks_eligibility': return 'Eligibility';
    case 'blocks_publish': return 'Publish';
  }
}

export function sortInboxByPriority(threads: SportsInboxThread[]): SportsInboxThread[] {
  return [...threads].sort((a, b) => getPriorityOrder(a.priority) - getPriorityOrder(b.priority));
}

export function sortRoomsByUrgency(rooms: SportsRoom[]): SportsRoom[] {
  const urgencyOrder = (r: SportsRoom) => {
    if (r.hasBlocker) return 0;
    if (r.hasDeadline) return 1;
    if (r.unreadCount > 0) return 2;
    return 3;
  };
  return [...rooms].sort((a, b) => urgencyOrder(a) - urgencyOrder(b));
}

export const ROOM_CATEGORY_LABELS: Record<RoomCategory, string> = {
  command: 'Command',
  staff: 'Staff',
  player: 'Player',
  recruiting: 'Recruiting',
  ops_travel: 'Ops & Travel',
  media: 'Media',
  compliance: 'Compliance',
};

export const ROOM_CATEGORY_ORDER: RoomCategory[] = [
  'command', 'staff', 'player', 'recruiting', 'ops_travel', 'media', 'compliance',
];

// =============================================================================
// DATA — INBOX THREADS (8)
// =============================================================================

export const SPORTS_INBOX_THREADS: SportsInboxThread[] = [
  {
    id: 'si-1', title: 'Eligibility Hold: Carter Transcript', sender: 'Academic Affairs',
    senderInitials: 'AA', preview: 'Jaylen Carter\'s updated transcript has not been received. He cannot suit up until cleared.',
    time: '10m', priority: 'blocker', labels: ['Eligibility', 'Urgent', 'Carter'],
    unreadCount: 3, rbacSection: 'inbox_eligibility',
  },
  {
    id: 'si-2', title: 'Bus Delay — LC Road Trip', sender: 'Ops Team',
    senderInitials: 'OT', preview: 'Charter bus delayed 2 hours. Departure now 1:30 PM instead of 11:30 AM. Notify players.',
    time: '25m', priority: 'blocker', labels: ['Travel', 'Logistics', 'LC Game'],
    unreadCount: 5, rbacSection: 'inbox_blockers',
  },
  {
    id: 'si-3', title: 'Travel Roster — Ridgemont Christian', sender: 'Coach Carter',
    senderInitials: 'SK', preview: 'Please review and approve the 15-man travel roster for Feb 21 game.',
    time: '1h', priority: 'approval', labels: ['Roster', 'Approval', 'Travel'],
    unreadCount: 1, rbacSection: 'inbox_approvals',
  },
  {
    id: 'si-4', title: 'Scouting Packet Due — LC', sender: 'Coach Avery',
    senderInitials: 'CL', preview: 'Scout packet for Ridgemont Christian due by EOD tomorrow. 3 game films reviewed, 2 remaining.',
    time: '2h', priority: 'due_24h', labels: ['Scouting', 'Film', 'Deadline'],
    unreadCount: 0, rbacSection: 'inbox_blockers',
  },
  {
    id: 'si-5', title: 'Ankle Status Update — Williams', sender: 'Sports Med',
    senderInitials: 'SM', preview: 'Devon Williams cleared for non-contact practice. Full contact decision by Thursday.',
    time: '3h', priority: 'normal', labels: ['Health', 'Williams', 'Update'],
    unreadCount: 1, rbacSection: 'inbox_blockers',
  },
  {
    id: 'si-6', title: 'Visit Itinerary — Elijah Moore', sender: 'Recruiting Coordinator',
    senderInitials: 'RC', preview: 'Official visit scheduled Feb 22-23. Campus tour, academic meetings, practice observation confirmed.',
    time: '4h', priority: 'normal', labels: ['Recruiting', 'Visit', 'Moore'],
    unreadCount: 2, rbacSection: 'inbox_recruiting',
  },
  {
    id: 'si-7', title: 'Postgame Clip Approval', sender: 'Media Ops',
    senderInitials: 'MO', preview: 'Highlight reel from SW Assemblies game ready for social media. Need coach approval before posting.',
    time: '6h', priority: 'approval', labels: ['Media', 'Approval', 'Social'],
    unreadCount: 1, rbacSection: 'inbox_approvals',
  },
  {
    id: 'si-8', title: 'Rotation Meeting Request', sender: 'Coach Davis',
    senderInitials: 'CD', preview: 'Requesting 30-min meeting to discuss rotation adjustments for LC game. Thursday preferred.',
    time: '8h', priority: 'normal', labels: ['Meeting', 'Rotation', 'Strategy'],
    unreadCount: 0, rbacSection: 'inbox_blockers',
  },
];

// =============================================================================
// DATA — ROOMS (11)
// =============================================================================

export const SPORTS_ROOMS: SportsRoom[] = [
  {
    id: 'sr-1', title: 'Program Command', category: 'command',
    avatarInitials: 'PC', avatarColor: '#1D9BF0',
    lastMessage: 'Bus delay confirmed. Updated departure at 1:30 PM.',
    lastMessageTime: '25m', unreadCount: 8, hasBlocker: true, hasDeadline: false,
    memberCount: 4, rbacSection: 'rooms_command',
  },
  {
    id: 'sr-2', title: 'MBB Command', category: 'command',
    avatarInitials: 'MC', avatarColor: '#0B0F14',
    lastMessage: 'Carter eligibility update — transcript pending.',
    lastMessageTime: '1h', unreadCount: 5, hasBlocker: true, hasDeadline: false,
    memberCount: 3, rbacSection: 'rooms_command',
  },
  {
    id: 'sr-3', title: 'Coaching Staff', category: 'staff',
    avatarInitials: 'CS', avatarColor: '#0B0F14',
    lastMessage: 'Scout packet deadline tomorrow EOD. Quinn and Blake, please finalize.',
    lastMessageTime: '2h', unreadCount: 3, hasBlocker: false, hasDeadline: true,
    memberCount: 5, rbacSection: 'rooms_staff',
  },
  {
    id: 'sr-4', title: 'Player Leadership Council', category: 'player',
    avatarInitials: 'PL', avatarColor: '#0B0F14',
    lastMessage: 'Team dinner location vote — reply by 5 PM.',
    lastMessageTime: '3h', unreadCount: 2, hasBlocker: false, hasDeadline: true,
    memberCount: 5, rbacSection: 'rooms_player',
  },
  {
    id: 'sr-5', title: 'Team Room', category: 'player',
    avatarInitials: 'TR', avatarColor: '#0B0F14',
    lastMessage: 'Great win tonight! Film session tomorrow at 2 PM.',
    lastMessageTime: '4h', unreadCount: 0, hasBlocker: false, hasDeadline: false,
    memberCount: 18, rbacSection: 'rooms_player',
  },
  {
    id: 'sr-6', title: 'Recruiting War Room', category: 'recruiting',
    avatarInitials: 'RW', avatarColor: '#1D9BF0',
    lastMessage: 'Elijah Moore visit locked in for Feb 22. Full itinerary attached.',
    lastMessageTime: '4h', unreadCount: 4, hasBlocker: false, hasDeadline: true,
    memberCount: 4, rbacSection: 'rooms_recruiting',
  },
  {
    id: 'sr-7', title: 'Visit Ops', category: 'ops_travel',
    avatarInitials: 'VO', avatarColor: '#1D9BF0',
    lastMessage: 'Hotel reservation confirmed for Moore visit.',
    lastMessageTime: '5h', unreadCount: 1, hasBlocker: false, hasDeadline: false,
    memberCount: 3, rbacSection: 'rooms_ops_travel',
  },
  {
    id: 'sr-8', title: 'Travel Ops', category: 'ops_travel',
    avatarInitials: 'TO', avatarColor: '#F59E0B',
    lastMessage: 'Updated bus schedule attached. New departure 1:30 PM.',
    lastMessageTime: '30m', unreadCount: 6, hasBlocker: true, hasDeadline: false,
    memberCount: 5, rbacSection: 'rooms_ops_travel',
  },
  {
    id: 'sr-9', title: 'Academic / Eligibility Liaison', category: 'compliance',
    avatarInitials: 'AE', avatarColor: '#EF4444',
    lastMessage: 'Carter transcript status: request sent to registrar. ETA 24-48h.',
    lastMessageTime: '1h', unreadCount: 2, hasBlocker: true, hasDeadline: false,
    memberCount: 3, rbacSection: 'rooms_compliance',
  },
  {
    id: 'sr-10', title: 'Media Ops', category: 'media',
    avatarInitials: 'MO', avatarColor: '#1D9BF0',
    lastMessage: 'Highlight reel draft uploaded. Awaiting coach review.',
    lastMessageTime: '6h', unreadCount: 1, hasBlocker: false, hasDeadline: true,
    memberCount: 4, rbacSection: 'rooms_media',
  },
  {
    id: 'sr-11', title: 'Sports Med + Performance', category: 'staff',
    avatarInitials: 'SP', avatarColor: '#22C55E',
    lastMessage: 'Williams ankle: MRI clean. Cleared for non-contact.',
    lastMessageTime: '3h', unreadCount: 1, hasBlocker: false, hasDeadline: false,
    memberCount: 4, rbacSection: 'rooms_staff',
  },
];

// =============================================================================
// DATA — REQUESTS (10)
// =============================================================================

export const SPORTS_REQUESTS: SportsRequest[] = [
  {
    id: 'rq-1', type: 'approval', title: 'Approve Travel Roster — LC Game',
    submitter: 'Coach Carter', submitterInitials: 'SK', dueDate: 'Feb 18', isOverdue: false,
    impactFlags: ['blocks_travel', 'blocks_game'], status: 'pending',
    auditTrail: [
      { action: 'Submitted', by: 'Coach Carter', date: 'Feb 15, 9:00 AM' },
    ],
    rbacSection: 'requests_approval',
  },
  {
    id: 'rq-2', type: 'roster', title: 'Add Walk-On: Tyler James',
    submitter: 'Coach Avery', submitterInitials: 'CL', dueDate: 'Feb 20', isOverdue: false,
    impactFlags: ['blocks_eligibility'], status: 'pending',
    auditTrail: [
      { action: 'Submitted', by: 'Coach Avery', date: 'Feb 14, 2:00 PM' },
    ],
    rbacSection: 'requests_roster',
  },
  {
    id: 'rq-3', type: 'schedule', title: 'Schedule Change: Move Practice to 4 PM',
    submitter: 'Coach Davis', submitterInitials: 'CD', dueDate: 'Feb 17', isOverdue: false,
    impactFlags: ['blocks_practice'], status: 'pending',
    auditTrail: [
      { action: 'Submitted', by: 'Coach Davis', date: 'Feb 14, 11:00 AM' },
    ],
    rbacSection: 'requests_schedule',
  },
  {
    id: 'rq-4', type: 'recruiting', title: 'Official Visit Approval — Elijah Moore',
    submitter: 'Recruiting Coordinator', submitterInitials: 'RC', dueDate: 'Feb 19', isOverdue: false,
    impactFlags: [], status: 'approved',
    auditTrail: [
      { action: 'Submitted', by: 'Recruiting Coord', date: 'Feb 10, 3:00 PM' },
      { action: 'Approved', by: 'AD Office', date: 'Feb 12, 10:00 AM' },
    ],
    rbacSection: 'requests_recruiting',
  },
  {
    id: 'rq-5', type: 'eligibility', title: 'Transcript Request — Carter',
    submitter: 'Academic Affairs', submitterInitials: 'AA', dueDate: 'Feb 16', isOverdue: true,
    impactFlags: ['blocks_eligibility', 'blocks_game'], status: 'escalated',
    auditTrail: [
      { action: 'Submitted', by: 'Academic Affairs', date: 'Feb 10, 8:00 AM' },
      { action: 'Escalated', by: 'Compliance', date: 'Feb 14, 4:00 PM' },
    ],
    rbacSection: 'requests_eligibility',
  },
  {
    id: 'rq-6', type: 'finance', title: 'Travel Budget Approval — Feb Road Trip',
    submitter: 'Ops Lead', submitterInitials: 'OL', dueDate: 'Feb 18', isOverdue: false,
    impactFlags: ['blocks_travel'], status: 'pending',
    auditTrail: [
      { action: 'Submitted', by: 'Ops Lead', date: 'Feb 13, 1:00 PM' },
    ],
    rbacSection: 'requests_finance',
  },
  {
    id: 'rq-7', type: 'incident', title: 'Player Conduct Report — Missed Curfew',
    submitter: 'Coach Davis', submitterInitials: 'CD', dueDate: 'Feb 17', isOverdue: false,
    impactFlags: [], status: 'pending',
    auditTrail: [
      { action: 'Filed', by: 'Coach Davis', date: 'Feb 14, 10:00 PM' },
    ],
    rbacSection: 'requests_incident',
  },
  {
    id: 'rq-8', type: 'approval', title: 'Postgame Highlight Reel — Social Media',
    submitter: 'Media Ops', submitterInitials: 'MO', dueDate: 'Feb 16', isOverdue: false,
    impactFlags: ['blocks_publish'], status: 'pending',
    auditTrail: [
      { action: 'Submitted', by: 'Media Ops', date: 'Feb 14, 6:00 PM' },
    ],
    rbacSection: 'requests_approval',
  },
  {
    id: 'rq-9', type: 'schedule', title: 'Gym Reservation — Extra Shooting Session',
    submitter: 'Coach Avery', submitterInitials: 'CL', dueDate: 'Feb 18', isOverdue: false,
    impactFlags: [], status: 'approved',
    auditTrail: [
      { action: 'Submitted', by: 'Coach Avery', date: 'Feb 13, 9:00 AM' },
      { action: 'Approved', by: 'Facilities', date: 'Feb 13, 11:00 AM' },
    ],
    rbacSection: 'requests_schedule',
  },
  {
    id: 'rq-10', type: 'recruiting', title: 'Scholarship Offer Letter — Jordan Hayes',
    submitter: 'Coach Carter', submitterInitials: 'SK', dueDate: 'Feb 22', isOverdue: false,
    impactFlags: [], status: 'pending',
    auditTrail: [
      { action: 'Submitted', by: 'Coach Carter', date: 'Feb 15, 8:00 AM' },
    ],
    rbacSection: 'requests_recruiting',
  },
];

// =============================================================================
// DATA — PINNED ITEMS
// =============================================================================

/** R1 default pinned items (AD/HC/GM) */
export const SPORTS_PINNED_R1: PinnedItem[] = [
  { id: 'pin-1', title: 'MBB Command', type: 'room', subtitle: '5 unread', icon: 'star.fill', urgency: 'critical', rbacSection: 'pinned_full' },
  { id: 'pin-2', title: 'Coaching Staff', type: 'room', subtitle: 'Deadline tomorrow', icon: 'person.3.fill', urgency: 'high', rbacSection: 'pinned_full' },
  { id: 'pin-3', title: 'Travel Ops', type: 'room', subtitle: 'Bus delay active', icon: 'bus.fill', urgency: 'critical', rbacSection: 'pinned_full' },
  { id: 'pin-4', title: 'Academic Liaison', type: 'room', subtitle: 'Carter eligibility', icon: 'graduationcap.fill', urgency: 'critical', rbacSection: 'pinned_full' },
  { id: 'pin-5', title: 'Media Ops', type: 'room', subtitle: 'Approval pending', icon: 'play.rectangle.fill', urgency: 'medium', rbacSection: 'pinned_full' },
  { id: 'pin-6', title: 'Recruiting War Room', type: 'room', subtitle: 'Moore visit locked', icon: 'target', urgency: 'medium', rbacSection: 'pinned_full' },
  { id: 'pin-7', title: 'Approvals Queue', type: 'queue', subtitle: '3 pending', icon: 'checkmark.circle.fill', urgency: 'high', rbacSection: 'pinned_full' },
  { id: 'pin-8', title: 'DM: Ops Lead', type: 'thread', subtitle: 'Travel budget', icon: 'envelope.fill', urgency: 'medium', rbacSection: 'pinned_full' },
  { id: 'pin-9', title: 'DM: Recruiting Coord', type: 'thread', subtitle: 'Moore itinerary', icon: 'envelope.fill', urgency: 'low', rbacSection: 'pinned_full' },
  { id: 'pin-10', title: 'Top Blocker: Carter Eligibility', type: 'request', subtitle: 'Escalated', icon: 'exclamationmark.triangle.fill', urgency: 'critical', rbacSection: 'pinned_full' },
];

/** R3 default pinned items (Asst Coach) */
export const SPORTS_PINNED_R3: PinnedItem[] = [
  { id: 'pin-r3-1', title: 'Team Room', type: 'room', subtitle: 'Film session 2 PM', icon: 'person.3.fill', urgency: 'medium', rbacSection: 'pinned_full' },
  { id: 'pin-r3-2', title: 'Player Leadership', type: 'room', subtitle: 'Dinner vote', icon: 'star.fill', urgency: 'low', rbacSection: 'pinned_full' },
  { id: 'pin-r3-3', title: 'My Assignments', type: 'queue', subtitle: '2 in progress', icon: 'checklist', urgency: 'medium', rbacSection: 'pinned_full' },
  { id: 'pin-r3-4', title: 'DM: Position Coach', type: 'thread', subtitle: 'Carter development', icon: 'envelope.fill', urgency: 'low', rbacSection: 'pinned_full' },
];

/** Get pinned items for a role */
export function getSportsPinnedItems(roleKey: string): PinnedItem[] {
  if (roleKey === 'R1') return SPORTS_PINNED_R1;
  if (roleKey === 'R3') return SPORTS_PINNED_R3;
  return [];
}

/** Sort pinned items: Blockers > Due<24h > Game-within-44h > Recruiting > rest */
export function sortPinnedItems(items: PinnedItem[]): PinnedItem[] {
  const urgencyOrder: Record<ThreadUrgency, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return [...items].sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
}

// =============================================================================
// DM THREAD MESSAGES — 8 realistic conversation threads (demo_seed)
// =============================================================================

export type MessageDirection = 'sent' | 'received';

export interface SportsMessage {
  id: string;
  threadId: string;
  sender: string;
  senderInitials: string;
  direction: MessageDirection;
  body: string;
  timestamp: string;
  read: boolean;
  /** Data provenance tag */
  data_source?: string;
}

export interface SportsDMThread {
  id: string;
  title: string;
  participantName: string;
  participantInitials: string;
  participantRole: string;
  lastMessagePreview: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: SportsMessage[];
  /** Data provenance tag */
  data_source?: string;
}

// ── Thread 1: Assistant Coach — upcoming game prep ──────────────────────
const dmThread1Messages: SportsMessage[] = [
  {
    id: 'dm-1-1', threadId: 'dmt-1', sender: 'Coach Davis', senderInitials: 'CD',
    direction: 'received',
    body: 'Coach, I finished the scout report on St. Thomas. Their starting five is solid but they turn it over on full-court pressure. We forced 18 turnovers against Warner with the same look.',
    timestamp: '2026-02-16T09:15:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-1-2', threadId: 'dmt-1', sender: 'Alex Morgan', senderInitials: 'SK',
    direction: 'sent',
    body: 'Good find. Let\'s start in our 1-2-2 press and force them to make decisions with the ball. What\'s their PG\'s assist-to-turnover ratio look like?',
    timestamp: '2026-02-16T09:28:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-1-3', threadId: 'dmt-1', sender: 'Coach Davis', senderInitials: 'CD',
    direction: 'received',
    body: '1.4 to 1 — nothing special. He struggles going left. I clipped 6 possessions from their Warner game showing it. Want me to drop those in the film room for tomorrow\'s walk-through?',
    timestamp: '2026-02-16T09:35:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-1-4', threadId: 'dmt-1', sender: 'Alex Morgan', senderInitials: 'SK',
    direction: 'sent',
    body: 'Yes, tag them for the guards specifically. Also pull their zone offense — they ran a 2-3 in the second half last two games. I want our bigs prepared.',
    timestamp: '2026-02-16T09:42:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-1-5', threadId: 'dmt-1', sender: 'Coach Davis', senderInitials: 'CD',
    direction: 'received',
    body: 'On it. Film will be tagged and ready by 3 PM. I\'ll also prep the halftime adjustment packet so we can quick-flip if they switch defenses.',
    timestamp: '2026-02-16T09:50:00', read: false, data_source: 'demo_seed',
  },
];

// ── Thread 2: Recruit responding to offer ───────────────────────────────
const dmThread2Messages: SportsMessage[] = [
  {
    id: 'dm-2-1', threadId: 'dmt-2', sender: 'Alex Morgan', senderInitials: 'SK',
    direction: 'sent',
    body: 'Jordan, thanks for visiting campus last weekend. The staff and I were really impressed with your game and your character. We\'d like to officially extend a scholarship offer to you for the 2026-27 season.',
    timestamp: '2026-02-14T10:00:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-2-2', threadId: 'dmt-2', sender: 'Jordan Hayes', senderInitials: 'JH',
    direction: 'received',
    body: 'Coach Carter, thank you so much. My family and I really felt at home when we visited KaNeXT. The campus, the team culture, and the academics are everything I\'m looking for.',
    timestamp: '2026-02-14T14:22:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-2-3', threadId: 'dmt-2', sender: 'Jordan Hayes', senderInitials: 'JH',
    direction: 'received',
    body: 'I do have one question — is there flexibility on the academic support side? I\'m planning to major in Business Administration and want to make sure I can balance both.',
    timestamp: '2026-02-14T14:25:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-2-4', threadId: 'dmt-2', sender: 'Alex Morgan', senderInitials: 'SK',
    direction: 'sent',
    body: 'Absolutely. We have a dedicated academic advisor for student-athletes and mandatory study hall. Several of our guys are Business majors — we\'ll connect you. Take your time with the decision. No pressure.',
    timestamp: '2026-02-14T16:10:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-2-5', threadId: 'dmt-2', sender: 'Jordan Hayes', senderInitials: 'JH',
    direction: 'received',
    body: 'That means a lot, Coach. I\'m going to talk it over with my parents this week. I should have an answer for you by next Friday at the latest.',
    timestamp: '2026-02-15T08:45:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-2-6', threadId: 'dmt-2', sender: 'Alex Morgan', senderInitials: 'SK',
    direction: 'sent',
    body: 'Sounds great, Jordan. We\'re excited about the possibility of you joining the Lions family. Let me know if your parents have any questions — happy to hop on a call.',
    timestamp: '2026-02-15T09:02:00', read: true, data_source: 'demo_seed',
  },
];

// ── Thread 3: Athletic Trainer — player injury update ───────────────────
const dmThread3Messages: SportsMessage[] = [
  {
    id: 'dm-3-1', threadId: 'dmt-3', sender: 'Dr. Angela Thompson', senderInitials: 'AT',
    direction: 'received',
    body: 'Coach, update on Devon Williams. MRI came back clean — no structural damage to the ankle. Grade 1 sprain confirmed. He\'s been responding well to treatment.',
    timestamp: '2026-02-17T08:30:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-3-2', threadId: 'dmt-3', sender: 'Alex Morgan', senderInitials: 'SK',
    direction: 'sent',
    body: 'That\'s a relief. What\'s the timeline looking like? Can he go Saturday against St. Thomas?',
    timestamp: '2026-02-17T08:45:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-3-3', threadId: 'dmt-3', sender: 'Dr. Angela Thompson', senderInitials: 'AT',
    direction: 'received',
    body: 'He\'s cleared for non-contact today. I want to see him do a full practice Thursday before I clear him for Saturday. If he moves well with no swelling, he\'s good to go with a brace.',
    timestamp: '2026-02-17T09:00:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-3-4', threadId: 'dmt-3', sender: 'Alex Morgan', senderInitials: 'SK',
    direction: 'sent',
    body: 'Perfect. Let\'s not rush it — if there\'s any doubt on Thursday, we hold him. We need him healthy for the conference tournament push.',
    timestamp: '2026-02-17T09:12:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-3-5', threadId: 'dmt-3', sender: 'Dr. Angela Thompson', senderInitials: 'AT',
    direction: 'received',
    body: 'Agreed. I\'ll have a full status report for you after Thursday\'s practice. He\'s in good spirits — been working hard in the training room.',
    timestamp: '2026-02-17T09:20:00', read: false, data_source: 'demo_seed',
  },
];

// ── Thread 4: Compliance office — eligibility paperwork ─────────────────
const dmThread4Messages: SportsMessage[] = [
  {
    id: 'dm-4-1', threadId: 'dmt-4', sender: 'Lisa Moreno', senderInitials: 'LM',
    direction: 'received',
    body: 'Coach Carter, I\'m following up on Jaylen Carter\'s eligibility file. We\'re still waiting on his updated transcript from his previous institution. NAIA requires it before he can be certified.',
    timestamp: '2026-02-16T11:00:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-4-2', threadId: 'dmt-4', sender: 'Alex Morgan', senderInitials: 'SK',
    direction: 'sent',
    body: 'Lisa, thanks for staying on this. Do we have a contact at his previous school we can push? He\'s been out of the lineup for two weeks and we need him for the stretch run.',
    timestamp: '2026-02-16T11:15:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-4-3', threadId: 'dmt-4', sender: 'Lisa Moreno', senderInitials: 'LM',
    direction: 'received',
    body: 'I spoke with their registrar\'s office this morning. They said the transcript was mailed Friday but we haven\'t received it yet. I\'ve also requested an electronic copy as a backup. Should have something within 48 hours.',
    timestamp: '2026-02-16T13:30:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-4-4', threadId: 'dmt-4', sender: 'Alex Morgan', senderInitials: 'SK',
    direction: 'sent',
    body: 'Good. The moment you have it, can you fast-track the certification? If we get it by Thursday, is there any chance he\'s cleared for Saturday\'s game?',
    timestamp: '2026-02-16T13:45:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-4-5', threadId: 'dmt-4', sender: 'Lisa Moreno', senderInitials: 'LM',
    direction: 'received',
    body: 'If the transcript arrives by Thursday noon, I can process the certification same day. I\'ll keep you updated as soon as anything comes through. I know how important this is.',
    timestamp: '2026-02-16T14:00:00', read: false, data_source: 'demo_seed',
  },
];

// ── Thread 5: Parent of recruit asking about visit ──────────────────────
const dmThread5Messages: SportsMessage[] = [
  {
    id: 'dm-5-1', threadId: 'dmt-5', sender: 'Mrs. Denise Moore', senderInitials: 'DM',
    direction: 'received',
    body: 'Good morning Coach Carter. I\'m Elijah Moore\'s mother. He\'s very excited about the official visit next week. I wanted to ask — will there be time to meet with an academic advisor? Academics are our top priority.',
    timestamp: '2026-02-15T07:30:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-5-2', threadId: 'dmt-5', sender: 'Alex Morgan', senderInitials: 'SK',
    direction: 'sent',
    body: 'Good morning Mrs. Moore! Absolutely — we have a meeting with our academic support coordinator on the itinerary for Saturday morning. She\'ll walk you through tutoring, study hall, and degree planning.',
    timestamp: '2026-02-15T08:15:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-5-3', threadId: 'dmt-5', sender: 'Mrs. Denise Moore', senderInitials: 'DM',
    direction: 'received',
    body: 'That\'s wonderful. Also, is there a hotel you\'d recommend near campus? And will Elijah get to attend a practice or see the facilities?',
    timestamp: '2026-02-15T08:42:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-5-4', threadId: 'dmt-5', sender: 'Alex Morgan', senderInitials: 'SK',
    direction: 'sent',
    body: 'We\'ll have a hotel arranged for you — our ops coordinator will send the details by Wednesday. And yes, Elijah will tour the Wellness Center, watch practice, and sit in on a team film session. Full experience.',
    timestamp: '2026-02-15T09:00:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-5-5', threadId: 'dmt-5', sender: 'Mrs. Denise Moore', senderInitials: 'DM',
    direction: 'received',
    body: 'This is so thorough. Thank you for taking the time, Coach. We\'re looking forward to seeing everything KaNeXT has to offer. See you next weekend!',
    timestamp: '2026-02-15T09:20:00', read: true, data_source: 'demo_seed',
  },
];

// ── Thread 6: AD office — budget approval ───────────────────────────────
const dmThread6Messages: SportsMessage[] = [
  {
    id: 'dm-6-1', threadId: 'dmt-6', sender: 'Alex Morgan', senderInitials: 'SK',
    direction: 'sent',
    body: 'Mr. Williams, I submitted the travel budget request for the Feb 21-22 road trip to Ave Maria and Southeast. The total is $4,200 — bus charter, hotel (2 nights), and per diem for 18 travelers.',
    timestamp: '2026-02-14T10:30:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-6-2', threadId: 'dmt-6', sender: 'AD Robert Williams', senderInitials: 'RW',
    direction: 'received',
    body: 'Got it, Coach. The request is in the queue. Quick question — can we cut costs by doing a day trip to Ave Maria and only overnighting for the Southeast game?',
    timestamp: '2026-02-14T13:00:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-6-3', threadId: 'dmt-6', sender: 'Alex Morgan', senderInitials: 'SK',
    direction: 'sent',
    body: 'Ave Maria is a 3-hour drive. With a 7 PM tipoff, a day trip means the guys are on the bus all day. I\'d rather have them rested. We can look at a more affordable hotel option if that helps.',
    timestamp: '2026-02-14T13:20:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-6-4', threadId: 'dmt-6', sender: 'AD Robert Williams', senderInitials: 'RW',
    direction: 'received',
    body: 'Fair point. Go ahead with the two-night plan. I\'ll approve it this afternoon. Just make sure the receipts come through the new expense system.',
    timestamp: '2026-02-14T14:45:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-6-5', threadId: 'dmt-6', sender: 'Alex Morgan', senderInitials: 'SK',
    direction: 'sent',
    body: 'Will do. Appreciate the quick turnaround. Marcus will have the itinerary finalized by tomorrow.',
    timestamp: '2026-02-14T15:00:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-6-6', threadId: 'dmt-6', sender: 'AD Robert Williams', senderInitials: 'RW',
    direction: 'received',
    body: 'Approved. Good luck on the road. Let\'s keep this conference tournament push going.',
    timestamp: '2026-02-14T16:30:00', read: false, data_source: 'demo_seed',
  },
];

// ── Thread 7: Opposing coach — schedule change ──────────────────────────
const dmThread7Messages: SportsMessage[] = [
  {
    id: 'dm-7-1', threadId: 'dmt-7', sender: 'Coach Mike Patterson', senderInitials: 'MP',
    direction: 'received',
    body: 'Hey Alex, Mike Patterson from Coastal Georgia. Our gym has a scheduling conflict for the Feb 22 game. Any chance we can move tipoff from 4 PM to 2 PM? Facility crew needs extra time for a community event that evening.',
    timestamp: '2026-02-13T11:00:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-7-2', threadId: 'dmt-7', sender: 'Alex Morgan', senderInitials: 'SK',
    direction: 'sent',
    body: 'Mike, let me check with my ops team. We\'re coming from the Ave Maria game the night before so a 2 PM tip might be tight depending on travel. Give me until tomorrow.',
    timestamp: '2026-02-13T11:30:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-7-3', threadId: 'dmt-7', sender: 'Coach Mike Patterson', senderInitials: 'MP',
    direction: 'received',
    body: 'No rush. If 2 PM doesn\'t work, we could also look at 3 PM as a compromise. Just trying to make it work for both sides.',
    timestamp: '2026-02-13T12:15:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-7-4', threadId: 'dmt-7', sender: 'Alex Morgan', senderInitials: 'SK',
    direction: 'sent',
    body: 'Talked to my travel coordinator. 3 PM works for us — gives the guys enough time for shootaround and a proper pre-game meal. Let\'s lock it in at 3 PM.',
    timestamp: '2026-02-14T09:00:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-7-5', threadId: 'dmt-7', sender: 'Coach Mike Patterson', senderInitials: 'MP',
    direction: 'received',
    body: 'Perfect. 3 PM it is. I\'ll update our SID and conference office. Appreciate the flexibility, Alex. See you on the 22nd.',
    timestamp: '2026-02-14T09:20:00', read: false, data_source: 'demo_seed',
  },
];

// ── Thread 8: Academic advisor — player grades ──────────────────────────
const dmThread8Messages: SportsMessage[] = [
  {
    id: 'dm-8-1', threadId: 'dmt-8', sender: 'Prof. Karen Mitchell', senderInitials: 'KM',
    direction: 'received',
    body: 'Coach Carter, I wanted to flag a concern. Two of your players — Marcus Brown and Tyler James — have midterm grades below 2.0 in their core courses. Per NAIA rules, they need to be above 2.0 to maintain eligibility.',
    timestamp: '2026-02-17T10:00:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-8-2', threadId: 'dmt-8', sender: 'Alex Morgan', senderInitials: 'SK',
    direction: 'sent',
    body: 'Thanks for the heads-up, Professor Mitchell. Which courses specifically? I want to make sure we get them the right tutoring support immediately.',
    timestamp: '2026-02-17T10:20:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-8-3', threadId: 'dmt-8', sender: 'Prof. Karen Mitchell', senderInitials: 'KM',
    direction: 'received',
    body: 'Marcus is struggling in Statistics (MATH 215) — he has a 1.8. Tyler is at 1.7 in English Comp II (ENG 102). Both have assignments they can still turn in to bring their grades up before the March 1 progress check.',
    timestamp: '2026-02-17T10:45:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-8-4', threadId: 'dmt-8', sender: 'Alex Morgan', senderInitials: 'SK',
    direction: 'sent',
    body: 'I\'ll sit both of them down today. We\'ll increase their mandatory study hall hours and pair them with tutors this week. Can I get a list of the missing or upcoming assignments so we can create a plan?',
    timestamp: '2026-02-17T11:00:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-8-5', threadId: 'dmt-8', sender: 'Prof. Karen Mitchell', senderInitials: 'KM',
    direction: 'received',
    body: 'I\'ll email you the assignment breakdown today. Both professors are willing to work with them if they show effort. The key is getting those outstanding assignments submitted by end of next week.',
    timestamp: '2026-02-17T11:15:00', read: true, data_source: 'demo_seed',
  },
  {
    id: 'dm-8-6', threadId: 'dmt-8', sender: 'Alex Morgan', senderInitials: 'SK',
    direction: 'sent',
    body: 'Appreciate you working with us on this. Education comes first — we\'ll make sure they get it done. I\'ll follow up with you next Monday on their progress.',
    timestamp: '2026-02-17T11:30:00', read: true, data_source: 'demo_seed',
  },
];

// ── Assembled DM Threads ────────────────────────────────────────────────

export const SPORTS_DM_THREADS: SportsDMThread[] = [
  {
    id: 'dmt-1',
    title: 'Game Prep — St. Thomas',
    participantName: 'Coach Davis',
    participantInitials: 'CD',
    participantRole: 'Assistant Coach',
    lastMessagePreview: 'Film will be tagged and ready by 3 PM.',
    lastMessageTime: '9:50 AM',
    unreadCount: 1,
    messages: dmThread1Messages,
    data_source: 'demo_seed',
  },
  {
    id: 'dmt-2',
    title: 'Scholarship Offer — Jordan Hayes',
    participantName: 'Jordan Hayes',
    participantInitials: 'JH',
    participantRole: 'Recruit (PG, 6\'1", Miami FL)',
    lastMessagePreview: 'Let me know if your parents have any questions.',
    lastMessageTime: 'Feb 15',
    unreadCount: 0,
    messages: dmThread2Messages,
    data_source: 'demo_seed',
  },
  {
    id: 'dmt-3',
    title: 'Injury Update — Devon Williams',
    participantName: 'Dr. Angela Thompson',
    participantInitials: 'AT',
    participantRole: 'Athletic Trainer',
    lastMessagePreview: 'Full status report after Thursday\'s practice.',
    lastMessageTime: '9:20 AM',
    unreadCount: 1,
    messages: dmThread3Messages,
    data_source: 'demo_seed',
  },
  {
    id: 'dmt-4',
    title: 'Carter Eligibility — Transcript',
    participantName: 'Lisa Moreno',
    participantInitials: 'LM',
    participantRole: 'Compliance Officer',
    lastMessagePreview: 'I can process the certification same day.',
    lastMessageTime: '2:00 PM',
    unreadCount: 1,
    messages: dmThread4Messages,
    data_source: 'demo_seed',
  },
  {
    id: 'dmt-5',
    title: 'Official Visit — Elijah Moore',
    participantName: 'Mrs. Denise Moore',
    participantInitials: 'DM',
    participantRole: 'Parent of Recruit',
    lastMessagePreview: 'We\'re looking forward to seeing everything KaNeXT has to offer.',
    lastMessageTime: 'Feb 15',
    unreadCount: 0,
    messages: dmThread5Messages,
    data_source: 'demo_seed',
  },
  {
    id: 'dmt-6',
    title: 'Road Trip Budget — Feb 21-22',
    participantName: 'AD Robert Williams',
    participantInitials: 'RW',
    participantRole: 'Athletic Director',
    lastMessagePreview: 'Approved. Good luck on the road.',
    lastMessageTime: '4:30 PM',
    unreadCount: 1,
    messages: dmThread6Messages,
    data_source: 'demo_seed',
  },
  {
    id: 'dmt-7',
    title: 'Schedule Change — Coastal Georgia',
    participantName: 'Coach Mike Patterson',
    participantInitials: 'MP',
    participantRole: 'Head Coach, Coastal Georgia',
    lastMessagePreview: '3 PM it is. See you on the 22nd.',
    lastMessageTime: 'Feb 14',
    unreadCount: 1,
    messages: dmThread7Messages,
    data_source: 'demo_seed',
  },
  {
    id: 'dmt-8',
    title: 'Academic Alert — Brown & James',
    participantName: 'Prof. Karen Mitchell',
    participantInitials: 'KM',
    participantRole: 'Academic Advisor',
    lastMessagePreview: 'I\'ll follow up with you next Monday.',
    lastMessageTime: '11:30 AM',
    unreadCount: 0,
    messages: dmThread8Messages,
    data_source: 'demo_seed',
  },
];

/** Get all DM threads, sorted by most recent activity */
export function getSportsDMThreads(): SportsDMThread[] {
  return SPORTS_DM_THREADS;
}

/** Get messages for a specific DM thread */
export function getDMThreadMessages(threadId: string): SportsMessage[] {
  const thread = SPORTS_DM_THREADS.find((t) => t.id === threadId);
  return thread?.messages ?? [];
}
