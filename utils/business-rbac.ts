/**
 * Business Mode RBAC — 8-level role lens visibility matrix.
 * B1:  Founder / CEO (Full access)
 * B2a: Investor (Retail) — Curated data room
 * B2b: Investor (Strategic/Board) — Board-level data room
 * B3:  Public
 * B4:  Subscriber (Public only)
 * B5:  Prospective Acquirer (Acquisition workspace scoped)
 * B8:  Advisor / Board Member
 * B13: Holding Company / Parent
 */

import { isSystemOwner } from '@/utils/system-rbac';

// =============================================================================
// ROLE LEVELS
// =============================================================================

export type BusinessRoleLens = 'B1' | 'B2a' | 'B2b' | 'B3' | 'B4' | 'B5' | 'B8' | 'B13';

export type InvestorTier = 'retail' | 'board';

export type BusinessVisibility = 'full' | 'exact' | 'banded' | 'limited' | 'hidden';

export type MetricVisibility = 'exact' | 'banded' | 'hidden';

export type DocAccessTag = 'public' | 'retail' | 'board' | 'founder_only' | 'workspace_only';

export const BUSINESS_ROLE_LABELS: Record<BusinessRoleLens, string> = {
  B1: 'Founder / CEO',
  B2a: 'Investor (Retail)',
  B2b: 'Investor (Strategic/Board)',
  B3: 'Public',
  B4: 'Subscriber',
  B5: 'Prospective Acquirer',
  B8: 'Advisor / Board',
  B13: 'Holding Company / Parent',
};

// =============================================================================
// COMPANY SHEET TAB VISIBILITY
// =============================================================================

export type CompanyTab =
  | 'overview' | 'product' | 'traction' | 'roadmap'
  | 'finance' | 'governance' | 'people' | 'comms';

const COMPANY_TAB_MATRIX: Record<CompanyTab, Record<BusinessRoleLens, BusinessVisibility>> = {
  overview:   { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'limited', B4: 'limited', B5: 'limited', B8: 'full',    B13: 'full' },
  product:    { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'limited', B4: 'limited', B5: 'limited', B8: 'full',    B13: 'full' },
  traction:   { B1: 'full', B2a: 'banded',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'limited', B8: 'exact',   B13: 'full' },
  roadmap:    { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'limited', B8: 'exact',   B13: 'full' },
  finance:    { B1: 'full', B2a: 'banded',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'exact',   B13: 'full' },
  governance: { B1: 'full', B2a: 'hidden',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'exact',   B13: 'full' },
  people:     { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'limited', B4: 'limited', B5: 'limited', B8: 'exact',   B13: 'full' },
  comms:      { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'limited', B4: 'limited', B5: 'limited', B8: 'exact',   B13: 'full' },
};

export function getCompanySheetTabs(role: BusinessRoleLens): { id: CompanyTab; label: string; visibility: BusinessVisibility }[] {
  const labels: Record<CompanyTab, string> = {
    overview: 'Overview', product: 'Product', traction: 'Traction',
    roadmap: 'Roadmap', finance: 'Finance', governance: 'Governance',
    people: 'People', comms: 'Comms',
  };
  return (Object.keys(COMPANY_TAB_MATRIX) as CompanyTab[])
    .filter((tab) => COMPANY_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: COMPANY_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// DATA ROOM SHEET TAB VISIBILITY
// =============================================================================

export type DataRoomTab =
  | 'start_here' | 'pitch_pack' | 'product_demo'
  | 'financials' | 'legal' | 'board_pack' | 'decision_log';

const DATA_ROOM_TAB_MATRIX: Record<DataRoomTab, Record<BusinessRoleLens, BusinessVisibility>> = {
  start_here:   { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'limited', B13: 'full' },
  pitch_pack:   { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'limited', B13: 'full' },
  product_demo: { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'limited', B13: 'full' },
  financials:   { B1: 'full', B2a: 'banded',  B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'exact',   B13: 'full' },
  legal:        { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'exact',   B13: 'full' },
  board_pack:   { B1: 'full', B2a: 'hidden',  B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'exact',   B13: 'full' },
  decision_log: { B1: 'full', B2a: 'hidden',  B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'exact',   B13: 'full' },
};

export function getDataRoomTabs(role: BusinessRoleLens): { id: DataRoomTab; label: string; visibility: BusinessVisibility }[] {
  const labels: Record<DataRoomTab, string> = {
    start_here: 'Start Here', pitch_pack: 'Pitch Pack', product_demo: 'Product Demo',
    financials: 'Financials', legal: 'Legal', board_pack: 'Board Pack',
    decision_log: 'Decision Log',
  };
  return (Object.keys(DATA_ROOM_TAB_MATRIX) as DataRoomTab[])
    .filter((tab) => DATA_ROOM_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: DATA_ROOM_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// DEAL / ASSET SHEET TAB VISIBILITY
// =============================================================================

export type DealTab =
  | 'overview' | 'pipeline' | 'diligence' | 'financial_model'
  | 'risks' | 'offer_terms' | 'approvals' | 'audit_log';

const DEAL_TAB_MATRIX: Record<DealTab, Record<BusinessRoleLens, BusinessVisibility>> = {
  overview:        { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full',    B8: 'exact',   B13: 'full' },
  pipeline:        { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full',    B8: 'exact',   B13: 'full' },
  diligence:       { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full',    B8: 'exact',   B13: 'full' },
  financial_model: { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full',    B8: 'exact',   B13: 'full' },
  risks:           { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full',    B8: 'exact',   B13: 'full' },
  offer_terms:     { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full',    B8: 'exact',   B13: 'full' },
  approvals:       { B1: 'full', B2a: 'hidden', B2b: 'limited', B3: 'hidden', B4: 'hidden', B5: 'limited', B8: 'limited', B13: 'full' },
  audit_log:       { B1: 'full', B2a: 'hidden', B2b: 'limited', B3: 'hidden', B4: 'hidden', B5: 'limited', B8: 'limited', B13: 'full' },
};

export function getDealSheetTabs(role: BusinessRoleLens): { id: DealTab; label: string; visibility: BusinessVisibility }[] {
  const labels: Record<DealTab, string> = {
    overview: 'Overview', pipeline: 'Pipeline', diligence: 'Diligence',
    financial_model: 'Financial Model', risks: 'Risks', offer_terms: 'Offer / Terms',
    approvals: 'Approvals', audit_log: 'Audit Log',
  };
  return (Object.keys(DEAL_TAB_MATRIX) as DealTab[])
    .filter((tab) => DEAL_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: DEAL_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// METRIC VISIBILITY
// =============================================================================

export function getMetricVisibility(role: BusinessRoleLens): MetricVisibility {
  switch (role) {
    case 'B1':
    case 'B2b':
    case 'B8':
    case 'B13':
      return 'exact';
    case 'B2a':
      return 'banded';
    case 'B5':
      return 'banded';
    case 'B3':
    case 'B4':
    default:
      return 'hidden';
  }
}

// =============================================================================
// DOCUMENT ACCESS
// =============================================================================

export function canAccessDoc(tag: DocAccessTag, role: BusinessRoleLens, tier?: InvestorTier): boolean {
  // Founder and holding company see everything
  if (role === 'B1' || role === 'B13') return true;

  // Workspace-only docs are restricted to B5 acquirers
  if (tag === 'workspace_only') return role === 'B5';

  // Public docs are visible to everyone
  if (tag === 'public') return true;

  // Founder-only docs are restricted to B1/B13 (handled above)
  if (tag === 'founder_only') return false;

  // Retail docs: accessible by B2a, B2b, B5, B8
  if (tag === 'retail') {
    return role === 'B2a' || role === 'B2b' || role === 'B5' || role === 'B8';
  }

  // Board docs: accessible by B2b and B8
  if (tag === 'board') {
    return role === 'B2b' || role === 'B8';
  }

  return false;
}

// =============================================================================
// ROLE MAPPING
// =============================================================================

// =============================================================================
// MEMBERSHIP → LENS (direct membership_id mapping for ActiveView)
// =============================================================================

const BUSINESS_MEMBERSHIP_MAP: Record<string, BusinessRoleLens> = {};

export function getBusinessRole(membershipId: string): BusinessRoleLens {
  if (isSystemOwner(membershipId)) return 'B1';
  return BUSINESS_MEMBERSHIP_MAP[membershipId] ?? 'B1';
}

export function mapRoleToBusinessLens(role: string): BusinessRoleLens {
  switch (role) {
    case 'founder':
    case 'ceo':
    case 'owner':
      return 'B1';
    case 'retail_investor':
    case 'angel':
    case 'investor_retail':
      return 'B2a';
    case 'board_member':
    case 'strategic_investor':
    case 'investor_board':
    case 'board':
      return 'B2b';
    case 'public':
    case 'visitor':
      return 'B3';
    case 'subscriber':
    case 'follower':
      return 'B4';
    case 'acquirer':
    case 'prospective_acquirer':
    case 'buyer':
      return 'B5';
    case 'advisor':
    case 'board_advisor':
      return 'B8';
    case 'holding_company':
    case 'parent':
    case 'parent_org':
      return 'B13';
    default:
      return 'B3';
  }
}

// =============================================================================
// VISIBILITY HELPERS
// =============================================================================

export function isFounder(role: BusinessRoleLens): boolean {
  return role === 'B1';
}

export function isBoardLevel(role: BusinessRoleLens): boolean {
  return role === 'B1' || role === 'B2b' || role === 'B8' || role === 'B13';
}

export function isInvestor(role: BusinessRoleLens): boolean {
  return role === 'B2a' || role === 'B2b';
}

// =============================================================================
// QUICK ACTIONS BY ROLE
// =============================================================================

export interface BusinessQuickAction {
  id: string;
  label: string;
  icon: string;
}

const BUSINESS_QUICK_ACTIONS: Record<BusinessRoleLens, BusinessQuickAction[]> = {
  B1: [
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'data-room', label: 'Open Data Room', icon: 'folder.fill' },
    { id: 'deal-workspace', label: 'Deal Workspaces', icon: 'briefcase.fill' },
    { id: 'finance-snapshot', label: 'Finance Snapshot', icon: 'dollarsign.circle.fill' },
    { id: 'investor-update', label: 'Draft Investor Update', icon: 'envelope.fill' },
    { id: 'governance', label: 'Governance', icon: 'doc.text.fill' },
    { id: 'team', label: 'Team & People', icon: 'person.2.fill' },
  ],
  B2a: [
    { id: 'data-room', label: 'Open Data Room', icon: 'folder.fill' },
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'traction', label: 'View Traction', icon: 'chart.line.uptrend.xyaxis' },
    { id: 'updates', label: 'Investor Updates', icon: 'envelope.fill' },
    { id: 'team', label: 'Meet the Team', icon: 'person.2.fill' },
  ],
  B2b: [
    { id: 'data-room', label: 'Open Data Room', icon: 'folder.fill' },
    { id: 'board-pack', label: 'Board Pack', icon: 'doc.richtext.fill' },
    { id: 'finance', label: 'Financials', icon: 'dollarsign.circle.fill' },
    { id: 'governance', label: 'Governance', icon: 'doc.text.fill' },
    { id: 'decision-log', label: 'Decision Log', icon: 'list.bullet.clipboard.fill' },
    { id: 'deal-workspace', label: 'Deal Workspaces', icon: 'briefcase.fill' },
  ],
  B3: [
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'product', label: 'Product Info', icon: 'app.fill' },
    { id: 'team', label: 'Team', icon: 'person.2.fill' },
  ],
  B4: [
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'product', label: 'Product Info', icon: 'app.fill' },
    { id: 'comms', label: 'Updates', icon: 'megaphone.fill' },
    { id: 'team', label: 'Team', icon: 'person.2.fill' },
  ],
  B5: [
    { id: 'deal-workspace', label: 'Acquisition Workspace', icon: 'briefcase.fill' },
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'product', label: 'Product Info', icon: 'app.fill' },
    { id: 'team', label: 'Team & People', icon: 'person.2.fill' },
  ],
  B8: [
    { id: 'board-pack', label: 'Board Pack', icon: 'doc.richtext.fill' },
    { id: 'data-room', label: 'Data Room', icon: 'folder.fill' },
    { id: 'governance', label: 'Governance', icon: 'doc.text.fill' },
    { id: 'finance', label: 'Financials', icon: 'dollarsign.circle.fill' },
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
  ],
  B13: [
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'data-room', label: 'Data Room', icon: 'folder.fill' },
    { id: 'finance', label: 'Financials', icon: 'dollarsign.circle.fill' },
    { id: 'governance', label: 'Governance', icon: 'doc.text.fill' },
    { id: 'deal-workspace', label: 'Deal Workspaces', icon: 'briefcase.fill' },
    { id: 'team', label: 'Team & People', icon: 'person.2.fill' },
  ],
};

export function getBusinessQuickActions(role: BusinessRoleLens): BusinessQuickAction[] {
  return BUSINESS_QUICK_ACTIONS[role] || BUSINESS_QUICK_ACTIONS.B3;
}

// =============================================================================
// ORG TAB VISIBILITY (10 tabs in Business Organization)
// =============================================================================

export type BizOrgTab =
  | 'entities' | 'people' | 'rooms' | 'operations' | 'finance'
  | 'payment-rails' | 'legal' | 'compliance' | 'assets' | 'reports';

const BIZ_ORG_TAB_MATRIX: Record<BizOrgTab, Record<BusinessRoleLens, BusinessVisibility>> = {
  entities:       { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'limited', B4: 'limited', B5: 'limited', B8: 'limited', B13: 'full' },
  people:         { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'limited', B4: 'hidden',  B5: 'hidden',  B8: 'exact',   B13: 'full' },
  rooms:          { B1: 'full', B2a: 'hidden',  B2b: 'limited', B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'limited', B13: 'full' },
  operations:     { B1: 'full', B2a: 'hidden',  B2b: 'limited', B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'limited', B13: 'full' },
  finance:        { B1: 'full', B2a: 'banded',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'exact',   B13: 'full' },
  'payment-rails':{ B1: 'full', B2a: 'hidden',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'exact',   B13: 'full' },
  legal:          { B1: 'full', B2a: 'hidden',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'exact',   B13: 'full' },
  compliance:     { B1: 'full', B2a: 'hidden',  B2b: 'limited', B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'limited', B13: 'full' },
  assets:         { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'limited', B8: 'exact',   B13: 'full' },
  reports:        { B1: 'full', B2a: 'banded',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'limited', B8: 'exact',   B13: 'full' },
};

export function getBizOrgTabVisibility(tab: BizOrgTab, role: BusinessRoleLens): BusinessVisibility {
  return BIZ_ORG_TAB_MATRIX[tab]?.[role] ?? 'hidden';
}

export function getVisibleBizOrgTabs(role: BusinessRoleLens): BizOrgTab[] {
  return (Object.keys(BIZ_ORG_TAB_MATRIX) as BizOrgTab[])
    .filter((tab) => BIZ_ORG_TAB_MATRIX[tab][role] !== 'hidden');
}

// =============================================================================
// HOME PILL VISIBILITY (4-pill layout)
// =============================================================================

export type BusinessHomePill = 'dashboard' | 'calendar' | 'vault' | 'deals';

const BIZ_HOME_PILL_MATRIX: Record<BusinessHomePill, Record<BusinessRoleLens, BusinessVisibility>> = {
  dashboard: { B1: 'full', B2a: 'full', B2b: 'full', B3: 'full', B4: 'full', B5: 'full', B8: 'full', B13: 'full' },
  calendar:  { B1: 'full', B2a: 'full', B2b: 'full', B3: 'full', B4: 'full', B5: 'full', B8: 'full', B13: 'full' },
  vault:     { B1: 'full', B2a: 'full', B2b: 'full', B3: 'full', B4: 'full', B5: 'full', B8: 'full', B13: 'full' },
  deals:     { B1: 'full', B2a: 'full', B2b: 'full', B3: 'full', B4: 'full', B5: 'full', B8: 'full', B13: 'full' },
};

export function getBusinessVisiblePills(role: BusinessRoleLens): BusinessHomePill[] {
  return (Object.keys(BIZ_HOME_PILL_MATRIX) as BusinessHomePill[])
    .filter((pill) => BIZ_HOME_PILL_MATRIX[pill][role] !== 'hidden');
}

// =============================================================================
// DASHBOARD BLOCK VISIBILITY (7 blocks)
// =============================================================================

export type DashboardBlock =
  | 'video_hero' | 'next_event' | 'action_row' | 'pipeline'
  | 'proof' | 'top_deals' | 'domain_cards';

const DASHBOARD_BLOCK_MATRIX: Record<DashboardBlock, Record<BusinessRoleLens, boolean>> = {
  video_hero:   { B1: true,  B2a: true,  B2b: true,  B3: true,  B4: true,  B5: true,  B8: true,  B13: true },
  next_event:   { B1: true,  B2a: false, B2b: true,  B3: false, B4: false, B5: false, B8: true,  B13: true },
  action_row:   { B1: true,  B2a: true,  B2b: true,  B3: true,  B4: true,  B5: true,  B8: true,  B13: true },
  pipeline:     { B1: true,  B2a: true,  B2b: true,  B3: false, B4: false, B5: true,  B8: true,  B13: true },
  proof:        { B1: true,  B2a: true,  B2b: true,  B3: true,  B4: true,  B5: true,  B8: true,  B13: true },
  top_deals:    { B1: true,  B2a: false, B2b: true,  B3: false, B4: false, B5: false, B8: true,  B13: true },
  domain_cards: { B1: true,  B2a: true,  B2b: true,  B3: false, B4: false, B5: true,  B8: true,  B13: true },
};

export function isDashboardBlockVisible(block: DashboardBlock, role: BusinessRoleLens): boolean {
  return DASHBOARD_BLOCK_MATRIX[block]?.[role] ?? false;
}

// =============================================================================
// ACTION CARD VISIBILITY (3 cards in action row)
// =============================================================================

import type { BizActionCardId } from '@/data/mock-business-home';

const ACTION_CARD_MATRIX: Record<BizActionCardId, Record<BusinessRoleLens, boolean>> = {
  deck:      { B1: true,  B2a: true,  B2b: true,  B3: true,  B4: true,  B5: true,  B8: true,  B13: true },
  data_room: { B1: true,  B2a: true,  B2b: true,  B3: false, B4: false, B5: true,  B8: true,  B13: true },
  invest:    { B1: true,  B2a: true,  B2b: true,  B3: false, B4: false, B5: false, B8: false, B13: true },
};

export function isActionCardVisible(card: BizActionCardId, role: BusinessRoleLens): boolean {
  return ACTION_CARD_MATRIX[card]?.[role] ?? false;
}

// =============================================================================
// PIPELINE METRIC VISIBILITY (4 metrics)
// =============================================================================

export type PipelineMetric = 'total_value' | 'active_deals' | 'win_rate' | 'raised';

const PIPELINE_METRIC_MATRIX: Record<PipelineMetric, Record<BusinessRoleLens, MetricVisibility>> = {
  total_value:  { B1: 'exact', B2a: 'hidden',  B2b: 'exact',  B3: 'hidden', B4: 'hidden', B5: 'banded', B8: 'exact',  B13: 'exact' },
  active_deals: { B1: 'exact', B2a: 'exact',   B2b: 'exact',  B3: 'hidden', B4: 'hidden', B5: 'banded', B8: 'exact',  B13: 'exact' },
  win_rate:     { B1: 'exact', B2a: 'hidden',  B2b: 'exact',  B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'exact',  B13: 'exact' },
  raised:       { B1: 'exact', B2a: 'exact',   B2b: 'exact',  B3: 'hidden', B4: 'hidden', B5: 'banded', B8: 'exact',  B13: 'exact' },
};

export function getPipelineMetricVisibility(metric: PipelineMetric, role: BusinessRoleLens): MetricVisibility {
  return PIPELINE_METRIC_MATRIX[metric]?.[role] ?? 'hidden';
}

// =============================================================================
// DOMAIN CARD VISIBILITY (3 cards)
// =============================================================================

import type { BizDomainCardId } from '@/data/mock-business-home';

const DOMAIN_CARD_MATRIX: Record<BizDomainCardId, Record<BusinessRoleLens, boolean>> = {
  cap_table: { B1: true,  B2a: true,  B2b: true,  B3: false, B4: false, B5: true,  B8: true,  B13: true },
  metrics:   { B1: true,  B2a: false, B2b: true,  B3: false, B4: false, B5: true,  B8: true,  B13: true },
  updates:   { B1: true,  B2a: true,  B2b: true,  B3: false, B4: true,  B5: false, B8: true,  B13: true },
};

export function isBizDomainCardVisible(card: BizDomainCardId, role: BusinessRoleLens): boolean {
  return DOMAIN_CARD_MATRIX[card]?.[role] ?? false;
}
