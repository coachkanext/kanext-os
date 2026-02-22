/**
 * Sponsors Hub v2 — Mock Data
 * Sports-only sponsor data for the Organization tab.
 * Manages sponsorships, contracts, inventory, fulfillment, invoicing, and brand assets.
 */

// =============================================================================
// TYPES
// =============================================================================

export type SponsorsTabId =
  | 'dashboard'
  | 'sponsors'
  | 'packages'
  | 'inventory'
  | 'contracts'
  | 'fulfillment'
  | 'assets'
  | 'invoicing'
  | 'reports'
  | 'audit'
  | 'settings';

export interface SponsorsTab {
  id: SponsorsTabId;
  label: string;
}

export interface SponsorsScopeChip {
  key: string;
  label: string;
}

export type SponsorStatus = 'prospect' | 'active' | 'paused' | 'completed' | 'archived';

export type ContractStatus = 'draft' | 'sent' | 'signed' | 'active' | 'completed' | 'archived';

export type FulfillmentStatus = 'pending' | 'delivered' | 'verified' | 'missed';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export type InventoryCategory =
  | 'jersey-apparel'
  | 'venue-signage'
  | 'digital-social'
  | 'replay-video'
  | 'broadcast-stream'
  | 'events'
  | 'hospitality'
  | 'website-app'
  | 'custom';

export type PackageTier =
  | 'title'
  | 'platinum'
  | 'gold'
  | 'silver'
  | 'bronze'
  | 'local-partner';

export interface SponsorDashboardBlock {
  id: string;
  label: string;
  value: string;
  status: 'good' | 'warning' | 'critical';
  detail?: string;
}

export interface SponsorQuickAction {
  id: string;
  label: string;
  icon: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logoInitials: string;
  logoColor: string;
  tier?: PackageTier;
  status: SponsorStatus;
  contractWindow?: string;
  primaryContact: string;
  primaryEmail: string;
  primaryPhone?: string;
  value: number;
  scope: string;
}

export interface SponsorPackage {
  id: string;
  name: string;
  tier: PackageTier;
  price: string;
  includedDeliverables: string[];
  termLength: string;
  maxCount: number;
  currentCount: number;
  approvalRequired: boolean;
}

export interface InventorySlot {
  id: string;
  name: string;
  category: InventoryCategory;
  unitScope: string;
  quantityAvailable: number;
  quantitySold: number;
  priceGuidance: string;
  duration: string;
  rules?: string;
  soldTo?: string;
}

export interface SponsorContract {
  id: string;
  sponsorName: string;
  sponsorId: string;
  packageName?: string;
  inventorySlots: string[];
  termStart: string;
  termEnd: string;
  totalValue: number;
  paymentSchedule: string;
  status: ContractStatus;
  deliverableCount: number;
  renewalReminderDate?: string;
  signedDate?: string;
}

export interface FulfillmentItem {
  id: string;
  deliverableName: string;
  sponsorName: string;
  contractId: string;
  category: InventoryCategory;
  dueCadence: string;
  dueDate: string;
  owner: string;
  ownerInitials: string;
  status: FulfillmentStatus;
  proofLinks: string[];
  verifiedBy?: string;
  notes?: string;
}

export interface SponsorAsset {
  id: string;
  sponsorName: string;
  sponsorId: string;
  assetType: 'logo-light' | 'logo-dark' | 'copy' | 'website' | 'hex-colors' | 'placement-spec' | 'do-not-use';
  title: string;
  description: string;
  version: string;
  approved: boolean;
  updatedAt: string;
}

export interface SponsorInvoice {
  id: string;
  invoiceNumber: string;
  sponsorName: string;
  sponsorId: string;
  contractId: string;
  amount: number;
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  reconciled: boolean;
}

export interface SponsorReport {
  id: string;
  title: string;
  type: string;
  period: string;
  generatedAt: string;
  format: 'PDF' | 'CSV' | 'XLSX';
  size: string;
}

export interface SponsorAuditEntry {
  id: string;
  action: string;
  actor: string;
  actorInitials: string;
  target: string;
  timestamp: string;
  detail?: string;
}

export interface SponsorSettingToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface SponsorsData {
  dashboardBlocks: SponsorDashboardBlock[];
  quickActions: SponsorQuickAction[];
  sponsors: Sponsor[];
  packages: SponsorPackage[];
  inventory: InventorySlot[];
  contracts: SponsorContract[];
  fulfillment: FulfillmentItem[];
  assets: SponsorAsset[];
  invoices: SponsorInvoice[];
  reports: SponsorReport[];
  audit: SponsorAuditEntry[];
  settings: SponsorSettingToggle[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const SPONSORS_TABS: SponsorsTab[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'sponsors', label: 'Sponsors' },
  { id: 'packages', label: 'Packages' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'fulfillment', label: 'Fulfillment' },
  { id: 'assets', label: 'Assets' },
  { id: 'invoicing', label: 'Invoicing' },
  { id: 'reports', label: 'Reports' },
  { id: 'audit', label: 'Audit' },
  { id: 'settings', label: 'Settings' },
];

export const SPONSORS_SCOPE_CHIPS: SponsorsScopeChip[] = [
  { key: 'organization', label: 'Organization' },
  { key: 'program', label: 'Program' },
  { key: 'season', label: 'Season' },
];

export const SPONSOR_STATUS_COLOR: Record<SponsorStatus, string> = {
  prospect: '#F59E0B',
  active: '#22C55E',
  paused: '#A1A1AA',
  completed: '#1D9BF0',
  archived: '#A1A1AA',
};

export const CONTRACT_STATUS_COLOR: Record<ContractStatus, string> = {
  draft: '#A1A1AA',
  sent: '#F59E0B',
  signed: '#1D9BF0',
  active: '#22C55E',
  completed: '#1D9BF0',
  archived: '#A1A1AA',
};

export const FULFILLMENT_STATUS_COLOR: Record<FulfillmentStatus, string> = {
  pending: '#F59E0B',
  delivered: '#1D9BF0',
  verified: '#22C55E',
  missed: '#EF4444',
};

export const INVOICE_STATUS_COLOR: Record<InvoiceStatus, string> = {
  draft: '#A1A1AA',
  sent: '#F59E0B',
  paid: '#22C55E',
  overdue: '#EF4444',
  cancelled: '#A1A1AA',
};

export const INVENTORY_CATEGORY_LABEL: Record<InventoryCategory, string> = {
  'jersey-apparel': 'Jersey / Apparel',
  'venue-signage': 'Venue Signage',
  'digital-social': 'Digital / Social',
  'replay-video': 'Replay / Video',
  'broadcast-stream': 'Broadcast / Stream',
  events: 'Events',
  hospitality: 'Hospitality',
  'website-app': 'Website / App',
  custom: 'Custom',
};

export const PACKAGE_TIER_LABEL: Record<PackageTier, string> = {
  title: 'Title Sponsor (Presenting)',
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
  'local-partner': 'Local Partner',
};

export const PACKAGE_TIER_COLOR: Record<PackageTier, string> = {
  title: '#1D9BF0',
  platinum: '#A1A1AA',
  gold: '#1D9BF0',
  silver: '#A1A1AA',
  bronze: '#1D9BF0',
  'local-partner': '#22C55E',
};

// =============================================================================
// MOCK DATA
// =============================================================================

const dashboardBlocks: SponsorDashboardBlock[] = [
  // Revenue Pulse
  {
    id: 'db-ytd-revenue',
    label: 'YTD Sponsor Revenue',
    value: '$142,500',
    status: 'good',
    detail: 'Across 5 active contracts',
  },
  {
    id: 'db-outstanding-receivables',
    label: 'Outstanding Receivables',
    value: '$37,500',
    status: 'warning',
    detail: '3 invoices pending payment',
  },
  {
    id: 'db-next-30-invoices',
    label: 'Next 30 Days Invoices Due',
    value: '$18,750',
    status: 'good',
    detail: '2 invoices due by Mar 15',
  },
  // Active Sponsors
  {
    id: 'db-active-sponsors',
    label: 'Active Sponsors',
    value: '6',
    status: 'good',
    detail: '5 active, 1 prospect',
  },
  {
    id: 'db-top-tier',
    label: 'Top Tier',
    value: 'MidState Credit Union (Title)',
    status: 'good',
    detail: '$45,000 season value',
  },
  // Fulfillment Pulse
  {
    id: 'db-deliverables-due-week',
    label: 'Deliverables Due This Week',
    value: '4',
    status: 'warning',
    detail: '2 social posts, 1 banner, 1 website tile',
  },
  {
    id: 'db-overdue-deliverables',
    label: 'Overdue Deliverables',
    value: '1',
    status: 'critical',
    detail: 'Baseline Banner — QuickFuel (Game 12)',
  },
  {
    id: 'db-season-fulfillment',
    label: 'Season Fulfillment %',
    value: '87%',
    status: 'good',
    detail: '52 of 60 deliverables completed',
  },
  // Inventory Utilization
  {
    id: 'db-sold-slots',
    label: 'Sold Slots',
    value: '18/28',
    status: 'good',
    detail: '64% utilization rate',
  },
  {
    id: 'db-available-slots',
    label: 'Available Slots',
    value: '10',
    status: 'good',
    detail: 'Across all inventory categories',
  },
];

const quickActions: SponsorQuickAction[] = [
  { id: 'qa-create-sponsor', label: 'Create Sponsor', icon: 'plus.circle.fill' },
  { id: 'qa-create-contract', label: 'Create Contract', icon: 'doc.badge.plus' },
  { id: 'qa-generate-invoice', label: 'Generate Invoice', icon: 'dollarsign.circle.fill' },
  { id: 'qa-log-fulfillment', label: 'Log Fulfillment', icon: 'checkmark.circle.fill' },
];

const sponsors: Sponsor[] = [
  {
    id: 'sponsor-001',
    name: 'MidState Credit Union',
    logoInitials: 'MC',
    logoColor: '#1D9BF0',
    tier: 'title',
    status: 'active',
    contractWindow: 'Aug 2025 \u2013 May 2026',
    primaryContact: 'David Reynolds',
    primaryEmail: 'david@midstatecu.com',
    primaryPhone: '(803) 555-0300',
    value: 45000,
    scope: 'program',
  },
  {
    id: 'sponsor-002',
    name: 'Palmetto Health Systems',
    logoInitials: 'PH',
    logoColor: '#22C55E',
    tier: 'platinum',
    status: 'active',
    contractWindow: 'Aug 2025 \u2013 May 2026',
    primaryContact: 'Dr. Lisa Chen',
    primaryEmail: 'lchen@palmettohealth.com',
    value: 30000,
    scope: 'program',
  },
  {
    id: 'sponsor-003',
    name: 'QuickFuel Gas & Convenience',
    logoInitials: 'QF',
    logoColor: '#EF4444',
    tier: 'gold',
    status: 'active',
    contractWindow: 'Jan 2026 \u2013 Dec 2026',
    primaryContact: 'Marcus Grant',
    primaryEmail: 'mgrant@quickfuel.com',
    primaryPhone: '(803) 555-0320',
    value: 20000,
    scope: 'season',
  },
  {
    id: 'sponsor-004',
    name: 'Carolina BBQ Co.',
    logoInitials: 'CB',
    logoColor: '#F59E0B',
    tier: 'silver',
    status: 'active',
    contractWindow: 'Aug 2025 \u2013 May 2026',
    primaryContact: 'James Porter',
    primaryEmail: 'jporter@carolinabbq.com',
    value: 12500,
    scope: 'season',
  },
  {
    id: 'sponsor-005',
    name: 'TechStart Incubator',
    logoInitials: 'TI',
    logoColor: '#1D9BF0',
    tier: 'bronze',
    status: 'active',
    contractWindow: 'Aug 2025 \u2013 May 2026',
    primaryContact: 'Priya Sharma',
    primaryEmail: 'psharma@techstart.io',
    value: 10000,
    scope: 'program',
  },
  {
    id: 'sponsor-006',
    name: 'Lowcountry Insurance Group',
    logoInitials: 'LI',
    logoColor: '#1D9BF0',
    tier: 'local-partner',
    status: 'prospect',
    primaryContact: 'Robert Calhoun',
    primaryEmail: 'rcalhoun@lowcountryins.com',
    primaryPhone: '(803) 555-0350',
    value: 5000,
    scope: 'organization',
  },
];

const packages: SponsorPackage[] = [
  {
    id: 'pkg-title',
    name: 'Title Sponsor (Presenting)',
    tier: 'title',
    price: '$40,000\u2013$50,000',
    includedDeliverables: [
      'Jersey Patch (Home)',
      'Jersey Patch (Away)',
      'Courtside Banner x2',
      'Baseline Banner',
      'Social Post (4/mo)',
      'Replay Pre-Roll',
      'Stream Overlay Logo',
      'Event Naming Rights',
      'VIP Seats x4',
      'Website Sponsor Tile',
    ],
    termLength: 'season',
    maxCount: 1,
    currentCount: 1,
    approvalRequired: true,
  },
  {
    id: 'pkg-platinum',
    name: 'Platinum',
    tier: 'platinum',
    price: '$25,000\u2013$35,000',
    includedDeliverables: [
      'Warmup Shirt Logo',
      'Courtside Banner',
      'Social Post (3/mo)',
      'Replay Mid-Roll',
      'Stream Overlay Logo',
      'VIP Seats x2',
      'Website Sponsor Tile',
    ],
    termLength: 'season',
    maxCount: 2,
    currentCount: 1,
    approvalRequired: true,
  },
  {
    id: 'pkg-gold',
    name: 'Gold',
    tier: 'gold',
    price: '$15,000\u2013$20,000',
    includedDeliverables: [
      'Baseline Banner',
      'Social Post (2/mo)',
      'Replay Pre-Roll',
      'Website Sponsor Tile',
    ],
    termLength: 'season',
    maxCount: 3,
    currentCount: 1,
    approvalRequired: false,
  },
  {
    id: 'pkg-silver',
    name: 'Silver',
    tier: 'silver',
    price: '$10,000\u2013$15,000',
    includedDeliverables: [
      'Social Post (1/mo)',
      'Social Story Bundle',
      'Website Sponsor Tile',
    ],
    termLength: 'season',
    maxCount: 4,
    currentCount: 1,
    approvalRequired: false,
  },
  {
    id: 'pkg-bronze',
    name: 'Bronze',
    tier: 'bronze',
    price: '$5,000\u2013$10,000',
    includedDeliverables: [
      'Social Post (1/mo)',
      'Website Sponsor Tile',
    ],
    termLength: 'season',
    maxCount: 5,
    currentCount: 1,
    approvalRequired: false,
  },
  {
    id: 'pkg-local-partner',
    name: 'Local Partner',
    tier: 'local-partner',
    price: '$2,500\u2013$5,000',
    includedDeliverables: [
      'Website Sponsor Tile',
      'Event Program Ad',
    ],
    termLength: 'season',
    maxCount: 10,
    currentCount: 0,
    approvalRequired: false,
  },
];

const inventory: InventorySlot[] = [
  {
    id: 'inv-001',
    name: 'Jersey Patch (Home)',
    category: 'jersey-apparel',
    unitScope: 'program',
    quantityAvailable: 2,
    quantitySold: 1,
    priceGuidance: '$8,000/season',
    duration: 'season',
    rules: '3x3 inch max',
    soldTo: 'MidState Credit Union',
  },
  {
    id: 'inv-002',
    name: 'Jersey Patch (Away)',
    category: 'jersey-apparel',
    unitScope: 'program',
    quantityAvailable: 2,
    quantitySold: 1,
    priceGuidance: '$8,000/season',
    duration: 'season',
    soldTo: 'MidState Credit Union',
  },
  {
    id: 'inv-003',
    name: 'Warmup Shirt Logo',
    category: 'jersey-apparel',
    unitScope: 'program',
    quantityAvailable: 2,
    quantitySold: 1,
    priceGuidance: '$4,000/season',
    duration: 'season',
    soldTo: 'Palmetto Health Systems',
  },
  {
    id: 'inv-004',
    name: 'Courtside Banner',
    category: 'venue-signage',
    unitScope: 'season',
    quantityAvailable: 4,
    quantitySold: 3,
    priceGuidance: '$3,000/season',
    duration: 'season',
    rules: '8ft x 3ft',
  },
  {
    id: 'inv-005',
    name: 'Baseline Banner',
    category: 'venue-signage',
    unitScope: 'season',
    quantityAvailable: 4,
    quantitySold: 2,
    priceGuidance: '$2,000/season',
    duration: 'season',
    rules: '6ft x 2ft',
  },
  {
    id: 'inv-006',
    name: 'Social Post (Monthly)',
    category: 'digital-social',
    unitScope: 'season',
    quantityAvailable: 10,
    quantitySold: 6,
    priceGuidance: '$500/month',
    duration: 'month',
  },
  {
    id: 'inv-007',
    name: 'Social Story Bundle',
    category: 'digital-social',
    unitScope: 'season',
    quantityAvailable: 6,
    quantitySold: 1,
    priceGuidance: '$300/month',
    duration: 'month',
  },
  {
    id: 'inv-008',
    name: 'Replay Pre-Roll (5\u201315s)',
    category: 'replay-video',
    unitScope: 'season',
    quantityAvailable: 3,
    quantitySold: 2,
    priceGuidance: '$2,500/season',
    duration: 'season',
  },
  {
    id: 'inv-009',
    name: 'Replay Mid-Roll',
    category: 'replay-video',
    unitScope: 'season',
    quantityAvailable: 3,
    quantitySold: 1,
    priceGuidance: '$1,500/season',
    duration: 'season',
  },
  {
    id: 'inv-010',
    name: 'Stream Overlay Logo',
    category: 'broadcast-stream',
    unitScope: 'season',
    quantityAvailable: 4,
    quantitySold: 2,
    priceGuidance: '$2,000/season',
    duration: 'season',
  },
  {
    id: 'inv-011',
    name: 'Event Naming Rights',
    category: 'events',
    unitScope: 'event',
    quantityAvailable: 2,
    quantitySold: 1,
    priceGuidance: '$5,000/event',
    duration: 'event',
    soldTo: 'MidState Credit Union',
  },
  {
    id: 'inv-012',
    name: 'VIP Seats',
    category: 'hospitality',
    unitScope: 'season',
    quantityAvailable: 8,
    quantitySold: 6,
    priceGuidance: '$500/season per seat',
    duration: 'season',
  },
  {
    id: 'inv-013',
    name: 'Website Sponsor Tile',
    category: 'website-app',
    unitScope: 'season',
    quantityAvailable: 8,
    quantitySold: 5,
    priceGuidance: '$1,000/season',
    duration: 'season',
  },
];

const contracts: SponsorContract[] = [
  {
    id: 'contract-001',
    sponsorName: 'MidState Credit Union',
    sponsorId: 'sponsor-001',
    packageName: 'Title Sponsor (Presenting)',
    inventorySlots: [
      'Jersey Patch (Home)',
      'Jersey Patch (Away)',
      'Courtside Banner x2',
      'Baseline Banner',
      'Social Post (4/mo)',
      'Replay Pre-Roll',
      'Stream Overlay Logo',
      'Event Naming Rights',
      'VIP Seats x4',
      'Website Sponsor Tile',
    ],
    termStart: 'Aug 1, 2025',
    termEnd: 'May 31, 2026',
    totalValue: 45000,
    paymentSchedule: 'Quarterly',
    status: 'active',
    deliverableCount: 12,
    signedDate: 'Aug 1, 2025',
    renewalReminderDate: 'Apr 1, 2026',
  },
  {
    id: 'contract-002',
    sponsorName: 'Palmetto Health Systems',
    sponsorId: 'sponsor-002',
    packageName: 'Platinum',
    inventorySlots: [
      'Warmup Shirt Logo',
      'Courtside Banner',
      'Social Post (3/mo)',
      'Replay Mid-Roll',
      'Stream Overlay Logo',
      'VIP Seats x2',
      'Website Sponsor Tile',
    ],
    termStart: 'Aug 1, 2025',
    termEnd: 'May 31, 2026',
    totalValue: 30000,
    paymentSchedule: 'Semester billing',
    status: 'active',
    deliverableCount: 8,
    signedDate: 'Aug 15, 2025',
  },
  {
    id: 'contract-003',
    sponsorName: 'QuickFuel Gas & Convenience',
    sponsorId: 'sponsor-003',
    packageName: 'Gold',
    inventorySlots: [
      'Baseline Banner',
      'Social Post (2/mo)',
      'Replay Pre-Roll',
      'Website Sponsor Tile',
    ],
    termStart: 'Jan 1, 2026',
    termEnd: 'Dec 31, 2026',
    totalValue: 20000,
    paymentSchedule: 'Quarterly',
    status: 'active',
    deliverableCount: 5,
    signedDate: 'Dec 15, 2025',
  },
  {
    id: 'contract-004',
    sponsorName: 'Carolina BBQ Co.',
    sponsorId: 'sponsor-004',
    packageName: 'Silver',
    inventorySlots: [
      'Social Post (1/mo)',
      'Social Story Bundle',
      'Website Sponsor Tile',
    ],
    termStart: 'Aug 1, 2025',
    termEnd: 'May 31, 2026',
    totalValue: 12500,
    paymentSchedule: 'One-time',
    status: 'active',
    deliverableCount: 3,
    signedDate: 'Aug 20, 2025',
  },
  {
    id: 'contract-005',
    sponsorName: 'TechStart Incubator',
    sponsorId: 'sponsor-005',
    packageName: 'Bronze',
    inventorySlots: [
      'Social Post (1/mo)',
      'Website Sponsor Tile',
    ],
    termStart: 'Aug 1, 2025',
    termEnd: 'May 31, 2026',
    totalValue: 10000,
    paymentSchedule: 'Semester billing',
    status: 'active',
    deliverableCount: 2,
    signedDate: 'Sep 1, 2025',
  },
];

const fulfillment: FulfillmentItem[] = [
  {
    id: 'ful-001',
    deliverableName: 'Courtside Banner \u2014 MidState Credit Union',
    sponsorName: 'MidState Credit Union',
    contractId: 'contract-001',
    category: 'venue-signage',
    dueCadence: 'per game',
    dueDate: 'Feb 15, 2026',
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
    status: 'delivered',
    proofLinks: ['Photo \u2014 Game 12 signage'],
    verifiedBy: 'Alex Morgan',
  },
  {
    id: 'ful-002',
    deliverableName: 'Social Post \u2014 MidState Credit Union (Feb)',
    sponsorName: 'MidState Credit Union',
    contractId: 'contract-001',
    category: 'digital-social',
    dueCadence: 'monthly',
    dueDate: 'Feb 28, 2026',
    owner: 'Tanya Brooks',
    ownerInitials: 'TB',
    status: 'pending',
    proofLinks: [],
  },
  {
    id: 'ful-003',
    deliverableName: 'Replay Pre-Roll \u2014 MidState Credit Union',
    sponsorName: 'MidState Credit Union',
    contractId: 'contract-001',
    category: 'replay-video',
    dueCadence: 'per game',
    dueDate: 'Feb 15, 2026',
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
    status: 'delivered',
    proofLinks: ['Replay clip \u2014 Game 12'],
  },
  {
    id: 'ful-004',
    deliverableName: 'Social Post \u2014 Palmetto Health (Feb)',
    sponsorName: 'Palmetto Health Systems',
    contractId: 'contract-002',
    category: 'digital-social',
    dueCadence: 'monthly',
    dueDate: 'Feb 28, 2026',
    owner: 'Tanya Brooks',
    ownerInitials: 'TB',
    status: 'pending',
    proofLinks: [],
  },
  {
    id: 'ful-005',
    deliverableName: 'Stream Overlay \u2014 Palmetto Health',
    sponsorName: 'Palmetto Health Systems',
    contractId: 'contract-002',
    category: 'broadcast-stream',
    dueCadence: 'per game',
    dueDate: 'Feb 15, 2026',
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
    status: 'verified',
    proofLinks: ['Screenshot \u2014 stream overlay'],
    verifiedBy: 'Alex Morgan',
  },
  {
    id: 'ful-006',
    deliverableName: 'Social Post \u2014 QuickFuel (Feb)',
    sponsorName: 'QuickFuel Gas & Convenience',
    contractId: 'contract-003',
    category: 'digital-social',
    dueCadence: 'monthly',
    dueDate: 'Feb 28, 2026',
    owner: 'Tanya Brooks',
    ownerInitials: 'TB',
    status: 'pending',
    proofLinks: [],
  },
  {
    id: 'ful-007',
    deliverableName: 'Baseline Banner \u2014 QuickFuel',
    sponsorName: 'QuickFuel Gas & Convenience',
    contractId: 'contract-003',
    category: 'venue-signage',
    dueCadence: 'per game',
    dueDate: 'Feb 15, 2026',
    owner: 'Marcus Reed',
    ownerInitials: 'MR',
    status: 'missed',
    proofLinks: [],
    notes: 'Banner not displayed for Game 12 due to venue setup issue',
  },
  {
    id: 'ful-008',
    deliverableName: 'Website Tile \u2014 Carolina BBQ',
    sponsorName: 'Carolina BBQ Co.',
    contractId: 'contract-004',
    category: 'website-app',
    dueCadence: 'monthly',
    dueDate: 'Feb 28, 2026',
    owner: 'Tanya Brooks',
    ownerInitials: 'TB',
    status: 'delivered',
    proofLinks: ['Screenshot \u2014 website sponsor section'],
  },
];

const assets: SponsorAsset[] = [
  {
    id: 'asset-001',
    sponsorName: 'MidState Credit Union',
    sponsorId: 'sponsor-001',
    assetType: 'logo-light',
    title: 'Primary Logo (Light)',
    description: 'Full-color primary logo on transparent background for light surfaces',
    version: '2.0',
    approved: true,
    updatedAt: 'Jan 5, 2026',
  },
  {
    id: 'asset-002',
    sponsorName: 'MidState Credit Union',
    sponsorId: 'sponsor-001',
    assetType: 'logo-dark',
    title: 'Primary Logo (Dark)',
    description: 'White primary logo on transparent background for dark surfaces',
    version: '2.0',
    approved: true,
    updatedAt: 'Jan 5, 2026',
  },
  {
    id: 'asset-003',
    sponsorName: 'MidState Credit Union',
    sponsorId: 'sponsor-001',
    assetType: 'copy',
    title: 'Approved Tagline',
    description: "'Banking on your future' \u2014 use in all social posts",
    version: '1.0',
    approved: true,
    updatedAt: 'Aug 1, 2025',
  },
  {
    id: 'asset-004',
    sponsorName: 'Palmetto Health Systems',
    sponsorId: 'sponsor-002',
    assetType: 'logo-light',
    title: 'Primary Logo',
    description: 'Full-color primary logo on transparent background',
    version: '1.1',
    approved: true,
    updatedAt: 'Aug 10, 2025',
  },
  {
    id: 'asset-005',
    sponsorName: 'Palmetto Health Systems',
    sponsorId: 'sponsor-002',
    assetType: 'hex-colors',
    title: 'Brand Colors',
    description: '#22C55E primary, #22C55E background',
    version: '1.0',
    approved: true,
    updatedAt: 'Aug 10, 2025',
  },
  {
    id: 'asset-006',
    sponsorName: 'QuickFuel Gas & Convenience',
    sponsorId: 'sponsor-003',
    assetType: 'logo-light',
    title: 'Primary Logo',
    description: 'Full-color primary logo on transparent background',
    version: '1.0',
    approved: true,
    updatedAt: 'Dec 20, 2025',
  },
  {
    id: 'asset-007',
    sponsorName: 'QuickFuel Gas & Convenience',
    sponsorId: 'sponsor-003',
    assetType: 'do-not-use',
    title: 'Do-Not-Use Rules',
    description: 'Never place logo on red backgrounds. Minimum clear space: 0.5 inch.',
    version: '1.0',
    approved: true,
    updatedAt: 'Jan 10, 2026',
  },
  {
    id: 'asset-008',
    sponsorName: 'Carolina BBQ Co.',
    sponsorId: 'sponsor-004',
    assetType: 'logo-light',
    title: 'Primary Logo',
    description: 'Full-color primary logo on transparent background',
    version: '1.0',
    approved: true,
    updatedAt: 'Aug 18, 2025',
  },
];

const invoices: SponsorInvoice[] = [
  {
    id: 'inv-invoice-001',
    invoiceNumber: 'INV-2026-001',
    sponsorName: 'MidState Credit Union',
    sponsorId: 'sponsor-001',
    contractId: 'contract-001',
    amount: 11250,
    status: 'paid',
    issuedDate: 'Jan 2, 2026',
    dueDate: 'Jan 31, 2026',
    paidDate: 'Jan 28, 2026',
    paymentMethod: 'ACH',
    reconciled: true,
  },
  {
    id: 'inv-invoice-002',
    invoiceNumber: 'INV-2026-002',
    sponsorName: 'Palmetto Health Systems',
    sponsorId: 'sponsor-002',
    contractId: 'contract-002',
    amount: 15000,
    status: 'paid',
    issuedDate: 'Jan 2, 2026',
    dueDate: 'Jan 31, 2026',
    paidDate: 'Jan 25, 2026',
    paymentMethod: 'Check',
    reconciled: true,
  },
  {
    id: 'inv-invoice-003',
    invoiceNumber: 'INV-2026-003',
    sponsorName: 'QuickFuel Gas & Convenience',
    sponsorId: 'sponsor-003',
    contractId: 'contract-003',
    amount: 5000,
    status: 'paid',
    issuedDate: 'Jan 5, 2026',
    dueDate: 'Feb 5, 2026',
    paidDate: 'Feb 3, 2026',
    paymentMethod: 'ACH',
    reconciled: true,
  },
  {
    id: 'inv-invoice-004',
    invoiceNumber: 'INV-2026-004',
    sponsorName: 'MidState Credit Union',
    sponsorId: 'sponsor-001',
    contractId: 'contract-001',
    amount: 11250,
    status: 'sent',
    issuedDate: 'Feb 1, 2026',
    dueDate: 'Feb 28, 2026',
    reconciled: false,
  },
  {
    id: 'inv-invoice-005',
    invoiceNumber: 'INV-2026-005',
    sponsorName: 'Carolina BBQ Co.',
    sponsorId: 'sponsor-004',
    contractId: 'contract-004',
    amount: 12500,
    status: 'overdue',
    issuedDate: 'Jan 15, 2026',
    dueDate: 'Feb 15, 2026',
    reconciled: false,
  },
  {
    id: 'inv-invoice-006',
    invoiceNumber: 'INV-2026-006',
    sponsorName: 'TechStart Incubator',
    sponsorId: 'sponsor-005',
    contractId: 'contract-005',
    amount: 5000,
    status: 'sent',
    issuedDate: 'Feb 1, 2026',
    dueDate: 'Mar 1, 2026',
    reconciled: false,
  },
];

const reports: SponsorReport[] = [
  {
    id: 'rpt-001',
    title: 'Sponsor Roster Report',
    type: 'Sponsor Overview',
    period: '2025\u201326 Season',
    generatedAt: 'Feb 14, 2026',
    format: 'PDF',
    size: '1.2 MB',
  },
  {
    id: 'rpt-002',
    title: 'Inventory Utilization Report',
    type: 'Inventory',
    period: '2025\u201326 Season',
    generatedAt: 'Feb 14, 2026',
    format: 'XLSX',
    size: '340 KB',
  },
  {
    id: 'rpt-003',
    title: 'Fulfillment Report',
    type: 'Fulfillment',
    period: '2025\u201326 Season',
    generatedAt: 'Feb 14, 2026',
    format: 'PDF',
    size: '890 KB',
  },
  {
    id: 'rpt-004',
    title: 'Contract Value Report',
    type: 'Contracts',
    period: '2025\u201326 Season',
    generatedAt: 'Feb 14, 2026',
    format: 'XLSX',
    size: '210 KB',
  },
  {
    id: 'rpt-005',
    title: 'Receivables Aging Report',
    type: 'Invoicing',
    period: '2025\u201326 Season',
    generatedAt: 'Feb 14, 2026',
    format: 'CSV',
    size: '95 KB',
  },
];

const audit: SponsorAuditEntry[] = [
  {
    id: 'aud-001',
    action: 'sponsor_created',
    actor: 'Alex Morgan',
    actorInitials: 'SK',
    target: 'MidState Credit Union',
    timestamp: 'Jul 15, 2025',
    detail: 'Created sponsor record with Title tier designation',
  },
  {
    id: 'aud-002',
    action: 'contract_signed',
    actor: 'Alex Morgan',
    actorInitials: 'SK',
    target: 'MidState CU \u2014 Title Sponsor',
    timestamp: 'Aug 1, 2025',
    detail: 'Contract activated, $45,000 total value',
  },
  {
    id: 'aud-003',
    action: 'contract_signed',
    actor: 'Alex Morgan',
    actorInitials: 'SK',
    target: 'Palmetto Health \u2014 Platinum',
    timestamp: 'Aug 15, 2025',
    detail: 'Contract activated, $30,000 total value',
  },
  {
    id: 'aud-004',
    action: 'fulfillment_logged',
    actor: 'Marcus Reed',
    actorInitials: 'MR',
    target: 'Courtside Banner \u2014 MidState CU',
    timestamp: 'Feb 15, 2026',
    detail: 'Proof uploaded: Photo \u2014 Game 12 signage',
  },
  {
    id: 'aud-005',
    action: 'fulfillment_verified',
    actor: 'Alex Morgan',
    actorInitials: 'SK',
    target: 'Stream Overlay \u2014 Palmetto Health',
    timestamp: 'Feb 15, 2026',
    detail: 'Verified with screenshot proof',
  },
  {
    id: 'aud-006',
    action: 'invoice_sent',
    actor: 'Tanya Brooks',
    actorInitials: 'TB',
    target: 'INV-2026-004 \u2014 MidState CU',
    timestamp: 'Feb 1, 2026',
    detail: 'Q2 quarterly invoice, $11,250',
  },
  {
    id: 'aud-007',
    action: 'invoice_overdue',
    actor: 'System',
    actorInitials: 'SY',
    target: 'INV-2026-005 \u2014 Carolina BBQ',
    timestamp: 'Feb 16, 2026',
    detail: 'Payment past due, $12,500 outstanding',
  },
  {
    id: 'aud-008',
    action: 'asset_uploaded',
    actor: 'Marcus Reed',
    actorInitials: 'MR',
    target: 'QuickFuel \u2014 Do-Not-Use Rules',
    timestamp: 'Jan 10, 2026',
    detail: 'Brand guidelines document uploaded',
  },
];

const settings: SponsorSettingToggle[] = [
  {
    id: 'set-001',
    label: 'Default Scope for New Sponsors',
    description: 'Set the default scope for new sponsor records',
    enabled: true,
  },
  {
    id: 'set-002',
    label: 'Require Approval for Contracts Over $25,000',
    description: 'Contracts exceeding $25,000 require admin approval',
    enabled: true,
  },
  {
    id: 'set-003',
    label: 'Require Signed PDF for Contract Activation',
    description: 'Contracts cannot be marked active without uploaded signed PDF',
    enabled: true,
  },
  {
    id: 'set-004',
    label: 'Require Proof for Fulfillment Verification',
    description: 'Fulfillment items must have at least one proof link to be marked verified',
    enabled: true,
  },
  {
    id: 'set-005',
    label: 'Auto-Generate Invoices on Contract Activation',
    description: 'Automatically create receivables when a contract is activated',
    enabled: false,
  },
  {
    id: 'set-006',
    label: 'Renewal Reminder Window',
    description: 'Send renewal reminders 60 days before contract end',
    enabled: true,
  },
  {
    id: 'set-007',
    label: 'Allow Sponsors to Submit Assets Directly',
    description: 'Enable external sponsor contacts to upload brand assets',
    enabled: false,
  },
];

// =============================================================================
// GETTER
// =============================================================================

export function getSponsorsData(): SponsorsData {
  return {
    dashboardBlocks,
    quickActions,
    sponsors,
    packages,
    inventory,
    contracts,
    fulfillment,
    assets,
    invoices,
    reports,
    audit,
    settings,
  };
}
