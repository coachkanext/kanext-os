/**
 * Competition Organization Rooms Tab — 10-tab Rooms Hub.
 * Dashboard, War Rooms, Broadcast, Officials, Media, VIP, Operations, Archive, Analytics, Settings.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, TextInput, Pressable, Switch, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import {
  COMP_ROOMS_TABS,
  COMP_ROOMS_SCOPE_CHIPS,
  ROOM_STATUS_COLOR,
  ACCESS_LEVEL_COLOR,
  ROOM_TYPE_LABEL,
  PRIORITY_COLOR,
  getCompRoomsData,
  formatTimestamp,
  getOccupancyPercent,
  getOccupancyColor,
} from '@/data/mock-comp-org-rooms';
import type {
  CompRoomsTabId,
  RoomsDashboardBlock,
  RoomActivityItem,
  CompRoom,
  BroadcastRoom,
  OfficialRoom,
  MediaRoom,
  VIPRoom,
  OpsRoom,
  ArchivedRoom,
  AnalyticsStatCard,
  RoomAnalytic,
  RoomMessage,
  RoomFile,
  RoomSettingToggle,
} from '@/data/mock-comp-org-rooms';

// =============================================================================
// PROPS
// =============================================================================


const ACCENT = MODE_ACCENT.competition;
interface Props {
  colors: typeof Colors.light;
  accentColor: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function fileTypeIcon(type: RoomFile['type']): string {
  switch (type) {
    case 'document': return 'doc.text.fill';
    case 'image': return 'photo.fill';
    case 'video': return 'film.fill';
    case 'spreadsheet': return 'tablecells.fill';
  }
}

function fileTypeColor(type: RoomFile['type']): string {
  switch (type) {
    case 'document': return ACCENT;
    case 'image': return '#22C55E';
    case 'video': return '#EF4444';
    case 'spreadsheet': return '#F59E0B';
  }
}

function changeDirectionColor(dir: 'up' | 'down' | 'flat'): string {
  return dir === 'up' ? '#22C55E' : dir === 'down' ? '#EF4444' : '#A1A1AA';
}

function changeDirectionArrow(dir: 'up' | 'down' | 'flat'): string {
  return dir === 'up' ? 'arrow.up.right' : dir === 'down' ? 'arrow.down.right' : 'arrow.right';
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
// OCCUPANCY BAR
// =============================================================================

function OccupancyBar({ current, capacity }: { current: number; capacity: number }) {
  const pct = getOccupancyPercent(current, capacity);
  const barColor = getOccupancyColor(pct);
  return (
    <View style={s.occBarWrap}>
      <View style={s.occBarBg}>
        <View
          style={[s.occBarFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }]}
        />
      </View>
      <ThemedText style={[s.occBarLabel, { color: barColor }]}>
        {current}/{capacity} ({pct}%)
      </ThemedText>
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
  data: ReturnType<typeof getCompRoomsData>;
}) {
  const breakdownRows: { label: string; count: number; color: string }[] = [
    { label: 'War Rooms', count: data.warRooms.length, color: '#EF4444' },
    { label: 'Broadcast', count: data.broadcastRooms.length, color: '#F59E0B' },
    { label: 'Officials', count: data.officialRooms.length, color: ACCENT },
    { label: 'Media', count: data.mediaRooms.length, color: ACCENT },
    { label: 'VIP', count: data.vipRooms.length, color: '#22C55E' },
    { label: 'Operations', count: data.opsRooms.length, color: '#A1A1AA' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* KPI Cards */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Overview</ThemedText>
      <View style={s.kpiGrid}>
        {data.dashboard.map((block: RoomsDashboardBlock) => (
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

      {/* Breakdown */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Room Breakdown
      </ThemedText>
      <View style={[s.breakdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {breakdownRows.map((row, idx) => (
          <View
            key={row.label}
            style={[
              s.breakdownRow,
              idx < breakdownRows.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={[s.breakdownDot, { backgroundColor: row.color }]} />
            <ThemedText style={[s.breakdownLabel, { color: colors.text }]}>{row.label}</ThemedText>
            <ThemedText style={[s.breakdownValue, { color: colors.textSecondary }]}>
              {row.count}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Activity Feed */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Recent Activity
      </ThemedText>
      <View style={[s.actCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {data.activityFeed.map((item: RoomActivityItem, index: number) => (
          <View
            key={item.id}
            style={[
              s.actRow,
              index < data.activityFeed.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={[s.actDot, { backgroundColor: item.color }]} />
            <View style={s.actCol}>
              <ThemedText style={[s.actRoom, { color: colors.text }]} numberOfLines={1}>
                {item.roomName}
              </ThemedText>
              <ThemedText style={[s.actText, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.action}
              </ThemedText>
              <View style={s.actMeta}>
                <ThemedText style={[s.actActor, { color: colors.textTertiary }]}>
                  {item.actor}
                </ThemedText>
                <ThemedText style={[s.actTime, { color: colors.textTertiary }]}>
                  {formatTimestamp(item.timestampMs)}
                </ThemedText>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// WAR ROOMS TAB
// =============================================================================

function WarRoomsTab({
  colors,
  data,
  onSelect,
}: {
  colors: typeof Colors.light;
  data: CompRoom[];
  onSelect: (r: CompRoom) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = ROOM_STATUS_COLOR[item.status];
        const acColor = ACCESS_LEVEL_COLOR[item.accessLevel];
        return (
          <Pressable
            style={[s.roomCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(item);
            }}
          >
            <View style={s.roomTop}>
              <View style={s.roomInfo}>
                <View style={[s.roomIcon, { backgroundColor: stColor + '20' }]}>
                  <IconSymbol name="shield.fill" size={20} color={stColor} />
                </View>
                <View style={s.roomMid}>
                  <ThemedText style={[s.roomName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <View style={s.roomBadges}>
                    <StatusBadge label={item.status.toUpperCase()} color={stColor} />
                    <StatusBadge label={item.accessLevel.toUpperCase()} color={acColor} />
                  </View>
                </View>
              </View>
            </View>

            <View style={[s.roomStats, { borderTopColor: colors.border }]}>
              <View style={s.roomStatItem}>
                <ThemedText style={[s.roomStatVal, { color: colors.text }]}>
                  {item.currentOccupancy}/{item.capacity}
                </ThemedText>
                <ThemedText style={[s.roomStatLbl, { color: colors.textTertiary }]}>
                  Occupancy
                </ThemedText>
              </View>
              <View style={s.roomStatItem}>
                <ThemedText style={[s.roomStatVal, { color: colors.text }]}>
                  {item.lastActive}
                </ThemedText>
                <ThemedText style={[s.roomStatLbl, { color: colors.textTertiary }]}>
                  Last Active
                </ThemedText>
              </View>
            </View>

            <OccupancyBar current={item.currentOccupancy} capacity={item.capacity} />

            <View style={s.roomFoot}>
              <ThemedText style={[s.roomSeries, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.series}
              </ThemedText>
              <ThemedText style={[s.roomDate, { color: colors.textTertiary }]}>
                Created {item.createdDate}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="shield.fill" label="No war rooms" colors={colors} />
      }
    />
  );
}

// =============================================================================
// BROADCAST TAB
// =============================================================================

function BroadcastTab({
  colors,
  data,
  onSelect,
}: {
  colors: typeof Colors.light;
  data: BroadcastRoom[];
  onSelect: (r: BroadcastRoom) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = ROOM_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.roomCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(item);
            }}
          >
            {item.isLive && <View style={s.liveStripe} />}

            <View style={s.roomTop}>
              <View style={s.roomInfo}>
                <View
                  style={[
                    s.roomIcon,
                    { backgroundColor: item.isLive ? '#EF444420' : stColor + '20' },
                  ]}
                >
                  <IconSymbol
                    name="antenna.radiowaves.left.and.right"
                    size={20}
                    color={item.isLive ? '#EF4444' : stColor}
                  />
                </View>
                <View style={s.roomMid}>
                  <ThemedText style={[s.roomName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <View style={s.roomBadges}>
                    {item.isLive && <StatusBadge label="LIVE" color="#EF4444" />}
                    <StatusBadge label={item.status.toUpperCase()} color={stColor} />
                  </View>
                </View>
              </View>
            </View>

            <View style={[s.triStats, { borderTopColor: colors.border }]}>
              <View style={s.triItem}>
                <IconSymbol name="eye.fill" size={14} color={colors.textTertiary} />
                <ThemedText style={[s.triVal, { color: colors.text }]}>
                  {item.viewers.toLocaleString()}
                </ThemedText>
                <ThemedText style={[s.triLbl, { color: colors.textTertiary }]}>Viewers</ThemedText>
              </View>
              <View style={s.triItem}>
                <IconSymbol name="person.fill" size={14} color={colors.textTertiary} />
                <ThemedText style={[s.triVal, { color: colors.text }]}>
                  {item.currentOccupancy}/{item.capacity}
                </ThemedText>
                <ThemedText style={[s.triLbl, { color: colors.textTertiary }]}>Crew</ThemedText>
              </View>
              <View style={s.triItem}>
                <IconSymbol name="person.crop.rectangle.fill" size={14} color={colors.textTertiary} />
                <ThemedText style={[s.triVal, { color: colors.text }]} numberOfLines={1}>
                  {item.producer}
                </ThemedText>
                <ThemedText style={[s.triLbl, { color: colors.textTertiary }]}>Producer</ThemedText>
              </View>
            </View>

            <View style={s.roomFoot}>
              <ThemedText style={[s.roomSeries, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.series}
              </ThemedText>
              <ThemedText style={[s.roomDate, { color: colors.textTertiary }]}>
                {item.lastActive}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="antenna.radiowaves.left.and.right" label="No broadcast rooms" colors={colors} />
      }
    />
  );
}

// =============================================================================
// OFFICIALS TAB
// =============================================================================

function OfficialsTab({
  colors,
  data,
  onSelect,
}: {
  colors: typeof Colors.light;
  data: OfficialRoom[];
  onSelect: (r: OfficialRoom) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = ROOM_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.roomCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(item);
            }}
          >
            <View style={s.roomTop}>
              <View style={s.roomInfo}>
                <View style={[s.roomIcon, { backgroundColor: `${ACCENT}20` }]}>
                  <IconSymbol name="person.badge.shield.checkmark.fill" size={20} color={ACCENT} />
                </View>
                <View style={s.roomMid}>
                  <ThemedText style={[s.roomName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <View style={s.roomBadges}>
                    <StatusBadge label={item.status.toUpperCase()} color={stColor} />
                    {item.rulingsPending > 0 && (
                      <StatusBadge label={`${item.rulingsPending} PENDING`} color="#F59E0B" />
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Match ID */}
            <View style={[s.matchRow, { borderTopColor: colors.border }]}>
              <IconSymbol name="number" size={13} color={colors.textTertiary} />
              <ThemedText style={[s.matchId, { color: colors.textSecondary }]}>
                Match: {item.matchId}
              </ThemedText>
            </View>

            {/* Officials chips */}
            <View style={s.chipWrap}>
              {item.officials.map((official, idx) => (
                <View key={idx} style={[s.chip, { backgroundColor: colors.backgroundTertiary }]}>
                  <IconSymbol name="person.fill" size={10} color={colors.textTertiary} />
                  <ThemedText style={[s.chipText, { color: colors.textSecondary }]}>
                    {official}
                  </ThemedText>
                </View>
              ))}
            </View>

            <View style={[s.footRow, { borderTopColor: colors.border }]}>
              <ThemedText style={[s.roomSeries, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.series}
              </ThemedText>
              <View style={s.footRight}>
                <IconSymbol name="person.3.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.roomDate, { color: colors.textTertiary }]}>
                  {item.currentOccupancy}/{item.capacity}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="person.badge.shield.checkmark.fill" label="No official rooms" colors={colors} />
      }
    />
  );
}

// =============================================================================
// MEDIA TAB
// =============================================================================

function MediaTab({
  colors,
  data,
  onSelect,
}: {
  colors: typeof Colors.light;
  data: MediaRoom[];
  onSelect: (r: MediaRoom) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = ROOM_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.roomCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(item);
            }}
          >
            <View style={s.roomTop}>
              <View style={s.roomInfo}>
                <View style={[s.roomIcon, { backgroundColor: `${ACCENT}20` }]}>
                  <IconSymbol name="newspaper.fill" size={20} color={ACCENT} />
                </View>
                <View style={s.roomMid}>
                  <ThemedText style={[s.roomName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <View style={s.roomBadges}>
                    <StatusBadge label={item.status.toUpperCase()} color={stColor} />
                    <StatusBadge label={item.contentType.toUpperCase()} color={ACCENT} />
                  </View>
                </View>
              </View>
            </View>

            <View style={[s.triStats, { borderTopColor: colors.border }]}>
              <View style={s.triItem}>
                <IconSymbol name="person.3.fill" size={14} color={colors.textTertiary} />
                <ThemedText style={[s.triVal, { color: colors.text }]}>
                  {item.pressMembers}
                </ThemedText>
                <ThemedText style={[s.triLbl, { color: colors.textTertiary }]}>Press</ThemedText>
              </View>
              <View style={s.triItem}>
                <IconSymbol name="clock.fill" size={14} color={colors.textTertiary} />
                <ThemedText style={[s.triVal, { color: colors.text }]}>
                  {item.deadlineTime}
                </ThemedText>
                <ThemedText style={[s.triLbl, { color: colors.textTertiary }]}>Deadline</ThemedText>
              </View>
              <View style={s.triItem}>
                <IconSymbol name="rectangle.stack.fill" size={14} color={colors.textTertiary} />
                <ThemedText style={[s.triVal, { color: colors.text }]}>
                  {item.currentOccupancy}/{item.capacity}
                </ThemedText>
                <ThemedText style={[s.triLbl, { color: colors.textTertiary }]}>Capacity</ThemedText>
              </View>
            </View>

            <View style={s.roomFoot}>
              <ThemedText style={[s.roomSeries, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.series}
              </ThemedText>
              <ThemedText style={[s.roomDate, { color: colors.textTertiary }]}>
                {item.lastActive}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="newspaper.fill" label="No media rooms" colors={colors} />
      }
    />
  );
}

// =============================================================================
// VIP TAB
// =============================================================================

function VIPTab({
  colors,
  data,
  onSelect,
}: {
  colors: typeof Colors.light;
  data: VIPRoom[];
  onSelect: (r: VIPRoom) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = ROOM_STATUS_COLOR[item.status];
        const acColor = ACCESS_LEVEL_COLOR[item.accessLevel];
        return (
          <Pressable
            style={[s.roomCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(item);
            }}
          >
            <View style={s.roomTop}>
              <View style={s.roomInfo}>
                <View style={[s.roomIcon, { backgroundColor: `${ACCENT}20` }]}>
                  <IconSymbol name="star.fill" size={20} color={ACCENT} />
                </View>
                <View style={s.roomMid}>
                  <ThemedText style={[s.roomName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <View style={s.roomBadges}>
                    <StatusBadge label={item.status.toUpperCase()} color={stColor} />
                    <StatusBadge label={item.accessLevel.toUpperCase()} color={acColor} />
                  </View>
                </View>
              </View>
            </View>

            <OccupancyBar current={item.currentOccupancy} capacity={item.capacity} />

            {/* Guest list */}
            {item.currentGuests.length > 0 && (
              <View style={[s.guestSection, { borderTopColor: colors.border }]}>
                <ThemedText style={[s.guestTitle, { color: colors.textSecondary }]}>
                  Current Guests
                </ThemedText>
                <View style={s.chipWrap}>
                  {item.currentGuests.map((guest, idx) => (
                    <View
                      key={idx}
                      style={[s.chip, { backgroundColor: colors.backgroundTertiary }]}
                    >
                      <IconSymbol name="person.fill" size={10} color={ACCENT} />
                      <ThemedText
                        style={[s.chipText, { color: colors.textSecondary }]}
                        numberOfLines={1}
                      >
                        {guest}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={[s.footRow, { borderTopColor: colors.border }]}>
              <ThemedText style={[s.roomSeries, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.seriesAffiliation}
              </ThemedText>
              <ThemedText style={[s.roomDate, { color: colors.textTertiary }]}>
                {item.lastActive}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="star.fill" label="No VIP rooms" colors={colors} />
      }
    />
  );
}

// =============================================================================
// OPERATIONS TAB
// =============================================================================

function OperationsTab({
  colors,
  data,
  onSelect,
}: {
  colors: typeof Colors.light;
  data: OpsRoom[];
  onSelect: (r: OpsRoom) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = ROOM_STATUS_COLOR[item.status];
        const pColor = PRIORITY_COLOR[item.priority];
        return (
          <Pressable
            style={[s.opsCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(item);
            }}
          >
            <View style={[s.opsStripe, { backgroundColor: pColor }]} />
            <View style={s.opsBody}>
              <View style={s.roomTop}>
                <View style={s.roomInfo}>
                  <View style={[s.roomIcon, { backgroundColor: pColor + '20' }]}>
                    <IconSymbol name="gearshape.2.fill" size={20} color={pColor} />
                  </View>
                  <View style={s.roomMid}>
                    <ThemedText style={[s.roomName, { color: colors.text }]} numberOfLines={1}>
                      {item.name}
                    </ThemedText>
                    <View style={s.roomBadges}>
                      <StatusBadge label={item.status.toUpperCase()} color={stColor} />
                      <StatusBadge label={item.priority.toUpperCase()} color={pColor} />
                    </View>
                  </View>
                </View>
              </View>

              <View style={[s.triStats, { borderTopColor: colors.border }]}>
                <View style={s.triItem}>
                  <ThemedText style={[s.triVal, { color: colors.text }]}>
                    {item.activeTasks}
                  </ThemedText>
                  <ThemedText style={[s.triLbl, { color: colors.textTertiary }]}>Tasks</ThemedText>
                </View>
                <View style={s.triItem}>
                  <ThemedText style={[s.triVal, { color: colors.text }]}>
                    {item.personnelCount}
                  </ThemedText>
                  <ThemedText style={[s.triLbl, { color: colors.textTertiary }]}>
                    Personnel
                  </ThemedText>
                </View>
                <View style={s.triItem}>
                  <ThemedText style={[s.triVal, { color: colors.text }]}>
                    {item.currentOccupancy}/{item.capacity}
                  </ThemedText>
                  <ThemedText style={[s.triLbl, { color: colors.textTertiary }]}>
                    Occupancy
                  </ThemedText>
                </View>
              </View>

              <View style={s.roomFoot}>
                <ThemedText
                  style={[s.roomSeries, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {item.series}
                </ThemedText>
                <ThemedText style={[s.roomDate, { color: colors.textTertiary }]}>
                  {item.lastActive}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="gearshape.2.fill" label="No operations rooms" colors={colors} />
      }
    />
  );
}

// =============================================================================
// ARCHIVE TAB
// =============================================================================

function ArchiveTab({
  colors,
  data,
}: {
  colors: typeof Colors.light;
  data: ArchivedRoom[];
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const typeLabel = ROOM_TYPE_LABEL[item.type] ?? item.type;
        return (
          <View style={[s.roomCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.roomTop}>
              <View style={s.roomInfo}>
                <View style={[s.roomIcon, { backgroundColor: '#A1A1AA20' }]}>
                  <IconSymbol name="archivebox.fill" size={20} color="#A1A1AA" />
                </View>
                <View style={s.roomMid}>
                  <ThemedText style={[s.roomName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <View style={s.roomBadges}>
                    <StatusBadge label="ARCHIVED" color="#A1A1AA" />
                    <StatusBadge label={typeLabel.toUpperCase()} color="#A1A1AA" />
                  </View>
                </View>
              </View>
            </View>

            <View style={[s.triStats, { borderTopColor: colors.border }]}>
              <View style={s.triItem}>
                <IconSymbol
                  name="bubble.left.and.bubble.right.fill"
                  size={14}
                  color={colors.textTertiary}
                />
                <ThemedText style={[s.triVal, { color: colors.text }]}>
                  {item.totalMessages}
                </ThemedText>
                <ThemedText style={[s.triLbl, { color: colors.textTertiary }]}>Messages</ThemedText>
              </View>
              <View style={s.triItem}>
                <IconSymbol name="doc.fill" size={14} color={colors.textTertiary} />
                <ThemedText style={[s.triVal, { color: colors.text }]}>{item.totalFiles}</ThemedText>
                <ThemedText style={[s.triLbl, { color: colors.textTertiary }]}>Files</ThemedText>
              </View>
              <View style={s.triItem}>
                <IconSymbol name="person.3.fill" size={14} color={colors.textTertiary} />
                <ThemedText style={[s.triVal, { color: colors.text }]}>{item.capacity}</ThemedText>
                <ThemedText style={[s.triLbl, { color: colors.textTertiary }]}>Capacity</ThemedText>
              </View>
            </View>

            <View style={s.roomFoot}>
              <ThemedText style={[s.roomSeries, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.series}
              </ThemedText>
              <ThemedText style={[s.roomDate, { color: colors.textTertiary }]}>
                Archived {item.archivedDate}
              </ThemedText>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="archivebox.fill" label="No archived rooms" colors={colors} />
      }
    />
  );
}

// =============================================================================
// ANALYTICS TAB
// =============================================================================

function AnalyticsTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getCompRoomsData>;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Key Metrics */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Key Metrics</ThemedText>
      <View style={s.kpiGrid}>
        {data.analyticsStats.map((stat: AnalyticsStatCard) => {
          const dirColor = changeDirectionColor(stat.changeDirection);
          return (
            <View
              key={stat.id}
              style={[s.analyticsCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={s.analyticsHdr}>
                <IconSymbol name={stat.icon as any} size={16} color={stat.color} />
                <IconSymbol
                  name={changeDirectionArrow(stat.changeDirection) as any}
                  size={12}
                  color={dirColor}
                />
              </View>
              <ThemedText style={[s.analyticsVal, { color: colors.text }]}>{stat.value}</ThemedText>
              <ThemedText style={[s.analyticsLbl, { color: colors.textSecondary }]}>
                {stat.label}
              </ThemedText>
              <ThemedText style={[s.analyticsChg, { color: dirColor }]}>{stat.change}</ThemedText>
            </View>
          );
        })}
      </View>

      {/* Occupancy Trends */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Occupancy Trends (7d)
      </ThemedText>
      <View style={[s.trendsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {data.occupancyTrends.map((trend: RoomAnalytic, index: number) => {
          const pctNum = parseInt(trend.value, 10);
          const barColor = getOccupancyColor(pctNum);
          return (
            <View
              key={trend.id}
              style={[
                s.trendRow,
                index < data.occupancyTrends.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <ThemedText style={[s.trendId, { color: colors.textTertiary }]}>
                {trend.roomId}
              </ThemedText>
              <View style={s.trendBarWrap}>
                <View style={s.trendBarBg}>
                  <View
                    style={[
                      s.trendBarFill,
                      { width: `${pctNum}%`, backgroundColor: barColor },
                    ]}
                  />
                </View>
              </View>
              <ThemedText style={[s.trendVal, { color: colors.text }]}>{trend.value}</ThemedText>
            </View>
          );
        })}
      </View>

      {/* Peak Hours */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Peak Hours
      </ThemedText>
      <View style={[s.peakCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {data.peakHours.map((peak: RoomAnalytic, index: number) => (
          <View
            key={peak.id}
            style={[
              s.peakRow,
              index < data.peakHours.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <ThemedText style={[s.peakDay, { color: colors.textSecondary }]}>
              {peak.metric.replace('Peak Hour (', '').replace(')', '')}
            </ThemedText>
            <View style={[s.peakBadge, { backgroundColor: accentColor + '18' }]}>
              <IconSymbol name="clock.fill" size={12} color={accentColor} />
              <ThemedText style={[s.peakTime, { color: accentColor }]}>{peak.value}</ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Recent Files */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Recent Files
      </ThemedText>
      <View style={[s.filesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {data.files.map((file: RoomFile, index: number) => {
          const ftColor = fileTypeColor(file.type);
          return (
            <View
              key={file.id}
              style={[
                s.fileRow,
                index < data.files.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={[s.fileIcon, { backgroundColor: ftColor + '18' }]}>
                <IconSymbol name={fileTypeIcon(file.type) as any} size={14} color={ftColor} />
              </View>
              <View style={s.fileInfo}>
                <ThemedText style={[s.fileName, { color: colors.text }]} numberOfLines={1}>
                  {file.name}
                </ThemedText>
                <ThemedText style={[s.fileMeta, { color: colors.textTertiary }]}>
                  {file.size} \u2022 {file.uploadedBy}
                </ThemedText>
              </View>
              <ThemedText style={[s.fileDate, { color: colors.textTertiary }]}>
                {file.uploadedDate}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </ScrollView>
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
  data: RoomSettingToggle[];
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
            <ThemedText style={[s.settingDesc, { color: colors.textTertiary }]}>
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
// ROOM DETAIL BOTTOM SHEET
// =============================================================================

function RoomDetailSheet({
  visible,
  onClose,
  room,
  colors,
  accentColor,
  messages,
  files,
}: {
  visible: boolean;
  onClose: () => void;
  room: CompRoom | null;
  colors: typeof Colors.light;
  accentColor: string;
  messages: RoomMessage[];
  files: RoomFile[];
}) {
  if (!room) return null;

  const stColor = ROOM_STATUS_COLOR[room.status];
  const acColor = ACCESS_LEVEL_COLOR[room.accessLevel];
  const roomMessages = messages.filter((m) => m.roomId === room.id);
  const roomFiles = files.filter((f) => f.roomId === room.id);

  // Detect extended types via duck typing
  const bRoom = (room as BroadcastRoom).streamUrl ? (room as BroadcastRoom) : null;
  const oRoom = (room as OfficialRoom).matchId ? (room as OfficialRoom) : null;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={room.name} useModal>
      {/* Status + access badges */}
      <View style={s.sheetBadges}>
        <StatusBadge label={room.status.toUpperCase()} color={stColor} />
        <StatusBadge label={room.accessLevel.toUpperCase()} color={acColor} />
        <StatusBadge label={ROOM_TYPE_LABEL[room.type].toUpperCase()} color={accentColor} />
        {bRoom?.isLive && <StatusBadge label="LIVE" color="#EF4444" />}
      </View>

      {/* KPIs */}
      <View style={[s.sheetKpis, { borderColor: colors.border }]}>
        <View style={s.sheetKpi}>
          <ThemedText style={[s.sheetKpiVal, { color: colors.text }]}>
            {room.currentOccupancy}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLbl, { color: colors.textTertiary }]}>Current</ThemedText>
        </View>
        <View style={s.sheetKpi}>
          <ThemedText style={[s.sheetKpiVal, { color: colors.text }]}>{room.capacity}</ThemedText>
          <ThemedText style={[s.sheetKpiLbl, { color: colors.textTertiary }]}>Capacity</ThemedText>
        </View>
        <View style={s.sheetKpi}>
          <ThemedText style={[s.sheetKpiVal, { color: colors.text }]}>
            {getOccupancyPercent(room.currentOccupancy, room.capacity)}%
          </ThemedText>
          <ThemedText style={[s.sheetKpiLbl, { color: colors.textTertiary }]}>Occupancy</ThemedText>
        </View>
      </View>

      {/* Broadcast-specific section */}
      {bRoom && (
        <View style={[s.sheetSec, { borderColor: colors.border }]}>
          <ThemedText style={[s.sheetSecTitle, { color: colors.text }]}>Broadcast</ThemedText>
          <ThemedText style={[s.sheetSecBody, { color: colors.textSecondary }]}>
            Producer: {bRoom.producer}
          </ThemedText>
          <ThemedText style={[s.sheetSecBody, { color: colors.textSecondary }]}>
            Viewers: {bRoom.viewers.toLocaleString()}
          </ThemedText>
          <ThemedText style={[s.sheetStreamUrl, { color: colors.textTertiary }]} numberOfLines={1}>
            {bRoom.streamUrl}
          </ThemedText>
        </View>
      )}

      {/* Officials-specific section */}
      {oRoom && (
        <View style={[s.sheetSec, { borderColor: colors.border }]}>
          <ThemedText style={[s.sheetSecTitle, { color: colors.text }]}>Officials</ThemedText>
          <ThemedText style={[s.sheetSecBody, { color: colors.textSecondary }]}>
            Match: {oRoom.matchId}
          </ThemedText>
          <ThemedText style={[s.sheetSecBody, { color: colors.textSecondary }]}>
            Rulings Pending: {oRoom.rulingsPending}
          </ThemedText>
          {oRoom.officials.map((official, idx) => (
            <View key={idx} style={s.sheetOffRow}>
              <View style={[s.sheetOffDot, { backgroundColor: ACCENT }]} />
              <ThemedText style={[s.sheetOffName, { color: colors.textSecondary }]}>
                {official}
              </ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Series */}
      <View style={[s.sheetSec, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSecTitle, { color: colors.text }]}>Series</ThemedText>
        <ThemedText style={[s.sheetSecBody, { color: colors.textSecondary }]}>
          {room.series}
        </ThemedText>
      </View>

      {/* Details */}
      <View style={[s.sheetSec, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSecTitle, { color: colors.text }]}>Details</ThemedText>
        <ThemedText style={[s.sheetSecBody, { color: colors.textSecondary }]}>
          Created: {room.createdDate}
        </ThemedText>
        <ThemedText style={[s.sheetSecBody, { color: colors.textSecondary }]}>
          Last Active: {room.lastActive}
        </ThemedText>
      </View>

      {/* Recent Messages */}
      {roomMessages.length > 0 && (
        <View style={[s.sheetSec, { borderColor: colors.border }]}>
          <ThemedText style={[s.sheetSecTitle, { color: colors.text }]}>
            Recent Messages
          </ThemedText>
          {roomMessages.slice(0, 5).map((msg) => (
            <View key={msg.id} style={s.sheetMsgRow}>
              <View style={s.sheetMsgHdr}>
                <ThemedText style={[s.sheetMsgSender, { color: colors.text }]}>
                  {msg.sender}
                </ThemedText>
                {msg.pinned && <IconSymbol name="pin.fill" size={10} color="#F59E0B" />}
                <ThemedText style={[s.sheetMsgTime, { color: colors.textTertiary }]}>
                  {formatTimestamp(msg.timestamp)}
                </ThemedText>
              </View>
              <ThemedText
                style={[s.sheetMsgText, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {msg.text}
              </ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Files */}
      {roomFiles.length > 0 && (
        <View style={[s.sheetSec, { borderColor: colors.border }]}>
          <ThemedText style={[s.sheetSecTitle, { color: colors.text }]}>Files</ThemedText>
          {roomFiles.map((file) => {
            const ftColor = fileTypeColor(file.type);
            return (
              <View key={file.id} style={s.sheetFileRow}>
                <View style={[s.fileIcon, { backgroundColor: ftColor + '18' }]}>
                  <IconSymbol name={fileTypeIcon(file.type) as any} size={12} color={ftColor} />
                </View>
                <View style={s.fileInfo}>
                  <ThemedText style={[s.fileName, { color: colors.text }]} numberOfLines={1}>
                    {file.name}
                  </ThemedText>
                  <ThemedText style={[s.fileMeta, { color: colors.textTertiary }]}>
                    {file.size} \u2022 {file.uploadedBy}
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetBtn, { backgroundColor: bRoom?.isLive ? '#EF4444' : accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetBtnText}>
            {bRoom?.isLive ? 'Watch Live' : 'Enter Room'}
          </ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhost, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostText, { color: colors.textSecondary }]}>
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

export function CompRoomsV2({ colors, accentColor }: Props) {
  // === State ===
  const [activeTab, setActiveTab] = useState<CompRoomsTabId>('dashboard');
  const [activeScope, setActiveScope] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<CompRoom | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [settingOverrides, setSettingOverrides] = useState<Record<string, boolean>>({});

  // === Data ===
  const scopeLabel = COMP_ROOMS_SCOPE_CHIPS[activeScope] ?? 'All Rooms';
  const data = useMemo(() => getCompRoomsData(scopeLabel), [scopeLabel]);

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
  const q = searchQuery.toLowerCase().trim();

  const filteredWarRooms = useMemo(() => {
    if (!q) return data.warRooms;
    return data.warRooms.filter(
      (r) => r.name.toLowerCase().includes(q) || r.series.toLowerCase().includes(q),
    );
  }, [data.warRooms, q]);

  const filteredBroadcast = useMemo(() => {
    if (!q) return data.broadcastRooms;
    return data.broadcastRooms.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.producer.toLowerCase().includes(q) ||
        r.series.toLowerCase().includes(q),
    );
  }, [data.broadcastRooms, q]);

  const filteredOfficials = useMemo(() => {
    if (!q) return data.officialRooms;
    return data.officialRooms.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.matchId.toLowerCase().includes(q) ||
        r.officials.some((o) => o.toLowerCase().includes(q)),
    );
  }, [data.officialRooms, q]);

  const filteredMedia = useMemo(() => {
    if (!q) return data.mediaRooms;
    return data.mediaRooms.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.contentType.toLowerCase().includes(q) ||
        r.series.toLowerCase().includes(q),
    );
  }, [data.mediaRooms, q]);

  const filteredVip = useMemo(() => {
    if (!q) return data.vipRooms;
    return data.vipRooms.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.seriesAffiliation.toLowerCase().includes(q) ||
        r.currentGuests.some((g) => g.toLowerCase().includes(q)),
    );
  }, [data.vipRooms, q]);

  const filteredOps = useMemo(() => {
    if (!q) return data.opsRooms;
    return data.opsRooms.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.series.toLowerCase().includes(q) ||
        r.priority.toLowerCase().includes(q),
    );
  }, [data.opsRooms, q]);

  const filteredArchive = useMemo(() => {
    if (!q) return data.archivedRooms;
    return data.archivedRooms.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.series.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q),
    );
  }, [data.archivedRooms, q]);

  // === Callbacks ===
  const handleTabPress = useCallback((tabId: CompRoomsTabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  }, []);

  const handleScopePress = useCallback((index: number) => {
    Haptics.selectionAsync();
    setActiveScope(index);
  }, []);

  const openDetail = useCallback((room: CompRoom) => {
    setSelectedRoom(room);
    setShowDetail(true);
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
      case 'war-rooms':
        return <WarRoomsTab colors={colors} data={filteredWarRooms} onSelect={openDetail} />;
      case 'broadcast':
        return <BroadcastTab colors={colors} data={filteredBroadcast} onSelect={openDetail} />;
      case 'officials':
        return <OfficialsTab colors={colors} data={filteredOfficials} onSelect={openDetail} />;
      case 'media':
        return <MediaTab colors={colors} data={filteredMedia} onSelect={openDetail} />;
      case 'vip':
        return <VIPTab colors={colors} data={filteredVip} onSelect={openDetail} />;
      case 'operations':
        return <OperationsTab colors={colors} data={filteredOps} onSelect={openDetail} />;
      case 'archive':
        return <ArchiveTab colors={colors} data={filteredArchive} />;
      case 'analytics':
        return <AnalyticsTab colors={colors} accentColor={accentColor} data={data} />;
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
        style={{ flexGrow: 0 }}
        contentContainerStyle={s.pillRow}
      >
        {COMP_ROOMS_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              style={[
                s.pill,
                { backgroundColor: isActive ? accentColor : colors.backgroundTertiary },
              ]}
              onPress={() => handleTabPress(tab.id)}
            >
              <ThemedText
                style={[
                  s.pillText,
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
        style={{ flexGrow: 0 }}
        contentContainerStyle={s.scopeRow}
      >
        {COMP_ROOMS_SCOPE_CHIPS.map((chip, index) => {
          const isActive = index === activeScope;
          return (
            <Pressable
              key={chip}
              style={[
                s.scope,
                { backgroundColor: isActive ? accentColor + '20' : colors.backgroundTertiary },
                isActive && { borderColor: accentColor, borderWidth: 1 },
              ]}
              onPress={() => handleScopePress(index)}
            >
              <ThemedText
                style={[
                  s.scopeText,
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
      <View style={s.searchWrap}>
        <View
          style={[
            s.searchBar,
            { backgroundColor: colors.backgroundTertiary, borderColor: colors.border },
          ]}
        >
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search rooms\u2026"
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
      <View style={s.content}>
        {renderTabContent()}
      </View>

      {/* Universal Room Detail Bottom Sheet */}
      <RoomDetailSheet
        visible={showDetail}
        onClose={() => setShowDetail(false)}
        room={selectedRoom}
        colors={colors}
        accentColor={accentColor}
        messages={data.messages}
        files={data.files}
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
  content: {
    flex: 1,
  },

  // ── Tab pills ──
  pillRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Scope chips ──
  scopeRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  scope: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  scopeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Search ──
  searchWrap: {
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

  // ── Containers ──
  tabScroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  tabListContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // ── Section titles ──
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },

  // ── Badges ──
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

  // ── Empty state ──
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

  // ── Dashboard: KPI ──
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
  kpiDelta: {
    fontSize: 11,
    marginTop: 2,
  },

  // ── Dashboard: Breakdown ──
  breakdownCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  breakdownDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  breakdownLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // ── Dashboard: Activity ──
  actCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  actRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  actDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  actCol: {
    flex: 1,
  },
  actRoom: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 1,
  },
  actText: {
    fontSize: 13,
    lineHeight: 18,
  },
  actMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  actActor: {
    fontSize: 11,
  },
  actTime: {
    fontSize: 11,
  },

  // ── Room Card (shared) ──
  roomCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  roomTop: {
    padding: Spacing.md,
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  roomIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomMid: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  roomBadges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  roomStats: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  roomStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  roomStatVal: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  roomStatLbl: {
    fontSize: 11,
    marginTop: 2,
  },
  roomFoot: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  roomSeries: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  roomDate: {
    fontSize: 12,
    marginTop: 2,
  },

  // ── Occupancy bar ──
  occBarWrap: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 4,
  },
  occBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2F3336',
    overflow: 'hidden',
  },
  occBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  occBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // ── Live stripe ──
  liveStripe: {
    height: 3,
    backgroundColor: '#EF4444',
  },

  // ── Tri-stat row ──
  triStats: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  triItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  triVal: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  triLbl: {
    fontSize: 10,
  },

  // ── Officials extras ──
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  matchId: {
    fontSize: 13,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  footRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // ── VIP guest ──
  guestSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  guestTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },

  // ── Operations ──
  opsCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  opsStripe: {
    width: 4,
  },
  opsBody: {
    flex: 1,
  },

  // ── Analytics ──
  analyticsCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    flexGrow: 1,
    flexBasis: '46%',
  },
  analyticsHdr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  analyticsVal: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  analyticsLbl: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  analyticsChg: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },

  // ── Trends ──
  trendsCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    gap: Spacing.sm,
  },
  trendId: {
    width: 42,
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  trendBarWrap: {
    flex: 1,
  },
  trendBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2F3336',
    overflow: 'hidden',
  },
  trendBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  trendVal: {
    width: 36,
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },

  // ── Peak Hours ──
  peakCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  peakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  peakDay: {
    fontSize: 14,
    fontWeight: '500',
  },
  peakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  peakTime: {
    fontSize: 13,
    fontWeight: '700',
  },

  // ── Files ──
  filesCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  fileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '500',
  },
  fileMeta: {
    fontSize: 11,
    marginTop: 1,
  },
  fileDate: {
    fontSize: 11,
  },

  // ── Settings ──
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
  settingDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },

  // ── Bottom Sheet ──
  sheetBadges: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  sheetKpis: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
  },
  sheetKpi: {
    alignItems: 'center',
  },
  sheetKpiVal: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sheetKpiLbl: {
    fontSize: 11,
    marginTop: 2,
  },
  sheetSec: {
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetSecTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  sheetSecBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  sheetStreamUrl: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
    marginTop: 2,
  },
  sheetActions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  sheetBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
  },
  sheetBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  sheetGhost: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sheetGhostText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // ── Sheet: Messages ──
  sheetMsgRow: {
    paddingVertical: 6,
  },
  sheetMsgHdr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  sheetMsgSender: {
    fontSize: 12,
    fontWeight: '600',
  },
  sheetMsgTime: {
    fontSize: 10,
    marginLeft: 'auto',
  },
  sheetMsgText: {
    fontSize: 13,
    lineHeight: 18,
  },

  // ── Sheet: Files ──
  sheetFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 5,
  },

  // ── Sheet: Officials ──
  sheetOffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  sheetOffDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sheetOffName: {
    fontSize: 14,
  },
});
