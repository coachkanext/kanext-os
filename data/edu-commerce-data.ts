/**
 * Education Commerce Data — Application fees, Catalog, Scholarships, FAFSA, Tuition
 */

import { buildCommerceChain, type PaymentChain } from './commerce-data';

// =============================================================================
// APPLICATION TYPES
// =============================================================================

export interface ApplicationType {
  id: string;
  label: string;
  fee: number;
  description: string;
  deadline: string;
  requirements: string;
}

export const APPLICATION_TYPES: ApplicationType[] = [
  { id: 'freshman', label: 'Freshman', fee: 25, description: 'First-time college students', deadline: 'May 1, 2026', requirements: 'HS transcript, SAT/ACT (optional), essay' },
  { id: 'transfer', label: 'Transfer', fee: 25, description: 'Students from another institution', deadline: 'Jun 1, 2026', requirements: 'College transcripts, min 2.0 GPA' },
  { id: 'graduate', label: 'Graduate', fee: 35, description: 'Master\'s and doctoral programs', deadline: 'Apr 15, 2026', requirements: 'Bachelor\'s degree, GRE/GMAT, letters of rec' },
  { id: 'international', label: 'International', fee: 50, description: 'Students outside the U.S.', deadline: 'Mar 15, 2026', requirements: 'TOEFL/IELTS, credential evaluation, I-20 docs' },
  { id: 'readmission', label: 'Readmission', fee: 15, description: 'Returning after absence', deadline: 'Rolling', requirements: 'Previous Howard University transcripts, good standing letter' },
];

// =============================================================================
// CATALOG SCHOOLS (groups ACADEMIC_PROGRAMS by school)
// =============================================================================

export interface CatalogSchool {
  id: string;
  name: string;
  departments: string[];
}

export const CATALOG_SCHOOLS: CatalogSchool[] = [
  { id: 'cas', name: 'School of Arts & Sciences', departments: ['Arts & Sciences'] },
  { id: 'cob', name: 'School of Business', departments: ['School of Business'] },
  { id: 'coe', name: 'School of Education', departments: ['School of Education'] },
  { id: 'chs', name: 'Health Sciences', departments: ['Health Sciences', 'Professional Studies'] },
];

// =============================================================================
// SCHOLARSHIPS
// =============================================================================

export interface Scholarship {
  id: string;
  name: string;
  amount: number;
  eligibility: string;
  deadline: string;
}

export const SCHOLARSHIPS: Scholarship[] = [
  { id: 'sch-01', name: 'Academic Excellence Award', amount: 5000, eligibility: '3.5+ GPA, full-time enrollment', deadline: 'Mar 15, 2026' },
  { id: 'sch-02', name: 'HBCU Legacy Scholarship', amount: 3000, eligibility: 'Child or grandchild of HBCU graduate', deadline: 'Apr 1, 2026' },
  { id: 'sch-03', name: 'Need-Based Grant', amount: 4000, eligibility: 'FAFSA EFC below $6,000', deadline: 'May 1, 2026' },
  { id: 'sch-04', name: 'Departmental Award', amount: 2000, eligibility: 'Declared major, faculty nomination', deadline: 'Rolling' },
];

// =============================================================================
// FAFSA
// =============================================================================

export const KaNeXT_FAFSA = {
  schoolCode: '001486',
  priority: 'Mar 1, 2026',
  final: 'Jun 30, 2026',
  steps: [
    'Create FSA ID at studentaid.gov',
    'Complete FAFSA at fafsa.gov',
    'Enter Howard University school code: 001486',
    'Submit tax documents if selected for verification',
    'Review and accept award letter',
  ],
};

// =============================================================================
// TUITION & FEES
// =============================================================================

export const TUITION_RATES = {
  perCreditHour: 480,
  perSemester: 7200,
  annual: 14400,
  fees: { technology: 150, activity: 100, lab: 200 },
  roomAndBoard: 9800,
  paymentPlans: [
    { id: 'full', label: 'Full Pay', description: 'Pay in full by start of semester' },
    { id: 'semester', label: 'Semester Plan', description: '2 equal payments per semester' },
    { id: 'monthly', label: 'Monthly Plan', description: '10 monthly installments' },
  ],
};

// =============================================================================
// COMMERCE CHAIN BUILDER
// =============================================================================

export function buildEduCommerceChain(type: string, amount: number, description: string, prefix: string): PaymentChain {
  const chain = buildCommerceChain(type, amount, description, prefix);
  const settlement = chain.chain.find((s) => s.stage === 'Settlement');
  if (settlement) settlement.detail = 'Funds settled to Howard University Finance Office';
  return chain;
}
