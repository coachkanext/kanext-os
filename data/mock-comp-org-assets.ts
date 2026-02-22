/**
 * Competition Organization Assets Tab — mock data, types, and constants.
 * 10-tab Assets Hub: Dashboard, Physical, Digital, Equipment, Venues,
 * Inventory, Maintenance, Insurance, Reports, Settings.
 */

// =============================================================================
// TAB TYPES & CONSTANTS
// =============================================================================

export type CompAssetsTabId =
  | 'dashboard'
  | 'physical'
  | 'digital'
  | 'equipment'
  | 'venues'
  | 'inventory'
  | 'maintenance'
  | 'insurance'
  | 'reports'
  | 'settings';

export const COMP_ASSETS_TABS: { id: CompAssetsTabId; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'square.grid.2x2' },
  { id: 'physical', label: 'Physical', icon: 'cube' },
  { id: 'digital', label: 'Digital', icon: 'doc.on.doc' },
  { id: 'equipment', label: 'Equipment', icon: 'wrench.and.screwdriver' },
  { id: 'venues', label: 'Venues', icon: 'building.2' },
  { id: 'inventory', label: 'Inventory', icon: 'shippingbox' },
  { id: 'maintenance', label: 'Maintenance', icon: 'hammer' },
  { id: 'insurance', label: 'Insurance', icon: 'shield.checkered' },
  { id: 'reports', label: 'Reports', icon: 'chart.bar.fill' },
  { id: 'settings', label: 'Settings', icon: 'gearshape' },
];

export const COMP_ASSETS_SCOPE_CHIPS = [
  'All Assets',
  'Physical',
  'Digital',
  'Equipment',
  'Venues',
];

// =============================================================================
// DATA INTERFACES
// =============================================================================

export interface AssetsDashboardBlock {
  id: string;
  label: string;
  value: string;
  delta: string;
  icon: string;
  color: string;
}

export interface PhysicalAsset {
  id: string;
  name: string;
  category: 'trophy' | 'signage' | 'furniture' | 'barrier' | 'podium' | 'display';
  location: string;
  condition: 'excellent' | 'good' | 'fair' | 'needs-repair' | 'retired';
  value: number;
  acquiredDate: string;
  assignedTo: string;
}

export interface DigitalAsset {
  id: string;
  name: string;
  type: 'logo' | 'template' | 'video' | 'photo' | 'document' | 'brand-guide';
  format: string;
  size: string;
  version: string;
  uploadDate: string;
  owner: string;
  tags: string[];
}

export interface EquipmentAsset {
  id: string;
  name: string;
  category: 'scoring' | 'timing' | 'broadcast' | 'safety' | 'av' | 'medical';
  serialNumber: string;
  condition: 'excellent' | 'good' | 'fair' | 'needs-repair';
  location: string;
  lastServiced: string;
  nextService: string;
}

export interface VenueAsset {
  id: string;
  name: string;
  type: 'arena' | 'stadium' | 'field' | 'court' | 'training-facility';
  capacity: number;
  address: string;
  ownedOrLeased: 'owned' | 'leased' | 'partnership';
  leaseExpiry: string;
  annualCost: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'medals' | 'certificates' | 'merchandise' | 'consumables' | 'uniforms';
  quantity: number;
  minStock: number;
  reorderPoint: number;
  unitCost: number;
  location: string;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetName: string;
  type: 'scheduled' | 'repair' | 'inspection' | 'upgrade';
  date: string;
  cost: number;
  status: 'completed' | 'scheduled' | 'overdue' | 'in-progress';
  technician: string;
}

export interface InsurancePolicy {
  id: string;
  name: string;
  provider: string;
  coverage: number;
  premium: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expiring-soon' | 'expired' | 'pending-renewal';
  assets: string[];
}

export interface AssetReport {
  id: string;
  name: string;
  type: string;
  date: string;
  format: 'PDF' | 'CSV' | 'XLSX';
}

export interface AssetSettingToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

// =============================================================================
// STATUS COLORS
// =============================================================================

export const CONDITION_COLOR: Record<PhysicalAsset['condition'], string> = {
  excellent: '#22C55E',
  good: '#1D9BF0',
  fair: '#F59E0B',
  'needs-repair': '#EF4444',
  retired: '#A1A1AA',
};

export const MAINTENANCE_STATUS_COLOR: Record<MaintenanceRecord['status'], string> = {
  completed: '#22C55E',
  scheduled: '#1D9BF0',
  overdue: '#EF4444',
  'in-progress': '#F59E0B',
};

export const INSURANCE_STATUS_COLOR: Record<InsurancePolicy['status'], string> = {
  active: '#22C55E',
  'expiring-soon': '#F59E0B',
  expired: '#EF4444',
  'pending-renewal': '#1D9BF0',
};

export const LEASE_COLOR: Record<VenueAsset['ownedOrLeased'], string> = {
  owned: '#22C55E',
  leased: '#1D9BF0',
  partnership: '#1D9BF0',
};

export const DIGITAL_TYPE_COLOR: Record<DigitalAsset['type'], string> = {
  logo: '#1D9BF0',
  template: '#22C55E',
  video: '#EF4444',
  photo: '#F59E0B',
  document: '#1D9BF0',
  'brand-guide': '#A1A1AA',
};

export const EQUIPMENT_CATEGORY_COLOR: Record<EquipmentAsset['category'], string> = {
  scoring: '#1D9BF0',
  timing: '#22C55E',
  broadcast: '#F59E0B',
  safety: '#EF4444',
  av: '#1D9BF0',
  medical: '#1D9BF0',
};

export const INVENTORY_CATEGORY_COLOR: Record<InventoryItem['category'], string> = {
  medals: '#F59E0B',
  certificates: '#1D9BF0',
  merchandise: '#22C55E',
  consumables: '#A1A1AA',
  uniforms: '#1D9BF0',
};

export const REPORT_FORMAT_COLOR: Record<AssetReport['format'], string> = {
  PDF: '#EF4444',
  CSV: '#22C55E',
  XLSX: '#1D9BF0',
};

// =============================================================================
// HELPER
// =============================================================================

export function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// =============================================================================
// MOCK DATA
// =============================================================================

export function getCompAssetsData(scope: string) {
  return {
    dashboard: DASHBOARD_BLOCKS,
    physical: PHYSICAL_ASSETS,
    digital: DIGITAL_ASSETS,
    equipment: EQUIPMENT_ASSETS,
    venues: VENUE_ASSETS,
    inventory: INVENTORY_ITEMS,
    maintenance: MAINTENANCE_RECORDS,
    insurance: INSURANCE_POLICIES,
    reports: REPORTS,
    settings: SETTINGS_TOGGLES,
  };
}

// === Dashboard ===

const DASHBOARD_BLOCKS: AssetsDashboardBlock[] = [
  {
    id: 'db-1',
    label: 'Total Assets',
    value: '284',
    delta: '+8 this quarter',
    icon: 'cube',
    color: '#1D9BF0',
  },
  {
    id: 'db-2',
    label: 'Asset Value',
    value: '$4.2M',
    delta: '+$180K YoY',
    icon: 'chart.line.uptrend.xyaxis',
    color: '#22C55E',
  },
  {
    id: 'db-3',
    label: 'Needs Repair',
    value: '7',
    delta: '3 urgent',
    icon: 'wrench.and.screwdriver',
    color: '#EF4444',
  },
  {
    id: 'db-4',
    label: 'Insurance Active',
    value: '96%',
    delta: '2 expiring soon',
    icon: 'shield.checkered',
    color: '#F59E0B',
  },
  {
    id: 'db-5',
    label: 'Digital Library',
    value: '1,248',
    delta: '+62 this month',
    icon: 'doc.on.doc',
    color: '#1D9BF0',
  },
  {
    id: 'db-6',
    label: 'Low Stock Items',
    value: '4',
    delta: '2 below reorder',
    icon: 'shippingbox',
    color: '#EF4444',
  },
];

// === Physical Assets ===

const PHYSICAL_ASSETS: PhysicalAsset[] = [
  { id: 'pa-1', name: 'KaNeXT Church Championship Trophy', category: 'trophy', location: 'Commissioner\'s Office', condition: 'excellent', value: 28000, acquiredDate: 'Sep 2019', assignedTo: 'Executive Office' },
  { id: 'pa-2', name: 'Conference Regular Season Trophy', category: 'trophy', location: 'Trophy Case — Main Lobby', condition: 'excellent', value: 12000, acquiredDate: 'Aug 2020', assignedTo: 'Operations' },
  { id: 'pa-3', name: 'Tournament MVP Award', category: 'trophy', location: 'Awards Room', condition: 'good', value: 4500, acquiredDate: 'Feb 2023', assignedTo: 'Operations' },
  { id: 'pa-4', name: 'Commissioner\'s Podium', category: 'podium', location: 'KaNeXT Arena — Press Room', condition: 'excellent', value: 8500, acquiredDate: 'Jan 2021', assignedTo: 'Communications' },
  { id: 'pa-5', name: 'Main Lobby Entrance Signage', category: 'signage', location: 'KaNeXT Arena Entrance', condition: 'good', value: 15000, acquiredDate: 'Mar 2020', assignedTo: 'Facilities' },
  { id: 'pa-6', name: 'Conference Banner Set (16)', category: 'display', location: 'KaNeXT Arena — Rafters', condition: 'good', value: 22000, acquiredDate: 'Nov 2021', assignedTo: 'Operations' },
  { id: 'pa-7', name: 'Press Conference Backdrop', category: 'display', location: 'Storage Room B', condition: 'fair', value: 3200, acquiredDate: 'Jun 2022', assignedTo: 'Communications' },
  { id: 'pa-8', name: 'VIP Lounge Furniture Set', category: 'furniture', location: 'KaNeXT Arena — VIP Suite', condition: 'good', value: 18500, acquiredDate: 'Jul 2021', assignedTo: 'Hospitality' },
  { id: 'pa-9', name: 'Event Crowd Barriers (50)', category: 'barrier', location: 'Equipment Warehouse', condition: 'fair', value: 7500, acquiredDate: 'Apr 2020', assignedTo: 'Security' },
  { id: 'pa-10', name: 'Awards Ceremony Stage Platform', category: 'podium', location: 'Equipment Warehouse', condition: 'good', value: 12000, acquiredDate: 'Aug 2022', assignedTo: 'Operations' },
  { id: 'pa-11', name: 'Outdoor Wayfinding Signage (12)', category: 'signage', location: 'Arena Campus', condition: 'needs-repair', value: 9600, acquiredDate: 'May 2019', assignedTo: 'Facilities' },
  { id: 'pa-12', name: 'Hall of Champions Display Cases', category: 'display', location: 'KaNeXT Arena — Main Concourse', condition: 'excellent', value: 14000, acquiredDate: 'Oct 2021', assignedTo: 'Operations' },
  { id: 'pa-13', name: 'Portable Registration Desks (8)', category: 'furniture', location: 'Equipment Warehouse', condition: 'good', value: 4800, acquiredDate: 'Jan 2023', assignedTo: 'Event Services' },
  { id: 'pa-14', name: 'Scholar-Athlete Award Plaque Collection', category: 'trophy', location: 'Trophy Case — Hall B', condition: 'good', value: 6200, acquiredDate: 'Mar 2022', assignedTo: 'Compliance' },
  { id: 'pa-15', name: 'Retired Championship Banners (6)', category: 'display', location: 'KaNeXT Arena — Rafters', condition: 'retired', value: 3600, acquiredDate: 'Feb 2018', assignedTo: 'Heritage' },
];

// === Digital Assets ===

const DIGITAL_ASSETS: DigitalAsset[] = [
  { id: 'da-1', name: 'Official Logo Pack v3.2', type: 'logo', format: 'AI/SVG/PNG', size: '48 MB', version: '3.2', uploadDate: 'Jan 15, 2026', owner: 'Creative Services', tags: ['branding', 'official', 'primary'] },
  { id: 'da-2', name: 'Conference Brand Guidelines 2026', type: 'brand-guide', format: 'PDF', size: '32 MB', version: '4.0', uploadDate: 'Dec 1, 2025', owner: 'Creative Services', tags: ['branding', 'standards', 'typography'] },
  { id: 'da-3', name: 'Tournament Program Template', type: 'template', format: 'INDD', size: '18 MB', version: '2.1', uploadDate: 'Jan 20, 2026', owner: 'Publications', tags: ['print', 'tournament', 'game-day'] },
  { id: 'da-4', name: 'Championship Highlight Reel 2025', type: 'video', format: 'MP4', size: '2.4 GB', version: '1.0', uploadDate: 'Mar 12, 2025', owner: 'Broadcast', tags: ['video', 'championship', 'highlights'] },
  { id: 'da-5', name: 'Media Day Photo Archive — 2025-26', type: 'photo', format: 'RAW/JPEG', size: '14.8 GB', version: '1.0', uploadDate: 'Oct 28, 2025', owner: 'Photography', tags: ['headshots', 'team-photos', 'media-day'] },
  { id: 'da-6', name: 'Game Day Operations Manual', type: 'document', format: 'DOCX/PDF', size: '8.4 MB', version: '6.3', uploadDate: 'Feb 3, 2026', owner: 'Operations', tags: ['manual', 'procedures', 'game-day'] },
  { id: 'da-7', name: 'Social Media Template Kit', type: 'template', format: 'PSD/Figma', size: '124 MB', version: '5.0', uploadDate: 'Jan 28, 2026', owner: 'Creative Services', tags: ['social', 'template', 'instagram'] },
  { id: 'da-8', name: 'Member Institution Logos (16)', type: 'logo', format: 'SVG/PNG', size: '22 MB', version: '2.0', uploadDate: 'Aug 15, 2025', owner: 'Creative Services', tags: ['member', 'logos', 'institutions'] },
  { id: 'da-9', name: 'Conference Promo Video — 2026', type: 'video', format: 'MP4/MOV', size: '1.8 GB', version: '1.0', uploadDate: 'Feb 10, 2026', owner: 'Broadcast', tags: ['promo', 'commercial', 'conference'] },
  { id: 'da-10', name: 'Credential Badge Template', type: 'template', format: 'AI', size: '5.2 MB', version: '3.0', uploadDate: 'Jan 5, 2026', owner: 'Operations', tags: ['credential', 'badge', 'security'] },
  { id: 'da-11', name: 'Press Release Template', type: 'document', format: 'DOCX', size: '420 KB', version: '2.5', uploadDate: 'Dec 12, 2025', owner: 'Communications', tags: ['press', 'template', 'media'] },
  { id: 'da-12', name: 'Sponsor Activation Photo Library', type: 'photo', format: 'JPEG', size: '6.2 GB', version: '1.0', uploadDate: 'Nov 20, 2025', owner: 'Partnerships', tags: ['sponsors', 'activation', 'photos'] },
  { id: 'da-13', name: 'Conference Constitution & Bylaws', type: 'document', format: 'PDF', size: '2.8 MB', version: '12.0', uploadDate: 'Jul 1, 2025', owner: 'Legal', tags: ['governance', 'bylaws', 'constitution'] },
  { id: 'da-14', name: 'Championship Court Design File', type: 'template', format: 'AI/DWG', size: '38 MB', version: '2.0', uploadDate: 'Feb 1, 2026', owner: 'Facilities', tags: ['court', 'design', 'championship'] },
  { id: 'da-15', name: 'Award Ceremony Script Template', type: 'document', format: 'DOCX', size: '1.1 MB', version: '4.0', uploadDate: 'Jan 30, 2026', owner: 'Events', tags: ['ceremony', 'script', 'awards'] },
];

// === Equipment Assets ===

const EQUIPMENT_ASSETS: EquipmentAsset[] = [
  { id: 'eq-1', name: 'K-1 Timing System (Swiss Timing)', category: 'timing', serialNumber: 'ST-2024-00482', condition: 'excellent', location: 'KaNeXT Arena — Control Room', lastServiced: 'Jan 8, 2026', nextService: 'Jul 8, 2026' },
  { id: 'eq-2', name: 'KaNeXT Arena LED Scoreboard', category: 'scoring', serialNumber: 'DAK-2022-11947', condition: 'excellent', location: 'KaNeXT Arena — Center Court', lastServiced: 'Dec 15, 2025', nextService: 'Jun 15, 2026' },
  { id: 'eq-3', name: 'Daktronics Shot Clock System (4)', category: 'scoring', serialNumber: 'DAK-SC-0042', condition: 'good', location: 'KaNeXT Arena — Court Level', lastServiced: 'Nov 20, 2025', nextService: 'May 20, 2026' },
  { id: 'eq-4', name: 'LiveU Solo+ Broadcast Kit', category: 'broadcast', serialNumber: 'LU-SOLO-8837', condition: 'good', location: 'Broadcast Equipment Room', lastServiced: 'Oct 5, 2025', nextService: 'Apr 5, 2026' },
  { id: 'eq-5', name: 'PTZ Camera System (6-cam)', category: 'broadcast', serialNumber: 'PTZ-CAM-0061', condition: 'good', location: 'KaNeXT Arena — Camera Bays', lastServiced: 'Jan 22, 2026', nextService: 'Jul 22, 2026' },
  { id: 'eq-6', name: 'Portable PA System (QSC)', category: 'av', serialNumber: 'QSC-PA-3310', condition: 'fair', location: 'Equipment Warehouse', lastServiced: 'Sep 10, 2025', nextService: 'Mar 10, 2026' },
  { id: 'eq-7', name: 'AED Units (8)', category: 'medical', serialNumber: 'AED-ZOLL-0080', condition: 'excellent', location: 'Distributed — All Venues', lastServiced: 'Feb 1, 2026', nextService: 'Aug 1, 2026' },
  { id: 'eq-8', name: 'Metal Detector Wands (20)', category: 'safety', serialNumber: 'MD-GARRETT-0200', condition: 'good', location: 'Security Office', lastServiced: 'Dec 1, 2025', nextService: 'Jun 1, 2026' },
  { id: 'eq-9', name: 'Wireless Microphone System (Shure)', category: 'av', serialNumber: 'SHURE-ULX-4421', condition: 'excellent', location: 'KaNeXT Arena — Press Room', lastServiced: 'Jan 15, 2026', nextService: 'Jul 15, 2026' },
  { id: 'eq-10', name: 'Portable Athletic Training Kit (4)', category: 'medical', serialNumber: 'ATK-MED-0040', condition: 'good', location: 'Athletic Training Room', lastServiced: 'Nov 1, 2025', nextService: 'May 1, 2026' },
  { id: 'eq-11', name: 'LED Court Projection System', category: 'av', serialNumber: 'PROJ-EPSON-7720', condition: 'needs-repair', location: 'KaNeXT Arena — Catwalk', lastServiced: 'Aug 20, 2025', nextService: 'OVERDUE' },
  { id: 'eq-12', name: 'Instant Replay System (Hawk-Eye)', category: 'scoring', serialNumber: 'HE-REPLAY-0012', condition: 'excellent', location: 'KaNeXT Arena — Replay Booth', lastServiced: 'Feb 5, 2026', nextService: 'Aug 5, 2026' },
  { id: 'eq-13', name: 'Weather Monitoring Station', category: 'safety', serialNumber: 'WMS-DAVIS-5501', condition: 'good', location: 'Outdoor Facilities Hub', lastServiced: 'Oct 15, 2025', nextService: 'Apr 15, 2026' },
  { id: 'eq-14', name: 'X-Ray Mobile Unit', category: 'medical', serialNumber: 'XRAY-MOB-0001', condition: 'fair', location: 'Medical Bay', lastServiced: 'Jul 30, 2025', nextService: 'Jan 30, 2026' },
  { id: 'eq-15', name: 'Sideline Headset Communication System', category: 'broadcast', serialNumber: 'COM-CLEAR-0815', condition: 'good', location: 'Equipment Warehouse', lastServiced: 'Dec 20, 2025', nextService: 'Jun 20, 2026' },
];

// === Venue Assets ===

const VENUE_ASSETS: VenueAsset[] = [
  { id: 've-1', name: 'KaNeXT Arena', type: 'arena', capacity: 8500, address: '10501 FGCU Blvd, Fort Myers, FL 33965', ownedOrLeased: 'partnership', leaseExpiry: 'Jun 30, 2032', annualCost: 420000 },
  { id: 've-2', name: 'Eagles Field Stadium', type: 'stadium', capacity: 12000, address: '10501 FGCU Blvd, Fort Myers, FL 33965', ownedOrLeased: 'partnership', leaseExpiry: 'Jun 30, 2032', annualCost: 580000 },
  { id: 've-3', name: 'KaNeXT Church Championship Court', type: 'court', capacity: 4200, address: '2000 Main St, Sarasota, FL 34236', ownedOrLeased: 'leased', leaseExpiry: 'Mar 31, 2027', annualCost: 165000 },
  { id: 've-4', name: 'Southwest Practice Facility', type: 'training-facility', capacity: 500, address: '4600 Training Way, Cape Coral, FL 33904', ownedOrLeased: 'leased', leaseExpiry: 'Dec 31, 2026', annualCost: 96000 },
  { id: 've-5', name: 'Gulf Coast Athletic Complex', type: 'field', capacity: 6000, address: '8100 College Pkwy, Fort Myers, FL 33919', ownedOrLeased: 'owned', leaseExpiry: 'N/A', annualCost: 210000 },
  { id: 've-6', name: 'Naples Community Field', type: 'field', capacity: 3500, address: '7000 Golden Gate Pkwy, Naples, FL 34105', ownedOrLeased: 'leased', leaseExpiry: 'Aug 31, 2027', annualCost: 78000 },
  { id: 've-7', name: 'KaNeXT Church Indoor Training Center', type: 'training-facility', capacity: 300, address: '10501 FGCU Blvd, Fort Myers, FL 33965', ownedOrLeased: 'owned', leaseExpiry: 'N/A', annualCost: 145000 },
  { id: 've-8', name: 'Lakeland Events Arena', type: 'arena', capacity: 5800, address: '701 W Lime St, Lakeland, FL 33815', ownedOrLeased: 'leased', leaseExpiry: 'May 31, 2028', annualCost: 240000 },
  { id: 've-9', name: 'Tampa Bay Tournament Hall', type: 'arena', capacity: 7200, address: '4100 George J Bean Pkwy, Tampa, FL 33607', ownedOrLeased: 'partnership', leaseExpiry: 'Dec 31, 2029', annualCost: 350000 },
  { id: 've-10', name: 'Orlando Sports Complex', type: 'stadium', capacity: 10000, address: '1 Citrus Bowl Pl, Orlando, FL 32805', ownedOrLeased: 'leased', leaseExpiry: 'Sep 30, 2027', annualCost: 480000 },
  { id: 've-11', name: 'Daytona Beach Courts (4)', type: 'court', capacity: 2000, address: '1200 International Speedway Blvd, Daytona Beach, FL 32114', ownedOrLeased: 'leased', leaseExpiry: 'Jun 30, 2026', annualCost: 85000 },
  { id: 've-12', name: 'Jacksonville Regional Field', type: 'field', capacity: 4500, address: '8400 Baymeadows Rd, Jacksonville, FL 32256', ownedOrLeased: 'partnership', leaseExpiry: 'Dec 31, 2028', annualCost: 135000 },
];

// === Inventory Items ===

const INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'in-1', name: 'Championship Gold Medals', category: 'medals', quantity: 120, minStock: 50, reorderPoint: 75, unitCost: 45, location: 'Awards Vault' },
  { id: 'in-2', name: 'Runner-Up Silver Medals', category: 'medals', quantity: 80, minStock: 40, reorderPoint: 60, unitCost: 35, location: 'Awards Vault' },
  { id: 'in-3', name: 'All-Conference Certificates', category: 'certificates', quantity: 200, minStock: 100, reorderPoint: 150, unitCost: 12, location: 'Print Room' },
  { id: 'in-4', name: 'Scholar-Athlete Certificates', category: 'certificates', quantity: 150, minStock: 75, reorderPoint: 100, unitCost: 12, location: 'Print Room' },
  { id: 'in-5', name: 'Official Game Basketballs (Spalding)', category: 'consumables', quantity: 48, minStock: 24, reorderPoint: 36, unitCost: 165, location: 'Equipment Room A' },
  { id: 'in-6', name: 'Conference Branded Polo Shirts', category: 'uniforms', quantity: 35, minStock: 20, reorderPoint: 30, unitCost: 55, location: 'Apparel Storage' },
  { id: 'in-7', name: 'Event Staff T-Shirts', category: 'uniforms', quantity: 180, minStock: 100, reorderPoint: 140, unitCost: 18, location: 'Apparel Storage' },
  { id: 'in-8', name: 'Branded Lanyards', category: 'merchandise', quantity: 500, minStock: 200, reorderPoint: 350, unitCost: 4, location: 'Merch Closet' },
  { id: 'in-9', name: 'Tournament Program Booklets', category: 'merchandise', quantity: 42, minStock: 100, reorderPoint: 200, unitCost: 8, location: 'Print Room' },
  { id: 'in-10', name: 'Credential Badge Blanks', category: 'consumables', quantity: 300, minStock: 100, reorderPoint: 200, unitCost: 3, location: 'Operations Office' },
  { id: 'in-11', name: 'Athletic Tape (Cases)', category: 'consumables', quantity: 22, minStock: 10, reorderPoint: 15, unitCost: 85, location: 'Athletic Training Room' },
  { id: 'in-12', name: 'Championship Rings', category: 'medals', quantity: 18, minStock: 15, reorderPoint: 20, unitCost: 380, location: 'Awards Vault' },
  { id: 'in-13', name: 'Branded Water Bottles', category: 'merchandise', quantity: 420, minStock: 200, reorderPoint: 300, unitCost: 6, location: 'Merch Closet' },
  { id: 'in-14', name: 'Official Referee Uniforms', category: 'uniforms', quantity: 28, minStock: 20, reorderPoint: 25, unitCost: 120, location: 'Apparel Storage' },
  { id: 'in-15', name: 'Ice Packs (Boxes)', category: 'consumables', quantity: 15, minStock: 8, reorderPoint: 12, unitCost: 42, location: 'Athletic Training Room' },
];

// === Maintenance Records ===

const MAINTENANCE_RECORDS: MaintenanceRecord[] = [
  { id: 'mt-1', assetId: 'eq-1', assetName: 'K-1 Timing System (Swiss Timing)', type: 'scheduled', date: 'Jan 8, 2026', cost: 2800, status: 'completed', technician: 'Swiss Timing Service' },
  { id: 'mt-2', assetId: 'eq-2', assetName: 'KaNeXT Arena LED Scoreboard', type: 'inspection', date: 'Dec 15, 2025', cost: 450, status: 'completed', technician: 'Daktronics Certified Tech' },
  { id: 'mt-3', assetId: 'eq-11', assetName: 'LED Court Projection System', type: 'repair', date: 'Feb 20, 2026', cost: 4200, status: 'scheduled', technician: 'Epson Pro Services' },
  { id: 'mt-4', assetId: 'pa-11', assetName: 'Outdoor Wayfinding Signage (12)', type: 'repair', date: 'Jan 25, 2026', cost: 3800, status: 'overdue', technician: 'SignCraft LLC' },
  { id: 'mt-5', assetId: 'eq-6', assetName: 'Portable PA System (QSC)', type: 'repair', date: 'Feb 15, 2026', cost: 1200, status: 'in-progress', technician: 'AudioPro Solutions' },
  { id: 'mt-6', assetId: 've-1', assetName: 'KaNeXT Arena', type: 'inspection', date: 'Feb 28, 2026', cost: 5500, status: 'scheduled', technician: 'Arena Services Group' },
  { id: 'mt-7', assetId: 'eq-14', assetName: 'X-Ray Mobile Unit', type: 'scheduled', date: 'Jan 30, 2026', cost: 1800, status: 'overdue', technician: 'MedEquip Services' },
  { id: 'mt-8', assetId: 'eq-7', assetName: 'AED Units (8)', type: 'inspection', date: 'Feb 1, 2026', cost: 600, status: 'completed', technician: 'ZOLL Medical' },
  { id: 'mt-9', assetId: 've-3', assetName: 'KaNeXT Church Championship Court', type: 'upgrade', date: 'Mar 1, 2026', cost: 45000, status: 'scheduled', technician: 'CourtTech Pro' },
  { id: 'mt-10', assetId: 'eq-12', assetName: 'Instant Replay System (Hawk-Eye)', type: 'scheduled', date: 'Feb 5, 2026', cost: 3200, status: 'completed', technician: 'Hawk-Eye Innovations' },
  { id: 'mt-11', assetId: 'pa-7', assetName: 'Press Conference Backdrop', type: 'repair', date: 'Feb 18, 2026', cost: 950, status: 'in-progress', technician: 'DisplayWorks' },
  { id: 'mt-12', assetId: 'eq-9', assetName: 'Wireless Microphone System (Shure)', type: 'scheduled', date: 'Jan 15, 2026', cost: 380, status: 'completed', technician: 'Shure Authorized Dealer' },
  { id: 'mt-13', assetId: 've-5', assetName: 'Gulf Coast Athletic Complex', type: 'scheduled', date: 'Mar 15, 2026', cost: 8200, status: 'scheduled', technician: 'Turf Management Inc.' },
  { id: 'mt-14', assetId: 'pa-9', assetName: 'Event Crowd Barriers (50)', type: 'inspection', date: 'Feb 12, 2026', cost: 0, status: 'completed', technician: 'Internal — James Wright' },
  { id: 'mt-15', assetId: 'eq-4', assetName: 'LiveU Solo+ Broadcast Kit', type: 'upgrade', date: 'Mar 10, 2026', cost: 6800, status: 'scheduled', technician: 'LiveU Support' },
];

// === Insurance Policies ===

const INSURANCE_POLICIES: InsurancePolicy[] = [
  { id: 'ip-1', name: 'General Liability — All Venues', provider: 'Hartford Financial', coverage: 5000000, premium: 48000, startDate: 'Jul 1, 2025', endDate: 'Jun 30, 2026', status: 'active', assets: ['KaNeXT Arena', 'Eagles Field Stadium', 'KaNeXT Church Championship Court'] },
  { id: 'ip-2', name: 'Equipment Floater — Electronics', provider: 'Chubb Insurance', coverage: 2000000, premium: 18000, startDate: 'Jan 1, 2026', endDate: 'Dec 31, 2026', status: 'active', assets: ['K-1 Timing System', 'LED Scoreboard', 'Hawk-Eye Replay', 'PTZ Camera System'] },
  { id: 'ip-3', name: 'Event Cancellation Coverage', provider: 'Lloyd\'s of London', coverage: 3000000, premium: 32000, startDate: 'Sep 1, 2025', endDate: 'Aug 31, 2026', status: 'active', assets: ['Conference Tournament', 'Championship Events'] },
  { id: 'ip-4', name: 'Workers Compensation — Event Staff', provider: 'State Farm', coverage: 1000000, premium: 22000, startDate: 'Jan 1, 2026', endDate: 'Dec 31, 2026', status: 'active', assets: ['All Staff', 'Volunteers'] },
  { id: 'ip-5', name: 'Property Insurance — Owned Assets', provider: 'Hartford Financial', coverage: 4500000, premium: 36000, startDate: 'Jul 1, 2025', endDate: 'Jun 30, 2026', status: 'expiring-soon', assets: ['Gulf Coast Athletic Complex', 'KaNeXT Church Indoor Training Center', 'Trophies', 'Display Cases'] },
  { id: 'ip-6', name: 'Cyber Liability — Digital Assets', provider: 'AIG', coverage: 1500000, premium: 12000, startDate: 'Mar 1, 2025', endDate: 'Feb 28, 2026', status: 'expired', assets: ['Digital Asset Library', 'Brand Files', 'Database Systems'] },
  { id: 'ip-7', name: 'Directors & Officers Liability', provider: 'Zurich Insurance', coverage: 3000000, premium: 28000, startDate: 'Jan 1, 2026', endDate: 'Dec 31, 2026', status: 'active', assets: ['Commissioner', 'Board Members', 'Executive Team'] },
  { id: 'ip-8', name: 'Participant Accident Coverage', provider: 'Markel Insurance', coverage: 2000000, premium: 15000, startDate: 'Aug 1, 2025', endDate: 'Jul 31, 2026', status: 'active', assets: ['All Competitive Events', 'Training Sessions'] },
  { id: 'ip-9', name: 'Vehicle Fleet Coverage', provider: 'Progressive Commercial', coverage: 500000, premium: 8500, startDate: 'Apr 1, 2025', endDate: 'Mar 31, 2026', status: 'pending-renewal', assets: ['Equipment Van (3)', 'Staff Shuttle (2)'] },
  { id: 'ip-10', name: 'Broadcast Equipment Rider', provider: 'Chubb Insurance', coverage: 800000, premium: 6200, startDate: 'Jan 1, 2026', endDate: 'Dec 31, 2026', status: 'active', assets: ['LiveU Kit', 'PTZ Cameras', 'Headset System', 'PA System'] },
  { id: 'ip-11', name: 'Medical Equipment Liability', provider: 'Berkshire Hathaway', coverage: 1200000, premium: 9800, startDate: 'Nov 1, 2025', endDate: 'Oct 31, 2026', status: 'active', assets: ['AED Units', 'X-Ray Unit', 'Training Kits'] },
  { id: 'ip-12', name: 'Trophy & Awards Coverage', provider: 'Lloyd\'s of London', coverage: 250000, premium: 4200, startDate: 'Sep 1, 2025', endDate: 'Aug 31, 2026', status: 'active', assets: ['KaNeXT Church Championship Trophy', 'All Award Items'] },
];

// === Reports ===

const REPORTS: AssetReport[] = [
  { id: 'rp-1', name: 'Asset Inventory Summary — Q1 2026', type: 'Inventory', date: 'Feb 14, 2026', format: 'PDF' },
  { id: 'rp-2', name: 'Equipment Condition Assessment', type: 'Maintenance', date: 'Feb 10, 2026', format: 'PDF' },
  { id: 'rp-3', name: 'Insurance Coverage Audit', type: 'Insurance', date: 'Feb 8, 2026', format: 'XLSX' },
  { id: 'rp-4', name: 'Digital Asset Usage Analytics', type: 'Digital', date: 'Feb 5, 2026', format: 'PDF' },
  { id: 'rp-5', name: 'Venue Utilization Report — January', type: 'Venues', date: 'Feb 1, 2026', format: 'CSV' },
  { id: 'rp-6', name: 'Maintenance Cost Analysis — FY 2025', type: 'Maintenance', date: 'Jan 28, 2026', format: 'XLSX' },
  { id: 'rp-7', name: 'Inventory Reorder Alerts', type: 'Inventory', date: 'Jan 25, 2026', format: 'CSV' },
  { id: 'rp-8', name: 'Asset Depreciation Schedule', type: 'Finance', date: 'Jan 20, 2026', format: 'XLSX' },
  { id: 'rp-9', name: 'Physical Asset Condition Report', type: 'Physical', date: 'Jan 15, 2026', format: 'PDF' },
  { id: 'rp-10', name: 'Brand Asset Compliance Check', type: 'Digital', date: 'Jan 10, 2026', format: 'PDF' },
  { id: 'rp-11', name: 'Year-over-Year Asset Valuation', type: 'Finance', date: 'Jan 5, 2026', format: 'PDF' },
  { id: 'rp-12', name: 'Venue Lease Expiration Tracker', type: 'Venues', date: 'Dec 20, 2025', format: 'CSV' },
];

// === Settings ===

const SETTINGS_TOGGLES: AssetSettingToggle[] = [
  { id: 'set-1', label: 'Auto-depreciation tracking', description: 'Automatically calculate and record asset depreciation on a monthly basis', enabled: true },
  { id: 'set-2', label: 'Low stock alerts', description: 'Send notifications when inventory items drop below reorder point', enabled: true },
  { id: 'set-3', label: 'Maintenance reminders', description: 'Send reminders 14 days before scheduled maintenance dates', enabled: true },
  { id: 'set-4', label: 'Insurance expiry warnings', description: 'Alert 60 days before insurance policy expiration', enabled: true },
  { id: 'set-5', label: 'Digital asset versioning', description: 'Track and maintain version history for all digital assets', enabled: true },
  { id: 'set-6', label: 'Asset check-out tracking', description: 'Require sign-out and sign-in for portable equipment', enabled: false },
  { id: 'set-7', label: 'Venue booking conflicts', description: 'Prevent double-booking of venue spaces and flag scheduling overlaps', enabled: true },
  { id: 'set-8', label: 'QR code asset labels', description: 'Generate QR codes for physical asset tracking and lookup', enabled: false },
];
