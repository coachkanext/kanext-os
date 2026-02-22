/**
 * Education Organization Compliance — Mock Data & Types
 * Policies, controls, evidence, audits, risks, incidents, exceptions, export packets.
 * HBCU-themed: KaNeXT = KaNeXT Sports.
 */

// =============================================================================
// TYPES
// =============================================================================

export type ComplianceDomain =
  | 'academics'
  | 'admissions'
  | 'housing'
  | 'athletics'
  | 'finance'
  | 'data_privacy'
  | 'records'
  | 'vendor_mgmt'
  | 'incident_response';

export type PolicyCategory =
  | 'ferpa'
  | 'admissions_integrity'
  | 'financial_controls'
  | 'payment_rails'
  | 'housing_safety'
  | 'academic_integrity'
  | 'athletics_compliance'
  | 'records_retention'
  | 'vendor_management'
  | 'incident_response';

export type PolicyStatus = 'draft' | 'review' | 'approved' | 'published' | 'superseded';
export type ControlFrequency = 'monthly' | 'quarterly' | 'term' | 'annual';
export type ControlStatus = 'on_track' | 'at_risk' | 'failed';
export type EvidenceType = 'pdf' | 'report' | 'roster' | 'receipt' | 'letter' | 'screenshot';
export type EvidenceStatus = 'draft' | 'submitted' | 'verified' | 'rejected';
export type RiskCategory = 'data' | 'financial' | 'housing' | 'admissions' | 'academic' | 'athletics' | 'reputation';
export type RiskSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AuditStatus = 'planned' | 'in_progress' | 'reported' | 'closed';
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low';
export type FindingStatus = 'open' | 'assigned' | 'remediation' | 'proof_uploaded' | 'closed';
export type IncidentType = 'data' | 'financial' | 'housing' | 'safety' | 'ops';
export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
export type ExceptionStatus = 'requested' | 'reviewed' | 'approved' | 'denied' | 'expired' | 'archived';
export type ExportPacketType = 'bank_rails' | 'board_compliance' | 'accreditation' | 'quarterly' | 'donor_restricted';
export type ComplianceStatus = 'green' | 'yellow' | 'red';

// =============================================================================
// INTERFACES
// =============================================================================

export interface CompliancePosture {
  status: ComplianceStatus;
  criticalRisks: number;
  openIncidents: number;
  openFindings: number;
  activeExceptions: number;
  evidenceCompleteness: number;
}

export interface TopRiskItem {
  id: string;
  title: string;
  domain: ComplianceDomain;
  severity: RiskSeverity;
  dueDate: string;
}

export interface FinanceIntegrityPanel {
  complianceHolds: number;
  restrictedFundsPolicy: boolean;
  auditCompleteness: number;
  moneyChainStatus: string;
}

export interface CompliancePolicy {
  id: string;
  title: string;
  category: PolicyCategory;
  version: number;
  status: PolicyStatus;
  owner: string;
  approver: string;
  effectiveDate: string;
  attestationRequired: boolean;
  attestationAudience: string;
  linkedControls: string[];
  summary: string;
}

export interface PolicyAttestation {
  id: string;
  policyId: string;
  employeeName: string;
  completedDate: string;
  dueDate: string;
  status: 'completed' | 'pending' | 'overdue';
}

export interface ComplianceControl {
  id: string;
  name: string;
  linkedPolicyId: string;
  linkedPolicyTitle: string;
  owner: string;
  frequency: ControlFrequency;
  status: ControlStatus;
  evidenceRequired: EvidenceType[];
  scope: ComplianceDomain;
  lastEvidenceDate?: string;
  notes?: string;
}

export interface EvidenceItem {
  id: string;
  controlId: string;
  controlName: string;
  type: EvidenceType;
  status: EvidenceStatus;
  submittedBy: string;
  submittedDate: string;
  reviewerNotes?: string;
}

export interface RiskRegisterItem {
  id: string;
  title: string;
  category: RiskCategory;
  severity: RiskSeverity;
  likelihood: 'high' | 'medium' | 'low';
  owner: string;
  mitigationPlan: string;
  linkedControls: string[];
  targetDate: string;
  residualRisk: RiskSeverity;
  department?: string;
}

export interface AuditRun {
  id: string;
  name: string;
  scope: string[];
  owner: string;
  reviewers: string[];
  dueDate: string;
  status: AuditStatus;
  findingsCount: number;
  controlsChecked: number;
}

export interface AuditFinding {
  id: string;
  auditId: string;
  title: string;
  severity: FindingSeverity;
  status: FindingStatus;
  owner: string;
  policyFailed: string;
  controlFailed: string;
  impactArea: ComplianceDomain;
  remediationPlan: string;
  evidenceToClose: string;
}

export interface ComplianceIncident {
  id: string;
  type: IncidentType;
  title: string;
  status: IncidentStatus;
  severity: RiskSeverity;
  reportedBy: string;
  reportedDate: string;
  description: string;
  immediateActions: string;
  rootCause?: string;
  correctiveActions?: string;
  containment?: string;
  addenda?: string[];
}

export interface ComplianceException {
  id: string;
  policyTitle: string;
  controlId?: string;
  reason: string;
  duration: string;
  riskAcknowledgment: string;
  compensatingControls: string;
  requestedBy: string;
  requestedDate: string;
  status: ExceptionStatus;
  approvers: string[];
}

export interface ExportPacket {
  id: string;
  name: string;
  type: ExportPacketType;
  description: string;
  includedPolicies: number;
  includedControls: number;
  includedEvidence: number;
  contents: string[];
  generatedDate?: string;
}

// =============================================================================
// CONSTANTS / LABELS
// =============================================================================

export const COMPLIANCE_STATUS_LABELS: Record<ComplianceStatus, string> = {
  green: 'Green',
  yellow: 'Yellow',
  red: 'Red',
};

export const COMPLIANCE_STATUS_COLORS: Record<ComplianceStatus, string> = {
  green: '#22C55E',
  yellow: '#F59E0B',
  red: '#EF4444',
};

export const COMPLIANCE_DOMAIN_LABELS: Record<ComplianceDomain, string> = {
  academics: 'Academics',
  admissions: 'Admissions',
  housing: 'Housing',
  athletics: 'Athletics',
  finance: 'Finance',
  data_privacy: 'Data Privacy',
  records: 'Records',
  vendor_mgmt: 'Vendor Management',
  incident_response: 'Incident Response',
};

export const COMPLIANCE_DOMAIN_ICONS: Record<ComplianceDomain, string> = {
  academics: 'book.fill',
  admissions: 'person.crop.rectangle.fill',
  housing: 'house.fill',
  athletics: 'sportscourt.fill',
  finance: 'dollarsign.circle.fill',
  data_privacy: 'lock.fill',
  records: 'doc.text.fill',
  vendor_mgmt: 'briefcase.fill',
  incident_response: 'exclamationmark.triangle.fill',
};

export const POLICY_CATEGORY_LABELS: Record<PolicyCategory, string> = {
  ferpa: 'FERPA',
  admissions_integrity: 'Admissions Integrity',
  financial_controls: 'Financial Controls',
  payment_rails: 'Payment Rails',
  housing_safety: 'Housing Safety',
  academic_integrity: 'Academic Integrity',
  athletics_compliance: 'Athletics Compliance',
  records_retention: 'Records Retention',
  vendor_management: 'Vendor Management',
  incident_response: 'Incident Response',
};

export const POLICY_CATEGORY_ICONS: Record<PolicyCategory, string> = {
  ferpa: 'lock.shield.fill',
  admissions_integrity: 'person.badge.shield.checkmark.fill',
  financial_controls: 'dollarsign.circle.fill',
  payment_rails: 'creditcard.fill',
  housing_safety: 'house.lodge.fill',
  academic_integrity: 'graduationcap.fill',
  athletics_compliance: 'figure.run',
  records_retention: 'archivebox.fill',
  vendor_management: 'briefcase.fill',
  incident_response: 'exclamationmark.bubble.fill',
};

export const POLICY_STATUS_LABELS: Record<PolicyStatus, string> = {
  draft: 'Draft',
  review: 'In Review',
  approved: 'Approved',
  published: 'Published',
  superseded: 'Superseded',
};

export const POLICY_STATUS_COLORS: Record<PolicyStatus, string> = {
  draft: '#A1A1AA',
  review: '#F59E0B',
  approved: '#1D9BF0',
  published: '#22C55E',
  superseded: '#1D9BF0',
};

export const CONTROL_FREQUENCY_LABELS: Record<ControlFrequency, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  term: 'Per Term',
  annual: 'Annual',
};

export const CONTROL_STATUS_LABELS: Record<ControlStatus, string> = {
  on_track: 'On Track',
  at_risk: 'At Risk',
  failed: 'Failed',
};

export const CONTROL_STATUS_COLORS: Record<ControlStatus, string> = {
  on_track: '#22C55E',
  at_risk: '#F59E0B',
  failed: '#EF4444',
};

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  pdf: 'PDF',
  report: 'Report',
  roster: 'Roster',
  receipt: 'Receipt',
  letter: 'Letter',
  screenshot: 'Screenshot',
};

export const EVIDENCE_STATUS_LABELS: Record<EvidenceStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  verified: 'Verified',
  rejected: 'Rejected',
};

export const EVIDENCE_STATUS_COLORS: Record<EvidenceStatus, string> = {
  draft: '#A1A1AA',
  submitted: '#1D9BF0',
  verified: '#22C55E',
  rejected: '#EF4444',
};

export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
  data: 'Data',
  financial: 'Financial',
  housing: 'Housing',
  admissions: 'Admissions',
  academic: 'Academic',
  athletics: 'Athletics',
  reputation: 'Reputation',
};

export const RISK_SEVERITY_LABELS: Record<RiskSeverity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const RISK_SEVERITY_COLORS: Record<RiskSeverity, string> = {
  critical: '#EF4444',
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#22C55E',
};

export const AUDIT_STATUS_LABELS: Record<AuditStatus, string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  reported: 'Reported',
  closed: 'Closed',
};

export const AUDIT_STATUS_COLORS: Record<AuditStatus, string> = {
  planned: '#A1A1AA',
  in_progress: '#F59E0B',
  reported: '#1D9BF0',
  closed: '#22C55E',
};

export const FINDING_SEVERITY_LABELS: Record<FindingSeverity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const FINDING_SEVERITY_COLORS: Record<FindingSeverity, string> = {
  critical: '#EF4444',
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#22C55E',
};

export const FINDING_STATUS_LABELS: Record<FindingStatus, string> = {
  open: 'Open',
  assigned: 'Assigned',
  remediation: 'Remediation',
  proof_uploaded: 'Proof Uploaded',
  closed: 'Closed',
};

export const FINDING_STATUS_COLORS: Record<FindingStatus, string> = {
  open: '#EF4444',
  assigned: '#F59E0B',
  remediation: '#1D9BF0',
  proof_uploaded: '#1D9BF0',
  closed: '#22C55E',
};

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  data: 'Data',
  financial: 'Financial',
  housing: 'Housing',
  safety: 'Safety',
  ops: 'Operations',
};

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  open: 'Open',
  investigating: 'Investigating',
  contained: 'Contained',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const INCIDENT_STATUS_COLORS: Record<IncidentStatus, string> = {
  open: '#EF4444',
  investigating: '#F59E0B',
  contained: '#1D9BF0',
  resolved: '#1D9BF0',
  closed: '#22C55E',
};

export const EXCEPTION_STATUS_LABELS: Record<ExceptionStatus, string> = {
  requested: 'Requested',
  reviewed: 'Reviewed',
  approved: 'Approved',
  denied: 'Denied',
  expired: 'Expired',
  archived: 'Archived',
};

export const EXCEPTION_STATUS_COLORS: Record<ExceptionStatus, string> = {
  requested: '#1D9BF0',
  reviewed: '#F59E0B',
  approved: '#22C55E',
  denied: '#EF4444',
  expired: '#A1A1AA',
  archived: '#1D9BF0',
};

export const EXPORT_PACKET_TYPE_LABELS: Record<ExportPacketType, string> = {
  bank_rails: 'Bank/Rails Readiness',
  board_compliance: 'Board Compliance',
  accreditation: 'Accreditation Readiness',
  quarterly: 'Quarterly Report',
  donor_restricted: 'Donor Restricted Funds',
};

export const EXPORT_PACKET_TYPE_ICONS: Record<ExportPacketType, string> = {
  bank_rails: 'creditcard.fill',
  board_compliance: 'building.columns.fill',
  accreditation: 'checkmark.seal.fill',
  quarterly: 'chart.bar.fill',
  donor_restricted: 'lock.doc.fill',
};

// =============================================================================
// SEEDED POSTURE
// =============================================================================

const POSTURE: CompliancePosture = {
  status: 'green',
  criticalRisks: 2,
  openIncidents: 1,
  openFindings: 3,
  activeExceptions: 2,
  evidenceCompleteness: 91,
};

// =============================================================================
// SEEDED TOP RISKS ("Things That Can Break Us")
// =============================================================================

const TOP_RISKS: TopRiskItem[] = [
  {
    id: 'tr-001',
    title: 'Aid eligibility evidence missing',
    domain: 'finance',
    severity: 'critical',
    dueDate: '2026-03-01',
  },
  {
    id: 'tr-002',
    title: 'Housing inspection expiring',
    domain: 'housing',
    severity: 'high',
    dueDate: '2026-02-28',
  },
  {
    id: 'tr-003',
    title: 'Payment rails attestation overdue',
    domain: 'finance',
    severity: 'high',
    dueDate: '2026-02-15',
  },
  {
    id: 'tr-004',
    title: 'FERPA training incomplete',
    domain: 'data_privacy',
    severity: 'medium',
    dueDate: '2026-03-15',
  },
  {
    id: 'tr-005',
    title: 'Vendor contract clause missing',
    domain: 'vendor_mgmt',
    severity: 'medium',
    dueDate: '2026-03-30',
  },
];

// =============================================================================
// SEEDED FINANCE INTEGRITY PANEL
// =============================================================================

const FINANCE_INTEGRITY: FinanceIntegrityPanel = {
  complianceHolds: 4,
  restrictedFundsPolicy: true,
  auditCompleteness: 87,
  moneyChainStatus: 'All rails attested',
};

// =============================================================================
// SEEDED POLICIES
// =============================================================================

const POLICIES: CompliancePolicy[] = [
  {
    id: 'pol-001',
    title: 'FERPA Compliance Policy',
    category: 'ferpa',
    version: 3,
    status: 'published',
    owner: 'Registrar Office',
    approver: 'Provost',
    effectiveDate: '2025-08-01',
    attestationRequired: true,
    attestationAudience: 'All faculty, staff, and student workers with access to education records',
    linkedControls: ['ctrl-005', 'ctrl-006'],
    summary: 'Governs the protection of student education records under the Family Educational Rights and Privacy Act, including access controls, directory information opt-out, and third-party disclosure procedures.',
  },
  {
    id: 'pol-002',
    title: 'Admissions Integrity Policy',
    category: 'admissions_integrity',
    version: 1,
    status: 'published',
    owner: 'VP of Enrollment',
    approver: 'President\'s Cabinet',
    effectiveDate: '2025-09-01',
    attestationRequired: true,
    attestationAudience: 'All admissions counselors and enrollment staff',
    linkedControls: [],
    summary: 'Defines ethical standards for recruitment, application review, and enrollment decisions. Prohibits misrepresentation of acceptance rates, aid packages, and program outcomes.',
  },
  {
    id: 'pol-003',
    title: 'Financial Controls Policy',
    category: 'financial_controls',
    version: 2,
    status: 'published',
    owner: 'CFO',
    approver: 'Board of Trustees',
    effectiveDate: '2025-07-01',
    attestationRequired: false,
    attestationAudience: '',
    linkedControls: ['ctrl-001', 'ctrl-002'],
    summary: 'Establishes dual-approval thresholds, budget authorization workflows, restricted fund accounting rules, and financial reporting requirements for the university.',
  },
  {
    id: 'pol-004',
    title: 'Payment Rails Policy',
    category: 'payment_rails',
    version: 1,
    status: 'published',
    owner: 'Bursar',
    approver: 'CFO',
    effectiveDate: '2025-10-01',
    attestationRequired: true,
    attestationAudience: 'All finance and bursar staff with disbursement authority',
    linkedControls: ['ctrl-001', 'ctrl-003'],
    summary: 'Governs all payment disbursement channels including ACH, wire, check, and card payments. Requires attestation of rail integrity, KYB verification for vendors, and reconciliation protocols.',
  },
  {
    id: 'pol-005',
    title: 'Housing Safety Policy',
    category: 'housing_safety',
    version: 2,
    status: 'published',
    owner: 'Director of Residential Life',
    approver: 'VP of Student Affairs',
    effectiveDate: '2025-08-15',
    attestationRequired: true,
    attestationAudience: 'All residential life staff and resident advisors',
    linkedControls: ['ctrl-003'],
    summary: 'Covers fire safety inspections, maintenance protocols, emergency procedures, occupancy standards, and resident well-being checks for all on-campus housing facilities.',
  },
  {
    id: 'pol-006',
    title: 'Academic Integrity Policy',
    category: 'academic_integrity',
    version: 1,
    status: 'published',
    owner: 'Dean of Academic Affairs',
    approver: 'Provost',
    effectiveDate: '2025-08-01',
    attestationRequired: true,
    attestationAudience: 'All faculty and teaching assistants',
    linkedControls: [],
    summary: 'Defines standards for academic honesty including plagiarism, cheating, fabrication, and unauthorized collaboration. Outlines adjudication process and sanctions for violations.',
  },
  {
    id: 'pol-007',
    title: 'Athletics Compliance Policy',
    category: 'athletics_compliance',
    version: 1,
    status: 'published',
    owner: 'Athletic Director',
    approver: 'President',
    effectiveDate: '2025-06-01',
    attestationRequired: true,
    attestationAudience: 'All coaches, athletic staff, and student-athletes',
    linkedControls: ['ctrl-002'],
    summary: 'Ensures compliance with NCAA/NAIA rules regarding eligibility, recruiting, financial aid, practice hours, and booster interactions for all intercollegiate athletic programs.',
  },
  {
    id: 'pol-008',
    title: 'Records Retention Policy',
    category: 'records_retention',
    version: 1,
    status: 'approved',
    owner: 'Registrar Office',
    approver: 'General Counsel',
    effectiveDate: '2025-11-01',
    attestationRequired: false,
    attestationAudience: '',
    linkedControls: [],
    summary: 'Defines retention schedules for student records, financial documents, employment files, and institutional correspondence in compliance with FERPA and state regulations.',
  },
  {
    id: 'pol-009',
    title: 'Vendor Management Policy',
    category: 'vendor_management',
    version: 1,
    status: 'review',
    owner: 'Procurement Director',
    approver: 'CFO',
    effectiveDate: '',
    attestationRequired: false,
    attestationAudience: '',
    linkedControls: ['ctrl-004'],
    summary: 'Establishes requirements for vendor onboarding including KYB verification, W-9 collection, insurance certification, data handling agreements, and performance review schedules.',
  },
  {
    id: 'pol-010',
    title: 'Incident Response Policy',
    category: 'incident_response',
    version: 1,
    status: 'published',
    owner: 'Chief of Campus Safety',
    approver: 'VP of Student Affairs',
    effectiveDate: '2025-09-15',
    attestationRequired: true,
    attestationAudience: 'All department heads and safety coordinators',
    linkedControls: [],
    summary: 'Defines incident classification, reporting workflows, escalation procedures, containment protocols, and post-incident review requirements for data, financial, housing, safety, and operational incidents.',
  },
];

// =============================================================================
// SEEDED POLICY ATTESTATIONS
// =============================================================================

const ATTESTATIONS: PolicyAttestation[] = [
  {
    id: 'att-001',
    policyId: 'pol-001',
    employeeName: 'Dr. Angela Richardson',
    completedDate: '2026-01-10',
    dueDate: '2026-01-15',
    status: 'completed',
  },
  {
    id: 'att-002',
    policyId: 'pol-001',
    employeeName: 'Alex Morgan',
    completedDate: '',
    dueDate: '2026-01-15',
    status: 'overdue',
  },
  {
    id: 'att-003',
    policyId: 'pol-004',
    employeeName: 'Janet Williams',
    completedDate: '2026-02-01',
    dueDate: '2026-02-15',
    status: 'completed',
  },
  {
    id: 'att-004',
    policyId: 'pol-005',
    employeeName: 'DeShawn Carter',
    completedDate: '',
    dueDate: '2026-02-28',
    status: 'pending',
  },
  {
    id: 'att-005',
    policyId: 'pol-007',
    employeeName: 'Coach Brenda Lewis',
    completedDate: '2026-01-20',
    dueDate: '2026-01-31',
    status: 'completed',
  },
];

// =============================================================================
// SEEDED CONTROLS
// =============================================================================

const CONTROLS: ComplianceControl[] = [
  {
    id: 'ctrl-001',
    name: 'Dual approval for fund releases over $5,000',
    linkedPolicyId: 'pol-003',
    linkedPolicyTitle: 'Financial Controls Policy',
    owner: 'CFO',
    frequency: 'monthly',
    status: 'on_track',
    evidenceRequired: ['pdf', 'receipt'],
    scope: 'finance',
    lastEvidenceDate: '2026-02-01',
    notes: 'Automated dual-signature workflow in university ERP system.',
  },
  {
    id: 'ctrl-002',
    name: 'Eligibility proof collected before aid disbursement',
    linkedPolicyId: 'pol-007',
    linkedPolicyTitle: 'Athletics Compliance Policy',
    owner: 'Athletic Director',
    frequency: 'term',
    status: 'at_risk',
    evidenceRequired: ['pdf', 'roster'],
    scope: 'athletics',
    lastEvidenceDate: '2025-12-15',
    notes: 'Spring term eligibility documentation pending for 4 student-athletes.',
  },
  {
    id: 'ctrl-003',
    name: 'Housing refund chain verification',
    linkedPolicyId: 'pol-005',
    linkedPolicyTitle: 'Housing Safety Policy',
    owner: 'Director of Residential Life',
    frequency: 'quarterly',
    status: 'on_track',
    evidenceRequired: ['receipt', 'report'],
    scope: 'housing',
    lastEvidenceDate: '2026-01-20',
    notes: 'All Q4 housing refunds verified and documented.',
  },
  {
    id: 'ctrl-004',
    name: 'Vendor KYB/W-9 collection and review',
    linkedPolicyId: 'pol-009',
    linkedPolicyTitle: 'Vendor Management Policy',
    owner: 'Procurement Director',
    frequency: 'quarterly',
    status: 'at_risk',
    evidenceRequired: ['pdf', 'letter'],
    scope: 'vendor_mgmt',
    lastEvidenceDate: '2025-11-30',
    notes: 'Two vendors missing updated W-9 forms; follow-up in progress.',
  },
  {
    id: 'ctrl-005',
    name: 'Staff FERPA training attestation',
    linkedPolicyId: 'pol-001',
    linkedPolicyTitle: 'FERPA Compliance Policy',
    owner: 'Registrar Office',
    frequency: 'annual',
    status: 'at_risk',
    evidenceRequired: ['roster', 'screenshot'],
    scope: 'data_privacy',
    lastEvidenceDate: '2025-09-01',
    notes: '2026 training cycle begins March 1; 12 staff members still need recertification.',
  },
  {
    id: 'ctrl-006',
    name: 'Student data access logging and review',
    linkedPolicyId: 'pol-001',
    linkedPolicyTitle: 'FERPA Compliance Policy',
    owner: 'IT Security',
    frequency: 'monthly',
    status: 'on_track',
    evidenceRequired: ['report', 'screenshot'],
    scope: 'data_privacy',
    lastEvidenceDate: '2026-02-05',
    notes: 'Automated access logs reviewed monthly; no anomalies detected in January.',
  },
];

// =============================================================================
// SEEDED EVIDENCE ITEMS
// =============================================================================

const EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    id: 'evi-001',
    controlId: 'ctrl-001',
    controlName: 'Dual approval for fund releases over $5,000',
    type: 'pdf',
    status: 'verified',
    submittedBy: 'CFO',
    submittedDate: '2026-02-01',
    reviewerNotes: 'January disbursement log verified — all releases above $5,000 properly dual-approved.',
  },
  {
    id: 'evi-002',
    controlId: 'ctrl-002',
    controlName: 'Eligibility proof collected before aid disbursement',
    type: 'roster',
    status: 'submitted',
    submittedBy: 'Athletic Director',
    submittedDate: '2026-01-28',
    reviewerNotes: 'Fall term roster verified; spring term documentation still outstanding for 4 athletes.',
  },
  {
    id: 'evi-003',
    controlId: 'ctrl-003',
    controlName: 'Housing refund chain verification',
    type: 'receipt',
    status: 'verified',
    submittedBy: 'Director of Residential Life',
    submittedDate: '2026-01-20',
    reviewerNotes: 'Q4 refund chain complete — all housing refunds reconciled.',
  },
  {
    id: 'evi-004',
    controlId: 'ctrl-005',
    controlName: 'Staff FERPA training attestation',
    type: 'roster',
    status: 'draft',
    submittedBy: 'Registrar Office',
    submittedDate: '2026-02-10',
    reviewerNotes: 'Partial roster uploaded; 12 staff members pending recertification.',
  },
  {
    id: 'evi-005',
    controlId: 'ctrl-006',
    controlName: 'Student data access logging and review',
    type: 'report',
    status: 'verified',
    submittedBy: 'IT Security',
    submittedDate: '2026-02-05',
    reviewerNotes: 'January access log report — no unauthorized access detected.',
  },
  {
    id: 'evi-006',
    controlId: 'ctrl-001',
    controlName: 'Dual approval for fund releases over $5,000',
    type: 'receipt',
    status: 'verified',
    submittedBy: 'Bursar',
    submittedDate: '2026-01-15',
    reviewerNotes: 'December governance receipts verified.',
  },
  {
    id: 'evi-007',
    controlId: 'ctrl-004',
    controlName: 'Vendor KYB/W-9 collection and review',
    type: 'pdf',
    status: 'submitted',
    submittedBy: 'Procurement Director',
    submittedDate: '2026-02-08',
    reviewerNotes: 'Updated W-9 forms for 6 of 8 active vendors; 2 outstanding.',
  },
  {
    id: 'evi-008',
    controlId: 'ctrl-003',
    controlName: 'Housing refund chain verification',
    type: 'report',
    status: 'verified',
    submittedBy: 'Director of Residential Life',
    submittedDate: '2026-01-22',
    reviewerNotes: 'Inspection report for Baker Hall — passed all safety checks.',
  },
];

// =============================================================================
// SEEDED RISK REGISTER
// =============================================================================

const RISKS: RiskRegisterItem[] = [
  {
    id: 'risk-001',
    title: 'Student financial aid eligibility documentation gap',
    category: 'financial',
    severity: 'critical',
    likelihood: 'high',
    owner: 'Financial Aid Director',
    mitigationPlan: 'Implement automated eligibility verification checks before each disbursement cycle; add pre-disbursement audit step.',
    linkedControls: ['ctrl-002'],
    targetDate: '2026-03-01',
    residualRisk: 'medium',
    department: 'Financial Aid',
  },
  {
    id: 'risk-002',
    title: 'On-campus housing inspection expiration',
    category: 'housing',
    severity: 'high',
    likelihood: 'high',
    owner: 'Director of Residential Life',
    mitigationPlan: 'Schedule expedited re-inspection for all residence halls; implement 60-day advance renewal reminders.',
    linkedControls: ['ctrl-003'],
    targetDate: '2026-02-28',
    residualRisk: 'low',
    department: 'Residential Life',
  },
  {
    id: 'risk-003',
    title: 'FERPA training non-compliance',
    category: 'data',
    severity: 'medium',
    likelihood: 'medium',
    owner: 'Registrar Office',
    mitigationPlan: 'Launch mandatory FERPA refresher training module; restrict system access for non-compliant staff until completion.',
    linkedControls: ['ctrl-005', 'ctrl-006'],
    targetDate: '2026-03-15',
    residualRisk: 'low',
    department: 'Registrar',
  },
  {
    id: 'risk-004',
    title: 'Admissions yield misrepresentation exposure',
    category: 'admissions',
    severity: 'medium',
    likelihood: 'low',
    owner: 'VP of Enrollment',
    mitigationPlan: 'Audit all recruitment materials for accuracy; implement fact-checking workflow for published statistics.',
    linkedControls: [],
    targetDate: '2026-04-01',
    residualRisk: 'low',
    department: 'Enrollment',
  },
  {
    id: 'risk-005',
    title: 'Academic integrity adjudication backlog',
    category: 'academic',
    severity: 'low',
    likelihood: 'medium',
    owner: 'Dean of Academic Affairs',
    mitigationPlan: 'Hire additional hearing officers; implement expedited review track for straightforward cases.',
    linkedControls: [],
    targetDate: '2026-04-15',
    residualRisk: 'low',
    department: 'Academic Affairs',
  },
  {
    id: 'risk-006',
    title: 'NCAA eligibility reporting delay',
    category: 'athletics',
    severity: 'critical',
    likelihood: 'medium',
    owner: 'Athletic Director',
    mitigationPlan: 'Automate eligibility status feeds to compliance office; implement weekly reconciliation between registrar and athletics.',
    linkedControls: ['ctrl-002'],
    targetDate: '2026-03-01',
    residualRisk: 'medium',
    department: 'Athletics',
  },
];

// =============================================================================
// SEEDED AUDIT RUNS
// =============================================================================

const AUDIT_RUNS: AuditRun[] = [
  {
    id: 'audit-001',
    name: 'Q1 Internal Compliance Review',
    scope: ['pol-001', 'pol-003', 'pol-004', 'pol-010'],
    owner: 'Chief Compliance Officer',
    reviewers: ['CFO', 'General Counsel'],
    dueDate: '2026-03-31',
    status: 'in_progress',
    findingsCount: 2,
    controlsChecked: 6,
  },
  {
    id: 'audit-002',
    name: 'Housing Safety Audit',
    scope: ['pol-005'],
    owner: 'VP of Student Affairs',
    reviewers: ['Director of Residential Life', 'Facilities Manager'],
    dueDate: '2026-02-28',
    status: 'in_progress',
    findingsCount: 1,
    controlsChecked: 3,
  },
  {
    id: 'audit-003',
    name: 'Financial Controls Audit',
    scope: ['pol-003', 'pol-004'],
    owner: 'Board Audit Committee',
    reviewers: ['CFO', 'Bursar'],
    dueDate: '2026-04-15',
    status: 'planned',
    findingsCount: 0,
    controlsChecked: 0,
  },
  {
    id: 'audit-004',
    name: 'Athletics Compliance Audit',
    scope: ['pol-007'],
    owner: 'Athletic Director',
    reviewers: ['Compliance Officer', 'Registrar Office'],
    dueDate: '2026-05-01',
    status: 'planned',
    findingsCount: 0,
    controlsChecked: 0,
  },
];

// =============================================================================
// SEEDED FINDINGS
// =============================================================================

const FINDINGS: AuditFinding[] = [
  {
    id: 'find-001',
    auditId: 'audit-001',
    title: 'Dual-approval bypass for emergency aid disbursement in January',
    severity: 'high',
    status: 'assigned',
    owner: 'CFO',
    policyFailed: 'Financial Controls Policy',
    controlFailed: 'ctrl-001',
    impactArea: 'finance',
    remediationPlan: 'Implement emergency disbursement protocol with post-facto dual-approval requirement within 48 hours.',
    evidenceToClose: 'Signed emergency approval forms and updated SOP documentation.',
  },
  {
    id: 'find-002',
    auditId: 'audit-001',
    title: 'FERPA training records incomplete for 12 staff members',
    severity: 'medium',
    status: 'open',
    owner: 'Registrar Office',
    policyFailed: 'FERPA Compliance Policy',
    controlFailed: 'ctrl-005',
    impactArea: 'data_privacy',
    remediationPlan: 'Schedule mandatory make-up training sessions; restrict data access for non-compliant staff.',
    evidenceToClose: 'Completed training roster with all staff signatures and completion dates.',
  },
  {
    id: 'find-003',
    auditId: 'audit-002',
    title: 'Baker Hall fire extinguisher inspection overdue by 3 weeks',
    severity: 'high',
    status: 'remediation',
    owner: 'Director of Residential Life',
    policyFailed: 'Housing Safety Policy',
    controlFailed: 'ctrl-003',
    impactArea: 'housing',
    remediationPlan: 'Emergency inspection scheduled; implement automated inspection calendar with advance alerts.',
    evidenceToClose: 'Signed inspection certificate and updated maintenance schedule.',
  },
  {
    id: 'find-004',
    auditId: 'audit-001',
    title: 'Vendor W-9 forms missing for two active service providers',
    severity: 'medium',
    status: 'proof_uploaded',
    owner: 'Procurement Director',
    policyFailed: 'Vendor Management Policy',
    controlFailed: 'ctrl-004',
    impactArea: 'vendor_mgmt',
    remediationPlan: 'Collected updated W-9 forms; implementing mandatory document review before vendor payment release.',
    evidenceToClose: 'Copies of updated W-9 forms and revised vendor onboarding checklist.',
  },
  {
    id: 'find-005',
    auditId: 'audit-002',
    title: 'Emergency exit signage missing in renovated wing of Jenkins Hall',
    severity: 'low',
    status: 'open',
    owner: 'Facilities Manager',
    policyFailed: 'Housing Safety Policy',
    controlFailed: 'ctrl-003',
    impactArea: 'housing',
    remediationPlan: 'Install compliant emergency exit signage; add post-renovation inspection checklist to facilities workflow.',
    evidenceToClose: 'Photo evidence of installed signage and updated inspection checklist.',
  },
];

// =============================================================================
// SEEDED INCIDENTS
// =============================================================================

const INCIDENTS: ComplianceIncident[] = [
  {
    id: 'inc-001',
    type: 'data',
    title: 'Unauthorized access attempt on student records system',
    status: 'contained',
    severity: 'high',
    reportedBy: 'IT Security',
    reportedDate: '2026-02-05',
    description: 'Multiple failed login attempts detected from an unrecognized IP address targeting the student information system. The source appeared to use credential-stuffing techniques against staff accounts.',
    immediateActions: 'Blocked the offending IP range; forced password resets for all affected staff accounts; enabled enhanced MFA requirements.',
    rootCause: 'Three staff accounts had passwords that appeared in known breach databases.',
    containment: 'IP range blocked at firewall; affected accounts locked pending credential reset.',
    correctiveActions: 'Implementing mandatory password complexity requirements and dark web credential monitoring for all staff accounts.',
    addenda: ['IT Security incident report #2026-012', 'FERPA breach assessment — no student data accessed'],
  },
  {
    id: 'inc-002',
    type: 'housing',
    title: 'Water damage in Baker Hall second floor',
    status: 'resolved',
    severity: 'medium',
    reportedBy: 'Resident Advisor — Baker Hall',
    reportedDate: '2026-01-18',
    description: 'A burst pipe in the second-floor laundry room caused water damage to three adjacent dorm rooms and the hallway. No injuries reported.',
    immediateActions: 'Affected residents relocated to temporary rooms; emergency plumbing repair dispatched; water extraction and drying equipment deployed.',
    rootCause: 'Aging pipe fitting failed due to pressure changes during cold snap.',
    correctiveActions: 'Replaced all pipe fittings on the second floor; scheduled comprehensive plumbing inspection for all residence halls.',
  },
  {
    id: 'inc-003',
    type: 'financial',
    title: 'Tuition refund processed without required dual approval',
    status: 'investigating',
    severity: 'medium',
    reportedBy: 'Bursar',
    reportedDate: '2026-02-12',
    description: 'A tuition refund of $6,200 was processed through the ERP system with only a single approval signature. The refund was legitimate but bypassed the required dual-approval control for transactions over $5,000.',
    immediateActions: 'Refund flagged and held pending second approval; system workflow reviewed for configuration errors.',
    rootCause: 'ERP workflow rule was inadvertently modified during a system update, removing the dual-approval gate for refund transactions.',
    addenda: ['ERP vendor notified for patch review'],
  },
];

// =============================================================================
// SEEDED EXCEPTIONS
// =============================================================================

const EXCEPTIONS: ComplianceException[] = [
  {
    id: 'exc-001',
    policyTitle: 'Financial Controls Policy',
    controlId: 'ctrl-001',
    reason: 'Emergency scholarship disbursement of $8,500 required before semester start. Second approver was on medical leave and backup approver had not yet been designated.',
    duration: '14 days',
    riskAcknowledgment: 'Single-approver disbursement increases risk of unauthorized expenditure. Amount, recipient, and scholarship terms verified by Financial Aid Director.',
    compensatingControls: 'Verbal approval obtained from Board Audit Committee chair via recorded phone call; written confirmation required within 72 hours of return.',
    requestedBy: 'CFO',
    requestedDate: '2026-01-08',
    status: 'approved',
    approvers: ['Board Audit Committee Chair', 'General Counsel'],
  },
  {
    id: 'exc-002',
    policyTitle: 'Housing Safety Policy',
    controlId: 'ctrl-003',
    reason: 'Annual fire inspection for Jenkins Hall delayed due to inspector scheduling conflict. Extension requested to avoid marking the hall as non-compliant during the interim.',
    duration: '21 days',
    riskAcknowledgment: 'Lapsed inspection increases liability exposure. Monthly fire drill schedule maintained; all extinguishers and alarms verified functional by in-house facilities team.',
    compensatingControls: 'In-house safety team conducted interim walkthrough; fire alarm system tested and certified by campus security.',
    requestedBy: 'Director of Residential Life',
    requestedDate: '2026-02-10',
    status: 'reviewed',
    approvers: ['VP of Student Affairs'],
  },
  {
    id: 'exc-003',
    policyTitle: 'FERPA Compliance Policy',
    controlId: 'ctrl-006',
    reason: 'Temporary elevated data access granted to external accreditation review team for a 10-day on-site visit. Standard access provisioning timeline could not be met.',
    duration: '10 days',
    riskAcknowledgment: 'Temporary external access to student records increases data exposure risk. All access logged and monitored in real-time by IT Security.',
    compensatingControls: 'Read-only access with no export capability; dedicated audit trail; NDA signed by all reviewers; access auto-revokes after 10 days.',
    requestedBy: 'Provost',
    requestedDate: '2026-02-14',
    status: 'approved',
    approvers: ['Registrar Office', 'IT Security', 'General Counsel'],
  },
];

// =============================================================================
// SEEDED EXPORT PACKETS
// =============================================================================

const EXPORT_PACKETS: ExportPacket[] = [
  {
    id: 'exp-001',
    name: 'Bank/Rails Readiness Package',
    type: 'bank_rails',
    description: 'Complete payment rails compliance package including dual-approval evidence, KYB/W-9 documentation, rail attestation records, and reconciliation reports.',
    includedPolicies: 2,
    includedControls: 3,
    includedEvidence: 4,
    contents: ['Financial Controls Policy', 'Payment Rails Policy', 'Dual-approval logs', 'Rail attestation records', 'Vendor W-9 files'],
    generatedDate: '2026-02-01',
  },
  {
    id: 'exp-002',
    name: 'Board Compliance Report',
    type: 'board_compliance',
    description: 'Board-ready compliance summary covering posture overview, risk register highlights, open findings, incident log, and exception register for quarterly board review.',
    includedPolicies: 10,
    includedControls: 6,
    includedEvidence: 8,
    contents: ['Compliance posture summary', 'Top 5 risks', 'Open findings tracker', 'Incident log', 'Exception register', 'Finance integrity panel'],
    generatedDate: '2026-01-31',
  },
  {
    id: 'exp-003',
    name: 'Accreditation Readiness Package',
    type: 'accreditation',
    description: 'Comprehensive accreditation preparation package including all published policies, control evidence, audit history, and institutional compliance metrics.',
    includedPolicies: 10,
    includedControls: 6,
    includedEvidence: 8,
    contents: ['All published policies', 'Control evidence matrix', 'Audit run history', 'Risk register', 'FERPA compliance documentation', 'Academic integrity records'],
  },
  {
    id: 'exp-004',
    name: 'Quarterly Compliance Report',
    type: 'quarterly',
    description: 'Standard quarterly compliance report covering policy updates, control status, evidence completeness, new findings, and incident summary for the reporting period.',
    includedPolicies: 10,
    includedControls: 6,
    includedEvidence: 8,
    contents: ['Policy update log', 'Control status dashboard', 'Evidence completeness metrics', 'Findings summary', 'Incident summary', 'Exception log'],
  },
  {
    id: 'exp-005',
    name: 'Donor Restricted Funds Report',
    type: 'donor_restricted',
    description: 'Restricted fund compliance report covering donor intent verification, fund usage documentation, reconciliation evidence, and audit trail for restricted gift accounts.',
    includedPolicies: 2,
    includedControls: 2,
    includedEvidence: 3,
    contents: ['Financial Controls Policy', 'Restricted fund reconciliation', 'Donor intent documentation', 'Fund usage reports', 'Audit trail excerpts'],
  },
];

// =============================================================================
// DATA ACCESSOR
// =============================================================================

export function getEduComplianceData() {
  return {
    posture: POSTURE,
    topRisks: TOP_RISKS,
    financeIntegrity: FINANCE_INTEGRITY,
    policies: POLICIES,
    attestations: ATTESTATIONS,
    controls: CONTROLS,
    evidenceItems: EVIDENCE_ITEMS,
    risks: RISKS,
    auditRuns: AUDIT_RUNS,
    findings: FINDINGS,
    incidents: INCIDENTS,
    exceptions: EXCEPTIONS,
    exportPackets: EXPORT_PACKETS,
  };
}
