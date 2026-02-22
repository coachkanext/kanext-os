/**
 * Mock data for Competition Mode — Series v2.
 * Leagues, tournaments, showcases, and circuits for community competition.
 */

// =============================================================================
// TYPES
// =============================================================================

export type SeriesType = 'league' | 'tournament' | 'showcase' | 'circuit';

export type SeriesLevel = 'prep' | 'college' | 'international' | 'pro' | 'mixed';

export type SeriesStatus = 'upcoming' | 'live' | 'in-progress' | 'completed' | 'archived';

export interface SeriesScopeChip {
  key: string;
  label: string;
}

export interface SeriesStaff {
  id: string;
  name: string;
  initials: string;
  role: string;
  avatarColor: string;
}

export interface SeriesVenue {
  id: string;
  seriesId: string;
  name: string;
  location: string;
  courts: number;
  capacity: number;
}

export interface SeriesParticipant {
  id: string;
  seriesId: string;
  name: string;
  shortName: string;
  seed?: number;
  wins: number;
  losses: number;
  avatarColor: string;
}

export interface SeriesGame {
  id: string;
  seriesId: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  court?: string;
  stage: string;
  status: 'scheduled' | 'live' | 'final';
  homeScore?: number;
  awayScore?: number;
}

export interface SeriesRoom {
  id: string;
  seriesId: string;
  title: string;
  icon: string;
  memberCount: number;
  unreadCount: number;
}

export interface SeriesAuditEntry {
  id: string;
  seriesId: string;
  action: string;
  actor: string;
  timestamp: string;
  timestampMs: number;
  description: string;
}

export interface SeriesFull {
  id: string;
  competitionOrgId: string;
  name: string;
  shortName: string;
  logo?: string;
  type: SeriesType;
  level: SeriesLevel;
  status: SeriesStatus;
  seasonWindow: { start: string; end: string };
  description: string;
  currentStageLine: string;
  opsDirector: SeriesStaff;
  staffCount: number;
  teamCount: number;
  gameCount: number;
  avatarColor: string;
  compliancePulse?: string;
  hasOpsRoom: boolean;
  hasMediaRoom: boolean;
  createdAt: string;
  lastActivityAt: string;
  lastActivityMs: number;
}

export type SeriesHubTabId =
  | 'overview' | 'schedule' | 'standings' | 'bracket-stages'
  | 'participants' | 'venues' | 'staff' | 'rooms'
  | 'operations' | 'finance' | 'payment-rails' | 'compliance'
  | 'media' | 'reports' | 'audit' | 'settings';

export interface SeriesHubTab {
  id: SeriesHubTabId;
  label: string;
}

export interface SeriesFilterState {
  types: SeriesType[];
  levels: SeriesLevel[];
  statuses: SeriesStatus[];
  sort: 'upcoming' | 'recent' | 'watched' | 'az';
}

export interface CreateSeriesDefaults {
  opsRoom: boolean;
  officialsRoom: boolean;
  mediaRoom: boolean;
  teamRepsRoom: boolean;
  venueOpsRoom: boolean;
  complianceTemplate: boolean;
  paymentRailsScope: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const SERIES_SCOPE_CHIPS: SeriesScopeChip[] = [
  { key: 'all', label: 'All Series' },
  { key: 'my', label: 'My Series' },
  { key: 'following', label: 'Following' },
];

export const SERIES_HUB_TABS: SeriesHubTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'standings', label: 'Standings' },
  { id: 'bracket-stages', label: 'Bracket / Stages' },
  { id: 'participants', label: 'Participants' },
  { id: 'venues', label: 'Venues' },
  { id: 'staff', label: 'Staff' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'operations', label: 'Operations' },
  { id: 'finance', label: 'Finance' },
  { id: 'payment-rails', label: 'Payment Rails' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'media', label: 'Media' },
  { id: 'reports', label: 'Reports' },
  { id: 'audit', label: 'Audit' },
  { id: 'settings', label: 'Settings' },
];

export const STATUS_COLOR_MAP: Record<SeriesStatus, string> = {
  upcoming: '#6AA9FF',
  live: '#EF4444',
  'in-progress': '#22C55E',
  completed: '#8F8F8F',
  archived: '#64748B',
};

export const TYPE_ICON_MAP: Record<SeriesType, string> = {
  league: 'trophy.fill',
  tournament: 'sportscourt.fill',
  showcase: 'star.fill',
  circuit: 'map.fill',
};

export const TYPE_COLOR_MAP: Record<SeriesType, string> = {
  league: '#F59E0B',
  tournament: '#EF4444',
  showcase: '#7A5CFF',
  circuit: '#14B8A6',
};

export const LEVEL_COLOR_MAP: Record<SeriesLevel, string> = {
  prep: '#6AA9FF',
  college: '#22C55E',
  international: '#F59E0B',
  pro: '#EF4444',
  mixed: '#8F8F8F',
};

export const CREATE_DEFAULTS: CreateSeriesDefaults = {
  opsRoom: true,
  officialsRoom: true,
  mediaRoom: true,
  teamRepsRoom: true,
  venueOpsRoom: true,
  complianceTemplate: true,
  paymentRailsScope: true,
};

// =============================================================================
// SERIES STAFF
// =============================================================================

export const SERIES_STAFF: SeriesStaff[] = [
  { id: 'staff-1', name: 'Marcus Langford', initials: 'ML', role: 'Ops Director', avatarColor: '#1B4F8A' },
  { id: 'staff-2', name: 'Denise Brooks', initials: 'DB', role: 'Head Official', avatarColor: '#EF4444' },
  { id: 'staff-3', name: 'Carlos Rivera', initials: 'CR', role: 'Media Coordinator', avatarColor: '#7A5CFF' },
  { id: 'staff-4', name: 'Tanya Osei', initials: 'TO', role: 'Venue Rep', avatarColor: '#22C55E' },
  { id: 'staff-5', name: 'Jerome Wallace', initials: 'JW', role: 'Ops Director', avatarColor: '#F59E0B' },
  { id: 'staff-6', name: 'Lisa Chen', initials: 'LC', role: 'Team Rep', avatarColor: '#14B8A6' },
  { id: 'staff-7', name: 'David Okonkwo', initials: 'DO', role: 'Head Official', avatarColor: '#C2185B' },
  { id: 'staff-8', name: 'Kendra Phillips', initials: 'KP', role: 'Media Coordinator', avatarColor: '#6AA9FF' },
  { id: 'staff-9', name: 'Ray Santana', initials: 'RS', role: 'Venue Rep', avatarColor: '#8B5CF6' },
  { id: 'staff-10', name: 'Aisha Mitchell', initials: 'AM', role: 'Team Rep', avatarColor: '#F59E0B' },
];

// =============================================================================
// SERIES LIST
// =============================================================================

export const SERIES_LIST: SeriesFull[] = [
  {
    id: 'series-mlk-classic',
    competitionOrgId: 'org-south-florida-hoops',
    name: 'MLK Classic 2026',
    shortName: 'MLK Classic',
    type: 'tournament',
    level: 'college',
    status: 'live',
    seasonWindow: { start: '2026-01-18', end: '2026-01-20' },
    description: 'Annual Martin Luther King Jr. weekend basketball tournament featuring 8 NAIA programs across 3 days of competitive play.',
    currentStageLine: 'Semifinals \u00B7 Bracket live',
    opsDirector: SERIES_STAFF[0],
    staffCount: 3,
    teamCount: 8,
    gameCount: 12,
    avatarColor: '#EF4444',
    compliancePulse: 'Uploads: 100% on-time',
    hasOpsRoom: true,
    hasMediaRoom: true,
    createdAt: '2025-10-15T09:00:00Z',
    lastActivityAt: '2026-01-19T16:42:00Z',
    lastActivityMs: 1737305520000,
  },
  {
    id: 'series-fmu-conference',
    competitionOrgId: 'org-kx-conference',
    name: 'KaNeXT Conference League',
    shortName: 'KaNeXT Conf',
    type: 'league',
    level: 'college',
    status: 'in-progress',
    seasonWindow: { start: '2025-11-01', end: '2026-03-07' },
    description: 'KaNeXT Conference regular season league play. 10 teams compete in a round-robin format for conference tournament seeding.',
    currentStageLine: 'Week 12 \u00B7 Standings live',
    opsDirector: SERIES_STAFF[4],
    staffCount: 5,
    teamCount: 10,
    gameCount: 45,
    avatarColor: '#1B4F8A',
    compliancePulse: 'Uploads: 92% on-time',
    hasOpsRoom: true,
    hasMediaRoom: true,
    createdAt: '2025-08-20T12:00:00Z',
    lastActivityAt: '2026-02-15T21:30:00Z',
    lastActivityMs: 1739656200000,
  },
  {
    id: 'series-sfp-showcase',
    competitionOrgId: 'org-south-florida-hoops',
    name: 'South Ridgemont Prep Showcase',
    shortName: 'SFL Prep',
    type: 'showcase',
    level: 'prep',
    status: 'upcoming',
    seasonWindow: { start: '2026-03-14', end: '2026-03-15' },
    description: 'Two-day showcase event for South Ridgemont high school programs. College scouts and media in attendance. 24 team slots available.',
    currentStageLine: 'Registration open \u00B7 24 slots',
    opsDirector: SERIES_STAFF[0],
    staffCount: 4,
    teamCount: 24,
    gameCount: 36,
    avatarColor: '#7A5CFF',
    hasOpsRoom: true,
    hasMediaRoom: false,
    createdAt: '2025-12-01T10:00:00Z',
    lastActivityAt: '2026-02-10T14:15:00Z',
    lastActivityMs: 1739197500000,
  },
  {
    id: 'series-se-circuit',
    competitionOrgId: 'org-southeast-aau',
    name: 'Southeast Circuit Tour',
    shortName: 'SE Circuit',
    type: 'circuit',
    level: 'mixed',
    status: 'in-progress',
    seasonWindow: { start: '2026-01-10', end: '2026-06-28' },
    description: 'Six-stop circuit tour through the Southeast. Teams accumulate points across stops for end-of-circuit seeding and invitational bids.',
    currentStageLine: 'Stop #3 \u00B7 Atlanta',
    opsDirector: SERIES_STAFF[4],
    staffCount: 3,
    teamCount: 16,
    gameCount: 30,
    avatarColor: '#14B8A6',
    compliancePulse: 'Uploads: 88% on-time',
    hasOpsRoom: true,
    hasMediaRoom: true,
    createdAt: '2025-11-05T08:00:00Z',
    lastActivityAt: '2026-02-14T19:00:00Z',
    lastActivityMs: 1739560800000,
  },
  {
    id: 'series-summer-inv',
    competitionOrgId: 'org-south-florida-hoops',
    name: 'Summer Invitational 2026',
    shortName: 'Summer Inv',
    type: 'tournament',
    level: 'college',
    status: 'upcoming',
    seasonWindow: { start: '2026-06-12', end: '2026-06-14' },
    description: 'Offseason invitational tournament for 16 NAIA and Division II programs. Bracket TBD pending registration close.',
    currentStageLine: 'Planning \u00B7 Bracket TBD',
    opsDirector: SERIES_STAFF[0],
    staffCount: 2,
    teamCount: 16,
    gameCount: 0,
    avatarColor: '#F59E0B',
    hasOpsRoom: false,
    hasMediaRoom: false,
    createdAt: '2026-01-15T11:00:00Z',
    lastActivityAt: '2026-02-05T10:30:00Z',
    lastActivityMs: 1738750200000,
  },
];

// =============================================================================
// SERIES PARTICIPANTS (KaNeXT Conference League)
// =============================================================================

export const SERIES_PARTICIPANTS: SeriesParticipant[] = [
  { id: 'part-fmu', seriesId: 'series-fmu-conference', name: 'KaNeXT Sports Lions', shortName: 'KaNeXT', seed: 3, wins: 8, losses: 4, avatarColor: '#1B4F8A' },
  { id: 'part-bcu', seriesId: 'series-fmu-conference', name: 'Bethune-Cookman Wildcats', shortName: 'BCU', seed: 1, wins: 10, losses: 2, avatarColor: '#8B0000' },
  { id: 'part-ewc', seriesId: 'series-fmu-conference', name: 'Edward Waters Tigers', shortName: 'EWC', seed: 5, wins: 6, losses: 6, avatarColor: '#7A5CFF' },
  { id: 'part-warner', seriesId: 'series-fmu-conference', name: 'Warner Royals', shortName: 'WRN', seed: 4, wins: 7, losses: 5, avatarColor: '#22C55E' },
  { id: 'part-ave', seriesId: 'series-fmu-conference', name: 'Ave Maria Gyrenes', shortName: 'AVE', seed: 6, wins: 5, losses: 7, avatarColor: '#F59E0B' },
  { id: 'part-webber', seriesId: 'series-fmu-conference', name: 'Webber Warriors', shortName: 'WEB', seed: 7, wins: 4, losses: 8, avatarColor: '#EF4444' },
  { id: 'part-seu', seriesId: 'series-fmu-conference', name: 'Southeastern Fire', shortName: 'SEU', seed: 2, wins: 9, losses: 3, avatarColor: '#C2185B' },
  { id: 'part-keiser', seriesId: 'series-fmu-conference', name: 'Keiser Seahawks', shortName: 'KSR', seed: 8, wins: 3, losses: 9, avatarColor: '#14B8A6' },
  { id: 'part-thomas', seriesId: 'series-fmu-conference', name: 'Thomas University Night Hawks', shortName: 'TNU', seed: 9, wins: 2, losses: 10, avatarColor: '#64748B' },
  { id: 'part-johnson', seriesId: 'series-fmu-conference', name: 'Johnson University Royals', shortName: 'JHN', seed: 10, wins: 1, losses: 11, avatarColor: '#6AA9FF' },
];

// =============================================================================
// SERIES GAMES
// =============================================================================

export const SERIES_GAMES: SeriesGame[] = [
  // MLK Classic — tournament bracket
  { id: 'game-mlk-1', seriesId: 'series-mlk-classic', homeTeam: 'KaNeXT', awayTeam: 'Warner Royals', date: '2026-01-18', time: '12:00 PM', venue: 'KaNeXT Gymnasium', court: 'Main Court', stage: 'Quarterfinal', status: 'final', homeScore: 78, awayScore: 65 },
  { id: 'game-mlk-2', seriesId: 'series-mlk-classic', homeTeam: 'BCU Wildcats', awayTeam: 'Keiser Seahawks', date: '2026-01-18', time: '2:30 PM', venue: 'KaNeXT Gymnasium', court: 'Main Court', stage: 'Quarterfinal', status: 'final', homeScore: 82, awayScore: 70 },
  { id: 'game-mlk-3', seriesId: 'series-mlk-classic', homeTeam: 'SEU Fire', awayTeam: 'Ave Maria Gyrenes', date: '2026-01-18', time: '5:00 PM', venue: 'KaNeXT Gymnasium', court: 'Main Court', stage: 'Quarterfinal', status: 'final', homeScore: 74, awayScore: 68 },
  { id: 'game-mlk-4', seriesId: 'series-mlk-classic', homeTeam: 'EWC Tigers', awayTeam: 'Webber Warriors', date: '2026-01-18', time: '7:30 PM', venue: 'KaNeXT Gymnasium', court: 'Main Court', stage: 'Quarterfinal', status: 'final', homeScore: 71, awayScore: 66 },
  { id: 'game-mlk-5', seriesId: 'series-mlk-classic', homeTeam: 'KaNeXT', awayTeam: 'BCU Wildcats', date: '2026-01-19', time: '3:00 PM', venue: 'KaNeXT Gymnasium', court: 'Main Court', stage: 'Semifinal', status: 'live', homeScore: 38, awayScore: 35 },
  { id: 'game-mlk-6', seriesId: 'series-mlk-classic', homeTeam: 'SEU Fire', awayTeam: 'EWC Tigers', date: '2026-01-19', time: '5:30 PM', venue: 'KaNeXT Gymnasium', court: 'Main Court', stage: 'Semifinal', status: 'scheduled' },

  // KaNeXT Conference League — regular season
  { id: 'game-conf-1', seriesId: 'series-fmu-conference', homeTeam: 'KaNeXT', awayTeam: 'Webber Warriors', date: '2026-02-18', time: '7:00 PM', venue: 'KaNeXT Gymnasium', stage: 'Week 12', status: 'scheduled' },
  { id: 'game-conf-2', seriesId: 'series-fmu-conference', homeTeam: 'BCU Wildcats', awayTeam: 'SEU Fire', date: '2026-02-18', time: '7:30 PM', venue: 'Moore Gymnasium', stage: 'Week 12', status: 'scheduled' },
  { id: 'game-conf-3', seriesId: 'series-fmu-conference', homeTeam: 'KaNeXT', awayTeam: 'Ave Maria Gyrenes', date: '2026-02-11', time: '7:00 PM', venue: 'KaNeXT Gymnasium', stage: 'Week 11', status: 'final', homeScore: 85, awayScore: 72 },
  { id: 'game-conf-4', seriesId: 'series-fmu-conference', homeTeam: 'Warner Royals', awayTeam: 'KaNeXT', date: '2026-02-04', time: '7:00 PM', venue: 'Warner Arena', stage: 'Week 10', status: 'final', homeScore: 69, awayScore: 74 },
  { id: 'game-conf-5', seriesId: 'series-fmu-conference', homeTeam: 'EWC Tigers', awayTeam: 'Keiser Seahawks', date: '2026-02-18', time: '6:00 PM', venue: 'EWC Athletic Center', stage: 'Week 12', status: 'scheduled' },

  // Southeast Circuit Tour
  { id: 'game-cir-1', seriesId: 'series-se-circuit', homeTeam: 'ATL Hawks AAU', awayTeam: 'Miami Heat Elite', date: '2026-02-15', time: '10:00 AM', venue: 'Georgia World Congress Center', court: 'Court 3', stage: 'Stop #3', status: 'final', homeScore: 62, awayScore: 58 },
  { id: 'game-cir-2', seriesId: 'series-se-circuit', homeTeam: 'Charlotte Ballers', awayTeam: 'Jax Jaguars AAU', date: '2026-02-15', time: '12:00 PM', venue: 'Georgia World Congress Center', court: 'Court 1', stage: 'Stop #3', status: 'live', homeScore: 30, awayScore: 28 },
  { id: 'game-cir-3', seriesId: 'series-se-circuit', homeTeam: 'Tampa Bay Titans', awayTeam: 'ATL Hawks AAU', date: '2026-02-16', time: '2:00 PM', venue: 'Georgia World Congress Center', court: 'Court 2', stage: 'Stop #3', status: 'scheduled' },
  { id: 'game-cir-4', seriesId: 'series-se-circuit', homeTeam: 'Miami Heat Elite', awayTeam: 'Orlando Rising', date: '2026-02-16', time: '4:00 PM', venue: 'Georgia World Congress Center', court: 'Court 1', stage: 'Stop #3', status: 'scheduled' },
];

// =============================================================================
// SERIES VENUES
// =============================================================================

export const SERIES_VENUES: SeriesVenue[] = [
  { id: 'venue-fmu-gym', seriesId: 'series-mlk-classic', name: 'KaNeXT Gymnasium', location: 'Nashville, TN', courts: 1, capacity: 2500 },
  { id: 'venue-moore', seriesId: 'series-fmu-conference', name: 'Moore Gymnasium', location: 'Daytona Beach, FL', courts: 1, capacity: 3000 },
  { id: 'venue-ewc', seriesId: 'series-fmu-conference', name: 'EWC Athletic Center', location: 'Jacksonville, FL', courts: 2, capacity: 1800 },
  { id: 'venue-warner', seriesId: 'series-fmu-conference', name: 'Warner Arena', location: 'Lake Wales, FL', courts: 1, capacity: 1500 },
  { id: 'venue-gwcc', seriesId: 'series-se-circuit', name: 'Georgia World Congress Center', location: 'Nashville, TN', courts: 6, capacity: 8000 },
  { id: 'venue-sfp', seriesId: 'series-sfp-showcase', name: 'Watsco Center', location: 'Coral Gables, FL', courts: 1, capacity: 7972 },
];

// =============================================================================
// SERIES ROOMS
// =============================================================================

export const SERIES_ROOMS: SeriesRoom[] = [
  // MLK Classic rooms
  { id: 'room-mlk-ops', seriesId: 'series-mlk-classic', title: 'Ops Room', icon: 'gearshape.fill', memberCount: 6, unreadCount: 3 },
  { id: 'room-mlk-officials', seriesId: 'series-mlk-classic', title: 'Officials Room', icon: 'person.badge.shield.checkmark.fill', memberCount: 8, unreadCount: 0 },
  { id: 'room-mlk-media', seriesId: 'series-mlk-classic', title: 'Media Room', icon: 'camera.fill', memberCount: 4, unreadCount: 1 },
  { id: 'room-mlk-teams', seriesId: 'series-mlk-classic', title: 'Team Reps Room', icon: 'person.3.fill', memberCount: 8, unreadCount: 5 },
  { id: 'room-mlk-venue', seriesId: 'series-mlk-classic', title: 'Venue Ops Room', icon: 'building.2.fill', memberCount: 3, unreadCount: 0 },

  // KaNeXT Conference rooms
  { id: 'room-conf-ops', seriesId: 'series-fmu-conference', title: 'Ops Room', icon: 'gearshape.fill', memberCount: 10, unreadCount: 7 },
  { id: 'room-conf-officials', seriesId: 'series-fmu-conference', title: 'Officials Room', icon: 'person.badge.shield.checkmark.fill', memberCount: 12, unreadCount: 2 },
  { id: 'room-conf-media', seriesId: 'series-fmu-conference', title: 'Media Room', icon: 'camera.fill', memberCount: 6, unreadCount: 0 },
  { id: 'room-conf-teams', seriesId: 'series-fmu-conference', title: 'Team Reps Room', icon: 'person.3.fill', memberCount: 10, unreadCount: 4 },
  { id: 'room-conf-broadcast', seriesId: 'series-fmu-conference', title: 'Broadcast Room', icon: 'antenna.radiowaves.left.and.right', memberCount: 4, unreadCount: 1 },

  // Southeast Circuit rooms
  { id: 'room-cir-ops', seriesId: 'series-se-circuit', title: 'Ops Room', icon: 'gearshape.fill', memberCount: 5, unreadCount: 2 },
  { id: 'room-cir-officials', seriesId: 'series-se-circuit', title: 'Officials Room', icon: 'person.badge.shield.checkmark.fill', memberCount: 6, unreadCount: 0 },
  { id: 'room-cir-media', seriesId: 'series-se-circuit', title: 'Media Room', icon: 'camera.fill', memberCount: 3, unreadCount: 0 },
  { id: 'room-cir-teams', seriesId: 'series-se-circuit', title: 'Team Reps Room', icon: 'person.3.fill', memberCount: 16, unreadCount: 9 },
  { id: 'room-cir-venue', seriesId: 'series-se-circuit', title: 'Venue Ops Room', icon: 'building.2.fill', memberCount: 4, unreadCount: 1 },

  // South Ridgemont Prep Showcase rooms
  { id: 'room-sfp-ops', seriesId: 'series-sfp-showcase', title: 'Ops Room', icon: 'gearshape.fill', memberCount: 4, unreadCount: 6 },
  { id: 'room-sfp-officials', seriesId: 'series-sfp-showcase', title: 'Officials Room', icon: 'person.badge.shield.checkmark.fill', memberCount: 5, unreadCount: 0 },
  { id: 'room-sfp-teams', seriesId: 'series-sfp-showcase', title: 'Team Reps Room', icon: 'person.3.fill', memberCount: 24, unreadCount: 12 },
  { id: 'room-sfp-venue', seriesId: 'series-sfp-showcase', title: 'Venue Ops Room', icon: 'building.2.fill', memberCount: 3, unreadCount: 0 },
];

// =============================================================================
// SERIES AUDIT LOG
// =============================================================================

export const SERIES_AUDIT: SeriesAuditEntry[] = [
  // MLK Classic
  { id: 'audit-1', seriesId: 'series-mlk-classic', action: 'Series created', actor: 'Marcus Langford', timestamp: '2025-10-15T09:00:00Z', timestampMs: 1728982800000, description: 'MLK Classic 2026 tournament created with 8 team slots.' },
  { id: 'audit-2', seriesId: 'series-mlk-classic', action: 'Team added', actor: 'Marcus Langford', timestamp: '2025-11-01T14:20:00Z', timestampMs: 1730470800000, description: 'KaNeXT confirmed as participating team.' },
  { id: 'audit-3', seriesId: 'series-mlk-classic', action: 'Bracket seeded', actor: 'Marcus Langford', timestamp: '2026-01-10T11:00:00Z', timestampMs: 1736506800000, description: 'Tournament bracket seeded. KaNeXT assigned 2-seed.' },
  { id: 'audit-4', seriesId: 'series-mlk-classic', action: 'Media room created', actor: 'Carlos Rivera', timestamp: '2026-01-12T09:30:00Z', timestampMs: 1736674200000, description: 'Media room opened for credentialed press and broadcast partners.' },
  { id: 'audit-5', seriesId: 'series-mlk-classic', action: 'Game completed', actor: 'System', timestamp: '2026-01-18T14:15:00Z', timestampMs: 1737212100000, description: 'QF-1: KaNeXT 78, Warner Royals 65. KaNeXT advances to semifinals.' },

  // KaNeXT Conference League
  { id: 'audit-6', seriesId: 'series-fmu-conference', action: 'Series created', actor: 'Jerome Wallace', timestamp: '2025-08-20T12:00:00Z', timestampMs: 1724155200000, description: 'KaNeXT Conference League created for 2025-26 season. Round-robin format, 10 teams.' },
  { id: 'audit-7', seriesId: 'series-fmu-conference', action: 'Schedule published', actor: 'Jerome Wallace', timestamp: '2025-09-15T10:00:00Z', timestampMs: 1726394400000, description: 'Full 45-game regular season schedule published and distributed to team reps.' },
  { id: 'audit-8', seriesId: 'series-fmu-conference', action: 'Staff assigned', actor: 'Jerome Wallace', timestamp: '2025-10-01T08:00:00Z', timestampMs: 1727769600000, description: 'Denise Brooks assigned as Head Official for conference games.' },
  { id: 'audit-9', seriesId: 'series-fmu-conference', action: 'Compliance report filed', actor: 'Lisa Chen', timestamp: '2026-02-01T16:00:00Z', timestampMs: 1738425600000, description: 'Mid-season compliance report filed. 92% upload rate across all teams.' },
  { id: 'audit-10', seriesId: 'series-fmu-conference', action: 'Game completed', actor: 'System', timestamp: '2026-02-11T21:30:00Z', timestampMs: 1739310600000, description: 'Week 11: KaNeXT 85, Ave Maria Gyrenes 72.' },

  // South Ridgemont Prep Showcase
  { id: 'audit-11', seriesId: 'series-sfp-showcase', action: 'Series created', actor: 'Marcus Langford', timestamp: '2025-12-01T10:00:00Z', timestampMs: 1733050800000, description: 'South Ridgemont Prep Showcase created. 24 team slots, registration open.' },
  { id: 'audit-12', seriesId: 'series-sfp-showcase', action: 'Team added', actor: 'Aisha Mitchell', timestamp: '2026-01-20T09:00:00Z', timestampMs: 1737363600000, description: 'Miami Northwestern Bulls registered as showcase participant.' },

  // Southeast Circuit Tour
  { id: 'audit-13', seriesId: 'series-se-circuit', action: 'Series created', actor: 'Jerome Wallace', timestamp: '2025-11-05T08:00:00Z', timestampMs: 1730793600000, description: 'Southeast Circuit Tour launched. 6 stops, Jan-Jun 2026.' },
  { id: 'audit-14', seriesId: 'series-se-circuit', action: 'Game completed', actor: 'System', timestamp: '2026-02-15T12:30:00Z', timestampMs: 1739623800000, description: 'Stop #3 opener: ATL Hawks AAU 62, Miami Heat Elite 58.' },

  // Summer Invitational
  { id: 'audit-15', seriesId: 'series-summer-inv', action: 'Series created', actor: 'Marcus Langford', timestamp: '2026-01-15T11:00:00Z', timestampMs: 1737000600000, description: 'Summer Invitational 2026 created. Bracket and registration pending.' },
];

// =============================================================================
// HELPERS
// =============================================================================

export function filterSeries(
  series: SeriesFull[],
  search: string,
  scope: string,
  types: SeriesType[],
  levels: SeriesLevel[],
  statuses: SeriesStatus[],
): SeriesFull[] {
  let filtered = [...series];

  // Search filter
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.shortName.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q),
    );
  }

  // Scope filter — "my" shows series where user is staff; "following" is a subset
  if (scope === 'my') {
    filtered = filtered.filter((s) => s.opsDirector.id === 'staff-1' || s.opsDirector.id === 'staff-5');
  } else if (scope === 'following') {
    filtered = filtered.filter((s) => s.status === 'live' || s.status === 'in-progress');
  }

  // Type filter
  if (types.length > 0) {
    filtered = filtered.filter((s) => types.includes(s.type));
  }

  // Level filter
  if (levels.length > 0) {
    filtered = filtered.filter((s) => levels.includes(s.level));
  }

  // Status filter
  if (statuses.length > 0) {
    filtered = filtered.filter((s) => statuses.includes(s.status));
  }

  return filtered;
}

export function sortSeries(
  series: SeriesFull[],
  sort: SeriesFilterState['sort'],
): SeriesFull[] {
  const sorted = [...series];
  switch (sort) {
    case 'upcoming':
      return sorted.sort((a, b) => {
        const statusOrder: Record<SeriesStatus, number> = { live: 0, 'in-progress': 1, upcoming: 2, completed: 3, archived: 4 };
        return (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5);
      });
    case 'recent':
      return sorted.sort((a, b) => b.lastActivityMs - a.lastActivityMs);
    case 'watched':
      // Watched = most games, proxy for engagement
      return sorted.sort((a, b) => b.gameCount - a.gameCount);
    case 'az':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

export function getParticipantsForSeries(seriesId: string): SeriesParticipant[] {
  return SERIES_PARTICIPANTS.filter((p) => p.seriesId === seriesId);
}

export function getGamesForSeries(seriesId: string): SeriesGame[] {
  return SERIES_GAMES.filter((g) => g.seriesId === seriesId);
}

export function getVenuesForSeries(seriesId: string): SeriesVenue[] {
  return SERIES_VENUES.filter((v) => v.seriesId === seriesId);
}

export function getRoomsForSeries(seriesId: string): SeriesRoom[] {
  return SERIES_ROOMS.filter((r) => r.seriesId === seriesId);
}

export function getStaffForSeries(seriesId: string): SeriesStaff[] {
  // Return staff associated with the series based on audit/room membership
  const seriesRooms = getRoomsForSeries(seriesId);
  if (seriesRooms.length === 0) return [];

  // Map series to their ops directors and related staff
  const series = SERIES_LIST.find((s) => s.id === seriesId);
  if (!series) return [];

  const staffIds = new Set<string>();
  staffIds.add(series.opsDirector.id);

  // Include staff up to the series staffCount
  const allStaff = SERIES_STAFF.filter((s) => !staffIds.has(s.id));
  const result: SeriesStaff[] = [series.opsDirector];

  for (let i = 0; i < Math.min(series.staffCount - 1, allStaff.length); i++) {
    result.push(allStaff[i]);
  }

  return result;
}

export function getAuditForSeries(seriesId: string): SeriesAuditEntry[] {
  return SERIES_AUDIT.filter((a) => a.seriesId === seriesId).sort(
    (a, b) => b.timestampMs - a.timestampMs,
  );
}
