/**
 * Mock Calendar Events
 * Non-game events distributed across the 2025-26 season.
 */

import type { ProgramCalendarEvent } from '@/types';

// Helper to create events quickly
function evt(
  id: string,
  type: ProgramCalendarEvent['type'],
  title: string,
  year: number,
  month: number,
  day: number,
  startHour: number,
  startMin: number,
  endHour: number,
  endMin: number,
  location?: string,
  description?: string,
  scope: ProgramCalendarEvent['visibilityScope'] = 'all_program',
): ProgramCalendarEvent {
  return {
    id,
    type,
    title,
    startDatetime: new Date(year, month, day, startHour, startMin),
    endDatetime: new Date(year, month, day, endHour, endMin),
    location,
    description,
    visibilityScope: scope,
  };
}

export const MOCK_CALENDAR_EVENTS: ProgramCalendarEvent[] = [
  // ── OCTOBER 2025 ──
  // Practices: Mon/Wed/Fri 9am-11am
  evt('p-oct-06', 'practice', 'Team Practice', 2025, 9, 6, 9, 0, 11, 0, 'FMU Wellness Center', 'Full team practice'),
  evt('p-oct-08', 'practice', 'Team Practice', 2025, 9, 8, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-oct-10', 'practice', 'Team Practice', 2025, 9, 10, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-oct-13', 'practice', 'Team Practice', 2025, 9, 13, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-oct-15', 'practice', 'Team Practice', 2025, 9, 15, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-oct-17', 'practice', 'Team Practice', 2025, 9, 17, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-oct-20', 'practice', 'Team Practice', 2025, 9, 20, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-oct-22', 'practice', 'Team Practice', 2025, 9, 22, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-oct-24', 'practice', 'Team Practice', 2025, 9, 24, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-oct-27', 'practice', 'Team Practice', 2025, 9, 27, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-oct-29', 'practice', 'Team Practice', 2025, 9, 29, 9, 0, 11, 0, 'FMU Wellness Center'),
  // Lifts: Tue/Thu 6am-7:30am
  evt('l-oct-07', 'lift', 'Weight Room', 2025, 9, 7, 6, 0, 7, 30, 'FMU Weight Room', 'Strength & conditioning'),
  evt('l-oct-09', 'lift', 'Weight Room', 2025, 9, 9, 6, 0, 7, 30, 'FMU Weight Room'),
  evt('l-oct-14', 'lift', 'Weight Room', 2025, 9, 14, 6, 0, 7, 30, 'FMU Weight Room'),
  evt('l-oct-16', 'lift', 'Weight Room', 2025, 9, 16, 6, 0, 7, 30, 'FMU Weight Room'),
  evt('l-oct-21', 'lift', 'Weight Room', 2025, 9, 21, 6, 0, 7, 30, 'FMU Weight Room'),
  evt('l-oct-23', 'lift', 'Weight Room', 2025, 9, 23, 6, 0, 7, 30, 'FMU Weight Room'),
  // Staff meeting: Mon 3pm-4pm
  evt('m-oct-06', 'meeting', 'Staff Meeting', 2025, 9, 6, 15, 0, 16, 0, 'Coach Office', 'Weekly coaching staff meeting', 'team_staff'),
  evt('m-oct-13', 'meeting', 'Staff Meeting', 2025, 9, 13, 15, 0, 16, 0, 'Coach Office', undefined, 'team_staff'),
  evt('m-oct-20', 'meeting', 'Staff Meeting', 2025, 9, 20, 15, 0, 16, 0, 'Coach Office', undefined, 'team_staff'),
  evt('m-oct-27', 'meeting', 'Staff Meeting', 2025, 9, 27, 15, 0, 16, 0, 'Coach Office', undefined, 'team_staff'),

  // ── NOVEMBER 2025 ──
  evt('p-nov-03', 'practice', 'Team Practice', 2025, 10, 3, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-nov-05', 'practice', 'Team Practice', 2025, 10, 5, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-nov-07', 'practice', 'Team Practice', 2025, 10, 7, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-nov-10', 'practice', 'Team Practice', 2025, 10, 10, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-nov-12', 'practice', 'Team Practice', 2025, 10, 12, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-nov-14', 'practice', 'Team Practice', 2025, 10, 14, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('l-nov-04', 'lift', 'Weight Room', 2025, 10, 4, 6, 0, 7, 30, 'FMU Weight Room'),
  evt('l-nov-06', 'lift', 'Weight Room', 2025, 10, 6, 6, 0, 7, 30, 'FMU Weight Room'),
  evt('l-nov-11', 'lift', 'Weight Room', 2025, 10, 11, 6, 0, 7, 30, 'FMU Weight Room'),
  evt('l-nov-13', 'lift', 'Weight Room', 2025, 10, 13, 6, 0, 7, 30, 'FMU Weight Room'),
  evt('m-nov-03', 'meeting', 'Staff Meeting', 2025, 10, 3, 15, 0, 16, 0, 'Coach Office', undefined, 'team_staff'),
  evt('m-nov-10', 'meeting', 'Staff Meeting', 2025, 10, 10, 15, 0, 16, 0, 'Coach Office', undefined, 'team_staff'),

  // Recruiting visits
  evt('r-nov-08', 'recruiting', 'Campus Visit: J. Thompson', 2025, 10, 8, 10, 0, 14, 0, 'FMU Campus', 'PG prospect from Atlanta', 'team_staff'),
  evt('r-nov-15', 'recruiting', 'Campus Visit: M. Davis', 2025, 10, 15, 10, 0, 14, 0, 'FMU Campus', 'Wing prospect from Orlando', 'team_staff'),

  // ── DECEMBER 2025 ──
  evt('p-dec-01', 'practice', 'Team Practice', 2025, 11, 1, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-dec-03', 'practice', 'Team Practice', 2025, 11, 3, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-dec-05', 'practice', 'Team Practice', 2025, 11, 5, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('l-dec-02', 'lift', 'Weight Room', 2025, 11, 2, 6, 0, 7, 30, 'FMU Weight Room'),
  evt('l-dec-04', 'lift', 'Weight Room', 2025, 11, 4, 6, 0, 7, 30, 'FMU Weight Room'),
  evt('m-dec-01', 'meeting', 'Staff Meeting', 2025, 11, 1, 15, 0, 16, 0, 'Coach Office', undefined, 'team_staff'),
  // Travel for away game
  evt('t-dec-05', 'travel', 'Travel to Indiana', 2025, 11, 5, 14, 0, 18, 0, 'Airport', 'Team travel for away game'),
  // Academic
  evt('a-dec-12', 'academic', 'Final Exams Begin', 2025, 11, 12, 8, 0, 17, 0, 'FMU Campus', 'Players must attend study hall', 'player'),
  evt('a-dec-19', 'academic', 'Fall Grades Due', 2025, 11, 19, 8, 0, 17, 0, undefined, 'Academic eligibility check'),

  // ── JANUARY 2026 ──
  evt('p-jan-05', 'practice', 'Team Practice', 2026, 0, 5, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-jan-07', 'practice', 'Team Practice', 2026, 0, 7, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-jan-09', 'practice', 'Team Practice', 2026, 0, 9, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-jan-12', 'practice', 'Team Practice', 2026, 0, 12, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-jan-14', 'practice', 'Team Practice', 2026, 0, 14, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('l-jan-06', 'lift', 'Weight Room', 2026, 0, 6, 6, 0, 7, 30, 'FMU Weight Room'),
  evt('l-jan-08', 'lift', 'Weight Room', 2026, 0, 8, 6, 0, 7, 30, 'FMU Weight Room'),
  evt('l-jan-13', 'lift', 'Weight Room', 2026, 0, 13, 6, 0, 7, 30, 'FMU Weight Room'),
  evt('m-jan-05', 'meeting', 'Staff Meeting', 2026, 0, 5, 15, 0, 16, 0, 'Coach Office', undefined, 'team_staff'),
  evt('m-jan-12', 'meeting', 'Staff Meeting', 2026, 0, 12, 15, 0, 16, 0, 'Coach Office', undefined, 'team_staff'),
  // Admin
  evt('ad-jan-15', 'admin_deadline', 'Budget Review', 2026, 0, 15, 10, 0, 11, 30, 'Athletics Dept', 'Mid-season budget check-in', 'team_staff'),
  // Recruiting
  evt('r-jan-10', 'recruiting', 'Recruit Eval: K. Jackson', 2026, 0, 10, 9, 0, 12, 0, 'FMU Gym', 'Forward prospect tryout', 'team_staff'),

  // ── FEBRUARY 2026 ──
  evt('p-feb-02', 'practice', 'Team Practice', 2026, 1, 2, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-feb-04', 'practice', 'Team Practice', 2026, 1, 4, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-feb-06', 'practice', 'Team Practice', 2026, 1, 6, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-feb-09', 'practice', 'Team Practice', 2026, 1, 9, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-feb-11', 'practice', 'Team Practice', 2026, 1, 11, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-feb-13', 'practice', 'Team Practice', 2026, 1, 13, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('l-feb-03', 'lift', 'Weight Room', 2026, 1, 3, 6, 0, 7, 30, 'FMU Weight Room'),
  evt('l-feb-05', 'lift', 'Weight Room', 2026, 1, 5, 6, 0, 7, 30, 'FMU Weight Room'),
  evt('l-feb-10', 'lift', 'Weight Room', 2026, 1, 10, 6, 0, 7, 30, 'FMU Weight Room'),
  evt('l-feb-12', 'lift', 'Weight Room', 2026, 1, 12, 6, 0, 7, 30, 'FMU Weight Room'),
  evt('m-feb-02', 'meeting', 'Staff Meeting', 2026, 1, 2, 15, 0, 16, 0, 'Coach Office', undefined, 'team_staff'),
  evt('m-feb-09', 'meeting', 'Staff Meeting', 2026, 1, 9, 15, 0, 16, 0, 'Coach Office', undefined, 'team_staff'),
  // Travel
  evt('t-feb-06', 'travel', 'Travel to St. Thomas', 2026, 1, 6, 14, 0, 18, 0, 'Airport', 'Conference road game'),
  // Admin
  evt('ad-feb-20', 'admin_deadline', 'Compliance Check-in', 2026, 1, 20, 14, 0, 15, 30, 'Athletics Dept', 'NAIA compliance review', 'team_staff'),
  // Recruiting
  evt('r-feb-14', 'recruiting', 'Recruit Film Review', 2026, 1, 14, 13, 0, 15, 0, 'Film Room', 'Review top 5 guard prospects', 'team_staff'),

  // ── MARCH 2026 ──
  evt('p-mar-02', 'practice', 'Team Practice', 2026, 2, 2, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('p-mar-04', 'practice', 'Team Practice', 2026, 2, 4, 9, 0, 11, 0, 'FMU Wellness Center'),
  evt('l-mar-03', 'lift', 'Weight Room', 2026, 2, 3, 6, 0, 7, 30, 'FMU Weight Room'),
  evt('l-mar-05', 'lift', 'Weight Room', 2026, 2, 5, 6, 0, 7, 30, 'FMU Weight Room'),
  evt('m-mar-02', 'meeting', 'Staff Meeting', 2026, 2, 2, 15, 0, 16, 0, 'Coach Office', undefined, 'team_staff'),
  // Academic
  evt('a-mar-15', 'academic', 'Spring Break Begins', 2026, 2, 15, 8, 0, 17, 0, undefined, 'No classes — practice continues'),
  // Admin
  evt('ad-mar-01', 'admin_deadline', 'Scholarship Renewals Due', 2026, 2, 1, 9, 0, 17, 0, 'Athletics Dept', 'Submit renewal decisions', 'team_staff'),
];
