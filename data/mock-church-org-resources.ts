/**
 * Church Organization Resources — Mock Data & Types
 * Inventory, equipment, supplies, checkouts.
 */

// =============================================================================
// TYPES
// =============================================================================

export type ResourceCategory =
  | 'av_equipment'
  | 'musical_instruments'
  | 'furniture'
  | 'supplies'
  | 'vehicles'
  | 'technology'
  | 'kitchen';

export type ResourceCondition = 'excellent' | 'good' | 'fair' | 'needs_repair';
export type CheckoutStatus = 'active' | 'returned' | 'overdue';

export interface ChurchResource {
  id: string;
  name: string;
  category: ResourceCategory;
  quantity: number;
  available: number;
  condition: ResourceCondition;
  location: string;
  lastChecked: string;
  value: number;
}

export interface ResourceCheckout {
  id: string;
  resourceId: string;
  resourceName: string;
  checkedOutBy: string;
  ministry: string;
  checkoutDate: string;
  returnDate: string;
  status: CheckoutStatus;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const RESOURCE_CATEGORY_LABELS: Record<ResourceCategory, string> = {
  av_equipment: 'AV Equipment',
  musical_instruments: 'Musical Instruments',
  furniture: 'Furniture',
  supplies: 'Supplies',
  vehicles: 'Vehicles',
  technology: 'Technology',
  kitchen: 'Kitchen',
};

export const RESOURCE_CATEGORY_ICONS: Record<ResourceCategory, string> = {
  av_equipment: 'video.fill',
  musical_instruments: 'music.note',
  furniture: 'sofa.fill',
  supplies: 'shippingbox.fill',
  vehicles: 'car.fill',
  technology: 'desktopcomputer',
  kitchen: 'fork.knife',
};

export const RESOURCE_CATEGORY_COLORS: Record<ResourceCategory, string> = {
  av_equipment: '#1A1714',
  musical_instruments: '#1A1714',
  furniture: '#B8943E',
  supplies: '#5A8A6E',
  vehicles: '#B85C5C',
  technology: '#1A1714',
  kitchen: '#5A8A6E',
};

export const CONDITION_COLOR: Record<ResourceCondition, string> = {
  excellent: '#5A8A6E',
  good: '#1A1714',
  fair: '#B8943E',
  needs_repair: '#B85C5C',
};

export const CONDITION_LABELS: Record<ResourceCondition, string> = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  needs_repair: 'Needs Repair',
};

export const CHECKOUT_STATUS_COLOR: Record<CheckoutStatus, string> = {
  active: '#1A1714',
  returned: '#5A8A6E',
  overdue: '#B85C5C',
};

export const CHECKOUT_STATUS_LABELS: Record<CheckoutStatus, string> = {
  active: 'Active',
  returned: 'Returned',
  overdue: 'Overdue',
};

// =============================================================================
// SEEDED RESOURCES
// =============================================================================

const RESOURCES: ChurchResource[] = [
  {
    id: 'res-001',
    name: 'Behringer X32 Digital Mixer',
    category: 'av_equipment',
    quantity: 2,
    available: 1,
    condition: 'excellent',
    location: 'Main Sanctuary — Sound Booth',
    lastChecked: '2026-02-10',
    value: 3200,
  },
  {
    id: 'res-002',
    name: 'Shure SM58 Microphones',
    category: 'av_equipment',
    quantity: 12,
    available: 8,
    condition: 'good',
    location: 'AV Storage Room',
    lastChecked: '2026-02-08',
    value: 1200,
  },
  {
    id: 'res-003',
    name: 'Yamaha Grand Piano',
    category: 'musical_instruments',
    quantity: 1,
    available: 0,
    condition: 'excellent',
    location: 'Main Sanctuary — Stage',
    lastChecked: '2026-01-20',
    value: 18000,
  },
  {
    id: 'res-004',
    name: 'Acoustic Guitar Set',
    category: 'musical_instruments',
    quantity: 6,
    available: 4,
    condition: 'good',
    location: 'Worship Storage',
    lastChecked: '2026-02-05',
    value: 3600,
  },
  {
    id: 'res-005',
    name: 'Folding Tables (8ft)',
    category: 'furniture',
    quantity: 40,
    available: 28,
    condition: 'good',
    location: 'Fellowship Hall Storage',
    lastChecked: '2026-01-15',
    value: 4000,
  },
  {
    id: 'res-006',
    name: 'Folding Chairs',
    category: 'furniture',
    quantity: 200,
    available: 150,
    condition: 'fair',
    location: 'Fellowship Hall Storage',
    lastChecked: '2026-01-15',
    value: 6000,
  },
  {
    id: 'res-007',
    name: 'Church Van (15-passenger)',
    category: 'vehicles',
    quantity: 2,
    available: 1,
    condition: 'good',
    location: 'Parking Lot — Van Bay',
    lastChecked: '2026-02-12',
    value: 42000,
  },
  {
    id: 'res-008',
    name: 'MacBook Pro Laptops',
    category: 'technology',
    quantity: 5,
    available: 3,
    condition: 'excellent',
    location: 'Administrative Offices',
    lastChecked: '2026-02-14',
    value: 12500,
  },
  {
    id: 'res-009',
    name: 'Epson Projectors',
    category: 'av_equipment',
    quantity: 4,
    available: 2,
    condition: 'good',
    location: 'AV Storage Room',
    lastChecked: '2026-02-08',
    value: 6000,
  },
  {
    id: 'res-010',
    name: 'Communion Supplies Kit',
    category: 'supplies',
    quantity: 8,
    available: 6,
    condition: 'good',
    location: 'Chapel Storage',
    lastChecked: '2026-02-01',
    value: 800,
  },
  {
    id: 'res-011',
    name: 'Industrial Coffee Makers',
    category: 'kitchen',
    quantity: 3,
    available: 2,
    condition: 'fair',
    location: 'Commercial Kitchen',
    lastChecked: '2026-01-28',
    value: 1500,
  },
  {
    id: 'res-012',
    name: 'Portable PA System',
    category: 'av_equipment',
    quantity: 2,
    available: 0,
    condition: 'needs_repair',
    location: 'AV Storage Room',
    lastChecked: '2026-02-15',
    value: 1800,
  },
];

// =============================================================================
// CHECKOUTS
// =============================================================================

const CHECKOUTS: ResourceCheckout[] = [
  {
    id: 'co-001',
    resourceId: 'res-007',
    resourceName: 'Church Van (15-passenger)',
    checkedOutBy: 'Youth Pastor Davis',
    ministry: 'Youth Ministry',
    checkoutDate: '2026-02-15',
    returnDate: '2026-02-16',
    status: 'active',
  },
  {
    id: 'co-002',
    resourceId: 'res-005',
    resourceName: 'Folding Tables (8ft)',
    checkedOutBy: 'Sister Martha',
    ministry: 'Women\'s Ministry',
    checkoutDate: '2026-02-14',
    returnDate: '2026-02-22',
    status: 'active',
  },
  {
    id: 'co-003',
    resourceId: 'res-009',
    resourceName: 'Epson Projectors',
    checkedOutBy: 'Deacon Williams',
    ministry: 'Men\'s Fellowship',
    checkoutDate: '2026-02-10',
    returnDate: '2026-02-12',
    status: 'overdue',
  },
  {
    id: 'co-004',
    resourceId: 'res-008',
    resourceName: 'MacBook Pro Laptops',
    checkedOutBy: 'Media Team Lead',
    ministry: 'Media Ministry',
    checkoutDate: '2026-02-13',
    returnDate: '2026-02-20',
    status: 'active',
  },
  {
    id: 'co-005',
    resourceId: 'res-002',
    resourceName: 'Shure SM58 Microphones',
    checkedOutBy: 'Worship Director',
    ministry: 'Worship Team',
    checkoutDate: '2026-02-01',
    returnDate: '2026-02-08',
    status: 'returned',
  },
  {
    id: 'co-006',
    resourceId: 'res-004',
    resourceName: 'Acoustic Guitar Set',
    checkedOutBy: 'Brother James',
    ministry: 'Small Groups',
    checkoutDate: '2026-02-11',
    returnDate: '2026-02-14',
    status: 'overdue',
  },
];

// =============================================================================
// HELPERS
// =============================================================================

export function formatCurrency(value: number): string {
  return '$' + value.toLocaleString('en-US');
}

// =============================================================================
// DATA ACCESSOR
// =============================================================================

export function getChurchResourcesData() {
  return {
    resources: RESOURCES,
    checkouts: CHECKOUTS,
  };
}

export function getResourceById(id: string): ChurchResource | undefined {
  return RESOURCES.find((r) => r.id === id);
}
