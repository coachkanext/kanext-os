/**
 * Sports Organization Sponsors V2 — Mock Data & Types
 * KaNeXT Men's Basketball program sponsor management: sponsors, pipeline,
 * deliverables, proof tracking, invoicing, and renewals.
 *
 * $178K total committed, $119.25K collected across 9 sponsors.
 */

// =============================================================================
// TYPES
// =============================================================================

export type SponsorTier = 'title' | 'gold' | 'silver' | 'local' | 'in-kind';

export type SponsorStatus = 'healthy' | 'at-risk' | 'churned';

export type PipelineStage =
  | 'prospect'
  | 'contacted'
  | 'meeting-set'
  | 'proposal-sent'
  | 'negotiation'
  | 'active'
  | 'renewal'
  | 'churned';

export type PipelinePriority = 'high' | 'medium' | 'low';

export type DeliverableType =
  | 'signage'
  | 'jersey-patch'
  | 'social-post'
  | 'in-game-read'
  | 'event-activation'
  | 'content';

export type DeliverableStatus =
  | 'not-started'
  | 'in-progress'
  | 'complete'
  | 'blocked';

export type ProofType =
  | 'photo'
  | 'link'
  | 'video-timestamp'
  | 'attendance';

export type ProofStatus = 'accepted' | 'needs-review' | 'missing';

export type InvoiceStatus = 'paid' | 'issued' | 'past-due' | 'blocked';

export type RenewalRiskLevel = 'low' | 'medium' | 'high';

// =============================================================================
// SUB-TAB DEFINITION
// =============================================================================

export type SponsorsSubTabId =
  | 'overview'
  | 'sponsors'
  | 'pipeline'
  | 'deliverables'
  | 'proof'
  | 'invoices'
  | 'renewals';

export interface SponsorsSubTab {
  id: SponsorsSubTabId;
  label: string;
}

export const SPONSORS_SUB_TABS: SponsorsSubTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'sponsors', label: 'Sponsors' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'deliverables', label: 'Deliverables' },
  { id: 'proof', label: 'Proof' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'renewals', label: 'Renewals' },
];

// =============================================================================
// INTERFACES
// =============================================================================

export interface Sponsor {
  id: string;
  name: string;
  tier: SponsorTier;
  primaryContact: string;
  ownerInProgram: string;
  contractStart: string;
  contractEnd: string;
  status: SponsorStatus;
  committedAmount: number;
  collectedAmount: number;
  /** Data provenance tag */
  data_source?: string;
}

export interface SponsorPipelineItem {
  id: string;
  name: string;
  stage: PipelineStage;
  daysInStage: number;
  priority: PipelinePriority;
}

export interface Deliverable {
  id: string;
  sponsorId: string;
  sponsorName: string;
  type: DeliverableType;
  dueDate: string;
  eventLink: string | null;
  owner: string;
  proofRequired: boolean;
  status: DeliverableStatus;
}

export interface ProofItem {
  id: string;
  deliverableId: string;
  type: ProofType;
  deliverableName: string;
  timestamp: string;
  reviewer: string | null;
  status: ProofStatus;
}

export interface SponsorInvoice {
  id: string;
  sponsorId: string;
  sponsorName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  blockedReason: string | null;
}

export interface RenewalItem {
  id: string;
  sponsorId: string;
  sponsorName: string;
  tier: string;
  contractEnd: string;
  daysUntilRenewal: number;
  riskLevel: RenewalRiskLevel;
  recommendedAction: string;
}

export interface SponsorsOverview {
  activeCount: number;
  committed: number;
  collected: number;
  deliverablesDue: number;
  proofPending: number;
  renewalsDue: number;
}

// =============================================================================
// LABELS & COLORS
// =============================================================================

export const SPONSOR_TIER_LABEL: Record<SponsorTier, string> = {
  title: 'Title',
  gold: 'Gold',
  silver: 'Silver',
  local: 'Local',
  'in-kind': 'In-Kind',
};

export const SPONSOR_TIER_COLOR: Record<SponsorTier, string> = {
  title: '#f59e0b',
  gold: '#F59E0B',
  silver: '#A1A1AA',
  local: '#22c55e',
  'in-kind': '#1D9BF0',
};

export const SPONSOR_STATUS_LABEL: Record<SponsorStatus, string> = {
  healthy: 'Healthy',
  'at-risk': 'At Risk',
  churned: 'Churned',
};

export const SPONSOR_STATUS_COLOR: Record<SponsorStatus, string> = {
  healthy: '#22c55e',
  'at-risk': '#f59e0b',
  churned: '#ef4444',
};

export const PIPELINE_STAGE_LABEL: Record<PipelineStage, string> = {
  prospect: 'Prospect',
  contacted: 'Contacted',
  'meeting-set': 'Meeting Set',
  'proposal-sent': 'Proposal Sent',
  negotiation: 'Negotiation',
  active: 'Active',
  renewal: 'Renewal',
  churned: 'Churned',
};

export const PIPELINE_STAGE_COLOR: Record<PipelineStage, string> = {
  prospect: '#A1A1AA',
  contacted: '#1D9BF0',
  'meeting-set': '#1D9BF0',
  'proposal-sent': '#f59e0b',
  negotiation: '#ef4444',
  active: '#22c55e',
  renewal: '#1D9BF0',
  churned: '#A1A1AA',
};

export const PIPELINE_PRIORITY_LABEL: Record<PipelinePriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const PIPELINE_PRIORITY_COLOR: Record<PipelinePriority, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#A1A1AA',
};

export const DELIVERABLE_TYPE_LABEL: Record<DeliverableType, string> = {
  signage: 'Signage',
  'jersey-patch': 'Jersey Patch',
  'social-post': 'Social Post',
  'in-game-read': 'In-Game Read',
  'event-activation': 'Event Activation',
  content: 'Content',
};

export const DELIVERABLE_TYPE_COLOR: Record<DeliverableType, string> = {
  signage: '#1D9BF0',
  'jersey-patch': '#1D9BF0',
  'social-post': '#22c55e',
  'in-game-read': '#f59e0b',
  'event-activation': '#ef4444',
  content: '#A1A1AA',
};

export const DELIVERABLE_STATUS_LABEL: Record<DeliverableStatus, string> = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  complete: 'Complete',
  blocked: 'Blocked',
};

export const DELIVERABLE_STATUS_COLOR: Record<DeliverableStatus, string> = {
  'not-started': '#A1A1AA',
  'in-progress': '#f59e0b',
  complete: '#22c55e',
  blocked: '#ef4444',
};

export const PROOF_TYPE_LABEL: Record<ProofType, string> = {
  photo: 'Photo',
  link: 'Link',
  'video-timestamp': 'Video Timestamp',
  attendance: 'Attendance',
};

export const PROOF_TYPE_COLOR: Record<ProofType, string> = {
  photo: '#1D9BF0',
  link: '#22c55e',
  'video-timestamp': '#1D9BF0',
  attendance: '#f59e0b',
};

export const PROOF_STATUS_LABEL: Record<ProofStatus, string> = {
  accepted: 'Accepted',
  'needs-review': 'Needs Review',
  missing: 'Missing',
};

export const PROOF_STATUS_COLOR: Record<ProofStatus, string> = {
  accepted: '#22c55e',
  'needs-review': '#f59e0b',
  missing: '#ef4444',
};

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  paid: 'Paid',
  issued: 'Issued',
  'past-due': 'Past Due',
  blocked: 'Blocked',
};

export const INVOICE_STATUS_COLOR: Record<InvoiceStatus, string> = {
  paid: '#22c55e',
  issued: '#1D9BF0',
  'past-due': '#ef4444',
  blocked: '#f59e0b',
};

export const RENEWAL_RISK_LABEL: Record<RenewalRiskLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const RENEWAL_RISK_COLOR: Record<RenewalRiskLevel, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
};

// =============================================================================
// MOCK DATA — SPONSORS (9) — $178K committed, $119.25K collected
// =============================================================================

const sponsors: Sponsor[] = [
  {
    id: 'sp-001',
    name: 'MidState Credit Union',
    tier: 'title',
    primaryContact: 'David Reynolds',
    ownerInProgram: 'Alex Morgan',
    contractStart: '2025-08-01',
    contractEnd: '2026-05-31',
    status: 'healthy',
    committedAmount: 45000,
    collectedAmount: 33750,
  },
  {
    id: 'sp-002',
    name: 'Palmetto Health Systems',
    tier: 'gold',
    primaryContact: 'Dr. Lisa Chen',
    ownerInProgram: 'Alex Morgan',
    contractStart: '2025-08-01',
    contractEnd: '2026-05-31',
    status: 'healthy',
    committedAmount: 30000,
    collectedAmount: 22500,
  },
  {
    id: 'sp-003',
    name: 'QuickFuel Gas & Convenience',
    tier: 'gold',
    primaryContact: 'Marcus Grant',
    ownerInProgram: 'Marcus Reed',
    contractStart: '2026-01-01',
    contractEnd: '2026-12-31',
    status: 'at-risk',
    committedAmount: 20000,
    collectedAmount: 10000,
  },
  {
    id: 'sp-004',
    name: 'Carolina BBQ Co.',
    tier: 'silver',
    primaryContact: 'James Porter',
    ownerInProgram: 'Marcus Reed',
    contractStart: '2025-08-01',
    contractEnd: '2026-05-31',
    status: 'healthy',
    committedAmount: 15000,
    collectedAmount: 12500,
  },
  {
    id: 'sp-005',
    name: 'TechStart Incubator',
    tier: 'local',
    primaryContact: 'Priya Sharma',
    ownerInProgram: 'Tanya Brooks',
    contractStart: '2025-08-01',
    contractEnd: '2026-05-31',
    status: 'healthy',
    committedAmount: 10000,
    collectedAmount: 6250,
  },
  {
    id: 'sp-006',
    name: 'Hampton Roads Auto Group',
    tier: 'in-kind',
    primaryContact: 'Robert Calhoun',
    ownerInProgram: 'Marcus Reed',
    contractStart: '2025-09-01',
    contractEnd: '2026-05-31',
    status: 'healthy',
    committedAmount: 30000,
    collectedAmount: 10000,
  },
  // ── KaNeXT Demo Seed Sponsors ────────────────────────────────────────
  {
    id: 'sp-007',
    name: 'Nashville Auto Group',
    tier: 'title',
    primaryContact: 'Raymond Desmond',
    ownerInProgram: 'Alex Morgan',
    contractStart: '2025-09-01',
    contractEnd: '2026-08-31',
    status: 'healthy',
    committedAmount: 15000,
    collectedAmount: 11250,
    data_source: 'demo_seed',
  },
  {
    id: 'sp-008',
    name: 'James & Patricia Wilson Foundation',
    tier: 'gold',
    primaryContact: 'Patricia Wilson',
    ownerInProgram: 'Alex Morgan',
    contractStart: '2025-07-01',
    contractEnd: '2026-06-30',
    status: 'healthy',
    committedAmount: 5000,
    collectedAmount: 5000,
    data_source: 'demo_seed',
  },
  {
    id: 'sp-009',
    name: 'ProShot Athletics',
    tier: 'in-kind',
    primaryContact: 'Derek Rawlings',
    ownerInProgram: 'Marcus Reed',
    contractStart: '2025-08-01',
    contractEnd: '2026-07-31',
    status: 'healthy',
    committedAmount: 8000,
    collectedAmount: 8000,
    data_source: 'demo_seed',
  },
];

// =============================================================================
// MOCK DATA — PIPELINE (10)
// =============================================================================

const pipelineItems: SponsorPipelineItem[] = [
  {
    id: 'pl-001',
    name: 'Lowcountry Insurance Group',
    stage: 'prospect',
    daysInStage: 12,
    priority: 'medium',
  },
  {
    id: 'pl-002',
    name: 'Tidewater Physical Therapy',
    stage: 'contacted',
    daysInStage: 8,
    priority: 'high',
  },
  {
    id: 'pl-003',
    name: 'Norfolk Sports Medicine Center',
    stage: 'meeting-set',
    daysInStage: 3,
    priority: 'high',
  },
  {
    id: 'pl-004',
    name: 'Coastal Apparel Co.',
    stage: 'proposal-sent',
    daysInStage: 6,
    priority: 'medium',
  },
  {
    id: 'pl-005',
    name: 'Harbor View Dental',
    stage: 'prospect',
    daysInStage: 20,
    priority: 'low',
  },
  {
    id: 'pl-006',
    name: 'MidState Credit Union',
    stage: 'renewal',
    daysInStage: 5,
    priority: 'high',
  },
  {
    id: 'pl-007',
    name: 'Palmetto Health Systems',
    stage: 'active',
    daysInStage: 195,
    priority: 'medium',
  },
  {
    id: 'pl-008',
    name: 'QuickFuel Gas & Convenience',
    stage: 'active',
    daysInStage: 49,
    priority: 'medium',
  },
  {
    id: 'pl-009',
    name: 'Regional Auto Parts',
    stage: 'negotiation',
    daysInStage: 14,
    priority: 'high',
  },
  {
    id: 'pl-010',
    name: 'Southern Comfort HVAC',
    stage: 'churned',
    daysInStage: 45,
    priority: 'low',
  },
  // ── KaNeXT Demo Seed Pipeline ──────────────────────────────────────
  {
    id: 'pl-011',
    name: 'Nashville Auto Group',
    stage: 'active',
    daysInStage: 170,
    priority: 'high',
  },
  {
    id: 'pl-012',
    name: 'James & Patricia Wilson Foundation',
    stage: 'active',
    daysInStage: 232,
    priority: 'medium',
  },
  {
    id: 'pl-013',
    name: 'ProShot Athletics',
    stage: 'active',
    daysInStage: 202,
    priority: 'medium',
  },
];

// =============================================================================
// MOCK DATA — DELIVERABLES (8)
// =============================================================================

const deliverables: Deliverable[] = [
  {
    id: 'del-001',
    sponsorId: 'sp-001',
    sponsorName: 'MidState Credit Union',
    type: 'jersey-patch',
    dueDate: '2025-10-15',
    eventLink: null,
    owner: 'Tanya Brooks',
    proofRequired: true,
    status: 'complete',
  },
  {
    id: 'del-002',
    sponsorId: 'sp-001',
    sponsorName: 'MidState Credit Union',
    type: 'signage',
    dueDate: '2026-02-20',
    eventLink: 'KaNeXT vs. Hampton — KaNeXT Church Conference',
    owner: 'Marcus Reed',
    proofRequired: true,
    status: 'in-progress',
  },
  {
    id: 'del-003',
    sponsorId: 'sp-002',
    sponsorName: 'Palmetto Health Systems',
    type: 'social-post',
    dueDate: '2026-02-28',
    eventLink: null,
    owner: 'Tanya Brooks',
    proofRequired: true,
    status: 'not-started',
  },
  {
    id: 'del-004',
    sponsorId: 'sp-003',
    sponsorName: 'QuickFuel Gas & Convenience',
    type: 'signage',
    dueDate: '2026-02-20',
    eventLink: 'KaNeXT vs. Hampton — KaNeXT Church Conference',
    owner: 'Marcus Reed',
    proofRequired: true,
    status: 'blocked',
  },
  {
    id: 'del-005',
    sponsorId: 'sp-003',
    sponsorName: 'QuickFuel Gas & Convenience',
    type: 'in-game-read',
    dueDate: '2026-02-20',
    eventLink: 'KaNeXT vs. Hampton — KaNeXT Church Conference',
    owner: 'Game Operations',
    proofRequired: false,
    status: 'not-started',
  },
  {
    id: 'del-006',
    sponsorId: 'sp-004',
    sponsorName: 'Carolina BBQ Co.',
    type: 'event-activation',
    dueDate: '2026-03-01',
    eventLink: 'Monarch Youth Clinic',
    owner: 'Marcus Reed',
    proofRequired: true,
    status: 'not-started',
  },
  {
    id: 'del-007',
    sponsorId: 'sp-005',
    sponsorName: 'TechStart Incubator',
    type: 'social-post',
    dueDate: '2026-02-25',
    eventLink: null,
    owner: 'Tanya Brooks',
    proofRequired: true,
    status: 'in-progress',
  },
  {
    id: 'del-008',
    sponsorId: 'sp-006',
    sponsorName: 'Hampton Roads Auto Group',
    type: 'content',
    dueDate: '2026-03-10',
    eventLink: null,
    owner: 'Tanya Brooks',
    proofRequired: true,
    status: 'not-started',
  },
  // ── Nashville Auto Group — 3 deliverables ─────────────────────────
  {
    id: 'del-009',
    sponsorId: 'sp-007',
    sponsorName: 'Nashville Auto Group',
    type: 'signage',
    dueDate: '2025-11-15',
    eventLink: 'KaNeXT vs. Pinecrest University — Home Opener',
    owner: 'Marcus Reed',
    proofRequired: true,
    status: 'complete',
  },
  {
    id: 'del-010',
    sponsorId: 'sp-007',
    sponsorName: 'Nashville Auto Group',
    type: 'content',
    dueDate: '2025-12-01',
    eventLink: null,
    owner: 'Tanya Brooks',
    proofRequired: true,
    status: 'complete',
  },
  {
    id: 'del-011',
    sponsorId: 'sp-007',
    sponsorName: 'Nashville Auto Group',
    type: 'social-post',
    dueDate: '2026-03-01',
    eventLink: null,
    owner: 'Tanya Brooks',
    proofRequired: true,
    status: 'not-started',
  },
  // ── James & Patricia Wilson Foundation — 2 deliverables ───────────────
  {
    id: 'del-012',
    sponsorId: 'sp-008',
    sponsorName: 'James & Patricia Wilson Foundation',
    type: 'event-activation',
    dueDate: '2025-10-20',
    eventLink: 'KaNeXT Scholar-Athlete Award Ceremony',
    owner: 'Alex Morgan',
    proofRequired: true,
    status: 'complete',
  },
  {
    id: 'del-013',
    sponsorId: 'sp-008',
    sponsorName: 'James & Patricia Wilson Foundation',
    type: 'content',
    dueDate: '2026-05-15',
    eventLink: null,
    owner: 'Tanya Brooks',
    proofRequired: true,
    status: 'not-started',
  },
  // ── ProShot Athletics — 2 deliverables ────────────────────────────────
  {
    id: 'del-014',
    sponsorId: 'sp-009',
    sponsorName: 'ProShot Athletics',
    type: 'content',
    dueDate: '2025-10-01',
    eventLink: 'Team shoes delivery — pre-season',
    owner: 'Marcus Reed',
    proofRequired: true,
    status: 'complete',
  },
  {
    id: 'del-015',
    sponsorId: 'sp-009',
    sponsorName: 'ProShot Athletics',
    type: 'content',
    dueDate: '2026-03-15',
    eventLink: 'Practice gear delivery — spring',
    owner: 'Marcus Reed',
    proofRequired: true,
    status: 'not-started',
  },
];

// =============================================================================
// MOCK DATA — PROOF ITEMS (6)
// =============================================================================

const proofItems: ProofItem[] = [
  {
    id: 'prf-001',
    deliverableId: 'del-001',
    type: 'photo',
    deliverableName: 'Jersey Patch — MidState Credit Union',
    timestamp: '2025-10-15',
    reviewer: 'Alex Morgan',
    status: 'accepted',
  },
  {
    id: 'prf-002',
    deliverableId: 'del-002',
    type: 'photo',
    deliverableName: 'Courtside Signage — MidState Credit Union',
    timestamp: '2026-02-15',
    reviewer: null,
    status: 'needs-review',
  },
  {
    id: 'prf-003',
    deliverableId: 'del-003',
    type: 'link',
    deliverableName: 'Social Post — Palmetto Health Systems',
    timestamp: '2026-02-18',
    reviewer: null,
    status: 'missing',
  },
  {
    id: 'prf-004',
    deliverableId: 'del-004',
    type: 'photo',
    deliverableName: 'Baseline Signage — QuickFuel',
    timestamp: '2026-02-15',
    reviewer: null,
    status: 'missing',
  },
  {
    id: 'prf-005',
    deliverableId: 'del-007',
    type: 'link',
    deliverableName: 'Social Post — TechStart Incubator',
    timestamp: '2026-02-17',
    reviewer: null,
    status: 'needs-review',
  },
  {
    id: 'prf-006',
    deliverableId: 'del-006',
    type: 'attendance',
    deliverableName: 'Event Activation — Carolina BBQ Co.',
    timestamp: '2026-02-18',
    reviewer: null,
    status: 'missing',
  },
  // ── Nashville Auto Group proof ────────────────────────────────────
  {
    id: 'prf-007',
    deliverableId: 'del-009',
    type: 'photo',
    deliverableName: 'Courtside Banner — Nashville Auto Group',
    timestamp: '2025-11-15',
    reviewer: 'Alex Morgan',
    status: 'accepted',
  },
  {
    id: 'prf-008',
    deliverableId: 'del-010',
    type: 'link',
    deliverableName: 'Program Ad — Nashville Auto Group',
    timestamp: '2025-12-02',
    reviewer: 'Alex Morgan',
    status: 'accepted',
  },
  // ── Wilson Foundation proof ───────────────────────────────────────────
  {
    id: 'prf-009',
    deliverableId: 'del-012',
    type: 'photo',
    deliverableName: 'Scholarship Award Ceremony — Wilson Foundation',
    timestamp: '2025-10-20',
    reviewer: 'Alex Morgan',
    status: 'accepted',
  },
  // ── ProShot Athletics proof ───────────────────────────────────────────
  {
    id: 'prf-010',
    deliverableId: 'del-014',
    type: 'photo',
    deliverableName: 'Team Shoes Delivery — ProShot Athletics',
    timestamp: '2025-10-01',
    reviewer: 'Marcus Reed',
    status: 'accepted',
  },
];

// =============================================================================
// MOCK DATA — INVOICES (5)
// =============================================================================

const invoices: SponsorInvoice[] = [
  {
    id: 'inv-001',
    sponsorId: 'sp-001',
    sponsorName: 'MidState Credit Union',
    amount: 11250,
    issueDate: '2026-01-02',
    dueDate: '2026-01-31',
    status: 'paid',
    blockedReason: null,
  },
  {
    id: 'inv-002',
    sponsorId: 'sp-002',
    sponsorName: 'Palmetto Health Systems',
    amount: 15000,
    issueDate: '2026-01-02',
    dueDate: '2026-01-31',
    status: 'paid',
    blockedReason: null,
  },
  {
    id: 'inv-003',
    sponsorId: 'sp-003',
    sponsorName: 'QuickFuel Gas & Convenience',
    amount: 5000,
    issueDate: '2026-02-01',
    dueDate: '2026-02-28',
    status: 'issued',
    blockedReason: null,
  },
  {
    id: 'inv-004',
    sponsorId: 'sp-004',
    sponsorName: 'Carolina BBQ Co.',
    amount: 2500,
    issueDate: '2026-01-15',
    dueDate: '2026-02-15',
    status: 'past-due',
    blockedReason: null,
  },
  {
    id: 'inv-005',
    sponsorId: 'sp-006',
    sponsorName: 'Hampton Roads Auto Group',
    amount: 10000,
    issueDate: '2026-02-01',
    dueDate: '2026-03-01',
    status: 'blocked',
    blockedReason: 'Awaiting signed in-kind agreement addendum',
  },
  // ── Nashville Auto Group — on schedule ────────────────────────────
  {
    id: 'inv-006',
    sponsorId: 'sp-007',
    sponsorName: 'Nashville Auto Group',
    amount: 3750,
    issueDate: '2025-09-15',
    dueDate: '2025-10-15',
    status: 'paid',
    blockedReason: null,
  },
  {
    id: 'inv-007',
    sponsorId: 'sp-007',
    sponsorName: 'Nashville Auto Group',
    amount: 3750,
    issueDate: '2025-12-15',
    dueDate: '2026-01-15',
    status: 'paid',
    blockedReason: null,
  },
  {
    id: 'inv-008',
    sponsorId: 'sp-007',
    sponsorName: 'Nashville Auto Group',
    amount: 3750,
    issueDate: '2026-01-15',
    dueDate: '2026-02-15',
    status: 'paid',
    blockedReason: null,
  },
  {
    id: 'inv-009',
    sponsorId: 'sp-007',
    sponsorName: 'Nashville Auto Group',
    amount: 3750,
    issueDate: '2026-04-15',
    dueDate: '2026-05-15',
    status: 'issued',
    blockedReason: null,
  },
  // ── Wilson Foundation — on schedule ───────────────────────────────────
  {
    id: 'inv-010',
    sponsorId: 'sp-008',
    sponsorName: 'James & Patricia Wilson Foundation',
    amount: 5000,
    issueDate: '2025-07-15',
    dueDate: '2025-08-15',
    status: 'paid',
    blockedReason: null,
  },
  // ── ProShot Athletics — in-kind fulfilled ─────────────────────────────
  {
    id: 'inv-011',
    sponsorId: 'sp-009',
    sponsorName: 'ProShot Athletics',
    amount: 0,
    issueDate: '2025-10-01',
    dueDate: '2025-10-01',
    status: 'paid',
    blockedReason: null,
  },
];

// =============================================================================
// MOCK DATA — RENEWALS (4)
// =============================================================================

const renewalItems: RenewalItem[] = [
  {
    id: 'ren-001',
    sponsorId: 'sp-001',
    sponsorName: 'MidState Credit Union',
    tier: 'Title',
    contractEnd: '2026-05-31',
    daysUntilRenewal: 102,
    riskLevel: 'low',
    recommendedAction: 'Schedule renewal lunch with David Reynolds by March 15.',
  },
  {
    id: 'ren-002',
    sponsorId: 'sp-002',
    sponsorName: 'Palmetto Health Systems',
    tier: 'Gold',
    contractEnd: '2026-05-31',
    daysUntilRenewal: 102,
    riskLevel: 'low',
    recommendedAction: 'Send season impact report and propose multi-year deal.',
  },
  {
    id: 'ren-003',
    sponsorId: 'sp-003',
    sponsorName: 'QuickFuel Gas & Convenience',
    tier: 'Gold',
    contractEnd: '2026-12-31',
    daysUntilRenewal: 316,
    riskLevel: 'high',
    recommendedAction: 'Address missed deliverable from Game 12 before renewal conversation.',
  },
  {
    id: 'ren-004',
    sponsorId: 'sp-005',
    sponsorName: 'TechStart Incubator',
    tier: 'Local',
    contractEnd: '2026-05-31',
    daysUntilRenewal: 102,
    riskLevel: 'medium',
    recommendedAction: 'Propose upgrade to Silver tier with additional social media deliverables.',
  },
  // ── KaNeXT Demo Seed Renewals ──────────────────────────────────────
  {
    id: 'ren-005',
    sponsorId: 'sp-007',
    sponsorName: 'Nashville Auto Group',
    tier: 'Title',
    contractEnd: '2026-08-31',
    daysUntilRenewal: 194,
    riskLevel: 'low',
    recommendedAction: 'Present season ROI recap at May meeting. Pitch multi-year title renewal at $18K/yr.',
  },
  {
    id: 'ren-006',
    sponsorId: 'sp-008',
    sponsorName: 'James & Patricia Wilson Foundation',
    tier: 'Gold',
    contractEnd: '2026-06-30',
    daysUntilRenewal: 132,
    riskLevel: 'low',
    recommendedAction: 'Invite to Senior Night ceremony and propose renewed scholarship commitment for 2026-27.',
  },
  {
    id: 'ren-007',
    sponsorId: 'sp-009',
    sponsorName: 'ProShot Athletics',
    tier: 'In-Kind',
    contractEnd: '2026-07-31',
    daysUntilRenewal: 163,
    riskLevel: 'low',
    recommendedAction: 'Coordinate summer gear delivery timeline. Discuss adding warm-up apparel to in-kind package.',
  },
];

// =============================================================================
// GETTER
// =============================================================================

export function getSponsorsOverview(): SponsorsOverview {
  const activeCount = sponsors.filter((s) => s.status !== 'churned').length;

  const committed = sponsors.reduce((sum, s) => sum + s.committedAmount, 0);
  const collected = sponsors.reduce((sum, s) => sum + s.collectedAmount, 0);

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 86400000);
  const deliverablesDue = deliverables.filter((d) => {
    const due = new Date(d.dueDate);
    return d.status !== 'complete' && due <= thirtyDaysFromNow;
  }).length;

  const proofPending = proofItems.filter(
    (p) => p.status === 'needs-review' || p.status === 'missing',
  ).length;

  const renewalsDue = renewalItems.filter((r) => r.daysUntilRenewal <= 120).length;

  return {
    activeCount,
    committed,
    collected,
    deliverablesDue,
    proofPending,
    renewalsDue,
  };
}

export function getSponsors(): Sponsor[] {
  return sponsors;
}

export function getPipelineItems(): SponsorPipelineItem[] {
  return pipelineItems;
}

export function getDeliverables(): Deliverable[] {
  return deliverables;
}

export function getProofItems(): ProofItem[] {
  return proofItems;
}

export function getSponsorInvoices(): SponsorInvoice[] {
  return invoices;
}

export function getRenewalItems(): RenewalItem[] {
  return renewalItems;
}
