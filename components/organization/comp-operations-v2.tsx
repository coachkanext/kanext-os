/**
 * Competition Organization Operations Tab — 10-tab Operations Hub.
 * Dashboard, Events, Logistics, Venues, Equipment, Scheduling, Incidents, Tasks, Reports, Settings.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, TextInput, Pressable, Switch, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import {
  COMP_OPS_TABS,
  COMP_OPS_SCOPE_CHIPS,
  EVENT_STATUS_COLOR,
  LOGISTICS_STATUS_COLOR,
  VENUE_STATUS_COLOR,
  TASK_PRIORITY_COLOR,
  INCIDENT_SEVERITY_COLOR,
  TASK_STATUS_COLOR,
  INCIDENT_STATUS_COLOR,
  EQUIPMENT_CONDITION_COLOR,
  getCompOpsData,
} from '@/data/mock-comp-org-operations';
import type {
  CompOpsTabId,
  OpsDashboardBlock,
  CompEvent,
  LogisticsItem,
  CompVenue,
  Equipment,
  ScheduleBlock,
  Incident,
  OpsTask,
  OpsReport,
  OpsSettingToggle,
  ActivityFeedItem,
} from '@/data/mock-comp-org-operations';

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US');
}

function eventTypeLabel(type: CompEvent['type']): string {
  switch (type) {
    case 'match': return 'MATCH';
    case 'ceremony': return 'CEREMONY';
    case 'media-day': return 'MEDIA DAY';
    case 'practice': return 'PRACTICE';
  }
}

function logisticsCategoryLabel(cat: LogisticsItem['category']): string {
  switch (cat) {
    case 'transport': return 'Transport';
    case 'catering': return 'Catering';
    case 'equipment': return 'Equipment';
    case 'accommodation': return 'Accommodation';
    case 'security': return 'Security';
  }
}

function equipmentCategoryLabel(cat: Equipment['category']): string {
  switch (cat) {
    case 'scoring': return 'Scoring';
    case 'timing': return 'Timing';
    case 'broadcast': return 'Broadcast';
    case 'safety': return 'Safety';
    case 'general': return 'General';
  }
}

function scheduleTypeLabel(type: string): string {
  switch (type) {
    case 'match': return 'MATCH';
    case 'ceremony': return 'CEREMONY';
    case 'media-day': return 'MEDIA';
    case 'practice': return 'PRACTICE';
    case 'setup': return 'SETUP';
    default: return type.toUpperCase();
  }
}

function scheduleTypeColor(type: string): string {
  switch (type) {
    case 'match': return '#3B82F6';
    case 'ceremony': return '#8B5CF6';
    case 'media-day': return '#F59E0B';
    case 'practice': return '#22C55E';
    case 'setup': return '#6B7280';
    default: return '#6B7280';
  }
}

function reportFormatColor(format: OpsReport['format']): string {
  switch (format) {
    case 'PDF': return '#EF4444';
    case 'CSV': return '#22C55E';
    case 'XLSX': return '#3B82F6';
  }
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
// DASHBOARD TAB
// =============================================================================

function DashboardTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getCompOpsData>;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* KPI Cards */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Overview</ThemedText>
      <View style={s.kpiGrid}>
        {data.dashboard.map((block: OpsDashboardBlock) => (
          <View
            key={block.id}
            style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.kpiHeader}>
              <IconSymbol name={block.icon as any} size={18} color={block.color} />
              <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>
                {block.label}
              </ThemedText>
            </View>
            <ThemedText style={[s.kpiValue, { color: colors.text }]}>{block.value}</ThemedText>
            <ThemedText style={[s.kpiDelta, { color: colors.textTertiary }]}>{block.delta}</ThemedText>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Quick Actions
      </ThemedText>
      <View style={s.quickActionsGrid}>
        {[
          { id: 'qa-1', label: 'New Event', icon: 'plus.circle.fill', color: '#3B82F6' },
          { id: 'qa-2', label: 'Log Incident', icon: 'exclamationmark.triangle.fill', color: '#EF4444' },
          { id: 'qa-3', label: 'Add Task', icon: 'checkmark.circle.fill', color: '#22C55E' },
          { id: 'qa-4', label: 'Book Venue', icon: 'building.2.fill', color: '#8B5CF6' },
          { id: 'qa-5', label: 'Track Shipment', icon: 'shippingbox.fill', color: '#F59E0B' },
          { id: 'qa-6', label: 'Run Report', icon: 'chart.bar.fill', color: '#6AA9FF' },
        ].map((action) => (
          <Pressable
            key={action.id}
            style={[s.quickActionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[s.quickActionIconCircle, { backgroundColor: action.color + '18' }]}>
              <IconSymbol name={action.icon as any} size={20} color={action.color} />
            </View>
            <ThemedText style={[s.quickActionLabel, { color: colors.text }]} numberOfLines={1}>
              {action.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* Activity Feed */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Activity Feed
      </ThemedText>
      <View style={[s.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {data.activityFeed.map((item: ActivityFeedItem, index: number) => (
          <View
            key={item.id}
            style={[
              s.activityRow,
              index < data.activityFeed.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={[s.activityIconCircle, { backgroundColor: item.color + '18' }]}>
              <IconSymbol name={item.icon as any} size={14} color={item.color} />
            </View>
            <View style={s.activityTextCol}>
              <ThemedText style={[s.activityText, { color: colors.text }]} numberOfLines={2}>
                {item.description}
              </ThemedText>
              <ThemedText style={[s.activityTime, { color: colors.textTertiary }]}>
                {item.timestamp}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Summary Stats Row */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Operations Summary
      </ThemedText>
      <View style={[s.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.summaryRow}>
          <View style={s.summaryItem}>
            <ThemedText style={[s.summaryValue, { color: colors.text }]}>
              {data.events.length}
            </ThemedText>
            <ThemedText style={[s.summaryLabel, { color: colors.textTertiary }]}>
              Total Events
            </ThemedText>
          </View>
          <View style={s.summaryItem}>
            <ThemedText style={[s.summaryValue, { color: colors.text }]}>
              {data.logistics.length}
            </ThemedText>
            <ThemedText style={[s.summaryLabel, { color: colors.textTertiary }]}>
              Logistics Items
            </ThemedText>
          </View>
          <View style={s.summaryItem}>
            <ThemedText style={[s.summaryValue, { color: colors.text }]}>
              {data.venues.length}
            </ThemedText>
            <ThemedText style={[s.summaryLabel, { color: colors.textTertiary }]}>
              Venues
            </ThemedText>
          </View>
          <View style={s.summaryItem}>
            <ThemedText style={[s.summaryValue, { color: colors.text }]}>
              {data.tasks.filter((t) => t.status !== 'done').length}
            </ThemedText>
            <ThemedText style={[s.summaryLabel, { color: colors.textTertiary }]}>
              Open Tasks
            </ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// EVENTS TAB
// =============================================================================

function EventsTab({
  colors,
  accentColor,
  data,
  onSelectEvent,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: CompEvent[];
  onSelectEvent: (event: CompEvent) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = EVENT_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectEvent(item);
            }}
          >
            {/* Top row: name + status */}
            <View style={s.eventCardTop}>
              <View style={s.eventCardInfo}>
                <View style={[s.eventTypeStripe, { backgroundColor: stColor }]} />
                <View style={s.eventCardMid}>
                  <ThemedText style={[s.eventCardName, { color: colors.text }]} numberOfLines={2}>
                    {item.name}
                  </ThemedText>
                  <View style={s.eventCardBadgeRow}>
                    <StatusBadge label={eventTypeLabel(item.type)} color={accentColor} />
                    <StatusBadge label={item.status.toUpperCase()} color={stColor} />
                  </View>
                </View>
              </View>
            </View>

            {/* Details */}
            <View style={[s.eventCardDetails, { borderTopColor: colors.border }]}>
              <View style={s.eventDetailItem}>
                <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.eventDetailText, { color: colors.textSecondary }]}>
                  {item.date}
                </ThemedText>
              </View>
              <View style={s.eventDetailItem}>
                <IconSymbol name="mappin.and.ellipse" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.eventDetailText, { color: colors.textSecondary }]}>
                  {item.venue}
                </ThemedText>
              </View>
            </View>

            {/* Footer stats */}
            <View style={s.eventCardFooter}>
              <View style={s.eventStatItem}>
                <ThemedText style={[s.eventStatValue, { color: colors.text }]}>
                  {item.series}
                </ThemedText>
                <ThemedText style={[s.eventStatLabel, { color: colors.textTertiary }]}>
                  Series
                </ThemedText>
              </View>
              <View style={s.eventStatItem}>
                <ThemedText style={[s.eventStatValue, { color: colors.text }]}>
                  {item.attendees > 0 ? item.attendees.toLocaleString() : '\u2014'}
                </ThemedText>
                <ThemedText style={[s.eventStatLabel, { color: colors.textTertiary }]}>
                  Attendees
                </ThemedText>
              </View>
              <View style={s.eventStatItem}>
                <ThemedText style={[s.eventStatValue, { color: colors.text }]}>
                  {item.staff}
                </ThemedText>
                <ThemedText style={[s.eventStatLabel, { color: colors.textTertiary }]}>
                  Staff
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="calendar.badge.clock" label="No events found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// LOGISTICS TAB
// =============================================================================

function LogisticsTab({
  colors,
  accentColor,
  data,
  onSelectLogistics,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: LogisticsItem[];
  onSelectLogistics: (item: LogisticsItem) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = LOGISTICS_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.logisticsCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectLogistics(item);
            }}
          >
            <View style={s.logisticsCardTop}>
              <View style={s.logisticsCardInfo}>
                <ThemedText style={[s.logisticsName, { color: colors.text }]} numberOfLines={2}>
                  {item.name}
                </ThemedText>
                <View style={s.logisticsCardBadgeRow}>
                  <StatusBadge label={logisticsCategoryLabel(item.category).toUpperCase()} color={accentColor} />
                  <StatusBadge label={item.status.toUpperCase()} color={stColor} />
                </View>
              </View>
            </View>

            <View style={[s.logisticsCardMeta, { borderTopColor: colors.border }]}>
              <View style={s.logisticsMetaItem}>
                <IconSymbol name="building.2.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.logisticsMetaText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.vendor}
                </ThemedText>
              </View>
              <View style={s.logisticsMetaItem}>
                <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.logisticsMetaText, { color: colors.textSecondary }]}>
                  Due {item.dueDate}
                </ThemedText>
              </View>
            </View>

            <View style={s.logisticsCardBottom}>
              <ThemedText style={[s.logisticsEvent, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.event}
              </ThemedText>
              <ThemedText style={[s.logisticsCost, { color: colors.text }]}>
                {formatCurrency(item.cost)}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="shippingbox.fill" label="No logistics items" colors={colors} />
      }
    />
  );
}

// =============================================================================
// VENUES TAB
// =============================================================================

function VenuesTab({
  colors,
  accentColor,
  data,
  onSelectVenue,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: CompVenue[];
  onSelectVenue: (venue: CompVenue) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = VENUE_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.venueCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectVenue(item);
            }}
          >
            <View style={s.venueCardTop}>
              <View style={s.venueCardInfo}>
                <View style={[s.venueIconCircle, { backgroundColor: stColor + '18' }]}>
                  <IconSymbol name="building.2.fill" size={20} color={stColor} />
                </View>
                <View style={s.venueCardMid}>
                  <ThemedText style={[s.venueCardName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <View style={s.venueCardBadgeRow}>
                    <StatusBadge label={item.type.toUpperCase()} color={accentColor} />
                    <StatusBadge label={item.status.toUpperCase()} color={stColor} />
                  </View>
                </View>
              </View>
            </View>

            <View style={[s.venueCardDetails, { borderTopColor: colors.border }]}>
              <View style={s.venueDetailItem}>
                <ThemedText style={[s.venueDetailValue, { color: colors.text }]}>
                  {item.capacity.toLocaleString()}
                </ThemedText>
                <ThemedText style={[s.venueDetailLabel, { color: colors.textTertiary }]}>
                  Capacity
                </ThemedText>
              </View>
              <View style={s.venueDetailItem}>
                <ThemedText style={[s.venueDetailValue, { color: colors.text }]}>
                  {item.amenities.length}
                </ThemedText>
                <ThemedText style={[s.venueDetailLabel, { color: colors.textTertiary }]}>
                  Amenities
                </ThemedText>
              </View>
              <View style={s.venueDetailItem}>
                <ThemedText style={[s.venueDetailValue, { color: colors.textSecondary }]}>
                  {item.city}
                </ThemedText>
                <ThemedText style={[s.venueDetailLabel, { color: colors.textTertiary }]}>
                  Location
                </ThemedText>
              </View>
            </View>

            <View style={s.venueCardFooter}>
              <IconSymbol name="person.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.venueContactText, { color: colors.textSecondary }]}>
                {item.contactName}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="building.2.fill" label="No venues found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// EQUIPMENT TAB
// =============================================================================

function EquipmentTab({
  colors,
  accentColor,
  data,
  onSelectEquipment,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: Equipment[];
  onSelectEquipment: (eq: Equipment) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const condColor = EQUIPMENT_CONDITION_COLOR[item.condition];
        return (
          <Pressable
            style={[s.equipmentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectEquipment(item);
            }}
          >
            <View style={s.equipmentCardTop}>
              <View style={s.equipmentCardInfo}>
                <ThemedText style={[s.equipmentName, { color: colors.text }]} numberOfLines={2}>
                  {item.name}
                </ThemedText>
                <View style={s.equipmentCardBadgeRow}>
                  <StatusBadge label={equipmentCategoryLabel(item.category).toUpperCase()} color={accentColor} />
                  <StatusBadge label={item.condition.toUpperCase()} color={condColor} />
                </View>
              </View>
            </View>

            <View style={[s.equipmentCardMeta, { borderTopColor: colors.border }]}>
              <View style={s.equipmentMetaRow}>
                <View style={s.equipmentMetaItem}>
                  <IconSymbol name="number" size={12} color={colors.textTertiary} />
                  <ThemedText style={[s.equipmentMetaText, { color: colors.textSecondary }]}>
                    Qty: {item.quantity}
                  </ThemedText>
                </View>
                <View style={s.equipmentMetaItem}>
                  <IconSymbol name="mappin.and.ellipse" size={12} color={colors.textTertiary} />
                  <ThemedText style={[s.equipmentMetaText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.assignedTo}
                  </ThemedText>
                </View>
              </View>
              <View style={s.equipmentMetaRow}>
                <View style={s.equipmentMetaItem}>
                  <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                  <ThemedText style={[s.equipmentMetaText, { color: colors.textSecondary }]}>
                    Inspected: {item.lastInspected}
                  </ThemedText>
                </View>
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="wrench.and.screwdriver.fill" label="No equipment found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// SCHEDULING TAB
// =============================================================================

function SchedulingTab({
  colors,
  data,
}: {
  colors: typeof Colors.light;
  data: ScheduleBlock[];
}) {
  // Group by date
  const grouped = useMemo(() => {
    const groups: { date: string; blocks: ScheduleBlock[] }[] = [];
    let currentDate = '';
    data.forEach((block) => {
      if (block.date !== currentDate) {
        currentDate = block.date;
        groups.push({ date: currentDate, blocks: [block] });
      } else {
        groups[groups.length - 1].blocks.push(block);
      }
    });
    return groups;
  }, [data]);

  return (
    <FlatList
      data={grouped}
      keyExtractor={(item) => item.date}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item: group }) => (
        <View style={s.scheduleGroup}>
          {/* Date header */}
          <View style={s.scheduleDateHeader}>
            <View style={[s.scheduleDateBadge, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[s.scheduleDateText, { color: colors.text }]}>
                {group.date}
              </ThemedText>
            </View>
          </View>
          {/* Time blocks */}
          {group.blocks.map((block, idx) => {
            const typeColor = scheduleTypeColor(block.type);
            return (
              <View
                key={block.id}
                style={[
                  s.scheduleBlockCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  idx < group.blocks.length - 1 && { marginBottom: Spacing.sm },
                ]}
              >
                <View style={[s.scheduleBlockStripe, { backgroundColor: typeColor }]} />
                <View style={s.scheduleBlockContent}>
                  <View style={s.scheduleBlockTop}>
                    <ThemedText style={[s.scheduleBlockTitle, { color: colors.text }]} numberOfLines={1}>
                      {block.event}
                    </ThemedText>
                    <StatusBadge label={scheduleTypeLabel(block.type)} color={typeColor} />
                  </View>
                  <View style={s.scheduleBlockTimeRow}>
                    <IconSymbol name="clock.fill" size={12} color={colors.textTertiary} />
                    <ThemedText style={[s.scheduleBlockTime, { color: colors.textSecondary }]}>
                      {block.timeStart} \u2013 {block.timeEnd}
                    </ThemedText>
                  </View>
                  <View style={s.scheduleBlockVenueRow}>
                    <IconSymbol name="mappin.and.ellipse" size={12} color={colors.textTertiary} />
                    <ThemedText style={[s.scheduleBlockVenue, { color: colors.textTertiary }]}>
                      {block.venue}
                    </ThemedText>
                  </View>
                  {block.notes.length > 0 && (
                    <ThemedText style={[s.scheduleBlockNotes, { color: colors.textTertiary }]} numberOfLines={2}>
                      {block.notes}
                    </ThemedText>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
      ListEmptyComponent={
        <EmptyState icon="clock.fill" label="No schedule blocks" colors={colors} />
      }
    />
  );
}

// =============================================================================
// INCIDENTS TAB
// =============================================================================

function IncidentsTab({
  colors,
  accentColor,
  data,
  onSelectIncident,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: Incident[];
  onSelectIncident: (incident: Incident) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const sevColor = INCIDENT_SEVERITY_COLOR[item.severity];
        const statColor = INCIDENT_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.incidentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectIncident(item);
            }}
          >
            <View style={s.incidentCardTop}>
              <View style={[s.incidentSeverityDot, { backgroundColor: sevColor }]} />
              <View style={s.incidentCardInfo}>
                <ThemedText style={[s.incidentType, { color: colors.text }]}>
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </ThemedText>
                <View style={s.incidentCardBadgeRow}>
                  <StatusBadge label={item.severity.toUpperCase()} color={sevColor} />
                  <StatusBadge label={item.status.toUpperCase()} color={statColor} />
                </View>
              </View>
            </View>

            <ThemedText style={[s.incidentDescription, { color: colors.textSecondary }]} numberOfLines={3}>
              {item.description}
            </ThemedText>

            <View style={[s.incidentCardMeta, { borderTopColor: colors.border }]}>
              <View style={s.incidentMetaItem}>
                <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.incidentMetaText, { color: colors.textTertiary }]}>
                  {item.date}
                </ThemedText>
              </View>
              <View style={s.incidentMetaItem}>
                <IconSymbol name="sportscourt.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.incidentMetaText, { color: colors.textTertiary }]} numberOfLines={1}>
                  {item.event}
                </ThemedText>
              </View>
            </View>

            <View style={s.incidentAssigneeRow}>
              <IconSymbol name="person.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.incidentAssignee, { color: colors.textSecondary }]}>
                {item.assignee}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="exclamationmark.triangle.fill" label="No incidents reported" colors={colors} />
      }
    />
  );
}

// =============================================================================
// TASKS TAB
// =============================================================================

function TasksTab({
  colors,
  accentColor,
  data,
  onSelectTask,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: OpsTask[];
  onSelectTask: (task: OpsTask) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const prioColor = TASK_PRIORITY_COLOR[item.priority];
        const statColor = TASK_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectTask(item);
            }}
          >
            <View style={s.taskCardTop}>
              <View style={[s.taskPriorityStripe, { backgroundColor: prioColor }]} />
              <View style={s.taskCardInfo}>
                <ThemedText style={[s.taskTitle, { color: colors.text }]} numberOfLines={2}>
                  {item.title}
                </ThemedText>
                <View style={s.taskCardBadgeRow}>
                  <StatusBadge label={item.priority.toUpperCase()} color={prioColor} />
                  <StatusBadge label={item.status.toUpperCase()} color={statColor} />
                </View>
              </View>
            </View>

            <View style={[s.taskCardMeta, { borderTopColor: colors.border }]}>
              <View style={s.taskMetaItem}>
                <IconSymbol name="person.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.taskMetaText, { color: colors.textSecondary }]}>
                  {item.assignee}
                </ThemedText>
              </View>
              <View style={s.taskMetaItem}>
                <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.taskMetaText, { color: colors.textSecondary }]}>
                  {item.dueDate}
                </ThemedText>
              </View>
            </View>

            <View style={s.taskCardBottom}>
              <ThemedText style={[s.taskEvent, { color: colors.textTertiary }]} numberOfLines={1}>
                {item.event}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="checkmark.circle.fill" label="No tasks found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// REPORTS TAB
// =============================================================================

function ReportsTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: OpsReport[];
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const fmtColor = reportFormatColor(item.format);
        return (
          <Pressable
            style={[s.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.reportCardTop}>
              <View style={[s.reportFormatBadge, { backgroundColor: fmtColor + '18' }]}>
                <ThemedText style={[s.reportFormatText, { color: fmtColor }]}>
                  {item.format}
                </ThemedText>
              </View>
              <View style={s.reportCardInfo}>
                <ThemedText style={[s.reportName, { color: colors.text }]} numberOfLines={2}>
                  {item.name}
                </ThemedText>
                <ThemedText style={[s.reportType, { color: colors.textSecondary }]}>
                  {item.type}
                </ThemedText>
              </View>
            </View>

            <View style={[s.reportCardBottom, { borderTopColor: colors.border }]}>
              <View style={s.reportDateRow}>
                <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.reportDateText, { color: colors.textTertiary }]}>
                  {item.date}
                </ThemedText>
              </View>
              <Pressable
                style={[s.reportDownloadButton, { backgroundColor: accentColor + '18' }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                <IconSymbol name="arrow.down.circle.fill" size={14} color={accentColor} />
                <ThemedText style={[s.reportDownloadText, { color: accentColor }]}>
                  Download
                </ThemedText>
              </Pressable>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="chart.bar.fill" label="No reports available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// SETTINGS TAB
// =============================================================================

function SettingsTab({
  colors,
  accentColor,
  data,
  onToggle,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: OpsSettingToggle[];
  onToggle: (id: string) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={[s.settingRow, { borderBottomColor: colors.border }]}>
          <View style={s.settingInfo}>
            <ThemedText style={[s.settingLabel, { color: colors.text }]}>{item.label}</ThemedText>
            <ThemedText style={[s.settingDescription, { color: colors.textTertiary }]}>
              {item.description}
            </ThemedText>
          </View>
          <Switch
            value={item.enabled}
            onValueChange={() => onToggle(item.id)}
            trackColor={{ false: colors.backgroundTertiary, true: accentColor + '60' }}
            thumbColor={item.enabled ? accentColor : colors.textTertiary}
          />
        </View>
      )}
      ListEmptyComponent={
        <EmptyState icon="gearshape.fill" label="No settings available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// EVENT DETAIL BOTTOM SHEET
// =============================================================================

function EventDetailSheet({
  visible,
  onClose,
  event,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  event: CompEvent | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!event) return null;

  const stColor = EVENT_STATUS_COLOR[event.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={event.name} useModal>
      {/* Status + type */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={event.status.toUpperCase()} color={stColor} />
        <StatusBadge label={eventTypeLabel(event.type)} color={accentColor} />
      </View>

      {/* KPIs */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {event.attendees > 0 ? event.attendees.toLocaleString() : '\u2014'}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Attendees</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{event.staff}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Staff</ThemedText>
        </View>
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Series</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {event.series}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Venue</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {event.venue}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Date</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {event.date}
        </ThemedText>
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>View Full Event</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// LOGISTICS DETAIL BOTTOM SHEET
// =============================================================================

function LogisticsDetailSheet({
  visible,
  onClose,
  item,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  item: LogisticsItem | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!item) return null;

  const stColor = LOGISTICS_STATUS_COLOR[item.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={item.name} useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={logisticsCategoryLabel(item.category).toUpperCase()} color={accentColor} />
        <StatusBadge label={item.status.toUpperCase()} color={stColor} />
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Vendor</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {item.vendor}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Event</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {item.event}
        </ThemedText>
      </View>

      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatCurrency(item.cost)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Cost</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{item.dueDate}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Due Date</ThemedText>
        </View>
      </View>

      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>Track Shipment</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// VENUE DETAIL BOTTOM SHEET
// =============================================================================

function VenueDetailSheet({
  visible,
  onClose,
  venue,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  venue: CompVenue | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!venue) return null;

  const stColor = VENUE_STATUS_COLOR[venue.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={venue.name} useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={venue.type.toUpperCase()} color={accentColor} />
        <StatusBadge label={venue.status.toUpperCase()} color={stColor} />
      </View>

      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {venue.capacity.toLocaleString()}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Capacity</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{venue.amenities.length}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Amenities</ThemedText>
        </View>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Location</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {venue.city}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Contact</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {venue.contactName}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Amenities</ThemedText>
        <View style={s.sheetAmenitiesList}>
          {venue.amenities.map((amenity, idx) => (
            <View key={idx} style={[s.sheetAmenityChip, { backgroundColor: accentColor + '15' }]}>
              <ThemedText style={[s.sheetAmenityText, { color: accentColor }]}>
                {amenity}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>Book Venue</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// INCIDENT DETAIL BOTTOM SHEET
// =============================================================================

function IncidentDetailSheet({
  visible,
  onClose,
  incident,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  incident: Incident | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!incident) return null;

  const sevColor = INCIDENT_SEVERITY_COLOR[incident.severity];
  const statColor = INCIDENT_STATUS_COLOR[incident.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Incident Detail" useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={incident.severity.toUpperCase()} color={sevColor} />
        <StatusBadge label={incident.status.toUpperCase()} color={statColor} />
        <StatusBadge label={incident.type.toUpperCase()} color={accentColor} />
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Description</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {incident.description}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Event</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {incident.event}
        </ThemedText>
      </View>

      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{incident.date}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Date</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{incident.assignee}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Assignee</ThemedText>
        </View>
      </View>

      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>Update Status</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
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

  const prioColor = TASK_PRIORITY_COLOR[task.priority];
  const statColor = TASK_STATUS_COLOR[task.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={task.title} useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={task.priority.toUpperCase()} color={prioColor} />
        <StatusBadge label={task.status.toUpperCase()} color={statColor} />
      </View>

      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{task.assignee}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Assignee</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{task.dueDate}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Due Date</ThemedText>
        </View>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Event</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {task.event}
        </ThemedText>
      </View>

      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>Mark Complete</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// EQUIPMENT DETAIL BOTTOM SHEET
// =============================================================================

function EquipmentDetailSheet({
  visible,
  onClose,
  equipment,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!equipment) return null;

  const condColor = EQUIPMENT_CONDITION_COLOR[equipment.condition];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={equipment.name} useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={equipmentCategoryLabel(equipment.category).toUpperCase()} color={accentColor} />
        <StatusBadge label={equipment.condition.toUpperCase()} color={condColor} />
      </View>

      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{equipment.quantity}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Quantity</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{equipment.lastInspected}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Last Inspected</ThemedText>
        </View>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Assigned To</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {equipment.assignedTo}
        </ThemedText>
      </View>

      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>Schedule Inspection</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function CompOperationsV2({ colors, accentColor }: Props) {
  // === State ===
  const [activeTab, setActiveTab] = useState<CompOpsTabId>('dashboard');
  const [activeScope, setActiveScope] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Bottom sheet states
  const [selectedEvent, setSelectedEvent] = useState<CompEvent | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedLogistics, setSelectedLogistics] = useState<LogisticsItem | null>(null);
  const [showLogisticsDetail, setShowLogisticsDetail] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<CompVenue | null>(null);
  const [showVenueDetail, setShowVenueDetail] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showEquipmentDetail, setShowEquipmentDetail] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showIncidentDetail, setShowIncidentDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState<OpsTask | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  // Settings state (local toggle tracking)
  const [settingOverrides, setSettingOverrides] = useState<Record<string, boolean>>({});

  // === Data ===
  const scopeLabel = COMP_OPS_SCOPE_CHIPS[activeScope] ?? 'All Ops';
  const data = useMemo(() => getCompOpsData(scopeLabel), [scopeLabel]);

  // Settings with overrides applied
  const settingsWithOverrides = useMemo(() => {
    return data.settings.map((setting) => ({
      ...setting,
      enabled: settingOverrides[setting.id] !== undefined
        ? settingOverrides[setting.id]
        : setting.enabled,
    }));
  }, [data.settings, settingOverrides]);

  // === Filtered data based on search ===
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return data.events;
    const q = searchQuery.toLowerCase();
    return data.events.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.series.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.status.toLowerCase().includes(q),
    );
  }, [data.events, searchQuery]);

  const filteredLogistics = useMemo(() => {
    if (!searchQuery.trim()) return data.logistics;
    const q = searchQuery.toLowerCase();
    return data.logistics.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.vendor.toLowerCase().includes(q) ||
        l.event.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q),
    );
  }, [data.logistics, searchQuery]);

  const filteredVenues = useMemo(() => {
    if (!searchQuery.trim()) return data.venues;
    const q = searchQuery.toLowerCase();
    return data.venues.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q) ||
        v.contactName.toLowerCase().includes(q),
    );
  }, [data.venues, searchQuery]);

  const filteredEquipment = useMemo(() => {
    if (!searchQuery.trim()) return data.equipment;
    const q = searchQuery.toLowerCase();
    return data.equipment.filter(
      (eq) =>
        eq.name.toLowerCase().includes(q) ||
        eq.category.toLowerCase().includes(q) ||
        eq.assignedTo.toLowerCase().includes(q) ||
        eq.condition.toLowerCase().includes(q),
    );
  }, [data.equipment, searchQuery]);

  const filteredSchedule = useMemo(() => {
    if (!searchQuery.trim()) return data.schedule;
    const q = searchQuery.toLowerCase();
    return data.schedule.filter(
      (sb) =>
        sb.event.toLowerCase().includes(q) ||
        sb.venue.toLowerCase().includes(q) ||
        sb.type.toLowerCase().includes(q) ||
        sb.notes.toLowerCase().includes(q),
    );
  }, [data.schedule, searchQuery]);

  const filteredIncidents = useMemo(() => {
    if (!searchQuery.trim()) return data.incidents;
    const q = searchQuery.toLowerCase();
    return data.incidents.filter(
      (inc) =>
        inc.description.toLowerCase().includes(q) ||
        inc.event.toLowerCase().includes(q) ||
        inc.type.toLowerCase().includes(q) ||
        inc.assignee.toLowerCase().includes(q),
    );
  }, [data.incidents, searchQuery]);

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return data.tasks;
    const q = searchQuery.toLowerCase();
    return data.tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q) ||
        t.event.toLowerCase().includes(q) ||
        t.priority.toLowerCase().includes(q),
    );
  }, [data.tasks, searchQuery]);

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return data.reports;
    const q = searchQuery.toLowerCase();
    return data.reports.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.format.toLowerCase().includes(q),
    );
  }, [data.reports, searchQuery]);

  // === Callbacks ===
  const handleTabPress = useCallback((tabId: CompOpsTabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  }, []);

  const handleScopePress = useCallback((index: number) => {
    Haptics.selectionAsync();
    setActiveScope(index);
  }, []);

  const handleSelectEvent = useCallback((event: CompEvent) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
  }, []);

  const handleSelectLogistics = useCallback((item: LogisticsItem) => {
    setSelectedLogistics(item);
    setShowLogisticsDetail(true);
  }, []);

  const handleSelectVenue = useCallback((venue: CompVenue) => {
    setSelectedVenue(venue);
    setShowVenueDetail(true);
  }, []);

  const handleSelectEquipment = useCallback((eq: Equipment) => {
    setSelectedEquipment(eq);
    setShowEquipmentDetail(true);
  }, []);

  const handleSelectIncident = useCallback((incident: Incident) => {
    setSelectedIncident(incident);
    setShowIncidentDetail(true);
  }, []);

  const handleSelectTask = useCallback((task: OpsTask) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  }, []);

  const handleToggleSetting = useCallback((id: string) => {
    setSettingOverrides((prev) => {
      const currentVal = prev[id] !== undefined
        ? prev[id]
        : data.settings.find((st) => st.id === id)?.enabled ?? false;
      return { ...prev, [id]: !currentVal };
    });
  }, [data.settings]);

  // === Tab content renderer ===
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab colors={colors} accentColor={accentColor} data={data} />;
      case 'events':
        return (
          <EventsTab
            colors={colors}
            accentColor={accentColor}
            data={filteredEvents}
            onSelectEvent={handleSelectEvent}
          />
        );
      case 'logistics':
        return (
          <LogisticsTab
            colors={colors}
            accentColor={accentColor}
            data={filteredLogistics}
            onSelectLogistics={handleSelectLogistics}
          />
        );
      case 'venues':
        return (
          <VenuesTab
            colors={colors}
            accentColor={accentColor}
            data={filteredVenues}
            onSelectVenue={handleSelectVenue}
          />
        );
      case 'equipment':
        return (
          <EquipmentTab
            colors={colors}
            accentColor={accentColor}
            data={filteredEquipment}
            onSelectEquipment={handleSelectEquipment}
          />
        );
      case 'scheduling':
        return <SchedulingTab colors={colors} data={filteredSchedule} />;
      case 'incidents':
        return (
          <IncidentsTab
            colors={colors}
            accentColor={accentColor}
            data={filteredIncidents}
            onSelectIncident={handleSelectIncident}
          />
        );
      case 'tasks':
        return (
          <TasksTab
            colors={colors}
            accentColor={accentColor}
            data={filteredTasks}
            onSelectTask={handleSelectTask}
          />
        );
      case 'reports':
        return (
          <ReportsTab
            colors={colors}
            accentColor={accentColor}
            data={filteredReports}
          />
        );
      case 'settings':
        return (
          <SettingsTab
            colors={colors}
            accentColor={accentColor}
            data={settingsWithOverrides}
            onToggle={handleToggleSetting}
          />
        );
      default:
        return null;
    }
  };

  // === Render ===
  return (
    <View style={s.container}>
      {/* Sub-tab pill bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tabPillRow}
      >
        {COMP_OPS_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              style={[
                s.tabPill,
                { backgroundColor: isActive ? accentColor : colors.backgroundTertiary },
              ]}
              onPress={() => handleTabPress(tab.id)}
            >
              <ThemedText
                style={[
                  s.tabPillText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Scope chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.scopeChipRow}
      >
        {COMP_OPS_SCOPE_CHIPS.map((chip, index) => {
          const isActive = index === activeScope;
          return (
            <Pressable
              key={chip}
              style={[
                s.scopeChip,
                { backgroundColor: isActive ? accentColor + '20' : colors.backgroundTertiary },
                isActive && { borderColor: accentColor, borderWidth: 1 },
              ]}
              onPress={() => handleScopePress(index)}
            >
              <ThemedText
                style={[
                  s.scopeChipText,
                  { color: isActive ? accentColor : colors.textSecondary },
                ]}
              >
                {chip}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Search bar */}
      <View style={s.searchContainer}>
        <View
          style={[
            s.searchBar,
            { backgroundColor: colors.backgroundTertiary, borderColor: colors.border },
          ]}
        >
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search\u2026"
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery('')}
              hitSlop={8}
            >
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Tab content */}
      <View style={s.contentContainer}>
        {renderTabContent()}
      </View>

      {/* Bottom Sheets */}
      <EventDetailSheet
        visible={showEventDetail}
        onClose={() => setShowEventDetail(false)}
        event={selectedEvent}
        colors={colors}
        accentColor={accentColor}
      />
      <LogisticsDetailSheet
        visible={showLogisticsDetail}
        onClose={() => setShowLogisticsDetail(false)}
        item={selectedLogistics}
        colors={colors}
        accentColor={accentColor}
      />
      <VenueDetailSheet
        visible={showVenueDetail}
        onClose={() => setShowVenueDetail(false)}
        venue={selectedVenue}
        colors={colors}
        accentColor={accentColor}
      />
      <EquipmentDetailSheet
        visible={showEquipmentDetail}
        onClose={() => setShowEquipmentDetail(false)}
        equipment={selectedEquipment}
        colors={colors}
        accentColor={accentColor}
      />
      <IncidentDetailSheet
        visible={showIncidentDetail}
        onClose={() => setShowIncidentDetail(false)}
        incident={selectedIncident}
        colors={colors}
        accentColor={accentColor}
      />
      <TaskDetailSheet
        visible={showTaskDetail}
        onClose={() => setShowTaskDetail(false)}
        task={selectedTask}
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

  // -- Tab pills --
  tabPillRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Scope chips --
  scopeChipRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  scopeChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  scopeChipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Search --
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    height: 40,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
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
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },

  // -- Badges --
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

  // -- Dashboard: KPI --
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  kpiCard: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    flexGrow: 1,
    flexBasis: '46%',
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kpiDelta: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Dashboard: Quick Actions --
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickActionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    flexBasis: '30%',
    minHeight: 80,
  },
  quickActionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // -- Dashboard: Activity Feed --
  activityCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  activityIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTextCol: {
    flex: 1,
  },
  activityText: {
    fontSize: 13,
    lineHeight: 18,
  },
  activityTime: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Dashboard: Summary --
  summaryCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  summaryLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Events --
  eventCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  eventCardTop: {
    padding: Spacing.md,
  },
  eventCardInfo: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  eventTypeStripe: {
    width: 4,
    borderRadius: 2,
    alignSelf: 'stretch',
  },
  eventCardMid: {
    flex: 1,
  },
  eventCardName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  eventCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  eventCardDetails: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.lg,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventDetailText: {
    fontSize: 12,
  },
  eventCardFooter: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  eventStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  eventStatValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  eventStatLabel: {
    fontSize: 10,
    marginTop: 1,
  },

  // -- Logistics --
  logisticsCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  logisticsCardTop: {
    padding: Spacing.md,
  },
  logisticsCardInfo: {
    flex: 1,
  },
  logisticsName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  logisticsCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  logisticsCardMeta: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  logisticsMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logisticsMetaText: {
    fontSize: 12,
    flex: 1,
  },
  logisticsCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  logisticsEvent: {
    fontSize: 12,
    flex: 1,
    marginRight: Spacing.sm,
  },
  logisticsCost: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Venues --
  venueCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  venueCardTop: {
    padding: Spacing.md,
  },
  venueCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  venueIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueCardMid: {
    flex: 1,
  },
  venueCardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  venueCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  venueCardDetails: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  venueDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  venueDetailValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  venueDetailLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  venueCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: 4,
  },
  venueContactText: {
    fontSize: 12,
  },

  // -- Equipment --
  equipmentCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  equipmentCardTop: {
    padding: Spacing.md,
  },
  equipmentCardInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  equipmentCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  equipmentCardMeta: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  equipmentMetaRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  equipmentMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  equipmentMetaText: {
    fontSize: 12,
  },

  // -- Scheduling --
  scheduleGroup: {
    marginBottom: Spacing.md,
  },
  scheduleDateHeader: {
    marginBottom: Spacing.sm,
  },
  scheduleDateBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  scheduleDateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scheduleBlockCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  scheduleBlockStripe: {
    width: 4,
  },
  scheduleBlockContent: {
    flex: 1,
    padding: Spacing.sm,
  },
  scheduleBlockTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  scheduleBlockTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: Spacing.sm,
  },
  scheduleBlockTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  scheduleBlockTime: {
    fontSize: 12,
  },
  scheduleBlockVenueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  scheduleBlockVenue: {
    fontSize: 11,
  },
  scheduleBlockNotes: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
  },

  // -- Incidents --
  incidentCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    padding: Spacing.md,
  },
  incidentCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  incidentSeverityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  incidentCardInfo: {
    flex: 1,
  },
  incidentType: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  incidentCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  incidentDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: Spacing.sm,
  },
  incidentCardMeta: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: 6,
  },
  incidentMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  incidentMetaText: {
    fontSize: 11,
  },
  incidentAssigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  incidentAssignee: {
    fontSize: 12,
  },

  // -- Tasks --
  taskCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  taskCardTop: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  taskPriorityStripe: {
    width: 4,
    borderRadius: 2,
    alignSelf: 'stretch',
  },
  taskCardInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  taskCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  taskCardMeta: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.lg,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskMetaText: {
    fontSize: 12,
  },
  taskCardBottom: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  taskEvent: {
    fontSize: 11,
  },

  // -- Reports --
  reportCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  reportCardTop: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  reportFormatBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportFormatText: {
    fontSize: 12,
    fontWeight: '800',
  },
  reportCardInfo: {
    flex: 1,
  },
  reportName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  reportType: {
    fontSize: 12,
  },
  reportCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  reportDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportDateText: {
    fontSize: 12,
  },
  reportDownloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  reportDownloadText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Settings --
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },

  // -- Bottom Sheet shared --
  sheetBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  sheetKpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
  },
  sheetKpiItem: {
    alignItems: 'center',
  },
  sheetKpiValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sheetKpiLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  sheetSection: {
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  sheetSectionBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  sheetAmenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  sheetAmenityChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  sheetAmenityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sheetActions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  sheetActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
  },
  sheetActionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  sheetGhostButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sheetGhostButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
