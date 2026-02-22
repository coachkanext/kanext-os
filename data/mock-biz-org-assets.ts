/**
 * Business Organization Assets Tab — mock data, types, and constants.
 * 10-tab Assets Hub: Overview, Registry, Locations, Vendors, Maintenance,
 * Insurance, Acquisitions, Diligence, Requests, Exports.
 *
 * Seeded entities reference shared IDs from biz-org-shared-types.
 */

import {
  KANEXT_HOLDCO,
  KANEXT_OPSCO,
  KANEXT_IP,
  TARGET_BANK,
  SLIEMA_WANDERERS,
  SEEDED_ENTITY_NAMES,
} from '@/data/biz-org-shared-types';

// =============================================================================
// TAB TYPES & CONSTANTS
// =============================================================================

export type BizAssetsTabId =
  | 'overview'
  | 'registry'
  | 'locations'
  | 'vendors'
  | 'maintenance'
  | 'insurance'
  | 'acquisitions'
  | 'diligence'
  | 'requests'
  | 'exports';

export const BIZ_ASSETS_TABS: { id: BizAssetsTabId; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'square.grid.2x2' },
  { id: 'registry', label: 'Registry', icon: 'tray.full' },
  { id: 'locations', label: 'Locations', icon: 'mappin.and.ellipse' },
  { id: 'vendors', label: 'Vendors', icon: 'person.2' },
  { id: 'maintenance', label: 'Maintenance', icon: 'wrench.and.screwdriver' },
  { id: 'insurance', label: 'Insurance', icon: 'shield.checkered' },
  { id: 'acquisitions', label: 'Acquisitions', icon: 'arrow.triangle.merge' },
  { id: 'diligence', label: 'Diligence', icon: 'checklist' },
  { id: 'requests', label: 'Requests', icon: 'envelope.open' },
  { id: 'exports', label: 'Exports', icon: 'square.and.arrow.up' },
];

export const BIZ_ASSETS_SCOPE_CHIPS = [
  'All Entities',
  'KaNeXT HoldCo',
  'KaNeXT OpsCo',
  'KaNeXT IP',
];

// =============================================================================
// DATA INTERFACES
// =============================================================================

export type AssetType = 'real_estate' | 'vehicles' | 'equipment' | 'digital' | 'financial' | 'institutional';
export type AcquisitionStage = 'prospect' | 'loi' | 'diligence' | 'negotiation' | 'closed';

export interface AssetOverviewStats {
  totalValue: number;
  activeLocations: number;
  vendorCount: number;
  maintenanceDue: number;
  insuranceExpiryAlerts: number;
  acquisitionPipeline: number;
}

export interface AssetHealthStrip {
  maintenance: 'green' | 'yellow' | 'red';
  insurance: 'green' | 'yellow' | 'red';
  compliance: 'green' | 'yellow' | 'red';
  payments: 'green' | 'yellow' | 'red';
}

export interface AssetItem {
  id: string;
  name: string;
  type: AssetType;
  entityId: string;
  entityName: string;
  status: 'active' | 'inactive' | 'disposed' | 'pending';
  value: number;
  depreciation: string;
  acquiredDate: string;
  description: string;
  healthStrip: AssetHealthStrip;
}

export interface AssetLocation {
  id: string;
  name: string;
  address: string;
  assignedAssets: number;
  occupancy: string;
  leaseStatus: 'owned' | 'leased' | 'month_to_month';
  entityName: string;
}

export interface AssetVendor {
  id: string;
  name: string;
  contractStatus: 'active' | 'expired' | 'negotiating';
  spendYTD: number;
  performanceRating: number; // 1-5
  entityName: string;
  category: string;
}

export interface AssetMaintenance {
  id: string;
  assetId: string;
  assetName: string;
  type: 'preventive' | 'corrective' | 'inspection';
  status: 'scheduled' | 'overdue' | 'completed';
  scheduledDate: string;
  completedDate: string | null;
  cost: number | null;
  assignee: string;
}

export interface AssetInsurance {
  id: string;
  policyName: string;
  type: 'general_liability' | 'property' | 'cyber' | 'dno' | 'workers_comp' | 'vehicle';
  coverage: string;
  premium: number;
  expiryDate: string;
  renewalAlert: boolean;
  entityName: string;
  coiTracking: boolean;
}

export interface AssetAcquisition {
  id: string;
  targetName: string;
  stage: AcquisitionStage;
  dealValue: number;
  entityName: string;
  description: string;
  lastActivity: string;
}

export interface AssetDiligenceItem {
  id: string;
  acquisitionId: string;
  acquisitionName: string;
  category: string;
  item: string;
  completed: boolean;
  linkedDocumentId: string | null;
}

export type RequestLifecycle = 'draft' | 'submitted' | 'approved' | 'routed_to_finance' | 'archived';

export interface AssetRequest {
  id: string;
  title: string;
  type: 'purchase' | 'lease' | 'dispose';
  status: 'pending' | 'approved' | 'rejected';
  requestLifecycle: RequestLifecycle;
  requestedBy: string;
  amount: number;
  entityName: string;
  date: string;
}

export interface DiligenceTemplate {
  id: string;
  name: string;
  type: 'bank' | 'school' | 'real_estate' | 'vendor';
  items: { label: string; done: boolean }[];
}

export interface AssetExportOption {
  id: string;
  label: string;
  description: string;
  format: 'PDF' | 'CSV' | 'XLSX';
  icon: string;
}

// =============================================================================
// STATUS / TYPE COLOR MAPS
// =============================================================================

export const ASSET_TYPE_COLOR: Record<AssetType, string> = {
  real_estate: '#1D9BF0',
  vehicles: '#F59E0B',
  equipment: '#22C55E',
  digital: '#1D9BF0',
  financial: '#1D9BF0',
  institutional: '#1D9BF0',
};

export const ASSET_TYPE_LABEL: Record<AssetType, string> = {
  real_estate: 'Real Estate',
  vehicles: 'Vehicles',
  equipment: 'Equipment',
  digital: 'Digital',
  financial: 'Financial',
  institutional: 'Institutional',
};

export const ASSET_STATUS_COLOR: Record<AssetItem['status'], string> = {
  active: '#22C55E',
  inactive: '#A1A1AA',
  disposed: '#EF4444',
  pending: '#F59E0B',
};

export const LEASE_STATUS_COLOR: Record<AssetLocation['leaseStatus'], string> = {
  owned: '#22C55E',
  leased: '#1D9BF0',
  month_to_month: '#F59E0B',
};

export const LEASE_STATUS_LABEL: Record<AssetLocation['leaseStatus'], string> = {
  owned: 'Owned',
  leased: 'Leased',
  month_to_month: 'Month-to-Month',
};

export const VENDOR_CONTRACT_COLOR: Record<AssetVendor['contractStatus'], string> = {
  active: '#22C55E',
  expired: '#EF4444',
  negotiating: '#F59E0B',
};

export const MAINTENANCE_TYPE_COLOR: Record<AssetMaintenance['type'], string> = {
  preventive: '#1D9BF0',
  corrective: '#F59E0B',
  inspection: '#1D9BF0',
};

export const MAINTENANCE_STATUS_COLOR: Record<AssetMaintenance['status'], string> = {
  scheduled: '#1D9BF0',
  overdue: '#EF4444',
  completed: '#22C55E',
};

export const INSURANCE_TYPE_COLOR: Record<AssetInsurance['type'], string> = {
  general_liability: '#1D9BF0',
  property: '#22C55E',
  cyber: '#1D9BF0',
  dno: '#1D9BF0',
  workers_comp: '#F59E0B',
  vehicle: '#1D9BF0',
};

export const INSURANCE_TYPE_LABEL: Record<AssetInsurance['type'], string> = {
  general_liability: 'General Liability',
  property: 'Property',
  cyber: 'Cyber',
  dno: 'D&O',
  workers_comp: 'Workers Comp',
  vehicle: 'Vehicle',
};

export const ACQUISITION_STAGE_COLOR: Record<AcquisitionStage, string> = {
  prospect: '#A1A1AA',
  loi: '#1D9BF0',
  diligence: '#F59E0B',
  negotiation: '#1D9BF0',
  closed: '#22C55E',
};

export const ACQUISITION_STAGE_LABEL: Record<AcquisitionStage, string> = {
  prospect: 'Prospect',
  loi: 'LOI',
  diligence: 'Diligence',
  negotiation: 'Negotiation',
  closed: 'Closed',
};

export const REQUEST_TYPE_COLOR: Record<AssetRequest['type'], string> = {
  purchase: '#22C55E',
  lease: '#1D9BF0',
  dispose: '#EF4444',
};

export const REQUEST_STATUS_COLOR: Record<AssetRequest['status'], string> = {
  pending: '#F59E0B',
  approved: '#22C55E',
  rejected: '#EF4444',
};

export const EXPORT_FORMAT_COLOR: Record<AssetExportOption['format'], string> = {
  PDF: '#EF4444',
  CSV: '#22C55E',
  XLSX: '#1D9BF0',
};

// =============================================================================
// HELPER
// =============================================================================

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return '$' + (amount / 1_000_000).toFixed(1) + 'M';
  }
  if (amount >= 1_000) {
    return '$' + (amount / 1_000).toFixed(0) + 'K';
  }
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// =============================================================================
// MOCK DATA — OVERVIEW
// =============================================================================

const OVERVIEW_STATS: AssetOverviewStats = {
  totalValue: 4_200_000,
  activeLocations: 3,
  vendorCount: 8,
  maintenanceDue: 2,
  insuranceExpiryAlerts: 1,
  acquisitionPipeline: 2,
};

// =============================================================================
// MOCK DATA — ASSET REGISTRY
// =============================================================================

const ASSETS: AssetItem[] = [
  {
    id: 'ast-1',
    name: 'LA Headquarters — Office Lease',
    type: 'real_estate',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    status: 'active',
    value: 1_450_000,
    depreciation: 'N/A (leased)',
    acquiredDate: 'Jan 2024',
    description: 'Primary HQ — 5,200 sq ft open-plan office with 2 conference rooms, WeWork Century City.',
    healthStrip: { maintenance: 'green', insurance: 'green', compliance: 'green', payments: 'green' },
  },
  {
    id: 'ast-2',
    name: 'London Satellite Office',
    type: 'real_estate',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    status: 'active',
    value: 380_000,
    depreciation: 'N/A (leased)',
    acquiredDate: 'Jun 2025',
    description: 'Hot-desk co-working arrangement for UK operations — 12 desks, meeting pod.',
    healthStrip: { maintenance: 'green', insurance: 'green', compliance: 'green', payments: 'yellow' },
  },
  {
    id: 'ast-3',
    name: 'Malta Satellite Office',
    type: 'real_estate',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    status: 'active',
    value: 120_000,
    depreciation: 'N/A (leased)',
    acquiredDate: 'Mar 2026',
    description: 'Shared office space in Sliema — 4 desks, regulatory liaison point.',
    healthStrip: { maintenance: 'yellow', insurance: 'yellow', compliance: 'red', payments: 'green' },
  },
  {
    id: 'ast-4',
    name: 'Company Tesla Model Y',
    type: 'vehicles',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    status: 'active',
    value: 42_000,
    depreciation: '20% declining balance',
    acquiredDate: 'May 2025',
    description: 'Executive fleet vehicle — assigned to CEO/GM for client meetings and travel.',
    healthStrip: { maintenance: 'red', insurance: 'green', compliance: 'green', payments: 'green' },
  },
  {
    id: 'ast-5',
    name: 'Dell PowerEdge R760 Server Rack',
    type: 'equipment',
    entityId: KANEXT_IP,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    status: 'active',
    value: 85_000,
    depreciation: '5-yr straight line',
    acquiredDate: 'Nov 2025',
    description: 'Primary compute rack hosting KaNeXT OS workloads — Data Center Rack A.',
    healthStrip: { maintenance: 'yellow', insurance: 'green', compliance: 'green', payments: 'green' },
  },
  {
    id: 'ast-6',
    name: 'MacBook Pro M4 Fleet (12 units)',
    type: 'equipment',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    status: 'active',
    value: 42_000,
    depreciation: '5-yr straight line',
    acquiredDate: 'Jan 2026',
    description: 'Engineering team fleet — 16" M4 Pro, 36 GB RAM per unit.',
    healthStrip: { maintenance: 'green', insurance: 'green', compliance: 'green', payments: 'green' },
  },
  {
    id: 'ast-7',
    name: 'KaNeXT OS Platform (Software IP)',
    type: 'digital',
    entityId: KANEXT_IP,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    status: 'active',
    value: 1_800_000,
    depreciation: 'Amortized over 7 yrs',
    acquiredDate: 'Feb 2023',
    description: 'Core SaaS platform — cross-mode operating system for sports, business, education, church, competition.',
    healthStrip: { maintenance: 'green', insurance: 'green', compliance: 'green', payments: 'green' },
  },
  {
    id: 'ast-8',
    name: 'kanext.com Domain Portfolio',
    type: 'digital',
    entityId: KANEXT_IP,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    status: 'active',
    value: 15_000,
    depreciation: 'N/A',
    acquiredDate: 'Sep 2022',
    description: 'Domain portfolio: kanext.com, kanext.io, kanext.app — auto-renewed through 2028.',
    healthStrip: { maintenance: 'green', insurance: 'yellow', compliance: 'green', payments: 'green' },
  },
  {
    id: 'ast-9',
    name: 'Treasury Bills — 6-Month',
    type: 'financial',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    status: 'active',
    value: 500_000,
    depreciation: 'N/A',
    acquiredDate: 'Jan 2026',
    description: 'Short-term US Treasury allocation — matures Jun 30, 2026.',
    healthStrip: { maintenance: 'green', insurance: 'green', compliance: 'green', payments: 'green' },
  },
  {
    id: 'ast-10',
    name: 'Sliema Wanderers FC Partnership Stake',
    type: 'institutional',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    status: 'pending',
    value: 250_000,
    depreciation: 'N/A (equity)',
    acquiredDate: 'Feb 2026',
    description: 'Strategic partnership stake in Sliema Wanderers FC — pending regulatory approval.',
    healthStrip: { maintenance: 'green', insurance: 'yellow', compliance: 'red', payments: 'yellow' },
  },
];

// =============================================================================
// MOCK DATA — LOCATIONS
// =============================================================================

const LOCATIONS: AssetLocation[] = [
  {
    id: 'loc-1',
    name: 'LA Headquarters',
    address: '2049 Century Park E, Suite 2100, Nashville, TN 90067',
    assignedAssets: 28,
    occupancy: '85%',
    leaseStatus: 'leased',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
  },
  {
    id: 'loc-2',
    name: 'London Office',
    address: '1 Canada Square, Canary Wharf, London E14 5AB, UK',
    assignedAssets: 6,
    occupancy: '60%',
    leaseStatus: 'leased',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
  {
    id: 'loc-3',
    name: 'Malta Satellite',
    address: 'Tower Business Centre, Tower Street, Sliema SLM 1605, Malta',
    assignedAssets: 4,
    occupancy: '40%',
    leaseStatus: 'month_to_month',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
  {
    id: 'loc-4',
    name: 'Data Center (Colocation)',
    address: 'Equinix LA1, 750 E 2nd St, Nashville, TN 90012',
    assignedAssets: 3,
    occupancy: '100%',
    leaseStatus: 'leased',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
  },
];

// =============================================================================
// MOCK DATA — VENDORS
// =============================================================================

const VENDORS: AssetVendor[] = [
  {
    id: 'vnd-1',
    name: 'Amazon Web Services (AWS)',
    contractStatus: 'active',
    spendYTD: 128_400,
    performanceRating: 5,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    category: 'Cloud Infrastructure',
  },
  {
    id: 'vnd-2',
    name: 'Stripe, Inc.',
    contractStatus: 'active',
    spendYTD: 34_200,
    performanceRating: 5,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    category: 'Payment Processing',
  },
  {
    id: 'vnd-3',
    name: 'WeWork',
    contractStatus: 'active',
    spendYTD: 86_000,
    performanceRating: 4,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    category: 'Office Space',
  },
  {
    id: 'vnd-4',
    name: 'Morrison Foerster LLP',
    contractStatus: 'active',
    spendYTD: 145_000,
    performanceRating: 5,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    category: 'Legal Services',
  },
  {
    id: 'vnd-5',
    name: 'Deloitte LLP',
    contractStatus: 'active',
    spendYTD: 95_000,
    performanceRating: 4,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    category: 'Accounting & Audit',
  },
  {
    id: 'vnd-6',
    name: 'Chubb Insurance',
    contractStatus: 'active',
    spendYTD: 52_000,
    performanceRating: 4,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    category: 'Insurance Provider',
  },
  {
    id: 'vnd-7',
    name: 'Equinix',
    contractStatus: 'active',
    spendYTD: 42_000,
    performanceRating: 5,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    category: 'Data Center / Colocation',
  },
  {
    id: 'vnd-8',
    name: 'Figma, Inc.',
    contractStatus: 'negotiating',
    spendYTD: 12_000,
    performanceRating: 4,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    category: 'Design Tools',
  },
];

// =============================================================================
// MOCK DATA — MAINTENANCE
// =============================================================================

const MAINTENANCE: AssetMaintenance[] = [
  {
    id: 'mnt-1',
    assetId: 'ast-5',
    assetName: 'Dell PowerEdge R760 Server Rack',
    type: 'preventive',
    status: 'scheduled',
    scheduledDate: 'Feb 28, 2026',
    completedDate: null,
    cost: null,
    assignee: 'IT Infrastructure',
  },
  {
    id: 'mnt-2',
    assetId: 'ast-4',
    assetName: 'Company Tesla Model Y',
    type: 'preventive',
    status: 'overdue',
    scheduledDate: 'Feb 1, 2026',
    completedDate: null,
    cost: null,
    assignee: 'Fleet Manager',
  },
  {
    id: 'mnt-3',
    assetId: 'ast-6',
    assetName: 'MacBook Pro M4 Fleet (12 units)',
    type: 'inspection',
    status: 'completed',
    scheduledDate: 'Jan 15, 2026',
    completedDate: 'Jan 15, 2026',
    cost: 0,
    assignee: 'IT Support',
  },
  {
    id: 'mnt-4',
    assetId: 'ast-1',
    assetName: 'LA Headquarters — HVAC System',
    type: 'corrective',
    status: 'scheduled',
    scheduledDate: 'Mar 10, 2026',
    completedDate: null,
    cost: 2_800,
    assignee: 'Facilities',
  },
  {
    id: 'mnt-5',
    assetId: 'ast-5',
    assetName: 'Dell PowerEdge R760 Server Rack',
    type: 'inspection',
    status: 'completed',
    scheduledDate: 'Dec 1, 2025',
    completedDate: 'Dec 1, 2025',
    cost: 350,
    assignee: 'IT Infrastructure',
  },
];

// =============================================================================
// MOCK DATA — INSURANCE
// =============================================================================

const INSURANCE: AssetInsurance[] = [
  {
    id: 'ins-1',
    policyName: 'General Liability — HQ & Operations',
    type: 'general_liability',
    coverage: '$5,000,000',
    premium: 52_000,
    expiryDate: 'Jun 30, 2026',
    renewalAlert: false,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    coiTracking: true,
  },
  {
    id: 'ins-2',
    policyName: 'Property Insurance — Office & Equipment',
    type: 'property',
    coverage: '$3,500,000',
    premium: 38_000,
    expiryDate: 'Dec 31, 2026',
    renewalAlert: false,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    coiTracking: true,
  },
  {
    id: 'ins-3',
    policyName: 'Cyber Liability & Data Breach',
    type: 'cyber',
    coverage: '$2,000,000',
    premium: 28_000,
    expiryDate: 'Feb 28, 2027',
    renewalAlert: false,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    coiTracking: true,
  },
  {
    id: 'ins-4',
    policyName: 'Directors & Officers Liability',
    type: 'dno',
    coverage: '$5,000,000',
    premium: 42_000,
    expiryDate: 'Dec 31, 2026',
    renewalAlert: false,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    coiTracking: false,
  },
  {
    id: 'ins-5',
    policyName: 'Workers Compensation — All Staff',
    type: 'workers_comp',
    coverage: '$1,000,000',
    premium: 32_000,
    expiryDate: 'Mar 31, 2026',
    renewalAlert: true,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    coiTracking: true,
  },
  {
    id: 'ins-6',
    policyName: 'Vehicle Fleet Coverage',
    type: 'vehicle',
    coverage: '$500,000',
    premium: 8_200,
    expiryDate: 'Apr 30, 2026',
    renewalAlert: false,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    coiTracking: false,
  },
];

// =============================================================================
// MOCK DATA — ACQUISITIONS
// =============================================================================

const ACQUISITIONS: AssetAcquisition[] = [
  {
    id: 'acq-1',
    targetName: SEEDED_ENTITY_NAMES[TARGET_BANK],
    stage: 'diligence',
    dealValue: 12_500_000,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    description: 'Strategic acquisition of community bank charter — provides direct banking license for embedded finance products.',
    lastActivity: 'Feb 12, 2026',
  },
  {
    id: 'acq-2',
    targetName: 'Sliema Wanderers FC — Partnership Expansion',
    stage: 'negotiation',
    dealValue: 750_000,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    description: 'Expanding strategic partnership from tech-only to equity stake + exclusive platform deployment across Maltese football league.',
    lastActivity: 'Feb 14, 2026',
  },
];

// =============================================================================
// MOCK DATA — DILIGENCE ITEMS
// =============================================================================

const DILIGENCE_ITEMS: AssetDiligenceItem[] = [
  {
    id: 'dil-1',
    acquisitionId: 'acq-1',
    acquisitionName: SEEDED_ENTITY_NAMES[TARGET_BANK],
    category: 'Financial',
    item: 'Review 3-year audited financial statements',
    completed: true,
    linkedDocumentId: 'doc-fin-001',
  },
  {
    id: 'dil-2',
    acquisitionId: 'acq-1',
    acquisitionName: SEEDED_ENTITY_NAMES[TARGET_BANK],
    category: 'Financial',
    item: 'Analyze loan portfolio quality and loss reserves',
    completed: true,
    linkedDocumentId: 'doc-fin-002',
  },
  {
    id: 'dil-3',
    acquisitionId: 'acq-1',
    acquisitionName: SEEDED_ENTITY_NAMES[TARGET_BANK],
    category: 'Regulatory',
    item: 'FDIC / OCC regulatory compliance review',
    completed: false,
    linkedDocumentId: null,
  },
  {
    id: 'dil-4',
    acquisitionId: 'acq-1',
    acquisitionName: SEEDED_ENTITY_NAMES[TARGET_BANK],
    category: 'Regulatory',
    item: 'BSA / AML program assessment',
    completed: false,
    linkedDocumentId: null,
  },
  {
    id: 'dil-5',
    acquisitionId: 'acq-1',
    acquisitionName: SEEDED_ENTITY_NAMES[TARGET_BANK],
    category: 'Legal',
    item: 'Review all pending litigation and settlements',
    completed: true,
    linkedDocumentId: 'doc-legal-001',
  },
  {
    id: 'dil-6',
    acquisitionId: 'acq-1',
    acquisitionName: SEEDED_ENTITY_NAMES[TARGET_BANK],
    category: 'Technology',
    item: 'Core banking system assessment and integration plan',
    completed: false,
    linkedDocumentId: null,
  },
  {
    id: 'dil-7',
    acquisitionId: 'acq-1',
    acquisitionName: SEEDED_ENTITY_NAMES[TARGET_BANK],
    category: 'Technology',
    item: 'Cybersecurity posture and incident history',
    completed: true,
    linkedDocumentId: 'doc-tech-001',
  },
  {
    id: 'dil-8',
    acquisitionId: 'acq-1',
    acquisitionName: SEEDED_ENTITY_NAMES[TARGET_BANK],
    category: 'HR / People',
    item: 'Key personnel retention risk analysis',
    completed: false,
    linkedDocumentId: null,
  },
  {
    id: 'dil-9',
    acquisitionId: 'acq-1',
    acquisitionName: SEEDED_ENTITY_NAMES[TARGET_BANK],
    category: 'Operations',
    item: 'Branch network evaluation and rationalization plan',
    completed: true,
    linkedDocumentId: 'doc-ops-001',
  },
  {
    id: 'dil-10',
    acquisitionId: 'acq-1',
    acquisitionName: SEEDED_ENTITY_NAMES[TARGET_BANK],
    category: 'Financial',
    item: 'Capital adequacy and stress test results',
    completed: false,
    linkedDocumentId: null,
  },
];

// =============================================================================
// MOCK DATA — REQUESTS
// =============================================================================

const REQUESTS: AssetRequest[] = [
  {
    id: 'req-1',
    title: 'Purchase 6x MacBook Pro M4 for new hires',
    type: 'purchase',
    status: 'pending',
    requestLifecycle: 'submitted',
    requestedBy: 'Marcus Chen',
    amount: 21_000,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    date: 'Feb 10, 2026',
  },
  {
    id: 'req-2',
    title: 'Lease additional WeWork desks — London',
    type: 'lease',
    status: 'approved',
    requestLifecycle: 'routed_to_finance',
    requestedBy: 'Olivia Park',
    amount: 4_200,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    date: 'Feb 8, 2026',
  },
  {
    id: 'req-3',
    title: 'Dispose retired Dell R750 server rack',
    type: 'dispose',
    status: 'pending',
    requestLifecycle: 'draft',
    requestedBy: 'Jason Wu',
    amount: 0,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    date: 'Feb 5, 2026',
  },
  {
    id: 'req-4',
    title: 'Purchase standing desk fleet expansion (8 units)',
    type: 'purchase',
    status: 'rejected',
    requestLifecycle: 'archived',
    requestedBy: 'Sarah Kim',
    amount: 9_600,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    date: 'Jan 28, 2026',
  },
];

// =============================================================================
// MOCK DATA — EXPORT OPTIONS
// =============================================================================

const EXPORT_OPTIONS: AssetExportOption[] = [
  {
    id: 'exp-1',
    label: 'Full Asset Registry',
    description: 'Complete asset inventory with values, depreciation, and entity assignments.',
    format: 'XLSX',
    icon: 'tablecells',
  },
  {
    id: 'exp-2',
    label: 'Insurance Coverage Summary',
    description: 'All active policies, premiums, coverage limits, and COI tracking status.',
    format: 'PDF',
    icon: 'shield.checkered',
  },
  {
    id: 'exp-3',
    label: 'Vendor Spend Report',
    description: 'Year-to-date vendor spend breakdown by category and entity.',
    format: 'CSV',
    icon: 'person.2',
  },
  {
    id: 'exp-4',
    label: 'Maintenance Schedule',
    description: 'Upcoming and overdue maintenance tasks with assignees and costs.',
    format: 'PDF',
    icon: 'wrench.and.screwdriver',
  },
  {
    id: 'exp-5',
    label: 'Acquisition Pipeline',
    description: 'Active acquisition targets, stages, deal values, and diligence progress.',
    format: 'PDF',
    icon: 'arrow.triangle.merge',
  },
  {
    id: 'exp-6',
    label: 'Location Occupancy Report',
    description: 'All locations with occupancy rates, lease status, and assigned asset counts.',
    format: 'XLSX',
    icon: 'mappin.and.ellipse',
  },
  {
    id: 'exp-7',
    label: 'Depreciation Schedule',
    description: 'Asset depreciation details for tax and accounting purposes.',
    format: 'XLSX',
    icon: 'chart.line.downtrend.xyaxis',
  },
  {
    id: 'exp-8',
    label: 'Asset Requests Log',
    description: 'All purchase, lease, and disposal requests with approval status.',
    format: 'CSV',
    icon: 'envelope.open',
  },
];

// =============================================================================
// MOCK DATA — DILIGENCE TEMPLATES
// =============================================================================

const DILIGENCE_TEMPLATES: DiligenceTemplate[] = [
  {
    id: 'dtpl-1',
    name: 'Bank Acquisition Diligence',
    type: 'bank',
    items: [
      { label: 'Review 3-year audited financial statements', done: true },
      { label: 'Analyze loan portfolio quality and loss reserves', done: true },
      { label: 'FDIC / OCC regulatory compliance review', done: false },
      { label: 'BSA / AML program assessment', done: false },
      { label: 'Core banking system assessment', done: false },
      { label: 'Capital adequacy and stress test results', done: false },
    ],
  },
  {
    id: 'dtpl-2',
    name: 'Real Estate Acquisition Diligence',
    type: 'real_estate',
    items: [
      { label: 'Title search and lien verification', done: true },
      { label: 'Environmental Phase I assessment', done: true },
      { label: 'Property condition / inspection report', done: false },
      { label: 'Zoning and permitting compliance', done: true },
      { label: 'Appraisal and market valuation', done: false },
    ],
  },
  {
    id: 'dtpl-3',
    name: 'Vendor Onboarding Diligence',
    type: 'vendor',
    items: [
      { label: 'Business registration and W-9 verification', done: true },
      { label: 'Insurance certificate (COI) collection', done: true },
      { label: 'Security questionnaire and SOC 2 review', done: true },
      { label: 'Data processing agreement (DPA) signed', done: false },
      { label: 'Financial stability check (D&B report)', done: false },
    ],
  },
];

// =============================================================================
// DATA GETTER
// =============================================================================

export function getBizAssetsData() {
  return {
    overview: OVERVIEW_STATS,
    assets: ASSETS,
    locations: LOCATIONS,
    vendors: VENDORS,
    maintenance: MAINTENANCE,
    insurance: INSURANCE,
    acquisitions: ACQUISITIONS,
    diligenceItems: DILIGENCE_ITEMS,
    diligenceTemplates: DILIGENCE_TEMPLATES,
    requests: REQUESTS,
    exportOptions: EXPORT_OPTIONS,
  };
}
