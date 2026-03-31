/**
 * Mock data for Personal Earn — creator revenue command center.
 * Aggregates: subscriptions, tips, digital sales, brand deals, content.
 */

export type RevenueSource  = 'Subscriptions' | 'Tips' | 'Sales' | 'Deals' | 'Content';
export type ProductType    = 'Digital' | 'Course' | 'Service' | 'Physical' | 'Exclusive' | 'Merch' | 'Tips';
export type PayoutStatus   = 'Completed' | 'Pending' | 'Failed';
export type PayoutMethod   = 'Bank' | 'KayPay';
export type PayoutSchedule = 'Instant' | 'Daily' | 'Weekly' | 'Monthly';
export type ChartPeriod    = 'Daily' | 'Weekly' | 'Monthly';

export interface EarnStats {
  balance:          number; // available to withdraw
  thisMonth:        number;
  lastMonth:        number;
  growthPct:        number;
  lifetimeEarnings: number;
  subscriberCount:  number;
  pendingBalance:   number;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface SourceBreakdown {
  source: RevenueSource;
  amount: number;
  pct:    number;
  icon:   string; // SF Symbol name
}

export interface Transaction {
  id:          string;
  source:      RevenueSource;
  description: string;
  amount:      number;
  date:        Date;
  icon:        string; // SF Symbol name
}

export interface Product {
  id:          string;
  title:       string;
  type:        ProductType;
  price:       number;
  recurring:   boolean;
  salesCount:  number;
  revenue:     number;
  description: string;
  thumbEmoji:  string;
  thumbHue:    number;
  active:      boolean;
  salesLastMonth: number;   // for trend comparison
  salesTrend:     number[]; // 6-point weekly sparkline (oldest -> newest)
}

export interface ProductSale {
  buyerName:  string;
  buyerInitials: string;
  hue:        number;
  amount:     number;
  date:       Date;
}

export interface Payout {
  id:                  string;
  amount:              number;
  destination:         'KayPay' | 'Bank';
  bankName?:           string; // e.g. "Chase ···4821"
  date:                Date;
  status:              PayoutStatus | 'Instant';
  capitalPointsEarned?: number; // only for KayPay transfers
}

export interface FeeRow {
  type:          string;
  kanextFee:     string;
  processingFee: string;
  netPct:        string;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export const EARN_STATS: EarnStats = {
  balance:          4280,
  thisMonth:        2150,
  lastMonth:        1800,
  growthPct:        19,
  lifetimeEarnings: 22400,
  subscriberCount:  60,
  pendingBalance:   340,
};

// ── Charts ────────────────────────────────────────────────────────────────────

export const CHART_MONTHLY: ChartPoint[] = [
  { label: 'Oct', value: 1200 },
  { label: 'Nov', value: 980  },
  { label: 'Dec', value: 3100 },
  { label: 'Jan', value: 1650 },
  { label: 'Feb', value: 1800 },
  { label: 'Mar', value: 2150 },
];

export const CHART_WEEKLY: ChartPoint[] = [
  { label: 'W1',  value: 310  },
  { label: 'W2',  value: 480  },
  { label: 'W3',  value: 620  },
  { label: 'W4',  value: 740  },
];

export const CHART_DAILY: ChartPoint[] = [
  { label: 'Mon', value: 80  },
  { label: 'Tue', value: 210 },
  { label: 'Wed', value: 45  },
  { label: 'Thu', value: 320 },
  { label: 'Fri', value: 190 },
  { label: 'Sat', value: 560 },
  { label: 'Sun', value: 745 },
];

export const CHART_BY_PERIOD: Record<ChartPeriod, ChartPoint[]> = {
  Daily:   CHART_DAILY,
  Weekly:  CHART_WEEKLY,
  Monthly: CHART_MONTHLY,
};

// ── Revenue breakdown ──────────────────────────────────────────────────────────

export const SOURCE_BREAKDOWN: SourceBreakdown[] = [
  { source: 'Subscriptions', amount: 900,  pct: 42, icon: 'person.2.fill'          },
  { source: 'Sales',         amount: 560,  pct: 26, icon: 'bag.fill'               },
  { source: 'Tips',          amount: 320,  pct: 15, icon: 'heart.fill'             },
  { source: 'Deals',         amount: 250,  pct: 12, icon: 'handshake.fill'         },
  { source: 'Content',       amount: 120,  pct: 6,  icon: 'play.rectangle.fill'    },
];

// ── Transactions ──────────────────────────────────────────────────────────────

export const TRANSACTIONS: Transaction[] = [
  { id: 'tx1',  source: 'Subscriptions', description: 'Inner Circle upgrade — @james_okonkwo',  amount: 25,   date: new Date(Date.now() - 1  * 3600000),   icon: 'person.2.fill'       },
  { id: 'tx2',  source: 'Tips',          description: 'Tip on "Morning Routine" reel',           amount: 10,   date: new Date(Date.now() - 3  * 3600000),   icon: 'heart.fill'          },
  { id: 'tx3',  source: 'Sales',         description: 'KaNeXT Playbook — @alicia_m',             amount: 29,   date: new Date(Date.now() - 6  * 3600000),   icon: 'bag.fill'            },
  { id: 'tx4',  source: 'Sales',         description: 'Creator Starter Kit — @dev_tunde',        amount: 15,   date: new Date(Date.now() - 10 * 3600000),   icon: 'bag.fill'            },
  { id: 'tx5',  source: 'Subscriptions', description: 'Supporter renewal — @maya_p',             amount: 10,   date: new Date(Date.now() - 18 * 3600000),   icon: 'person.2.fill'       },
  { id: 'tx6',  source: 'Tips',          description: 'Tip on "Shipping KaNeXT" post',            amount: 5,    date: new Date(Date.now() - 26 * 3600000),   icon: 'heart.fill'          },
  { id: 'tx7',  source: 'Content',       description: 'KayTV pay-per-view: "Build in Public"',   amount: 4,    date: new Date(Date.now() - 2  * 86400000),  icon: 'play.rectangle.fill' },
  { id: 'tx8',  source: 'Deals',         description: 'KaNeXT Speaking Engagement — partial',    amount: 2500, date: new Date(Date.now() - 3  * 86400000),  icon: 'handshake.fill'      },
  { id: 'tx9',  source: 'Sales',         description: 'Creator Starter Kit — @kemi_ade',          amount: 15,   date: new Date(Date.now() - 3  * 86400000),  icon: 'bag.fill'            },
  { id: 'tx10', source: 'Subscriptions', description: 'New Supporter — @chris_b',                amount: 10,   date: new Date(Date.now() - 4  * 86400000),  icon: 'person.2.fill'       },
  { id: 'tx11', source: 'Tips',          description: 'Tip on "Lisbon Vlog" video',               amount: 1,    date: new Date(Date.now() - 4  * 86400000),  icon: 'heart.fill'          },
  { id: 'tx12', source: 'Sales',         description: '1-on-1 Coaching session — @faith_k',       amount: 200,  date: new Date(Date.now() - 5  * 86400000),  icon: 'bag.fill'            },
  { id: 'tx13', source: 'Subscriptions', description: 'New Inner Circle — @sarah_lee',            amount: 25,   date: new Date(Date.now() - 5  * 86400000),  icon: 'person.2.fill'       },
  { id: 'tx14', source: 'Content',       description: 'KayStudios "Creator Course" sale',         amount: 49,   date: new Date(Date.now() - 6  * 86400000),  icon: 'play.rectangle.fill' },
  { id: 'tx15', source: 'Tips',          description: 'Tip on "5AM Gym Routine" reel',            amount: 5,    date: new Date(Date.now() - 7  * 86400000),  icon: 'heart.fill'          },
];

// ── Products ────────────────────────────────────────────────────────────────────

export const PRODUCTS: Product[] = [
  {
    id: 'pr1',
    title: 'KaNeXT Playbook',
    type: 'Digital',
    price: 29,
    recurring: false,
    salesCount: 47,
    revenue: 1363,
    description: 'The complete framework I use to build and market KaNeXT OS. 80-page PDF covering product strategy, audience building, and monetization.',
    thumbEmoji: '📘',
    thumbHue: 210,
    active: true,
    salesLastMonth: 10,
    salesTrend: [5, 9, 12, 7, 10, 8],
  },
  {
    id: 'pr2',
    title: 'Creator Starter Kit',
    type: 'Digital',
    price: 15,
    recurring: false,
    salesCount: 83,
    revenue: 1245,
    description: 'Templates, checklists, and workflows for new creators. Notion dashboard, content calendar, first 90 days plan.',
    thumbEmoji: '🎒',
    thumbHue: 30,
    active: true,
    salesLastMonth: 18,
    salesTrend: [18, 20, 15, 22, 19, 14],
  },
  {
    id: 'pr3',
    title: '1-on-1 Coaching',
    type: 'Course',
    price: 200,
    recurring: false,
    salesCount: 3,
    revenue: 600,
    description: '60-minute strategy session. We review your creator business, identify growth blockers, and build a 30-day action plan.',
    thumbEmoji: '🎯',
    thumbHue: 280,
    active: true,
    salesLastMonth: 2,
    salesTrend: [0, 1, 2, 0, 1, 1],
  },
  {
    id: 'pr4',
    title: 'Photography Preset Pack',
    type: 'Digital',
    price: 19,
    recurring: false,
    salesCount: 62,
    revenue: 1178,
    description: '24 Lightroom presets curated for golden-hour, urban, and lifestyle photography. One-click download, mobile compatible.',
    thumbEmoji: '📷',
    thumbHue: 45,
    active: true,
    salesLastMonth: 12,
    salesTrend: [8, 12, 16, 20, 18, 15],
  },
  {
    id: 'pr5',
    title: 'Weekly Creator Newsletter',
    type: 'Digital',
    price: 0,
    recurring: true,
    salesCount: 240,
    revenue: 0,
    description: 'Free weekly newsletter covering creator economy trends, tool picks, and behind-the-scenes from building KaNeXT. 240 subscribers.',
    thumbEmoji: '📬',
    thumbHue: 160,
    active: true,
    salesLastMonth: 210,
    salesTrend: [180, 195, 210, 220, 232, 240],
  },
  {
    id: 'pr6',
    title: 'Brand Strategy Template',
    type: 'Digital',
    price: 45,
    recurring: false,
    salesCount: 28,
    revenue: 1260,
    description: 'Notion + Figma brand strategy kit. Includes positioning canvas, audience persona builder, brand voice guide, and competitive analysis framework.',
    thumbEmoji: '🎨',
    thumbHue: 340,
    active: true,
    salesLastMonth: 6,
    salesTrend: [3, 5, 8, 10, 9, 7],
  },
  {
    id: 'pr7',
    title: 'Group Coaching — Spring Cohort',
    type: 'Course',
    price: 500,
    recurring: false,
    salesCount: 8,
    revenue: 4000,
    description: '6-week live cohort for creators building their first product. Weekly Zoom calls, peer accountability, and direct feedback on your work.',
    thumbEmoji: '🚀',
    thumbHue: 260,
    active: true,
    salesLastMonth: 3,
    salesTrend: [1, 1, 2, 2, 1, 1],
  },
  {
    id: 'pr8',
    title: 'Logo Design Service',
    type: 'Service',
    price: 150,
    recurring: false,
    salesCount: 12,
    revenue: 1800,
    description: 'Custom logo + brand mark design. Includes 3 concepts, 2 revisions, final files in SVG/PNG/PDF. 5–7 day turnaround.',
    thumbEmoji: '✏️',
    thumbHue: 190,
    active: true,
    salesLastMonth: 3,
    salesTrend: [2, 3, 4, 3, 2, 2],
  },
];

export const PRODUCT_SALES: Record<string, ProductSale[]> = {
  pr1: [
    { buyerName: 'Alicia M.',    buyerInitials: 'AM', hue: 200, amount: 29,  date: new Date(Date.now() - 6  * 3600000)  },
    { buyerName: 'Tunde Adeyemi', buyerInitials: 'TA', hue: 60,  amount: 29,  date: new Date(Date.now() - 2  * 86400000) },
    { buyerName: 'James O.',     buyerInitials: 'JO', hue: 240, amount: 29,  date: new Date(Date.now() - 4  * 86400000) },
  ],
  pr2: [
    { buyerName: 'Kemi Ade',     buyerInitials: 'KA', hue: 120, amount: 15,  date: new Date(Date.now() - 3  * 86400000) },
    { buyerName: 'Dev Tunde',    buyerInitials: 'DT', hue: 160, amount: 15,  date: new Date(Date.now() - 10 * 3600000)  },
    { buyerName: 'Chris B.',     buyerInitials: 'CB', hue: 320, amount: 15,  date: new Date(Date.now() - 5  * 86400000) },
  ],
  pr3: [
    { buyerName: 'Faith K.',     buyerInitials: 'FK', hue: 340, amount: 200, date: new Date(Date.now() - 5  * 86400000) },
  ],
  pr4: [
    { buyerName: 'Maya R.',      buyerInitials: 'MR', hue: 180, amount: 19,  date: new Date(Date.now() - 1  * 86400000) },
    { buyerName: 'Leo Chan',     buyerInitials: 'LC', hue: 50,  amount: 19,  date: new Date(Date.now() - 2  * 86400000) },
    { buyerName: 'Nadia B.',     buyerInitials: 'NB', hue: 290, amount: 19,  date: new Date(Date.now() - 3  * 86400000) },
  ],
  pr6: [
    { buyerName: 'Sam Osei',     buyerInitials: 'SO', hue: 70,  amount: 45,  date: new Date(Date.now() - 4  * 86400000) },
    { buyerName: 'Priya T.',     buyerInitials: 'PT', hue: 230, amount: 45,  date: new Date(Date.now() - 6  * 86400000) },
  ],
  pr7: [
    { buyerName: 'Jordan W.',    buyerInitials: 'JW', hue: 20,  amount: 500, date: new Date(Date.now() - 7  * 86400000) },
    { buyerName: 'Amara N.',     buyerInitials: 'AN', hue: 140, amount: 500, date: new Date(Date.now() - 8  * 86400000) },
  ],
  pr8: [
    { buyerName: 'Felix O.',     buyerInitials: 'FO', hue: 100, amount: 150, date: new Date(Date.now() - 2  * 86400000) },
    { buyerName: 'Diana S.',     buyerInitials: 'DS', hue: 310, amount: 150, date: new Date(Date.now() - 5  * 86400000) },
  ],
};

// ── Payouts ───────────────────────────────────────────────────────────────────

export const KAYPAY_CURRENT_BALANCE = 1240; // existing KayPay balance

export const PAYOUTS: Payout[] = [
  { id: 'po1', amount: 2150, destination: 'KayPay', date: new Date('2026-03-20'), status: 'Instant',   capitalPointsEarned: 2150 },
  { id: 'po2', amount: 1800, destination: 'Bank',   bankName: 'Chase ···4821',   date: new Date('2026-03-10'), status: 'Completed' },
  { id: 'po3', amount: 1400, destination: 'KayPay', date: new Date('2026-03-01'), status: 'Instant',   capitalPointsEarned: 1400 },
  { id: 'po4', amount: 2100, destination: 'Bank',   bankName: 'Chase ···4821',   date: new Date('2026-02-15'), status: 'Completed' },
  { id: 'po5', amount: 950,  destination: 'KayPay', date: new Date('2026-02-01'), status: 'Instant',   capitalPointsEarned: 950  },
  { id: 'po6', amount: 600,  destination: 'Bank',   bankName: 'Chase ···4821',   date: new Date('2026-01-15'), status: 'Completed' },
];

// ── Fee table ─────────────────────────────────────────────────────────────────

export const FEE_TABLE: FeeRow[] = [
  { type: 'Subscriptions', kanextFee: '5%',  processingFee: '2.9% + $0.30', netPct: '~92%' },
  { type: 'Digital Sales', kanextFee: '5%',  processingFee: '2.9% + $0.30', netPct: '~92%' },
  { type: 'Tips',          kanextFee: '5%',  processingFee: '2.9% + $0.30', netPct: '~92%' },
  { type: 'Brand Deals',   kanextFee: '3%',  processingFee: '—',             netPct: '~97%' },
  { type: 'Content PPV',   kanextFee: '10%', processingFee: '2.9% + $0.30', netPct: '~87%' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export function formatMoney(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  return `$${value.toLocaleString()}`;
}

export function formatMoneyFull(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: Date): string {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

export function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)   return `${days}d ago`;
  return formatDate(date);
}

/** 1 Capital Point per dollar kept in KayPay ecosystem */
export function getCapitalPoints(amount: number): number {
  return Math.floor(amount);
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id);
}

export function getChartMax(points: ChartPoint[]): number {
  return Math.max(...points.map(p => p.value), 1);
}

export const SOURCE_COLORS: Record<RevenueSource, string> = {
  Subscriptions: '#5A8A6E',
  Tips:          '#D97757',
  Sales:         '#1A1714',
  Deals:         '#B85C5C',
  Content:       '#8B6AAD',
};
