/**
 * Workspace Templates — per-mode templates for quick workspace creation.
 * Each template pre-fills the workspace type, title, description, and default rooms.
 */

import type { Mode } from '@/types';
import type { WorkspaceType, LinkChip } from '@/types/nexus-v2';

export interface WorkspaceTemplate {
  workspace_type: WorkspaceType;
  title: string;
  description: string;
  icon: string;
  default_rooms: string[]; // room IDs to auto-link
}

// =============================================================================
// SPORTS TEMPLATES
// =============================================================================

const SPORTS_TEMPLATES: WorkspaceTemplate[] = [
  {
    workspace_type: 'season_hq',
    title: 'Season HQ',
    description: 'Full-season overview: schedule, roster, standings, goals.',
    icon: 'trophy.fill',
    default_rooms: ['rm-staff', 'rm-ops', 'rm-compliance'],
  },
  {
    workspace_type: 'game_week',
    title: 'Game Week',
    description: 'Opponent prep, scouting, game plan, travel, game day ops.',
    icon: 'calendar.badge.clock',
    default_rooms: ['rm-staff', 'rm-ops', 'rm-film', 'rm-game'],
  },
  {
    workspace_type: 'recruiting_board',
    title: 'Recruiting Board',
    description: 'Prospect tracking, evaluations, offers, visit scheduling.',
    icon: 'person.badge.plus',
    default_rooms: ['rm-recruiting', 'rm-compliance'],
  },
  {
    workspace_type: 'compliance_readiness',
    title: 'Compliance Readiness',
    description: 'Eligibility reviews, waiver tracking, audit prep.',
    icon: 'shield.checkered',
    default_rooms: ['rm-compliance', 'rm-ad'],
  },
  {
    workspace_type: 'other',
    title: 'Custom Workspace',
    description: 'Blank workspace for any purpose.',
    icon: 'folder.fill',
    default_rooms: ['rm-staff'],
  },
];

// =============================================================================
// COMPETITION TEMPLATES
// =============================================================================

const COMPETITION_TEMPLATES: WorkspaceTemplate[] = [
  {
    workspace_type: 'season_hq',
    title: 'Season HQ',
    description: 'Championship standings, race calendar, team performance.',
    icon: 'trophy.fill',
    default_rooms: ['rm-race-ops', 'rm-stewards'],
  },
  {
    workspace_type: 'race_week',
    title: 'Race Week',
    description: 'Race prep, strategy, weather, driver briefing.',
    icon: 'flag.checkered',
    default_rooms: ['rm-race-ops', 'rm-stewards', 'rm-broadcast'],
  },
  {
    workspace_type: 'sponsor_delivery',
    title: 'Sponsor Delivery',
    description: 'Sponsor obligations, activation tracking, deliverables.',
    icon: 'star.fill',
    default_rooms: ['rm-sponsor'],
  },
];

// =============================================================================
// CHURCH TEMPLATES
// =============================================================================

const CHURCH_TEMPLATES: WorkspaceTemplate[] = [
  {
    workspace_type: 'sunday_service',
    title: 'Sunday Service',
    description: 'Service planning, worship set, announcements, volunteers.',
    icon: 'music.note.list',
    default_rooms: ['rm-leadership', 'rm-ministry'],
  },
  {
    workspace_type: 'event_ops',
    title: 'Event',
    description: 'Event planning, logistics, promotion.',
    icon: 'calendar.badge.plus',
    default_rooms: ['rm-leadership', 'rm-ministry'],
  },
  {
    workspace_type: 'fundraising',
    title: 'Fundraising Campaign',
    description: 'Campaign goals, donor outreach, progress tracking.',
    icon: 'heart.fill',
    default_rooms: ['rm-leadership', 'rm-finance-ch'],
  },
];

// =============================================================================
// BUSINESS TEMPLATES
// =============================================================================

const BUSINESS_TEMPLATES: WorkspaceTemplate[] = [
  {
    workspace_type: 'org_hq',
    title: 'Company HQ',
    description: 'Company-wide overview, KPIs, team updates.',
    icon: 'building.2.fill',
    default_rooms: ['rm-exec', 'rm-ops-biz'],
  },
  {
    workspace_type: 'dataroom',
    title: 'Data Room',
    description: 'Investor materials, financials, legal documents.',
    icon: 'lock.doc.fill',
    default_rooms: ['rm-exec', 'rm-finance-biz'],
  },
  {
    workspace_type: 'case',
    title: 'Case / Project',
    description: 'Project-scoped workspace for a specific initiative.',
    icon: 'briefcase.fill',
    default_rooms: ['rm-exec', 'rm-ops-biz'],
  },
];

// =============================================================================
// EDUCATION TEMPLATES
// =============================================================================

const EDUCATION_TEMPLATES: WorkspaceTemplate[] = [
  {
    workspace_type: 'program_hq',
    title: 'Department HQ',
    description: 'Department overview, faculty, courses, goals.',
    icon: 'graduationcap.fill',
    default_rooms: ['rm-faculty', 'rm-curriculum'],
  },
  {
    workspace_type: 'event_ops',
    title: 'School Event',
    description: 'Event planning, scheduling, communication.',
    icon: 'calendar.badge.plus',
    default_rooms: ['rm-admin-ed', 'rm-faculty'],
  },
];

// =============================================================================
// REGISTRY
// =============================================================================

const TEMPLATE_MAP: Record<string, WorkspaceTemplate[]> = {
  sports: SPORTS_TEMPLATES,
  competition: COMPETITION_TEMPLATES,
  church: CHURCH_TEMPLATES,
  business: BUSINESS_TEMPLATES,
  enterprise: BUSINESS_TEMPLATES,
  education: EDUCATION_TEMPLATES,
};

export function getWorkspaceTemplates(mode: Mode): WorkspaceTemplate[] {
  return TEMPLATE_MAP[mode] || SPORTS_TEMPLATES;
}

export function getTemplateByType(mode: Mode, type: WorkspaceType): WorkspaceTemplate | undefined {
  return getWorkspaceTemplates(mode).find((t) => t.workspace_type === type);
}
