/**
 * Competition Organization People Tab — mock data, types, and constants.
 * 10-tab People Hub: Dashboard, Staff, Officials, Volunteers, Entrant Rosters,
 * Credentials, Assignments, Communications, Reports, Settings.
 */

// =============================================================================
// TAB TYPES & CONSTANTS
// =============================================================================

export type CompPeopleTabId =
  | 'dashboard'
  | 'staff'
  | 'officials'
  | 'volunteers'
  | 'entrant-rosters'
  | 'credentials'
  | 'assignments'
  | 'communications'
  | 'reports'
  | 'settings';

export const COMP_PEOPLE_TABS: { id: CompPeopleTabId; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'square.grid.2x2' },
  { id: 'staff', label: 'Staff', icon: 'person.2' },
  { id: 'officials', label: 'Officials', icon: 'shield.checkered' },
  { id: 'volunteers', label: 'Volunteers', icon: 'hand.raised' },
  { id: 'entrant-rosters', label: 'Entrant Rosters', icon: 'list.bullet.rectangle' },
  { id: 'credentials', label: 'Credentials', icon: 'person.badge.key' },
  { id: 'assignments', label: 'Assignments', icon: 'calendar.badge.clock' },
  { id: 'communications', label: 'Communications', icon: 'envelope' },
  { id: 'reports', label: 'Reports', icon: 'chart.bar.fill' },
  { id: 'settings', label: 'Settings', icon: 'gearshape' },
];

export const COMP_PEOPLE_SCOPE_CHIPS = [
  'All People',
  'Staff',
  'Officials',
  'Volunteers',
  'Entrant Personnel',
];

// =============================================================================
// DATA INTERFACES
// =============================================================================

export interface PeopleDashboardBlock {
  id: string;
  label: string;
  value: string;
  delta: string;
  icon: string;
  color: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: 'active' | 'on-leave' | 'inactive';
  avatar: string;
  hireDate: string;
}

export interface Official {
  id: string;
  name: string;
  certification: string;
  level: 'national' | 'regional' | 'local';
  sport: string;
  matchesOfficiated: number;
  rating: number;
  status: 'active' | 'suspended' | 'retired';
}

export interface Volunteer {
  id: string;
  name: string;
  role: string;
  hours: number;
  events: number;
  status: 'active' | 'pending' | 'inactive';
  skills: string[];
}

export interface EntrantRoster {
  id: string;
  entrantName: string;
  playerCount: number;
  coachCount: number;
  staffCount: number;
  lastUpdated: string;
}

export interface Credential {
  id: string;
  person: string;
  type: 'badge' | 'pass' | 'certification' | 'license';
  status: 'active' | 'expired' | 'pending' | 'revoked';
  issueDate: string;
  expiryDate: string;
}

export interface Assignment {
  id: string;
  person: string;
  role: string;
  event: string;
  date: string;
  status: 'confirmed' | 'pending' | 'declined';
}

export interface Communication {
  id: string;
  subject: string;
  recipients: number;
  sentDate: string;
  type: 'email' | 'sms' | 'push' | 'in-app';
  status: 'sent' | 'draft' | 'failed';
}

export interface PeopleReport {
  id: string;
  name: string;
  type: string;
  generatedDate: string;
  format: 'PDF' | 'CSV' | 'XLSX';
}

export interface PeopleSettingToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

// =============================================================================
// STATUS COLORS
// =============================================================================

export const STAFF_STATUS_COLOR: Record<StaffMember['status'], string> = {
  active: '#22C55E',
  'on-leave': '#F59E0B',
  inactive: '#A1A1AA',
};

export const OFFICIAL_STATUS_COLOR: Record<Official['status'], string> = {
  active: '#22C55E',
  suspended: '#EF4444',
  retired: '#A1A1AA',
};

export const VOLUNTEER_STATUS_COLOR: Record<Volunteer['status'], string> = {
  active: '#22C55E',
  pending: '#F59E0B',
  inactive: '#A1A1AA',
};

export const CREDENTIAL_STATUS_COLOR: Record<Credential['status'], string> = {
  active: '#22C55E',
  expired: '#EF4444',
  pending: '#F59E0B',
  revoked: '#A1A1AA',
};

export const ASSIGNMENT_STATUS_COLOR: Record<Assignment['status'], string> = {
  confirmed: '#22C55E',
  pending: '#F59E0B',
  declined: '#EF4444',
};

export const COMM_STATUS_COLOR: Record<Communication['status'], string> = {
  sent: '#22C55E',
  draft: '#F59E0B',
  failed: '#EF4444',
};

export const COMM_TYPE_COLOR: Record<Communication['type'], string> = {
  email: '#1D9BF0',
  sms: '#22C55E',
  push: '#F59E0B',
  'in-app': '#1D9BF0',
};

export const CREDENTIAL_TYPE_COLOR: Record<Credential['type'], string> = {
  badge: '#1D9BF0',
  pass: '#22C55E',
  certification: '#F59E0B',
  license: '#1D9BF0',
};

export const REPORT_FORMAT_COLOR: Record<PeopleReport['format'], string> = {
  PDF: '#EF4444',
  CSV: '#22C55E',
  XLSX: '#1D9BF0',
};

export const OFFICIAL_LEVEL_COLOR: Record<Official['level'], string> = {
  national: '#1D9BF0',
  regional: '#F59E0B',
  local: '#A1A1AA',
};

// =============================================================================
// MOCK DATA
// =============================================================================

export function getCompPeopleData(scope: string) {
  return {
    dashboard: DASHBOARD_BLOCKS,
    staff: STAFF_MEMBERS,
    officials: OFFICIALS,
    volunteers: VOLUNTEERS,
    entrantRosters: ENTRANT_ROSTERS,
    credentials: CREDENTIALS,
    assignments: ASSIGNMENTS,
    communications: COMMUNICATIONS,
    reports: REPORTS,
    settings: SETTINGS_TOGGLES,
  };
}

// === Dashboard ===

const DASHBOARD_BLOCKS: PeopleDashboardBlock[] = [
  {
    id: 'db-1',
    label: 'Total Personnel',
    value: '347',
    delta: '+12 this week',
    icon: 'person.3',
    color: '#1D9BF0',
  },
  {
    id: 'db-2',
    label: 'Active Officials',
    value: '42',
    delta: '+3 certified',
    icon: 'shield.checkered',
    color: '#22C55E',
  },
  {
    id: 'db-3',
    label: 'Event Coverage',
    value: '94%',
    delta: '+2% vs last month',
    icon: 'chart.line.uptrend.xyaxis',
    color: '#F59E0B',
  },
  {
    id: 'db-4',
    label: 'Credential Compliance',
    value: '97%',
    delta: '8 expiring soon',
    icon: 'checkmark.shield',
    color: '#1D9BF0',
  },
  {
    id: 'db-5',
    label: 'Active Volunteers',
    value: '86',
    delta: '+14 new signups',
    icon: 'hand.raised',
    color: '#22C55E',
  },
  {
    id: 'db-6',
    label: 'Open Assignments',
    value: '23',
    delta: '5 need confirmation',
    icon: 'calendar.badge.clock',
    color: '#EF4444',
  },
];

// === Staff ===

const STAFF_MEMBERS: StaffMember[] = [
  { id: 'st-1', name: 'Alex Morgan', role: 'Commissioner', department: 'Executive', email: 'sammy@3ssb.com', phone: '(555) 100-0001', status: 'active', avatar: 'SK', hireDate: '2021-01-15' },
  { id: 'st-2', name: 'Tom Bradley', role: 'Tournament Director', department: 'Operations', email: 'tom.bradley@3ssb.com', phone: '(555) 100-0002', status: 'active', avatar: 'TB', hireDate: '2021-03-22' },
  { id: 'st-3', name: 'Rachel Kim', role: 'Deputy Commissioner', department: 'Executive', email: 'rachel.kim@3ssb.com', phone: '(555) 100-0003', status: 'active', avatar: 'RK', hireDate: '2021-06-10' },
  { id: 'st-4', name: 'David Chen', role: 'Director of Officiating', department: 'Officiating', email: 'david.chen@3ssb.com', phone: '(555) 100-0004', status: 'active', avatar: 'DC', hireDate: '2022-01-08' },
  { id: 'st-5', name: 'Angela Torres', role: 'Credentials Manager', department: 'Operations', email: 'angela.torres@3ssb.com', phone: '(555) 100-0005', status: 'active', avatar: 'AT', hireDate: '2022-04-15' },
  { id: 'st-6', name: 'Brian Mitchell', role: 'Volunteer Coordinator', department: 'Community', email: 'brian.mitchell@3ssb.com', phone: '(555) 100-0006', status: 'active', avatar: 'BM', hireDate: '2022-08-01' },
  { id: 'st-7', name: 'Linda Nguyen', role: 'Communications Director', department: 'Communications', email: 'linda.nguyen@3ssb.com', phone: '(555) 100-0007', status: 'active', avatar: 'LN', hireDate: '2022-09-12' },
  { id: 'st-8', name: 'James Wright', role: 'Facility Manager', department: 'Operations', email: 'james.wright@3ssb.com', phone: '(555) 100-0008', status: 'active', avatar: 'JW', hireDate: '2023-01-20' },
  { id: 'st-9', name: 'Sandra Lopez', role: 'Finance Officer', department: 'Finance', email: 'sandra.lopez@3ssb.com', phone: '(555) 100-0009', status: 'active', avatar: 'SL', hireDate: '2023-03-05' },
  { id: 'st-10', name: 'Michael Brown', role: 'Safety Director', department: 'Compliance', email: 'michael.brown@3ssb.com', phone: '(555) 100-0010', status: 'active', avatar: 'MB', hireDate: '2023-06-18' },
  { id: 'st-11', name: 'Karen Davis', role: 'IT Coordinator', department: 'Technology', email: 'karen.davis@3ssb.com', phone: '(555) 100-0011', status: 'on-leave', avatar: 'KD', hireDate: '2023-09-01' },
  { id: 'st-12', name: 'Robert Garcia', role: 'Media Relations', department: 'Communications', email: 'robert.garcia@3ssb.com', phone: '(555) 100-0012', status: 'active', avatar: 'RG', hireDate: '2023-11-10' },
  { id: 'st-13', name: 'Patricia Wilson', role: 'Scheduling Coordinator', department: 'Operations', email: 'patricia.wilson@3ssb.com', phone: '(555) 100-0013', status: 'active', avatar: 'PW', hireDate: '2024-01-15' },
  { id: 'st-14', name: 'Chris Anderson', role: 'Logistics Manager', department: 'Operations', email: 'chris.anderson@3ssb.com', phone: '(555) 100-0014', status: 'inactive', avatar: 'CA', hireDate: '2022-05-20' },
  { id: 'st-15', name: 'Natalie Reed', role: 'Event Services Lead', department: 'Operations', email: 'natalie.reed@3ssb.com', phone: '(555) 100-0015', status: 'active', avatar: 'NR', hireDate: '2024-04-01' },
];

// === Officials ===

const OFFICIALS: Official[] = [
  { id: 'of-1', name: 'Marcus Johnson', certification: 'IAABO Board 19', level: 'national', sport: 'Basketball', matchesOfficiated: 482, rating: 4.8, status: 'active' },
  { id: 'of-2', name: 'Teresa Williams', certification: 'NCAA D1 Certified', level: 'national', sport: 'Basketball', matchesOfficiated: 356, rating: 4.6, status: 'active' },
  { id: 'of-3', name: 'Richard Evans', certification: 'NFHS Official', level: 'regional', sport: 'Basketball', matchesOfficiated: 215, rating: 4.3, status: 'active' },
  { id: 'of-4', name: 'Denise Carter', certification: 'USSF Grade 5', level: 'regional', sport: 'Soccer', matchesOfficiated: 178, rating: 4.5, status: 'active' },
  { id: 'of-5', name: 'Steve Robinson', certification: 'USAV Certified', level: 'regional', sport: 'Volleyball', matchesOfficiated: 124, rating: 4.2, status: 'active' },
  { id: 'of-6', name: 'Monica Harris', certification: 'USA Track & Field', level: 'national', sport: 'Track & Field', matchesOfficiated: 298, rating: 4.7, status: 'active' },
  { id: 'of-7', name: 'Kevin Turner', certification: 'NAIA Official', level: 'regional', sport: 'Basketball', matchesOfficiated: 142, rating: 4.0, status: 'active' },
  { id: 'of-8', name: 'Sandra Phillips', certification: 'NFHS Official', level: 'local', sport: 'Softball', matchesOfficiated: 88, rating: 3.9, status: 'active' },
  { id: 'of-9', name: 'Douglas Green', certification: 'NCAA D2 Certified', level: 'regional', sport: 'Football', matchesOfficiated: 267, rating: 4.4, status: 'active' },
  { id: 'of-10', name: 'Janet Hall', certification: 'USA Swimming', level: 'national', sport: 'Swimming', matchesOfficiated: 312, rating: 4.9, status: 'active' },
  { id: 'of-11', name: 'Walter King', certification: 'IAABO Board 12', level: 'local', sport: 'Basketball', matchesOfficiated: 67, rating: 3.7, status: 'suspended' },
  { id: 'of-12', name: 'Brenda Scott', certification: 'USTA Certified', level: 'regional', sport: 'Tennis', matchesOfficiated: 156, rating: 4.1, status: 'active' },
  { id: 'of-13', name: 'Harold Adams', certification: 'NFHS Official', level: 'local', sport: 'Baseball', matchesOfficiated: 203, rating: 4.3, status: 'retired' },
  { id: 'of-14', name: 'Pamela Nelson', certification: 'NCAA D1 Certified', level: 'national', sport: 'Volleyball', matchesOfficiated: 389, rating: 4.8, status: 'active' },
  { id: 'of-15', name: 'George Campbell', certification: 'USSF Grade 3', level: 'national', sport: 'Soccer', matchesOfficiated: 421, rating: 4.6, status: 'active' },
];

// === Volunteers ===

const VOLUNTEERS: Volunteer[] = [
  { id: 'vo-1', name: 'Alicia Ramirez', role: 'Event Setup Lead', hours: 124, events: 18, status: 'active', skills: ['logistics', 'leadership', 'first-aid'] },
  { id: 'vo-2', name: 'Jason Park', role: 'Scorekeeper', hours: 96, events: 32, status: 'active', skills: ['stats', 'basketball', 'timekeeping'] },
  { id: 'vo-3', name: 'Emily Foster', role: 'Registration Desk', hours: 82, events: 24, status: 'active', skills: ['customer-service', 'data-entry'] },
  { id: 'vo-4', name: 'Derek Washington', role: 'Security Volunteer', hours: 68, events: 14, status: 'active', skills: ['crowd-management', 'communication'] },
  { id: 'vo-5', name: 'Megan O\'Brien', role: 'First Aid Station', hours: 104, events: 22, status: 'active', skills: ['first-aid', 'CPR', 'nursing'] },
  { id: 'vo-6', name: 'Tyler Hernandez', role: 'Photography', hours: 56, events: 12, status: 'active', skills: ['photography', 'social-media'] },
  { id: 'vo-7', name: 'Sophia Chang', role: 'Concessions', hours: 44, events: 10, status: 'active', skills: ['food-service', 'cash-handling'] },
  { id: 'vo-8', name: 'Nathan Brooks', role: 'Parking Attendant', hours: 38, events: 8, status: 'pending', skills: ['traffic-direction'] },
  { id: 'vo-9', name: 'Olivia Martin', role: 'Announcer', hours: 72, events: 16, status: 'active', skills: ['public-speaking', 'sports-knowledge'] },
  { id: 'vo-10', name: 'Ethan Rivera', role: 'Tech Support', hours: 60, events: 14, status: 'active', skills: ['AV-systems', 'troubleshooting'] },
  { id: 'vo-11', name: 'Aisha Patel', role: 'Team Liaison', hours: 88, events: 20, status: 'active', skills: ['communication', 'multilingual', 'hospitality'] },
  { id: 'vo-12', name: 'Connor Murphy', role: 'Field Maintenance', hours: 46, events: 9, status: 'inactive', skills: ['groundskeeping', 'equipment'] },
  { id: 'vo-13', name: 'Lily Tran', role: 'Social Media', hours: 34, events: 7, status: 'pending', skills: ['social-media', 'content-creation'] },
  { id: 'vo-14', name: 'Marcus Bell', role: 'Scoreboard Operator', hours: 78, events: 26, status: 'active', skills: ['scoreboard-systems', 'basketball'] },
  { id: 'vo-15', name: 'Hannah White', role: 'Hospitality', hours: 52, events: 11, status: 'active', skills: ['hospitality', 'food-service', 'event-planning'] },
  { id: 'vo-16', name: 'Jordan Lee', role: 'Athletic Training Aide', hours: 110, events: 28, status: 'active', skills: ['athletic-training', 'first-aid', 'CPR'] },
];

// === Entrant Rosters ===

const ENTRANT_ROSTERS: EntrantRoster[] = [
  { id: 'er-1', entrantName: 'Fort Myers University', playerCount: 15, coachCount: 4, staffCount: 3, lastUpdated: 'Feb 14, 2026' },
  { id: 'er-2', entrantName: 'Gulf Coast State College', playerCount: 14, coachCount: 3, staffCount: 2, lastUpdated: 'Feb 13, 2026' },
  { id: 'er-3', entrantName: 'Southwest MSU-Northern Tech', playerCount: 16, coachCount: 4, staffCount: 3, lastUpdated: 'Feb 12, 2026' },
  { id: 'er-4', entrantName: 'Naples University', playerCount: 13, coachCount: 3, staffCount: 2, lastUpdated: 'Feb 14, 2026' },
  { id: 'er-5', entrantName: 'Cape Coral College', playerCount: 15, coachCount: 3, staffCount: 2, lastUpdated: 'Feb 11, 2026' },
  { id: 'er-6', entrantName: 'Sarasota State', playerCount: 14, coachCount: 4, staffCount: 3, lastUpdated: 'Feb 13, 2026' },
  { id: 'er-7', entrantName: 'Tampa Bay Institute', playerCount: 16, coachCount: 4, staffCount: 4, lastUpdated: 'Feb 10, 2026' },
  { id: 'er-8', entrantName: 'Lakeland University', playerCount: 13, coachCount: 3, staffCount: 2, lastUpdated: 'Feb 14, 2026' },
  { id: 'er-9', entrantName: 'Orlando Tech', playerCount: 15, coachCount: 4, staffCount: 3, lastUpdated: 'Feb 12, 2026' },
  { id: 'er-10', entrantName: 'Palm Beach Atlantic', playerCount: 14, coachCount: 3, staffCount: 3, lastUpdated: 'Feb 11, 2026' },
  { id: 'er-11', entrantName: 'Miami Shores College', playerCount: 15, coachCount: 4, staffCount: 3, lastUpdated: 'Feb 13, 2026' },
  { id: 'er-12', entrantName: 'Daytona State', playerCount: 14, coachCount: 3, staffCount: 2, lastUpdated: 'Feb 10, 2026' },
  { id: 'er-13', entrantName: 'Jacksonville Academy', playerCount: 16, coachCount: 4, staffCount: 3, lastUpdated: 'Feb 14, 2026' },
  { id: 'er-14', entrantName: 'Gainesville University', playerCount: 15, coachCount: 3, staffCount: 2, lastUpdated: 'Feb 12, 2026' },
  { id: 'er-15', entrantName: 'Tallahassee State', playerCount: 14, coachCount: 4, staffCount: 3, lastUpdated: 'Feb 11, 2026' },
];

// === Credentials ===

const CREDENTIALS: Credential[] = [
  { id: 'cr-1', person: 'Marcus Johnson', type: 'certification', status: 'active', issueDate: 'Jan 10, 2025', expiryDate: 'Jan 10, 2027' },
  { id: 'cr-2', person: 'Teresa Williams', type: 'certification', status: 'active', issueDate: 'Mar 5, 2025', expiryDate: 'Mar 5, 2027' },
  { id: 'cr-3', person: 'Tom Bradley', type: 'badge', status: 'active', issueDate: 'Jan 1, 2026', expiryDate: 'Dec 31, 2026' },
  { id: 'cr-4', person: 'Alex Morgan', type: 'badge', status: 'active', issueDate: 'Jan 1, 2026', expiryDate: 'Dec 31, 2026' },
  { id: 'cr-5', person: 'David Chen', type: 'license', status: 'active', issueDate: 'Feb 1, 2025', expiryDate: 'Feb 1, 2027' },
  { id: 'cr-6', person: 'Walter King', type: 'certification', status: 'revoked', issueDate: 'Jun 15, 2024', expiryDate: 'Jun 15, 2026' },
  { id: 'cr-7', person: 'Harold Adams', type: 'certification', status: 'expired', issueDate: 'Apr 1, 2023', expiryDate: 'Apr 1, 2025' },
  { id: 'cr-8', person: 'Alicia Ramirez', type: 'pass', status: 'active', issueDate: 'Feb 1, 2026', expiryDate: 'Aug 1, 2026' },
  { id: 'cr-9', person: 'Angela Torres', type: 'badge', status: 'active', issueDate: 'Jan 1, 2026', expiryDate: 'Dec 31, 2026' },
  { id: 'cr-10', person: 'Rachel Kim', type: 'badge', status: 'active', issueDate: 'Jan 1, 2026', expiryDate: 'Dec 31, 2026' },
  { id: 'cr-11', person: 'Nathan Brooks', type: 'pass', status: 'pending', issueDate: 'Feb 15, 2026', expiryDate: 'Aug 15, 2026' },
  { id: 'cr-12', person: 'Monica Harris', type: 'certification', status: 'active', issueDate: 'Nov 1, 2024', expiryDate: 'Nov 1, 2026' },
  { id: 'cr-13', person: 'Pamela Nelson', type: 'certification', status: 'active', issueDate: 'Sep 1, 2024', expiryDate: 'Sep 1, 2026' },
  { id: 'cr-14', person: 'George Campbell', type: 'license', status: 'active', issueDate: 'Jul 1, 2024', expiryDate: 'Jul 1, 2026' },
  { id: 'cr-15', person: 'Megan O\'Brien', type: 'certification', status: 'active', issueDate: 'Jan 20, 2026', expiryDate: 'Jan 20, 2028' },
  { id: 'cr-16', person: 'Lily Tran', type: 'pass', status: 'pending', issueDate: 'Feb 14, 2026', expiryDate: 'Aug 14, 2026' },
];

// === Assignments ===

const ASSIGNMENTS: Assignment[] = [
  { id: 'as-1', person: 'Marcus Johnson', role: 'Lead Referee', event: 'Conference Championship — MBB', date: 'Mar 8, 2026', status: 'confirmed' },
  { id: 'as-2', person: 'Teresa Williams', role: 'Referee', event: 'Conference Championship — MBB', date: 'Mar 8, 2026', status: 'confirmed' },
  { id: 'as-3', person: 'Richard Evans', role: 'Referee', event: 'Semifinal #1 — MBB', date: 'Mar 6, 2026', status: 'confirmed' },
  { id: 'as-4', person: 'Tom Bradley', role: 'Tournament Director', event: 'Conference Tournament', date: 'Mar 5-8, 2026', status: 'confirmed' },
  { id: 'as-5', person: 'Denise Carter', role: 'Lead Referee', event: 'Soccer Invitational', date: 'Mar 15, 2026', status: 'pending' },
  { id: 'as-6', person: 'Steve Robinson', role: 'Head Official', event: 'Volleyball Classic', date: 'Mar 20, 2026', status: 'pending' },
  { id: 'as-7', person: 'Jason Park', role: 'Scorekeeper', event: 'Conference Championship — MBB', date: 'Mar 8, 2026', status: 'confirmed' },
  { id: 'as-8', person: 'Alicia Ramirez', role: 'Setup Lead', event: 'Conference Tournament', date: 'Mar 4, 2026', status: 'confirmed' },
  { id: 'as-9', person: 'Derek Washington', role: 'Security Lead', event: 'Conference Championship — MBB', date: 'Mar 8, 2026', status: 'confirmed' },
  { id: 'as-10', person: 'Olivia Martin', role: 'PA Announcer', event: 'Conference Tournament', date: 'Mar 5-8, 2026', status: 'confirmed' },
  { id: 'as-11', person: 'Megan O\'Brien', role: 'First Aid Lead', event: 'Conference Tournament', date: 'Mar 5-8, 2026', status: 'confirmed' },
  { id: 'as-12', person: 'Ethan Rivera', role: 'AV Tech', event: 'Conference Championship — MBB', date: 'Mar 8, 2026', status: 'confirmed' },
  { id: 'as-13', person: 'Sandra Phillips', role: 'Umpire', event: 'Softball Showcase', date: 'Mar 22, 2026', status: 'pending' },
  { id: 'as-14', person: 'Kevin Turner', role: 'Referee', event: 'Semifinal #2 — MBB', date: 'Mar 6, 2026', status: 'confirmed' },
  { id: 'as-15', person: 'Douglas Green', role: 'Head Official', event: 'Spring Football Scrimmage', date: 'Apr 5, 2026', status: 'pending' },
  { id: 'as-16', person: 'Janet Hall', role: 'Chief Judge', event: 'Swim & Dive Invitational', date: 'Mar 28, 2026', status: 'declined' },
];

// === Communications ===

const COMMUNICATIONS: Communication[] = [
  { id: 'cm-1', subject: 'Conference Tournament — Official Schedule Released', recipients: 347, sentDate: 'Feb 14, 2026', type: 'email', status: 'sent' },
  { id: 'cm-2', subject: 'Volunteer Shift Assignments — March Events', recipients: 86, sentDate: 'Feb 13, 2026', type: 'email', status: 'sent' },
  { id: 'cm-3', subject: 'Credential Renewal Reminder', recipients: 12, sentDate: 'Feb 12, 2026', type: 'email', status: 'sent' },
  { id: 'cm-4', subject: 'URGENT: Weather Delay — Soccer Invitational', recipients: 156, sentDate: 'Feb 10, 2026', type: 'push', status: 'sent' },
  { id: 'cm-5', subject: 'Officials Meeting — Rule Changes 2026', recipients: 42, sentDate: 'Feb 9, 2026', type: 'email', status: 'sent' },
  { id: 'cm-6', subject: 'New Venue Map — Arena Complex', recipients: 347, sentDate: 'Feb 8, 2026', type: 'in-app', status: 'sent' },
  { id: 'cm-7', subject: 'Entrant Roster Deadline Reminder', recipients: 30, sentDate: 'Feb 7, 2026', type: 'email', status: 'sent' },
  { id: 'cm-8', subject: 'Staff Appreciation Event — Save the Date', recipients: 48, sentDate: 'Feb 6, 2026', type: 'email', status: 'sent' },
  { id: 'cm-9', subject: 'Game Day Protocol Updates', recipients: 124, sentDate: 'Feb 5, 2026', type: 'in-app', status: 'sent' },
  { id: 'cm-10', subject: 'Volunteer Registration Now Open — Spring Season', recipients: 0, sentDate: '', type: 'email', status: 'draft' },
  { id: 'cm-11', subject: 'Parking Instructions — Championship Weekend', recipients: 245, sentDate: 'Feb 14, 2026', type: 'sms', status: 'sent' },
  { id: 'cm-12', subject: 'Post-Event Survey — Winter Classic', recipients: 189, sentDate: 'Feb 3, 2026', type: 'email', status: 'sent' },
  { id: 'cm-13', subject: 'Security Briefing — Conference Tournament', recipients: 28, sentDate: 'Feb 15, 2026', type: 'email', status: 'sent' },
  { id: 'cm-14', subject: 'Official Pay Rate Updates — 2026 Season', recipients: 42, sentDate: 'Feb 1, 2026', type: 'email', status: 'sent' },
  { id: 'cm-15', subject: 'Emergency Contact Update Request', recipients: 347, sentDate: '', type: 'email', status: 'draft' },
  { id: 'cm-16', subject: 'Media Credentials — Championship Weekend', recipients: 35, sentDate: 'Feb 15, 2026', type: 'email', status: 'failed' },
];

// === Reports ===

const REPORTS: PeopleReport[] = [
  { id: 'rp-1', name: 'Staffing Overview — Q1 2026', type: 'Staffing', generatedDate: 'Feb 14, 2026', format: 'PDF' },
  { id: 'rp-2', name: 'Official Ratings Summary', type: 'Performance', generatedDate: 'Feb 12, 2026', format: 'XLSX' },
  { id: 'rp-3', name: 'Volunteer Hours Log — January', type: 'Volunteer', generatedDate: 'Feb 1, 2026', format: 'CSV' },
  { id: 'rp-4', name: 'Credential Compliance Report', type: 'Compliance', generatedDate: 'Feb 10, 2026', format: 'PDF' },
  { id: 'rp-5', name: 'Assignment Coverage Analysis', type: 'Operations', generatedDate: 'Feb 8, 2026', format: 'PDF' },
  { id: 'rp-6', name: 'Entrant Roster Audit', type: 'Compliance', generatedDate: 'Feb 6, 2026', format: 'XLSX' },
  { id: 'rp-7', name: 'Communication Delivery Metrics', type: 'Communications', generatedDate: 'Feb 5, 2026', format: 'PDF' },
  { id: 'rp-8', name: 'Officials Pay Disbursement', type: 'Finance', generatedDate: 'Feb 3, 2026', format: 'CSV' },
  { id: 'rp-9', name: 'Event Staffing Matrix', type: 'Operations', generatedDate: 'Jan 31, 2026', format: 'XLSX' },
  { id: 'rp-10', name: 'Volunteer Satisfaction Survey Results', type: 'Engagement', generatedDate: 'Jan 28, 2026', format: 'PDF' },
  { id: 'rp-11', name: 'Year-over-Year Personnel Growth', type: 'Analytics', generatedDate: 'Jan 25, 2026', format: 'PDF' },
  { id: 'rp-12', name: 'Background Check Status — All Personnel', type: 'Compliance', generatedDate: 'Jan 20, 2026', format: 'CSV' },
];

// === Settings ===

const SETTINGS_TOGGLES: PeopleSettingToggle[] = [
  { id: 'set-1', label: 'Require background checks', description: 'All personnel must pass background screening before credential issuance', enabled: true },
  { id: 'set-2', label: 'Auto-expire credentials', description: 'Automatically revoke credentials past expiry date', enabled: true },
  { id: 'set-3', label: 'Volunteer hour tracking', description: 'Track and log volunteer hours automatically via check-in', enabled: true },
  { id: 'set-4', label: 'Official rating visibility', description: 'Allow officials to see their own performance ratings', enabled: false },
  { id: 'set-5', label: 'Entrant roster lock', description: 'Lock roster changes 48 hours before competition start', enabled: true },
  { id: 'set-6', label: 'Auto-assign officials', description: 'Use rating-based algorithm for official assignments', enabled: false },
  { id: 'set-7', label: 'Communication read receipts', description: 'Track when recipients open communications', enabled: true },
  { id: 'set-8', label: 'Credential photo requirement', description: 'Require photo upload for all badge and pass credentials', enabled: true },
];
