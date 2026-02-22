/**
 * Competition Organization Reports Tab — mock data, types, and constants.
 * 10-tab Reports Hub: Dashboard, Operational, Financial, Compliance, Performance,
 * Attendance, Media, Custom, Scheduled, Settings.
 */

// =============================================================================
// TAB TYPES & CONSTANTS
// =============================================================================

export type CompReportsTabId =
  | 'dashboard'
  | 'operational'
  | 'financial'
  | 'compliance'
  | 'performance'
  | 'attendance'
  | 'media'
  | 'custom'
  | 'scheduled'
  | 'settings';

export const COMP_REPORTS_TABS: { id: CompReportsTabId; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'square.grid.2x2' },
  { id: 'operational', label: 'Operational', icon: 'gearshape.2' },
  { id: 'financial', label: 'Financial', icon: 'dollarsign.circle' },
  { id: 'compliance', label: 'Compliance', icon: 'checkmark.shield' },
  { id: 'performance', label: 'Performance', icon: 'chart.line.uptrend.xyaxis' },
  { id: 'attendance', label: 'Attendance', icon: 'person.3' },
  { id: 'media', label: 'Media', icon: 'play.rectangle' },
  { id: 'custom', label: 'Custom', icon: 'slider.horizontal.3' },
  { id: 'scheduled', label: 'Scheduled', icon: 'clock.arrow.2.circlepath' },
  { id: 'settings', label: 'Settings', icon: 'gearshape' },
];

export const COMP_REPORTS_SCOPE_CHIPS = [
  'All Reports',
  'Operational',
  'Financial',
  'Compliance',
  'Performance',
];

// =============================================================================
// DATA INTERFACES
// =============================================================================

export interface ReportsDashboardBlock {
  id: string;
  label: string;
  value: string;
  delta: string;
  icon: string;
  color: string;
}

export interface OperationalReport {
  id: string;
  name: string;
  series: string;
  period: string;
  status: 'published' | 'draft' | 'generating' | 'failed';
  generatedDate: string;
  author: string;
  format: 'PDF' | 'CSV' | 'XLSX' | 'Dashboard';
  pageCount: number;
  downloads: number;
}

export interface FinancialReport {
  id: string;
  name: string;
  type: 'p&l' | 'balance-sheet' | 'cash-flow' | 'budget-variance' | 'revenue-breakdown';
  period: string;
  amount: number;
  status: 'final' | 'draft' | 'pending-review';
  generatedDate: string;
  format: 'PDF' | 'CSV' | 'XLSX' | 'Dashboard';
}

export interface ComplianceReport {
  id: string;
  name: string;
  type: 'eligibility-audit' | 'drug-test-summary' | 'incident-log' | 'rules-review' | 'certification-status';
  period: string;
  findings: number;
  status: 'clean' | 'issues-found' | 'pending';
  generatedDate: string;
}

export interface PerformanceReport {
  id: string;
  name: string;
  series: string;
  type: 'standings' | 'statistics' | 'player-rankings' | 'team-analytics' | 'historical-trends';
  period: string;
  generatedDate: string;
  format: 'PDF' | 'CSV' | 'XLSX' | 'Dashboard';
}

export interface AttendanceReport {
  id: string;
  event: string;
  venue: string;
  date: string;
  attendance: number;
  capacity: number;
  utilization: number;
  revenue: number;
  notes: string;
}

export interface MediaReport {
  id: string;
  name: string;
  type: 'broadcast-reach' | 'social-engagement' | 'press-coverage' | 'content-performance';
  period: string;
  metric: string;
  value: string;
  change: number;
}

export interface CustomReport {
  id: string;
  name: string;
  creator: string;
  dataSources: string[];
  filters: string[];
  lastRun: string;
  schedule: string;
  format: 'PDF' | 'CSV' | 'XLSX' | 'Dashboard';
}

export interface ScheduledReport {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly';
  nextRun: string;
  recipients: string[];
  format: 'PDF' | 'CSV' | 'XLSX' | 'Dashboard';
  enabled: boolean;
}

export interface ReportSettingToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

// =============================================================================
// STATUS COLORS
// =============================================================================

export const REPORT_STATUS_COLOR: Record<OperationalReport['status'], string> = {
  published: '#22C55E',
  draft: '#F59E0B',
  generating: '#1D9BF0',
  failed: '#EF4444',
};

export const FINANCIAL_STATUS_COLOR: Record<FinancialReport['status'], string> = {
  final: '#22C55E',
  draft: '#F59E0B',
  'pending-review': '#1D9BF0',
};

export const COMPLIANCE_STATUS_COLOR: Record<ComplianceReport['status'], string> = {
  clean: '#22C55E',
  'issues-found': '#EF4444',
  pending: '#F59E0B',
};

export const FORMAT_COLOR: Record<OperationalReport['format'], string> = {
  PDF: '#EF4444',
  CSV: '#22C55E',
  XLSX: '#1D9BF0',
  Dashboard: '#1D9BF0',
};

export const FREQUENCY_COLOR: Record<ScheduledReport['frequency'], string> = {
  daily: '#EF4444',
  weekly: '#1D9BF0',
  'bi-weekly': '#1D9BF0',
  monthly: '#22C55E',
  quarterly: '#F59E0B',
};

export const MEDIA_TYPE_COLOR: Record<MediaReport['type'], string> = {
  'broadcast-reach': '#1D9BF0',
  'social-engagement': '#22C55E',
  'press-coverage': '#F59E0B',
  'content-performance': '#1D9BF0',
};

// =============================================================================
// HELPER
// =============================================================================

export function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// =============================================================================
// MOCK DATA
// =============================================================================

export function getCompReportsData(scope: string) {
  return {
    dashboard: DASHBOARD_BLOCKS,
    operational: OPERATIONAL_REPORTS,
    financial: FINANCIAL_REPORTS,
    compliance: COMPLIANCE_REPORTS,
    performance: PERFORMANCE_REPORTS,
    attendance: ATTENDANCE_REPORTS,
    media: MEDIA_REPORTS,
    custom: CUSTOM_REPORTS,
    scheduled: SCHEDULED_REPORTS,
    settings: SETTINGS_TOGGLES,
  };
}

// === Dashboard ===

const DASHBOARD_BLOCKS: ReportsDashboardBlock[] = [
  {
    id: 'rdb-1',
    label: 'Total Reports',
    value: '148',
    delta: '+12 this month',
    icon: 'doc.text.fill',
    color: '#1D9BF0',
  },
  {
    id: 'rdb-2',
    label: 'Published This Month',
    value: '23',
    delta: '+8 vs last month',
    icon: 'checkmark.circle.fill',
    color: '#22C55E',
  },
  {
    id: 'rdb-3',
    label: 'Scheduled Active',
    value: '14',
    delta: '3 running today',
    icon: 'clock.arrow.2.circlepath',
    color: '#1D9BF0',
  },
  {
    id: 'rdb-4',
    label: 'Total Downloads',
    value: '2,847',
    delta: '+340 this week',
    icon: 'arrow.down.circle.fill',
    color: '#F59E0B',
  },
  {
    id: 'rdb-5',
    label: 'Failed Reports',
    value: '2',
    delta: '1 needs retry',
    icon: 'exclamationmark.triangle.fill',
    color: '#EF4444',
  },
  {
    id: 'rdb-6',
    label: 'Avg Generation Time',
    value: '4.2s',
    delta: '-0.8s vs last month',
    icon: 'bolt.fill',
    color: '#22C55E',
  },
];

// === Operational Reports ===

const OPERATIONAL_REPORTS: OperationalReport[] = [
  { id: 'op-1', name: '2819 Church Season Operational Summary', series: '2819 Church', period: '2025-26 Season', status: 'published', generatedDate: 'Feb 14, 2026', author: 'Tom Bradley', format: 'PDF', pageCount: 42, downloads: 156 },
  { id: 'op-2', name: '3SSB Invitational Operations Review', series: '3SSB Invitational', period: 'Feb 2026', status: 'published', generatedDate: 'Feb 12, 2026', author: 'Alex Morgan', format: 'PDF', pageCount: 28, downloads: 89 },
  { id: 'op-3', name: 'Conference Tournament Logistics Plan', series: 'Conference Tournament', period: 'Mar 2026', status: 'draft', generatedDate: 'Feb 15, 2026', author: 'Rachel Kim', format: 'PDF', pageCount: 36, downloads: 0 },
  { id: 'op-4', name: 'Facility Usage Report — Arena Complex', series: 'Facilities', period: 'Jan 2026', status: 'published', generatedDate: 'Feb 3, 2026', author: 'James Wright', format: 'XLSX', pageCount: 0, downloads: 67 },
  { id: 'op-5', name: 'Official Assignment Efficiency Report', series: 'Officiating', period: 'Q1 2026', status: 'published', generatedDate: 'Feb 10, 2026', author: 'David Chen', format: 'Dashboard', pageCount: 0, downloads: 112 },
  { id: 'op-6', name: 'Volunteer Deployment Summary', series: 'Volunteer Ops', period: 'Jan 2026', status: 'published', generatedDate: 'Feb 1, 2026', author: 'Brian Mitchell', format: 'PDF', pageCount: 18, downloads: 44 },
  { id: 'op-7', name: 'Event Day Operations Checklist — MBB', series: 'Game Ops', period: 'Feb 15, 2026', status: 'published', generatedDate: 'Feb 15, 2026', author: 'Patricia Wilson', format: 'PDF', pageCount: 8, downloads: 23 },
  { id: 'op-8', name: 'Equipment Inventory Audit', series: 'Assets', period: 'Q4 2025', status: 'published', generatedDate: 'Jan 18, 2026', author: 'Chris Anderson', format: 'XLSX', pageCount: 0, downloads: 31 },
  { id: 'op-9', name: 'Transportation Coordination Log', series: 'Logistics', period: 'Jan 2026', status: 'published', generatedDate: 'Feb 5, 2026', author: 'Natalie Reed', format: 'CSV', pageCount: 0, downloads: 19 },
  { id: 'op-10', name: 'Security Incident Summary', series: 'Security', period: 'Jan 2026', status: 'published', generatedDate: 'Feb 2, 2026', author: 'Michael Brown', format: 'PDF', pageCount: 12, downloads: 56 },
  { id: 'op-11', name: 'Conference Championship Ops Plan', series: 'Conference Tournament', period: 'Mar 2026', status: 'generating', generatedDate: '', author: 'Tom Bradley', format: 'PDF', pageCount: 0, downloads: 0 },
  { id: 'op-12', name: 'Vendor Performance Scorecard', series: 'Vendor Mgmt', period: 'Q4 2025', status: 'published', generatedDate: 'Jan 22, 2026', author: 'Angela Torres', format: 'Dashboard', pageCount: 0, downloads: 78 },
  { id: 'op-13', name: 'Swim & Dive Invitational Ops Brief', series: 'Aquatics', period: 'Mar 2026', status: 'draft', generatedDate: 'Feb 14, 2026', author: 'Rachel Kim', format: 'PDF', pageCount: 14, downloads: 0 },
  { id: 'op-14', name: 'Annual Operations Dashboard Export', series: 'Annual Review', period: '2025', status: 'failed', generatedDate: 'Feb 11, 2026', author: 'Alex Morgan', format: 'Dashboard', pageCount: 0, downloads: 0 },
  { id: 'op-15', name: 'Spring Season Scheduling Matrix', series: 'Scheduling', period: 'Spring 2026', status: 'draft', generatedDate: 'Feb 13, 2026', author: 'Patricia Wilson', format: 'XLSX', pageCount: 0, downloads: 0 },
];

// === Financial Reports ===

const FINANCIAL_REPORTS: FinancialReport[] = [
  { id: 'fi-1', name: 'Q4 Financial Statement', type: 'p&l', period: 'Q4 2025', amount: 2450000, status: 'final', generatedDate: 'Jan 28, 2026', format: 'PDF' },
  { id: 'fi-2', name: 'Conference Tournament Budget Variance', type: 'budget-variance', period: 'Mar 2026', amount: 185000, status: 'draft', generatedDate: 'Feb 15, 2026', format: 'XLSX' },
  { id: 'fi-3', name: 'Annual Balance Sheet — FY2025', type: 'balance-sheet', period: 'FY2025', amount: 8750000, status: 'final', generatedDate: 'Jan 20, 2026', format: 'PDF' },
  { id: 'fi-4', name: 'January Cash Flow Analysis', type: 'cash-flow', period: 'Jan 2026', amount: 342000, status: 'final', generatedDate: 'Feb 5, 2026', format: 'PDF' },
  { id: 'fi-5', name: '3SSB Invitational Revenue Breakdown', type: 'revenue-breakdown', period: 'Feb 2026', amount: 127500, status: 'final', generatedDate: 'Feb 13, 2026', format: 'Dashboard' },
  { id: 'fi-6', name: 'Sponsorship Revenue Report', type: 'revenue-breakdown', period: 'Q1 2026', amount: 475000, status: 'pending-review', generatedDate: 'Feb 14, 2026', format: 'PDF' },
  { id: 'fi-7', name: 'Officials Pay Disbursement Summary', type: 'cash-flow', period: 'Jan 2026', amount: 68400, status: 'final', generatedDate: 'Feb 3, 2026', format: 'CSV' },
  { id: 'fi-8', name: 'Facility Rental Income Report', type: 'revenue-breakdown', period: 'Q4 2025', amount: 213000, status: 'final', generatedDate: 'Jan 15, 2026', format: 'PDF' },
  { id: 'fi-9', name: 'Concessions & Merchandise P&L', type: 'p&l', period: 'Jan 2026', amount: 94500, status: 'final', generatedDate: 'Feb 8, 2026', format: 'XLSX' },
  { id: 'fi-10', name: 'Travel & Accommodation Expenses', type: 'budget-variance', period: 'Jan 2026', amount: 52300, status: 'final', generatedDate: 'Feb 6, 2026', format: 'PDF' },
  { id: 'fi-11', name: 'Spring Season Budget Forecast', type: 'budget-variance', period: 'Spring 2026', amount: 1100000, status: 'draft', generatedDate: 'Feb 14, 2026', format: 'XLSX' },
  { id: 'fi-12', name: 'Insurance & Liability Costs', type: 'cash-flow', period: 'FY2025', amount: 186000, status: 'final', generatedDate: 'Jan 25, 2026', format: 'PDF' },
  { id: 'fi-13', name: 'Media Rights Revenue Statement', type: 'revenue-breakdown', period: 'Q4 2025', amount: 325000, status: 'pending-review', generatedDate: 'Feb 10, 2026', format: 'PDF' },
  { id: 'fi-14', name: 'Emergency Fund Balance Report', type: 'balance-sheet', period: 'Feb 2026', amount: 420000, status: 'final', generatedDate: 'Feb 1, 2026', format: 'PDF' },
  { id: 'fi-15', name: 'YoY Financial Comparison Dashboard', type: 'p&l', period: '2024 vs 2025', amount: 0, status: 'draft', generatedDate: 'Feb 12, 2026', format: 'Dashboard' },
];

// === Compliance Reports ===

const COMPLIANCE_REPORTS: ComplianceReport[] = [
  { id: 'co-1', name: 'Annual Eligibility Audit', type: 'eligibility-audit', period: '2025-26 Season', findings: 0, status: 'clean', generatedDate: 'Feb 10, 2026' },
  { id: 'co-2', name: 'Pre-Tournament Drug Test Summary', type: 'drug-test-summary', period: 'Feb 2026', findings: 0, status: 'clean', generatedDate: 'Feb 14, 2026' },
  { id: 'co-3', name: 'Q4 Incident Log Review', type: 'incident-log', period: 'Q4 2025', findings: 3, status: 'issues-found', generatedDate: 'Jan 20, 2026' },
  { id: 'co-4', name: 'Rule Book Amendment Review — 2026', type: 'rules-review', period: '2026 Season', findings: 0, status: 'clean', generatedDate: 'Jan 15, 2026' },
  { id: 'co-5', name: 'Official Certification Status Check', type: 'certification-status', period: 'Feb 2026', findings: 2, status: 'issues-found', generatedDate: 'Feb 12, 2026' },
  { id: 'co-6', name: 'Transfer Eligibility Audit — MBB', type: 'eligibility-audit', period: 'Spring 2026', findings: 0, status: 'pending', generatedDate: 'Feb 15, 2026' },
  { id: 'co-7', name: 'Facility Safety Compliance Report', type: 'rules-review', period: 'Q1 2026', findings: 1, status: 'issues-found', generatedDate: 'Feb 8, 2026' },
  { id: 'co-8', name: 'Random Drug Testing — January', type: 'drug-test-summary', period: 'Jan 2026', findings: 0, status: 'clean', generatedDate: 'Feb 1, 2026' },
  { id: 'co-9', name: 'Game Day Incident Report — 3SSB', type: 'incident-log', period: 'Feb 7-9, 2026', findings: 1, status: 'issues-found', generatedDate: 'Feb 11, 2026' },
  { id: 'co-10', name: 'Volunteer Background Check Audit', type: 'certification-status', period: 'Q1 2026', findings: 0, status: 'clean', generatedDate: 'Feb 6, 2026' },
  { id: 'co-11', name: 'Title IX Compliance Review', type: 'rules-review', period: 'FY2025', findings: 0, status: 'clean', generatedDate: 'Jan 25, 2026' },
  { id: 'co-12', name: 'Medical Staff Certification Audit', type: 'certification-status', period: 'Feb 2026', findings: 0, status: 'pending', generatedDate: 'Feb 14, 2026' },
  { id: 'co-13', name: 'Recruiting Rules Compliance Check', type: 'rules-review', period: '2025-26 Season', findings: 0, status: 'clean', generatedDate: 'Feb 3, 2026' },
  { id: 'co-14', name: 'January Incident & Ejection Log', type: 'incident-log', period: 'Jan 2026', findings: 5, status: 'issues-found', generatedDate: 'Feb 2, 2026' },
  { id: 'co-15', name: 'Academic Eligibility Verification', type: 'eligibility-audit', period: 'Spring 2026', findings: 0, status: 'pending', generatedDate: 'Feb 13, 2026' },
];

// === Performance Reports ===

const PERFORMANCE_REPORTS: PerformanceReport[] = [
  { id: 'pe-1', name: '3SSB Invitational Statistics Pack', series: '3SSB Invitational', type: 'statistics', period: 'Feb 2026', generatedDate: 'Feb 12, 2026', format: 'PDF' },
  { id: 'pe-2', name: '2819 Church Conference Standings Report', series: '2819 Church', type: 'standings', period: 'Week 12', generatedDate: 'Feb 14, 2026', format: 'Dashboard' },
  { id: 'pe-3', name: 'MBB Player Rankings — Conference', series: '2819 Church', type: 'player-rankings', period: 'Feb 2026', generatedDate: 'Feb 13, 2026', format: 'PDF' },
  { id: 'pe-4', name: 'Team Analytics — 3SSB Basketball', series: '2819 Church', type: 'team-analytics', period: '2025-26 Season', generatedDate: 'Feb 11, 2026', format: 'Dashboard' },
  { id: 'pe-5', name: 'Historical Win-Loss Trends (5yr)', series: 'Conference History', type: 'historical-trends', period: '2021-2026', generatedDate: 'Feb 10, 2026', format: 'PDF' },
  { id: 'pe-6', name: 'Soccer Invitational Stats Summary', series: 'Soccer Invitational', type: 'statistics', period: 'Mar 2026', generatedDate: 'Feb 15, 2026', format: 'XLSX' },
  { id: 'pe-7', name: 'Volleyball Classic Team Rankings', series: 'Volleyball Classic', type: 'standings', period: 'Mar 2026', generatedDate: 'Feb 14, 2026', format: 'PDF' },
  { id: 'pe-8', name: 'Conference Player of the Week Log', series: '2819 Church', type: 'player-rankings', period: 'Season-to-Date', generatedDate: 'Feb 14, 2026', format: 'CSV' },
  { id: 'pe-9', name: 'Swimming & Diving Meet Results', series: 'Aquatics', type: 'statistics', period: 'Jan 2026', generatedDate: 'Feb 2, 2026', format: 'PDF' },
  { id: 'pe-10', name: 'Track & Field Performance Index', series: 'Track & Field', type: 'team-analytics', period: 'Indoor Season 2026', generatedDate: 'Feb 8, 2026', format: 'Dashboard' },
  { id: 'pe-11', name: 'Conference RPI Calculator Export', series: '2819 Church', type: 'standings', period: 'Feb 14, 2026', generatedDate: 'Feb 14, 2026', format: 'XLSX' },
  { id: 'pe-12', name: 'Softball Spring Preview Stats', series: 'Softball', type: 'historical-trends', period: '2023-2026', generatedDate: 'Feb 6, 2026', format: 'PDF' },
  { id: 'pe-13', name: 'Cross-Sport Strength of Schedule', series: 'All Sports', type: 'team-analytics', period: '2025-26 Season', generatedDate: 'Feb 9, 2026', format: 'Dashboard' },
  { id: 'pe-14', name: 'Tennis Doubles Rankings Update', series: 'Tennis', type: 'player-rankings', period: 'Spring 2026', generatedDate: 'Feb 7, 2026', format: 'PDF' },
  { id: 'pe-15', name: 'Baseball Season Projections', series: 'Baseball', type: 'historical-trends', period: 'Spring 2026', generatedDate: 'Feb 5, 2026', format: 'XLSX' },
];

// === Attendance Reports ===

const ATTENDANCE_REPORTS: AttendanceReport[] = [
  { id: 'at-1', event: '3SSB vs Gulf Coast State — MBB', venue: 'Arena Complex', date: 'Feb 14, 2026', attendance: 4850, capacity: 5200, utilization: 93, revenue: 72500, notes: 'Near sellout — rivalry game' },
  { id: 'at-2', event: '3SSB Invitational — Day 1', venue: 'Arena Complex', date: 'Feb 7, 2026', attendance: 3200, capacity: 5200, utilization: 62, revenue: 38400, notes: 'First day, building momentum' },
  { id: 'at-3', event: '3SSB Invitational — Day 2', venue: 'Arena Complex', date: 'Feb 8, 2026', attendance: 4100, capacity: 5200, utilization: 79, revenue: 49200, notes: 'Strong Saturday turnout' },
  { id: 'at-4', event: '3SSB Invitational — Championship', venue: 'Arena Complex', date: 'Feb 9, 2026', attendance: 5050, capacity: 5200, utilization: 97, revenue: 75750, notes: 'Near capacity — championship atmosphere' },
  { id: 'at-5', event: '3SSB vs Naples University — MBB', venue: 'Arena Complex', date: 'Feb 1, 2026', attendance: 3800, capacity: 5200, utilization: 73, revenue: 57000, notes: '' },
  { id: 'at-6', event: '3SSB vs SW MSU-Northern Tech — WBB', venue: 'Arena Complex', date: 'Feb 12, 2026', attendance: 1850, capacity: 5200, utilization: 36, revenue: 18500, notes: 'Weekday game' },
  { id: 'at-7', event: '3SSB Baseball vs Cape Coral', venue: 'Diamond Field', date: 'Feb 10, 2026', attendance: 1200, capacity: 2500, utilization: 48, revenue: 9600, notes: '' },
  { id: 'at-8', event: 'Swim & Dive Dual Meet', venue: 'Aquatic Center', date: 'Jan 28, 2026', attendance: 380, capacity: 600, utilization: 63, revenue: 2280, notes: 'Good turnout for swim' },
  { id: 'at-9', event: '3SSB vs Sarasota State — MBB', venue: 'Arena Complex', date: 'Jan 25, 2026', attendance: 4200, capacity: 5200, utilization: 81, revenue: 63000, notes: 'Conference matchup' },
  { id: 'at-10', event: 'Indoor Track & Field Invitational', venue: 'Field House', date: 'Jan 22, 2026', attendance: 650, capacity: 1200, utilization: 54, revenue: 3900, notes: '' },
  { id: 'at-11', event: '3SSB Volleyball vs Tampa Bay', venue: 'Arena Complex', date: 'Jan 18, 2026', attendance: 2100, capacity: 3500, utilization: 60, revenue: 15750, notes: 'Volleyball config' },
  { id: 'at-12', event: '3SSB Soccer vs Orlando Tech', venue: 'Stadium Field', date: 'Jan 15, 2026', attendance: 1450, capacity: 3000, utilization: 48, revenue: 10150, notes: '' },
  { id: 'at-13', event: '3SSB vs Lakeland University — MBB', venue: 'Arena Complex', date: 'Jan 11, 2026', attendance: 3600, capacity: 5200, utilization: 69, revenue: 54000, notes: '' },
  { id: 'at-14', event: 'Tennis Home Opener', venue: 'Tennis Complex', date: 'Jan 20, 2026', attendance: 280, capacity: 500, utilization: 56, revenue: 1680, notes: '' },
  { id: 'at-15', event: '3SSB vs Jacksonville Academy — MBB', venue: 'Arena Complex', date: 'Jan 4, 2026', attendance: 4500, capacity: 5200, utilization: 87, revenue: 67500, notes: 'Season opener sellout push' },
];

// === Media Reports ===

const MEDIA_REPORTS: MediaReport[] = [
  { id: 'me-1', name: '3SSB Invitational Broadcast Reach', type: 'broadcast-reach', period: 'Feb 7-9, 2026', metric: 'Total Viewers', value: '128,400', change: 34 },
  { id: 'me-2', name: 'Conference MBB Social Engagement', type: 'social-engagement', period: 'Feb 2026', metric: 'Engagements', value: '45,200', change: 18 },
  { id: 'me-3', name: '2819 Church Press Coverage Index', type: 'press-coverage', period: 'Jan 2026', metric: 'Articles', value: '87', change: 12 },
  { id: 'me-4', name: 'Instagram Content Performance', type: 'content-performance', period: 'Feb 2026', metric: 'Reach', value: '312K', change: 22 },
  { id: 'me-5', name: 'Live Stream Viewership — MBB', type: 'broadcast-reach', period: 'Season-to-Date', metric: 'Avg Concurrent', value: '4,820', change: 15 },
  { id: 'me-6', name: 'X/Twitter Engagement Report', type: 'social-engagement', period: 'Feb 2026', metric: 'Impressions', value: '890K', change: -5 },
  { id: 'me-7', name: 'National Media Mentions', type: 'press-coverage', period: 'Feb 2026', metric: 'Mentions', value: '24', change: 42 },
  { id: 'me-8', name: 'YouTube Channel Performance', type: 'content-performance', period: 'Jan 2026', metric: 'Watch Hours', value: '8,450', change: 28 },
  { id: 'me-9', name: 'Conference Tournament Promo Reach', type: 'broadcast-reach', period: 'Feb 2026', metric: 'Ad Impressions', value: '1.2M', change: 0 },
  { id: 'me-10', name: 'TikTok Growth Report', type: 'social-engagement', period: 'Jan 2026', metric: 'Followers Gained', value: '3,200', change: 55 },
  { id: 'me-11', name: 'Local TV Coverage Summary', type: 'press-coverage', period: 'Jan 2026', metric: 'Segments', value: '14', change: 8 },
  { id: 'me-12', name: 'Podcast Listenership Metrics', type: 'content-performance', period: 'Feb 2026', metric: 'Downloads', value: '6,100', change: 19 },
  { id: 'me-13', name: 'Game Day Hashtag Performance', type: 'social-engagement', period: 'Feb 14, 2026', metric: 'Uses', value: '2,890', change: 31 },
  { id: 'me-14', name: 'Conference Newsletter Open Rate', type: 'content-performance', period: 'Feb 2026', metric: 'Open Rate', value: '34.2%', change: -2 },
  { id: 'me-15', name: 'Photo Gallery Engagement — 3SSB', type: 'content-performance', period: 'Feb 2026', metric: 'Views', value: '18,400', change: 45 },
];

// === Custom Reports ===

const CUSTOM_REPORTS: CustomReport[] = [
  { id: 'cu-1', name: 'Commissioner Dashboard — Weekly', creator: 'Alex Morgan', dataSources: ['Operations', 'Finance', 'Compliance'], filters: ['Conference games only'], lastRun: 'Feb 14, 2026', schedule: 'Every Monday', format: 'Dashboard' },
  { id: 'cu-2', name: 'Officiating Cost Analysis', creator: 'Sandra Lopez', dataSources: ['Finance', 'Assignments'], filters: ['Officials only', 'Last 90 days'], lastRun: 'Feb 12, 2026', schedule: 'Monthly', format: 'XLSX' },
  { id: 'cu-3', name: 'Multi-Sport Attendance Trends', creator: 'Tom Bradley', dataSources: ['Attendance', 'Events'], filters: ['Home events', 'Revenue > $1K'], lastRun: 'Feb 10, 2026', schedule: 'Bi-weekly', format: 'PDF' },
  { id: 'cu-4', name: 'Credential Expiration Watchlist', creator: 'Angela Torres', dataSources: ['Credentials', 'People'], filters: ['Expiring within 90 days'], lastRun: 'Feb 14, 2026', schedule: 'Weekly', format: 'CSV' },
  { id: 'cu-5', name: 'Sponsorship ROI Tracker', creator: 'Rachel Kim', dataSources: ['Finance', 'Media', 'Attendance'], filters: ['Active sponsors'], lastRun: 'Feb 8, 2026', schedule: 'Monthly', format: 'Dashboard' },
  { id: 'cu-6', name: 'Game Day Safety Scorecard', creator: 'Michael Brown', dataSources: ['Compliance', 'Incidents', 'Facilities'], filters: ['Last 30 days'], lastRun: 'Feb 13, 2026', schedule: 'Weekly', format: 'PDF' },
  { id: 'cu-7', name: 'Recruiting Pipeline Summary', creator: 'Alex Morgan', dataSources: ['Recruiting', 'Performance', 'Compliance'], filters: ['Active prospects', 'Eligible only'], lastRun: 'Feb 11, 2026', schedule: 'Bi-weekly', format: 'PDF' },
  { id: 'cu-8', name: 'Venue Maintenance Log', creator: 'James Wright', dataSources: ['Facilities', 'Work Orders'], filters: ['Open items'], lastRun: 'Feb 14, 2026', schedule: 'Daily', format: 'CSV' },
  { id: 'cu-9', name: 'Social Media Competitor Analysis', creator: 'Robert Garcia', dataSources: ['Media', 'External APIs'], filters: ['Peer conferences'], lastRun: 'Feb 7, 2026', schedule: 'Monthly', format: 'Dashboard' },
  { id: 'cu-10', name: 'Student-Athlete Academic Tracker', creator: 'Rachel Kim', dataSources: ['Compliance', 'Eligibility'], filters: ['Below 2.5 GPA threshold'], lastRun: 'Feb 6, 2026', schedule: 'Weekly', format: 'PDF' },
  { id: 'cu-11', name: 'Budget vs Actual — By Sport', creator: 'Sandra Lopez', dataSources: ['Finance', 'Programs'], filters: ['Active programs'], lastRun: 'Feb 9, 2026', schedule: 'Monthly', format: 'XLSX' },
  { id: 'cu-12', name: 'Event Weather Impact Report', creator: 'Natalie Reed', dataSources: ['Events', 'Weather API', 'Attendance'], filters: ['Outdoor events'], lastRun: 'Feb 4, 2026', schedule: 'As-needed', format: 'PDF' },
];

// === Scheduled Reports ===

const SCHEDULED_REPORTS: ScheduledReport[] = [
  { id: 'sc-1', name: 'Daily Operations Digest', frequency: 'daily', nextRun: 'Feb 18, 2026 — 6:00 AM', recipients: ['Alex Morgan', 'Tom Bradley', 'Rachel Kim'], format: 'PDF', enabled: true },
  { id: 'sc-2', name: 'Weekly Finance Summary', frequency: 'weekly', nextRun: 'Feb 23, 2026 — 8:00 AM', recipients: ['Sandra Lopez', 'Alex Morgan'], format: 'XLSX', enabled: true },
  { id: 'sc-3', name: 'Bi-Weekly Compliance Digest', frequency: 'bi-weekly', nextRun: 'Feb 28, 2026 — 9:00 AM', recipients: ['Michael Brown', 'Rachel Kim', 'David Chen'], format: 'PDF', enabled: true },
  { id: 'sc-4', name: 'Monthly Attendance Report', frequency: 'monthly', nextRun: 'Mar 1, 2026 — 7:00 AM', recipients: ['Tom Bradley', 'Alex Morgan', 'Sandra Lopez'], format: 'PDF', enabled: true },
  { id: 'sc-5', name: 'Quarterly Board Report Package', frequency: 'quarterly', nextRun: 'Apr 1, 2026 — 8:00 AM', recipients: ['Alex Morgan', 'Board of Directors'], format: 'PDF', enabled: true },
  { id: 'sc-6', name: 'Weekly Media Metrics', frequency: 'weekly', nextRun: 'Feb 23, 2026 — 10:00 AM', recipients: ['Robert Garcia', 'Linda Nguyen'], format: 'Dashboard', enabled: true },
  { id: 'sc-7', name: 'Daily Credential Alerts', frequency: 'daily', nextRun: 'Feb 18, 2026 — 7:00 AM', recipients: ['Angela Torres'], format: 'CSV', enabled: true },
  { id: 'sc-8', name: 'Weekly Official Assignments', frequency: 'weekly', nextRun: 'Feb 24, 2026 — 6:00 AM', recipients: ['David Chen', 'Officials Pool'], format: 'PDF', enabled: true },
  { id: 'sc-9', name: 'Monthly Sponsorship Dashboard', frequency: 'monthly', nextRun: 'Mar 1, 2026 — 9:00 AM', recipients: ['Rachel Kim', 'Sandra Lopez'], format: 'Dashboard', enabled: true },
  { id: 'sc-10', name: 'Bi-Weekly Volunteer Hours Log', frequency: 'bi-weekly', nextRun: 'Feb 28, 2026 — 8:00 AM', recipients: ['Brian Mitchell'], format: 'CSV', enabled: true },
  { id: 'sc-11', name: 'Weekly Standings Update', frequency: 'weekly', nextRun: 'Feb 23, 2026 — 11:00 AM', recipients: ['All Conference Members'], format: 'PDF', enabled: true },
  { id: 'sc-12', name: 'Monthly Facility Usage Summary', frequency: 'monthly', nextRun: 'Mar 1, 2026 — 10:00 AM', recipients: ['James Wright', 'Tom Bradley'], format: 'XLSX', enabled: false },
  { id: 'sc-13', name: 'Daily Game Day Prep Report', frequency: 'daily', nextRun: 'Feb 18, 2026 — 5:00 AM', recipients: ['Patricia Wilson', 'Tom Bradley'], format: 'PDF', enabled: false },
  { id: 'sc-14', name: 'Quarterly Financial Audit Pack', frequency: 'quarterly', nextRun: 'Apr 1, 2026 — 8:00 AM', recipients: ['Sandra Lopez', 'External Auditors'], format: 'PDF', enabled: true },
];

// === Settings ===

const SETTINGS_TOGGLES: ReportSettingToggle[] = [
  { id: 'rs-1', label: 'Auto-generate operational reports', description: 'Automatically generate post-event operational reports after each competition day', enabled: true },
  { id: 'rs-2', label: 'Include financial data in dashboards', description: 'Show revenue and expense data in operational dashboards visible to authorized users', enabled: true },
  { id: 'rs-3', label: 'Email delivery for scheduled reports', description: 'Send scheduled reports via email to designated recipients', enabled: true },
  { id: 'rs-4', label: 'Compliance report auto-flag', description: 'Automatically flag compliance reports with findings for immediate review', enabled: true },
  { id: 'rs-5', label: 'Public performance reports', description: 'Allow standings and statistics reports to be viewed by external audiences', enabled: false },
  { id: 'rs-6', label: 'Watermark draft reports', description: 'Add DRAFT watermark to all reports in draft status when exported', enabled: true },
  { id: 'rs-7', label: 'Archive reports after 1 year', description: 'Automatically archive reports older than 12 months to cold storage', enabled: false },
  { id: 'rs-8', label: 'Notify on report failure', description: 'Send push notification to report author when generation fails', enabled: true },
  { id: 'rs-9', label: 'Require approval for financial reports', description: 'Financial reports must be reviewed and approved before distribution', enabled: true },
  { id: 'rs-10', label: 'Track report downloads', description: 'Log all report download activity for audit purposes', enabled: true },
];
