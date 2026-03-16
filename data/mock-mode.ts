/**
 * Mock data for Mode screen — org dashboard, people, resources.
 * Mode-aware: all data varies by active mode (sports/business/church/education).
 */

import type { Mode } from '@/types';

// ── Types ──

export interface OrgFinanceSnapshot {
  revenue: string;
  expenses: string;
  balance: string;
  trend: 'up' | 'down' | 'flat';
}

export interface OrgComplianceItem {
  id: string;
  label: string;
  status: 'compliant' | 'warning' | 'overdue';
}

export interface OrgAnnouncement {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  authorInitials: string;
}

export interface OrgDeadline {
  id: string;
  title: string;
  dueDate: string;
  category: string;
  urgent: boolean;
}

export interface OrgActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

export interface OrgDashboard {
  finance: OrgFinanceSnapshot;
  compliance: OrgComplianceItem[];
  announcements: OrgAnnouncement[];
  deadlines: OrgDeadline[];
  activity: OrgActivity[];
}

export interface OrgPerson {
  id: string;
  name: string;
  initials: string;
  role: string;
  department: string;
  online: boolean;
}

export type ResourceCategory = 'all' | 'facilities' | 'documents' | 'inventory' | 'assets';

export interface OrgResource {
  id: string;
  name: string;
  category: Exclude<ResourceCategory, 'all'>;
  description: string;
  status: 'available' | 'in-use' | 'maintenance';
  icon: string;
}

// ── Departments per mode ──

const DEPARTMENTS_BY_MODE: Record<Mode, string[]> = {
  sports: ['Coaching', 'Medical', 'Operations', 'Academic', 'Players', 'Support'],
  business: ['Product', 'Sales', 'Marketing', 'Operations', 'Leadership'],
  community: ['Pastoral', 'Ministry Leaders', 'Staff', 'Deacons', 'Members'],
  education: ['Faculty', 'Admin', 'Staff', 'Students', 'Support'],
};

// ── Finance per mode ──

const FINANCE_BY_MODE: Record<Mode, OrgFinanceSnapshot> = {
  sports: { revenue: '$2.4M', expenses: '$1.8M', balance: '$620K', trend: 'up' },
  business: { revenue: '$1.2M', expenses: '$890K', balance: '$310K', trend: 'up' },
  community: { revenue: '$485K', expenses: '$320K', balance: '$165K', trend: 'flat' },
  education: { revenue: '$8.7M', expenses: '$7.1M', balance: '$1.6M', trend: 'up' },
};

// ── Compliance per mode ──

const COMPLIANCE_BY_MODE: Record<Mode, OrgComplianceItem[]> = {
  sports: [
    { id: 'sc1', label: 'NCAA Eligibility', status: 'compliant' },
    { id: 'sc2', label: 'Drug Testing', status: 'compliant' },
    { id: 'sc3', label: 'Title IX', status: 'warning' },
    { id: 'sc4', label: 'NIL Disclosures', status: 'overdue' },
    { id: 'sc5', label: 'APR Report', status: 'compliant' },
  ],
  business: [
    { id: 'bc1', label: 'SOC 2 Audit', status: 'compliant' },
    { id: 'bc2', label: 'GDPR Review', status: 'compliant' },
    { id: 'bc3', label: 'Contract Renewals', status: 'warning' },
    { id: 'bc4', label: 'Regulatory Filing', status: 'overdue' },
    { id: 'bc5', label: 'Insurance', status: 'compliant' },
  ],
  community: [
    { id: 'cc1', label: 'Tax-Exempt Status', status: 'compliant' },
    { id: 'cc2', label: 'Bylaws Review', status: 'compliant' },
    { id: 'cc3', label: 'Background Checks', status: 'warning' },
    { id: 'cc4', label: 'Annual Report', status: 'compliant' },
    { id: 'cc5', label: 'Safety Audit', status: 'compliant' },
  ],
  education: [
    { id: 'ec1', label: 'Accreditation', status: 'compliant' },
    { id: 'ec2', label: 'Title IX', status: 'compliant' },
    { id: 'ec3', label: 'FERPA Audit', status: 'warning' },
    { id: 'ec4', label: 'ADA Compliance', status: 'compliant' },
    { id: 'ec5', label: 'Clery Act', status: 'overdue' },
  ],
};

// ── Announcements per mode ──

const ANNOUNCEMENTS_BY_MODE: Record<Mode, OrgAnnouncement[]> = {
  sports: [
    { id: 'sa1', title: 'Spring Practice Schedule Released', preview: 'Practice begins March 15 with modified hours for spring break week...', timestamp: '2h ago', authorInitials: 'CW' },
    { id: 'sa2', title: 'NIL Policy Update', preview: 'New disclosure requirements effective April 1. All athletes must...', timestamp: '5h ago', authorInitials: 'AD' },
    { id: 'sa3', title: 'Annual Athletic Banquet', preview: 'Save the date: April 20 at the Grand Ballroom. RSVP by April 5...', timestamp: 'Yesterday', authorInitials: 'FO' },
  ],
  business: [
    { id: 'ba1', title: 'Q1 All-Hands Meeting', preview: 'Company-wide meeting scheduled for March 14 at 10 AM. Review of...', timestamp: '3h ago', authorInitials: 'KN' },
    { id: 'ba2', title: 'New Benefits Package', preview: 'Updated health and wellness benefits available starting April 1...', timestamp: '1d ago', authorInitials: 'HR' },
    { id: 'ba3', title: 'Office Hours Change', preview: 'Effective March 20, office hours will shift to 9 AM - 5 PM...', timestamp: '2d ago', authorInitials: 'OP' },
  ],
  community: [
    { id: 'ca1', title: 'Easter Service Schedule', preview: 'Three services planned for Easter Sunday: 7 AM sunrise, 9 AM, 11 AM...', timestamp: '1h ago', authorInitials: 'PD' },
    { id: 'ca2', title: 'Volunteer Sign-Up Open', preview: 'Spring outreach needs volunteers for food bank and community...', timestamp: '6h ago', authorInitials: 'ML' },
    { id: 'ca3', title: 'Building Fund Update', preview: 'We have reached 75% of our building fund goal. Thank you for...', timestamp: 'Yesterday', authorInitials: 'TR' },
  ],
  education: [
    { id: 'ea1', title: 'Spring Break Reminder', preview: 'Spring break runs March 17-21. Campus offices remain open with...', timestamp: '4h ago', authorInitials: 'RG' },
    { id: 'ea2', title: 'Faculty Senate Meeting', preview: 'Next meeting March 12. Agenda includes curriculum review and...', timestamp: '1d ago', authorInitials: 'FS' },
    { id: 'ea3', title: 'Commencement Planning', preview: 'All departments submit graduate lists by April 1. Ceremony details...', timestamp: '2d ago', authorInitials: 'PR' },
  ],
};

// ── Deadlines per mode ──

const DEADLINES_BY_MODE: Record<Mode, OrgDeadline[]> = {
  sports: [
    { id: 'sd1', title: 'Recruiting Compliance Report', dueDate: 'Mar 12', category: 'Compliance', urgent: true },
    { id: 'sd2', title: 'Spring Roster Finalization', dueDate: 'Mar 15', category: 'Roster', urgent: false },
    { id: 'sd3', title: 'Budget Submission Q2', dueDate: 'Mar 20', category: 'Finance', urgent: false },
    { id: 'sd4', title: 'NIL Disclosure Deadline', dueDate: 'Mar 31', category: 'Compliance', urgent: true },
  ],
  business: [
    { id: 'bd1', title: 'Quarterly Tax Filing', dueDate: 'Mar 15', category: 'Finance', urgent: true },
    { id: 'bd2', title: 'Board Report Due', dueDate: 'Mar 18', category: 'Governance', urgent: false },
    { id: 'bd3', title: 'Contract Renewal — AWS', dueDate: 'Mar 25', category: 'Operations', urgent: false },
    { id: 'bd4', title: 'Annual Audit Prep', dueDate: 'Apr 1', category: 'Finance', urgent: false },
  ],
  community: [
    { id: 'cd1', title: 'Easter Volunteer Roster', dueDate: 'Mar 14', category: 'Ministry', urgent: true },
    { id: 'cd2', title: 'Annual Report Filing', dueDate: 'Mar 20', category: 'Administration', urgent: false },
    { id: 'cd3', title: 'VBS Registration Open', dueDate: 'Apr 1', category: 'Ministry', urgent: false },
    { id: 'cd4', title: 'Building Inspection', dueDate: 'Apr 5', category: 'Facilities', urgent: false },
  ],
  education: [
    { id: 'ed1', title: 'Midterm Grades Due', dueDate: 'Mar 14', category: 'Academic', urgent: true },
    { id: 'ed2', title: 'Accreditation Self-Study', dueDate: 'Mar 20', category: 'Compliance', urgent: true },
    { id: 'ed3', title: 'Fall Course Proposals', dueDate: 'Apr 1', category: 'Academic', urgent: false },
    { id: 'ed4', title: 'Graduation Application Deadline', dueDate: 'Apr 10', category: 'Registrar', urgent: false },
  ],
};

// ── Activity per mode ──

const ACTIVITY_BY_MODE: Record<Mode, OrgActivity[]> = {
  sports: [
    { id: 'sact1', title: 'Roster Updated', description: 'Coach Williams added 2 walk-ons to spring roster', timestamp: '30m ago', icon: 'person.badge.plus' },
    { id: 'sact2', title: 'Practice Report Filed', description: 'Monday practice — 92% attendance', timestamp: '2h ago', icon: 'doc.text.fill' },
    { id: 'sact3', title: 'Facility Booking', description: 'Main gym reserved for recruiting visit Mar 14', timestamp: '4h ago', icon: 'building.2.fill' },
    { id: 'sact4', title: 'Medical Clearance', description: 'Dr. Kim cleared J. Rodriguez for full contact', timestamp: 'Yesterday', icon: 'cross.case.fill' },
    { id: 'sact5', title: 'Budget Approved', description: 'Q2 travel budget approved by athletic director', timestamp: 'Yesterday', icon: 'checkmark.circle.fill' },
  ],
  business: [
    { id: 'bact1', title: 'New Deal Closed', description: 'Sales closed $45K contract with Meridian Corp', timestamp: '1h ago', icon: 'dollarsign.circle.fill' },
    { id: 'bact2', title: 'Product Release', description: 'v2.4 deployed to production — zero downtime', timestamp: '3h ago', icon: 'shippingbox.fill' },
    { id: 'bact3', title: 'Team Member Joined', description: 'Sarah Lee started as Senior Designer', timestamp: 'Yesterday', icon: 'person.badge.plus' },
    { id: 'bact4', title: 'Expense Report', description: 'Marketing submitted March expense report', timestamp: 'Yesterday', icon: 'doc.text.fill' },
    { id: 'bact5', title: 'Policy Updated', description: 'Remote work policy updated for Q2', timestamp: '2d ago', icon: 'doc.badge.gearshape.fill' },
  ],
  community: [
    { id: 'cact1', title: 'Service Attendance', description: 'Sunday service: 342 in-person, 128 online', timestamp: '5h ago', icon: 'person.3.fill' },
    { id: 'cact2', title: 'Giving Report', description: 'Weekly tithes and offerings: $12,450', timestamp: '6h ago', icon: 'heart.fill' },
    { id: 'cact3', title: 'Volunteer Signup', description: '14 new volunteers for Easter outreach', timestamp: 'Yesterday', icon: 'hand.raised.fill' },
    { id: 'cact4', title: 'Ministry Update', description: 'Youth group launched new mentorship program', timestamp: '2d ago', icon: 'star.fill' },
    { id: 'cact5', title: 'Facility Reserved', description: 'Fellowship hall booked for March 22 event', timestamp: '2d ago', icon: 'building.2.fill' },
  ],
  education: [
    { id: 'eact1', title: 'Enrollment Update', description: 'Fall 2026 applications up 12% year-over-year', timestamp: '2h ago', icon: 'chart.line.uptrend.xyaxis' },
    { id: 'eact2', title: 'Faculty Hire', description: 'Dr. Martinez joins Computer Science department', timestamp: '1d ago', icon: 'person.badge.plus' },
    { id: 'eact3', title: 'Grant Awarded', description: 'NSF grant of $250K for STEM research lab', timestamp: '1d ago', icon: 'dollarsign.circle.fill' },
    { id: 'eact4', title: 'Course Published', description: 'New Data Analytics minor approved by senate', timestamp: '2d ago', icon: 'book.fill' },
    { id: 'eact5', title: 'Facility Maintenance', description: 'Science building HVAC upgrade complete', timestamp: '3d ago', icon: 'wrench.and.screwdriver.fill' },
  ],
};

// ── People per mode ──

const PEOPLE_BY_MODE: Record<Mode, OrgPerson[]> = {
  sports: [
    { id: 'sp1', name: 'Coach Williams', initials: 'CW', role: 'Head Coach', department: 'Coaching', online: true },
    { id: 'sp2', name: 'Coach Thompson', initials: 'CT', role: 'Assistant Coach', department: 'Coaching', online: true },
    { id: 'sp3', name: 'Mike Davis', initials: 'MD', role: 'Strength Coach', department: 'Coaching', online: false },
    { id: 'sp4', name: 'Dr. Kim', initials: 'DK', role: 'Team Physician', department: 'Medical', online: false },
    { id: 'sp5', name: 'Lisa Chen', initials: 'LC', role: 'Athletic Trainer', department: 'Medical', online: true },
    { id: 'sp6', name: 'Tom Baker', initials: 'TB', role: 'Operations Director', department: 'Operations', online: true },
    { id: 'sp7', name: 'Rachel Green', initials: 'RG', role: 'Event Coordinator', department: 'Operations', online: false },
    { id: 'sp8', name: 'Prof. Adams', initials: 'PA', role: 'Academic Advisor', department: 'Academic', online: true },
    { id: 'sp9', name: 'James Rodriguez', initials: 'JR', role: 'Guard', department: 'Players', online: true },
    { id: 'sp10', name: 'Marcus Johnson', initials: 'MJ', role: 'Forward', department: 'Players', online: true },
    { id: 'sp11', name: 'Devon Carter', initials: 'DC', role: 'Center', department: 'Players', online: false },
    { id: 'sp12', name: 'Andre White', initials: 'AW', role: 'Guard', department: 'Players', online: true },
    { id: 'sp13', name: 'Chris Lee', initials: 'CL', role: 'Video Coordinator', department: 'Support', online: false },
    { id: 'sp14', name: 'Sarah Park', initials: 'SP', role: 'Equipment Manager', department: 'Support', online: false },
  ],
  business: [
    { id: 'bp1', name: 'Alex Kim', initials: 'AK', role: 'Product Lead', department: 'Product', online: true },
    { id: 'bp2', name: 'Jamie Watts', initials: 'JW', role: 'Senior Engineer', department: 'Product', online: true },
    { id: 'bp3', name: 'Priya Patel', initials: 'PP', role: 'Designer', department: 'Product', online: false },
    { id: 'bp4', name: 'Derek Stone', initials: 'DS', role: 'Sales Director', department: 'Sales', online: true },
    { id: 'bp5', name: 'Maria Gonzalez', initials: 'MG', role: 'Account Executive', department: 'Sales', online: true },
    { id: 'bp6', name: 'Nadia Rose', initials: 'NR', role: 'Marketing Lead', department: 'Marketing', online: true },
    { id: 'bp7', name: 'Tyler Brooks', initials: 'TB', role: 'Content Strategist', department: 'Marketing', online: false },
    { id: 'bp8', name: 'Lisa Park', initials: 'LP', role: 'Operations Director', department: 'Operations', online: true },
    { id: 'bp9', name: 'Kevin Hart', initials: 'KH', role: 'Finance Manager', department: 'Operations', online: false },
    { id: 'bp10', name: 'Sarah Chen', initials: 'SC', role: 'CEO', department: 'Leadership', online: true },
    { id: 'bp11', name: 'Michael Torres', initials: 'MT', role: 'CTO', department: 'Leadership', online: true },
    { id: 'bp12', name: 'Rachel Adams', initials: 'RA', role: 'COO', department: 'Leadership', online: false },
  ],
  community: [
    { id: 'cp1', name: 'Pastor Davis', initials: 'PD', role: 'Senior Pastor', department: 'Pastoral', online: true },
    { id: 'cp2', name: 'Rev. Thompson', initials: 'RT', role: 'Associate Pastor', department: 'Pastoral', online: false },
    { id: 'cp3', name: 'Emily Grace', initials: 'EG', role: 'Worship Leader', department: 'Ministry Leaders', online: true },
    { id: 'cp4', name: 'Mark Stevens', initials: 'MS', role: 'Youth Director', department: 'Ministry Leaders', online: true },
    { id: 'cp5', name: 'Angela Brooks', initials: 'AB', role: "Children's Director", department: 'Ministry Leaders', online: false },
    { id: 'cp6', name: 'David Kim', initials: 'DK', role: 'Office Manager', department: 'Staff', online: true },
    { id: 'cp7', name: 'Tina Reyes', initials: 'TR', role: 'Communications', department: 'Staff', online: false },
    { id: 'cp8', name: 'James White', initials: 'JW', role: 'Facilities Manager', department: 'Staff', online: true },
    { id: 'cp9', name: 'Robert Hall', initials: 'RH', role: 'Deacon', department: 'Deacons', online: false },
    { id: 'cp10', name: 'Patricia Moore', initials: 'PM', role: 'Deacon', department: 'Deacons', online: true },
    { id: 'cp11', name: 'Linda Carter', initials: 'LC', role: 'Deacon', department: 'Deacons', online: false },
    { id: 'cp12', name: 'Joseph Brown', initials: 'JB', role: 'Small Group Leader', department: 'Members', online: true },
    { id: 'cp13', name: 'Sandra Green', initials: 'SG', role: 'Volunteer Coordinator', department: 'Members', online: false },
    { id: 'cp14', name: 'Thomas Clark', initials: 'TC', role: 'Usher Captain', department: 'Members', online: true },
    { id: 'cp15', name: 'Mary Wilson', initials: 'MW', role: 'Choir Director', department: 'Members', online: false },
  ],
  education: [
    { id: 'ep1', name: 'Dr. Williams', initials: 'DW', role: 'Department Chair', department: 'Faculty', online: true },
    { id: 'ep2', name: 'Prof. Chen', initials: 'PC', role: 'Professor', department: 'Faculty', online: true },
    { id: 'ep3', name: 'Dr. Martinez', initials: 'DM', role: 'Assistant Professor', department: 'Faculty', online: false },
    { id: 'ep4', name: 'Prof. Johnson', initials: 'PJ', role: 'Lecturer', department: 'Faculty', online: true },
    { id: 'ep5', name: 'Dean Harris', initials: 'DH', role: 'Dean of Students', department: 'Admin', online: true },
    { id: 'ep6', name: 'Janet Lee', initials: 'JL', role: 'Registrar', department: 'Admin', online: false },
    { id: 'ep7', name: 'Robert King', initials: 'RK', role: 'Admissions Director', department: 'Admin', online: true },
    { id: 'ep8', name: 'Nancy Taylor', initials: 'NT', role: 'Financial Aid', department: 'Staff', online: false },
    { id: 'ep9', name: 'Paul Rivera', initials: 'PR', role: 'IT Manager', department: 'Staff', online: true },
    { id: 'ep10', name: 'Karen Flores', initials: 'KF', role: 'Library Director', department: 'Staff', online: true },
    { id: 'ep11', name: 'David Park', initials: 'DP', role: 'Student Body President', department: 'Students', online: true },
    { id: 'ep12', name: 'Maya Santos', initials: 'MS', role: 'Graduate TA', department: 'Students', online: false },
    { id: 'ep13', name: 'Jordan Ellis', initials: 'JE', role: 'RA Coordinator', department: 'Students', online: true },
    { id: 'ep14', name: 'Maintenance Dept', initials: 'MD', role: 'Facilities', department: 'Support', online: false },
    { id: 'ep15', name: 'Security Team', initials: 'ST', role: 'Campus Safety', department: 'Support', online: true },
  ],
};

// ── Resources per mode ──

const RESOURCES_BY_MODE: Record<Mode, OrgResource[]> = {
  sports: [
    { id: 'sr1', name: 'Main Gymnasium', category: 'facilities', description: 'Primary practice and game facility', status: 'in-use', icon: 'sportscourt.fill' },
    { id: 'sr2', name: 'Weight Room', category: 'facilities', description: 'Strength and conditioning center', status: 'available', icon: 'dumbbell.fill' },
    { id: 'sr3', name: 'Film Room', category: 'facilities', description: 'Video review and scouting room', status: 'available', icon: 'tv.fill' },
    { id: 'sr4', name: 'Training Room', category: 'facilities', description: 'Athletic training and recovery', status: 'in-use', icon: 'cross.case.fill' },
    { id: 'sr5', name: 'Recruiting Binder', category: 'documents', description: 'Current class recruiting profiles', status: 'available', icon: 'folder.fill' },
    { id: 'sr6', name: 'NCAA Manual', category: 'documents', description: 'Current year compliance manual', status: 'available', icon: 'book.fill' },
    { id: 'sr7', name: 'Practice Plans', category: 'documents', description: 'Season practice plan archive', status: 'available', icon: 'doc.text.fill' },
    { id: 'sr8', name: 'Game Balls (24)', category: 'inventory', description: 'Wilson Evolution game basketballs', status: 'available', icon: 'basketball.fill' },
    { id: 'sr9', name: 'Travel Gear Sets', category: 'inventory', description: '18 travel bag + uniform sets', status: 'in-use', icon: 'bag.fill' },
    { id: 'sr10', name: 'Shot Clocks (2)', category: 'assets', description: 'Daktronics wireless shot clocks', status: 'available', icon: 'clock.fill' },
    { id: 'sr11', name: 'Team Van', category: 'assets', description: '15-passenger Ford Transit', status: 'maintenance', icon: 'car.fill' },
    { id: 'sr12', name: 'Scoreboard System', category: 'assets', description: 'Main gym Daktronics scoreboard', status: 'available', icon: 'display' },
  ],
  business: [
    { id: 'br1', name: 'Main Office', category: 'facilities', description: 'HQ workspace — 5th floor', status: 'in-use', icon: 'building.2.fill' },
    { id: 'br2', name: 'Conference Room A', category: 'facilities', description: '12-person board room', status: 'available', icon: 'person.3.fill' },
    { id: 'br3', name: 'Conference Room B', category: 'facilities', description: '6-person meeting room', status: 'in-use', icon: 'person.2.fill' },
    { id: 'br4', name: 'Operating Agreement', category: 'documents', description: 'Company operating agreement v3', status: 'available', icon: 'doc.text.fill' },
    { id: 'br5', name: 'Employee Handbook', category: 'documents', description: 'Updated March 2026', status: 'available', icon: 'book.fill' },
    { id: 'br6', name: 'Brand Guidelines', category: 'documents', description: 'Logo, colors, typography specs', status: 'available', icon: 'paintpalette.fill' },
    { id: 'br7', name: 'MacBook Pro Fleet', category: 'inventory', description: '24 M3 Max MacBook Pros', status: 'in-use', icon: 'laptopcomputer' },
    { id: 'br8', name: 'Monitor Inventory', category: 'inventory', description: '30 Studio Display units', status: 'available', icon: 'display' },
    { id: 'br9', name: 'Server Rack', category: 'assets', description: 'On-prem dev/test environment', status: 'available', icon: 'server.rack' },
    { id: 'br10', name: 'Company Vehicle', category: 'assets', description: 'Tesla Model Y — deliveries', status: 'available', icon: 'car.fill' },
  ],
  community: [
    { id: 'cr1', name: 'Sanctuary', category: 'facilities', description: 'Main worship space — 500 seats', status: 'available', icon: 'building.columns.fill' },
    { id: 'cr2', name: 'Fellowship Hall', category: 'facilities', description: 'Events and community meals', status: 'available', icon: 'person.3.fill' },
    { id: 'cr3', name: "Children's Wing", category: 'facilities', description: '4 classrooms + nursery', status: 'in-use', icon: 'figure.and.child.holdinghands' },
    { id: 'cr4', name: 'Youth Center', category: 'facilities', description: 'Teen gathering space', status: 'available', icon: 'star.fill' },
    { id: 'cr5', name: 'Church Bylaws', category: 'documents', description: 'Governing bylaws — amended 2025', status: 'available', icon: 'doc.text.fill' },
    { id: 'cr6', name: 'Member Directory', category: 'documents', description: 'Active member contact list', status: 'available', icon: 'person.text.rectangle.fill' },
    { id: 'cr7', name: 'Worship Equipment', category: 'inventory', description: 'Sound board, mics, instruments', status: 'in-use', icon: 'music.mic' },
    { id: 'cr8', name: 'Folding Tables (40)', category: 'inventory', description: '6-ft rectangular folding tables', status: 'available', icon: 'square.fill' },
    { id: 'cr9', name: 'Church Van', category: 'assets', description: '15-passenger van for ministries', status: 'available', icon: 'bus.fill' },
    { id: 'cr10', name: 'A/V System', category: 'assets', description: 'Projectors, screens, streaming gear', status: 'available', icon: 'tv.fill' },
    { id: 'cr11', name: 'Kitchen Equipment', category: 'assets', description: 'Commercial kitchen for events', status: 'maintenance', icon: 'fork.knife' },
  ],
  education: [
    { id: 'er1', name: 'Lecture Hall A', category: 'facilities', description: '200-seat tiered lecture hall', status: 'in-use', icon: 'building.2.fill' },
    { id: 'er2', name: 'Science Lab 201', category: 'facilities', description: 'Chemistry and biology lab', status: 'available', icon: 'flask.fill' },
    { id: 'er3', name: 'Computer Lab', category: 'facilities', description: '40-station computing center', status: 'in-use', icon: 'desktopcomputer' },
    { id: 'er4', name: 'Library', category: 'facilities', description: 'Main campus library — 3 floors', status: 'available', icon: 'books.vertical.fill' },
    { id: 'er5', name: 'Course Catalog', category: 'documents', description: '2025-26 academic year catalog', status: 'available', icon: 'book.fill' },
    { id: 'er6', name: 'Faculty Handbook', category: 'documents', description: 'Policies and procedures guide', status: 'available', icon: 'doc.text.fill' },
    { id: 'er7', name: 'Student Handbook', category: 'documents', description: 'Code of conduct and resources', status: 'available', icon: 'person.text.rectangle.fill' },
    { id: 'er8', name: 'Lab Equipment', category: 'inventory', description: 'Microscopes, centrifuges, etc.', status: 'in-use', icon: 'eyedropper.full' },
    { id: 'er9', name: 'Projector Pool', category: 'inventory', description: '15 portable projectors', status: 'available', icon: 'videoprojector.fill' },
    { id: 'er10', name: 'Campus Shuttle', category: 'assets', description: '2 shuttle buses for campus routes', status: 'available', icon: 'bus.fill' },
    { id: 'er11', name: 'Server Infrastructure', category: 'assets', description: 'Data center and LMS hosting', status: 'available', icon: 'server.rack' },
    { id: 'er12', name: 'Athletic Field', category: 'assets', description: 'Multi-use turf field', status: 'maintenance', icon: 'sportscourt.fill' },
  ],
};

// ── Helpers ──

export function getDashboardByMode(mode: Mode): OrgDashboard {
  return {
    finance: FINANCE_BY_MODE[mode],
    compliance: COMPLIANCE_BY_MODE[mode],
    announcements: ANNOUNCEMENTS_BY_MODE[mode],
    deadlines: DEADLINES_BY_MODE[mode],
    activity: ACTIVITY_BY_MODE[mode],
  };
}

export function getPeopleByMode(mode: Mode): OrgPerson[] {
  return PEOPLE_BY_MODE[mode];
}

export function getDepartmentsByMode(mode: Mode): string[] {
  return DEPARTMENTS_BY_MODE[mode];
}

export function getResourcesByMode(mode: Mode): OrgResource[] {
  return RESOURCES_BY_MODE[mode];
}
