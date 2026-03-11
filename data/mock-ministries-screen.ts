/**
 * Mock data for Ministries screen — church mode.
 * 3 pages: Serve, Connect, Management.
 * Pattern follows data/mock-team.ts.
 * Named differently from existing mock-ministries.ts (ministry directory data).
 */

// ── Page 0: Serve ──

export type MinistryCategory = 'worship' | 'children' | 'youth' | 'hospitality' | 'tech' | 'outreach' | 'custom';
export type MinistryFilter = 'all' | MinistryCategory;
export type StaffingStatus = 'fully-staffed' | 'needs-volunteers';

export interface ServeSummary {
  totalMinistries: number;
  totalVolunteers: number;
  upcomingNeeds: number;
}

export interface MinistryItem {
  id: string;
  name: string;
  category: MinistryCategory;
  leaderName: string;
  leaderInitials: string;
  memberCount: number;
  nextServiceDate: string;
  staffingStatus: StaffingStatus;
}

// ── Page 1: Connect ──

export type GroupType = 'life-groups' | 'bible-study' | 'mens' | 'womens' | 'youth' | 'couples' | 'recovery' | 'custom';
export type GroupFilter = 'all' | GroupType;
export type GroupOpenness = 'open' | 'closed';

export interface ConnectSummary {
  totalGroups: number;
  totalGroupMembers: number;
  congregationPercent: number;
}

export interface GroupItem {
  id: string;
  name: string;
  type: GroupType;
  leaderName: string;
  leaderInitials: string;
  memberCount: number;
  capacity: number;
  meetingSchedule: string;
  location: string;
  openness: GroupOpenness;
}

// ── Page 2: Management ──

export type MgmtSection = 'scheduling' | 'training' | 'background' | 'leaders' | 'health';

// Scheduling
export type RsvpStatus = 'confirmed' | 'declined' | 'no-response';

export interface VolunteerAssignment {
  id: string;
  volunteerName: string;
  volunteerInitials: string;
  ministry: string;
  role: string;
  date: string;
  rsvpStatus: RsvpStatus;
}

// Training
export type ChurchTrainingStatus = 'not-started' | 'in-progress' | 'completed' | 'expired';

export interface ChurchTrainingEntry {
  id: string;
  volunteerName: string;
  volunteerInitials: string;
  programName: string;
  status: ChurchTrainingStatus;
  completionPercent: number;
  dueDate: string;
  certification: boolean;
}

// Background
export type BgCheckStatus = 'cleared' | 'pending' | 'expired' | 'not-submitted';

export interface BackgroundCheckEntry {
  id: string;
  volunteerName: string;
  volunteerInitials: string;
  checkStatus: BgCheckStatus;
  lastCheckDate: string | null;
  expirationDate: string | null;
  requiredFor: string;
}

// Leaders
export type PipelineStage = 'serving' | 'identified' | 'mentoring' | 'training' | 'ready' | 'placed';

export interface LeaderPipelineEntry {
  id: string;
  name: string;
  initials: string;
  currentRole: string;
  mentorName: string | null;
  stage: PipelineStage;
  readinessPercent: number;
}

// Health
export interface MinistryHealthEntry {
  id: string;
  ministryName: string;
  volunteerCount: number;
  volunteerTrend: 'up' | 'down' | 'flat';
  attendanceTrend: 'up' | 'down' | 'flat';
  newJoins: number;
  departures: number;
  healthScore: 'healthy' | 'watch' | 'at-risk';
}

// ── Mock Data ──

export const SERVE_SUMMARY: ServeSummary = {
  totalMinistries: 8,
  totalVolunteers: 139,
  upcomingNeeds: 3,
};

export const MINISTRY_ITEMS: MinistryItem[] = [
  { id: 'mi1', name: 'Worship Team',          category: 'worship',     leaderName: 'David Park',     leaderInitials: 'DP', memberCount: 22, nextServiceDate: 'Mar 10', staffingStatus: 'fully-staffed' },
  { id: 'mi2', name: "Children's Ministry",   category: 'children',    leaderName: 'Rachel Adams',   leaderInitials: 'RA', memberCount: 18, nextServiceDate: 'Mar 10', staffingStatus: 'needs-volunteers' },
  { id: 'mi3', name: 'Youth Ministry',        category: 'youth',       leaderName: 'Jason Cole',     leaderInitials: 'JC', memberCount: 15, nextServiceDate: 'Mar 12', staffingStatus: 'fully-staffed' },
  { id: 'mi4', name: 'Hospitality / Greeters', category: 'hospitality', leaderName: 'Maria Santos',  leaderInitials: 'MS', memberCount: 24, nextServiceDate: 'Mar 10', staffingStatus: 'fully-staffed' },
  { id: 'mi5', name: 'Media & Tech',          category: 'tech',        leaderName: 'Kevin Lee',      leaderInitials: 'KL', memberCount: 12, nextServiceDate: 'Mar 10', staffingStatus: 'needs-volunteers' },
  { id: 'mi6', name: 'Ushers',                category: 'hospitality', leaderName: 'Robert James',   leaderInitials: 'RJ', memberCount: 16, nextServiceDate: 'Mar 10', staffingStatus: 'fully-staffed' },
  { id: 'mi7', name: 'Prayer Ministry',       category: 'custom',      leaderName: 'Grace Thompson', leaderInitials: 'GT', memberCount: 14, nextServiceDate: 'Mar 12', staffingStatus: 'fully-staffed' },
  { id: 'mi8', name: 'Outreach & Missions',   category: 'outreach',    leaderName: 'Samuel Wright',  leaderInitials: 'SW', memberCount: 18, nextServiceDate: 'Mar 15', staffingStatus: 'needs-volunteers' },
];

export const CONNECT_SUMMARY: ConnectSummary = {
  totalGroups: 12,
  totalGroupMembers: 96,
  congregationPercent: 32,
};

export const GROUP_ITEMS: GroupItem[] = [
  { id: 'gi1',  name: 'Northside Life Group',     type: 'life-groups',  leaderName: 'Tom & Amy Baker',  leaderInitials: 'TB', memberCount: 10, capacity: 14, meetingSchedule: 'Tuesdays 7pm',   location: 'Baker Home',        openness: 'open' },
  { id: 'gi2',  name: 'Downtown Life Group',      type: 'life-groups',  leaderName: 'Mark Jensen',      leaderInitials: 'MJ', memberCount: 12, capacity: 12, meetingSchedule: 'Wednesdays 7pm', location: 'Church Room 201',    openness: 'closed' },
  { id: 'gi3',  name: 'Gospel of John Study',     type: 'bible-study',  leaderName: 'Pastor Williams',  leaderInitials: 'PW', memberCount: 8,  capacity: 15, meetingSchedule: 'Thursdays 6:30pm', location: 'Fellowship Hall', openness: 'open' },
  { id: 'gi4',  name: 'Psalms Deep Dive',         type: 'bible-study',  leaderName: 'Grace Thompson',   leaderInitials: 'GT', memberCount: 6,  capacity: 12, meetingSchedule: 'Mondays 10am',   location: 'Library',           openness: 'open' },
  { id: 'gi5',  name: "Men's Breakfast Group",    type: 'mens',         leaderName: 'Robert James',     leaderInitials: 'RJ', memberCount: 14, capacity: 20, meetingSchedule: 'Saturdays 7am',  location: "Joe's Diner",       openness: 'open' },
  { id: 'gi6',  name: "Women's Bible Study",      type: 'womens',       leaderName: 'Linda Chen',       leaderInitials: 'LC', memberCount: 11, capacity: 15, meetingSchedule: 'Tuesdays 9:30am', location: 'Church Room 105', openness: 'open' },
  { id: 'gi7',  name: 'Youth Small Group',        type: 'youth',        leaderName: 'Jason Cole',       leaderInitials: 'JC', memberCount: 8,  capacity: 12, meetingSchedule: 'Sundays 6pm',    location: 'Youth Room',        openness: 'open' },
  { id: 'gi8',  name: 'Couples Connect',          type: 'couples',      leaderName: 'Dan & Sarah Lee',  leaderInitials: 'DL', memberCount: 6,  capacity: 8,  meetingSchedule: 'Fridays 7pm',    location: 'Lee Home',          openness: 'closed' },
  { id: 'gi9',  name: 'Celebrate Recovery',        type: 'recovery',     leaderName: 'Michael Ford',     leaderInitials: 'MF', memberCount: 9,  capacity: 20, meetingSchedule: 'Fridays 6:30pm', location: 'Gym',               openness: 'open' },
  { id: 'gi10', name: 'Eastside Life Group',      type: 'life-groups',  leaderName: 'Chris & Jen Park', leaderInitials: 'CP', memberCount: 8,  capacity: 14, meetingSchedule: 'Wednesdays 7pm', location: 'Park Home',         openness: 'open' },
  { id: 'gi11', name: "Young Adults",             type: 'life-groups',  leaderName: 'Kayla Nguyen',     leaderInitials: 'KN', memberCount: 7,  capacity: 15, meetingSchedule: 'Thursdays 7:30pm', location: 'Coffee House',  openness: 'open' },
  { id: 'gi12', name: "Women's Prayer Circle",    type: 'womens',       leaderName: 'Maria Santos',     leaderInitials: 'MS', memberCount: 5,  capacity: 10, meetingSchedule: 'Wednesdays 6am', location: 'Chapel',            openness: 'open' },
];

export const VOLUNTEER_ASSIGNMENTS: VolunteerAssignment[] = [
  { id: 'va1',  volunteerName: 'Amy Baker',       volunteerInitials: 'AB', ministry: 'Worship Team',        role: 'Vocalist',         date: 'Mar 10', rsvpStatus: 'confirmed' },
  { id: 'va2',  volunteerName: 'Kevin Lee',       volunteerInitials: 'KL', ministry: 'Media & Tech',        role: 'Sound Engineer',   date: 'Mar 10', rsvpStatus: 'confirmed' },
  { id: 'va3',  volunteerName: 'Rachel Adams',    volunteerInitials: 'RA', ministry: "Children's Ministry", role: 'Lead Teacher',     date: 'Mar 10', rsvpStatus: 'confirmed' },
  { id: 'va4',  volunteerName: 'Linda Chen',      volunteerInitials: 'LC', ministry: "Children's Ministry", role: 'Assistant',        date: 'Mar 10', rsvpStatus: 'declined' },
  { id: 'va5',  volunteerName: 'Dan Lee',         volunteerInitials: 'DL', ministry: 'Ushers',              role: 'Head Usher',       date: 'Mar 10', rsvpStatus: 'confirmed' },
  { id: 'va6',  volunteerName: 'Sarah Lee',       volunteerInitials: 'SL', ministry: 'Hospitality / Greeters', role: 'Greeter',       date: 'Mar 10', rsvpStatus: 'no-response' },
  { id: 'va7',  volunteerName: 'Michael Ford',    volunteerInitials: 'MF', ministry: 'Prayer Ministry',     role: 'Prayer Leader',    date: 'Mar 12', rsvpStatus: 'confirmed' },
  { id: 'va8',  volunteerName: 'Chris Park',      volunteerInitials: 'CP', ministry: 'Media & Tech',        role: 'Projector Op',     date: 'Mar 10', rsvpStatus: 'no-response' },
  { id: 'va9',  volunteerName: 'Jen Park',        volunteerInitials: 'JP', ministry: 'Hospitality / Greeters', role: 'Greeter',       date: 'Mar 10', rsvpStatus: 'confirmed' },
  { id: 'va10', volunteerName: 'Samuel Wright',   volunteerInitials: 'SW', ministry: 'Outreach & Missions', role: 'Coordinator',      date: 'Mar 15', rsvpStatus: 'confirmed' },
];

export const CHURCH_TRAINING_ENTRIES: ChurchTrainingEntry[] = [
  { id: 'ct1', volunteerName: 'Rachel Adams',  volunteerInitials: 'RA', programName: 'Child Safety Certification',   status: 'completed',   completionPercent: 100, dueDate: 'Feb 28', certification: true },
  { id: 'ct2', volunteerName: 'Linda Chen',    volunteerInitials: 'LC', programName: 'Child Safety Certification',   status: 'in-progress', completionPercent: 60,  dueDate: 'Mar 31', certification: true },
  { id: 'ct3', volunteerName: 'Kevin Lee',     volunteerInitials: 'KL', programName: 'AV Systems Training',          status: 'completed',   completionPercent: 100, dueDate: 'Jan 15', certification: false },
  { id: 'ct4', volunteerName: 'Amy Baker',     volunteerInitials: 'AB', programName: 'First Aid & CPR',              status: 'expired',     completionPercent: 100, dueDate: 'Dec 31', certification: true },
  { id: 'ct5', volunteerName: 'Jason Cole',    volunteerInitials: 'JC', programName: 'Youth Leadership Essentials',  status: 'in-progress', completionPercent: 45,  dueDate: 'Apr 15', certification: false },
  { id: 'ct6', volunteerName: 'Michael Ford',  volunteerInitials: 'MF', programName: 'Pastoral Care Foundations',    status: 'not-started', completionPercent: 0,   dueDate: 'May 1',  certification: false },
  { id: 'ct7', volunteerName: 'Kayla Nguyen',  volunteerInitials: 'KN', programName: 'Small Group Leadership',       status: 'in-progress', completionPercent: 80,  dueDate: 'Mar 20', certification: true },
];

export const BACKGROUND_CHECKS: BackgroundCheckEntry[] = [
  { id: 'bg1', volunteerName: 'Rachel Adams',   volunteerInitials: 'RA', checkStatus: 'cleared',       lastCheckDate: 'Jan 15, 2026', expirationDate: 'Jan 15, 2028', requiredFor: "Children's Ministry" },
  { id: 'bg2', volunteerName: 'Linda Chen',     volunteerInitials: 'LC', checkStatus: 'cleared',       lastCheckDate: 'Nov 1, 2025',  expirationDate: 'Nov 1, 2027',  requiredFor: "Children's Ministry" },
  { id: 'bg3', volunteerName: 'Jason Cole',     volunteerInitials: 'JC', checkStatus: 'cleared',       lastCheckDate: 'Sep 20, 2025', expirationDate: 'Sep 20, 2027', requiredFor: 'Youth Ministry' },
  { id: 'bg4', volunteerName: 'Amy Baker',      volunteerInitials: 'AB', checkStatus: 'expired',       lastCheckDate: 'Mar 1, 2024',  expirationDate: 'Mar 1, 2026',  requiredFor: "Children's Ministry" },
  { id: 'bg5', volunteerName: 'Dan Lee',        volunteerInitials: 'DL', checkStatus: 'pending',       lastCheckDate: null,           expirationDate: null,           requiredFor: 'Transportation' },
  { id: 'bg6', volunteerName: 'Kayla Nguyen',   volunteerInitials: 'KN', checkStatus: 'cleared',       lastCheckDate: 'Feb 10, 2026', expirationDate: 'Feb 10, 2028', requiredFor: 'Youth Ministry' },
  { id: 'bg7', volunteerName: 'Chris Park',     volunteerInitials: 'CP', checkStatus: 'not-submitted', lastCheckDate: null,           expirationDate: null,           requiredFor: "Children's Ministry" },
  { id: 'bg8', volunteerName: 'Samuel Wright',  volunteerInitials: 'SW', checkStatus: 'cleared',       lastCheckDate: 'Dec 5, 2025',  expirationDate: 'Dec 5, 2027',  requiredFor: 'Outreach & Missions' },
];

export const LEADER_PIPELINE: LeaderPipelineEntry[] = [
  { id: 'lp1', name: 'Chris Park',      initials: 'CP', currentRole: 'Tech Volunteer',       mentorName: 'Kevin Lee',      stage: 'serving',    readinessPercent: 15 },
  { id: 'lp2', name: 'Jen Park',        initials: 'JP', currentRole: 'Greeter',              mentorName: null,             stage: 'identified', readinessPercent: 30 },
  { id: 'lp3', name: 'Kayla Nguyen',    initials: 'KN', currentRole: 'Young Adults Leader',  mentorName: 'Mark Jensen',    stage: 'mentoring',  readinessPercent: 55 },
  { id: 'lp4', name: 'Michael Ford',    initials: 'MF', currentRole: 'Recovery Facilitator',  mentorName: 'Pastor Williams', stage: 'training',  readinessPercent: 70 },
  { id: 'lp5', name: 'Dan Lee',         initials: 'DL', currentRole: 'Head Usher',            mentorName: 'Robert James',   stage: 'mentoring',  readinessPercent: 50 },
  { id: 'lp6', name: 'Amy Baker',       initials: 'AB', currentRole: 'Worship Vocalist',      mentorName: 'David Park',     stage: 'training',   readinessPercent: 75 },
  { id: 'lp7', name: 'Samuel Wright',   initials: 'SW', currentRole: 'Outreach Coordinator',  mentorName: null,             stage: 'ready',      readinessPercent: 90 },
  { id: 'lp8', name: 'Grace Thompson',  initials: 'GT', currentRole: 'Prayer Ministry Lead',  mentorName: null,             stage: 'placed',     readinessPercent: 100 },
];

export const MINISTRY_HEALTH: MinistryHealthEntry[] = [
  { id: 'mh1', ministryName: 'Worship Team',          volunteerCount: 22, volunteerTrend: 'up',   attendanceTrend: 'up',   newJoins: 3, departures: 0, healthScore: 'healthy' },
  { id: 'mh2', ministryName: "Children's Ministry",   volunteerCount: 18, volunteerTrend: 'down', attendanceTrend: 'flat', newJoins: 1, departures: 4, healthScore: 'at-risk' },
  { id: 'mh3', ministryName: 'Youth Ministry',        volunteerCount: 15, volunteerTrend: 'flat', attendanceTrend: 'up',   newJoins: 2, departures: 2, healthScore: 'healthy' },
  { id: 'mh4', ministryName: 'Hospitality / Greeters', volunteerCount: 24, volunteerTrend: 'up',  attendanceTrend: 'up',   newJoins: 4, departures: 1, healthScore: 'healthy' },
  { id: 'mh5', ministryName: 'Media & Tech',          volunteerCount: 12, volunteerTrend: 'down', attendanceTrend: 'down', newJoins: 0, departures: 3, healthScore: 'at-risk' },
  { id: 'mh6', ministryName: 'Ushers',                volunteerCount: 16, volunteerTrend: 'flat', attendanceTrend: 'flat', newJoins: 1, departures: 1, healthScore: 'watch' },
  { id: 'mh7', ministryName: 'Prayer Ministry',       volunteerCount: 14, volunteerTrend: 'up',   attendanceTrend: 'up',   newJoins: 3, departures: 0, healthScore: 'healthy' },
  { id: 'mh8', ministryName: 'Outreach & Missions',   volunteerCount: 18, volunteerTrend: 'down', attendanceTrend: 'flat', newJoins: 1, departures: 2, healthScore: 'watch' },
];

// ── Helpers ──

export function getMinistries(filter?: MinistryFilter): MinistryItem[] {
  if (!filter || filter === 'all') return MINISTRY_ITEMS;
  return MINISTRY_ITEMS.filter((m) => m.category === filter);
}

export function getGroups(filter?: GroupFilter): GroupItem[] {
  if (!filter || filter === 'all') return GROUP_ITEMS;
  return GROUP_ITEMS.filter((g) => g.type === filter);
}

export function getLeadersByStage(stage: PipelineStage): LeaderPipelineEntry[] {
  return LEADER_PIPELINE.filter((l) => l.stage === stage);
}
