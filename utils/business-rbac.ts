/**
 * Business Mode RBAC — 6-level role lens visibility matrix.
 * B1: Founder / CEO (Full access)
 * B2a: Investor (Retail) — Curated data room
 * B2b: Investor (Strategic/Board) — Board-level data room
 * B3: Public
 * B4: Subscriber (Public only)
 * B5: Prospective Acquirer (Acquisition workspace scoped)
 */

// =============================================================================
// ROLE LEVELS
// =============================================================================

export type BusinessRoleLens = 'B1' | 'B2a' | 'B2b' | 'B3' | 'B4' | 'B5';

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
};

// =============================================================================
// COMPANY SHEET TAB VISIBILITY
// =============================================================================

export type CompanyTab =
  | 'overview' | 'product' | 'traction' | 'roadmap'
  | 'finance' | 'governance' | 'people' | 'comms';

const COMPANY_TAB_MATRIX: Record<CompanyTab, Record<BusinessRoleLens, BusinessVisibility>> = {
  overview:   { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'limited', B4: 'limited', B5: 'limited' },
  product:    { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'limited', B4: 'limited', B5: 'limited' },
  traction:   { B1: 'full', B2a: 'banded',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'limited' },
  roadmap:    { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'limited' },
  finance:    { B1: 'full', B2a: 'banded',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'hidden' },
  governance: { B1: 'full', B2a: 'hidden',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'hidden' },
  people:     { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'limited', B4: 'limited', B5: 'limited' },
  comms:      { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'limited', B4: 'limited', B5: 'limited' },
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
  start_here:   { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'hidden', B4: 'hidden', B5: 'hidden' },
  pitch_pack:   { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'hidden', B4: 'hidden', B5: 'hidden' },
  product_demo: { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'hidden', B4: 'hidden', B5: 'hidden' },
  financials:   { B1: 'full', B2a: 'banded',  B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'hidden' },
  legal:        { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'hidden' },
  board_pack:   { B1: 'full', B2a: 'hidden',  B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'hidden' },
  decision_log: { B1: 'full', B2a: 'hidden',  B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'hidden' },
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
  overview:        { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full' },
  pipeline:        { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full' },
  diligence:       { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full' },
  financial_model: { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full' },
  risks:           { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full' },
  offer_terms:     { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full' },
  approvals:       { B1: 'full', B2a: 'hidden', B2b: 'limited', B3: 'hidden', B4: 'hidden', B5: 'limited' },
  audit_log:       { B1: 'full', B2a: 'hidden', B2b: 'limited', B3: 'hidden', B4: 'hidden', B5: 'limited' },
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
      return 'exact';
    case 'B2a':
      return 'banded';
    case 'B2b':
      return 'exact';
    case 'B3':
    case 'B4':
    case 'B5':
    default:
      return 'hidden';
  }
}

// =============================================================================
// DOCUMENT ACCESS
// =============================================================================

export function canAccessDoc(tag: DocAccessTag, role: BusinessRoleLens, tier?: InvestorTier): boolean {
  // Founder sees everything
  if (role === 'B1') return true;

  // Workspace-only docs are restricted to B5 acquirers
  if (tag === 'workspace_only') return role === 'B5';

  // Public docs are visible to everyone
  if (tag === 'public') return true;

  // Founder-only docs are restricted to B1 (handled above)
  if (tag === 'founder_only') return false;

  // Retail docs: accessible by B2a, B2b, and B5
  if (tag === 'retail') {
    return role === 'B2a' || role === 'B2b' || role === 'B5';
  }

  // Board docs: accessible by B2b only (and B1 handled above)
  if (tag === 'board') {
    // If an explicit tier override is provided, check it
    if (tier === 'board') return role === 'B2b';
    return role === 'B2b';
  }

  return false;
}

// =============================================================================
// ROLE MAPPING
// =============================================================================

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
  return role === 'B1' || role === 'B2b';
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
  entities:       { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'limited', B4: 'limited', B5: 'limited' },
  people:         { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'limited', B4: 'hidden',  B5: 'hidden' },
  rooms:          { B1: 'full', B2a: 'hidden',  B2b: 'limited', B3: 'hidden',  B4: 'hidden',  B5: 'hidden' },
  operations:     { B1: 'full', B2a: 'hidden',  B2b: 'limited', B3: 'hidden',  B4: 'hidden',  B5: 'hidden' },
  finance:        { B1: 'full', B2a: 'banded',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'hidden' },
  'payment-rails':{ B1: 'full', B2a: 'hidden',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'hidden' },
  legal:          { B1: 'full', B2a: 'hidden',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'hidden' },
  compliance:     { B1: 'full', B2a: 'hidden',  B2b: 'limited', B3: 'hidden',  B4: 'hidden',  B5: 'hidden' },
  assets:         { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'limited' },
  reports:        { B1: 'full', B2a: 'banded',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'limited' },
};

export function getBizOrgTabVisibility(tab: BizOrgTab, role: BusinessRoleLens): BusinessVisibility {
  return BIZ_ORG_TAB_MATRIX[tab]?.[role] ?? 'hidden';
}

export function getVisibleBizOrgTabs(role: BusinessRoleLens): BizOrgTab[] {
  return (Object.keys(BIZ_ORG_TAB_MATRIX) as BizOrgTab[])
    .filter((tab) => BIZ_ORG_TAB_MATRIX[tab][role] !== 'hidden');
}
