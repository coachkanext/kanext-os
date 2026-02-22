/**
 * Mock Education Data
 * KaNeXT Sports (KaNeXT) information for Education mode.
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

export const KaNeXT_ORGANIZATION: EducationOrganization = {
  id: 'fmu-001',
  name: 'KaNeXT Sports',
  mode: 'education',
  type: 'Private HBCU',
  location: 'Nashville, TN',
  description:
    'KaNeXT Sports is a private university located in Nashville, Tennessee. Founded in 2020, KaNeXT offers undergraduate and graduate programs rooted in academic excellence, leadership development, and community service.',
  institutionType: 'HBCU',
  programFormats: ['On-Campus', 'Online', 'Hybrid'],
  accreditation: 'SACSCOC (Southern Association of Colleges and Schools Commission on Colleges)',
  founded: 1879,
};

/** @deprecated Use KaNeXT_ORGANIZATION instead */
export const KANEXT_UNIVERSITY_ORGANIZATION = KaNeXT_ORGANIZATION;

// =============================================================================
// ACADEMIC TERMS
// =============================================================================

export const ACADEMIC_TERMS: AcademicTerm[] = [
  // 2023-2024 Academic Year (Archived)
  {
    id: 'term-fall-2023',
    name: 'Fall 2023',
    type: 'fall',
    academicYear: '2023-2024',
    startDate: new Date('2023-08-28'),
    endDate: new Date('2023-12-15'),
    status: 'completed',
  },
  {
    id: 'term-spring-2024',
    name: 'Spring 2024',
    type: 'spring',
    academicYear: '2023-2024',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-05-10'),
    status: 'completed',
  },
  {
    id: 'term-summer-2024',
    name: 'Summer 2024',
    type: 'summer',
    academicYear: '2023-2024',
    startDate: new Date('2024-05-27'),
    endDate: new Date('2024-08-16'),
    status: 'completed',
  },
  // 2024-2025 Academic Year (Archived)
  {
    id: 'term-fall-2024',
    name: 'Fall 2024',
    type: 'fall',
    academicYear: '2024-2025',
    startDate: new Date('2024-08-26'),
    endDate: new Date('2024-12-13'),
    status: 'completed',
  },
  {
    id: 'term-spring-2025',
    name: 'Spring 2025',
    type: 'spring',
    academicYear: '2024-2025',
    startDate: new Date('2025-01-13'),
    endDate: new Date('2025-05-09'),
    status: 'completed',
  },
  {
    id: 'term-summer-2025',
    name: 'Summer 2025',
    type: 'summer',
    academicYear: '2024-2025',
    startDate: new Date('2025-05-26'),
    endDate: new Date('2025-08-15'),
    status: 'completed',
  },
  // 2025-2026 Academic Year (Current)
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
  // 2026-2027 Academic Year (Upcoming)
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
    description: 'Developing the next generation of ethical business leaders and entrepreneurs.',
    programCount: 6,
  },
  {
    id: 'dept-education',
    name: 'School of Education',
    shortName: 'Education',
    description: 'Preparing transformative educators for diverse communities.',
    programCount: 4,
  },
  {
    id: 'dept-arts',
    name: 'School of Arts & Sciences',
    shortName: 'Arts & Sciences',
    description: 'Liberal arts foundation with emphasis on critical thinking and innovation.',
    programCount: 8,
  },
  {
    id: 'dept-aviation',
    name: 'School of Aviation',
    shortName: 'Aviation',
    description: 'One of the few HBCU aviation programs in the nation.',
    programCount: 3,
  },
  {
    id: 'dept-social-sciences',
    name: 'Department of Social Sciences',
    shortName: 'Social Sciences',
    description: 'Psychology, criminal justice, and social work programs.',
    programCount: 5,
  },
  {
    id: 'dept-stem',
    name: 'Department of STEM',
    shortName: 'STEM',
    description: 'Biology, mathematics, computer science, and technology programs.',
    programCount: 4,
  },
];

// =============================================================================
// LEADERSHIP / FACULTY
// =============================================================================

export const FACULTY_LEADERSHIP: FacultyMember[] = [
  {
    id: 'faculty-president',
    name: 'Dr. Jaffus Hardrick',
    title: 'President',
    role: 'president',
    bio: 'Dr. Hardrick serves as President of KaNeXT Sports, driving the institution\'s mission of academic excellence and community impact.',
  },
  {
    id: 'faculty-provost',
    name: 'Dr. Angela Nixon',
    title: 'Provost & VP of Academic Affairs',
    role: 'provost',
    bio: 'Dr. Nixon oversees all academic programs, faculty development, and institutional effectiveness at KaNeXT.',
  },
  {
    id: 'faculty-dean-business',
    name: 'Dr. Alex Morgan',
    title: 'Dean, School of Business',
    role: 'dean',
    departmentId: 'dept-business',
    bio: 'Dr. Thompson leads the School of Business with a focus on entrepreneurship and innovation.',
  },
  {
    id: 'faculty-dean-education',
    name: 'Dr. Patricia Williams',
    title: 'Dean, School of Education',
    role: 'dean',
    departmentId: 'dept-education',
    bio: 'Dr. Williams brings extensive KaNeXT2 and higher education leadership experience.',
  },
  {
    id: 'faculty-dean-aviation',
    name: 'Prof. David Carter',
    title: 'Director, School of Aviation',
    role: 'dean',
    departmentId: 'dept-aviation',
    bio: 'Prof. Carter leads one of the nation\'s premier HBCU aviation programs.',
  },
  {
    id: 'faculty-chair-arts',
    name: 'Dr. Keisha Robinson',
    title: 'Chair, School of Arts & Sciences',
    role: 'chair',
    departmentId: 'dept-arts',
  },
  {
    id: 'faculty-chair-social',
    name: 'Dr. James Mitchell',
    title: 'Chair, Department of Social Sciences',
    role: 'chair',
    departmentId: 'dept-social-sciences',
  },
  {
    id: 'faculty-chair-stem',
    name: 'Dr. Sandra Lee',
    title: 'Chair, Department of STEM',
    role: 'chair',
    departmentId: 'dept-stem',
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
    organizationId: 'fmu-001',
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
    organizationId: 'fmu-001',
    mode: 'education',
    visibility: ['faculty', 'student', 'staff'],
  },
  {
    id: 'edu-act-3',
    type: 'leadership_updated',
    title: 'Faculty Update',
    description: 'Dr. Andrew Palmer joins as Dean of Education',
    timestamp: new Date('2026-01-15T10:00:00'),
    sourceType: 'organization',
    sourceId: 'faculty-dean-education',
    route: '/organization/leadership',
    organizationId: 'fmu-001',
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
    organizationId: 'fmu-001',
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

// =============================================================================
// ACADEMIC YEAR ARCHIVE
// =============================================================================

export interface AcademicYearSummary {
  year: string; // e.g., "2024-2025"
  terms: AcademicTerm[];
  enrollment: number;
  graduationRate: number;
  graduates: number;
  highlights: string[];
}

export const ACADEMIC_YEAR_ARCHIVE: AcademicYearSummary[] = [
  {
    year: '2023-2024',
    terms: ACADEMIC_TERMS.filter((t) => t.academicYear === '2023-2024'),
    enrollment: 856,
    graduationRate: 52,
    graduates: 178,
    highlights: [
      'Launched new Aviation Science minor',
      'Achieved SACSCOC reaccreditation',
      'Student center renovation completed',
    ],
  },
  {
    year: '2024-2025',
    terms: ACADEMIC_TERMS.filter((t) => t.academicYear === '2024-2025'),
    enrollment: 872,
    graduationRate: 53,
    graduates: 184,
    highlights: [
      'Record enrollment growth of 1.9%',
      'New online learning platform launched',
      'Partnership with Miami-Dade County schools expanded',
    ],
  },
];

export function getAcademicYears(): string[] {
  const years = new Set(ACADEMIC_TERMS.map((t) => t.academicYear));
  return Array.from(years).sort().reverse();
}

export function getTermsForYear(year: string): AcademicTerm[] {
  return ACADEMIC_TERMS.filter((t) => t.academicYear === year);
}

export function getArchivedYears(): AcademicYearSummary[] {
  return ACADEMIC_YEAR_ARCHIVE.sort((a, b) => b.year.localeCompare(a.year));
}

export function getAcademicYearSummary(year: string): AcademicYearSummary | undefined {
  return ACADEMIC_YEAR_ARCHIVE.find((a) => a.year === year);
}

export function getFacultyById(id: string): FacultyMember | undefined {
  return FACULTY_LEADERSHIP.find((f) => f.id === id);
}
