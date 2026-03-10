/**
 * Mock data for Store / Give screen.
 * Store (sports/business/education): products, orders, drops.
 * Give (church): designations, giving history, campaigns.
 * Mode-aware category pills. Governed commerce underneath.
 */

import type { Mode } from '@/types';

// ── Helpers ──

const img = (id: string, w = 600, h = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&q=80`;

// ── Shared types ──

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  imageUri: string;
  type: 'merch' | 'ticket' | 'concession' | 'pass' | 'product' | 'subscription' | 'hardware' | 'bookstore' | 'gear' | 'meal_plan' | 'parking';
  subtitle?: string;
  actionLabel: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  status: 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  dateOrdered: string;
  amount: number;
  trackingUrl?: string;
}

export interface DropItem {
  id: string;
  name: string;
  imageUri: string;
  type: 'coming_soon' | 'live_now' | 'exclusive' | 'sale';
  releaseDate?: string;
  price?: number;
  originalPrice?: number;
  stockLeft?: number;
  countdown?: string;
  actionLabel: string;
}

export interface GivingDesignation {
  id: string;
  name: string;
  description: string;
}

export interface GivingTransaction {
  id: string;
  designation: string;
  amount: number;
  date: string;
  frequency: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly';
  paymentMethod: string;
}

export interface GivingCampaign {
  id: string;
  name: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  deadline?: string;
  donorCount: number;
  status: 'active' | 'upcoming' | 'completed';
}

export interface CampaignHero {
  title: string;
  subtitle: string;
  raisedAmount: number;
  goalAmount: number;
}

// ── Category pills per mode ──

export const STORE_CATEGORIES: Record<string, { key: string; label: string }[]> = {
  sports: [
    { key: 'all', label: 'All' },
    { key: 'merch', label: 'Merch' },
    { key: 'ticket', label: 'Tickets' },
    { key: 'concession', label: 'Concessions' },
    { key: 'pass', label: 'Passes' },
  ],
  business: [
    { key: 'all', label: 'All' },
    { key: 'product', label: 'Products' },
    { key: 'subscription', label: 'Subscriptions' },
    { key: 'hardware', label: 'Hardware' },
  ],
  education: [
    { key: 'all', label: 'All' },
    { key: 'bookstore', label: 'Bookstore' },
    { key: 'gear', label: 'Gear' },
    { key: 'meal_plan', label: 'Meal Plans' },
    { key: 'parking', label: 'Parking' },
  ],
};

export const GIVE_CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'tithe', label: 'Tithe' },
  { key: 'offering', label: 'Offering' },
  { key: 'missions', label: 'Missions' },
  { key: 'building_fund', label: 'Building Fund' },
] as const;

export const ORDER_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
] as const;

export const DROP_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'coming_soon', label: 'Coming Soon' },
  { key: 'live_now', label: 'Live Now' },
  { key: 'exclusive', label: 'Exclusive' },
  { key: 'sale', label: 'Sale' },
] as const;

export const HISTORY_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'tithe', label: 'Tithe' },
  { key: 'offering', label: 'Offering' },
  { key: 'missions', label: 'Missions' },
  { key: 'building_fund', label: 'Building Fund' },
] as const;

export const CAMPAIGN_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// STORE DATA — SPORTS
// ═══════════════════════════════════════════════════════════════════════════

const SPORTS_PRODUCTS: ProductItem[] = [
  { id: 'sp1', name: 'Home Jersey — #23', price: 89.99, imageUri: img('photo-1580087256394-dc596e1c8f4f'), type: 'merch', actionLabel: 'Add to Cart' },
  { id: 'sp2', name: 'Away Jersey — #11', price: 89.99, imageUri: img('photo-1574629810360-7efbbe195018'), type: 'merch', actionLabel: 'Add to Cart' },
  { id: 'sp3', name: 'Team Hoodie', price: 64.99, imageUri: img('photo-1556821840-3a63f95609a7'), type: 'merch', actionLabel: 'Add to Cart' },
  { id: 'sp4', name: 'Rivalry Week Tee', price: 29.99, imageUri: img('photo-1521572163474-6864f9cf17ab'), type: 'merch', actionLabel: 'Add to Cart' },
  { id: 'sp5', name: 'vs. Eastside — Mar 14', price: 15.00, imageUri: img('photo-1546519638-68e109498ffc'), type: 'ticket', subtitle: 'Fri 7:00 PM · Main Arena', actionLabel: 'Buy' },
  { id: 'sp6', name: 'vs. Valley Prep — Mar 21', price: 15.00, imageUri: img('photo-1504450758481-7338eba7524a'), type: 'ticket', subtitle: 'Fri 7:00 PM · Main Arena', actionLabel: 'Buy' },
  { id: 'sp7', name: 'Nachos & Cheese', price: 6.50, imageUri: img('photo-1513456852971-30c0b8199d4d'), type: 'concession', actionLabel: 'Pre-order' },
  { id: 'sp8', name: 'Hot Dog Combo', price: 8.00, imageUri: img('photo-1496116218417-1a781b1c416c'), type: 'concession', actionLabel: 'Pre-order' },
  { id: 'sp9', name: 'Season Pass — All Sports', price: 149.99, imageUri: img('photo-1461896836934-bd45ba8a0dce'), type: 'pass', subtitle: '24 home games included', actionLabel: 'Buy' },
  { id: 'sp10', name: 'Basketball Season Pass', price: 79.99, imageUri: img('photo-1519861531473-9200262188bf'), type: 'pass', subtitle: '14 home games', actionLabel: 'Buy' },
];

const SPORTS_FEATURED = {
  title: 'Rivalry Week Collection',
  subtitle: 'Limited edition gear — available until March 15',
  imageUri: img('photo-1580087256394-dc596e1c8f4f', 800, 400),
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE DATA — BUSINESS
// ═══════════════════════════════════════════════════════════════════════════

const BUSINESS_PRODUCTS: ProductItem[] = [
  { id: 'bp1', name: 'Pro Camera System', price: 2499.00, imageUri: img('photo-1516035069371-29a1b244cc32'), type: 'product', actionLabel: 'Add to Cart' },
  { id: 'bp2', name: 'Wireless Mic Kit', price: 349.00, imageUri: img('photo-1558618666-fcd25c85f82e'), type: 'hardware', actionLabel: 'Add to Cart' },
  { id: 'bp3', name: 'Branded Polo', price: 44.99, imageUri: img('photo-1560472355-536de3962603'), type: 'product', actionLabel: 'Add to Cart' },
  { id: 'bp4', name: 'Team Backpack', price: 79.99, imageUri: img('photo-1553062407-98eeb64c6a62'), type: 'product', actionLabel: 'Add to Cart' },
  { id: 'bp5', name: 'Essentials Plan', price: 29.99, imageUri: img('photo-1497366216548-37526070297c'), type: 'subscription', subtitle: 'Monthly · Core features', actionLabel: 'Subscribe' },
  { id: 'bp6', name: 'Pro Plan', price: 79.99, imageUri: img('photo-1497215842964-222b430dc094'), type: 'subscription', subtitle: 'Monthly · All features + analytics', actionLabel: 'Subscribe' },
  { id: 'bp7', name: 'Streaming Hub', price: 899.00, imageUri: img('photo-1518770660439-4636190af475'), type: 'hardware', actionLabel: 'Add to Cart' },
  { id: 'bp8', name: 'Desk Lamp Pro', price: 129.00, imageUri: img('photo-1507003211169-0a1dd7228f2d'), type: 'hardware', actionLabel: 'Add to Cart' },
];

const BUSINESS_FEATURED = {
  title: 'Spring Product Launch',
  subtitle: 'New hardware arrivals — order now for early access',
  imageUri: img('photo-1516035069371-29a1b244cc32', 800, 400),
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE DATA — EDUCATION
// ═══════════════════════════════════════════════════════════════════════════

const EDUCATION_PRODUCTS: ProductItem[] = [
  { id: 'ep1', name: 'Intro to CS Textbook', price: 89.99, imageUri: img('photo-1497633762265-9d179a990aa6'), type: 'bookstore', actionLabel: 'Add to Cart' },
  { id: 'ep2', name: 'Lab Manual — Chemistry', price: 45.00, imageUri: img('photo-1532094349884-543bc11b234d'), type: 'bookstore', actionLabel: 'Add to Cart' },
  { id: 'ep3', name: 'Campus Hoodie', price: 54.99, imageUri: img('photo-1556821840-3a63f95609a7'), type: 'gear', actionLabel: 'Add to Cart' },
  { id: 'ep4', name: 'Varsity Cap', price: 24.99, imageUri: img('photo-1588850561407-ed78c334e67a'), type: 'gear', actionLabel: 'Add to Cart' },
  { id: 'ep5', name: 'Alumni Crewneck', price: 49.99, imageUri: img('photo-1523050854058-8df90110c9f1'), type: 'gear', actionLabel: 'Add to Cart' },
  { id: 'ep6', name: 'Unlimited Meal Plan', price: 2199.00, imageUri: img('photo-1567521464027-f127ff144326'), type: 'meal_plan', subtitle: 'Full semester · All dining halls', actionLabel: 'Buy' },
  { id: 'ep7', name: 'Block 150 Plan', price: 1599.00, imageUri: img('photo-1504674900247-0877df9cc836'), type: 'meal_plan', subtitle: '150 swipes + $200 dining dollars', actionLabel: 'Buy' },
  { id: 'ep8', name: 'Commuter Parking — Semester', price: 350.00, imageUri: img('photo-1506521781263-d8422e82f27a'), type: 'parking', subtitle: 'Lot C · Semester pass', actionLabel: 'Buy' },
];

const EDUCATION_FEATURED = {
  title: 'Back-to-School Essentials',
  subtitle: 'Textbooks, gear, and meal plans for Spring semester',
  imageUri: img('photo-1541339907198-e08756dedf3f', 800, 400),
};

// ═══════════════════════════════════════════════════════════════════════════
// ORDER DATA — universal
// ═══════════════════════════════════════════════════════════════════════════

const ORDERS: OrderItem[] = [
  { id: 'ord1', productName: 'Home Jersey — #23', productImage: img('photo-1580087256394-dc596e1c8f4f'), status: 'shipped', dateOrdered: 'Mar 5, 2026', amount: 89.99, trackingUrl: 'https://tracking.example.com/123' },
  { id: 'ord2', productName: 'Team Hoodie', productImage: img('photo-1556821840-3a63f95609a7'), status: 'processing', dateOrdered: 'Mar 8, 2026', amount: 64.99 },
  { id: 'ord3', productName: 'vs. Eastside — Mar 14', productImage: img('photo-1546519638-68e109498ffc'), status: 'delivered', dateOrdered: 'Feb 28, 2026', amount: 15.00 },
  { id: 'ord4', productName: 'Nachos & Cheese', productImage: img('photo-1513456852971-30c0b8199d4d'), status: 'delivered', dateOrdered: 'Feb 20, 2026', amount: 6.50 },
  { id: 'ord5', productName: 'Rivalry Week Tee', productImage: img('photo-1521572163474-6864f9cf17ab'), status: 'out_for_delivery', dateOrdered: 'Mar 7, 2026', amount: 29.99 },
  { id: 'ord6', productName: 'Season Pass — All Sports', productImage: img('photo-1461896836934-bd45ba8a0dce'), status: 'delivered', dateOrdered: 'Jan 15, 2026', amount: 149.99 },
  { id: 'ord7', productName: 'Away Jersey — #11', productImage: img('photo-1574629810360-7efbbe195018'), status: 'cancelled', dateOrdered: 'Mar 1, 2026', amount: 89.99 },
];

// ═══════════════════════════════════════════════════════════════════════════
// DROPS DATA — universal
// ═══════════════════════════════════════════════════════════════════════════

const DROPS: DropItem[] = [
  { id: 'dr1', name: 'Playoff Hype Jersey', imageUri: img('photo-1580087256394-dc596e1c8f4f'), type: 'coming_soon', releaseDate: 'Mar 18, 2026', countdown: '8d 4h', actionLabel: 'Notify Me' },
  { id: 'dr2', name: 'Championship Ring Replica', imageUri: img('photo-1573408301185-9146fe634ad0'), type: 'coming_soon', releaseDate: 'Apr 1, 2026', countdown: '22d', actionLabel: 'Notify Me' },
  { id: 'dr3', name: 'Game Day Snapback', imageUri: img('photo-1588850561407-ed78c334e67a'), type: 'live_now', price: 34.99, stockLeft: 12, actionLabel: 'Buy Now' },
  { id: 'dr4', name: 'Limited Edition Warm-Up', imageUri: img('photo-1556821840-3a63f95609a7'), type: 'live_now', price: 74.99, stockLeft: 5, countdown: '2h 15m left', actionLabel: 'Buy Now' },
  { id: 'dr5', name: 'Booster Club Polo', imageUri: img('photo-1560472355-536de3962603'), type: 'exclusive', price: 59.99, actionLabel: 'Buy Now' },
  { id: 'dr6', name: 'Player-Exclusive Training Tee', imageUri: img('photo-1521572163474-6864f9cf17ab'), type: 'exclusive', price: 44.99, actionLabel: 'Buy Now' },
  { id: 'dr7', name: 'End of Season Clearance Bundle', imageUri: img('photo-1574629810360-7efbbe195018'), type: 'sale', price: 39.99, originalPrice: 79.99, actionLabel: 'Buy Now' },
  { id: 'dr8', name: 'Last Season Hoodie', imageUri: img('photo-1553062407-98eeb64c6a62'), type: 'sale', price: 29.99, originalPrice: 64.99, actionLabel: 'Buy Now' },
];

// ═══════════════════════════════════════════════════════════════════════════
// GIVE DATA — church mode
// ═══════════════════════════════════════════════════════════════════════════

const GIVING_HERO: CampaignHero = {
  title: 'Building Fund',
  subtitle: 'New Sanctuary Construction',
  raisedAmount: 45000,
  goalAmount: 100000,
};

const GIVING_DESIGNATIONS: GivingDesignation[] = [
  { id: 'gd1', name: 'Tithe', description: 'General fund — supports church operations' },
  { id: 'gd2', name: 'General Offering', description: 'Additional giving above tithe' },
  { id: 'gd3', name: 'Missions Fund', description: 'Supports domestic and international missions' },
  { id: 'gd4', name: 'Building Fund', description: 'New sanctuary construction project' },
  { id: 'gd5', name: 'Youth Ministry', description: 'Programs, camps, and resources for youth' },
  { id: 'gd6', name: 'Benevolence', description: 'Assistance for families in need' },
];

const GIVING_HISTORY: GivingTransaction[] = [
  { id: 'gt1', designation: 'Tithe', amount: 500, date: 'Mar 9, 2026', frequency: 'monthly', paymentMethod: 'KayPay' },
  { id: 'gt2', designation: 'Building Fund', amount: 200, date: 'Mar 9, 2026', frequency: 'one-time', paymentMethod: 'Visa ••4242' },
  { id: 'gt3', designation: 'Tithe', amount: 500, date: 'Feb 9, 2026', frequency: 'monthly', paymentMethod: 'KayPay' },
  { id: 'gt4', designation: 'Missions Fund', amount: 100, date: 'Feb 2, 2026', frequency: 'one-time', paymentMethod: 'KayPay' },
  { id: 'gt5', designation: 'Tithe', amount: 500, date: 'Jan 9, 2026', frequency: 'monthly', paymentMethod: 'KayPay' },
  { id: 'gt6', designation: 'General Offering', amount: 250, date: 'Jan 5, 2026', frequency: 'one-time', paymentMethod: 'Visa ••4242' },
  { id: 'gt7', designation: 'Youth Ministry', amount: 150, date: 'Dec 20, 2025', frequency: 'one-time', paymentMethod: 'KayPay' },
  { id: 'gt8', designation: 'Tithe', amount: 500, date: 'Dec 9, 2025', frequency: 'monthly', paymentMethod: 'KayPay' },
  { id: 'gt9', designation: 'Benevolence', amount: 75, date: 'Dec 1, 2025', frequency: 'one-time', paymentMethod: 'KayPay' },
  { id: 'gt10', designation: 'Tithe', amount: 500, date: 'Nov 9, 2025', frequency: 'monthly', paymentMethod: 'KayPay' },
];

const GIVING_CAMPAIGNS: GivingCampaign[] = [
  { id: 'gc1', name: 'New Sanctuary Building Fund', description: 'Breaking ground on our new 2,000-seat sanctuary. Every gift brings us closer.', goalAmount: 100000, raisedAmount: 45000, deadline: 'Dec 31, 2026', donorCount: 234, status: 'active' },
  { id: 'gc2', name: 'Haiti Missions Trip', description: 'Sending 12 volunteers to build homes and serve communities in Port-au-Prince.', goalAmount: 25000, raisedAmount: 18500, deadline: 'Jun 1, 2026', donorCount: 89, status: 'active' },
  { id: 'gc3', name: 'Easter Offering', description: 'Special Easter weekend offering for community outreach and local families in need.', goalAmount: 15000, raisedAmount: 3200, deadline: 'Apr 20, 2026', donorCount: 45, status: 'active' },
  { id: 'gc4', name: 'Youth Center Renovation', description: 'Renovating the youth center with new AV equipment, furniture, and activity spaces.', goalAmount: 50000, raisedAmount: 0, deadline: 'Sep 1, 2026', donorCount: 0, status: 'upcoming' },
  { id: 'gc5', name: 'Christmas Benevolence 2025', description: 'Provided gifts, meals, and assistance to 150 families during the holiday season.', goalAmount: 20000, raisedAmount: 22450, donorCount: 178, status: 'completed' },
];

// ═══════════════════════════════════════════════════════════════════════════
// GIVING SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

export interface GivingSummary {
  totalThisYear: number;
  breakdown: { designation: string; amount: number }[];
}

const GIVING_SUMMARY: GivingSummary = {
  totalThisYear: 2050,
  breakdown: [
    { designation: 'Tithe', amount: 1500 },
    { designation: 'Building Fund', amount: 200 },
    { designation: 'Missions Fund', amount: 100 },
    { designation: 'General Offering', amount: 250 },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// GETTERS
// ═══════════════════════════════════════════════════════════════════════════

const PRODUCTS_BY_MODE: Record<string, ProductItem[]> = {
  sports: SPORTS_PRODUCTS,
  business: BUSINESS_PRODUCTS,
  education: EDUCATION_PRODUCTS,
};

const FEATURED_BY_MODE: Record<string, typeof SPORTS_FEATURED> = {
  sports: SPORTS_FEATURED,
  business: BUSINESS_FEATURED,
  education: EDUCATION_FEATURED,
};

export function getProducts(mode?: Mode): ProductItem[] {
  return PRODUCTS_BY_MODE[mode ?? 'sports'] ?? SPORTS_PRODUCTS;
}

export function getFeaturedBanner(mode?: Mode) {
  return FEATURED_BY_MODE[mode ?? 'sports'] ?? SPORTS_FEATURED;
}

export function getOrders(filter?: string): OrderItem[] {
  if (!filter || filter === 'all') return ORDERS;
  if (filter === 'active') return ORDERS.filter((o) => ['processing', 'shipped', 'out_for_delivery'].includes(o.status));
  if (filter === 'delivered') return ORDERS.filter((o) => o.status === 'delivered');
  if (filter === 'cancelled') return ORDERS.filter((o) => o.status === 'cancelled');
  return ORDERS;
}

export function getDrops(filter?: string): DropItem[] {
  if (!filter || filter === 'all') return DROPS;
  return DROPS.filter((d) => d.type === filter);
}

export function getGivingHero(): CampaignHero {
  return GIVING_HERO;
}

export function getGivingDesignations(): GivingDesignation[] {
  return GIVING_DESIGNATIONS;
}

export function getGivingHistory(filter?: string): GivingTransaction[] {
  if (!filter || filter === 'all') return GIVING_HISTORY;
  const designationMap: Record<string, string> = {
    tithe: 'Tithe',
    offering: 'General Offering',
    missions: 'Missions Fund',
    building_fund: 'Building Fund',
  };
  const name = designationMap[filter];
  return name ? GIVING_HISTORY.filter((t) => t.designation === name) : GIVING_HISTORY;
}

export function getGivingSummary(): GivingSummary {
  return GIVING_SUMMARY;
}

export function getGivingCampaigns(filter?: string): GivingCampaign[] {
  if (!filter || filter === 'all') return GIVING_CAMPAIGNS;
  return GIVING_CAMPAIGNS.filter((c) => c.status === filter);
}

export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function formatCompactAmount(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  return `$${amount.toLocaleString()}`;
}
