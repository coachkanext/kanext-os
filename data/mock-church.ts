/**
 * Mock Church Data
 * International Christian Center (ICC) information for Church mode.
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
  name: 'International Christian Center',
  mode: 'church',
  type: 'Church',
  location: 'Los Angeles, CA',
  description:
    'International Christian Center is a vibrant, multicultural church committed to reaching the nations with the love of Christ. Founded in 1985, ICC has grown to serve communities across Los Angeles and internationally through our campuses and outreach ministries.',
  denomination: 'Non-Denominational',
  campuses: [],
};

// =============================================================================
// CAMPUSES
// =============================================================================

export const CAMPUSES: Campus[] = [
  {
    id: 'iccla',
    name: 'ICC Los Angeles',
    shortName: 'ICCLA',
    location: 'Los Angeles, CA',
    address: '2361 W. 76th Street, Los Angeles, CA 90043',
    description: 'Our flagship campus in the heart of Los Angeles, serving the community since 1985.',
    serviceTimes: [
      { day: 'Sunday', time: '8:00 AM', service: 'Early Morning Service', campusId: 'iccla' },
      { day: 'Sunday', time: '10:30 AM', service: 'Main Service', campusId: 'iccla' },
      { day: 'Wednesday', time: '7:00 PM', service: 'Midweek Service', campusId: 'iccla' },
    ],
  },
];

// =============================================================================
// MINISTRIES
// =============================================================================

export const MINISTRIES: Ministry[] = [
  {
    id: 'ministry-children',
    name: "Children's Church",
    description: 'Engaging and age-appropriate Bible teaching for children ages 2-12.',
    type: 'childrens',
    icon: 'figure.and.child.holdinghands',
  },
  {
    id: 'ministry-youth',
    name: 'Teens/Youth',
    description: 'Building the next generation of leaders through fellowship and discipleship.',
    type: 'youth',
    icon: 'person.3.fill',
  },
  {
    id: 'ministry-singles',
    name: 'Singles Ministry',
    description: 'A community for single adults to grow in faith and fellowship.',
    type: 'singles',
    icon: 'person.fill',
  },
  {
    id: 'ministry-prayer',
    name: 'Hotline to Heaven',
    description: 'Our 24/7 prayer ministry - we believe in the power of prayer.',
    type: 'prayer',
    icon: 'phone.fill',
    accessMethods: [
      'Call: (800) ICC-PRAY',
      'Text: PRAY to 55555',
      'Online: icc.org/prayer',
      'In-Person: Prayer Room open daily',
    ],
  },
  {
    id: 'ministry-outreach',
    name: 'Foundation/Outreach',
    description: 'Serving our local community and supporting missions worldwide.',
    type: 'outreach',
    icon: 'heart.fill',
  },
  {
    id: 'ministry-worship',
    name: 'Worship Ministry',
    description: 'Leading the congregation in Spirit-filled worship every service.',
    type: 'worship',
    icon: 'music.note',
  },
  {
    id: 'ministry-missions',
    name: 'Global Missions',
    description: 'Supporting missionaries and mission work around the world.',
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
    speaker: 'Pastor Dipo Kalejaiye',
    date: new Date('2026-02-02'),
    mediaType: 'video',
    seriesName: 'Faith Forward',
    duration: '45:32',
  },
  {
    id: 'msg-2',
    title: 'The Power of Prayer',
    speaker: 'Pastor Dipo Kalejaiye',
    date: new Date('2026-01-26'),
    mediaType: 'video',
    seriesName: 'Faith Forward',
    duration: '52:18',
  },
  {
    id: 'msg-3',
    title: 'Living with Purpose',
    speaker: 'Pastor Sarah Chen',
    date: new Date('2026-01-19'),
    mediaType: 'video',
    seriesName: 'New Year, New You',
    duration: '41:05',
  },
  {
    id: 'msg-4',
    title: 'Fresh Start',
    speaker: 'Pastor Dipo Kalejaiye',
    date: new Date('2026-01-12'),
    mediaType: 'video',
    seriesName: 'New Year, New You',
    duration: '48:22',
  },
  {
    id: 'msg-5',
    title: 'Year in Review',
    speaker: 'Pastor Dipo Kalejaiye',
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
    externalUrl: 'https://icc.org/give/tithe',
  },
  {
    id: 'giving-offering',
    type: 'offering',
    name: 'General Offering',
    description: 'Support the ongoing work of the ministry',
    externalUrl: 'https://icc.org/give/offering',
  },
  {
    id: 'giving-missions',
    type: 'missions',
    name: 'Missions Fund',
    description: 'Support global missionary work',
    externalUrl: 'https://icc.org/give/missions',
  },
  {
    id: 'giving-building',
    type: 'fundraiser',
    name: 'Building Fund',
    description: 'Help expand our facilities',
    externalUrl: 'https://icc.org/give/building',
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
    name: 'Pastor Dipo Kalejaiye',
    title: 'Senior Pastor',
    role: 'senior_pastor',
    bio: 'Pastor Michael has led ICC since 1995 with a heart for the nations.',
  },
  {
    id: 'leader-2',
    name: 'Pastor Sarah Chen',
    title: 'Associate Pastor',
    role: 'associate_pastor',
    bio: 'Pastor Sarah oversees discipleship and small groups ministry.',
  },
  {
    id: 'leader-4',
    name: 'Elder James Thompson',
    title: 'Elder Board Chairman',
    role: 'elder',
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
