/**
 * Role Badge Derivation Engine
 * Computes the derived role badge string for display in the avatar drawer
 * and context switcher. Rules are membership + program specific.
 */
import { getMembershipById } from '@/data/mock-memberships';

// Specific overrides keyed by membership_id
const BADGE_OVERRIDES: Record<string, Record<string, string> | string> = {
  // ── Sports / FMU ──
  mem_sports_fmu_admin: {
    fmu_mbb: 'AD · Head Coach · GM',
    fmu_dev1: 'Head of Basketball Ops · Head Coach · GM',
    fmu_dev2: 'Head of Basketball Ops · Head Coach · GM',
    _default: 'Athletic Director',
  },

  // ── Sports / Lincoln ──
  mem_sports_lincoln_coach: 'Assistant Coach · Recruiting Coordinator',

  // ── Sports / Salima ──
  mem_sports_salima_limited: 'Scout · External Analyst (Limited)',

  // ── Sports / Yankees ──
  mem_sports_yankees_viewer: 'Viewer (Fan)',

  // ── Sports / KaNeXT Academy ──
  mem_sports_kxa_admin: 'Founder/CEO · Head of Basketball Ops',
  mem_sports_kxa_athlete: 'Player (Athlete)',

  // ── Church / ICCLA LA ──
  mem_church_iccla: {
    iccla_la_main: 'Ministry Teacher',
    iccla_la_kids: 'Ministry Teacher · Children\u2019s Church',
    iccla_la_freshfire: 'Ministry Teacher · Fresh Fire Youth',
    iccla_la_singles: 'Singles Member',
    _default: 'Ministry Teacher',
  },

  // ── Church / ICC IE ──
  mem_church_icc_ie: 'Pastor',

  // ── Business ──
  mem_biz_kanext_founder: 'Founder/CEO',
  mem_biz_kanext_investor: 'Investor (Data Room)',
  mem_biz_kanext_public: 'Public (Overview)',
  mem_biz_valuetainment_subscriber: 'Subscriber',
  mem_biz_sliema_prospective_acquirer: 'Prospective Acquirer',

  // ── Competition ──
  mem_comp_k1_owner_commish: 'League Owner · Commissioner',
  mem_comp_btw_director: 'Tournament Director',
  mem_comp_mlk_advisor: 'Speaker · Tournament Advisor (Limited)',
  mem_comp_valuetainment_public: 'Fan · General Viewer (Public)',

  // ── Education ──
  mem_edu_sdcc_faculty: 'Faculty',
  mem_edu_fmu_pd: 'Program Director · AD Academic Liaison',
  mem_edu_fmu_student: 'Student',
  mem_edu_kxa_founder: 'Founder · Head of Basketball Ops',
  mem_edu_lincoln_parent: 'Parent / Guardian',

  // ── Church (additional) ──
  mem_church_icc_ie_teacher: "Children's Church Teacher",

  // ── Business (legacy enterprise memberships) ──
  mem_ent_kanext_founder: 'Founder/CEO',
};

/**
 * Derives the role badge string for a given membership + program combination.
 * Returns a human-readable string like "AD · Head Coach · GM".
 */
export function deriveRoleBadge(membership_id: string, program_id: string): string {
  const override = BADGE_OVERRIDES[membership_id];

  if (typeof override === 'string') {
    return override;
  }

  if (typeof override === 'object' && override !== null) {
    if (program_id in override) {
      return override[program_id];
    }
    if ('_default' in override) {
      return override._default;
    }
  }

  // Fallback: join role_titles from membership
  const membership = getMembershipById(membership_id);
  if (membership) {
    return membership.role_titles.join(' · ');
  }

  return 'Member';
}
