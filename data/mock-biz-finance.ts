/**
 * Mock Business Finance — Data layer for the 14-sub-tab Finance hub.
 * Types + mock data for: Overview, Ledger Truth, Budgets, Commitments,
 * Receivables, Payables, Approvals, Splits, Revenue, Costs/Burn,
 * Entities, Risk/Controls, Audit, Board Pack Builder.
 *
 * All data references KaNeXT entities: Alex M, PBD, Tom, KaNeXT, KaNeXT Church,
 * KaNeXT, KaNeXT Inc, KaNeXT Media LLC, KaNeXT Sports LLC, OSK Group.
 */

// =============================================================================
// SUB-TAB DEFINITION
// =============================================================================

export type FinanceSubTab =
  | 'overview'
  | 'ledger'
  | 'budgets'
  | 'commitments'
  | 'receivables'
  | 'payables'
  | 'approvals'
  | 'splits'
  | 'revenue'
  | 'costs_burn'
  | 'entities'
  | 'risk_controls'
  | 'audit'
  | 'board_pack';

export const FINANCE_SUB_TABS: { id: FinanceSubTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'ledger', label: 'Ledger Truth' },
  { id: 'budgets', label: 'Budgets' },
  { id: 'commitments', label: 'Commitments' },
  { id: 'receivables', label: 'Receivables' },
  { id: 'payables', label: 'Payables' },
  { id: 'approvals', label: 'Approvals & Release' },
  { id: 'splits', label: 'Splits & Earmarks' },
  { id: 'revenue', label: 'Revenue Streams' },
  { id: 'costs_burn', label: 'Costs / Burn / Runway' },
  { id: 'entities', label: 'Entities & Consolidation' },
  { id: 'risk_controls', label: 'Risk / Controls' },
  { id: 'audit', label: 'Audit' },
  { id: 'board_pack', label: 'Board & Investor Pack' },
];

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface FinanceKPI {
  id: string;
  label: string;
  value: string;
  bandedValue: string;
  trend: 'up' | 'down' | 'stable';
  icon: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  category: string;
  debit: number;
  credit: number;
  balance: number;
  entity: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  status: 'on_track' | 'at_risk' | 'over';
}

export interface CommitmentItem {
  id: string;
  title: string;
  counterparty: string;
  amount: string;
  dueDate: string;
  status: 'active' | 'pending' | 'fulfilled';
  type: 'contract' | 'grant' | 'partnership';
}

export interface ReceivableItem {
  id: string;
  from: string;
  amount: string;
  invoiceDate: string;
  dueDate: string;
  status: 'outstanding' | 'overdue' | 'paid';
  daysPastDue?: number;
}

export interface PayableItem {
  id: string;
  to: string;
  amount: string;
  dueDate: string;
  status: 'scheduled' | 'pending_approval' | 'paid' | 'overdue';
  category: string;
}

export interface ApprovalItem {
  id: string;
  title: string;
  amount: string;
  requester: string;
  type: 'expense' | 'payout' | 'budget_change' | 'vendor';
  status: 'pending' | 'approved' | 'rejected';
}

export interface SplitItem {
  id: string;
  entity: string;
  percentage: number;
  amount: string;
  category: string;
}

export interface RevenueItem {
  id: string;
  source: string;
  amount: string;
  period: string;
  type: 'subscription' | 'partnership' | 'service' | 'grant';
  status: 'active' | 'projected';
}

export interface CostItem {
  id: string;
  category: string;
  monthly: string;
  annual: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

export interface EntityFinance {
  id: string;
  name: string;
  type: string;
  cashBalance: string;
  monthlyBurn: string;
  status: 'active' | 'pending';
}

export interface RiskControl {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  mitigation: string;
  owner: string;
  status: 'open' | 'mitigated' | 'accepted';
}

export interface AuditEntry {
  id: string;
  date: string;
  action: string;
  actor: string;
  category: string;
  detail: string;
}

export interface BoardPackSection {
  id: string;
  title: string;
  status: 'complete' | 'in_progress' | 'not_started';
  assignee: string;
  dueDate: string;
}

// =============================================================================
// FINANCE KPIs (6)
// =============================================================================

export const FINANCE_KPIS: FinanceKPI[] = [
  {
    id: 'fkpi-cash',
    label: 'Cash on Hand',
    value: '$142,400',
    bandedValue: '$100K\u2013$200K',
    trend: 'down',
    icon: 'dollarsign.circle.fill',
  },
  {
    id: 'fkpi-burn',
    label: 'Monthly Burn',
    value: '$19,800',
    bandedValue: '<$25K',
    trend: 'down',
    icon: 'flame.fill',
  },
  {
    id: 'fkpi-runway',
    label: 'Runway',
    value: '7.2 months',
    bandedValue: '6\u20139 mo',
    trend: 'stable',
    icon: 'clock.fill',
  },
  {
    id: 'fkpi-receivables',
    label: 'Receivables',
    value: '$45,000',
    bandedValue: '$25K\u2013$50K',
    trend: 'up',
    icon: 'arrow.down.circle.fill',
  },
  {
    id: 'fkpi-commitments',
    label: 'Commitments',
    value: '$234,500',
    bandedValue: '$200K\u2013$300K',
    trend: 'stable',
    icon: 'doc.text.fill',
  },
  {
    id: 'fkpi-budget',
    label: 'Budget Health',
    value: '82% On Track',
    bandedValue: 'Healthy',
    trend: 'up',
    icon: 'chart.pie.fill',
  },
];

// =============================================================================
// LEDGER ENTRIES (8)
// =============================================================================

export const LEDGER_ENTRIES: LedgerEntry[] = [
  {
    id: 'le-1',
    date: '2026-02-17',
    description: 'Mercury ACH deposit \u2014 KaNeXT partnership advance',
    category: 'Revenue',
    debit: 0,
    credit: 25000,
    balance: 142400,
    entity: 'KaNeXT Inc.',
  },
  {
    id: 'le-2',
    date: '2026-02-15',
    description: 'AWS hosting \u2014 February billing cycle',
    category: 'Infrastructure',
    debit: 3200,
    credit: 0,
    balance: 117400,
    entity: 'KaNeXT Inc.',
  },
  {
    id: 'le-3',
    date: '2026-02-14',
    description: 'Contractor payout \u2014 Adriana Ruiz (engineering)',
    category: 'Payroll',
    debit: 8500,
    credit: 0,
    balance: 120600,
    entity: 'KaNeXT Inc.',
  },
  {
    id: 'le-4',
    date: '2026-02-12',
    description: 'OSK Group inter-entity transfer \u2014 media production',
    category: 'Transfer',
    debit: 5000,
    credit: 0,
    balance: 129100,
    entity: 'OSK Group LLC',
  },
  {
    id: 'le-5',
    date: '2026-02-10',
    description: 'KaNeXT Church consulting retainer \u2014 Q1 invoice',
    category: 'Revenue',
    debit: 0,
    credit: 12000,
    balance: 134100,
    entity: 'KaNeXT Inc.',
  },
  {
    id: 'le-6',
    date: '2026-02-08',
    description: 'Stripe subscription revenue \u2014 January batch',
    category: 'Revenue',
    debit: 0,
    credit: 4800,
    balance: 122100,
    entity: 'KaNeXT Media LLC',
  },
  {
    id: 'le-7',
    date: '2026-02-06',
    description: 'Legal retainer \u2014 trademark filing (KaNeXT Sports)',
    category: 'Legal',
    debit: 2500,
    credit: 0,
    balance: 117300,
    entity: 'KaNeXT Sports LLC',
  },
  {
    id: 'le-8',
    date: '2026-02-04',
    description: 'KaNeXT Racing Series sponsorship payment received',
    category: 'Revenue',
    debit: 0,
    credit: 15000,
    balance: 119800,
    entity: 'KaNeXT Sports LLC',
  },
];

// =============================================================================
// BUDGET ITEMS (6)
// =============================================================================

export const BUDGET_ITEMS: BudgetItem[] = [
  {
    id: 'bi-1',
    category: 'Engineering & Product',
    allocated: 60000,
    spent: 42300,
    remaining: 17700,
    status: 'on_track',
  },
  {
    id: 'bi-2',
    category: 'Marketing & Media',
    allocated: 24000,
    spent: 21800,
    remaining: 2200,
    status: 'at_risk',
  },
  {
    id: 'bi-3',
    category: 'Legal & Compliance',
    allocated: 18000,
    spent: 12500,
    remaining: 5500,
    status: 'on_track',
  },
  {
    id: 'bi-4',
    category: 'Operations & Admin',
    allocated: 15000,
    spent: 9800,
    remaining: 5200,
    status: 'on_track',
  },
  {
    id: 'bi-5',
    category: 'Infrastructure (AWS / Hosting)',
    allocated: 12000,
    spent: 12400,
    remaining: -400,
    status: 'over',
  },
  {
    id: 'bi-6',
    category: 'Business Development',
    allocated: 10000,
    spent: 6200,
    remaining: 3800,
    status: 'on_track',
  },
];

// =============================================================================
// COMMITMENTS (5)
// =============================================================================

export const COMMITMENTS: CommitmentItem[] = [
  {
    id: 'cm-1',
    title: 'KaNeXT Athletics Technology Partnership',
    counterparty: 'KaNeXT Sports',
    amount: '$150,000',
    dueDate: '2026-08-01',
    status: 'active',
    type: 'partnership',
  },
  {
    id: 'cm-2',
    title: 'KaNeXT Church Digital Platform Build-Out',
    counterparty: 'Int\u2019l Church of Christ LA',
    amount: '$48,000',
    dueDate: '2026-06-30',
    status: 'active',
    type: 'contract',
  },
  {
    id: 'cm-3',
    title: 'KaNeXT Racing Series Season Integration',
    counterparty: 'KaNeXT Racing',
    amount: '$22,500',
    dueDate: '2026-09-15',
    status: 'pending',
    type: 'partnership',
  },
  {
    id: 'cm-4',
    title: 'PBD Ventures Advisory Grant',
    counterparty: 'Patrick Bet-David / Valuetainment',
    amount: '$10,000',
    dueDate: '2026-03-31',
    status: 'fulfilled',
    type: 'grant',
  },
  {
    id: 'cm-5',
    title: 'Tom Ellsworth Consulting Agreement',
    counterparty: 'Tom Ellsworth',
    amount: '$4,000',
    dueDate: '2026-04-30',
    status: 'active',
    type: 'contract',
  },
];

// =============================================================================
// RECEIVABLES (5)
// =============================================================================

export const RECEIVABLES: ReceivableItem[] = [
  {
    id: 'rv-1',
    from: 'KaNeXT Sports',
    amount: '$25,000',
    invoiceDate: '2026-01-15',
    dueDate: '2026-02-15',
    status: 'overdue',
    daysPastDue: 2,
  },
  {
    id: 'rv-2',
    from: 'Int\u2019l Church of Christ LA',
    amount: '$12,000',
    invoiceDate: '2026-02-01',
    dueDate: '2026-03-01',
    status: 'outstanding',
  },
  {
    id: 'rv-3',
    from: 'KaNeXT Racing Series',
    amount: '$5,000',
    invoiceDate: '2026-02-10',
    dueDate: '2026-03-10',
    status: 'outstanding',
  },
  {
    id: 'rv-4',
    from: 'OSK Group LLC (inter-entity)',
    amount: '$3,000',
    invoiceDate: '2026-01-28',
    dueDate: '2026-02-28',
    status: 'outstanding',
  },
  {
    id: 'rv-5',
    from: 'Alex Morgan (founder loan repayment)',
    amount: '$1,500',
    invoiceDate: '2025-12-01',
    dueDate: '2026-01-31',
    status: 'paid',
  },
];

// =============================================================================
// PAYABLES (5)
// =============================================================================

export const PAYABLES: PayableItem[] = [
  {
    id: 'pa-1',
    to: 'Amazon Web Services',
    amount: '$3,200',
    dueDate: '2026-02-28',
    status: 'scheduled',
    category: 'Infrastructure',
  },
  {
    id: 'pa-2',
    to: 'Adriana Ruiz (Engineering Contractor)',
    amount: '$8,500',
    dueDate: '2026-02-20',
    status: 'pending_approval',
    category: 'Payroll',
  },
  {
    id: 'pa-3',
    to: 'Marcus Chen (Product Contractor)',
    amount: '$7,200',
    dueDate: '2026-02-20',
    status: 'pending_approval',
    category: 'Payroll',
  },
  {
    id: 'pa-4',
    to: 'Legal Counsel \u2014 Trademark Filing',
    amount: '$2,500',
    dueDate: '2026-02-17',
    status: 'overdue',
    category: 'Legal',
  },
  {
    id: 'pa-5',
    to: 'KaNeXT Media LLC (inter-entity)',
    amount: '$5,000',
    dueDate: '2026-03-01',
    status: 'scheduled',
    category: 'Transfer',
  },
];

// =============================================================================
// APPROVALS (5)
// =============================================================================

export const APPROVALS: ApprovalItem[] = [
  {
    id: 'ap-1',
    title: 'Vendor payout batch \u2014 February contractors',
    amount: '$48,200',
    requester: 'David Okonkwo',
    type: 'payout',
    status: 'pending',
  },
  {
    id: 'ap-2',
    title: 'AWS infrastructure upgrade \u2014 GPU tier',
    amount: '$1,800',
    requester: 'Adriana Ruiz',
    type: 'expense',
    status: 'pending',
  },
  {
    id: 'ap-3',
    title: 'Marketing budget reallocation Q1 \u2192 Q2',
    amount: '$6,000',
    requester: 'Jordan Hayes',
    type: 'budget_change',
    status: 'pending',
  },
  {
    id: 'ap-4',
    title: 'New vendor onboarding \u2014 Figma Enterprise',
    amount: '$2,400',
    requester: 'Lisa Park',
    type: 'vendor',
    status: 'approved',
  },
  {
    id: 'ap-5',
    title: 'Travel expense \u2014 PBD meeting (Miami)',
    amount: '$1,200',
    requester: 'Alex Morgan',
    type: 'expense',
    status: 'rejected',
  },
];

// =============================================================================
// SPLITS (4)
// =============================================================================

export const SPLITS: SplitItem[] = [
  {
    id: 'sp-1',
    entity: 'KaNeXT Inc.',
    percentage: 55,
    amount: '$78,320',
    category: 'Core Platform & Engineering',
  },
  {
    id: 'sp-2',
    entity: 'OSK Group LLC',
    percentage: 20,
    amount: '$28,480',
    category: 'Holding & Operations',
  },
  {
    id: 'sp-3',
    entity: 'KaNeXT Media LLC',
    percentage: 15,
    amount: '$21,360',
    category: 'Media & Content Production',
  },
  {
    id: 'sp-4',
    entity: 'KaNeXT Sports LLC',
    percentage: 10,
    amount: '$14,240',
    category: 'Sports Partnerships & Licensing',
  },
];

// =============================================================================
// REVENUE ITEMS (5)
// =============================================================================

export const REVENUE_ITEMS: RevenueItem[] = [
  {
    id: 're-1',
    source: 'KaNeXT Athletics Technology Partnership',
    amount: '$12,500/mo',
    period: 'Monthly (24-mo term)',
    type: 'partnership',
    status: 'active',
  },
  {
    id: 're-2',
    source: 'KaNeXT Church Digital Platform Retainer',
    amount: '$4,000/mo',
    period: 'Monthly (12-mo term)',
    type: 'service',
    status: 'active',
  },
  {
    id: 're-3',
    source: 'Stripe SaaS Subscriptions',
    amount: '$4,800/mo',
    period: 'Monthly (recurring)',
    type: 'subscription',
    status: 'active',
  },
  {
    id: 're-4',
    source: 'KaNeXT Racing Integration License',
    amount: '$22,500',
    period: 'Annual (projected Y1)',
    type: 'partnership',
    status: 'projected',
  },
  {
    id: 're-5',
    source: 'PBD Ventures Advisory Grant',
    amount: '$10,000',
    period: 'One-time',
    type: 'grant',
    status: 'active',
  },
];

// =============================================================================
// COST ITEMS (6)
// =============================================================================

export const COST_ITEMS: CostItem[] = [
  {
    id: 'ci-1',
    category: 'Engineering & Product',
    monthly: '$8,500',
    annual: '$102,000',
    trend: 'stable',
    percentage: 43,
  },
  {
    id: 'ci-2',
    category: 'Infrastructure (AWS / Hosting)',
    monthly: '$3,200',
    annual: '$38,400',
    trend: 'up',
    percentage: 16,
  },
  {
    id: 'ci-3',
    category: 'Marketing & Media',
    monthly: '$3,600',
    annual: '$43,200',
    trend: 'down',
    percentage: 18,
  },
  {
    id: 'ci-4',
    category: 'Legal & Compliance',
    monthly: '$2,100',
    annual: '$25,200',
    trend: 'stable',
    percentage: 11,
  },
  {
    id: 'ci-5',
    category: 'Operations & Admin',
    monthly: '$1,600',
    annual: '$19,200',
    trend: 'down',
    percentage: 8,
  },
  {
    id: 'ci-6',
    category: 'Business Development',
    monthly: '$800',
    annual: '$9,600',
    trend: 'up',
    percentage: 4,
  },
];

// =============================================================================
// ENTITY FINANCES (4)
// =============================================================================

export const ENTITY_FINANCES: EntityFinance[] = [
  {
    id: 'ef-1',
    name: 'KaNeXT Inc.',
    type: 'C-Corp',
    cashBalance: '$89,200',
    monthlyBurn: '$12,400',
    status: 'active',
  },
  {
    id: 'ef-2',
    name: 'OSK Group LLC',
    type: 'LLC',
    cashBalance: '$31,600',
    monthlyBurn: '$3,800',
    status: 'active',
  },
  {
    id: 'ef-3',
    name: 'KaNeXT Media LLC',
    type: 'LLC',
    cashBalance: '$16,400',
    monthlyBurn: '$2,200',
    status: 'active',
  },
  {
    id: 'ef-4',
    name: 'KaNeXT Sports LLC',
    type: 'LLC',
    cashBalance: '$5,200',
    monthlyBurn: '$1,400',
    status: 'pending',
  },
];

// =============================================================================
// RISK / CONTROLS (5)
// =============================================================================

export const RISK_CONTROLS: RiskControl[] = [
  {
    id: 'rc-1',
    title: 'Payment rails KYC not finalized',
    severity: 'critical',
    category: 'Compliance',
    mitigation: 'Complete Mercury KYC verification by Feb 20',
    owner: 'David Okonkwo',
    status: 'open',
  },
  {
    id: 'rc-2',
    title: 'Single-entity cash concentration risk',
    severity: 'high',
    category: 'Treasury',
    mitigation: 'Diversify across entities; maintain 3-month reserves per entity',
    owner: 'Alex Morgan',
    status: 'open',
  },
  {
    id: 'rc-3',
    title: 'KaNeXT contract renewal uncertainty',
    severity: 'medium',
    category: 'Revenue',
    mitigation: 'Quarterly check-ins with KaNeXT athletic director; performance reports',
    owner: 'Jordan Hayes',
    status: 'mitigated',
  },
  {
    id: 'rc-4',
    title: 'Contractor classification audit exposure',
    severity: 'high',
    category: 'Legal',
    mitigation: 'Engage employment counsel for 1099 vs W-2 review',
    owner: 'Alex Morgan',
    status: 'open',
  },
  {
    id: 'rc-5',
    title: 'KaNeXT Sports LLC formation incomplete',
    severity: 'low',
    category: 'Corporate',
    mitigation: 'File operating agreement and EIN application by March 1',
    owner: 'Tom Ellsworth',
    status: 'accepted',
  },
];

// =============================================================================
// AUDIT LOG (8)
// =============================================================================

export const AUDIT_LOG: AuditEntry[] = [
  {
    id: 'au-1',
    date: '2026-02-17 09:14',
    action: 'Budget reallocation submitted',
    actor: 'Jordan Hayes',
    category: 'Budget',
    detail: 'Marketing budget $6K reallocation Q1 to Q2 submitted for approval',
  },
  {
    id: 'au-2',
    date: '2026-02-16 16:42',
    action: 'Vendor payout batch created',
    actor: 'David Okonkwo',
    category: 'Payables',
    detail: 'February contractor batch $48,200 created \u2014 pending Alex M. approval',
  },
  {
    id: 'au-3',
    date: '2026-02-15 11:03',
    action: 'Invoice generated',
    actor: 'Alex Morgan',
    category: 'Receivables',
    detail: 'Invoice INV-2026-018 sent to KaNeXT for $25,000 partnership advance',
  },
  {
    id: 'au-4',
    date: '2026-02-14 14:20',
    action: 'Expense approved',
    actor: 'Alex Morgan',
    category: 'Approvals',
    detail: 'Figma Enterprise vendor onboarding $2,400/yr approved for Lisa Park',
  },
  {
    id: 'au-5',
    date: '2026-02-12 10:55',
    action: 'Inter-entity transfer executed',
    actor: 'David Okonkwo',
    category: 'Treasury',
    detail: '$5,000 transferred from KaNeXT Inc. to OSK Group LLC for media production',
  },
  {
    id: 'au-6',
    date: '2026-02-10 08:30',
    action: 'Risk item flagged',
    actor: 'Tom Ellsworth',
    category: 'Risk',
    detail: 'KaNeXT Sports LLC formation incomplete \u2014 accepted risk until March',
  },
  {
    id: 'au-7',
    date: '2026-02-08 15:18',
    action: 'Board pack section completed',
    actor: 'Alex Morgan',
    category: 'Board Pack',
    detail: 'Financial Summary section marked complete for Q1 board meeting',
  },
  {
    id: 'au-8',
    date: '2026-02-06 12:45',
    action: 'Commitment recorded',
    actor: 'Jordan Hayes',
    category: 'Commitments',
    detail: 'KaNeXT Racing Series integration partnership \u2014 $22,500 pending countersign',
  },
];

// =============================================================================
// BOARD PACK SECTIONS (6)
// =============================================================================

export const BOARD_PACK_SECTIONS: BoardPackSection[] = [
  {
    id: 'bp-1',
    title: 'Financial Summary & Cash Position',
    status: 'complete',
    assignee: 'Alex Morgan',
    dueDate: '2026-02-18',
  },
  {
    id: 'bp-2',
    title: 'Product & Engineering Update',
    status: 'complete',
    assignee: 'Marcus Chen',
    dueDate: '2026-02-18',
  },
  {
    id: 'bp-3',
    title: 'Revenue Pipeline & Traction Metrics',
    status: 'in_progress',
    assignee: 'Jordan Hayes',
    dueDate: '2026-02-19',
  },
  {
    id: 'bp-4',
    title: 'Risk Register & Compliance Status',
    status: 'in_progress',
    assignee: 'David Okonkwo',
    dueDate: '2026-02-19',
  },
  {
    id: 'bp-5',
    title: 'Entity Structure & Corporate Governance',
    status: 'not_started',
    assignee: 'Tom Ellsworth',
    dueDate: '2026-02-20',
  },
  {
    id: 'bp-6',
    title: 'Media/Proof Wedge Performance Deck',
    status: 'not_started',
    assignee: 'Alex Morgan',
    dueDate: '2026-02-20',
  },
];

// =============================================================================
// TXN STATE MACHINE
// =============================================================================

export const TXN_STATES = [
  'Draft', 'Proposed', 'Rule-Checked', 'Authorized', 'Scheduled',
  'Released', 'In Flight', 'Settled', 'Held', 'Failed',
  'Disputed', 'Reversed',
] as const;
export type TxnState = typeof TXN_STATES[number];

// =============================================================================
// RELEASE QUEUE
// =============================================================================

export interface ReleaseQueueItem {
  id: string;
  title: string;
  amount: string;
  approvedBy: string;
  approvedAt: string;
  releaseAuthority: string;
  status: 'awaiting_release' | 'released';
}

export const RELEASE_QUEUE: ReleaseQueueItem[] = [
  { id: 'rq-1', title: 'Vendor payout — Design agency', amount: '$12,500', approvedBy: 'Alex M.', approvedAt: 'Feb 15', releaseAuthority: 'Treasury', status: 'awaiting_release' },
  { id: 'rq-2', title: 'Contractor payment — Q1 sprint', amount: '$8,200', approvedBy: 'Alex M.', approvedAt: 'Feb 14', releaseAuthority: 'Treasury', status: 'awaiting_release' },
  { id: 'rq-3', title: 'SaaS subscription — Annual', amount: '$4,800', approvedBy: 'Finance', approvedAt: 'Feb 13', releaseAuthority: 'Ops', status: 'released' },
];

// =============================================================================
// EARMARKS
// =============================================================================

export interface EarmarkItem {
  id: string;
  label: string;
  amount: string;
  entity: string;
  purpose: string;
  expiresAt: string;
}

export const EARMARKS: EarmarkItem[] = [
  { id: 'em-1', label: 'Series A Legal Reserve', amount: '$25,000', entity: 'KaNeXT Inc.', purpose: 'Legal fees for Series A close', expiresAt: 'Mar 31' },
  { id: 'em-2', label: 'Q2 Marketing Budget', amount: '$15,000', entity: 'KaNeXT Inc.', purpose: 'Earmarked for Q2 campaign spend', expiresAt: 'Jun 30' },
];

// =============================================================================
// TRUTH STRIP KPIS
// =============================================================================

export interface TruthStripKPI {
  id: string;
  label: string;
  value: string;
  icon: string;
}

export const TRUTH_STRIP_KPIS: TruthStripKPI[] = [
  { id: 'ts-cash', label: 'Cash', value: '$142K', icon: 'dollarsign.circle.fill' },
  { id: 'ts-auth', label: 'Auth\'d Not Settled', value: '$18.2K', icon: 'clock.fill' },
  { id: 'ts-recv', label: 'Receivables', value: '$34.5K', icon: 'arrow.down.circle.fill' },
  { id: 'ts-pay', label: 'Payables', value: '$22.1K', icon: 'arrow.up.circle.fill' },
  { id: 'ts-blocked', label: 'Rule-Blocked', value: '2', icon: 'exclamationmark.triangle.fill' },
  { id: 'ts-audit', label: 'Audit Score', value: '94%', icon: 'checkmark.shield.fill' },
];

// =============================================================================
// RBAC HELPERS — Sub-tab filtering by role
// =============================================================================

/** B2b sees a subset: overview, budgets, revenue, entities, board_pack */
const B2B_FINANCE_TABS: FinanceSubTab[] = [
  'overview',
  'budgets',
  'revenue',
  'entities',
  'board_pack',
];

/** B2a sees overview only */
const B2A_FINANCE_TABS: FinanceSubTab[] = ['overview'];

/**
 * Returns the list of finance sub-tabs visible for a given role.
 * B1: all 14 sub-tabs
 * B2b: 5 sub-tabs (overview, budgets, revenue, entities, board_pack)
 * B2a: 1 sub-tab (overview — with banded values)
 * B3/B4/B5: empty (finance tab is locked)
 */
export function getFinanceSubTabs(
  role: string,
): { id: FinanceSubTab; label: string }[] {
  switch (role) {
    case 'B1':
      return FINANCE_SUB_TABS;
    case 'B2b':
      return FINANCE_SUB_TABS.filter((t) => B2B_FINANCE_TABS.includes(t.id));
    case 'B2a':
      return FINANCE_SUB_TABS.filter((t) => B2A_FINANCE_TABS.includes(t.id));
    default:
      return [];
  }
}
