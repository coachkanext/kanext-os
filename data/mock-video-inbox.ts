/**
 * Mock Video Inbox Data
 * Quick share targets and media inbox threads for the Video Inbox tab.
 */

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
