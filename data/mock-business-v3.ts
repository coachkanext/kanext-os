/**
 * Mock Business V3 — Shared data layer for the 9-tab Business Home.
 * Entity definitions, shared types, and cross-tab references.
 * All data references KaNeXT entities: Alex, KaNeXT, KaNeXT Church, KaNeXT, PBD/Tom.
 */

import type { BusinessRoleLens } from '@/utils/business-rbac';
import { isFounder, isBoardLevel, isInvestor } from '@/utils/business-rbac';

// =============================================================================
// ENTITY DEFINITIONS (used by EntityScopeBar on every tab)
// =============================================================================

export interface BizEntity {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'pending';
}

export const BIZ_ENTITIES: BizEntity[] = [
  { id: 'ent-kanext', name: 'KaNeXT Inc.', type: 'C-Corp', status: 'active' },
  { id: 'ent-osk', name: 'OSK Group LLC', type: 'LLC', status: 'active' },
  { id: 'ent-kanext-media', name: 'KaNeXT Media LLC', type: 'LLC', status: 'active' },
  { id: 'ent-kanext-sports', name: 'KaNeXT Sports LLC', type: 'LLC', status: 'pending' },
];

export const DEFAULT_ENTITY = BIZ_ENTITIES[0];

// =============================================================================
// SHARED PERSON REFERENCES
// =============================================================================

export interface BizPerson {
  id: string;
  name: string;
  role: string;
  initials: string;
}

export const PEOPLE: Record<string, BizPerson> = {
  sammy: { id: 'p-1', name: 'Alex Morgan', role: 'Founder / CEO', initials: 'AM' },
  pbd: { id: 'p-2', name: 'Patrick Bet-David', role: 'Strategic Advisor', initials: 'PB' },
  tom: { id: 'p-3', name: 'Tom Ellsworth', role: 'Board Observer', initials: 'TE' },
  adriana: { id: 'p-4', name: 'Adriana Ruiz', role: 'VP Engineering', initials: 'AR' },
  marcus: { id: 'p-5', name: 'Marcus Chen', role: 'Head of Product', initials: 'MC' },
  jordan: { id: 'p-6', name: 'Jordan Hayes', role: 'Head of BD', initials: 'JH' },
  lisa: { id: 'p-7', name: 'Lisa Park', role: 'Design Lead', initials: 'LP' },
  david: { id: 'p-8', name: 'David Okonkwo', role: 'Operations Manager', initials: 'DO' },
  tony: { id: 'p-9', name: 'Coach Tony Allen', role: 'Sports Advisor', initials: 'TA' },
};

// =============================================================================
// PROOF WEDGES (shared across Dashboard, Operations, Media/Proof)
// =============================================================================

export interface ProofWedge {
  id: string;
  name: string;
  orgName: string;
  icon: string;
  color: string;
  stat: string;
  statLabel: string;
}

export const PROOF_WEDGES: ProofWedge[] = [
  { id: 'w-fmu', name: 'KaNeXT', orgName: 'KaNeXT Sports', icon: 'sportscourt.fill', color: '#FFFFFF', stat: '$53M–$157M', statLabel: 'Media Value Y1' },
  { id: 'w-iccla', name: 'KaNeXT Church', orgName: "Int'l Church of Christ LA", icon: 'heart.fill', color: '#A1A1AA', stat: '3', statLabel: 'Campuses' },
  { id: 'w-k1', name: 'KaNeXT', orgName: 'KaNeXT Racing Series', icon: 'flag.checkered', color: '#EF4444', stat: '14', statLabel: 'Race Season' },
];

// =============================================================================
// FINANCIAL SNAPSHOT (shared across Dashboard, Finance, Reports)
// =============================================================================

export interface FinancialMetric {
  id: string;
  label: string;
  exactValue: string;
  bandedValue: string;
  trend: 'up' | 'down' | 'stable';
}

export const FINANCIAL_SNAPSHOT: FinancialMetric[] = [
  { id: 'fm-cash', label: 'Cash on Hand', exactValue: '$142,400', bandedValue: '$100K–$200K', trend: 'down' },
  { id: 'fm-burn', label: 'Monthly Burn', exactValue: '$19,800', bandedValue: '<$25K', trend: 'down' },
  { id: 'fm-runway', label: 'Runway', exactValue: '7.2 months', bandedValue: '6–9 mo', trend: 'stable' },
  { id: 'fm-recv', label: 'Pending Receivables', exactValue: '$45,000', bandedValue: '$25K–$50K', trend: 'up' },
];

// =============================================================================
// ROLE FILTERING HELPERS
// =============================================================================

/** Get the financial display value based on role (exact for B1/B2b, banded for B2a, hidden for B3) */
export function getFinancialValue(metric: FinancialMetric, role: BusinessRoleLens): string | null {
  if (isFounder(role) || role === 'B2b') return metric.exactValue;
  if (role === 'B2a') return metric.bandedValue;
  return null;
}

/** Standard tab visibility: which tabs each role can see */
export type BizTabId =
  | 'dashboard'
  | 'calendar'
  | 'operations'
  | 'finance'
  | 'payment_rails'
  | 'board_investors'
  | 'compliance_legal'
  | 'media_proof'
  | 'data_room';

const TAB_VISIBILITY: Record<BizTabId, BusinessRoleLens[]> = {
  dashboard: ['B1', 'B2a', 'B2b', 'B3'],
  calendar: ['B1', 'B2b'],
  operations: ['B1', 'B2b'],
  finance: ['B1', 'B2b'],
  payment_rails: ['B1'],
  board_investors: ['B1', 'B2a', 'B2b'],
  compliance_legal: ['B1', 'B2b'],
  media_proof: ['B1', 'B2a', 'B2b', 'B3'],
  data_room: ['B1', 'B2a', 'B2b'],
};

export function canAccessTab(tabId: BizTabId, role: BusinessRoleLens): boolean {
  return TAB_VISIBILITY[tabId]?.includes(role) ?? false;
}

// =============================================================================
// COMMON STATUS TYPES
// =============================================================================

export type BizStatus = 'on_track' | 'at_risk' | 'behind' | 'blocked' | 'done' | 'active' | 'pending' | 'draft';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type Priority = 'critical' | 'high' | 'medium' | 'low';
