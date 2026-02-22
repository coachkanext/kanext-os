/**
 * Church Organization Rooms (Physical) — Room directory, scheduling, access,
 * maintenance, and policies for physical campus spaces.
 * Sub-tabs: Directory | Schedule | Access | Maintenance | Policies
 * RBAC: C1 (Senior Pastor) full access, C2 (Elder) full, C3 (Staff) directory+schedule+maintenance,
 *        C4 (Member) locked, C5 (Visitor) locked.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import type { ChurchRoleLens } from '@/utils/church-rbac';
import { isStaffLevel, isElderLevel } from '@/utils/church-rbac';
import {
  getChurchRoomsData,
  ROOM_STATUS_LABELS,
  ROOM_STATUS_COLORS,
  BOOKING_STATUS_COLORS,
  SEVERITY_COLORS,
  TICKET_STATUS_LABELS,
  TICKET_STATUS_COLORS,
} from '@/data/mock-church-org-rooms';
import type {
  PhysicalRoom,
  RoomBooking,
  RoomAccessEntry,
  MaintenanceTicket,
  RoomPolicy,
} from '@/data/mock-church-org-rooms';

// =============================================================================
// CONSTANTS
// =============================================================================


const ACCENT = MODE_ACCENT.church;
const SUB_TABS = [
  { id: 'directory', label: 'Directory' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'access', label: 'Access' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'policies', label: 'Policies' },
];

const DAY_LABELS = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_DATES = ['2026-02-18', '2026-02-19', '2026-02-20', '2026-02-21', '2026-02-22'];
const DAY_FULL_LABELS = [
  'Wednesday, Feb 18',
  'Thursday, Feb 19',
  'Friday, Feb 20',
  'Saturday, Feb 21',
  'Sunday, Feb 22',
];

const READINESS_ITEMS: { key: keyof PhysicalRoom['readiness']; icon: string; label: string }[] = [
  { key: 'av', icon: 'speaker.wave.3.fill', label: 'AV' },
  { key: 'livestream', icon: 'video.fill', label: 'Livestream' },
  { key: 'clean', icon: 'sparkles', label: 'Clean' },
  { key: 'security', icon: 'shield.checkered', label: 'Security' },
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
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const month = months[parseInt(parts[1], 10) - 1] || parts[1];
  const day = parseInt(parts[2], 10);
  return `${month} ${day}`;
}

function formatBookingDateTime(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = days[d.getDay()];
  const month = months[d.getMonth()];
  const date = d.getDate();
  let hours = d.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const mins = d.getMinutes();
  const minsStr = mins > 0 ? `:${mins.toString().padStart(2, '0')}` : '';
  return `${dayName} ${month} ${date} ${hours}${minsStr} ${ampm}`;
}

function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural ?? singular + 's'}`;
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState({
  icon,
  label,
  colors,
}: {
  icon: string;
  label: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={s.emptyContainer}>
      <IconSymbol name={icon as any} size={40} color={colors.textTertiary} />
      <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>
        {label}
      </ThemedText>
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
// LOCKED STATE
// =============================================================================

function LockedState({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={s.lockedContainer}>
      <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
      <ThemedText style={[s.lockedTitle, { color: colors.text }]}>
        Rooms
      </ThemedText>
      <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
        Room management is restricted to church staff. Contact your administrator for access.
      </ThemedText>
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
      style={{ flexGrow: 0 }}
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
// READINESS STRIP — inline row of 4 tiny icons showing AV/Livestream/Clean/Security
// =============================================================================

function ReadinessStrip({
  readiness,
  colors,
}: {
  readiness: PhysicalRoom['readiness'];
  colors: typeof Colors.light;
}) {
  return (
    <View style={s.readinessStrip}>
      {READINESS_ITEMS.map((item) => {
        const active = readiness[item.key];
        return (
          <IconSymbol
            key={item.key}
            name={item.icon as any}
            size={14}
            color={active ? '#22C55E' : colors.textTertiary}
            style={active ? s.readinessIconActive : s.readinessIconInactive}
          />
        );
      })}
    </View>
  );
}

// =============================================================================
// DIRECTORY SUB-TAB
// =============================================================================

function DirectoryTab({
  colors,
  accentColor,
  rooms,
  bookings,
  onSelectRoom,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  rooms: PhysicalRoom[];
  bookings: RoomBooking[];
  onSelectRoom: (room: PhysicalRoom) => void;
}) {
  // Summary stats
  const availableCount = useMemo(
    () => rooms.filter((r) => r.status === 'available').length,
    [rooms],
  );
  const inUseCount = useMemo(
    () => rooms.filter((r) => r.status === 'in_use').length,
    [rooms],
  );
  const reservedCount = useMemo(
    () => rooms.filter((r) => r.status === 'reserved').length,
    [rooms],
  );
  const offlineCount = useMemo(
    () => rooms.filter((r) => r.status === 'offline').length,
    [rooms],
  );
  const totalCapacity = useMemo(
    () => rooms.reduce((sum, r) => sum + r.capacity, 0),
    [rooms],
  );
  const todaysBookings = useMemo(
    () => bookings.filter((b) => b.date === '2026-02-18').length,
    [bookings],
  );

  const renderHeader = useCallback(
    () => (
      <View style={s.directorySummary}>
        {/* KPI Row */}
        <View style={s.directoryKpiRow}>
          <View style={[s.directoryKpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[s.directoryKpiValue, { color: colors.text }]}>
              {rooms.length}
            </ThemedText>
            <ThemedText style={[s.directoryKpiLabel, { color: colors.textSecondary }]}>
              Total Rooms
            </ThemedText>
          </View>
          <View style={[s.directoryKpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[s.directoryKpiValue, { color: '#22C55E' }]}>
              {availableCount}
            </ThemedText>
            <ThemedText style={[s.directoryKpiLabel, { color: colors.textSecondary }]}>
              Available
            </ThemedText>
          </View>
          <View style={[s.directoryKpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[s.directoryKpiValue, { color: ACCENT }]}>
              {inUseCount}
            </ThemedText>
            <ThemedText style={[s.directoryKpiLabel, { color: colors.textSecondary }]}>
              In Use
            </ThemedText>
          </View>
        </View>

        {/* Secondary Stats */}
        <View style={s.directorySecondaryRow}>
          <View style={[s.directorySecondaryItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <IconSymbol name="person.3.fill" size={14} color={accentColor} />
            <ThemedText style={[s.directorySecondaryText, { color: colors.text }]}>
              {totalCapacity.toLocaleString()} total capacity
            </ThemedText>
          </View>
          <View style={[s.directorySecondaryItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <IconSymbol name="calendar" size={14} color={accentColor} />
            <ThemedText style={[s.directorySecondaryText, { color: colors.text }]}>
              {pluralize(todaysBookings, 'booking')} today
            </ThemedText>
          </View>
        </View>

        {/* Status Legend */}
        <View style={s.directoryLegend}>
          <View style={s.directoryLegendItem}>
            <View style={[s.directoryLegendDot, { backgroundColor: '#22C55E' }]} />
            <ThemedText style={[s.directoryLegendText, { color: colors.textTertiary }]}>
              Available ({availableCount})
            </ThemedText>
          </View>
          <View style={s.directoryLegendItem}>
            <View style={[s.directoryLegendDot, { backgroundColor: ACCENT }]} />
            <ThemedText style={[s.directoryLegendText, { color: colors.textTertiary }]}>
              In Use ({inUseCount})
            </ThemedText>
          </View>
          <View style={s.directoryLegendItem}>
            <View style={[s.directoryLegendDot, { backgroundColor: ACCENT }]} />
            <ThemedText style={[s.directoryLegendText, { color: colors.textTertiary }]}>
              Reserved ({reservedCount})
            </ThemedText>
          </View>
          {offlineCount > 0 && (
            <View style={s.directoryLegendItem}>
              <View style={[s.directoryLegendDot, { backgroundColor: '#EF4444' }]} />
              <ThemedText style={[s.directoryLegendText, { color: colors.textTertiary }]}>
                Offline ({offlineCount})
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    ),
    [rooms, availableCount, inUseCount, reservedCount, offlineCount, totalCapacity, todaysBookings, colors, accentColor],
  );

  const renderItem = useCallback(
    ({ item }: { item: PhysicalRoom }) => {
      const statusColor = ROOM_STATUS_COLORS[item.status];
      const statusLabel = ROOM_STATUS_LABELS[item.status];
      const nextBookingText = item.nextBooking
        ? `Next: ${formatBookingDateTime(item.nextBooking)}`
        : 'No upcoming bookings';

      return (
        <Pressable
          style={[s.roomCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectRoom(item);
          }}
        >
          {/* Top Row: Name + Capacity */}
          <View style={s.roomCardTop}>
            <View style={s.roomNameCol}>
              <ThemedText style={[s.roomName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
            </View>
            <View style={[s.roomCapBadge, { backgroundColor: accentColor + '15' }]}>
              <ThemedText style={[s.roomCapText, { color: accentColor }]}>
                Cap: {item.capacity}
              </ThemedText>
            </View>
          </View>

          {/* Status Row: Status badge + Readiness strip */}
          <View style={s.roomStatusRow}>
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
            <ReadinessStrip readiness={item.readiness} colors={colors} />
          </View>

          {/* Next Booking Line */}
          <View style={s.roomNextBookingRow}>
            <IconSymbol
              name="calendar"
              size={12}
              color={item.nextBooking ? colors.textSecondary : colors.textTertiary}
            />
            <ThemedText
              style={[
                s.roomNextBooking,
                { color: item.nextBooking ? colors.textSecondary : colors.textTertiary },
              ]}
              numberOfLines={1}
            >
              {nextBookingText}
            </ThemedText>
          </View>

          {/* Floor + Building Info */}
          <View style={[s.roomLocationRow, { borderTopColor: colors.border }]}>
            <IconSymbol name="building.2.fill" size={11} color={colors.textTertiary} />
            <ThemedText style={[s.roomLocation, { color: colors.textTertiary }]}>
              {item.floor} Floor — {item.building}
            </ThemedText>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectRoom],
  );

  return (
    <FlatList
      data={rooms}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState
          icon="door.left.hand.open"
          label="No rooms found"
          colors={colors}
        />
      }
    />
  );
}

// =============================================================================
// SCHEDULE SUB-TAB
// =============================================================================

function ScheduleTab({
  colors,
  accentColor,
  bookings,
  rooms,
  selectedDay,
  onSelectDay,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  bookings: RoomBooking[];
  rooms: PhysicalRoom[];
  selectedDay: number;
  onSelectDay: (day: number) => void;
}) {
  // Filter bookings for selected day
  const selectedDate = DAY_DATES[selectedDay];

  const dayBookings = useMemo(
    () => bookings.filter((b) => b.date === selectedDate),
    [bookings, selectedDate],
  );

  // Count bookings per day for indicator dots
  const bookingCountsByDay = useMemo(() => {
    return DAY_DATES.map((date) => bookings.filter((b) => b.date === date).length);
  }, [bookings]);

  // Group by room
  const grouped = useMemo(() => {
    const map = new Map<string, { roomId: string; roomName: string; bookings: RoomBooking[] }>();

    for (const booking of dayBookings) {
      if (!map.has(booking.roomId)) {
        map.set(booking.roomId, {
          roomId: booking.roomId,
          roomName: booking.roomName,
          bookings: [],
        });
      }
      map.get(booking.roomId)!.bookings.push(booking);
    }

    // Sort bookings within each room by start time
    for (const group of map.values()) {
      group.bookings.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    return Array.from(map.values());
  }, [dayBookings]);

  // Conflict count
  const conflictCount = useMemo(
    () => dayBookings.filter((b) => b.hasConflict).length,
    [dayBookings],
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Day Selector */}
      <View style={s.dayRow}>
        {DAY_LABELS.map((label, index) => {
          const isActive = index === selectedDay;
          const count = bookingCountsByDay[index];
          return (
            <Pressable
              key={label}
              style={[
                s.dayPill,
                isActive && [s.dayPillActive, { backgroundColor: accentColor }],
                !isActive && {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelectDay(index);
              }}
            >
              <ThemedText
                style={[
                  s.dayPillText,
                  isActive ? s.dayPillTextActive : { color: colors.textSecondary },
                ]}
              >
                {label}
              </ThemedText>
              {count > 0 && (
                <View
                  style={[
                    s.dayPillDot,
                    {
                      backgroundColor: isActive ? '#000' : accentColor,
                    },
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Day Header */}
      <View style={s.scheduleDayHeader}>
        <ThemedText style={[s.scheduleDayTitle, { color: colors.text }]}>
          {DAY_FULL_LABELS[selectedDay]}
        </ThemedText>
        <View style={s.scheduleDayMeta}>
          <ThemedText style={[s.scheduleDayCount, { color: colors.textSecondary }]}>
            {pluralize(dayBookings.length, 'booking')}
            {grouped.length > 0 ? ` across ${pluralize(grouped.length, 'room')}` : ''}
          </ThemedText>
          {conflictCount > 0 && (
            <View style={s.scheduleConflictBadge}>
              <IconSymbol name="exclamationmark.triangle.fill" size={10} color="#EF4444" />
              <ThemedText style={s.scheduleConflictText}>
                {pluralize(conflictCount, 'conflict')}
              </ThemedText>
            </View>
          )}
        </View>
      </View>

      {/* Empty State */}
      {grouped.length === 0 && (
        <EmptyState
          icon="calendar"
          label={`No bookings for ${DAY_LABELS[selectedDay]}`}
          colors={colors}
        />
      )}

      {/* Bookings grouped by room */}
      {grouped.map((group) => (
        <View key={group.roomId} style={s.scheduleSection}>
          {/* Section Header — Room name */}
          <View style={[s.scheduleSectionHeader, { borderBottomColor: colors.border }]}>
            <IconSymbol name="door.left.hand.open" size={14} color={accentColor} />
            <ThemedText style={[s.scheduleSectionName, { color: colors.text }]}>
              {group.roomName}
            </ThemedText>
            <View style={[s.scheduleSectionCount, { backgroundColor: accentColor + '18' }]}>
              <ThemedText style={[s.scheduleSectionCountText, { color: accentColor }]}>
                {group.bookings.length}
              </ThemedText>
            </View>
          </View>

          {/* Booking Cards */}
          {group.bookings.map((booking) => {
            const statusColor = BOOKING_STATUS_COLORS[booking.status];
            return (
              <View
                key={booking.id}
                style={[
                  s.bookingCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: booking.hasConflict ? '#EF444440' : colors.border,
                  },
                ]}
              >
                {/* Time Range */}
                <View style={s.bookingTimeRow}>
                  <IconSymbol name="clock.fill" size={12} color={accentColor} />
                  <ThemedText style={[s.bookingTime, { color: accentColor }]}>
                    {booking.startTime} - {booking.endTime}
                  </ThemedText>
                </View>

                {/* Title */}
                <ThemedText
                  style={[s.bookingTitle, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {booking.title}
                </ThemedText>

                {/* Meta: BookedBy + Ministry + Status */}
                <View style={s.bookingMeta}>
                  <View style={s.bookingMetaItem}>
                    <IconSymbol name="person.fill" size={10} color={colors.textTertiary} />
                    <ThemedText style={[s.bookingMetaText, { color: colors.textSecondary }]}>
                      {booking.bookedBy}
                    </ThemedText>
                  </View>
                  <View style={s.bookingMetaItem}>
                    <IconSymbol name="heart.fill" size={10} color={colors.textTertiary} />
                    <ThemedText style={[s.bookingMetaText, { color: colors.textTertiary }]}>
                      {booking.ministry}
                    </ThemedText>
                  </View>
                  <StatusBadge
                    label={booking.status.toUpperCase()}
                    color={statusColor}
                  />
                </View>

                {/* Conflict Warning */}
                {booking.hasConflict && booking.conflictNote && (
                  <View style={s.conflictAlert}>
                    <IconSymbol
                      name="exclamationmark.triangle.fill"
                      size={14}
                      color="#EF4444"
                      style={s.conflictIcon}
                    />
                    <ThemedText
                      style={[s.conflictText, { color: '#EF4444' }]}
                      numberOfLines={3}
                    >
                      {booking.conflictNote}
                    </ThemedText>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// ACCESS SUB-TAB
// =============================================================================

function AccessTab({
  colors,
  accentColor,
  accessEntries,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  accessEntries: RoomAccessEntry[];
}) {
  // Total keys across all rooms
  const totalKeys = useMemo(
    () => accessEntries.reduce((sum, e) => sum + e.keyCount, 0),
    [accessEntries],
  );
  // Unique people with any access
  const uniquePeople = useMemo(() => {
    const set = new Set<string>();
    for (const entry of accessEntries) {
      entry.canBook.forEach((n) => set.add(n));
      entry.canApprove.forEach((n) => set.add(n));
      entry.canUnlock.forEach((n) => set.add(n));
    }
    return set.size;
  }, [accessEntries]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Summary Header */}
      <View style={s.accessSummary}>
        <View style={[s.accessSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="key.fill" size={16} color={accentColor} />
          <ThemedText style={[s.accessSummaryValue, { color: colors.text }]}>
            {totalKeys}
          </ThemedText>
          <ThemedText style={[s.accessSummaryLabel, { color: colors.textSecondary }]}>
            Total Keys
          </ThemedText>
        </View>
        <View style={[s.accessSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="person.2.fill" size={16} color={accentColor} />
          <ThemedText style={[s.accessSummaryValue, { color: colors.text }]}>
            {uniquePeople}
          </ThemedText>
          <ThemedText style={[s.accessSummaryLabel, { color: colors.textSecondary }]}>
            People
          </ThemedText>
        </View>
        <View style={[s.accessSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="door.left.hand.open" size={16} color={accentColor} />
          <ThemedText style={[s.accessSummaryValue, { color: colors.text }]}>
            {accessEntries.length}
          </ThemedText>
          <ThemedText style={[s.accessSummaryLabel, { color: colors.textSecondary }]}>
            Rooms
          </ThemedText>
        </View>
      </View>

      {/* Empty State */}
      {accessEntries.length === 0 && (
        <EmptyState icon="key.fill" label="No access entries" colors={colors} />
      )}

      {/* Access Lanes — one section per room */}
      {accessEntries.map((entry) => (
        <View
          key={entry.roomId}
          style={[s.accessSection, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          {/* Room Header with key count */}
          <View style={[s.accessRoomHeader, { borderBottomColor: colors.border }]}>
            <View style={s.accessRoomNameRow}>
              <IconSymbol name="door.left.hand.open" size={14} color={accentColor} />
              <ThemedText style={[s.accessRoomName, { color: colors.text }]}>
                {entry.roomName}
              </ThemedText>
            </View>
            <View style={[s.keyCountBadge, { backgroundColor: accentColor + '18' }]}>
              <IconSymbol name="key.fill" size={10} color={accentColor} />
              <ThemedText style={[s.keyCountText, { color: accentColor }]}>
                {entry.keyCount} {entry.keyCount === 1 ? 'key' : 'keys'}
              </ThemedText>
            </View>
          </View>

          {/* Can Book */}
          <View style={s.accessSubSection}>
            <View style={s.accessSubTitleRow}>
              <IconSymbol name="calendar" size={12} color={colors.textSecondary} />
              <ThemedText style={[s.accessSubTitle, { color: colors.textSecondary }]}>
                Can Book
              </ThemedText>
            </View>
            {entry.canBook.map((name) => (
              <View key={`book-${entry.roomId}-${name}`} style={s.accessPersonRow}>
                <View style={[s.accessPersonDot, { backgroundColor: '#22C55E' }]} />
                <ThemedText style={[s.accessPersonName, { color: colors.text }]}>
                  {name}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* Can Approve */}
          <View style={s.accessSubSection}>
            <View style={s.accessSubTitleRow}>
              <IconSymbol name="checkmark.seal" size={12} color={colors.textSecondary} />
              <ThemedText style={[s.accessSubTitle, { color: colors.textSecondary }]}>
                Can Approve
              </ThemedText>
            </View>
            {entry.canApprove.map((name) => (
              <View key={`approve-${entry.roomId}-${name}`} style={s.accessPersonRow}>
                <View style={[s.accessPersonDot, { backgroundColor: ACCENT }]} />
                <ThemedText style={[s.accessPersonName, { color: colors.text }]}>
                  {name}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* Can Unlock */}
          <View style={s.accessSubSection}>
            <View style={s.accessSubTitleRow}>
              <IconSymbol name="key.fill" size={12} color={colors.textSecondary} />
              <ThemedText style={[s.accessSubTitle, { color: colors.textSecondary }]}>
                Can Unlock
              </ThemedText>
            </View>
            {entry.canUnlock.map((name) => (
              <View key={`unlock-${entry.roomId}-${name}`} style={s.accessPersonRow}>
                <View style={[s.accessPersonDot, { backgroundColor: '#F59E0B' }]} />
                <ThemedText style={[s.accessPersonName, { color: colors.text }]}>
                  {name}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// MAINTENANCE SUB-TAB
// =============================================================================

function MaintenanceTab({
  colors,
  accentColor,
  tickets,
  rooms,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  tickets: MaintenanceTicket[];
  rooms: PhysicalRoom[];
}) {
  // Sort: open first, then in_progress, then resolved. Within each group, sort by severity.
  const sorted = useMemo(() => {
    const statusOrder: Record<string, number> = {
      open: 0,
      in_progress: 1,
      resolved: 2,
    };
    const severityOrder: Record<string, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    return [...tickets].sort((a, b) => {
      const sDiff = statusOrder[a.status] - statusOrder[b.status];
      if (sDiff !== 0) return sDiff;
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [tickets]);

  const openCount = useMemo(
    () => tickets.filter((t) => t.status === 'open').length,
    [tickets],
  );
  const inProgressCount = useMemo(
    () => tickets.filter((t) => t.status === 'in_progress').length,
    [tickets],
  );
  const resolvedCount = useMemo(
    () => tickets.filter((t) => t.status === 'resolved').length,
    [tickets],
  );
  const offlineRooms = useMemo(
    () => rooms.filter((r) => r.status === 'offline').length,
    [rooms],
  );
  const unassignedCount = useMemo(
    () => tickets.filter((t) => !t.assignedTo && t.status !== 'resolved').length,
    [tickets],
  );

  const renderItem = useCallback(
    ({ item }: { item: MaintenanceTicket }) => {
      const sevColor = SEVERITY_COLORS[item.severity];
      const statusColor = TICKET_STATUS_COLORS[item.status];
      const statusLabel = TICKET_STATUS_LABELS[item.status];

      return (
        <Pressable
          style={[s.ticketCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          {/* Severity bar */}
          <View style={[s.ticketSeverityBar, { backgroundColor: sevColor }]} />
          <View style={s.ticketContent}>
            {/* Header: Room name + Status */}
            <View style={s.ticketHeader}>
              <ThemedText style={[s.ticketRoom, { color: colors.text }]} numberOfLines={1}>
                {item.roomName}
              </ThemedText>
              <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
            </View>

            {/* Description */}
            <ThemedText
              style={[s.ticketDesc, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {item.description}
            </ThemedText>

            {/* Severity Badge + Reporter + Date */}
            <View style={s.ticketMeta}>
              <StatusBadge label={item.severity.toUpperCase()} color={sevColor} />
              <View style={s.ticketMetaItem}>
                <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.ticketMetaText, { color: colors.textTertiary }]}>
                  {item.reportedBy}
                </ThemedText>
              </View>
              <View style={s.ticketMetaItem}>
                <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.ticketMetaText, { color: colors.textTertiary }]}>
                  {formatDate(item.reportedDate)}
                </ThemedText>
              </View>
            </View>

            {/* Assigned To */}
            <View style={[s.ticketAssignedRow, { borderTopColor: colors.border }]}>
              <IconSymbol
                name="wrench.and.screwdriver.fill"
                size={11}
                color={item.assignedTo ? colors.textSecondary : '#F59E0B'}
              />
              <ThemedText
                style={[
                  s.ticketMetaText,
                  {
                    color: item.assignedTo ? colors.textSecondary : '#F59E0B',
                    fontWeight: item.assignedTo ? '400' : '600',
                  },
                ]}
              >
                {item.assignedTo || 'Unassigned'}
              </ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors],
  );

  const renderHeader = useCallback(
    () => (
      <>
        {/* Summary bar */}
        <View style={[s.ticketSummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.ticketSummaryRow}>
            <View style={s.ticketSummaryItem}>
              <View style={[s.ticketSummaryDot, { backgroundColor: '#EF4444' }]} />
              <ThemedText style={[s.ticketSummaryText, { color: colors.text }]}>
                {pluralize(openCount, 'open ticket')}
              </ThemedText>
            </View>
            <View style={s.ticketSummaryItem}>
              <View style={[s.ticketSummaryDot, { backgroundColor: '#F59E0B' }]} />
              <ThemedText style={[s.ticketSummaryText, { color: colors.text }]}>
                {pluralize(inProgressCount, 'in progress', 'in progress')}
              </ThemedText>
            </View>
          </View>
          <View style={s.ticketSummaryRow}>
            <View style={s.ticketSummaryItem}>
              <View style={[s.ticketSummaryDot, { backgroundColor: '#22C55E' }]} />
              <ThemedText style={[s.ticketSummaryText, { color: colors.text }]}>
                {pluralize(resolvedCount, 'resolved', 'resolved')}
              </ThemedText>
            </View>
            {offlineRooms > 0 && (
              <View style={s.ticketSummaryItem}>
                <View style={[s.ticketSummaryDot, { backgroundColor: '#EF4444' }]} />
                <ThemedText style={[s.ticketSummaryText, { color: '#EF4444' }]}>
                  {pluralize(offlineRooms, 'room')} offline
                </ThemedText>
              </View>
            )}
          </View>
          {unassignedCount > 0 && (
            <View style={[s.ticketSummaryAlert, { borderTopColor: colors.border }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#F59E0B" />
              <ThemedText style={[s.ticketSummaryAlertText, { color: '#F59E0B' }]}>
                {pluralize(unassignedCount, 'ticket')} unassigned
              </ThemedText>
            </View>
          )}
        </View>
      </>
    ),
    [openCount, inProgressCount, resolvedCount, offlineRooms, unassignedCount, colors],
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState
          icon="wrench.and.screwdriver.fill"
          label="No maintenance tickets"
          colors={colors}
        />
      }
    />
  );
}

// =============================================================================
// POLICIES SUB-TAB
// =============================================================================

function PoliciesTab({
  colors,
  accentColor,
  policies,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  policies: RoomPolicy[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Header */}
      <View style={s.policiesHeader}>
        <ThemedText style={[s.policiesTitle, { color: colors.text }]}>
          Room Policies
        </ThemedText>
        <ThemedText style={[s.policiesSubtitle, { color: colors.textSecondary }]}>
          Usage rules, rental terms, and restrictions for each room
        </ThemedText>
      </View>

      {/* Empty State */}
      {policies.length === 0 && (
        <EmptyState icon="doc.text.fill" label="No policies defined" colors={colors} />
      )}

      {/* Policy Cards */}
      {policies.map((policy) => {
        const sections: { label: string; value: string; icon: string }[] = [
          { label: 'Setup Rules', value: policy.setupRules, icon: 'wrench.and.screwdriver.fill' },
          { label: 'Rental Policy', value: policy.rentalPolicy, icon: 'dollarsign.circle.fill' },
          { label: 'Hours of Use', value: policy.hoursOfUse, icon: 'clock.fill' },
          { label: 'Noise Restrictions', value: policy.noiseRestrictions, icon: 'speaker.wave.2.fill' },
          { label: 'Food Policy', value: policy.foodPolicy, icon: 'fork.knife' },
        ];
        if (policy.specialNotes) {
          sections.push({
            label: 'Special Notes',
            value: policy.specialNotes,
            icon: 'exclamationmark.circle.fill',
          });
        }

        return (
          <View
            key={policy.roomId}
            style={[s.policyCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {/* Room Name Header */}
            <View style={[s.policyCardHeader, { borderBottomColor: colors.border }]}>
              <IconSymbol name="door.left.hand.open" size={16} color={accentColor} />
              <ThemedText style={[s.policyRoomName, { color: colors.text }]}>
                {policy.roomName}
              </ThemedText>
            </View>

            {/* Policy Sections */}
            {sections.map((section, idx) => (
              <View
                key={`${policy.roomId}-${idx}`}
                style={[
                  s.policySection,
                  idx < sections.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={s.policyLabelRow}>
                  <IconSymbol name={section.icon as any} size={12} color={colors.textSecondary} />
                  <ThemedText style={[s.policyLabel, { color: colors.textSecondary }]}>
                    {section.label}
                  </ThemedText>
                </View>
                <ThemedText style={[s.policyValue, { color: colors.text }]}>
                  {section.value}
                </ThemedText>
              </View>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// ROOM DETAIL BOTTOM SHEET
// =============================================================================

function RoomDetailSheet({
  visible,
  onClose,
  room,
  colors,
  accentColor,
  bookings,
  tickets,
}: {
  visible: boolean;
  onClose: () => void;
  room: PhysicalRoom | null;
  colors: typeof Colors.light;
  accentColor: string;
  bookings: RoomBooking[];
  tickets: MaintenanceTicket[];
}) {
  if (!room) return null;

  const statusColor = ROOM_STATUS_COLORS[room.status];
  const statusLabel = ROOM_STATUS_LABELS[room.status];

  // Upcoming bookings for this room (max 3, exclude cancelled)
  const roomBookings = useMemo(
    () =>
      bookings
        .filter((b) => b.roomId === room.id && b.status !== 'cancelled')
        .sort(
          (a, b) =>
            a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
        )
        .slice(0, 3),
    [bookings, room.id],
  );

  // Open maintenance tickets for this room
  const roomTickets = useMemo(
    () => tickets.filter((t) => t.roomId === room.id && t.status !== 'resolved'),
    [tickets, room.id],
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} title={room.name} useModal>
      {/* Status + Capacity Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
        <View style={[s.badge, { backgroundColor: accentColor + '20' }]}>
          <ThemedText style={[s.badgeText, { color: accentColor }]}>
            CAPACITY: {room.capacity}
          </ThemedText>
        </View>
      </View>

      {/* Divider */}
      <View style={[s.sheetDivider, { backgroundColor: colors.border }]} />

      {/* Readiness Section */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Readiness
        </ThemedText>
        {READINESS_ITEMS.map((item) => {
          const active = room.readiness[item.key];
          return (
            <View key={item.key} style={s.sheetReadinessRow}>
              <View style={s.sheetReadinessItem}>
                <IconSymbol
                  name={item.icon as any}
                  size={14}
                  color={active ? '#22C55E' : '#EF4444'}
                />
                <ThemedText style={[s.sheetReadinessLabel, { color: colors.textSecondary }]}>
                  {item.label}
                </ThemedText>
                <ThemedText
                  style={[
                    s.sheetReadinessStatus,
                    { color: active ? '#22C55E' : '#EF4444' },
                  ]}
                >
                  {active ? 'Ready' : 'Not Ready'}
                </ThemedText>
              </View>
              <IconSymbol
                name={
                  active
                    ? ('checkmark.circle.fill' as any)
                    : ('xmark.circle.fill' as any)
                }
                size={16}
                color={active ? '#22C55E' : '#EF4444'}
              />
            </View>
          );
        })}
      </View>

      {/* Features */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Features
        </ThemedText>
        <View style={s.sheetFeatureGrid}>
          {room.features.map((feature, i) => (
            <View
              key={`f-${i}`}
              style={[s.sheetFeatureChip, { backgroundColor: accentColor + '12' }]}
            >
              <ThemedText style={[s.sheetFeatureChipText, { color: accentColor }]}>
                {feature}
              </ThemedText>
            </View>
          ))}
        </View>
        {room.features.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No special features listed
          </ThemedText>
        )}
      </View>

      {/* Location */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Location
        </ThemedText>
        <View style={s.sheetLocationRow}>
          <View style={s.sheetLocationItem}>
            <ThemedText style={[s.sheetLocationLabel, { color: colors.textTertiary }]}>
              Floor
            </ThemedText>
            <ThemedText style={[s.sheetLocationValue, { color: colors.text }]}>
              {room.floor}
            </ThemedText>
          </View>
          <View style={s.sheetLocationItem}>
            <ThemedText style={[s.sheetLocationLabel, { color: colors.textTertiary }]}>
              Building
            </ThemedText>
            <ThemedText style={[s.sheetLocationValue, { color: colors.text }]}>
              {room.building}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Upcoming Bookings */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Upcoming Bookings ({roomBookings.length})
        </ThemedText>
        {roomBookings.map((booking) => {
          const bStatusColor = BOOKING_STATUS_COLORS[booking.status];
          return (
            <View key={booking.id} style={s.sheetBookingRow}>
              <IconSymbol name="calendar" size={13} color={accentColor} />
              <View style={s.sheetBookingContent}>
                <View style={s.sheetBookingTitleRow}>
                  <ThemedText
                    style={[s.sheetBookingTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {booking.title}
                  </ThemedText>
                  <StatusBadge label={booking.status.toUpperCase()} color={bStatusColor} />
                </View>
                <ThemedText style={[s.sheetBookingTime, { color: colors.textSecondary }]}>
                  {formatDate(booking.date)} — {booking.startTime} - {booking.endTime}
                </ThemedText>
                <ThemedText style={[s.sheetBookingMeta, { color: colors.textTertiary }]}>
                  {booking.bookedBy} / {booking.ministry}
                </ThemedText>
              </View>
            </View>
          );
        })}
        {roomBookings.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No upcoming bookings
          </ThemedText>
        )}
      </View>

      {/* Maintenance Tickets */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Maintenance ({roomTickets.length})
        </ThemedText>
        {roomTickets.map((ticket) => {
          const sevColor = SEVERITY_COLORS[ticket.severity];
          const tStatusColor = TICKET_STATUS_COLORS[ticket.status];
          return (
            <View key={ticket.id} style={s.sheetTicketRow}>
              <View
                style={[s.sheetTicketDot, { backgroundColor: sevColor }]}
              />
              <View style={s.sheetTicketContent}>
                <ThemedText
                  style={[s.sheetBookingTitle, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {ticket.description}
                </ThemedText>
                <View style={s.sheetTicketBadgeRow}>
                  <StatusBadge label={ticket.severity.toUpperCase()} color={sevColor} />
                  <StatusBadge
                    label={TICKET_STATUS_LABELS[ticket.status].toUpperCase()}
                    color={tStatusColor}
                  />
                </View>
                <ThemedText style={[s.sheetBookingMeta, { color: colors.textTertiary }]}>
                  Reported by {ticket.reportedBy} — {formatDate(ticket.reportedDate)}
                </ThemedText>
                {ticket.assignedTo && (
                  <ThemedText style={[s.sheetBookingMeta, { color: colors.textSecondary }]}>
                    Assigned to {ticket.assignedTo}
                  </ThemedText>
                )}
                {!ticket.assignedTo && (
                  <ThemedText style={[s.sheetBookingMeta, { color: '#F59E0B', fontWeight: '600' }]}>
                    Unassigned
                  </ThemedText>
                )}
              </View>
            </View>
          );
        })}
        {roomTickets.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No open maintenance tickets
          </ThemedText>
        )}
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
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Close
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function ChurchOrgRooms({ colors, accentColor, role = 'C1' }: Props) {
  // === RBAC Gate: C4 + C5 locked ===
  if (!isStaffLevel(role)) {
    return <LockedState colors={colors} />;
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('directory');
  const [selectedRoom, setSelectedRoom] = useState<PhysicalRoom | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0); // 0 = Wed (first in DAY_LABELS)

  // === Data ===
  const data = useMemo(() => getChurchRoomsData(), []);

  // === Callbacks ===
  const handleSelectRoom = useCallback((room: PhysicalRoom) => {
    setSelectedRoom(room);
    setSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (isElderLevel(role)) return SUB_TABS;
    if (isStaffLevel(role))
      return SUB_TABS.filter((t) =>
        ['directory', 'schedule', 'maintenance'].includes(t.id),
      );
    return [];
  }, [role]);

  // === Ensure active sub-tab is valid after RBAC filtering ===
  const safeActiveSubTab = useMemo(() => {
    if (visibleSubTabs.some((t) => t.id === activeSubTab)) return activeSubTab;
    return visibleSubTabs[0]?.id ?? 'directory';
  }, [activeSubTab, visibleSubTabs]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (safeActiveSubTab) {
      case 'directory':
        return (
          <DirectoryTab
            colors={colors}
            accentColor={accentColor}
            rooms={data.rooms}
            bookings={data.bookings}
            onSelectRoom={handleSelectRoom}
          />
        );
      case 'schedule':
        return (
          <ScheduleTab
            colors={colors}
            accentColor={accentColor}
            bookings={data.bookings}
            rooms={data.rooms}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
        );
      case 'access':
        if (!isElderLevel(role)) return null;
        return (
          <AccessTab
            colors={colors}
            accentColor={accentColor}
            accessEntries={data.access}
          />
        );
      case 'maintenance':
        return (
          <MaintenanceTab
            colors={colors}
            accentColor={accentColor}
            tickets={data.maintenance}
            rooms={data.rooms}
          />
        );
      case 'policies':
        if (!isElderLevel(role)) return null;
        return (
          <PoliciesTab
            colors={colors}
            accentColor={accentColor}
            policies={data.policies}
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
        activeId={safeActiveSubTab}
        onSelect={setActiveSubTab}
        accentColor={accentColor}
        colors={colors}
      />

      {/* Content */}
      <View style={s.contentContainer}>{renderContent()}</View>

      {/* Room Detail Bottom Sheet */}
      <RoomDetailSheet
        visible={sheetVisible}
        onClose={handleCloseSheet}
        room={selectedRoom}
        colors={colors}
        accentColor={accentColor}
        bookings={data.bookings}
        tickets={data.maintenance}
      />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  // -- Layout --
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
    lineHeight: 20,
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

  // -- Directory Summary --
  directorySummary: {
    marginBottom: Spacing.md,
  },
  directoryKpiRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  directoryKpiCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  directoryKpiValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  directoryKpiLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  directorySecondaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  directorySecondaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  directorySecondaryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  directoryLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  directoryLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  directoryLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  directoryLegendText: {
    fontSize: 11,
  },

  // -- Room Card (Directory) --
  roomCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  roomCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  roomNameCol: {
    flex: 1,
  },
  roomName: {
    fontSize: 15,
    fontWeight: '700',
  },
  roomCapBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.sm,
  },
  roomCapText: {
    fontSize: 11,
    fontWeight: '600',
  },
  roomStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  readinessStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: Spacing.sm,
  },
  readinessIconActive: {
    opacity: 1,
  },
  readinessIconInactive: {
    opacity: 0.4,
  },
  roomNextBookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  roomNextBooking: {
    fontSize: 12,
    flex: 1,
  },
  roomLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  roomLocation: {
    fontSize: 11,
  },

  // -- Day Selector (Schedule) --
  dayRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dayPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  dayPillActive: {
    borderWidth: 0,
  },
  dayPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dayPillTextActive: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  dayPillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 3,
  },

  // -- Schedule Day Header --
  scheduleDayHeader: {
    marginBottom: Spacing.md,
  },
  scheduleDayTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  scheduleDayMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  scheduleDayCount: {
    fontSize: 12,
  },
  scheduleConflictBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scheduleConflictText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
  },

  // -- Schedule Section --
  scheduleSection: {
    marginBottom: Spacing.lg,
  },
  scheduleSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  scheduleSectionName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  scheduleSectionCount: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleSectionCountText: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Booking Card --
  bookingCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  bookingTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  bookingTime: {
    fontSize: 12,
    fontWeight: '700',
  },
  bookingTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  bookingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  bookingMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookingMetaText: {
    fontSize: 11,
  },

  // -- Conflict Alert --
  conflictAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: '#EF444410',
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  conflictIcon: {
    marginTop: 1,
  },
  conflictText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },

  // -- Access Summary --
  accessSummary: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  accessSummaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: 4,
  },
  accessSummaryValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  accessSummaryLabel: {
    fontSize: 11,
  },

  // -- Access Section --
  accessSection: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  accessRoomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  accessRoomNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  accessRoomName: {
    fontSize: 15,
    fontWeight: '700',
  },
  keyCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  keyCountText: {
    fontSize: 11,
    fontWeight: '600',
  },
  accessSubSection: {
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  accessSubTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  accessSubTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  accessPersonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingLeft: Spacing.xs,
  },
  accessPersonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.sm,
  },
  accessPersonIcon: {
    marginRight: Spacing.sm,
  },
  accessPersonName: {
    fontSize: 13,
    fontWeight: '500',
  },

  // -- Ticket Card (Maintenance) --
  ticketCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  ticketSeverityBar: {
    width: 4,
  },
  ticketContent: {
    flex: 1,
    padding: Spacing.md,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ticketRoom: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  ticketDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  ticketMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  ticketMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ticketMetaText: {
    fontSize: 11,
  },
  ticketAssignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  // -- Ticket Summary --
  ticketSummary: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  ticketSummaryRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  ticketSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketSummaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ticketSummaryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ticketSummaryAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  ticketSummaryAlertText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Policies Header --
  policiesHeader: {
    marginBottom: Spacing.md,
  },
  policiesTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  policiesSubtitle: {
    fontSize: 12,
  },

  // -- Policy Card --
  policyCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  policyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  policyRoomName: {
    fontSize: 16,
    fontWeight: '700',
  },
  policySection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  policyLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  policyLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  policyValue: {
    fontSize: 13,
    lineHeight: 19,
    paddingLeft: 18,
  },

  // -- Bottom Sheet --
  sheetBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sheetDivider: {
    height: StyleSheet.hairlineWidth,
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
  sheetReadinessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  sheetReadinessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sheetReadinessLabel: {
    fontSize: 13,
    fontWeight: '500',
    minWidth: 80,
  },
  sheetReadinessStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  sheetFeatureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  sheetFeatureChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  sheetFeatureChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sheetEmptyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  sheetLocationRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  sheetLocationItem: {},
  sheetLocationLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  sheetLocationValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  sheetBookingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  sheetBookingContent: {
    flex: 1,
  },
  sheetBookingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  sheetBookingTime: {
    fontSize: 11,
    marginTop: 1,
  },
  sheetBookingTitle: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  sheetBookingMeta: {
    fontSize: 10,
    marginTop: 2,
  },
  sheetTicketRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  sheetTicketDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  sheetTicketContent: {
    flex: 1,
  },
  sheetTicketBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  sheetActions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
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
