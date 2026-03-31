/**
 * Mock flat-tile data for ChurchExplorePageV2 — 2-column grid discovery.
 * Each tile has a visibility class (V0 public, V2 campus-internal, V3 ministry-private).
 */

// =============================================================================
// TYPES
// =============================================================================

export type ChurchExploreType = 'Sermon' | 'Worship' | 'Event' | 'Training' | 'Clip';

export interface ChurchExploreTile {
  id: string;
  title: string;
  type: ChurchExploreType;
  campusName: string;
  campusId: string;
  orgId: string;
  ministryId?: string;
  ministryName?: string;
  speaker?: string;
  visibilityClass: 0 | 2 | 3;
  publishedAt: Date;
  duration: string;
  thumbnailColor: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const CHURCH_EXPLORE_TYPES: ChurchExploreType[] = [
  'Sermon',
  'Worship',
  'Event',
  'Training',
  'Clip',
];

// =============================================================================
// TILE DATA (~20 tiles across types, campuses, visibility levels)
// =============================================================================

export const CHURCH_EXPLORE_TILES: ChurchExploreTile[] = [
  // ── V0 PUBLIC — Main Campus ──
  {
    id: 'cet-1',
    title: 'Walking in Faith',
    type: 'Sermon',
    campusName: 'Main Campus',
    campusId: 'campus-main',
    orgId: 'org-2819church',
    speaker: 'Pastor Philip Anthony Mitchell',
    visibilityClass: 0,
    publishedAt: new Date('2026-02-22T10:00:00'),
    duration: '42:15',
    thumbnailColor: '#1A1714',
  },
  {
    id: 'cet-2',
    title: 'Sunday Morning Worship Set',
    type: 'Worship',
    campusName: 'Main Campus',
    campusId: 'campus-main',
    orgId: 'org-2819church',
    visibilityClass: 0,
    publishedAt: new Date('2026-02-22T11:00:00'),
    duration: '18:30',
    thumbnailColor: '#1A1714',
  },
  {
    id: 'cet-3',
    title: 'The Power of Prayer',
    type: 'Sermon',
    campusName: 'Main Campus',
    campusId: 'campus-main',
    orgId: 'org-2819church',
    speaker: 'Pastor Philip Anthony Mitchell',
    visibilityClass: 0,
    publishedAt: new Date('2026-02-15T10:00:00'),
    duration: '38:20',
    thumbnailColor: '#1A1714',
  },
  {
    id: 'cet-4',
    title: 'Baptism Sunday Highlights',
    type: 'Event',
    campusName: 'Main Campus',
    campusId: 'campus-main',
    orgId: 'org-2819church',
    visibilityClass: 0,
    publishedAt: new Date('2026-02-14T14:00:00'),
    duration: '8:45',
    thumbnailColor: '#5A8A6E',
  },
  {
    id: 'cet-5',
    title: 'Grace Under Pressure',
    type: 'Sermon',
    campusName: 'Main Campus',
    campusId: 'campus-main',
    orgId: 'org-2819church',
    speaker: 'Elder Arik Hayes',
    visibilityClass: 0,
    publishedAt: new Date('2026-02-08T10:00:00'),
    duration: '36:30',
    thumbnailColor: '#B85C5C',
  },
  {
    id: 'cet-6',
    title: '"How Great Is Our God"',
    type: 'Clip',
    campusName: 'Main Campus',
    campusId: 'campus-main',
    orgId: 'org-2819church',
    visibilityClass: 0,
    publishedAt: new Date('2026-02-07T16:00:00'),
    duration: '5:50',
    thumbnailColor: '#1A1714',
  },
  {
    id: 'cet-7',
    title: 'Praise Night Highlights',
    type: 'Worship',
    campusName: 'Main Campus',
    campusId: 'campus-main',
    orgId: 'org-2819church',
    visibilityClass: 0,
    publishedAt: new Date('2026-02-06T20:00:00'),
    duration: '12:45',
    thumbnailColor: '#B8943E',
  },
  {
    id: 'cet-8',
    title: 'Community Outreach Recap',
    type: 'Event',
    campusName: 'Main Campus',
    campusId: 'campus-main',
    orgId: 'org-2819church',
    visibilityClass: 0,
    publishedAt: new Date('2026-02-01T12:00:00'),
    duration: '6:20',
    thumbnailColor: '#5A8A6E',
  },

  // ── V0 PUBLIC — Westside Campus ──
  {
    id: 'cet-9',
    title: 'Strength in Surrender',
    type: 'Sermon',
    campusName: 'Westside Campus',
    campusId: 'campus-west',
    orgId: 'org-2819church',
    speaker: 'Pastor Lonnell Dawson Williams',
    visibilityClass: 0,
    publishedAt: new Date('2026-02-22T10:30:00'),
    duration: '35:45',
    thumbnailColor: '#5A8A6E',
  },
  {
    id: 'cet-10',
    title: 'Westside Worship Experience',
    type: 'Worship',
    campusName: 'Westside Campus',
    campusId: 'campus-west',
    orgId: 'org-2819church',
    visibilityClass: 0,
    publishedAt: new Date('2026-02-15T11:00:00'),
    duration: '20:10',
    thumbnailColor: '#1A1714',
  },
  {
    id: 'cet-11',
    title: 'Love Your Neighbor',
    type: 'Sermon',
    campusName: 'Westside Campus',
    campusId: 'campus-west',
    orgId: 'org-2819church',
    speaker: 'Tatjuana Phillips',
    visibilityClass: 0,
    publishedAt: new Date('2026-02-08T10:30:00'),
    duration: '33:50',
    thumbnailColor: '#B8943E',
  },
  {
    id: 'cet-12',
    title: 'Easter Celebration Teaser',
    type: 'Clip',
    campusName: 'Westside Campus',
    campusId: 'campus-west',
    orgId: 'org-2819church',
    visibilityClass: 0,
    publishedAt: new Date('2026-02-04T09:00:00'),
    duration: '1:30',
    thumbnailColor: '#1A1714',
  },

  // ── V2 CAMPUS-INTERNAL — Main Campus ──
  {
    id: 'cet-13',
    title: 'Book of James — Week 6',
    type: 'Training',
    campusName: 'Main Campus',
    campusId: 'campus-main',
    orgId: 'org-2819church',
    speaker: 'Tatjuana Phillips',
    visibilityClass: 2,
    publishedAt: new Date('2026-02-20T19:00:00'),
    duration: '48:30',
    thumbnailColor: '#B8943E',
  },
  {
    id: 'cet-14',
    title: 'Leadership Training: Conflict Resolution',
    type: 'Training',
    campusName: 'Main Campus',
    campusId: 'campus-main',
    orgId: 'org-2819church',
    speaker: 'Elder Arik Hayes',
    visibilityClass: 2,
    publishedAt: new Date('2026-02-18T18:00:00'),
    duration: '55:00',
    thumbnailColor: '#B8943E',
  },
  {
    id: 'cet-15',
    title: 'Ministry Meeting Recap — February',
    type: 'Event',
    campusName: 'Main Campus',
    campusId: 'campus-main',
    orgId: 'org-2819church',
    visibilityClass: 2,
    publishedAt: new Date('2026-02-16T20:00:00'),
    duration: '32:10',
    thumbnailColor: '#5A8A6E',
  },
  {
    id: 'cet-16',
    title: 'Romans Deep Dive — Session 4',
    type: 'Training',
    campusName: 'Main Campus',
    campusId: 'campus-main',
    orgId: 'org-2819church',
    speaker: 'Pastor Philip Anthony Mitchell',
    visibilityClass: 2,
    publishedAt: new Date('2026-02-13T19:00:00'),
    duration: '51:20',
    thumbnailColor: '#1A1714',
  },
  {
    id: 'cet-17',
    title: 'New Member Orientation',
    type: 'Event',
    campusName: 'Main Campus',
    campusId: 'campus-main',
    orgId: 'org-2819church',
    visibilityClass: 2,
    publishedAt: new Date('2026-02-10T14:00:00'),
    duration: '28:00',
    thumbnailColor: '#5A8A6E',
  },

  // ── V3 MINISTRY-PRIVATE — Main Campus ──
  {
    id: 'cet-18',
    title: 'Youth Ministry: Leader Training',
    type: 'Training',
    campusName: 'Main Campus',
    campusId: 'campus-main',
    orgId: 'org-2819church',
    ministryId: 'min-youth',
    ministryName: 'Youth Ministry',
    visibilityClass: 3,
    publishedAt: new Date('2026-02-19T17:00:00'),
    duration: '40:15',
    thumbnailColor: '#B85C5C',
  },
  {
    id: 'cet-19',
    title: 'Worship Team Rehearsal — Feb 16',
    type: 'Clip',
    campusName: 'Main Campus',
    campusId: 'campus-main',
    orgId: 'org-2819church',
    ministryId: 'min-worship',
    ministryName: 'Worship Team',
    visibilityClass: 3,
    publishedAt: new Date('2026-02-15T15:00:00'),
    duration: '14:20',
    thumbnailColor: '#1A1714',
  },
  {
    id: 'cet-20',
    title: 'Deacon Board Session — Q1 Planning',
    type: 'Event',
    campusName: 'Main Campus',
    campusId: 'campus-main',
    orgId: 'org-2819church',
    ministryId: 'min-deacon',
    ministryName: 'Deacon Board',
    visibilityClass: 3,
    publishedAt: new Date('2026-02-12T18:30:00'),
    duration: '1:02:00',
    thumbnailColor: '#5A8A6E',
  },
];

// =============================================================================
// HELPERS
// =============================================================================

/** Unique campuses from tile data */
export function getCampuses(tiles: ChurchExploreTile[] = CHURCH_EXPLORE_TILES): string[] {
  const set = new Set(tiles.map((t) => t.campusName));
  return Array.from(set).sort();
}
