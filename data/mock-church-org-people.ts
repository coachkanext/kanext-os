/**
 * Church Organization People Tab — mock data, types, and constants.
 * 5-tab People Hub: Directory, Org Chart, Seat Coverage, Permissions, Safeguards.
 * Centered on ChurchPerson, OrgChartNode, PermissionPackageInfo with
 * youth/care/finance safeguard access and background-check compliance.
 */

// =============================================================================
// TYPES
// =============================================================================

export type OrgChartLane =
  | 'clergy'
  | 'ministry_leadership'
  | 'operations'
  | 'finance'
  | 'volunteers';

export type AuthorityLevel = 'lead' | 'approve' | 'sensitive' | 'view';

export type BackgroundCheckStatus =
  | 'cleared'
  | 'pending'
  | 'expired'
  | 'not_required';

export type PermissionPackage =
  | 'clergy'
  | 'ministry_lead'
  | 'volunteer'
  | 'finance'
  | 'facilities'
  | 'viewer';

export interface ChurchPerson {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  lane: OrgChartLane;
  seatIds: string[];
  authority: AuthorityLevel[];
  ministriesOwned: string[];
  riskFlags: string[];
  backgroundCheck: BackgroundCheckStatus;
  youthAccess: boolean;
  careAccess: boolean;
  financeAccess: boolean;
  safeguardAcknowledged: boolean;
  joinDate: string;
  avatar?: string;
}

export interface OrgChartNode {
  personId: string;
  name: string;
  role: string;
  lane: OrgChartLane;
  seats: string[];
  safeguardIcons: string[];
  reportsTo: string | null;
}

export interface SeatCoverageRow {
  area: string;
  criticalSeats: number;
  filled: number;
  vacant: number;
  coverage: number;
}

export interface PermissionPackageInfo {
  id: PermissionPackage;
  label: string;
  icon: string;
  description: string;
  capabilities: string[];
  sensitiveFields: string[];
  memberCount: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  detail: string;
}

export interface SafeguardEntry {
  personId: string;
  name: string;
  role: string;
  youthAccess: boolean;
  careAccess: boolean;
  financeAccess: boolean;
  backgroundCheck: BackgroundCheckStatus;
  safeguardAcknowledged: boolean;
  lastAckDate: string | null;
}

// =============================================================================
// CONSTANTS — Lane Labels & Colors
// =============================================================================

export const LANE_LABELS: Record<OrgChartLane, string> = {
  clergy: 'Clergy',
  ministry_leadership: 'Ministry Leadership',
  operations: 'Operations',
  finance: 'Finance',
  volunteers: 'Volunteers',
};

export const LANE_COLORS: Record<OrgChartLane, string> = {
  clergy: '#8B5CF6',
  ministry_leadership: '#3B82F6',
  operations: '#F59E0B',
  finance: '#22C55E',
  volunteers: '#EC4899',
};

// =============================================================================
// CONSTANTS — Authority Labels & Colors
// =============================================================================

export const AUTHORITY_LABELS: Record<AuthorityLevel, string> = {
  lead: 'Lead',
  approve: 'Approve',
  sensitive: 'Sensitive',
  view: 'View',
};

export const AUTHORITY_COLORS: Record<AuthorityLevel, string> = {
  lead: '#8B5CF6',
  approve: '#3B82F6',
  sensitive: '#EF4444',
  view: '#6B7280',
};

// =============================================================================
// CONSTANTS — Background Check Labels & Colors
// =============================================================================

export const BG_CHECK_LABELS: Record<BackgroundCheckStatus, string> = {
  cleared: 'Cleared',
  pending: 'Pending',
  expired: 'Expired',
  not_required: 'N/A',
};

export const BG_CHECK_COLORS: Record<BackgroundCheckStatus, string> = {
  cleared: '#22C55E',
  pending: '#F59E0B',
  expired: '#EF4444',
  not_required: '#6B7280',
};

// =============================================================================
// SEEDED PEOPLE (17 ICCLA-style)
// =============================================================================

const CHURCH_PEOPLE: ChurchPerson[] = [
  // ── Clergy Lane ──────────────────────────────────────────────────────────
  {
    id: 'cp-001',
    name: 'Pastor David Okoro',
    role: 'Senior Pastor',
    email: 'david.okoro@iccla.org',
    phone: '+1 (310) 555-0101',
    lane: 'clergy',
    seatIds: ['seat-c-001'],
    authority: ['lead', 'approve', 'sensitive'],
    ministriesOwned: ['Worship & Arts', 'Youth Ministry'],
    riskFlags: [],
    backgroundCheck: 'cleared',
    youthAccess: true,
    careAccess: true,
    financeAccess: true,
    safeguardAcknowledged: true,
    joinDate: 'Jan 5, 2012',
    avatar: 'DO',
  },
  {
    id: 'cp-002',
    name: 'Pastor Grace Kim',
    role: 'Associate Pastor',
    email: 'grace.kim@iccla.org',
    phone: '+1 (310) 555-0102',
    lane: 'clergy',
    seatIds: ['seat-c-002'],
    authority: ['lead', 'approve'],
    ministriesOwned: ['Care & Counseling'],
    riskFlags: [],
    backgroundCheck: 'cleared',
    youthAccess: true,
    careAccess: true,
    financeAccess: false,
    safeguardAcknowledged: true,
    joinDate: 'Aug 15, 2015',
    avatar: 'GK',
  },
  {
    id: 'cp-003',
    name: 'Elder James Whitfield',
    role: 'Elder / Board Chair',
    email: 'james.whitfield@iccla.org',
    phone: '+1 (310) 555-0103',
    lane: 'clergy',
    seatIds: ['seat-c-003'],
    authority: ['approve', 'sensitive'],
    ministriesOwned: [],
    riskFlags: [],
    backgroundCheck: 'cleared',
    youthAccess: false,
    careAccess: false,
    financeAccess: true,
    safeguardAcknowledged: true,
    joinDate: 'Mar 22, 2010',
    avatar: 'JW',
  },

  // ── Ministry Leadership Lane ─────────────────────────────────────────────
  {
    id: 'cp-004',
    name: 'Sarah Johnson',
    role: 'Worship Director',
    email: 'sarah.johnson@iccla.org',
    phone: '+1 (310) 555-0104',
    lane: 'ministry_leadership',
    seatIds: ['seat-m-001'],
    authority: ['lead'],
    ministriesOwned: ['Worship & Arts'],
    riskFlags: [],
    backgroundCheck: 'cleared',
    youthAccess: false,
    careAccess: false,
    financeAccess: false,
    safeguardAcknowledged: true,
    joinDate: 'Jun 1, 2017',
    avatar: 'SJ',
  },
  {
    id: 'cp-005',
    name: 'Marcus Thompson',
    role: "Children's Ministry Director",
    email: 'marcus.thompson@iccla.org',
    phone: '+1 (310) 555-0105',
    lane: 'ministry_leadership',
    seatIds: ['seat-m-002'],
    authority: ['lead', 'sensitive'],
    ministriesOwned: ["Children's Ministry"],
    riskFlags: [],
    backgroundCheck: 'cleared',
    youthAccess: true,
    careAccess: false,
    financeAccess: false,
    safeguardAcknowledged: true,
    joinDate: 'Sep 10, 2018',
    avatar: 'MT',
  },
  {
    id: 'cp-006',
    name: 'Priya Patel',
    role: 'Youth Pastor',
    email: 'priya.patel@iccla.org',
    phone: '+1 (310) 555-0106',
    lane: 'ministry_leadership',
    seatIds: ['seat-m-003'],
    authority: ['lead'],
    ministriesOwned: ['Youth Ministry'],
    riskFlags: [],
    backgroundCheck: 'cleared',
    youthAccess: true,
    careAccess: false,
    financeAccess: false,
    safeguardAcknowledged: true,
    joinDate: 'Feb 14, 2019',
    avatar: 'PP',
  },
  {
    id: 'cp-007',
    name: 'Robert Chen',
    role: 'Outreach Director',
    email: 'robert.chen@iccla.org',
    phone: '+1 (310) 555-0107',
    lane: 'ministry_leadership',
    seatIds: ['seat-m-004'],
    authority: ['lead'],
    ministriesOwned: ['Community Outreach'],
    riskFlags: [],
    backgroundCheck: 'cleared',
    youthAccess: false,
    careAccess: false,
    financeAccess: false,
    safeguardAcknowledged: true,
    joinDate: 'Nov 3, 2018',
    avatar: 'RC',
  },
  {
    id: 'cp-008',
    name: 'Linda Martinez',
    role: 'Care Ministry Lead',
    email: 'linda.martinez@iccla.org',
    phone: '+1 (310) 555-0108',
    lane: 'ministry_leadership',
    seatIds: ['seat-m-005'],
    authority: ['lead', 'sensitive'],
    ministriesOwned: ['Care & Counseling'],
    riskFlags: [],
    backgroundCheck: 'cleared',
    youthAccess: false,
    careAccess: true,
    financeAccess: false,
    safeguardAcknowledged: true,
    joinDate: 'Apr 20, 2017',
    avatar: 'LM',
  },

  // ── Operations Lane ──────────────────────────────────────────────────────
  {
    id: 'cp-009',
    name: 'Michael Williams',
    role: 'Operations Manager',
    email: 'michael.williams@iccla.org',
    phone: '+1 (310) 555-0109',
    lane: 'operations',
    seatIds: ['seat-o-001'],
    authority: ['approve'],
    ministriesOwned: [],
    riskFlags: [],
    backgroundCheck: 'cleared',
    youthAccess: false,
    careAccess: false,
    financeAccess: false,
    safeguardAcknowledged: true,
    joinDate: 'Jan 15, 2016',
    avatar: 'MW',
  },
  {
    id: 'cp-010',
    name: 'Angela Davis',
    role: 'Facilities Manager',
    email: 'angela.davis@iccla.org',
    phone: '+1 (310) 555-0110',
    lane: 'operations',
    seatIds: ['seat-o-002'],
    authority: ['approve'],
    ministriesOwned: [],
    riskFlags: [],
    backgroundCheck: 'cleared',
    youthAccess: false,
    careAccess: false,
    financeAccess: false,
    safeguardAcknowledged: true,
    joinDate: 'Jul 8, 2019',
    avatar: 'AD',
  },
  {
    id: 'cp-011',
    name: 'Thomas Lee',
    role: 'AV Director',
    email: 'thomas.lee@iccla.org',
    phone: '+1 (310) 555-0111',
    lane: 'operations',
    seatIds: ['seat-o-003'],
    authority: ['lead'],
    ministriesOwned: [],
    riskFlags: [],
    backgroundCheck: 'cleared',
    youthAccess: false,
    careAccess: false,
    financeAccess: false,
    safeguardAcknowledged: true,
    joinDate: 'Oct 1, 2020',
    avatar: 'TL',
  },

  // ── Finance Lane ─────────────────────────────────────────────────────────
  {
    id: 'cp-012',
    name: 'Catherine Hughes',
    role: 'Treasurer',
    email: 'catherine.hughes@iccla.org',
    phone: '+1 (310) 555-0112',
    lane: 'finance',
    seatIds: ['seat-f-001'],
    authority: ['approve', 'sensitive'],
    ministriesOwned: [],
    riskFlags: [],
    backgroundCheck: 'cleared',
    youthAccess: false,
    careAccess: false,
    financeAccess: true,
    safeguardAcknowledged: true,
    joinDate: 'May 12, 2014',
    avatar: 'CH',
  },
  {
    id: 'cp-013',
    name: 'David Park',
    role: 'Bookkeeper',
    email: 'david.park@iccla.org',
    phone: '+1 (310) 555-0113',
    lane: 'finance',
    seatIds: ['seat-f-002'],
    authority: ['sensitive'],
    ministriesOwned: [],
    riskFlags: [],
    backgroundCheck: 'cleared',
    youthAccess: false,
    careAccess: false,
    financeAccess: true,
    safeguardAcknowledged: true,
    joinDate: 'Aug 30, 2020',
    avatar: 'DP',
  },

  // ── Volunteers Lane ──────────────────────────────────────────────────────
  {
    id: 'cp-014',
    name: 'Jessica Rivera',
    role: 'Volunteer Coordinator',
    email: 'jessica.rivera@iccla.org',
    phone: '+1 (310) 555-0114',
    lane: 'volunteers',
    seatIds: ['seat-v-001'],
    authority: ['view'],
    ministriesOwned: [],
    riskFlags: ['Background check pending'],
    backgroundCheck: 'pending',
    youthAccess: true,
    careAccess: false,
    financeAccess: false,
    safeguardAcknowledged: true,
    joinDate: 'Mar 5, 2022',
    avatar: 'JR',
  },
  {
    id: 'cp-015',
    name: 'Brian Foster',
    role: 'Greeter Captain',
    email: 'brian.foster@iccla.org',
    phone: '+1 (310) 555-0115',
    lane: 'volunteers',
    seatIds: ['seat-v-002'],
    authority: ['view'],
    ministriesOwned: [],
    riskFlags: [],
    backgroundCheck: 'cleared',
    youthAccess: false,
    careAccess: false,
    financeAccess: false,
    safeguardAcknowledged: true,
    joinDate: 'Jun 18, 2021',
    avatar: 'BF',
  },
  {
    id: 'cp-016',
    name: 'Emily Watson',
    role: 'Sunday School Teacher',
    email: 'emily.watson@iccla.org',
    phone: '+1 (310) 555-0116',
    lane: 'volunteers',
    seatIds: ['seat-v-003'],
    authority: ['view'],
    ministriesOwned: [],
    riskFlags: ['Background check expired'],
    backgroundCheck: 'expired',
    youthAccess: true,
    careAccess: false,
    financeAccess: false,
    safeguardAcknowledged: false,
    joinDate: 'Sep 2, 2020',
    avatar: 'EW',
  },
  {
    id: 'cp-017',
    name: 'Derek Johnson',
    role: 'Usher Captain',
    email: 'derek.johnson@iccla.org',
    phone: '+1 (310) 555-0117',
    lane: 'volunteers',
    seatIds: ['seat-v-004'],
    authority: ['view'],
    ministriesOwned: [],
    riskFlags: [],
    backgroundCheck: 'cleared',
    youthAccess: false,
    careAccess: false,
    financeAccess: false,
    safeguardAcknowledged: true,
    joinDate: 'Jan 20, 2023',
    avatar: 'DJ',
  },
];

// =============================================================================
// ORG CHART NODES
// =============================================================================
//
// Hierarchy:
//   Pastor David Okoro (root)
//   ├── Pastor Grace Kim (Associate Pastor)
//   │   └── Linda Martinez (Care Ministry Lead)
//   ├── Elder James Whitfield (Elder / Board Chair)
//   │   ├── Michael Williams (Operations Manager)
//   │   │   ├── Angela Davis (Facilities Manager)
//   │   │   └── Thomas Lee (AV Director)
//   │   ├── Catherine Hughes (Treasurer)
//   │   │   └── David Park (Bookkeeper)
//   │   └── (Finance reports through Elder)
//   ├── Sarah Johnson (Worship Director)
//   ├── Marcus Thompson (Children's Ministry Director)
//   │   └── Emily Watson (Sunday School Teacher)
//   ├── Priya Patel (Youth Pastor)
//   │   └── Jessica Rivera (Volunteer Coordinator)
//   ├── Robert Chen (Outreach Director)
//   │   ├── Brian Foster (Greeter Captain)
//   │   └── Derek Johnson (Usher Captain)
//   └── Linda Martinez (Care Ministry Lead) reports to Grace Kim
//

const ORG_CHART_NODES: OrgChartNode[] = [
  // ── Clergy ───────────────────────────────────────────────────────────────
  {
    personId: 'cp-001',
    name: 'Pastor David Okoro',
    role: 'Senior Pastor',
    lane: 'clergy',
    seats: ['seat-c-001'],
    safeguardIcons: ['shield.checkmark', 'heart', 'dollarsign.circle'],
    reportsTo: null,
  },
  {
    personId: 'cp-002',
    name: 'Pastor Grace Kim',
    role: 'Associate Pastor',
    lane: 'clergy',
    seats: ['seat-c-002'],
    safeguardIcons: ['shield.checkmark', 'heart'],
    reportsTo: 'cp-001',
  },
  {
    personId: 'cp-003',
    name: 'Elder James Whitfield',
    role: 'Elder / Board Chair',
    lane: 'clergy',
    seats: ['seat-c-003'],
    safeguardIcons: ['dollarsign.circle'],
    reportsTo: 'cp-001',
  },

  // ── Ministry Leadership ──────────────────────────────────────────────────
  {
    personId: 'cp-004',
    name: 'Sarah Johnson',
    role: 'Worship Director',
    lane: 'ministry_leadership',
    seats: ['seat-m-001'],
    safeguardIcons: [],
    reportsTo: 'cp-001',
  },
  {
    personId: 'cp-005',
    name: 'Marcus Thompson',
    role: "Children's Ministry Director",
    lane: 'ministry_leadership',
    seats: ['seat-m-002'],
    safeguardIcons: ['shield.checkmark'],
    reportsTo: 'cp-001',
  },
  {
    personId: 'cp-006',
    name: 'Priya Patel',
    role: 'Youth Pastor',
    lane: 'ministry_leadership',
    seats: ['seat-m-003'],
    safeguardIcons: ['shield.checkmark'],
    reportsTo: 'cp-001',
  },
  {
    personId: 'cp-007',
    name: 'Robert Chen',
    role: 'Outreach Director',
    lane: 'ministry_leadership',
    seats: ['seat-m-004'],
    safeguardIcons: [],
    reportsTo: 'cp-001',
  },
  {
    personId: 'cp-008',
    name: 'Linda Martinez',
    role: 'Care Ministry Lead',
    lane: 'ministry_leadership',
    seats: ['seat-m-005'],
    safeguardIcons: ['heart'],
    reportsTo: 'cp-002',
  },

  // ── Operations ───────────────────────────────────────────────────────────
  {
    personId: 'cp-009',
    name: 'Michael Williams',
    role: 'Operations Manager',
    lane: 'operations',
    seats: ['seat-o-001'],
    safeguardIcons: [],
    reportsTo: 'cp-003',
  },
  {
    personId: 'cp-010',
    name: 'Angela Davis',
    role: 'Facilities Manager',
    lane: 'operations',
    seats: ['seat-o-002'],
    safeguardIcons: [],
    reportsTo: 'cp-009',
  },
  {
    personId: 'cp-011',
    name: 'Thomas Lee',
    role: 'AV Director',
    lane: 'operations',
    seats: ['seat-o-003'],
    safeguardIcons: [],
    reportsTo: 'cp-009',
  },

  // ── Finance ──────────────────────────────────────────────────────────────
  {
    personId: 'cp-012',
    name: 'Catherine Hughes',
    role: 'Treasurer',
    lane: 'finance',
    seats: ['seat-f-001'],
    safeguardIcons: ['dollarsign.circle'],
    reportsTo: 'cp-003',
  },
  {
    personId: 'cp-013',
    name: 'David Park',
    role: 'Bookkeeper',
    lane: 'finance',
    seats: ['seat-f-002'],
    safeguardIcons: ['dollarsign.circle'],
    reportsTo: 'cp-012',
  },

  // ── Volunteers ───────────────────────────────────────────────────────────
  {
    personId: 'cp-014',
    name: 'Jessica Rivera',
    role: 'Volunteer Coordinator',
    lane: 'volunteers',
    seats: ['seat-v-001'],
    safeguardIcons: ['shield.checkmark'],
    reportsTo: 'cp-006',
  },
  {
    personId: 'cp-015',
    name: 'Brian Foster',
    role: 'Greeter Captain',
    lane: 'volunteers',
    seats: ['seat-v-002'],
    safeguardIcons: [],
    reportsTo: 'cp-007',
  },
  {
    personId: 'cp-016',
    name: 'Emily Watson',
    role: 'Sunday School Teacher',
    lane: 'volunteers',
    seats: ['seat-v-003'],
    safeguardIcons: ['shield.checkmark'],
    reportsTo: 'cp-005',
  },
  {
    personId: 'cp-017',
    name: 'Derek Johnson',
    role: 'Usher Captain',
    lane: 'volunteers',
    seats: ['seat-v-004'],
    safeguardIcons: [],
    reportsTo: 'cp-007',
  },
];

// =============================================================================
// SEAT COVERAGE
// =============================================================================

const SEAT_COVERAGE: SeatCoverageRow[] = [
  {
    area: 'Clergy',
    criticalSeats: 2,
    filled: 2,
    vacant: 0,
    coverage: 100,
  },
  {
    area: 'Ministry Leadership',
    criticalSeats: 5,
    filled: 5,
    vacant: 0,
    coverage: 100,
  },
  {
    area: 'Operations',
    criticalSeats: 3,
    filled: 2,
    vacant: 1,
    coverage: 67,
  },
  {
    area: 'Finance',
    criticalSeats: 2,
    filled: 2,
    vacant: 0,
    coverage: 100,
  },
  {
    area: 'Volunteers',
    criticalSeats: 8,
    filled: 6,
    vacant: 2,
    coverage: 75,
  },
];

// =============================================================================
// PERMISSION PACKAGES
// =============================================================================

const PERMISSION_PACKAGES: PermissionPackageInfo[] = [
  {
    id: 'clergy',
    label: 'Clergy',
    icon: 'cross.circle',
    description:
      'Full spiritual and administrative authority. Unrestricted access to all ministries, pastoral care records, and safeguard-sensitive data. Can approve budget items and sign on behalf of the church.',
    capabilities: [
      'View and manage all ministries',
      'Access pastoral care records',
      'Approve budget line items',
      'Grant and revoke volunteer access',
      'View background check results',
      'Sign official church documents',
      'Manage safeguard policies',
    ],
    sensitiveFields: [
      'Pastoral care notes',
      'Counseling records',
      'Financial statements',
      'Background check details',
      'Donor identities',
      'Safeguard incident reports',
    ],
    memberCount: 2,
  },
  {
    id: 'ministry_lead',
    label: 'Ministry Lead',
    icon: 'person.3',
    description:
      'Department-level leadership access scoped to owned ministries. Can manage volunteers within their ministry, view aggregate attendance, and submit budget requests. Sensitive access only for youth/care leads.',
    capabilities: [
      'Manage ministry volunteers',
      'View ministry attendance data',
      'Submit budget requests',
      'Schedule ministry events',
      'View safeguard status of team',
      'Request background checks',
    ],
    sensitiveFields: [
      'Ministry attendance records',
      'Volunteer contact info',
      'Youth participant lists (if youth ministry)',
      'Care referral notes (if care ministry)',
    ],
    memberCount: 5,
  },
  {
    id: 'volunteer',
    label: 'Volunteer',
    icon: 'hand.raised',
    description:
      'Basic volunteer access. Can view their own schedule, assigned ministry, and safeguard acknowledgment status. No access to financial data, pastoral records, or other volunteers\' personal information.',
    capabilities: [
      'View own schedule and assignments',
      'View ministry event calendar',
      'Submit availability updates',
      'View own safeguard status',
      'Complete safeguard acknowledgment',
    ],
    sensitiveFields: [
      'Own contact info',
      'Own background check status',
    ],
    memberCount: 4,
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: 'dollarsign.circle',
    description:
      'Full access to church financial systems including tithes, offerings, disbursements, and fund accounting. Can view donor records and generate financial reports. Approve authority on expenditures.',
    capabilities: [
      'View and manage all financial records',
      'Process tithes and offerings',
      'Approve expenditures',
      'Generate financial reports',
      'View donor identities and giving history',
      'Manage fund accounting',
      'Reconcile bank statements',
    ],
    sensitiveFields: [
      'Donor identities',
      'Giving history',
      'Bank account details',
      'Payroll records',
      'Expense receipts',
      'Tax documents',
    ],
    memberCount: 2,
  },
  {
    id: 'facilities',
    label: 'Facilities',
    icon: 'building.2',
    description:
      'Access to building management, room scheduling, maintenance requests, and vendor coordination. Can approve facility-related purchases within delegated limits. No access to pastoral or financial data.',
    capabilities: [
      'Manage room reservations',
      'Submit and track maintenance requests',
      'Coordinate with vendors',
      'Approve facility purchases (under $500)',
      'View building usage reports',
      'Manage key/access assignments',
    ],
    sensitiveFields: [
      'Vendor contracts',
      'Building access codes',
      'Insurance documents',
    ],
    memberCount: 1,
  },
  {
    id: 'viewer',
    label: 'Viewer',
    icon: 'eye',
    description:
      'Read-only access to the church directory, public event calendar, and published reports. Cannot view financial data, pastoral records, or safeguard-sensitive information. Suitable for board observers and new members.',
    capabilities: [
      'View church directory (public fields)',
      'View public event calendar',
      'View published ministry reports',
    ],
    sensitiveFields: [],
    memberCount: 3,
  },
];

// =============================================================================
// AUDIT LOG
// =============================================================================

const AUDIT_LOG: AuditLogEntry[] = [
  {
    id: 'al-001',
    timestamp: '2025-12-15T09:23:00Z',
    actor: 'Pastor David Okoro',
    action: 'Role Changed',
    target: 'Priya Patel',
    detail: 'Promoted from Youth Volunteer Lead to Youth Pastor. Ministry ownership transferred for Youth Ministry.',
  },
  {
    id: 'al-002',
    timestamp: '2025-12-12T14:05:00Z',
    actor: 'Elder James Whitfield',
    action: 'Permission Granted',
    target: 'Catherine Hughes',
    detail: 'Granted Finance permission package. Approve authority enabled for expenditures up to $10,000.',
  },
  {
    id: 'al-003',
    timestamp: '2025-12-10T11:30:00Z',
    actor: 'System',
    action: 'Background Check Expired',
    target: 'Emily Watson',
    detail: 'Background check expired on Dec 10, 2025. Youth access flagged for review. Auto-notification sent.',
  },
  {
    id: 'al-004',
    timestamp: '2025-12-08T16:45:00Z',
    actor: 'Pastor Grace Kim',
    action: 'Care Access Granted',
    target: 'Linda Martinez',
    detail: 'Care access enabled for Care Ministry Lead role. Pastoral care record visibility activated.',
  },
  {
    id: 'al-005',
    timestamp: '2025-12-05T08:15:00Z',
    actor: 'Michael Williams',
    action: 'Seat Assigned',
    target: 'Thomas Lee',
    detail: 'Assigned to AV Director seat (seat-o-003). Operations lane confirmed.',
  },
  {
    id: 'al-006',
    timestamp: '2025-12-02T13:00:00Z',
    actor: 'System',
    action: 'Background Check Submitted',
    target: 'Jessica Rivera',
    detail: 'Background check submitted for Volunteer Coordinator role. Youth access pending clearance.',
  },
  {
    id: 'al-007',
    timestamp: '2025-11-28T10:20:00Z',
    actor: 'Pastor David Okoro',
    action: 'Safeguard Policy Updated',
    target: 'All Personnel',
    detail: 'Updated safeguard acknowledgment policy to require annual renewal. 3 members flagged for re-acknowledgment.',
  },
  {
    id: 'al-008',
    timestamp: '2025-11-25T15:40:00Z',
    actor: 'Elder James Whitfield',
    action: 'Finance Access Revoked',
    target: 'Robert Chen',
    detail: 'Finance access removed from Outreach Director role per quarterly access review. No sensitive data exposure detected.',
  },
];

// =============================================================================
// SAFEGUARD ENTRIES (all 17 people)
// =============================================================================

const SAFEGUARD_ENTRIES: SafeguardEntry[] = [
  {
    personId: 'cp-001',
    name: 'Pastor David Okoro',
    role: 'Senior Pastor',
    youthAccess: true,
    careAccess: true,
    financeAccess: true,
    backgroundCheck: 'cleared',
    safeguardAcknowledged: true,
    lastAckDate: 'Nov 1, 2025',
  },
  {
    personId: 'cp-002',
    name: 'Pastor Grace Kim',
    role: 'Associate Pastor',
    youthAccess: true,
    careAccess: true,
    financeAccess: false,
    backgroundCheck: 'cleared',
    safeguardAcknowledged: true,
    lastAckDate: 'Nov 1, 2025',
  },
  {
    personId: 'cp-003',
    name: 'Elder James Whitfield',
    role: 'Elder / Board Chair',
    youthAccess: false,
    careAccess: false,
    financeAccess: true,
    backgroundCheck: 'cleared',
    safeguardAcknowledged: true,
    lastAckDate: 'Oct 15, 2025',
  },
  {
    personId: 'cp-004',
    name: 'Sarah Johnson',
    role: 'Worship Director',
    youthAccess: false,
    careAccess: false,
    financeAccess: false,
    backgroundCheck: 'cleared',
    safeguardAcknowledged: true,
    lastAckDate: 'Oct 15, 2025',
  },
  {
    personId: 'cp-005',
    name: 'Marcus Thompson',
    role: "Children's Ministry Director",
    youthAccess: true,
    careAccess: false,
    financeAccess: false,
    backgroundCheck: 'cleared',
    safeguardAcknowledged: true,
    lastAckDate: 'Nov 1, 2025',
  },
  {
    personId: 'cp-006',
    name: 'Priya Patel',
    role: 'Youth Pastor',
    youthAccess: true,
    careAccess: false,
    financeAccess: false,
    backgroundCheck: 'cleared',
    safeguardAcknowledged: true,
    lastAckDate: 'Nov 1, 2025',
  },
  {
    personId: 'cp-007',
    name: 'Robert Chen',
    role: 'Outreach Director',
    youthAccess: false,
    careAccess: false,
    financeAccess: false,
    backgroundCheck: 'cleared',
    safeguardAcknowledged: true,
    lastAckDate: 'Oct 15, 2025',
  },
  {
    personId: 'cp-008',
    name: 'Linda Martinez',
    role: 'Care Ministry Lead',
    youthAccess: false,
    careAccess: true,
    financeAccess: false,
    backgroundCheck: 'cleared',
    safeguardAcknowledged: true,
    lastAckDate: 'Dec 8, 2025',
  },
  {
    personId: 'cp-009',
    name: 'Michael Williams',
    role: 'Operations Manager',
    youthAccess: false,
    careAccess: false,
    financeAccess: false,
    backgroundCheck: 'cleared',
    safeguardAcknowledged: true,
    lastAckDate: 'Oct 15, 2025',
  },
  {
    personId: 'cp-010',
    name: 'Angela Davis',
    role: 'Facilities Manager',
    youthAccess: false,
    careAccess: false,
    financeAccess: false,
    backgroundCheck: 'cleared',
    safeguardAcknowledged: true,
    lastAckDate: 'Oct 15, 2025',
  },
  {
    personId: 'cp-011',
    name: 'Thomas Lee',
    role: 'AV Director',
    youthAccess: false,
    careAccess: false,
    financeAccess: false,
    backgroundCheck: 'cleared',
    safeguardAcknowledged: true,
    lastAckDate: 'Dec 5, 2025',
  },
  {
    personId: 'cp-012',
    name: 'Catherine Hughes',
    role: 'Treasurer',
    youthAccess: false,
    careAccess: false,
    financeAccess: true,
    backgroundCheck: 'cleared',
    safeguardAcknowledged: true,
    lastAckDate: 'Oct 15, 2025',
  },
  {
    personId: 'cp-013',
    name: 'David Park',
    role: 'Bookkeeper',
    youthAccess: false,
    careAccess: false,
    financeAccess: true,
    backgroundCheck: 'cleared',
    safeguardAcknowledged: true,
    lastAckDate: 'Oct 15, 2025',
  },
  {
    personId: 'cp-014',
    name: 'Jessica Rivera',
    role: 'Volunteer Coordinator',
    youthAccess: true,
    careAccess: false,
    financeAccess: false,
    backgroundCheck: 'pending',
    safeguardAcknowledged: true,
    lastAckDate: 'Mar 5, 2025',
  },
  {
    personId: 'cp-015',
    name: 'Brian Foster',
    role: 'Greeter Captain',
    youthAccess: false,
    careAccess: false,
    financeAccess: false,
    backgroundCheck: 'cleared',
    safeguardAcknowledged: true,
    lastAckDate: 'Oct 15, 2025',
  },
  {
    personId: 'cp-016',
    name: 'Emily Watson',
    role: 'Sunday School Teacher',
    youthAccess: true,
    careAccess: false,
    financeAccess: false,
    backgroundCheck: 'expired',
    safeguardAcknowledged: false,
    lastAckDate: null,
  },
  {
    personId: 'cp-017',
    name: 'Derek Johnson',
    role: 'Usher Captain',
    youthAccess: false,
    careAccess: false,
    financeAccess: false,
    backgroundCheck: 'cleared',
    safeguardAcknowledged: true,
    lastAckDate: 'Jan 20, 2025',
  },
];

// =============================================================================
// DATA GETTER
// =============================================================================

export function getChurchPeopleData() {
  return {
    people: CHURCH_PEOPLE,
    orgChart: ORG_CHART_NODES,
    seatCoverage: SEAT_COVERAGE,
    permissionPackages: PERMISSION_PACKAGES,
    auditLog: AUDIT_LOG,
    safeguards: SAFEGUARD_ENTRIES,
    tiles: {
      totalPeople: CHURCH_PEOPLE.length,
      criticalSeatsFilled: '82%',
      vacantLeadership: SEAT_COVERAGE.reduce((sum, r) => sum + r.vacant, 0),
      youthCareAccess: CHURCH_PEOPLE.filter(
        (p) => p.youthAccess || p.careAccess
      ).length,
    },
  };
}

// =============================================================================
// DERIVED HELPERS
// =============================================================================

export function getPersonById(id: string): ChurchPerson | undefined {
  return CHURCH_PEOPLE.find((p) => p.id === id);
}

export function getPeopleByLane(lane: OrgChartLane): ChurchPerson[] {
  return CHURCH_PEOPLE.filter((p) => p.lane === lane);
}

export function getPeopleWithRiskFlags(): ChurchPerson[] {
  return CHURCH_PEOPLE.filter((p) => p.riskFlags.length > 0);
}

export function getPeopleWithYouthAccess(): ChurchPerson[] {
  return CHURCH_PEOPLE.filter((p) => p.youthAccess);
}

export function getPeopleWithCareAccess(): ChurchPerson[] {
  return CHURCH_PEOPLE.filter((p) => p.careAccess);
}

export function getPeopleWithFinanceAccess(): ChurchPerson[] {
  return CHURCH_PEOPLE.filter((p) => p.financeAccess);
}

export function getSafeguardIssues(): SafeguardEntry[] {
  return SAFEGUARD_ENTRIES.filter(
    (s) =>
      s.backgroundCheck === 'expired' ||
      s.backgroundCheck === 'pending' ||
      !s.safeguardAcknowledged
  );
}

export function getOrgChartRoots(): OrgChartNode[] {
  return ORG_CHART_NODES.filter((n) => n.reportsTo === null);
}

export function getDirectReports(personId: string): OrgChartNode[] {
  return ORG_CHART_NODES.filter((n) => n.reportsTo === personId);
}

export function getCoveragePercent(): number {
  const totalFilled = SEAT_COVERAGE.reduce((sum, r) => sum + r.filled, 0);
  const totalSeats = SEAT_COVERAGE.reduce(
    (sum, r) => sum + r.criticalSeats,
    0
  );
  if (totalSeats === 0) return 0;
  return Math.round((totalFilled / totalSeats) * 100);
}

export function getPackageById(
  id: PermissionPackage
): PermissionPackageInfo | undefined {
  return PERMISSION_PACKAGES.find((p) => p.id === id);
}
