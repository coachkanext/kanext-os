/**
 * Mock Business Explore Grid — Flat tile data for 2-column grid discovery.
 *
 * Types: Executive | Promotional | Capital | Product | Board | Internal
 * Visibility: 0 = Public, 1 = Internal, 2 = Board, 3 = Executive
 * Pinning: isPinned + pinnedOrder for manual founder-controlled ranking.
 * Multi-entity: Apex Ventures (primary) + NovaTech Solutions (secondary).
 */

// =============================================================================
// TYPES
// =============================================================================

export type BizExploreType =
  | 'Executive'
  | 'Promotional'
  | 'Capital'
  | 'Product'
  | 'Board'
  | 'Internal';

export const BIZ_EXPLORE_TYPES: BizExploreType[] = [
  'Executive',
  'Promotional',
  'Capital',
  'Product',
  'Board',
  'Internal',
];

export type BizVisibilityClass = 0 | 1 | 2 | 3;

export const VISIBILITY_LABELS: Record<BizVisibilityClass, string> = {
  0: 'Public',
  1: 'Internal',
  2: 'Board',
  3: 'Executive',
};

export const VISIBILITY_COLORS: Record<BizVisibilityClass, string> = {
  0: '#22C55E',
  1: '#1D9BF0',
  2: '#F59E0B',
  3: '#EF4444',
};

export const TYPE_COLORS: Record<BizExploreType, string> = {
  Executive: '#8B5CF6',
  Promotional: '#22C55E',
  Capital: '#F59E0B',
  Product: '#1D9BF0',
  Board: '#EF4444',
  Internal: '#A1A1AA',
};

export interface BizExploreTile {
  id: string;
  title: string;
  type: BizExploreType;
  entityName: string;
  entityId: string;
  speaker?: string;
  dealName?: string;
  tag?: string;
  visibilityClass: BizVisibilityClass;
  publishedAt: Date;
  duration: string;
  thumbnailColor: string;
  isPinned: boolean;
  pinnedOrder?: number;
}

// =============================================================================
// MOCK TILES (~22 items)
// =============================================================================

export const BIZ_EXPLORE_TILES: BizExploreTile[] = [
  // ── Pinned ──────────────────────────────────────────────────────────────
  {
    id: 'bxt-01',
    title: 'Q4 2025 Investor Update',
    type: 'Capital',
    entityName: 'Apex Ventures',
    entityId: 'ent-apex',
    speaker: 'Marcus Chen',
    dealName: 'Series B',
    visibilityClass: 0,
    publishedAt: new Date('2026-02-20'),
    duration: '18:32',
    thumbnailColor: '#1A3A5C',
    isPinned: true,
    pinnedOrder: 1,
  },
  {
    id: 'bxt-02',
    title: 'Company All-Hands — February 2026',
    type: 'Internal',
    entityName: 'Apex Ventures',
    entityId: 'ent-apex',
    speaker: 'Marcus Chen',
    visibilityClass: 1,
    publishedAt: new Date('2026-02-18'),
    duration: '42:15',
    thumbnailColor: '#2D3748',
    isPinned: true,
    pinnedOrder: 2,
  },

  // ── Public (V0) ────────────────────────────────────────────────────────
  {
    id: 'bxt-03',
    title: 'Apex Platform — Product Launch Demo',
    type: 'Product',
    entityName: 'Apex Ventures',
    entityId: 'ent-apex',
    speaker: 'Priya Sharma',
    tag: 'Launch',
    visibilityClass: 0,
    publishedAt: new Date('2026-02-24'),
    duration: '14:08',
    thumbnailColor: '#1D4ED8',
    isPinned: false,
  },
  {
    id: 'bxt-04',
    title: 'Brand Story — Building the Future of Commerce',
    type: 'Promotional',
    entityName: 'Apex Ventures',
    entityId: 'ent-apex',
    visibilityClass: 0,
    publishedAt: new Date('2026-02-22'),
    duration: '3:45',
    thumbnailColor: '#0F766E',
    isPinned: false,
  },
  {
    id: 'bxt-05',
    title: 'NovaTech AI Suite — Demo Reel',
    type: 'Product',
    entityName: 'NovaTech Solutions',
    entityId: 'ent-nova',
    speaker: 'Jamal Edwards',
    tag: 'AI',
    visibilityClass: 0,
    publishedAt: new Date('2026-02-21'),
    duration: '8:22',
    thumbnailColor: '#7C3AED',
    isPinned: false,
  },
  {
    id: 'bxt-06',
    title: 'Partnership Announcement — Apex x NovaTech',
    type: 'Promotional',
    entityName: 'Apex Ventures',
    entityId: 'ent-apex',
    dealName: 'NovaTech Partnership',
    visibilityClass: 0,
    publishedAt: new Date('2026-02-15'),
    duration: '6:10',
    thumbnailColor: '#059669',
    isPinned: false,
  },
  {
    id: 'bxt-07',
    title: 'NovaTech Customer Testimonials — Q1 2026',
    type: 'Promotional',
    entityName: 'NovaTech Solutions',
    entityId: 'ent-nova',
    visibilityClass: 0,
    publishedAt: new Date('2026-02-10'),
    duration: '5:30',
    thumbnailColor: '#1E40AF',
    isPinned: false,
  },
  {
    id: 'bxt-08',
    title: 'Apex Ventures — Pitch Deck Walkthrough',
    type: 'Capital',
    entityName: 'Apex Ventures',
    entityId: 'ent-apex',
    speaker: 'Marcus Chen',
    dealName: 'Series B',
    visibilityClass: 0,
    publishedAt: new Date('2026-01-28'),
    duration: '22:40',
    thumbnailColor: '#374151',
    isPinned: false,
  },

  // ── Internal (V1) ─────────────────────────────────────────────────────
  {
    id: 'bxt-09',
    title: 'Engineering Sprint Review — Sprint 24',
    type: 'Internal',
    entityName: 'Apex Ventures',
    entityId: 'ent-apex',
    speaker: 'Rachel Kim',
    tag: 'Engineering',
    visibilityClass: 1,
    publishedAt: new Date('2026-02-23'),
    duration: '28:55',
    thumbnailColor: '#1E293B',
    isPinned: false,
  },
  {
    id: 'bxt-10',
    title: 'Sales Team Training — Enterprise Playbook',
    type: 'Internal',
    entityName: 'Apex Ventures',
    entityId: 'ent-apex',
    speaker: 'David Park',
    tag: 'Sales',
    visibilityClass: 1,
    publishedAt: new Date('2026-02-19'),
    duration: '35:12',
    thumbnailColor: '#44403C',
    isPinned: false,
  },
  {
    id: 'bxt-11',
    title: 'Product Roadmap Deep-Dive — H1 2026',
    type: 'Product',
    entityName: 'Apex Ventures',
    entityId: 'ent-apex',
    speaker: 'Priya Sharma',
    tag: 'Roadmap',
    visibilityClass: 1,
    publishedAt: new Date('2026-02-14'),
    duration: '45:00',
    thumbnailColor: '#1D4ED8',
    isPinned: false,
  },
  {
    id: 'bxt-12',
    title: 'NovaTech Onboarding Walkthrough',
    type: 'Internal',
    entityName: 'NovaTech Solutions',
    entityId: 'ent-nova',
    speaker: 'Aisha Okonkwo',
    visibilityClass: 1,
    publishedAt: new Date('2026-02-12'),
    duration: '20:18',
    thumbnailColor: '#334155',
    isPinned: false,
  },
  {
    id: 'bxt-13',
    title: 'Marketing Strategy Review — Q1 2026',
    type: 'Internal',
    entityName: 'Apex Ventures',
    entityId: 'ent-apex',
    speaker: 'Sophie Laurent',
    tag: 'Marketing',
    visibilityClass: 1,
    publishedAt: new Date('2026-02-08'),
    duration: '32:44',
    thumbnailColor: '#292524',
    isPinned: false,
  },

  // ── Board (V2) ────────────────────────────────────────────────────────
  {
    id: 'bxt-14',
    title: 'Board Meeting — February 2026',
    type: 'Board',
    entityName: 'Apex Ventures',
    entityId: 'ent-apex',
    speaker: 'Marcus Chen',
    visibilityClass: 2,
    publishedAt: new Date('2026-02-25'),
    duration: '1:12:30',
    thumbnailColor: '#7F1D1D',
    isPinned: false,
  },
  {
    id: 'bxt-15',
    title: 'Board Resolution — Compensation Committee',
    type: 'Board',
    entityName: 'Apex Ventures',
    entityId: 'ent-apex',
    visibilityClass: 2,
    publishedAt: new Date('2026-02-16'),
    duration: '25:44',
    thumbnailColor: '#6B2121',
    isPinned: false,
  },
  {
    id: 'bxt-16',
    title: 'NovaTech Board Update — Partnership Progress',
    type: 'Board',
    entityName: 'NovaTech Solutions',
    entityId: 'ent-nova',
    speaker: 'Jamal Edwards',
    dealName: 'NovaTech Partnership',
    visibilityClass: 2,
    publishedAt: new Date('2026-02-11'),
    duration: '18:20',
    thumbnailColor: '#78350F',
    isPinned: false,
  },

  // ── Executive (V3) ────────────────────────────────────────────────────
  {
    id: 'bxt-17',
    title: 'CEO Strategy Session — 2026 Priorities',
    type: 'Executive',
    entityName: 'Apex Ventures',
    entityId: 'ent-apex',
    speaker: 'Marcus Chen',
    visibilityClass: 3,
    publishedAt: new Date('2026-02-26'),
    duration: '52:08',
    thumbnailColor: '#4C1D95',
    isPinned: false,
  },
  {
    id: 'bxt-18',
    title: 'CFO Financial Review — Burn Rate & Runway',
    type: 'Executive',
    entityName: 'Apex Ventures',
    entityId: 'ent-apex',
    speaker: 'Helen Tran',
    visibilityClass: 3,
    publishedAt: new Date('2026-02-17'),
    duration: '38:15',
    thumbnailColor: '#581C87',
    isPinned: false,
  },
  {
    id: 'bxt-19',
    title: 'Executive Debrief — Series B Term Sheet',
    type: 'Capital',
    entityName: 'Apex Ventures',
    entityId: 'ent-apex',
    speaker: 'Marcus Chen',
    dealName: 'Series B',
    visibilityClass: 3,
    publishedAt: new Date('2026-02-13'),
    duration: '27:33',
    thumbnailColor: '#1E3A5F',
    isPinned: false,
  },
  {
    id: 'bxt-20',
    title: 'Leadership Offsite Recap — Vision 2027',
    type: 'Executive',
    entityName: 'Apex Ventures',
    entityId: 'ent-apex',
    speaker: 'Marcus Chen',
    visibilityClass: 3,
    publishedAt: new Date('2026-02-06'),
    duration: '1:05:22',
    thumbnailColor: '#3B0764',
    isPinned: false,
  },
  {
    id: 'bxt-21',
    title: 'Acquisition Target Analysis — Confidential',
    type: 'Capital',
    entityName: 'Apex Ventures',
    entityId: 'ent-apex',
    speaker: 'Helen Tran',
    dealName: 'Target Alpha',
    tag: 'M&A',
    visibilityClass: 3,
    publishedAt: new Date('2026-02-03'),
    duration: '33:10',
    thumbnailColor: '#1C1917',
    isPinned: false,
  },
  {
    id: 'bxt-22',
    title: 'NovaTech Integration Planning — Executive Only',
    type: 'Executive',
    entityName: 'NovaTech Solutions',
    entityId: 'ent-nova',
    speaker: 'Jamal Edwards',
    dealName: 'NovaTech Partnership',
    visibilityClass: 3,
    publishedAt: new Date('2026-01-30'),
    duration: '24:50',
    thumbnailColor: '#312E81',
    isPinned: false,
  },
];

// =============================================================================
// HELPERS
// =============================================================================

/** Get unique entity names from a set of tiles. */
export function getEntities(tiles: BizExploreTile[]): string[] {
  return [...new Set(tiles.map((t) => t.entityName))].sort();
}
