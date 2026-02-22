/**
 * Competition Organization Finance — Mock Data & Types
 * 10-tab Finance Hub for Competition Mode organizations (leagues, tournaments, series).
 * Revenue streams: ticketing, sponsorship, broadcast, merchandise, licensing, entry fees.
 * Expense categories: venue, staff, equipment, travel, marketing, insurance, officials, prizes.
 */

// =============================================================================
// TYPES
// =============================================================================

export type CompFinanceTabId =
  | 'dashboard'
  | 'revenue'
  | 'expenses'
  | 'prize-pool'
  | 'sponsorship-revenue'
  | 'ticketing'
  | 'budgets'
  | 'payouts'
  | 'reports'
  | 'settings';

export interface CompFinanceTab {
  id: CompFinanceTabId;
  label: string;
  icon: string;
}

export interface FinanceDashboardBlock {
  id: string;
  label: string;
  value: string;
  delta: string;
  icon: string;
  color: string;
}

export interface RevenueItem {
  id: string;
  source: string;
  category: 'ticketing' | 'sponsorship' | 'broadcast' | 'merchandise' | 'licensing' | 'entry-fees';
  amount: number;
  date: string;
  series: string;
  status: 'received' | 'pending' | 'projected';
}

export interface ExpenseItem {
  id: string;
  description: string;
  category: 'venue' | 'staff' | 'equipment' | 'travel' | 'marketing' | 'insurance' | 'officials' | 'prizes';
  amount: number;
  date: string;
  vendor: string;
  status: 'paid' | 'pending' | 'approved' | 'overdue';
  series: string;
}

export interface PrizeAllocation {
  id: string;
  series: string;
  position: string;
  entrant: string;
  amount: number;
  status: 'allocated' | 'paid' | 'held';
  date: string;
}

export interface SponsorshipRevenue {
  id: string;
  sponsor: string;
  package: string;
  amount: number;
  period: string;
  status: 'active' | 'pending' | 'expired';
  paymentSchedule: string;
}

export interface TicketingRecord {
  id: string;
  event: string;
  venue: string;
  ticketsSold: number;
  capacity: number;
  revenue: number;
  avgPrice: number;
  date: string;
}

export interface Budget {
  id: string;
  name: string;
  series: string;
  allocated: number;
  spent: number;
  remaining: number;
  status: 'on-track' | 'at-risk' | 'over-budget';
  category: string;
}

export interface PayoutRecord {
  id: string;
  recipient: string;
  amount: number;
  type: 'prize' | 'official' | 'vendor' | 'refund';
  status: 'completed' | 'pending' | 'processing' | 'failed';
  date: string;
  reference: string;
}

export interface FinanceReport {
  id: string;
  name: string;
  type: string;
  period: string;
  format: 'PDF' | 'CSV' | 'XLSX';
  generatedDate: string;
}

export interface FinanceSettingToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface CompFinanceData {
  dashboard: FinanceDashboardBlock[];
  revenue: RevenueItem[];
  expenses: ExpenseItem[];
  prizePool: PrizeAllocation[];
  sponsorship: SponsorshipRevenue[];
  ticketing: TicketingRecord[];
  budgets: Budget[];
  payouts: PayoutRecord[];
  reports: FinanceReport[];
  settings: FinanceSettingToggle[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const COMP_FINANCE_TABS: CompFinanceTab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'chart.bar.fill' },
  { id: 'revenue', label: 'Revenue', icon: 'arrow.up.circle.fill' },
  { id: 'expenses', label: 'Expenses', icon: 'arrow.down.circle.fill' },
  { id: 'prize-pool', label: 'Prize Pool', icon: 'trophy.fill' },
  { id: 'sponsorship-revenue', label: 'Sponsorship', icon: 'star.fill' },
  { id: 'ticketing', label: 'Ticketing', icon: 'ticket.fill' },
  { id: 'budgets', label: 'Budgets', icon: 'chart.pie.fill' },
  { id: 'payouts', label: 'Payouts', icon: 'creditcard.fill' },
  { id: 'reports', label: 'Reports', icon: 'doc.text.fill' },
  { id: 'settings', label: 'Settings', icon: 'gearshape.fill' },
];

export const COMP_FINANCE_SCOPE_CHIPS = [
  'All Finance',
  'Revenue',
  'Expenses',
  'Prize Pool',
  'Sponsorship',
];

// =============================================================================
// STATUS COLORS
// =============================================================================

export const REVENUE_STATUS_COLOR: Record<RevenueItem['status'], string> = {
  received: '#22C55E',
  pending: '#F59E0B',
  projected: '#3B82F6',
};

export const EXPENSE_STATUS_COLOR: Record<ExpenseItem['status'], string> = {
  paid: '#22C55E',
  pending: '#F59E0B',
  approved: '#3B82F6',
  overdue: '#EF4444',
};

export const BUDGET_STATUS_COLOR: Record<Budget['status'], string> = {
  'on-track': '#22C55E',
  'at-risk': '#F59E0B',
  'over-budget': '#EF4444',
};

export const PAYOUT_STATUS_COLOR: Record<PayoutRecord['status'], string> = {
  completed: '#22C55E',
  pending: '#F59E0B',
  processing: '#3B82F6',
  failed: '#EF4444',
};

export const PRIZE_STATUS_COLOR: Record<PrizeAllocation['status'], string> = {
  allocated: '#3B82F6',
  paid: '#22C55E',
  held: '#F59E0B',
};

export const SPONSORSHIP_STATUS_COLOR: Record<SponsorshipRevenue['status'], string> = {
  active: '#22C55E',
  pending: '#F59E0B',
  expired: '#EF4444',
};

export const PAYOUT_TYPE_COLOR: Record<PayoutRecord['type'], string> = {
  prize: '#8B5CF6',
  official: '#6AA9FF',
  vendor: '#F59E0B',
  refund: '#EF4444',
};

export const REVENUE_CATEGORY_COLOR: Record<RevenueItem['category'], string> = {
  ticketing: '#6AA9FF',
  sponsorship: '#8B5CF6',
  broadcast: '#EC4899',
  merchandise: '#F59E0B',
  licensing: '#14B8A6',
  'entry-fees': '#22C55E',
};

export const EXPENSE_CATEGORY_COLOR: Record<ExpenseItem['category'], string> = {
  venue: '#6AA9FF',
  staff: '#8B5CF6',
  equipment: '#14B8A6',
  travel: '#F59E0B',
  marketing: '#EC4899',
  insurance: '#EF4444',
  officials: '#22C55E',
  prizes: '#F97316',
};

// =============================================================================
// HELPERS
// =============================================================================

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toLocaleString()}`;
}

export function formatCurrencyFull(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function getBudgetPercentage(spent: number, allocated: number): number {
  if (allocated <= 0) return 0;
  return Math.round((spent / allocated) * 100);
}

export function getCapacityPercentage(sold: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return Math.round((sold / capacity) * 100);
}

// =============================================================================
// MOCK DATA
// =============================================================================

const DASHBOARD_BLOCKS: FinanceDashboardBlock[] = [
  { id: 'db-1', label: 'Total Revenue', value: '$2.4M', delta: '+12.3%', icon: 'arrow.up.circle.fill', color: '#22C55E' },
  { id: 'db-2', label: 'Total Expenses', value: '$1.8M', delta: '+8.1%', icon: 'arrow.down.circle.fill', color: '#EF4444' },
  { id: 'db-3', label: 'Net Profit', value: '$612K', delta: '+22.4%', icon: 'chart.line.uptrend.xyaxis', color: '#22C55E' },
  { id: 'db-4', label: 'Prize Pool', value: '$500K', delta: '—', icon: 'trophy.fill', color: '#8B5CF6' },
  { id: 'db-5', label: 'Ticket Revenue', value: '$850K', delta: '+15.7%', icon: 'ticket.fill', color: '#6AA9FF' },
  { id: 'db-6', label: 'Sponsorship', value: '$625K', delta: '+9.2%', icon: 'star.fill', color: '#F59E0B' },
  { id: 'db-7', label: 'Budget Utilization', value: '74%', delta: 'On Track', icon: 'chart.pie.fill', color: '#14B8A6' },
  { id: 'db-8', label: 'Pending Payouts', value: '$127K', delta: '14 items', icon: 'creditcard.fill', color: '#F59E0B' },
];

const REVENUE_ITEMS: RevenueItem[] = [
  { id: 'rev-1', source: 'KaNeXT Church Championship Gate', category: 'ticketing', amount: 185000, date: 'Jan 18, 2026', series: 'KaNeXT Church Championship', status: 'received' },
  { id: 'rev-2', source: 'KaNeXT Title Sponsorship Q1', category: 'sponsorship', amount: 62500, date: 'Jan 1, 2026', series: 'All Series', status: 'received' },
  { id: 'rev-3', source: 'ESPN+ Broadcast Rights — K-1 Invitational', category: 'broadcast', amount: 120000, date: 'Feb 5, 2026', series: 'K-1 Invitational', status: 'received' },
  { id: 'rev-4', source: 'Nike Apparel Sponsorship Q1', category: 'sponsorship', amount: 45000, date: 'Jan 15, 2026', series: 'All Series', status: 'received' },
  { id: 'rev-5', source: 'Gatorade Hydration Partner Q1', category: 'sponsorship', amount: 23750, date: 'Jan 15, 2026', series: 'All Series', status: 'received' },
  { id: 'rev-6', source: 'Team Entry Fees — K-1 Invitational', category: 'entry-fees', amount: 48000, date: 'Dec 20, 2025', series: 'K-1 Invitational', status: 'received' },
  { id: 'rev-7', source: 'Merchandise Sales — KaNeXT Church Championship', category: 'merchandise', amount: 34200, date: 'Jan 19, 2026', series: 'KaNeXT Church Championship', status: 'received' },
  { id: 'rev-8', source: 'Logo Licensing — Regional Partners', category: 'licensing', amount: 28000, date: 'Feb 1, 2026', series: 'All Series', status: 'received' },
  { id: 'rev-9', source: 'Spring Series Gate Revenue', category: 'ticketing', amount: 145000, date: 'Mar 8, 2026', series: 'Spring Series', status: 'pending' },
  { id: 'rev-10', source: 'KaNeXT Title Sponsorship Q2', category: 'sponsorship', amount: 62500, date: 'Apr 1, 2026', series: 'All Series', status: 'projected' },
  { id: 'rev-11', source: 'Nike Apparel Sponsorship Q2', category: 'sponsorship', amount: 45000, date: 'Apr 15, 2026', series: 'All Series', status: 'projected' },
  { id: 'rev-12', source: 'Team Entry Fees — Spring Series', category: 'entry-fees', amount: 36000, date: 'Feb 28, 2026', series: 'Spring Series', status: 'pending' },
  { id: 'rev-13', source: 'Summer Showcase Broadcast Package', category: 'broadcast', amount: 95000, date: 'Jun 15, 2026', series: 'Summer Showcase', status: 'projected' },
  { id: 'rev-14', source: 'Gatorade Hydration Partner Q2', category: 'sponsorship', amount: 23750, date: 'Apr 15, 2026', series: 'All Series', status: 'projected' },
  { id: 'rev-15', source: 'Merchandise Pre-Orders — Spring Series', category: 'merchandise', amount: 18500, date: 'Feb 25, 2026', series: 'Spring Series', status: 'pending' },
  { id: 'rev-16', source: 'K-1 Invitational VIP Packages', category: 'ticketing', amount: 52000, date: 'Feb 6, 2026', series: 'K-1 Invitational', status: 'received' },
  { id: 'rev-17', source: 'Digital Licensing — Streaming Platform', category: 'licensing', amount: 42000, date: 'Mar 1, 2026', series: 'All Series', status: 'pending' },
  { id: 'rev-18', source: 'Summer Showcase Gate Projection', category: 'ticketing', amount: 210000, date: 'Jun 20, 2026', series: 'Summer Showcase', status: 'projected' },
];

const EXPENSE_ITEMS: ExpenseItem[] = [
  { id: 'exp-1', description: 'Barclays Center Venue Rental — KaNeXT Church Championship', category: 'venue', amount: 145000, date: 'Jan 10, 2026', vendor: 'BSE Global', status: 'paid', series: 'KaNeXT Church Championship' },
  { id: 'exp-2', description: 'Event Staff & Security — KaNeXT Church Championship', category: 'staff', amount: 38500, date: 'Jan 17, 2026', vendor: 'Allied Universal', status: 'paid', series: 'KaNeXT Church Championship' },
  { id: 'exp-3', description: 'Referee & Official Fees — K-1 Invitational', category: 'officials', amount: 24000, date: 'Feb 4, 2026', vendor: 'IAABO Officials Bureau', status: 'paid', series: 'K-1 Invitational' },
  { id: 'exp-4', description: 'Court Equipment & Scoreboard Rental', category: 'equipment', amount: 18700, date: 'Jan 8, 2026', vendor: 'Daktronics', status: 'paid', series: 'KaNeXT Church Championship' },
  { id: 'exp-5', description: 'Team Travel Subsidies — K-1 Invitational', category: 'travel', amount: 62000, date: 'Feb 1, 2026', vendor: 'Multiple Teams', status: 'paid', series: 'K-1 Invitational' },
  { id: 'exp-6', description: 'Digital Marketing Campaign — Spring Series', category: 'marketing', amount: 28500, date: 'Feb 15, 2026', vendor: 'Overtime Media', status: 'approved', series: 'Spring Series' },
  { id: 'exp-7', description: 'Event Insurance — All 2026 Series', category: 'insurance', amount: 47000, date: 'Jan 5, 2026', vendor: 'K&K Insurance Group', status: 'paid', series: 'All Series' },
  { id: 'exp-8', description: 'Prize Purse Distribution — KaNeXT Church Championship', category: 'prizes', amount: 175000, date: 'Jan 22, 2026', vendor: 'Prize Pool Fund', status: 'paid', series: 'KaNeXT Church Championship' },
  { id: 'exp-9', description: 'Spring Series Venue Deposit — T-Mobile Arena', category: 'venue', amount: 75000, date: 'Feb 20, 2026', vendor: 'MGM Resorts', status: 'pending', series: 'Spring Series' },
  { id: 'exp-10', description: 'Social Media & PR Agency Retainer', category: 'marketing', amount: 15000, date: 'Feb 1, 2026', vendor: 'Klutch Sports PR', status: 'paid', series: 'All Series' },
  { id: 'exp-11', description: 'Referee & Official Fees — Spring Series', category: 'officials', amount: 18000, date: 'Mar 5, 2026', vendor: 'IAABO Officials Bureau', status: 'approved', series: 'Spring Series' },
  { id: 'exp-12', description: 'Medical Staff & Athletic Trainers', category: 'staff', amount: 22000, date: 'Feb 3, 2026', vendor: 'Select Medical', status: 'paid', series: 'K-1 Invitational' },
  { id: 'exp-13', description: 'Audio/Visual Production Equipment', category: 'equipment', amount: 35000, date: 'Jan 12, 2026', vendor: 'PRG Lighting', status: 'paid', series: 'KaNeXT Church Championship' },
  { id: 'exp-14', description: 'Summer Showcase Venue Hold — Chase Center', category: 'venue', amount: 180000, date: 'Mar 15, 2026', vendor: 'Chase Center Events', status: 'pending', series: 'Summer Showcase' },
  { id: 'exp-15', description: 'Team Travel Subsidies — Spring Series', category: 'travel', amount: 48000, date: 'Mar 1, 2026', vendor: 'Multiple Teams', status: 'approved', series: 'Spring Series' },
  { id: 'exp-16', description: 'Print & Signage — K-1 Invitational', category: 'marketing', amount: 12500, date: 'Jan 28, 2026', vendor: 'FedEx Office', status: 'paid', series: 'K-1 Invitational' },
  { id: 'exp-17', description: 'Championship Trophies & Awards', category: 'equipment', amount: 8500, date: 'Jan 5, 2026', vendor: 'Crown Trophy', status: 'paid', series: 'KaNeXT Church Championship' },
  { id: 'exp-18', description: 'Overdue Invoice — Broadcast Equipment Rental', category: 'equipment', amount: 22000, date: 'Dec 15, 2025', vendor: 'NEP Group', status: 'overdue', series: 'KaNeXT Church Championship' },
];

const PRIZE_ALLOCATIONS: PrizeAllocation[] = [
  { id: 'prz-1', series: 'KaNeXT Church Championship', position: '1st Place', entrant: 'KaNeXT Rattlers', amount: 100000, status: 'paid', date: 'Jan 22, 2026' },
  { id: 'prz-2', series: 'KaNeXT Church Championship', position: '2nd Place', entrant: 'Howard Bison', amount: 50000, status: 'paid', date: 'Jan 22, 2026' },
  { id: 'prz-3', series: 'KaNeXT Church Championship', position: '3rd Place', entrant: 'Hampton Pirates', amount: 25000, status: 'paid', date: 'Jan 23, 2026' },
  { id: 'prz-4', series: 'KaNeXT Church Championship', position: 'MVP Award', entrant: 'Alex Morgan', amount: 10000, status: 'paid', date: 'Jan 22, 2026' },
  { id: 'prz-5', series: 'K-1 Invitational', position: '1st Place', entrant: 'Duke Blue Devils', amount: 75000, status: 'paid', date: 'Feb 8, 2026' },
  { id: 'prz-6', series: 'K-1 Invitational', position: '2nd Place', entrant: 'Kentucky Wildcats', amount: 40000, status: 'paid', date: 'Feb 8, 2026' },
  { id: 'prz-7', series: 'K-1 Invitational', position: '3rd Place', entrant: 'Gonzaga Bulldogs', amount: 20000, status: 'paid', date: 'Feb 9, 2026' },
  { id: 'prz-8', series: 'K-1 Invitational', position: 'MVP Award', entrant: 'Jaylen Carter', amount: 5000, status: 'paid', date: 'Feb 8, 2026' },
  { id: 'prz-9', series: 'Spring Series', position: '1st Place', entrant: 'TBD', amount: 80000, status: 'allocated', date: 'Mar 15, 2026' },
  { id: 'prz-10', series: 'Spring Series', position: '2nd Place', entrant: 'TBD', amount: 40000, status: 'allocated', date: 'Mar 15, 2026' },
  { id: 'prz-11', series: 'Spring Series', position: '3rd Place', entrant: 'TBD', amount: 20000, status: 'allocated', date: 'Mar 15, 2026' },
  { id: 'prz-12', series: 'Spring Series', position: 'MVP Award', entrant: 'TBD', amount: 5000, status: 'allocated', date: 'Mar 15, 2026' },
  { id: 'prz-13', series: 'Summer Showcase', position: '1st Place', entrant: 'TBD', amount: 60000, status: 'held', date: 'Jun 22, 2026' },
  { id: 'prz-14', series: 'Summer Showcase', position: '2nd Place', entrant: 'TBD', amount: 30000, status: 'held', date: 'Jun 22, 2026' },
  { id: 'prz-15', series: 'Summer Showcase', position: '3rd Place', entrant: 'TBD', amount: 15000, status: 'held', date: 'Jun 22, 2026' },
  { id: 'prz-16', series: 'Summer Showcase', position: 'MVP Award', entrant: 'TBD', amount: 5000, status: 'held', date: 'Jun 22, 2026' },
];

const SPONSORSHIP_ITEMS: SponsorshipRevenue[] = [
  { id: 'spon-1', sponsor: 'KaNeXT', package: 'Title Sponsor', amount: 250000, period: '2026 Season', status: 'active', paymentSchedule: 'Quarterly ($62.5K)' },
  { id: 'spon-2', sponsor: 'Nike', package: 'Official Apparel Partner', amount: 180000, period: '2026 Season', status: 'active', paymentSchedule: 'Quarterly ($45K)' },
  { id: 'spon-3', sponsor: 'Gatorade', package: 'Hydration Partner', amount: 95000, period: '2026 Season', status: 'active', paymentSchedule: 'Quarterly ($23.75K)' },
  { id: 'spon-4', sponsor: 'State Farm', package: 'Insurance Partner', amount: 65000, period: '2026 Season', status: 'active', paymentSchedule: 'Semi-Annual ($32.5K)' },
  { id: 'spon-5', sponsor: 'Beats by Dre', package: 'Audio Partner', amount: 45000, period: 'K-1 Invitational', status: 'active', paymentSchedule: 'One-time' },
  { id: 'spon-6', sponsor: 'Chick-fil-A', package: 'Concessions Partner', amount: 35000, period: '2026 Season', status: 'active', paymentSchedule: 'Per Event ($8.75K)' },
  { id: 'spon-7', sponsor: 'AT&T', package: 'Connectivity Partner', amount: 55000, period: '2026 Season', status: 'pending', paymentSchedule: 'Quarterly ($13.75K)' },
  { id: 'spon-8', sponsor: 'Toyota', package: 'Transportation Sponsor', amount: 40000, period: 'Spring Series', status: 'pending', paymentSchedule: 'One-time' },
  { id: 'spon-9', sponsor: 'Coca-Cola', package: 'Beverage Partner', amount: 30000, period: 'KaNeXT Church Championship', status: 'active', paymentSchedule: 'One-time' },
  { id: 'spon-10', sponsor: 'Under Armour', package: 'Training Gear Sponsor', amount: 25000, period: 'Summer Showcase', status: 'pending', paymentSchedule: 'One-time' },
  { id: 'spon-11', sponsor: 'Spalding', package: 'Official Ball Partner', amount: 20000, period: '2025 Season', status: 'expired', paymentSchedule: 'Annual' },
  { id: 'spon-12', sponsor: 'SeatGeek', package: 'Ticketing Platform Partner', amount: 18000, period: '2026 Season', status: 'active', paymentSchedule: 'Monthly ($1.5K)' },
];

const TICKETING_RECORDS: TicketingRecord[] = [
  { id: 'tix-1', event: 'KaNeXT Church Championship — Final', venue: 'Barclays Center', ticketsSold: 14800, capacity: 17732, revenue: 118000, avgPrice: 79.73, date: 'Jan 18, 2026' },
  { id: 'tix-2', event: 'KaNeXT Church Championship — Semifinal 1', venue: 'Barclays Center', ticketsSold: 11200, capacity: 17732, revenue: 67200, avgPrice: 60.00, date: 'Jan 17, 2026' },
  { id: 'tix-3', event: 'KaNeXT Church Championship — Semifinal 2', venue: 'Barclays Center', ticketsSold: 10500, capacity: 17732, revenue: 63000, avgPrice: 60.00, date: 'Jan 17, 2026' },
  { id: 'tix-4', event: 'K-1 Invitational — Championship', venue: 'Madison Square Garden', ticketsSold: 18200, capacity: 19812, revenue: 164000, avgPrice: 90.11, date: 'Feb 7, 2026' },
  { id: 'tix-5', event: 'K-1 Invitational — Semifinal 1', venue: 'Madison Square Garden', ticketsSold: 15400, capacity: 19812, revenue: 108000, avgPrice: 70.13, date: 'Feb 6, 2026' },
  { id: 'tix-6', event: 'K-1 Invitational — Semifinal 2', venue: 'Madison Square Garden', ticketsSold: 14900, capacity: 19812, revenue: 104000, avgPrice: 69.80, date: 'Feb 6, 2026' },
  { id: 'tix-7', event: 'K-1 Invitational — Quarterfinals', venue: 'Madison Square Garden', ticketsSold: 12000, capacity: 19812, revenue: 72000, avgPrice: 60.00, date: 'Feb 5, 2026' },
  { id: 'tix-8', event: 'KaNeXT Church VIP Experience', venue: 'Barclays Center — Club Level', ticketsSold: 320, capacity: 500, revenue: 52000, avgPrice: 162.50, date: 'Jan 18, 2026' },
  { id: 'tix-9', event: 'Spring Series — Round 1 (Day 1)', venue: 'T-Mobile Arena', ticketsSold: 8500, capacity: 20000, revenue: 51000, avgPrice: 60.00, date: 'Mar 6, 2026' },
  { id: 'tix-10', event: 'Spring Series — Round 1 (Day 2)', venue: 'T-Mobile Arena', ticketsSold: 9200, capacity: 20000, revenue: 55200, avgPrice: 60.00, date: 'Mar 7, 2026' },
  { id: 'tix-11', event: 'Spring Series — Championship', venue: 'T-Mobile Arena', ticketsSold: 0, capacity: 20000, revenue: 0, avgPrice: 75.00, date: 'Mar 8, 2026' },
  { id: 'tix-12', event: 'Summer Showcase — All Sessions', venue: 'Chase Center', ticketsSold: 0, capacity: 18064, revenue: 0, avgPrice: 85.00, date: 'Jun 20, 2026' },
];

const BUDGET_ITEMS: Budget[] = [
  { id: 'bgt-1', name: 'KaNeXT Church Championship — Total', series: 'KaNeXT Church Championship', allocated: 450000, spent: 420700, remaining: 29300, status: 'on-track', category: 'Event' },
  { id: 'bgt-2', name: 'K-1 Invitational — Total', series: 'K-1 Invitational', allocated: 380000, spent: 298200, remaining: 81800, status: 'on-track', category: 'Event' },
  { id: 'bgt-3', name: 'Spring Series — Total', series: 'Spring Series', allocated: 350000, spent: 118500, remaining: 231500, status: 'on-track', category: 'Event' },
  { id: 'bgt-4', name: 'Summer Showcase — Total', series: 'Summer Showcase', allocated: 420000, spent: 180000, remaining: 240000, status: 'on-track', category: 'Event' },
  { id: 'bgt-5', name: 'Marketing & Promotions', series: 'All Series', allocated: 120000, spent: 56000, remaining: 64000, status: 'on-track', category: 'Marketing' },
  { id: 'bgt-6', name: 'Prize Pool Fund', series: 'All Series', allocated: 500000, spent: 325000, remaining: 175000, status: 'on-track', category: 'Prizes' },
  { id: 'bgt-7', name: 'Venue Operations', series: 'All Series', allocated: 500000, spent: 400000, remaining: 100000, status: 'at-risk', category: 'Operations' },
  { id: 'bgt-8', name: 'Officials & Staffing', series: 'All Series', allocated: 150000, spent: 102500, remaining: 47500, status: 'on-track', category: 'Personnel' },
  { id: 'bgt-9', name: 'Insurance & Compliance', series: 'All Series', allocated: 60000, spent: 47000, remaining: 13000, status: 'at-risk', category: 'Compliance' },
  { id: 'bgt-10', name: 'Travel & Logistics', series: 'All Series', allocated: 175000, spent: 110000, remaining: 65000, status: 'on-track', category: 'Logistics' },
  { id: 'bgt-11', name: 'Equipment & Technology', series: 'All Series', allocated: 100000, spent: 84200, remaining: 15800, status: 'at-risk', category: 'Equipment' },
  { id: 'bgt-12', name: 'Broadcast Production', series: 'All Series', allocated: 200000, spent: 142000, remaining: 58000, status: 'on-track', category: 'Production' },
  { id: 'bgt-13', name: 'Contingency Reserve', series: 'All Series', allocated: 75000, spent: 22000, remaining: 53000, status: 'on-track', category: 'Reserve' },
  { id: 'bgt-14', name: 'Hospitality & VIP', series: 'All Series', allocated: 80000, spent: 85000, remaining: -5000, status: 'over-budget', category: 'Hospitality' },
];

const PAYOUT_RECORDS: PayoutRecord[] = [
  { id: 'pay-1', recipient: 'KaNeXT Rattlers', amount: 100000, type: 'prize', status: 'completed', date: 'Jan 22, 2026', reference: 'PRZ-2026-001' },
  { id: 'pay-2', recipient: 'Howard Bison', amount: 50000, type: 'prize', status: 'completed', date: 'Jan 22, 2026', reference: 'PRZ-2026-002' },
  { id: 'pay-3', recipient: 'Hampton Pirates', amount: 25000, type: 'prize', status: 'completed', date: 'Jan 23, 2026', reference: 'PRZ-2026-003' },
  { id: 'pay-4', recipient: 'Duke Blue Devils', amount: 75000, type: 'prize', status: 'completed', date: 'Feb 8, 2026', reference: 'PRZ-2026-004' },
  { id: 'pay-5', recipient: 'Kentucky Wildcats', amount: 40000, type: 'prize', status: 'completed', date: 'Feb 8, 2026', reference: 'PRZ-2026-005' },
  { id: 'pay-6', recipient: 'IAABO Officials Bureau', amount: 24000, type: 'official', status: 'completed', date: 'Feb 10, 2026', reference: 'OFF-2026-001' },
  { id: 'pay-7', recipient: 'Allied Universal Security', amount: 38500, type: 'vendor', status: 'completed', date: 'Jan 25, 2026', reference: 'VND-2026-001' },
  { id: 'pay-8', recipient: 'BSE Global (Barclays)', amount: 145000, type: 'vendor', status: 'completed', date: 'Jan 28, 2026', reference: 'VND-2026-002' },
  { id: 'pay-9', recipient: 'MGM Resorts (T-Mobile Arena)', amount: 75000, type: 'vendor', status: 'processing', date: 'Feb 22, 2026', reference: 'VND-2026-003' },
  { id: 'pay-10', recipient: 'IAABO Officials Bureau — Spring', amount: 18000, type: 'official', status: 'pending', date: 'Mar 1, 2026', reference: 'OFF-2026-002' },
  { id: 'pay-11', recipient: 'Chase Center Events', amount: 180000, type: 'vendor', status: 'pending', date: 'Mar 15, 2026', reference: 'VND-2026-004' },
  { id: 'pay-12', recipient: 'Overtime Media (Marketing)', amount: 28500, type: 'vendor', status: 'pending', date: 'Mar 1, 2026', reference: 'VND-2026-005' },
  { id: 'pay-13', recipient: 'Ticket Refund — J. Williams', amount: 320, type: 'refund', status: 'completed', date: 'Jan 20, 2026', reference: 'REF-2026-001' },
  { id: 'pay-14', recipient: 'Ticket Refund — A. Chen', amount: 240, type: 'refund', status: 'processing', date: 'Feb 12, 2026', reference: 'REF-2026-002' },
  { id: 'pay-15', recipient: 'Select Medical (Trainers)', amount: 22000, type: 'vendor', status: 'completed', date: 'Feb 10, 2026', reference: 'VND-2026-006' },
  { id: 'pay-16', recipient: 'NEP Group (Broadcast Equip)', amount: 22000, type: 'vendor', status: 'failed', date: 'Feb 15, 2026', reference: 'VND-2026-007' },
  { id: 'pay-17', recipient: 'Gonzaga Bulldogs', amount: 20000, type: 'prize', status: 'completed', date: 'Feb 9, 2026', reference: 'PRZ-2026-006' },
  { id: 'pay-18', recipient: 'Alex Morgan (MVP)', amount: 10000, type: 'prize', status: 'completed', date: 'Jan 24, 2026', reference: 'PRZ-2026-007' },
];

const REPORT_ITEMS: FinanceReport[] = [
  { id: 'rpt-1', name: 'KaNeXT Church Championship — P&L Summary', type: 'Profit & Loss', period: 'Jan 2026', format: 'PDF', generatedDate: 'Jan 25, 2026' },
  { id: 'rpt-2', name: 'K-1 Invitational — P&L Summary', type: 'Profit & Loss', period: 'Feb 2026', format: 'PDF', generatedDate: 'Feb 12, 2026' },
  { id: 'rpt-3', name: 'Monthly Revenue Report — January', type: 'Revenue', period: 'Jan 2026', format: 'XLSX', generatedDate: 'Feb 1, 2026' },
  { id: 'rpt-4', name: 'Monthly Revenue Report — February', type: 'Revenue', period: 'Feb 2026', format: 'XLSX', generatedDate: 'Mar 1, 2026' },
  { id: 'rpt-5', name: 'Sponsorship Pipeline Report', type: 'Sponsorship', period: 'Q1 2026', format: 'PDF', generatedDate: 'Feb 15, 2026' },
  { id: 'rpt-6', name: 'Budget Variance Analysis', type: 'Budget', period: 'Q1 2026', format: 'XLSX', generatedDate: 'Feb 10, 2026' },
  { id: 'rpt-7', name: 'Prize Pool Distribution Ledger', type: 'Prize Pool', period: '2026 Season', format: 'CSV', generatedDate: 'Feb 9, 2026' },
  { id: 'rpt-8', name: 'Ticketing Revenue by Event', type: 'Ticketing', period: 'Jan–Feb 2026', format: 'XLSX', generatedDate: 'Feb 14, 2026' },
  { id: 'rpt-9', name: 'Expense Breakdown by Category', type: 'Expenses', period: 'Q1 2026', format: 'PDF', generatedDate: 'Feb 15, 2026' },
  { id: 'rpt-10', name: 'Payout Reconciliation Report', type: 'Payouts', period: 'Jan–Feb 2026', format: 'CSV', generatedDate: 'Feb 16, 2026' },
  { id: 'rpt-11', name: 'Annual Forecast — 2026', type: 'Forecast', period: '2026 Full Year', format: 'PDF', generatedDate: 'Jan 15, 2026' },
  { id: 'rpt-12', name: 'Tax Withholding Summary', type: 'Tax', period: 'Q1 2026', format: 'XLSX', generatedDate: 'Feb 17, 2026' },
];

const SETTING_TOGGLES: FinanceSettingToggle[] = [
  { id: 'set-1', label: 'Currency Display', description: 'Show amounts in USD with comma separators', enabled: true },
  { id: 'set-2', label: 'Auto-Generate Monthly Reports', description: 'Automatically create P&L and revenue reports on the 1st of each month', enabled: true },
  { id: 'set-3', label: 'Payout Notifications', description: 'Receive alerts when payouts are processed, completed, or fail', enabled: true },
  { id: 'set-4', label: 'Budget Threshold Alerts', description: 'Notify when any budget reaches 85% utilization', enabled: true },
  { id: 'set-5', label: 'Sponsorship Renewal Reminders', description: 'Alert 30 days before sponsorship contracts expire', enabled: true },
  { id: 'set-6', label: 'Require Dual Approval', description: 'Require two approvals for expenses over $25,000', enabled: false },
  { id: 'set-7', label: 'Auto-Reconcile Ticketing', description: 'Automatically match ticket sales to revenue entries', enabled: true },
  { id: 'set-8', label: 'Export to Accounting System', description: 'Sync financial data with QuickBooks Online', enabled: false },
];

// =============================================================================
// DATA ACCESSOR
// =============================================================================

export function getCompFinanceData(_scope: string): CompFinanceData {
  // Scope filtering can be extended later; for now return full dataset
  return {
    dashboard: DASHBOARD_BLOCKS,
    revenue: REVENUE_ITEMS,
    expenses: EXPENSE_ITEMS,
    prizePool: PRIZE_ALLOCATIONS,
    sponsorship: SPONSORSHIP_ITEMS,
    ticketing: TICKETING_RECORDS,
    budgets: BUDGET_ITEMS,
    payouts: PAYOUT_RECORDS,
    reports: REPORT_ITEMS,
    settings: SETTING_TOGGLES,
  };
}
