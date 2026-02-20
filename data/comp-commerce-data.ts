/**
 * Competition Commerce Data — K-1 Racing Series
 * Tickets (seat tiers), Store (racing gear), Paddock (VIP hospitality)
 */

import { buildCommerceChain, type PaymentChain } from './commerce-data';

// =============================================================================
// SEAT TIERS (Tickets)
// =============================================================================

export interface CompSeatTier {
  id: string;
  label: string;
  price: number;
}

export const COMP_SEAT_TIERS: CompSeatTier[] = [
  { id: 'ga', label: 'General Admission', price: 75 },
  { id: 'grandstand', label: 'Grandstand', price: 200 },
  { id: 'pit-straight', label: 'Pit Straight', price: 450 },
  { id: 'paddock-club', label: 'Paddock Club', price: 1200 },
];

// =============================================================================
// STORE PRODUCTS (Racing Gear)
// =============================================================================

export interface CompStoreProduct {
  id: string;
  name: string;
  price: number;
}

export const COMP_STORE_PRODUCTS: CompStoreProduct[] = [
  { id: 'team-cap', name: 'Team Cap', price: 49.99 },
  { id: 'race-suit', name: 'Race Suit Replica', price: 249.99 },
  { id: 'pit-jacket', name: 'Pit Crew Jacket', price: 189.99 },
  { id: 'visor', name: 'Visor', price: 34.99 },
];

// =============================================================================
// PADDOCK TIERS (VIP Hospitality)
// =============================================================================

export interface PaddockTier {
  id: string;
  label: string;
  perRacePrice: number;
  seasonPrice: number;
  description: string;
}

export const PADDOCK_TIERS: PaddockTier[] = [
  { id: 'grid-walk', label: 'Grid Walk', perRacePrice: 500, seasonPrice: 4000, description: 'Pre-race grid access + paddock entry' },
  { id: 'paddock-club', label: 'Paddock Club', perRacePrice: 1500, seasonPrice: 12000, description: 'Premium hospitality lounge + pit lane viewing' },
  { id: 'owners-suite', label: "Owner's Suite", perRacePrice: 5000, seasonPrice: 40000, description: 'Private suite + team radio + post-race meet & greet' },
];

// =============================================================================
// COMMERCE CHAIN HELPER
// =============================================================================

export function buildCompCommerceChain(
  type: string,
  amount: number,
  description: string,
  prefix: string,
): PaymentChain {
  const chain = buildCommerceChain(type, amount, description, prefix);
  // Patch settlement destination for K-1 Racing
  const settlement = chain.chain.find((s) => s.stage === 'Settlement');
  if (settlement) {
    settlement.detail = `Funds settled to K-1 Racing Series`;
  }
  return chain;
}
