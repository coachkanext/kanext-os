/**
 * Mock data for Church Home — KaNeXT Church (KaNeXT Church of Los Angeles)
 * A large, vibrant Black church in Los Angeles.
 *
 * Supports 4 main pills: Dashboard · Calendar · Ministries · Connect
 */

import type { ProgramCalendarEvent } from '@/types';

// =============================================================================
// CHURCH CALENDAR EVENTS
// =============================================================================

export const CHURCH_CALENDAR_EVENTS: ProgramCalendarEvent[] = [
  {
    id: 'ce-001',
    type: 'meeting',
    title: 'Sunday Worship Experience',
    startDatetime: new Date('2025-02-23T09:30:00'),
    endDatetime: new Date('2025-02-23T12:00:00'),
    location: 'Main Sanctuary',
    description: 'Morning worship with Pastor Isaiah. Faith That Moves Mountains series continues.',
    visibilityScope: 'all_program',
  },
  {
    id: 'ce-002',
    type: 'meeting',
    title: 'Midweek Bible Study',
    startDatetime: new Date('2025-02-26T19:00:00'),
    endDatetime: new Date('2025-02-26T20:30:00'),
    location: 'Fellowship Hall',
    description: 'Wednesday Night Word with Elder Marcus — Hebrews deep-dive.',
    visibilityScope: 'all_program',
  },
  {
    id: 'ce-003',
    type: 'meeting',
    title: 'Catalyst Youth Night',
    startDatetime: new Date('2025-02-28T18:30:00'),
    endDatetime: new Date('2025-02-28T21:00:00'),
    location: 'Youth Center',
    description: 'Friday youth gathering — worship, games, and small group breakouts.',
    visibilityScope: 'all_program',
  },
  {
    id: 'ce-004',
    type: 'meeting',
    title: 'Morning Prayer Line — Morning Prayer',
    startDatetime: new Date('2025-02-25T06:00:00'),
    endDatetime: new Date('2025-02-25T07:00:00'),
    location: 'Prayer Chapel',
    description: 'Corporate intercessory prayer. All are welcome.',
    visibilityScope: 'all_program',
  },
  {
    id: 'ce-005',
    type: 'meeting',
    title: 'Sunday Worship Experience',
    startDatetime: new Date('2025-03-02T09:30:00'),
    endDatetime: new Date('2025-03-02T12:00:00'),
    location: 'Main Sanctuary',
    description: 'Faith That Moves Mountains series — Part 4: "The Prayer of Faith"',
    visibilityScope: 'all_program',
  },
  {
    id: 'ce-006',
    type: 'meeting',
    title: 'Kingdom Builders Leadership Meeting',
    startDatetime: new Date('2025-03-01T09:00:00'),
    endDatetime: new Date('2025-03-01T11:00:00'),
    location: 'Conference Room A',
    description: 'Monthly leadership roundtable with Deacon Board and Ministry Heads.',
    visibilityScope: 'team_staff',
  },
  {
    id: 'ce-007',
    type: 'meeting',
    title: 'KaNeXT Kids Children\'s Church',
    startDatetime: new Date('2025-03-02T09:30:00'),
    endDatetime: new Date('2025-03-02T11:30:00'),
    location: 'Children\'s Wing',
    description: 'Kids worship and Bible lessons during main service.',
    visibilityScope: 'all_program',
  },
  {
    id: 'ce-008',
    type: 'meeting',
    title: 'Community Outreach — Community Outreach',
    startDatetime: new Date('2025-03-08T08:00:00'),
    endDatetime: new Date('2025-03-08T13:00:00'),
    location: 'Skid Row Community Center',
    description: 'Monthly feeding program and clothing distribution. Volunteers meet at 7:30 AM.',
    visibilityScope: 'all_program',
  },
  {
    id: 'ce-009',
    type: 'meeting',
    title: 'Ignite Youth Young Adults',
    startDatetime: new Date('2025-03-04T19:30:00'),
    endDatetime: new Date('2025-03-04T21:00:00'),
    location: 'Fellowship Hall',
    description: 'Worship night + panel: "Walking in Purpose in Your 20s"',
    visibilityScope: 'all_program',
  },
  {
    id: 'ce-010',
    type: 'meeting',
    title: 'Worship Team Choir Rehearsal',
    startDatetime: new Date('2025-02-27T19:00:00'),
    endDatetime: new Date('2025-02-27T21:00:00'),
    location: 'Main Sanctuary',
    description: 'Rehearsal for Easter cantata. All choir members required.',
    visibilityScope: 'all_program',
  },
  {
    id: 'ce-011',
    type: 'meeting',
    title: 'Rooted — New Members Orientation',
    startDatetime: new Date('2025-03-09T13:00:00'),
    endDatetime: new Date('2025-03-09T15:30:00'),
    location: 'Conference Room B',
    description: '4-week orientation class begins. Lunch provided.',
    visibilityScope: 'all_program',
  },
  {
    id: 'ce-012',
    type: 'meeting',
    title: 'Single & Purposeful — Social Mixer',
    startDatetime: new Date('2025-03-07T18:30:00'),
    endDatetime: new Date('2025-03-07T21:00:00'),
    location: 'Fellowship Hall',
    description: 'Game night and fellowship for singles ministry. Potluck style.',
    visibilityScope: 'all_program',
  },
  {
    id: 'ce-013',
    type: 'meeting',
    title: 'Midweek Bible Study',
    startDatetime: new Date('2025-03-05T19:00:00'),
    endDatetime: new Date('2025-03-05T20:30:00'),
    location: 'Fellowship Hall',
    description: 'Wednesday Night Word with Elder Marcus — Hebrews chapter 11.',
    visibilityScope: 'all_program',
  },
  {
    id: 'ce-014',
    type: 'meeting',
    title: 'Water Baptism Service',
    startDatetime: new Date('2025-03-16T14:00:00'),
    endDatetime: new Date('2025-03-16T16:00:00'),
    location: 'Main Sanctuary — Baptismal Pool',
    description: 'Monthly baptism service. Register through the church app or Welcome Desk.',
    visibilityScope: 'all_program',
  },
  {
    id: 'ce-015',
    type: 'meeting',
    title: 'Connect Group Leaders Training',
    startDatetime: new Date('2025-03-15T10:00:00'),
    endDatetime: new Date('2025-03-15T12:00:00'),
    location: 'Conference Room A',
    description: 'Quarterly equipping session for all small group leaders.',
    visibilityScope: 'team_staff',
  },
  {
    id: 'ce-016',
    type: 'meeting',
    title: 'Easter Week — Good Friday Service',
    startDatetime: new Date('2025-04-18T19:00:00'),
    endDatetime: new Date('2025-04-18T21:00:00'),
    location: 'Main Sanctuary',
    description: 'Solemn reflection service with communion and Worship Team cantata.',
    visibilityScope: 'all_program',
  },
  {
    id: 'ce-017',
    type: 'meeting',
    title: 'Easter Sunday Celebration',
    startDatetime: new Date('2025-04-20T08:00:00'),
    endDatetime: new Date('2025-04-20T13:00:00'),
    location: 'Main Sanctuary + Overflow',
    description: 'Resurrection Sunday! Two services: 8 AM Sunrise & 10:30 AM Celebration.',
    visibilityScope: 'all_program',
  },
  {
    id: 'ce-018',
    type: 'meeting',
    title: 'Morning Prayer Line — Friday Night Prayer',
    startDatetime: new Date('2025-02-28T21:00:00'),
    endDatetime: new Date('2025-02-28T23:00:00'),
    location: 'Prayer Chapel',
    description: 'Late-night corporate prayer and intercession. Anointing service.',
    visibilityScope: 'all_program',
  },
];

// =============================================================================
// SERVICES
// =============================================================================

export interface ChurchService {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'sunday_morning' | 'sunday_evening' | 'midweek' | 'special';
  speaker: string;
  topic?: string;
  seriesName?: string;
  attendance?: number;
  status: 'upcoming' | 'past';
  isLive?: boolean;
  videoId?: string;
}

export const CHURCH_SERVICES: ChurchService[] = [
  // ── 8 Upcoming ──
  {
    id: 'svc-001',
    title: 'Sunday Worship Experience',
    date: '2025-02-23',
    time: '9:30 AM',
    type: 'sunday_morning',
    speaker: 'Pastor Isaiah',
    topic: 'The Prayer of Faith',
    seriesName: 'Faith That Moves Mountains',
    status: 'upcoming',
  },
  {
    id: 'svc-002',
    title: 'Midweek Bible Study',
    date: '2025-02-26',
    time: '7:00 PM',
    type: 'midweek',
    speaker: 'Elder Marcus Williams',
    topic: 'Hebrews 11 — The Hall of Faith',
    status: 'upcoming',
  },
  {
    id: 'svc-003',
    title: 'Sunday Worship Experience',
    date: '2025-03-02',
    time: '9:30 AM',
    type: 'sunday_morning',
    speaker: 'Pastor Isaiah',
    topic: 'Speaking to Your Mountain',
    seriesName: 'Faith That Moves Mountains',
    status: 'upcoming',
  },
  {
    id: 'svc-004',
    title: 'Midweek Bible Study',
    date: '2025-03-05',
    time: '7:00 PM',
    type: 'midweek',
    speaker: 'Elder Marcus Williams',
    topic: 'Hebrews 12 — Running the Race',
    status: 'upcoming',
  },
  {
    id: 'svc-005',
    title: 'Sunday Worship Experience',
    date: '2025-03-09',
    time: '9:30 AM',
    type: 'sunday_morning',
    speaker: 'Pastor Isaiah',
    topic: 'Unwavering Trust',
    seriesName: 'Faith That Moves Mountains',
    status: 'upcoming',
  },
  {
    id: 'svc-006',
    title: 'Water Baptism Service',
    date: '2025-03-16',
    time: '2:00 PM',
    type: 'special',
    speaker: 'Pastor Isaiah',
    topic: 'Buried With Christ, Raised to Walk in Newness',
    status: 'upcoming',
  },
  {
    id: 'svc-007',
    title: 'Good Friday Service',
    date: '2025-04-18',
    time: '7:00 PM',
    type: 'special',
    speaker: 'Pastor Isaiah',
    topic: 'It Is Finished',
    status: 'upcoming',
  },
  {
    id: 'svc-008',
    title: 'Easter Sunday Celebration',
    date: '2025-04-20',
    time: '8:00 AM & 10:30 AM',
    type: 'special',
    speaker: 'Pastor Isaiah',
    topic: 'He Got Up!',
    status: 'upcoming',
  },
  // ── Special Services ──
  {
    id: 'svc-013',
    title: 'Peniel · Holy Ghost & Consecration Service',
    date: '2025-03-21',
    time: '7:00 PM',
    type: 'special',
    speaker: 'Pastor Isaiah',
    topic: 'Encounter at Peniel — Wrestling Until Daybreak',
    status: 'upcoming',
  },
  {
    id: 'svc-014',
    title: 'Rhythms From The Roots',
    date: '2025-03-28',
    time: '6:00 PM',
    type: 'special',
    speaker: 'Minister Jasmine Okafor',
    topic: 'A night of gospel, hymns, and spoken word tracing the Black church tradition',
    status: 'upcoming',
  },
  {
    id: 'svc-015',
    title: '40 Days Fasting and Prayer',
    date: '2025-03-03',
    time: '6:00 AM',
    type: 'special',
    speaker: 'Mother Estelle Jacobs',
    topic: 'Consecration season begins — corporate fast with daily prayer guide',
    seriesName: '40 Days of Power',
    status: 'upcoming',
  },
  // ── 4 Past ──
  {
    id: 'svc-009',
    title: 'Sunday Worship Experience',
    date: '2025-02-16',
    time: '9:30 AM',
    type: 'sunday_morning',
    speaker: 'Pastor Isaiah',
    topic: 'The Unshakeable Foundation',
    seriesName: 'Faith That Moves Mountains',
    attendance: 1420,
    status: 'past',
    videoId: 'iccla-2025-0216',
  },
  {
    id: 'svc-010',
    title: 'Midweek Bible Study',
    date: '2025-02-19',
    time: '7:00 PM',
    type: 'midweek',
    speaker: 'Elder Marcus Williams',
    topic: 'Hebrews 10 — Drawing Near With Confidence',
    attendance: 385,
    status: 'past',
    videoId: 'iccla-bstudy-0219',
  },
  {
    id: 'svc-011',
    title: 'Sunday Worship Experience',
    date: '2025-02-09',
    time: '9:30 AM',
    type: 'sunday_morning',
    speaker: 'Pastor Isaiah',
    topic: 'Planted by Living Water',
    seriesName: 'Faith That Moves Mountains',
    attendance: 1385,
    status: 'past',
    videoId: 'iccla-2025-0209',
  },
  {
    id: 'svc-012',
    title: 'Sunday Worship Experience',
    date: '2025-02-02',
    time: '9:30 AM',
    type: 'sunday_morning',
    speaker: 'Minister Terrence Jackson',
    topic: 'Laying the First Stone',
    seriesName: 'Faith That Moves Mountains',
    attendance: 1290,
    status: 'past',
    videoId: 'iccla-2025-0202',
  },
];

// =============================================================================
// IMPACT METRICS — ATTENDANCE
// =============================================================================

export interface AttendanceMonth {
  month: string;
  inPerson: number;
  online: number;
  total: number;
}

export const ATTENDANCE_DATA: AttendanceMonth[] = [
  { month: 'Sep 2024', inPerson: 5200, online: 1800, total: 7000 },
  { month: 'Oct 2024', inPerson: 5450, online: 1950, total: 7400 },
  { month: 'Nov 2024', inPerson: 5600, online: 2100, total: 7700 },
  { month: 'Dec 2024', inPerson: 6800, online: 2600, total: 9400 },
  { month: 'Jan 2025', inPerson: 5100, online: 1750, total: 6850 },
  { month: 'Feb 2025', inPerson: 5350, online: 1900, total: 7250 },
];

// =============================================================================
// IMPACT METRICS — GIVING
// =============================================================================

export interface GivingMonth {
  month: string;
  tithes: number;
  offerings: number;
  missions: number;
  buildingFund: number;
  total: number;
}

export interface CampaignGoal {
  name: string;
  target: number;
  raised: number;
}

export const ACTIVE_CAMPAIGN: CampaignGoal = {
  name: 'Building Fund',
  target: 500000,
  raised: 127000,
};

export const GIVING_DATA: GivingMonth[] = [
  { month: 'Sep 2024', tithes: 82000, offerings: 14500, missions: 6200, buildingFund: 15000, total: 117700 },
  { month: 'Oct 2024', tithes: 85000, offerings: 15800, missions: 7100, buildingFund: 18000, total: 125900 },
  { month: 'Nov 2024', tithes: 88000, offerings: 18200, missions: 8500, buildingFund: 22000, total: 136700 },
  { month: 'Dec 2024', tithes: 112000, offerings: 28500, missions: 12000, buildingFund: 35000, total: 187500 },
  { month: 'Jan 2025', tithes: 78000, offerings: 12800, missions: 5800, buildingFund: 16000, total: 112600 },
  { month: 'Feb 2025', tithes: 81000, offerings: 13600, missions: 6400, buildingFund: 21000, total: 122000 },
];

// =============================================================================
// IMPACT METRICS — GROWTH
// =============================================================================

export interface GrowthMetrics {
  baptisms: number;
  firstTimeVisitors: number;
  newMembers: number;
  salvationDecisions: number;
  volunteerCount: number;
  connectGroupRate: number;
  period: string;
}

export const GROWTH_METRICS: GrowthMetrics = {
  baptisms: 23,
  firstTimeVisitors: 156,
  newMembers: 47,
  salvationDecisions: 34,
  volunteerCount: 214,
  connectGroupRate: 0.34,
  period: 'Last 6 Months',
};

// =============================================================================
// NEWS
// =============================================================================

export interface ChurchNewsItem {
  id: string;
  title: string;
  category: 'sermon' | 'testimony' | 'ministry_highlight' | 'announcement' | 'outreach' | 'worship';
  thumbnail?: string;
  date: string;
  duration?: string;
  isVideo: boolean;
  speaker?: string;
}

export const CHURCH_NEWS: ChurchNewsItem[] = [
  {
    id: 'news-001',
    title: 'The Unshakeable Foundation — Full Sermon',
    category: 'sermon',
    date: '2025-02-16',
    duration: '48:22',
    isVideo: true,
    speaker: 'Pastor Isaiah',
  },
  {
    id: 'news-002',
    title: '"God Healed My Marriage" — The Johnsons\' Story',
    category: 'testimony',
    date: '2025-02-14',
    duration: '12:15',
    isVideo: true,
  },
  {
    id: 'news-003',
    title: 'Community Outreach Feed 300+ Families on Skid Row',
    category: 'outreach',
    date: '2025-02-10',
    isVideo: false,
  },
  {
    id: 'news-004',
    title: 'Worship Team — "Great Is Thy Faithfulness" (Live)',
    category: 'worship',
    date: '2025-02-09',
    duration: '6:34',
    isVideo: true,
  },
  {
    id: 'news-005',
    title: 'Easter Volunteer Registration Now Open',
    category: 'announcement',
    date: '2025-02-18',
    isVideo: false,
  },
  {
    id: 'news-006',
    title: 'Catalyst Youth Night Recap — 120 Teens Show Up!',
    category: 'ministry_highlight',
    date: '2025-02-15',
    isVideo: false,
  },
  {
    id: 'news-007',
    title: 'Planted by Living Water — Full Sermon',
    category: 'sermon',
    date: '2025-02-09',
    duration: '52:10',
    isVideo: true,
    speaker: 'Pastor Isaiah',
  },
  {
    id: 'news-008',
    title: 'From Addiction to Anointing — Brother Kevin\'s Testimony',
    category: 'testimony',
    date: '2025-02-05',
    duration: '9:45',
    isVideo: true,
  },
];

// =============================================================================
// MINISTRIES
// =============================================================================

export type MinistryCategory = 'worship' | 'youth' | 'fellowship' | 'outreach' | 'service';

export const MINISTRY_CATEGORY_LABELS: Record<MinistryCategory, string> = {
  worship: 'Worship',
  youth: 'Youth',
  fellowship: 'Fellowship',
  outreach: 'Outreach',
  service: 'Service',
};

export interface Ministry {
  id: string;
  name: string;
  icon: string;
  mission: string;
  leader: string;
  volunteers: number;
  meetingDay?: string;
  meetingTime?: string;
  status: 'active' | 'seasonal' | 'launching';
  category: MinistryCategory;
  color: string;
}

export const CHURCH_MINISTRIES: Ministry[] = [
  {
    id: 'min-001',
    name: 'Catalyst',
    icon: 'flame.fill',
    mission: 'Teens On the Road to Christ\'s Harvest — igniting the next generation through worship, mentorship, and biblical identity.',
    leader: 'Minister Brianna Carter',
    volunteers: 18,
    meetingDay: 'Friday',
    meetingTime: '6:30 PM',
    status: 'active',
    category: 'youth',
    color: '#F59E0B',
  },
  {
    id: 'min-002',
    name: 'KaNeXT Kids',
    icon: 'heart.circle.fill',
    mission: 'Nurturing children ages 3-12 in the love and knowledge of Jesus through creative Bible teaching and worship.',
    leader: 'Sister Angela Davis',
    volunteers: 24,
    meetingDay: 'Sunday',
    meetingTime: '9:30 AM',
    status: 'active',
    category: 'youth',
    color: '#1D9BF0',
  },
  {
    id: 'min-003',
    name: 'Ignite Youth',
    icon: 'sparkles',
    mission: 'Young adults (18-30) pursuing God with passion — tackling real-world faith, career, and relationships.',
    leader: 'Minister Terrence Jackson',
    volunteers: 12,
    meetingDay: 'Tuesday',
    meetingTime: '7:30 PM',
    status: 'active',
    category: 'youth',
    color: '#EF4444',
  },
  {
    id: 'min-004',
    name: 'Rooted',
    icon: 'leaf.fill',
    mission: 'New member orientation and discipleship pathway — helping newcomers find their place in the body of Christ.',
    leader: 'Elder Claudia Monroe',
    volunteers: 8,
    meetingDay: 'Sunday',
    meetingTime: '1:00 PM',
    status: 'active',
    category: 'fellowship',
    color: '#22C55E',
  },
  {
    id: 'min-005',
    name: 'Connect Groups',
    icon: 'person.3.fill',
    mission: 'Small-group fellowship in homes across LA — building community beyond Sunday through shared study and prayer.',
    leader: 'Deacon Lawrence Price',
    volunteers: 30,
    meetingDay: 'Various',
    meetingTime: 'Various',
    status: 'active',
    category: 'fellowship',
    color: '#1D9BF0',
  },
  {
    id: 'min-006',
    name: 'Worship Team',
    icon: 'music.note.list',
    mission: 'Leading the congregation into God\'s presence through anointed worship, song, and creative arts.',
    leader: 'Minister Jasmine Okafor',
    volunteers: 35,
    meetingDay: 'Thursday',
    meetingTime: '7:00 PM',
    status: 'active',
    category: 'worship',
    color: '#1D9BF0',
  },
  {
    id: 'min-007',
    name: 'Single & Purposeful',
    icon: 'star.fill',
    mission: 'Empowering single believers to thrive in purpose, purity, and community while serving the Kingdom.',
    leader: 'Minister Desiree Hamilton',
    volunteers: 10,
    meetingDay: 'First Friday',
    meetingTime: '6:30 PM',
    status: 'active',
    category: 'fellowship',
    color: '#F59E0B',
  },
  {
    id: 'min-008',
    name: 'Community Outreach',
    icon: 'hand.raised.fill',
    mission: 'Boots-on-the-ground outreach — feeding the homeless, clothing drives, and neighborhood evangelism across Los Angeles.',
    leader: 'Deacon Raymond Shaw',
    volunteers: 42,
    meetingDay: 'Second Saturday',
    meetingTime: '8:00 AM',
    status: 'active',
    category: 'outreach',
    color: '#1D9BF0',
  },
  {
    id: 'min-009',
    name: 'Morning Prayer Line',
    icon: 'hands.sparkles.fill',
    mission: 'Corporate and intercessory prayer ministry — standing in the gap for the church, the city, and the nations.',
    leader: 'Mother Estelle Jacobs',
    volunteers: 15,
    meetingDay: 'Tue & Fri',
    meetingTime: '6:00 AM',
    status: 'active',
    category: 'service',
    color: '#1D9BF0',
  },
  {
    id: 'min-010',
    name: 'Kingdom Builders',
    icon: 'building.2.fill',
    mission: 'Leadership development and stewardship training — equipping saints for works of service and organizational excellence.',
    leader: 'Elder Marcus Williams',
    volunteers: 20,
    meetingDay: 'First Saturday',
    meetingTime: '9:00 AM',
    status: 'active',
    category: 'service',
    color: '#1D9BF0',
  },
];

// =============================================================================
// LEADERS
// =============================================================================

export interface ChurchLeader {
  id: string;
  name: string;
  title: string;
  ministries: string[];
  bio: string;
  yearsServing: number;
  email?: string;
  status: 'active' | 'on_leave' | 'visiting';
}

export const CHURCH_LEADERS: ChurchLeader[] = [
  {
    id: 'ldr-001',
    name: 'Pastor Isaiah Carter',
    title: 'Senior Pastor',
    ministries: ['Kingdom Builders', 'Rooted'],
    bio: 'Founder and senior pastor of KaNeXT Church for over 18 years. A prophetic voice in the city, Pastor Isaiah is known for bold, uncompromising preaching and a deep love for the community.',
    yearsServing: 18,
    email: 'pastor.isaiah@kanextchurch.org',
    status: 'active',
  },
  {
    id: 'ldr-002',
    name: 'Lady Monique Carter',
    title: 'Co-Pastor',
    ministries: ['Single & Purposeful', 'Connect Groups'],
    bio: 'Co-pastor and co-founder of KaNeXT Church. Lady Monique oversees women\'s initiatives and counseling ministry, bringing warmth and wisdom to every area she touches.',
    yearsServing: 18,
    email: 'lady.monique@kanextchurch.org',
    status: 'active',
  },
  {
    id: 'ldr-003',
    name: 'Elder Marcus Williams',
    title: 'Executive Elder',
    ministries: ['Kingdom Builders'],
    bio: 'Leads church administration and leadership development. A retired business executive who brings strategic vision to the House.',
    yearsServing: 14,
    email: 'elder.marcus@kanextchurch.org',
    status: 'active',
  },
  {
    id: 'ldr-004',
    name: 'Elder Claudia Monroe',
    title: 'Elder of Assimilation',
    ministries: ['Rooted', 'Connect Groups'],
    bio: 'Shepherds new believers and members through the discipleship pipeline, ensuring no one falls through the cracks.',
    yearsServing: 11,
    email: 'elder.claudia@kanextchurch.org',
    status: 'active',
  },
  {
    id: 'ldr-005',
    name: 'Minister Terrence Jackson',
    title: 'Young Adults Pastor',
    ministries: ['Ignite Youth'],
    bio: 'Dynamic preacher and mentor to the 18-30 demographic. A graduate of Fuller Theological Seminary with a heart for culture and theology.',
    yearsServing: 6,
    email: 'minister.terrence@kanextchurch.org',
    status: 'active',
  },
  {
    id: 'ldr-006',
    name: 'Minister Brianna Carter',
    title: 'Youth Pastor',
    ministries: ['Catalyst'],
    bio: 'Pastor Isaiah\'s daughter, called to youth ministry from a young age. Leads with energy, authenticity, and deep compassion for teens.',
    yearsServing: 4,
    email: 'minister.brianna@kanextchurch.org',
    status: 'active',
  },
  {
    id: 'ldr-007',
    name: 'Minister Jasmine Okafor',
    title: 'Worship Director',
    ministries: ['Worship Team'],
    bio: 'Berklee-trained musician and worship leader. Under her direction, Worship Team has grown from 12 to 35 members with a full band.',
    yearsServing: 7,
    email: 'minister.jasmine@kanextchurch.org',
    status: 'active',
  },
  {
    id: 'ldr-008',
    name: 'Deacon Raymond Shaw',
    title: 'Outreach Director',
    ministries: ['Community Outreach'],
    bio: 'Vietnam-era veteran and lifelong servant. Coordinates all community outreach, from Skid Row to South Central.',
    yearsServing: 16,
    email: 'deacon.raymond@kanextchurch.org',
    status: 'active',
  },
  {
    id: 'ldr-009',
    name: 'Mother Estelle Jacobs',
    title: 'Prayer Ministry Director',
    ministries: ['Morning Prayer Line'],
    bio: 'The spiritual anchor of KaNeXT Church. Mother Estelle has been a prayer warrior for 40+ years and leads the intercessory team with authority and grace.',
    yearsServing: 15,
    email: 'mother.estelle@kanextchurch.org',
    status: 'active',
  },
  {
    id: 'ldr-010',
    name: 'Deacon Lawrence Price',
    title: 'Small Groups Coordinator',
    ministries: ['Connect Groups'],
    bio: 'Former high school principal who now pours into small-group leadership development. Oversees 6 active Connect Groups across LA.',
    yearsServing: 9,
    email: 'deacon.lawrence@kanextchurch.org',
    status: 'active',
  },
];

// =============================================================================
// MINISTRY SCHEDULE
// =============================================================================

export interface ScheduleSlot {
  id: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  time: string;
  ministry: string;
  location: string;
  color: string;
}

export const MINISTRY_SCHEDULE: ScheduleSlot[] = [
  { id: 'sch-001', day: 'Sun', time: '9:30 AM', ministry: 'Sunday Worship', location: 'Main Sanctuary', color: '#1D9BF0' },
  { id: 'sch-002', day: 'Sun', time: '9:30 AM', ministry: 'KaNeXT Kids', location: 'Children\'s Wing', color: '#1D9BF0' },
  { id: 'sch-003', day: 'Sun', time: '1:00 PM', ministry: 'Rooted (Bi-weekly)', location: 'Conference Room B', color: '#22C55E' },
  { id: 'sch-004', day: 'Tue', time: '6:00 AM', ministry: 'Morning Prayer Line', location: 'Prayer Chapel', color: '#1D9BF0' },
  { id: 'sch-005', day: 'Tue', time: '7:30 PM', ministry: 'Ignite Youth', location: 'Fellowship Hall', color: '#EF4444' },
  { id: 'sch-006', day: 'Wed', time: '7:00 PM', ministry: 'Midweek Bible Study', location: 'Fellowship Hall', color: '#1D9BF0' },
  { id: 'sch-007', day: 'Thu', time: '7:00 PM', ministry: 'Worship Team Rehearsal', location: 'Main Sanctuary', color: '#1D9BF0' },
  { id: 'sch-008', day: 'Fri', time: '6:00 AM', ministry: 'Morning Prayer Line', location: 'Prayer Chapel', color: '#1D9BF0' },
  { id: 'sch-009', day: 'Fri', time: '6:30 PM', ministry: 'Catalyst Youth Night', location: 'Youth Center', color: '#F59E0B' },
  { id: 'sch-010', day: 'Sat', time: '8:00 AM', ministry: 'Community Outreach (2nd Sat)', location: 'Offsite', color: '#1D9BF0' },
  { id: 'sch-011', day: 'Sat', time: '9:00 AM', ministry: 'Kingdom Builders (1st Sat)', location: 'Conference Room A', color: '#1D9BF0' },
  { id: 'sch-012', day: 'Fri', time: '6:30 PM', ministry: 'Single & Purposeful (1st Fri)', location: 'Fellowship Hall', color: '#F59E0B' },
];

// =============================================================================
// PIPELINE (CRM)
// =============================================================================

export type ChurchPipelineStage = 'first_time' | 'returning' | 'connected' | 'serving' | 'member' | 'leader';

export interface PipelinePerson {
  id: string;
  name: string;
  stage: ChurchPipelineStage;
  lastVisit: string;
  nextStep?: string;
  assignedTo?: string;
  notes?: string;
}

export const PIPELINE_STAGES: { key: ChurchPipelineStage; label: string; color: string; count: number }[] = [
  { key: 'first_time', label: 'First-Time', color: '#A1A1AA', count: 12 },
  { key: 'returning', label: 'Returning', color: '#F59E0B', count: 8 },
  { key: 'connected', label: 'Connected', color: '#1D9BF0', count: 15 },
  { key: 'serving', label: 'Serving', color: '#1D9BF0', count: 22 },
  { key: 'member', label: 'Member', color: '#22C55E', count: 180 },
  { key: 'leader', label: 'Leader', color: '#EF4444', count: 28 },
];

export const PIPELINE_PEOPLE: PipelinePerson[] = [
  // ── First-Time ──
  {
    id: 'pp-001',
    name: 'Jordan Mitchell',
    stage: 'first_time',
    lastVisit: '2025-02-16',
    nextStep: 'Welcome call',
    assignedTo: 'Elder Claudia Monroe',
    notes: 'Came with a friend. Interested in young adult ministry.',
  },
  {
    id: 'pp-002',
    name: 'Aisha Coleman',
    stage: 'first_time',
    lastVisit: '2025-02-16',
    nextStep: 'Send welcome packet',
    assignedTo: 'Deacon Lawrence Price',
    notes: 'Single mother of two. Asked about children\'s ministry.',
  },
  {
    id: 'pp-003',
    name: 'Darnell Washington',
    stage: 'first_time',
    lastVisit: '2025-02-09',
    nextStep: 'Follow-up text',
    assignedTo: 'Minister Terrence Jackson',
    notes: 'College student at UCLA. Found us through Instagram.',
  },
  // ── Returning ──
  {
    id: 'pp-004',
    name: 'Keisha Brown',
    stage: 'returning',
    lastVisit: '2025-02-16',
    nextStep: 'Invite to Connect Group',
    assignedTo: 'Deacon Lawrence Price',
    notes: 'Third visit. Very engaged during worship. Lives in Inglewood.',
  },
  {
    id: 'pp-005',
    name: 'Marcus Reed',
    stage: 'returning',
    lastVisit: '2025-02-16',
    nextStep: 'Rooted class invitation',
    assignedTo: 'Elder Claudia Monroe',
    notes: 'Attending with wife. Both interested in membership.',
  },
  {
    id: 'pp-006',
    name: 'Tamika Jefferson',
    stage: 'returning',
    lastVisit: '2025-02-09',
    nextStep: 'Coffee with a deacon',
    assignedTo: 'Deacon Lawrence Price',
    notes: 'Moved from Atlanta. Looking for a church home.',
  },
  // ── Connected ──
  {
    id: 'pp-007',
    name: 'DeAndre Harris',
    stage: 'connected',
    lastVisit: '2025-02-16',
    nextStep: 'Ministry interest form',
    assignedTo: 'Minister Terrence Jackson',
    notes: 'Completed Rooted. Joined Ignite Youth. Considering the media team.',
  },
  {
    id: 'pp-008',
    name: 'Shaniqua Patterson',
    stage: 'connected',
    lastVisit: '2025-02-16',
    nextStep: 'Volunteer orientation',
    assignedTo: 'Sister Angela Davis',
    notes: 'In a Connect Group. Wants to serve in KaNeXT Kids.',
  },
  {
    id: 'pp-009',
    name: 'Rodney Franklin',
    stage: 'connected',
    lastVisit: '2025-02-09',
    nextStep: 'Men\'s group introduction',
    assignedTo: 'Elder Marcus Williams',
    notes: 'Attending Wednesday Bible Study regularly. Works nights so misses some Sundays.',
  },
  // ── Serving ──
  {
    id: 'pp-010',
    name: 'Crystal Odom',
    stage: 'serving',
    lastVisit: '2025-02-16',
    nextStep: 'Leadership track interest',
    assignedTo: 'Minister Jasmine Okafor',
    notes: 'Sings on the worship team. Faithful and anointed. Ready for section lead.',
  },
  {
    id: 'pp-011',
    name: 'Jamal Richardson',
    stage: 'serving',
    lastVisit: '2025-02-16',
    nextStep: 'Deacon training inquiry',
    assignedTo: 'Elder Marcus Williams',
    notes: 'Harvesters volunteer for 2 years. Strong servant heart. Employer match donor.',
  },
  {
    id: 'pp-012',
    name: 'Latoya Simmons',
    stage: 'serving',
    lastVisit: '2025-02-16',
    nextStep: 'Small group leader training',
    assignedTo: 'Deacon Lawrence Price',
    notes: 'Hosts a Connect Group in Carson. Consistent and growing in leadership.',
  },
  // ── Member ──
  {
    id: 'pp-013',
    name: 'Charles & Denise Wright',
    stage: 'member',
    lastVisit: '2025-02-16',
    notes: 'Founding members. Faithful givers. Serve on hospitality team.',
  },
  {
    id: 'pp-014',
    name: 'Veronica Banks',
    stage: 'member',
    lastVisit: '2025-02-16',
    notes: 'Member since 2019. Active in prayer ministry and women\'s conference planning.',
  },
  {
    id: 'pp-015',
    name: 'Anthony Greene',
    stage: 'member',
    lastVisit: '2025-02-09',
    notes: 'Member since 2021. Serves on AV/production team. Works in IT professionally.',
  },
  // ── Leader ──
  {
    id: 'pp-016',
    name: 'Deacon Jerome Allen',
    stage: 'leader',
    lastVisit: '2025-02-16',
    notes: 'Ordained deacon. Oversees facility management and special events logistics.',
  },
  {
    id: 'pp-017',
    name: 'Minister Desiree Hamilton',
    stage: 'leader',
    lastVisit: '2025-02-16',
    notes: 'Licensed minister. Leads Single & Purposeful. Pursuing ordination.',
  },
  {
    id: 'pp-018',
    name: 'Sister Angela Davis',
    stage: 'leader',
    lastVisit: '2025-02-16',
    notes: 'Children\'s ministry director for 10 years. Certified child development specialist.',
  },
];

// =============================================================================
// CONNECT GROUPS
// =============================================================================

export interface ConnectGroup {
  id: string;
  name: string;
  leader: string;
  day: string;
  time: string;
  location: string;
  members: number;
  capacity: number;
  category: 'young_adults' | 'married' | 'men' | 'women' | 'mixed' | 'seniors';
  status: 'open' | 'full' | 'forming';
}

export const CONNECT_GROUPS: ConnectGroup[] = [
  {
    id: 'cg-001',
    name: 'The Well',
    leader: 'Minister Terrence Jackson',
    day: 'Tuesday',
    time: '7:30 PM',
    location: 'Mid-Wilshire (Terrence\'s Home)',
    members: 14,
    capacity: 18,
    category: 'young_adults',
    status: 'open',
  },
  {
    id: 'cg-002',
    name: 'Covenant Couples',
    leader: 'Charles & Denise Wright',
    day: 'Friday',
    time: '7:00 PM',
    location: 'View Park (Wright Home)',
    members: 10,
    capacity: 12,
    category: 'married',
    status: 'open',
  },
  {
    id: 'cg-003',
    name: 'Iron Sharpens Iron',
    leader: 'Deacon Jerome Allen',
    day: 'Saturday',
    time: '8:00 AM',
    location: 'Leimert Park Coffee House',
    members: 8,
    capacity: 12,
    category: 'men',
    status: 'open',
  },
  {
    id: 'cg-004',
    name: 'Daughters of Destiny',
    leader: 'Veronica Banks',
    day: 'Thursday',
    time: '7:00 PM',
    location: 'Inglewood (Banks Home)',
    members: 12,
    capacity: 15,
    category: 'women',
    status: 'open',
  },
  {
    id: 'cg-005',
    name: 'The Living Room',
    leader: 'Latoya Simmons',
    day: 'Wednesday',
    time: '7:00 PM',
    location: 'Carson (Simmons Home)',
    members: 11,
    capacity: 14,
    category: 'mixed',
    status: 'open',
  },
  {
    id: 'cg-006',
    name: 'Golden Vessels',
    leader: 'Mother Estelle Jacobs',
    day: 'Wednesday',
    time: '11:00 AM',
    location: 'Church Fellowship Hall',
    members: 9,
    capacity: 15,
    category: 'seniors',
    status: 'open',
  },
];

// =============================================================================
// VISITORS
// =============================================================================

export interface RecentVisitor {
  id: string;
  name: string;
  visitDate: string;
  howHeard: 'social_media' | 'friend' | 'website' | 'walk_in' | 'event' | 'other';
  followUpStatus: 'pending' | 'contacted' | 'scheduled' | 'completed';
  assignedTo?: string;
  notes?: string;
  interests?: string[];
}

export const RECENT_VISITORS: RecentVisitor[] = [
  {
    id: 'vis-001',
    name: 'Jordan Mitchell',
    visitDate: '2025-02-16',
    howHeard: 'friend',
    followUpStatus: 'contacted',
    assignedTo: 'Elder Claudia Monroe',
    notes: 'Came with college friend. Excited about worship.',
    interests: ['Ignite Youth', 'Worship'],
  },
  {
    id: 'vis-002',
    name: 'Aisha Coleman',
    visitDate: '2025-02-16',
    howHeard: 'social_media',
    followUpStatus: 'pending',
    assignedTo: 'Deacon Lawrence Price',
    notes: 'Single mom, two kids ages 5 and 8. Needs childcare info.',
    interests: ['KaNeXT Kids', 'Single & Purposeful'],
  },
  {
    id: 'vis-003',
    name: 'Darnell Washington',
    visitDate: '2025-02-09',
    howHeard: 'social_media',
    followUpStatus: 'contacted',
    assignedTo: 'Minister Terrence Jackson',
    notes: 'UCLA sophomore. Found us on IG reels.',
    interests: ['Ignite Youth', 'Connect Groups'],
  },
  {
    id: 'vis-004',
    name: 'Patricia & Harold Green',
    visitDate: '2025-02-09',
    howHeard: 'website',
    followUpStatus: 'scheduled',
    assignedTo: 'Elder Claudia Monroe',
    notes: 'Retired couple. Relocated from Houston. Meeting for coffee Tuesday.',
    interests: ['Golden Vessels', 'Community Outreach'],
  },
  {
    id: 'vis-005',
    name: 'Malik Johnson',
    visitDate: '2025-02-02',
    howHeard: 'walk_in',
    followUpStatus: 'completed',
    assignedTo: 'Minister Terrence Jackson',
    notes: 'Walked in during midweek service. Gave his life to Christ that night.',
    interests: ['Rooted', 'Ignite Youth'],
  },
  {
    id: 'vis-006',
    name: 'Tiffany Brooks',
    visitDate: '2025-02-02',
    howHeard: 'event',
    followUpStatus: 'contacted',
    assignedTo: 'Minister Desiree Hamilton',
    notes: 'Attended the Harvesters outreach, came to church the next Sunday.',
    interests: ['Community Outreach', 'Connect Groups'],
  },
  {
    id: 'vis-007',
    name: 'Robert & Nia Osei',
    visitDate: '2025-01-26',
    howHeard: 'friend',
    followUpStatus: 'completed',
    assignedTo: 'Deacon Lawrence Price',
    notes: 'Ghanaian couple, referred by the Wrights. Already enrolled in Rooted.',
    interests: ['Rooted', 'Covenant Couples'],
  },
  {
    id: 'vis-008',
    name: 'Jasper Williams III',
    visitDate: '2025-01-26',
    howHeard: 'other',
    followUpStatus: 'pending',
    assignedTo: 'Elder Marcus Williams',
    notes: 'Business owner. Heard Pastor Isaiah on a podcast. Interested in Kingdom Builders.',
    interests: ['Kingdom Builders'],
  },
];

// =============================================================================
// DASHBOARD
// =============================================================================

export interface ChurchHeroData {
  title: string;
  subtitle: string;
  speaker?: string;
  seriesName?: string;
  isLive: boolean;
}

export interface ChurchCommerceCard {
  id: string;
  title: string;
  icon: string;
  color: string;
}

export const CHURCH_HERO: ChurchHeroData = {
  title: 'The Unshakeable Foundation',
  subtitle: 'Pastor Isaiah · Faith That Moves Mountains Series',
  speaker: 'Pastor Isaiah',
  seriesName: 'Faith That Moves Mountains',
  isLive: false,
};

export const CHURCH_COMMERCE: ChurchCommerceCard[] = [
  { id: 'give', title: 'Give', icon: 'heart.fill', color: '#EF4444' },
  { id: 'watch', title: 'Watch Sermons', icon: 'play.rectangle.fill', color: '#1D9BF0' },
  { id: 'prayer', title: 'Prayer Request', icon: 'hands.sparkles.fill', color: '#1D9BF0' },
];

// =============================================================================
// PIPELINE STAGE COLORS
// =============================================================================

export const PIPELINE_STAGE_COLORS: Record<ChurchPipelineStage, string> = {
  first_time: '#A1A1AA',
  returning: '#F59E0B',
  connected: '#1D9BF0',
  serving: '#1D9BF0',
  member: '#22C55E',
  leader: '#EF4444',
};

// =============================================================================
// MINISTRY HEALTH SUMMARY (Dashboard block)
// =============================================================================

export interface MinistryHealthEntry {
  name: string;
  leader: string;
  members: number;
  trend: string;
  trendDir: 'up' | 'flat' | 'down';
}

export interface MinistryFlagged {
  name: string;
  alert: string;
}

export interface MinistryHealthSummary {
  activeCount: number;
  top3: MinistryHealthEntry[];
  flagged: MinistryFlagged[];
}

export const MINISTRY_HEALTH_SUMMARY: MinistryHealthSummary = {
  activeCount: 10,
  top3: [
    { name: 'Catalyst', leader: 'Minister Brianna Carter', members: 47, trend: '+12%', trendDir: 'up' },
    { name: 'Community Outreach', leader: 'Deacon Raymond Shaw', members: 31, trend: '0%', trendDir: 'flat' },
    { name: 'Worship Team', leader: 'Minister Jasmine Okafor', members: 35, trend: '+5%', trendDir: 'up' },
  ],
  flagged: [
    { name: 'Kingdom Builders', alert: 'Leader vacancy — Elder Marcus stepping down Q2' },
    { name: 'KaNeXT Kids', alert: 'Below 50% volunteer fill (12 of 24 slots)' },
  ],
};

// =============================================================================
// GROWTH DASHBOARD (2×2 grid)
// =============================================================================

export interface GrowthDashboardMetric {
  label: string;
  value: string;
  detail: string;
  status: 'green' | 'amber' | 'red';
}

export const GROWTH_DASHBOARD: GrowthDashboardMetric[] = [
  { label: 'Weekly Attendance', value: '342', detail: '+8% vs last month', status: 'green' },
  { label: 'New Visitors', value: '23', detail: '35% returned', status: 'green' },
  { label: 'Active Members', value: '487', detail: '+12 this quarter', status: 'green' },
  { label: 'Monthly Giving', value: '$47,200', detail: '94% of budget', status: 'amber' },
];

// =============================================================================
// SERMON SERIES + RECENT SERMONS (Sermons Sheet)
// =============================================================================

export interface SermonSeries {
  name: string;
  totalParts: number;
  currentPart: number;
  color: string;
}

export const CURRENT_SERIES: SermonSeries = {
  name: 'Faith That Moves Mountains',
  totalParts: 6,
  currentPart: 4,
  color: '#1D9BF0',
};

export interface SermonEntry {
  id: string;
  title: string;
  speaker: string;
  date: string;
  duration: string;
  seriesName?: string;
}

export const RECENT_SERMONS: SermonEntry[] = [
  { id: 'ser-001', title: 'The Unshakeable Foundation', speaker: 'Pastor Isaiah', date: 'Feb 16', duration: '48:22', seriesName: 'Faith That Moves Mountains' },
  { id: 'ser-002', title: 'Planted by Living Water', speaker: 'Pastor Isaiah', date: 'Feb 9', duration: '52:10', seriesName: 'Faith That Moves Mountains' },
  { id: 'ser-003', title: 'Laying the First Stone', speaker: 'Minister Terrence Jackson', date: 'Feb 2', duration: '44:15', seriesName: 'Faith That Moves Mountains' },
  { id: 'ser-004', title: 'The God Who Provides', speaker: 'Pastor Isaiah', date: 'Jan 26', duration: '50:30', seriesName: 'Faith That Moves Mountains' },
  { id: 'ser-005', title: 'Hebrews 10 — Drawing Near', speaker: 'Elder Marcus Williams', date: 'Feb 19', duration: '38:45' },
  { id: 'ser-006', title: 'Walking in Purpose in Your 20s', speaker: 'Minister Terrence Jackson', date: 'Feb 4', duration: '41:10' },
];

// =============================================================================
// PRAYER REQUESTS (Prayer Sheet)
// =============================================================================

export type PrayerCategory = 'healing' | 'provision' | 'family' | 'guidance' | 'praise' | 'other';

export const PRAYER_CATEGORY_LABELS: Record<PrayerCategory, string> = {
  healing: 'Healing',
  provision: 'Provision',
  family: 'Family',
  guidance: 'Guidance',
  praise: 'Praise Report',
  other: 'Other',
};

export const PRAYER_CATEGORY_COLORS: Record<PrayerCategory, string> = {
  healing: '#EF4444',
  provision: '#1D9BF0',
  family: '#1D9BF0',
  guidance: '#1D9BF0',
  praise: '#1D9BF0',
  other: '#A1A1AA',
};

export interface PrayerRequest {
  id: string;
  name: string;
  anonymous: boolean;
  category: PrayerCategory;
  text: string;
  date: string;
  prayerCount: number;
  isPraise: boolean;
  privacy: 'public' | 'leaders_only' | 'private';
}

export const PRAYER_REQUESTS: PrayerRequest[] = [
  {
    id: 'pr-001',
    name: 'Keisha Brown',
    anonymous: false,
    category: 'healing',
    text: 'Please pray for my mother recovering from hip surgery. She needs strength and comfort.',
    date: '2025-02-18',
    prayerCount: 24,
    isPraise: false,
    privacy: 'public',
  },
  {
    id: 'pr-002',
    name: '',
    anonymous: true,
    category: 'provision',
    text: 'Facing possible layoff at work. Praying for God to open doors and provide for my family.',
    date: '2025-02-17',
    prayerCount: 31,
    isPraise: false,
    privacy: 'public',
  },
  {
    id: 'pr-003',
    name: 'Charles & Denise Wright',
    anonymous: false,
    category: 'praise',
    text: 'God is faithful! Our grandson was accepted to Founders College with a full scholarship. To God be the glory!',
    date: '2025-02-16',
    prayerCount: 42,
    isPraise: true,
    privacy: 'public',
  },
  {
    id: 'pr-004',
    name: 'Veronica Banks',
    anonymous: false,
    category: 'family',
    text: 'Praying for restoration in my sister\'s marriage. They are separated and need God\'s intervention.',
    date: '2025-02-15',
    prayerCount: 18,
    isPraise: false,
    privacy: 'public',
  },
  {
    id: 'pr-005',
    name: 'DeAndre Harris',
    anonymous: false,
    category: 'guidance',
    text: 'Starting a new business venture. Praying for wisdom, favor, and the right connections.',
    date: '2025-02-14',
    prayerCount: 15,
    isPraise: false,
    privacy: 'public',
  },
  {
    id: 'pr-006',
    name: 'Crystal Odom',
    anonymous: false,
    category: 'praise',
    text: 'My biopsy came back clear! After months of prayer, God answered. Thank you church family for standing with me.',
    date: '2025-02-13',
    prayerCount: 56,
    isPraise: true,
    privacy: 'public',
  },
];
