/**
 * BusinessRoomsV2 — Structured group communication channels for business mode.
 * 4 sections: Pinned, Executive, Department, Project
 * Room thread: linear messages + pinned message banner + escalate action.
 * Spec: Room rows show Name + Preview + Timestamp + Unread Badge only.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SectionList,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { ChatComposer } from '@/components/messages/chat-composer';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getBizMsgRooms,
  getBizRoomMessages,
  formatMsgTime,
  type BizMsgRoom,
  type BizMsgRoomMessage,
  type BizMsgRoomSectionData,
} from '@/data/mock-business-msg-rooms';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface BusinessRoomsV2Props {
  search?: string;
}

export function BusinessRoomsV2({ search = '' }: BusinessRoomsV2Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = MODE_ACCENT.business;

  const [selectedRoom, setSelectedRoom] = useState<BizMsgRoom | null>(null);
  const [inputText, setInputText] = useState('');

  // Data
  const sections = useMemo(() => getBizMsgRooms(search), [search]);

  // Room messages for detail
  const roomMessages = useMemo(() => {
    if (!selectedRoom) return [];
    return getBizRoomMessages(selectedRoom.id);
  }, [selectedRoom]);

  const handleRoomPress = useCallback((room: BizMsgRoom) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRoom(room);
  }, []);

  const handleEscalate = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Would create escalation thread in Inbox
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: BizMsgRoom }) => (
      <RoomRow room={item} colors={colors} onPress={() => handleRoomPress(item)} />
    ),
    [colors, handleRoomPress],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: BizMsgRoomSectionData }) => {
      const unreadCount = section.data.filter((r) => r.unread).length;
      return (
        <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {section.title}
          </Text>
          {unreadCount > 0 && (
            <View style={[styles.countBadge, { backgroundColor: accent }]}>
              <Text style={styles.countText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      );
    },
    [colors, accent],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconSymbol name="bubble.left.and.bubble.right" size={28} color={colors.textTertiary} />
            <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
              {search ? 'No rooms match your search' : 'No rooms available'}
            </ThemedText>
          </View>
        }
      />

      {/* ===== Room Thread Detail Sheet ===== */}
      <BottomSheet
        visible={selectedRoom !== null}
        onClose={() => {
          setSelectedRoom(null);
          setInputText('');
        }}
        title={selectedRoom?.name}
        useModal
      >
        {selectedRoom && (
          <RoomThreadDetail
            room={selectedRoom}
            messages={roomMessages}
            colors={colors}
            accent={accent}
            inputText={inputText}
            onChangeText={setInputText}
            onSend={() => setInputText('')}
            onEscalate={handleEscalate}
          />
        )}
      </BottomSheet>
    </View>
  );
}

// =============================================================================
// ROOM ROW — Name + Preview + Timestamp + Unread Badge
// =============================================================================

function RoomRow({
  room,
  colors,
  onPress,
}: {
  room: BizMsgRoom;
  colors: typeof Colors.light;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? colors.backgroundSecondary : 'transparent', borderBottomColor: colors.border },
      ]}
      onPress={onPress}
    >
      {/* Color icon */}
      <View style={[styles.roomIcon, { backgroundColor: room.color + '20' }]}>
        <ThemedText style={[styles.roomIconText, { color: room.color }]}>
          {room.initials}
        </ThemedText>
      </View>

      {/* Content */}
      <View style={styles.rowContent}>
        <View style={styles.rowTopLine}>
          <View style={styles.nameRow}>
            <ThemedText
              style={[styles.roomName, { color: colors.text }, room.unread && styles.roomNameUnread]}
              numberOfLines={1}
            >
              {room.name}
            </ThemedText>
            {room.locked && (
              <IconSymbol name="lock.fill" size={11} color={colors.textTertiary} />
            )}
          </View>
          <ThemedText style={[styles.rowTime, { color: colors.textTertiary }]}>
            {formatMsgTime(room.timestamp)}
          </ThemedText>
        </View>

        <ThemedText
          style={[styles.rowPreview, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {room.lastSender}: {room.lastMessage}
        </ThemedText>
      </View>

      {/* Unread badge */}
      {room.unread && room.unreadCount && (
        <View style={[styles.unreadBadge, { backgroundColor: '#1A1714' }]}>
          <Text style={styles.unreadBadgeText}>{room.unreadCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

// =============================================================================
// ROOM THREAD DETAIL
// =============================================================================

function RoomThreadDetail({
  room,
  messages,
  colors,
  accent,
  inputText,
  onChangeText,
  onSend,
  onEscalate,
}: {
  room: BizMsgRoom;
  messages: BizMsgRoomMessage[];
  colors: typeof Colors.light;
  accent: string;
  inputText: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onEscalate: () => void;
}) {
  return (
    <View style={styles.threadContainer}>
      {/* Pinned message banner */}
      {room.pinnedMessage && (
        <View style={[styles.pinnedBanner, { backgroundColor: colors.backgroundSecondary }]}>
          <IconSymbol name="pin.fill" size={12} color={colors.textTertiary} />
          <ThemedText
            style={[styles.pinnedText, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {room.pinnedMessage}
          </ThemedText>
        </View>
      )}

      {/* Messages */}
      <ScrollView style={styles.messagesScroll} showsVerticalScrollIndicator={false}>
        {messages.map((msg) => (
          <View key={msg.id} style={styles.msgRow}>
            {!msg.isMe && (
              <View style={[styles.msgAvatar, { backgroundColor: colors.backgroundTertiary }]}>
                <ThemedText style={[styles.msgAvatarText, { color: colors.textTertiary }]}>
                  {msg.initials}
                </ThemedText>
              </View>
            )}
            <View style={[styles.msgBubble, { flex: 1 }]}>
              <View style={styles.msgHeader}>
                <ThemedText style={[styles.msgSender, { color: colors.text }]}>
                  {msg.isMe ? 'You' : msg.sender}
                </ThemedText>
                {!msg.isMe && (
                  <ThemedText style={[styles.msgRole, { color: colors.textTertiary }]}>
                    {msg.role}
                  </ThemedText>
                )}
              </View>
              <ThemedText style={[styles.msgContent, { color: colors.text }]}>
                {msg.content}
              </ThemedText>
              <ThemedText style={[styles.msgTime, { color: colors.textTertiary }]}>
                {formatMsgTime(msg.timestamp)}
              </ThemedText>
            </View>
          </View>
        ))}

        {messages.length === 0 && (
          <View style={styles.noMessages}>
            <ThemedText style={[styles.noMessagesText, { color: colors.textTertiary }]}>
              No messages yet. Start the conversation.
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Escalate button */}
      <View style={styles.escalateRow}>
        <Pressable
          style={({ pressed }) => [
            styles.escalateBtn,
            { backgroundColor: colors.backgroundSecondary, opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={onEscalate}
        >
          <IconSymbol name="arrow.up.right" size={14} color={colors.textSecondary} />
          <ThemedText style={[styles.escalateBtnText, { color: colors.textSecondary }]}>
            Escalate
          </ThemedText>
        </Pressable>
      </View>

      {/* Input */}
      <ChatComposer
        value={inputText}
        onChangeText={onChangeText}
        onSend={onSend}
      />
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
  listContent: {
    paddingBottom: 100,
  },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },

  // Room row
  row: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
    alignItems: 'flex-start',
  },
  roomIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomIconText: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowContent: {
    flex: 1,
    minWidth: 0,
  },
  rowTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
    minWidth: 0,
  },
  roomName: {
    fontSize: 15,
    fontWeight: '500',
    flexShrink: 1,
  },
  roomNameUnread: {
    fontWeight: '700',
  },
  rowTime: {
    fontSize: 12,
    marginLeft: 8,
  },
  rowPreview: {
    fontSize: 14,
    lineHeight: 19,
    marginTop: 3,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginTop: 2,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
  },

  // Thread detail
  threadContainer: {
    flex: 1,
  },
  pinnedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  pinnedText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },

  // Messages
  messagesScroll: {
    flex: 1,
    marginBottom: Spacing.sm,
  },
  msgRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgAvatarText: {
    fontSize: 11,
    fontWeight: '600',
  },
  msgBubble: {
    minWidth: 0,
  },
  msgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  msgSender: {
    fontSize: 13,
    fontWeight: '600',
  },
  msgRole: {
    fontSize: 11,
  },
  msgContent: {
    fontSize: 15,
    lineHeight: 20,
  },
  msgTime: {
    fontSize: 11,
    marginTop: 2,
  },
  noMessages: {
    alignItems: 'center',
    paddingTop: 60,
  },
  noMessagesText: {
    fontSize: 14,
  },

  // Escalate
  escalateRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: Spacing.sm,
  },
  escalateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  escalateBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
