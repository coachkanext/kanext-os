/**
 * RBCA — Role-Based Context Access
 * Canonical tier system, permission bullets, and fast actions for all 21 views.
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
  mem_sports_fmu_admin: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/(tabs)/nexus' },
    { icon: 'person.3.fill', label: 'Roster', route: '/coach/roster' },
    { icon: 'sportscourt.fill', label: 'Schedule', route: '/(tabs)' },
    { icon: 'person.badge.plus', label: 'Recruiting', route: '/coach/recruiting' },
  ],
  mem_sports_kxa_athlete: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/(tabs)/nexus' },
    { icon: 'sportscourt.fill', label: 'Schedule', route: '/(tabs)' },
    { icon: 'chart.bar.fill', label: 'My Stats', route: '/(tabs)' },
    { icon: 'play.rectangle.fill', label: 'Film', route: '/(tabs)/media' },
  ],
  mem_sports_lincoln_coach: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/(tabs)/nexus' },
    { icon: 'person.badge.plus', label: 'Recruiting', route: '/coach/recruiting' },
    { icon: 'person.3.fill', label: 'Roster', route: '/coach/roster' },
    { icon: 'play.rectangle.fill', label: 'Film', route: '/(tabs)/media' },
  ],
  mem_sports_salima_limited: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/(tabs)/nexus' },
    { icon: 'person.3.fill', label: 'Roster', route: '/coach/roster' },
    { icon: 'chart.bar.fill', label: 'Reports', route: '/(tabs)' },
    { icon: 'play.rectangle.fill', label: 'Film', route: '/(tabs)/media' },
  ],
  mem_sports_yankees_viewer: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/(tabs)/nexus' },
    { icon: 'sportscourt.fill', label: 'Schedule', route: '/(tabs)' },
    { icon: 'chart.bar.fill', label: 'Stats', route: '/(tabs)' },
    { icon: 'ticket.fill', label: 'Tickets', route: '/(tabs)' },
  ],

  // ── Church ──
  mem_church_iccla: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/(tabs)/nexus' },
    { icon: 'calendar', label: 'Events', route: '/(tabs)' },
    { icon: 'book.fill', label: 'Lessons', route: '/(tabs)/media' },
    { icon: 'heart.fill', label: 'Give', route: '/(tabs)' },
  ],
  mem_church_icc_ie_teacher: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/(tabs)/nexus' },
    { icon: 'calendar', label: 'Schedule', route: '/(tabs)' },
    { icon: 'book.fill', label: 'Lessons', route: '/(tabs)/media' },
    { icon: 'person.3.fill', label: 'Students', route: '/(tabs)' },
  ],
  mem_church_icc_ie: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/(tabs)/nexus' },
    { icon: 'calendar', label: 'Calendar', route: '/(tabs)' },
    { icon: 'person.3.fill', label: 'Members', route: '/(tabs)' },
    { icon: 'dollarsign.circle.fill', label: 'Finance', route: '/(tabs)/organization' },
  ],

  // ── Competition ──
  mem_comp_k1_owner_commish: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/(tabs)/nexus' },
    { icon: 'calendar', label: 'Race Cal', route: '/(tabs)' },
    { icon: 'person.3.fill', label: 'Teams', route: '/(tabs)' },
    { icon: 'chart.bar.fill', label: 'Standings', route: '/(tabs)' },
  ],
  mem_comp_btw_director: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/(tabs)/nexus' },
    { icon: 'calendar', label: 'Bracket', route: '/(tabs)' },
    { icon: 'person.3.fill', label: 'Teams', route: '/(tabs)' },
    { icon: 'doc.fill', label: 'Ops Docs', route: '/(tabs)/organization' },
  ],
  mem_comp_mlk_advisor: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/(tabs)/nexus' },
    { icon: 'calendar', label: 'Agenda', route: '/(tabs)' },
    { icon: 'doc.fill', label: 'Run of Show', route: '/(tabs)' },
    { icon: 'person.fill', label: 'VIP Info', route: '/(tabs)' },
  ],
  mem_comp_valuetainment_public: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/(tabs)/nexus' },
    { icon: 'sportscourt.fill', label: 'Scores', route: '/(tabs)' },
    { icon: 'calendar', label: 'Schedule', route: '/(tabs)' },
    { icon: 'ticket.fill', label: 'Tickets', route: '/(tabs)' },
  ],

  // ── Business ──
  mem_biz_kanext_founder: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/(tabs)/nexus' },
    { icon: 'chart.bar.fill', label: 'Dashboard', route: '/(tabs)' },
    { icon: 'doc.fill', label: 'Documents', route: '/(tabs)/media' },
    { icon: 'dollarsign.circle.fill', label: 'Finance', route: '/(tabs)/organization' },
  ],
  mem_biz_kanext_investor: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/(tabs)/nexus' },
    { icon: 'doc.fill', label: 'Data Room', route: '/(tabs)/media' },
    { icon: 'chart.bar.fill', label: 'Metrics', route: '/(tabs)' },
    { icon: 'calendar', label: 'Updates', route: '/(tabs)/activity' },
  ],
  mem_biz_kanext_public: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/(tabs)/nexus' },
    { icon: 'doc.fill', label: 'Overview', route: '/(tabs)' },
    { icon: 'globe', label: 'Website', route: '/(tabs)' },
    { icon: 'bell.fill', label: 'Updates', route: '/(tabs)/activity' },
  ],
  mem_biz_valuetainment_subscriber: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/(tabs)/nexus' },
    { icon: 'play.rectangle.fill', label: 'Content', route: '/(tabs)/media' },
    { icon: 'bell.fill', label: 'Updates', route: '/(tabs)/activity' },
    { icon: 'person.fill', label: 'Profile', route: '/(tabs)' },
  ],
  mem_biz_sliema_prospective_acquirer: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/(tabs)/nexus' },
    { icon: 'doc.fill', label: 'Workspace', route: '/(tabs)' },
    { icon: 'chart.bar.fill', label: 'Financials', route: '/(tabs)' },
    { icon: 'calendar', label: 'Timeline', route: '/(tabs)' },
  ],

  // ── Education ──
  mem_edu_fmu_pd: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/(tabs)/nexus' },
    { icon: 'person.3.fill', label: 'Students', route: '/(tabs)' },
    { icon: 'doc.fill', label: 'Reports', route: '/(tabs)/organization' },
    { icon: 'calendar', label: 'Calendar', route: '/(tabs)' },
  ],
  mem_edu_fmu_student: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/(tabs)/nexus' },
    { icon: 'calendar', label: 'Schedule', route: '/(tabs)' },
    { icon: 'graduationcap.fill', label: 'Courses', route: '/(tabs)' },
    { icon: 'chart.bar.fill', label: 'Grades', route: '/(tabs)' },
  ],
  mem_edu_kxa_founder: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/(tabs)/nexus' },
    { icon: 'person.3.fill', label: 'Students', route: '/(tabs)' },
    { icon: 'doc.fill', label: 'Curriculum', route: '/(tabs)/media' },
    { icon: 'chart.bar.fill', label: 'Analytics', route: '/(tabs)' },
  ],
  mem_edu_lincoln_parent: [
    { icon: 'sparkles', label: 'Open Nexus', route: '/(tabs)/nexus' },
    { icon: 'calendar', label: 'Calendar', route: '/(tabs)' },
    { icon: 'chart.bar.fill', label: 'Progress', route: '/(tabs)' },
    { icon: 'envelope.fill', label: 'Messages', route: '/(tabs)/activity' },
  ],
};

// =============================================================================
// PERMISSION BULLETS
// =============================================================================

export const PERMISSION_BULLETS: Record<string, string[]> = {
  // ── Sports ──
  mem_sports_fmu_admin: [
    'Full roster management and scholarship allocation',
    'Game operations, scheduling, and opponent scouting',
    'Recruiting board with offer management',
    'Budget oversight and NIL pool administration',
    'Staff management across all programs',
    'Nexus AI with full institutional context',
  ],
  mem_sports_kxa_athlete: [
    'View personal stats and performance reports',
    'Access practice schedules and game film',
    'Review team roster and depth chart',
    'Nexus AI for personal development',
  ],
  mem_sports_lincoln_coach: [
    'Manage recruiting board and prospect pipeline',
    'Access game film and scouting reports',
    'View and edit roster for assigned program',
    'Nexus AI with coaching context',
  ],
  mem_sports_salima_limited: [
    'View roster and player profiles (read-only)',
    'Access shared scouting reports',
    'Submit external analysis and notes',
    'Limited Nexus AI access',
  ],
  mem_sports_yankees_viewer: [
    'View public schedule and scores',
    'Access public stats and standings',
    'Browse public media and highlights',
  ],

  // ── Church ──
  mem_church_iccla: [
    'Manage lesson plans for assigned ministries',
    'View ministry calendars and schedules',
    'Access teaching resources and materials',
    'Communicate with ministry team members',
    'Nexus AI with ministry context',
  ],
  mem_church_icc_ie_teacher: [
    "Manage Children's Church lesson plans",
    'View class rosters and attendance',
    'Access teaching resources and curriculum',
    'Communicate with parents and ministry leads',
  ],
  mem_church_icc_ie: [
    'Full church administration and oversight',
    'Member management and pastoral care records',
    'Financial oversight and budget management',
    'Ministry leadership assignments',
    'Calendar and event management',
    'Nexus AI with full pastoral context',
  ],

  // ── Competition ──
  mem_comp_k1_owner_commish: [
    'Full league governance and rule management',
    'Team ownership and franchise operations',
    'Race calendar and venue management',
    'Financial oversight and revenue sharing',
    'Broadcast and media rights management',
    'Nexus AI with commissioner context',
  ],
  mem_comp_btw_director: [
    'Full tournament operations and bracket management',
    'Team registration and seeding',
    'Venue coordination and logistics',
    'Officials and staff assignments',
    'Nexus AI with tournament context',
  ],
  mem_comp_mlk_advisor: [
    'View event agenda and run of show',
    'Access speaker logistics and VIP itinerary',
    'View assigned tasks and responsibilities',
    'Limited schedule visibility',
  ],
  mem_comp_valuetainment_public: [
    'View public schedule and bracket',
    'Access public scores and standings',
    'Purchase tickets and merchandise',
  ],

  // ── Business ──
  mem_biz_kanext_founder: [
    'Full platform administration and governance',
    'Financial dashboards and revenue tracking',
    'Document management and data rooms',
    'Team and hiring management',
    'Product roadmap and engineering oversight',
    'Nexus AI with full executive context',
  ],
  mem_biz_kanext_investor: [
    'Access investor data room and reports',
    'View financial metrics and KPIs',
    'Review quarterly updates and board materials',
    'Nexus AI with investor context',
  ],
  mem_biz_kanext_public: [
    'View public company overview',
    'Access public announcements',
    'Browse public content and media',
  ],
  mem_biz_valuetainment_subscriber: [
    'Access subscriber content library',
    'View show schedules and episodes',
    'Receive notifications for new content',
  ],
  mem_biz_sliema_prospective_acquirer: [
    'Access acquisition workspace and documents',
    'View financial statements and projections',
    'Review asset valuation materials',
    'Submit due diligence requests',
  ],

  // ── Education ──
  mem_edu_fmu_pd: [
    'Manage academic program operations',
    'Student enrollment and progress tracking',
    'Faculty coordination and scheduling',
    'Generate compliance and accreditation reports',
    'Nexus AI with program director context',
  ],
  mem_edu_fmu_student: [
    'View course schedule and assignments',
    'Access grades and academic progress',
    'View campus calendar and events',
    'Nexus AI for academic support',
  ],
  mem_edu_kxa_founder: [
    'Full academy curriculum and operations',
    'Student enrollment and progress tracking',
    'Instructor management and scheduling',
    'Basketball operations integration',
    'Nexus AI with founder context',
  ],
  mem_edu_lincoln_parent: [
    'View student progress and grades',
    'Access academic calendar and events',
    'Communicate with faculty and staff',
    'View billing and financial aid status',
  ],
};
