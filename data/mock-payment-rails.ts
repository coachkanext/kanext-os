/**
 * Payment Rails v2 — Mock Data
 * Mode-aware payment, settlement, and refund data for all 5 modes.
 */

import type { Mode } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

export type PaymentStatus = 'completed' | 'pending' | 'processing' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'bank' | 'cash' | 'check' | 'digital';

export interface Payment {
  id: string;
  description: string;
  amount: number;
  type: 'collect' | 'payout';
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
  counterparty: string;
  reference?: string;
}

export interface Settlement {
  id: string;
  period: string;
  totalCollected: number;
  totalPaidOut: number;
  netAmount: number;
  status: 'settled' | 'pending' | 'in-progress';
  date: string;
}

export interface Refund {
  id: string;
  originalPaymentId: string;
  amount: number;
  reason: string;
  status: 'approved' | 'pending' | 'denied' | 'processed';
  requestDate: string;
  processedDate?: string;
}

export interface PaymentSnapshot {
  totalCollected: number;
  totalPaidOut: number;
  pendingPayments: number;
  refundsProcessed: number;
  settlementBalance: number;
}

// =============================================================================
// SPORTS MODE — KaNeXT Basketball
// =============================================================================

const sportsPayments: Payment[] = [
  { id: 'sp-001', description: 'Game Officials Fee — vs Dakota State Int\'l', amount: 1800, type: 'payout', method: 'check', status: 'completed', date: '2026-02-14', counterparty: 'NAIA Officials Association', reference: 'OFF-2026-041' },
  { id: 'sp-002', description: 'Travel Reimbursement — Savannah State Trip', amount: 4200, type: 'payout', method: 'bank', status: 'completed', date: '2026-02-12', counterparty: 'Carroll Travel Services', reference: 'TRV-2026-018' },
  { id: 'sp-003', description: 'Equipment Purchase — Practice Balls', amount: 1250, type: 'payout', method: 'card', status: 'completed', date: '2026-02-10', counterparty: 'Wilson Sporting Goods', reference: 'EQ-2026-009' },
  { id: 'sp-004', description: 'Recruiting Visit — Alex Morgan', amount: 650, type: 'payout', method: 'card', status: 'pending', date: '2026-02-15', counterparty: 'Marriott Hotels', reference: 'REC-2026-022' },
  { id: 'sp-005', description: 'Gate Revenue — Home vs Evergreen', amount: 3200, type: 'collect', method: 'digital', status: 'completed', date: '2026-02-08', counterparty: 'Carroll Athletics Box Office' },
  { id: 'sp-006', description: 'Booster Club Donation', amount: 5000, type: 'collect', method: 'bank', status: 'completed', date: '2026-02-06', counterparty: 'Carroll Booster Club' },
  { id: 'sp-007', description: 'NIL Collective Distribution — January', amount: 8500, type: 'collect', method: 'bank', status: 'completed', date: '2026-02-01', counterparty: 'Fighting Saints NIL Collective' },
  { id: 'sp-008', description: 'Game Officials Fee — vs Bellevue', amount: 1800, type: 'payout', method: 'check', status: 'pending', date: '2026-02-16', counterparty: 'NAIA Officials Association', reference: 'OFF-2026-042' },
  { id: 'sp-009', description: 'Athletic Trainer Services — February', amount: 3500, type: 'payout', method: 'bank', status: 'processing', date: '2026-02-03', counterparty: 'Premier Sports Medicine', reference: 'MED-2026-002' },
  { id: 'sp-010', description: 'Tournament Entry Fee — Frontier Conference', amount: 2500, type: 'collect', method: 'bank', status: 'pending', date: '2026-02-15', counterparty: 'Frontier Conference Office', reference: 'CONF-2026-005' },
];

const sportsSettlements: Settlement[] = [
  { id: 'ss-001', period: 'January 2026', totalCollected: 12400, totalPaidOut: 9800, netAmount: 2600, status: 'settled', date: '2026-02-01' },
  { id: 'ss-002', period: 'December 2025', totalCollected: 8900, totalPaidOut: 7200, netAmount: 1700, status: 'settled', date: '2026-01-01' },
  { id: 'ss-003', period: 'February 2026', totalCollected: 6700, totalPaidOut: 4800, netAmount: 1900, status: 'in-progress', date: '2026-02-16' },
];

const sportsRefunds: Refund[] = [
  { id: 'sr-001', originalPaymentId: 'sp-003', amount: 180, reason: 'Defective practice balls (3 units)', status: 'approved', requestDate: '2026-02-11', processedDate: '2026-02-13' },
  { id: 'sr-002', originalPaymentId: 'sp-002', amount: 320, reason: 'Hotel cancellation credit — weather delay', status: 'pending', requestDate: '2026-02-14' },
];

const sportsSnapshot: PaymentSnapshot = {
  totalCollected: 28000,
  totalPaidOut: 22000,
  pendingPayments: 4,
  refundsProcessed: 1,
  settlementBalance: 6000,
};

// =============================================================================
// CHURCH MODE — 2819 Church
// =============================================================================

const churchPayments: Payment[] = [
  { id: 'cp-001', description: 'Sunday Tithes — Feb 9 Service', amount: 12500, type: 'collect', method: 'digital', status: 'completed', date: '2026-02-09', counterparty: 'Congregation Giving' },
  { id: 'cp-002', description: 'Special Offering — Missions Fund', amount: 3800, type: 'collect', method: 'digital', status: 'completed', date: '2026-02-09', counterparty: 'Congregation Giving' },
  { id: 'cp-003', description: 'Building Fund Contribution', amount: 8000, type: 'collect', method: 'bank', status: 'completed', date: '2026-02-05', counterparty: 'Building Fund Donors' },
  { id: 'cp-004', description: 'Missions Trip — Haiti Support', amount: 6500, type: 'payout', method: 'bank', status: 'completed', date: '2026-02-07', counterparty: 'Global Missions Network' },
  { id: 'cp-005', description: 'Vendor Payment — Sound System Upgrade', amount: 4200, type: 'payout', method: 'card', status: 'processing', date: '2026-02-13', counterparty: 'ProAudio Solutions', reference: 'VND-2026-008' },
  { id: 'cp-006', description: 'Sunday Tithes — Feb 2 Service', amount: 11200, type: 'collect', method: 'digital', status: 'completed', date: '2026-02-02', counterparty: 'Congregation Giving' },
  { id: 'cp-007', description: 'Utility Payment — Main Campus', amount: 3100, type: 'payout', method: 'bank', status: 'completed', date: '2026-02-01', counterparty: 'LADWP', reference: 'UTL-2026-002' },
  { id: 'cp-008', description: 'Youth Ministry Event Supplies', amount: 850, type: 'payout', method: 'card', status: 'pending', date: '2026-02-15', counterparty: 'Party City', reference: 'YTH-2026-003' },
];

const churchSettlements: Settlement[] = [
  { id: 'cs-001', period: 'January 2026', totalCollected: 42000, totalPaidOut: 16500, netAmount: 25500, status: 'settled', date: '2026-02-01' },
  { id: 'cs-002', period: 'February 2026 (Partial)', totalCollected: 35500, totalPaidOut: 14650, netAmount: 20850, status: 'in-progress', date: '2026-02-16' },
];

const churchRefunds: Refund[] = [
  { id: 'cr-001', originalPaymentId: 'cp-005', amount: 420, reason: 'Overcharge on installation fee', status: 'pending', requestDate: '2026-02-14' },
];

const churchSnapshot: PaymentSnapshot = {
  totalCollected: 45000,
  totalPaidOut: 18000,
  pendingPayments: 3,
  refundsProcessed: 0,
  settlementBalance: 27000,
};

// =============================================================================
// EDUCATION MODE — Howard University
// =============================================================================

const educationPayments: Payment[] = [
  { id: 'ep-001', description: 'Tuition Payment — Spring 2026 (Batch)', amount: 285000, type: 'collect', method: 'bank', status: 'completed', date: '2026-01-15', counterparty: 'Student Accounts Receivable' },
  { id: 'ep-002', description: 'Room & Board — Spring 2026 (Batch)', amount: 142000, type: 'collect', method: 'bank', status: 'completed', date: '2026-01-15', counterparty: 'Student Accounts Receivable' },
  { id: 'ep-003', description: 'Student Activity Fees — Spring', amount: 38000, type: 'collect', method: 'bank', status: 'completed', date: '2026-01-20', counterparty: 'Student Accounts Receivable' },
  { id: 'ep-004', description: 'Financial Aid Disbursement — Federal', amount: 186000, type: 'payout', method: 'bank', status: 'completed', date: '2026-01-22', counterparty: 'Federal Student Aid Office', reference: 'FA-2026-SPR-001' },
  { id: 'ep-005', description: 'Financial Aid Disbursement — Institutional', amount: 92000, type: 'payout', method: 'bank', status: 'completed', date: '2026-01-22', counterparty: 'Howard University Financial Aid', reference: 'FA-2026-SPR-002' },
  { id: 'ep-006', description: 'Vendor — Sodexo Food Services', amount: 45000, type: 'payout', method: 'bank', status: 'completed', date: '2026-02-01', counterparty: 'Sodexo', reference: 'VND-2026-012' },
  { id: 'ep-007', description: 'Lab Equipment — Science Dept', amount: 12800, type: 'payout', method: 'card', status: 'processing', date: '2026-02-10', counterparty: 'Fisher Scientific', reference: 'EQ-2026-004' },
  { id: 'ep-008', description: 'Late Tuition Payment — Individual', amount: 8500, type: 'collect', method: 'card', status: 'pending', date: '2026-02-14', counterparty: 'Student — J. Martinez' },
  { id: 'ep-009', description: 'Conference Registration — Faculty', amount: 3200, type: 'payout', method: 'card', status: 'pending', date: '2026-02-15', counterparty: 'CCCU Annual Conference', reference: 'CONF-2026-001' },
  { id: 'ep-010', description: 'Alumni Giving — Annual Fund', amount: 15600, type: 'collect', method: 'digital', status: 'completed', date: '2026-02-08', counterparty: 'Alumni Relations' },
];

const educationSettlements: Settlement[] = [
  { id: 'es-001', period: 'January 2026', totalCollected: 465000, totalPaidOut: 323000, netAmount: 142000, status: 'settled', date: '2026-02-01' },
  { id: 'es-002', period: 'December 2025', totalCollected: 380000, totalPaidOut: 295000, netAmount: 85000, status: 'settled', date: '2026-01-01' },
  { id: 'es-003', period: 'February 2026', totalCollected: 45100, totalPaidOut: 61000, netAmount: -15900, status: 'in-progress', date: '2026-02-16' },
];

const educationRefunds: Refund[] = [
  { id: 'er-001', originalPaymentId: 'ep-001', amount: 4250, reason: 'Student withdrawal — prorated tuition refund', status: 'approved', requestDate: '2026-02-03', processedDate: '2026-02-07' },
  { id: 'er-002', originalPaymentId: 'ep-002', amount: 2800, reason: 'Housing change — room rate adjustment', status: 'processed', requestDate: '2026-01-28', processedDate: '2026-02-02' },
];

const educationSnapshot: PaymentSnapshot = {
  totalCollected: 890000,
  totalPaidOut: 340000,
  pendingPayments: 8,
  refundsProcessed: 2,
  settlementBalance: 550000,
};

// =============================================================================
// BUSINESS MODE — KaNeXT
// =============================================================================

const businessPayments: Payment[] = [
  { id: 'bp-001', description: 'Client Invoice — Valuetainment Platform License', amount: 24000, type: 'collect', method: 'bank', status: 'completed', date: '2026-02-01', counterparty: 'Carroll College', reference: 'INV-2026-001' },
  { id: 'bp-002', description: 'Client Invoice — 2819 Church Platform License', amount: 18000, type: 'collect', method: 'bank', status: 'completed', date: '2026-02-01', counterparty: '2819 Church', reference: 'INV-2026-002' },
  { id: 'bp-003', description: 'SaaS Subscription — AWS Infrastructure', amount: 8200, type: 'payout', method: 'card', status: 'completed', date: '2026-02-03', counterparty: 'Amazon Web Services', reference: 'SUB-2026-002' },
  { id: 'bp-004', description: 'Contractor — Mobile Development', amount: 12000, type: 'payout', method: 'bank', status: 'completed', date: '2026-02-05', counterparty: 'Apex Dev Studio', reference: 'CTR-2026-004' },
  { id: 'bp-005', description: 'Client Invoice — Valuetainment Media League', amount: 15000, type: 'collect', method: 'bank', status: 'pending', date: '2026-02-10', counterparty: 'Valuetainment Media', reference: 'INV-2026-003' },
  { id: 'bp-006', description: 'Vendor Payment — Legal Counsel', amount: 6500, type: 'payout', method: 'bank', status: 'completed', date: '2026-02-07', counterparty: 'Morrison & Associates', reference: 'LGL-2026-001' },
  { id: 'bp-007', description: 'Payroll — February Cycle 1', amount: 42000, type: 'payout', method: 'bank', status: 'processing', date: '2026-02-15', counterparty: 'Valuetainment Payroll', reference: 'PAY-2026-003' },
  { id: 'bp-008', description: 'SaaS Subscription — Vercel Hosting', amount: 1200, type: 'payout', method: 'card', status: 'completed', date: '2026-02-01', counterparty: 'Vercel Inc.', reference: 'SUB-2026-003' },
  { id: 'bp-009', description: 'Client Invoice — Howard University Pilot License', amount: 9500, type: 'collect', method: 'bank', status: 'pending', date: '2026-02-12', counterparty: 'Howard University', reference: 'INV-2026-004' },
  { id: 'bp-010', description: 'Contractor — AI/ML Pipeline', amount: 18500, type: 'payout', method: 'bank', status: 'pending', date: '2026-02-16', counterparty: 'Tensor Works LLC', reference: 'CTR-2026-005' },
];

const businessSettlements: Settlement[] = [
  { id: 'bs-001', period: 'January 2026', totalCollected: 66500, totalPaidOut: 54200, netAmount: 12300, status: 'settled', date: '2026-02-01' },
  { id: 'bs-002', period: 'December 2025', totalCollected: 58000, totalPaidOut: 48900, netAmount: 9100, status: 'settled', date: '2026-01-01' },
  { id: 'bs-003', period: 'February 2026', totalCollected: 66500, totalPaidOut: 88400, netAmount: -21900, status: 'in-progress', date: '2026-02-16' },
];

const businessRefunds: Refund[] = [
  { id: 'br-001', originalPaymentId: 'bp-003', amount: 1200, reason: 'AWS reserved instance credit adjustment', status: 'processed', requestDate: '2026-02-04', processedDate: '2026-02-06' },
  { id: 'br-002', originalPaymentId: 'bp-004', amount: 2000, reason: 'Sprint deliverable scope reduction', status: 'approved', requestDate: '2026-02-08', processedDate: '2026-02-10' },
  { id: 'br-003', originalPaymentId: 'bp-006', amount: 750, reason: 'Duplicate billing on retainer', status: 'pending', requestDate: '2026-02-12' },
];

const businessSnapshot: PaymentSnapshot = {
  totalCollected: 185000,
  totalPaidOut: 142000,
  pendingPayments: 5,
  refundsProcessed: 2,
  settlementBalance: 43000,
};

// =============================================================================
// COMMUNITY MODE — Valuetainment Media League
// =============================================================================

const communityPayments: Payment[] = [
  { id: 'kp-001', description: 'Entry Fee — Round 3 Championship', amount: 4500, type: 'collect', method: 'digital', status: 'completed', date: '2026-02-08', counterparty: 'Race Entrants (15 drivers)' },
  { id: 'kp-002', description: 'Sponsorship — RedBull Regional', amount: 8000, type: 'collect', method: 'bank', status: 'completed', date: '2026-02-01', counterparty: 'RedBull Racing Partnerships', reference: 'SPO-2026-002' },
  { id: 'kp-003', description: 'Track Rental — Homestead Karting', amount: 3200, type: 'payout', method: 'bank', status: 'completed', date: '2026-02-05', counterparty: 'Homestead Karting Center', reference: 'TRK-2026-003' },
  { id: 'kp-004', description: 'Prize Money — Round 2 Winners', amount: 2500, type: 'payout', method: 'bank', status: 'completed', date: '2026-02-03', counterparty: 'Top 5 Finishers', reference: 'PRZ-2026-002' },
  { id: 'kp-005', description: 'Parts Purchase — Replacement Kart Tires', amount: 1800, type: 'payout', method: 'card', status: 'pending', date: '2026-02-14', counterparty: 'MG Tires USA', reference: 'PRT-2026-005' },
  { id: 'kp-006', description: 'Timing System Rental — MyLaps', amount: 1200, type: 'payout', method: 'card', status: 'completed', date: '2026-02-06', counterparty: 'MyLaps Sports Timing', reference: 'EQP-2026-002' },
];

const communitySettlements: Settlement[] = [
  { id: 'ks-001', period: 'January 2026', totalCollected: 10200, totalPaidOut: 7800, netAmount: 2400, status: 'settled', date: '2026-02-01' },
  { id: 'ks-002', period: 'February 2026', totalCollected: 12500, totalPaidOut: 8700, netAmount: 3800, status: 'in-progress', date: '2026-02-16' },
];

const communityRefunds: Refund[] = [
  { id: 'kr-001', originalPaymentId: 'kp-001', amount: 300, reason: 'Driver withdrawal — medical clearance issue', status: 'approved', requestDate: '2026-02-09', processedDate: '2026-02-11' },
];

const communitySnapshot: PaymentSnapshot = {
  totalCollected: 18000,
  totalPaidOut: 12000,
  pendingPayments: 2,
  refundsProcessed: 1,
  settlementBalance: 6000,
};

// =============================================================================
// EXPORTS — Record<Mode, T>
// =============================================================================

export const PAYMENTS: Record<Mode, Payment[]> = {
  sports: sportsPayments,
  church: churchPayments,
  education: educationPayments,
  business: businessPayments,
  competition: communityPayments,
};

export const SETTLEMENTS: Record<Mode, Settlement[]> = {
  sports: sportsSettlements,
  church: churchSettlements,
  education: educationSettlements,
  business: businessSettlements,
  competition: communitySettlements,
};

export const REFUNDS: Record<Mode, Refund[]> = {
  sports: sportsRefunds,
  church: churchRefunds,
  education: educationRefunds,
  business: businessRefunds,
  competition: communityRefunds,
};

export const PAYMENT_SNAPSHOTS: Record<Mode, PaymentSnapshot> = {
  sports: sportsSnapshot,
  church: churchSnapshot,
  education: educationSnapshot,
  business: businessSnapshot,
  competition: communitySnapshot,
};
