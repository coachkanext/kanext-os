/**
 * Education Organization Rooms V2 — Mock Data & Types
 * Operational / governance / incident / project / committee rooms across
 * the KaNeXT Church education portfolio (org-wide + KaNeXT).
 */

// =============================================================================
// TYPES
// =============================================================================

export type EduRoomType = 'ops' | 'governance' | 'incident' | 'project' | 'committee';
export type RoomDomain = 'admissions' | 'academics' | 'campus' | 'athletics' | 'financial' | 'policies';
export type RoomStatus = 'active' | 'quiet' | 'archived';
export type RoomAccess = 'open' | 'restricted' | 'confidential';
export type RoomScope = 'organization' | 'institution' | 'department';

export interface EduOrgRoom {
  id: string;
  name: string;
  type: EduRoomType;
  domain: RoomDomain;
  status: RoomStatus;
  access: RoomAccess;
  scope: RoomScope;
  institution?: string;        // e.g. 'KaNeXT' — undefined for org-level
  department?: string;
  owner: string;
  memberCount: number;
  description: string;
  // Activity
  lastActivity: string;        // ISO timestamp
  pendingItems: number;
  urgentItems: number;
  // Governance extras (only for governance/committee rooms)
  governance?: GovernanceRoomExtra;
  // Incident extras
  incident?: { severity: 'critical' | 'high' | 'medium'; resolvedAt?: string };
}

export interface GovernanceRoomExtra {
  nextMeeting: string;         // ISO date
  pendingDecisions: number;
  pendingApprovals: number;
  documentsCount: number;
}

// =============================================================================
// LABEL / COLOR CONSTANTS
// =============================================================================

export const ROOM_TYPE_LABELS: Record<EduRoomType, string> = {
  ops: 'Operations',
  governance: 'Governance',
  incident: 'Incident',
  project: 'Project',
  committee: 'Committee',
};

export const ROOM_TYPE_COLORS: Record<EduRoomType, string> = {
  ops: '#6AA9FF',
  governance: '#A78BFA',
  incident: '#EF4444',
  project: '#F59E0B',
  committee: '#22C55E',
};

export const ROOM_DOMAIN_LABELS: Record<RoomDomain, string> = {
  admissions: 'Admissions',
  academics: 'Academics',
  campus: 'Campus',
  athletics: 'Athletics',
  financial: 'Financial',
  policies: 'Policies',
};

export const ROOM_DOMAIN_COLORS: Record<RoomDomain, string> = {
  admissions: '#6AA9FF',
  academics: '#A78BFA',
  campus: '#22C55E',
  athletics: '#F59E0B',
  financial: '#EF4444',
  policies: '#8B5CF6',
};

export const ROOM_DOMAIN_ICONS: Record<RoomDomain, string> = {
  admissions: 'person.badge.plus',
  academics: 'book.fill',
  campus: 'building.2.fill',
  athletics: 'sportscourt.fill',
  financial: 'dollarsign.circle.fill',
  policies: 'doc.text.fill',
};

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  active: 'Active',
  quiet: 'Quiet',
  archived: 'Archived',
};

export const ROOM_STATUS_COLORS: Record<RoomStatus, string> = {
  active: '#22C55E',
  quiet: '#F59E0B',
  archived: '#8F8F8F',
};

export const ROOM_ACCESS_LABELS: Record<RoomAccess, string> = {
  open: 'Open',
  restricted: 'Restricted',
  confidential: 'Confidential',
};

export const ROOM_ACCESS_COLORS: Record<RoomAccess, string> = {
  open: '#22C55E',
  restricted: '#F59E0B',
  confidential: '#EF4444',
};

export const ROOM_SCOPE_LABELS: Record<RoomScope, string> = {
  organization: 'Organization',
  institution: 'Institution',
  department: 'Department',
};

export const ROOM_SCOPE_COLORS: Record<RoomScope, string> = {
  organization: '#8B5CF6',
  institution: '#6AA9FF',
  department: '#22C55E',
};

export const INCIDENT_SEVERITY_COLORS: Record<string, string> = {
  critical: '#EF4444',
  high: '#F59E0B',
  medium: '#6AA9FF',
};

export const INCIDENT_SEVERITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
};

// =============================================================================
// SEEDED ROOMS (~20)
// =============================================================================

const ROOMS: EduOrgRoom[] = [
  // --- ORG-LEVEL ---
  {
    id: 'er-org-board',
    name: 'Board Room',
    type: 'governance',
    domain: 'policies',
    status: 'active',
    access: 'confidential',
    scope: 'organization',
    owner: 'Exec. Director',
    memberCount: 12,
    description: 'Board-level governance — strategic decisions, fiduciary oversight, and institutional approvals.',
    lastActivity: '2026-02-18T09:30:00Z',
    pendingItems: 4,
    urgentItems: 1,
    governance: { nextMeeting: '2026-02-25', pendingDecisions: 3, pendingApprovals: 2, documentsCount: 18 },
  },
  {
    id: 'er-org-partnerships',
    name: 'Partnerships',
    type: 'ops',
    domain: 'policies',
    status: 'active',
    access: 'restricted',
    scope: 'organization',
    owner: 'VP Partnerships',
    memberCount: 8,
    description: 'Cross-institution partnership coordination, MOUs, and joint-program management.',
    lastActivity: '2026-02-17T16:00:00Z',
    pendingItems: 3,
    urgentItems: 0,
  },
  {
    id: 'er-org-compliance-council',
    name: 'Compliance Council',
    type: 'governance',
    domain: 'policies',
    status: 'active',
    access: 'confidential',
    scope: 'organization',
    owner: 'Chief Compliance Officer',
    memberCount: 9,
    description: 'Org-wide compliance oversight — Title IV, Title IX, accreditation, audit prep.',
    lastActivity: '2026-02-18T08:15:00Z',
    pendingItems: 6,
    urgentItems: 2,
    governance: { nextMeeting: '2026-02-21', pendingDecisions: 4, pendingApprovals: 3, documentsCount: 24 },
  },
  {
    id: 'er-org-financial-controls',
    name: 'Financial Controls Committee',
    type: 'committee',
    domain: 'financial',
    status: 'active',
    access: 'confidential',
    scope: 'organization',
    owner: 'CFO',
    memberCount: 7,
    description: 'Financial oversight — budget variances, audit responses, endowment drawdowns.',
    lastActivity: '2026-02-17T14:30:00Z',
    pendingItems: 5,
    urgentItems: 1,
    governance: { nextMeeting: '2026-02-24', pendingDecisions: 2, pendingApprovals: 4, documentsCount: 15 },
  },

  // --- KaNeXT (KaNeXT Sports) ---
  {
    id: 'er-fmu-admissions',
    name: 'Admissions Ops',
    type: 'ops',
    domain: 'admissions',
    status: 'active',
    access: 'restricted',
    scope: 'institution',
    institution: 'KaNeXT',
    owner: 'Dir. Admissions',
    memberCount: 14,
    description: 'KaNeXT admissions funnel — applications, reviews, yield campaigns, deposit tracking.',
    lastActivity: '2026-02-18T10:45:00Z',
    pendingItems: 22,
    urgentItems: 5,
  },
  {
    id: 'er-fmu-registrar',
    name: 'Registrar Ops',
    type: 'ops',
    domain: 'academics',
    status: 'active',
    access: 'restricted',
    scope: 'institution',
    institution: 'KaNeXT',
    owner: 'Registrar',
    memberCount: 8,
    description: 'Course registration, schedule building, transcript processing, degree audits.',
    lastActivity: '2026-02-18T11:00:00Z',
    pendingItems: 15,
    urgentItems: 3,
  },
  {
    id: 'er-fmu-housing',
    name: 'Housing Ops',
    type: 'ops',
    domain: 'campus',
    status: 'active',
    access: 'open',
    scope: 'institution',
    institution: 'KaNeXT',
    owner: 'Dir. Residential Life',
    memberCount: 11,
    description: 'Housing assignments, RA coordination, maintenance, occupancy tracking.',
    lastActivity: '2026-02-18T09:00:00Z',
    pendingItems: 9,
    urgentItems: 2,
  },
  {
    id: 'er-fmu-budget',
    name: 'Budget & Approvals',
    type: 'ops',
    domain: 'financial',
    status: 'active',
    access: 'confidential',
    scope: 'institution',
    institution: 'KaNeXT',
    owner: 'CFO – KaNeXT',
    memberCount: 6,
    description: 'Budget requests, PO approvals, variance tracking, fiscal-year close.',
    lastActivity: '2026-02-17T15:30:00Z',
    pendingItems: 8,
    urgentItems: 3,
  },
  {
    id: 'er-fmu-success',
    name: 'Student Success Ops',
    type: 'ops',
    domain: 'academics',
    status: 'active',
    access: 'restricted',
    scope: 'institution',
    institution: 'KaNeXT',
    owner: 'Dean of Students',
    memberCount: 10,
    description: 'Retention interventions, early-alert triage, academic advising queue.',
    lastActivity: '2026-02-18T08:30:00Z',
    pendingItems: 18,
    urgentItems: 4,
  },
  {
    id: 'er-fmu-compliance',
    name: 'Compliance Council',
    type: 'governance',
    domain: 'policies',
    status: 'active',
    access: 'confidential',
    scope: 'institution',
    institution: 'KaNeXT',
    owner: 'Compliance Officer',
    memberCount: 7,
    description: 'KaNeXT-specific compliance — Title IV status, Clery, FERPA, accreditation prep.',
    lastActivity: '2026-02-17T13:00:00Z',
    pendingItems: 5,
    urgentItems: 1,
    governance: { nextMeeting: '2026-02-22', pendingDecisions: 2, pendingApprovals: 1, documentsCount: 12 },
  },
  {
    id: 'er-fmu-academic-council',
    name: 'Academic Council',
    type: 'governance',
    domain: 'academics',
    status: 'active',
    access: 'restricted',
    scope: 'institution',
    institution: 'KaNeXT',
    owner: 'Provost',
    memberCount: 15,
    description: 'Curriculum decisions, program reviews, faculty affairs, accreditation responses.',
    lastActivity: '2026-02-16T16:00:00Z',
    pendingItems: 7,
    urgentItems: 0,
    governance: { nextMeeting: '2026-02-23', pendingDecisions: 5, pendingApprovals: 2, documentsCount: 20 },
  },
  {
    id: 'er-fmu-enrollment-crisis',
    name: 'Enrollment Crisis',
    type: 'incident',
    domain: 'admissions',
    status: 'active',
    access: 'confidential',
    scope: 'institution',
    institution: 'KaNeXT',
    owner: 'VP Enrollment',
    memberCount: 6,
    description: 'Active incident — KaNeXT Fall 2026 deposits 22% below target. War-room triage.',
    lastActivity: '2026-02-18T11:15:00Z',
    pendingItems: 12,
    urgentItems: 8,
    incident: { severity: 'critical' },
  },

];

// =============================================================================
// OVERVIEW TILES
// =============================================================================

export interface RoomsOverviewTiles {
  totalRooms: number;
  activeRooms: number;
  byType: Record<EduRoomType, number>;
  byDomain: Record<RoomDomain, number>;
  byScope: Record<RoomScope, number>;
  incidentCount: number;
  governanceCount: number;
  totalPending: number;
  totalUrgent: number;
}

function computeOverview(rooms: EduOrgRoom[]): RoomsOverviewTiles {
  const byType = { ops: 0, governance: 0, incident: 0, project: 0, committee: 0 } as Record<EduRoomType, number>;
  const byDomain = { admissions: 0, academics: 0, campus: 0, athletics: 0, financial: 0, policies: 0 } as Record<RoomDomain, number>;
  const byScope = { organization: 0, institution: 0, department: 0 } as Record<RoomScope, number>;
  let totalPending = 0;
  let totalUrgent = 0;

  for (const r of rooms) {
    byType[r.type] = (byType[r.type] || 0) + 1;
    byDomain[r.domain] = (byDomain[r.domain] || 0) + 1;
    byScope[r.scope] = (byScope[r.scope] || 0) + 1;
    totalPending += r.pendingItems;
    totalUrgent += r.urgentItems;
  }

  return {
    totalRooms: rooms.length,
    activeRooms: rooms.filter((r) => r.status === 'active').length,
    byType,
    byDomain,
    byScope,
    incidentCount: byType.incident,
    governanceCount: byType.governance + byType.committee,
    totalPending,
    totalUrgent,
  };
}

// =============================================================================
// FACTORY
// =============================================================================

export function getEduRoomsV2Data() {
  return {
    rooms: ROOMS,
    overviewTiles: computeOverview(ROOMS),
  };
}
