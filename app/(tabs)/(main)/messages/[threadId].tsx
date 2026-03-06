/**
 * Thread View — iOS Messages-style chat.
 * Grouped bubbles with tails, centered timestamps, read receipts.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Animated,
  Platform,
  StyleSheet,
  Clipboard,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ChatComposer } from '@/components/messages/chat-composer';
import { useAccentColor } from '@/hooks/use-accent-color';
import {
  getDMThreadMessages,
  SPORTS_DM_THREADS,
  SPORTS_ROOMS,
  ROOM_CATEGORY_LABELS,
} from '@/data/mock-sports-messages';
import type { SportsMessage } from '@/data/mock-sports-messages';

// iOS dark mode palette
const C = {
  bg: '#000000',
  secondaryBg: '#1C1C1E',
  label: '#FFFFFF',
  secondaryLabel: '#8E8E93',
  separator: '#38383A',
};

const BUBBLE_R = 18;
const TAIL_R = 4;
const FIFTEEN_MIN = 15 * 60 * 1000;
const ONE_MIN = 60 * 1000;

// ─── Timestamp formatting ───────────────────────────────────────────────────

function formatTimestampLabel(isoString: string): string {
  const d = new Date(isoString);
  const now = new Date();
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  if (d.toDateString() === now.toDateString()) return time;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday ${time}`;

  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diffDays < 7) {
    return `${d.toLocaleDateString([], { weekday: 'long' })} ${time}`;
  }

  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} ${time}`;
}

// ─── Message processing ─────────────────────────────────────────────────────

type DisplayItem =
  | { type: 'timestamp'; label: string; key: string }
  | {
      type: 'message';
      message: SportsMessage;
      isGroupStart: boolean;
      isGroupEnd: boolean;
      isLastSent: boolean;
      key: string;
    };

function processMessages(messages: SportsMessage[]): DisplayItem[] {
  const items: DisplayItem[] = [];

  // Find last sent message ID for read receipt
  let lastSentId: string | null = null;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].direction === 'sent') {
      lastSentId = messages[i].id;
      break;
    }
  }

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const prev = i > 0 ? messages[i - 1] : null;
    const next = i < messages.length - 1 ? messages[i + 1] : null;

    // Timestamp insertion
    const timeDiff = prev
      ? new Date(msg.timestamp).getTime() - new Date(prev.timestamp).getTime()
      : Infinity;
    const dayChanged = prev
      ? new Date(msg.timestamp).toDateString() !== new Date(prev.timestamp).toDateString()
      : true;
    const showTimestamp = dayChanged || timeDiff > FIFTEEN_MIN;

    if (showTimestamp) {
      items.push({
        type: 'timestamp',
        label: formatTimestampLabel(msg.timestamp),
        key: `ts-${msg.id}`,
      });
    }

    // Group detection — same direction within 1 minute
    const sameAsNext =
      next &&
      next.direction === msg.direction &&
      new Date(next.timestamp).getTime() - new Date(msg.timestamp).getTime() < ONE_MIN;
    const sameAsPrev =
      prev &&
      prev.direction === msg.direction &&
      new Date(msg.timestamp).getTime() - new Date(prev.timestamp).getTime() < ONE_MIN &&
      !showTimestamp;

    items.push({
      type: 'message',
      message: msg,
      isGroupStart: !sameAsPrev,
      isGroupEnd: !sameAsNext,
      isLastSent: msg.id === lastSentId,
      key: msg.id,
    });
  }

  return items.reverse(); // For inverted FlatList
}

// ─── Timestamp ──────────────────────────────────────────────────────────────

function TimestampLabel({ label }: { label: string }) {
  return (
    <View style={styles.timestampWrap}>
      <Text style={styles.timestampText}>{label}</Text>
    </View>
  );
}

// ─── Message Preview Overlay (iOS-style long-press) ─────────────────────────

type PreviewData = {
  message: SportsMessage;
  isSent: boolean;
  bubbleColor: string;
  bubbleRadii: {
    borderTopLeftRadius: number;
    borderTopRightRadius: number;
    borderBottomLeftRadius: number;
    borderBottomRightRadius: number;
  };
  pageY: number;
};

const MENU_ACTIONS = [
  { key: 'reply', label: 'Reply', icon: 'arrowshape.turn.up.left.fill' as const },
  { key: 'copy', label: 'Copy', icon: 'doc.on.doc.fill' as const },
  { key: 'forward', label: 'Forward', icon: 'arrowshape.turn.up.right.fill' as const },
  { key: 'delete', label: 'Delete', icon: 'trash.fill' as const, destructive: true },
];

function MessagePreview({
  data,
  accent,
  onClose,
}: {
  data: PreviewData;
  accent: string;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 120,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const dismiss = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => onClose());
  }, [fadeAnim, onClose]);

  const handleAction = useCallback(
    (key: string) => {
      if (key === 'copy') {
        Clipboard.setString(data.message.body);
      }
      // Reply, Forward, Delete — placeholder (no-op for now)
      dismiss();
    },
    [data.message.body, dismiss],
  );

  // Position the bubble roughly where it was, clamped to safe area
  const bubbleTop = Math.max(
    insets.top + 60,
    Math.min(data.pageY - 20, 300),
  );

  return (
    <Modal transparent animationType="none" onRequestClose={dismiss}>
      <Animated.View style={[pvStyles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={pvStyles.backdrop} onPress={dismiss} />

        <Animated.View
          style={[
            pvStyles.content,
            {
              transform: [{ scale: scaleAnim }],
              top: bubbleTop,
              alignItems: data.isSent ? 'flex-end' : 'flex-start',
            },
          ]}
        >
          {/* ── Timestamp above bubble ── */}
          <Text style={pvStyles.timestamp}>
            {formatTimestampLabel(data.message.timestamp)}
          </Text>

          {/* ── Focused bubble ── */}
          <View
            style={[
              pvStyles.bubble,
              {
                backgroundColor: data.bubbleColor,
                ...data.bubbleRadii,
              },
            ]}
          >
            <Text style={pvStyles.bubbleText}>{data.message.body}</Text>
          </View>

          {/* ── Context menu ── */}
          <View style={pvStyles.menu}>
            {MENU_ACTIONS.map((action, idx) => (
              <Pressable
                key={action.key}
                style={[
                  pvStyles.menuItem,
                  idx < MENU_ACTIONS.length - 1 && pvStyles.menuItemBorder,
                ]}
                onPress={() => handleAction(action.key)}
              >
                <Text
                  style={[
                    pvStyles.menuLabel,
                    action.destructive && pvStyles.menuLabelDestructive,
                  ]}
                >
                  {action.label}
                </Text>
                <IconSymbol
                  name={action.icon}
                  size={16}
                  color={action.destructive ? '#FF3B30' : C.label}
                />
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const pvStyles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.60)',
  },
  content: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
    color: C.secondaryLabel,
    textAlign: 'center',
    alignSelf: 'center',
    marginBottom: 8,
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 21,
    color: C.label,
  },
  menu: {
    marginTop: 8,
    backgroundColor: '#2C2C2E',
    borderRadius: 14,
    overflow: 'hidden',
    minWidth: 200,
    maxWidth: 260,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#48484A',
  },
  menuLabel: {
    fontSize: 16,
    color: C.label,
  },
  menuLabelDestructive: {
    color: '#FF3B30',
  },
});

// ─── Message Bubble ─────────────────────────────────────────────────────────

function MessageBubble({
  item,
  accent,
  onLongPress,
}: {
  item: Extract<DisplayItem, { type: 'message' }>;
  accent: string;
  onLongPress: (data: PreviewData) => void;
}) {
  const { message, isGroupEnd, isGroupStart, isLastSent } = item;
  const isSent = message.direction === 'sent';
  const bubbleRef = useRef<View>(null);

  const bubbleRadii = {
    borderTopLeftRadius: BUBBLE_R,
    borderTopRightRadius: BUBBLE_R,
    borderBottomLeftRadius: isSent ? BUBBLE_R : isGroupEnd ? TAIL_R : BUBBLE_R,
    borderBottomRightRadius: isSent ? (isGroupEnd ? TAIL_R : BUBBLE_R) : BUBBLE_R,
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    bubbleRef.current?.measureInWindow((_x, y) => {
      onLongPress({
        message,
        isSent,
        bubbleColor: isSent ? accent : C.secondaryBg,
        bubbleRadii,
        pageY: y,
      });
    });
  };

  return (
    <View>
      <View
        style={[
          styles.bubbleRow,
          { justifyContent: isSent ? 'flex-end' : 'flex-start' },
          { marginBottom: isGroupEnd ? 8 : 2 },
          isGroupStart && { marginTop: 4 },
        ]}
      >
        <Pressable
          ref={bubbleRef}
          onLongPress={handleLongPress}
          delayLongPress={400}
        >
          <View
            style={[
              styles.bubble,
              {
                backgroundColor: isSent ? accent : C.secondaryBg,
                ...bubbleRadii,
              },
            ]}
          >
            <Text style={styles.bubbleText}>{message.body}</Text>
          </View>
        </Pressable>
      </View>
      {isLastSent && (
        <Text style={styles.readReceipt}>
          {message.read ? 'Read' : 'Delivered'}
        </Text>
      )}
    </View>
  );
}

// ─── Empty States ───────────────────────────────────────────────────────────

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
      <Text style={styles.emptySub}>{subtitle}</Text>
      <Text style={styles.emptyHint}>No messages yet</Text>
    </View>
  );
}

function DMEmptyState({ name }: { name: string }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>{name}</Text>
      <Text style={styles.emptyHint}>Start a conversation</Text>
    </View>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function ThreadScreen() {
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();
  const router = useRouter();
  const { threadId, type, title } = useLocalSearchParams<{
    threadId: string;
    type: 'room' | 'dm';
    title: string;
  }>();

  const [inputText, setInputText] = useState('');
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  // Resolve initials for header avatar
  const initials = useMemo(() => {
    if (type === 'dm') {
      const thread = SPORTS_DM_THREADS.find((t) => t.id === threadId);
      return thread?.participantInitials ?? (title ?? '').charAt(0);
    }
    const room = SPORTS_ROOMS.find((r) => r.id === threadId);
    return room?.avatarInitials ?? (title ?? '').substring(0, 2).toUpperCase();
  }, [threadId, type, title]);

  // Resolve subtitle
  const subtitle = useMemo(() => {
    if (type === 'dm') {
      const thread = SPORTS_DM_THREADS.find((t) => t.id === threadId);
      return thread?.participantRole ?? '';
    }
    const room = SPORTS_ROOMS.find((r) => r.id === threadId);
    if (!room) return 'Group Room';
    return `${ROOM_CATEGORY_LABELS[room.category]} \u00B7 ${room.memberCount} members`;
  }, [threadId, type]);

  const room = useMemo(
    () => (type === 'room' ? SPORTS_ROOMS.find((r) => r.id === threadId) : null),
    [threadId, type],
  );

  const isRoom = type === 'room';
  const messages = useMemo(() => getDMThreadMessages(threadId ?? ''), [threadId]);
  const displayItems = useMemo(() => processMessages(messages), [messages]);
  const hasMessages = messages.length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.navBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={22} color={accent} />
        </Pressable>

        <View style={styles.navCenter}>
          <View style={styles.navAvatar}>
            <Text style={styles.navAvatarText}>{initials}</Text>
          </View>
          <Text style={styles.navTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <Pressable style={styles.navRight}>
          <IconSymbol name="phone.fill" size={18} color={accent} />
        </Pressable>
        <Pressable style={styles.navRight}>
          <IconSymbol name="video.fill" size={18} color={accent} />
        </Pressable>
      </View>

      {/* ── Chat ── */}
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 44}
      >
        {hasMessages ? (
          <FlatList
            data={displayItems}
            keyExtractor={(item) => item.key}
            inverted
            renderItem={({ item }) => {
              if (item.type === 'timestamp') {
                return <TimestampLabel label={item.label} />;
              }
              return (
                <MessageBubble
                  item={item}
                  accent={accent}
                  onLongPress={setPreviewData}
                />
              );
            }}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.flex1}>
            {isRoom ? (
              <RoomEmptyState
                title={title ?? ''}
                subtitle={
                  room
                    ? `${ROOM_CATEGORY_LABELS[room.category]} \u00B7 ${room.memberCount} members`
                    : 'Group Room'
                }
                initials={
                  room?.avatarInitials ??
                  (title ?? '').substring(0, 2).toUpperCase()
                }
              />
            ) : (
              <DMEmptyState name={title ?? 'New Conversation'} />
            )}
          </View>
        )}

        {/* ── Composer ── */}
        <View style={[styles.composerWrap, { paddingBottom: insets.bottom || 12 }]}>
          <ChatComposer
            value={inputText}
            onChangeText={setInputText}
            onSend={() => setInputText('')}
            accent={accent}
          />
        </View>
      </KeyboardAvoidingView>

      {/* ── iOS-style message preview on long press ── */}
      {previewData && (
        <MessagePreview
          data={previewData}
          accent={accent}
          onClose={() => setPreviewData(null)}
        />
      )}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  flex1: {
    flex: 1,
  },

  // Nav bar
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 8,
  },
  backBtn: {
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 8,
  },
  navAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.secondaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navAvatarText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.secondaryLabel,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: C.label,
  },
  navRight: {
    width: 36,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Messages
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  timestampWrap: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  timestampText: {
    fontSize: 12,
    fontWeight: '500',
    color: C.secondaryLabel,
  },
  bubbleRow: {
    flexDirection: 'row',
    paddingHorizontal: 0,
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 21,
    color: C.label,
  },
  readReceipt: {
    fontSize: 11,
    color: C.secondaryLabel,
    alignSelf: 'flex-end',
    marginRight: 4,
    marginBottom: 4,
  },

  // Empty states
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
    backgroundColor: C.secondaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyInitials: {
    fontSize: 22,
    fontWeight: '700',
    color: C.label,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.label,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 14,
    color: C.secondaryLabel,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#48484A',
  },

  // Composer
  composerWrap: {
    paddingHorizontal: 12,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.separator,
  },
});
