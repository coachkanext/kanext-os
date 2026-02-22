/**
 * Church Ministries v3 — Comprehensive Ministry Directory & Hub Data
 *
 * Extends the original ministry data (mock-ministries.ts) into full canonical
 * ministry objects with leaders, members, events, teachings, packs, actions,
 * resources, and audit log. Used by the Church Mode ministries hub.
 *
 * All names consistent with KaNeXT Church (KaNeXT Church)
 * Nigerian/African-diaspora church context.
 */

// =============================================================================
// TYPES
// =============================================================================

/** Ministry lifecycle status */
export type MinistryStatus = 'active' | 'seasonal' | 'paused' | 'archived';

/** Ministry visibility level */
export type MinistryVisibility = 'private' | 'discoverable' | 'public-read';

/** How members join a ministry */
export type MinistryJoinPolicy = 'invite' | 'request' | 'open';

/** Who can post inside the ministry room */
export type MinistryPostingPermission = 'everyone' | 'leaders-only' | 'admins-only';

/** The 11 ministry category chips (excludes "All") */
export type MinistryCategory =
  | 'discipleship'
  | 'youth'
  | 'men'
  | 'women'
  | 'young-adults'
  | 'outreach-service'
  | 'worship-media'
  | 'prayer'
  | 'care'
  | 'education-catechism'
  | 'operations-volunteers';

/** Category chip for the horizontal filter strip */
export interface CategoryChip {
  key: MinistryCategory | 'all';
  label: string;
}

/** Ministry leader record */
export interface MinistryLeader {
  id: string;
  name: string;
  initials: string;
  role: string;
  avatarColor: string;
}

/** Ministry member record (simplified) */
export interface MinistryMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  avatarColor: string;
  joinedAt: string;
}

/** Canonical Ministry object — full directory record */
export interface MinistryFull {
  id: string;
  churchId: string;
  name: string;
  category: MinistryCategory;
  description: string;
  icon: string;
  leaders: MinistryLeader[];
  members: MinistryMember[];
  memberCount: number;
  status: MinistryStatus;
  visibility: MinistryVisibility;
  joinPolicy: MinistryJoinPolicy;
  postingPermissions: MinistryPostingPermission;
  meetingPattern?: string;
  nextEvent?: { title: string; date: string; time: string; location: string };
  avatarColor: string;
  hasRoom: boolean;
  roomId?: string;
  createdAt: string;
  lastActivityAt: string;
  lastActivityMs: number;
}

/** Tab identifier for the ministry hub screen */
export type MinistryHubTabId =
  | 'overview'
  | 'room'
  | 'events'
  | 'teachings'
  | 'packs'
  | 'actions'
  | 'people'
  | 'resources'
  | 'operations'
  | 'finance'
  | 'audit'
  | 'settings';

/** Ministry hub tab definition */
export interface MinistryHubTab {
  id: MinistryHubTabId;
  label: string;
}

/** Ministry event (extended with description) */
export interface MinistryEvent {
  id: string;
  ministryId: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'regular' | 'special' | 'outreach' | 'retreat';
  description?: string;
}

/** Ministry teaching record */
export interface MinistryTeachingV3 {
  id: string;
  ministryId: string;
  title: string;
  speaker: string;
  date: string;
  duration: string;
  series?: string;
  type: 'sermon' | 'lesson' | 'devotional' | 'training';
}

/** Ministry pack (study / lesson pack) */
export interface MinistryPack {
  id: string;
  ministryId: string;
  title: string;
  description: string;
  lessons: number;
  duration: string;
  status: 'active' | 'upcoming' | 'completed';
}

/** Ministry action (discipleship action / volunteer need / admin task) */
export interface MinistryActionV3 {
  id: string;
  ministryId: string;
  title: string;
  assignee: string;
  assigneeInitials: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  type: 'discipleship' | 'volunteer' | 'admin';
}

/** Ministry resource */
export interface MinistryResourceV3 {
  id: string;
  ministryId: string;
  title: string;
  type: 'document' | 'video' | 'audio' | 'link' | 'template';
  date: string;
}

/** Ministry audit log entry */
export interface MinistryAuditEntry {
  id: string;
  ministryId: string;
  action: string;
  actor: string;
  timestamp: string;
  timestampMs: number;
  description: string;
}

/** Scope chip for the directory-level scope filter */
export interface MinistryScopeChip {
  key: string;
  label: string;
}

/** Filter state for the ministry directory */
export interface MinistryFilterState {
  categories: (MinistryCategory | 'all')[];
  statuses: MinistryStatus[];
  leadership: 'all' | 'led-by-me' | 'member' | 'discoverable';
  visibility: MinistryVisibility[];
  sort: 'az' | 'next-event' | 'recent' | 'member-count';
}

/** Defaults when creating a new ministry */
export interface CreateMinistryDefaults {
  createRoom: boolean;
  createEventsCalendar: boolean;
  createPacksCollection: boolean;
  createResourcesCollection: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Horizontal category filter chips (including "All") */
export const CATEGORY_CHIPS: CategoryChip[] = [
  { key: 'all', label: 'All' },
  { key: 'discipleship', label: 'Discipleship' },
  { key: 'youth', label: 'Youth' },
  { key: 'men', label: 'Men' },
  { key: 'women', label: 'Women' },
  { key: 'young-adults', label: 'Young Adults' },
  { key: 'outreach-service', label: 'Outreach / Service' },
  { key: 'worship-media', label: 'Worship / Media' },
  { key: 'prayer', label: 'Prayer' },
  { key: 'care', label: 'Care' },
  { key: 'education-catechism', label: 'Education / Catechism' },
  { key: 'operations-volunteers', label: 'Operations / Volunteers' },
];

/** Directory-level scope chips */
export const MINISTRY_SCOPE_CHIPS: MinistryScopeChip[] = [
  { key: 'all', label: 'All Ministries' },
  { key: 'my', label: 'My Ministries' },
  { key: 'leadership', label: 'Leadership' },
];

/** Hub tab definitions (left-to-right order) */
export const MINISTRY_HUB_TABS: MinistryHubTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'room', label: 'Room' },
  { id: 'events', label: 'Events' },
  { id: 'teachings', label: 'Teachings' },
  { id: 'packs', label: 'Packs' },
  { id: 'actions', label: 'Actions' },
  { id: 'people', label: 'People' },
  { id: 'resources', label: 'Resources' },
  { id: 'operations', label: 'Operations' },
  { id: 'finance', label: 'Finance' },
  { id: 'audit', label: 'Audit' },
  { id: 'settings', label: 'Settings' },
];

/** Status badge color mapping */
export const STATUS_COLOR_MAP: Record<MinistryStatus, string> = {
  active: '#22C55E',
  seasonal: '#F59E0B',
  paused: '#A1A1AA',
  archived: '#A1A1AA',
};

/** SF Symbol icon per ministry category */
export const CATEGORY_ICON_MAP: Record<MinistryCategory, string> = {
  discipleship: 'book.fill',
  youth: 'person.2.fill',
  men: 'figure.stand',
  women: 'figure.stand.dress',
  'young-adults': 'person.3.fill',
  'outreach-service': 'hand.raised.fill',
  'worship-media': 'music.note.list',
  prayer: 'hands.sparkles.fill',
  care: 'heart.fill',
  'education-catechism': 'graduationcap.fill',
  'operations-volunteers': 'gearshape.2.fill',
};

/** Tint color per ministry category */
export const CATEGORY_COLOR_MAP: Record<MinistryCategory, string> = {
  discipleship: '#1D9BF0',
  youth: '#1D9BF0',
  men: '#22C55E',
  women: '#1D9BF0',
  'young-adults': '#1D9BF0',
  'outreach-service': '#1D9BF0',
  'worship-media': '#1D9BF0',
  prayer: '#EF4444',
  care: '#1D9BF0',
  'education-catechism': '#F59E0B',
  'operations-volunteers': '#A1A1AA',
};

/** Defaults for the "Create Ministry" flow */
export const CREATE_DEFAULTS: CreateMinistryDefaults = {
  createRoom: true,
  createEventsCalendar: true,
  createPacksCollection: true,
  createResourcesCollection: true,
};

// =============================================================================
// CHURCH ID
// =============================================================================

const CHURCH_ID = 'church-iccla';

// =============================================================================
// MINISTRIES — 12 canonical ministry objects
// =============================================================================

export const MINISTRIES_FULL: MinistryFull[] = [
  // 1. Sunday Discipleship Groups
  {
    id: 'min-discipleship',
    churchId: CHURCH_ID,
    name: 'Sunday Discipleship Groups',
    category: 'discipleship',
    description:
      'Small-group Bible study and discipleship for all ages every Sunday morning. Groups explore Scripture, share life, and hold each other accountable in faith.',
    icon: 'book.fill',
    leaders: [
      { id: 'ldr-olu', name: 'Deacon Olu Adeyemi', initials: 'OA', role: 'Lead', avatarColor: '#1D9BF0' },
      { id: 'ldr-nkechi', name: 'Sister Nkechi Okafor', initials: 'NO', role: 'Co-Lead', avatarColor: '#1D9BF0' },
    ],
    members: [
      { id: 'mem-001', name: 'Brother Tunde Bakare', initials: 'TB', role: 'Group Facilitator', avatarColor: '#1D9BF0', joinedAt: '2024-09-01' },
      { id: 'mem-002', name: 'Sister Amara Eze', initials: 'AE', role: 'Member', avatarColor: '#1D9BF0', joinedAt: '2024-10-15' },
      { id: 'mem-003', name: 'Brother Chidi Nwosu', initials: 'CN', role: 'Group Facilitator', avatarColor: '#1D9BF0', joinedAt: '2024-11-03' },
      { id: 'mem-004', name: 'Sister Bimpe Akinola', initials: 'BA', role: 'Member', avatarColor: '#1D9BF0', joinedAt: '2025-01-12' },
      { id: 'mem-005', name: 'Brother Femi Ogundimu', initials: 'FO', role: 'Member', avatarColor: '#1D9BF0', joinedAt: '2025-03-20' },
    ],
    memberCount: 42,
    status: 'active',
    visibility: 'discoverable',
    joinPolicy: 'open',
    postingPermissions: 'everyone',
    meetingPattern: 'Sundays at 9:30 AM',
    nextEvent: { title: 'Sunday Discipleship — Romans 8', date: '2026-02-22', time: '9:30 AM', location: 'Fellowship Hall' },
    avatarColor: '#1D9BF0',
    hasRoom: true,
    roomId: 'room-discipleship',
    createdAt: '2023-06-15',
    lastActivityAt: '2026-02-16T08:14:00Z',
    lastActivityMs: 1739693640000,
  },
  // 2. Youth Ministry
  {
    id: 'min-youth',
    churchId: CHURCH_ID,
    name: 'Youth Ministry',
    category: 'youth',
    description:
      'Building the next generation of leaders through fellowship, discipleship, worship, and mentoring for ages 13-25. Friday night gatherings, retreats, and service projects.',
    icon: 'person.2.fill',
    leaders: [
      { id: 'ldr-david', name: 'Brother David Nwachukwu', initials: 'DN', role: 'Lead', avatarColor: '#1D9BF0' },
      { id: 'ldr-kemi', name: 'Sister Kemi Adeola', initials: 'KA', role: 'Co-Lead', avatarColor: '#1D9BF0' },
      { id: 'ldr-seyi', name: 'Brother Seyi Oladipo', initials: 'SO', role: 'Coordinator', avatarColor: '#1D9BF0' },
    ],
    members: [
      { id: 'mem-010', name: 'Sister Chioma Onyekachi', initials: 'CO', role: 'Worship Lead', avatarColor: '#1D9BF0', joinedAt: '2024-08-15' },
      { id: 'mem-011', name: 'Brother Emeka Igwe', initials: 'EI', role: 'Member', avatarColor: '#1D9BF0', joinedAt: '2024-09-20' },
      { id: 'mem-012', name: 'Sister Adaeze Chukwu', initials: 'AC', role: 'Member', avatarColor: '#1D9BF0', joinedAt: '2025-01-05' },
      { id: 'mem-013', name: 'Brother Kolade Ogunlesi', initials: 'KO', role: 'Small Group Leader', avatarColor: '#1D9BF0', joinedAt: '2025-02-10' },
      { id: 'mem-014', name: 'Sister Folake Balogun', initials: 'FB', role: 'Member', avatarColor: '#1D9BF0', joinedAt: '2025-06-01' },
      { id: 'mem-015', name: 'Brother Dayo Ajayi', initials: 'DA', role: 'Member', avatarColor: '#1D9BF0', joinedAt: '2025-09-14' },
    ],
    memberCount: 18,
    status: 'active',
    visibility: 'discoverable',
    joinPolicy: 'request',
    postingPermissions: 'everyone',
    meetingPattern: 'Fridays at 6:30 PM',
    nextEvent: { title: 'Youth Night — Game & Word', date: '2026-02-20', time: '6:30 PM', location: 'Youth Hall' },
    avatarColor: '#1D9BF0',
    hasRoom: true,
    roomId: 'room-youth',
    createdAt: '2023-01-10',
    lastActivityAt: '2026-02-15T21:30:00Z',
    lastActivityMs: 1739655000000,
  },
  // 3. Men's Ministry
  {
    id: 'min-men',
    churchId: CHURCH_ID,
    name: "Men's Ministry",
    category: 'men',
    description:
      'Equipping men to be Godly leaders in their homes, workplaces, and communities. Monthly breakfast fellowship, Bible study, accountability groups, and service.',
    icon: 'figure.stand',
    leaders: [
      { id: 'ldr-emmanuel', name: 'Brother Emmanuel Obi', initials: 'EO', role: 'Lead', avatarColor: '#22C55E' },
      { id: 'ldr-gbenga', name: 'Deacon Gbenga Fashola', initials: 'GF', role: 'Co-Lead', avatarColor: '#22C55E' },
    ],
    members: [
      { id: 'mem-020', name: 'Brother Yinka Olumide', initials: 'YO', role: 'Accountability Lead', avatarColor: '#22C55E', joinedAt: '2024-03-10' },
      { id: 'mem-021', name: 'Brother Chukwuma Okoye', initials: 'CO', role: 'Member', avatarColor: '#22C55E', joinedAt: '2024-06-22' },
      { id: 'mem-022', name: 'Brother Kayode Adeniyi', initials: 'KA', role: 'Member', avatarColor: '#22C55E', joinedAt: '2024-11-08' },
      { id: 'mem-023', name: 'Brother Obinna Aham', initials: 'OA', role: 'Member', avatarColor: '#22C55E', joinedAt: '2025-02-01' },
    ],
    memberCount: 20,
    status: 'active',
    visibility: 'discoverable',
    joinPolicy: 'open',
    postingPermissions: 'everyone',
    meetingPattern: '2nd Saturdays at 8:00 AM',
    nextEvent: { title: "Men's Breakfast Fellowship", date: '2026-03-14', time: '8:00 AM', location: 'Conference Room A' },
    avatarColor: '#22C55E',
    hasRoom: true,
    roomId: 'room-men',
    createdAt: '2023-03-01',
    lastActivityAt: '2026-02-14T16:45:00Z',
    lastActivityMs: 1739551500000,
  },
  // 4. Women's Ministry
  {
    id: 'min-women',
    churchId: CHURCH_ID,
    name: "Women's Ministry",
    category: 'women',
    description:
      'Empowering women through Bible study, prayer, mentorship, and community outreach. Bimonthly gatherings celebrating faith, sisterhood, and service.',
    icon: 'figure.stand.dress',
    leaders: [
      { id: 'ldr-grace', name: 'Sister Grace Adekunle', initials: 'GA', role: 'Lead', avatarColor: '#1D9BF0' },
      { id: 'ldr-ngozi', name: 'Sister Ngozi Amadi', initials: 'NA', role: 'Co-Lead', avatarColor: '#1D9BF0' },
    ],
    members: [
      { id: 'mem-030', name: 'Sister Funke Oladele', initials: 'FO', role: 'Bible Study Lead', avatarColor: '#1D9BF0', joinedAt: '2024-01-15' },
      { id: 'mem-031', name: 'Sister Ifeoma Okwu', initials: 'IO', role: 'Member', avatarColor: '#1D9BF0', joinedAt: '2024-04-20' },
      { id: 'mem-032', name: 'Sister Toyin Bello', initials: 'TB', role: 'Member', avatarColor: '#1D9BF0', joinedAt: '2024-08-10' },
      { id: 'mem-033', name: 'Sister Adaugo Nnaji', initials: 'AN', role: 'Outreach Coordinator', avatarColor: '#1D9BF0', joinedAt: '2025-01-03' },
      { id: 'mem-034', name: 'Sister Yewande Akinsanya', initials: 'YA', role: 'Member', avatarColor: '#1D9BF0', joinedAt: '2025-05-18' },
    ],
    memberCount: 32,
    status: 'active',
    visibility: 'discoverable',
    joinPolicy: 'open',
    postingPermissions: 'everyone',
    meetingPattern: '1st & 3rd Saturdays at 10:00 AM',
    nextEvent: { title: "Women's Prayer Breakfast", date: '2026-03-07', time: '10:00 AM', location: 'Fellowship Hall' },
    avatarColor: '#1D9BF0',
    hasRoom: true,
    roomId: 'room-women',
    createdAt: '2023-02-14',
    lastActivityAt: '2026-02-15T14:20:00Z',
    lastActivityMs: 1739629200000,
  },
  // 5. Young Adults Fellowship
  {
    id: 'min-young-adults',
    churchId: CHURCH_ID,
    name: 'Young Adults Fellowship',
    category: 'young-adults',
    description:
      'A vibrant community for young professionals and college students (ages 18-35) seeking to integrate faith with everyday life through fellowship, Bible study, and social events.',
    icon: 'person.3.fill',
    leaders: [
      { id: 'ldr-tolu', name: 'Brother Tolu Adesanya', initials: 'TA', role: 'Lead', avatarColor: '#1D9BF0' },
      { id: 'ldr-ada', name: 'Sister Ada Uche', initials: 'AU', role: 'Co-Lead', avatarColor: '#1D9BF0' },
    ],
    members: [
      { id: 'mem-040', name: 'Brother Ifeanyi Agu', initials: 'IA', role: 'Worship Lead', avatarColor: '#1D9BF0', joinedAt: '2024-07-01' },
      { id: 'mem-041', name: 'Sister Lola Okeowo', initials: 'LO', role: 'Member', avatarColor: '#1D9BF0', joinedAt: '2024-09-15' },
      { id: 'mem-042', name: 'Brother Uchenna Nwoke', initials: 'UN', role: 'Member', avatarColor: '#1D9BF0', joinedAt: '2025-01-20' },
      { id: 'mem-043', name: 'Sister Temi Oyedele', initials: 'TO', role: 'Social Media', avatarColor: '#1D9BF0', joinedAt: '2025-03-08' },
      { id: 'mem-044', name: 'Brother Jide Alabi', initials: 'JA', role: 'Member', avatarColor: '#1D9BF0', joinedAt: '2025-08-12' },
    ],
    memberCount: 22,
    status: 'active',
    visibility: 'discoverable',
    joinPolicy: 'request',
    postingPermissions: 'everyone',
    meetingPattern: 'Thursdays at 7:30 PM',
    nextEvent: { title: 'Young Adults Bible Study — Philippians', date: '2026-02-19', time: '7:30 PM', location: 'Room 204' },
    avatarColor: '#1D9BF0',
    hasRoom: true,
    roomId: 'room-young-adults',
    createdAt: '2024-01-08',
    lastActivityAt: '2026-02-15T22:10:00Z',
    lastActivityMs: 1739657400000,
  },
  // 6. Outreach & Missions
  {
    id: 'min-outreach',
    churchId: CHURCH_ID,
    name: 'Outreach & Missions',
    category: 'outreach-service',
    description:
      'Serving the local community and supporting global missions through evangelism, humanitarian efforts, food drives, and neighborhood partnerships.',
    icon: 'hand.raised.fill',
    leaders: [
      { id: 'ldr-daniel', name: 'Brother Daniel Ekwueme', initials: 'DE', role: 'Lead', avatarColor: '#1D9BF0' },
      { id: 'ldr-bukola', name: 'Sister Bukola Oni', initials: 'BO', role: 'Coordinator', avatarColor: '#22C55E' },
    ],
    members: [
      { id: 'mem-050', name: 'Brother Nonso Okafor', initials: 'NO', role: 'Logistics', avatarColor: '#22C55E', joinedAt: '2024-02-18' },
      { id: 'mem-051', name: 'Sister Aisha Bello', initials: 'AB', role: 'Member', avatarColor: '#22C55E', joinedAt: '2024-06-30' },
      { id: 'mem-052', name: 'Brother Uche Dimka', initials: 'UD', role: 'Member', avatarColor: '#22C55E', joinedAt: '2025-04-10' },
    ],
    memberCount: 10,
    status: 'active',
    visibility: 'discoverable',
    joinPolicy: 'open',
    postingPermissions: 'everyone',
    meetingPattern: 'Monthly last Saturday',
    nextEvent: { title: 'Community Food Drive', date: '2026-02-28', time: '9:00 AM', location: 'Church Parking Lot' },
    avatarColor: '#1D9BF0',
    hasRoom: true,
    roomId: 'room-outreach',
    createdAt: '2023-05-20',
    lastActivityAt: '2026-02-13T10:00:00Z',
    lastActivityMs: 1739440800000,
  },
  // 7. Worship Team
  {
    id: 'min-worship',
    churchId: CHURCH_ID,
    name: 'Worship Team',
    category: 'worship-media',
    description:
      'Leading the congregation in Spirit-filled worship through music, song, and creative arts every service. Vocalists, instrumentalists, and choir members.',
    icon: 'music.note.list',
    leaders: [
      { id: 'ldr-abimbola', name: 'Sister Abimbola Carter', initials: 'AK', role: 'Lead', avatarColor: '#1D9BF0' },
      { id: 'ldr-femi-w', name: 'Brother Femi Adegoke', initials: 'FA', role: 'Music Director', avatarColor: '#1D9BF0' },
    ],
    members: [
      { id: 'mem-060', name: 'Sister Sade Awolowo', initials: 'SA', role: 'Vocalist', avatarColor: '#1D9BF0', joinedAt: '2023-09-01' },
      { id: 'mem-061', name: 'Brother Kunle Fashanu', initials: 'KF', role: 'Keyboardist', avatarColor: '#1D9BF0', joinedAt: '2023-09-01' },
      { id: 'mem-062', name: 'Sister Mercy Ibekwe', initials: 'MI', role: 'Vocalist', avatarColor: '#1D9BF0', joinedAt: '2024-01-15' },
      { id: 'mem-063', name: 'Brother Dotun Ogundipe', initials: 'DO', role: 'Drummer', avatarColor: '#1D9BF0', joinedAt: '2024-03-20' },
      { id: 'mem-064', name: 'Sister Ronke Balogun', initials: 'RB', role: 'Vocalist', avatarColor: '#1D9BF0', joinedAt: '2024-08-10' },
      { id: 'mem-065', name: 'Brother Emeka Okolie', initials: 'EO', role: 'Bassist', avatarColor: '#1D9BF0', joinedAt: '2025-01-05' },
    ],
    memberCount: 24,
    status: 'active',
    visibility: 'private',
    joinPolicy: 'invite',
    postingPermissions: 'everyone',
    meetingPattern: 'Sundays at 8:00 AM',
    nextEvent: { title: 'Worship Team Rehearsal', date: '2026-02-22', time: '8:00 AM', location: 'Main Sanctuary' },
    avatarColor: '#1D9BF0',
    hasRoom: true,
    roomId: 'room-worship',
    createdAt: '2022-08-01',
    lastActivityAt: '2026-02-16T07:50:00Z',
    lastActivityMs: 1739692200000,
  },
  // 8. Media Ministry
  {
    id: 'min-media',
    churchId: CHURCH_ID,
    name: 'Media Ministry',
    category: 'worship-media',
    description:
      'Managing audio/visual, livestreaming, social media, photography, and creative content for all church services and events.',
    icon: 'video.fill',
    leaders: [
      { id: 'ldr-joy', name: 'Sister Joy Nnamdi', initials: 'JN', role: 'Lead', avatarColor: '#1D9BF0' },
    ],
    members: [
      { id: 'mem-070', name: 'Brother Tunde Ogunleye', initials: 'TO', role: 'Sound Engineer', avatarColor: '#1D9BF0', joinedAt: '2024-01-10' },
      { id: 'mem-071', name: 'Sister Nneka Umeh', initials: 'NU', role: 'Camera Operator', avatarColor: '#1D9BF0', joinedAt: '2024-04-22' },
      { id: 'mem-072', name: 'Brother Tobi Ayeni', initials: 'TA', role: 'Graphics & Social', avatarColor: '#1D9BF0', joinedAt: '2024-08-05' },
      { id: 'mem-073', name: 'Sister Adeola Martins', initials: 'AM', role: 'Livestream Producer', avatarColor: '#1D9BF0', joinedAt: '2025-02-20' },
    ],
    memberCount: 8,
    status: 'active',
    visibility: 'private',
    joinPolicy: 'invite',
    postingPermissions: 'leaders-only',
    meetingPattern: 'Sundays at 7:30 AM',
    nextEvent: { title: 'Livestream Operator Training', date: '2026-02-22', time: '7:30 AM', location: 'Media Booth' },
    avatarColor: '#1D9BF0',
    hasRoom: true,
    roomId: 'room-media',
    createdAt: '2023-04-01',
    lastActivityAt: '2026-02-16T06:30:00Z',
    lastActivityMs: 1739687400000,
  },
  // 9. Prayer Ministry
  {
    id: 'min-prayer',
    churchId: CHURCH_ID,
    name: 'Prayer Ministry',
    category: 'prayer',
    description:
      'Interceding for the church, community, and nations through dedicated prayer gatherings, prayer chains, and weekly corporate prayer nights.',
    icon: 'hands.sparkles.fill',
    leaders: [
      { id: 'ldr-solomon', name: 'Brother Solomon Igwe', initials: 'SI', role: 'Lead', avatarColor: '#EF4444' },
      { id: 'ldr-mama', name: 'Mother Esther Carter', initials: 'EK', role: 'Co-Lead', avatarColor: '#EF4444' },
    ],
    members: [
      { id: 'mem-080', name: 'Sister Blessing Okonkwo', initials: 'BO', role: 'Prayer Chain Lead', avatarColor: '#EF4444', joinedAt: '2023-06-01' },
      { id: 'mem-081', name: 'Brother Ikenna Uzoma', initials: 'IU', role: 'Member', avatarColor: '#EF4444', joinedAt: '2024-01-20' },
      { id: 'mem-082', name: 'Sister Bola Adebisi', initials: 'BA', role: 'Member', avatarColor: '#EF4444', joinedAt: '2024-07-15' },
      { id: 'mem-083', name: 'Brother Akin Olajide', initials: 'AO', role: 'Member', avatarColor: '#EF4444', joinedAt: '2025-03-10' },
    ],
    memberCount: 12,
    status: 'active',
    visibility: 'discoverable',
    joinPolicy: 'open',
    postingPermissions: 'everyone',
    meetingPattern: 'Wednesdays at 7:00 PM',
    nextEvent: { title: 'Night of Prayer & Worship', date: '2026-02-18', time: '7:00 PM', location: 'Prayer Chapel' },
    avatarColor: '#EF4444',
    hasRoom: true,
    roomId: 'room-prayer',
    createdAt: '2022-12-01',
    lastActivityAt: '2026-02-15T20:00:00Z',
    lastActivityMs: 1739649600000,
  },
  // 10. Care Team
  {
    id: 'min-care',
    churchId: CHURCH_ID,
    name: 'Care Team',
    category: 'care',
    description:
      'Providing pastoral care, hospital visits, bereavement support, meal trains, and practical help to members in times of need. Confidential and compassionate ministry.',
    icon: 'heart.fill',
    leaders: [
      { id: 'ldr-bisi', name: 'Sister Bisi Ogunnaike', initials: 'BO', role: 'Lead', avatarColor: '#1D9BF0' },
      { id: 'ldr-pastor-d', name: 'Pastor Dipo Carter', initials: 'DK', role: 'Pastoral Oversight', avatarColor: '#1D9BF0' },
    ],
    members: [
      { id: 'mem-090', name: 'Sister Adetola Fasanya', initials: 'AF', role: 'Visitation Lead', avatarColor: '#1D9BF0', joinedAt: '2023-03-15' },
      { id: 'mem-091', name: 'Brother Samson Olarewaju', initials: 'SO', role: 'Member', avatarColor: '#1D9BF0', joinedAt: '2024-02-10' },
      { id: 'mem-092', name: 'Sister Jumoke Olatunji', initials: 'JO', role: 'Meal Coordinator', avatarColor: '#1D9BF0', joinedAt: '2024-09-01' },
    ],
    memberCount: 8,
    status: 'active',
    visibility: 'private',
    joinPolicy: 'invite',
    postingPermissions: 'leaders-only',
    meetingPattern: 'As needed',
    nextEvent: { title: 'Care Team Meeting', date: '2026-02-23', time: '6:00 PM', location: 'Pastor\'s Office' },
    avatarColor: '#1D9BF0',
    hasRoom: true,
    roomId: 'room-care',
    createdAt: '2023-01-15',
    lastActivityAt: '2026-02-14T18:30:00Z',
    lastActivityMs: 1739557800000,
  },
  // 11. Children's Ministry
  {
    id: 'min-children',
    churchId: CHURCH_ID,
    name: "Children's Ministry",
    category: 'education-catechism',
    description:
      'Engaging and age-appropriate Bible teaching for children ages 2-12 during Sunday services. Creative lessons, worship, crafts, and a safe nurturing environment.',
    icon: 'graduationcap.fill',
    leaders: [
      { id: 'ldr-faith', name: 'Sister Faith Adebayo', initials: 'FA', role: 'Lead', avatarColor: '#F59E0B' },
      { id: 'ldr-titi', name: 'Sister Titilayo Ojo', initials: 'TO', role: 'Co-Lead', avatarColor: '#F59E0B' },
    ],
    members: [
      { id: 'mem-100', name: 'Sister Chinwe Eze', initials: 'CE', role: 'Teacher (Pre-K)', avatarColor: '#F59E0B', joinedAt: '2024-01-05' },
      { id: 'mem-101', name: 'Brother Joseph Anyanwu', initials: 'JA', role: 'Teacher (Grade School)', avatarColor: '#F59E0B', joinedAt: '2024-03-18' },
      { id: 'mem-102', name: 'Sister Osas Ekhator', initials: 'OE', role: 'Crafts & Activities', avatarColor: '#F59E0B', joinedAt: '2024-08-20' },
      { id: 'mem-103', name: 'Brother Wale Adeyinka', initials: 'WA', role: 'Security & Check-in', avatarColor: '#F59E0B', joinedAt: '2025-01-10' },
    ],
    memberCount: 15,
    status: 'active',
    visibility: 'discoverable',
    joinPolicy: 'request',
    postingPermissions: 'leaders-only',
    meetingPattern: 'Sundays at 10:30 AM',
    nextEvent: { title: 'Sunday School — The Good Samaritan', date: '2026-02-22', time: '10:30 AM', location: "Children's Wing" },
    avatarColor: '#F59E0B',
    hasRoom: true,
    roomId: 'room-children',
    createdAt: '2022-09-01',
    lastActivityAt: '2026-02-16T09:00:00Z',
    lastActivityMs: 1739696400000,
  },
  // 12. Ushers & Greeters
  {
    id: 'min-ushers',
    churchId: CHURCH_ID,
    name: 'Ushers & Greeters',
    category: 'operations-volunteers',
    description:
      'Welcoming members and visitors, managing seating, assisting with offerings, and ensuring a warm and orderly worship experience every Sunday.',
    icon: 'gearshape.2.fill',
    leaders: [
      { id: 'ldr-bayo', name: 'Deacon Bayo Akinwale', initials: 'BA', role: 'Lead', avatarColor: '#A1A1AA' },
    ],
    members: [
      { id: 'mem-110', name: 'Sister Ronke Adeyemo', initials: 'RA', role: 'Greeter Captain', avatarColor: '#52525B', joinedAt: '2024-01-01' },
      { id: 'mem-111', name: 'Brother Lanre Babalola', initials: 'LB', role: 'Usher', avatarColor: '#0B0F14', joinedAt: '2024-05-15' },
      { id: 'mem-112', name: 'Sister Damilola Fashola', initials: 'DF', role: 'Usher', avatarColor: '#0B0F14', joinedAt: '2025-01-20' },
      { id: 'mem-113', name: 'Brother Segun Akindele', initials: 'SA', role: 'Usher', avatarColor: '#A1A1AA', joinedAt: '2025-06-10' },
    ],
    memberCount: 14,
    status: 'seasonal',
    visibility: 'discoverable',
    joinPolicy: 'open',
    postingPermissions: 'everyone',
    meetingPattern: 'Sundays at 9:45 AM',
    nextEvent: { title: 'Sunday Welcome Team Assembly', date: '2026-02-22', time: '9:45 AM', location: 'Main Foyer' },
    avatarColor: '#A1A1AA',
    hasRoom: false,
    createdAt: '2023-08-01',
    lastActivityAt: '2026-02-16T09:30:00Z',
    lastActivityMs: 1739698200000,
  },
];

// =============================================================================
// MINISTRY EVENTS — 18 events across ministries (Feb-Apr 2026)
// =============================================================================

export const MINISTRY_EVENTS_V3: MinistryEvent[] = [
  // Discipleship
  {
    id: 'mev3-01',
    ministryId: 'min-discipleship',
    title: 'Sunday Discipleship — Romans 8',
    date: '2026-02-22',
    time: '9:30 AM',
    location: 'Fellowship Hall',
    type: 'regular',
    description: 'Continuing our verse-by-verse study of Romans. This week: life in the Spirit.',
  },
  {
    id: 'mev3-02',
    ministryId: 'min-discipleship',
    title: 'Discipleship Leaders Training',
    date: '2026-03-07',
    time: '9:00 AM',
    location: 'Conference Room B',
    type: 'special',
    description: 'Quarterly equipping session for all small group facilitators.',
  },
  // Youth
  {
    id: 'mev3-03',
    ministryId: 'min-youth',
    title: 'Youth Night — Game & Word',
    date: '2026-02-20',
    time: '6:30 PM',
    location: 'Youth Hall',
    type: 'regular',
    description: 'Friday fellowship: games, worship, and the Word. Theme: Identity in Christ.',
  },
  {
    id: 'mev3-04',
    ministryId: 'min-youth',
    title: 'Youth Retreat Weekend',
    date: '2026-03-14',
    time: '4:00 PM',
    location: 'Mountain View Camp',
    type: 'retreat',
    description: 'Annual spring retreat. Three days of worship, workshops, and outdoor fellowship.',
  },
  // Men
  {
    id: 'mev3-05',
    ministryId: 'min-men',
    title: "Men's Breakfast Fellowship",
    date: '2026-03-14',
    time: '8:00 AM',
    location: 'Conference Room A',
    type: 'regular',
    description: 'Monthly gathering with guest speaker. Topic: Leading with Integrity at Work.',
  },
  // Women
  {
    id: 'mev3-06',
    ministryId: 'min-women',
    title: "Women's Prayer Breakfast",
    date: '2026-03-07',
    time: '10:00 AM',
    location: 'Fellowship Hall',
    type: 'regular',
    description: 'Bimonthly gathering with prayer, worship, and the Esther Bible study.',
  },
  {
    id: 'mev3-07',
    ministryId: 'min-women',
    title: "Women's Spring Retreat",
    date: '2026-04-18',
    time: '9:00 AM',
    location: 'Grace Retreat Center',
    type: 'retreat',
    description: 'Weekend retreat focused on rest, renewal, and deeper walk with God.',
  },
  // Young Adults
  {
    id: 'mev3-08',
    ministryId: 'min-young-adults',
    title: 'Young Adults Bible Study — Philippians',
    date: '2026-02-19',
    time: '7:30 PM',
    location: 'Room 204',
    type: 'regular',
    description: 'Midweek study: joy and contentment in Philippians 4.',
  },
  {
    id: 'mev3-09',
    ministryId: 'min-young-adults',
    title: 'Young Adults Social — Game Night',
    date: '2026-03-06',
    time: '7:00 PM',
    location: 'Youth Hall',
    type: 'special',
    description: 'Monthly social hangout. Board games, food, and fellowship.',
  },
  // Outreach
  {
    id: 'mev3-10',
    ministryId: 'min-outreach',
    title: 'Community Food Drive',
    date: '2026-02-28',
    time: '9:00 AM',
    location: 'Church Parking Lot',
    type: 'outreach',
    description: 'Collecting and distributing food packages to families in the neighborhood.',
  },
  {
    id: 'mev3-11',
    ministryId: 'min-outreach',
    title: 'Neighborhood Evangelism Walk',
    date: '2026-04-12',
    time: '10:00 AM',
    location: 'Meet at Church Entrance',
    type: 'outreach',
    description: 'Door-to-door prayer walk and community engagement in surrounding neighborhoods.',
  },
  // Worship
  {
    id: 'mev3-12',
    ministryId: 'min-worship',
    title: 'Worship Team Rehearsal',
    date: '2026-02-22',
    time: '8:00 AM',
    location: 'Main Sanctuary',
    type: 'regular',
  },
  {
    id: 'mev3-13',
    ministryId: 'min-worship',
    title: 'Easter Worship Night',
    date: '2026-04-04',
    time: '7:00 PM',
    location: 'Main Sanctuary',
    type: 'special',
    description: 'Extended worship service on Easter Saturday. Full band and choir.',
  },
  // Media
  {
    id: 'mev3-14',
    ministryId: 'min-media',
    title: 'Livestream Operator Training',
    date: '2026-02-22',
    time: '1:00 PM',
    location: 'Media Booth',
    type: 'regular',
    description: 'Hands-on training for new operators: OBS, camera switching, and audio mixing.',
  },
  // Prayer
  {
    id: 'mev3-15',
    ministryId: 'min-prayer',
    title: 'Night of Prayer & Worship',
    date: '2026-02-18',
    time: '7:00 PM',
    location: 'Prayer Chapel',
    type: 'regular',
    description: 'Corporate prayer meeting. Intercession for the church, families, and the nation.',
  },
  // Care
  {
    id: 'mev3-16',
    ministryId: 'min-care',
    title: 'Care Team Meeting',
    date: '2026-02-23',
    time: '6:00 PM',
    location: "Pastor's Office",
    type: 'regular',
    description: 'Review current care cases, assign visitations, and plan upcoming support.',
  },
  // Children
  {
    id: 'mev3-17',
    ministryId: 'min-children',
    title: 'Sunday School — The Good Samaritan',
    date: '2026-02-22',
    time: '10:30 AM',
    location: "Children's Wing",
    type: 'regular',
    description: 'Interactive lesson: loving our neighbors. Crafts and memory verse activity.',
  },
  {
    id: 'mev3-18',
    ministryId: 'min-children',
    title: 'Easter Egg Hunt & Program',
    date: '2026-04-05',
    time: '11:00 AM',
    location: 'Church Grounds',
    type: 'special',
    description: 'Annual Easter celebration for kids: egg hunt, skits, and the Easter story.',
  },
];

// =============================================================================
// MINISTRY TEACHINGS — 12 teachings across ministries
// =============================================================================

export const MINISTRY_TEACHINGS_V3: MinistryTeachingV3[] = [
  {
    id: 'mt3-01',
    ministryId: 'min-discipleship',
    title: 'The Armor of God — Ephesians 6',
    speaker: 'Deacon Olu Adeyemi',
    date: '2026-02-09',
    duration: '40 min',
    series: 'Standing Firm',
    type: 'lesson',
  },
  {
    id: 'mt3-02',
    ministryId: 'min-discipleship',
    title: 'Walking in the Spirit — Romans 8:1-17',
    speaker: 'Sister Nkechi Okafor',
    date: '2026-02-16',
    duration: '35 min',
    series: 'Romans Deep Dive',
    type: 'lesson',
  },
  {
    id: 'mt3-03',
    ministryId: 'min-youth',
    title: 'Identity in Christ',
    speaker: 'Brother David Nwachukwu',
    date: '2026-02-14',
    duration: '30 min',
    series: 'Who Am I?',
    type: 'devotional',
  },
  {
    id: 'mt3-04',
    ministryId: 'min-youth',
    title: 'Navigating Social Media as a Believer',
    speaker: 'Sister Kemi Adeola',
    date: '2026-02-07',
    duration: '25 min',
    series: 'Who Am I?',
    type: 'lesson',
  },
  {
    id: 'mt3-05',
    ministryId: 'min-women',
    title: 'Esther: For Such a Time as This',
    speaker: 'Sister Grace Adekunle',
    date: '2026-02-01',
    duration: '50 min',
    series: 'Women of the Bible',
    type: 'sermon',
  },
  {
    id: 'mt3-06',
    ministryId: 'min-men',
    title: 'Leading with Integrity',
    speaker: 'Brother Emmanuel Obi',
    date: '2026-02-08',
    duration: '40 min',
    series: 'Godly Manhood',
    type: 'sermon',
  },
  {
    id: 'mt3-07',
    ministryId: 'min-worship',
    title: 'Worship Leader Foundations',
    speaker: 'Sister Abimbola Carter',
    date: '2026-02-16',
    duration: '45 min',
    series: 'Heart of Worship',
    type: 'training',
  },
  {
    id: 'mt3-08',
    ministryId: 'min-worship',
    title: 'Vocal Technique & Scripture Meditation',
    speaker: 'Sister Abimbola Carter',
    date: '2026-02-09',
    duration: '55 min',
    series: 'Heart of Worship',
    type: 'training',
  },
  {
    id: 'mt3-09',
    ministryId: 'min-prayer',
    title: 'Praying the Psalms',
    speaker: 'Brother Solomon Igwe',
    date: '2026-02-12',
    duration: '35 min',
    series: 'Prayer Foundations',
    type: 'devotional',
  },
  {
    id: 'mt3-10',
    ministryId: 'min-children',
    title: 'David and Goliath — Courage',
    speaker: 'Sister Faith Adebayo',
    date: '2026-02-16',
    duration: '20 min',
    type: 'lesson',
  },
  {
    id: 'mt3-11',
    ministryId: 'min-young-adults',
    title: 'Contentment in Christ — Philippians 4',
    speaker: 'Brother Tolu Adesanya',
    date: '2026-02-13',
    duration: '30 min',
    series: 'Philippians Journey',
    type: 'lesson',
  },
  {
    id: 'mt3-12',
    ministryId: 'min-media',
    title: 'Excellence in Technical Ministry',
    speaker: 'Sister Joy Nnamdi',
    date: '2026-02-10',
    duration: '40 min',
    type: 'training',
  },
];

// =============================================================================
// MINISTRY PACKS — 8 study / lesson packs
// =============================================================================

export const MINISTRY_PACKS_V3: MinistryPack[] = [
  {
    id: 'mp3-01',
    ministryId: 'min-discipleship',
    title: 'Romans Deep Dive',
    description: 'A verse-by-verse journey through the book of Romans, exploring justification, sanctification, and life in the Spirit.',
    lessons: 12,
    duration: '12 weeks',
    status: 'active',
  },
  {
    id: 'mp3-02',
    ministryId: 'min-discipleship',
    title: 'Standing Firm — Spiritual Warfare',
    description: 'Study of Ephesians 6 and the practical application of spiritual armor in daily life.',
    lessons: 6,
    duration: '6 weeks',
    status: 'active',
  },
  {
    id: 'mp3-03',
    ministryId: 'min-youth',
    title: 'Who Am I? — Identity Series',
    description: 'Helping youth understand their identity in Christ amid cultural pressures, social media, and peer influence.',
    lessons: 8,
    duration: '8 weeks',
    status: 'active',
  },
  {
    id: 'mp3-04',
    ministryId: 'min-women',
    title: 'Women of the Bible',
    description: 'Studying the lives of Esther, Ruth, Deborah, Mary, and other women of faith and their relevance today.',
    lessons: 10,
    duration: '10 weeks',
    status: 'active',
  },
  {
    id: 'mp3-05',
    ministryId: 'min-men',
    title: 'Godly Manhood',
    description: 'Exploring what it means to lead with integrity, love sacrificially, and serve faithfully as men of God.',
    lessons: 6,
    duration: '6 sessions',
    status: 'active',
  },
  {
    id: 'mp3-06',
    ministryId: 'min-young-adults',
    title: 'Philippians Journey',
    description: 'Walking through Philippians: joy, humility, and contentment in every season of life.',
    lessons: 4,
    duration: '4 weeks',
    status: 'active',
  },
  {
    id: 'mp3-07',
    ministryId: 'min-prayer',
    title: 'Prayer Foundations',
    description: 'Building a strong prayer life through studying prayer patterns in Scripture and practicing different forms of prayer.',
    lessons: 8,
    duration: '8 weeks',
    status: 'completed',
  },
  {
    id: 'mp3-08',
    ministryId: 'min-children',
    title: 'Heroes of Faith — Q1 2026',
    description: 'Sunday school curriculum covering David, Daniel, Esther, and Joseph for children ages 6-12.',
    lessons: 12,
    duration: '12 weeks',
    status: 'upcoming',
  },
];

// =============================================================================
// MINISTRY ACTIONS — 12 actions across ministries
// =============================================================================

export const MINISTRY_ACTIONS_V3: MinistryActionV3[] = [
  {
    id: 'ma3-01',
    ministryId: 'min-worship',
    title: 'Recruit 2 additional vocalists for Easter',
    assignee: 'Sister Abimbola Carter',
    assigneeInitials: 'AK',
    dueDate: '2026-03-15',
    status: 'in-progress',
    priority: 'high',
    type: 'volunteer',
  },
  {
    id: 'ma3-02',
    ministryId: 'min-youth',
    title: 'Finalize retreat venue deposit',
    assignee: 'Brother David Nwachukwu',
    assigneeInitials: 'DN',
    dueDate: '2026-02-28',
    status: 'pending',
    priority: 'high',
    type: 'admin',
  },
  {
    id: 'ma3-03',
    ministryId: 'min-women',
    title: 'Print Esther study guides (40 copies)',
    assignee: 'Sister Grace Adekunle',
    assigneeInitials: 'GA',
    dueDate: '2026-02-20',
    status: 'completed',
    priority: 'medium',
    type: 'admin',
  },
  {
    id: 'ma3-04',
    ministryId: 'min-men',
    title: 'Confirm guest speaker for March breakfast',
    assignee: 'Brother Emmanuel Obi',
    assigneeInitials: 'EO',
    dueDate: '2026-03-01',
    status: 'pending',
    priority: 'medium',
    type: 'admin',
  },
  {
    id: 'ma3-05',
    ministryId: 'min-children',
    title: 'Order supplies for Easter program',
    assignee: 'Sister Faith Adebayo',
    assigneeInitials: 'FA',
    dueDate: '2026-03-20',
    status: 'pending',
    priority: 'medium',
    type: 'admin',
  },
  {
    id: 'ma3-06',
    ministryId: 'min-prayer',
    title: 'Update prayer request submission form',
    assignee: 'Brother Solomon Igwe',
    assigneeInitials: 'SI',
    dueDate: '2026-02-18',
    status: 'in-progress',
    priority: 'low',
    type: 'admin',
  },
  {
    id: 'ma3-07',
    ministryId: 'min-media',
    title: 'Upgrade livestream camera (approved budget)',
    assignee: 'Sister Joy Nnamdi',
    assigneeInitials: 'JN',
    dueDate: '2026-03-10',
    status: 'in-progress',
    priority: 'high',
    type: 'admin',
  },
  {
    id: 'ma3-08',
    ministryId: 'min-outreach',
    title: 'Collect 200 canned goods for food drive',
    assignee: 'Brother Daniel Ekwueme',
    assigneeInitials: 'DE',
    dueDate: '2026-02-25',
    status: 'in-progress',
    priority: 'medium',
    type: 'volunteer',
  },
  {
    id: 'ma3-09',
    ministryId: 'min-discipleship',
    title: 'Follow up with 3 new believers from last Sunday',
    assignee: 'Deacon Olu Adeyemi',
    assigneeInitials: 'OA',
    dueDate: '2026-02-19',
    status: 'pending',
    priority: 'high',
    type: 'discipleship',
  },
  {
    id: 'ma3-10',
    ministryId: 'min-young-adults',
    title: 'Plan March social event — game night',
    assignee: 'Sister Ada Uche',
    assigneeInitials: 'AU',
    dueDate: '2026-02-28',
    status: 'pending',
    priority: 'medium',
    type: 'admin',
  },
  {
    id: 'ma3-11',
    ministryId: 'min-care',
    title: 'Arrange meal train for Sister Adebisi (surgery recovery)',
    assignee: 'Sister Bisi Ogunnaike',
    assigneeInitials: 'BO',
    dueDate: '2026-02-20',
    status: 'in-progress',
    priority: 'high',
    type: 'discipleship',
  },
  {
    id: 'ma3-12',
    ministryId: 'min-discipleship',
    title: 'Prepare facilitator guide for Romans 9-11 block',
    assignee: 'Sister Nkechi Okafor',
    assigneeInitials: 'NO',
    dueDate: '2026-03-05',
    status: 'pending',
    priority: 'medium',
    type: 'admin',
  },
];

// =============================================================================
// MINISTRY RESOURCES — 10 resources across ministries
// =============================================================================

export const MINISTRY_RESOURCES_V3: MinistryResourceV3[] = [
  {
    id: 'mr3-01',
    ministryId: 'min-worship',
    title: 'February Worship Set List',
    type: 'document',
    date: '2026-02-01',
  },
  {
    id: 'mr3-02',
    ministryId: 'min-worship',
    title: 'Worship Ministry Playlist — Spotify',
    type: 'link',
    date: '2026-01-15',
  },
  {
    id: 'mr3-03',
    ministryId: 'min-youth',
    title: 'Youth Small Group Leader Guide',
    type: 'document',
    date: '2026-01-28',
  },
  {
    id: 'mr3-04',
    ministryId: 'min-women',
    title: 'Esther Bible Study Workbook',
    type: 'document',
    date: '2026-01-20',
  },
  {
    id: 'mr3-05',
    ministryId: 'min-children',
    title: 'Sunday School Curriculum — Q1 2026',
    type: 'template',
    date: '2026-01-05',
  },
  {
    id: 'mr3-06',
    ministryId: 'min-prayer',
    title: 'Prayer Journal Template',
    type: 'template',
    date: '2026-01-10',
  },
  {
    id: 'mr3-07',
    ministryId: 'min-media',
    title: 'OBS Setup Tutorial',
    type: 'video',
    date: '2026-02-05',
  },
  {
    id: 'mr3-08',
    ministryId: 'min-outreach',
    title: 'Volunteer Handbook 2026',
    type: 'document',
    date: '2026-01-01',
  },
  {
    id: 'mr3-09',
    ministryId: 'min-discipleship',
    title: 'Romans Study Notes — Chapters 1-8',
    type: 'document',
    date: '2026-02-10',
  },
  {
    id: 'mr3-10',
    ministryId: 'min-young-adults',
    title: 'Philippians Reading Plan',
    type: 'link',
    date: '2026-02-01',
  },
];

// =============================================================================
// MINISTRY AUDIT LOG — 18 entries
// =============================================================================

export const MINISTRY_AUDIT_V3: MinistryAuditEntry[] = [
  {
    id: 'aud-01',
    ministryId: 'min-discipleship',
    action: 'Created ministry',
    actor: 'Pastor Dipo Carter',
    timestamp: '2023-06-15T10:00:00Z',
    timestampMs: 1686826800000,
    description: 'Ministry "Sunday Discipleship Groups" created with room and events calendar.',
  },
  {
    id: 'aud-02',
    ministryId: 'min-youth',
    action: 'Added leader',
    actor: 'Pastor Dipo Carter',
    timestamp: '2023-01-10T14:30:00Z',
    timestampMs: 1673361000000,
    description: 'Brother David Nwachukwu added as Lead of Youth Ministry.',
  },
  {
    id: 'aud-03',
    ministryId: 'min-youth',
    action: 'Added leader',
    actor: 'Brother David Nwachukwu',
    timestamp: '2024-06-15T09:00:00Z',
    timestampMs: 1718438400000,
    description: 'Brother Seyi Oladipo added as Coordinator of Youth Ministry.',
  },
  {
    id: 'aud-04',
    ministryId: 'min-worship',
    action: 'Updated meeting time',
    actor: 'Sister Abimbola Carter',
    timestamp: '2025-09-01T08:00:00Z',
    timestampMs: 1725177600000,
    description: 'Rehearsal time changed from 7:30 AM to 8:00 AM.',
  },
  {
    id: 'aud-05',
    ministryId: 'min-women',
    action: 'Pack published',
    actor: 'Sister Grace Adekunle',
    timestamp: '2026-01-05T11:00:00Z',
    timestampMs: 1736075400000,
    description: 'Study pack "Women of the Bible" published with 10 lessons.',
  },
  {
    id: 'aud-06',
    ministryId: 'min-prayer',
    action: 'Event scheduled',
    actor: 'Brother Solomon Igwe',
    timestamp: '2026-02-10T15:00:00Z',
    timestampMs: 1739199600000,
    description: 'Night of Prayer & Worship scheduled for Feb 18, 2026.',
  },
  {
    id: 'aud-07',
    ministryId: 'min-outreach',
    action: 'Event scheduled',
    actor: 'Brother Daniel Ekwueme',
    timestamp: '2026-02-05T10:00:00Z',
    timestampMs: 1738746000000,
    description: 'Community Food Drive scheduled for Feb 28, 2026.',
  },
  {
    id: 'aud-08',
    ministryId: 'min-media',
    action: 'Settings updated',
    actor: 'Sister Joy Nnamdi',
    timestamp: '2026-01-20T14:00:00Z',
    timestampMs: 1737378000000,
    description: 'Posting permissions changed to "Leaders Only".',
  },
  {
    id: 'aud-09',
    ministryId: 'min-care',
    action: 'Added leader',
    actor: 'Pastor Dipo Carter',
    timestamp: '2023-01-15T09:30:00Z',
    timestampMs: 1673775000000,
    description: 'Sister Bisi Ogunnaike added as Lead of Care Team.',
  },
  {
    id: 'aud-10',
    ministryId: 'min-children',
    action: 'Added teaching',
    actor: 'Sister Faith Adebayo',
    timestamp: '2026-02-16T08:30:00Z',
    timestampMs: 1739694600000,
    description: 'Teaching "David and Goliath — Courage" uploaded.',
  },
  {
    id: 'aud-11',
    ministryId: 'min-discipleship',
    action: 'Member joined',
    actor: 'Brother Femi Ogundimu',
    timestamp: '2025-03-20T12:00:00Z',
    timestampMs: 1742472000000,
    description: 'Brother Femi Ogundimu joined Sunday Discipleship Groups.',
  },
  {
    id: 'aud-12',
    ministryId: 'min-young-adults',
    action: 'Created ministry',
    actor: 'Pastor Dipo Carter',
    timestamp: '2024-01-08T10:00:00Z',
    timestampMs: 1704711600000,
    description: 'Ministry "Young Adults Fellowship" created with room and events calendar.',
  },
  {
    id: 'aud-13',
    ministryId: 'min-ushers',
    action: 'Settings updated',
    actor: 'Deacon Bayo Akinwale',
    timestamp: '2026-01-15T16:00:00Z',
    timestampMs: 1736956800000,
    description: 'Ministry status changed to "Seasonal" for holiday rotation schedule.',
  },
  {
    id: 'aud-14',
    ministryId: 'min-men',
    action: 'Added leader',
    actor: 'Brother Emmanuel Obi',
    timestamp: '2024-09-01T08:00:00Z',
    timestampMs: 1725177600000,
    description: 'Deacon Gbenga Fashola added as Co-Lead of Men\'s Ministry.',
  },
  {
    id: 'aud-15',
    ministryId: 'min-youth',
    action: 'Event scheduled',
    actor: 'Brother David Nwachukwu',
    timestamp: '2026-02-01T09:00:00Z',
    timestampMs: 1738400400000,
    description: 'Youth Retreat Weekend scheduled for Mar 14-16, 2026.',
  },
  {
    id: 'aud-16',
    ministryId: 'min-worship',
    action: 'Member joined',
    actor: 'Brother Emeka Okolie',
    timestamp: '2025-01-05T10:00:00Z',
    timestampMs: 1736071200000,
    description: 'Brother Emeka Okolie (bassist) joined Worship Team via invitation.',
  },
  {
    id: 'aud-17',
    ministryId: 'min-discipleship',
    action: 'Pack published',
    actor: 'Deacon Olu Adeyemi',
    timestamp: '2026-01-12T11:00:00Z',
    timestampMs: 1736679600000,
    description: 'Study pack "Romans Deep Dive" published with 12 lessons.',
  },
  {
    id: 'aud-18',
    ministryId: 'min-care',
    action: 'Member joined',
    actor: 'Sister Jumoke Olatunji',
    timestamp: '2024-09-01T14:00:00Z',
    timestampMs: 1725199200000,
    description: 'Sister Jumoke Olatunji joined Care Team as Meal Coordinator.',
  },
];

// =============================================================================
// HELPERS
// =============================================================================

/** Filter ministries by search text, category, scope, and statuses */
export function filterMinistries(
  ministries: MinistryFull[],
  search: string,
  category: MinistryCategory | 'all',
  scope: string,
  statuses: MinistryStatus[],
): MinistryFull[] {
  const q = search.toLowerCase().trim();

  return ministries.filter((m) => {
    // Search filter
    if (q) {
      const haystack = `${m.name} ${m.description} ${m.leaders.map((l) => l.name).join(' ')}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    // Category filter
    if (category !== 'all' && m.category !== category) return false;

    // Status filter
    if (statuses.length > 0 && !statuses.includes(m.status)) return false;

    // Scope filter
    if (scope === 'my') {
      // In a real app this would check the current user's membership;
      // for mock purposes, return all active ministries
      return m.status === 'active';
    }
    if (scope === 'leadership') {
      // For mock purposes, show ministries where user leads
      // (using a placeholder check — in production this uses the auth context)
      return m.leaders.some((l) => l.name.includes('Carter'));
    }

    return true;
  });
}

/** Sort ministries by the given sort key */
export function sortMinistries(
  ministries: MinistryFull[],
  sort: MinistryFilterState['sort'],
): MinistryFull[] {
  const sorted = [...ministries];

  switch (sort) {
    case 'az':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'next-event':
      return sorted.sort((a, b) => {
        const dateA = a.nextEvent?.date ?? '9999-12-31';
        const dateB = b.nextEvent?.date ?? '9999-12-31';
        return dateA.localeCompare(dateB);
      });
    case 'recent':
      return sorted.sort((a, b) => b.lastActivityMs - a.lastActivityMs);
    case 'member-count':
      return sorted.sort((a, b) => b.memberCount - a.memberCount);
    default:
      return sorted;
  }
}

/** Get events for a specific ministry */
export function getEventsForMinistryV3(ministryId: string): MinistryEvent[] {
  return MINISTRY_EVENTS_V3.filter((e) => e.ministryId === ministryId);
}

/** Get teachings for a specific ministry */
export function getTeachingsForMinistryV3(ministryId: string): MinistryTeachingV3[] {
  return MINISTRY_TEACHINGS_V3.filter((t) => t.ministryId === ministryId);
}

/** Get packs for a specific ministry */
export function getPacksForMinistry(ministryId: string): MinistryPack[] {
  return MINISTRY_PACKS_V3.filter((p) => p.ministryId === ministryId);
}

/** Get actions for a specific ministry */
export function getActionsForMinistryV3(ministryId: string): MinistryActionV3[] {
  return MINISTRY_ACTIONS_V3.filter((a) => a.ministryId === ministryId);
}

/** Get resources for a specific ministry */
export function getResourcesForMinistryV3(ministryId: string): MinistryResourceV3[] {
  return MINISTRY_RESOURCES_V3.filter((r) => r.ministryId === ministryId);
}

/** Get audit log entries for a specific ministry, sorted newest-first */
export function getAuditForMinistry(ministryId: string): MinistryAuditEntry[] {
  return MINISTRY_AUDIT_V3
    .filter((a) => a.ministryId === ministryId)
    .sort((a, b) => b.timestampMs - a.timestampMs);
}
