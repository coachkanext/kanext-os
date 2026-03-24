/**
 * Mock data for ICCLA Community Members screen.
 * 29 members: leadership, active, at-risk, inactive, new, and visitors.
 * Today = 2026-03-23.
 * active   = lastAttended >= 2026-03-09 (within 14 days)
 * at_risk  = 2026-02-24 – 2026-03-08 (15-28 days)
 * inactive = before 2026-02-24 (29+ days)
 * new      = joinDate >= 2026-02-21 AND attended recently
 * visitor  = role === 'visitor'
 */

export type MemberStatus   = 'active' | 'at_risk' | 'inactive' | 'new' | 'visitor';
export type MemberRoleType = 'admin' | 'staff' | 'leader' | 'volunteer' | 'member' | 'visitor';

export interface CommunityMember {
  id: string;
  name: string;
  handle: string;
  initials: string;
  hue: number;
  role: MemberRoleType;
  departments: string[];
  groups: string[];
  joinDate: string;       // YYYY-MM-DD
  lastAttended: string;   // YYYY-MM-DD
  status: MemberStatus;
  phone: string;
  email: string;
  givingThisYear: number;
  pastoralNote?: string;
  communicationCount: number;
}

export interface RoleDefinition {
  id: MemberRoleType;
  displayName: string;
  hue: number;
  memberCount: number;
  description: string;
  permissions: string[];
}

export interface AttendanceWeekPoint {
  label: string;
  count: number;
}

export interface AttendanceEvent {
  id: string;
  name: string;
  date: string;           // YYYY-MM-DD
  attendeeCount: number;
  checkedInIds: string[];
}

// ── Members ──────────────────────────────────────────────────────────────────

export const COMMUNITY_MEMBERS: CommunityMember[] = [
  // Leadership
  {
    id: 'm1', name: 'Marcus Davis', handle: 'pastor.davis', initials: 'MD', hue: 220,
    role: 'admin', departments: ['Worship', 'Youth', 'Hospitality', 'Outreach', 'Education'],
    groups: ['Men\u2019s Fellowship'],
    joinDate: '2015-01-15', lastAttended: '2026-03-22', status: 'active',
    phone: '(323) 555-0101', email: 'pastor.davis@iccla.org', givingThisYear: 12000,
    pastoralNote: 'Senior Pastor. Founded ICCLA in 2015. Vision-driven, pastoral heart.',
    communicationCount: 145,
  },
  {
    id: 'm2', name: 'James Williams', handle: 'deacon.williams', initials: 'JW', hue: 200,
    role: 'staff', departments: ['Worship', 'Outreach'],
    groups: ['Men\u2019s Fellowship'],
    joinDate: '2015-03-01', lastAttended: '2026-03-22', status: 'active',
    phone: '(323) 555-0202', email: 'j.williams@iccla.org', givingThisYear: 8500,
    pastoralNote: 'Head Deacon. Oversees deacon board and benevolence fund.',
    communicationCount: 89,
  },
  {
    id: 'm3', name: 'Patricia Johnson', handle: 'sister.patricia', initials: 'PJ', hue: 300,
    role: 'leader', departments: ['Worship'],
    groups: ['Women\u2019s Circle'],
    joinDate: '2016-09-11', lastAttended: '2026-03-22', status: 'active',
    phone: '(323) 555-0303', email: 'p.johnson@iccla.org', givingThisYear: 4200,
    pastoralNote: 'Worship Director. Leads the choir and praise team.',
    communicationCount: 67,
  },
  {
    id: 'm4', name: 'Michael Thomas', handle: 'bro.michael', initials: 'MT', hue: 140,
    role: 'volunteer', departments: ['Youth'],
    groups: ['Young Adults'],
    joinDate: '2018-06-03', lastAttended: '2026-03-22', status: 'active',
    phone: '(323) 555-0404', email: 'm.thomas@iccla.org', givingThisYear: 1800,
    communicationCount: 34,
  },
  {
    id: 'm5', name: 'Angela Brown', handle: 'sis.angela', initials: 'AB', hue: 260,
    role: 'leader', departments: ['Education'],
    groups: ['Women\u2019s Circle', 'Bible Study 101'],
    joinDate: '2017-02-19', lastAttended: '2026-03-22', status: 'active',
    phone: '(323) 555-0505', email: 'a.brown@iccla.org', givingThisYear: 3600,
    pastoralNote: 'Education Director. Runs Sunday school and adult Bible study.',
    communicationCount: 52,
  },
  {
    id: 'm6', name: 'Shirley Washington', handle: 'deaconess.shirley', initials: 'SW', hue: 350,
    role: 'staff', departments: ['Hospitality'],
    groups: ['Women\u2019s Circle'],
    joinDate: '2015-08-22', lastAttended: '2026-03-22', status: 'active',
    phone: '(323) 555-0606', email: 's.washington@iccla.org', givingThisYear: 6000,
    pastoralNote: 'Head Deaconess. Coordinates guest services and new member welcome.',
    communicationCount: 78,
  },
  {
    id: 'm7', name: 'Robert Davis', handle: 'bro.robert', initials: 'RD', hue: 30,
    role: 'leader', departments: ['Outreach'],
    groups: ['Men\u2019s Fellowship', 'Prayer Warriors'],
    joinDate: '2016-11-07', lastAttended: '2026-03-15', status: 'active',
    phone: '(323) 555-0707', email: 'r.davis@iccla.org', givingThisYear: 2800,
    communicationCount: 41,
  },
  // Active members
  {
    id: 'm8', name: 'Tanya Martinez', handle: 'tanya.m', initials: 'TM', hue: 170,
    role: 'volunteer', departments: ['Youth'],
    groups: ['Young Adults', 'Prayer Warriors'],
    joinDate: '2019-04-14', lastAttended: '2026-03-22', status: 'active',
    phone: '(213) 555-0808', email: 'tanya.m@gmail.com', givingThisYear: 1200,
    communicationCount: 22,
  },
  {
    id: 'm9', name: 'Kevin Anderson', handle: 'kevin.a', initials: 'KA', hue: 50,
    role: 'member', departments: ['Worship'],
    groups: ['Men\u2019s Fellowship'],
    joinDate: '2020-01-12', lastAttended: '2026-03-15', status: 'active',
    phone: '(213) 555-0909', email: 'kevin.a@gmail.com', givingThisYear: 900,
    communicationCount: 8,
  },
  {
    id: 'm10', name: 'Brenda Thompson', handle: 'brenda.t', initials: 'BT', hue: 320,
    role: 'member', departments: ['Hospitality'],
    groups: ['Women\u2019s Circle'],
    joinDate: '2019-09-29', lastAttended: '2026-03-22', status: 'active',
    phone: '(213) 555-1010', email: 'brenda.t@gmail.com', givingThisYear: 1400,
    communicationCount: 15,
  },
  {
    id: 'm11', name: 'Lawrence Jackson', handle: 'lawrence.j', initials: 'LJ', hue: 80,
    role: 'member', departments: ['Outreach'],
    groups: ['Men\u2019s Fellowship', 'Bible Study 101'],
    joinDate: '2021-03-08', lastAttended: '2026-03-15', status: 'active',
    phone: '(213) 555-1111', email: 'l.jackson@gmail.com', givingThisYear: 600,
    communicationCount: 11,
  },
  {
    id: 'm12', name: 'Monica White', handle: 'monica.w', initials: 'MW', hue: 190,
    role: 'member', departments: ['Youth'],
    groups: ['Young Adults'],
    joinDate: '2022-07-17', lastAttended: '2026-03-22', status: 'active',
    phone: '(213) 555-1212', email: 'm.white@gmail.com', givingThisYear: 720,
    communicationCount: 9,
  },
  {
    id: 'm13', name: 'David Harris', handle: 'david.h', initials: 'DH', hue: 240,
    role: 'volunteer', departments: ['Worship'],
    groups: ['Prayer Warriors'],
    joinDate: '2018-12-04', lastAttended: '2026-03-15', status: 'active',
    phone: '(213) 555-1313', email: 'd.harris@gmail.com', givingThisYear: 1600,
    communicationCount: 28,
  },
  {
    id: 'm14', name: 'Cassandra Clark', handle: 'cassandra.c', initials: 'CC', hue: 110,
    role: 'member', departments: ['Education'],
    groups: ['Women\u2019s Circle', 'Bible Study 101'],
    joinDate: '2020-05-23', lastAttended: '2026-03-22', status: 'active',
    phone: '(213) 555-1414', email: 'c.clark@gmail.com', givingThisYear: 840,
    communicationCount: 7,
  },
  {
    id: 'm15', name: 'Samuel Lewis', handle: 'samuel.l', initials: 'SL', hue: 15,
    role: 'member', departments: ['Outreach'],
    groups: ['Men\u2019s Fellowship'],
    joinDate: '2021-10-31', lastAttended: '2026-03-15', status: 'active',
    phone: '(213) 555-1515', email: 's.lewis@gmail.com', givingThisYear: 480,
    communicationCount: 5,
  },
  {
    id: 'm16', name: 'Joyce Robinson', handle: 'joyce.r', initials: 'JR', hue: 280,
    role: 'leader', departments: ['Hospitality'],
    groups: ['Women\u2019s Circle'],
    joinDate: '2017-06-18', lastAttended: '2026-03-22', status: 'active',
    phone: '(213) 555-1616', email: 'j.robinson@gmail.com', givingThisYear: 2400,
    communicationCount: 36,
  },
  {
    id: 'm17', name: 'Gregory Walker', handle: 'gregory.w', initials: 'GW', hue: 60,
    role: 'volunteer', departments: ['Education'],
    groups: ['Men\u2019s Fellowship', 'Bible Study 101'],
    joinDate: '2019-02-11', lastAttended: '2026-03-15', status: 'active',
    phone: '(213) 555-1717', email: 'g.walker@gmail.com', givingThisYear: 1080,
    communicationCount: 18,
  },
  {
    id: 'm18', name: 'Diane Hall', handle: 'diane.h', initials: 'DH', hue: 330,
    role: 'member', departments: ['Youth'],
    groups: ['Young Adults', 'Women\u2019s Circle'],
    joinDate: '2023-01-08', lastAttended: '2026-03-22', status: 'active',
    phone: '(310) 555-1818', email: 'd.hall@gmail.com', givingThisYear: 360,
    communicationCount: 4,
  },
  {
    id: 'm19', name: 'Charles Young', handle: 'charles.y', initials: 'CY', hue: 160,
    role: 'member', departments: ['Worship'],
    groups: ['Prayer Warriors'],
    joinDate: '2020-08-30', lastAttended: '2026-03-15', status: 'active',
    phone: '(310) 555-1919', email: 'c.young@gmail.com', givingThisYear: 720,
    communicationCount: 6,
  },
  {
    id: 'm20', name: 'Marie King', handle: 'marie.k', initials: 'MK', hue: 20,
    role: 'member', departments: ['Hospitality'],
    groups: ['Women\u2019s Circle'],
    joinDate: '2022-03-27', lastAttended: '2026-03-22', status: 'active',
    phone: '(310) 555-2020', email: 'm.king@gmail.com', givingThisYear: 540,
    communicationCount: 9,
  },
  {
    id: 'm21', name: 'Jonathan Scott', handle: 'jonathan.s', initials: 'JS', hue: 210,
    role: 'member', departments: ['Outreach'],
    groups: ['Men\u2019s Fellowship'],
    joinDate: '2021-07-14', lastAttended: '2026-03-15', status: 'active',
    phone: '(310) 555-2121', email: 'j.scott@gmail.com', givingThisYear: 600,
    communicationCount: 7,
  },
  // At-risk (15-28 days absent)
  {
    id: 'm22', name: 'Reginald Collins', handle: 'reginald.c', initials: 'RC', hue: 340,
    role: 'member', departments: ['Outreach'],
    groups: ['Men\u2019s Fellowship'],
    joinDate: '2020-11-19', lastAttended: '2026-03-01', status: 'at_risk',
    phone: '(310) 555-2222', email: 'r.collins@gmail.com', givingThisYear: 300,
    communicationCount: 3,
  },
  {
    id: 'm23', name: 'Vanessa Turner', handle: 'vanessa.t', initials: 'VT', hue: 185,
    role: 'member', departments: ['Hospitality'],
    groups: ['Women\u2019s Circle'],
    joinDate: '2019-08-04', lastAttended: '2026-02-23', status: 'at_risk',
    phone: '(310) 555-2323', email: 'v.turner@gmail.com', givingThisYear: 0,
    pastoralNote: 'Going through a difficult season \u2014 family illness. Pastor visited 2026-02-28.',
    communicationCount: 2,
  },
  {
    id: 'm24', name: 'Tamika Baker', handle: 'tamika.b', initials: 'TB', hue: 270,
    role: 'member', departments: ['Education'],
    groups: ['Bible Study 101'],
    joinDate: '2022-09-10', lastAttended: '2026-03-01', status: 'at_risk',
    phone: '(424) 555-2424', email: 't.baker@gmail.com', givingThisYear: 120,
    communicationCount: 2,
  },
  // Inactive (29+ days absent)
  {
    id: 'm25', name: 'Isaac Mitchell', handle: 'isaac.m', initials: 'IM', hue: 90,
    role: 'member', departments: ['Worship'],
    groups: [],
    joinDate: '2021-04-25', lastAttended: '2026-01-19', status: 'inactive',
    phone: '(424) 555-2525', email: 'i.mitchell@gmail.com', givingThisYear: 0,
    communicationCount: 0,
  },
  // New (joined within 30 days)
  {
    id: 'm26', name: 'Evelyn Green', handle: 'evelyn.g', initials: 'EG', hue: 130,
    role: 'member', departments: ['Worship'],
    groups: ['Women\u2019s Circle'],
    joinDate: '2026-03-01', lastAttended: '2026-03-22', status: 'new',
    phone: '(424) 555-2626', email: 'e.green@gmail.com', givingThisYear: 100,
    communicationCount: 3,
  },
  {
    id: 'm27', name: 'DeShawn Adams', handle: 'deshawn.a', initials: 'DA', hue: 55,
    role: 'member', departments: ['Youth'],
    groups: ['Young Adults'],
    joinDate: '2026-03-08', lastAttended: '2026-03-22', status: 'new',
    phone: '(424) 555-2727', email: 'deshawn.a@gmail.com', givingThisYear: 50,
    communicationCount: 1,
  },
  // Visitors (follow-up queue)
  {
    id: 'm28', name: 'John Pemberton', handle: 'john.p', initials: 'JP', hue: 160,
    role: 'visitor', departments: [], groups: [],
    joinDate: '2026-03-16', lastAttended: '2026-03-22', status: 'visitor',
    phone: '(818) 555-2828', email: 'john.p@gmail.com', givingThisYear: 0,
    communicationCount: 0,
  },
  {
    id: 'm29', name: 'Maria Vasquez', handle: 'maria.v', initials: 'MV', hue: 340,
    role: 'visitor', departments: [], groups: [],
    joinDate: '2026-03-16', lastAttended: '2026-03-22', status: 'visitor',
    phone: '(818) 555-2929', email: 'maria.v@gmail.com', givingThisYear: 0,
    communicationCount: 0,
  },
];

// ── Roles ─────────────────────────────────────────────────────────────────────

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: 'admin', displayName: 'Admin', hue: 220, memberCount: 1,
    description: 'Full access to all features and settings.',
    permissions: ['Manage Members', 'Manage Roles', 'Send Announcements', 'View Giving', 'Edit Settings', 'Take Attendance', 'View Pastoral Notes'],
  },
  {
    id: 'staff', displayName: 'Staff', hue: 200, memberCount: 2,
    description: 'Commissioned staff with leadership authority.',
    permissions: ['Manage Members', 'Send Announcements', 'View Giving', 'Take Attendance', 'Assign Groups'],
  },
  {
    id: 'leader', displayName: 'Leader', hue: 140, memberCount: 4,
    description: 'Ministry and department leaders.',
    permissions: ['Manage Department', 'Take Attendance', 'Create Events', 'Send Department Announcements'],
  },
  {
    id: 'volunteer', displayName: 'Volunteer', hue: 50, memberCount: 4,
    description: 'Active volunteers serving in ministries.',
    permissions: ['Check-In Attendance', 'Create Group Posts', 'View Directory'],
  },
  {
    id: 'member', displayName: 'Member', hue: 30, memberCount: 15,
    description: 'Regular members of the congregation.',
    permissions: ['View Directory', 'Join Groups', 'RSVP Events', 'Submit Care Requests'],
  },
  {
    id: 'visitor', displayName: 'Visitor', hue: 0, memberCount: 2,
    description: 'First-time visitors in the follow-up queue.',
    permissions: ['View Public Profile', 'Attend Events'],
  },
];

// ── Attendance ─────────────────────────────────────────────────────────────────

export const ATTENDANCE_CHART: AttendanceWeekPoint[] = [
  { label: 'Feb 1',  count: 85 },
  { label: 'Feb 8',  count: 91 },
  { label: 'Feb 15', count: 78 },
  { label: 'Feb 22', count: 95 },
  { label: 'Mar 1',  count: 89 },
  { label: 'Mar 8',  count: 102 },
  { label: 'Mar 15', count: 87 },
  { label: 'Mar 22', count: 94 },
];

const ACTIVE_IDS = [
  'm1','m2','m3','m4','m5','m6','m7','m8','m9','m10',
  'm11','m12','m13','m14','m15','m16','m17','m18','m19','m20','m21',
];

export const ATTENDANCE_EVENTS: AttendanceEvent[] = [
  {
    id: 'e1', name: 'Sunday Morning Service', date: '2026-03-22',
    attendeeCount: 94,
    checkedInIds: [...ACTIVE_IDS, 'm26', 'm27', 'm28', 'm29'],
  },
  {
    id: 'e2', name: 'Sunday Morning Service', date: '2026-03-15',
    attendeeCount: 87,
    checkedInIds: [...ACTIVE_IDS.slice(0, 17), 'm26'],
  },
  {
    id: 'e3', name: 'Sunday Morning Service', date: '2026-03-08',
    attendeeCount: 102,
    checkedInIds: ACTIVE_IDS,
  },
  {
    id: 'e4', name: 'Sunday Morning Service', date: '2026-03-01',
    attendeeCount: 89,
    checkedInIds: [...ACTIVE_IDS.slice(0, 16), 'm22', 'm24'],
  },
  {
    id: 'e5', name: 'Sunday Morning Service', date: '2026-02-22',
    attendeeCount: 95,
    checkedInIds: [...ACTIVE_IDS, 'm22', 'm23'],
  },
  {
    id: 'e6', name: 'Sunday Morning Service', date: '2026-02-15',
    attendeeCount: 78,
    checkedInIds: ACTIVE_IDS.slice(0, 14),
  },
  {
    id: 'e7', name: 'Sunday Morning Service', date: '2026-02-08',
    attendeeCount: 91,
    checkedInIds: ACTIVE_IDS,
  },
  {
    id: 'e8', name: 'Sunday Morning Service', date: '2026-02-01',
    attendeeCount: 85,
    checkedInIds: ACTIVE_IDS.slice(0, 18),
  },
];

export const ATTENDANCE_STATS = {
  avgWeekly: 90,
  trend: 8,                  // +8% vs last month
  totalThisMonth: 275,
  newVisitorsThisMonth: 4,
};

export const MY_ATTENDANCE_HISTORY: { date: string; event: string }[] = [
  { date: '2026-03-22', event: 'Sunday Morning Service' },
  { date: '2026-03-15', event: 'Sunday Morning Service' },
  { date: '2026-03-08', event: 'Sunday Morning Service' },
  { date: '2026-03-01', event: 'Sunday Morning Service' },
  { date: '2026-02-22', event: 'Sunday Morning Service' },
  { date: '2026-02-08', event: 'Sunday Morning Service' },
  { date: '2026-02-01', event: 'Sunday Morning Service' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getAtRiskMembers()  { return COMMUNITY_MEMBERS.filter(m => m.status === 'at_risk'); }
export function getVisitorMembers() { return COMMUNITY_MEMBERS.filter(m => m.status === 'visitor'); }
export function getNewMembers()     { return COMMUNITY_MEMBERS.filter(m => m.status === 'new'); }
