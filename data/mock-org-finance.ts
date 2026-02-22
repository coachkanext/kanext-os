/**
 * Organization Finance Tab — Universal mock data
 * KPIs, payment rails, and ledger entries per mode.
 */
import type { Mode } from '@/types';

export interface FinanceKPI {
  id: string;
  label: string;
  value: string;
  delta?: string;
  deltaType?: 'up' | 'down' | 'neutral';
}

export interface FinanceRail {
  id: string;
  name: string;
  icon: string;
  subtitle: string;
  ctaLabel: string;
}

export interface LedgerEntry {
  id: string;
  description: string;
  amount: number;
  type: 'revenue' | 'expense';
  date: string;
  category: string;
}

export interface OrgFinanceData {
  kpis: FinanceKPI[];
  rails: FinanceRail[];
  ledger: LedgerEntry[];
}

// ── Sports ──────────────────────────────────────────────────────────────
const SPORTS_FINANCE: OrgFinanceData = {
  kpis: [
    { id: 'sk-1', label: 'Revenue YTD', value: '$1.2M', delta: '+12%', deltaType: 'up' },
    { id: 'sk-2', label: 'Ticket Sales', value: '$340K', delta: '+8%', deltaType: 'up' },
    { id: 'sk-3', label: 'NIL Pool', value: '$185K', delta: 'New', deltaType: 'neutral' },
    { id: 'sk-4', label: 'Scholarship Spend', value: '$890K', delta: '+3%', deltaType: 'up' },
  ],
  rails: [
    { id: 'sr-1', name: 'Donations', icon: 'heart.fill', subtitle: 'Athletic fund contributions', ctaLabel: 'View' },
    { id: 'sr-2', name: 'Ticket Office', icon: 'ticket.fill', subtitle: 'Game day & season passes', ctaLabel: 'Manage' },
  ],
  ledger: [
    { id: 'sl-1', description: 'Season ticket package — Block A', amount: 12500, type: 'revenue', date: 'Feb 15', category: 'Tickets' },
    { id: 'sl-2', description: 'Away game travel — vs. Evergreen', amount: -4200, type: 'expense', date: 'Feb 14', category: 'Travel' },
    { id: 'sl-3', description: 'Booster donation — Williams Family', amount: 5000, type: 'revenue', date: 'Feb 12', category: 'Donations' },
    { id: 'sl-4', description: 'Equipment order — Nike', amount: -8900, type: 'expense', date: 'Feb 10', category: 'Equipment' },
    { id: 'sl-5', description: 'Game guarantee — Homecoming Classic', amount: 15000, type: 'revenue', date: 'Feb 8', category: 'Events' },
    { id: 'sl-6', description: 'Athletic trainer contract', amount: -3200, type: 'expense', date: 'Feb 5', category: 'Staff' },
    { id: 'sl-7', description: 'Concession revenue — Feb games', amount: 2800, type: 'revenue', date: 'Feb 3', category: 'Concessions' },
    { id: 'sl-8', description: 'Facility maintenance — gym floor', amount: -6500, type: 'expense', date: 'Feb 1', category: 'Facilities' },
  ],
};

// ── Business ──────────────────────────────────────────────────────────
const BUSINESS_FINANCE: OrgFinanceData = {
  kpis: [
    { id: 'ek-1', label: 'Revenue', value: '$48K', delta: '+22% MoM', deltaType: 'up' },
    { id: 'ek-2', label: 'Burn Rate', value: '$32K/mo', delta: '-5%', deltaType: 'down' },
    { id: 'ek-3', label: 'Runway', value: '18 mo', delta: '+2 mo', deltaType: 'up' },
    { id: 'ek-4', label: 'ARR', value: '$576K', delta: '+22%', deltaType: 'up' },
  ],
  rails: [
    { id: 'err-1', name: 'Stripe', icon: 'creditcard.fill', subtitle: 'Subscription billing', ctaLabel: 'Dashboard' },
    { id: 'err-2', name: 'Mercury', icon: 'building.columns.fill', subtitle: 'Operating account', ctaLabel: 'View' },
  ],
  ledger: [
    { id: 'el-1', description: 'SaaS subscription — Acme Corp', amount: 4800, type: 'revenue', date: 'Feb 15', category: 'Subscriptions' },
    { id: 'el-2', description: 'AWS infrastructure', amount: -3200, type: 'expense', date: 'Feb 14', category: 'Infrastructure' },
    { id: 'el-3', description: 'SaaS subscription — Beta Inc', amount: 2400, type: 'revenue', date: 'Feb 12', category: 'Subscriptions' },
    { id: 'el-4', description: 'Contractor payment — Design', amount: -5500, type: 'expense', date: 'Feb 10', category: 'Contractors' },
    { id: 'el-5', description: 'Pilot fee — Gamma Labs', amount: 8000, type: 'revenue', date: 'Feb 8', category: 'Pilots' },
    { id: 'el-6', description: 'Legal — terms of service review', amount: -2800, type: 'expense', date: 'Feb 5', category: 'Legal' },
    { id: 'el-7', description: 'SaaS subscription — Delta Co', amount: 4800, type: 'revenue', date: 'Feb 3', category: 'Subscriptions' },
    { id: 'el-8', description: 'Team offsite — Helena', amount: -4200, type: 'expense', date: 'Feb 1', category: 'Operations' },
  ],
};

// ── Church ───────────────────────────────────────────────────────────────
const CHURCH_FINANCE: OrgFinanceData = {
  kpis: [
    { id: 'ck-1', label: 'Tithes MTD', value: '$42K', delta: '+6%', deltaType: 'up' },
    { id: 'ck-2', label: 'Building Fund', value: '$185K', delta: '74% of goal', deltaType: 'neutral' },
    { id: 'ck-3', label: 'Missions Budget', value: '$28K', delta: 'On track', deltaType: 'neutral' },
    { id: 'ck-4', label: 'Operating', value: '$67K', delta: '-2%', deltaType: 'down' },
  ],
  rails: [
    { id: 'crr-1', name: 'Online Giving', icon: 'heart.fill', subtitle: 'Tithes, offerings & pledges', ctaLabel: 'Give' },
    { id: 'crr-2', name: 'Text-to-Give', icon: 'message.fill', subtitle: 'SMS giving setup', ctaLabel: 'Setup' },
  ],
  ledger: [
    { id: 'cl-1', description: 'Sunday tithes & offerings', amount: 14200, type: 'revenue', date: 'Feb 16', category: 'Tithes' },
    { id: 'cl-2', description: 'Utility bill — Main Campus', amount: -3800, type: 'expense', date: 'Feb 15', category: 'Utilities' },
    { id: 'cl-3', description: 'Online giving — weekly', amount: 6500, type: 'revenue', date: 'Feb 14', category: 'Offerings' },
    { id: 'cl-4', description: 'Worship equipment — sound board', amount: -4500, type: 'expense', date: 'Feb 12', category: 'Equipment' },
    { id: 'cl-5', description: 'Building fund pledge payments', amount: 8200, type: 'revenue', date: 'Feb 10', category: 'Building Fund' },
    { id: 'cl-6', description: 'Missions trip — Haiti supplies', amount: -2200, type: 'expense', date: 'Feb 8', category: 'Missions' },
    { id: 'cl-7', description: 'Sunday tithes & offerings', amount: 12800, type: 'revenue', date: 'Feb 9', category: 'Tithes' },
    { id: 'cl-8', description: 'Staff payroll — February', amount: -18500, type: 'expense', date: 'Feb 1', category: 'Payroll' },
  ],
};

// ── Education ────────────────────────────────────────────────────────────
const EDUCATION_FINANCE: OrgFinanceData = {
  kpis: [
    { id: 'edk-1', label: 'Tuition Revenue', value: '$2.8M', delta: '+9%', deltaType: 'up' },
    { id: 'edk-2', label: 'Financial Aid', value: '$1.1M', delta: '+15%', deltaType: 'up' },
    { id: 'edk-3', label: 'Endowment', value: '$4.6M', delta: '+3.2%', deltaType: 'up' },
    { id: 'edk-4', label: 'Operating Budget', value: '$5.2M', delta: 'On target', deltaType: 'neutral' },
  ],
  rails: [
    { id: 'edrr-1', name: 'Student Accounts', icon: 'person.crop.rectangle.fill', subtitle: 'Tuition & fee payments', ctaLabel: 'View' },
    { id: 'edrr-2', name: 'Financial Aid', icon: 'banknote.fill', subtitle: 'Scholarships & grants', ctaLabel: 'Review' },
  ],
  ledger: [
    { id: 'edl-1', description: 'Spring tuition — batch deposit', amount: 245000, type: 'revenue', date: 'Feb 15', category: 'Tuition' },
    { id: 'edl-2', description: 'Faculty payroll — February', amount: -128000, type: 'expense', date: 'Feb 14', category: 'Payroll' },
    { id: 'edl-3', description: 'Federal Pell Grant disbursement', amount: 62000, type: 'revenue', date: 'Feb 12', category: 'Financial Aid' },
    { id: 'edl-4', description: 'Library database subscription', amount: -18500, type: 'expense', date: 'Feb 10', category: 'Academic' },
    { id: 'edl-5', description: 'Alumni donation — annual fund', amount: 15000, type: 'revenue', date: 'Feb 8', category: 'Donations' },
    { id: 'edl-6', description: 'Campus maintenance contract', amount: -9200, type: 'expense', date: 'Feb 5', category: 'Facilities' },
    { id: 'edl-7', description: 'Student housing fees', amount: 34000, type: 'revenue', date: 'Feb 3', category: 'Housing' },
    { id: 'edl-8', description: 'IT infrastructure upgrade', amount: -22000, type: 'expense', date: 'Feb 1', category: 'Technology' },
  ],
};

// ── Community (KaNeXT) ─────────────────────────────────────────────────────
const COMMUNITY_FINANCE: OrgFinanceData = {
  kpis: [
    { id: 'kk-1', label: 'Prize Pool', value: '$250K', delta: 'Season 1', deltaType: 'neutral' },
    { id: 'kk-2', label: 'Sponsorship', value: '$180K', delta: '+3 deals', deltaType: 'up' },
    { id: 'kk-3', label: 'Entry Fees', value: '$96K', delta: '8 teams', deltaType: 'neutral' },
    { id: 'kk-4', label: 'Fines', value: '$4.2K', delta: '6 issued', deltaType: 'down' },
  ],
  rails: [
    { id: 'krr-1', name: 'Team Payments', icon: 'banknote.fill', subtitle: 'Entry fees & deposits', ctaLabel: 'Manage' },
    { id: 'krr-2', name: 'Prize Distribution', icon: 'trophy.fill', subtitle: 'Winnings & bonuses', ctaLabel: 'Review' },
  ],
  ledger: [
    { id: 'kl-1', description: 'Entry fee — Apex Racing', amount: 12000, type: 'revenue', date: 'Feb 15', category: 'Entry Fees' },
    { id: 'kl-2', description: 'Track rental — COTA Round 1', amount: -28000, type: 'expense', date: 'Feb 14', category: 'Venues' },
    { id: 'kl-3', description: 'Sponsorship — RedBull activation', amount: 45000, type: 'revenue', date: 'Feb 12', category: 'Sponsorship' },
    { id: 'kl-4', description: 'Safety equipment — barriers', amount: -8500, type: 'expense', date: 'Feb 10', category: 'Safety' },
    { id: 'kl-5', description: 'Entry fee — Ironclad Motorsport', amount: 12000, type: 'revenue', date: 'Feb 8', category: 'Entry Fees' },
    { id: 'kl-6', description: 'Broadcast production — test event', amount: -15000, type: 'expense', date: 'Feb 5', category: 'Broadcast' },
    { id: 'kl-7', description: 'Penalty fine — team APX', amount: 1200, type: 'revenue', date: 'Feb 3', category: 'Fines' },
    { id: 'kl-8', description: 'Medical team standby contract', amount: -6000, type: 'expense', date: 'Feb 1', category: 'Operations' },
  ],
};

export function getOrgFinance(mode: Mode): OrgFinanceData {
  switch (mode) {
    case 'sports': return SPORTS_FINANCE;
    case 'business': return BUSINESS_FINANCE;
    case 'church': return CHURCH_FINANCE;
    case 'education': return EDUCATION_FINANCE;
    case 'competition': return COMMUNITY_FINANCE;
    default: return { kpis: [], rails: [], ledger: [] };
  }
}
