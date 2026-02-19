/**
 * Sports Organization Rooms V2 — 6-view sub-tab hub.
 * Sub-tabs: Overview | Official Rooms | Announcements | Unit Rooms | Escalations | Settings
 * RBAC: R1 full 6-tab, R2 (Player) Overview + Official + Announcements,
 *        R3 (Asst Coach) all except Settings, R4/R5 locked.
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
  OFFICIAL_ROOMS,
  ANNOUNCEMENTS,
  UNIT_ROOMS,
  ESCALATIONS,
  getRoomsOverview,
  ROOM_TYPE_LABELS,
  ROOM_TYPE_COLORS,
  ANNOUNCEMENT_AUDIENCE_LABELS,
  ANNOUNCEMENT_AUDIENCE_COLORS,
  UNIT_LABELS,
  UNIT_COLORS,
  ESCALATION_TYPE_LABELS,
  ESCALATION_TYPE_COLORS,
} from '@/data/mock-sports-org-rooms-v2';
import type {
  OfficialRoom,
  Announcement,
  UnitRoom,
  Escalation,
} from '@/data/mock-sports-org-rooms-v2';

// =============================================================================
// CONSTANTS
// =============================================================================

const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'official', label: 'Official Rooms' },
  { id: 'announcements', label: 'Announcements' },
  { id: 'unit-rooms', label: 'Unit Rooms' },
  { id: 'escalations', label: 'Escalations' },
  { id: 'settings', label: 'Settings' },
];

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

function formatTimestamp(isoStr: string): string {
  if (!isoStr) return '--';
  const date = new Date(isoStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const hours = date.getHours();
  const mins = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${month} ${day}, ${h12}:${mins} ${ampm}`;
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
  const overview = useMemo(() => getRoomsOverview(), []);

  const kpiCards = [
    { label: 'Total Rooms', value: overview.totalRooms, icon: 'rectangle.3.group.fill', color: accentColor },
    { label: 'Unread Messages', value: overview.totalUnread, icon: 'envelope.badge.fill', color: overview.totalUnread > 10 ? '#F59E0B' : '#22C55E' },
    { label: 'Low Confirmation', value: overview.announcementsBelowThreshold, icon: 'exclamationmark.circle.fill', color: overview.announcementsBelowThreshold > 0 ? '#EF4444' : '#22C55E' },
    { label: 'Pinned Items', value: overview.pinnedMessages, icon: 'pin.fill', color: accentColor },
    { label: 'Open Escalations', value: overview.openEscalations, icon: 'exclamationmark.triangle.fill', color: overview.openEscalations > 0 ? '#EF4444' : '#22C55E' },
    { label: 'Req. Confirmation', value: overview.requiringConfirmation, icon: 'checkmark.circle.fill', color: overview.requiringConfirmation > 0 ? '#F59E0B' : '#22C55E' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* KPI Grid */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Rooms Summary</ThemedText>
      <View style={s.kpiGrid}>
        {kpiCards.map((kpi) => (
          <View
            key={kpi.label}
            style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <IconSymbol name={kpi.icon as any} size={20} color={kpi.color} />
            <ThemedText style={[s.kpiValue, { color: kpi.color }]}>{kpi.value}</ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>{kpi.label}</ThemedText>
          </View>
        ))}
      </View>

      {/* Most Active Room */}
      <View style={[s.highlightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.highlightRow}>
          <IconSymbol name="flame.fill" size={16} color="#F59E0B" />
          <ThemedText style={[s.highlightLabel, { color: colors.textSecondary }]}>Most Active Room</ThemedText>
        </View>
        <ThemedText style={[s.highlightValue, { color: colors.text }]}>{overview.mostActiveRoom}</ThemedText>
      </View>

      {/* Unit Room Count */}
      <View style={[s.highlightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.highlightRow}>
          <IconSymbol name="rectangle.3.group.fill" size={16} color={accentColor} />
          <ThemedText style={[s.highlightLabel, { color: colors.textSecondary }]}>Unit Rooms Active</ThemedText>
        </View>
        <ThemedText style={[s.highlightValue, { color: colors.text }]}>{overview.unitRoomCount}</ThemedText>
      </View>

      {/* Announcements Summary */}
      <View style={[s.highlightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.highlightRow}>
          <IconSymbol name="megaphone.fill" size={16} color={accentColor} />
          <ThemedText style={[s.highlightLabel, { color: colors.textSecondary }]}>
            Total Announcements
          </ThemedText>
        </View>
        <ThemedText style={[s.highlightValue, { color: colors.text }]}>{overview.totalAnnouncements}</ThemedText>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// OFFICIAL ROOMS SUB-TAB
// =============================================================================

function OfficialRoomsTab({
  colors,
  accentColor,
  rooms,
  onSelectRoom,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  rooms: OfficialRoom[];
  onSelectRoom: (room: OfficialRoom) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: OfficialRoom }) => {
      const typeColor = ROOM_TYPE_COLORS[item.type];
      const typeLabel = ROOM_TYPE_LABELS[item.type];
      return (
        <Pressable
          style={[s.roomCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectRoom(item);
          }}
        >
          <View style={s.roomCardTop}>
            <View style={[s.roomTypeDot, { backgroundColor: typeColor }]} />
            <View style={s.roomTextCol}>
              <ThemedText style={[s.roomName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <ThemedText style={[s.roomOwner, { color: colors.textSecondary }]}>
                {item.owner}
              </ThemedText>
            </View>
            {item.unread > 0 && (
              <View style={[s.unreadBadge, { backgroundColor: accentColor }]}>
                <ThemedText style={s.unreadBadgeText}>{item.unread}</ThemedText>
              </View>
            )}
          </View>
          <View style={s.roomBadgeRow}>
            <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
            <StatusBadge label={`${item.memberCount} MEMBERS`} color={colors.textSecondary} />
            {item.requiredReadPending > 0 && (
              <StatusBadge label={`${item.requiredReadPending} PENDING`} color="#F59E0B" />
            )}
          </View>
          <View style={[s.roomMeta, { borderTopColor: colors.border }]}>
            <View style={s.roomMetaItem}>
              <IconSymbol name="clock.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.roomMetaText, { color: colors.textTertiary }]}>
                {formatTimestamp(item.lastActivity)}
              </ThemedText>
            </View>
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
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="building.2.fill" label="No official rooms" colors={colors} />
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
  announcements,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  announcements: Announcement[];
}) {
  const renderItem = useCallback(
    ({ item }: { item: Announcement }) => {
      const audColor = ANNOUNCEMENT_AUDIENCE_COLORS[item.audience];
      const audLabel = ANNOUNCEMENT_AUDIENCE_LABELS[item.audience];
      const ratePercent = Math.round(item.confirmationRate * 100);
      const rateColor = item.confirmationRate < 0.8 ? '#EF4444' : '#22C55E';
      return (
        <View
          style={[s.announcementCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <ThemedText style={[s.announcementTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </ThemedText>
          <View style={s.announcementBadgeRow}>
            <StatusBadge label={audLabel.toUpperCase()} color={audColor} />
            <StatusBadge label={`${item.confirmedCount}/${item.totalRecipients} CONFIRMED`} color={rateColor} />
          </View>

          {/* Confirmation Rate */}
          <View style={s.confirmationRow}>
            <ThemedText style={[s.confirmationLabel, { color: colors.textSecondary }]}>
              Confirmation
            </ThemedText>
            <ThemedText style={[s.confirmationPercent, { color: rateColor }]}>
              {ratePercent}%
            </ThemedText>
          </View>
          <ProgressBar percent={ratePercent} color={rateColor} />

          <View style={[s.announcementMeta, { borderTopColor: colors.border }]}>
            <View style={s.announcementMetaItem}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.announcementMetaText, { color: colors.textTertiary }]}>
                {item.postedBy}
              </ThemedText>
            </View>
            <View style={s.announcementMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.announcementMetaText, { color: colors.textTertiary }]}>
                Posted {formatDate(item.postedDate)}
              </ThemedText>
            </View>
            <View style={s.announcementMetaItem}>
              <IconSymbol name="clock.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.announcementMetaText, { color: colors.textTertiary }]}>
                Expires {formatDate(item.expirationDate)}
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
      data={announcements}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="megaphone.fill" label="No announcements" colors={colors} />
      }
    />
  );
}

// =============================================================================
// UNIT ROOMS SUB-TAB
// =============================================================================

function UnitRoomsTab({
  colors,
  accentColor,
  unitRooms,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  unitRooms: UnitRoom[];
}) {
  const renderItem = useCallback(
    ({ item }: { item: UnitRoom }) => {
      const unitColor = UNIT_COLORS[item.unit];
      const unitLabel = UNIT_LABELS[item.unit];
      return (
        <View
          style={[s.unitRoomCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.unitRoomCardTop}>
            <View style={[s.unitDot, { backgroundColor: unitColor }]} />
            <View style={s.unitTextCol}>
              <ThemedText style={[s.unitRoomName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <ThemedText style={[s.unitRoomPurpose, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.purpose}
              </ThemedText>
            </View>
          </View>
          <View style={s.unitBadgeRow}>
            <StatusBadge label={unitLabel.toUpperCase()} color={unitColor} />
            <StatusBadge label={`${item.memberCount} MEMBERS`} color={colors.textSecondary} />
          </View>
          <View style={[s.unitMessageRow, { borderTopColor: colors.border }]}>
            <IconSymbol name="text.bubble.fill" size={12} color={colors.textTertiary} />
            <ThemedText style={[s.unitMessageText, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.lastMessage}
            </ThemedText>
          </View>
          <View style={s.unitActivityRow}>
            <IconSymbol name="clock.fill" size={11} color={colors.textTertiary} />
            <ThemedText style={[s.unitActivityText, { color: colors.textTertiary }]}>
              {formatTimestamp(item.lastMessageDate)}
            </ThemedText>
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={unitRooms}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="rectangle.3.group.fill" label="No unit rooms" colors={colors} />
      }
    />
  );
}

// =============================================================================
// ESCALATIONS SUB-TAB
// =============================================================================

function EscalationsTab({
  colors,
  accentColor,
  escalations,
  onSelectEscalation,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  escalations: Escalation[];
  onSelectEscalation: (esc: Escalation) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: Escalation }) => {
      const typeColor = ESCALATION_TYPE_COLORS[item.type];
      const typeLabel = ESCALATION_TYPE_LABELS[item.type];
      return (
        <Pressable
          style={[s.escalationCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectEscalation(item);
          }}
        >
          <View style={[s.escalationSeverityBar, { backgroundColor: typeColor }]} />
          <View style={s.escalationContent}>
            <View style={s.escalationBadgeRow}>
              <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
              <StatusBadge
                label={item.resolved ? 'RESOLVED' : 'OPEN'}
                color={item.resolved ? '#22C55E' : '#EF4444'}
              />
            </View>
            <ThemedText style={[s.escalationMessage, { color: colors.text }]} numberOfLines={3}>
              {item.message}
            </ThemedText>
            <View style={s.escalationMetaRow}>
              <View style={s.escalationMetaItem}>
                <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.escalationMetaText, { color: colors.textTertiary }]}>
                  {item.sourceName}
                </ThemedText>
              </View>
              <View style={s.escalationMetaItem}>
                <IconSymbol name="building.2.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.escalationMetaText, { color: colors.textTertiary }]}>
                  {item.sourceRoom}
                </ThemedText>
              </View>
            </View>
            <View style={s.escalationDateRow}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.escalationMetaText, { color: colors.textTertiary }]}>
                {formatTimestamp(item.date)}
              </ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectEscalation],
  );

  return (
    <FlatList
      data={escalations}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="exclamationmark.triangle.fill" label="No escalations" colors={colors} />
      }
    />
  );
}

// =============================================================================
// SETTINGS SUB-TAB
// =============================================================================

function SettingsTab({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const settingsItems = [
    { id: 's1', label: 'Room Naming Convention', icon: 'textformat.abc', desc: 'Configure naming rules for official and unit rooms' },
    { id: 's2', label: 'Default Permissions', icon: 'lock.shield.fill', desc: 'Set default member access for new rooms' },
    { id: 's3', label: 'Announcement Policies', icon: 'megaphone.fill', desc: 'Confirmation thresholds, expiration rules, and audience defaults' },
    { id: 's4', label: 'Escalation Routing', icon: 'arrow.triangle.branch', desc: 'Configure auto-routing rules for escalation types' },
    { id: 's5', label: 'Archive Policy', icon: 'archivebox.fill', desc: 'Auto-archive rules based on room inactivity' },
    { id: 's6', label: 'Notification Preferences', icon: 'bell.fill', desc: 'Control push and in-app notification delivery' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Room Configuration</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Room configuration and permissions
      </ThemedText>

      {settingsItems.map((item) => (
        <Pressable
          key={item.id}
          style={[s.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={s.settingsCardTop}>
            <IconSymbol name={item.icon as any} size={18} color={accentColor} />
            <View style={s.settingsTextCol}>
              <ThemedText style={[s.settingsLabel, { color: colors.text }]}>{item.label}</ThemedText>
              <ThemedText style={[s.settingsDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.desc}
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </View>
        </Pressable>
      ))}
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
}: {
  visible: boolean;
  onClose: () => void;
  room: OfficialRoom | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!room) return null;

  const typeColor = ROOM_TYPE_COLORS[room.type];
  const typeLabel = ROOM_TYPE_LABELS[room.type];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={room.name} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
        {room.unread > 0 && (
          <StatusBadge label={`${room.unread} UNREAD`} color="#F59E0B" />
        )}
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{room.owner}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Owner</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{typeLabel}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Type</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{room.memberCount}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Members</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: room.requiredReadPending > 0 ? '#F59E0B' : '#22C55E' }]}>
              {room.requiredReadPending}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Pending Reads</ThemedText>
          </View>
        </View>
      </View>

      {/* Activity */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Activity</ThemedText>
        <View style={s.sheetListRow}>
          <IconSymbol name="clock.fill" size={14} color={accentColor} />
          <View style={s.sheetListTextCol}>
            <ThemedText style={[s.sheetListTitle, { color: colors.text }]}>Last Activity</ThemedText>
            <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
              {formatTimestamp(room.lastActivity)}
            </ThemedText>
          </View>
        </View>
        <View style={s.sheetListRow}>
          <IconSymbol name="envelope.badge.fill" size={14} color={room.unread > 0 ? '#F59E0B' : '#22C55E'} />
          <View style={s.sheetListTextCol}>
            <ThemedText style={[s.sheetListTitle, { color: colors.text }]}>Unread Messages</ThemedText>
            <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
              {room.unread} unread message{room.unread !== 1 ? 's' : ''}
            </ThemedText>
          </View>
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
// ESCALATION DETAIL BOTTOM SHEET
// =============================================================================

function EscalationDetailSheet({
  visible,
  onClose,
  escalation,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  escalation: Escalation | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!escalation) return null;

  const typeColor = ESCALATION_TYPE_COLORS[escalation.type];
  const typeLabel = ESCALATION_TYPE_LABELS[escalation.type];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Escalation Details" useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
        <StatusBadge
          label={escalation.resolved ? 'RESOLVED' : 'OPEN'}
          color={escalation.resolved ? '#22C55E' : '#EF4444'}
        />
      </View>

      {/* Subject */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Subject</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
          {escalation.message}
        </ThemedText>
      </View>

      {/* Source */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Source</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{escalation.sourceName}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Reported By</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{escalation.sourceRoom}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Source Room</ThemedText>
          </View>
        </View>
      </View>

      {/* Timeline */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Timeline</ThemedText>
        <View style={s.sheetListRow}>
          <IconSymbol name="calendar" size={14} color={accentColor} />
          <View style={s.sheetListTextCol}>
            <ThemedText style={[s.sheetListTitle, { color: colors.text }]}>Created</ThemedText>
            <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
              {formatTimestamp(escalation.date)}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Status */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Status</ThemedText>
        <View style={s.sheetListRow}>
          <View style={[s.timelineDot, { backgroundColor: escalation.resolved ? '#22C55E' : '#EF4444' }]} />
          <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
            {escalation.resolved ? 'This escalation has been resolved' : 'This escalation is currently open and requires attention'}
          </ThemedText>
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
// MAIN EXPORT
// =============================================================================

export function SportsOrgRoomsV2({ colors, accentColor, role = 'R1' }: Props) {
  // === RBAC Gate: R4/R5 locked ===
  if (role === 'R4' || role === 'R5') {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Rooms</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          Rooms information is not available for your role
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [drillMode, setDrillMode] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<OfficialRoom | null>(null);
  const [roomSheetVisible, setRoomSheetVisible] = useState(false);
  const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null);
  const [escalationSheetVisible, setEscalationSheetVisible] = useState(false);

  // === Callbacks ===
  const handleSelectRoom = useCallback((room: OfficialRoom) => {
    setSelectedRoom(room);
    setRoomSheetVisible(true);
  }, []);

  const handleCloseRoomSheet = useCallback(() => {
    setRoomSheetVisible(false);
  }, []);

  const handleSelectEscalation = useCallback((esc: Escalation) => {
    setSelectedEscalation(esc);
    setEscalationSheetVisible(true);
  }, []);

  const handleCloseEscalationSheet = useCallback(() => {
    setEscalationSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (role === 'R1') return SUB_TABS; // R1: full 6 tabs
    if (role === 'R2') {
      // R2 (Player): Overview + Official Rooms + Announcements
      return SUB_TABS.filter(
        (t) => t.id === 'overview' || t.id === 'official' || t.id === 'announcements',
      );
    }
    if (role === 'R3') {
      // R3 (Asst Coach): all except Settings
      return SUB_TABS.filter((t) => t.id !== 'settings');
    }
    // R4/R5 already handled by locked gate above
    return SUB_TABS;
  }, [role]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return <OverviewTab colors={colors} accentColor={accentColor} />;
      case 'official':
        return (
          <OfficialRoomsTab
            colors={colors}
            accentColor={accentColor}
            rooms={OFFICIAL_ROOMS}
            onSelectRoom={handleSelectRoom}
          />
        );
      case 'announcements':
        return (
          <AnnouncementsTab
            colors={colors}
            accentColor={accentColor}
            announcements={ANNOUNCEMENTS}
          />
        );
      case 'unit-rooms':
        if (role === 'R2') return null;
        return (
          <UnitRoomsTab
            colors={colors}
            accentColor={accentColor}
            unitRooms={UNIT_ROOMS}
          />
        );
      case 'escalations':
        if (role === 'R2') return null;
        return (
          <EscalationsTab
            colors={colors}
            accentColor={accentColor}
            escalations={ESCALATIONS}
            onSelectEscalation={handleSelectEscalation}
          />
        );
      case 'settings':
        if (role !== 'R1') return null;
        return <SettingsTab colors={colors} accentColor={accentColor} />;
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

      {/* Room Detail Bottom Sheet */}
      <RoomDetailSheet
        visible={roomSheetVisible}
        onClose={handleCloseRoomSheet}
        room={selectedRoom}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Escalation Detail Bottom Sheet */}
      <EscalationDetailSheet
        visible={escalationSheetVisible}
        onClose={handleCloseEscalationSheet}
        escalation={selectedEscalation}
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },

  // -- KPI Grid --
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  kpiCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    fontSize: 11,
    textAlign: 'center',
  },

  // -- Highlight Card --
  highlightCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  highlightLabel: {
    fontSize: 12,
  },
  highlightValue: {
    fontSize: 15,
    fontWeight: '700',
  },

  // -- Room Card --
  roomCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  roomCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  roomTypeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  roomTextCol: {
    flex: 1,
  },
  roomName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  roomOwner: {
    fontSize: 11,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
  },
  roomBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  roomMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  roomMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roomMetaText: {
    fontSize: 11,
  },

  // -- Announcement Card --
  announcementCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  announcementTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  announcementBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  confirmationLabel: {
    fontSize: 12,
  },
  confirmationPercent: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  announcementMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  announcementMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  announcementMetaText: {
    fontSize: 11,
  },

  // -- Unit Room Card --
  unitRoomCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  unitRoomCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  unitDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  unitTextCol: {
    flex: 1,
  },
  unitRoomName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  unitRoomPurpose: {
    fontSize: 12,
    lineHeight: 17,
  },
  unitBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  unitMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.xs,
  },
  unitMessageText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  unitActivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  unitActivityText: {
    fontSize: 11,
  },

  // -- Escalation Card --
  escalationCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  escalationSeverityBar: {
    width: 4,
  },
  escalationContent: {
    flex: 1,
    padding: Spacing.md,
  },
  escalationBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  escalationMessage: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    marginBottom: Spacing.sm,
  },
  escalationMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  escalationMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  escalationMetaText: {
    fontSize: 11,
  },
  escalationDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // -- Settings Card --
  settingsCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  settingsCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  settingsTextCol: {
    flex: 1,
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingsDesc: {
    fontSize: 12,
    lineHeight: 17,
  },

  // -- Bottom Sheet Shared --
  sheetBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  sheetSection: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  sheetBodyText: {
    fontSize: 13,
    lineHeight: 19,
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
    marginBottom: 2,
  },
  sheetDetailLabel: {
    fontSize: 11,
  },
  sheetListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  sheetListTextCol: {
    flex: 1,
  },
  sheetListTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  sheetListSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sheetActions: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  sheetGhostButton: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sheetGhostButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
