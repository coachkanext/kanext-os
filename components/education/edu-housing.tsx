/**
 * Education Housing — 8-view residence life hub with pill toggle.
 * Views: Overview | Assignments | Inventory | Occupancy | Move-in/Move-out |
 *        Work Orders | Inspections | Resident Support
 *
 * RBAC:
 *   E1/E2 — All 8 views, full data
 *   E3    — Overview + Assignments + Work Orders + Resident Support
 *   E4    — Overview (own hall) + Assignments (own) + Work Orders (submit) + Resident Support
 *   E5    — Overview only (public-facing hall info + meal plans)
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';

const ACCENT = MODE_ACCENT.education;
import type { EducationRoleLens } from '@/utils/education-rbac';
import {
  isPresident,
  isDeanLevel,
  isFacultyLevel,
  isStudent,
  isEnrolled,
} from '@/utils/education-rbac';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  role?: EducationRoleLens;
  onSwitchTab?: (index: number) => void;
}

type HousingView =
  | 'overview'
  | 'assignments'
  | 'inventory'
  | 'occupancy'
  | 'move'
  | 'work-orders'
  | 'inspections'
  | 'support';

interface ViewDef {
  id: HousingView;
  label: string;
}

const ALL_VIEWS: ViewDef[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'occupancy', label: 'Occupancy' },
  { id: 'move', label: 'Move-in/Move-out' },
  { id: 'work-orders', label: 'Work Orders' },
  { id: 'inspections', label: 'Inspections' },
  { id: 'support', label: 'Resident Support' },
];

function getVisibleViews(role: EducationRoleLens): ViewDef[] {
  if (role === 'E1' || role === 'E2') return ALL_VIEWS;
  if (role === 'E3') return ALL_VIEWS.filter((v) =>
    ['overview', 'assignments', 'work-orders', 'support'].includes(v.id),
  );
  if (role === 'E4') return ALL_VIEWS.filter((v) =>
    ['overview', 'assignments', 'work-orders', 'support'].includes(v.id),
  );
  // E5
  return ALL_VIEWS.filter((v) => v.id === 'overview');
}

// =============================================================================
// INLINE MOCK DATA — EXISTING (preserved)
// =============================================================================

// --- Housing Summary ---

interface HousingSummary {
  totalBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
  waitlistCount: number;
  totalHalls: number;
  avgCostPerSemester: string;
  housingRevenue: string;
  maintenanceRequests: number;
  openRequests: number;
}

const HOUSING_SUMMARY: HousingSummary = {
  totalBeds: 3200,
  occupiedBeds: 2980,
  occupancyRate: 93.1,
  waitlistCount: 142,
  totalHalls: 8,
  avgCostPerSemester: '$4,200',
  housingRevenue: '$13.4M',
  maintenanceRequests: 847,
  openRequests: 32,
};

// --- Residence Halls ---

interface ResidenceHall {
  id: string;
  name: string;
  capacity: number;
  occupancy: number;
  type: 'traditional' | 'suite' | 'apartment' | 'honors';
  yearBuilt: number;
  floors: number;
  costPerSemester: string;
  amenities: string[];
  status: 'operational' | 'renovation' | 'closed';
  raCount: number;
  coed: boolean;
  yearRestriction: string;
  ada: boolean;
}

const RESIDENCE_HALLS: ResidenceHall[] = [
  {
    id: 'hall-1',
    name: 'Robinson Hall',
    capacity: 320,
    occupancy: 308,
    type: 'traditional',
    yearBuilt: 2015,
    floors: 6,
    costPerSemester: '$3,800',
    amenities: ['Laundry', 'Study lounge', 'Kitchen', 'Computer lab', 'Game room'],
    status: 'operational',
    raCount: 8,
    coed: true,
    yearRestriction: 'Freshmen',
    ada: true,
  },
  {
    id: 'hall-2',
    name: 'Campbell Hall',
    capacity: 280,
    occupancy: 272,
    type: 'traditional',
    yearBuilt: 2008,
    floors: 5,
    costPerSemester: '$3,600',
    amenities: ['Laundry', 'Study lounge', 'Kitchen', 'Fitness area'],
    status: 'operational',
    raCount: 7,
    coed: true,
    yearRestriction: 'Freshmen',
    ada: true,
  },
  {
    id: 'hall-3',
    name: 'Drew Hall',
    capacity: 450,
    occupancy: 420,
    type: 'suite',
    yearBuilt: 2018,
    floors: 4,
    costPerSemester: '$4,400',
    amenities: ['Suite living room', 'Laundry', 'Study lounge', 'Kitchen', 'Rooftop terrace'],
    status: 'operational',
    raCount: 10,
    coed: true,
    yearRestriction: 'Sophomores+',
    ada: true,
  },
  {
    id: 'hall-4',
    name: 'University Apartments',
    capacity: 600,
    occupancy: 548,
    type: 'apartment',
    yearBuilt: 2020,
    floors: 4,
    costPerSemester: '$5,200',
    amenities: ['Full kitchen', 'Living room', 'In-unit laundry', 'Parking', 'Pool'],
    status: 'operational',
    raCount: 6,
    coed: true,
    yearRestriction: 'Juniors/Seniors',
    ada: true,
  },
  {
    id: 'hall-5',
    name: 'Scholars Hall',
    capacity: 180,
    occupancy: 178,
    type: 'honors',
    yearBuilt: 2019,
    floors: 4,
    costPerSemester: '$4,800',
    amenities: ['Suite living room', 'Seminar room', 'Library', 'Kitchen', 'Faculty-in-residence'],
    status: 'operational',
    raCount: 4,
    coed: true,
    yearRestriction: 'Honors Students',
    ada: true,
  },
  {
    id: 'hall-6',
    name: 'Morrison Residence',
    capacity: 350,
    occupancy: 334,
    type: 'suite',
    yearBuilt: 2012,
    floors: 5,
    costPerSemester: '$4,200',
    amenities: ['Laundry', 'Study lounge', 'Kitchen', 'Bike storage', 'Courtyard'],
    status: 'operational',
    raCount: 8,
    coed: true,
    yearRestriction: 'All Years',
    ada: true,
  },
  {
    id: 'hall-7',
    name: 'Whitaker Hall',
    capacity: 240,
    occupancy: 0,
    type: 'traditional',
    yearBuilt: 1998,
    floors: 4,
    costPerSemester: '$3,400',
    amenities: ['Laundry', 'Study lounge'],
    status: 'renovation',
    raCount: 0,
    coed: true,
    yearRestriction: 'N/A',
    ada: false,
  },
  {
    id: 'hall-8',
    name: 'Eagle Village',
    capacity: 780,
    occupancy: 720,
    type: 'apartment',
    yearBuilt: 2022,
    floors: 3,
    costPerSemester: '$4,600',
    amenities: ['Full kitchen', 'Living room', 'In-unit laundry', 'Clubhouse', 'Fitness center', 'Study pods'],
    status: 'operational',
    raCount: 8,
    coed: true,
    yearRestriction: 'Sophomores+',
    ada: true,
  },
];

const HALL_TYPE_LABEL: Record<string, string> = {
  traditional: 'Traditional',
  suite: 'Suite',
  apartment: 'Apartment',
  honors: 'Honors',
};

const HALL_STATUS_COLOR: Record<string, string> = {
  operational: '#22C55E',
  renovation: '#F59E0B',
  closed: '#EF4444',
};

// --- Room Assignment (E4 view) ---

interface RoomAssignment {
  hall: string;
  room: string;
  type: string;
  floor: number;
  roommates: string[];
  moveInDate: string;
  moveOutDate: string;
  cost: string;
  status: 'confirmed' | 'pending' | 'waitlisted';
  raName: string;
  raPhone: string;
  raEmail: string;
}

const STUDENT_ROOM: RoomAssignment = {
  hall: 'Drew Hall',
  room: 'Suite 312B',
  type: 'Double Suite',
  floor: 3,
  roommates: ['Alex Rivera'],
  moveInDate: 'Jan 11, 2026',
  moveOutDate: 'May 9, 2026',
  cost: '$4,400/semester',
  status: 'confirmed',
  raName: 'Jordan Lewis',
  raPhone: '(404) 555-6001',
  raEmail: 'jlewis@howard.edu',
};

// --- Meal Plans ---

interface MealPlan {
  id: string;
  name: string;
  mealsPerWeek: number;
  diningDollars: string;
  costPerSemester: string;
  guestMeals: number;
  description: string;
  recommended: string;
  popular: boolean;
}

const MEAL_PLANS: MealPlan[] = [
  { id: 'mp-1', name: 'Unlimited Platinum', mealsPerWeek: 21, diningDollars: '$300', costPerSemester: '$3,200', guestMeals: 10, description: 'Unlimited dining hall access + dining dollars for caf\u00E9s', recommended: 'Freshmen', popular: true },
  { id: 'mp-2', name: 'Gold 15', mealsPerWeek: 15, diningDollars: '$200', costPerSemester: '$2,800', guestMeals: 6, description: '15 meals per week + dining dollars', recommended: 'Sophomores', popular: true },
  { id: 'mp-3', name: 'Silver 10', mealsPerWeek: 10, diningDollars: '$150', costPerSemester: '$2,200', guestMeals: 4, description: '10 meals per week + dining dollars', recommended: 'Upperclassmen', popular: false },
  { id: 'mp-4', name: 'Bronze 5', mealsPerWeek: 5, diningDollars: '$100', costPerSemester: '$1,400', guestMeals: 2, description: '5 meals per week + dining dollars', recommended: 'Apartments', popular: false },
  { id: 'mp-5', name: 'Commuter Plan', mealsPerWeek: 3, diningDollars: '$200', costPerSemester: '$900', guestMeals: 2, description: '3 meals per week + extra dining dollars', recommended: 'Commuters', popular: false },
];

// --- Student Meal Plan (E4 view) ---

interface StudentMealPlan {
  plan: string;
  mealsRemaining: number;
  mealsTotal: number;
  diningDollarsRemaining: string;
  diningDollarsTotal: string;
  guestMealsRemaining: number;
  weeksRemaining: number;
}

const STUDENT_MEAL: StudentMealPlan = {
  plan: 'Gold 15',
  mealsRemaining: 98,
  mealsTotal: 165,
  diningDollarsRemaining: '$124.50',
  diningDollarsTotal: '$200.00',
  guestMealsRemaining: 4,
  weeksRemaining: 11,
};

// --- Housing Application Timeline ---

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
}

const HOUSING_TIMELINE: TimelineEvent[] = [
  { id: 'tl-1', date: 'Nov 1', title: 'Housing Application Opens', description: 'Current students can submit housing applications for next academic year', status: 'completed' },
  { id: 'tl-2', date: 'Dec 15', title: 'Priority Deadline', description: 'Applications received by this date get priority placement', status: 'completed' },
  { id: 'tl-3', date: 'Jan 15', title: 'Room Selection Opens (Seniors)', description: 'Senior students select rooms first', status: 'completed' },
  { id: 'tl-4', date: 'Feb 1', title: 'Room Selection Opens (Juniors)', description: 'Junior students select rooms', status: 'completed' },
  { id: 'tl-5', date: 'Feb 15', title: 'Room Selection Opens (Sophomores)', description: 'Sophomore students select rooms', status: 'current' },
  { id: 'tl-6', date: 'Mar 1', title: 'Incoming Freshmen Applications Due', description: 'New student housing applications deadline', status: 'upcoming' },
  { id: 'tl-7', date: 'Apr 1', title: 'Assignment Notifications', description: 'All housing assignments sent via email', status: 'upcoming' },
  { id: 'tl-8', date: 'May 1', title: 'Roommate Request Deadline', description: 'Last day to submit roommate preferences', status: 'upcoming' },
  { id: 'tl-9', date: 'Aug 15', title: 'Fall Move-In Day', description: 'Residence halls open for Fall 2026 move-in', status: 'upcoming' },
];

const TIMELINE_STATUS_COLOR: Record<string, string> = {
  completed: '#22C55E',
  current: ACCENT,
  upcoming: '#A1A1AA',
};

// --- RA Contacts ---

interface RAContact {
  id: string;
  name: string;
  hall: string;
  floor: string;
  phone: string;
  email: string;
  officeHours: string;
}

const RA_CONTACTS: RAContact[] = [
  { id: 'ra-1', name: 'Jordan Lewis', hall: 'Drew Hall', floor: '3rd Floor', phone: '(404) 555-6001', email: 'jlewis@howard.edu', officeHours: 'Sun\u2013Thu 8PM\u201311PM' },
  { id: 'ra-2', name: 'Maya Patel', hall: 'Robinson Hall', floor: '1st\u20132nd Floor', phone: '(404) 555-6002', email: 'mpatel@howard.edu', officeHours: 'Sun\u2013Thu 8PM\u201311PM' },
  { id: 'ra-3', name: 'Chris Thompson', hall: 'Robinson Hall', floor: '3rd\u20134th Floor', phone: '(404) 555-6003', email: 'cthompson@howard.edu', officeHours: 'Sun\u2013Thu 7PM\u201310PM' },
  { id: 'ra-4', name: 'Ashley Kim', hall: 'Scholars Hall', floor: 'All Floors', phone: '(404) 555-6004', email: 'akim@howard.edu', officeHours: 'Sun\u2013Thu 8PM\u201311PM' },
  { id: 'ra-5', name: 'Marcus Brown', hall: 'Eagle Village', floor: 'Building A\u2013B', phone: '(404) 555-6005', email: 'mbrown@howard.edu', officeHours: 'Mon\u2013Fri 7PM\u201310PM' },
  { id: 'ra-6', name: 'Sofia Garcia', hall: 'Campbell Hall', floor: '1st\u20133rd Floor', phone: '(404) 555-6006', email: 'sgarcia@howard.edu', officeHours: 'Sun\u2013Thu 8PM\u201311PM' },
  { id: 'ra-7', name: 'Derek Washington', hall: 'Morrison Residence', floor: 'All Floors', phone: '(404) 555-6007', email: 'dwashington@howard.edu', officeHours: 'Sun\u2013Thu 7PM\u201311PM' },
  { id: 'ra-8', name: 'Emily Chen', hall: 'University Apartments', floor: 'All Buildings', phone: '(404) 555-6008', email: 'echen@howard.edu', officeHours: 'Mon\u2013Thu 6PM\u20139PM' },
];

// =============================================================================
// NEW MOCK DATA — ASSIGNMENTS (admin view)
// =============================================================================

interface AdminAssignment {
  id: string;
  studentName: string;
  studentId: string;
  hall: string;
  room: string;
  type: string;
  roommates: string[];
  status: 'confirmed' | 'pending' | 'waitlisted' | 'cancelled';
  moveInDate: string;
  moveOutDate: string;
  matchScore?: number;
}

const ADMIN_ASSIGNMENTS: AdminAssignment[] = [
  { id: 'asgn-1', studentName: 'Marcus Johnson', studentId: 'W20230112', hall: 'Robinson Hall', room: '204A', type: 'Double', roommates: ['Tyler Brooks'], status: 'confirmed', moveInDate: 'Jan 11, 2026', moveOutDate: 'May 9, 2026', matchScore: 87 },
  { id: 'asgn-2', studentName: 'Aisha Williams', studentId: 'W20230245', hall: 'Drew Hall', room: 'Suite 415A', type: 'Suite Double', roommates: ['Nina Patel'], status: 'confirmed', moveInDate: 'Jan 11, 2026', moveOutDate: 'May 9, 2026', matchScore: 92 },
  { id: 'asgn-3', studentName: 'David Chen', studentId: 'W20240089', hall: 'Scholars Hall', room: '108', type: 'Single', roommates: [], status: 'confirmed', moveInDate: 'Jan 11, 2026', moveOutDate: 'May 9, 2026' },
  { id: 'asgn-4', studentName: 'Taylor Morgan', studentId: 'W20240321', hall: 'Eagle Village', room: 'Apt 7C', type: 'Apartment Single', roommates: ['Jamie Lee', 'Sam Torres'], status: 'confirmed', moveInDate: 'Jan 11, 2026', moveOutDate: 'May 9, 2026', matchScore: 78 },
  { id: 'asgn-5', studentName: 'Jordan Pierce', studentId: 'W20250044', hall: 'Robinson Hall', room: 'TBD', type: 'Double', roommates: [], status: 'pending', moveInDate: 'Aug 15, 2026', moveOutDate: 'Dec 12, 2026' },
  { id: 'asgn-6', studentName: 'Olivia Ramirez', studentId: 'W20250102', hall: 'Drew Hall', room: 'TBD', type: 'Suite Double', roommates: [], status: 'waitlisted', moveInDate: 'Aug 15, 2026', moveOutDate: 'Dec 12, 2026' },
  { id: 'asgn-7', studentName: 'Ethan Park', studentId: 'W20230410', hall: 'University Apartments', room: 'Apt 12B', type: 'Apartment Double', roommates: ['Ryan Clark'], status: 'confirmed', moveInDate: 'Jan 11, 2026', moveOutDate: 'May 9, 2026', matchScore: 84 },
  { id: 'asgn-8', studentName: 'Mia Robinson', studentId: 'W20250200', hall: 'Campbell Hall', room: 'TBD', type: 'Double', roommates: [], status: 'pending', moveInDate: 'Aug 15, 2026', moveOutDate: 'Dec 12, 2026' },
];

const ASSIGNMENT_STATUS_COLOR: Record<string, string> = {
  confirmed: '#22C55E',
  pending: '#F59E0B',
  waitlisted: ACCENT,
  cancelled: '#EF4444',
};

// =============================================================================
// NEW MOCK DATA — INVENTORY
// =============================================================================

interface HallInventory {
  hallId: string;
  hallName: string;
  singleBeds: number;
  doubleBeds: number;
  suiteBeds: number;
  adaRooms: number;
  desks: number;
  dressers: number;
  mattresses: number;
  needsReplacement: number;
  amenities: string[];
}

const HALL_INVENTORY: HallInventory[] = [
  { hallId: 'hall-1', hallName: 'Robinson Hall', singleBeds: 40, doubleBeds: 280, suiteBeds: 0, adaRooms: 8, desks: 320, dressers: 320, mattresses: 320, needsReplacement: 12, amenities: ['Laundry (3 rooms)', 'Study lounge (2)', 'Kitchen', 'Computer lab', 'Game room'] },
  { hallId: 'hall-2', hallName: 'Campbell Hall', singleBeds: 30, doubleBeds: 250, suiteBeds: 0, adaRooms: 6, desks: 280, dressers: 280, mattresses: 280, needsReplacement: 18, amenities: ['Laundry (2 rooms)', 'Study lounge', 'Kitchen', 'Fitness area'] },
  { hallId: 'hall-3', hallName: 'Drew Hall', singleBeds: 0, doubleBeds: 0, suiteBeds: 450, adaRooms: 10, desks: 450, dressers: 450, mattresses: 450, needsReplacement: 4, amenities: ['Suite living rooms', 'Laundry (4 rooms)', 'Study lounge (3)', 'Kitchen', 'Rooftop terrace'] },
  { hallId: 'hall-4', hallName: 'University Apartments', singleBeds: 120, doubleBeds: 480, suiteBeds: 0, adaRooms: 14, desks: 600, dressers: 600, mattresses: 600, needsReplacement: 8, amenities: ['Full kitchens', 'In-unit laundry', 'Parking (420 spots)', 'Pool', 'Clubhouse'] },
  { hallId: 'hall-5', hallName: 'Scholars Hall', singleBeds: 60, doubleBeds: 120, suiteBeds: 0, adaRooms: 4, desks: 180, dressers: 180, mattresses: 180, needsReplacement: 2, amenities: ['Suite living rooms', 'Seminar room', 'Library', 'Kitchen', 'Faculty-in-residence apt'] },
  { hallId: 'hall-6', hallName: 'Morrison Residence', singleBeds: 0, doubleBeds: 0, suiteBeds: 350, adaRooms: 8, desks: 350, dressers: 350, mattresses: 350, needsReplacement: 14, amenities: ['Laundry (3 rooms)', 'Study lounge (2)', 'Kitchen', 'Bike storage (60)', 'Courtyard'] },
  { hallId: 'hall-7', hallName: 'Whitaker Hall', singleBeds: 40, doubleBeds: 200, suiteBeds: 0, adaRooms: 0, desks: 240, dressers: 240, mattresses: 240, needsReplacement: 62, amenities: ['Laundry', 'Study lounge'] },
  { hallId: 'hall-8', hallName: 'Eagle Village', singleBeds: 80, doubleBeds: 700, suiteBeds: 0, adaRooms: 18, desks: 780, dressers: 780, mattresses: 780, needsReplacement: 6, amenities: ['Full kitchens', 'In-unit laundry', 'Clubhouse', 'Fitness center', 'Study pods (8)'] },
];

// =============================================================================
// NEW MOCK DATA — OCCUPANCY (floor-level detail)
// =============================================================================

interface FloorOccupancy {
  floor: number;
  capacity: number;
  occupied: number;
  emptyBeds: number;
}

interface HallOccupancy {
  hallId: string;
  hallName: string;
  totalCapacity: number;
  totalOccupied: number;
  utilizationTrend: 'up' | 'down' | 'flat';
  trendPct: string;
  floors: FloorOccupancy[];
}

const HALL_OCCUPANCY: HallOccupancy[] = [
  { hallId: 'hall-1', hallName: 'Robinson Hall', totalCapacity: 320, totalOccupied: 308, utilizationTrend: 'up', trendPct: '+1.2%',
    floors: [
      { floor: 1, capacity: 52, occupied: 50, emptyBeds: 2 },
      { floor: 2, capacity: 56, occupied: 54, emptyBeds: 2 },
      { floor: 3, capacity: 56, occupied: 55, emptyBeds: 1 },
      { floor: 4, capacity: 56, occupied: 53, emptyBeds: 3 },
      { floor: 5, capacity: 52, occupied: 50, emptyBeds: 2 },
      { floor: 6, capacity: 48, occupied: 46, emptyBeds: 2 },
    ],
  },
  { hallId: 'hall-3', hallName: 'Drew Hall', totalCapacity: 450, totalOccupied: 420, utilizationTrend: 'flat', trendPct: '+0.0%',
    floors: [
      { floor: 1, capacity: 110, occupied: 104, emptyBeds: 6 },
      { floor: 2, capacity: 120, occupied: 114, emptyBeds: 6 },
      { floor: 3, capacity: 120, occupied: 112, emptyBeds: 8 },
      { floor: 4, capacity: 100, occupied: 90, emptyBeds: 10 },
    ],
  },
  { hallId: 'hall-4', hallName: 'University Apartments', totalCapacity: 600, totalOccupied: 548, utilizationTrend: 'down', trendPct: '-2.1%',
    floors: [
      { floor: 1, capacity: 160, occupied: 142, emptyBeds: 18 },
      { floor: 2, capacity: 160, occupied: 148, emptyBeds: 12 },
      { floor: 3, capacity: 140, occupied: 130, emptyBeds: 10 },
      { floor: 4, capacity: 140, occupied: 128, emptyBeds: 12 },
    ],
  },
  { hallId: 'hall-8', hallName: 'Eagle Village', totalCapacity: 780, totalOccupied: 720, utilizationTrend: 'up', trendPct: '+3.4%',
    floors: [
      { floor: 1, capacity: 260, occupied: 240, emptyBeds: 20 },
      { floor: 2, capacity: 260, occupied: 244, emptyBeds: 16 },
      { floor: 3, capacity: 260, occupied: 236, emptyBeds: 24 },
    ],
  },
];

// =============================================================================
// NEW MOCK DATA — MOVE-IN / MOVE-OUT
// =============================================================================

interface MoveEvent {
  id: string;
  type: 'move-in' | 'move-out';
  date: string;
  timeSlot: string;
  hall: string;
  studentCount: number;
  status: 'completed' | 'in-progress' | 'scheduled';
  keysIssued?: number;
  keysReturned?: number;
  checklistItems: number;
  checklistCompleted: number;
}

const MOVE_EVENTS: MoveEvent[] = [
  { id: 'mv-1', type: 'move-in', date: 'Jan 11, 2026', timeSlot: '8AM\u201312PM', hall: 'Robinson Hall', studentCount: 148, status: 'completed', keysIssued: 148, checklistItems: 8, checklistCompleted: 8 },
  { id: 'mv-2', type: 'move-in', date: 'Jan 11, 2026', timeSlot: '12PM\u20134PM', hall: 'Drew Hall', studentCount: 210, status: 'completed', keysIssued: 210, checklistItems: 8, checklistCompleted: 8 },
  { id: 'mv-3', type: 'move-in', date: 'Jan 11, 2026', timeSlot: '8AM\u20134PM', hall: 'Eagle Village', studentCount: 360, status: 'completed', keysIssued: 358, checklistItems: 8, checklistCompleted: 7 },
  { id: 'mv-4', type: 'move-out', date: 'May 9, 2026', timeSlot: '8AM\u201312PM', hall: 'Robinson Hall', studentCount: 308, status: 'scheduled', keysReturned: 0, checklistItems: 10, checklistCompleted: 0 },
  { id: 'mv-5', type: 'move-out', date: 'May 9, 2026', timeSlot: '8AM\u20134PM', hall: 'Drew Hall', studentCount: 420, status: 'scheduled', keysReturned: 0, checklistItems: 10, checklistCompleted: 0 },
  { id: 'mv-6', type: 'move-out', date: 'May 9, 2026', timeSlot: '8AM\u20134PM', hall: 'Eagle Village', studentCount: 720, status: 'scheduled', keysReturned: 0, checklistItems: 10, checklistCompleted: 0 },
  { id: 'mv-7', type: 'move-in', date: 'Aug 15, 2026', timeSlot: '7AM\u20136PM', hall: 'All Halls', studentCount: 2400, status: 'scheduled', checklistItems: 8, checklistCompleted: 0 },
];

const MOVE_STATUS_COLOR: Record<string, string> = {
  completed: '#22C55E',
  'in-progress': ACCENT,
  scheduled: '#A1A1AA',
};

interface KeyTracking {
  hall: string;
  totalKeys: number;
  issued: number;
  returned: number;
  lost: number;
  replacements: number;
}

const KEY_TRACKING: KeyTracking[] = [
  { hall: 'Robinson Hall', totalKeys: 340, issued: 310, returned: 0, lost: 2, replacements: 4 },
  { hall: 'Drew Hall', totalKeys: 460, issued: 422, returned: 0, lost: 1, replacements: 3 },
  { hall: 'Eagle Village', totalKeys: 800, issued: 724, returned: 0, lost: 4, replacements: 6 },
  { hall: 'University Apartments', totalKeys: 620, issued: 550, returned: 0, lost: 3, replacements: 5 },
  { hall: 'Scholars Hall', totalKeys: 190, issued: 180, returned: 0, lost: 0, replacements: 1 },
];

// =============================================================================
// NEW MOCK DATA — WORK ORDERS
// =============================================================================

interface WorkOrder {
  id: string;
  title: string;
  hall: string;
  room: string;
  category: 'plumbing' | 'electrical' | 'hvac' | 'furniture' | 'pest' | 'general' | 'lock';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'assigned' | 'in-progress' | 'completed' | 'deferred';
  submittedBy: string;
  submittedDate: string;
  assignedTo?: string;
  resolvedDate?: string;
  description: string;
}

const WORK_ORDERS: WorkOrder[] = [
  { id: 'wo-1', title: 'Broken radiator valve', hall: 'Campbell Hall', room: '302', category: 'hvac', priority: 'critical', status: 'in-progress', submittedBy: 'RA Sofia Garcia', submittedDate: 'Feb 14', assignedTo: 'Tony Martinez', description: 'Radiator valve leaking hot water. Room evacuated to temp room.' },
  { id: 'wo-2', title: 'Shower drain clogged', hall: 'Robinson Hall', room: '2nd Floor Bath', category: 'plumbing', priority: 'high', status: 'assigned', submittedBy: 'RA Maya Patel', submittedDate: 'Feb 15', assignedTo: 'Jim Cooper', description: 'Shared bathroom shower drain backing up. Affecting 4 rooms.' },
  { id: 'wo-3', title: 'Light fixture flickering', hall: 'Drew Hall', room: 'Suite 208', category: 'electrical', priority: 'medium', status: 'open', submittedBy: 'Student', submittedDate: 'Feb 16', description: 'Overhead light in common area flickers intermittently.' },
  { id: 'wo-4', title: 'Desk drawer stuck', hall: 'Drew Hall', room: 'Suite 312B', category: 'furniture', priority: 'low', status: 'open', submittedBy: 'Student', submittedDate: 'Feb 16', description: 'Right drawer on desk will not open. Appears jammed.' },
  { id: 'wo-5', title: 'HVAC not cooling', hall: 'Eagle Village', room: 'Apt 14A', category: 'hvac', priority: 'high', status: 'assigned', submittedBy: 'Student', submittedDate: 'Feb 13', assignedTo: 'Tony Martinez', description: 'AC unit not producing cold air. Thermostat set to 68F but room at 78F.' },
  { id: 'wo-6', title: 'Lock malfunction', hall: 'Morrison Residence', room: '412', category: 'lock', priority: 'high', status: 'completed', submittedBy: 'RA Derek Washington', submittedDate: 'Feb 10', assignedTo: 'Campus Locksmith', resolvedDate: 'Feb 10', description: 'Card reader not recognizing student ID. Emergency lockout.' },
  { id: 'wo-7', title: 'Pest control \u2014 ants', hall: 'Campbell Hall', room: '118', category: 'pest', priority: 'medium', status: 'assigned', submittedBy: 'Student', submittedDate: 'Feb 12', assignedTo: 'Exterminators Inc.', description: 'Ant infestation near window area. Trail visible from outside wall.' },
  { id: 'wo-8', title: 'Replace mattress', hall: 'Robinson Hall', room: '504B', category: 'furniture', priority: 'low', status: 'deferred', submittedBy: 'Student', submittedDate: 'Feb 1', description: 'Mattress has visible sag. Student requesting replacement.' },
  { id: 'wo-9', title: 'Toilet running continuously', hall: 'Scholars Hall', room: '206', category: 'plumbing', priority: 'medium', status: 'completed', submittedBy: 'RA Ashley Kim', submittedDate: 'Feb 8', assignedTo: 'Jim Cooper', resolvedDate: 'Feb 9', description: 'Toilet flapper valve not sealing. Water running continuously.' },
];

const PRIORITY_COLOR: Record<string, string> = {
  critical: '#EF4444',
  high: '#F59E0B',
  medium: ACCENT,
  low: '#A1A1AA',
};

const WO_STATUS_COLOR: Record<string, string> = {
  open: '#F59E0B',
  assigned: ACCENT,
  'in-progress': ACCENT,
  completed: '#22C55E',
  deferred: '#A1A1AA',
};

// =============================================================================
// NEW MOCK DATA — INSPECTIONS
// =============================================================================

interface Inspection {
  id: string;
  hall: string;
  room: string;
  type: 'routine' | 'health-safety' | 'move-out' | 'fire-safety';
  scheduledDate: string;
  completedDate?: string;
  inspector: string;
  status: 'passed' | 'failed' | 'scheduled' | 'in-progress';
  violations: string[];
  notes?: string;
}

const INSPECTIONS: Inspection[] = [
  { id: 'insp-1', hall: 'Robinson Hall', room: 'All Rooms', type: 'health-safety', scheduledDate: 'Feb 20, 2026', inspector: 'Housing Staff', status: 'scheduled', violations: [] },
  { id: 'insp-2', hall: 'Drew Hall', room: 'Suite 415A', type: 'routine', scheduledDate: 'Feb 10, 2026', completedDate: 'Feb 10, 2026', inspector: 'RA Jordan Lewis', status: 'passed', violations: [], notes: 'Room in excellent condition.' },
  { id: 'insp-3', hall: 'Campbell Hall', room: '118', type: 'health-safety', scheduledDate: 'Feb 12, 2026', completedDate: 'Feb 12, 2026', inspector: 'Housing Staff', status: 'failed', violations: ['Blocked fire exit path', 'Food waste near window attracting pests'], notes: 'Student given 48hr to remediate. Follow-up scheduled Feb 14.' },
  { id: 'insp-4', hall: 'Eagle Village', room: 'Apt 7C', type: 'routine', scheduledDate: 'Feb 5, 2026', completedDate: 'Feb 5, 2026', inspector: 'RA Marcus Brown', status: 'passed', violations: [] },
  { id: 'insp-5', hall: 'All Halls', room: 'Common Areas', type: 'fire-safety', scheduledDate: 'Mar 1, 2026', inspector: 'Fire Marshal', status: 'scheduled', violations: [] },
  { id: 'insp-6', hall: 'Morrison Residence', room: '204', type: 'routine', scheduledDate: 'Feb 8, 2026', completedDate: 'Feb 8, 2026', inspector: 'RA Derek Washington', status: 'failed', violations: ['Extension cord daisy-chained (fire hazard)'], notes: 'Violation corrected same day. Re-inspected and passed.' },
  { id: 'insp-7', hall: 'Scholars Hall', room: 'All Rooms', type: 'health-safety', scheduledDate: 'Mar 10, 2026', inspector: 'Housing Staff', status: 'scheduled', violations: [] },
  { id: 'insp-8', hall: 'Campbell Hall', room: '118', type: 'health-safety', scheduledDate: 'Feb 14, 2026', completedDate: 'Feb 14, 2026', inspector: 'Housing Staff', status: 'passed', violations: [], notes: 'Follow-up inspection. All violations remediated.' },
];

const INSPECTION_STATUS_COLOR: Record<string, string> = {
  passed: '#22C55E',
  failed: '#EF4444',
  scheduled: '#A1A1AA',
  'in-progress': ACCENT,
};

const INSPECTION_TYPE_LABEL: Record<string, string> = {
  routine: 'Routine',
  'health-safety': 'Health & Safety',
  'move-out': 'Move-Out',
  'fire-safety': 'Fire Safety',
};

// =============================================================================
// NEW MOCK DATA — RESIDENT SUPPORT
// =============================================================================

interface DutySchedule {
  id: string;
  raName: string;
  hall: string;
  date: string;
  shift: string;
  type: 'on-duty' | 'on-call';
}

const DUTY_SCHEDULE: DutySchedule[] = [
  { id: 'ds-1', raName: 'Jordan Lewis', hall: 'Drew Hall', date: 'Feb 18', shift: '8PM\u20138AM', type: 'on-duty' },
  { id: 'ds-2', raName: 'Maya Patel', hall: 'Robinson Hall', date: 'Feb 18', shift: '8PM\u20138AM', type: 'on-duty' },
  { id: 'ds-3', raName: 'Marcus Brown', hall: 'Eagle Village', date: 'Feb 18', shift: '8PM\u20138AM', type: 'on-duty' },
  { id: 'ds-4', raName: 'Chris Thompson', hall: 'Robinson Hall', date: 'Feb 19', shift: '8PM\u20138AM', type: 'on-duty' },
  { id: 'ds-5', raName: 'Ashley Kim', hall: 'Scholars Hall', date: 'Feb 18', shift: '10PM\u20138AM', type: 'on-call' },
  { id: 'ds-6', raName: 'Sofia Garcia', hall: 'Campbell Hall', date: 'Feb 19', shift: '8PM\u20138AM', type: 'on-duty' },
  { id: 'ds-7', raName: 'Derek Washington', hall: 'Morrison Residence', date: 'Feb 18', shift: '8PM\u20138AM', type: 'on-duty' },
  { id: 'ds-8', raName: 'Emily Chen', hall: 'University Apartments', date: 'Feb 18', shift: '6PM\u201310PM', type: 'on-duty' },
];

interface IncidentLog {
  id: string;
  date: string;
  time: string;
  hall: string;
  type: 'noise' | 'policy-violation' | 'medical' | 'conflict' | 'facilities' | 'safety';
  severity: 'low' | 'medium' | 'high';
  reportedBy: string;
  description: string;
  resolution: string;
  status: 'resolved' | 'open' | 'referred';
}

const INCIDENT_LOG: IncidentLog[] = [
  { id: 'inc-1', date: 'Feb 17', time: '11:42 PM', hall: 'Robinson Hall', type: 'noise', severity: 'low', reportedBy: 'RA Maya Patel', description: 'Excessive noise from room 305 after quiet hours.', resolution: 'Verbal warning issued. Residents complied.', status: 'resolved' },
  { id: 'inc-2', date: 'Feb 16', time: '2:15 AM', hall: 'Eagle Village', type: 'medical', severity: 'high', reportedBy: 'RA Marcus Brown', description: 'Student reported severe allergic reaction in Apt 9B.', resolution: 'EMS called. Student transported to hospital. Family notified.', status: 'referred' },
  { id: 'inc-3', date: 'Feb 15', time: '9:30 PM', hall: 'Drew Hall', type: 'policy-violation', severity: 'medium', reportedBy: 'RA Jordan Lewis', description: 'Prohibited cooking appliance found during routine check in Suite 201.', resolution: 'Item confiscated. Written warning documented.', status: 'resolved' },
  { id: 'inc-4', date: 'Feb 14', time: '6:00 PM', hall: 'Campbell Hall', type: 'conflict', severity: 'medium', reportedBy: 'RA Sofia Garcia', description: 'Roommate dispute in room 215. Students requesting room change.', resolution: 'Mediation session scheduled for Feb 19.', status: 'open' },
  { id: 'inc-5', date: 'Feb 13', time: '3:45 PM', hall: 'Morrison Residence', type: 'safety', severity: 'medium', reportedBy: 'RA Derek Washington', description: 'Exit door propped open repeatedly on 3rd floor.', resolution: 'Door alarm activated. Reminder sent to floor residents.', status: 'resolved' },
];

const INCIDENT_SEVERITY_COLOR: Record<string, string> = {
  low: '#22C55E',
  medium: '#F59E0B',
  high: '#EF4444',
};

const INCIDENT_STATUS_COLOR: Record<string, string> = {
  resolved: '#22C55E',
  open: '#F59E0B',
  referred: ACCENT,
};

interface CounselingReferral {
  id: string;
  date: string;
  hall: string;
  reason: string;
  referredTo: string;
  status: 'scheduled' | 'completed' | 'pending';
}

const COUNSELING_REFERRALS: CounselingReferral[] = [
  { id: 'cr-1', date: 'Feb 17', hall: 'Eagle Village', reason: 'Follow-up after medical incident', referredTo: 'Counseling & Wellness Center', status: 'scheduled' },
  { id: 'cr-2', date: 'Feb 15', hall: 'Campbell Hall', reason: 'Roommate conflict mediation', referredTo: 'Residence Life Coordinator', status: 'pending' },
  { id: 'cr-3', date: 'Feb 12', hall: 'Robinson Hall', reason: 'Academic stress reported by RA', referredTo: 'Counseling & Wellness Center', status: 'completed' },
  { id: 'cr-4', date: 'Feb 10', hall: 'Drew Hall', reason: 'Homesickness / adjustment', referredTo: 'Peer Mentor Program', status: 'completed' },
];

const REFERRAL_STATUS_COLOR: Record<string, string> = {
  scheduled: ACCENT,
  completed: '#22C55E',
  pending: '#F59E0B',
};

interface ResLifeProgram {
  id: string;
  title: string;
  date: string;
  time: string;
  hall: string;
  ra: string;
  category: 'social' | 'educational' | 'wellness' | 'diversity' | 'community';
  attendance?: number;
}

const RESLIFE_PROGRAMS: ResLifeProgram[] = [
  { id: 'rlp-1', title: 'Study Skills Workshop', date: 'Feb 20', time: '7PM', hall: 'Robinson Hall', ra: 'Maya Patel', category: 'educational', attendance: 0 },
  { id: 'rlp-2', title: 'Movie Night: Black History Month', date: 'Feb 21', time: '8PM', hall: 'Drew Hall', ra: 'Jordan Lewis', category: 'diversity', attendance: 0 },
  { id: 'rlp-3', title: 'Stress Relief Yoga', date: 'Feb 22', time: '6PM', hall: 'Eagle Village', ra: 'Marcus Brown', category: 'wellness' },
  { id: 'rlp-4', title: 'Floor Game Night', date: 'Feb 23', time: '7PM', hall: 'Campbell Hall', ra: 'Sofia Garcia', category: 'social' },
  { id: 'rlp-5', title: 'Fire Safety Q&A', date: 'Feb 25', time: '5PM', hall: 'Morrison Residence', ra: 'Derek Washington', category: 'community' },
];

const PROGRAM_CAT_COLOR: Record<string, string> = {
  social: ACCENT,
  educational: ACCENT,
  wellness: '#22C55E',
  diversity: ACCENT,
  community: '#F59E0B',
};

// =============================================================================
// SHARED SUB-COMPONENTS
// =============================================================================

function SectionHeader({ title, colors, count }: { title: string; colors: typeof Colors.light; count?: number }) {
  return (
    <View style={shrd.headerRow}>
      <ThemedText style={[shrd.sectionLabel, { color: colors.textSecondary }]}>{title}</ThemedText>
      {count != null && (
        <View style={[shrd.countBadge, { backgroundColor: colors.backgroundTertiary }]}>
          <ThemedText style={[shrd.countText, { color: colors.textSecondary }]}>{count}</ThemedText>
        </View>
      )}
    </View>
  );
}

function Card({ colors, children }: { colors: typeof Colors.light; children: React.ReactNode }) {
  return (
    <View style={[shrd.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[shrd.statusBadge, { backgroundColor: color + '20' }]}>
      <View style={[shrd.statusDot, { backgroundColor: color }]} />
      <ThemedText style={[shrd.statusText, { color }]}>{label}</ThemedText>
    </View>
  );
}

function KPIStat({ value, label, colors, valueColor }: { value: string; label: string; colors: typeof Colors.light; valueColor?: string }) {
  return (
    <View style={shrd.kpiStat}>
      <ThemedText style={[shrd.kpiValue, { color: valueColor ?? colors.text }]}>{value}</ThemedText>
      <ThemedText style={[shrd.kpiLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

const shrd = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  sectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  countBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
  countText: { fontSize: 10, fontWeight: '600' },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: StyleSheet.hairlineWidth },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },
  kpiStat: { alignItems: 'center', minWidth: 60 },
  kpiValue: { fontSize: 20, fontWeight: '700' },
  kpiLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
});

// =============================================================================
// VIEW 1: OVERVIEW
// =============================================================================

function OverviewView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const isAdmin = isDeanLevel(role);
  const isStaff = isFacultyLevel(role);

  return (
    <>
      {/* KPI row — visible to E1-E3 */}
      {isStaff && (
        <View style={s.moduleContainer}>
          <SectionHeader title="HOUSING KPIs" colors={colors} />
          <Card colors={colors}>
            <View style={s.kpiGrid}>
              <KPIStat value={HOUSING_SUMMARY.totalBeds.toLocaleString()} label="Total Beds" colors={colors} />
              <KPIStat value={`${HOUSING_SUMMARY.occupancyRate}%`} label="Occupancy" colors={colors} />
              <KPIStat value={String(HOUSING_SUMMARY.waitlistCount)} label="Waitlist" colors={colors} valueColor="#F59E0B" />
              <KPIStat value={String(HOUSING_SUMMARY.totalHalls)} label="Halls" colors={colors} />
            </View>
            {isAdmin && (
              <View style={s.kpiExtras}>
                <ThemedText style={[s.kpiExtraText, { color: colors.textSecondary }]}>
                  Revenue: {HOUSING_SUMMARY.housingRevenue} {'\u00B7'} Avg Cost: {HOUSING_SUMMARY.avgCostPerSemester}/sem {'\u00B7'} Open Maint: {HOUSING_SUMMARY.openRequests}/{HOUSING_SUMMARY.maintenanceRequests}
                </ThemedText>
              </View>
            )}
          </Card>
        </View>
      )}

      {/* Student personal housing — E4 */}
      {isStudent(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="MY HOUSING" colors={colors} />
          <Card colors={colors}>
            <View style={s.assignmentHeader}>
              <View>
                <ThemedText style={[s.assignmentHall, { color: colors.text }]}>{STUDENT_ROOM.hall}</ThemedText>
                <ThemedText style={[s.assignmentRoom, { color: colors.textSecondary }]}>
                  {STUDENT_ROOM.room} {'\u00B7'} {STUDENT_ROOM.type} {'\u00B7'} Floor {STUDENT_ROOM.floor}
                </ThemedText>
              </View>
              <StatusBadge label={STUDENT_ROOM.status} color={ASSIGNMENT_STATUS_COLOR[STUDENT_ROOM.status]} />
            </View>
            <View style={[s.divider, { backgroundColor: colors.border }]} />
            <View style={s.detailRows}>
              <View style={s.detailRow}>
                <IconSymbol name="person.2.fill" size={12} color={colors.textSecondary} />
                <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>Roommate: {STUDENT_ROOM.roommates.join(', ')}</ThemedText>
              </View>
              <View style={s.detailRow}>
                <IconSymbol name="calendar" size={12} color={colors.textSecondary} />
                <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>{STUDENT_ROOM.moveInDate} {'\u2013'} {STUDENT_ROOM.moveOutDate}</ThemedText>
              </View>
              <View style={s.detailRow}>
                <IconSymbol name="dollarsign.circle.fill" size={12} color={colors.textSecondary} />
                <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>{STUDENT_ROOM.cost}</ThemedText>
              </View>
            </View>
          </Card>

          {/* Student meal plan */}
          <SectionHeader title="MY MEAL PLAN" colors={colors} />
          <Card colors={colors}>
            <ThemedText style={[s.mealPlanName, { color: colors.text }]}>{STUDENT_MEAL.plan}</ThemedText>
            <View style={s.kpiGrid}>
              <KPIStat value={String(STUDENT_MEAL.mealsRemaining)} label="Meals Left" colors={colors} />
              <KPIStat value={STUDENT_MEAL.diningDollarsRemaining} label="Dining $" colors={colors} />
              <KPIStat value={String(STUDENT_MEAL.guestMealsRemaining)} label="Guest Meals" colors={colors} />
              <KPIStat value={String(STUDENT_MEAL.weeksRemaining)} label="Weeks Left" colors={colors} />
            </View>
            {(() => {
              const mealsPct = Math.round((STUDENT_MEAL.mealsRemaining / STUDENT_MEAL.mealsTotal) * 100);
              return (
                <View style={s.progressContainer}>
                  <View style={[s.progressBg, { backgroundColor: colors.backgroundTertiary }]}>
                    <View style={[s.progressFill, { width: `${mealsPct}%`, backgroundColor: mealsPct < 30 ? '#EF4444' : mealsPct < 50 ? '#F59E0B' : '#22C55E' }]} />
                  </View>
                  <ThemedText style={[s.progressLabel, { color: colors.textSecondary }]}>
                    {STUDENT_MEAL.mealsRemaining}/{STUDENT_MEAL.mealsTotal} meals remaining
                  </ThemedText>
                </View>
              );
            })()}
          </Card>
        </View>
      )}

      {/* Hall status summary */}
      <View style={s.moduleContainer}>
        <SectionHeader title="RESIDENCE HALLS" colors={colors} count={RESIDENCE_HALLS.length} />
        {RESIDENCE_HALLS.map((hall) => {
          const occPct = hall.capacity > 0 ? Math.round((hall.occupancy / hall.capacity) * 100) : 0;
          return (
            <Card key={hall.id} colors={colors}>
              <View style={s.hallHeader}>
                <View style={s.hallNameRow}>
                  <IconSymbol name="house.fill" size={16} color={colors.text} />
                  <ThemedText style={[s.hallName, { color: colors.text }]}>{hall.name}</ThemedText>
                </View>
                <StatusBadge label={hall.status} color={HALL_STATUS_COLOR[hall.status]} />
              </View>
              <ThemedText style={[s.hallMeta, { color: colors.textSecondary }]}>
                {HALL_TYPE_LABEL[hall.type]} {'\u00B7'} {hall.floors} floors {'\u00B7'} {hall.yearRestriction} {'\u00B7'} {hall.costPerSemester}/sem
              </ThemedText>
              {isStaff && hall.occupancy > 0 && (
                <View style={s.progressContainer}>
                  <View style={[s.progressBg, { backgroundColor: colors.backgroundTertiary }]}>
                    <View style={[s.progressFill, { width: `${occPct}%`, backgroundColor: occPct >= 95 ? '#EF4444' : occPct >= 85 ? '#F59E0B' : '#22C55E' }]} />
                  </View>
                  <ThemedText style={[s.progressLabel, { color: colors.textSecondary }]}>
                    {hall.occupancy}/{hall.capacity} ({occPct}%)
                  </ThemedText>
                </View>
              )}
              <View style={s.amenitiesRow}>
                {hall.amenities.map((a, i) => (
                  <View key={i} style={[s.chip, { backgroundColor: colors.backgroundTertiary }]}>
                    <ThemedText style={[s.chipText, { color: colors.textSecondary }]}>{a}</ThemedText>
                  </View>
                ))}
              </View>
            </Card>
          );
        })}
      </View>

      {/* Key dates timeline */}
      <View style={s.moduleContainer}>
        <SectionHeader title="KEY DATES" colors={colors} count={HOUSING_TIMELINE.length} />
        <Card colors={colors}>
          {HOUSING_TIMELINE.map((event, idx) => (
            <View key={event.id} style={s.timelineRow}>
              <View style={s.timelineDotCol}>
                <View style={[s.timelineDot, { backgroundColor: TIMELINE_STATUS_COLOR[event.status] }]} />
                {idx < HOUSING_TIMELINE.length - 1 && (
                  <View style={[s.timelineLine, { backgroundColor: colors.border }]} />
                )}
              </View>
              <View style={s.timelineContent}>
                <View style={s.timelineDateRow}>
                  <ThemedText style={[s.timelineDate, { color: colors.text }]}>{event.date}</ThemedText>
                  {event.status === 'current' && (
                    <View style={[shrd.statusBadge, { backgroundColor: ACCENT + '20' }]}>
                      <ThemedText style={[shrd.statusText, { color: ACCENT }]}>CURRENT</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText style={[s.timelineTitle, { color: colors.text }]}>{event.title}</ThemedText>
                <ThemedText style={[s.timelineDesc, { color: colors.textSecondary }]} numberOfLines={2}>{event.description}</ThemedText>
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* Meal plan options (E5 sees these too) */}
      <View style={s.moduleContainer}>
        <SectionHeader title="MEAL PLANS" colors={colors} count={MEAL_PLANS.length} />
        {MEAL_PLANS.map((plan) => (
          <Card key={plan.id} colors={colors}>
            <View style={s.mealPlanHeader}>
              <View style={s.mealPlanNameRow}>
                <ThemedText style={[s.mealPlanTitle, { color: colors.text }]}>{plan.name}</ThemedText>
                {plan.popular && (
                  <View style={[shrd.statusBadge, { backgroundColor: '#22C55E20' }]}>
                    <ThemedText style={[shrd.statusText, { color: '#22C55E' }]}>POPULAR</ThemedText>
                  </View>
                )}
              </View>
              <ThemedText style={[s.mealPlanCost, { color: colors.text }]}>{plan.costPerSemester}</ThemedText>
            </View>
            <ThemedText style={[s.mealPlanDesc, { color: colors.textSecondary }]}>{plan.description}</ThemedText>
            <ThemedText style={[s.mealPlanMeta, { color: colors.textTertiary }]}>
              {plan.mealsPerWeek} meals/wk {'\u00B7'} {plan.diningDollars} dining $ {'\u00B7'} {plan.guestMeals} guest meals {'\u00B7'} Rec: {plan.recommended}
            </ThemedText>
          </Card>
        ))}
      </View>
    </>
  );
}

// =============================================================================
// VIEW 2: ASSIGNMENTS
// =============================================================================

function AssignmentsView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'waitlisted'>('all');

  // E4 sees own assignment only
  if (isStudent(role)) {
    const statusColor = ASSIGNMENT_STATUS_COLOR[STUDENT_ROOM.status];
    return (
      <View style={s.moduleContainer}>
        <SectionHeader title="MY ASSIGNMENT" colors={colors} />
        <Card colors={colors}>
          <View style={s.assignmentHeader}>
            <View>
              <ThemedText style={[s.assignmentHall, { color: colors.text }]}>{STUDENT_ROOM.hall}</ThemedText>
              <ThemedText style={[s.assignmentRoom, { color: colors.textSecondary }]}>
                {STUDENT_ROOM.room} {'\u00B7'} {STUDENT_ROOM.type} {'\u00B7'} Floor {STUDENT_ROOM.floor}
              </ThemedText>
            </View>
            <StatusBadge label={STUDENT_ROOM.status} color={statusColor} />
          </View>
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          <View style={s.detailRows}>
            <View style={s.detailRow}>
              <IconSymbol name="person.2.fill" size={12} color={colors.textSecondary} />
              <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>Roommate: {STUDENT_ROOM.roommates.join(', ')}</ThemedText>
            </View>
            <View style={s.detailRow}>
              <IconSymbol name="calendar" size={12} color={colors.textSecondary} />
              <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>{STUDENT_ROOM.moveInDate} {'\u2013'} {STUDENT_ROOM.moveOutDate}</ThemedText>
            </View>
            <View style={s.detailRow}>
              <IconSymbol name="dollarsign.circle.fill" size={12} color={colors.textSecondary} />
              <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>{STUDENT_ROOM.cost}</ThemedText>
            </View>
          </View>
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          <ThemedText style={[s.raTitle, { color: colors.text }]}>Your RA</ThemedText>
          <View style={s.raCard}>
            <View style={[s.raAvatar, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[s.raInitials, { color: colors.text }]}>
                {STUDENT_ROOM.raName.split(' ').map((n) => n[0]).join('')}
              </ThemedText>
            </View>
            <View style={s.raInfo}>
              <ThemedText style={[s.raName, { color: colors.text }]}>{STUDENT_ROOM.raName}</ThemedText>
              <ThemedText style={[s.raContact, { color: colors.textSecondary }]}>{STUDENT_ROOM.raPhone}</ThemedText>
              <ThemedText style={[s.raContact, { color: colors.textSecondary }]}>{STUDENT_ROOM.raEmail}</ThemedText>
            </View>
          </View>
        </Card>
      </View>
    );
  }

  // E1-E3 see all assignments
  const filtered = filter === 'all'
    ? ADMIN_ASSIGNMENTS
    : ADMIN_ASSIGNMENTS.filter((a) => a.status === filter);

  return (
    <>
      <View style={s.moduleContainer}>
        <SectionHeader title="ROOM ASSIGNMENTS" colors={colors} count={filtered.length} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
          {(['all', 'confirmed', 'pending', 'waitlisted'] as const).map((f) => (
            <Pressable
              key={f}
              style={[s.filterPill, { backgroundColor: filter === f ? colors.text + '15' : 'transparent', borderColor: colors.border }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(f); }}
            >
              <ThemedText style={[s.filterPillText, { color: filter === f ? colors.text : colors.textSecondary }]}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        <Card colors={colors}>
          {filtered.map((asgn, idx) => (
            <View
              key={asgn.id}
              style={[s.listRow, idx < filtered.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
            >
              <View style={s.listRowContent}>
                <View style={s.listRowHeader}>
                  <ThemedText style={[s.listRowTitle, { color: colors.text }]}>{asgn.studentName}</ThemedText>
                  <StatusBadge label={asgn.status} color={ASSIGNMENT_STATUS_COLOR[asgn.status]} />
                </View>
                <ThemedText style={[s.listRowMeta, { color: colors.textSecondary }]}>
                  {asgn.hall} {'\u00B7'} {asgn.room} {'\u00B7'} {asgn.type}
                </ThemedText>
                <ThemedText style={[s.listRowSub, { color: colors.textTertiary }]}>
                  ID: {asgn.studentId} {'\u00B7'} {asgn.moveInDate} {'\u2013'} {asgn.moveOutDate}
                  {asgn.roommates.length > 0 ? ` \u00B7 w/ ${asgn.roommates.join(', ')}` : ''}
                </ThemedText>
                {asgn.matchScore != null && (
                  <ThemedText style={[s.listRowSub, { color: asgn.matchScore >= 85 ? '#22C55E' : asgn.matchScore >= 70 ? '#F59E0B' : '#EF4444' }]}>
                    Roommate Match: {asgn.matchScore}%
                  </ThemedText>
                )}
              </View>
            </View>
          ))}
        </Card>
      </View>
    </>
  );
}

// =============================================================================
// VIEW 3: INVENTORY
// =============================================================================

function InventoryView({ colors }: { colors: typeof Colors.light }) {
  const totalBeds = HALL_INVENTORY.reduce((a, h) => a + h.singleBeds + h.doubleBeds + h.suiteBeds, 0);
  const totalADA = HALL_INVENTORY.reduce((a, h) => a + h.adaRooms, 0);
  const totalReplace = HALL_INVENTORY.reduce((a, h) => a + h.needsReplacement, 0);

  return (
    <>
      <View style={s.moduleContainer}>
        <SectionHeader title="INVENTORY SUMMARY" colors={colors} />
        <Card colors={colors}>
          <View style={s.kpiGrid}>
            <KPIStat value={totalBeds.toLocaleString()} label="Total Beds" colors={colors} />
            <KPIStat value={String(totalADA)} label="ADA Rooms" colors={colors} />
            <KPIStat value={String(HALL_INVENTORY.length)} label="Halls" colors={colors} />
            <KPIStat value={String(totalReplace)} label="Needs Replace" colors={colors} valueColor={totalReplace > 50 ? '#EF4444' : '#F59E0B'} />
          </View>
        </Card>
      </View>

      <View style={s.moduleContainer}>
        <SectionHeader title="HALL INVENTORY" colors={colors} count={HALL_INVENTORY.length} />
        {HALL_INVENTORY.map((inv) => (
          <Card key={inv.hallId} colors={colors}>
            <View style={s.hallNameRow}>
              <IconSymbol name="house.fill" size={16} color={colors.text} />
              <ThemedText style={[s.hallName, { color: colors.text }]}>{inv.hallName}</ThemedText>
            </View>
            <View style={s.inventoryGrid}>
              {inv.singleBeds > 0 && (
                <View style={s.inventoryItem}>
                  <ThemedText style={[s.inventoryValue, { color: colors.text }]}>{inv.singleBeds}</ThemedText>
                  <ThemedText style={[s.inventoryLabel, { color: colors.textSecondary }]}>Single</ThemedText>
                </View>
              )}
              {inv.doubleBeds > 0 && (
                <View style={s.inventoryItem}>
                  <ThemedText style={[s.inventoryValue, { color: colors.text }]}>{inv.doubleBeds}</ThemedText>
                  <ThemedText style={[s.inventoryLabel, { color: colors.textSecondary }]}>Double</ThemedText>
                </View>
              )}
              {inv.suiteBeds > 0 && (
                <View style={s.inventoryItem}>
                  <ThemedText style={[s.inventoryValue, { color: colors.text }]}>{inv.suiteBeds}</ThemedText>
                  <ThemedText style={[s.inventoryLabel, { color: colors.textSecondary }]}>Suite</ThemedText>
                </View>
              )}
              <View style={s.inventoryItem}>
                <ThemedText style={[s.inventoryValue, { color: colors.text }]}>{inv.adaRooms}</ThemedText>
                <ThemedText style={[s.inventoryLabel, { color: colors.textSecondary }]}>ADA</ThemedText>
              </View>
              <View style={s.inventoryItem}>
                <ThemedText style={[s.inventoryValue, { color: colors.text }]}>{inv.desks}</ThemedText>
                <ThemedText style={[s.inventoryLabel, { color: colors.textSecondary }]}>Desks</ThemedText>
              </View>
              <View style={s.inventoryItem}>
                <ThemedText style={[s.inventoryValue, { color: inv.needsReplacement > 20 ? '#EF4444' : colors.text }]}>{inv.needsReplacement}</ThemedText>
                <ThemedText style={[s.inventoryLabel, { color: colors.textSecondary }]}>Replace</ThemedText>
              </View>
            </View>
            <View style={s.amenitiesRow}>
              {inv.amenities.map((a, i) => (
                <View key={i} style={[s.chip, { backgroundColor: colors.backgroundTertiary }]}>
                  <ThemedText style={[s.chipText, { color: colors.textSecondary }]}>{a}</ThemedText>
                </View>
              ))}
            </View>
          </Card>
        ))}
      </View>
    </>
  );
}

// =============================================================================
// VIEW 4: OCCUPANCY
// =============================================================================

function OccupancyView({ colors }: { colors: typeof Colors.light }) {
  const totalCap = RESIDENCE_HALLS.reduce((a, h) => a + h.capacity, 0);
  const totalOcc = RESIDENCE_HALLS.reduce((a, h) => a + h.occupancy, 0);
  const emptyBeds = totalCap - totalOcc;
  const overallPct = totalCap > 0 ? Math.round((totalOcc / totalCap) * 100 * 10) / 10 : 0;

  return (
    <>
      <View style={s.moduleContainer}>
        <SectionHeader title="OVERALL OCCUPANCY" colors={colors} />
        <Card colors={colors}>
          <View style={s.kpiGrid}>
            <KPIStat value={`${overallPct}%`} label="Occupancy Rate" colors={colors} />
            <KPIStat value={totalOcc.toLocaleString()} label="Occupied" colors={colors} />
            <KPIStat value={String(emptyBeds)} label="Empty Beds" colors={colors} valueColor={emptyBeds > 100 ? '#F59E0B' : '#22C55E'} />
            <KPIStat value={String(HOUSING_SUMMARY.waitlistCount)} label="Waitlist" colors={colors} valueColor="#F59E0B" />
          </View>
        </Card>
      </View>

      {/* Per-hall occupancy with floor detail */}
      <View style={s.moduleContainer}>
        <SectionHeader title="BY HALL (FLOOR DETAIL)" colors={colors} count={HALL_OCCUPANCY.length} />
        {HALL_OCCUPANCY.map((ho) => {
          const pct = Math.round((ho.totalOccupied / ho.totalCapacity) * 100);
          const trendColor = ho.utilizationTrend === 'up' ? '#22C55E' : ho.utilizationTrend === 'down' ? '#EF4444' : '#A1A1AA';
          return (
            <Card key={ho.hallId} colors={colors}>
              <View style={s.hallHeader}>
                <View style={s.hallNameRow}>
                  <IconSymbol name="house.fill" size={16} color={colors.text} />
                  <ThemedText style={[s.hallName, { color: colors.text }]}>{ho.hallName}</ThemedText>
                </View>
                <ThemedText style={[s.trendText, { color: trendColor }]}>{ho.trendPct}</ThemedText>
              </View>
              <View style={s.progressContainer}>
                <View style={[s.progressBg, { backgroundColor: colors.backgroundTertiary }]}>
                  <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: pct >= 95 ? '#EF4444' : pct >= 85 ? '#F59E0B' : '#22C55E' }]} />
                </View>
                <ThemedText style={[s.progressLabel, { color: colors.textSecondary }]}>
                  {ho.totalOccupied}/{ho.totalCapacity} ({pct}%)
                </ThemedText>
              </View>
              {ho.floors.map((fl) => {
                const flPct = Math.round((fl.occupied / fl.capacity) * 100);
                return (
                  <View key={fl.floor} style={s.floorRow}>
                    <ThemedText style={[s.floorLabel, { color: colors.textSecondary }]}>Floor {fl.floor}</ThemedText>
                    <View style={s.floorBarWrap}>
                      <View style={[s.floorBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                        <View style={[s.floorBarFill, { width: `${flPct}%`, backgroundColor: flPct >= 95 ? '#EF4444' : flPct >= 85 ? '#F59E0B' : '#22C55E' }]} />
                      </View>
                    </View>
                    <ThemedText style={[s.floorPct, { color: colors.textSecondary }]}>{flPct}%</ThemedText>
                    <ThemedText style={[s.floorEmpty, { color: fl.emptyBeds > 5 ? '#F59E0B' : colors.textTertiary }]}>
                      {fl.emptyBeds} empty
                    </ThemedText>
                  </View>
                );
              })}
            </Card>
          );
        })}
      </View>

      {/* Quick hall list for those without floor detail */}
      <View style={s.moduleContainer}>
        <SectionHeader title="ALL HALLS SUMMARY" colors={colors} />
        <Card colors={colors}>
          {RESIDENCE_HALLS.map((hall, idx) => {
            const pct = hall.capacity > 0 ? Math.round((hall.occupancy / hall.capacity) * 100) : 0;
            return (
              <View
                key={hall.id}
                style={[s.listRow, idx < RESIDENCE_HALLS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
              >
                <View style={s.listRowContent}>
                  <View style={s.listRowHeader}>
                    <ThemedText style={[s.listRowTitle, { color: colors.text }]}>{hall.name}</ThemedText>
                    <ThemedText style={[s.occupancyPct, { color: pct >= 95 ? '#EF4444' : pct >= 85 ? '#F59E0B' : '#22C55E' }]}>{pct}%</ThemedText>
                  </View>
                  <ThemedText style={[s.listRowMeta, { color: colors.textSecondary }]}>
                    {hall.occupancy}/{hall.capacity} beds {'\u00B7'} {hall.capacity - hall.occupancy} empty
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </Card>
      </View>
    </>
  );
}

// =============================================================================
// VIEW 5: MOVE-IN / MOVE-OUT
// =============================================================================

function MoveView({ colors }: { colors: typeof Colors.light }) {
  const [filter, setFilter] = useState<'all' | 'move-in' | 'move-out'>('all');
  const filtered = filter === 'all' ? MOVE_EVENTS : MOVE_EVENTS.filter((m) => m.type === filter);

  return (
    <>
      <View style={s.moduleContainer}>
        <SectionHeader title="MOVE-IN / MOVE-OUT EVENTS" colors={colors} count={filtered.length} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
          {(['all', 'move-in', 'move-out'] as const).map((f) => (
            <Pressable
              key={f}
              style={[s.filterPill, { backgroundColor: filter === f ? colors.text + '15' : 'transparent', borderColor: colors.border }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(f); }}
            >
              <ThemedText style={[s.filterPillText, { color: filter === f ? colors.text : colors.textSecondary }]}>
                {f === 'all' ? 'All' : f === 'move-in' ? 'Move-In' : 'Move-Out'}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {filtered.map((mv) => (
          <Card key={mv.id} colors={colors}>
            <View style={s.listRowHeader}>
              <View style={s.hallNameRow}>
                <IconSymbol name={mv.type === 'move-in' ? 'arrow.down.to.line' : 'arrow.up.to.line'} size={14} color={mv.type === 'move-in' ? '#22C55E' : '#F59E0B'} />
                <ThemedText style={[s.listRowTitle, { color: colors.text }]}>{mv.hall}</ThemedText>
              </View>
              <StatusBadge label={mv.status} color={MOVE_STATUS_COLOR[mv.status]} />
            </View>
            <ThemedText style={[s.listRowMeta, { color: colors.textSecondary }]}>
              {mv.date} {'\u00B7'} {mv.timeSlot} {'\u00B7'} {mv.studentCount} students
            </ThemedText>
            <View style={s.progressContainer}>
              <View style={[s.progressBg, { backgroundColor: colors.backgroundTertiary }]}>
                <View style={[s.progressFill, { width: `${Math.round((mv.checklistCompleted / mv.checklistItems) * 100)}%`, backgroundColor: '#22C55E' }]} />
              </View>
              <ThemedText style={[s.progressLabel, { color: colors.textSecondary }]}>
                Checklist: {mv.checklistCompleted}/{mv.checklistItems} items
              </ThemedText>
            </View>
            {mv.keysIssued != null && (
              <ThemedText style={[s.listRowSub, { color: colors.textTertiary }]}>Keys issued: {mv.keysIssued}</ThemedText>
            )}
            {mv.keysReturned != null && mv.type === 'move-out' && (
              <ThemedText style={[s.listRowSub, { color: colors.textTertiary }]}>Keys returned: {mv.keysReturned}</ThemedText>
            )}
          </Card>
        ))}
      </View>

      <View style={s.moduleContainer}>
        <SectionHeader title="KEY TRACKING" colors={colors} count={KEY_TRACKING.length} />
        <Card colors={colors}>
          {KEY_TRACKING.map((kt, idx) => (
            <View
              key={kt.hall}
              style={[s.listRow, idx < KEY_TRACKING.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
            >
              <View style={s.listRowContent}>
                <ThemedText style={[s.listRowTitle, { color: colors.text }]}>{kt.hall}</ThemedText>
                <ThemedText style={[s.listRowMeta, { color: colors.textSecondary }]}>
                  Total: {kt.totalKeys} {'\u00B7'} Issued: {kt.issued} {'\u00B7'} Returned: {kt.returned}
                </ThemedText>
                {kt.lost > 0 && (
                  <ThemedText style={[s.listRowSub, { color: '#EF4444' }]}>
                    Lost: {kt.lost} {'\u00B7'} Replacements: {kt.replacements}
                  </ThemedText>
                )}
              </View>
            </View>
          ))}
        </Card>
      </View>
    </>
  );
}

// =============================================================================
// VIEW 6: WORK ORDERS
// =============================================================================

function WorkOrdersView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [filter, setFilter] = useState<'all' | 'open' | 'assigned' | 'in-progress' | 'completed'>('all');

  // E4 sees only their own submitted orders + a submit CTA
  const visibleOrders = isStudent(role)
    ? WORK_ORDERS.filter((wo) => wo.hall === STUDENT_ROOM.hall)
    : WORK_ORDERS;

  const filtered = filter === 'all'
    ? visibleOrders
    : visibleOrders.filter((wo) => wo.status === filter);

  const openCount = visibleOrders.filter((wo) => wo.status === 'open').length;
  const inProgressCount = visibleOrders.filter((wo) => wo.status === 'in-progress' || wo.status === 'assigned').length;
  const completedCount = visibleOrders.filter((wo) => wo.status === 'completed').length;

  return (
    <>
      {!isStudent(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="WORK ORDER KPIs" colors={colors} />
          <Card colors={colors}>
            <View style={s.kpiGrid}>
              <KPIStat value={String(HOUSING_SUMMARY.maintenanceRequests)} label="Total YTD" colors={colors} />
              <KPIStat value={String(openCount)} label="Open" colors={colors} valueColor="#F59E0B" />
              <KPIStat value={String(inProgressCount)} label="In Progress" colors={colors} valueColor={ACCENT} />
              <KPIStat value={String(completedCount)} label="Completed" colors={colors} valueColor="#22C55E" />
            </View>
          </Card>
        </View>
      )}

      {isStudent(role) && (
        <View style={s.moduleContainer}>
          <Pressable
            style={({ pressed }) => [s.submitButton, { borderColor: colors.borderStrong, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="wrench.fill" size={14} color={colors.text} />
            <ThemedText style={[s.submitButtonText, { color: colors.text }]}>Submit Work Order</ThemedText>
          </Pressable>
        </View>
      )}

      <View style={s.moduleContainer}>
        <SectionHeader title="MAINTENANCE QUEUE" colors={colors} count={filtered.length} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
          {(['all', 'open', 'assigned', 'in-progress', 'completed'] as const).map((f) => (
            <Pressable
              key={f}
              style={[s.filterPill, { backgroundColor: filter === f ? colors.text + '15' : 'transparent', borderColor: colors.border }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(f); }}
            >
              <ThemedText style={[s.filterPillText, { color: filter === f ? colors.text : colors.textSecondary }]}>
                {f === 'all' ? 'All' : f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {filtered.map((wo) => (
          <Card key={wo.id} colors={colors}>
            <View style={s.listRowHeader}>
              <ThemedText style={[s.listRowTitle, { color: colors.text }]} numberOfLines={1}>{wo.title}</ThemedText>
              <StatusBadge label={wo.status.replace('-', ' ')} color={WO_STATUS_COLOR[wo.status]} />
            </View>
            <View style={s.woBadgeRow}>
              <View style={[shrd.statusBadge, { backgroundColor: PRIORITY_COLOR[wo.priority] + '20' }]}>
                <ThemedText style={[shrd.statusText, { color: PRIORITY_COLOR[wo.priority] }]}>{wo.priority}</ThemedText>
              </View>
              <View style={[s.chip, { backgroundColor: colors.backgroundTertiary }]}>
                <ThemedText style={[s.chipText, { color: colors.textSecondary }]}>{wo.category}</ThemedText>
              </View>
            </View>
            <ThemedText style={[s.listRowMeta, { color: colors.textSecondary }]}>
              {wo.hall} {'\u00B7'} Room {wo.room} {'\u00B7'} {wo.submittedDate}
            </ThemedText>
            <ThemedText style={[s.listRowSub, { color: colors.textTertiary }]} numberOfLines={2}>
              {wo.description}
            </ThemedText>
            {!isStudent(role) && wo.assignedTo && (
              <ThemedText style={[s.listRowSub, { color: colors.textSecondary }]}>
                Assigned to: {wo.assignedTo}
              </ThemedText>
            )}
            {wo.resolvedDate && (
              <ThemedText style={[s.listRowSub, { color: '#22C55E' }]}>Resolved: {wo.resolvedDate}</ThemedText>
            )}
          </Card>
        ))}
      </View>
    </>
  );
}

// =============================================================================
// VIEW 7: INSPECTIONS
// =============================================================================

function InspectionsView({ colors }: { colors: typeof Colors.light }) {
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed' | 'scheduled'>('all');
  const filtered = filter === 'all' ? INSPECTIONS : INSPECTIONS.filter((i) => i.status === filter);

  const passCount = INSPECTIONS.filter((i) => i.status === 'passed').length;
  const failCount = INSPECTIONS.filter((i) => i.status === 'failed').length;
  const schedCount = INSPECTIONS.filter((i) => i.status === 'scheduled').length;

  return (
    <>
      <View style={s.moduleContainer}>
        <SectionHeader title="INSPECTION SUMMARY" colors={colors} />
        <Card colors={colors}>
          <View style={s.kpiGrid}>
            <KPIStat value={String(INSPECTIONS.length)} label="Total" colors={colors} />
            <KPIStat value={String(passCount)} label="Passed" colors={colors} valueColor="#22C55E" />
            <KPIStat value={String(failCount)} label="Failed" colors={colors} valueColor="#EF4444" />
            <KPIStat value={String(schedCount)} label="Scheduled" colors={colors} valueColor="#A1A1AA" />
          </View>
        </Card>
      </View>

      <View style={s.moduleContainer}>
        <SectionHeader title="INSPECTION LOG" colors={colors} count={filtered.length} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
          {(['all', 'passed', 'failed', 'scheduled'] as const).map((f) => (
            <Pressable
              key={f}
              style={[s.filterPill, { backgroundColor: filter === f ? colors.text + '15' : 'transparent', borderColor: colors.border }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(f); }}
            >
              <ThemedText style={[s.filterPillText, { color: filter === f ? colors.text : colors.textSecondary }]}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {filtered.map((insp) => (
          <Card key={insp.id} colors={colors}>
            <View style={s.listRowHeader}>
              <ThemedText style={[s.listRowTitle, { color: colors.text }]}>{insp.hall}</ThemedText>
              <StatusBadge label={insp.status} color={INSPECTION_STATUS_COLOR[insp.status]} />
            </View>
            <View style={s.woBadgeRow}>
              <View style={[s.chip, { backgroundColor: colors.backgroundTertiary }]}>
                <ThemedText style={[s.chipText, { color: colors.textSecondary }]}>{INSPECTION_TYPE_LABEL[insp.type]}</ThemedText>
              </View>
            </View>
            <ThemedText style={[s.listRowMeta, { color: colors.textSecondary }]}>
              {insp.room} {'\u00B7'} {insp.scheduledDate} {'\u00B7'} Inspector: {insp.inspector}
            </ThemedText>
            {insp.completedDate && (
              <ThemedText style={[s.listRowSub, { color: colors.textTertiary }]}>Completed: {insp.completedDate}</ThemedText>
            )}
            {insp.violations.length > 0 && (
              <View style={s.violationList}>
                {insp.violations.map((v, i) => (
                  <View key={i} style={s.violationRow}>
                    <IconSymbol name="exclamationmark.triangle.fill" size={11} color="#EF4444" />
                    <ThemedText style={[s.violationText, { color: '#EF4444' }]}>{v}</ThemedText>
                  </View>
                ))}
              </View>
            )}
            {insp.notes && (
              <ThemedText style={[s.listRowSub, { color: colors.textTertiary, fontStyle: 'italic' }]}>{insp.notes}</ThemedText>
            )}
          </Card>
        ))}
      </View>
    </>
  );
}

// =============================================================================
// VIEW 8: RESIDENT SUPPORT
// =============================================================================

function ResidentSupportView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const isAdmin = isDeanLevel(role);
  const isStaff = isFacultyLevel(role);

  return (
    <>
      {/* RA Directory */}
      <View style={s.moduleContainer}>
        <SectionHeader title="RA DIRECTORY" colors={colors} count={RA_CONTACTS.length} />
        <Card colors={colors}>
          {RA_CONTACTS.map((ra, idx) => (
            <View
              key={ra.id}
              style={[s.listRow, idx < RA_CONTACTS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
            >
              <View style={[s.raAvatar, { backgroundColor: colors.backgroundTertiary }]}>
                <ThemedText style={[s.raInitials, { color: colors.text }]}>
                  {ra.name.split(' ').map((n) => n[0]).join('')}
                </ThemedText>
              </View>
              <View style={s.listRowContent}>
                <ThemedText style={[s.listRowTitle, { color: colors.text }]}>{ra.name}</ThemedText>
                <ThemedText style={[s.listRowMeta, { color: colors.textSecondary }]}>
                  {ra.hall} {'\u00B7'} {ra.floor}
                </ThemedText>
                <ThemedText style={[s.listRowSub, { color: colors.textTertiary }]}>
                  {ra.phone} {'\u00B7'} {ra.officeHours}
                </ThemedText>
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* Duty Schedule (E1-E3) */}
      {isStaff && (
        <View style={s.moduleContainer}>
          <SectionHeader title="DUTY SCHEDULE" colors={colors} count={DUTY_SCHEDULE.length} />
          <Card colors={colors}>
            {DUTY_SCHEDULE.map((ds, idx) => (
              <View
                key={ds.id}
                style={[s.listRow, idx < DUTY_SCHEDULE.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
              >
                <View style={s.listRowContent}>
                  <View style={s.listRowHeader}>
                    <ThemedText style={[s.listRowTitle, { color: colors.text }]}>{ds.raName}</ThemedText>
                    <View style={[shrd.statusBadge, { backgroundColor: ds.type === 'on-duty' ? '#22C55E20' : '#F59E0B20' }]}>
                      <ThemedText style={[shrd.statusText, { color: ds.type === 'on-duty' ? '#22C55E' : '#F59E0B' }]}>
                        {ds.type === 'on-duty' ? 'ON DUTY' : 'ON CALL'}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[s.listRowMeta, { color: colors.textSecondary }]}>
                    {ds.hall} {'\u00B7'} {ds.date} {'\u00B7'} {ds.shift}
                  </ThemedText>
                </View>
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* Incident Log (E1-E3) */}
      {isStaff && (
        <View style={s.moduleContainer}>
          <SectionHeader title="INCIDENT LOG" colors={colors} count={INCIDENT_LOG.length} />
          {INCIDENT_LOG.map((inc) => (
            <Card key={inc.id} colors={colors}>
              <View style={s.listRowHeader}>
                <ThemedText style={[s.listRowTitle, { color: colors.text }]}>{inc.hall}</ThemedText>
                <StatusBadge label={inc.status} color={INCIDENT_STATUS_COLOR[inc.status]} />
              </View>
              <View style={s.woBadgeRow}>
                <View style={[shrd.statusBadge, { backgroundColor: INCIDENT_SEVERITY_COLOR[inc.severity] + '20' }]}>
                  <ThemedText style={[shrd.statusText, { color: INCIDENT_SEVERITY_COLOR[inc.severity] }]}>{inc.severity}</ThemedText>
                </View>
                <View style={[s.chip, { backgroundColor: colors.backgroundTertiary }]}>
                  <ThemedText style={[s.chipText, { color: colors.textSecondary }]}>{inc.type.replace('-', ' ')}</ThemedText>
                </View>
              </View>
              <ThemedText style={[s.listRowMeta, { color: colors.textSecondary }]}>
                {inc.date} at {inc.time} {'\u00B7'} Reported by: {inc.reportedBy}
              </ThemedText>
              <ThemedText style={[s.listRowSub, { color: colors.textTertiary }]} numberOfLines={2}>{inc.description}</ThemedText>
              <ThemedText style={[s.listRowSub, { color: colors.textSecondary }]}>Resolution: {inc.resolution}</ThemedText>
            </Card>
          ))}
        </View>
      )}

      {/* Counseling Referrals (E1-E3) */}
      {isStaff && (
        <View style={s.moduleContainer}>
          <SectionHeader title="COUNSELING REFERRALS" colors={colors} count={COUNSELING_REFERRALS.length} />
          <Card colors={colors}>
            {COUNSELING_REFERRALS.map((cr, idx) => (
              <View
                key={cr.id}
                style={[s.listRow, idx < COUNSELING_REFERRALS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
              >
                <View style={s.listRowContent}>
                  <View style={s.listRowHeader}>
                    <ThemedText style={[s.listRowTitle, { color: colors.text }]}>{cr.reason}</ThemedText>
                    <StatusBadge label={cr.status} color={REFERRAL_STATUS_COLOR[cr.status]} />
                  </View>
                  <ThemedText style={[s.listRowMeta, { color: colors.textSecondary }]}>
                    {cr.date} {'\u00B7'} {cr.hall} {'\u00B7'} Referred to: {cr.referredTo}
                  </ThemedText>
                </View>
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* Res Life Programming */}
      <View style={s.moduleContainer}>
        <SectionHeader title="UPCOMING PROGRAMS" colors={colors} count={RESLIFE_PROGRAMS.length} />
        <Card colors={colors}>
          {RESLIFE_PROGRAMS.map((prog, idx) => (
            <View
              key={prog.id}
              style={[s.listRow, idx < RESLIFE_PROGRAMS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
            >
              <View style={s.listRowContent}>
                <View style={s.listRowHeader}>
                  <ThemedText style={[s.listRowTitle, { color: colors.text }]} numberOfLines={1}>{prog.title}</ThemedText>
                  <View style={[shrd.statusBadge, { backgroundColor: PROGRAM_CAT_COLOR[prog.category] + '20' }]}>
                    <ThemedText style={[shrd.statusText, { color: PROGRAM_CAT_COLOR[prog.category] }]}>
                      {prog.category}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={[s.listRowMeta, { color: colors.textSecondary }]}>
                  {prog.date} at {prog.time} {'\u00B7'} {prog.hall}
                </ThemedText>
                {isStaff && (
                  <ThemedText style={[s.listRowSub, { color: colors.textTertiary }]}>RA: {prog.ra}</ThemedText>
                )}
              </View>
            </View>
          ))}
        </Card>
      </View>
    </>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function EduHousing({ colors, role = 'E1', onSwitchTab }: Props) {
  const visibleViews = getVisibleViews(role);
  const [activeView, setActiveView] = useState<HousingView>(visibleViews[0]?.id ?? 'overview');

  // Ensure activeView is valid for current role
  const safeView = visibleViews.some((v) => v.id === activeView) ? activeView : visibleViews[0]?.id ?? 'overview';

  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Pill toggle row */}
      {visibleViews.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.pillToggleRow}
        >
          {visibleViews.map((view) => {
            const active = safeView === view.id;
            return (
              <Pressable
                key={view.id}
                style={[
                  s.pillToggle,
                  {
                    backgroundColor: active ? colors.text : 'transparent',
                    borderColor: active ? colors.text : colors.border,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveView(view.id);
                }}
              >
                <ThemedText
                  style={[
                    s.pillToggleText,
                    { color: active ? colors.background : colors.textSecondary },
                  ]}
                >
                  {view.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Active view content */}
      {safeView === 'overview' && <OverviewView colors={colors} role={role} />}
      {safeView === 'assignments' && <AssignmentsView colors={colors} role={role} />}
      {safeView === 'inventory' && <InventoryView colors={colors} />}
      {safeView === 'occupancy' && <OccupancyView colors={colors} />}
      {safeView === 'move' && <MoveView colors={colors} />}
      {safeView === 'work-orders' && <WorkOrdersView colors={colors} role={role} />}
      {safeView === 'inspections' && <InspectionsView colors={colors} />}
      {safeView === 'support' && <ResidentSupportView colors={colors} role={role} />}

      <View style={s.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  moduleContainer: { marginBottom: Spacing.lg },
  bottomSpacer: { height: 120 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: Spacing.md },

  // Pill toggle
  pillToggleRow: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: 2, marginBottom: Spacing.lg },
  pillToggle: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: BorderRadius.full, borderWidth: StyleSheet.hairlineWidth },
  pillToggleText: { fontSize: 12, fontWeight: '600' },

  // Filters (within views)
  filterScroll: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm, paddingVertical: 2 },
  filterPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: StyleSheet.hairlineWidth },
  filterPillText: { fontSize: 12, fontWeight: '600' },

  // KPI grid
  kpiGrid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.sm },
  kpiExtras: { marginTop: Spacing.sm },
  kpiExtraText: { fontSize: 11, textAlign: 'center', lineHeight: 16 },

  // Hall header
  hallHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  hallNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hallName: { fontSize: 16, fontWeight: '700' },
  hallMeta: { fontSize: 12, marginBottom: Spacing.sm },

  // Progress bar
  progressContainer: { marginBottom: Spacing.sm },
  progressBg: { height: 6, borderRadius: 3, marginBottom: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: 10 },

  // Amenities / chips
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: Spacing.sm },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  chipText: { fontSize: 10, fontWeight: '500' },

  // Assignment (student)
  assignmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  assignmentHall: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  assignmentRoom: { fontSize: 13 },
  detailRows: { gap: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 13 },
  raTitle: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.sm },
  raCard: { flexDirection: 'row', gap: Spacing.sm },
  raAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  raInitials: { fontSize: 14, fontWeight: '700' },
  raInfo: { flex: 1, gap: 2 },
  raName: { fontSize: 14, fontWeight: '600' },
  raContact: { fontSize: 12 },

  // Student meal plan
  mealPlanName: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.md },

  // Meal plans (overview)
  mealPlanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  mealPlanNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  mealPlanTitle: { fontSize: 15, fontWeight: '700' },
  mealPlanCost: { fontSize: 15, fontWeight: '700' },
  mealPlanDesc: { fontSize: 12, lineHeight: 17, marginBottom: Spacing.sm },
  mealPlanMeta: { fontSize: 11 },

  // Timeline
  timelineRow: { flexDirection: 'row', marginBottom: 2 },
  timelineDotCol: { width: 20, alignItems: 'center' },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  timelineLine: { width: 2, flex: 1, marginTop: 2 },
  timelineContent: { flex: 1, paddingBottom: Spacing.md, paddingLeft: Spacing.sm },
  timelineDateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  timelineDate: { fontSize: 12, fontWeight: '700' },
  timelineTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  timelineDesc: { fontSize: 12, lineHeight: 16 },

  // List rows (reusable)
  listRow: { flexDirection: 'row', paddingVertical: 10, gap: Spacing.sm },
  listRowContent: { flex: 1 },
  listRowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2, gap: 8 },
  listRowTitle: { fontSize: 14, fontWeight: '600', flex: 1 },
  listRowMeta: { fontSize: 12, marginBottom: 2 },
  listRowSub: { fontSize: 11, marginTop: 2 },

  // Occupancy specific
  occupancyPct: { fontSize: 14, fontWeight: '700' },
  trendText: { fontSize: 12, fontWeight: '600' },
  floorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  floorLabel: { fontSize: 11, fontWeight: '500', width: 50 },
  floorBarWrap: { flex: 1 },
  floorBarBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  floorBarFill: { height: '100%', borderRadius: 2 },
  floorPct: { fontSize: 10, fontWeight: '600', width: 30, textAlign: 'right' },
  floorEmpty: { fontSize: 10, width: 50, textAlign: 'right' },

  // Inventory
  inventoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginVertical: Spacing.sm },
  inventoryItem: { alignItems: 'center', minWidth: 50 },
  inventoryValue: { fontSize: 16, fontWeight: '700' },
  inventoryLabel: { fontSize: 9, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 1 },

  // Work orders
  woBadgeRow: { flexDirection: 'row', gap: 6, marginBottom: 4, marginTop: 2 },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth },
  submitButtonText: { fontSize: 14, fontWeight: '600' },

  // Violations
  violationList: { marginTop: Spacing.sm, gap: 4 },
  violationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  violationText: { fontSize: 11, fontWeight: '500', flex: 1 },
});
