/**
 * Education Organization Resources — Mock Data
 * Library, technology, lab equipment, software licenses.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface EduResource {
  id: string;
  name: string;
  category: 'library' | 'technology' | 'lab_equipment' | 'media' | 'software' | 'athletic_equipment';
  quantity: number;
  available: number;
  department: string;
  condition: 'new' | 'good' | 'fair' | 'needs_replacement';
  value: number;
}

export interface LibraryStats {
  totalVolumes: number;
  digitalResources: number;
  activeLoans: number;
  overdueItems: number;
  dailyVisitors: number;
  studyRooms: number;
  studyRoomsAvailable: number;
}

export interface TechInventory {
  laptops: { total: number; available: number; loaned: number };
  tablets: { total: number; available: number; loaned: number };
  projectors: { total: number; available: number; loaned: number };
  softwareLicenses: { name: string; total: number; used: number }[];
}

export interface CheckoutRequest {
  id: string;
  resourceName: string;
  requestedBy: string;
  department: string;
  date: string;
  returnDate: string;
  status: 'checked_out' | 'pending' | 'returned' | 'overdue';
}

export interface ResourceBudget {
  id: string;
  department: string;
  allocated: number;
  spent: number;
  remaining: number;
  category: string;
}

export type EduResourcesTabId =
  | 'library'
  | 'technology'
  | 'equipment'
  | 'software'
  | 'checkout'
  | 'budget';

export interface EduResourcesTab {
  id: EduResourcesTabId;
  label: string;
  icon: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const EDU_RESOURCES_TABS: EduResourcesTab[] = [
  { id: 'library', label: 'Library', icon: 'book.fill' },
  { id: 'technology', label: 'Technology', icon: 'laptopcomputer' },
  { id: 'equipment', label: 'Equipment', icon: 'wrench.and.screwdriver.fill' },
  { id: 'software', label: 'Software', icon: 'app.badge.fill' },
  { id: 'checkout', label: 'Checkout', icon: 'arrow.right.circle.fill' },
  { id: 'budget', label: 'Budget', icon: 'dollarsign.circle.fill' },
];

export const EDU_RESOURCES_SCOPE_CHIPS = [
  'All Resources',
  'Library',
  'Technology',
  'Lab Equipment',
  'Media',
  'Athletic',
];

// =============================================================================
// STATUS COLOR MAPS
// =============================================================================

export const RESOURCE_CATEGORY_COLOR: Record<EduResource['category'], string> = {
  library: '#5A8A6E',
  technology: '#1A1714',
  lab_equipment: '#1A1714',
  media: '#B8943E',
  software: '#1A1714',
  athletic_equipment: '#B85C5C',
};

export const RESOURCE_CATEGORY_LABEL: Record<EduResource['category'], string> = {
  library: 'LIBRARY',
  technology: 'TECHNOLOGY',
  lab_equipment: 'LAB EQUIPMENT',
  media: 'MEDIA',
  software: 'SOFTWARE',
  athletic_equipment: 'ATHLETIC',
};

export const CONDITION_COLOR: Record<EduResource['condition'], string> = {
  new: '#5A8A6E',
  good: '#1A1714',
  fair: '#B8943E',
  needs_replacement: '#B85C5C',
};

export const CONDITION_LABEL: Record<EduResource['condition'], string> = {
  new: 'NEW',
  good: 'GOOD',
  fair: 'FAIR',
  needs_replacement: 'REPLACE',
};

export const CHECKOUT_STATUS_COLOR: Record<CheckoutRequest['status'], string> = {
  checked_out: '#1A1714',
  pending: '#B8943E',
  returned: '#5A8A6E',
  overdue: '#B85C5C',
};

export const CHECKOUT_STATUS_LABEL: Record<CheckoutRequest['status'], string> = {
  checked_out: 'CHECKED OUT',
  pending: 'PENDING',
  returned: 'RETURNED',
  overdue: 'OVERDUE',
};

// =============================================================================
// MOCK DATA
// =============================================================================

export function getEduResourcesData(_scope: string) {
  const libraryStats: LibraryStats = {
    totalVolumes: 285000,
    digitalResources: 142000,
    activeLoans: 3450,
    overdueItems: 87,
    dailyVisitors: 620,
    studyRooms: 24,
    studyRoomsAvailable: 9,
  };

  const techInventory: TechInventory = {
    laptops: { total: 350, available: 82, loaned: 268 },
    tablets: { total: 120, available: 35, loaned: 85 },
    projectors: { total: 45, available: 12, loaned: 33 },
    softwareLicenses: [
      { name: 'Microsoft 365', total: 5000, used: 4280 },
      { name: 'Adobe Creative Cloud', total: 500, used: 412 },
      { name: 'MATLAB', total: 200, used: 156 },
      { name: 'AutoCAD', total: 150, used: 98 },
      { name: 'SPSS Statistics', total: 100, used: 72 },
      { name: 'Final Cut Pro', total: 50, used: 38 },
      { name: 'SolidWorks', total: 80, used: 65 },
    ],
  };

  const resources: EduResource[] = [
    {
      id: 'res-1', name: 'Dell Latitude Laptops', category: 'technology',
      quantity: 200, available: 48, department: 'IT Services',
      condition: 'good', value: 240000,
    },
    {
      id: 'res-2', name: 'Zeiss Microscopes', category: 'lab_equipment',
      quantity: 30, available: 12, department: 'Biology',
      condition: 'good', value: 180000,
    },
    {
      id: 'res-3', name: 'Canon EOS Cinema Cameras', category: 'media',
      quantity: 8, available: 3, department: 'Film Studies',
      condition: 'new', value: 64000,
    },
    {
      id: 'res-4', name: 'Oscilloscopes (Tektronix)', category: 'lab_equipment',
      quantity: 20, available: 8, department: 'Electrical Engineering',
      condition: 'good', value: 60000,
    },
    {
      id: 'res-5', name: 'iPad Pro (12.9")', category: 'technology',
      quantity: 120, available: 35, department: 'IT Services',
      condition: 'good', value: 144000,
    },
    {
      id: 'res-6', name: 'Epson Projectors', category: 'technology',
      quantity: 45, available: 12, department: 'IT Services',
      condition: 'fair', value: 67500,
    },
    {
      id: 'res-7', name: 'Chemistry Glassware Sets', category: 'lab_equipment',
      quantity: 40, available: 25, department: 'Chemistry',
      condition: 'good', value: 20000,
    },
    {
      id: 'res-8', name: 'Basketball Equipment Kit', category: 'athletic_equipment',
      quantity: 10, available: 4, department: 'Athletics',
      condition: 'fair', value: 15000,
    },
    {
      id: 'res-9', name: 'Reference Book Collection', category: 'library',
      quantity: 5200, available: 4800, department: 'Library Services',
      condition: 'good', value: 520000,
    },
    {
      id: 'res-10', name: '3D Printers (Ultimaker)', category: 'lab_equipment',
      quantity: 6, available: 2, department: 'Engineering',
      condition: 'new', value: 42000,
    },
  ];

  const checkoutQueue: CheckoutRequest[] = [
    {
      id: 'co-1', resourceName: 'Dell Latitude Laptop', requestedBy: 'Sarah Kim (Student)',
      department: 'Computer Science', date: 'Feb 14, 2026', returnDate: 'Feb 28, 2026',
      status: 'checked_out',
    },
    {
      id: 'co-2', resourceName: 'Canon EOS Cinema Camera', requestedBy: 'Prof. James Rivera',
      department: 'Film Studies', date: 'Feb 16, 2026', returnDate: 'Feb 23, 2026',
      status: 'checked_out',
    },
    {
      id: 'co-3', resourceName: 'iPad Pro', requestedBy: 'Dr. Maria Chen',
      department: 'Education', date: 'Feb 18, 2026', returnDate: 'Mar 4, 2026',
      status: 'pending',
    },
    {
      id: 'co-4', resourceName: '3D Printer (Ultimaker)', requestedBy: 'Engineering Club',
      department: 'Engineering', date: 'Feb 10, 2026', returnDate: 'Feb 17, 2026',
      status: 'overdue',
    },
    {
      id: 'co-5', resourceName: 'Oscilloscope', requestedBy: 'Alex Thompson (Student)',
      department: 'Electrical Engineering', date: 'Feb 12, 2026', returnDate: 'Feb 19, 2026',
      status: 'checked_out',
    },
    {
      id: 'co-6', resourceName: 'Zeiss Microscope', requestedBy: 'Dr. Lisa Wang',
      department: 'Biology', date: 'Feb 8, 2026', returnDate: 'Feb 15, 2026',
      status: 'returned',
    },
    {
      id: 'co-7', resourceName: 'Dell Latitude Laptop', requestedBy: 'Marcus Johnson (Student)',
      department: 'Business', date: 'Feb 5, 2026', returnDate: 'Feb 12, 2026',
      status: 'overdue',
    },
    {
      id: 'co-8', resourceName: 'Epson Projector', requestedBy: 'Prof. David Park',
      department: 'Philosophy', date: 'Feb 17, 2026', returnDate: 'Feb 18, 2026',
      status: 'pending',
    },
  ];

  const budgetAllocations: ResourceBudget[] = [
    { id: 'rb-1', department: 'IT Services', allocated: 850000, spent: 612000, remaining: 238000, category: 'Technology' },
    { id: 'rb-2', department: 'Library Services', allocated: 420000, spent: 285000, remaining: 135000, category: 'Collections' },
    { id: 'rb-3', department: 'Science Labs', allocated: 380000, spent: 298000, remaining: 82000, category: 'Equipment' },
    { id: 'rb-4', department: 'Athletics', allocated: 220000, spent: 178000, remaining: 42000, category: 'Equipment' },
    { id: 'rb-5', department: 'Media & Film', allocated: 150000, spent: 95000, remaining: 55000, category: 'Equipment' },
    { id: 'rb-6', department: 'Engineering', allocated: 310000, spent: 245000, remaining: 65000, category: 'Equipment' },
    { id: 'rb-7', department: 'Software Licensing', allocated: 480000, spent: 392000, remaining: 88000, category: 'Software' },
  ];

  return {
    libraryStats,
    techInventory,
    resources,
    checkoutQueue,
    budgetAllocations,
  };
}

export function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

export function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${value}`;
}
