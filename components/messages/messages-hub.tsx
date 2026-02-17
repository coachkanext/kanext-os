/**
 * Messages Hub — Mode-aware messages center with 4-tab pill nav.
 * Tabs: Inbox | Rooms | Requests | Pinned
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, FlatList, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMode } from '@/context/app-context';
import { MESSAGES_V2, MSG_ROOMS, MSG_TABS } from '@/data/mock-messages-v2';
import type { MsgTab, MsgItem, MsgRoom } from '@/data/mock-messages-v2';

// =============================================================================
// MESSAGES HUB
// =============================================================================

export function MessagesHub() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const mode = useMode();

  const [activeTab, setActiveTab] = useState<MsgTab>('inbox');

  const messages = MESSAGES_V2[mode];
  const rooms = MSG_ROOMS[mode];

  const filteredMessages = useMemo(() => {
    switch (activeTab) {
      case 'inbox':
        return messages.filter((m) => m.status !== 'archived');
      case 'requests':
        return messages.filter((m) => m.isRequest);
      case 'pinned':
        return messages.filter((m) => m.pinned);
      case 'rooms':
        return [];
      default:
        return messages;
    }
  }, [messages, activeTab]);

  const handleTabPress = (tab: MsgTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View style={[styles.searchContainer, { borderBottomColor: colors.border }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.backgroundTertiary }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search messages..."
            placeholderTextColor={colors.textTertiary}
            editable={false}
          />
        </View>
      </View>

      {/* Pill Nav */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
        style={styles.pillScroll}
      >
        {MSG_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => handleTabPress(tab.key)}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? '#fff' : colors.backgroundTertiary,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Content */}
      {activeTab === 'rooms' ? (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RoomCard room={item} colors={colors} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState colors={colors} label="No rooms" />
          }
        />
      ) : (
        <FlatList
          data={filteredMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageRow
              message={item}
              colors={colors}
              showRequestActions={activeTab === 'requests'}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              colors={colors}
              label={
                activeTab === 'requests'
                  ? 'No pending requests'
                  : activeTab === 'pinned'
                  ? 'No pinned messages'
                  : 'No messages'
              }
            />
          }
        />
      )}
    </View>
  );
}

// =============================================================================
// MESSAGE ROW
// =============================================================================

interface MessageRowProps {
  message: MsgItem;
  colors: typeof Colors.dark;
  showRequestActions: boolean;
}

function MessageRow({ message, colors, showRequestActions }: MessageRowProps) {
  const isUnread = message.status === 'unread';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.messageRow,
        {
          backgroundColor: pressed ? colors.backgroundSecondary : 'transparent',
          borderBottomColor: colors.border,
        },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      {/* Avatar circle */}
      <View style={[styles.avatar, { backgroundColor: colors.backgroundTertiary }]}>
        <ThemedText style={[styles.avatarText, { color: colors.text }]}>
          {message.senderInitials}
        </ThemedText>
      </View>

      {/* Content */}
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <ThemedText
            style={[
              styles.senderName,
              { color: colors.text },
              isUnread && styles.senderNameUnread,
            ]}
            numberOfLines={1}
          >
            {message.senderName}
          </ThemedText>
          <ThemedText style={[styles.timestamp, { color: colors.textTertiary }]}>
            {message.timestamp}
          </ThemedText>
        </View>
        <ThemedText
          style={[
            styles.preview,
            { color: isUnread ? colors.textSecondary : colors.textTertiary },
          ]}
          numberOfLines={2}
        >
          {message.preview}
        </ThemedText>

        {/* Request actions */}
        {showRequestActions && message.isRequest && (
          <View style={styles.requestActions}>
            <Pressable
              style={[styles.acceptBtn, { backgroundColor: '#22C55E20' }]}
              onPress={() =>
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              }
            >
              <ThemedText style={styles.acceptText}>Accept</ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.declineBtn,
                { backgroundColor: colors.backgroundTertiary },
              ]}
              onPress={() =>
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              }
            >
              <ThemedText
                style={[styles.declineText, { color: colors.textSecondary }]}
              >
                Decline
              </ThemedText>
            </Pressable>
          </View>
        )}
      </View>

      {/* Unread dot */}
      {isUnread && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

// =============================================================================
// ROOM CARD
// =============================================================================

interface RoomCardProps {
  room: MsgRoom;
  colors: typeof Colors.dark;
}

function RoomCard({ room, colors }: RoomCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.roomCard,
        {
          backgroundColor: pressed
            ? colors.backgroundSecondary
            : colors.backgroundTertiary,
          borderColor: colors.border,
        },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={styles.roomHeader}>
        {/* Room avatar */}
        <View
          style={[
            styles.roomAvatar,
            { backgroundColor: room.avatarColor + '20' },
          ]}
        >
          <ThemedText style={[styles.roomAvatarText, { color: room.avatarColor }]}>
            {room.name.charAt(0)}
          </ThemedText>
        </View>

        {/* Room info */}
        <View style={styles.roomInfo}>
          <View style={styles.roomNameRow}>
            <ThemedText
              style={[styles.roomName, { color: colors.text }]}
              numberOfLines={1}
            >
              {room.name}
            </ThemedText>
            <View style={[styles.typeBadge, { backgroundColor: colors.border }]}>
              <ThemedText
                style={[styles.typeBadgeText, { color: colors.textSecondary }]}
              >
                {room.type}
              </ThemedText>
            </View>
          </View>
          <ThemedText
            style={[styles.roomMembers, { color: colors.textTertiary }]}
          >
            {room.memberCount} {room.memberCount === 1 ? 'member' : 'members'}
          </ThemedText>
        </View>

        {/* Unread badge */}
        {room.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <ThemedText style={styles.unreadBadgeText}>
              {room.unreadCount}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Last message */}
      <View style={styles.roomFooter}>
        <ThemedText
          style={[styles.roomLastMessage, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {room.lastMessage}
        </ThemedText>
        <ThemedText
          style={[styles.roomActivity, { color: colors.textTertiary }]}
        >
          {room.lastActivity}
        </ThemedText>
      </View>
    </Pressable>
  );
}

// =============================================================================
// EMPTY STATE
// =============================================================================

interface EmptyStateProps {
  colors: typeof Colors.dark;
  label: string;
}

function EmptyState({ colors, label }: EmptyStateProps) {
  return (
    <View style={styles.emptyContainer}>
      <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
        {label}
      </ThemedText>
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

  // Search
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },

  // Pill nav
  pillScroll: {
    flexGrow: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  pill: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // List
  listContent: {
    paddingBottom: Spacing.xxl,
  },

  // Message row
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 4,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  messageContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  senderName: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginRight: Spacing.sm,
  },
  senderNameUnread: {
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 12,
  },
  preview: {
    fontSize: 14,
    lineHeight: 19,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DDDDDD',
    marginTop: 6,
  },

  // Request actions
  requestActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm + 2,
  },
  acceptBtn: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  acceptText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22C55E',
  },
  declineBtn: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  declineText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Room card
  roomCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  roomAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 4,
  },
  roomAvatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  roomInfo: {
    flex: 1,
  },
  roomNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 1,
  },
  roomName: {
    fontSize: 15,
    fontWeight: '600',
  },
  typeBadge: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  roomMembers: {
    fontSize: 12,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#DDDDDD',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
  },
  roomFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  roomLastMessage: {
    fontSize: 13,
    flex: 1,
  },
  roomActivity: {
    fontSize: 12,
  },

  // Empty state
  emptyContainer: {
    paddingTop: Spacing.xxl * 2,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
