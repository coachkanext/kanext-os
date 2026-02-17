/**
 * Mock Player Admin / Eligibility — keyed by FMU jersey number
 */

// =============================================================================
// TYPES
// =============================================================================

export type EligibilityStatus = 'clear' | 'pending' | 'hold' | 'expired';

export interface EligibilityItem {
  label: string;
  status: EligibilityStatus;
  note?: string;
}

export interface AidInfo {
  percent: number; // 0–100 scholarship percentage
  type: string; // 'Full Athletic', 'Partial', 'Academic', 'Walk-on'
  renewalDate?: string;
}

export interface NILInfo {
  status: 'active' | 'inactive' | 'pending';
  dealCount: number;
  valueBand: string; // e.g. '$5K–$10K', '$0', '$10K+'
  topDeal?: string;
}

export interface ComplianceHold {
  id: string;
  label: string;
  severity: 'low' | 'medium' | 'high';
  date: string;
  resolved: boolean;
}

export interface AdminRecord {
  eligibility: EligibilityItem[];
  aid: AidInfo;
  nil: NILInfo;
  complianceHolds: ComplianceHold[];
  gpa: number;
}

// =============================================================================
// DATA
// =============================================================================

const RECORDS: Record<string, AdminRecord> = {
  '4': {
    eligibility: [
      { label: 'NCAA Eligibility Center', status: 'clear' },
      { label: 'Academic Standing', status: 'clear' },
      { label: 'Transfer Portal Clearance', status: 'clear' },
      { label: 'Medical Clearance', status: 'clear' },
      { label: 'Drug Testing Compliance', status: 'clear' },
    ],
    aid: { percent: 100, type: 'Full Athletic', renewalDate: '2026-08-01' },
    nil: { status: 'active', dealCount: 3, valueBand: '$5K–$10K', topDeal: 'Local auto dealership' },
    complianceHolds: [],
    gpa: 3.4,
  },
  '5': {
    eligibility: [
      { label: 'NCAA Eligibility Center', status: 'clear' },
      { label: 'Academic Standing', status: 'clear' },
      { label: 'Transfer Portal Clearance', status: 'clear' },
      { label: 'Medical Clearance', status: 'clear' },
      { label: 'Drug Testing Compliance', status: 'clear' },
    ],
    aid: { percent: 100, type: 'Full Athletic', renewalDate: '2026-08-01' },
    nil: { status: 'active', dealCount: 2, valueBand: '$3K–$6K' },
    complianceHolds: [],
    gpa: 3.1,
  },
  '11': {
    eligibility: [
      { label: 'NCAA Eligibility Center', status: 'clear' },
      { label: 'Academic Standing', status: 'pending', note: 'GPA below 2.9 threshold — under review' },
      { label: 'Transfer Portal Clearance', status: 'clear' },
      { label: 'Medical Clearance', status: 'clear' },
      { label: 'Drug Testing Compliance', status: 'clear' },
    ],
    aid: { percent: 75, type: 'Partial Athletic', renewalDate: '2026-08-01' },
    nil: { status: 'active', dealCount: 1, valueBand: '$2K–$5K' },
    complianceHolds: [
      { id: 'ch-11-1', label: 'Academic review — GPA monitoring', severity: 'low', date: '2026-01-15', resolved: false },
    ],
    gpa: 2.8,
  },
  '10': {
    eligibility: [
      { label: 'NCAA Eligibility Center', status: 'clear' },
      { label: 'Academic Standing', status: 'hold', note: 'GPA 2.1 — academic probation' },
      { label: 'Transfer Portal Clearance', status: 'clear' },
      { label: 'Medical Clearance', status: 'pending', note: 'Ankle injury — awaiting clearance' },
      { label: 'Drug Testing Compliance', status: 'clear' },
    ],
    aid: { percent: 25, type: 'Partial Athletic' },
    nil: { status: 'inactive', dealCount: 0, valueBand: '$0' },
    complianceHolds: [
      { id: 'ch-10-1', label: 'Academic probation — must reach 2.5 GPA', severity: 'high', date: '2025-12-20', resolved: false },
    ],
    gpa: 2.1,
  },
  '12': {
    eligibility: [
      { label: 'NCAA Eligibility Center', status: 'clear' },
      { label: 'Academic Standing', status: 'clear' },
      { label: 'Redshirt Status', status: 'clear', note: 'Approved redshirt year' },
      { label: 'Medical Clearance', status: 'clear' },
      { label: 'Drug Testing Compliance', status: 'clear' },
    ],
    aid: { percent: 0, type: 'Walk-on' },
    nil: { status: 'inactive', dealCount: 0, valueBand: '$0' },
    complianceHolds: [],
    gpa: 3.6,
  },
};

// Default record for players without custom data
function makeDefaultRecord(jersey: string): AdminRecord {
  // Pull GPA from ROSTER_META if available; otherwise default
  return {
    eligibility: [
      { label: 'NCAA Eligibility Center', status: 'clear' },
      { label: 'Academic Standing', status: 'clear' },
      { label: 'Medical Clearance', status: 'clear' },
      { label: 'Drug Testing Compliance', status: 'clear' },
    ],
    aid: { percent: 0, type: 'Walk-on' },
    nil: { status: 'inactive', dealCount: 0, valueBand: '$0' },
    complianceHolds: [],
    gpa: 2.5,
  };
}

// =============================================================================
// EXPORT
// =============================================================================

export function getPlayerAdmin(jersey: string): AdminRecord {
  return RECORDS[jersey] ?? makeDefaultRecord(jersey);
}
