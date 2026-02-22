/**
 * Church Organization Compliance & Legal — Mock Data & Types
 * Policies, legal documents, controls, evidence, audits, risks, incidents, exceptions.
 */

// =============================================================================
// TYPES
// =============================================================================

export type PolicyStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'superseded';
export type PolicyCategory = 'safeguarding' | 'financial' | 'operations' | 'data_privacy' | 'governance' | 'communications';
export type LegalDocCategory = 'governance' | 'finance_banking' | 'insurance' | 'facilities' | 'employment' | 'child_safety';
export type LegalDocStatus = 'draft' | 'executed' | 'expiring' | 'needs_signature';
export type LegalDocSensitivity = 'internal' | 'confidential' | 'restricted';
export type ControlFrequency = 'ongoing' | 'monthly' | 'quarterly' | 'annual';
export type EvidenceType = 'document' | 'link' | 'log' | 'attestation';
export type EvidenceStatus = 'pending' | 'submitted' | 'accepted' | 'rejected';
export type AuditFindingSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AuditFindingStatus = 'open' | 'in_progress' | 'remediated' | 'closed';
export type RiskCategory = 'safeguarding' | 'financial' | 'legal' | 'data' | 'facilities' | 'reputation';
export type RiskSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentType = 'safeguarding' | 'financial_irregularity' | 'facilities_safety' | 'data_privacy';
export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed';
export type ExceptionStatus = 'requested' | 'reviewed' | 'approved' | 'denied' | 'expired' | 'archived';
export type ComplianceStatus = 'green' | 'yellow' | 'red';

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

export interface LegalDocument {
  id: string;
  title: string;
  category: LegalDocCategory;
  status: LegalDocStatus;
  sensitivity: LegalDocSensitivity;
  owner: string;
  lastUpdated: string;
  linkedPolicies: string[];
  description: string;
}

export interface ComplianceControl {
  id: string;
  name: string;
  linkedPolicyId: string;
  linkedPolicyTitle: string;
  owner: string;
  frequency: ControlFrequency;
  evidenceType: EvidenceType;
  scope: 'whole_church' | 'ministry';
  evidenceStatus: EvidenceStatus;
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

export interface AuditRun {
  id: string;
  name: string;
  scope: string[];
  owner: string;
  reviewers: string[];
  dueDate: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  findings: AuditFinding[];
}

export interface AuditFinding {
  id: string;
  auditId: string;
  title: string;
  severity: AuditFindingSeverity;
  status: AuditFindingStatus;
  owner: string;
  remediationPlan: string;
  evidenceUploaded: boolean;
}

export interface ComplianceRisk {
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
  ministry?: string;
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
  evidenceCount: number;
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
  description: string;
  includedPolicies: number;
  includedControls: number;
  includedEvidence: number;
  generatedDate?: string;
}

// =============================================================================
// CONSTANTS / LABELS
// =============================================================================

export const POLICY_STATUS_LABELS: Record<PolicyStatus, string> = {
  draft: 'Draft',
  in_review: 'In Review',
  approved: 'Approved',
  published: 'Published',
  superseded: 'Superseded',
};

export const POLICY_STATUS_COLORS: Record<PolicyStatus, string> = {
  draft: '#8F8F8F',
  in_review: '#F59E0B',
  approved: '#6AA9FF',
  published: '#22C55E',
  superseded: '#A78BFA',
};

export const POLICY_CATEGORY_LABELS: Record<PolicyCategory, string> = {
  safeguarding: 'Safeguarding',
  financial: 'Financial',
  operations: 'Operations',
  data_privacy: 'Data & Privacy',
  governance: 'Governance',
  communications: 'Communications',
};

export const POLICY_CATEGORY_ICONS: Record<PolicyCategory, string> = {
  safeguarding: 'shield.fill',
  financial: 'dollarsign.circle.fill',
  operations: 'gearshape.fill',
  data_privacy: 'lock.fill',
  governance: 'building.columns.fill',
  communications: 'megaphone.fill',
};

export const LEGAL_DOC_CATEGORY_LABELS: Record<LegalDocCategory, string> = {
  governance: 'Governance',
  finance_banking: 'Finance & Banking',
  insurance: 'Insurance',
  facilities: 'Facilities',
  employment: 'Employment',
  child_safety: 'Child Safety',
};

export const LEGAL_DOC_STATUS_LABELS: Record<LegalDocStatus, string> = {
  draft: 'Draft',
  executed: 'Executed',
  expiring: 'Expiring',
  needs_signature: 'Needs Signature',
};

export const LEGAL_DOC_STATUS_COLORS: Record<LegalDocStatus, string> = {
  draft: '#8F8F8F',
  executed: '#22C55E',
  expiring: '#F59E0B',
  needs_signature: '#EF4444',
};

export const SENSITIVITY_LABELS: Record<LegalDocSensitivity, string> = {
  internal: 'Internal',
  confidential: 'Confidential',
  restricted: 'Restricted',
};

export const SENSITIVITY_COLORS: Record<LegalDocSensitivity, string> = {
  internal: '#6AA9FF',
  confidential: '#F59E0B',
  restricted: '#EF4444',
};

export const CONTROL_FREQUENCY_LABELS: Record<ControlFrequency, string> = {
  ongoing: 'Ongoing',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
};

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  document: 'Document',
  link: 'Link',
  log: 'Log',
  attestation: 'Attestation',
};

export const EVIDENCE_STATUS_LABELS: Record<EvidenceStatus, string> = {
  pending: 'Pending',
  submitted: 'Submitted',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export const EVIDENCE_STATUS_COLORS: Record<EvidenceStatus, string> = {
  pending: '#8F8F8F',
  submitted: '#6AA9FF',
  accepted: '#22C55E',
  rejected: '#EF4444',
};

export const AUDIT_FINDING_SEVERITY_COLORS: Record<AuditFindingSeverity, string> = {
  critical: '#DC2626',
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#22C55E',
};

export const AUDIT_FINDING_STATUS_LABELS: Record<AuditFindingStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  remediated: 'Remediated',
  closed: 'Closed',
};

export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
  safeguarding: 'Safeguarding',
  financial: 'Financial',
  legal: 'Legal',
  data: 'Data',
  facilities: 'Facilities',
  reputation: 'Reputation',
};

export const RISK_SEVERITY_COLORS: Record<RiskSeverity, string> = {
  critical: '#DC2626',
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#22C55E',
};

export const RISK_SEVERITY_LABELS: Record<RiskSeverity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  safeguarding: 'Safeguarding',
  financial_irregularity: 'Financial Irregularity',
  facilities_safety: 'Facilities Safety',
  data_privacy: 'Data Privacy',
};

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  open: 'Open',
  investigating: 'Investigating',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const INCIDENT_STATUS_COLORS: Record<IncidentStatus, string> = {
  open: '#EF4444',
  investigating: '#F59E0B',
  resolved: '#6AA9FF',
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
  requested: '#6AA9FF',
  reviewed: '#F59E0B',
  approved: '#22C55E',
  denied: '#EF4444',
  expired: '#8F8F8F',
  archived: '#A78BFA',
};

// =============================================================================
// SEEDED POLICIES
// =============================================================================

const POLICIES: CompliancePolicy[] = [
  {
    id: 'pol-001',
    title: 'Child & Youth Protection',
    category: 'safeguarding',
    version: 2,
    status: 'published',
    owner: 'Pastor Michael',
    approver: 'Board of Elders',
    effectiveDate: '2025-09-01',
    attestationRequired: true,
    attestationAudience: 'All volunteers serving in youth & children ministries',
    linkedControls: ['ctrl-002', 'ctrl-003'],
    summary: 'Comprehensive safeguarding policy covering background checks, two-adult rule, reporting obligations, and training requirements for all youth-facing volunteers and staff.',
  },
  {
    id: 'pol-002',
    title: 'Volunteer Screening',
    category: 'safeguarding',
    version: 1,
    status: 'published',
    owner: 'HR Coordinator',
    approver: 'Executive Pastor',
    effectiveDate: '2025-06-15',
    attestationRequired: true,
    attestationAudience: 'All new volunteers',
    linkedControls: ['ctrl-002'],
    summary: 'Defines screening procedures including background checks, reference checks, and waiting periods for all volunteer positions.',
  },
  {
    id: 'pol-003',
    title: 'Mandatory Reporting',
    category: 'safeguarding',
    version: 1,
    status: 'published',
    owner: 'Pastor Michael',
    approver: 'Board of Elders',
    effectiveDate: '2025-06-15',
    attestationRequired: true,
    attestationAudience: 'All staff and ministry leaders',
    linkedControls: ['ctrl-003'],
    summary: 'Outlines legal and moral obligations for reporting suspected abuse or neglect, including contact procedures and documentation requirements.',
  },
  {
    id: 'pol-004',
    title: 'Donations & Restricted Funds',
    category: 'financial',
    version: 1,
    status: 'published',
    owner: 'Church Treasurer',
    approver: 'Finance Committee',
    effectiveDate: '2025-07-01',
    attestationRequired: false,
    attestationAudience: '',
    linkedControls: ['ctrl-004'],
    summary: 'Governs acceptance, tracking, and disbursement of designated and restricted donations in accordance with donor intent and IRS regulations.',
  },
  {
    id: 'pol-005',
    title: 'Reimbursements',
    category: 'financial',
    version: 1,
    status: 'published',
    owner: 'Church Treasurer',
    approver: 'Finance Committee',
    effectiveDate: '2025-07-01',
    attestationRequired: false,
    attestationAudience: '',
    linkedControls: ['ctrl-001'],
    summary: 'Establishes reimbursement procedures, receipt requirements, spending limits, and approval workflows for ministry and staff expenses.',
  },
  {
    id: 'pol-006',
    title: 'Dual-Approval Rules',
    category: 'financial',
    version: 1,
    status: 'published',
    owner: 'Church Treasurer',
    approver: 'Board of Elders',
    effectiveDate: '2025-08-01',
    attestationRequired: false,
    attestationAudience: '',
    linkedControls: ['ctrl-001'],
    summary: 'Requires two authorized signers for all disbursements exceeding $2,000 and defines the approved signatory list.',
  },
  {
    id: 'pol-007',
    title: 'Facilities Use',
    category: 'operations',
    version: 1,
    status: 'published',
    owner: 'Facilities Manager',
    approver: 'Executive Pastor',
    effectiveDate: '2025-05-01',
    attestationRequired: false,
    attestationAudience: '',
    linkedControls: ['ctrl-005', 'ctrl-009'],
    summary: 'Covers scheduling, liability, insurance requirements, and usage guidelines for church facilities by internal ministries and external groups.',
  },
  {
    id: 'pol-008',
    title: 'Event Safety',
    category: 'operations',
    version: 2,
    status: 'in_review',
    owner: 'Facilities Manager',
    approver: 'Executive Pastor',
    effectiveDate: '2026-03-01',
    attestationRequired: true,
    attestationAudience: 'Event coordinators and ministry leaders',
    linkedControls: ['ctrl-005'],
    summary: 'Updated safety protocols for all church-hosted events including emergency procedures, first aid requirements, and capacity management.',
  },
  {
    id: 'pol-009',
    title: 'Records Retention',
    category: 'data_privacy',
    version: 1,
    status: 'draft',
    owner: 'Church Administrator',
    approver: 'Board of Elders',
    effectiveDate: '',
    attestationRequired: false,
    attestationAudience: '',
    linkedControls: ['ctrl-010'],
    summary: 'Defines retention schedules for financial records, membership data, personnel files, and ministry documents in compliance with state and federal requirements.',
  },
  {
    id: 'pol-010',
    title: 'Code of Conduct',
    category: 'governance',
    version: 1,
    status: 'published',
    owner: 'Pastor Michael',
    approver: 'Board of Elders',
    effectiveDate: '2025-06-01',
    attestationRequired: true,
    attestationAudience: 'All staff and board members',
    linkedControls: [],
    summary: 'Establishes expected standards of behavior for staff, volunteers, and board members including conflict of interest disclosures.',
  },
  {
    id: 'pol-011',
    title: 'Privacy & Data Handling',
    category: 'data_privacy',
    version: 1,
    status: 'published',
    owner: 'Church Administrator',
    approver: 'Executive Pastor',
    effectiveDate: '2025-08-01',
    attestationRequired: true,
    attestationAudience: 'All staff with access to member data',
    linkedControls: ['ctrl-006'],
    summary: 'Governs collection, storage, sharing, and disposal of member personal information including contact details, giving records, and pastoral care notes.',
  },
  {
    id: 'pol-012',
    title: 'Media Consent',
    category: 'communications',
    version: 1,
    status: 'published',
    owner: 'Communications Director',
    approver: 'Executive Pastor',
    effectiveDate: '2025-09-01',
    attestationRequired: false,
    attestationAudience: '',
    linkedControls: ['ctrl-007'],
    summary: 'Requires written consent before publishing photos or videos of members, with special protections for minors and vulnerable individuals.',
  },
];

// =============================================================================
// SEEDED LEGAL DOCUMENTS
// =============================================================================

const LEGAL_DOCS: LegalDocument[] = [
  {
    id: 'ldoc-001',
    title: 'Church Bylaws',
    category: 'governance',
    status: 'executed',
    sensitivity: 'internal',
    owner: 'Board of Elders',
    lastUpdated: '2025-11-15',
    linkedPolicies: ['pol-010', 'pol-006'],
    description: 'Governing bylaws of KaNeXT Church defining organizational structure, officer roles, membership, voting procedures, and amendment process.',
  },
  {
    id: 'ldoc-002',
    title: 'Board Resolutions 2026',
    category: 'governance',
    status: 'executed',
    sensitivity: 'confidential',
    owner: 'Board Secretary',
    lastUpdated: '2026-01-20',
    linkedPolicies: ['pol-010'],
    description: 'Compiled board resolutions for fiscal year 2026 including budget approval, staff compensation adjustments, and capital expenditure authorizations.',
  },
  {
    id: 'ldoc-003',
    title: 'Banking Agreement',
    category: 'finance_banking',
    status: 'executed',
    sensitivity: 'confidential',
    owner: 'Church Treasurer',
    lastUpdated: '2025-10-01',
    linkedPolicies: ['pol-004', 'pol-006'],
    description: 'Master banking services agreement with First National Bank covering operating accounts, savings, and online banking access controls.',
  },
  {
    id: 'ldoc-004',
    title: 'Insurance Certificate',
    category: 'insurance',
    status: 'expiring',
    sensitivity: 'internal',
    owner: 'Church Administrator',
    lastUpdated: '2025-07-01',
    linkedPolicies: ['pol-007'],
    description: 'Certificate of insurance covering general liability, property, workers compensation, and directors & officers liability. Renewal due March 2026.',
  },
  {
    id: 'ldoc-005',
    title: 'Building Lease',
    category: 'facilities',
    status: 'executed',
    sensitivity: 'confidential',
    owner: 'Facilities Manager',
    lastUpdated: '2025-04-01',
    linkedPolicies: ['pol-007'],
    description: 'Ten-year commercial lease agreement for the main campus property including maintenance responsibilities, renewal options, and permitted use clauses.',
  },
  {
    id: 'ldoc-006',
    title: 'Vendor Master Agreement',
    category: 'facilities',
    status: 'executed',
    sensitivity: 'internal',
    owner: 'Church Administrator',
    lastUpdated: '2025-09-15',
    linkedPolicies: ['pol-007'],
    description: 'Standard terms and conditions template for engaging vendors providing services to the church including liability, insurance, and termination clauses.',
  },
  {
    id: 'ldoc-007',
    title: 'Staff Employment Template',
    category: 'employment',
    status: 'executed',
    sensitivity: 'restricted',
    owner: 'HR Coordinator',
    lastUpdated: '2025-08-01',
    linkedPolicies: ['pol-010', 'pol-011'],
    description: 'Standard employment agreement template for full-time and part-time church staff including compensation, benefits, confidentiality, and termination provisions.',
  },
  {
    id: 'ldoc-008',
    title: 'Background Check Vendor Agreement',
    category: 'child_safety',
    status: 'executed',
    sensitivity: 'restricted',
    owner: 'HR Coordinator',
    lastUpdated: '2025-06-01',
    linkedPolicies: ['pol-001', 'pol-002'],
    description: 'Service agreement with SafeChurch Screening for criminal background checks, sex offender registry searches, and reference verification services.',
  },
];

// =============================================================================
// SEEDED CONTROLS
// =============================================================================

const CONTROLS: ComplianceControl[] = [
  {
    id: 'ctrl-001',
    name: 'Two-person approval for disbursements >$2,000',
    linkedPolicyId: 'pol-006',
    linkedPolicyTitle: 'Dual-Approval Rules',
    owner: 'Church Treasurer',
    frequency: 'ongoing',
    evidenceType: 'log',
    scope: 'whole_church',
    evidenceStatus: 'accepted',
    lastEvidenceDate: '2026-02-10',
    notes: 'Automated dual-signature workflow in accounting system.',
  },
  {
    id: 'ctrl-002',
    name: 'Background check completion before youth assignment',
    linkedPolicyId: 'pol-001',
    linkedPolicyTitle: 'Child & Youth Protection',
    owner: 'HR Coordinator',
    frequency: 'ongoing',
    evidenceType: 'document',
    scope: 'ministry',
    evidenceStatus: 'submitted',
    lastEvidenceDate: '2026-02-05',
    notes: 'Three pending checks for new spring volunteers.',
  },
  {
    id: 'ctrl-003',
    name: 'Annual safeguarding training completion',
    linkedPolicyId: 'pol-001',
    linkedPolicyTitle: 'Child & Youth Protection',
    owner: 'Pastor Michael',
    frequency: 'annual',
    evidenceType: 'attestation',
    scope: 'ministry',
    evidenceStatus: 'pending',
    lastEvidenceDate: '2025-09-15',
    notes: '2026 training cycle begins March 1.',
  },
  {
    id: 'ctrl-004',
    name: 'Monthly restricted fund reconciliation',
    linkedPolicyId: 'pol-004',
    linkedPolicyTitle: 'Donations & Restricted Funds',
    owner: 'Church Treasurer',
    frequency: 'monthly',
    evidenceType: 'document',
    scope: 'whole_church',
    evidenceStatus: 'accepted',
    lastEvidenceDate: '2026-01-31',
  },
  {
    id: 'ctrl-005',
    name: 'Event safety checklist filing',
    linkedPolicyId: 'pol-008',
    linkedPolicyTitle: 'Event Safety',
    owner: 'Facilities Manager',
    frequency: 'ongoing',
    evidenceType: 'document',
    scope: 'whole_church',
    evidenceStatus: 'submitted',
    lastEvidenceDate: '2026-02-08',
  },
  {
    id: 'ctrl-006',
    name: 'Visitor data handling audit',
    linkedPolicyId: 'pol-011',
    linkedPolicyTitle: 'Privacy & Data Handling',
    owner: 'Church Administrator',
    frequency: 'quarterly',
    evidenceType: 'log',
    scope: 'whole_church',
    evidenceStatus: 'accepted',
    lastEvidenceDate: '2026-01-15',
  },
  {
    id: 'ctrl-007',
    name: 'Media consent collection for minors',
    linkedPolicyId: 'pol-012',
    linkedPolicyTitle: 'Media Consent',
    owner: 'Communications Director',
    frequency: 'ongoing',
    evidenceType: 'document',
    scope: 'ministry',
    evidenceStatus: 'submitted',
    lastEvidenceDate: '2026-02-12',
    notes: 'New consent forms distributed for spring semester.',
  },
  {
    id: 'ctrl-008',
    name: 'Quarterly finance controls review',
    linkedPolicyId: 'pol-006',
    linkedPolicyTitle: 'Dual-Approval Rules',
    owner: 'Finance Committee',
    frequency: 'quarterly',
    evidenceType: 'document',
    scope: 'whole_church',
    evidenceStatus: 'pending',
    lastEvidenceDate: '2025-12-20',
    notes: 'Q1 2026 review scheduled for March.',
  },
  {
    id: 'ctrl-009',
    name: 'Insurance COI verification',
    linkedPolicyId: 'pol-007',
    linkedPolicyTitle: 'Facilities Use',
    owner: 'Church Administrator',
    frequency: 'annual',
    evidenceType: 'document',
    scope: 'whole_church',
    evidenceStatus: 'pending',
    lastEvidenceDate: '2025-07-01',
    notes: 'Insurance renewal due March 2026; COI verification pending.',
  },
  {
    id: 'ctrl-010',
    name: 'Records retention compliance check',
    linkedPolicyId: 'pol-009',
    linkedPolicyTitle: 'Records Retention',
    owner: 'Church Administrator',
    frequency: 'annual',
    evidenceType: 'log',
    scope: 'whole_church',
    evidenceStatus: 'pending',
    notes: 'Policy still in draft; control not yet fully operational.',
  },
];

// =============================================================================
// SEEDED EVIDENCE ITEMS
// =============================================================================

const EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    id: 'evi-001',
    controlId: 'ctrl-001',
    controlName: 'Two-person approval for disbursements >$2,000',
    type: 'log',
    status: 'accepted',
    submittedBy: 'Church Treasurer',
    submittedDate: '2026-02-10',
    reviewerNotes: 'Accounting system log verified — all January disbursements properly dual-approved.',
  },
  {
    id: 'evi-002',
    controlId: 'ctrl-002',
    controlName: 'Background check completion before youth assignment',
    type: 'document',
    status: 'submitted',
    submittedBy: 'HR Coordinator',
    submittedDate: '2026-02-05',
    reviewerNotes: 'Awaiting completion of 3 pending background checks.',
  },
  {
    id: 'evi-003',
    controlId: 'ctrl-004',
    controlName: 'Monthly restricted fund reconciliation',
    type: 'document',
    status: 'accepted',
    submittedBy: 'Church Treasurer',
    submittedDate: '2026-01-31',
    reviewerNotes: 'January reconciliation complete and balanced.',
  },
  {
    id: 'evi-004',
    controlId: 'ctrl-005',
    controlName: 'Event safety checklist filing',
    type: 'document',
    status: 'submitted',
    submittedBy: 'Facilities Manager',
    submittedDate: '2026-02-08',
  },
  {
    id: 'evi-005',
    controlId: 'ctrl-006',
    controlName: 'Visitor data handling audit',
    type: 'log',
    status: 'accepted',
    submittedBy: 'Church Administrator',
    submittedDate: '2026-01-15',
    reviewerNotes: 'Q4 2025 audit passed — no visitor data improperly stored.',
  },
  {
    id: 'evi-006',
    controlId: 'ctrl-007',
    controlName: 'Media consent collection for minors',
    type: 'document',
    status: 'submitted',
    submittedBy: 'Communications Director',
    submittedDate: '2026-02-12',
  },
  {
    id: 'evi-007',
    controlId: 'ctrl-003',
    controlName: 'Annual safeguarding training completion',
    type: 'attestation',
    status: 'pending',
    submittedBy: 'Pastor Michael',
    submittedDate: '2026-02-01',
    reviewerNotes: '2026 training cycle has not yet started.',
  },
  {
    id: 'evi-008',
    controlId: 'ctrl-009',
    controlName: 'Insurance COI verification',
    type: 'document',
    status: 'pending',
    submittedBy: 'Church Administrator',
    submittedDate: '2026-02-15',
    reviewerNotes: 'Current COI expiring; renewal documentation pending from insurer.',
  },
];

// =============================================================================
// SEEDED AUDIT RUNS
// =============================================================================

const AUDIT_RUNS: AuditRun[] = [
  {
    id: 'audit-001',
    name: 'Q1 Finance Controls Review',
    scope: ['pol-004', 'pol-005', 'pol-006'],
    owner: 'Finance Committee',
    reviewers: ['Church Treasurer', 'Board Secretary'],
    dueDate: '2026-03-15',
    status: 'in_progress',
    findings: [
      {
        id: 'find-001',
        auditId: 'audit-001',
        title: 'Missing receipt documentation for 2 reimbursements in January',
        severity: 'medium',
        status: 'open',
        owner: 'Church Treasurer',
        remediationPlan: 'Follow up with staff members for missing receipts; reinforce reimbursement policy at next staff meeting.',
        evidenceUploaded: false,
      },
      {
        id: 'find-002',
        auditId: 'audit-001',
        title: 'Restricted fund transfer logged without narrative explanation',
        severity: 'low',
        status: 'in_progress',
        owner: 'Church Treasurer',
        remediationPlan: 'Add narrative field requirement to fund transfer workflow in accounting system.',
        evidenceUploaded: true,
      },
      {
        id: 'find-003',
        auditId: 'audit-001',
        title: 'Signatory list not updated after board member rotation',
        severity: 'high',
        status: 'open',
        owner: 'Board Secretary',
        remediationPlan: 'Update bank signatory list immediately; implement quarterly signatory verification process.',
        evidenceUploaded: false,
      },
    ],
  },
  {
    id: 'audit-002',
    name: 'Annual Safeguarding Audit 2026',
    scope: ['pol-001', 'pol-002', 'pol-003'],
    owner: 'Pastor Michael',
    reviewers: ['HR Coordinator', 'Board of Elders'],
    dueDate: '2026-06-30',
    status: 'scheduled',
    findings: [],
  },
];

// =============================================================================
// SEEDED RISKS
// =============================================================================

const RISKS: ComplianceRisk[] = [
  {
    id: 'risk-001',
    title: 'Background check coverage gap',
    category: 'safeguarding',
    severity: 'high',
    likelihood: 'medium',
    owner: 'HR Coordinator',
    mitigationPlan: 'Accelerate pending background checks for spring volunteers; implement automated tracking dashboard.',
    linkedControls: ['ctrl-002'],
    targetDate: '2026-03-01',
    residualRisk: 'medium',
    ministry: 'Youth & Children',
  },
  {
    id: 'risk-002',
    title: 'Restricted fund compliance',
    category: 'financial',
    severity: 'medium',
    likelihood: 'low',
    owner: 'Church Treasurer',
    mitigationPlan: 'Maintain monthly reconciliation cadence; add automated alerts for restricted fund disbursements.',
    linkedControls: ['ctrl-004'],
    targetDate: '2026-04-01',
    residualRisk: 'low',
  },
  {
    id: 'risk-003',
    title: 'Insurance COI expiring',
    category: 'legal',
    severity: 'high',
    likelihood: 'high',
    owner: 'Church Administrator',
    mitigationPlan: 'Initiate renewal process with insurance broker; ensure no lapse in coverage during transition.',
    linkedControls: ['ctrl-009'],
    targetDate: '2026-03-01',
    residualRisk: 'low',
  },
  {
    id: 'risk-004',
    title: 'Youth volunteer ratio',
    category: 'safeguarding',
    severity: 'medium',
    likelihood: 'medium',
    owner: 'Pastor Michael',
    mitigationPlan: 'Recruit additional screened volunteers for spring programs; enforce two-adult rule at all times.',
    linkedControls: ['ctrl-002', 'ctrl-003'],
    targetDate: '2026-03-15',
    residualRisk: 'low',
    ministry: 'Youth & Children',
  },
  {
    id: 'risk-005',
    title: 'Data retention policy gaps',
    category: 'data',
    severity: 'low',
    likelihood: 'low',
    owner: 'Church Administrator',
    mitigationPlan: 'Finalize records retention policy currently in draft; implement retention schedules across all departments.',
    linkedControls: ['ctrl-010'],
    targetDate: '2026-06-01',
    residualRisk: 'low',
  },
  {
    id: 'risk-006',
    title: 'Facilities ADA compliance',
    category: 'facilities',
    severity: 'medium',
    likelihood: 'medium',
    owner: 'Facilities Manager',
    mitigationPlan: 'Complete ADA compliance assessment; prioritize remediation of identified accessibility barriers.',
    linkedControls: ['ctrl-005'],
    targetDate: '2026-04-15',
    residualRisk: 'low',
  },
];

// =============================================================================
// SEEDED INCIDENTS
// =============================================================================

const INCIDENTS: ComplianceIncident[] = [
  {
    id: 'inc-001',
    type: 'facilities_safety',
    title: 'Minor injury at youth event',
    status: 'resolved',
    severity: 'medium',
    reportedBy: 'Youth Pastor Davis',
    reportedDate: '2026-01-28',
    description: 'A youth participant sustained a minor ankle sprain during a gym activity at the Youth Center. First aid was administered on-site.',
    immediateActions: 'First aid applied; parent notified and picked up the participant. Incident report filed with Facilities Manager.',
    rootCause: 'Wet floor near gym entrance not marked with caution signage.',
    correctiveActions: 'Installed permanent non-slip mats at gym entrance; added caution sign protocol to event safety checklist.',
    evidenceCount: 3,
  },
  {
    id: 'inc-002',
    type: 'financial_irregularity',
    title: 'Suspicious financial request flagged',
    status: 'investigating',
    severity: 'high',
    reportedBy: 'Church Treasurer',
    reportedDate: '2026-02-10',
    description: 'An email requesting an urgent wire transfer of $4,500 was received purporting to be from the Senior Pastor. The email address was slightly different from the official account.',
    immediateActions: 'Wire transfer request blocked; IT team notified. Senior Pastor confirmed the email was not from him.',
    evidenceCount: 2,
  },
  {
    id: 'inc-003',
    type: 'data_privacy',
    title: 'Data handling concern from member',
    status: 'closed',
    severity: 'low',
    reportedBy: 'Church Administrator',
    reportedDate: '2026-01-15',
    description: 'A member raised a concern that their giving history was visible to a volunteer who should not have had access to financial records.',
    immediateActions: 'Access permissions reviewed and corrected immediately. Member was contacted and informed of the resolution.',
    rootCause: 'Overly broad role assignment in the church management system granted financial read access to general volunteers.',
    correctiveActions: 'Tightened role-based access controls in church management system; conducted full access audit across all volunteer roles.',
    evidenceCount: 4,
  },
];

// =============================================================================
// SEEDED EXCEPTIONS
// =============================================================================

const EXCEPTIONS: ComplianceException[] = [
  {
    id: 'exc-001',
    policyTitle: 'Dual-Approval Rules',
    controlId: 'ctrl-001',
    reason: 'Emergency benevolence disbursement of $3,200 needed for a family in crisis. Second authorized signer was unavailable due to travel.',
    duration: '7 days',
    riskAcknowledgment: 'Single-signer disbursement increases risk of unauthorized expenditure. Amount and recipient verified by pastoral staff.',
    compensatingControls: 'Verbal approval obtained from second signer via phone; follow-up written confirmation required within 48 hours.',
    requestedBy: 'Executive Pastor',
    requestedDate: '2026-02-03',
    status: 'approved',
    approvers: ['Church Treasurer', 'Board Chair'],
  },
  {
    id: 'exc-002',
    policyTitle: 'Facilities Use',
    controlId: 'ctrl-005',
    reason: 'Temporary facility use policy waiver for a community disaster relief event hosted on short notice. Standard 14-day booking process could not be followed.',
    duration: '3 days',
    riskAcknowledgment: 'Abbreviated booking process may result in incomplete safety checklist and insurance verification.',
    compensatingControls: 'Facilities Manager personally supervised event setup; verbal insurance confirmation obtained from community organizer.',
    requestedBy: 'Facilities Manager',
    requestedDate: '2026-02-14',
    status: 'requested',
    approvers: ['Executive Pastor'],
  },
];

// =============================================================================
// SEEDED EXPORT PACKETS
// =============================================================================

const EXPORT_PACKETS: ExportPacket[] = [
  {
    id: 'exp-001',
    name: 'Safeguarding',
    description: 'Complete safeguarding compliance package including child protection policies, volunteer screening procedures, and training records.',
    includedPolicies: 3,
    includedControls: 3,
    includedEvidence: 3,
    generatedDate: '2026-01-20',
  },
  {
    id: 'exp-002',
    name: 'Finance Controls',
    description: 'Financial compliance package covering dual-approval rules, donation handling, reimbursement policies, and fund reconciliation evidence.',
    includedPolicies: 3,
    includedControls: 3,
    includedEvidence: 2,
    generatedDate: '2026-01-31',
  },
  {
    id: 'exp-003',
    name: 'Insurance',
    description: 'Insurance compliance package including certificate of insurance, COI verification records, and facilities liability documentation.',
    includedPolicies: 1,
    includedControls: 1,
    includedEvidence: 1,
  },
  {
    id: 'exp-004',
    name: 'Facilities & Events',
    description: 'Facilities compliance package covering use policies, event safety checklists, vendor agreements, and inspection records.',
    includedPolicies: 2,
    includedControls: 2,
    includedEvidence: 1,
  },
  {
    id: 'exp-005',
    name: 'Annual Compliance Summary',
    description: 'Comprehensive annual compliance report covering all policy domains, control assessments, audit findings, risk register, and incident log.',
    includedPolicies: 12,
    includedControls: 10,
    includedEvidence: 8,
  },
];

// =============================================================================
// DATA ACCESSOR
// =============================================================================

export function getChurchComplianceLegalData() {
  return {
    policies: POLICIES,
    legalDocs: LEGAL_DOCS,
    controls: CONTROLS,
    evidenceItems: EVIDENCE_ITEMS,
    auditRuns: AUDIT_RUNS,
    risks: RISKS,
    incidents: INCIDENTS,
    exceptions: EXCEPTIONS,
    exportPackets: EXPORT_PACKETS,
    overviewStatus: {
      status: 'yellow' as ComplianceStatus,
      openCriticalRisks: 1,
      openIncidents: 1,
      missingPolicies: 1,
      evidenceCompleteness: 78,
      lastAuditRun: '2026-01-15',
      nextAuditScheduled: '2026-04-01',
    },
  };
}
