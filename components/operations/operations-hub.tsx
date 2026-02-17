/**
 * Operations Hub v2
 * Full operations workspace with pill nav: Home | Calendar | Tasks | Facilities | Equipment | Travel
 * Mode-aware — renders mode-specific data from mock-operations.
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMode } from '@/context/app-context';
import {
  OPERATIONS_EVENTS,
  OPERATIONS_TASKS,
  OPERATIONS_FACILITIES,
  OPERATIONS_EQUIPMENT,
  OPERATIONS_TRAVEL,
  OPERATIONS_SNAPSHOTS,
} from '@/data/mock-operations';
import type { CalendarEvent, Task, Facility, Equipment, TravelPlan } from '@/data/mock-operations';

// =============================================================================
// CONSTANTS
// =============================================================================

const TABS = ['Home', 'Calendar', 'Tasks', 'Facilities', 'Equipment', 'Travel'] as const;
type TabName = (typeof TABS)[number];

const TASK_FILTERS = ['All', 'Pending', 'In Progress', 'Completed'] as const;
type TaskFilter = (typeof TASK_FILTERS)[number];

const PRIORITY_COLORS: Record<string, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#22C55E',
};

const STATUS_COLORS: Record<string, string> = {
  completed: '#22C55E',
  pending: '#F59E0B',
  overdue: '#EF4444',
  'in-progress': '#6AA9FF',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  practice: '#6AA9FF',
  game: '#EF4444',
  meeting: '#F59E0B',
  travel: '#8B5CF6',
  service: '#22C55E',
  class: '#6AA9FF',
  event: '#EC4899',
  deadline: '#EF4444',
};

const FACILITY_STATUS_COLORS: Record<string, string> = {
  available: '#22C55E',
  booked: '#F59E0B',
  maintenance: '#EF4444',
};

const CONDITION_COLORS: Record<string, string> = {
  good: '#22C55E',
  fair: '#F59E0B',
  poor: '#EF4444',
  'needs-repair': '#EF4444',
};

const TRAVEL_STATUS_COLORS: Record<string, string> = {
  planned: '#F59E0B',
  booked: '#22C55E',
  completed: '#8F8F8F',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function OperationsHub() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const mode = useMode();

  const [activeTab, setActiveTab] = useState<TabName>('Home');
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('All');

  const events = OPERATIONS_EVENTS[mode];
  const tasks = OPERATIONS_TASKS[mode];
  const facilities = OPERATIONS_FACILITIES[mode];
  const equipment = OPERATIONS_EQUIPMENT[mode];
  const travel = OPERATIONS_TRAVEL[mode];
  const snapshot = OPERATIONS_SNAPSHOTS[mode];

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    if (taskFilter === 'All') return tasks;
    const statusMap: Record<string, string> = {
      'Pending': 'pending',
      'In Progress': 'in-progress',
      'Completed': 'completed',
    };
    return tasks.filter((t) => t.status === statusMap[taskFilter]);
  }, [tasks, taskFilter]);

  // Priority tasks for home view
  const priorityTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status !== 'completed')
      .sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      })
      .slice(0, 4);
  }, [tasks]);

  // Today's events (first 4 for home view)
  const todayEvents = useMemo(() => events.slice(0, 4), [events]);

  return (
    <View style={styles.container}>
      {/* Pill Nav */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? '#fff' : colors.backgroundTertiary,
                  borderColor: isActive ? '#fff' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab);
              }}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {tab}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Content */}
      {activeTab === 'Home' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Snapshot Cards */}
          <View style={styles.snapshotRow}>
            <SnapshotCard label="Upcoming" value={String(snapshot.upcomingEvents)} colors={colors} icon="calendar" />
            <SnapshotCard label="Open Tasks" value={String(snapshot.openTasks)} colors={colors} icon="checklist" />
            <SnapshotCard label="Booked" value={String(snapshot.facilitiesBooked)} colors={colors} icon="building.2.fill" />
            <SnapshotCard label="Travel" value={String(snapshot.travelPlanned)} colors={colors} icon="airplane" />
          </View>

          {/* Today's Schedule */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              TODAY'S SCHEDULE
            </ThemedText>
            {todayEvents.map((event) => (
              <EventCard key={event.id} event={event} colors={colors} />
            ))}
          </View>

          {/* Priority Tasks */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              PRIORITY TASKS
            </ThemedText>
            {priorityTasks.map((task) => (
              <TaskCard key={task.id} task={task} colors={colors} />
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              QUICK ACTIONS
            </ThemedText>
            <View style={styles.quickActionsRow}>
              <QuickAction label="Add Event" icon="plus.circle.fill" colors={colors} />
              <QuickAction label="Create Task" icon="checkmark.circle.fill" colors={colors} />
              <QuickAction label="Book Facility" icon="building.2.fill" colors={colors} />
              <QuickAction label="Plan Travel" icon="airplane" colors={colors} />
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {activeTab === 'Calendar' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              THIS WEEK
            </ThemedText>
            {events.map((event) => (
              <EventCard key={event.id} event={event} colors={colors} showDate />
            ))}
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {activeTab === 'Tasks' && (
        <View style={styles.content}>
          {/* Task Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {TASK_FILTERS.map((filter) => {
              const isActive = taskFilter === filter;
              return (
                <Pressable
                  key={filter}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: isActive ? '#fff' : colors.backgroundTertiary,
                      borderColor: isActive ? '#fff' : colors.border,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setTaskFilter(filter);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.filterPillText,
                      { color: isActive ? '#000' : colors.textSecondary },
                    ]}
                  >
                    {filter}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>

          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TaskCard task={item} colors={colors} showPriorityStripe />}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {activeTab === 'Facilities' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.facilityGrid}>
            {facilities.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} colors={colors} />
            ))}
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {activeTab === 'Equipment' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {equipment.map((item) => (
            <EquipmentCard key={item.id} item={item} colors={colors} />
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {activeTab === 'Travel' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {travel.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <IconSymbol name="airplane" size={28} color={colors.textTertiary} />
              <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                No travel plans scheduled
              </ThemedText>
            </View>
          ) : (
            travel.map((plan) => (
              <TravelCard key={plan.id} plan={plan} colors={colors} />
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function SnapshotCard({
  label,
  value,
  colors,
  icon,
}: {
  label: string;
  value: string;
  colors: typeof Colors.light;
  icon: string;
}) {
  return (
    <View style={[styles.snapshotCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <IconSymbol name={icon as any} size={16} color={colors.textSecondary} />
      <ThemedText style={[styles.snapshotValue, { color: colors.text }]}>{value}</ThemedText>
      <ThemedText style={[styles.snapshotLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

function EventCard({
  event,
  colors,
  showDate,
}: {
  event: CalendarEvent;
  colors: typeof Colors.light;
  showDate?: boolean;
}) {
  const typeColor = EVENT_TYPE_COLORS[event.type] || colors.textSecondary;
  const statusDot = event.status === 'cancelled' ? '#EF4444' : event.status === 'tentative' ? '#F59E0B' : '#22C55E';

  return (
    <View style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.eventLeft}>
        <ThemedText style={[styles.eventTime, { color: colors.textSecondary }]}>
          {event.time}
        </ThemedText>
        {showDate && (
          <ThemedText style={[styles.eventDate, { color: colors.textTertiary }]}>
            {event.date}
          </ThemedText>
        )}
      </View>
      <View style={styles.eventCenter}>
        <ThemedText style={[styles.eventTitle, { color: colors.text }]} numberOfLines={1}>
          {event.title}
        </ThemedText>
        <ThemedText style={[styles.eventLocation, { color: colors.textSecondary }]} numberOfLines={1}>
          {event.location}
        </ThemedText>
      </View>
      <View style={styles.eventRight}>
        <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
          <ThemedText style={[styles.typeBadgeText, { color: typeColor }]}>
            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
          </ThemedText>
        </View>
        <View style={[styles.statusDot, { backgroundColor: statusDot }]} />
      </View>
    </View>
  );
}

function TaskCard({
  task,
  colors,
  showPriorityStripe,
}: {
  task: Task;
  colors: typeof Colors.light;
  showPriorityStripe?: boolean;
}) {
  const priorityColor = PRIORITY_COLORS[task.priority];
  const statusColor = STATUS_COLORS[task.status] || colors.textSecondary;

  return (
    <View style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {showPriorityStripe && (
        <View style={[styles.priorityStripe, { backgroundColor: priorityColor }]} />
      )}
      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <ThemedText style={[styles.taskTitle, { color: colors.text }]} numberOfLines={1}>
            {task.title}
          </ThemedText>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
            <ThemedText style={[styles.priorityBadgeText, { color: priorityColor }]}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </ThemedText>
          </View>
        </View>
        <View style={styles.taskFooter}>
          <ThemedText style={[styles.taskAssignee, { color: colors.textSecondary }]}>
            {task.assignee}
          </ThemedText>
          <ThemedText style={[styles.taskDue, { color: colors.textTertiary }]}>
            Due {task.dueDate}
          </ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <ThemedText style={[styles.statusBadgeText, { color: statusColor }]}>
              {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

function FacilityCard({
  facility,
  colors,
}: {
  facility: Facility;
  colors: typeof Colors.light;
}) {
  const statusColor = FACILITY_STATUS_COLORS[facility.status];

  return (
    <View style={[styles.facilityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.facilityHeader}>
        <ThemedText style={[styles.facilityName, { color: colors.text }]} numberOfLines={1}>
          {facility.name}
        </ThemedText>
        <View style={[styles.facilityStatusBadge, { backgroundColor: statusColor + '20' }]}>
          <View style={[styles.facilityStatusDot, { backgroundColor: statusColor }]} />
          <ThemedText style={[styles.facilityStatusText, { color: statusColor }]}>
            {facility.status.charAt(0).toUpperCase() + facility.status.slice(1)}
          </ThemedText>
        </View>
      </View>
      <ThemedText style={[styles.facilityType, { color: colors.textSecondary }]}>
        {facility.type}
      </ThemedText>
      <ThemedText style={[styles.facilityCapacity, { color: colors.textTertiary }]}>
        Capacity: {facility.capacity}
      </ThemedText>
      {facility.nextAvailable && (
        <ThemedText style={[styles.facilityNext, { color: colors.textTertiary }]}>
          Next available: {facility.nextAvailable}
        </ThemedText>
      )}
    </View>
  );
}

function EquipmentCard({
  item,
  colors,
}: {
  item: Equipment;
  colors: typeof Colors.light;
}) {
  const conditionColor = CONDITION_COLORS[item.condition];

  return (
    <View style={[styles.equipmentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.equipmentHeader}>
        <ThemedText style={[styles.equipmentName, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </ThemedText>
        <View style={[styles.conditionBadge, { backgroundColor: conditionColor + '20' }]}>
          <ThemedText style={[styles.conditionBadgeText, { color: conditionColor }]}>
            {item.condition === 'needs-repair' ? 'Needs Repair' : item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
          </ThemedText>
        </View>
      </View>
      <View style={styles.equipmentMeta}>
        <ThemedText style={[styles.equipmentDetail, { color: colors.textSecondary }]}>
          {item.category}
        </ThemedText>
        <ThemedText style={[styles.equipmentDetail, { color: colors.textSecondary }]}>
          Qty: {item.quantity}
        </ThemedText>
        <ThemedText style={[styles.equipmentDetail, { color: colors.textTertiary }]}>
          Checked: {item.lastChecked}
        </ThemedText>
      </View>
    </View>
  );
}

function TravelCard({
  plan,
  colors,
}: {
  plan: TravelPlan;
  colors: typeof Colors.light;
}) {
  const statusColor = TRAVEL_STATUS_COLORS[plan.status];

  return (
    <View style={[styles.travelCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.travelHeader}>
        <ThemedText style={[styles.travelDest, { color: colors.text }]} numberOfLines={1}>
          {plan.destination}
        </ThemedText>
        <View style={[styles.travelStatusBadge, { backgroundColor: statusColor + '20' }]}>
          <ThemedText style={[styles.travelStatusText, { color: statusColor }]}>
            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
          </ThemedText>
        </View>
      </View>
      <View style={styles.travelMeta}>
        <ThemedText style={[styles.travelDetail, { color: colors.textSecondary }]}>
          {plan.date} — {plan.returnDate}
        </ThemedText>
        <ThemedText style={[styles.travelDetail, { color: colors.textSecondary }]}>
          Party: {plan.partySize}
        </ThemedText>
        <ThemedText style={[styles.travelBudget, { color: colors.text }]}>
          ${plan.budget.toLocaleString()}
        </ThemedText>
      </View>
    </View>
  );
}

function QuickAction({
  label,
  icon,
  colors,
}: {
  label: string;
  icon: string;
  colors: typeof Colors.light;
}) {
  return (
    <Pressable
      style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <IconSymbol name={icon as any} size={20} color={colors.text} />
      <ThemedText style={[styles.quickActionLabel, { color: colors.textSecondary }]} numberOfLines={1}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pillRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 8,
  },
  pill: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },

  // Snapshot
  snapshotRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing.md,
  },
  snapshotCard: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  snapshotValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  snapshotLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Event
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: 8,
    gap: 12,
  },
  eventLeft: {
    width: 60,
  },
  eventTime: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventDate: {
    fontSize: 10,
    marginTop: 2,
  },
  eventCenter: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  eventLocation: {
    fontSize: 12,
    marginTop: 2,
  },
  eventRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Task
  taskCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  priorityStripe: {
    width: 4,
  },
  taskContent: {
    flex: 1,
    padding: Spacing.md,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  taskAssignee: {
    fontSize: 12,
  },
  taskDue: {
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Facility
  facilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.md,
  },
  facilityCard: {
    width: '48.5%',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  facilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 6,
  },
  facilityName: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  facilityStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  facilityStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  facilityStatusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  facilityType: {
    fontSize: 11,
    marginBottom: 2,
  },
  facilityCapacity: {
    fontSize: 11,
  },
  facilityNext: {
    fontSize: 10,
    marginTop: 4,
  },

  // Equipment
  equipmentCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: 8,
  },
  equipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  conditionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  equipmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  equipmentDetail: {
    fontSize: 12,
  },

  // Travel
  travelCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: 8,
  },
  travelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  travelDest: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  travelStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  travelStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  travelMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  travelDetail: {
    fontSize: 12,
  },
  travelBudget: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 'auto',
  },

  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAction: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 6,
  },
  quickActionLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Filter pills (tasks)
  filterRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    gap: 8,
  },
  filterPill: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Empty state
  emptyState: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: Spacing.lg,
  },
  emptyText: {
    fontSize: 14,
  },
});
