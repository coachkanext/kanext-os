/**
 * Education Athletics — 6-view pill toggle for sports programs.
 *
 * Views:
 *   0 — Overview (KPIs, season highlights, recent results ticker)
 *   1 — Teams (sport-by-sport breakdown, records, schedules, rosters, coaching)
 *   2 — Athlete Support (academic support, GPA monitoring, tutoring, study hall, mental health)
 *   3 — Compliance & Eligibility (NCAA dashboard, eligibility tracker, scholarship limits, APR, waivers)
 *   4 — Recruiting Bridge (pipeline by sport, offers, commits, visits, NLI, class rankings)
 *   5 — Budget & Resources (budget breakdown, revenue by sport, facilities, equipment, travel)
 *
 * RBAC:
 *   E1/E2 — All views, full budget/compliance data
 *   E3    — Overview / Teams / Athlete Support / Compliance, limited budget
 *   E4    — Overview / Teams only (student/fan view)
 *   E5    — Overview only (public scoreboard)
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

type AthleticsView =
  | 'overview'
  | 'teams'
  | 'athlete-support'
  | 'compliance'
  | 'recruiting'
  | 'budget';

interface ViewDef {
  id: AthleticsView;
  label: string;
  minRole: EducationRoleLens;
}

const ALL_VIEWS: ViewDef[] = [
  { id: 'overview', label: 'Overview', minRole: 'E5' },
  { id: 'teams', label: 'Teams', minRole: 'E4' },
  { id: 'athlete-support', label: 'Athlete Support', minRole: 'E3' },
  { id: 'compliance', label: 'Compliance & Eligibility', minRole: 'E3' },
  { id: 'recruiting', label: 'Recruiting Bridge', minRole: 'E2' },
  { id: 'budget', label: 'Budget & Resources', minRole: 'E2' },
];

const ROLE_RANK: Record<EducationRoleLens, number> = {
  E1: 1, E2: 2, E3: 3, E4: 4, E5: 5,
};

function getVisibleViews(role: EducationRoleLens): ViewDef[] {
  // E3 gets limited budget (we show it) but not full recruiting
  if (role === 'E3') {
    return ALL_VIEWS.filter((v) =>
      v.id === 'overview' || v.id === 'teams' || v.id === 'athlete-support' || v.id === 'compliance'
    );
  }
  return ALL_VIEWS.filter((v) => ROLE_RANK[role] <= ROLE_RANK[v.minRole]);
}

// =============================================================================
// INLINE MOCK DATA — EXISTING (kept from prior version)
// =============================================================================

// --- Athletic Department Overview ---

interface AthleticDeptInfo {
  conference: string;
  division: string;
  mascot: string;
  schoolColors: string;
  totalSports: number;
  studentAthletes: number;
  athleticBudget: string;
  ncaaCompliance: string;
  athleticDirector: string;
}

const ATHLETIC_DEPT: AthleticDeptInfo = {
  conference: 'Southeastern Athletic Conference',
  division: 'NCAA Division I',
  mascot: 'Eagles',
  schoolColors: 'Navy & Gold',
  totalSports: 18,
  studentAthletes: 420,
  athleticBudget: '$18.2M',
  ncaaCompliance: 'Good Standing',
  athleticDirector: 'Mark Thompson',
};

// --- Active Sports ---

type SportSeason = 'fall' | 'winter' | 'spring' | 'year-round';

interface ActiveSport {
  id: string;
  name: string;
  season: SportSeason;
  gender: 'Men' | 'Women' | 'Coed';
  coach: string;
  record: string;
  conferenceRecord: string;
  ranking?: number;
  rosterSize: number;
  scholarships: number;
  status: 'in-season' | 'off-season' | 'postseason';
}

const ACTIVE_SPORTS: ActiveSport[] = [
  { id: 'sp-1', name: 'Basketball', season: 'winter', gender: 'Men', coach: 'Coach Marcus Davis', record: '22-6', conferenceRecord: '14-3', ranking: 18, rosterSize: 15, scholarships: 13, status: 'in-season' },
  { id: 'sp-2', name: 'Basketball', season: 'winter', gender: 'Women', coach: 'Coach Andrea Wilson', record: '19-8', conferenceRecord: '12-5', rosterSize: 15, scholarships: 15, status: 'in-season' },
  { id: 'sp-3', name: 'Football', season: 'fall', gender: 'Men', coach: 'Coach Ray Johnson', record: '9-3', conferenceRecord: '6-2', ranking: 22, rosterSize: 85, scholarships: 85, status: 'off-season' },
  { id: 'sp-4', name: 'Soccer', season: 'fall', gender: 'Women', coach: 'Coach Lisa Morales', record: '14-5-2', conferenceRecord: '8-3-1', rosterSize: 28, scholarships: 14, status: 'off-season' },
  { id: 'sp-5', name: 'Baseball', season: 'spring', gender: 'Men', coach: 'Coach Tom Harris', record: '0-0', conferenceRecord: '0-0', rosterSize: 35, scholarships: 11.7, status: 'in-season' },
  { id: 'sp-6', name: 'Softball', season: 'spring', gender: 'Women', coach: 'Coach Karen Lee', record: '2-1', conferenceRecord: '0-0', rosterSize: 22, scholarships: 12, status: 'in-season' },
  { id: 'sp-7', name: 'Track & Field', season: 'spring', gender: 'Coed', coach: 'Coach David Brooks', record: 'N/A', conferenceRecord: 'N/A', rosterSize: 65, scholarships: 12.6, status: 'in-season' },
  { id: 'sp-8', name: 'Swimming & Diving', season: 'winter', gender: 'Coed', coach: 'Coach Emily Chen', record: '8-2', conferenceRecord: '5-1', rosterSize: 32, scholarships: 14, status: 'in-season' },
  { id: 'sp-9', name: 'Tennis', season: 'spring', gender: 'Women', coach: 'Coach Rachel White', record: '1-0', conferenceRecord: '0-0', rosterSize: 10, scholarships: 8, status: 'in-season' },
  { id: 'sp-10', name: 'Golf', season: 'spring', gender: 'Men', coach: 'Coach Brian Taylor', record: 'N/A', conferenceRecord: 'N/A', rosterSize: 8, scholarships: 4.5, status: 'in-season' },
  { id: 'sp-11', name: 'Volleyball', season: 'fall', gender: 'Women', coach: 'Coach Maria Santos', record: '24-8', conferenceRecord: '14-4', rosterSize: 18, scholarships: 12, status: 'off-season' },
  { id: 'sp-12', name: 'Cross Country', season: 'fall', gender: 'Coed', coach: 'Coach David Brooks', record: 'N/A', conferenceRecord: 'N/A', rosterSize: 30, scholarships: 12.6, status: 'off-season' },
];

const SEASON_COLOR: Record<SportSeason, string> = {
  fall: '#F97316',
  winter: '#3B82F6',
  spring: '#22C55E',
  'year-round': '#8B5CF6',
};

const STATUS_COLOR: Record<string, string> = {
  'in-season': '#22C55E',
  'off-season': '#8F8F8F',
  postseason: '#F59E0B',
};

// --- Upcoming Games ---

interface UpcomingGame {
  id: string;
  sport: string;
  opponent: string;
  date: string;
  time: string;
  location: string;
  homeAway: 'Home' | 'Away' | 'Neutral';
  broadcast?: string;
  ticketsAvailable?: boolean;
  conferenceGame: boolean;
}

const UPCOMING_GAMES: UpcomingGame[] = [
  { id: 'ug-1', sport: 'Men\'s Basketball', opponent: 'Riverside University', date: 'Mar 1', time: '7:00 PM', location: 'Peach State Arena', homeAway: 'Home', broadcast: 'ESPN+', ticketsAvailable: true, conferenceGame: true },
  { id: 'ug-2', sport: 'Women\'s Basketball', opponent: 'Mountain State', date: 'Mar 2', time: '2:00 PM', location: 'Peach State Arena', homeAway: 'Home', broadcast: 'SEC Network', ticketsAvailable: true, conferenceGame: true },
  { id: 'ug-3', sport: 'Baseball', opponent: 'Coastal College', date: 'Mar 4', time: '3:00 PM', location: 'Eagle Diamond', homeAway: 'Home', ticketsAvailable: true, conferenceGame: false },
  { id: 'ug-4', sport: 'Softball', opponent: 'State Tech', date: 'Mar 5', time: '4:00 PM', location: 'Eagle Softball Complex', homeAway: 'Home', conferenceGame: false },
  { id: 'ug-5', sport: 'Men\'s Basketball', opponent: 'Capital University', date: 'Mar 8', time: '8:00 PM', location: 'Capital Arena', homeAway: 'Away', broadcast: 'ESPN2', conferenceGame: true },
  { id: 'ug-6', sport: 'Swimming', opponent: 'Conference Championship', date: 'Mar 10\u201312', time: 'All Day', location: 'Aquatic Center, Nashville', homeAway: 'Neutral', conferenceGame: true },
  { id: 'ug-7', sport: 'Track & Field', opponent: 'Spring Invitational', date: 'Mar 15', time: '10:00 AM', location: 'Eagle Track', homeAway: 'Home', conferenceGame: false },
  { id: 'ug-8', sport: 'Tennis', opponent: 'Valley State', date: 'Mar 18', time: '2:00 PM', location: 'Tennis Complex', homeAway: 'Home', conferenceGame: true },
];

// --- Recent Results ---

interface GameResult {
  id: string;
  sport: string;
  opponent: string;
  date: string;
  score: string;
  result: 'W' | 'L' | 'T';
  highlights?: string;
  attendance?: number;
}

const RECENT_RESULTS: GameResult[] = [
  { id: 'gr-1', sport: 'Men\'s Basketball', opponent: 'Southern Tech', date: 'Feb 26', score: '82-71', result: 'W', highlights: 'Johnson 28 pts, 8 reb', attendance: 7200 },
  { id: 'gr-2', sport: 'Women\'s Basketball', opponent: 'Lakeside University', date: 'Feb 25', score: '74-68', result: 'W', highlights: 'Thomas double-double (22 pts, 12 reb)', attendance: 3800 },
  { id: 'gr-3', sport: 'Men\'s Basketball', opponent: 'Metro State', date: 'Feb 22', score: '65-70', result: 'L', highlights: 'Close road loss; Williams 18 pts', attendance: 6500 },
  { id: 'gr-4', sport: 'Softball', opponent: 'Valley College', date: 'Feb 22', score: '5-2', result: 'W', highlights: 'Martinez 3-for-4, 2 RBI' },
  { id: 'gr-5', sport: 'Baseball', opponent: 'Pine State', date: 'Feb 21', score: '8-3', result: 'W', highlights: 'Season opener win; Davis 2 HR' },
  { id: 'gr-6', sport: 'Softball', opponent: 'River City', date: 'Feb 21', score: '3-4', result: 'L', highlights: 'Extra innings' },
  { id: 'gr-7', sport: 'Swimming', opponent: 'Dual Meet vs. State U', date: 'Feb 18', score: '168-132', result: 'W', highlights: '3 pool records broken' },
  { id: 'gr-8', sport: 'Tennis', opponent: 'Heritage College', date: 'Feb 15', score: '5-2', result: 'W', highlights: 'Season opener' },
];

const RESULT_COLOR: Record<string, string> = {
  W: '#22C55E',
  L: '#EF4444',
  T: '#F59E0B',
};

// --- Student-Athlete Spotlight ---

interface StudentAthlete {
  id: string;
  name: string;
  sport: string;
  position: string;
  year: string;
  major: string;
  gpa: number;
  hometown: string;
  achievement: string;
  stats?: string;
}

const ATHLETE_SPOTLIGHTS: StudentAthlete[] = [
  { id: 'sa-1', name: 'Darius Johnson', sport: 'Men\'s Basketball', position: 'Guard', year: 'Senior', major: 'Business Administration', gpa: 3.45, hometown: 'Atlanta, GA', achievement: 'Conference Player of the Year candidate', stats: '22.4 PPG, 5.2 APG' },
  { id: 'sa-2', name: 'Maya Thomas', sport: 'Women\'s Basketball', position: 'Forward', year: 'Junior', major: 'Kinesiology', gpa: 3.72, hometown: 'Charlotte, NC', achievement: 'All-Conference First Team', stats: '18.8 PPG, 9.4 RPG' },
  { id: 'sa-3', name: 'Carlos Rodriguez', sport: 'Baseball', position: 'Pitcher', year: 'Sophomore', major: 'Engineering', gpa: 3.88, hometown: 'Miami, FL', achievement: 'Freshman All-American (2025)', stats: 'ERA 2.14, 98 K' },
  { id: 'sa-4', name: 'Sarah Mitchell', sport: 'Swimming', position: '100m Butterfly', year: 'Senior', major: 'Biology', gpa: 3.95, hometown: 'Denver, CO', achievement: '3x All-American, school record holder' },
  { id: 'sa-5', name: 'Jordan Taylor', sport: 'Football', position: 'Wide Receiver', year: 'Senior', major: 'Kinesiology', gpa: 3.42, hometown: 'Houston, TX', achievement: 'All-Conference, 1,200 rec yards', stats: '78 rec, 1,204 yds, 11 TD' },
  { id: 'sa-6', name: 'Emma Davis', sport: 'Volleyball', position: 'Outside Hitter', year: 'Junior', major: 'Communications', gpa: 3.61, hometown: 'Nashville, TN', achievement: 'Conference kills leader' },
];

// --- Athletic Facilities ---

interface AthleticFacility {
  id: string;
  name: string;
  sport: string;
  capacity: number;
  yearBuilt: number;
  features: string[];
  status: 'operational' | 'renovation' | 'construction';
}

const ATHLETIC_FACILITIES: AthleticFacility[] = [
  { id: 'af-1', name: 'Peach State Arena', sport: 'Basketball/Volleyball', capacity: 8500, yearBuilt: 2009, features: ['LED scoreboard', 'Premium seating', 'Student section 2,000'], status: 'operational' },
  { id: 'af-2', name: 'Eagle Stadium', sport: 'Football', capacity: 28000, yearBuilt: 2014, features: ['Artificial turf', 'Video board', 'Press box', 'Luxury suites'], status: 'operational' },
  { id: 'af-3', name: 'Eagle Diamond', sport: 'Baseball', capacity: 3500, yearBuilt: 2016, features: ['Natural grass', 'Indoor batting cages', 'Bullpen complex'], status: 'operational' },
  { id: 'af-4', name: 'Aquatic Center', sport: 'Swimming & Diving', capacity: 1200, yearBuilt: 2018, features: ['Olympic-size pool', 'Diving platforms', 'Electronic timing'], status: 'operational' },
  { id: 'af-5', name: 'Eagle Track Complex', sport: 'Track & Field', capacity: 5000, yearBuilt: 2012, features: ['8-lane track', 'Field event areas', 'Timing system'], status: 'operational' },
  { id: 'af-6', name: 'Tennis Complex', sport: 'Tennis', capacity: 500, yearBuilt: 2020, features: ['12 courts', 'Indoor courts (6)', 'LED lighting'], status: 'operational' },
  { id: 'af-7', name: 'Eagle Softball Complex', sport: 'Softball', capacity: 1500, yearBuilt: 2017, features: ['Artificial turf', 'Batting cages', 'Locker rooms'], status: 'operational' },
  { id: 'af-8', name: 'Athletic Performance Center', sport: 'All Sports', capacity: 0, yearBuilt: 2025, features: ['Weight room', 'Sports medicine', 'Film room', 'Nutrition center'], status: 'construction' },
];

// --- Recruiting Summary ---

interface RecruitingSummary {
  sport: string;
  commitsThisCycle: number;
  offersOut: number;
  visits: number;
  signingDay: string;
  topProspect?: string;
  classRanking?: string;
  nliSigned?: number;
}

const RECRUITING_SUMMARY: RecruitingSummary[] = [
  { sport: 'Football', commitsThisCycle: 18, offersOut: 42, visits: 28, signingDay: 'Feb 5, 2026', topProspect: '4-star QB (Jacksonville, FL)', classRanking: '#38 National', nliSigned: 16 },
  { sport: 'Men\'s Basketball', commitsThisCycle: 3, offersOut: 8, visits: 6, signingDay: 'Apr 15, 2026', topProspect: '4-star PG (Chicago, IL)', classRanking: '#22 National', nliSigned: 2 },
  { sport: 'Women\'s Basketball', commitsThisCycle: 4, offersOut: 10, visits: 7, signingDay: 'Apr 15, 2026', classRanking: '#18 National', nliSigned: 3 },
  { sport: 'Baseball', commitsThisCycle: 8, offersOut: 15, visits: 12, signingDay: 'Nov 13, 2025', classRanking: '#31 National', nliSigned: 8 },
  { sport: 'Softball', commitsThisCycle: 5, offersOut: 12, visits: 8, signingDay: 'Nov 13, 2025', classRanking: '#42 National', nliSigned: 5 },
  { sport: 'Soccer', commitsThisCycle: 6, offersOut: 14, visits: 10, signingDay: 'Feb 5, 2026', classRanking: '#27 National', nliSigned: 4 },
];

// =============================================================================
// NEW MOCK DATA — ATHLETE SUPPORT
// =============================================================================

interface AcademicSupportService {
  id: string;
  name: string;
  type: 'tutoring' | 'advising' | 'study-hall' | 'mental-health' | 'career';
  provider: string;
  hours: string;
  location: string;
  utilization: number; // percentage
}

const ACADEMIC_SUPPORT_SERVICES: AcademicSupportService[] = [
  { id: 'as-1', name: 'Athletic Academic Center', type: 'advising', provider: 'Dr. Patricia Young', hours: 'Mon\u2013Fri 8:00 AM\u20135:00 PM', location: 'Eagle Academic Hall, Suite 200', utilization: 88 },
  { id: 'as-2', name: 'Peer Tutoring Program', type: 'tutoring', provider: 'Student Athlete Services', hours: 'Sun\u2013Thu 6:00 PM\u201310:00 PM', location: 'Library, 3rd Floor', utilization: 72 },
  { id: 'as-3', name: 'Mandatory Study Hall', type: 'study-hall', provider: 'Athletic Compliance', hours: 'Mon\u2013Thu 7:00 PM\u20139:30 PM', location: 'Eagle Academic Hall, Room 110', utilization: 95 },
  { id: 'as-4', name: 'Sports Psychology', type: 'mental-health', provider: 'Dr. James Martin', hours: 'Mon\u2013Fri 9:00 AM\u20134:00 PM', location: 'Athletic Performance Center', utilization: 64 },
  { id: 'as-5', name: 'Career Development', type: 'career', provider: 'Athletic Career Services', hours: 'Tue/Thu 10:00 AM\u20133:00 PM', location: 'Career Center, Room 105', utilization: 48 },
  { id: 'as-6', name: 'Counseling & Wellness', type: 'mental-health', provider: 'Dr. Angela Rivera', hours: 'Mon\u2013Fri 8:00 AM\u20136:00 PM', location: 'Student Health Center', utilization: 71 },
];

const SUPPORT_TYPE_COLOR: Record<string, string> = {
  tutoring: '#3B82F6',
  advising: '#8B5CF6',
  'study-hall': '#F97316',
  'mental-health': '#EC4899',
  career: '#22C55E',
};

interface GPASnapshot {
  sport: string;
  teamGPA: number;
  athletesBelow2_5: number;
  athletesAbove3_5: number;
  totalAthletes: number;
  studyHallRequired: number;
  studyHallCompliant: number;
}

const GPA_SNAPSHOTS: GPASnapshot[] = [
  { sport: 'Men\'s Basketball', teamGPA: 3.12, athletesBelow2_5: 1, athletesAbove3_5: 6, totalAthletes: 15, studyHallRequired: 3, studyHallCompliant: 3 },
  { sport: 'Women\'s Basketball', teamGPA: 3.38, athletesBelow2_5: 0, athletesAbove3_5: 8, totalAthletes: 15, studyHallRequired: 2, studyHallCompliant: 2 },
  { sport: 'Football', teamGPA: 2.89, athletesBelow2_5: 8, athletesAbove3_5: 14, totalAthletes: 85, studyHallRequired: 22, studyHallCompliant: 20 },
  { sport: 'Women\'s Soccer', teamGPA: 3.54, athletesBelow2_5: 0, athletesAbove3_5: 16, totalAthletes: 28, studyHallRequired: 1, studyHallCompliant: 1 },
  { sport: 'Baseball', teamGPA: 3.05, athletesBelow2_5: 2, athletesAbove3_5: 8, totalAthletes: 35, studyHallRequired: 6, studyHallCompliant: 5 },
  { sport: 'Volleyball', teamGPA: 3.48, athletesBelow2_5: 0, athletesAbove3_5: 10, totalAthletes: 18, studyHallRequired: 1, studyHallCompliant: 1 },
  { sport: 'Swimming & Diving', teamGPA: 3.62, athletesBelow2_5: 0, athletesAbove3_5: 20, totalAthletes: 32, studyHallRequired: 0, studyHallCompliant: 0 },
  { sport: 'Track & Field', teamGPA: 3.18, athletesBelow2_5: 3, athletesAbove3_5: 18, totalAthletes: 65, studyHallRequired: 8, studyHallCompliant: 7 },
];

interface MentalHealthResource {
  id: string;
  label: string;
  metric: string;
  trend: 'up' | 'down' | 'stable';
}

const MENTAL_HEALTH_METRICS: MentalHealthResource[] = [
  { id: 'mh-1', label: 'Active Counseling Sessions', metric: '38 athletes/week', trend: 'up' },
  { id: 'mh-2', label: 'Crisis Interventions (Semester)', metric: '4', trend: 'down' },
  { id: 'mh-3', label: 'Wellness Workshops Held', metric: '12 this semester', trend: 'up' },
  { id: 'mh-4', label: 'Athlete Satisfaction Score', metric: '4.3 / 5.0', trend: 'stable' },
  { id: 'mh-5', label: 'Avg Wait Time (Counseling)', metric: '2.1 days', trend: 'down' },
];

// =============================================================================
// NEW MOCK DATA — COMPLIANCE & ELIGIBILITY
// =============================================================================

interface ComplianceDashboard {
  ncaaStatus: string;
  lastAudit: string;
  auditResult: string;
  openInvestigations: number;
  scholarshipUtilization: string;
  titleIXStatus: string;
  boosterComplianceRate: string;
}

const COMPLIANCE_DASHBOARD: ComplianceDashboard = {
  ncaaStatus: 'Good Standing',
  lastAudit: 'Sep 2025',
  auditResult: 'No Major Violations',
  openInvestigations: 0,
  scholarshipUtilization: '94.2%',
  titleIXStatus: 'Compliant',
  boosterComplianceRate: '98.7%',
};

interface EligibilityRecord {
  id: string;
  sport: string;
  totalAthletes: number;
  eligible: number;
  pending: number;
  ineligible: number;
  aprScore: number;
  aprTrend: 'up' | 'down' | 'stable';
  gsr: number; // graduation success rate
}

const ELIGIBILITY_RECORDS: EligibilityRecord[] = [
  { id: 'el-1', sport: 'Football', totalAthletes: 85, eligible: 82, pending: 2, ineligible: 1, aprScore: 972, aprTrend: 'up', gsr: 84 },
  { id: 'el-2', sport: 'Men\'s Basketball', totalAthletes: 15, eligible: 15, pending: 0, ineligible: 0, aprScore: 985, aprTrend: 'stable', gsr: 90 },
  { id: 'el-3', sport: 'Women\'s Basketball', totalAthletes: 15, eligible: 15, pending: 0, ineligible: 0, aprScore: 992, aprTrend: 'up', gsr: 96 },
  { id: 'el-4', sport: 'Baseball', totalAthletes: 35, eligible: 33, pending: 1, ineligible: 1, aprScore: 968, aprTrend: 'down', gsr: 82 },
  { id: 'el-5', sport: 'Women\'s Soccer', totalAthletes: 28, eligible: 28, pending: 0, ineligible: 0, aprScore: 996, aprTrend: 'stable', gsr: 98 },
  { id: 'el-6', sport: 'Volleyball', totalAthletes: 18, eligible: 18, pending: 0, ineligible: 0, aprScore: 998, aprTrend: 'up', gsr: 100 },
  { id: 'el-7', sport: 'Swimming & Diving', totalAthletes: 32, eligible: 32, pending: 0, ineligible: 0, aprScore: 994, aprTrend: 'stable', gsr: 97 },
  { id: 'el-8', sport: 'Track & Field', totalAthletes: 65, eligible: 62, pending: 2, ineligible: 1, aprScore: 971, aprTrend: 'up', gsr: 85 },
];

interface ScholarshipLimit {
  id: string;
  sport: string;
  ncaaMax: number;
  current: number;
  available: number;
  pendingOffers: number;
  equivalencyBased: boolean;
}

const SCHOLARSHIP_LIMITS: ScholarshipLimit[] = [
  { id: 'sl-1', sport: 'Football', ncaaMax: 85, current: 85, available: 0, pendingOffers: 0, equivalencyBased: false },
  { id: 'sl-2', sport: 'Men\'s Basketball', ncaaMax: 13, current: 13, available: 0, pendingOffers: 0, equivalencyBased: false },
  { id: 'sl-3', sport: 'Women\'s Basketball', ncaaMax: 15, current: 15, available: 0, pendingOffers: 0, equivalencyBased: false },
  { id: 'sl-4', sport: 'Baseball', ncaaMax: 11.7, current: 11.2, available: 0.5, pendingOffers: 2, equivalencyBased: true },
  { id: 'sl-5', sport: 'Softball', ncaaMax: 12, current: 11.5, available: 0.5, pendingOffers: 1, equivalencyBased: true },
  { id: 'sl-6', sport: 'Women\'s Soccer', ncaaMax: 14, current: 13, available: 1, pendingOffers: 3, equivalencyBased: true },
  { id: 'sl-7', sport: 'Volleyball', ncaaMax: 12, current: 12, available: 0, pendingOffers: 0, equivalencyBased: false },
  { id: 'sl-8', sport: 'Swimming & Diving', ncaaMax: 14, current: 13, available: 1, pendingOffers: 2, equivalencyBased: true },
];

interface WaiverRecord {
  id: string;
  athleteName: string;
  sport: string;
  type: string;
  status: 'approved' | 'pending' | 'denied';
  submittedDate: string;
  resolvedDate?: string;
}

const WAIVERS: WaiverRecord[] = [
  { id: 'wv-1', athleteName: 'James Carter', sport: 'Football', type: 'Transfer Eligibility', status: 'approved', submittedDate: 'Aug 2025', resolvedDate: 'Sep 2025' },
  { id: 'wv-2', athleteName: 'Mia Collins', sport: 'Women\'s Soccer', type: 'Medical Hardship', status: 'approved', submittedDate: 'Oct 2025', resolvedDate: 'Nov 2025' },
  { id: 'wv-3', athleteName: 'Derek Washington', sport: 'Baseball', type: 'Academic Progress', status: 'pending', submittedDate: 'Jan 2026' },
  { id: 'wv-4', athleteName: 'Aaliyah Brown', sport: 'Track & Field', type: 'Year of Residence', status: 'pending', submittedDate: 'Feb 2026' },
];

const WAIVER_STATUS_COLOR: Record<string, string> = {
  approved: '#22C55E',
  pending: '#F59E0B',
  denied: '#EF4444',
};

// =============================================================================
// NEW MOCK DATA — BUDGET & RESOURCES
// =============================================================================

interface BudgetCategory {
  id: string;
  category: string;
  allocated: string;
  spent: string;
  remaining: string;
  percentUsed: number;
}

const BUDGET_CATEGORIES: BudgetCategory[] = [
  { id: 'bc-1', category: 'Coaching Salaries', allocated: '$5.8M', spent: '$4.2M', remaining: '$1.6M', percentUsed: 72 },
  { id: 'bc-2', category: 'Scholarships & Aid', allocated: '$4.2M', spent: '$3.9M', remaining: '$0.3M', percentUsed: 93 },
  { id: 'bc-3', category: 'Facilities & Maintenance', allocated: '$2.8M', spent: '$1.9M', remaining: '$0.9M', percentUsed: 68 },
  { id: 'bc-4', category: 'Travel & Transportation', allocated: '$1.6M', spent: '$1.1M', remaining: '$0.5M', percentUsed: 69 },
  { id: 'bc-5', category: 'Equipment & Uniforms', allocated: '$0.9M', spent: '$0.6M', remaining: '$0.3M', percentUsed: 67 },
  { id: 'bc-6', category: 'Sports Medicine & Training', allocated: '$0.8M', spent: '$0.5M', remaining: '$0.3M', percentUsed: 63 },
  { id: 'bc-7', category: 'Recruiting', allocated: '$0.7M', spent: '$0.4M', remaining: '$0.3M', percentUsed: 57 },
  { id: 'bc-8', category: 'Game Operations', allocated: '$0.6M', spent: '$0.4M', remaining: '$0.2M', percentUsed: 67 },
  { id: 'bc-9', category: 'Marketing & Promotion', allocated: '$0.4M', spent: '$0.2M', remaining: '$0.2M', percentUsed: 50 },
  { id: 'bc-10', category: 'Administration', allocated: '$0.4M', spent: '$0.3M', remaining: '$0.1M', percentUsed: 75 },
];

interface RevenueBySource {
  id: string;
  source: string;
  amount: string;
  percentOfTotal: number;
  trend: 'up' | 'down' | 'stable';
}

const REVENUE_SOURCES: RevenueBySource[] = [
  { id: 'rv-1', source: 'University Allocation', amount: '$7.2M', percentOfTotal: 39.6, trend: 'stable' },
  { id: 'rv-2', source: 'Ticket Revenue', amount: '$3.4M', percentOfTotal: 18.7, trend: 'up' },
  { id: 'rv-3', source: 'Conference Distribution', amount: '$2.8M', percentOfTotal: 15.4, trend: 'up' },
  { id: 'rv-4', source: 'Donations & Fundraising', amount: '$2.1M', percentOfTotal: 11.5, trend: 'up' },
  { id: 'rv-5', source: 'Corporate Sponsorships', amount: '$1.2M', percentOfTotal: 6.6, trend: 'stable' },
  { id: 'rv-6', source: 'Media Rights', amount: '$0.8M', percentOfTotal: 4.4, trend: 'up' },
  { id: 'rv-7', source: 'Licensing & Merchandise', amount: '$0.4M', percentOfTotal: 2.2, trend: 'up' },
  { id: 'rv-8', source: 'Event Hosting / Other', amount: '$0.3M', percentOfTotal: 1.6, trend: 'stable' },
];

interface RevenueBySport {
  id: string;
  sport: string;
  revenue: string;
  expenses: string;
  netIncome: string;
  profitable: boolean;
}

const REVENUE_BY_SPORT: RevenueBySport[] = [
  { id: 'rs-1', sport: 'Football', revenue: '$6.8M', expenses: '$5.2M', netIncome: '+$1.6M', profitable: true },
  { id: 'rs-2', sport: 'Men\'s Basketball', revenue: '$3.2M', expenses: '$2.4M', netIncome: '+$0.8M', profitable: true },
  { id: 'rs-3', sport: 'Women\'s Basketball', revenue: '$0.9M', expenses: '$1.5M', netIncome: '-$0.6M', profitable: false },
  { id: 'rs-4', sport: 'Baseball', revenue: '$0.4M', expenses: '$0.8M', netIncome: '-$0.4M', profitable: false },
  { id: 'rs-5', sport: 'Softball', revenue: '$0.2M', expenses: '$0.6M', netIncome: '-$0.4M', profitable: false },
  { id: 'rs-6', sport: 'All Other Sports', revenue: '$0.7M', expenses: '$3.5M', netIncome: '-$2.8M', profitable: false },
];

interface FacilityInvestment {
  id: string;
  project: string;
  status: 'completed' | 'in-progress' | 'planned';
  budget: string;
  spent: string;
  completionDate: string;
}

const FACILITY_INVESTMENTS: FacilityInvestment[] = [
  { id: 'fi-1', project: 'Athletic Performance Center', status: 'in-progress', budget: '$12.5M', spent: '$8.2M', completionDate: 'Aug 2026' },
  { id: 'fi-2', project: 'Eagle Stadium West Expansion', status: 'planned', budget: '$22.0M', spent: '$0.0M', completionDate: 'TBD 2027' },
  { id: 'fi-3', project: 'Baseball Clubhouse Renovation', status: 'completed', budget: '$1.8M', spent: '$1.7M', completionDate: 'Jan 2026' },
  { id: 'fi-4', project: 'Arena Scoreboard Upgrade', status: 'completed', budget: '$0.6M', spent: '$0.6M', completionDate: 'Nov 2025' },
  { id: 'fi-5', project: 'Track Resurfacing', status: 'planned', budget: '$0.9M', spent: '$0.0M', completionDate: 'Summer 2026' },
];

const INVEST_STATUS_COLOR: Record<string, string> = {
  completed: '#22C55E',
  'in-progress': '#3B82F6',
  planned: '#F59E0B',
};

// --- Season Highlights (Overview) ---

interface SeasonHighlight {
  id: string;
  headline: string;
  sport: string;
  date: string;
}

const SEASON_HIGHLIGHTS: SeasonHighlight[] = [
  { id: 'sh-1', headline: 'Men\'s Basketball clinches conference tournament berth', sport: 'Men\'s Basketball', date: 'Feb 26' },
  { id: 'sh-2', headline: 'Swimming sets 3 pool records at dual meet', sport: 'Swimming', date: 'Feb 18' },
  { id: 'sh-3', headline: 'Football finishes 9-3, earns bowl selection', sport: 'Football', date: 'Dec 8' },
  { id: 'sh-4', headline: 'Volleyball reaches conference semifinal', sport: 'Volleyball', date: 'Nov 22' },
  { id: 'sh-5', headline: 'Women\'s Soccer posts program-best 14-5-2 season', sport: 'Women\'s Soccer', date: 'Nov 10' },
  { id: 'sh-6', headline: 'Baseball opens season with 8-3 win', sport: 'Baseball', date: 'Feb 21' },
];

// =============================================================================
// SHARED SUB-COMPONENTS
// =============================================================================

function SectionHeader({ title, colors, count }: { title: string; colors: typeof Colors.light; count?: number }) {
  return (
    <View style={sh.headerRow}>
      <ThemedText style={[sh.sectionLabel, { color: colors.textSecondary }]}>{title}</ThemedText>
      {count != null && (
        <View style={[sh.countBadge, { backgroundColor: colors.backgroundTertiary }]}>
          <ThemedText style={[sh.countText, { color: colors.textSecondary }]}>{count}</ThemedText>
        </View>
      )}
    </View>
  );
}

function Card({ colors, children }: { colors: typeof Colors.light; children: React.ReactNode }) {
  return (
    <View style={[sh.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

function KPIBox({ label, value, colors, accent }: { label: string; value: string | number; colors: typeof Colors.light; accent?: string }) {
  return (
    <View style={sh.kpiBox}>
      <ThemedText style={[sh.kpiValue, { color: accent || colors.text }]}>{value}</ThemedText>
      <ThemedText style={[sh.kpiLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

function ProgressBar({ percent, color, colors }: { percent: number; color: string; colors: typeof Colors.light }) {
  return (
    <View style={[sh.progressTrack, { backgroundColor: colors.backgroundTertiary }]}>
      <View style={[sh.progressFill, { width: `${Math.min(percent, 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

function TrendIndicator({ trend, colors }: { trend: 'up' | 'down' | 'stable'; colors: typeof Colors.light }) {
  const icon = trend === 'up' ? 'arrow.up.right' : trend === 'down' ? 'arrow.down.right' : 'arrow.right';
  const color = trend === 'up' ? '#22C55E' : trend === 'down' ? '#EF4444' : colors.textTertiary;
  return <IconSymbol name={icon as any} size={10} color={color} />;
}

const sh = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  sectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  countBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
  countText: { fontSize: 10, fontWeight: '600' },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: StyleSheet.hairlineWidth },
  kpiBox: { alignItems: 'center', flex: 1, paddingVertical: 4 },
  kpiValue: { fontSize: 20, fontWeight: '700' },
  kpiLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2, textAlign: 'center' },
  progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  progressFill: { height: '100%', borderRadius: 2 },
});

// =============================================================================
// VIEW: OVERVIEW
// =============================================================================

function OverviewView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  return (
    <>
      {/* Department KPIs */}
      <View style={s.moduleContainer}>
        <SectionHeader title="ATHLETICS OVERVIEW" colors={colors} />
        <Card colors={colors}>
          <View style={s.deptHeader}>
            <IconSymbol name="sportscourt.fill" size={20} color={colors.text} />
            <ThemedText style={[s.deptTitle, { color: colors.text }]}>Westfield Eagles</ThemedText>
          </View>
          <ThemedText style={[s.deptSubtitle, { color: colors.textSecondary }]}>
            {ATHLETIC_DEPT.conference} {'\u00B7'} {ATHLETIC_DEPT.division}
          </ThemedText>
          <View style={s.kpiRow}>
            <KPIBox label="Sports" value={ATHLETIC_DEPT.totalSports} colors={colors} />
            <KPIBox label="Athletes" value={ATHLETIC_DEPT.studentAthletes} colors={colors} />
            {isDeanLevel(role) && (
              <KPIBox label="Budget" value={ATHLETIC_DEPT.athleticBudget} colors={colors} />
            )}
            <KPIBox label="Compliance" value={ATHLETIC_DEPT.ncaaCompliance === 'Good Standing' ? 'Good' : 'Alert'} colors={colors} accent={ATHLETIC_DEPT.ncaaCompliance === 'Good Standing' ? '#22C55E' : '#EF4444'} />
          </View>
          {isFacultyLevel(role) && (
            <View style={s.deptExtraRow}>
              <ThemedText style={[s.deptExtraText, { color: colors.textSecondary }]}>
                AD: {ATHLETIC_DEPT.athleticDirector} {'\u00B7'} Compliance: {ATHLETIC_DEPT.ncaaCompliance}
              </ThemedText>
            </View>
          )}
        </Card>
      </View>

      {/* Season Highlights */}
      <View style={s.moduleContainer}>
        <SectionHeader title="SEASON HIGHLIGHTS" colors={colors} count={SEASON_HIGHLIGHTS.length} />
        <Card colors={colors}>
          {SEASON_HIGHLIGHTS.map((hl, idx) => (
            <View
              key={hl.id}
              style={[
                s.highlightRow,
                idx < SEASON_HIGHLIGHTS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={s.highlightContent}>
                <ThemedText style={[s.highlightSport, { color: colors.textSecondary }]}>{hl.sport}</ThemedText>
                <ThemedText style={[s.highlightHeadline, { color: colors.text }]}>{hl.headline}</ThemedText>
              </View>
              <ThemedText style={[s.highlightDate, { color: colors.textTertiary }]}>{hl.date}</ThemedText>
            </View>
          ))}
        </Card>
      </View>

      {/* Recent Results Ticker */}
      <View style={s.moduleContainer}>
        <SectionHeader title="RECENT RESULTS" colors={colors} count={RECENT_RESULTS.length} />
        <Card colors={colors}>
          {RECENT_RESULTS.map((result, idx) => (
            <View
              key={result.id}
              style={[
                s.resultRow,
                idx < RECENT_RESULTS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.resultBadge, { backgroundColor: RESULT_COLOR[result.result] + '20' }]}>
                <ThemedText style={[s.resultLetter, { color: RESULT_COLOR[result.result] }]}>{result.result}</ThemedText>
              </View>
              <View style={s.resultContent}>
                <ThemedText style={[s.resultSport, { color: colors.textSecondary }]}>{result.sport}</ThemedText>
                <ThemedText style={[s.resultOpponent, { color: colors.text }]}>
                  vs. {result.opponent} {'\u2014'} {result.score}
                </ThemedText>
                {result.highlights && (
                  <ThemedText style={[s.resultHighlight, { color: colors.textTertiary }]} numberOfLines={1}>
                    {result.highlights}
                  </ThemedText>
                )}
              </View>
              <View style={s.resultRight}>
                <ThemedText style={[s.resultDate, { color: colors.textTertiary }]}>{result.date}</ThemedText>
                {result.attendance != null && (
                  <ThemedText style={[s.resultAttendance, { color: colors.textTertiary }]}>
                    {result.attendance.toLocaleString()}
                  </ThemedText>
                )}
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* Quick Upcoming Games preview */}
      <View style={s.moduleContainer}>
        <SectionHeader title="NEXT UP" colors={colors} count={3} />
        <Card colors={colors}>
          {UPCOMING_GAMES.slice(0, 3).map((game, idx) => (
            <Pressable
              key={game.id}
              style={[
                s.gameRow,
                idx < 2 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={[s.gameDateBox, { backgroundColor: colors.backgroundTertiary }]}>
                <ThemedText style={[s.gameDate, { color: colors.text }]}>{game.date}</ThemedText>
                <ThemedText style={[s.gameTime, { color: colors.textSecondary }]}>{game.time}</ThemedText>
              </View>
              <View style={s.gameContent}>
                <ThemedText style={[s.gameSport, { color: colors.textSecondary }]}>{game.sport}</ThemedText>
                <ThemedText style={[s.gameOpponent, { color: colors.text }]}>
                  vs. {game.opponent}
                </ThemedText>
                <ThemedText style={[s.gameLocation, { color: colors.textTertiary }]}>{game.location}</ThemedText>
              </View>
            </Pressable>
          ))}
        </Card>
      </View>

      {/* Athlete Spotlight (horizontal scroll) */}
      <View style={s.moduleContainer}>
        <SectionHeader title="ATHLETE SPOTLIGHT" colors={colors} count={ATHLETE_SPOTLIGHTS.length} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.spotlightScroll}>
          {ATHLETE_SPOTLIGHTS.map((athlete) => (
            <Pressable
              key={athlete.id}
              style={({ pressed }) => [
                s.spotlightCard,
                { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={[s.spotlightAvatar, { backgroundColor: colors.backgroundTertiary }]}>
                <ThemedText style={[s.spotlightInitials, { color: colors.text }]}>
                  {athlete.name.split(' ').map((n) => n[0]).join('')}
                </ThemedText>
              </View>
              <ThemedText style={[s.spotlightName, { color: colors.text }]} numberOfLines={1}>
                {athlete.name}
              </ThemedText>
              <ThemedText style={[s.spotlightSport, { color: colors.textSecondary }]}>
                {athlete.sport} {'\u00B7'} {athlete.position}
              </ThemedText>
              {athlete.stats && (
                <ThemedText style={[s.spotlightStats, { color: colors.text }]}>{athlete.stats}</ThemedText>
              )}
              <ThemedText style={[s.spotlightAchievement, { color: colors.textSecondary }]} numberOfLines={2}>
                {athlete.achievement}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

// =============================================================================
// VIEW: TEAMS
// =============================================================================

function TeamsView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [filter, setFilter] = useState<'all' | 'in-season' | 'off-season'>('all');

  const filtered = filter === 'all'
    ? ACTIVE_SPORTS
    : ACTIVE_SPORTS.filter((sp) => sp.status === filter);

  return (
    <>
      {/* Sports Programs with filter */}
      <View style={s.moduleContainer}>
        <SectionHeader title="SPORTS PROGRAMS" colors={colors} count={ACTIVE_SPORTS.length} />

        <View style={s.filterRow}>
          {(['all', 'in-season', 'off-season'] as const).map((f) => (
            <Pressable
              key={f}
              style={[s.filterPill, { backgroundColor: filter === f ? colors.text + '15' : 'transparent', borderColor: colors.border }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(f); }}
            >
              <ThemedText style={[s.filterPillText, { color: filter === f ? colors.text : colors.textSecondary }]}>
                {f === 'all' ? 'All' : f === 'in-season' ? 'In Season' : 'Off Season'}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <Card colors={colors}>
          {filtered.map((sport, idx) => (
            <Pressable
              key={sport.id}
              style={[
                s.sportRow,
                idx < filtered.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={s.sportLeft}>
                <View style={s.sportNameRow}>
                  <ThemedText style={[s.sportName, { color: colors.text }]}>
                    {sport.gender !== 'Coed' ? `${sport.gender}'s ` : ''}{sport.name}
                  </ThemedText>
                  {sport.ranking && (
                    <View style={[s.rankBadge, { backgroundColor: '#F59E0B20' }]}>
                      <ThemedText style={[s.rankText, { color: '#F59E0B' }]}>#{sport.ranking}</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText style={[s.sportMeta, { color: colors.textSecondary }]}>
                  {sport.coach} {'\u00B7'} Record: {sport.record}
                </ThemedText>
                {sport.conferenceRecord !== 'N/A' && (
                  <ThemedText style={[s.sportConf, { color: colors.textTertiary }]}>
                    Conference: {sport.conferenceRecord}
                  </ThemedText>
                )}
                {isFacultyLevel(role) && (
                  <ThemedText style={[s.sportExtra, { color: colors.textTertiary }]}>
                    Roster: {sport.rosterSize} {isDeanLevel(role) ? `\u00B7 Scholarships: ${sport.scholarships}` : ''}
                  </ThemedText>
                )}
              </View>
              <View style={s.sportRight}>
                <View style={[s.seasonBadge, { backgroundColor: SEASON_COLOR[sport.season] + '20' }]}>
                  <ThemedText style={[s.seasonText, { color: SEASON_COLOR[sport.season] }]}>
                    {sport.season.toUpperCase()}
                  </ThemedText>
                </View>
                <View style={[s.statusBadge, { backgroundColor: STATUS_COLOR[sport.status] + '20' }]}>
                  <View style={[s.statusDot, { backgroundColor: STATUS_COLOR[sport.status] }]} />
                  <ThemedText style={[s.statusText, { color: STATUS_COLOR[sport.status] }]}>
                    {sport.status.replace('-', ' ')}
                  </ThemedText>
                </View>
              </View>
            </Pressable>
          ))}
        </Card>
      </View>

      {/* Full schedule */}
      <View style={s.moduleContainer}>
        <SectionHeader title="UPCOMING SCHEDULE" colors={colors} count={UPCOMING_GAMES.length} />
        <Card colors={colors}>
          {UPCOMING_GAMES.map((game, idx) => (
            <Pressable
              key={game.id}
              style={[
                s.gameRow,
                idx < UPCOMING_GAMES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={[s.gameDateBox, { backgroundColor: colors.backgroundTertiary }]}>
                <ThemedText style={[s.gameDate, { color: colors.text }]}>{game.date}</ThemedText>
                <ThemedText style={[s.gameTime, { color: colors.textSecondary }]}>{game.time}</ThemedText>
              </View>
              <View style={s.gameContent}>
                <ThemedText style={[s.gameSport, { color: colors.textSecondary }]}>{game.sport}</ThemedText>
                <ThemedText style={[s.gameOpponent, { color: colors.text }]}>
                  vs. {game.opponent}
                </ThemedText>
                <View style={s.gameMetaRow}>
                  <ThemedText style={[s.gameLocation, { color: colors.textTertiary }]}>
                    {game.location}
                  </ThemedText>
                  {game.conferenceGame && (
                    <View style={[s.confBadge, { backgroundColor: '#8B5CF620' }]}>
                      <ThemedText style={[s.confBadgeText, { color: '#8B5CF6' }]}>CONF</ThemedText>
                    </View>
                  )}
                </View>
                <View style={s.gameBadgeRow}>
                  <View style={[s.homeAwayBadge, { backgroundColor: game.homeAway === 'Home' ? '#22C55E20' : game.homeAway === 'Away' ? '#3B82F620' : '#F59E0B20' }]}>
                    <ThemedText style={[s.homeAwayText, { color: game.homeAway === 'Home' ? '#22C55E' : game.homeAway === 'Away' ? '#3B82F6' : '#F59E0B' }]}>
                      {game.homeAway.toUpperCase()}
                    </ThemedText>
                  </View>
                  {game.broadcast && (
                    <View style={[s.broadcastBadge, { backgroundColor: colors.backgroundTertiary }]}>
                      <IconSymbol name="tv.fill" size={9} color={colors.textSecondary} />
                      <ThemedText style={[s.broadcastText, { color: colors.textSecondary }]}>{game.broadcast}</ThemedText>
                    </View>
                  )}
                  {game.ticketsAvailable && (
                    <View style={[s.ticketBadge, { backgroundColor: '#22C55E20' }]}>
                      <ThemedText style={[s.ticketText, { color: '#22C55E' }]}>TICKETS</ThemedText>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          ))}
        </Card>
      </View>

      {/* Recent Results */}
      <View style={s.moduleContainer}>
        <SectionHeader title="RECENT RESULTS" colors={colors} count={RECENT_RESULTS.length} />
        <Card colors={colors}>
          {RECENT_RESULTS.map((result, idx) => (
            <View
              key={result.id}
              style={[
                s.resultRow,
                idx < RECENT_RESULTS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.resultBadge, { backgroundColor: RESULT_COLOR[result.result] + '20' }]}>
                <ThemedText style={[s.resultLetter, { color: RESULT_COLOR[result.result] }]}>{result.result}</ThemedText>
              </View>
              <View style={s.resultContent}>
                <ThemedText style={[s.resultSport, { color: colors.textSecondary }]}>{result.sport}</ThemedText>
                <ThemedText style={[s.resultOpponent, { color: colors.text }]}>
                  vs. {result.opponent} {'\u2014'} {result.score}
                </ThemedText>
                {result.highlights && (
                  <ThemedText style={[s.resultHighlight, { color: colors.textTertiary }]} numberOfLines={1}>
                    {result.highlights}
                  </ThemedText>
                )}
              </View>
              <View style={s.resultRight}>
                <ThemedText style={[s.resultDate, { color: colors.textTertiary }]}>{result.date}</ThemedText>
                {result.attendance != null && (
                  <ThemedText style={[s.resultAttendance, { color: colors.textTertiary }]}>
                    {result.attendance.toLocaleString()}
                  </ThemedText>
                )}
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* Facilities */}
      <View style={s.moduleContainer}>
        <SectionHeader title="ATHLETIC FACILITIES" colors={colors} count={ATHLETIC_FACILITIES.length} />
        <Card colors={colors}>
          {ATHLETIC_FACILITIES.map((fac, idx) => (
            <View
              key={fac.id}
              style={[
                s.facilityRow,
                idx < ATHLETIC_FACILITIES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={s.facilityContent}>
                <View style={s.facilityNameRow}>
                  <ThemedText style={[s.facilityName, { color: colors.text }]}>{fac.name}</ThemedText>
                  <View style={[s.facilityStatusBadge, { backgroundColor: (fac.status === 'operational' ? '#22C55E' : fac.status === 'renovation' ? '#F59E0B' : '#3B82F6') + '20' }]}>
                    <ThemedText style={[s.facilityStatusText, { color: fac.status === 'operational' ? '#22C55E' : fac.status === 'renovation' ? '#F59E0B' : '#3B82F6' }]}>
                      {fac.status.toUpperCase()}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={[s.facilityMeta, { color: colors.textSecondary }]}>
                  {fac.sport} {fac.capacity > 0 ? `\u00B7 Capacity: ${fac.capacity.toLocaleString()}` : ''} {'\u00B7'} Built {fac.yearBuilt}
                </ThemedText>
                <ThemedText style={[s.facilityFeatures, { color: colors.textTertiary }]} numberOfLines={1}>
                  {fac.features.join(' \u00B7 ')}
                </ThemedText>
              </View>
            </View>
          ))}
        </Card>
      </View>
    </>
  );
}

// =============================================================================
// VIEW: ATHLETE SUPPORT
// =============================================================================

function AthleteSupportView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const deptGPA = (GPA_SNAPSHOTS.reduce((sum, g) => sum + g.teamGPA * g.totalAthletes, 0) / GPA_SNAPSHOTS.reduce((sum, g) => sum + g.totalAthletes, 0)).toFixed(2);
  const totalBelow = GPA_SNAPSHOTS.reduce((sum, g) => sum + g.athletesBelow2_5, 0);
  const totalAbove = GPA_SNAPSHOTS.reduce((sum, g) => sum + g.athletesAbove3_5, 0);
  const totalStudyReq = GPA_SNAPSHOTS.reduce((sum, g) => sum + g.studyHallRequired, 0);
  const totalStudyComp = GPA_SNAPSHOTS.reduce((sum, g) => sum + g.studyHallCompliant, 0);

  return (
    <>
      {/* Academic KPIs */}
      <View style={s.moduleContainer}>
        <SectionHeader title="ACADEMIC OVERVIEW" colors={colors} />
        <Card colors={colors}>
          <View style={s.kpiRow}>
            <KPIBox label="Dept GPA" value={deptGPA} colors={colors} accent="#3B82F6" />
            <KPIBox label="Below 2.5" value={totalBelow} colors={colors} accent={totalBelow > 0 ? '#EF4444' : '#22C55E'} />
            <KPIBox label="Above 3.5" value={totalAbove} colors={colors} accent="#22C55E" />
            <KPIBox label="Study Hall %" value={`${totalStudyReq > 0 ? Math.round((totalStudyComp / totalStudyReq) * 100) : 100}%`} colors={colors} accent="#8B5CF6" />
          </View>
        </Card>
      </View>

      {/* GPA by Sport */}
      <View style={s.moduleContainer}>
        <SectionHeader title="GPA BY SPORT" colors={colors} count={GPA_SNAPSHOTS.length} />
        <Card colors={colors}>
          {GPA_SNAPSHOTS.map((gpa, idx) => (
            <View
              key={gpa.sport}
              style={[
                s.gpaRow,
                idx < GPA_SNAPSHOTS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={s.gpaLeft}>
                <ThemedText style={[s.gpaSport, { color: colors.text }]}>{gpa.sport}</ThemedText>
                <ThemedText style={[s.gpaMeta, { color: colors.textSecondary }]}>
                  {gpa.totalAthletes} athletes {'\u00B7'} {gpa.athletesAbove3_5} above 3.5
                  {gpa.athletesBelow2_5 > 0 ? ` \u00B7 ${gpa.athletesBelow2_5} below 2.5` : ''}
                </ThemedText>
                {isDeanLevel(role) && (
                  <ThemedText style={[s.gpaStudyHall, { color: colors.textTertiary }]}>
                    Study hall: {gpa.studyHallCompliant}/{gpa.studyHallRequired} compliant
                  </ThemedText>
                )}
              </View>
              <View style={s.gpaRight}>
                <ThemedText style={[s.gpaValue, { color: gpa.teamGPA >= 3.0 ? '#22C55E' : gpa.teamGPA >= 2.5 ? '#F59E0B' : '#EF4444' }]}>
                  {gpa.teamGPA.toFixed(2)}
                </ThemedText>
                <ProgressBar percent={(gpa.teamGPA / 4.0) * 100} color={gpa.teamGPA >= 3.0 ? '#22C55E' : gpa.teamGPA >= 2.5 ? '#F59E0B' : '#EF4444'} colors={colors} />
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* Support Services */}
      <View style={s.moduleContainer}>
        <SectionHeader title="SUPPORT SERVICES" colors={colors} count={ACADEMIC_SUPPORT_SERVICES.length} />
        <Card colors={colors}>
          {ACADEMIC_SUPPORT_SERVICES.map((svc, idx) => (
            <View
              key={svc.id}
              style={[
                s.serviceRow,
                idx < ACADEMIC_SUPPORT_SERVICES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.serviceTypeBadge, { backgroundColor: SUPPORT_TYPE_COLOR[svc.type] + '20' }]}>
                <ThemedText style={[s.serviceTypeText, { color: SUPPORT_TYPE_COLOR[svc.type] }]}>
                  {svc.type.replace('-', ' ').toUpperCase()}
                </ThemedText>
              </View>
              <View style={s.serviceContent}>
                <ThemedText style={[s.serviceName, { color: colors.text }]}>{svc.name}</ThemedText>
                <ThemedText style={[s.serviceProvider, { color: colors.textSecondary }]}>{svc.provider}</ThemedText>
                <ThemedText style={[s.serviceHours, { color: colors.textTertiary }]}>
                  {svc.hours} {'\u00B7'} {svc.location}
                </ThemedText>
                {isDeanLevel(role) && (
                  <View style={s.serviceUtilRow}>
                    <ThemedText style={[s.serviceUtilLabel, { color: colors.textTertiary }]}>Utilization:</ThemedText>
                    <View style={{ flex: 1 }}>
                      <ProgressBar percent={svc.utilization} color={svc.utilization >= 80 ? '#22C55E' : svc.utilization >= 50 ? '#F59E0B' : '#EF4444'} colors={colors} />
                    </View>
                    <ThemedText style={[s.serviceUtilValue, { color: colors.textSecondary }]}>{svc.utilization}%</ThemedText>
                  </View>
                )}
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* Mental Health Resources */}
      <View style={s.moduleContainer}>
        <SectionHeader title="MENTAL HEALTH & WELLNESS" colors={colors} count={MENTAL_HEALTH_METRICS.length} />
        <Card colors={colors}>
          {MENTAL_HEALTH_METRICS.map((mh, idx) => (
            <View
              key={mh.id}
              style={[
                s.mhRow,
                idx < MENTAL_HEALTH_METRICS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={s.mhContent}>
                <ThemedText style={[s.mhLabel, { color: colors.text }]}>{mh.label}</ThemedText>
              </View>
              <View style={s.mhRight}>
                <ThemedText style={[s.mhMetric, { color: colors.text }]}>{mh.metric}</ThemedText>
                <TrendIndicator trend={mh.trend} colors={colors} />
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* Athlete Spotlights with GPA focus */}
      <View style={s.moduleContainer}>
        <SectionHeader title="ACADEMIC STANDOUTS" colors={colors} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.spotlightScroll}>
          {ATHLETE_SPOTLIGHTS.filter((a) => a.gpa >= 3.5).map((athlete) => (
            <View
              key={athlete.id}
              style={[s.spotlightCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[s.spotlightAvatar, { backgroundColor: colors.backgroundTertiary }]}>
                <ThemedText style={[s.spotlightInitials, { color: colors.text }]}>
                  {athlete.name.split(' ').map((n) => n[0]).join('')}
                </ThemedText>
              </View>
              <ThemedText style={[s.spotlightName, { color: colors.text }]} numberOfLines={1}>
                {athlete.name}
              </ThemedText>
              <ThemedText style={[s.spotlightSport, { color: colors.textSecondary }]}>
                {athlete.sport} {'\u00B7'} {athlete.year}
              </ThemedText>
              <ThemedText style={[s.spotlightStats, { color: '#22C55E' }]}>
                GPA: {athlete.gpa}
              </ThemedText>
              <ThemedText style={[s.spotlightAchievement, { color: colors.textTertiary }]} numberOfLines={1}>
                {athlete.major}
              </ThemedText>
            </View>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

// =============================================================================
// VIEW: COMPLIANCE & ELIGIBILITY
// =============================================================================

function ComplianceView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const totalEligible = ELIGIBILITY_RECORDS.reduce((sum, e) => sum + e.eligible, 0);
  const totalAthletes = ELIGIBILITY_RECORDS.reduce((sum, e) => sum + e.totalAthletes, 0);
  const totalPending = ELIGIBILITY_RECORDS.reduce((sum, e) => sum + e.pending, 0);
  const totalIneligible = ELIGIBILITY_RECORDS.reduce((sum, e) => sum + e.ineligible, 0);

  return (
    <>
      {/* Compliance Dashboard KPIs */}
      <View style={s.moduleContainer}>
        <SectionHeader title="NCAA COMPLIANCE DASHBOARD" colors={colors} />
        <Card colors={colors}>
          <View style={s.kpiRow}>
            <KPIBox label="NCAA Status" value={COMPLIANCE_DASHBOARD.ncaaStatus === 'Good Standing' ? 'Good' : 'Alert'} colors={colors} accent={COMPLIANCE_DASHBOARD.ncaaStatus === 'Good Standing' ? '#22C55E' : '#EF4444'} />
            <KPIBox label="Eligible" value={`${Math.round((totalEligible / totalAthletes) * 100)}%`} colors={colors} accent="#22C55E" />
            <KPIBox label="Pending" value={totalPending} colors={colors} accent="#F59E0B" />
            <KPIBox label="Ineligible" value={totalIneligible} colors={colors} accent={totalIneligible > 0 ? '#EF4444' : '#22C55E'} />
          </View>
          {isDeanLevel(role) && (
            <View style={s.complianceExtraRow}>
              <View style={s.complianceExtraItem}>
                <ThemedText style={[s.complianceExtraLabel, { color: colors.textTertiary }]}>Last Audit</ThemedText>
                <ThemedText style={[s.complianceExtraValue, { color: colors.text }]}>{COMPLIANCE_DASHBOARD.lastAudit} {'\u2014'} {COMPLIANCE_DASHBOARD.auditResult}</ThemedText>
              </View>
              <View style={s.complianceExtraItem}>
                <ThemedText style={[s.complianceExtraLabel, { color: colors.textTertiary }]}>Title IX</ThemedText>
                <ThemedText style={[s.complianceExtraValue, { color: '#22C55E' }]}>{COMPLIANCE_DASHBOARD.titleIXStatus}</ThemedText>
              </View>
              <View style={s.complianceExtraItem}>
                <ThemedText style={[s.complianceExtraLabel, { color: colors.textTertiary }]}>Scholarship Util.</ThemedText>
                <ThemedText style={[s.complianceExtraValue, { color: colors.text }]}>{COMPLIANCE_DASHBOARD.scholarshipUtilization}</ThemedText>
              </View>
              <View style={s.complianceExtraItem}>
                <ThemedText style={[s.complianceExtraLabel, { color: colors.textTertiary }]}>Booster Compliance</ThemedText>
                <ThemedText style={[s.complianceExtraValue, { color: colors.text }]}>{COMPLIANCE_DASHBOARD.boosterComplianceRate}</ThemedText>
              </View>
            </View>
          )}
        </Card>
      </View>

      {/* Eligibility Tracker */}
      <View style={s.moduleContainer}>
        <SectionHeader title="ELIGIBILITY TRACKER" colors={colors} count={ELIGIBILITY_RECORDS.length} />
        <Card colors={colors}>
          {ELIGIBILITY_RECORDS.map((el, idx) => (
            <View
              key={el.id}
              style={[
                s.eligibilityRow,
                idx < ELIGIBILITY_RECORDS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={s.eligibilityLeft}>
                <ThemedText style={[s.eligibilitySport, { color: colors.text }]}>{el.sport}</ThemedText>
                <ThemedText style={[s.eligibilityMeta, { color: colors.textSecondary }]}>
                  {el.eligible}/{el.totalAthletes} eligible
                  {el.pending > 0 ? ` \u00B7 ${el.pending} pending` : ''}
                  {el.ineligible > 0 ? ` \u00B7 ${el.ineligible} ineligible` : ''}
                </ThemedText>
                <View style={s.eligibilityAPRRow}>
                  <ThemedText style={[s.eligibilityAPRLabel, { color: colors.textTertiary }]}>APR: </ThemedText>
                  <ThemedText style={[s.eligibilityAPRValue, { color: el.aprScore >= 980 ? '#22C55E' : el.aprScore >= 960 ? '#F59E0B' : '#EF4444' }]}>
                    {el.aprScore}
                  </ThemedText>
                  <TrendIndicator trend={el.aprTrend} colors={colors} />
                  {isDeanLevel(role) && (
                    <>
                      <ThemedText style={[s.eligibilityAPRLabel, { color: colors.textTertiary }]}>  GSR: </ThemedText>
                      <ThemedText style={[s.eligibilityAPRValue, { color: el.gsr >= 90 ? '#22C55E' : el.gsr >= 75 ? '#F59E0B' : '#EF4444' }]}>
                        {el.gsr}%
                      </ThemedText>
                    </>
                  )}
                </View>
              </View>
              <View style={s.eligibilityRight}>
                <ProgressBar percent={(el.eligible / el.totalAthletes) * 100} color={el.ineligible === 0 ? '#22C55E' : '#F59E0B'} colors={colors} />
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* Scholarship Limits */}
      {isDeanLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="SCHOLARSHIP LIMITS" colors={colors} count={SCHOLARSHIP_LIMITS.length} />
          <Card colors={colors}>
            {SCHOLARSHIP_LIMITS.map((sl, idx) => (
              <View
                key={sl.id}
                style={[
                  s.scholarshipRow,
                  idx < SCHOLARSHIP_LIMITS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={s.scholarshipLeft}>
                  <View style={s.scholarshipNameRow}>
                    <ThemedText style={[s.scholarshipSport, { color: colors.text }]}>{sl.sport}</ThemedText>
                    {sl.equivalencyBased && (
                      <View style={[s.equivBadge, { backgroundColor: '#8B5CF620' }]}>
                        <ThemedText style={[s.equivText, { color: '#8B5CF6' }]}>EQUIV</ThemedText>
                      </View>
                    )}
                  </View>
                  <ThemedText style={[s.scholarshipMeta, { color: colors.textSecondary }]}>
                    {sl.current}/{sl.ncaaMax} used {'\u00B7'} {sl.available} avail
                    {sl.pendingOffers > 0 ? ` \u00B7 ${sl.pendingOffers} pending` : ''}
                  </ThemedText>
                </View>
                <View style={s.scholarshipRight}>
                  <ProgressBar percent={(sl.current / sl.ncaaMax) * 100} color={sl.available === 0 ? '#EF4444' : '#22C55E'} colors={colors} />
                </View>
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* Waivers */}
      <View style={s.moduleContainer}>
        <SectionHeader title="WAIVERS" colors={colors} count={WAIVERS.length} />
        <Card colors={colors}>
          {WAIVERS.map((wv, idx) => (
            <View
              key={wv.id}
              style={[
                s.waiverRow,
                idx < WAIVERS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.waiverStatusBadge, { backgroundColor: WAIVER_STATUS_COLOR[wv.status] + '20' }]}>
                <ThemedText style={[s.waiverStatusText, { color: WAIVER_STATUS_COLOR[wv.status] }]}>
                  {wv.status.toUpperCase()}
                </ThemedText>
              </View>
              <View style={s.waiverContent}>
                <ThemedText style={[s.waiverName, { color: colors.text }]}>{wv.athleteName}</ThemedText>
                <ThemedText style={[s.waiverMeta, { color: colors.textSecondary }]}>
                  {wv.sport} {'\u00B7'} {wv.type}
                </ThemedText>
                <ThemedText style={[s.waiverDate, { color: colors.textTertiary }]}>
                  Submitted: {wv.submittedDate}{wv.resolvedDate ? ` \u00B7 Resolved: ${wv.resolvedDate}` : ''}
                </ThemedText>
              </View>
            </View>
          ))}
        </Card>
      </View>
    </>
  );
}

// =============================================================================
// VIEW: RECRUITING BRIDGE
// =============================================================================

function RecruitingView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const totalCommits = RECRUITING_SUMMARY.reduce((sum, r) => sum + r.commitsThisCycle, 0);
  const totalOffers = RECRUITING_SUMMARY.reduce((sum, r) => sum + r.offersOut, 0);
  const totalVisits = RECRUITING_SUMMARY.reduce((sum, r) => sum + r.visits, 0);
  const totalNLI = RECRUITING_SUMMARY.reduce((sum, r) => sum + (r.nliSigned || 0), 0);

  return (
    <>
      {/* Recruiting KPIs */}
      <View style={s.moduleContainer}>
        <SectionHeader title="RECRUITING PIPELINE" colors={colors} />
        <Card colors={colors}>
          <View style={s.kpiRow}>
            <KPIBox label="Commits" value={totalCommits} colors={colors} accent="#22C55E" />
            <KPIBox label="Offers Out" value={totalOffers} colors={colors} accent="#3B82F6" />
            <KPIBox label="Visits" value={totalVisits} colors={colors} accent="#8B5CF6" />
            <KPIBox label="NLI Signed" value={totalNLI} colors={colors} accent="#F97316" />
          </View>
        </Card>
      </View>

      {/* By Sport */}
      <View style={s.moduleContainer}>
        <SectionHeader title="RECRUITING BY SPORT" colors={colors} count={RECRUITING_SUMMARY.length} />
        <Card colors={colors}>
          {RECRUITING_SUMMARY.map((rec, idx) => (
            <View
              key={rec.sport}
              style={[
                s.recruitRow,
                idx < RECRUITING_SUMMARY.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={s.recruitContent}>
                <View style={s.recruitHeaderRow}>
                  <ThemedText style={[s.recruitSport, { color: colors.text }]}>{rec.sport}</ThemedText>
                  {rec.classRanking && (
                    <View style={[s.classRankBadge, { backgroundColor: '#F59E0B20' }]}>
                      <ThemedText style={[s.classRankText, { color: '#F59E0B' }]}>{rec.classRanking}</ThemedText>
                    </View>
                  )}
                </View>
                <View style={s.recruitStatsRow}>
                  <View style={s.recruitStatItem}>
                    <ThemedText style={[s.recruitStatValue, { color: '#22C55E' }]}>{rec.commitsThisCycle}</ThemedText>
                    <ThemedText style={[s.recruitStatLabel, { color: colors.textTertiary }]}>Commits</ThemedText>
                  </View>
                  <View style={s.recruitStatItem}>
                    <ThemedText style={[s.recruitStatValue, { color: '#3B82F6' }]}>{rec.offersOut}</ThemedText>
                    <ThemedText style={[s.recruitStatLabel, { color: colors.textTertiary }]}>Offers</ThemedText>
                  </View>
                  <View style={s.recruitStatItem}>
                    <ThemedText style={[s.recruitStatValue, { color: '#8B5CF6' }]}>{rec.visits}</ThemedText>
                    <ThemedText style={[s.recruitStatLabel, { color: colors.textTertiary }]}>Visits</ThemedText>
                  </View>
                  <View style={s.recruitStatItem}>
                    <ThemedText style={[s.recruitStatValue, { color: '#F97316' }]}>{rec.nliSigned || 0}</ThemedText>
                    <ThemedText style={[s.recruitStatLabel, { color: colors.textTertiary }]}>NLI</ThemedText>
                  </View>
                </View>
                {rec.topProspect && isDeanLevel(role) && (
                  <ThemedText style={[s.recruitProspect, { color: colors.textTertiary }]}>
                    Top prospect: {rec.topProspect}
                  </ThemedText>
                )}
                <ThemedText style={[s.recruitDeadline, { color: colors.textTertiary }]}>
                  Signing day: {rec.signingDay}
                </ThemedText>
                <ProgressBar percent={(rec.commitsThisCycle / rec.offersOut) * 100} color="#22C55E" colors={colors} />
              </View>
            </View>
          ))}
        </Card>
      </View>
    </>
  );
}

// =============================================================================
// VIEW: BUDGET & RESOURCES
// =============================================================================

function BudgetView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const limitedBudget = !isDeanLevel(role); // E3 gets limited view

  return (
    <>
      {/* Budget Summary */}
      <View style={s.moduleContainer}>
        <SectionHeader title="ATHLETIC BUDGET" colors={colors} />
        <Card colors={colors}>
          <View style={s.kpiRow}>
            <KPIBox label="Total Budget" value={ATHLETIC_DEPT.athleticBudget} colors={colors} accent="#3B82F6" />
            <KPIBox label="Categories" value={BUDGET_CATEGORIES.length} colors={colors} />
            <KPIBox label="Revenue Streams" value={REVENUE_SOURCES.length} colors={colors} />
          </View>
        </Card>
      </View>

      {/* Budget Categories */}
      <View style={s.moduleContainer}>
        <SectionHeader title="BUDGET BREAKDOWN" colors={colors} count={BUDGET_CATEGORIES.length} />
        <Card colors={colors}>
          {BUDGET_CATEGORIES.map((cat, idx) => (
            <View
              key={cat.id}
              style={[
                s.budgetRow,
                idx < BUDGET_CATEGORIES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={s.budgetLeft}>
                <ThemedText style={[s.budgetCategory, { color: colors.text }]}>{cat.category}</ThemedText>
                {!limitedBudget && (
                  <ThemedText style={[s.budgetMeta, { color: colors.textSecondary }]}>
                    Allocated: {cat.allocated} {'\u00B7'} Spent: {cat.spent} {'\u00B7'} Remaining: {cat.remaining}
                  </ThemedText>
                )}
                <ProgressBar
                  percent={cat.percentUsed}
                  color={cat.percentUsed >= 90 ? '#EF4444' : cat.percentUsed >= 70 ? '#F59E0B' : '#22C55E'}
                  colors={colors}
                />
              </View>
              <ThemedText style={[s.budgetPercent, { color: cat.percentUsed >= 90 ? '#EF4444' : cat.percentUsed >= 70 ? '#F59E0B' : '#22C55E' }]}>
                {cat.percentUsed}%
              </ThemedText>
            </View>
          ))}
        </Card>
      </View>

      {/* Revenue Sources */}
      {isDeanLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="REVENUE SOURCES" colors={colors} count={REVENUE_SOURCES.length} />
          <Card colors={colors}>
            {REVENUE_SOURCES.map((rv, idx) => (
              <View
                key={rv.id}
                style={[
                  s.revenueRow,
                  idx < REVENUE_SOURCES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={s.revenueLeft}>
                  <ThemedText style={[s.revenueSource, { color: colors.text }]}>{rv.source}</ThemedText>
                  <ThemedText style={[s.revenueAmount, { color: colors.textSecondary }]}>
                    {rv.amount} ({rv.percentOfTotal}%)
                  </ThemedText>
                  <ProgressBar percent={rv.percentOfTotal * 2.5} color="#3B82F6" colors={colors} />
                </View>
                <TrendIndicator trend={rv.trend} colors={colors} />
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* Revenue by Sport (dean-level) */}
      {isDeanLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="REVENUE BY SPORT" colors={colors} count={REVENUE_BY_SPORT.length} />
          <Card colors={colors}>
            {REVENUE_BY_SPORT.map((rs, idx) => (
              <View
                key={rs.id}
                style={[
                  s.revBySportRow,
                  idx < REVENUE_BY_SPORT.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={s.revBySportLeft}>
                  <ThemedText style={[s.revBySportName, { color: colors.text }]}>{rs.sport}</ThemedText>
                  <ThemedText style={[s.revBySportMeta, { color: colors.textSecondary }]}>
                    Rev: {rs.revenue} {'\u00B7'} Exp: {rs.expenses}
                  </ThemedText>
                </View>
                <ThemedText style={[s.revBySportNet, { color: rs.profitable ? '#22C55E' : '#EF4444' }]}>
                  {rs.netIncome}
                </ThemedText>
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* Facility Investments */}
      <View style={s.moduleContainer}>
        <SectionHeader title="FACILITY INVESTMENTS" colors={colors} count={FACILITY_INVESTMENTS.length} />
        <Card colors={colors}>
          {FACILITY_INVESTMENTS.map((fi, idx) => (
            <View
              key={fi.id}
              style={[
                s.investRow,
                idx < FACILITY_INVESTMENTS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={s.investLeft}>
                <View style={s.investNameRow}>
                  <ThemedText style={[s.investProject, { color: colors.text }]}>{fi.project}</ThemedText>
                  <View style={[s.investStatusBadge, { backgroundColor: INVEST_STATUS_COLOR[fi.status] + '20' }]}>
                    <ThemedText style={[s.investStatusText, { color: INVEST_STATUS_COLOR[fi.status] }]}>
                      {fi.status.replace('-', ' ').toUpperCase()}
                    </ThemedText>
                  </View>
                </View>
                {!limitedBudget && (
                  <ThemedText style={[s.investMeta, { color: colors.textSecondary }]}>
                    Budget: {fi.budget} {'\u00B7'} Spent: {fi.spent} {'\u00B7'} {fi.completionDate}
                  </ThemedText>
                )}
                {limitedBudget && (
                  <ThemedText style={[s.investMeta, { color: colors.textSecondary }]}>
                    Target: {fi.completionDate}
                  </ThemedText>
                )}
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* Equipment + Facilities from existing data */}
      <View style={s.moduleContainer}>
        <SectionHeader title="ATHLETIC FACILITIES" colors={colors} count={ATHLETIC_FACILITIES.length} />
        <Card colors={colors}>
          {ATHLETIC_FACILITIES.map((fac, idx) => (
            <View
              key={fac.id}
              style={[
                s.facilityRow,
                idx < ATHLETIC_FACILITIES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={s.facilityContent}>
                <View style={s.facilityNameRow}>
                  <ThemedText style={[s.facilityName, { color: colors.text }]}>{fac.name}</ThemedText>
                  <View style={[s.facilityStatusBadge, { backgroundColor: (fac.status === 'operational' ? '#22C55E' : fac.status === 'renovation' ? '#F59E0B' : '#3B82F6') + '20' }]}>
                    <ThemedText style={[s.facilityStatusText, { color: fac.status === 'operational' ? '#22C55E' : fac.status === 'renovation' ? '#F59E0B' : '#3B82F6' }]}>
                      {fac.status.toUpperCase()}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={[s.facilityMeta, { color: colors.textSecondary }]}>
                  {fac.sport} {fac.capacity > 0 ? `\u00B7 Capacity: ${fac.capacity.toLocaleString()}` : ''} {'\u00B7'} Built {fac.yearBuilt}
                </ThemedText>
              </View>
            </View>
          ))}
        </Card>
      </View>
    </>
  );
}

// =============================================================================
// PILL TOGGLE
// =============================================================================

function ViewToggle({
  views,
  active,
  onSelect,
  colors,
}: {
  views: ViewDef[];
  active: AthleticsView;
  onSelect: (v: AthleticsView) => void;
  colors: typeof Colors.light;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.toggleRow}
      style={s.toggleScroll}
    >
      {views.map((v) => {
        const isActive = v.id === active;
        return (
          <Pressable
            key={v.id}
            style={[
              s.togglePill,
              {
                backgroundColor: isActive ? colors.text : 'transparent',
                borderColor: isActive ? colors.text : colors.border,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(v.id);
            }}
          >
            <ThemedText
              style={[
                s.togglePillText,
                { color: isActive ? colors.background : colors.textSecondary },
              ]}
            >
              {v.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function EduAthletics({ colors, role = 'E1', onSwitchTab }: Props) {
  const visibleViews = getVisibleViews(role);
  const [activeView, setActiveView] = useState<AthleticsView>(visibleViews[0]?.id ?? 'overview');

  // Ensure active view is valid for current role
  const safeView = visibleViews.find((v) => v.id === activeView) ? activeView : visibleViews[0]?.id ?? 'overview';

  function renderView() {
    switch (safeView) {
      case 'overview':
        return <OverviewView colors={colors} role={role} />;
      case 'teams':
        return <TeamsView colors={colors} role={role} />;
      case 'athlete-support':
        return <AthleteSupportView colors={colors} role={role} />;
      case 'compliance':
        return <ComplianceView colors={colors} role={role} />;
      case 'recruiting':
        return <RecruitingView colors={colors} role={role} />;
      case 'budget':
        return <BudgetView colors={colors} role={role} />;
      default:
        return <OverviewView colors={colors} role={role} />;
    }
  }

  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {visibleViews.length > 1 && (
        <ViewToggle
          views={visibleViews}
          active={safeView}
          onSelect={setActiveView}
          colors={colors}
        />
      )}
      {renderView()}
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

  // Toggle
  toggleScroll: { marginBottom: Spacing.md },
  toggleRow: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: 2, paddingHorizontal: 2 },
  togglePill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: BorderRadius.full, borderWidth: StyleSheet.hairlineWidth },
  togglePillText: { fontSize: 12, fontWeight: '600' },

  // Dept overview
  deptHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  deptTitle: { fontSize: 18, fontWeight: '700' },
  deptSubtitle: { fontSize: 13, marginBottom: Spacing.md },
  kpiRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  deptExtraRow: { marginTop: Spacing.sm },
  deptExtraText: { fontSize: 12 },

  // Highlights
  highlightRow: { flexDirection: 'row', paddingVertical: 10, gap: Spacing.sm },
  highlightContent: { flex: 1 },
  highlightSport: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 2 },
  highlightHeadline: { fontSize: 13, fontWeight: '600' },
  highlightDate: { fontSize: 11, alignSelf: 'flex-start' },

  // Filters
  filterRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  filterPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: StyleSheet.hairlineWidth },
  filterPillText: { fontSize: 12, fontWeight: '600' },

  // Sports
  sportRow: { flexDirection: 'row', paddingVertical: 10, gap: Spacing.sm },
  sportLeft: { flex: 1 },
  sportNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  sportName: { fontSize: 14, fontWeight: '600' },
  rankBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm },
  rankText: { fontSize: 10, fontWeight: '700' },
  sportMeta: { fontSize: 12, marginBottom: 1 },
  sportConf: { fontSize: 11 },
  sportExtra: { fontSize: 10, marginTop: 2 },
  sportRight: { alignItems: 'flex-end', gap: 4 },
  seasonBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm },
  seasonText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 9, fontWeight: '600', textTransform: 'capitalize' },

  // Games
  gameRow: { flexDirection: 'row', paddingVertical: 10, gap: Spacing.sm },
  gameDateBox: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: BorderRadius.sm, alignItems: 'center', minWidth: 55 },
  gameDate: { fontSize: 11, fontWeight: '700' },
  gameTime: { fontSize: 10, marginTop: 1 },
  gameContent: { flex: 1 },
  gameSport: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 2 },
  gameOpponent: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  gameMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  gameLocation: { fontSize: 11, flex: 1 },
  confBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: BorderRadius.sm },
  confBadgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },
  gameBadgeRow: { flexDirection: 'row', gap: 4 },
  homeAwayBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm },
  homeAwayText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  broadcastBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm },
  broadcastText: { fontSize: 9, fontWeight: '600' },
  ticketBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm },
  ticketText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // Results
  resultRow: { flexDirection: 'row', paddingVertical: 10, gap: Spacing.sm },
  resultBadge: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  resultLetter: { fontSize: 16, fontWeight: '800' },
  resultContent: { flex: 1 },
  resultSport: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 1 },
  resultOpponent: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  resultHighlight: { fontSize: 11 },
  resultRight: { alignItems: 'flex-end' },
  resultDate: { fontSize: 11 },
  resultAttendance: { fontSize: 10, marginTop: 2 },

  // Spotlight
  spotlightScroll: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: 2 },
  spotlightCard: { width: 160, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: StyleSheet.hairlineWidth, gap: 4 },
  spotlightAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  spotlightInitials: { fontSize: 16, fontWeight: '700' },
  spotlightName: { fontSize: 13, fontWeight: '700' },
  spotlightSport: { fontSize: 11 },
  spotlightStats: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  spotlightAchievement: { fontSize: 10, lineHeight: 14 },

  // Facilities
  facilityRow: { paddingVertical: 10 },
  facilityContent: {},
  facilityNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  facilityName: { fontSize: 14, fontWeight: '600', flex: 1 },
  facilityStatusBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm },
  facilityStatusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  facilityMeta: { fontSize: 12, marginBottom: 2 },
  facilityFeatures: { fontSize: 11 },

  // Recruiting
  recruitRow: { paddingVertical: 12 },
  recruitContent: { flex: 1 },
  recruitHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  recruitSport: { fontSize: 14, fontWeight: '600' },
  classRankBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm },
  classRankText: { fontSize: 9, fontWeight: '700' },
  recruitStatsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: 4 },
  recruitStatItem: { alignItems: 'center' },
  recruitStatValue: { fontSize: 16, fontWeight: '700' },
  recruitStatLabel: { fontSize: 9, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3 },
  recruitMeta: { fontSize: 12 },
  recruitProspect: { fontSize: 11, marginTop: 4 },
  recruitDeadline: { fontSize: 10, marginTop: 2 },

  // GPA
  gpaRow: { flexDirection: 'row', paddingVertical: 10, gap: Spacing.sm },
  gpaLeft: { flex: 1 },
  gpaSport: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  gpaMeta: { fontSize: 11 },
  gpaStudyHall: { fontSize: 10, marginTop: 2 },
  gpaRight: { width: 60, alignItems: 'flex-end', justifyContent: 'center' },
  gpaValue: { fontSize: 16, fontWeight: '700' },

  // Support Services
  serviceRow: { paddingVertical: 10, gap: 4 },
  serviceTypeBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm, alignSelf: 'flex-start' },
  serviceTypeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },
  serviceContent: {},
  serviceName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  serviceProvider: { fontSize: 12 },
  serviceHours: { fontSize: 11, marginTop: 2 },
  serviceUtilRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  serviceUtilLabel: { fontSize: 10 },
  serviceUtilValue: { fontSize: 10, fontWeight: '600', width: 30, textAlign: 'right' },

  // Mental Health
  mhRow: { flexDirection: 'row', paddingVertical: 10, gap: Spacing.sm },
  mhContent: { flex: 1 },
  mhLabel: { fontSize: 13, fontWeight: '600' },
  mhRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mhMetric: { fontSize: 12, fontWeight: '600' },

  // Compliance
  complianceExtraRow: { marginTop: Spacing.sm, gap: 6 },
  complianceExtraItem: { flexDirection: 'row', justifyContent: 'space-between' },
  complianceExtraLabel: { fontSize: 11 },
  complianceExtraValue: { fontSize: 11, fontWeight: '600' },

  // Eligibility
  eligibilityRow: { flexDirection: 'row', paddingVertical: 10, gap: Spacing.sm },
  eligibilityLeft: { flex: 1 },
  eligibilitySport: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  eligibilityMeta: { fontSize: 11 },
  eligibilityAPRRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  eligibilityAPRLabel: { fontSize: 10 },
  eligibilityAPRValue: { fontSize: 11, fontWeight: '700' },
  eligibilityRight: { width: 80, justifyContent: 'center' },

  // Scholarship Limits
  scholarshipRow: { flexDirection: 'row', paddingVertical: 10, gap: Spacing.sm },
  scholarshipLeft: { flex: 1 },
  scholarshipNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  scholarshipSport: { fontSize: 14, fontWeight: '600' },
  equivBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: BorderRadius.sm },
  equivText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },
  scholarshipMeta: { fontSize: 11 },
  scholarshipRight: { width: 80, justifyContent: 'center' },

  // Waivers
  waiverRow: { flexDirection: 'row', paddingVertical: 10, gap: Spacing.sm },
  waiverStatusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm, alignSelf: 'flex-start' },
  waiverStatusText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },
  waiverContent: { flex: 1 },
  waiverName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  waiverMeta: { fontSize: 12 },
  waiverDate: { fontSize: 10, marginTop: 2 },

  // Budget
  budgetRow: { flexDirection: 'row', paddingVertical: 10, gap: Spacing.sm, alignItems: 'center' },
  budgetLeft: { flex: 1 },
  budgetCategory: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  budgetMeta: { fontSize: 11, marginBottom: 2 },
  budgetPercent: { fontSize: 13, fontWeight: '700', width: 40, textAlign: 'right' },

  // Revenue Sources
  revenueRow: { flexDirection: 'row', paddingVertical: 10, gap: Spacing.sm, alignItems: 'center' },
  revenueLeft: { flex: 1 },
  revenueSource: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  revenueAmount: { fontSize: 11 },

  // Revenue by Sport
  revBySportRow: { flexDirection: 'row', paddingVertical: 10, gap: Spacing.sm, alignItems: 'center' },
  revBySportLeft: { flex: 1 },
  revBySportName: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  revBySportMeta: { fontSize: 11 },
  revBySportNet: { fontSize: 13, fontWeight: '700' },

  // Facility Investments
  investRow: { paddingVertical: 10 },
  investLeft: { flex: 1 },
  investNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  investProject: { fontSize: 13, fontWeight: '600', flex: 1 },
  investStatusBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm },
  investStatusText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },
  investMeta: { fontSize: 11 },
});
