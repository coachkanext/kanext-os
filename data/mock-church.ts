/**
 * Mock Church Data
 * 2819 Church (2819 Church) information for Church mode.
 */

import type {
  ChurchOrganization,
  Campus,
  Ministry,
  ServiceTime,
  ChurchMessage,
  GivingOption,
  ActivityItem,
} from '@/types';

// =============================================================================
// ORGANIZATION
// =============================================================================

export const ICC_ORGANIZATION: ChurchOrganization = {
  id: 'icc-001',
  name: '2819 Church',
  mode: 'church',
  type: 'Faith',
  location: 'Atlanta, GA',
  description:
    '2819 Church — named from the Great Commission of Matthew 28:19 — was founded on February 22, 2012 by Pastor Philip Anthony Mitchell with just 11 believers. Today the church serves over 6,000 weekly in-person and 75,000+ online from Atlanta, GA with one mandate: Until All Have Heard.',
  denomination: 'Non-Denominational',
  campuses: [],
};

// =============================================================================
// CAMPUSES
// =============================================================================

export const CAMPUSES: Campus[] = [
  {
    id: 'kcc',
    name: '2819 Church',
    shortName: '2819 Church',
    location: 'Atlanta, GA',
    address: '3350 Greenbriar Pkwy SW, Atlanta, GA 30331',
    description: 'Our flagship campus in Atlanta, serving the community since February 2012. Home of ACCESS, CONSECRATION, and the London Crusade.',
    serviceTimes: [
      { day: 'Sunday', time: '8:00 AM', service: 'First Service', campusId: 'kcc' },
      { day: 'Sunday', time: '10:30 AM', service: 'Second Service', campusId: 'kcc' },
      { day: 'Sunday', time: '1:00 PM', service: 'Third Service', campusId: 'kcc' },
    ],
  },
];

// =============================================================================
// MINISTRIES
// =============================================================================

export const MINISTRIES: Ministry[] = [
  {
    id: 'ministry-children',
    name: 'Formation Kids',
    description: 'Age-appropriate Bible teaching, worship, and creative discipleship for children ages 2-12.',
    type: 'childrens',
    icon: 'figure.and.child.holdinghands',
  },
  {
    id: 'ministry-youth',
    name: 'Youth Ministry',
    description: 'Building the next generation of leaders through fellowship, mentorship, and discipleship.',
    type: 'youth',
    icon: 'person.3.fill',
  },
  {
    id: 'ministry-singles',
    name: 'Squads',
    description: 'Small groups connecting believers across Atlanta for shared study, prayer, and life together.',
    type: 'singles',
    icon: 'person.fill',
  },
  {
    id: 'ministry-prayer',
    name: 'SATURATE',
    description: 'Pre-service prayer ministry — saturating every gathering in corporate intercession before worship begins.',
    type: 'prayer',
    icon: 'phone.fill',
    accessMethods: [
      'Sunday 7:40 AM (before 1st Service)',
      'Sunday 10:10 AM (before 2nd Service)',
      'Sunday 12:40 PM (before 3rd Service)',
      'Online: 2819church.org/prayer',
    ],
  },
  {
    id: 'ministry-outreach',
    name: 'Outreach & Evangelism',
    description: 'Boots-on-the-ground evangelism and community impact across Atlanta and beyond.',
    type: 'outreach',
    icon: 'heart.fill',
  },
  {
    id: 'ministry-worship',
    name: 'Serve Teams',
    description: 'Production, hospitality, parking, greeting, and every hands-on role that makes Sunday happen.',
    type: 'worship',
    icon: 'music.note',
  },
  {
    id: 'ministry-missions',
    name: '2819 Institute',
    description: 'Digital discipleship and theological education — equipping believers wherever they are.',
    type: 'missions',
    icon: 'globe',
  },
];

// =============================================================================
// MESSAGES (SERMONS)
// =============================================================================

export const MESSAGES: ChurchMessage[] = [
  {
    id: 'msg-1',
    title: 'Walking in Faith',
    speaker: 'Pastor Philip Anthony Mitchell',
    date: new Date('2026-02-02'),
    mediaType: 'video',
    seriesName: 'Cross to Commission',
    duration: '45:32',
  },
  {
    id: 'msg-2',
    title: 'The Power of Prayer',
    speaker: 'Pastor Philip Anthony Mitchell',
    date: new Date('2026-01-26'),
    mediaType: 'video',
    seriesName: 'Cross to Commission',
    duration: '52:18',
  },
  {
    id: 'msg-3',
    title: 'Living with Purpose',
    speaker: 'Elder Arik Hayes',
    date: new Date('2026-01-19'),
    mediaType: 'video',
    seriesName: 'Cross to Commission',
    duration: '41:05',
  },
  {
    id: 'msg-4',
    title: 'Fresh Start',
    speaker: 'Pastor Philip Anthony Mitchell',
    date: new Date('2026-01-12'),
    mediaType: 'video',
    seriesName: 'Cross to Commission',
    duration: '48:22',
  },
  {
    id: 'msg-5',
    title: 'Year in Review',
    speaker: 'Pastor Philip Anthony Mitchell',
    date: new Date('2025-12-29'),
    mediaType: 'video',
    duration: '38:45',
  },
];

// =============================================================================
// GIVING OPTIONS
// =============================================================================

export const GIVING_OPTIONS: GivingOption[] = [
  {
    id: 'giving-tithe',
    type: 'tithe',
    name: 'Tithes',
    description: 'Honor the Lord with your firstfruits',
    externalUrl: 'https://2819church.org/give/tithe',
  },
  {
    id: 'giving-offering',
    type: 'offering',
    name: 'General Offering',
    description: 'Support the ongoing work of the ministry',
    externalUrl: 'https://2819church.org/give/offering',
  },
  {
    id: 'giving-missions',
    type: 'missions',
    name: 'Missions Fund',
    description: 'Support global missionary work',
    externalUrl: 'https://2819church.org/give/missions',
  },
  {
    id: 'giving-building',
    type: 'fundraiser',
    name: 'Building Fund',
    description: 'Help expand our facilities',
    externalUrl: 'https://2819church.org/give/building',
  },
];

// =============================================================================
// LEADERSHIP
// =============================================================================

export interface ChurchLeader {
  id: string;
  name: string;
  title: string;
  role: 'senior_pastor' | 'associate_pastor' | 'elder' | 'deacon' | 'staff';
  campusId?: string;
  bio?: string;
}

export const CHURCH_LEADERSHIP: ChurchLeader[] = [
  {
    id: 'leader-1',
    name: 'Pastor Philip Anthony Mitchell',
    title: 'Founder & Lead Pastor',
    role: 'senior_pastor',
    bio: 'Pastor Philip Anthony Mitchell founded 2819 Church on Feb 22, 2012 with 11 believers. Today he leads a congregation of 6,000+ weekly with the mandate: Until All Have Heard.',
  },
  {
    id: 'leader-2',
    name: 'Elder Arik Hayes',
    title: 'Elder / Teaching Pastor',
    role: 'associate_pastor',
    bio: 'Elder Arik Hayes serves as a teaching pastor and elder, shepherding the church through expositional teaching and discipleship.',
  },
  {
    id: 'leader-4',
    name: 'Tatjuana Phillips',
    title: 'Ministries Director',
    role: 'staff',
    bio: 'Tatjuana Phillips oversees all ministry operations and volunteer coordination at 2819 Church.',
  },
];

// =============================================================================
// ACTIVITY
// =============================================================================

export const CHURCH_ACTIVITY: ActivityItem[] = [
  {
    id: 'church-act-1',
    type: 'message_posted',
    title: 'New Message',
    description: '"Walking in Faith" - now available online',
    timestamp: new Date('2026-02-03T14:00:00'),
    sourceType: 'media',
    sourceId: 'msg-1',
    route: '/organization/messages',
    organizationId: 'icc-001',
    mode: 'church',
    visibility: ['member', 'staff', 'leadership'],
  },
  {
    id: 'church-act-2',
    type: 'event_updated',
    title: 'Event Updated',
    description: 'Youth retreat registration now open - Feb 15-17',
    timestamp: new Date('2026-02-02T10:00:00'),
    sourceType: 'event',
    sourceId: 'event-youth',
    route: '/organization/ministries/ministry-youth',
    organizationId: 'icc-001',
    mode: 'church',
    visibility: ['member', 'staff', 'leadership'],
  },
  {
    id: 'church-act-3',
    type: 'ministry_updated',
    title: 'Ministry Update',
    description: "Children's Church curriculum update for February",
    timestamp: new Date('2026-02-01T09:00:00'),
    sourceType: 'organization',
    sourceId: 'ministry-children',
    route: '/organization/ministries/ministry-children',
    organizationId: 'icc-001',
    mode: 'church',
    visibility: ['staff', 'leadership'],
  },
  {
    id: 'church-act-4',
    type: 'giving_updated',
    title: 'Giving Campaign',
    description: 'Building fund reached 75% of goal - Thank you!',
    timestamp: new Date('2026-01-30T16:00:00'),
    sourceType: 'system',
    sourceId: 'giving-building',
    route: '/organization/giving',
    organizationId: 'icc-001',
    mode: 'church',
    visibility: ['member', 'staff', 'leadership'],
  },
];

// =============================================================================
// HELPERS
// =============================================================================

export function getCampusById(id: string): Campus | undefined {
  return CAMPUSES.find((c) => c.id === id);
}

export function getMinistriesByType(type: Ministry['type']): Ministry[] {
  return MINISTRIES.filter((m) => m.type === type);
}

export function getServiceTimesForCampus(campusId: string): ServiceTime[] {
  const campus = getCampusById(campusId);
  return campus?.serviceTimes || [];
}

export function formatServiceTime(service: ServiceTime): string {
  return `${service.day} at ${service.time}`;
}

export function getMinistryTypeLabel(type: Ministry['type']): string {
  const labels: Record<Ministry['type'], string> = {
    childrens: 'Children',
    youth: 'Youth',
    singles: 'Singles',
    prayer: 'Prayer',
    outreach: 'Outreach',
    worship: 'Worship',
    missions: 'Missions',
  };
  return labels[type] || type;
}

export function getGivingTypeLabel(type: GivingOption['type']): string {
  const labels: Record<GivingOption['type'], string> = {
    tithe: 'Tithes',
    offering: 'Offerings',
    donation: 'Donations',
    fundraiser: 'Special Campaigns',
    missions: 'Missions',
  };
  return labels[type] || type;
}

export function formatMessageDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
