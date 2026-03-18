/**
 * Mock data for Phone screen — calls, contacts, voicemails.
 * Mode-aware: each call/contact carries a mode badge.
 */

import type { Mode } from '@/types';

// ── Types ──

export type CallDirection = 'incoming' | 'outgoing' | 'missed' | 'video';

export interface RecentCall {
  id: string;
  name: string;
  username: string;
  initials: string;
  mode: Mode;
  direction: CallDirection;
  timestamp: string;
  duration?: string;
  hasVoicemail?: boolean;
}

export interface PhoneContact {
  id: string;
  name: string;
  username: string;
  initials: string;
  org: string;
  role: string;
  mode: Mode;
  isFavorite?: boolean;
  online?: boolean;
}

export interface Voicemail {
  id: string;
  callerName: string;
  callerUsername: string;
  callerInitials: string;
  mode: Mode;
  duration: string;
  timestamp: string;
  transcription: string;
}

export interface PhoneGroup {
  id: string;
  name: string;
  initials: string;
  memberCount: number;
  mode: Mode;
  lastCallTimestamp: string;
}

export interface KanextNumber {
  mode: Mode;
  label: string;
  number: string;
}

// ── Mode colors for badges ──

export const MODE_BADGE_COLORS: Record<Mode, string> = {
  sports: '#3B82F6',
  business: '#8B5CF6',
  community: '#F59E0B',
  education: '#10B981',
  personal: '#A78BFA',
};

export const MODE_BADGE_LABELS: Record<Mode, string> = {
  sports: 'Sports',
  business: 'Business',
  community: 'Community',
  education: 'Education',
  personal: 'Personal',
};

// ── Recent Calls ──

export const RECENT_CALLS: RecentCall[] = [
  { id: 'c1', name: 'Coach Williams', username: '@coachwilliams', initials: 'CW', mode: 'sports', direction: 'outgoing', timestamp: '2:34 PM', duration: '4:21' },
  { id: 'c2', name: 'James Rodriguez', username: '@jrod23', initials: 'JR', mode: 'sports', direction: 'incoming', timestamp: '1:12 PM', duration: '12:05' },
  { id: 'c3', name: 'Sarah Chen', username: '@schen', initials: 'SC', mode: 'business', direction: 'missed', timestamp: '11:45 AM' },
  { id: 'c4', name: 'Pastor Davis', username: '@pastordavis', initials: 'PD', mode: 'community', direction: 'incoming', timestamp: '10:20 AM', duration: '8:33' },
  { id: 'c5', name: 'Marcus Johnson', username: '@mjohnson', initials: 'MJ', mode: 'sports', direction: 'video', timestamp: '9:15 AM', duration: '22:17' },
  { id: 'c6', name: 'Athletic Dept', username: '@athletics', initials: 'AD', mode: 'sports', direction: 'missed', timestamp: 'Yesterday', hasVoicemail: true },
  { id: 'c7', name: 'Lisa Park', username: '@lisapark', initials: 'LP', mode: 'business', direction: 'outgoing', timestamp: 'Yesterday', duration: '3:45' },
  { id: 'c8', name: 'Training Staff', username: '@trainstaff', initials: 'TS', mode: 'sports', direction: 'incoming', timestamp: 'Yesterday', duration: '1:33' },
  { id: 'c9', name: 'Michael Torres', username: '@mtorres', initials: 'MT', mode: 'education', direction: 'missed', timestamp: 'Mar 5' },
  { id: 'c10', name: 'Dr. Kim', username: '@drkim', initials: 'DK', mode: 'sports', direction: 'incoming', timestamp: 'Mar 5', duration: '6:12' },
  { id: 'c11', name: 'Front Office', username: '@frontoffice', initials: 'FO', mode: 'sports', direction: 'outgoing', timestamp: 'Mar 4', duration: '0:45' },
  { id: 'c12', name: 'Rachel Green', username: '@rgreen', initials: 'RG', mode: 'community', direction: 'video', timestamp: 'Mar 4', duration: '15:20' },
  { id: 'c13', name: 'Alex Kim', username: '@akim', initials: 'AK', mode: 'business', direction: 'missed', timestamp: 'Mar 3', hasVoicemail: true },
  { id: 'c14', name: 'Coach Thompson', username: '@cthompson', initials: 'CT', mode: 'sports', direction: 'incoming', timestamp: 'Mar 3', duration: '11:02' },
];

// ── Contacts ──

export const PHONE_CONTACTS: PhoneContact[] = [
  // ── Sports — Lincoln University ──────────────────────────────────────────────
  { id: 'p2',  name: 'Athletic Dept',   username: '@athletics',    initials: 'AD', org: 'Lincoln University', role: 'Department',       mode: 'sports',    online: false },
  { id: 'p3',  name: 'Coach Thompson',  username: '@cthompson',    initials: 'CT', org: 'Lincoln University', role: 'Assistant Coach',   mode: 'sports',    isFavorite: true,  online: true  },
  { id: 'p4',  name: 'Coach Williams',  username: '@coachwilliams',initials: 'CW', org: 'Lincoln University', role: 'Head Coach',        mode: 'sports',    isFavorite: true,  online: true  },
  { id: 'p5',  name: 'Dr. Kim',         username: '@drkim',        initials: 'DK', org: 'Lincoln University', role: 'Team Physician',    mode: 'sports',    online: false },
  { id: 'p6',  name: 'Front Office',    username: '@frontoffice',  initials: 'FO', org: 'Lincoln University', role: 'Administration',    mode: 'sports',    online: true  },
  { id: 'p7',  name: 'James Rodriguez', username: '@jrod23',       initials: 'JR', org: 'Lincoln University', role: 'Player',            mode: 'sports',    isFavorite: true,  online: true  },
  { id: 'p9',  name: 'Marcus Johnson',  username: '@mjohnson',     initials: 'MJ', org: 'Lincoln University', role: 'Player',            mode: 'sports',    online: true  },
  { id: 'p10', name: 'Medical Team',    username: '@medteam',      initials: 'MT', org: 'Lincoln University', role: 'Department',        mode: 'sports',    online: false },
  { id: 'p15', name: 'Training Staff',  username: '@trainstaff',   initials: 'TS', org: 'Lincoln University', role: 'Department',        mode: 'sports',    online: false },

  // ── Education — Lincoln University ──────────────────────────────────────────
  { id: 'p11', name: 'Michael Torres',  username: '@mtorres',      initials: 'MT', org: 'Lincoln University', role: 'Professor',         mode: 'education', online: false },

  // ── Community — ICCLA ────────────────────────────────────────────────────────
  { id: 'p12', name: 'Pastor Davis',    username: '@pastordavis',  initials: 'PD', org: 'ICCLA',             role: 'Senior Pastor',     mode: 'community', online: true  },
  { id: 'p13', name: 'Rachel Green',    username: '@rgreen',       initials: 'RG', org: 'ICCLA',             role: 'Worship Leader',    mode: 'community', online: false },

  // ── Business — KaNeXT (sorted A–Z by last name) ──────────────────────────────
  { id: 'biz01', name: 'Priya Anand',        username: '@panand',      initials: 'PA', org: 'KaNeXT', role: 'Data Analyst',          mode: 'business', online: false },
  { id: 'biz02', name: 'Jordan Anderson',    username: '@janderson',   initials: 'JA', org: 'KaNeXT', role: 'Marketing Manager',     mode: 'business', online: true  },
  { id: 'biz03', name: 'Tyler Barnes',       username: '@tbarnes',     initials: 'TB', org: 'KaNeXT', role: 'Sales Rep',             mode: 'business', online: false },
  { id: 'biz04', name: 'Michelle Bright',    username: '@mbright',     initials: 'MB', org: 'KaNeXT', role: 'HR Manager',            mode: 'business', online: true  },
  { id: 'biz05', name: 'Daniel Brooks',      username: '@dbrooks',     initials: 'DB', org: 'KaNeXT', role: 'Backend Engineer',      mode: 'business', online: true  },
  { id: 'biz06', name: 'Olivia Castro',      username: '@ocastro',     initials: 'OC', org: 'KaNeXT', role: 'Product Designer',      mode: 'business', online: false },
  { id: 'biz07', name: 'Nathan Chen',        username: '@nchen',       initials: 'NC', org: 'KaNeXT', role: 'DevOps Engineer',       mode: 'business', online: true  },
  { id: 'p14',   name: 'Sarah Chen',         username: '@schen',       initials: 'SC', org: 'KaNeXT', role: 'CFO',                   mode: 'business', isFavorite: true,  online: true  },
  { id: 'biz08', name: 'Amanda Clarke',      username: '@aclarke',     initials: 'AC', org: 'KaNeXT', role: 'Account Manager',       mode: 'business', online: false },
  { id: 'biz09', name: 'Kevin Cole',         username: '@kcole',       initials: 'KC', org: 'KaNeXT', role: 'Frontend Engineer',     mode: 'business', online: true  },
  { id: 'biz10', name: 'Rachel Davis',       username: '@rdavis',      initials: 'RD', org: 'KaNeXT', role: 'Content Strategist',    mode: 'business', online: false },
  { id: 'biz11', name: 'Derek Ellis',        username: '@dellis',      initials: 'DE', org: 'KaNeXT', role: 'Sales Director',        mode: 'business', isFavorite: true,  online: true  },
  { id: 'biz12', name: 'Maya Fernandez',     username: '@mfernandez',  initials: 'MF', org: 'KaNeXT', role: 'UX Researcher',         mode: 'business', online: false },
  { id: 'biz13', name: 'Brandon Foster',     username: '@bfoster',     initials: 'BF', org: 'KaNeXT', role: 'Mobile Engineer',       mode: 'business', online: true  },
  { id: 'biz14', name: 'Aisha Gaines',       username: '@againes',     initials: 'AG', org: 'KaNeXT', role: 'Operations Manager',    mode: 'business', online: false },
  { id: 'biz15', name: 'Chris Grant',        username: '@cgrant',      initials: 'CG', org: 'KaNeXT', role: 'Growth Lead',           mode: 'business', online: true  },
  { id: 'biz16', name: 'Stephanie Hall',     username: '@shall',       initials: 'SH', org: 'KaNeXT', role: 'Community Manager',     mode: 'business', online: false },
  { id: 'biz17', name: 'James Harris',       username: '@jharris',     initials: 'JH', org: 'KaNeXT', role: 'Security Engineer',     mode: 'business', online: true  },
  { id: 'biz18', name: 'Tiffany Hayes',      username: '@thayes',      initials: 'TH', org: 'KaNeXT', role: 'Business Analyst',      mode: 'business', online: false },
  { id: 'biz19', name: 'Robert Hill',        username: '@rhill',       initials: 'RH', org: 'KaNeXT', role: 'Infrastructure Lead',   mode: 'business', online: false },
  { id: 'biz20', name: 'Lauren Hughes',      username: '@lhughes',     initials: 'LH', org: 'KaNeXT', role: 'QA Engineer',           mode: 'business', online: true  },
  { id: 'biz21', name: 'David Jackson',      username: '@djackson',    initials: 'DJ', org: 'KaNeXT', role: 'VP Engineering',        mode: 'business', isFavorite: true,  online: true  },
  { id: 'biz22', name: 'Monica James',       username: '@mjames',      initials: 'MJ', org: 'KaNeXT', role: 'Brand Manager',         mode: 'business', online: false },
  { id: 'biz23', name: 'Brian Johnson',      username: '@bjohnson',    initials: 'BJ', org: 'KaNeXT', role: 'Solutions Architect',   mode: 'business', online: true  },
  { id: 'biz24', name: 'Vanessa Jones',      username: '@vjones',      initials: 'VJ', org: 'KaNeXT', role: 'Customer Success',      mode: 'business', online: false },
  { id: 'p1',    name: 'Alex Kim',           username: '@akim',        initials: 'AK', org: 'KaNeXT', role: 'Analyst',               mode: 'business', isFavorite: true,  online: true  },
  { id: 'biz25', name: 'Aaron King',         username: '@aking',       initials: 'AK', org: 'KaNeXT', role: 'Platform Lead',         mode: 'business', online: true  },
  { id: 'biz26', name: 'Cassandra Lee',      username: '@clee',        initials: 'CL', org: 'KaNeXT', role: 'Legal Counsel',         mode: 'business', online: false },
  { id: 'biz27', name: 'Derek Lewis',        username: '@dlewis',      initials: 'DL', org: 'KaNeXT', role: 'Product Manager',       mode: 'business', online: true  },
  { id: 'biz28', name: 'Brittany Martin',    username: '@bmartin',     initials: 'BM', org: 'KaNeXT', role: 'Partnerships Lead',     mode: 'business', online: false },
  { id: 'biz29', name: 'Carlos Martinez',    username: '@cmartinez',   initials: 'CM', org: 'KaNeXT', role: 'Backend Engineer',      mode: 'business', online: true  },
  { id: 'biz30', name: 'Dana Mitchell',      username: '@dmitchell',   initials: 'DM', org: 'KaNeXT', role: 'Finance Manager',       mode: 'business', online: false },
  { id: 'biz31', name: 'Justin Moore',       username: '@jmoore',      initials: 'JM', org: 'KaNeXT', role: 'Sales Engineer',        mode: 'business', online: true  },
  { id: 'biz32', name: 'Alicia Morgan',      username: '@amorgan',     initials: 'AM', org: 'KaNeXT', role: 'Marketing Lead',        mode: 'business', online: false },
  { id: 'biz33', name: 'Anthony Murphy',     username: '@amurphy',     initials: 'AM', org: 'KaNeXT', role: 'CTO',                   mode: 'business', isFavorite: true,  online: true  },
  { id: 'biz34', name: 'Patricia Nelson',    username: '@pnelson',     initials: 'PN', org: 'KaNeXT', role: 'Customer Support Lead', mode: 'business', online: false },
  { id: 'biz35', name: 'Andre Nguyen',       username: '@anguyen',     initials: 'AN', org: 'KaNeXT', role: 'Data Engineer',         mode: 'business', online: true  },
  { id: 'p8',    name: 'Lisa Park',          username: '@lisapark',    initials: 'LP', org: 'KaNeXT', role: 'Operations Director',   mode: 'business', online: false },
  { id: 'biz36', name: 'Destiny Parker',     username: '@dparker',     initials: 'DP', org: 'KaNeXT', role: 'Social Media Lead',     mode: 'business', online: false },
  { id: 'biz37', name: 'Tyler Patel',        username: '@tpatel',      initials: 'TP', org: 'KaNeXT', role: 'Senior PM',             mode: 'business', online: true  },
  { id: 'biz38', name: 'Megan Peterson',     username: '@mpeterson',   initials: 'MP', org: 'KaNeXT', role: 'Content Creator',       mode: 'business', online: false },
  { id: 'biz39', name: 'Victor Price',       username: '@vprice',      initials: 'VP', org: 'KaNeXT', role: 'VP Sales',              mode: 'business', isFavorite: true,  online: true  },
  { id: 'biz40', name: 'Jasmine Reed',       username: '@jreed',       initials: 'JR', org: 'KaNeXT', role: 'UI Designer',           mode: 'business', online: false },
  { id: 'biz41', name: 'Gregory Roberts',    username: '@groberts',    initials: 'GR', org: 'KaNeXT', role: 'Compliance Officer',    mode: 'business', online: false },
  { id: 'biz42', name: 'Diana Robinson',     username: '@drobinson',   initials: 'DR', org: 'KaNeXT', role: 'People Operations',     mode: 'business', online: true  },
  { id: 'biz43', name: 'Sean Rogers',        username: '@srogers',     initials: 'SR', org: 'KaNeXT', role: 'Full Stack Engineer',   mode: 'business', online: true  },
  { id: 'biz44', name: 'Amber Scott',        username: '@ascott',      initials: 'AS', org: 'KaNeXT', role: 'Marketing Analyst',     mode: 'business', online: false },
  { id: 'biz45', name: 'Jason Smith',        username: '@jsmith',      initials: 'JS', org: 'KaNeXT', role: 'Head of Growth',        mode: 'business', online: true  },
  { id: 'biz46', name: 'Kimberly Stewart',   username: '@kstewart',    initials: 'KS', org: 'KaNeXT', role: 'Project Manager',       mode: 'business', online: false },
  { id: 'biz47', name: 'Darius Taylor',      username: '@dtaylor',     initials: 'DT', org: 'KaNeXT', role: 'Staff Engineer',        mode: 'business', online: true  },
  { id: 'biz48', name: 'Courtney Thomas',    username: '@cthomas',     initials: 'CT', org: 'KaNeXT', role: 'Sales Manager',         mode: 'business', online: false },
  { id: 'biz49', name: 'Alexis Thompson',    username: '@athompson',   initials: 'AT', org: 'KaNeXT', role: 'Product Designer',      mode: 'business', online: true  },
  { id: 'biz50', name: 'Jessica Torres',     username: '@jtorres',     initials: 'JT', org: 'KaNeXT', role: 'Analytics Engineer',    mode: 'business', online: false },
  { id: 'biz51', name: 'Kyle Turner',        username: '@kturner',     initials: 'KT', org: 'KaNeXT', role: 'iOS Engineer',          mode: 'business', online: true  },
  { id: 'biz52', name: 'Danielle Walker',    username: '@dwalker',     initials: 'DW', org: 'KaNeXT', role: 'Technical Recruiter',   mode: 'business', online: false },
  { id: 'biz53', name: 'Terrence Washington',username: '@twashington', initials: 'TW', org: 'KaNeXT', role: 'Senior Engineer',       mode: 'business', isFavorite: true,  online: true  },
  { id: 'biz54', name: 'Natalie Williams',   username: '@nwilliams',   initials: 'NW', org: 'KaNeXT', role: 'Product Manager',       mode: 'business', online: false },
  { id: 'biz55', name: 'Dominique Wilson',   username: '@dwilson',     initials: 'DW', org: 'KaNeXT', role: 'Design Lead',           mode: 'business', online: true  },
  { id: 'biz56', name: 'Samantha Wright',    username: '@swright',     initials: 'SW', org: 'KaNeXT', role: 'CEO',                   mode: 'business', isFavorite: true,  online: true  },
  { id: 'biz57', name: 'Patrick Young',      username: '@pyoung',      initials: 'PY', org: 'KaNeXT', role: 'Android Engineer',      mode: 'business', online: false },
];

// ── Groups ──

export const PHONE_GROUPS: PhoneGroup[] = [
  { id: 'g1', name: 'Coaching Staff', initials: 'CS', memberCount: 4, mode: 'sports', lastCallTimestamp: 'Yesterday' },
  { id: 'g2', name: 'Guards', initials: 'GD', memberCount: 6, mode: 'sports', lastCallTimestamp: 'Mar 5' },
  { id: 'g3', name: 'Recruiting Core', initials: 'RK', memberCount: 3, mode: 'sports', lastCallTimestamp: 'Mar 3' },
  { id: 'g4', name: 'Leadership Team', initials: 'LT', memberCount: 5, mode: 'business', lastCallTimestamp: 'Mar 1' },
  { id: 'g5', name: 'Pastoral Staff', initials: 'PS', memberCount: 4, mode: 'community', lastCallTimestamp: 'Feb 28' },
  { id: 'g6', name: 'Ministry Leaders', initials: 'ML', memberCount: 7, mode: 'community', lastCallTimestamp: 'Feb 25' },
  { id: 'g7', name: 'Admissions Team', initials: 'AT', memberCount: 5, mode: 'education', lastCallTimestamp: 'Feb 20' },
];

// ── Voicemails ──

export const VOICEMAILS: Voicemail[] = [
  {
    id: 'v1',
    callerName: 'Athletic Dept',
    callerUsername: '@athletics',
    callerInitials: 'AD',
    mode: 'sports',
    duration: '0:42',
    timestamp: 'Yesterday',
    transcription: 'Hey, just calling about the schedule change for next week. The Tuesday practice is moving to 3 PM instead of 2. Let me know if that works for the team.',
  },
  {
    id: 'v2',
    callerName: 'Alex Kim',
    callerUsername: '@akim',
    callerInitials: 'AK',
    mode: 'business',
    duration: '0:28',
    timestamp: 'Mar 3',
    transcription: 'Hi, wanted to follow up on the Q1 report. I have the numbers ready whenever you want to review. Call me back when you get a chance.',
  },
  {
    id: 'v3',
    callerName: 'Pastor Davis',
    callerUsername: '@pastordavis',
    callerInitials: 'PD',
    mode: 'community',
    duration: '1:15',
    timestamp: 'Mar 1',
    transcription: 'Good morning! I wanted to talk about the upcoming service plans for Easter. We need to coordinate with the worship team and make sure we have volunteers lined up. Give me a call when you have a moment.',
  },
];

// ── My KaNeXT Numbers ──

export const MY_KANEXT_NUMBERS: KanextNumber[] = [
  { mode: 'sports', label: 'Sports', number: '+1 (555) 247-8301' },
  { mode: 'business', label: 'Business', number: '+1 (555) 247-8302' },
  { mode: 'community', label: 'Community', number: '+1 (555) 247-8303' },
  { mode: 'education', label: 'Education', number: '+1 (555) 247-8304' },
];

// ── Helpers ──

export function getFavoriteContacts(): PhoneContact[] {
  return PHONE_CONTACTS.filter((c) => c.isFavorite);
}

export function getContactsByMode(mode: Mode): PhoneContact[] {
  return PHONE_CONTACTS.filter((c) => c.mode === mode);
}

export function getRecentCallsByMode(mode?: Mode): RecentCall[] {
  if (!mode) return RECENT_CALLS;
  return RECENT_CALLS.filter((c) => c.mode === mode);
}
