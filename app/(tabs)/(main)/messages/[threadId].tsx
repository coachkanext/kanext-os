/**
 * Thread View — Full-screen chat with bubbles, timestamps, date separators, and composer.
 * Always-dark. Supports DM threads (with messages) and rooms (empty state).
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ChatComposer } from '@/components/messages/chat-composer';
import {
  getDMThreadMessages,
  SPORTS_DM_THREADS,
  SPORTS_ROOMS,
  ROOM_CATEGORY_LABELS,
} from '@/data/mock-sports-messages';
import type { SportsMessage } from '@/data/mock-sports-messages';

// Always-dark palette
const C = {
  bg: '#000000',
  surface: '#0B0F14',
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  placeholder: '#52525B',
};


/** Extract HH:MM from ISO timestamp */
function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/** Format date for separator labels */
function formatDateLabel(isoString: string): string {
  const d = new Date(isoString);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Group messages by calendar day */
function groupByDay(messages: SportsMessage[]): { label: string; messages: SportsMessage[] }[] {
  const groups: { label: string; messages: SportsMessage[] }[] = [];
  let currentDay = '';

  for (const msg of messages) {
    const day = new Date(msg.timestamp).toDateString();
    if (day !== currentDay) {
      currentDay = day;
      groups.push({ label: formatDateLabel(msg.timestamp), messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }
  return groups;
}

// -- Date Separator -----------------------------------------------------------

function DateSeparator({ label }: { label: string }) {
  return (
    <View style={styles.dateSeparator}>
      <View style={styles.dateLine} />
      <Text style={styles.dateLabel}>{label}</Text>
      <View style={styles.dateLine} />
    </View>
  );
}

// -- Message Bubble -----------------------------------------------------------

function MessageBubble({ message }: { message: SportsMessage }) {
  const isSent = message.direction === 'sent';

  return (
    <View style={[styles.bubbleRow, { justifyContent: isSent ? 'flex-end' : 'flex-start' }]}>
      {!isSent && (
        <View style={styles.msgAvatar}>
          <Text style={styles.msgAvatarText}>{message.senderInitials}</Text>
        </View>
      )}
      <View style={[styles.bubble, isSent ? styles.sentBubble : styles.receivedBubble]}>
        {!isSent && (
          <Text style={styles.msgSender}>{message.sender}</Text>
        )}
        <Text style={[styles.msgBody, { color: isSent ? '#000000' : C.textPrimary }]}>
          {message.body}
        </Text>
        <Text style={[styles.msgTime, { color: isSent ? 'rgba(0,0,0,0.5)' : C.textSecondary }]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
}

// -- Room Empty State ---------------------------------------------------------

function RoomEmptyState({
  title,
  subtitle,
  initials,
}: {
  title: string;
  subtitle: string;
  initials: string;
}) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyAvatar}>
        <Text style={styles.emptyInitials}>{initials}</Text>
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
      <Text style={styles.emptyHint}>No messages yet</Text>
    </View>
  );
}

// -- Screen -------------------------------------------------------------------

export default function ThreadScreen() {
  const insets = useSafeAreaInsets();
  const { threadId, type, title } = useLocalSearchParams<{
    threadId: string;
    type: 'room' | 'dm';
    title: string;
  }>();

  const [inputText, setInputText] = useState('');

  // Resolve subtitle
  const subtitle = useMemo(() => {
    if (type === 'dm') {
      const thread = SPORTS_DM_THREADS.find((t) => t.id === threadId);
      return thread?.participantRole ?? '';
    }
    const room = SPORTS_ROOMS.find((r) => r.id === threadId);
    if (!room) return '';
    return `${ROOM_CATEGORY_LABELS[room.category]} \u00B7 ${room.memberCount} members`;
  }, [threadId, type]);

  // Resolve room info for empty state
  const room = useMemo(
    () => (type === 'room' ? SPORTS_ROOMS.find((r) => r.id === threadId) : null),
    [threadId, type],
  );

  // Get messages (DM threads have messages, rooms don't in mock data)
  const messages = useMemo(() => getDMThreadMessages(threadId ?? ''), [threadId]);

  // Group by day for rendering
  const dayGroups = useMemo(() => groupByDay(messages), [messages]);

  // Build flat list data: interleave date separators + messages, reversed for inverted FlatList
  type FlatItem =
    | { type: 'separator'; label: string; key: string }
    | { type: 'message'; message: SportsMessage; key: string };

  const flatData = useMemo(() => {
    const items: FlatItem[] = [];
    for (const group of dayGroups) {
      items.push({ type: 'separator', label: group.label, key: `sep-${group.label}` });
      for (const msg of group.messages) {
        items.push({ type: 'message', message: msg, key: msg.id });
      }
    }
    // Reverse for inverted FlatList (newest at bottom)
    return items.reverse();
  }, [dayGroups]);

  const hasMessages = messages.length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Thread info */}
      <View style={styles.threadInfo}>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text style={styles.headerSubtitle} numberOfLines={1}>{subtitle}</Text>
        ) : null}
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
      >
        {hasMessages ? (
          <FlatList
            data={flatData}
            keyExtractor={(item) => item.key}
            inverted
            renderItem={({ item }) => {
              if (item.type === 'separator') {
                return <DateSeparator label={item.label} />;
              }
              return <MessageBubble message={item.message} />;
            }}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.flex1}>
            {room && (
              <RoomEmptyState
                title={title ?? ''}
                subtitle={`${ROOM_CATEGORY_LABELS[room.category]} \u00B7 ${room.memberCount} members`}
                initials={room.avatarInitials}
              />
            )}
          </View>
        )}

        {/* Composer */}
        <View style={[styles.composerWrap, { paddingBottom: insets.bottom || 12 }]}>
          <ChatComposer
            value={inputText}
            onChangeText={setInputText}
            onSend={() => setInputText('')}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// -- Styles -------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  flex1: {
    flex: 1,
  },

  // Thread info
  threadInfo: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 1,
  },

  // Message list
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },

  // Date separator
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  dateLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.surface,
  },
  dateLabel: {
    fontSize: 11,
    color: C.placeholder,
    fontWeight: '500',
  },

  // Bubbles
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 8,
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgAvatarText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textSecondary,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  sentBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: C.surface,
    borderBottomLeftRadius: 4,
  },
  msgSender: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textSecondary,
    marginBottom: 2,
  },
  msgBody: {
    fontSize: 15,
    lineHeight: 20,
  },
  msgTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyInitials: {
    fontSize: 22,
    fontWeight: '700',
    color: C.textPrimary,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: C.textSecondary,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: C.placeholder,
  },

  // Composer
  composerWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.surface,
  },
});
