/**
 * Church Commerce Data — Giving categories, amounts, recurring options, EIN
 */

import { buildCommerceChain, type PaymentChain } from './commerce-data';

// =============================================================================
// GIVING CATEGORIES
// =============================================================================

export interface GivingCategory {
  id: string;
  label: string;
  description: string;
}

export const GIVING_CATEGORIES: GivingCategory[] = [
  { id: 'offering', label: 'Offering', description: 'General Sunday offering' },
  { id: 'tithe', label: 'Tithe', description: 'Faithful tithe — 10% of income' },
  { id: 'building_fund', label: 'Building Fund', description: 'Building Fund 2026 campaign' },
  { id: 'missions', label: 'Missions', description: 'Global missions & evangelism' },
  { id: 'benevolence', label: 'Benevolence', description: 'Help for members in need' },
  { id: 'other', label: 'Other', description: 'Special designation' },
];

// =============================================================================
// PRESET AMOUNTS
// =============================================================================

export const GIVING_AMOUNTS = [25, 50, 100, 250, 500] as const;

// =============================================================================
// RECURRING OPTIONS
// =============================================================================

export interface RecurringOption {
  id: string;
  label: string;
}

export const RECURRING_OPTIONS: RecurringOption[] = [
  { id: 'one_time', label: 'One-Time' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'bi_weekly', label: 'Bi-Weekly' },
  { id: 'monthly', label: 'Monthly' },
];

// =============================================================================
// CHURCH EIN
// =============================================================================

export const CHURCH_EIN = '95-1234567';

// =============================================================================
// COMMERCE CHAIN BUILDER
// =============================================================================

export function buildChurchCommerceChain(
  type: string,
  amount: number,
  description: string,
  prefix: string,
): PaymentChain {
  const chain = buildCommerceChain(type, amount, description, prefix);
  const settlement = chain.chain.find((s) => s.stage === 'Settlement');
  if (settlement) settlement.detail = 'Funds settled to 2819 Church Finance';
  return chain;
}
