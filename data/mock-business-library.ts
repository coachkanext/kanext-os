/**
 * Mock Business Library Data — structured institutional media archive.
 * 8 sections: Executive, Capital, Governance, Operations, Product, Promotional, Playlists, Saved
 * 3-level drill-in: Sections → Folders → Videos
 * Visibility-gated (0=Public, 1=Internal, 2=Board, 3=Executive), entity-scoped.
 */

// =============================================================================
// TYPES
// =============================================================================

export type BizLibrarySectionId =
  | 'executive'
  | 'capital'
  | 'governance'
  | 'operations'
  | 'product'
  | 'promotional'
  | 'playlists'
  | 'saved';

export type BizLibraryVideoType =
  | 'Executive'
  | 'Capital'
  | 'Board'
  | 'Internal'
  | 'Product'
  | 'Promotional';

export interface BizLibrarySection {
  id: BizLibrarySectionId;
  name: string;
  icon: string;
  colorStrip: string;
  itemCount: number;
  visibilityClass: 0 | 1 | 2 | 3;
}

export interface BizLibraryFolder {
  id: string;
  sectionId: BizLibrarySectionId;
  name: string;
  itemCount: number;
}

export interface BizLibraryVideo {
  id: string;
  title: string;
  type: BizLibraryVideoType;
  speaker?: string;
  date: Date;
  duration: string;
  thumbnailColor: string;
  visibilityClass: 0 | 1 | 2 | 3;
  linkedDeal?: string;
  linkedEvent?: string;
  linkedDocument?: string;
  isPinned?: boolean;
}

// =============================================================================
// COLORS
// =============================================================================

export const TYPE_COLORS: Record<BizLibraryVideoType, string> = {
  Executive: '#8B5CF6',
  Capital: '#F59E0B',
  Board: '#EF4444',
  Internal: '#1D9BF0',
  Product: '#22C55E',
  Promotional: '#EC4899',
};

export const VISIBILITY_LABELS: Record<number, string> = {
  0: 'Public',
  1: 'Internal',
  2: 'Board',
  3: 'Executive',
};

export const VISIBILITY_COLORS: Record<number, string> = {
  0: '#22C55E',
  1: '#1D9BF0',
  2: '#F59E0B',
  3: '#EF4444',
};

// =============================================================================
// SECTIONS
// =============================================================================

export const BIZ_LIBRARY_SECTIONS: BizLibrarySection[] = [
  {
    id: 'executive',
    name: 'Executive',
    icon: 'person.fill',
    colorStrip: '#8B5CF6',
    itemCount: 10,
    visibilityClass: 3,
  },
  {
    id: 'capital',
    name: 'Capital',
    icon: 'banknote.fill',
    colorStrip: '#F59E0B',
    itemCount: 9,
    visibilityClass: 2,
  },
  {
    id: 'governance',
    name: 'Governance',
    icon: 'building.columns.fill',
    colorStrip: '#EF4444',
    itemCount: 8,
    visibilityClass: 2,
  },
  {
    id: 'operations',
    name: 'Operations',
    icon: 'gearshape.fill',
    colorStrip: '#1D9BF0',
    itemCount: 10,
    visibilityClass: 1,
  },
  {
    id: 'product',
    name: 'Product',
    icon: 'cube.fill',
    colorStrip: '#22C55E',
    itemCount: 8,
    visibilityClass: 1,
  },
  {
    id: 'promotional',
    name: 'Promotional',
    icon: 'megaphone.fill',
    colorStrip: '#EC4899',
    itemCount: 7,
    visibilityClass: 0,
  },
  {
    id: 'playlists',
    name: 'Playlists',
    icon: 'text.badge.plus',
    colorStrip: '#6366F1',
    itemCount: 4,
    visibilityClass: 0,
  },
  {
    id: 'saved',
    name: 'Saved',
    icon: 'bookmark.fill',
    colorStrip: '#1D9BF0',
    itemCount: 5,
    visibilityClass: 0,
  },
];

// =============================================================================
// SUBFOLDERS
// =============================================================================

export const BIZ_LIBRARY_FOLDERS: Record<BizLibrarySectionId, BizLibraryFolder[]> = {
  executive: [
    { id: 'exec-2026', sectionId: 'executive', name: '2026', itemCount: 6 },
    { id: 'exec-2025', sectionId: 'executive', name: '2025', itemCount: 4 },
  ],
  capital: [
    { id: 'cap-seriesb', sectionId: 'capital', name: 'Series B', itemCount: 5 },
    { id: 'cap-seriesa', sectionId: 'capital', name: 'Series A', itemCount: 4 },
  ],
  governance: [
    { id: 'gov-2026', sectionId: 'governance', name: '2026', itemCount: 5 },
    { id: 'gov-2025', sectionId: 'governance', name: '2025', itemCount: 3 },
  ],
  operations: [
    { id: 'ops-finance', sectionId: 'operations', name: 'Finance', itemCount: 3 },
    { id: 'ops-compliance', sectionId: 'operations', name: 'Compliance', itemCount: 3 },
    { id: 'ops-facilities', sectionId: 'operations', name: 'Facilities', itemCount: 2 },
    { id: 'ops-program', sectionId: 'operations', name: 'Program', itemCount: 2 },
  ],
  product: [
    { id: 'prod-v3', sectionId: 'product', name: 'v3.0', itemCount: 3 },
    { id: 'prod-v2', sectionId: 'product', name: 'v2.0', itemCount: 3 },
    { id: 'prod-v1', sectionId: 'product', name: 'v1.0', itemCount: 2 },
  ],
  promotional: [
    { id: 'promo-2026', sectionId: 'promotional', name: '2026 Campaigns', itemCount: 4 },
    { id: 'promo-2025', sectionId: 'promotional', name: '2025 Campaigns', itemCount: 3 },
  ],
  playlists: [
    { id: 'pl-roadshow', sectionId: 'playlists', name: 'Investor Roadshow', itemCount: 4 },
    { id: 'pl-board-q1', sectionId: 'playlists', name: 'Board Packet — Q1', itemCount: 3 },
    { id: 'pl-vision', sectionId: 'playlists', name: 'Strategic Vision Series', itemCount: 3 },
    { id: 'pl-enterprise', sectionId: 'playlists', name: 'Enterprise Overview Sequence', itemCount: 3 },
  ],
  saved: [], // flat list, no subfolders
};

// =============================================================================
// VIDEO ITEMS PER FOLDER
// =============================================================================

const daysAgo = (d: number) => new Date(Date.now() - d * 86400000);

// ── Executive ─────────────────────────────────────────────────────────

const EXEC_2026: BizLibraryVideo[] = [
  { id: 'exv-1', title: 'Q1 2026 Strategic Address', type: 'Executive', speaker: 'CEO', date: daysAgo(3), duration: '42:15', thumbnailColor: '#4C1D95', visibilityClass: 3 },
  { id: 'exv-2', title: 'Founder Vision — H1 Priorities', type: 'Executive', speaker: 'CEO', date: daysAgo(10), duration: '28:30', thumbnailColor: '#312E81', visibilityClass: 3 },
  { id: 'exv-3', title: 'February Performance Review', type: 'Executive', speaker: 'COO', date: daysAgo(5), duration: '35:00', thumbnailColor: '#3B0764', visibilityClass: 3 },
  { id: 'exv-4', title: 'Quarterly Revenue Walkthrough', type: 'Executive', speaker: 'CFO', date: daysAgo(14), duration: '48:20', thumbnailColor: '#581C87', visibilityClass: 3, linkedDocument: 'Q1 Revenue Report' },
  { id: 'exv-5', title: 'Engineering All-Hands — February', type: 'Executive', speaker: 'VP Engineering', date: daysAgo(7), duration: '55:10', thumbnailColor: '#4C1D95', visibilityClass: 2 },
  { id: 'exv-6', title: 'Product Strategy Session', type: 'Executive', speaker: 'VP Product', date: daysAgo(18), duration: '38:45', thumbnailColor: '#312E81', visibilityClass: 3 },
];

const EXEC_2025: BizLibraryVideo[] = [
  { id: 'exv-7', title: '2025 Year in Review', type: 'Executive', speaker: 'CEO', date: new Date('2025-12-18'), duration: '52:00', thumbnailColor: '#3B0764', visibilityClass: 3 },
  { id: 'exv-8', title: 'Q4 Strategic Address', type: 'Executive', speaker: 'CEO', date: new Date('2025-10-02'), duration: '40:30', thumbnailColor: '#4C1D95', visibilityClass: 3 },
  { id: 'exv-9', title: 'Q3 Performance Review', type: 'Executive', speaker: 'COO', date: new Date('2025-07-15'), duration: '33:20', thumbnailColor: '#581C87', visibilityClass: 3 },
  { id: 'exv-10', title: 'Company Kickoff — 2025', type: 'Executive', speaker: 'CEO', date: new Date('2025-01-10'), duration: '1:02:00', thumbnailColor: '#312E81', visibilityClass: 2 },
];

// ── Capital ───────────────────────────────────────────────────────────

const CAP_SERIES_B: BizLibraryVideo[] = [
  { id: 'cpv-1', title: 'Series B — Investor Pitch Deck Walk', type: 'Capital', speaker: 'CEO', date: daysAgo(16), duration: '32:00', thumbnailColor: '#78350F', visibilityClass: 3, linkedDeal: 'Series B' },
  { id: 'cpv-2', title: 'Series B — Financial Model Review', type: 'Capital', speaker: 'CFO', date: daysAgo(20), duration: '45:15', thumbnailColor: '#92400E', visibilityClass: 3, linkedDeal: 'Series B', linkedDocument: 'Financial Model v4' },
  { id: 'cpv-3', title: 'Series B — Due Diligence Q&A', type: 'Capital', speaker: 'CEO', date: daysAgo(24), duration: '57:20', thumbnailColor: '#78350F', visibilityClass: 3, linkedDeal: 'Series B' },
  { id: 'cpv-4', title: 'Series B — Term Sheet Discussion', type: 'Capital', speaker: 'Legal Counsel', date: daysAgo(28), duration: '38:40', thumbnailColor: '#451A03', visibilityClass: 3, linkedDeal: 'Series B', linkedDocument: 'Term Sheet v2' },
  { id: 'cpv-5', title: 'Series B — Investor Update Call', type: 'Capital', speaker: 'CEO', date: daysAgo(8), duration: '25:10', thumbnailColor: '#92400E', visibilityClass: 3, linkedDeal: 'Series B' },
];

const CAP_SERIES_A: BizLibraryVideo[] = [
  { id: 'cpv-6', title: 'Series A — Closing Recap', type: 'Capital', speaker: 'CEO', date: new Date('2025-06-15'), duration: '22:00', thumbnailColor: '#78350F', visibilityClass: 3, linkedDeal: 'Series A' },
  { id: 'cpv-7', title: 'Series A — Investor Pitch', type: 'Capital', speaker: 'CEO', date: new Date('2025-03-20'), duration: '30:45', thumbnailColor: '#451A03', visibilityClass: 3, linkedDeal: 'Series A' },
  { id: 'cpv-8', title: 'Series A — Market Analysis', type: 'Capital', speaker: 'VP Product', date: new Date('2025-04-10'), duration: '28:30', thumbnailColor: '#92400E', visibilityClass: 3, linkedDeal: 'Series A' },
  { id: 'cpv-9', title: 'Series A — Team Overview', type: 'Capital', speaker: 'COO', date: new Date('2025-03-25'), duration: '18:15', thumbnailColor: '#78350F', visibilityClass: 3, linkedDeal: 'Series A' },
];

// ── Governance ────────────────────────────────────────────────────────

const GOV_2026: BizLibraryVideo[] = [
  { id: 'gov-1', title: 'Board Meeting — February 2026', type: 'Board', date: daysAgo(8), duration: '1:12:30', thumbnailColor: '#7F1D1D', visibilityClass: 2, linkedEvent: 'Feb Board Meeting' },
  { id: 'gov-2', title: 'Audit Committee — Q1 Review', type: 'Board', date: daysAgo(12), duration: '48:20', thumbnailColor: '#991B1B', visibilityClass: 2, linkedDocument: 'Q1 Audit Report' },
  { id: 'gov-3', title: 'Compensation Committee Session', type: 'Board', date: daysAgo(15), duration: '35:10', thumbnailColor: '#7F1D1D', visibilityClass: 2 },
  { id: 'gov-4', title: 'Board Meeting — January 2026', type: 'Board', date: daysAgo(33), duration: '1:05:45', thumbnailColor: '#991B1B', visibilityClass: 2, linkedEvent: 'Jan Board Meeting' },
  { id: 'gov-5', title: 'Strategic Vote — Market Expansion', type: 'Board', date: daysAgo(20), duration: '28:00', thumbnailColor: '#6B2121', visibilityClass: 2 },
];

const GOV_2025: BizLibraryVideo[] = [
  { id: 'gov-6', title: 'Board Meeting — December 2025', type: 'Board', date: new Date('2025-12-10'), duration: '1:08:20', thumbnailColor: '#7F1D1D', visibilityClass: 2, linkedEvent: 'Dec Board Meeting' },
  { id: 'gov-7', title: 'Annual Governance Review', type: 'Board', date: new Date('2025-11-15'), duration: '55:00', thumbnailColor: '#991B1B', visibilityClass: 2 },
  { id: 'gov-8', title: 'Board Meeting — October 2025', type: 'Board', date: new Date('2025-10-08'), duration: '1:15:00', thumbnailColor: '#6B2121', visibilityClass: 2, linkedEvent: 'Oct Board Meeting' },
];

// ── Operations ────────────────────────────────────────────────────────

const OPS_FINANCE: BizLibraryVideo[] = [
  { id: 'opf-1', title: 'Monthly Close Walkthrough — Jan 2026', type: 'Internal', speaker: 'Controller', date: daysAgo(22), duration: '28:00', thumbnailColor: '#1E293B', visibilityClass: 1, linkedDocument: 'Jan Close Report' },
  { id: 'opf-2', title: 'Budget vs. Actuals — Q4', type: 'Internal', speaker: 'CFO', date: daysAgo(40), duration: '35:15', thumbnailColor: '#0F172A', visibilityClass: 1 },
  { id: 'opf-3', title: 'AP/AR Process Update', type: 'Internal', speaker: 'Controller', date: daysAgo(50), duration: '18:30', thumbnailColor: '#1E293B', visibilityClass: 1 },
];

const OPS_COMPLIANCE: BizLibraryVideo[] = [
  { id: 'opc-1', title: 'Annual Compliance Training', type: 'Internal', date: daysAgo(14), duration: '42:00', thumbnailColor: '#0F172A', visibilityClass: 1 },
  { id: 'opc-2', title: 'Data Privacy — GDPR Refresher', type: 'Internal', date: daysAgo(30), duration: '25:10', thumbnailColor: '#1E293B', visibilityClass: 1 },
  { id: 'opc-3', title: 'SOC 2 Audit Preparation', type: 'Internal', speaker: 'General Counsel', date: daysAgo(45), duration: '38:20', thumbnailColor: '#0F172A', visibilityClass: 1, linkedDocument: 'SOC 2 Checklist' },
];

const OPS_FACILITIES: BizLibraryVideo[] = [
  { id: 'opfa-1', title: 'Office Expansion — Floor Plan Review', type: 'Internal', speaker: 'COO', date: daysAgo(18), duration: '22:00', thumbnailColor: '#1E293B', visibilityClass: 1 },
  { id: 'opfa-2', title: 'Emergency Evacuation Training', type: 'Internal', date: daysAgo(60), duration: '15:30', thumbnailColor: '#0F172A', visibilityClass: 1 },
];

const OPS_PROGRAM: BizLibraryVideo[] = [
  { id: 'opp-1', title: 'Q1 OKR Setting Session', type: 'Internal', speaker: 'COO', date: daysAgo(25), duration: '48:00', thumbnailColor: '#1E293B', visibilityClass: 1 },
  { id: 'opp-2', title: 'Department Leads Sync — February', type: 'Internal', speaker: 'COO', date: daysAgo(6), duration: '32:20', thumbnailColor: '#0F172A', visibilityClass: 1 },
];

// ── Product ───────────────────────────────────────────────────────────

const PROD_V3: BizLibraryVideo[] = [
  { id: 'prv-1', title: 'v3.0 Architecture Briefing', type: 'Product', speaker: 'VP Engineering', date: daysAgo(4), duration: '52:30', thumbnailColor: '#064E3B', visibilityClass: 1 },
  { id: 'prv-2', title: 'v3.0 Feature Walkthrough — Payments', type: 'Product', speaker: 'VP Product', date: daysAgo(9), duration: '28:00', thumbnailColor: '#065F46', visibilityClass: 1 },
  { id: 'prv-3', title: 'v3.0 Beta Demo — Enterprise', type: 'Product', speaker: 'VP Product', date: daysAgo(15), duration: '35:45', thumbnailColor: '#047857', visibilityClass: 0, linkedEvent: 'Enterprise Beta Launch' },
];

const PROD_V2: BizLibraryVideo[] = [
  { id: 'prv-4', title: 'v2.0 Launch Webinar', type: 'Product', speaker: 'CEO', date: new Date('2025-11-01'), duration: '45:00', thumbnailColor: '#064E3B', visibilityClass: 0, linkedEvent: 'Platform 2.0 Launch' },
  { id: 'prv-5', title: 'v2.0 Migration Guide', type: 'Product', speaker: 'VP Engineering', date: new Date('2025-10-15'), duration: '32:10', thumbnailColor: '#065F46', visibilityClass: 1 },
  { id: 'prv-6', title: 'v2.0 Feature Overview', type: 'Product', speaker: 'VP Product', date: new Date('2025-09-28'), duration: '22:30', thumbnailColor: '#047857', visibilityClass: 0 },
];

const PROD_V1: BizLibraryVideo[] = [
  { id: 'prv-7', title: 'v1.0 Launch Recording', type: 'Product', speaker: 'CEO', date: new Date('2025-03-15'), duration: '38:00', thumbnailColor: '#064E3B', visibilityClass: 0 },
  { id: 'prv-8', title: 'v1.0 Internal Demo', type: 'Product', speaker: 'VP Engineering', date: new Date('2025-02-28'), duration: '28:45', thumbnailColor: '#065F46', visibilityClass: 1 },
];

// ── Promotional ───────────────────────────────────────────────────────

const PROMO_2026: BizLibraryVideo[] = [
  { id: 'pmv-1', title: 'Partnership Announcement — NovaTech', type: 'Promotional', date: daysAgo(6), duration: '3:30', thumbnailColor: '#831843', visibilityClass: 0, linkedEvent: 'NovaTech Partnership' },
  { id: 'pmv-2', title: 'Enterprise Launch — 30s Spot', type: 'Promotional', date: daysAgo(12), duration: '0:30', thumbnailColor: '#9D174D', visibilityClass: 0 },
  { id: 'pmv-3', title: 'Customer Testimonial — Meridian Corp', type: 'Promotional', date: daysAgo(20), duration: '2:15', thumbnailColor: '#831843', visibilityClass: 0 },
  { id: 'pmv-4', title: 'Brand Sizzle Reel — Q1', type: 'Promotional', date: daysAgo(25), duration: '1:45', thumbnailColor: '#9D174D', visibilityClass: 0 },
];

const PROMO_2025: BizLibraryVideo[] = [
  { id: 'pmv-5', title: '2025 Year in Review — Highlight Reel', type: 'Promotional', date: new Date('2025-12-20'), duration: '4:00', thumbnailColor: '#831843', visibilityClass: 0 },
  { id: 'pmv-6', title: 'v2.0 Launch Trailer', type: 'Promotional', date: new Date('2025-10-28'), duration: '1:30', thumbnailColor: '#9D174D', visibilityClass: 0 },
  { id: 'pmv-7', title: 'Milestone — 10K Users Celebration', type: 'Promotional', date: new Date('2025-08-05'), duration: '2:00', thumbnailColor: '#831843', visibilityClass: 0 },
];

// ── Playlists ─────────────────────────────────────────────────────────

const PL_ROADSHOW: BizLibraryVideo[] = [
  { id: 'plr-1', title: 'Series B — Investor Pitch Deck Walk', type: 'Capital', speaker: 'CEO', date: daysAgo(16), duration: '32:00', thumbnailColor: '#78350F', visibilityClass: 3, linkedDeal: 'Series B' },
  { id: 'plr-2', title: 'Series B — Financial Model Review', type: 'Capital', speaker: 'CFO', date: daysAgo(20), duration: '45:15', thumbnailColor: '#92400E', visibilityClass: 3, linkedDeal: 'Series B' },
  { id: 'plr-3', title: 'Series B — Due Diligence Q&A', type: 'Capital', speaker: 'CEO', date: daysAgo(24), duration: '57:20', thumbnailColor: '#78350F', visibilityClass: 3, linkedDeal: 'Series B' },
  { id: 'plr-4', title: 'Series B — Investor Update Call', type: 'Capital', speaker: 'CEO', date: daysAgo(8), duration: '25:10', thumbnailColor: '#92400E', visibilityClass: 3, linkedDeal: 'Series B' },
];

const PL_BOARD_Q1: BizLibraryVideo[] = [
  { id: 'plb-1', title: 'Board Meeting — February 2026', type: 'Board', date: daysAgo(8), duration: '1:12:30', thumbnailColor: '#7F1D1D', visibilityClass: 2 },
  { id: 'plb-2', title: 'Board Meeting — January 2026', type: 'Board', date: daysAgo(33), duration: '1:05:45', thumbnailColor: '#991B1B', visibilityClass: 2 },
  { id: 'plb-3', title: 'Q1 2026 Strategic Address', type: 'Executive', speaker: 'CEO', date: daysAgo(3), duration: '42:15', thumbnailColor: '#4C1D95', visibilityClass: 3 },
];

const PL_VISION: BizLibraryVideo[] = [
  { id: 'plv-1', title: 'Founder Vision — H1 Priorities', type: 'Executive', speaker: 'CEO', date: daysAgo(10), duration: '28:30', thumbnailColor: '#312E81', visibilityClass: 3 },
  { id: 'plv-2', title: '2025 Year in Review', type: 'Executive', speaker: 'CEO', date: new Date('2025-12-18'), duration: '52:00', thumbnailColor: '#3B0764', visibilityClass: 3 },
  { id: 'plv-3', title: 'Company Kickoff — 2025', type: 'Executive', speaker: 'CEO', date: new Date('2025-01-10'), duration: '1:02:00', thumbnailColor: '#312E81', visibilityClass: 2 },
];

const PL_ENTERPRISE: BizLibraryVideo[] = [
  { id: 'ple-1', title: 'v3.0 Beta Demo — Enterprise', type: 'Product', speaker: 'VP Product', date: daysAgo(15), duration: '35:45', thumbnailColor: '#047857', visibilityClass: 0 },
  { id: 'ple-2', title: 'v2.0 Launch Webinar', type: 'Product', speaker: 'CEO', date: new Date('2025-11-01'), duration: '45:00', thumbnailColor: '#064E3B', visibilityClass: 0 },
  { id: 'ple-3', title: 'Customer Testimonial — Meridian Corp', type: 'Promotional', date: daysAgo(20), duration: '2:15', thumbnailColor: '#831843', visibilityClass: 0 },
];

// ── Saved ─────────────────────────────────────────────────────────────

const SAVED_ITEMS: BizLibraryVideo[] = [
  { id: 'sav-1', title: 'Q1 2026 Strategic Address', type: 'Executive', speaker: 'CEO', date: daysAgo(3), duration: '42:15', thumbnailColor: '#4C1D95', visibilityClass: 3 },
  { id: 'sav-2', title: 'Series B — Investor Pitch Deck Walk', type: 'Capital', speaker: 'CEO', date: daysAgo(16), duration: '32:00', thumbnailColor: '#78350F', visibilityClass: 3, linkedDeal: 'Series B' },
  { id: 'sav-3', title: 'Board Meeting — February 2026', type: 'Board', date: daysAgo(8), duration: '1:12:30', thumbnailColor: '#7F1D1D', visibilityClass: 2 },
  { id: 'sav-4', title: 'v3.0 Architecture Briefing', type: 'Product', speaker: 'VP Engineering', date: daysAgo(4), duration: '52:30', thumbnailColor: '#064E3B', visibilityClass: 1 },
  { id: 'sav-5', title: 'Partnership Announcement — NovaTech', type: 'Promotional', date: daysAgo(6), duration: '3:30', thumbnailColor: '#831843', visibilityClass: 0 },
];

// =============================================================================
// FOLDER → VIDEO MAPPING
// =============================================================================

export const BIZ_FOLDER_VIDEOS: Record<string, BizLibraryVideo[]> = {
  'exec-2026': EXEC_2026,
  'exec-2025': EXEC_2025,
  'cap-seriesb': CAP_SERIES_B,
  'cap-seriesa': CAP_SERIES_A,
  'gov-2026': GOV_2026,
  'gov-2025': GOV_2025,
  'ops-finance': OPS_FINANCE,
  'ops-compliance': OPS_COMPLIANCE,
  'ops-facilities': OPS_FACILITIES,
  'ops-program': OPS_PROGRAM,
  'prod-v3': PROD_V3,
  'prod-v2': PROD_V2,
  'prod-v1': PROD_V1,
  'promo-2026': PROMO_2026,
  'promo-2025': PROMO_2025,
  'pl-roadshow': PL_ROADSHOW,
  'pl-board-q1': PL_BOARD_Q1,
  'pl-vision': PL_VISION,
  'pl-enterprise': PL_ENTERPRISE,
};

// Saved section has no subfolders — flat list
export const BIZ_SAVED_VIDEOS: BizLibraryVideo[] = SAVED_ITEMS;

// =============================================================================
// HELPERS
// =============================================================================

export function getVisibleSections(userVisibility: number): BizLibrarySection[] {
  return BIZ_LIBRARY_SECTIONS.filter((s) => s.visibilityClass <= userVisibility);
}

export function filterVideos(
  videos: BizLibraryVideo[],
  userVisibility: number,
  search: string,
): BizLibraryVideo[] {
  let filtered = videos.filter((v) => v.visibilityClass <= userVisibility);

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        (v.speaker && v.speaker.toLowerCase().includes(q)) ||
        (v.linkedDeal && v.linkedDeal.toLowerCase().includes(q)) ||
        (v.linkedEvent && v.linkedEvent.toLowerCase().includes(q)) ||
        (v.linkedDocument && v.linkedDocument.toLowerCase().includes(q)) ||
        v.type.toLowerCase().includes(q),
    );
  }

  return filtered;
}
