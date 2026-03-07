/**
 * Mock Business Media/Proof Data — Valuetainment Business Mode "Media/Proof" tab.
 *
 * 8 sub-tabs: Overview, Library, Proof Packs, Playlists, Case Studies,
 * Press, Rights, Share Links.
 *
 * All data references Valuetainment entities:
 *   Patrick Bet-David, Valuetainment, 2819 Church, PBD Podcast,
 *   Investor demos, brand assets, PBD/Valuetainment mentions.
 */

// =============================================================================
// TYPES
// =============================================================================

export type MediaSubTab =
  | 'overview'
  | 'library'
  | 'proof_packs'
  | 'playlists'
  | 'case_studies'
  | 'press'
  | 'rights'
  | 'share_links';

export interface MediaOverviewStats {
  totalAssets: number;
  proofPacks: number;
  caseStudies: number;
  pressHits: number;
  shareLinksActive: number;
}

export interface MediaAsset {
  id: string;
  title: string;
  type: 'video' | 'image' | 'document' | 'deck' | 'audio';
  category: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  tags: string[];
}

export interface ProofPack {
  id: string;
  title: string;
  description: string;
  assetCount: number;
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
  audience: 'investor' | 'partner' | 'public' | 'board';
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  itemCount: number;
  duration: string;
  category: string;
  visibility: 'public' | 'private' | 'unlisted';
}

export interface CaseStudy {
  id: string;
  title: string;
  client: string;
  category: string;
  status: 'published' | 'draft';
  publishedAt?: string;
  summary: string;
  metrics: { label: string; value: string }[];
}

export interface PressItem {
  id: string;
  title: string;
  outlet: string;
  date: string;
  type: 'article' | 'interview' | 'mention' | 'podcast';
  url?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface RightsItem {
  id: string;
  assetTitle: string;
  licenseType: string;
  holder: string;
  expiryDate: string;
  status: 'active' | 'expiring_soon' | 'expired';
  territory: string;
}

export interface ShareLink {
  id: string;
  title: string;
  url: string;
  targetAudience: string;
  expiresAt: string;
  views: number;
  status: 'active' | 'expired' | 'revoked';
  watermarked: boolean;
}

// =============================================================================
// SUB-TAB DEFINITIONS
// =============================================================================

export const MEDIA_SUB_TABS: { id: MediaSubTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'library', label: 'Library' },
  { id: 'proof_packs', label: 'Proof Packs' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'case_studies', label: 'Case Studies' },
  { id: 'press', label: 'Press' },
  { id: 'rights', label: 'Rights' },
  { id: 'share_links', label: 'Share Links' },
];

// =============================================================================
// OVERVIEW
// =============================================================================

export const MEDIA_OVERVIEW: MediaOverviewStats = {
  totalAssets: 247,
  proofPacks: 4,
  caseStudies: 3,
  pressHits: 5,
  shareLinksActive: 4,
};

// =============================================================================
// LIBRARY (8 items)
// =============================================================================

export const MEDIA_LIBRARY: MediaAsset[] = [
  {
    id: 'ma-1',
    title: 'Valuetainment vs Heritage — Full Game Broadcast',
    type: 'video',
    category: 'Game Footage',
    size: '4.2 GB',
    uploadedAt: 'Feb 12, 2026',
    uploadedBy: 'Alex Morgan',
    tags: ['Valuetainment', 'basketball', 'broadcast', 'proof'],
  },
  {
    id: 'ma-2',
    title: '2819 Church Sunday Worship — Multi-Cam Capture',
    type: 'video',
    category: 'Worship Content',
    size: '3.8 GB',
    uploadedAt: 'Feb 9, 2026',
    uploadedBy: 'David Okonkwo',
    tags: ['2819 Church', 'worship', 'multi-cam', 'live'],
  },
  {
    id: 'ma-3',
    title: 'Valuetainment Race Day Telemetry Overlay — Round 5',
    type: 'video',
    category: 'Race Footage',
    size: '1.7 GB',
    uploadedAt: 'Feb 8, 2026',
    uploadedBy: 'Adriana Ruiz',
    tags: ['Valuetainment', 'telemetry', 'overlay', 'race'],
  },
  {
    id: 'ma-4',
    title: 'Valuetainment OS v2 Investor Demo Recording',
    type: 'video',
    category: 'Investor Materials',
    size: '890 MB',
    uploadedAt: 'Feb 6, 2026',
    uploadedBy: 'Alex Morgan',
    tags: ['demo', 'investor', 'product', 'walkthrough'],
  },
  {
    id: 'ma-5',
    title: 'Valuetainment Brand Kit — Logos, Marks, Guidelines',
    type: 'deck',
    category: 'Brand Assets',
    size: '24 MB',
    uploadedAt: 'Jan 28, 2026',
    uploadedBy: 'Lisa Park',
    tags: ['brand', 'logo', 'guidelines', 'identity'],
  },
  {
    id: 'ma-6',
    title: 'Series A Pitch Deck — February 2026',
    type: 'deck',
    category: 'Investor Materials',
    size: '18 MB',
    uploadedAt: 'Feb 1, 2026',
    uploadedBy: 'Alex Morgan',
    tags: ['pitch', 'investor', 'Series A', 'deck'],
  },
  {
    id: 'ma-7',
    title: 'Valuetainment Player Headshots — 2025-26 Roster',
    type: 'image',
    category: 'Game Footage',
    size: '156 MB',
    uploadedAt: 'Jan 15, 2026',
    uploadedBy: 'Marcus Chen',
    tags: ['Valuetainment', 'headshots', 'roster', 'photo'],
  },
  {
    id: 'ma-8',
    title: 'Valuetainment OS Product Requirements Document',
    type: 'document',
    category: 'Internal Docs',
    size: '4.5 MB',
    uploadedAt: 'Jan 10, 2026',
    uploadedBy: 'Marcus Chen',
    tags: ['PRD', 'product', 'requirements', 'internal'],
  },
];

// =============================================================================
// PROOF PACKS (4 items)
// =============================================================================

export const PROOF_PACKS: ProofPack[] = [
  {
    id: 'pp-1',
    title: 'Investor Proof Pack — Q1 2026',
    description:
      'Curated media bundle for investor meetings: product demo, Valuetainment highlights, traction metrics deck, and founder walkthrough video.',
    assetCount: 12,
    status: 'published',
    createdAt: 'Feb 3, 2026',
    audience: 'investor',
  },
  {
    id: 'pp-2',
    title: 'Board Meeting Media Pack',
    description:
      'Board-ready evidence pack: quarterly KPIs, Valuetainment partnership proof, 2819 Church pilot footage, and compliance summary slides.',
    assetCount: 8,
    status: 'published',
    createdAt: 'Jan 22, 2026',
    audience: 'board',
  },
  {
    id: 'pp-3',
    title: 'Partner Onboarding Kit',
    description:
      'Proof bundle for new integration partners: API docs, brand guidelines, demo recordings, and case study one-pagers.',
    assetCount: 6,
    status: 'draft',
    createdAt: 'Feb 10, 2026',
    audience: 'partner',
  },
  {
    id: 'pp-4',
    title: 'Public Showcase — Valuetainment Story',
    description:
      'Public-facing media compilation: founder interview clips, product overview video, press highlights, and brand sizzle reel.',
    assetCount: 9,
    status: 'published',
    createdAt: 'Jan 18, 2026',
    audience: 'public',
  },
];

// =============================================================================
// PLAYLISTS (4 items)
// =============================================================================

export const PLAYLISTS: Playlist[] = [
  {
    id: 'pl-1',
    title: 'Valuetainment Season Highlights 2025-26',
    description:
      'Complete season highlight package — top plays, broadcast clips, and post-game interviews from every Valuetainment conference game.',
    itemCount: 22,
    duration: '1h 14m',
    category: 'Sports',
    visibility: 'public',
  },
  {
    id: 'pl-2',
    title: 'Valuetainment Product Demos — Internal',
    description:
      'Chronological collection of all internal product demo recordings, from MVP through OS v2 launch.',
    itemCount: 8,
    duration: '42m',
    category: 'Product',
    visibility: 'private',
  },
  {
    id: 'pl-3',
    title: 'Valuetainment Race Day Recaps',
    description:
      'Race-day recap videos with telemetry overlay, post-race analysis, and driver interviews for each Valuetainment round.',
    itemCount: 14,
    duration: '2h 6m',
    category: 'Racing',
    visibility: 'unlisted',
  },
  {
    id: 'pl-4',
    title: '2819 Church Worship Archives',
    description:
      'Multi-cam worship recordings from 2819 Church Sunday services, campus events, and special programs.',
    itemCount: 18,
    duration: '3h 30m',
    category: 'Faith',
    visibility: 'private',
  },
];

// =============================================================================
// CASE STUDIES (3 items)
// =============================================================================

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'cs-1',
    title: 'Valuetainment — Transforming HBCU Game Day',
    client: 'Carroll College',
    category: 'Sports',
    status: 'published',
    publishedAt: 'Jan 30, 2026',
    summary:
      'How Valuetainment OS powered Valuetainment basketball with real-time analytics, automated highlight generation, and fan engagement tools — delivering measurable media value growth in the first season.',
    metrics: [
      { label: 'Media Value Y1', value: '$53M\u2013$157M' },
      { label: 'Highlight Clips Generated', value: '1,240+' },
      { label: 'Fan Engagement Lift', value: '+34%' },
    ],
  },
  {
    id: 'cs-2',
    title: '2819 Church Campus — Multi-Site Worship Technology',
    client: 'Int\u2019l Church of Christ LA',
    category: 'Faith',
    status: 'published',
    publishedAt: 'Feb 5, 2026',
    summary:
      'Deploying Valuetainment OS across 3 2819 Church campuses for unified multi-cam worship capture, sermon archival, and congregation engagement — reducing production overhead by 60%.',
    metrics: [
      { label: 'Campuses Connected', value: '3' },
      { label: 'Production Cost Savings', value: '60%' },
      { label: 'Sermon Archive Growth', value: '180+ hrs' },
    ],
  },
  {
    id: 'cs-3',
    title: 'PBD Podcast — Data-Driven Race Day',
    client: 'PBD Podcast Series',
    category: 'Racing',
    status: 'draft',
    summary:
      'Integrating live telemetry feeds, race-day overlay graphics, and post-race analysis into the Valuetainment OS platform — enabling data-driven storytelling and fan-facing race recaps.',
    metrics: [
      { label: 'Races Covered', value: '14' },
      { label: 'Telemetry Data Points / Race', value: '48K+' },
      { label: 'Viewer Retention Lift', value: '+22%' },
    ],
  },
];

// =============================================================================
// PRESS ITEMS (5 items)
// =============================================================================

export const PRESS_ITEMS: PressItem[] = [
  {
    id: 'pr-1',
    title: 'Valuetainment Raises Pre-Seed to Power HBCU Sports Tech',
    outlet: 'TechCrunch',
    date: 'Jan 15, 2026',
    type: 'article',
    url: 'https://techcrunch.com/valuetainment-pre-seed',
    sentiment: 'positive',
  },
  {
    id: 'pr-2',
    title: 'Alex Morgan on Building an OS for Organizations',
    outlet: 'Valuetainment',
    date: 'Feb 2, 2026',
    type: 'podcast',
    url: 'https://valuetainment.com/about',
    sentiment: 'positive',
  },
  {
    id: 'pr-3',
    title: 'PBD Names Valuetainment Among Top 10 Startups to Watch',
    outlet: 'PBD Podcast',
    date: 'Jan 28, 2026',
    type: 'mention',
    url: 'https://pbd.com/top10',
    sentiment: 'positive',
  },
  {
    id: 'pr-4',
    title: 'Valuetainment Partners with Carroll College for 2025-26 Basketball Season',
    outlet: 'HBCU Gameday',
    date: 'Dec 12, 2025',
    type: 'article',
    sentiment: 'positive',
  },
  {
    id: 'pr-5',
    title: 'Alex Morgan Interview — Founder Story & Vision',
    outlet: 'The Hustle Daily',
    date: 'Feb 10, 2026',
    type: 'interview',
    url: 'https://thehustle.co/valuetainment-interview',
    sentiment: 'neutral',
  },
];

// =============================================================================
// RIGHTS ITEMS (4 items)
// =============================================================================

export const RIGHTS_ITEMS: RightsItem[] = [
  {
    id: 'ri-1',
    assetTitle: 'Valuetainment Game Broadcast Footage — 2025-26 Season',
    licenseType: 'Exclusive Media Rights',
    holder: 'Carroll College',
    expiryDate: 'Aug 31, 2026',
    status: 'active',
    territory: 'United States',
  },
  {
    id: 'ri-2',
    assetTitle: '2819 Church Worship Recordings — All Campuses',
    licenseType: 'Non-Exclusive License',
    holder: 'Int\u2019l Church of Christ LA',
    expiryDate: 'Dec 31, 2026',
    status: 'active',
    territory: 'Worldwide',
  },
  {
    id: 'ri-3',
    assetTitle: 'Valuetainment Race Telemetry & Overlay Graphics',
    licenseType: 'Partnership License',
    holder: 'PBD Podcast Series',
    expiryDate: 'Mar 15, 2026',
    status: 'expiring_soon',
    territory: 'North America',
  },
  {
    id: 'ri-4',
    assetTitle: 'Valuetainment Brand Kit — Third-Party Usage',
    licenseType: 'Trademark License',
    holder: 'Valuetainment Media LLC',
    expiryDate: 'Jan 1, 2025',
    status: 'expired',
    territory: 'Worldwide',
  },
];

// =============================================================================
// SHARE LINKS (5 items)
// =============================================================================

export const SHARE_LINKS: ShareLink[] = [
  {
    id: 'sl-1',
    title: 'Investor Demo — February 2026',
    url: 'https://share.valuetainment.com/inv-demo-feb26',
    targetAudience: 'Investors',
    expiresAt: 'Mar 15, 2026',
    views: 47,
    status: 'active',
    watermarked: true,
  },
  {
    id: 'sl-2',
    title: 'Valuetainment Highlight Reel — Public',
    url: 'https://share.valuetainment.com/fmu-highlights',
    targetAudience: 'Public',
    expiresAt: 'Jun 30, 2026',
    views: 312,
    status: 'active',
    watermarked: false,
  },
  {
    id: 'sl-3',
    title: 'Board Pack Media Attachments',
    url: 'https://share.valuetainment.com/board-media-q1',
    targetAudience: 'Board Members',
    expiresAt: 'Feb 28, 2026',
    views: 8,
    status: 'active',
    watermarked: true,
  },
  {
    id: 'sl-4',
    title: 'Partner API Demo Recording',
    url: 'https://share.valuetainment.com/partner-api-demo',
    targetAudience: 'Partners',
    expiresAt: 'Apr 1, 2026',
    views: 23,
    status: 'active',
    watermarked: true,
  },
  {
    id: 'sl-5',
    title: 'Pitch Deck — December 2025',
    url: 'https://share.valuetainment.com/pitch-dec25',
    targetAudience: 'Investors',
    expiresAt: 'Jan 31, 2026',
    views: 89,
    status: 'expired',
    watermarked: true,
  },
];
