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
  status: 'active' | 'inactive' | 'new' | 'paused';
  hue: number;
  nextMeeting: string;
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
  fullName: 'International Christian Center Los Angeles',
  tagline: 'A community that will ground you in the message of grace.',
  description:
    'ICCLA is an inter-denominational, Pentecostal church founded by Drs. Oladipo and Nonyelum Kalejaiye. We are a multicultural, multigenerational family dedicated to worship, discipleship, and transforming the South Bay and greater Los Angeles through the gospel.',
  location: 'Hawthorne, CA',
  address: '12832 Chadron Ave, Hawthorne, CA 90250',
  avatarInitials: 'IC',
  coverHue: 220,
  memberCount: 420,
  foundedYear: '2015',
  contactEmail: 'info@iccla.com',
  website: 'https://iccla.com',
  social: '@icclachurch',
  serviceTimes: [
    { label: 'Celebration Service', time: 'Sundays 7:00 PM' },
    { label: 'Wednesday Bible Study', time: 'Wednesdays 7:00 PM' },
    { label: 'Hotline to Heaven', time: 'Daily · +1 712-432-2840 (code: 9102817#)' },
  ],
  beliefs: [
    'Jesus Christ is both God and Man',
    'The Holy Spirit is Divine',
    'Scripture is inspired by God',
    'Salvation through Christ for all people',
    'Healing available to believers through Christ\'s redemptive work',
    'Water baptism and the Lord\'s Supper observed',
  ],
};

// ── Leadership ────────────────────────────────────────────────────────────────

export const COMMUNITY_LEADERSHIP: CommunityLeader[] = [
  { id: 'ldr1', name: 'Dr. Dipo Kalejaiye',    role: 'Senior Pastor',         initials: 'DK', hue: 220 },
  { id: 'ldr2', name: 'Pastor Nony Kalejaiye', role: 'Co-Founding Pastor',    initials: 'NK', hue: 280 },
  { id: 'ldr3', name: 'Dr. Kunle Pinmiloye',   role: 'Music Director',        initials: 'KP', hue: 150 },
  { id: 'ldr4', name: 'David Eze',             role: 'T.O.R.C.H. Nation',     initials: 'DE', hue: 30  },
];

// ── Analytics ─────────────────────────────────────────────────────────────────

export const COMMUNITY_ANALYTICS = {
  memberCount:       420,
  memberTrend:       +3.2,
  attendance:        180,
  attendanceTrend:   +5.1,
  giving:            10500,   // weekly giving (~$42K/month ÷ 4)
  givingTrend:       +12.4,
  volunteers:        82,
  volunteerTrend:    +4.7,
  careRequests:      6,
  careRequestsTrend: 0,
};

// ── Chart Data (8 weekly points) ──────────────────────────────────────────────

export const COMMUNITY_CHART_DATA: CommunityChartPoint[] = [
  { label: 'W1', attendance: 152, giving: 8200,  volunteers: 64 },
  { label: 'W2', attendance: 159, giving: 8900,  volunteers: 68 },
  { label: 'W3', attendance: 164, giving: 9400,  volunteers: 71 },
  { label: 'W4', attendance: 161, giving: 9100,  volunteers: 70 },
  { label: 'W5', attendance: 170, giving: 9800,  volunteers: 76 },
  { label: 'W6', attendance: 174, giving: 10200, volunteers: 79 },
  { label: 'W7', attendance: 178, giving: 10400, volunteers: 81 },
  { label: 'W8', attendance: 180, giving: 10500, volunteers: 82 },
];

export function getCommunityChartMax(metric: CommunityChartMetric): number {
  return Math.max(...COMMUNITY_CHART_DATA.map(d => d[metric]));
}

// ── Departments ───────────────────────────────────────────────────────────────

export const COMMUNITY_DEPARTMENTS: CommunityDepartment[] = [
  {
    id: 'dep1', name: 'Vineyard Voices', icon: 'music.note', hue: 220,
    leaderName: 'Dr. Kunle Pinmiloye', leaderInitials: 'KP',
    memberCount: 28, nextMeeting: 'Sundays 5:00 PM',
    description:
      'Addressing the congregational musical needs of ICCLA — worship services, special performances, and concerts. Led by Dr. Kunle Pinmiloye (Ksticks).',
    volunteerNeeds: [
      { role: 'Sound Engineer',  needed: 2, filled: 1 },
      { role: 'Media / Slides',  needed: 1, filled: 1 },
    ],
  },
  {
    id: 'dep2', name: 'Fresh Fire & T.O.R.C.H.', icon: 'figure.run', hue: 30,
    leaderName: 'David Eze', leaderInitials: 'DE',
    memberCount: 45, nextMeeting: 'Fridays 6:00 PM',
    description:
      'Fresh Fire serves our teens; T.O.R.C.H. Nation (Transformed and Open, Real Change Happens) is our young adults ministry. Relevant teaching, life transformation, and real community.',
    volunteerNeeds: [
      { role: 'Youth Mentor',   needed: 4, filled: 2 },
      { role: 'Media Support',  needed: 2, filled: 1 },
    ],
  },
  {
    id: 'dep3', name: 'Sheepfold & Hospitality', icon: 'hands.and.sparkles', hue: 150,
    leaderName: 'Pastor Nony Kalejaiye', leaderInitials: 'NK',
    memberCount: 22, nextMeeting: 'Sundays 6:30 PM',
    description:
      'Sheepfold provides professional Christian care for children during services. Hospitality ensures every first-time guest becomes a welcomed member of our family.',
    volunteerNeeds: [
      { role: 'Children\'s Teacher', needed: 4, filled: 4 },
      { role: 'Greeter',             needed: 6, filled: 5 },
    ],
  },
  {
    id: 'dep4', name: 'Amazing Grace Outreach', icon: 'heart.fill', hue: 0,
    leaderName: 'Pastor Nony Kalejaiye', leaderInitials: 'NK',
    memberCount: 31, nextMeeting: 'Tuesdays 6:00 PM',
    description:
      'Bringing the love of Christ to the South Bay and greater LA — community events, neighborhood outreach, and partnerships with local families in need.',
    volunteerNeeds: [
      { role: 'Outreach Volunteer', needed: 8, filled: 5 },
      { role: 'Community Liaison',  needed: 2, filled: 2 },
    ],
  },
  {
    id: 'dep5', name: 'Life Transformation Groups', icon: 'book.fill', hue: 200,
    leaderName: 'Dr. Dipo Kalejaiye', leaderInitials: 'DK',
    memberCount: 38, nextMeeting: 'Wednesdays 7:00 PM',
    description:
      'ICC Connect Groups meet throughout the South Bay — Del Aire, Carson, Gardena, Harbor City, Palos Verdes, and Downey. Interactive discussion, community celebration, and Rooted discipleship.',
    volunteerNeeds: [
      { role: 'Group Facilitator',  needed: 4, filled: 3 },
      { role: 'Location Host',      needed: 2, filled: 2 },
    ],
  },
];

// ── Groups ────────────────────────────────────────────────────────────────────

export const COMMUNITY_GROUPS: CommunityGroup[] = [
  {
    id: 'grp1', name: 'Men Wondered At',
    leaderName: 'Dr. Dipo Kalejaiye', leaderInitials: 'DK',
    schedule: 'Tuesdays 7:00 PM', frequency: 'Weekly',
    memberCount: 18, capacity: 25,
    description:
      'A brotherhood for men to grow in faith, accountability, and purpose. Grounded in scripture, anchored in grace.',
    departmentName: 'Life Transformation Groups',
    isOpen: true, status: 'active', hue: 220, nextMeeting: 'Tomorrow · 7:00 PM',
  },
  {
    id: 'grp2', name: "Virtuous Women's Fellowship",
    leaderName: 'Pastor Nony Kalejaiye', leaderInitials: 'NK',
    schedule: 'Wednesdays 6:00 PM', frequency: 'Weekly',
    memberCount: 21, capacity: 30,
    description:
      'A safe space for women to be real, grow spiritually, and support one another. Rooted in Proverbs 31 and the grace of God.',
    departmentName: 'Life Transformation Groups',
    isOpen: true, status: 'active', hue: 320, nextMeeting: 'Wednesday · 6:00 PM',
  },
  {
    id: 'grp3', name: 'T.O.R.C.H. Nation',
    leaderName: 'David Eze', leaderInitials: 'DE',
    schedule: 'Fridays 8:00 PM', frequency: 'Weekly',
    memberCount: 34, capacity: 40,
    description:
      'Transformed and Open, Real Change Happens. Young adults 18\u201330 navigating faith, identity, career, and relationships — trendy worship, life groups, and regular events.',
    departmentName: 'Fresh Fire & T.O.R.C.H.',
    isOpen: true, status: 'active', hue: 40, nextMeeting: 'Friday · 8:00 PM',
  },
  {
    id: 'grp4', name: 'Hotline to Heaven',
    leaderName: 'Pastor Nony Kalejaiye', leaderInitials: 'NK',
    schedule: 'Daily Prayer Call', frequency: 'Daily',
    memberCount: 19, capacity: 999,
    description:
      'Global daily prayer platform accessible by phone or online. Join anytime — +1 712-432-2840, access code 9102817#. Powerful, interceding community.',
    departmentName: 'Life Transformation Groups',
    isOpen: true, status: 'active', hue: 160, nextMeeting: 'Daily · any time',
  },
  {
    id: 'grp5', name: 'Rooted',
    leaderName: 'Dr. Dipo Kalejaiye', leaderInitials: 'DK',
    schedule: 'Sundays after service', frequency: 'Weekly',
    memberCount: 16, capacity: 20,
    description:
      'Rooted is a discipleship experience focused on connecting with God, authentic community, and growing in generosity. Perfect for new believers and anyone wanting to go deeper.',
    departmentName: 'Life Transformation Groups',
    isOpen: false, status: 'active', hue: 200, nextMeeting: 'Sunday after service',
  },
  {
    id: 'grp6', name: 'Life Group — Carson',
    leaderName: 'Life Group Host', leaderInitials: 'LG',
    schedule: 'Thursdays 7:00 PM', frequency: 'Weekly',
    memberCount: 12, capacity: 15,
    description:
      'One of ICCLA\u2019s community Life Transformation Groups meeting in Carson. Interactive discussion, fellowship, and celebration of life together.',
    departmentName: 'Life Transformation Groups',
    isOpen: false, status: 'active', hue: 30, nextMeeting: 'Thursday · 7:00 PM',
  },
  {
    id: 'grp7', name: 'Single Saved and Serving',
    leaderName: 'Singles Ministry Lead', leaderInitials: 'SS',
    schedule: 'Saturdays 5:00 PM', frequency: 'Bi-weekly',
    memberCount: 9, capacity: 25,
    description:
      'A thriving community for single believers to grow in faith, build meaningful friendships, and discover purpose in this season of life.',
    departmentName: 'Fresh Fire & T.O.R.C.H.',
    isOpen: true, status: 'new', hue: 350, nextMeeting: 'Saturday · 5:00 PM',
  },
  {
    id: 'grp8', name: 'Shining Stars',
    leaderName: 'Sheepfold Team', leaderInitials: 'ST',
    schedule: 'Sundays during service', frequency: 'Weekly',
    memberCount: 14, capacity: 20,
    description:
      'Children\u2019s ministry for our youngest members — fun, faith-filled learning with well-trained Christian teachers. Nursery care also available for infants.',
    departmentName: 'Sheepfold & Hospitality',
    isOpen: true, status: 'active', hue: 180, nextMeeting: 'Sunday · 7:00 PM',
  },
];

// ── Events ────────────────────────────────────────────────────────────────────

export const COMMUNITY_EVENTS: CommunityEvent[] = [
  {
    id: 'ev1', title: 'Celebration Service',
    date: 'Mar 29, 2026', time: '7:00 PM',
    location: '12832 Chadron Ave, Hawthorne, CA',
    volunteersNeeded: 8, volunteersFilled: 7,
    isPublic: true,
  },
  {
    id: 'ev2', title: 'Easter Celebration Service',
    date: 'Apr 5, 2026', time: '7:00 PM',
    location: '12832 Chadron Ave, Hawthorne, CA',
    volunteersNeeded: 12, volunteersFilled: 5,
    isPublic: true,
  },
  {
    id: 'ev3', title: 'Amazing Grace Community Outreach',
    date: 'Apr 11, 2026', time: '10:00 AM',
    location: 'Hawthorne Community Center',
    volunteersNeeded: 15, volunteersFilled: 8,
    isPublic: true,
  },
  {
    id: 'ev4', title: 'Leadership & Elders Meeting',
    date: 'Mar 31, 2026', time: '6:30 PM',
    location: 'ICCLA — Conference Room',
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
