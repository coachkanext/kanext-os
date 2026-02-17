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
    case 'due_24h': return '#FBBF24';
    case 'normal': return '#6B7280';
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
    case 'medium': return '#3B82F6';
    case 'low': return '#6B7280';
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
    case 'roster': return '#3B82F6';
    case 'schedule': return '#8B5CF6';
    case 'recruiting': return '#EC4899';
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
    case 'escalated': return '#8B5CF6';
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
    id: 'si-3', title: 'Travel Roster — Lincoln Christian', sender: 'Coach Kalejaiye',
    senderInitials: 'SK', preview: 'Please review and approve the 15-man travel roster for Feb 21 game.',
    time: '1h', priority: 'approval', labels: ['Roster', 'Approval', 'Travel'],
    unreadCount: 1, rbacSection: 'inbox_approvals',
  },
  {
    id: 'si-4', title: 'Scouting Packet Due — LC', sender: 'Coach Lincoln',
    senderInitials: 'CL', preview: 'Scout packet for Lincoln Christian due by EOD tomorrow. 3 game films reviewed, 2 remaining.',
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
    avatarInitials: 'PC', avatarColor: '#1E3A5F',
    lastMessage: 'Bus delay confirmed. Updated departure at 1:30 PM.',
    lastMessageTime: '25m', unreadCount: 8, hasBlocker: true, hasDeadline: false,
    memberCount: 4, rbacSection: 'rooms_command',
  },
  {
    id: 'sr-2', title: 'MBB Command', category: 'command',
    avatarInitials: 'MC', avatarColor: '#2D1B69',
    lastMessage: 'Carter eligibility update — transcript pending.',
    lastMessageTime: '1h', unreadCount: 5, hasBlocker: true, hasDeadline: false,
    memberCount: 3, rbacSection: 'rooms_command',
  },
  {
    id: 'sr-3', title: 'Coaching Staff', category: 'staff',
    avatarInitials: 'CS', avatarColor: '#3D1A1A',
    lastMessage: 'Scout packet deadline tomorrow EOD. Lincoln and Davis, please finalize.',
    lastMessageTime: '2h', unreadCount: 3, hasBlocker: false, hasDeadline: true,
    memberCount: 5, rbacSection: 'rooms_staff',
  },
  {
    id: 'sr-4', title: 'Player Leadership Council', category: 'player',
    avatarInitials: 'PL', avatarColor: '#1A3D2A',
    lastMessage: 'Team dinner location vote — reply by 5 PM.',
    lastMessageTime: '3h', unreadCount: 2, hasBlocker: false, hasDeadline: true,
    memberCount: 5, rbacSection: 'rooms_player',
  },
  {
    id: 'sr-5', title: 'Team Room', category: 'player',
    avatarInitials: 'TR', avatarColor: '#3D2A1A',
    lastMessage: 'Great win tonight! Film session tomorrow at 2 PM.',
    lastMessageTime: '4h', unreadCount: 0, hasBlocker: false, hasDeadline: false,
    memberCount: 18, rbacSection: 'rooms_player',
  },
  {
    id: 'sr-6', title: 'Recruiting War Room', category: 'recruiting',
    avatarInitials: 'RW', avatarColor: '#EC4899',
    lastMessage: 'Elijah Moore visit locked in for Feb 22. Full itinerary attached.',
    lastMessageTime: '4h', unreadCount: 4, hasBlocker: false, hasDeadline: true,
    memberCount: 4, rbacSection: 'rooms_recruiting',
  },
  {
    id: 'sr-7', title: 'Visit Ops', category: 'ops_travel',
    avatarInitials: 'VO', avatarColor: '#8B5CF6',
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
    avatarInitials: 'MO', avatarColor: '#3B82F6',
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
    submitter: 'Coach Kalejaiye', submitterInitials: 'SK', dueDate: 'Feb 18', isOverdue: false,
    impactFlags: ['blocks_travel', 'blocks_game'], status: 'pending',
    auditTrail: [
      { action: 'Submitted', by: 'Coach Kalejaiye', date: 'Feb 15, 9:00 AM' },
    ],
    rbacSection: 'requests_approval',
  },
  {
    id: 'rq-2', type: 'roster', title: 'Add Walk-On: Tyler James',
    submitter: 'Coach Lincoln', submitterInitials: 'CL', dueDate: 'Feb 20', isOverdue: false,
    impactFlags: ['blocks_eligibility'], status: 'pending',
    auditTrail: [
      { action: 'Submitted', by: 'Coach Lincoln', date: 'Feb 14, 2:00 PM' },
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
    submitter: 'Coach Lincoln', submitterInitials: 'CL', dueDate: 'Feb 18', isOverdue: false,
    impactFlags: [], status: 'approved',
    auditTrail: [
      { action: 'Submitted', by: 'Coach Lincoln', date: 'Feb 13, 9:00 AM' },
      { action: 'Approved', by: 'Facilities', date: 'Feb 13, 11:00 AM' },
    ],
    rbacSection: 'requests_schedule',
  },
  {
    id: 'rq-10', type: 'recruiting', title: 'Scholarship Offer Letter — Jordan Hayes',
    submitter: 'Coach Kalejaiye', submitterInitials: 'SK', dueDate: 'Feb 22', isOverdue: false,
    impactFlags: [], status: 'pending',
    auditTrail: [
      { action: 'Submitted', by: 'Coach Kalejaiye', date: 'Feb 15, 8:00 AM' },
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
