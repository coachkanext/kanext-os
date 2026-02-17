/**
 * Mock Messages Data
 * Types, mock data, and helpers for Feed, Inbox, and Alerts tabs.
 */

import type { Mode } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

export type FeedMode = 'for_you' | 'following';
export type ExploreScope = 'all' | 'posts' | 'people' | 'clips' | 'games' | 'recruits' | 'docs';
export type NotificationCategory = 'all' | 'mentions' | 'tasks' | 'recruiting' | 'game_ops' | 'system';

export type FeedPostType =
  | 'update'
  | 'clip'
  | 'game'
  | 'practice'
  | 'recruiting'
  | 'player_dev'
  | 'culture'
  | 'compliance'
  | 'system'
  | 'poll';

export type FeedFilter =
  | 'all'
  | 'team'
  | 'staff'
  | 'players'
  | 'parents'
  | 'recruiting'
  | 'analytics'
  | 'compliance'
  | 'culture'
  | 'player_dev'
  | 'system'
  | 'polls';

export type FeedSort = 'recent' | 'pinned' | 'saved' | 'most_discussed' | 'unresolved';

export type MessagesTab = 'feed' | 'chat' | 'requests' | 'alerts';

export interface FeedAuthor {
  name: string;
  initials: string;
  role: string;
  roleBadgeColor: string;
}

export interface PollOption {
  label: string;
  pct: number;
}

export interface FeedPost {
  id: string;
  type: FeedPostType;
  author: FeedAuthor;
  timestamp: Date;
  filter: FeedFilter;
  body?: string;
  clipTitle?: string;
  clipSource?: string;
  gameTitle?: string;
  gameMetrics?: string[];
  practiceTitle?: string;
  practiceSub?: string;
  recruitName?: string;
  recruitStatus?: string;
  recruitStatusColor?: string;
  // V2 fields
  playerDevMetric?: string;
  playerDevDelta?: string;
  playerDevDeltaColor?: string;
  cultureTitle?: string;
  cultureBody?: string;
  complianceTitle?: string;
  complianceDue?: string;
  complianceUrgent?: boolean;
  systemTitle?: string;
  systemBody?: string;
  pollQuestion?: string;
  pollOptions?: PollOption[];
  pollVoted?: boolean;
  pinned?: boolean;
  saved?: boolean;
  commentCount?: number;
}

export interface ThreadMessage {
  id: string;
  sender: string;
  initials: string;
  isMe: boolean;
  content: string;
  timestamp: Date;
}

export interface InboxThread {
  id: string;
  title: string;
  icon: string;
  participants: string[];
  lastMessage: string;
  timestamp: Date;
  unread: number;
  messages: ThreadMessage[];
  pinned?: boolean;
  muted?: boolean;
  avatarStack?: string[];
}

// V2 Types
export type FeedScope = 'all' | 'my_team' | 'staff' | 'players' | 'parents' | 'recruiting' | 'league' | 'game_ops';
export type ComposePostType = 'update' | 'clip_link' | 'poll' | 'recruit_update' | 'staff_note';
export type ChatSubTab = 'primary' | 'requests' | 'groups';
export type ChatMessageType = 'text' | 'clip_link' | 'poll' | 'system';

export type ThreadTemplate =
  | 'dm'
  | 'group'
  | 'recruit_thread'
  | 'parent_thread'
  | 'position_group'
  | 'staff_room'
  | 'team_thread'
  | 'game_thread'
  | 'practice_thread';

export interface ThreadContext {
  type: 'player' | 'recruit' | 'parent' | 'staff' | 'group' | 'system';
  subtitle?: string;
}

export type RoomType = 'staff' | 'recruiting' | 'travel' | 'film' |
  'leadership' | 'product' | 'investors' | 'legal' |
  'pastoral' | 'prayer' | 'worship' |
  'admissions' | 'housing' | 'campus_life' |
  'raceweek_ops' | 'rules' | 'compliance' | 'safety';

export interface RoomChannel {
  id: string;
  name: string;
  icon?: string;
  isPinned?: boolean;
}

export interface ChatThread extends InboxThread {
  context?: ThreadContext;
  template?: ThreadTemplate;
  isGroup: boolean;
  archived?: boolean;
  roomType?: RoomType;
  channels?: RoomChannel[];
}

export interface AlertDeepLink {
  type: 'feed' | 'chat' | 'player' | 'recruit';
  targetId?: string;
}

export type AlertSeverity = 'low' | 'medium' | 'high';

export interface AlertHistoryEntry {
  action: string;
  timestamp: Date;
}

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  sourceTag: string;
  timestamp: Date;
  cta: 'Resolve' | 'View';
  resolved: boolean;
  description?: string;
  assignedTo?: string;
  snoozedUntil?: Date | null;
  escalated?: boolean;
  history?: AlertHistoryEntry[];
}

// =============================================================================
// HELPERS
// =============================================================================

export const FEED_FILTERS: { key: FeedFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'team', label: 'Team' },
  { key: 'staff', label: 'Staff' },
  { key: 'players', label: 'Players' },
  { key: 'parents', label: 'Parents' },
  { key: 'recruiting', label: 'Recruiting' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'compliance', label: 'Compliance' },
  { key: 'culture', label: 'Culture' },
  { key: 'player_dev', label: 'Player Dev' },
  { key: 'system', label: 'System' },
  { key: 'polls', label: 'Polls' },
];

export const FEED_SORTS: { key: FeedSort; label: string }[] = [
  { key: 'recent', label: 'Recent' },
  { key: 'pinned', label: 'Pinned' },
  { key: 'saved', label: 'Saved' },
  { key: 'most_discussed', label: 'Most Discussed' },
  { key: 'unresolved', label: 'Unresolved' },
];

export function getSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'low':
      return '#6e6e6e';
    case 'medium':
      return '#FFA500';
    case 'high':
      return '#EF4444';
  }
}

export function formatMessageTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;
  if (diffDay === 1) return 'Yesterday';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

export function getSmartDefaultTab(
  alerts: AlertItem[],
  threads: InboxThread[],
  pendingRequestCount?: number,
): MessagesTab {
  const hasHighUnresolved = alerts.some((a) => a.severity === 'high' && !a.resolved);
  if (hasHighUnresolved) return 'alerts';
  if (pendingRequestCount && pendingRequestCount > 0) return 'requests';
  const hasUnread = threads.some((t) => t.unread > 0);
  if (hasUnread) return 'chat';
  return 'feed';
}

export function sortFeed(posts: FeedPost[], sort: FeedSort): FeedPost[] {
  const sorted = [...posts];
  switch (sort) {
    case 'recent':
      return sorted.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    case 'pinned':
      return sorted.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    case 'saved':
      return sorted.sort((a, b) => (b.saved ? 1 : 0) - (a.saved ? 1 : 0));
    case 'most_discussed':
      return sorted.sort((a, b) => (b.commentCount ?? 0) - (a.commentCount ?? 0));
    case 'unresolved':
      // Show compliance/system posts first (actionable items)
      return sorted.sort((a, b) => {
        const aScore = a.type === 'compliance' || a.type === 'system' ? 1 : 0;
        const bScore = b.type === 'compliance' || b.type === 'system' ? 1 : 0;
        return bScore - aScore;
      });
    default:
      return sorted;
  }
}

// =============================================================================
// MOCK AUTHORS
// =============================================================================

const AUTHORS = {
  headCoach: { name: 'Coach Davis', initials: 'CD', role: 'Head Coach', roleBadgeColor: '#f5f5f5' },
  assistant: { name: 'Coach Miller', initials: 'CM', role: 'Assistant', roleBadgeColor: '#6e6e6e' },
  videoCoord: { name: 'Coach Brooks', initials: 'CB', role: 'Video Coord', roleBadgeColor: '#6e6e6e' },
  system: { name: 'KaNeXT', initials: 'KX', role: 'System', roleBadgeColor: '#555555' },
  player: { name: 'Marcus Johnson', initials: 'MJ', role: 'Player', roleBadgeColor: '#555555' },
  strength: { name: 'Coach Turner', initials: 'CT', role: 'Strength', roleBadgeColor: '#6e6e6e' },
  compliance: { name: 'Lisa Chen', initials: 'LC', role: 'Compliance', roleBadgeColor: '#6e6e6e' },
} as const;

// =============================================================================
// MOCK FEED POSTS
// =============================================================================

const now = new Date();
const ago = (minutes: number) => new Date(now.getTime() - minutes * 60000);

export const MOCK_FEED: FeedPost[] = [
  {
    id: 'fp-1',
    type: 'update',
    author: AUTHORS.headCoach,
    timestamp: ago(5),
    filter: 'staff',
    body: 'Film session moved to 3:30 PM today. Focus on transition defense from the Coastal game. Bring your notebooks.',
    pinned: true,
    commentCount: 4,
  },
  {
    id: 'fp-2',
    type: 'clip',
    author: AUTHORS.videoCoord,
    timestamp: ago(45),
    filter: 'team',
    clipTitle: 'Transition Defense Breakdown — Coastal Carolina',
    clipSource: 'Hudl',
    commentCount: 2,
  },
  {
    id: 'fp-3',
    type: 'game',
    author: AUTHORS.system,
    timestamp: ago(120),
    filter: 'team',
    gameTitle: 'FINAL — FMU 81, Coastal Carolina 74',
    gameMetrics: ['FG: 48.3%', 'REB: 38', 'AST: 19', 'TO: 11'],
    commentCount: 7,
  },
  {
    id: 'fp-11',
    type: 'player_dev',
    author: AUTHORS.strength,
    timestamp: ago(150),
    filter: 'player_dev',
    playerDevMetric: '3PT Shooting %',
    playerDevDelta: '+4.2%',
    playerDevDeltaColor: '#4CAF50',
    body: 'Marcus Johnson — 7-day rolling average up from 34.1% to 38.3%. Extra reps paying off.',
    commentCount: 3,
  },
  {
    id: 'fp-4',
    type: 'update',
    author: AUTHORS.assistant,
    timestamp: ago(180),
    filter: 'staff',
    body: 'Updated the scouting report for Saturday\'s game vs Campbell. Key concern: their zone press in the second half.',
    commentCount: 1,
  },
  {
    id: 'fp-12',
    type: 'culture',
    author: AUTHORS.headCoach,
    timestamp: ago(240),
    filter: 'culture',
    cultureTitle: 'Team Value Spotlight',
    cultureBody: 'Shout out to Deon Williams for staying after practice to help the freshmen with ball screen reads. That\'s what leadership looks like.',
    commentCount: 8,
    saved: true,
  },
  {
    id: 'fp-5',
    type: 'recruiting',
    author: AUTHORS.headCoach,
    timestamp: ago(300),
    filter: 'recruiting',
    recruitName: 'Jaylen Carter',
    recruitStatus: 'Official Visit Scheduled',
    recruitStatusColor: '#4CAF50',
    commentCount: 2,
  },
  {
    id: 'fp-13',
    type: 'compliance',
    author: AUTHORS.compliance,
    timestamp: ago(360),
    filter: 'compliance',
    complianceTitle: 'CARA Hours Log — Week 6',
    complianceDue: 'Feb 16',
    complianceUrgent: true,
    commentCount: 0,
  },
  {
    id: 'fp-6',
    type: 'practice',
    author: AUTHORS.system,
    timestamp: ago(420),
    filter: 'team',
    practiceTitle: 'Practice — Thursday, Feb 13',
    practiceSub: '2:00 PM — Smith Center Court 1 · Shell work + 5v5',
    commentCount: 1,
  },
  {
    id: 'fp-14',
    type: 'system',
    author: AUTHORS.system,
    timestamp: ago(480),
    filter: 'system',
    systemTitle: 'Opponent Trend Alert',
    systemBody: 'Campbell has won 4 straight and is shooting 39.2% from 3 over that stretch (+5.1% vs season avg). Zone defense may be advisable.',
    commentCount: 5,
    pinned: true,
  },
  {
    id: 'fp-15',
    type: 'poll',
    author: AUTHORS.headCoach,
    timestamp: ago(540),
    filter: 'polls',
    pollQuestion: 'What should our primary focus be at Saturday\'s practice?',
    pollOptions: [
      { label: 'Zone press break', pct: 42 },
      { label: 'Transition defense', pct: 31 },
      { label: 'Free throw shooting', pct: 18 },
      { label: 'Half-court offense sets', pct: 9 },
    ],
    pollVoted: false,
    commentCount: 6,
  },
  {
    id: 'fp-7',
    type: 'clip',
    author: AUTHORS.assistant,
    timestamp: ago(600),
    filter: 'players',
    clipTitle: 'Marcus Johnson — Mid-Range Package Highlights',
    clipSource: 'YouTube',
    commentCount: 1,
  },
  {
    id: 'fp-8',
    type: 'update',
    author: AUTHORS.headCoach,
    timestamp: ago(1440),
    filter: 'parents',
    body: 'Reminder: Parent weekend is March 1-2. Details and RSVP link coming next week. Looking forward to seeing everyone.',
    commentCount: 3,
  },
  {
    id: 'fp-9',
    type: 'recruiting',
    author: AUTHORS.assistant,
    timestamp: ago(2000),
    filter: 'recruiting',
    recruitName: 'Devon Williams',
    recruitStatus: 'Offer Extended',
    recruitStatusColor: '#FFA500',
    commentCount: 0,
  },
  {
    id: 'fp-10',
    type: 'game',
    author: AUTHORS.system,
    timestamp: ago(4320),
    filter: 'team',
    gameTitle: 'FINAL — FMU 69, UNC Asheville 72',
    gameMetrics: ['FG: 41.2%', 'REB: 31', 'AST: 14', 'TO: 16'],
    commentCount: 4,
  },
];

// =============================================================================
// MOCK INBOX THREADS
// =============================================================================

export const MOCK_THREADS: InboxThread[] = [
  {
    id: 'th-1',
    title: 'Team Thread',
    icon: 'person.3.fill',
    participants: ['Coach Davis', 'Coach Miller', 'Marcus J.', 'Deon W.', 'Tyler R.', '+8 more'],
    lastMessage: 'See everyone at 3:30 for film.',
    timestamp: ago(5),
    unread: 3,
    pinned: true,
    avatarStack: ['CD', 'MJ', 'DW'],
    messages: [
      { id: 'tm-1', sender: 'Marcus J.', initials: 'MJ', isMe: false, content: 'Good win last night. What time is film?', timestamp: ago(60) },
      { id: 'tm-2', sender: 'Deon W.', initials: 'DW', isMe: false, content: 'I think 3 PM?', timestamp: ago(45) },
      { id: 'tm-3', sender: 'Coach Davis', initials: 'CD', isMe: true, content: 'See everyone at 3:30 for film.', timestamp: ago(5) },
      { id: 'tm-4', sender: 'Marcus J.', initials: 'MJ', isMe: false, content: 'Got it coach 👍', timestamp: ago(3) },
    ],
  },
  {
    id: 'th-2',
    title: 'Staff Room',
    icon: 'briefcase.fill',
    participants: ['Coach Davis', 'Coach Miller', 'Coach Brooks'],
    lastMessage: 'Campbell scouting report is updated and shared.',
    timestamp: ago(90),
    unread: 1,
    pinned: true,
    avatarStack: ['CD', 'CM', 'CB'],
    messages: [
      { id: 'tm-5', sender: 'Coach Davis', initials: 'CD', isMe: true, content: 'Need the Campbell scouting report by end of day.', timestamp: ago(240) },
      { id: 'tm-6', sender: 'Coach Miller', initials: 'CM', isMe: false, content: 'Working on it now. Their zone press is tricky.', timestamp: ago(180) },
      { id: 'tm-7', sender: 'Coach Brooks', initials: 'CB', isMe: false, content: 'I clipped their press from the last 3 games. Adding to Hudl.', timestamp: ago(120) },
      { id: 'tm-8', sender: 'Coach Miller', initials: 'CM', isMe: false, content: 'Campbell scouting report is updated and shared.', timestamp: ago(90) },
    ],
  },
  {
    id: 'th-3',
    title: 'Guards Group',
    icon: 'basketball.fill',
    participants: ['Coach Miller', 'Marcus J.', 'Tyler R.', 'Andre H.'],
    lastMessage: 'Watch the clip Coach Brooks posted. Focus on weak side rotations.',
    timestamp: ago(200),
    unread: 0,
    messages: [
      { id: 'tm-9', sender: 'Coach Miller', initials: 'CM', isMe: false, content: 'Guards — we need to clean up our ball screen coverage.', timestamp: ago(400) },
      { id: 'tm-10', sender: 'Tyler R.', initials: 'TR', isMe: false, content: 'Are we switching or hedging Saturday?', timestamp: ago(350) },
      { id: 'tm-11', sender: 'Coach Miller', initials: 'CM', isMe: false, content: 'Watch the clip Coach Brooks posted. Focus on weak side rotations.', timestamp: ago(200) },
    ],
  },
  {
    id: 'th-4',
    title: 'Marcus Johnson',
    icon: 'person.fill',
    participants: ['Coach Davis', 'Marcus Johnson'],
    lastMessage: 'Appreciate you coach. I\'ll be ready.',
    timestamp: ago(1440),
    unread: 0,
    muted: true,
    messages: [
      { id: 'tm-12', sender: 'Coach Davis', initials: 'CD', isMe: true, content: 'Great game last night Marcus. 22 pts and solid defense.', timestamp: ago(1500) },
      { id: 'tm-13', sender: 'Marcus Johnson', initials: 'MJ', isMe: false, content: 'Thanks coach! Felt good out there.', timestamp: ago(1470) },
      { id: 'tm-14', sender: 'Coach Davis', initials: 'CD', isMe: true, content: 'Keep that same energy Saturday. Campbell\'s guards are quick.', timestamp: ago(1450) },
      { id: 'tm-15', sender: 'Marcus Johnson', initials: 'MJ', isMe: false, content: 'Appreciate you coach. I\'ll be ready.', timestamp: ago(1440) },
    ],
  },
  {
    id: 'th-5',
    title: 'Parent Thread',
    icon: 'house.fill',
    participants: ['Coach Davis', 'Mrs. Johnson', 'Mr. Williams', 'Mrs. Roberts'],
    lastMessage: 'Looking forward to parent weekend! Will there be a team dinner?',
    timestamp: ago(2880),
    unread: 0,
    messages: [
      { id: 'tm-16', sender: 'Coach Davis', initials: 'CD', isMe: true, content: 'Hello everyone — parent weekend is March 1-2. Details coming soon.', timestamp: ago(4300) },
      { id: 'tm-17', sender: 'Mrs. Johnson', initials: 'SJ', isMe: false, content: 'Looking forward to it!', timestamp: ago(4000) },
      { id: 'tm-18', sender: 'Mr. Williams', initials: 'DW', isMe: false, content: 'Looking forward to parent weekend! Will there be a team dinner?', timestamp: ago(2880) },
    ],
  },
  {
    id: 'th-6',
    title: 'Jaylen Carter (Recruit)',
    icon: 'person.badge.plus',
    participants: ['Coach Davis', 'Jaylen Carter', 'Mr. Carter'],
    lastMessage: 'We\'ll have the visit itinerary to you by Friday.',
    timestamp: ago(300),
    unread: 0,
    messages: [
      { id: 'tm-19', sender: 'Jaylen Carter', initials: 'JC', isMe: false, content: 'Coach, excited about the official visit!', timestamp: ago(500) },
      { id: 'tm-20', sender: 'Mr. Carter', initials: 'RC', isMe: false, content: 'What dates work best for the visit?', timestamp: ago(450) },
      { id: 'tm-21', sender: 'Coach Davis', initials: 'CD', isMe: true, content: 'We\'re looking at Feb 21-22. Does that work?', timestamp: ago(400) },
      { id: 'tm-22', sender: 'Jaylen Carter', initials: 'JC', isMe: false, content: 'That works! Can\'t wait.', timestamp: ago(350) },
      { id: 'tm-23', sender: 'Coach Davis', initials: 'CD', isMe: true, content: 'We\'ll have the visit itinerary to you by Friday.', timestamp: ago(300) },
    ],
  },
  {
    id: 'th-7',
    title: 'Coach Miller',
    icon: 'person.fill',
    participants: ['Coach Davis', 'Coach Miller'],
    lastMessage: 'Zone press breaker is ready. Sending the playbook page now.',
    timestamp: ago(25),
    unread: 2,
    pinned: true,
    messages: [
      { id: 'tm-24', sender: 'Coach Davis', initials: 'CD', isMe: true, content: 'Did you finish the zone press breaker?', timestamp: ago(40) },
      { id: 'tm-25', sender: 'Coach Miller', initials: 'CM', isMe: false, content: 'Zone press breaker is ready. Sending the playbook page now.', timestamp: ago(25) },
    ],
  },
  {
    id: 'th-8',
    title: 'Darius Thompson',
    icon: 'person.fill',
    participants: ['Coach Davis', 'Darius Thompson'],
    lastMessage: 'Ankle feels great. Trainer said I\'m good for Saturday.',
    timestamp: ago(90),
    unread: 1,
    messages: [
      { id: 'tm-26', sender: 'Coach Davis', initials: 'CD', isMe: true, content: 'How\'s the ankle feeling? Need you ready for Saturday.', timestamp: ago(120) },
      { id: 'tm-27', sender: 'Darius Thompson', initials: 'DT', isMe: false, content: 'Ankle feels great. Trainer said I\'m good for Saturday.', timestamp: ago(90) },
    ],
  },
  {
    id: 'th-9',
    title: 'Athletic Trainer',
    icon: 'person.fill',
    participants: ['Coach Davis', 'Ray Nguyen'],
    lastMessage: 'Marcus cleared for full contact. Updated status sheet.',
    timestamp: ago(15),
    unread: 1,
    pinned: true,
    messages: [
      { id: 'tm-28', sender: 'Ray Nguyen', initials: 'RN', isMe: false, content: 'Marcus cleared for full contact. Updated status sheet.', timestamp: ago(15) },
    ],
  },
  {
    id: 'th-10',
    title: 'Devon Williams (Recruit)',
    icon: 'person.badge.plus',
    participants: ['Coach Davis', 'Devon Williams'],
    lastMessage: 'My family has some questions about the scholarship offer.',
    timestamp: ago(180),
    unread: 1,
    messages: [
      { id: 'tm-29', sender: 'Devon Williams', initials: 'DW', isMe: false, content: 'Hey Coach, wanted to follow up on the offer.', timestamp: ago(200) },
      { id: 'tm-30', sender: 'Devon Williams', initials: 'DW', isMe: false, content: 'My family has some questions about the scholarship offer.', timestamp: ago(180) },
    ],
  },
  {
    id: 'th-11',
    title: 'AD Office',
    icon: 'person.fill',
    participants: ['Coach Davis', 'Dr. James Carter'],
    lastMessage: 'Travel budget for the away tournament is approved.',
    timestamp: ago(420),
    unread: 0,
    messages: [
      { id: 'tm-31', sender: 'Coach Davis', initials: 'CD', isMe: true, content: 'Dr. Carter, any update on the away tournament travel budget?', timestamp: ago(480) },
      { id: 'tm-32', sender: 'Dr. James Carter', initials: 'JC', isMe: false, content: 'Travel budget for the away tournament is approved.', timestamp: ago(420) },
    ],
  },
  {
    id: 'th-12',
    title: 'Compliance Office',
    icon: 'person.fill',
    participants: ['Coach Davis', 'Compliance'],
    lastMessage: 'Three players flagged for academic eligibility — need GPA verification by Thursday.',
    timestamp: ago(45),
    unread: 1,
    messages: [
      { id: 'tm-33', sender: 'Compliance', initials: 'CO', isMe: false, content: 'Three players flagged for academic eligibility — need GPA verification by Thursday.', timestamp: ago(45) },
    ],
  },
  {
    id: 'th-13',
    title: 'Andre Mitchell',
    icon: 'person.fill',
    participants: ['Coach Davis', 'Andre Mitchell'],
    lastMessage: 'Put in extra work on my left hand today. Video in the film room.',
    timestamp: ago(30),
    unread: 1,
    messages: [
      { id: 'tm-34', sender: 'Andre Mitchell', initials: 'AM', isMe: false, content: 'Coach, I put in extra work on my left hand today. Video in the film room.', timestamp: ago(35) },
      { id: 'tm-35', sender: 'Coach Davis', initials: 'CD', isMe: true, content: 'Love the initiative Andre. I\'ll check the film tonight.', timestamp: ago(30) },
    ],
  },
  {
    id: 'th-14',
    title: 'Scout Williams',
    icon: 'person.fill',
    participants: ['Coach Davis', 'Scout Williams'],
    lastMessage: 'Got three strong prospects from the Tampa showcase. Sending evals now.',
    timestamp: ago(60),
    unread: 2,
    messages: [
      { id: 'tm-36', sender: 'Scout Williams', initials: 'SW', isMe: false, content: 'Just wrapped up the Tampa showcase. Some real talent there.', timestamp: ago(75) },
      { id: 'tm-37', sender: 'Scout Williams', initials: 'SW', isMe: false, content: 'Got three strong prospects from the Tampa showcase. Sending evals now.', timestamp: ago(60) },
    ],
  },
];

// =============================================================================
// MOCK ALERTS
// =============================================================================

// =============================================================================
// V2 CONSTANTS
// =============================================================================

export const FEED_SCOPES: { key: FeedScope; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'my_team', label: 'My Team' },
  { key: 'staff', label: 'Staff' },
  { key: 'players', label: 'Players' },
  { key: 'parents', label: 'Parents' },
  { key: 'recruiting', label: 'Recruiting' },
  { key: 'league', label: 'League' },
  { key: 'game_ops', label: 'Game Ops' },
];

export const EXPLORE_SCOPES: { key: ExploreScope; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'posts', label: 'Posts' },
  { key: 'people', label: 'People' },
  { key: 'clips', label: 'Clips' },
  { key: 'games', label: 'Games' },
  { key: 'recruits', label: 'Recruits' },
  { key: 'docs', label: 'Docs' },
];

export const NOTIFICATION_CATEGORIES: { key: NotificationCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'mentions', label: 'Mentions' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'recruiting', label: 'Recruiting' },
  { key: 'game_ops', label: 'Game Ops' },
  { key: 'system', label: 'System' },
];

export interface CommsListChannel {
  id: string;
  icon: string;
  title: string;
  description: string;
  filterScope?: FeedScope;
  filterType?: FeedFilter;
}

export const COMMS_LIST_CHANNELS: CommsListChannel[] = [
  { id: 'ch-1', icon: 'person.3.fill', title: 'My Team', description: 'Full team feed', filterScope: 'my_team' },
  { id: 'ch-2', icon: 'briefcase.fill', title: 'Staff Room', description: 'Staff-only updates', filterScope: 'staff' },
  { id: 'ch-3', icon: 'basketball.fill', title: 'Players', description: 'Player-facing content', filterScope: 'players' },
  { id: 'ch-4', icon: 'house.fill', title: 'Parents', description: 'Parent communications', filterScope: 'parents' },
  { id: 'ch-5', icon: 'person.badge.plus', title: 'Recruiting Board', description: 'Recruit updates and pipeline', filterScope: 'recruiting' },
  { id: 'ch-6', icon: 'sportscourt.fill', title: 'Game Ops', description: 'Game day operations and film', filterType: 'team' },
  { id: 'ch-7', icon: 'heart.fill', title: 'Medical / Performance', description: 'Player health and development', filterType: 'player_dev' },
  { id: 'ch-8', icon: 'globe', title: 'League Watch', description: 'Conference and national updates', filterScope: 'league' },
];

export function getTrendingPosts(posts: FeedPost[], limit: number): FeedPost[] {
  return [...posts].sort((a, b) => (b.commentCount ?? 0) - (a.commentCount ?? 0)).slice(0, limit);
}

export function getDeadlinePosts(posts: FeedPost[]): FeedPost[] {
  return posts.filter((p) => p.type === 'compliance' && p.complianceUrgent);
}

export interface ThreadTemplateOption {
  key: ThreadTemplate;
  icon: string;
  label: string;
  description: string;
}

export const THREAD_TEMPLATES: ThreadTemplateOption[] = [
  { key: 'dm', icon: 'person.fill', label: 'Direct Message', description: 'One-on-one conversation' },
  { key: 'group', icon: 'person.3.fill', label: 'Group Chat', description: 'Multi-person conversation' },
  { key: 'recruit_thread', icon: 'person.badge.plus', label: 'Recruit Thread', description: 'Thread with a recruit and their family' },
  { key: 'parent_thread', icon: 'house.fill', label: 'Parent Thread', description: 'Thread with player parents' },
  { key: 'position_group', icon: 'basketball.fill', label: 'Position Group', description: 'Position-specific group chat' },
  { key: 'staff_room', icon: 'briefcase.fill', label: 'Staff Room', description: 'Staff-only discussion room' },
  { key: 'team_thread', icon: 'person.3.fill', label: 'Team Thread', description: 'Full team conversation' },
  { key: 'game_thread', icon: 'sportscourt.fill', label: 'Game Thread', description: 'Game-day discussion' },
  { key: 'practice_thread', icon: 'figure.run', label: 'Practice Thread', description: 'Practice planning and notes' },
];

export const COMPOSE_POST_TYPES: { key: ComposePostType; label: string; icon: string }[] = [
  { key: 'update', label: 'Update', icon: 'text.bubble.fill' },
  { key: 'clip_link', label: 'Clip Link', icon: 'play.rectangle.fill' },
  { key: 'poll', label: 'Poll', icon: 'chart.bar.fill' },
  { key: 'recruit_update', label: 'Recruit Update', icon: 'person.badge.plus' },
  { key: 'staff_note', label: 'Staff Note', icon: 'lock.fill' },
];

// =============================================================================
// V2 CHAT THREADS (upgraded with context)
// =============================================================================

export const MOCK_CHAT_THREADS: ChatThread[] = [
  {
    ...MOCK_THREADS[0],
    context: { type: 'group', subtitle: 'Team · 13 members' },
    template: 'team_thread',
    isGroup: true,
  },
  {
    ...MOCK_THREADS[1],
    context: { type: 'staff', subtitle: 'Staff · 3 members' },
    template: 'staff_room',
    isGroup: true,
  },
  {
    ...MOCK_THREADS[2],
    context: { type: 'group', subtitle: 'Guards · 4 members' },
    template: 'position_group',
    isGroup: true,
  },
  {
    ...MOCK_THREADS[3],
    context: { type: 'player', subtitle: 'Player · #11 · PG' },
    template: 'dm',
    isGroup: false,
  },
  {
    ...MOCK_THREADS[4],
    context: { type: 'parent', subtitle: 'Parents · 4 members' },
    template: 'parent_thread',
    isGroup: true,
  },
  {
    ...MOCK_THREADS[5],
    context: { type: 'recruit', subtitle: 'Recruit · 2026 · SF' },
    template: 'recruit_thread',
    isGroup: false,
  },
  {
    ...MOCK_THREADS[6],
    context: { type: 'staff', subtitle: 'Associate HC' },
    template: 'dm',
    isGroup: false,
  },
  {
    ...MOCK_THREADS[7],
    context: { type: 'player', subtitle: 'Player · #3 · SG' },
    template: 'dm',
    isGroup: false,
  },
  {
    ...MOCK_THREADS[8],
    context: { type: 'staff', subtitle: 'Athletic Trainer' },
    template: 'dm',
    isGroup: false,
  },
  {
    ...MOCK_THREADS[9],
    context: { type: 'recruit', subtitle: 'Recruit · 2026 · PF' },
    template: 'recruit_thread',
    isGroup: false,
  },
  {
    ...MOCK_THREADS[10],
    context: { type: 'staff', subtitle: 'Athletic Director' },
    template: 'dm',
    isGroup: false,
  },
  {
    ...MOCK_THREADS[11],
    context: { type: 'staff', subtitle: 'Compliance' },
    template: 'dm',
    isGroup: false,
  },
  {
    ...MOCK_THREADS[12],
    context: { type: 'player', subtitle: 'Player · #5 · SF' },
    template: 'dm',
    isGroup: false,
  },
  {
    ...MOCK_THREADS[13],
    context: { type: 'staff', subtitle: 'Regional Scout' },
    template: 'dm',
    isGroup: false,
  },
];

export const MOCK_GROUP_THREADS: ChatThread[] = MOCK_CHAT_THREADS.filter((t) => t.isGroup);

// =============================================================================
// CHURCH MODE DM THREADS
// =============================================================================

const CHURCH_THREADS: InboxThread[] = [
  {
    id: 'ch-th-1',
    title: 'Pastor Sarah Okonkwo',
    icon: 'person.fill',
    participants: ['Pastor Dipo', 'Pastor Sarah'],
    lastMessage: 'Lenten series outline is attached — review by Wednesday.',
    timestamp: ago(20),
    unread: 2,
    pinned: true,
    messages: [
      { id: 'ch-m1', sender: 'Pastor Sarah', initials: 'SO', isMe: false, content: 'Lenten series outline is attached — review by Wednesday.', timestamp: ago(20) },
    ],
  },
  {
    id: 'ch-th-2',
    title: 'Elder James Wright',
    icon: 'person.fill',
    participants: ['Pastor Dipo', 'Elder James'],
    lastMessage: 'Men\'s fellowship breakfast confirmed for Saturday 8am.',
    timestamp: ago(60),
    unread: 1,
    messages: [
      { id: 'ch-m2', sender: 'Elder James Wright', initials: 'JW', isMe: false, content: 'Men\'s fellowship breakfast confirmed for Saturday 8am.', timestamp: ago(60) },
    ],
  },
  {
    id: 'ch-th-3',
    title: 'Deacon Ruth Adeyemi',
    icon: 'person.fill',
    participants: ['Pastor Dipo', 'Deacon Ruth'],
    lastMessage: 'Prayer chain activated for the Williams family.',
    timestamp: ago(45),
    unread: 1,
    messages: [
      { id: 'ch-m3', sender: 'Deacon Ruth', initials: 'RA', isMe: false, content: 'Prayer chain activated for the Williams family.', timestamp: ago(45) },
    ],
  },
  {
    id: 'ch-th-4',
    title: 'David Eze (Worship)',
    icon: 'person.fill',
    participants: ['Pastor Dipo', 'David Eze'],
    lastMessage: 'Sunday setlist is finalized. Rehearsal Thursday 7pm.',
    timestamp: ago(180),
    unread: 0,
    messages: [
      { id: 'ch-m4', sender: 'David Eze', initials: 'DE', isMe: false, content: 'Sunday setlist is finalized. Rehearsal Thursday 7pm.', timestamp: ago(180) },
    ],
  },
  {
    id: 'ch-th-5',
    title: 'Minister Tunde Balogun',
    icon: 'person.fill',
    participants: ['Pastor Dipo', 'Minister Tunde'],
    lastMessage: 'Youth retreat registration closes Friday — 32 signed up so far.',
    timestamp: ago(100),
    unread: 2,
    messages: [
      { id: 'ch-m5', sender: 'Minister Tunde', initials: 'TB', isMe: false, content: 'Youth retreat registration closes Friday — 32 signed up so far.', timestamp: ago(100) },
    ],
  },
  {
    id: 'ch-th-6',
    title: 'Deaconess Folake Ade',
    icon: 'person.fill',
    participants: ['Pastor Dipo', 'Deaconess Folake'],
    lastMessage: 'New members class — 8 people confirmed for Sunday orientation.',
    timestamp: ago(240),
    unread: 0,
    messages: [
      { id: 'ch-m6', sender: 'Deaconess Folake', initials: 'FA', isMe: false, content: 'New members class — 8 people confirmed for Sunday orientation.', timestamp: ago(240) },
    ],
  },
  {
    id: 'ch-th-7',
    title: 'Sister Grace Nwosu',
    icon: 'person.fill',
    participants: ['Pastor Dipo', 'Sister Grace'],
    lastMessage: 'Hospital visit to Brother Taiwo scheduled for tomorrow at 2pm.',
    timestamp: ago(300),
    unread: 0,
    messages: [
      { id: 'ch-m7', sender: 'Sister Grace', initials: 'GN', isMe: false, content: 'Hospital visit to Brother Taiwo scheduled for tomorrow at 2pm.', timestamp: ago(300) },
    ],
  },
  {
    id: 'ch-th-8',
    title: 'Deacon Michael Ibe',
    icon: 'person.fill',
    participants: ['Pastor Dipo', 'Deacon Michael'],
    lastMessage: 'Building maintenance request submitted for the fellowship hall AC.',
    timestamp: ago(500),
    unread: 0,
    messages: [
      { id: 'ch-m8', sender: 'Deacon Michael', initials: 'MI', isMe: false, content: 'Building maintenance request submitted for the fellowship hall AC.', timestamp: ago(500) },
    ],
  },
  {
    id: 'ch-th-9',
    title: 'New Member — Ade Okafor',
    icon: 'person.fill',
    participants: ['Pastor Dipo', 'Ade Okafor'],
    lastMessage: 'Thank you for the warm welcome Sunday, Pastor. Looking forward to serving.',
    timestamp: ago(1440),
    unread: 1,
    messages: [
      { id: 'ch-m9', sender: 'Ade Okafor', initials: 'AO', isMe: false, content: 'Thank you for the warm welcome Sunday, Pastor. Looking forward to serving.', timestamp: ago(1440) },
    ],
  },
  {
    id: 'ch-th-10',
    title: 'Media Team Lead',
    icon: 'person.fill',
    participants: ['Pastor Dipo', 'Brother Emeka'],
    lastMessage: 'Live stream equipment upgrade quote attached. Under budget.',
    timestamp: ago(360),
    unread: 1,
    pinned: true,
    messages: [
      { id: 'ch-m10', sender: 'Brother Emeka', initials: 'EU', isMe: false, content: 'Live stream equipment upgrade quote attached. Under budget.', timestamp: ago(360) },
    ],
  },
];

const CHURCH_CHAT_THREADS: ChatThread[] = CHURCH_THREADS.map((t) => ({
  ...t,
  context: { type: 'staff' as const, subtitle: 'Church Staff' },
  template: 'dm' as ThreadTemplate,
  isGroup: false,
}));

// =============================================================================
// EDUCATION MODE DM THREADS
// =============================================================================

const EDUCATION_THREADS: InboxThread[] = [
  {
    id: 'ed-th-1',
    title: 'Dr. James Chen',
    icon: 'person.fill',
    participants: ['Dr. Wells', 'Dr. Chen'],
    lastMessage: 'Accreditation visit confirmed for March 10-12. Prep docs ready.',
    timestamp: ago(15),
    unread: 3,
    pinned: true,
    messages: [
      { id: 'ed-m1', sender: 'Dr. Chen', initials: 'JC', isMe: false, content: 'Accreditation visit confirmed for March 10-12. Prep docs ready.', timestamp: ago(15) },
    ],
  },
  {
    id: 'ed-th-2',
    title: 'Karen Mitchell (Registrar)',
    icon: 'person.fill',
    participants: ['Dr. Wells', 'Karen Mitchell'],
    lastMessage: 'Spring add/drop deadline extended to Feb 21.',
    timestamp: ago(30),
    unread: 1,
    messages: [
      { id: 'ed-m2', sender: 'Karen Mitchell', initials: 'KM', isMe: false, content: 'Spring add/drop deadline extended to Feb 21.', timestamp: ago(30) },
    ],
  },
  {
    id: 'ed-th-3',
    title: 'Rachel Kim (Admissions)',
    icon: 'person.fill',
    participants: ['Dr. Wells', 'Rachel Kim'],
    lastMessage: 'Fall 2026 applications up 12% over last year. Pipeline looking strong.',
    timestamp: ago(120),
    unread: 0,
    messages: [
      { id: 'ed-m3', sender: 'Rachel Kim', initials: 'RK', isMe: false, content: 'Fall 2026 applications up 12% over last year. Pipeline looking strong.', timestamp: ago(120) },
    ],
  },
  {
    id: 'ed-th-4',
    title: 'Dr. Alan Foster (CS Chair)',
    icon: 'person.fill',
    participants: ['Dr. Wells', 'Dr. Foster'],
    lastMessage: 'Adjunct hiring approved for CSCI-301 section B. Starting Monday.',
    timestamp: ago(240),
    unread: 0,
    messages: [
      { id: 'ed-m4', sender: 'Dr. Foster', initials: 'AF', isMe: false, content: 'Adjunct hiring approved for CSCI-301 section B. Starting Monday.', timestamp: ago(240) },
    ],
  },
  {
    id: 'ed-th-5',
    title: 'Dr. Maria Santos',
    icon: 'person.fill',
    participants: ['Dr. Wells', 'Dr. Santos'],
    lastMessage: 'Midterm grading due by Friday 5pm. All sections on track.',
    timestamp: ago(60),
    unread: 1,
    messages: [
      { id: 'ed-m5', sender: 'Dr. Santos', initials: 'MS', isMe: false, content: 'Midterm grading due by Friday 5pm. All sections on track.', timestamp: ago(60) },
    ],
  },
  {
    id: 'ed-th-6',
    title: 'Lisa Morales (VP Finance)',
    icon: 'person.fill',
    participants: ['Dr. Wells', 'Lisa Morales'],
    lastMessage: 'Q3 budget variance report attached. We\'re under by 4%.',
    timestamp: ago(180),
    unread: 1,
    pinned: true,
    messages: [
      { id: 'ed-m6', sender: 'Lisa Morales', initials: 'LM', isMe: false, content: 'Q3 budget variance report attached. We\'re under by 4%.', timestamp: ago(180) },
    ],
  },
  {
    id: 'ed-th-7',
    title: 'Student Government',
    icon: 'person.fill',
    participants: ['Dr. Wells', 'SGA President'],
    lastMessage: 'Student body wants to discuss parking policy changes. Can we meet Thursday?',
    timestamp: ago(300),
    unread: 1,
    messages: [
      { id: 'ed-m7', sender: 'SGA President', initials: 'SP', isMe: false, content: 'Student body wants to discuss parking policy changes. Can we meet Thursday?', timestamp: ago(300) },
    ],
  },
  {
    id: 'ed-th-8',
    title: 'Jake Torres (TA)',
    icon: 'person.fill',
    participants: ['Dr. Santos', 'Jake Torres'],
    lastMessage: 'Lab 5 graded — average was 82%. A few students need tutoring referrals.',
    timestamp: ago(90),
    unread: 0,
    messages: [
      { id: 'ed-m8', sender: 'Jake Torres', initials: 'JT', isMe: false, content: 'Lab 5 graded — average was 82%. A few students need tutoring referrals.', timestamp: ago(90) },
    ],
  },
  {
    id: 'ed-th-9',
    title: 'Facilities Manager',
    icon: 'person.fill',
    participants: ['Dr. Wells', 'Tom Harrison'],
    lastMessage: 'Science building HVAC repair scheduled for this weekend.',
    timestamp: ago(480),
    unread: 0,
    messages: [
      { id: 'ed-m9', sender: 'Tom Harrison', initials: 'TH', isMe: false, content: 'Science building HVAC repair scheduled for this weekend.', timestamp: ago(480) },
    ],
  },
  {
    id: 'ed-th-10',
    title: 'Alumni Relations',
    icon: 'person.fill',
    participants: ['Dr. Wells', 'Dana Brooks'],
    lastMessage: 'Homecoming planning kickoff meeting next Wednesday. Agenda attached.',
    timestamp: ago(1440),
    unread: 0,
    messages: [
      { id: 'ed-m10', sender: 'Dana Brooks', initials: 'DB', isMe: false, content: 'Homecoming planning kickoff meeting next Wednesday. Agenda attached.', timestamp: ago(1440) },
    ],
  },
];

const EDUCATION_CHAT_THREADS: ChatThread[] = EDUCATION_THREADS.map((t) => ({
  ...t,
  context: { type: 'staff' as const, subtitle: 'Faculty / Staff' },
  template: 'dm' as ThreadTemplate,
  isGroup: false,
}));

// =============================================================================
// ENTERPRISE MODE DM THREADS
// =============================================================================

const ENTERPRISE_THREADS: InboxThread[] = [
  {
    id: 'bz-th-1',
    title: 'Priya Patel (CTO)',
    icon: 'person.fill',
    participants: ['Alex Rivera', 'Priya Patel'],
    lastMessage: 'Deploy freeze lifted — shipping when ready.',
    timestamp: ago(10),
    unread: 2,
    pinned: true,
    messages: [
      { id: 'bz-m1', sender: 'Priya Patel', initials: 'PP', isMe: false, content: 'Deploy freeze lifted — shipping when ready.', timestamp: ago(10) },
    ],
  },
  {
    id: 'bz-th-2',
    title: 'Jordan Lee (COO)',
    icon: 'person.fill',
    participants: ['Alex Rivera', 'Jordan Lee'],
    lastMessage: 'Vendor contract renewal — need sign-off by EOW.',
    timestamp: ago(60),
    unread: 1,
    messages: [
      { id: 'bz-m2', sender: 'Jordan Lee', initials: 'JL', isMe: false, content: 'Vendor contract renewal — need sign-off by EOW.', timestamp: ago(60) },
    ],
  },
  {
    id: 'bz-th-3',
    title: 'Sam Okafor (Eng Manager)',
    icon: 'person.fill',
    participants: ['Alex Rivera', 'Sam Okafor'],
    lastMessage: 'Migration script passed staging. Ready for prod deploy.',
    timestamp: ago(120),
    unread: 1,
    messages: [
      { id: 'bz-m3', sender: 'Sam Okafor', initials: 'SO', isMe: false, content: 'Migration script passed staging. Ready for prod deploy.', timestamp: ago(120) },
    ],
  },
  {
    id: 'bz-th-4',
    title: 'Jamie Torres (AE)',
    icon: 'person.fill',
    participants: ['Alex Rivera', 'Jamie Torres'],
    lastMessage: 'Acme Corp deal — legal review on MSA complete, ready for signature.',
    timestamp: ago(240),
    unread: 0,
    messages: [
      { id: 'bz-m4', sender: 'Jamie Torres', initials: 'JT', isMe: false, content: 'Acme Corp deal — legal review on MSA complete, ready for signature.', timestamp: ago(240) },
    ],
  },
  {
    id: 'bz-th-5',
    title: 'Morgan Chen (Ops)',
    icon: 'person.fill',
    participants: ['Alex Rivera', 'Morgan Chen'],
    lastMessage: 'Office lease renewal terms arrived. Looks favorable.',
    timestamp: ago(180),
    unread: 1,
    messages: [
      { id: 'bz-m5', sender: 'Morgan Chen', initials: 'MC', isMe: false, content: 'Office lease renewal terms arrived. Looks favorable.', timestamp: ago(180) },
    ],
  },
  {
    id: 'bz-th-6',
    title: 'Casey Rodriguez (Staff Eng)',
    icon: 'person.fill',
    participants: ['Alex Rivera', 'Casey Rodriguez'],
    lastMessage: 'Architecture diagram for Phoenix project is updated in Figma.',
    timestamp: ago(300),
    unread: 0,
    messages: [
      { id: 'bz-m6', sender: 'Casey Rodriguez', initials: 'CR', isMe: false, content: 'Architecture diagram for Phoenix project is updated in Figma.', timestamp: ago(300) },
    ],
  },
  {
    id: 'bz-th-7',
    title: 'Drew Singh (CSM)',
    icon: 'person.fill',
    participants: ['Alex Rivera', 'Drew Singh'],
    lastMessage: 'GlobalTech integration issue resolved. Ticket #4521 closed.',
    timestamp: ago(480),
    unread: 0,
    messages: [
      { id: 'bz-m7', sender: 'Drew Singh', initials: 'DS', isMe: false, content: 'GlobalTech integration issue resolved. Ticket #4521 closed.', timestamp: ago(480) },
    ],
  },
  {
    id: 'bz-th-8',
    title: 'Board Member — Robert Kim',
    icon: 'person.fill',
    participants: ['Alex Rivera', 'Robert Kim'],
    lastMessage: 'Board deck looks great. One comment on the revenue slide.',
    timestamp: ago(90),
    unread: 2,
    pinned: true,
    messages: [
      { id: 'bz-m8', sender: 'Robert Kim', initials: 'RK', isMe: false, content: 'Board deck looks great. One comment on the revenue slide.', timestamp: ago(90) },
    ],
  },
  {
    id: 'bz-th-9',
    title: 'Riley Brown (Solutions Eng)',
    icon: 'person.fill',
    participants: ['Alex Rivera', 'Riley Brown'],
    lastMessage: 'Demo environment spun up for the Acme PoC. Link in Slack.',
    timestamp: ago(150),
    unread: 0,
    messages: [
      { id: 'bz-m9', sender: 'Riley Brown', initials: 'RB', isMe: false, content: 'Demo environment spun up for the Acme PoC. Link in Slack.', timestamp: ago(150) },
    ],
  },
  {
    id: 'bz-th-10',
    title: 'HR — New Hire Onboard',
    icon: 'person.fill',
    participants: ['Alex Rivera', 'HR Team'],
    lastMessage: 'Wei Zhang starts Monday. Equipment and access requests submitted.',
    timestamp: ago(360),
    unread: 1,
    messages: [
      { id: 'bz-m10', sender: 'HR Team', initials: 'HR', isMe: false, content: 'Wei Zhang starts Monday. Equipment and access requests submitted.', timestamp: ago(360) },
    ],
  },
];

const ENTERPRISE_CHAT_THREADS: ChatThread[] = ENTERPRISE_THREADS.map((t) => ({
  ...t,
  context: { type: 'staff' as const, subtitle: 'Team' },
  template: 'dm' as ThreadTemplate,
  isGroup: false,
}));

// =============================================================================
// COMMUNITY MODE DM THREADS
// =============================================================================

const COMMUNITY_THREADS: InboxThread[] = [
  {
    id: 'cx-th-1',
    title: 'Sarah Nakamura (Ops Lead)',
    icon: 'person.fill',
    participants: ['Marcus Hall', 'Sarah Nakamura'],
    lastMessage: 'Track inspection complete — all clear for qualifying.',
    timestamp: ago(8),
    unread: 2,
    pinned: true,
    messages: [
      { id: 'cx-m1', sender: 'Sarah Nakamura', initials: 'SN', isMe: false, content: 'Track inspection complete — all clear for qualifying.', timestamp: ago(8) },
    ],
  },
  {
    id: 'cx-th-2',
    title: 'Diego Fuentes (Safety)',
    icon: 'person.fill',
    participants: ['Marcus Hall', 'Diego Fuentes'],
    lastMessage: 'Medical team staged at turns 3, 7, and pit lane. All green.',
    timestamp: ago(30),
    unread: 1,
    messages: [
      { id: 'cx-m2', sender: 'Diego Fuentes', initials: 'DF', isMe: false, content: 'Medical team staged at turns 3, 7, and pit lane. All green.', timestamp: ago(30) },
    ],
  },
  {
    id: 'cx-th-3',
    title: 'Tom Bradley (Apex Racing)',
    icon: 'person.fill',
    participants: ['Marcus Hall', 'Tom Bradley'],
    lastMessage: 'Our driver needs a pit allocation change for Round 3. Possible?',
    timestamp: ago(60),
    unread: 1,
    messages: [
      { id: 'cx-m3', sender: 'Tom Bradley', initials: 'TB', isMe: false, content: 'Our driver needs a pit allocation change for Round 3. Possible?', timestamp: ago(60) },
    ],
  },
  {
    id: 'cx-th-4',
    title: 'Chief Steward Roberts',
    icon: 'person.fill',
    participants: ['Marcus Hall', 'Chief Steward Roberts'],
    lastMessage: 'Incident report from Lap 12 reviewed. Penalty issued to car #17.',
    timestamp: ago(180),
    unread: 0,
    messages: [
      { id: 'cx-m4', sender: 'Chief Roberts', initials: 'SR', isMe: false, content: 'Incident report from Lap 12 reviewed. Penalty issued to car #17.', timestamp: ago(180) },
    ],
  },
  {
    id: 'cx-th-5',
    title: 'Chris Donovan (Broadcast)',
    icon: 'person.fill',
    participants: ['Marcus Hall', 'Chris Donovan'],
    lastMessage: 'Camera positions locked in — test stream at 2pm confirmed.',
    timestamp: ago(300),
    unread: 0,
    messages: [
      { id: 'cx-m5', sender: 'Chris Donovan', initials: 'CD', isMe: false, content: 'Camera positions locked in — test stream at 2pm confirmed.', timestamp: ago(300) },
    ],
  },
  {
    id: 'cx-th-6',
    title: 'Dana Wells (Partnerships)',
    icon: 'person.fill',
    participants: ['Marcus Hall', 'Dana Wells'],
    lastMessage: 'TechFlow confirmed as title sponsor for Round 4. Contract signed.',
    timestamp: ago(480),
    unread: 0,
    messages: [
      { id: 'cx-m6', sender: 'Dana Wells', initials: 'DW', isMe: false, content: 'TechFlow confirmed as title sponsor for Round 4. Contract signed.', timestamp: ago(480) },
    ],
  },
  {
    id: 'cx-th-7',
    title: 'Lisa Park (Logistics)',
    icon: 'person.fill',
    participants: ['Marcus Hall', 'Lisa Park'],
    lastMessage: 'Vendor load-in Friday 6am — gate codes sent. Catering confirmed.',
    timestamp: ago(90),
    unread: 2,
    messages: [
      { id: 'cx-m7', sender: 'Lisa Park', initials: 'LP', isMe: false, content: 'Vendor load-in Friday 6am — gate codes sent. Catering confirmed.', timestamp: ago(90) },
    ],
  },
  {
    id: 'cx-th-8',
    title: 'Kenji Tanaka (Velocity)',
    icon: 'person.fill',
    participants: ['Marcus Hall', 'Kenji Tanaka'],
    lastMessage: 'Requesting additional garage time for Saturday morning setup.',
    timestamp: ago(150),
    unread: 1,
    messages: [
      { id: 'cx-m8', sender: 'Kenji Tanaka', initials: 'KT', isMe: false, content: 'Requesting additional garage time for Saturday morning setup.', timestamp: ago(150) },
    ],
  },
  {
    id: 'cx-th-9',
    title: 'Mike Johnson (Venue)',
    icon: 'person.fill',
    participants: ['Marcus Hall', 'Mike Johnson'],
    lastMessage: 'Parking lot overflow plan approved. Shuttle bus schedule attached.',
    timestamp: ago(720),
    unread: 0,
    messages: [
      { id: 'cx-m9', sender: 'Mike Johnson', initials: 'MJ', isMe: false, content: 'Parking lot overflow plan approved. Shuttle bus schedule attached.', timestamp: ago(720) },
    ],
  },
  {
    id: 'cx-th-10',
    title: 'New Team — Blaze Racing',
    icon: 'person.fill',
    participants: ['Marcus Hall', 'Blaze Racing'],
    lastMessage: 'Registration complete. Looking forward to our first season.',
    timestamp: ago(1440),
    unread: 1,
    messages: [
      { id: 'cx-m10', sender: 'Blaze Racing', initials: 'BR', isMe: false, content: 'Registration complete. Looking forward to our first season.', timestamp: ago(1440) },
    ],
  },
];

const COMMUNITY_CHAT_THREADS: ChatThread[] = COMMUNITY_THREADS.map((t) => ({
  ...t,
  context: { type: 'staff' as const, subtitle: 'Competition Staff' },
  template: 'dm' as ThreadTemplate,
  isGroup: false,
}));

// =============================================================================
// MODE-KEYED INBOX THREADS
// =============================================================================

export const INBOX_THREADS_BY_MODE: Record<Mode, ChatThread[]> = {
  sports: MOCK_CHAT_THREADS.filter((t) => !t.isGroup),
  church: CHURCH_CHAT_THREADS,
  education: EDUCATION_CHAT_THREADS,
  enterprise: ENTERPRISE_CHAT_THREADS,
  competition: COMMUNITY_CHAT_THREADS,
  business: ENTERPRISE_CHAT_THREADS,
};

export const PINNED_THREADS_BY_MODE: Record<Mode, ChatThread[]> = {
  sports: MOCK_CHAT_THREADS.filter((t) => !t.isGroup && t.pinned),
  church: CHURCH_CHAT_THREADS.filter((t) => t.pinned),
  education: EDUCATION_CHAT_THREADS.filter((t) => t.pinned),
  enterprise: ENTERPRISE_CHAT_THREADS.filter((t) => t.pinned),
  competition: COMMUNITY_CHAT_THREADS.filter((t) => t.pinned),
  business: ENTERPRISE_CHAT_THREADS.filter((t) => t.pinned),
};

// =============================================================================
// MODE-SPECIFIC ROOMS (Slack-style channels per mode)
// =============================================================================

const DEFAULT_CHANNELS: RoomChannel[] = [
  { id: 'ch-ann', name: '#announcements', icon: 'megaphone.fill', isPinned: true },
  { id: 'ch-gen', name: '#general', icon: 'bubble.left.and.bubble.right.fill' },
  { id: 'ch-ops', name: '#ops', icon: 'gearshape.fill' },
  { id: 'ch-files', name: '#files-links', icon: 'paperclip' },
];

function makeRoom(
  id: string,
  title: string,
  icon: string,
  roomType: RoomType,
  lastMessage: string,
  minutesAgo: number,
  unread: number,
  memberCount: number,
): ChatThread {
  return {
    id,
    title,
    icon,
    participants: [`${memberCount} members`],
    lastMessage,
    timestamp: new Date(Date.now() - minutesAgo * 60000),
    unread,
    messages: [],
    isGroup: true,
    roomType,
    channels: DEFAULT_CHANNELS,
    context: { type: 'group', subtitle: `Room · ${memberCount} members` },
  };
}

const SPORTS_ROOMS: ChatThread[] = [
  makeRoom('rm-sp-1', 'Staff', 'briefcase.fill', 'staff', 'Film session moved to 3:30 PM.', 12, 2, 8),
  makeRoom('rm-sp-2', 'Recruiting', 'person.badge.plus', 'recruiting', 'Jaylen Carter OV confirmed for Feb 21.', 45, 1, 5),
  makeRoom('rm-sp-3', 'Travel', 'airplane', 'travel', 'Bus departs 10 AM Saturday — Campbell.', 180, 0, 12),
  makeRoom('rm-sp-4', 'Film', 'play.rectangle.fill', 'film', 'Transition defense clips uploaded.', 90, 3, 6),
];

const BUSINESS_ROOMS: ChatThread[] = [
  makeRoom('rm-bz-1', 'Leadership', 'star.fill', 'leadership', 'Q1 board deck draft is in #files-links.', 30, 1, 4),
  makeRoom('rm-bz-2', 'Product', 'hammer.fill', 'product', 'V2 sprint review at 2 PM today.', 60, 2, 7),
  makeRoom('rm-bz-3', 'Investors', 'chart.line.uptrend.xyaxis', 'investors', 'Series A data room updated.', 300, 0, 3),
  makeRoom('rm-bz-4', 'Legal', 'doc.text.fill', 'legal', 'NDA redlines from counsel — review by EOD.', 120, 1, 3),
];

const CHURCH_ROOMS: ChatThread[] = [
  makeRoom('rm-ch-1', 'Pastoral', 'heart.fill', 'pastoral', 'Wednesday night service plan finalized.', 20, 1, 6),
  makeRoom('rm-ch-2', 'Prayer', 'hands.sparkles.fill', 'prayer', 'New prayer requests added — 3 urgent.', 90, 2, 15),
  makeRoom('rm-ch-3', 'Worship', 'music.note', 'worship', 'Setlist for Sunday locked in #announcements.', 150, 0, 8),
];

const EDUCATION_ROOMS: ChatThread[] = [
  makeRoom('rm-ed-1', 'Admissions', 'person.crop.rectangle.fill', 'admissions', 'Spring 2026 yield report attached.', 45, 1, 5),
  makeRoom('rm-ed-2', 'Housing', 'building.2.fill', 'housing', 'Room assignments go live March 1.', 200, 0, 4),
  makeRoom('rm-ed-3', 'Campus Life', 'graduationcap.fill', 'campus_life', 'Spring fest planning meeting at 4 PM.', 100, 2, 9),
];

const COMPETITION_ROOMS: ChatThread[] = [
  makeRoom('rm-co-1', 'Raceweek Ops', 'flag.checkered', 'raceweek_ops', 'Laguna Seca setup checklist posted.', 15, 3, 10),
  makeRoom('rm-co-2', 'Rules', 'book.fill', 'rules', 'Updated tire compound regs for Round 7.', 60, 1, 6),
  makeRoom('rm-co-3', 'Compliance', 'checkmark.shield.fill', 'compliance', 'Weight inspection window: 8–9 AM Saturday.', 120, 0, 4),
  makeRoom('rm-co-4', 'Safety', 'exclamationmark.triangle.fill', 'safety', 'Roll cage re-cert due before qualifying.', 240, 2, 5),
];

export function getModeRooms(mode: Mode): ChatThread[] {
  switch (mode) {
    case 'sports': return SPORTS_ROOMS;
    case 'enterprise': return BUSINESS_ROOMS;
    case 'church': return CHURCH_ROOMS;
    case 'education': return EDUCATION_ROOMS;
    case 'competition': return COMPETITION_ROOMS;
    case 'business': return BUSINESS_ROOMS;
    default: return SPORTS_ROOMS;
  }
}

// =============================================================================
// ALERT SOURCE COLORS
// =============================================================================

export function getSourceTagColor(sourceTag: string): { bg: string; text: string } {
  switch (sourceTag) {
    case 'Culture':
      return { bg: '#9C27B020', text: '#CE93D8' };
    case 'Film':
    case 'Game Ops':
      return { bg: '#EF444420', text: '#EF4444' };
    case 'Player Dev':
      return { bg: '#FFA50020', text: '#FFA500' };
    case 'Recruiting':
      return { bg: '#4CAF5020', text: '#4CAF50' };
    case 'Mention':
      return { bg: '#2196F320', text: '#64B5F6' };
    case 'System':
      return { bg: '#6e6e6e20', text: '#9e9e9e' };
    default:
      return { bg: '#2196F320', text: '#64B5F6' };
  }
}

// =============================================================================
// MOCK ALERTS
// =============================================================================

export const MOCK_ALERTS: AlertItem[] = [
  {
    id: 'al-1',
    severity: 'high',
    title: '3 overdue film reviews',
    sourceTag: 'Film',
    timestamp: ago(30),
    cta: 'Resolve',
    resolved: false,
    description: 'Film reviews for the Coastal Carolina, UNC Asheville, and Radford games are past due. Players have not completed mandatory viewing assignments.',
    history: [
      { action: 'Created by system', timestamp: ago(30) },
    ],
  },
  {
    id: 'al-2',
    severity: 'medium',
    title: 'Player knee check-in due',
    sourceTag: 'Player Dev',
    timestamp: ago(180),
    cta: 'View',
    resolved: false,
    description: 'Tyler Roberts (#12) is due for a knee evaluation follow-up per athletic training protocol. Last check-in was 10 days ago.',
    assignedTo: 'Coach Turner',
    history: [
      { action: 'Created by system', timestamp: ago(180) },
      { action: 'Assigned to Coach Turner', timestamp: ago(120) },
    ],
  },
  {
    id: 'al-3',
    severity: 'high',
    title: 'Recruit stale for 14 days',
    sourceTag: 'Recruiting',
    timestamp: ago(720),
    cta: 'Resolve',
    resolved: false,
    description: 'Devon Williams has had no contact logged in 14 days. Last touchpoint was a phone call on Feb 1. Risk of losing interest.',
    history: [
      { action: 'Created by system', timestamp: ago(720) },
    ],
  },
  {
    id: 'al-4',
    severity: 'low',
    title: '2 untagged practice clips',
    sourceTag: 'Game Ops',
    timestamp: ago(1440),
    cta: 'View',
    resolved: false,
    description: 'Two practice clips from Feb 12 session have not been tagged or categorized in the film library.',
    assignedTo: 'Coach Brooks',
    history: [
      { action: 'Created by system', timestamp: ago(1440) },
      { action: 'Assigned to Coach Brooks', timestamp: ago(1400) },
    ],
  },
  {
    id: 'al-5',
    severity: 'medium',
    title: 'Behavior checkpoint: Player #23',
    sourceTag: 'Culture',
    timestamp: ago(2880),
    cta: 'Resolve',
    resolved: false,
    description: 'Andre Harris (#23) has missed two consecutive team meals and was late to one practice this week. Culture protocol requires a check-in conversation.',
    history: [
      { action: 'Created by system', timestamp: ago(2880) },
    ],
  },
  {
    id: 'al-6',
    severity: 'low',
    title: 'Coach Miller mentioned you in Staff Room',
    sourceTag: 'Mention',
    timestamp: ago(60),
    cta: 'View',
    resolved: false,
    description: 'Coach Miller tagged you in a message about the Campbell scouting report.',
    history: [
      { action: 'Created by system', timestamp: ago(60) },
    ],
  },
  {
    id: 'al-7',
    severity: 'low',
    title: 'System backup completed',
    sourceTag: 'System',
    timestamp: ago(360),
    cta: 'View',
    resolved: false,
    description: 'Nightly data backup completed successfully. All program data synced to cloud storage.',
    history: [
      { action: 'Created by system', timestamp: ago(360) },
    ],
  },
  {
    id: 'al-8',
    severity: 'medium',
    title: 'Marcus Johnson mentioned you in Team Thread',
    sourceTag: 'Mention',
    timestamp: ago(90),
    cta: 'View',
    resolved: false,
    description: 'Marcus Johnson tagged you asking about Saturday\'s game plan adjustments.',
    history: [
      { action: 'Created by system', timestamp: ago(90) },
    ],
  },
];
