/**
 * Business Mode RBAC — 14-level role lens visibility matrix.
 *
 * B0:  System Owner            B7:  Retail / Minority Investor
 * B1:  Founder / CEO           B8:  Advisor
 * B2:  Co-Founder / C-Suite    B9:  Board Member
 * B3:  Department Head / VP    B10: Acquirer / Strategic Partner
 * B4:  Team Lead / Manager     B11: Subscriber / Customer
 * B5:  Employee / Contributor  B12: Public
 * B6:  Strategic Investor      B13: Holding Company
 */

import { isSystemOwner } from '@/utils/system-rbac';

// =============================================================================
// ROLE LEVELS
// =============================================================================

export type BusinessRoleLens =
  | 'B0' | 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'B6' | 'B7'
  | 'B8' | 'B9' | 'B10' | 'B11' | 'B12' | 'B13';

export type BusinessVisibility = 'full' | 'exact' | 'banded' | 'limited' | 'hidden';

export type MetricVisibility = 'exact' | 'banded' | 'hidden';

export type DocAccessTag = 'public' | 'retail' | 'board' | 'founder_only' | 'workspace_only';

export const BUSINESS_ROLE_LABELS: Record<BusinessRoleLens, string> = {
  B0: 'System Owner',
  B1: 'Founder / CEO',
  B2: 'Co-Founder / C-Suite',
  B3: 'Department Head / VP',
  B4: 'Team Lead / Manager',
  B5: 'Employee / Contributor',
  B6: 'Strategic Investor',
  B7: 'Retail / Minority Investor',
  B8: 'Advisor',
  B9: 'Board Member',
  B10: 'Acquirer / Strategic Partner',
  B11: 'Subscriber / Customer',
  B12: 'Public',
  B13: 'Holding Company',
};

// Helper to build a 14-column row concisely
type V = BusinessVisibility;
function r(
  b0: V, b1: V, b2: V, b3: V, b4: V, b5: V, b6: V,
  b7: V, b8: V, b9: V, b10: V, b11: V, b12: V, b13: V,
): Record<BusinessRoleLens, V> {
  return {
    B0: b0, B1: b1, B2: b2, B3: b3, B4: b4, B5: b5, B6: b6,
    B7: b7, B8: b8, B9: b9, B10: b10, B11: b11, B12: b12, B13: b13,
  };
}

// =============================================================================
// COMPANY SHEET TAB VISIBILITY
// =============================================================================

export type CompanyTab =
  | 'overview' | 'product' | 'traction' | 'roadmap'
  | 'finance' | 'governance' | 'people' | 'comms';

//                                                   B0      B1      B2      B3      B4        B5        B6        B7        B8        B9        B10       B11       B12       B13
const COMPANY_TAB_MATRIX: Record<CompanyTab, Record<BusinessRoleLens, V>> = {
  overview:   r('full', 'full', 'full', 'full',    'full',    'limited', 'limited', 'limited', 'full',    'full',    'limited', 'limited', 'limited', 'full'),
  product:    r('full', 'full', 'full', 'full',    'full',    'limited', 'limited', 'limited', 'full',    'full',    'limited', 'limited', 'limited', 'full'),
  traction:   r('full', 'full', 'full', 'full',    'limited', 'hidden',  'exact',   'banded',  'exact',   'exact',   'limited', 'hidden',  'hidden',  'full'),
  roadmap:    r('full', 'full', 'full', 'full',    'limited', 'hidden',  'exact',   'limited', 'exact',   'exact',   'limited', 'hidden',  'hidden',  'full'),
  finance:    r('full', 'full', 'full', 'full',    'limited', 'hidden',  'exact',   'banded',  'exact',   'exact',   'hidden',  'hidden',  'hidden',  'full'),
  governance: r('full', 'full', 'full', 'limited', 'hidden',  'hidden',  'exact',   'hidden',  'exact',   'exact',   'hidden',  'hidden',  'hidden',  'full'),
  people:     r('full', 'full', 'full', 'full',    'full',    'limited', 'exact',   'limited', 'exact',   'exact',   'limited', 'limited', 'limited', 'full'),
  comms:      r('full', 'full', 'full', 'full',    'full',    'limited', 'exact',   'limited', 'exact',   'exact',   'limited', 'limited', 'limited', 'full'),
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

//                                                       B0      B1      B2      B3      B4        B5        B6        B7        B8        B9        B10       B11       B12       B13
const DATA_ROOM_TAB_MATRIX: Record<DataRoomTab, Record<BusinessRoleLens, V>> = {
  start_here:   r('full', 'full', 'full', 'limited', 'hidden',  'hidden',  'limited', 'limited', 'limited', 'limited', 'hidden',  'hidden',  'hidden',  'full'),
  pitch_pack:   r('full', 'full', 'full', 'limited', 'hidden',  'hidden',  'limited', 'limited', 'limited', 'limited', 'hidden',  'hidden',  'hidden',  'full'),
  product_demo: r('full', 'full', 'full', 'limited', 'hidden',  'hidden',  'limited', 'limited', 'limited', 'limited', 'hidden',  'hidden',  'hidden',  'full'),
  financials:   r('full', 'full', 'full', 'full',    'limited', 'hidden',  'exact',   'banded',  'exact',   'exact',   'hidden',  'hidden',  'hidden',  'full'),
  legal:        r('full', 'full', 'full', 'full',    'limited', 'hidden',  'exact',   'limited', 'exact',   'exact',   'hidden',  'hidden',  'hidden',  'full'),
  board_pack:   r('full', 'full', 'full', 'hidden',  'hidden',  'hidden',  'exact',   'hidden',  'exact',   'exact',   'hidden',  'hidden',  'hidden',  'full'),
  decision_log: r('full', 'full', 'full', 'hidden',  'hidden',  'hidden',  'exact',   'hidden',  'exact',   'exact',   'hidden',  'hidden',  'hidden',  'full'),
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

//                                                 B0      B1      B2      B3      B4        B5        B6        B7        B8        B9        B10       B11       B12       B13
const DEAL_TAB_MATRIX: Record<DealTab, Record<BusinessRoleLens, V>> = {
  overview:        r('full', 'full', 'full', 'full',    'limited', 'hidden',  'exact',   'hidden',  'exact',   'exact',   'full',    'hidden',  'hidden',  'full'),
  pipeline:        r('full', 'full', 'full', 'full',    'limited', 'hidden',  'exact',   'hidden',  'exact',   'exact',   'full',    'hidden',  'hidden',  'full'),
  diligence:       r('full', 'full', 'full', 'full',    'limited', 'hidden',  'exact',   'hidden',  'exact',   'exact',   'full',    'hidden',  'hidden',  'full'),
  financial_model: r('full', 'full', 'full', 'full',    'limited', 'hidden',  'exact',   'hidden',  'exact',   'exact',   'full',    'hidden',  'hidden',  'full'),
  risks:           r('full', 'full', 'full', 'full',    'limited', 'hidden',  'exact',   'hidden',  'exact',   'exact',   'full',    'hidden',  'hidden',  'full'),
  offer_terms:     r('full', 'full', 'full', 'full',    'hidden',  'hidden',  'exact',   'hidden',  'exact',   'exact',   'full',    'hidden',  'hidden',  'full'),
  approvals:       r('full', 'full', 'full', 'limited', 'hidden',  'hidden',  'limited', 'hidden',  'limited', 'limited', 'limited', 'hidden',  'hidden',  'full'),
  audit_log:       r('full', 'full', 'full', 'limited', 'hidden',  'hidden',  'limited', 'hidden',  'limited', 'limited', 'limited', 'hidden',  'hidden',  'full'),
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
    case 'B0':
    case 'B1':
    case 'B2':
    case 'B3':
    case 'B6':
    case 'B8':
    case 'B9':
    case 'B13':
      return 'exact';
    case 'B4':
    case 'B7':
    case 'B10':
      return 'banded';
    case 'B5':
    case 'B11':
    case 'B12':
    default:
      return 'hidden';
  }
}

// =============================================================================
// DOCUMENT ACCESS
// =============================================================================

export function canAccessDoc(tag: DocAccessTag, role: BusinessRoleLens): boolean {
  // System owner, founder, and holding company see everything
  if (role === 'B0' || role === 'B1' || role === 'B13') return true;

  // Workspace-only docs are restricted to B10 acquirers
  if (tag === 'workspace_only') return role === 'B10';

  // Public docs are visible to everyone
  if (tag === 'public') return true;

  // Founder-only docs are restricted to B0/B1/B13 (handled above)
  if (tag === 'founder_only') return false;

  // Retail docs: accessible by investors, advisor, board, acquirer, c-suite
  if (tag === 'retail') {
    return role === 'B2' || role === 'B6' || role === 'B7' || role === 'B8' || role === 'B9' || role === 'B10';
  }

  // Board docs: accessible by c-suite, strategic investor, advisor, board
  if (tag === 'board') {
    return role === 'B2' || role === 'B6' || role === 'B8' || role === 'B9';
  }

  return false;
}

// =============================================================================
// ROLE MAPPING
// =============================================================================

const BUSINESS_MEMBERSHIP_MAP: Record<string, BusinessRoleLens> = {};

export function getBusinessRole(membershipId: string): BusinessRoleLens {
  if (isSystemOwner(membershipId)) return 'B0';
  return BUSINESS_MEMBERSHIP_MAP[membershipId] ?? 'B1';
}

export function mapRoleToBusinessLens(role: string): BusinessRoleLens {
  switch (role) {
    case 'system_owner':
      return 'B0';
    case 'founder':
    case 'ceo':
    case 'owner':
      return 'B1';
    case 'co_founder':
    case 'c_suite':
    case 'cto':
    case 'cfo':
    case 'coo':
      return 'B2';
    case 'department_head':
    case 'vp':
    case 'director':
      return 'B3';
    case 'team_lead':
    case 'manager':
      return 'B4';
    case 'employee':
    case 'contributor':
    case 'ic':
      return 'B5';
    case 'strategic_investor':
    case 'investor_board':
      return 'B6';
    case 'retail_investor':
    case 'angel':
    case 'investor_retail':
      return 'B7';
    case 'advisor':
    case 'board_advisor':
      return 'B8';
    case 'board_member':
    case 'board':
      return 'B9';
    case 'acquirer':
    case 'prospective_acquirer':
    case 'buyer':
    case 'strategic_partner':
      return 'B10';
    case 'subscriber':
    case 'customer':
    case 'follower':
      return 'B11';
    case 'public':
    case 'visitor':
      return 'B12';
    case 'holding_company':
    case 'parent':
    case 'parent_org':
      return 'B13';
    default:
      return 'B12';
  }
}

// =============================================================================
// VISIBILITY HELPERS
// =============================================================================

export function isFounder(role: BusinessRoleLens): boolean {
  return role === 'B0' || role === 'B1';
}

export function isBoardLevel(role: BusinessRoleLens): boolean {
  return role === 'B0' || role === 'B1' || role === 'B2' || role === 'B6' || role === 'B8' || role === 'B9' || role === 'B13';
}

export function isInvestor(role: BusinessRoleLens): boolean {
  return role === 'B6' || role === 'B7';
}

// =============================================================================
// QUICK ACTIONS BY ROLE
// =============================================================================

export interface BusinessQuickAction {
  id: string;
  label: string;
  icon: string;
}

const BUSINESS_QUICK_ACTIONS: Partial<Record<BusinessRoleLens, BusinessQuickAction[]>> = {
  B0: [
    { id: 'system-overview', label: 'System Overview', icon: 'gearshape.fill' },
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'data-room', label: 'Open Data Room', icon: 'folder.fill' },
    { id: 'finance-snapshot', label: 'Finance Snapshot', icon: 'dollarsign.circle.fill' },
    { id: 'audit-log', label: 'Audit Log', icon: 'doc.text.fill' },
  ],
  B1: [
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'data-room', label: 'Open Data Room', icon: 'folder.fill' },
    { id: 'deal-workspace', label: 'Deal Workspaces', icon: 'briefcase.fill' },
    { id: 'finance-snapshot', label: 'Finance Snapshot', icon: 'dollarsign.circle.fill' },
    { id: 'investor-update', label: 'Draft Investor Update', icon: 'envelope.fill' },
    { id: 'governance', label: 'Governance', icon: 'doc.text.fill' },
    { id: 'team', label: 'Team & People', icon: 'person.2.fill' },
  ],
  B2: [
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'data-room', label: 'Open Data Room', icon: 'folder.fill' },
    { id: 'deal-workspace', label: 'Deal Workspaces', icon: 'briefcase.fill' },
    { id: 'finance-snapshot', label: 'Finance Snapshot', icon: 'dollarsign.circle.fill' },
    { id: 'team', label: 'Team & People', icon: 'person.2.fill' },
  ],
  B3: [
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'team', label: 'My Team', icon: 'person.2.fill' },
    { id: 'operations', label: 'Operations', icon: 'gearshape.fill' },
    { id: 'finance', label: 'Financials', icon: 'dollarsign.circle.fill' },
  ],
  B4: [
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'team', label: 'My Team', icon: 'person.2.fill' },
    { id: 'comms', label: 'Updates', icon: 'megaphone.fill' },
  ],
  B5: [
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'product', label: 'Product Info', icon: 'app.fill' },
    { id: 'comms', label: 'Updates', icon: 'megaphone.fill' },
  ],
  B6: [
    { id: 'data-room', label: 'Open Data Room', icon: 'folder.fill' },
    { id: 'board-pack', label: 'Board Pack', icon: 'doc.richtext.fill' },
    { id: 'finance', label: 'Financials', icon: 'dollarsign.circle.fill' },
    { id: 'governance', label: 'Governance', icon: 'doc.text.fill' },
    { id: 'decision-log', label: 'Decision Log', icon: 'list.bullet.clipboard.fill' },
    { id: 'deal-workspace', label: 'Deal Workspaces', icon: 'briefcase.fill' },
  ],
  B7: [
    { id: 'data-room', label: 'Open Data Room', icon: 'folder.fill' },
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'traction', label: 'View Traction', icon: 'chart.line.uptrend.xyaxis' },
    { id: 'updates', label: 'Investor Updates', icon: 'envelope.fill' },
    { id: 'team', label: 'Meet the Team', icon: 'person.2.fill' },
  ],
  B8: [
    { id: 'board-pack', label: 'Board Pack', icon: 'doc.richtext.fill' },
    { id: 'data-room', label: 'Data Room', icon: 'folder.fill' },
    { id: 'governance', label: 'Governance', icon: 'doc.text.fill' },
    { id: 'finance', label: 'Financials', icon: 'dollarsign.circle.fill' },
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
  ],
  B9: [
    { id: 'board-pack', label: 'Board Pack', icon: 'doc.richtext.fill' },
    { id: 'governance', label: 'Governance', icon: 'doc.text.fill' },
    { id: 'finance', label: 'Financials', icon: 'dollarsign.circle.fill' },
    { id: 'data-room', label: 'Data Room', icon: 'folder.fill' },
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
  ],
  B10: [
    { id: 'deal-workspace', label: 'Acquisition Workspace', icon: 'briefcase.fill' },
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'product', label: 'Product Info', icon: 'app.fill' },
    { id: 'team', label: 'Team & People', icon: 'person.2.fill' },
  ],
  B11: [
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'product', label: 'Product Info', icon: 'app.fill' },
    { id: 'comms', label: 'Updates', icon: 'megaphone.fill' },
    { id: 'team', label: 'Team', icon: 'person.2.fill' },
  ],
  B12: [
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'product', label: 'Product Info', icon: 'app.fill' },
    { id: 'team', label: 'Team', icon: 'person.2.fill' },
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
  return BUSINESS_QUICK_ACTIONS[role] || BUSINESS_QUICK_ACTIONS.B12 || [];
}

// =============================================================================
// ORG TAB VISIBILITY (10 tabs in Business Organization)
// =============================================================================

export type BizOrgTab =
  | 'entities' | 'people' | 'rooms' | 'operations' | 'finance'
  | 'payment-rails' | 'legal' | 'compliance' | 'assets' | 'reports';

//                                                    B0      B1      B2      B3      B4        B5        B6        B7        B8        B9        B10       B11       B12       B13
const BIZ_ORG_TAB_MATRIX: Record<BizOrgTab, Record<BusinessRoleLens, V>> = {
  entities:       r('full', 'full', 'full', 'full',    'full',    'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'full'),
  people:         r('full', 'full', 'full', 'full',    'full',    'limited', 'exact',   'limited', 'exact',   'exact',   'hidden',  'hidden',  'hidden',  'full'),
  rooms:          r('full', 'full', 'full', 'full',    'limited', 'hidden',  'limited', 'hidden',  'limited', 'limited', 'hidden',  'hidden',  'hidden',  'full'),
  operations:     r('full', 'full', 'full', 'full',    'full',    'limited', 'limited', 'hidden',  'limited', 'limited', 'hidden',  'hidden',  'hidden',  'full'),
  finance:        r('full', 'full', 'full', 'full',    'limited', 'hidden',  'exact',   'banded',  'exact',   'exact',   'hidden',  'hidden',  'hidden',  'full'),
  'payment-rails':r('full', 'full', 'full', 'limited', 'hidden',  'hidden',  'exact',   'hidden',  'exact',   'exact',   'hidden',  'hidden',  'hidden',  'full'),
  legal:          r('full', 'full', 'full', 'full',    'limited', 'hidden',  'exact',   'hidden',  'exact',   'exact',   'hidden',  'hidden',  'hidden',  'full'),
  compliance:     r('full', 'full', 'full', 'full',    'limited', 'hidden',  'limited', 'hidden',  'limited', 'limited', 'hidden',  'hidden',  'hidden',  'full'),
  assets:         r('full', 'full', 'full', 'full',    'limited', 'hidden',  'exact',   'limited', 'exact',   'exact',   'limited', 'hidden',  'hidden',  'full'),
  reports:        r('full', 'full', 'full', 'full',    'limited', 'hidden',  'exact',   'banded',  'exact',   'exact',   'limited', 'hidden',  'hidden',  'full'),
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

//                                                              B0     B1     B2     B3     B4     B5     B6     B7     B8     B9     B10    B11    B12    B13
const BIZ_HOME_PILL_MATRIX: Record<BusinessHomePill, Record<BusinessRoleLens, V>> = {
  dashboard: r('full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full'),
  calendar:  r('full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full'),
  vault:     r('full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full'),
  deals:     r('full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full'),
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

// Helper for boolean matrix
function rb(
  b0: boolean, b1: boolean, b2: boolean, b3: boolean, b4: boolean, b5: boolean, b6: boolean,
  b7: boolean, b8: boolean, b9: boolean, b10: boolean, b11: boolean, b12: boolean, b13: boolean,
): Record<BusinessRoleLens, boolean> {
  return {
    B0: b0, B1: b1, B2: b2, B3: b3, B4: b4, B5: b5, B6: b6,
    B7: b7, B8: b8, B9: b9, B10: b10, B11: b11, B12: b12, B13: b13,
  };
}

const DASHBOARD_BLOCK_MATRIX: Record<DashboardBlock, Record<BusinessRoleLens, boolean>> = {
  video_hero:   rb(true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true),
  next_event:   rb(true,  true,  true,  true,  true,  false, true,  false, true,  true,  false, false, false, true),
  action_row:   rb(true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true),
  pipeline:     rb(true,  true,  true,  true,  true,  false, true,  true,  true,  true,  true,  false, false, true),
  proof:        rb(true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true),
  top_deals:    rb(true,  true,  true,  true,  false, false, true,  false, true,  true,  false, false, false, true),
  domain_cards: rb(true,  true,  true,  true,  true,  false, true,  true,  true,  true,  true,  false, false, true),
};

export function isDashboardBlockVisible(block: DashboardBlock, role: BusinessRoleLens): boolean {
  return DASHBOARD_BLOCK_MATRIX[block]?.[role] ?? false;
}

// =============================================================================
// ACTION CARD VISIBILITY (3 cards in action row)
// =============================================================================

import type { BizActionCardId } from '@/data/mock-business-home';

const ACTION_CARD_MATRIX: Record<BizActionCardId, Record<BusinessRoleLens, boolean>> = {
  deck:      rb(true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true),
  data_room: rb(true,  true,  true,  true,  false, false, true,  true,  true,  true,  true,  false, false, true),
  invest:    rb(true,  true,  true,  false, false, false, true,  true,  false, false, false, false, false, true),
};

export function isActionCardVisible(card: BizActionCardId, role: BusinessRoleLens): boolean {
  return ACTION_CARD_MATRIX[card]?.[role] ?? false;
}

// =============================================================================
// PIPELINE METRIC VISIBILITY (4 metrics)
// =============================================================================

export type PipelineMetric = 'total_value' | 'active_deals' | 'win_rate' | 'raised';

// Helper for metric visibility matrix
function rm(
  b0: MetricVisibility, b1: MetricVisibility, b2: MetricVisibility, b3: MetricVisibility,
  b4: MetricVisibility, b5: MetricVisibility, b6: MetricVisibility, b7: MetricVisibility,
  b8: MetricVisibility, b9: MetricVisibility, b10: MetricVisibility, b11: MetricVisibility,
  b12: MetricVisibility, b13: MetricVisibility,
): Record<BusinessRoleLens, MetricVisibility> {
  return {
    B0: b0, B1: b1, B2: b2, B3: b3, B4: b4, B5: b5, B6: b6,
    B7: b7, B8: b8, B9: b9, B10: b10, B11: b11, B12: b12, B13: b13,
  };
}

const PIPELINE_METRIC_MATRIX: Record<PipelineMetric, Record<BusinessRoleLens, MetricVisibility>> = {
  total_value:  rm('exact', 'exact', 'exact', 'exact', 'hidden', 'hidden', 'exact',  'hidden', 'exact',  'exact',  'banded', 'hidden', 'hidden', 'exact'),
  active_deals: rm('exact', 'exact', 'exact', 'exact', 'exact',  'hidden', 'exact',  'exact',  'exact',  'exact',  'banded', 'hidden', 'hidden', 'exact'),
  win_rate:     rm('exact', 'exact', 'exact', 'exact', 'hidden', 'hidden', 'exact',  'hidden', 'exact',  'exact',  'hidden', 'hidden', 'hidden', 'exact'),
  raised:       rm('exact', 'exact', 'exact', 'exact', 'hidden', 'hidden', 'exact',  'exact',  'exact',  'exact',  'banded', 'hidden', 'hidden', 'exact'),
};

export function getPipelineMetricVisibility(metric: PipelineMetric, role: BusinessRoleLens): MetricVisibility {
  return PIPELINE_METRIC_MATRIX[metric]?.[role] ?? 'hidden';
}

// =============================================================================
// DOMAIN CARD VISIBILITY (3 cards)
// =============================================================================

import type { BizDomainCardId } from '@/data/mock-business-home';

const DOMAIN_CARD_MATRIX: Record<BizDomainCardId, Record<BusinessRoleLens, boolean>> = {
  cap_table: rb(true,  true,  true,  false, false, false, true,  true,  true,  true,  true,  false, false, true),
  metrics:   rb(true,  true,  true,  true,  false, false, true,  false, true,  true,  true,  false, false, true),
  updates:   rb(true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  false, true,  false, true),
};

export function isBizDomainCardVisible(card: BizDomainCardId, role: BusinessRoleLens): boolean {
  return DOMAIN_CARD_MATRIX[card]?.[role] ?? false;
}
