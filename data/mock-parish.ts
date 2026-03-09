/**
 * Mock data for Parish screen — church mode.
 * 3 pages: Services, Sermons, Care.
 * Pattern follows data/mock-office.ts / data/mock-campus.ts.
 */

// ── Page 0: Services ──

export type ServiceStatus = 'planning' | 'ready' | 'completed';
export type ServiceType = 'sunday-morning' | 'wednesday-night' | 'special-event' | 'holiday';
export type ServiceFilter = 'all' | 'upcoming' | 'completed';

export interface ServiceItem {
  id: string;
  date: string;
  time: string;
  serviceType: ServiceType;
  typeLabel: string;
  location: string;
  status: ServiceStatus;
  isNext: boolean;
}

export interface NextServiceInfo {
  date: string;
  time: string;
  location: string;
  countdown: string;
}

// ── Page 1: Sermons ──

export type SermonFilter = 'all' | 'current-series' | 'past-series' | 'standalone' | 'guest';

export interface SermonSeries {
  id: string;
  title: string;
  currentWeek: number;
  totalWeeks: number;
  artwork: string;
}

export interface SermonItem {
  id: string;
  title: string;
  datePreached: string;
  seriesName: string | null;
  speakerName: string;
  speakerInitials: string;
  scriptureRef: string;
  duration: string;
  isGuest: boolean;
}

// ── Page 2: Care ──

export type CareSection = 'prayer' | 'visits' | 'milestones' | 'follow-up' | 'discipleship';

export type PrayerStatus = 'active' | 'answered' | 'ongoing';

export interface PrayerRequest {
  id: string;
  memberName: string;
  memberInitials: string;
  requestText: string;
  dateSubmitted: string;
  status: PrayerStatus;
  urgent: boolean;
}

export type VisitLocation = 'home' | 'hospital' | 'office' | 'other';

export interface VisitEntry {
  id: string;
  memberName: string;
  memberInitials: string;
  date: string;
  location: VisitLocation;
  reason: string;
  hasFollowUp: boolean;
}

export type MilestoneType = 'baptism' | 'salvation' | 'dedication' | 'marriage' | 'membership';

export interface MilestoneEntry {
  id: string;
  memberName: string;
  memberInitials: string;
  type: MilestoneType;
  date: string;
}

export type FollowUpStage = 'first-visit' | 'contacted' | 'second-visit' | 'connected' | 'member';

export interface FollowUpEntry {
  id: string;
  name: string;
  initials: string;
  dateVisited: string;
  stage: FollowUpStage;
  assignedTo: string;
}

export type DiscipleshipStage = 'new-believer' | 'foundations' | 'small-group' | 'serving' | 'leading';

export interface DiscipleshipEntry {
  id: string;
  memberName: string;
  memberInitials: string;
  stage: DiscipleshipStage;
  classesCompleted: number;
  mentorName: string | null;
}

// ── Mock Data ──

export const NEXT_SERVICE: NextServiceInfo = {
  date: 'Sunday, March 15',
  time: '10:00 AM',
  location: 'Main Sanctuary',
  countdown: '5 days away',
};

export const SERVICES: ServiceItem[] = [
  { id: 'sv1', date: 'Sun, Mar 15', time: '10:00 AM', serviceType: 'sunday-morning', typeLabel: 'Sunday Morning', location: 'Main Sanctuary', status: 'planning', isNext: true },
  { id: 'sv2', date: 'Wed, Mar 18', time: '7:00 PM', serviceType: 'wednesday-night', typeLabel: 'Wednesday Night', location: 'Fellowship Hall', status: 'planning', isNext: false },
  { id: 'sv3', date: 'Sun, Mar 22', time: '10:00 AM', serviceType: 'sunday-morning', typeLabel: 'Sunday Morning', location: 'Main Sanctuary', status: 'planning', isNext: false },
  { id: 'sv4', date: 'Sun, Mar 8', time: '10:00 AM', serviceType: 'sunday-morning', typeLabel: 'Sunday Morning', location: 'Main Sanctuary', status: 'completed', isNext: false },
  { id: 'sv5', date: 'Wed, Mar 5', time: '7:00 PM', serviceType: 'wednesday-night', typeLabel: 'Wednesday Night', location: 'Fellowship Hall', status: 'completed', isNext: false },
  { id: 'sv6', date: 'Sun, Mar 1', time: '10:00 AM', serviceType: 'sunday-morning', typeLabel: 'Sunday Morning', location: 'Main Sanctuary', status: 'completed', isNext: false },
  { id: 'sv7', date: 'Sun, Feb 23', time: '10:00 AM', serviceType: 'sunday-morning', typeLabel: 'Sunday Morning', location: 'Main Sanctuary', status: 'completed', isNext: false },
  { id: 'sv8', date: 'Wed, Feb 19', time: '7:00 PM', serviceType: 'wednesday-night', typeLabel: 'Wednesday Night', location: 'Fellowship Hall', status: 'completed', isNext: false },
  { id: 'sv9', date: 'Sun, Feb 16', time: '10:00 AM', serviceType: 'sunday-morning', typeLabel: 'Sunday Morning', location: 'Main Sanctuary', status: 'completed', isNext: false },
  { id: 'sv10', date: 'Fri, Apr 18', time: '7:00 PM', serviceType: 'holiday', typeLabel: 'Good Friday', location: 'Main Sanctuary', status: 'planning', isNext: false },
];

export const CURRENT_SERIES: SermonSeries = {
  id: 'ss1',
  title: 'The Book of James',
  currentWeek: 4,
  totalWeeks: 8,
  artwork: '#6366F1',
};

export const SERMONS: SermonItem[] = [
  { id: 'sm1', title: 'Faith and Works', datePreached: 'Mar 8', seriesName: 'The Book of James', speakerName: 'Pastor David Mitchell', speakerInitials: 'DM', scriptureRef: 'James 2:14-26', duration: '38 min', isGuest: false },
  { id: 'sm2', title: 'Taming the Tongue', datePreached: 'Mar 1', seriesName: 'The Book of James', speakerName: 'Pastor David Mitchell', speakerInitials: 'DM', scriptureRef: 'James 3:1-12', duration: '42 min', isGuest: false },
  { id: 'sm3', title: 'Wisdom from Above', datePreached: 'Feb 23', seriesName: 'The Book of James', speakerName: 'Pastor David Mitchell', speakerInitials: 'DM', scriptureRef: 'James 3:13-18', duration: '35 min', isGuest: false },
  { id: 'sm4', title: 'Patience in Suffering', datePreached: 'Feb 16', seriesName: 'The Book of James', speakerName: 'Pastor David Mitchell', speakerInitials: 'DM', scriptureRef: 'James 5:7-12', duration: '40 min', isGuest: false },
  { id: 'sm5', title: 'The Power of Prayer', datePreached: 'Feb 9', seriesName: null, speakerName: 'Pastor David Mitchell', speakerInitials: 'DM', scriptureRef: '1 Thess 5:16-18', duration: '36 min', isGuest: false },
  { id: 'sm6', title: 'Walking by Faith', datePreached: 'Feb 2', seriesName: 'The Book of James', speakerName: 'Pastor David Mitchell', speakerInitials: 'DM', scriptureRef: 'James 1:2-8', duration: '44 min', isGuest: false },
  { id: 'sm7', title: 'Love Your Neighbor', datePreached: 'Jan 26', seriesName: null, speakerName: 'Rev. Sarah Thompson', speakerInitials: 'ST', scriptureRef: 'Luke 10:25-37', duration: '32 min', isGuest: true },
  { id: 'sm8', title: 'New Year, New Heart', datePreached: 'Jan 5', seriesName: null, speakerName: 'Pastor David Mitchell', speakerInitials: 'DM', scriptureRef: 'Ezekiel 36:26', duration: '38 min', isGuest: false },
  { id: 'sm9', title: 'Christmas Joy', datePreached: 'Dec 25', seriesName: 'Advent: The Promise', speakerName: 'Pastor David Mitchell', speakerInitials: 'DM', scriptureRef: 'Luke 2:10-14', duration: '30 min', isGuest: false },
  { id: 'sm10', title: 'The Light of the World', datePreached: 'Dec 18', seriesName: 'Advent: The Promise', speakerName: 'Rev. Marcus Williams', speakerInitials: 'MW', scriptureRef: 'John 1:1-14', duration: '35 min', isGuest: true },
];

export const PRAYER_REQUESTS: PrayerRequest[] = [
  { id: 'pr1', memberName: 'Linda Martinez', memberInitials: 'LM', requestText: "Please pray for my mother's surgery on Tuesday. She's having a hip replacement.", dateSubmitted: 'Mar 7', status: 'active', urgent: false },
  { id: 'pr2', memberName: 'James Wilson', memberInitials: 'JW', requestText: 'Praying for a job opportunity. Been searching for 3 months.', dateSubmitted: 'Mar 5', status: 'active', urgent: false },
  { id: 'pr3', memberName: 'Ruth Anderson', memberInitials: 'RA', requestText: 'My husband was just diagnosed with cancer. We need strength.', dateSubmitted: 'Mar 6', status: 'active', urgent: true },
  { id: 'pr4', memberName: 'David Chen', memberInitials: 'DC', requestText: "Thank God — my wife's biopsy came back clear!", dateSubmitted: 'Mar 3', status: 'answered', urgent: false },
  { id: 'pr5', memberName: 'Sarah Thompson', memberInitials: 'ST', requestText: 'Please pray for our marriage. Going through a difficult season.', dateSubmitted: 'Feb 28', status: 'ongoing', urgent: false },
  { id: 'pr6', memberName: 'Michael Brown', memberInitials: 'MB', requestText: "Pray for my son's deployment overseas.", dateSubmitted: 'Feb 25', status: 'ongoing', urgent: false },
];

export const VISITS: VisitEntry[] = [
  { id: 'vi1', memberName: 'Eleanor Hughes', memberInitials: 'EH', date: 'Mar 7', location: 'hospital', reason: 'Post-surgery check-in', hasFollowUp: true },
  { id: 'vi2', memberName: 'Robert Davis', memberInitials: 'RD', date: 'Mar 5', location: 'home', reason: 'Homebound communion visit', hasFollowUp: false },
  { id: 'vi3', memberName: 'Patricia Young', memberInitials: 'PY', date: 'Mar 3', location: 'office', reason: 'Pre-marriage counseling', hasFollowUp: true },
  { id: 'vi4', memberName: 'William Clark', memberInitials: 'WC', date: 'Feb 28', location: 'hospital', reason: 'Cancer treatment support', hasFollowUp: true },
  { id: 'vi5', memberName: 'Dorothy Lee', memberInitials: 'DL', date: 'Feb 25', location: 'home', reason: 'Bereavement visit', hasFollowUp: true },
];

export const MILESTONES: MilestoneEntry[] = [
  { id: 'ms1', memberName: 'Marcus Johnson', memberInitials: 'MJ', type: 'baptism', date: 'Mar 8' },
  { id: 'ms2', memberName: 'Ashley & Tyler Brooks', memberInitials: 'AB', type: 'marriage', date: 'Feb 22' },
  { id: 'ms3', memberName: 'Jennifer Kim', memberInitials: 'JK', type: 'membership', date: 'Mar 1' },
  { id: 'ms4', memberName: 'The Rivera Family', memberInitials: 'RF', type: 'dedication', date: 'Feb 15' },
  { id: 'ms5', memberName: 'Devon Carter', memberInitials: 'DC', type: 'salvation', date: 'Feb 9' },
  { id: 'ms6', memberName: 'Crystal Washington', memberInitials: 'CW', type: 'membership', date: 'Jan 26' },
];

export const FOLLOW_UPS: FollowUpEntry[] = [
  { id: 'fu1', name: 'Ryan & Emma Scott', initials: 'RS', dateVisited: 'Mar 8', stage: 'first-visit', assignedTo: 'Deacon Sarah' },
  { id: 'fu2', name: 'Jessica Martinez', initials: 'JM', dateVisited: 'Mar 1', stage: 'contacted', assignedTo: 'Pastor David' },
  { id: 'fu3', name: 'Andre Williams', initials: 'AW', dateVisited: 'Feb 16', stage: 'second-visit', assignedTo: 'Deacon Mark' },
  { id: 'fu4', name: 'Tanya Brooks', initials: 'TB', dateVisited: 'Feb 2', stage: 'connected', assignedTo: 'Deacon Sarah' },
  { id: 'fu5', name: 'Kevin Park', initials: 'KP', dateVisited: 'Jan 12', stage: 'member', assignedTo: 'Pastor David' },
];

export const DISCIPLESHIP: DiscipleshipEntry[] = [
  { id: 'ds1', memberName: 'Marcus Johnson', memberInitials: 'MJ', stage: 'new-believer', classesCompleted: 0, mentorName: 'Deacon Mark' },
  { id: 'ds2', memberName: 'Crystal Washington', memberInitials: 'CW', stage: 'foundations', classesCompleted: 2, mentorName: 'Sister Grace' },
  { id: 'ds3', memberName: 'Devon Carter', memberInitials: 'DC', stage: 'small-group', classesCompleted: 4, mentorName: null },
  { id: 'ds4', memberName: 'Jennifer Kim', memberInitials: 'JK', stage: 'serving', classesCompleted: 6, mentorName: null },
  { id: 'ds5', memberName: 'Andre Williams', memberInitials: 'AW', stage: 'foundations', classesCompleted: 1, mentorName: 'Deacon Sarah' },
];

// ── Helpers ──

export function getServices(filter?: ServiceFilter): ServiceItem[] {
  if (!filter || filter === 'all') return SERVICES;
  if (filter === 'upcoming') return SERVICES.filter((s) => s.status === 'planning');
  if (filter === 'completed') return SERVICES.filter((s) => s.status === 'completed');
  return SERVICES;
}

export function getSermons(filter?: SermonFilter): SermonItem[] {
  if (!filter || filter === 'all') return SERMONS;
  if (filter === 'current-series') return SERMONS.filter((s) => s.seriesName === CURRENT_SERIES.title);
  if (filter === 'past-series') return SERMONS.filter((s) => s.seriesName !== null && s.seriesName !== CURRENT_SERIES.title);
  if (filter === 'standalone') return SERMONS.filter((s) => s.seriesName === null);
  if (filter === 'guest') return SERMONS.filter((s) => s.isGuest);
  return SERMONS;
}
