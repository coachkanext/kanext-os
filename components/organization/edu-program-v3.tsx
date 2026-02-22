/**
 * Edu Program V3 — 3-pill ViewBar (Identity | Academics | Operations)
 * Carroll College · President perspective
 * Private University · Founded 1867 · Washington, DC · Regionally Accredited
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

// =============================================================================
// TYPES & MOCK DATA
// =============================================================================

type ViewId = 'identity' | 'academics' | 'operations';

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'academics', label: 'Academics' },
  { id: 'operations', label: 'Operations' },
];

const INSTITUTION = {
  name: 'Carroll College',
  founded: 1879,
  location: 'Washington, DC',
  type: 'University',
  accreditation: 'SACSCOC',
  motto: 'Truth, Service, Excellence',
  president: 'Dr. Jaffus Hardrick',
  enrollment: {
    total: 1200,
    undergrad: 1050,
    grad: 150,
  },
  strategicPlan: 'Howard Forward 2030: Elevating Excellence — Focus areas include student success, institutional sustainability, research growth, and community engagement. 70% of strategic initiatives underway.',
};

interface Department {
  id: string;
  name: string;
  programs: string;
  faculty: number;
  students: number;
  chair: string;
  accreditationStatus: 'Accredited' | 'Under Review' | 'Pending';
  icon: 'graduationcap.fill' | 'briefcase.fill' | 'globe' | 'airplane' | 'chevron.left.forwardslash.chevron.right' | 'shield.fill';
}

const DEPARTMENTS: Department[] = [
  { id: 'd1', name: 'School of Business', programs: 'MBA, BBA', faculty: 4, students: 180, chair: 'Dr. Patricia Moore', accreditationStatus: 'Accredited', icon: 'briefcase.fill' },
  { id: 'd2', name: 'School of Education', programs: 'M.Ed, B.Ed', faculty: 5, students: 150, chair: 'Dr. Angela Davis', accreditationStatus: 'Accredited', icon: 'graduationcap.fill' },
  { id: 'd3', name: 'Arts & Sciences', programs: 'BA, BS', faculty: 8, students: 320, chair: 'Dr. Robert Johnson', accreditationStatus: 'Accredited', icon: 'globe' },
  { id: 'd4', name: 'School of Aviation', programs: 'BS Aviation', faculty: 3, students: 85, chair: 'Capt. James Wright', accreditationStatus: 'Accredited', icon: 'airplane' },
  { id: 'd5', name: 'Computer Science', programs: 'BS CS', faculty: 3, students: 120, chair: 'Dr. Karen Williams', accreditationStatus: 'Accredited', icon: 'chevron.left.forwardslash.chevron.right' },
  { id: 'd6', name: 'Criminal Justice', programs: 'BS CJ', faculty: 3, students: 95, chair: 'Dr. Alex Morgan', accreditationStatus: 'Accredited', icon: 'shield.fill' },
];

type TaskStatus = 'due_tomorrow' | 'overdue' | 'in_progress' | 'upcoming' | 'completed';

const TASKS: { id: string; title: string; status: TaskStatus; detail: string }[] = [
  { id: 'op1', title: 'Submit SACSCOC compliance update', status: 'due_tomorrow', detail: 'Due tomorrow' },
  { id: 'op2', title: 'Review spring enrollment projections', status: 'in_progress', detail: 'In progress' },
  { id: 'op3', title: 'Finalize Title III grant proposal', status: 'overdue', detail: 'Overdue by 3 days' },
  { id: 'op4', title: 'Approve faculty hiring committee slate', status: 'upcoming', detail: 'Due Feb 1' },
  { id: 'op5', title: 'Board of Trustees presentation prep', status: 'upcoming', detail: 'Due Feb 15' },
];

const APPROVALS = [
  { id: 'ap1', title: 'FY26 departmental budget request — School of Business', type: 'Budget Request' },
  { id: 'ap2', title: 'New hire: Assistant Professor, Computer Science', type: 'Hiring Request' },
  { id: 'ap3', title: 'New minor program proposal — Data Analytics', type: 'Program Proposal' },
];

const CALENDAR_MILESTONES = [
  { id: 'cm1', event: 'Spring Registration', date: 'Jan 15', icon: 'doc.badge.plus' as const },
  { id: 'cm2', event: 'Spring Semester Begins', date: 'Jan 20', icon: 'calendar' as const },
  { id: 'cm3', event: 'Midterm Examinations', date: 'Mar 5', icon: 'doc.fill' as const },
  { id: 'cm4', event: 'Commencement Ceremony', date: 'May 10', icon: 'graduationcap.fill' as const },
];

const TASK_STATUS_COLOR: Record<TaskStatus, string> = {
  due_tomorrow: '#F59E0B',
  overdue: '#EF4444',
  in_progress: '#1D9BF0',
  upcoming: '#22C55E',
  completed: '#22C55E',
};

const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  due_tomorrow: 'DUE TOMORROW',
  overdue: 'OVERDUE',
  in_progress: 'IN PROGRESS',
  upcoming: 'UPCOMING',
  completed: 'COMPLETED',
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

function AccreditationBadge({ status }: { status: string }) {
  const color = status === 'Accredited' ? '#22C55E' : status === 'Under Review' ? '#F59E0B' : '#1D9BF0';
  return <StatusBadge label={status.toUpperCase()} color={color} />;
}

// =============================================================================
// VIEW: IDENTITY
// =============================================================================

function IdentityView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Institution */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>INSTITUTION</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.cardTitle, { color: colors.text }]}>{INSTITUTION.name}</ThemedText>
        <ThemedText style={[s.cardSub, { color: colors.textSecondary }]}>
          Founded {INSTITUTION.founded} · {INSTITUTION.location}
        </ThemedText>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <StatusBadge label="University" color={accentColor} />
          <StatusBadge label="SACSCOC" color="#22C55E" />
        </View>
      </View>

      {/* Motto */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>MOTTO</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.missionText, { color: colors.text }]}>
          "{INSTITUTION.motto}"
        </ThemedText>
      </View>

      {/* Leadership */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>LEADERSHIP</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.detailRow}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>President</ThemedText>
          <ThemedText style={[s.detailValue, { color: colors.text }]}>{INSTITUTION.president}</ThemedText>
        </View>
        <View style={[s.detailRow, { borderBottomWidth: 0 }]}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Accreditation</ThemedText>
          <ThemedText style={[s.detailValue, { color: colors.text }]}>{INSTITUTION.accreditation}</ThemedText>
        </View>
      </View>

      {/* Enrollment */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>ENROLLMENT</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.statRow}>
          <View style={s.statItem}>
            <ThemedText style={[s.statNumber, { color: accentColor }]}>
              {INSTITUTION.enrollment.total.toLocaleString()}
            </ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Total</ThemedText>
          </View>
          <View style={s.statItem}>
            <ThemedText style={[s.statNumber, { color: colors.text }]}>
              {INSTITUTION.enrollment.undergrad.toLocaleString()}
            </ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Undergrad</ThemedText>
          </View>
          <View style={s.statItem}>
            <ThemedText style={[s.statNumber, { color: colors.text }]}>
              {INSTITUTION.enrollment.grad}
            </ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Graduate</ThemedText>
          </View>
        </View>
      </View>

      {/* Strategic Plan */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>STRATEGIC PLAN</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.bodyText, { color: colors.text }]}>
          {INSTITUTION.strategicPlan}
        </ThemedText>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// VIEW: ACADEMICS
// =============================================================================

function AcademicsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>DEPARTMENTS</ThemedText>
      {DEPARTMENTS.map((dept) => (
        <Pressable
          key={dept.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Haptics.selectionAsync()}
        >
          <View style={s.deptHeader}>
            <IconSymbol name={dept.icon} size={20} color={accentColor} />
            <ThemedText style={[s.deptName, { color: colors.text }]}>{dept.name}</ThemedText>
            <AccreditationBadge status={dept.accreditationStatus} />
          </View>
          <ThemedText style={[s.deptPrograms, { color: colors.textSecondary }]}>
            Programs: {dept.programs}
          </ThemedText>
          <View style={[s.deptMeta, { borderTopColor: colors.border }]}>
            <View style={s.deptMetaItem}>
              <IconSymbol name="person.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.deptMetaText, { color: colors.textSecondary }]}>
                Chair: {dept.chair}
              </ThemedText>
            </View>
            <View style={s.deptMetaRow}>
              <View style={s.deptMetaItem}>
                <IconSymbol name="person.3.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.deptMetaText, { color: colors.textSecondary }]}>
                  {dept.faculty} faculty
                </ThemedText>
              </View>
              <View style={s.deptMetaItem}>
                <IconSymbol name="graduationcap.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.deptMetaText, { color: colors.textSecondary }]}>
                  {dept.students} students
                </ThemedText>
              </View>
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: OPERATIONS
// =============================================================================

function OperationsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Tasks */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>TASKS</ThemedText>
      {TASKS.map((task) => (
        <View key={task.id} style={[s.listRow, { borderBottomColor: colors.border }]}>
          <View style={s.listRowContent}>
            <ThemedText style={[s.listRowTitle, { color: colors.text }]}>{task.title}</ThemedText>
            <StatusBadge label={TASK_STATUS_LABEL[task.status]} color={TASK_STATUS_COLOR[task.status]} />
          </View>
        </View>
      ))}

      {/* Approval Queue */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: 20 }]}>
        APPROVAL QUEUE
      </ThemedText>
      {APPROVALS.map((item) => (
        <View key={item.id} style={[s.listRow, { borderBottomColor: colors.border }]}>
          <View style={s.listRowContent}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.listRowTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <ThemedText style={[s.listRowSub, { color: colors.textTertiary }]}>{item.type}</ThemedText>
            </View>
            <StatusBadge label="PENDING" color="#F59E0B" />
          </View>
        </View>
      ))}

      {/* Academic Calendar */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: 20 }]}>
        ACADEMIC CALENDAR
      </ThemedText>
      {CALENDAR_MILESTONES.map((m) => (
        <View key={m.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.milestoneRow}>
            <IconSymbol name={m.icon} size={16} color={accentColor} />
            <ThemedText style={[s.milestoneName, { color: colors.text }]}>{m.event}</ThemedText>
            <ThemedText style={[s.milestoneDate, { color: colors.textSecondary }]}>{m.date}</ThemedText>
          </View>
        </View>
      ))}

      {/* Board of Trustees */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: 20 }]}>
        BOARD OF TRUSTEES
      </ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.milestoneRow}>
          <IconSymbol name="calendar" size={16} color={accentColor} />
          <ThemedText style={[s.milestoneName, { color: colors.text }]}>Next Board Meeting</ThemedText>
          <ThemedText style={[s.milestoneDate, { color: colors.textSecondary }]}>Mar 15</ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function EduProgram({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewId>('identity');

  const handlePillPress = useCallback((id: ViewId) => {
    Haptics.selectionAsync();
    setActiveView(id);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'identity':
        return <IdentityView colors={colors} accentColor={accentColor} />;
      case 'academics':
        return <AcademicsView colors={colors} accentColor={accentColor} />;
      case 'operations':
        return <OperationsView colors={colors} accentColor={accentColor} />;
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
  },

  // -- Motto --
  missionText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
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

  // -- Body text --
  bodyText: {
    fontSize: 13,
    lineHeight: 19,
  },

  // -- Departments --
  deptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deptName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  deptPrograms: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 30,
  },
  deptMeta: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  deptMetaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  deptMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deptMetaText: {
    fontSize: 12,
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
  listRowSub: {
    fontSize: 11,
    marginTop: 2,
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

  // -- Milestones --
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  milestoneName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  milestoneDate: {
    fontSize: 12,
  },
});
