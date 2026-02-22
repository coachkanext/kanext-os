/**
 * Competition Commerce Data — PBD Podcast Series
 * Tickets (seat tiers), Store (3SSB gear), Courtside (VIP hospitality)
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
  { id: 'courtside-club', label: 'Courtside Club', price: 1200 },
];

// =============================================================================
// STORE PRODUCTS (Basketball Gear)
// =============================================================================

export interface CompStoreProduct {
  id: string;
  name: string;
  price: number;
}

export const COMP_STORE_PRODUCTS: CompStoreProduct[] = [
  { id: 'team-cap', name: 'Team Cap', price: 49.99 },
  { id: 'game-suit', name: 'Game Suit Replica', price: 249.99 },
  { id: 'pit-jacket', name: 'Pit Crew Jacket', price: 189.99 },
  { id: 'visor', name: 'Visor', price: 34.99 },
];

// =============================================================================
// PADDOCK TIERS (VIP Hospitality)
// =============================================================================

export interface CourtsideTier {
  id: string;
  label: string;
  perGamePrice: number;
  seasonPrice: number;
  description: string;
}

export const PADDOCK_TIERS: CourtsideTier[] = [
  { id: 'grid-walk', label: 'Grid Walk', perGamePrice: 500, seasonPrice: 4000, description: 'Pre-game grid access + courtside entry' },
  { id: 'courtside-club', label: 'Courtside Club', perGamePrice: 1500, seasonPrice: 12000, description: 'Premium hospitality lounge + pit lane viewing' },
  { id: 'owners-suite', label: "Owner's Suite", perGamePrice: 5000, seasonPrice: 40000, description: 'Private suite + team radio + post-game meet & greet' },
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
  // Patch settlement destination for PBD Podcast
  const settlement = chain.chain.find((s) => s.stage === 'Settlement');
  if (settlement) {
    settlement.detail = `Funds settled to PBD Podcast Series`;
  }
  return chain;
}
