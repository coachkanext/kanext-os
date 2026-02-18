/**
 * Rooms Hub — 6-tab communication directory & control plane.
 * Same hub UI across all 5 modes, different room templates per mode.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  ScrollView,
  Pressable,
  Switch,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { Mode } from '@/types';
import {
  ROOMS_HUB_TABS,
  SCOPE_CHIPS,
  ROOM_TEMPLATES,
  MOCK_ROOMS,
  ROOM_REQUESTS,
  ROOM_SETTINGS,
  sortRoomsForInbox,
  type Room,
  type RoomsHubTab,
  type RoomRequest,
  type RoomAuditEntry,
  type RoomSettingToggle,
  type RoomTemplateOption,
  type ScopeChip,
} from '@/data/mock-rooms-v2';

// =============================================================================
// PROPS
// =============================================================================

interface RoomsHubProps {
  mode: Mode;
  colors: typeof Colors.light;
  accentColor: string;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function RoomRow({
  room,
  colors,
}: {
  room: Room;
  colors: typeof Colors.light;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.roomRow,
        { borderBottomColor: colors.divider },
        pressed && { backgroundColor: colors.backgroundSecondary },
      ]}
    >
      <View style={[styles.roomAvatar, { backgroundColor: room.avatarColor }]}>
        <ThemedText style={styles.roomAvatarText}>
          {room.title
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')}
        </ThemedText>
      </View>
      <View style={styles.roomInfo}>
        <View style={styles.roomTitleRow}>
          <ThemedText style={styles.roomTitle} numberOfLines={1}>
            {room.title}
          </ThemedText>
          {room.pinned_room && (
            <IconSymbol name="pin.fill" size={12} color={colors.textTertiary} />
          )}
        </View>
        <View style={styles.roomMetaRow}>
          <View style={[styles.templateBadge, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[styles.templateBadgeText, { color: colors.textSecondary }]}>
              {room.room_type.replace(/-/g, ' ')}
            </ThemedText>
          </View>
        </View>
        <ThemedText style={[styles.roomPreview, { color: colors.textSecondary }]} numberOfLines={1}>
          {room.lastMessage}
        </ThemedText>
      </View>
      <View style={styles.roomRight}>
        <ThemedText style={[styles.roomTimestamp, { color: colors.textTertiary }]}>
          {room.last_activity_at}
        </ThemedText>
        {room.unread_count > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: room.avatarColor }]}>
            <ThemedText style={styles.unreadBadgeText}>{room.unread_count}</ThemedText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function NewRoomButton({
  accentColor,
  onPress,
}: {
  accentColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.newRoomButton,
        { backgroundColor: accentColor },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      <IconSymbol name="plus" size={16} color="#000000" />
      <ThemedText style={styles.newRoomButtonText}>New Room</ThemedText>
    </Pressable>
  );
}

function ScopeChipBar({
  chips,
  activeChips,
  onToggle,
  colors,
  accentColor,
}: {
  chips: ScopeChip[];
  activeChips: Set<string>;
  onToggle: (key: string) => void;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipBarContent}
      style={styles.chipBar}
    >
      {chips.map((chip) => {
        const isActive = activeChips.has(chip.key);
        return (
          <Pressable
            key={chip.key}
            style={[
              styles.scopeChip,
              {
                backgroundColor: isActive ? accentColor : colors.backgroundTertiary,
                borderColor: isActive ? accentColor : colors.border,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onToggle(chip.key);
            }}
          >
            <ThemedText
              style={[
                styles.scopeChipText,
                { color: isActive ? '#000000' : colors.textSecondary },
              ]}
            >
              {chip.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function TemplateCard({
  template,
  colors,
  accentColor,
}: {
  template: RoomTemplateOption;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.templateCard,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={[styles.templateIcon, { backgroundColor: accentColor + '15' }]}>
        <IconSymbol name={template.icon as any} size={20} color={accentColor} />
      </View>
      <ThemedText style={styles.templateLabel}>{template.label}</ThemedText>
      <ThemedText style={[styles.templateDesc, { color: colors.textSecondary }]} numberOfLines={2}>
        {template.description}
      </ThemedText>
    </Pressable>
  );
}

function RequestRow({
  request,
  colors,
  accentColor,
}: {
  request: RoomRequest;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const handleApprove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };
  const handleDeny = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.requestRow, { borderBottomColor: colors.divider }]}>
      <View style={[styles.requestAvatar, { backgroundColor: colors.backgroundTertiary }]}>
        <ThemedText style={[styles.requestAvatarText, { color: colors.textSecondary }]}>
          {request.requester_initials}
        </ThemedText>
      </View>
      <View style={styles.requestInfo}>
        <ThemedText style={styles.requestName}>{request.requester_name}</ThemedText>
        <View style={styles.requestMeta}>
          <ThemedText style={[styles.requestRoom, { color: colors.textSecondary }]} numberOfLines={1}>
            {request.room_title}
          </ThemedText>
          <View
            style={[
              styles.requestTypeBadge,
              {
                backgroundColor:
                  request.request_type === 'join' ? accentColor + '20' : colors.backgroundTertiary,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.requestTypeText,
                { color: request.request_type === 'join' ? accentColor : colors.textSecondary },
              ]}
            >
              {request.request_type === 'join' ? 'Join' : 'Invite'}
            </ThemedText>
          </View>
        </View>
        {request.message && (
          <ThemedText style={[styles.requestMessage, { color: colors.textTertiary }]} numberOfLines={2}>
            "{request.message}"
          </ThemedText>
        )}
        <ThemedText style={[styles.requestTimestamp, { color: colors.textTertiary }]}>
          {request.timestamp}
        </ThemedText>
      </View>
      <View style={styles.requestActions}>
        <Pressable
          style={({ pressed }) => [
            styles.approveButton,
            { backgroundColor: accentColor },
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleApprove}
        >
          <ThemedText style={styles.approveButtonText}>Approve</ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.denyButton,
            { borderColor: colors.border },
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleDeny}
        >
          <ThemedText style={[styles.denyButtonText, { color: colors.textSecondary }]}>Deny</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const AUDIT_ICONS: Record<string, string> = {
  room_created: 'plus.circle.fill',
  member_added: 'person.badge.plus',
  permission_changed: 'lock.fill',
  room_archived: 'archivebox.fill',
  share_link: 'link',
};

function AuditRow({
  entry,
  roomTitle,
  colors,
}: {
  entry: RoomAuditEntry;
  roomTitle: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={[styles.auditRow, { borderBottomColor: colors.divider }]}>
      <View style={[styles.auditIcon, { backgroundColor: colors.backgroundTertiary }]}>
        <IconSymbol
          name={(AUDIT_ICONS[entry.action] ?? 'info.circle.fill') as any}
          size={16}
          color={colors.textSecondary}
        />
      </View>
      <View style={styles.auditInfo}>
        <ThemedText style={styles.auditDetail}>{entry.detail}</ThemedText>
        <ThemedText style={[styles.auditMeta, { color: colors.textSecondary }]}>
          {entry.actor} · {roomTitle}
        </ThemedText>
        <ThemedText style={[styles.auditTimestamp, { color: colors.textTertiary }]}>
          {entry.timestamp}
        </ThemedText>
      </View>
    </View>
  );
}

function SettingsToggleRow({
  setting,
  colors,
}: {
  setting: RoomSettingToggle;
  colors: typeof Colors.light;
}) {
  const [enabled, setEnabled] = useState(setting.enabled);
  return (
    <View style={[styles.settingsRow, { borderBottomColor: colors.divider }]}>
      <View style={styles.settingsInfo}>
        <ThemedText style={styles.settingsLabel}>{setting.label}</ThemedText>
        <ThemedText style={[styles.settingsDesc, { color: colors.textSecondary }]}>
          {setting.description}
        </ThemedText>
      </View>
      <Switch
        value={enabled}
        onValueChange={(v) => {
          setEnabled(v);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        trackColor={{ false: colors.backgroundTertiary, true: colors.textSecondary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

function EmptyState({ message, colors }: { message: string; colors: typeof Colors.light }) {
  return (
    <View style={styles.emptyState}>
      <IconSymbol name="tray" size={32} color={colors.textTertiary} />
      <ThemedText style={[styles.emptyStateText, { color: colors.textTertiary }]}>
        {message}
      </ThemedText>
    </View>
  );
}

// =============================================================================
// MODE LABEL MAP
// =============================================================================

const MODE_LABELS: Record<Mode, string> = {
  sports: 'Sports',
  education: 'Education',
  church: 'Church',
  business: 'Business',
  competition: 'Competition',
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function RoomsHub({ mode, colors, accentColor }: RoomsHubProps) {
  const [activeTab, setActiveTab] = useState<RoomsHubTab>('inbox');
  const [activeScopes, setActiveScopes] = useState<Set<string>>(new Set());

  const rooms = MOCK_ROOMS[mode];
  const requests = ROOM_REQUESTS[mode];
  const settings = ROOM_SETTINGS[mode];
  const templates = ROOM_TEMPLATES[mode];
  const scopes = SCOPE_CHIPS[mode];

  const inboxRooms = useMemo(() => sortRoomsForInbox(rooms), [rooms]);
  const pinnedRooms = useMemo(() => rooms.filter((r) => r.pinned_room), [rooms]);

  const filteredRooms = useMemo(() => {
    if (activeScopes.size === 0) return rooms;
    return rooms.filter((r) => activeScopes.has(r.scope_object));
  }, [rooms, activeScopes]);

  const allAuditEntries = useMemo(() => {
    const entries: { entry: RoomAuditEntry; roomTitle: string }[] = [];
    rooms.forEach((room) => {
      room.audit_log.forEach((entry) => {
        entries.push({ entry, roomTitle: room.title });
      });
    });
    return entries.sort((a, b) => b.entry.timestamp_ms - a.entry.timestamp_ms);
  }, [rooms]);

  const handleScopeToggle = useCallback((key: string) => {
    setActiveScopes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'inbox':
        return (
          <FlatList
            data={inboxRooms}
            keyExtractor={(item) => item.room_id}
            renderItem={({ item }) => <RoomRow room={item} colors={colors} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<EmptyState message="No rooms yet" colors={colors} />}
          />
        );

      case 'rooms':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            <NewRoomButton
              accentColor={accentColor}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            />
            <ScopeChipBar
              chips={scopes}
              activeChips={activeScopes}
              onToggle={handleScopeToggle}
              colors={colors}
              accentColor={accentColor}
            />
            <ThemedText style={[styles.sectionLabel, { color: colors.textTertiary }]}>
              TEMPLATES
            </ThemedText>
            <View style={styles.templateGrid}>
              {templates.map((t) => (
                <TemplateCard key={t.key} template={t} colors={colors} accentColor={accentColor} />
              ))}
            </View>
            <ThemedText style={[styles.sectionLabel, { color: colors.textTertiary, marginTop: Spacing.lg }]}>
              ALL ROOMS ({filteredRooms.length})
            </ThemedText>
            {filteredRooms.map((room) => (
              <RoomRow key={room.room_id} room={room} colors={colors} />
            ))}
          </ScrollView>
        );

      case 'requests':
        if (requests.length === 0) {
          return <EmptyState message="No pending requests" colors={colors} />;
        }
        return (
          <FlatList
            data={requests}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RequestRow request={item} colors={colors} accentColor={accentColor} />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        );

      case 'pinned':
        if (pinnedRooms.length === 0) {
          return <EmptyState message="No pinned rooms" colors={colors} />;
        }
        return (
          <FlatList
            data={pinnedRooms}
            keyExtractor={(item) => item.room_id}
            renderItem={({ item }) => <RoomRow room={item} colors={colors} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        );

      case 'audit':
        if (allAuditEntries.length === 0) {
          return <EmptyState message="No audit log entries" colors={colors} />;
        }
        return (
          <FlatList
            data={allAuditEntries}
            keyExtractor={(item) => item.entry.id}
            renderItem={({ item }) => (
              <AuditRow entry={item.entry} roomTitle={item.roomTitle} colors={colors} />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        );

      case 'settings':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            <ThemedText style={[styles.settingsHeader, { color: colors.textTertiary }]}>
              {MODE_LABELS[mode]} Room Settings
            </ThemedText>
            {settings.map((s) => (
              <SettingsToggleRow key={s.id} setting={s} colors={colors} />
            ))}
          </ScrollView>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Pill Nav */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillNavContent}
        style={styles.pillNav}
      >
        {ROOMS_HUB_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? accentColor : 'transparent',
                  borderColor: isActive ? accentColor : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab.id);
              }}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  { color: isActive ? '#000000' : colors.textSecondary },
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Content */}
      <View style={styles.content}>{renderTabContent()}</View>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pillNav: {
    flexGrow: 0,
    paddingTop: Spacing.sm,
  },
  pillNavContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    marginTop: Spacing.sm,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },

  // Room Row
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  roomAvatar: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  roomAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  roomInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  roomTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roomTitle: {
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
  },
  roomMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  templateBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
  },
  templateBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  roomPreview: {
    fontSize: 13,
    marginTop: 2,
  },
  roomRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  roomTimestamp: {
    fontSize: 11,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // New Room Button
  newRoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    gap: 6,
  },
  newRoomButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '600',
  },

  // Scope Chips
  chipBar: {
    flexGrow: 0,
    marginBottom: Spacing.md,
  },
  chipBarContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  scopeChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  scopeChipText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Section Label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },

  // Template Grid
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  templateCard: {
    width: '47%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
  },
  templateIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  templateLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  templateDesc: {
    fontSize: 11,
    marginTop: 2,
  },

  // Request Row
  requestRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  requestAvatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  requestAvatarText: {
    fontSize: 13,
    fontWeight: '600',
  },
  requestInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  requestName: {
    fontSize: 15,
    fontWeight: '600',
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  requestRoom: {
    fontSize: 12,
    flexShrink: 1,
  },
  requestTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
  },
  requestTypeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  requestMessage: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 3,
  },
  requestTimestamp: {
    fontSize: 11,
    marginTop: 2,
  },
  requestActions: {
    justifyContent: 'center',
    gap: 6,
  },
  approveButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
  },
  denyButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  denyButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Audit Row
  auditRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  auditIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  auditInfo: {
    flex: 1,
  },
  auditDetail: {
    fontSize: 14,
    fontWeight: '500',
  },
  auditMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  auditTimestamp: {
    fontSize: 11,
    marginTop: 1,
  },

  // Settings
  settingsHeader: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingsInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingsDesc: {
    fontSize: 12,
    marginTop: 2,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyStateText: {
    fontSize: 14,
  },
});
