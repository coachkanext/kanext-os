/**
 * Mock Business Data Room — Data layer for the Business Data Room tab.
 *
 * Sections:
 *   Overview — aggregate stats + category breakdown
 *   Library — 12 documents across 7 categories (pitch, financial, legal, product, governance, team, proof)
 *   Versioning — canonical version history with major/minor/patch changes
 *   Packets — curated document bundles for specific audiences
 *   Requests — inbound document access requests
 *   Audit — access/download/share/upload event log
 *
 * All data references KaNeXT entities: Alex, Jordan, Taylor, Jordan, potential investors.
 */

// =============================================================================
// TYPES
// =============================================================================

export type DataRoomSubTab =
  | 'overview'
  | 'library'
  | 'versioning'
  | 'packets'
  | 'requests'
  | 'audit'
  | 'builder';

export interface DataRoomStats {
  totalDocs: number;
  categories: number;
  pendingRequests: number;
  lastUpdated: string;
  accessLog7d: number;
}

export type DocCategory =
  | 'pitch'
  | 'financial'
  | 'legal'
  | 'product'
  | 'governance'
  | 'team'
  | 'proof'
  | 'compliance'
  | 'payment_rails'
  | 'media_proof';

export interface DataRoomDocument {
  id: string;
  title: string;
  category: DocCategory;
  version: string;
  status: 'current' | 'outdated' | 'draft';
  updatedAt: string;
  updatedBy: string;
  accessLevel: 'public' | 'retail' | 'board' | 'founder';
  watermarked: boolean;
  fileType: 'pdf' | 'xlsx' | 'pptx' | 'docx';
  size: string;
}

export interface VersionEntry {
  id: string;
  docId: string;
  docTitle: string;
  version: string;
  changedBy: string;
  changedAt: string;
  changeType: 'major' | 'minor' | 'patch';
  summary: string;
}

export interface DataPacket {
  id: string;
  title: string;
  description: string;
  docCount: number;
  audience: 'retail' | 'board' | 'partner' | 'acquirer';
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  expiresAt?: string;
  watermarked: boolean;
}

export interface DataRequest {
  id: string;
  requesterName: string;
  requesterType: string;
  requestedDocs: string;
  status: 'pending' | 'approved' | 'denied' | 'fulfilled';
  submittedAt: string;
  respondedAt?: string;
  notes?: string;
}

export interface DataRoomAudit {
  id: string;
  action: 'view' | 'download' | 'share' | 'upload' | 'version_update' | 'access_grant';
  actor: string;
  docTitle: string;
  timestamp: string;
  ipHint?: string;
}

// =============================================================================
// SUB-TAB DEFINITIONS
// =============================================================================

export const DATA_ROOM_SUB_TABS: { id: DataRoomSubTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'library', label: 'Library' },
  { id: 'versioning', label: 'Versioning' },
  { id: 'packets', label: 'Packets' },
  { id: 'requests', label: 'Requests' },
  { id: 'audit', label: 'Audit' },
  { id: 'builder', label: 'Builder' },
];

// =============================================================================
// CATEGORY DEFINITIONS
// =============================================================================

export interface DocCategoryDef {
  id: DocCategory;
  label: string;
  color: string;
  icon: string;
}

export const DOC_CATEGORIES: DocCategoryDef[] = [
  { id: 'pitch', label: 'Corporate & Governance', color: '#FFFFFF', icon: 'megaphone.fill' },
  { id: 'financial', label: 'Finance', color: '#2FE38C', icon: 'dollarsign.circle.fill' },
  { id: 'legal', label: 'Legal', color: '#FFB020', icon: 'doc.text.fill' },
  { id: 'product', label: 'Product', color: '#6AA9FF', icon: 'app.fill' },
  { id: 'governance', label: 'Governance', color: '#8F8F8F', icon: 'building.columns.fill' },
  { id: 'team', label: 'Operations', color: '#B8C0CC', icon: 'person.2.fill' },
  { id: 'proof', label: 'Proof', color: '#FF4D4D', icon: 'checkmark.seal.fill' },
  { id: 'compliance', label: 'Compliance', color: '#E8A838', icon: 'checkmark.shield.fill' },
  { id: 'payment_rails', label: 'Payment Rails', color: '#34C759', icon: 'creditcard.fill' },
  { id: 'media_proof', label: 'Media/Proof', color: '#AF52DE', icon: 'play.rectangle.fill' },
];

// =============================================================================
// OVERVIEW STATS
// =============================================================================

export const DATA_ROOM_STATS: DataRoomStats = {
  totalDocs: 12,
  categories: 10,
  pendingRequests: 3,
  lastUpdated: 'Feb 14, 2026',
  accessLog7d: 47,
};

// =============================================================================
// DOCUMENTS (12 across 7 categories)
// =============================================================================

export const DATA_ROOM_DOCUMENTS: DataRoomDocument[] = [
  // Pitch (2)
  {
    id: 'doc-001',
    title: 'KaNeXT Deck v3.1',
    category: 'pitch',
    version: '3.1',
    status: 'current',
    updatedAt: 'Feb 12, 2026',
    updatedBy: 'Alex Morgan',
    accessLevel: 'retail',
    watermarked: true,
    fileType: 'pptx',
    size: '8.4 MB',
  },
  {
    id: 'doc-002',
    title: '2-Page Memo',
    category: 'pitch',
    version: '2.0',
    status: 'current',
    updatedAt: 'Feb 10, 2026',
    updatedBy: 'Alex Morgan',
    accessLevel: 'public',
    watermarked: false,
    fileType: 'pdf',
    size: '420 KB',
  },
  // Financial (2)
  {
    id: 'doc-003',
    title: 'Financial Model — 5yr',
    category: 'financial',
    version: '4.2',
    status: 'current',
    updatedAt: 'Feb 14, 2026',
    updatedBy: 'Alex Morgan',
    accessLevel: 'board',
    watermarked: true,
    fileType: 'xlsx',
    size: '1.2 MB',
  },
  {
    id: 'doc-004',
    title: 'Cap Table — Current',
    category: 'financial',
    version: '6.0',
    status: 'current',
    updatedAt: 'Feb 8, 2026',
    updatedBy: 'Alex Morgan',
    accessLevel: 'founder',
    watermarked: true,
    fileType: 'xlsx',
    size: '340 KB',
  },
  // Legal (2)
  {
    id: 'doc-005',
    title: 'Entity Structure',
    category: 'legal',
    version: '1.3',
    status: 'current',
    updatedAt: 'Jan 28, 2026',
    updatedBy: 'Alex Morgan',
    accessLevel: 'board',
    watermarked: false,
    fileType: 'pdf',
    size: '780 KB',
  },
  {
    id: 'doc-006',
    title: 'SAFE Agreement — Template',
    category: 'legal',
    version: '2.1',
    status: 'current',
    updatedAt: 'Jan 15, 2026',
    updatedBy: 'Alex Morgan',
    accessLevel: 'retail',
    watermarked: true,
    fileType: 'pdf',
    size: '540 KB',
  },
  // Product (1)
  {
    id: 'doc-007',
    title: 'Product Demo Guide',
    category: 'product',
    version: '1.5',
    status: 'current',
    updatedAt: 'Feb 6, 2026',
    updatedBy: 'Marcus Chen',
    accessLevel: 'retail',
    watermarked: false,
    fileType: 'pdf',
    size: '2.1 MB',
  },
  // Governance (2)
  {
    id: 'doc-008',
    title: 'Board Deck Q1 2026',
    category: 'governance',
    version: '1.0',
    status: 'current',
    updatedAt: 'Feb 3, 2026',
    updatedBy: 'Alex Morgan',
    accessLevel: 'board',
    watermarked: true,
    fileType: 'pptx',
    size: '5.6 MB',
  },
  {
    id: 'doc-009',
    title: 'Compliance Pack',
    category: 'governance',
    version: '1.1',
    status: 'draft',
    updatedAt: 'Feb 11, 2026',
    updatedBy: 'Jordan Hayes',
    accessLevel: 'founder',
    watermarked: false,
    fileType: 'pdf',
    size: '920 KB',
  },
  // Team (1)
  {
    id: 'doc-010',
    title: 'Team Bios',
    category: 'team',
    version: '2.3',
    status: 'current',
    updatedAt: 'Feb 1, 2026',
    updatedBy: 'Alex Morgan',
    accessLevel: 'public',
    watermarked: false,
    fileType: 'pdf',
    size: '1.8 MB',
  },
  // Proof (2)
  {
    id: 'doc-011',
    title: 'KaNeXT Case Study',
    category: 'proof',
    version: '1.2',
    status: 'current',
    updatedAt: 'Jan 30, 2026',
    updatedBy: 'Jordan Hayes',
    accessLevel: 'retail',
    watermarked: false,
    fileType: 'pdf',
    size: '3.4 MB',
  },
  {
    id: 'doc-012',
    title: 'IP Portfolio Summary',
    category: 'proof',
    version: '1.0',
    status: 'outdated',
    updatedAt: 'Dec 18, 2025',
    updatedBy: 'Alex Morgan',
    accessLevel: 'board',
    watermarked: true,
    fileType: 'docx',
    size: '610 KB',
  },
];

// =============================================================================
// VERSION HISTORY (8 entries)
// =============================================================================

export const VERSION_HISTORY: VersionEntry[] = [
  {
    id: 'ver-001',
    docId: 'doc-003',
    docTitle: 'Financial Model — 5yr',
    version: '4.2',
    changedBy: 'Alex Morgan',
    changedAt: 'Feb 14, 2026',
    changeType: 'minor',
    summary: 'Updated Q1 actuals and revised runway projections based on latest burn.',
  },
  {
    id: 'ver-002',
    docId: 'doc-001',
    docTitle: 'KaNeXT Deck v3.1',
    version: '3.1',
    changedBy: 'Alex Morgan',
    changedAt: 'Feb 12, 2026',
    changeType: 'minor',
    summary: 'Refreshed traction slide with KaNeXT media value data and updated team slide.',
  },
  {
    id: 'ver-003',
    docId: 'doc-009',
    docTitle: 'Compliance Pack',
    version: '1.1',
    changedBy: 'Jordan Hayes',
    changedAt: 'Feb 11, 2026',
    changeType: 'patch',
    summary: 'Corrected DE registration date and added KaNeXT Church data handling addendum.',
  },
  {
    id: 'ver-004',
    docId: 'doc-002',
    docTitle: '2-Page Memo',
    version: '2.0',
    changedBy: 'Alex Morgan',
    changedAt: 'Feb 10, 2026',
    changeType: 'major',
    summary: 'Complete rewrite — new narrative structure, updated financials, added proof wedge summary.',
  },
  {
    id: 'ver-005',
    docId: 'doc-004',
    docTitle: 'Cap Table — Current',
    version: '6.0',
    changedBy: 'Alex Morgan',
    changedAt: 'Feb 8, 2026',
    changeType: 'major',
    summary: 'Post-SAFE conversion reflecting new investor shares and updated option pool.',
  },
  {
    id: 'ver-006',
    docId: 'doc-007',
    docTitle: 'Product Demo Guide',
    version: '1.5',
    changedBy: 'Marcus Chen',
    changedAt: 'Feb 6, 2026',
    changeType: 'minor',
    summary: 'Added Nexus v2 demo walkthrough and updated screenshot assets.',
  },
  {
    id: 'ver-007',
    docId: 'doc-010',
    docTitle: 'Team Bios',
    version: '2.3',
    changedBy: 'Alex Morgan',
    changedAt: 'Feb 1, 2026',
    changeType: 'patch',
    summary: 'Updated Jordan Hayes title to Head of BD. Fixed Adriana headshot link.',
  },
  {
    id: 'ver-008',
    docId: 'doc-011',
    docTitle: 'KaNeXT Case Study',
    version: '1.2',
    changedBy: 'Jordan Hayes',
    changedAt: 'Jan 30, 2026',
    changeType: 'minor',
    summary: 'Added media value comparison charts and Season 1 results appendix.',
  },
];

// =============================================================================
// DATA PACKETS (4)
// =============================================================================

export const DATA_PACKETS: DataPacket[] = [
  {
    id: 'pkt-001',
    title: 'Retail Investor Pack',
    description: 'Curated bundle for angel and retail investors — pitch deck, 2-page memo, product demo, KaNeXT case study, team bios, and SAFE template.',
    docCount: 6,
    audience: 'retail',
    status: 'active',
    createdAt: 'Feb 12, 2026',
    expiresAt: 'May 12, 2026',
    watermarked: true,
  },
  {
    id: 'pkt-002',
    title: 'Board Pack',
    description: 'Full board-level packet including financials, cap table, entity structure, board deck, compliance pack, and IP portfolio summary.',
    docCount: 8,
    audience: 'board',
    status: 'active',
    createdAt: 'Feb 3, 2026',
    watermarked: true,
  },
  {
    id: 'pkt-003',
    title: 'Partner Overview',
    description: 'Lightweight overview for potential strategic partners — deck, product guide, and proof wedge case study.',
    docCount: 3,
    audience: 'partner',
    status: 'active',
    createdAt: 'Jan 20, 2026',
    expiresAt: 'Apr 20, 2026',
    watermarked: false,
  },
  {
    id: 'pkt-004',
    title: 'Public Info Pack',
    description: 'Public-facing documents — 2-page memo and team bios. No sensitive data.',
    docCount: 2,
    audience: 'retail',
    status: 'draft',
    createdAt: 'Feb 15, 2026',
    watermarked: false,
  },
];

// =============================================================================
// DATA REQUESTS (5)
// =============================================================================

export const DATA_REQUESTS: DataRequest[] = [
  {
    id: 'req-001',
    requesterName: 'Patrick Bet-David',
    requesterType: 'Strategic Advisor',
    requestedDocs: 'Financial Model, Cap Table',
    status: 'approved',
    submittedAt: 'Feb 10, 2026',
    respondedAt: 'Feb 10, 2026',
    notes: 'Board-level access granted per advisory agreement.',
  },
  {
    id: 'req-002',
    requesterName: 'Tom Ellsworth',
    requesterType: 'Board Observer',
    requestedDocs: 'Board Deck Q1, Compliance Pack',
    status: 'fulfilled',
    submittedAt: 'Feb 4, 2026',
    respondedAt: 'Feb 5, 2026',
  },
  {
    id: 'req-003',
    requesterName: 'Mia Torres',
    requesterType: 'Angel Investor',
    requestedDocs: 'KaNeXT Deck v3.1, Financial Model',
    status: 'pending',
    submittedAt: 'Feb 13, 2026',
    notes: 'Referred via Valuetainment network. Wants to review before call.',
  },
  {
    id: 'req-004',
    requesterName: 'David Chen Capital',
    requesterType: 'VC Fund',
    requestedDocs: 'Full Retail Investor Pack + Entity Structure',
    status: 'pending',
    submittedAt: 'Feb 15, 2026',
    notes: 'Seed-stage fund, Series A focus. Warm intro from Jordan.',
  },
  {
    id: 'req-005',
    requesterName: 'Carlos Rivera',
    requesterType: 'Angel Investor',
    requestedDocs: 'Cap Table',
    status: 'denied',
    submittedAt: 'Feb 7, 2026',
    respondedAt: 'Feb 8, 2026',
    notes: 'Cap table access restricted to board-level. Offered retail pack instead.',
  },
];

// =============================================================================
// AUDIT LOG (10 entries)
// =============================================================================

export const DATA_ROOM_AUDIT_LOG: DataRoomAudit[] = [
  {
    id: 'aud-001',
    action: 'upload',
    actor: 'Alex Morgan',
    docTitle: 'Financial Model — 5yr',
    timestamp: 'Feb 14, 2026 — 2:14 PM',
    ipHint: '192.168.x.x',
  },
  {
    id: 'aud-002',
    action: 'version_update',
    actor: 'Alex Morgan',
    docTitle: 'KaNeXT Deck v3.1',
    timestamp: 'Feb 12, 2026 — 11:30 AM',
  },
  {
    id: 'aud-003',
    action: 'download',
    actor: 'Patrick Bet-David',
    docTitle: 'Financial Model — 5yr',
    timestamp: 'Feb 11, 2026 — 9:45 AM',
    ipHint: '10.0.x.x',
  },
  {
    id: 'aud-004',
    action: 'view',
    actor: 'Tom Ellsworth',
    docTitle: 'Board Deck Q1 2026',
    timestamp: 'Feb 10, 2026 — 4:20 PM',
  },
  {
    id: 'aud-005',
    action: 'share',
    actor: 'Jordan Hayes',
    docTitle: 'KaNeXT Deck v3.1',
    timestamp: 'Feb 10, 2026 — 10:05 AM',
    ipHint: '172.16.x.x',
  },
  {
    id: 'aud-006',
    action: 'access_grant',
    actor: 'Alex Morgan',
    docTitle: 'Financial Model — 5yr',
    timestamp: 'Feb 10, 2026 — 9:50 AM',
  },
  {
    id: 'aud-007',
    action: 'view',
    actor: 'Mia Torres',
    docTitle: '2-Page Memo',
    timestamp: 'Feb 9, 2026 — 3:12 PM',
  },
  {
    id: 'aud-008',
    action: 'download',
    actor: 'Tom Ellsworth',
    docTitle: 'Compliance Pack',
    timestamp: 'Feb 8, 2026 — 11:00 AM',
    ipHint: '10.0.x.x',
  },
  {
    id: 'aud-009',
    action: 'upload',
    actor: 'Jordan Hayes',
    docTitle: 'KaNeXT Case Study',
    timestamp: 'Jan 30, 2026 — 5:45 PM',
  },
  {
    id: 'aud-010',
    action: 'view',
    actor: 'David Chen Capital',
    docTitle: 'Team Bios',
    timestamp: 'Jan 28, 2026 — 1:30 PM',
    ipHint: '192.168.x.x',
  },
];
