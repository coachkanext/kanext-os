/**
 * Commerce Data — Tickets, Store, Support
 *
 * Shared types, mock catalog, and transaction helpers for the
 * commerce bottom sheets on the Sports Dashboard.
 */

// =============================================================================
// SEAT TIERS (Tickets)
// =============================================================================

export interface SeatTier {
  id: string;
  label: string;
  price: number;
}

export const SEAT_TIERS: SeatTier[] = [
  { id: 'general', label: 'General', price: 10 },
  { id: 'reserved', label: 'Reserved', price: 25 },
  { id: 'courtside', label: 'Courtside', price: 50 },
];

// =============================================================================
// STORE PRODUCTS
// =============================================================================

export interface StoreProduct {
  id: string;
  name: string;
  price: number;
  sizes: string[] | null;
}

export const STORE_PRODUCTS: StoreProduct[] = [
  { id: 'jersey', name: 'Jersey', price: 89.99, sizes: ['S', 'M', 'L', 'XL'] },
  { id: 'hat', name: 'Hat', price: 34.99, sizes: null },
  { id: 'hoodie', name: 'Hoodie', price: 64.99, sizes: ['S', 'M', 'L', 'XL'] },
  { id: 'shorts', name: 'Shorts', price: 44.99, sizes: ['S', 'M', 'L', 'XL'] },
];

// =============================================================================
// SUPPORT TIERS (Donations)
// =============================================================================

export interface SupportTier {
  id: string;
  label: string;
  amount: number;
  description: string;
}

export const SUPPORT_TIERS: SupportTier[] = [
  { id: 'bronze', label: 'Bronze', amount: 25, description: 'Game Day Supporter' },
  { id: 'silver', label: 'Silver', amount: 50, description: 'Season Backer' },
  { id: 'gold', label: 'Gold', amount: 100, description: 'Champion Circle' },
];

// =============================================================================
// PAYMENT CHAIN
// =============================================================================

export interface PaymentChainStep {
  stage: string;
  detail: string;
  timestamp: string;
}

export interface PaymentChain {
  transactionId: string;
  type: string;
  amount: number;
  description: string;
  status: 'Settled';
  chain: PaymentChainStep[];
}

/** Generate a transaction ID with the given prefix: TKT-2026-XXXX, MRC-2026-XXXX, DON-2026-XXXX */
export function generateTransactionId(prefix: string): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-2026-${num}`;
}

/** Build a full payment chain for a commerce transaction. */
export function buildCommerceChain(type: string, amount: number, description: string, prefix: string): PaymentChain {
  const transactionId = generateTransactionId(prefix);
  const now = new Date();
  const ts = (offsetMs: number) => {
    const d = new Date(now.getTime() + offsetMs);
    return d.toISOString().replace('T', ' ').slice(0, 19);
  };

  return {
    transactionId,
    type,
    amount,
    description,
    status: 'Settled',
    chain: [
      { stage: 'Event', detail: `${type} initiated — ${description}`, timestamp: ts(0) },
      { stage: 'Rules', detail: 'Payment rules validated (amount, limits, method)', timestamp: ts(200) },
      { stage: 'Auth', detail: 'Card authorized — ending •••• 4242', timestamp: ts(800) },
      { stage: 'Payment', detail: `$${amount.toFixed(2)} captured`, timestamp: ts(1200) },
      { stage: 'Settlement', detail: 'Funds settled to KaNeXT Athletics', timestamp: ts(1800) },
      { stage: 'Ledger', detail: `Ledger entry recorded — ${transactionId}`, timestamp: ts(2000) },
      { stage: 'Receipt', detail: 'Digital receipt generated', timestamp: ts(2200) },
    ],
  };
}

// =============================================================================
// CART ITEM (Store)
// =============================================================================

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  size: string;
  qty: number;
}
