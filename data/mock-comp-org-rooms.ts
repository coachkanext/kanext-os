/**
 * Competition Organization Rooms — Mock Data
 * Comprehensive rooms data for the 10-tab Rooms Hub:
 * Dashboard, War Rooms, Broadcast, Officials, Media, VIP, Operations, Archive, Analytics, Settings.
 */

// =============================================================================
// TYPES
// =============================================================================

/** Rooms sub-tab identifier */
export type CompRoomsTabId =
  | 'dashboard'
  | 'war-rooms'
  | 'broadcast'
  | 'officials'
  | 'media'
  | 'vip'
  | 'operations'
  | 'archive'
  | 'analytics'
  | 'settings';

export interface CompRoomsTab {
  id: CompRoomsTabId;
  label: string;
  icon: string;
}

/** Room status */
export type RoomStatus = 'active' | 'idle' | 'locked' | 'archived';

/** Room access level */
export type RoomAccessLevel = 'public' | 'staff' | 'vip' | 'restricted';

/** Room type */
export type RoomType = 'war-room' | 'broadcast' | 'officials' | 'media' | 'vip' | 'operations';

/** Dashboard KPI block */
export interface RoomsDashboardBlock {
  id: string;
  label: string;
  value: string;
  delta: string;
  icon: string;
  color: string;
}

/** Base competition room */
export interface CompRoom {
  id: string;
  name: string;
  type: RoomType;
  status: RoomStatus;
  capacity: number;
  currentOccupancy: number;
  series: string;
  accessLevel: RoomAccessLevel;
  createdDate: string;
  lastActive: string;
}

/** Broadcast room — extends CompRoom */
export interface BroadcastRoom extends CompRoom {
  streamUrl: string;
  viewers: number;
  isLive: boolean;
  producer: string;
}

/** Official room — extends CompRoom */
export interface OfficialRoom extends CompRoom {
  matchId: string;
  officials: string[];
  rulingsPending: number;
}

/** Media room — extends CompRoom */
export interface MediaRoom extends CompRoom {
  pressMembers: number;
  deadlineTime: string;
  contentType: string;
}

/** Room message */
export interface RoomMessage {
  id: string;
  roomId: string;
  sender: string;
  text: string;
  timestamp: number;
  pinned: boolean;
}

/** Room file */
export interface RoomFile {
  id: string;
  roomId: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'spreadsheet';
  size: string;
  uploadedBy: string;
  uploadedDate: string;
}

/** Room analytic metric */
export interface RoomAnalytic {
  id: string;
  roomId: string;
  metric: string;
  value: string;
  period: string;
}

/** Room setting toggle */
export interface RoomSettingToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

/** Activity feed item */
export interface RoomActivityItem {
  id: string;
  roomName: string;
  action: string;
  actor: string;
  timestampMs: number;
  color: string;
}

/** Operations room (task board) */
export interface OpsRoom extends CompRoom {
  activeTasks: number;
  personnelCount: number;
  priority: 'critical' | 'high' | 'normal' | 'low';
}

/** Archived room */
export interface ArchivedRoom extends CompRoom {
  totalMessages: number;
  totalFiles: number;
  archivedDate: string;
}

/** Analytics stat card */
export interface AnalyticsStatCard {
  id: string;
  label: string;
  value: string;
  change: string;
  changeDirection: 'up' | 'down' | 'flat';
  icon: string;
  color: string;
}

/** VIP room */
export interface VIPRoom extends CompRoom {
  currentGuests: string[];
  seriesAffiliation: string;
}

// =============================================================================
// CONSTANTS — Tabs
// =============================================================================

export const COMP_ROOMS_TABS: CompRoomsTab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'square.grid.2x2.fill' },
  { id: 'war-rooms', label: 'War Rooms', icon: 'shield.fill' },
  { id: 'broadcast', label: 'Broadcast', icon: 'antenna.radiowaves.left.and.right' },
  { id: 'officials', label: 'Officials', icon: 'person.badge.shield.checkmark.fill' },
  { id: 'media', label: 'Media', icon: 'newspaper.fill' },
  { id: 'vip', label: 'VIP', icon: 'star.fill' },
  { id: 'operations', label: 'Operations', icon: 'gearshape.2.fill' },
  { id: 'archive', label: 'Archive', icon: 'archivebox.fill' },
  { id: 'analytics', label: 'Analytics', icon: 'chart.bar.fill' },
  { id: 'settings', label: 'Settings', icon: 'gearshape.fill' },
];

export const COMP_ROOMS_SCOPE_CHIPS = [
  'All Rooms',
  'War Rooms',
  'Broadcast',
  'Officials',
  'Media',
  'VIP',
];

// =============================================================================
// STATUS & ACCESS COLORS
// =============================================================================

export const ROOM_STATUS_COLOR: Record<RoomStatus, string> = {
  active: '#22C55E',
  idle: '#F59E0B',
  locked: '#EF4444',
  archived: '#A1A1AA',
};

export const ACCESS_LEVEL_COLOR: Record<RoomAccessLevel, string> = {
  public: '#1D9BF0',
  staff: '#22C55E',
  vip: '#1D9BF0',
  restricted: '#EF4444',
};

export const ROOM_TYPE_LABEL: Record<RoomType, string> = {
  'war-room': 'War Room',
  broadcast: 'Broadcast',
  officials: 'Officials',
  media: 'Media',
  vip: 'VIP',
  operations: 'Operations',
};

export const PRIORITY_COLOR: Record<string, string> = {
  critical: '#EF4444',
  high: '#F59E0B',
  normal: '#22C55E',
  low: '#A1A1AA',
};

// =============================================================================
// MOCK DATA — Dashboard
// =============================================================================

const DASHBOARD_BLOCKS: RoomsDashboardBlock[] = [
  { id: 'db-1', label: 'Total Rooms', value: '24', delta: '+3 this week', icon: 'rectangle.stack.fill', color: '#1D9BF0' },
  { id: 'db-2', label: 'Active Now', value: '11', delta: '46% utilization', icon: 'bolt.fill', color: '#22C55E' },
  { id: 'db-3', label: 'Broadcast Live', value: '4', delta: '12.8K viewers', icon: 'antenna.radiowaves.left.and.right', color: '#EF4444' },
  { id: 'db-4', label: 'Occupancy Rate', value: '72%', delta: '+8% vs last event', icon: 'person.3.fill', color: '#F59E0B' },
  { id: 'db-5', label: 'Pending Rulings', value: '6', delta: '3 urgent', icon: 'exclamationmark.triangle.fill', color: '#1D9BF0' },
  { id: 'db-6', label: 'Messages Today', value: '847', delta: '+22% vs avg', icon: 'bubble.left.and.bubble.right.fill', color: '#FFFFFF' },
];

// =============================================================================
// MOCK DATA — Activity Feed
// =============================================================================

const ACTIVITY_FEED: RoomActivityItem[] = [
  { id: 'af-1', roomName: 'KaNeXT Church War Room', action: 'Strategy session started', actor: 'Alex Morgan', timestampMs: Date.now() - 180000, color: '#22C55E' },
  { id: 'af-2', roomName: 'K-1 Broadcast Center', action: 'Stream went live — Match 7', actor: 'Jordan Ellis', timestampMs: Date.now() - 420000, color: '#EF4444' },
  { id: 'af-3', roomName: 'Match Officials Room A', action: 'Ruling submitted — Foul review', actor: 'Ref. Williams', timestampMs: Date.now() - 900000, color: '#1D9BF0' },
  { id: 'af-4', roomName: 'Press Room — Main Arena', action: 'Post-match presser opened', actor: 'Media Ops', timestampMs: Date.now() - 1500000, color: '#F59E0B' },
  { id: 'af-5', roomName: 'VIP Lounge — Commissioner', action: 'Guest access granted', actor: 'Security Team', timestampMs: Date.now() - 2100000, color: '#1D9BF0' },
  { id: 'af-6', roomName: 'Ops Command Center', action: 'Task #14 completed — Venue setup', actor: 'Chris Rivera', timestampMs: Date.now() - 3600000, color: '#22C55E' },
  { id: 'af-7', roomName: 'KaNeXT Church War Room', action: 'Document shared — Scouting Report', actor: 'Mike Torres', timestampMs: Date.now() - 5400000, color: '#1D9BF0' },
  { id: 'af-8', roomName: 'K-1 Broadcast Center', action: 'Camera 3 audio sync fixed', actor: 'Jordan Ellis', timestampMs: Date.now() - 7200000, color: '#F59E0B' },
  { id: 'af-9', roomName: 'Match Officials Room B', action: 'Pre-match briefing completed', actor: 'Ref. Garcia', timestampMs: Date.now() - 9000000, color: '#A1A1AA' },
  { id: 'af-10', roomName: 'VIP Lounge — Sponsors', action: 'Catering delivered', actor: 'Event Services', timestampMs: Date.now() - 10800000, color: '#22C55E' },
];

// =============================================================================
// MOCK DATA — War Rooms
// =============================================================================

const WAR_ROOMS: CompRoom[] = [
  { id: 'wr-1', name: 'KaNeXT Church War Room', type: 'war-room', status: 'active', capacity: 20, currentOccupancy: 14, series: 'KaNeXT Church Championship', accessLevel: 'restricted', createdDate: 'Jan 5, 2026', lastActive: '2m ago' },
  { id: 'wr-2', name: 'Atlantic Division HQ', type: 'war-room', status: 'active', capacity: 16, currentOccupancy: 9, series: 'Atlantic Division Finals', accessLevel: 'staff', createdDate: 'Jan 12, 2026', lastActive: '8m ago' },
  { id: 'wr-3', name: 'Draft Strategy Room', type: 'war-room', status: 'idle', capacity: 12, currentOccupancy: 0, series: 'KaNeXT Draft 2026', accessLevel: 'restricted', createdDate: 'Dec 18, 2025', lastActive: '2h ago' },
  { id: 'wr-4', name: 'Playoff Scouting Room', type: 'war-room', status: 'active', capacity: 10, currentOccupancy: 7, series: 'KaNeXT Church Playoffs', accessLevel: 'staff', createdDate: 'Feb 1, 2026', lastActive: '15m ago' },
  { id: 'wr-5', name: 'K-1 Grand Prix Ops', type: 'war-room', status: 'locked', capacity: 8, currentOccupancy: 0, series: 'K-1 Grand Prix', accessLevel: 'restricted', createdDate: 'Nov 22, 2025', lastActive: '3d ago' },
  { id: 'wr-6', name: 'Conference Championship War Room', type: 'war-room', status: 'active', capacity: 18, currentOccupancy: 12, series: 'Conference Championship', accessLevel: 'staff', createdDate: 'Feb 8, 2026', lastActive: '1m ago' },
  { id: 'wr-7', name: 'International Series HQ', type: 'war-room', status: 'idle', capacity: 14, currentOccupancy: 2, series: 'International Series', accessLevel: 'restricted', createdDate: 'Jan 28, 2026', lastActive: '45m ago' },
  { id: 'wr-8', name: 'Combine Analysis Room', type: 'war-room', status: 'idle', capacity: 10, currentOccupancy: 0, series: 'KaNeXT Combine', accessLevel: 'staff', createdDate: 'Feb 3, 2026', lastActive: '6h ago' },
  { id: 'wr-9', name: 'Rivalry Series Tactics', type: 'war-room', status: 'active', capacity: 12, currentOccupancy: 8, series: 'Rivalry Week', accessLevel: 'staff', createdDate: 'Feb 10, 2026', lastActive: '5m ago' },
  { id: 'wr-10', name: 'Exhibition Series Room', type: 'war-room', status: 'archived', capacity: 8, currentOccupancy: 0, series: 'Pre-Season Exhibition', accessLevel: 'public', createdDate: 'Oct 15, 2025', lastActive: '14d ago' },
  { id: 'wr-11', name: 'Tournament Bracket Room', type: 'war-room', status: 'active', capacity: 16, currentOccupancy: 11, series: 'KaNeXT Church Tournament', accessLevel: 'restricted', createdDate: 'Feb 12, 2026', lastActive: '3m ago' },
  { id: 'wr-12', name: 'All-Star Selection HQ', type: 'war-room', status: 'idle', capacity: 8, currentOccupancy: 1, series: 'All-Star Weekend', accessLevel: 'restricted', createdDate: 'Jan 20, 2026', lastActive: '1h ago' },
];

// =============================================================================
// MOCK DATA — Broadcast Rooms
// =============================================================================

const BROADCAST_ROOMS: BroadcastRoom[] = [
  { id: 'br-1', name: 'K-1 Broadcast Center', type: 'broadcast', status: 'active', capacity: 30, currentOccupancy: 22, series: 'K-1 Grand Prix', accessLevel: 'staff', createdDate: 'Nov 10, 2025', lastActive: '1m ago', streamUrl: 'rtmp://stream.kanext.io/k1-main', viewers: 4820, isLive: true, producer: 'Jordan Ellis' },
  { id: 'br-2', name: 'KaNeXT Church Main Stream', type: 'broadcast', status: 'active', capacity: 24, currentOccupancy: 18, series: 'KaNeXT Church Championship', accessLevel: 'staff', createdDate: 'Jan 8, 2026', lastActive: '3m ago', streamUrl: 'rtmp://stream.kanext.io/iccla-1', viewers: 3150, isLive: true, producer: 'Lisa Grant' },
  { id: 'br-3', name: 'Secondary Court Feed', type: 'broadcast', status: 'active', capacity: 12, currentOccupancy: 8, series: 'KaNeXT Church Division Games', accessLevel: 'staff', createdDate: 'Feb 2, 2026', lastActive: '10m ago', streamUrl: 'rtmp://stream.kanext.io/iccla-2', viewers: 1480, isLive: true, producer: 'Derek Washington' },
  { id: 'br-4', name: 'Post-Game Studio', type: 'broadcast', status: 'idle', capacity: 8, currentOccupancy: 2, series: 'KaNeXT Church Championship', accessLevel: 'staff', createdDate: 'Jan 15, 2026', lastActive: '35m ago', streamUrl: 'rtmp://stream.kanext.io/postgame', viewers: 0, isLive: false, producer: 'Alicia Monroe' },
  { id: 'br-5', name: 'International Relay Hub', type: 'broadcast', status: 'active', capacity: 16, currentOccupancy: 11, series: 'International Series', accessLevel: 'restricted', createdDate: 'Jan 30, 2026', lastActive: '5m ago', streamUrl: 'rtmp://stream.kanext.io/intl-relay', viewers: 3340, isLive: true, producer: 'Marcus Yamamoto' },
  { id: 'br-6', name: 'Draft Night Studio', type: 'broadcast', status: 'idle', capacity: 20, currentOccupancy: 0, series: 'KaNeXT Draft 2026', accessLevel: 'staff', createdDate: 'Dec 20, 2025', lastActive: '8h ago', streamUrl: 'rtmp://stream.kanext.io/draft', viewers: 0, isLive: false, producer: 'Ryan Patel' },
  { id: 'br-7', name: 'Highlight Reel Suite', type: 'broadcast', status: 'active', capacity: 6, currentOccupancy: 4, series: 'All Competitions', accessLevel: 'staff', createdDate: 'Nov 5, 2025', lastActive: '12m ago', streamUrl: 'rtmp://stream.kanext.io/highlights', viewers: 890, isLive: false, producer: 'Tina Brooks' },
  { id: 'br-8', name: 'Arena Jumbotron Control', type: 'broadcast', status: 'active', capacity: 8, currentOccupancy: 6, series: 'KaNeXT Church Championship', accessLevel: 'restricted', createdDate: 'Feb 5, 2026', lastActive: '2m ago', streamUrl: 'rtmp://stream.kanext.io/jumbotron', viewers: 0, isLive: true, producer: 'Chris Garcia' },
  { id: 'br-9', name: 'Social Media Live Room', type: 'broadcast', status: 'idle', capacity: 4, currentOccupancy: 1, series: 'All Competitions', accessLevel: 'staff', createdDate: 'Jan 22, 2026', lastActive: '1h ago', streamUrl: 'rtmp://stream.kanext.io/social', viewers: 0, isLive: false, producer: 'Nadia Okafor' },
  { id: 'br-10', name: 'Combine Broadcast Room', type: 'broadcast', status: 'idle', capacity: 10, currentOccupancy: 0, series: 'KaNeXT Combine', accessLevel: 'staff', createdDate: 'Feb 3, 2026', lastActive: '4h ago', streamUrl: 'rtmp://stream.kanext.io/combine', viewers: 0, isLive: false, producer: 'Ryan Patel' },
];

// =============================================================================
// MOCK DATA — Official Rooms
// =============================================================================

const OFFICIAL_ROOMS: OfficialRoom[] = [
  { id: 'or-1', name: 'Match Officials Room A', type: 'officials', status: 'active', capacity: 8, currentOccupancy: 6, series: 'KaNeXT Church Championship', accessLevel: 'restricted', createdDate: 'Jan 10, 2026', lastActive: '4m ago', matchId: 'KaNeXT Church-2026-047', officials: ['Ref. Williams', 'Ref. Thompson', 'Ref. Martinez', 'Ref. Nkosi'], rulingsPending: 2 },
  { id: 'or-2', name: 'Match Officials Room B', type: 'officials', status: 'active', capacity: 8, currentOccupancy: 5, series: 'KaNeXT Church Division Games', accessLevel: 'restricted', createdDate: 'Jan 10, 2026', lastActive: '12m ago', matchId: 'KaNeXT Church-2026-048', officials: ['Ref. Garcia', 'Ref. Li', 'Ref. Okafor'], rulingsPending: 1 },
  { id: 'or-3', name: 'Replay Review Center', type: 'officials', status: 'active', capacity: 12, currentOccupancy: 8, series: 'All KaNeXT Church', accessLevel: 'restricted', createdDate: 'Nov 1, 2025', lastActive: '1m ago', matchId: 'MULTI', officials: ['Lead Reviewer Davis', 'Reviewer Cho', 'Reviewer Patel', 'Reviewer Brown', 'Reviewer Kim'], rulingsPending: 3 },
  { id: 'or-4', name: 'K-1 Judges Panel Room', type: 'officials', status: 'active', capacity: 6, currentOccupancy: 5, series: 'K-1 Grand Prix', accessLevel: 'restricted', createdDate: 'Nov 15, 2025', lastActive: '6m ago', matchId: 'K1-GP-2026-012', officials: ['Judge Tanaka', 'Judge Morales', 'Judge Fischer'], rulingsPending: 0 },
  { id: 'or-5', name: 'Disciplinary Hearing Room', type: 'officials', status: 'idle', capacity: 10, currentOccupancy: 0, series: 'KaNeXT Church Compliance', accessLevel: 'restricted', createdDate: 'Dec 1, 2025', lastActive: '1d ago', matchId: 'DISC-2026-003', officials: ['Commissioner Park', 'VP Integrity Johnson'], rulingsPending: 0 },
  { id: 'or-6', name: 'Conference Officials HQ', type: 'officials', status: 'active', capacity: 10, currentOccupancy: 7, series: 'Conference Championship', accessLevel: 'restricted', createdDate: 'Feb 8, 2026', lastActive: '8m ago', matchId: 'CONF-2026-SF1', officials: ['Ref. Santos', 'Ref. Adams', 'Ref. Chen', 'Ref. Ivanov'], rulingsPending: 1 },
  { id: 'or-7', name: 'International Officials Coordination', type: 'officials', status: 'idle', capacity: 8, currentOccupancy: 2, series: 'International Series', accessLevel: 'restricted', createdDate: 'Jan 28, 2026', lastActive: '3h ago', matchId: 'INTL-2026-008', officials: ['Ref. Dubois', 'Ref. Nakamura'], rulingsPending: 0 },
  { id: 'or-8', name: 'Scorekeeper Operations', type: 'officials', status: 'active', capacity: 6, currentOccupancy: 4, series: 'All KaNeXT Church', accessLevel: 'staff', createdDate: 'Oct 1, 2025', lastActive: '2m ago', matchId: 'MULTI', officials: ['Scorekeeper Hall', 'Scorekeeper Reyes', 'Scorekeeper Kim'], rulingsPending: 0 },
  { id: 'or-9', name: 'Rules Committee Room', type: 'officials', status: 'locked', capacity: 12, currentOccupancy: 0, series: 'Governance', accessLevel: 'restricted', createdDate: 'Sep 15, 2025', lastActive: '5d ago', matchId: 'GOV-RULES', officials: ['Chair Wilson', 'VP Rules Okafor'], rulingsPending: 0 },
  { id: 'or-10', name: 'VAR / Tech Review Suite', type: 'officials', status: 'active', capacity: 8, currentOccupancy: 6, series: 'KaNeXT Church Championship', accessLevel: 'restricted', createdDate: 'Jan 10, 2026', lastActive: '1m ago', matchId: 'KaNeXT Church-2026-047', officials: ['Tech Lead Rivera', 'VAR Operator Shah', 'VAR Operator Burke'], rulingsPending: 2 },
];

// =============================================================================
// MOCK DATA — Media Rooms
// =============================================================================

const MEDIA_ROOMS: MediaRoom[] = [
  { id: 'mr-1', name: 'Press Room — Main Arena', type: 'media', status: 'active', capacity: 60, currentOccupancy: 42, series: 'KaNeXT Church Championship', accessLevel: 'public', createdDate: 'Jan 5, 2026', lastActive: '5m ago', pressMembers: 42, deadlineTime: '11:30 PM ET', contentType: 'Post-Match Presser' },
  { id: 'mr-2', name: 'Photo Pool — Courtside', type: 'media', status: 'active', capacity: 20, currentOccupancy: 16, series: 'KaNeXT Church Championship', accessLevel: 'staff', createdDate: 'Jan 5, 2026', lastActive: '1m ago', pressMembers: 16, deadlineTime: '10:00 PM ET', contentType: 'Photography' },
  { id: 'mr-3', name: 'K-1 Media Center', type: 'media', status: 'active', capacity: 40, currentOccupancy: 28, series: 'K-1 Grand Prix', accessLevel: 'public', createdDate: 'Nov 12, 2025', lastActive: '8m ago', pressMembers: 28, deadlineTime: '12:00 AM ET', contentType: 'Mixed Media' },
  { id: 'mr-4', name: 'Interview Room — A', type: 'media', status: 'active', capacity: 15, currentOccupancy: 8, series: 'KaNeXT Church Championship', accessLevel: 'staff', createdDate: 'Jan 8, 2026', lastActive: '20m ago', pressMembers: 8, deadlineTime: '11:00 PM ET', contentType: 'One-on-One Interview' },
  { id: 'mr-5', name: 'Interview Room — B', type: 'media', status: 'idle', capacity: 15, currentOccupancy: 0, series: 'KaNeXT Church Championship', accessLevel: 'staff', createdDate: 'Jan 8, 2026', lastActive: '1h ago', pressMembers: 0, deadlineTime: '—', contentType: 'One-on-One Interview' },
  { id: 'mr-6', name: 'Social Media Hub', type: 'media', status: 'active', capacity: 10, currentOccupancy: 7, series: 'All Competitions', accessLevel: 'staff', createdDate: 'Oct 20, 2025', lastActive: '3m ago', pressMembers: 7, deadlineTime: 'Real-Time', contentType: 'Social Content' },
  { id: 'mr-7', name: 'Statistics Bureau', type: 'media', status: 'active', capacity: 8, currentOccupancy: 6, series: 'All Competitions', accessLevel: 'staff', createdDate: 'Sep 1, 2025', lastActive: '2m ago', pressMembers: 6, deadlineTime: 'End of Quarter', contentType: 'Live Stats' },
  { id: 'mr-8', name: 'Writers Workroom — East', type: 'media', status: 'active', capacity: 30, currentOccupancy: 18, series: 'KaNeXT Church Championship', accessLevel: 'public', createdDate: 'Jan 10, 2026', lastActive: '15m ago', pressMembers: 18, deadlineTime: '11:45 PM ET', contentType: 'Written / Editorial' },
  { id: 'mr-9', name: 'Podcast Studio', type: 'media', status: 'idle', capacity: 6, currentOccupancy: 1, series: 'All Competitions', accessLevel: 'staff', createdDate: 'Nov 1, 2025', lastActive: '2h ago', pressMembers: 1, deadlineTime: '—', contentType: 'Audio / Podcast' },
  { id: 'mr-10', name: 'Documentary Crew Room', type: 'media', status: 'active', capacity: 8, currentOccupancy: 5, series: 'KaNeXT Church Championship', accessLevel: 'restricted', createdDate: 'Feb 1, 2026', lastActive: '30m ago', pressMembers: 5, deadlineTime: 'Post-Season', contentType: 'Documentary / Film' },
  { id: 'mr-11', name: 'International Press Room', type: 'media', status: 'active', capacity: 25, currentOccupancy: 14, series: 'International Series', accessLevel: 'public', createdDate: 'Jan 28, 2026', lastActive: '10m ago', pressMembers: 14, deadlineTime: '1:00 AM ET', contentType: 'Mixed Media' },
  { id: 'mr-12', name: 'Photo Editing Suite', type: 'media', status: 'active', capacity: 6, currentOccupancy: 4, series: 'All Competitions', accessLevel: 'staff', createdDate: 'Oct 15, 2025', lastActive: '18m ago', pressMembers: 4, deadlineTime: '10:30 PM ET', contentType: 'Photo Editing' },
];

// =============================================================================
// MOCK DATA — VIP Rooms
// =============================================================================

const VIP_ROOMS: VIPRoom[] = [
  { id: 'vr-1', name: 'VIP Lounge — Commissioner', type: 'vip', status: 'active', capacity: 20, currentOccupancy: 12, series: 'KaNeXT Church Championship', accessLevel: 'vip', createdDate: 'Jan 3, 2026', lastActive: '10m ago', currentGuests: ['Commissioner Park', 'VP Integrity Johnson', 'Board Chair Thompson', 'Owner — Ridgemont Crest'], seriesAffiliation: 'KaNeXT Church Championship' },
  { id: 'vr-2', name: 'VIP Lounge — Sponsors', type: 'vip', status: 'active', capacity: 30, currentOccupancy: 22, series: 'KaNeXT Church Championship', accessLevel: 'vip', createdDate: 'Jan 3, 2026', lastActive: '5m ago', currentGuests: ['Nike VP Sports Marketing', 'Gatorade Regional Dir.', 'Apple Sports Lead', 'ESPN Exec Producer'], seriesAffiliation: 'KaNeXT Church Championship' },
  { id: 'vr-3', name: 'Owner Suite — Court A', type: 'vip', status: 'active', capacity: 12, currentOccupancy: 8, series: 'KaNeXT Church Championship', accessLevel: 'restricted', createdDate: 'Jan 5, 2026', lastActive: '2m ago', currentGuests: ['Alex Morgan', 'KaNeXT Front Office', 'Guest — Mark Cuban'], seriesAffiliation: 'KaNeXT Church Championship' },
  { id: 'vr-4', name: 'Player Family Lounge', type: 'vip', status: 'active', capacity: 40, currentOccupancy: 28, series: 'KaNeXT Church Championship', accessLevel: 'vip', createdDate: 'Jan 5, 2026', lastActive: '15m ago', currentGuests: ['Player families (28 guests)'], seriesAffiliation: 'KaNeXT Church Championship' },
  { id: 'vr-5', name: 'K-1 Hospitality Suite', type: 'vip', status: 'active', capacity: 16, currentOccupancy: 10, series: 'K-1 Grand Prix', accessLevel: 'vip', createdDate: 'Nov 10, 2025', lastActive: '20m ago', currentGuests: ['K-1 President Takeda', 'Fighter Management Teams', 'Sponsor Delegates'], seriesAffiliation: 'K-1 Grand Prix' },
  { id: 'vr-6', name: 'Alumni Legacy Room', type: 'vip', status: 'idle', capacity: 20, currentOccupancy: 3, series: 'All KaNeXT Church', accessLevel: 'vip', createdDate: 'Dec 1, 2025', lastActive: '1h ago', currentGuests: ['Alumni Association President', 'Hall of Fame Rep.'], seriesAffiliation: 'All KaNeXT Church Events' },
  { id: 'vr-7', name: 'Conference Champions Lounge', type: 'vip', status: 'idle', capacity: 24, currentOccupancy: 0, series: 'Conference Championship', accessLevel: 'vip', createdDate: 'Feb 8, 2026', lastActive: '3h ago', currentGuests: [], seriesAffiliation: 'Conference Championship' },
  { id: 'vr-8', name: 'Draft Night VIP', type: 'vip', status: 'locked', capacity: 30, currentOccupancy: 0, series: 'KaNeXT Draft 2026', accessLevel: 'vip', createdDate: 'Dec 20, 2025', lastActive: '10d ago', currentGuests: [], seriesAffiliation: 'KaNeXT Draft 2026' },
  { id: 'vr-9', name: 'International Dignitaries Suite', type: 'vip', status: 'active', capacity: 12, currentOccupancy: 7, series: 'International Series', accessLevel: 'restricted', createdDate: 'Jan 28, 2026', lastActive: '25m ago', currentGuests: ['FIBA Delegate', 'Olympic Committee Rep.', 'Cultural Attache'], seriesAffiliation: 'International Series' },
  { id: 'vr-10', name: 'Luxury Box — Section 100', type: 'vip', status: 'active', capacity: 16, currentOccupancy: 14, series: 'KaNeXT Church Championship', accessLevel: 'vip', createdDate: 'Jan 5, 2026', lastActive: '8m ago', currentGuests: ['Corporate Group A (14)'], seriesAffiliation: 'KaNeXT Church Championship' },
];

// =============================================================================
// MOCK DATA — Operations Rooms
// =============================================================================

const OPS_ROOMS: OpsRoom[] = [
  { id: 'opr-1', name: 'Ops Command Center', type: 'operations', status: 'active', capacity: 15, currentOccupancy: 11, series: 'All Events', accessLevel: 'staff', createdDate: 'Sep 1, 2025', lastActive: '1m ago', activeTasks: 14, personnelCount: 11, priority: 'critical' },
  { id: 'opr-2', name: 'Venue Security Hub', type: 'operations', status: 'active', capacity: 10, currentOccupancy: 8, series: 'KaNeXT Church Championship', accessLevel: 'restricted', createdDate: 'Jan 5, 2026', lastActive: '3m ago', activeTasks: 8, personnelCount: 8, priority: 'high' },
  { id: 'opr-3', name: 'Logistics Coordination', type: 'operations', status: 'active', capacity: 12, currentOccupancy: 7, series: 'All Events', accessLevel: 'staff', createdDate: 'Oct 1, 2025', lastActive: '10m ago', activeTasks: 11, personnelCount: 7, priority: 'normal' },
  { id: 'opr-4', name: 'Medical / Training Room Ops', type: 'operations', status: 'active', capacity: 8, currentOccupancy: 5, series: 'KaNeXT Church Championship', accessLevel: 'restricted', createdDate: 'Jan 5, 2026', lastActive: '5m ago', activeTasks: 4, personnelCount: 5, priority: 'high' },
  { id: 'opr-5', name: 'Catering / Hospitality Ops', type: 'operations', status: 'active', capacity: 10, currentOccupancy: 6, series: 'All Events', accessLevel: 'staff', createdDate: 'Oct 15, 2025', lastActive: '20m ago', activeTasks: 6, personnelCount: 6, priority: 'normal' },
  { id: 'opr-6', name: 'IT / AV Infrastructure', type: 'operations', status: 'active', capacity: 8, currentOccupancy: 5, series: 'All Events', accessLevel: 'restricted', createdDate: 'Sep 15, 2025', lastActive: '8m ago', activeTasks: 9, personnelCount: 5, priority: 'high' },
  { id: 'opr-7', name: 'Ticketing Operations', type: 'operations', status: 'active', capacity: 6, currentOccupancy: 4, series: 'KaNeXT Church Championship', accessLevel: 'staff', createdDate: 'Jan 3, 2026', lastActive: '15m ago', activeTasks: 3, personnelCount: 4, priority: 'normal' },
  { id: 'opr-8', name: 'Transportation Hub', type: 'operations', status: 'idle', capacity: 6, currentOccupancy: 1, series: 'All Events', accessLevel: 'staff', createdDate: 'Oct 1, 2025', lastActive: '2h ago', activeTasks: 2, personnelCount: 1, priority: 'low' },
  { id: 'opr-9', name: 'Event Setup / Teardown', type: 'operations', status: 'idle', capacity: 10, currentOccupancy: 0, series: 'KaNeXT Church Championship', accessLevel: 'staff', createdDate: 'Jan 10, 2026', lastActive: '6h ago', activeTasks: 5, personnelCount: 0, priority: 'normal' },
  { id: 'opr-10', name: 'Emergency Response Center', type: 'operations', status: 'active', capacity: 8, currentOccupancy: 4, series: 'All Events', accessLevel: 'restricted', createdDate: 'Sep 1, 2025', lastActive: '2m ago', activeTasks: 1, personnelCount: 4, priority: 'critical' },
  { id: 'opr-11', name: 'Volunteer Coordination', type: 'operations', status: 'active', capacity: 8, currentOccupancy: 3, series: 'KaNeXT Church Championship', accessLevel: 'staff', createdDate: 'Feb 1, 2026', lastActive: '30m ago', activeTasks: 7, personnelCount: 3, priority: 'normal' },
  { id: 'opr-12', name: 'Merchandise / Retail Ops', type: 'operations', status: 'active', capacity: 6, currentOccupancy: 4, series: 'All Events', accessLevel: 'staff', createdDate: 'Oct 20, 2025', lastActive: '12m ago', activeTasks: 3, personnelCount: 4, priority: 'low' },
];

// =============================================================================
// MOCK DATA — Archived Rooms
// =============================================================================

const ARCHIVED_ROOMS: ArchivedRoom[] = [
  { id: 'ar-1', name: 'Pre-Season Exhibition War Room', type: 'war-room', status: 'archived', capacity: 8, currentOccupancy: 0, series: 'Pre-Season Exhibition', accessLevel: 'staff', createdDate: 'Oct 1, 2025', lastActive: '45d ago', totalMessages: 342, totalFiles: 28, archivedDate: 'Nov 15, 2025' },
  { id: 'ar-2', name: 'Draft Combine Broadcast', type: 'broadcast', status: 'archived', capacity: 12, currentOccupancy: 0, series: 'KaNeXT Combine 2025', accessLevel: 'staff', createdDate: 'Sep 5, 2025', lastActive: '60d ago', totalMessages: 189, totalFiles: 45, archivedDate: 'Oct 20, 2025' },
  { id: 'ar-3', name: 'Opening Night Officials', type: 'officials', status: 'archived', capacity: 8, currentOccupancy: 0, series: 'Opening Night', accessLevel: 'restricted', createdDate: 'Oct 15, 2025', lastActive: '90d ago', totalMessages: 87, totalFiles: 12, archivedDate: 'Nov 1, 2025' },
  { id: 'ar-4', name: 'Pre-Season Press Room', type: 'media', status: 'archived', capacity: 40, currentOccupancy: 0, series: 'Pre-Season', accessLevel: 'public', createdDate: 'Sep 20, 2025', lastActive: '75d ago', totalMessages: 456, totalFiles: 67, archivedDate: 'Oct 30, 2025' },
  { id: 'ar-5', name: 'VIP Opening Gala', type: 'vip', status: 'archived', capacity: 50, currentOccupancy: 0, series: 'Season Opener', accessLevel: 'vip', createdDate: 'Oct 10, 2025', lastActive: '80d ago', totalMessages: 124, totalFiles: 15, archivedDate: 'Oct 25, 2025' },
  { id: 'ar-6', name: 'Holiday Tournament Ops', type: 'operations', status: 'archived', capacity: 12, currentOccupancy: 0, series: 'Holiday Tournament', accessLevel: 'staff', createdDate: 'Dec 15, 2025', lastActive: '40d ago', totalMessages: 278, totalFiles: 34, archivedDate: 'Jan 5, 2026' },
  { id: 'ar-7', name: 'All-Star Voting War Room', type: 'war-room', status: 'archived', capacity: 6, currentOccupancy: 0, series: 'All-Star Weekend', accessLevel: 'restricted', createdDate: 'Dec 1, 2025', lastActive: '30d ago', totalMessages: 156, totalFiles: 8, archivedDate: 'Jan 15, 2026' },
  { id: 'ar-8', name: 'Season Kickoff Broadcast', type: 'broadcast', status: 'archived', capacity: 20, currentOccupancy: 0, series: 'Season Opener', accessLevel: 'staff', createdDate: 'Oct 10, 2025', lastActive: '85d ago', totalMessages: 234, totalFiles: 56, archivedDate: 'Oct 25, 2025' },
  { id: 'ar-9', name: 'Thanksgiving Classic Press', type: 'media', status: 'archived', capacity: 35, currentOccupancy: 0, series: 'Thanksgiving Classic', accessLevel: 'public', createdDate: 'Nov 20, 2025', lastActive: '55d ago', totalMessages: 312, totalFiles: 41, archivedDate: 'Dec 1, 2025' },
  { id: 'ar-10', name: 'New Year Invitational Ops', type: 'operations', status: 'archived', capacity: 10, currentOccupancy: 0, series: 'New Year Invitational', accessLevel: 'staff', createdDate: 'Dec 28, 2025', lastActive: '35d ago', totalMessages: 198, totalFiles: 22, archivedDate: 'Jan 8, 2026' },
];

// =============================================================================
// MOCK DATA — Analytics
// =============================================================================

const ANALYTICS_STATS: AnalyticsStatCard[] = [
  { id: 'as-1', label: 'Avg. Daily Active Rooms', value: '14.2', change: '+2.1', changeDirection: 'up', icon: 'rectangle.stack.fill', color: '#1D9BF0' },
  { id: 'as-2', label: 'Peak Concurrent Users', value: '189', change: '+34', changeDirection: 'up', icon: 'person.3.fill', color: '#22C55E' },
  { id: 'as-3', label: 'Avg. Session Duration', value: '2h 14m', change: '+18m', changeDirection: 'up', icon: 'clock.fill', color: '#F59E0B' },
  { id: 'as-4', label: 'Total Broadcast Hours', value: '126.5', change: '+12.3', changeDirection: 'up', icon: 'antenna.radiowaves.left.and.right', color: '#EF4444' },
  { id: 'as-5', label: 'Messages This Week', value: '5,842', change: '+18%', changeDirection: 'up', icon: 'bubble.left.and.bubble.right.fill', color: '#FFFFFF' },
  { id: 'as-6', label: 'Files Shared', value: '347', change: '-12', changeDirection: 'down', icon: 'doc.fill', color: '#1D9BF0' },
  { id: 'as-7', label: 'Avg. Occupancy Rate', value: '68%', change: '+5%', changeDirection: 'up', icon: 'chart.bar.fill', color: '#22C55E' },
  { id: 'as-8', label: 'Rooms Archived (30d)', value: '6', change: '-2', changeDirection: 'down', icon: 'archivebox.fill', color: '#A1A1AA' },
];

const OCCUPANCY_TRENDS: RoomAnalytic[] = [
  { id: 'ot-1', roomId: 'wr-1', metric: 'Avg Occupancy', value: '78%', period: 'Last 7d' },
  { id: 'ot-2', roomId: 'br-1', metric: 'Avg Occupancy', value: '85%', period: 'Last 7d' },
  { id: 'ot-3', roomId: 'or-3', metric: 'Avg Occupancy', value: '71%', period: 'Last 7d' },
  { id: 'ot-4', roomId: 'mr-1', metric: 'Avg Occupancy', value: '62%', period: 'Last 7d' },
  { id: 'ot-5', roomId: 'vr-1', metric: 'Avg Occupancy', value: '55%', period: 'Last 7d' },
  { id: 'ot-6', roomId: 'opr-1', metric: 'Avg Occupancy', value: '82%', period: 'Last 7d' },
  { id: 'ot-7', roomId: 'wr-6', metric: 'Avg Occupancy', value: '74%', period: 'Last 7d' },
  { id: 'ot-8', roomId: 'br-5', metric: 'Avg Occupancy', value: '69%', period: 'Last 7d' },
  { id: 'ot-9', roomId: 'mr-6', metric: 'Avg Occupancy', value: '80%', period: 'Last 7d' },
  { id: 'ot-10', roomId: 'opr-2', metric: 'Avg Occupancy', value: '76%', period: 'Last 7d' },
];

const PEAK_HOURS: RoomAnalytic[] = [
  { id: 'ph-1', roomId: 'all', metric: 'Peak Hour (Mon)', value: '7 PM', period: 'This Week' },
  { id: 'ph-2', roomId: 'all', metric: 'Peak Hour (Tue)', value: '8 PM', period: 'This Week' },
  { id: 'ph-3', roomId: 'all', metric: 'Peak Hour (Wed)', value: '7 PM', period: 'This Week' },
  { id: 'ph-4', roomId: 'all', metric: 'Peak Hour (Thu)', value: '9 PM', period: 'This Week' },
  { id: 'ph-5', roomId: 'all', metric: 'Peak Hour (Fri)', value: '8 PM', period: 'This Week' },
  { id: 'ph-6', roomId: 'all', metric: 'Peak Hour (Sat)', value: '6 PM', period: 'This Week' },
  { id: 'ph-7', roomId: 'all', metric: 'Peak Hour (Sun)', value: '5 PM', period: 'This Week' },
];

// =============================================================================
// MOCK DATA — Room Messages (for detail sheets)
// =============================================================================

const ROOM_MESSAGES: RoomMessage[] = [
  { id: 'rm-1', roomId: 'wr-1', sender: 'Alex Morgan', text: 'Updated defensive scheme for second half adjustments. Review the clip reel.', timestamp: Date.now() - 120000, pinned: true },
  { id: 'rm-2', roomId: 'wr-1', sender: 'Mike Torres', text: 'Scouting report uploaded. Opponent FG% drops 8% in transition defense.', timestamp: Date.now() - 300000, pinned: false },
  { id: 'rm-3', roomId: 'wr-1', sender: 'Coach Anderson', text: 'Confirmed: Zone press in Q4 if deficit > 8.', timestamp: Date.now() - 600000, pinned: true },
  { id: 'rm-4', roomId: 'br-1', sender: 'Jordan Ellis', text: 'Camera 2 angle adjusted. Feed looks clean.', timestamp: Date.now() - 180000, pinned: false },
  { id: 'rm-5', roomId: 'br-1', sender: 'Lisa Grant', text: 'Graphics package loaded for halftime. Sponsor overlays confirmed.', timestamp: Date.now() - 420000, pinned: false },
  { id: 'rm-6', roomId: 'or-1', sender: 'Ref. Williams', text: 'Ruling on play 47: Offensive foul confirmed. Review complete.', timestamp: Date.now() - 240000, pinned: true },
  { id: 'rm-7', roomId: 'mr-1', sender: 'Media Ops', text: 'Coach presser in 15 minutes. Room A open for seating.', timestamp: Date.now() - 900000, pinned: false },
  { id: 'rm-8', roomId: 'vr-1', sender: 'Event Services', text: 'Halftime catering refreshed. Bar service continues through Q4.', timestamp: Date.now() - 1800000, pinned: false },
  { id: 'rm-9', roomId: 'opr-1', sender: 'Chris Rivera', text: 'Venue setup complete for courts A and B. Sound check passed.', timestamp: Date.now() - 3600000, pinned: false },
  { id: 'rm-10', roomId: 'wr-1', sender: 'Analytics Team', text: 'Live KR updated. Opponent cluster weakness in Playmaking confirmed.', timestamp: Date.now() - 480000, pinned: false },
];

// =============================================================================
// MOCK DATA — Room Files
// =============================================================================

const ROOM_FILES: RoomFile[] = [
  { id: 'rf-1', roomId: 'wr-1', name: 'Scouting Report — Opponent.pdf', type: 'document', size: '2.4 MB', uploadedBy: 'Mike Torres', uploadedDate: 'Feb 15, 2026' },
  { id: 'rf-2', roomId: 'wr-1', name: 'Defensive Schemes v3.xlsx', type: 'spreadsheet', size: '1.1 MB', uploadedBy: 'Coach Anderson', uploadedDate: 'Feb 14, 2026' },
  { id: 'rf-3', roomId: 'br-1', name: 'Graphics Package — Finals.zip', type: 'document', size: '45.2 MB', uploadedBy: 'Lisa Grant', uploadedDate: 'Feb 12, 2026' },
  { id: 'rf-4', roomId: 'br-1', name: 'Camera Layout Map.png', type: 'image', size: '3.8 MB', uploadedBy: 'Jordan Ellis', uploadedDate: 'Feb 10, 2026' },
  { id: 'rf-5', roomId: 'or-1', name: 'Rulebook Addendum — 2026.pdf', type: 'document', size: '890 KB', uploadedBy: 'Ref. Williams', uploadedDate: 'Jan 20, 2026' },
  { id: 'rf-6', roomId: 'mr-1', name: 'Media Credentials List.xlsx', type: 'spreadsheet', size: '420 KB', uploadedBy: 'Media Ops', uploadedDate: 'Feb 13, 2026' },
  { id: 'rf-7', roomId: 'vr-1', name: 'Guest List — Championship Night.xlsx', type: 'spreadsheet', size: '180 KB', uploadedBy: 'Event Services', uploadedDate: 'Feb 14, 2026' },
  { id: 'rf-8', roomId: 'opr-1', name: 'Venue Setup Checklist.pdf', type: 'document', size: '1.5 MB', uploadedBy: 'Chris Rivera', uploadedDate: 'Feb 11, 2026' },
  { id: 'rf-9', roomId: 'wr-1', name: 'Halftime Adjustments Clip Reel.mp4', type: 'video', size: '128 MB', uploadedBy: 'Film Room', uploadedDate: 'Feb 15, 2026' },
  { id: 'rf-10', roomId: 'br-1', name: 'Sponsor Overlay Assets.zip', type: 'image', size: '22.5 MB', uploadedBy: 'Marketing Team', uploadedDate: 'Feb 8, 2026' },
];

// =============================================================================
// MOCK DATA — Room Settings
// =============================================================================

const ROOM_SETTINGS: RoomSettingToggle[] = [
  { id: 'rs-1', label: 'Auto-archive inactive rooms', description: 'Rooms idle for 30+ days are automatically archived', enabled: true },
  { id: 'rs-2', label: 'Default access level: Staff', description: 'New rooms default to staff-level access', enabled: true },
  { id: 'rs-3', label: 'Notification on room creation', description: 'Admins notified when new rooms are created', enabled: true },
  { id: 'rs-4', label: 'Broadcast auto-record', description: 'Automatically record all live broadcast streams', enabled: false },
  { id: 'rs-5', label: 'Require approval for VIP rooms', description: 'VIP room creation requires admin approval', enabled: true },
  { id: 'rs-6', label: 'Pin limit per room', description: 'Limit pinned messages to 5 per room', enabled: false },
  { id: 'rs-7', label: 'Auto-lock after event', description: 'Rooms auto-lock 2 hours after associated event ends', enabled: true },
  { id: 'rs-8', label: 'File upload size limit', description: 'Limit uploads to 200 MB per file', enabled: true },
  { id: 'rs-9', label: 'Guest access expiration', description: 'Guest access expires after 24 hours', enabled: true },
  { id: 'rs-10', label: 'Activity log retention', description: 'Retain activity logs for 90 days', enabled: true },
  { id: 'rs-11', label: 'Enable room analytics', description: 'Track room usage metrics and generate reports', enabled: true },
  { id: 'rs-12', label: 'Dark mode for broadcast overlay', description: 'Use dark theme for broadcast control overlays', enabled: false },
];

// =============================================================================
// DATA ACCESS — getCompRoomsData
// =============================================================================

export interface CompRoomsData {
  dashboard: RoomsDashboardBlock[];
  activityFeed: RoomActivityItem[];
  warRooms: CompRoom[];
  broadcastRooms: BroadcastRoom[];
  officialRooms: OfficialRoom[];
  mediaRooms: MediaRoom[];
  vipRooms: VIPRoom[];
  opsRooms: OpsRoom[];
  archivedRooms: ArchivedRoom[];
  analyticsStats: AnalyticsStatCard[];
  occupancyTrends: RoomAnalytic[];
  peakHours: RoomAnalytic[];
  messages: RoomMessage[];
  files: RoomFile[];
  settings: RoomSettingToggle[];
}

export function getCompRoomsData(scope: string): CompRoomsData {
  let warRooms = WAR_ROOMS;
  let broadcastRooms = BROADCAST_ROOMS;
  let officialRooms = OFFICIAL_ROOMS;
  let mediaRooms = MEDIA_ROOMS;
  let vipRooms = VIP_ROOMS;
  let opsRooms = OPS_ROOMS;
  let archivedRooms = ARCHIVED_ROOMS;

  // Filter by scope chip
  if (scope === 'War Rooms') {
    broadcastRooms = [];
    officialRooms = [];
    mediaRooms = [];
    vipRooms = [];
  } else if (scope === 'Broadcast') {
    warRooms = [];
    officialRooms = [];
    mediaRooms = [];
    vipRooms = [];
  } else if (scope === 'Officials') {
    warRooms = [];
    broadcastRooms = [];
    mediaRooms = [];
    vipRooms = [];
  } else if (scope === 'Media') {
    warRooms = [];
    broadcastRooms = [];
    officialRooms = [];
    vipRooms = [];
  } else if (scope === 'VIP') {
    warRooms = [];
    broadcastRooms = [];
    officialRooms = [];
    mediaRooms = [];
  }

  return {
    dashboard: DASHBOARD_BLOCKS,
    activityFeed: ACTIVITY_FEED,
    warRooms,
    broadcastRooms,
    officialRooms,
    mediaRooms,
    vipRooms,
    opsRooms,
    archivedRooms,
    analyticsStats: ANALYTICS_STATS,
    occupancyTrends: OCCUPANCY_TRENDS,
    peakHours: PEAK_HOURS,
    messages: ROOM_MESSAGES,
    files: ROOM_FILES,
    settings: ROOM_SETTINGS,
  };
}

// =============================================================================
// HELPERS
// =============================================================================

export function formatTimestamp(ms: number): string {
  const now = Date.now();
  const diff = now - ms;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  const d = new Date(ms);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getOccupancyPercent(current: number, capacity: number): number {
  if (capacity === 0) return 0;
  return Math.round((current / capacity) * 100);
}

export function getOccupancyColor(percent: number): string {
  if (percent >= 80) return '#EF4444';
  if (percent >= 60) return '#F59E0B';
  return '#22C55E';
}
