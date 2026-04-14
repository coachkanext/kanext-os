/**
 * Mock data — Personal Mode KPay.
 * Shared across wallet, earnings, activity, card, tax, savings screens.
 */

export type KPayTx = {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  description: string;
  date: string;
  amount: number;
  category: 'store' | 'subscription' | 'booking' | 'tip' | 'affiliate' | 'transfer' | 'purchase';
  txId: string;
};

export const OWNER_TXS: KPayTx[] = [
  { id: 'ot1',  type: 'income',   description: 'Store — Content Strategy Playbook',      date: 'Apr 12', amount:    29.00, category: 'store',        txId: 'KP-TX-2026-04-12-0001' },
  { id: 'ot2',  type: 'income',   description: 'Subscription — Marcus Johnson',           date: 'Apr 11', amount:     5.00, category: 'subscription', txId: 'KP-TX-2026-04-11-0001' },
  { id: 'ot3',  type: 'income',   description: 'Booking — 1-on-1 Coaching Call',         date: 'Apr 10', amount:   150.00, category: 'booking',      txId: 'KP-TX-2026-04-10-0001' },
  { id: 'ot4',  type: 'transfer', description: 'Cash Out to Chase ••••1234',              date: 'Apr 9',  amount: -2000.00, category: 'transfer',     txId: 'KP-TX-2026-04-09-0001' },
  { id: 'ot5',  type: 'income',   description: 'Store — Creator Masterclass',             date: 'Apr 8',  amount:   149.00, category: 'store',        txId: 'KP-TX-2026-04-08-0001' },
  { id: 'ot6',  type: 'income',   description: 'Subscription — Aisha M.',                date: 'Apr 7',  amount:     5.00, category: 'subscription', txId: 'KP-TX-2026-04-07-0001' },
  { id: 'ot7',  type: 'income',   description: 'Affiliate — The Creator Lab',             date: 'Apr 6',  amount:    84.00, category: 'affiliate',    txId: 'KP-TX-2026-04-06-0001' },
  { id: 'ot8',  type: 'income',   description: 'Store — Build in Public Hoodie',          date: 'Apr 5',  amount:    45.00, category: 'store',        txId: 'KP-TX-2026-04-05-0001' },
  { id: 'ot9',  type: 'income',   description: 'Tip — Jordan W.',                         date: 'Apr 4',  amount:    20.00, category: 'tip',          txId: 'KP-TX-2026-04-04-0001' },
  { id: 'ot10', type: 'income',   description: 'Booking — 1-on-1 Coaching Call',         date: 'Apr 3',  amount:   150.00, category: 'booking',      txId: 'KP-TX-2026-04-03-0001' },
  { id: 'ot11', type: 'transfer', description: 'Cash Out to Chase ••••1234',              date: 'Apr 1',  amount:  -500.00, category: 'transfer',     txId: 'KP-TX-2026-04-01-0001' },
  { id: 'ot12', type: 'income',   description: 'Subscription — Sofia R.',                 date: 'Mar 31', amount:     5.00, category: 'subscription', txId: 'KP-TX-2026-03-31-0001' },
];

export const FOLLOWER_TXS: KPayTx[] = [
  { id: 'ft1',  type: 'expense',  description: 'Sammy Kalejaiye — Coaching Call',             date: 'Apr 12', amount:  -150.00, category: 'booking',      txId: 'KP-TX-2026-04-12-0010' },
  { id: 'ft2',  type: 'expense',  description: 'Sammy Kalejaiye — Content Strategy Playbook', date: 'Apr 8',  amount:   -29.00, category: 'store',        txId: 'KP-TX-2026-04-08-0010' },
  { id: 'ft3',  type: 'expense',  description: 'ICCLA — Sunday Offering',                     date: 'Apr 6',  amount:   -50.00, category: 'purchase',     txId: 'KP-TX-2026-04-06-0010' },
  { id: 'ft4',  type: 'transfer', description: 'Transfer from Chase ••••5678',                date: 'Apr 2',  amount:   200.00, category: 'transfer',     txId: 'KP-TX-2026-04-02-0010' },
  { id: 'ft5',  type: 'expense',  description: 'Sammy Kalejaiye — Monthly Newsletter',        date: 'Mar 31', amount:    -5.00, category: 'subscription', txId: 'KP-TX-2026-03-31-0010' },
  { id: 'ft6',  type: 'expense',  description: 'Blue Bottle Coffee',                          date: 'Mar 29', amount:    -6.50, category: 'purchase',     txId: 'KP-TX-2026-03-29-0010' },
  { id: 'ft7',  type: 'transfer', description: 'Transfer from Chase ••••5678',                date: 'Mar 25', amount:   500.00, category: 'transfer',     txId: 'KP-TX-2026-03-25-0010' },
  { id: 'ft8',  type: 'income',   description: 'Nike Affiliate — Referral',                   date: 'Mar 20', amount:   120.00, category: 'affiliate',    txId: 'KP-TX-2026-03-20-0010' },
];

export const REVENUE_TREND = [
  { month: 'Oct', amount: 1200 },
  { month: 'Nov', amount: 1800 },
  { month: 'Dec', amount: 2100 },
  { month: 'Jan', amount: 2800 },
  { month: 'Feb', amount: 3400 },
  { month: 'Mar', amount: 4200 },
];

// Colors per source — monochrome design spec: data values only
export const REVENUE_SOURCES = [
  { label: 'Store sales',    amount: 1800, pct: 43, color: '#1A1714' },
  { label: 'Subscriptions', amount: 1200, pct: 29, color: '#5A8A6E' },
  { label: 'Bookings',      amount:  600, pct: 14, color: '#B8943E' },
  { label: 'Tips',          amount:  340, pct:  8, color: '#7A6E68' },
  { label: 'Affiliate',     amount:  260, pct:  6, color: '#9C9790' },
];

export const TAX_QUARTERS = [
  { q: 'Q1 2026', period: 'Jan – Mar', amount: '$1,240',      settled: true  },
  { q: 'Q2 2026', period: 'Apr – Jun', amount: '$1,680 est.', settled: false },
  { q: 'Q3 2026', period: 'Jul – Sep', amount: '—',           settled: false },
  { q: 'Q4 2026', period: 'Oct – Dec', amount: '—',           settled: false },
];

export const CARD_TXS = [
  { id: 'ct1', merchant: 'Trader Joes',  date: 'Apr 12', amount: -32.40 },
  { id: 'ct2', merchant: 'Apple',        date: 'Apr 10', amount: -14.99 },
  { id: 'ct3', merchant: 'Amazon',       date: 'Apr 9',  amount: -67.23 },
  { id: 'ct4', merchant: 'Uber Eats',    date: 'Apr 7',  amount: -24.80 },
];

export const LINKED_BANKS = [
  { id: 'b1', name: 'Chase',       last4: '1234', type: 'Checking', primary: true  },
  { id: 'b2', name: 'Wells Fargo', last4: '5678', type: 'Savings',  primary: false },
];

export const MOCK_INVOICES = [
  { id: 'inv1', client: 'Nike',        amount: 2500,  status: 'Paid',    date: 'Apr 5',  dueDate: 'Apr 5'  },
  { id: 'inv2', client: 'Gatorade',    amount: 1800,  status: 'Pending', date: 'Apr 10', dueDate: 'Apr 24' },
  { id: 'inv3', client: 'The Creator Lab', amount: 840, status: 'Pending', date: 'Apr 12', dueDate: 'Apr 26' },
  { id: 'inv4', client: 'FitFuel',     amount: 500,   status: 'Overdue', date: 'Mar 20', dueDate: 'Apr 3'  },
];
