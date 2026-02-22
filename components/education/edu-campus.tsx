/**
 * Education Campus — 5-view pill-toggled campus hub.
 * Views: Overview | Services | Facilities | Safety | Student Life
 *
 * RBAC:
 *   E1/E2 — All views, full operational data, work order management, incident details
 *   E3    — All views, can submit work orders, see safety reports
 *   E4    — Overview / Services / Safety / Student Life, limited facilities view
 *   E5    — Overview / Services only
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
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
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

type CampusView = 'overview' | 'services' | 'facilities' | 'safety' | 'student-life';

interface ViewTab {
  id: CampusView;
  label: string;
}

const ALL_VIEWS: ViewTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'services', label: 'Services' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'safety', label: 'Safety' },
  { id: 'student-life', label: 'Student Life' },
];

function getAvailableViews(role: EducationRoleLens): ViewTab[] {
  // E5: Overview / Services only
  if (role === 'E5') return ALL_VIEWS.filter((v) => v.id === 'overview' || v.id === 'services');
  // E4: Overview / Services / Safety / Student Life (limited facilities)
  if (role === 'E4') return ALL_VIEWS.filter((v) => v.id !== 'facilities');
  // E1/E2/E3: All views
  return ALL_VIEWS;
}

// =============================================================================
// INLINE MOCK DATA
// =============================================================================

// --- Campus Overview ---

interface CampusInfo {
  name: string;
  location: string;
  city: string;
  state: string;
  zipCode: string;
  acreage: number;
  founded: number;
  buildingCount: number;
  parkingSpaces: number;
  totalSqFt: string;
  sustainability: string;
  sustainabilityScore: number;
  campusType: string;
  nearestAirport: string;
  transitAccess: string;
  enrolledStudents: number;
  upcomingEventsCount: number;
}

const CAMPUS: CampusInfo = {
  name: 'Main Campus',
  location: '1200 University Boulevard',
  city: 'Howard',
  state: 'Georgia',
  zipCode: '30301',
  acreage: 342,
  founded: 1891,
  buildingCount: 48,
  parkingSpaces: 4200,
  totalSqFt: '2.8M',
  sustainability: 'LEED Gold Campus',
  sustainabilityScore: 82,
  campusType: 'Urban Research Campus',
  nearestAirport: 'Hartsfield-Jackson (ATL) \u2014 18 mi',
  transitAccess: 'MARTA Red Line \u2014 University Station',
  enrolledStudents: 12450,
  upcomingEventsCount: 14,
};

const CAMPUS_ALERTS: { id: string; message: string; severity: 'info' | 'warning' | 'urgent'; timestamp: string }[] = [
  { id: 'alert-1', message: 'Henderson Library 3rd floor closed for renovation through Mar 15', severity: 'info', timestamp: '2h ago' },
  { id: 'alert-2', message: 'Water main repair on University Blvd \u2014 detour via Oak St', severity: 'warning', timestamp: '5h ago' },
  { id: 'alert-3', message: 'Tornado drill scheduled for Feb 26 at 10:00 AM', severity: 'info', timestamp: '1d ago' },
];

const ALERT_SEVERITY_COLOR: Record<string, string> = { info: '#1D9BF0', warning: '#F59E0B', urgent: '#EF4444' };

// --- Campus Services ---

interface CampusService {
  id: string;
  name: string;
  icon: string;
  category: string;
  location: string;
  hours: string;
  phone: string;
  status: 'open' | 'limited' | 'closed';
  description: string;
  waitTime?: string;
  nextAvailable?: string;
}

const CAMPUS_SERVICES: CampusService[] = [
  {
    id: 'svc-1',
    name: 'IT Help Desk',
    icon: 'desktopcomputer',
    category: 'Technology',
    location: 'Morrison Science Center, Room 102',
    hours: 'Mon\u2013Fri 8AM\u20138PM, Sat 10AM\u20134PM',
    phone: '(404) 555-2500',
    status: 'open',
    description: 'Wi-Fi support, software licensing, device repair, password resets, VPN access.',
    waitTime: '~10 min',
  },
  {
    id: 'svc-2',
    name: 'Counseling & Wellness',
    icon: 'heart.fill',
    category: 'Health',
    location: 'Carter Student Center, Room 240',
    hours: 'Mon\u2013Fri 8:30AM\u20135PM',
    phone: '(404) 555-2400',
    status: 'open',
    description: 'Individual counseling, group therapy, crisis intervention, wellness workshops.',
    nextAvailable: 'Feb 20',
  },
  {
    id: 'svc-3',
    name: 'Student Health Center',
    icon: 'cross.fill',
    category: 'Health',
    location: 'Health Sciences Complex, Suite 100',
    hours: 'Mon\u2013Fri 8AM\u20135PM, Urgent Care 24/7',
    phone: '(404) 555-2300',
    status: 'open',
    description: 'Primary care, immunizations, mental health counseling, pharmacy, lab services.',
    waitTime: '~25 min',
  },
  {
    id: 'svc-4',
    name: 'Henderson Library',
    icon: 'books.vertical.fill',
    category: 'Academic',
    location: 'Henderson Library, 1st Floor',
    hours: 'Mon\u2013Thu 7AM\u201312AM, Fri 7AM\u201310PM, Sat\u2013Sun 10AM\u201310PM',
    phone: '(404) 555-2100',
    status: 'limited',
    description: 'Study rooms, digital labs, interlibrary loan, archives. Phase 2 renovation \u2014 3rd floor closed.',
  },
  {
    id: 'svc-5',
    name: 'University Dining',
    icon: 'fork.knife',
    category: 'Dining',
    location: 'University Dining Hall',
    hours: 'Mon\u2013Fri 7AM\u20139PM, Sat\u2013Sun 8AM\u20138PM',
    phone: '(404) 555-2200',
    status: 'open',
    description: 'Main dining facility, allergen-free station, halal/kosher options, grab-and-go.',
  },
  {
    id: 'svc-6',
    name: 'Campus Bookstore',
    icon: 'bag.fill',
    category: 'Retail',
    location: 'Carter Student Center, 1st Floor',
    hours: 'Mon\u2013Fri 8AM\u20137PM, Sat 10AM\u20134PM',
    phone: '(404) 555-2600',
    status: 'open',
    description: 'Textbooks, apparel, school supplies, graduation regalia, online ordering.',
  },
  {
    id: 'svc-7',
    name: 'Career Services',
    icon: 'briefcase.fill',
    category: 'Professional',
    location: 'Administration Building, Suite 205',
    hours: 'Mon\u2013Fri 9AM\u20135PM',
    phone: '(404) 555-2700',
    status: 'open',
    description: 'Resume workshops, mock interviews, career fairs, alumni networking, job board.',
    nextAvailable: 'Walk-in hours 1\u20133PM',
  },
  {
    id: 'svc-8',
    name: 'Campus Recreation',
    icon: 'figure.run',
    category: 'Recreation',
    location: 'Recreation Center',
    hours: 'Mon\u2013Fri 6AM\u201311PM, Sat\u2013Sun 8AM\u201310PM',
    phone: '(404) 555-2800',
    status: 'open',
    description: 'Fitness center, pool, intramural sports, outdoor adventure program, group fitness.',
  },
  {
    id: 'svc-9',
    name: 'Financial Aid Office',
    icon: 'dollarsign.circle.fill',
    category: 'Financial',
    location: 'Administration Building, Suite 110',
    hours: 'Mon\u2013Fri 8:30AM\u20134:30PM',
    phone: '(404) 555-2900',
    status: 'open',
    description: 'FAFSA assistance, scholarship applications, work-study, loan counseling.',
    waitTime: '~15 min',
  },
  {
    id: 'svc-10',
    name: 'Registrar',
    icon: 'doc.text.fill',
    category: 'Academic',
    location: 'Administration Building, Suite 120',
    hours: 'Mon\u2013Fri 8:30AM\u20134:30PM',
    phone: '(404) 555-3000',
    status: 'open',
    description: 'Transcripts, enrollment verification, degree audits, course registration support.',
  },
];

const SERVICE_STATUS_COLOR: Record<string, string> = { open: '#22C55E', limited: '#F59E0B', closed: '#EF4444' };

// --- Facilities / Buildings ---

type BuildingType = 'academic' | 'administrative' | 'residential' | 'athletic' | 'library' | 'dining' | 'research' | 'student_center' | 'medical' | 'parking';

interface Building {
  id: string;
  name: string;
  type: BuildingType;
  yearBuilt: number;
  sqFt: string;
  floors: number;
  status: 'operational' | 'renovation' | 'construction' | 'closed';
  ada: boolean;
  notable?: string;
  occupancy?: number;
  capacity?: number;
  lastInspection?: string;
  nextMaintenance?: string;
}

const BUILDINGS: Building[] = [
  { id: 'bld-1', name: 'Founders Library', type: 'academic', yearBuilt: 1891, sqFt: '85,000', floors: 4, status: 'operational', ada: true, notable: 'Historic landmark \u2014 original campus building', lastInspection: 'Jan 2026', nextMaintenance: 'Jun 2026' },
  { id: 'bld-2', name: 'Morrison Science Center', type: 'research', yearBuilt: 2018, sqFt: '120,000', floors: 5, status: 'operational', ada: true, notable: 'LEED Platinum certified', lastInspection: 'Dec 2025', nextMaintenance: 'Jul 2026' },
  { id: 'bld-3', name: 'Henderson Library', type: 'library', yearBuilt: 1968, sqFt: '95,000', floors: 4, status: 'renovation', ada: true, notable: 'Phase 2 renovation in progress', lastInspection: 'Nov 2025', nextMaintenance: 'Ongoing' },
  { id: 'bld-4', name: 'Carter Student Center', type: 'student_center', yearBuilt: 2005, sqFt: '78,000', floors: 3, status: 'operational', ada: true, notable: 'Student government offices, clubs, dining', lastInspection: 'Jan 2026', nextMaintenance: 'Aug 2026' },
  { id: 'bld-5', name: 'Williams Engineering Complex', type: 'academic', yearBuilt: 2012, sqFt: '110,000', floors: 4, status: 'operational', ada: true, lastInspection: 'Dec 2025', nextMaintenance: 'Sep 2026' },
  { id: 'bld-6', name: 'Peach State Arena', type: 'athletic', yearBuilt: 2009, sqFt: '180,000', floors: 3, status: 'operational', ada: true, occupancy: 8500, notable: 'Basketball, volleyball, convocations', lastInspection: 'Jan 2026', nextMaintenance: 'May 2026' },
  { id: 'bld-7', name: 'Robinson Hall', type: 'residential', yearBuilt: 2015, sqFt: '65,000', floors: 6, status: 'operational', ada: true, capacity: 320, occupancy: 308, lastInspection: 'Dec 2025', nextMaintenance: 'Jul 2026' },
  { id: 'bld-8', name: 'Administration Building', type: 'administrative', yearBuilt: 1952, sqFt: '42,000', floors: 3, status: 'operational', ada: true, lastInspection: 'Nov 2025', nextMaintenance: 'Apr 2026' },
  { id: 'bld-9', name: 'Health Sciences Complex', type: 'medical', yearBuilt: 2020, sqFt: '135,000', floors: 5, status: 'operational', ada: true, notable: 'Simulation labs, clinical training facility', lastInspection: 'Jan 2026', nextMaintenance: 'Oct 2026' },
  { id: 'bld-10', name: 'Innovation Center', type: 'research', yearBuilt: 2024, sqFt: '0', floors: 4, status: 'construction', ada: true, notable: 'Expected completion: Aug 2026' },
];

const BUILDING_TYPE_ICON: Record<BuildingType, string> = {
  academic: 'book.fill',
  administrative: 'building.2.fill',
  residential: 'house.fill',
  athletic: 'sportscourt.fill',
  library: 'books.vertical.fill',
  dining: 'fork.knife',
  research: 'magnifyingglass',
  student_center: 'person.3.fill',
  medical: 'cross.fill',
  parking: 'car.fill',
};

const BUILDING_TYPE_LABEL: Record<BuildingType, string> = {
  academic: 'Academic',
  administrative: 'Administrative',
  residential: 'Residential',
  athletic: 'Athletic',
  library: 'Library',
  dining: 'Dining',
  research: 'Research',
  student_center: 'Student Center',
  medical: 'Medical',
  parking: 'Parking',
};

const BUILDING_STATUS_COLOR: Record<string, string> = { operational: '#22C55E', renovation: '#F59E0B', construction: '#1D9BF0', closed: '#EF4444' };

const WORK_ORDERS: { id: string; title: string; building: string; priority: 'low' | 'medium' | 'high' | 'critical'; status: 'open' | 'in_progress' | 'pending_parts' | 'completed'; submittedBy: string; submittedDate: string; assignedTo?: string; category: string; estimatedCompletion?: string }[] = [
  { id: 'wo-1', title: 'HVAC unit failure \u2014 Room 302', building: 'Founders Library', priority: 'high', status: 'in_progress', submittedBy: 'Dr. Williams', submittedDate: 'Feb 14', assignedTo: 'Mike Torres', category: 'HVAC', estimatedCompletion: 'Feb 19' },
  { id: 'wo-2', title: 'Elevator inspection overdue', building: 'Administration Building', priority: 'critical', status: 'open', submittedBy: 'Facilities Ops', submittedDate: 'Feb 16', category: 'Elevator', estimatedCompletion: 'Feb 20' },
  { id: 'wo-3', title: 'Parking lot B lighting replacement', building: 'West Parking Deck', priority: 'medium', status: 'pending_parts', submittedBy: 'Campus Police', submittedDate: 'Feb 10', assignedTo: 'James Carter', category: 'Electrical', estimatedCompletion: 'Feb 25' },
  { id: 'wo-4', title: 'Restroom plumbing leak \u2014 2nd floor', building: 'Carter Student Center', priority: 'high', status: 'in_progress', submittedBy: 'Student Report', submittedDate: 'Feb 15', assignedTo: 'Lisa Chen', category: 'Plumbing', estimatedCompletion: 'Feb 18' },
  { id: 'wo-5', title: 'Window replacement \u2014 Suite 401', building: 'Robinson Hall', priority: 'low', status: 'open', submittedBy: 'RA on duty', submittedDate: 'Feb 12', category: 'Structural' },
  { id: 'wo-6', title: 'Fire alarm panel maintenance', building: 'Morrison Science Center', priority: 'high', status: 'completed', submittedBy: 'Fire Marshal', submittedDate: 'Feb 8', assignedTo: 'Fire Systems Inc.', category: 'Fire Safety', estimatedCompletion: 'Feb 13' },
];

const WORK_ORDER_PRIORITY_COLOR: Record<string, string> = { low: '#A1A1AA', medium: '#F59E0B', high: '#F59E0B', critical: '#EF4444' };
const WORK_ORDER_STATUS_LABEL: Record<string, string> = { open: 'Open', in_progress: 'In Progress', pending_parts: 'Pending Parts', completed: 'Completed' };
const WORK_ORDER_STATUS_COLOR: Record<string, string> = { open: '#1D9BF0', in_progress: '#F59E0B', pending_parts: '#1D9BF0', completed: '#22C55E' };

// --- Renovation Tracker ---

const RENOVATIONS = [
  { id: 'ren-1', name: 'Henderson Library Phase 2', building: 'Henderson Library', budget: '$8.2M', spent: '$5.1M', percentComplete: 62, startDate: 'Aug 2025', targetCompletion: 'Mar 2026', contractor: 'Peachtree Builders', status: 'on_track' as const },
  { id: 'ren-2', name: 'Innovation Center Construction', building: 'Innovation Center', budget: '$45M', spent: '$28.7M', percentComplete: 48, startDate: 'Jan 2024', targetCompletion: 'Aug 2026', contractor: 'Southern Construction Group', status: 'delayed' as const },
  { id: 'ren-3', name: 'Admin Building ADA Upgrade', building: 'Administration Building', budget: '$1.8M', spent: '$1.6M', percentComplete: 89, startDate: 'Oct 2025', targetCompletion: 'Mar 2026', contractor: 'AccessFirst LLC', status: 'ahead' as const },
];

const RENOVATION_STATUS_COLOR: Record<string, string> = {
  on_track: '#22C55E', delayed: '#EF4444', ahead: '#1D9BF0', completed: '#22C55E',
};

const SAFETY_STATS = {
  totalIncidentsYTD: 47,
  incidentsTrend: '-12% vs prior year',
  averageResponseTime: '3.2 min',
  activeAlerts: 1,
  cleryReportsPublished: 3,
  lastDrillDate: 'Jan 15, 2026',
  nextDrillDate: 'Feb 26, 2026',
  nextDrillType: 'Tornado Drill',
  campusPoliceOfficers: 28,
  bluelightStations: 47,
  camerasCount: 320,
  aedStations: 24,
};

const SAFETY_INCIDENTS: { id: string; type: string; date: string; location: string; severity: 'minor' | 'moderate' | 'major'; status: string; description: string }[] = [
  { id: 'inc-1', type: 'Theft', date: 'Feb 14', location: 'Henderson Library', severity: 'minor', status: 'under_investigation', description: 'Laptop stolen from 2nd floor study area' },
  { id: 'inc-2', type: 'Vandalism', date: 'Feb 11', location: 'West Parking Deck', severity: 'minor', status: 'resolved', description: 'Graffiti on level 3 stairwell' },
  { id: 'inc-3', type: 'Medical Emergency', date: 'Feb 9', location: 'Recreation Center', severity: 'moderate', status: 'resolved', description: 'Student injury during intramural basketball' },
  { id: 'inc-4', type: 'Fire Alarm', date: 'Feb 6', location: 'Robinson Hall', severity: 'minor', status: 'resolved', description: 'False alarm triggered by cooking smoke' },
];

const INCIDENT_SEVERITY_COLOR: Record<string, string> = { minor: '#F59E0B', moderate: '#F59E0B', major: '#EF4444' };
const INCIDENT_STATUS_COLOR: Record<string, string> = { resolved: '#22C55E', under_investigation: '#F59E0B', open: '#1D9BF0' };

const EMERGENCY_CONTACTS: { id: string; name: string; phone: string; icon: string; available: string }[] = [
  { id: 'em-1', name: 'Campus Police', phone: '(404) 555-9111', icon: 'shield.fill', available: '24/7' },
  { id: 'em-2', name: 'Emergency Services', phone: '911', icon: 'phone.fill', available: '24/7' },
  { id: 'em-3', name: 'Title IX Office', phone: '(404) 555-9200', icon: 'exclamationmark.triangle.fill', available: 'Mon\u2013Fri 8AM\u20135PM' },
  { id: 'em-4', name: 'Crisis Hotline', phone: '(404) 555-9300', icon: 'heart.fill', available: '24/7' },
  { id: 'em-5', name: 'Facilities Emergency', phone: '(404) 555-9400', icon: 'wrench.fill', available: '24/7' },
];

const DRILL_SCHEDULE: { id: string; type: string; date: string; time: string; location: string; mandatory: boolean }[] = [
  { id: 'drill-1', type: 'Tornado Drill', date: 'Feb 26', time: '10:00 AM', location: 'All campus buildings', mandatory: true },
  { id: 'drill-2', type: 'Fire Evacuation', date: 'Mar 12', time: '2:00 PM', location: 'Residential halls', mandatory: true },
  { id: 'drill-3', type: 'Active Threat Training', date: 'Apr 3', time: '1:00 PM', location: 'Carter Student Center', mandatory: false },
];

const STUDENT_ORGS: { id: string; name: string; category: string; members: number; icon: string; meetingDay: string; meetingTime: string; advisor: string; active: boolean }[] = [
  { id: 'org-1', name: 'Student Government Association', category: 'Governance', members: 42, icon: 'building.columns.fill', meetingDay: 'Tuesday', meetingTime: '5:00 PM', advisor: 'Dr. Keisha Thomas', active: true },
  { id: 'org-2', name: 'National Society of Black Engineers', category: 'Professional', members: 68, icon: 'gearshape.fill', meetingDay: 'Wednesday', meetingTime: '6:00 PM', advisor: 'Prof. James Williams', active: true },
  { id: 'org-3', name: 'Campus Activities Board', category: 'Programming', members: 35, icon: 'star.fill', meetingDay: 'Monday', meetingTime: '4:30 PM', advisor: 'Maria Gonzalez', active: true },
  { id: 'org-4', name: 'Pre-Med Society', category: 'Academic', members: 56, icon: 'cross.fill', meetingDay: 'Thursday', meetingTime: '5:30 PM', advisor: 'Dr. Sarah Patel', active: true },
  { id: 'org-5', name: 'Debate Team', category: 'Academic', members: 24, icon: 'text.bubble.fill', meetingDay: 'Tuesday', meetingTime: '7:00 PM', advisor: 'Prof. Robert Chen', active: true },
  { id: 'org-6', name: 'Community Service Corps', category: 'Service', members: 82, icon: 'hands.sparkles.fill', meetingDay: 'Saturday', meetingTime: '9:00 AM', advisor: 'Dr. Angela Brown', active: true },
];

const CLUB_EVENTS: { id: string; title: string; org: string; date: string; time: string; location: string; attendees: number; free: boolean }[] = [
  { id: 'ce-1', title: 'Spring Career Fair', org: 'Career Services / SGA', date: 'Feb 25', time: '10AM\u20133PM', location: 'Peach State Arena', attendees: 420, free: true },
  { id: 'ce-2', title: 'Black History Month Gala', org: 'Campus Activities Board', date: 'Feb 28', time: '7PM\u201310PM', location: 'Carter Student Center', attendees: 180, free: false },
  { id: 'ce-3', title: 'NSBE Regional Conference Prep', org: 'NSBE Chapter', date: 'Mar 2', time: '2PM\u20135PM', location: 'Williams Engineering Complex', attendees: 40, free: true },
  { id: 'ce-4', title: 'Service Saturday: Park Cleanup', org: 'Community Service Corps', date: 'Mar 8', time: '9AM\u201312PM', location: 'Howard City Park', attendees: 55, free: true },
  { id: 'ce-5', title: 'Spring Fling Festival', org: 'Campus Activities Board', date: 'Mar 15', time: '12PM\u20138PM', location: 'University Green', attendees: 0, free: true },
];

const INTRAMURAL_SPORTS: { id: string; name: string; season: string; teams: number; participants: number; registrationDeadline: string; status: string }[] = [
  { id: 'im-1', name: 'Basketball (5v5)', season: 'Spring', teams: 16, participants: 128, registrationDeadline: 'Feb 1', status: 'active' },
  { id: 'im-2', name: 'Indoor Volleyball', season: 'Spring', teams: 12, participants: 84, registrationDeadline: 'Feb 1', status: 'active' },
  { id: 'im-3', name: 'Flag Football', season: 'Spring', teams: 0, participants: 0, registrationDeadline: 'Mar 1', status: 'registration_open' },
  { id: 'im-4', name: 'Soccer (Outdoor)', season: 'Spring', teams: 0, participants: 0, registrationDeadline: 'Mar 15', status: 'upcoming' },
];

const INTRAMURAL_STATUS_COLOR: Record<string, string> = { active: '#22C55E', registration_open: '#1D9BF0', upcoming: '#1D9BF0', completed: '#A1A1AA' };

const GREEK_ORGS: { id: string; name: string; letters: string; council: string; type: 'fraternity' | 'sorority'; members: number; founded: string; gpa: number; serviceHours: number }[] = [
  { id: 'gk-1', name: 'Alpha Phi Alpha', letters: '\u0391\u03A6\u0391', council: 'NPHC', type: 'fraternity', members: 32, founded: '1906', gpa: 3.24, serviceHours: 480 },
  { id: 'gk-2', name: 'Delta Sigma Theta', letters: '\u0394\u03A3\u0398', council: 'NPHC', type: 'sorority', members: 38, founded: '1913', gpa: 3.41, serviceHours: 620 },
  { id: 'gk-3', name: 'Kappa Alpha Psi', letters: '\u039A\u0391\u03A8', council: 'NPHC', type: 'fraternity', members: 28, founded: '1911', gpa: 3.18, serviceHours: 410 },
  { id: 'gk-4', name: 'Alpha Kappa Alpha', letters: '\u0391\u039A\u0391', council: 'NPHC', type: 'sorority', members: 35, founded: '1908', gpa: 3.52, serviceHours: 590 },
  { id: 'gk-5', name: 'Omega Psi Phi', letters: '\u03A9\u03A8\u03A6', council: 'NPHC', type: 'fraternity', members: 26, founded: '1911', gpa: 3.08, serviceHours: 380 },
];

const ENGAGEMENT_SIGNALS: { id: string; label: string; value: string; icon: string; trend: 'up' | 'down' | 'flat'; trendValue: string }[] = [
  { id: 'eng-1', label: 'Active Org Members', value: '2,840', icon: 'person.3.fill', trend: 'up', trendValue: '+8%' },
  { id: 'eng-2', label: 'Event Attendance (MTD)', value: '4,210', icon: 'ticket.fill', trend: 'up', trendValue: '+15%' },
  { id: 'eng-3', label: 'Intramural Participants', value: '412', icon: 'sportscourt.fill', trend: 'up', trendValue: '+5%' },
  { id: 'eng-4', label: 'Greek Life Members', value: '189', icon: 'person.2.fill', trend: 'flat', trendValue: '0%' },
  { id: 'eng-5', label: 'Community Service Hours', value: '3,200', icon: 'hands.sparkles.fill', trend: 'up', trendValue: '+22%' },
];

const TREND_COLOR: Record<string, string> = { up: '#22C55E', down: '#EF4444', flat: '#A1A1AA' };

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

function KpiBox({ label, value, colors, icon }: { label: string; value: string | number; colors: typeof Colors.light; icon?: string }) {
  return (
    <View style={shrd.kpiBox}>
      {icon && <IconSymbol name={icon as any} size={14} color={colors.textSecondary} />}
      <ThemedText style={[shrd.kpiValue, { color: colors.text }]}>{value}</ThemedText>
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
  kpiBox: { alignItems: 'center', minWidth: 70, gap: 2 },
  kpiValue: { fontSize: 18, fontWeight: '700' },
  kpiLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
});

// =============================================================================
// VIEW: OVERVIEW
// =============================================================================

function OverviewView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  return (
    <View>
      {/* Campus Summary KPIs */}
      <View style={s.moduleContainer}>
        <SectionHeader title="CAMPUS AT A GLANCE" colors={colors} />
        <Card colors={colors}>
          <View style={s.kpiGrid}>
            <KpiBox label="Buildings" value={CAMPUS.buildingCount} colors={colors} icon="building.2.fill" />
            <KpiBox label="Acreage" value={CAMPUS.acreage} colors={colors} icon="leaf.fill" />
            <KpiBox label="Students" value={CAMPUS.enrolledStudents.toLocaleString()} colors={colors} icon="person.3.fill" />
            <KpiBox label="Events" value={CAMPUS.upcomingEventsCount} colors={colors} icon="calendar" />
          </View>
        </Card>
      </View>

      {/* Campus Alerts Strip */}
      {CAMPUS_ALERTS.length > 0 && (
        <View style={s.moduleContainer}>
          <SectionHeader title="CAMPUS ALERTS" colors={colors} count={CAMPUS_ALERTS.length} />
          {CAMPUS_ALERTS.map((alert) => (
            <Card key={alert.id} colors={colors}>
              <View style={s.alertRow}>
                <View style={[s.alertDot, { backgroundColor: ALERT_SEVERITY_COLOR[alert.severity] }]} />
                <View style={s.alertContent}>
                  <ThemedText style={[s.alertMessage, { color: colors.text }]} numberOfLines={2}>
                    {alert.message}
                  </ThemedText>
                  <ThemedText style={[s.alertTimestamp, { color: colors.textTertiary }]}>{alert.timestamp}</ThemedText>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Sustainability Score */}
      <View style={s.moduleContainer}>
        <SectionHeader title="SUSTAINABILITY" colors={colors} />
        <Card colors={colors}>
          <View style={s.sustainRow}>
            <IconSymbol name="leaf.fill" size={20} color="#22C55E" />
            <View style={s.sustainContent}>
              <ThemedText style={[s.sustainTitle, { color: colors.text }]}>{CAMPUS.sustainability}</ThemedText>
              <View style={s.sustainScoreRow}>
                <View style={[s.sustainBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                  <View style={[s.sustainBarFill, { width: `${CAMPUS.sustainabilityScore}%`, backgroundColor: '#22C55E' }]} />
                </View>
                <ThemedText style={[s.sustainScore, { color: '#22C55E' }]}>{CAMPUS.sustainabilityScore}/100</ThemedText>
              </View>
            </View>
          </View>
          {isFacultyLevel(role) && (
            <View style={s.sustainDetails}>
              <View style={s.sustainDetailRow}>
                <IconSymbol name="bolt.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.sustainDetailText, { color: colors.textSecondary }]}>
                  Solar array: 12% of campus energy
                </ThemedText>
              </View>
              <View style={s.sustainDetailRow}>
                <IconSymbol name="drop.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.sustainDetailText, { color: colors.textSecondary }]}>
                  Water reclamation: 2.4M gal/yr saved
                </ThemedText>
              </View>
              <View style={s.sustainDetailRow}>
                <IconSymbol name="arrow.3.trianglepath" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.sustainDetailText, { color: colors.textSecondary }]}>
                  Waste diversion rate: 64%
                </ThemedText>
              </View>
            </View>
          )}
        </Card>
      </View>

      {/* Campus info */}
      <View style={s.moduleContainer}>
        <SectionHeader title="CAMPUS INFO" colors={colors} />
        <Card colors={colors}>
          <View style={s.infoHeader}>
            <IconSymbol name="mappin.and.ellipse" size={18} color={colors.text} />
            <ThemedText style={[s.infoTitle, { color: colors.text }]}>{CAMPUS.name}</ThemedText>
          </View>
          <ThemedText style={[s.infoAddress, { color: colors.textSecondary }]}>
            {CAMPUS.location}{'\n'}{CAMPUS.city}, {CAMPUS.state} {CAMPUS.zipCode}
          </ThemedText>
          <View style={s.infoRows}>
            <View style={s.infoRow}>
              <IconSymbol name="building.2.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.infoText, { color: colors.textSecondary }]}>{CAMPUS.campusType}</ThemedText>
            </View>
            <View style={s.infoRow}>
              <IconSymbol name="clock.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.infoText, { color: colors.textSecondary }]}>Founded {CAMPUS.founded}</ThemedText>
            </View>
            {isEnrolled(role) && (
              <>
                <View style={s.infoRow}>
                  <IconSymbol name="car.fill" size={12} color={colors.textTertiary} />
                  <ThemedText style={[s.infoText, { color: colors.textSecondary }]}>{CAMPUS.parkingSpaces.toLocaleString()} parking spaces</ThemedText>
                </View>
                <View style={s.infoRow}>
                  <IconSymbol name="airplane" size={12} color={colors.textTertiary} />
                  <ThemedText style={[s.infoText, { color: colors.textSecondary }]}>{CAMPUS.nearestAirport}</ThemedText>
                </View>
                <View style={s.infoRow}>
                  <IconSymbol name="tram.fill" size={12} color={colors.textTertiary} />
                  <ThemedText style={[s.infoText, { color: colors.textSecondary }]}>{CAMPUS.transitAccess}</ThemedText>
                </View>
              </>
            )}
          </View>
        </Card>
      </View>
    </View>
  );
}

// =============================================================================
// VIEW: SERVICES
// =============================================================================

function ServicesView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(CAMPUS_SERVICES.map((s) => s.category)))];
  const filtered = categoryFilter === 'all'
    ? CAMPUS_SERVICES
    : CAMPUS_SERVICES.filter((s) => s.category === categoryFilter);

  return (
    <View>
      <View style={s.moduleContainer}>
        <SectionHeader title="SERVICES DIRECTORY" colors={colors} count={filtered.length} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              style={[
                s.filterPill,
                { backgroundColor: categoryFilter === cat ? colors.text + '15' : 'transparent', borderColor: colors.border },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setCategoryFilter(cat);
              }}
            >
              <ThemedText style={[s.filterPillText, { color: categoryFilter === cat ? colors.text : colors.textSecondary }]}>
                {cat === 'all' ? 'All' : cat}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {filtered.map((svc) => (
          <Card key={svc.id} colors={colors}>
            <View style={s.serviceHeader}>
              <View style={[s.serviceIconWrap, { backgroundColor: colors.backgroundTertiary }]}>
                <IconSymbol name={svc.icon as any} size={18} color={colors.text} />
              </View>
              <View style={s.serviceHeaderText}>
                <View style={s.serviceNameRow}>
                  <ThemedText style={[s.serviceName, { color: colors.text }]}>{svc.name}</ThemedText>
                  <View style={[s.statusChip, { backgroundColor: SERVICE_STATUS_COLOR[svc.status] + '20' }]}>
                    <View style={[s.statusDot, { backgroundColor: SERVICE_STATUS_COLOR[svc.status] }]} />
                    <ThemedText style={[s.statusText, { color: SERVICE_STATUS_COLOR[svc.status] }]}>
                      {svc.status}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={[s.serviceLocation, { color: colors.textSecondary }]}>{svc.location}</ThemedText>
              </View>
            </View>

            <ThemedText style={[s.serviceDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {svc.description}
            </ThemedText>

            <View style={s.serviceFooter}>
              <View style={s.serviceInfoItem}>
                <IconSymbol name="clock.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.serviceInfoText, { color: colors.textTertiary }]} numberOfLines={1}>
                  {svc.hours}
                </ThemedText>
              </View>
              {isEnrolled(role) && (
                <View style={s.serviceInfoItem}>
                  <IconSymbol name="phone.fill" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.serviceInfoText, { color: colors.textTertiary }]}>
                    {svc.phone}
                  </ThemedText>
                </View>
              )}
              {svc.waitTime && (
                <View style={s.serviceInfoItem}>
                  <IconSymbol name="hourglass" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.serviceInfoText, { color: colors.textTertiary }]}>
                    Wait: {svc.waitTime}
                  </ThemedText>
                </View>
              )}
              {svc.nextAvailable && !svc.waitTime && (
                <View style={s.serviceInfoItem}>
                  <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.serviceInfoText, { color: colors.textTertiary }]}>
                    {svc.nextAvailable}
                  </ThemedText>
                </View>
              )}
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
}

// =============================================================================
// VIEW: FACILITIES
// =============================================================================

function FacilitiesView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [buildingFilter, setBuildingFilter] = useState<BuildingType | 'all'>('all');

  const filteredBuildings = buildingFilter === 'all'
    ? BUILDINGS
    : BUILDINGS.filter((b) => b.type === buildingFilter);

  const filterOptions: (BuildingType | 'all')[] = ['all', 'academic', 'residential', 'athletic', 'research', 'dining'];

  const openOrders = WORK_ORDERS.filter((wo) => wo.status !== 'completed');
  const criticalOrders = WORK_ORDERS.filter((wo) => wo.priority === 'critical' || wo.priority === 'high');

  return (
    <View>
      {/* Facilities Summary */}
      {isFacultyLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="FACILITIES SUMMARY" colors={colors} />
          <Card colors={colors}>
            <View style={s.kpiGrid}>
              <KpiBox label="Buildings" value={BUILDINGS.length} colors={colors} icon="building.2.fill" />
              <KpiBox label="Operational" value={BUILDINGS.filter((b) => b.status === 'operational').length} colors={colors} icon="checkmark.circle.fill" />
              <KpiBox label="Open Orders" value={openOrders.length} colors={colors} icon="wrench.fill" />
              <KpiBox label="Critical" value={criticalOrders.length} colors={colors} icon="exclamationmark.triangle.fill" />
            </View>
          </Card>
        </View>
      )}

      {/* Buildings List */}
      <View style={s.moduleContainer}>
        <SectionHeader title="BUILDINGS" colors={colors} count={filteredBuildings.length} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
          {filterOptions.map((f) => (
            <Pressable
              key={f}
              style={[
                s.filterPill,
                { backgroundColor: buildingFilter === f ? colors.text + '15' : 'transparent', borderColor: colors.border },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setBuildingFilter(f);
              }}
            >
              <ThemedText style={[s.filterPillText, { color: buildingFilter === f ? colors.text : colors.textSecondary }]}>
                {f === 'all' ? 'All' : BUILDING_TYPE_LABEL[f]}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        <Card colors={colors}>
          {filteredBuildings.map((bld, idx) => (
            <View
              key={bld.id}
              style={[
                s.buildingRow,
                idx < filteredBuildings.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.buildingIcon, { backgroundColor: colors.backgroundTertiary }]}>
                <IconSymbol name={BUILDING_TYPE_ICON[bld.type] as any} size={16} color={colors.textSecondary} />
              </View>
              <View style={s.buildingContent}>
                <View style={s.buildingNameRow}>
                  <ThemedText style={[s.buildingName, { color: colors.text }]} numberOfLines={1}>
                    {bld.name}
                  </ThemedText>
                  <View style={[s.statusChip, { backgroundColor: BUILDING_STATUS_COLOR[bld.status] + '20' }]}>
                    <View style={[s.statusDot, { backgroundColor: BUILDING_STATUS_COLOR[bld.status] }]} />
                    <ThemedText style={[s.statusText, { color: BUILDING_STATUS_COLOR[bld.status] }]}>
                      {bld.status.replace('_', ' ')}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={[s.buildingMeta, { color: colors.textSecondary }]}>
                  {BUILDING_TYPE_LABEL[bld.type]} {'\u00B7'} {bld.floors} floors {'\u00B7'} Built {bld.yearBuilt}
                </ThemedText>
                {isFacultyLevel(role) && bld.sqFt !== '0' && (
                  <ThemedText style={[s.buildingSqFt, { color: colors.textTertiary }]}>
                    {bld.sqFt} sq ft {bld.ada ? '\u00B7 ADA Accessible' : ''}
                  </ThemedText>
                )}
                {bld.notable && (
                  <ThemedText style={[s.buildingNote, { color: colors.textTertiary }]} numberOfLines={1}>
                    {bld.notable}
                  </ThemedText>
                )}
                {bld.occupancy != null && bld.capacity != null && isFacultyLevel(role) && (
                  <ThemedText style={[s.buildingOccupancy, { color: colors.textTertiary }]}>
                    Occupancy: {bld.occupancy}/{bld.capacity}
                  </ThemedText>
                )}
                {isFacultyLevel(role) && bld.lastInspection && (
                  <ThemedText style={[s.buildingInspection, { color: colors.textTertiary }]}>
                    Last inspection: {bld.lastInspection} {bld.nextMaintenance ? `\u00B7 Next: ${bld.nextMaintenance}` : ''}
                  </ThemedText>
                )}
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* Work Orders — E1/E2 full, E3 can submit */}
      {isFacultyLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="WORK ORDERS" colors={colors} count={openOrders.length} />
          {WORK_ORDERS.filter((wo) => isDeanLevel(role) || wo.status !== 'completed').map((wo) => (
            <Card key={wo.id} colors={colors}>
              <View style={s.woHeader}>
                <View style={[s.woPriorityDot, { backgroundColor: WORK_ORDER_PRIORITY_COLOR[wo.priority] }]} />
                <View style={s.woHeaderText}>
                  <ThemedText style={[s.woTitle, { color: colors.text }]} numberOfLines={1}>{wo.title}</ThemedText>
                  <ThemedText style={[s.woBuilding, { color: colors.textSecondary }]}>{wo.building}</ThemedText>
                </View>
                <View style={[s.statusChip, { backgroundColor: WORK_ORDER_STATUS_COLOR[wo.status] + '20' }]}>
                  <ThemedText style={[s.statusText, { color: WORK_ORDER_STATUS_COLOR[wo.status] }]}>
                    {WORK_ORDER_STATUS_LABEL[wo.status]}
                  </ThemedText>
                </View>
              </View>
              <View style={s.woDetails}>
                <View style={s.woDetailRow}>
                  <ThemedText style={[s.woDetailLabel, { color: colors.textTertiary }]}>Category</ThemedText>
                  <ThemedText style={[s.woDetailValue, { color: colors.textSecondary }]}>{wo.category}</ThemedText>
                </View>
                <View style={s.woDetailRow}>
                  <ThemedText style={[s.woDetailLabel, { color: colors.textTertiary }]}>Submitted</ThemedText>
                  <ThemedText style={[s.woDetailValue, { color: colors.textSecondary }]}>{wo.submittedDate} by {wo.submittedBy}</ThemedText>
                </View>
                {isDeanLevel(role) && wo.assignedTo && (
                  <View style={s.woDetailRow}>
                    <ThemedText style={[s.woDetailLabel, { color: colors.textTertiary }]}>Assigned</ThemedText>
                    <ThemedText style={[s.woDetailValue, { color: colors.textSecondary }]}>{wo.assignedTo}</ThemedText>
                  </View>
                )}
                {wo.estimatedCompletion && (
                  <View style={s.woDetailRow}>
                    <ThemedText style={[s.woDetailLabel, { color: colors.textTertiary }]}>ETA</ThemedText>
                    <ThemedText style={[s.woDetailValue, { color: colors.textSecondary }]}>{wo.estimatedCompletion}</ThemedText>
                  </View>
                )}
              </View>
              <View style={s.woPriorityBadge}>
                <ThemedText style={[s.woPriorityText, { color: WORK_ORDER_PRIORITY_COLOR[wo.priority] }]}>
                  {wo.priority.toUpperCase()} PRIORITY
                </ThemedText>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Renovation Tracker — E1/E2 full, E3 limited */}
      {isFacultyLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="RENOVATION TRACKER" colors={colors} count={RENOVATIONS.length} />
          {RENOVATIONS.map((ren) => (
            <Card key={ren.id} colors={colors}>
              <View style={s.renHeader}>
                <ThemedText style={[s.renName, { color: colors.text }]}>{ren.name}</ThemedText>
                <View style={[s.statusChip, { backgroundColor: RENOVATION_STATUS_COLOR[ren.status] + '20' }]}>
                  <ThemedText style={[s.statusText, { color: RENOVATION_STATUS_COLOR[ren.status] }]}>
                    {ren.status.replace('_', ' ').toUpperCase()}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[s.renBuilding, { color: colors.textSecondary }]}>{ren.building}</ThemedText>

              {/* Progress bar */}
              <View style={s.renProgressRow}>
                <View style={[s.renBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                  <View style={[s.renBarFill, { width: `${ren.percentComplete}%`, backgroundColor: RENOVATION_STATUS_COLOR[ren.status] }]} />
                </View>
                <ThemedText style={[s.renPercent, { color: colors.text }]}>{ren.percentComplete}%</ThemedText>
              </View>

              <View style={s.renDetails}>
                {isDeanLevel(role) && (
                  <View style={s.renDetailRow}>
                    <ThemedText style={[s.renDetailLabel, { color: colors.textTertiary }]}>Budget</ThemedText>
                    <ThemedText style={[s.renDetailValue, { color: colors.textSecondary }]}>{ren.budget} (spent: {ren.spent})</ThemedText>
                  </View>
                )}
                <View style={s.renDetailRow}>
                  <ThemedText style={[s.renDetailLabel, { color: colors.textTertiary }]}>Timeline</ThemedText>
                  <ThemedText style={[s.renDetailValue, { color: colors.textSecondary }]}>{ren.startDate} \u2014 {ren.targetCompletion}</ThemedText>
                </View>
                {isDeanLevel(role) && (
                  <View style={s.renDetailRow}>
                    <ThemedText style={[s.renDetailLabel, { color: colors.textTertiary }]}>Contractor</ThemedText>
                    <ThemedText style={[s.renDetailValue, { color: colors.textSecondary }]}>{ren.contractor}</ThemedText>
                  </View>
                )}
              </View>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
}

// =============================================================================
// VIEW: SAFETY
// =============================================================================

function SafetyView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  return (
    <View>
      {/* Safety Dashboard KPIs */}
      <View style={s.moduleContainer}>
        <SectionHeader title="SAFETY DASHBOARD" colors={colors} />
        <Card colors={colors}>
          <View style={s.kpiGrid}>
            <KpiBox label="Incidents YTD" value={SAFETY_STATS.totalIncidentsYTD} colors={colors} icon="exclamationmark.triangle.fill" />
            <KpiBox label="Avg Response" value={SAFETY_STATS.averageResponseTime} colors={colors} icon="clock.fill" />
            <KpiBox label="Officers" value={SAFETY_STATS.campusPoliceOfficers} colors={colors} icon="shield.fill" />
            <KpiBox label="Active Alerts" value={SAFETY_STATS.activeAlerts} colors={colors} icon="bell.fill" />
          </View>
          {isFacultyLevel(role) && (
            <View style={s.safetyTrend}>
              <IconSymbol name="arrow.down.right" size={12} color="#22C55E" />
              <ThemedText style={[s.safetyTrendText, { color: '#22C55E' }]}>
                {SAFETY_STATS.incidentsTrend}
              </ThemedText>
            </View>
          )}
        </Card>
      </View>

      {/* Safety Infrastructure */}
      <View style={s.moduleContainer}>
        <SectionHeader title="SAFETY INFRASTRUCTURE" colors={colors} />
        <Card colors={colors}>
          <View style={s.kpiGrid}>
            <KpiBox label="Blue Lights" value={SAFETY_STATS.bluelightStations} colors={colors} icon="phone.fill" />
            <KpiBox label="Cameras" value={SAFETY_STATS.camerasCount} colors={colors} icon="video.fill" />
            <KpiBox label="AED Stations" value={SAFETY_STATS.aedStations} colors={colors} icon="bolt.heart.fill" />
          </View>
        </Card>
      </View>

      {/* Emergency Contacts */}
      <View style={s.moduleContainer}>
        <SectionHeader title="EMERGENCY CONTACTS" colors={colors} />
        <Card colors={colors}>
          {EMERGENCY_CONTACTS.map((contact, idx) => (
            <Pressable
              key={contact.id}
              style={[
                s.contactRow,
                idx < EMERGENCY_CONTACTS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={[s.contactIcon, { backgroundColor: '#EF444420' }]}>
                <IconSymbol name={contact.icon as any} size={14} color="#EF4444" />
              </View>
              <View style={s.contactContent}>
                <ThemedText style={[s.contactName, { color: colors.text }]}>{contact.name}</ThemedText>
                <ThemedText style={[s.contactPhone, { color: colors.textSecondary }]}>{contact.phone}</ThemedText>
              </View>
              <ThemedText style={[s.contactAvail, { color: colors.textTertiary }]}>{contact.available}</ThemedText>
            </Pressable>
          ))}
        </Card>
      </View>

      {/* Drill Schedule */}
      <View style={s.moduleContainer}>
        <SectionHeader title="DRILL SCHEDULE" colors={colors} count={DRILL_SCHEDULE.length} />
        <Card colors={colors}>
          {DRILL_SCHEDULE.map((drill, idx) => (
            <View
              key={drill.id}
              style={[
                s.drillRow,
                idx < DRILL_SCHEDULE.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.drillDateBox, { backgroundColor: colors.backgroundTertiary }]}>
                <ThemedText style={[s.drillDate, { color: colors.text }]}>{drill.date}</ThemedText>
                <ThemedText style={[s.drillTime, { color: colors.textSecondary }]}>{drill.time}</ThemedText>
              </View>
              <View style={s.drillContent}>
                <ThemedText style={[s.drillType, { color: colors.text }]}>{drill.type}</ThemedText>
                <ThemedText style={[s.drillLocation, { color: colors.textSecondary }]}>{drill.location}</ThemedText>
                {drill.mandatory && (
                  <View style={[s.mandatoryBadge, { backgroundColor: '#EF444420' }]}>
                    <ThemedText style={[s.mandatoryText, { color: '#EF4444' }]}>MANDATORY</ThemedText>
                  </View>
                )}
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* Incident Log — E1/E2 full details, E3 sees reports, E4 limited */}
      {isEnrolled(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="RECENT INCIDENTS" colors={colors} count={SAFETY_INCIDENTS.length} />
          {(isFacultyLevel(role) ? SAFETY_INCIDENTS : SAFETY_INCIDENTS.slice(0, 3)).map((inc) => (
            <Card key={inc.id} colors={colors}>
              <View style={s.incHeader}>
                <View style={[s.incSeverityDot, { backgroundColor: INCIDENT_SEVERITY_COLOR[inc.severity] }]} />
                <View style={s.incHeaderText}>
                  <ThemedText style={[s.incType, { color: colors.text }]}>{inc.type}</ThemedText>
                  <ThemedText style={[s.incDate, { color: colors.textSecondary }]}>{inc.date} \u00B7 {inc.location}</ThemedText>
                </View>
                <View style={[s.statusChip, { backgroundColor: INCIDENT_STATUS_COLOR[inc.status] + '20' }]}>
                  <ThemedText style={[s.statusText, { color: INCIDENT_STATUS_COLOR[inc.status] }]}>
                    {inc.status.replace('_', ' ')}
                  </ThemedText>
                </View>
              </View>
              {isFacultyLevel(role) && (
                <ThemedText style={[s.incDescription, { color: colors.textSecondary }]}>
                  {inc.description}
                </ThemedText>
              )}
            </Card>
          ))}
        </View>
      )}

      {/* Clery Report Data — admin only */}
      {isFacultyLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="CLERY REPORT DATA" colors={colors} />
          <Card colors={colors}>
            <View style={s.cleryRow}>
              <IconSymbol name="doc.text.fill" size={16} color={colors.textSecondary} />
              <View style={s.cleryContent}>
                <ThemedText style={[s.cleryTitle, { color: colors.text }]}>Annual Security Report</ThemedText>
                <ThemedText style={[s.cleryMeta, { color: colors.textSecondary }]}>
                  {SAFETY_STATS.cleryReportsPublished} reports published \u00B7 Last updated Jan 2026
                </ThemedText>
              </View>
            </View>
            {[
              { label: 'Burglary', value: '8 (CY 2025)' },
              { label: 'Motor Vehicle Theft', value: '3 (CY 2025)' },
              { label: 'Aggravated Assault', value: '1 (CY 2025)' },
              { label: 'Drug/Alcohol Violations', value: '24 (CY 2025)' },
              ...(isDeanLevel(role) ? [{ label: 'VAWA Offenses', value: '5 (CY 2025)' }] : []),
            ].map((row) => (
              <View key={row.label} style={s.cleryStatRow}>
                <ThemedText style={[s.cleryStatLabel, { color: colors.textTertiary }]}>{row.label}</ThemedText>
                <ThemedText style={[s.cleryStatValue, { color: colors.textSecondary }]}>{row.value}</ThemedText>
              </View>
            ))}
          </Card>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// VIEW: STUDENT LIFE
// =============================================================================

function StudentLifeView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  return (
    <View>
      {/* Engagement Signals */}
      <View style={s.moduleContainer}>
        <SectionHeader title="ENGAGEMENT SIGNALS" colors={colors} />
        <Card colors={colors}>
          {ENGAGEMENT_SIGNALS.map((sig, idx) => (
            <View
              key={sig.id}
              style={[
                s.engRow,
                idx < ENGAGEMENT_SIGNALS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.engIconWrap, { backgroundColor: colors.backgroundTertiary }]}>
                <IconSymbol name={sig.icon as any} size={14} color={colors.textSecondary} />
              </View>
              <View style={s.engContent}>
                <ThemedText style={[s.engLabel, { color: colors.text }]}>{sig.label}</ThemedText>
                <ThemedText style={[s.engValue, { color: colors.textSecondary }]}>{sig.value}</ThemedText>
              </View>
              <View style={s.engTrend}>
                <IconSymbol
                  name={sig.trend === 'up' ? 'arrow.up.right' as any : sig.trend === 'down' ? 'arrow.down.right' as any : 'minus' as any}
                  size={10}
                  color={TREND_COLOR[sig.trend]}
                />
                <ThemedText style={[s.engTrendText, { color: TREND_COLOR[sig.trend] }]}>
                  {sig.trendValue}
                </ThemedText>
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* Student Organizations */}
      <View style={s.moduleContainer}>
        <SectionHeader title="STUDENT ORGANIZATIONS" colors={colors} count={STUDENT_ORGS.length} />
        <Card colors={colors}>
          {STUDENT_ORGS.map((org, idx) => (
            <Pressable
              key={org.id}
              style={[
                s.orgRow,
                idx < STUDENT_ORGS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={[s.orgIconWrap, { backgroundColor: colors.backgroundTertiary }]}>
                <IconSymbol name={org.icon as any} size={16} color={colors.text} />
              </View>
              <View style={s.orgContent}>
                <ThemedText style={[s.orgName, { color: colors.text }]} numberOfLines={1}>{org.name}</ThemedText>
                <ThemedText style={[s.orgMeta, { color: colors.textSecondary }]}>
                  {org.category} {'\u00B7'} {org.members} members
                </ThemedText>
                {isEnrolled(role) && (
                  <ThemedText style={[s.orgMeeting, { color: colors.textTertiary }]}>
                    {org.meetingDay}s at {org.meetingTime}
                  </ThemedText>
                )}
              </View>
              <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
            </Pressable>
          ))}
        </Card>
      </View>

      {/* Club Events */}
      <View style={s.moduleContainer}>
        <SectionHeader title="CLUB EVENTS" colors={colors} count={CLUB_EVENTS.length} />
        <Card colors={colors}>
          {CLUB_EVENTS.map((evt, idx) => (
            <Pressable
              key={evt.id}
              style={[
                s.eventRow,
                idx < CLUB_EVENTS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={[s.eventDateBox, { backgroundColor: colors.backgroundTertiary }]}>
                <ThemedText style={[s.eventDate, { color: colors.text }]}>{evt.date}</ThemedText>
                <ThemedText style={[s.eventTime, { color: colors.textSecondary }]}>{evt.time}</ThemedText>
              </View>
              <View style={s.eventContent}>
                <ThemedText style={[s.eventTitle, { color: colors.text }]} numberOfLines={1}>{evt.title}</ThemedText>
                <ThemedText style={[s.eventOrg, { color: colors.textSecondary }]}>{evt.org}</ThemedText>
                <ThemedText style={[s.eventLocation, { color: colors.textTertiary }]}>{evt.location}</ThemedText>
              </View>
              {evt.free ? (
                <View style={[s.freeBadge, { backgroundColor: '#22C55E20' }]}>
                  <ThemedText style={[s.freeText, { color: '#22C55E' }]}>FREE</ThemedText>
                </View>
              ) : (
                <View style={[s.freeBadge, { backgroundColor: colors.backgroundTertiary }]}>
                  <ThemedText style={[s.freeText, { color: colors.textSecondary }]}>$</ThemedText>
                </View>
              )}
            </Pressable>
          ))}
        </Card>
      </View>

      {/* Intramural Sports */}
      <View style={s.moduleContainer}>
        <SectionHeader title="INTRAMURAL SPORTS" colors={colors} count={INTRAMURAL_SPORTS.length} />
        <Card colors={colors}>
          {INTRAMURAL_SPORTS.map((sport, idx) => (
            <View
              key={sport.id}
              style={[
                s.imRow,
                idx < INTRAMURAL_SPORTS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={s.imContent}>
                <View style={s.imNameRow}>
                  <ThemedText style={[s.imName, { color: colors.text }]}>{sport.name}</ThemedText>
                  <View style={[s.statusChip, { backgroundColor: INTRAMURAL_STATUS_COLOR[sport.status] + '20' }]}>
                    <ThemedText style={[s.statusText, { color: INTRAMURAL_STATUS_COLOR[sport.status] }]}>
                      {sport.status.replace('_', ' ')}
                    </ThemedText>
                  </View>
                </View>
                {sport.status === 'active' ? (
                  <ThemedText style={[s.imMeta, { color: colors.textSecondary }]}>
                    {sport.teams} teams {'\u00B7'} {sport.participants} participants
                  </ThemedText>
                ) : (
                  <ThemedText style={[s.imMeta, { color: colors.textSecondary }]}>
                    Registration deadline: {sport.registrationDeadline}
                  </ThemedText>
                )}
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* Greek Life */}
      <View style={s.moduleContainer}>
        <SectionHeader title="GREEK LIFE" colors={colors} count={GREEK_ORGS.length} />
        <Card colors={colors}>
          {GREEK_ORGS.map((org, idx) => (
            <View
              key={org.id}
              style={[
                s.greekRow,
                idx < GREEK_ORGS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.greekLetters, { backgroundColor: colors.backgroundTertiary }]}>
                <ThemedText style={[s.greekLettersText, { color: colors.text }]}>{org.letters}</ThemedText>
              </View>
              <View style={s.greekContent}>
                <ThemedText style={[s.greekName, { color: colors.text }]}>{org.name}</ThemedText>
                <ThemedText style={[s.greekMeta, { color: colors.textSecondary }]}>
                  {org.council} {'\u00B7'} {org.type === 'fraternity' ? 'Fraternity' : 'Sorority'} {'\u00B7'} {org.members} members
                </ThemedText>
                {isFacultyLevel(role) && (
                  <ThemedText style={[s.greekStats, { color: colors.textTertiary }]}>
                    GPA: {org.gpa.toFixed(2)} {'\u00B7'} {org.serviceHours} service hrs
                  </ThemedText>
                )}
              </View>
            </View>
          ))}
        </Card>
      </View>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function EduCampus({ colors, role = 'E1', onSwitchTab }: Props) {
  const availableViews = getAvailableViews(role);
  const [activeView, setActiveView] = useState<CampusView>(availableViews[0]?.id ?? 'overview');

  // If role changes and current view is no longer available, reset
  const currentViewValid = availableViews.some((v) => v.id === activeView);
  const resolvedView = currentViewValid ? activeView : availableViews[0]?.id ?? 'overview';

  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* View Toggle Pills */}
      <View style={s.pillRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillScroll}>
          {availableViews.map((view) => {
            const active = resolvedView === view.id;
            return (
              <Pressable
                key={view.id}
                style={[
                  s.pill,
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
                <ThemedText style={[s.pillText, { color: active ? colors.background : colors.textSecondary }]}>
                  {view.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Active View */}
      {resolvedView === 'overview' && <OverviewView colors={colors} role={role} />}
      {resolvedView === 'services' && <ServicesView colors={colors} role={role} />}
      {resolvedView === 'facilities' && <FacilitiesView colors={colors} role={role} />}
      {resolvedView === 'safety' && <SafetyView colors={colors} role={role} />}
      {resolvedView === 'student-life' && <StudentLifeView colors={colors} role={role} />}

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

  // Pill toggle
  pillRow: { marginBottom: Spacing.lg },
  pillScroll: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: 2 },
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: BorderRadius.full, borderWidth: StyleSheet.hairlineWidth },
  pillText: { fontSize: 13, fontWeight: '600' },

  // KPI grid
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', gap: Spacing.md },

  // Alerts
  alertRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  alertDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  alertContent: { flex: 1 },
  alertMessage: { fontSize: 13, lineHeight: 18 },
  alertTimestamp: { fontSize: 10, marginTop: 2 },

  // Sustainability
  sustainRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  sustainContent: { flex: 1 },
  sustainTitle: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  sustainScoreRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sustainBarBg: { flex: 1, height: 6, borderRadius: 3 },
  sustainBarFill: { height: 6, borderRadius: 3 },
  sustainScore: { fontSize: 12, fontWeight: '700' },
  sustainDetails: { marginTop: Spacing.md, gap: 6 },
  sustainDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sustainDetailText: { fontSize: 12 },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  infoTitle: { fontSize: 17, fontWeight: '700' },
  infoAddress: { fontSize: 13, lineHeight: 18, marginBottom: Spacing.md },
  infoRows: { gap: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 12 },
  filterScroll: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm, paddingVertical: 2 },
  filterPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: StyleSheet.hairlineWidth },
  filterPillText: { fontSize: 12, fontWeight: '600' },
  serviceHeader: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  serviceIconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  serviceHeaderText: { flex: 1 },
  serviceNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  serviceName: { fontSize: 15, fontWeight: '600' },
  serviceLocation: { fontSize: 11 },
  serviceDesc: { fontSize: 12, lineHeight: 17, marginBottom: Spacing.sm },
  serviceFooter: { gap: 4 },
  serviceInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  serviceInfoText: { fontSize: 11, flex: 1 },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3, textTransform: 'capitalize' },
  buildingRow: { flexDirection: 'row', paddingVertical: 10, gap: Spacing.sm },
  buildingIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  buildingContent: { flex: 1 },
  buildingNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  buildingName: { fontSize: 14, fontWeight: '600', flex: 1 },
  buildingMeta: { fontSize: 11, marginBottom: 1 },
  buildingSqFt: { fontSize: 10 },
  buildingNote: { fontSize: 10, fontStyle: 'italic', marginTop: 2 },
  buildingOccupancy: { fontSize: 10, marginTop: 1 },
  buildingInspection: { fontSize: 10, marginTop: 1 },
  woHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  woPriorityDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  woHeaderText: { flex: 1 },
  woTitle: { fontSize: 14, fontWeight: '600' },
  woBuilding: { fontSize: 11, marginTop: 1 },
  woDetails: { gap: 4, marginBottom: Spacing.sm },
  woDetailRow: { flexDirection: 'row', gap: 8 },
  woDetailLabel: { fontSize: 11, fontWeight: '500', width: 70 },
  woDetailValue: { fontSize: 11, flex: 1 },
  woPriorityBadge: { alignSelf: 'flex-start' },
  woPriorityText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  renHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  renName: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 },
  renBuilding: { fontSize: 11, marginBottom: Spacing.sm },
  renProgressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  renBarBg: { flex: 1, height: 6, borderRadius: 3 },
  renBarFill: { height: 6, borderRadius: 3 },
  renPercent: { fontSize: 12, fontWeight: '700', minWidth: 36, textAlign: 'right' },
  renDetails: { gap: 4 },
  renDetailRow: { flexDirection: 'row', gap: 8 },
  renDetailLabel: { fontSize: 11, fontWeight: '500', width: 70 },
  renDetailValue: { fontSize: 11, flex: 1 },
  safetyTrend: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm, justifyContent: 'center' },
  safetyTrendText: { fontSize: 11, fontWeight: '600' },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  contactIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  contactContent: { flex: 1 },
  contactName: { fontSize: 13, fontWeight: '600' },
  contactPhone: { fontSize: 12 },
  contactAvail: { fontSize: 10 },
  drillRow: { flexDirection: 'row', paddingVertical: 10, gap: Spacing.sm },
  drillDateBox: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: BorderRadius.sm, alignItems: 'center', minWidth: 60 },
  drillDate: { fontSize: 12, fontWeight: '700' },
  drillTime: { fontSize: 10, marginTop: 1 },
  drillContent: { flex: 1 },
  drillType: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  drillLocation: { fontSize: 11, marginBottom: 4 },
  mandatoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm },
  mandatoryText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  incHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  incSeverityDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  incHeaderText: { flex: 1 },
  incType: { fontSize: 14, fontWeight: '600' },
  incDate: { fontSize: 11, marginTop: 1 },
  incDescription: { fontSize: 12, lineHeight: 17, marginTop: Spacing.sm, color: '#999' },
  cleryRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  cleryContent: { flex: 1 },
  cleryTitle: { fontSize: 14, fontWeight: '600' },
  cleryMeta: { fontSize: 11, marginTop: 1 },
  cleryStatRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  cleryStatLabel: { fontSize: 12 },
  cleryStatValue: { fontSize: 12, fontWeight: '500' },
  engRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  engIconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  engContent: { flex: 1 },
  engLabel: { fontSize: 13, fontWeight: '600' },
  engValue: { fontSize: 12, marginTop: 1 },
  engTrend: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  engTrendText: { fontSize: 11, fontWeight: '600' },
  orgRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  orgIconWrap: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  orgContent: { flex: 1 },
  orgName: { fontSize: 14, fontWeight: '600' },
  orgMeta: { fontSize: 11, marginTop: 1 },
  orgMeeting: { fontSize: 10, marginTop: 2 },
  eventRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  eventDateBox: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: BorderRadius.sm, alignItems: 'center', minWidth: 60 },
  eventDate: { fontSize: 12, fontWeight: '700' },
  eventTime: { fontSize: 10, marginTop: 1 },
  eventContent: { flex: 1 },
  eventTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  eventOrg: { fontSize: 11, marginBottom: 1 },
  eventLocation: { fontSize: 11 },
  freeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  freeText: { fontSize: 9, fontWeight: '700' },
  imRow: { paddingVertical: 10 },
  imContent: { flex: 1 },
  imNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  imName: { fontSize: 14, fontWeight: '600', flex: 1 },
  imMeta: { fontSize: 11 },
  greekRow: { flexDirection: 'row', paddingVertical: 10, gap: Spacing.sm },
  greekLetters: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  greekLettersText: { fontSize: 14, fontWeight: '700' },
  greekContent: { flex: 1 },
  greekName: { fontSize: 14, fontWeight: '600' },
  greekMeta: { fontSize: 11, marginTop: 1 },
  greekStats: { fontSize: 10, marginTop: 2 },
});
