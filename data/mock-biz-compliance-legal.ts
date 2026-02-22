/**
 * Mock Business Compliance/Legal Data — 9 sub-tabs for the Compliance & Legal tab.
 * All data references Valuetainment entities: Delaware C-Corp filings, trademark filings,
 * SAFE note compliance, KYC/AML for payment rails, Valuetainment partnership agreement,
 * data privacy policies, Alex/Tom/PBD references.
 */

// =============================================================================
// SUB-TAB IDS
// =============================================================================

export type ComplianceSubTab =
  | 'overview'
  | 'legal_docs'
  | 'policies'
  | 'risk_register'
  | 'controls'
  | 'audits'
  | 'incidents'
  | 'exceptions'
  | 'exports';

export const COMPLIANCE_SUB_TABS: { id: ComplianceSubTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'legal_docs', label: 'Legal Docs' },
  { id: 'policies', label: 'Policies' },
  { id: 'risk_register', label: 'Risk Register' },
  { id: 'controls', label: 'Controls' },
  { id: 'audits', label: 'Audits' },
  { id: 'incidents', label: 'Incidents' },
  { id: 'exceptions', label: 'Exceptions' },
  { id: 'exports', label: 'Exports' },
];

// =============================================================================
// OVERVIEW
// =============================================================================

export interface ComplianceOverview {
  score: number;
  status: 'compliant' | 'at_risk' | 'non_compliant';
  openItems: number;
  upcomingDeadlines: number;
  lastAudit: string;
}

export const COMPLIANCE_OVERVIEW: ComplianceOverview = {
  score: 87,
  status: 'compliant',
  openItems: 4,
  upcomingDeadlines: 3,
  lastAudit: '2026-01-15',
};

// =============================================================================
// LEGAL DOCS
// =============================================================================

export interface LegalDoc {
  id: string;
  title: string;
  type: 'contract' | 'agreement' | 'filing' | 'registration' | 'policy' | 'certificate';
  status: 'active' | 'expired' | 'pending' | 'draft';
  effectiveDate: string;
  expiryDate?: string;
  entity: string;
  counterparty?: string;
}

export const LEGAL_DOCS: LegalDoc[] = [
  {
    id: 'ld-1',
    title: 'Delaware C-Corp Certificate of Incorporation',
    type: 'filing',
    status: 'active',
    effectiveDate: '2024-09-12',
    entity: 'Valuetainment Media LLC',
  },
  {
    id: 'ld-2',
    title: 'Valuetainment Partnership & Licensing Agreement',
    type: 'agreement',
    status: 'active',
    effectiveDate: '2025-06-01',
    expiryDate: '2027-05-31',
    entity: 'Valuetainment Media LLC',
    counterparty: 'Carroll College',
  },
  {
    id: 'ld-3',
    title: 'SAFE Note — Pre-Seed Round',
    type: 'contract',
    status: 'active',
    effectiveDate: '2025-03-20',
    entity: 'Valuetainment Media LLC',
    counterparty: 'Patrick Bet-David (Valuetainment)',
  },
  {
    id: 'ld-4',
    title: 'Valuetainment Trademark Application (USPTO)',
    type: 'registration',
    status: 'pending',
    effectiveDate: '2025-11-14',
    entity: 'Valuetainment Media LLC',
  },
  {
    id: 'ld-5',
    title: 'Advisor Agreement — Tom Ellsworth',
    type: 'agreement',
    status: 'active',
    effectiveDate: '2025-04-01',
    expiryDate: '2027-03-31',
    entity: 'Valuetainment Media LLC',
    counterparty: 'Tom Ellsworth',
  },
  {
    id: 'ld-6',
    title: 'EIN Registration Certificate (IRS)',
    type: 'certificate',
    status: 'active',
    effectiveDate: '2024-09-15',
    entity: 'Valuetainment Media LLC',
  },
];

// =============================================================================
// POLICIES
// =============================================================================

export interface PolicyItem {
  id: string;
  title: string;
  category: string;
  version: string;
  status: 'active' | 'draft' | 'under_review' | 'archived';
  lastReviewed: string;
  owner: string;
}

export const POLICIES: PolicyItem[] = [
  {
    id: 'pol-1',
    title: 'Data Privacy & User Consent Policy',
    category: 'Privacy',
    version: '2.1',
    status: 'active',
    lastReviewed: '2026-01-10',
    owner: 'Alex Morgan',
  },
  {
    id: 'pol-2',
    title: 'KYC/AML Compliance Policy',
    category: 'Financial',
    version: '1.3',
    status: 'active',
    lastReviewed: '2025-12-05',
    owner: 'David Okonkwo',
  },
  {
    id: 'pol-3',
    title: 'Acceptable Use & Content Moderation Policy',
    category: 'Platform',
    version: '1.0',
    status: 'under_review',
    lastReviewed: '2025-11-20',
    owner: 'Marcus Chen',
  },
  {
    id: 'pol-4',
    title: 'Investor Communication & Disclosure Policy',
    category: 'Governance',
    version: '1.1',
    status: 'active',
    lastReviewed: '2025-12-15',
    owner: 'Alex Morgan',
  },
  {
    id: 'pol-5',
    title: 'Incident Response & Breach Notification Policy',
    category: 'Security',
    version: '0.9',
    status: 'draft',
    lastReviewed: '2026-01-28',
    owner: 'Adriana Ruiz',
  },
];

// =============================================================================
// RISK REGISTER
// =============================================================================

export interface RiskRegisterItem {
  id: string;
  title: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  likelihood: 'high' | 'medium' | 'low';
  impact: string;
  mitigation: string;
  owner: string;
  status: 'open' | 'mitigated' | 'accepted' | 'transferred';
}

export const RISK_REGISTER: RiskRegisterItem[] = [
  {
    id: 'rr-1',
    title: 'Payment Rails KYC Incomplete',
    category: 'Financial',
    severity: 'critical',
    likelihood: 'high',
    impact: 'Cannot process payments; blocks revenue collection',
    mitigation: 'Escalate with Mercury; submit missing docs by Feb 21',
    owner: 'David Okonkwo',
    status: 'open',
  },
  {
    id: 'rr-2',
    title: 'Trademark Registration Delay',
    category: 'IP',
    severity: 'medium',
    likelihood: 'medium',
    impact: 'Potential brand confusion; limited enforcement options',
    mitigation: 'Filed supplemental evidence; monitoring TSDR portal',
    owner: 'Alex Morgan',
    status: 'open',
  },
  {
    id: 'rr-3',
    title: 'SAFE Note Conversion Triggers',
    category: 'Corporate',
    severity: 'high',
    likelihood: 'low',
    impact: 'Unplanned dilution if valuation cap hit before Series A',
    mitigation: 'Legal review with counsel; quarterly cap table audit',
    owner: 'Alex Morgan',
    status: 'mitigated',
  },
  {
    id: 'rr-4',
    title: 'Data Privacy Non-Compliance (CCPA)',
    category: 'Privacy',
    severity: 'high',
    likelihood: 'medium',
    impact: 'Regulatory fines; reputational damage with early users',
    mitigation: 'Privacy policy v2.1 deployed; consent flow audit scheduled',
    owner: 'Adriana Ruiz',
    status: 'open',
  },
  {
    id: 'rr-5',
    title: 'Valuetainment Agreement Renewal Risk',
    category: 'Partnership',
    severity: 'medium',
    likelihood: 'low',
    impact: 'Loss of flagship proof wedge and media value pipeline',
    mitigation: 'Quarterly check-in with Valuetainment AD; relationship health tracking',
    owner: 'Jordan Hayes',
    status: 'accepted',
  },
];

// =============================================================================
// CONTROLS
// =============================================================================

export interface ControlItem {
  id: string;
  title: string;
  type: 'preventive' | 'detective' | 'corrective';
  frequency: string;
  status: 'effective' | 'needs_improvement' | 'not_tested';
  lastTested: string;
  owner: string;
}

export const CONTROLS: ControlItem[] = [
  {
    id: 'ctrl-1',
    title: 'Cap Table Reconciliation',
    type: 'detective',
    frequency: 'Quarterly',
    status: 'effective',
    lastTested: '2026-01-02',
    owner: 'Alex Morgan',
  },
  {
    id: 'ctrl-2',
    title: 'KYC Document Verification',
    type: 'preventive',
    frequency: 'Per Transaction',
    status: 'needs_improvement',
    lastTested: '2025-12-18',
    owner: 'David Okonkwo',
  },
  {
    id: 'ctrl-3',
    title: 'Board Resolution Approval Workflow',
    type: 'preventive',
    frequency: 'Per Resolution',
    status: 'effective',
    lastTested: '2026-01-15',
    owner: 'Alex Morgan',
  },
  {
    id: 'ctrl-4',
    title: 'User Data Access Logging',
    type: 'detective',
    frequency: 'Continuous',
    status: 'effective',
    lastTested: '2026-02-01',
    owner: 'Adriana Ruiz',
  },
  {
    id: 'ctrl-5',
    title: 'Breach Notification Procedure',
    type: 'corrective',
    frequency: 'Per Incident',
    status: 'not_tested',
    lastTested: '2025-10-30',
    owner: 'Adriana Ruiz',
  },
];

// =============================================================================
// AUDITS
// =============================================================================

export interface AuditRecord {
  id: string;
  title: string;
  type: 'internal' | 'external' | 'self_assessment';
  date: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  findings: number;
  criticalFindings: number;
  auditor: string;
}

export const AUDIT_RECORDS: AuditRecord[] = [
  {
    id: 'aud-1',
    title: 'Q4 2025 Internal Compliance Review',
    type: 'internal',
    date: '2026-01-15',
    status: 'completed',
    findings: 5,
    criticalFindings: 1,
    auditor: 'Alex Morgan',
  },
  {
    id: 'aud-2',
    title: 'Delaware Franchise Tax Filing Audit',
    type: 'self_assessment',
    date: '2026-02-10',
    status: 'completed',
    findings: 0,
    criticalFindings: 0,
    auditor: 'David Okonkwo',
  },
  {
    id: 'aud-3',
    title: 'KYC/AML Process External Audit',
    type: 'external',
    date: '2026-03-15',
    status: 'scheduled',
    findings: 0,
    criticalFindings: 0,
    auditor: 'TBD (External Firm)',
  },
  {
    id: 'aud-4',
    title: 'Data Privacy Self-Assessment (CCPA)',
    type: 'self_assessment',
    date: '2026-02-05',
    status: 'in_progress',
    findings: 3,
    criticalFindings: 0,
    auditor: 'Adriana Ruiz',
  },
];

// =============================================================================
// INCIDENTS
// =============================================================================

export interface IncidentRecord {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  date: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  category: string;
  assignee: string;
}

export const INCIDENTS: IncidentRecord[] = [
  {
    id: 'inc-1',
    title: 'ACH Return — Invalid Account on Vendor Payout',
    severity: 'high',
    date: '2026-02-14',
    status: 'investigating',
    category: 'Payment Rails',
    assignee: 'David Okonkwo',
  },
  {
    id: 'inc-2',
    title: 'Unauthorized Data Room Access Attempt',
    severity: 'medium',
    date: '2026-02-10',
    status: 'resolved',
    category: 'Access Control',
    assignee: 'Adriana Ruiz',
  },
  {
    id: 'inc-3',
    title: 'Delayed Delaware Franchise Tax Filing',
    severity: 'low',
    date: '2026-01-28',
    status: 'closed',
    category: 'Tax & Filing',
    assignee: 'Alex Morgan',
  },
  {
    id: 'inc-4',
    title: 'SAFE Investor Disclosure Late Notification',
    severity: 'medium',
    date: '2026-02-08',
    status: 'open',
    category: 'Governance',
    assignee: 'Alex Morgan',
  },
];

// =============================================================================
// EXCEPTIONS
// =============================================================================

export interface ExceptionItem {
  id: string;
  title: string;
  type: string;
  requestedBy: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  validUntil: string;
  reason: string;
}

export const COMPLIANCE_EXCEPTIONS: ExceptionItem[] = [
  {
    id: 'exc-1',
    title: 'Temporary KYC Bypass for Valuetainment Pilot Payments',
    type: 'Payment Rails',
    requestedBy: 'Alex Morgan',
    approvedBy: 'Tom Ellsworth',
    status: 'approved',
    validUntil: '2026-03-31',
    reason: 'Valuetainment pilot requires immediate payment flow; full KYC to follow within 45 days',
  },
  {
    id: 'exc-2',
    title: 'Extended Trademark Filing Deadline',
    type: 'IP / Legal',
    requestedBy: 'Alex Morgan',
    status: 'pending',
    validUntil: '2026-04-15',
    reason: 'USPTO office action response requires additional evidence compilation',
  },
  {
    id: 'exc-3',
    title: 'Board Meeting Quorum Exception (Q1)',
    type: 'Governance',
    requestedBy: 'Alex Morgan',
    approvedBy: 'Patrick Bet-David',
    status: 'approved',
    validUntil: '2026-03-01',
    reason: 'PBD travel conflict; async approval via email for February board items',
  },
  {
    id: 'exc-4',
    title: 'Data Retention Override for Beta Analytics',
    type: 'Privacy',
    requestedBy: 'Adriana Ruiz',
    status: 'denied',
    validUntil: '2026-02-01',
    reason: 'Requested 180-day analytics retention; denied due to CCPA minimization principle',
  },
];

// =============================================================================
// EXPORTS
// =============================================================================

export interface ExportRecord {
  id: string;
  title: string;
  type: 'compliance_report' | 'audit_pack' | 'risk_matrix' | 'policy_bundle';
  generatedAt: string;
  format: 'PDF' | 'XLSX' | 'ZIP';
  size: string;
}

export const EXPORT_RECORDS: ExportRecord[] = [
  {
    id: 'exp-1',
    title: 'Q4 2025 Compliance Summary Report',
    type: 'compliance_report',
    generatedAt: '2026-01-20',
    format: 'PDF',
    size: '2.4 MB',
  },
  {
    id: 'exp-2',
    title: 'Internal Audit Pack — January 2026',
    type: 'audit_pack',
    generatedAt: '2026-01-18',
    format: 'ZIP',
    size: '14.7 MB',
  },
  {
    id: 'exp-3',
    title: 'Risk Register Matrix (Current)',
    type: 'risk_matrix',
    generatedAt: '2026-02-12',
    format: 'XLSX',
    size: '890 KB',
  },
  {
    id: 'exp-4',
    title: 'Active Policy Bundle — All Entities',
    type: 'policy_bundle',
    generatedAt: '2026-02-01',
    format: 'ZIP',
    size: '6.2 MB',
  },
];
