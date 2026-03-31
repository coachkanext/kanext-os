/**
 * Church Organization Facilities — Physical spaces & property management.
 * Sub-tabs: Overview | Facilities | Maintenance | Inspections | Reservations
 * RBAC: C1 (Senior Pastor) full access, C2 (Elder) full, C3 (Staff) full, C4 (Member) limited, C5 hidden.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, TextInput, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import type { ChurchRoleLens } from '@/utils/church-rbac';
import { isSeniorPastor, isElderLevel, isStaffLevel } from '@/utils/church-rbac';
import {
  getChurchFacilitiesData,
  getFacilityById,
  FACILITY_TYPE_LABELS,
  FACILITY_TYPE_ICONS,
  FACILITY_TYPE_COLORS,
  FACILITY_STATUS_COLOR,
  FACILITY_STATUS_LABELS,
  PRIORITY_COLOR,
  MAINTENANCE_STATUS_COLOR,
  MAINTENANCE_STATUS_LABELS,
} from '@/data/mock-church-org-facilities';
import type {
  ChurchFacility,
  MaintenanceRequest,
  UpcomingInspection,
  ReservationPreview,
  FacilityType,
  FacilityStatus,
} from '@/data/mock-church-org-facilities';

// =============================================================================
// CONSTANTS
// =============================================================================


const ACCENT = MODE_ACCENT.church;
const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'inspections', label: 'Inspections' },
  { id: 'reservations', label: 'Reservations' },
];

const FILTER_CHIPS: { id: FacilityType | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'sanctuary', label: 'Sanctuary' },
  { id: 'fellowship_hall', label: 'Hall' },
  { id: 'classroom', label: 'Classroom' },
  { id: 'office', label: 'Office' },
  { id: 'gym', label: 'Gym' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'parking', label: 'Parking' },
  { id: 'outdoor', label: 'Outdoor' },
];

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: ChurchRoleLens;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[parseInt(parts[1], 10) - 1] || parts[1];
  const day = parseInt(parts[2], 10);
  return `${month} ${day}`;
}

function daysUntil(dateStr: string): number {
  const now = new Date('2026-02-18');
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
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
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getChurchFacilitiesData>;
}) {
  const totalSpaces = data.facilities.length;
  const availableCount = data.facilities.filter((f) => f.status === 'available').length;
  const inUseCount = data.facilities.filter((f) => f.status === 'in_use').length;
  const maintenanceCount = data.facilities.filter((f) => f.status === 'maintenance').length;
  const reservedCount = data.facilities.filter((f) => f.status === 'reserved').length;
  const totalCapacity = data.facilities.reduce((sum, f) => sum + f.capacity, 0);
  const openRequests = data.maintenanceRequests.filter((r) => r.status !== 'completed').length;
  const urgentRequests = data.maintenanceRequests.filter((r) => r.priority === 'urgent' || r.priority === 'high').length;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* KPI Row */}
      <View style={s.kpiRow}>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: colors.text }]}>{totalSpaces}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Total Spaces</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: '#5A8A6E' }]}>{availableCount}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Available</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: '#B8943E' }]}>{maintenanceCount}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Maintenance</ThemedText>
        </View>
      </View>

      {/* Capacity Summary */}
      <View style={[s.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.sectionCardHeader}>
          <IconSymbol name="building.2.fill" size={16} color={accentColor} />
          <ThemedText style={[s.sectionCardTitle, { color: colors.text }]}>Campus Capacity</ThemedText>
        </View>
        <ThemedText style={[s.capacityValue, { color: colors.text }]}>
          {totalCapacity.toLocaleString()}
        </ThemedText>
        <ThemedText style={[s.capacityLabel, { color: colors.textSecondary }]}>
          Total capacity across all spaces
        </ThemedText>
        <View style={s.capacityBreakdown}>
          <View style={s.capacityItem}>
            <View style={[s.capacityDot, { backgroundColor: ACCENT }]} />
            <ThemedText style={[s.capacityItemText, { color: colors.textSecondary }]}>
              {inUseCount} In Use
            </ThemedText>
          </View>
          <View style={s.capacityItem}>
            <View style={[s.capacityDot, { backgroundColor: ACCENT }]} />
            <ThemedText style={[s.capacityItemText, { color: colors.textSecondary }]}>
              {reservedCount} Reserved
            </ThemedText>
          </View>
          <View style={s.capacityItem}>
            <View style={[s.capacityDot, { backgroundColor: '#5A8A6E' }]} />
            <ThemedText style={[s.capacityItemText, { color: colors.textSecondary }]}>
              {availableCount} Open
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Urgent Maintenance Alerts */}
      {urgentRequests > 0 && (
        <>
          <ThemedText style={[s.sectionTitle, { color: colors.text }]}>
            Requires Attention
          </ThemedText>
          {data.maintenanceRequests
            .filter((r) => (r.priority === 'urgent' || r.priority === 'high') && r.status !== 'completed')
            .map((req) => (
              <View
                key={req.id}
                style={[s.alertCard, { backgroundColor: '#B85C5C10', borderColor: '#B85C5C30' }]}
              >
                <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#B85C5C" />
                <View style={s.alertTextCol}>
                  <ThemedText style={[s.alertTitle, { color: colors.text }]}>{req.facilityName}</ThemedText>
                  <ThemedText style={[s.alertSubtitle, { color: colors.textSecondary }]} numberOfLines={2}>
                    {req.description}
                  </ThemedText>
                </View>
                <StatusBadge label={req.priority.toUpperCase()} color={PRIORITY_COLOR[req.priority]} />
              </View>
            ))}
        </>
      )}

      {/* Open Maintenance Requests */}
      <View style={[s.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: Spacing.lg }]}>
        <View style={s.sectionCardHeader}>
          <IconSymbol name="wrench.and.screwdriver.fill" size={16} color="#B8943E" />
          <ThemedText style={[s.sectionCardTitle, { color: colors.text }]}>Maintenance Queue</ThemedText>
          <View style={[s.countBadge, { backgroundColor: '#B8943E20' }]}>
            <ThemedText style={[s.countBadgeText, { color: '#B8943E' }]}>{openRequests}</ThemedText>
          </View>
        </View>
        {data.maintenanceRequests
          .filter((r) => r.status !== 'completed')
          .slice(0, 3)
          .map((req, index, arr) => (
            <View
              key={req.id}
              style={[
                s.listRow,
                index < arr.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.priorityDot, { backgroundColor: PRIORITY_COLOR[req.priority] }]} />
              <View style={s.listRowTextCol}>
                <ThemedText style={[s.listRowTitle, { color: colors.text }]} numberOfLines={1}>
                  {req.facilityName}
                </ThemedText>
                <ThemedText style={[s.listRowSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                  {req.description}
                </ThemedText>
              </View>
              <StatusBadge
                label={MAINTENANCE_STATUS_LABELS[req.status]}
                color={MAINTENANCE_STATUS_COLOR[req.status]}
              />
            </View>
          ))}
      </View>

      {/* Upcoming Inspections Preview */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Upcoming Inspections
      </ThemedText>
      {data.inspections.slice(0, 3).map((insp) => {
        const days = daysUntil(insp.scheduledDate);
        const urgencyColor = days <= 7 ? '#B85C5C' : days <= 14 ? '#B8943E' : '#5A8A6E';
        return (
          <View
            key={insp.id}
            style={[s.inspectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[s.inspectionIcon, { backgroundColor: urgencyColor + '18' }]}>
              <IconSymbol name="checkmark.shield.fill" size={18} color={urgencyColor} />
            </View>
            <View style={s.inspectionTextCol}>
              <ThemedText style={[s.inspectionName, { color: colors.text }]}>{insp.facilityName}</ThemedText>
              <ThemedText style={[s.inspectionType, { color: colors.textSecondary }]}>
                {insp.type} — {insp.inspector}
              </ThemedText>
            </View>
            <View style={s.inspectionDate}>
              <ThemedText style={[s.inspectionDateText, { color: urgencyColor }]}>
                {formatDate(insp.scheduledDate)}
              </ThemedText>
              <ThemedText style={[s.inspectionDays, { color: colors.textTertiary }]}>
                {days}d
              </ThemedText>
            </View>
          </View>
        );
      })}

      {/* Reservation Calendar Preview */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Upcoming Reservations
      </ThemedText>
      {data.reservations.slice(0, 3).map((res) => (
        <View
          key={res.id}
          style={[s.reservationCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.reservationDateCol}>
            <ThemedText style={[s.reservationDateDay, { color: accentColor }]}>
              {formatDate(res.date)}
            </ThemedText>
            <ThemedText style={[s.reservationTime, { color: colors.textTertiary }]}>{res.time}</ThemedText>
          </View>
          <View style={s.reservationTextCol}>
            <ThemedText style={[s.reservationEvent, { color: colors.text }]} numberOfLines={1}>
              {res.event}
            </ThemedText>
            <ThemedText style={[s.reservationMeta, { color: colors.textSecondary }]}>
              {res.facilityName} — {res.reservedBy}
            </ThemedText>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// FACILITIES LIST SUB-TAB
// =============================================================================

function FacilitiesListTab({
  colors,
  accentColor,
  facilities,
  filterType,
  searchQuery,
  onFilterChange,
  onSearchChange,
  onSelectFacility,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  facilities: ChurchFacility[];
  filterType: FacilityType | 'all';
  searchQuery: string;
  onFilterChange: (type: FacilityType | 'all') => void;
  onSearchChange: (q: string) => void;
  onSelectFacility: (facility: ChurchFacility) => void;
}) {
  const filtered = useMemo(() => {
    let list = facilities;
    if (filterType !== 'all') {
      list = list.filter((f) => f.type === filterType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          FACILITY_TYPE_LABELS[f.type].toLowerCase().includes(q) ||
          f.campus.toLowerCase().includes(q),
      );
    }
    return list;
  }, [facilities, filterType, searchQuery]);

  const renderItem = useCallback(
    ({ item }: { item: ChurchFacility }) => {
      const typeColor = FACILITY_TYPE_COLORS[item.type];
      const statusColor = FACILITY_STATUS_COLOR[item.status];
      return (
        <Pressable
          style={[s.facilityCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectFacility(item);
          }}
        >
          {/* Top Row */}
          <View style={s.facilityCardTop}>
            <View style={[s.facilityIconCircle, { backgroundColor: typeColor + '18' }]}>
              <IconSymbol name={FACILITY_TYPE_ICONS[item.type] as any} size={18} color={typeColor} />
            </View>
            <View style={s.facilityNameCol}>
              <ThemedText style={[s.facilityName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <View style={s.facilityBadgeRow}>
                <StatusBadge label={FACILITY_TYPE_LABELS[item.type].toUpperCase()} color={typeColor} />
                <StatusBadge label={FACILITY_STATUS_LABELS[item.status].toUpperCase()} color={statusColor} />
              </View>
            </View>
          </View>

          {/* Details Row */}
          <View style={[s.facilityDetails, { borderTopColor: colors.border }]}>
            <View style={s.facilityDetailItem}>
              <ThemedText style={[s.facilityDetailValue, { color: colors.text }]}>{item.capacity}</ThemedText>
              <ThemedText style={[s.facilityDetailLabel, { color: colors.textTertiary }]}>Capacity</ThemedText>
            </View>
            <View style={s.facilityDetailItem}>
              <ThemedText style={[s.facilityDetailValue, { color: colors.text }]}>{item.campus}</ThemedText>
              <ThemedText style={[s.facilityDetailLabel, { color: colors.textTertiary }]}>Campus</ThemedText>
            </View>
            <View style={s.facilityDetailItem}>
              <ThemedText style={[s.facilityDetailValue, { color: colors.text }]}>{item.amenities.length}</ThemedText>
              <ThemedText style={[s.facilityDetailLabel, { color: colors.textTertiary }]}>Amenities</ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, onSelectFacility],
  );

  return (
    <View style={s.flex1}>
      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterChipRow}
      >
        {FILTER_CHIPS.map((chip) => {
          const isActive = chip.id === filterType;
          return (
            <Pressable
              key={chip.id}
              style={[
                s.filterChip,
                {
                  backgroundColor: isActive ? accentColor + '20' : colors.card,
                  borderColor: isActive ? accentColor + '40' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onFilterChange(chip.id);
              }}
            >
              <ThemedText
                style={[s.filterChipText, { color: isActive ? accentColor : colors.textSecondary }]}
              >
                {chip.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Search */}
      <View style={s.searchContainer}>
        <View style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textSecondary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search facilities..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => onSearchChange('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Facility FlatList */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={s.tabListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="building.2.fill" label="No facilities match filter" colors={colors} />
        }
      />
    </View>
  );
}

// =============================================================================
// MAINTENANCE SUB-TAB
// =============================================================================

function MaintenanceTab({
  colors,
  accentColor,
  requests,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  requests: MaintenanceRequest[];
}) {
  const sorted = useMemo(() => {
    const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    const statusOrder: Record<string, number> = { open: 0, in_progress: 1, completed: 2 };
    return [...requests].sort((a, b) => {
      const sDiff = statusOrder[a.status] - statusOrder[b.status];
      if (sDiff !== 0) return sDiff;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [requests]);

  const renderItem = useCallback(
    ({ item }: { item: MaintenanceRequest }) => {
      const pColor = PRIORITY_COLOR[item.priority];
      const sColor = MAINTENANCE_STATUS_COLOR[item.status];
      return (
        <View style={[s.maintenanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Priority bar */}
          <View style={[s.maintenancePriorityBar, { backgroundColor: pColor }]} />
          <View style={s.maintenanceContent}>
            <View style={s.maintenanceHeader}>
              <ThemedText style={[s.maintenanceTitle, { color: colors.text }]} numberOfLines={1}>
                {item.facilityName}
              </ThemedText>
              <StatusBadge label={MAINTENANCE_STATUS_LABELS[item.status].toUpperCase()} color={sColor} />
            </View>
            <ThemedText style={[s.maintenanceDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </ThemedText>
            <View style={s.maintenanceMeta}>
              <View style={s.maintenanceMetaItem}>
                <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.maintenanceMetaText, { color: colors.textTertiary }]}>
                  {item.requestedBy}
                </ThemedText>
              </View>
              <View style={s.maintenanceMetaItem}>
                <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.maintenanceMetaText, { color: colors.textTertiary }]}>
                  {formatDate(item.requestedDate)}
                </ThemedText>
              </View>
              <StatusBadge label={item.priority.toUpperCase()} color={pColor} />
            </View>
          </View>
        </View>
      );
    },
    [colors],
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="wrench.and.screwdriver.fill" label="No maintenance requests" colors={colors} />
      }
    />
  );
}

// =============================================================================
// INSPECTIONS SUB-TAB
// =============================================================================

function InspectionsTab({
  colors,
  accentColor,
  inspections,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  inspections: UpcomingInspection[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Upcoming Inspections</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Sorted by date — nearest first
      </ThemedText>

      {inspections.map((insp) => {
        const days = daysUntil(insp.scheduledDate);
        const urgencyColor = days <= 7 ? '#B85C5C' : days <= 14 ? '#B8943E' : '#5A8A6E';
        return (
          <Pressable
            key={insp.id}
            style={[s.inspectionDetailCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[s.inspectionDetailIcon, { backgroundColor: urgencyColor + '18' }]}>
              <IconSymbol name="checkmark.shield.fill" size={22} color={urgencyColor} />
            </View>
            <View style={s.inspectionDetailTextCol}>
              <ThemedText style={[s.inspectionDetailName, { color: colors.text }]}>
                {insp.facilityName}
              </ThemedText>
              <ThemedText style={[s.inspectionDetailType, { color: colors.textSecondary }]}>
                {insp.type}
              </ThemedText>
              <View style={s.inspectionDetailMeta}>
                <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.inspectionDetailMetaText, { color: colors.textTertiary }]}>
                  {insp.inspector}
                </ThemedText>
              </View>
            </View>
            <View style={s.inspectionDetailRight}>
              <ThemedText style={[s.inspectionDetailDate, { color: urgencyColor }]}>
                {formatDate(insp.scheduledDate)}
              </ThemedText>
              <ThemedText style={[s.inspectionDetailDays, { color: colors.textTertiary }]}>
                {days <= 0 ? 'Today' : `in ${days}d`}
              </ThemedText>
            </View>
          </Pressable>
        );
      })}

      {inspections.length === 0 && (
        <EmptyState icon="checkmark.shield.fill" label="No upcoming inspections" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// RESERVATIONS SUB-TAB
// =============================================================================

function ReservationsTab({
  colors,
  accentColor,
  reservations,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  reservations: ReservationPreview[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Reservation Calendar</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Upcoming room and facility reservations
      </ThemedText>

      {reservations.map((res) => {
        const days = daysUntil(res.date);
        return (
          <Pressable
            key={res.id}
            style={[s.reservationDetailCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            {/* Date column */}
            <View style={[s.reservationDateBlock, { backgroundColor: accentColor + '12' }]}>
              <ThemedText style={[s.reservationBlockDate, { color: accentColor }]}>
                {formatDate(res.date)}
              </ThemedText>
              <ThemedText style={[s.reservationBlockDays, { color: colors.textTertiary }]}>
                {days <= 0 ? 'Today' : `${days}d`}
              </ThemedText>
            </View>

            {/* Details */}
            <View style={s.reservationDetailText}>
              <ThemedText style={[s.reservationDetailEvent, { color: colors.text }]} numberOfLines={1}>
                {res.event}
              </ThemedText>
              <ThemedText style={[s.reservationDetailFacility, { color: colors.textSecondary }]}>
                {res.facilityName}
              </ThemedText>
              <View style={s.reservationDetailMeta}>
                <ThemedText style={[s.reservationDetailTime, { color: colors.textTertiary }]}>
                  {res.time}
                </ThemedText>
                <ThemedText style={[s.reservationDetailBy, { color: colors.textTertiary }]}>
                  {res.reservedBy}
                </ThemedText>
              </View>
            </View>

            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </Pressable>
        );
      })}

      {reservations.length === 0 && (
        <EmptyState icon="calendar" label="No upcoming reservations" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// FACILITY DETAIL BOTTOM SHEET
// =============================================================================

function FacilityDetailSheet({
  visible,
  onClose,
  facility,
  colors,
  accentColor,
  maintenanceRequests,
  reservations,
}: {
  visible: boolean;
  onClose: () => void;
  facility: ChurchFacility | null;
  colors: typeof Colors.light;
  accentColor: string;
  maintenanceRequests: MaintenanceRequest[];
  reservations: ReservationPreview[];
}) {
  if (!facility) return null;

  const typeColor = FACILITY_TYPE_COLORS[facility.type];
  const statusColor = FACILITY_STATUS_COLOR[facility.status];
  const facilityRequests = maintenanceRequests.filter((r) => r.facilityId === facility.id);
  const facilityReservations = reservations.filter((r) => r.facilityId === facility.id);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={facility.name} useModal>
      {/* Status Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={FACILITY_TYPE_LABELS[facility.type].toUpperCase()} color={typeColor} />
        <StatusBadge label={FACILITY_STATUS_LABELS[facility.status].toUpperCase()} color={statusColor} />
      </View>

      {/* Quick Stats */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{facility.capacity}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Capacity</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{facility.campus}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Campus</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatDate(facility.lastInspection)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Last Inspection</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatDate(facility.nextMaintenance)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Next Maintenance</ThemedText>
          </View>
        </View>
      </View>

      {/* Amenities */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Amenities</ThemedText>
        <View style={s.amenitiesGrid}>
          {facility.amenities.map((amenity, i) => (
            <View key={`am-${i}`} style={[s.amenityChip, { backgroundColor: accentColor + '12' }]}>
              <ThemedText style={[s.amenityChipText, { color: accentColor }]}>{amenity}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Maintenance Requests */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Maintenance Requests ({facilityRequests.length})
        </ThemedText>
        {facilityRequests.map((req) => (
          <View key={req.id} style={s.sheetListRow}>
            <View style={[s.priorityDot, { backgroundColor: PRIORITY_COLOR[req.priority] }]} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {req.description}
              </ThemedText>
              <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                {req.priority.toUpperCase()} — {MAINTENANCE_STATUS_LABELS[req.status]}
              </ThemedText>
            </View>
          </View>
        ))}
        {facilityRequests.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No open maintenance requests
          </ThemedText>
        )}
      </View>

      {/* Upcoming Reservations */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Upcoming Reservations ({facilityReservations.length})
        </ThemedText>
        {facilityReservations.map((res) => (
          <View key={res.id} style={s.sheetListRow}>
            <IconSymbol name="calendar" size={14} color={accentColor} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {res.event}
              </ThemedText>
              <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                {formatDate(res.date)} — {res.time}
              </ThemedText>
            </View>
          </View>
        ))}
        {facilityReservations.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No upcoming reservations
          </ThemedText>
        )}
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
          <ThemedText style={s.sheetActionButtonText}>View Full Details</ThemedText>
        </Pressable>
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
// MAIN EXPORT
// =============================================================================

export function ChurchOrgFacilities({ colors, accentColor, role = 'C1' }: Props) {
  // === RBAC Gate: C9-C11 hidden, C5-C8 limited (overview only) ===
  if (role === 'C9' || role === 'C10' || role === 'C11') {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Facilities</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          This section is restricted. Contact church staff for access.
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [selectedFacility, setSelectedFacility] = useState<ChurchFacility | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [filterType, setFilterType] = useState<FacilityType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // === Data ===
  const data = useMemo(() => getChurchFacilitiesData(), []);

  // === Callbacks ===
  const handleSelectFacility = useCallback((facility: ChurchFacility) => {
    setSelectedFacility(facility);
    setSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (isStaffLevel(role)) return SUB_TABS;
    // C4 (Member): overview + facilities only
    return SUB_TABS.filter((t) => t.id === 'overview' || t.id === 'facilities');
  }, [role]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return <OverviewTab colors={colors} accentColor={accentColor} data={data} />;
      case 'facilities':
        return (
          <FacilitiesListTab
            colors={colors}
            accentColor={accentColor}
            facilities={data.facilities}
            filterType={filterType}
            searchQuery={searchQuery}
            onFilterChange={setFilterType}
            onSearchChange={setSearchQuery}
            onSelectFacility={handleSelectFacility}
          />
        );
      case 'maintenance':
        if (!isStaffLevel(role)) return null;
        return (
          <MaintenanceTab
            colors={colors}
            accentColor={accentColor}
            requests={data.maintenanceRequests}
          />
        );
      case 'inspections':
        if (!isStaffLevel(role)) return null;
        return (
          <InspectionsTab
            colors={colors}
            accentColor={accentColor}
            inspections={data.inspections}
          />
        );
      case 'reservations':
        if (!isStaffLevel(role)) return null;
        return (
          <ReservationsTab
            colors={colors}
            accentColor={accentColor}
            reservations={data.reservations}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      {/* Sub-tab bar */}
      <SubTabBar
        tabs={visibleSubTabs}
        activeId={activeSubTab}
        onSelect={setActiveSubTab}
        accentColor={accentColor}
        colors={colors}
      />

      {/* Content */}
      <View style={s.contentContainer}>
        {renderContent()}
      </View>

      {/* Facility Detail Bottom Sheet */}
      <FacilityDetailSheet
        visible={sheetVisible}
        onClose={handleCloseSheet}
        facility={selectedFacility}
        colors={colors}
        accentColor={accentColor}
        maintenanceRequests={data.maintenanceRequests}
        reservations={data.reservations}
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
  flex1: {
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
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: Spacing.md,
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

  // -- KPI Row --
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  kpiCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Section Card --
  sectionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },

  // -- Capacity --
  capacityValue: {
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  capacityLabel: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  capacityBreakdown: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  capacityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  capacityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  capacityItemText: {
    fontSize: 12,
  },

  // -- Alert Card --
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  alertTextCol: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // -- Count Badge --
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- List Row --
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  listRowTextCol: {
    flex: 1,
  },
  listRowTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  listRowSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },

  // -- Inspection Card (overview) --
  inspectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  inspectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inspectionTextCol: {
    flex: 1,
  },
  inspectionName: {
    fontSize: 14,
    fontWeight: '600',
  },
  inspectionType: {
    fontSize: 11,
    marginTop: 2,
  },
  inspectionDate: {
    alignItems: 'flex-end',
  },
  inspectionDateText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inspectionDays: {
    fontSize: 10,
    marginTop: 1,
  },

  // -- Reservation Card (overview) --
  reservationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  reservationDateCol: {
    alignItems: 'center',
    minWidth: 60,
  },
  reservationDateDay: {
    fontSize: 13,
    fontWeight: '700',
  },
  reservationTime: {
    fontSize: 10,
    marginTop: 2,
  },
  reservationTextCol: {
    flex: 1,
  },
  reservationEvent: {
    fontSize: 14,
    fontWeight: '600',
  },
  reservationMeta: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Filter Chips --
  filterChipRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
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

  // -- Facility Card --
  facilityCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  facilityCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  facilityIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facilityNameCol: {
    flex: 1,
  },
  facilityName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  facilityBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  facilityDetails: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  facilityDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  facilityDetailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  facilityDetailLabel: {
    fontSize: 10,
    marginTop: 1,
  },

  // -- Maintenance Card --
  maintenanceCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  maintenancePriorityBar: {
    width: 4,
  },
  maintenanceContent: {
    flex: 1,
    padding: Spacing.md,
  },
  maintenanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  maintenanceTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  maintenanceDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  maintenanceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  maintenanceMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  maintenanceMetaText: {
    fontSize: 11,
  },

  // -- Inspection Detail Card (sub-tab) --
  inspectionDetailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  inspectionDetailIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inspectionDetailTextCol: {
    flex: 1,
  },
  inspectionDetailName: {
    fontSize: 15,
    fontWeight: '600',
  },
  inspectionDetailType: {
    fontSize: 12,
    marginTop: 2,
  },
  inspectionDetailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  inspectionDetailMetaText: {
    fontSize: 11,
  },
  inspectionDetailRight: {
    alignItems: 'flex-end',
  },
  inspectionDetailDate: {
    fontSize: 13,
    fontWeight: '700',
  },
  inspectionDetailDays: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Reservation Detail Card (sub-tab) --
  reservationDetailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  reservationDateBlock: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    minWidth: 56,
  },
  reservationBlockDate: {
    fontSize: 12,
    fontWeight: '700',
  },
  reservationBlockDays: {
    fontSize: 10,
    marginTop: 2,
  },
  reservationDetailText: {
    flex: 1,
  },
  reservationDetailEvent: {
    fontSize: 14,
    fontWeight: '600',
  },
  reservationDetailFacility: {
    fontSize: 12,
    marginTop: 2,
  },
  reservationDetailMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  reservationDetailTime: {
    fontSize: 11,
  },
  reservationDetailBy: {
    fontSize: 11,
  },

  // -- Bottom Sheet --
  sheetBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sheetSection: {
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  sheetDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  sheetDetailItem: {
    width: '45%',
  },
  sheetDetailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  sheetDetailLabel: {
    fontSize: 11,
    marginTop: 1,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  amenityChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  amenityChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sheetListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  sheetListTextCol: {
    flex: 1,
  },
  sheetListTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  sheetListSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  sheetEmptyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  sheetActions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
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
