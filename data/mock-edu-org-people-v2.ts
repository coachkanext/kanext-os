/**
 * Education Organization People — Mock Data & Types (v2)
 * Directory, org chart, seats, permissions, domains, risk, invites, audit.
 * HBCU / Higher-Ed seeded data with realistic roles and coverage model.
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
  active: '#22C55E',
  invited: '#F59E0B',
  suspended: '#EF4444',
};

export const ACCESS_TIER_LABELS: Record<AccessTier, string> = {
  founder: 'Founder / CEO',
  board: 'Board',
  executive: 'Executive',
  operator: 'Operator',
  viewer: 'Viewer',
};

export const ACCESS_TIER_COLORS: Record<AccessTier, string> = {
  founder: '#1D9BF0',
  board: '#1D9BF0',
  executive: '#1D9BF0',
  operator: '#F59E0B',
  viewer: '#A1A1AA',
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
  admissions: '#1D9BF0',
  academics: '#1D9BF0',
  housing: '#22C55E',
  athletics: '#F59E0B',
  finance: '#F59E0B',
  compliance: '#EF4444',
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
  critical: '#EF4444',
  high: '#F59E0B',
  normal: '#22C55E',
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
  approve: '#1D9BF0',
  release: '#22C55E',
  admin: '#1D9BF0',
  none: '#A1A1AA',
};

export const SENSITIVE_ACCESS_LABELS: Record<SensitiveAccess, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const SENSITIVE_ACCESS_COLORS: Record<SensitiveAccess, string> = {
  low: '#22C55E',
  medium: '#F59E0B',
  high: '#EF4444',
};

export const RISK_FLAG_LABELS: Record<RiskFlag, string> = {
  over_permissioned: 'Over-Permissioned',
  missing_coverage: 'Missing Coverage',
  single_point_failure: 'Single Point of Failure',
  privileged_inactive: 'Privileged Inactive',
};

export const RISK_FLAG_COLORS: Record<RiskFlag, string> = {
  over_permissioned: '#F59E0B',
  missing_coverage: '#EF4444',
  single_point_failure: '#1D9BF0',
  privileged_inactive: '#1D9BF0',
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
  seat_assignment: '#1D9BF0',
  permission_change: '#1D9BF0',
  invite: '#22C55E',
  release_authority: '#F59E0B',
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
    assignedName: 'Dr. Roslyn Clark',
    permissions: ['read', 'write', 'approve', 'release'],
    approvalDomains: ['admissions', 'academics', 'housing', 'athletics', 'finance', 'compliance'],
    whyItMatters: 'Ultimate authority over all institutional operations and strategy.',
    isVacant: false,
  },
  {
    id: 'seat-002',
    name: 'Provost',
    scope: 'institution',
    scopeTarget: 'KaNeXT',
    criticality: 'critical',
    assignedPerson: 'edu-p-002',
    assignedName: 'Dr. Alex Morgan',
    permissions: ['read', 'write', 'approve'],
    approvalDomains: ['academics', 'admissions'],
    whyItMatters: 'Leads academic governance, faculty affairs, and program accreditation.',
    isVacant: false,
  },
  {
    id: 'seat-003',
    name: 'Registrar',
    scope: 'institution',
    scopeTarget: 'KaNeXT',
    criticality: 'high',
    assignedPerson: 'edu-p-005',
    assignedName: 'Dr. Angela Davis',
    permissions: ['read', 'write', 'approve'],
    approvalDomains: ['academics'],
    whyItMatters: 'Manages academic records, transcripts, and enrollment verification.',
    isVacant: false,
  },
  {
    id: 'seat-004',
    name: 'Director of Admissions',
    scope: 'institution',
    scopeTarget: 'KaNeXT',
    criticality: 'critical',
    assignedPerson: 'edu-p-003',
    assignedName: 'Janet Williams',
    permissions: ['read', 'write', 'approve'],
    approvalDomains: ['admissions', 'housing'],
    whyItMatters: 'Drives enrollment pipeline, admissions decisions, and yield strategy.',
    isVacant: false,
  },
  {
    id: 'seat-005',
    name: 'Financial Aid Director',
    scope: 'institution',
    scopeTarget: 'KaNeXT',
    criticality: 'high',
    assignedPerson: 'edu-p-010',
    assignedName: 'Lisa Martinez',
    permissions: ['read', 'write', 'approve'],
    approvalDomains: ['finance'],
    whyItMatters: 'Administers federal, state, and institutional financial aid programs.',
    isVacant: false,
  },
  {
    id: 'seat-006',
    name: 'Bursar / Controller',
    scope: 'institution',
    scopeTarget: 'KaNeXT',
    criticality: 'critical',
    assignedPerson: 'edu-p-004',
    assignedName: 'Robert Chen',
    permissions: ['read', 'write', 'approve', 'release'],
    approvalDomains: ['finance'],
    whyItMatters: 'Controls all financial disbursements, tuition billing, and fund accounting.',
    isVacant: false,
  },
  {
    id: 'seat-007',
    name: 'Housing Director',
    scope: 'institution',
    scopeTarget: 'KaNeXT',
    criticality: 'high',
    assignedPerson: 'edu-p-007',
    assignedName: 'Sarah Johnson',
    permissions: ['read', 'write'],
    approvalDomains: ['housing'],
    whyItMatters: 'Oversees residential life, room assignments, and housing facilities.',
    isVacant: false,
  },
  {
    id: 'seat-008',
    name: 'Compliance Officer',
    scope: 'institution',
    scopeTarget: 'KaNeXT',
    criticality: 'critical',
    assignedPerson: 'edu-p-006',
    assignedName: 'Michael Torres',
    permissions: ['read', 'write', 'approve'],
    approvalDomains: ['compliance'],
    whyItMatters: 'Ensures federal/state regulatory compliance, accreditation readiness, and policy enforcement.',
    isVacant: false,
  },
  {
    id: 'seat-009',
    name: 'Title IX Officer',
    scope: 'institution',
    scopeTarget: 'KaNeXT',
    criticality: 'critical',
    assignedPerson: 'edu-p-006',
    assignedName: 'Michael Torres',
    permissions: ['read', 'write', 'approve'],
    approvalDomains: ['compliance'],
    whyItMatters: 'Manages Title IX investigations, training, and institutional response.',
    riskNotes: 'Dual-hatted with Compliance Officer — succession risk.',
    isVacant: false,
  },
  {
    id: 'seat-010',
    name: 'IT / Systems Admin',
    scope: 'institution',
    scopeTarget: 'KaNeXT',
    criticality: 'high',
    assignedPerson: 'edu-p-008',
    assignedName: 'David Park',
    permissions: ['read', 'write'],
    approvalDomains: [],
    whyItMatters: 'Manages all technical systems, data security, and platform administration.',
    riskNotes: 'Has broad technical access across all domains.',
    isVacant: false,
  },
  {
    id: 'seat-011',
    name: 'Athletics Director',
    scope: 'institution',
    scopeTarget: 'KaNeXT',
    criticality: 'normal',
    permissions: ['read', 'write', 'approve'],
    approvalDomains: ['athletics'],
    whyItMatters: 'Leads athletics programs, NCAA compliance, and student-athlete welfare.',
    riskNotes: 'VACANT — Athletics governance gap. NCAA compliance risk.',
    isVacant: true,
  },
  {
    id: 'seat-012',
    name: 'Dean of Students',
    scope: 'institution',
    scopeTarget: 'KaNeXT',
    criticality: 'high',
    permissions: ['read', 'write', 'approve'],
    approvalDomains: ['housing', 'compliance'],
    whyItMatters: 'Student conduct, judicial affairs, and student advocacy.',
    riskNotes: 'VACANT — Student conduct oversight and advocacy gap.',
    isVacant: true,
  },
];

// =============================================================================
// SEEDED PEOPLE
// =============================================================================

const PEOPLE: EduPerson[] = [
  {
    id: 'edu-p-001',
    name: 'Dr. Roslyn Clark',
    email: 'rclark@kanext.edu',
    phone: '(803) 555-0101',
    status: 'active',
    accessTier: 'founder',
    institutions: [{ id: 'inst-001', name: 'Frederick Memorial University', shortName: 'KaNeXT' }],
    seats: [SEATS[0]],
    domains: ['admissions', 'academics', 'housing', 'athletics', 'finance', 'compliance'],
    canApprove: true,
    canReleaseFunds: true,
    sensitiveAccess: 'high',
    lastAction: 'Approved FY27 operating budget',
    lastActionDate: '2026-02-17',
    ownsInitiatives: 5,
    pendingApprovals: 4,
    riskFlags: ['single_point_failure'],
  },
  {
    id: 'edu-p-002',
    name: 'Dr. Alex Morgan',
    email: 'mthompson@kanext.edu',
    phone: '(803) 555-0102',
    status: 'active',
    accessTier: 'executive',
    institutions: [{ id: 'inst-001', name: 'Frederick Memorial University', shortName: 'KaNeXT' }],
    seats: [SEATS[1]],
    domains: ['academics', 'admissions'],
    canApprove: true,
    canReleaseFunds: false,
    sensitiveAccess: 'high',
    lastAction: 'Submitted curriculum revision for Board review',
    lastActionDate: '2026-02-15',
    ownsInitiatives: 3,
    pendingApprovals: 2,
    riskFlags: [],
  },
  {
    id: 'edu-p-003',
    name: 'Janet Williams',
    email: 'jwilliams@kanext.edu',
    phone: '(803) 555-0103',
    status: 'active',
    accessTier: 'executive',
    institutions: [{ id: 'inst-001', name: 'Frederick Memorial University', shortName: 'KaNeXT' }],
    seats: [SEATS[3]],
    domains: ['admissions', 'housing'],
    canApprove: true,
    canReleaseFunds: false,
    sensitiveAccess: 'medium',
    lastAction: 'Released Spring 2026 admissions decisions',
    lastActionDate: '2026-02-14',
    ownsInitiatives: 2,
    pendingApprovals: 1,
    riskFlags: [],
  },
  {
    id: 'edu-p-004',
    name: 'Robert Chen',
    email: 'rchen@kanext.edu',
    phone: '(803) 555-0104',
    status: 'active',
    accessTier: 'executive',
    institutions: [{ id: 'inst-001', name: 'Frederick Memorial University', shortName: 'KaNeXT' }],
    seats: [SEATS[5]],
    domains: ['finance'],
    canApprove: true,
    canReleaseFunds: true,
    sensitiveAccess: 'high',
    lastAction: 'Processed February payroll disbursement',
    lastActionDate: '2026-02-16',
    ownsInitiatives: 2,
    pendingApprovals: 3,
    riskFlags: [],
  },
  {
    id: 'edu-p-005',
    name: 'Dr. Angela Davis',
    email: 'adavis@kanext.edu',
    phone: '(803) 555-0105',
    status: 'active',
    accessTier: 'operator',
    institutions: [{ id: 'inst-001', name: 'Frederick Memorial University', shortName: 'KaNeXT' }],
    seats: [SEATS[2]],
    domains: ['academics'],
    canApprove: true,
    canReleaseFunds: false,
    sensitiveAccess: 'medium',
    lastAction: 'Published Spring 2026 class schedule',
    lastActionDate: '2026-02-10',
    ownsInitiatives: 1,
    pendingApprovals: 0,
    riskFlags: [],
  },
  {
    id: 'edu-p-006',
    name: 'Michael Torres',
    email: 'mtorres@kanext.edu',
    phone: '(803) 555-0106',
    status: 'active',
    accessTier: 'operator',
    institutions: [{ id: 'inst-001', name: 'Frederick Memorial University', shortName: 'KaNeXT' }],
    seats: [SEATS[7], SEATS[8]],
    domains: ['compliance'],
    canApprove: true,
    canReleaseFunds: false,
    sensitiveAccess: 'high',
    lastAction: 'Filed mid-year Clery Act report',
    lastActionDate: '2026-02-12',
    ownsInitiatives: 2,
    pendingApprovals: 1,
    riskFlags: ['single_point_failure'],
  },
  {
    id: 'edu-p-007',
    name: 'Sarah Johnson',
    email: 'sjohnson@kanext.edu',
    phone: '(803) 555-0107',
    status: 'active',
    accessTier: 'operator',
    institutions: [{ id: 'inst-001', name: 'Frederick Memorial University', shortName: 'KaNeXT' }],
    seats: [SEATS[6]],
    domains: ['housing'],
    canApprove: false,
    canReleaseFunds: false,
    sensitiveAccess: 'medium',
    lastAction: 'Completed Spring room assignments',
    lastActionDate: '2026-02-08',
    ownsInitiatives: 1,
    pendingApprovals: 0,
    riskFlags: [],
  },
  {
    id: 'edu-p-008',
    name: 'David Park',
    email: 'dpark@kanext.edu',
    phone: '(803) 555-0108',
    status: 'active',
    accessTier: 'operator',
    institutions: [{ id: 'inst-001', name: 'Frederick Memorial University', shortName: 'KaNeXT' }],
    seats: [SEATS[9]],
    domains: ['admissions', 'academics', 'housing', 'athletics', 'finance', 'compliance'],
    canApprove: false,
    canReleaseFunds: false,
    sensitiveAccess: 'high',
    lastAction: 'Patched SIS security vulnerability',
    lastActionDate: '2026-02-16',
    ownsInitiatives: 0,
    pendingApprovals: 0,
    riskFlags: ['over_permissioned'],
  },
  {
    id: 'edu-p-010',
    name: 'Lisa Martinez',
    email: 'lmartinez@kanext.edu',
    phone: '(803) 555-0110',
    status: 'active',
    accessTier: 'operator',
    institutions: [{ id: 'inst-001', name: 'Frederick Memorial University', shortName: 'KaNeXT' }],
    seats: [SEATS[4]],
    domains: ['finance'],
    canApprove: true,
    canReleaseFunds: false,
    sensitiveAccess: 'high',
    lastAction: 'Submitted FAFSA reconciliation report',
    lastActionDate: '2026-02-13',
    ownsInitiatives: 1,
    pendingApprovals: 1,
    riskFlags: [],
  },
];

// =============================================================================
// COVERAGE SCORES
// =============================================================================

const COVERAGE_SCORES: CoverageScore[] = [
  {
    category: 'executive',
    score: 90,
    gaps: ['No succession plan documented for President seat'],
  },
  {
    category: 'admissions',
    score: 85,
    gaps: ['No backup for Director of Admissions during peak cycle'],
  },
  {
    category: 'academic',
    score: 80,
    gaps: ['Registrar has no cross-trained backup', 'Dean of Students seat vacant'],
  },
  {
    category: 'student_life',
    score: 75,
    gaps: ['Dean of Students seat vacant', 'Housing Director is sole operator'],
  },
  {
    category: 'finance',
    score: 95,
    gaps: ['Bursar is single release authority'],
  },
  {
    category: 'compliance',
    score: 70,
    gaps: ['Title IX and Compliance Officer are same person', 'No backup for Clery Act reporting'],
  },
  {
    category: 'athletics',
    score: 40,
    gaps: ['Athletics Director seat vacant', 'No NCAA compliance liaison assigned', 'No student-athlete welfare oversight'],
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
    releaseScopes: ['payroll', 'vendor_payments', 'financial_aid_disbursements', 'capital_projects'],
    sensitiveFields: ['SSN', 'FERPA records', 'salary data', 'disciplinary records', 'Title IX case files'],
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
    releaseScopes: ['payroll', 'vendor_payments', 'financial_aid_disbursements'],
    sensitiveFields: ['SSN', 'FERPA records', 'salary data', 'disciplinary records', 'Title IX case files'],
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
    description: 'Financial operations, reporting, disbursements, and audit controls.',
    tier: 'operator',
    readScopes: ['all_financials', 'vendor_records', 'payroll_data', 'financial_aid_records'],
    writeScopes: ['journal_entries', 'purchase_orders', 'vendor_setup', 'financial_aid_awards'],
    approveScopes: ['purchase_orders', 'financial_aid_awards', 'refunds'],
    releaseScopes: ['payroll', 'vendor_payments', 'financial_aid_disbursements'],
    sensitiveFields: ['SSN', 'bank_account_numbers', 'salary_data', 'financial_aid_amounts'],
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
    institution: 'KaNeXT',
    hasApproveAuthority: true,
    hasReleaseAuthority: false,
    isCritical: true,
    children: ['org-002'],
  },
  {
    id: 'org-002',
    seatName: 'President',
    level: 1,
    personName: 'Dr. Roslyn Clark',
    institution: 'KaNeXT',
    hasApproveAuthority: true,
    hasReleaseAuthority: true,
    isCritical: true,
    children: ['org-003', 'org-004', 'org-005', 'org-006', 'org-007', 'org-008', 'org-009'],
  },
  {
    id: 'org-003',
    seatName: 'Provost',
    level: 2,
    personName: 'Dr. Alex Morgan',
    institution: 'KaNeXT',
    hasApproveAuthority: true,
    hasReleaseAuthority: false,
    isCritical: true,
    children: [],
  },
  {
    id: 'org-004',
    seatName: 'VP of Enrollment / Dir. of Admissions',
    level: 2,
    personName: 'Janet Williams',
    institution: 'KaNeXT',
    hasApproveAuthority: true,
    hasReleaseAuthority: false,
    isCritical: true,
    children: [],
  },
  {
    id: 'org-005',
    seatName: 'Bursar / Controller',
    level: 2,
    personName: 'Robert Chen',
    institution: 'KaNeXT',
    hasApproveAuthority: true,
    hasReleaseAuthority: true,
    isCritical: true,
    children: [],
  },
  {
    id: 'org-006',
    seatName: 'Compliance Officer / Title IX',
    level: 2,
    personName: 'Michael Torres',
    institution: 'KaNeXT',
    hasApproveAuthority: true,
    hasReleaseAuthority: false,
    isCritical: true,
    children: [],
  },
  {
    id: 'org-007',
    seatName: 'Housing Director',
    level: 2,
    personName: 'Sarah Johnson',
    institution: 'KaNeXT',
    hasApproveAuthority: false,
    hasReleaseAuthority: false,
    isCritical: false,
    children: [],
  },
  {
    id: 'org-008',
    seatName: 'IT / Systems Admin',
    level: 2,
    personName: 'David Park',
    institution: 'KaNeXT',
    hasApproveAuthority: false,
    hasReleaseAuthority: false,
    isCritical: false,
    children: [],
  },
  {
    id: 'org-009',
    seatName: 'Athletics Director',
    level: 2,
    personName: null,
    institution: 'KaNeXT',
    hasApproveAuthority: false,
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
    target: 'Dr. Roslyn Clark',
    actor: 'Board of Trustees',
    timestamp: '2025-08-15T10:00:00Z',
    category: 'seat_assignment',
  },
  {
    id: 'aud-002',
    action: 'Granted release authority for payroll',
    target: 'Robert Chen',
    actor: 'Dr. Roslyn Clark',
    timestamp: '2025-09-01T14:30:00Z',
    category: 'release_authority',
  },
  {
    id: 'aud-003',
    action: 'Invite sent for Provost seat',
    target: 'Dr. Alex Morgan',
    actor: 'Dr. Roslyn Clark',
    timestamp: '2025-09-10T09:00:00Z',
    category: 'invite',
  },
  {
    id: 'aud-004',
    action: 'Invite accepted — Provost',
    target: 'Dr. Alex Morgan',
    actor: 'Dr. Alex Morgan',
    timestamp: '2025-09-12T11:15:00Z',
    category: 'invite',
  },
  {
    id: 'aud-005',
    action: 'Assigned dual seat: Title IX Officer',
    target: 'Michael Torres',
    actor: 'Dr. Roslyn Clark',
    timestamp: '2025-10-05T16:00:00Z',
    category: 'seat_assignment',
  },
  {
    id: 'aud-006',
    action: 'Permission upgrade: write access to all domains (technical)',
    target: 'David Park',
    actor: 'Dr. Roslyn Clark',
    timestamp: '2025-11-20T08:45:00Z',
    category: 'permission_change',
  },
  {
    id: 'aud-007',
    action: 'Invite sent for Financial Aid Director seat',
    target: 'Lisa Martinez',
    actor: 'Robert Chen',
    timestamp: '2026-01-08T13:00:00Z',
    category: 'invite',
  },
  {
    id: 'aud-008',
    action: 'Invite accepted — Financial Aid Director',
    target: 'Lisa Martinez',
    actor: 'Lisa Martinez',
    timestamp: '2026-01-10T09:30:00Z',
    category: 'invite',
  },
  {
    id: 'aud-009',
    action: 'Vacated seat: Athletics Director',
    target: 'KaNeXT Athletics Director',
    actor: 'System',
    timestamp: '2026-01-15T00:00:00Z',
    category: 'seat_assignment',
  },
  {
    id: 'aud-010',
    action: 'Permission change: added FERPA access',
    target: 'Dr. Angela Davis',
    actor: 'Dr. Roslyn Clark',
    timestamp: '2026-02-01T10:00:00Z',
    category: 'permission_change',
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
