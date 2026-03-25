/**
 * Campus Hub mock data — buildings, clubs, housing, dining, resources.
 * Used by hub/campus.tsx (Education mode, Campus experience tile).
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type BuildingType = 'academic' | 'residential' | 'athletic' | 'dining' | 'administrative' | 'services';

export interface Building {
  id: string;
  name: string;
  type: BuildingType;
  x: number;
  y: number;
  colorHex: string;
  hours: string;
  departments: string[];
  description: string;
  floors: number;
  accessibility: string[];
  photoHue: number;
}

export type OrgType = 'academic' | 'social' | 'athletic' | 'cultural' | 'service';

export interface Club {
  id: string;
  name: string;
  type: OrgType;
  memberCount: number;
  meetingSchedule: string;
  description: string;
  president: string;
  advisor: string;
  hue: number;
  joined: boolean;
}

export interface HousingBuilding {
  id: string;
  name: string;
  type: 'freshman' | 'upperclassman' | 'apartment';
  capacity: number;
  occupancy: number;
  amenities: string[];
}

export interface MenuItem {
  name: string;
  dietaryTags: string[];
}

export interface DiningHall {
  id: string;
  name: string;
  location: string;
  hours: {
    weekday: string;
    weekend: string;
  };
  menuByMeal: {
    breakfast: MenuItem[];
    lunch: MenuItem[];
    dinner: MenuItem[];
  };
  isOpen: boolean;
}

export type ResourceCategory = 'Academic' | 'Health' | 'Career' | 'Technology' | 'Services' | 'Financial';

export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  location: string;
  hours: string;
  phone: string;
  website: string;
  isOpen: boolean;
  quickActions: ('call' | 'directions' | 'website')[];
}

export type AlertType = 'construction' | 'hours' | 'emergency' | 'event';

export interface CampusAlert {
  id: string;
  type: AlertType;
  title: string;
  body: string;
  buildingId: string;
  color: string;
}

export type MaintenanceCategory = string;

// ── Building Colors ───────────────────────────────────────────────────────────

export const BUILDING_COLORS: Record<BuildingType, string> = {
  academic:       '#4A7C59',
  residential:    '#4A6FA5',
  athletic:       '#A04040',
  dining:         '#C4872A',
  administrative: '#6B6B8A',
  services:       '#2A8A8A',
};

// ── Campus Buildings ──────────────────────────────────────────────────────────

export const CAMPUS_BUILDINGS: Building[] = [
  {
    id: 'morrison',
    name: 'Morrison Hall',
    type: 'residential',
    x: 120, y: 80,
    colorHex: BUILDING_COLORS.residential,
    hours: '24/7',
    departments: ['Residential Life', 'Housing Office'],
    description: 'Freshman residence hall with community lounges and study spaces on every floor.',
    floors: 5,
    accessibility: ['Wheelchair Ramp', 'Elevator', 'Accessible Restroom'],
    photoHue: 210,
  },
  {
    id: 'williams-science',
    name: 'Williams Science',
    type: 'academic',
    x: 400, y: 120,
    colorHex: BUILDING_COLORS.academic,
    hours: 'Mon–Fri 7 AM–10 PM, Sat–Sun 9 AM–6 PM',
    departments: ['Biology', 'Chemistry', 'Physics', 'Environmental Science'],
    description: 'State-of-the-art science complex with research labs, lecture halls, and a rooftop observatory.',
    floors: 6,
    accessibility: ['Wheelchair Ramp', 'Elevator', 'Accessible Restroom'],
    photoHue: 140,
  },
  {
    id: 'king-library',
    name: 'King Library',
    type: 'academic',
    x: 260, y: 280,
    colorHex: BUILDING_COLORS.academic,
    hours: 'Mon–Thu 8 AM–11 PM, Fri 8 AM–8 PM, Sat–Sun 10 AM–8 PM',
    departments: ['Library Services', 'Writing Center', 'Tutoring Center'],
    description: 'The heart of campus academic life — 200,000 volumes, study pods, media lab, and 24-hour reading room.',
    floors: 4,
    accessibility: ['Wheelchair Ramp', 'Elevator', 'Accessible Restroom'],
    photoHue: 30,
  },
  {
    id: 'lincoln-arena',
    name: 'Lincoln Arena',
    type: 'athletic',
    x: 600, y: 400,
    colorHex: BUILDING_COLORS.athletic,
    hours: 'Mon–Fri 6 AM–11 PM, Sat–Sun 8 AM–9 PM',
    departments: ['Athletics', 'Recreation', 'Fitness Center'],
    description: 'Multi-sport arena with 5,000-seat gymnasium, Olympic pool, weight room, and indoor track.',
    floors: 3,
    accessibility: ['Wheelchair Ramp', 'Elevator', 'Accessible Restroom'],
    photoHue: 0,
  },
  {
    id: 'student-center',
    name: 'Student Center',
    type: 'administrative',
    x: 320, y: 400,
    colorHex: BUILDING_COLORS.administrative,
    hours: 'Mon–Fri 7 AM–11 PM, Sat–Sun 9 AM–10 PM',
    departments: ['Student Affairs', 'Student Government', 'Clubs & Organizations', 'Event Services'],
    description: 'Hub of student life featuring meeting rooms, event spaces, game room, and the student org offices.',
    floors: 3,
    accessibility: ['Wheelchair Ramp', 'Elevator', 'Accessible Restroom'],
    photoHue: 270,
  },
  {
    id: 'administration',
    name: 'Administration',
    type: 'administrative',
    x: 120, y: 400,
    colorHex: BUILDING_COLORS.administrative,
    hours: 'Mon–Fri 8 AM–5 PM',
    departments: ['Registrar', 'Financial Aid', 'Bursar', 'Admissions', "President's Office"],
    description: 'Central administrative hub for enrollment, financial aid, and university leadership.',
    floors: 4,
    accessibility: ['Wheelchair Ramp', 'Elevator', 'Accessible Restroom'],
    photoHue: 250,
  },
  {
    id: 'main-dining',
    name: 'Main Dining Hall',
    type: 'dining',
    x: 500, y: 260,
    colorHex: BUILDING_COLORS.dining,
    hours: 'Daily 7 AM–9 PM',
    departments: ['Dining Services', 'Catering'],
    description: 'All-you-care-to-eat dining hall featuring rotating menus, international cuisine station, and allergen-free zone.',
    floors: 2,
    accessibility: ['Wheelchair Ramp', 'Accessible Restroom'],
    photoHue: 35,
  },
  {
    id: 'health-center',
    name: 'Health Center',
    type: 'services',
    x: 650, y: 160,
    colorHex: BUILDING_COLORS.services,
    hours: 'Mon–Fri 8 AM–6 PM, Sat 9 AM–1 PM',
    departments: ['Student Health', 'Counseling Services', 'Pharmacy'],
    description: 'Comprehensive student health services including primary care, mental health counseling, and pharmacy.',
    floors: 2,
    accessibility: ['Wheelchair Ramp', 'Elevator', 'Accessible Restroom'],
    photoHue: 180,
  },
];

// ── Campus Alerts ─────────────────────────────────────────────────────────────

export const CAMPUS_ALERTS: CampusAlert[] = [
  {
    id: 'alert1',
    type: 'construction',
    title: 'Construction — Science Center',
    body: 'North entrance closed through April 15. Use east entrance off Elm Ave.',
    buildingId: 'williams-science',
    color: '#C4872A',
  },
  {
    id: 'alert2',
    type: 'hours',
    title: 'Library Extended Hours',
    body: 'Finals week: King Library open until 2 AM, April 28 – May 3.',
    buildingId: 'king-library',
    color: '#5A8A6E',
  },
];

// ── Clubs ─────────────────────────────────────────────────────────────────────

export const CLUBS: Club[] = [
  {
    id: 'club-sga',
    name: 'Student Government Association',
    type: 'service',
    memberCount: 42,
    meetingSchedule: 'Tuesdays 6 PM · Student Center Rm 201',
    description: 'The official student governance body representing all students. Advocates for student interests, manages a $200K activity budget, and organizes campus-wide events.',
    president: 'Jordan Hayes',
    advisor: 'Dr. Patricia Moore',
    hue: 220,
    joined: false,
  },
  {
    id: 'club-bsu',
    name: 'Black Student Union',
    type: 'cultural',
    memberCount: 118,
    meetingSchedule: 'Wednesdays 7 PM · Student Center Rm 105',
    description: 'Creating community, celebrating culture, and advocating for Black students on campus through events, mentorship, and community service.',
    president: 'Amara Okafor',
    advisor: 'Prof. Denise Williams',
    hue: 28,
    joined: true,
  },
  {
    id: 'club-entre',
    name: 'Entrepreneurship Club',
    type: 'academic',
    memberCount: 67,
    meetingSchedule: 'Mondays 5 PM · Administration Bldg Rm 310',
    description: 'Connects student entrepreneurs with mentors, resources, and funding. Hosts pitch competitions, workshops, and startup incubator programs.',
    president: 'Marcus Webb',
    advisor: 'Prof. Sarah Chen',
    hue: 160,
    joined: false,
  },
  {
    id: 'club-debate',
    name: 'Debate Team',
    type: 'academic',
    memberCount: 28,
    meetingSchedule: 'Mon & Thu 4 PM · King Library Rm 3B',
    description: 'Competitive debate team competing in regional and national tournaments. All skill levels welcome — coaching provided.',
    president: 'Priya Patel',
    advisor: 'Dr. James Thornton',
    hue: 340,
    joined: false,
  },
  {
    id: 'club-choir',
    name: 'Lincoln Choir',
    type: 'cultural',
    memberCount: 55,
    meetingSchedule: 'Tue & Thu 7 PM · Student Center Rm 308',
    description: 'Award-winning choir performing gospel, classical, and contemporary music. Performs at campus events and regional festivals.',
    president: 'Isaiah Brooks',
    advisor: 'Dr. Angela Foster',
    hue: 280,
    joined: false,
  },
  {
    id: 'club-intramural',
    name: 'Intramural Sports',
    type: 'athletic',
    memberCount: 240,
    meetingSchedule: 'Various times · Lincoln Arena',
    description: 'Recreational sports leagues for all skill levels including basketball, flag football, soccer, volleyball, and tennis. Spring and fall seasons.',
    president: 'Devon Carter',
    advisor: 'Coach T. Robinson',
    hue: 5,
    joined: true,
  },
];

// ── Housing ───────────────────────────────────────────────────────────────────

export const HOUSING_BUILDINGS: HousingBuilding[] = [
  {
    id: 'morrison-hall',
    name: 'Morrison Hall',
    type: 'freshman',
    capacity: 240,
    occupancy: 226,
    amenities: ['Study Lounge', 'Laundry', 'Bike Storage', 'Mail Room', 'Common Kitchen'],
  },
  {
    id: 'lincoln-suites',
    name: 'Lincoln Suites',
    type: 'upperclassman',
    capacity: 180,
    occupancy: 158,
    amenities: ['Suite Bathrooms', 'Fitness Room', 'Rooftop Lounge', 'Laundry', 'Parking'],
  },
  {
    id: 'westside-apts',
    name: 'Westside Apartments',
    type: 'apartment',
    capacity: 96,
    occupancy: 87,
    amenities: ['Full Kitchen', 'In-Unit Laundry', 'Parking', 'Pool', 'Pet-Friendly'],
  },
];

export const MY_HOUSING = {
  building: 'Morrison Hall',
  room: '214',
  roommate: 'Marcus Johnson',
  ra: 'Aisha Williams',
  floor: 2,
};

// ── Dining ────────────────────────────────────────────────────────────────────

export const DINING_HALLS: DiningHall[] = [
  {
    id: 'main-dining',
    name: 'Main Dining Hall',
    location: 'Central Campus',
    hours: { weekday: '7 AM – 9 PM', weekend: '9 AM – 8 PM' },
    isOpen: true,
    menuByMeal: {
      breakfast: [
        { name: 'Scrambled Eggs', dietaryTags: ['Vegetarian', 'Gluten-Free'] },
        { name: 'Oatmeal Bar', dietaryTags: ['Vegan', 'Gluten-Free'] },
        { name: 'French Toast', dietaryTags: ['Vegetarian'] },
        { name: 'Breakfast Sausage', dietaryTags: ['Halal'] },
        { name: 'Seasonal Fruit Bowl', dietaryTags: ['Vegan', 'Gluten-Free'] },
      ],
      lunch: [
        { name: 'Grilled Chicken Sandwich', dietaryTags: ['Halal'] },
        { name: 'Black Bean Burger', dietaryTags: ['Vegan'] },
        { name: 'Caesar Salad', dietaryTags: ['Vegetarian'] },
        { name: 'Tomato Soup', dietaryTags: ['Vegan', 'Gluten-Free'] },
        { name: 'Mac & Cheese', dietaryTags: ['Vegetarian'] },
      ],
      dinner: [
        { name: 'Herb Roasted Chicken', dietaryTags: ['Halal', 'Gluten-Free'] },
        { name: 'Pasta Primavera', dietaryTags: ['Vegan'] },
        { name: 'Salmon Fillet', dietaryTags: ['Gluten-Free'] },
        { name: 'Vegetable Stir Fry', dietaryTags: ['Vegan', 'Gluten-Free'] },
        { name: 'Dinner Rolls', dietaryTags: ['Vegetarian'] },
      ],
    },
  },
  {
    id: 'science-cafe',
    name: 'Science Café',
    location: 'Williams Science Building',
    hours: { weekday: '7:30 AM – 3 PM', weekend: 'Closed' },
    isOpen: true,
    menuByMeal: {
      breakfast: [
        { name: 'Bagel & Cream Cheese', dietaryTags: ['Vegetarian'] },
        { name: 'Yogurt Parfait', dietaryTags: ['Vegetarian', 'Gluten-Free'] },
        { name: 'Avocado Toast', dietaryTags: ['Vegan'] },
      ],
      lunch: [
        { name: 'Turkey Club Wrap', dietaryTags: ['Halal'] },
        { name: 'Caprese Panini', dietaryTags: ['Vegetarian'] },
        { name: 'Garden Salad', dietaryTags: ['Vegan', 'Gluten-Free'] },
        { name: 'Cup of Chili', dietaryTags: ['Gluten-Free'] },
      ],
      dinner: [
        { name: 'Grab & Go Sandwiches', dietaryTags: [] },
        { name: 'Packaged Salads', dietaryTags: ['Vegetarian'] },
      ],
    },
  },
];

// ── Resources ─────────────────────────────────────────────────────────────────

export const RESOURCES: Resource[] = [
  {
    id: 'tutoring',
    name: 'Tutoring Center',
    category: 'Academic',
    location: 'King Library, Rm 101',
    hours: 'Mon–Fri 9 AM–7 PM',
    phone: '(555) 421-1100',
    website: 'tutoring.lincoln.edu',
    isOpen: true,
    quickActions: ['call', 'directions', 'website'],
  },
  {
    id: 'writing-center',
    name: 'Writing Center',
    category: 'Academic',
    location: 'King Library, Rm 115',
    hours: 'Mon–Thu 9 AM–8 PM, Fri 9 AM–5 PM',
    phone: '(555) 421-1120',
    website: 'writing.lincoln.edu',
    isOpen: true,
    quickActions: ['call', 'directions', 'website'],
  },
  {
    id: 'advising',
    name: 'Academic Advising',
    category: 'Academic',
    location: 'Administration Bldg, Rm 220',
    hours: 'Mon–Fri 8 AM–5 PM',
    phone: '(555) 421-2000',
    website: 'advising.lincoln.edu',
    isOpen: true,
    quickActions: ['call', 'directions', 'website'],
  },
  {
    id: 'health',
    name: 'Student Health Center',
    category: 'Health',
    location: 'Health Center Bldg',
    hours: 'Mon–Fri 8 AM–6 PM, Sat 9 AM–1 PM',
    phone: '(555) 421-3000',
    website: 'health.lincoln.edu',
    isOpen: true,
    quickActions: ['call', 'directions', 'website'],
  },
  {
    id: 'counseling',
    name: 'Counseling Services',
    category: 'Health',
    location: 'Health Center, 2nd Floor',
    hours: 'Mon–Fri 9 AM–5 PM',
    phone: '(555) 421-3020',
    website: 'counseling.lincoln.edu',
    isOpen: true,
    quickActions: ['call', 'directions', 'website'],
  },
  {
    id: 'career',
    name: 'Career Center',
    category: 'Career',
    location: 'Student Center, Rm 110',
    hours: 'Mon–Fri 8:30 AM–5 PM',
    phone: '(555) 421-4000',
    website: 'careers.lincoln.edu',
    isOpen: true,
    quickActions: ['call', 'directions', 'website'],
  },
  {
    id: 'it-help',
    name: 'IT Help Desk',
    category: 'Technology',
    location: 'King Library, Ground Floor',
    hours: 'Mon–Fri 8 AM–8 PM',
    phone: '(555) 421-5000',
    website: 'it.lincoln.edu',
    isOpen: true,
    quickActions: ['call', 'directions', 'website'],
  },
  {
    id: 'safety',
    name: 'Campus Safety',
    category: 'Services',
    location: 'Administration Bldg, Rm 100',
    hours: '24/7',
    phone: '(555) 421-9111',
    website: 'safety.lincoln.edu',
    isOpen: true,
    quickActions: ['call', 'directions'],
  },
  {
    id: 'financial-aid',
    name: 'Financial Aid Office',
    category: 'Financial',
    location: 'Administration Bldg, Rm 205',
    hours: 'Mon–Fri 8 AM–5 PM',
    phone: '(555) 421-6000',
    website: 'finaid.lincoln.edu',
    isOpen: true,
    quickActions: ['call', 'directions', 'website'],
  },
  {
    id: 'bursar',
    name: "Bursar's Office",
    category: 'Financial',
    location: 'Administration Bldg, Rm 210',
    hours: 'Mon–Fri 8:30 AM–4:30 PM',
    phone: '(555) 421-6100',
    website: 'bursar.lincoln.edu',
    isOpen: true,
    quickActions: ['call', 'directions', 'website'],
  },
];

// ── Campus Events ─────────────────────────────────────────────────────────────

export const CAMPUS_EVENTS = [
  { id: 'ev1', title: 'Spring Fest 2026', date: 'Apr 12, 2:00 PM', organizer: 'Student Government', location: 'Central Quad', type: 'campus' },
  { id: 'ev2', title: 'Research Symposium', date: 'Apr 14, 10:00 AM', organizer: 'Williams Science', location: 'Science Bldg Atrium', type: 'academic' },
  { id: 'ev3', title: 'BSU Culture Night', date: 'Apr 18, 7:00 PM', organizer: 'Black Student Union', location: 'Student Center Ballroom', type: 'cultural' },
  { id: 'ev4', title: 'Startup Pitch Competition', date: 'Apr 22, 5:00 PM', organizer: 'Entrepreneurship Club', location: 'Admin Bldg Rm 310', type: 'academic' },
  { id: 'ev5', title: 'Lincoln Choir Spring Concert', date: 'Apr 25, 7:30 PM', organizer: 'Lincoln Choir', location: 'Student Center Main Stage', type: 'cultural' },
];

// ── Campus News ───────────────────────────────────────────────────────────────

export const CAMPUS_NEWS = [
  { id: 'news1', headline: 'Lincoln Ranked #2 HBCU by US News', date: 'Apr 8', hue: 220 },
  { id: 'news2', headline: 'New STEM Research Lab Opens This Fall', date: 'Apr 5', hue: 140 },
  { id: 'news3', headline: 'Financial Aid Deadline Extended to May 1', date: 'Apr 3', hue: 35 },
  { id: 'news4', headline: "Women's Basketball Team Wins Conference", date: 'Mar 30', hue: 0 },
];

// ── Student Government ────────────────────────────────────────────────────────

export const STUDENT_GOV = [
  { id: 'sg1', name: 'Jordan Hayes',   role: 'President',           initials: 'JH' },
  { id: 'sg2', name: 'Aaliyah Torres', role: 'VP Academic Affairs', initials: 'AT' },
  { id: 'sg3', name: 'Kwame Asante',   role: 'Treasurer',           initials: 'KA' },
  { id: 'sg4', name: 'Simone Park',    role: 'Secretary',           initials: 'SP' },
];

// ── Maintenance ───────────────────────────────────────────────────────────────

export const MAINTENANCE_CATEGORIES: MaintenanceCategory[] = [
  'Plumbing', 'Electrical', 'HVAC', 'Furniture', 'Pest', 'Other',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getBuildingsByType(type: BuildingType): Building[] {
  return CAMPUS_BUILDINGS.filter(b => b.type === type);
}

export function getClubById(id: string): Club | undefined {
  return CLUBS.find(c => c.id === id);
}

export function getResourcesByCategory(category: ResourceCategory): Resource[] {
  return RESOURCES.filter(r => r.category === category);
}
