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

export const BALANCE = 4_827.63;
export const APY_RATE = 4.0;
export const MONTHLY_INTEREST = 16.09;

export const QUICK_RECIPIENTS: QuickRecipient[] = [
  { id: 'qr-1', name: 'Marcus', initials: 'MJ' },
  { id: 'qr-2', name: 'Aisha', initials: 'AW' },
  { id: 'qr-3', name: 'Devon', initials: 'DC' },
  { id: 'qr-4', name: 'Tanya', initials: 'TR' },
  { id: 'qr-5', name: 'Chris', initials: 'CL' },
  { id: 'qr-6', name: 'Nina', initials: 'NP' },
];

export const TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', name: 'Marcus Johnson', username: '@marcus', avatarInitials: 'MJ', amount: -45.00, type: 'send', note: 'Lunch split', timestamp: 'Today, 2:15 PM' },
  { id: 'tx-2', name: 'Aisha Williams', username: '@aisha_w', avatarInitials: 'AW', amount: 120.00, type: 'receive', note: 'Concert tickets', timestamp: 'Today, 11:30 AM' },
  { id: 'tx-3', name: 'Nike Store', username: '@nike', avatarInitials: 'NK', amount: -189.99, type: 'purchase', note: 'Air Max 90', timestamp: 'Yesterday' },
  { id: 'tx-4', name: 'Direct Deposit', username: '@employer', avatarInitials: 'DD', amount: 2_450.00, type: 'deposit', note: 'Payroll — March', timestamp: 'Mar 7' },
  { id: 'tx-5', name: 'Xfinity', username: '@xfinity', avatarInitials: 'XF', amount: -89.99, type: 'bill', note: 'Internet — Mar', timestamp: 'Mar 6', isInstitutional: true },
  { id: 'tx-6', name: 'Devon Carter', username: '@devon_c', avatarInitials: 'DC', amount: -25.00, type: 'send', note: 'Gas money', timestamp: 'Mar 5' },
  { id: 'tx-7', name: 'Apple', username: '@apple', avatarInitials: 'AP', amount: -14.99, type: 'purchase', note: 'iCloud+ Storage', timestamp: 'Mar 4', isInstitutional: true },
  { id: 'tx-8', name: 'Tanya Robinson', username: '@tanya_r', avatarInitials: 'TR', amount: 50.00, type: 'receive', note: 'Birthday gift', timestamp: 'Mar 3' },
  { id: 'tx-9', name: 'ATM Withdrawal', username: '@atm', avatarInitials: 'AT', amount: -60.00, type: 'withdrawal', note: 'Chase ATM', timestamp: 'Mar 2' },
  { id: 'tx-10', name: 'Rent', username: '@landlord', avatarInitials: 'RT', amount: -1_250.00, type: 'bill', note: 'March rent', timestamp: 'Mar 1', isInstitutional: true },
  { id: 'tx-11', name: 'Chris Lee', username: '@chris_l', avatarInitials: 'CL', amount: 35.00, type: 'receive', note: 'Fantasy league', timestamp: 'Feb 28' },
  { id: 'tx-12', name: 'Uber', username: '@uber', avatarInitials: 'UB', amount: -22.50, type: 'purchase', note: 'Ride to airport', timestamp: 'Feb 27', isInstitutional: true },
];

export const CARD_INFO: CardInfo = {
  last4: '4827',
  name: 'SAMMY WILLIAMS',
  expiry: '09/28',
  frozen: false,
};

export const BILLERS: Biller[] = [
  { id: 'bl-1', name: 'Rent', amountDue: 1_250.00, dueDate: 'Apr 1', autoPay: true, category: 'rent' },
  { id: 'bl-2', name: 'Electric Co.', amountDue: 134.50, dueDate: 'Mar 22', autoPay: false, category: 'utilities' },
  { id: 'bl-3', name: 'T-Mobile', amountDue: 85.00, dueDate: 'Mar 18', autoPay: true, category: 'phone' },
  { id: 'bl-4', name: 'Xfinity', amountDue: 89.99, dueDate: 'Apr 6', autoPay: true, category: 'internet' },
  { id: 'bl-5', name: 'State Farm', amountDue: 156.00, dueDate: 'Apr 15', autoPay: false, category: 'insurance' },
];

export const SAVINGS_VAULTS: SavingsVault[] = [
  { id: 'sv-1', name: 'Emergency Fund', target: 10_000, current: 6_540, iconName: 'shield.fill' },
  { id: 'sv-2', name: 'Vacation', target: 3_000, current: 1_820, iconName: 'airplane' },
  { id: 'sv-3', name: 'Car', target: 15_000, current: 4_200, iconName: 'car.fill' },
];

export const CRYPTO_HOLDINGS: CryptoHolding[] = [
  { id: 'cr-1', coin: 'Bitcoin', symbol: 'BTC', price: 87_342.18, holdings: 0.045, gainLoss: 412.30, gainPct: 11.7 },
  { id: 'cr-2', coin: 'Ethereum', symbol: 'ETH', price: 3_218.45, holdings: 0.82, gainLoss: -89.60, gainPct: -3.3 },
  { id: 'cr-3', coin: 'USD Coin', symbol: 'USDC', price: 1.00, holdings: 500, gainLoss: 0, gainPct: 0 },
  { id: 'cr-4', coin: 'Tether', symbol: 'USDT', price: 1.00, holdings: 250, gainLoss: 0, gainPct: 0 },
];

export const CRYPTO_IRA: CryptoIra = {
  totalValue: 8_420.50,
  contributionsThisYear: 3_500,
  limit: 7_000,
  accountType: 'Roth',
};

export const TRANSACTION_FILTERS: readonly { key: TransactionFilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'sent', label: 'Sent' },
  { key: 'received', label: 'Received' },
  { key: 'purchases', label: 'Purchases' },
  { key: 'bills', label: 'Bills' },
] as const;

// =============================================================================
// 3. GETTERS
// =============================================================================

const FILTER_TYPE_MAP: Record<TransactionFilterKey, Transaction['type'][]> = {
  all: [],
  sent: ['send'],
  received: ['receive', 'deposit'],
  purchases: ['purchase'],
  bills: ['bill'],
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
