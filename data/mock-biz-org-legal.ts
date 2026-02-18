/**
 * Business Organization Legal Hub v2 — Mock Data & Types
 * Agreements, signature authorities, obligations, templates, requests.
 * Cross-linked to seeded entities for full organizational traceability.
 */

import {
  KANEXT_HOLDCO,
  KANEXT_OPSCO,
  KANEXT_IP,
  VALUETAINMENT,
  SLIEMA_WANDERERS,
  TARGET_BANK,
  SPONSOR_BANK,
  SEEDED_ENTITY_NAMES,
} from '@/data/biz-org-shared-types';

// =============================================================================
// TYPES
// =============================================================================

export type AgreementType =
  | 'nda'
  | 'msa'
  | 'sow'
  | 'license'
  | 'employment'
  | 'lease'
  | 'partnership'
  | 'loan';

export type AgreementStatus =
  | 'draft'
  | 'negotiation'
  | 'active'
  | 'expired'
  | 'terminated';

export interface LegalAgreement {
  id: string;
  title: string;
  type: AgreementType;
  status: AgreementStatus;
  counterparty: string;
  entityId: string;
  entityName: string;
  effectiveDate: string;
  expiryDate: string;
  value: string;
  summary: string;
}

export interface SignatureAuthority {
  id: string;
  personName: string;
  personTitle: string;
  entityName: string;
  maxAmount: string;
  types: string[];
  linkedPersonId: string;
}

export interface LegalObligation {
  id: string;
  description: string;
  agreementId: string;
  agreementTitle: string;
  dueDate: string;
  financialImpact: string | null;
  complianceImpact: string | null;
  status: 'pending' | 'met' | 'overdue' | 'waived';
  entityName: string;
}

export interface LegalTemplate {
  id: string;
  name: string;
  type: AgreementType;
  version: string;
  lastUpdated: string;
  description: string;
}

export interface LegalRequest {
  id: string;
  title: string;
  type: 'review' | 'draft' | 'negotiate' | 'opinion';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  requestedBy: string;
  assignee: string | null;
  status: 'open' | 'in_progress' | 'completed';
  createdDate: string;
  entityName: string;
}

export interface LegalOverviewStats {
  activeAgreements: number;
  pendingSignatures: number;
  upcomingObligations: number;
  openRequests: number;
}

// =============================================================================
// CONSTANTS — Labels & Colors
// =============================================================================

export const AGREEMENT_TYPE_LABEL: Record<AgreementType, string> = {
  nda: 'NDA',
  msa: 'MSA',
  sow: 'SOW',
  license: 'License',
  employment: 'Employment',
  lease: 'Lease',
  partnership: 'Partnership',
  loan: 'Loan',
};

export const AGREEMENT_TYPE_COLOR: Record<AgreementType, string> = {
  nda: '#8B5CF6',
  msa: '#3B82F6',
  sow: '#14B8A6',
  license: '#EC4899',
  employment: '#6366F1',
  lease: '#F59E0B',
  partnership: '#22C55E',
  loan: '#EF4444',
};

export const AGREEMENT_STATUS_COLOR: Record<AgreementStatus, string> = {
  draft: '#9CA3AF',
  negotiation: '#F59E0B',
  active: '#22C55E',
  expired: '#EF4444',
  terminated: '#DC2626',
};

export const OBLIGATION_STATUS_COLOR: Record<LegalObligation['status'], string> = {
  pending: '#F59E0B',
  met: '#22C55E',
  overdue: '#EF4444',
  waived: '#9CA3AF',
};

export const REQUEST_TYPE_LABEL: Record<LegalRequest['type'], string> = {
  review: 'Review',
  draft: 'Draft',
  negotiate: 'Negotiate',
  opinion: 'Opinion',
};

export const REQUEST_TYPE_COLOR: Record<LegalRequest['type'], string> = {
  review: '#3B82F6',
  draft: '#8B5CF6',
  negotiate: '#F59E0B',
  opinion: '#14B8A6',
};

export const REQUEST_PRIORITY_COLOR: Record<LegalRequest['priority'], string> = {
  urgent: '#EF4444',
  high: '#F59E0B',
  normal: '#3B82F6',
  low: '#9CA3AF',
};

export const REQUEST_STATUS_COLOR: Record<LegalRequest['status'], string> = {
  open: '#F59E0B',
  in_progress: '#3B82F6',
  completed: '#22C55E',
};

// =============================================================================
// SUB-TAB DEFINITIONS
// =============================================================================

export type LegalSubTabId =
  | 'overview'
  | 'agreements'
  | 'signatures'
  | 'obligations'
  | 'templates'
  | 'requests'
  | 'exports';

export interface LegalSubTab {
  id: LegalSubTabId;
  label: string;
}

export const LEGAL_SUB_TABS: LegalSubTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'agreements', label: 'Agreements' },
  { id: 'signatures', label: 'Signatures' },
  { id: 'obligations', label: 'Obligations' },
  { id: 'templates', label: 'Templates' },
  { id: 'requests', label: 'Requests' },
  { id: 'exports', label: 'Exports' },
];

// =============================================================================
// FILTER CHIP DEFINITIONS (for Agreements tab)
// =============================================================================

export const AGREEMENT_TYPE_CHIPS: { id: AgreementType | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'nda', label: 'NDA' },
  { id: 'msa', label: 'MSA' },
  { id: 'sow', label: 'SOW' },
  { id: 'license', label: 'License' },
  { id: 'employment', label: 'Employment' },
  { id: 'lease', label: 'Lease' },
];

// =============================================================================
// MOCK DATA — Agreements (~10)
// =============================================================================

const AGREEMENTS: LegalAgreement[] = [
  {
    id: 'agr-001',
    title: 'Mutual Non-Disclosure Agreement — Valuetainment',
    type: 'nda',
    status: 'active',
    counterparty: 'Valuetainment LLC',
    entityId: VALUETAINMENT,
    entityName: SEEDED_ENTITY_NAMES[VALUETAINMENT],
    effectiveDate: '2025-08-01',
    expiryDate: '2028-08-01',
    value: '$0',
    summary: 'Mutual NDA covering content strategy, revenue data, audience analytics, and partnership terms shared between KaNeXT and Valuetainment for co-branded media initiatives.',
  },
  {
    id: 'agr-002',
    title: 'Master Services Agreement — Sliema Wanderers FC',
    type: 'msa',
    status: 'active',
    counterparty: 'Sliema Wanderers FC',
    entityId: SLIEMA_WANDERERS,
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
    effectiveDate: '2025-06-15',
    expiryDate: '2028-06-15',
    value: '$480,000',
    summary: 'Master services agreement governing analytics platform deployment, scouting tools, and performance data integration for Sliema Wanderers FC across all departments.',
  },
  {
    id: 'agr-003',
    title: 'Statement of Work — KaNeXT OS Platform Build',
    type: 'sow',
    status: 'active',
    counterparty: 'KaNeXT OpsCo (Internal)',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    effectiveDate: '2025-01-15',
    expiryDate: '2026-06-30',
    value: '$2,400,000',
    summary: 'Internal SOW defining deliverables, milestones, and budget allocation for the KaNeXT OS platform build across mobile, web, and API layers. Phase 2 scope with 18-month timeline.',
  },
  {
    id: 'agr-004',
    title: 'IP License Agreement — KaNeXT Products',
    type: 'license',
    status: 'active',
    counterparty: 'KaNeXT HoldCo',
    entityId: KANEXT_IP,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    effectiveDate: '2024-09-01',
    expiryDate: '2029-09-01',
    value: '$1,200,000',
    summary: 'Exclusive license from KaNeXT IP entity to OpsCo for use of all patented algorithms, trademarks, copyrights, and trade secrets in commercial product offerings.',
  },
  {
    id: 'agr-005',
    title: 'Employment Agreement Template — Executive Level',
    type: 'employment',
    status: 'active',
    counterparty: 'Various (Template)',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    effectiveDate: '2025-01-01',
    expiryDate: '2027-12-31',
    value: '$250,000+/yr',
    summary: 'Standard executive employment agreement template covering base compensation, equity vesting schedule, non-compete clauses, IP assignment provisions, and severance terms.',
  },
  {
    id: 'agr-006',
    title: 'Office Lease — 100 Tech Blvd, 5th Floor',
    type: 'lease',
    status: 'active',
    counterparty: 'Meridian Properties LLC',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    effectiveDate: '2024-01-01',
    expiryDate: '2028-12-31',
    value: '$18,500/mo',
    summary: 'Five-year commercial office lease for primary headquarters. Includes 12,000 sq ft of Class A office space with shared amenities, parking, and infrastructure.',
  },
  {
    id: 'agr-007',
    title: 'Partnership Agreement — Sponsor Bank',
    type: 'partnership',
    status: 'active',
    counterparty: 'Sponsor Bank, N.A.',
    entityId: SPONSOR_BANK,
    entityName: SEEDED_ENTITY_NAMES[SPONSOR_BANK],
    effectiveDate: '2024-11-01',
    expiryDate: '2027-11-01',
    value: '$500,000',
    summary: 'Banking partnership agreement establishing KaNeXT as a fintech partner for payment processing, ledger management, and embedded banking services via Sponsor Bank infrastructure.',
  },
  {
    id: 'agr-008',
    title: 'Term Loan Agreement — Target Bank Acquisition',
    type: 'loan',
    status: 'negotiation',
    counterparty: 'Target Bank (Acquisition)',
    entityId: TARGET_BANK,
    entityName: SEEDED_ENTITY_NAMES[TARGET_BANK],
    effectiveDate: '2026-04-01',
    expiryDate: '2031-04-01',
    value: '$15,000,000',
    summary: 'Senior secured term loan facility for the acquisition of Target Bank. 5-year term with quarterly amortization and SOFR+325bps interest rate. Subject to OCC charter approval.',
  },
  {
    id: 'agr-009',
    title: 'NDA — Target Bank Due Diligence',
    type: 'nda',
    status: 'active',
    counterparty: 'Target Bank (Acquisition)',
    entityId: TARGET_BANK,
    entityName: SEEDED_ENTITY_NAMES[TARGET_BANK],
    effectiveDate: '2025-12-15',
    expiryDate: '2027-12-15',
    value: '$0',
    summary: 'One-way NDA protecting Target Bank confidential information during due diligence phase. Covers financial records, customer data, regulatory correspondence, and technology systems.',
  },
  {
    id: 'agr-010',
    title: 'Revenue Share Agreement — Valuetainment Content',
    type: 'partnership',
    status: 'active',
    counterparty: 'Valuetainment LLC',
    entityId: VALUETAINMENT,
    entityName: SEEDED_ENTITY_NAMES[VALUETAINMENT],
    effectiveDate: '2025-08-01',
    expiryDate: '2027-07-31',
    value: '$600,000/yr',
    summary: 'Content co-production and revenue sharing agreement. 70/30 split favoring KaNeXT for platform-originated content, 60/40 for co-branded productions. Quarterly reconciliation.',
  },
];

// =============================================================================
// MOCK DATA — Signature Authorities (~5)
// =============================================================================

const SIGNATURE_AUTHORITIES: SignatureAuthority[] = [
  {
    id: 'sig-001',
    personName: 'Sammy Kalejaiye',
    personTitle: 'CEO / Founder',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    maxAmount: 'Unlimited',
    types: ['All Agreement Types'],
    linkedPersonId: 'ppl-sammy-k',
  },
  {
    id: 'sig-002',
    personName: 'Marcus Chen',
    personTitle: 'CFO',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    maxAmount: '$500,000',
    types: ['MSA', 'SOW', 'Lease', 'Loan', 'Partnership'],
    linkedPersonId: 'ppl-marcus-c',
  },
  {
    id: 'sig-003',
    personName: 'David Park',
    personTitle: 'General Counsel',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    maxAmount: '$250,000',
    types: ['NDA', 'MSA', 'SOW', 'Employment', 'License'],
    linkedPersonId: 'ppl-david-p',
  },
  {
    id: 'sig-004',
    personName: 'Aisha Okonkwo',
    personTitle: 'VP of Operations',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    maxAmount: '$100,000',
    types: ['SOW', 'Lease', 'NDA'],
    linkedPersonId: 'ppl-aisha-o',
  },
  {
    id: 'sig-005',
    personName: 'Rachel Kim',
    personTitle: 'Associate General Counsel',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    maxAmount: '$50,000',
    types: ['NDA', 'Employment'],
    linkedPersonId: 'ppl-rachel-k',
  },
];

// =============================================================================
// MOCK DATA — Obligations (~8)
// =============================================================================

const OBLIGATIONS: LegalObligation[] = [
  {
    id: 'obl-001',
    description: 'Deliver Q1 2026 revenue share reconciliation report to Valuetainment',
    agreementId: 'agr-010',
    agreementTitle: 'Revenue Share Agreement — Valuetainment Content',
    dueDate: '2026-04-15',
    financialImpact: '$142,000',
    complianceImpact: null,
    status: 'pending',
    entityName: SEEDED_ENTITY_NAMES[VALUETAINMENT],
  },
  {
    id: 'obl-002',
    description: 'Submit annual Malta FA licensing documents for Sliema Wanderers',
    agreementId: 'agr-002',
    agreementTitle: 'Master Services Agreement — Sliema Wanderers FC',
    dueDate: '2026-01-31',
    financialImpact: null,
    complianceImpact: 'Club license suspension risk if not filed',
    status: 'overdue',
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
  },
  {
    id: 'obl-003',
    description: 'Complete OCC charter application supporting documentation',
    agreementId: 'agr-008',
    agreementTitle: 'Term Loan Agreement — Target Bank Acquisition',
    dueDate: '2026-03-15',
    financialImpact: '$15,000,000',
    complianceImpact: 'Charter application delayed if incomplete',
    status: 'pending',
    entityName: SEEDED_ENTITY_NAMES[TARGET_BANK],
  },
  {
    id: 'obl-004',
    description: 'Renew IP license assignments for 2 new Q1 contractors',
    agreementId: 'agr-004',
    agreementTitle: 'IP License Agreement — KaNeXT Products',
    dueDate: '2026-02-28',
    financialImpact: null,
    complianceImpact: 'IP ownership gap if not executed',
    status: 'overdue',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
  },
  {
    id: 'obl-005',
    description: 'Annual Sponsor Bank partner compliance review documentation',
    agreementId: 'agr-007',
    agreementTitle: 'Partnership Agreement — Sponsor Bank',
    dueDate: '2026-12-01',
    financialImpact: null,
    complianceImpact: 'Partnership agreement breach risk',
    status: 'pending',
    entityName: SEEDED_ENTITY_NAMES[SPONSOR_BANK],
  },
  {
    id: 'obl-006',
    description: 'Execute updated executive employment agreements (annual refresh)',
    agreementId: 'agr-005',
    agreementTitle: 'Employment Agreement Template — Executive Level',
    dueDate: '2026-03-01',
    financialImpact: '$1,200,000',
    complianceImpact: null,
    status: 'pending',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
  },
  {
    id: 'obl-007',
    description: 'Deliver Phase 2 milestone 3 deliverables per SOW schedule',
    agreementId: 'agr-003',
    agreementTitle: 'Statement of Work — KaNeXT OS Platform Build',
    dueDate: '2026-02-15',
    financialImpact: '$400,000',
    complianceImpact: null,
    status: 'met',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
  },
  {
    id: 'obl-008',
    description: 'Office lease CAM reconciliation payment due',
    agreementId: 'agr-006',
    agreementTitle: 'Office Lease — 100 Tech Blvd, 5th Floor',
    dueDate: '2026-01-15',
    financialImpact: '$12,400',
    complianceImpact: null,
    status: 'met',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
  },
];

// =============================================================================
// MOCK DATA — Templates (~6)
// =============================================================================

const TEMPLATES: LegalTemplate[] = [
  {
    id: 'tpl-001',
    name: 'Standard Mutual NDA',
    type: 'nda',
    version: '3.1',
    lastUpdated: '2026-01-10',
    description: 'Mutual non-disclosure agreement for business discussions, partnerships, and due diligence. Includes 3-year confidentiality period and standard carve-outs.',
  },
  {
    id: 'tpl-002',
    name: 'Master Services Agreement',
    type: 'msa',
    version: '2.4',
    lastUpdated: '2025-11-20',
    description: 'Master framework agreement for ongoing service engagements. Covers liability caps, IP ownership, data protection, and dispute resolution mechanisms.',
  },
  {
    id: 'tpl-003',
    name: 'Statement of Work Template',
    type: 'sow',
    version: '2.0',
    lastUpdated: '2025-12-05',
    description: 'Project-specific SOW template for scoping deliverables, timelines, acceptance criteria, and payment milestones under an existing MSA.',
  },
  {
    id: 'tpl-004',
    name: 'Executive Employment Agreement',
    type: 'employment',
    version: '4.2',
    lastUpdated: '2026-01-25',
    description: 'C-suite and VP-level employment agreement template. Includes equity vesting, non-compete, non-solicitation, IP assignment, and severance provisions.',
  },
  {
    id: 'tpl-005',
    name: 'Software License Agreement',
    type: 'license',
    version: '1.8',
    lastUpdated: '2025-10-15',
    description: 'Standard SaaS/platform license agreement for enterprise clients. Covers usage limits, SLA commitments, data handling, and renewal terms.',
  },
  {
    id: 'tpl-006',
    name: 'Strategic Partnership Agreement',
    type: 'partnership',
    version: '1.5',
    lastUpdated: '2025-09-30',
    description: 'Framework for strategic partnerships including revenue sharing, co-marketing, joint development, and governance structures.',
  },
];

// =============================================================================
// MOCK DATA — Requests (~5)
// =============================================================================

const REQUESTS: LegalRequest[] = [
  {
    id: 'req-001',
    title: 'Review Target Bank acquisition term sheet amendments',
    type: 'review',
    priority: 'urgent',
    requestedBy: 'Sammy Kalejaiye',
    assignee: 'David Park',
    status: 'in_progress',
    createdDate: '2026-02-14',
    entityName: SEEDED_ENTITY_NAMES[TARGET_BANK],
  },
  {
    id: 'req-002',
    title: 'Draft updated IP assignment agreement for Q1 contractors',
    type: 'draft',
    priority: 'high',
    requestedBy: 'Rachel Kim',
    assignee: 'David Park',
    status: 'in_progress',
    createdDate: '2026-02-10',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
  },
  {
    id: 'req-003',
    title: 'Negotiate Sliema Wanderers FC stadium lease extension',
    type: 'negotiate',
    priority: 'normal',
    requestedBy: 'Tom Bradley',
    assignee: null,
    status: 'open',
    createdDate: '2026-02-08',
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
  },
  {
    id: 'req-004',
    title: 'Legal opinion on SEC token offering regulatory exposure',
    type: 'opinion',
    priority: 'urgent',
    requestedBy: 'Marcus Chen',
    assignee: 'David Park',
    status: 'open',
    createdDate: '2026-02-05',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
  {
    id: 'req-005',
    title: 'Review Valuetainment content co-production addendum',
    type: 'review',
    priority: 'normal',
    requestedBy: 'Jordan Blake',
    assignee: null,
    status: 'open',
    createdDate: '2026-02-01',
    entityName: SEEDED_ENTITY_NAMES[VALUETAINMENT],
  },
];

// =============================================================================
// RECENT ACTIVITY (for Overview tab)
// =============================================================================

export interface LegalActivityEvent {
  id: string;
  text: string;
  time: string;
}

const RECENT_ACTIVITY: LegalActivityEvent[] = [
  { id: 'la-01', text: 'Target Bank acquisition term sheet received for legal review', time: '2 hours ago' },
  { id: 'la-02', text: 'IP assignment agreement v3.1 sent to Q1 contractors for signature', time: '4 hours ago' },
  { id: 'la-03', text: 'Valuetainment revenue share reconciliation approved by CFO', time: '1 day ago' },
  { id: 'la-04', text: 'Sliema Wanderers Malta FA compliance docs flagged as overdue', time: '2 days ago' },
  { id: 'la-05', text: 'Phase 2 milestone 3 deliverables accepted under KaNeXT OS SOW', time: '3 days ago' },
  { id: 'la-06', text: 'Executive employment agreement template updated to v4.2', time: '5 days ago' },
];

// =============================================================================
// UPCOMING DEADLINES (for Overview tab)
// =============================================================================

export interface LegalDeadline {
  id: string;
  label: string;
  dueDate: string;
  daysRemaining: number;
  urgency: 'overdue' | 'critical' | 'soon' | 'normal';
}

const UPCOMING_DEADLINES: LegalDeadline[] = [
  { id: 'dl-01', label: 'Malta FA licensing docs — Sliema Wanderers', dueDate: '2026-01-31', daysRemaining: -17, urgency: 'overdue' },
  { id: 'dl-02', label: 'IP license assignments — Q1 contractors', dueDate: '2026-02-28', daysRemaining: 11, urgency: 'critical' },
  { id: 'dl-03', label: 'Executive employment agreements refresh', dueDate: '2026-03-01', daysRemaining: 12, urgency: 'critical' },
  { id: 'dl-04', label: 'OCC charter application docs — Target Bank', dueDate: '2026-03-15', daysRemaining: 26, urgency: 'soon' },
  { id: 'dl-05', label: 'Q1 revenue share reconciliation — Valuetainment', dueDate: '2026-04-15', daysRemaining: 57, urgency: 'normal' },
  { id: 'dl-06', label: 'Sponsor Bank annual compliance review', dueDate: '2026-12-01', daysRemaining: 287, urgency: 'normal' },
];

// =============================================================================
// EXPORT OPTIONS (for Exports tab)
// =============================================================================

export interface LegalExportOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  format: string;
}

const EXPORT_OPTIONS: LegalExportOption[] = [
  { id: 'exp-001', label: 'Export All Agreements', description: 'Full list of active and inactive agreements with terms, counterparties, and values.', icon: 'doc.text.fill', format: 'CSV / XLSX' },
  { id: 'exp-002', label: 'Export Obligations Report', description: 'Outstanding legal obligations with due dates, financial impacts, and compliance risks.', icon: 'exclamationmark.triangle.fill', format: 'PDF' },
  { id: 'exp-003', label: 'Export Signature Authority Matrix', description: 'Current signature authority assignments, limits, and agreement type permissions.', icon: 'person.crop.rectangle.fill', format: 'PDF' },
  { id: 'exp-004', label: 'Export Template Library', description: 'Download all legal templates in their latest versions for offline use.', icon: 'doc.on.doc.fill', format: 'DOCX / PDF' },
  { id: 'exp-005', label: 'Export Request Queue', description: 'Current open and in-progress legal requests with priority and assignment details.', icon: 'tray.full.fill', format: 'CSV' },
  { id: 'exp-006', label: 'Legal Department Summary', description: 'Comprehensive quarterly legal department report with all metrics and KPIs.', icon: 'chart.bar.doc.horizontal.fill', format: 'PDF' },
];

// =============================================================================
// MAIN DATA ACCESSOR
// =============================================================================

export interface BizLegalData {
  overviewStats: LegalOverviewStats;
  agreements: LegalAgreement[];
  signatureAuthorities: SignatureAuthority[];
  obligations: LegalObligation[];
  templates: LegalTemplate[];
  requests: LegalRequest[];
  recentActivity: LegalActivityEvent[];
  upcomingDeadlines: LegalDeadline[];
  exportOptions: LegalExportOption[];
}

export function getBizLegalData(): BizLegalData {
  const activeAgreements = AGREEMENTS.filter((a) => a.status === 'active').length;
  const pendingSignatures = AGREEMENTS.filter((a) => a.status === 'negotiation' || a.status === 'draft').length;
  const upcomingObligations = OBLIGATIONS.filter((o) => o.status === 'pending' || o.status === 'overdue').length;
  const openRequests = REQUESTS.filter((r) => r.status === 'open' || r.status === 'in_progress').length;

  return {
    overviewStats: {
      activeAgreements,
      pendingSignatures,
      upcomingObligations,
      openRequests,
    },
    agreements: AGREEMENTS,
    signatureAuthorities: SIGNATURE_AUTHORITIES,
    obligations: OBLIGATIONS,
    templates: TEMPLATES,
    requests: REQUESTS,
    recentActivity: RECENT_ACTIVITY,
    upcomingDeadlines: UPCOMING_DEADLINES,
    exportOptions: EXPORT_OPTIONS,
  };
}
