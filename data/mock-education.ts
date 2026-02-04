/**
 * Mock Education Data
 * San Diego Christian College (SDCC) information for Education mode.
 */

import type {
  EducationOrganization,
  AcademicTerm,
  AcademicCalendarEvent,
  Department,
  FacultyMember,
  InstitutionalMetrics,
  ActivityItem,
} from '@/types';

// =============================================================================
// ORGANIZATION
// =============================================================================

export const SDCC_ORGANIZATION: EducationOrganization = {
  id: 'sdcc-001',
  name: 'San Diego Christian College',
  mode: 'education',
  type: 'Private Christian Liberal Arts College',
  location: 'Santee, CA',
  description:
    'San Diego Christian College is a private Christian liberal arts college located in Santee, California. Founded in 1970, SDCC offers undergraduate and graduate programs grounded in biblical principles, preparing students for lives of purpose, service, and leadership.',
  institutionType: 'Liberal Arts College',
  programFormats: ['On-Campus', 'Online', 'Hybrid'],
  accreditation: 'WSCUC (Western Senior College and University Commission)',
  founded: 1970,
};

// =============================================================================
// ACADEMIC TERMS
// =============================================================================

export const ACADEMIC_TERMS: AcademicTerm[] = [
  {
    id: 'term-fall-2025',
    name: 'Fall 2025',
    type: 'fall',
    academicYear: '2025-2026',
    startDate: new Date('2025-08-25'),
    endDate: new Date('2025-12-12'),
    status: 'completed',
  },
  {
    id: 'term-spring-2026',
    name: 'Spring 2026',
    type: 'spring',
    academicYear: '2025-2026',
    startDate: new Date('2026-01-13'),
    endDate: new Date('2026-05-08'),
    status: 'current',
  },
  {
    id: 'term-summer-2026',
    name: 'Summer 2026',
    type: 'summer',
    academicYear: '2025-2026',
    startDate: new Date('2026-05-26'),
    endDate: new Date('2026-08-14'),
    status: 'upcoming',
  },
  {
    id: 'term-fall-2026',
    name: 'Fall 2026',
    type: 'fall',
    academicYear: '2026-2027',
    startDate: new Date('2026-08-24'),
    endDate: new Date('2026-12-11'),
    status: 'upcoming',
  },
];

// =============================================================================
// ACADEMIC CALENDAR
// =============================================================================

export const ACADEMIC_CALENDAR: AcademicCalendarEvent[] = [
  // Spring 2026
  {
    id: 'cal-spring-start',
    title: 'Spring Semester Begins',
    type: 'semester_start',
    date: new Date('2026-01-13'),
    termId: 'term-spring-2026',
  },
  {
    id: 'cal-mlk-day',
    title: 'Martin Luther King Jr. Day',
    description: 'Campus closed',
    type: 'holiday',
    date: new Date('2026-01-19'),
  },
  {
    id: 'cal-add-drop',
    title: 'Add/Drop Deadline',
    description: 'Last day to add or drop classes without penalty',
    type: 'add_drop',
    date: new Date('2026-01-27'),
    termId: 'term-spring-2026',
  },
  {
    id: 'cal-spring-break',
    title: 'Spring Break',
    description: 'No classes',
    type: 'break',
    date: new Date('2026-03-16'),
    endDate: new Date('2026-03-20'),
    termId: 'term-spring-2026',
  },
  {
    id: 'cal-easter',
    title: 'Easter Break',
    description: 'Campus closed',
    type: 'holiday',
    date: new Date('2026-04-03'),
    endDate: new Date('2026-04-06'),
  },
  {
    id: 'cal-midterms',
    title: 'Midterm Examinations',
    type: 'midterms',
    date: new Date('2026-03-02'),
    endDate: new Date('2026-03-06'),
    termId: 'term-spring-2026',
  },
  {
    id: 'cal-finals',
    title: 'Final Examinations',
    type: 'finals',
    date: new Date('2026-05-04'),
    endDate: new Date('2026-05-08'),
    termId: 'term-spring-2026',
  },
  {
    id: 'cal-commencement',
    title: 'Commencement Ceremony',
    description: 'Class of 2026 graduation',
    type: 'commencement',
    date: new Date('2026-05-15'),
  },
  {
    id: 'cal-summer-reg',
    title: 'Summer Registration Opens',
    type: 'registration',
    date: new Date('2026-03-23'),
  },
  {
    id: 'cal-fall-reg',
    title: 'Fall 2026 Registration Opens',
    type: 'registration',
    date: new Date('2026-04-06'),
  },
];

// =============================================================================
// DEPARTMENTS
// =============================================================================

export const DEPARTMENTS: Department[] = [
  {
    id: 'dept-business',
    name: 'School of Business',
    shortName: 'Business',
    description: 'Preparing ethical business leaders grounded in Christian principles.',
    programCount: 6,
  },
  {
    id: 'dept-education',
    name: 'School of Education',
    shortName: 'Education',
    description: 'Training the next generation of Christian educators.',
    programCount: 4,
  },
  {
    id: 'dept-psychology',
    name: 'Department of Psychology',
    shortName: 'Psychology',
    description: 'Integrating faith and psychological science.',
    programCount: 3,
  },
  {
    id: 'dept-theology',
    name: 'School of Christian Ministry',
    shortName: 'Ministry',
    description: 'Equipping students for ministry and service.',
    programCount: 5,
  },
  {
    id: 'dept-arts',
    name: 'Department of Arts & Humanities',
    shortName: 'Arts',
    description: 'Fostering creativity and critical thinking.',
    programCount: 4,
  },
  {
    id: 'dept-science',
    name: 'Department of Natural Sciences',
    shortName: 'Sciences',
    description: 'Exploring God\'s creation through scientific inquiry.',
    programCount: 3,
  },
];

// =============================================================================
// LEADERSHIP / FACULTY
// =============================================================================

export const FACULTY_LEADERSHIP: FacultyMember[] = [
  {
    id: 'faculty-president',
    name: 'Dr. Elizabeth Hart',
    title: 'President',
    role: 'president',
    bio: 'Dr. Hart has served as President of SDCC since 2019, bringing over 25 years of experience in Christian higher education leadership.',
  },
  {
    id: 'faculty-provost',
    name: 'Dr. Michael Chen',
    title: 'Provost & Chief Academic Officer',
    role: 'provost',
    bio: 'Dr. Chen oversees all academic programs and faculty development at SDCC.',
  },
  {
    id: 'faculty-dean-business',
    name: 'Dr. Sarah Thompson',
    title: 'Dean, School of Business',
    role: 'dean',
    departmentId: 'dept-business',
    bio: 'Dr. Thompson leads the School of Business with a focus on ethical leadership.',
  },
  {
    id: 'faculty-dean-education',
    name: 'Dr. James Wilson',
    title: 'Dean, School of Education',
    role: 'dean',
    departmentId: 'dept-education',
    bio: 'Dr. Wilson brings 20 years of K-12 and higher education experience.',
  },
  {
    id: 'faculty-dean-ministry',
    name: 'Dr. David Martinez',
    title: 'Dean, School of Christian Ministry',
    role: 'dean',
    departmentId: 'dept-theology',
    bio: 'Dr. Martinez is an ordained minister with extensive pastoral experience.',
  },
  {
    id: 'faculty-chair-psych',
    name: 'Dr. Rebecca Johnson',
    title: 'Chair, Department of Psychology',
    role: 'chair',
    departmentId: 'dept-psychology',
  },
  {
    id: 'faculty-chair-arts',
    name: 'Prof. Andrew Kim',
    title: 'Chair, Department of Arts & Humanities',
    role: 'chair',
    departmentId: 'dept-arts',
  },
  {
    id: 'faculty-chair-science',
    name: 'Dr. Patricia Lee',
    title: 'Chair, Department of Natural Sciences',
    role: 'chair',
    departmentId: 'dept-science',
  },
];

// =============================================================================
// INSTITUTIONAL METRICS
// =============================================================================

export const INSTITUTIONAL_METRICS: InstitutionalMetrics = {
  enrollment: {
    total: 892,
    undergraduate: 724,
    graduate: 168,
    yearOverYearChange: 3.2,
  },
  academics: {
    programs: 25,
    facultyCount: 48,
    studentFacultyRatio: '14:1',
  },
  outcomes: {
    graduationRate: 54,
    retentionRate: 68,
    employmentRate: 89,
  },
};

// =============================================================================
// ACTIVITY
// =============================================================================

export const EDUCATION_ACTIVITY: ActivityItem[] = [
  {
    id: 'edu-act-1',
    type: 'calendar_published',
    title: 'Calendar Update',
    description: 'Spring 2026 final exam schedule published',
    timestamp: new Date('2026-02-04T08:00:00'),
    sourceType: 'record',
    sourceId: 'cal-finals',
    route: '/organization/schedule',
    organizationId: 'sdcc-001',
    mode: 'education',
    visibility: ['faculty', 'student', 'staff'],
  },
  {
    id: 'edu-act-2',
    type: 'event_updated',
    title: 'Event Reminder',
    description: 'Add/Drop deadline approaching - Jan 27',
    timestamp: new Date('2026-01-24T12:00:00'),
    sourceType: 'event',
    sourceId: 'cal-add-drop',
    route: '/organization/schedule',
    organizationId: 'sdcc-001',
    mode: 'education',
    visibility: ['faculty', 'student', 'staff'],
  },
  {
    id: 'edu-act-3',
    type: 'leadership_updated',
    title: 'Faculty Update',
    description: 'Dr. James Wilson joins as Dean of Education',
    timestamp: new Date('2026-01-15T10:00:00'),
    sourceType: 'organization',
    sourceId: 'faculty-dean-education',
    route: '/organization/leadership',
    organizationId: 'sdcc-001',
    mode: 'education',
    visibility: ['faculty', 'student', 'staff'],
  },
  {
    id: 'edu-act-4',
    type: 'term_confirmed',
    title: 'Term Complete',
    description: 'Fall 2025 grades finalized',
    timestamp: new Date('2025-12-20T09:00:00'),
    sourceType: 'record',
    sourceId: 'term-fall-2025',
    route: '/organization/results',
    organizationId: 'sdcc-001',
    mode: 'education',
    visibility: ['faculty', 'staff'],
  },
];

// =============================================================================
// HELPERS
// =============================================================================

export function getCurrentTerm(): AcademicTerm | undefined {
  return ACADEMIC_TERMS.find((term) => term.status === 'current');
}

export function getTermById(id: string): AcademicTerm | undefined {
  return ACADEMIC_TERMS.find((term) => term.id === id);
}

export function getUpcomingEvents(limit: number = 5): AcademicCalendarEvent[] {
  const now = new Date();
  return ACADEMIC_CALENDAR
    .filter((event) => event.date >= now)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, limit);
}

export function getEventsForTerm(termId: string): AcademicCalendarEvent[] {
  return ACADEMIC_CALENDAR.filter((event) => event.termId === termId);
}

export function getDepartmentById(id: string): Department | undefined {
  return DEPARTMENTS.find((dept) => dept.id === id);
}

export function getFacultyByDepartment(deptId: string): FacultyMember[] {
  return FACULTY_LEADERSHIP.filter((faculty) => faculty.departmentId === deptId);
}

export function getLeadershipByRole(role: FacultyMember['role']): FacultyMember[] {
  return FACULTY_LEADERSHIP.filter((faculty) => faculty.role === role);
}

export function formatTermDates(term: AcademicTerm): string {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const start = term.startDate.toLocaleDateString('en-US', options);
  const end = term.endDate.toLocaleDateString('en-US', { ...options, year: 'numeric' });
  return `${start} - ${end}`;
}

export function formatCalendarEventDate(event: AcademicCalendarEvent): string {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  if (event.endDate && event.endDate.getTime() !== event.date.getTime()) {
    const start = event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = event.endDate.toLocaleDateString('en-US', options);
    return `${start} - ${end}`;
  }
  return event.date.toLocaleDateString('en-US', options);
}

export function getCalendarEventTypeLabel(type: AcademicCalendarEvent['type']): string {
  const labels: Record<AcademicCalendarEvent['type'], string> = {
    semester_start: 'Semester Start',
    semester_end: 'Semester End',
    add_drop: 'Add/Drop',
    midterms: 'Midterms',
    finals: 'Finals',
    break: 'Break',
    holiday: 'Holiday',
    commencement: 'Commencement',
    registration: 'Registration',
    other: 'Event',
  };
  return labels[type] || type;
}

export function getTermStatusLabel(status: AcademicTerm['status']): string {
  const labels: Record<AcademicTerm['status'], string> = {
    upcoming: 'Upcoming',
    current: 'Current',
    completed: 'Completed',
  };
  return labels[status];
}

export function getFacultyRoleLabel(role: FacultyMember['role']): string {
  const labels: Record<FacultyMember['role'], string> = {
    president: 'President',
    provost: 'Provost',
    dean: 'Dean',
    chair: 'Department Chair',
    professor: 'Professor',
    instructor: 'Instructor',
    staff: 'Staff',
  };
  return labels[role] || role;
}
