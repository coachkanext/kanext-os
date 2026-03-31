/**
 * Education Organization Facilities Tab — 6-tab Facilities Hub.
 * Overview, Directory, Availability, Bookings, Maintenance, Accessibility.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, TextInput, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import type { EducationRoleLens } from '@/utils/education-rbac';
import { isPresident, isDeanLevel, isFacultyLevel } from '@/utils/education-rbac';
import {
  EDU_FACILITIES_TABS,
  EDU_FACILITIES_SCOPE_CHIPS,
  FACILITY_STATUS_COLOR,
  FACILITY_STATUS_LABEL,
  FACILITY_TYPE_COLOR,
  FACILITY_TYPE_LABEL,
  BOOKING_STATUS_COLOR,
  MAINTENANCE_PRIORITY_COLOR,
  MAINTENANCE_STATUS_COLOR,
  getEduFacilitiesData,
} from '@/data/mock-edu-org-facilities';
import type {
  EduFacilitiesTabId,
  EduFacility,
  RoomBooking,
  MaintenanceRequest,
  FacilitiesOverview,
} from '@/data/mock-edu-org-facilities';

// =============================================================================
// PROPS
// =============================================================================


const ACCENT = MODE_ACCENT.education;
interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: EducationRoleLens;
}

// =============================================================================
// HELPERS
// =============================================================================

function facilityTypeIcon(type: EduFacility['type']): string {
  switch (type) {
    case 'classroom': return 'book.fill';
    case 'lab': return 'flask.fill';
    case 'library': return 'books.vertical.fill';
    case 'admin': return 'building.2.fill';
    case 'athletic': return 'sportscourt.fill';
    case 'dining': return 'fork.knife';
    case 'residence': return 'house.fill';
    case 'student_center': return 'person.3.fill';
    case 'auditorium': return 'music.mic';
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
// OVERVIEW TAB
// =============================================================================

function OverviewTab({
  colors,
  accentColor,
  overview,
  facilities,
  role,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  overview: FacilitiesOverview;
  facilities: EduFacility[];
  role?: EducationRoleLens;
}) {
  const kpis = [
    { id: 'total', label: 'Total Rooms', value: `${overview.totalRooms}`, icon: 'building.2.fill', color: ACCENT },
    { id: 'available', label: 'Available Now', value: `${overview.availableNow}`, icon: 'checkmark.circle.fill', color: '#5A8A6E' },
    { id: 'booked', label: 'Booked Today', value: `${overview.bookedToday}`, icon: 'calendar', color: '#B8943E' },
    { id: 'maint', label: 'Maintenance', value: `${overview.underMaintenance}`, icon: 'wrench.and.screwdriver.fill', color: '#B85C5C' },
    { id: 'buildings', label: 'Buildings', value: `${overview.totalBuildings}`, icon: 'building.fill', color: ACCENT },
    { id: 'occupancy', label: 'Avg Occupancy', value: `${overview.avgOccupancy}%`, icon: 'chart.bar.fill', color: ACCENT },
  ];

  // Count by type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    facilities.forEach((f) => {
      counts[f.type] = (counts[f.type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      type: type as EduFacility['type'],
      count,
    }));
  }, [facilities]);

  // Count by status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    facilities.forEach((f) => {
      counts[f.status] = (counts[f.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      status: status as EduFacility['status'],
      count,
    }));
  }, [facilities]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* KPI Grid */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Facilities Overview</ThemedText>
      <View style={s.kpiGrid}>
        {kpis.map((kpi) => (
          <View key={kpi.id} style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.kpiHeader}>
              <IconSymbol name={kpi.icon as any} size={18} color={kpi.color} />
              <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>{kpi.label}</ThemedText>
            </View>
            <ThemedText style={[s.kpiValue, { color: colors.text }]}>{kpi.value}</ThemedText>
          </View>
        ))}
      </View>

      {/* Room Types Breakdown */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Rooms by Type
      </ThemedText>
      <View style={[s.breakdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {typeCounts.map((item, index) => (
          <View
            key={item.type}
            style={[
              s.breakdownRow,
              index < typeCounts.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={s.breakdownRowLeft}>
              <View style={[s.typeDot, { backgroundColor: FACILITY_TYPE_COLOR[item.type] }]} />
              <ThemedText style={[s.breakdownLabel, { color: colors.text }]}>
                {FACILITY_TYPE_LABEL[item.type]}
              </ThemedText>
            </View>
            <ThemedText style={[s.breakdownValue, { color: colors.textSecondary }]}>
              {item.count}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Status Breakdown */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Current Status
      </ThemedText>
      <View style={s.statusRow}>
        {statusCounts.map((item) => (
          <View key={item.status} style={[s.statusChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[s.statusDot, { backgroundColor: FACILITY_STATUS_COLOR[item.status] }]} />
            <ThemedText style={[s.statusChipLabel, { color: colors.textSecondary }]}>
              {FACILITY_STATUS_LABEL[item.status]}
            </ThemedText>
            <ThemedText style={[s.statusChipValue, { color: colors.text }]}>{item.count}</ThemedText>
          </View>
        ))}
      </View>

      {/* Accessibility Summary */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Accessibility
      </ThemedText>
      <View style={[s.accessSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.accessSummaryRow}>
          <View style={s.accessSummaryItem}>
            <ThemedText style={[s.accessSummaryValue, { color: '#5A8A6E' }]}>
              {overview.accessibleRooms}
            </ThemedText>
            <ThemedText style={[s.accessSummaryLabel, { color: colors.textTertiary }]}>
              Accessible
            </ThemedText>
          </View>
          <View style={s.accessSummaryItem}>
            <ThemedText style={[s.accessSummaryValue, { color: '#B85C5C' }]}>
              {overview.totalRooms - overview.accessibleRooms}
            </ThemedText>
            <ThemedText style={[s.accessSummaryLabel, { color: colors.textTertiary }]}>
              Non-Accessible
            </ThemedText>
          </View>
          <View style={s.accessSummaryItem}>
            <ThemedText style={[s.accessSummaryValue, { color: accentColor }]}>
              {Math.round((overview.accessibleRooms / overview.totalRooms) * 100)}%
            </ThemedText>
            <ThemedText style={[s.accessSummaryLabel, { color: colors.textTertiary }]}>
              Compliance
            </ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// DIRECTORY TAB
// =============================================================================

function DirectoryTab({
  colors,
  accentColor,
  data,
  onSelectFacility,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: EduFacility[];
  onSelectFacility: (facility: EduFacility) => void;
}) {
  // Group by building
  const grouped = useMemo(() => {
    const buildings: Record<string, EduFacility[]> = {};
    data.forEach((f) => {
      if (!buildings[f.building]) buildings[f.building] = [];
      buildings[f.building].push(f);
    });
    return Object.entries(buildings).map(([building, items]) => ({
      building,
      items: items.sort((a, b) => a.floor - b.floor),
    }));
  }, [data]);

  return (
    <FlatList
      data={grouped}
      keyExtractor={(item) => item.building}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item: group }) => (
        <View style={s.buildingGroup}>
          <View style={s.buildingHeader}>
            <IconSymbol name="building.fill" size={16} color={accentColor} />
            <ThemedText style={[s.buildingName, { color: colors.text }]}>{group.building}</ThemedText>
            <ThemedText style={[s.buildingCount, { color: colors.textTertiary }]}>
              {group.items.length} rooms
            </ThemedText>
          </View>
          {group.items.map((facility) => {
            const stColor = FACILITY_STATUS_COLOR[facility.status];
            const tColor = FACILITY_TYPE_COLOR[facility.type];
            return (
              <Pressable
                key={facility.id}
                style={[s.facilityCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelectFacility(facility);
                }}
              >
                <View style={s.facilityCardTop}>
                  <View style={[s.facilityIconCircle, { backgroundColor: tColor + '18' }]}>
                    <IconSymbol name={facilityTypeIcon(facility.type) as any} size={16} color={tColor} />
                  </View>
                  <View style={s.facilityCardInfo}>
                    <ThemedText style={[s.facilityName, { color: colors.text }]} numberOfLines={1}>
                      {facility.name}
                    </ThemedText>
                    <View style={s.facilityCardBadgeRow}>
                      <StatusBadge label={FACILITY_TYPE_LABEL[facility.type]} color={tColor} />
                      <StatusBadge label={FACILITY_STATUS_LABEL[facility.status]} color={stColor} />
                    </View>
                  </View>
                </View>
                <View style={[s.facilityCardMeta, { borderTopColor: colors.border }]}>
                  <View style={s.facilityMetaItem}>
                    <IconSymbol name="person.2.fill" size={12} color={colors.textTertiary} />
                    <ThemedText style={[s.facilityMetaText, { color: colors.textSecondary }]}>
                      Cap: {facility.capacity}
                    </ThemedText>
                  </View>
                  <View style={s.facilityMetaItem}>
                    <IconSymbol name="arrow.up" size={12} color={colors.textTertiary} />
                    <ThemedText style={[s.facilityMetaText, { color: colors.textSecondary }]}>
                      Floor {facility.floor}
                    </ThemedText>
                  </View>
                  {facility.accessibility && (
                    <View style={s.facilityMetaItem}>
                      <IconSymbol name="figure.roll" size={12} color="#5A8A6E" />
                      <ThemedText style={[s.facilityMetaText, { color: '#5A8A6E' }]}>
                        ADA
                      </ThemedText>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
      ListEmptyComponent={
        <EmptyState icon="building.2.fill" label="No facilities found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// AVAILABILITY TAB
// =============================================================================

function AvailabilityTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: EduFacility[];
}) {
  // Group by status
  const grouped = useMemo(() => {
    const statusOrder: EduFacility['status'][] = ['available', 'in_use', 'reserved', 'maintenance'];
    return statusOrder.map((status) => ({
      status,
      items: data.filter((f) => f.status === status),
    })).filter((g) => g.items.length > 0);
  }, [data]);

  return (
    <FlatList
      data={grouped}
      keyExtractor={(item) => item.status}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item: group }) => {
        const grpColor = FACILITY_STATUS_COLOR[group.status];
        return (
          <View style={s.availabilityGroup}>
            <View style={s.availabilityGroupHeader}>
              <View style={[s.availabilityGroupDot, { backgroundColor: grpColor }]} />
              <ThemedText style={[s.availabilityGroupTitle, { color: colors.text }]}>
                {FACILITY_STATUS_LABEL[group.status]}
              </ThemedText>
              <ThemedText style={[s.availabilityGroupCount, { color: colors.textTertiary }]}>
                {group.items.length}
              </ThemedText>
            </View>
            {group.items.map((facility) => (
              <View
                key={facility.id}
                style={[s.availabilityCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={s.availabilityCardTop}>
                  <ThemedText style={[s.availabilityRoomName, { color: colors.text }]} numberOfLines={1}>
                    {facility.name}
                  </ThemedText>
                  <StatusBadge label={`CAP ${facility.capacity}`} color={colors.textTertiary} />
                </View>
                <ThemedText style={[s.availabilityBuilding, { color: colors.textTertiary }]}>
                  {facility.building} \u2014 Floor {facility.floor}
                </ThemedText>
              </View>
            ))}
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="clock.fill" label="No availability data" colors={colors} />
      }
    />
  );
}

// =============================================================================
// BOOKINGS TAB
// =============================================================================

function BookingsTab({
  colors,
  accentColor,
  data,
  facilities,
  role,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: RoomBooking[];
  facilities: EduFacility[];
  role?: EducationRoleLens;
}) {
  const facilityMap = useMemo(() => {
    const map: Record<string, EduFacility> = {};
    facilities.forEach((f) => { map[f.id] = f; });
    return map;
  }, [facilities]);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = BOOKING_STATUS_COLOR[item.status];
        const facility = facilityMap[item.facilityId];
        return (
          <View style={[s.bookingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.bookingCardTop}>
              <View style={s.bookingCardInfo}>
                <ThemedText style={[s.bookingPurpose, { color: colors.text }]} numberOfLines={2}>
                  {item.purpose}
                </ThemedText>
                <ThemedText style={[s.bookingBookedBy, { color: colors.textSecondary }]}>
                  {item.bookedBy} \u2014 {item.department}
                </ThemedText>
              </View>
              <StatusBadge label={item.status.toUpperCase()} color={stColor} />
            </View>
            <View style={[s.bookingCardMeta, { borderTopColor: colors.border }]}>
              <View style={s.bookingMetaItem}>
                <IconSymbol name="mappin.and.ellipse" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.bookingMetaText, { color: colors.textSecondary }]}>
                  {facility?.name ?? 'Unknown'}
                </ThemedText>
              </View>
              <View style={s.bookingMetaItem}>
                <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.bookingMetaText, { color: colors.textSecondary }]}>
                  {item.date}
                </ThemedText>
              </View>
              <View style={s.bookingMetaItem}>
                <IconSymbol name="clock.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.bookingMetaText, { color: colors.textTertiary }]}>
                  {item.startTime} \u2013 {item.endTime}
                </ThemedText>
              </View>
            </View>

            {/* Action row — only admin+ can manage bookings */}
            {role && isDeanLevel(role) && (
              <View style={s.bookingActionRow}>
                <Pressable
                  style={[s.bookingActionBtn, { borderColor: colors.border }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <ThemedText style={[s.bookingActionBtnText, { color: accentColor }]}>
                    Manage
                  </ThemedText>
                </Pressable>
              </View>
            )}
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="calendar" label="No bookings found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// MAINTENANCE TAB
// =============================================================================

function MaintenanceTab({
  colors,
  accentColor,
  data,
  role,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: MaintenanceRequest[];
  role?: EducationRoleLens;
}) {
  // Group by status
  const grouped = useMemo(() => {
    const statusOrder: MaintenanceRequest['status'][] = ['open', 'in_progress', 'resolved'];
    return statusOrder.map((status) => ({
      status,
      items: data.filter((mr) => mr.status === status),
    })).filter((g) => g.items.length > 0);
  }, [data]);

  const statusLabels: Record<MaintenanceRequest['status'], string> = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
  };

  return (
    <FlatList
      data={grouped}
      keyExtractor={(item) => item.status}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        role && isFacultyLevel(role) ? (
          <Pressable
            style={[s.addButton, { backgroundColor: accentColor }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <IconSymbol name="plus.circle.fill" size={16} color="#000" />
            <ThemedText style={s.addButtonText}>Report Issue</ThemedText>
          </Pressable>
        ) : null
      }
      renderItem={({ item: group }) => {
        const grpColor = MAINTENANCE_STATUS_COLOR[group.status];
        return (
          <View style={s.maintenanceGroup}>
            <View style={s.maintenanceGroupHeader}>
              <View style={[s.maintenanceGroupDot, { backgroundColor: grpColor }]} />
              <ThemedText style={[s.maintenanceGroupTitle, { color: colors.text }]}>
                {statusLabels[group.status]}
              </ThemedText>
              <ThemedText style={[s.maintenanceGroupCount, { color: colors.textTertiary }]}>
                {group.items.length}
              </ThemedText>
            </View>
            {group.items.map((req) => {
              const priColor = MAINTENANCE_PRIORITY_COLOR[req.priority];
              return (
                <View
                  key={req.id}
                  style={[s.maintenanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={s.maintenanceCardTop}>
                    <ThemedText style={[s.maintenanceIssue, { color: colors.text }]} numberOfLines={2}>
                      {req.issue}
                    </ThemedText>
                    <StatusBadge label={req.priority.toUpperCase()} color={priColor} />
                  </View>
                  <View style={s.maintenanceCardMeta}>
                    <View style={s.maintenanceMetaItem}>
                      <IconSymbol name="mappin.and.ellipse" size={12} color={colors.textTertiary} />
                      <ThemedText style={[s.maintenanceMetaText, { color: colors.textSecondary }]}>
                        {req.facilityName}
                      </ThemedText>
                    </View>
                    <View style={s.maintenanceMetaItem}>
                      <IconSymbol name="person.fill" size={12} color={colors.textTertiary} />
                      <ThemedText style={[s.maintenanceMetaText, { color: colors.textTertiary }]}>
                        {req.reportedBy}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={s.maintenanceCardFooter}>
                    <ThemedText style={[s.maintenanceDate, { color: colors.textTertiary }]}>
                      Reported: {req.reportedDate}
                    </ThemedText>
                    <ThemedText style={[s.maintenanceDate, { color: colors.textTertiary }]}>
                      ETA: {req.estimatedCompletion}
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="wrench.and.screwdriver.fill" label="No maintenance requests" colors={colors} />
      }
    />
  );
}

// =============================================================================
// ACCESSIBILITY TAB
// =============================================================================

function AccessibilityTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: EduFacility[];
}) {
  const accessible = useMemo(() => data.filter((f) => f.accessibility), [data]);
  const nonAccessible = useMemo(() => data.filter((f) => !f.accessibility), [data]);
  const complianceRate = data.length > 0 ? Math.round((accessible.length / data.length) * 100) : 0;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Compliance Summary */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>ADA Compliance</ThemedText>
      <View style={[s.complianceSummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.complianceRow}>
          <View style={s.complianceItem}>
            <ThemedText style={[s.complianceValue, { color: '#5A8A6E' }]}>
              {accessible.length}
            </ThemedText>
            <ThemedText style={[s.complianceLabel, { color: colors.textTertiary }]}>
              Compliant
            </ThemedText>
          </View>
          <View style={s.complianceItem}>
            <ThemedText style={[s.complianceValue, { color: '#B85C5C' }]}>
              {nonAccessible.length}
            </ThemedText>
            <ThemedText style={[s.complianceLabel, { color: colors.textTertiary }]}>
              Non-Compliant
            </ThemedText>
          </View>
          <View style={s.complianceItem}>
            <ThemedText style={[s.complianceValue, { color: accentColor }]}>
              {complianceRate}%
            </ThemedText>
            <ThemedText style={[s.complianceLabel, { color: colors.textTertiary }]}>
              Overall
            </ThemedText>
          </View>
        </View>

        {/* Progress bar */}
        <View style={s.complianceBar}>
          <View
            style={[
              s.complianceBarFill,
              { backgroundColor: '#5A8A6E', width: `${complianceRate}%` },
            ]}
          />
        </View>
      </View>

      {/* Non-Accessible Facilities */}
      {nonAccessible.length > 0 && (
        <>
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            Non-Accessible Facilities
          </ThemedText>
          {nonAccessible.map((facility) => {
            const tColor = FACILITY_TYPE_COLOR[facility.type];
            return (
              <View
                key={facility.id}
                style={[s.accessCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={s.accessCardTop}>
                  <View style={[s.accessIconCircle, { backgroundColor: '#B85C5C' + '18' }]}>
                    <IconSymbol name="xmark.circle.fill" size={16} color="#B85C5C" />
                  </View>
                  <View style={s.accessCardInfo}>
                    <ThemedText style={[s.accessRoomName, { color: colors.text }]} numberOfLines={1}>
                      {facility.name}
                    </ThemedText>
                    <ThemedText style={[s.accessBuilding, { color: colors.textTertiary }]}>
                      {facility.building} \u2014 Floor {facility.floor}
                    </ThemedText>
                  </View>
                  <StatusBadge label={FACILITY_TYPE_LABEL[facility.type]} color={tColor} />
                </View>
              </View>
            );
          })}
        </>
      )}

      {/* Accessible Facilities Summary */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Accessible Facilities ({accessible.length})
      </ThemedText>
      {accessible.map((facility) => {
        const tColor = FACILITY_TYPE_COLOR[facility.type];
        return (
          <View
            key={facility.id}
            style={[s.accessCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.accessCardTop}>
              <View style={[s.accessIconCircle, { backgroundColor: '#5A8A6E' + '18' }]}>
                <IconSymbol name="checkmark.circle.fill" size={16} color="#5A8A6E" />
              </View>
              <View style={s.accessCardInfo}>
                <ThemedText style={[s.accessRoomName, { color: colors.text }]} numberOfLines={1}>
                  {facility.name}
                </ThemedText>
                <ThemedText style={[s.accessBuilding, { color: colors.textTertiary }]}>
                  {facility.building} \u2014 Floor {facility.floor}
                </ThemedText>
              </View>
              <StatusBadge label={FACILITY_TYPE_LABEL[facility.type]} color={tColor} />
            </View>
          </View>
        );
      })}
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
}: {
  visible: boolean;
  onClose: () => void;
  facility: EduFacility | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!facility) return null;

  const stColor = FACILITY_STATUS_COLOR[facility.status];
  const tColor = FACILITY_TYPE_COLOR[facility.type];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={facility.name} useModal>
      {/* Type + Status */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={FACILITY_TYPE_LABEL[facility.type]} color={tColor} />
        <StatusBadge label={FACILITY_STATUS_LABEL[facility.status]} color={stColor} />
        {facility.accessibility && <StatusBadge label="ADA" color="#5A8A6E" />}
      </View>

      {/* KPIs */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{facility.capacity}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Capacity</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>Floor {facility.floor}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Level</ThemedText>
        </View>
      </View>

      {/* Building */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Building</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {facility.building}
        </ThemedText>
      </View>

      {/* Equipment */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Equipment</ThemedText>
        {facility.equipment.map((item, idx) => (
          <View key={idx} style={s.equipmentRow}>
            <IconSymbol name="checkmark.circle.fill" size={14} color={accentColor} />
            <ThemedText style={[s.equipmentText, { color: colors.textSecondary }]}>{item}</ThemedText>
          </View>
        ))}
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
          <ThemedText style={s.sheetActionButtonText}>Book This Room</ThemedText>
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

export function EduOrgFacilities({ colors, accentColor, role }: Props) {
  // === State ===
  const [activeTab, setActiveTab] = useState<EduFacilitiesTabId>('overview');
  const [activeScope, setActiveScope] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<EduFacility | null>(null);
  const [showFacilityDetail, setShowFacilityDetail] = useState(false);

  // === Data ===
  const scopeLabel = EDU_FACILITIES_SCOPE_CHIPS[activeScope] ?? 'All Buildings';
  const data = useMemo(() => getEduFacilitiesData(scopeLabel), [scopeLabel]);

  // === Filtered data ===
  const filteredFacilities = useMemo(() => {
    let result = data.facilities;
    // Apply scope filter
    if (activeScope === 1) result = result.filter((f) => f.type === 'classroom');
    else if (activeScope === 2) result = result.filter((f) => f.type === 'lab');
    else if (activeScope === 3) result = result.filter((f) => f.type === 'athletic');
    else if (activeScope === 4) result = result.filter((f) => f.type === 'admin');
    else if (activeScope === 5) result = result.filter((f) => f.type === 'residence');

    if (!searchQuery.trim()) return result;
    const q = searchQuery.toLowerCase();
    return result.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.building.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q),
    );
  }, [data.facilities, searchQuery, activeScope]);

  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return data.bookings;
    const q = searchQuery.toLowerCase();
    return data.bookings.filter(
      (b) =>
        b.purpose.toLowerCase().includes(q) ||
        b.bookedBy.toLowerCase().includes(q) ||
        b.department.toLowerCase().includes(q),
    );
  }, [data.bookings, searchQuery]);

  const filteredMaintenance = useMemo(() => {
    if (!searchQuery.trim()) return data.maintenanceRequests;
    const q = searchQuery.toLowerCase();
    return data.maintenanceRequests.filter(
      (m) =>
        m.issue.toLowerCase().includes(q) ||
        m.facilityName.toLowerCase().includes(q) ||
        m.reportedBy.toLowerCase().includes(q),
    );
  }, [data.maintenanceRequests, searchQuery]);

  // === Callbacks ===
  const handleTabPress = useCallback((tabId: EduFacilitiesTabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  }, []);

  const handleScopePress = useCallback((index: number) => {
    Haptics.selectionAsync();
    setActiveScope(index);
  }, []);

  const handleSelectFacility = useCallback((facility: EduFacility) => {
    setSelectedFacility(facility);
    setShowFacilityDetail(true);
  }, []);

  // === Tab content renderer ===
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            colors={colors}
            accentColor={accentColor}
            overview={data.overview}
            facilities={filteredFacilities}
            role={role}
          />
        );
      case 'directory':
        return (
          <DirectoryTab
            colors={colors}
            accentColor={accentColor}
            data={filteredFacilities}
            onSelectFacility={handleSelectFacility}
          />
        );
      case 'availability':
        return (
          <AvailabilityTab
            colors={colors}
            accentColor={accentColor}
            data={filteredFacilities}
          />
        );
      case 'bookings':
        return (
          <BookingsTab
            colors={colors}
            accentColor={accentColor}
            data={filteredBookings}
            facilities={data.facilities}
            role={role}
          />
        );
      case 'maintenance':
        return (
          <MaintenanceTab
            colors={colors}
            accentColor={accentColor}
            data={filteredMaintenance}
            role={role}
          />
        );
      case 'accessibility':
        return (
          <AccessibilityTab
            colors={colors}
            accentColor={accentColor}
            data={filteredFacilities}
          />
        );
      default:
        return null;
    }
  };

  // === Visible tabs — hide maintenance from students/public ===
  const visibleTabs = useMemo(() => {
    if (role && !isFacultyLevel(role)) {
      return EDU_FACILITIES_TABS.filter((t) => t.id !== 'maintenance');
    }
    return EDU_FACILITIES_TABS;
  }, [role]);

  // === Render ===
  return (
    <View style={s.container}>
      {/* Sub-tab pill bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tabPillRow}
      >
        {visibleTabs.map((tab) => {
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
        {EDU_FACILITIES_SCOPE_CHIPS.map((chip, index) => {
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
            placeholder="Search facilities\u2026"
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Tab content */}
      <View style={s.contentContainer}>
        {renderTabContent()}
      </View>

      {/* Bottom Sheet */}
      <FacilityDetailSheet
        visible={showFacilityDetail}
        onClose={() => setShowFacilityDetail(false)}
        facility={selectedFacility}
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

  // -- Overview: KPI --
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  kpiCard: {
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

  // -- Overview: Breakdown --
  breakdownCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  breakdownRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Overview: Status row --
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusChipLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusChipValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Overview: Accessibility Summary --
  accessSummaryCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  accessSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  accessSummaryItem: {
    alignItems: 'center',
  },
  accessSummaryValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  accessSummaryLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Directory: Building groups --
  buildingGroup: {
    marginBottom: Spacing.lg,
  },
  buildingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  buildingName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  buildingCount: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Directory: Facility cards --
  facilityCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  facilityCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  facilityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facilityCardInfo: {
    flex: 1,
  },
  facilityName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  facilityCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  facilityCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  facilityMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  facilityMetaText: {
    fontSize: 12,
  },

  // -- Availability groups --
  availabilityGroup: {
    marginBottom: Spacing.lg,
  },
  availabilityGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  availabilityGroupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  availabilityGroupTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  availabilityGroupCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  availabilityCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  availabilityCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  availabilityRoomName: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  availabilityBuilding: {
    fontSize: 12,
  },

  // -- Bookings --
  bookingCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  bookingCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  bookingCardInfo: {
    flex: 1,
  },
  bookingPurpose: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  bookingBookedBy: {
    fontSize: 12,
  },
  bookingCardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bookingMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookingMetaText: {
    fontSize: 12,
  },
  bookingActionRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    alignItems: 'flex-start',
  },
  bookingActionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  bookingActionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Maintenance --
  maintenanceGroup: {
    marginBottom: Spacing.lg,
  },
  maintenanceGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  maintenanceGroupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  maintenanceGroupTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  maintenanceGroupCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  maintenanceCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  maintenanceCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: 6,
  },
  maintenanceIssue: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  maintenanceCardMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  maintenanceMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  maintenanceMetaText: {
    fontSize: 12,
  },
  maintenanceCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maintenanceDate: {
    fontSize: 11,
  },

  // -- Add button --
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },

  // -- Accessibility --
  complianceSummary: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  complianceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  complianceItem: {
    alignItems: 'center',
  },
  complianceValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  complianceLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  complianceBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9C9790',
    overflow: 'hidden',
  },
  complianceBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  accessCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  accessCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  accessIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessCardInfo: {
    flex: 1,
  },
  accessRoomName: {
    fontSize: 13,
    fontWeight: '600',
  },
  accessBuilding: {
    fontSize: 12,
    marginTop: 1,
  },

  // -- Bottom Sheet shared --
  sheetBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
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
    fontSize: 20,
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
  equipmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 3,
  },
  equipmentText: {
    fontSize: 13,
    flex: 1,
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
