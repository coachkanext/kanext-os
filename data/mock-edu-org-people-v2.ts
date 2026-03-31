/**
 * Education Organization People — Mock Data & Types (v2)
 * Directory, org chart, seats, permissions, domains, risk, invites, audit.
 * Lincoln University Oakland seeded data with realistic roles and coverage model.
 */

// =============================================================================
// TYPES
// =============================================================================

export type PersonStatus = 'active' | 'invited' | 'suspended';
export type AccessTier = 'founder' | 'board' | 'executive' | 'operator' | 'viewer';
export type Domain = 'admissions' | 'academics' | 'housing' | 'athletics' | 'finance' | 'compliance';
export type SeatCriticality = 'critical' | 'high' | 'normal';
export type CoverageCategory = 'executive' | 'admissions' | 'academic' | 'student_life' | 'finance' | 'compliance' | 'athletics';
export type AuthorityLevel = 'approve' | 'release' | 'admin' | 'none';
export type SensitiveAccess = 'low' | 'medium' | 'high';
export type PermissionScope = 'read' | 'write' | 'approve' | 'release';
export type RiskFlag = 'over_permissioned' | 'missing_coverage' | 'single_point_failure' | 'privileged_inactive';

export interface EduPerson {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: PersonStatus;
  accessTier: AccessTier;
  institutions: { id: string; name: string; shortName: string }[];
  seats: EduSeat[];
  domains: Domain[];
  canApprove: boolean;
  canReleaseFunds: boolean;
  sensitiveAccess: SensitiveAccess;
  lastAction?: string;
  lastActionDate?: string;
  ownsInitiatives: number;
  pendingApprovals: number;
  riskFlags: RiskFlag[];
}

export interface EduSeat {
  id: string;
  name: string;
  scope: 'organization' | 'institution' | 'department';
  scopeTarget?: string;
  criticality: SeatCriticality;
  assignedPerson?: string;
  assignedName?: string;
  permissions: PermissionScope[];
  approvalDomains: Domain[];
  whyItMatters: string;
  riskNotes?: string;
  isVacant: boolean;
}

export interface PermissionPackage {
  id: string;
  name: string;
  description: string;
  tier: AccessTier;
  readScopes: string[];
  writeScopes: string[];
  approveScopes: string[];
  releaseScopes: string[];
  sensitiveFields: string[];
}

export interface CoverageScore {
  category: CoverageCategory;
  score: number;
  gaps: string[];
}

export interface OrgChartNode {
  id: string;
  seatName: string;
  level: number;
  personName: string | null;
  institution?: string;
  hasApproveAuthority: boolean;
  hasReleaseAuthority: boolean;
  isCritical: boolean;
  children: string[];
}

export interface AuditEntry {
  id: string;
  action: string;
  target: string;
  actor: string;
  timestamp: string;
  category: 'seat_assignment' | 'permission_change' | 'invite' | 'release_authority';
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const PERSON_STATUS_LABELS: Record<PersonStatus, string> = {
  active: 'Active',
  invited: 'Invited',
  suspended: 'Suspended',
};

export const PERSON_STATUS_COLORS: Record<PersonStatus, string> = {
  active: '#5A8A6E',
  invited: '#B8943E',
  suspended: '#B85C5C',
};

export const ACCESS_TIER_LABELS: Record<AccessTier, string> = {
  founder: 'Founder / CEO',
  board: 'Board',
  executive: 'Executive',
  operator: 'Operator',
  viewer: 'Viewer',
};

export const ACCESS_TIER_COLORS: Record<AccessTier, string> = {
  founder: '#1A1714',
  board: '#1A1714',
  executive: '#1A1714',
  operator: '#B8943E',
  viewer: '#9C9790',
};

export const DOMAIN_LABELS: Record<Domain, string> = {
  admissions: 'Admissions',
  academics: 'Academics',
  housing: 'Housing',
  athletics: 'Athletics',
  finance: 'Finance',
  compliance: 'Compliance',
};

export const DOMAIN_COLORS: Record<Domain, string> = {
  admissions: '#1A1714',
  academics: '#1A1714',
  housing: '#5A8A6E',
  athletics: '#B8943E',
  finance: '#B8943E',
  compliance: '#B85C5C',
};

export const DOMAIN_ICONS: Record<Domain, string> = {
  admissions: 'person.badge.plus',
  academics: 'book.fill',
  housing: 'house.fill',
  athletics: 'sportscourt.fill',
  finance: 'dollarsign.circle.fill',
  compliance: 'shield.checkmark.fill',
};

export const SEAT_CRITICALITY_LABELS: Record<SeatCriticality, string> = {
  critical: 'Critical',
  high: 'High',
  normal: 'Normal',
};

export const SEAT_CRITICALITY_COLORS: Record<SeatCriticality, string> = {
  critical: '#B85C5C',
  high: '#B8943E',
  normal: '#5A8A6E',
};

export const COVERAGE_CATEGORY_LABELS: Record<CoverageCategory, string> = {
  executive: 'Executive Leadership',
  admissions: 'Admissions / Enrollment',
  academic: 'Academic Governance',
  student_life: 'Student Life / Housing',
  finance: 'Finance Controls',
  compliance: 'Compliance / Title IX',
  athletics: 'Athletics Governance',
};

export const COVERAGE_CATEGORY_ICONS: Record<CoverageCategory, string> = {
  executive: 'person.3.fill',
  admissions: 'person.badge.plus',
  academic: 'book.fill',
  student_life: 'house.fill',
  finance: 'dollarsign.circle.fill',
  compliance: 'shield.checkmark.fill',
  athletics: 'sportscourt.fill',
};

export const AUTHORITY_LABELS: Record<AuthorityLevel, string> = {
  approve: 'Can Approve',
  release: 'Can Release Funds',
  admin: 'Admin',
  none: 'None',
};

export const AUTHORITY_COLORS: Record<AuthorityLevel, string> = {
  approve: '#1A1714',
  release: '#5A8A6E',
  admin: '#1A1714',
  none: '#9C9790',
};

export const SENSITIVE_ACCESS_LABELS: Record<SensitiveAccess, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const SENSITIVE_ACCESS_COLORS: Record<SensitiveAccess, string> = {
  low: '#5A8A6E',
  medium: '#B8943E',
  high: '#B85C5C',
};

export const RISK_FLAG_LABELS: Record<RiskFlag, string> = {
  over_permissioned: 'Over-Permissioned',
  missing_coverage: 'Missing Coverage',
  single_point_failure: 'Single Point of Failure',
  privileged_inactive: 'Privileged Inactive',
};

export const RISK_FLAG_COLORS: Record<RiskFlag, string> = {
  over_permissioned: '#B8943E',
  missing_coverage: '#B85C5C',
  single_point_failure: '#1A1714',
  privileged_inactive: '#1A1714',
};

export const PERMISSION_SCOPE_LABELS: Record<PermissionScope, string> = {
  read: 'Read',
  write: 'Write',
  approve: 'Approve',
  release: 'Release',
};

export const AUDIT_CATEGORY_LABELS: Record<AuditEntry['category'], string> = {
  seat_assignment: 'Seat Assignment',
  permission_change: 'Permission Change',
  invite: 'Invite',
  release_authority: 'Release Authority',
};

export const AUDIT_CATEGORY_COLORS: Record<AuditEntry['category'], string> = {
  seat_assignment: '#1A1714',
  permission_change: '#1A1714',
  invite: '#5A8A6E',
  release_authority: '#B8943E',
};

// =============================================================================
// SEEDED SEATS
// =============================================================================

const SEATS: EduSeat[] = [
  {
    id: 'seat-001',
    name: 'President',
    scope: 'organization',
    criticality: 'critical',
    assignedPerson: 'edu-p-001',
    assignedName: 'Dr. Mikhail Brodsky',
    permissions: ['read', 'write', 'approve', 'release'],
    approvalDomains: ['admissions', 'academics', 'athletics', 'finance', 'compliance'],
    whyItMatters: 'Ultimate authority over all institutional operations and strategy.',
    isVacant: false,
  },
  {
    id: 'seat-002',
    name: 'Provost / CAO',
    scope: 'institution',
    scopeTarget: 'Lincoln',
    criticality: 'critical',
    assignedPerson: 'edu-p-002',
    assignedName: 'Dr. Themistoclis Pantos',
    permissions: ['read', 'write', 'approve'],
    approvalDomains: ['academics', 'admissions'],
    whyItMatters: 'Leads academic governance, program direction, and faculty affairs as sole CAO.',
    riskNotes: 'Dual-hatted as Provost and Director of Business Programs — single point of failure for academic governance.',
    isVacant: false,
  },
  {
    id: 'seat-003',
    name: 'Administrative Vice President',
    scope: 'institution',
    scopeTarget: 'Lincoln',
    criticality: 'high',
    assignedPerson: 'edu-p-003',
    assignedName: 'Dr. Michael Guerra',
    permissions: ['read', 'write', 'approve'],
    approvalDomains: ['finance', 'compliance'],
    whyItMatters: 'Oversees administrative operations, finance controls, and institutional compliance.',
    isVacant: false,
  },
  {
    id: 'seat-004',
    name: 'Director of Admissions & Registrar',
    scope: 'institution',
    scopeTarget: 'Lincoln',
    criticality: 'critical',
    assignedPerson: 'edu-p-004',
    assignedName: 'Ms. Maggie Hua',
    permissions: ['read', 'write', 'approve'],
    approvalDomains: ['admissions', 'academics'],
    whyItMatters: 'Manages full enrollment pipeline, admissions decisions, and official academic records.',
    riskNotes: 'Sole admissions officer — no backup during peak enrollment cycle.',
    isVacant: false,
  },
  {
    id: 'seat-005',
    name: 'Dean of Students',
    scope: 'institution',
    scopeTarget: 'Lincoln',
    criticality: 'high',
    assignedPerson: 'edu-p-005',
    assignedName: 'Dr. Mohamed Tailab',
    permissions: ['read', 'write', 'approve'],
    approvalDomains: ['academics', 'compliance'],
    whyItMatters: 'Student conduct, academic welfare, and student advocacy for 436 enrolled students.',
    isVacant: false,
  },
  {
    id: 'seat-006',
    name: 'QA & Accreditation Director',
    scope: 'institution',
    scopeTarget: 'Lincoln',
    criticality: 'critical',
    assignedPerson: 'edu-p-006',
    assignedName: 'Dr. Alexander Anokhin',
    permissions: ['read', 'write', 'approve'],
    approvalDomains: ['compliance', 'academics'],
    whyItMatters: 'Owns WSCUC accreditation self-study, QA processes, and regulatory readiness.',
    isVacant: false,
  },
  {
    id: 'seat-007',
    name: 'Senior Accounting Analyst',
    scope: 'institution',
    scopeTarget: 'Lincoln',
    criticality: 'high',
    assignedPerson: 'edu-p-007',
    assignedName: 'Ms. Yu Zhu Liang',
    permissions: ['read', 'write'],
    approvalDomains: ['finance'],
    whyItMatters: 'Manages day-to-day accounting, ledger entries, and financial reporting.',
    riskNotes: 'No release authority — disbursements require escalation to President or Admin VP.',
    isVacant: false,
  },
  {
    id: 'seat-008',
    name: 'Director of Diagnostic Imaging Laboratory',
    scope: 'department',
    scopeTarget: 'Lincoln — DI Lab',
    criticality: 'high',
    assignedPerson: 'edu-p-008',
    assignedName: 'Ms. Marina Kay',
    permissions: ['read', 'write'],
    approvalDomains: ['academics'],
    whyItMatters: 'Directs the Diagnostic Imaging program, lab operations, and clinical curriculum.',
    isVacant: false,
  },
  {
    id: 'seat-009',
    name: 'Head Librarian',
    scope: 'institution',
    scopeTarget: 'Lincoln',
    criticality: 'normal',
    assignedPerson: 'edu-p-009',
    assignedName: 'Ms. Nicole Y. Marsh',
    permissions: ['read', 'write'],
    approvalDomains: ['academics'],
    whyItMatters: 'Manages library resources, research support, and academic information services.',
    isVacant: false,
  },
  {
    id: 'seat-010',
    name: 'Director of Athletics',
    scope: 'institution',
    scopeTarget: 'Lincoln',
    criticality: 'high',
    assignedPerson: 'edu-p-010',
    assignedName: 'Mr. Desmond Gumbs',
    permissions: ['read', 'write', 'approve'],
    approvalDomains: ['athletics'],
    whyItMatters: 'Leads all athletics programs, NAIA compliance, and student-athlete welfare.',
    isVacant: false,
  },
  {
    id: 'seat-011',
    name: 'HR Coordinator / PDSO',
    scope: 'institution',
    scopeTarget: 'Lincoln',
    criticality: 'high',
    assignedPerson: 'edu-p-011',
    assignedName: 'Ms. Reenu Shrestha',
    permissions: ['read', 'write'],
    approvalDomains: ['compliance', 'admissions'],
    whyItMatters: 'Manages HR operations, personnel records, and serves as Primary Designated School Official for international students.',
    riskNotes: 'PDSO role dual-hatted with HR — creates bandwidth risk during I-20 peak seasons.',
    isVacant: false,
  },
  {
    id: 'seat-012',
    name: 'Assistant Basketball Coach & Recruiting Coordinator',
    scope: 'department',
    scopeTarget: 'Lincoln — Athletics',
    criticality: 'normal',
    assignedPerson: 'edu-p-012',
    assignedName: 'Sammy Kalejaiye',
    permissions: ['read'],
    approvalDomains: ['athletics'],
    whyItMatters: 'Supports basketball program operations and manages student-athlete recruiting pipeline.',
    isVacant: false,
  },
];

// =============================================================================
// SEEDED PEOPLE
// =============================================================================

const PEOPLE: EduPerson[] = [
  {
    id: 'edu-p-001',
    name: 'Dr. Mikhail Brodsky',
    email: 'president@lincolnuca.edu',
    phone: '(510) 208-2803',
    status: 'active',
    accessTier: 'founder',
    institutions: [{ id: 'inst-001', name: 'Lincoln University', shortName: 'Lincoln' }],
    seats: [SEATS[0]],
    domains: ['admissions', 'academics', 'athletics', 'finance', 'compliance'],
    canApprove: true,
    canReleaseFunds: true,
    sensitiveAccess: 'high',
    lastAction: 'Approved FY26 operating budget submission to Board',
    lastActionDate: '2026-03-10',
    ownsInitiatives: 4,
    pendingApprovals: 3,
    riskFlags: ['single_point_failure'],
  },
  {
    id: 'edu-p-002',
    name: 'Dr. Themistoclis Pantos',
    email: 'tpantos@lincolnuca.edu',
    phone: '(510) 628-8013',
    status: 'active',
    accessTier: 'executive',
    institutions: [{ id: 'inst-001', name: 'Lincoln University', shortName: 'Lincoln' }],
    seats: [SEATS[1]],
    domains: ['academics', 'admissions'],
    canApprove: true,
    canReleaseFunds: false,
    sensitiveAccess: 'high',
    lastAction: 'Submitted Spring 2026 curriculum review to President',
    lastActionDate: '2026-03-05',
    ownsInitiatives: 3,
    pendingApprovals: 2,
    riskFlags: ['single_point_failure'],
  },
  {
    id: 'edu-p-003',
    name: 'Dr. Michael Guerra',
    email: 'mguerra@lincolnuca.edu',
    phone: '(510) 628-8031',
    status: 'active',
    accessTier: 'executive',
    institutions: [{ id: 'inst-001', name: 'Lincoln University', shortName: 'Lincoln' }],
    seats: [SEATS[2]],
    domains: ['finance', 'compliance'],
    canApprove: true,
    canReleaseFunds: false,
    sensitiveAccess: 'high',
    lastAction: 'Reviewed Q2 financial statements with accounting team',
    lastActionDate: '2026-03-12',
    ownsInitiatives: 2,
    pendingApprovals: 2,
    riskFlags: [],
  },
  {
    id: 'edu-p-004',
    name: 'Ms. Maggie Hua',
    email: 'maggiehua@lincolnuca.edu',
    phone: '(510) 628-8038',
    status: 'active',
    accessTier: 'executive',
    institutions: [{ id: 'inst-001', name: 'Lincoln University', shortName: 'Lincoln' }],
    seats: [SEATS[3]],
    domains: ['admissions', 'academics'],
    canApprove: true,
    canReleaseFunds: false,
    sensitiveAccess: 'high',
    lastAction: 'Released Fall 2026 admissions decisions for international applicants',
    lastActionDate: '2026-03-18',
    ownsInitiatives: 2,
    pendingApprovals: 1,
    riskFlags: ['single_point_failure'],
  },
  {
    id: 'edu-p-005',
    name: 'Dr. Mohamed Tailab',
    email: 'mtailab@lincolnuca.edu',
    status: 'active',
    accessTier: 'operator',
    institutions: [{ id: 'inst-001', name: 'Lincoln University', shortName: 'Lincoln' }],
    seats: [SEATS[4]],
    domains: ['academics', 'compliance'],
    canApprove: true,
    canReleaseFunds: false,
    sensitiveAccess: 'medium',
    lastAction: 'Conducted student academic progress review for Spring 2026',
    lastActionDate: '2026-03-08',
    ownsInitiatives: 1,
    pendingApprovals: 1,
    riskFlags: [],
  },
  {
    id: 'edu-p-006',
    name: 'Dr. Alexander Anokhin',
    email: 'aanokhin@lincolnuca.edu',
    status: 'active',
    accessTier: 'operator',
    institutions: [{ id: 'inst-001', name: 'Lincoln University', shortName: 'Lincoln' }],
    seats: [SEATS[5]],
    domains: ['compliance', 'academics'],
    canApprove: true,
    canReleaseFunds: false,
    sensitiveAccess: 'high',
    lastAction: 'Updated WSCUC self-study documentation — Section 4 complete',
    lastActionDate: '2026-03-20',
    ownsInitiatives: 2,
    pendingApprovals: 1,
    riskFlags: [],
  },
  {
    id: 'edu-p-007',
    name: 'Ms. Yu Zhu Liang',
    email: 'accountingassistant@lincolnuca.edu',
    status: 'active',
    accessTier: 'operator',
    institutions: [{ id: 'inst-001', name: 'Lincoln University', shortName: 'Lincoln' }],
    seats: [SEATS[6]],
    domains: ['finance'],
    canApprove: false,
    canReleaseFunds: false,
    sensitiveAccess: 'high',
    lastAction: 'Reconciled March accounts payable ledger',
    lastActionDate: '2026-03-25',
    ownsInitiatives: 0,
    pendingApprovals: 0,
    riskFlags: [],
  },
  {
    id: 'edu-p-008',
    name: 'Ms. Marina Kay',
    email: 'mkay@lincolnuca.edu',
    status: 'active',
    accessTier: 'operator',
    institutions: [{ id: 'inst-001', name: 'Lincoln University', shortName: 'Lincoln' }],
    seats: [SEATS[7]],
    domains: ['academics'],
    canApprove: false,
    canReleaseFunds: false,
    sensitiveAccess: 'medium',
    lastAction: 'Updated DI Lab clinical rotation schedule for Spring 2026',
    lastActionDate: '2026-03-01',
    ownsInitiatives: 1,
    pendingApprovals: 0,
    riskFlags: [],
  },
  {
    id: 'edu-p-009',
    name: 'Ms. Nicole Y. Marsh',
    email: 'nmarsh@lincolnuca.edu',
    phone: '(510) 379-4053',
    status: 'active',
    accessTier: 'viewer',
    institutions: [{ id: 'inst-001', name: 'Lincoln University', shortName: 'Lincoln' }],
    seats: [SEATS[8]],
    domains: ['academics'],
    canApprove: false,
    canReleaseFunds: false,
    sensitiveAccess: 'low',
    lastAction: 'Updated library catalog with new periodical acquisitions',
    lastActionDate: '2026-03-14',
    ownsInitiatives: 0,
    pendingApprovals: 0,
    riskFlags: [],
  },
  {
    id: 'edu-p-010',
    name: 'Mr. Desmond Gumbs',
    email: 'dgumbs@lincolnuca.edu',
    phone: '(510) 250-6977',
    status: 'active',
    accessTier: 'operator',
    institutions: [{ id: 'inst-001', name: 'Lincoln University', shortName: 'Lincoln' }],
    seats: [SEATS[9]],
    domains: ['athletics'],
    canApprove: true,
    canReleaseFunds: false,
    sensitiveAccess: 'medium',
    lastAction: 'Filed NAIA eligibility certifications for Spring roster',
    lastActionDate: '2026-03-07',
    ownsInitiatives: 1,
    pendingApprovals: 1,
    riskFlags: [],
  },
  {
    id: 'edu-p-011',
    name: 'Ms. Reenu Shrestha',
    email: 'sreenu@lincolnuca.edu',
    phone: '(510) 628-8017',
    status: 'active',
    accessTier: 'operator',
    institutions: [{ id: 'inst-001', name: 'Lincoln University', shortName: 'Lincoln' }],
    seats: [SEATS[10]],
    domains: ['compliance', 'admissions'],
    canApprove: false,
    canReleaseFunds: false,
    sensitiveAccess: 'medium',
    lastAction: 'Processed I-20 renewals for Spring 2026 international cohort',
    lastActionDate: '2026-03-16',
    ownsInitiatives: 0,
    pendingApprovals: 0,
    riskFlags: [],
  },
  {
    id: 'edu-p-012',
    name: 'Sammy Kalejaiye',
    email: 'skalejaiye@lincolnuca.edu',
    status: 'active',
    accessTier: 'viewer',
    institutions: [{ id: 'inst-001', name: 'Lincoln University', shortName: 'Lincoln' }],
    seats: [SEATS[11]],
    domains: ['athletics'],
    canApprove: false,
    canReleaseFunds: false,
    sensitiveAccess: 'low',
    lastAction: 'Submitted Spring 2026 recruiting contact log',
    lastActionDate: '2026-03-22',
    ownsInitiatives: 0,
    pendingApprovals: 0,
    riskFlags: [],
  },
];

// =============================================================================
// COVERAGE SCORES
// =============================================================================

const COVERAGE_SCORES: CoverageScore[] = [
  {
    category: 'executive',
    score: 85,
    gaps: ['No formal succession plan for President role'],
  },
  {
    category: 'admissions',
    score: 75,
    gaps: [
      'Single admissions officer — no backup for peak cycle',
      'PDSO dual-hatted with HR',
    ],
  },
  {
    category: 'academic',
    score: 88,
    gaps: ['Provost is sole academic governance authority'],
  },
  {
    category: 'finance',
    score: 70,
    gaps: [
      'No dedicated financial controller',
      'Accounting analyst has limited authority',
      'No release authority backup',
    ],
  },
  {
    category: 'compliance',
    score: 90,
    gaps: ['WSCUC review June 2026 — self-study 78% complete'],
  },
  {
    category: 'athletics',
    score: 80,
    gaps: ['Assistant coaching role has read-only system access'],
  },
];

// =============================================================================
// PERMISSION PACKAGES
// =============================================================================

const PERMISSION_PACKAGES: PermissionPackage[] = [
  {
    id: 'pkg-001',
    name: 'Founder / CEO Full',
    description: 'Full read, write, approve, and release authority across all domains and institutions.',
    tier: 'founder',
    readScopes: ['all_domains', 'all_institutions', 'all_financials', 'all_personnel', 'all_compliance'],
    writeScopes: ['all_domains', 'all_institutions', 'all_financials', 'all_personnel', 'all_compliance'],
    approveScopes: ['budgets', 'hiring', 'expulsions', 'capital_expenditures', 'contracts', 'policy_changes'],
    releaseScopes: ['payroll', 'vendor_payments', 'capital_projects'],
    sensitiveFields: ['SSN', 'FERPA records', 'salary data', 'disciplinary records', 'I-20 case files'],
  },
  {
    id: 'pkg-002',
    name: 'Board Pack',
    description: 'Read-only dashboards and aggregate reports. Approve authority on strategic items only.',
    tier: 'board',
    readScopes: ['aggregate_financials', 'enrollment_dashboards', 'compliance_summaries', 'strategic_plan'],
    writeScopes: ['board_resolutions', 'committee_minutes'],
    approveScopes: ['president_evaluation', 'strategic_plan', 'annual_budget', 'new_programs'],
    releaseScopes: [],
    sensitiveFields: ['aggregate_salary_bands', 'audit_findings'],
  },
  {
    id: 'pkg-003',
    name: 'President Pack',
    description: 'Full operational access with approve and release authority across all campus operations.',
    tier: 'executive',
    readScopes: ['all_domains', 'all_institutions', 'all_financials', 'all_personnel', 'all_compliance'],
    writeScopes: ['all_domains', 'all_institutions', 'personnel_actions', 'policy_documents'],
    approveScopes: ['budgets', 'hiring', 'expulsions', 'capital_expenditures', 'contracts'],
    releaseScopes: ['payroll', 'vendor_payments'],
    sensitiveFields: ['SSN', 'FERPA records', 'salary data', 'disciplinary records', 'I-20 case files'],
  },
  {
    id: 'pkg-004',
    name: 'Provost Pack',
    description: 'Academic governance, faculty management, curriculum oversight, and program accreditation.',
    tier: 'executive',
    readScopes: ['academics', 'admissions', 'faculty_records', 'enrollment_data', 'accreditation_documents'],
    writeScopes: ['curriculum', 'academic_calendar', 'faculty_evaluations', 'program_proposals'],
    approveScopes: ['curriculum_changes', 'faculty_hiring', 'academic_probation', 'program_launches'],
    releaseScopes: [],
    sensitiveFields: ['faculty_evaluations', 'tenure_decisions', 'FERPA records'],
  },
  {
    id: 'pkg-005',
    name: 'Finance Pack',
    description: 'Financial operations, reporting, and accounting controls.',
    tier: 'operator',
    readScopes: ['all_financials', 'vendor_records', 'payroll_data'],
    writeScopes: ['journal_entries', 'purchase_orders', 'vendor_setup'],
    approveScopes: ['purchase_orders', 'refunds'],
    releaseScopes: [],
    sensitiveFields: ['SSN', 'bank_account_numbers', 'salary_data'],
  },
];

// =============================================================================
// ORG CHART
// =============================================================================

const ORG_CHART: OrgChartNode[] = [
  {
    id: 'org-001',
    seatName: 'Board of Trustees',
    level: 0,
    personName: null,
    institution: 'Lincoln',
    hasApproveAuthority: true,
    hasReleaseAuthority: false,
    isCritical: true,
    children: ['org-002'],
  },
  {
    id: 'org-002',
    seatName: 'President',
    level: 1,
    personName: 'Dr. Mikhail Brodsky',
    institution: 'Lincoln',
    hasApproveAuthority: true,
    hasReleaseAuthority: true,
    isCritical: true,
    children: ['org-003', 'org-004', 'org-005', 'org-006', 'org-007', 'org-008'],
  },
  {
    id: 'org-003',
    seatName: 'Provost / CAO',
    level: 2,
    personName: 'Dr. Themistoclis Pantos',
    institution: 'Lincoln',
    hasApproveAuthority: true,
    hasReleaseAuthority: false,
    isCritical: true,
    children: [],
  },
  {
    id: 'org-004',
    seatName: 'Administrative Vice President',
    level: 2,
    personName: 'Dr. Michael Guerra',
    institution: 'Lincoln',
    hasApproveAuthority: true,
    hasReleaseAuthority: false,
    isCritical: false,
    children: [],
  },
  {
    id: 'org-005',
    seatName: 'Director of Admissions & Registrar',
    level: 2,
    personName: 'Ms. Maggie Hua',
    institution: 'Lincoln',
    hasApproveAuthority: true,
    hasReleaseAuthority: false,
    isCritical: true,
    children: [],
  },
  {
    id: 'org-006',
    seatName: 'Dean of Students',
    level: 2,
    personName: 'Dr. Mohamed Tailab',
    institution: 'Lincoln',
    hasApproveAuthority: true,
    hasReleaseAuthority: false,
    isCritical: false,
    children: [],
  },
  {
    id: 'org-007',
    seatName: 'QA & Accreditation Director',
    level: 2,
    personName: 'Dr. Alexander Anokhin',
    institution: 'Lincoln',
    hasApproveAuthority: true,
    hasReleaseAuthority: false,
    isCritical: true,
    children: [],
  },
  {
    id: 'org-008',
    seatName: 'Director of Athletics',
    level: 2,
    personName: 'Mr. Desmond Gumbs',
    institution: 'Lincoln',
    hasApproveAuthority: true,
    hasReleaseAuthority: false,
    isCritical: false,
    children: [],
  },
];

// =============================================================================
// AUDIT LOG
// =============================================================================

const AUDIT_LOG: AuditEntry[] = [
  {
    id: 'aud-001',
    action: 'Assigned seat: President',
    target: 'Dr. Mikhail Brodsky',
    actor: 'Board of Trustees',
    timestamp: '2025-07-01T10:00:00Z',
    category: 'seat_assignment',
  },
  {
    id: 'aud-002',
    action: 'Granted release authority for institutional disbursements',
    target: 'Dr. Mikhail Brodsky',
    actor: 'Board of Trustees',
    timestamp: '2025-07-01T10:15:00Z',
    category: 'release_authority',
  },
  {
    id: 'aud-003',
    action: 'Invite sent for Provost / CAO seat',
    target: 'Dr. Themistoclis Pantos',
    actor: 'Dr. Mikhail Brodsky',
    timestamp: '2025-08-05T09:00:00Z',
    category: 'invite',
  },
  {
    id: 'aud-004',
    action: 'Invite accepted — Provost / CAO',
    target: 'Dr. Themistoclis Pantos',
    actor: 'Dr. Themistoclis Pantos',
    timestamp: '2025-08-07T11:30:00Z',
    category: 'invite',
  },
  {
    id: 'aud-005',
    action: 'Granted WSCUC self-study document access — compliance domain',
    target: 'Dr. Alexander Anokhin',
    actor: 'Dr. Mikhail Brodsky',
    timestamp: '2025-09-15T14:00:00Z',
    category: 'permission_change',
  },
  {
    id: 'aud-006',
    action: 'Assigned seat: HR Coordinator / PDSO',
    target: 'Ms. Reenu Shrestha',
    actor: 'Dr. Mikhail Brodsky',
    timestamp: '2025-10-01T09:45:00Z',
    category: 'seat_assignment',
  },
  {
    id: 'aud-007',
    action: 'Invite sent for Assistant Basketball Coach seat',
    target: 'Sammy Kalejaiye',
    actor: 'Mr. Desmond Gumbs',
    timestamp: '2026-01-12T13:00:00Z',
    category: 'invite',
  },
  {
    id: 'aud-008',
    action: 'Invite accepted — Assistant Basketball Coach & Recruiting Coordinator',
    target: 'Sammy Kalejaiye',
    actor: 'Sammy Kalejaiye',
    timestamp: '2026-01-14T10:20:00Z',
    category: 'invite',
  },
];

// =============================================================================
// DATA ACCESSOR
// =============================================================================

export function getEduPeopleV2Data(): {
  people: EduPerson[];
  seats: EduSeat[];
  permissionPackages: PermissionPackage[];
  coverageScores: CoverageScore[];
  orgChart: OrgChartNode[];
  auditLog: AuditEntry[];
  overviewTiles: {
    totalPeople: number;
    activePeople: number;
    vacantCriticalSeats: number;
    coverageScore: number;
    pendingInvites: number;
    riskFlags: number;
  };
} {
  const totalPeople = PEOPLE.length;
  const activePeople = PEOPLE.filter((p) => p.status === 'active').length;
  const vacantCriticalSeats = SEATS.filter((seat) => seat.isVacant && seat.criticality === 'critical').length;
  const coverageScore = Math.round(
    COVERAGE_SCORES.reduce((sum, c) => sum + c.score, 0) / COVERAGE_SCORES.length,
  );
  const pendingInvites = PEOPLE.filter((p) => p.status === 'invited').length;
  const riskFlags = PEOPLE.reduce((sum, p) => sum + p.riskFlags.length, 0);

  return {
    people: PEOPLE,
    seats: SEATS,
    permissionPackages: PERMISSION_PACKAGES,
    coverageScores: COVERAGE_SCORES,
    orgChart: ORG_CHART,
    auditLog: AUDIT_LOG,
    overviewTiles: {
      totalPeople,
      activePeople,
      vacantCriticalSeats,
      coverageScore,
      pendingInvites,
      riskFlags,
    },
  };
}
