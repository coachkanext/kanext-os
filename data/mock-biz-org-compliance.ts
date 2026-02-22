/**
 * Business Organization Compliance Hub — Mock Data & Types (V2)
 * 9-tab Compliance Hub: Overview, Policies, Risk Register, Controls,
 * Evidence, Audits, Incidents, Exceptions, Exports.
 *
 * Key feature: Controls can BLOCK Payment Rails release if failed.
 * Incidents become immutable once closed.
 * Entity-scoped data tied to seeded KaNeXT entities + Sliema Wanderers FC.
 */

import {
  KANEXT_HOLDCO,
  KANEXT_OPSCO,
  SLIEMA_WANDERERS,
  SEEDED_ENTITY_NAMES,
} from '@/data/biz-org-shared-types';

// =============================================================================
// TYPES
// =============================================================================

export type ComplianceSubTabId =
  | 'overview'
  | 'policies'
  | 'risk-register'
  | 'controls'
  | 'evidence'
  | 'audits'
  | 'incidents'
  | 'exceptions'
  | 'exports';

export interface ComplianceSubTab {
  id: ComplianceSubTabId;
  label: string;
}

export interface ComplianceOverview {
  score: number; // 0-100
  activePolicies: number;
  openRisks: number;
  controlEffectiveness: number; // 0-100
  upcomingAudits: number;
  recentIncidents: number;
}

export interface CompliancePolicy {
  id: string;
  name: string;
  category: 'data_privacy' | 'financial' | 'operational' | 'hr' | 'security' | 'regulatory';
  version: string;
  effectiveDate: string;
  reviewCycle: string;
  owner: string;
  status: 'active' | 'draft' | 'under_review' | 'archived';
  entityName: string;
}

export interface ComplianceRisk {
  id: string;
  title: string;
  description: string;
  likelihood: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  mitigationStatus: 'mitigated' | 'in_progress' | 'unmitigated';
  linkedControlIds: string[];
  entityId: string;
  entityName: string;
  owner: string;
}

export interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  type: 'preventive' | 'detective' | 'corrective';
  effectiveness: 'effective' | 'partially_effective' | 'ineffective';
  canBlockRails: boolean;
  blockRelease: boolean;
  lastTested: string;
  testResult: 'pass' | 'fail' | 'partial';
  linkedRiskIds: string[];
  entityName: string;
}

export interface ComplianceEvidence {
  id: string;
  title: string;
  controlId: string;
  controlName: string;
  type: 'document' | 'screenshot' | 'log' | 'attestation';
  uploadedBy: string;
  uploadDate: string;
  reviewStatus: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  entityName: string;
}

export interface ComplianceAudit {
  id: string;
  name: string;
  type: 'internal' | 'external' | 'regulatory';
  status: 'scheduled' | 'in_progress' | 'completed' | 'remediation';
  scheduledDate: string;
  completedDate: string | null;
  findings: number;
  remediationStatus: string | null;
  entityName: string;
}

export interface ComplianceIncident {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  reportedDate: string;
  resolvedDate: string | null;
  linkedControlIds: string[];
  linkedRiskIds: string[];
  entityName: string;
  immutableOnceClosed: boolean;
}

export interface ComplianceException {
  id: string;
  title: string;
  policyId: string;
  policyName: string;
  justification: string;
  approvedBy: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'revoked';
  entityName: string;
}

export interface ComplianceExportOption {
  id: string;
  label: string;
  description: string;
  format: 'PDF' | 'CSV' | 'XLSX' | 'JSON';
  icon: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const COMPLIANCE_SUB_TABS: ComplianceSubTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'policies', label: 'Policies' },
  { id: 'risk-register', label: 'Risk Register' },
  { id: 'controls', label: 'Controls' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'audits', label: 'Audits' },
  { id: 'incidents', label: 'Incidents' },
  { id: 'exceptions', label: 'Exceptions' },
  { id: 'exports', label: 'Exports' },
];

// =============================================================================
// STATUS COLORS
// =============================================================================

export const POLICY_STATUS_COLOR: Record<CompliancePolicy['status'], string> = {
  active: '#22C55E',
  draft: '#1D9BF0',
  under_review: '#F59E0B',
  archived: '#A1A1AA',
};

export const POLICY_STATUS_LABEL: Record<CompliancePolicy['status'], string> = {
  active: 'Active',
  draft: 'Draft',
  under_review: 'Under Review',
  archived: 'Archived',
};

export const POLICY_CATEGORY_COLOR: Record<CompliancePolicy['category'], string> = {
  data_privacy: '#1D9BF0',
  financial: '#F59E0B',
  operational: '#22C55E',
  hr: '#1D9BF0',
  security: '#EF4444',
  regulatory: '#1D9BF0',
};

export const POLICY_CATEGORY_LABEL: Record<CompliancePolicy['category'], string> = {
  data_privacy: 'Data Privacy',
  financial: 'Financial',
  operational: 'Operational',
  hr: 'HR',
  security: 'Security',
  regulatory: 'Regulatory',
};

export const RISK_LIKELIHOOD_COLOR: Record<ComplianceRisk['likelihood'], string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#22C55E',
};

export const RISK_IMPACT_COLOR: Record<ComplianceRisk['impact'], string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#22C55E',
};

export const MITIGATION_STATUS_COLOR: Record<ComplianceRisk['mitigationStatus'], string> = {
  mitigated: '#22C55E',
  in_progress: '#F59E0B',
  unmitigated: '#EF4444',
};

export const MITIGATION_STATUS_LABEL: Record<ComplianceRisk['mitigationStatus'], string> = {
  mitigated: 'Mitigated',
  in_progress: 'In Progress',
  unmitigated: 'Unmitigated',
};

export const CONTROL_TYPE_COLOR: Record<ComplianceControl['type'], string> = {
  preventive: '#1D9BF0',
  detective: '#F59E0B',
  corrective: '#1D9BF0',
};

export const CONTROL_TYPE_LABEL: Record<ComplianceControl['type'], string> = {
  preventive: 'Preventive',
  detective: 'Detective',
  corrective: 'Corrective',
};

export const EFFECTIVENESS_COLOR: Record<ComplianceControl['effectiveness'], string> = {
  effective: '#22C55E',
  partially_effective: '#F59E0B',
  ineffective: '#EF4444',
};

export const EFFECTIVENESS_LABEL: Record<ComplianceControl['effectiveness'], string> = {
  effective: 'Effective',
  partially_effective: 'Partial',
  ineffective: 'Ineffective',
};

export const TEST_RESULT_COLOR: Record<ComplianceControl['testResult'], string> = {
  pass: '#22C55E',
  fail: '#EF4444',
  partial: '#F59E0B',
};

export const TEST_RESULT_LABEL: Record<ComplianceControl['testResult'], string> = {
  pass: 'Pass',
  fail: 'Fail',
  partial: 'Partial',
};

export const EVIDENCE_TYPE_COLOR: Record<ComplianceEvidence['type'], string> = {
  document: '#1D9BF0',
  screenshot: '#1D9BF0',
  log: '#1D9BF0',
  attestation: '#22C55E',
};

export const EVIDENCE_TYPE_LABEL: Record<ComplianceEvidence['type'], string> = {
  document: 'Document',
  screenshot: 'Screenshot',
  log: 'Log',
  attestation: 'Attestation',
};

export const EVIDENCE_REVIEW_COLOR: Record<ComplianceEvidence['reviewStatus'], string> = {
  pending: '#F59E0B',
  reviewed: '#1D9BF0',
  accepted: '#22C55E',
  rejected: '#EF4444',
};

export const EVIDENCE_REVIEW_LABEL: Record<ComplianceEvidence['reviewStatus'], string> = {
  pending: 'Pending',
  reviewed: 'Reviewed',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export const AUDIT_TYPE_COLOR: Record<ComplianceAudit['type'], string> = {
  internal: '#1D9BF0',
  external: '#1D9BF0',
  regulatory: '#EF4444',
};

export const AUDIT_TYPE_LABEL: Record<ComplianceAudit['type'], string> = {
  internal: 'Internal',
  external: 'External',
  regulatory: 'Regulatory',
};

export const AUDIT_STATUS_COLOR: Record<ComplianceAudit['status'], string> = {
  scheduled: '#1D9BF0',
  in_progress: '#F59E0B',
  completed: '#22C55E',
  remediation: '#EF4444',
};

export const AUDIT_STATUS_LABEL: Record<ComplianceAudit['status'], string> = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  remediation: 'Remediation',
};

export const INCIDENT_SEVERITY_COLOR: Record<ComplianceIncident['severity'], string> = {
  critical: '#EF4444',
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#22C55E',
};

export const INCIDENT_STATUS_COLOR: Record<ComplianceIncident['status'], string> = {
  open: '#EF4444',
  investigating: '#F59E0B',
  resolved: '#22C55E',
  closed: '#A1A1AA',
};

export const INCIDENT_STATUS_LABEL: Record<ComplianceIncident['status'], string> = {
  open: 'Open',
  investigating: 'Investigating',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const EXCEPTION_STATUS_COLOR: Record<ComplianceException['status'], string> = {
  active: '#22C55E',
  expired: '#A1A1AA',
  revoked: '#EF4444',
};

export const EXCEPTION_STATUS_LABEL: Record<ComplianceException['status'], string> = {
  active: 'Active',
  expired: 'Expired',
  revoked: 'Revoked',
};

export const EXPORT_FORMAT_COLOR: Record<ComplianceExportOption['format'], string> = {
  PDF: '#EF4444',
  CSV: '#22C55E',
  XLSX: '#1D9BF0',
  JSON: '#F59E0B',
};

// =============================================================================
// MOCK DATA
// =============================================================================

const overview: ComplianceOverview = {
  score: 82,
  activePolicies: 12,
  openRisks: 5,
  controlEffectiveness: 78,
  upcomingAudits: 2,
  recentIncidents: 1,
};

const policies: CompliancePolicy[] = [
  {
    id: 'cpol-1',
    name: 'Data Privacy & Protection Policy',
    category: 'data_privacy',
    version: '3.2',
    effectiveDate: '2025-01-15',
    reviewCycle: 'Annual',
    owner: 'Lisa Grant',
    status: 'active',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
  {
    id: 'cpol-2',
    name: 'AML/KYC Compliance Policy',
    category: 'regulatory',
    version: '2.1',
    effectiveDate: '2025-03-01',
    reviewCycle: 'Semi-Annual',
    owner: 'David Kim',
    status: 'active',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
  {
    id: 'cpol-3',
    name: 'Financial Controls & Reporting',
    category: 'financial',
    version: '4.0',
    effectiveDate: '2025-02-01',
    reviewCycle: 'Annual',
    owner: 'Priya Patel',
    status: 'active',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
  },
  {
    id: 'cpol-4',
    name: 'Employee Conduct & HR Compliance',
    category: 'hr',
    version: '2.5',
    effectiveDate: '2024-07-01',
    reviewCycle: 'Annual',
    owner: 'Maria Rodriguez',
    status: 'active',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
  {
    id: 'cpol-5',
    name: 'Information Security Policy',
    category: 'security',
    version: '5.1',
    effectiveDate: '2025-04-01',
    reviewCycle: 'Annual',
    owner: 'David Kim',
    status: 'active',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
  },
  {
    id: 'cpol-6',
    name: 'GDPR Data Processing Agreement',
    category: 'data_privacy',
    version: '1.0',
    effectiveDate: '2026-04-01',
    reviewCycle: 'Annual',
    owner: 'Lisa Grant',
    status: 'draft',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
  {
    id: 'cpol-7',
    name: 'Operational Risk Management',
    category: 'operational',
    version: '2.3',
    effectiveDate: '2024-06-01',
    reviewCycle: 'Quarterly',
    owner: 'James Park',
    status: 'under_review',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
  },
  {
    id: 'cpol-8',
    name: 'Anti-Bribery & Corruption Policy',
    category: 'regulatory',
    version: '1.5',
    effectiveDate: '2024-09-15',
    reviewCycle: 'Annual',
    owner: 'Maria Rodriguez',
    status: 'active',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
  {
    id: 'cpol-9',
    name: 'Sliema Wanderers FC Compliance Manual',
    category: 'regulatory',
    version: '1.2',
    effectiveDate: '2025-08-01',
    reviewCycle: 'Semi-Annual',
    owner: 'Victor Borg',
    status: 'active',
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
  },
  {
    id: 'cpol-10',
    name: 'Vendor Risk Management Policy',
    category: 'operational',
    version: '3.0',
    effectiveDate: '2025-05-01',
    reviewCycle: 'Annual',
    owner: 'James Park',
    status: 'active',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
  },
  {
    id: 'cpol-11',
    name: 'Whistleblower Protection Policy',
    category: 'hr',
    version: '1.3',
    effectiveDate: '2024-11-01',
    reviewCycle: 'Annual',
    owner: 'Maria Rodriguez',
    status: 'active',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
  {
    id: 'cpol-12',
    name: 'Legacy Travel Expense Policy',
    category: 'financial',
    version: '1.0',
    effectiveDate: '2021-01-01',
    reviewCycle: 'N/A',
    owner: 'Priya Patel',
    status: 'archived',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
  },
];

const risks: ComplianceRisk[] = [
  {
    id: 'crisk-1',
    title: 'Third-Party Data Breach Exposure',
    description: 'Vendor ecosystems may expose PII or financial data through supply chain vulnerabilities, leading to regulatory penalties and reputational damage.',
    likelihood: 'medium',
    impact: 'high',
    mitigationStatus: 'in_progress',
    linkedControlIds: ['cctl-1', 'cctl-5'],
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    owner: 'James Park',
  },
  {
    id: 'crisk-2',
    title: 'AML/KYC Program Deficiency',
    description: 'Incomplete KYC documentation for high-risk payment corridors could result in regulatory enforcement action and potential fines from FinCEN or FCA.',
    likelihood: 'low',
    impact: 'high',
    mitigationStatus: 'mitigated',
    linkedControlIds: ['cctl-2', 'cctl-6'],
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    owner: 'David Kim',
  },
  {
    id: 'crisk-3',
    title: 'GDPR Non-Compliance Fine',
    description: 'Failure to process DSAR requests within 30-day window or insufficient consent management could trigger enforcement from EU data protection authorities.',
    likelihood: 'low',
    impact: 'high',
    mitigationStatus: 'mitigated',
    linkedControlIds: ['cctl-3'],
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    owner: 'Lisa Grant',
  },
  {
    id: 'crisk-4',
    title: 'Sliema Wanderers FC — Regulatory Breach',
    description: 'Sliema Wanderers FC entity may face MFA non-compliance with Maltese football regulatory body due to incomplete player registration documentation.',
    likelihood: 'medium',
    impact: 'medium',
    mitigationStatus: 'unmitigated',
    linkedControlIds: ['cctl-7'],
    entityId: SLIEMA_WANDERERS,
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
    owner: 'Victor Borg',
  },
  {
    id: 'crisk-5',
    title: 'Payment Rails Authorization Gap',
    description: 'Insufficient separation of duties in payment release process could allow unauthorized disbursements through OpsCo rails.',
    likelihood: 'low',
    impact: 'high',
    mitigationStatus: 'in_progress',
    linkedControlIds: ['cctl-4', 'cctl-6'],
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    owner: 'Priya Patel',
  },
  {
    id: 'crisk-6',
    title: 'Insider Threat — Data Exfiltration',
    description: 'Privileged users with broad access may exfiltrate sensitive financial or personal data without detection due to inadequate DLP controls.',
    likelihood: 'low',
    impact: 'medium',
    mitigationStatus: 'in_progress',
    linkedControlIds: ['cctl-5', 'cctl-8'],
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    owner: 'David Kim',
  },
];

const controls: ComplianceControl[] = [
  {
    id: 'cctl-1',
    name: 'Vendor Security Assessment',
    description: 'Quarterly security posture review of all third-party vendors processing customer data or handling financial transactions.',
    type: 'preventive',
    effectiveness: 'effective',
    canBlockRails: false,
    blockRelease: false,
    lastTested: '2026-01-15',
    testResult: 'pass',
    linkedRiskIds: ['crisk-1'],
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
  {
    id: 'cctl-2',
    name: 'AML Transaction Monitoring',
    description: 'Real-time monitoring of all payment transactions for suspicious activity patterns, with automated SAR filing when thresholds are breached.',
    type: 'detective',
    effectiveness: 'effective',
    canBlockRails: true,
    blockRelease: true,
    lastTested: '2026-02-01',
    testResult: 'pass',
    linkedRiskIds: ['crisk-2'],
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
  {
    id: 'cctl-3',
    name: 'DSAR Automated Processing',
    description: 'Automated pipeline for data subject access requests with 14-day SLA, audit trail, and escalation to DPO for complex cases.',
    type: 'corrective',
    effectiveness: 'effective',
    canBlockRails: false,
    blockRelease: false,
    lastTested: '2026-01-20',
    testResult: 'pass',
    linkedRiskIds: ['crisk-3'],
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
  },
  {
    id: 'cctl-4',
    name: 'Payment Release Dual Authorization',
    description: 'All payments above $10,000 require dual authorization from two separate signatories. Blocks rails release if second approval is missing.',
    type: 'preventive',
    effectiveness: 'partially_effective',
    canBlockRails: true,
    blockRelease: true,
    lastTested: '2026-02-05',
    testResult: 'partial',
    linkedRiskIds: ['crisk-5'],
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
  },
  {
    id: 'cctl-5',
    name: 'Data Loss Prevention (DLP)',
    description: 'Endpoint and network DLP monitoring to detect and prevent unauthorized data transfers, including email, USB, and cloud storage.',
    type: 'detective',
    effectiveness: 'partially_effective',
    canBlockRails: false,
    blockRelease: false,
    lastTested: '2026-01-28',
    testResult: 'partial',
    linkedRiskIds: ['crisk-1', 'crisk-6'],
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
  {
    id: 'cctl-6',
    name: 'KYC Document Verification',
    description: 'Automated identity verification with manual review fallback for high-risk jurisdictions. Blocks payment rail onboarding if KYC fails.',
    type: 'preventive',
    effectiveness: 'effective',
    canBlockRails: true,
    blockRelease: true,
    lastTested: '2026-02-10',
    testResult: 'pass',
    linkedRiskIds: ['crisk-2', 'crisk-5'],
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
  {
    id: 'cctl-7',
    name: 'Sliema FC Registration Compliance',
    description: 'Player registration documentation completeness check against MFA regulatory requirements. Manual process due to legacy systems.',
    type: 'corrective',
    effectiveness: 'ineffective',
    canBlockRails: false,
    blockRelease: false,
    lastTested: '2025-12-15',
    testResult: 'fail',
    linkedRiskIds: ['crisk-4'],
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
  },
  {
    id: 'cctl-8',
    name: 'Privileged Access Recertification',
    description: 'Quarterly review and recertification of all privileged access accounts, including service accounts and admin roles.',
    type: 'detective',
    effectiveness: 'effective',
    canBlockRails: false,
    blockRelease: false,
    lastTested: '2026-02-01',
    testResult: 'pass',
    linkedRiskIds: ['crisk-6'],
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
  },
];

const evidence: ComplianceEvidence[] = [
  {
    id: 'cevd-1',
    title: 'Q4 2025 Vendor Security Assessment Report',
    controlId: 'cctl-1',
    controlName: 'Vendor Security Assessment',
    type: 'document',
    uploadedBy: 'James Park',
    uploadDate: '2026-01-18',
    reviewStatus: 'accepted',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
  {
    id: 'cevd-2',
    title: 'AML Transaction Monitoring — Feb 2026 Logs',
    controlId: 'cctl-2',
    controlName: 'AML Transaction Monitoring',
    type: 'log',
    uploadedBy: 'David Kim',
    uploadDate: '2026-02-12',
    reviewStatus: 'pending',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
  {
    id: 'cevd-3',
    title: 'DSAR Processing Pipeline Screenshot',
    controlId: 'cctl-3',
    controlName: 'DSAR Automated Processing',
    type: 'screenshot',
    uploadedBy: 'Lisa Grant',
    uploadDate: '2026-01-22',
    reviewStatus: 'accepted',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
  },
  {
    id: 'cevd-4',
    title: 'Dual Authorization Test — Payment Rails',
    controlId: 'cctl-4',
    controlName: 'Payment Release Dual Authorization',
    type: 'document',
    uploadedBy: 'Priya Patel',
    uploadDate: '2026-02-06',
    reviewStatus: 'reviewed',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
  },
  {
    id: 'cevd-5',
    title: 'KYC Verification Attestation — Q1 2026',
    controlId: 'cctl-6',
    controlName: 'KYC Document Verification',
    type: 'attestation',
    uploadedBy: 'David Kim',
    uploadDate: '2026-02-11',
    reviewStatus: 'accepted',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
  {
    id: 'cevd-6',
    title: 'Sliema FC Player Registration Audit Trail',
    controlId: 'cctl-7',
    controlName: 'Sliema FC Registration Compliance',
    type: 'document',
    uploadedBy: 'Victor Borg',
    uploadDate: '2025-12-20',
    reviewStatus: 'rejected',
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
  },
];

const audits: ComplianceAudit[] = [
  {
    id: 'caud-1',
    name: 'SOC 2 Type II Annual Audit',
    type: 'external',
    status: 'scheduled',
    scheduledDate: '2026-04-15',
    completedDate: null,
    findings: 0,
    remediationStatus: null,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
  {
    id: 'caud-2',
    name: 'Internal Controls Effectiveness Review',
    type: 'internal',
    status: 'completed',
    scheduledDate: '2025-10-01',
    completedDate: '2025-12-15',
    findings: 3,
    remediationStatus: '2 of 3 remediated',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
  },
  {
    id: 'caud-3',
    name: 'MFA Regulatory Compliance Audit — Sliema',
    type: 'regulatory',
    status: 'remediation',
    scheduledDate: '2025-11-01',
    completedDate: '2026-01-31',
    findings: 4,
    remediationStatus: '1 of 4 remediated',
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
  },
  {
    id: 'caud-4',
    name: 'AML/KYC Program Assessment',
    type: 'regulatory',
    status: 'scheduled',
    scheduledDate: '2026-05-01',
    completedDate: null,
    findings: 0,
    remediationStatus: null,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
];

const incidents: ComplianceIncident[] = [
  {
    id: 'cinc-1',
    title: 'Unauthorized Staging DB Access',
    description: 'Unauthorized access to customer PII detected in staging database. 2,340 records potentially exposed due to misconfigured ETL pipeline that replicated production data.',
    severity: 'critical',
    status: 'investigating',
    reportedDate: '2026-02-14',
    resolvedDate: null,
    linkedControlIds: ['cctl-5'],
    linkedRiskIds: ['crisk-1', 'crisk-6'],
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    immutableOnceClosed: true,
  },
  {
    id: 'cinc-2',
    title: 'Sliema FC — Player Registration Non-Compliance',
    description: 'MFA notified Sliema Wanderers FC of incomplete player registration documentation for 3 players in the January transfer window, triggering a regulatory review.',
    severity: 'medium',
    status: 'open',
    reportedDate: '2026-02-08',
    resolvedDate: null,
    linkedControlIds: ['cctl-7'],
    linkedRiskIds: ['crisk-4'],
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
    immutableOnceClosed: true,
  },
  {
    id: 'cinc-3',
    title: 'Payment Rails — Missing Dual Authorization',
    description: 'A $45,000 vendor payment was released with only single-signer authorization, bypassing the dual-approval control. Payment was flagged and reversed within 4 hours.',
    severity: 'high',
    status: 'resolved',
    reportedDate: '2026-01-25',
    resolvedDate: '2026-01-25',
    linkedControlIds: ['cctl-4'],
    linkedRiskIds: ['crisk-5'],
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    immutableOnceClosed: true,
  },
];

const exceptions: ComplianceException[] = [
  {
    id: 'cexc-1',
    title: 'Temporary KYC Exemption — Low-Risk Corridor',
    policyId: 'cpol-2',
    policyName: 'AML/KYC Compliance Policy',
    justification: 'Low-risk domestic corridor transactions under $500 temporarily exempted from full KYC while simplified verification pipeline is being built.',
    approvedBy: 'David Kim (Compliance Officer)',
    expiryDate: '2026-06-30',
    status: 'active',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
  {
    id: 'cexc-2',
    title: 'Legacy System Access — Sliema FC',
    policyId: 'cpol-9',
    policyName: 'Sliema Wanderers FC Compliance Manual',
    justification: 'Legacy player registration system requires shared credentials until SSO integration is complete. Compensating control: access logging enabled.',
    approvedBy: 'Victor Borg (FC Compliance)',
    expiryDate: '2026-04-15',
    status: 'active',
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
  },
  {
    id: 'cexc-3',
    title: 'Remote Access Policy Deviation — Q3 2025',
    policyId: 'cpol-5',
    policyName: 'Information Security Policy',
    justification: 'Contractor remote access VPN exemption for 3 developers during off-site sprint. Revoked after sprint completion.',
    approvedBy: 'David Kim (CISO)',
    expiryDate: '2025-09-30',
    status: 'expired',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
  },
];

const exportOptions: ComplianceExportOption[] = [
  {
    id: 'exp-1',
    label: 'Compliance Scorecard',
    description: 'Full compliance score breakdown with trend analysis and entity-level detail.',
    format: 'PDF',
    icon: 'chart.bar.fill',
  },
  {
    id: 'exp-2',
    label: 'Risk Register Export',
    description: 'Complete risk register with likelihood, impact, mitigation status, and linked controls.',
    format: 'XLSX',
    icon: 'shield.lefthalf.filled',
  },
  {
    id: 'exp-3',
    label: 'Controls Matrix',
    description: 'Control effectiveness matrix mapped to risks with test results and evidence links.',
    format: 'CSV',
    icon: 'tablecells',
  },
  {
    id: 'exp-4',
    label: 'Audit Findings Summary',
    description: 'Summary of all audit findings with remediation status and responsible parties.',
    format: 'PDF',
    icon: 'magnifyingglass.circle.fill',
  },
  {
    id: 'exp-5',
    label: 'Incident Response Log',
    description: 'Full incident timeline with severity, status, linked controls, and resolution details.',
    format: 'JSON',
    icon: 'exclamationmark.triangle.fill',
  },
  {
    id: 'exp-6',
    label: 'Policy Exception Register',
    description: 'Active and expired policy exceptions with justifications and approval chain.',
    format: 'PDF',
    icon: 'doc.badge.gearshape',
  },
  {
    id: 'exp-7',
    label: 'Evidence Inventory',
    description: 'Complete evidence log with control mappings, review status, and upload metadata.',
    format: 'CSV',
    icon: 'paperclip',
  },
  {
    id: 'exp-8',
    label: 'Board-Ready Compliance Report',
    description: 'Executive summary of compliance posture, key risks, and recommended actions for board presentation.',
    format: 'PDF',
    icon: 'doc.text.fill',
  },
];

// =============================================================================
// RECENT ACTIVITY (for Overview tab)
// =============================================================================

export interface ComplianceActivity {
  id: string;
  text: string;
  timestamp: string;
  type: 'policy' | 'risk' | 'control' | 'audit' | 'incident' | 'evidence' | 'exception';
}

const recentActivity: ComplianceActivity[] = [
  { id: 'act-1', text: 'Critical incident reported: Unauthorized staging DB access', timestamp: '2 hours ago', type: 'incident' },
  { id: 'act-2', text: 'KYC Verification Attestation accepted by reviewer', timestamp: '6 hours ago', type: 'evidence' },
  { id: 'act-3', text: 'Dual Authorization control test result: Partial', timestamp: '1 day ago', type: 'control' },
  { id: 'act-4', text: 'Sliema FC incident opened: Player registration non-compliance', timestamp: '2 days ago', type: 'incident' },
  { id: 'act-5', text: 'SOC 2 Type II audit scheduled for April 2026', timestamp: '3 days ago', type: 'audit' },
  { id: 'act-6', text: 'Operational Risk Management Policy moved to Under Review', timestamp: '5 days ago', type: 'policy' },
];

// =============================================================================
// DATA GETTER
// =============================================================================

export interface RailsReadiness {
  score: number;
  label: string;
  color: string;
}

export interface AttestationRequirement {
  policyId: string;
  attestedBy: string[];
  dueDate: string;
  status: 'complete' | 'pending' | 'overdue';
}

export interface BizComplianceV2Data {
  overview: ComplianceOverview;
  policies: CompliancePolicy[];
  risks: ComplianceRisk[];
  controls: ComplianceControl[];
  evidence: ComplianceEvidence[];
  audits: ComplianceAudit[];
  incidents: ComplianceIncident[];
  exceptions: ComplianceException[];
  exportOptions: ComplianceExportOption[];
  recentActivity: ComplianceActivity[];
  railsReadiness: RailsReadiness;
  attestationRequirements: AttestationRequirement[];
}

// =============================================================================
// RAILS READINESS
// =============================================================================

const railsReadiness: RailsReadiness = {
  score: 72,
  label: 'On Track',
  color: '#F59E0B',
};

// =============================================================================
// ATTESTATION REQUIREMENTS
// =============================================================================

const attestationRequirements: AttestationRequirement[] = [
  {
    policyId: 'cpol-1',
    attestedBy: ['Lisa Grant', 'David Kim'],
    dueDate: '2026-03-15',
    status: 'complete',
  },
  {
    policyId: 'cpol-2',
    attestedBy: ['David Kim'],
    dueDate: '2026-03-01',
    status: 'pending',
  },
  {
    policyId: 'cpol-5',
    attestedBy: [],
    dueDate: '2026-02-15',
    status: 'overdue',
  },
  {
    policyId: 'cpol-9',
    attestedBy: ['Victor Borg', 'Maria Rodriguez'],
    dueDate: '2026-04-01',
    status: 'complete',
  },
];

// =============================================================================
// DATA GETTER
// =============================================================================

export function getBizComplianceData(): BizComplianceV2Data {
  return {
    overview,
    policies,
    risks,
    controls,
    evidence,
    audits,
    incidents,
    exceptions,
    exportOptions,
    recentActivity,
    railsReadiness,
    attestationRequirements,
  };
}
