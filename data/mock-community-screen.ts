/**
 * Mock data for Community screen — education mode.
 * 3 pages: Members, Organizations, Development.
 * Pattern follows data/mock-team.ts.
 */

// ── Page 0: Members ──

export type CommunityRole = 'student' | 'faculty' | 'staff';
export type MemberFilter = 'all' | 'students' | 'faculty' | 'staff';
export type MemberSort = 'name' | 'department' | 'class-year' | 'role';
export type ClassYear = 'freshman' | 'sophomore' | 'junior' | 'senior' | 'grad' | null;

export interface CommunitySummary {
  totalStudents: number;
  totalFaculty: number;
  totalStaff: number;
}

export interface CommunityMemberItem {
  id: string;
  name: string;
  initials: string;
  username: string;
  role: CommunityRole;
  department: string;
  classYear: ClassYear;
  isOnline: boolean;
  imageUri: string | null;
}

// ── Page 1: Organizations ──

export type OrgCategory = 'clubs' | 'greek-life' | 'academic' | 'sports-clubs' | 'arts' | 'service' | 'religious' | 'student-gov';
export type OrgFilter = 'all' | OrgCategory;
export type OrgStatus = 'active' | 'inactive' | 'pending';

export interface OrganizationItem {
  id: string;
  name: string;
  category: OrgCategory;
  memberCount: number;
  status: OrgStatus;
  nextEventDate: string | null;
  leaderName: string;
  leaderInitials: string;
}

// ── Page 2: Development ──

export type DevSection = 'career' | 'advising' | 'mentoring' | 'wellness' | 'success';

// Career
export type JobType = 'internship' | 'part-time' | 'full-time';

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  type: JobType;
  deadline: string;
  location: string;
}

// Advising
export interface AdvisingEntry {
  id: string;
  studentName: string;
  studentInitials: string;
  advisorName: string;
  advisorInitials: string;
  nextAppointment: string | null;
  holdCount: number;
  degreeProgress: number;
}

// Mentoring
export type MentoringType = 'peer' | 'faculty' | 'alumni';

export interface MentoringPairing {
  id: string;
  mentorName: string;
  mentorInitials: string;
  menteeName: string;
  menteeInitials: string;
  type: MentoringType;
  meetingSchedule: string;
  goalSummary: string;
}

// Wellness
export type WellnessCategory = 'health' | 'counseling' | 'programs' | 'crisis';

export interface WellnessResource {
  id: string;
  title: string;
  category: WellnessCategory;
  description: string;
  availability: string;
}

// Success
export type AlertSeverity = 'high' | 'medium' | 'low';

export interface SuccessAlert {
  id: string;
  studentName: string;
  studentInitials: string;
  reason: string;
  severity: AlertSeverity;
  department: string;
  gpa: string;
  flaggedBy: string;
  actionTaken: string | null;
}

// ── Mock Data ──

export const COMMUNITY_SUMMARY: CommunitySummary = {
  totalStudents: 2400,
  totalFaculty: 180,
  totalStaff: 95,
};

export const COMMUNITY_MEMBERS: CommunityMemberItem[] = [
  // Students (16)
  { id: 'cm1',  name: 'Jordan Williams',    initials: 'JW', username: 'jwilliams',   role: 'student', department: 'Computer Science',    classYear: 'senior',    isOnline: true,  imageUri: null },
  { id: 'cm2',  name: 'Maya Johnson',       initials: 'MJ', username: 'mjohnson',    role: 'student', department: 'Biology',             classYear: 'junior',    isOnline: true,  imageUri: null },
  { id: 'cm3',  name: 'Ethan Brown',        initials: 'EB', username: 'ebrown',      role: 'student', department: 'English',             classYear: 'sophomore', isOnline: false, imageUri: null },
  { id: 'cm4',  name: 'Sophia Davis',       initials: 'SD', username: 'sdavis',      role: 'student', department: 'Business',            classYear: 'freshman',  isOnline: true,  imageUri: null },
  { id: 'cm5',  name: 'Liam Martinez',      initials: 'LM', username: 'lmartinez',   role: 'student', department: 'Psychology',          classYear: 'senior',    isOnline: false, imageUri: null },
  { id: 'cm6',  name: 'Ava Garcia',         initials: 'AG', username: 'agarcia',     role: 'student', department: 'Chemistry',           classYear: 'grad',      isOnline: true,  imageUri: null },
  { id: 'cm7',  name: 'Noah Wilson',        initials: 'NW', username: 'nwilson',     role: 'student', department: 'Mathematics',         classYear: 'junior',    isOnline: true,  imageUri: null },
  { id: 'cm8',  name: 'Isabella Thomas',    initials: 'IT', username: 'ithomas',     role: 'student', department: 'Nursing',             classYear: 'senior',    isOnline: false, imageUri: null },
  { id: 'cm9',  name: 'Lucas Anderson',     initials: 'LA', username: 'landerson',   role: 'student', department: 'Engineering',         classYear: 'sophomore', isOnline: true,  imageUri: null },
  { id: 'cm10', name: 'Olivia Taylor',      initials: 'OT', username: 'otaylor',     role: 'student', department: 'Art History',         classYear: 'freshman',  isOnline: true,  imageUri: null },
  { id: 'cm11', name: 'Mason Lee',          initials: 'ML', username: 'mlee',        role: 'student', department: 'Political Science',   classYear: 'junior',    isOnline: false, imageUri: null },
  { id: 'cm12', name: 'Emma Harris',        initials: 'EH', username: 'eharris',     role: 'student', department: 'Communications',      classYear: 'senior',    isOnline: true,  imageUri: null },
  { id: 'cm13', name: 'Aiden Clark',        initials: 'AC', username: 'aclark',      role: 'student', department: 'Physics',             classYear: 'grad',      isOnline: false, imageUri: null },
  { id: 'cm14', name: 'Charlotte Lewis',    initials: 'CL', username: 'clewis',      role: 'student', department: 'Education',           classYear: 'sophomore', isOnline: true,  imageUri: null },
  { id: 'cm15', name: 'James Robinson',     initials: 'JR', username: 'jrobinson',   role: 'student', department: 'Music',               classYear: 'freshman',  isOnline: false, imageUri: null },
  { id: 'cm16', name: 'Amelia Walker',      initials: 'AW', username: 'awalker',     role: 'student', department: 'Computer Science',    classYear: 'junior',    isOnline: true,  imageUri: null },
  // Faculty (5)
  { id: 'cm17', name: 'Dr. Robert Chen',    initials: 'RC', username: 'rchen',       role: 'faculty', department: 'Computer Science',    classYear: null,        isOnline: true,  imageUri: null },
  { id: 'cm18', name: 'Dr. Patricia Okafor', initials: 'PO', username: 'pokafor',    role: 'faculty', department: 'Biology',             classYear: null,        isOnline: true,  imageUri: null },
  { id: 'cm19', name: 'Dr. Michael Rivera', initials: 'MR', username: 'mrivera',     role: 'faculty', department: 'Business',            classYear: null,        isOnline: false, imageUri: null },
  { id: 'cm20', name: 'Dr. Sarah Kim',      initials: 'SK', username: 'skim',        role: 'faculty', department: 'Psychology',          classYear: null,        isOnline: true,  imageUri: null },
  { id: 'cm21', name: 'Dr. David Patel',    initials: 'DP', username: 'dpatel',      role: 'faculty', department: 'Engineering',         classYear: null,        isOnline: false, imageUri: null },
  // Staff (3)
  { id: 'cm22', name: 'Lisa Tran',          initials: 'LT', username: 'ltran',       role: 'staff',   department: 'Student Affairs',     classYear: null,        isOnline: true,  imageUri: null },
  { id: 'cm23', name: 'Kevin Moore',        initials: 'KM', username: 'kmoore',      role: 'staff',   department: 'Financial Aid',       classYear: null,        isOnline: true,  imageUri: null },
  { id: 'cm24', name: 'Angela Foster',      initials: 'AF', username: 'afoster',     role: 'staff',   department: 'Registrar',           classYear: null,        isOnline: false, imageUri: null },
];

export const ORGANIZATIONS: OrganizationItem[] = [
  { id: 'org1',  name: 'Computer Science Club',       category: 'clubs',        memberCount: 85,  status: 'active',   nextEventDate: 'Mar 15', leaderName: 'Jordan Williams', leaderInitials: 'JW' },
  { id: 'org2',  name: 'Alpha Phi Alpha',             category: 'greek-life',   memberCount: 42,  status: 'active',   nextEventDate: 'Mar 22', leaderName: 'Mason Lee',       leaderInitials: 'ML' },
  { id: 'org3',  name: 'Pre-Med Society',              category: 'academic',     memberCount: 120, status: 'active',   nextEventDate: 'Mar 12', leaderName: 'Maya Johnson',    leaderInitials: 'MJ' },
  { id: 'org4',  name: 'Club Soccer',                  category: 'sports-clubs', memberCount: 30,  status: 'active',   nextEventDate: 'Mar 14', leaderName: 'Ethan Brown',     leaderInitials: 'EB' },
  { id: 'org5',  name: 'Drama Society',                category: 'arts',         memberCount: 55,  status: 'active',   nextEventDate: 'Apr 5',  leaderName: 'Emma Harris',     leaderInitials: 'EH' },
  { id: 'org6',  name: 'Habitat for Humanity',         category: 'service',      memberCount: 70,  status: 'active',   nextEventDate: 'Mar 29', leaderName: 'Charlotte Lewis', leaderInitials: 'CL' },
  { id: 'org7',  name: 'Campus Fellowship',            category: 'religious',    memberCount: 95,  status: 'active',   nextEventDate: 'Mar 11', leaderName: 'Sophia Davis',    leaderInitials: 'SD' },
  { id: 'org8',  name: 'Student Government Assn.',     category: 'student-gov',  memberCount: 25,  status: 'active',   nextEventDate: 'Mar 18', leaderName: 'Liam Martinez',   leaderInitials: 'LM' },
  { id: 'org9',  name: 'Delta Sigma Theta',            category: 'greek-life',   memberCount: 38,  status: 'active',   nextEventDate: 'Mar 20', leaderName: 'Olivia Taylor',   leaderInitials: 'OT' },
  { id: 'org10', name: 'Engineering Honor Society',     category: 'academic',     memberCount: 45,  status: 'active',   nextEventDate: null,     leaderName: 'Lucas Anderson',  leaderInitials: 'LA' },
  { id: 'org11', name: 'Photography Club',              category: 'arts',         memberCount: 28,  status: 'active',   nextEventDate: 'Mar 25', leaderName: 'Amelia Walker',   leaderInitials: 'AW' },
  { id: 'org12', name: 'Debate Team',                   category: 'clubs',        memberCount: 22,  status: 'active',   nextEventDate: 'Apr 2',  leaderName: 'Noah Wilson',     leaderInitials: 'NW' },
  { id: 'org13', name: 'Outdoors Club',                 category: 'clubs',        memberCount: 40,  status: 'inactive', nextEventDate: null,     leaderName: 'Aiden Clark',     leaderInitials: 'AC' },
  { id: 'org14', name: 'Entrepreneurship Society',      category: 'academic',     memberCount: 60,  status: 'active',   nextEventDate: 'Mar 19', leaderName: 'Sophia Davis',    leaderInitials: 'SD' },
  { id: 'org15', name: 'Robotics Club',                 category: 'academic',     memberCount: 35,  status: 'pending',  nextEventDate: null,     leaderName: 'James Robinson',  leaderInitials: 'JR' },
];

export const JOB_POSTINGS: JobPosting[] = [
  { id: 'jp1', title: 'Software Engineering Intern',    company: 'Google',        type: 'internship', deadline: 'Mar 31', location: 'Mountain View, CA' },
  { id: 'jp2', title: 'Data Analyst Intern',            company: 'Netflix',       type: 'internship', deadline: 'Apr 10', location: 'Los Angeles, CA' },
  { id: 'jp3', title: 'Marketing Intern',               company: 'Nike',          type: 'internship', deadline: 'Mar 25', location: 'Portland, OR' },
  { id: 'jp4', title: 'Campus Tour Guide',              company: 'University',    type: 'part-time',  deadline: 'Mar 15', location: 'On Campus' },
  { id: 'jp5', title: 'Library Assistant',               company: 'University',    type: 'part-time',  deadline: 'Mar 20', location: 'On Campus' },
  { id: 'jp6', title: 'Junior UX Designer',             company: 'Figma',         type: 'full-time',  deadline: 'Apr 1',  location: 'San Francisco, CA' },
  { id: 'jp7', title: 'Research Assistant',              company: 'Bio Lab',       type: 'part-time',  deadline: 'Mar 18', location: 'On Campus' },
  { id: 'jp8', title: 'Financial Analyst',               company: 'Goldman Sachs', type: 'full-time',  deadline: 'Apr 15', location: 'New York, NY' },
];

export const ADVISING_ENTRIES: AdvisingEntry[] = [
  { id: 'ae1', studentName: 'Jordan Williams', studentInitials: 'JW', advisorName: 'Dr. Robert Chen',    advisorInitials: 'RC', nextAppointment: 'Mar 14',  holdCount: 0, degreeProgress: 92 },
  { id: 'ae2', studentName: 'Maya Johnson',    studentInitials: 'MJ', advisorName: 'Dr. Patricia Okafor', advisorInitials: 'PO', nextAppointment: 'Mar 17',  holdCount: 1, degreeProgress: 75 },
  { id: 'ae3', studentName: 'Sophia Davis',    studentInitials: 'SD', advisorName: 'Dr. Michael Rivera',  advisorInitials: 'MR', nextAppointment: null,      holdCount: 0, degreeProgress: 22 },
  { id: 'ae4', studentName: 'Noah Wilson',     studentInitials: 'NW', advisorName: 'Dr. Sarah Kim',       advisorInitials: 'SK', nextAppointment: 'Mar 20',  holdCount: 0, degreeProgress: 68 },
  { id: 'ae5', studentName: 'Isabella Thomas', studentInitials: 'IT', advisorName: 'Dr. Patricia Okafor', advisorInitials: 'PO', nextAppointment: 'Mar 12',  holdCount: 2, degreeProgress: 88 },
  { id: 'ae6', studentName: 'Ava Garcia',      studentInitials: 'AG', advisorName: 'Dr. David Patel',     advisorInitials: 'DP', nextAppointment: 'Apr 3',   holdCount: 0, degreeProgress: 45 },
];

export const MENTORING_PAIRINGS: MentoringPairing[] = [
  { id: 'mp1', mentorName: 'Jordan Williams', mentorInitials: 'JW', menteeName: 'Sophia Davis',    menteeInitials: 'SD', type: 'peer',    meetingSchedule: 'Weekly, Tuesdays',   goalSummary: 'Career exploration & resume building' },
  { id: 'mp2', mentorName: 'Dr. Robert Chen', mentorInitials: 'RC', menteeName: 'Amelia Walker',   menteeInitials: 'AW', type: 'faculty', meetingSchedule: 'Bi-weekly, Fridays', goalSummary: 'Research methodology & grad school prep' },
  { id: 'mp3', mentorName: 'Sarah Mitchell',  mentorInitials: 'SM', menteeName: 'Lucas Anderson',  menteeInitials: 'LA', type: 'alumni',  meetingSchedule: 'Monthly, 1st Wed',   goalSummary: 'Industry networking & interview prep' },
  { id: 'mp4', mentorName: 'Dr. Sarah Kim',   mentorInitials: 'SK', menteeName: 'Liam Martinez',   menteeInitials: 'LM', type: 'faculty', meetingSchedule: 'Bi-weekly, Mondays', goalSummary: 'Clinical psychology career path' },
  { id: 'mp5', mentorName: 'Emma Harris',     mentorInitials: 'EH', menteeName: 'Olivia Taylor',   menteeInitials: 'OT', type: 'peer',    meetingSchedule: 'Weekly, Thursdays',  goalSummary: 'Public speaking & leadership skills' },
  { id: 'mp6', mentorName: 'David Liu',       mentorInitials: 'DL', menteeName: 'Ethan Brown',     menteeInitials: 'EB', type: 'alumni',  meetingSchedule: 'Monthly, 3rd Tue',   goalSummary: 'Publishing & writing career guidance' },
];

export const WELLNESS_RESOURCES: WellnessResource[] = [
  { id: 'wr1', title: 'Student Health Center',          category: 'health',     description: 'Primary care, immunizations, lab services',                 availability: 'Mon–Fri 8am–5pm' },
  { id: 'wr2', title: 'Counseling & Psych Services',    category: 'counseling', description: 'Individual counseling, group therapy, crisis support',       availability: 'Mon–Fri 9am–6pm' },
  { id: 'wr3', title: 'Mindfulness & Meditation',       category: 'programs',   description: 'Weekly guided meditation sessions, stress management',      availability: 'Wed & Fri 12pm' },
  { id: 'wr4', title: '24/7 Crisis Hotline',            category: 'crisis',     description: 'Confidential support line for urgent mental health needs',  availability: '24/7' },
  { id: 'wr5', title: 'Nutrition Counseling',            category: 'health',     description: 'Dietary planning, eating disorder support',                 availability: 'Tue & Thu 10am–3pm' },
  { id: 'wr6', title: 'Peer Support Network',            category: 'counseling', description: 'Trained student peer counselors for drop-in conversations', availability: 'Mon–Thu 6pm–10pm' },
  { id: 'wr7', title: 'Fitness & Rec Programs',          category: 'programs',   description: 'Group fitness classes, intramural sports, gym access',      availability: 'Daily 6am–10pm' },
  { id: 'wr8', title: 'Sexual Assault Resource Center',  category: 'crisis',     description: 'Advocacy, reporting support, confidential counseling',      availability: 'Mon–Fri 9am–5pm' },
];

export const SUCCESS_ALERTS: SuccessAlert[] = [
  { id: 'sa1', studentName: 'Ethan Brown',     studentInitials: 'EB', reason: 'GPA below 2.0 — 2 consecutive terms',          severity: 'high',   department: 'English',           gpa: '1.8', flaggedBy: 'Registrar',       actionTaken: 'Advisor meeting scheduled' },
  { id: 'sa2', studentName: 'Isabella Thomas', studentInitials: 'IT', reason: 'Excessive absences in 3 courses',              severity: 'high',   department: 'Nursing',           gpa: '2.9', flaggedBy: 'Faculty',         actionTaken: null },
  { id: 'sa3', studentName: 'Mason Lee',       studentInitials: 'ML', reason: 'Midterm grades — 2 failing marks',             severity: 'medium', department: 'Political Science', gpa: '2.3', flaggedBy: 'Auto-alert',      actionTaken: 'Tutoring referral sent' },
  { id: 'sa4', studentName: 'James Robinson',  studentInitials: 'JR', reason: 'Financial aid hold — documents missing',       severity: 'medium', department: 'Music',             gpa: '3.1', flaggedBy: 'Financial Aid',   actionTaken: null },
  { id: 'sa5', studentName: 'Charlotte Lewis', studentInitials: 'CL', reason: 'Declined academic performance trend',          severity: 'low',    department: 'Education',         gpa: '2.7', flaggedBy: 'Auto-alert',      actionTaken: 'Check-in email sent' },
  { id: 'sa6', studentName: 'Olivia Taylor',   studentInitials: 'OT', reason: 'Housing instability — emergency fund request', severity: 'medium', department: 'Art History',        gpa: '3.4', flaggedBy: 'Student Affairs', actionTaken: 'Emergency fund approved' },
];

// ── Helpers ──

export function getMembers(filter?: MemberFilter, sort?: MemberSort): CommunityMemberItem[] {
  let result = [...COMMUNITY_MEMBERS];
  if (filter && filter !== 'all') {
    const roleMap: Record<string, CommunityRole> = {
      students: 'student',
      faculty: 'faculty',
      staff: 'staff',
    };
    const role = roleMap[filter];
    if (role) result = result.filter((m) => m.role === role);
  }
  if (sort) {
    switch (sort) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'department':
        result.sort((a, b) => a.department.localeCompare(b.department));
        break;
      case 'class-year':
        result.sort((a, b) => (a.classYear ?? '').localeCompare(b.classYear ?? ''));
        break;
      case 'role':
        result.sort((a, b) => a.role.localeCompare(b.role));
        break;
    }
  }
  return result;
}

export function getOrganizations(filter?: OrgFilter): OrganizationItem[] {
  if (!filter || filter === 'all') return ORGANIZATIONS;
  return ORGANIZATIONS.filter((o) => o.category === filter);
}
