/**
 * Rooms v2 — Communication Directory + Control Plane
 * Types and mock data for all 5 modes.
 */

import type { Mode } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

export type RoomVisibility = 'private' | 'discoverable' | 'public-read';
export type RoomJoinPolicy = 'invite' | 'request' | 'open';
export type RoomPostingPermission = 'everyone' | 'staff-only' | 'admins-only';

export type SportsTemplate =
  | 'program-staff' | 'team' | 'recruiting' | 'player-internal'
  | 'game' | 'film-tagging' | 'development' | 'parent-guardian'
  | 'booster' | 'media' | 'alumni';
export type EducationTemplate =
  | 'institution-leadership' | 'registrar' | 'admissions' | 'department'
  | 'course-staff' | 'classroom' | 'faculty-lounge' | 'student-affairs'
  | 'library' | 'research' | 'alumni';
export type ChurchTemplate =
  | 'church-leadership' | 'prayer' | 'care-team' | 'ministry'
  | 'small-group' | 'youth-ministry' | 'new-members' | 'worship'
  | 'missions' | 'events' | 'volunteers';
export type BusinessTemplate =
  | 'all-hands' | 'leadership' | 'ops' | 'department'
  | 'project' | 'deal' | 'client' | 'hr'
  | 'engineering' | 'marketing' | 'support';
export type CompetitionTemplate =
  | 'competition-ops' | 'team-reps' | 'officials' | 'event-weekend-staff'
  | 'broadcast-streaming' | 'sponsors' | 'medical' | 'venue-ops'
  | 'incident' | 'media';

export type RoomTemplate =
  | SportsTemplate | EducationTemplate | ChurchTemplate
  | BusinessTemplate | CompetitionTemplate;

export interface RoomMember {
  id: string;
  name: string;
  initials: string;
  role: string;
}

export interface RoomQuickLink {
  id: string;
  label: string;
  url: string;
  icon: string;
}

export interface RoomAuditEntry {
  id: string;
  action: 'room_created' | 'member_added' | 'permission_changed' | 'room_archived' | 'share_link';
  actor: string;
  detail: string;
  timestamp: string;
  timestamp_ms: number;
}

export interface Room {
  room_id: string;
  mode: Mode;
  room_type: RoomTemplate;
  scope_object: string;
  title: string;
  context_line: string;
  members: RoomMember[];
  visibility: RoomVisibility;
  join_policy: RoomJoinPolicy;
  posting_permissions: RoomPostingPermission;
  created_at: string;
  last_activity_at: string;
  last_activity_ms: number;
  unread_count: number;
  pinned_room: boolean;
  archived_room: boolean;
  quick_links: RoomQuickLink[];
  audit_log: RoomAuditEntry[];
  avatarColor: string;
  lastMessage: string;
}

export interface RoomRequest {
  id: string;
  room_id: string;
  room_title: string;
  requester_name: string;
  requester_initials: string;
  request_type: 'join' | 'invite';
  message?: string;
  timestamp: string;
}

export interface RoomTemplateOption {
  key: RoomTemplate;
  label: string;
  icon: string;
  description: string;
}

export interface RoomSettingToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface ScopeChip {
  key: string;
  label: string;
}

export type RoomsHubTab = 'inbox' | 'rooms' | 'requests' | 'pinned' | 'audit' | 'settings';

// =============================================================================
// CONSTANTS
// =============================================================================

export const ROOMS_HUB_TABS: { id: RoomsHubTab; label: string }[] = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'requests', label: 'Requests' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'audit', label: 'Audit' },
  { id: 'settings', label: 'Settings' },
];

export const SCOPE_CHIPS: Record<Mode, ScopeChip[]> = {
  sports: [
    { key: 'program', label: 'Program' },
    { key: 'organization', label: 'Organization' },
    { key: 'season', label: 'Season' },
  ],
  education: [
    { key: 'institution', label: 'Institution' },
    { key: 'department', label: 'Department' },
    { key: 'term', label: 'Term/Semester' },
  ],
  church: [
    { key: 'church', label: 'Church' },
    { key: 'ministry', label: 'Ministry' },
    { key: 'season', label: 'Season' },
  ],
  competition: [
    { key: 'competition', label: 'Competition' },
    { key: 'event-weekend', label: 'Event Weekend' },
    { key: 'venue', label: 'Venue' },
  ],
  business: [
    { key: 'company', label: 'Company' },
    { key: 'department', label: 'Department' },
    { key: 'quarter', label: 'Quarter/Period' },
  ],
};

// =============================================================================
// ROOM TEMPLATES
// =============================================================================

export const ROOM_TEMPLATES: Record<Mode, RoomTemplateOption[]> = {
  sports: [
    { key: 'program-staff', label: 'Program Staff', icon: 'person.2.fill', description: 'Coaching staff coordination' },
    { key: 'team', label: 'Team', icon: 'sportscourt.fill', description: 'Full team communication' },
    { key: 'recruiting', label: 'Recruiting', icon: 'person.badge.plus', description: 'Recruitment pipeline' },
    { key: 'player-internal', label: 'Player Internal', icon: 'person.crop.circle', description: 'Player-only space' },
    { key: 'game', label: 'Game', icon: 'flag.fill', description: 'Game-day operations' },
    { key: 'film-tagging', label: 'Film / Tagging', icon: 'film', description: 'Film review & tagging' },
    { key: 'development', label: 'Development', icon: 'chart.line.uptrend.xyaxis', description: 'Player development' },
    { key: 'parent-guardian', label: 'Parent / Guardian', icon: 'person.2.circle', description: 'Family communication' },
    { key: 'booster', label: 'Booster', icon: 'star.fill', description: 'Booster club coordination' },
    { key: 'media', label: 'Media', icon: 'camera.fill', description: 'Media relations' },
    { key: 'alumni', label: 'Alumni', icon: 'graduationcap.fill', description: 'Alumni network' },
  ],
  education: [
    { key: 'institution-leadership', label: 'Institution Leadership', icon: 'building.2.fill', description: 'Executive leadership' },
    { key: 'registrar', label: 'Registrar', icon: 'doc.text.fill', description: 'Registration & records' },
    { key: 'admissions', label: 'Admissions', icon: 'person.badge.plus', description: 'Admissions pipeline' },
    { key: 'department', label: 'Department', icon: 'folder.fill', description: 'Department coordination' },
    { key: 'course-staff', label: 'Course Staff', icon: 'person.2.fill', description: 'Instructor collaboration' },
    { key: 'classroom', label: 'Classroom', icon: 'book.fill', description: 'Course communication' },
    { key: 'faculty-lounge', label: 'Faculty Lounge', icon: 'cup.and.saucer.fill', description: 'Faculty networking' },
    { key: 'student-affairs', label: 'Student Affairs', icon: 'person.3.fill', description: 'Student services' },
    { key: 'library', label: 'Library', icon: 'books.vertical.fill', description: 'Library coordination' },
    { key: 'research', label: 'Research', icon: 'magnifyingglass', description: 'Research collaboration' },
    { key: 'alumni', label: 'Alumni', icon: 'graduationcap.fill', description: 'Alumni relations' },
  ],
  church: [
    { key: 'church-leadership', label: 'Church Leadership', icon: 'crown.fill', description: 'Pastoral leadership' },
    { key: 'prayer', label: 'Prayer', icon: 'hands.sparkles.fill', description: 'Prayer requests & updates' },
    { key: 'care-team', label: 'Care Team', icon: 'heart.fill', description: 'Pastoral care coordination' },
    { key: 'ministry', label: 'Ministry', icon: 'person.3.fill', description: 'Ministry team space' },
    { key: 'small-group', label: 'Small Group', icon: 'person.2.circle', description: 'Small group discussion' },
    { key: 'youth-ministry', label: 'Youth Ministry', icon: 'figure.walk', description: 'Youth ministry coordination' },
    { key: 'new-members', label: 'New Members', icon: 'person.badge.plus', description: 'New member onboarding' },
    { key: 'worship', label: 'Worship', icon: 'music.note', description: 'Worship team planning' },
    { key: 'missions', label: 'Missions', icon: 'globe.americas.fill', description: 'Missions coordination' },
    { key: 'events', label: 'Events', icon: 'calendar', description: 'Event planning' },
    { key: 'volunteers', label: 'Volunteers', icon: 'hand.raised.fill', description: 'Volunteer coordination' },
  ],
  competition: [
    { key: 'competition-ops', label: 'Competition Ops', icon: 'flag.checkered', description: 'Competition operations' },
    { key: 'team-reps', label: 'Team Reps', icon: 'person.2.fill', description: 'Team representative channel' },
    { key: 'officials', label: 'Officials', icon: 'shield.checkered', description: 'Officials coordination' },
    { key: 'event-weekend-staff', label: 'Event Weekend Staff', icon: 'calendar.badge.clock', description: 'Event-day staff' },
    { key: 'broadcast-streaming', label: 'Broadcast / Streaming', icon: 'antenna.radiowaves.left.and.right', description: 'Broadcast coordination' },
    { key: 'sponsors', label: 'Sponsors', icon: 'star.fill', description: 'Sponsor relations' },
    { key: 'medical', label: 'Medical', icon: 'cross.case.fill', description: 'Medical staff coordination' },
    { key: 'venue-ops', label: 'Venue Ops', icon: 'building.fill', description: 'Venue operations' },
    { key: 'incident', label: 'Incident', icon: 'exclamationmark.triangle.fill', description: 'Incident response' },
    { key: 'media', label: 'Media', icon: 'camera.fill', description: 'Media relations' },
  ],
  business: [
    { key: 'all-hands', label: 'All-Hands', icon: 'megaphone.fill', description: 'Company-wide updates' },
    { key: 'leadership', label: 'Leadership', icon: 'crown.fill', description: 'Executive leadership' },
    { key: 'ops', label: 'Ops', icon: 'gearshape.2.fill', description: 'Operations coordination' },
    { key: 'department', label: 'Department', icon: 'folder.fill', description: 'Department communication' },
    { key: 'project', label: 'Project', icon: 'hammer.fill', description: 'Project workspace' },
    { key: 'deal', label: 'Deal', icon: 'banknote.fill', description: 'Deal room coordination' },
    { key: 'client', label: 'Client', icon: 'person.crop.circle.badge.checkmark', description: 'Client-facing channel' },
    { key: 'hr', label: 'HR', icon: 'person.text.rectangle.fill', description: 'Human resources' },
    { key: 'engineering', label: 'Engineering', icon: 'wrench.and.screwdriver.fill', description: 'Engineering team' },
    { key: 'marketing', label: 'Marketing', icon: 'megaphone.fill', description: 'Marketing coordination' },
    { key: 'support', label: 'Support', icon: 'questionmark.circle.fill', description: 'Customer support' },
  ],
};

// =============================================================================
// MOCK ROOMS
// =============================================================================

const SPORTS_ROOMS: Room[] = [
  {
    room_id: 'sr-001',
    mode: 'sports',
    room_type: 'program-staff',
    scope_object: 'program',
    title: 'MBB Coaching Staff',
    context_line: "Men's Basketball coaching staff",
    members: [
      { id: 'm1', name: 'Alex Morgan', initials: 'AM', role: 'Head Coach' },
      { id: 'm2', name: 'Marcus Johnson', initials: 'MJ', role: 'Associate HC' },
      { id: 'm3', name: 'Chris Williams', initials: 'CW', role: 'Assistant Coach' },
    ],
    visibility: 'private',
    join_policy: 'invite',
    posting_permissions: 'everyone',
    created_at: '2025-08-15',
    last_activity_at: '2 min ago',
    last_activity_ms: Date.now() - 120000,
    unread_count: 3,
    pinned_room: true,
    archived_room: false,
    quick_links: [
      { id: 'ql1', label: 'Practice Plan', url: '#', icon: 'doc.text.fill' },
      { id: 'ql2', label: 'Roster', url: '#', icon: 'person.3.fill' },
    ],
    audit_log: [
      { id: 'a1', action: 'room_created', actor: 'Alex Morgan', detail: 'Created room', timestamp: 'Aug 15, 2025', timestamp_ms: 1723708800000 },
      { id: 'a2', action: 'member_added', actor: 'Alex Morgan', detail: 'Added Marcus Johnson', timestamp: 'Aug 15, 2025', timestamp_ms: 1723712400000 },
      { id: 'a3', action: 'member_added', actor: 'Alex Morgan', detail: 'Added Chris Williams', timestamp: 'Aug 16, 2025', timestamp_ms: 1723795200000 },
    ],
    avatarColor: '#1D9BF0',
    lastMessage: 'Updated the rotation for tomorrow\'s practice',
  },
  {
    room_id: 'sr-002',
    mode: 'sports',
    room_type: 'team',
    scope_object: 'program',
    title: 'MBB Team',
    context_line: 'Full team channel',
    members: [
      { id: 'm1', name: 'Alex Morgan', initials: 'AM', role: 'Head Coach' },
      { id: 'm4', name: 'Jaylen Carter', initials: 'JC', role: 'Player' },
      { id: 'm5', name: 'Darius Thompson', initials: 'DT', role: 'Player' },
      { id: 'm6', name: 'Andre Mitchell', initials: 'AM', role: 'Player' },
    ],
    visibility: 'private',
    join_policy: 'invite',
    posting_permissions: 'everyone',
    created_at: '2025-08-15',
    last_activity_at: '18 min ago',
    last_activity_ms: Date.now() - 1080000,
    unread_count: 7,
    pinned_room: true,
    archived_room: false,
    quick_links: [
      { id: 'ql3', label: 'Schedule', url: '#', icon: 'calendar' },
      { id: 'ql4', label: 'Film Room', url: '#', icon: 'film' },
      { id: 'ql5', label: 'Strength & Conditioning', url: '#', icon: 'figure.strengthtraining.traditional' },
    ],
    audit_log: [
      { id: 'a4', action: 'room_created', actor: 'Alex Morgan', detail: 'Created room', timestamp: 'Aug 15, 2025', timestamp_ms: 1723708800000 },
      { id: 'a5', action: 'member_added', actor: 'System', detail: 'Auto-enrolled 14 team members', timestamp: 'Aug 15, 2025', timestamp_ms: 1723712400000 },
    ],
    avatarColor: '#1D9BF0',
    lastMessage: 'Film session at 3pm — bring your notebooks',
  },
  {
    room_id: 'sr-003',
    mode: 'sports',
    room_type: 'recruiting',
    scope_object: 'program',
    title: 'MBB Recruiting',
    context_line: 'Recruiting pipeline & eval',
    members: [
      { id: 'm1', name: 'Alex Morgan', initials: 'AM', role: 'Head Coach' },
      { id: 'm2', name: 'Marcus Johnson', initials: 'MJ', role: 'Associate HC' },
    ],
    visibility: 'private',
    join_policy: 'invite',
    posting_permissions: 'staff-only',
    created_at: '2025-09-01',
    last_activity_at: '1 hr ago',
    last_activity_ms: Date.now() - 3600000,
    unread_count: 1,
    pinned_room: false,
    archived_room: false,
    quick_links: [
      { id: 'ql6', label: 'Board', url: '#', icon: 'rectangle.grid.1x2.fill' },
    ],
    audit_log: [
      { id: 'a6', action: 'room_created', actor: 'Alex Morgan', detail: 'Created room', timestamp: 'Sep 1, 2025', timestamp_ms: 1725148800000 },
      { id: 'a7', action: 'share_link', actor: 'Marcus Johnson', detail: 'Shared scouting report link', timestamp: 'Feb 14, 2026', timestamp_ms: Date.now() - 172800000 },
    ],
    avatarColor: '#22C55E',
    lastMessage: 'Got updated film on the PG from Westside — looks legit',
  },
  {
    room_id: 'sr-004',
    mode: 'sports',
    room_type: 'player-internal',
    scope_object: 'program',
    title: 'MBB Players Only',
    context_line: 'Player-only space — no staff',
    members: [
      { id: 'm4', name: 'Jaylen Carter', initials: 'JC', role: 'Captain' },
      { id: 'm5', name: 'Darius Thompson', initials: 'DT', role: 'Player' },
      { id: 'm6', name: 'Andre Mitchell', initials: 'AM', role: 'Player' },
    ],
    visibility: 'private',
    join_policy: 'invite',
    posting_permissions: 'everyone',
    created_at: '2025-08-20',
    last_activity_at: '45 min ago',
    last_activity_ms: Date.now() - 2700000,
    unread_count: 0,
    pinned_room: false,
    archived_room: false,
    quick_links: [],
    audit_log: [
      { id: 'a8', action: 'room_created', actor: 'Jaylen Carter', detail: 'Created room', timestamp: 'Aug 20, 2025', timestamp_ms: 1724140800000 },
    ],
    avatarColor: '#F59E0B',
    lastMessage: 'Who\'s hitting the gym at 6am tomorrow?',
  },
  {
    room_id: 'sr-005',
    mode: 'sports',
    room_type: 'game',
    scope_object: 'season',
    title: 'Game Day — vs Ridgemont',
    context_line: 'Feb 18 home game operations',
    members: [
      { id: 'm1', name: 'Alex Morgan', initials: 'AM', role: 'Head Coach' },
      { id: 'm7', name: 'Dana Brooks', initials: 'DB', role: 'Ops Director' },
      { id: 'm8', name: 'Ray Nguyen', initials: 'RN', role: 'Trainer' },
    ],
    visibility: 'private',
    join_policy: 'invite',
    posting_permissions: 'everyone',
    created_at: '2026-02-10',
    last_activity_at: '5 hr ago',
    last_activity_ms: Date.now() - 18000000,
    unread_count: 0,
    pinned_room: false,
    archived_room: false,
    quick_links: [
      { id: 'ql7', label: 'Game Plan', url: '#', icon: 'doc.text.fill' },
      { id: 'ql8', label: 'Scouting Report', url: '#', icon: 'chart.bar.doc.horizontal' },
    ],
    audit_log: [
      { id: 'a9', action: 'room_created', actor: 'System', detail: 'Auto-created for game', timestamp: 'Feb 10, 2026', timestamp_ms: Date.now() - 518400000 },
      { id: 'a10', action: 'member_added', actor: 'System', detail: 'Added game-day staff', timestamp: 'Feb 10, 2026', timestamp_ms: Date.now() - 518300000 },
    ],
    avatarColor: '#EF4444',
    lastMessage: 'Bus departs at 4:30pm — be in the lobby by 4:15',
  },
  {
    room_id: 'sr-006',
    mode: 'sports',
    room_type: 'film-tagging',
    scope_object: 'program',
    title: 'MBB Film Room',
    context_line: 'Film review & clip tagging',
    members: [
      { id: 'm1', name: 'Alex Morgan', initials: 'AM', role: 'Head Coach' },
      { id: 'm3', name: 'Chris Williams', initials: 'CW', role: 'Video Coordinator' },
    ],
    visibility: 'private',
    join_policy: 'invite',
    posting_permissions: 'everyone',
    created_at: '2025-09-05',
    last_activity_at: '3 hr ago',
    last_activity_ms: Date.now() - 10800000,
    unread_count: 2,
    pinned_room: false,
    archived_room: false,
    quick_links: [
      { id: 'ql9', label: 'Film Library', url: '#', icon: 'film' },
    ],
    audit_log: [
      { id: 'a11', action: 'room_created', actor: 'Chris Williams', detail: 'Created room', timestamp: 'Sep 5, 2025', timestamp_ms: 1725494400000 },
      { id: 'a12', action: 'permission_changed', actor: 'Alex Morgan', detail: 'Set posting to everyone', timestamp: 'Sep 6, 2025', timestamp_ms: 1725580800000 },
    ],
    avatarColor: '#1D9BF0',
    lastMessage: 'Tagged 12 clips from last night — check the PnR set',
  },
  {
    room_id: 'sr-007',
    mode: 'sports',
    room_type: 'development',
    scope_object: 'program',
    title: 'MBB Player Development',
    context_line: 'Skill work & development tracking',
    members: [
      { id: 'm2', name: 'Marcus Johnson', initials: 'MJ', role: 'Associate HC' },
      { id: 'm3', name: 'Chris Williams', initials: 'CW', role: 'Assistant Coach' },
      { id: 'm9', name: 'Tyler Green', initials: 'TG', role: 'Strength Coach' },
    ],
    visibility: 'discoverable',
    join_policy: 'request',
    posting_permissions: 'staff-only',
    created_at: '2025-09-10',
    last_activity_at: 'Yesterday',
    last_activity_ms: Date.now() - 86400000,
    unread_count: 0,
    pinned_room: false,
    archived_room: false,
    quick_links: [
      { id: 'ql10', label: 'Drill Library', url: '#', icon: 'figure.basketball' },
      { id: 'ql11', label: 'Weekly Plan', url: '#', icon: 'calendar' },
    ],
    audit_log: [
      { id: 'a13', action: 'room_created', actor: 'Marcus Johnson', detail: 'Created room', timestamp: 'Sep 10, 2025', timestamp_ms: 1725926400000 },
      { id: 'a14', action: 'member_added', actor: 'Marcus Johnson', detail: 'Added Tyler Green', timestamp: 'Sep 11, 2025', timestamp_ms: 1726012800000 },
    ],
    avatarColor: '#1D9BF0',
    lastMessage: 'Posted updated shooting drill progressions for Week 22',
  },
];

const EDUCATION_ROOMS: Room[] = [
  {
    room_id: 'er-001',
    mode: 'education',
    room_type: 'institution-leadership',
    scope_object: 'institution',
    title: 'Executive Cabinet',
    context_line: 'President & VP leadership team',
    members: [
      { id: 'e1', name: 'Dr. Patricia Wells', initials: 'PW', role: 'President' },
      { id: 'e2', name: 'Dr. James Chen', initials: 'JC', role: 'VP Academic Affairs' },
      { id: 'e3', name: 'Lisa Morales', initials: 'LM', role: 'VP Finance' },
    ],
    visibility: 'private',
    join_policy: 'invite',
    posting_permissions: 'everyone',
    created_at: '2025-07-01',
    last_activity_at: '10 min ago',
    last_activity_ms: Date.now() - 600000,
    unread_count: 4,
    pinned_room: true,
    archived_room: false,
    quick_links: [
      { id: 'ql1', label: 'Board Docs', url: '#', icon: 'doc.text.fill' },
      { id: 'ql2', label: 'Budget Dashboard', url: '#', icon: 'chart.bar.fill' },
    ],
    audit_log: [
      { id: 'a1', action: 'room_created', actor: 'Dr. Patricia Wells', detail: 'Created room', timestamp: 'Jul 1, 2025', timestamp_ms: 1719792000000 },
      { id: 'a2', action: 'member_added', actor: 'Dr. Patricia Wells', detail: 'Added cabinet members', timestamp: 'Jul 1, 2025', timestamp_ms: 1719795600000 },
    ],
    avatarColor: '#1D9BF0',
    lastMessage: 'Accreditation visit confirmed for March 10-12',
  },
  {
    room_id: 'er-002',
    mode: 'education',
    room_type: 'registrar',
    scope_object: 'institution',
    title: 'Registrar Office',
    context_line: 'Registration & records team',
    members: [
      { id: 'e4', name: 'Karen Mitchell', initials: 'KM', role: 'Registrar' },
      { id: 'e5', name: 'Tony Russo', initials: 'TR', role: 'Associate Registrar' },
    ],
    visibility: 'private',
    join_policy: 'invite',
    posting_permissions: 'everyone',
    created_at: '2025-07-15',
    last_activity_at: '30 min ago',
    last_activity_ms: Date.now() - 1800000,
    unread_count: 2,
    pinned_room: false,
    archived_room: false,
    quick_links: [
      { id: 'ql3', label: 'SIS Portal', url: '#', icon: 'rectangle.grid.1x2.fill' },
    ],
    audit_log: [
      { id: 'a3', action: 'room_created', actor: 'Karen Mitchell', detail: 'Created room', timestamp: 'Jul 15, 2025', timestamp_ms: 1721001600000 },
    ],
    avatarColor: '#1D9BF0',
    lastMessage: 'Spring add/drop deadline extended to Feb 21',
  },
  {
    room_id: 'er-003',
    mode: 'education',
    room_type: 'admissions',
    scope_object: 'institution',
    title: 'Admissions Pipeline',
    context_line: 'Enrollment management',
    members: [
      { id: 'e6', name: 'Rachel Kim', initials: 'RK', role: 'Director' },
      { id: 'e7', name: 'David Park', initials: 'DP', role: 'Recruiter' },
      { id: 'e8', name: 'Sarah Lin', initials: 'SL', role: 'Recruiter' },
    ],
    visibility: 'private',
    join_policy: 'invite',
    posting_permissions: 'everyone',
    created_at: '2025-08-01',
    last_activity_at: '2 hr ago',
    last_activity_ms: Date.now() - 7200000,
    unread_count: 0,
    pinned_room: true,
    archived_room: false,
    quick_links: [
      { id: 'ql4', label: 'CRM', url: '#', icon: 'person.3.fill' },
      { id: 'ql5', label: 'Visit Calendar', url: '#', icon: 'calendar' },
    ],
    audit_log: [
      { id: 'a4', action: 'room_created', actor: 'Rachel Kim', detail: 'Created room', timestamp: 'Aug 1, 2025', timestamp_ms: 1722470400000 },
      { id: 'a5', action: 'share_link', actor: 'David Park', detail: 'Shared enrollment report', timestamp: 'Feb 12, 2026', timestamp_ms: Date.now() - 345600000 },
    ],
    avatarColor: '#F59E0B',
    lastMessage: 'Fall 2026 applications up 12% over last year',
  },
  {
    room_id: 'er-004',
    mode: 'education',
    room_type: 'department',
    scope_object: 'department',
    title: 'Computer Science Dept',
    context_line: 'CS department coordination',
    members: [
      { id: 'e9', name: 'Dr. Alan Foster', initials: 'AF', role: 'Chair' },
      { id: 'e10', name: 'Dr. Maria Santos', initials: 'MS', role: 'Professor' },
    ],
    visibility: 'discoverable',
    join_policy: 'request',
    posting_permissions: 'everyone',
    created_at: '2025-08-10',
    last_activity_at: '4 hr ago',
    last_activity_ms: Date.now() - 14400000,
    unread_count: 1,
    pinned_room: false,
    archived_room: false,
    quick_links: [
      { id: 'ql6', label: 'Course Catalog', url: '#', icon: 'book.fill' },
    ],
    audit_log: [
      { id: 'a6', action: 'room_created', actor: 'Dr. Alan Foster', detail: 'Created room', timestamp: 'Aug 10, 2025', timestamp_ms: 1723248000000 },
    ],
    avatarColor: '#1D9BF0',
    lastMessage: 'Adjunct hiring approved for CSCI-301 section B',
  },
  {
    room_id: 'er-005',
    mode: 'education',
    room_type: 'course-staff',
    scope_object: 'term',
    title: 'CSCI-201 Instructors',
    context_line: 'Intro to CS — Spring 2026',
    members: [
      { id: 'e10', name: 'Dr. Maria Santos', initials: 'MS', role: 'Lead Instructor' },
      { id: 'e11', name: 'Jake Torres', initials: 'JT', role: 'TA' },
    ],
    visibility: 'private',
    join_policy: 'invite',
    posting_permissions: 'everyone',
    created_at: '2026-01-10',
    last_activity_at: '1 hr ago',
    last_activity_ms: Date.now() - 3600000,
    unread_count: 0,
    pinned_room: false,
    archived_room: false,
    quick_links: [
      { id: 'ql7', label: 'Syllabus', url: '#', icon: 'doc.text.fill' },
      { id: 'ql8', label: 'Gradebook', url: '#', icon: 'chart.bar.fill' },
    ],
    audit_log: [
      { id: 'a7', action: 'room_created', actor: 'Dr. Maria Santos', detail: 'Created room', timestamp: 'Jan 10, 2026', timestamp_ms: Date.now() - 3196800000 },
      { id: 'a8', action: 'member_added', actor: 'Dr. Maria Santos', detail: 'Added Jake Torres', timestamp: 'Jan 10, 2026', timestamp_ms: Date.now() - 3193200000 },
    ],
    avatarColor: '#22C55E',
    lastMessage: 'Midterm grading due by Friday 5pm',
  },
  {
    room_id: 'er-006',
    mode: 'education',
    room_type: 'classroom',
    scope_object: 'term',
    title: 'CSCI-201 Classroom',
    context_line: 'Student + instructor channel',
    members: [
      { id: 'e10', name: 'Dr. Maria Santos', initials: 'MS', role: 'Instructor' },
      { id: 'e11', name: 'Jake Torres', initials: 'JT', role: 'TA' },
      { id: 'e12', name: '32 Students', initials: '32', role: 'Students' },
    ],
    visibility: 'private',
    join_policy: 'invite',
    posting_permissions: 'everyone',
    created_at: '2026-01-10',
    last_activity_at: '25 min ago',
    last_activity_ms: Date.now() - 1500000,
    unread_count: 5,
    pinned_room: false,
    archived_room: false,
    quick_links: [
      { id: 'ql9', label: 'Assignments', url: '#', icon: 'doc.on.clipboard.fill' },
    ],
    audit_log: [
      { id: 'a9', action: 'room_created', actor: 'System', detail: 'Auto-created from course roster', timestamp: 'Jan 10, 2026', timestamp_ms: Date.now() - 3196800000 },
    ],
    avatarColor: '#1D9BF0',
    lastMessage: 'Lab 5 submission link is now live on the portal',
  },
  {
    room_id: 'er-007',
    mode: 'education',
    room_type: 'faculty-lounge',
    scope_object: 'institution',
    title: 'Faculty Lounge',
    context_line: 'Informal faculty networking',
    members: [
      { id: 'e9', name: 'Dr. Alan Foster', initials: 'AF', role: 'Faculty' },
      { id: 'e10', name: 'Dr. Maria Santos', initials: 'MS', role: 'Faculty' },
      { id: 'e13', name: 'Dr. Robert Hayes', initials: 'RH', role: 'Faculty' },
    ],
    visibility: 'discoverable',
    join_policy: 'open',
    posting_permissions: 'everyone',
    created_at: '2025-08-01',
    last_activity_at: 'Yesterday',
    last_activity_ms: Date.now() - 86400000,
    unread_count: 0,
    pinned_room: false,
    archived_room: false,
    quick_links: [],
    audit_log: [
      { id: 'a10', action: 'room_created', actor: 'System', detail: 'Created room', timestamp: 'Aug 1, 2025', timestamp_ms: 1722470400000 },
    ],
    avatarColor: '#1D9BF0',
    lastMessage: 'Anyone up for the faculty golf scramble next Saturday?',
  },
];

const CHURCH_ROOMS: Room[] = [
  {
    room_id: 'cr-001',
    mode: 'church',
    room_type: 'church-leadership',
    scope_object: 'church',
    title: 'Pastoral Team',
    context_line: 'Senior leadership',
    members: [
      { id: 'c1', name: 'Pastor James Carter', initials: 'JC', role: 'Senior Pastor' },
      { id: 'c2', name: 'Pastor Lisa Brooks', initials: 'SO', role: 'Associate Pastor' },
      { id: 'c3', name: 'Elder James Wright', initials: 'JW', role: 'Elder' },
    ],
    visibility: 'private',
    join_policy: 'invite',
    posting_permissions: 'everyone',
    created_at: '2025-01-01',
    last_activity_at: '5 min ago',
    last_activity_ms: Date.now() - 300000,
    unread_count: 2,
    pinned_room: true,
    archived_room: false,
    quick_links: [
      { id: 'ql1', label: 'Sermon Calendar', url: '#', icon: 'calendar' },
      { id: 'ql2', label: 'Budget', url: '#', icon: 'chart.bar.fill' },
    ],
    audit_log: [
      { id: 'a1', action: 'room_created', actor: 'Pastor James Carter', detail: 'Created room', timestamp: 'Jan 1, 2025', timestamp_ms: 1704067200000 },
      { id: 'a2', action: 'member_added', actor: 'Pastor James Carter', detail: 'Added pastoral team', timestamp: 'Jan 1, 2025', timestamp_ms: 1704070800000 },
    ],
    avatarColor: '#1D9BF0',
    lastMessage: 'Lenten series outline is attached — review by Wednesday',
  },
  {
    room_id: 'cr-002',
    mode: 'church',
    room_type: 'prayer',
    scope_object: 'church',
    title: 'Prayer Requests',
    context_line: 'Congregation prayer needs',
    members: [
      { id: 'c1', name: 'Pastor James Carter', initials: 'JC', role: 'Pastor' },
      { id: 'c4', name: 'Deacon Mary Thompson', initials: 'RA', role: 'Prayer Lead' },
      { id: 'c5', name: 'Sister Grace Wilson', initials: 'GN', role: 'Intercessor' },
    ],
    visibility: 'discoverable',
    join_policy: 'open',
    posting_permissions: 'everyone',
    created_at: '2025-01-05',
    last_activity_at: '20 min ago',
    last_activity_ms: Date.now() - 1200000,
    unread_count: 6,
    pinned_room: true,
    archived_room: false,
    quick_links: [
      { id: 'ql3', label: 'Prayer Guide', url: '#', icon: 'book.fill' },
    ],
    audit_log: [
      { id: 'a3', action: 'room_created', actor: 'Deacon Mary Thompson', detail: 'Created room', timestamp: 'Jan 5, 2025', timestamp_ms: 1704412800000 },
    ],
    avatarColor: '#F59E0B',
    lastMessage: 'Please keep the Johnson family in your prayers this week',
  },
  {
    room_id: 'cr-003',
    mode: 'church',
    room_type: 'care-team',
    scope_object: 'church',
    title: 'Care Team',
    context_line: 'Hospital visits & benevolence',
    members: [
      { id: 'c2', name: 'Pastor Lisa Brooks', initials: 'SO', role: 'Care Pastor' },
      { id: 'c6', name: 'Deacon Michael Ibe', initials: 'MI', role: 'Deacon' },
    ],
    visibility: 'private',
    join_policy: 'invite',
    posting_permissions: 'everyone',
    created_at: '2025-02-01',
    last_activity_at: '1 hr ago',
    last_activity_ms: Date.now() - 3600000,
    unread_count: 1,
    pinned_room: false,
    archived_room: false,
    quick_links: [
      { id: 'ql4', label: 'Visit Schedule', url: '#', icon: 'calendar' },
    ],
    audit_log: [
      { id: 'a4', action: 'room_created', actor: 'Pastor Lisa Brooks', detail: 'Created room', timestamp: 'Feb 1, 2025', timestamp_ms: 1706745600000 },
      { id: 'a5', action: 'permission_changed', actor: 'Pastor James Carter', detail: 'Set visibility to private', timestamp: 'Feb 2, 2025', timestamp_ms: 1706832000000 },
    ],
    avatarColor: '#EF4444',
    lastMessage: 'Hospital visit scheduled for Brother Taiwo — Room 412',
  },
  {
    room_id: 'cr-004',
    mode: 'church',
    room_type: 'ministry',
    scope_object: 'ministry',
    title: 'Worship Ministry',
    context_line: 'Worship team planning & rehearsal',
    members: [
      { id: 'c7', name: 'David Brooks', initials: 'DE', role: 'Worship Leader' },
      { id: 'c8', name: 'Blessing Ajayi', initials: 'BA', role: 'Vocalist' },
      { id: 'c9', name: 'Samuel Okoro', initials: 'SO', role: 'Keyboardist' },
    ],
    visibility: 'discoverable',
    join_policy: 'request',
    posting_permissions: 'everyone',
    created_at: '2025-03-01',
    last_activity_at: '3 hr ago',
    last_activity_ms: Date.now() - 10800000,
    unread_count: 0,
    pinned_room: false,
    archived_room: false,
    quick_links: [
      { id: 'ql5', label: 'Song List', url: '#', icon: 'music.note.list' },
      { id: 'ql6', label: 'Rehearsal Schedule', url: '#', icon: 'calendar' },
    ],
    audit_log: [
      { id: 'a6', action: 'room_created', actor: 'David Brooks', detail: 'Created room', timestamp: 'Mar 1, 2025', timestamp_ms: 1709251200000 },
    ],
    avatarColor: '#1D9BF0',
    lastMessage: 'Sunday setlist is finalized — rehearsal Thursday 7pm',
  },
  {
    room_id: 'cr-005',
    mode: 'church',
    room_type: 'small-group',
    scope_object: 'ministry',
    title: 'Men\'s Fellowship',
    context_line: 'Men\'s small group',
    members: [
      { id: 'c3', name: 'Elder James Wright', initials: 'JW', role: 'Group Leader' },
      { id: 'c10', name: 'Brother Chidi Amadi', initials: 'CA', role: 'Member' },
    ],
    visibility: 'discoverable',
    join_policy: 'open',
    posting_permissions: 'everyone',
    created_at: '2025-04-01',
    last_activity_at: '2 days ago',
    last_activity_ms: Date.now() - 172800000,
    unread_count: 0,
    pinned_room: false,
    archived_room: false,
    quick_links: [],
    audit_log: [
      { id: 'a7', action: 'room_created', actor: 'Elder James Wright', detail: 'Created room', timestamp: 'Apr 1, 2025', timestamp_ms: 1711929600000 },
    ],
    avatarColor: '#22C55E',
    lastMessage: 'Next Saturday — breakfast devotional at 8am',
  },
  {
    room_id: 'cr-006',
    mode: 'church',
    room_type: 'youth-ministry',
    scope_object: 'ministry',
    title: 'Youth Ministry',
    context_line: 'Youth & teen coordination',
    members: [
      { id: 'c11', name: 'Minister David Balogun', initials: 'TB', role: 'Youth Pastor' },
      { id: 'c12', name: 'Sister Nneka Obi', initials: 'NO', role: 'Youth Leader' },
      { id: 'c13', name: 'Brother Michael Udoh', initials: 'EU', role: 'Volunteer' },
    ],
    visibility: 'discoverable',
    join_policy: 'request',
    posting_permissions: 'everyone',
    created_at: '2025-05-01',
    last_activity_at: '6 hr ago',
    last_activity_ms: Date.now() - 21600000,
    unread_count: 3,
    pinned_room: false,
    archived_room: false,
    quick_links: [
      { id: 'ql7', label: 'Event Calendar', url: '#', icon: 'calendar' },
    ],
    audit_log: [
      { id: 'a8', action: 'room_created', actor: 'Minister David Balogun', detail: 'Created room', timestamp: 'May 1, 2025', timestamp_ms: 1714521600000 },
      { id: 'a9', action: 'member_added', actor: 'Minister David Balogun', detail: 'Added Nneka Obi & Emeka Udoh', timestamp: 'May 2, 2025', timestamp_ms: 1714608000000 },
    ],
    avatarColor: '#1D9BF0',
    lastMessage: 'Youth retreat registration closes this Friday!',
  },
  {
    room_id: 'cr-007',
    mode: 'church',
    room_type: 'new-members',
    scope_object: 'church',
    title: 'New Members Class',
    context_line: 'Onboarding & orientation',
    members: [
      { id: 'c2', name: 'Pastor Lisa Brooks', initials: 'SO', role: 'Pastor' },
      { id: 'c14', name: 'Deaconess Angela Ade', initials: 'FA', role: 'Coordinator' },
    ],
    visibility: 'discoverable',
    join_policy: 'open',
    posting_permissions: 'staff-only',
    created_at: '2025-06-01',
    last_activity_at: 'Yesterday',
    last_activity_ms: Date.now() - 86400000,
    unread_count: 0,
    pinned_room: false,
    archived_room: false,
    quick_links: [
      { id: 'ql8', label: 'Welcome Guide', url: '#', icon: 'book.fill' },
    ],
    audit_log: [
      { id: 'a10', action: 'room_created', actor: 'Pastor Lisa Brooks', detail: 'Created room', timestamp: 'Jun 1, 2025', timestamp_ms: 1717200000000 },
    ],
    avatarColor: '#1D9BF0',
    lastMessage: 'Welcome to KaNeXT Church! Next orientation is Sunday March 1 after service.',
  },
];

const BUSINESS_ROOMS: Room[] = [
  {
    room_id: 'br-001',
    mode: 'business',
    room_type: 'all-hands',
    scope_object: 'company',
    title: 'All-Hands',
    context_line: 'Company-wide announcements',
    members: [
      { id: 'b1', name: 'Alex Rivera', initials: 'AR', role: 'CEO' },
      { id: 'b2', name: 'Jordan Lee', initials: 'JL', role: 'COO' },
      { id: 'b3', name: 'Priya Patel', initials: 'PP', role: 'CTO' },
      { id: 'b4', name: '48 others', initials: '48', role: 'Team' },
    ],
    visibility: 'public-read',
    join_policy: 'open',
    posting_permissions: 'admins-only',
    created_at: '2025-01-01',
    last_activity_at: '15 min ago',
    last_activity_ms: Date.now() - 900000,
    unread_count: 1,
    pinned_room: true,
    archived_room: false,
    quick_links: [
      { id: 'ql1', label: 'Company Wiki', url: '#', icon: 'book.fill' },
      { id: 'ql2', label: 'OKRs', url: '#', icon: 'target' },
    ],
    audit_log: [
      { id: 'a1', action: 'room_created', actor: 'Alex Rivera', detail: 'Created room', timestamp: 'Jan 1, 2025', timestamp_ms: 1704067200000 },
      { id: 'a2', action: 'permission_changed', actor: 'Alex Rivera', detail: 'Set posting to admins-only', timestamp: 'Jan 1, 2025', timestamp_ms: 1704070800000 },
    ],
    avatarColor: '#1D9BF0',
    lastMessage: 'Q1 all-hands meeting moved to Friday 3pm — see you there',
  },
  {
    room_id: 'br-002',
    mode: 'business',
    room_type: 'leadership',
    scope_object: 'company',
    title: 'Leadership Team',
    context_line: 'C-suite & VP coordination',
    members: [
      { id: 'b1', name: 'Alex Rivera', initials: 'AR', role: 'CEO' },
      { id: 'b2', name: 'Jordan Lee', initials: 'JL', role: 'COO' },
      { id: 'b3', name: 'Priya Patel', initials: 'PP', role: 'CTO' },
    ],
    visibility: 'private',
    join_policy: 'invite',
    posting_permissions: 'everyone',
    created_at: '2025-01-01',
    last_activity_at: '30 min ago',
    last_activity_ms: Date.now() - 1800000,
    unread_count: 3,
    pinned_room: true,
    archived_room: false,
    quick_links: [
      { id: 'ql3', label: 'Board Deck', url: '#', icon: 'doc.text.fill' },
      { id: 'ql4', label: 'Financial Model', url: '#', icon: 'chart.line.uptrend.xyaxis' },
    ],
    audit_log: [
      { id: 'a3', action: 'room_created', actor: 'Alex Rivera', detail: 'Created room', timestamp: 'Jan 1, 2025', timestamp_ms: 1704067200000 },
    ],
    avatarColor: '#1D9BF0',
    lastMessage: 'Board meeting prep — need revenue slides by Thursday',
  },
  {
    room_id: 'br-003',
    mode: 'business',
    room_type: 'ops',
    scope_object: 'company',
    title: 'Operations',
    context_line: 'Day-to-day ops coordination',
    members: [
      { id: 'b2', name: 'Jordan Lee', initials: 'JL', role: 'COO' },
      { id: 'b5', name: 'Morgan Chen', initials: 'MC', role: 'Ops Manager' },
      { id: 'b6', name: 'Taylor Kim', initials: 'TK', role: 'Ops Analyst' },
    ],
    visibility: 'discoverable',
    join_policy: 'request',
    posting_permissions: 'everyone',
    created_at: '2025-02-01',
    last_activity_at: '1 hr ago',
    last_activity_ms: Date.now() - 3600000,
    unread_count: 0,
    pinned_room: false,
    archived_room: false,
    quick_links: [
      { id: 'ql5', label: 'Runbook', url: '#', icon: 'doc.text.fill' },
    ],
    audit_log: [
      { id: 'a4', action: 'room_created', actor: 'Jordan Lee', detail: 'Created room', timestamp: 'Feb 1, 2025', timestamp_ms: 1706745600000 },
      { id: 'a5', action: 'member_added', actor: 'Jordan Lee', detail: 'Added ops team', timestamp: 'Feb 1, 2025', timestamp_ms: 1706749200000 },
    ],
    avatarColor: '#22C55E',
    lastMessage: 'Vendor contract renewal — need sign-off by EOW',
  },
  {
    room_id: 'br-004',
    mode: 'business',
    room_type: 'department',
    scope_object: 'department',
    title: 'Engineering',
    context_line: 'Engineering department',
    members: [
      { id: 'b3', name: 'Priya Patel', initials: 'PP', role: 'CTO' },
      { id: 'b7', name: 'Sam Okafor', initials: 'SO', role: 'Eng Manager' },
      { id: 'b8', name: 'Casey Rodriguez', initials: 'CR', role: 'Staff Engineer' },
    ],
    visibility: 'discoverable',
    join_policy: 'request',
    posting_permissions: 'everyone',
    created_at: '2025-02-15',
    last_activity_at: '45 min ago',
    last_activity_ms: Date.now() - 2700000,
    unread_count: 5,
    pinned_room: false,
    archived_room: false,
    quick_links: [
      { id: 'ql6', label: 'Sprint Board', url: '#', icon: 'rectangle.grid.1x2.fill' },
      { id: 'ql7', label: 'Docs', url: '#', icon: 'doc.text.fill' },
    ],
    audit_log: [
      { id: 'a6', action: 'room_created', actor: 'Priya Patel', detail: 'Created room', timestamp: 'Feb 15, 2025', timestamp_ms: 1707955200000 },
    ],
    avatarColor: '#F59E0B',
    lastMessage: 'Deploy freeze lifted — ship when ready',
  },
  {
    room_id: 'br-005',
    mode: 'business',
    room_type: 'project',
    scope_object: 'department',
    title: 'Project Phoenix',
    context_line: 'Platform migration project',
    members: [
      { id: 'b7', name: 'Sam Okafor', initials: 'SO', role: 'Tech Lead' },
      { id: 'b8', name: 'Casey Rodriguez', initials: 'CR', role: 'Staff Engineer' },
    ],
    visibility: 'private',
    join_policy: 'invite',
    posting_permissions: 'everyone',
    created_at: '2025-11-01',
    last_activity_at: '2 hr ago',
    last_activity_ms: Date.now() - 7200000,
    unread_count: 2,
    pinned_room: false,
    archived_room: false,
    quick_links: [
      { id: 'ql8', label: 'Roadmap', url: '#', icon: 'map.fill' },
      { id: 'ql9', label: 'Design Specs', url: '#', icon: 'paintbrush.fill' },
    ],
    audit_log: [
      { id: 'a7', action: 'room_created', actor: 'Sam Okafor', detail: 'Created room', timestamp: 'Nov 1, 2025', timestamp_ms: 1730419200000 },
      { id: 'a8', action: 'share_link', actor: 'Casey Rodriguez', detail: 'Shared architecture diagram', timestamp: 'Feb 10, 2026', timestamp_ms: Date.now() - 518400000 },
    ],
    avatarColor: '#EF4444',
    lastMessage: 'Migration script passed staging tests — ready for prod',
  },
  {
    room_id: 'br-006',
    mode: 'business',
    room_type: 'deal',
    scope_object: 'quarter',
    title: 'Acme Corp Deal',
    context_line: '$2.4M enterprise contract',
    members: [
      { id: 'b9', name: 'Jamie Torres', initials: 'JT', role: 'AE' },
      { id: 'b10', name: 'Riley Brown', initials: 'RB', role: 'Solutions Engineer' },
    ],
    visibility: 'private',
    join_policy: 'invite',
    posting_permissions: 'everyone',
    created_at: '2026-01-15',
    last_activity_at: '4 hr ago',
    last_activity_ms: Date.now() - 14400000,
    unread_count: 0,
    pinned_room: false,
    archived_room: false,
    quick_links: [
      { id: 'ql10', label: 'Proposal', url: '#', icon: 'doc.text.fill' },
      { id: 'ql11', label: 'CRM Record', url: '#', icon: 'person.crop.circle.badge.checkmark' },
    ],
    audit_log: [
      { id: 'a9', action: 'room_created', actor: 'Jamie Torres', detail: 'Created deal room', timestamp: 'Jan 15, 2026', timestamp_ms: Date.now() - 2764800000 },
    ],
    avatarColor: '#1D9BF0',
    lastMessage: 'Legal review on MSA complete — ready for signature',
  },
  {
    room_id: 'br-007',
    mode: 'business',
    room_type: 'client',
    scope_object: 'company',
    title: 'GlobalTech Support',
    context_line: 'Client-facing support channel',
    members: [
      { id: 'b11', name: 'Drew Singh', initials: 'DS', role: 'CSM' },
      { id: 'b12', name: 'Avery Nakamura', initials: 'AN', role: 'Support Lead' },
    ],
    visibility: 'private',
    join_policy: 'invite',
    posting_permissions: 'everyone',
    created_at: '2025-06-01',
    last_activity_at: 'Yesterday',
    last_activity_ms: Date.now() - 86400000,
    unread_count: 0,
    pinned_room: false,
    archived_room: false,
    quick_links: [
      { id: 'ql12', label: 'SLA Dashboard', url: '#', icon: 'chart.bar.fill' },
    ],
    audit_log: [
      { id: 'a10', action: 'room_created', actor: 'Drew Singh', detail: 'Created client room', timestamp: 'Jun 1, 2025', timestamp_ms: 1717200000000 },
    ],
    avatarColor: '#1D9BF0',
    lastMessage: 'Integration issue resolved — ticket #4521 closed',
  },
];

const COMMUNITY_ROOMS: Room[] = [
  {
    room_id: 'xr-001',
    mode: 'competition',
    room_type: 'competition-ops',
    scope_object: 'competition',
    title: 'KaNeXT Race Ops',
    context_line: 'Competition-wide operations',
    members: [
      { id: 'x1', name: 'Director Marcus Hall', initials: 'MH', role: 'Race Director' },
      { id: 'x2', name: 'Sarah Nakamura', initials: 'SN', role: 'Ops Lead' },
      { id: 'x3', name: 'Diego Fuentes', initials: 'DF', role: 'Safety Officer' },
    ],
    visibility: 'private',
    join_policy: 'invite',
    posting_permissions: 'everyone',
    created_at: '2025-10-01',
    last_activity_at: '8 min ago',
    last_activity_ms: Date.now() - 480000,
    unread_count: 4,
    pinned_room: true,
    archived_room: false,
    quick_links: [
      { id: 'ql1', label: 'Race Calendar', url: '#', icon: 'calendar' },
      { id: 'ql2', label: 'Safety Manual', url: '#', icon: 'shield.checkered' },
    ],
    audit_log: [
      { id: 'a1', action: 'room_created', actor: 'Director Marcus Hall', detail: 'Created room', timestamp: 'Oct 1, 2025', timestamp_ms: 1727740800000 },
      { id: 'a2', action: 'member_added', actor: 'Director Marcus Hall', detail: 'Added ops staff', timestamp: 'Oct 1, 2025', timestamp_ms: 1727744400000 },
    ],
    avatarColor: '#EF4444',
    lastMessage: 'Track inspection complete — all clear for qualifying',
  },
  {
    room_id: 'xr-002',
    mode: 'competition',
    room_type: 'team-reps',
    scope_object: 'competition',
    title: 'Team Representatives',
    context_line: 'Team liaison channel',
    members: [
      { id: 'x4', name: 'Tom Bradley', initials: 'TB', role: 'Team Rep — Apex' },
      { id: 'x5', name: 'Kenji Tanaka', initials: 'KT', role: 'Team Rep — Velocity' },
      { id: 'x6', name: 'Anna Petrov', initials: 'AP', role: 'Team Rep — Nova' },
    ],
    visibility: 'private',
    join_policy: 'invite',
    posting_permissions: 'everyone',
    created_at: '2025-10-15',
    last_activity_at: '1 hr ago',
    last_activity_ms: Date.now() - 3600000,
    unread_count: 2,
    pinned_room: true,
    archived_room: false,
    quick_links: [
      { id: 'ql3', label: 'Rulebook', url: '#', icon: 'book.fill' },
    ],
    audit_log: [
      { id: 'a3', action: 'room_created', actor: 'Sarah Nakamura', detail: 'Created room', timestamp: 'Oct 15, 2025', timestamp_ms: 1728950400000 },
    ],
    avatarColor: '#1D9BF0',
    lastMessage: 'Updated pit allocation map posted — check your assignments',
  },
  {
    room_id: 'xr-003',
    mode: 'competition',
    room_type: 'officials',
    scope_object: 'competition',
    title: 'Race Officials',
    context_line: 'Stewards & marshals',
    members: [
      { id: 'x7', name: 'Chief Stewart Roberts', initials: 'SR', role: 'Chief Steward' },
      { id: 'x8', name: 'Marshal Chen', initials: 'MC', role: 'Track Marshal' },
    ],
    visibility: 'private',
    join_policy: 'invite',
    posting_permissions: 'everyone',
    created_at: '2025-11-01',
    last_activity_at: '3 hr ago',
    last_activity_ms: Date.now() - 10800000,
    unread_count: 0,
    pinned_room: false,
    archived_room: false,
    quick_links: [
      { id: 'ql4', label: 'Penalty Guide', url: '#', icon: 'exclamationmark.triangle.fill' },
      { id: 'ql5', label: 'Flag Protocols', url: '#', icon: 'flag.fill' },
    ],
    audit_log: [
      { id: 'a4', action: 'room_created', actor: 'Chief Stewart Roberts', detail: 'Created room', timestamp: 'Nov 1, 2025', timestamp_ms: 1730419200000 },
      { id: 'a5', action: 'permission_changed', actor: 'Director Marcus Hall', detail: 'Set to private/invite', timestamp: 'Nov 2, 2025', timestamp_ms: 1730505600000 },
    ],
    avatarColor: '#F59E0B',
    lastMessage: 'Incident report from Lap 12 — under review',
  },
  {
    room_id: 'xr-004',
    mode: 'competition',
    room_type: 'event-weekend-staff',
    scope_object: 'event-weekend',
    title: 'Round 3 — Lakeside',
    context_line: 'Feb 22-23 event weekend',
    members: [
      { id: 'x2', name: 'Sarah Nakamura', initials: 'SN', role: 'Ops Lead' },
      { id: 'x9', name: 'Lisa Park', initials: 'LP', role: 'Logistics' },
      { id: 'x10', name: 'Mike Johnson', initials: 'MJ', role: 'Venue Contact' },
    ],
    visibility: 'private',
    join_policy: 'invite',
    posting_permissions: 'everyone',
    created_at: '2026-02-01',
    last_activity_at: '25 min ago',
    last_activity_ms: Date.now() - 1500000,
    unread_count: 3,
    pinned_room: false,
    archived_room: false,
    quick_links: [
      { id: 'ql6', label: 'Run Sheet', url: '#', icon: 'doc.text.fill' },
      { id: 'ql7', label: 'Venue Map', url: '#', icon: 'map.fill' },
    ],
    audit_log: [
      { id: 'a6', action: 'room_created', actor: 'System', detail: 'Auto-created for Round 3', timestamp: 'Feb 1, 2026', timestamp_ms: Date.now() - 1296000000 },
    ],
    avatarColor: '#22C55E',
    lastMessage: 'Vendor load-in starts Friday 6am — gate codes sent via DM',
  },
  {
    room_id: 'xr-005',
    mode: 'competition',
    room_type: 'broadcast-streaming',
    scope_object: 'competition',
    title: 'Broadcast Team',
    context_line: 'Streaming & broadcast ops',
    members: [
      { id: 'x11', name: 'Chris Donovan', initials: 'CD', role: 'Broadcast Director' },
      { id: 'x12', name: 'Yuki Sato', initials: 'YS', role: 'Camera Op' },
    ],
    visibility: 'private',
    join_policy: 'invite',
    posting_permissions: 'everyone',
    created_at: '2025-11-15',
    last_activity_at: '5 hr ago',
    last_activity_ms: Date.now() - 18000000,
    unread_count: 0,
    pinned_room: false,
    archived_room: false,
    quick_links: [
      { id: 'ql8', label: 'Stream Config', url: '#', icon: 'antenna.radiowaves.left.and.right' },
    ],
    audit_log: [
      { id: 'a7', action: 'room_created', actor: 'Chris Donovan', detail: 'Created room', timestamp: 'Nov 15, 2025', timestamp_ms: 1731628800000 },
    ],
    avatarColor: '#1D9BF0',
    lastMessage: 'Camera positions locked in — doing test stream at 2pm',
  },
  {
    room_id: 'xr-006',
    mode: 'competition',
    room_type: 'sponsors',
    scope_object: 'competition',
    title: 'Sponsor Relations',
    context_line: 'Sponsor communication & deliverables',
    members: [
      { id: 'x13', name: 'Dana Wells', initials: 'DW', role: 'Partnerships Director' },
      { id: 'x14', name: 'Ryan Cole', initials: 'RC', role: 'Brand Manager' },
    ],
    visibility: 'private',
    join_policy: 'invite',
    posting_permissions: 'staff-only',
    created_at: '2025-10-01',
    last_activity_at: '1 day ago',
    last_activity_ms: Date.now() - 86400000,
    unread_count: 0,
    pinned_room: false,
    archived_room: false,
    quick_links: [
      { id: 'ql9', label: 'Sponsor Deck', url: '#', icon: 'doc.text.fill' },
    ],
    audit_log: [
      { id: 'a8', action: 'room_created', actor: 'Dana Wells', detail: 'Created room', timestamp: 'Oct 1, 2025', timestamp_ms: 1727740800000 },
      { id: 'a9', action: 'share_link', actor: 'Ryan Cole', detail: 'Shared brand guidelines', timestamp: 'Jan 20, 2026', timestamp_ms: Date.now() - 2332800000 },
    ],
    avatarColor: '#1D9BF0',
    lastMessage: 'TechFlow confirmed as title sponsor for Round 4',
  },
];

export const MOCK_ROOMS: Record<Mode, Room[]> = {
  sports: SPORTS_ROOMS,
  education: EDUCATION_ROOMS,
  church: CHURCH_ROOMS,
  business: BUSINESS_ROOMS,
  competition: COMMUNITY_ROOMS,
};

// =============================================================================
// ROOM REQUESTS
// =============================================================================

export const ROOM_REQUESTS: Record<Mode, RoomRequest[]> = {
  sports: [
    { id: 'rr-s1', room_id: 'sr-007', room_title: 'MBB Player Development', requester_name: 'James Porter', requester_initials: 'JP', request_type: 'join', message: 'Would like to contribute to the development program', timestamp: '2 hr ago' },
    { id: 'rr-s2', room_id: 'sr-002', room_title: 'MBB Team', requester_name: 'New Transfer', requester_initials: 'NT', request_type: 'invite', timestamp: '1 day ago' },
    { id: 'rr-s3', room_id: 'sr-003', room_title: 'MBB Recruiting', requester_name: 'Scout Williams', requester_initials: 'SW', request_type: 'join', message: 'Regional scout — requesting access', timestamp: '3 hr ago' },
  ],
  education: [
    { id: 'rr-e1', room_id: 'er-004', room_title: 'Computer Science Dept', requester_name: 'Dr. Linda Chang', requester_initials: 'LC', request_type: 'join', message: 'New adjunct faculty starting Spring', timestamp: '4 hr ago' },
    { id: 'rr-e2', room_id: 'er-007', room_title: 'Faculty Lounge', requester_name: 'Prof. Mark Davis', requester_initials: 'MD', request_type: 'join', timestamp: '1 day ago' },
  ],
  church: [
    { id: 'rr-c1', room_id: 'cr-004', room_title: 'Worship Ministry', requester_name: 'Sister Angela Bello', requester_initials: 'AB', request_type: 'join', message: 'I play drums and would love to serve', timestamp: '6 hr ago' },
    { id: 'rr-c2', room_id: 'cr-006', room_title: 'Youth Ministry', requester_name: 'Brother Daniel Obi', requester_initials: 'DO', request_type: 'join', message: 'Interested in volunteering with the youth', timestamp: '1 day ago' },
    { id: 'rr-c3', room_id: 'cr-005', room_title: "Men's Fellowship", requester_name: 'New Member Ade', requester_initials: 'NA', request_type: 'join', timestamp: '2 days ago' },
  ],
  competition: [
    { id: 'rr-x1', room_id: 'xr-002', room_title: 'Team Representatives', requester_name: 'New Team — Blaze Racing', requester_initials: 'BR', request_type: 'join', message: 'Registered for Season 1 — requesting rep access', timestamp: '5 hr ago' },
    { id: 'rr-x2', room_id: 'xr-005', room_title: 'Broadcast Team', requester_name: 'Freelance — Kai Wu', requester_initials: 'KW', request_type: 'join', message: 'Freelance camera operator available for Round 3', timestamp: '1 day ago' },
  ],
  business: [
    { id: 'rr-b1', room_id: 'br-004', room_title: 'Engineering', requester_name: 'New Hire — Wei Zhang', requester_initials: 'WZ', request_type: 'invite', timestamp: '3 hr ago' },
    { id: 'rr-b2', room_id: 'br-003', room_title: 'Operations', requester_name: 'Contractor — Lisa Park', requester_initials: 'LP', request_type: 'join', message: 'Onboarding as ops contractor', timestamp: '1 day ago' },
  ],
};

// =============================================================================
// ROOM SETTINGS
// =============================================================================

export const ROOM_SETTINGS: Record<Mode, RoomSettingToggle[]> = {
  sports: [
    { id: 'ss-1', label: 'Auto-archive game rooms 72h post-game', description: 'Game day rooms auto-archive 72 hours after final whistle', enabled: true },
    { id: 'ss-2', label: 'Allow players to create rooms', description: 'Players can create their own team rooms', enabled: false },
    { id: 'ss-3', label: 'Enable parent/guardian rooms', description: 'Allow creation of parent/guardian communication rooms', enabled: true },
    { id: 'ss-4', label: 'Require staff approval for new rooms', description: 'All new rooms need coaching staff sign-off', enabled: true },
    { id: 'ss-5', label: 'Auto-create game rooms', description: 'Automatically create a room for each scheduled game', enabled: true },
  ],
  education: [
    { id: 'se-1', label: 'Archive rooms on term rollover', description: 'Automatically archive course rooms at end of term', enabled: true },
    { id: 'se-2', label: 'Enable Q&A in classroom rooms', description: 'Students can post questions in classroom channels', enabled: true },
    { id: 'se-3', label: 'Auto-enroll students from roster', description: 'Students auto-join classroom rooms from course roster', enabled: true },
    { id: 'se-4', label: 'Faculty-only room creation', description: 'Only faculty and staff can create new rooms', enabled: false },
  ],
  church: [
    { id: 'sc-1', label: 'Allow prayer request rooms', description: 'Members can create prayer request channels', enabled: true },
    { id: 'sc-2', label: 'Require leadership approval', description: 'New rooms require pastoral leadership approval', enabled: true },
    { id: 'sc-3', label: 'Auto-pin ministry rooms', description: 'Ministry rooms are pinned by default', enabled: false },
    { id: 'sc-4', label: 'Enable anonymous prayer requests', description: 'Allow anonymous posts in prayer rooms', enabled: true },
    { id: 'sc-5', label: 'Auto-create small group rooms', description: 'Auto-create rooms when new small groups register', enabled: true },
  ],
  competition: [
    { id: 'sx-1', label: 'Auto-create event weekend rooms', description: 'Rooms auto-created for each scheduled event weekend', enabled: true },
    { id: 'sx-2', label: 'Auto-create incident rooms', description: 'Incident rooms auto-created on flag trigger', enabled: true },
    { id: 'sx-3', label: 'Restrict media room posting', description: 'Media room posting limited to broadcast staff', enabled: true },
    { id: 'sx-4', label: 'Auto-archive post-event rooms', description: 'Event rooms auto-archive 48h after conclusion', enabled: true },
  ],
  business: [
    { id: 'sb-1', label: 'Auto-create project rooms', description: 'Rooms auto-created when new projects are spun up', enabled: true },
    { id: 'sb-2', label: 'Auto-create deal rooms', description: 'Rooms auto-created for deals above $100K', enabled: true },
    { id: 'sb-3', label: 'Enable client/partner rooms', description: 'Allow client-facing communication channels', enabled: true },
    { id: 'sb-4', label: 'Require manager approval', description: 'New rooms need manager approval before creation', enabled: false },
  ],
};

// =============================================================================
// SORT FUNCTION
// =============================================================================

export function sortRoomsForInbox(rooms: Room[]): Room[] {
  return [...rooms]
    .filter((r) => !r.archived_room)
    .sort((a, b) => {
      // Pinned first
      if (a.pinned_room !== b.pinned_room) return a.pinned_room ? -1 : 1;
      // Then by unread count desc
      if (a.unread_count !== b.unread_count) return b.unread_count - a.unread_count;
      // Then by last activity desc
      return b.last_activity_ms - a.last_activity_ms;
    });
}
