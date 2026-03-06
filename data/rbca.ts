/**
 * RBCA — Role-Based Context Access
 * Canonical tier system, permission bullets, and fast actions for all 5 views.
 */

// =============================================================================
// TIER SYSTEM
// =============================================================================

export type RBCATier = 0 | 1 | 2 | 3 | 4 | 5;

export const TIER_LABELS: Record<RBCATier, string> = {
  0: 'Public',
  1: 'Member',
  2: 'Participant',
  3: 'Staff',
  4: 'Admin',
  5: 'Executive',
};

/**
 * Derives the primary identity badge from the highest RBCA tier across all views.
 * Used in the drawer identity header as a single simplified label.
 */
export function derivePrimaryBadge(tier: RBCATier): string {
  switch (tier) {
    case 5: return 'Founder';
    case 4: return 'Admin';
    case 3: return 'Staff';
    case 2: return 'Player';
    case 1: return 'Member';
    case 0: return 'Public';
  }
}

/**
 * Maps a V2Membership.permission_tier string to the canonical RBCA tier number.
 */
export function deriveRBCATier(permissionTier: string): RBCATier {
  switch (permissionTier) {
    case 'Full':
    case 'Admin':
      return 5;
    case 'Coach':
    case 'Faculty':
    case 'Staff':
      return 3;
    case 'Athlete':
    case 'Limited':
    case 'Curated':
    case 'Acquisition':
      return 2;
    case 'Public':
    case 'Viewer':
      return 0;
    default:
      return 1;
  }
}

// =============================================================================
// FAST ACTIONS
// =============================================================================

export interface FastAction {
  icon: string;
  label: string;
  route: string;
}

export const FAST_ACTIONS: Record<string, FastAction[]> = {
  // ── Sports ──
  mem_sports_kx: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/nexus' },
    { icon: 'person.3.fill', label: 'Roster', route: '/coach/roster' },
    { icon: 'sportscourt.fill', label: 'Schedule', route: '/(tabs)' },
    { icon: 'person.badge.plus', label: 'Recruiting', route: '/coach/recruiting' },
  ],

  // ── Business ──
  mem_biz_kx: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/nexus' },
    { icon: 'chart.bar.fill', label: 'Dashboard', route: '/(tabs)' },
    { icon: 'doc.fill', label: 'Documents', route: '/(tabs)/media' },
    { icon: 'dollarsign.circle.fill', label: 'Finance', route: '/(tabs)/organization' },
  ],

  // ── Church ──
  mem_church_kx: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/nexus' },
    { icon: 'calendar', label: 'Schedule', route: '/(tabs)' },
    { icon: 'person.3.fill', label: 'Members', route: '/(tabs)' },
    { icon: 'dollarsign.circle.fill', label: 'Finance', route: '/(tabs)/organization' },
  ],

  // ── Education ──
  mem_edu_kx: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/nexus' },
    { icon: 'person.3.fill', label: 'Students', route: '/(tabs)' },
    { icon: 'doc.fill', label: 'Reports', route: '/(tabs)/organization' },
    { icon: 'calendar', label: 'Schedule', route: '/(tabs)' },
  ],

  // ── Competition ──
  mem_comp_kx: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/nexus' },
    { icon: 'calendar', label: 'Race Cal', route: '/(tabs)' },
    { icon: 'person.3.fill', label: 'Teams', route: '/(tabs)' },
    { icon: 'chart.bar.fill', label: 'Standings', route: '/(tabs)' },
  ],
};

// =============================================================================
// PERMISSION BULLETS
// =============================================================================

export const PERMISSION_BULLETS: Record<string, string[]> = {
  // ── Sports ──
  mem_sports_kx: [
    'Full roster management and scholarship allocation',
    'Game operations, scheduling, and opponent scouting',
    'Recruiting board with offer management',
    'Budget oversight and NIL pool administration',
    'Staff management across all programs',
    'Nexus AI with full institutional context',
  ],

  // ── Business ──
  mem_biz_kx: [
    'Full platform administration and governance',
    'Financial dashboards and revenue tracking',
    'Document management and data rooms',
    'Team and hiring management',
    'Product roadmap and engineering oversight',
    'Nexus AI with full executive context',
  ],

  // ── Church ──
  mem_church_kx: [
    'Full church administration and oversight',
    'Member management and pastoral care records',
    'Financial oversight and budget management',
    'Ministry leadership assignments',
    'Calendar and event management',
    'Nexus AI with full pastoral context',
  ],

  // ── Education ──
  mem_edu_kx: [
    'Full institutional administration and governance',
    'Student enrollment and progress tracking',
    'Faculty coordination and scheduling',
    'Budget oversight and financial management',
    'Compliance and accreditation oversight',
    'Nexus AI with presidential context',
  ],

  // ── Competition ──
  mem_comp_kx: [
    'Full league governance and rule management',
    'Team ownership and franchise operations',
    'Race calendar and venue management',
    'Financial oversight and revenue sharing',
    'Broadcast and media rights management',
    'Nexus AI with commissioner context',
  ],
};
