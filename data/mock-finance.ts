/**
 * Finance v2 Mock Data
 * Budget categories, transactions, invoices, and snapshots per mode.
 */
import type { Mode } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  status: 'on-track' | 'warning' | 'over-budget';
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  vendor?: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Invoice {
  id: string;
  recipient: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  description: string;
}

export interface FinanceSnapshot {
  totalBudget: number;
  totalSpent: number;
  totalIncome: number;
  outstandingInvoices: number;
}

// =============================================================================
// SPORTS
// =============================================================================

const SPORTS_BUDGETS: BudgetCategory[] = [
  { id: 'sb-1', name: 'Travel', allocated: 20000, spent: 14800, remaining: 5200, status: 'warning' },
  { id: 'sb-2', name: 'Equipment', allocated: 15000, spent: 10200, remaining: 4800, status: 'on-track' },
  { id: 'sb-3', name: 'Recruiting', allocated: 18000, spent: 12500, remaining: 5500, status: 'on-track' },
  { id: 'sb-4', name: 'Meals & Per Diem', allocated: 12000, spent: 9800, remaining: 2200, status: 'warning' },
  { id: 'sb-5', name: 'Officials & Game Ops', allocated: 10000, spent: 7200, remaining: 2800, status: 'on-track' },
  { id: 'sb-6', name: 'Medical & Training', allocated: 10000, spent: 7500, remaining: 2500, status: 'on-track' },
];

const SPORTS_TRANSACTIONS: Transaction[] = [
  { id: 'stx-1', description: 'Team bus charter — Magnolia University', amount: 2400, type: 'expense', category: 'Travel', date: 'Feb 15, 2026', vendor: 'Charter Express', status: 'completed' },
  { id: 'stx-2', description: 'Nike equipment order — uniforms', amount: 4800, type: 'expense', category: 'Equipment', date: 'Feb 14, 2026', vendor: 'Nike Team Sports', status: 'completed' },
  { id: 'stx-3', description: 'Booster donation — Williams Family', amount: 5000, type: 'income', category: 'Donations', date: 'Feb 12, 2026', status: 'completed' },
  { id: 'stx-4', description: 'Game guarantee — Homecoming', amount: 15000, type: 'income', category: 'Revenue', date: 'Feb 10, 2026', status: 'completed' },
  { id: 'stx-5', description: 'Hotel block — Thomas trip', amount: 1800, type: 'expense', category: 'Travel', date: 'Feb 10, 2026', vendor: 'Hampton Inn', status: 'pending' },
  { id: 'stx-6', description: 'Athletic trainer monthly', amount: 3200, type: 'expense', category: 'Medical & Training', date: 'Feb 8, 2026', vendor: 'SportsMed Pro', status: 'completed' },
  { id: 'stx-7', description: 'Ticket sales — February games', amount: 8400, type: 'income', category: 'Revenue', date: 'Feb 7, 2026', status: 'completed' },
  { id: 'stx-8', description: 'Recruiting visit meals', amount: 680, type: 'expense', category: 'Recruiting', date: 'Feb 6, 2026', vendor: 'Various', status: 'completed' },
  { id: 'stx-9', description: 'Concession revenue — home games', amount: 2800, type: 'income', category: 'Revenue', date: 'Feb 5, 2026', status: 'completed' },
  { id: 'stx-10', description: 'Game officials — 3 home games', amount: 2700, type: 'expense', category: 'Officials & Game Ops', date: 'Feb 3, 2026', vendor: 'NAIA Officials', status: 'completed' },
];

const SPORTS_INVOICES: Invoice[] = [
  { id: 'si-1', recipient: 'Charter Express', amount: 2400, dueDate: 'Feb 28, 2026', status: 'pending', description: 'Bus charter — Magnolia University trip' },
  { id: 'si-2', recipient: 'Nike Team Sports', amount: 4800, dueDate: 'Mar 5, 2026', status: 'pending', description: 'Spring equipment order' },
  { id: 'si-3', recipient: 'Conference Office', amount: 1500, dueDate: 'Feb 15, 2026', status: 'paid', description: 'Conference tournament entry fee' },
  { id: 'si-4', recipient: 'SportsMed Pro', amount: 3200, dueDate: 'Mar 1, 2026', status: 'pending', description: 'Athletic trainer — March contract' },
];

const SPORTS_SNAPSHOT: FinanceSnapshot = {
  totalBudget: 85000,
  totalSpent: 62000,
  totalIncome: 45000,
  outstandingInvoices: 3,
};

// =============================================================================
// CHURCH
// =============================================================================

const CHURCH_BUDGETS: BudgetCategory[] = [
  { id: 'cb-1', name: 'Tithes & Offerings', allocated: 40000, spent: 0, remaining: 40000, status: 'on-track' },
  { id: 'cb-2', name: 'Building & Maintenance', allocated: 25000, spent: 18200, remaining: 6800, status: 'warning' },
  { id: 'cb-3', name: 'Missions', allocated: 18000, spent: 10500, remaining: 7500, status: 'on-track' },
  { id: 'cb-4', name: 'Youth Ministry', allocated: 12000, spent: 7800, remaining: 4200, status: 'on-track' },
  { id: 'cb-5', name: 'Worship & Production', allocated: 15000, spent: 11200, remaining: 3800, status: 'warning' },
  { id: 'cb-6', name: 'Administration', allocated: 10000, spent: 6300, remaining: 3700, status: 'on-track' },
];

const CHURCH_TRANSACTIONS: Transaction[] = [
  { id: 'ctx-1', description: 'Sunday tithes — Feb 16', amount: 14200, type: 'income', category: 'Tithes & Offerings', date: 'Feb 16, 2026', status: 'completed' },
  { id: 'ctx-2', description: 'Utility bill — Main Campus', amount: 3800, type: 'expense', category: 'Building & Maintenance', date: 'Feb 15, 2026', vendor: 'FPL', status: 'completed' },
  { id: 'ctx-3', description: 'Online giving — weekly', amount: 6500, type: 'income', category: 'Tithes & Offerings', date: 'Feb 14, 2026', status: 'completed' },
  { id: 'ctx-4', description: 'Sound board upgrade', amount: 4500, type: 'expense', category: 'Worship & Production', date: 'Feb 12, 2026', vendor: 'Pro Audio Supply', status: 'completed' },
  { id: 'ctx-5', description: 'Building fund pledges', amount: 8200, type: 'income', category: 'Building & Maintenance', date: 'Feb 10, 2026', status: 'completed' },
  { id: 'ctx-6', description: 'Missions trip supplies — Haiti', amount: 2200, type: 'expense', category: 'Missions', date: 'Feb 8, 2026', vendor: 'Mission Depot', status: 'completed' },
  { id: 'ctx-7', description: 'Sunday tithes — Feb 9', amount: 12800, type: 'income', category: 'Tithes & Offerings', date: 'Feb 9, 2026', status: 'completed' },
  { id: 'ctx-8', description: 'Staff payroll — February', amount: 18500, type: 'expense', category: 'Administration', date: 'Feb 1, 2026', vendor: 'ADP Payroll', status: 'completed' },
];

const CHURCH_INVOICES: Invoice[] = [
  { id: 'ci-1', recipient: 'Pro Audio Supply', amount: 4500, dueDate: 'Mar 1, 2026', status: 'pending', description: 'Sound board equipment upgrade' },
  { id: 'ci-2', recipient: 'Mission Depot', amount: 2200, dueDate: 'Feb 20, 2026', status: 'paid', description: 'Haiti missions trip supplies' },
  { id: 'ci-3', recipient: 'HVAC Solutions', amount: 6800, dueDate: 'Feb 25, 2026', status: 'pending', description: 'Sanctuary HVAC maintenance' },
];

const CHURCH_SNAPSHOT: FinanceSnapshot = {
  totalBudget: 120000,
  totalSpent: 78000,
  totalIncome: 115000,
  outstandingInvoices: 2,
};

// =============================================================================
// EDUCATION
// =============================================================================

const EDUCATION_BUDGETS: BudgetCategory[] = [
  { id: 'eb-1', name: 'Tuition Revenue', allocated: 800000, spent: 0, remaining: 800000, status: 'on-track' },
  { id: 'eb-2', name: 'Financial Aid', allocated: 550000, spent: 420000, remaining: 130000, status: 'warning' },
  { id: 'eb-3', name: 'Athletics', allocated: 180000, spent: 125000, remaining: 55000, status: 'on-track' },
  { id: 'eb-4', name: 'Facilities', allocated: 350000, spent: 280000, remaining: 70000, status: 'warning' },
  { id: 'eb-5', name: 'Faculty & Staff', allocated: 420000, spent: 310000, remaining: 110000, status: 'on-track' },
  { id: 'eb-6', name: 'Technology', allocated: 200000, spent: 165000, remaining: 35000, status: 'warning' },
];

const EDUCATION_TRANSACTIONS: Transaction[] = [
  { id: 'etx-1', description: 'Spring tuition batch deposit', amount: 245000, type: 'income', category: 'Tuition Revenue', date: 'Feb 15, 2026', status: 'completed' },
  { id: 'etx-2', description: 'Faculty payroll — February', amount: 128000, type: 'expense', category: 'Faculty & Staff', date: 'Feb 14, 2026', vendor: 'Payroll Dept', status: 'completed' },
  { id: 'etx-3', description: 'Federal Pell Grant disbursement', amount: 62000, type: 'income', category: 'Financial Aid', date: 'Feb 12, 2026', status: 'completed' },
  { id: 'etx-4', description: 'Library database subscription', amount: 18500, type: 'expense', category: 'Technology', date: 'Feb 10, 2026', vendor: 'EBSCO', status: 'completed' },
  { id: 'etx-5', description: 'Alumni annual fund donation', amount: 15000, type: 'income', category: 'Donations', date: 'Feb 8, 2026', status: 'completed' },
  { id: 'etx-6', description: 'Campus maintenance contract', amount: 9200, type: 'expense', category: 'Facilities', date: 'Feb 5, 2026', vendor: 'ABM Facility', status: 'completed' },
  { id: 'etx-7', description: 'Student housing fees', amount: 34000, type: 'income', category: 'Housing', date: 'Feb 3, 2026', status: 'completed' },
  { id: 'etx-8', description: 'IT infrastructure upgrade', amount: 22000, type: 'expense', category: 'Technology', date: 'Feb 1, 2026', vendor: 'CDW', status: 'completed' },
  { id: 'etx-9', description: 'State grant — spring semester', amount: 85000, type: 'income', category: 'Financial Aid', date: 'Jan 28, 2026', status: 'completed' },
  { id: 'etx-10', description: 'Athletic equipment order', amount: 12500, type: 'expense', category: 'Athletics', date: 'Jan 25, 2026', vendor: 'BSN Sports', status: 'completed' },
];

const EDUCATION_INVOICES: Invoice[] = [
  { id: 'ei-1', recipient: 'EBSCO', amount: 18500, dueDate: 'Mar 1, 2026', status: 'pending', description: 'Annual library database renewal' },
  { id: 'ei-2', recipient: 'ABM Facility Services', amount: 9200, dueDate: 'Feb 28, 2026', status: 'pending', description: 'Monthly campus maintenance' },
  { id: 'ei-3', recipient: 'CDW', amount: 22000, dueDate: 'Feb 20, 2026', status: 'paid', description: 'IT infrastructure upgrade' },
  { id: 'ei-4', recipient: 'BSN Sports', amount: 12500, dueDate: 'Feb 25, 2026', status: 'pending', description: 'Athletic equipment order' },
  { id: 'ei-5', recipient: 'Accreditation Board', amount: 5000, dueDate: 'Mar 15, 2026', status: 'draft', description: 'SACS annual review fee' },
];

const EDUCATION_SNAPSHOT: FinanceSnapshot = {
  totalBudget: 2500000,
  totalSpent: 1800000,
  totalIncome: 2200000,
  outstandingInvoices: 3,
};

// =============================================================================
// BUSINESS
// =============================================================================

const BUSINESS_BUDGETS: BudgetCategory[] = [
  { id: 'bb-1', name: 'Engineering', allocated: 120000, spent: 95000, remaining: 25000, status: 'warning' },
  { id: 'bb-2', name: 'Marketing', allocated: 80000, spent: 52000, remaining: 28000, status: 'on-track' },
  { id: 'bb-3', name: 'Sales', allocated: 65000, spent: 48000, remaining: 17000, status: 'on-track' },
  { id: 'bb-4', name: 'Operations', allocated: 95000, spent: 78000, remaining: 17000, status: 'warning' },
  { id: 'bb-5', name: 'Legal', allocated: 40000, spent: 32000, remaining: 8000, status: 'warning' },
  { id: 'bb-6', name: 'R&D', allocated: 100000, spent: 75000, remaining: 25000, status: 'on-track' },
];

const BUSINESS_TRANSACTIONS: Transaction[] = [
  { id: 'btx-1', description: 'SaaS subscription — Acme Corp', amount: 4800, type: 'income', category: 'Revenue', date: 'Feb 15, 2026', status: 'completed' },
  { id: 'btx-2', description: 'AWS infrastructure', amount: 3200, type: 'expense', category: 'Engineering', date: 'Feb 14, 2026', vendor: 'Amazon Web Services', status: 'completed' },
  { id: 'btx-3', description: 'SaaS subscription — Beta Inc', amount: 2400, type: 'income', category: 'Revenue', date: 'Feb 12, 2026', status: 'completed' },
  { id: 'btx-4', description: 'Design contractor payment', amount: 5500, type: 'expense', category: 'Engineering', date: 'Feb 10, 2026', vendor: 'Studio Nine', status: 'completed' },
  { id: 'btx-5', description: 'Pilot fee — Gamma Labs', amount: 8000, type: 'income', category: 'Revenue', date: 'Feb 8, 2026', status: 'completed' },
  { id: 'btx-6', description: 'Legal review — terms of service', amount: 2800, type: 'expense', category: 'Legal', date: 'Feb 5, 2026', vendor: 'Wilson & Associates', status: 'completed' },
  { id: 'btx-7', description: 'SaaS subscription — Delta Co', amount: 4800, type: 'income', category: 'Revenue', date: 'Feb 3, 2026', status: 'completed' },
  { id: 'btx-8', description: 'Team offsite — Nashville', amount: 4200, type: 'expense', category: 'Operations', date: 'Feb 1, 2026', vendor: 'Various', status: 'completed' },
  { id: 'btx-9', description: 'Ad spend — Google/Meta', amount: 6500, type: 'expense', category: 'Marketing', date: 'Jan 30, 2026', vendor: 'Google Ads', status: 'completed' },
  { id: 'btx-10', description: 'Enterprise license — Omega Corp', amount: 12000, type: 'income', category: 'Revenue', date: 'Jan 28, 2026', status: 'completed' },
];

const BUSINESS_INVOICES: Invoice[] = [
  { id: 'bi-1', recipient: 'Acme Corp', amount: 4800, dueDate: 'Mar 1, 2026', status: 'pending', description: 'Monthly SaaS license — March' },
  { id: 'bi-2', recipient: 'Wilson & Associates', amount: 2800, dueDate: 'Feb 25, 2026', status: 'paid', description: 'Legal review — ToS update' },
  { id: 'bi-3', recipient: 'Studio Nine', amount: 5500, dueDate: 'Feb 28, 2026', status: 'pending', description: 'Design contractor — Feb deliverables' },
  { id: 'bi-4', recipient: 'Omega Corp', amount: 12000, dueDate: 'Feb 15, 2026', status: 'paid', description: 'Enterprise license — annual' },
  { id: 'bi-5', recipient: 'Amazon Web Services', amount: 3200, dueDate: 'Mar 5, 2026', status: 'pending', description: 'Cloud infrastructure — Feb usage' },
];

const BUSINESS_SNAPSHOT: FinanceSnapshot = {
  totalBudget: 500000,
  totalSpent: 380000,
  totalIncome: 420000,
  outstandingInvoices: 3,
};

// =============================================================================
// COMMUNITY (KaNeXT)
// =============================================================================

const COMMUNITY_BUDGETS: BudgetCategory[] = [
  { id: 'kb-1', name: 'Entry Fees', allocated: 12000, spent: 0, remaining: 12000, status: 'on-track' },
  { id: 'kb-2', name: 'Track Rental', allocated: 12000, spent: 9500, remaining: 2500, status: 'warning' },
  { id: 'kb-3', name: 'Equipment', allocated: 8000, spent: 5800, remaining: 2200, status: 'on-track' },
  { id: 'kb-4', name: 'Fuel & Consumables', allocated: 5000, spent: 3200, remaining: 1800, status: 'on-track' },
  { id: 'kb-5', name: 'Insurance', allocated: 4000, spent: 4000, remaining: 0, status: 'on-track' },
  { id: 'kb-6', name: 'Prizes & Awards', allocated: 4000, spent: 0, remaining: 4000, status: 'on-track' },
];

const COMMUNITY_TRANSACTIONS: Transaction[] = [
  { id: 'ktx-1', description: 'Entry fee payment — Season 1', amount: 12000, type: 'income', category: 'Entry Fees', date: 'Feb 15, 2026', status: 'completed' },
  { id: 'ktx-2', description: 'COTA track rental — Round 1', amount: 9500, type: 'expense', category: 'Track Rental', date: 'Feb 14, 2026', vendor: 'COTA', status: 'completed' },
  { id: 'ktx-3', description: 'Sponsorship — RedBull activation', amount: 15000, type: 'income', category: 'Sponsorship', date: 'Feb 12, 2026', status: 'completed' },
  { id: 'ktx-4', description: 'Safety barriers purchase', amount: 3200, type: 'expense', category: 'Equipment', date: 'Feb 10, 2026', vendor: 'TrackSafe Ltd', status: 'completed' },
  { id: 'ktx-5', description: 'Season insurance premium', amount: 4000, type: 'expense', category: 'Insurance', date: 'Feb 8, 2026', vendor: 'Motorsport Mutual', status: 'completed' },
  { id: 'ktx-6', description: 'Merchandise pre-sales', amount: 3500, type: 'income', category: 'Merchandise', date: 'Feb 5, 2026', status: 'pending' },
];

const COMMUNITY_INVOICES: Invoice[] = [
  { id: 'ki-1', recipient: 'COTA', amount: 9500, dueDate: 'Feb 20, 2026', status: 'paid', description: 'Track rental — Round 1' },
  { id: 'ki-2', recipient: 'TrackSafe Ltd', amount: 3200, dueDate: 'Feb 28, 2026', status: 'pending', description: 'Safety barriers & equipment' },
  { id: 'ki-3', recipient: 'Motorsport Mutual', amount: 4000, dueDate: 'Feb 15, 2026', status: 'paid', description: 'Annual insurance premium' },
];

const COMMUNITY_SNAPSHOT: FinanceSnapshot = {
  totalBudget: 45000,
  totalSpent: 32000,
  totalIncome: 52000,
  outstandingInvoices: 1,
};

// =============================================================================
// MODE RECORDS
// =============================================================================

export const FINANCE_BUDGETS: Record<Mode, BudgetCategory[]> = {
  sports: SPORTS_BUDGETS,
  church: CHURCH_BUDGETS,
  education: EDUCATION_BUDGETS,
  competition: COMMUNITY_BUDGETS,
  business: BUSINESS_BUDGETS,
};

export const FINANCE_TRANSACTIONS: Record<Mode, Transaction[]> = {
  sports: SPORTS_TRANSACTIONS,
  church: CHURCH_TRANSACTIONS,
  education: EDUCATION_TRANSACTIONS,
  competition: COMMUNITY_TRANSACTIONS,
  business: BUSINESS_TRANSACTIONS,
};

export const FINANCE_INVOICES: Record<Mode, Invoice[]> = {
  sports: SPORTS_INVOICES,
  church: CHURCH_INVOICES,
  education: EDUCATION_INVOICES,
  competition: COMMUNITY_INVOICES,
  business: BUSINESS_INVOICES,
};

export const FINANCE_SNAPSHOTS: Record<Mode, FinanceSnapshot> = {
  sports: SPORTS_SNAPSHOT,
  church: CHURCH_SNAPSHOT,
  education: EDUCATION_SNAPSHOT,
  competition: COMMUNITY_SNAPSHOT,
  business: BUSINESS_SNAPSHOT,
};
