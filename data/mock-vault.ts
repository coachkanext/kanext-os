/**
 * Mock Vault Data — Institutional Document System
 *
 * 10 enterprise-agnostic categories, 4 statuses, 4 access levels.
 * Version history is immutable. No deletions.
 */

// =============================================================================
// TYPES
// =============================================================================

export const VAULT_CATEGORIES = [
  'Governing Documents',
  'Capital & Equity',
  'Contracts',
  'Compliance Filings',
  'Facilities & Leases',
  'Insurance',
  'Board & Resolutions',
  'Strategic',
  'Operations',
  'Other',
] as const;

export type VaultDocCategory = (typeof VAULT_CATEGORIES)[number];

export type VaultDocStatus = 'Draft' | 'Active' | 'Archived' | 'Superseded';

export type VaultAccessLevel = 'Founder' | 'Executive' | 'Department' | 'Read-Only';

export type VaultFileType = 'pdf' | 'doc' | 'image' | 'text';

export interface VaultDocVersion {
  version: string;
  createdBy: string;
  date: string;
  changeSummary: string;
}

export interface VaultLinkedObject {
  type: 'Deal' | 'Obligation' | 'Compliance Filing' | 'Program' | 'Entity';
  id: string;
  label: string;
}

export interface VaultDoc {
  id: string;
  title: string;
  category: VaultDocCategory;
  status: VaultDocStatus;
  currentVersion: string;
  lastModified: string;
  createdDate: string;
  fileType: VaultFileType;
  accessLevel: VaultAccessLevel;
  locked?: boolean;
  lastApprovedBy?: string;
  lastApprovedDate?: string;
  versions: VaultDocVersion[];
  linkedObjects: VaultLinkedObject[];
}

// =============================================================================
// ACTIVITY TYPES
// =============================================================================

export type VaultActivityType =
  | 'created'
  | 'version_uploaded'
  | 'archived'
  | 'access_changed'
  | 'locked'
  | 'unlocked';

export interface VaultActivityEvent {
  id: string;
  documentId: string;
  documentTitle: string;
  type: VaultActivityType;
  actor: string;
  date: string;
  detail?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const STATUS_COLORS: Record<VaultDocStatus, string> = {
  Draft: '#F59E0B',
  Active: '#22C55E',
  Archived: '#A1A1AA',
  Superseded: '#78716C',
};

export const ACCESS_LEVEL_ORDER: VaultAccessLevel[] = [
  'Founder',
  'Executive',
  'Department',
  'Read-Only',
];

export const FILE_TYPE_LABELS: Record<VaultFileType, string> = {
  pdf: 'PDF',
  doc: 'DOC',
  image: 'IMG',
  text: 'TXT',
};

// =============================================================================
// MOCK DOCUMENTS (18 total across all 10 categories)
// =============================================================================

export const VAULT_DOCS: VaultDoc[] = [
  // ── Governing Documents ──
  {
    id: 'vd-01',
    title: 'Certificate of Incorporation',
    category: 'Governing Documents',
    status: 'Active',
    currentVersion: '1.0',
    lastModified: '2026-01-15',
    createdDate: '2026-01-15',
    fileType: 'pdf',
    accessLevel: 'Founder',
    lastApprovedBy: 'Alex Chen',
    lastApprovedDate: '2026-01-15',
    versions: [
      { version: '1.0', createdBy: 'Alex Chen', date: '2026-01-15', changeSummary: 'Initial filing — Delaware C-Corp' },
    ],
    linkedObjects: [
      { type: 'Entity', id: 'ENT-001', label: 'KaNeXT Inc.' },
    ],
  },
  {
    id: 'vd-02',
    title: 'Corporate Bylaws',
    category: 'Governing Documents',
    status: 'Active',
    currentVersion: '1.1',
    lastModified: '2026-02-03',
    createdDate: '2026-01-15',
    fileType: 'doc',
    accessLevel: 'Executive',
    lastApprovedBy: 'Alex Chen',
    lastApprovedDate: '2026-02-03',
    versions: [
      { version: '1.0', createdBy: 'Alex Chen', date: '2026-01-15', changeSummary: 'Initial corporate bylaws adopted' },
      { version: '1.1', createdBy: 'Marcus Rivera', date: '2026-02-03', changeSummary: 'Updated indemnification clause per counsel review' },
    ],
    linkedObjects: [],
  },
  // ── Capital & Equity ──
  {
    id: 'vd-03',
    title: 'SAFE Agreement — Apex Capital',
    category: 'Capital & Equity',
    status: 'Active',
    currentVersion: '1.0',
    lastModified: '2026-02-01',
    createdDate: '2026-02-01',
    fileType: 'pdf',
    accessLevel: 'Founder',
    locked: true,
    lastApprovedBy: 'Alex Chen',
    lastApprovedDate: '2026-02-01',
    versions: [
      { version: '1.0', createdBy: 'Alex Chen', date: '2026-02-01', changeSummary: 'Executed SAFE — $150K post-money, $8M cap' },
    ],
    linkedObjects: [
      { type: 'Deal', id: 'DL-001', label: 'Apex Capital — Seed SAFE' },
    ],
  },
  {
    id: 'vd-04',
    title: 'Cap Table — Current',
    category: 'Capital & Equity',
    status: 'Active',
    currentVersion: '2.0',
    lastModified: '2026-02-12',
    createdDate: '2026-01-15',
    fileType: 'pdf',
    accessLevel: 'Founder',
    lastApprovedBy: 'Alex Chen',
    lastApprovedDate: '2026-02-12',
    versions: [
      { version: '1.0', createdBy: 'Alex Chen', date: '2026-01-15', changeSummary: 'Initial cap table — 100% founder' },
      { version: '2.0', createdBy: 'Alex Chen', date: '2026-02-12', changeSummary: 'Updated to reflect SAFE + option pool allocation' },
    ],
    linkedObjects: [
      { type: 'Entity', id: 'ENT-001', label: 'KaNeXT Inc.' },
    ],
  },
  // ── Contracts ──
  {
    id: 'vd-05',
    title: 'Advisor Agreement — Jordan Wells',
    category: 'Contracts',
    status: 'Active',
    currentVersion: '1.0',
    lastModified: '2026-01-22',
    createdDate: '2026-01-22',
    fileType: 'pdf',
    accessLevel: 'Founder',
    lastApprovedBy: 'Alex Chen',
    lastApprovedDate: '2026-01-22',
    versions: [
      { version: '1.0', createdBy: 'Alex Chen', date: '2026-01-22', changeSummary: 'Executed advisor agreement — 0.5% vesting 2yr' },
    ],
    linkedObjects: [
      { type: 'Entity', id: 'ENT-005', label: 'Jordan Wells' },
    ],
  },
  {
    id: 'vd-06',
    title: 'SaaS Subscription — AWS',
    category: 'Contracts',
    status: 'Active',
    currentVersion: '1.0',
    lastModified: '2026-01-18',
    createdDate: '2026-01-18',
    fileType: 'pdf',
    accessLevel: 'Executive',
    versions: [
      { version: '1.0', createdBy: 'Marcus Rivera', date: '2026-01-18', changeSummary: 'AWS Enterprise agreement — 12-month term' },
    ],
    linkedObjects: [
      { type: 'Obligation', id: 'OBL-004', label: 'AWS — Monthly Cloud Spend' },
    ],
  },
  // ── Compliance Filings ──
  {
    id: 'vd-07',
    title: 'Delaware Franchise Tax — 2026',
    category: 'Compliance Filings',
    status: 'Draft',
    currentVersion: '0.1',
    lastModified: '2026-02-18',
    createdDate: '2026-02-18',
    fileType: 'doc',
    accessLevel: 'Founder',
    versions: [
      { version: '0.1', createdBy: 'Alex Chen', date: '2026-02-18', changeSummary: 'Draft preparation — due March 1' },
    ],
    linkedObjects: [
      { type: 'Compliance Filing', id: 'CF-001', label: 'DE Franchise Tax 2026' },
      { type: 'Obligation', id: 'OBL-002', label: 'Delaware Franchise Tax' },
    ],
  },
  {
    id: 'vd-08',
    title: 'Annual Report — Delaware',
    category: 'Compliance Filings',
    status: 'Active',
    currentVersion: '1.0',
    lastModified: '2026-02-10',
    createdDate: '2026-02-10',
    fileType: 'pdf',
    accessLevel: 'Executive',
    lastApprovedBy: 'Alex Chen',
    lastApprovedDate: '2026-02-10',
    versions: [
      { version: '1.0', createdBy: 'Marcus Rivera', date: '2026-02-10', changeSummary: 'Filed annual report with DE Secretary of State' },
    ],
    linkedObjects: [
      { type: 'Compliance Filing', id: 'CF-002', label: 'DE Annual Report 2026' },
    ],
  },
  // ── Facilities & Leases ──
  {
    id: 'vd-09',
    title: 'Office Lease — 500 Innovation Dr',
    category: 'Facilities & Leases',
    status: 'Active',
    currentVersion: '1.0',
    lastModified: '2026-01-25',
    createdDate: '2026-01-25',
    fileType: 'pdf',
    accessLevel: 'Executive',
    locked: true,
    lastApprovedBy: 'Alex Chen',
    lastApprovedDate: '2026-01-25',
    versions: [
      { version: '1.0', createdBy: 'Alex Chen', date: '2026-01-25', changeSummary: 'Executed 36-month lease — Class A office, 2,400 sq ft' },
    ],
    linkedObjects: [
      { type: 'Obligation', id: 'OBL-005', label: 'Office Lease — 500 Innovation Dr' },
    ],
  },
  // ── Insurance ──
  {
    id: 'vd-10',
    title: 'D&O Insurance Policy',
    category: 'Insurance',
    status: 'Active',
    currentVersion: '1.0',
    lastModified: '2026-02-05',
    createdDate: '2026-02-05',
    fileType: 'pdf',
    accessLevel: 'Founder',
    lastApprovedBy: 'Alex Chen',
    lastApprovedDate: '2026-02-05',
    versions: [
      { version: '1.0', createdBy: 'Alex Chen', date: '2026-02-05', changeSummary: 'Bound D&O policy — $2M aggregate, 12-month term' },
    ],
    linkedObjects: [
      { type: 'Obligation', id: 'OBL-006', label: 'D&O Premium — Annual' },
    ],
  },
  {
    id: 'vd-11',
    title: 'General Liability Policy',
    category: 'Insurance',
    status: 'Active',
    currentVersion: '1.0',
    lastModified: '2026-02-05',
    createdDate: '2026-02-05',
    fileType: 'pdf',
    accessLevel: 'Executive',
    versions: [
      { version: '1.0', createdBy: 'Marcus Rivera', date: '2026-02-05', changeSummary: 'Bound GL policy — $1M per occurrence, $2M aggregate' },
    ],
    linkedObjects: [],
  },
  // ── Board & Resolutions ──
  {
    id: 'vd-12',
    title: 'Board Consent — Initial Actions',
    category: 'Board & Resolutions',
    status: 'Active',
    currentVersion: '1.0',
    lastModified: '2026-01-15',
    createdDate: '2026-01-15',
    fileType: 'pdf',
    accessLevel: 'Executive',
    lastApprovedBy: 'Alex Chen',
    lastApprovedDate: '2026-01-15',
    versions: [
      { version: '1.0', createdBy: 'Alex Chen', date: '2026-01-15', changeSummary: 'Approved bylaws, officers, fiscal year, banking resolutions' },
    ],
    linkedObjects: [
      { type: 'Entity', id: 'ENT-001', label: 'KaNeXT Inc.' },
    ],
  },
  {
    id: 'vd-13',
    title: 'Board Resolution — Option Pool',
    category: 'Board & Resolutions',
    status: 'Active',
    currentVersion: '1.0',
    lastModified: '2026-02-08',
    createdDate: '2026-02-08',
    fileType: 'pdf',
    accessLevel: 'Executive',
    lastApprovedBy: 'Alex Chen',
    lastApprovedDate: '2026-02-08',
    versions: [
      { version: '1.0', createdBy: 'Alex Chen', date: '2026-02-08', changeSummary: 'Approved 8% employee option pool reservation' },
    ],
    linkedObjects: [
      { type: 'Program', id: 'PRG-002', label: 'Employee Equity Program' },
    ],
  },
  // ── Strategic ──
  {
    id: 'vd-14',
    title: 'Seed Pitch Deck',
    category: 'Strategic',
    status: 'Active',
    currentVersion: '3.2',
    lastModified: '2026-02-20',
    createdDate: '2026-01-10',
    fileType: 'pdf',
    accessLevel: 'Executive',
    versions: [
      { version: '1.0', createdBy: 'Alex Chen', date: '2026-01-10', changeSummary: 'Initial deck — problem, solution, market sizing' },
      { version: '2.0', createdBy: 'Alex Chen', date: '2026-01-25', changeSummary: 'Added traction metrics + competition slide' },
      { version: '3.0', createdBy: 'Alex Chen', date: '2026-02-10', changeSummary: 'Full redesign — narrative + financials update' },
      { version: '3.2', createdBy: 'Marcus Rivera', date: '2026-02-20', changeSummary: 'Refined financial projections + team slide' },
    ],
    linkedObjects: [
      { type: 'Deal', id: 'DL-001', label: 'Apex Capital — Seed SAFE' },
    ],
  },
  {
    id: 'vd-15',
    title: 'Financial Model — 3-Year Projection',
    category: 'Strategic',
    status: 'Active',
    currentVersion: '2.1',
    lastModified: '2026-02-15',
    createdDate: '2026-01-12',
    fileType: 'doc',
    accessLevel: 'Founder',
    versions: [
      { version: '1.0', createdBy: 'Alex Chen', date: '2026-01-12', changeSummary: 'Base model — revenue, burn, runway' },
      { version: '2.0', createdBy: 'Alex Chen', date: '2026-02-01', changeSummary: 'Updated with actual Q1 data' },
      { version: '2.1', createdBy: 'Marcus Rivera', date: '2026-02-15', changeSummary: 'Added sensitivity analysis on CAC/LTV' },
    ],
    linkedObjects: [],
  },
  // ── Operations ──
  {
    id: 'vd-16',
    title: 'Org Chart + Hiring Plan',
    category: 'Operations',
    status: 'Active',
    currentVersion: '1.3',
    lastModified: '2026-02-22',
    createdDate: '2026-01-20',
    fileType: 'doc',
    accessLevel: 'Executive',
    versions: [
      { version: '1.0', createdBy: 'Alex Chen', date: '2026-01-20', changeSummary: 'Initial org chart — 3 roles' },
      { version: '1.1', createdBy: 'Alex Chen', date: '2026-01-30', changeSummary: 'Added Q1 hiring targets' },
      { version: '1.2', createdBy: 'Marcus Rivera', date: '2026-02-10', changeSummary: 'Updated with CFO search timeline' },
      { version: '1.3', createdBy: 'Marcus Rivera', date: '2026-02-22', changeSummary: 'Added engineering team structure' },
    ],
    linkedObjects: [
      { type: 'Program', id: 'PRG-003', label: 'Hiring Program — Q1 2026' },
    ],
  },
  {
    id: 'vd-17',
    title: 'Product Roadmap — Q1/Q2',
    category: 'Operations',
    status: 'Active',
    currentVersion: '2.0',
    lastModified: '2026-02-18',
    createdDate: '2026-01-15',
    fileType: 'doc',
    accessLevel: 'Department',
    versions: [
      { version: '1.0', createdBy: 'Alex Chen', date: '2026-01-15', changeSummary: 'Q1 priorities — MVP features, launch milestones' },
      { version: '2.0', createdBy: 'Alex Chen', date: '2026-02-18', changeSummary: 'Added Q2 expansion targets + integration roadmap' },
    ],
    linkedObjects: [],
  },
  // ── Other ──
  {
    id: 'vd-18',
    title: 'Brand Guidelines',
    category: 'Other',
    status: 'Draft',
    currentVersion: '0.2',
    lastModified: '2026-02-24',
    createdDate: '2026-02-15',
    fileType: 'doc',
    accessLevel: 'Department',
    versions: [
      { version: '0.1', createdBy: 'Alex Chen', date: '2026-02-15', changeSummary: 'Initial brand direction — logo, palette, typography' },
      { version: '0.2', createdBy: 'Marcus Rivera', date: '2026-02-24', changeSummary: 'Added voice & tone guidelines' },
    ],
    linkedObjects: [],
  },
];

// =============================================================================
// MOCK ACTIVITY FEED (chronological, newest first)
// =============================================================================

export const VAULT_ACTIVITY: VaultActivityEvent[] = [
  { id: 'va-01', documentId: 'vd-18', documentTitle: 'Brand Guidelines', type: 'version_uploaded', actor: 'Marcus Rivera', date: '2026-02-24', detail: 'Version 0.2 — Added voice & tone guidelines' },
  { id: 'va-02', documentId: 'vd-16', documentTitle: 'Org Chart + Hiring Plan', type: 'version_uploaded', actor: 'Marcus Rivera', date: '2026-02-22', detail: 'Version 1.3 — Added engineering team structure' },
  { id: 'va-03', documentId: 'vd-14', documentTitle: 'Seed Pitch Deck', type: 'version_uploaded', actor: 'Marcus Rivera', date: '2026-02-20', detail: 'Version 3.2 — Refined financial projections + team slide' },
  { id: 'va-04', documentId: 'vd-07', documentTitle: 'Delaware Franchise Tax — 2026', type: 'created', actor: 'Alex Chen', date: '2026-02-18' },
  { id: 'va-05', documentId: 'vd-17', documentTitle: 'Product Roadmap — Q1/Q2', type: 'version_uploaded', actor: 'Alex Chen', date: '2026-02-18', detail: 'Version 2.0 — Added Q2 expansion targets' },
  { id: 'va-06', documentId: 'vd-18', documentTitle: 'Brand Guidelines', type: 'created', actor: 'Alex Chen', date: '2026-02-15' },
  { id: 'va-07', documentId: 'vd-15', documentTitle: 'Financial Model — 3-Year Projection', type: 'version_uploaded', actor: 'Marcus Rivera', date: '2026-02-15', detail: 'Version 2.1 — Added sensitivity analysis on CAC/LTV' },
  { id: 'va-08', documentId: 'vd-04', documentTitle: 'Cap Table — Current', type: 'version_uploaded', actor: 'Alex Chen', date: '2026-02-12', detail: 'Version 2.0 — Updated to reflect SAFE + option pool' },
  { id: 'va-09', documentId: 'vd-08', documentTitle: 'Annual Report — Delaware', type: 'created', actor: 'Marcus Rivera', date: '2026-02-10' },
  { id: 'va-10', documentId: 'vd-13', documentTitle: 'Board Resolution — Option Pool', type: 'created', actor: 'Alex Chen', date: '2026-02-08' },
  { id: 'va-11', documentId: 'vd-03', documentTitle: 'SAFE Agreement — Apex Capital', type: 'locked', actor: 'Alex Chen', date: '2026-02-06', detail: 'Locked after execution' },
  { id: 'va-12', documentId: 'vd-10', documentTitle: 'D&O Insurance Policy', type: 'created', actor: 'Alex Chen', date: '2026-02-05' },
  { id: 'va-13', documentId: 'vd-11', documentTitle: 'General Liability Policy', type: 'created', actor: 'Marcus Rivera', date: '2026-02-05' },
  { id: 'va-14', documentId: 'vd-02', documentTitle: 'Corporate Bylaws', type: 'version_uploaded', actor: 'Marcus Rivera', date: '2026-02-03', detail: 'Version 1.1 — Updated indemnification clause' },
  { id: 'va-15', documentId: 'vd-03', documentTitle: 'SAFE Agreement — Apex Capital', type: 'created', actor: 'Alex Chen', date: '2026-02-01' },
  { id: 'va-16', documentId: 'vd-09', documentTitle: 'Office Lease — 500 Innovation Dr', type: 'locked', actor: 'Alex Chen', date: '2026-01-26', detail: 'Locked after execution' },
  { id: 'va-17', documentId: 'vd-09', documentTitle: 'Office Lease — 500 Innovation Dr', type: 'created', actor: 'Alex Chen', date: '2026-01-25' },
  { id: 'va-18', documentId: 'vd-05', documentTitle: 'Advisor Agreement — Jordan Wells', type: 'created', actor: 'Alex Chen', date: '2026-01-22' },
  { id: 'va-19', documentId: 'vd-06', documentTitle: 'SaaS Subscription — AWS', type: 'created', actor: 'Marcus Rivera', date: '2026-01-18' },
  { id: 'va-20', documentId: 'vd-01', documentTitle: 'Certificate of Incorporation', type: 'created', actor: 'Alex Chen', date: '2026-01-15' },
  { id: 'va-21', documentId: 'vd-02', documentTitle: 'Corporate Bylaws', type: 'created', actor: 'Alex Chen', date: '2026-01-15' },
  { id: 'va-22', documentId: 'vd-12', documentTitle: 'Board Consent — Initial Actions', type: 'created', actor: 'Alex Chen', date: '2026-01-15' },
  { id: 'va-23', documentId: 'vd-04', documentTitle: 'Cap Table — Current', type: 'created', actor: 'Alex Chen', date: '2026-01-15' },
];
