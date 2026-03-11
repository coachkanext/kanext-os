/**
 * Mock data for Admissions screen — 3 pages: Enrollment, Discover, Applications.
 * Education mode enrollment management (replaces Naviance/Slate/Ellucian).
 * Admin/director view — student view is an RBAC-gated subset.
 */

// ─── Shared Types ──────────────────────────────────────────────────────────

export type EnrollmentStage =
  | 'Prospect'
  | 'Inquiry'
  | 'Applied'
  | 'Under Review'
  | 'Admitted'
  | 'Deposited'
  | 'Enrolled';

export type ApplicationType = 'early-decision' | 'early-action' | 'regular' | 'transfer' | 'international';
export type ReviewStatus = 'unread' | 'in-review' | 'scored' | 'decision-ready' | 'decided';
export type Decision = 'accepted' | 'denied' | 'waitlisted' | 'deferred';
export type ApplicantFlag = 'first-gen' | 'legacy' | 'athlete' | 'scholarship' | 'international' | 'transfer' | 'underrepresented';
export type EngagementLevel = 'hot' | 'warm' | 'cold';
export type ProspectSource = 'campus-visit' | 'college-fair' | 'website' | 'referral' | 'social-media' | 'purchased-list';

// ─── Enrollment (Page 0) ──────────────────────────────────────────────────

export interface EnrollmentSummary {
  totalProspects: number;
  totalApplicants: number;
  totalAdmitted: number;
  totalEnrolled: number;
  yieldRate: number;
  lastCycleYieldRate: number;
}

export interface ApplicantCard {
  id: string;
  name: string;
  initials: string;
  intendedMajor: string;
  location: string;
  applicationType: ApplicationType;
  gpa: number;
  testScore: number | null;
  financialAidStatus: 'none' | 'pending' | 'awarded';
  lastInteraction: string;
  flags: ApplicantFlag[];
  stage: EnrollmentStage;
}

export const ENROLLMENT_STAGES: { stage: EnrollmentStage; color: string }[] = [
  { stage: 'Prospect',     color: '#6B7280' },
  { stage: 'Inquiry',      color: '#3B82F6' },
  { stage: 'Applied',      color: '#8B5CF6' },
  { stage: 'Under Review', color: '#F59E0B' },
  { stage: 'Admitted',     color: '#22C55E' },
  { stage: 'Deposited',    color: '#10B981' },
  { stage: 'Enrolled',     color: '#14B8A6' },
];

export const ENROLLMENT_SUMMARY: EnrollmentSummary = {
  totalProspects: 842,
  totalApplicants: 312,
  totalAdmitted: 198,
  totalEnrolled: 145,
  yieldRate: 73,
  lastCycleYieldRate: 68,
};

const APPLICANTS: ApplicantCard[] = [
  // Prospect (3)
  { id: 'ap1',  name: 'Maya Johnson',     initials: 'MJ', intendedMajor: 'Computer Science',   location: 'Atlanta, GA',       applicationType: 'regular',       gpa: 3.85, testScore: 1380, financialAidStatus: 'none',    lastInteraction: '2h ago',  flags: ['first-gen'],                        stage: 'Prospect' },
  { id: 'ap2',  name: 'Ethan Brooks',     initials: 'EB', intendedMajor: 'Business Admin',     location: 'Chicago, IL',       applicationType: 'regular',       gpa: 3.62, testScore: 1290, financialAidStatus: 'none',    lastInteraction: '1d ago',  flags: [],                                   stage: 'Prospect' },
  { id: 'ap3',  name: 'Aisha Patel',      initials: 'AP', intendedMajor: 'Biology',            location: 'Houston, TX',       applicationType: 'early-action',  gpa: 3.91, testScore: 1420, financialAidStatus: 'none',    lastInteraction: '3d ago',  flags: ['scholarship'],                      stage: 'Prospect' },

  // Inquiry (4)
  { id: 'ap4',  name: 'Carlos Rivera',    initials: 'CR', intendedMajor: 'Engineering',        location: 'Miami, FL',         applicationType: 'regular',       gpa: 3.74, testScore: 1350, financialAidStatus: 'none',    lastInteraction: '4h ago',  flags: ['first-gen', 'underrepresented'],    stage: 'Inquiry' },
  { id: 'ap5',  name: 'Sophie Kim',       initials: 'SK', intendedMajor: 'Nursing',            location: 'Seattle, WA',       applicationType: 'regular',       gpa: 3.88, testScore: null,  financialAidStatus: 'none',    lastInteraction: '1d ago',  flags: [],                                   stage: 'Inquiry' },
  { id: 'ap6',  name: 'Daniel Okafor',    initials: 'DO', intendedMajor: 'Psychology',         location: 'Dallas, TX',        applicationType: 'transfer',      gpa: 3.45, testScore: 1260, financialAidStatus: 'pending', lastInteraction: '6h ago',  flags: ['transfer'],                         stage: 'Inquiry' },
  { id: 'ap7',  name: 'Hannah Lee',       initials: 'HL', intendedMajor: 'Education',          location: 'Portland, OR',      applicationType: 'regular',       gpa: 3.69, testScore: 1310, financialAidStatus: 'none',    lastInteraction: '2d ago',  flags: ['legacy'],                           stage: 'Inquiry' },

  // Applied (4)
  { id: 'ap8',  name: 'Marcus Chen',      initials: 'MC', intendedMajor: 'Computer Science',   location: 'San Francisco, CA', applicationType: 'early-decision', gpa: 3.95, testScore: 1490, financialAidStatus: 'pending', lastInteraction: '1h ago',  flags: ['scholarship'],                      stage: 'Applied' },
  { id: 'ap9',  name: 'Olivia Washington', initials: 'OW', intendedMajor: 'Pre-Med',          location: 'Boston, MA',        applicationType: 'early-action',  gpa: 3.82, testScore: 1400, financialAidStatus: 'pending', lastInteraction: '3h ago',  flags: ['first-gen', 'athlete'],             stage: 'Applied' },
  { id: 'ap10', name: 'Liam Fernandez',   initials: 'LF', intendedMajor: 'Political Science',  location: 'Phoenix, AZ',       applicationType: 'regular',       gpa: 3.58, testScore: 1280, financialAidStatus: 'none',    lastInteraction: '1d ago',  flags: [],                                   stage: 'Applied' },
  { id: 'ap11', name: 'Priya Gupta',      initials: 'PG', intendedMajor: 'Data Science',       location: 'New York, NY',      applicationType: 'international', gpa: 3.92, testScore: 1460, financialAidStatus: 'pending', lastInteraction: '5h ago',  flags: ['international', 'scholarship'],     stage: 'Applied' },

  // Under Review (3)
  { id: 'ap12', name: 'Jackson White',    initials: 'JW', intendedMajor: 'Finance',            location: 'Denver, CO',        applicationType: 'early-decision', gpa: 3.78, testScore: 1370, financialAidStatus: 'pending', lastInteraction: '2h ago',  flags: ['legacy'],                           stage: 'Under Review' },
  { id: 'ap13', name: 'Emma Nakamura',    initials: 'EN', intendedMajor: 'Art History',        location: 'Los Angeles, CA',   applicationType: 'regular',       gpa: 3.67, testScore: 1320, financialAidStatus: 'none',    lastInteraction: '4h ago',  flags: [],                                   stage: 'Under Review' },
  { id: 'ap14', name: 'Noah Adams',       initials: 'NA', intendedMajor: 'Mechanical Eng.',    location: 'Detroit, MI',       applicationType: 'transfer',      gpa: 3.71, testScore: 1340, financialAidStatus: 'pending', lastInteraction: '1d ago',  flags: ['transfer', 'athlete'],              stage: 'Under Review' },

  // Admitted (3)
  { id: 'ap15', name: 'Zoe Martinez',     initials: 'ZM', intendedMajor: 'Journalism',         location: 'Austin, TX',        applicationType: 'early-action',  gpa: 3.83, testScore: 1390, financialAidStatus: 'awarded', lastInteraction: '6h ago',  flags: ['first-gen', 'scholarship'],         stage: 'Admitted' },
  { id: 'ap16', name: 'Ryan Park',        initials: 'RP', intendedMajor: 'Chemistry',          location: 'Minneapolis, MN',   applicationType: 'regular',       gpa: 3.90, testScore: 1440, financialAidStatus: 'awarded', lastInteraction: '1d ago',  flags: [],                                   stage: 'Admitted' },
  { id: 'ap17', name: 'Isabella Torres',  initials: 'IT', intendedMajor: 'Marketing',          location: 'San Diego, CA',     applicationType: 'regular',       gpa: 3.55, testScore: 1270, financialAidStatus: 'pending', lastInteraction: '2d ago',  flags: ['underrepresented'],                 stage: 'Admitted' },

  // Deposited (2)
  { id: 'ap18', name: 'Tyler Robinson',   initials: 'TR', intendedMajor: 'Computer Science',   location: 'Raleigh, NC',       applicationType: 'early-decision', gpa: 3.97, testScore: 1500, financialAidStatus: 'awarded', lastInteraction: '3h ago',  flags: ['scholarship'],                      stage: 'Deposited' },
  { id: 'ap19', name: 'Grace Yamamoto',   initials: 'GY', intendedMajor: 'Biology',            location: 'Honolulu, HI',      applicationType: 'regular',       gpa: 3.86, testScore: 1410, financialAidStatus: 'awarded', lastInteraction: '1d ago',  flags: ['legacy'],                           stage: 'Deposited' },

  // Enrolled (2)
  { id: 'ap20', name: 'Alex Dubois',      initials: 'AD', intendedMajor: 'Business Admin',     location: 'Nashville, TN',     applicationType: 'early-action',  gpa: 3.79, testScore: 1360, financialAidStatus: 'awarded', lastInteraction: 'Today',   flags: ['first-gen'],                        stage: 'Enrolled' },
  { id: 'ap21', name: 'Mia Sullivan',     initials: 'MS', intendedMajor: 'Nursing',            location: 'Columbus, OH',      applicationType: 'regular',       gpa: 3.94, testScore: 1470, financialAidStatus: 'awarded', lastInteraction: 'Today',   flags: ['scholarship', 'athlete'],           stage: 'Enrolled' },
];

export function getApplicantsByStage(stage: EnrollmentStage): ApplicantCard[] {
  return APPLICANTS.filter((a) => a.stage === stage).sort((a, b) => b.gpa - a.gpa);
}

export function getStageConversion(stageIndex: number): number | null {
  if (stageIndex === 0) return null;
  const prevStage = ENROLLMENT_STAGES[stageIndex - 1].stage;
  const currStage = ENROLLMENT_STAGES[stageIndex].stage;
  const prevCount = APPLICANTS.filter((a) => a.stage === prevStage).length;
  const currCount = APPLICANTS.filter((a) => a.stage === currStage).length;
  if (prevCount === 0) return null;
  return Math.round((currCount / prevCount) * 100);
}

// ─── Discover (Page 1) ───────────────────────────────────────────────────

export type ProspectFilter = 'all' | 'highGpa' | 'scholarship' | 'athlete' | 'firstGen' | 'international';
export type ProspectSort = 'name' | 'gpa' | 'engagement' | 'location' | 'intendedMajor';

export interface ProspectItem {
  id: string;
  name: string;
  initials: string;
  highSchool: string;
  location: string;
  gpa: number;
  testScore: number | null;
  intendedMajor: string;
  engagementLevel: EngagementLevel;
  source: ProspectSource;
  lastInteraction: string;
  eventsAttended: number;
  flags: ApplicantFlag[];
}

const PROSPECTS: ProspectItem[] = [
  { id: 'pr1',  name: 'Jaylen Carter',    initials: 'JC', highSchool: 'Lincoln Prep',         location: 'Atlanta, GA',       gpa: 3.92, testScore: 1440, intendedMajor: 'Computer Science',  engagementLevel: 'hot',  source: 'campus-visit',   lastInteraction: '1h ago',  eventsAttended: 4, flags: ['first-gen'] },
  { id: 'pr2',  name: 'Sofia Reyes',      initials: 'SR', highSchool: 'Westlake Academy',     location: 'Dallas, TX',        gpa: 3.87, testScore: 1400, intendedMajor: 'Pre-Med',           engagementLevel: 'hot',  source: 'campus-visit',   lastInteraction: '2h ago',  eventsAttended: 3, flags: ['scholarship'] },
  { id: 'pr3',  name: 'Kevin Nguyen',     initials: 'KN', highSchool: 'Thomas Jefferson HS',  location: 'Washington, DC',    gpa: 3.98, testScore: 1520, intendedMajor: 'Data Science',      engagementLevel: 'hot',  source: 'college-fair',   lastInteraction: '3h ago',  eventsAttended: 2, flags: ['scholarship'] },
  { id: 'pr4',  name: 'Amara Williams',   initials: 'AW', highSchool: 'Cass Technical HS',    location: 'Detroit, MI',       gpa: 3.76, testScore: 1350, intendedMajor: 'Engineering',       engagementLevel: 'warm', source: 'college-fair',   lastInteraction: '1d ago',  eventsAttended: 2, flags: ['first-gen', 'underrepresented'] },
  { id: 'pr5',  name: 'Lucas Anderson',   initials: 'LA', highSchool: 'Brookfield Central',   location: 'Milwaukee, WI',     gpa: 3.65, testScore: 1290, intendedMajor: 'Business Admin',    engagementLevel: 'warm', source: 'website',        lastInteraction: '2d ago',  eventsAttended: 1, flags: ['athlete'] },
  { id: 'pr6',  name: 'Fatima Hassan',    initials: 'FH', highSchool: 'Whitney Young HS',     location: 'Chicago, IL',       gpa: 3.89, testScore: 1410, intendedMajor: 'International Rel', engagementLevel: 'hot',  source: 'referral',       lastInteraction: '4h ago',  eventsAttended: 3, flags: ['international'] },
  { id: 'pr7',  name: 'Dylan Cooper',     initials: 'DC', highSchool: 'Phillips Academy',     location: 'Andover, MA',       gpa: 3.94, testScore: 1480, intendedMajor: 'Economics',         engagementLevel: 'warm', source: 'campus-visit',   lastInteraction: '1d ago',  eventsAttended: 1, flags: ['legacy'] },
  { id: 'pr8',  name: 'Jade Thompson',    initials: 'JT', highSchool: 'Oak Park HS',          location: 'Sacramento, CA',    gpa: 3.72, testScore: null,  intendedMajor: 'Psychology',        engagementLevel: 'cold', source: 'purchased-list', lastInteraction: '5d ago',  eventsAttended: 0, flags: [] },
  { id: 'pr9',  name: 'Mateo Garcia',     initials: 'MG', highSchool: 'Coral Gables Senior',  location: 'Miami, FL',         gpa: 3.81, testScore: 1370, intendedMajor: 'Architecture',      engagementLevel: 'warm', source: 'social-media',   lastInteraction: '3d ago',  eventsAttended: 1, flags: ['first-gen'] },
  { id: 'pr10', name: 'Chloe Bennett',    initials: 'CB', highSchool: 'Magnet HS of Science', location: 'New York, NY',      gpa: 3.96, testScore: 1500, intendedMajor: 'Neuroscience',      engagementLevel: 'hot',  source: 'campus-visit',   lastInteraction: '6h ago',  eventsAttended: 5, flags: ['scholarship'] },
  { id: 'pr11', name: 'Isaiah Brown',     initials: 'IB', highSchool: 'Central HS',           location: 'Memphis, TN',       gpa: 3.58, testScore: 1240, intendedMajor: 'Criminal Justice',  engagementLevel: 'cold', source: 'college-fair',   lastInteraction: '1w ago',  eventsAttended: 1, flags: ['first-gen', 'athlete'] },
  { id: 'pr12', name: 'Ava Mitchell',     initials: 'AM', highSchool: 'Woodward Academy',     location: 'College Park, GA',  gpa: 3.84, testScore: 1390, intendedMajor: 'Journalism',        engagementLevel: 'warm', source: 'referral',       lastInteraction: '2d ago',  eventsAttended: 2, flags: [] },
  { id: 'pr13', name: 'Wei Zhang',        initials: 'WZ', highSchool: 'International School', location: 'Shanghai, China',   gpa: 3.91, testScore: 1450, intendedMajor: 'Finance',           engagementLevel: 'warm', source: 'college-fair',   lastInteraction: '4d ago',  eventsAttended: 1, flags: ['international'] },
  { id: 'pr14', name: 'Nadia Petrov',     initials: 'NP', highSchool: 'Stuyvesant HS',        location: 'Brooklyn, NY',      gpa: 3.88, testScore: 1430, intendedMajor: 'Computer Eng.',     engagementLevel: 'hot',  source: 'website',        lastInteraction: '5h ago',  eventsAttended: 3, flags: ['scholarship'] },
  { id: 'pr15', name: 'Jordan Taylor',    initials: 'JT', highSchool: 'Lakeside School',      location: 'Seattle, WA',       gpa: 3.70, testScore: 1310, intendedMajor: 'Environmental Sci', engagementLevel: 'cold', source: 'purchased-list', lastInteraction: '1w ago',  eventsAttended: 0, flags: [] },
  { id: 'pr16', name: 'Aaliyah Jackson',  initials: 'AJ', highSchool: 'DuVal HS',             location: 'Lanham, MD',        gpa: 3.77, testScore: 1340, intendedMajor: 'Nursing',           engagementLevel: 'warm', source: 'campus-visit',   lastInteraction: '3d ago',  eventsAttended: 2, flags: ['first-gen', 'underrepresented'] },
  { id: 'pr17', name: 'Elijah Moore',     initials: 'EM', highSchool: 'St. Ignatius Prep',    location: 'San Francisco, CA', gpa: 3.93, testScore: 1460, intendedMajor: 'Biology',           engagementLevel: 'hot',  source: 'referral',       lastInteraction: '2h ago',  eventsAttended: 4, flags: ['legacy'] },
  { id: 'pr18', name: 'Lily Huang',       initials: 'LH', highSchool: 'Taipei American Sch',  location: 'Taipei, Taiwan',    gpa: 3.85, testScore: 1420, intendedMajor: 'Chemistry',         engagementLevel: 'cold', source: 'college-fair',   lastInteraction: '6d ago',  eventsAttended: 1, flags: ['international'] },
];

const ENGAGEMENT_ORDER: Record<EngagementLevel, number> = { hot: 0, warm: 1, cold: 2 };

export function getProspects(filter: ProspectFilter, sort: ProspectSort): ProspectItem[] {
  let list: ProspectItem[];

  switch (filter) {
    case 'highGpa':
      list = PROSPECTS.filter((p) => p.gpa >= 3.85);
      break;
    case 'scholarship':
      list = PROSPECTS.filter((p) => p.flags.includes('scholarship'));
      break;
    case 'athlete':
      list = PROSPECTS.filter((p) => p.flags.includes('athlete'));
      break;
    case 'firstGen':
      list = PROSPECTS.filter((p) => p.flags.includes('first-gen'));
      break;
    case 'international':
      list = PROSPECTS.filter((p) => p.flags.includes('international'));
      break;
    default:
      list = [...PROSPECTS];
  }

  list.sort((a, b) => {
    switch (sort) {
      case 'name':          return a.name.localeCompare(b.name);
      case 'gpa':           return b.gpa - a.gpa;
      case 'engagement':    return ENGAGEMENT_ORDER[a.engagementLevel] - ENGAGEMENT_ORDER[b.engagementLevel];
      case 'location':      return a.location.localeCompare(b.location);
      case 'intendedMajor': return a.intendedMajor.localeCompare(b.intendedMajor);
      default:              return 0;
    }
  });

  return list;
}

// ─── Applications (Page 2) ───────────────────────────────────────────────

export type AppFilter = 'all' | 'unreviewed' | 'inReview' | 'decisionReady' | 'decided';

export interface ApplicationItem {
  id: string;
  studentName: string;
  studentInitials: string;
  program: string;
  applicationType: ApplicationType;
  submissionDate: string;
  completeness: number;
  missingItems: string[];
  reviewerName: string | null;
  reviewStatus: ReviewStatus;
  decision?: Decision;
  financialAidAmount?: number;
}

const APPLICATIONS: ApplicationItem[] = [
  { id: 'app1',  studentName: 'Marcus Chen',       studentInitials: 'MC', program: 'Computer Science',  applicationType: 'early-decision',  submissionDate: 'Nov 1',   completeness: 100, missingItems: [],                          reviewerName: 'Dr. Harper',  reviewStatus: 'decision-ready' },
  { id: 'app2',  studentName: 'Olivia Washington', studentInitials: 'OW', program: 'Pre-Med',           applicationType: 'early-action',    submissionDate: 'Nov 15',  completeness: 100, missingItems: [],                          reviewerName: 'Dr. Collins', reviewStatus: 'scored' },
  { id: 'app3',  studentName: 'Priya Gupta',       studentInitials: 'PG', program: 'Data Science',      applicationType: 'international',   submissionDate: 'Dec 1',   completeness: 95,  missingItems: ['TOEFL Score'],            reviewerName: 'Dr. Harper',  reviewStatus: 'in-review' },
  { id: 'app4',  studentName: 'Liam Fernandez',    studentInitials: 'LF', program: 'Political Science', applicationType: 'regular',         submissionDate: 'Jan 5',   completeness: 100, missingItems: [],                          reviewerName: null,          reviewStatus: 'unread' },
  { id: 'app5',  studentName: 'Jackson White',     studentInitials: 'JW', program: 'Finance',           applicationType: 'early-decision',  submissionDate: 'Nov 1',   completeness: 100, missingItems: [],                          reviewerName: 'Dr. Patel',   reviewStatus: 'scored',         decision: 'accepted',   financialAidAmount: 15000 },
  { id: 'app6',  studentName: 'Emma Nakamura',     studentInitials: 'EN', program: 'Art History',       applicationType: 'regular',         submissionDate: 'Jan 12',  completeness: 90,  missingItems: ['Portfolio'],               reviewerName: 'Prof. Lane',  reviewStatus: 'in-review' },
  { id: 'app7',  studentName: 'Noah Adams',        studentInitials: 'NA', program: 'Mechanical Eng.',   applicationType: 'transfer',        submissionDate: 'Feb 1',   completeness: 85,  missingItems: ['Transcript', 'Rec Letter'], reviewerName: null,          reviewStatus: 'unread' },
  { id: 'app8',  studentName: 'Zoe Martinez',      studentInitials: 'ZM', program: 'Journalism',        applicationType: 'early-action',    submissionDate: 'Nov 15',  completeness: 100, missingItems: [],                          reviewerName: 'Dr. Collins', reviewStatus: 'decided',        decision: 'accepted',   financialAidAmount: 22000 },
  { id: 'app9',  studentName: 'Ryan Park',         studentInitials: 'RP', program: 'Chemistry',         applicationType: 'regular',         submissionDate: 'Jan 8',   completeness: 100, missingItems: [],                          reviewerName: 'Dr. Patel',   reviewStatus: 'decided',        decision: 'accepted',   financialAidAmount: 18000 },
  { id: 'app10', studentName: 'Isabella Torres',   studentInitials: 'IT', program: 'Marketing',         applicationType: 'regular',         submissionDate: 'Jan 15',  completeness: 100, missingItems: [],                          reviewerName: 'Prof. Lane',  reviewStatus: 'decided',        decision: 'waitlisted' },
  { id: 'app11', studentName: 'Tyler Robinson',    studentInitials: 'TR', program: 'Computer Science',  applicationType: 'early-decision',  submissionDate: 'Nov 1',   completeness: 100, missingItems: [],                          reviewerName: 'Dr. Harper',  reviewStatus: 'decided',        decision: 'accepted',   financialAidAmount: 30000 },
  { id: 'app12', studentName: 'Grace Yamamoto',    studentInitials: 'GY', program: 'Biology',           applicationType: 'regular',         submissionDate: 'Jan 10',  completeness: 100, missingItems: [],                          reviewerName: 'Dr. Collins', reviewStatus: 'decided',        decision: 'accepted',   financialAidAmount: 12000 },
  { id: 'app13', studentName: 'Cameron Diaz',      studentInitials: 'CD', program: 'Film Studies',      applicationType: 'regular',         submissionDate: 'Jan 20',  completeness: 80,  missingItems: ['Essay', 'Portfolio'],      reviewerName: null,          reviewStatus: 'unread' },
  { id: 'app14', studentName: 'Destiny Harris',    studentInitials: 'DH', program: 'Social Work',       applicationType: 'regular',         submissionDate: 'Feb 5',   completeness: 100, missingItems: [],                          reviewerName: 'Prof. Lane',  reviewStatus: 'decision-ready' },
  { id: 'app15', studentName: 'Brandon Lee',       studentInitials: 'BL', program: 'Kinesiology',       applicationType: 'transfer',        submissionDate: 'Feb 10',  completeness: 70,  missingItems: ['Transcript', 'Rec Letter', 'Statement'], reviewerName: null, reviewStatus: 'unread' },
  { id: 'app16', studentName: 'Rachel Kim',        studentInitials: 'RK', program: 'Music Performance', applicationType: 'regular',         submissionDate: 'Jan 18',  completeness: 100, missingItems: [],                          reviewerName: 'Dr. Patel',   reviewStatus: 'decided',        decision: 'denied' },
];

export function getApplications(filter: AppFilter): ApplicationItem[] {
  let list: ApplicationItem[];

  switch (filter) {
    case 'unreviewed':
      list = APPLICATIONS.filter((a) => a.reviewStatus === 'unread');
      break;
    case 'inReview':
      list = APPLICATIONS.filter((a) => a.reviewStatus === 'in-review' || a.reviewStatus === 'scored');
      break;
    case 'decisionReady':
      list = APPLICATIONS.filter((a) => a.reviewStatus === 'decision-ready');
      break;
    case 'decided':
      list = APPLICATIONS.filter((a) => a.reviewStatus === 'decided');
      break;
    default:
      list = [...APPLICATIONS];
  }

  return list;
}

export function formatAidAmount(n: number): string {
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}
