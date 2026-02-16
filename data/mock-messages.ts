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
];

export const MOCK_GROUP_THREADS: ChatThread[] = MOCK_CHAT_THREADS.filter((t) => t.isGroup);

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
    case 'community': return COMPETITION_ROOMS;
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
