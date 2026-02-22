/**
 * Resources Hub v2 — Mock Data
 * Sports Mode-only resource data for the Organization tab.
 * Basketball program knowledge base: library, packs, drills, plays, scouting, etc.
 */

// =============================================================================
// TYPES
// =============================================================================

export type ResourcesTabId =
  | 'library'
  | 'packs'
  | 'templates'
  | 'drillbook'
  | 'playbook'
  | 'scouting'
  | 'ops'
  | 'forms'
  | 'saved-nexus'
  | 'links'
  | 'reports'
  | 'audit'
  | 'settings';

export interface ResourcesTab {
  id: ResourcesTabId;
  label: string;
}

export interface ResourcesScopeChip {
  key: string;
  label: string;
}

export type ResourceType = 'doc' | 'link' | 'template' | 'pack' | 'nexus_snapshot';
export type ResourceVisibility = 'staff-only' | 'coaches-only' | 'players-visible' | 'public-read';
export type ResourceCategory =
  | 'library'
  | 'packs'
  | 'templates'
  | 'drillbook'
  | 'playbook'
  | 'scouting'
  | 'ops'
  | 'forms'
  | 'saved-nexus'
  | 'links';

export interface LibraryCollection {
  id: string;
  name: string;
  itemCount: number;
  icon: string;
  description: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  type: ResourceType;
  category: ResourceCategory;
  scope: string;
  owner: string;
  ownerInitials: string;
  visibility: ResourceVisibility;
  tags: string[];
  linkedTo?: string[];
  createdAt: string;
  updatedAt: string;
  version?: string;
  pinned?: boolean;
}

export interface ResourcePack {
  id: string;
  title: string;
  description: string;
  itemCount: number;
  items: string[];
  assignedTo?: string;
  completionStatus?: string;
  owner: string;
  ownerInitials: string;
  createdAt: string;
  updatedAt: string;
  scope: string;
}

export interface ResourceTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  lastUsed?: string;
  usageCount: number;
  owner: string;
  ownerInitials: string;
  version: string;
  status: 'active' | 'draft' | 'archived';
}

export interface ResourceDrill {
  id: string;
  name: string;
  category: 'shooting' | 'finishing' | 'ball-handling' | 'defense' | 'rebounding' | 'conditioning';
  goal: string;
  setupPoints: number;
  teachingPoints: number;
  progressions: number;
  timeMinutes: number;
  reps?: number;
  equipment: string[];
  skillTags: string[];
  videoLink?: string;
  owner: string;
  ownerInitials: string;
}

export interface ResourcePlay {
  id: string;
  name: string;
  alias?: string;
  side: 'offense' | 'defense';
  purposeTags: string[];
  personnel: string;
  teachingPoints: number;
  counters: number;
  filmExamples: number;
  status: 'active' | 'shelved';
  owner: string;
  ownerInitials: string;
}

export interface ResourceScoutingItem {
  id: string;
  title: string;
  type: 'template' | 'coverage-rules' | 'tagging-reference' | 'opponent-pack';
  description: string;
  lastUpdated: string;
  owner: string;
  ownerInitials: string;
}

export interface ResourceOpsSOP {
  id: string;
  title: string;
  description: string;
  category: 'game-day' | 'travel' | 'equipment' | 'media-day' | 'compliance';
  lastReviewed: string;
  owner: string;
  ownerInitials: string;
  version: string;
}

export interface ResourceForm {
  id: string;
  title: string;
  description: string;
  category: 'travel' | 'medical' | 'conduct' | 'recruiting' | 'onboarding';
  requiresAcknowledgment: boolean;
  acknowledgedCount?: number;
  totalCount?: number;
  owner: string;
  ownerInitials: string;
  lastUpdated: string;
}

export interface ResourceNexusSnapshot {
  id: string;
  title: string;
  snapshotType: 'eval' | 'scouting' | 'simulation' | 'halftime-packet' | 'postgame-packet';
  context: string;
  createdBy: string;
  createdByInitials: string;
  createdAt: string;
  linkedEntity?: string;
}

export interface ResourceLink {
  id: string;
  title: string;
  url: string;
  platform: 'synergy' | 'drive' | 'youtube' | 'website' | 'docs' | 'other';
  pinned: boolean;
  scope: string;
  addedBy: string;
  addedByInitials: string;
  addedAt: string;
}

export interface ResourceReport {
  id: string;
  title: string;
  type: string;
  period: string;
  generatedAt: string;
  format: 'PDF' | 'CSV' | 'XLSX';
  size: string;
}

export interface ResourceAuditEntry {
  id: string;
  action: string;
  actor: string;
  actorInitials: string;
  target: string;
  timestamp: string;
  detail?: string;
}

export interface ResourceSettingToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface ResourcesData {
  collections: LibraryCollection[];
  libraryItems: ResourceItem[];
  packs: ResourcePack[];
  templates: ResourceTemplate[];
  drills: ResourceDrill[];
  plays: ResourcePlay[];
  scoutingItems: ResourceScoutingItem[];
  opsSops: ResourceOpsSOP[];
  forms: ResourceForm[];
  nexusSnapshots: ResourceNexusSnapshot[];
  links: ResourceLink[];
  reports: ResourceReport[];
  audit: ResourceAuditEntry[];
  settings: ResourceSettingToggle[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const RESOURCES_TABS: ResourcesTab[] = [
  { id: 'library', label: 'Library' },
  { id: 'packs', label: 'Packs' },
  { id: 'templates', label: 'Templates' },
  { id: 'drillbook', label: 'Drillbook' },
  { id: 'playbook', label: 'Playbook' },
  { id: 'scouting', label: 'Scouting' },
  { id: 'ops', label: 'Ops' },
  { id: 'forms', label: 'Forms' },
  { id: 'saved-nexus', label: 'Saved Nexus' },
  { id: 'links', label: 'Links' },
  { id: 'reports', label: 'Reports' },
  { id: 'audit', label: 'Audit' },
  { id: 'settings', label: 'Settings' },
];

export const RESOURCES_SCOPE_CHIPS: ResourcesScopeChip[] = [
  { key: 'organization', label: 'Organization' },
  { key: 'program', label: 'Program' },
  { key: 'season', label: 'Season' },
];

export const DRILL_CATEGORY_COLOR: Record<ResourceDrill['category'], string> = {
  shooting: '#EF4444',
  finishing: '#F59E0B',
  'ball-handling': '#F59E0B',
  defense: '#1D9BF0',
  rebounding: '#22C55E',
  conditioning: '#1D9BF0',
};

export const PLAY_STATUS_COLOR: Record<ResourcePlay['status'], string> = {
  active: '#22C55E',
  shelved: '#A1A1AA',
};

export const TEMPLATE_STATUS_COLOR: Record<ResourceTemplate['status'], string> = {
  active: '#22C55E',
  draft: '#F59E0B',
  archived: '#A1A1AA',
};

export const VISIBILITY_COLOR: Record<ResourceVisibility, string> = {
  'staff-only': '#EF4444',
  'coaches-only': '#F59E0B',
  'players-visible': '#1D9BF0',
  'public-read': '#22C55E',
};

export const LINK_PLATFORM_COLOR: Record<ResourceLink['platform'], string> = {
  synergy: '#F59E0B',
  drive: '#1D9BF0',
  youtube: '#EF4444',
  website: '#22C55E',
  docs: '#1D9BF0',
  other: '#A1A1AA',
};

// =============================================================================
// MOCK DATA — LIBRARY COLLECTIONS
// =============================================================================

const collections: LibraryCollection[] = [
  {
    id: 'col-001',
    name: 'Coaching Philosophy',
    itemCount: 4,
    icon: 'book.fill',
    description: 'Core coaching values, program pillars, and identity documents.',
  },
  {
    id: 'col-002',
    name: 'Terminology & Calls',
    itemCount: 6,
    icon: 'textformat.abc',
    description: 'Standardized play calls, defensive calls, and signal language.',
  },
  {
    id: 'col-003',
    name: 'Practice Plans',
    itemCount: 8,
    icon: 'clipboard.fill',
    description: 'Weekly and daily practice plan archives for the current season.',
  },
  {
    id: 'col-004',
    name: 'Drill Library',
    itemCount: 15,
    icon: 'figure.run',
    description: 'Full catalog of drills organized by skill category.',
  },
  {
    id: 'col-005',
    name: 'Offensive Playbook',
    itemCount: 12,
    icon: 'sportscourt.fill',
    description: 'Sets, quick hitters, transition actions, and BLOB/SLOB plays.',
  },
  {
    id: 'col-006',
    name: 'Defensive Playbook',
    itemCount: 10,
    icon: 'shield.fill',
    description: 'Man-to-man principles, zone sets, and ball screen coverages.',
  },
  {
    id: 'col-007',
    name: 'Special Situations',
    itemCount: 8,
    icon: 'exclamationmark.triangle.fill',
    description: 'End-of-game, ATO, press break, and inbound situations.',
  },
  {
    id: 'col-008',
    name: 'Scouting Templates',
    itemCount: 5,
    icon: 'binoculars.fill',
    description: 'Standardized templates for opponent scouting and film tagging.',
  },
  {
    id: 'col-009',
    name: 'Ops SOPs',
    itemCount: 6,
    icon: 'gearshape.2.fill',
    description: 'Standard operating procedures for game day, travel, and equipment.',
  },
  {
    id: 'col-010',
    name: 'Forms & Waivers',
    itemCount: 7,
    icon: 'doc.text.fill',
    description: 'Official forms, waivers, and acknowledgment documents.',
  },
  {
    id: 'col-011',
    name: 'Development Curriculum',
    itemCount: 9,
    icon: 'chart.bar.fill',
    description: 'Player development tracks, skill progressions, and evaluation rubrics.',
  },
  {
    id: 'col-012',
    name: 'Staff Training / Learning',
    itemCount: 4,
    icon: 'graduationcap.fill',
    description: 'Onboarding materials, coaching education, and professional development.',
  },
];

// =============================================================================
// MOCK DATA — LIBRARY ITEMS
// =============================================================================

const libraryItems: ResourceItem[] = [
  {
    id: 'res-001',
    title: 'KaNeXT MBB Coaching Philosophy',
    type: 'doc',
    category: 'library',
    scope: 'program',
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
    visibility: 'staff-only',
    tags: ['philosophy', 'identity', 'core-values'],
    createdAt: 'Jan 5, 2026',
    updatedAt: 'Jan 20, 2026',
    version: '2.0',
    pinned: true,
  },
  {
    id: 'res-002',
    title: 'Offensive Terminology Sheet',
    type: 'doc',
    category: 'library',
    scope: 'program',
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
    visibility: 'coaches-only',
    tags: ['terminology', 'offense', 'calls'],
    createdAt: 'Jan 8, 2026',
    updatedAt: 'Jan 28, 2026',
  },
  {
    id: 'res-003',
    title: 'Week 12 Practice Plan',
    type: 'doc',
    category: 'library',
    scope: 'season',
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
    visibility: 'staff-only',
    tags: ['practice', 'weekly-plan', 'week-12'],
    createdAt: 'Feb 10, 2026',
    updatedAt: 'Feb 10, 2026',
  },
  {
    id: 'res-004',
    title: 'Shell Defense Teaching Progression',
    type: 'link',
    category: 'library',
    scope: 'program',
    owner: 'Tanya Brooks',
    ownerInitials: 'TB',
    visibility: 'coaches-only',
    tags: ['defense', 'shell', 'teaching', 'progression'],
    linkedTo: ['Shell Defense Pack'],
    createdAt: 'Jan 15, 2026',
    updatedAt: 'Feb 3, 2026',
  },
  {
    id: 'res-005',
    title: 'Travel Conduct Policy',
    type: 'doc',
    category: 'library',
    scope: 'program',
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
    visibility: 'players-visible',
    tags: ['travel', 'conduct', 'policy'],
    createdAt: 'Jan 3, 2026',
    updatedAt: 'Jan 3, 2026',
    pinned: true,
  },
  {
    id: 'res-006',
    title: 'Recruiting Contact Log Template',
    type: 'template',
    category: 'library',
    scope: 'program',
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
    visibility: 'staff-only',
    tags: ['recruiting', 'contact-log', 'template'],
    createdAt: 'Jan 12, 2026',
    updatedAt: 'Jan 25, 2026',
    version: '1.1',
  },
  {
    id: 'res-007',
    title: 'Film Study — BCU Scouting Report',
    type: 'link',
    category: 'library',
    scope: 'season',
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
    visibility: 'coaches-only',
    tags: ['film', 'scouting', 'BCU', 'opponent'],
    linkedTo: ['Opponent Pack: BCU Panthers'],
    createdAt: 'Feb 5, 2026',
    updatedAt: 'Feb 7, 2026',
  },
  {
    id: 'res-008',
    title: 'Player Development Plan — Guard Track',
    type: 'doc',
    category: 'library',
    scope: 'program',
    owner: 'Tanya Brooks',
    ownerInitials: 'TB',
    visibility: 'staff-only',
    tags: ['development', 'guard', 'player-plan'],
    createdAt: 'Jan 10, 2026',
    updatedAt: 'Feb 1, 2026',
    version: '1.3',
  },
];

// =============================================================================
// MOCK DATA — PACKS
// =============================================================================

const packs: ResourcePack[] = [
  {
    id: 'pack-001',
    title: 'Opponent Pack: BCU Panthers',
    description: 'Full scouting package for the BCU Panthers conference matchup.',
    itemCount: 6,
    items: [
      'BCU Scout Report',
      'BCU Film Links',
      'BCU Play Tendencies',
      'BCU Personnel Chart',
      'BCU Defensive Coverage Sheet',
      'Press Break Set vs BCU',
    ],
    assignedTo: 'Coaching Staff',
    completionStatus: '4/6 viewed',
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
    createdAt: 'Feb 3, 2026',
    updatedAt: 'Feb 7, 2026',
    scope: 'season',
  },
  {
    id: 'pack-002',
    title: 'Press Break Pack',
    description: 'Complete press break preparation package with plays, teaching video, and drill sequence.',
    itemCount: 4,
    items: [
      'Primary Press Break Play',
      'Secondary Press Break Option',
      'Press Break Teaching Video',
      'Press Break Drill Sequence',
    ],
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
    createdAt: 'Jan 18, 2026',
    updatedAt: 'Jan 22, 2026',
    scope: 'program',
  },
  {
    id: 'pack-003',
    title: 'Shell Defense Pack',
    description: 'Shell defense fundamentals package covering overview, drills, film, common mistakes, and evaluation.',
    itemCount: 5,
    items: [
      'Shell Defense Overview',
      'Shell Drill Progressions',
      'Shell Defense Film Clips',
      'Common Mistakes Breakdown',
      'Shell Defense Evaluation Rubric',
    ],
    assignedTo: 'Players',
    completionStatus: '2/5 viewed',
    owner: 'Tanya Brooks',
    ownerInitials: 'TB',
    createdAt: 'Jan 20, 2026',
    updatedAt: 'Feb 4, 2026',
    scope: 'program',
  },
  {
    id: 'pack-004',
    title: 'Player Dev Pack: Shooting',
    description: 'Shooting development resources including form breakdown, drill plans, and progress tracking.',
    itemCount: 6,
    items: [
      'Shooting Form Breakdown',
      'Catch-and-Shoot Drills',
      'Off-Dribble Drills',
      'Spot-Up Shooting Plan',
      'Shooting Progress Tracker',
      'Shooting Film Examples',
    ],
    owner: 'Tanya Brooks',
    ownerInitials: 'TB',
    createdAt: 'Jan 14, 2026',
    updatedAt: 'Feb 6, 2026',
    scope: 'program',
  },
  {
    id: 'pack-005',
    title: 'Game Day Prep Pack',
    description: 'Game day operations package with SOPs, templates, and review frameworks.',
    itemCount: 4,
    items: [
      'Game Day SOP',
      'Scouting Summary Template',
      'Halftime Packet Template',
      'Postgame Review Template',
    ],
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
    createdAt: 'Jan 6, 2026',
    updatedAt: 'Jan 15, 2026',
    scope: 'program',
  },
];

// =============================================================================
// MOCK DATA — TEMPLATES
// =============================================================================

const templates: ResourceTemplate[] = [
  {
    id: 'tmpl-001',
    title: 'Practice Plan Template',
    description: 'Standard daily practice plan with time blocks, drill slots, and teaching emphasis sections.',
    category: 'Practice',
    lastUsed: 'Feb 12, 2026',
    usageCount: 42,
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
    version: '3.1',
    status: 'active',
  },
  {
    id: 'tmpl-002',
    title: 'Scout Report Template',
    description: 'Opponent scouting report shell with personnel, tendencies, and key actions sections.',
    category: 'Scouting',
    lastUsed: 'Feb 6, 2026',
    usageCount: 18,
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
    version: '2.0',
    status: 'active',
  },
  {
    id: 'tmpl-003',
    title: 'Game Plan Template',
    description: 'Pre-game plan document with offensive/defensive keys, matchup notes, and special situations.',
    category: 'Game Plan',
    lastUsed: 'Feb 7, 2026',
    usageCount: 12,
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
    version: '2.2',
    status: 'active',
  },
  {
    id: 'tmpl-004',
    title: 'Player Development Plan Template',
    description: 'Individual player development track with skill targets, drill assignments, and evaluation checkpoints.',
    category: 'Development',
    lastUsed: 'Jan 30, 2026',
    usageCount: 8,
    owner: 'Tanya Brooks',
    ownerInitials: 'TB',
    version: '1.5',
    status: 'active',
  },
  {
    id: 'tmpl-005',
    title: 'Travel Itinerary Template',
    description: 'Road trip itinerary with departure times, hotel info, meal schedule, and walkthrough details.',
    category: 'Operations',
    lastUsed: 'Feb 1, 2026',
    usageCount: 6,
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
    version: '1.2',
    status: 'active',
  },
  {
    id: 'tmpl-006',
    title: 'Postgame Review Template',
    description: 'Structured postgame debrief with stat review, film notes, and action items for next practice.',
    category: 'Game Plan',
    lastUsed: 'Feb 8, 2026',
    usageCount: 15,
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
    version: '2.0',
    status: 'active',
  },
  {
    id: 'tmpl-007',
    title: 'Halftime Packet Template',
    description: 'In-game halftime adjustment packet with stat splits, key plays, and second-half emphasis.',
    category: 'Game Plan',
    lastUsed: 'Feb 8, 2026',
    usageCount: 10,
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
    version: '1.0',
    status: 'active',
  },
  {
    id: 'tmpl-008',
    title: 'Recruiting Eval Snapshot Template',
    description: 'Quick evaluation snapshot for recruits with measurables, film grades, and fit assessment.',
    category: 'Recruiting',
    lastUsed: 'Jan 22, 2026',
    usageCount: 3,
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
    version: '0.9',
    status: 'draft',
  },
];

// =============================================================================
// MOCK DATA — DRILLS
// =============================================================================

const drills: ResourceDrill[] = [
  {
    id: 'drill-001',
    name: '3-Man Weave',
    category: 'shooting',
    goal: 'Build passing rhythm and finish with a layup or jumper in transition.',
    setupPoints: 3,
    teachingPoints: 3,
    progressions: 2,
    timeMinutes: 8,
    equipment: ['ball'],
    skillTags: ['passing', 'transition', 'finishing'],
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
  },
  {
    id: 'drill-002',
    name: 'Mikan Drill',
    category: 'finishing',
    goal: 'Develop ambidextrous finishing around the rim with proper footwork.',
    setupPoints: 1,
    teachingPoints: 2,
    progressions: 3,
    timeMinutes: 5,
    reps: 20,
    equipment: ['ball'],
    skillTags: ['finishing', 'footwork', 'touch'],
    owner: 'Tanya Brooks',
    ownerInitials: 'TB',
  },
  {
    id: 'drill-003',
    name: 'Cone Handle Series',
    category: 'ball-handling',
    goal: 'Improve ball-handling speed, control, and change-of-direction moves.',
    setupPoints: 4,
    teachingPoints: 4,
    progressions: 3,
    timeMinutes: 10,
    equipment: ['ball', 'cones'],
    skillTags: ['ball-handling', 'change-of-direction', 'control'],
    owner: 'Tanya Brooks',
    ownerInitials: 'TB',
  },
  {
    id: 'drill-004',
    name: 'Shell Defense Rotation',
    category: 'defense',
    goal: 'Teach help-side rotation, closeouts, and recovery in a shell formation.',
    setupPoints: 4,
    teachingPoints: 5,
    progressions: 2,
    timeMinutes: 12,
    equipment: ['ball', 'cones'],
    skillTags: ['defense', 'rotation', 'closeout', 'communication'],
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
  },
  {
    id: 'drill-005',
    name: 'Box Out Circuit',
    category: 'rebounding',
    goal: 'Reinforce box-out technique and positioning for defensive rebounding.',
    setupPoints: 3,
    teachingPoints: 3,
    progressions: 2,
    timeMinutes: 8,
    equipment: ['ball', 'pads'],
    skillTags: ['rebounding', 'box-out', 'positioning'],
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
  },
  {
    id: 'drill-006',
    name: '17s',
    category: 'conditioning',
    goal: 'Build anaerobic endurance with sideline-to-sideline sprints under time pressure.',
    setupPoints: 1,
    teachingPoints: 1,
    progressions: 0,
    timeMinutes: 6,
    equipment: [],
    skillTags: ['conditioning', 'endurance', 'sprinting'],
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
  },
  {
    id: 'drill-007',
    name: 'Spot-Up Shooting',
    category: 'shooting',
    goal: 'Develop consistent catch-and-shoot form from five perimeter spots.',
    setupPoints: 2,
    teachingPoints: 3,
    progressions: 4,
    timeMinutes: 10,
    reps: 50,
    equipment: ['ball', 'shooting machine'],
    skillTags: ['shooting', 'catch-and-shoot', 'form'],
    owner: 'Tanya Brooks',
    ownerInitials: 'TB',
  },
  {
    id: 'drill-008',
    name: 'Closeout Drill',
    category: 'defense',
    goal: 'Practice controlled closeouts with choppy feet and active hands.',
    setupPoints: 3,
    teachingPoints: 4,
    progressions: 2,
    timeMinutes: 8,
    equipment: ['ball', 'cones'],
    skillTags: ['defense', 'closeout', 'footwork', 'contest'],
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
  },
];

// =============================================================================
// MOCK DATA — PLAYS
// =============================================================================

const plays: ResourcePlay[] = [
  {
    id: 'play-001',
    name: 'Fist',
    alias: '1',
    side: 'offense',
    purposeTags: ['quick hitter'],
    personnel: '5-out',
    teachingPoints: 3,
    counters: 2,
    filmExamples: 4,
    status: 'active',
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
  },
  {
    id: 'play-002',
    name: 'Horns Flare',
    alias: '21',
    side: 'offense',
    purposeTags: ['set play'],
    personnel: '4-out 1-in',
    teachingPoints: 5,
    counters: 3,
    filmExamples: 6,
    status: 'active',
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
  },
  {
    id: 'play-003',
    name: 'Drag PNR',
    side: 'offense',
    purposeTags: ['ball screen'],
    personnel: '5-out',
    teachingPoints: 4,
    counters: 3,
    filmExamples: 5,
    status: 'active',
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
  },
  {
    id: 'play-004',
    name: 'BLOB Box',
    side: 'offense',
    purposeTags: ['BLOB'],
    personnel: 'box set',
    teachingPoints: 3,
    counters: 1,
    filmExamples: 3,
    status: 'active',
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
  },
  {
    id: 'play-005',
    name: 'Delay',
    side: 'offense',
    purposeTags: ['transition'],
    personnel: '5-out',
    teachingPoints: 2,
    counters: 1,
    filmExamples: 2,
    status: 'shelved',
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
  },
  {
    id: 'play-006',
    name: 'ICE',
    side: 'defense',
    purposeTags: ['ball screen coverage'],
    personnel: 'all personnel',
    teachingPoints: 4,
    counters: 2,
    filmExamples: 5,
    status: 'active',
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
  },
  {
    id: 'play-007',
    name: 'Switch',
    side: 'defense',
    purposeTags: ['ball screen coverage'],
    personnel: 'switchable personnel',
    teachingPoints: 3,
    counters: 2,
    filmExamples: 4,
    status: 'active',
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
  },
  {
    id: 'play-008',
    name: '1-2-2 Zone',
    side: 'defense',
    purposeTags: ['zone defense'],
    personnel: 'all personnel',
    teachingPoints: 5,
    counters: 3,
    filmExamples: 3,
    status: 'shelved',
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
  },
];

// =============================================================================
// MOCK DATA — SCOUTING ITEMS
// =============================================================================

const scoutingItems: ResourceScoutingItem[] = [
  {
    id: 'scout-001',
    title: 'Opponent Scout Report Template',
    type: 'template',
    description: 'Standard scouting report shell for conference opponents.',
    lastUpdated: 'Jan 28, 2026',
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
  },
  {
    id: 'scout-002',
    title: 'PNR Coverage Rules Sheet',
    type: 'coverage-rules',
    description: 'Ball screen coverage decision tree by personnel matchup.',
    lastUpdated: 'Feb 2, 2026',
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
  },
  {
    id: 'scout-003',
    title: 'Synergy Tagging Language Reference',
    type: 'tagging-reference',
    description: 'Standard tagging codes for Synergy film breakdown.',
    lastUpdated: 'Jan 15, 2026',
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
  },
  {
    id: 'scout-004',
    title: 'Opponent Pack: BCU',
    type: 'opponent-pack',
    description: 'Full scouting package for BCU Panthers.',
    lastUpdated: 'Feb 7, 2026',
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
  },
  {
    id: 'scout-005',
    title: 'Opponent Pack: SFAT',
    type: 'opponent-pack',
    description: 'Full scouting package for South Ridgemont A&T.',
    lastUpdated: 'Jan 30, 2026',
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
  },
];

// =============================================================================
// MOCK DATA — OPS SOPS
// =============================================================================

const opsSops: ResourceOpsSOP[] = [
  {
    id: 'sop-001',
    title: 'Game Day Operations SOP',
    description: 'End-to-end game day procedures from arrival to postgame.',
    category: 'game-day',
    lastReviewed: 'Feb 1, 2026',
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
    version: '2.1',
  },
  {
    id: 'sop-002',
    title: 'Travel Operations SOP',
    description: 'Road trip logistics including bus, hotel, meals, and walkthroughs.',
    category: 'travel',
    lastReviewed: 'Jan 20, 2026',
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
    version: '1.4',
  },
  {
    id: 'sop-003',
    title: 'Equipment Management SOP',
    description: 'Uniform tracking, laundry rotation, and equipment checkout procedures.',
    category: 'equipment',
    lastReviewed: 'Jan 10, 2026',
    owner: 'Tanya Brooks',
    ownerInitials: 'TB',
    version: '1.1',
  },
  {
    id: 'sop-004',
    title: 'Media Day Operations SOP',
    description: 'Media day setup, player rotation schedule, and photo/video coordination.',
    category: 'media-day',
    lastReviewed: 'Jan 5, 2026',
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
    version: '1.0',
  },
  {
    id: 'sop-005',
    title: 'Compliance Procedures SOP',
    description: 'NCCAA eligibility checks, contact log requirements, and reporting deadlines.',
    category: 'compliance',
    lastReviewed: 'Jan 25, 2026',
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
    version: '1.2',
  },
];

// =============================================================================
// MOCK DATA — FORMS
// =============================================================================

const forms: ResourceForm[] = [
  {
    id: 'form-001',
    title: 'Travel Waiver',
    description: 'Liability waiver required before all team travel.',
    category: 'travel',
    requiresAcknowledgment: true,
    acknowledgedCount: 12,
    totalCount: 13,
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
    lastUpdated: 'Jan 15, 2026',
  },
  {
    id: 'form-002',
    title: 'Medical Release Form',
    description: 'Authorization for medical treatment and emergency contact information.',
    category: 'medical',
    requiresAcknowledgment: true,
    acknowledgedCount: 13,
    totalCount: 13,
    owner: 'Tanya Brooks',
    ownerInitials: 'TB',
    lastUpdated: 'Jan 8, 2026',
  },
  {
    id: 'form-003',
    title: 'Code of Conduct Agreement',
    description: 'Team rules, expectations, and behavioral standards acknowledgment.',
    category: 'conduct',
    requiresAcknowledgment: true,
    acknowledgedCount: 13,
    totalCount: 13,
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
    lastUpdated: 'Jan 3, 2026',
  },
  {
    id: 'form-004',
    title: 'Recruiting Contact Authorization',
    description: 'Authorization for staff to contact prospective student-athletes.',
    category: 'recruiting',
    requiresAcknowledgment: true,
    acknowledgedCount: 3,
    totalCount: 5,
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
    lastUpdated: 'Jan 20, 2026',
  },
  {
    id: 'form-005',
    title: 'Staff Onboarding Checklist',
    description: 'New staff member onboarding tasks and orientation materials.',
    category: 'onboarding',
    requiresAcknowledgment: false,
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
    lastUpdated: 'Jan 12, 2026',
  },
  {
    id: 'form-006',
    title: 'Equipment Checkout Form',
    description: 'Form for checking out practice and game equipment.',
    category: 'travel',
    requiresAcknowledgment: false,
    owner: 'Tanya Brooks',
    ownerInitials: 'TB',
    lastUpdated: 'Jan 18, 2026',
  },
];

// =============================================================================
// MOCK DATA — SAVED NEXUS SNAPSHOTS
// =============================================================================

const nexusSnapshots: ResourceNexusSnapshot[] = [
  {
    id: 'snap-001',
    title: 'BCU Scouting Analysis',
    snapshotType: 'scouting',
    context: 'vs BCU — Feb 8, 2026',
    createdBy: 'Alex Morgan',
    createdByInitials: 'SK',
    createdAt: 'Feb 6, 2026',
    linkedEntity: 'game-bcu-feb8',
  },
  {
    id: 'snap-002',
    title: 'Mid-Season Eval — Guard Rotation',
    snapshotType: 'eval',
    context: 'Program — 2025-26 Season',
    createdBy: 'Alex Morgan',
    createdByInitials: 'SK',
    createdAt: 'Jan 28, 2026',
  },
  {
    id: 'snap-003',
    title: 'Playoff Simulation — Bracket A',
    snapshotType: 'simulation',
    context: 'NCCAA Tournament 2026',
    createdBy: 'Alex Morgan',
    createdByInitials: 'SK',
    createdAt: 'Feb 10, 2026',
  },
  {
    id: 'snap-004',
    title: 'Halftime Packet — vs SFAT',
    snapshotType: 'halftime-packet',
    context: 'vs SFAT — Feb 1, 2026',
    createdBy: 'Marcus Reed',
    createdByInitials: 'MR',
    createdAt: 'Feb 1, 2026',
    linkedEntity: 'game-sfat-feb1',
  },
  {
    id: 'snap-005',
    title: 'Postgame Report — vs Ridgemont',
    snapshotType: 'postgame-packet',
    context: 'vs Ridgemont — Jan 25, 2026',
    createdBy: 'Alex Morgan',
    createdByInitials: 'SK',
    createdAt: 'Jan 25, 2026',
    linkedEntity: 'game-lincoln-jan25',
  },
];

// =============================================================================
// MOCK DATA — EXTERNAL LINKS
// =============================================================================

const links: ResourceLink[] = [
  {
    id: 'link-001',
    title: 'KaNeXT MBB Synergy Portal',
    url: 'https://synergy.kanext.edu/mbb',
    platform: 'synergy',
    pinned: true,
    scope: 'program',
    addedBy: 'Marcus Reed',
    addedByInitials: 'MR',
    addedAt: 'Jan 5, 2026',
  },
  {
    id: 'link-002',
    title: 'Coaching Staff Drive Folder',
    url: 'https://drive.google.com/drive/folders/fmu-mbb-staff',
    platform: 'drive',
    pinned: true,
    scope: 'program',
    addedBy: 'Alex Morgan',
    addedByInitials: 'SK',
    addedAt: 'Jan 3, 2026',
  },
  {
    id: 'link-003',
    title: 'KaNeXT MBB Film Playlist',
    url: 'https://youtube.com/playlist?list=fmu-mbb-film',
    platform: 'youtube',
    pinned: true,
    scope: 'program',
    addedBy: 'Marcus Reed',
    addedByInitials: 'MR',
    addedAt: 'Jan 8, 2026',
  },
  {
    id: 'link-004',
    title: 'KaNeXT Athletics Website',
    url: 'https://athletics.kanext.edu',
    platform: 'website',
    pinned: false,
    scope: 'organization',
    addedBy: 'Alex Morgan',
    addedByInitials: 'SK',
    addedAt: 'Jan 3, 2026',
  },
  {
    id: 'link-005',
    title: 'Practice Plan Archive',
    url: 'https://docs.google.com/spreadsheets/fmu-practice-archive',
    platform: 'docs',
    pinned: false,
    scope: 'season',
    addedBy: 'Tanya Brooks',
    addedByInitials: 'TB',
    addedAt: 'Jan 10, 2026',
  },
  {
    id: 'link-006',
    title: 'NCCAA Compliance Portal',
    url: 'https://nccaa.org/compliance',
    platform: 'website',
    pinned: false,
    scope: 'organization',
    addedBy: 'Alex Morgan',
    addedByInitials: 'SK',
    addedAt: 'Jan 5, 2026',
  },
];

// =============================================================================
// MOCK DATA — REPORTS
// =============================================================================

const reports: ResourceReport[] = [
  {
    id: 'rpt-001',
    title: 'Resources Inventory Export',
    type: 'Inventory',
    period: 'Jan 1 – Feb 14, 2026',
    generatedAt: 'Feb 14, 2026',
    format: 'PDF',
    size: '1.8 MB',
  },
  {
    id: 'rpt-002',
    title: 'Packs Content Summary',
    type: 'Content Summary',
    period: 'Jan 1 – Feb 14, 2026',
    generatedAt: 'Feb 14, 2026',
    format: 'XLSX',
    size: '420 KB',
  },
  {
    id: 'rpt-003',
    title: 'Form Acknowledgment Log',
    type: 'Acknowledgment',
    period: '2025-26 Season',
    generatedAt: 'Feb 13, 2026',
    format: 'CSV',
    size: '85 KB',
  },
  {
    id: 'rpt-004',
    title: 'Most-Used Resources — Last 30 Days',
    type: 'Usage',
    period: 'Jan 15 – Feb 14, 2026',
    generatedAt: 'Feb 14, 2026',
    format: 'PDF',
    size: '680 KB',
  },
];

// =============================================================================
// MOCK DATA — AUDIT LOG
// =============================================================================

const audit: ResourceAuditEntry[] = [
  {
    id: 'aud-001',
    action: 'resource_created',
    actor: 'Alex Morgan',
    actorInitials: 'SK',
    target: 'Week 12 Practice Plan',
    timestamp: 'Feb 10, 2026 — 9:15 AM',
    detail: 'Created new practice plan document in Library.',
  },
  {
    id: 'aud-002',
    action: 'pack_created',
    actor: 'Marcus Reed',
    actorInitials: 'MR',
    target: 'Opponent Pack: BCU Panthers',
    timestamp: 'Feb 3, 2026 — 2:30 PM',
    detail: 'Created scouting pack with 6 items for BCU matchup.',
  },
  {
    id: 'aud-003',
    action: 'resource_updated',
    actor: 'Tanya Brooks',
    actorInitials: 'TB',
    target: 'Shell Defense Teaching Progression',
    timestamp: 'Feb 3, 2026 — 11:00 AM',
    detail: 'Updated link and added new film clip references.',
  },
  {
    id: 'aud-004',
    action: 'template_cloned',
    actor: 'Alex Morgan',
    actorInitials: 'SK',
    target: 'Practice Plan Template',
    timestamp: 'Feb 1, 2026 — 8:45 AM',
    detail: 'Cloned template for Week 11 practice plan.',
  },
  {
    id: 'aud-005',
    action: 'form_acknowledged',
    actor: 'Marcus Reed',
    actorInitials: 'MR',
    target: 'Travel Waiver',
    timestamp: 'Jan 28, 2026 — 3:20 PM',
    detail: 'Acknowledged travel waiver for BCU road trip.',
  },
  {
    id: 'aud-006',
    action: 'link_added',
    actor: 'Alex Morgan',
    actorInitials: 'SK',
    target: 'NCCAA Compliance Portal',
    timestamp: 'Jan 25, 2026 — 10:00 AM',
    detail: 'Added external link to NCCAA compliance portal.',
  },
  {
    id: 'aud-007',
    action: 'snapshot_saved',
    actor: 'Alex Morgan',
    actorInitials: 'SK',
    target: 'Postgame Report — vs Ridgemont',
    timestamp: 'Jan 25, 2026 — 10:45 PM',
    detail: 'Saved Nexus postgame packet after Ridgemont game.',
  },
  {
    id: 'aud-008',
    action: 'setting_changed',
    actor: 'Alex Morgan',
    actorInitials: 'SK',
    target: 'Allow Players to View Practice Plans',
    timestamp: 'Jan 20, 2026 — 4:00 PM',
    detail: 'Enabled player access to practice plan documents.',
  },
];

// =============================================================================
// MOCK DATA — SETTINGS
// =============================================================================

const settings: ResourceSettingToggle[] = [
  {
    id: 'set-001',
    label: 'Default Visibility for New Resources',
    description: 'Set the default visibility level for newly created resources.',
    enabled: true,
  },
  {
    id: 'set-002',
    label: 'Allow Players to View Practice Plans',
    description: 'When enabled, players can view practice plan documents shared with them.',
    enabled: true,
  },
  {
    id: 'set-003',
    label: 'Require Version Tracking for Templates',
    description: 'Enforce version numbering when templates are updated.',
    enabled: true,
  },
  {
    id: 'set-004',
    label: 'Auto-Archive Resources After Season End',
    description: 'Automatically move season-scoped resources to archive when the season ends.',
    enabled: false,
  },
  {
    id: 'set-005',
    label: 'External Link Allowlist Only',
    description: 'Restrict external links to approved domains only.',
    enabled: false,
  },
];

// =============================================================================
// GETTER
// =============================================================================

export function getResourcesData(): ResourcesData {
  return {
    collections,
    libraryItems,
    packs,
    templates,
    drills,
    plays,
    scoutingItems,
    opsSops,
    forms,
    nexusSnapshots,
    links,
    reports,
    audit,
    settings,
  };
}
