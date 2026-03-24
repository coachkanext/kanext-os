/**
 * Mock data for Community Hub — ICCLA (Interdisciplinary Community Church of Los Angeles).
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type CommunityChartMetric = 'attendance' | 'giving' | 'volunteers';
export type CareRequestStatus = 'pending' | 'in-progress' | 'resolved';
export type CareRequestType = 'Prayer' | 'Counseling' | 'Financial Aid' | 'General';

export interface CommunityLeader {
  id: string;
  name: string;
  role: string;
  initials: string;
  hue: number;
}

export interface VolunteerNeed {
  role: string;
  needed: number;
  filled: number;
}

export interface CommunityDepartment {
  id: string;
  name: string;
  icon: string;
  hue: number;
  leaderName: string;
  leaderInitials: string;
  memberCount: number;
  nextMeeting: string;
  description: string;
  volunteerNeeds: VolunteerNeed[];
}

export interface CommunityGroup {
  id: string;
  name: string;
  leaderName: string;
  leaderInitials: string;
  schedule: string;
  frequency: string;
  memberCount: number;
  capacity: number;
  description: string;
  departmentName: string;
  isOpen: boolean;
  status: 'active' | 'inactive';
}

export interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  volunteersNeeded: number;
  volunteersFilled: number;
  isPublic: boolean;
}

export interface CareRequest {
  id: string;
  type: CareRequestType;
  summary: string;
  submittedAgo: string;
  anonymous: boolean;
  submitterName?: string;
  status: CareRequestStatus;
}

export interface CommunityChartPoint {
  label: string;
  attendance: number;
  giving: number;
  volunteers: number;
}

export interface CommunityAnnouncement {
  id: string;
  title: string;
  preview: string;
  sentAt: string;
  recipients: string;
  openRate: number;
}

// ── Community Profile ─────────────────────────────────────────────────────────

export const COMMUNITY_PROFILE = {
  name: 'ICCLA',
  fullName: 'Interdisciplinary Community Church of Los Angeles',
  tagline: 'Equipping believers, building community, transforming neighborhoods.',
  description:
    'ICCLA is a multi-cultural, multi-generational church committed to discipleship, worship, and serving our city. We believe in the power of authentic community and gospel-centered living.',
  location: 'Los Angeles, CA',
  avatarInitials: 'IC',
  coverHue: 220,
  memberCount: 487,
  foundedYear: '2012',
  contactEmail: 'info@iccla.org',
  website: 'https://iccla.org',
  serviceTimes: [
    { label: 'Sunday Morning', time: '9:00 AM & 11:00 AM' },
    { label: 'Wednesday Bible Study', time: '7:00 PM' },
    { label: 'Friday Prayer Service', time: '6:00 AM' },
  ],
  beliefs: [
    'We believe in the authority of Scripture',
    'We believe in the triune God — Father, Son, and Holy Spirit',
    'We believe in salvation by grace through faith',
    'We believe in the Great Commission and local church',
  ],
};

// ── Leadership ────────────────────────────────────────────────────────────────

export const COMMUNITY_LEADERSHIP: CommunityLeader[] = [
  { id: 'ldr1', name: 'Pastor Marcus Davis',      role: 'Lead Pastor',        initials: 'MD', hue: 220 },
  { id: 'ldr2', name: 'Deacon Keisha Williams',   role: 'Executive Director', initials: 'KW', hue: 280 },
  { id: 'ldr3', name: 'Elder Robert Chen',         role: 'Worship Director',   initials: 'RC', hue: 150 },
  { id: 'ldr4', name: 'Nia Sanders',               role: 'Youth Director',     initials: 'NS', hue: 30  },
];

// ── Analytics ─────────────────────────────────────────────────────────────────

export const COMMUNITY_ANALYTICS = {
  memberCount:       487,
  memberTrend:       +3.2,
  attendance:        312,
  attendanceTrend:   +5.1,
  giving:            8420,
  givingTrend:       +12.4,
  volunteers:        89,
  volunteerTrend:    -2.1,
  careRequests:      6,
  careRequestsTrend: 0,
};

// ── Chart Data (8 weekly points) ──────────────────────────────────────────────

export const COMMUNITY_CHART_DATA: CommunityChartPoint[] = [
  { label: 'W1', attendance: 265, giving: 6200, volunteers: 80 },
  { label: 'W2', attendance: 278, giving: 6500, volunteers: 82 },
  { label: 'W3', attendance: 290, giving: 7100, volunteers: 85 },
  { label: 'W4', attendance: 285, giving: 7400, volunteers: 81 },
  { label: 'W5', attendance: 301, giving: 7800, volunteers: 88 },
  { label: 'W6', attendance: 295, giving: 8000, volunteers: 86 },
  { label: 'W7', attendance: 308, giving: 8200, volunteers: 91 },
  { label: 'W8', attendance: 312, giving: 8420, volunteers: 89 },
];

export function getCommunityChartMax(metric: CommunityChartMetric): number {
  return Math.max(...COMMUNITY_CHART_DATA.map(d => d[metric]));
}

// ── Departments ───────────────────────────────────────────────────────────────

export const COMMUNITY_DEPARTMENTS: CommunityDepartment[] = [
  {
    id: 'dep1', name: 'Worship', icon: 'music.note', hue: 220,
    leaderName: 'Elder Robert Chen', leaderInitials: 'RC',
    memberCount: 42, nextMeeting: 'Sundays 8:30 AM',
    description:
      'Creating an atmosphere of genuine worship through music, arts, and liturgy. We serve every Sunday service and special events.',
    volunteerNeeds: [
      { role: 'Sound Engineer',  needed: 2, filled: 1 },
      { role: 'Media / Slides',  needed: 1, filled: 1 },
    ],
  },
  {
    id: 'dep2', name: 'Youth', icon: 'figure.run', hue: 30,
    leaderName: 'Nia Sanders', leaderInitials: 'NS',
    memberCount: 67, nextMeeting: 'Fridays 6:00 PM',
    description:
      'Investing in the next generation through relevant teaching, mentorship, and community. Ages 12–25.',
    volunteerNeeds: [
      { role: 'Youth Mentor', needed: 4, filled: 2 },
      { role: 'Van Driver',   needed: 2, filled: 1 },
    ],
  },
  {
    id: 'dep3', name: 'Hospitality', icon: 'hands.and.sparkles', hue: 150,
    leaderName: 'Jordan Williams', leaderInitials: 'JW',
    memberCount: 38, nextMeeting: 'Saturdays 10:00 AM',
    description:
      'Making every guest feel welcomed and every member feel at home. We serve at all church gatherings and events.',
    volunteerNeeds: [
      { role: 'Greeter',     needed: 6, filled: 6 },
      { role: 'Event Setup', needed: 4, filled: 2 },
    ],
  },
  {
    id: 'dep4', name: 'Outreach', icon: 'heart.fill', hue: 0,
    leaderName: 'Deacon Keisha Williams', leaderInitials: 'KW',
    memberCount: 55, nextMeeting: 'Tuesdays 6:00 PM',
    description:
      'Serving our city through food drives, community events, and partnerships with local nonprofits. Transforming neighborhoods, one block at a time.',
    volunteerNeeds: [
      { role: 'Food Pantry Volunteer', needed: 8, filled: 5 },
      { role: 'Community Liaison',     needed: 2, filled: 2 },
    ],
  },
  {
    id: 'dep5', name: 'Education', icon: 'book.fill', hue: 200,
    leaderName: 'Pastor Marcus Davis', leaderInitials: 'MD',
    memberCount: 29, nextMeeting: 'Wednesdays 7:00 PM',
    description:
      'Grounding the church in biblical truth through adult Sunday school, Bible studies, leadership development, and discipleship programs.',
    volunteerNeeds: [
      { role: 'Small Group Facilitator', needed: 3, filled: 3 },
      { role: 'Curriculum Coordinator',  needed: 1, filled: 0 },
    ],
  },
];

// ── Groups ────────────────────────────────────────────────────────────────────

export const COMMUNITY_GROUPS: CommunityGroup[] = [
  {
    id: 'grp1', name: "Men's Fellowship",
    leaderName: 'Pastor Marcus Davis', leaderInitials: 'MD',
    schedule: 'Tuesdays 7:00 PM', frequency: 'Weekly',
    memberCount: 24, capacity: 30,
    description:
      'A brotherhood built on accountability, prayer, and purpose. We dig into scripture, share life, and challenge each other to grow.',
    departmentName: 'Education',
    isOpen: true, status: 'active',
  },
  {
    id: 'grp2', name: "Women's Circle",
    leaderName: 'Deacon Keisha Williams', leaderInitials: 'KW',
    schedule: 'Wednesdays 6:00 PM', frequency: 'Weekly',
    memberCount: 18, capacity: 25,
    description:
      'A safe space for women to be real, grow spiritually, and support one another through every season of life.',
    departmentName: 'Education',
    isOpen: true, status: 'active',
  },
  {
    id: 'grp3', name: 'Young Adults',
    leaderName: 'Nia Sanders', leaderInitials: 'NS',
    schedule: 'Fridays 8:00 PM', frequency: 'Weekly',
    memberCount: 31, capacity: 35,
    description:
      "Community for 18\u201330 year olds navigating faith, career, and relationships. Relevant conversation, real community.",
    departmentName: 'Youth',
    isOpen: true, status: 'active',
  },
  {
    id: 'grp4', name: 'Prayer Warriors',
    leaderName: 'Elder Robert Chen', leaderInitials: 'RC',
    schedule: 'Mondays 6:00 AM', frequency: 'Weekly',
    memberCount: 15, capacity: 20,
    description:
      'Dedicated intercessors who cover the church, city, and nations in prayer. Early morning, powerful ministry.',
    departmentName: 'Worship',
    isOpen: true, status: 'active',
  },
  {
    id: 'grp5', name: 'Bible Study 101',
    leaderName: 'Jordan Williams', leaderInitials: 'JW',
    schedule: 'Sundays 11:30 AM', frequency: 'Weekly',
    memberCount: 22, capacity: 22,
    description:
      'Foundational Bible study for new believers and anyone wanting a solid grounding in Scripture. No question too basic.',
    departmentName: 'Education',
    isOpen: false, status: 'active',
  },
];

// ── Events ────────────────────────────────────────────────────────────────────

export const COMMUNITY_EVENTS: CommunityEvent[] = [
  {
    id: 'ev1', title: 'Sunday Service',
    date: 'Jul 28, 2024', time: '10:00 AM',
    location: 'Main Sanctuary',
    volunteersNeeded: 8, volunteersFilled: 6,
    isPublic: true,
  },
  {
    id: 'ev2', title: 'Youth Summer Bash',
    date: 'Aug 3, 2024', time: '2:00 PM',
    location: 'Fellowship Hall',
    volunteersNeeded: 12, volunteersFilled: 7,
    isPublic: true,
  },
  {
    id: 'ev3', title: 'Community Food Drive',
    date: 'Aug 10, 2024', time: '9:00 AM',
    location: 'Church Parking Lot',
    volunteersNeeded: 20, volunteersFilled: 14,
    isPublic: true,
  },
  {
    id: 'ev4', title: 'Leadership Meeting',
    date: 'Aug 5, 2024', time: '6:30 PM',
    location: 'Conference Room A',
    volunteersNeeded: 0, volunteersFilled: 0,
    isPublic: false,
  },
];

// ── Care Requests ─────────────────────────────────────────────────────────────

export const COMMUNITY_CARE_REQUESTS: CareRequest[] = [
  {
    id: 'cr1', type: 'Prayer',
    summary: 'Healing from ongoing illness',
    submittedAgo: '2h ago', anonymous: false, submitterName: 'Marcus T.',
    status: 'pending',
  },
  {
    id: 'cr2', type: 'Counseling',
    summary: 'Family situation \u2014 support needed',
    submittedAgo: '5h ago', anonymous: true,
    status: 'pending',
  },
  {
    id: 'cr3', type: 'Financial Aid',
    summary: 'Assistance with rent this month',
    submittedAgo: '1d ago', anonymous: false, submitterName: 'Jordan W.',
    status: 'in-progress',
  },
  {
    id: 'cr4', type: 'Prayer',
    summary: 'Job search \u2014 need breakthrough',
    submittedAgo: '2d ago', anonymous: false, submitterName: 'Priya M.',
    status: 'pending',
  },
  {
    id: 'cr5', type: 'General',
    summary: 'Moving \u2014 need help with boxes',
    submittedAgo: '3d ago', anonymous: false, submitterName: 'Devon C.',
    status: 'in-progress',
  },
  {
    id: 'cr6', type: 'Counseling',
    summary: 'Grief support after loss',
    submittedAgo: '4d ago', anonymous: true,
    status: 'pending',
  },
];

// ── Announcements ─────────────────────────────────────────────────────────────

export const COMMUNITY_ANNOUNCEMENTS: CommunityAnnouncement[] = [
  {
    id: 'ann1', title: 'Volunteer Appreciation Night',
    preview: 'Join us August 15th for a special evening honoring our volunteers\u2026',
    sentAt: 'Jul 20, 2024', recipients: 'All Members', openRate: 72,
  },
  {
    id: 'ann2', title: 'New Group Starting: Prayer Warriors',
    preview: 'We are launching a new early morning prayer group\u2026',
    sentAt: 'Jul 14, 2024', recipients: 'All Members', openRate: 68,
  },
  {
    id: 'ann3', title: 'Food Drive \u2014 Volunteers Needed',
    preview: 'Our annual community food drive needs your help\u2026',
    sentAt: 'Jul 8, 2024', recipients: 'Outreach Dept', openRate: 81,
  },
];
