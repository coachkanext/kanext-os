/**
 * Business Organization — Shared Types
 * Used across all 10 Biz Org tabs: state machines, receipts, traffic lights,
 * entity types, cross-tab links, and seeded demo entity IDs.
 */

import type { BizOrgTab } from '@/utils/business-rbac';

// =============================================================================
// TRANSACTION STATE MACHINE
// =============================================================================

export type BizTxnState =
  | 'draft'
  | 'proposed'
  | 'rule_checked'
  | 'authorized'
  | 'scheduled'
  | 'released'
  | 'in_flight'
  | 'settled'
  | 'hold'
  | 'failed'
  | 'disputed'
  | 'returned'
  | 'reversed';

export const BIZ_TXN_STATE_LABELS: Record<BizTxnState, string> = {
  draft: 'Draft',
  proposed: 'Proposed',
  rule_checked: 'Rule Checked',
  authorized: 'Authorized',
  scheduled: 'Scheduled',
  released: 'Released',
  in_flight: 'In Flight',
  settled: 'Settled',
  hold: 'Hold',
  failed: 'Failed',
  disputed: 'Disputed',
  returned: 'Returned',
  reversed: 'Reversed',
};

export const BIZ_TXN_STATE_COLORS: Record<BizTxnState, string> = {
  draft: '#9CA3AF',
  proposed: '#F59E0B',
  rule_checked: '#3B82F6',
  authorized: '#8B5CF6',
  scheduled: '#6366F1',
  released: '#14B8A6',
  in_flight: '#0EA5E9',
  settled: '#22C55E',
  hold: '#F59E0B',
  failed: '#EF4444',
  disputed: '#EF4444',
  returned: '#F97316',
  reversed: '#9CA3AF',
};

// =============================================================================
// IMMUTABLE RECEIPT
// =============================================================================

export interface BizReceipt {
  id: string;
  type: 'approval' | 'release' | 'decision' | 'signature' | 'transfer' | 'creation' | 'amendment' | 'compliance';
  action: string;
  actor: string;
  timestamp: string;
  linkedEntity: string;
  linkedTab: BizOrgTab;
  linkedId?: string;
  immutable: true;
}

// =============================================================================
// TRAFFIC LIGHT
// =============================================================================

export type TrafficLight = 'green' | 'yellow' | 'red';

export const TRAFFIC_LIGHT_COLORS: Record<TrafficLight, string> = {
  green: '#22C55E',
  yellow: '#F59E0B',
  red: '#EF4444',
};

export function trafficLightLabel(value: TrafficLight): string {
  switch (value) {
    case 'green': return 'Green';
    case 'yellow': return 'Yellow';
    case 'red': return 'Red';
  }
}

// =============================================================================
// ENTITY TYPES
// =============================================================================

export type BizEntityType =
  | 'internal'
  | 'holdco'
  | 'partner'
  | 'relationship'
  | 'asset'
  | 'deal_acquisition'
  | 'project';

export const BIZ_ENTITY_TYPE_LABELS: Record<BizEntityType, string> = {
  internal: 'Internal',
  holdco: 'HoldCo',
  partner: 'Partner',
  relationship: 'Relationship',
  asset: 'Asset',
  deal_acquisition: 'Deal / Acquisition',
  project: 'Project',
};

export const BIZ_ENTITY_TYPE_COLORS: Record<BizEntityType, string> = {
  internal: '#3B82F6',
  holdco: '#8B5CF6',
  partner: '#14B8A6',
  relationship: '#F59E0B',
  asset: '#EC4899',
  deal_acquisition: '#EF4444',
  project: '#6366F1',
};

// =============================================================================
// ENTITY HEALTH
// =============================================================================

export interface EntityHealth {
  governance: TrafficLight;
  finance: TrafficLight;
  rails: TrafficLight;
  compliance: TrafficLight;
}

export function worstHealth(health: EntityHealth): TrafficLight {
  const values = [health.governance, health.finance, health.rails, health.compliance];
  if (values.includes('red')) return 'red';
  if (values.includes('yellow')) return 'yellow';
  return 'green';
}

// =============================================================================
// CROSS-TAB LINK
// =============================================================================

export interface CrossTabLink {
  targetTab: BizOrgTab;
  targetSubTab?: string;
  targetId: string;
  label: string;
}

// =============================================================================
// SEEDED DEMO ENTITY IDS
// =============================================================================

export const KANEXT_HOLDCO = 'ent-kanext-holdco';
export const KANEXT_OPSCO = 'ent-kanext-opsco';
export const KANEXT_IP = 'ent-kanext-ip';
export const SPONSOR_BANK = 'ent-sponsor-bank';
export const PAYMENT_PROCESSOR = 'ent-payment-processor';
export const VALUETAINMENT = 'ent-valuetainment';
export const SLIEMA_WANDERERS = 'ent-sliema-wanderers';
export const TARGET_BANK = 'ent-target-bank';

export const SEEDED_ENTITY_NAMES: Record<string, string> = {
  [KANEXT_HOLDCO]: 'KaNeXT HoldCo',
  [KANEXT_OPSCO]: 'KaNeXT OpsCo',
  [KANEXT_IP]: 'KaNeXT IP / Products',
  [SPONSOR_BANK]: 'Sponsor Bank',
  [PAYMENT_PROCESSOR]: 'Payment Processor',
  [VALUETAINMENT]: 'Valuetainment',
  [SLIEMA_WANDERERS]: 'Sliema Wanderers FC',
  [TARGET_BANK]: 'Target Bank (Acquisition)',
};

export const SEEDED_ENTITY_TYPES: Record<string, BizEntityType> = {
  [KANEXT_HOLDCO]: 'holdco',
  [KANEXT_OPSCO]: 'internal',
  [KANEXT_IP]: 'asset',
  [SPONSOR_BANK]: 'partner',
  [PAYMENT_PROCESSOR]: 'partner',
  [VALUETAINMENT]: 'relationship',
  [SLIEMA_WANDERERS]: 'relationship',
  [TARGET_BANK]: 'deal_acquisition',
};

// =============================================================================
// HELPERS
// =============================================================================

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

export function formatDate(date: string): string {
  return date;
}

export function triageSortHealth(a: EntityHealth, b: EntityHealth): number {
  const score = (h: EntityHealth) => {
    let s = 0;
    const vals = [h.governance, h.finance, h.rails, h.compliance];
    for (const v of vals) {
      if (v === 'red') s += 3;
      else if (v === 'yellow') s += 1;
    }
    return s;
  };
  return score(b) - score(a); // worst first
}
