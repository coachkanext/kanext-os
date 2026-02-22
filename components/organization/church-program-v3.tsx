/**
 * Church Program V3 — KaNeXT Church · Senior Pastor
 * ViewBar: Identity | Ministries | Operations
 * Self-contained with inline mock data.
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

// =============================================================================
// TYPES
// =============================================================================

type ViewId = 'identity' | 'ministries' | 'operations';

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// VIEWS
// =============================================================================

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'ministries', label: 'Ministries' },
  { id: 'operations', label: 'Operations' },
];

// =============================================================================
// MOCK DATA
// =============================================================================

const CHURCH_IDENTITY = {
  name: 'KaNeXT Church',
  abbreviation: 'KaNeXT Church',
  mission: 'Raising a generation of leaders who will transform the world for Christ',
  denomination: 'Non-denominational',
  founded: '2015',
  location: 'Nashville, TN',
  seniorPastor: 'Dr. Oladipo Carter',
  services: [
    { day: 'Sunday', time: '10:00 AM', type: 'Morning Service' },
    { day: 'Sunday', time: '6:00 PM', type: 'Evening Service' },
    { day: 'Wednesday', time: '7:00 PM', type: 'Bible Study' },
  ],
  coreValues: ['Faith', 'Excellence', 'Community', 'Service'],
};

interface Ministry {
  id: string;
  name: string;
  category: string;
  memberCount: number;
  leader: string;
  schedule: string;
  status: 'Active' | 'Seasonal';
  description: string;
}

const MINISTRIES: Ministry[] = [
  { id: 'm1', name: 'T.O.R.C.H.', category: 'Young Adults', memberCount: 45, leader: 'Bro. Michael Osei', schedule: 'Fridays 7:00 PM', status: 'Active', description: 'Young adult fellowship and discipleship' },
  { id: 'm2', name: 'Sheepfold', category: 'Children', memberCount: 30, leader: 'Sis. Funke Balogun', schedule: 'Sundays 10:00 AM', status: 'Active', description: 'Children\'s church and education' },
  { id: 'm3', name: 'Fresh Fire', category: 'Teens', memberCount: 25, leader: 'Pastor David Akinola', schedule: 'Fridays 6:00 PM', status: 'Active', description: 'Teen youth group and mentorship' },
  { id: 'm4', name: 'Rooted', category: 'Discipleship', memberCount: 60, leader: 'Elder Ruth Adeyemi', schedule: 'Wednesdays', status: 'Active', description: 'Foundational discipleship program' },
  { id: 'm5', name: 'Connect Groups', category: 'Small Groups', memberCount: 8, leader: 'Pastor Grace Carter', schedule: 'Various', status: 'Active', description: '8 home-based small groups across LA' },
  { id: 'm6', name: 'Vineyard Voices', category: 'Music/Worship', memberCount: 20, leader: 'Min. Sarah Okonkwo', schedule: 'Sundays & Rehearsals', status: 'Active', description: 'Worship team and choir' },
  { id: 'm7', name: 'Single Saved Serving', category: 'Singles', memberCount: 35, leader: 'Deacon James Mensah', schedule: 'Monthly gatherings', status: 'Active', description: 'Singles fellowship and service' },
  { id: 'm8', name: 'The Harvesters', category: 'Evangelism', memberCount: 15, leader: 'Bro. Michael Osei', schedule: 'Saturdays', status: 'Seasonal', description: 'Street evangelism and community outreach' },
  { id: 'm9', name: 'Hotline to Heaven', category: 'Radio', memberCount: 0, leader: 'Dr. Oladipo Carter', schedule: 'Weekly broadcast', status: 'Active', description: 'Radio ministry and podcast' },
];

interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: 'High' | 'Normal' | 'Low';
  status: 'Pending' | 'In Progress' | 'Done';
}

const OPS_TASKS: Task[] = [
  { id: 't1', title: 'Update church website with new service times', assignee: 'Media Team', priority: 'High', status: 'In Progress' },
  { id: 't2', title: 'Prepare Easter service program', assignee: 'Pastor Grace', priority: 'High', status: 'Pending' },
  { id: 't3', title: 'Order communion supplies', assignee: 'Deacon Mensah', priority: 'Normal', status: 'Pending' },
  { id: 't4', title: 'Schedule building inspection', assignee: 'Operations', priority: 'Normal', status: 'In Progress' },
  { id: 't5', title: 'Print new member welcome packets', assignee: 'Admin', priority: 'Low', status: 'Pending' },
];

interface EventPlan {
  id: string;
  title: string;
  date: string;
  type: string;
  status: 'Confirmed' | 'Planning' | 'Tentative';
}

const EVENT_PLANS: EventPlan[] = [
  { id: 'e1', title: 'Sunday Worship Service', date: 'Weekly · Recurring', type: 'Service', status: 'Confirmed' },
  { id: 'e2', title: 'Kingdom Conference 2025', date: 'Jun 14-16, 2025', type: 'Conference', status: 'Planning' },
  { id: 'e3', title: 'Youth Summer Camp', date: 'Jul 20-25, 2025', type: 'Camp', status: 'Tentative' },
];

interface Approval {
  id: string;
  title: string;
  requestedBy: string;
  amount?: string;
  status: 'Pending';
}

const APPROVALS: Approval[] = [
  { id: 'a1', title: 'Sound system upgrade proposal', requestedBy: 'Min. Sarah Okonkwo', amount: '$4,500' },
  { id: 'a2', title: 'T.O.R.C.H. retreat venue booking', requestedBy: 'Bro. Michael Osei', amount: '$1,200' },
  { id: 'a3', title: 'New volunteer background check batch', requestedBy: 'Admin', amount: '$350' },
];

interface VolunteerGap {
  id: string;
  role: string;
  ministry: string;
  urgency: 'Urgent' | 'Normal';
}

const VOLUNTEER_GAPS: VolunteerGap[] = [
  { id: 'v1', role: 'Children\'s Church Teacher', ministry: 'Sheepfold', urgency: 'Urgent' },
  { id: 'v2', role: 'Sound Technician', ministry: 'Worship', urgency: 'Urgent' },
  { id: 'v3', role: 'Parking Lot Attendant', ministry: 'Operations', urgency: 'Normal' },
  { id: 'v4', role: 'Greeter (Sunday PM)', ministry: 'Hospitality', urgency: 'Normal' },
];

// =============================================================================
// HELPERS
// =============================================================================

const PRIORITY_COLORS: Record<string, string> = {
  High: '#EF4444',
  Normal: '#F59E0B',
  Low: '#A1A1AA',
};

const STATUS_COLORS: Record<string, string> = {
  Active: '#22C55E',
  Seasonal: '#F59E0B',
  Pending: '#F59E0B',
  'In Progress': '#1D9BF0',
  Done: '#22C55E',
  Confirmed: '#22C55E',
  Planning: '#1D9BF0',
  Tentative: '#F59E0B',
  Urgent: '#EF4444',
  Normal: '#A1A1AA',
};

// =============================================================================
// VIEW BAR
// =============================================================================

function ViewBar({
  views,
  activeId,
  onSelect,
  accentColor,
  colors,
}: {
  views: typeof VIEWS;
  activeId: ViewId;
  onSelect: (id: ViewId) => void;
  accentColor: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={s.viewBar}>
      {views.map((v) => {
        const isActive = v.id === activeId;
        return (
          <Pressable
            key={v.id}
            style={[
              s.viewPill,
              {
                backgroundColor: isActive ? accentColor : '#2F3336',
              },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(v.id);
            }}
          >
            <ThemedText
              style={[
                s.viewPillText,
                { color: isActive ? '#000' : colors.textSecondary },
              ]}
            >
              {v.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

// =============================================================================
// IDENTITY VIEW
// =============================================================================

function IdentityView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const info = CHURCH_IDENTITY;
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Church Name & Mission */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.churchName, { color: colors.text }]}>{info.abbreviation}</ThemedText>
        <ThemedText style={[s.churchFullName, { color: colors.textSecondary }]}>{info.name}</ThemedText>
        <ThemedText style={[s.missionText, { color: accentColor }]}>"{info.mission}"</ThemedText>
      </View>

      {/* Details */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>DETAILS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { label: 'Denomination', value: info.denomination },
          { label: 'Founded', value: info.founded },
          { label: 'Location', value: info.location },
          { label: 'Senior Pastor', value: info.seniorPastor },
        ].map((item, idx) => (
          <View
            key={idx}
            style={[
              s.detailRow,
              idx < 3 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>{item.label}</ThemedText>
            <ThemedText style={[s.detailValue, { color: colors.text }]}>{item.value}</ThemedText>
          </View>
        ))}
      </View>

      {/* Services */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>SERVICE TIMES</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {info.services.map((svc, idx) => (
          <View
            key={idx}
            style={[
              s.detailRow,
              idx < info.services.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.serviceType, { color: colors.text }]}>{svc.type}</ThemedText>
              <ThemedText style={[s.serviceSchedule, { color: colors.textSecondary }]}>{svc.day} · {svc.time}</ThemedText>
            </View>
            <IconSymbol name="calendar" size={16} color={colors.textTertiary} />
          </View>
        ))}
      </View>

      {/* Core Values */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>CORE VALUES</ThemedText>
      <View style={s.valuesRow}>
        {info.coreValues.map((val) => (
          <View key={val} style={[s.valuePill, { backgroundColor: accentColor + '20' }]}>
            <ThemedText style={[s.valuePillText, { color: accentColor }]}>{val}</ThemedText>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// MINISTRIES VIEW
// =============================================================================

function MinistriesView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>ACTIVE MINISTRIES</ThemedText>
      {MINISTRIES.map((ministry) => (
        <View
          key={ministry.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.ministryHeader}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.ministryName, { color: colors.text }]}>{ministry.name}</ThemedText>
              <ThemedText style={[s.ministryCategory, { color: colors.textSecondary }]}>{ministry.category}</ThemedText>
            </View>
            <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[ministry.status] + '20' }]}>
              <ThemedText style={[s.statusBadgeText, { color: STATUS_COLORS[ministry.status] }]}>
                {ministry.status}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[s.ministryDesc, { color: colors.textSecondary }]}>{ministry.description}</ThemedText>
          <View style={s.ministryMeta}>
            <View style={s.metaItem}>
              <IconSymbol name="person.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textSecondary }]}>{ministry.leader}</ThemedText>
            </View>
            {ministry.memberCount > 0 && (
              <View style={s.metaItem}>
                <IconSymbol name="person.3.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.metaText, { color: colors.textSecondary }]}>
                  {ministry.memberCount} {ministry.category === 'Small Groups' ? 'groups' : 'members'}
                </ThemedText>
              </View>
            )}
            <View style={s.metaItem}>
              <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textSecondary }]}>{ministry.schedule}</ThemedText>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// OPERATIONS VIEW
// =============================================================================

function OperationsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Tasks */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>TASKS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {OPS_TASKS.map((task, idx) => (
          <View
            key={task.id}
            style={[
              s.taskRow,
              idx < OPS_TASKS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={[s.priorityDot, { backgroundColor: PRIORITY_COLORS[task.priority] }]} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.taskTitle, { color: colors.text }]}>{task.title}</ThemedText>
              <ThemedText style={[s.taskAssignee, { color: colors.textSecondary }]}>{task.assignee}</ThemedText>
            </View>
            <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[task.status] + '20' }]}>
              <ThemedText style={[s.statusBadgeText, { color: STATUS_COLORS[task.status] }]}>
                {task.status}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Event Planning */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>EVENT PLANNING</ThemedText>
      {EVENT_PLANS.map((event) => (
        <View
          key={event.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.eventRow}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.eventTitle, { color: colors.text }]}>{event.title}</ThemedText>
              <ThemedText style={[s.eventDate, { color: colors.textSecondary }]}>{event.date} · {event.type}</ThemedText>
            </View>
            <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[event.status] + '20' }]}>
              <ThemedText style={[s.statusBadgeText, { color: STATUS_COLORS[event.status] }]}>
                {event.status}
              </ThemedText>
            </View>
          </View>
        </View>
      ))}

      {/* Approvals */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>PENDING APPROVALS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {APPROVALS.map((approval, idx) => (
          <View
            key={approval.id}
            style={[
              s.approvalRow,
              idx < APPROVALS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.approvalTitle, { color: colors.text }]}>{approval.title}</ThemedText>
              <ThemedText style={[s.approvalMeta, { color: colors.textSecondary }]}>
                {approval.requestedBy}{approval.amount ? ` · ${approval.amount}` : ''}
              </ThemedText>
            </View>
            <View style={[s.statusBadge, { backgroundColor: '#F59E0B20' }]}>
              <ThemedText style={[s.statusBadgeText, { color: '#F59E0B' }]}>Pending</ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Volunteer Gaps */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>VOLUNTEER GAPS THIS WEEK</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {VOLUNTEER_GAPS.map((gap, idx) => (
          <View
            key={gap.id}
            style={[
              s.gapRow,
              idx < VOLUNTEER_GAPS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={[s.priorityDot, { backgroundColor: STATUS_COLORS[gap.urgency] }]} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.gapRole, { color: colors.text }]}>{gap.role}</ThemedText>
              <ThemedText style={[s.gapMinistry, { color: colors.textSecondary }]}>{gap.ministry}</ThemedText>
            </View>
            <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[gap.urgency] + '20' }]}>
              <ThemedText style={[s.statusBadgeText, { color: STATUS_COLORS[gap.urgency] }]}>
                {gap.urgency}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function ChurchProgram({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewId>('identity');

  const handleViewChange = useCallback((id: ViewId) => {
    setActiveView(id);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'identity':
        return <IdentityView colors={colors} accentColor={accentColor} />;
      case 'ministries':
        return <MinistriesView colors={colors} accentColor={accentColor} />;
      case 'operations':
        return <OperationsView colors={colors} accentColor={accentColor} />;
      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      <ViewBar
        views={VIEWS}
        activeId={activeView}
        onSelect={handleViewChange}
        accentColor={accentColor}
        colors={colors}
      />
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

  // -- View Bar --
  viewBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  viewPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  viewPillText: {
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
    marginTop: Spacing.lg,
    textTransform: 'uppercase',
  },

  // -- Card --
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: Spacing.sm,
  },

  // -- Identity --
  churchName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  churchFullName: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  missionText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  serviceType: {
    fontSize: 14,
    fontWeight: '600',
  },
  serviceSchedule: {
    fontSize: 12,
    marginTop: 2,
  },
  valuesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  valuePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  valuePillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Ministries --
  ministryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  ministryName: {
    fontSize: 16,
    fontWeight: '700',
  },
  ministryCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  ministryDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  ministryMeta: {
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
  },

  // -- Operations --
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  taskAssignee: {
    fontSize: 11,
    marginTop: 2,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  eventDate: {
    fontSize: 12,
    marginTop: 2,
  },
  approvalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  approvalTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  approvalMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  gapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  gapRole: {
    fontSize: 13,
    fontWeight: '500',
  },
  gapMinistry: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Status Badge --
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
