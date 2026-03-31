/**
 * Finance v2 — Comprehensive Mock Data
 * Full dataset for all 5 modes across 14 finance tabs.
 */
import type { Mode } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

export type FinanceStatus =
  | 'pending'
  | 'approved'
  | 'paid'
  | 'overdue'
  | 'rejected'
  | 'draft';

export interface FinanceScopeChip {
  key: string;
  label: string;
}

export type FinanceTabId =
  | 'dashboard'
  | 'budgets'
  | 'ledger'
  | 'approvals'
  | 'payables'
  | 'receivables'
  | 'contracts'
  | 'purchasing'
  | 'payroll'
  | 'reimbursements'
  | 'reporting'
  | 'controls'
  | 'audit'
  | 'settings';

export interface FinanceTab {
  id: FinanceTabId;
  label: string;
}

export interface FinanceDashboardBlock {
  id: string;
  label: string;
  icon: string;
  value: string;
  subValue?: string;
  color: string;
}

export interface FinanceBudget {
  id: string;
  category: string;
  period: string;
  budgeted: number;
  actual: number;
  owner: string;
  status: 'on-track' | 'at-risk' | 'over-budget';
}

export interface FinanceLedgerEntry {
  id: string;
  date: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  scope: string;
  evidence?: string;
}

export interface FinanceApproval {
  id: string;
  title: string;
  amount: number;
  purpose: string;
  requestedBy: string;
  requestedByInitials: string;
  approvers: string[];
  status: FinanceStatus;
  submittedAt: string;
  evidence?: string;
}

export interface FinancePayable {
  id: string;
  vendor: string;
  description: string;
  amount: number;
  dueDate: string;
  category: string;
  status: FinanceStatus;
  invoiceRef?: string;
}

export interface FinanceReceivable {
  id: string;
  source: string;
  description: string;
  amount: number;
  dueDate: string;
  category: string;
  status: FinanceStatus;
}

export interface FinanceContract {
  id: string;
  title: string;
  vendor: string;
  value: number;
  startDate: string;
  endDate: string;
  renewalDate?: string;
  status: 'active' | 'expiring' | 'expired' | 'renewed';
}

export interface FinancePurchaseRequest {
  id: string;
  title: string;
  requestedBy: string;
  requestedByInitials: string;
  amount: number;
  category: string;
  status: FinanceStatus;
  submittedAt: string;
}

export interface FinancePayrollItem {
  id: string;
  payee: string;
  payeeInitials: string;
  period: string;
  amount: number;
  type: 'salary' | 'stipend' | 'contractor' | 'honorarium';
  status: FinanceStatus;
}

export interface FinanceReimbursement {
  id: string;
  claimant: string;
  claimantInitials: string;
  description: string;
  amount: number;
  receipts: number;
  status: FinanceStatus;
  submittedAt: string;
}

export interface FinanceReport {
  id: string;
  title: string;
  type: string;
  period: string;
  generatedAt: string;
  owner: string;
}

export interface FinanceControl {
  id: string;
  title: string;
  description: string;
  threshold?: number;
  enabled: boolean;
  category: string;
}

export interface FinanceAuditEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  timestampMs: number;
  description: string;
}

export interface FinanceFilterState {
  category: string;
  owner: string;
  statuses: FinanceStatus[];
  sort: 'recent' | 'due' | 'amount' | 'az';
}

export type FinanceSortOption = 'recent-activity' | 'due-soonest' | 'largest-amount' | 'a-z';

// =============================================================================
// CONSTANTS
// =============================================================================

export const FINANCE_TABS: FinanceTab[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'budgets', label: 'Budgets' },
  { id: 'ledger', label: 'Ledger' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'payables', label: 'Payables' },
  { id: 'receivables', label: 'Receivables' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'purchasing', label: 'Purchasing' },
  { id: 'payroll', label: 'Payroll / Stipends' },
  { id: 'reimbursements', label: 'Reimbursements' },
  { id: 'reporting', label: 'Reporting' },
  { id: 'controls', label: 'Controls' },
  { id: 'audit', label: 'Audit' },
  { id: 'settings', label: 'Settings' },
];

export const FINANCE_SCOPE_CHIPS: Record<Mode, FinanceScopeChip[]> = {
  sports: [
    { key: 'org', label: 'Organization' },
    { key: 'program', label: 'Program' },
    { key: 'season', label: 'Season' },
  ],
  education: [
    { key: 'org', label: 'Organization' },
    { key: 'institution', label: 'Institution' },
    { key: 'department', label: 'Department' },
  ],
  church: [
    { key: 'org', label: 'Organization' },
    { key: 'campus', label: 'Campus' },
    { key: 'ministry', label: 'Ministry' },
  ],
  competition: [
    { key: 'org', label: 'Organization' },
    { key: 'series', label: 'Series' },
    { key: 'event-weekend', label: 'Event Weekend' },
  ],
  business: [
    { key: 'org', label: 'Organization' },
    { key: 'entity', label: 'Entity' },
    { key: 'department', label: 'Department' },
  ],
};

export const FINANCE_STATUS_COLOR: Record<FinanceStatus, string> = {
  pending: '#B8943E',
  approved: '#5A8A6E',
  paid: '#1A1714',
  overdue: '#B85C5C',
  rejected: '#9C9790',
  draft: '#9C9790',
};

export const BUDGET_STATUS_COLOR: Record<FinanceBudget['status'], string> = {
  'on-track': '#5A8A6E',
  'at-risk': '#B8943E',
  'over-budget': '#B85C5C',
};

export const CONTRACT_STATUS_COLOR: Record<FinanceContract['status'], string> = {
  active: '#5A8A6E',
  expiring: '#B8943E',
  expired: '#B85C5C',
  renewed: '#1A1714',
};

// =============================================================================
// SPORTS — Dashboard
// =============================================================================

const SPORTS_DASHBOARD: FinanceDashboardBlock[] = [
  { id: 'sd-1', label: 'Run Rate vs Budget', icon: 'chart.bar.fill', value: '$62K / $85K', subValue: '73% utilized', color: '#5A8A6E' },
  { id: 'sd-2', label: 'Pending Approvals', icon: 'clock.badge.checkmark.fill', value: '4', subValue: '$8,200 total', color: '#B8943E' },
  { id: 'sd-3', label: 'Travel Spend', icon: 'airplane', value: '$18,000', subValue: '82% of budget', color: '#1A1714' },
  { id: 'sd-4', label: 'Recruiting Spend', icon: 'person.badge.plus', value: '$12,000', subValue: '80% of budget', color: '#1A1714' },
  { id: 'sd-5', label: 'Equipment', icon: 'sportscourt.fill', value: '$6,500', subValue: '81% of budget', color: '#B8943E' },
  { id: 'sd-6', label: 'Payroll Snapshot', icon: 'banknote.fill', value: '$14,800', subValue: '6 stipend recipients', color: '#1A1714' },
  { id: 'sd-7', label: 'Reimbursements', icon: 'arrow.uturn.left.circle.fill', value: '$1,240', subValue: '3 pending claims', color: '#1A1714' },
  { id: 'sd-8', label: 'Reports Due', icon: 'doc.text.fill', value: '2', subValue: 'Monthly close Feb 28', color: '#1A1714' },
];

// =============================================================================
// SPORTS — Budgets
// =============================================================================

const SPORTS_BUDGETS: FinanceBudget[] = [
  { id: 'sb-1', category: 'Travel', period: '2025-26 Season', budgeted: 22000, actual: 18000, owner: 'Coach Carter', status: 'at-risk' },
  { id: 'sb-2', category: 'Recruiting', period: '2025-26 Season', budgeted: 15000, actual: 12000, owner: 'Coach Carter', status: 'on-track' },
  { id: 'sb-3', category: 'Equipment', period: '2025-26 Season', budgeted: 8000, actual: 6500, owner: 'Equipment Manager', status: 'on-track' },
  { id: 'sb-4', category: 'Nutrition', period: '2025-26 Season', budgeted: 5000, actual: 3200, owner: 'S&C Staff', status: 'on-track' },
  { id: 'sb-5', category: 'Staff Development', period: '2025-26 Season', budgeted: 4000, actual: 1800, owner: 'Coach Carter', status: 'on-track' },
  { id: 'sb-6', category: 'Medical', period: '2025-26 Season', budgeted: 6000, actual: 4000, owner: 'Athletic Trainer', status: 'on-track' },
  { id: 'sb-7', category: 'Game Day', period: '2025-26 Season', budgeted: 3000, actual: 2100, owner: 'Operations', status: 'on-track' },
  { id: 'sb-8', category: 'Media', period: '2025-26 Season', budgeted: 4000, actual: 2800, owner: 'Media Dir.', status: 'on-track' },
];

// =============================================================================
// SPORTS — Ledger
// =============================================================================

const SPORTS_LEDGER: FinanceLedgerEntry[] = [
  { id: 'sl-1', date: 'Feb 15, 2026', description: 'Team bus charter — Multnomah', type: 'expense', category: 'Travel', amount: 2400, scope: 'Program' },
  { id: 'sl-2', date: 'Feb 14, 2026', description: 'Nike equipment order — spring uniforms', type: 'expense', category: 'Equipment', amount: 4800, scope: 'Program', evidence: 'PO-2026-014' },
  { id: 'sl-3', date: 'Feb 12, 2026', description: 'Booster donation — Williams Family', type: 'income', category: 'Donations', amount: 5000, scope: 'Organization' },
  { id: 'sl-4', date: 'Feb 10, 2026', description: 'Game guarantee — Homecoming', type: 'income', category: 'Revenue', amount: 15000, scope: 'Program' },
  { id: 'sl-5', date: 'Feb 10, 2026', description: 'Hotel block — Thomas trip', type: 'expense', category: 'Travel', amount: 1800, scope: 'Program' },
  { id: 'sl-6', date: 'Feb 8, 2026', description: 'Athletic trainer monthly retainer', type: 'expense', category: 'Medical', amount: 3200, scope: 'Program' },
  { id: 'sl-7', date: 'Feb 7, 2026', description: 'Ticket sales — February home games', type: 'income', category: 'Revenue', amount: 8400, scope: 'Program' },
  { id: 'sl-8', date: 'Feb 6, 2026', description: 'Recruiting visit meals — 3 prospects', type: 'expense', category: 'Recruiting', amount: 680, scope: 'Program' },
  { id: 'sl-9', date: 'Feb 5, 2026', description: 'Concession revenue — home games', type: 'income', category: 'Revenue', amount: 2800, scope: 'Organization' },
  { id: 'sl-10', date: 'Feb 3, 2026', description: 'Game officials — 3 home games', type: 'expense', category: 'Game Day', amount: 2700, scope: 'Program' },
  { id: 'sl-11', date: 'Feb 1, 2026', description: 'Pre-game meal service — home opener', type: 'expense', category: 'Nutrition', amount: 420, scope: 'Program' },
  { id: 'sl-12', date: 'Jan 30, 2026', description: 'Season media pass revenue', type: 'income', category: 'Media', amount: 1200, scope: 'Organization' },
];

// =============================================================================
// SPORTS — Approvals
// =============================================================================

const SPORTS_APPROVALS: FinanceApproval[] = [
  { id: 'sa-1', title: 'Conference Tournament Travel Package', amount: 4800, purpose: 'Bus + hotel for NCCAA National Tournament', requestedBy: 'Alex Morgan', requestedByInitials: 'SK', approvers: ['AD Office', 'VP Finance'], status: 'pending', submittedAt: 'Feb 14, 2026', evidence: 'Quote-CT-2026' },
  { id: 'sa-2', title: 'Spring Recruiting Budget Increase', amount: 2000, purpose: 'Additional campus visits for 2027 class', requestedBy: 'Alex Morgan', requestedByInitials: 'SK', approvers: ['AD Office'], status: 'approved', submittedAt: 'Feb 10, 2026' },
  { id: 'sa-3', title: 'Video Equipment Upgrade', amount: 1200, purpose: 'Hudl camera system replacement', requestedBy: 'Marcus Reed', requestedByInitials: 'MR', approvers: ['Coach Carter', 'AD Office'], status: 'pending', submittedAt: 'Feb 8, 2026' },
  { id: 'sa-4', title: 'End-of-Season Banquet Catering', amount: 1800, purpose: 'Annual awards banquet for 65 guests', requestedBy: 'Tanya Brooks', requestedByInitials: 'TB', approvers: ['Coach Carter'], status: 'draft', submittedAt: 'Feb 6, 2026' },
];

// =============================================================================
// SPORTS — Payables
// =============================================================================

const SPORTS_PAYABLES: FinancePayable[] = [
  { id: 'sp-1', vendor: 'Nike Team Sports', description: 'Spring uniform order — 20 sets', amount: 4800, dueDate: 'Mar 5, 2026', category: 'Equipment', status: 'pending', invoiceRef: 'NTS-44821' },
  { id: 'sp-2', vendor: 'Charter Express', description: 'Bus charter — Multnomah away game', amount: 2400, dueDate: 'Feb 28, 2026', category: 'Travel', status: 'approved' },
  { id: 'sp-3', vendor: 'Sodexo Dining', description: 'Pre-game meal service — February', amount: 1450, dueDate: 'Mar 1, 2026', category: 'Nutrition', status: 'pending', invoiceRef: 'SOD-8821' },
  { id: 'sp-4', vendor: 'BSN Sports', description: 'Practice pinnies and cones restock', amount: 680, dueDate: 'Feb 22, 2026', category: 'Equipment', status: 'paid' },
  { id: 'sp-5', vendor: 'SportsMed Pro', description: 'Athletic trainer retainer — March', amount: 3200, dueDate: 'Mar 1, 2026', category: 'Medical', status: 'pending' },
];

// =============================================================================
// SPORTS — Receivables
// =============================================================================

const SPORTS_RECEIVABLES: FinanceReceivable[] = [
  { id: 'sr-1', source: 'Gate Revenue', description: 'Ticket sales — Conference Semifinals', amount: 6200, dueDate: 'Mar 8, 2026', category: 'Revenue', status: 'pending' },
  { id: 'sr-2', source: 'Williams Family Foundation', description: 'Annual booster donation pledge', amount: 10000, dueDate: 'Mar 15, 2026', category: 'Donations', status: 'pending' },
  { id: 'sr-3', source: 'City Sports Network', description: 'Broadcast sponsorship — spring games', amount: 3500, dueDate: 'Feb 28, 2026', category: 'Sponsorships', status: 'approved' },
  { id: 'sr-4', source: 'Conference Office', description: 'Tournament revenue share', amount: 4800, dueDate: 'Apr 1, 2026', category: 'Revenue', status: 'pending' },
];

// =============================================================================
// SPORTS — Contracts
// =============================================================================

const SPORTS_CONTRACTS: FinanceContract[] = [
  { id: 'sc-1', title: 'Nike Apparel Agreement', vendor: 'Nike Team Sports', value: 18000, startDate: 'Aug 1, 2025', endDate: 'Jul 31, 2027', renewalDate: 'May 1, 2027', status: 'active' },
  { id: 'sc-2', title: 'Charter Bus Transportation', vendor: 'Charter Express', value: 12000, startDate: 'Sep 1, 2025', endDate: 'May 31, 2026', status: 'active' },
  { id: 'sc-3', title: 'Athletic Training Services', vendor: 'SportsMed Pro', value: 38400, startDate: 'Jul 1, 2025', endDate: 'Jun 30, 2026', renewalDate: 'Apr 1, 2026', status: 'expiring' },
  { id: 'sc-4', title: 'Dining Services — Team Meals', vendor: 'Sodexo Dining', value: 8500, startDate: 'Aug 15, 2025', endDate: 'May 15, 2026', status: 'active' },
];

// =============================================================================
// SPORTS — Purchasing
// =============================================================================

const SPORTS_PURCHASING: FinancePurchaseRequest[] = [
  { id: 'spr-1', title: 'Shooting Machine — Dr. Dish', requestedBy: 'Alex Morgan', requestedByInitials: 'SK', amount: 6500, category: 'Equipment', status: 'pending', submittedAt: 'Feb 13, 2026' },
  { id: 'spr-2', title: 'Road Trip Per Diem — March', requestedBy: 'Tanya Brooks', requestedByInitials: 'TB', amount: 1200, category: 'Travel', status: 'approved', submittedAt: 'Feb 12, 2026' },
  { id: 'spr-3', title: 'Film Room Monitor Upgrade', requestedBy: 'Marcus Reed', requestedByInitials: 'MR', amount: 2400, category: 'Media', status: 'pending', submittedAt: 'Feb 10, 2026' },
  { id: 'spr-4', title: 'Resistance Bands & Recovery Tools', requestedBy: 'Devin Carter', requestedByInitials: 'DC', amount: 450, category: 'Medical', status: 'approved', submittedAt: 'Feb 8, 2026' },
];

// =============================================================================
// SPORTS — Payroll / Stipends
// =============================================================================

const SPORTS_PAYROLL: FinancePayrollItem[] = [
  { id: 'spy-1', payee: 'Alex Morgan', payeeInitials: 'SK', period: 'Feb 2026', amount: 4200, type: 'salary', status: 'paid' },
  { id: 'spy-2', payee: 'Marcus Reed', payeeInitials: 'MR', period: 'Feb 2026', amount: 2800, type: 'stipend', status: 'paid' },
  { id: 'spy-3', payee: 'Tanya Brooks', payeeInitials: 'TB', period: 'Feb 2026', amount: 2400, type: 'stipend', status: 'paid' },
  { id: 'spy-4', payee: 'Devin Carter', payeeInitials: 'DC', period: 'Feb 2026', amount: 1800, type: 'stipend', status: 'pending' },
  { id: 'spy-5', payee: 'Jordan Wells', payeeInitials: 'JW', period: 'Feb 2026', amount: 1200, type: 'stipend', status: 'pending' },
];

// =============================================================================
// SPORTS — Reimbursements
// =============================================================================

const SPORTS_REIMBURSEMENTS: FinanceReimbursement[] = [
  { id: 'srm-1', claimant: 'Alex Morgan', claimantInitials: 'SK', description: 'Recruiting dinner — 2 prospects', amount: 185, receipts: 2, status: 'approved', submittedAt: 'Feb 12, 2026' },
  { id: 'srm-2', claimant: 'Marcus Reed', claimantInitials: 'MR', description: 'Film software subscription — personal card', amount: 49, receipts: 1, status: 'pending', submittedAt: 'Feb 10, 2026' },
  { id: 'srm-3', claimant: 'Tanya Brooks', claimantInitials: 'TB', description: 'Office supplies for game-day operations', amount: 112, receipts: 3, status: 'pending', submittedAt: 'Feb 8, 2026' },
];

// =============================================================================
// SPORTS — Reports
// =============================================================================

const SPORTS_REPORTS: FinanceReport[] = [
  { id: 'srp-1', title: 'Monthly Budget vs Actuals — January 2026', type: 'Budget Report', period: 'Jan 2026', generatedAt: 'Feb 3, 2026', owner: 'Finance Office' },
  { id: 'srp-2', title: 'Season-to-Date Travel Spend', type: 'Category Report', period: '2025-26 Season', generatedAt: 'Feb 10, 2026', owner: 'Coach Carter' },
  { id: 'srp-3', title: 'Recruiting Cost-per-Signee Analysis', type: 'ROI Report', period: '2024-25 Cycle', generatedAt: 'Jan 28, 2026', owner: 'AD Office' },
  { id: 'srp-4', title: 'Quarterly Compliance Filing', type: 'Compliance Report', period: 'Q3 FY26', generatedAt: 'Jan 15, 2026', owner: 'Compliance' },
];

// =============================================================================
// SPORTS — Controls
// =============================================================================

const SPORTS_CONTROLS: FinanceControl[] = [
  { id: 'sct-1', title: 'Single Purchase Limit', description: 'Require approval for any purchase above threshold', threshold: 500, enabled: true, category: 'Purchasing' },
  { id: 'sct-2', title: 'Travel Pre-Approval', description: 'All travel expenses require pre-trip approval from AD', enabled: true, category: 'Travel' },
  { id: 'sct-3', title: 'Recruiting Meal Cap', description: 'Per-person meal limit for recruiting visits', threshold: 75, enabled: true, category: 'Recruiting' },
  { id: 'sct-4', title: 'Dual Signature — Contracts', description: 'Contracts over $5,000 require two authorized signers', threshold: 5000, enabled: true, category: 'Contracts' },
  { id: 'sct-5', title: 'Reimbursement Receipt Requirement', description: 'All reimbursements must include itemized receipts', enabled: true, category: 'Reimbursements' },
];

// =============================================================================
// SPORTS — Audit
// =============================================================================

const SPORTS_AUDIT: FinanceAuditEntry[] = [
  { id: 'sau-1', action: 'Approval Submitted', actor: 'Alex Morgan', timestamp: 'Feb 14, 2026 3:22 PM', timestampMs: 1739557320000, description: 'Conference Tournament Travel Package — $4,800' },
  { id: 'sau-2', action: 'Payment Processed', actor: 'Finance Office', timestamp: 'Feb 14, 2026 11:05 AM', timestampMs: 1739541900000, description: 'Nike equipment order paid — PO-2026-014' },
  { id: 'sau-3', action: 'Budget Transfer', actor: 'AD Office', timestamp: 'Feb 12, 2026 2:30 PM', timestampMs: 1739381400000, description: 'Moved $1,000 from Staff Dev to Recruiting' },
  { id: 'sau-4', action: 'Approval Granted', actor: 'AD Office', timestamp: 'Feb 10, 2026 10:15 AM', timestampMs: 1739192100000, description: 'Spring Recruiting Budget Increase — $2,000 approved' },
  { id: 'sau-5', action: 'Invoice Received', actor: 'System', timestamp: 'Feb 8, 2026 9:00 AM', timestampMs: 1739015600000, description: 'Sodexo Dining invoice SOD-8821 — $1,450' },
  { id: 'sau-6', action: 'Reimbursement Filed', actor: 'Alex Morgan', timestamp: 'Feb 12, 2026 5:45 PM', timestampMs: 1739393100000, description: 'Recruiting dinner claim — $185 (2 receipts)' },
  { id: 'sau-7', action: 'Contract Renewed', actor: 'AD Office', timestamp: 'Feb 5, 2026 1:00 PM', timestampMs: 1738764000000, description: 'Charter Express transportation contract extended' },
  { id: 'sau-8', action: 'Payroll Run', actor: 'Finance Office', timestamp: 'Feb 1, 2026 8:00 AM', timestampMs: 1738396800000, description: 'February stipends processed — 5 recipients, $12,400' },
  { id: 'sau-9', action: 'Control Updated', actor: 'VP Finance', timestamp: 'Jan 28, 2026 4:00 PM', timestampMs: 1738094400000, description: 'Recruiting meal cap raised from $50 to $75' },
  { id: 'sau-10', action: 'Report Generated', actor: 'Finance Office', timestamp: 'Jan 28, 2026 10:30 AM', timestampMs: 1738074600000, description: 'Recruiting Cost-per-Signee Analysis — 2024-25 cycle' },
];

// =============================================================================
// EDUCATION — Dashboard
// =============================================================================

const EDUCATION_DASHBOARD: FinanceDashboardBlock[] = [
  { id: 'ed-1', label: 'Institutional Budget', icon: 'building.columns.fill', value: '$2.5M', subValue: '72% utilized YTD', color: '#5A8A6E' },
  { id: 'ed-2', label: 'Pending Approvals', icon: 'clock.badge.checkmark.fill', value: '7', subValue: '$34,500 total', color: '#B8943E' },
  { id: 'ed-3', label: 'Tuition Receivable', icon: 'graduationcap.fill', value: '$245K', subValue: 'Spring batch deposited', color: '#1A1714' },
  { id: 'ed-4', label: 'Financial Aid Disbursed', icon: 'gift.fill', value: '$420K', subValue: '76% of allocation', color: '#1A1714' },
  { id: 'ed-5', label: 'Facilities Spend', icon: 'wrench.and.screwdriver.fill', value: '$280K', subValue: '62% of budget', color: '#B8943E' },
  { id: 'ed-6', label: 'Payroll', icon: 'banknote.fill', value: '$310K', subValue: '74% of annual', color: '#1A1714' },
  { id: 'ed-7', label: 'Grants Received', icon: 'doc.text.fill', value: '$147K', subValue: 'Federal + State', color: '#1A1714' },
  { id: 'ed-8', label: 'Outstanding Invoices', icon: 'envelope.open.fill', value: '3', subValue: '$49,700 total', color: '#1A1714' },
];

// =============================================================================
// EDUCATION — Budgets
// =============================================================================

const EDUCATION_BUDGETS: FinanceBudget[] = [
  { id: 'edb-1', category: 'Academic Departments', period: 'FY 2025-26', budgeted: 120000, actual: 88000, owner: 'Provost Office', status: 'on-track' },
  { id: 'edb-2', category: 'Admissions', period: 'FY 2025-26', budgeted: 35000, actual: 28000, owner: 'VP Enrollment', status: 'at-risk' },
  { id: 'edb-3', category: 'Student Support', period: 'FY 2025-26', budgeted: 25000, actual: 16500, owner: 'Dean of Students', status: 'on-track' },
  { id: 'edb-4', category: 'Facilities', period: 'FY 2025-26', budgeted: 45000, actual: 38000, owner: 'Facilities Dir.', status: 'at-risk' },
  { id: 'edb-5', category: 'IT', period: 'FY 2025-26', budgeted: 30000, actual: 24500, owner: 'CIO', status: 'at-risk' },
  { id: 'edb-6', category: 'Housing', period: 'FY 2025-26', budgeted: 20000, actual: 12000, owner: 'Res Life', status: 'on-track' },
  { id: 'edb-7', category: 'Compliance', period: 'FY 2025-26', budgeted: 15000, actual: 9800, owner: 'General Counsel', status: 'on-track' },
  { id: 'edb-8', category: 'Athletics', period: 'FY 2025-26', budgeted: 40000, actual: 31000, owner: 'Athletic Dir.', status: 'on-track' },
];

// =============================================================================
// EDUCATION — Ledger
// =============================================================================

const EDUCATION_LEDGER: FinanceLedgerEntry[] = [
  { id: 'edl-1', date: 'Feb 15, 2026', description: 'Spring tuition batch deposit', type: 'income', category: 'Tuition', amount: 245000, scope: 'Institution' },
  { id: 'edl-2', date: 'Feb 14, 2026', description: 'Faculty payroll — February', type: 'expense', category: 'Payroll', amount: 128000, scope: 'Institution' },
  { id: 'edl-3', date: 'Feb 12, 2026', description: 'Federal Pell Grant disbursement', type: 'income', category: 'Financial Aid', amount: 62000, scope: 'Institution' },
  { id: 'edl-4', date: 'Feb 10, 2026', description: 'Library database subscription — EBSCO', type: 'expense', category: 'IT', amount: 18500, scope: 'Department', evidence: 'PO-EDU-0218' },
  { id: 'edl-5', date: 'Feb 8, 2026', description: 'Alumni annual fund donation', type: 'income', category: 'Donations', amount: 15000, scope: 'Organization' },
  { id: 'edl-6', date: 'Feb 5, 2026', description: 'Campus maintenance contract — monthly', type: 'expense', category: 'Facilities', amount: 9200, scope: 'Institution' },
  { id: 'edl-7', date: 'Feb 3, 2026', description: 'Student housing fees — spring', type: 'income', category: 'Fees', amount: 34000, scope: 'Institution' },
  { id: 'edl-8', date: 'Feb 1, 2026', description: 'IT infrastructure upgrade — Phase 2', type: 'expense', category: 'IT', amount: 22000, scope: 'Institution', evidence: 'PO-EDU-0210' },
  { id: 'edl-9', date: 'Jan 28, 2026', description: 'State grant — spring semester', type: 'income', category: 'Grants', amount: 85000, scope: 'Institution' },
  { id: 'edl-10', date: 'Jan 25, 2026', description: 'Athletic equipment order — BSN Sports', type: 'expense', category: 'Athletics', amount: 12500, scope: 'Department' },
  { id: 'edl-11', date: 'Jan 22, 2026', description: 'Accreditation review fee — SACS', type: 'expense', category: 'Compliance', amount: 5000, scope: 'Institution' },
  { id: 'edl-12', date: 'Jan 20, 2026', description: 'Student activity fees — spring', type: 'income', category: 'Fees', amount: 18000, scope: 'Institution' },
];

// =============================================================================
// EDUCATION — Approvals
// =============================================================================

const EDUCATION_APPROVALS: FinanceApproval[] = [
  { id: 'eda-1', title: 'Science Lab Renovation Phase 1', amount: 18000, purpose: 'Update chemistry lab equipment and safety stations', requestedBy: 'Dr. Angela Morris', requestedByInitials: 'AM', approvers: ['Provost', 'VP Finance'], status: 'pending', submittedAt: 'Feb 13, 2026', evidence: 'RFP-SCI-2026' },
  { id: 'eda-2', title: 'Spring Admissions Marketing Campaign', amount: 8500, purpose: 'Digital ad spend + print collateral for fall enrollment push', requestedBy: 'James Liu', requestedByInitials: 'JL', approvers: ['VP Enrollment', 'VP Finance'], status: 'approved', submittedAt: 'Feb 9, 2026' },
  { id: 'eda-3', title: 'Commencement Speaker Honorarium', amount: 5000, purpose: 'Keynote speaker travel + honorarium for May commencement', requestedBy: 'Dean of Students', requestedByInitials: 'DS', approvers: ['President'], status: 'pending', submittedAt: 'Feb 7, 2026' },
  { id: 'eda-4', title: 'Emergency HVAC Repair — Dormitory B', amount: 12000, purpose: 'Urgent boiler replacement for student housing', requestedBy: 'Tom Franklin', requestedByInitials: 'TF', approvers: ['Facilities Dir.', 'VP Finance'], status: 'approved', submittedAt: 'Feb 5, 2026' },
];

// =============================================================================
// EDUCATION — Payables
// =============================================================================

const EDUCATION_PAYABLES: FinancePayable[] = [
  { id: 'edp-1', vendor: 'ABM Facility Services', description: 'Monthly campus maintenance — February', amount: 9200, dueDate: 'Feb 28, 2026', category: 'Facilities', status: 'pending', invoiceRef: 'ABM-22041' },
  { id: 'edp-2', vendor: 'EBSCO', description: 'Annual library database renewal', amount: 18500, dueDate: 'Mar 1, 2026', category: 'IT', status: 'pending', invoiceRef: 'EBS-9044' },
  { id: 'edp-3', vendor: 'CDW', description: 'IT infrastructure upgrade — servers', amount: 22000, dueDate: 'Feb 20, 2026', category: 'IT', status: 'paid' },
  { id: 'edp-4', vendor: 'BSN Sports', description: 'Athletic equipment — spring order', amount: 12500, dueDate: 'Feb 25, 2026', category: 'Athletics', status: 'pending', invoiceRef: 'BSN-31092' },
  { id: 'edp-5', vendor: 'Pearson Education', description: 'Textbook bulk order — spring semester', amount: 8400, dueDate: 'Mar 10, 2026', category: 'Academic', status: 'pending' },
];

// =============================================================================
// EDUCATION — Receivables
// =============================================================================

const EDUCATION_RECEIVABLES: FinanceReceivable[] = [
  { id: 'edr-1', source: 'Tuition — Late Registrants', description: 'Pending tuition from 12 late-add students', amount: 42000, dueDate: 'Feb 28, 2026', category: 'Tuition', status: 'pending' },
  { id: 'edr-2', source: 'Federal Work-Study Reimbursement', description: 'Q2 work-study wage reimbursement from DOE', amount: 28000, dueDate: 'Mar 15, 2026', category: 'Grants', status: 'pending' },
  { id: 'edr-3', source: 'Facility Rental — Community Events', description: 'Gymnasium rental — 3 weekend events', amount: 4500, dueDate: 'Feb 22, 2026', category: 'Fees', status: 'approved' },
  { id: 'edr-4', source: 'Alumni Foundation', description: 'Annual giving campaign — spring pledge', amount: 25000, dueDate: 'Apr 1, 2026', category: 'Donations', status: 'pending' },
];

// =============================================================================
// EDUCATION — Contracts
// =============================================================================

const EDUCATION_CONTRACTS: FinanceContract[] = [
  { id: 'edc-1', title: 'Campus Maintenance Agreement', vendor: 'ABM Facility Services', value: 110400, startDate: 'Jul 1, 2025', endDate: 'Jun 30, 2026', renewalDate: 'Apr 1, 2026', status: 'active' },
  { id: 'edc-2', title: 'LMS Platform License', vendor: 'Canvas by Instructure', value: 45000, startDate: 'Aug 1, 2025', endDate: 'Jul 31, 2026', status: 'active' },
  { id: 'edc-3', title: 'Food Service Contract', vendor: 'Aramark', value: 380000, startDate: 'Jul 1, 2024', endDate: 'Jun 30, 2027', renewalDate: 'Jan 1, 2027', status: 'active' },
  { id: 'edc-4', title: 'Campus Security Services', vendor: 'Allied Universal', value: 96000, startDate: 'Jul 1, 2025', endDate: 'Jun 30, 2026', renewalDate: 'Apr 15, 2026', status: 'expiring' },
];

// =============================================================================
// EDUCATION — Purchasing
// =============================================================================

const EDUCATION_PURCHASING: FinancePurchaseRequest[] = [
  { id: 'edpr-1', title: 'Chemistry Lab Safety Equipment', requestedBy: 'Dr. Angela Morris', requestedByInitials: 'AM', amount: 4200, category: 'Academic', status: 'pending', submittedAt: 'Feb 14, 2026' },
  { id: 'edpr-2', title: 'Library Furniture Replacement', requestedBy: 'Maria Santos', requestedByInitials: 'MS', amount: 8600, category: 'Facilities', status: 'approved', submittedAt: 'Feb 11, 2026' },
  { id: 'edpr-3', title: 'Classroom Projector Upgrades (5 rooms)', requestedBy: 'IT Department', requestedByInitials: 'IT', amount: 12500, category: 'IT', status: 'pending', submittedAt: 'Feb 8, 2026' },
];

// =============================================================================
// EDUCATION — Payroll
// =============================================================================

const EDUCATION_PAYROLL: FinancePayrollItem[] = [
  { id: 'edpy-1', payee: 'Full-Time Faculty (42)', payeeInitials: 'FT', period: 'Feb 2026', amount: 98000, type: 'salary', status: 'paid' },
  { id: 'edpy-2', payee: 'Adjunct Faculty (18)', payeeInitials: 'AJ', period: 'Feb 2026', amount: 24000, type: 'contractor', status: 'paid' },
  { id: 'edpy-3', payee: 'Administrative Staff (25)', payeeInitials: 'AS', period: 'Feb 2026', amount: 52000, type: 'salary', status: 'paid' },
  { id: 'edpy-4', payee: 'Student Workers (30)', payeeInitials: 'SW', period: 'Feb 2026', amount: 8400, type: 'stipend', status: 'pending' },
  { id: 'edpy-5', payee: 'Graduate Assistants (8)', payeeInitials: 'GA', period: 'Feb 2026', amount: 6800, type: 'stipend', status: 'pending' },
];

// =============================================================================
// EDUCATION — Reimbursements
// =============================================================================

const EDUCATION_REIMBURSEMENTS: FinanceReimbursement[] = [
  { id: 'edrm-1', claimant: 'Dr. Angela Morris', claimantInitials: 'AM', description: 'Conference registration — AAAS Annual Meeting', amount: 450, receipts: 1, status: 'approved', submittedAt: 'Feb 11, 2026' },
  { id: 'edrm-2', claimant: 'James Liu', claimantInitials: 'JL', description: 'Admissions fair travel — Atlanta', amount: 680, receipts: 4, status: 'pending', submittedAt: 'Feb 9, 2026' },
  { id: 'edrm-3', claimant: 'Tom Franklin', claimantInitials: 'TF', description: 'Emergency plumbing supplies — Dorm B', amount: 325, receipts: 2, status: 'paid', submittedAt: 'Feb 6, 2026' },
];

// =============================================================================
// EDUCATION — Reports
// =============================================================================

const EDUCATION_REPORTS: FinanceReport[] = [
  { id: 'edrp-1', title: 'Monthly Financial Statement — January 2026', type: 'Financial Statement', period: 'Jan 2026', generatedAt: 'Feb 5, 2026', owner: 'VP Finance' },
  { id: 'edrp-2', title: 'Financial Aid Disbursement Summary', type: 'Aid Report', period: 'Spring 2026', generatedAt: 'Feb 10, 2026', owner: 'Financial Aid Office' },
  { id: 'edrp-3', title: 'Tuition Revenue vs Enrollment Forecast', type: 'Revenue Report', period: 'FY 2025-26', generatedAt: 'Jan 28, 2026', owner: 'VP Enrollment' },
  { id: 'edrp-4', title: 'Board of Trustees Quarterly Report', type: 'Board Report', period: 'Q3 FY26', generatedAt: 'Jan 15, 2026', owner: 'President Office' },
];

// =============================================================================
// EDUCATION — Controls
// =============================================================================

const EDUCATION_CONTROLS: FinanceControl[] = [
  { id: 'edct-1', title: 'Department Purchase Limit', description: 'Purchases above threshold require VP Finance approval', threshold: 2500, enabled: true, category: 'Purchasing' },
  { id: 'edct-2', title: 'Capital Expenditure Gate', description: 'Capital items over $10K require Board notification', threshold: 10000, enabled: true, category: 'Capital' },
  { id: 'edct-3', title: 'Travel Pre-Approval', description: 'All out-of-state travel requires department chair and dean approval', enabled: true, category: 'Travel' },
  { id: 'edct-4', title: 'Grant Spending Compliance', description: 'Federal grant expenditures auto-flagged for compliance review', enabled: true, category: 'Grants' },
  { id: 'edct-5', title: 'Dual Signature — Contracts', description: 'All vendor contracts require President or VP Finance co-signature', threshold: 5000, enabled: true, category: 'Contracts' },
];

// =============================================================================
// EDUCATION — Audit
// =============================================================================

const EDUCATION_AUDIT: FinanceAuditEntry[] = [
  { id: 'edau-1', action: 'Tuition Batch Deposited', actor: 'Bursar Office', timestamp: 'Feb 15, 2026 9:00 AM', timestampMs: 1739610000000, description: 'Spring 2026 tuition batch — $245,000 deposited' },
  { id: 'edau-2', action: 'Payroll Processed', actor: 'HR / Finance', timestamp: 'Feb 14, 2026 8:00 AM', timestampMs: 1739520000000, description: 'February faculty payroll — $128,000' },
  { id: 'edau-3', action: 'Grant Received', actor: 'Financial Aid', timestamp: 'Feb 12, 2026 10:30 AM', timestampMs: 1739363400000, description: 'Federal Pell Grant disbursement — $62,000' },
  { id: 'edau-4', action: 'Approval Submitted', actor: 'Dr. Angela Morris', timestamp: 'Feb 13, 2026 2:15 PM', timestampMs: 1739462100000, description: 'Science Lab Renovation Phase 1 — $18,000' },
  { id: 'edau-5', action: 'Invoice Paid', actor: 'Finance Office', timestamp: 'Feb 10, 2026 3:45 PM', timestampMs: 1739212500000, description: 'CDW IT infrastructure invoice — $22,000' },
  { id: 'edau-6', action: 'Approval Granted', actor: 'VP Finance', timestamp: 'Feb 9, 2026 11:00 AM', timestampMs: 1739109600000, description: 'Spring Admissions Marketing Campaign — $8,500' },
  { id: 'edau-7', action: 'Contract Review', actor: 'General Counsel', timestamp: 'Feb 7, 2026 4:00 PM', timestampMs: 1738944000000, description: 'Allied Universal security contract — renewal flagged' },
  { id: 'edau-8', action: 'Reimbursement Filed', actor: 'James Liu', timestamp: 'Feb 9, 2026 9:30 AM', timestampMs: 1739104200000, description: 'Admissions fair travel claim — $680' },
  { id: 'edau-9', action: 'Budget Amendment', actor: 'VP Finance', timestamp: 'Feb 5, 2026 2:00 PM', timestampMs: 1738767600000, description: 'Emergency HVAC allocation added — $12,000 to Facilities' },
  { id: 'edau-10', action: 'Report Generated', actor: 'VP Finance', timestamp: 'Feb 5, 2026 10:00 AM', timestampMs: 1738753200000, description: 'Monthly Financial Statement — January 2026' },
];

// =============================================================================
// CHURCH — Dashboard
// =============================================================================

const CHURCH_DASHBOARD: FinanceDashboardBlock[] = [
  { id: 'cd-1', label: 'Monthly Giving', icon: 'heart.fill', value: '$33,500', subValue: 'Tithes + offerings MTD', color: '#5A8A6E' },
  { id: 'cd-2', label: 'Budget Utilization', icon: 'chart.bar.fill', value: '68%', subValue: '$56K of $83K', color: '#1A1714' },
  { id: 'cd-3', label: 'Pending Approvals', icon: 'clock.badge.checkmark.fill', value: '3', subValue: '$11,300 total', color: '#B8943E' },
  { id: 'cd-4', label: 'Benevolence Fund', icon: 'hand.raised.fill', value: '$5,000', subValue: '$2,100 disbursed', color: '#1A1714' },
  { id: 'cd-5', label: 'Building Fund', icon: 'building.fill', value: '$8,200', subValue: 'Pledges received', color: '#B8943E' },
  { id: 'cd-6', label: 'Staff Payroll', icon: 'banknote.fill', value: '$25,000', subValue: '5 staff + 3 contractors', color: '#1A1714' },
  { id: 'cd-7', label: 'Outstanding Payables', icon: 'envelope.open.fill', value: '2', subValue: '$11,300 total', color: '#1A1714' },
  { id: 'cd-8', label: 'Designated Gifts', icon: 'gift.fill', value: '$4,800', subValue: 'Missions + Youth', color: '#1A1714' },
];

// =============================================================================
// CHURCH — Budgets
// =============================================================================

const CHURCH_BUDGETS: FinanceBudget[] = [
  { id: 'chb-1', category: 'Facilities', period: 'FY 2025-26', budgeted: 18000, actual: 13500, owner: 'Facilities Deacon', status: 'at-risk' },
  { id: 'chb-2', category: 'Worship & Media', period: 'FY 2025-26', budgeted: 8000, actual: 5200, owner: 'Worship Dir.', status: 'on-track' },
  { id: 'chb-3', category: 'Outreach', period: 'FY 2025-26', budgeted: 6000, actual: 3800, owner: 'Outreach Lead', status: 'on-track' },
  { id: 'chb-4', category: 'Ministry Programs', period: 'FY 2025-26', budgeted: 10000, actual: 7200, owner: 'Ministry Dir.', status: 'on-track' },
  { id: 'chb-5', category: 'Events', period: 'FY 2025-26', budgeted: 7000, actual: 4500, owner: 'Events Coord.', status: 'on-track' },
  { id: 'chb-6', category: 'Staff', period: 'FY 2025-26', budgeted: 25000, actual: 20000, owner: 'Admin Pastor', status: 'on-track' },
  { id: 'chb-7', category: 'Benevolence', period: 'FY 2025-26', budgeted: 5000, actual: 2100, owner: 'Benevolence Team', status: 'on-track' },
  { id: 'chb-8', category: 'Operations', period: 'FY 2025-26', budgeted: 4000, actual: 3200, owner: 'Admin Pastor', status: 'at-risk' },
];

// =============================================================================
// CHURCH — Ledger
// =============================================================================

const CHURCH_LEDGER: FinanceLedgerEntry[] = [
  { id: 'chl-1', date: 'Feb 16, 2026', description: 'Sunday tithes — Feb 16', type: 'income', category: 'Tithes', amount: 14200, scope: 'Campus' },
  { id: 'chl-2', date: 'Feb 15, 2026', description: 'Utility bill — Main Campus', type: 'expense', category: 'Facilities', amount: 3800, scope: 'Campus' },
  { id: 'chl-3', date: 'Feb 14, 2026', description: 'Online giving — weekly batch', type: 'income', category: 'Offerings', amount: 6500, scope: 'Organization' },
  { id: 'chl-4', date: 'Feb 12, 2026', description: 'Sound board upgrade — sanctuary', type: 'expense', category: 'Worship & Media', amount: 4500, scope: 'Campus', evidence: 'PO-CH-0212' },
  { id: 'chl-5', date: 'Feb 10, 2026', description: 'Building fund pledges received', type: 'income', category: 'Building Fund', amount: 8200, scope: 'Organization' },
  { id: 'chl-6', date: 'Feb 9, 2026', description: 'Sunday tithes — Feb 9', type: 'income', category: 'Tithes', amount: 12800, scope: 'Campus' },
  { id: 'chl-7', date: 'Feb 8, 2026', description: 'Missions trip supplies — Haiti', type: 'expense', category: 'Outreach', amount: 2200, scope: 'Ministry' },
  { id: 'chl-8', date: 'Feb 5, 2026', description: 'Youth ministry curriculum purchase', type: 'expense', category: 'Ministry Programs', amount: 680, scope: 'Ministry' },
  { id: 'chl-9', date: 'Feb 3, 2026', description: 'Designated gift — Missions fund', type: 'income', category: 'Designated Gifts', amount: 3200, scope: 'Ministry' },
  { id: 'chl-10', date: 'Feb 1, 2026', description: 'Staff payroll — February', type: 'expense', category: 'Staff', amount: 18500, scope: 'Organization' },
  { id: 'chl-11', date: 'Jan 30, 2026', description: 'Benevolence disbursement — family support', type: 'expense', category: 'Benevolence', amount: 1200, scope: 'Ministry' },
  { id: 'chl-12', date: 'Jan 28, 2026', description: 'Designated gift — Youth retreat', type: 'income', category: 'Designated Gifts', amount: 1600, scope: 'Ministry' },
];

// =============================================================================
// CHURCH — Approvals
// =============================================================================

const CHURCH_APPROVALS: FinanceApproval[] = [
  { id: 'cha-1', title: 'Sanctuary HVAC Maintenance', amount: 6800, purpose: 'Annual HVAC system inspection and filter replacement', requestedBy: 'Deacon Williams', requestedByInitials: 'DW', approvers: ['Admin Pastor', 'Finance Committee'], status: 'pending', submittedAt: 'Feb 13, 2026' },
  { id: 'cha-2', title: 'Easter Production Budget', amount: 3200, purpose: 'Stage design, lighting, and media for Easter services', requestedBy: 'Worship Dir.', requestedByInitials: 'WD', approvers: ['Admin Pastor'], status: 'approved', submittedAt: 'Feb 10, 2026' },
  { id: 'cha-3', title: 'Missions Trip Airfare — Haiti Team', amount: 4800, purpose: 'Round-trip flights for 4-person missions team', requestedBy: 'Pastor Adewale', requestedByInitials: 'PA', approvers: ['Admin Pastor', 'Finance Committee'], status: 'pending', submittedAt: 'Feb 7, 2026' },
  { id: 'cha-4', title: 'Benevolence Emergency Assistance', amount: 1500, purpose: 'Rent assistance for member family in crisis', requestedBy: 'Benevolence Team', requestedByInitials: 'BT', approvers: ['Pastor Carter'], status: 'approved', submittedAt: 'Feb 5, 2026' },
];

// =============================================================================
// CHURCH — Payables
// =============================================================================

const CHURCH_PAYABLES: FinancePayable[] = [
  { id: 'chp-1', vendor: 'Pro Audio Supply', description: 'Sound board equipment upgrade', amount: 4500, dueDate: 'Mar 1, 2026', category: 'Worship & Media', status: 'pending', invoiceRef: 'PAS-2210' },
  { id: 'chp-2', vendor: 'HVAC Solutions', description: 'Sanctuary HVAC maintenance contract', amount: 6800, dueDate: 'Feb 25, 2026', category: 'Facilities', status: 'pending' },
  { id: 'chp-3', vendor: 'Lifeway Christian', description: 'Youth ministry curriculum — spring quarter', amount: 680, dueDate: 'Feb 20, 2026', category: 'Ministry Programs', status: 'paid' },
  { id: 'chp-4', vendor: 'FPL (MSU-Northern Power)', description: 'Main campus utility bill — February', amount: 3800, dueDate: 'Mar 5, 2026', category: 'Facilities', status: 'pending' },
  { id: 'chp-5', vendor: 'Mission Depot', description: 'Haiti missions trip supplies', amount: 2200, dueDate: 'Feb 18, 2026', category: 'Outreach', status: 'paid' },
];

// =============================================================================
// CHURCH — Receivables
// =============================================================================

const CHURCH_RECEIVABLES: FinanceReceivable[] = [
  { id: 'chr-1', source: 'Weekly Tithes & Offerings', description: 'Projected giving — remaining February Sundays', amount: 24000, dueDate: 'Feb 28, 2026', category: 'Tithes', status: 'pending' },
  { id: 'chr-2', source: 'Building Fund Campaign', description: 'Outstanding pledges — Phase 2 renovation', amount: 15000, dueDate: 'Mar 31, 2026', category: 'Building Fund', status: 'pending' },
  { id: 'chr-3', source: 'Designated Gifts — Easter', description: 'Early Easter offering commitments', amount: 6500, dueDate: 'Apr 5, 2026', category: 'Designated Gifts', status: 'pending' },
  { id: 'chr-4', source: 'Facility Rental', description: 'Community group rental — Fellowship Hall', amount: 800, dueDate: 'Feb 22, 2026', category: 'Fees', status: 'approved' },
];

// =============================================================================
// CHURCH — Contracts
// =============================================================================

const CHURCH_CONTRACTS: FinanceContract[] = [
  { id: 'chc-1', title: 'HVAC Maintenance Agreement', vendor: 'HVAC Solutions', value: 16200, startDate: 'Jan 1, 2026', endDate: 'Dec 31, 2026', status: 'active' },
  { id: 'chc-2', title: 'Worship Software License', vendor: 'Planning Center', value: 2400, startDate: 'Jul 1, 2025', endDate: 'Jun 30, 2026', renewalDate: 'May 1, 2026', status: 'active' },
  { id: 'chc-3', title: 'Janitorial Services', vendor: 'CleanPro Inc', value: 9600, startDate: 'Aug 1, 2025', endDate: 'Jul 31, 2026', status: 'active' },
  { id: 'chc-4', title: 'Sound System Lease', vendor: 'Pro Audio Supply', value: 4800, startDate: 'Mar 1, 2024', endDate: 'Feb 28, 2026', renewalDate: 'Jan 15, 2026', status: 'expiring' },
];

// =============================================================================
// CHURCH — Purchasing
// =============================================================================

const CHURCH_PURCHASING: FinancePurchaseRequest[] = [
  { id: 'chpr-1', title: 'Easter Stage Design Materials', requestedBy: 'Worship Dir.', requestedByInitials: 'WD', amount: 1800, category: 'Events', status: 'approved', submittedAt: 'Feb 12, 2026' },
  { id: 'chpr-2', title: 'Children\'s Ministry Supplies — Spring', requestedBy: 'Sister Keisha', requestedByInitials: 'SK', amount: 450, category: 'Ministry Programs', status: 'approved', submittedAt: 'Feb 10, 2026' },
  { id: 'chpr-3', title: 'Parking Lot Lighting Upgrade', requestedBy: 'Deacon Williams', requestedByInitials: 'DW', amount: 3200, category: 'Facilities', status: 'pending', submittedAt: 'Feb 8, 2026' },
];

// =============================================================================
// CHURCH — Payroll
// =============================================================================

const CHURCH_PAYROLL: FinancePayrollItem[] = [
  { id: 'chpy-1', payee: 'Pastor Philip Anthony Mitchell', payeeInitials: 'DK', period: 'Feb 2026', amount: 6500, type: 'salary', status: 'paid' },
  { id: 'chpy-2', payee: 'Admin Pastor Thomas', payeeInitials: 'AT', period: 'Feb 2026', amount: 4800, type: 'salary', status: 'paid' },
  { id: 'chpy-3', payee: 'Worship Director', payeeInitials: 'WD', period: 'Feb 2026', amount: 3500, type: 'salary', status: 'paid' },
  { id: 'chpy-4', payee: 'Musicians (4)', payeeInitials: 'MU', period: 'Feb 2026', amount: 2400, type: 'contractor', status: 'pending' },
  { id: 'chpy-5', payee: 'Guest Speaker — Dr. Osei', payeeInitials: 'DO', period: 'Feb 9, 2026', amount: 500, type: 'honorarium', status: 'paid' },
];

// =============================================================================
// CHURCH — Reimbursements
// =============================================================================

const CHURCH_REIMBURSEMENTS: FinanceReimbursement[] = [
  { id: 'chrm-1', claimant: 'Deacon Williams', claimantInitials: 'DW', description: 'Hardware store — emergency plumbing repair', amount: 142, receipts: 2, status: 'approved', submittedAt: 'Feb 10, 2026' },
  { id: 'chrm-2', claimant: 'Sister Keisha', claimantInitials: 'SK', description: 'Children\'s ministry snacks — 4 Sundays', amount: 88, receipts: 4, status: 'pending', submittedAt: 'Feb 8, 2026' },
  { id: 'chrm-3', claimant: 'Pastor Adewale', claimantInitials: 'PA', description: 'Missions planning dinner — team of 6', amount: 165, receipts: 1, status: 'pending', submittedAt: 'Feb 5, 2026' },
];

// =============================================================================
// CHURCH — Reports
// =============================================================================

const CHURCH_REPORTS: FinanceReport[] = [
  { id: 'chrp-1', title: 'Monthly Giving Report — January 2026', type: 'Giving Report', period: 'Jan 2026', generatedAt: 'Feb 3, 2026', owner: 'Finance Committee' },
  { id: 'chrp-2', title: 'Budget vs Actuals — Q2', type: 'Budget Report', period: 'Q2 FY26', generatedAt: 'Jan 15, 2026', owner: 'Admin Pastor' },
  { id: 'chrp-3', title: 'Benevolence Fund Activity', type: 'Ministry Report', period: 'FY 2025-26 YTD', generatedAt: 'Feb 10, 2026', owner: 'Benevolence Team' },
  { id: 'chrp-4', title: 'Annual Stewardship Summary', type: 'Stewardship Report', period: 'CY 2025', generatedAt: 'Jan 8, 2026', owner: 'Senior Pastor' },
];

// =============================================================================
// CHURCH — Controls
// =============================================================================

const CHURCH_CONTROLS: FinanceControl[] = [
  { id: 'chct-1', title: 'Spending Approval Threshold', description: 'Ministry spending above threshold requires Finance Committee approval', threshold: 500, enabled: true, category: 'Purchasing' },
  { id: 'chct-2', title: 'Benevolence Dual Review', description: 'All benevolence disbursements require two approvers', enabled: true, category: 'Benevolence' },
  { id: 'chct-3', title: 'Designated Gift Tracking', description: 'Designated gifts must be tracked and spent according to donor intent', enabled: true, category: 'Giving' },
  { id: 'chct-4', title: 'Cash Handling Policy', description: 'Cash offerings counted by two unrelated individuals with documented tally', enabled: true, category: 'Operations' },
  { id: 'chct-5', title: 'Annual Audit Requirement', description: 'Independent financial review conducted annually and presented to congregation', enabled: true, category: 'Audit' },
];

// =============================================================================
// CHURCH — Audit
// =============================================================================

const CHURCH_AUDIT: FinanceAuditEntry[] = [
  { id: 'chau-1', action: 'Tithes Deposited', actor: 'Finance Committee', timestamp: 'Feb 16, 2026 1:30 PM', timestampMs: 1739716200000, description: 'Sunday tithes — $14,200 deposited (2 counters verified)' },
  { id: 'chau-2', action: 'Online Giving Batch', actor: 'System', timestamp: 'Feb 14, 2026 12:00 AM', timestampMs: 1739498400000, description: 'Weekly online giving auto-deposited — $6,500' },
  { id: 'chau-3', action: 'Purchase Approved', actor: 'Admin Pastor', timestamp: 'Feb 12, 2026 3:00 PM', timestampMs: 1739383200000, description: 'Sound board upgrade — $4,500 approved' },
  { id: 'chau-4', action: 'Benevolence Disbursement', actor: 'Benevolence Team', timestamp: 'Feb 10, 2026 10:00 AM', timestampMs: 1739191200000, description: 'Family rent assistance — $1,200 (dual-reviewed)' },
  { id: 'chau-5', action: 'Approval Submitted', actor: 'Deacon Williams', timestamp: 'Feb 13, 2026 11:15 AM', timestampMs: 1739451300000, description: 'HVAC Maintenance request — $6,800' },
  { id: 'chau-6', action: 'Payroll Processed', actor: 'Admin Pastor', timestamp: 'Feb 1, 2026 8:00 AM', timestampMs: 1738396800000, description: 'February staff payroll — $18,500' },
  { id: 'chau-7', action: 'Building Fund Update', actor: 'Finance Committee', timestamp: 'Feb 10, 2026 4:00 PM', timestampMs: 1739212800000, description: 'Building fund pledges — $8,200 received and posted' },
  { id: 'chau-8', action: 'Reimbursement Filed', actor: 'Deacon Williams', timestamp: 'Feb 10, 2026 5:30 PM', timestampMs: 1739218200000, description: 'Emergency plumbing repair — $142 claim submitted' },
  { id: 'chau-9', action: 'Report Generated', actor: 'Finance Committee', timestamp: 'Feb 3, 2026 9:00 AM', timestampMs: 1738573200000, description: 'Monthly Giving Report — January 2026' },
  { id: 'chau-10', action: 'Control Updated', actor: 'Finance Committee', timestamp: 'Jan 28, 2026 7:00 PM', timestampMs: 1738105200000, description: 'Spending approval threshold raised from $300 to $500' },
];

// =============================================================================
// BUSINESS — Dashboard
// =============================================================================

const BUSINESS_DASHBOARD: FinanceDashboardBlock[] = [
  { id: 'end-1', label: 'Monthly Burn Rate', icon: 'flame.fill', value: '$42K', subValue: '18-mo runway', color: '#B85C5C' },
  { id: 'end-2', label: 'Revenue MTD', icon: 'chart.line.uptrend.xyaxis', value: '$32K', subValue: '+12% MoM', color: '#5A8A6E' },
  { id: 'end-3', label: 'Pending Approvals', icon: 'clock.badge.checkmark.fill', value: '5', subValue: '$18,200 total', color: '#B8943E' },
  { id: 'end-4', label: 'Cloud / Tools', icon: 'cloud.fill', value: '$12,000', subValue: 'AWS + SaaS stack', color: '#1A1714' },
  { id: 'end-5', label: 'Payroll', icon: 'banknote.fill', value: '$180K', subValue: '12 FTE + 4 contractors', color: '#1A1714' },
  { id: 'end-6', label: 'AR Outstanding', icon: 'envelope.open.fill', value: '$48K', subValue: '6 open invoices', color: '#1A1714' },
  { id: 'end-7', label: 'Contractor Spend', icon: 'person.2.fill', value: '$45K', subValue: 'Q1 2026 YTD', color: '#B8943E' },
  { id: 'end-8', label: 'Compliance Filings', icon: 'checkmark.seal.fill', value: '1 due', subValue: 'Q4 990 — Mar 15', color: '#1A1714' },
];

// =============================================================================
// BUSINESS — Budgets
// =============================================================================

const BUSINESS_BUDGETS: FinanceBudget[] = [
  { id: 'enb-1', category: 'Payroll', period: 'FY 2026', budgeted: 180000, actual: 135000, owner: 'CFO', status: 'on-track' },
  { id: 'enb-2', category: 'Contractors', period: 'FY 2026', budgeted: 45000, actual: 38000, owner: 'VP Engineering', status: 'at-risk' },
  { id: 'enb-3', category: 'Cloud / Tools', period: 'FY 2026', budgeted: 12000, actual: 9200, owner: 'CTO', status: 'on-track' },
  { id: 'enb-4', category: 'Marketing', period: 'FY 2026', budgeted: 20000, actual: 14500, owner: 'VP Marketing', status: 'on-track' },
  { id: 'enb-5', category: 'Sales', period: 'FY 2026', budgeted: 15000, actual: 11000, owner: 'VP Sales', status: 'on-track' },
  { id: 'enb-6', category: 'Legal', period: 'FY 2026', budgeted: 8000, actual: 6200, owner: 'General Counsel', status: 'at-risk' },
  { id: 'enb-7', category: 'Travel', period: 'FY 2026', budgeted: 10000, actual: 5800, owner: 'Operations', status: 'on-track' },
  { id: 'enb-8', category: 'Facilities', period: 'FY 2026', budgeted: 6000, actual: 4500, owner: 'Operations', status: 'on-track' },
  { id: 'enb-9', category: 'R&D', period: 'FY 2026', budgeted: 25000, actual: 18000, owner: 'CTO', status: 'on-track' },
];

// =============================================================================
// BUSINESS — Ledger
// =============================================================================

const BUSINESS_LEDGER: FinanceLedgerEntry[] = [
  { id: 'enl-1', date: 'Feb 15, 2026', description: 'SaaS subscription — Acme Corp', type: 'income', category: 'Revenue', amount: 4800, scope: 'Entity' },
  { id: 'enl-2', date: 'Feb 14, 2026', description: 'AWS infrastructure — February', type: 'expense', category: 'Cloud / Tools', amount: 3200, scope: 'Entity', evidence: 'AWS-FEB-26' },
  { id: 'enl-3', date: 'Feb 12, 2026', description: 'SaaS subscription — Beta Inc', type: 'income', category: 'Revenue', amount: 2400, scope: 'Entity' },
  { id: 'enl-4', date: 'Feb 10, 2026', description: 'Design contractor payment — Studio Nine', type: 'expense', category: 'Contractors', amount: 5500, scope: 'Department' },
  { id: 'enl-5', date: 'Feb 8, 2026', description: 'Pilot fee — Gamma Labs', type: 'income', category: 'Revenue', amount: 8000, scope: 'Entity' },
  { id: 'enl-6', date: 'Feb 5, 2026', description: 'Legal review — terms of service update', type: 'expense', category: 'Legal', amount: 2800, scope: 'Organization' },
  { id: 'enl-7', date: 'Feb 3, 2026', description: 'SaaS subscription — Delta Co', type: 'income', category: 'Revenue', amount: 4800, scope: 'Entity' },
  { id: 'enl-8', date: 'Feb 1, 2026', description: 'Team offsite — Helena planning session', type: 'expense', category: 'Travel', amount: 4200, scope: 'Organization' },
  { id: 'enl-9', date: 'Jan 30, 2026', description: 'Google + Meta ad spend — January', type: 'expense', category: 'Marketing', amount: 6500, scope: 'Department' },
  { id: 'enl-10', date: 'Jan 28, 2026', description: 'Enterprise license — Omega Corp', type: 'income', category: 'Revenue', amount: 12000, scope: 'Entity' },
  { id: 'enl-11', date: 'Jan 25, 2026', description: 'Co-working space rent — February', type: 'expense', category: 'Facilities', amount: 2800, scope: 'Organization' },
  { id: 'enl-12', date: 'Jan 22, 2026', description: 'Sales commission payout — January', type: 'expense', category: 'Sales', amount: 3200, scope: 'Department' },
];

// =============================================================================
// BUSINESS — Approvals
// =============================================================================

const BUSINESS_APPROVALS: FinanceApproval[] = [
  { id: 'ena-1', title: 'Annual AWS Reserved Instances', amount: 8400, purpose: 'Lock in 1-year RI pricing for production workloads', requestedBy: 'Devon Okafor', requestedByInitials: 'DO', approvers: ['CTO', 'CFO'], status: 'pending', submittedAt: 'Feb 13, 2026', evidence: 'AWS-RI-Quote-2026' },
  { id: 'ena-2', title: 'Q2 Marketing Campaign', amount: 5000, purpose: 'Paid acquisition + content syndication for spring launch', requestedBy: 'Priya Desai', requestedByInitials: 'PD', approvers: ['VP Marketing', 'CFO'], status: 'approved', submittedAt: 'Feb 10, 2026' },
  { id: 'ena-3', title: 'Legal Retainer — IP Filing', amount: 3800, purpose: 'Patent application preparation for core algorithm', requestedBy: 'General Counsel', requestedByInitials: 'GC', approvers: ['CEO'], status: 'pending', submittedAt: 'Feb 8, 2026' },
  { id: 'ena-4', title: 'Engineering Contractor Extension', amount: 12000, purpose: 'Extend Studio Nine design contract through Q2', requestedBy: 'VP Engineering', requestedByInitials: 'VE', approvers: ['CTO', 'CFO'], status: 'draft', submittedAt: 'Feb 6, 2026' },
];

// =============================================================================
// BUSINESS — Payables
// =============================================================================

const BUSINESS_PAYABLES: FinancePayable[] = [
  { id: 'enp-1', vendor: 'Amazon Web Services', description: 'Cloud infrastructure — February usage', amount: 3200, dueDate: 'Mar 5, 2026', category: 'Cloud / Tools', status: 'pending', invoiceRef: 'AWS-INV-FEB26' },
  { id: 'enp-2', vendor: 'Wilson & Associates', description: 'Legal counsel — ToS review + IP consult', amount: 2800, dueDate: 'Feb 25, 2026', category: 'Legal', status: 'paid' },
  { id: 'enp-3', vendor: 'Studio Nine', description: 'Design contractor — February deliverables', amount: 5500, dueDate: 'Feb 28, 2026', category: 'Contractors', status: 'pending', invoiceRef: 'SN-2026-02' },
  { id: 'enp-4', vendor: 'WeWork', description: 'Co-working space — March rent', amount: 2800, dueDate: 'Mar 1, 2026', category: 'Facilities', status: 'pending' },
  { id: 'enp-5', vendor: 'Figma / Linear / Notion', description: 'SaaS tool stack — monthly', amount: 1200, dueDate: 'Mar 1, 2026', category: 'Cloud / Tools', status: 'pending' },
];

// =============================================================================
// BUSINESS — Receivables
// =============================================================================

const BUSINESS_RECEIVABLES: FinanceReceivable[] = [
  { id: 'enr-1', source: 'Acme Corp', description: 'Monthly SaaS license — March', amount: 4800, dueDate: 'Mar 1, 2026', category: 'Subscriptions', status: 'pending' },
  { id: 'enr-2', source: 'Omega Corp', description: 'Enterprise annual license — Q2 installment', amount: 12000, dueDate: 'Apr 1, 2026', category: 'Subscriptions', status: 'pending' },
  { id: 'enr-3', source: 'Gamma Labs', description: 'Pilot extension fee — Phase 2', amount: 8000, dueDate: 'Mar 15, 2026', category: 'Pilot Fees', status: 'approved' },
  { id: 'enr-4', source: 'Beta Inc', description: 'Monthly SaaS license — March', amount: 2400, dueDate: 'Mar 1, 2026', category: 'Subscriptions', status: 'pending' },
];

// =============================================================================
// BUSINESS — Contracts
// =============================================================================

const BUSINESS_CONTRACTS: FinanceContract[] = [
  { id: 'enc-1', title: 'AWS Enterprise Support', vendor: 'Amazon Web Services', value: 38400, startDate: 'Jan 1, 2026', endDate: 'Dec 31, 2026', status: 'active' },
  { id: 'enc-2', title: 'Design Services Agreement', vendor: 'Studio Nine', value: 66000, startDate: 'Jul 1, 2025', endDate: 'Jun 30, 2026', renewalDate: 'Apr 1, 2026', status: 'active' },
  { id: 'enc-3', title: 'Legal Retainer', vendor: 'Wilson & Associates', value: 24000, startDate: 'Jan 1, 2026', endDate: 'Dec 31, 2026', status: 'active' },
  { id: 'enc-4', title: 'Co-Working Space Lease', vendor: 'WeWork', value: 33600, startDate: 'Aug 1, 2025', endDate: 'Jul 31, 2026', renewalDate: 'May 1, 2026', status: 'expiring' },
];

// =============================================================================
// BUSINESS — Purchasing
// =============================================================================

const BUSINESS_PURCHASING: FinancePurchaseRequest[] = [
  { id: 'enpr-1', title: 'MacBook Pro — New Engineering Hire', requestedBy: 'VP Engineering', requestedByInitials: 'VE', amount: 3200, category: 'Equipment', status: 'approved', submittedAt: 'Feb 12, 2026' },
  { id: 'enpr-2', title: 'Conference Tickets — SaaStr Annual', requestedBy: 'Priya Desai', requestedByInitials: 'PD', amount: 2400, category: 'Marketing', status: 'pending', submittedAt: 'Feb 10, 2026' },
  { id: 'enpr-3', title: 'Security Audit — SOC 2 Prep', requestedBy: 'CTO', requestedByInitials: 'CT', amount: 8500, category: 'Compliance', status: 'pending', submittedAt: 'Feb 8, 2026' },
  { id: 'enpr-4', title: 'Standing Desks (4x)', requestedBy: 'Operations', requestedByInitials: 'OP', amount: 2800, category: 'Facilities', status: 'draft', submittedAt: 'Feb 6, 2026' },
];

// =============================================================================
// BUSINESS — Payroll
// =============================================================================

const BUSINESS_PAYROLL: FinancePayrollItem[] = [
  { id: 'enpy-1', payee: 'Full-Time Employees (12)', payeeInitials: 'FT', period: 'Feb 2026', amount: 148000, type: 'salary', status: 'paid' },
  { id: 'enpy-2', payee: 'Studio Nine — Design', payeeInitials: 'SN', period: 'Feb 2026', amount: 5500, type: 'contractor', status: 'pending' },
  { id: 'enpy-3', payee: 'DevOps Consultant', payeeInitials: 'DC', period: 'Feb 2026', amount: 4200, type: 'contractor', status: 'pending' },
  { id: 'enpy-4', payee: 'Content Writer', payeeInitials: 'CW', period: 'Feb 2026', amount: 2800, type: 'contractor', status: 'pending' },
  { id: 'enpy-5', payee: 'Sales Commission Pool', payeeInitials: 'SC', period: 'Feb 2026', amount: 3200, type: 'salary', status: 'paid' },
];

// =============================================================================
// BUSINESS — Reimbursements
// =============================================================================

const BUSINESS_REIMBURSEMENTS: FinanceReimbursement[] = [
  { id: 'enrm-1', claimant: 'Devon Okafor', claimantInitials: 'DO', description: 'Client dinner — Omega Corp renewal', amount: 285, receipts: 1, status: 'approved', submittedAt: 'Feb 11, 2026' },
  { id: 'enrm-2', claimant: 'Priya Desai', claimantInitials: 'PD', description: 'Uber / meals — Helena offsite', amount: 340, receipts: 6, status: 'pending', submittedAt: 'Feb 3, 2026' },
  { id: 'enrm-3', claimant: 'VP Engineering', claimantInitials: 'VE', description: 'Monitor adapter + cables — home office', amount: 95, receipts: 2, status: 'paid', submittedAt: 'Jan 28, 2026' },
];

// =============================================================================
// BUSINESS — Reports
// =============================================================================

const BUSINESS_REPORTS: FinanceReport[] = [
  { id: 'enrp-1', title: 'Monthly P&L — January 2026', type: 'P&L Statement', period: 'Jan 2026', generatedAt: 'Feb 5, 2026', owner: 'CFO' },
  { id: 'enrp-2', title: 'Runway & Burn Analysis', type: 'Cash Flow Report', period: 'FY 2026 YTD', generatedAt: 'Feb 10, 2026', owner: 'CFO' },
  { id: 'enrp-3', title: 'Revenue by Customer Segment', type: 'Revenue Report', period: 'Q4 2025 + Q1 2026', generatedAt: 'Feb 8, 2026', owner: 'VP Sales' },
  { id: 'enrp-4', title: 'Board Financial Package — Q4', type: 'Board Report', period: 'Q4 2025', generatedAt: 'Jan 20, 2026', owner: 'CEO' },
];

// =============================================================================
// BUSINESS — Controls
// =============================================================================

const BUSINESS_CONTROLS: FinanceControl[] = [
  { id: 'enct-1', title: 'Single Purchase Limit', description: 'Purchases above threshold require CFO approval', threshold: 1000, enabled: true, category: 'Purchasing' },
  { id: 'enct-2', title: 'Contractor Payment Cap', description: 'Monthly contractor payments above threshold flagged', threshold: 10000, enabled: true, category: 'Payroll' },
  { id: 'enct-3', title: 'Travel Pre-Approval', description: 'All travel over $500 requires manager + CFO approval', threshold: 500, enabled: true, category: 'Travel' },
  { id: 'enct-4', title: 'Dual Signature — Contracts', description: 'Contracts above threshold require CEO + CFO signatures', threshold: 10000, enabled: true, category: 'Contracts' },
  { id: 'enct-5', title: 'Expense Report Deadline', description: 'Reimbursement claims must be filed within 30 days of expense', enabled: true, category: 'Reimbursements' },
];

// =============================================================================
// BUSINESS — Audit
// =============================================================================

const BUSINESS_AUDIT: FinanceAuditEntry[] = [
  { id: 'enau-1', action: 'Revenue Received', actor: 'System', timestamp: 'Feb 15, 2026 9:00 AM', timestampMs: 1739610000000, description: 'Acme Corp SaaS payment — $4,800 auto-collected' },
  { id: 'enau-2', action: 'Invoice Paid', actor: 'Finance', timestamp: 'Feb 14, 2026 2:00 PM', timestampMs: 1739552400000, description: 'AWS February infrastructure — $3,200' },
  { id: 'enau-3', action: 'Approval Submitted', actor: 'Devon Okafor', timestamp: 'Feb 13, 2026 4:30 PM', timestampMs: 1739470200000, description: 'AWS Reserved Instances — $8,400 request' },
  { id: 'enau-4', action: 'Approval Granted', actor: 'CFO', timestamp: 'Feb 10, 2026 11:00 AM', timestampMs: 1739195400000, description: 'Q2 Marketing Campaign — $5,000 approved' },
  { id: 'enau-5', action: 'Contractor Payment', actor: 'Finance', timestamp: 'Feb 10, 2026 3:00 PM', timestampMs: 1739210400000, description: 'Studio Nine — $5,500 for February deliverables' },
  { id: 'enau-6', action: 'Payroll Run', actor: 'HR / Finance', timestamp: 'Feb 1, 2026 8:00 AM', timestampMs: 1738396800000, description: 'February payroll processed — 12 FTE, $148,000' },
  { id: 'enau-7', action: 'Reimbursement Filed', actor: 'Priya Desai', timestamp: 'Feb 3, 2026 5:00 PM', timestampMs: 1738602000000, description: 'Helena offsite expenses — $340 (6 receipts)' },
  { id: 'enau-8', action: 'Contract Review', actor: 'CFO', timestamp: 'Feb 5, 2026 10:00 AM', timestampMs: 1738753200000, description: 'WeWork lease renewal flagged — expiring Jul 31' },
  { id: 'enau-9', action: 'Budget Transfer', actor: 'CFO', timestamp: 'Jan 28, 2026 3:00 PM', timestampMs: 1738090800000, description: 'Moved $3K from Travel to Contractors for Q1' },
  { id: 'enau-10', action: 'Report Generated', actor: 'CFO', timestamp: 'Feb 5, 2026 11:30 AM', timestampMs: 1738758600000, description: 'Monthly P&L — January 2026' },
];

// =============================================================================
// COMMUNITY — Dashboard
// =============================================================================

const COMMUNITY_DASHBOARD: FinanceDashboardBlock[] = [
  { id: 'cod-1', label: 'Season Budget', icon: 'chart.bar.fill', value: '$90K', subValue: '58% utilized', color: '#5A8A6E' },
  { id: 'cod-2', label: 'Pending Approvals', icon: 'clock.badge.checkmark.fill', value: '3', subValue: '$6,400 total', color: '#B8943E' },
  { id: 'cod-3', label: 'Venue Spend', icon: 'mappin.and.ellipse', value: '$30K', subValue: '3 events booked', color: '#1A1714' },
  { id: 'cod-4', label: 'Entry Fee Revenue', icon: 'ticket.fill', value: '$18K', subValue: '45 teams registered', color: '#1A1714' },
  { id: 'cod-5', label: 'Sponsorship Revenue', icon: 'megaphone.fill', value: '$22K', subValue: '3 sponsors signed', color: '#B8943E' },
  { id: 'cod-6', label: 'Officials Expense', icon: 'person.badge.shield.checkmark.fill', value: '$15K', subValue: '12 officials contracted', color: '#1A1714' },
  { id: 'cod-7', label: 'Staffing', icon: 'person.3.fill', value: '$10K', subValue: '8 event staff', color: '#1A1714' },
  { id: 'cod-8', label: 'Outstanding Payables', icon: 'envelope.open.fill', value: '4', subValue: '$12,800 total', color: '#1A1714' },
];

// =============================================================================
// COMMUNITY — Budgets
// =============================================================================

const COMMUNITY_BUDGETS: FinanceBudget[] = [
  { id: 'cob-1', category: 'Venue', period: '2026 Season', budgeted: 30000, actual: 18500, owner: 'Event Dir.', status: 'on-track' },
  { id: 'cob-2', category: 'Officials', period: '2026 Season', budgeted: 15000, actual: 9200, owner: 'Officials Coord.', status: 'on-track' },
  { id: 'cob-3', category: 'Security', period: '2026 Season', budgeted: 8000, actual: 5400, owner: 'Operations', status: 'on-track' },
  { id: 'cob-4', category: 'Medical', period: '2026 Season', budgeted: 5000, actual: 2800, owner: 'Medical Dir.', status: 'on-track' },
  { id: 'cob-5', category: 'Media', period: '2026 Season', budgeted: 12000, actual: 8500, owner: 'Media Dir.', status: 'on-track' },
  { id: 'cob-6', category: 'Staffing', period: '2026 Season', budgeted: 10000, actual: 6200, owner: 'HR Coord.', status: 'on-track' },
  { id: 'cob-7', category: 'Awards', period: '2026 Season', budgeted: 3000, actual: 800, owner: 'Event Dir.', status: 'on-track' },
  { id: 'cob-8', category: 'Travel', period: '2026 Season', budgeted: 7000, actual: 4100, owner: 'Operations', status: 'on-track' },
];

// =============================================================================
// COMMUNITY — Ledger
// =============================================================================

const COMMUNITY_LEDGER: FinanceLedgerEntry[] = [
  { id: 'col-1', date: 'Feb 15, 2026', description: 'Entry fees batch — Round 3 registrations', type: 'income', category: 'Entry Fees', amount: 6000, scope: 'Series' },
  { id: 'col-2', date: 'Feb 14, 2026', description: 'Venue rental — Regional Park Complex', type: 'expense', category: 'Venue', amount: 9500, scope: 'Event Weekend', evidence: 'VEN-R3-2026' },
  { id: 'col-3', date: 'Feb 12, 2026', description: 'Sponsorship payment — RedBull activation', type: 'income', category: 'Sponsorships', amount: 15000, scope: 'Series' },
  { id: 'col-4', date: 'Feb 10, 2026', description: 'Safety barriers purchase', type: 'expense', category: 'Security', amount: 3200, scope: 'Organization' },
  { id: 'col-5', date: 'Feb 8, 2026', description: 'Season insurance premium', type: 'expense', category: 'Insurance', amount: 4000, scope: 'Organization' },
  { id: 'col-6', date: 'Feb 5, 2026', description: 'Merchandise pre-sales — online store', type: 'income', category: 'Merchandise', amount: 3500, scope: 'Series' },
  { id: 'col-7', date: 'Feb 3, 2026', description: 'Officials fees — Round 2', type: 'expense', category: 'Officials', amount: 4600, scope: 'Event Weekend' },
  { id: 'col-8', date: 'Feb 1, 2026', description: 'Event staff payroll — Round 2', type: 'expense', category: 'Staffing', amount: 3100, scope: 'Event Weekend' },
  { id: 'col-9', date: 'Jan 30, 2026', description: 'Ticketing revenue — Round 2 gate', type: 'income', category: 'Ticketing', amount: 8200, scope: 'Event Weekend' },
  { id: 'col-10', date: 'Jan 28, 2026', description: 'Media production — Round 2 livestream', type: 'expense', category: 'Media', amount: 4200, scope: 'Event Weekend' },
  { id: 'col-11', date: 'Jan 25, 2026', description: 'Medical staff contract — Round 2', type: 'expense', category: 'Medical', amount: 1400, scope: 'Event Weekend' },
  { id: 'col-12', date: 'Jan 22, 2026', description: 'Sponsorship payment — local auto dealer', type: 'income', category: 'Sponsorships', amount: 5000, scope: 'Series' },
];

// =============================================================================
// COMMUNITY — Approvals
// =============================================================================

const COMMUNITY_APPROVALS: FinanceApproval[] = [
  { id: 'coa-1', title: 'Championship Weekend Venue Deposit', amount: 12000, purpose: 'Non-refundable deposit for championship venue — June 2026', requestedBy: 'Event Dir.', requestedByInitials: 'ED', approvers: ['League Admin', 'Finance Dir.'], status: 'pending', submittedAt: 'Feb 13, 2026' },
  { id: 'coa-2', title: 'Livestream Equipment Upgrade', amount: 4500, purpose: 'Camera + switcher upgrade for multi-angle coverage', requestedBy: 'Media Dir.', requestedByInitials: 'MD', approvers: ['League Admin'], status: 'approved', submittedAt: 'Feb 9, 2026' },
  { id: 'coa-3', title: 'Season Awards Trophies', amount: 2200, purpose: 'Custom trophies + plaques for season awards banquet', requestedBy: 'Events Coord.', requestedByInitials: 'EC', approvers: ['League Admin'], status: 'pending', submittedAt: 'Feb 7, 2026' },
];

// =============================================================================
// COMMUNITY — Payables
// =============================================================================

const COMMUNITY_PAYABLES: FinancePayable[] = [
  { id: 'cop-1', vendor: 'Regional Park Complex', description: 'Venue rental — Round 3 weekend', amount: 9500, dueDate: 'Feb 28, 2026', category: 'Venue', status: 'pending', invoiceRef: 'RPC-R3-2026' },
  { id: 'cop-2', vendor: 'Officials Association', description: 'Officials fees — Round 3 (12 officials)', amount: 4600, dueDate: 'Mar 5, 2026', category: 'Officials', status: 'pending' },
  { id: 'cop-3', vendor: 'SafeGuard Security', description: 'Event security — Round 3 weekend', amount: 2700, dueDate: 'Mar 1, 2026', category: 'Security', status: 'pending' },
  { id: 'cop-4', vendor: 'StreamPro Media', description: 'Livestream production — Round 2', amount: 4200, dueDate: 'Feb 20, 2026', category: 'Media', status: 'paid' },
  { id: 'cop-5', vendor: 'First Aid Solutions', description: 'Medical staff + supplies — Round 3', amount: 1400, dueDate: 'Mar 1, 2026', category: 'Medical', status: 'pending' },
];

// =============================================================================
// COMMUNITY — Receivables
// =============================================================================

const COMMUNITY_RECEIVABLES: FinanceReceivable[] = [
  { id: 'cor-1', source: 'Entry Fees — Round 4', description: 'Pending registrations for Round 4 (est. 50 teams)', amount: 7500, dueDate: 'Mar 15, 2026', category: 'Entry Fees', status: 'pending' },
  { id: 'cor-2', source: 'Nike Sponsorship', description: 'Season title sponsorship — Q2 installment', amount: 10000, dueDate: 'Apr 1, 2026', category: 'Sponsorships', status: 'pending' },
  { id: 'cor-3', source: 'Ticketing — Round 3', description: 'Projected gate revenue for upcoming weekend', amount: 8500, dueDate: 'Mar 1, 2026', category: 'Ticketing', status: 'pending' },
  { id: 'cor-4', source: 'Merchandise Sales', description: 'Online store orders — pending fulfillment', amount: 2200, dueDate: 'Feb 22, 2026', category: 'Merchandise', status: 'approved' },
];

// =============================================================================
// COMMUNITY — Contracts
// =============================================================================

const COMMUNITY_CONTRACTS: FinanceContract[] = [
  { id: 'coc-1', title: 'Season Venue Agreement', vendor: 'Regional Park Complex', value: 57000, startDate: 'Jan 1, 2026', endDate: 'Jun 30, 2026', status: 'active' },
  { id: 'coc-2', title: 'Officials Season Contract', vendor: 'Officials Association', value: 27600, startDate: 'Jan 1, 2026', endDate: 'Jun 30, 2026', status: 'active' },
  { id: 'coc-3', title: 'Livestream Production', vendor: 'StreamPro Media', value: 25200, startDate: 'Jan 1, 2026', endDate: 'Jun 30, 2026', status: 'active' },
  { id: 'coc-4', title: 'Season Insurance Policy', vendor: 'Motorsport Mutual', value: 8000, startDate: 'Jan 1, 2026', endDate: 'Dec 31, 2026', renewalDate: 'Oct 1, 2026', status: 'active' },
];

// =============================================================================
// COMMUNITY — Purchasing
// =============================================================================

const COMMUNITY_PURCHASING: FinancePurchaseRequest[] = [
  { id: 'copr-1', title: 'Championship Trophies & Awards', requestedBy: 'Events Coord.', requestedByInitials: 'EC', amount: 2200, category: 'Awards', status: 'pending', submittedAt: 'Feb 12, 2026' },
  { id: 'copr-2', title: 'Replacement Safety Netting', requestedBy: 'Safety Officer', requestedByInitials: 'SO', amount: 1800, category: 'Security', status: 'approved', submittedAt: 'Feb 10, 2026' },
  { id: 'copr-3', title: 'Portable PA System', requestedBy: 'Event Dir.', requestedByInitials: 'ED', amount: 1500, category: 'Equipment', status: 'pending', submittedAt: 'Feb 8, 2026' },
  { id: 'copr-4', title: 'Branded Pop-Up Tents (6x)', requestedBy: 'Media Dir.', requestedByInitials: 'MD', amount: 3600, category: 'Marketing', status: 'draft', submittedAt: 'Feb 5, 2026' },
];

// =============================================================================
// COMMUNITY — Payroll
// =============================================================================

const COMMUNITY_PAYROLL: FinancePayrollItem[] = [
  { id: 'copy-1', payee: 'Event Director', payeeInitials: 'ED', period: 'Feb 2026', amount: 3500, type: 'salary', status: 'paid' },
  { id: 'copy-2', payee: 'Event Staff (8)', payeeInitials: 'ES', period: 'Round 2', amount: 3100, type: 'contractor', status: 'paid' },
  { id: 'copy-3', payee: 'Officials (12)', payeeInitials: 'OF', period: 'Round 2', amount: 4600, type: 'contractor', status: 'paid' },
  { id: 'copy-4', payee: 'Medical Staff (2)', payeeInitials: 'MS', period: 'Round 2', amount: 1400, type: 'contractor', status: 'paid' },
  { id: 'copy-5', payee: 'Media Crew (3)', payeeInitials: 'MC', period: 'Round 2', amount: 2100, type: 'contractor', status: 'pending' },
];

// =============================================================================
// COMMUNITY — Reimbursements
// =============================================================================

const COMMUNITY_REIMBURSEMENTS: FinanceReimbursement[] = [
  { id: 'corm-1', claimant: 'Event Dir.', claimantInitials: 'ED', description: 'Venue site visit — gas + parking', amount: 65, receipts: 2, status: 'approved', submittedAt: 'Feb 10, 2026' },
  { id: 'corm-2', claimant: 'Safety Officer', claimantInitials: 'SO', description: 'Emergency cone purchase — Round 2', amount: 120, receipts: 1, status: 'paid', submittedAt: 'Feb 4, 2026' },
  { id: 'corm-3', claimant: 'Media Dir.', claimantInitials: 'MD', description: 'Camera battery replacements', amount: 85, receipts: 1, status: 'pending', submittedAt: 'Feb 8, 2026' },
];

// =============================================================================
// COMMUNITY — Reports
// =============================================================================

const COMMUNITY_REPORTS: FinanceReport[] = [
  { id: 'corp-1', title: 'Round 2 Event P&L', type: 'Event Report', period: 'Round 2 — Jan 2026', generatedAt: 'Feb 5, 2026', owner: 'Finance Dir.' },
  { id: 'corp-2', title: 'Season-to-Date Budget Tracker', type: 'Budget Report', period: '2026 Season YTD', generatedAt: 'Feb 10, 2026', owner: 'League Admin' },
  { id: 'corp-3', title: 'Sponsorship Revenue Summary', type: 'Revenue Report', period: '2026 Season', generatedAt: 'Feb 8, 2026', owner: 'Partnerships Dir.' },
  { id: 'corp-4', title: 'Insurance & Liability Review', type: 'Compliance Report', period: '2026 Season', generatedAt: 'Jan 20, 2026', owner: 'League Admin' },
];

// =============================================================================
// COMMUNITY — Controls
// =============================================================================

const COMMUNITY_CONTROLS: FinanceControl[] = [
  { id: 'coct-1', title: 'Event Spending Cap', description: 'Per-event spend above threshold requires League Admin approval', threshold: 5000, enabled: true, category: 'Events' },
  { id: 'coct-2', title: 'Vendor Payment Verification', description: 'All vendor payments require invoice + delivery confirmation', enabled: true, category: 'Payables' },
  { id: 'coct-3', title: 'Sponsorship Fund Segregation', description: 'Sponsorship revenue tracked separately from operations', enabled: true, category: 'Revenue' },
  { id: 'coct-4', title: 'Insurance Compliance Gate', description: 'Events cannot proceed without valid insurance certificate on file', enabled: true, category: 'Compliance' },
  { id: 'coct-5', title: 'Dual Approval — Contracts', description: 'All vendor contracts require League Admin + Finance Dir. approval', enabled: true, category: 'Contracts' },
];

// =============================================================================
// COMMUNITY — Audit
// =============================================================================

const COMMUNITY_AUDIT: FinanceAuditEntry[] = [
  { id: 'coau-1', action: 'Entry Fees Received', actor: 'System', timestamp: 'Feb 15, 2026 10:00 AM', timestampMs: 1739613600000, description: 'Round 3 registration batch — $6,000 (20 teams)' },
  { id: 'coau-2', action: 'Venue Payment', actor: 'Finance Dir.', timestamp: 'Feb 14, 2026 2:30 PM', timestampMs: 1739554200000, description: 'Regional Park Complex — $9,500 for Round 3' },
  { id: 'coau-3', action: 'Sponsorship Received', actor: 'System', timestamp: 'Feb 12, 2026 9:00 AM', timestampMs: 1739354400000, description: 'RedBull activation payment — $15,000' },
  { id: 'coau-4', action: 'Approval Submitted', actor: 'Event Dir.', timestamp: 'Feb 13, 2026 3:00 PM', timestampMs: 1739464800000, description: 'Championship venue deposit — $12,000' },
  { id: 'coau-5', action: 'Insurance Verified', actor: 'League Admin', timestamp: 'Feb 10, 2026 11:00 AM', timestampMs: 1739195400000, description: 'Season insurance certificate on file — valid through Dec 2026' },
  { id: 'coau-6', action: 'Payroll Processed', actor: 'Finance Dir.', timestamp: 'Feb 1, 2026 8:00 AM', timestampMs: 1738396800000, description: 'Round 2 event staff paid — $3,100' },
  { id: 'coau-7', action: 'Approval Granted', actor: 'League Admin', timestamp: 'Feb 9, 2026 4:00 PM', timestampMs: 1739127600000, description: 'Livestream equipment upgrade — $4,500 approved' },
  { id: 'coau-8', action: 'Invoice Paid', actor: 'Finance Dir.', timestamp: 'Feb 7, 2026 10:00 AM', timestampMs: 1738922400000, description: 'StreamPro Media — Round 2 livestream — $4,200' },
  { id: 'coau-9', action: 'Report Generated', actor: 'Finance Dir.', timestamp: 'Feb 5, 2026 3:00 PM', timestampMs: 1738771200000, description: 'Round 2 Event P&L report' },
  { id: 'coau-10', action: 'Safety Equipment Logged', actor: 'Safety Officer', timestamp: 'Feb 10, 2026 9:30 AM', timestampMs: 1739190000000, description: 'Safety barriers received and inspected — $3,200' },
];

// =============================================================================
// MODE RECORDS
// =============================================================================

const FINANCE_DASHBOARDS: Record<Mode, FinanceDashboardBlock[]> = {
  sports: SPORTS_DASHBOARD,
  education: EDUCATION_DASHBOARD,
  church: CHURCH_DASHBOARD,
  competition: COMMUNITY_DASHBOARD,
  business: BUSINESS_DASHBOARD,
};

const FINANCE_BUDGETS_V2: Record<Mode, FinanceBudget[]> = {
  sports: SPORTS_BUDGETS,
  education: EDUCATION_BUDGETS,
  church: CHURCH_BUDGETS,
  competition: COMMUNITY_BUDGETS,
  business: BUSINESS_BUDGETS,
};

const FINANCE_LEDGERS: Record<Mode, FinanceLedgerEntry[]> = {
  sports: SPORTS_LEDGER,
  education: EDUCATION_LEDGER,
  church: CHURCH_LEDGER,
  competition: COMMUNITY_LEDGER,
  business: BUSINESS_LEDGER,
};

const FINANCE_APPROVALS: Record<Mode, FinanceApproval[]> = {
  sports: SPORTS_APPROVALS,
  education: EDUCATION_APPROVALS,
  church: CHURCH_APPROVALS,
  competition: COMMUNITY_APPROVALS,
  business: BUSINESS_APPROVALS,
};

const FINANCE_PAYABLES: Record<Mode, FinancePayable[]> = {
  sports: SPORTS_PAYABLES,
  education: EDUCATION_PAYABLES,
  church: CHURCH_PAYABLES,
  competition: COMMUNITY_PAYABLES,
  business: BUSINESS_PAYABLES,
};

const FINANCE_RECEIVABLES: Record<Mode, FinanceReceivable[]> = {
  sports: SPORTS_RECEIVABLES,
  education: EDUCATION_RECEIVABLES,
  church: CHURCH_RECEIVABLES,
  competition: COMMUNITY_RECEIVABLES,
  business: BUSINESS_RECEIVABLES,
};

const FINANCE_CONTRACTS: Record<Mode, FinanceContract[]> = {
  sports: SPORTS_CONTRACTS,
  education: EDUCATION_CONTRACTS,
  church: CHURCH_CONTRACTS,
  competition: COMMUNITY_CONTRACTS,
  business: BUSINESS_CONTRACTS,
};

const FINANCE_PURCHASING: Record<Mode, FinancePurchaseRequest[]> = {
  sports: SPORTS_PURCHASING,
  education: EDUCATION_PURCHASING,
  church: CHURCH_PURCHASING,
  competition: COMMUNITY_PURCHASING,
  business: BUSINESS_PURCHASING,
};

const FINANCE_PAYROLL: Record<Mode, FinancePayrollItem[]> = {
  sports: SPORTS_PAYROLL,
  education: EDUCATION_PAYROLL,
  church: CHURCH_PAYROLL,
  competition: COMMUNITY_PAYROLL,
  business: BUSINESS_PAYROLL,
};

const FINANCE_REIMBURSEMENTS: Record<Mode, FinanceReimbursement[]> = {
  sports: SPORTS_REIMBURSEMENTS,
  education: EDUCATION_REIMBURSEMENTS,
  church: CHURCH_REIMBURSEMENTS,
  competition: COMMUNITY_REIMBURSEMENTS,
  business: BUSINESS_REIMBURSEMENTS,
};

const FINANCE_REPORTS: Record<Mode, FinanceReport[]> = {
  sports: SPORTS_REPORTS,
  education: EDUCATION_REPORTS,
  church: CHURCH_REPORTS,
  competition: COMMUNITY_REPORTS,
  business: BUSINESS_REPORTS,
};

const FINANCE_CONTROLS: Record<Mode, FinanceControl[]> = {
  sports: SPORTS_CONTROLS,
  education: EDUCATION_CONTROLS,
  church: CHURCH_CONTROLS,
  competition: COMMUNITY_CONTROLS,
  business: BUSINESS_CONTROLS,
};

const FINANCE_AUDITS: Record<Mode, FinanceAuditEntry[]> = {
  sports: SPORTS_AUDIT,
  education: EDUCATION_AUDIT,
  church: CHURCH_AUDIT,
  competition: COMMUNITY_AUDIT,
  business: BUSINESS_AUDIT,
};

// =============================================================================
// HELPERS
// =============================================================================

export function getFinanceData(mode: Mode): {
  dashboard: FinanceDashboardBlock[];
  budgets: FinanceBudget[];
  ledger: FinanceLedgerEntry[];
  approvals: FinanceApproval[];
  payables: FinancePayable[];
  receivables: FinanceReceivable[];
  contracts: FinanceContract[];
  purchasing: FinancePurchaseRequest[];
  payroll: FinancePayrollItem[];
  reimbursements: FinanceReimbursement[];
  reports: FinanceReport[];
  controls: FinanceControl[];
  audit: FinanceAuditEntry[];
} {
  return {
    dashboard: FINANCE_DASHBOARDS[mode],
    budgets: FINANCE_BUDGETS_V2[mode],
    ledger: FINANCE_LEDGERS[mode],
    approvals: FINANCE_APPROVALS[mode],
    payables: FINANCE_PAYABLES[mode],
    receivables: FINANCE_RECEIVABLES[mode],
    contracts: FINANCE_CONTRACTS[mode],
    purchasing: FINANCE_PURCHASING[mode],
    payroll: FINANCE_PAYROLL[mode],
    reimbursements: FINANCE_REIMBURSEMENTS[mode],
    reports: FINANCE_REPORTS[mode],
    controls: FINANCE_CONTROLS[mode],
    audit: FINANCE_AUDITS[mode],
  };
}

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    const k = amount / 1_000;
    return k === Math.floor(k) ? `$${k}K` : `$${k.toFixed(1)}K`;
  }
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function getBudgetPercentage(budgetOrActual: FinanceBudget | number, budgeted?: number): number {
  if (typeof budgetOrActual === 'number') {
    if (!budgeted || budgeted === 0) return 0;
    return Math.round((budgetOrActual / budgeted) * 100);
  }
  if (budgetOrActual.budgeted === 0) return 0;
  return Math.round((budgetOrActual.actual / budgetOrActual.budgeted) * 100);
}
