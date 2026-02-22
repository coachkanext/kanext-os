/**
 * Mock data for Education Explore page (Media tab).
 * School discovery homepage for education mode.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface FeaturedSchool {
  id: string;
  name: string;
  initials: string;
  location: string;
  tagline: string;
  type: string;
  thumbnailColor: string;
}

export interface SchoolCard {
  id: string;
  name: string;
  initials: string;
  location: string;
  type: string;
  badges: string[];
  thumbnailColor: string;
}

export interface TrendingItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'event' | 'announcement' | 'spotlight';
  thumbnailColor: string;
}

export interface EducationEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  type: 'open-house' | 'webinar' | 'fair' | 'visit';
  thumbnailColor: string;
}

export interface ProgramTile {
  id: string;
  name: string;
  category: string;
  schoolCount: number;
  thumbnailColor: string;
}

export interface CampusCard {
  id: string;
  title: string;
  schoolName: string;
  category: string;
  thumbnailColor: string;
}

export interface AdmissionsSpotlight {
  id: string;
  schoolName: string;
  initials: string;
  location: string;
  acceptanceRate: string;
  avgAid: string;
  thumbnailColor: string;
  ctas: string[];
}

export type EducationScope = 'All Schools' | 'HBCUs' | 'By State';

// =============================================================================
// FEATURED SCHOOL
// =============================================================================

export const FEATURED_SCHOOL: FeaturedSchool = {
  id: 'feat-1',
  name: 'KaNeXT Sports',
  initials: 'KaNeXT',
  location: 'Nashville, TN',
  tagline: 'Where faith, purpose, and excellence converge — HBCU tradition since 1879',
  type: 'University',
  thumbnailColor: '#1D9BF0',
};

// =============================================================================
// SCHOOLS FOR YOU
// =============================================================================

export const SCHOOLS_FOR_YOU: SchoolCard[] = [
  { id: 'sfy-1', name: 'KaNeXT Sports', initials: 'KaNeXT', location: 'Nashville, TN', type: 'University', badges: ['NAA', 'Faith-Based'], thumbnailColor: '#1D9BF0' },
  { id: 'sfy-2', name: 'KaNeXT University', initials: 'KaNeXT University', location: 'Santee, CA', type: 'Faith-Based', badges: ['NAA', 'Christian'], thumbnailColor: '#1D9BF0' },
  { id: 'sfy-3', name: 'Heritage University', initials: 'TU', location: 'Nashville, TN', type: 'University', badges: ['NAA D-II', 'STEM'], thumbnailColor: '#1D9BF0' },
  { id: 'sfy-4', name: 'Hampton University', initials: 'HU', location: 'Hampton, VA', type: 'University', badges: ['NCAA D-I', 'Business'], thumbnailColor: '#1D9BF0' },
  { id: 'sfy-5', name: 'Howard University', initials: 'HOW', location: 'Washington, DC', type: 'University', badges: ['NCAA D-I', 'Law'], thumbnailColor: '#EF4444' },
  { id: 'sfy-6', name: 'Founders College', initials: 'MC', location: 'Nashville, TN', type: 'University', badges: ['NAA D-II', 'Liberal Arts'], thumbnailColor: '#F59E0B' },
  { id: 'sfy-7', name: 'Evergreen University', initials: 'EWU', location: 'Jacksonville, FL', type: 'University', badges: ['NAA', 'Faith-Based'], thumbnailColor: '#22C55E' },
  { id: 'sfy-8', name: 'Clearwater University', initials: 'WU', location: 'Lake Wales, FL', type: 'Faith-Based', badges: ['NAA', 'Ministry'], thumbnailColor: '#F59E0B' },
];

// =============================================================================
// TRENDING NOW
// =============================================================================

export const TRENDING_NOW: TrendingItem[] = [
  { id: 'tn-1', title: 'KaNeXT Aviation Program Expands', subtitle: 'New fleet of training aircraft arrives at Opa-Locka Airport', type: 'announcement', thumbnailColor: '#1D9BF0' },
  { id: 'tn-2', title: 'HBCU Week 2026', subtitle: 'National celebration of historically Black colleges and universities', type: 'event', thumbnailColor: '#1D9BF0' },
  { id: 'tn-3', title: 'Top 10 NAIA Business Programs', subtitle: 'Rankings for faith-based and small college business degrees', type: 'spotlight', thumbnailColor: '#F59E0B' },
  { id: 'tn-4', title: 'Spring Enrollment Surge', subtitle: 'HBCU applications up 18% year-over-year', type: 'announcement', thumbnailColor: '#22C55E' },
  { id: 'tn-5', title: 'KaNeXT Nursing Cohort Graduates', subtitle: '95% NCLEX pass rate for the Class of 2026', type: 'spotlight', thumbnailColor: '#1D9BF0' },
  { id: 'tn-6', title: 'Campus Ministry Conference', subtitle: 'Faith-based institutions gather in Atlanta', type: 'event', thumbnailColor: '#1D9BF0' },
];

// =============================================================================
// UPCOMING EVENTS
// =============================================================================

export const UPCOMING_EVENTS: EducationEvent[] = [
  { id: 'ue-1', title: 'KaNeXT Spring Open House', date: 'Mar 8', location: 'Nashville, TN', type: 'open-house', thumbnailColor: '#1D9BF0' },
  { id: 'ue-2', title: 'HBCU College Fair', date: 'Mar 15', location: 'Nashville, TN', type: 'fair', thumbnailColor: '#1D9BF0' },
  { id: 'ue-3', title: 'Financial Aid Webinar', date: 'Mar 22', location: 'Virtual', type: 'webinar', thumbnailColor: '#22C55E' },
  { id: 'ue-4', title: 'Campus Visit Day — Heritage University', date: 'Apr 5', location: 'Nashville, TN', type: 'visit', thumbnailColor: '#1D9BF0' },
  { id: 'ue-5', title: 'NAIA Scholar-Athlete Summit', date: 'Apr 12', location: 'Kansas City, MO', type: 'fair', thumbnailColor: '#F59E0B' },
  { id: 'ue-6', title: 'KaNeXT Admitted Students Day', date: 'Apr 19', location: 'Nashville, TN', type: 'open-house', thumbnailColor: '#1D9BF0' },
];

// =============================================================================
// TOP PROGRAMS
// =============================================================================

export const TOP_PROGRAMS: ProgramTile[] = [
  { id: 'prog-1', name: 'Business Administration', category: 'Business', schoolCount: 42, thumbnailColor: '#F59E0B' },
  { id: 'prog-2', name: 'Nursing (BSN)', category: 'Health Sciences', schoolCount: 28, thumbnailColor: '#EF4444' },
  { id: 'prog-3', name: 'Computer Science', category: 'STEM', schoolCount: 35, thumbnailColor: '#1D9BF0' },
  { id: 'prog-4', name: 'Aviation Science', category: 'STEM', schoolCount: 8, thumbnailColor: '#1D9BF0' },
  { id: 'prog-5', name: 'Criminal Justice', category: 'Social Sciences', schoolCount: 31, thumbnailColor: '#1D9BF0' },
  { id: 'prog-6', name: 'Education', category: 'Education', schoolCount: 38, thumbnailColor: '#22C55E' },
  { id: 'prog-7', name: 'Ministry & Theology', category: 'Faith', schoolCount: 18, thumbnailColor: '#1D9BF0' },
  { id: 'prog-8', name: 'Communications', category: 'Liberal Arts', schoolCount: 26, thumbnailColor: '#FFFFFF' },
];

// =============================================================================
// CAMPUS LIFE
// =============================================================================

export const CAMPUS_LIFE: CampusCard[] = [
  { id: 'cl-1', title: 'Homecoming Weekend Highlights', schoolName: 'KaNeXT Sports', category: 'Traditions', thumbnailColor: '#1D9BF0' },
  { id: 'cl-2', title: 'Student Housing Tour', schoolName: 'Howard University', category: 'Residential', thumbnailColor: '#EF4444' },
  { id: 'cl-3', title: 'Greek Life & Organizations', schoolName: 'Hampton University', category: 'Student Life', thumbnailColor: '#1D9BF0' },
  { id: 'cl-4', title: 'Chapel Services', schoolName: 'KaNeXT University', category: 'Faith', thumbnailColor: '#1D9BF0' },
  { id: 'cl-5', title: 'Athletics Game Day', schoolName: 'Heritage University', category: 'Athletics', thumbnailColor: '#1D9BF0' },
  { id: 'cl-6', title: 'Research Opportunities', schoolName: 'Founders College', category: 'Academics', thumbnailColor: '#F59E0B' },
];

// =============================================================================
// ADMISSIONS SPOTLIGHT
// =============================================================================

export const ADMISSIONS_SPOTLIGHT: AdmissionsSpotlight[] = [
  { id: 'adm-1', schoolName: 'KaNeXT Sports', initials: 'KaNeXT', location: 'Nashville, TN', acceptanceRate: '45%', avgAid: '$18,500', thumbnailColor: '#1D9BF0', ctas: ['Visit', 'Apply', 'Request Info'] },
  { id: 'adm-2', schoolName: 'KaNeXT University', initials: 'KaNeXT University', location: 'Santee, CA', acceptanceRate: '62%', avgAid: '$15,200', thumbnailColor: '#1D9BF0', ctas: ['Visit', 'Apply', 'Request Info'] },
  { id: 'adm-3', schoolName: 'Heritage University', initials: 'TU', location: 'Nashville, TN', acceptanceRate: '38%', avgAid: '$22,000', thumbnailColor: '#1D9BF0', ctas: ['Visit', 'Apply', 'Request Info'] },
  { id: 'adm-4', schoolName: 'Clearwater University', initials: 'WU', location: 'Lake Wales, FL', acceptanceRate: '55%', avgAid: '$14,800', thumbnailColor: '#F59E0B', ctas: ['Visit', 'Apply', 'Request Info'] },
];

// =============================================================================
// FILTER OPTIONS
// =============================================================================

export const EDUCATION_SCOPE_OPTIONS: EducationScope[] = ['All Schools', 'HBCUs', 'By State'];
