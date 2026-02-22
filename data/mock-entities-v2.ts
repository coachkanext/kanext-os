/**
 * Business Entities v2 — Unified Entity Directory
 *
 * Extends the original entity data (mock-entities.ts) into a unified directory
 * covering 12 entity types: Companies, Departments, Projects, Tasks,
 * Opportunities, Clients/Partners, Resources, Decisions, Policies, Evidence,
 * plus an Audit log. Used by the Business Mode entities hub.
 */

// =============================================================================
// TYPES
// =============================================================================

/** Entity lifecycle status */
export type EntityStatus = 'proposed' | 'active' | 'blocked' | 'complete' | 'archived';

/** The 10 concrete entity types (excludes "All" and "Audit" which are virtual) */
export type EntityType =
  | 'company'
  | 'department'
  | 'project'
  | 'task'
  | 'opportunity'
  | 'client-partner'
  | 'resource'
  | 'decision'
  | 'policy'
  | 'evidence';

/** Unified entity record for the flat directory */
export interface UnifiedEntity {
  id: string;
  name: string;
  type: EntityType;
  scope: string;
  owner: string;
  ownerInitials: string;
  status: EntityStatus;
  lastActivityAt: string;
  lastActivityMs: number;
  createdAt: string;
  avatarColor: string;
  /** Type-specific context — milestone, due date, stage, etc. */
  contextField?: string;
  hasRoom?: boolean;
  roomId?: string;
  /** Monetary value (opportunities) */
  value?: number;
}

/** Scope chip for top-level scope filter */
export interface EntityScopeChip {
  key: string;
  label: string;
}

/** Directory tab identifier */
export type EntitiesTabId =
  | 'all'
  | 'companies'
  | 'departments'
  | 'projects'
  | 'tasks'
  | 'opportunities'
  | 'clients-partners'
  | 'resources'
  | 'decisions'
  | 'policies'
  | 'evidence'
  | 'audit';

/** Tab definition */
export interface EntitiesTab {
  id: EntitiesTabId;
  label: string;
}

/** Filter/sort state */
export interface EntityFilterState {
  companies: string[];
  departments: string[];
  owners: string[];
  statuses: EntityStatus[];
  sort: 'recent' | 'newest' | 'az' | 'owner';
}

/** Create-entity sheet template */
export interface CreateEntityTemplate {
  type: EntityType;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

/** Audit trail entry */
export interface EntityAuditEntry {
  id: string;
  entityId: string;
  entityName: string;
  action: string;
  actor: string;
  timestamp: string;
  timestampMs: number;
}

/** Linked object reference (for entity detail) */
export interface EntityLinkedObject {
  id: string;
  name: string;
  type: EntityType;
  status: EntityStatus;
}

// =============================================================================
// CONSTANTS — TABS
// =============================================================================

export const ENTITIES_TABS: EntitiesTab[] = [
  { id: 'all', label: 'All' },
  { id: 'companies', label: 'Companies' },
  { id: 'departments', label: 'Departments' },
  { id: 'projects', label: 'Projects' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'opportunities', label: 'Opportunities' },
  { id: 'clients-partners', label: 'Clients/Partners' },
  { id: 'resources', label: 'Resources' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'policies', label: 'Policies' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'audit', label: 'Audit' },
];

// =============================================================================
// CONSTANTS — SCOPE CHIPS
// =============================================================================

export const ENTITY_SCOPE_CHIPS: EntityScopeChip[] = [
  { key: 'all', label: 'All Business' },
  { key: 'my-companies', label: 'My Companies' },
  { key: 'kanext', label: 'KaNeXT' },
  { key: 'product', label: 'Product' },
];

// =============================================================================
// CONSTANTS — CREATE TEMPLATES
// =============================================================================

export const CREATE_ENTITY_TEMPLATES: CreateEntityTemplate[] = [
  { type: 'company', label: 'Company', icon: 'building.2.fill', adminOnly: true },
  { type: 'department', label: 'Department', icon: 'rectangle.3.group.fill', adminOnly: true },
  { type: 'project', label: 'Project', icon: 'folder.fill' },
  { type: 'task', label: 'Task', icon: 'checkmark.circle.fill' },
  { type: 'opportunity', label: 'Opportunity', icon: 'dollarsign.circle.fill' },
  { type: 'client-partner', label: 'Client/Partner', icon: 'person.2.fill' },
  { type: 'resource', label: 'Resource/Template', icon: 'doc.text.fill' },
  { type: 'decision', label: 'Decision', icon: 'scale.3d' },
  { type: 'policy', label: 'Policy', icon: 'doc.badge.gearshape.fill' },
  { type: 'evidence', label: 'Evidence Link', icon: 'link.circle.fill' },
];

// =============================================================================
// CONSTANTS — COLOR / ICON MAPS
// =============================================================================

export const STATUS_COLOR_MAP: Record<EntityStatus, string> = {
  proposed: '#8F8F8F',
  active: '#22C55E',
  blocked: '#EF4444',
  complete: '#6AA9FF',
  archived: '#64748B',
};

export const TYPE_ICON_MAP: Record<EntityType, string> = {
  company: 'building.2.fill',
  department: 'rectangle.3.group.fill',
  project: 'folder.fill',
  task: 'checkmark.circle.fill',
  opportunity: 'dollarsign.circle.fill',
  'client-partner': 'person.2.fill',
  resource: 'doc.text.fill',
  decision: 'scale.3d',
  policy: 'doc.badge.gearshape.fill',
  evidence: 'link.circle.fill',
};

export const TYPE_COLOR_MAP: Record<EntityType, string> = {
  company: '#FFFFFF',
  department: '#6AA9FF',
  project: '#7A5CFF',
  task: '#F59E0B',
  opportunity: '#22C55E',
  'client-partner': '#14B8A6',
  resource: '#F472B6',
  decision: '#EF4444',
  policy: '#64748B',
  evidence: '#A78BFA',
};

// =============================================================================
// MOCK DATA — UNIFIED ENTITIES
// =============================================================================

export const UNIFIED_ENTITIES: UnifiedEntity[] = [
  // ── Companies (2) ──
  {
    id: 'ue-company-kanext',
    name: 'KaNeXT',
    type: 'company',
    scope: 'KaNeXT',
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
    status: 'active',
    lastActivityAt: '2h ago',
    lastActivityMs: Date.now() - 2 * 60 * 60 * 1000,
    createdAt: '2024-03-01',
    avatarColor: '#FFFFFF',
    contextField: 'Founded 2024 · 12 people',
    hasRoom: true,
    roomId: 'room-kanext-hq',
  },
  {
    id: 'ue-company-events',
    name: 'KaNeXT Events LLC',
    type: 'company',
    scope: 'KaNeXT Events',
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
    status: 'active',
    lastActivityAt: '1d ago',
    lastActivityMs: Date.now() - 24 * 60 * 60 * 1000,
    createdAt: '2025-06-15',
    avatarColor: '#EF4444',
    contextField: 'Founded 2025 · 3 people',
    hasRoom: true,
    roomId: 'room-events-hq',
  },

  // ── Departments (4) ──
  {
    id: 'ue-dept-product',
    name: 'Product',
    type: 'department',
    scope: 'KaNeXT',
    owner: 'Jessica Chen',
    ownerInitials: 'JC',
    status: 'active',
    lastActivityAt: '45m ago',
    lastActivityMs: Date.now() - 45 * 60 * 1000,
    createdAt: '2024-06-01',
    avatarColor: '#6AA9FF',
    contextField: '5 people · 3 active projects',
    hasRoom: true,
    roomId: 'room-product',
  },
  {
    id: 'ue-dept-engineering',
    name: 'Engineering',
    type: 'department',
    scope: 'KaNeXT',
    owner: 'Adewale Ogundimu',
    ownerInitials: 'AO',
    status: 'active',
    lastActivityAt: '20m ago',
    lastActivityMs: Date.now() - 20 * 60 * 1000,
    createdAt: '2024-06-01',
    avatarColor: '#22C55E',
    contextField: '4 people · 2 active projects',
    hasRoom: true,
    roomId: 'room-engineering',
  },
  {
    id: 'ue-dept-sales',
    name: 'Sales',
    type: 'department',
    scope: 'KaNeXT',
    owner: 'Marcus Williams',
    ownerInitials: 'MW',
    status: 'active',
    lastActivityAt: '1h ago',
    lastActivityMs: Date.now() - 60 * 60 * 1000,
    createdAt: '2024-09-01',
    avatarColor: '#F59E0B',
    contextField: '3 people · 4 open opportunities',
    hasRoom: true,
    roomId: 'room-sales',
  },
  {
    id: 'ue-dept-marketing',
    name: 'Marketing',
    type: 'department',
    scope: 'KaNeXT',
    owner: 'Sarah Okafor',
    ownerInitials: 'SO',
    status: 'active',
    lastActivityAt: '3h ago',
    lastActivityMs: Date.now() - 3 * 60 * 60 * 1000,
    createdAt: '2024-10-01',
    avatarColor: '#F472B6',
    contextField: '2 people · 1 active project',
    hasRoom: true,
    roomId: 'room-marketing',
  },

  // ── Projects (5) ──
  {
    id: 'ue-proj-v2-launch',
    name: 'Platform V2 Launch',
    type: 'project',
    scope: 'KaNeXT \u2192 Engineering',
    owner: 'Adewale Ogundimu',
    ownerInitials: 'AO',
    status: 'active',
    lastActivityAt: '30m ago',
    lastActivityMs: Date.now() - 30 * 60 * 1000,
    createdAt: '2025-09-01',
    avatarColor: '#7A5CFF',
    contextField: 'Next milestone: Jun 30',
    hasRoom: true,
    roomId: 'room-v2-launch',
  },
  {
    id: 'ue-proj-mlk-classic',
    name: 'MLK Classic 2027',
    type: 'project',
    scope: 'KaNeXT Events \u2192 Events',
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
    status: 'proposed',
    lastActivityAt: '2d ago',
    lastActivityMs: Date.now() - 2 * 24 * 60 * 60 * 1000,
    createdAt: '2026-01-10',
    avatarColor: '#EF4444',
    contextField: 'Next milestone: Jan 18, 2027',
    hasRoom: false,
  },
  {
    id: 'ue-proj-sales-pipeline',
    name: 'Sales Pipeline Revamp',
    type: 'project',
    scope: 'KaNeXT \u2192 Sales',
    owner: 'Marcus Williams',
    ownerInitials: 'MW',
    status: 'active',
    lastActivityAt: '4h ago',
    lastActivityMs: Date.now() - 4 * 60 * 60 * 1000,
    createdAt: '2025-12-01',
    avatarColor: '#F59E0B',
    contextField: 'Next milestone: Apr 15',
    hasRoom: true,
    roomId: 'room-sales-pipeline',
  },
  {
    id: 'ue-proj-rebrand',
    name: 'Marketing Rebrand',
    type: 'project',
    scope: 'KaNeXT \u2192 Marketing',
    owner: 'Sarah Okafor',
    ownerInitials: 'SO',
    status: 'active',
    lastActivityAt: '6h ago',
    lastActivityMs: Date.now() - 6 * 60 * 60 * 1000,
    createdAt: '2025-11-15',
    avatarColor: '#F472B6',
    contextField: 'Next milestone: May 1',
    hasRoom: true,
    roomId: 'room-rebrand',
  },
  {
    id: 'ue-proj-mobile-app',
    name: 'Mobile App',
    type: 'project',
    scope: 'KaNeXT \u2192 Engineering',
    owner: 'Adewale Ogundimu',
    ownerInitials: 'AO',
    status: 'active',
    lastActivityAt: '1h ago',
    lastActivityMs: Date.now() - 60 * 60 * 1000,
    createdAt: '2025-08-01',
    avatarColor: '#22C55E',
    contextField: 'Next milestone: Apr 30',
    hasRoom: true,
    roomId: 'room-mobile-app',
  },

  // ── Tasks (6) ──
  {
    id: 'ue-task-pitch-deck',
    name: 'Finalize Series A pitch deck',
    type: 'task',
    scope: 'KaNeXT',
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
    status: 'active',
    lastActivityAt: '1h ago',
    lastActivityMs: Date.now() - 60 * 60 * 1000,
    createdAt: '2026-01-15',
    avatarColor: '#F59E0B',
    contextField: 'Due: Mar 1',
  },
  {
    id: 'ue-task-wireframes',
    name: 'Complete V2 wireframes',
    type: 'task',
    scope: 'KaNeXT \u2192 Product',
    owner: 'Jessica Chen',
    ownerInitials: 'JC',
    status: 'active',
    lastActivityAt: '2h ago',
    lastActivityMs: Date.now() - 2 * 60 * 60 * 1000,
    createdAt: '2026-01-20',
    avatarColor: '#6AA9FF',
    contextField: 'Due: Feb 28',
  },
  {
    id: 'ue-task-settlement-api',
    name: 'Implement settlement rails API',
    type: 'task',
    scope: 'KaNeXT \u2192 Engineering',
    owner: 'Adewale Ogundimu',
    ownerInitials: 'AO',
    status: 'proposed',
    lastActivityAt: '3d ago',
    lastActivityMs: Date.now() - 3 * 24 * 60 * 60 * 1000,
    createdAt: '2026-01-25',
    avatarColor: '#22C55E',
    contextField: 'Due: Apr 15',
  },
  {
    id: 'ue-task-naia-leads',
    name: 'Follow up NAIA leads',
    type: 'task',
    scope: 'KaNeXT \u2192 Sales',
    owner: 'Marcus Williams',
    ownerInitials: 'MW',
    status: 'active',
    lastActivityAt: '5h ago',
    lastActivityMs: Date.now() - 5 * 60 * 60 * 1000,
    createdAt: '2026-02-01',
    avatarColor: '#F59E0B',
    contextField: 'Due: Feb 20',
  },
  {
    id: 'ue-task-social-calendar',
    name: 'Draft social media calendar',
    type: 'task',
    scope: 'KaNeXT \u2192 Marketing',
    owner: 'Sarah Okafor',
    ownerInitials: 'SO',
    status: 'active',
    lastActivityAt: '8h ago',
    lastActivityMs: Date.now() - 8 * 60 * 60 * 1000,
    createdAt: '2026-02-05',
    avatarColor: '#F472B6',
    contextField: 'Due: Feb 25',
  },
  {
    id: 'ue-task-qa-nexus',
    name: 'QA pass Nexus voice',
    type: 'task',
    scope: 'KaNeXT \u2192 Product',
    owner: 'Jessica Chen',
    ownerInitials: 'JC',
    status: 'active',
    lastActivityAt: '12h ago',
    lastActivityMs: Date.now() - 12 * 60 * 60 * 1000,
    createdAt: '2026-02-10',
    avatarColor: '#6AA9FF',
    contextField: 'Due: Mar 15',
  },

  // ── Opportunities (4) ──
  {
    id: 'ue-opp-fmu-conference',
    name: 'KaNeXT Conference Package',
    type: 'opportunity',
    scope: 'KaNeXT \u2192 Sales',
    owner: 'Marcus Williams',
    ownerInitials: 'MW',
    status: 'active',
    lastActivityAt: '3h ago',
    lastActivityMs: Date.now() - 3 * 60 * 60 * 1000,
    createdAt: '2025-11-01',
    avatarColor: '#22C55E',
    contextField: 'Stage: Negotiation',
    value: 85000,
  },
  {
    id: 'ue-opp-naia-license',
    name: 'NAIA Institutional License',
    type: 'opportunity',
    scope: 'KaNeXT \u2192 Sales',
    owner: 'Marcus Williams',
    ownerInitials: 'MW',
    status: 'active',
    lastActivityAt: '1d ago',
    lastActivityMs: Date.now() - 24 * 60 * 60 * 1000,
    createdAt: '2025-12-10',
    avatarColor: '#22C55E',
    contextField: 'Stage: Proposal',
    value: 150000,
  },
  {
    id: 'ue-opp-mega-church',
    name: 'Mega Church Platform',
    type: 'opportunity',
    scope: 'KaNeXT \u2192 Sales',
    owner: 'Marcus Williams',
    ownerInitials: 'MW',
    status: 'active',
    lastActivityAt: '2d ago',
    lastActivityMs: Date.now() - 2 * 24 * 60 * 60 * 1000,
    createdAt: '2026-01-05',
    avatarColor: '#22C55E',
    contextField: 'Stage: Qualified',
    value: 60000,
  },
  {
    id: 'ue-opp-k12-district',
    name: 'K-12 School District',
    type: 'opportunity',
    scope: 'KaNeXT \u2192 Sales',
    owner: 'Marcus Williams',
    ownerInitials: 'MW',
    status: 'proposed',
    lastActivityAt: '4d ago',
    lastActivityMs: Date.now() - 4 * 24 * 60 * 60 * 1000,
    createdAt: '2026-01-20',
    avatarColor: '#8F8F8F',
    contextField: 'Stage: Prospect',
    value: 200000,
  },

  // ── Clients / Partners (3) ──
  {
    id: 'ue-cp-fmu',
    name: 'KaNeXT Sports',
    type: 'client-partner',
    scope: 'KaNeXT \u2192 Sales',
    owner: 'Marcus Williams',
    ownerInitials: 'MW',
    status: 'active',
    lastActivityAt: '6h ago',
    lastActivityMs: Date.now() - 6 * 60 * 60 * 1000,
    createdAt: '2025-08-15',
    avatarColor: '#14B8A6',
    contextField: 'Proof wedge partner · Active since Aug 2025',
    hasRoom: true,
    roomId: 'room-fmu-partner',
  },
  {
    id: 'ue-cp-naia',
    name: 'NAIA Conference Office',
    type: 'client-partner',
    scope: 'KaNeXT \u2192 Sales',
    owner: 'Marcus Williams',
    ownerInitials: 'MW',
    status: 'active',
    lastActivityAt: '1d ago',
    lastActivityMs: Date.now() - 24 * 60 * 60 * 1000,
    createdAt: '2025-10-01',
    avatarColor: '#14B8A6',
    contextField: 'Institutional pilot in progress',
    hasRoom: true,
    roomId: 'room-naia-partner',
  },
  {
    id: 'ue-cp-impact-church',
    name: 'Impact Church Network',
    type: 'client-partner',
    scope: 'KaNeXT \u2192 Sales',
    owner: 'Marcus Williams',
    ownerInitials: 'MW',
    status: 'proposed',
    lastActivityAt: '5d ago',
    lastActivityMs: Date.now() - 5 * 24 * 60 * 60 * 1000,
    createdAt: '2026-01-18',
    avatarColor: '#8F8F8F',
    contextField: 'Initial conversation · Church mode demo scheduled',
  },

  // ── Resources (3) ──
  {
    id: 'ue-res-pitch-deck',
    name: 'Pitch Deck Template',
    type: 'resource',
    scope: 'KaNeXT',
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
    status: 'active',
    lastActivityAt: '2d ago',
    lastActivityMs: Date.now() - 2 * 24 * 60 * 60 * 1000,
    createdAt: '2025-06-01',
    avatarColor: '#F472B6',
    contextField: 'Template · Last revised Feb 2026',
  },
  {
    id: 'ue-res-onboarding',
    name: 'Onboarding Playbook',
    type: 'resource',
    scope: 'KaNeXT \u2192 Product',
    owner: 'Jessica Chen',
    ownerInitials: 'JC',
    status: 'active',
    lastActivityAt: '3d ago',
    lastActivityMs: Date.now() - 3 * 24 * 60 * 60 * 1000,
    createdAt: '2025-07-15',
    avatarColor: '#F472B6',
    contextField: 'Playbook · V3 in review',
  },
  {
    id: 'ue-res-brand-guide',
    name: 'Brand Guidelines v2',
    type: 'resource',
    scope: 'KaNeXT \u2192 Marketing',
    owner: 'Sarah Okafor',
    ownerInitials: 'SO',
    status: 'active',
    lastActivityAt: '5d ago',
    lastActivityMs: Date.now() - 5 * 24 * 60 * 60 * 1000,
    createdAt: '2025-11-01',
    avatarColor: '#F472B6',
    contextField: 'Guidelines · Covers logo, type, color system',
  },

  // ── Decisions (3) ──
  {
    id: 'ue-dec-series-a-pricing',
    name: 'Series A Pricing Model',
    type: 'decision',
    scope: 'KaNeXT',
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
    status: 'active',
    lastActivityAt: '1d ago',
    lastActivityMs: Date.now() - 24 * 60 * 60 * 1000,
    createdAt: '2026-01-20',
    avatarColor: '#EF4444',
    contextField: 'Approval: Pending Board',
  },
  {
    id: 'ue-dec-ios-hire',
    name: 'Engineering Hire \u2014 Senior iOS',
    type: 'decision',
    scope: 'KaNeXT \u2192 Engineering',
    owner: 'Adewale Ogundimu',
    ownerInitials: 'AO',
    status: 'complete',
    lastActivityAt: '6d ago',
    lastActivityMs: Date.now() - 6 * 24 * 60 * 60 * 1000,
    createdAt: '2025-12-01',
    avatarColor: '#6AA9FF',
    contextField: 'Approval: Approved',
  },
  {
    id: 'ue-dec-event-rev-split',
    name: 'Event Revenue Split Model',
    type: 'decision',
    scope: 'KaNeXT Events',
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
    status: 'proposed',
    lastActivityAt: '3d ago',
    lastActivityMs: Date.now() - 3 * 24 * 60 * 60 * 1000,
    createdAt: '2026-02-01',
    avatarColor: '#8F8F8F',
    contextField: 'Approval: Under Review',
  },

  // ── Policies (2) ──
  {
    id: 'ue-pol-remote-work',
    name: 'Remote Work Policy',
    type: 'policy',
    scope: 'KaNeXT',
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
    status: 'active',
    lastActivityAt: '7d ago',
    lastActivityMs: Date.now() - 7 * 24 * 60 * 60 * 1000,
    createdAt: '2025-03-01',
    avatarColor: '#64748B',
    contextField: 'Effective since Mar 2025 · All departments',
  },
  {
    id: 'ue-pol-data-retention',
    name: 'Data Retention Policy',
    type: 'policy',
    scope: 'KaNeXT',
    owner: 'Adewale Ogundimu',
    ownerInitials: 'AO',
    status: 'active',
    lastActivityAt: '10d ago',
    lastActivityMs: Date.now() - 10 * 24 * 60 * 60 * 1000,
    createdAt: '2025-05-01',
    avatarColor: '#64748B',
    contextField: 'Effective since May 2025 · Engineering + Product',
  },

  // ── Evidence (3) ──
  {
    id: 'ue-ev-board-notes',
    name: 'Board Meeting Notes \u2014 Feb 2026',
    type: 'evidence',
    scope: 'KaNeXT',
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
    status: 'active',
    lastActivityAt: '6d ago',
    lastActivityMs: Date.now() - 6 * 24 * 60 * 60 * 1000,
    createdAt: '2026-02-10',
    avatarColor: '#A78BFA',
    contextField: 'Recorded: Feb 10, 2026',
  },
  {
    id: 'ue-ev-investor-call',
    name: 'Series A Investor Call Recording',
    type: 'evidence',
    scope: 'KaNeXT',
    owner: 'Alex Morgan',
    ownerInitials: 'SK',
    status: 'active',
    lastActivityAt: '11d ago',
    lastActivityMs: Date.now() - 11 * 24 * 60 * 60 * 1000,
    createdAt: '2026-02-05',
    avatarColor: '#A78BFA',
    contextField: 'Recorded: Feb 5, 2026',
  },
  {
    id: 'ue-ev-product-demo',
    name: 'Product Demo \u2014 V2 Preview',
    type: 'evidence',
    scope: 'KaNeXT \u2192 Product',
    owner: 'Jessica Chen',
    ownerInitials: 'JC',
    status: 'active',
    lastActivityAt: '19d ago',
    lastActivityMs: Date.now() - 19 * 24 * 60 * 60 * 1000,
    createdAt: '2026-01-28',
    avatarColor: '#A78BFA',
    contextField: 'Recorded: Jan 28, 2026',
  },
];

// =============================================================================
// MOCK DATA — AUDIT LOG
// =============================================================================

export const ENTITY_AUDIT_LOG: EntityAuditEntry[] = [
  {
    id: 'audit-01',
    entityId: 'ue-task-pitch-deck',
    entityName: 'Finalize Series A pitch deck',
    action: 'Status changed to Active',
    actor: 'Alex Morgan',
    timestamp: '2h ago',
    timestampMs: Date.now() - 2 * 60 * 60 * 1000,
  },
  {
    id: 'audit-02',
    entityId: 'ue-dept-engineering',
    entityName: 'Engineering',
    action: 'Linked to room #room-engineering',
    actor: 'Adewale Ogundimu',
    timestamp: '3h ago',
    timestampMs: Date.now() - 3 * 60 * 60 * 1000,
  },
  {
    id: 'audit-03',
    entityId: 'ue-opp-fmu-conference',
    entityName: 'KaNeXT Conference Package',
    action: 'Stage moved to Negotiation',
    actor: 'Marcus Williams',
    timestamp: '4h ago',
    timestampMs: Date.now() - 4 * 60 * 60 * 1000,
  },
  {
    id: 'audit-04',
    entityId: 'ue-task-wireframes',
    entityName: 'Complete V2 wireframes',
    action: 'Owner assigned: Jessica Chen',
    actor: 'Alex Morgan',
    timestamp: '6h ago',
    timestampMs: Date.now() - 6 * 60 * 60 * 1000,
  },
  {
    id: 'audit-05',
    entityId: 'ue-ev-board-notes',
    entityName: 'Board Meeting Notes \u2014 Feb 2026',
    action: 'Evidence attached to Series A Pricing Model',
    actor: 'Alex Morgan',
    timestamp: '8h ago',
    timestampMs: Date.now() - 8 * 60 * 60 * 1000,
  },
  {
    id: 'audit-06',
    entityId: 'ue-proj-v2-launch',
    entityName: 'Platform V2 Launch',
    action: 'Milestone updated: Jun 30',
    actor: 'Adewale Ogundimu',
    timestamp: '10h ago',
    timestampMs: Date.now() - 10 * 60 * 60 * 1000,
  },
  {
    id: 'audit-07',
    entityId: 'ue-dec-series-a-pricing',
    entityName: 'Series A Pricing Model',
    action: 'Created',
    actor: 'Alex Morgan',
    timestamp: '1d ago',
    timestampMs: Date.now() - 24 * 60 * 60 * 1000,
  },
  {
    id: 'audit-08',
    entityId: 'ue-cp-naia',
    entityName: 'NAIA Conference Office',
    action: 'Status changed to Active',
    actor: 'Marcus Williams',
    timestamp: '1d ago',
    timestampMs: Date.now() - 26 * 60 * 60 * 1000,
  },
  {
    id: 'audit-09',
    entityId: 'ue-pol-remote-work',
    entityName: 'Remote Work Policy',
    action: 'Policy updated \u2014 added hybrid schedule section',
    actor: 'Alex Morgan',
    timestamp: '2d ago',
    timestampMs: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'audit-10',
    entityId: 'ue-opp-naia-license',
    entityName: 'NAIA Institutional License',
    action: 'Value updated to $150,000',
    actor: 'Marcus Williams',
    timestamp: '2d ago',
    timestampMs: Date.now() - 2.5 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'audit-11',
    entityId: 'ue-proj-mlk-classic',
    entityName: 'MLK Classic 2027',
    action: 'Created',
    actor: 'Alex Morgan',
    timestamp: '3d ago',
    timestampMs: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'audit-12',
    entityId: 'ue-dec-ios-hire',
    entityName: 'Engineering Hire \u2014 Senior iOS',
    action: 'Decision approved',
    actor: 'Alex Morgan',
    timestamp: '6d ago',
    timestampMs: Date.now() - 6 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'audit-13',
    entityId: 'ue-res-pitch-deck',
    entityName: 'Pitch Deck Template',
    action: 'Resource revised \u2014 v4 uploaded',
    actor: 'Alex Morgan',
    timestamp: '6d ago',
    timestampMs: Date.now() - 6.5 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'audit-14',
    entityId: 'ue-ev-investor-call',
    entityName: 'Series A Investor Call Recording',
    action: 'Created',
    actor: 'Alex Morgan',
    timestamp: '11d ago',
    timestampMs: Date.now() - 11 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'audit-15',
    entityId: 'ue-company-kanext',
    entityName: 'KaNeXT',
    action: 'Headcount updated to 12',
    actor: 'Alex Morgan',
    timestamp: '12d ago',
    timestampMs: Date.now() - 12 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'audit-16',
    entityId: 'ue-cp-impact-church',
    entityName: 'Impact Church Network',
    action: 'Created',
    actor: 'Marcus Williams',
    timestamp: '14d ago',
    timestampMs: Date.now() - 14 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'audit-17',
    entityId: 'ue-dec-event-rev-split',
    entityName: 'Event Revenue Split Model',
    action: 'Created',
    actor: 'Alex Morgan',
    timestamp: '15d ago',
    timestampMs: Date.now() - 15 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'audit-18',
    entityId: 'ue-ev-product-demo',
    entityName: 'Product Demo \u2014 V2 Preview',
    action: 'Created',
    actor: 'Jessica Chen',
    timestamp: '19d ago',
    timestampMs: Date.now() - 19 * 24 * 60 * 60 * 1000,
  },
];

// =============================================================================
// HELPERS
// =============================================================================

/** Map tab ID → entity type for filtering */
const TAB_TO_TYPE: Record<string, EntityType> = {
  companies: 'company',
  departments: 'department',
  projects: 'project',
  tasks: 'task',
  opportunities: 'opportunity',
  'clients-partners': 'client-partner',
  resources: 'resource',
  decisions: 'decision',
  policies: 'policy',
  evidence: 'evidence',
};

/**
 * Return entities matching a tab selection.
 * - 'all' returns all entities.
 * - 'audit' returns empty (audit uses ENTITY_AUDIT_LOG directly).
 * - Other tabs filter by type.
 */
export function getEntitiesByTab(
  tabId: EntitiesTabId,
  entities: UnifiedEntity[],
): UnifiedEntity[] {
  if (tabId === 'all') return entities;
  if (tabId === 'audit') return [];
  const type = TAB_TO_TYPE[tabId];
  if (!type) return entities;
  return entities.filter((e) => e.type === type);
}

/**
 * Filter entities by search text, scope key, and status list.
 * Empty/default values pass through without filtering.
 */
export function filterEntities(
  entities: UnifiedEntity[],
  search: string,
  scope: string,
  statuses: EntityStatus[],
): UnifiedEntity[] {
  let result = entities;

  // Search — name, owner, scope, contextField
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    result = result.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.owner.toLowerCase().includes(q) ||
        e.scope.toLowerCase().includes(q) ||
        (e.contextField && e.contextField.toLowerCase().includes(q)),
    );
  }

  // Scope
  if (scope && scope !== 'all') {
    if (scope === 'my-companies') {
      // Show companies + everything scoped under them
      result = result.filter(
        (e) => e.type === 'company' || e.scope.includes('KaNeXT'),
      );
    } else if (scope === 'kanext') {
      result = result.filter((e) => e.scope.startsWith('KaNeXT'));
    } else if (scope === 'product') {
      result = result.filter(
        (e) =>
          e.scope.includes('Product') ||
          (e.type === 'department' && e.name === 'Product'),
      );
    }
  }

  // Statuses
  if (statuses.length > 0) {
    result = result.filter((e) => statuses.includes(e.status));
  }

  return result;
}

/**
 * Sort entities by the given key.
 */
export function sortEntities(
  entities: UnifiedEntity[],
  sort: EntityFilterState['sort'],
): UnifiedEntity[] {
  const sorted = [...entities];
  switch (sort) {
    case 'recent':
      return sorted.sort((a, b) => b.lastActivityMs - a.lastActivityMs);
    case 'newest':
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case 'az':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'owner':
      return sorted.sort((a, b) => a.owner.localeCompare(b.owner));
    default:
      return sorted;
  }
}
