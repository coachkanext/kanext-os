/**
 * Church Organization Ministries — Mock Data & Types
 * Ministry coverage seats, calendar events, health scorecards.
 */

// =============================================================================
// TYPES
// =============================================================================

export type MinistryStatus = 'active' | 'growing' | 'needs_attention' | 'on_hold';
export type SeatStatus = 'filled' | 'vacant' | 'interim';
export type HealthScore = 'green' | 'yellow' | 'red';

export interface MinistrySeat {
  id: string;
  ministryId: string;
  ministryName: string;
  role: string;
  holder: string | null; // null = vacant
  status: SeatStatus;
  critical: boolean; // true = leadership seat — vacancy triggers red flag
  since: string; // date string
}

export interface MinistryCoverage {
  ministryId: string;
  ministryName: string;
  icon: string;
  totalSeats: number;
  filledSeats: number;
  vacantLeadership: number;
  volunteerGaps: number;
  complianceFlags: number;
  seats: MinistrySeat[];
}

export interface MinistryCalendarEvent {
  id: string;
  ministryId: string;
  ministryName: string;
  title: string;
  date: string; // '2026-02-18'
  time: string; // '10:00 AM'
  room: string;
  staffingStatus: 'fully_staffed' | 'needs_volunteers' | 'critical';
}

export interface MinistryHealthCard {
  ministryId: string;
  ministryName: string;
  icon: string;
  attendanceTrend: number; // percentage change, e.g. +12 or -5
  volunteerCoverage: number; // 0-100 percent
  followUpThroughput: number; // 0-100 percent
  budgetVariance: number; // percentage, positive = under budget
  overallHealth: HealthScore;
  riskNotes: string[];
}

// =============================================================================
// CONSTANTS / LABELS
// =============================================================================

export const MINISTRY_STATUS_LABELS: Record<MinistryStatus, string> = {
  active: 'Active',
  growing: 'Growing',
  needs_attention: 'Needs Attention',
  on_hold: 'On Hold',
};

export const MINISTRY_STATUS_COLORS: Record<MinistryStatus, string> = {
  active: '#22C55E',
  growing: '#1D9BF0',
  needs_attention: '#F59E0B',
  on_hold: '#A1A1AA',
};

export const SEAT_STATUS_LABELS: Record<SeatStatus, string> = {
  filled: 'Filled',
  vacant: 'Vacant',
  interim: 'Interim',
};

export const SEAT_STATUS_COLORS: Record<SeatStatus, string> = {
  filled: '#22C55E',
  vacant: '#EF4444',
  interim: '#F59E0B',
};

export const HEALTH_COLORS: Record<HealthScore, string> = {
  green: '#22C55E',
  yellow: '#F59E0B',
  red: '#EF4444',
};

export const STAFFING_STATUS_COLORS: Record<string, string> = {
  fully_staffed: '#22C55E',
  needs_volunteers: '#F59E0B',
  critical: '#EF4444',
};

export const STAFFING_STATUS_LABELS: Record<string, string> = {
  fully_staffed: 'Fully Staffed',
  needs_volunteers: 'Needs Volunteers',
  critical: 'Critical',
};

// =============================================================================
// MINISTRY COVERAGE — SEATS
// =============================================================================

// ---------------------------------------------------------------------------
// 1. Worship & Arts
// ---------------------------------------------------------------------------
const WORSHIP_SEATS: MinistrySeat[] = [
  {
    id: 'min-seat-001',
    ministryId: 'min-001',
    ministryName: 'Worship & Arts',
    role: 'Worship Leader',
    holder: 'Minister David Brooks',
    status: 'filled',
    critical: true,
    since: '2022-06-01',
  },
  {
    id: 'min-seat-002',
    ministryId: 'min-001',
    ministryName: 'Worship & Arts',
    role: 'Choir Director',
    holder: 'Sister Angela Harris',
    status: 'filled',
    critical: true,
    since: '2023-01-15',
  },
  {
    id: 'min-seat-003',
    ministryId: 'min-001',
    ministryName: 'Worship & Arts',
    role: 'AV Lead',
    holder: null,
    status: 'vacant',
    critical: true,
    since: '2026-01-10',
  },
  {
    id: 'min-seat-004',
    ministryId: 'min-001',
    ministryName: 'Worship & Arts',
    role: 'Pianist',
    holder: 'Brother Marcus Allen',
    status: 'filled',
    critical: false,
    since: '2021-09-01',
  },
  {
    id: 'min-seat-005',
    ministryId: 'min-001',
    ministryName: 'Worship & Arts',
    role: 'Bassist',
    holder: 'Deacon Kevin Moore',
    status: 'filled',
    critical: false,
    since: '2023-03-20',
  },
  {
    id: 'min-seat-006',
    ministryId: 'min-001',
    ministryName: 'Worship & Arts',
    role: 'Drummer',
    holder: 'Brother Elijah Thompson',
    status: 'filled',
    critical: false,
    since: '2024-01-08',
  },
  {
    id: 'min-seat-007',
    ministryId: 'min-001',
    ministryName: 'Worship & Arts',
    role: 'Vocalist Lead',
    holder: 'Sister Priscilla Grant',
    status: 'filled',
    critical: false,
    since: '2023-08-15',
  },
  {
    id: 'min-seat-008',
    ministryId: 'min-001',
    ministryName: 'Worship & Arts',
    role: 'Media/Graphics',
    holder: 'Brother Terrence Lee',
    status: 'interim',
    critical: false,
    since: '2026-01-20',
  },
];

// ---------------------------------------------------------------------------
// 2. Children's Ministry
// ---------------------------------------------------------------------------
const CHILDREN_SEATS: MinistrySeat[] = [
  {
    id: 'min-seat-009',
    ministryId: 'min-002',
    ministryName: "Children's Ministry",
    role: 'Director',
    holder: 'Sister Joy Patterson',
    status: 'filled',
    critical: true,
    since: '2021-01-10',
  },
  {
    id: 'min-seat-010',
    ministryId: 'min-002',
    ministryName: "Children's Ministry",
    role: 'Sunday School Lead',
    holder: 'Sister Diane Foster',
    status: 'filled',
    critical: false,
    since: '2022-09-01',
  },
  {
    id: 'min-seat-011',
    ministryId: 'min-002',
    ministryName: "Children's Ministry",
    role: 'Nursery Coordinator',
    holder: null,
    status: 'vacant',
    critical: true,
    since: '2026-02-01',
  },
  {
    id: 'min-seat-012',
    ministryId: 'min-002',
    ministryName: "Children's Ministry",
    role: 'VBS Lead',
    holder: 'Brother Andre Williams',
    status: 'filled',
    critical: false,
    since: '2024-05-15',
  },
  {
    id: 'min-seat-013',
    ministryId: 'min-002',
    ministryName: "Children's Ministry",
    role: 'Safety Officer',
    holder: 'Deacon Ronald Burke',
    status: 'filled',
    critical: true,
    since: '2023-03-01',
  },
  {
    id: 'min-seat-014',
    ministryId: 'min-002',
    ministryName: "Children's Ministry",
    role: 'Volunteer Coordinator',
    holder: 'Sister Tameka Brown',
    status: 'filled',
    critical: false,
    since: '2024-08-20',
  },
];

// ---------------------------------------------------------------------------
// 3. Youth Ministry
// ---------------------------------------------------------------------------
const YOUTH_SEATS: MinistrySeat[] = [
  {
    id: 'min-seat-015',
    ministryId: 'min-003',
    ministryName: 'Youth Ministry',
    role: 'Youth Pastor',
    holder: 'Pastor Joshua Davis',
    status: 'filled',
    critical: true,
    since: '2023-06-01',
  },
  {
    id: 'min-seat-016',
    ministryId: 'min-003',
    ministryName: 'Youth Ministry',
    role: 'Small Group Lead',
    holder: 'Brother Nathan Cross',
    status: 'filled',
    critical: false,
    since: '2024-01-15',
  },
  {
    id: 'min-seat-017',
    ministryId: 'min-003',
    ministryName: 'Youth Ministry',
    role: 'Events Coordinator',
    holder: null,
    status: 'vacant',
    critical: false,
    since: '2025-12-15',
  },
  {
    id: 'min-seat-018',
    ministryId: 'min-003',
    ministryName: 'Youth Ministry',
    role: 'Mentorship Lead',
    holder: 'Deacon Charles Reed',
    status: 'filled',
    critical: false,
    since: '2024-03-10',
  },
  {
    id: 'min-seat-019',
    ministryId: 'min-003',
    ministryName: 'Youth Ministry',
    role: 'Social Media',
    holder: null,
    status: 'vacant',
    critical: false,
    since: '2026-01-05',
  },
];

// ---------------------------------------------------------------------------
// 4. Outreach & Missions
// ---------------------------------------------------------------------------
const OUTREACH_SEATS: MinistrySeat[] = [
  {
    id: 'min-seat-020',
    ministryId: 'min-004',
    ministryName: 'Outreach & Missions',
    role: 'Director',
    holder: 'Minister Karen Whitfield',
    status: 'filled',
    critical: true,
    since: '2020-07-01',
  },
  {
    id: 'min-seat-021',
    ministryId: 'min-004',
    ministryName: 'Outreach & Missions',
    role: 'Local Missions Lead',
    holder: 'Brother Samuel Okafor',
    status: 'filled',
    critical: false,
    since: '2023-04-20',
  },
  {
    id: 'min-seat-022',
    ministryId: 'min-004',
    ministryName: 'Outreach & Missions',
    role: 'International Lead',
    holder: null,
    status: 'vacant',
    critical: false,
    since: '2025-11-01',
  },
  {
    id: 'min-seat-023',
    ministryId: 'min-004',
    ministryName: 'Outreach & Missions',
    role: 'Benevolence Coordinator',
    holder: 'Sister Grace Nwosu',
    status: 'filled',
    critical: false,
    since: '2024-02-14',
  },
  {
    id: 'min-seat-024',
    ministryId: 'min-004',
    ministryName: 'Outreach & Missions',
    role: 'Community Events',
    holder: 'Brother Isaiah Coleman',
    status: 'filled',
    critical: false,
    since: '2024-06-01',
  },
];

// ---------------------------------------------------------------------------
// 5. Care & Counseling
// ---------------------------------------------------------------------------
const CARE_SEATS: MinistrySeat[] = [
  {
    id: 'min-seat-025',
    ministryId: 'min-005',
    ministryName: 'Care & Counseling',
    role: 'Pastoral Care Lead',
    holder: 'Elder Patricia Simmons',
    status: 'filled',
    critical: true,
    since: '2019-10-01',
  },
  {
    id: 'min-seat-026',
    ministryId: 'min-005',
    ministryName: 'Care & Counseling',
    role: 'Grief Support',
    holder: 'Sister Darlene Washington',
    status: 'filled',
    critical: false,
    since: '2022-05-01',
  },
  {
    id: 'min-seat-027',
    ministryId: 'min-005',
    ministryName: 'Care & Counseling',
    role: 'Hospital Visitation',
    holder: null,
    status: 'vacant',
    critical: true,
    since: '2025-12-01',
  },
  {
    id: 'min-seat-028',
    ministryId: 'min-005',
    ministryName: 'Care & Counseling',
    role: 'Marriage Ministry',
    holder: 'Pastor Michael & Sister Ruth Barnes',
    status: 'filled',
    critical: false,
    since: '2021-02-14',
  },
];

// ---------------------------------------------------------------------------
// 6. Finance & Stewardship
// ---------------------------------------------------------------------------
const FINANCE_SEATS: MinistrySeat[] = [
  {
    id: 'min-seat-029',
    ministryId: 'min-006',
    ministryName: 'Finance & Stewardship',
    role: 'Treasurer',
    holder: 'Deacon Harold Jenkins',
    status: 'filled',
    critical: true,
    since: '2020-01-01',
  },
  {
    id: 'min-seat-030',
    ministryId: 'min-006',
    ministryName: 'Finance & Stewardship',
    role: 'Bookkeeper',
    holder: 'Sister Lorraine Maxwell',
    status: 'filled',
    critical: false,
    since: '2021-06-15',
  },
  {
    id: 'min-seat-031',
    ministryId: 'min-006',
    ministryName: 'Finance & Stewardship',
    role: 'Offering Count Lead',
    holder: 'Brother Dennis Clark',
    status: 'filled',
    critical: false,
    since: '2022-11-01',
  },
  {
    id: 'min-seat-032',
    ministryId: 'min-006',
    ministryName: 'Finance & Stewardship',
    role: 'Audit Chair',
    holder: 'Elder Thomas Carter',
    status: 'filled',
    critical: true,
    since: '2023-01-01',
  },
];

// ---------------------------------------------------------------------------
// 7. Facilities & Grounds
// ---------------------------------------------------------------------------
const FACILITIES_SEATS: MinistrySeat[] = [
  {
    id: 'min-seat-033',
    ministryId: 'min-007',
    ministryName: 'Facilities & Grounds',
    role: 'Facilities Manager',
    holder: 'Brother Raymond Scott',
    status: 'filled',
    critical: true,
    since: '2021-03-01',
  },
  {
    id: 'min-seat-034',
    ministryId: 'min-007',
    ministryName: 'Facilities & Grounds',
    role: 'Janitorial Lead',
    holder: 'Brother Vincent Hall',
    status: 'filled',
    critical: false,
    since: '2023-07-01',
  },
  {
    id: 'min-seat-035',
    ministryId: 'min-007',
    ministryName: 'Facilities & Grounds',
    role: 'Grounds Keeper',
    holder: null,
    status: 'vacant',
    critical: false,
    since: '2026-01-15',
  },
];

// ---------------------------------------------------------------------------
// 8. Welcome & Hospitality
// ---------------------------------------------------------------------------
const WELCOME_SEATS: MinistrySeat[] = [
  {
    id: 'min-seat-036',
    ministryId: 'min-008',
    ministryName: 'Welcome & Hospitality',
    role: 'Director',
    holder: 'Sister Evelyn Harper',
    status: 'filled',
    critical: true,
    since: '2022-01-01',
  },
  {
    id: 'min-seat-037',
    ministryId: 'min-008',
    ministryName: 'Welcome & Hospitality',
    role: 'Greeter Captain',
    holder: 'Brother Calvin Mitchell',
    status: 'filled',
    critical: false,
    since: '2023-09-01',
  },
  {
    id: 'min-seat-038',
    ministryId: 'min-008',
    ministryName: 'Welcome & Hospitality',
    role: 'Usher Captain',
    holder: 'Deacon Walter Robinson',
    status: 'filled',
    critical: false,
    since: '2022-04-15',
  },
  {
    id: 'min-seat-039',
    ministryId: 'min-008',
    ministryName: 'Welcome & Hospitality',
    role: 'Cafe/Kitchen Lead',
    holder: null,
    status: 'vacant',
    critical: false,
    since: '2026-02-05',
  },
];

// =============================================================================
// MINISTRY COVERAGE — AGGREGATED
// =============================================================================

const MINISTRY_COVERAGE: MinistryCoverage[] = [
  {
    ministryId: 'min-001',
    ministryName: 'Worship & Arts',
    icon: 'music.note.list',
    totalSeats: 8,
    filledSeats: 6,
    vacantLeadership: 1,
    volunteerGaps: 1,
    complianceFlags: 0,
    seats: WORSHIP_SEATS,
  },
  {
    ministryId: 'min-002',
    ministryName: "Children's Ministry",
    icon: 'figure.and.child.holdinghands',
    totalSeats: 6,
    filledSeats: 5,
    vacantLeadership: 1,
    volunteerGaps: 0,
    complianceFlags: 1,
    seats: CHILDREN_SEATS,
  },
  {
    ministryId: 'min-003',
    ministryName: 'Youth Ministry',
    icon: 'person.3.fill',
    totalSeats: 5,
    filledSeats: 3,
    vacantLeadership: 0,
    volunteerGaps: 2,
    complianceFlags: 0,
    seats: YOUTH_SEATS,
  },
  {
    ministryId: 'min-004',
    ministryName: 'Outreach & Missions',
    icon: 'globe.americas.fill',
    totalSeats: 5,
    filledSeats: 4,
    vacantLeadership: 0,
    volunteerGaps: 1,
    complianceFlags: 0,
    seats: OUTREACH_SEATS,
  },
  {
    ministryId: 'min-005',
    ministryName: 'Care & Counseling',
    icon: 'heart.circle.fill',
    totalSeats: 4,
    filledSeats: 3,
    vacantLeadership: 1,
    volunteerGaps: 1,
    complianceFlags: 1,
    seats: CARE_SEATS,
  },
  {
    ministryId: 'min-006',
    ministryName: 'Finance & Stewardship',
    icon: 'dollarsign.circle.fill',
    totalSeats: 4,
    filledSeats: 4,
    vacantLeadership: 0,
    volunteerGaps: 0,
    complianceFlags: 0,
    seats: FINANCE_SEATS,
  },
  {
    ministryId: 'min-007',
    ministryName: 'Facilities & Grounds',
    icon: 'building.2.fill',
    totalSeats: 3,
    filledSeats: 2,
    vacantLeadership: 0,
    volunteerGaps: 1,
    complianceFlags: 0,
    seats: FACILITIES_SEATS,
  },
  {
    ministryId: 'min-008',
    ministryName: 'Welcome & Hospitality',
    icon: 'hand.wave.fill',
    totalSeats: 4,
    filledSeats: 3,
    vacantLeadership: 0,
    volunteerGaps: 1,
    complianceFlags: 0,
    seats: WELCOME_SEATS,
  },
];

// =============================================================================
// MINISTRY CALENDAR EVENTS
// =============================================================================

const MINISTRY_CALENDAR: MinistryCalendarEvent[] = [
  // Week 1 — Feb 18-24
  {
    id: 'min-cal-001',
    ministryId: 'min-001',
    ministryName: 'Worship & Arts',
    title: 'Worship Team Rehearsal',
    date: '2026-02-18',
    time: '7:00 PM',
    room: 'Main Sanctuary',
    staffingStatus: 'needs_volunteers',
  },
  {
    id: 'min-cal-002',
    ministryId: 'min-003',
    ministryName: 'Youth Ministry',
    title: 'Wednesday Youth Bible Study',
    date: '2026-02-18',
    time: '6:30 PM',
    room: 'Youth Center',
    staffingStatus: 'fully_staffed',
  },
  {
    id: 'min-cal-003',
    ministryId: 'min-005',
    ministryName: 'Care & Counseling',
    title: 'Grief Support Group',
    date: '2026-02-19',
    time: '10:00 AM',
    room: 'Room 204',
    staffingStatus: 'fully_staffed',
  },
  {
    id: 'min-cal-004',
    ministryId: 'min-004',
    ministryName: 'Outreach & Missions',
    title: 'Food Pantry Distribution',
    date: '2026-02-20',
    time: '9:00 AM',
    room: 'Fellowship Hall',
    staffingStatus: 'needs_volunteers',
  },
  {
    id: 'min-cal-005',
    ministryId: 'min-001',
    ministryName: 'Worship & Arts',
    title: 'Choir Rehearsal',
    date: '2026-02-20',
    time: '7:00 PM',
    room: 'Choir Room',
    staffingStatus: 'fully_staffed',
  },
  {
    id: 'min-cal-006',
    ministryId: 'min-002',
    ministryName: "Children's Ministry",
    title: 'Sunday School — All Ages',
    date: '2026-02-22',
    time: '9:30 AM',
    room: "Children's Wing A & B",
    staffingStatus: 'critical',
  },
  {
    id: 'min-cal-007',
    ministryId: 'min-008',
    ministryName: 'Welcome & Hospitality',
    title: 'Sunday Morning Greeting Stations',
    date: '2026-02-22',
    time: '8:30 AM',
    room: 'Main Lobby',
    staffingStatus: 'fully_staffed',
  },
  {
    id: 'min-cal-008',
    ministryId: 'min-001',
    ministryName: 'Worship & Arts',
    title: 'Sunday Worship Service',
    date: '2026-02-22',
    time: '10:00 AM',
    room: 'Main Sanctuary',
    staffingStatus: 'needs_volunteers',
  },
  // Week 2 — Feb 25 - Mar 3
  {
    id: 'min-cal-009',
    ministryId: 'min-003',
    ministryName: 'Youth Ministry',
    title: 'Youth Fellowship Night',
    date: '2026-02-25',
    time: '6:30 PM',
    room: 'Youth Center',
    staffingStatus: 'needs_volunteers',
  },
  {
    id: 'min-cal-010',
    ministryId: 'min-006',
    ministryName: 'Finance & Stewardship',
    title: 'Monthly Finance Committee Meeting',
    date: '2026-02-26',
    time: '6:00 PM',
    room: 'Conference Room',
    staffingStatus: 'fully_staffed',
  },
  {
    id: 'min-cal-011',
    ministryId: 'min-005',
    ministryName: 'Care & Counseling',
    title: 'Hospital Visitation Rotation',
    date: '2026-02-27',
    time: '2:00 PM',
    room: 'Off-Site — Regional Medical',
    staffingStatus: 'critical',
  },
  {
    id: 'min-cal-012',
    ministryId: 'min-004',
    ministryName: 'Outreach & Missions',
    title: 'Community Block Party Planning',
    date: '2026-02-27',
    time: '6:00 PM',
    room: 'Fellowship Hall',
    staffingStatus: 'fully_staffed',
  },
  {
    id: 'min-cal-013',
    ministryId: 'min-007',
    ministryName: 'Facilities & Grounds',
    title: 'Spring Grounds Cleanup Day',
    date: '2026-02-28',
    time: '8:00 AM',
    room: 'Main Campus — Exterior',
    staffingStatus: 'needs_volunteers',
  },
  {
    id: 'min-cal-014',
    ministryId: 'min-002',
    ministryName: "Children's Ministry",
    title: 'VBS Volunteer Training',
    date: '2026-02-28',
    time: '10:00 AM',
    room: "Children's Wing A",
    staffingStatus: 'fully_staffed',
  },
  {
    id: 'min-cal-015',
    ministryId: 'min-001',
    ministryName: 'Worship & Arts',
    title: 'Sunday Worship Service',
    date: '2026-03-01',
    time: '10:00 AM',
    room: 'Main Sanctuary',
    staffingStatus: 'needs_volunteers',
  },
  {
    id: 'min-cal-016',
    ministryId: 'min-008',
    ministryName: 'Welcome & Hospitality',
    title: 'New Members Luncheon',
    date: '2026-03-01',
    time: '12:30 PM',
    room: 'Fellowship Hall',
    staffingStatus: 'needs_volunteers',
  },
];

// =============================================================================
// MINISTRY HEALTH CARDS
// =============================================================================

const MINISTRY_HEALTH: MinistryHealthCard[] = [
  {
    ministryId: 'min-001',
    ministryName: 'Worship & Arts',
    icon: 'music.note.list',
    attendanceTrend: 12,
    volunteerCoverage: 88,
    followUpThroughput: 92,
    budgetVariance: 5,
    overallHealth: 'green',
    riskNotes: [
      'AV Lead vacancy — rotating volunteers covering but quality inconsistent',
    ],
  },
  {
    ministryId: 'min-002',
    ministryName: "Children's Ministry",
    icon: 'figure.and.child.holdinghands',
    attendanceTrend: 15,
    volunteerCoverage: 85,
    followUpThroughput: 90,
    budgetVariance: 3,
    overallHealth: 'green',
    riskNotes: [
      'Nursery Coordinator vacancy must be filled before Easter surge',
      'Background check renewal pending for 2 volunteers',
    ],
  },
  {
    ministryId: 'min-003',
    ministryName: 'Youth Ministry',
    icon: 'person.3.fill',
    attendanceTrend: -8,
    volunteerCoverage: 60,
    followUpThroughput: 55,
    budgetVariance: -2,
    overallHealth: 'yellow',
    riskNotes: [
      'Attendance trending down 8% — need engagement strategy',
      'Events Coordinator and Social Media roles both vacant',
      'Follow-up throughput below 60% — visitors not being contacted',
    ],
  },
  {
    ministryId: 'min-004',
    ministryName: 'Outreach & Missions',
    icon: 'globe.americas.fill',
    attendanceTrend: 6,
    volunteerCoverage: 78,
    followUpThroughput: 82,
    budgetVariance: 8,
    overallHealth: 'green',
    riskNotes: [
      'International Lead position open — limits overseas partnerships',
    ],
  },
  {
    ministryId: 'min-005',
    ministryName: 'Care & Counseling',
    icon: 'heart.circle.fill',
    attendanceTrend: -3,
    volunteerCoverage: 42,
    followUpThroughput: 38,
    budgetVariance: -6,
    overallHealth: 'red',
    riskNotes: [
      'Hospital Visitation vacancy — critical pastoral care gap',
      'Volunteer coverage at 42% — below minimum threshold',
      'Follow-up throughput critically low at 38%',
      'Budget overrun due to outsourced counseling referrals',
    ],
  },
  {
    ministryId: 'min-006',
    ministryName: 'Finance & Stewardship',
    icon: 'dollarsign.circle.fill',
    attendanceTrend: 4,
    volunteerCoverage: 100,
    followUpThroughput: 95,
    budgetVariance: 12,
    overallHealth: 'green',
    riskNotes: [],
  },
  {
    ministryId: 'min-007',
    ministryName: 'Facilities & Grounds',
    icon: 'building.2.fill',
    attendanceTrend: 0,
    volunteerCoverage: 67,
    followUpThroughput: 75,
    budgetVariance: -4,
    overallHealth: 'yellow',
    riskNotes: [
      'Grounds Keeper vacancy — spring season approaching',
      'Budget slightly over due to emergency kitchen repair',
    ],
  },
  {
    ministryId: 'min-008',
    ministryName: 'Welcome & Hospitality',
    icon: 'hand.wave.fill',
    attendanceTrend: 10,
    volunteerCoverage: 75,
    followUpThroughput: 80,
    budgetVariance: 2,
    overallHealth: 'green',
    riskNotes: [
      'Cafe/Kitchen Lead vacancy — fellowship hour coverage thin',
    ],
  },
];

// =============================================================================
// DATA ACCESSOR
// =============================================================================

export function getChurchMinistriesData() {
  return {
    coverage: MINISTRY_COVERAGE,
    calendar: MINISTRY_CALENDAR,
    health: MINISTRY_HEALTH,
    // Computed tiles
    tiles: {
      activeMinistries: MINISTRY_COVERAGE.length,
      vacantLeadership: MINISTRY_COVERAGE.reduce(
        (sum, m) => sum + m.vacantLeadership,
        0,
      ),
      volunteerGaps: MINISTRY_COVERAGE.reduce(
        (sum, m) => sum + m.volunteerGaps,
        0,
      ),
      complianceFlags: MINISTRY_COVERAGE.reduce(
        (sum, m) => sum + m.complianceFlags,
        0,
      ),
    },
  };
}

export function getMinistryCoverageById(
  id: string,
): MinistryCoverage | undefined {
  return MINISTRY_COVERAGE.find((m) => m.ministryId === id);
}

export function getMinistrySeatById(id: string): MinistrySeat | undefined {
  for (const ministry of MINISTRY_COVERAGE) {
    const seat = ministry.seats.find((s) => s.id === id);
    if (seat) return seat;
  }
  return undefined;
}
