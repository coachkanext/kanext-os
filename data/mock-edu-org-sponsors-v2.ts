/**
 * Education Organization Sponsors V2 — Mock Data & Types
 * Sponsors, pipeline, agreements, deliverables, proofs, payments, risks, contacts, reports.
 * HBCU-themed seed data. Education-unique (no church equivalent).
 */

// =============================================================================
// TYPES
// =============================================================================

export type SponsorType = 'sponsor' | 'partner' | 'donor' | 'vendor_partner';
export type SponsorScope = 'athletics' | 'admissions' | 'campus' | 'institution' | 'housing';
export type SponsorStatus = 'active' | 'negotiating' | 'ended' | 'paused';
export type PipelineStage = 'prospect' | 'contacted' | 'proposal_sent' | 'negotiating' | 'verbal' | 'contract_ready' | 'signed';
export type AgreementType = 'sponsorship' | 'partnership_mou' | 'donor_commitment' | 'in_kind' | 'media_rights';
export type AgreementStatus = 'draft' | 'in_review' | 'executed' | 'expiring' | 'archived';
export type DeliverableStatus = 'planned' | 'in_progress' | 'submitted' | 'verified' | 'completed';
export type ProofType = 'photo' | 'video' | 'pdf' | 'screenshot' | 'attendance_summary';
export type ProofStatus = 'draft' | 'submitted' | 'verified' | 'rejected';
export type PaymentExpectationStatus = 'expected' | 'invoiced' | 'received' | 'late' | 'disputed';
export type RiskCategory = 'brand' | 'student_safety' | 'contract_breach' | 'data_privacy' | 'exclusivity';
export type RiskStatus = 'open' | 'mitigating' | 'closed';

// =============================================================================
// INTERFACES
// =============================================================================

export interface SponsorKPIStrip {
  activeSponsors: number;
  pipelineValue: number;
  deliverablesDueSoon: number;
  atRiskAgreements: number;
  latePayments: number;
  proofCompleteness: number;
}

export interface Sponsor {
  id: string;
  name: string;
  type: SponsorType;
  scope: SponsorScope[];
  status: SponsorStatus;
  valueBand: string;
  nextDeliverable?: string;
  paymentStatus?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  contactCount: number;
  agreementCount: number;
}

export interface SponsorContact {
  id: string;
  sponsorId: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  tags: string[];
  lastTouch: string;
  nextTouch?: string;
}

export interface PipelineItem {
  id: string;
  sponsorName: string;
  type: SponsorType;
  stage: PipelineStage;
  expectedValue: number;
  owner: string;
  targetClose: string;
  nextStep: string;
  blockers?: string;
}

export interface SponsorAgreement {
  id: string;
  sponsorId: string;
  sponsorName: string;
  type: AgreementType;
  scope: SponsorScope;
  status: AgreementStatus;
  startDate: string;
  endDate: string;
  totalValue: number;
  deliverableCount: number;
  paymentSchedule: string;
  complianceReview: boolean;
  terms: AgreementTerm[];
}

export interface AgreementTerm {
  id: string;
  label: string;
  value: string;
}

export interface Deliverable {
  id: string;
  agreementId: string;
  sponsorName: string;
  title: string;
  scope: SponsorScope;
  dueDate: string;
  owner: string;
  status: DeliverableStatus;
  proofRequired: boolean;
  riskIfMissed: string;
}

export interface DeliverableProof {
  id: string;
  deliverableId: string;
  type: ProofType;
  status: ProofStatus;
  submittedBy: string;
  submittedDate: string;
  verifiedBy?: string;
  verifiedDate?: string;
  notes?: string;
}

export interface SponsorPayment {
  id: string;
  agreementId: string;
  sponsorName: string;
  amount: number;
  dueDate: string;
  status: PaymentExpectationStatus;
  owner: string;
  notes?: string;
}

export interface SponsorRisk {
  id: string;
  sponsorId: string;
  sponsorName: string;
  category: RiskCategory;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: RiskStatus;
  description: string;
  mitigationPlan: string;
}

export interface SponsorReport {
  id: string;
  name: string;
  description: string;
  type: string;
}

// =============================================================================
// CONSTANTS / LABELS — Sponsor Type
// =============================================================================

export const SPONSOR_TYPE_LABELS: Record<SponsorType, string> = {
  sponsor: 'Sponsor',
  partner: 'Partner',
  donor: 'Donor',
  vendor_partner: 'Vendor Partner',
};

export const SPONSOR_TYPE_COLORS: Record<SponsorType, string> = {
  sponsor: '#3B82F6',
  partner: '#A78BFA',
  donor: '#10B981',
  vendor_partner: '#F59E0B',
};

// =============================================================================
// CONSTANTS / LABELS — Sponsor Scope
// =============================================================================

export const SPONSOR_SCOPE_LABELS: Record<SponsorScope, string> = {
  athletics: 'Athletics',
  admissions: 'Admissions',
  campus: 'Campus',
  institution: 'Institution',
  housing: 'Housing',
};

export const SPONSOR_SCOPE_COLORS: Record<SponsorScope, string> = {
  athletics: '#EF4444',
  admissions: '#3B82F6',
  campus: '#A78BFA',
  institution: '#10B981',
  housing: '#F59E0B',
};

// =============================================================================
// CONSTANTS / LABELS — Sponsor Status
// =============================================================================

export const SPONSOR_STATUS_LABELS: Record<SponsorStatus, string> = {
  active: 'Active',
  negotiating: 'Negotiating',
  ended: 'Ended',
  paused: 'Paused',
};

export const SPONSOR_STATUS_COLORS: Record<SponsorStatus, string> = {
  active: '#22C55E',
  negotiating: '#F59E0B',
  ended: '#8F8F8F',
  paused: '#6AA9FF',
};

// =============================================================================
// CONSTANTS / LABELS — Pipeline Stage
// =============================================================================

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  prospect: 'Prospect',
  contacted: 'Contacted',
  proposal_sent: 'Proposal Sent',
  negotiating: 'Negotiating',
  verbal: 'Verbal',
  contract_ready: 'Contract Ready',
  signed: 'Signed',
};

export const PIPELINE_STAGE_COLORS: Record<PipelineStage, string> = {
  prospect: '#8F8F8F',
  contacted: '#6AA9FF',
  proposal_sent: '#3B82F6',
  negotiating: '#F59E0B',
  verbal: '#A78BFA',
  contract_ready: '#10B981',
  signed: '#22C55E',
};

// =============================================================================
// CONSTANTS / LABELS — Agreement Type & Status
// =============================================================================

export const AGREEMENT_TYPE_LABELS: Record<AgreementType, string> = {
  sponsorship: 'Sponsorship',
  partnership_mou: 'Partnership MOU',
  donor_commitment: 'Donor Commitment',
  in_kind: 'In-Kind',
  media_rights: 'Media Rights',
};

export const AGREEMENT_STATUS_LABELS: Record<AgreementStatus, string> = {
  draft: 'Draft',
  in_review: 'In Review',
  executed: 'Executed',
  expiring: 'Expiring',
  archived: 'Archived',
};

export const AGREEMENT_STATUS_COLORS: Record<AgreementStatus, string> = {
  draft: '#8F8F8F',
  in_review: '#F59E0B',
  executed: '#22C55E',
  expiring: '#EF4444',
  archived: '#A78BFA',
};

// =============================================================================
// CONSTANTS / LABELS — Deliverable Status
// =============================================================================

export const DELIVERABLE_STATUS_LABELS: Record<DeliverableStatus, string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  submitted: 'Submitted',
  verified: 'Verified',
  completed: 'Completed',
};

export const DELIVERABLE_STATUS_COLORS: Record<DeliverableStatus, string> = {
  planned: '#8F8F8F',
  in_progress: '#6AA9FF',
  submitted: '#F59E0B',
  verified: '#10B981',
  completed: '#22C55E',
};

// =============================================================================
// CONSTANTS / LABELS — Proof Type & Status
// =============================================================================

export const PROOF_TYPE_LABELS: Record<ProofType, string> = {
  photo: 'Photo',
  video: 'Video',
  pdf: 'PDF',
  screenshot: 'Screenshot',
  attendance_summary: 'Attendance Summary',
};

export const PROOF_STATUS_LABELS: Record<ProofStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  verified: 'Verified',
  rejected: 'Rejected',
};

export const PROOF_STATUS_COLORS: Record<ProofStatus, string> = {
  draft: '#8F8F8F',
  submitted: '#6AA9FF',
  verified: '#22C55E',
  rejected: '#EF4444',
};

// =============================================================================
// CONSTANTS / LABELS — Payment Expectation Status
// =============================================================================

export const PAYMENT_STATUS_LABELS: Record<PaymentExpectationStatus, string> = {
  expected: 'Expected',
  invoiced: 'Invoiced',
  received: 'Received',
  late: 'Late',
  disputed: 'Disputed',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentExpectationStatus, string> = {
  expected: '#8F8F8F',
  invoiced: '#6AA9FF',
  received: '#22C55E',
  late: '#EF4444',
  disputed: '#DC2626',
};

// =============================================================================
// CONSTANTS / LABELS — Risk Category & Status
// =============================================================================

export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
  brand: 'Brand',
  student_safety: 'Student Safety',
  contract_breach: 'Contract Breach',
  data_privacy: 'Data Privacy',
  exclusivity: 'Exclusivity',
};

export const RISK_STATUS_LABELS: Record<RiskStatus, string> = {
  open: 'Open',
  mitigating: 'Mitigating',
  closed: 'Closed',
};

export const RISK_STATUS_COLORS: Record<RiskStatus, string> = {
  open: '#EF4444',
  mitigating: '#F59E0B',
  closed: '#22C55E',
};

export const RISK_SEVERITY_COLORS: Record<'critical' | 'high' | 'medium' | 'low', string> = {
  critical: '#DC2626',
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#22C55E',
};

// =============================================================================
// SEEDED KPI STRIP
// =============================================================================

const KPI_STRIP: SponsorKPIStrip = {
  activeSponsors: 8,
  pipelineValue: 340000,
  deliverablesDueSoon: 6,
  atRiskAgreements: 2,
  latePayments: 1,
  proofCompleteness: 78,
};

// =============================================================================
// SEEDED PRIORITIES (This Month)
// =============================================================================

export interface SponsorPriority {
  id: string;
  title: string;
  description: string;
  urgency: 'critical' | 'high' | 'medium';
}

const PRIORITIES: SponsorPriority[] = [
  {
    id: 'pri-001',
    title: 'Nike halftime activation due',
    description: 'Homecoming halftime brand activation deliverable is due Feb 28. Proof of execution (video + photos) must be submitted within 5 business days.',
    urgency: 'critical',
  },
  {
    id: 'pri-002',
    title: 'First National renewal expiring',
    description: 'First National Credit Union campus banking MOU expires March 15. Renewal terms need to be finalized and signed before then.',
    urgency: 'high',
  },
  {
    id: 'pri-003',
    title: 'Under Armour proposal follow-up',
    description: 'Under Armour athletics proposal was sent two weeks ago. Schedule follow-up call to address questions and move toward verbal commitment.',
    urgency: 'high',
  },
  {
    id: 'pri-004',
    title: 'Sodexo Q1 payment outstanding',
    description: 'Sodexo dining partnership Q1 installment of $37,500 is past due. Finance office needs to follow up on invoice and reconcile.',
    urgency: 'critical',
  },
  {
    id: 'pri-005',
    title: 'TechForward compliance review',
    description: 'TechForward lab equipment in-kind agreement is in draft. Compliance review must be completed before equipment delivery in March.',
    urgency: 'medium',
  },
];

// =============================================================================
// SEEDED SPONSORS
// =============================================================================

const SPONSORS: Sponsor[] = [
  {
    id: 'spon-001',
    name: 'Nike',
    type: 'sponsor',
    scope: ['athletics'],
    status: 'active',
    valueBand: '$50K-100K',
    nextDeliverable: 'Halftime activation — Feb 28',
    paymentStatus: 'On track',
    riskLevel: 'medium',
    contactCount: 2,
    agreementCount: 1,
  },
  {
    id: 'spon-002',
    name: 'Under Armour',
    type: 'sponsor',
    scope: ['athletics'],
    status: 'negotiating',
    valueBand: '$25K-50K',
    nextDeliverable: undefined,
    paymentStatus: undefined,
    riskLevel: 'low',
    contactCount: 1,
    agreementCount: 0,
  },
  {
    id: 'spon-003',
    name: 'Sodexo',
    type: 'partner',
    scope: ['campus'],
    status: 'active',
    valueBand: '$100K+',
    nextDeliverable: 'Dining satisfaction survey — Mar 15',
    paymentStatus: 'Late',
    riskLevel: 'high',
    contactCount: 2,
    agreementCount: 1,
  },
  {
    id: 'spon-004',
    name: 'Coca-Cola',
    type: 'sponsor',
    scope: ['campus'],
    status: 'active',
    valueBand: '$25K-50K',
    nextDeliverable: 'Vending signage refresh — Mar 1',
    paymentStatus: 'On track',
    riskLevel: 'low',
    contactCount: 1,
    agreementCount: 1,
  },
  {
    id: 'spon-005',
    name: 'State Farm',
    type: 'donor',
    scope: ['institution'],
    status: 'active',
    valueBand: '$50K-100K',
    nextDeliverable: 'Scholarship recipient report — Apr 1',
    paymentStatus: 'On track',
    riskLevel: 'low',
    contactCount: 2,
    agreementCount: 1,
  },
  {
    id: 'spon-006',
    name: 'First National Credit Union',
    type: 'partner',
    scope: ['campus'],
    status: 'active',
    valueBand: '$10K-25K',
    nextDeliverable: 'Financial literacy workshop — Mar 10',
    paymentStatus: 'On track',
    riskLevel: 'medium',
    contactCount: 1,
    agreementCount: 1,
  },
  {
    id: 'spon-007',
    name: 'TechForward Inc',
    type: 'vendor_partner',
    scope: ['institution'],
    status: 'negotiating',
    valueBand: '$25K-50K',
    nextDeliverable: undefined,
    paymentStatus: undefined,
    riskLevel: 'low',
    contactCount: 2,
    agreementCount: 0,
  },
  {
    id: 'spon-008',
    name: 'Greater Miami Community Foundation',
    type: 'donor',
    scope: ['institution'],
    status: 'active',
    valueBand: '$50K-100K',
    nextDeliverable: 'Annual impact report — May 1',
    paymentStatus: 'On track',
    riskLevel: 'low',
    contactCount: 1,
    agreementCount: 1,
  },
];

// =============================================================================
// SEEDED PIPELINE
// =============================================================================

const PIPELINE: PipelineItem[] = [
  {
    id: 'pipe-001',
    sponsorName: 'Under Armour',
    type: 'sponsor',
    stage: 'proposal_sent',
    expectedValue: 40000,
    owner: 'Director of Athletics',
    targetClose: '2026-03-31',
    nextStep: 'Follow-up call to discuss term sheet',
    blockers: 'Awaiting budget approval from UA regional office',
  },
  {
    id: 'pipe-002',
    sponsorName: 'TechForward Inc',
    type: 'vendor_partner',
    stage: 'negotiating',
    expectedValue: 45000,
    owner: 'VP of Academic Affairs',
    targetClose: '2026-03-15',
    nextStep: 'Finalize in-kind valuation and compliance review',
  },
  {
    id: 'pipe-003',
    sponsorName: 'Delta Air Lines',
    type: 'sponsor',
    stage: 'prospect',
    expectedValue: 75000,
    owner: 'Director of Development',
    targetClose: '2026-06-30',
    nextStep: 'Initial outreach to regional partnerships team',
  },
  {
    id: 'pipe-004',
    sponsorName: 'Adidas',
    type: 'sponsor',
    stage: 'contacted',
    expectedValue: 55000,
    owner: 'Director of Athletics',
    targetClose: '2026-05-15',
    nextStep: 'Discovery call scheduled for March 5',
  },
  {
    id: 'pipe-005',
    sponsorName: 'Wells Fargo Foundation',
    type: 'donor',
    stage: 'verbal',
    expectedValue: 60000,
    owner: 'Director of Development',
    targetClose: '2026-03-01',
    nextStep: 'Draft donor commitment letter for review',
  },
  {
    id: 'pipe-006',
    sponsorName: 'Aramark',
    type: 'partner',
    stage: 'contract_ready',
    expectedValue: 65000,
    owner: 'VP of Student Affairs',
    targetClose: '2026-02-28',
    nextStep: 'Legal review of final contract; signatures needed',
  },
];

// =============================================================================
// SEEDED AGREEMENTS
// =============================================================================

const AGREEMENTS: SponsorAgreement[] = [
  {
    id: 'agr-001',
    sponsorId: 'spon-001',
    sponsorName: 'Nike',
    type: 'sponsorship',
    scope: 'athletics',
    status: 'executed',
    startDate: '2025-08-01',
    endDate: '2027-07-31',
    totalValue: 85000,
    deliverableCount: 4,
    paymentSchedule: 'Semi-annual ($42,500 x 2)',
    complianceReview: true,
    terms: [
      { id: 'term-001', label: 'Exclusivity', value: 'Exclusive athletics footwear and apparel sponsor for all varsity sports' },
      { id: 'term-002', label: 'Brand Placement', value: 'Logo on all game-day uniforms, sideline banners, and digital scoreboards' },
      { id: 'term-003', label: 'Activation Events', value: 'Minimum 2 brand activations per academic year (homecoming + spring showcase)' },
    ],
  },
  {
    id: 'agr-002',
    sponsorId: 'spon-003',
    sponsorName: 'Sodexo',
    type: 'partnership_mou',
    scope: 'campus',
    status: 'executed',
    startDate: '2025-06-01',
    endDate: '2028-05-31',
    totalValue: 150000,
    deliverableCount: 3,
    paymentSchedule: 'Quarterly ($37,500 x 4/yr)',
    complianceReview: true,
    terms: [
      { id: 'term-004', label: 'Service Scope', value: 'Full dining services management for main campus cafeteria and student union' },
      { id: 'term-005', label: 'Quality Standards', value: 'Minimum 85% student satisfaction score on quarterly dining surveys' },
    ],
  },
  {
    id: 'agr-003',
    sponsorId: 'spon-005',
    sponsorName: 'State Farm',
    type: 'partnership_mou',
    scope: 'institution',
    status: 'executed',
    startDate: '2025-09-01',
    endDate: '2026-08-31',
    totalValue: 75000,
    deliverableCount: 2,
    paymentSchedule: 'Annual lump sum',
    complianceReview: true,
    terms: [
      { id: 'term-006', label: 'Scholarship Fund', value: '$50,000 annually for need-based scholarships in STEM programs' },
      { id: 'term-007', label: 'Mentorship', value: 'State Farm employee mentors paired with 10 scholarship recipients' },
      { id: 'term-008', label: 'Recognition', value: 'Named scholarship program with logo placement in scholarship materials' },
    ],
  },
  {
    id: 'agr-004',
    sponsorId: 'spon-006',
    sponsorName: 'First National Credit Union',
    type: 'partnership_mou',
    scope: 'campus',
    status: 'expiring',
    startDate: '2024-03-15',
    endDate: '2026-03-15',
    totalValue: 30000,
    deliverableCount: 2,
    paymentSchedule: 'Annual ($15,000 x 2)',
    complianceReview: false,
    terms: [
      { id: 'term-009', label: 'Campus Branch', value: 'Operate student banking kiosk in student union building' },
      { id: 'term-010', label: 'Financial Literacy', value: 'Deliver 4 financial literacy workshops per academic year' },
    ],
  },
  {
    id: 'agr-005',
    sponsorId: 'spon-007',
    sponsorName: 'TechForward Inc',
    type: 'in_kind',
    scope: 'institution',
    status: 'draft',
    startDate: '2026-03-01',
    endDate: '2029-02-28',
    totalValue: 45000,
    deliverableCount: 1,
    paymentSchedule: 'In-kind (equipment delivery)',
    complianceReview: false,
    terms: [
      { id: 'term-011', label: 'Equipment', value: '30 workstations and networking hardware for new computer science lab' },
      { id: 'term-012', label: 'Maintenance', value: '3-year warranty and on-site maintenance support included' },
    ],
  },
  {
    id: 'agr-006',
    sponsorId: 'spon-008',
    sponsorName: 'Greater Miami Community Foundation',
    type: 'donor_commitment',
    scope: 'institution',
    status: 'executed',
    startDate: '2025-07-01',
    endDate: '2027-06-30',
    totalValue: 60000,
    deliverableCount: 1,
    paymentSchedule: 'Annual ($30,000 x 2)',
    complianceReview: true,
    terms: [
      { id: 'term-013', label: 'Purpose', value: 'General operating support for student success initiatives and retention programs' },
      { id: 'term-014', label: 'Reporting', value: 'Annual impact report with student outcome metrics due within 90 days of fiscal year end' },
      { id: 'term-015', label: 'Recognition', value: 'Foundation acknowledged in annual report and at spring gala event' },
    ],
  },
];

// =============================================================================
// SEEDED DELIVERABLES
// =============================================================================

const DELIVERABLES: Deliverable[] = [
  {
    id: 'del-001',
    agreementId: 'agr-001',
    sponsorName: 'Nike',
    title: 'Homecoming halftime brand activation',
    scope: 'athletics',
    dueDate: '2026-02-28',
    owner: 'Director of Athletics',
    status: 'in_progress',
    proofRequired: true,
    riskIfMissed: 'Contract clause requires activation or $10K penalty credit to Nike',
  },
  {
    id: 'del-002',
    agreementId: 'agr-001',
    sponsorName: 'Nike',
    title: 'Sideline banner installation for spring season',
    scope: 'athletics',
    dueDate: '2026-03-15',
    owner: 'Facilities Coordinator',
    status: 'planned',
    proofRequired: true,
    riskIfMissed: 'Non-compliance with brand placement terms',
  },
  {
    id: 'del-003',
    agreementId: 'agr-001',
    sponsorName: 'Nike',
    title: 'Spring showcase brand activation',
    scope: 'athletics',
    dueDate: '2026-04-20',
    owner: 'Director of Athletics',
    status: 'planned',
    proofRequired: true,
    riskIfMissed: 'Second missed activation would trigger agreement review clause',
  },
  {
    id: 'del-004',
    agreementId: 'agr-002',
    sponsorName: 'Sodexo',
    title: 'Q1 dining satisfaction survey',
    scope: 'campus',
    dueDate: '2026-03-15',
    owner: 'VP of Student Affairs',
    status: 'in_progress',
    proofRequired: true,
    riskIfMissed: 'Below-threshold satisfaction triggers remediation plan',
  },
  {
    id: 'del-005',
    agreementId: 'agr-002',
    sponsorName: 'Sodexo',
    title: 'Menu diversity report — spring semester',
    scope: 'campus',
    dueDate: '2026-04-01',
    owner: 'VP of Student Affairs',
    status: 'planned',
    proofRequired: false,
    riskIfMissed: 'Internal metric only; no contractual penalty',
  },
  {
    id: 'del-006',
    agreementId: 'agr-003',
    sponsorName: 'State Farm',
    title: 'Scholarship recipient annual report',
    scope: 'institution',
    dueDate: '2026-04-01',
    owner: 'Director of Financial Aid',
    status: 'planned',
    proofRequired: true,
    riskIfMissed: 'Jeopardizes renewal of $75K annual scholarship commitment',
  },
  {
    id: 'del-007',
    agreementId: 'agr-004',
    sponsorName: 'First National Credit Union',
    title: 'Financial literacy workshop — spring',
    scope: 'campus',
    dueDate: '2026-03-10',
    owner: 'Student Affairs Coordinator',
    status: 'in_progress',
    proofRequired: true,
    riskIfMissed: 'Failure to deliver workshops weakens renewal negotiation position',
  },
  {
    id: 'del-008',
    agreementId: 'agr-005',
    sponsorName: 'TechForward Inc',
    title: 'Lab equipment delivery and installation',
    scope: 'institution',
    dueDate: '2026-03-31',
    owner: 'VP of Academic Affairs',
    status: 'planned',
    proofRequired: true,
    riskIfMissed: 'Delays impact spring semester CS curriculum rollout',
  },
  {
    id: 'del-009',
    agreementId: 'agr-006',
    sponsorName: 'Greater Miami Community Foundation',
    title: 'Annual impact report — Year 1',
    scope: 'institution',
    dueDate: '2026-09-30',
    owner: 'Director of Development',
    status: 'planned',
    proofRequired: true,
    riskIfMissed: 'Late reporting jeopardizes Year 2 funding disbursement',
  },
  {
    id: 'del-010',
    agreementId: 'agr-001',
    sponsorName: 'Nike',
    title: 'Digital scoreboard logo placement verification',
    scope: 'athletics',
    dueDate: '2026-03-01',
    owner: 'Director of Athletics',
    status: 'submitted',
    proofRequired: true,
    riskIfMissed: 'Brand visibility contractual obligation unmet',
  },
];

// =============================================================================
// SEEDED PROOFS
// =============================================================================

const PROOFS: DeliverableProof[] = [
  {
    id: 'proof-001',
    deliverableId: 'del-001',
    type: 'video',
    status: 'draft',
    submittedBy: 'Athletics Media Team',
    submittedDate: '2026-02-15',
    notes: 'Raw footage captured; editing in progress for final submission.',
  },
  {
    id: 'proof-002',
    deliverableId: 'del-001',
    type: 'photo',
    status: 'submitted',
    submittedBy: 'Athletics Media Team',
    submittedDate: '2026-02-16',
    notes: 'Event photos from homecoming activation — 24 images submitted.',
  },
  {
    id: 'proof-003',
    deliverableId: 'del-010',
    type: 'screenshot',
    status: 'verified',
    submittedBy: 'Facilities Coordinator',
    submittedDate: '2026-02-10',
    verifiedBy: 'Director of Athletics',
    verifiedDate: '2026-02-12',
    notes: 'Screenshots of scoreboard displaying Nike logo during Feb 8 game.',
  },
  {
    id: 'proof-004',
    deliverableId: 'del-004',
    type: 'pdf',
    status: 'draft',
    submittedBy: 'Student Affairs Office',
    submittedDate: '2026-02-18',
    notes: 'Survey instrument finalized; data collection pending.',
  },
  {
    id: 'proof-005',
    deliverableId: 'del-007',
    type: 'attendance_summary',
    status: 'submitted',
    submittedBy: 'Student Affairs Coordinator',
    submittedDate: '2026-02-14',
    notes: 'Workshop 1 of 2 completed. 47 students attended.',
  },
  {
    id: 'proof-006',
    deliverableId: 'del-006',
    type: 'pdf',
    status: 'rejected',
    submittedBy: 'Financial Aid Office',
    submittedDate: '2026-02-10',
    verifiedBy: 'Director of Development',
    verifiedDate: '2026-02-12',
    notes: 'Missing GPA and retention data for 3 of 10 recipients. Resubmission required.',
  },
];

// =============================================================================
// SEEDED PAYMENTS
// =============================================================================

const PAYMENTS: SponsorPayment[] = [
  {
    id: 'pay-001',
    agreementId: 'agr-001',
    sponsorName: 'Nike',
    amount: 42500,
    dueDate: '2026-02-01',
    status: 'received',
    owner: 'Business Office',
    notes: 'First semi-annual installment received on time.',
  },
  {
    id: 'pay-002',
    agreementId: 'agr-001',
    sponsorName: 'Nike',
    amount: 42500,
    dueDate: '2026-08-01',
    status: 'expected',
    owner: 'Business Office',
  },
  {
    id: 'pay-003',
    agreementId: 'agr-002',
    sponsorName: 'Sodexo',
    amount: 37500,
    dueDate: '2026-01-15',
    status: 'late',
    owner: 'Business Office',
    notes: 'Q1 installment overdue. Finance office following up with Sodexo accounts payable.',
  },
  {
    id: 'pay-004',
    agreementId: 'agr-002',
    sponsorName: 'Sodexo',
    amount: 37500,
    dueDate: '2026-04-15',
    status: 'expected',
    owner: 'Business Office',
  },
  {
    id: 'pay-005',
    agreementId: 'agr-003',
    sponsorName: 'State Farm',
    amount: 75000,
    dueDate: '2025-09-15',
    status: 'received',
    owner: 'Business Office',
    notes: 'Annual lump sum received at agreement start.',
  },
  {
    id: 'pay-006',
    agreementId: 'agr-004',
    sponsorName: 'First National Credit Union',
    amount: 15000,
    dueDate: '2025-03-15',
    status: 'received',
    owner: 'Business Office',
  },
  {
    id: 'pay-007',
    agreementId: 'agr-004',
    sponsorName: 'First National Credit Union',
    amount: 15000,
    dueDate: '2026-03-15',
    status: 'invoiced',
    owner: 'Business Office',
    notes: 'Final year payment invoiced ahead of MOU expiration.',
  },
  {
    id: 'pay-008',
    agreementId: 'agr-006',
    sponsorName: 'Greater Miami Community Foundation',
    amount: 30000,
    dueDate: '2025-07-15',
    status: 'received',
    owner: 'Business Office',
    notes: 'Year 1 disbursement received.',
  },
];

// =============================================================================
// SEEDED RISKS
// =============================================================================

const RISKS: SponsorRisk[] = [
  {
    id: 'srisk-001',
    sponsorId: 'spon-001',
    sponsorName: 'Nike',
    category: 'brand',
    severity: 'high',
    status: 'mitigating',
    description: 'Under Armour is also in negotiations for athletics sponsorship. If both sign, there is a direct brand conflict violating Nike exclusivity clause.',
    mitigationPlan: 'Pause Under Armour negotiations until Nike exclusivity scope is clarified. Consult legal on allowable non-footwear partnerships.',
  },
  {
    id: 'srisk-002',
    sponsorId: 'spon-001',
    sponsorName: 'Nike',
    category: 'student_safety',
    severity: 'medium',
    status: 'open',
    description: 'Homecoming halftime activation involves pyrotechnics and crowd interaction. Student safety protocols for brand events have not been formally documented.',
    mitigationPlan: 'Draft event safety addendum to sponsorship agreement. Require Nike event team to submit safety plan 14 days before activation.',
  },
  {
    id: 'srisk-003',
    sponsorId: 'spon-003',
    sponsorName: 'Sodexo',
    category: 'contract_breach',
    severity: 'high',
    status: 'open',
    description: 'Sodexo Q1 payment is overdue by 30+ days. Continued non-payment constitutes a material breach of the partnership MOU.',
    mitigationPlan: 'Escalate to Sodexo regional VP. Issue formal notice of payment default per agreement Section 7.2. Engage legal counsel if unresolved by March 1.',
  },
  {
    id: 'srisk-004',
    sponsorId: 'spon-002',
    sponsorName: 'Under Armour',
    category: 'exclusivity',
    severity: 'medium',
    status: 'mitigating',
    description: 'Under Armour proposal includes apparel provisions that overlap with Nike exclusivity terms. Signing both could trigger Nike termination clause.',
    mitigationPlan: 'Narrow Under Armour scope to non-overlapping categories (training gear only). Get written confirmation from Nike that limited UA deal does not breach exclusivity.',
  },
];

// =============================================================================
// SEEDED CONTACTS
// =============================================================================

const CONTACTS: SponsorContact[] = [
  {
    id: 'con-001',
    sponsorId: 'spon-001',
    name: 'Alex Morgan',
    role: 'Regional Partnerships Manager',
    email: 'mthompson@nike.com',
    phone: '(503) 555-0142',
    tags: ['primary', 'athletics'],
    lastTouch: '2026-02-10',
    nextTouch: '2026-02-25',
  },
  {
    id: 'con-002',
    sponsorId: 'spon-001',
    name: 'Aisha Williams',
    role: 'College Sports Marketing Lead',
    email: 'awilliams@nike.com',
    phone: '(503) 555-0198',
    tags: ['marketing', 'activations'],
    lastTouch: '2026-02-05',
  },
  {
    id: 'con-003',
    sponsorId: 'spon-002',
    name: 'Derek Robinson',
    role: 'University Partnerships Director',
    email: 'drobinson@underarmour.com',
    phone: '(410) 555-0267',
    tags: ['primary', 'athletics'],
    lastTouch: '2026-02-01',
    nextTouch: '2026-03-05',
  },
  {
    id: 'con-004',
    sponsorId: 'spon-003',
    name: 'Patricia Nguyen',
    role: 'Account Director — Higher Education',
    email: 'pnguyen@sodexo.com',
    phone: '(713) 555-0321',
    tags: ['primary', 'operations'],
    lastTouch: '2026-01-28',
    nextTouch: '2026-02-20',
  },
  {
    id: 'con-005',
    sponsorId: 'spon-003',
    name: 'James Carter',
    role: 'Regional Finance Manager',
    email: 'jcarter@sodexo.com',
    phone: '(713) 555-0345',
    tags: ['finance', 'payments'],
    lastTouch: '2026-02-12',
  },
  {
    id: 'con-006',
    sponsorId: 'spon-004',
    name: 'Tanya Brooks',
    role: 'Campus Programs Coordinator',
    email: 'tbrooks@coca-cola.com',
    phone: '(404) 555-0189',
    tags: ['primary', 'campus'],
    lastTouch: '2026-01-20',
  },
  {
    id: 'con-007',
    sponsorId: 'spon-005',
    name: 'Robert Jackson',
    role: 'Community Affairs Manager',
    email: 'rjackson@statefarm.com',
    phone: '(309) 555-0412',
    tags: ['primary', 'scholarships'],
    lastTouch: '2026-02-08',
    nextTouch: '2026-03-15',
  },
  {
    id: 'con-008',
    sponsorId: 'spon-005',
    name: 'Lisa Montgomery',
    role: 'HBCU Partnerships Lead',
    email: 'lmontgomery@statefarm.com',
    phone: '(309) 555-0478',
    tags: ['mentorship', 'events'],
    lastTouch: '2026-01-30',
  },
  {
    id: 'con-009',
    sponsorId: 'spon-006',
    name: 'Kevin Davis',
    role: 'Branch Manager — Campus Operations',
    email: 'kdavis@firstnationalcu.com',
    phone: '(305) 555-0234',
    tags: ['primary', 'campus', 'financial-literacy'],
    lastTouch: '2026-02-05',
    nextTouch: '2026-03-01',
  },
  {
    id: 'con-010',
    sponsorId: 'spon-007',
    name: 'Samantha Lee',
    role: 'VP of Educational Partnerships',
    email: 'slee@techforward.com',
    phone: '(415) 555-0567',
    tags: ['primary', 'equipment'],
    lastTouch: '2026-02-14',
    nextTouch: '2026-02-28',
  },
  {
    id: 'con-011',
    sponsorId: 'spon-007',
    name: 'Michael Okafor',
    role: 'Technical Implementation Lead',
    email: 'mokafor@techforward.com',
    phone: '(415) 555-0589',
    tags: ['technical', 'installation'],
    lastTouch: '2026-02-10',
  },
  {
    id: 'con-012',
    sponsorId: 'spon-008',
    name: 'Dr. Angela Harris',
    role: 'Program Officer — Education',
    email: 'aharris@gmcf.org',
    phone: '(305) 555-0678',
    tags: ['primary', 'grants', 'reporting'],
    lastTouch: '2026-01-25',
    nextTouch: '2026-04-01',
  },
];

// =============================================================================
// SEEDED REPORTS
// =============================================================================

const REPORTS: SponsorReport[] = [
  {
    id: 'rpt-001',
    name: 'Revenue Summary',
    description: 'Total sponsorship and partnership revenue by sponsor, scope, and period with year-over-year comparison.',
    type: 'financial',
  },
  {
    id: 'rpt-002',
    name: 'Deliverables Completion',
    description: 'Status and completion rates for all active deliverables across agreements, grouped by sponsor and scope.',
    type: 'operational',
  },
  {
    id: 'rpt-003',
    name: 'Proof Completeness',
    description: 'Percentage of deliverables with verified proof submissions, highlighting gaps and rejected items requiring resubmission.',
    type: 'compliance',
  },
  {
    id: 'rpt-004',
    name: 'Late Payments',
    description: 'All overdue and disputed payment expectations with aging analysis, owner assignments, and escalation status.',
    type: 'financial',
  },
  {
    id: 'rpt-005',
    name: 'Renewal Calendar',
    description: 'Upcoming agreement expirations and renewal windows with recommended actions and negotiation timelines.',
    type: 'strategic',
  },
];

// =============================================================================
// DATA ACCESSOR
// =============================================================================

export function getEduSponsorsData() {
  return {
    kpiStrip: KPI_STRIP,
    priorities: PRIORITIES,
    sponsors: SPONSORS,
    pipeline: PIPELINE,
    agreements: AGREEMENTS,
    deliverables: DELIVERABLES,
    proofs: PROOFS,
    payments: PAYMENTS,
    risks: RISKS,
    contacts: CONTACTS,
    reports: REPORTS,
  };
}
