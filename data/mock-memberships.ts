/**
 * V2 Avatar Drawer — Mock Memberships, Organizations, Programs, Seasons
 * Central seed data for multi-mode, multi-org context switching.
 */
import type {
  Mode,
  V2Organization,
  V2Membership,
  V2Program,
  V2Season,
  ActiveContext,
  RecentContext,
} from '@/types';

// =============================================================================
// ORGANIZATIONS
// =============================================================================

export const V2_ORGANIZATIONS: V2Organization[] = [
  // ── Sports ──
  { org_id: 'sports_fmu', org_name: 'Florida Memorial University', mode: 'sports', location: 'Miami Gardens, FL', org_type: 'college_athletics' },
  { org_id: 'sports_lincoln', org_name: 'Lincoln University', mode: 'sports', location: 'Jefferson City, MO', org_type: 'college_basketball' },
  { org_id: 'sports_salima_wanderers', org_name: 'Salima Wanderers FC', mode: 'sports', location: 'Salima, Malawi', org_type: 'football_club' },
  { org_id: 'sports_yankees_fan', org_name: 'New York Yankees', mode: 'sports', location: 'New York, NY', org_type: 'mlb_team' },
  { org_id: 'sports_kanext_academy', org_name: 'KaNeXT Academy', mode: 'sports', location: 'Academy Basketball', org_type: 'academy' },

  // ── Competition ──
  { org_id: 'comp_k1_hypercar', org_name: 'K-1 Hypercar Championship', mode: 'competition', location: 'Global' },
  { org_id: 'comp_btw_memorial', org_name: 'Booker T. Washington Memorial Classic', mode: 'competition', location: 'Tournament' },
  { org_id: 'comp_mlk_truth', org_name: 'MLK Truth Classic', mode: 'competition', location: 'Tournament' },
  { org_id: 'comp_valuetainment_classic', org_name: 'Valuetainment Classic', mode: 'competition', location: 'Tournament' },

  // ── Church ──
  { org_id: 'church_iccla_la', org_name: 'ICCLA \u2014 Los Angeles', mode: 'church', location: 'Los Angeles, CA' },
  { org_id: 'church_icc_ie', org_name: 'ICC \u2014 Inland Empire', mode: 'church', location: 'Inland Empire, CA' },

  // ── Business ──
  { org_id: 'biz_kanext_founder', org_name: 'KaNeXT', mode: 'business', view_variant: 'Founder' },
  { org_id: 'biz_kanext_investor', org_name: 'KaNeXT', mode: 'business', view_variant: 'Investor' },
  { org_id: 'biz_kanext_public', org_name: 'KaNeXT', mode: 'business', view_variant: 'Public' },
  { org_id: 'biz_valuetainment', org_name: 'Valuetainment', mode: 'business' },
  { org_id: 'biz_sliema_acquisition', org_name: 'Sliema Wanderers FC (Asset)', mode: 'business' },

  // ── Education ──
  { org_id: 'edu_sdcc', org_name: 'San Diego Christian College', mode: 'education', location: 'San Diego County, CA' },
  { org_id: 'edu_fmu', org_name: 'Florida Memorial University', mode: 'education', location: 'Miami Gardens, FL', org_type: 'university' },
  { org_id: 'edu_kanext_academy', org_name: 'KaNeXT Academy', mode: 'education', location: 'Academy Education', org_type: 'academy' },
  { org_id: 'edu_lincoln', org_name: 'Lincoln University', mode: 'education', location: 'Jefferson City, MO', org_type: 'university' },

];

// =============================================================================
// MEMBERSHIPS
// =============================================================================

export const V2_MEMBERSHIPS: V2Membership[] = [
  // ── Sports ──
  {
    membership_id: 'mem_sports_fmu_admin',
    mode: 'sports',
    org_id: 'sports_fmu',
    role_titles: ['Athletic Director', "Men's Basketball Head Coach", "Men's Basketball GM"],
    permission_tier: 'Admin',
    program_scopes: ['*'],
  },
  {
    membership_id: 'mem_sports_lincoln_coach',
    mode: 'sports',
    org_id: 'sports_lincoln',
    role_titles: ['Assistant Coach', 'Recruiting Coordinator'],
    permission_tier: 'Coach',
    program_scopes: ['lincoln_mbb'],
  },
  {
    membership_id: 'mem_sports_salima_limited',
    mode: 'sports',
    org_id: 'sports_salima_wanderers',
    role_titles: ['Scout', 'External Analyst'],
    permission_tier: 'Limited',
    program_scopes: ['salima_first_team'],
  },
  {
    membership_id: 'mem_sports_yankees_viewer',
    mode: 'sports',
    org_id: 'sports_yankees_fan',
    role_titles: ['Fan'],
    permission_tier: 'Viewer',
    program_scopes: ['nyy_mlb'],
  },
  {
    membership_id: 'mem_sports_kxa_admin',
    mode: 'sports',
    org_id: 'sports_kanext_academy',
    role_titles: ['Founder', 'CEO', 'Head of Basketball Operations'],
    permission_tier: 'Admin',
    program_scopes: ['*'],
  },
  {
    membership_id: 'mem_sports_kxa_athlete',
    mode: 'sports',
    org_id: 'sports_kanext_academy',
    role_titles: ['Athlete', 'Player'],
    permission_tier: 'Athlete',
    program_scopes: ['kxa_basketball_flagship'],
  },

  // ── Competition ──
  {
    membership_id: 'mem_comp_k1_owner_commish',
    mode: 'competition',
    org_id: 'comp_k1_hypercar',
    role_titles: ['League Owner', 'Commissioner'],
    permission_tier: 'Full',
    program_scopes: ['*'],
  },
  {
    membership_id: 'mem_comp_btw_director',
    mode: 'competition',
    org_id: 'comp_btw_memorial',
    role_titles: ['Tournament Director'],
    permission_tier: 'Full',
    program_scopes: ['*'],
  },
  {
    membership_id: 'mem_comp_mlk_advisor',
    mode: 'competition',
    org_id: 'comp_mlk_truth',
    role_titles: ['Speaker', 'Tournament Advisor'],
    permission_tier: 'Limited',
    program_scopes: ['agenda_view', 'speaker_logistics', 'vip_itinerary', 'assigned_tasks', 'approved_run_of_show'],
  },
  {
    membership_id: 'mem_comp_valuetainment_public',
    mode: 'competition',
    org_id: 'comp_valuetainment_classic',
    role_titles: ['Fan', 'General Viewer'],
    permission_tier: 'Public',
    program_scopes: ['public_schedule', 'public_bracket', 'public_scores', 'public_standings', 'tickets', 'official_replays', 'announcements'],
  },

  // ── Church ──
  {
    membership_id: 'mem_church_iccla',
    mode: 'church',
    org_id: 'church_iccla_la',
    role_titles: ['Ministry Teacher', "Children's Church Teacher", 'Fresh Fire Youth Ministry Teacher', 'Singles Ministry Member'],
    permission_tier: 'Staff',
    program_scopes: ['iccla_la_main', 'iccla_la_kids', 'iccla_la_freshfire', 'iccla_la_singles'],
  },
  {
    membership_id: 'mem_church_icc_ie',
    mode: 'church',
    org_id: 'church_icc_ie',
    role_titles: ['Pastor'],
    permission_tier: 'Admin',
    program_scopes: ['*'],
  },

  // ── Business ──
  {
    membership_id: 'mem_biz_kanext_founder',
    mode: 'business',
    org_id: 'biz_kanext_founder',
    role_titles: ['Founder', 'CEO'],
    permission_tier: 'Full',
    program_scopes: ['*'],
  },
  {
    membership_id: 'mem_biz_kanext_investor',
    mode: 'business',
    org_id: 'biz_kanext_investor',
    role_titles: ['Investor'],
    permission_tier: 'Curated',
    program_scopes: ['dataroom_*'],
  },
  {
    membership_id: 'mem_biz_kanext_public',
    mode: 'business',
    org_id: 'biz_kanext_public',
    role_titles: ['Public'],
    permission_tier: 'Public',
    program_scopes: ['overview'],
  },
  {
    membership_id: 'mem_biz_valuetainment_subscriber',
    mode: 'business',
    org_id: 'biz_valuetainment',
    role_titles: ['Subscriber'],
    permission_tier: 'Public',
    program_scopes: ['public_content'],
  },
  {
    membership_id: 'mem_biz_sliema_prospective_acquirer',
    mode: 'business',
    org_id: 'biz_sliema_acquisition',
    role_titles: ['Prospective Acquirer'],
    permission_tier: 'Acquisition',
    program_scopes: ['acq_workspace_*'],
  },

  // ── Education ──
  {
    membership_id: 'mem_edu_sdcc_faculty',
    mode: 'education',
    org_id: 'edu_sdcc',
    role_titles: ['Faculty'],
    permission_tier: 'Faculty',
    program_scopes: ['*'],
  },
  {
    membership_id: 'mem_church_icc_ie_teacher',
    mode: 'church',
    org_id: 'church_icc_ie',
    role_titles: ["Children's Church Teacher"],
    permission_tier: 'Staff',
    program_scopes: ['icc_ie_main', 'icc_ie_kids'],
  },
  {
    membership_id: 'mem_edu_fmu_pd',
    mode: 'education',
    org_id: 'edu_fmu',
    role_titles: ['Program Director', 'AD Academic Liaison'],
    permission_tier: 'Admin',
    program_scopes: ['*'],
  },
  {
    membership_id: 'mem_edu_fmu_student',
    mode: 'education',
    org_id: 'edu_fmu',
    role_titles: ['Student'],
    permission_tier: 'Athlete',
    program_scopes: ['edu_fmu_main'],
  },
  {
    membership_id: 'mem_edu_kxa_founder',
    mode: 'education',
    org_id: 'edu_kanext_academy',
    role_titles: ['Founder', 'Head of Basketball Ops'],
    permission_tier: 'Admin',
    program_scopes: ['*'],
  },
  {
    membership_id: 'mem_edu_lincoln_parent',
    mode: 'education',
    org_id: 'edu_lincoln',
    role_titles: ['Parent', 'Guardian'],
    permission_tier: 'Limited',
    program_scopes: ['edu_lincoln_main'],
  },

];

// =============================================================================
// PROGRAMS
// =============================================================================

export const V2_PROGRAMS: V2Program[] = [
  // ── FMU (13 varsity + 2 dev = 15) ──
  { program_id: 'fmu_baseball', org_id: 'sports_fmu', mode: 'sports', program_name: 'Baseball (Men)', program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_mbb', org_id: 'sports_fmu', mode: 'sports', program_name: "Men's Basketball", program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_football', org_id: 'sports_fmu', mode: 'sports', program_name: 'Football', program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_msoc', org_id: 'sports_fmu', mode: 'sports', program_name: "Men's Soccer", program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_mtf', org_id: 'sports_fmu', mode: 'sports', program_name: "Men's Track & Field", program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_wbb', org_id: 'sports_fmu', mode: 'sports', program_name: "Women's Basketball", program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_beachvb', org_id: 'sports_fmu', mode: 'sports', program_name: 'Beach Volleyball', program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_wflag', org_id: 'sports_fmu', mode: 'sports', program_name: "Women's Flag Football", program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_wsoc', org_id: 'sports_fmu', mode: 'sports', program_name: "Women's Soccer", program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_softball', org_id: 'sports_fmu', mode: 'sports', program_name: 'Softball', program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_wtf', org_id: 'sports_fmu', mode: 'sports', program_name: "Women's Track & Field", program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_wvb', org_id: 'sports_fmu', mode: 'sports', program_name: "Women's Volleyball", program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_cheer', org_id: 'sports_fmu', mode: 'sports', program_name: 'Competitive Cheer', program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_dev1', org_id: 'sports_fmu', mode: 'sports', program_name: 'Basketball Development Team 1', program_type: 'Development', source_tag: 'KANEXT_OPERATED', status: 'Active' },
  { program_id: 'fmu_dev2', org_id: 'sports_fmu', mode: 'sports', program_name: 'Basketball Development Team 2', program_type: 'Development', source_tag: 'KANEXT_OPERATED', status: 'Active' },

  // ── Lincoln ──
  { program_id: 'lincoln_mbb', org_id: 'sports_lincoln', mode: 'sports', program_name: "Men's Basketball", program_type: 'Varsity', source_tag: 'OFFICIAL', status: 'Active' },

  // ── Salima Wanderers ──
  { program_id: 'salima_first_team', org_id: 'sports_salima_wanderers', mode: 'sports', program_name: 'First Team', program_type: 'First Team', source_tag: 'OFFICIAL', status: 'Active' },

  // ── NY Yankees ──
  { program_id: 'nyy_mlb', org_id: 'sports_yankees_fan', mode: 'sports', program_name: 'MLB Team Hub', program_type: 'Fan Hub', source_tag: 'OFFICIAL', status: 'Active' },

  // ── KaNeXT Academy ──
  { program_id: 'kxa_basketball_flagship', org_id: 'sports_kanext_academy', mode: 'sports', program_name: 'Academy Basketball', program_type: 'Flagship', source_tag: 'KANEXT_OPERATED', status: 'Active' },

  // ── Competition ──
  { program_id: 'k1_main', org_id: 'comp_k1_hypercar', mode: 'competition', program_name: 'K-1 Championship', program_type: 'League', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'btw_tournament', org_id: 'comp_btw_memorial', mode: 'competition', program_name: 'BTW Memorial Classic', program_type: 'Tournament', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'mlk_tournament', org_id: 'comp_mlk_truth', mode: 'competition', program_name: 'MLK Truth Classic', program_type: 'Tournament', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'vt_classic', org_id: 'comp_valuetainment_classic', mode: 'competition', program_name: 'Valuetainment Classic', program_type: 'Tournament', source_tag: 'OFFICIAL', status: 'Active' },

  // ── Church ──
  { program_id: 'iccla_la_main', org_id: 'church_iccla_la', mode: 'church', program_name: 'Sunday Service / Main Church', program_type: 'Campus', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'iccla_la_kids', org_id: 'church_iccla_la', mode: 'church', program_name: "Children's Church", program_type: 'Ministry', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'iccla_la_freshfire', org_id: 'church_iccla_la', mode: 'church', program_name: 'Fresh Fire Youth Ministry', program_type: 'Ministry', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'iccla_la_singles', org_id: 'church_iccla_la', mode: 'church', program_name: 'Singles Ministry', program_type: 'Ministry', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'icc_ie_main', org_id: 'church_icc_ie', mode: 'church', program_name: 'Sunday Service / Main Church', program_type: 'Campus', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'icc_ie_pastoral', org_id: 'church_icc_ie', mode: 'church', program_name: 'Pastoral Leadership', program_type: 'Ministry', source_tag: 'OFFICIAL', status: 'Active' },

  // ── Business ──
  { program_id: 'biz_kanext_ops', org_id: 'biz_kanext_founder', mode: 'business', program_name: 'KaNeXT Operations', program_type: 'Platform', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'biz_kanext_dataroom', org_id: 'biz_kanext_investor', mode: 'business', program_name: 'Data Room', program_type: 'Investor', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'biz_kanext_overview', org_id: 'biz_kanext_public', mode: 'business', program_name: 'Company Overview', program_type: 'Public', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'biz_vt_content', org_id: 'biz_valuetainment', mode: 'business', program_name: 'Valuetainment Content', program_type: 'Content', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'biz_sliema_workspace', org_id: 'biz_sliema_acquisition', mode: 'business', program_name: 'Acquisition Workspace', program_type: 'Acquisition', source_tag: 'OFFICIAL', status: 'Active' },

  // ── Education ──
  { program_id: 'edu_sdcc_main', org_id: 'edu_sdcc', mode: 'education', program_name: 'San Diego Christian College', program_type: 'Institution', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'edu_fmu_main', org_id: 'edu_fmu', mode: 'education', program_name: 'FMU Academic Programs', program_type: 'Institution', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'edu_kxa_main', org_id: 'edu_kanext_academy', mode: 'education', program_name: 'Academy Education', program_type: 'Academy', source_tag: 'KANEXT_OPERATED', status: 'Active' },
  { program_id: 'edu_lincoln_main', org_id: 'edu_lincoln', mode: 'education', program_name: 'Lincoln Academic Programs', program_type: 'Institution', source_tag: 'OFFICIAL', status: 'Active' },

  // ── Church Programs (Children's Church for ICC IE) ──
  { program_id: 'icc_ie_kids', org_id: 'church_icc_ie', mode: 'church', program_name: "Children's Church", program_type: 'Ministry', source_tag: 'OFFICIAL', status: 'Active' },

];

// =============================================================================
// SEASONS
// =============================================================================

export const V2_SEASONS: V2Season[] = [
  // Sports seasons
  { season_id: 'fmu_2025_26', org_id: 'sports_fmu', mode: 'sports', season_name: '2025\u201326', start_date: '2025-10-01', end_date: '2026-04-01', is_current: true },
  { season_id: 'fmu_2024_25', org_id: 'sports_fmu', mode: 'sports', season_name: '2024\u201325', start_date: '2024-10-01', end_date: '2025-04-01', is_current: false },
  { season_id: 'lincoln_2025_26', org_id: 'sports_lincoln', mode: 'sports', season_name: '2025\u201326', start_date: '2025-10-01', end_date: '2026-04-01', is_current: true },
  { season_id: 'salima_2025_26', org_id: 'sports_salima_wanderers', mode: 'sports', season_name: '2025\u201326', start_date: '2025-08-01', end_date: '2026-05-31', is_current: true },
  { season_id: 'nyy_2026', org_id: 'sports_yankees_fan', mode: 'sports', season_name: '2026', start_date: '2026-03-01', end_date: '2026-10-31', is_current: true },
  { season_id: 'kxa_2025_26', org_id: 'sports_kanext_academy', mode: 'sports', season_name: '2025\u201326', start_date: '2025-09-01', end_date: '2026-06-30', is_current: true },

  // Competition seasons
  { season_id: 'k1_s1_2026', org_id: 'comp_k1_hypercar', mode: 'competition', season_name: 'Season 1 · 2026', start_date: '2026-03-01', end_date: '2026-11-30', is_current: true },
  { season_id: 'btw_2026', org_id: 'comp_btw_memorial', mode: 'competition', season_name: '2026', start_date: '2026-01-01', end_date: '2026-12-31', is_current: true },
  { season_id: 'mlk_2026', org_id: 'comp_mlk_truth', mode: 'competition', season_name: '2026', start_date: '2026-01-01', end_date: '2026-12-31', is_current: true },
  { season_id: 'vt_classic_2026', org_id: 'comp_valuetainment_classic', mode: 'competition', season_name: '2026', start_date: '2026-01-01', end_date: '2026-12-31', is_current: true },

  // Church seasons
  { season_id: 'iccla_2026', org_id: 'church_iccla_la', mode: 'church', season_name: '2026', start_date: '2026-01-01', end_date: '2026-12-31', is_current: true },
  { season_id: 'icc_ie_2026', org_id: 'church_icc_ie', mode: 'church', season_name: '2026', start_date: '2026-01-01', end_date: '2026-12-31', is_current: true },

  // Business seasons
  { season_id: 'biz_fy2026', org_id: 'biz_kanext_founder', mode: 'business', season_name: 'FY 2026', start_date: '2026-01-01', end_date: '2026-12-31', is_current: true },
  { season_id: 'biz_inv_fy2026', org_id: 'biz_kanext_investor', mode: 'business', season_name: 'FY 2026', start_date: '2026-01-01', end_date: '2026-12-31', is_current: true },
  { season_id: 'biz_pub_fy2026', org_id: 'biz_kanext_public', mode: 'business', season_name: 'FY 2026', start_date: '2026-01-01', end_date: '2026-12-31', is_current: true },
  { season_id: 'biz_vt_fy2026', org_id: 'biz_valuetainment', mode: 'business', season_name: 'FY 2026', start_date: '2026-01-01', end_date: '2026-12-31', is_current: true },
  { season_id: 'biz_sliema_fy2026', org_id: 'biz_sliema_acquisition', mode: 'business', season_name: 'FY 2026', start_date: '2026-01-01', end_date: '2026-12-31', is_current: true },

  // Education
  { season_id: 'edu_sdcc_2025_26', org_id: 'edu_sdcc', mode: 'education', season_name: '2025\u20132026 Academic Year', start_date: '2025-08-25', end_date: '2026-05-15', is_current: true },
  { season_id: 'edu_fmu_2025_26', org_id: 'edu_fmu', mode: 'education', season_name: 'Fall 2026', start_date: '2025-08-18', end_date: '2026-05-10', is_current: true },
  { season_id: 'edu_kxa_2025_26', org_id: 'edu_kanext_academy', mode: 'education', season_name: '2025\u20132026', start_date: '2025-09-01', end_date: '2026-06-30', is_current: true },
  { season_id: 'edu_lincoln_2025_26', org_id: 'edu_lincoln', mode: 'education', season_name: 'Fall 2026', start_date: '2025-08-20', end_date: '2026-05-12', is_current: true },

];

// =============================================================================
// DEFAULT ACTIVE CONTEXT
// =============================================================================

export const DEFAULT_ACTIVE_CONTEXT: ActiveContext = {
  mode: 'sports',
  org_id: 'sports_fmu',
  program_id: 'fmu_mbb',
  season_id: 'fmu_2025_26',
  membership_id: 'mem_sports_fmu_admin',
  derived_role_badge: 'AD · Head Coach · GM',
};

// =============================================================================
// SEEDED RECENT CONTEXTS
// =============================================================================

export const SEEDED_RECENT_CONTEXTS: RecentContext[] = [
  // Sports
  {
    mode: 'sports', org_id: 'sports_fmu', program_id: 'fmu_mbb', season_id: 'fmu_2025_26',
    membership_id: 'mem_sports_fmu_admin', derived_role_badge: 'AD · Head Coach · GM', timestamp: Date.now() - 1000,
  },
  {
    mode: 'sports', org_id: 'sports_lincoln', program_id: 'lincoln_mbb', season_id: 'lincoln_2025_26',
    membership_id: 'mem_sports_lincoln_coach', derived_role_badge: 'Assistant Coach · Recruiting Coordinator', timestamp: Date.now() - 2000,
  },
  {
    mode: 'sports', org_id: 'sports_kanext_academy', program_id: 'kxa_basketball_flagship', season_id: 'kxa_2025_26',
    membership_id: 'mem_sports_kxa_admin', derived_role_badge: 'Founder/CEO · Head of Basketball Ops', timestamp: Date.now() - 3000,
  },
  {
    mode: 'sports', org_id: 'sports_kanext_academy', program_id: 'kxa_basketball_flagship', season_id: 'kxa_2025_26',
    membership_id: 'mem_sports_kxa_athlete', derived_role_badge: 'Player (Athlete)', timestamp: Date.now() - 4000,
  },
  {
    mode: 'sports', org_id: 'sports_salima_wanderers', program_id: 'salima_first_team', season_id: 'salima_2025_26',
    membership_id: 'mem_sports_salima_limited', derived_role_badge: 'Scout · External Analyst (Limited)', timestamp: Date.now() - 5000,
  },
  {
    mode: 'sports', org_id: 'sports_yankees_fan', program_id: 'nyy_mlb', season_id: 'nyy_2026',
    membership_id: 'mem_sports_yankees_viewer', derived_role_badge: 'Viewer (Fan)', timestamp: Date.now() - 6000,
  },
  // Church
  {
    mode: 'church', org_id: 'church_iccla_la', program_id: 'iccla_la_main', season_id: 'iccla_2026',
    membership_id: 'mem_church_iccla', derived_role_badge: 'Ministry Teacher', timestamp: Date.now() - 7000,
  },
  {
    mode: 'church', org_id: 'church_icc_ie', program_id: 'icc_ie_main', season_id: 'icc_ie_2026',
    membership_id: 'mem_church_icc_ie', derived_role_badge: 'Pastor', timestamp: Date.now() - 8000,
  },
  // Business
  {
    mode: 'business', org_id: 'biz_kanext_founder', program_id: 'biz_kanext_ops', season_id: 'biz_fy2026',
    membership_id: 'mem_biz_kanext_founder', derived_role_badge: 'Founder/CEO', timestamp: Date.now() - 9000,
  },
  // Competition
  {
    mode: 'competition', org_id: 'comp_k1_hypercar', program_id: 'k1_main', season_id: 'k1_s1_2026',
    membership_id: 'mem_comp_k1_owner_commish', derived_role_badge: 'League Owner · Commissioner', timestamp: Date.now() - 10000,
  },
  // Education
  {
    mode: 'education', org_id: 'edu_fmu', program_id: 'edu_fmu_main', season_id: 'edu_fmu_2025_26',
    membership_id: 'mem_edu_fmu_pd', derived_role_badge: 'Program Director · AD Academic Liaison', timestamp: Date.now() - 11000,
  },
  {
    mode: 'education', org_id: 'edu_kanext_academy', program_id: 'edu_kxa_main', season_id: 'edu_kxa_2025_26',
    membership_id: 'mem_edu_kxa_founder', derived_role_badge: 'Founder · Head of Basketball Ops', timestamp: Date.now() - 12000,
  },
];

// =============================================================================
// LOOKUP HELPERS
// =============================================================================

export function getOrgsForModeV2(mode: Mode): V2Organization[] {
  return V2_ORGANIZATIONS.filter((o) => o.mode === mode);
}

export function getMembershipsForOrg(org_id: string): V2Membership[] {
  return V2_MEMBERSHIPS.filter((m) => m.org_id === org_id);
}

export function getMembershipsForMode(mode: Mode): V2Membership[] {
  return V2_MEMBERSHIPS.filter((m) => m.mode === mode);
}

export function getProgramsForOrg(org_id: string): V2Program[] {
  return V2_PROGRAMS.filter((p) => p.org_id === org_id);
}

export function getSeasonsForOrg(org_id: string): V2Season[] {
  return V2_SEASONS.filter((s) => s.org_id === org_id);
}

export function getCurrentSeasonForOrg(org_id: string): V2Season | undefined {
  return V2_SEASONS.find((s) => s.org_id === org_id && s.is_current);
}

export function getOrgById(org_id: string): V2Organization | undefined {
  return V2_ORGANIZATIONS.find((o) => o.org_id === org_id);
}

export function getProgramById(program_id: string): V2Program | undefined {
  return V2_PROGRAMS.find((p) => p.program_id === program_id);
}

export function getSeasonById(season_id: string): V2Season | undefined {
  return V2_SEASONS.find((s) => s.season_id === season_id);
}

export function getMembershipById(membership_id: string): V2Membership | undefined {
  return V2_MEMBERSHIPS.find((m) => m.membership_id === membership_id);
}

/** Find memberships that can access a given program within an org */
export function getMembershipsForOrgProgram(org_id: string, program_id: string): V2Membership[] {
  return V2_MEMBERSHIPS.filter((m) => {
    if (m.org_id !== org_id) return false;
    if (m.program_scopes.includes('*')) return true;
    return m.program_scopes.includes(program_id);
  });
}

/** Get default context for a mode (first org, first program, current season) */
export function getDefaultContextForMode(mode: Mode): ActiveContext | null {
  const orgs = getOrgsForModeV2(mode);
  if (orgs.length === 0) return null;

  const org = orgs[0];
  const programs = getProgramsForOrg(org.org_id);
  if (programs.length === 0) return null;

  const program = programs[0];
  const season = getCurrentSeasonForOrg(org.org_id);
  if (!season) return null;

  const memberships = getMembershipsForOrgProgram(org.org_id, program.program_id);
  if (memberships.length === 0) return null;

  const membership = memberships[0];

  // Import deriveRoleBadge lazily to avoid circular deps
  const badge = membership.role_titles.join(' · ');

  return {
    mode,
    org_id: org.org_id,
    program_id: program.program_id,
    season_id: season.season_id,
    membership_id: membership.membership_id,
    derived_role_badge: badge,
  };
}
