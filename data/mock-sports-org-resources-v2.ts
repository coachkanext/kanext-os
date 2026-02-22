/**
 * Sports Organization Resources V2 — Mock Data & Types
 * Carroll College Fighting Saints Men's Basketball program resource management: packs, role kits,
 * templates, knowledge base, and review flags.
 */

// =============================================================================
// TYPES
// =============================================================================

export type PackCategory =
  | 'sop'
  | 'travel'
  | 'recruiting'
  | 'gameday'
  | 'compliance';

export type RoleKitItemType = 'checklist' | 'template' | 'script' | 'protocol';

export type KnowledgeBaseCategory =
  | 'recruiting'
  | 'ops'
  | 'medical'
  | 'compliance'
  | 'game-ops';

export type ReviewFlagReason =
  | 'stale'
  | 'missing-owner'
  | 'duplicate'
  | 'unacknowledged';

// =============================================================================
// SUB-TAB DEFINITION
// =============================================================================

export type ResourcesSubTabId =
  | 'overview'
  | 'packs'
  | 'role-kits'
  | 'templates'
  | 'knowledge-base'
  | 'review-flags';

export interface ResourcesSubTab {
  id: ResourcesSubTabId;
  label: string;
}

export const RESOURCES_SUB_TABS: ResourcesSubTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'packs', label: 'Packs' },
  { id: 'role-kits', label: 'Role Kits' },
  { id: 'templates', label: 'Templates' },
  { id: 'knowledge-base', label: 'Knowledge Base' },
  { id: 'review-flags', label: 'Review Flags' },
];

// =============================================================================
// INTERFACES
// =============================================================================

export interface ResourcePack {
  id: string;
  name: string;
  owner: string;
  lastUpdated: string;
  requiredRead: boolean;
  category: PackCategory;
  documentCount: number;
  /** Short description of what this pack contains */
  description?: string;
  /** SF Symbol or icon identifier */
  icon?: string;
  /** Whether this pack is pinned as an essential */
  pinned?: boolean;
  /** Data provenance tag */
  data_source?: string;
}

export interface RoleKitItem {
  type: RoleKitItemType;
  name: string;
}

export interface RoleKit {
  id: string;
  seatTitle: string;
  items: RoleKitItem[];
  lastUpdated: string;
  /** Data provenance tag */
  data_source?: string;
}

export interface ResourceTemplate {
  id: string;
  name: string;
  category: string;
  lastUsed: string;
  usageCount: number;
  owner: string;
}

export interface KnowledgeBaseItem {
  id: string;
  title: string;
  category: KnowledgeBaseCategory;
  owner: string;
  lastUpdated: string;
  requiredRead: boolean;
  viewCount: number;
}

export interface ReviewFlag {
  id: string;
  resourceName: string;
  reason: ReviewFlagReason;
  flagDate: string;
  daysStale: number | null;
}

export interface ResourcesOverview {
  total: number;
  pinned: number;
  updatedRecently: number;
  stale: number;
  templates: number;
}

// =============================================================================
// LABELS & COLORS
// =============================================================================

export const PACK_CATEGORY_LABEL: Record<PackCategory, string> = {
  sop: 'SOP',
  travel: 'Travel',
  recruiting: 'Recruiting',
  gameday: 'Game Day',
  compliance: 'Compliance',
};

export const PACK_CATEGORY_COLOR: Record<PackCategory, string> = {
  sop: '#1D9BF0',
  travel: '#1D9BF0',
  recruiting: '#22c55e',
  gameday: '#f59e0b',
  compliance: '#ef4444',
};

export const ROLE_KIT_ITEM_TYPE_LABEL: Record<RoleKitItemType, string> = {
  checklist: 'Checklist',
  template: 'Template',
  script: 'Script',
  protocol: 'Protocol',
};

export const ROLE_KIT_ITEM_TYPE_COLOR: Record<RoleKitItemType, string> = {
  checklist: '#1D9BF0',
  template: '#22c55e',
  script: '#f59e0b',
  protocol: '#1D9BF0',
};

export const KB_CATEGORY_LABEL: Record<KnowledgeBaseCategory, string> = {
  recruiting: 'Recruiting',
  ops: 'Operations',
  medical: 'Medical',
  compliance: 'Compliance',
  'game-ops': 'Game Ops',
};

export const KB_CATEGORY_COLOR: Record<KnowledgeBaseCategory, string> = {
  recruiting: '#22c55e',
  ops: '#1D9BF0',
  medical: '#ef4444',
  compliance: '#f59e0b',
  'game-ops': '#1D9BF0',
};

export const REVIEW_FLAG_REASON_LABEL: Record<ReviewFlagReason, string> = {
  stale: 'Stale',
  'missing-owner': 'Missing Owner',
  duplicate: 'Duplicate',
  unacknowledged: 'Unacknowledged',
};

export const REVIEW_FLAG_REASON_COLOR: Record<ReviewFlagReason, string> = {
  stale: '#f59e0b',
  'missing-owner': '#ef4444',
  duplicate: '#A1A1AA',
  unacknowledged: '#1D9BF0',
};

// =============================================================================
// MOCK DATA — RESOURCE PACKS (5)
// =============================================================================

const resourcePacks: ResourcePack[] = [
  // ── Pinned Essentials (5) ──────────────────────────────────────────────
  {
    id: 'rp-001',
    name: 'Program SOP Pack',
    description:
      'Master standard-operating-procedures for Carroll College MBB — practice structure, player conduct, facility usage, equipment checkout, and staff communication protocols.',
    icon: 'doc.text.fill',
    owner: 'Alex Morgan',
    lastUpdated: '2026-02-12',
    requiredRead: true,
    category: 'sop',
    documentCount: 9,
    pinned: true,
    data_source: 'demo_seed',
  },
  {
    id: 'rp-002',
    name: 'Travel Pack',
    description:
      'Road-trip playbook: charter bus logistics, hotel rooming lists, meal-per-diem guidelines, travel-day itinerary template, and emergency contacts for Frontier Conference away games.',
    icon: 'bus.fill',
    owner: 'Marcus Reed',
    lastUpdated: '2026-02-10',
    requiredRead: true,
    category: 'travel',
    documentCount: 7,
    pinned: true,
    data_source: 'demo_seed',
  },
  {
    id: 'rp-003',
    name: 'Recruiting Pack',
    description:
      'Spring evaluation-period recruiting SOPs — prospect evaluation rubrics, contact-log templates, official-visit checklists, NAIA eligibility requirements, and scholarship offer workflows.',
    icon: 'person.badge.plus',
    owner: 'Alex Morgan',
    lastUpdated: '2026-02-05',
    requiredRead: true,
    category: 'recruiting',
    documentCount: 6,
    pinned: true,
    data_source: 'demo_seed',
  },
  {
    id: 'rp-004',
    name: 'Game Day Pack',
    description:
      'Everything for tipoff at Lehman Center — pre-game timeline, warm-up protocol, bench assignments, halftime adjustment template, postgame media procedures, and stat-sheet distribution.',
    icon: 'sportscourt.fill',
    owner: 'Marcus Reed',
    lastUpdated: '2026-02-15',
    requiredRead: true,
    category: 'gameday',
    documentCount: 8,
    pinned: true,
    data_source: 'demo_seed',
  },
  {
    id: 'rp-005',
    name: 'Compliance Pack',
    description:
      'NAIA and Frontier Conference compliance quick-reference — eligibility rules, academic progress checks, financial-aid reporting, scholarship renewal guidelines, and transfer-portal procedures.',
    icon: 'checkmark.shield.fill',
    owner: 'Alex Morgan',
    lastUpdated: '2026-01-28',
    requiredRead: true,
    category: 'compliance',
    documentCount: 5,
    pinned: true,
    data_source: 'demo_seed',
  },
];

// =============================================================================
// MOCK DATA — ROLE KITS (8)
// =============================================================================

const roleKits: RoleKit[] = [
  {
    id: 'rk-001',
    seatTitle: 'Head Coach',
    items: [
      { type: 'checklist', name: 'Pre-Season Program Setup Checklist' },
      { type: 'template', name: 'Practice Plan Template' },
      { type: 'protocol', name: 'Game Day Decision Protocol' },
      { type: 'script', name: 'Media Interview Prep Script' },
      { type: 'protocol', name: 'Recruiting Strategy & Offer Protocol' },
      { type: 'checklist', name: 'End-of-Season Evaluation Checklist' },
    ],
    lastUpdated: '2026-02-10',
    data_source: 'demo_seed',
  },
  {
    id: 'rk-002',
    seatTitle: 'Assistant Coach',
    items: [
      { type: 'checklist', name: 'Opponent Scouting Checklist' },
      { type: 'template', name: 'Scout Report Template' },
      { type: 'protocol', name: 'Halftime Adjustment Protocol' },
      { type: 'template', name: 'Player Development Plan Template' },
      { type: 'checklist', name: 'Weekly Workout Checklist' },
      { type: 'protocol', name: 'Skill Evaluation Protocol' },
    ],
    lastUpdated: '2026-02-08',
    data_source: 'demo_seed',
  },
  {
    id: 'rk-003',
    seatTitle: 'Operations',
    items: [
      { type: 'checklist', name: 'Travel Coordination Checklist' },
      { type: 'template', name: 'Travel Itinerary Template' },
      { type: 'script', name: 'Hotel & Bus Booking Script' },
      { type: 'protocol', name: 'Equipment Inventory Protocol' },
      { type: 'checklist', name: 'Game Day Setup Checklist' },
      { type: 'template', name: 'Budget Request Template' },
    ],
    lastUpdated: '2026-02-12',
    data_source: 'demo_seed',
  },
  {
    id: 'rk-004',
    seatTitle: 'Director of Basketball Operations',
    items: [
      { type: 'checklist', name: 'Travel Coordination Checklist' },
      { type: 'template', name: 'Travel Itinerary Template' },
      { type: 'script', name: 'Hotel & Bus Booking Script' },
      { type: 'protocol', name: 'Equipment Inventory Protocol' },
    ],
    lastUpdated: '2026-02-05',
  },
  {
    id: 'rk-005',
    seatTitle: 'Athletic Trainer',
    items: [
      { type: 'protocol', name: 'Concussion Protocol' },
      { type: 'checklist', name: 'Pre-Game Medical Kit Checklist' },
      { type: 'template', name: 'Injury Report Template' },
    ],
    lastUpdated: '2026-01-28',
  },
  {
    id: 'rk-006',
    seatTitle: 'Strength & Conditioning Coach',
    items: [
      { type: 'template', name: 'Lift Session Template' },
      { type: 'protocol', name: 'Weight Room Safety Protocol' },
      { type: 'checklist', name: 'Pre-Season Testing Checklist' },
    ],
    lastUpdated: '2026-01-15',
  },
  {
    id: 'rk-007',
    seatTitle: 'Video Coordinator',
    items: [
      { type: 'checklist', name: 'Camera Setup Checklist' },
      { type: 'template', name: 'Film Tagging Template' },
      { type: 'protocol', name: 'Hudl Upload Protocol' },
    ],
    lastUpdated: '2026-02-08',
  },
  {
    id: 'rk-008',
    seatTitle: 'Recruiting Coordinator',
    items: [
      { type: 'checklist', name: 'Prospect Evaluation Checklist' },
      { type: 'template', name: 'Recruiting Contact Log Template' },
      { type: 'script', name: 'Initial Phone Call Script' },
      { type: 'protocol', name: 'Official Visit Protocol' },
    ],
    lastUpdated: '2026-02-01',
  },
];

// =============================================================================
// MOCK DATA — TEMPLATES (6)
// =============================================================================

const templates: ResourceTemplate[] = [
  {
    id: 'tmpl-001',
    name: 'Practice Plan Template',
    category: 'Practice',
    lastUsed: '2026-02-14',
    usageCount: 42,
    owner: 'Alex Morgan',
  },
  {
    id: 'tmpl-002',
    name: 'Scout Report Template',
    category: 'Scouting',
    lastUsed: '2026-02-10',
    usageCount: 18,
    owner: 'Marcus Reed',
  },
  {
    id: 'tmpl-003',
    name: 'Travel Itinerary Template',
    category: 'Operations',
    lastUsed: '2026-02-05',
    usageCount: 12,
    owner: 'Marcus Reed',
  },
  {
    id: 'tmpl-004',
    name: 'Player Development Plan Template',
    category: 'Development',
    lastUsed: '2026-01-30',
    usageCount: 8,
    owner: 'Tanya Brooks',
  },
  {
    id: 'tmpl-005',
    name: 'Halftime Adjustment Packet Template',
    category: 'Game Plan',
    lastUsed: '2026-02-08',
    usageCount: 15,
    owner: 'Alex Morgan',
  },
  {
    id: 'tmpl-006',
    name: 'Recruiting Eval Snapshot Template',
    category: 'Recruiting',
    lastUsed: '2026-01-22',
    usageCount: 6,
    owner: 'Marcus Reed',
  },
];

// =============================================================================
// MOCK DATA — KNOWLEDGE BASE (10)
// =============================================================================

const knowledgeBase: KnowledgeBaseItem[] = [
  {
    id: 'kb-001',
    title: 'NCCAA Eligibility Rules — Quick Reference',
    category: 'compliance',
    owner: 'Alex Morgan',
    lastUpdated: '2026-01-15',
    requiredRead: true,
    viewCount: 34,
  },
  {
    id: 'kb-002',
    title: 'Transfer Portal Process & Timeline',
    category: 'recruiting',
    owner: 'Alex Morgan',
    lastUpdated: '2026-02-01',
    requiredRead: true,
    viewCount: 22,
  },
  {
    id: 'kb-003',
    title: 'Concussion Protocol — Staff Guidelines',
    category: 'medical',
    owner: 'Dr. Thompson',
    lastUpdated: '2026-01-28',
    requiredRead: true,
    viewCount: 18,
  },
  {
    id: 'kb-004',
    title: 'Game Day Operations Timeline',
    category: 'game-ops',
    owner: 'Marcus Reed',
    lastUpdated: '2026-02-10',
    requiredRead: false,
    viewCount: 45,
  },
  {
    id: 'kb-005',
    title: 'Road Trip Logistics Playbook',
    category: 'ops',
    owner: 'Marcus Reed',
    lastUpdated: '2026-02-05',
    requiredRead: false,
    viewCount: 28,
  },
  {
    id: 'kb-006',
    title: 'Scholarship Disbursement Process',
    category: 'compliance',
    owner: 'Tanya Brooks',
    lastUpdated: '2026-01-20',
    requiredRead: false,
    viewCount: 12,
  },
  {
    id: 'kb-007',
    title: 'Recruiting Contact Log — Best Practices',
    category: 'recruiting',
    owner: 'Marcus Reed',
    lastUpdated: '2026-01-25',
    requiredRead: false,
    viewCount: 16,
  },
  {
    id: 'kb-008',
    title: 'Weight Room Safety & Emergency Procedures',
    category: 'medical',
    owner: 'Coach Pearson',
    lastUpdated: '2025-12-10',
    requiredRead: true,
    viewCount: 20,
  },
  {
    id: 'kb-009',
    title: 'Media Interview Protocol for Coaches',
    category: 'ops',
    owner: 'Alex Morgan',
    lastUpdated: '2026-01-08',
    requiredRead: false,
    viewCount: 9,
  },
  {
    id: 'kb-010',
    title: 'Hudl Film Tagging Standards',
    category: 'game-ops',
    owner: 'Coach Davis',
    lastUpdated: '2026-02-08',
    requiredRead: false,
    viewCount: 31,
  },
];

// =============================================================================
// MOCK DATA — REVIEW FLAGS (4)
// =============================================================================

const reviewFlags: ReviewFlag[] = [
  {
    id: 'rf-001',
    resourceName: 'Weight Room Safety & Emergency Procedures',
    reason: 'stale',
    flagDate: '2026-02-10',
    daysStale: 70,
  },
  {
    id: 'rf-002',
    resourceName: 'Equipment Checkout SOP',
    reason: 'missing-owner',
    flagDate: '2026-02-05',
    daysStale: null,
  },
  {
    id: 'rf-003',
    resourceName: 'Travel Conduct Policy (Duplicate)',
    reason: 'duplicate',
    flagDate: '2026-02-08',
    daysStale: null,
  },
  {
    id: 'rf-004',
    resourceName: 'Code of Conduct Re-Acknowledgment — Mid-Season',
    reason: 'unacknowledged',
    flagDate: '2026-02-14',
    daysStale: null,
  },
];

// =============================================================================
// GETTER
// =============================================================================

export function getResourcesOverview(): ResourcesOverview {
  const allResources = [
    ...resourcePacks,
    ...knowledgeBase,
    ...templates,
  ];
  const total = allResources.length;

  const pinned = resourcePacks.filter((p) => p.requiredRead).length +
    knowledgeBase.filter((k) => k.requiredRead).length;

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const updatedRecently = allResources.filter((r) => {
    const updated = 'lastUpdated' in r ? r.lastUpdated : ('lastUsed' in r ? r.lastUsed : '');
    return new Date(updated) >= fourteenDaysAgo;
  }).length;

  const stale = reviewFlags.filter((f) => f.reason === 'stale').length;

  return {
    total,
    pinned,
    updatedRecently,
    stale,
    templates: templates.length,
  };
}

export function getResourcePacks(): ResourcePack[] {
  return resourcePacks;
}

export function getRoleKits(): RoleKit[] {
  return roleKits;
}

export function getResourceTemplates(): ResourceTemplate[] {
  return templates;
}

export function getKnowledgeBase(): KnowledgeBaseItem[] {
  return knowledgeBase;
}

export function getReviewFlags(): ReviewFlag[] {
  return reviewFlags;
}
