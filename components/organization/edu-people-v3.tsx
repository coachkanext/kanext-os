/**
 * Edu People V3 — 3-pill ViewBar (Faculty | Staff | Students)
 * Carroll College · President perspective
 * Private University · Founded 1867 · Washington, DC · Regionally Accredited
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';

// =============================================================================
// TYPES & MOCK DATA
// =============================================================================


const ACCENT = MODE_ACCENT.education;
type ViewId = 'faculty' | 'staff' | 'students';

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'faculty', label: 'Faculty' },
  { id: 'staff', label: 'Staff' },
  { id: 'students', label: 'Students' },
];

type TenureStatus = 'Tenured' | 'Tenure-Track' | 'Adjunct';
type FacultyFilter = 'All' | TenureStatus;

const FACULTY_FILTERS: FacultyFilter[] = ['All', 'Tenured', 'Tenure-Track', 'Adjunct'];

interface FacultyMember {
  id: string;
  name: string;
  title: string;
  department: string;
  tenure: TenureStatus;
  rank: string;
  hireDate: string;
}

const FACULTY: FacultyMember[] = [
  { id: 'f1', name: 'Dr. Patricia Moore', title: 'Professor', department: 'Business', tenure: 'Tenured', rank: 'Full Professor', hireDate: '2008' },
  { id: 'f2', name: 'Dr. Angela Davis', title: 'Professor', department: 'Education', tenure: 'Tenured', rank: 'Full Professor', hireDate: '2005' },
  { id: 'f3', name: 'Dr. Robert Johnson', title: 'Associate Professor', department: 'Arts & Sciences', tenure: 'Tenured', rank: 'Associate Professor', hireDate: '2012' },
  { id: 'f4', name: 'Dr. Karen Williams', title: 'Associate Professor', department: 'Computer Science', tenure: 'Tenure-Track', rank: 'Associate Professor', hireDate: '2018' },
  { id: 'f5', name: 'Capt. James Wright', title: 'Associate Professor', department: 'Aviation', tenure: 'Tenured', rank: 'Associate Professor', hireDate: '2010' },
  { id: 'f6', name: 'Dr. Alex Morgan', title: 'Assistant Professor', department: 'Criminal Justice', tenure: 'Tenure-Track', rank: 'Assistant Professor', hireDate: '2021' },
  { id: 'f7', name: 'Dr. Lisa Chen', title: 'Assistant Professor', department: 'Arts & Sciences', tenure: 'Tenure-Track', rank: 'Assistant Professor', hireDate: '2022' },
  { id: 'f8', name: 'Prof. David Brown', title: 'Adjunct Professor', department: 'Business', tenure: 'Adjunct', rank: 'Adjunct', hireDate: '2023' },
];

interface StaffMember {
  id: string;
  name: string;
  title: string;
  reportsTo: string;
  department: string;
}

const STAFF: StaffMember[] = [
  { id: 's1', name: 'Dr. Jaffus Hardrick', title: 'President', reportsTo: 'Board of Trustees', department: 'Office of the President' },
  { id: 's2', name: 'Dr. Cynthia Barnes', title: 'Provost & VP Academic Affairs', reportsTo: 'President', department: 'Academic Affairs' },
  { id: 's3', name: 'Mr. William Carter', title: 'VP Finance & Administration', reportsTo: 'President', department: 'Finance' },
  { id: 's4', name: 'Dr. Tamara Mitchell', title: 'VP Student Affairs', reportsTo: 'President', department: 'Student Affairs' },
  { id: 's5', name: 'Ms. Nicole Harris', title: 'VP Enrollment Management', reportsTo: 'President', department: 'Enrollment' },
  { id: 's6', name: 'Dr. Raymond Scott', title: 'Dean, School of Business', reportsTo: 'Provost', department: 'Business' },
  { id: 's7', name: 'Dr. Cheryl Washington', title: 'Dean, School of Education', reportsTo: 'Provost', department: 'Education' },
  { id: 's8', name: 'Ms. Diane Foster', title: 'Registrar', reportsTo: 'Provost', department: 'Registrar Office' },
];

const ENROLLMENT_BREAKDOWN = [
  { level: 'Freshman', count: 380 },
  { level: 'Sophomore', count: 290 },
  { level: 'Junior', count: 210 },
  { level: 'Senior', count: 170 },
  { level: 'Graduate', count: 150 },
];

const STUDENT_ORGS = [
  { id: 'so1', name: 'Student Government Association', members: 45 },
  { id: 'so2', name: 'National Pan-Hellenic Council', members: 120 },
  { id: 'so3', name: 'Black Student Union', members: 85 },
  { id: 'so4', name: 'Aviation Club', members: 40 },
  { id: 'so5', name: 'Computer Science Society', members: 55 },
  { id: 'so6', name: 'Criminal Justice Association', members: 35 },
];

const SGA_OFFICERS = [
  { id: 'sg1', name: 'Jordan Williams', position: 'President' },
  { id: 'sg2', name: 'Aisha Jackson', position: 'Vice President' },
  { id: 'sg3', name: 'Marcus Green', position: 'Treasurer' },
];

const TENURE_COLOR: Record<TenureStatus, string> = {
  'Tenured': '#22C55E',
  'Tenure-Track': ACCENT,
  'Adjunct': '#F59E0B',
};

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// VIEW: FACULTY
// =============================================================================

function FacultyView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const [filter, setFilter] = useState<FacultyFilter>('All');

  const filtered = filter === 'All' ? FACULTY : FACULTY.filter((f) => f.tenure === filter);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Ratio */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.ratioRow}>
          <IconSymbol name="person.3.fill" size={16} color={accentColor} />
          <ThemedText style={[s.ratioText, { color: colors.text }]}>
            Faculty-to-Student Ratio: <ThemedText style={{ fontWeight: '700', color: accentColor }}>1:15</ThemedText>
          </ThemedText>
        </View>
      </View>

      {/* Filter pills */}
      <View style={s.filterBar}>
        {FACULTY_FILTERS.map((f) => {
          const isActive = f === filter;
          return (
            <Pressable
              key={f}
              style={[s.filterPill, { backgroundColor: isActive ? accentColor : '#2F3336' }]}
              onPress={() => { Haptics.selectionAsync(); setFilter(f); }}
            >
              <ThemedText style={[s.filterPillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {f}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Faculty list */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
        FACULTY ({filtered.length})
      </ThemedText>
      {filtered.map((f) => (
        <Pressable
          key={f.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Haptics.selectionAsync()}
        >
          <View style={s.facultyHeader}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.facultyName, { color: colors.text }]}>{f.name}</ThemedText>
              <ThemedText style={[s.facultyTitle, { color: colors.textSecondary }]}>{f.title}</ThemedText>
            </View>
            <StatusBadge label={f.tenure.toUpperCase()} color={TENURE_COLOR[f.tenure]} />
          </View>
          <View style={[s.facultyMeta, { borderTopColor: colors.border }]}>
            <ThemedText style={[s.metaText, { color: colors.textSecondary }]}>
              {f.department} · {f.rank} · Since {f.hireDate}
            </ThemedText>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: STAFF
// =============================================================================

function StaffView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>ORGANIZATIONAL CHART</ThemedText>

      {STAFF.map((member, idx) => {
        const indent = member.reportsTo === 'Board of Trustees' ? 0 : member.reportsTo === 'President' ? 1 : 2;
        return (
          <Pressable
            key={member.id}
            style={[
              s.card,
              { backgroundColor: colors.card, borderColor: colors.border, marginLeft: indent * 16 },
            ]}
            onPress={() => Haptics.selectionAsync()}
          >
            <View style={s.staffHeader}>
              <IconSymbol
                name={indent === 0 ? 'star.fill' : indent === 1 ? 'person.fill' : 'person.fill'}
                size={16}
                color={indent === 0 ? accentColor : colors.textSecondary}
              />
              <View style={{ flex: 1 }}>
                <ThemedText style={[s.staffName, { color: colors.text }]}>{member.name}</ThemedText>
                <ThemedText style={[s.staffTitle, { color: colors.textSecondary }]}>{member.title}</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
            </View>
            <View style={[s.staffMeta, { borderTopColor: colors.border }]}>
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>
                Reports to: {member.reportsTo} · {member.department}
              </ThemedText>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: STUDENTS
// =============================================================================

function StudentsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const totalEnrollment = ENROLLMENT_BREAKDOWN.reduce((sum, e) => sum + e.count, 0);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Enrollment Overview */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>ENROLLMENT OVERVIEW</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.statRow}>
          <View style={s.statItem}>
            <ThemedText style={[s.statNumber, { color: accentColor }]}>
              {totalEnrollment.toLocaleString()}
            </ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Total</ThemedText>
          </View>
          <View style={s.statItem}>
            <ThemedText style={[s.statNumber, { color: colors.text }]}>72%</ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Retention</ThemedText>
          </View>
        </View>
      </View>

      {/* By Class */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>BY CLASSIFICATION</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {ENROLLMENT_BREAKDOWN.map((e, idx) => (
          <View
            key={e.level}
            style={[
              s.enrollRow,
              { borderBottomColor: colors.border },
              idx === ENROLLMENT_BREAKDOWN.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <ThemedText style={[s.enrollLevel, { color: colors.text }]}>{e.level}</ThemedText>
            <View style={s.barContainer}>
              <View
                style={[
                  s.bar,
                  {
                    backgroundColor: accentColor + '40',
                    width: `${(e.count / 400) * 100}%`,
                  },
                ]}
              />
            </View>
            <ThemedText style={[s.enrollCount, { color: colors.textSecondary }]}>{e.count}</ThemedText>
          </View>
        ))}
      </View>

      {/* Demographics */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>DEMOGRAPHICS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.detailRow}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>African American</ThemedText>
          <ThemedText style={[s.detailValue, { color: colors.text }]}>76%</ThemedText>
        </View>
        <View style={s.detailRow}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Hispanic/Latino</ThemedText>
          <ThemedText style={[s.detailValue, { color: colors.text }]}>12%</ThemedText>
        </View>
        <View style={s.detailRow}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>International</ThemedText>
          <ThemedText style={[s.detailValue, { color: colors.text }]}>6%</ThemedText>
        </View>
        <View style={[s.detailRow, { borderBottomWidth: 0 }]}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Other</ThemedText>
          <ThemedText style={[s.detailValue, { color: colors.text }]}>6%</ThemedText>
        </View>
      </View>

      {/* Student Organizations */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>STUDENT ORGANIZATIONS</ThemedText>
      {STUDENT_ORGS.map((org) => (
        <View key={org.id} style={[s.listRow, { borderBottomColor: colors.border }]}>
          <View style={s.listRowContent}>
            <ThemedText style={[s.listRowTitle, { color: colors.text }]}>{org.name}</ThemedText>
            <ThemedText style={[s.metaText, { color: colors.textSecondary }]}>{org.members} members</ThemedText>
          </View>
        </View>
      ))}

      {/* SGA Officers */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: 20 }]}>
        STUDENT GOVERNMENT
      </ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {SGA_OFFICERS.map((officer, idx) => (
          <View
            key={officer.id}
            style={[
              s.detailRow,
              idx === SGA_OFFICERS.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>{officer.position}</ThemedText>
            <ThemedText style={[s.detailValue, { color: colors.text }]}>{officer.name}</ThemedText>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function EduPeople({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewId>('faculty');

  const handlePillPress = useCallback((id: ViewId) => {
    Haptics.selectionAsync();
    setActiveView(id);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'faculty':
        return <FacultyView colors={colors} accentColor={accentColor} />;
      case 'staff':
        return <StaffView colors={colors} accentColor={accentColor} />;
      case 'students':
        return <StudentsView colors={colors} accentColor={accentColor} />;
    }
  };

  return (
    <View style={s.container}>
      {/* ViewBar */}
      <View style={s.viewBar}>
        {VIEWS.map((v) => {
          const isActive = v.id === activeView;
          return (
            <Pressable
              key={v.id}
              style={[
                s.pill,
                { backgroundColor: isActive ? accentColor : '#2F3336' },
              ]}
              onPress={() => handlePillPress(v.id)}
            >
              <ThemedText
                style={[
                  s.pillText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {v.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      {renderContent()}
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: {
    flex: 1,
  },

  // -- ViewBar --
  viewBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Scroll --
  scroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // -- Section Header --
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  // -- Card --
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },

  // -- Filter bar --
  filterBar: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // -- Faculty --
  facultyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  facultyName: {
    fontSize: 15,
    fontWeight: '700',
  },
  facultyTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  facultyMeta: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  // -- Staff --
  staffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  staffName: {
    fontSize: 14,
    fontWeight: '700',
  },
  staffTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  staffMeta: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  // -- Ratio --
  ratioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratioText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // -- Stats --
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // -- Enrollment --
  enrollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  enrollLevel: {
    fontSize: 13,
    fontWeight: '500',
    width: 80,
  },
  barContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  enrollCount: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    width: 40,
    textAlign: 'right',
  },

  // -- Detail rows --
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2F3336',
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- List rows --
  listRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  listRowTitle: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },

  // -- Meta --
  metaText: {
    fontSize: 12,
  },

  // -- Badge --
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
