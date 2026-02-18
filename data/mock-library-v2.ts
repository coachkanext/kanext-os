/**
 * Library v2 Mock Data
 * Types and mock data for the Library hub across all 5 modes.
 * 7 tabs: All | Collections | Saved | Created | Shared | Pinned | Archive
 */

import type { Mode } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

export type LibraryItemType = 'video' | 'document' | 'link' | 'image' | 'audio' | 'pack';
export type LibraryItemStatus = 'active' | 'archived' | 'shared' | 'pinned';

export interface LibraryItem {
  id: string;
  title: string;
  type: LibraryItemType;
  source: string;
  date: string;
  thumbnailColor: string;
  pinned: boolean;
  shared: boolean;
  archived: boolean;
  createdByMe: boolean;
  collectionId?: string;
  tags: string[];
}

export interface LibraryCollection {
  id: string;
  name: string;
  itemCount: number;
  coverColor: string;
  description: string;
  lastUpdated: string;
}

export type LibraryTab = 'all' | 'collections' | 'saved' | 'created' | 'shared' | 'pinned' | 'archive';

export const LIBRARY_TABS: { key: LibraryTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'collections', label: 'Collections' },
  { key: 'saved', label: 'Saved' },
  { key: 'created', label: 'Created' },
  { key: 'shared', label: 'Shared' },
  { key: 'pinned', label: 'Pinned' },
  { key: 'archive', label: 'Archive' },
];

// =============================================================================
// HELPERS
// =============================================================================

export function getTypeIcon(type: LibraryItemType): string {
  switch (type) {
    case 'video': return 'play.rectangle.fill';
    case 'document': return 'doc.text.fill';
    case 'link': return 'link';
    case 'image': return 'photo.fill';
    case 'audio': return 'waveform';
    case 'pack': return 'shippingbox.fill';
  }
}

export function getTypeColor(type: LibraryItemType): string {
  switch (type) {
    case 'video': return '#EF4444';
    case 'document': return '#6AA9FF';
    case 'link': return '#22C55E';
    case 'image': return '#F59E0B';
    case 'audio': return '#A78BFA';
    case 'pack': return '#8F8F8F';
  }
}

// =============================================================================
// SPORTS LIBRARY DATA
// =============================================================================

const SPORTS_ITEMS: LibraryItem[] = [
  {
    id: 'sl-1',
    title: 'Coastal Carolina Full Game Film',
    type: 'video',
    source: 'Hudl',
    date: 'Feb 12, 2026',
    thumbnailColor: '#EF4444',
    pinned: true,
    shared: true,
    archived: false,
    createdByMe: false,
    collectionId: 'sc-1',
    tags: ['game film', 'conference'],
  },
  {
    id: 'sl-2',
    title: 'Campbell Scouting Report',
    type: 'document',
    source: 'Coach Miller',
    date: 'Feb 13, 2026',
    thumbnailColor: '#6AA9FF',
    pinned: true,
    shared: true,
    archived: false,
    createdByMe: false,
    collectionId: 'sc-2',
    tags: ['scouting', 'opponent'],
  },
  {
    id: 'sl-3',
    title: '2026 PG Prospect Pack',
    type: 'pack',
    source: 'Recruiting Office',
    date: 'Feb 10, 2026',
    thumbnailColor: '#8F8F8F',
    pinned: false,
    shared: true,
    archived: false,
    createdByMe: true,
    collectionId: 'sc-4',
    tags: ['recruiting', 'point guards'],
  },
  {
    id: 'sl-4',
    title: 'Transition Defense Breakdown',
    type: 'video',
    source: 'Coach Brooks',
    date: 'Feb 12, 2026',
    thumbnailColor: '#EF4444',
    pinned: false,
    shared: false,
    archived: false,
    createdByMe: false,
    collectionId: 'sc-1',
    tags: ['film', 'defense'],
  },
  {
    id: 'sl-5',
    title: 'Marcus Johnson Development Plan',
    type: 'document',
    source: 'Coach Davis',
    date: 'Jan 28, 2026',
    thumbnailColor: '#6AA9FF',
    pinned: false,
    shared: false,
    archived: false,
    createdByMe: true,
    collectionId: 'sc-3',
    tags: ['player dev', 'individual'],
  },
  {
    id: 'sl-6',
    title: 'Zone Press Break Concepts',
    type: 'link',
    source: 'Basketball HQ',
    date: 'Feb 11, 2026',
    thumbnailColor: '#22C55E',
    pinned: false,
    shared: true,
    archived: false,
    createdByMe: false,
    tags: ['article', 'offense'],
  },
  {
    id: 'sl-7',
    title: 'UNC Asheville Film — Second Half',
    type: 'video',
    source: 'Hudl',
    date: 'Feb 8, 2026',
    thumbnailColor: '#EF4444',
    pinned: false,
    shared: false,
    archived: true,
    createdByMe: false,
    collectionId: 'sc-1',
    tags: ['game film', 'conference'],
  },
  {
    id: 'sl-8',
    title: 'Jaylen Carter Highlight Reel',
    type: 'video',
    source: 'Synergy Sports',
    date: 'Feb 9, 2026',
    thumbnailColor: '#EF4444',
    pinned: false,
    shared: false,
    archived: false,
    createdByMe: false,
    collectionId: 'sc-4',
    tags: ['recruiting', 'prospect'],
  },
  {
    id: 'sl-9',
    title: 'Strength & Conditioning Weekly',
    type: 'document',
    source: 'Coach Turner',
    date: 'Feb 10, 2026',
    thumbnailColor: '#6AA9FF',
    pinned: false,
    shared: true,
    archived: false,
    createdByMe: false,
    collectionId: 'sc-3',
    tags: ['development', 'training'],
  },
  {
    id: 'sl-10',
    title: 'SIAC Conference Standings Article',
    type: 'link',
    source: 'ESPN',
    date: 'Feb 7, 2026',
    thumbnailColor: '#22C55E',
    pinned: false,
    shared: false,
    archived: true,
    createdByMe: false,
    tags: ['article', 'conference'],
  },
  {
    id: 'sl-11',
    title: 'Practice Plan — Week 6',
    type: 'document',
    source: 'Coach Davis',
    date: 'Feb 9, 2026',
    thumbnailColor: '#6AA9FF',
    pinned: false,
    shared: true,
    archived: false,
    createdByMe: true,
    tags: ['practice', 'plan'],
  },
  {
    id: 'sl-12',
    title: 'Mid-Range Package Clips',
    type: 'video',
    source: 'YouTube',
    date: 'Feb 6, 2026',
    thumbnailColor: '#EF4444',
    pinned: false,
    shared: false,
    archived: false,
    createdByMe: false,
    collectionId: 'sc-3',
    tags: ['player dev', 'shooting'],
  },
];

const SPORTS_COLLECTIONS: LibraryCollection[] = [
  {
    id: 'sc-1',
    name: 'Game Film',
    itemCount: 4,
    coverColor: '#EF4444',
    description: 'Full game recordings, breakdowns, and key play clips',
    lastUpdated: 'Feb 12, 2026',
  },
  {
    id: 'sc-2',
    name: 'Scouting',
    itemCount: 3,
    coverColor: '#6AA9FF',
    description: 'Opponent scouting reports and tendency charts',
    lastUpdated: 'Feb 13, 2026',
  },
  {
    id: 'sc-3',
    name: 'Development',
    itemCount: 4,
    coverColor: '#22C55E',
    description: 'Player development plans, workout logs, and progress reports',
    lastUpdated: 'Feb 10, 2026',
  },
  {
    id: 'sc-4',
    name: 'Recruiting',
    itemCount: 3,
    coverColor: '#F59E0B',
    description: 'Prospect packs, highlight reels, and evaluation sheets',
    lastUpdated: 'Feb 10, 2026',
  },
];

// =============================================================================
// CHURCH LIBRARY DATA
// =============================================================================

const CHURCH_ITEMS: LibraryItem[] = [
  {
    id: 'cl-1',
    title: 'Sunday Service — Feb 9 Recording',
    type: 'video',
    source: 'ICC Media',
    date: 'Feb 9, 2026',
    thumbnailColor: '#EF4444',
    pinned: true,
    shared: true,
    archived: false,
    createdByMe: false,
    collectionId: 'cc-1',
    tags: ['sermon', 'sunday'],
  },
  {
    id: 'cl-2',
    title: 'Book of Romans Study Guide',
    type: 'document',
    source: 'Pastor Dipo Kalejaiye',
    date: 'Feb 5, 2026',
    thumbnailColor: '#6AA9FF',
    pinned: true,
    shared: true,
    archived: false,
    createdByMe: false,
    collectionId: 'cc-2',
    tags: ['bible study', 'Romans'],
  },
  {
    id: 'cl-3',
    title: 'Daily Devotional — Week 6',
    type: 'document',
    source: 'Ministry Team',
    date: 'Feb 10, 2026',
    thumbnailColor: '#6AA9FF',
    pinned: false,
    shared: true,
    archived: false,
    createdByMe: false,
    collectionId: 'cc-2',
    tags: ['devotional', 'daily'],
  },
  {
    id: 'cl-4',
    title: 'Youth Retreat Photos',
    type: 'image',
    source: 'Youth Ministry',
    date: 'Feb 1, 2026',
    thumbnailColor: '#F59E0B',
    pinned: false,
    shared: true,
    archived: false,
    createdByMe: false,
    collectionId: 'cc-3',
    tags: ['youth', 'photos', 'event'],
  },
  {
    id: 'cl-5',
    title: 'Worship Set — Feb 16',
    type: 'audio',
    source: 'Worship Team',
    date: 'Feb 14, 2026',
    thumbnailColor: '#A78BFA',
    pinned: false,
    shared: false,
    archived: false,
    createdByMe: false,
    collectionId: 'cc-1',
    tags: ['worship', 'music'],
  },
  {
    id: 'cl-6',
    title: 'Wednesday Bible Study Notes',
    type: 'document',
    source: 'Pastor Dipo Kalejaiye',
    date: 'Feb 12, 2026',
    thumbnailColor: '#6AA9FF',
    pinned: false,
    shared: false,
    archived: false,
    createdByMe: true,
    collectionId: 'cc-2',
    tags: ['bible study', 'notes'],
  },
  {
    id: 'cl-7',
    title: 'Missions Trip Overview',
    type: 'link',
    source: 'Outreach Ministry',
    date: 'Jan 30, 2026',
    thumbnailColor: '#22C55E',
    pinned: false,
    shared: true,
    archived: false,
    createdByMe: false,
    tags: ['missions', 'outreach'],
  },
  {
    id: 'cl-8',
    title: 'Christmas Service Recording',
    type: 'video',
    source: 'ICC Media',
    date: 'Dec 25, 2025',
    thumbnailColor: '#EF4444',
    pinned: false,
    shared: false,
    archived: true,
    createdByMe: false,
    collectionId: 'cc-1',
    tags: ['sermon', 'christmas'],
  },
  {
    id: 'cl-9',
    title: 'Volunteer Signup Form',
    type: 'link',
    source: 'Admin',
    date: 'Feb 3, 2026',
    thumbnailColor: '#22C55E',
    pinned: false,
    shared: true,
    archived: false,
    createdByMe: true,
    tags: ['admin', 'volunteer'],
  },
  {
    id: 'cl-10',
    title: 'Prayer Meeting Audio — Feb 11',
    type: 'audio',
    source: 'Prayer Ministry',
    date: 'Feb 11, 2026',
    thumbnailColor: '#A78BFA',
    pinned: false,
    shared: false,
    archived: false,
    createdByMe: false,
    tags: ['prayer', 'recording'],
  },
];

const CHURCH_COLLECTIONS: LibraryCollection[] = [
  {
    id: 'cc-1',
    name: 'Sermons & Worship',
    itemCount: 3,
    coverColor: '#A78BFA',
    description: 'Service recordings, worship sets, and message archives',
    lastUpdated: 'Feb 14, 2026',
  },
  {
    id: 'cc-2',
    name: 'Study Materials',
    itemCount: 3,
    coverColor: '#6AA9FF',
    description: 'Bible study guides, devotionals, and notes',
    lastUpdated: 'Feb 12, 2026',
  },
  {
    id: 'cc-3',
    name: 'Events & Photos',
    itemCount: 2,
    coverColor: '#F59E0B',
    description: 'Event photos, recaps, and ministry highlights',
    lastUpdated: 'Feb 1, 2026',
  },
];

// =============================================================================
// EDUCATION LIBRARY DATA
// =============================================================================

const EDUCATION_ITEMS: LibraryItem[] = [
  {
    id: 'el-1',
    title: 'Intro to Theology — Lecture 8 Notes',
    type: 'document',
    source: 'Dr. Hansen',
    date: 'Feb 12, 2026',
    thumbnailColor: '#6AA9FF',
    pinned: true,
    shared: false,
    archived: false,
    createdByMe: true,
    collectionId: 'ec-1',
    tags: ['lecture', 'theology'],
  },
  {
    id: 'el-2',
    title: 'Research Methods Syllabus',
    type: 'document',
    source: 'Registrar',
    date: 'Aug 25, 2025',
    thumbnailColor: '#6AA9FF',
    pinned: true,
    shared: true,
    archived: false,
    createdByMe: false,
    collectionId: 'ec-2',
    tags: ['syllabus', 'course'],
  },
  {
    id: 'el-3',
    title: 'Campus Map & Building Guide',
    type: 'link',
    source: 'Student Affairs',
    date: 'Jan 15, 2026',
    thumbnailColor: '#22C55E',
    pinned: false,
    shared: true,
    archived: false,
    createdByMe: false,
    collectionId: 'ec-3',
    tags: ['campus', 'guide'],
  },
  {
    id: 'el-4',
    title: 'Biblical Hermeneutics Paper Draft',
    type: 'document',
    source: 'My Documents',
    date: 'Feb 10, 2026',
    thumbnailColor: '#6AA9FF',
    pinned: false,
    shared: false,
    archived: false,
    createdByMe: true,
    collectionId: 'ec-1',
    tags: ['paper', 'draft'],
  },
  {
    id: 'el-5',
    title: 'Guest Lecture Recording — Dr. Park',
    type: 'video',
    source: 'SDCC Media',
    date: 'Feb 7, 2026',
    thumbnailColor: '#EF4444',
    pinned: false,
    shared: true,
    archived: false,
    createdByMe: false,
    collectionId: 'ec-2',
    tags: ['lecture', 'guest'],
  },
  {
    id: 'el-6',
    title: 'Peer Review Guidelines',
    type: 'document',
    source: 'Academic Office',
    date: 'Jan 20, 2026',
    thumbnailColor: '#6AA9FF',
    pinned: false,
    shared: true,
    archived: false,
    createdByMe: false,
    tags: ['guidelines', 'academic'],
  },
  {
    id: 'el-7',
    title: 'Library Database Access',
    type: 'link',
    source: 'SDCC Library',
    date: 'Sep 1, 2025',
    thumbnailColor: '#22C55E',
    pinned: false,
    shared: true,
    archived: false,
    createdByMe: false,
    collectionId: 'ec-3',
    tags: ['library', 'research'],
  },
  {
    id: 'el-8',
    title: 'Fall Semester Final Projects',
    type: 'document',
    source: 'My Documents',
    date: 'Dec 15, 2025',
    thumbnailColor: '#6AA9FF',
    pinned: false,
    shared: false,
    archived: true,
    createdByMe: true,
    tags: ['final', 'project'],
  },
  {
    id: 'el-9',
    title: 'Chapel Service — Feb 14',
    type: 'audio',
    source: 'Campus Ministry',
    date: 'Feb 14, 2026',
    thumbnailColor: '#A78BFA',
    pinned: false,
    shared: false,
    archived: false,
    createdByMe: false,
    collectionId: 'ec-2',
    tags: ['chapel', 'audio'],
  },
  {
    id: 'el-10',
    title: 'Student Handbook 2025-26',
    type: 'document',
    source: 'Student Affairs',
    date: 'Aug 20, 2025',
    thumbnailColor: '#6AA9FF',
    pinned: false,
    shared: true,
    archived: false,
    createdByMe: false,
    collectionId: 'ec-3',
    tags: ['handbook', 'policies'],
  },
];

const EDUCATION_COLLECTIONS: LibraryCollection[] = [
  {
    id: 'ec-1',
    name: 'Lecture Notes',
    itemCount: 3,
    coverColor: '#6AA9FF',
    description: 'Class notes, paper drafts, and study materials',
    lastUpdated: 'Feb 12, 2026',
  },
  {
    id: 'ec-2',
    name: 'Course Materials',
    itemCount: 3,
    coverColor: '#22C55E',
    description: 'Syllabi, recordings, and required reading',
    lastUpdated: 'Feb 14, 2026',
  },
  {
    id: 'ec-3',
    name: 'Campus Resources',
    itemCount: 3,
    coverColor: '#F59E0B',
    description: 'Maps, handbooks, and campus guides',
    lastUpdated: 'Jan 15, 2026',
  },
];

// =============================================================================
// BUSINESS LIBRARY DATA
// =============================================================================

const BUSINESS_ITEMS: LibraryItem[] = [
  {
    id: 'bl-1',
    title: 'Series A Pitch Deck v3',
    type: 'document',
    source: 'Sammy Kalejaiye',
    date: 'Feb 11, 2026',
    thumbnailColor: '#6AA9FF',
    pinned: true,
    shared: true,
    archived: false,
    createdByMe: true,
    collectionId: 'bc-1',
    tags: ['pitch', 'fundraising'],
  },
  {
    id: 'bl-2',
    title: 'KaNeXT Platform Demo Recording',
    type: 'video',
    source: 'Product Team',
    date: 'Feb 10, 2026',
    thumbnailColor: '#EF4444',
    pinned: true,
    shared: true,
    archived: false,
    createdByMe: false,
    collectionId: 'bc-1',
    tags: ['demo', 'product'],
  },
  {
    id: 'bl-3',
    title: 'NDA — Redline v2',
    type: 'document',
    source: 'Legal Counsel',
    date: 'Feb 13, 2026',
    thumbnailColor: '#6AA9FF',
    pinned: false,
    shared: false,
    archived: false,
    createdByMe: false,
    collectionId: 'bc-2',
    tags: ['legal', 'NDA'],
  },
  {
    id: 'bl-4',
    title: 'TAM/SAM/SOM Market Analysis',
    type: 'document',
    source: 'Strategy',
    date: 'Feb 8, 2026',
    thumbnailColor: '#6AA9FF',
    pinned: false,
    shared: true,
    archived: false,
    createdByMe: true,
    collectionId: 'bc-3',
    tags: ['market', 'research'],
  },
  {
    id: 'bl-5',
    title: 'Employee Onboarding Guide',
    type: 'document',
    source: 'Operations',
    date: 'Jan 15, 2026',
    thumbnailColor: '#6AA9FF',
    pinned: false,
    shared: true,
    archived: false,
    createdByMe: false,
    collectionId: 'bc-4',
    tags: ['training', 'onboarding'],
  },
  {
    id: 'bl-6',
    title: 'Competitive Landscape Brief',
    type: 'document',
    source: 'Research',
    date: 'Feb 5, 2026',
    thumbnailColor: '#6AA9FF',
    pinned: false,
    shared: true,
    archived: false,
    createdByMe: true,
    collectionId: 'bc-3',
    tags: ['competitive', 'research'],
  },
  {
    id: 'bl-7',
    title: 'Board Meeting Minutes — Jan',
    type: 'document',
    source: 'Secretary',
    date: 'Jan 31, 2026',
    thumbnailColor: '#6AA9FF',
    pinned: false,
    shared: false,
    archived: true,
    createdByMe: false,
    tags: ['board', 'minutes'],
  },
  {
    id: 'bl-8',
    title: 'Product Roadmap Link',
    type: 'link',
    source: 'Product Team',
    date: 'Feb 1, 2026',
    thumbnailColor: '#22C55E',
    pinned: false,
    shared: true,
    archived: false,
    createdByMe: false,
    collectionId: 'bc-1',
    tags: ['roadmap', 'product'],
  },
  {
    id: 'bl-9',
    title: 'Operating Agreement — Final',
    type: 'document',
    source: 'Legal Counsel',
    date: 'Dec 20, 2025',
    thumbnailColor: '#6AA9FF',
    pinned: false,
    shared: false,
    archived: true,
    createdByMe: false,
    collectionId: 'bc-2',
    tags: ['legal', 'governance'],
  },
  {
    id: 'bl-10',
    title: 'API Documentation',
    type: 'link',
    source: 'Engineering',
    date: 'Feb 14, 2026',
    thumbnailColor: '#22C55E',
    pinned: false,
    shared: true,
    archived: false,
    createdByMe: false,
    collectionId: 'bc-4',
    tags: ['engineering', 'docs'],
  },
];

const BUSINESS_COLLECTIONS: LibraryCollection[] = [
  {
    id: 'bc-1',
    name: 'Investor Materials',
    itemCount: 3,
    coverColor: '#F59E0B',
    description: 'Pitch decks, demos, and fundraising documents',
    lastUpdated: 'Feb 11, 2026',
  },
  {
    id: 'bc-2',
    name: 'Legal & Contracts',
    itemCount: 2,
    coverColor: '#EF4444',
    description: 'NDAs, agreements, and legal documents',
    lastUpdated: 'Feb 13, 2026',
  },
  {
    id: 'bc-3',
    name: 'Market Research',
    itemCount: 2,
    coverColor: '#22C55E',
    description: 'Market analysis, competitive briefs, and industry reports',
    lastUpdated: 'Feb 8, 2026',
  },
  {
    id: 'bc-4',
    name: 'Training & Docs',
    itemCount: 2,
    coverColor: '#6AA9FF',
    description: 'Onboarding guides, API docs, and internal references',
    lastUpdated: 'Feb 14, 2026',
  },
];

// =============================================================================
// COMMUNITY (K-1 COMPETITION) LIBRARY DATA
// =============================================================================

const COMMUNITY_ITEMS: LibraryItem[] = [
  {
    id: 'kl-1',
    title: 'Laguna Seca Race Highlights',
    type: 'video',
    source: 'K-1 Media',
    date: 'Feb 8, 2026',
    thumbnailColor: '#EF4444',
    pinned: true,
    shared: true,
    archived: false,
    createdByMe: false,
    collectionId: 'kc-1',
    tags: ['race', 'highlights'],
  },
  {
    id: 'kl-2',
    title: 'Kart Setup Guide — Wet Conditions',
    type: 'document',
    source: 'Technical Team',
    date: 'Feb 6, 2026',
    thumbnailColor: '#6AA9FF',
    pinned: true,
    shared: true,
    archived: false,
    createdByMe: false,
    collectionId: 'kc-2',
    tags: ['setup', 'wet'],
  },
  {
    id: 'kl-3',
    title: 'Braking Technique Masterclass',
    type: 'link',
    source: 'Driver Academy',
    date: 'Feb 3, 2026',
    thumbnailColor: '#22C55E',
    pinned: false,
    shared: true,
    archived: false,
    createdByMe: false,
    collectionId: 'kc-3',
    tags: ['technique', 'braking'],
  },
  {
    id: 'kl-4',
    title: 'Round 5 Onboard Footage',
    type: 'video',
    source: 'GoPro',
    date: 'Feb 1, 2026',
    thumbnailColor: '#EF4444',
    pinned: false,
    shared: false,
    archived: false,
    createdByMe: true,
    collectionId: 'kc-1',
    tags: ['onboard', 'race'],
  },
  {
    id: 'kl-5',
    title: 'Season Awards Ceremony Photos',
    type: 'image',
    source: 'K-1 Media',
    date: 'Jan 25, 2026',
    thumbnailColor: '#F59E0B',
    pinned: false,
    shared: true,
    archived: false,
    createdByMe: false,
    tags: ['event', 'photos'],
  },
  {
    id: 'kl-6',
    title: 'Tire Pressure Optimization Guide',
    type: 'document',
    source: 'Technical Team',
    date: 'Jan 20, 2026',
    thumbnailColor: '#6AA9FF',
    pinned: false,
    shared: false,
    archived: false,
    createdByMe: true,
    collectionId: 'kc-2',
    tags: ['setup', 'tires'],
  },
  {
    id: 'kl-7',
    title: 'Round 3 Full Race Replay',
    type: 'video',
    source: 'K-1 Media',
    date: 'Dec 15, 2025',
    thumbnailColor: '#EF4444',
    pinned: false,
    shared: false,
    archived: true,
    createdByMe: false,
    collectionId: 'kc-1',
    tags: ['race', 'replay'],
  },
  {
    id: 'kl-8',
    title: 'Corner Entry Technique Article',
    type: 'link',
    source: 'Racing Line Blog',
    date: 'Feb 12, 2026',
    thumbnailColor: '#22C55E',
    pinned: false,
    shared: false,
    archived: false,
    createdByMe: false,
    collectionId: 'kc-3',
    tags: ['technique', 'article'],
  },
];

const COMMUNITY_COLLECTIONS: LibraryCollection[] = [
  {
    id: 'kc-1',
    name: 'Race Footage',
    itemCount: 3,
    coverColor: '#EF4444',
    description: 'Race replays, onboard footage, and highlights',
    lastUpdated: 'Feb 8, 2026',
  },
  {
    id: 'kc-2',
    name: 'Setup Guides',
    itemCount: 2,
    coverColor: '#6AA9FF',
    description: 'Kart setup, tuning guides, and technical docs',
    lastUpdated: 'Feb 6, 2026',
  },
  {
    id: 'kc-3',
    name: 'Techniques',
    itemCount: 2,
    coverColor: '#22C55E',
    description: 'Driving technique articles, videos, and masterclasses',
    lastUpdated: 'Feb 12, 2026',
  },
];

// =============================================================================
// EXPORTS
// =============================================================================

export const LIBRARY_ITEMS: Record<Mode, LibraryItem[]> = {
  sports: SPORTS_ITEMS,
  church: CHURCH_ITEMS,
  education: EDUCATION_ITEMS,
  business: BUSINESS_ITEMS,
  competition: COMMUNITY_ITEMS,
};

export const LIBRARY_COLLECTIONS: Record<Mode, LibraryCollection[]> = {
  sports: SPORTS_COLLECTIONS,
  church: CHURCH_COLLECTIONS,
  education: EDUCATION_COLLECTIONS,
  business: BUSINESS_COLLECTIONS,
  competition: COMMUNITY_COLLECTIONS,
};
