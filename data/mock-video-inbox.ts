/**
 * Mock Video Inbox Data
 * Quick share targets and media inbox threads for the Video Inbox tab.
 * Mode-keyed exports for all 5 modes.
 */

import type { Mode } from '@/types';

export interface QuickShareTarget {
  id: string;
  name: string;
  initials: string;
  role: string;
}

export interface VideoMediaAttachment {
  type: 'clip' | 'game' | 'reel';
  id: string;
  title: string;
}

export interface VideoInboxThread {
  id: string;
  title: string;
  participants: string[];
  lastMessage: string;
  timestamp: Date;
  unread: number;
  avatarInitials: string;
  mediaAttachment?: VideoMediaAttachment;
}

const now = new Date();
const ago = (minutes: number) => new Date(now.getTime() - minutes * 60000);

// =============================================================================
// SPORTS — Quick Share Targets + Inbox Threads
// =============================================================================

export const QUICK_SHARE_TARGETS: QuickShareTarget[] = [
  { id: 'qs-1', name: 'Coach Miller', initials: 'CM', role: 'Assistant' },
  { id: 'qs-2', name: 'Coach Brooks', initials: 'CB', role: 'Video Coord' },
  { id: 'qs-3', name: 'Staff Room', initials: 'SR', role: 'Group' },
  { id: 'qs-4', name: 'Guards Group', initials: 'GG', role: 'Group' },
  { id: 'qs-5', name: 'Marcus Johnson', initials: 'MJ', role: 'Player' },
];

export const VIDEO_INBOX_THREADS: VideoInboxThread[] = [
  {
    id: 'vt-1',
    title: 'Coach Brooks',
    participants: ['Coach Brooks'],
    lastMessage: 'Here\'s the transition defense breakdown from the Coastal game',
    timestamp: ago(45),
    unread: 2,
    avatarInitials: 'CB',
    mediaAttachment: { type: 'clip', id: 'vc-1', title: 'Transition Defense — Coastal' },
  },
  {
    id: 'vt-2',
    title: 'Coach Miller',
    participants: ['Coach Miller'],
    lastMessage: 'Tagged you in the Campbell scout clips. Check the zone press reps.',
    timestamp: ago(180),
    unread: 1,
    avatarInitials: 'CM',
    mediaAttachment: { type: 'clip', id: 'vc-2', title: 'Campbell Zone Press Reps' },
  },
  {
    id: 'vt-3',
    title: 'Staff Room',
    participants: ['Coach Miller', 'Coach Brooks', 'Coach Turner'],
    lastMessage: 'Film session recap is posted. Focus areas highlighted.',
    timestamp: ago(300),
    unread: 0,
    avatarInitials: 'SR',
  },
  {
    id: 'vt-4',
    title: 'Marcus Johnson',
    participants: ['Marcus Johnson'],
    lastMessage: 'Coach can you check my mid-range reel? Working on the pull-up.',
    timestamp: ago(720),
    unread: 0,
    avatarInitials: 'MJ',
    mediaAttachment: { type: 'reel', id: 'vr-1', title: 'Mid-Range Pull-Up Package' },
  },
];

// =============================================================================
// CHURCH — Quick Share Targets + Inbox Threads
// =============================================================================

const CHURCH_QUICK_SHARE_TARGETS: QuickShareTarget[] = [
  { id: 'cqs-1', name: 'Pastor Dipo', initials: 'DK', role: 'Senior Pastor' },
  { id: 'cqs-2', name: 'Worship Team', initials: 'WT', role: 'Ministry' },
  { id: 'cqs-3', name: 'Youth Dir.', initials: 'YD', role: 'Ministry' },
  { id: 'cqs-4', name: 'Staff Chat', initials: 'SC', role: 'Group' },
  { id: 'cqs-5', name: 'Media Team', initials: 'MT', role: 'Production' },
];

const CHURCH_INBOX_THREADS: VideoInboxThread[] = [
  {
    id: 'cvt-1',
    title: 'Worship Team',
    participants: ['Worship Team'],
    lastMessage: 'Sunday set list video references are uploaded. Check the arrangement for "Great Is Thy Faithfulness."',
    timestamp: ago(30),
    unread: 3,
    avatarInitials: 'WT',
    mediaAttachment: { type: 'clip', id: 'cwt-1', title: 'Great Is Thy Faithfulness — Arrangement' },
  },
  {
    id: 'cvt-2',
    title: 'Pastor Dipo Kalejaiye',
    participants: ['Pastor Dipo Kalejaiye'],
    lastMessage: 'Sermon clip for social media is ready. Let me know if the intro needs trimming.',
    timestamp: ago(120),
    unread: 1,
    avatarInitials: 'DK',
    mediaAttachment: { type: 'clip', id: 'cwt-2', title: 'Walking in Faith — Social Clip' },
  },
  {
    id: 'cvt-3',
    title: 'Youth Ministry',
    participants: ['Bro. James', 'Sis. Ade', 'Youth Dir.'],
    lastMessage: 'Retreat video is finished editing. Share with parents this week?',
    timestamp: ago(360),
    unread: 0,
    avatarInitials: 'YM',
    mediaAttachment: { type: 'clip', id: 'cwt-3', title: 'Youth Retreat 2026 — Edit v2' },
  },
  {
    id: 'cvt-4',
    title: 'Media Team',
    participants: ['Media Team'],
    lastMessage: 'Live stream test was successful. New camera angles look great.',
    timestamp: ago(600),
    unread: 0,
    avatarInitials: 'MT',
  },
  {
    id: 'cvt-5',
    title: 'Deacon Board',
    participants: ['Deacon Williams', 'Deacon Brown', 'Deacon Okafor'],
    lastMessage: 'Outreach photos and video from Saturday are compiled. Ready for bulletin.',
    timestamp: ago(840),
    unread: 0,
    avatarInitials: 'DB',
    mediaAttachment: { type: 'clip', id: 'cwt-5', title: 'Outreach Saturday Highlights' },
  },
];

// =============================================================================
// EDUCATION — Quick Share Targets + Inbox Threads
// =============================================================================

const EDUCATION_QUICK_SHARE_TARGETS: QuickShareTarget[] = [
  { id: 'eqs-1', name: 'Prof. Adebayo', initials: 'PA', role: 'Faculty' },
  { id: 'eqs-2', name: 'Dean Morris', initials: 'DM', role: 'Administration' },
  { id: 'eqs-3', name: 'Student Gov', initials: 'SG', role: 'Group' },
  { id: 'eqs-4', name: 'Athletics', initials: 'FA', role: 'Department' },
  { id: 'eqs-5', name: 'Study Group', initials: 'SG', role: 'Group' },
];

const EDUCATION_INBOX_THREADS: VideoInboxThread[] = [
  {
    id: 'evt-1',
    title: 'Prof. Adebayo',
    participants: ['Prof. Adebayo'],
    lastMessage: 'Machine Learning lecture recording is processed and uploaded. Chapter markers added.',
    timestamp: ago(60),
    unread: 1,
    avatarInitials: 'PA',
    mediaAttachment: { type: 'clip', id: 'ewt-1', title: 'CS 401 — ML Lecture Feb 14' },
  },
  {
    id: 'evt-2',
    title: 'Student Government',
    participants: ['Student Government'],
    lastMessage: 'Homecoming highlight reel is live. 8K views in 2 hours!',
    timestamp: ago(240),
    unread: 2,
    avatarInitials: 'SG',
    mediaAttachment: { type: 'reel', id: 'ewt-2', title: 'Homecoming 2026 Highlights' },
  },
  {
    id: 'evt-3',
    title: 'FMU Athletics',
    participants: ['FMU Athletics'],
    lastMessage: 'Season recap video is ready for review. Need approval before posting.',
    timestamp: ago(480),
    unread: 0,
    avatarInitials: 'FA',
    mediaAttachment: { type: 'clip', id: 'ewt-3', title: 'Lions Season Recap — Draft' },
  },
  {
    id: 'evt-4',
    title: 'Research Symposium',
    participants: ['Dr. Chen', 'Prof. Williams', 'Research Office'],
    lastMessage: 'Presentation recordings from panels A-C are edited and tagged by department.',
    timestamp: ago(720),
    unread: 0,
    avatarInitials: 'RS',
  },
  {
    id: 'evt-5',
    title: 'Aviation Department',
    participants: ['Aviation Department'],
    lastMessage: 'Solo flight footage compiled. Parents and prospective students will love this.',
    timestamp: ago(960),
    unread: 0,
    avatarInitials: 'AV',
    mediaAttachment: { type: 'reel', id: 'ewt-5', title: 'Solo Flight Day — Spring 2026' },
  },
];

// =============================================================================
// ENTERPRISE — Quick Share Targets + Inbox Threads
// =============================================================================

const ENTERPRISE_QUICK_SHARE_TARGETS: QuickShareTarget[] = [
  { id: 'bqs-1', name: 'Product Team', initials: 'PT', role: 'Team' },
  { id: 'bqs-2', name: 'Engineering', initials: 'EN', role: 'Team' },
  { id: 'bqs-3', name: 'Marketing', initials: 'MK', role: 'Team' },
  { id: 'bqs-4', name: 'All-Hands', initials: 'AH', role: 'Group' },
  { id: 'bqs-5', name: 'Investors', initials: 'IV', role: 'External' },
];

const ENTERPRISE_INBOX_THREADS: VideoInboxThread[] = [
  {
    id: 'bvt-1',
    title: 'Product Team',
    participants: ['Product Team'],
    lastMessage: 'V2 demo recording is trimmed and captioned. Ready for investor share.',
    timestamp: ago(45),
    unread: 2,
    avatarInitials: 'PT',
    mediaAttachment: { type: 'clip', id: 'bwt-1', title: 'KaNeXT V2 Demo — Final Cut' },
  },
  {
    id: 'bvt-2',
    title: 'Engineering',
    participants: ['Engineering'],
    lastMessage: 'Sprint 14 demo recording posted. Timestamps in the description.',
    timestamp: ago(240),
    unread: 1,
    avatarInitials: 'EN',
    mediaAttachment: { type: 'clip', id: 'bwt-2', title: 'Sprint 14 Demo' },
  },
  {
    id: 'bvt-3',
    title: 'Marketing',
    participants: ['Marketing'],
    lastMessage: 'HBCU Tech Summit booth footage edited. Social cuts are ready.',
    timestamp: ago(480),
    unread: 0,
    avatarInitials: 'MK',
    mediaAttachment: { type: 'reel', id: 'bwt-3', title: 'Tech Summit — Social Reel' },
  },
  {
    id: 'bvt-4',
    title: 'Customer Success',
    participants: ['Customer Success'],
    lastMessage: 'FMU testimonial video is approved. Posting to website tomorrow.',
    timestamp: ago(720),
    unread: 0,
    avatarInitials: 'CS',
    mediaAttachment: { type: 'clip', id: 'bwt-4', title: 'FMU Testimonial — Final' },
  },
  {
    id: 'bvt-5',
    title: 'All-Hands',
    participants: ['Sammy Kalejaiye', 'Product Team', 'Engineering', 'Marketing'],
    lastMessage: 'February all-hands recording uploaded. Chapters and slides synced.',
    timestamp: ago(960),
    unread: 0,
    avatarInitials: 'AH',
  },
];

// =============================================================================
// COMMUNITY — Quick Share Targets + Inbox Threads
// =============================================================================

const COMMUNITY_QUICK_SHARE_TARGETS: QuickShareTarget[] = [
  { id: 'kqs-1', name: 'Race Director', initials: 'RD', role: 'Official' },
  { id: 'kqs-2', name: 'Apex Racing', initials: 'AR', role: 'Team' },
  { id: 'kqs-3', name: 'M. Kane', initials: 'MK', role: 'Driver' },
  { id: 'kqs-4', name: 'Pit Crew', initials: 'PC', role: 'Group' },
  { id: 'kqs-5', name: 'K-1 Media', initials: 'K1', role: 'Broadcast' },
];

const COMMUNITY_INBOX_THREADS: VideoInboxThread[] = [
  {
    id: 'kvt-1',
    title: 'Apex Racing',
    participants: ['Apex Racing'],
    lastMessage: 'Laguna Seca onboard footage from Kane\'s qualifying lap is processed. Telemetry overlay added.',
    timestamp: ago(60),
    unread: 2,
    avatarInitials: 'AR',
    mediaAttachment: { type: 'clip', id: 'kwt-1', title: 'Kane Qualifying — Onboard + Telemetry' },
  },
  {
    id: 'kvt-2',
    title: 'Race Director',
    participants: ['Race Director'],
    lastMessage: 'Incident review footage from Turn 4 — Lap 12. Steward decision pending.',
    timestamp: ago(180),
    unread: 1,
    avatarInitials: 'RD',
    mediaAttachment: { type: 'clip', id: 'kwt-2', title: 'Turn 4 Incident — Multi-Angle' },
  },
  {
    id: 'kvt-3',
    title: 'Pit Crew',
    participants: ['Chief Mechanic', 'Tire Specialist', 'Fuel Man'],
    lastMessage: 'Pit stop replay reviewed. 2.8s was clean but we can shave 0.2s on the rear left.',
    timestamp: ago(360),
    unread: 0,
    avatarInitials: 'PC',
    mediaAttachment: { type: 'clip', id: 'kwt-3', title: 'Pit Stop Review — Race 6' },
  },
  {
    id: 'kvt-4',
    title: 'K-1 Media',
    participants: ['K-1 Media'],
    lastMessage: 'Post-race interview clips are ready for social. Kane and Reeves sound bites included.',
    timestamp: ago(600),
    unread: 0,
    avatarInitials: 'K1',
    mediaAttachment: { type: 'reel', id: 'kwt-4', title: 'Post-Race Interviews — Laguna' },
  },
  {
    id: 'kvt-5',
    title: 'Marcus Kane',
    participants: ['Marcus Kane'],
    lastMessage: 'Thanks for the setup notes. Car felt amazing through the corkscrew.',
    timestamp: ago(840),
    unread: 0,
    avatarInitials: 'MK',
  },
];

// =============================================================================
// MODE-KEYED EXPORTS
// =============================================================================

export const QUICK_SHARE_TARGETS_BY_MODE: Record<Mode, QuickShareTarget[]> = {
  sports: QUICK_SHARE_TARGETS,
  church: CHURCH_QUICK_SHARE_TARGETS,
  education: EDUCATION_QUICK_SHARE_TARGETS,
  enterprise: ENTERPRISE_QUICK_SHARE_TARGETS,
  business: ENTERPRISE_QUICK_SHARE_TARGETS,
  competition: COMMUNITY_QUICK_SHARE_TARGETS,
};

export const INBOX_THREADS_BY_MODE: Record<Mode, VideoInboxThread[]> = {
  sports: VIDEO_INBOX_THREADS,
  church: CHURCH_INBOX_THREADS,
  education: EDUCATION_INBOX_THREADS,
  enterprise: ENTERPRISE_INBOX_THREADS,
  business: ENTERPRISE_INBOX_THREADS,
  competition: COMMUNITY_INBOX_THREADS,
};
