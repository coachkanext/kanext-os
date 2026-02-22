/**
 * Mock Church V2 Data — Complete data layer for Church Mode.
 * Organizations | Ministries | Members | Services | Follow-Ups |
 * Incidents | Assignments | Prayer Requests | Notes | Agenda | Checklists
 */

// =============================================================================
// CHURCH ORG TYPES
// =============================================================================

export interface ChurchOrg {
  id: string;
  name: string;
  abbreviation: string;
  campus: string;
  city: string;
  state: string;
  status: 'active' | 'inactive';
}

// =============================================================================
// MINISTRY TYPES
// =============================================================================

export interface Ministry {
  id: string;
  name: string;
  orgId: string;
  campus: string;
  status: 'active' | 'seasonal' | 'paused';
  mission: string;
  goals: string[];
  activeVolunteers: number;
  upcomingEvents: number;
  openBlockers: number;
}

// =============================================================================
// CHURCH MEMBER TYPES
// =============================================================================

export interface ChurchMember {
  id: string;
  name: string;
  orgId: string;
  type: 'visitor' | 'member' | 'volunteer' | 'leader' | 'staff';
  status: 'active' | 'visitor' | 'inactive' | 'under_review';
  phone?: string;
  email?: string;
  ministries: string[];
  safetyClearance: 'cleared' | 'pending' | 'restricted';
  lastAttendance?: string;
  followUpCount: number;
  baptized: boolean;
  membershipStatus: 'full' | 'provisional' | 'none';
  photo?: string;
}

// =============================================================================
// SERVICE / EVENT TYPES
// =============================================================================

export interface ServiceEvent {
  id: string;
  title: string;
  orgId: string;
  ministryId?: string;
  campus: string;
  location: string;
  date: string;
  time: string;
  status: 'upcoming' | 'live' | 'completed';
  owner: string;
  staffingNeeded: number;
  staffingFilled: number;
  safetyCleared: boolean;
}

// =============================================================================
// FOLLOW-UP TYPES
// =============================================================================

export interface FollowUp {
  id: string;
  memberId: string;
  date: string;
  owner: string;
  summary: string;
  outcome?: string;
  nextStep?: string;
  category: 'new_visitor' | 'returning' | 'prayer_request' | 'hospital' | 'counseling' | 'discipline' | 'other';
}

// =============================================================================
// INCIDENT TYPES
// =============================================================================

export interface ChurchIncident {
  id: string;
  serviceId: string;
  date: string;
  type: 'child_safety' | 'medical' | 'conflict' | 'property' | 'other';
  sensitivity: 'public' | 'restricted' | 'confidential';
  title: string;
  description: string;
  owner: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
}

// =============================================================================
// VOLUNTEER ASSIGNMENT TYPES
// =============================================================================

export interface VolunteerAssignment {
  id: string;
  memberId: string;
  serviceId: string;
  role: string;
  status: 'assigned' | 'confirmed' | 'declined';
}

// =============================================================================
// PRAYER REQUEST TYPES
// =============================================================================

export interface PrayerRequest {
  id: string;
  memberId: string;
  date: string;
  text: string;
  visibility: 'private' | 'ministry' | 'staff';
}

// =============================================================================
// MINISTRY NOTE TYPES
// =============================================================================

export interface MinistryNote {
  id: string;
  ministryId: string;
  date: string;
  author: string;
  content: string;
}

// =============================================================================
// AGENDA BLOCK TYPES
// =============================================================================

export interface AgendaBlock {
  id: string;
  serviceId: string;
  time: string;
  title: string;
  type: 'setup' | 'doors' | 'worship' | 'teaching' | 'small_groups' | 'teardown' | 'offering' | 'announcements';
  owner?: string;
}

// =============================================================================
// OPS CHECKLIST TYPES
// =============================================================================

export interface OpsChecklist {
  id: string;
  serviceId: string;
  category: 'setup' | 'supplies' | 'room' | 'safety';
  item: string;
  completed: boolean;
  assignee?: string;
}

// =============================================================================
// CHURCH ORGS DATA
// =============================================================================

export const CHURCH_ORGS: ChurchOrg[] = [
  {
    id: 'kcc',
    name: '2819 Church',
    abbreviation: '2819 Church',
    campus: 'Atlanta',
    city: 'Atlanta',
    state: 'GA',
    status: 'active',
  },
];

// =============================================================================
// MINISTRIES DATA
// =============================================================================

export const MINISTRIES: Ministry[] = [
  {
    id: 'min-children-kcc',
    name: 'Formation Kids',
    orgId: 'kcc',
    campus: 'Atlanta',
    status: 'active',
    mission: 'Nurturing the next generation through age-appropriate Bible teaching, creative activities, and a safe environment where every child knows they are loved.',
    goals: [
      'Maintain 1:5 adult-to-child ratio every Sunday',
      'Complete new volunteer onboarding by March',
      'Launch summer VBS program',
    ],
    activeVolunteers: 8,
    upcomingEvents: 2,
    openBlockers: 1,
  },
  {
    id: 'min-youth-kcc',
    name: 'Youth Ministry',
    orgId: 'kcc',
    campus: 'Atlanta',
    status: 'active',
    mission: 'Equipping teens to own their faith, build authentic community, and serve boldly in their schools and neighborhoods.',
    goals: [
      'Grow Friday night attendance to 30 students',
      'Launch peer mentorship program',
      'Plan spring retreat',
    ],
    activeVolunteers: 6,
    upcomingEvents: 1,
    openBlockers: 0,
  },
  {
    id: 'min-singles-kcc',
    name: 'Squads',
    orgId: 'kcc',
    campus: 'Atlanta',
    status: 'active',
    mission: 'Creating a welcoming space for single adults to grow spiritually, connect relationally, and serve the church and community together.',
    goals: [
      'Host monthly fellowship event',
      'Launch small group Bible study track',
      'Coordinate community service projects quarterly',
    ],
    activeVolunteers: 4,
    upcomingEvents: 1,
    openBlockers: 0,
  },
];

// =============================================================================
// CHURCH MEMBERS DATA
// =============================================================================

export const CHURCH_MEMBERS: ChurchMember[] = [
  // --- Leaders ---
  {
    id: 'mbr-tolu',
    name: 'Thomas Davis',
    orgId: 'kcc',
    type: 'leader',
    status: 'active',
    phone: '(310) 555-0201',
    email: 'thomas.davis@2819church.org',
    ministries: ['min-children-kcc'],
    safetyClearance: 'cleared',
    lastAttendance: '2026-02-16',
    followUpCount: 0,
    baptized: true,
    membershipStatus: 'full',
  },
  {
    id: 'mbr-kevin',
    name: 'Kevin Scott',
    orgId: 'kcc',
    type: 'leader',
    status: 'active',
    phone: '(310) 555-0202',
    email: 'kevin.scott@2819church.org',
    ministries: ['min-youth-kcc'],
    safetyClearance: 'cleared',
    lastAttendance: '2026-02-16',
    followUpCount: 0,
    baptized: true,
    membershipStatus: 'full',
  },
  {
    id: 'mbr-grace',
    name: 'Grace Wilson',
    orgId: 'kcc',
    type: 'leader',
    status: 'active',
    phone: '(310) 555-0203',
    email: 'grace.wilson@2819church.org',
    ministries: ['min-singles-kcc'],
    safetyClearance: 'cleared',
    lastAttendance: '2026-02-16',
    followUpCount: 0,
    baptized: true,
    membershipStatus: 'full',
  },
  // --- Volunteers ---
  {
    id: 'mbr-james',
    name: 'James Okoro',
    orgId: 'kcc',
    type: 'volunteer',
    status: 'active',
    phone: '(310) 555-0301',
    email: 'james.okoro@gmail.com',
    ministries: ['min-children-kcc'],
    safetyClearance: 'cleared',
    lastAttendance: '2026-02-16',
    followUpCount: 0,
    baptized: true,
    membershipStatus: 'full',
  },
  {
    id: 'mbr-amara',
    name: 'Amara Diallo',
    orgId: 'kcc',
    type: 'volunteer',
    status: 'active',
    phone: '(310) 555-0302',
    email: 'amara.diallo@gmail.com',
    ministries: ['min-children-kcc', 'min-youth-kcc'],
    safetyClearance: 'cleared',
    lastAttendance: '2026-02-09',
    followUpCount: 0,
    baptized: true,
    membershipStatus: 'full',
  },
  {
    id: 'mbr-david',
    name: 'David Mensah',
    orgId: 'kcc',
    type: 'volunteer',
    status: 'active',
    phone: '(310) 555-0303',
    email: 'david.mensah@gmail.com',
    ministries: ['min-youth-kcc'],
    safetyClearance: 'cleared',
    lastAttendance: '2026-02-16',
    followUpCount: 0,
    baptized: true,
    membershipStatus: 'full',
  },
  {
    id: 'mbr-chioma',
    name: 'Chioma Eze',
    orgId: 'kcc',
    type: 'volunteer',
    status: 'active',
    phone: '(310) 555-0304',
    email: 'chioma.eze@gmail.com',
    ministries: ['min-singles-kcc'],
    safetyClearance: 'pending',
    lastAttendance: '2026-02-16',
    followUpCount: 0,
    baptized: true,
    membershipStatus: 'full',
  },
  // --- Regular Members ---
  {
    id: 'mbr-ade',
    name: 'Ade Fashola',
    orgId: 'kcc',
    type: 'member',
    status: 'active',
    phone: '(310) 555-0401',
    email: 'ade.fashola@gmail.com',
    ministries: [],
    safetyClearance: 'cleared',
    lastAttendance: '2026-02-16',
    followUpCount: 0,
    baptized: true,
    membershipStatus: 'full',
  },
  {
    id: 'mbr-yemi',
    name: 'Yemi Akinwale',
    orgId: 'kcc',
    type: 'member',
    status: 'active',
    phone: '(310) 555-0402',
    email: 'yemi.akinwale@gmail.com',
    ministries: [],
    safetyClearance: 'cleared',
    lastAttendance: '2026-02-09',
    followUpCount: 1,
    baptized: true,
    membershipStatus: 'full',
  },
  {
    id: 'mbr-sola',
    name: 'Sola Ogunleye',
    orgId: 'kcc',
    type: 'member',
    status: 'active',
    phone: '(310) 555-0403',
    email: 'sola.ogunleye@gmail.com',
    ministries: [],
    safetyClearance: 'cleared',
    lastAttendance: '2026-01-26',
    followUpCount: 0,
    baptized: false,
    membershipStatus: 'provisional',
  },
  {
    id: 'mbr-emeka',
    name: 'Emeka Chukwu',
    orgId: 'kcc',
    type: 'member',
    status: 'active',
    phone: '(310) 555-0405',
    email: 'emeka.chukwu@gmail.com',
    ministries: [],
    safetyClearance: 'cleared',
    lastAttendance: '2026-02-16',
    followUpCount: 0,
    baptized: true,
    membershipStatus: 'full',
  },
  // --- Visitors ---
  {
    id: 'mbr-michael',
    name: 'Michael Okafor',
    orgId: 'kcc',
    type: 'visitor',
    status: 'visitor',
    phone: '(310) 555-0501',
    email: 'michael.okafor@gmail.com',
    ministries: [],
    safetyClearance: 'cleared',
    lastAttendance: '2026-02-16',
    followUpCount: 1,
    baptized: false,
    membershipStatus: 'none',
  },
  {
    id: 'mbr-rita',
    name: 'Rita Onyekachi',
    orgId: 'kcc',
    type: 'visitor',
    status: 'visitor',
    phone: '(310) 555-0502',
    ministries: [],
    safetyClearance: 'cleared',
    lastAttendance: '2026-02-02',
    followUpCount: 0,
    baptized: false,
    membershipStatus: 'none',
  },
];

// =============================================================================
// SERVICE EVENTS DATA
// =============================================================================

export const SERVICE_EVENTS: ServiceEvent[] = [
  {
    id: 'svc-sunday-main',
    title: 'Sunday Service \u00B7 10AM',
    orgId: 'kcc',
    campus: 'Atlanta',
    location: 'Main Sanctuary',
    date: '2026-02-22',
    time: '10:00 AM',
    status: 'upcoming',
    owner: 'mbr-tolu',
    staffingNeeded: 12,
    staffingFilled: 10,
    safetyCleared: true,
  },
  {
    id: 'svc-children-sunday',
    title: 'Children\'s Church \u00B7 Sunday',
    orgId: 'kcc',
    ministryId: 'min-children-kcc',
    campus: 'Atlanta',
    location: 'Fellowship Hall B',
    date: '2026-02-22',
    time: '10:00 AM',
    status: 'upcoming',
    owner: 'mbr-tolu',
    staffingNeeded: 6,
    staffingFilled: 5,
    safetyCleared: true,
  },
  {
    id: 'svc-youth-friday',
    title: 'Youth Night \u00B7 Friday',
    orgId: 'kcc',
    ministryId: 'min-youth-kcc',
    campus: 'Atlanta',
    location: 'Youth Room',
    date: '2026-02-20',
    time: '7:00 PM',
    status: 'upcoming',
    owner: 'mbr-kevin',
    staffingNeeded: 4,
    staffingFilled: 4,
    safetyCleared: true,
  },
];

// =============================================================================
// FOLLOW-UPS DATA
// =============================================================================

export const FOLLOW_UPS: FollowUp[] = [
  {
    id: 'fu-1',
    memberId: 'mbr-michael',
    date: '2026-02-16',
    owner: 'mbr-tolu',
    summary: 'First-time visitor Michael Okafor attended Sunday service. Connected with the greeting team and expressed interest in learning more about the church.',
    nextStep: 'Invite to newcomers lunch next Sunday',
    category: 'new_visitor',
  },
  {
    id: 'fu-2',
    memberId: 'mbr-yemi',
    date: '2026-02-10',
    owner: 'mbr-tolu',
    summary: 'Visited Sister Yemi at Grady Memorial after her surgery. She is recovering well and in good spirits. Family is with her.',
    outcome: 'Visited, doing better',
    nextStep: 'Check in again mid-week by phone',
    category: 'hospital',
  },
];

// =============================================================================
// CHURCH INCIDENTS DATA
// =============================================================================

export const CHURCH_INCIDENTS: ChurchIncident[] = [
  {
    id: 'inc-1',
    serviceId: 'svc-children-sunday',
    date: '2026-02-09',
    type: 'child_safety',
    sensitivity: 'restricted',
    title: 'Unauthorized pickup attempt',
    description: 'An adult not on the approved pickup list attempted to collect a child from the K-2 classroom. Volunteer followed protocol, denied release, and contacted the custodial parent who confirmed the individual was not authorized. Child remained safe at all times.',
    owner: 'mbr-tolu',
    status: 'investigating',
  },
];

// =============================================================================
// VOLUNTEER ASSIGNMENTS DATA
// =============================================================================

export const VOLUNTEER_ASSIGNMENTS: VolunteerAssignment[] = [
  // Sunday Service assignments
  {
    id: 'va-1',
    memberId: 'mbr-ade',
    serviceId: 'svc-sunday-main',
    role: 'usher',
    status: 'confirmed',
  },
  {
    id: 'va-2',
    memberId: 'mbr-emeka',
    serviceId: 'svc-sunday-main',
    role: 'greeter',
    status: 'confirmed',
  },
  {
    id: 'va-3',
    memberId: 'mbr-grace',
    serviceId: 'svc-sunday-main',
    role: 'worship_team',
    status: 'confirmed',
  },
  {
    id: 'va-4',
    memberId: 'mbr-yemi',
    serviceId: 'svc-sunday-main',
    role: 'tech',
    status: 'assigned',
  },
  // Children's Church assignments
  {
    id: 'va-5',
    memberId: 'mbr-tolu',
    serviceId: 'svc-children-sunday',
    role: 'kids_classroom',
    status: 'confirmed',
  },
  {
    id: 'va-6',
    memberId: 'mbr-james',
    serviceId: 'svc-children-sunday',
    role: 'kids_classroom',
    status: 'confirmed',
  },
  {
    id: 'va-7',
    memberId: 'mbr-amara',
    serviceId: 'svc-children-sunday',
    role: 'kids_classroom',
    status: 'confirmed',
  },
  // Youth Night assignments
  {
    id: 'va-8',
    memberId: 'mbr-kevin',
    serviceId: 'svc-youth-friday',
    role: 'youth_small_group',
    status: 'confirmed',
  },
  {
    id: 'va-9',
    memberId: 'mbr-david',
    serviceId: 'svc-youth-friday',
    role: 'youth_small_group',
    status: 'confirmed',
  },
  {
    id: 'va-10',
    memberId: 'mbr-amara',
    serviceId: 'svc-youth-friday',
    role: 'worship_team',
    status: 'assigned',
  },
];

// =============================================================================
// PRAYER REQUESTS DATA
// =============================================================================

export const PRAYER_REQUESTS: PrayerRequest[] = [
  {
    id: 'pr-1',
    memberId: 'mbr-yemi',
    date: '2026-02-10',
    text: 'Please pray for a smooth recovery after my surgery. Grateful for the church family checking in on me.',
    visibility: 'ministry',
  },
  {
    id: 'pr-2',
    memberId: 'mbr-sola',
    date: '2026-02-14',
    text: 'Praying for direction regarding a job transition. Would appreciate prayers for wisdom and open doors.',
    visibility: 'private',
  },
];

// =============================================================================
// MINISTRY NOTES DATA
// =============================================================================

export const MINISTRY_NOTES: MinistryNote[] = [
  {
    id: 'mn-1',
    ministryId: 'min-children-kcc',
    date: '2026-02-15',
    author: 'mbr-tolu',
    content: 'Discussed volunteer rotation schedule for March. Need to finalize the spring VBS theme by end of month. James offered to lead the craft station. Background check for Chioma still pending — follow up with admin.',
  },
  {
    id: 'mn-2',
    ministryId: 'min-youth-kcc',
    date: '2026-02-14',
    author: 'mbr-kevin',
    content: 'Youth attendance trending up — 24 students last Friday, up from 18 a month ago. Small group leaders report deeper conversations. Planning a combined youth + singles service project for March. Need to confirm venue for spring retreat by Feb 28.',
  },
];

// =============================================================================
// AGENDA BLOCKS DATA — Sunday Service
// =============================================================================

export const AGENDA_BLOCKS: AgendaBlock[] = [
  {
    id: 'ab-1',
    serviceId: 'svc-sunday-main',
    time: '8:00 AM',
    title: 'Setup + Sound Check',
    type: 'setup',
    owner: 'mbr-emeka',
  },
  {
    id: 'ab-2',
    serviceId: 'svc-sunday-main',
    time: '9:30 AM',
    title: 'Doors Open + Greeting',
    type: 'doors',
    owner: 'mbr-ade',
  },
  {
    id: 'ab-3',
    serviceId: 'svc-sunday-main',
    time: '10:00 AM',
    title: 'Worship + Praise',
    type: 'worship',
    owner: 'mbr-grace',
  },
  {
    id: 'ab-4',
    serviceId: 'svc-sunday-main',
    time: '10:30 AM',
    title: 'Tithes + Offering',
    type: 'offering',
  },
  {
    id: 'ab-5',
    serviceId: 'svc-sunday-main',
    time: '10:40 AM',
    title: 'Word + Teaching',
    type: 'teaching',
    owner: 'mbr-tolu',
  },
  {
    id: 'ab-6',
    serviceId: 'svc-sunday-main',
    time: '11:20 AM',
    title: 'Announcements + Benediction',
    type: 'announcements',
    owner: 'mbr-tolu',
  },
  {
    id: 'ab-7',
    serviceId: 'svc-sunday-main',
    time: '11:40 AM',
    title: 'Teardown + Cleanup',
    type: 'teardown',
    owner: 'mbr-emeka',
  },
];

// =============================================================================
// OPS CHECKLISTS DATA — Sunday Service
// =============================================================================

export const OPS_CHECKLISTS: OpsChecklist[] = [
  {
    id: 'oc-1',
    serviceId: 'svc-sunday-main',
    category: 'setup',
    item: 'Stage platform and podium positioned',
    completed: true,
    assignee: 'mbr-emeka',
  },
  {
    id: 'oc-2',
    serviceId: 'svc-sunday-main',
    category: 'setup',
    item: 'Sound system powered on + mic check',
    completed: false,
    assignee: 'mbr-yemi',
  },
  {
    id: 'oc-3',
    serviceId: 'svc-sunday-main',
    category: 'supplies',
    item: 'Communion elements prepared (bread + juice)',
    completed: true,
  },
  {
    id: 'oc-4',
    serviceId: 'svc-sunday-main',
    category: 'supplies',
    item: 'Visitor welcome packets stocked (15 minimum)',
    completed: true,
    assignee: 'mbr-ade',
  },
  {
    id: 'oc-5',
    serviceId: 'svc-sunday-main',
    category: 'room',
    item: 'Sanctuary seating arranged (200 chairs)',
    completed: true,
    assignee: 'mbr-emeka',
  },
  {
    id: 'oc-6',
    serviceId: 'svc-sunday-main',
    category: 'room',
    item: "Children's classrooms unlocked and prepped",
    completed: false,
    assignee: 'mbr-tolu',
  },
  {
    id: 'oc-7',
    serviceId: 'svc-sunday-main',
    category: 'safety',
    item: 'Fire exits clear and signage visible',
    completed: true,
  },
  {
    id: 'oc-8',
    serviceId: 'svc-sunday-main',
    category: 'safety',
    item: 'First aid kit restocked and accessible',
    completed: true,
  },
];

// =============================================================================
// HELPERS
// =============================================================================

export function getChurchOrgById(id: string): ChurchOrg | undefined {
  return CHURCH_ORGS.find((o) => o.id === id);
}

export function getMinistriesByOrg(orgId: string): Ministry[] {
  return MINISTRIES.filter((m) => m.orgId === orgId);
}

export function getMembersByMinistry(ministryId: string): ChurchMember[] {
  return CHURCH_MEMBERS.filter((m) => m.ministries.includes(ministryId));
}

export function getServicesByOrg(orgId: string): ServiceEvent[] {
  return SERVICE_EVENTS.filter((s) => s.orgId === orgId);
}

export function getFollowUpsByMember(memberId: string): FollowUp[] {
  return FOLLOW_UPS.filter((f) => f.memberId === memberId);
}

export function getAssignmentsByService(serviceId: string): VolunteerAssignment[] {
  return VOLUNTEER_ASSIGNMENTS.filter((a) => a.serviceId === serviceId);
}

export function getIncidentsByService(serviceId: string): ChurchIncident[] {
  return CHURCH_INCIDENTS.filter((i) => i.serviceId === serviceId);
}

export function getAgendaByService(serviceId: string): AgendaBlock[] {
  return AGENDA_BLOCKS.filter((a) => a.serviceId === serviceId);
}

export function getChecklistByService(serviceId: string): OpsChecklist[] {
  return OPS_CHECKLISTS.filter((c) => c.serviceId === serviceId);
}

export function getMembersNeedingFollowUp(): ChurchMember[] {
  return CHURCH_MEMBERS.filter((m) => m.followUpCount > 0 || m.status === 'visitor');
}

export function getStaffingShortages(): ServiceEvent[] {
  return SERVICE_EVENTS.filter((s) => s.staffingFilled < s.staffingNeeded);
}
