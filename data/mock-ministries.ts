/**
 * Church Ministries v2 — Mock Data
 * Detailed ministry directory with events, teachings, resources, and actions.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface MinistryV2 {
  id: string;
  name: string;
  description: string;
  leader: string;
  leaderInitials: string;
  memberCount: number;
  status: 'active' | 'planning' | 'seasonal';
  meetingDay?: string;
  meetingTime?: string;
  color: string;
}

export interface MinistryV2Event {
  id: string;
  ministryId: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'regular' | 'special' | 'outreach';
}

export interface MinistryTeaching {
  id: string;
  ministryId: string;
  title: string;
  speaker: string;
  date: string;
  duration: string;
  series?: string;
}

export interface MinistryResource {
  id: string;
  ministryId: string;
  title: string;
  type: 'document' | 'video' | 'audio' | 'link';
  date: string;
}

export interface MinistryAction {
  id: string;
  ministryId: string;
  title: string;
  assignee: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
}

// =============================================================================
// MINISTRIES
// =============================================================================

export const MINISTRIES_V2: MinistryV2[] = [
  {
    id: 'min-worship',
    name: 'Worship Ministry',
    description: 'Leading the congregation in Spirit-filled worship through music, song, and creative arts every service.',
    leader: 'Sister Maria Santos',
    leaderInitials: 'MS',
    memberCount: 24,
    status: 'active',
    meetingDay: 'Sundays',
    meetingTime: '8:00 AM',
    color: '#1A1714',
  },
  {
    id: 'min-youth',
    name: 'Youth Ministry',
    description: 'Building the next generation of leaders through fellowship, discipleship, and mentoring for ages 13-25.',
    leader: 'Brother David Nwachukwu',
    leaderInitials: 'DN',
    memberCount: 18,
    status: 'active',
    meetingDay: 'Fridays',
    meetingTime: '6:30 PM',
    color: '#1A1714',
  },
  {
    id: 'min-women',
    name: "Women's Ministry",
    description: 'Empowering women through Bible study, prayer, mentorship, and community outreach.',
    leader: 'Sister Grace Adekunle',
    leaderInitials: 'GA',
    memberCount: 32,
    status: 'active',
    meetingDay: '1st & 3rd Saturdays',
    meetingTime: '10:00 AM',
    color: '#1A1714',
  },
  {
    id: 'min-men',
    name: "Men's Ministry",
    description: 'Equipping men to be Godly leaders in their homes, workplaces, and communities.',
    leader: 'Brother Emmanuel Obi',
    leaderInitials: 'EO',
    memberCount: 20,
    status: 'active',
    meetingDay: '2nd Saturdays',
    meetingTime: '8:00 AM',
    color: '#5A8A6E',
  },
  {
    id: 'min-children',
    name: "Children's Ministry",
    description: 'Engaging and age-appropriate Bible teaching for children ages 2-12 during Sunday services.',
    leader: 'Sister Faith Adebayo',
    leaderInitials: 'FA',
    memberCount: 15,
    status: 'active',
    meetingDay: 'Sundays',
    meetingTime: '10:30 AM',
    color: '#B8943E',
  },
  {
    id: 'min-prayer',
    name: 'Prayer Ministry',
    description: 'Interceding for the church, community, and nations through dedicated prayer gatherings.',
    leader: 'Brother Solomon Igwe',
    leaderInitials: 'SI',
    memberCount: 12,
    status: 'active',
    meetingDay: 'Wednesdays',
    meetingTime: '7:00 PM',
    color: '#B85C5C',
  },
  {
    id: 'min-media',
    name: 'Media Ministry',
    description: 'Managing audio/visual, livestreaming, social media, and creative content for all church services.',
    leader: 'Sister Joy Nnamdi',
    leaderInitials: 'JN',
    memberCount: 8,
    status: 'active',
    meetingDay: 'Sundays',
    meetingTime: '7:30 AM',
    color: '#1A1714',
  },
  {
    id: 'min-missions',
    name: 'Missions & Outreach',
    description: 'Serving the local community and supporting global missions through evangelism and humanitarian efforts.',
    leader: 'Brother Daniel Ekwueme',
    leaderInitials: 'DE',
    memberCount: 10,
    status: 'active',
    meetingDay: 'Monthly (last Saturday)',
    meetingTime: '9:00 AM',
    color: '#1A1714',
  },
];

// =============================================================================
// MINISTRY EVENTS
// =============================================================================

export const MINISTRY_EVENTS: MinistryV2Event[] = [
  {
    id: 'mev-1',
    ministryId: 'min-worship',
    title: 'Worship Team Rehearsal',
    date: '2026-02-21',
    time: '5:00 PM',
    location: 'Main Sanctuary',
    type: 'regular',
  },
  {
    id: 'mev-2',
    ministryId: 'min-youth',
    title: 'Youth Night — Game & Word',
    date: '2026-02-21',
    time: '6:30 PM',
    location: 'Youth Hall',
    type: 'regular',
  },
  {
    id: 'mev-3',
    ministryId: 'min-youth',
    title: 'Youth Retreat Weekend',
    date: '2026-03-14',
    time: '4:00 PM',
    location: 'Mountain View Camp',
    type: 'special',
  },
  {
    id: 'mev-4',
    ministryId: 'min-women',
    title: "Women's Prayer Breakfast",
    date: '2026-03-07',
    time: '10:00 AM',
    location: 'Fellowship Hall',
    type: 'regular',
  },
  {
    id: 'mev-5',
    ministryId: 'min-men',
    title: "Men's Breakfast Fellowship",
    date: '2026-03-14',
    time: '8:00 AM',
    location: 'Conference Room A',
    type: 'regular',
  },
  {
    id: 'mev-6',
    ministryId: 'min-children',
    title: 'Easter Egg Hunt & Program',
    date: '2026-04-05',
    time: '11:00 AM',
    location: 'Church Grounds',
    type: 'special',
  },
  {
    id: 'mev-7',
    ministryId: 'min-prayer',
    title: 'Night of Prayer & Worship',
    date: '2026-02-26',
    time: '7:00 PM',
    location: 'Prayer Chapel',
    type: 'regular',
  },
  {
    id: 'mev-8',
    ministryId: 'min-missions',
    title: 'Community Food Drive',
    date: '2026-03-28',
    time: '9:00 AM',
    location: 'Church Parking Lot',
    type: 'outreach',
  },
  {
    id: 'mev-9',
    ministryId: 'min-media',
    title: 'Livestream Operator Training',
    date: '2026-02-22',
    time: '1:00 PM',
    location: 'Media Booth',
    type: 'regular',
  },
  {
    id: 'mev-10',
    ministryId: 'min-missions',
    title: 'Neighborhood Evangelism Walk',
    date: '2026-04-12',
    time: '10:00 AM',
    location: 'Meet at Church Entrance',
    type: 'outreach',
  },
];

// =============================================================================
// MINISTRY TEACHINGS
// =============================================================================

export const MINISTRY_TEACHINGS: MinistryTeaching[] = [
  {
    id: 'mt-1',
    ministryId: 'min-worship',
    title: 'Worship Leader Foundations',
    speaker: 'Sister Maria Santos',
    date: '2026-02-16',
    duration: '45 min',
    series: 'Heart of Worship',
  },
  {
    id: 'mt-2',
    ministryId: 'min-youth',
    title: 'Identity in Christ',
    speaker: 'Brother David Nwachukwu',
    date: '2026-02-14',
    duration: '30 min',
    series: 'Who Am I?',
  },
  {
    id: 'mt-3',
    ministryId: 'min-women',
    title: 'Esther: For Such a Time as This',
    speaker: 'Sister Grace Adekunle',
    date: '2026-02-01',
    duration: '50 min',
    series: 'Women of the Bible',
  },
  {
    id: 'mt-4',
    ministryId: 'min-men',
    title: 'Leading with Integrity',
    speaker: 'Brother Emmanuel Obi',
    date: '2026-02-08',
    duration: '40 min',
    series: 'Godly Manhood',
  },
  {
    id: 'mt-5',
    ministryId: 'min-children',
    title: 'David and Goliath — Courage',
    speaker: 'Sister Faith Adebayo',
    date: '2026-02-16',
    duration: '20 min',
  },
  {
    id: 'mt-6',
    ministryId: 'min-prayer',
    title: 'Praying the Psalms',
    speaker: 'Brother Solomon Igwe',
    date: '2026-02-12',
    duration: '35 min',
    series: 'Prayer Foundations',
  },
  {
    id: 'mt-7',
    ministryId: 'min-youth',
    title: 'Navigating Social Media as a Believer',
    speaker: 'Pastor Lisa Grant',
    date: '2026-02-07',
    duration: '25 min',
    series: 'Who Am I?',
  },
  {
    id: 'mt-8',
    ministryId: 'min-worship',
    title: 'Vocal Technique & Scripture Meditation',
    speaker: 'Sister Maria Santos',
    date: '2026-02-09',
    duration: '55 min',
    series: 'Heart of Worship',
  },
];

// =============================================================================
// MINISTRY RESOURCES
// =============================================================================

export const MINISTRY_RESOURCES: MinistryResource[] = [
  {
    id: 'mr-1',
    ministryId: 'min-worship',
    title: 'February Worship Set List',
    type: 'document',
    date: '2026-02-01',
  },
  {
    id: 'mr-2',
    ministryId: 'min-worship',
    title: 'Worship Ministry Playlist — Spotify',
    type: 'link',
    date: '2026-01-15',
  },
  {
    id: 'mr-3',
    ministryId: 'min-youth',
    title: 'Youth Small Group Leader Guide',
    type: 'document',
    date: '2026-01-28',
  },
  {
    id: 'mr-4',
    ministryId: 'min-women',
    title: 'Esther Bible Study Workbook',
    type: 'document',
    date: '2026-01-20',
  },
  {
    id: 'mr-5',
    ministryId: 'min-children',
    title: 'Sunday School Curriculum — Q1 2026',
    type: 'document',
    date: '2026-01-05',
  },
  {
    id: 'mr-6',
    ministryId: 'min-prayer',
    title: 'Prayer Journal Template',
    type: 'document',
    date: '2026-01-10',
  },
  {
    id: 'mr-7',
    ministryId: 'min-media',
    title: 'OBS Setup Tutorial',
    type: 'video',
    date: '2026-02-05',
  },
  {
    id: 'mr-8',
    ministryId: 'min-missions',
    title: 'Volunteer Handbook 2026',
    type: 'document',
    date: '2026-01-01',
  },
];

// =============================================================================
// MINISTRY ACTIONS
// =============================================================================

export const MINISTRY_ACTIONS: MinistryAction[] = [
  {
    id: 'ma-1',
    ministryId: 'min-worship',
    title: 'Recruit 2 additional vocalists for Easter',
    assignee: 'Sister Maria Santos',
    dueDate: '2026-03-15',
    status: 'in-progress',
    priority: 'high',
  },
  {
    id: 'ma-2',
    ministryId: 'min-youth',
    title: 'Finalize retreat venue deposit',
    assignee: 'Brother David Nwachukwu',
    dueDate: '2026-02-28',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'ma-3',
    ministryId: 'min-women',
    title: 'Print Esther study guides (40 copies)',
    assignee: 'Sister Grace Adekunle',
    dueDate: '2026-02-20',
    status: 'completed',
    priority: 'medium',
  },
  {
    id: 'ma-4',
    ministryId: 'min-men',
    title: 'Confirm guest speaker for March breakfast',
    assignee: 'Brother Emmanuel Obi',
    dueDate: '2026-03-01',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: 'ma-5',
    ministryId: 'min-children',
    title: 'Order supplies for Easter program',
    assignee: 'Sister Faith Adebayo',
    dueDate: '2026-03-20',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: 'ma-6',
    ministryId: 'min-prayer',
    title: 'Update prayer request submission form',
    assignee: 'Brother Solomon Igwe',
    dueDate: '2026-02-18',
    status: 'in-progress',
    priority: 'low',
  },
  {
    id: 'ma-7',
    ministryId: 'min-media',
    title: 'Upgrade livestream camera (approved budget)',
    assignee: 'Sister Joy Nnamdi',
    dueDate: '2026-03-10',
    status: 'in-progress',
    priority: 'high',
  },
  {
    id: 'ma-8',
    ministryId: 'min-missions',
    title: 'Collect 200 canned goods for food drive',
    assignee: 'Brother Daniel Ekwueme',
    dueDate: '2026-03-25',
    status: 'pending',
    priority: 'medium',
  },
];

// =============================================================================
// HELPERS
// =============================================================================

export function getMinistryV2ById(id: string): MinistryV2 | undefined {
  return MINISTRIES_V2.find((m) => m.id === id);
}

export function getEventsForMinistry(ministryId: string): MinistryV2Event[] {
  return MINISTRY_EVENTS.filter((e) => e.ministryId === ministryId);
}

export function getTeachingsForMinistry(ministryId: string): MinistryTeaching[] {
  return MINISTRY_TEACHINGS.filter((t) => t.ministryId === ministryId);
}

export function getResourcesForMinistry(ministryId: string): MinistryResource[] {
  return MINISTRY_RESOURCES.filter((r) => r.ministryId === ministryId);
}

export function getActionsForMinistry(ministryId: string): MinistryAction[] {
  return MINISTRY_ACTIONS.filter((a) => a.ministryId === ministryId);
}
