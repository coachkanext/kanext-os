/**
 * Mock Education Data
 * Lincoln University Oakland — Education mode.
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
  id: 'lu-oak-001',
  name: 'Lincoln University',
  mode: 'education',
  type: 'Private, not-for-profit',
  location: 'Oakland, CA',
  description:
    'Lincoln University is a private four-year institution located in downtown Oakland, CA, one block from the 12th Street/City Center BART station. Founded in 1919 and chartered under California law in 1926, Lincoln specializes in business administration, diagnostic imaging, and graduate management programs. Accredited by WSCUC since 2020, the university serves a highly international student body from more than 60 countries and offers all programs in-person at its 401 15th Street campus.',
  institutionType: 'Special Focus: Business & Management',
  programFormats: ['On-Campus'],
  accreditation: 'WASC Senior College and University Commission (WSCUC)',
  founded: 1919,
};

/** @deprecated Use KaNeXT_ORGANIZATION instead */
export const KANEXT_UNIVERSITY_ORGANIZATION = KaNeXT_ORGANIZATION;

// =============================================================================
// ACADEMIC TERMS
// =============================================================================

export const ACADEMIC_TERMS: AcademicTerm[] = [
  {
    id: 'term-fall-2023',
    name: 'Fall 2023',
    type: 'fall',
    academicYear: '2023-2024',
    startDate: new Date('2023-08-21'),
    endDate: new Date('2023-12-15'),
    status: 'completed',
  },
  {
    id: 'term-spring-2024',
    name: 'Spring 2024',
    type: 'spring',
    academicYear: '2023-2024',
    startDate: new Date('2024-01-22'),
    endDate: new Date('2024-05-17'),
    status: 'completed',
  },
  {
    id: 'term-summer-2024',
    name: 'Summer 2024',
    type: 'summer',
    academicYear: '2023-2024',
    startDate: new Date('2024-06-03'),
    endDate: new Date('2024-07-26'),
    status: 'completed',
  },
  {
    id: 'term-fall-2024',
    name: 'Fall 2024',
    type: 'fall',
    academicYear: '2024-2025',
    startDate: new Date('2024-08-19'),
    endDate: new Date('2024-12-13'),
    status: 'completed',
  },
  {
    id: 'term-spring-2025',
    name: 'Spring 2025',
    type: 'spring',
    academicYear: '2024-2025',
    startDate: new Date('2025-01-20'),
    endDate: new Date('2025-05-16'),
    status: 'completed',
  },
  {
    id: 'term-summer-2025',
    name: 'Summer 2025',
    type: 'summer',
    academicYear: '2024-2025',
    startDate: new Date('2025-06-02'),
    endDate: new Date('2025-07-25'),
    status: 'completed',
  },
  // 2025-2026 Academic Year (Current)
  {
    id: 'term-fall-2025',
    name: 'Fall 2025',
    type: 'fall',
    academicYear: '2025-2026',
    startDate: new Date('2025-08-20'),
    endDate: new Date('2025-12-13'),
    status: 'completed',
  },
  {
    id: 'term-spring-2026',
    name: 'Spring 2026',
    type: 'spring',
    academicYear: '2025-2026',
    startDate: new Date('2026-01-21'),
    endDate: new Date('2026-05-16'),
    status: 'current',
  },
  {
    id: 'term-summer-2026',
    name: 'Summer 2026',
    type: 'summer',
    academicYear: '2025-2026',
    startDate: new Date('2026-06-04'),
    endDate: new Date('2026-07-25'),
    status: 'upcoming',
  },
  // 2026-2027 Academic Year (Upcoming)
  {
    id: 'term-fall-2026',
    name: 'Fall 2026',
    type: 'fall',
    academicYear: '2026-2027',
    startDate: new Date('2026-08-19'),
    endDate: new Date('2026-12-12'),
    status: 'upcoming',
  },
];

// =============================================================================
// ACADEMIC CALENDAR — from catalog.lincolnuca.edu/academic-calendar/
// =============================================================================

export const ACADEMIC_CALENDAR: AcademicCalendarEvent[] = [
  // Spring 2026
  {
    id: 'cal-spring-start',
    title: 'Spring Semester Begins — Placement Tests',
    type: 'semester_start',
    date: new Date('2026-01-21'),
    termId: 'term-spring-2026',
  },
  {
    id: 'cal-spring-advising',
    title: 'Academic Advising & Registration',
    description: 'Spring 2026 advising and registration',
    type: 'registration',
    date: new Date('2026-01-22'),
    endDate: new Date('2026-01-23'),
    termId: 'term-spring-2026',
  },
  {
    id: 'cal-classes-begin',
    title: 'Classes Begin',
    type: 'semester_start',
    date: new Date('2026-01-26'),
    termId: 'term-spring-2026',
  },
  {
    id: 'cal-add-drop',
    title: 'Add/Drop Deadline',
    description: 'Last day to add or drop classes without academic penalty',
    type: 'add_drop',
    date: new Date('2026-02-09'),
    termId: 'term-spring-2026',
  },
  {
    id: 'cal-presidents-day',
    title: "Presidents' Day",
    description: 'Campus closed',
    type: 'holiday',
    date: new Date('2026-02-16'),
  },
  {
    id: 'cal-spring-recess',
    title: 'Spring Recess',
    description: 'No classes',
    type: 'break',
    date: new Date('2026-03-17'),
    endDate: new Date('2026-03-21'),
    termId: 'term-spring-2026',
  },
  {
    id: 'cal-classes-resume',
    title: 'Classes Resume',
    type: 'semester_start',
    date: new Date('2026-03-23'),
    termId: 'term-spring-2026',
  },
  {
    id: 'cal-fall-reg',
    title: 'Fall 2026 Registration Opens',
    type: 'registration',
    date: new Date('2026-03-23'),
  },
  {
    id: 'cal-finals',
    title: 'Final Examinations',
    type: 'finals',
    date: new Date('2026-05-11'),
    endDate: new Date('2026-05-16'),
    termId: 'term-spring-2026',
  },
  {
    id: 'cal-spring-end',
    title: 'Semester Ends',
    type: 'semester_end',
    date: new Date('2026-05-16'),
    termId: 'term-spring-2026',
  },
  {
    id: 'cal-commencement',
    title: 'Commencement Ceremony',
    description: 'Class of 2026 graduation',
    type: 'commencement',
    date: new Date('2026-05-30'),
  },
  // Summer 2026
  {
    id: 'cal-summer-start',
    title: 'Summer Session Begins — Placement Tests',
    type: 'semester_start',
    date: new Date('2026-06-04'),
    termId: 'term-summer-2026',
  },
  {
    id: 'cal-summer-advising',
    title: 'Summer Advising & Registration',
    type: 'registration',
    date: new Date('2026-06-04'),
    endDate: new Date('2026-06-05'),
    termId: 'term-summer-2026',
  },
  {
    id: 'cal-summer-classes',
    title: 'Summer Classes Begin',
    type: 'semester_start',
    date: new Date('2026-06-08'),
    termId: 'term-summer-2026',
  },
  {
    id: 'cal-summer-add-drop',
    title: 'Summer Add/Drop Deadline',
    type: 'add_drop',
    date: new Date('2026-06-15'),
    termId: 'term-summer-2026',
  },
  {
    id: 'cal-independence-day',
    title: 'Independence Day',
    description: 'Campus closed',
    type: 'holiday',
    date: new Date('2026-07-03'),
  },
  {
    id: 'cal-summer-end',
    title: 'Summer Session Ends',
    type: 'semester_end',
    date: new Date('2026-07-25'),
    termId: 'term-summer-2026',
  },
  // Key institutional event
  {
    id: 'cal-wscuc-review',
    title: 'WSCUC Reaccreditation Review',
    description: 'WASC Senior College and University Commission institutional review — accreditation expires/renews June 26, 2026',
    type: 'other',
    date: new Date('2026-06-26'),
  },
];

// =============================================================================
// DEPARTMENTS
// =============================================================================

export const DEPARTMENTS: Department[] = [
  {
    id: 'dept-business',
    name: 'Business Programs',
    shortName: 'Business',
    description: 'Undergraduate and graduate business education. BA in Business Administration, MBA, MS in International Business & Finance Management, MS in Finance, and DBA. Ranked 4th among Bay Area MBA programs (SF Business Times).',
    programCount: 4,
  },
  {
    id: 'dept-di',
    name: 'Diagnostic Imaging',
    shortName: 'Diagnostic Imaging',
    description: 'BS in Diagnostic Medical Sonography — one of the few four-year DI programs in California. Fully equipped imaging laboratory at 420 15th Street.',
    programCount: 1,
  },
  {
    id: 'dept-esl',
    name: 'English Language Program',
    shortName: 'ESL',
    description: 'Intensive English language instruction for international students preparing for degree-level academic study.',
    programCount: 1,
  },
];

// =============================================================================
// LEADERSHIP / FACULTY — from acqa.lincolnuca.edu/staff/
// =============================================================================

export const FACULTY_LEADERSHIP: FacultyMember[] = [
  {
    id: 'faculty-president',
    name: 'Dr. Mikhail Brodsky',
    title: 'President',
    role: 'president',
    bio: "Dr. Brodsky holds two doctoral degrees from Lomonosov Moscow State University and served for 10 years as a research professor in UC Berkeley's Department of Statistics before joining Lincoln. Under his leadership the university earned WSCUC accreditation in 2020 and expanded its graduate programs. He has built the faculty by recruiting senior professors retiring from state universities who value Lincoln's focused mission.",
  },
  {
    id: 'faculty-provost',
    name: 'Dr. Themistoclis Pantos',
    title: 'Provost / Chief Academic Officer & Director of Business Programs',
    role: 'provost',
    bio: 'Dr. Pantos oversees all academic programs, curriculum development, and faculty affairs. He also serves as Director of Business Programs, guiding the MBA, MS Finance, and DBA curricula.',
  },
  {
    id: 'faculty-dean-students',
    name: 'Dr. Mohamed Tailab',
    title: 'Dean of Students',
    role: 'dean',
    bio: 'Dr. Tailab leads student affairs, academic advising, and student success initiatives.',
  },
  {
    id: 'faculty-avp',
    name: 'Dr. Michael Guerra',
    title: 'Administrative Vice President',
    role: 'chair',
    bio: 'Dr. Guerra manages institutional operations, facilities coordination, and administrative compliance.',
  },
  {
    id: 'faculty-qa',
    name: 'Dr. Alexander Anokhin',
    title: 'Director of Quality Assurance & Accreditation Compliance',
    role: 'chair',
    bio: 'Dr. Anokhin leads WSCUC accreditation preparation, institutional self-studies, and academic quality review.',
  },
  {
    id: 'faculty-admissions',
    name: 'Ms. Maggie Hua',
    title: 'Director of Admissions & Registrar',
    role: 'staff',
    bio: 'Ms. Hua manages the full admissions pipeline, student records, and registration processes.',
  },
  {
    id: 'faculty-di-lab',
    name: 'Ms. Marina Kay',
    title: 'Director of Diagnostic Imaging Laboratory',
    role: 'chair',
    departmentId: 'dept-di',
    bio: 'Ms. Kay directs the Diagnostic Imaging Laboratory and oversees clinical training for BS-DI students.',
  },
  {
    id: 'faculty-library',
    name: 'Ms. Nicole Y. Marsh',
    title: 'Head Librarian',
    role: 'staff',
    bio: 'Ms. Marsh manages the Lincoln University Library and Academic Success Center tutoring resources.',
  },
  {
    id: 'faculty-athletics',
    name: 'Mr. Desmond Gumbs',
    title: 'Director of Athletics',
    role: 'staff',
    bio: 'Mr. Gumbs leads the Lincoln University Athletics Department and oversees men\'s and women\'s basketball, soccer, and club sports.',
  },
];

// =============================================================================
// INSTITUTIONAL METRICS
// =============================================================================

export const INSTITUTIONAL_METRICS: InstitutionalMetrics = {
  enrollment: {
    total: 436,
    undergraduate: 204,
    graduate: 232,
    yearOverYearChange: 1.9,
  },
  academics: {
    programs: 6,
    facultyCount: 27,
    studentFacultyRatio: '15:1',
  },
  outcomes: {
    graduationRate: 69,
    retentionRate: 89,
    employmentRate: 95,
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
    description: 'Spring 2026 final examination schedule published',
    timestamp: new Date('2026-02-04T08:00:00'),
    sourceType: 'record',
    sourceId: 'cal-finals',
    route: '/organization/schedule',
    organizationId: 'lu-oak-001',
    mode: 'education',
    visibility: ['faculty', 'student', 'staff'],
  },
  {
    id: 'edu-act-2',
    type: 'event_updated',
    title: 'Add/Drop Deadline',
    description: 'Last day to add or drop classes without penalty — Feb 9',
    timestamp: new Date('2026-02-06T12:00:00'),
    sourceType: 'event',
    sourceId: 'cal-add-drop',
    route: '/organization/schedule',
    organizationId: 'lu-oak-001',
    mode: 'education',
    visibility: ['faculty', 'student', 'staff'],
  },
  {
    id: 'edu-act-3',
    type: 'leadership_updated',
    title: 'Accreditation Notice',
    description: 'WSCUC reaccreditation review scheduled June 26, 2026',
    timestamp: new Date('2026-01-20T10:00:00'),
    sourceType: 'organization',
    sourceId: 'cal-wscuc-review',
    route: '/organization/leadership',
    organizationId: 'lu-oak-001',
    mode: 'education',
    visibility: ['faculty', 'staff'],
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
    organizationId: 'lu-oak-001',
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
    chair: 'Director',
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
  year: string;
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
    enrollment: 418,
    graduationRate: 67,
    graduates: 46,
    highlights: [
      'Men\'s basketball program competed under Head Coach Gary Payton',
      'MBA program launched International Business & Finance track',
      'WSCUC interim monitoring review cleared with no findings',
    ],
  },
  {
    year: '2024-2025',
    terms: ACADEMIC_TERMS.filter((t) => t.academicYear === '2024-2025'),
    enrollment: 432,
    graduationRate: 69,
    graduates: 50,
    highlights: [
      'GAAC Tournament Champions — men\'s basketball (back-to-back)',
      'Enrollment growth of 3.3% — highest in five years',
      'William Middlebrooks hired as head basketball coach (April 2024)',
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
