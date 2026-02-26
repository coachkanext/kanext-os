/**
 * Church Giving — mock data for the Giving Page (v1)
 *
 * Personal giving center: transactions, recurring plans, payment methods.
 * V1 visibility — personal only, no campus totals.
 */

// =============================================================================
// TYPES
// =============================================================================

export type GivingFund =
  | 'General Fund'
  | 'Missions'
  | 'Benevolence'
  | "Children's Ministry"
  | 'Building Fund'
  | 'Other';

export type TransactionStatus = 'PENDING' | 'SETTLED' | 'FAILED';
export type RecurringStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';
export type RecurringFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export interface GivingTransaction {
  id: string;
  personId: string;
  campusId: string;
  amountCents: number;
  fund: GivingFund;
  createdAt: string;
  status: TransactionStatus;
  referenceId: string;
  paymentMethodLast4: string;
}

export interface RecurringGift {
  id: string;
  personId: string;
  campusId: string;
  amountCents: number;
  fund: GivingFund;
  frequency: RecurringFrequency;
  nextChargeDate: string;
  status: RecurringStatus;
  paymentMethodLast4: string;
}

export interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'amex' | 'ach';
  last4: string;
  expiry?: string;
  isDefault: boolean;
  label: string;
}

// =============================================================================
// FUNDS
// =============================================================================

export const GIVING_FUNDS: GivingFund[] = [
  'General Fund',
  'Missions',
  'Benevolence',
  "Children's Ministry",
  'Building Fund',
];

// =============================================================================
// PRESET AMOUNTS
// =============================================================================

export const QUICK_GIVE_AMOUNTS = [25, 50, 100] as const;

// =============================================================================
// GIVING HISTORY
// =============================================================================

export const GIVING_HISTORY: GivingTransaction[] = [
  {
    id: 'gtx-001',
    personId: 'user-demo',
    campusId: 'campus-kcc',
    amountCents: 10000,
    fund: 'General Fund',
    createdAt: '2025-02-16',
    status: 'SETTLED',
    referenceId: 'GIV-2025-0216-001',
    paymentMethodLast4: '4242',
  },
  {
    id: 'gtx-002',
    personId: 'user-demo',
    campusId: 'campus-kcc',
    amountCents: 5000,
    fund: 'Missions',
    createdAt: '2025-02-16',
    status: 'SETTLED',
    referenceId: 'GIV-2025-0216-002',
    paymentMethodLast4: '4242',
  },
  {
    id: 'gtx-003',
    personId: 'user-demo',
    campusId: 'campus-kcc',
    amountCents: 10000,
    fund: 'General Fund',
    createdAt: '2025-02-09',
    status: 'SETTLED',
    referenceId: 'GIV-2025-0209-001',
    paymentMethodLast4: '4242',
  },
  {
    id: 'gtx-004',
    personId: 'user-demo',
    campusId: 'campus-kcc',
    amountCents: 2500,
    fund: 'Building Fund',
    createdAt: '2025-02-09',
    status: 'SETTLED',
    referenceId: 'GIV-2025-0209-002',
    paymentMethodLast4: '4242',
  },
  {
    id: 'gtx-005',
    personId: 'user-demo',
    campusId: 'campus-kcc',
    amountCents: 10000,
    fund: 'General Fund',
    createdAt: '2025-02-02',
    status: 'SETTLED',
    referenceId: 'GIV-2025-0202-001',
    paymentMethodLast4: '4242',
  },
  {
    id: 'gtx-006',
    personId: 'user-demo',
    campusId: 'campus-kcc',
    amountCents: 10000,
    fund: 'General Fund',
    createdAt: '2025-01-26',
    status: 'SETTLED',
    referenceId: 'GIV-2025-0126-001',
    paymentMethodLast4: '4242',
  },
  {
    id: 'gtx-007',
    personId: 'user-demo',
    campusId: 'campus-kcc',
    amountCents: 15000,
    fund: "Children's Ministry",
    createdAt: '2025-01-19',
    status: 'SETTLED',
    referenceId: 'GIV-2025-0119-001',
    paymentMethodLast4: '7890',
  },
  {
    id: 'gtx-008',
    personId: 'user-demo',
    campusId: 'campus-kcc',
    amountCents: 10000,
    fund: 'General Fund',
    createdAt: '2025-01-12',
    status: 'SETTLED',
    referenceId: 'GIV-2025-0112-001',
    paymentMethodLast4: '4242',
  },
];

// =============================================================================
// RECURRING GIFTS
// =============================================================================

export const RECURRING_GIFTS: RecurringGift[] = [
  {
    id: 'rec-001',
    personId: 'user-demo',
    campusId: 'campus-kcc',
    amountCents: 10000,
    fund: 'General Fund',
    frequency: 'MONTHLY',
    nextChargeDate: '2025-03-01',
    status: 'ACTIVE',
    paymentMethodLast4: '4242',
  },
  {
    id: 'rec-002',
    personId: 'user-demo',
    campusId: 'campus-kcc',
    amountCents: 5000,
    fund: 'Missions',
    frequency: 'MONTHLY',
    nextChargeDate: '2025-03-01',
    status: 'ACTIVE',
    paymentMethodLast4: '4242',
  },
  {
    id: 'rec-003',
    personId: 'user-demo',
    campusId: 'campus-kcc',
    amountCents: 2500,
    fund: "Children's Ministry",
    frequency: 'BIWEEKLY',
    nextChargeDate: '2025-02-28',
    status: 'PAUSED',
    paymentMethodLast4: '7890',
  },
];

// =============================================================================
// PAYMENT METHODS
// =============================================================================

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm-001',
    type: 'visa',
    last4: '4242',
    expiry: '08/27',
    isDefault: true,
    label: 'Visa \u2022\u2022\u2022\u2022 4242',
  },
  {
    id: 'pm-002',
    type: 'mastercard',
    last4: '7890',
    expiry: '11/26',
    isDefault: false,
    label: 'Mastercard \u2022\u2022\u2022\u2022 7890',
  },
  {
    id: 'pm-003',
    type: 'ach',
    last4: '6789',
    isDefault: false,
    label: 'Bank Account \u2022\u2022\u2022\u2022 6789',
  },
];

// =============================================================================
// HELPERS
// =============================================================================

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatCentsDollars(cents: number): string {
  return `$${Math.round(cents / 100)}`;
}

export function formatFrequency(f: RecurringFrequency): string {
  switch (f) {
    case 'WEEKLY':
      return 'Weekly';
    case 'BIWEEKLY':
      return 'Bi-Weekly';
    case 'MONTHLY':
      return 'Monthly';
  }
}
