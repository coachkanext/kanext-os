/**
 * Education People — Directory, Org Structure, Roles & Coverage, Permissions.
 * 4-view pill toggle at the top. RBAC:
 *   E1 — All views, full org chart, permissions management
 *   E2 — All views, limited permissions view
 *   E3 — Directory + Org Structure, limited coverage view
 *   E4 — Directory only (limited to public info)
 *   E5 — "Directory Not Available" lock screen
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
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

type PeopleView = 'directory' | 'org-structure' | 'coverage' | 'permissions';

interface ViewOption {
  id: PeopleView;
  label: string;
  minRole: EducationRoleLens;
}

const VIEWS: ViewOption[] = [
  { id: 'directory', label: 'Directory', minRole: 'E4' },
  { id: 'org-structure', label: 'Org Structure', minRole: 'E3' },
  { id: 'coverage', label: 'Roles & Coverage', minRole: 'E3' },
  { id: 'permissions', label: 'Permissions', minRole: 'E1' },
];

// Numeric level mapping for easy comparison
const ROLE_LEVEL: Record<EducationRoleLens, number> = {
  E1: 1,
  E2: 2,
  E3: 3,
  E4: 4,
  E5: 5,
};

function canAccessView(view: ViewOption, role: EducationRoleLens): boolean {
  // Permissions: E1 full, E2 limited
  if (view.id === 'permissions') return isDeanLevel(role);
  // Coverage: E1/E2 full, E3 limited
  if (view.id === 'coverage') return isFacultyLevel(role);
  // Org Structure: E1-E3
  if (view.id === 'org-structure') return isFacultyLevel(role);
  // Directory: E1-E4
  return ROLE_LEVEL[role] <= ROLE_LEVEL[view.minRole];
}

// =============================================================================
// INLINE MOCK DATA — DIRECTORY
// =============================================================================

interface PersonEntry {
  id: string;
  name: string;
  title: string;
  department: string;
  category: 'faculty' | 'staff' | 'student-leader';
  email: string;
  phone: string;
  office: string;
  badges: string[];
  officeHours?: string;
  specialization?: string;
  tenured?: boolean;
  publications?: number;
  rating?: number;
  year?: string;
  major?: string;
  gpa?: number;
  organization?: string;
  yearsAtInstitution?: number;
}

const DIRECTORY: PersonEntry[] = [
  // Faculty
  {
    id: 'dir-1', name: 'Dr. Sarah Kim', title: 'Professor & Department Chair',
    department: 'Computer Science', category: 'faculty', email: 'skim@westfield.edu',
    phone: '(404) 555-3101', office: 'Morrison 410', badges: ['Chair', 'Tenured'],
    officeHours: 'Mon/Wed 2\u20134PM', specialization: 'Artificial Intelligence, Machine Learning',
    tenured: true, publications: 87, rating: 4.6,
  },
  {
    id: 'dir-2', name: 'Dr. Robert Chen', title: 'Dean, College of Engineering',
    department: 'Engineering', category: 'faculty', email: 'rchen@westfield.edu',
    phone: '(404) 555-3102', office: 'Williams 201', badges: ['Dean', 'Tenured'],
    officeHours: 'Tue/Thu 10AM\u201312PM', specialization: 'Structural Engineering, Materials Science',
    tenured: true, publications: 124, rating: 4.3,
  },
  {
    id: 'dir-3', name: 'Dr. Maria Gonzalez', title: 'Dean, College of Arts & Sciences',
    department: 'Arts & Sciences', category: 'faculty', email: 'mgonzalez@westfield.edu',
    phone: '(404) 555-3103', office: 'Founders 302', badges: ['Dean', 'Tenured'],
    officeHours: 'Mon/Fri 1\u20133PM', specialization: 'Comparative Literature, Cultural Studies',
    tenured: true, publications: 56,
  },
  {
    id: 'dir-4', name: 'Dr. James Williams', title: 'Dean, School of Business',
    department: 'Business', category: 'faculty', email: 'jwilliams@westfield.edu',
    phone: '(404) 555-3104', office: 'SOB 505', badges: ['Dean', 'Tenured'],
    officeHours: 'Wed 9\u201311AM, Fri 2\u20134PM', specialization: 'Finance, Corporate Strategy',
    tenured: true, publications: 42, rating: 4.1,
  },
  {
    id: 'dir-6', name: 'Dr. Ahmed Hassan', title: 'Dean, College of Health Sciences',
    department: 'Health Sciences', category: 'faculty', email: 'ahassan@westfield.edu',
    phone: '(404) 555-3106', office: 'HSC 601', badges: ['Dean', 'Tenured'],
    officeHours: 'Mon/Wed 10AM\u201312PM', specialization: 'Epidemiology, Public Health Administration',
    tenured: true, publications: 92, rating: 4.7,
  },
  {
    id: 'dir-8', name: 'Dr. Wei Wang', title: 'Associate Professor',
    department: 'Computer Science', category: 'faculty', email: 'wwang@westfield.edu',
    phone: '(404) 555-3108', office: 'Morrison 406', badges: ['Faculty'],
    officeHours: 'Tue/Thu 3\u20135PM', specialization: 'Natural Language Processing, Deep Learning',
    tenured: false, publications: 34, rating: 4.5,
  },
  {
    id: 'dir-10', name: 'Dr. Thomas Rivera', title: 'Dean, College of Fine Arts',
    department: 'Fine Arts', category: 'faculty', email: 'trivera@westfield.edu',
    phone: '(404) 555-3110', office: 'CFA 200', badges: ['Dean', 'Tenured'],
    officeHours: 'Tue 2\u20144PM, Fri 10AM\u201312PM', specialization: 'Sculpture, Contemporary Art Theory',
    tenured: true, publications: 23,
  },
  {
    id: 'dir-12', name: 'Dr. Michael Lopez', title: 'Professor',
    department: 'Arts & Sciences', category: 'faculty', email: 'mlopez@westfield.edu',
    phone: '(404) 555-3112', office: 'Founders 312', badges: ['Faculty', 'Tenured'],
    officeHours: 'Tue/Thu 9\u201311AM', specialization: 'Social Psychology, Behavioral Neuroscience',
    tenured: true, publications: 71, rating: 4.2,
  },
  // Staff
  {
    id: 'dir-20', name: 'Karen Mitchell', title: 'University Registrar',
    department: 'Academic Affairs', category: 'staff', email: 'kmitchell@westfield.edu',
    phone: '(404) 555-4001', office: 'Admin 104', badges: ['Staff'], yearsAtInstitution: 15,
  },
  {
    id: 'dir-23', name: 'James Carter', title: 'VP of Student Affairs',
    department: 'Student Affairs', category: 'staff', email: 'jcarter@westfield.edu',
    phone: '(404) 555-4004', office: 'Carter Center 300', badges: ['Staff', 'VP'], yearsAtInstitution: 20,
  },
  {
    id: 'dir-25', name: 'Robert Harris', title: 'Chief Financial Officer',
    department: 'Finance', category: 'staff', email: 'rharris@westfield.edu',
    phone: '(404) 555-4006', office: 'Admin 400', badges: ['Staff', 'C-Suite'], yearsAtInstitution: 18,
  },
  {
    id: 'dir-26', name: 'Samantha Green', title: 'Director of HR',
    department: 'Human Resources', category: 'staff', email: 'sgreen@westfield.edu',
    phone: '(404) 555-4007', office: 'Admin 310', badges: ['Staff', 'Director'], yearsAtInstitution: 9,
  },
  {
    id: 'dir-27', name: 'Michael Jenkins', title: 'Chief Information Officer',
    department: 'Information Technology', category: 'staff', email: 'mjenkins@westfield.edu',
    phone: '(404) 555-4008', office: 'Morrison 102', badges: ['Staff', 'C-Suite'], yearsAtInstitution: 7,
  },
  // Student Leaders
  {
    id: 'dir-40', name: 'Marcus Johnson', title: 'SGA President',
    department: 'Student Government Association', category: 'student-leader',
    email: 'mjohnson@westfield.edu', phone: '(404) 555-5001', office: 'Student Center 201',
    badges: ['SGA', 'President'], year: 'Senior', major: 'Political Science', gpa: 3.85,
    organization: 'Student Government Association',
  },
  {
    id: 'dir-41', name: 'Priya Sharma', title: 'SGA Vice President',
    department: 'Student Government Association', category: 'student-leader',
    email: 'psharma@westfield.edu', phone: '(404) 555-5002', office: 'Student Center 201',
    badges: ['SGA', 'VP'], year: 'Junior', major: 'Business Administration', gpa: 3.72,
    organization: 'Student Government Association',
  },
  {
    id: 'dir-42', name: 'Tyler Brooks', title: 'President, Engineering Society',
    department: 'Engineering Society', category: 'student-leader',
    email: 'tbrooks@westfield.edu', phone: '(404) 555-5003', office: 'Williams 105',
    badges: ['Org Leader'], year: 'Senior', major: 'Mechanical Engineering', gpa: 3.91,
    organization: 'Engineering Society',
  },
  {
    id: 'dir-45', name: 'Sofia Martinez', title: 'President, Pre-Med Society',
    department: 'Pre-Med Society', category: 'student-leader',
    email: 'smartinez@westfield.edu', phone: '(404) 555-5006', office: 'HSC 105',
    badges: ['Org Leader'], year: 'Junior', major: 'Biology', gpa: 3.94,
    organization: 'Pre-Med Society',
  },
  {
    id: 'dir-46', name: 'Derek Chen', title: 'President, Computer Science Club',
    department: 'Computer Science Club', category: 'student-leader',
    email: 'dchen@westfield.edu', phone: '(404) 555-5007', office: 'Morrison 115',
    badges: ['Org Leader'], year: 'Senior', major: 'Computer Science', gpa: 3.78,
    organization: 'Computer Science Club',
  },
];

const DEPARTMENTS_LIST = [
  'All', 'Computer Science', 'Engineering', 'Arts & Sciences', 'Business',
  'Education', 'Health Sciences', 'Law', 'Fine Arts', 'Academic Affairs',
  'Financial Services', 'Finance', 'Human Resources', 'Information Technology',
];

// =============================================================================
// INLINE MOCK DATA — ORG STRUCTURE
// =============================================================================

interface OrgNode {
  id: string;
  name: string;
  title: string;
  level: 'president' | 'provost' | 'dean' | 'chair' | 'faculty';
  directReports: number;
  department?: string;
  children?: OrgNode[];
}

const ORG_TREE: OrgNode = {
  id: 'org-0',
  name: 'Dr. Eleanor Whitfield',
  title: 'President',
  level: 'president',
  directReports: 6,
  children: [
    {
      id: 'org-1',
      name: 'Dr. Henry Marshall',
      title: 'Provost & VP of Academic Affairs',
      level: 'provost',
      directReports: 8,
      children: [
        {
          id: 'org-10',
          name: 'Dr. Robert Chen',
          title: 'Dean, College of Engineering',
          level: 'dean',
          department: 'Engineering',
          directReports: 82,
          children: [
            { id: 'org-100', name: 'Dr. Sarah Kim', title: 'Chair, Computer Science', level: 'chair', department: 'Computer Science', directReports: 42 },
            { id: 'org-101', name: 'Dr. Alan Drake', title: 'Chair, Electrical Engineering', level: 'chair', department: 'Electrical Engineering', directReports: 18 },
            { id: 'org-102', name: 'Dr. Mei-Lin Zhang', title: 'Chair, Mechanical Engineering', level: 'chair', department: 'Mechanical Engineering', directReports: 22 },
          ],
        },
        {
          id: 'org-11',
          name: 'Dr. Maria Gonzalez',
          title: 'Dean, College of Arts & Sciences',
          level: 'dean',
          department: 'Arts & Sciences',
          directReports: 124,
          children: [
            { id: 'org-110', name: 'Dr. Michael Lopez', title: 'Chair, Psychology', level: 'chair', department: 'Psychology', directReports: 16 },
            { id: 'org-111', name: 'Dr. Rachel Patel', title: 'Chair, English', level: 'chair', department: 'English', directReports: 22 },
          ],
        },
        {
          id: 'org-12',
          name: 'Dr. James Williams',
          title: 'Dean, School of Business',
          level: 'dean',
          department: 'Business',
          directReports: 56,
          children: [
            { id: 'org-120', name: 'Dr. William Forbes', title: 'Chair, Finance', level: 'chair', department: 'Finance', directReports: 12 },
            { id: 'org-121', name: 'Prof. Jennifer Adams', title: 'Chair, Management', level: 'chair', department: 'Management', directReports: 14 },
          ],
        },
        {
          id: 'org-13',
          name: 'Dr. Ahmed Hassan',
          title: 'Dean, College of Health Sciences',
          level: 'dean',
          department: 'Health Sciences',
          directReports: 48,
          children: [
            { id: 'org-130', name: 'Dr. David Okafor', title: 'Chair, Public Health', level: 'chair', department: 'Public Health', directReports: 14 },
          ],
        },
        {
          id: 'org-15',
          name: 'Dr. Patricia Moore',
          title: 'Dean, School of Law',
          level: 'dean',
          department: 'Law',
          directReports: 28,
        },
      ],
    },
    {
      id: 'org-2',
      name: 'James Carter',
      title: 'VP of Student Affairs',
      level: 'provost',
      directReports: 12,
    },
    {
      id: 'org-3',
      name: 'Robert Harris',
      title: 'Chief Financial Officer',
      level: 'provost',
      directReports: 24,
    },
    {
      id: 'org-4',
      name: 'Michael Jenkins',
      title: 'Chief Information Officer',
      level: 'provost',
      directReports: 18,
    },
    {
      id: 'org-5',
      name: 'Samantha Green',
      title: 'Director of Human Resources',
      level: 'provost',
      directReports: 8,
    },
  ],
};

// =============================================================================
// INLINE MOCK DATA — ROLES & COVERAGE
// =============================================================================

interface CoverageCategory {
  id: string;
  name: string;
  seatsFilled: number;
  seatsTotal: number;
  vacancyRate: number;
  avgTimeToFill: number; // days
  critical: boolean;
  openPositions: string[];
}

const COVERAGE_CATEGORIES: CoverageCategory[] = [
  {
    id: 'cov-1', name: 'Tenured Faculty', seatsFilled: 198, seatsTotal: 210,
    vacancyRate: 5.7, avgTimeToFill: 185, critical: false,
    openPositions: ['Professor of Data Science', 'Professor of Bioethics', 'Endowed Chair, Physics'],
  },
  {
    id: 'cov-2', name: 'Tenure-Track Faculty', seatsFilled: 112, seatsTotal: 130,
    vacancyRate: 13.8, avgTimeToFill: 142, critical: true,
    openPositions: ['Asst. Prof. Cybersecurity', 'Asst. Prof. Public Health', 'Asst. Prof. Creative Writing', 'Assoc. Prof. AI/ML', 'Asst. Prof. Nursing'],
  },
  {
    id: 'cov-3', name: 'Adjunct Faculty', seatsFilled: 148, seatsTotal: 160,
    vacancyRate: 7.5, avgTimeToFill: 28, critical: false,
    openPositions: ['Adjunct, Business Law', 'Adjunct, Statistics', 'Adjunct, Music Theory'],
  },
  {
    id: 'cov-4', name: 'Research Staff', seatsFilled: 62, seatsTotal: 72,
    vacancyRate: 13.9, avgTimeToFill: 95, critical: true,
    openPositions: ['Lab Manager, Chemistry', 'Postdoc, ML Research', 'Research Assoc., Genomics', 'Postdoc, Materials Science'],
  },
  {
    id: 'cov-5', name: 'Administrative Staff', seatsFilled: 310, seatsTotal: 325,
    vacancyRate: 4.6, avgTimeToFill: 42, critical: false,
    openPositions: ['Academic Advisor', 'Financial Aid Counselor', 'IT Support Specialist'],
  },
  {
    id: 'cov-6', name: 'Executive Leadership', seatsFilled: 14, seatsTotal: 15,
    vacancyRate: 6.7, avgTimeToFill: 210, critical: true,
    openPositions: ['VP of Research & Innovation'],
  },
];

const COVERAGE_SUMMARY = {
  totalPositions: 1148, totalFilled: 1064, overallVacancy: 7.3,
  criticalGaps: 3, avgTimeToFillDays: 94, openSearches: 28, offersPending: 6, retirementsPending: 11,
};

// =============================================================================
// INLINE MOCK DATA — PERMISSIONS
// =============================================================================

interface PermissionPackage {
  id: string;
  roleName: string;
  level: EducationRoleLens;
  description: string;
  seatCount: number;
  capabilities: string[];
  restrictions: string[];
}

const PERMISSION_PACKAGES: PermissionPackage[] = [
  {
    id: 'perm-1', roleName: 'President / Chancellor', level: 'E1', description: 'Full administrative control',
    seatCount: 1,
    capabilities: ['Full org chart visibility', 'Budget override authority', 'Permissions management', 'All personnel records', 'Accreditation dashboard', 'Board report generation'],
    restrictions: [],
  },
  {
    id: 'perm-2', roleName: 'Provost / Dean', level: 'E2', description: 'Academic and departmental administration',
    seatCount: 12,
    capabilities: ['Department org charts', 'Faculty hiring workflows', 'Curriculum approval', 'Budget viewing (department)', 'Research grant oversight', 'Limited permissions viewing'],
    restrictions: ['Cannot modify system-wide permissions', 'No budget override'],
  },
  {
    id: 'perm-3', roleName: 'Faculty / Staff', level: 'E3', description: 'Teaching, research, and operational access',
    seatCount: 472,
    capabilities: ['Directory access', 'Org structure viewing', 'Own course management', 'Grading tools', 'Limited coverage dashboard'],
    restrictions: ['No personnel records', 'No budget data', 'No permissions management'],
  },
  {
    id: 'perm-4', roleName: 'Student', level: 'E4', description: 'Student-facing services only',
    seatCount: 12847,
    capabilities: ['Public directory (names, offices, hours)', 'Course registration', 'Grade viewing (own)', 'Financial aid portal'],
    restrictions: ['No org structure', 'No coverage data', 'No permissions data', 'Limited contact info'],
  },
  {
    id: 'perm-5', roleName: 'Public / Visitor', level: 'E5', description: 'No authenticated access',
    seatCount: 0,
    capabilities: ['Apply Now portal', 'Visit scheduling', 'Program catalog (public)'],
    restrictions: ['No directory access', 'No authenticated services'],
  },
];

interface AccessLevel {
  resource: string;
  E1: string;
  E2: string;
  E3: string;
  E4: string;
  E5: string;
}

const ACCESS_MATRIX: AccessLevel[] = [
  { resource: 'People Directory', E1: 'Full', E2: 'Full', E3: 'Full', E4: 'Public', E5: 'None' },
  { resource: 'Org Chart', E1: 'Full', E2: 'Full', E3: 'View', E4: 'None', E5: 'None' },
  { resource: 'Personnel Records', E1: 'Full', E2: 'Dept', E3: 'Own', E4: 'None', E5: 'None' },
  { resource: 'Budget Data', E1: 'Full', E2: 'Dept', E3: 'None', E4: 'None', E5: 'None' },
  { resource: 'Grades / Transcripts', E1: 'Full', E2: 'Dept', E3: 'Course', E4: 'Own', E5: 'None' },
  { resource: 'Course Management', E1: 'Full', E2: 'Full', E3: 'Own', E4: 'Enroll', E5: 'None' },
  { resource: 'Research Portal', E1: 'Full', E2: 'Full', E3: 'Full', E4: 'View', E5: 'None' },
  { resource: 'System Settings', E1: 'Full', E2: 'None', E3: 'None', E4: 'None', E5: 'None' },
  { resource: 'Accreditation', E1: 'Full', E2: 'View', E3: 'None', E4: 'None', E5: 'None' },
];

// =============================================================================
// SHARED SUB-COMPONENTS
// =============================================================================

function SectionHeader({ title, colors, count, icon }: { title: string; colors: typeof Colors.light; count?: number; icon?: string }) {
  return (
    <View style={sh.headerRow}>
      {icon && <IconSymbol name={icon as any} size={12} color={colors.textSecondary} />}
      <ThemedText style={[sh.sectionLabel, { color: colors.textSecondary }]}>{title}</ThemedText>
      {count != null && (
        <View style={[sh.countBadge, { backgroundColor: colors.backgroundTertiary }]}>
          <ThemedText style={[sh.countText, { color: colors.textSecondary }]}>{count}</ThemedText>
        </View>
      )}
    </View>
  );
}

function Card({ colors, children, style }: { colors: typeof Colors.light; children: React.ReactNode; style?: any }) {
  return (
    <View style={[sh.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

const sh = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  sectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  countBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
  countText: { fontSize: 10, fontWeight: '600' },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: StyleSheet.hairlineWidth },
});

// =============================================================================
// VIEW TOGGLE PILL BAR
// =============================================================================

function ViewToggle({
  colors,
  activeView,
  onSelect,
  role,
}: {
  colors: typeof Colors.light;
  activeView: PeopleView;
  onSelect: (v: PeopleView) => void;
  role: EducationRoleLens;
}) {
  const accessibleViews = VIEWS.filter((v) => canAccessView(v, role));

  return (
    <View style={vt.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={vt.scrollContent}>
        <View style={[vt.pillRow, { borderColor: colors.border }]}>
          {accessibleViews.map((v) => {
            const isActive = v.id === activeView;
            return (
              <Pressable
                key={v.id}
                style={[
                  vt.pill,
                  { backgroundColor: isActive ? '#FFFFFF20' : 'transparent' },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelect(v.id);
                }}
              >
                <ThemedText
                  style={[vt.pillText, { color: isActive ? '#FFFFFF' : colors.textSecondary }]}
                >
                  {v.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const vt = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  scrollContent: { paddingHorizontal: 0 },
  pillRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

// =============================================================================
// VIEW 1: DIRECTORY
// =============================================================================

function DirectoryView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [searchText, setSearchText] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterCategory, setFilterCategory] = useState<'all' | 'faculty' | 'staff' | 'student-leader'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const showContactDetails = isFacultyLevel(role);
  const showAdminDetails = isDeanLevel(role);
  const isPublicView = isStudent(role);

  // E4 only sees faculty + student leaders (public info)
  const baseList = useMemo(() => {
    if (isPublicView) return DIRECTORY.filter((p) => p.category === 'faculty' || p.category === 'student-leader');
    return DIRECTORY;
  }, [isPublicView]);

  const filtered = useMemo(() => {
    let list = baseList;
    if (filterCategory !== 'all') list = list.filter((p) => p.category === filterCategory);
    if (filterDept !== 'All') list = list.filter((p) => p.department === filterDept);
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q)
      );
    }
    return list;
  }, [baseList, filterCategory, filterDept, searchText]);

  const categoryOptions: { id: typeof filterCategory; label: string }[] = [
    { id: 'all', label: 'All' }, { id: 'faculty', label: 'Faculty' },
    ...(isPublicView ? [] : [{ id: 'staff' as const, label: 'Staff' }]),
    { id: 'student-leader', label: 'Student Leaders' },
  ];

  // People overview summary (E1-E3)
  const summaryBlock = isFacultyLevel(role) ? (
    <View style={s.moduleContainer}>
      <SectionHeader title="PEOPLE OVERVIEW" colors={colors} />
      <Card colors={colors}>
        <View style={s.summaryGrid}>
          {[{ v: '472', l: 'Faculty' }, { v: '680', l: 'Staff' }, { v: '12,847', l: 'Students' }, { v: '14:1', l: 'Ratio' }].map((item) => (
            <View key={item.l} style={s.summaryStat}>
              <ThemedText style={[s.summaryValue, { color: colors.text }]}>{item.v}</ThemedText>
              <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>{item.l}</ThemedText>
            </View>
          ))}
        </View>
        {isDeanLevel(role) && (
          <View style={s.summaryExtraRow}>
            <ThemedText style={[s.summaryExtraText, { color: colors.textSecondary }]}>
              89% with PhD {'\u00B7'} Avg class: 24 {'\u00B7'} 1,480 international {'\u00B7'} Diversity: 0.78
            </ThemedText>
          </View>
        )}
      </Card>
    </View>
  ) : null;

  return (
    <View>
      {summaryBlock}

      {/* Search bar */}
      <View style={s.moduleContainer}>
        <View style={[s.searchContainer, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={14} color={colors.textSecondary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search by name, title, or department..."
            placeholderTextColor={colors.textTertiary}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')}>
              <IconSymbol name="xmark.circle.fill" size={14} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>

        {/* Category + Department filter rows */}
        {[categoryOptions.map((c) => ({ key: c.id, label: c.label, isActive: c.id === filterCategory, onPress: () => setFilterCategory(c.id) })),
          DEPARTMENTS_LIST.slice(0, isPublicView ? 9 : undefined).map((d) => ({ key: d, label: d, isActive: d === filterDept, onPress: () => setFilterDept(d) })),
        ].map((chips, rowIdx) => (
          <ScrollView key={rowIdx} horizontal showsHorizontalScrollIndicator={false} style={s.filterRow}>
            {chips.map((chip) => (
              <Pressable
                key={chip.key}
                style={[s.filterChip, { backgroundColor: chip.isActive ? '#FFFFFF18' : colors.backgroundTertiary, borderColor: chip.isActive ? colors.text : colors.border }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); chip.onPress(); }}
              >
                <ThemedText style={[s.filterChipText, { color: chip.isActive ? colors.text : colors.textSecondary }]} numberOfLines={1}>{chip.label}</ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        ))}
      </View>

      {/* Results */}
      <View style={s.moduleContainer}>
        <SectionHeader title="RESULTS" colors={colors} count={filtered.length} />
        <Card colors={colors}>
          {filtered.length === 0 && (
            <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>
              No results found. Try adjusting your filters.
            </ThemedText>
          )}
          {filtered.map((person, idx) => {
            const isExpanded = expandedId === person.id;
            const initials = person.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
            const categoryColor =
              person.category === 'faculty' ? '#1D9BF0' :
              person.category === 'staff' ? '#F59E0B' : '#22C55E';

            return (
              <Pressable
                key={person.id}
                style={[
                  s.personRow,
                  idx < filtered.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setExpandedId(isExpanded ? null : person.id);
                }}
              >
                <View style={[s.avatarCircle, { backgroundColor: colors.backgroundTertiary }]}>
                  <ThemedText style={[s.avatarText, { color: colors.text }]}>{initials}</ThemedText>
                </View>
                <View style={s.personContent}>
                  <View style={s.personNameRow}>
                    <ThemedText style={[s.personName, { color: colors.text }]} numberOfLines={1}>
                      {person.name}
                    </ThemedText>
                    {person.badges.map((badge) => (
                      <View key={badge} style={[s.roleBadge, { backgroundColor: categoryColor + '20' }]}>
                        <ThemedText style={[s.roleBadgeText, { color: categoryColor }]}>{badge}</ThemedText>
                      </View>
                    ))}
                  </View>
                  <ThemedText style={[s.personTitle, { color: colors.textSecondary }]} numberOfLines={1}>
                    {person.title}
                  </ThemedText>
                  <ThemedText style={[s.personDept, { color: colors.textTertiary }]}>
                    {person.department}
                    {person.officeHours ? ` \u00B7 ${person.officeHours}` : ''}
                    {person.year ? ` \u00B7 ${person.year}` : ''}
                  </ThemedText>

                  {isExpanded && (
                    <View style={s.expandedDetails}>
                      <View style={s.detailRow}>
                        <IconSymbol name="mappin" size={11} color={colors.textSecondary} />
                        <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>{person.office}</ThemedText>
                      </View>
                      {person.specialization && (
                        <View style={s.detailRow}>
                          <IconSymbol name="magnifyingglass" size={11} color={colors.textSecondary} />
                          <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>{person.specialization}</ThemedText>
                        </View>
                      )}
                      {person.major && (
                        <View style={s.detailRow}>
                          <IconSymbol name="book.fill" size={11} color={colors.textSecondary} />
                          <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>{person.major}</ThemedText>
                        </View>
                      )}
                      {showContactDetails && (
                        <>
                          <View style={s.detailRow}>
                            <IconSymbol name="envelope.fill" size={11} color={colors.textSecondary} />
                            <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>{person.email}</ThemedText>
                          </View>
                          <View style={s.detailRow}>
                            <IconSymbol name="phone.fill" size={11} color={colors.textSecondary} />
                            <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>{person.phone}</ThemedText>
                          </View>
                        </>
                      )}
                      {!showContactDetails && isPublicView && (
                        <View style={s.detailRow}>
                          <IconSymbol name="envelope.fill" size={11} color={colors.textSecondary} />
                          <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>{person.email}</ThemedText>
                        </View>
                      )}
                      {showAdminDetails && person.publications != null && (
                        <View style={s.detailRow}>
                          <IconSymbol name="doc.text.fill" size={11} color={colors.textSecondary} />
                          <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>{person.publications} publications</ThemedText>
                        </View>
                      )}
                      {person.rating != null && (
                        <View style={s.detailRow}>
                          <IconSymbol name="star.fill" size={11} color="#F59E0B" />
                          <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>{person.rating}/5.0 rating</ThemedText>
                        </View>
                      )}
                      {showAdminDetails && person.yearsAtInstitution != null && (
                        <View style={s.detailRow}>
                          <IconSymbol name="clock.fill" size={11} color={colors.textSecondary} />
                          <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>{person.yearsAtInstitution} years at institution</ThemedText>
                        </View>
                      )}
                      {isFacultyLevel(role) && person.gpa != null && (
                        <View style={s.detailRow}>
                          <IconSymbol name="chart.bar.fill" size={11} color={colors.textSecondary} />
                          <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>GPA: {person.gpa}</ThemedText>
                        </View>
                      )}
                      {person.organization && (
                        <View style={s.detailRow}>
                          <IconSymbol name="person.3.fill" size={11} color={colors.textSecondary} />
                          <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>{person.organization}</ThemedText>
                        </View>
                      )}
                    </View>
                  )}
                </View>
                <IconSymbol
                  name={isExpanded ? 'chevron.up' : 'chevron.down' as any}
                  size={12}
                  color={colors.textTertiary}
                />
              </Pressable>
            );
          })}
        </Card>
      </View>
    </View>
  );
}

// =============================================================================
// VIEW 2: ORG STRUCTURE
// =============================================================================

function OrgNodeRow({ node, colors, role, depth, expandedIds, onToggle }: {
  node: OrgNode; colors: typeof Colors.light; role: EducationRoleLens;
  depth: number; expandedIds: Set<string>; onToggle: (id: string) => void;
}) {
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const levelColor = node.level === 'president' ? '#EF4444' : node.level === 'provost' ? '#F59E0B' : node.level === 'dean' ? '#1D9BF0' : '#22C55E';
  const levelLabel = node.level === 'president' ? 'PRES' : node.level === 'provost' ? 'VP' : node.level === 'dean' ? 'DEAN' : 'CHAIR';

  return (
    <View>
      <Pressable style={[s.orgRow, { marginLeft: depth * 20 }]} onPress={() => { if (hasChildren) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggle(node.id); } }}>
        {depth > 0 && <View style={[s.orgConnector, { backgroundColor: colors.border }]} />}
        <View style={[s.orgLevelDot, { backgroundColor: levelColor + '30' }]}>
          <ThemedText style={[s.orgLevelDotText, { color: levelColor }]}>{levelLabel}</ThemedText>
        </View>
        <View style={s.orgNodeContent}>
          <ThemedText style={[s.orgNodeName, { color: colors.text }]} numberOfLines={1}>{node.name}</ThemedText>
          <ThemedText style={[s.orgNodeTitle, { color: colors.textSecondary }]} numberOfLines={1}>{node.title}</ThemedText>
          {isDeanLevel(role) && (
            <ThemedText style={[s.orgNodeMeta, { color: colors.textTertiary }]}>
              {node.directReports} reports{node.department ? ` \u00B7 ${node.department}` : ''}
            </ThemedText>
          )}
        </View>
        {hasChildren && <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down' as any} size={11} color={colors.textTertiary} />}
      </Pressable>
      {isExpanded && node.children?.map((child) => (
        <OrgNodeRow key={child.id} node={child} colors={colors} role={role} depth={depth + 1} expandedIds={expandedIds} onToggle={onToggle} />
      ))}
    </View>
  );
}

function OrgStructureView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['org-0', 'org-1']));

  const toggleNode = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collect = (node: OrgNode) => { allIds.add(node.id); node.children?.forEach(collect); };
    collect(ORG_TREE);
    setExpandedIds(allIds);
  };

  const collapseAll = () => setExpandedIds(new Set());

  return (
    <View>
      {/* Org summary */}
      <View style={s.moduleContainer}>
        <SectionHeader title="ORGANIZATIONAL OVERVIEW" colors={colors} />
        <Card colors={colors}>
          <View style={s.summaryGrid}>
            {[{ v: '1', l: 'President' }, { v: '5', l: 'VPs' }, { v: '6', l: 'Deans' }, { v: '11', l: 'Chairs' }].map((item) => (
              <View key={item.l} style={s.summaryStat}>
                <ThemedText style={[s.summaryValue, { color: colors.text }]}>{item.v}</ThemedText>
                <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>{item.l}</ThemedText>
              </View>
            ))}
          </View>
          {isDeanLevel(role) && (
            <View style={s.summaryExtraRow}>
              <ThemedText style={[s.summaryExtraText, { color: colors.textSecondary }]}>
                23 total leadership positions {'\u00B7'} 5 reporting levels {'\u00B7'} 7 colleges/schools
              </ThemedText>
            </View>
          )}
        </Card>
      </View>

      {/* Legend + Expand/Collapse */}
      <View style={[s.legendRow, { marginBottom: Spacing.sm }]}>
        {[{ label: 'President', color: '#EF4444' }, { label: 'VP', color: '#F59E0B' }, { label: 'Dean', color: '#1D9BF0' }, { label: 'Chair', color: '#22C55E' }].map((item) => (
          <View key={item.label} style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: item.color }]} />
            <ThemedText style={[s.legendText, { color: colors.textSecondary }]}>{item.label}</ThemedText>
          </View>
        ))}
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); expandAll(); }}>
          <ThemedText style={[s.orgControlText, { color: colors.textSecondary }]}>Expand</ThemedText>
        </Pressable>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); collapseAll(); }}>
          <ThemedText style={[s.orgControlText, { color: colors.textSecondary }]}>Collapse</ThemedText>
        </Pressable>
      </View>

      {/* Org tree */}
      <View style={s.moduleContainer}>
        <SectionHeader title="ORG CHART" colors={colors} />
        <Card colors={colors}>
          <OrgNodeRow
            node={ORG_TREE}
            colors={colors}
            role={role}
            depth={0}
            expandedIds={expandedIds}
            onToggle={toggleNode}
          />
        </Card>
      </View>

      {/* Reporting chains (admin view) */}
      {isDeanLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="KEY REPORTING CHAINS" colors={colors} />
          <Card colors={colors}>
            {[
              { chain: 'President \u2192 Provost \u2192 Dean of Engineering \u2192 CS Chair', count: '42 faculty' },
              { chain: 'President \u2192 CFO \u2192 Finance Directors \u2192 Analysts', count: '24 staff' },
            ].map((item, idx) => (
              <View key={idx} style={[s.chainRow, idx < 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                <ThemedText style={[s.chainText, { color: colors.textSecondary }]}>{item.chain}</ThemedText>
                <ThemedText style={[s.chainCount, { color: colors.textTertiary }]}>{item.count}</ThemedText>
              </View>
            ))}
          </Card>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// VIEW 3: ROLES & COVERAGE
// =============================================================================

function CoverageView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isLimited = !isDeanLevel(role); // E3 gets limited view

  return (
    <View>
      {/* Coverage summary dashboard */}
      <View style={s.moduleContainer}>
        <SectionHeader title="COVERAGE DASHBOARD" colors={colors} />
        <Card colors={colors}>
          <View style={s.summaryGrid}>
            {[
              { v: COVERAGE_SUMMARY.totalPositions.toLocaleString(), l: 'Total Seats', c: colors.text },
              { v: COVERAGE_SUMMARY.totalFilled.toLocaleString(), l: 'Filled', c: colors.text },
              { v: `${COVERAGE_SUMMARY.overallVacancy}%`, l: 'Vacancy', c: COVERAGE_SUMMARY.overallVacancy > 10 ? '#EF4444' : '#F59E0B' },
              { v: String(COVERAGE_SUMMARY.criticalGaps), l: 'Critical', c: '#EF4444' },
            ].map((item) => (
              <View key={item.l} style={s.summaryStat}>
                <ThemedText style={[s.summaryValue, { color: item.c }]}>{item.v}</ThemedText>
                <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>{item.l}</ThemedText>
              </View>
            ))}
          </View>
          {isDeanLevel(role) && (
            <View style={s.summaryExtraRow}>
              <ThemedText style={[s.summaryExtraText, { color: colors.textSecondary }]}>
                {COVERAGE_SUMMARY.openSearches} open searches {'\u00B7'} {COVERAGE_SUMMARY.offersPending} offers pending {'\u00B7'} {COVERAGE_SUMMARY.retirementsPending} retirements expected {'\u00B7'} Avg fill: {COVERAGE_SUMMARY.avgTimeToFillDays}d
              </ThemedText>
            </View>
          )}
        </Card>
      </View>

      {/* Category breakdown */}
      <View style={s.moduleContainer}>
        <SectionHeader title="SEATS BY CATEGORY" colors={colors} count={COVERAGE_CATEGORIES.length} />
        {COVERAGE_CATEGORIES.map((cat) => {
          const isExpanded = expandedId === cat.id;
          const fillPct = Math.round((cat.seatsFilled / cat.seatsTotal) * 100);
          const barColor = cat.critical ? '#EF4444' : fillPct >= 95 ? '#22C55E' : fillPct >= 85 ? '#F59E0B' : '#EF4444';

          return (
            <Pressable
              key={cat.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setExpandedId(isExpanded ? null : cat.id);
              }}
            >
              <Card colors={colors}>
                <View style={s.coverageHeader}>
                  <View style={s.coverageHeaderLeft}>
                    <View style={s.coverageNameRow}>
                      <ThemedText style={[s.coverageName, { color: colors.text }]}>{cat.name}</ThemedText>
                      {cat.critical && (
                        <View style={[s.criticalBadge, { backgroundColor: '#EF444420' }]}>
                          <ThemedText style={[s.criticalBadgeText, { color: '#EF4444' }]}>CRITICAL</ThemedText>
                        </View>
                      )}
                    </View>
                    <ThemedText style={[s.coverageSubtext, { color: colors.textSecondary }]}>
                      {cat.seatsFilled}/{cat.seatsTotal} filled {'\u00B7'} {cat.vacancyRate}% vacant
                      {!isLimited ? ` \u00B7 Avg fill: ${cat.avgTimeToFill}d` : ''}
                    </ThemedText>
                  </View>
                  <ThemedText style={[s.coveragePct, { color: barColor }]}>{fillPct}%</ThemedText>
                </View>

                {/* Progress bar */}
                <View style={[s.progressBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                  <View style={[s.progressBarFill, { width: `${fillPct}%`, backgroundColor: barColor }]} />
                </View>

                {isExpanded && !isLimited && cat.openPositions.length > 0 && (
                  <View style={s.openPositionsList}>
                    <ThemedText style={[s.openPositionsLabel, { color: colors.textSecondary }]}>
                      Open Positions ({cat.openPositions.length})
                    </ThemedText>
                    {cat.openPositions.map((pos, idx) => (
                      <View key={idx} style={s.openPositionRow}>
                        <View style={[s.openPositionDot, { backgroundColor: barColor }]} />
                        <ThemedText style={[s.openPositionText, { color: colors.textSecondary }]}>{pos}</ThemedText>
                      </View>
                    ))}
                  </View>
                )}

                {isExpanded && isLimited && (
                  <View style={s.limitedNotice}>
                    <IconSymbol name="lock.fill" size={11} color={colors.textTertiary} />
                    <ThemedText style={[s.limitedNoticeText, { color: colors.textTertiary }]}>
                      Detailed position data requires Dean-level access
                    </ThemedText>
                  </View>
                )}
              </Card>
            </Pressable>
          );
        })}
      </View>

      {/* Critical gaps callout (admin only) */}
      {isDeanLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="CRITICAL GAPS" colors={colors} icon="exclamationmark.triangle.fill" />
          <Card colors={colors} style={{ borderColor: '#EF444440' }}>
            {COVERAGE_CATEGORIES.filter((c) => c.critical).map((cat, idx, arr) => (
              <View key={cat.id} style={[s.criticalGapRow, idx < arr.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                <ThemedText style={[s.criticalGapName, { color: '#EF4444' }]}>{cat.name}</ThemedText>
                <ThemedText style={[s.criticalGapDetail, { color: colors.textSecondary }]}>
                  {cat.seatsTotal - cat.seatsFilled} vacancies {'\u00B7'} {cat.vacancyRate}% rate {'\u00B7'} Avg fill: {cat.avgTimeToFill}d
                </ThemedText>
                {cat.openPositions.slice(0, 2).map((pos, posIdx) => (
                  <ThemedText key={posIdx} style={[s.criticalGapPosition, { color: colors.textTertiary }]}>{'\u2022'} {pos}</ThemedText>
                ))}
              </View>
            ))}
          </Card>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// VIEW 4: PERMISSIONS
// =============================================================================

function PermissionsView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isFullAdmin = isPresident(role);

  return (
    <View>
      {/* Permissions overview */}
      <View style={s.moduleContainer}>
        <SectionHeader title="PERMISSION PACKAGES" colors={colors} count={PERMISSION_PACKAGES.length} />
        {PERMISSION_PACKAGES.map((pkg) => {
          const isExpanded = expandedId === pkg.id;
          const levelColor =
            pkg.level === 'E1' ? '#EF4444' :
            pkg.level === 'E2' ? '#F59E0B' :
            pkg.level === 'E3' ? '#1D9BF0' :
            pkg.level === 'E4' ? '#22C55E' : colors.textTertiary;

          return (
            <Pressable
              key={pkg.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setExpandedId(isExpanded ? null : pkg.id);
              }}
            >
              <Card colors={colors}>
                <View style={s.permHeader}>
                  <View style={[s.permLevelBadge, { backgroundColor: levelColor + '20' }]}>
                    <ThemedText style={[s.permLevelText, { color: levelColor }]}>{pkg.level}</ThemedText>
                  </View>
                  <View style={s.permHeaderContent}>
                    <ThemedText style={[s.permRoleName, { color: colors.text }]}>{pkg.roleName}</ThemedText>
                    <ThemedText style={[s.permDescription, { color: colors.textSecondary }]}>{pkg.description}</ThemedText>
                    <ThemedText style={[s.permSeatCount, { color: colors.textTertiary }]}>
                      {pkg.seatCount > 0 ? `${pkg.seatCount.toLocaleString()} seat${pkg.seatCount !== 1 ? 's' : ''}` : 'No seats (unauthenticated)'}
                    </ThemedText>
                  </View>
                  <IconSymbol
                    name={isExpanded ? 'chevron.up' : 'chevron.down' as any}
                    size={12}
                    color={colors.textTertiary}
                  />
                </View>

                {isExpanded && (
                  <View style={s.permExpanded}>
                    {/* Capabilities */}
                    <ThemedText style={[s.permSubheader, { color: '#22C55E' }]}>Capabilities</ThemedText>
                    {pkg.capabilities.map((cap, idx) => (
                      <View key={idx} style={s.permCapRow}>
                        <IconSymbol name="checkmark.circle.fill" size={11} color="#22C55E" />
                        <ThemedText style={[s.permCapText, { color: colors.textSecondary }]}>{cap}</ThemedText>
                      </View>
                    ))}

                    {/* Restrictions */}
                    {pkg.restrictions.length > 0 && (
                      <>
                        <ThemedText style={[s.permSubheader, { color: '#EF4444', marginTop: Spacing.sm }]}>Restrictions</ThemedText>
                        {pkg.restrictions.map((res, idx) => (
                          <View key={idx} style={s.permCapRow}>
                            <IconSymbol name="xmark.circle.fill" size={11} color="#EF4444" />
                            <ThemedText style={[s.permCapText, { color: colors.textSecondary }]}>{res}</ThemedText>
                          </View>
                        ))}
                      </>
                    )}

                    {/* Management action (E1 only) */}
                    {isFullAdmin && (
                      <View style={[s.permManageAction, { backgroundColor: colors.backgroundTertiary }]}>
                        <IconSymbol name="gearshape.fill" size={12} color={colors.textSecondary} />
                        <ThemedText style={[s.permManageText, { color: colors.textSecondary }]}>
                          Manage {pkg.roleName} permissions
                        </ThemedText>
                      </View>
                    )}
                  </View>
                )}
              </Card>
            </Pressable>
          );
        })}
      </View>

      {/* Access Level Matrix */}
      <View style={s.moduleContainer}>
        <SectionHeader title="ACCESS LEVELS MATRIX" colors={colors} />
        <Card colors={colors}>
          {/* Matrix header */}
          <View style={[s.matrixRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={s.matrixResourceCell}>
              <ThemedText style={[s.matrixHeaderText, { color: colors.textSecondary }]}>Resource</ThemedText>
            </View>
            {['E1', 'E2', 'E3', 'E4', 'E5'].map((lvl) => (
              <View key={lvl} style={s.matrixLevelCell}>
                <ThemedText style={[s.matrixHeaderText, { color: colors.textSecondary }]}>{lvl}</ThemedText>
              </View>
            ))}
          </View>

          {/* Matrix rows */}
          {ACCESS_MATRIX.map((row, idx) => (
            <View
              key={row.resource}
              style={[
                s.matrixRow,
                idx < ACCESS_MATRIX.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={s.matrixResourceCell}>
                <ThemedText style={[s.matrixResourceText, { color: colors.text }]} numberOfLines={1}>
                  {row.resource}
                </ThemedText>
              </View>
              {(['E1', 'E2', 'E3', 'E4', 'E5'] as const).map((lvl) => {
                const value = row[lvl];
                const cellColor =
                  value === 'Full' ? '#22C55E' :
                  value === 'Dept' || value === 'Course' || value === 'Own' || value === 'View' || value === 'Enroll' || value === 'Public' ? '#F59E0B' :
                  '#EF4444';

                return (
                  <View key={lvl} style={s.matrixLevelCell}>
                    <ThemedText style={[s.matrixCellText, { color: cellColor }]} numberOfLines={1}>
                      {value}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          ))}
        </Card>
      </View>

      {/* RBAC Stats (E1 only) */}
      {isFullAdmin && (
        <View style={s.moduleContainer}>
          <SectionHeader title="RBAC OVERVIEW" colors={colors} />
          <Card colors={colors}>
            <View style={s.summaryGrid}>
              {[{ v: '5', l: 'Role Levels', c: colors.text }, { v: '9', l: 'Resources', c: colors.text }, { v: '13,332', l: 'Total Seats', c: colors.text }, { v: '98.2%', l: 'Compliant', c: '#22C55E' }].map((item) => (
                <View key={item.l} style={s.summaryStat}>
                  <ThemedText style={[s.summaryValue, { color: item.c }]}>{item.v}</ThemedText>
                  <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>{item.l}</ThemedText>
                </View>
              ))}
            </View>
            <View style={s.summaryExtraRow}>
              <ThemedText style={[s.summaryExtraText, { color: colors.textSecondary }]}>
                Last audit: Feb 3, 2026 {'\u00B7'} Next review: Mar 15, 2026 {'\u00B7'} 24 pending role changes
              </ThemedText>
            </View>
          </Card>
        </View>
      )}

      {/* Limited view notice (E2) */}
      {!isFullAdmin && (
        <View style={s.moduleContainer}>
          <Card colors={colors}>
            <View style={s.limitedNotice}>
              <IconSymbol name="lock.fill" size={14} color={colors.textTertiary} />
              <ThemedText style={[s.limitedNoticeText, { color: colors.textTertiary }]}>
                Permission management and RBAC configuration require President-level access. Contact the President's office for role changes.
              </ThemedText>
            </View>
          </Card>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// BLOCK: HIDDEN NOTICE (E5)
// =============================================================================

function HiddenNotice({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={s.hiddenContainer}>
      <Card colors={colors}>
        <View style={s.hiddenContent}>
          <IconSymbol name="lock.fill" size={28} color={colors.textTertiary} />
          <ThemedText style={[s.hiddenTitle, { color: colors.text }]}>
            Directory Not Available
          </ThemedText>
          <ThemedText style={[s.hiddenText, { color: colors.textSecondary }]}>
            The people directory is available to enrolled students, faculty, and staff. Please sign in with your university credentials to access this section.
          </ThemedText>
        </View>
      </Card>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function EduPeople({ colors, role = 'E1', onSwitchTab }: Props) {
  const [activeView, setActiveView] = useState<PeopleView>('directory');

  // E5 sees nothing
  if (role === 'E5') {
    return (
      <ScrollView
        style={[s.container, { backgroundColor: colors.background }]}
        contentContainerStyle={s.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <HiddenNotice colors={colors} />
        <View style={s.bottomSpacer} />
      </ScrollView>
    );
  }

  // Ensure active view is accessible for current role
  const effectiveView = canAccessView(
    VIEWS.find((v) => v.id === activeView)!,
    role
  ) ? activeView : 'directory';

  const renderActiveView = () => {
    switch (effectiveView) {
      case 'directory':
        return <DirectoryView colors={colors} role={role} />;
      case 'org-structure':
        return <OrgStructureView colors={colors} role={role} />;
      case 'coverage':
        return <CoverageView colors={colors} role={role} />;
      case 'permissions':
        return <PermissionsView colors={colors} role={role} />;
      default:
        return <DirectoryView colors={colors} role={role} />;
    }
  };

  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Pill toggle */}
      <ViewToggle
        colors={colors}
        activeView={effectiveView}
        onSelect={setActiveView}
        role={role}
      />

      {/* Active view */}
      {renderActiveView()}

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

  // Summary
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.sm },
  summaryStat: { alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '700' },
  summaryLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  summaryExtraRow: { marginTop: Spacing.sm },
  summaryExtraText: { fontSize: 11, textAlign: 'center' },
  emptyText: { fontSize: 13, textAlign: 'center', paddingVertical: Spacing.lg },

  // Search
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 10,
    borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, marginBottom: Spacing.sm,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },

  // Filters
  filterRow: { marginBottom: Spacing.sm },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full,
    marginRight: Spacing.xs, borderWidth: StyleSheet.hairlineWidth,
  },
  filterChipText: { fontSize: 11, fontWeight: '600' },

  // Person rows (shared)
  personRow: { flexDirection: 'row', paddingVertical: 12, gap: Spacing.sm },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700' },
  personContent: { flex: 1 },
  personNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 1, flexWrap: 'wrap' },
  personName: { fontSize: 14, fontWeight: '600' },
  personTitle: { fontSize: 12, marginBottom: 1 },
  personDept: { fontSize: 11 },

  // Role badges
  roleBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm },
  roleBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // Expanded details
  expandedDetails: { marginTop: Spacing.sm, gap: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  detailText: { fontSize: 12, flex: 1 },

  // Org structure
  orgRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: 10, paddingRight: Spacing.sm,
  },
  orgConnector: { width: 1, height: 20, position: 'absolute', left: -10, top: 0 },
  orgLevelDot: {
    width: 36, height: 22, borderRadius: BorderRadius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  orgLevelDotText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  orgNodeContent: { flex: 1 },
  orgNodeName: { fontSize: 13, fontWeight: '600' },
  orgNodeTitle: { fontSize: 11, marginTop: 1 },
  orgNodeMeta: { fontSize: 10, marginTop: 2 },

  orgControlText: { fontSize: 11, fontWeight: '600' },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, fontWeight: '500' },

  // Chains
  chainRow: { paddingVertical: 10 },
  chainText: { fontSize: 12, lineHeight: 16 },
  chainCount: { fontSize: 10, marginTop: 2 },

  // Coverage
  coverageHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.sm },
  coverageHeaderLeft: { flex: 1, marginRight: Spacing.sm },
  coverageNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  coverageName: { fontSize: 14, fontWeight: '600' },
  coverageSubtext: { fontSize: 11, marginTop: 2 },
  coveragePct: { fontSize: 18, fontWeight: '700' },
  criticalBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm },
  criticalBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // Progress bar
  progressBarBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 2 },

  // Open positions
  openPositionsList: { marginTop: Spacing.sm },
  openPositionsLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  openPositionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 3 },
  openPositionDot: { width: 4, height: 4, borderRadius: 2 },
  openPositionText: { fontSize: 12 },

  // Critical gaps
  criticalGapRow: { paddingVertical: 12 },
  criticalGapName: { fontSize: 14, fontWeight: '700' },
  criticalGapDetail: { fontSize: 11, marginTop: 2 },
  criticalGapPosition: { fontSize: 11, marginTop: 3, marginLeft: 8 },

  // Limited notice
  limitedNotice: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  limitedNoticeText: { fontSize: 12, flex: 1 },

  // Permissions
  permHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  permLevelBadge: {
    width: 36, height: 22, borderRadius: BorderRadius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  permLevelText: { fontSize: 11, fontWeight: '800' },
  permHeaderContent: { flex: 1 },
  permRoleName: { fontSize: 14, fontWeight: '600' },
  permDescription: { fontSize: 11, marginTop: 1 },
  permSeatCount: { fontSize: 10, marginTop: 2 },

  permExpanded: { marginTop: Spacing.md },
  permSubheader: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 },
  permCapRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 2 },
  permCapText: { fontSize: 12, flex: 1 },

  permManageAction: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md, marginTop: Spacing.md,
  },
  permManageText: { fontSize: 12, fontWeight: '600' },

  // Matrix
  matrixRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  matrixResourceCell: { flex: 2, paddingRight: 4 },
  matrixLevelCell: { flex: 1, alignItems: 'center' },
  matrixHeaderText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  matrixResourceText: { fontSize: 11, fontWeight: '500' },
  matrixCellText: { fontSize: 10, fontWeight: '600' },

  // Hidden notice
  hiddenContainer: { marginTop: Spacing.xl },
  hiddenContent: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  hiddenTitle: { fontSize: 16, fontWeight: '700' },
  hiddenText: { fontSize: 13, textAlign: 'center', lineHeight: 18, paddingHorizontal: Spacing.md },
});
