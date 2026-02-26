/**
 * Mock Business Rooms — Enterprise session infrastructure data.
 *
 * Types: BOARD | CAPITAL | EXECUTIVE | PUBLIC | INTERNAL
 * Statuses: Live | Scheduled | Completed
 * Visibility: 0 = Public, 1 = Internal, 2 = Board, 3 = Executive
 * Participants: role + status (Invited/Accepted/Declined/Attended)
 */

// =============================================================================
// TYPES
// =============================================================================

export type BizRoomType = 'BOARD' | 'CAPITAL' | 'EXECUTIVE' | 'PUBLIC' | 'INTERNAL';

export type BizRoomStatus = 'Live' | 'Scheduled' | 'Completed';

export type BizVisibilityClass = 0 | 1 | 2 | 3;

export type ParticipantStatus = 'Invited' | 'Accepted' | 'Declined' | 'Attended';

export type RecordingStatus = 'Recorded' | 'Not Recorded' | 'Recording';

export type LinkedDomain = 'Finance' | 'Compliance' | 'Operations' | 'Strategy' | 'Capital' | 'Multi-domain';

export const ROOM_TYPE_COLORS: Record<BizRoomType, string> = {
  BOARD: '#EF4444',
  CAPITAL: '#F59E0B',
  EXECUTIVE: '#8B5CF6',
  PUBLIC: '#22C55E',
  INTERNAL: '#1D9BF0',
};

export const VISIBILITY_LABELS: Record<BizVisibilityClass, string> = {
  0: 'Public',
  1: 'Internal',
  2: 'Board',
  3: 'Executive',
};

export const VISIBILITY_COLORS: Record<BizVisibilityClass, string> = {
  0: '#22C55E',
  1: '#1D9BF0',
  2: '#F59E0B',
  3: '#EF4444',
};

export const STATUS_COLORS: Record<BizRoomStatus, string> = {
  Live: '#22C55E',
  Scheduled: '#1D9BF0',
  Completed: '#A1A1AA',
};

export const RECORDING_COLORS: Record<RecordingStatus, string> = {
  Recorded: '#22C55E',
  'Not Recorded': '#A1A1AA',
  Recording: '#EF4444',
};

export interface BizRoomParticipant {
  role: string;
  status: ParticipantStatus;
}

export interface BizRoom {
  id: string;
  name: string;
  type: BizRoomType;
  status: BizRoomStatus;
  visibilityClass: BizVisibilityClass;
  linkedDomain: LinkedDomain;
  linkedEvent?: string;
  linkedDeal?: string;
  linkedObligation?: string;
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  duration?: string;
  recordingStatus: RecordingStatus;
  recordingEnabled: boolean;
  participants: BizRoomParticipant[];
  thumbnailColor: string;
}

// =============================================================================
// MOCK DATA
// =============================================================================

export const BIZ_ROOMS: BizRoom[] = [
  // ── ACTIVE (Live) ─────────────────────────────────────────────────────
  {
    id: 'br-01',
    name: 'Series B Investor Call',
    type: 'CAPITAL',
    status: 'Live',
    visibilityClass: 3,
    linkedDomain: 'Capital',
    linkedDeal: 'Series B',
    scheduledAt: new Date('2026-02-26T14:00:00'),
    startedAt: new Date('2026-02-26T14:02:00'),
    recordingStatus: 'Recording',
    recordingEnabled: true,
    participants: [
      { role: 'CEO', status: 'Attended' },
      { role: 'CFO', status: 'Attended' },
      { role: 'Lead Investor', status: 'Attended' },
      { role: 'Legal Counsel', status: 'Attended' },
      { role: 'Board Observer', status: 'Invited' },
    ],
    thumbnailColor: '#1A3A5C',
  },
  {
    id: 'br-02',
    name: 'Product Demo — Enterprise Client',
    type: 'PUBLIC',
    status: 'Live',
    visibilityClass: 0,
    linkedDomain: 'Operations',
    linkedEvent: 'Enterprise Demo Day',
    scheduledAt: new Date('2026-02-26T15:00:00'),
    startedAt: new Date('2026-02-26T15:05:00'),
    recordingStatus: 'Recording',
    recordingEnabled: true,
    participants: [
      { role: 'VP Product', status: 'Attended' },
      { role: 'Sales Lead', status: 'Attended' },
      { role: 'Client Rep', status: 'Attended' },
    ],
    thumbnailColor: '#0F766E',
  },

  // ── UPCOMING (Scheduled) ──────────────────────────────────────────────
  {
    id: 'br-03',
    name: 'Board Meeting — March 2026',
    type: 'BOARD',
    status: 'Scheduled',
    visibilityClass: 2,
    linkedDomain: 'Multi-domain',
    linkedEvent: 'Q1 Board Meeting',
    scheduledAt: new Date('2026-03-04T10:00:00'),
    recordingStatus: 'Not Recorded',
    recordingEnabled: true,
    participants: [
      { role: 'CEO', status: 'Accepted' },
      { role: 'CFO', status: 'Accepted' },
      { role: 'Board Chair', status: 'Accepted' },
      { role: 'Board Member', status: 'Accepted' },
      { role: 'Board Member', status: 'Invited' },
      { role: 'General Counsel', status: 'Accepted' },
    ],
    thumbnailColor: '#7F1D1D',
  },
  {
    id: 'br-04',
    name: 'Executive Strategy Review — H1 Targets',
    type: 'EXECUTIVE',
    status: 'Scheduled',
    visibilityClass: 3,
    linkedDomain: 'Strategy',
    scheduledAt: new Date('2026-03-01T09:00:00'),
    recordingStatus: 'Not Recorded',
    recordingEnabled: false,
    participants: [
      { role: 'CEO', status: 'Accepted' },
      { role: 'COO', status: 'Accepted' },
      { role: 'CFO', status: 'Invited' },
      { role: 'VP Engineering', status: 'Accepted' },
      { role: 'VP Product', status: 'Invited' },
    ],
    thumbnailColor: '#4C1D95',
  },
  {
    id: 'br-05',
    name: 'Compliance Review — Annual Filing',
    type: 'INTERNAL',
    status: 'Scheduled',
    visibilityClass: 1,
    linkedDomain: 'Compliance',
    linkedObligation: 'Annual SEC Filing',
    scheduledAt: new Date('2026-02-28T11:00:00'),
    recordingStatus: 'Not Recorded',
    recordingEnabled: true,
    participants: [
      { role: 'CFO', status: 'Accepted' },
      { role: 'General Counsel', status: 'Accepted' },
      { role: 'Controller', status: 'Invited' },
    ],
    thumbnailColor: '#1E293B',
  },
  {
    id: 'br-06',
    name: 'Capital Table Review — Option Pool',
    type: 'CAPITAL',
    status: 'Scheduled',
    visibilityClass: 2,
    linkedDomain: 'Finance',
    linkedDeal: 'Series B',
    scheduledAt: new Date('2026-03-06T14:00:00'),
    recordingStatus: 'Not Recorded',
    recordingEnabled: false,
    participants: [
      { role: 'CEO', status: 'Accepted' },
      { role: 'CFO', status: 'Accepted' },
      { role: 'Legal Counsel', status: 'Invited' },
    ],
    thumbnailColor: '#78350F',
  },

  // ── PAST (Completed) ──────────────────────────────────────────────────
  {
    id: 'br-07',
    name: 'Board Meeting — February 2026',
    type: 'BOARD',
    status: 'Completed',
    visibilityClass: 2,
    linkedDomain: 'Multi-domain',
    linkedEvent: 'Feb Board Meeting',
    scheduledAt: new Date('2026-02-18T10:00:00'),
    startedAt: new Date('2026-02-18T10:03:00'),
    endedAt: new Date('2026-02-18T11:15:00'),
    duration: '1:12:30',
    recordingStatus: 'Recorded',
    recordingEnabled: true,
    participants: [
      { role: 'CEO', status: 'Attended' },
      { role: 'CFO', status: 'Attended' },
      { role: 'Board Chair', status: 'Attended' },
      { role: 'Board Member', status: 'Attended' },
      { role: 'Board Member', status: 'Attended' },
      { role: 'General Counsel', status: 'Attended' },
    ],
    thumbnailColor: '#6B2121',
  },
  {
    id: 'br-08',
    name: 'All-Hands — February 2026',
    type: 'INTERNAL',
    status: 'Completed',
    visibilityClass: 1,
    linkedDomain: 'Operations',
    linkedEvent: 'Feb All-Hands',
    scheduledAt: new Date('2026-02-14T16:00:00'),
    startedAt: new Date('2026-02-14T16:00:00'),
    endedAt: new Date('2026-02-14T16:42:00'),
    duration: '42:15',
    recordingStatus: 'Recorded',
    recordingEnabled: true,
    participants: [
      { role: 'CEO', status: 'Attended' },
      { role: 'COO', status: 'Attended' },
      { role: 'All Employees', status: 'Attended' },
    ],
    thumbnailColor: '#2D3748',
  },
  {
    id: 'br-09',
    name: 'Investor Due Diligence — Data Room Walk',
    type: 'CAPITAL',
    status: 'Completed',
    visibilityClass: 3,
    linkedDomain: 'Capital',
    linkedDeal: 'Series B',
    scheduledAt: new Date('2026-02-10T13:00:00'),
    startedAt: new Date('2026-02-10T13:05:00'),
    endedAt: new Date('2026-02-10T14:02:00'),
    duration: '57:20',
    recordingStatus: 'Not Recorded',
    recordingEnabled: false,
    participants: [
      { role: 'CEO', status: 'Attended' },
      { role: 'CFO', status: 'Attended' },
      { role: 'Lead Investor', status: 'Attended' },
      { role: 'Legal Counsel', status: 'Attended' },
    ],
    thumbnailColor: '#374151',
  },
  {
    id: 'br-10',
    name: 'Executive Debrief — Partnership Terms',
    type: 'EXECUTIVE',
    status: 'Completed',
    visibilityClass: 3,
    linkedDomain: 'Strategy',
    linkedDeal: 'NovaTech Partnership',
    scheduledAt: new Date('2026-02-06T09:30:00'),
    startedAt: new Date('2026-02-06T09:32:00'),
    endedAt: new Date('2026-02-06T10:15:00'),
    duration: '43:10',
    recordingStatus: 'Recorded',
    recordingEnabled: true,
    participants: [
      { role: 'CEO', status: 'Attended' },
      { role: 'COO', status: 'Attended' },
      { role: 'VP Partnerships', status: 'Attended' },
      { role: 'General Counsel', status: 'Attended' },
    ],
    thumbnailColor: '#312E81',
  },
  {
    id: 'br-11',
    name: 'Public Product Launch Webinar',
    type: 'PUBLIC',
    status: 'Completed',
    visibilityClass: 0,
    linkedDomain: 'Operations',
    linkedEvent: 'Platform 2.0 Launch',
    scheduledAt: new Date('2026-02-03T11:00:00'),
    startedAt: new Date('2026-02-03T11:00:00'),
    endedAt: new Date('2026-02-03T11:45:00'),
    duration: '45:00',
    recordingStatus: 'Recorded',
    recordingEnabled: true,
    participants: [
      { role: 'VP Product', status: 'Attended' },
      { role: 'CEO', status: 'Attended' },
      { role: 'Marketing Lead', status: 'Attended' },
    ],
    thumbnailColor: '#0F766E',
  },
];

// =============================================================================
// HELPERS
// =============================================================================

const MOCK_USER_VISIBILITY = 4; // Founder sees everything (0..3)

/** Get rooms filtered by user visibility and status. */
export function getRoomsByStatus(status: BizRoomStatus): BizRoom[] {
  return BIZ_ROOMS.filter(
    (r) => r.status === status && r.visibilityClass < MOCK_USER_VISIBILITY,
  );
}

/** Format scheduled date for display. */
export function formatRoomDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** Format scheduled time for display. */
export function formatRoomTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** Format full date + time. */
export function formatRoomDateTime(date: Date): string {
  return `${formatRoomDate(date)} · ${formatRoomTime(date)}`;
}
