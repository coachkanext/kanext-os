/**
 * Business Organization People Tab — mock data, types, and constants.
 * 4-tab People Hub: Directory, Org Chart, Roles & Coverage, Permissions.
 * Centered on BizPerson, RoleSeat, PermissionPackage with RBAC + signature authority.
 */

import {
  KANEXT_HOLDCO,
  KANEXT_OPSCO,
  KANEXT_IP,
  SEEDED_ENTITY_NAMES,
} from '@/data/biz-org-shared-types';

// =============================================================================
// TAB TYPES & CONSTANTS
// =============================================================================

export type BizPeopleTabId = 'directory' | 'org-chart' | 'roles' | 'permissions';

export const BIZ_PEOPLE_TABS: { id: BizPeopleTabId; label: string; icon: string }[] = [
  { id: 'directory', label: 'Directory', icon: 'person.crop.rectangle.stack' },
  { id: 'org-chart', label: 'Org Chart', icon: 'rectangle.3.group' },
  { id: 'roles', label: 'Roles & Coverage', icon: 'person.badge.key' },
  { id: 'permissions', label: 'Permissions', icon: 'lock.shield' },
];

export const BIZ_PEOPLE_SCOPE_CHIPS = [
  'All',
  'HoldCo',
  'OpsCo',
  'IP',
];

export const ENTITY_SCOPE_MAP: Record<string, string | null> = {
  'All': null,
  'HoldCo': KANEXT_HOLDCO,
  'OpsCo': KANEXT_OPSCO,
  'IP': KANEXT_IP,
};

export const DEPARTMENT_CHIPS = [
  'All',
  'Executive',
  'Engineering',
  'Operations',
  'Finance',
  'Legal',
  'Compliance',
  'Sales',
  'Partnerships',
  'Product',
];

// =============================================================================
// DATA INTERFACES
// =============================================================================

export type SignatureAuthority = 'approve' | 'release' | 'both' | 'none';
export type RBACLevel = 'B0' | 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'B6' | 'B7' | 'B8' | 'B9' | 'B10' | 'B11' | 'B12' | 'B13';

export type CoverageCategory = 'exec' | 'finance' | 'rails' | 'compliance' | 'ops' | 'media';

export interface BizPerson {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  entityId: string;
  entityName: string;
  role: string;
  rbacLevel: RBACLevel;
  signatureAuthority: SignatureAuthority;
  reportsTo: string | null;
  directReports: string[];
  avatarInitials: string;
  status: 'active' | 'on_leave' | 'terminated';
  startDate: string;
  permissionPackage: string;
  canApprove: boolean;
  canRelease: boolean;
  sensitiveAccess: 'full' | 'partial' | 'none';
  riskFlags: string[];
  accountability: { initiatives: number; blockers: number; approvalsPending: number };
  coverageCategory: CoverageCategory;
}

export interface RoleSeat {
  id: string;
  title: string;
  department: string;
  entityId: string;
  entityName: string;
  holder: string | null;
  holderName: string | null;
  requiredPermissions: string[];
  signatureAuthority: SignatureAuthority;
  critical: boolean;
}

export interface PermissionPackage {
  id: string;
  name: string;
  rbacLevel: RBACLevel;
  description: string;
  tabAccess: string[];
  actions: string[];
}

export type OrgChartLevel = 'C-Suite' | 'VP' | 'Director' | 'Manager' | 'IC';

export interface OrgChartNode {
  personId: string | null;
  name: string;
  title: string;
  entityName: string;
  level: OrgChartLevel;
  reportsTo: string | null;
  directReportIds: string[];
  vacant: boolean;
  critical: boolean;
}

// =============================================================================
// STATUS / AUTHORITY COLORS
// =============================================================================

export const PERSON_STATUS_COLOR: Record<BizPerson['status'], string> = {
  active: '#22C55E',
  on_leave: '#F59E0B',
  terminated: '#EF4444',
};

export const PERSON_STATUS_LABEL: Record<BizPerson['status'], string> = {
  active: 'Active',
  on_leave: 'On Leave',
  terminated: 'Terminated',
};

export const SIGNATURE_AUTHORITY_COLOR: Record<SignatureAuthority, string> = {
  approve: '#1D9BF0',
  release: '#1D9BF0',
  both: '#22C55E',
  none: '#A1A1AA',
};

export const SIGNATURE_AUTHORITY_LABEL: Record<SignatureAuthority, string> = {
  approve: 'Approve',
  release: 'Release',
  both: 'Approve + Release',
  none: 'None',
};

export const RBAC_LEVEL_COLOR: Record<RBACLevel, string> = {
  B0: '#22C55E',
  B1: '#22C55E',
  B2: '#1D9BF0',
  B3: '#F59E0B',
  B4: '#A1A1AA',
  B5: '#A1A1AA',
  B6: '#1D9BF0',
  B7: '#1D9BF0',
  B8: '#F59E0B',
  B9: '#1D9BF0',
  B10: '#EF4444',
  B11: '#A1A1AA',
  B12: '#A1A1AA',
  B13: '#22C55E',
};

export const RBAC_LEVEL_LABEL: Record<RBACLevel, string> = {
  B0: 'System Owner',
  B1: 'Founder / CEO',
  B2: 'Co-Founder / C-Suite',
  B3: 'Department Head / VP',
  B4: 'Team Lead / Manager',
  B5: 'Employee / Contributor',
  B6: 'Strategic Investor',
  B7: 'Retail / Minority Investor',
  B8: 'Advisor',
  B9: 'Board Member',
  B10: 'Acquirer / Strategic Partner',
  B11: 'Subscriber / Customer',
  B12: 'Public',
  B13: 'Holding Company',
};

export const ORG_LEVEL_ORDER: OrgChartLevel[] = ['C-Suite', 'VP', 'Director', 'Manager', 'IC'];

export const ORG_LEVEL_COLOR: Record<OrgChartLevel, string> = {
  'C-Suite': '#22C55E',
  'VP': '#1D9BF0',
  'Director': '#1D9BF0',
  'Manager': '#F59E0B',
  'IC': '#A1A1AA',
};

// =============================================================================
// SEEDED PEOPLE (~10 including vacant seats)
// =============================================================================

const PEOPLE: BizPerson[] = [
  {
    id: 'ppl-001',
    name: 'Alex Morgan',
    title: 'CEO / Founder',
    department: 'Executive',
    email: 'sammy@valuetainment.com',
    phone: '+1 (555) 100-0001',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    role: 'Founder',
    rbacLevel: 'B1',
    signatureAuthority: 'both',
    reportsTo: null,
    directReports: ['ppl-002', 'ppl-003', 'ppl-004', 'ppl-005', 'ppl-006'],
    avatarInitials: 'SK',
    status: 'active',
    startDate: 'Jan 15, 2022',
    permissionPackage: 'pkg-founder',
    canApprove: true,
    canRelease: true,
    sensitiveAccess: 'full',
    riskFlags: ['Single point of failure'],
    accountability: { initiatives: 5, blockers: 2, approvalsPending: 3 },
    coverageCategory: 'exec',
  },
  {
    id: 'ppl-002',
    name: 'Marcus Chen',
    title: 'Chief Financial Officer',
    department: 'Finance',
    email: 'marcus.chen@valuetainment.com',
    phone: '+1 (555) 100-0002',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    role: 'CFO',
    rbacLevel: 'B1',
    signatureAuthority: 'approve',
    reportsTo: 'ppl-001',
    directReports: [],
    avatarInitials: 'MC',
    status: 'active',
    startDate: 'Mar 1, 2022',
    permissionPackage: 'pkg-c-suite',
    canApprove: true,
    canRelease: false,
    sensitiveAccess: 'full',
    riskFlags: ['Over-permissioned'],
    accountability: { initiatives: 2, blockers: 0, approvalsPending: 1 },
    coverageCategory: 'finance',
  },
  {
    id: 'ppl-003',
    name: 'Aisha Okonkwo',
    title: 'Chief Operating Officer',
    department: 'Operations',
    email: 'aisha.okonkwo@valuetainment.com',
    phone: '+1 (555) 100-0003',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    role: 'COO',
    rbacLevel: 'B1',
    signatureAuthority: 'approve',
    reportsTo: 'ppl-001',
    directReports: ['ppl-006'],
    avatarInitials: 'AO',
    status: 'active',
    startDate: 'Apr 10, 2022',
    permissionPackage: 'pkg-c-suite',
    canApprove: true,
    canRelease: false,
    sensitiveAccess: 'full',
    riskFlags: [],
    accountability: { initiatives: 3, blockers: 1, approvalsPending: 2 },
    coverageCategory: 'ops',
  },
  {
    id: 'ppl-004',
    name: 'David Park',
    title: 'General Counsel',
    department: 'Legal',
    email: 'david.park@valuetainment.com',
    phone: '+1 (555) 100-0004',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    role: 'General Counsel',
    rbacLevel: 'B1',
    signatureAuthority: 'approve',
    reportsTo: 'ppl-001',
    directReports: [],
    avatarInitials: 'DP',
    status: 'active',
    startDate: 'Jun 1, 2022',
    permissionPackage: 'pkg-c-suite',
    canApprove: true,
    canRelease: false,
    sensitiveAccess: 'full',
    riskFlags: [],
    accountability: { initiatives: 1, blockers: 0, approvalsPending: 1 },
    coverageCategory: 'compliance',
  },
  {
    id: 'ppl-005',
    name: 'Elena Vasquez',
    title: 'VP Engineering',
    department: 'Engineering',
    email: 'elena.vasquez@valuetainment.com',
    phone: '+1 (555) 100-0005',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    role: 'VP Engineering',
    rbacLevel: 'B9',
    signatureAuthority: 'none',
    reportsTo: 'ppl-001',
    directReports: [],
    avatarInitials: 'EV',
    status: 'active',
    startDate: 'Sep 15, 2022',
    permissionPackage: 'pkg-vp',
    canApprove: false,
    canRelease: false,
    sensitiveAccess: 'partial',
    riskFlags: [],
    accountability: { initiatives: 2, blockers: 1, approvalsPending: 0 },
    coverageCategory: 'rails',
  },
  {
    id: 'ppl-006',
    name: 'James Okafor',
    title: 'Head of Partnerships',
    department: 'Partnerships',
    email: 'james.okafor@valuetainment.com',
    phone: '+1 (555) 100-0006',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    role: 'Head of Partnerships',
    rbacLevel: 'B9',
    signatureAuthority: 'none',
    reportsTo: 'ppl-003',
    directReports: [],
    avatarInitials: 'JO',
    status: 'active',
    startDate: 'Nov 1, 2022',
    permissionPackage: 'pkg-vp',
    canApprove: false,
    canRelease: false,
    sensitiveAccess: 'partial',
    riskFlags: ['Missing 2FA'],
    accountability: { initiatives: 1, blockers: 0, approvalsPending: 0 },
    coverageCategory: 'ops',
  },
  {
    id: 'ppl-007',
    name: 'Sarah Kim',
    title: 'Compliance Officer',
    department: 'Compliance',
    email: 'sarah.kim@valuetainment.com',
    phone: '+1 (555) 100-0007',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    role: 'Compliance Officer',
    rbacLevel: 'B9',
    signatureAuthority: 'approve',
    reportsTo: 'ppl-001',
    directReports: [],
    avatarInitials: 'SK',
    status: 'active',
    startDate: 'Jan 10, 2023',
    permissionPackage: 'pkg-compliance',
    canApprove: true,
    canRelease: false,
    sensitiveAccess: 'full',
    riskFlags: [],
    accountability: { initiatives: 0, blockers: 0, approvalsPending: 2 },
    coverageCategory: 'compliance',
  },
  {
    id: 'ppl-008',
    name: 'Omar Haddad',
    title: 'Director of Product',
    department: 'Product',
    email: 'omar.haddad@valuetainment.com',
    phone: '+1 (555) 100-0008',
    entityId: KANEXT_IP,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    role: 'Director of Product',
    rbacLevel: 'B9',
    signatureAuthority: 'none',
    reportsTo: 'ppl-005',
    directReports: [],
    avatarInitials: 'OH',
    status: 'active',
    startDate: 'Mar 20, 2023',
    permissionPackage: 'pkg-director',
    canApprove: false,
    canRelease: false,
    sensitiveAccess: 'partial',
    riskFlags: [],
    accountability: { initiatives: 1, blockers: 0, approvalsPending: 0 },
    coverageCategory: 'ops',
  },
  {
    id: 'ppl-009',
    name: 'Lisa Moreno',
    title: 'Finance Manager',
    department: 'Finance',
    email: 'lisa.moreno@valuetainment.com',
    phone: '+1 (555) 100-0009',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    role: 'Finance Manager',
    rbacLevel: 'B9',
    signatureAuthority: 'none',
    reportsTo: 'ppl-002',
    directReports: [],
    avatarInitials: 'LM',
    status: 'on_leave',
    startDate: 'Jun 5, 2023',
    permissionPackage: 'pkg-director',
    canApprove: false,
    canRelease: false,
    sensitiveAccess: 'partial',
    riskFlags: ['Privileged but inactive'],
    accountability: { initiatives: 0, blockers: 0, approvalsPending: 0 },
    coverageCategory: 'finance',
  },
  {
    id: 'ppl-010',
    name: 'Tyler Washington',
    title: 'Senior Engineer',
    department: 'Engineering',
    email: 'tyler.washington@valuetainment.com',
    phone: '+1 (555) 100-0010',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    role: 'Senior Engineer',
    rbacLevel: 'B9',
    signatureAuthority: 'none',
    reportsTo: 'ppl-005',
    directReports: [],
    avatarInitials: 'TW',
    status: 'active',
    startDate: 'Aug 14, 2023',
    permissionPackage: 'pkg-director',
    canApprove: false,
    canRelease: false,
    sensitiveAccess: 'none',
    riskFlags: [],
    accountability: { initiatives: 1, blockers: 0, approvalsPending: 0 },
    coverageCategory: 'rails',
  },
];

// =============================================================================
// ROLE SEATS (~15 including 3 vacant)
// =============================================================================

const ROLE_SEATS: RoleSeat[] = [
  {
    id: 'seat-001',
    title: 'CEO / Founder',
    department: 'Executive',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    holder: 'ppl-001',
    holderName: 'Alex Morgan',
    requiredPermissions: ['full_access', 'signature_both', 'board_actions'],
    signatureAuthority: 'both',
    critical: true,
  },
  {
    id: 'seat-002',
    title: 'Chief Financial Officer',
    department: 'Finance',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    holder: 'ppl-002',
    holderName: 'Marcus Chen',
    requiredPermissions: ['finance_full', 'signature_approve', 'reporting'],
    signatureAuthority: 'approve',
    critical: true,
  },
  {
    id: 'seat-003',
    title: 'Chief Operating Officer',
    department: 'Operations',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    holder: 'ppl-003',
    holderName: 'Aisha Okonkwo',
    requiredPermissions: ['operations_full', 'signature_approve', 'people_manage'],
    signatureAuthority: 'approve',
    critical: true,
  },
  {
    id: 'seat-004',
    title: 'General Counsel',
    department: 'Legal',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    holder: 'ppl-004',
    holderName: 'David Park',
    requiredPermissions: ['legal_full', 'signature_approve', 'compliance_review'],
    signatureAuthority: 'approve',
    critical: true,
  },
  {
    id: 'seat-005',
    title: 'VP Engineering',
    department: 'Engineering',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    holder: 'ppl-005',
    holderName: 'Elena Vasquez',
    requiredPermissions: ['engineering_manage', 'people_view', 'reporting'],
    signatureAuthority: 'none',
    critical: true,
  },
  {
    id: 'seat-006',
    title: 'Head of Partnerships',
    department: 'Partnerships',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    holder: 'ppl-006',
    holderName: 'James Okafor',
    requiredPermissions: ['partnerships_manage', 'entity_view', 'reporting'],
    signatureAuthority: 'none',
    critical: false,
  },
  {
    id: 'seat-007',
    title: 'Compliance Officer',
    department: 'Compliance',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    holder: 'ppl-007',
    holderName: 'Sarah Kim',
    requiredPermissions: ['compliance_full', 'signature_approve', 'audit_view'],
    signatureAuthority: 'approve',
    critical: true,
  },
  {
    id: 'seat-008',
    title: 'Director of Product',
    department: 'Product',
    entityId: KANEXT_IP,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    holder: 'ppl-008',
    holderName: 'Omar Haddad',
    requiredPermissions: ['product_manage', 'roadmap_edit', 'reporting'],
    signatureAuthority: 'none',
    critical: false,
  },
  {
    id: 'seat-009',
    title: 'Finance Manager',
    department: 'Finance',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    holder: 'ppl-009',
    holderName: 'Lisa Moreno',
    requiredPermissions: ['finance_view', 'budget_manage', 'reporting'],
    signatureAuthority: 'none',
    critical: false,
  },
  {
    id: 'seat-010',
    title: 'Senior Engineer',
    department: 'Engineering',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    holder: 'ppl-010',
    holderName: 'Tyler Washington',
    requiredPermissions: ['engineering_view', 'code_deploy'],
    signatureAuthority: 'none',
    critical: false,
  },
  // === VACANT CRITICAL SEATS ===
  {
    id: 'seat-011',
    title: 'VP Sales',
    department: 'Sales',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    holder: null,
    holderName: null,
    requiredPermissions: ['sales_full', 'finance_view', 'people_manage', 'reporting'],
    signatureAuthority: 'approve',
    critical: true,
  },
  {
    id: 'seat-012',
    title: 'Head of Product',
    department: 'Product',
    entityId: KANEXT_IP,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    holder: null,
    holderName: null,
    requiredPermissions: ['product_full', 'roadmap_edit', 'engineering_view', 'reporting'],
    signatureAuthority: 'none',
    critical: true,
  },
  // === VACANT NON-CRITICAL SEAT ===
  {
    id: 'seat-013',
    title: 'Board Observer',
    department: 'Executive',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    holder: null,
    holderName: null,
    requiredPermissions: ['board_view', 'reporting'],
    signatureAuthority: 'none',
    critical: false,
  },
  {
    id: 'seat-014',
    title: 'DevOps Lead',
    department: 'Engineering',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    holder: null,
    holderName: null,
    requiredPermissions: ['engineering_manage', 'code_deploy', 'infra_manage'],
    signatureAuthority: 'none',
    critical: false,
  },
  {
    id: 'seat-015',
    title: 'Data Privacy Officer',
    department: 'Compliance',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    holder: null,
    holderName: null,
    requiredPermissions: ['compliance_full', 'audit_view', 'data_privacy'],
    signatureAuthority: 'approve',
    critical: false,
  },
];

// =============================================================================
// PERMISSION PACKAGES (~6)
// =============================================================================

const PERMISSION_PACKAGES: PermissionPackage[] = [
  {
    id: 'pkg-founder',
    name: 'Founder / CEO',
    rbacLevel: 'B1',
    description: 'Unrestricted access to all tabs, all entities, all signature authorities. Full control of RBAC assignments and system settings.',
    tabAccess: [
      'Entities', 'People', 'Rooms', 'Operations', 'Finance',
      'Payment Rails', 'Legal', 'Compliance', 'Assets', 'Reports',
    ],
    actions: [
      'Approve transactions', 'Release payments', 'Assign roles',
      'Modify RBAC', 'Create entities', 'Delete entities',
      'Sign documents', 'Board actions', 'System settings',
    ],
  },
  {
    id: 'pkg-c-suite',
    name: 'C-Suite Executive',
    rbacLevel: 'B1',
    description: 'Full operational access across all tabs. Approve authority on transactions within assigned entities. Cannot modify RBAC or system settings.',
    tabAccess: [
      'Entities', 'People', 'Rooms', 'Operations', 'Finance',
      'Payment Rails', 'Legal', 'Compliance', 'Assets', 'Reports',
    ],
    actions: [
      'Approve transactions', 'View all financials', 'Manage people',
      'Create reports', 'Sign documents', 'Entity management',
    ],
  },
  {
    id: 'pkg-vp',
    name: 'VP / Department Head',
    rbacLevel: 'B9',
    description: 'Department-scoped access with visibility into cross-functional tabs. Read-only on financials outside own department budget.',
    tabAccess: [
      'People', 'Rooms', 'Operations', 'Reports',
    ],
    actions: [
      'View people directory', 'Manage department team',
      'View operations', 'Generate department reports',
      'Request approvals', 'View entity info',
    ],
  },
  {
    id: 'pkg-compliance',
    name: 'Compliance Officer',
    rbacLevel: 'B9',
    description: 'Full compliance and audit access. Approve authority for compliance-related sign-offs. Read access to legal, finance, and entities for regulatory review.',
    tabAccess: [
      'Entities', 'People', 'Finance', 'Legal', 'Compliance', 'Reports',
    ],
    actions: [
      'Approve compliance reviews', 'Generate audit reports',
      'View all entity details', 'Access legal documents',
      'Flag compliance issues', 'View financial summaries',
    ],
  },
  {
    id: 'pkg-director',
    name: 'Director / Manager',
    rbacLevel: 'B9',
    description: 'Team-level access with read visibility into people directory and operations. Cannot approve transactions or access financial details.',
    tabAccess: [
      'People', 'Operations', 'Reports',
    ],
    actions: [
      'View people directory', 'View operations dashboard',
      'Generate team reports', 'Request approvals',
    ],
  },
  {
    id: 'pkg-viewer',
    name: 'Read-Only Viewer',
    rbacLevel: 'B3',
    description: 'Limited read-only access to public-facing information. No action permissions. Suitable for external stakeholders and observers.',
    tabAccess: [
      'Entities', 'People', 'Reports',
    ],
    actions: [
      'View public entity info', 'View leadership directory',
      'View published reports',
    ],
  },
];

// =============================================================================
// ORG CHART NODES (derived from people + vacant seats)
// =============================================================================

const ORG_CHART_NODES: OrgChartNode[] = [
  // C-Suite
  {
    personId: 'ppl-001',
    name: 'Alex Morgan',
    title: 'CEO / Founder',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    level: 'C-Suite',
    reportsTo: null,
    directReportIds: ['ppl-002', 'ppl-003', 'ppl-004', 'ppl-005', 'ppl-007'],
    vacant: false,
    critical: true,
  },
  {
    personId: 'ppl-002',
    name: 'Marcus Chen',
    title: 'Chief Financial Officer',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    level: 'C-Suite',
    reportsTo: 'ppl-001',
    directReportIds: ['ppl-009'],
    vacant: false,
    critical: true,
  },
  {
    personId: 'ppl-003',
    name: 'Aisha Okonkwo',
    title: 'Chief Operating Officer',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    level: 'C-Suite',
    reportsTo: 'ppl-001',
    directReportIds: ['ppl-006'],
    vacant: false,
    critical: true,
  },
  {
    personId: 'ppl-004',
    name: 'David Park',
    title: 'General Counsel',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    level: 'C-Suite',
    reportsTo: 'ppl-001',
    directReportIds: [],
    vacant: false,
    critical: true,
  },
  // VP Level
  {
    personId: 'ppl-005',
    name: 'Elena Vasquez',
    title: 'VP Engineering',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    level: 'VP',
    reportsTo: 'ppl-001',
    directReportIds: ['ppl-008', 'ppl-010'],
    vacant: false,
    critical: true,
  },
  {
    personId: null,
    name: 'VACANT',
    title: 'VP Sales',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    level: 'VP',
    reportsTo: 'ppl-001',
    directReportIds: [],
    vacant: true,
    critical: true,
  },
  // Director Level
  {
    personId: 'ppl-006',
    name: 'James Okafor',
    title: 'Head of Partnerships',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    level: 'Director',
    reportsTo: 'ppl-003',
    directReportIds: [],
    vacant: false,
    critical: false,
  },
  {
    personId: 'ppl-007',
    name: 'Sarah Kim',
    title: 'Compliance Officer',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    level: 'Director',
    reportsTo: 'ppl-001',
    directReportIds: [],
    vacant: false,
    critical: true,
  },
  {
    personId: 'ppl-008',
    name: 'Omar Haddad',
    title: 'Director of Product',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    level: 'Director',
    reportsTo: 'ppl-005',
    directReportIds: [],
    vacant: false,
    critical: false,
  },
  {
    personId: null,
    name: 'VACANT',
    title: 'Head of Product',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    level: 'Director',
    reportsTo: 'ppl-005',
    directReportIds: [],
    vacant: true,
    critical: true,
  },
  // Manager Level
  {
    personId: 'ppl-009',
    name: 'Lisa Moreno',
    title: 'Finance Manager',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    level: 'Manager',
    reportsTo: 'ppl-002',
    directReportIds: [],
    vacant: false,
    critical: false,
  },
  // IC Level
  {
    personId: 'ppl-010',
    name: 'Tyler Washington',
    title: 'Senior Engineer',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    level: 'IC',
    reportsTo: 'ppl-005',
    directReportIds: [],
    vacant: false,
    critical: false,
  },
  {
    personId: null,
    name: 'VACANT',
    title: 'Board Observer',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    level: 'C-Suite',
    reportsTo: null,
    directReportIds: [],
    vacant: true,
    critical: false,
  },
];

// =============================================================================
// DATA GETTER
// =============================================================================

export function getBizPeopleData(entityScope: string | null) {
  const entityId = entityScope ? ENTITY_SCOPE_MAP[entityScope] ?? null : null;

  const filteredPeople = entityId
    ? PEOPLE.filter((p) => p.entityId === entityId)
    : PEOPLE;

  const filteredSeats = entityId
    ? ROLE_SEATS.filter((s) => s.entityId === entityId)
    : ROLE_SEATS;

  const filteredOrgChart = entityId
    ? ORG_CHART_NODES.filter((n) => {
        const entityName = entityId ? SEEDED_ENTITY_NAMES[entityId] : null;
        return entityName ? n.entityName === entityName : true;
      })
    : ORG_CHART_NODES;

  return {
    people: filteredPeople,
    roleSeats: filteredSeats,
    permissionPackages: PERMISSION_PACKAGES,
    orgChart: filteredOrgChart,
  };
}

// =============================================================================
// DERIVED HELPERS
// =============================================================================

export function getVacantCriticalCount(seats: RoleSeat[]): number {
  return seats.filter((s) => s.holder === null && s.critical).length;
}

export function getVacantCount(seats: RoleSeat[]): number {
  return seats.filter((s) => s.holder === null).length;
}

export function getFilledCount(seats: RoleSeat[]): number {
  return seats.filter((s) => s.holder !== null).length;
}

export function getSignatureHolders(people: BizPerson[]): BizPerson[] {
  return people.filter((p) => p.signatureAuthority !== 'none');
}

export function getCoveragePercent(seats: RoleSeat[]): number {
  if (seats.length === 0) return 0;
  return Math.round((getFilledCount(seats) / seats.length) * 100);
}

export function getPersonById(id: string): BizPerson | undefined {
  return PEOPLE.find((p) => p.id === id);
}

export function getPackageById(id: string): PermissionPackage | undefined {
  return PERMISSION_PACKAGES.find((p) => p.id === id);
}

// =============================================================================
// COVERAGE SCORES
// =============================================================================

export const COVERAGE_SCORES: Record<string, { filled: number; total: number }> = {
  exec: { filled: 3, total: 3 },
  finance: { filled: 2, total: 3 },
  rails: { filled: 2, total: 2 },
  compliance: { filled: 1, total: 2 },
  ops: { filled: 4, total: 5 },
  media: { filled: 1, total: 2 },
};
