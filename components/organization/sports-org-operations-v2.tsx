/**
 * Sports Organization Operations V2 — 10-view sub-tab hub.
 * Sub-tabs: Overview | Tasks | Travel | Bookings | Equipment | Vendors | Player Services | Announcements | Approvals | Admin
 * RBAC: R1 full 10-tab, R2 limited (Overview + Announcements + Player Services), R3 all except Admin + Approvals, R4/R5 locked.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { SportsRoleLens } from '@/utils/sports-rbac';
import {
  OPS_SUB_TABS,
  OPS_TASKS,
  TRAVEL_TRIPS,
  FACILITY_BOOKINGS,
  EQUIPMENT_ITEMS,
  VENDOR_SERVICES,
  PLAYER_SERVICE_TICKETS,
  OPS_ANNOUNCEMENTS,
  OPS_APPROVALS,
  getOpsOverview,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TRIP_STATUS_LABELS,
  TRIP_STATUS_COLORS,
  EQUIPMENT_STATUS_LABELS,
  EQUIPMENT_STATUS_COLORS,
  VENDOR_STATUS_LABELS,
  VENDOR_STATUS_COLORS,
  TICKET_STATUS_LABELS,
  TICKET_STATUS_COLORS,
  TICKET_TYPE_LABELS,
  TICKET_TYPE_COLORS,
  ANNOUNCEMENT_AUDIENCE_LABELS,
  ANNOUNCEMENT_AUDIENCE_COLORS,
  APPROVAL_STATUS_LABELS,
  APPROVAL_STATUS_COLORS,
} from '@/data/mock-sports-org-operations-v2';
import type {
  OpsTask,
  TravelTrip,
  FacilityBooking,
  EquipmentItem,
  VendorService,
  PlayerServiceTicket,
  OpsAnnouncement,
  OpsApproval,
} from '@/data/mock-sports-org-operations-v2';

// =============================================================================
// CONSTANTS
// =============================================================================

const SUB_TABS = OPS_SUB_TABS;

// Map the mock data sub-tab IDs to user-facing labels used in the spec
const TAB_ID_MAP: Record<string, string> = {
  'overview': 'overview',
  'calendar-ops': 'tasks',
  'travel': 'travel',
  'facilities-ops': 'bookings',
  'equipment': 'equipment',
  'vendors': 'vendors',
  'player-services': 'player-services',
  'comms': 'announcements',
  'approvals': 'approvals',
  'settings': 'admin',
};

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: SportsRoleLens;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDate(dateStr: string): string {
  if (!dateStr) return '--';
  const parts = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[parseInt(parts[1], 10) - 1] || parts[1];
  const day = parseInt(parts[2], 10);
  return `${month} ${day}`;
}

function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US');
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState({ icon, label, colors }: { icon: string; label: string; colors: typeof Colors.light }) {
  return (
    <View style={s.emptyContainer}>
      <IconSymbol name={icon as any} size={40} color={colors.textTertiary} />
      <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// STATUS BADGE
// =============================================================================

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// PROGRESS BAR
// =============================================================================

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <View style={s.progressTrack}>
      <View style={[s.progressFill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

// =============================================================================
// SUB-TAB BAR
// =============================================================================

function SubTabBar({
  tabs,
  activeId,
  onSelect,
  accentColor,
  colors,
}: {
  tabs: typeof SUB_TABS;
  activeId: string;
  onSelect: (id: string) => void;
  accentColor: string;
  colors: typeof Colors.light;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.subTabRow}
      style={{ flexGrow: 0 }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <Pressable
            key={tab.id}
            style={[
              s.subTab,
              {
                borderBottomColor: isActive ? accentColor : 'transparent',
                borderBottomWidth: isActive ? 2 : 0,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(tab.id);
            }}
          >
            <ThemedText
              style={[
                s.subTabText,
                { color: isActive ? colors.text : colors.textSecondary },
              ]}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// OVERVIEW SUB-TAB
// =============================================================================

function OverviewTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const overview = getOpsOverview();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Task KPIs */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Tasks</ThemedText>
      <View style={s.kpiRow}>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: overview.openTasks > 0 ? '#F59E0B' : '#22C55E' }]}>
            {overview.openTasks}
          </ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Open</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: overview.blockedTasks > 0 ? '#EF4444' : '#22C55E' }]}>
            {overview.blockedTasks}
          </ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Blocked</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: overview.criticalTasks > 0 ? '#EF4444' : '#22C55E' }]}>
            {overview.criticalTasks}
          </ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Critical</ThemedText>
        </View>
      </View>

      {/* Travel & Facilities */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Travel & Facilities
      </ThemedText>
      <View style={s.kpiRow}>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: '#1D9BF0' }]}>{overview.upcomingTrips}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Trips</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: overview.tripsWithMissingDocs > 0 ? '#F59E0B' : '#22C55E' }]}>
            {overview.tripsWithMissingDocs}
          </ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Missing Docs</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: overview.facilityConflicts > 0 ? '#EF4444' : '#22C55E' }]}>
            {overview.facilityConflicts}
          </ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Conflicts</ThemedText>
        </View>
      </View>

      {/* Equipment & Vendors */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Equipment & Vendors
      </ThemedText>
      <View style={s.kpiRow}>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: overview.equipmentInMaintenance > 0 ? '#F59E0B' : '#22C55E' }]}>
            {overview.equipmentInMaintenance}
          </ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Maintenance</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: overview.vendorsExpiring > 0 ? '#F59E0B' : '#22C55E' }]}>
            {overview.vendorsExpiring}
          </ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Expiring</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: overview.vendorsOverdue > 0 ? '#EF4444' : '#22C55E' }]}>
            {overview.vendorsOverdue}
          </ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Overdue</ThemedText>
        </View>
      </View>

      {/* Player Services & Approvals */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Player Services & Approvals
      </ThemedText>
      <View style={s.kpiRow}>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: overview.openPlayerTickets > 0 ? '#F59E0B' : '#22C55E' }]}>
            {overview.openPlayerTickets}
          </ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Open Tickets</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: overview.pendingApprovals > 0 ? '#F59E0B' : '#22C55E' }]}>
            {overview.pendingApprovals}
          </ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Approvals</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: accentColor }]}>
            {formatCurrency(overview.pendingApprovalAmount)}
          </ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Pending $</ThemedText>
        </View>
      </View>

      {/* Announcements */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: Spacing.lg }]}>
        <View style={s.cardHeader}>
          <IconSymbol name="megaphone.fill" size={16} color={accentColor} />
          <ThemedText style={[s.cardTitle, { color: colors.text }]}>Announcements</ThemedText>
        </View>
        <ThemedText style={[s.cardMeta, { color: colors.textSecondary }]}>
          {overview.announcementsRequiringConfirmation} requiring confirmation
        </ThemedText>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// TASKS SUB-TAB
// =============================================================================

function TasksTab({
  colors,
  accentColor,
  onSelectTask,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  onSelectTask: (task: OpsTask) => void;
}) {
  const tasks = useMemo(() => {
    const prioOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    const statusOrder: Record<string, number> = { blocked: 0, open: 1, 'in-progress': 2, done: 3 };
    return [...OPS_TASKS].sort((a, b) => {
      const sDiff = (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4);
      if (sDiff !== 0) return sDiff;
      return (prioOrder[a.priority] ?? 4) - (prioOrder[b.priority] ?? 4);
    });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: OpsTask }) => {
      const prioColor = TASK_PRIORITY_COLORS[item.priority];
      const prioLabel = TASK_PRIORITY_LABELS[item.priority];
      const statusColor = TASK_STATUS_COLORS[item.status];
      const statusLabel = TASK_STATUS_LABELS[item.status];
      return (
        <Pressable
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectTask(item);
          }}
        >
          <ThemedText style={[s.taskTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </ThemedText>
          <View style={s.taskBadgeRow}>
            <StatusBadge label={prioLabel.toUpperCase()} color={prioColor} />
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
            <StatusBadge label={item.category.toUpperCase()} color={accentColor} />
          </View>
          <View style={s.taskMetaRow}>
            <View style={s.taskMetaItem}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.taskMetaText, { color: colors.textTertiary }]}>{item.owner}</ThemedText>
            </View>
            <View style={s.taskMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.taskMetaText, { color: colors.textTertiary }]}>
                Due {formatDate(item.dueDate)}
              </ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectTask],
  );

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="checklist" label="No tasks found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// TRAVEL SUB-TAB
// =============================================================================

function TravelTab({
  colors,
  accentColor,
  onSelectTrip,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  onSelectTrip: (trip: TravelTrip) => void;
}) {
  const trips = useMemo(() => {
    const statusOrder: Record<string, number> = { 'in-transit': 0, planning: 1, booked: 2, completed: 3 };
    return [...TRAVEL_TRIPS].sort((a, b) => (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4));
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: TravelTrip }) => {
      const statusColor = TRIP_STATUS_COLORS[item.status];
      const statusLabel = TRIP_STATUS_LABELS[item.status];
      const budgetPct = item.budget > 0 ? Math.round((item.spent / item.budget) * 100) : 0;
      return (
        <Pressable
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectTrip(item);
          }}
        >
          <View style={s.travelCardTop}>
            <View style={s.travelTextCol}>
              <ThemedText style={[s.travelDestination, { color: colors.text }]} numberOfLines={2}>
                {item.destination}
              </ThemedText>
              <ThemedText style={[s.travelDates, { color: colors.textSecondary }]}>
                {formatDate(item.departure)} — {formatDate(item.returnDate)}
              </ThemedText>
            </View>
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
          </View>
          <View style={s.travelBadgeRow}>
            <StatusBadge label={`${item.teamSize} TRAVELERS`} color={accentColor} />
            {item.missingDocs > 0 && (
              <StatusBadge label={`${item.missingDocs} MISSING DOCS`} color="#EF4444" />
            )}
          </View>
          {/* Budget bar */}
          <View style={s.travelBudgetSection}>
            <View style={s.travelBudgetLabelRow}>
              <ThemedText style={[s.travelBudgetLabel, { color: colors.textSecondary }]}>Budget</ThemedText>
              <ThemedText style={[s.travelBudgetValues, { color: colors.text }]}>
                {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
              </ThemedText>
            </View>
            <ProgressBar percent={budgetPct} color={budgetPct > 90 ? '#EF4444' : accentColor} />
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectTrip],
  );

  return (
    <FlatList
      data={trips}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="airplane" label="No travel trips scheduled" colors={colors} />
      }
    />
  );
}

// =============================================================================
// BOOKINGS SUB-TAB
// =============================================================================

function BookingsTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const bookings = FACILITY_BOOKINGS;

  const renderItem = useCallback(
    ({ item }: { item: FacilityBooking }) => {
      return (
        <View
          style={[
            s.card,
            {
              backgroundColor: colors.card,
              borderColor: item.conflict ? '#EF4444' + '60' : colors.border,
              marginBottom: Spacing.sm,
            },
          ]}
        >
          <View style={s.bookingCardTop}>
            <View style={s.bookingTextCol}>
              <ThemedText style={[s.bookingFacility, { color: colors.text }]} numberOfLines={2}>
                {item.facility}
              </ThemedText>
              <ThemedText style={[s.bookingPurpose, { color: colors.textSecondary }]}>
                {item.purpose}
              </ThemedText>
            </View>
            {item.conflict && (
              <StatusBadge label="CONFLICT" color="#EF4444" />
            )}
          </View>
          <View style={[s.bookingFooter, { borderTopColor: colors.border }]}>
            <View style={s.bookingMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.bookingMetaText, { color: colors.textTertiary }]}>
                {formatDate(item.date)}
              </ThemedText>
            </View>
            <View style={s.bookingMetaItem}>
              <IconSymbol name="clock.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.bookingMetaText, { color: colors.textTertiary }]}>
                {item.timeSlot}
              </ThemedText>
            </View>
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={bookings}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="building.2.fill" label="No facility bookings" colors={colors} />
      }
    />
  );
}

// =============================================================================
// EQUIPMENT SUB-TAB
// =============================================================================

function EquipmentTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const items = EQUIPMENT_ITEMS;

  const renderItem = useCallback(
    ({ item }: { item: EquipmentItem }) => {
      const statusColor = EQUIPMENT_STATUS_COLORS[item.status];
      const statusLabel = EQUIPMENT_STATUS_LABELS[item.status];
      return (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}>
          <View style={s.equipCardTop}>
            <View style={s.equipTextCol}>
              <ThemedText style={[s.equipName, { color: colors.text }]} numberOfLines={2}>
                {item.name}
              </ThemedText>
              <ThemedText style={[s.equipCategory, { color: colors.textSecondary }]}>
                {item.category}
              </ThemedText>
            </View>
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
          </View>
          <View style={[s.equipFooter, { borderTopColor: colors.border }]}>
            {item.assignedTo && (
              <View style={s.equipMetaItem}>
                <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.equipMetaText, { color: colors.textTertiary }]}>
                  {item.assignedTo}
                </ThemedText>
              </View>
            )}
            <View style={s.equipMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.equipMetaText, { color: colors.textTertiary }]}>
                Checked {formatDate(item.lastChecked)}
              </ThemedText>
            </View>
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="archivebox.fill" label="No equipment tracked" colors={colors} />
      }
    />
  );
}

// =============================================================================
// VENDORS SUB-TAB
// =============================================================================

function VendorsTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const vendors = VENDOR_SERVICES;

  const renderItem = useCallback(
    ({ item }: { item: VendorService }) => {
      const statusColor = VENDOR_STATUS_COLORS[item.status];
      const statusLabel = VENDOR_STATUS_LABELS[item.status];
      return (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}>
          <View style={s.vendorCardTop}>
            <View style={s.vendorTextCol}>
              <ThemedText style={[s.vendorName, { color: colors.text }]}>{item.name}</ThemedText>
              <ThemedText style={[s.vendorService, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.service}
              </ThemedText>
            </View>
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
          </View>
          <ThemedText style={[s.vendorSla, { color: colors.textSecondary }]} numberOfLines={2}>
            SLA: {item.sla}
          </ThemedText>
          <View style={[s.vendorFooter, { borderTopColor: colors.border }]}>
            <View style={s.vendorMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.vendorMetaText, { color: colors.textTertiary }]}>
                Renewal {formatDate(item.renewalDate)}
              </ThemedText>
            </View>
            {item.monthlyCost > 0 && (
              <View style={s.vendorMetaItem}>
                <IconSymbol name="dollarsign.circle.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.vendorMetaText, { color: colors.textTertiary }]}>
                  {formatCurrency(item.monthlyCost)}/mo
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={vendors}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="storefront.fill" label="No vendors configured" colors={colors} />
      }
    />
  );
}

// =============================================================================
// PLAYER SERVICES SUB-TAB
// =============================================================================

function PlayerServicesTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const tickets = useMemo(() => {
    const statusOrder: Record<string, number> = { open: 0, 'in-progress': 1, resolved: 2 };
    return [...PLAYER_SERVICE_TICKETS].sort(
      (a, b) => (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3),
    );
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: PlayerServiceTicket }) => {
      const statusColor = TICKET_STATUS_COLORS[item.status];
      const statusLabel = TICKET_STATUS_LABELS[item.status];
      const typeColor = TICKET_TYPE_COLORS[item.type];
      const typeLabel = TICKET_TYPE_LABELS[item.type];
      return (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}>
          <View style={s.ticketCardTop}>
            <View style={s.ticketTextCol}>
              <ThemedText style={[s.ticketPlayer, { color: colors.text }]}>{item.player}</ThemedText>
              <ThemedText style={[s.ticketPriority, { color: colors.textSecondary }]}>
                Priority: {item.priority}
              </ThemedText>
            </View>
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
          </View>
          <View style={s.ticketBadgeRow}>
            <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={tickets}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="person.fill.questionmark" label="No player service tickets" colors={colors} />
      }
    />
  );
}

// =============================================================================
// ANNOUNCEMENTS SUB-TAB
// =============================================================================

function AnnouncementsTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const announcements = OPS_ANNOUNCEMENTS;

  const renderItem = useCallback(
    ({ item }: { item: OpsAnnouncement }) => {
      const audColor = ANNOUNCEMENT_AUDIENCE_COLORS[item.audience];
      const audLabel = ANNOUNCEMENT_AUDIENCE_LABELS[item.audience];
      const confirmPct = Math.round(item.confirmationRate * 100);
      const confirmColor = confirmPct >= 100 ? '#22C55E' : confirmPct >= 70 ? '#F59E0B' : '#EF4444';
      return (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}>
          <View style={s.announcementCardTop}>
            <View style={s.announcementTextCol}>
              <ThemedText style={[s.announcementTitle, { color: colors.text }]} numberOfLines={2}>
                {item.title}
              </ThemedText>
            </View>
          </View>
          <View style={s.announcementBadgeRow}>
            <StatusBadge label={audLabel.toUpperCase()} color={audColor} />
            {item.requiredRead && (
              <StatusBadge label="REQUIRED" color="#EF4444" />
            )}
          </View>
          <View style={[s.announcementFooter, { borderTopColor: colors.border }]}>
            <View style={s.announcementMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.announcementMetaText, { color: colors.textTertiary }]}>
                {formatDate(item.postedDate)}
              </ThemedText>
            </View>
            <View style={s.announcementMetaItem}>
              <IconSymbol name="checkmark.circle.fill" size={11} color={confirmColor} />
              <ThemedText style={[s.announcementMetaText, { color: confirmColor }]}>
                {confirmPct}% confirmed
              </ThemedText>
            </View>
          </View>
          {item.requiredRead && item.confirmationRate < 1.0 && (
            <View style={{ marginTop: Spacing.sm }}>
              <ProgressBar percent={confirmPct} color={confirmColor} />
            </View>
          )}
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={announcements}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="megaphone.fill" label="No announcements posted" colors={colors} />
      }
    />
  );
}

// =============================================================================
// APPROVALS SUB-TAB
// =============================================================================

function ApprovalsTab({
  colors,
  accentColor,
  onSelectApproval,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  onSelectApproval: (approval: OpsApproval) => void;
}) {
  const approvals = useMemo(() => {
    const statusOrder: Record<string, number> = { pending: 0, approved: 1, denied: 2 };
    return [...OPS_APPROVALS].sort((a, b) => (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3));
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: OpsApproval }) => {
      const statusColor = APPROVAL_STATUS_COLORS[item.status];
      const statusLabel = APPROVAL_STATUS_LABELS[item.status];
      return (
        <Pressable
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectApproval(item);
          }}
        >
          <View style={s.approvalCardTop}>
            <View style={s.approvalTextCol}>
              <ThemedText style={[s.approvalTitle, { color: colors.text }]} numberOfLines={2}>
                {item.title}
              </ThemedText>
            </View>
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
          </View>
          <View style={s.approvalBadgeRow}>
            <StatusBadge label={item.type.toUpperCase()} color={accentColor} />
            {item.urgency && (
              <StatusBadge
                label={item.urgency.toUpperCase()}
                color={
                  item.urgency === 'critical' ? '#EF4444'
                    : item.urgency === 'high' ? '#F59E0B'
                      : item.urgency === 'medium' ? '#1D9BF0'
                        : '#A1A1AA'
                }
              />
            )}
          </View>
          <View style={[s.approvalFooter, { borderTopColor: colors.border }]}>
            <View style={s.approvalMetaItem}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.approvalMetaText, { color: colors.textTertiary }]}>
                {item.requestedBy}
              </ThemedText>
            </View>
            {item.amount !== null && (
              <View style={s.approvalMetaItem}>
                <IconSymbol name="dollarsign.circle.fill" size={11} color={accentColor} />
                <ThemedText style={[s.approvalMetaText, { color: accentColor }]}>
                  {formatCurrency(item.amount)}
                </ThemedText>
              </View>
            )}
            <View style={s.approvalMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.approvalMetaText, { color: colors.textTertiary }]}>
                {formatDate(item.requestDate)}
              </ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectApproval],
  );

  return (
    <FlatList
      data={approvals}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="checkmark.seal.fill" label="No approvals pending" colors={colors} />
      }
    />
  );
}

// =============================================================================
// ADMIN SUB-TAB
// =============================================================================

function AdminTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.adminHeader}>
          <IconSymbol name="gearshape.fill" size={24} color={accentColor} />
          <ThemedText style={[s.adminTitle, { color: colors.text }]}>Operations Administration</ThemedText>
        </View>
        <ThemedText style={[s.adminDescription, { color: colors.textSecondary }]}>
          Manage operational settings, workflow automations, integrations, and access controls. Only available to AD and Head Coach roles.
        </ThemedText>
        <View style={[s.adminActionsSection, { borderTopColor: colors.border }]}>
          {[
            { id: 'a1', label: 'Configure Task Workflows', icon: 'checklist' },
            { id: 'a2', label: 'Manage Travel Policies', icon: 'airplane' },
            { id: 'a3', label: 'Facility Access Rules', icon: 'building.2.fill' },
            { id: 'a4', label: 'Equipment Checkout Settings', icon: 'archivebox.fill' },
            { id: 'a5', label: 'Vendor Renewal Alerts', icon: 'storefront.fill' },
            { id: 'a6', label: 'Approval Chain Settings', icon: 'checkmark.seal.fill' },
            { id: 'a7', label: 'Export Operations Data', icon: 'arrow.down.doc.fill' },
          ].map((action) => (
            <Pressable
              key={action.id}
              style={[s.adminActionRow, { borderBottomColor: colors.border }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name={action.icon as any} size={18} color={accentColor} />
              <ThemedText style={[s.adminActionLabel, { color: colors.text }]}>{action.label}</ThemedText>
              <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// TASK DETAIL BOTTOM SHEET
// =============================================================================

function TaskDetailSheet({
  visible,
  onClose,
  task,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  task: OpsTask | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!task) return null;

  const prioColor = TASK_PRIORITY_COLORS[task.priority];
  const prioLabel = TASK_PRIORITY_LABELS[task.priority];
  const statusColor = TASK_STATUS_COLORS[task.status];
  const statusLabel = TASK_STATUS_LABELS[task.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={task.title} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={prioLabel.toUpperCase()} color={prioColor} />
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
        <StatusBadge label={task.category.toUpperCase()} color={accentColor} />
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{task.owner}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Assignee</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: prioColor }]}>{prioLabel}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Priority</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatDate(task.dueDate)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Due Date</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: statusColor }]}>{statusLabel}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Status</ThemedText>
          </View>
        </View>
      </View>

      {/* Category */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Category</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>{task.category}</ThemedText>
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>Close</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// TRIP DETAIL BOTTOM SHEET
// =============================================================================

function TripDetailSheet({
  visible,
  onClose,
  trip,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  trip: TravelTrip | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!trip) return null;

  const statusColor = TRIP_STATUS_COLORS[trip.status];
  const statusLabel = TRIP_STATUS_LABELS[trip.status];
  const budgetPct = trip.budget > 0 ? Math.round((trip.spent / trip.budget) * 100) : 0;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={trip.destination} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
        <StatusBadge label={`${trip.teamSize} TRAVELERS`} color={accentColor} />
        {trip.missingDocs > 0 && (
          <StatusBadge label={`${trip.missingDocs} MISSING DOCS`} color="#EF4444" />
        )}
      </View>

      {/* Leg Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Trip Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatDate(trip.departure)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Departure</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatDate(trip.returnDate)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Return</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{trip.teamSize}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Team Size</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: trip.missingDocs > 0 ? '#EF4444' : '#22C55E' }]}>
              {trip.missingDocs}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Missing Docs</ThemedText>
          </View>
        </View>
      </View>

      {/* Budget */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Budget</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: accentColor }]}>{formatCurrency(trip.budget)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Total Budget</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: budgetPct > 90 ? '#EF4444' : colors.text }]}>
              {formatCurrency(trip.spent)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Spent</ThemedText>
          </View>
        </View>
        <View style={{ marginTop: Spacing.sm }}>
          <ProgressBar percent={budgetPct} color={budgetPct > 90 ? '#EF4444' : accentColor} />
        </View>
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>Close</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// APPROVAL DETAIL BOTTOM SHEET
// =============================================================================

function ApprovalDetailSheet({
  visible,
  onClose,
  approval,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  approval: OpsApproval | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!approval) return null;

  const statusColor = APPROVAL_STATUS_COLORS[approval.status];
  const statusLabel = APPROVAL_STATUS_LABELS[approval.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={approval.title} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={approval.type.toUpperCase()} color={accentColor} />
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
        {approval.urgency && (
          <StatusBadge
            label={approval.urgency.toUpperCase()}
            color={
              approval.urgency === 'critical' ? '#EF4444'
                : approval.urgency === 'high' ? '#F59E0B'
                  : approval.urgency === 'medium' ? '#1D9BF0'
                    : '#A1A1AA'
            }
          />
        )}
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{approval.requestedBy}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Submitter</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatDate(approval.requestDate)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Request Date</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{approval.type}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Type</ThemedText>
          </View>
          {approval.amount !== null && (
            <View style={s.sheetDetailItem}>
              <ThemedText style={[s.sheetDetailValue, { color: accentColor }]}>
                {formatCurrency(approval.amount)}
              </ThemedText>
              <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Amount</ThemedText>
            </View>
          )}
        </View>
      </View>

      {/* Status */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Status</ThemedText>
        <View style={s.sheetListRow}>
          <View style={[s.statusDot, { backgroundColor: statusColor }]} />
          <ThemedText style={[s.sheetBodyText, { color: colors.text }]}>{statusLabel}</ThemedText>
        </View>
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>Close</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SportsOrgOperationsV2({ colors, accentColor, role = 'R1' }: Props) {
  // === RBAC Gate: R4/R5 locked ===
  if (role === 'R4' || role === 'R5') {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Operations</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          {role === 'R4'
            ? 'Scouts cannot access Operations'
            : 'Fans cannot access Operations'}
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [drillMode, setDrillMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState<OpsTask | null>(null);
  const [taskSheetVisible, setTaskSheetVisible] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TravelTrip | null>(null);
  const [tripSheetVisible, setTripSheetVisible] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<OpsApproval | null>(null);
  const [approvalSheetVisible, setApprovalSheetVisible] = useState(false);

  // === Callbacks ===
  const handleSelectTask = useCallback((task: OpsTask) => {
    setSelectedTask(task);
    setTaskSheetVisible(true);
  }, []);

  const handleCloseTaskSheet = useCallback(() => {
    setTaskSheetVisible(false);
  }, []);

  const handleSelectTrip = useCallback((trip: TravelTrip) => {
    setSelectedTrip(trip);
    setTripSheetVisible(true);
  }, []);

  const handleCloseTripSheet = useCallback(() => {
    setTripSheetVisible(false);
  }, []);

  const handleSelectApproval = useCallback((approval: OpsApproval) => {
    setSelectedApproval(approval);
    setApprovalSheetVisible(true);
  }, []);

  const handleCloseApprovalSheet = useCallback(() => {
    setApprovalSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (role === 'R1') return SUB_TABS; // Full 10 tabs
    if (role === 'R2') {
      // Player: Overview + Announcements (comms) + Player Services
      return SUB_TABS.filter(
        (t) => t.id === 'overview' || t.id === 'comms' || t.id === 'player-services',
      );
    }
    if (role === 'R3') {
      // Assistant Coach: all except Admin (settings) and Approvals
      return SUB_TABS.filter((t) => t.id !== 'settings' && t.id !== 'approvals');
    }
    return SUB_TABS;
  }, [role]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return <OverviewTab colors={colors} accentColor={accentColor} />;
      case 'calendar-ops':
        if (role === 'R2') return null;
        return (
          <TasksTab
            colors={colors}
            accentColor={accentColor}
            onSelectTask={handleSelectTask}
          />
        );
      case 'travel':
        if (role === 'R2') return null;
        return (
          <TravelTab
            colors={colors}
            accentColor={accentColor}
            onSelectTrip={handleSelectTrip}
          />
        );
      case 'facilities-ops':
        if (role === 'R2') return null;
        return <BookingsTab colors={colors} accentColor={accentColor} />;
      case 'equipment':
        if (role === 'R2') return null;
        return <EquipmentTab colors={colors} accentColor={accentColor} />;
      case 'vendors':
        if (role === 'R2') return null;
        return <VendorsTab colors={colors} accentColor={accentColor} />;
      case 'player-services':
        return <PlayerServicesTab colors={colors} accentColor={accentColor} />;
      case 'comms':
        return <AnnouncementsTab colors={colors} accentColor={accentColor} />;
      case 'approvals':
        if (role !== 'R1') return null;
        return (
          <ApprovalsTab
            colors={colors}
            accentColor={accentColor}
            onSelectApproval={handleSelectApproval}
          />
        );
      case 'settings':
        if (role !== 'R1') return null;
        return <AdminTab colors={colors} accentColor={accentColor} />;
      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      {/* Sub-tab bar — hidden until drill mode */}
      {drillMode ? (
        <>
          <Pressable
            style={[s.overviewBackBar, { borderBottomColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setDrillMode(false);
              setActiveSubTab('overview');
            }}
          >
            <IconSymbol name="chevron.left" size={14} color={accentColor} />
            <ThemedText style={[s.overviewBackText, { color: accentColor }]}>Overview</ThemedText>
          </Pressable>
          <SubTabBar
            tabs={visibleSubTabs}
            activeId={activeSubTab}
            onSelect={setActiveSubTab}
            accentColor={accentColor}
            colors={colors}
          />
        </>
      ) : null}

      {/* Content */}
      <View style={s.contentContainer}>
        {renderContent()}
      </View>

      {/* Explore bar — overview-only mode */}
      {!drillMode && (
        <Pressable
          style={[s.exploreBar, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setDrillMode(true);
          }}
        >
          <IconSymbol name="rectangle.grid.1x2.fill" size={16} color="#FFFFFF" />
          <ThemedText style={s.exploreBarText}>Explore All Sections</ThemedText>
          <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
        </Pressable>
      )}

      {/* Task Detail Bottom Sheet */}
      <TaskDetailSheet
        visible={taskSheetVisible}
        onClose={handleCloseTaskSheet}
        task={selectedTask}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Trip Detail Bottom Sheet */}
      <TripDetailSheet
        visible={tripSheetVisible}
        onClose={handleCloseTripSheet}
        trip={selectedTrip}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Approval Detail Bottom Sheet */}
      <ApprovalDetailSheet
        visible={approvalSheetVisible}
        onClose={handleCloseApprovalSheet}
        approval={selectedApproval}
        colors={colors}
        accentColor={accentColor}
      />
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
  contentContainer: {
    flex: 1,
  },

  // -- Locked state --
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  lockedMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // -- Overview back bar / Explore bar --
  overviewBackBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  overviewBackText: {
    fontSize: 14,
    fontWeight: '600',
  },
  exploreBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  exploreBarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // -- Sub-tab bar --
  subTabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  subTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Tab scroll containers --
  tabScroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  tabListContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // -- Section titles --
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },

  // -- Empty state --
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: 'center',
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

  // -- Progress bar --
  progressTrack: {
    height: 4,
    backgroundColor: '#2F3336',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },

  // -- Generic Card --
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  cardMeta: {
    fontSize: 13,
  },

  // -- KPI Row --
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  kpiCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },

  // -- Tasks --
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  taskBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  taskMetaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  taskMetaText: {
    fontSize: 11,
  },

  // -- Travel --
  travelCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  travelTextCol: {
    flex: 1,
  },
  travelDestination: {
    fontSize: 14,
    fontWeight: '700',
  },
  travelDates: {
    fontSize: 12,
    marginTop: 2,
  },
  travelBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  travelBudgetSection: {
    marginTop: Spacing.xs,
  },
  travelBudgetLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  travelBudgetLabel: {
    fontSize: 11,
  },
  travelBudgetValues: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // -- Bookings --
  bookingCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  bookingTextCol: {
    flex: 1,
  },
  bookingFacility: {
    fontSize: 14,
    fontWeight: '700',
  },
  bookingPurpose: {
    fontSize: 12,
    marginTop: 2,
  },
  bookingFooter: {
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    flexDirection: 'row',
    gap: Spacing.md,
  },
  bookingMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  bookingMetaText: {
    fontSize: 11,
  },

  // -- Equipment --
  equipCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  equipTextCol: {
    flex: 1,
  },
  equipName: {
    fontSize: 14,
    fontWeight: '700',
  },
  equipCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  equipFooter: {
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    gap: Spacing.xs,
  },
  equipMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  equipMetaText: {
    fontSize: 11,
  },

  // -- Vendors --
  vendorCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  vendorTextCol: {
    flex: 1,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  vendorService: {
    fontSize: 12,
    marginTop: 2,
  },
  vendorSla: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  vendorFooter: {
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vendorMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  vendorMetaText: {
    fontSize: 11,
  },

  // -- Player Service Tickets --
  ticketCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  ticketTextCol: {
    flex: 1,
  },
  ticketPlayer: {
    fontSize: 14,
    fontWeight: '700',
  },
  ticketPriority: {
    fontSize: 12,
    marginTop: 2,
  },
  ticketBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },

  // -- Announcements --
  announcementCardTop: {
    marginBottom: Spacing.sm,
  },
  announcementTextCol: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  announcementBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  announcementFooter: {
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  announcementMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  announcementMetaText: {
    fontSize: 11,
  },

  // -- Approvals --
  approvalCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  approvalTextCol: {
    flex: 1,
  },
  approvalTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  approvalBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  approvalFooter: {
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  approvalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  approvalMetaText: {
    fontSize: 11,
  },

  // -- Admin --
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  adminDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  adminActionsSection: {
    borderTopWidth: 1,
    paddingTop: Spacing.md,
  },
  adminActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  adminActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },

  // -- Status Dot --
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // -- Bottom Sheet shared --
  sheetBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  sheetSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  sheetSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  sheetBodyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  sheetDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  sheetDetailItem: {
    width: '47%',
    marginBottom: Spacing.sm,
  },
  sheetDetailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  sheetDetailLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  sheetListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  sheetActions: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  sheetGhostButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sheetGhostButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
