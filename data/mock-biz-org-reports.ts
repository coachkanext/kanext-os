/**
 * Business Organization Reports Tab — V2 Mock Data & Types
 * 13-tab Reports Hub: Overview, Library, Dashboards, Finance, Rails, Operations,
 * Compliance & Legal, People, Assets, Media & Proof, Data Room, Pack Builder, Exports.
 *
 * Cross-tab report aggregation across all Biz Org domains with Data Room,
 * Pack Builder for board/investor/bank packets, and full export audit log.
 */

import {
  KANEXT_HOLDCO,
  KANEXT_OPSCO,
  KANEXT_IP,
  SEEDED_ENTITY_NAMES,
} from '@/data/biz-org-shared-types';

// =============================================================================
// TYPES
// =============================================================================

export type ReportCategory =
  | 'finance'
  | 'rails'
  | 'operations'
  | 'compliance_legal'
  | 'people'
  | 'assets'
  | 'media_proof';

export interface ReportItem {
  id: string;
  title: string;
  category: ReportCategory;
  type: string;
  status: 'generated' | 'generating' | 'scheduled' | 'draft' | 'failed';
  generatedDate: string | null;
  entityName: string;
  period: string;
  format: 'pdf' | 'xlsx' | 'csv' | 'dashboard';
  size: string | null;
}

export interface DashboardTile {
  id: string;
  title: string;
  linkedTab: string;
  linkedSubTab: string;
  description: string;
  icon: string;
}

export interface DataRoomDocument {
  id: string;
  name: string;
  section: string;
  version: string;
  lastUpdated: string;
  accessLevel: 'founder_only' | 'board' | 'retail' | 'public';
  format: string;
  size: string;
}

export interface PackSection {
  id: string;
  title: string;
  sourceTab: string;
  description: string;
  selected: boolean;
}

export interface PackTemplate {
  id: string;
  name: string;
  description: string;
  sections: PackSection[];
  lastBuilt: string | null;
}

export interface ExportLogEntry {
  id: string;
  reportTitle: string;
  exportedBy: string;
  timestamp: string;
  format: string;
  accessedBy: string[];
}

export type ReportTimeRange = '7d' | '30d' | 'qtd' | 'ytd' | 'custom';

export interface ReportChangeLogEntry {
  id: string;
  date: string;
  description: string;
  tab: string;
}

export interface ReportTopRisk {
  id: string;
  label: string;
  severity: 'high' | 'medium' | 'low';
  source: string;
}

export interface ReportAuditLogEntry {
  id: string;
  action: 'ran' | 'published' | 'accessed' | 'exported';
  actor: string;
  timestamp: string;
  reportId: string;
}

export interface ReportOverviewStats {
  totalReports: number;
  recentlyGenerated: number;
  scheduled: number;
  dataRoomDocs: number;
  packTemplates: number;
}

// =============================================================================
// SUB-TAB DEFINITIONS
// =============================================================================

export type BizReportsV2TabId =
  | 'overview'
  | 'library'
  | 'dashboards'
  | 'finance'
  | 'rails'
  | 'operations'
  | 'compliance_legal'
  | 'people'
  | 'assets'
  | 'media_proof'
  | 'data_room'
  | 'pack_builder'
  | 'exports';

export interface BizReportsV2Tab {
  id: BizReportsV2TabId;
  label: string;
}

export const BIZ_REPORTS_V2_TABS: BizReportsV2Tab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'library', label: 'Library' },
  { id: 'dashboards', label: 'Dashboards' },
  { id: 'finance', label: 'Finance' },
  { id: 'rails', label: 'Rails' },
  { id: 'operations', label: 'Operations' },
  { id: 'compliance_legal', label: 'Compliance & Legal' },
  { id: 'people', label: 'People' },
  { id: 'assets', label: 'Assets' },
  { id: 'media_proof', label: 'Media & Proof' },
  { id: 'data_room', label: 'Data Room' },
  { id: 'pack_builder', label: 'Pack Builder' },
  { id: 'exports', label: 'Exports' },
];

// =============================================================================
// COLOR MAPS
// =============================================================================

export const REPORT_STATUS_COLOR: Record<ReportItem['status'], string> = {
  generated: '#22C55E',
  generating: '#3B82F6',
  scheduled: '#6366F1',
  draft: '#F59E0B',
  failed: '#EF4444',
};

export const REPORT_CATEGORY_COLOR: Record<ReportCategory, string> = {
  finance: '#22C55E',
  rails: '#3B82F6',
  operations: '#F59E0B',
  compliance_legal: '#8B5CF6',
  people: '#EC4899',
  assets: '#14B8A6',
  media_proof: '#F97316',
};

export const REPORT_CATEGORY_LABEL: Record<ReportCategory, string> = {
  finance: 'Finance',
  rails: 'Payment Rails',
  operations: 'Operations',
  compliance_legal: 'Compliance & Legal',
  people: 'People',
  assets: 'Assets',
  media_proof: 'Media & Proof',
};

export const REPORT_FORMAT_COLOR: Record<ReportItem['format'], string> = {
  pdf: '#EF4444',
  xlsx: '#22C55E',
  csv: '#3B82F6',
  dashboard: '#8B5CF6',
};

export const ACCESS_LEVEL_COLOR: Record<DataRoomDocument['accessLevel'], string> = {
  founder_only: '#EF4444',
  board: '#8B5CF6',
  retail: '#3B82F6',
  public: '#22C55E',
};

export const ACCESS_LEVEL_LABEL: Record<DataRoomDocument['accessLevel'], string> = {
  founder_only: 'Founder Only',
  board: 'Board',
  retail: 'Retail',
  public: 'Public',
};

// =============================================================================
// REPORT TEMPLATE TYPES (for category sub-tabs)
// =============================================================================

export interface ReportTemplate {
  id: string;
  title: string;
  category: ReportCategory;
  type: string;
  description: string;
  icon: string;
  defaultFormat: ReportItem['format'];
  estimatedTime: string;
}

// =============================================================================
// SEEDED DATA — OVERVIEW STATS
// =============================================================================

const OVERVIEW_STATS: ReportOverviewStats = {
  totalReports: 24,
  recentlyGenerated: 5,
  scheduled: 3,
  dataRoomDocs: 12,
  packTemplates: 3,
};

// =============================================================================
// SEEDED DATA — REPORTS
// =============================================================================

const REPORTS: ReportItem[] = [
  // Finance (5)
  {
    id: 'rpt-f-01',
    title: 'Q4 2024 Profit & Loss Statement',
    category: 'finance',
    type: 'P&L',
    status: 'generated',
    generatedDate: '2025-01-15',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    period: 'Q4 2024',
    format: 'pdf',
    size: '2.4 MB',
  },
  {
    id: 'rpt-f-02',
    title: 'Annual Balance Sheet — FY2024',
    category: 'finance',
    type: 'Balance Sheet',
    status: 'generated',
    generatedDate: '2025-01-20',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    period: 'FY 2024',
    format: 'pdf',
    size: '3.1 MB',
  },
  {
    id: 'rpt-f-03',
    title: 'January Cash Flow Analysis',
    category: 'finance',
    type: 'Cash Flow',
    status: 'generated',
    generatedDate: '2025-02-05',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    period: 'Jan 2025',
    format: 'xlsx',
    size: '1.8 MB',
  },
  {
    id: 'rpt-f-04',
    title: 'Revenue Breakdown by Product Line',
    category: 'finance',
    type: 'Revenue Breakdown',
    status: 'generated',
    generatedDate: '2025-01-18',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    period: 'Q4 2024',
    format: 'dashboard',
    size: null,
  },
  {
    id: 'rpt-f-05',
    title: 'Q1 2025 Budget Variance Report',
    category: 'finance',
    type: 'Budget Variance',
    status: 'draft',
    generatedDate: null,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    period: 'Q1 2025',
    format: 'xlsx',
    size: null,
  },
  // Rails (3)
  {
    id: 'rpt-r-01',
    title: 'Payment Rails Monthly Reconciliation',
    category: 'rails',
    type: 'Reconciliation',
    status: 'generated',
    generatedDate: '2025-02-03',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    period: 'Jan 2025',
    format: 'csv',
    size: '890 KB',
  },
  {
    id: 'rpt-r-02',
    title: 'ACH / Wire Transfer Volume Report',
    category: 'rails',
    type: 'Volume Report',
    status: 'scheduled',
    generatedDate: null,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    period: 'Feb 2025',
    format: 'pdf',
    size: null,
  },
  {
    id: 'rpt-r-03',
    title: 'Ledger Balance Snapshot — All Entities',
    category: 'rails',
    type: 'Balance Snapshot',
    status: 'generated',
    generatedDate: '2025-02-10',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    period: 'Feb 2025',
    format: 'xlsx',
    size: '1.2 MB',
  },
  // Operations (3)
  {
    id: 'rpt-o-01',
    title: 'OKR Tracker — Q1 2025 Progress',
    category: 'operations',
    type: 'OKR Tracker',
    status: 'generating',
    generatedDate: null,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    period: 'Q1 2025',
    format: 'dashboard',
    size: null,
  },
  {
    id: 'rpt-o-02',
    title: 'Vendor Performance Summary',
    category: 'operations',
    type: 'Vendor Review',
    status: 'generated',
    generatedDate: '2025-01-28',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    period: 'Q4 2024',
    format: 'pdf',
    size: '1.6 MB',
  },
  {
    id: 'rpt-o-03',
    title: 'System Uptime & Incident Report',
    category: 'operations',
    type: 'Uptime Report',
    status: 'generated',
    generatedDate: '2025-02-01',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    period: 'Jan 2025',
    format: 'pdf',
    size: '980 KB',
  },
  // Compliance & Legal (3)
  {
    id: 'rpt-cl-01',
    title: 'SOC 2 Type II Audit Summary',
    category: 'compliance_legal',
    type: 'Audit Summary',
    status: 'generated',
    generatedDate: '2025-01-22',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    period: 'FY 2024',
    format: 'pdf',
    size: '4.2 MB',
  },
  {
    id: 'rpt-cl-02',
    title: 'GDPR Data Processing Assessment',
    category: 'compliance_legal',
    type: 'GDPR Assessment',
    status: 'draft',
    generatedDate: null,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    period: 'Q1 2025',
    format: 'pdf',
    size: null,
  },
  {
    id: 'rpt-cl-03',
    title: 'Entity Governance & Resolutions Log',
    category: 'compliance_legal',
    type: 'Governance Log',
    status: 'generated',
    generatedDate: '2025-02-08',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    period: 'FY 2024',
    format: 'pdf',
    size: '2.7 MB',
  },
  // People (2)
  {
    id: 'rpt-p-01',
    title: 'Team Headcount & Org Chart Report',
    category: 'people',
    type: 'Headcount',
    status: 'generated',
    generatedDate: '2025-02-03',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    period: 'Feb 2025',
    format: 'pdf',
    size: '1.4 MB',
  },
  {
    id: 'rpt-p-02',
    title: 'Compensation Benchmarking Analysis',
    category: 'people',
    type: 'Compensation',
    status: 'scheduled',
    generatedDate: null,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    period: 'Q1 2025',
    format: 'xlsx',
    size: null,
  },
  // Assets (2)
  {
    id: 'rpt-a-01',
    title: 'IP Portfolio Valuation Report',
    category: 'assets',
    type: 'Valuation',
    status: 'generated',
    generatedDate: '2025-01-25',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    period: 'FY 2024',
    format: 'pdf',
    size: '3.5 MB',
  },
  {
    id: 'rpt-a-02',
    title: 'Equipment & Lease Inventory',
    category: 'assets',
    type: 'Inventory',
    status: 'draft',
    generatedDate: null,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    period: 'Feb 2025',
    format: 'xlsx',
    size: null,
  },
  // Media & Proof (2)
  {
    id: 'rpt-m-01',
    title: 'Brand & Media Asset Audit',
    category: 'media_proof',
    type: 'Media Audit',
    status: 'failed',
    generatedDate: null,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    period: 'Q4 2024',
    format: 'pdf',
    size: null,
  },
  {
    id: 'rpt-m-02',
    title: 'Proof of Concept Documentation Pack',
    category: 'media_proof',
    type: 'PoC Pack',
    status: 'scheduled',
    generatedDate: null,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    period: 'Q1 2025',
    format: 'pdf',
    size: null,
  },
];

// =============================================================================
// SEEDED DATA — DASHBOARD TILES
// =============================================================================

const DASHBOARD_TILES: DashboardTile[] = [
  {
    id: 'dtile-01',
    title: 'Finance Overview',
    linkedTab: 'finance',
    linkedSubTab: 'dashboard',
    description: 'P&L, runway, cash position, and revenue metrics at a glance',
    icon: 'dollarsign.circle.fill',
  },
  {
    id: 'dtile-02',
    title: 'Payment Rails NOW',
    linkedTab: 'payment-rails',
    linkedSubTab: 'now',
    description: 'Real-time transaction pipeline, pending releases, and ledger balances',
    icon: 'arrow.left.arrow.right.circle.fill',
  },
  {
    id: 'dtile-03',
    title: 'Operations Triage',
    linkedTab: 'operations',
    linkedSubTab: 'triage',
    description: 'Active blockers, at-risk OKRs, and escalated tasks requiring attention',
    icon: 'exclamationmark.triangle.fill',
  },
  {
    id: 'dtile-04',
    title: 'Compliance Score',
    linkedTab: 'compliance',
    linkedSubTab: 'overview',
    description: 'Aggregate compliance posture across SOC 2, GDPR, and internal policies',
    icon: 'checkmark.shield.fill',
  },
  {
    id: 'dtile-05',
    title: 'People Pulse',
    linkedTab: 'people',
    linkedSubTab: 'overview',
    description: 'Headcount trends, open roles, attrition rate, and engagement scores',
    icon: 'person.3.fill',
  },
  {
    id: 'dtile-06',
    title: 'Asset Portfolio',
    linkedTab: 'assets',
    linkedSubTab: 'overview',
    description: 'IP valuation, equipment inventory, and depreciation schedules',
    icon: 'building.2.fill',
  },
  {
    id: 'dtile-07',
    title: 'Entity Health Matrix',
    linkedTab: 'entities',
    linkedSubTab: 'overview',
    description: 'Traffic-light health across governance, finance, rails, and compliance per entity',
    icon: 'square.grid.3x3.fill',
  },
  {
    id: 'dtile-08',
    title: 'Legal & Governance',
    linkedTab: 'legal',
    linkedSubTab: 'overview',
    description: 'Active contracts, pending resolutions, and regulatory filings status',
    icon: 'doc.text.fill',
  },
];

// =============================================================================
// SEEDED DATA — DATA ROOM DOCUMENTS
// =============================================================================

const DATA_ROOM: DataRoomDocument[] = [
  {
    id: 'dr-01',
    name: 'KaNeXT Investor Pitch Deck — Feb 2025',
    section: 'Fundraising',
    version: 'v3.2',
    lastUpdated: '2025-02-12',
    accessLevel: 'board',
    format: 'PDF',
    size: '8.4 MB',
  },
  {
    id: 'dr-02',
    name: 'Audited Financial Statements — FY2024',
    section: 'Financials',
    version: 'v1.0',
    lastUpdated: '2025-01-20',
    accessLevel: 'board',
    format: 'PDF',
    size: '12.1 MB',
  },
  {
    id: 'dr-03',
    name: 'Cap Table — Fully Diluted',
    section: 'Fundraising',
    version: 'v5.1',
    lastUpdated: '2025-02-01',
    accessLevel: 'founder_only',
    format: 'XLSX',
    size: '420 KB',
  },
  {
    id: 'dr-04',
    name: 'Board Resolutions — 2024 Archive',
    section: 'Governance',
    version: 'v1.0',
    lastUpdated: '2025-01-05',
    accessLevel: 'board',
    format: 'PDF',
    size: '3.8 MB',
  },
  {
    id: 'dr-05',
    name: 'Executive Team Bios & Headshots',
    section: 'Team',
    version: 'v2.0',
    lastUpdated: '2025-01-28',
    accessLevel: 'public',
    format: 'PDF',
    size: '6.2 MB',
  },
  {
    id: 'dr-06',
    name: 'Product Overview & Roadmap',
    section: 'Product',
    version: 'v4.0',
    lastUpdated: '2025-02-10',
    accessLevel: 'board',
    format: 'PDF',
    size: '5.7 MB',
  },
  {
    id: 'dr-07',
    name: 'SOC 2 Type II Certificate',
    section: 'Compliance',
    version: 'v1.0',
    lastUpdated: '2025-01-22',
    accessLevel: 'retail',
    format: 'PDF',
    size: '1.9 MB',
  },
  {
    id: 'dr-08',
    name: 'Legal Entity Structure Diagram',
    section: 'Governance',
    version: 'v3.0',
    lastUpdated: '2025-02-05',
    accessLevel: 'board',
    format: 'PDF',
    size: '2.1 MB',
  },
  {
    id: 'dr-09',
    name: 'Articles of Incorporation — KaNeXT HoldCo',
    section: 'Governance',
    version: 'v1.0',
    lastUpdated: '2023-06-15',
    accessLevel: 'founder_only',
    format: 'PDF',
    size: '890 KB',
  },
  {
    id: 'dr-10',
    name: 'Employee Stock Option Plan (ESOP)',
    section: 'Team',
    version: 'v2.1',
    lastUpdated: '2025-01-15',
    accessLevel: 'founder_only',
    format: 'PDF',
    size: '1.4 MB',
  },
  {
    id: 'dr-11',
    name: 'Insurance Certificates — D&O, E&O, GL',
    section: 'Compliance',
    version: 'v1.0',
    lastUpdated: '2025-01-10',
    accessLevel: 'board',
    format: 'PDF',
    size: '3.2 MB',
  },
  {
    id: 'dr-12',
    name: 'Market Analysis & TAM/SAM/SOM',
    section: 'Product',
    version: 'v2.0',
    lastUpdated: '2025-02-08',
    accessLevel: 'retail',
    format: 'PDF',
    size: '4.5 MB',
  },
];

// =============================================================================
// SEEDED DATA — PACK TEMPLATES
// =============================================================================

const PACK_TEMPLATES: PackTemplate[] = [
  {
    id: 'pack-01',
    name: 'Board Pack',
    description: 'Quarterly board meeting materials with financial summary, product update, and strategic review',
    lastBuilt: '2025-01-08',
    sections: [
      { id: 'bp-s01', title: 'CEO Letter', sourceTab: 'reports', description: 'Executive summary and strategic commentary', selected: true },
      { id: 'bp-s02', title: 'Financial Summary', sourceTab: 'finance', description: 'P&L, balance sheet, cash flow highlights', selected: true },
      { id: 'bp-s03', title: 'Revenue & Growth Metrics', sourceTab: 'finance', description: 'MRR, ARR, NRR, churn, and expansion revenue', selected: true },
      { id: 'bp-s04', title: 'Product & Engineering Update', sourceTab: 'operations', description: 'Roadmap progress, shipped features, and velocity', selected: true },
      { id: 'bp-s05', title: 'Go-to-Market Update', sourceTab: 'operations', description: 'Sales pipeline, marketing metrics, and wins', selected: true },
      { id: 'bp-s06', title: 'People & Talent', sourceTab: 'people', description: 'Headcount, hiring, attrition, and engagement', selected: true },
      { id: 'bp-s07', title: 'Compliance & Risk', sourceTab: 'compliance', description: 'Regulatory posture, open findings, audit status', selected: true },
      { id: 'bp-s08', title: 'Appendix — Data Tables', sourceTab: 'reports', description: 'Detailed supporting data and charts', selected: false },
    ],
  },
  {
    id: 'pack-02',
    name: 'Investor Update',
    description: 'Monthly investor communication with key metrics, milestones, and asks',
    lastBuilt: '2025-02-06',
    sections: [
      { id: 'iu-s01', title: 'Key Metrics Dashboard', sourceTab: 'finance', description: 'MRR, burn rate, runway, and growth rate', selected: true },
      { id: 'iu-s02', title: 'Revenue Highlights', sourceTab: 'finance', description: 'Revenue breakdown, notable customer wins', selected: true },
      { id: 'iu-s03', title: 'Product Milestones', sourceTab: 'operations', description: 'Shipped features, launch updates', selected: true },
      { id: 'iu-s04', title: 'Team Update', sourceTab: 'people', description: 'Key hires, headcount changes', selected: true },
      { id: 'iu-s05', title: 'Asks & Opportunities', sourceTab: 'reports', description: 'Investor intros, partnership leads, hiring help', selected: true },
      { id: 'iu-s06', title: 'Market & Competitive Intel', sourceTab: 'operations', description: 'Competitive landscape and market shifts', selected: false },
    ],
  },
  {
    id: 'pack-03',
    name: 'Bank Packet',
    description: 'Lending compliance packet with financial statements, entity docs, and risk disclosures',
    lastBuilt: null,
    sections: [
      { id: 'bk-s01', title: 'Audited Financial Statements', sourceTab: 'finance', description: 'Most recent audited P&L, balance sheet, cash flow', selected: true },
      { id: 'bk-s02', title: 'Cap Table & Ownership', sourceTab: 'legal', description: 'Fully diluted ownership and investor breakdown', selected: true },
      { id: 'bk-s03', title: 'Entity Structure & Governance', sourceTab: 'entities', description: 'Legal entity diagram, board composition, resolutions', selected: true },
      { id: 'bk-s04', title: 'Revenue & Pipeline Forecast', sourceTab: 'finance', description: '12-month revenue forecast and customer pipeline', selected: true },
      { id: 'bk-s05', title: 'Compliance Certificates', sourceTab: 'compliance', description: 'SOC 2, insurance certs, regulatory filings', selected: true },
      { id: 'bk-s06', title: 'Bank Statements (3 months)', sourceTab: 'payment-rails', description: 'Operating account statements for last 3 months', selected: true },
      { id: 'bk-s07', title: 'Risk Disclosures', sourceTab: 'legal', description: 'Material risks, litigation, contingent liabilities', selected: true },
    ],
  },
];

// =============================================================================
// SEEDED DATA — EXPORT LOG
// =============================================================================

const EXPORT_LOG: ExportLogEntry[] = [
  {
    id: 'exp-01',
    reportTitle: 'Q4 2024 Profit & Loss Statement',
    exportedBy: 'Alex Morgan',
    timestamp: '2025-02-14 09:22 AM',
    format: 'PDF',
    accessedBy: ['CFO — Morgan Blake', 'Board of Directors'],
  },
  {
    id: 'exp-02',
    reportTitle: 'Board Pack — Q4 2024',
    exportedBy: 'Alex Morgan',
    timestamp: '2025-02-12 03:45 PM',
    format: 'PDF',
    accessedBy: ['Board of Directors (7)', 'Legal Counsel'],
  },
  {
    id: 'exp-03',
    reportTitle: 'Investor Update — January',
    exportedBy: 'CFO — Morgan Blake',
    timestamp: '2025-02-06 11:00 AM',
    format: 'PDF',
    accessedBy: ['All Investors (47)'],
  },
  {
    id: 'exp-04',
    reportTitle: 'SOC 2 Type II Audit Summary',
    exportedBy: 'CISO — Ryan Park',
    timestamp: '2025-01-22 02:15 PM',
    format: 'PDF',
    accessedBy: ['Compliance Team', 'External Auditors'],
  },
  {
    id: 'exp-05',
    reportTitle: 'Payment Rails Monthly Reconciliation',
    exportedBy: 'VP Finance — Aisha Patel',
    timestamp: '2025-02-03 10:30 AM',
    format: 'CSV',
    accessedBy: ['CFO — Morgan Blake'],
  },
  {
    id: 'exp-06',
    reportTitle: 'Team Headcount & Org Chart Report',
    exportedBy: 'VP People — Dana Torres',
    timestamp: '2025-02-03 08:45 AM',
    format: 'PDF',
    accessedBy: ['Alex Morgan', 'Hiring Managers'],
  },
  {
    id: 'exp-07',
    reportTitle: 'IP Portfolio Valuation Report',
    exportedBy: 'General Counsel — Taylor Brooks',
    timestamp: '2025-01-25 04:20 PM',
    format: 'PDF',
    accessedBy: ['Alex Morgan', 'CFO — Morgan Blake'],
  },
  {
    id: 'exp-08',
    reportTitle: 'Annual Balance Sheet — FY2024',
    exportedBy: 'CFO — Morgan Blake',
    timestamp: '2025-01-20 01:10 PM',
    format: 'PDF',
    accessedBy: ['External Auditors', 'Bank — Lending Team'],
  },
];

// =============================================================================
// SEEDED DATA — REPORT TEMPLATES (per category)
// =============================================================================

export const REPORT_TEMPLATES: ReportTemplate[] = [
  // Finance templates
  { id: 'tmpl-f01', title: 'Profit & Loss Statement', category: 'finance', type: 'P&L', description: 'Full P&L with revenue, COGS, operating expenses, and net income', icon: 'dollarsign.circle', defaultFormat: 'pdf', estimatedTime: '2 min' },
  { id: 'tmpl-f02', title: 'Balance Sheet', category: 'finance', type: 'Balance Sheet', description: 'Assets, liabilities, and equity snapshot at period end', icon: 'chart.bar.fill', defaultFormat: 'pdf', estimatedTime: '2 min' },
  { id: 'tmpl-f03', title: 'Cash Flow Statement', category: 'finance', type: 'Cash Flow', description: 'Operating, investing, and financing cash flows', icon: 'arrow.up.arrow.down.circle', defaultFormat: 'xlsx', estimatedTime: '3 min' },
  { id: 'tmpl-f04', title: 'Budget Variance', category: 'finance', type: 'Budget Variance', description: 'Actual vs budget comparison by department', icon: 'chart.line.uptrend.xyaxis', defaultFormat: 'xlsx', estimatedTime: '3 min' },
  { id: 'tmpl-f05', title: 'Runway Analysis', category: 'finance', type: 'Runway', description: 'Cash burn rate, months remaining, and scenario modeling', icon: 'flame', defaultFormat: 'pdf', estimatedTime: '4 min' },

  // Rails templates
  { id: 'tmpl-r01', title: 'Reconciliation Report', category: 'rails', type: 'Reconciliation', description: 'Transaction-level reconciliation across all payment rails', icon: 'arrow.triangle.2.circlepath', defaultFormat: 'csv', estimatedTime: '5 min' },
  { id: 'tmpl-r02', title: 'Transfer Volume Summary', category: 'rails', type: 'Volume Report', description: 'ACH, wire, and card transaction volumes and fees', icon: 'chart.bar', defaultFormat: 'pdf', estimatedTime: '2 min' },
  { id: 'tmpl-r03', title: 'Ledger Balance Snapshot', category: 'rails', type: 'Balance Snapshot', description: 'Point-in-time balances across all entity ledgers', icon: 'banknote', defaultFormat: 'xlsx', estimatedTime: '1 min' },

  // Operations templates
  { id: 'tmpl-o01', title: 'OKR Progress Tracker', category: 'operations', type: 'OKR Tracker', description: 'Objective and key result completion rates by team', icon: 'target', defaultFormat: 'dashboard', estimatedTime: '2 min' },
  { id: 'tmpl-o02', title: 'Vendor Performance Review', category: 'operations', type: 'Vendor Review', description: 'SLA adherence, cost, and satisfaction scores per vendor', icon: 'person.2.circle', defaultFormat: 'pdf', estimatedTime: '3 min' },
  { id: 'tmpl-o03', title: 'System Uptime Report', category: 'operations', type: 'Uptime Report', description: 'Platform availability, incidents, MTTR, and latency', icon: 'server.rack', defaultFormat: 'pdf', estimatedTime: '2 min' },

  // Compliance & Legal templates
  { id: 'tmpl-cl01', title: 'Compliance Posture Summary', category: 'compliance_legal', type: 'Posture Summary', description: 'Aggregate compliance status across all frameworks', icon: 'checkmark.shield', defaultFormat: 'pdf', estimatedTime: '3 min' },
  { id: 'tmpl-cl02', title: 'Regulatory Filing Tracker', category: 'compliance_legal', type: 'Filing Tracker', description: 'Upcoming and completed filings with deadlines', icon: 'calendar.badge.clock', defaultFormat: 'xlsx', estimatedTime: '2 min' },
  { id: 'tmpl-cl03', title: 'Governance & Resolutions Log', category: 'compliance_legal', type: 'Governance Log', description: 'Board resolutions, consent actions, and entity governance', icon: 'doc.text', defaultFormat: 'pdf', estimatedTime: '2 min' },

  // People templates
  { id: 'tmpl-p01', title: 'Headcount & Org Chart', category: 'people', type: 'Headcount', description: 'Current headcount by department with org chart visual', icon: 'person.3', defaultFormat: 'pdf', estimatedTime: '2 min' },
  { id: 'tmpl-p02', title: 'Compensation Benchmark', category: 'people', type: 'Compensation', description: 'Role-level comp analysis vs market benchmarks', icon: 'chart.bar.xaxis.ascending', defaultFormat: 'xlsx', estimatedTime: '4 min' },
  { id: 'tmpl-p03', title: 'Engagement & Attrition', category: 'people', type: 'Engagement', description: 'Employee engagement scores and voluntary turnover trends', icon: 'heart.text.square', defaultFormat: 'pdf', estimatedTime: '3 min' },

  // Assets templates
  { id: 'tmpl-a01', title: 'IP Valuation Report', category: 'assets', type: 'Valuation', description: 'Intellectual property portfolio assessment and fair market value', icon: 'lightbulb', defaultFormat: 'pdf', estimatedTime: '5 min' },
  { id: 'tmpl-a02', title: 'Equipment & Lease Inventory', category: 'assets', type: 'Inventory', description: 'Physical assets, leases, depreciation schedules', icon: 'desktopcomputer', defaultFormat: 'xlsx', estimatedTime: '3 min' },

  // Media & Proof templates
  { id: 'tmpl-m01', title: 'Brand & Media Asset Audit', category: 'media_proof', type: 'Media Audit', description: 'Inventory of brand assets, usage rights, and compliance', icon: 'photo.on.rectangle', defaultFormat: 'pdf', estimatedTime: '4 min' },
  { id: 'tmpl-m02', title: 'Proof of Concept Pack', category: 'media_proof', type: 'PoC Pack', description: 'Customer testimonials, case studies, and demo documentation', icon: 'checkmark.seal', defaultFormat: 'pdf', estimatedTime: '3 min' },
];

// =============================================================================
// DATA ROOM SECTION GROUPS
// =============================================================================

export const DATA_ROOM_SECTIONS = [
  'Fundraising',
  'Financials',
  'Governance',
  'Team',
  'Product',
  'Compliance',
] as const;

// =============================================================================
// SEEDED DATA — TIME RANGE DEFAULT
// =============================================================================

const defaultTimeRange: ReportTimeRange = '30d';

// =============================================================================
// SEEDED DATA — CHANGE LOG
// =============================================================================

const CHANGE_LOG: ReportChangeLogEntry[] = [
  {
    id: 'cl-01',
    date: '2026-02-17',
    description: 'Payment Rails reconciliation report regenerated with corrected ACH totals',
    tab: 'rails',
  },
  {
    id: 'cl-02',
    date: '2026-02-16',
    description: 'Board Pack template updated — added ESG section placeholder',
    tab: 'pack_builder',
  },
  {
    id: 'cl-03',
    date: '2026-02-15',
    description: 'SOC 2 certificate uploaded to Data Room (v1.1 replacing v1.0)',
    tab: 'data_room',
  },
  {
    id: 'cl-04',
    date: '2026-02-14',
    description: 'Q4 P&L exported by CFO and shared with external auditors',
    tab: 'finance',
  },
  {
    id: 'cl-05',
    date: '2026-02-13',
    description: 'New report template added: Runway Analysis under Finance',
    tab: 'library',
  },
  {
    id: 'cl-06',
    date: '2026-02-12',
    description: 'Investor Update pack built and distributed to 47 investors',
    tab: 'pack_builder',
  },
];

// =============================================================================
// SEEDED DATA — TOP RISKS
// =============================================================================

const TOP_RISKS: ReportTopRisk[] = [
  {
    id: 'tr-01',
    label: 'Cash runway below 12-month threshold',
    severity: 'high',
    source: 'Finance — Runway Analysis',
  },
  {
    id: 'tr-02',
    label: 'SOC 2 remediation items still open (2 of 3)',
    severity: 'medium',
    source: 'Compliance & Legal — Audit Summary',
  },
  {
    id: 'tr-03',
    label: 'Vendor contract expiry: Figma renewal pending',
    severity: 'low',
    source: 'Operations — Vendor Review',
  },
  {
    id: 'tr-04',
    label: 'Sliema FC regulatory filing deadline approaching',
    severity: 'high',
    source: 'Compliance & Legal — Filing Tracker',
  },
];

// =============================================================================
// SEEDED DATA — AUDIT LOG
// =============================================================================

const AUDIT_LOG: ReportAuditLogEntry[] = [
  {
    id: 'al-01',
    action: 'ran',
    actor: 'Alex Morgan',
    timestamp: '2026-02-17T14:30:00Z',
    reportId: 'rpt-f-01',
  },
  {
    id: 'al-02',
    action: 'exported',
    actor: 'CFO — Morgan Blake',
    timestamp: '2026-02-16T11:15:00Z',
    reportId: 'rpt-f-02',
  },
  {
    id: 'al-03',
    action: 'published',
    actor: 'Alex Morgan',
    timestamp: '2026-02-15T09:00:00Z',
    reportId: 'rpt-cl-01',
  },
  {
    id: 'al-04',
    action: 'accessed',
    actor: 'VP Finance — Aisha Patel',
    timestamp: '2026-02-14T16:45:00Z',
    reportId: 'rpt-r-01',
  },
  {
    id: 'al-05',
    action: 'exported',
    actor: 'General Counsel — Taylor Brooks',
    timestamp: '2026-02-13T10:20:00Z',
    reportId: 'rpt-a-01',
  },
];

// =============================================================================
// PUBLIC DATA ACCESSOR
// =============================================================================

export function getBizReportsData() {
  return {
    overviewStats: OVERVIEW_STATS,
    reports: REPORTS,
    dashboardTiles: DASHBOARD_TILES,
    dataRoom: DATA_ROOM,
    packTemplates: PACK_TEMPLATES,
    exportLog: EXPORT_LOG,
    reportTemplates: REPORT_TEMPLATES,
    timeRange: defaultTimeRange,
    changeLog: CHANGE_LOG,
    topRisks: TOP_RISKS,
    auditLog: AUDIT_LOG,
  };
}
