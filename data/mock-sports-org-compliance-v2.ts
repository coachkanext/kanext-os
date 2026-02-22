/**
 * Sports Organization Compliance V2 — Mock Data & Types
 * KaNeXT Men's Basketball program compliance: eligibility, travel docs,
 * payments, training certifications, data privacy, holds, deadlines,
 * evidence tracking, and exception management.
 */

// =============================================================================
// TYPES
// =============================================================================

export type ControlCategory =
  | 'eligibility'
  | 'travel-docs'
  | 'payments'
  | 'training'
  | 'data-privacy';

export type ControlStatus = 'ok' | 'at-risk' | 'overdue';

export type HoldType =
  | 'eligibility'
  | 'document'
  | 'training'
  | 'payment'
  | 'travel';

export type HoldSeverity = 'critical' | 'high' | 'medium' | 'low';

export type DeadlineAudience = 'staff' | 'players' | 'all';

export type DeadlineType = 'training' | 'document' | 'attestation';

export type EvidenceType = 'document' | 'certificate' | 'photo' | 'signed-form';

export type EvidenceStatus = 'accepted' | 'needs-review' | 'missing' | 'stale';

export type ExceptionStatus = 'pending' | 'approved' | 'denied';

// =============================================================================
// SUB-TAB DEFINITION
// =============================================================================

export type ComplianceSubTabId =
  | 'overview'
  | 'controls'
  | 'holds'
  | 'deadlines'
  | 'evidence'
  | 'exceptions';

export interface ComplianceSubTab {
  id: ComplianceSubTabId;
  label: string;
}

export const COMPLIANCE_SUB_TABS: ComplianceSubTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'controls', label: 'Controls' },
  { id: 'holds', label: 'Holds' },
  { id: 'deadlines', label: 'Deadlines' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'exceptions', label: 'Exceptions' },
];

// =============================================================================
// INTERFACES
// =============================================================================

export interface ComplianceControl {
  id: string;
  title: string;
  category: ControlCategory;
  status: ControlStatus;
  owner: string;
  nextDueDate: string;
  lastChecked: string;
  data_source?: string;
}

export interface ComplianceHold {
  id: string;
  type: HoldType;
  impactedPerson: string;
  impactType: string;
  severity: HoldSeverity;
  owner: string;
  nextStep: string;
  dueDate: string;
  escalated: boolean;
  data_source?: string;
}

export interface ComplianceDeadline {
  id: string;
  title: string;
  audience: DeadlineAudience;
  dueDate: string;
  completionRate: number;
  totalRequired: number;
  completedCount: number;
  type: DeadlineType;
  data_source?: string;
}

export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  linkedControl: string;
  owner: string;
  timestamp: string;
  status: EvidenceStatus;
  data_source?: string;
}

export interface ComplianceException {
  id: string;
  title: string;
  reason: string;
  requestedBy: string;
  requiredApprovers: string[];
  status: ExceptionStatus;
  requestDate: string;
  data_source?: string;
}

export interface ComplianceOverview {
  ok: number;
  atRisk: number;
  overdue: number;
  holds: number;
  upcoming: number;
}

// =============================================================================
// LABELS & COLORS
// =============================================================================

export const CONTROL_CATEGORY_LABEL: Record<ControlCategory, string> = {
  eligibility: 'Eligibility',
  'travel-docs': 'Travel Docs',
  payments: 'Payments',
  training: 'Training',
  'data-privacy': 'Data Privacy',
};

export const CONTROL_CATEGORY_COLOR: Record<ControlCategory, string> = {
  eligibility: '#3b82f6',
  'travel-docs': '#8b5cf6',
  payments: '#f59e0b',
  training: '#22c55e',
  'data-privacy': '#ef4444',
};

export const CONTROL_STATUS_LABEL: Record<ControlStatus, string> = {
  ok: 'OK',
  'at-risk': 'At Risk',
  overdue: 'Overdue',
};

export const CONTROL_STATUS_COLOR: Record<ControlStatus, string> = {
  ok: '#22c55e',
  'at-risk': '#f59e0b',
  overdue: '#ef4444',
};

export const HOLD_TYPE_LABEL: Record<HoldType, string> = {
  eligibility: 'Eligibility',
  document: 'Document',
  training: 'Training',
  payment: 'Payment',
  travel: 'Travel',
};

export const HOLD_TYPE_COLOR: Record<HoldType, string> = {
  eligibility: '#ef4444',
  document: '#f59e0b',
  training: '#3b82f6',
  payment: '#8b5cf6',
  travel: '#6b7280',
};

export const HOLD_SEVERITY_LABEL: Record<HoldSeverity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const HOLD_SEVERITY_COLOR: Record<HoldSeverity, string> = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#6b7280',
};

export const DEADLINE_AUDIENCE_LABEL: Record<DeadlineAudience, string> = {
  staff: 'Staff',
  players: 'Players',
  all: 'All',
};

export const DEADLINE_AUDIENCE_COLOR: Record<DeadlineAudience, string> = {
  staff: '#8b5cf6',
  players: '#3b82f6',
  all: '#22c55e',
};

export const DEADLINE_TYPE_LABEL: Record<DeadlineType, string> = {
  training: 'Training',
  document: 'Document',
  attestation: 'Attestation',
};

export const DEADLINE_TYPE_COLOR: Record<DeadlineType, string> = {
  training: '#3b82f6',
  document: '#f59e0b',
  attestation: '#8b5cf6',
};

export const EVIDENCE_TYPE_LABEL: Record<EvidenceType, string> = {
  document: 'Document',
  certificate: 'Certificate',
  photo: 'Photo',
  'signed-form': 'Signed Form',
};

export const EVIDENCE_TYPE_COLOR: Record<EvidenceType, string> = {
  document: '#3b82f6',
  certificate: '#22c55e',
  photo: '#8b5cf6',
  'signed-form': '#f59e0b',
};

export const EVIDENCE_STATUS_LABEL: Record<EvidenceStatus, string> = {
  accepted: 'Accepted',
  'needs-review': 'Needs Review',
  missing: 'Missing',
  stale: 'Stale',
};

export const EVIDENCE_STATUS_COLOR: Record<EvidenceStatus, string> = {
  accepted: '#22c55e',
  'needs-review': '#f59e0b',
  missing: '#ef4444',
  stale: '#6b7280',
};

export const EXCEPTION_STATUS_LABEL: Record<ExceptionStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  denied: 'Denied',
};

export const EXCEPTION_STATUS_COLOR: Record<ExceptionStatus, string> = {
  pending: '#f59e0b',
  approved: '#22c55e',
  denied: '#ef4444',
};

// =============================================================================
// MOCK DATA — CONTROLS (8)
// =============================================================================

const controls: ComplianceControl[] = [
  {
    id: 'ctrl-001',
    title: 'NAIA Eligibility Verification — All Rostered Players',
    category: 'eligibility',
    status: 'at-risk',
    owner: 'Lisa Chen',
    nextDueDate: '2026-02-25',
    lastChecked: '2026-02-10',
    data_source: 'demo_seed',
  },
  {
    id: 'ctrl-002',
    title: 'Travel Documentation & Waiver Collection',
    category: 'travel-docs',
    status: 'at-risk',
    owner: 'Tyler Brooks',
    nextDueDate: '2026-02-20',
    lastChecked: '2026-02-12',
    data_source: 'demo_seed',
  },
  {
    id: 'ctrl-003',
    title: 'Payment Approvals — Scholarship & Travel Disbursements',
    category: 'payments',
    status: 'ok',
    owner: 'Alex Morgan',
    nextDueDate: '2026-03-15',
    lastChecked: '2026-02-01',
    data_source: 'demo_seed',
  },
  {
    id: 'ctrl-004',
    title: 'Training Attestations — CPR / First Aid / Concussion Protocol',
    category: 'training',
    status: 'ok',
    owner: 'Dr. Nicole Patterson',
    nextDueDate: '2026-04-01',
    lastChecked: '2026-01-28',
    data_source: 'demo_seed',
  },
  {
    id: 'ctrl-005',
    title: 'Transfer Portal Eligibility Clearance',
    category: 'eligibility',
    status: 'ok',
    owner: 'Lisa Chen',
    nextDueDate: '2026-03-01',
    lastChecked: '2026-02-15',
    data_source: 'demo_seed',
  },
  {
    id: 'ctrl-006',
    title: 'FERPA Student-Athlete Data Privacy Compliance',
    category: 'data-privacy',
    status: 'ok',
    owner: 'Alex Morgan',
    nextDueDate: '2026-06-01',
    lastChecked: '2026-01-10',
    data_source: 'demo_seed',
  },
  {
    id: 'ctrl-007',
    title: 'Recruiting Contact Log — Weekly Submission',
    category: 'eligibility',
    status: 'ok',
    owner: 'Coach Marcus Davis',
    nextDueDate: '2026-02-21',
    lastChecked: '2026-02-14',
    data_source: 'demo_seed',
  },
  {
    id: 'ctrl-008',
    title: 'Concussion Protocol Training — All Staff',
    category: 'training',
    status: 'ok',
    owner: 'Dr. Nicole Patterson',
    nextDueDate: '2026-04-01',
    lastChecked: '2026-01-28',
    data_source: 'demo_seed',
  },
];

// =============================================================================
// MOCK DATA — HOLDS (5)
// =============================================================================

const holds: ComplianceHold[] = [
  {
    id: 'hold-001',
    type: 'eligibility',
    impactedPerson: 'Brandon Lewis',
    impactType: 'Cannot play until transfer eligibility cleared — overdue transcript submission',
    severity: 'critical',
    owner: 'Lisa Chen',
    nextStep: 'Submit remaining transcripts to NAIA Eligibility Center',
    dueDate: '2026-02-20',
    escalated: true,
    data_source: 'demo_seed',
  },
  {
    id: 'hold-002',
    type: 'travel',
    impactedPerson: 'Joshua Laird',
    impactType: 'Missing travel waiver for Keiser away game — cannot board bus',
    severity: 'high',
    owner: 'Tyler Brooks',
    nextStep: 'Collect signed travel waiver from player before Feb 21',
    dueDate: '2026-02-21',
    escalated: false,
    data_source: 'demo_seed',
  },
  {
    id: 'hold-003',
    type: 'document',
    impactedPerson: 'Joshua Laird',
    impactType: 'Physical exam not on file — mid-year transfer onboarding incomplete',
    severity: 'high',
    owner: 'Dr. Nicole Patterson',
    nextStep: 'Physical scheduled Feb 21',
    dueDate: '2026-02-21',
    escalated: false,
    data_source: 'demo_seed',
  },
  {
    id: 'hold-004',
    type: 'payment',
    impactedPerson: 'Marcus Dues',
    impactType: 'Scholarship disbursement hold pending grade verification',
    severity: 'medium',
    owner: 'Alex Morgan',
    nextStep: 'Confirm mid-term grades with Registrar',
    dueDate: '2026-02-28',
    escalated: false,
    data_source: 'demo_seed',
  },
  {
    id: 'hold-005',
    type: 'training',
    impactedPerson: 'Coach Andre Williams',
    impactType: 'CPR certification expiring soon — renewal due',
    severity: 'low',
    owner: 'Dr. Nicole Patterson',
    nextStep: 'Schedule recertification course before March 1',
    dueDate: '2026-03-01',
    escalated: false,
    data_source: 'demo_seed',
  },
];

// =============================================================================
// MOCK DATA — DEADLINES (6)
// =============================================================================

const deadlines: ComplianceDeadline[] = [
  {
    id: 'dl-001',
    title: 'NAIA Compliance Filing — Spring Semester',
    audience: 'all',
    dueDate: '2026-03-01',
    completionRate: 72,
    totalRequired: 18,
    completedCount: 13,
    type: 'attestation',
    data_source: 'demo_seed',
  },
  {
    id: 'dl-002',
    title: 'Travel Waiver — Keiser Away Game',
    audience: 'players',
    dueDate: '2026-02-21',
    completionRate: 82,
    totalRequired: 17,
    completedCount: 14,
    type: 'document',
    data_source: 'demo_seed',
  },
  {
    id: 'dl-003',
    title: 'Concussion Protocol Training — Annual Renewal',
    audience: 'staff',
    dueDate: '2026-02-28',
    completionRate: 78,
    totalRequired: 9,
    completedCount: 7,
    type: 'training',
    data_source: 'demo_seed',
  },
  {
    id: 'dl-004',
    title: 'CPR / First Aid Recertification',
    audience: 'staff',
    dueDate: '2026-03-01',
    completionRate: 67,
    totalRequired: 9,
    completedCount: 6,
    type: 'training',
    data_source: 'demo_seed',
  },
  {
    id: 'dl-005',
    title: 'Medical Release Form — Season Update',
    audience: 'players',
    dueDate: '2026-03-10',
    completionRate: 88,
    totalRequired: 17,
    completedCount: 15,
    type: 'document',
    data_source: 'demo_seed',
  },
  {
    id: 'dl-006',
    title: 'Code of Conduct Re-Acknowledgment — Mid-Season',
    audience: 'all',
    dueDate: '2026-03-15',
    completionRate: 44,
    totalRequired: 26,
    completedCount: 11,
    type: 'attestation',
    data_source: 'demo_seed',
  },
];

// =============================================================================
// MOCK DATA — EVIDENCE (8)
// =============================================================================

const evidence: EvidenceItem[] = [
  {
    id: 'ev-001',
    type: 'document',
    linkedControl: 'ctrl-001',
    owner: 'Lisa Chen',
    timestamp: '2026-02-10',
    status: 'needs-review',
    data_source: 'demo_seed',
  },
  {
    id: 'ev-002',
    type: 'certificate',
    linkedControl: 'ctrl-004',
    owner: 'Dr. Nicole Patterson',
    timestamp: '2026-01-28',
    status: 'accepted',
    data_source: 'demo_seed',
  },
  {
    id: 'ev-003',
    type: 'signed-form',
    linkedControl: 'ctrl-002',
    owner: 'Tyler Brooks',
    timestamp: '2026-02-12',
    status: 'missing',
    data_source: 'demo_seed',
  },
  {
    id: 'ev-004',
    type: 'document',
    linkedControl: 'ctrl-003',
    owner: 'Alex Morgan',
    timestamp: '2026-02-01',
    status: 'accepted',
    data_source: 'demo_seed',
  },
  {
    id: 'ev-005',
    type: 'certificate',
    linkedControl: 'ctrl-008',
    owner: 'Dr. Nicole Patterson',
    timestamp: '2026-01-28',
    status: 'accepted',
    data_source: 'demo_seed',
  },
  {
    id: 'ev-006',
    type: 'document',
    linkedControl: 'ctrl-005',
    owner: 'Lisa Chen',
    timestamp: '2026-02-15',
    status: 'accepted',
    data_source: 'demo_seed',
  },
  {
    id: 'ev-007',
    type: 'signed-form',
    linkedControl: 'ctrl-006',
    owner: 'Alex Morgan',
    timestamp: '2026-01-10',
    status: 'accepted',
    data_source: 'demo_seed',
  },
  {
    id: 'ev-008',
    type: 'document',
    linkedControl: 'ctrl-007',
    owner: 'Coach Marcus Davis',
    timestamp: '2026-02-14',
    status: 'accepted',
    data_source: 'demo_seed',
  },
];

// =============================================================================
// MOCK DATA — EXCEPTIONS (3)
// =============================================================================

const exceptions: ComplianceException[] = [
  {
    id: 'exc-001',
    title: 'Temporary CPR Certification Extension — Coach Andre Williams',
    reason: 'Recertification class cancelled by vendor; rescheduled for March 1.',
    requestedBy: 'Dr. Nicole Patterson',
    requiredApprovers: ['Alex Morgan'],
    status: 'approved',
    requestDate: '2026-02-06',
    data_source: 'demo_seed',
  },
  {
    id: 'exc-002',
    title: 'Late Transcript Submission — Brandon Lewis (Transfer)',
    reason: 'Previous institution delayed official transcript release.',
    requestedBy: 'Lisa Chen',
    requiredApprovers: ['NAIA Eligibility Center', 'Alex Morgan'],
    status: 'pending',
    requestDate: '2026-02-12',
    data_source: 'demo_seed',
  },
  {
    id: 'exc-003',
    title: 'Travel Waiver Late Collection — Joshua Laird',
    reason: 'Mid-year transfer onboarding incomplete; physical exam scheduled Feb 21.',
    requestedBy: 'Tyler Brooks',
    requiredApprovers: ['Alex Morgan'],
    status: 'pending',
    requestDate: '2026-02-17',
    data_source: 'demo_seed',
  },
];

// =============================================================================
// GETTER
// =============================================================================

export function getComplianceOverview(): ComplianceOverview {
  const ok = controls.filter((c) => c.status === 'ok').length;
  const atRisk = controls.filter((c) => c.status === 'at-risk').length;
  const overdue = controls.filter((c) => c.status === 'overdue').length;
  const holdCount = holds.length;
  const upcoming = deadlines.filter((d) => {
    const due = new Date(d.dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    return diff > 0 && diff <= 14 * 86400000; // within 14 days
  }).length;

  return {
    ok,
    atRisk,
    overdue,
    holds: holdCount,
    upcoming,
  };
}

export function getComplianceControls(): ComplianceControl[] {
  return controls;
}

export function getComplianceHolds(): ComplianceHold[] {
  return holds;
}

export function getComplianceDeadlines(): ComplianceDeadline[] {
  return deadlines;
}

export function getComplianceEvidence(): EvidenceItem[] {
  return evidence;
}

export function getComplianceExceptions(): ComplianceException[] {
  return exceptions;
}
