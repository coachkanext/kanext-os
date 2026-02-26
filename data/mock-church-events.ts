/**
 * Church Event Detail — mock data
 * Enriched event model for the Event Detail Sheet.
 *
 * Types: ChurchEvent, ChurchEventRSVP, ChurchRoleAssignment
 * 5 demo events mapped to CHURCH_CALENDAR_EVENTS IDs.
 */

import type { ProgramCalendarEvent } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

export type ChurchEventType = 'SERVICE' | 'MINISTRY' | 'OUTREACH' | 'OTHER';
export type ChurchEventVisibility = 'PUBLIC' | 'CAMPUS' | 'MINISTRY';
export type RSVPStatus = 'GOING' | 'MAYBE' | 'NOT_GOING' | null;
export type ChurchEventStatus = 'upcoming' | 'live' | 'completed' | 'cancelled';

export interface ChurchEvent {
  id: string;
  orgId: string;
  campusId: string;
  campusName: string;
  ministryId?: string;
  ministryName?: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  type: ChurchEventType;
  status: ChurchEventStatus;
  rsvpEnabled: boolean;
  visibilityScope: ChurchEventVisibility;
  isRecurring?: boolean;
  seriesLabel?: string;
  organizer: string;
  organizerTitle?: string;
  attendeeCount?: number;
  mediaItems?: ChurchEventMedia[];
  roleAssignment?: ChurchRoleAssignment;
}

export interface ChurchEventMedia {
  id: string;
  title: string;
  type: 'video' | 'document' | 'flyer';
}

export interface ChurchRoleAssignment {
  role: string;
  room: string;
  checkInTime: string;
  coordinator: string;
}

export interface ChurchEventRSVP {
  eventId: string;
  personId: string;
  campusId: string;
  status: RSVPStatus;
  updatedAt: Date;
}

// =============================================================================
// MOCK EVENTS (enriched from CHURCH_CALENDAR_EVENTS)
// =============================================================================

export const CHURCH_EVENTS: ChurchEvent[] = [
  {
    id: 'ce-005',
    orgId: 'org-icc',
    campusId: 'campus-kcc',
    campusName: '2819 Church',
    title: 'Sunday Worship Experience',
    description:
      'Cross to Commission series \u2014 Part 4: "The Prayer of Faith." Morning worship with Pastor Philip Anthony Mitchell. Main service with full worship, message, and altar call.',
    startTime: new Date('2025-03-02T09:30:00'),
    endTime: new Date('2025-03-02T12:00:00'),
    location: 'Main Sanctuary',
    type: 'SERVICE',
    status: 'upcoming',
    rsvpEnabled: false,
    visibilityScope: 'PUBLIC',
    isRecurring: true,
    seriesLabel: 'Part of Cross to Commission Series',
    organizer: 'Pastor Philip Anthony Mitchell',
    organizerTitle: 'Founder & Lead Pastor',
    attendeeCount: 1400,
  },
  {
    id: 'ce-007',
    orgId: 'org-icc',
    campusId: 'campus-kcc',
    campusName: '2819 Church',
    ministryId: 'min-002',
    ministryName: 'Formation Kids',
    title: "Formation Kids Children's Church",
    description:
      'Kids worship and Bible lessons during main service. Ages 3\u201312 welcome. Drop-off begins at 9:15 AM.',
    startTime: new Date('2025-03-02T09:30:00'),
    endTime: new Date('2025-03-02T11:30:00'),
    location: "Children's Wing",
    type: 'MINISTRY',
    status: 'upcoming',
    rsvpEnabled: false,
    visibilityScope: 'PUBLIC',
    isRecurring: true,
    seriesLabel: "Weekly Children's Church",
    organizer: 'Sister Angela Davis',
    organizerTitle: "Children's Ministry Director",
    attendeeCount: 38,
    roleAssignment: {
      role: "Children's Teacher",
      room: 'Room B2',
      checkInTime: '8:30 AM',
      coordinator: 'Sister Angela Davis',
    },
  },
  {
    id: 'ce-012',
    orgId: 'org-icc',
    campusId: 'campus-kcc',
    campusName: '2819 Church',
    ministryId: 'min-singles',
    ministryName: 'Single & Purposeful',
    title: 'Single & Purposeful \u2014 Social Mixer',
    description:
      'Game night and fellowship for singles ministry. Potluck style \u2014 bring a dish to share! Icebreakers, board games, and a short devotional.',
    startTime: new Date('2025-03-07T18:30:00'),
    endTime: new Date('2025-03-07T21:00:00'),
    location: 'Fellowship Hall',
    type: 'MINISTRY',
    status: 'upcoming',
    rsvpEnabled: true,
    visibilityScope: 'PUBLIC',
    organizer: 'Minister Desiree Hamilton',
    organizerTitle: 'Singles Ministry Leader',
    attendeeCount: 28,
  },
  {
    id: 'ce-008',
    orgId: 'org-icc',
    campusId: 'campus-kcc',
    campusName: '2819 Church',
    title: 'Community Outreach',
    description:
      'Monthly feeding program and clothing distribution. Volunteers meet at 7:30 AM for setup. Serving starts at 9:00 AM. All are welcome to serve.',
    startTime: new Date('2025-03-08T08:00:00'),
    endTime: new Date('2025-03-08T13:00:00'),
    location: 'West End Community Center',
    type: 'OUTREACH',
    status: 'upcoming',
    rsvpEnabled: true,
    visibilityScope: 'PUBLIC',
    organizer: 'Deacon Raymond Shaw',
    organizerTitle: 'Outreach Director',
    attendeeCount: 45,
    mediaItems: [
      { id: 'med-001', title: 'Volunteer Guide (PDF)', type: 'document' },
      { id: 'med-002', title: 'Outreach Promo Video', type: 'video' },
    ],
  },
  {
    id: 'ce-014',
    orgId: 'org-icc',
    campusId: 'campus-kcc',
    campusName: '2819 Church',
    title: 'Water Baptism Service',
    description:
      'Monthly baptism service. Register through the church app or Welcome Desk. Bring a change of clothes and a towel. Family and friends welcome.',
    startTime: new Date('2025-03-16T14:00:00'),
    endTime: new Date('2025-03-16T16:00:00'),
    location: 'Main Sanctuary \u2014 Baptismal Pool',
    type: 'SERVICE',
    status: 'upcoming',
    rsvpEnabled: true,
    visibilityScope: 'PUBLIC',
    organizer: 'Pastor Philip Anthony Mitchell',
    organizerTitle: 'Founder & Lead Pastor',
    attendeeCount: 85,
    mediaItems: [
      { id: 'med-003', title: 'Baptism Info Sheet', type: 'document' },
    ],
  },
];

// =============================================================================
// HELPERS
// =============================================================================

/** Look up an enriched ChurchEvent by its calendar event ID */
export function getEnrichedEvent(calendarEventId: string): ChurchEvent | undefined {
  return CHURCH_EVENTS.find((e) => e.id === calendarEventId);
}

/** Convert a ProgramCalendarEvent to a basic ChurchEvent for detail display */
export function fromCalendarEvent(ce: ProgramCalendarEvent): ChurchEvent {
  return {
    id: ce.id,
    orgId: 'org-icc',
    campusId: 'campus-kcc',
    campusName: '2819 Church',
    title: ce.title,
    description: ce.description || '',
    startTime: ce.startDatetime,
    endTime: ce.endDatetime,
    location: ce.location || '',
    type: 'OTHER',
    status: ce.startDatetime > new Date() ? 'upcoming' : 'completed',
    rsvpEnabled: false,
    visibilityScope: 'PUBLIC',
    organizer: '2819 Church',
  };
}
