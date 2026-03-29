/**
 * Education Commerce Data — Application fees, Catalog, Tuition
 * Lincoln University Oakland
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
  {
    id: 'undergraduate',
    label: 'Undergraduate',
    fee: 95,
    description: 'BA in Business Administration or BS in Diagnostic Medical Sonography',
    deadline: 'Rolling',
    requirements: 'HS transcript or equivalent, English proficiency (international students)',
  },
  {
    id: 'graduate',
    label: 'Graduate',
    fee: 95,
    description: 'MBA, MS in International Business & Finance Management, MS in Finance, or DBA',
    deadline: 'Rolling',
    requirements: "Bachelor's degree, transcripts, personal statement, two letters of recommendation",
  },
  {
    id: 'international',
    label: 'International',
    fee: 95,
    description: 'All degree programs — international students from outside the U.S.',
    deadline: 'Rolling',
    requirements: 'Credential evaluation (WES or equivalent), TOEFL/IELTS, I-20 documentation, financial certification',
  },
  {
    id: 'esl',
    label: 'English Language Program',
    fee: 95,
    description: 'Intensive English for students preparing for degree-level study',
    deadline: 'Rolling',
    requirements: 'Passport copy, placement test',
  },
];

// =============================================================================
// CATALOG SCHOOLS
// =============================================================================

export interface CatalogSchool {
  id: string;
  name: string;
  departments: string[];
}

export const CATALOG_SCHOOLS: CatalogSchool[] = [
  { id: 'bus', name: 'Business Programs', departments: ['Business Programs'] },
  { id: 'di', name: 'Diagnostic Imaging', departments: ['Diagnostic Imaging'] },
  { id: 'grad', name: 'Graduate Programs', departments: ['Business Programs'] },
  { id: 'esl', name: 'English Language Program', departments: ['ESL'] },
];

// =============================================================================
// FINANCIAL AID NOTICE
// =============================================================================

/**
 * Lincoln University does NOT participate in Title IV federal student aid.
 * Students cannot receive Pell Grants or federal student loans.
 * The institution offers limited institutional cost-of-attendance support
 * from its own funds for students demonstrating greatest financial need.
 */
export const FINANCIAL_AID_NOTICE = {
  titleIVEligible: false,
  fafsaRequired: false,
  fafsaCode: null,
  note: 'Lincoln University does not participate in Title IV federal student aid programs. No Pell Grants or federal student loans are available. Contact the Admissions office at admissions@lincolnuca.edu for information about institutional cost-of-attendance support.',
  contact: 'admissions@lincolnuca.edu',
  phone: '(510) 628-8010',
};

// =============================================================================
// TUITION & FEES — 2024-2025 (IPEDS confirmed)
// =============================================================================

export const TUITION_RATES = {
  undergraduate: {
    perCreditHour: 525,
    annual: 13150,
    applicationFee: 95,
  },
  graduate: {
    perCreditHour: 595,
    annual: 10710,
    fees: 550,
    applicationFee: 95,
  },
  estimatedCOA: {
    offCampus: 24200,
    withFamily: 15200,
    booksSupplies: 850,
    housingEstimate: 8400,   // off-campus Alameda area, ~$900/mo × 9 months
    otherExpenses: 1800,
  },
  paymentPlans: [
    { id: 'full', label: 'Full Pay', description: 'Pay in full by start of semester' },
    { id: 'semester', label: 'Semester Plan', description: '2 equal payments per semester' },
    { id: 'monthly', label: 'Monthly Plan', description: 'Monthly installments during term' },
  ],
};

// =============================================================================
// COMMERCE CHAIN BUILDER
// =============================================================================

export function buildEduCommerceChain(type: string, amount: number, description: string, prefix: string): PaymentChain {
  const chain = buildCommerceChain(type, amount, description, prefix);
  const settlement = chain.chain.find((s) => s.stage === 'Settlement');
  if (settlement) settlement.detail = 'Funds settled to Lincoln University Finance Office';
  return chain;
}
