/**
 * Business Organization Entities v2 — Mock Data & Types
 * Health-centric entity model with traffic-light governance, finance, rails, compliance.
 * 8 seeded entities, ~50 requirements, ~25 activity events.
 */

import type { BizEntityType, EntityHealth, CrossTabLink, TrafficLight, EntityStatus, SnapshotMetrics } from '@/data/biz-org-shared-types';
import {
  KANEXT_HOLDCO,
  KANEXT_OPSCO,
  KANEXT_IP,
  SPONSOR_BANK,
  PAYMENT_PROCESSOR,
  SLIEMA_WANDERERS,
  TARGET_BANK,
  SEEDED_ENTITY_NAMES,
  SEEDED_ENTITY_TYPES,
} from '@/data/biz-org-shared-types';

// =============================================================================
// TYPES
// =============================================================================

export interface BizEntity {
  id: string;
  name: string;
  type: BizEntityType;
  status: 'active' | 'inactive' | 'pending' | 'dissolved';
  entityStatus: EntityStatus;
  health: EntityHealth;
  parentId?: string;
  childIds: string[];
  nextAction: string;
  nextRequiredAction: string;
  lastActivity: string;
  owner: string;
  lastUpdated: string;
  pinnedDefault?: boolean;
  snapshot: SnapshotMetrics;
  crossTabLinks: CrossTabLink[];
}

export interface EntityRequirement {
  id: string;
  entityId: string;
  category: 'formation' | 'compliance' | 'finance' | 'ops';
  label: string;
  completed: boolean;
  detail: string;
}

export interface EntityActivityEvent {
  id: string;
  entityId: string;
  entityName: string;
  action: string;
  actor: string;
  timestamp: string;
  linkedTab?: string;
}

// =============================================================================
// SEEDED ENTITIES
// =============================================================================

const ENTITIES: BizEntity[] = [
  // 1. KaNeXT HoldCo
  {
    id: KANEXT_HOLDCO,
    name: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    type: SEEDED_ENTITY_TYPES[KANEXT_HOLDCO],
    status: 'active',
    entityStatus: 'active',
    health: {
      governance: 'green',
      finance: 'green',
      rails: 'green',
      compliance: 'yellow',
    },
    parentId: undefined,
    childIds: [KANEXT_OPSCO, KANEXT_IP],
    nextAction: 'Annual compliance filing due Mar 15',
    nextRequiredAction: 'File Delaware annual report by Mar 1 — compliance yellow',
    lastActivity: '2026-02-14',
    owner: 'Alex Morgan',
    lastUpdated: '2026-02-14',
    pinnedDefault: true,
    snapshot: { moneyIn30d: 285000, moneyOut30d: 142000, exceptions: 0, docsComplete: 12, docsMissing: 2, peopleFilled: 8, peopleGaps: 0, activeDeals: 1 },
    crossTabLinks: [
      { targetTab: 'compliance', targetSubTab: 'filings', targetId: 'cpl-holdco-annual', label: 'Annual Filing' },
      { targetTab: 'finance', targetSubTab: 'accounts', targetId: 'fin-holdco-opex', label: 'HoldCo Operating Account' },
      { targetTab: 'legal', targetSubTab: 'contracts', targetId: 'leg-holdco-charter', label: 'Corporate Charter' },
    ],
  },
  // 2. KaNeXT OpsCo
  {
    id: KANEXT_OPSCO,
    name: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    type: SEEDED_ENTITY_TYPES[KANEXT_OPSCO],
    status: 'active',
    entityStatus: 'active',
    health: {
      governance: 'green',
      finance: 'green',
      rails: 'green',
      compliance: 'green',
    },
    parentId: KANEXT_HOLDCO,
    childIds: [],
    nextAction: 'Q1 board package due Feb 28',
    nextRequiredAction: 'Submit Q1 board package by Feb 28',
    lastActivity: '2026-02-15',
    owner: 'Alex Morgan',
    lastUpdated: '2026-02-15',
    pinnedDefault: true,
    snapshot: { moneyIn30d: 520000, moneyOut30d: 385000, exceptions: 0, docsComplete: 18, docsMissing: 0, peopleFilled: 28, peopleGaps: 2, activeDeals: 0 },
    crossTabLinks: [
      { targetTab: 'operations', targetSubTab: 'workflows', targetId: 'ops-opsco-onboard', label: 'Onboarding Workflow' },
      { targetTab: 'people', targetSubTab: 'roster', targetId: 'ppl-opsco-team', label: 'OpsCo Team Roster' },
      { targetTab: 'finance', targetSubTab: 'budgets', targetId: 'fin-opsco-budget', label: 'OpsCo Budget' },
    ],
  },
  // 3. KaNeXT IP / Products
  {
    id: KANEXT_IP,
    name: SEEDED_ENTITY_NAMES[KANEXT_IP],
    type: SEEDED_ENTITY_TYPES[KANEXT_IP],
    status: 'active',
    entityStatus: 'active',
    health: {
      governance: 'yellow',
      finance: 'green',
      rails: 'green',
      compliance: 'green',
    },
    parentId: KANEXT_HOLDCO,
    childIds: [],
    nextAction: 'IP assignment review with counsel',
    nextRequiredAction: 'Complete IP assignment for 2 new contractors — governance yellow',
    lastActivity: '2026-02-12',
    owner: 'Rachel Kim',
    lastUpdated: '2026-02-12',
    snapshot: { moneyIn30d: 45000, moneyOut30d: 12000, exceptions: 0, docsComplete: 9, docsMissing: 2, peopleFilled: 3, peopleGaps: 0, activeDeals: 0 },
    crossTabLinks: [
      { targetTab: 'assets', targetSubTab: 'ip', targetId: 'ast-ip-portfolio', label: 'IP Portfolio' },
      { targetTab: 'legal', targetSubTab: 'ip', targetId: 'leg-ip-assign', label: 'IP Assignment Agreements' },
      { targetTab: 'compliance', targetSubTab: 'licenses', targetId: 'cpl-ip-lic', label: 'Licensing Compliance' },
    ],
  },
  // 4. Sponsor Bank
  {
    id: SPONSOR_BANK,
    name: SEEDED_ENTITY_NAMES[SPONSOR_BANK],
    type: SEEDED_ENTITY_TYPES[SPONSOR_BANK],
    status: 'active',
    entityStatus: 'active',
    health: {
      governance: 'green',
      finance: 'green',
      rails: 'green',
      compliance: 'green',
    },
    parentId: undefined,
    childIds: [],
    nextAction: 'Quarterly partner review call',
    nextRequiredAction: 'Schedule quarterly review call by Mar 15',
    lastActivity: '2026-02-10',
    owner: 'Tom Bradley',
    lastUpdated: '2026-02-10',
    snapshot: { moneyIn30d: 0, moneyOut30d: 8500, exceptions: 0, docsComplete: 7, docsMissing: 0, peopleFilled: 2, peopleGaps: 0, activeDeals: 0 },
    crossTabLinks: [
      { targetTab: 'payment-rails', targetSubTab: 'banks', targetId: 'pr-sponsor-main', label: 'Sponsor Bank Rail Config' },
      { targetTab: 'finance', targetSubTab: 'accounts', targetId: 'fin-sponsor-acct', label: 'Sponsor Bank Accounts' },
    ],
  },
  // 5. Payment Processor
  {
    id: PAYMENT_PROCESSOR,
    name: SEEDED_ENTITY_NAMES[PAYMENT_PROCESSOR],
    type: SEEDED_ENTITY_TYPES[PAYMENT_PROCESSOR],
    status: 'active',
    entityStatus: 'active',
    health: {
      governance: 'green',
      finance: 'green',
      rails: 'yellow',
      compliance: 'green',
    },
    parentId: undefined,
    childIds: [],
    nextAction: 'PCI-DSS recertification by Mar 31',
    nextRequiredAction: 'Complete PCI-DSS SAQ-D by Mar 31 — rails yellow',
    lastActivity: '2026-02-08',
    owner: 'Maya Rodriguez',
    lastUpdated: '2026-02-08',
    snapshot: { moneyIn30d: 0, moneyOut30d: 24000, exceptions: 1, docsComplete: 5, docsMissing: 1, peopleFilled: 1, peopleGaps: 0, activeDeals: 0 },
    crossTabLinks: [
      { targetTab: 'payment-rails', targetSubTab: 'processors', targetId: 'pr-processor-main', label: 'Processor Configuration' },
      { targetTab: 'compliance', targetSubTab: 'certifications', targetId: 'cpl-pci-dss', label: 'PCI-DSS Certification' },
    ],
  },
  // 6. Sliema Wanderers FC
  {
    id: SLIEMA_WANDERERS,
    name: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
    type: SEEDED_ENTITY_TYPES[SLIEMA_WANDERERS],
    status: 'active',
    entityStatus: 'flagged',
    health: {
      governance: 'green',
      finance: 'green',
      rails: 'green',
      compliance: 'red',
    },
    parentId: undefined,
    childIds: [],
    nextAction: 'Malta FA compliance docs overdue',
    nextRequiredAction: 'Submit Malta FA licensing docs — OVERDUE since Jan 31 — compliance red',
    lastActivity: '2026-02-05',
    owner: 'Rachel Kim',
    lastUpdated: '2026-02-05',
    snapshot: { moneyIn30d: 15000, moneyOut30d: 68000, exceptions: 2, docsComplete: 4, docsMissing: 3, peopleFilled: 4, peopleGaps: 1, activeDeals: 0 },
    crossTabLinks: [
      { targetTab: 'compliance', targetSubTab: 'international', targetId: 'cpl-malta-fa', label: 'Malta FA Filing' },
      { targetTab: 'legal', targetSubTab: 'contracts', targetId: 'leg-sliema-opa', label: 'Operating Agreement' },
      { targetTab: 'people', targetSubTab: 'roster', targetId: 'ppl-sliema-squad', label: 'Squad Roster' },
    ],
  },
  // 8. Target Bank (Acquisition)
  {
    id: TARGET_BANK,
    name: SEEDED_ENTITY_NAMES[TARGET_BANK],
    type: SEEDED_ENTITY_TYPES[TARGET_BANK],
    status: 'pending',
    entityStatus: 'under_evaluation',
    health: {
      governance: 'red',
      finance: 'yellow',
      rails: 'red',
      compliance: 'yellow',
    },
    parentId: undefined,
    childIds: [],
    nextAction: 'OCC charter approval pending',
    nextRequiredAction: 'Await OCC charter approval — governance & rails red, finance & compliance yellow',
    lastActivity: '2026-02-16',
    owner: 'Alex Morgan',
    lastUpdated: '2026-02-16',
    snapshot: { moneyIn30d: 0, moneyOut30d: 75000, exceptions: 3, docsComplete: 3, docsMissing: 5, peopleFilled: 2, peopleGaps: 4, activeDeals: 1 },
    crossTabLinks: [
      { targetTab: 'compliance', targetSubTab: 'regulators', targetId: 'cpl-occ-charter', label: 'OCC Charter App' },
      { targetTab: 'finance', targetSubTab: 'fundraising', targetId: 'fin-target-capplan', label: 'Capital Plan' },
      { targetTab: 'payment-rails', targetSubTab: 'banks', targetId: 'pr-target-setup', label: 'Rail Setup Plan' },
      { targetTab: 'legal', targetSubTab: 'm&a', targetId: 'leg-target-loi', label: 'Letter of Intent' },
    ],
  },
];

// =============================================================================
// REQUIREMENTS (~50 items)
// =============================================================================

const REQUIREMENTS: EntityRequirement[] = [
  // --- KaNeXT HoldCo (7) ---
  { id: 'req-hc-01', entityId: KANEXT_HOLDCO, category: 'formation', label: 'Certificate of Incorporation filed', completed: true, detail: 'Delaware SoS — filed Jan 2022, active status confirmed.' },
  { id: 'req-hc-02', entityId: KANEXT_HOLDCO, category: 'formation', label: 'EIN obtained from IRS', completed: true, detail: 'EIN 84-1234567 issued. Used for all federal filings.' },
  { id: 'req-hc-03', entityId: KANEXT_HOLDCO, category: 'compliance', label: 'Annual franchise tax paid', completed: true, detail: 'Delaware franchise tax of $2,500 paid Feb 2026.' },
  { id: 'req-hc-04', entityId: KANEXT_HOLDCO, category: 'compliance', label: 'Annual report filed with SoS', completed: false, detail: 'Delaware annual report due March 1. Filing in progress.' },
  { id: 'req-hc-05', entityId: KANEXT_HOLDCO, category: 'finance', label: 'Consolidated financial statements', completed: true, detail: 'FY 2025 financials audited by Deloitte, filed Feb 2026.' },
  { id: 'req-hc-06', entityId: KANEXT_HOLDCO, category: 'ops', label: 'Board meeting schedule confirmed', completed: true, detail: 'Quarterly board meetings scheduled through Q4 2026.' },
  { id: 'req-hc-07', entityId: KANEXT_HOLDCO, category: 'compliance', label: 'Beneficial ownership report (BOI)', completed: false, detail: 'FinCEN BOI report due for 2026 — awaiting updated ownership records.' },

  // --- KaNeXT OpsCo (6) ---
  { id: 'req-oc-01', entityId: KANEXT_OPSCO, category: 'formation', label: 'LLC formation certificate', completed: true, detail: 'Delaware LLC formed Jun 2023. Certificate on file.' },
  { id: 'req-oc-02', entityId: KANEXT_OPSCO, category: 'formation', label: 'Operating agreement executed', completed: true, detail: 'Single-member LLC operating agreement signed by HoldCo.' },
  { id: 'req-oc-03', entityId: KANEXT_OPSCO, category: 'compliance', label: 'Workers compensation insurance', completed: true, detail: 'State Farm policy active through Dec 2026. Covers all 28 employees.' },
  { id: 'req-oc-04', entityId: KANEXT_OPSCO, category: 'finance', label: 'Payroll system configured', completed: true, detail: 'Gusto payroll active. Semi-monthly pay schedule. Direct deposit enabled.' },
  { id: 'req-oc-05', entityId: KANEXT_OPSCO, category: 'ops', label: 'IT infrastructure audit', completed: true, detail: 'SOC 2 prep audit completed Dec 2025. No critical findings.' },
  { id: 'req-oc-06', entityId: KANEXT_OPSCO, category: 'ops', label: 'Employee handbook updated', completed: true, detail: 'V3 handbook published Jan 2026 with updated PTO and remote work policies.' },

  // --- KaNeXT IP / Products (7) ---
  { id: 'req-ip-01', entityId: KANEXT_IP, category: 'formation', label: 'IP holding entity formed', completed: true, detail: 'Delaware LLC established to hold all intellectual property assets.' },
  { id: 'req-ip-02', entityId: KANEXT_IP, category: 'formation', label: 'Trademark registrations filed', completed: true, detail: 'KaNeXT word mark and logo registered in US, EU, and UK.' },
  { id: 'req-ip-03', entityId: KANEXT_IP, category: 'compliance', label: 'Patent portfolio review', completed: true, detail: 'Annual patent review completed. 3 provisional patents on file.' },
  { id: 'req-ip-04', entityId: KANEXT_IP, category: 'compliance', label: 'IP assignment agreements', completed: false, detail: 'Pending updated assignment for 2 new contractors hired in Q1 2026.' },
  { id: 'req-ip-05', entityId: KANEXT_IP, category: 'finance', label: 'Licensing revenue reconciliation', completed: true, detail: 'All licensing revenue properly allocated between entities.' },
  { id: 'req-ip-06', entityId: KANEXT_IP, category: 'ops', label: 'Domain and digital asset inventory', completed: true, detail: '47 domains, 12 app store listings, and 8 social accounts catalogued.' },
  { id: 'req-ip-07', entityId: KANEXT_IP, category: 'formation', label: 'Board resolution for IP governance', completed: false, detail: 'Draft resolution for IP governance committee awaiting board vote.' },

  // --- Sponsor Bank (5) ---
  { id: 'req-sb-01', entityId: SPONSOR_BANK, category: 'formation', label: 'Partnership agreement executed', completed: true, detail: 'Master services agreement signed Nov 2024. 3-year term.' },
  { id: 'req-sb-02', entityId: SPONSOR_BANK, category: 'compliance', label: 'KYC/AML documentation submitted', completed: true, detail: 'Full KYC package submitted and approved by Sponsor Bank compliance.' },
  { id: 'req-sb-03', entityId: SPONSOR_BANK, category: 'finance', label: 'Operating account funded', completed: true, detail: 'Primary operating account funded with initial $500K deposit.' },
  { id: 'req-sb-04', entityId: SPONSOR_BANK, category: 'ops', label: 'API integration testing', completed: true, detail: 'Core banking API integration tested and certified. Production live.' },
  { id: 'req-sb-05', entityId: SPONSOR_BANK, category: 'compliance', label: 'Annual partner compliance review', completed: true, detail: 'Annual compliance review passed Dec 2025. Next review Dec 2026.' },

  // --- Payment Processor (6) ---
  { id: 'req-pp-01', entityId: PAYMENT_PROCESSOR, category: 'formation', label: 'Processor agreement signed', completed: true, detail: 'Payment processing agreement executed Apr 2024. Auto-renew.' },
  { id: 'req-pp-02', entityId: PAYMENT_PROCESSOR, category: 'compliance', label: 'PCI-DSS Level 1 compliance', completed: false, detail: 'Annual PCI-DSS recertification due Mar 31, 2026. SAQ-D in progress.' },
  { id: 'req-pp-03', entityId: PAYMENT_PROCESSOR, category: 'finance', label: 'Fee schedule review', completed: true, detail: 'Negotiated rate: 2.7% + $0.30 per transaction. Volume discount tier active.' },
  { id: 'req-pp-04', entityId: PAYMENT_PROCESSOR, category: 'ops', label: 'Webhook endpoints configured', completed: true, detail: 'Real-time webhooks for payment events, disputes, and refunds active.' },
  { id: 'req-pp-05', entityId: PAYMENT_PROCESSOR, category: 'ops', label: 'Failover processor configured', completed: false, detail: 'Secondary processor integration pending for disaster recovery.' },
  { id: 'req-pp-06', entityId: PAYMENT_PROCESSOR, category: 'compliance', label: 'Dispute resolution SLA signed', completed: true, detail: '48-hour response SLA for chargeback disputes. Signed Jan 2025.' },

  // --- Sliema Wanderers FC (7) ---
  { id: 'req-sw-01', entityId: SLIEMA_WANDERERS, category: 'formation', label: 'Ownership stake registered', completed: true, detail: 'Minority ownership stake registered with League Association.' },
  { id: 'req-sw-02', entityId: SLIEMA_WANDERERS, category: 'formation', label: 'Operating agreement signed', completed: true, detail: 'Multi-party operating agreement governing club operations.' },
  { id: 'req-sw-03', entityId: SLIEMA_WANDERERS, category: 'compliance', label: 'Malta FA annual license', completed: false, detail: 'Club licensing documentation overdue. Malta FA deadline was Jan 31.' },
  { id: 'req-sw-04', entityId: SLIEMA_WANDERERS, category: 'compliance', label: 'UEFA Financial Fair Play submission', completed: false, detail: 'FFP documentation for 2025-26 season pending financial auditor sign-off.' },
  { id: 'req-sw-05', entityId: SLIEMA_WANDERERS, category: 'finance', label: 'Transfer budget approved', completed: true, detail: 'Summer 2026 transfer budget of EUR 350K approved by board.' },
  { id: 'req-sw-06', entityId: SLIEMA_WANDERERS, category: 'ops', label: 'Stadium lease renewed', completed: true, detail: 'Ta Qali National Stadium lease renewed through 2028 season.' },
  { id: 'req-sw-07', entityId: SLIEMA_WANDERERS, category: 'compliance', label: 'Player registration compliance', completed: false, detail: '2 squad members missing updated registration forms with Malta FA.' },

  // --- Target Bank (Acquisition) (8) ---
  { id: 'req-tb-01', entityId: TARGET_BANK, category: 'formation', label: 'Letter of Intent executed', completed: true, detail: 'Non-binding LOI signed Dec 2025. Exclusivity period through Apr 2026.' },
  { id: 'req-tb-02', entityId: TARGET_BANK, category: 'formation', label: 'OCC charter application filed', completed: false, detail: 'De novo bank charter application submitted to OCC. Awaiting review.' },
  { id: 'req-tb-03', entityId: TARGET_BANK, category: 'formation', label: 'FDIC insurance application', completed: false, detail: 'FDIC deposit insurance application in preparation. Due after OCC approval.' },
  { id: 'req-tb-04', entityId: TARGET_BANK, category: 'compliance', label: 'BSA/AML program design', completed: false, detail: 'Bank Secrecy Act and AML compliance program framework in development.' },
  { id: 'req-tb-05', entityId: TARGET_BANK, category: 'compliance', label: 'CRA plan submitted', completed: false, detail: 'Community Reinvestment Act plan required as part of charter application.' },
  { id: 'req-tb-06', entityId: TARGET_BANK, category: 'finance', label: 'Capital plan approved', completed: false, detail: 'Initial capitalization plan of $15M requires board and regulator approval.' },
  { id: 'req-tb-07', entityId: TARGET_BANK, category: 'finance', label: 'Pro forma financials prepared', completed: true, detail: '3-year pro forma P&L, balance sheet, and cash flow completed.' },
  { id: 'req-tb-08', entityId: TARGET_BANK, category: 'ops', label: 'Core banking vendor selected', completed: false, detail: 'RFP issued to 4 core banking vendors. Evaluation committee reviewing demos.' },
];

// =============================================================================
// ACTIVITY EVENTS (~25 items)
// =============================================================================

const ACTIVITY_EVENTS: EntityActivityEvent[] = [
  {
    id: 'evt-01',
    entityId: TARGET_BANK,
    entityName: SEEDED_ENTITY_NAMES[TARGET_BANK],
    action: 'OCC charter application submitted for regulatory review',
    actor: 'Rachel Kim',
    timestamp: '2026-02-16 14:30',
    linkedTab: 'compliance',
  },
  {
    id: 'evt-02',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    action: 'Q1 2026 board package draft uploaded for review',
    actor: 'Alex Morgan',
    timestamp: '2026-02-15 16:45',
    linkedTab: 'reports',
  },
  {
    id: 'evt-03',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    action: 'Delaware franchise tax payment of $2,500 processed',
    actor: 'Jordan Blake',
    timestamp: '2026-02-14 10:20',
    linkedTab: 'finance',
  },
  {
    id: 'evt-04',
    entityId: KANEXT_IP,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    action: 'Updated IP assignment agreement sent to new contractors',
    actor: 'Rachel Kim',
    timestamp: '2026-02-12 11:00',
    linkedTab: 'legal',
  },
  {
    id: 'evt-05',
    entityId: SPONSOR_BANK,
    entityName: SEEDED_ENTITY_NAMES[SPONSOR_BANK],
    action: 'Quarterly partner compliance review completed successfully',
    actor: 'Tom Bradley',
    timestamp: '2026-02-10 15:30',
    linkedTab: 'compliance',
  },
  {
    id: 'evt-06',
    entityId: PAYMENT_PROCESSOR,
    entityName: SEEDED_ENTITY_NAMES[PAYMENT_PROCESSOR],
    action: 'PCI-DSS self-assessment questionnaire started',
    actor: 'Maya Rodriguez',
    timestamp: '2026-02-08 09:15',
    linkedTab: 'compliance',
  },
  {
    id: 'evt-08',
    entityId: SLIEMA_WANDERERS,
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
    action: 'Malta FA sent compliance deadline extension request',
    actor: 'Rachel Kim',
    timestamp: '2026-02-05 12:30',
    linkedTab: 'compliance',
  },
  {
    id: 'evt-09',
    entityId: TARGET_BANK,
    entityName: SEEDED_ENTITY_NAMES[TARGET_BANK],
    action: 'Pro forma 3-year financial model finalized by finance team',
    actor: 'Jordan Blake',
    timestamp: '2026-02-04 17:00',
    linkedTab: 'finance',
  },
  {
    id: 'evt-10',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    action: 'Board of Directors approved 2026 strategic plan',
    actor: 'Alex Morgan',
    timestamp: '2026-02-03 10:00',
    linkedTab: 'operations',
  },
  {
    id: 'evt-11',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    action: 'Employee handbook V3 published and distributed to all staff',
    actor: 'Tom Bradley',
    timestamp: '2026-02-01 09:00',
    linkedTab: 'people',
  },
  {
    id: 'evt-12',
    entityId: KANEXT_IP,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    action: 'EU trademark registration approved — certificate received',
    actor: 'Rachel Kim',
    timestamp: '2026-01-30 14:15',
    linkedTab: 'assets',
  },
  {
    id: 'evt-13',
    entityId: SLIEMA_WANDERERS,
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
    action: 'Summer 2026 transfer budget of EUR 350K approved',
    actor: 'Alex Morgan',
    timestamp: '2026-01-28 16:00',
    linkedTab: 'finance',
  },
  {
    id: 'evt-14',
    entityId: PAYMENT_PROCESSOR,
    entityName: SEEDED_ENTITY_NAMES[PAYMENT_PROCESSOR],
    action: 'Webhook endpoint monitoring dashboard deployed',
    actor: 'Maya Rodriguez',
    timestamp: '2026-01-27 11:30',
    linkedTab: 'operations',
  },
  {
    id: 'evt-16',
    entityId: TARGET_BANK,
    entityName: SEEDED_ENTITY_NAMES[TARGET_BANK],
    action: 'Core banking vendor RFP issued to 4 shortlisted providers',
    actor: 'Tom Bradley',
    timestamp: '2026-01-23 10:00',
    linkedTab: 'operations',
  },
  {
    id: 'evt-17',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    action: 'FY 2025 consolidated financials signed off by Deloitte',
    actor: 'Jordan Blake',
    timestamp: '2026-01-20 15:00',
    linkedTab: 'finance',
  },
  {
    id: 'evt-18',
    entityId: SPONSOR_BANK,
    entityName: SEEDED_ENTITY_NAMES[SPONSOR_BANK],
    action: 'Core banking API integration certified for production',
    actor: 'Maya Rodriguez',
    timestamp: '2026-01-18 14:00',
    linkedTab: 'payment-rails',
  },
  {
    id: 'evt-19',
    entityId: KANEXT_IP,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    action: 'Domain and digital asset inventory completed — 47 domains catalogued',
    actor: 'Kai Patel',
    timestamp: '2026-01-15 11:00',
    linkedTab: 'assets',
  },
  {
    id: 'evt-20',
    entityId: SLIEMA_WANDERERS,
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
    action: 'Stadium lease renewed with Ta Qali through 2028 season',
    actor: 'Tom Bradley',
    timestamp: '2026-01-12 09:30',
    linkedTab: 'legal',
  },
  {
    id: 'evt-21',
    entityId: TARGET_BANK,
    entityName: SEEDED_ENTITY_NAMES[TARGET_BANK],
    action: 'BSA/AML compliance program framework kickoff meeting held',
    actor: 'Rachel Kim',
    timestamp: '2026-01-10 10:00',
    linkedTab: 'compliance',
  },
  {
    id: 'evt-22',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    action: 'SOC 2 Type II prep audit completed — no critical findings',
    actor: 'Maya Rodriguez',
    timestamp: '2026-01-08 16:30',
    linkedTab: 'compliance',
  },
  {
    id: 'evt-24',
    entityId: TARGET_BANK,
    entityName: SEEDED_ENTITY_NAMES[TARGET_BANK],
    action: 'Non-binding Letter of Intent signed with exclusivity clause',
    actor: 'Alex Morgan',
    timestamp: '2025-12-20 11:00',
    linkedTab: 'legal',
  },
  {
    id: 'evt-25',
    entityId: PAYMENT_PROCESSOR,
    entityName: SEEDED_ENTITY_NAMES[PAYMENT_PROCESSOR],
    action: 'Dispute resolution SLA agreement signed — 48hr response time',
    actor: 'Rachel Kim',
    timestamp: '2025-12-15 14:30',
    linkedTab: 'legal',
  },
];

// =============================================================================
// LOOKUP HELPERS
// =============================================================================

export function getEntityById(id: string): BizEntity | undefined {
  return ENTITIES.find((e) => e.id === id);
}

export function getRequirementsByEntity(entityId: string): EntityRequirement[] {
  return REQUIREMENTS.filter((r) => r.entityId === entityId);
}

export function getCompletionPct(entityId: string): number {
  const reqs = REQUIREMENTS.filter((r) => r.entityId === entityId);
  if (reqs.length === 0) return 100;
  const completed = reqs.filter((r) => r.completed).length;
  return Math.round((completed / reqs.length) * 100);
}

// =============================================================================
// MAIN DATA ACCESSOR
// =============================================================================

export function getBizEntitiesData() {
  return {
    entities: ENTITIES,
    requirements: REQUIREMENTS,
    activityEvents: ACTIVITY_EVENTS,
  };
}
