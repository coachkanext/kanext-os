/**
 * Education Organization Finance — Mock Data & Types
 * Term-based budgets, receivables, payables, financial aid, ledger postings, audit trail.
 */

// =============================================================================
// TYPES
// =============================================================================

export type EduFundType =
  | 'operating'
  | 'tuition_revenue'
  | 'housing_revenue'
  | 'financial_aid'
  | 'athletics'
  | 'restricted_grants'
  | 'endowment'
  | 'auxiliary';

export type ReceivableType =
  | 'tuition'
  | 'fees'
  | 'housing'
  | 'meal_plan'
  | 'parking'
  | 'lab_fees'
  | 'deposit'
  | 'library_fines';

export type PayableType =
  | 'vendor'
  | 'contractor'
  | 'payroll'
  | 'utilities'
  | 'insurance'
  | 'equipment'
  | 'services'
  | 'travel';

export type AidType =
  | 'merit'
  | 'need'
  | 'athletic'
  | 'pell'
  | 'state'
  | 'external'
  | 'work_study';

export type PostingState =
  | 'posted'
  | 'pending'
  | 'held'
  | 'reversed'
  | 'adjusting';

export type ApprovalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'escalated';

export type AuditEvidenceStatus =
  | 'complete'
  | 'partial'
  | 'missing'
  | 'flagged';

export type TermWindow =
  | 'fall_2025'
  | 'spring_2026'
  | 'summer_2026';

// =============================================================================
// INTERFACES
// =============================================================================

export interface EduFinanceTruthStrip {
  cashPosition: number;
  commitments: number;
  receivables: number;
  payables: number;
  holds: number;
  auditCompleteness: number;
}

export interface TermSnapshot {
  id: string;
  institution: string;
  term: TermWindow;
  enrollment: number;
  tuitionRevenue: number;
  aidDisbursed: number;
  housingRevenue: number;
  auxiliaryRevenue: number;
  operatingExpenses: number;
  netPosition: number;
}

export interface NeedsDecisionItem {
  id: string;
  title: string;
  amount: number;
  category: string;
  urgency: 'high' | 'medium' | 'low';
  dueDate: string;
  owner: string;
  description: string;
}

export interface BudgetLineItem {
  id: string;
  name: string;
  category: string;
  budgeted: number;
  spent: number;
  committed: number;
  hardCap: boolean;
}

export interface DepartmentBudget {
  id: string;
  department: string;
  institution: string;
  fundType: EduFundType;
  period: string;
  lineItems: BudgetLineItem[];
  totalBudgeted: number;
  totalSpent: number;
  totalCommitted: number;
  forecastBurn: number;
  varianceNote: string;
}

export interface LedgerPosting {
  id: string;
  date: string;
  description: string;
  fundType: EduFundType;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  state: PostingState;
  explainChain: string[];
  postedBy: string;
  institution: string;
}

export interface Receivable {
  id: string;
  studentName: string;
  studentId: string;
  type: ReceivableType;
  amount: number;
  dueDate: string;
  status: 'outstanding' | 'partial' | 'paid' | 'overdue' | 'waived';
  institution: string;
  term: TermWindow;
  holdFlag: boolean;
  holdReason?: string;
}

export interface Payable {
  id: string;
  vendorName: string;
  type: PayableType;
  amount: number;
  dueDate: string;
  status: 'pending' | 'approved' | 'scheduled' | 'paid' | 'held';
  fundType: EduFundType;
  institution: string;
  docsComplete: number;
  docsRequired: number;
  approvalChain: { name: string; status: ApprovalStatus }[];
}

export interface AidAward {
  id: string;
  studentName: string;
  studentId: string;
  aidType: AidType;
  amount: number;
  term: TermWindow;
  institution: string;
  eligibilityRules: string[];
  disbursementDate: string;
  disbursed: boolean;
  complianceTags: string[];
}

export interface FinanceApprovalItem {
  id: string;
  title: string;
  amount: number;
  fundType: EduFundType;
  requestor: string;
  approverSeat: string;
  status: ApprovalStatus;
  dueDate: string;
}

export interface AuditRecord {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: string;
  evidenceStatus: AuditEvidenceStatus;
  policyException: boolean;
}

export interface ExceptionRiskItem {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  category: string;
  description: string;
  owner: string;
  createdAt: string;
}

// =============================================================================
// CONSTANTS — Labels & Colors
// =============================================================================

export const EDU_FUND_TYPE_LABELS: Record<EduFundType, string> = {
  operating: 'Operating',
  tuition_revenue: 'Tuition Revenue',
  housing_revenue: 'Housing Revenue',
  financial_aid: 'Financial Aid',
  athletics: 'Athletics',
  restricted_grants: 'Restricted Grants',
  endowment: 'Endowment',
  auxiliary: 'Auxiliary',
};

export const EDU_FUND_TYPE_COLORS: Record<EduFundType, string> = {
  operating: '#22C55E',
  tuition_revenue: '#6AA9FF',
  housing_revenue: '#8B5CF6',
  financial_aid: '#F59E0B',
  athletics: '#EF4444',
  restricted_grants: '#EC4899',
  endowment: '#10B981',
  auxiliary: '#F97316',
};

export const RECEIVABLE_TYPE_LABELS: Record<ReceivableType, string> = {
  tuition: 'Tuition',
  fees: 'Fees',
  housing: 'Housing',
  meal_plan: 'Meal Plan',
  parking: 'Parking',
  lab_fees: 'Lab Fees',
  deposit: 'Deposit',
  library_fines: 'Library Fines',
};

export const RECEIVABLE_TYPE_COLORS: Record<ReceivableType, string> = {
  tuition: '#3B82F6',
  fees: '#8B5CF6',
  housing: '#10B981',
  meal_plan: '#F97316',
  parking: '#8F8F8F',
  lab_fees: '#EC4899',
  deposit: '#22C55E',
  library_fines: '#EF4444',
};

export const PAYABLE_TYPE_LABELS: Record<PayableType, string> = {
  vendor: 'Vendor',
  contractor: 'Contractor',
  payroll: 'Payroll',
  utilities: 'Utilities',
  insurance: 'Insurance',
  equipment: 'Equipment',
  services: 'Services',
  travel: 'Travel',
};

export const PAYABLE_TYPE_COLORS: Record<PayableType, string> = {
  vendor: '#6AA9FF',
  contractor: '#F59E0B',
  payroll: '#22C55E',
  utilities: '#8B5CF6',
  insurance: '#EC4899',
  equipment: '#F97316',
  services: '#10B981',
  travel: '#3B82F6',
};

export const AID_TYPE_LABELS: Record<AidType, string> = {
  merit: 'Merit',
  need: 'Need-Based',
  athletic: 'Athletic',
  pell: 'Pell Grant',
  state: 'State Grant',
  external: 'External',
  work_study: 'Work-Study',
};

export const AID_TYPE_COLORS: Record<AidType, string> = {
  merit: '#22C55E',
  need: '#6AA9FF',
  athletic: '#EF4444',
  pell: '#8B5CF6',
  state: '#F59E0B',
  external: '#10B981',
  work_study: '#F97316',
};

export const POSTING_STATE_LABELS: Record<PostingState, string> = {
  posted: 'Posted',
  pending: 'Pending',
  held: 'Held',
  reversed: 'Reversed',
  adjusting: 'Adjusting',
};

export const POSTING_STATE_COLORS: Record<PostingState, string> = {
  posted: '#22C55E',
  pending: '#F59E0B',
  held: '#EF4444',
  reversed: '#8F8F8F',
  adjusting: '#6AA9FF',
};

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  escalated: 'Escalated',
};

export const APPROVAL_STATUS_COLORS: Record<ApprovalStatus, string> = {
  pending: '#F59E0B',
  approved: '#22C55E',
  rejected: '#DC2626',
  escalated: '#EC4899',
};

export const AUDIT_EVIDENCE_LABELS: Record<AuditEvidenceStatus, string> = {
  complete: 'Complete',
  partial: 'Partial',
  missing: 'Missing',
  flagged: 'Flagged',
};

export const AUDIT_EVIDENCE_COLORS: Record<AuditEvidenceStatus, string> = {
  complete: '#22C55E',
  partial: '#F59E0B',
  missing: '#EF4444',
  flagged: '#DC2626',
};

export const TERM_WINDOW_LABELS: Record<TermWindow, string> = {
  fall_2025: 'Fall 2025',
  spring_2026: 'Spring 2026',
  summer_2026: 'Summer 2026',
};

// =============================================================================
// SEEDED DATA — Truth Strip
// =============================================================================

const TRUTH_STRIP: EduFinanceTruthStrip = {
  cashPosition: 4300000,
  commitments: 1100000,
  receivables: 3700000,
  payables: 890000,
  holds: 47,
  auditCompleteness: 88,
};

// =============================================================================
// SEEDED DATA — Term Snapshots
// =============================================================================

const TERM_SNAPSHOTS: TermSnapshot[] = [
  {
    id: 'ts-001',
    institution: 'KaNeXT Sports',
    term: 'spring_2026',
    enrollment: 1850,
    tuitionRevenue: 8200000,
    aidDisbursed: 5400000,
    housingRevenue: 2100000,
    auxiliaryRevenue: 680000,
    operatingExpenses: 6800000,
    netPosition: 4200000,
  },
];

// =============================================================================
// SEEDED DATA — Needs Decision Items
// =============================================================================

const NEEDS_DECISION: NeedsDecisionItem[] = [
  {
    id: 'nd-001',
    title: 'Lab Equipment Bid',
    amount: 185000,
    category: 'Capital Expenditure',
    urgency: 'high',
    dueDate: '2026-02-25',
    owner: 'VP Finance',
    description: 'Three vendor bids received for Chemistry Lab renovation. Board approval required for capital expenditure.',
  },
  {
    id: 'nd-002',
    title: 'Refund Batch Processing',
    amount: 42300,
    category: 'Student Accounts',
    urgency: 'high',
    dueDate: '2026-02-20',
    owner: 'Bursar',
    description: 'Spring semester withdrawal refunds for 23 students per refund schedule.',
  },
  {
    id: 'nd-003',
    title: 'Vendor Invoice Dispute',
    amount: 28500,
    category: 'Procurement',
    urgency: 'medium',
    dueDate: '2026-03-01',
    owner: 'Procurement',
    description: 'Johnson Controls HVAC invoice exceeds contract terms by 15%.',
  },
  {
    id: 'nd-004',
    title: 'Grant Disbursement',
    amount: 125000,
    category: 'Grants',
    urgency: 'medium',
    dueDate: '2026-03-15',
    owner: 'Grants Office',
    description: 'Title III Part B restricted grant quarterly disbursement requires compliance sign-off.',
  },
  {
    id: 'nd-005',
    title: 'Meal Plan Credits',
    amount: 8750,
    category: 'Auxiliary Services',
    urgency: 'low',
    dueDate: '2026-03-30',
    owner: 'Auxiliary Services',
    description: 'Unused meal plan credits from fall 2025 require rollover or refund determination.',
  },
];

// =============================================================================
// SEEDED DATA — Department Budgets
// =============================================================================

const DEPARTMENT_BUDGETS: DepartmentBudget[] = [
  {
    id: 'db-001',
    department: 'Science Division',
    institution: 'KaNeXT Sports',
    fundType: 'operating',
    period: 'Annual FY 2025-2026',
    lineItems: [
      { id: 'db-001-li-01', name: 'Lab Supplies', category: 'Supplies', budgeted: 120000, spent: 58000, committed: 12000, hardCap: true },
      { id: 'db-001-li-02', name: 'Equipment Maintenance', category: 'Maintenance', budgeted: 85000, spent: 42000, committed: 15000, hardCap: true },
      { id: 'db-001-li-03', name: 'Adjunct Faculty', category: 'Personnel', budgeted: 280000, spent: 140000, committed: 65000, hardCap: false },
      { id: 'db-001-li-04', name: 'Research Materials', category: 'Academic', budgeted: 95000, spent: 38000, committed: 22000, hardCap: false },
      { id: 'db-001-li-05', name: 'Student Assistants', category: 'Personnel', budgeted: 45000, spent: 22000, committed: 8000, hardCap: true },
    ],
    totalBudgeted: 1200000,
    totalSpent: 580000,
    totalCommitted: 180000,
    forecastBurn: 85,
    varianceNote: 'Adjunct faculty costs trending higher than budget due to mid-year course additions.',
  },
  {
    id: 'db-003',
    department: 'Athletics',
    institution: 'KaNeXT Sports',
    fundType: 'athletics',
    period: 'Annual FY 2025-2026',
    lineItems: [
      { id: 'db-003-li-01', name: 'Team Travel', category: 'Travel', budgeted: 450000, spent: 280000, committed: 85000, hardCap: true },
      { id: 'db-003-li-02', name: 'Equipment', category: 'Equipment', budgeted: 320000, spent: 165000, committed: 42000, hardCap: true },
      { id: 'db-003-li-03', name: 'Scholarships', category: 'Financial Aid', budgeted: 1200000, spent: 600000, committed: 180000, hardCap: true },
      { id: 'db-003-li-04', name: 'Game Operations', category: 'Operations', budgeted: 180000, spent: 95000, committed: 22000, hardCap: false },
      { id: 'db-003-li-05', name: 'Medical/Training', category: 'Health', budgeted: 120000, spent: 58000, committed: 15000, hardCap: true },
    ],
    totalBudgeted: 2800000,
    totalSpent: 1400000,
    totalCommitted: 380000,
    forecastBurn: 92,
    varianceNote: 'Travel costs exceeding projections due to SIAC conference schedule changes. Risk of overrun.',
  },
];

// =============================================================================
// SEEDED DATA — Ledger Postings
// =============================================================================

const LEDGER_POSTINGS: LedgerPosting[] = [
  {
    id: 'lp-001',
    date: '2026-02-03',
    description: 'Spring 2026 Tuition Revenue Recognition — Batch 4',
    fundType: 'tuition_revenue',
    debitAccount: '1100 — Student Accounts Receivable',
    creditAccount: '4010 — Tuition Revenue',
    amount: 245000,
    state: 'posted',
    explainChain: [
      'Registrar confirmed enrollment for batch 4 (82 students)',
      'Student accounts billed per approved tuition schedule',
      'Revenue recognized upon census date confirmation',
    ],
    postedBy: 'Bursar Office',
    institution: 'KaNeXT Sports',
  },
  {
    id: 'lp-003',
    date: '2026-02-07',
    description: 'Sodexo Food Service — February Contract Payment',
    fundType: 'auxiliary',
    debitAccount: '6300 — Food Service Expense',
    creditAccount: '2000 — Accounts Payable',
    amount: 38500,
    state: 'posted',
    explainChain: [
      'Monthly food service contract per agreement #SOD-2024-118',
      'Invoice verified against meal count reports',
      'Payment approved by Auxiliary Services Director',
    ],
    postedBy: 'Accounts Payable',
    institution: 'KaNeXT Sports',
  },
  {
    id: 'lp-005',
    date: '2026-02-12',
    description: 'Lab Equipment Purchase Order — Chemistry Department',
    fundType: 'operating',
    debitAccount: '1500 — Equipment (Capital)',
    creditAccount: '2000 — Accounts Payable',
    amount: 45000,
    state: 'pending',
    explainChain: [
      'Purchase order PO-2026-0412 approved by department chair',
      'Vendor: Fisher Scientific — Quote #FS-88412',
      'Awaiting VP Finance signature for capital expenditure threshold',
    ],
    postedBy: 'Procurement Office',
    institution: 'KaNeXT Sports',
  },
  {
    id: 'lp-006',
    date: '2026-02-08',
    description: 'Athletic Travel Advance — Men\'s Basketball Road Trip',
    fundType: 'athletics',
    debitAccount: '1200 — Travel Advances',
    creditAccount: '1000 — Operating Cash',
    amount: 8200,
    state: 'held',
    explainChain: [
      'Travel advance issued for SIAC road games Feb 14-16',
      'Advance held — missing itemized hotel receipts from prior trip',
      'Coach Williams notified to submit documentation by Feb 18',
    ],
    postedBy: 'Athletic Business Office',
    institution: 'KaNeXT Sports',
  },
];

// =============================================================================
// SEEDED DATA — Receivables
// =============================================================================

const RECEIVABLES: Receivable[] = [
  {
    id: 'rcv-001',
    studentName: 'Jasmine Washington',
    studentId: 'KaNeXT-2024-1187',
    type: 'tuition',
    amount: 12450,
    dueDate: '2026-02-15',
    status: 'outstanding',
    institution: 'KaNeXT Sports',
    term: 'spring_2026',
    holdFlag: false,
  },
  {
    id: 'rcv-003',
    studentName: 'Aisha Johnson',
    studentId: 'KaNeXT-2025-0291',
    type: 'fees',
    amount: 850,
    dueDate: '2026-01-20',
    status: 'overdue',
    institution: 'KaNeXT Sports',
    term: 'spring_2026',
    holdFlag: false,
  },
  {
    id: 'rcv-006',
    studentName: 'Tyler Davis',
    studentId: 'KaNeXT-2024-0773',
    type: 'lab_fees',
    amount: 450,
    dueDate: '2026-01-25',
    status: 'paid',
    institution: 'KaNeXT Sports',
    term: 'spring_2026',
    holdFlag: false,
  },
  {
    id: 'rcv-008',
    studentName: 'Jordan Mitchell',
    studentId: 'KaNeXT-2024-0956',
    type: 'parking',
    amount: 275,
    dueDate: '2026-02-15',
    status: 'outstanding',
    institution: 'KaNeXT Sports',
    term: 'spring_2026',
    holdFlag: false,
  },
];

// =============================================================================
// SEEDED DATA — Payables
// =============================================================================

const PAYABLES: Payable[] = [
  {
    id: 'pay-002',
    vendorName: 'Sodexo',
    type: 'services',
    amount: 38500,
    dueDate: '2026-02-28',
    status: 'scheduled',
    fundType: 'auxiliary',
    institution: 'KaNeXT Sports',
    docsComplete: 5,
    docsRequired: 5,
    approvalChain: [
      { name: 'Auxiliary Services Director', status: 'approved' },
      { name: 'VP Finance', status: 'approved' },
    ],
  },
  {
    id: 'pay-004',
    vendorName: 'ADP',
    type: 'services',
    amount: 12800,
    dueDate: '2026-02-15',
    status: 'paid',
    fundType: 'operating',
    institution: 'KaNeXT Sports',
    docsComplete: 5,
    docsRequired: 5,
    approvalChain: [
      { name: 'HR Director', status: 'approved' },
      { name: 'Controller', status: 'approved' },
    ],
  },
  {
    id: 'pay-006',
    vendorName: 'Campus Security Inc.',
    type: 'contractor',
    amount: 22400,
    dueDate: '2026-02-28',
    status: 'approved',
    fundType: 'operating',
    institution: 'KaNeXT Sports',
    docsComplete: 4,
    docsRequired: 5,
    approvalChain: [
      { name: 'VP Student Affairs', status: 'approved' },
      { name: 'VP Finance', status: 'approved' },
      { name: 'Controller', status: 'pending' },
    ],
  },
];

// =============================================================================
// SEEDED DATA — Aid Awards
// =============================================================================

const AID_AWARDS: AidAward[] = [
  {
    id: 'aid-001',
    studentName: 'Jasmine Washington',
    studentId: 'KaNeXT-2024-1187',
    aidType: 'merit',
    amount: 8000,
    term: 'spring_2026',
    institution: 'KaNeXT Sports',
    eligibilityRules: ['GPA >= 3.5', 'Full-time enrollment', 'Satisfactory academic progress'],
    disbursementDate: '2026-01-15',
    disbursed: true,
    complianceTags: ['Title IV compliant', 'SAP verified', 'Enrollment confirmed'],
  },
  {
    id: 'aid-005',
    studentName: 'Tyler Davis',
    studentId: 'KaNeXT-2024-0773',
    aidType: 'external',
    amount: 2500,
    term: 'spring_2026',
    institution: 'KaNeXT Sports',
    eligibilityRules: ['External scholarship letter on file', 'Enrolled full-time', 'No duplicate awards'],
    disbursementDate: '2026-02-15',
    disbursed: false,
    complianceTags: ['External fund verification pending', 'Scholarship letter received'],
  },
  {
    id: 'aid-006',
    studentName: 'Jordan Mitchell',
    studentId: 'KaNeXT-2024-0956',
    aidType: 'work_study',
    amount: 1800,
    term: 'spring_2026',
    institution: 'KaNeXT Sports',
    eligibilityRules: ['FWS allocation on file', 'FAFSA on file', 'Enrolled >= half-time', 'Position assignment active'],
    disbursementDate: '2026-01-22',
    disbursed: true,
    complianceTags: ['FWS compliant', 'Biweekly payroll active', 'Hours tracking current'],
  },
];

// =============================================================================
// SEEDED DATA — Approval Items
// =============================================================================

const APPROVAL_ITEMS: FinanceApprovalItem[] = [
  {
    id: 'appr-001',
    title: 'Chemistry Lab Equipment — Fisher Scientific',
    amount: 185000,
    fundType: 'operating',
    requestor: 'Science Division Chair',
    approverSeat: 'VP Finance',
    status: 'pending',
    dueDate: '2026-02-25',
  },
  {
    id: 'appr-002',
    title: 'Men\'s Basketball Road Trip — SIAC Tournament',
    amount: 18500,
    fundType: 'athletics',
    requestor: 'Athletic Director',
    approverSeat: 'VP Finance',
    status: 'approved',
    dueDate: '2026-02-20',
  },
  {
    id: 'appr-003',
    title: 'Pearson Textbook License Renewal',
    amount: 85000,
    fundType: 'operating',
    requestor: 'Provost Office',
    approverSeat: 'Controller',
    status: 'pending',
    dueDate: '2026-03-15',
  },
  {
    id: 'appr-004',
    title: 'Title III Part B Quarterly Disbursement',
    amount: 125000,
    fundType: 'restricted_grants',
    requestor: 'Grants Office',
    approverSeat: 'VP Finance',
    status: 'escalated',
    dueDate: '2026-03-15',
  },
];

// =============================================================================
// SEEDED DATA — Audit Records
// =============================================================================

const AUDIT_RECORDS: AuditRecord[] = [
  {
    id: 'aud-001',
    entityType: 'ledger_posting',
    entityId: 'lp-001',
    action: 'Tuition Revenue Recognized',
    performedBy: 'Bursar Office',
    timestamp: '2026-02-03T09:30:00Z',
    details: 'Spring 2026 tuition batch 4 posted — $245,000 for 82 students. Census date verified.',
    evidenceStatus: 'complete',
    policyException: false,
  },
  {
    id: 'aud-004',
    entityType: 'ledger_posting',
    entityId: 'lp-006',
    action: 'Travel Advance Held',
    performedBy: 'Athletic Business Office',
    timestamp: '2026-02-08T11:20:00Z',
    details: 'Men\'s basketball travel advance held. Missing itemized hotel receipts from prior trip. Coach notified.',
    evidenceStatus: 'missing',
    policyException: true,
  },
  {
    id: 'aud-006',
    entityType: 'ledger_posting',
    entityId: 'lp-008',
    action: 'Duplicate Posting Reversed',
    performedBy: 'Accounts Payable',
    timestamp: '2026-02-06T10:30:00Z',
    details: 'Pearson invoice #PRS-44821 duplicate identified and reversed during daily reconciliation.',
    evidenceStatus: 'complete',
    policyException: false,
  },
  {
    id: 'aud-007',
    entityType: 'ledger_posting',
    entityId: 'lp-007',
    action: 'Grant Expenditure Reclassified',
    performedBy: 'Grants Accountant',
    timestamp: '2026-02-14T13:00:00Z',
    details: 'Q1 supplies reclassified from operating to Title III restricted grant fund. $15,000 adjustment.',
    evidenceStatus: 'partial',
    policyException: true,
  },
  {
    id: 'aud-008',
    entityType: 'budget',
    entityId: 'db-003',
    action: 'Budget Variance Alert',
    performedBy: 'System',
    timestamp: '2026-02-15T00:00:00Z',
    details: 'Athletics budget at 92% forecast burn with 33% of fiscal year remaining. Team travel costs exceeding projections.',
    evidenceStatus: 'flagged',
    policyException: false,
  },
];

// =============================================================================
// SEEDED DATA — Exception / Risk Items
// =============================================================================

const EXCEPTION_RISKS: ExceptionRiskItem[] = [
  {
    id: 'risk-001',
    title: 'Tuition Revenue Shortfall',
    severity: 'critical',
    category: 'Revenue',
    description: 'Spring 2026 enrollment 3% below projection across both institutions. Projected revenue gap of approximately $420,000 requires budget adjustment or contingency activation.',
    owner: 'VP Finance',
    createdAt: '2026-02-10T09:00:00Z',
  },
  {
    id: 'risk-002',
    title: 'Athletics Budget Overrun Risk',
    severity: 'warning',
    category: 'Budget',
    description: 'KaNeXT Athletics at 92% forecast burn with only 67% of fiscal year elapsed. Team travel costs driving variance. Conference schedule changes contributing factor.',
    owner: 'Athletic Director',
    createdAt: '2026-02-12T14:30:00Z',
  },
  {
    id: 'risk-003',
    title: 'Grant Compliance Deadline',
    severity: 'info',
    category: 'Compliance',
    description: 'Title III Part B quarterly report due in 30 days. Expenditure reclassification in progress. All documentation must be finalized by March 15.',
    owner: 'Grants Office',
    createdAt: '2026-02-14T08:00:00Z',
  },
];

// =============================================================================
// DATA ACCESSOR
// =============================================================================

export function getEduFinanceData() {
  return {
    truthStrip: TRUTH_STRIP,
    termSnapshots: TERM_SNAPSHOTS,
    needsDecision: NEEDS_DECISION,
    departmentBudgets: DEPARTMENT_BUDGETS,
    ledgerPostings: LEDGER_POSTINGS,
    receivables: RECEIVABLES,
    payables: PAYABLES,
    aidAwards: AID_AWARDS,
    approvalItems: APPROVAL_ITEMS,
    auditRecords: AUDIT_RECORDS,
    exceptionRisks: EXCEPTION_RISKS,
  };
}

export function getReceivableById(id: string): Receivable | undefined {
  return RECEIVABLES.find((r) => r.id === id);
}

export function getPayableById(id: string): Payable | undefined {
  return PAYABLES.find((p) => p.id === id);
}

export function getAidAwardById(id: string): AidAward | undefined {
  return AID_AWARDS.find((a) => a.id === id);
}

export function getLedgerPostingById(id: string): LedgerPosting | undefined {
  return LEDGER_POSTINGS.find((lp) => lp.id === id);
}
