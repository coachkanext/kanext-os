/**
 * Education Mode — Institutions v2 Mock Data
 *
 * Canonical institution objects, directory data, and hub metadata
 * for the Education Mode institutions workspace.
 * Primary institution: KaNeXT Sports (KaNeXT).
 */

// =============================================================================
// TYPES
// =============================================================================

export type InstitutionStatus = 'active' | 'partner' | 'prospect' | 'archived';

export type InstitutionType = 'university' | 'college' | 'academy' | 'other';

export interface InstitutionScopeChip {
  key: string;
  label: string;
}

export interface InstitutionAdmin {
  id: string;
  name: string;
  initials: string;
  title: string;
  avatarColor: string;
}

export interface InstitutionDepartment {
  id: string;
  institutionId: string;
  name: string;
  chairperson: string;
  programCount: number;
  facultyCount: number;
}

export interface InstitutionEvent {
  id: string;
  institutionId: string;
  title: string;
  date: string;
  time: string;
  type: 'academic' | 'admissions' | 'athletics' | 'cultural' | 'administrative';
  location?: string;
}

export interface InstitutionRoom {
  id: string;
  institutionId: string;
  title: string;
  icon: string;
  memberCount: number;
  unreadCount: number;
}

export interface InstitutionAuditEntry {
  id: string;
  institutionId: string;
  action: string;
  actor: string;
  timestamp: string;
  timestampMs: number;
  description: string;
}

export interface InstitutionFull {
  id: string;
  educationOrgId: string;
  name: string;
  shortName: string;
  logo?: string;
  location: string;
  type: InstitutionType;
  status: InstitutionStatus;
  description: string;
  admins: InstitutionAdmin[];
  peopleCount: number;
  founded: string;
  accreditation?: string;
  avatarColor: string;
  nextKeyDate?: { label: string; date: string };
  hasRooms: boolean;
  hasFilmRoom: boolean;
  hasLibrary: boolean;
  createdAt: string;
  lastActivityAt: string;
  lastActivityMs: number;
}

export type InstitutionHubTabId =
  | 'overview'
  | 'academics'
  | 'admissions'
  | 'student-life'
  | 'departments'
  | 'people'
  | 'events'
  | 'operations'
  | 'finance'
  | 'payment-rails'
  | 'compliance'
  | 'film-room'
  | 'library'
  | 'rooms'
  | 'audit'
  | 'settings';

export interface InstitutionHubTab {
  id: InstitutionHubTabId;
  label: string;
}

export interface InstitutionFilterState {
  statuses: InstitutionStatus[];
  types: InstitutionType[];
  sort: 'az' | 'recent' | 'status';
}

export interface CreateInstitutionDefaults {
  leadershipRoom: boolean;
  admissionsRoom: boolean;
  studentSupportRoom: boolean;
  facilitiesOpsRoom: boolean;
  baseLibraryCollections: boolean;
}

export interface InstitutionAcademics {
  totalPrograms: number;
  undergrad: number;
  graduate: number;
  certificates: number;
  programFormats: string[];
  studentFacultyRatio: string;
}

export interface InstitutionAdmissions {
  acceptanceRate: string;
  avgGPA: string;
  applicationDeadline: string;
  enrollmentTotal: number;
  newStudents: number;
}

export interface InstitutionStudentLife {
  clubs: number;
  athletics: number;
  housingCapacity: number;
  diningPlans: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const INSTITUTION_SCOPE_CHIPS: InstitutionScopeChip[] = [
  { key: 'all', label: 'All Institutions' },
  { key: 'my', label: 'My Institutions' },
];

export const INSTITUTION_HUB_TABS: InstitutionHubTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'academics', label: 'Academics' },
  { id: 'admissions', label: 'Admissions' },
  { id: 'student-life', label: 'Student Life' },
  { id: 'departments', label: 'Departments' },
  { id: 'people', label: 'People' },
  { id: 'events', label: 'Events' },
  { id: 'operations', label: 'Operations' },
  { id: 'finance', label: 'Finance' },
  { id: 'payment-rails', label: 'Payment Rails' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'film-room', label: 'Film Room' },
  { id: 'library', label: 'Library' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'audit', label: 'Audit' },
  { id: 'settings', label: 'Settings' },
];

export const STATUS_COLOR_MAP: Record<InstitutionStatus, string> = {
  active: '#22C55E',
  partner: '#1D9BF0',
  prospect: '#F59E0B',
  archived: '#A1A1AA',
};

export const TYPE_ICON_MAP: Record<InstitutionType, string> = {
  university: 'building.columns.fill',
  college: 'graduationcap.fill',
  academy: 'book.fill',
  other: 'building.2.fill',
};

export const CREATE_DEFAULTS: CreateInstitutionDefaults = {
  leadershipRoom: true,
  admissionsRoom: true,
  studentSupportRoom: true,
  facilitiesOpsRoom: true,
  baseLibraryCollections: true,
};

// =============================================================================
// INSTITUTIONS
// =============================================================================

export const INSTITUTIONS: InstitutionFull[] = [
  {
    id: 'inst-fmu',
    educationOrgId: 'fmu-001',
    name: 'KaNeXT Sports',
    shortName: 'KaNeXT',
    location: 'Nashville, TN',
    type: 'university',
    status: 'active',
    description:
      'KaNeXT Sports is a private historically Black university founded in 1879. KaNeXT offers undergraduate and graduate programs rooted in academic excellence, leadership development, and community service. A member of the UNCF and accredited by SACSCOC.',
    admins: [
      {
        id: 'admin-fmu-1',
        name: 'Dr. Jaffus Hardrick',
        initials: 'JH',
        title: 'President',
        avatarColor: '#1D9BF0',
      },
      {
        id: 'admin-fmu-2',
        name: 'Dr. Patricia Williams',
        initials: 'PW',
        title: 'Provost & VP Academic Affairs',
        avatarColor: '#1D9BF0',
      },
      {
        id: 'admin-fmu-3',
        name: 'Dr. Angela Thomas',
        initials: 'AT',
        title: 'VP Student Affairs',
        avatarColor: '#1D9BF0',
      },
    ],
    peopleCount: 1200,
    founded: '1879',
    accreditation: 'SACSCOC',
    avatarColor: '#1D9BF0',
    nextKeyDate: { label: 'Admissions deadline', date: 'Mar 1' },
    hasRooms: true,
    hasFilmRoom: true,
    hasLibrary: true,
    createdAt: '2024-08-15T10:00:00Z',
    lastActivityAt: '2026-02-15T18:22:00Z',
    lastActivityMs: 1739643720000,
  },
  {
    id: 'inst-sfat',
    educationOrgId: 'sfat-001',
    name: 'South Ridgemont Academy of Technology',
    shortName: 'SFAT',
    location: 'Beacon, FL',
    type: 'academy',
    status: 'prospect',
    description:
      'South Ridgemont Academy of Technology is a career-focused technical academy offering accelerated certificate and associate degree programs in software engineering, cybersecurity, data analytics, and digital media.',
    admins: [
      {
        id: 'admin-sfat-1',
        name: 'Dr. Renee Desmond',
        initials: 'RD',
        title: 'Executive Director',
        avatarColor: '#1D9BF0',
      },
    ],
    peopleCount: 450,
    founded: '2019',
    avatarColor: '#1D9BF0',
    nextKeyDate: { label: 'Site visit', date: 'May 1' },
    hasRooms: false,
    hasFilmRoom: false,
    hasLibrary: false,
    createdAt: '2025-11-20T11:30:00Z',
    lastActivityAt: '2026-02-10T16:00:00Z',
    lastActivityMs: 1739203200000,
  },
];

// =============================================================================
// KaNeXT ACADEMICS
// =============================================================================

export const KaNeXT_ACADEMICS: InstitutionAcademics = {
  totalPrograms: 42,
  undergrad: 34,
  graduate: 6,
  certificates: 2,
  programFormats: ['In-Person', 'Hybrid', 'Online'],
  studentFacultyRatio: '12:1',
};

// =============================================================================
// KaNeXT ADMISSIONS
// =============================================================================

export const KaNeXT_ADMISSIONS: InstitutionAdmissions = {
  acceptanceRate: '42%',
  avgGPA: '3.1',
  applicationDeadline: 'March 1, 2026',
  enrollmentTotal: 1050,
  newStudents: 320,
};

// =============================================================================
// KaNeXT STUDENT LIFE
// =============================================================================

export const KaNeXT_STUDENT_LIFE: InstitutionStudentLife = {
  clubs: 45,
  athletics: 14,
  housingCapacity: 600,
  diningPlans: 3,
};

// =============================================================================
// INSTITUTION DEPARTMENTS
// =============================================================================

export const INSTITUTION_DEPARTMENTS: InstitutionDepartment[] = [
  {
    id: 'dept-fmu-arts',
    institutionId: 'inst-fmu',
    name: 'School of Arts & Sciences',
    chairperson: 'Dr. Michelle Carter',
    programCount: 12,
    facultyCount: 28,
  },
  {
    id: 'dept-fmu-business',
    institutionId: 'inst-fmu',
    name: 'School of Business',
    chairperson: 'Dr. Kenneth Rolle',
    programCount: 8,
    facultyCount: 18,
  },
  {
    id: 'dept-fmu-education',
    institutionId: 'inst-fmu',
    name: 'School of Education',
    chairperson: 'Dr. Beverly Grant',
    programCount: 6,
    facultyCount: 14,
  },
  {
    id: 'dept-fmu-math-sci',
    institutionId: 'inst-fmu',
    name: 'Division of Mathematics & Natural Sciences',
    chairperson: 'Dr. Raymond Lewis',
    programCount: 7,
    facultyCount: 20,
  },
  {
    id: 'dept-fmu-nursing',
    institutionId: 'inst-fmu',
    name: 'School of Nursing',
    chairperson: 'Dr. Gloria Simmons',
    programCount: 4,
    facultyCount: 12,
  },
  {
    id: 'dept-fmu-social-sci',
    institutionId: 'inst-fmu',
    name: 'Division of Social Sciences & Humanities',
    chairperson: 'Dr. Harold Baptiste',
    programCount: 5,
    facultyCount: 16,
  },
];

// =============================================================================
// INSTITUTION EVENTS
// =============================================================================

export const INSTITUTION_EVENTS: InstitutionEvent[] = [
  {
    id: 'evt-fmu-1',
    institutionId: 'inst-fmu',
    title: 'Spring Registration Deadline',
    date: '2026-02-18',
    time: '11:59 PM',
    type: 'academic',
    location: 'Online Portal',
  },
  {
    id: 'evt-fmu-2',
    institutionId: 'inst-fmu',
    title: 'Black History Month Convocation',
    date: '2026-02-20',
    time: '10:00 AM',
    type: 'cultural',
    location: 'KaNeXT Auditorium',
  },
  {
    id: 'evt-fmu-3',
    institutionId: 'inst-fmu',
    title: 'Admissions Open House',
    date: '2026-02-22',
    time: '9:00 AM',
    type: 'admissions',
    location: 'Student Center',
  },
  {
    id: 'evt-fmu-4',
    institutionId: 'inst-fmu',
    title: 'Faculty Senate Meeting',
    date: '2026-02-25',
    time: '2:00 PM',
    type: 'administrative',
    location: 'Board Room',
  },
  {
    id: 'evt-fmu-5',
    institutionId: 'inst-fmu',
    title: 'Admissions Application Deadline',
    date: '2026-03-01',
    time: '11:59 PM',
    type: 'admissions',
    location: 'Online Portal',
  },
  {
    id: 'evt-fmu-6',
    institutionId: 'inst-fmu',
    title: 'Mid-Term Examinations Begin',
    date: '2026-03-09',
    time: '8:00 AM',
    type: 'academic',
  },
  {
    id: 'evt-fmu-7',
    institutionId: 'inst-fmu',
    title: 'SIAC Basketball Tournament',
    date: '2026-03-05',
    time: '6:00 PM',
    type: 'athletics',
    location: 'Conference Venue TBD',
  },
  {
    id: 'evt-fmu-8',
    institutionId: 'inst-fmu',
    title: 'Board of Trustees Meeting',
    date: '2026-03-15',
    time: '10:00 AM',
    type: 'administrative',
    location: 'President\'s Conference Room',
  },
  {
    id: 'evt-fmu-9',
    institutionId: 'inst-fmu',
    title: 'Spring Career Fair',
    date: '2026-03-25',
    time: '10:00 AM',
    type: 'academic',
    location: 'Lou Rawls Center',
  },
  {
    id: 'evt-fmu-10',
    institutionId: 'inst-fmu',
    title: 'Honors Day Ceremony',
    date: '2026-04-03',
    time: '11:00 AM',
    type: 'cultural',
    location: 'KaNeXT Auditorium',
  },
  {
    id: 'evt-fmu-11',
    institutionId: 'inst-fmu',
    title: 'SACSCOC Compliance Review',
    date: '2026-04-10',
    time: '9:00 AM',
    type: 'administrative',
    location: 'Administration Building',
  },
  {
    id: 'evt-fmu-12',
    institutionId: 'inst-fmu',
    title: 'Spring Commencement',
    date: '2026-05-09',
    time: '10:00 AM',
    type: 'academic',
    location: 'KaNeXT Stadium',
  },
  {
    id: 'evt-fmu-13',
    institutionId: 'inst-fmu',
    title: 'Alumni Homecoming Kickoff Planning',
    date: '2026-04-20',
    time: '3:00 PM',
    type: 'administrative',
    location: 'Alumni Relations Office',
  },
  {
    id: 'evt-fmu-14',
    institutionId: 'inst-fmu',
    title: 'Spring Track & Field Invitational',
    date: '2026-03-28',
    time: '1:00 PM',
    type: 'athletics',
    location: 'KaNeXT Track Complex',
  },
  {
    id: 'evt-fmu-15',
    institutionId: 'inst-fmu',
    title: 'Financial Aid Priority Deadline',
    date: '2026-04-01',
    time: '11:59 PM',
    type: 'admissions',
    location: 'Online Portal',
  },
];

// =============================================================================
// INSTITUTION ROOMS
// =============================================================================

export const INSTITUTION_ROOMS: InstitutionRoom[] = [
  {
    id: 'room-fmu-leadership',
    institutionId: 'inst-fmu',
    title: 'Leadership',
    icon: 'crown.fill',
    memberCount: 8,
    unreadCount: 3,
  },
  {
    id: 'room-fmu-admissions',
    institutionId: 'inst-fmu',
    title: 'Admissions',
    icon: 'person.crop.circle.badge.plus',
    memberCount: 12,
    unreadCount: 7,
  },
  {
    id: 'room-fmu-student-support',
    institutionId: 'inst-fmu',
    title: 'Student Support',
    icon: 'heart.fill',
    memberCount: 15,
    unreadCount: 2,
  },
  {
    id: 'room-fmu-faculty-lounge',
    institutionId: 'inst-fmu',
    title: 'Faculty Lounge',
    icon: 'person.3.fill',
    memberCount: 45,
    unreadCount: 0,
  },
  {
    id: 'room-fmu-facilities',
    institutionId: 'inst-fmu',
    title: 'Facilities Ops',
    icon: 'wrench.and.screwdriver.fill',
    memberCount: 10,
    unreadCount: 1,
  },
  {
    id: 'room-fmu-athletics',
    institutionId: 'inst-fmu',
    title: 'Athletics Coordination',
    icon: 'sportscourt.fill',
    memberCount: 20,
    unreadCount: 5,
  },
];

// =============================================================================
// INSTITUTION AUDIT
// =============================================================================

export const INSTITUTION_AUDIT: InstitutionAuditEntry[] = [
  {
    id: 'audit-fmu-1',
    institutionId: 'inst-fmu',
    action: 'Institution created',
    actor: 'System',
    timestamp: '2024-08-15T10:00:00Z',
    timestampMs: 1723716000000,
    description: 'KaNeXT Sports was added to the platform.',
  },
  {
    id: 'audit-fmu-2',
    institutionId: 'inst-fmu',
    action: 'Admin added',
    actor: 'System',
    timestamp: '2024-08-15T10:05:00Z',
    timestampMs: 1723716300000,
    description: 'Dr. Jaffus Hardrick added as President.',
  },
  {
    id: 'audit-fmu-3',
    institutionId: 'inst-fmu',
    action: 'Admin added',
    actor: 'Dr. Jaffus Hardrick',
    timestamp: '2024-08-16T14:30:00Z',
    timestampMs: 1723818600000,
    description: 'Dr. Patricia Williams added as Provost & VP Academic Affairs.',
  },
  {
    id: 'audit-fmu-4',
    institutionId: 'inst-fmu',
    action: 'Department created',
    actor: 'Dr. Patricia Williams',
    timestamp: '2024-08-20T09:00:00Z',
    timestampMs: 1724144400000,
    description: 'School of Arts & Sciences department created with 12 programs.',
  },
  {
    id: 'audit-fmu-5',
    institutionId: 'inst-fmu',
    action: 'Department created',
    actor: 'Dr. Patricia Williams',
    timestamp: '2024-08-20T09:30:00Z',
    timestampMs: 1724146200000,
    description: 'School of Business department created with 8 programs.',
  },
  {
    id: 'audit-fmu-6',
    institutionId: 'inst-fmu',
    action: 'Room created',
    actor: 'Dr. Jaffus Hardrick',
    timestamp: '2024-08-22T11:00:00Z',
    timestampMs: 1724324400000,
    description: 'Leadership room created with 8 initial members.',
  },
  {
    id: 'audit-fmu-7',
    institutionId: 'inst-fmu',
    action: 'Admin added',
    actor: 'Dr. Jaffus Hardrick',
    timestamp: '2024-09-05T16:00:00Z',
    timestampMs: 1725552000000,
    description: 'Dr. Angela Thomas added as VP Student Affairs.',
  },
  {
    id: 'audit-fmu-8',
    institutionId: 'inst-fmu',
    action: 'Admissions deadline updated',
    actor: 'Dr. Angela Thomas',
    timestamp: '2024-10-01T08:00:00Z',
    timestampMs: 1727769600000,
    description: 'Application deadline set to March 1, 2026 for incoming class.',
  },
  {
    id: 'audit-fmu-9',
    institutionId: 'inst-fmu',
    action: 'Compliance report filed',
    actor: 'Dr. Patricia Williams',
    timestamp: '2025-01-15T14:00:00Z',
    timestampMs: 1736949600000,
    description: 'Annual SACSCOC compliance self-assessment submitted.',
  },
  {
    id: 'audit-fmu-10',
    institutionId: 'inst-fmu',
    action: 'Partnership established',
    actor: 'Dr. Jaffus Hardrick',
    timestamp: '2025-03-10T14:00:00Z',
    timestampMs: 1741618800000,
    description: 'Partnership agreement signed with South Ridgemont Academy of Technology.',
  },
  {
    id: 'audit-fmu-11',
    institutionId: 'inst-fmu',
    action: 'Room created',
    actor: 'Dr. Angela Thomas',
    timestamp: '2025-06-01T10:00:00Z',
    timestampMs: 1748768400000,
    description: 'Athletics Coordination room created for cross-department sports ops.',
  },
  {
    id: 'audit-fmu-12',
    institutionId: 'inst-fmu',
    action: 'Library collection added',
    actor: 'Dr. Patricia Williams',
    timestamp: '2025-08-20T09:00:00Z',
    timestampMs: 1724144400000,
    description: 'Digital archives collection added to institutional library.',
  },
  {
    id: 'audit-fmu-13',
    institutionId: 'inst-fmu',
    action: 'Enrollment milestone',
    actor: 'System',
    timestamp: '2025-09-02T12:00:00Z',
    timestampMs: 1756900800000,
    description: 'Fall 2025 enrollment reached 1,050 students — 8% increase YoY.',
  },
  {
    id: 'audit-fmu-14',
    institutionId: 'inst-fmu',
    action: 'Department created',
    actor: 'Dr. Patricia Williams',
    timestamp: '2025-11-10T10:00:00Z',
    timestampMs: 1762862400000,
    description: 'School of Nursing department created with 4 programs.',
  },
  {
    id: 'audit-fmu-15',
    institutionId: 'inst-fmu',
    action: 'Prospect added',
    actor: 'Dr. Jaffus Hardrick',
    timestamp: '2025-11-20T11:30:00Z',
    timestampMs: 1763734200000,
    description: 'South Ridgemont Academy of Technology added as prospect institution.',
  },
];

// =============================================================================
// HELPERS
// =============================================================================

export function filterInstitutions(
  institutions: InstitutionFull[],
  search: string,
  scope: string,
  statuses: InstitutionStatus[],
  types: InstitutionType[],
): InstitutionFull[] {
  let result = [...institutions];

  // Scope filter — 'my' shows only active institutions the user manages
  if (scope === 'my') {
    result = result.filter((i) => i.status === 'active');
  }

  // Status filter
  if (statuses.length > 0) {
    result = result.filter((i) => statuses.includes(i.status));
  }

  // Type filter
  if (types.length > 0) {
    result = result.filter((i) => types.includes(i.type));
  }

  // Search filter — matches name, shortName, or location
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.shortName.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q),
    );
  }

  return result;
}

export function sortInstitutions(
  institutions: InstitutionFull[],
  sort: InstitutionFilterState['sort'],
): InstitutionFull[] {
  const sorted = [...institutions];

  switch (sort) {
    case 'az':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'recent':
      return sorted.sort((a, b) => b.lastActivityMs - a.lastActivityMs);
    case 'status': {
      const statusOrder: Record<InstitutionStatus, number> = {
        active: 0,
        partner: 1,
        prospect: 2,
        archived: 3,
      };
      return sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    }
    default:
      return sorted;
  }
}

export function getDepartmentsForInstitution(institutionId: string): InstitutionDepartment[] {
  return INSTITUTION_DEPARTMENTS.filter((d) => d.institutionId === institutionId);
}

export function getEventsForInstitution(institutionId: string): InstitutionEvent[] {
  return INSTITUTION_EVENTS.filter((e) => e.institutionId === institutionId);
}

export function getRoomsForInstitution(institutionId: string): InstitutionRoom[] {
  return INSTITUTION_ROOMS.filter((r) => r.institutionId === institutionId);
}

export function getAuditForInstitution(institutionId: string): InstitutionAuditEntry[] {
  return INSTITUTION_AUDIT.filter((a) => a.institutionId === institutionId);
}
