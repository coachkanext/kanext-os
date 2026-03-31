/**
 * Mock data for KayPay Wallet — 3-page layout (Home, Card, Grow).
 */

// =============================================================================
// 1. TYPES
// =============================================================================

export interface Transaction {
  id: string;
  name: string;
  username: string;
  avatarInitials: string;
  amount: number;
  type: 'send' | 'receive' | 'purchase' | 'bill' | 'deposit' | 'withdrawal';
  note: string;
  timestamp: string;
  isInstitutional?: boolean;
}

export interface QuickRecipient {
  id: string;
  name: string;
  initials: string;
  hue: number;
}

export interface CardInfo {
  last4: string;
  name: string;
  expiry: string;
  frozen: boolean;
}

export interface Biller {
  id: string;
  name: string;
  amountDue: number;
  dueDate: string;
  autoPay: boolean;
  category: 'rent' | 'utilities' | 'phone' | 'internet' | 'insurance';
}

export interface SavingsVault {
  id: string;
  name: string;
  target: number;
  current: number;
  iconName: string;
}

export interface CryptoHolding {
  id: string;
  coin: string;
  symbol: string;
  price: number;
  holdings: number;
  gainLoss: number;
  gainPct: number;
}

export interface CryptoIra {
  totalValue: number;
  contributionsThisYear: number;
  limit: number;
  accountType: 'Roth' | 'Traditional';
}

export type TransactionFilterKey = 'all' | 'sent' | 'received' | 'purchases' | 'bills';

// =============================================================================
// 2. DATA
// =============================================================================

export const BALANCE = 2_340.00;
export const APY_RATE = 4.0;
export const MONTHLY_INTEREST = 0.26; // daily

export const QUICK_RECIPIENTS: QuickRecipient[] = [
  { id: 'qr-1', name: 'Marcus',  initials: 'MJ', hue: 215 },
  { id: 'qr-2', name: 'Aisha',   initials: 'AW', hue: 280 },
  { id: 'qr-3', name: 'Devon',   initials: 'DC', hue: 160 },
  { id: 'qr-4', name: 'Tanya',   initials: 'TR', hue: 30  },
  { id: 'qr-5', name: 'Chris',   initials: 'CL', hue: 130 },
  { id: 'qr-6', name: 'Nina',    initials: 'NP', hue: 340 },
  { id: 'qr-7', name: 'Jordan',  initials: 'JW', hue: 45  },
  { id: 'qr-8', name: 'Adebayo', initials: 'AO', hue: 95  },
];

export const TRANSACTIONS: Transaction[] = [
  { id: 'tx-1',  name: 'Marcus Johnson',  username: '@marcus',     avatarInitials: 'MJ', amount:    -45.00, type: 'send',       note: 'Lunch split',            timestamp: 'Today, 2:15 PM' },
  { id: 'tx-2',  name: 'Aisha Williams',  username: '@aisha_w',    avatarInitials: 'AW', amount:    120.00, type: 'receive',    note: 'Concert tickets',        timestamp: 'Today, 11:30 AM' },
  { id: 'tx-3',  name: 'Nike Store',      username: '@nike',       avatarInitials: 'NK', amount:   -189.99, type: 'purchase',   note: 'Air Max 90',             timestamp: 'Yesterday' },
  { id: 'tx-4',  name: 'Direct Deposit',  username: '@employer',   avatarInitials: 'DD', amount:  2_450.00, type: 'deposit',    note: 'Payroll \u2014 March',        timestamp: 'Mar 7' },
  { id: 'tx-5',  name: 'Xfinity',         username: '@xfinity',    avatarInitials: 'XF', amount:    -89.99, type: 'bill',       note: 'Internet \u2014 Mar',         timestamp: 'Mar 6',  isInstitutional: true },
  { id: 'tx-6',  name: 'Devon Carter',    username: '@devon_c',    avatarInitials: 'DC', amount:    -25.00, type: 'send',       note: 'Gas money',              timestamp: 'Mar 5' },
  { id: 'tx-7',  name: 'Apple',           username: '@apple',      avatarInitials: 'AP', amount:    -14.99, type: 'purchase',   note: 'iCloud+ Storage',        timestamp: 'Mar 4',  isInstitutional: true },
  { id: 'tx-8',  name: 'Tanya Robinson',  username: '@tanya_r',    avatarInitials: 'TR', amount:     50.00, type: 'receive',    note: 'Birthday gift',          timestamp: 'Mar 3' },
  { id: 'tx-9',  name: 'ATM Withdrawal',  username: '@atm',        avatarInitials: 'AT', amount:    -60.00, type: 'withdrawal', note: 'Chase ATM',              timestamp: 'Mar 2' },
  { id: 'tx-10', name: 'Rent',            username: '@landlord',   avatarInitials: 'RT', amount: -1_250.00, type: 'bill',       note: 'March rent',             timestamp: 'Mar 1',  isInstitutional: true },
  { id: 'tx-11', name: 'Chris Lee',       username: '@chris_l',    avatarInitials: 'CL', amount:     35.00, type: 'receive',    note: 'Fantasy league',         timestamp: 'Feb 28' },
  { id: 'tx-12', name: 'Uber',            username: '@uber',       avatarInitials: 'UB', amount:    -22.50, type: 'purchase',   note: 'Ride to airport',        timestamp: 'Feb 27', isInstitutional: true },
  { id: 'tx-13', name: 'Chick-fil-A',     username: '@chickfila',  avatarInitials: 'CF', amount:    -13.47, type: 'purchase',   note: 'Lunch',                  timestamp: 'Mar 14', isInstitutional: true },
  { id: 'tx-14', name: 'Kevin Durant',    username: '@kd35',       avatarInitials: 'KD', amount:     80.00, type: 'receive',    note: 'March Madness bet',      timestamp: 'Mar 13' },
  { id: 'tx-15', name: 'Amazon',          username: '@amazon',     avatarInitials: 'AZ', amount:    -34.99, type: 'purchase',   note: 'Phone case',             timestamp: 'Mar 12', isInstitutional: true },
  { id: 'tx-16', name: 'Direct Deposit',  username: '@employer',   avatarInitials: 'DD', amount:  2_450.00, type: 'deposit',    note: 'Payroll \u2014 late Feb',     timestamp: 'Feb 28' },
  { id: 'tx-17', name: 'Spotify',         username: '@spotify',    avatarInitials: 'SP', amount:    -10.99, type: 'bill',       note: 'Premium \u2014 Feb',          timestamp: 'Feb 26', isInstitutional: true },
  { id: 'tx-18', name: 'Jordan Williams', username: '@jordan_w',   avatarInitials: 'JW', amount:     40.00, type: 'receive',    note: 'Barber money',           timestamp: 'Feb 25' },
  { id: 'tx-19', name: 'Shell Gas',       username: '@shell',      avatarInitials: 'SH', amount:    -68.40, type: 'purchase',   note: 'Fill up',                timestamp: 'Feb 24', isInstitutional: true },
  { id: 'tx-20', name: 'Nina Patel',      username: '@nina_p',     avatarInitials: 'NP', amount:    -30.00, type: 'send',       note: 'Movie tickets',          timestamp: 'Feb 23' },
  { id: 'tx-21', name: 'Whole Foods',     username: '@wholefoods', avatarInitials: 'WF', amount:    -87.32, type: 'purchase',   note: 'Groceries',              timestamp: 'Feb 22', isInstitutional: true },
  { id: 'tx-22', name: 'Adebayo Okonkwo', username: '@bayo',       avatarInitials: 'AO', amount:    200.00, type: 'receive',    note: 'International transfer', timestamp: 'Feb 20' },
  { id: 'tx-23', name: 'KayPay Interest', username: '@kaypay',     avatarInitials: 'KP', amount:      7.80, type: 'deposit',    note: '4% APY \u2014 Feb',           timestamp: 'Feb 19' },
  { id: 'tx-24', name: 'Netflix',         username: '@netflix',    avatarInitials: 'NF', amount:    -22.99, type: 'bill',       note: 'Premium \u2014 Feb',          timestamp: 'Feb 18', isInstitutional: true },
  { id: 'tx-25', name: 'LU Lions Ticket', username: '@kaypay',     avatarInitials: 'LU', amount:    -20.00, type: 'purchase',   note: 'vs Howard \u2014 GA',         timestamp: 'Feb 17' },
  { id: 'tx-26', name: 'Aisha Williams',  username: '@aisha_w',    avatarInitials: 'AW', amount:     60.00, type: 'receive',    note: 'Venmo payback',          timestamp: 'Feb 15' },
  { id: 'tx-27', name: 'CVS Pharmacy',    username: '@cvs',        avatarInitials: 'CV', amount:    -23.17, type: 'purchase',   note: 'Prescriptions',          timestamp: 'Feb 14', isInstitutional: true },
  { id: 'tx-28', name: 'Chris Lee',       username: '@chris_l',    avatarInitials: 'CL', amount:    -15.00, type: 'send',       note: 'Lunch payback',          timestamp: 'Feb 12' },
  { id: 'tx-29', name: 'Direct Deposit',  username: '@employer',   avatarInitials: 'DD', amount:  2_450.00, type: 'deposit',    note: 'Payroll \u2014 mid Feb',      timestamp: 'Feb 14' },
  { id: 'tx-30', name: 'Chipotle',        username: '@chipotle',   avatarInitials: 'CH', amount:    -14.28, type: 'purchase',   note: 'Burrito bowl',           timestamp: 'Feb 10', isInstitutional: true },
];

export const CARD_INFO: CardInfo = {
  last4: '4827',
  name: 'SAMMY WILLIAMS',
  expiry: '09/28',
  frozen: false,
};

export const BILLERS: Biller[] = [
  { id: 'bl-1', name: 'Rent',         amountDue: 1_250.00, dueDate: 'Apr 1',  autoPay: true,  category: 'rent' },
  { id: 'bl-2', name: 'Electric Co.', amountDue:   134.50, dueDate: 'Mar 22', autoPay: false, category: 'utilities' },
  { id: 'bl-3', name: 'T-Mobile',     amountDue:    85.00, dueDate: 'Mar 18', autoPay: true,  category: 'phone' },
  { id: 'bl-4', name: 'Xfinity',      amountDue:    89.99, dueDate: 'Apr 6',  autoPay: true,  category: 'internet' },
  { id: 'bl-5', name: 'State Farm',   amountDue:   156.00, dueDate: 'Apr 15', autoPay: false, category: 'insurance' },
];

export const SAVINGS_VAULTS: SavingsVault[] = [
  { id: 'sv-1', name: 'New Car',        target:  5_000, current: 3_200, iconName: 'car.fill'    },
  { id: 'sv-2', name: 'Emergency Fund', target: 10_000, current: 8_400, iconName: 'shield.fill' },
];

export const CRYPTO_HOLDINGS: CryptoHolding[] = [
  { id: 'cr-1', coin: 'Bitcoin',  symbol: 'BTC',  price: 87_342.18, holdings: 0.045, gainLoss:  412.30, gainPct:  11.7 },
  { id: 'cr-2', coin: 'Ethereum', symbol: 'ETH',  price:  3_218.45, holdings: 0.82,  gainLoss:  -89.60, gainPct:  -3.3 },
  { id: 'cr-3', coin: 'USD Coin', symbol: 'USDC', price:       1.00, holdings: 500,   gainLoss:    0,    gainPct:   0   },
  { id: 'cr-4', coin: 'Tether',   symbol: 'USDT', price:       1.00, holdings: 250,   gainLoss:    0,    gainPct:   0   },
];

export const CRYPTO_IRA: CryptoIra = {
  totalValue: 8_420.50,
  contributionsThisYear: 3_500,
  limit: 7_000,
  accountType: 'Roth',
};

export const TRANSACTION_FILTERS: readonly { key: TransactionFilterKey; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'sent',      label: 'Sent'      },
  { key: 'received',  label: 'Received'  },
  { key: 'purchases', label: 'Purchases' },
  { key: 'bills',     label: 'Bills'     },
] as const;

// =============================================================================
// 3. GETTERS
// =============================================================================

const FILTER_TYPE_MAP: Record<TransactionFilterKey, Transaction['type'][]> = {
  all:       [],
  sent:      ['send'],
  received:  ['receive', 'deposit'],
  purchases: ['purchase'],
  bills:     ['bill'],
};

export function getTransactions(filter: TransactionFilterKey = 'all'): Transaction[] {
  if (filter === 'all') return TRANSACTIONS;
  const types = FILTER_TYPE_MAP[filter];
  return TRANSACTIONS.filter((t) => types.includes(t.type));
}

export function getBalance(): number {
  return BALANCE;
}

export function getCardInfo(): CardInfo {
  return CARD_INFO;
}

export function getBillers(): Biller[] {
  return BILLERS;
}

export function getSavingsVaults(): SavingsVault[] {
  return SAVINGS_VAULTS;
}

export function getCryptoHoldings(): CryptoHolding[] {
  return CRYPTO_HOLDINGS;
}

export function getCryptoIra(): CryptoIra {
  return CRYPTO_IRA;
}

export function getQuickRecipients(): QuickRecipient[] {
  return QUICK_RECIPIENTS;
}

// =============================================================================
// 4. FORMATTERS
// =============================================================================

export function formatCurrency(n: number): string {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n < 0 ? `-$${formatted}` : `$${formatted}`;
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return formatCurrency(n);
}

// =============================================================================
// 5. INFRASTRUCTURE FUND
// =============================================================================

export interface InfraProject {
  id: string;
  name: string;
  location: string;
  type: string;
  status: 'active' | 'funded' | 'pipeline';
  totalFunded: number;
  occupancy?: number;
  quarterlyRevenue?: number;
}

export interface InfraFund {
  invested:      number;
  returnPct:     number;
  returnAmount:  number;
  targetMin:     number;
  targetMax:     number;
  fundSizeM:     number;
  investors:     number;
  currentYield:  number;
  projects:      InfraProject[];
  distributions: { date: string; amount: number }[];
}

export const INFRA_FUND: InfraFund = {
  invested:     2_000,
  returnPct:    12.3,
  returnAmount: 246.00,
  targetMin:    10,
  targetMax:    15,
  fundSizeM:    4.2,
  investors:    1_847,
  currentYield: 12.3,
  projects: [
    { id: 'ip1', name: 'FMU Student Housing',   location: 'Florence, SC',   type: 'Housing',    status: 'active',   totalFunded: 1_200_000, occupancy: 92,        quarterlyRevenue: 124_000   },
    { id: 'ip2', name: 'Lincoln Energy Center', location: 'Lincoln Univ',   type: 'Energy',     status: 'active',   totalFunded:   800_000, occupancy: undefined, quarterlyRevenue:  61_000   },
    { id: 'ip3', name: 'Howard Campus Commons', location: 'Washington, DC', type: 'Commercial', status: 'funded',   totalFunded: 2_100_000, occupancy: 88,        quarterlyRevenue: 198_000   },
    { id: 'ip4', name: 'MEAC Cluster Housing',  location: 'Multi-campus',   type: 'Housing',    status: 'pipeline', totalFunded:         0, occupancy: undefined, quarterlyRevenue: undefined },
  ],
  distributions: [
    { date: 'Mar 2026', amount: 20.50 },
    { date: 'Feb 2026', amount: 19.80 },
    { date: 'Jan 2026', amount: 21.10 },
  ],
};

// =============================================================================
// 6. CAPITAL POINTS
// =============================================================================

export interface CapitalPointsData {
  total:     number;
  valueUsd:  number;
  tier:      number; // 1-4
  tierLabel: string;
  thisMonth: number;
  breakdown: { source: string; points: number; multiplier: string }[];
  redeemOptions: { id: string; label: string; points: number; description: string }[];
}

export const CAPITAL_POINTS: CapitalPointsData = {
  total:     4_200,
  valueUsd:  42.00,
  tier:      3,
  tierLabel: 'Investor',
  thisMonth: 380,
  breakdown: [
    { source: 'Infrastructure Fund', points: 2_100, multiplier: '3x' },
    { source: 'Wallet Balance',      points: 1_200, multiplier: '1x' },
    { source: 'Direct Deposit',      points:   620, multiplier: '2x' },
    { source: 'Ecosystem Purchases', points:   280, multiplier: '1x' },
  ],
  redeemOptions: [
    { id: 'rd1', label: 'Apply to Purchase',  points:   500, description: '$5 off any purchase' },
    { id: 'rd2', label: 'Convert to Balance', points: 1_000, description: '$10 added to wallet' },
    { id: 'rd3', label: 'KayStudios Credit',  points: 2_000, description: '$25 course credit' },
    { id: 'rd4', label: 'Boost Upgrade',      points: 1_500, description: 'Unlock premium merchant boost' },
  ],
};

// =============================================================================
// 7. REMITTANCE
// =============================================================================

export interface RemittanceRecipient {
  id:       string;
  name:     string;
  initials: string;
  hue:      number;
  country:  string;
  flag:     string;
  lastSent: string;
  lastAmt:  number;
  currency: string;
}

export const REMITTANCE_RECIPIENTS: RemittanceRecipient[] = [
  { id: 'rr1', name: 'Grace Okonkwo',  initials: 'GO', hue: 95,  country: 'Nigeria', flag: '\uD83C\uDDF3\uD83C\uDDEC', lastSent: 'Mar 1',  lastAmt: 200, currency: 'NGN' },
  { id: 'rr2', name: 'David Williams', initials: 'DW', hue: 215, country: 'UK',      flag: '\uD83C\uDDEC\uD83C\uDDE7', lastSent: 'Feb 15', lastAmt: 150, currency: 'GBP' },
];

export const REMITTANCE_SAVED_TOTAL = 847;   // dollars saved vs Western Union this year
export const REMITTANCE_SENT_TOTAL  = 3_200; // total sent this year

// =============================================================================
// 8. SPLIT PAYMENTS
// =============================================================================

export interface SplitParticipant {
  id:       string;
  name:     string;
  initials: string;
  hue:      number;
  amount:   number;
  paid:     boolean;
}

export interface ActiveSplit {
  id:           string;
  description:  string;
  total:        number;
  participants: SplitParticipant[];
  createdDate:  string;
}

export const ACTIVE_SPLIT: ActiveSplit = {
  id:          'sp1',
  description: 'Dinner at Founding Farmers',
  total:       187.40,
  createdDate: 'Mar 20',
  participants: [
    { id: 'sp1-1', name: 'You',    initials: 'SW', hue: 215, amount: 46.85, paid: true  },
    { id: 'sp1-2', name: 'Marcus', initials: 'MJ', hue: 215, amount: 46.85, paid: true  },
    { id: 'sp1-3', name: 'Aisha',  initials: 'AW', hue: 280, amount: 46.85, paid: false },
    { id: 'sp1-4', name: 'Devon',  initials: 'DC', hue: 160, amount: 46.85, paid: false },
  ],
};

// =============================================================================
// 9. MERCHANT BOOSTS
// =============================================================================

export interface MerchantBoost {
  id:       string;
  merchant: string;
  discount: string;
  category: string;
  active:   boolean;
  expiry:   string;
}

export const ACTIVE_BOOSTS: MerchantBoost[] = [
  { id: 'mb1', merchant: 'Chick-fil-A',  discount: '10% back', category: 'Food',          active: true,  expiry: 'Apr 30' },
  { id: 'mb2', merchant: 'Shell',         discount: '5% back',  category: 'Gas',           active: true,  expiry: 'Apr 15' },
  { id: 'mb3', merchant: 'Nike',          discount: '8% back',  category: 'Shopping',      active: false, expiry: 'Mar 31' },
  { id: 'mb4', merchant: 'AMC Theaters',  discount: '15% back', category: 'Entertainment', active: false, expiry: 'Apr 30' },
  { id: 'mb5', merchant: 'Whole Foods',   discount: '3% back',  category: 'Groceries',     active: false, expiry: 'May 31' },
];

// =============================================================================
// 10. MONTHLY SUMMARY
// =============================================================================

export interface MonthlySummary {
  month:    string;
  spent:    number;
  received: number;
  saved:    number;
  breakdown: { category: string; amount: number; color: string }[];
}

export const MONTHLY_SUMMARY: MonthlySummary = {
  month:    'March 2026',
  spent:    1_847,
  received: 3_200,
  saved:    412,
  breakdown: [
    { category: 'Bills',         amount: 645, color: '#1A1714' },
    { category: 'Food',          amount: 380, color: '#D97757' },
    { category: 'Shopping',      amount: 290, color: '#1A1714' },
    { category: 'Transport',     amount: 185, color: '#1A1714' },
    { category: 'Entertainment', amount: 180, color: '#8B63C8' },
    { category: 'Other',         amount: 167, color: '#5A8A6E' },
  ],
};

// =============================================================================
// 11. INSTITUTIONAL WALLET
// =============================================================================

export interface FundAccount {
  id:      string;
  name:    string;
  balance: number;
  inflow:  number;
  outflow: number;
}

export interface SettlementEvent {
  id:          string;
  description: string;
  amount:      number;
  timestamp:   string;
  chain: {
    event:      string;
    rules:      string;
    auth:       string;
    payment:    string;
    settlement: string;
  };
  split: { label: string; pct: number; amount: number }[];
}

export interface InstitutionalWallet {
  orgName:       string;
  balance:       number;
  funds:         FundAccount[];
  commerceMonth: number;
  payrollNext:   { date: string; amount: number };
  settlements:   SettlementEvent[];
}

export const INSTITUTIONAL_WALLET: InstitutionalWallet = {
  orgName: 'KaNeXT Inc.',
  balance: 847_000,
  funds: [
    { id: 'fa1', name: 'Operating',   balance: 420_000, inflow: 92_000, outflow: 48_000 },
    { id: 'fa2', name: 'Legal',       balance: 120_000, inflow: 20_000, outflow:  5_000 },
    { id: 'fa3', name: 'Marketing',   balance:  85_000, inflow: 15_000, outflow: 22_000 },
    { id: 'fa4', name: 'Engineering', balance: 222_000, inflow: 50_000, outflow: 38_000 },
  ],
  commerceMonth: 12_400,
  payrollNext: { date: 'Mar 31', amount: 48_000 },
  settlements: [
    {
      id: 'se1', description: 'LU vs Howard Ticket Sale', amount: 2_400, timestamp: 'Today 7:42 PM',
      chain: {
        event:      'Ticket purchased',
        rules:      'Athletics revenue policy v3',
        auth:       'Auto-approved',
        payment:    'KayPay wallet',
        settlement: 'Instant \u2014 0.3% fee',
      },
      split: [
        { label: 'Athletics Operating', pct: 80, amount: 1_920 },
        { label: 'Facilities Fund',     pct: 10, amount:   240 },
        { label: 'Student Life',        pct:  5, amount:   120 },
        { label: 'KaNeXT',              pct:  5, amount:   120 },
      ],
    },
    {
      id: 'se2', description: 'Merch Store Sale \u2014 Jersey', amount: 79.99, timestamp: 'Today 6:15 PM',
      chain: {
        event:      'Merch purchased',
        rules:      'Store revenue policy v1',
        auth:       'Auto-approved',
        payment:    'KayPay wallet',
        settlement: 'Instant \u2014 3% fee',
      },
      split: [
        { label: 'Merch Revenue', pct: 95, amount: 75.99 },
        { label: 'KaNeXT',        pct:  5, amount:  4.00 },
      ],
    },
    {
      id: 'se3', description: 'Booster Donation \u2014 Practice Facility', amount: 500, timestamp: 'Yesterday 2:30 PM',
      chain: {
        event:      'Donation received',
        rules:      'Restricted gift policy',
        auth:       'Auto-approved',
        payment:    'External card',
        settlement: 'Next day \u2014 5% fee',
      },
      split: [
        { label: 'Practice Facility Fund', pct: 95, amount: 475 },
        { label: 'KaNeXT',                 pct:  5, amount:  25 },
      ],
    },
  ],
};
