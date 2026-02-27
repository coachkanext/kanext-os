/**
 * BizPeople — Company Directory + Structural Hierarchy
 * Single vertical scroll. 5 sections. No metrics. No compensation.
 * Directory and structure only.
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing } from '@/constants/theme';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// DATA — Directory facts only. No compensation. No equity. No payroll.
// =============================================================================

interface Person {
  id: string;
  name: string;
  initials: string;
  title: string;
  department: string;
  authorityClass: string;
  domainScope: string;
  status: 'Active' | 'Advisory' | 'Board';
  reportsTo: string | null;
  startDate: string;
  responsibilities: string[];
}

const EXECUTIVES: Person[] = [
  { id: 'e1', name: 'Alex Morgan', initials: 'AM', title: 'Founder & CEO', department: 'Executive', authorityClass: 'A5', domainScope: 'Entity-wide', status: 'Active', reportsTo: null, startDate: 'Mar 2023', responsibilities: ['Corporate strategy', 'Capital allocation', 'Board governance', 'Executive hiring'] },
  { id: 'e2', name: 'Jordan Ellis', initials: 'JE', title: 'Chief Operating Officer', department: 'Operations', authorityClass: 'A4', domainScope: 'Entity-wide', status: 'Active', reportsTo: 'Alex Morgan', startDate: 'Jun 2023', responsibilities: ['Day-to-day operations', 'Vendor management', 'Process design', 'Cross-department coordination'] },
  { id: 'e3', name: 'Marcus Chen', initials: 'MC', title: 'Chief Technology Officer', department: 'Engineering', authorityClass: 'A4', domainScope: 'Engineering + Product', status: 'Active', reportsTo: 'Alex Morgan', startDate: 'Apr 2023', responsibilities: ['Technical architecture', 'Engineering roadmap', 'Infrastructure', 'Security posture'] },
  { id: 'e4', name: 'Laura Mitchell', initials: 'LM', title: 'General Counsel', department: 'Legal', authorityClass: 'A4', domainScope: 'Entity-wide', status: 'Active', reportsTo: 'Alex Morgan', startDate: 'Sep 2023', responsibilities: ['Corporate governance', 'IP protection', 'Regulatory compliance', 'Contract review'] },
  { id: 'e5', name: 'Nina Patel', initials: 'NP', title: 'Chief Financial Officer', department: 'Finance', authorityClass: 'A4', domainScope: 'Entity-wide', status: 'Active', reportsTo: 'Alex Morgan', startDate: 'Jan 2024', responsibilities: ['Financial reporting', 'Capital management', 'Budget oversight', 'Investor relations'] },
];

interface DepartmentData {
  name: string;
  people: Person[];
}

const DEPARTMENTS: DepartmentData[] = [
  { name: 'Engineering', people: [
    { id: 'd1', name: 'David Park', initials: 'DP', title: 'Lead Engineer', department: 'Engineering', authorityClass: 'A2', domainScope: 'Engineering', status: 'Active', reportsTo: 'Marcus Chen', startDate: 'May 2023', responsibilities: ['Frontend architecture', 'Code review', 'Sprint planning'] },
    { id: 'd2', name: 'Priya Sharma', initials: 'PS', title: 'Backend Engineer', department: 'Engineering', authorityClass: 'A1', domainScope: 'Engineering', status: 'Active', reportsTo: 'David Park', startDate: 'Aug 2023', responsibilities: ['API development', 'Database management', 'Service integration'] },
    { id: 'd3', name: 'Ryan Torres', initials: 'RT', title: 'Mobile Engineer', department: 'Engineering', authorityClass: 'A1', domainScope: 'Engineering', status: 'Active', reportsTo: 'David Park', startDate: 'Oct 2023', responsibilities: ['React Native development', 'Platform-specific features'] },
  ]},
  { name: 'Product', people: [
    { id: 'd4', name: 'Aisha Williams', initials: 'AW', title: 'Head of Product', department: 'Product', authorityClass: 'A3', domainScope: 'Product', status: 'Active', reportsTo: 'Alex Morgan', startDate: 'Jul 2023', responsibilities: ['Product roadmap', 'User research', 'Feature prioritization'] },
    { id: 'd5', name: 'Sofia Reyes', initials: 'SR', title: 'Product Designer', department: 'Product', authorityClass: 'A1', domainScope: 'Product', status: 'Active', reportsTo: 'Aisha Williams', startDate: 'Nov 2023', responsibilities: ['UI/UX design', 'Design system', 'Prototyping'] },
  ]},
  { name: 'Operations', people: [
    { id: 'd6', name: 'Kenji Yamamoto', initials: 'KY', title: 'Operations Coordinator', department: 'Operations', authorityClass: 'A1', domainScope: 'Operations', status: 'Active', reportsTo: 'Jordan Ellis', startDate: 'Jan 2024', responsibilities: ['Scheduling', 'Vendor coordination', 'Office management'] },
  ]},
  { name: 'Finance', people: [
    { id: 'd7', name: 'Carla Mendez', initials: 'CM', title: 'Financial Analyst', department: 'Finance', authorityClass: 'A1', domainScope: 'Finance', status: 'Active', reportsTo: 'Nina Patel', startDate: 'Mar 2024', responsibilities: ['Financial modeling', 'Reporting', 'Budget tracking'] },
  ]},
  { name: 'Marketing', people: [
    { id: 'd8', name: 'Ethan Brooks', initials: 'EB', title: 'Marketing Lead', department: 'Marketing', authorityClass: 'A2', domainScope: 'Marketing', status: 'Active', reportsTo: 'Jordan Ellis', startDate: 'Feb 2024', responsibilities: ['Brand strategy', 'Content marketing', 'Growth campaigns'] },
  ]},
];

interface BoardMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  scope: 'Board' | 'Advisory';
  votingRights: boolean;
}

const BOARD_ADVISORS: BoardMember[] = [
  { id: 'b1', name: 'Alex Morgan', initials: 'AM', role: 'Board Chair / Founder', scope: 'Board', votingRights: true },
  { id: 'b2', name: 'Dr. Patricia Moore', initials: 'PM', role: 'Board Member / Investor', scope: 'Board', votingRights: true },
  { id: 'b3', name: 'James Bradford', initials: 'JB', role: 'Strategic Advisor', scope: 'Advisory', votingRights: false },
  { id: 'b4', name: 'Diane Okafor', initials: 'DO', role: 'Industry Advisor', scope: 'Advisory', votingRights: false },
];

interface Contractor {
  id: string;
  name: string;
  initials: string;
  function: string;
  status: 'Active' | 'Inactive';
}

const CONTRACTORS: Contractor[] = [
  { id: 'v1', name: 'Mitchell & Associates', initials: 'MA', function: 'Outside Counsel', status: 'Active' },
  { id: 'v2', name: 'CloudOps Solutions', initials: 'CO', function: 'DevOps / Infrastructure', status: 'Active' },
  { id: 'v3', name: 'BrandForge Studio', initials: 'BF', function: 'Brand Design', status: 'Active' },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function BizPeople({ colors }: Props) {
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const toggleDept = useCallback((name: string) => {
    Haptics.selectionAsync();
    setExpandedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const openProfile = useCallback((person: Person) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPerson(person);
    setSheetVisible(true);
  }, []);

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* SECTION 1 — Executive Leadership */}
        <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>EXECUTIVE LEADERSHIP</ThemedText>
        {EXECUTIVES.map((exec) => (
          <PersonRow key={exec.id} person={exec} colors={colors} onPress={() => openProfile(exec)} />
        ))}

        {/* SECTION 2 — Departments */}
        <ThemedText style={[s.sectionLabel, { color: colors.textTertiary, marginTop: Spacing.lg }]}>DEPARTMENTS</ThemedText>
        {DEPARTMENTS.map((dept) => {
          const isExpanded = expandedDepts.has(dept.name);
          return (
            <View key={dept.name}>
              <Pressable
                style={[s.deptHeader, { borderColor: colors.border }]}
                onPress={() => toggleDept(dept.name)}
              >
                <ThemedText style={[s.deptName, { color: colors.text }]}>{dept.name}</ThemedText>
                <View style={s.deptRight}>
                  <ThemedText style={[s.deptCount, { color: colors.textTertiary }]}>{dept.people.length}</ThemedText>
                  <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down'} size={14} color={colors.textTertiary} />
                </View>
              </Pressable>
              {isExpanded && dept.people.map((person) => (
                <PersonRow key={person.id} person={person} colors={colors} onPress={() => openProfile(person)} indent />
              ))}
            </View>
          );
        })}

        {/* SECTION 3 — Board / Advisors */}
        <ThemedText style={[s.sectionLabel, { color: colors.textTertiary, marginTop: Spacing.lg }]}>BOARD / ADVISORS</ThemedText>
        {BOARD_ADVISORS.map((member) => (
          <View key={member.id} style={[s.row, { borderColor: colors.border }]}>
            <View style={[s.avatar, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[s.avatarText, { color: colors.textSecondary }]}>{member.initials}</ThemedText>
            </View>
            <View style={s.rowContent}>
              <ThemedText style={[s.rowName, { color: colors.text }]}>{member.name}</ThemedText>
              <ThemedText style={[s.rowSub, { color: colors.textSecondary }]}>{member.role}</ThemedText>
              <View style={s.metaRow}>
                <ThemedText style={[s.metaTag, { color: colors.textTertiary }]}>{member.scope}</ThemedText>
                <ThemedText style={[s.metaDivider, { color: colors.textTertiary }]}>{'\u00B7'}</ThemedText>
                <ThemedText style={[s.metaTag, { color: colors.textTertiary }]}>
                  Voting: {member.votingRights ? 'Yes' : 'No'}
                </ThemedText>
              </View>
            </View>
          </View>
        ))}

        {/* SECTION 4 — Contractors / Vendors */}
        <ThemedText style={[s.sectionLabel, { color: colors.textTertiary, marginTop: Spacing.lg }]}>CONTRACTORS / VENDORS</ThemedText>
        {CONTRACTORS.map((c) => (
          <View key={c.id} style={[s.row, { borderColor: colors.border }]}>
            <View style={[s.avatar, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[s.avatarText, { color: colors.textSecondary }]}>{c.initials}</ThemedText>
            </View>
            <View style={s.rowContent}>
              <ThemedText style={[s.rowName, { color: colors.text }]}>{c.name}</ThemedText>
              <ThemedText style={[s.rowSub, { color: colors.textSecondary }]}>{c.function}</ThemedText>
            </View>
            <ThemedText style={[s.statusLabel, { color: colors.textTertiary }]}>{c.status}</ThemedText>
          </View>
        ))}
      </ScrollView>

      {/* Profile Sheet */}
      <BottomSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} useModal>
        <BottomSheetScrollView contentContainerStyle={s.sheetContent}>
          {selectedPerson && (
            <>
              <View style={s.sheetHeader}>
                <View style={[s.sheetAvatar, { backgroundColor: colors.backgroundTertiary }]}>
                  <ThemedText style={[s.sheetAvatarText, { color: colors.textSecondary }]}>{selectedPerson.initials}</ThemedText>
                </View>
                <ThemedText style={[s.sheetName, { color: colors.text }]}>{selectedPerson.name}</ThemedText>
                <ThemedText style={[s.sheetTitle, { color: colors.textSecondary }]}>{selectedPerson.title}</ThemedText>
              </View>

              <View style={s.sheetFields}>
                <SheetField label="Department" value={selectedPerson.department} colors={colors} />
                <SheetField label="Authority Class" value={selectedPerson.authorityClass} colors={colors} />
                <SheetField label="Domain Scope" value={selectedPerson.domainScope} colors={colors} />
                <SheetField label="Status" value={selectedPerson.status} colors={colors} />
                <SheetField label="Reports To" value={selectedPerson.reportsTo ?? 'None'} colors={colors} />
                <SheetField label="Start Date" value={selectedPerson.startDate} colors={colors} />
              </View>

              <ThemedText style={[s.sheetSectionLabel, { color: colors.textTertiary }]}>ASSIGNED RESPONSIBILITIES</ThemedText>
              {selectedPerson.responsibilities.map((r) => (
                <ThemedText key={r} style={[s.sheetResponsibility, { color: colors.text }]}>
                  {r}
                </ThemedText>
              ))}
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function PersonRow({
  person,
  colors,
  onPress,
  indent,
}: {
  person: Person;
  colors: typeof Colors.light;
  onPress: () => void;
  indent?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        s.row,
        { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
        indent && s.rowIndented,
      ]}
      onPress={onPress}
    >
      <View style={[s.avatar, { backgroundColor: colors.backgroundTertiary }]}>
        <ThemedText style={[s.avatarText, { color: colors.textSecondary }]}>{person.initials}</ThemedText>
      </View>
      <View style={s.rowContent}>
        <ThemedText style={[s.rowName, { color: colors.text }]}>{person.name}</ThemedText>
        <ThemedText style={[s.rowSub, { color: colors.textSecondary }]}>{person.title}</ThemedText>
        <View style={s.metaRow}>
          <ThemedText style={[s.metaTag, { color: colors.textTertiary }]}>{person.authorityClass}</ThemedText>
          <ThemedText style={[s.metaDivider, { color: colors.textTertiary }]}>{'\u00B7'}</ThemedText>
          <ThemedText style={[s.metaTag, { color: colors.textTertiary }]}>{person.status}</ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

function SheetField({ label, value, colors }: { label: string; value: string; colors: typeof Colors.light }) {
  return (
    <View style={s.sheetFieldRow}>
      <ThemedText style={[s.sheetFieldLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
      <ThemedText style={[s.sheetFieldValue, { color: colors.text }]}>{value}</ThemedText>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },

  // Person row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIndented: {
    paddingLeft: 16,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontSize: 14,
    fontWeight: '600',
  },
  rowSub: {
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  metaTag: {
    fontSize: 11,
    fontWeight: '500',
  },
  metaDivider: {
    fontSize: 11,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Avatar
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Department header
  deptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  deptName: {
    fontSize: 14,
    fontWeight: '600',
  },
  deptRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deptCount: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Profile Sheet
  sheetContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  sheetHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sheetAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sheetAvatarText: {
    fontSize: 22,
    fontWeight: '700',
  },
  sheetName: {
    fontSize: 20,
    fontWeight: '700',
  },
  sheetTitle: {
    fontSize: 14,
    marginTop: 4,
  },
  sheetFields: {
    marginBottom: Spacing.lg,
  },
  sheetFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  sheetFieldLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  sheetFieldValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  sheetSectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  sheetResponsibility: {
    fontSize: 13,
    lineHeight: 20,
    paddingVertical: 4,
    paddingLeft: 8,
  },
});
