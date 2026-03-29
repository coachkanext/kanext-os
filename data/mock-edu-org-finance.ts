/**
 * Education Organization Finance — Mock Data & Types
 * Term-based budgets, receivables, payables, financial aid, ledger postings, audit trail.
 * Institution: Lincoln University, Oakland CA
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
  tuition_revenue: '#1D9BF0',
  housing_revenue: '#1D9BF0',
  financial_aid: '#F59E0B',
  athletics: '#EF4444',
  restricted_grants: '#1D9BF0',
  endowment: '#22C55E',
  auxiliary: '#F59E0B',
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
  tuition: '#1D9BF0',
  fees: '#1D9BF0',
  housing: '#22C55E',
  meal_plan: '#F59E0B',
  parking: '#A1A1AA',
  lab_fees: '#1D9BF0',
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
  vendor: '#1D9BF0',
  contractor: '#F59E0B',
  payroll: '#22C55E',
  utilities: '#1D9BF0',
  insurance: '#1D9BF0',
  equipment: '#F59E0B',
  services: '#22C55E',
  travel: '#1D9BF0',
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
  need: '#1D9BF0',
  athletic: '#EF4444',
  pell: '#1D9BF0',
  state: '#F59E0B',
  external: '#22C55E',
  work_study: '#F59E0B',
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
  reversed: '#A1A1AA',
  adjusting: '#1D9BF0',
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
  rejected: '#EF4444',
  escalated: '#1D9BF0',
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
  flagged: '#EF4444',
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
  cashPosition: 1_850_000,
  commitments: 420_000,
  receivables: 680_000,
  payables: 185_000,
  holds: 12,
  auditCompleteness: 91,
};

// =============================================================================
// SEEDED DATA — Term Snapshots
// =============================================================================

const TERM_SNAPSHOTS: TermSnapshot[] = [
  {
    id: 'ts-001',
    institution: 'Lincoln University',
    term: 'spring_2026',
    enrollment: 436,
    tuitionRevenue: 2_650_000,
    aidDisbursed: 0,
    housingRevenue: 0,
    auxiliaryRevenue: 45_000,
    operatingExpenses: 2_200_000,
    netPosition: 495_000,
  },
];

// =============================================================================
// SEEDED DATA — Needs Decision Items
// =============================================================================

const NEEDS_DECISION: NeedsDecisionItem[] = [
  {
    id: 'nd-001',
    title: 'DI Lab Equipment Upgrade',
    amount: 68000,
    category: 'Capital Expenditure',
    urgency: 'high',
    dueDate: '2026-02-28',
    owner: 'VP Admin',
    description: 'New ultrasound transducer array and imaging workstations for the Diagnostic Imaging Laboratory. Current equipment is end-of-life and no longer supported by the manufacturer. President signature required for capital expenditure.',
  },
  {
    id: 'nd-002',
    title: 'Tuition Refund Processing',
    amount: 14200,
    category: 'Student Accounts',
    urgency: 'high',
    dueDate: '2026-02-20',
    owner: 'Bursar/Controller',
    description: 'Spring 2026 tuition refunds for 8 student withdrawals processed per institutional refund schedule. Amounts range from $1,100 to $3,275 depending on withdrawal date.',
  },
  {
    id: 'nd-003',
    title: 'Accreditation Consultant Contract',
    amount: 22500,
    category: 'Consulting',
    urgency: 'medium',
    dueDate: '2026-03-15',
    owner: "President's Office",
    description: 'WSCUC self-study consultant engagement for June 2026 comprehensive review. Consultant will assist with Standards analysis, evidence compilation, and institutional report drafting.',
  },
  {
    id: 'nd-004',
    title: 'Adjunct Faculty Payments',
    amount: 38400,
    category: 'Payroll',
    urgency: 'medium',
    dueDate: '2026-03-01',
    owner: 'Admin VP',
    description: 'Spring 2026 adjunct faculty compensation batch covering 11 instructors across Business Programs and Diagnostic Imaging. Pay period: January 15 – March 1, 2026.',
  },
];

// =============================================================================
// SEEDED DATA — Department Budgets
// =============================================================================

const DEPARTMENT_BUDGETS: DepartmentBudget[] = [
  {
    id: 'db-001',
    department: 'Business Programs',
    institution: 'Lincoln University',
    fundType: 'operating',
    period: 'Annual FY 2025-2026',
    lineItems: [
      { id: 'db-001-li-01', name: 'Adjunct Faculty', category: 'Personnel', budgeted: 280000, spent: 148000, committed: 52000, hardCap: false },
      { id: 'db-001-li-02', name: 'Course Materials & Textbooks', category: 'Academic', budgeted: 45000, spent: 22000, committed: 8000, hardCap: false },
      { id: 'db-001-li-03', name: 'Faculty Development', category: 'Personnel', budgeted: 35000, spent: 12000, committed: 5000, hardCap: false },
      { id: 'db-001-li-04', name: 'Technology & Software', category: 'Technology', budgeted: 55000, spent: 31000, committed: 14000, hardCap: true },
      { id: 'db-001-li-05', name: 'Administrative', category: 'Operations', budgeted: 65000, spent: 28000, committed: 9000, hardCap: false },
    ],
    totalBudgeted: 680000,
    totalSpent: 340000,
    totalCommitted: 98000,
    forecastBurn: 72,
    varianceNote: 'Adjunct faculty costs trending slightly above projection due to additional sections added for MBA cohort growth. No risk of overrun at current pace.',
  },
  {
    id: 'db-002',
    department: 'Diagnostic Imaging Lab',
    institution: 'Lincoln University',
    fundType: 'operating',
    period: 'Annual FY 2025-2026',
    lineItems: [
      { id: 'db-002-li-01', name: 'Lab Equipment Maintenance', category: 'Maintenance', budgeted: 85000, spent: 38000, committed: 12000, hardCap: true },
      { id: 'db-002-li-02', name: 'Lab Supplies & Consumables', category: 'Supplies', budgeted: 62000, spent: 29000, committed: 7000, hardCap: false },
      { id: 'db-002-li-03', name: 'Instructor Compensation', category: 'Personnel', budgeted: 95000, spent: 48000, committed: 16000, hardCap: false },
      { id: 'db-002-li-04', name: 'Clinical Partnerships', category: 'External', budgeted: 38000, spent: 15000, committed: 8000, hardCap: false },
    ],
    totalBudgeted: 280000,
    totalSpent: 130000,
    totalCommitted: 43000,
    forecastBurn: 68,
    varianceNote: 'On pace. Pending DI lab equipment upgrade ($68K capital request) would be booked as a separate capital expenditure, not within this operating budget.',
  },
];

// =============================================================================
// SEEDED DATA — Ledger Postings
// =============================================================================

const LEDGER_POSTINGS: LedgerPosting[] = [
  {
    id: 'lp-001',
    date: '2026-02-05',
    description: 'Spring 2026 Tuition Revenue Recognition — Batch 3',
    fundType: 'tuition_revenue',
    debitAccount: '1100 — Student Accounts Receivable',
    creditAccount: '4010 — Tuition Revenue',
    amount: 185000,
    state: 'posted',
    explainChain: [
      'Registrar confirmed Spring 2026 enrollment — 436 students',
      'Student accounts billed per approved tuition schedule ($13,150 UG / $11,260 grad avg)',
      'Revenue recognized upon census date confirmation — February 4, 2026',
    ],
    postedBy: 'Bursar Office',
    institution: 'Lincoln University',
  },
  {
    id: 'lp-002',
    date: '2026-02-28',
    description: 'Adjunct Faculty Payroll — February 2026',
    fundType: 'operating',
    debitAccount: '6100 — Adjunct Faculty Compensation',
    creditAccount: '2000 — Accounts Payable',
    amount: 32000,
    state: 'posted',
    explainChain: [
      'Spring 2026 adjunct compensation — pay period Jan 15 through Feb 28',
      'Covers 11 adjunct instructors across Business Programs and DI Lab',
      'Approved by Administrative VP per FY 2025-2026 personnel budget',
    ],
    postedBy: 'Payroll Office',
    institution: 'Lincoln University',
  },
  {
    id: 'lp-003',
    date: '2026-02-20',
    description: 'DI Lab Ultrasound Equipment — Purchase Order PO-2026-0118',
    fundType: 'operating',
    debitAccount: '1500 — Equipment (Capital)',
    creditAccount: '2000 — Accounts Payable',
    amount: 68000,
    state: 'pending',
    explainChain: [
      'Purchase order issued to Pacific Medical Supply for ultrasound imaging system',
      'Quote #PMS-2026-0441 accepted — end-of-life equipment replacement',
      'Awaiting President signature — capital expenditure threshold exceeded',
    ],
    postedBy: 'Procurement Office',
    institution: 'Lincoln University',
  },
  {
    id: 'lp-004',
    date: '2026-02-22',
    description: 'WSCUC Accreditation Consultant — Retainer Invoice',
    fundType: 'operating',
    debitAccount: '6400 — Professional Services',
    creditAccount: '2000 — Accounts Payable',
    amount: 22500,
    state: 'pending',
    explainChain: [
      'Retainer invoice received from accreditation consultant for WSCUC self-study',
      'Engagement scope: June 2026 comprehensive review preparation',
      'Pending Administrative VP approval — contract execution in progress',
    ],
    postedBy: 'Accounts Payable',
    institution: 'Lincoln University',
  },
];

// =============================================================================
// SEEDED DATA — Receivables
// =============================================================================

const RECEIVABLES: Receivable[] = [
  {
    id: 'rcv-001',
    studentName: 'Wei Chen',
    studentId: 'LU-2025-0142',
    type: 'tuition',
    amount: 6575,
    dueDate: '2026-02-15',
    status: 'outstanding',
    institution: 'Lincoln University',
    term: 'spring_2026',
    holdFlag: true,
    holdReason: 'Tuition balance outstanding — payment plan in progress',
  },
  {
    id: 'rcv-002',
    studentName: 'Ji-Ho Park',
    studentId: 'LU-2024-0387',
    type: 'fees',
    amount: 550,
    dueDate: '2026-01-25',
    status: 'overdue',
    institution: 'Lincoln University',
    term: 'spring_2026',
    holdFlag: false,
  },
  {
    id: 'rcv-003',
    studentName: 'Priya Sharma',
    studentId: 'LU-2025-0251',
    type: 'tuition',
    amount: 13150,
    dueDate: '2026-01-20',
    status: 'paid',
    institution: 'Lincoln University',
    term: 'spring_2026',
    holdFlag: false,
  },
  {
    id: 'rcv-004',
    studentName: 'Gabriel Silva',
    studentId: 'LU-2024-0614',
    type: 'fees',
    amount: 550,
    dueDate: '2026-02-15',
    status: 'outstanding',
    institution: 'Lincoln University',
    term: 'spring_2026',
    holdFlag: false,
  },
];

// =============================================================================
// SEEDED DATA — Payables
// =============================================================================

const PAYABLES: Payable[] = [
  {
    id: 'pay-001',
    vendorName: 'Laney College — Athletic Venue Agreement',
    type: 'services',
    amount: 9600,
    dueDate: '2026-03-31',
    status: 'scheduled',
    fundType: 'operating',
    institution: 'Lincoln University',
    docsComplete: 5,
    docsRequired: 5,
    approvalChain: [
      { name: 'Administrative VP', status: 'approved' },
      { name: 'President', status: 'approved' },
    ],
  },
  {
    id: 'pay-002',
    vendorName: 'ADP Payroll Services',
    type: 'services',
    amount: 1800,
    dueDate: '2026-02-15',
    status: 'paid',
    fundType: 'operating',
    institution: 'Lincoln University',
    docsComplete: 5,
    docsRequired: 5,
    approvalChain: [
      { name: 'Controller', status: 'approved' },
    ],
  },
  {
    id: 'pay-003',
    vendorName: 'WSCUC Accreditation Consultant',
    type: 'contractor',
    amount: 22500,
    dueDate: '2026-03-01',
    status: 'pending',
    fundType: 'operating',
    institution: 'Lincoln University',
    docsComplete: 3,
    docsRequired: 5,
    approvalChain: [
      { name: 'Director of QA & Accreditation', status: 'approved' },
      { name: 'Administrative VP', status: 'pending' },
    ],
  },
];

// =============================================================================
// SEEDED DATA — Aid Awards
// Lincoln University does not participate in Title IV federal student aid programs.
// =============================================================================

const AID_AWARDS: AidAward[] = [];

// =============================================================================
// SEEDED DATA — Approval Items
// =============================================================================

const APPROVAL_ITEMS: FinanceApprovalItem[] = [
  {
    id: 'appr-001',
    title: 'DI Lab Ultrasound Equipment — Pacific Medical Supply',
    amount: 68000,
    fundType: 'operating',
    requestor: 'Director of DI Laboratory',
    approverSeat: 'President',
    status: 'pending',
    dueDate: '2026-02-28',
  },
  {
    id: 'appr-002',
    title: 'WSCUC Accreditation Consultant Contract',
    amount: 22500,
    fundType: 'operating',
    requestor: 'Director of QA & Accreditation',
    approverSeat: 'Administrative VP',
    status: 'approved',
    dueDate: '2026-03-15',
  },
  {
    id: 'appr-003',
    title: 'Spring 2026 Adjunct Compensation Batch',
    amount: 38400,
    fundType: 'operating',
    requestor: 'Administrative VP',
    approverSeat: 'President',
    status: 'pending',
    dueDate: '2026-03-01',
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
    action: 'Tuition Revenue Recognized — Spring 2026 Batch',
    performedBy: 'Bursar Office',
    timestamp: '2026-02-05T10:00:00Z',
    details: 'Spring 2026 tuition revenue batch posted — $185,000 for enrolled students. Census date February 4 confirmed by Registrar.',
    evidenceStatus: 'complete',
    policyException: false,
  },
  {
    id: 'aud-002',
    entityType: 'receivable',
    entityId: 'rcv-001',
    action: 'Tuition Refund Held — Wei Chen Outstanding Balance',
    performedBy: 'Student Accounts Office',
    timestamp: '2026-02-16T09:15:00Z',
    details: 'Wei Chen (LU-2025-0142) second installment of $6,575 not received by due date. Hold placed on student account. Payment plan extension request pending Dean of Students review.',
    evidenceStatus: 'missing',
    policyException: true,
  },
  {
    id: 'aud-003',
    entityType: 'ledger_posting',
    entityId: 'lp-002',
    action: 'Adjunct Payroll Posted — February 2026',
    performedBy: 'Payroll Office',
    timestamp: '2026-02-28T14:30:00Z',
    details: 'Spring 2026 adjunct faculty payroll batch posted — $32,000 for 11 instructors. Approved by Administrative VP. All timesheet documentation complete.',
    evidenceStatus: 'complete',
    policyException: false,
  },
  {
    id: 'aud-004',
    entityType: 'payable',
    entityId: 'pay-003',
    action: 'WSCUC Consultant Invoice Received — Pending Approval',
    performedBy: 'Accounts Payable',
    timestamp: '2026-02-22T11:45:00Z',
    details: 'Retainer invoice #WS-2026-0081 received from WSCUC accreditation consultant. $22,500 due March 1. Contract execution documents 3 of 5 complete. Administrative VP signature outstanding.',
    evidenceStatus: 'partial',
    policyException: false,
  },
];

// =============================================================================
// SEEDED DATA — Exception / Risk Items
// =============================================================================

const EXCEPTION_RISKS: ExceptionRiskItem[] = [
  {
    id: 'risk-001',
    title: 'Tuition Receivables Aging',
    severity: 'warning',
    category: 'Revenue',
    description: '3 student accounts are past 30 days: Wei Chen ($6,575 tuition balance on payment plan), Ji-Ho Park ($550 fees overdue since January 25), and Gabriel Silva ($550 fees outstanding). Total aging: $7,675. Accounting Analyst escalation required.',
    owner: 'Accounting Analyst',
    createdAt: '2026-02-16T09:00:00Z',
  },
  {
    id: 'risk-002',
    title: 'WSCUC Accreditation Deadline',
    severity: 'critical',
    category: 'Compliance',
    description: 'WSCUC comprehensive review scheduled for June 26, 2026. Institutional self-study report must be submitted by May 1, 2026. Consultant contract pending final signature. 63 days remain to May 1 deadline — QA Director must accelerate evidence compilation.',
    owner: 'QA Director',
    createdAt: '2026-02-18T08:00:00Z',
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
