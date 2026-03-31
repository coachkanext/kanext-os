/**
 * Mock Deals Data — Structured Lifecycle Surface
 *
 * Deals track negotiation and execution stages.
 * Deals do not execute money.
 * Deals do not store documents.
 * Deals do not replace CRM.
 *
 * 6 canonical types, 5 pipeline stages, 4 statuses.
 */

// =============================================================================
// TYPES
// =============================================================================

export type DealType = 'EQUITY' | 'DEBT' | 'GRANT' | 'PARTNERSHIP' | 'ACQUISITION' | 'SPONSORSHIP';

export type DealStage =
  | 'Prospecting'
  | 'In Discussion'
  | 'Term Sheet'
  | 'Diligence'
  | 'Pending Close';

export type DealStatus = 'Active' | 'Pending Close' | 'Closed' | 'Cancelled';

export type DealLifecycle = 'pipeline' | 'active' | 'closed' | 'archive';

export type MilestoneStatus = 'Not Started' | 'Completed';

export interface DealMilestone {
  label: string;
  status: MilestoneStatus;
  date?: string;
}

export interface DealLinkedDoc {
  type: string; // Term Sheet, SAFE, Purchase Agreement, Board Resolution, Side Letter
  vaultDocId?: string;
  label: string;
}

// Type-specific terms
export interface EquityTerms {
  valuation: string;
  equityPercent: string;
  boardRights: boolean;
  liquidationPreference: string;
}

export interface DebtTerms {
  principal: string;
  interestRate: string;
  maturityDate: string;
}

export interface AcquisitionTerms {
  purchasePrice: string;
  purchaseType: 'Asset' | 'Equity';
  closingConditions: string;
}

export interface PartnershipTerms {
  termLength: string;
  revenueShare?: string;
}

export interface GrantTerms {
  grantAmount: string;
  grantingBody: string;
  reportingRequirements: string;
}

export interface SponsorshipTerms {
  sponsorshipValue: string;
  termLength: string;
  deliverables: string;
}

export type DealTerms =
  | { kind: 'EQUITY'; data: EquityTerms }
  | { kind: 'DEBT'; data: DebtTerms }
  | { kind: 'ACQUISITION'; data: AcquisitionTerms }
  | { kind: 'PARTNERSHIP'; data: PartnershipTerms }
  | { kind: 'GRANT'; data: GrantTerms }
  | { kind: 'SPONSORSHIP'; data: SponsorshipTerms };

export interface DealCapitalOverview {
  targetAmount: string;
  committedAmount: string;
  receivedAmount: string;
  remaining: string;
  linkedFinanceObject?: string;
}

export interface Deal {
  id: string;
  name: string;
  type: DealType;
  stage: DealStage;
  status: DealStatus;
  lifecycle: DealLifecycle;
  counterparty: string;
  structureType: string; // SAFE, Equity, Loan, Asset Purchase, etc.
  targetValue: number;
  expectedCloseDate: string;
  // Active deals
  remainingValue?: number;
  keyMilestoneDate?: string;
  // Closed deals
  finalValue?: number;
  closeDate?: string;
  // Detail data
  terms: DealTerms;
  capitalOverview?: DealCapitalOverview;
  linkedDocs: DealLinkedDoc[];
  milestones: DealMilestone[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const DEAL_STAGES: DealStage[] = [
  'Prospecting',
  'In Discussion',
  'Term Sheet',
  'Diligence',
  'Pending Close',
];

export const DEAL_TYPE_COLORS: Record<DealType, string> = {
  EQUITY: '#6366F1',
  DEBT: '#1A1714',
  GRANT: '#059669',
  PARTNERSHIP: '#78716C',
  ACQUISITION: '#D97706',
  SPONSORSHIP: '#9CA3AF',
};

export const STAGE_COLORS: Record<DealStage, string> = {
  'Prospecting': '#9C9790',
  'In Discussion': '#B8943E',
  'Term Sheet': '#1A1714',
  'Diligence': '#D97706',
  'Pending Close': '#5A8A6E',
};

// =============================================================================
// MOCK DEALS (12 total across all lifecycle stages)
// =============================================================================

export const DEALS: Deal[] = [
  // ── PIPELINE DEALS (7) ──────────────────────────────────────────
  {
    id: 'dl-01',
    name: 'Seed Round — SAFE',
    type: 'EQUITY',
    stage: 'Diligence',
    status: 'Active',
    lifecycle: 'pipeline',
    counterparty: 'Apex Capital',
    structureType: 'SAFE',
    targetValue: 500_000,
    expectedCloseDate: '2026-03-15',
    terms: {
      kind: 'EQUITY',
      data: { valuation: '$8M post-money cap', equityPercent: '6.25%', boardRights: false, liquidationPreference: '1x non-participating' },
    },
    capitalOverview: {
      targetAmount: '$500K',
      committedAmount: '$150K',
      receivedAmount: '$150K',
      remaining: '$350K',
      linkedFinanceObject: 'FIN-SEED-001',
    },
    linkedDocs: [
      { type: 'SAFE', vaultDocId: 'vd-03', label: 'SAFE Agreement — Apex Capital' },
      { type: 'Board Resolution', vaultDocId: 'vd-13', label: 'Board Resolution — Option Pool' },
    ],
    milestones: [
      { label: 'Term Sheet Signed', status: 'Completed', date: '2026-01-28' },
      { label: 'Diligence Complete', status: 'Not Started' },
      { label: 'Board Approval', status: 'Not Started' },
      { label: 'Funds Received', status: 'Not Started' },
      { label: 'Close', status: 'Not Started' },
    ],
  },
  {
    id: 'dl-02',
    name: 'Strategic Partnership — TechForward',
    type: 'PARTNERSHIP',
    stage: 'In Discussion',
    status: 'Active',
    lifecycle: 'pipeline',
    counterparty: 'TechForward Inc.',
    structureType: 'Strategic Alliance',
    targetValue: 0,
    expectedCloseDate: '2026-04-01',
    terms: {
      kind: 'PARTNERSHIP',
      data: { termLength: '24 months', revenueShare: '15% on joint revenue' },
    },
    linkedDocs: [],
    milestones: [
      { label: 'Term Sheet Signed', status: 'Not Started' },
      { label: 'Diligence Complete', status: 'Not Started' },
      { label: 'Board Approval', status: 'Not Started' },
      { label: 'Funds Received', status: 'Not Started' },
      { label: 'Close', status: 'Not Started' },
    ],
  },
  {
    id: 'dl-03',
    name: 'AWS Activate Grant',
    type: 'GRANT',
    stage: 'Term Sheet',
    status: 'Active',
    lifecycle: 'pipeline',
    counterparty: 'Amazon Web Services',
    structureType: 'Grant',
    targetValue: 100_000,
    expectedCloseDate: '2026-03-30',
    terms: {
      kind: 'GRANT',
      data: { grantAmount: '$100K in credits', grantingBody: 'AWS Activate', reportingRequirements: 'Quarterly usage report' },
    },
    linkedDocs: [],
    milestones: [
      { label: 'Term Sheet Signed', status: 'Completed', date: '2026-02-15' },
      { label: 'Diligence Complete', status: 'Not Started' },
      { label: 'Board Approval', status: 'Not Started' },
      { label: 'Funds Received', status: 'Not Started' },
      { label: 'Close', status: 'Not Started' },
    ],
  },
  {
    id: 'dl-04',
    name: 'Venture Debt Facility',
    type: 'DEBT',
    stage: 'Prospecting',
    status: 'Active',
    lifecycle: 'pipeline',
    counterparty: 'Silicon Valley Bank',
    structureType: 'Term Loan',
    targetValue: 250_000,
    expectedCloseDate: '2026-05-01',
    terms: {
      kind: 'DEBT',
      data: { principal: '$250K', interestRate: 'Prime + 2.5%', maturityDate: '2029-05-01' },
    },
    linkedDocs: [],
    milestones: [
      { label: 'Term Sheet Signed', status: 'Not Started' },
      { label: 'Diligence Complete', status: 'Not Started' },
      { label: 'Board Approval', status: 'Not Started' },
      { label: 'Funds Received', status: 'Not Started' },
      { label: 'Close', status: 'Not Started' },
    ],
  },
  {
    id: 'dl-05',
    name: 'Arena Naming Rights',
    type: 'SPONSORSHIP',
    stage: 'Prospecting',
    status: 'Active',
    lifecycle: 'pipeline',
    counterparty: 'Metro Sports Authority',
    structureType: 'Sponsorship Agreement',
    targetValue: 75_000,
    expectedCloseDate: '2026-06-01',
    terms: {
      kind: 'SPONSORSHIP',
      data: { sponsorshipValue: '$75K', termLength: '12 months', deliverables: 'Logo placement, event presence, digital media' },
    },
    linkedDocs: [],
    milestones: [
      { label: 'Term Sheet Signed', status: 'Not Started' },
      { label: 'Diligence Complete', status: 'Not Started' },
      { label: 'Board Approval', status: 'Not Started' },
      { label: 'Funds Received', status: 'Not Started' },
      { label: 'Close', status: 'Not Started' },
    ],
  },
  {
    id: 'dl-06',
    name: 'Follow-On Investment — Beacon Ventures',
    type: 'EQUITY',
    stage: 'Pending Close',
    status: 'Pending Close',
    lifecycle: 'pipeline',
    counterparty: 'Beacon Ventures',
    structureType: 'SAFE',
    targetValue: 200_000,
    expectedCloseDate: '2026-03-05',
    terms: {
      kind: 'EQUITY',
      data: { valuation: '$8M post-money cap', equityPercent: '2.5%', boardRights: false, liquidationPreference: '1x non-participating' },
    },
    capitalOverview: {
      targetAmount: '$200K',
      committedAmount: '$200K',
      receivedAmount: '$0',
      remaining: '$200K',
    },
    linkedDocs: [
      { type: 'SAFE', label: 'SAFE Agreement — Beacon Ventures' },
      { type: 'Side Letter', label: 'Side Letter — Pro-rata Rights' },
    ],
    milestones: [
      { label: 'Term Sheet Signed', status: 'Completed', date: '2026-02-10' },
      { label: 'Diligence Complete', status: 'Completed', date: '2026-02-20' },
      { label: 'Board Approval', status: 'Completed', date: '2026-02-22' },
      { label: 'Funds Received', status: 'Not Started' },
      { label: 'Close', status: 'Not Started' },
    ],
  },
  {
    id: 'dl-07',
    name: 'Platform Integration — EduConnect',
    type: 'PARTNERSHIP',
    stage: 'Term Sheet',
    status: 'Active',
    lifecycle: 'pipeline',
    counterparty: 'EduConnect Systems',
    structureType: 'Integration Agreement',
    targetValue: 0,
    expectedCloseDate: '2026-04-15',
    terms: {
      kind: 'PARTNERSHIP',
      data: { termLength: '36 months' },
    },
    linkedDocs: [
      { type: 'Term Sheet', label: 'Integration Term Sheet — EduConnect' },
    ],
    milestones: [
      { label: 'Term Sheet Signed', status: 'Completed', date: '2026-02-18' },
      { label: 'Diligence Complete', status: 'Not Started' },
      { label: 'Board Approval', status: 'Not Started' },
      { label: 'Funds Received', status: 'Not Started' },
      { label: 'Close', status: 'Not Started' },
    ],
  },

  // ── ACTIVE DEALS (2) — signed but not fully settled ─────────────
  {
    id: 'dl-08',
    name: 'Seed SAFE — Apex Capital',
    type: 'EQUITY',
    stage: 'Pending Close',
    status: 'Active',
    lifecycle: 'active',
    counterparty: 'Apex Capital',
    structureType: 'SAFE',
    targetValue: 500_000,
    remainingValue: 350_000,
    keyMilestoneDate: '2026-03-15',
    expectedCloseDate: '2026-03-15',
    terms: {
      kind: 'EQUITY',
      data: { valuation: '$8M post-money cap', equityPercent: '6.25%', boardRights: false, liquidationPreference: '1x non-participating' },
    },
    capitalOverview: {
      targetAmount: '$500K',
      committedAmount: '$500K',
      receivedAmount: '$150K',
      remaining: '$350K',
      linkedFinanceObject: 'FIN-SEED-001',
    },
    linkedDocs: [
      { type: 'SAFE', vaultDocId: 'vd-03', label: 'SAFE Agreement — Apex Capital' },
    ],
    milestones: [
      { label: 'Term Sheet Signed', status: 'Completed', date: '2026-01-28' },
      { label: 'Diligence Complete', status: 'Completed', date: '2026-02-15' },
      { label: 'Board Approval', status: 'Completed', date: '2026-02-20' },
      { label: 'Funds Received', status: 'Not Started' },
      { label: 'Close', status: 'Not Started' },
    ],
  },
  {
    id: 'dl-09',
    name: 'AWS Activate — Credits',
    type: 'GRANT',
    stage: 'Pending Close',
    status: 'Active',
    lifecycle: 'active',
    counterparty: 'Amazon Web Services',
    structureType: 'Grant',
    targetValue: 100_000,
    remainingValue: 85_000,
    keyMilestoneDate: '2026-06-30',
    expectedCloseDate: '2026-03-30',
    terms: {
      kind: 'GRANT',
      data: { grantAmount: '$100K in credits', grantingBody: 'AWS Activate', reportingRequirements: 'Quarterly usage report' },
    },
    linkedDocs: [
      { type: 'Term Sheet', label: 'AWS Activate Acceptance Letter' },
    ],
    milestones: [
      { label: 'Term Sheet Signed', status: 'Completed', date: '2026-02-15' },
      { label: 'Diligence Complete', status: 'Completed', date: '2026-02-22' },
      { label: 'Board Approval', status: 'Completed', date: '2026-02-25' },
      { label: 'Funds Received', status: 'Not Started' },
      { label: 'Close', status: 'Not Started' },
    ],
  },

  // ── CLOSED DEALS (2) — fully executed ───────────────────────────
  {
    id: 'dl-10',
    name: 'Founding SAFE — Alex Chen',
    type: 'EQUITY',
    stage: 'Pending Close',
    status: 'Closed',
    lifecycle: 'closed',
    counterparty: 'Alex Chen (Founder)',
    structureType: 'Common Stock',
    targetValue: 0,
    finalValue: 0,
    closeDate: '2026-01-15',
    expectedCloseDate: '2026-01-15',
    terms: {
      kind: 'EQUITY',
      data: { valuation: 'Par value', equityPercent: '85%', boardRights: true, liquidationPreference: 'None (Common)' },
    },
    linkedDocs: [
      { type: 'Board Resolution', vaultDocId: 'vd-12', label: 'Board Consent — Initial Actions' },
    ],
    milestones: [
      { label: 'Term Sheet Signed', status: 'Completed', date: '2026-01-15' },
      { label: 'Diligence Complete', status: 'Completed', date: '2026-01-15' },
      { label: 'Board Approval', status: 'Completed', date: '2026-01-15' },
      { label: 'Funds Received', status: 'Completed', date: '2026-01-15' },
      { label: 'Close', status: 'Completed', date: '2026-01-15' },
    ],
  },
  {
    id: 'dl-11',
    name: 'Office Lease — 500 Innovation Dr',
    type: 'DEBT',
    stage: 'Pending Close',
    status: 'Closed',
    lifecycle: 'closed',
    counterparty: 'Metro Property Management',
    structureType: 'Operating Lease',
    targetValue: 144_000,
    finalValue: 144_000,
    closeDate: '2026-01-25',
    expectedCloseDate: '2026-01-25',
    terms: {
      kind: 'DEBT',
      data: { principal: '$144K (36-month term)', interestRate: 'N/A (lease)', maturityDate: '2029-01-25' },
    },
    linkedDocs: [
      { type: 'Purchase Agreement', vaultDocId: 'vd-09', label: 'Office Lease — 500 Innovation Dr' },
    ],
    milestones: [
      { label: 'Term Sheet Signed', status: 'Completed', date: '2026-01-18' },
      { label: 'Diligence Complete', status: 'Completed', date: '2026-01-20' },
      { label: 'Board Approval', status: 'Completed', date: '2026-01-22' },
      { label: 'Funds Received', status: 'Completed', date: '2026-01-25' },
      { label: 'Close', status: 'Completed', date: '2026-01-25' },
    ],
  },

  // ── ARCHIVE (1) — abandoned/declined ────────────────────────────
  {
    id: 'dl-12',
    name: 'Angel Round — Declined',
    type: 'EQUITY',
    stage: 'In Discussion',
    status: 'Cancelled',
    lifecycle: 'archive',
    counterparty: 'Summit Angels',
    structureType: 'Convertible Note',
    targetValue: 300_000,
    expectedCloseDate: '2026-02-01',
    terms: {
      kind: 'EQUITY',
      data: { valuation: '$6M cap', equityPercent: '5%', boardRights: true, liquidationPreference: '2x participating' },
    },
    linkedDocs: [
      { type: 'Term Sheet', label: 'Term Sheet — Summit Angels (Declined)' },
    ],
    milestones: [
      { label: 'Term Sheet Signed', status: 'Completed', date: '2026-01-10' },
      { label: 'Diligence Complete', status: 'Not Started' },
      { label: 'Board Approval', status: 'Not Started' },
      { label: 'Funds Received', status: 'Not Started' },
      { label: 'Close', status: 'Not Started' },
    ],
  },
];

// =============================================================================
// HELPERS
// =============================================================================

export function formatDealValue(value: number): string {
  if (value === 0) return '--';
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

export function getDealsByLifecycle(lifecycle: DealLifecycle): Deal[] {
  return DEALS.filter((d) => d.lifecycle === lifecycle);
}

export function getPipelineDealsByStage(stage: DealStage): Deal[] {
  return DEALS.filter((d) => d.lifecycle === 'pipeline' && d.stage === stage);
}
