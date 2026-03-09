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
  church: '#F59E0B',
  education: '#10B981',
  competition: '#EF4444',
};

export const MODE_BADGE_LABELS: Record<Mode, string> = {
  sports: 'Sports',
  business: 'Business',
  church: 'Faith',
  education: 'Education',
  competition: 'Competition',
};

// ── Recent Calls ──

export const RECENT_CALLS: RecentCall[] = [
  { id: 'c1', name: 'Coach Williams', username: '@coachwilliams', initials: 'CW', mode: 'sports', direction: 'outgoing', timestamp: '2:34 PM', duration: '4:21' },
  { id: 'c2', name: 'James Rodriguez', username: '@jrod23', initials: 'JR', mode: 'sports', direction: 'incoming', timestamp: '1:12 PM', duration: '12:05' },
  { id: 'c3', name: 'Sarah Chen', username: '@schen', initials: 'SC', mode: 'business', direction: 'missed', timestamp: '11:45 AM' },
  { id: 'c4', name: 'Pastor Davis', username: '@pastordavis', initials: 'PD', mode: 'church', direction: 'incoming', timestamp: '10:20 AM', duration: '8:33' },
  { id: 'c5', name: 'Marcus Johnson', username: '@mjohnson', initials: 'MJ', mode: 'sports', direction: 'video', timestamp: '9:15 AM', duration: '22:17' },
  { id: 'c6', name: 'Athletic Dept', username: '@athletics', initials: 'AD', mode: 'sports', direction: 'missed', timestamp: 'Yesterday', hasVoicemail: true },
  { id: 'c7', name: 'Lisa Park', username: '@lisapark', initials: 'LP', mode: 'business', direction: 'outgoing', timestamp: 'Yesterday', duration: '3:45' },
  { id: 'c8', name: 'Training Staff', username: '@trainstaff', initials: 'TS', mode: 'sports', direction: 'incoming', timestamp: 'Yesterday', duration: '1:33' },
  { id: 'c9', name: 'Michael Torres', username: '@mtorres', initials: 'MT', mode: 'education', direction: 'missed', timestamp: 'Mar 5' },
  { id: 'c10', name: 'Dr. Kim', username: '@drkim', initials: 'DK', mode: 'sports', direction: 'incoming', timestamp: 'Mar 5', duration: '6:12' },
  { id: 'c11', name: 'Front Office', username: '@frontoffice', initials: 'FO', mode: 'sports', direction: 'outgoing', timestamp: 'Mar 4', duration: '0:45' },
  { id: 'c12', name: 'Rachel Green', username: '@rgreen', initials: 'RG', mode: 'church', direction: 'video', timestamp: 'Mar 4', duration: '15:20' },
  { id: 'c13', name: 'Alex Kim', username: '@akim', initials: 'AK', mode: 'business', direction: 'missed', timestamp: 'Mar 3', hasVoicemail: true },
  { id: 'c14', name: 'Coach Thompson', username: '@cthompson', initials: 'CT', mode: 'sports', direction: 'incoming', timestamp: 'Mar 3', duration: '11:02' },
];

// ── Contacts ──

export const PHONE_CONTACTS: PhoneContact[] = [
  { id: 'p1', name: 'Alex Kim', username: '@akim', initials: 'AK', org: 'Apex Ventures', role: 'Analyst', mode: 'business', isFavorite: true, online: true },
  { id: 'p2', name: 'Athletic Dept', username: '@athletics', initials: 'AD', org: 'Lincoln University', role: 'Department', mode: 'sports', online: false },
  { id: 'p3', name: 'Coach Thompson', username: '@cthompson', initials: 'CT', org: 'Lincoln University', role: 'Assistant Coach', mode: 'sports', isFavorite: true, online: true },
  { id: 'p4', name: 'Coach Williams', username: '@coachwilliams', initials: 'CW', org: 'Lincoln University', role: 'Head Coach', mode: 'sports', isFavorite: true, online: true },
  { id: 'p5', name: 'Dr. Kim', username: '@drkim', initials: 'DK', org: 'Lincoln University', role: 'Team Physician', mode: 'sports', online: false },
  { id: 'p6', name: 'Front Office', username: '@frontoffice', initials: 'FO', org: 'Lincoln University', role: 'Administration', mode: 'sports', online: true },
  { id: 'p7', name: 'James Rodriguez', username: '@jrod23', initials: 'JR', org: 'Lincoln University', role: 'Player', mode: 'sports', isFavorite: true, online: true },
  { id: 'p8', name: 'Lisa Park', username: '@lisapark', initials: 'LP', org: 'Apex Ventures', role: 'Operations Director', mode: 'business', online: false },
  { id: 'p9', name: 'Marcus Johnson', username: '@mjohnson', initials: 'MJ', org: 'Lincoln University', role: 'Player', mode: 'sports', online: true },
  { id: 'p10', name: 'Medical Team', username: '@medteam', initials: 'MT', org: 'Lincoln University', role: 'Department', mode: 'sports', online: false },
  { id: 'p11', name: 'Michael Torres', username: '@mtorres', initials: 'MT', org: 'Lincoln University', role: 'Professor', mode: 'education', online: false },
  { id: 'p12', name: 'Pastor Davis', username: '@pastordavis', initials: 'PD', org: 'ICCLA', role: 'Senior Pastor', mode: 'church', online: true },
  { id: 'p13', name: 'Rachel Green', username: '@rgreen', initials: 'RG', org: 'ICCLA', role: 'Worship Leader', mode: 'church', online: false },
  { id: 'p14', name: 'Sarah Chen', username: '@schen', initials: 'SC', org: 'Apex Ventures', role: 'CFO', mode: 'business', online: true },
  { id: 'p15', name: 'Training Staff', username: '@trainstaff', initials: 'TS', org: 'Lincoln University', role: 'Department', mode: 'sports', online: false },
];

// ── Groups ──

export const PHONE_GROUPS: PhoneGroup[] = [
  { id: 'g1', name: 'Coaching Staff', initials: 'CS', memberCount: 4, mode: 'sports', lastCallTimestamp: 'Yesterday' },
  { id: 'g2', name: 'Guards', initials: 'GD', memberCount: 6, mode: 'sports', lastCallTimestamp: 'Mar 5' },
  { id: 'g3', name: 'Recruiting Core', initials: 'RK', memberCount: 3, mode: 'sports', lastCallTimestamp: 'Mar 3' },
  { id: 'g4', name: 'Leadership Team', initials: 'LT', memberCount: 5, mode: 'business', lastCallTimestamp: 'Mar 1' },
  { id: 'g5', name: 'Pastoral Staff', initials: 'PS', memberCount: 4, mode: 'church', lastCallTimestamp: 'Feb 28' },
  { id: 'g6', name: 'Ministry Leaders', initials: 'ML', memberCount: 7, mode: 'church', lastCallTimestamp: 'Feb 25' },
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
    mode: 'church',
    duration: '1:15',
    timestamp: 'Mar 1',
    transcription: 'Good morning! I wanted to talk about the upcoming service plans for Easter. We need to coordinate with the worship team and make sure we have volunteers lined up. Give me a call when you have a moment.',
  },
];

// ── My KaNeXT Numbers ──

export const MY_KANEXT_NUMBERS: KanextNumber[] = [
  { mode: 'sports', label: 'Sports', number: '+1 (555) 247-8301' },
  { mode: 'business', label: 'Business', number: '+1 (555) 247-8302' },
  { mode: 'church', label: 'Faith', number: '+1 (555) 247-8303' },
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
