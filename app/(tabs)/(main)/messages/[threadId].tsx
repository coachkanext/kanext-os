/**
 * Thread View — Universal chat (channels + DMs).
 * Features: sender avatars (channels), read receipts (DMs), reaction bar,
 * thread slide-over panel, thread indicators, @mentions picker,
 * typing indicator, voice note playback, long-press context menus.
 */

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Animated,
  Platform,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ChatComposer, VoiceNoteBubble } from '@/components/messages/chat-composer';
import type { VoiceNotePayload } from '@/components/messages/chat-composer';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useMode } from '@/context/app-context';
import {
  getRoomMessages,
  getRooms,
  getGlobalDMs,
  getDMMessages,
  getChannelMembers,
  formatMessageTime,
} from '@/data/mock-messages-v3';
import type { RoomMessageV3 } from '@/types';
import type { ChannelMember } from '@/data/mock-messages-v3';

const { width: SCREEN_W } = Dimensions.get('window');

const C = {
  bg: '#000000',
  secondaryBg: '#1C1C1E',
  otherBubble: '#0B0F14',
  label: '#FFFFFF',
  secondaryLabel: '#8E8E93',
  separator: '#38383A',
};

const BUBBLE_R = 18;
const TAIL_R = 4;
const FIFTEEN_MIN = 15 * 60 * 1000;
const ONE_MIN = 60 * 1000;
const REACTIONS = ['\uD83D\uDC4D', '\u2764\uFE0F', '\uD83D\uDD25', '\u2705', '\uD83D\uDC40'];

// ─── Timestamp formatting ───────────────────────────────────────────────────

function formatTimestampLabel(date: Date): string {
  const now = new Date();
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (date.toDateString() === now.toDateString()) return time;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday ${time}`;
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (diffDays < 7) return `${date.toLocaleDateString([], { weekday: 'long' })} ${time}`;
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} ${time}`;
}

// ─── Message processing ─────────────────────────────────────────────────────

type DisplayItem =
  | { type: 'timestamp'; label: string; key: string }
  | {
      type: 'message';
      message: RoomMessageV3;
      isGroupStart: boolean;
      isGroupEnd: boolean;
      isLastSent: boolean;
      key: string;
    };

function processMessages(messages: RoomMessageV3[]): DisplayItem[] {
  const items: DisplayItem[] = [];

  let lastSentId: string | null = null;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].isMe) { lastSentId = messages[i].id; break; }
  }

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const prev = i > 0 ? messages[i - 1] : null;
    const next = i < messages.length - 1 ? messages[i + 1] : null;

    const timeDiff = prev
      ? msg.timestamp.getTime() - prev.timestamp.getTime()
      : Infinity;
    const dayChanged = prev
      ? msg.timestamp.toDateString() !== prev.timestamp.toDateString()
      : true;
    const showTimestamp = dayChanged || timeDiff > FIFTEEN_MIN;

    if (showTimestamp) {
      items.push({ type: 'timestamp', label: formatTimestampLabel(msg.timestamp), key: `ts-${msg.id}` });
    }

    const sameAsNext = next && next.isMe === msg.isMe && next.sender === msg.sender &&
      next.timestamp.getTime() - msg.timestamp.getTime() < ONE_MIN;
    const sameAsPrev = prev && prev.isMe === msg.isMe && prev.sender === msg.sender &&
      msg.timestamp.getTime() - prev.timestamp.getTime() < ONE_MIN && !showTimestamp;

    items.push({
      type: 'message',
      message: msg,
      isGroupStart: !sameAsPrev,
      isGroupEnd: !sameAsNext,
      isLastSent: msg.id === lastSentId,
      key: msg.id,
    });
  }

  return items.reverse();
}

// ─── Typing Indicator ───────────────────────────────────────────────────────

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
      );
    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 200);
    const a3 = animate(dot3, 400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={tiStyles.container}>
      <View style={tiStyles.bubble}>
        <Animated.View style={[tiStyles.dot, { opacity: dot1 }]} />
        <Animated.View style={[tiStyles.dot, { opacity: dot2 }]} />
        <Animated.View style={[tiStyles.dot, { opacity: dot3 }]} />
      </View>
    </View>
  );
}

const tiStyles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'flex-start', paddingHorizontal: 16, marginBottom: 8 },
  bubble: {
    flexDirection: 'row', gap: 4, backgroundColor: C.otherBubble,
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.secondaryLabel },
});

// ─── @Mentions Picker ───────────────────────────────────────────────────────

function MentionsPicker({
  query,
  members,
  onSelect,
}: {
  query: string;
  members: ChannelMember[];
  onSelect: (name: string) => void;
}) {
  const filtered = useMemo(() => {
    if (!query) return members;
    const q = query.toLowerCase();
    return members.filter((m) => m.name.toLowerCase().includes(q));
  }, [query, members]);

  if (filtered.length === 0) return null;

  return (
    <View style={mpStyles.container}>
      {filtered.slice(0, 5).map((m) => (
        <Pressable key={m.name} style={mpStyles.row} onPress={() => onSelect(m.name)}>
          <View style={mpStyles.avatar}>
            <Text style={mpStyles.initials}>{m.initials}</Text>
          </View>
          <View style={mpStyles.info}>
            <Text style={mpStyles.name}>{m.name}</Text>
            <Text style={mpStyles.role}>{m.role}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const mpStyles = StyleSheet.create({
  container: {
    backgroundColor: '#2C2C2E', borderRadius: 12, marginHorizontal: 12,
    marginBottom: 4, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#48484A',
  },
  avatar: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#1C1C1E',
    alignItems: 'center', justifyContent: 'center',
  },
  initials: { fontSize: 10, fontWeight: '600', color: C.label },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: C.label },
  role: { fontSize: 11, color: C.secondaryLabel },
});

// ─── Reaction Bar ───────────────────────────────────────────────────────────

function ReactionBar({
  pageY,
  onSelect,
  onClose,
}: {
  pageY: number;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  const dismiss = useCallback(() => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true })
      .start(() => onClose());
  }, [fadeAnim, onClose]);

  return (
    <Modal transparent animationType="none" onRequestClose={dismiss}>
      <Pressable style={rbStyles.backdrop} onPress={dismiss}>
        <Animated.View
          style={[
            rbStyles.bar,
            { top: Math.max(60, pageY - 50), opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {REACTIONS.map((emoji) => (
            <Pressable
              key={emoji}
              style={rbStyles.reactionBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelect(emoji);
                dismiss();
              }}
            >
              <Text style={rbStyles.emoji}>{emoji}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const rbStyles = StyleSheet.create({
  backdrop: { flex: 1 },
  bar: {
    position: 'absolute', alignSelf: 'center',
    flexDirection: 'row', backgroundColor: '#2C2C2E', borderRadius: 24,
    paddingHorizontal: 8, paddingVertical: 6, gap: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 10,
  },
  reactionBtn: { width: 40, height: 36, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 22 },
});

// ─── Thread Slide-Over Panel ────────────────────────────────────────────────

function ThreadPanel({
  parentMessage,
  replies,
  accent,
  onClose,
}: {
  parentMessage: RoomMessageV3;
  replies: RoomMessageV3[];
  accent: string;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SCREEN_W)).current;
  const dimAnim = useRef(new Animated.Value(0)).current;
  const [threadInput, setThreadInput] = useState('');

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 14, useNativeDriver: true }),
      Animated.timing(dimAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  const close = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: SCREEN_W, duration: 200, useNativeDriver: true }),
      Animated.timing(dimAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onClose());
  }, [slideAnim, dimAnim, onClose]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Dimmed backdrop over channel */}
      <Animated.View style={[tpStyles.dim, { opacity: dimAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      {/* Slide-over panel */}
      <Animated.View
        style={[tpStyles.panel, { transform: [{ translateX: slideAnim }], paddingTop: insets.top }]}
      >
        {/* Thread header */}
        <View style={tpStyles.header}>
          <Pressable onPress={close} style={tpStyles.closeBtn}>
            <IconSymbol name="xmark" size={16} color={C.label} />
          </Pressable>
          <Text style={tpStyles.headerTitle}>Thread</Text>
          <Text style={tpStyles.replyCount}>{replies.length} {replies.length === 1 ? 'reply' : 'replies'}</Text>
        </View>

        {/* Parent message */}
        <View style={tpStyles.parentMsg}>
          <View style={tpStyles.senderRow}>
            <View style={tpStyles.senderAvatar}>
              <Text style={tpStyles.senderAvatarText}>{parentMessage.initials}</Text>
            </View>
            <Text style={tpStyles.senderName}>{parentMessage.sender}</Text>
            <Text style={tpStyles.msgTime}>{formatMessageTime(parentMessage.timestamp)}</Text>
          </View>
          <Text style={tpStyles.msgContent}>{parentMessage.content}</Text>
          {parentMessage.voiceNote && (
            <VoiceNoteBubble
              duration={parentMessage.voiceNote.duration}
              transcript={parentMessage.voiceNote.transcript}
              accent={accent}
            />
          )}
        </View>

        <View style={tpStyles.divider} />

        {/* Replies */}
        <FlatList
          data={replies}
          keyExtractor={(m) => m.id}
          style={tpStyles.replyList}
          renderItem={({ item }) => (
            <View style={tpStyles.replyRow}>
              <View style={tpStyles.replySenderAvatar}>
                <Text style={tpStyles.replySenderText}>{item.initials}</Text>
              </View>
              <View style={tpStyles.replyContent}>
                <View style={tpStyles.replyHeader}>
                  <Text style={tpStyles.replySenderName}>{item.sender}</Text>
                  <Text style={tpStyles.replyTime}>{formatMessageTime(item.timestamp)}</Text>
                </View>
                <Text style={tpStyles.replyBody}>{item.content}</Text>
              </View>
            </View>
          )}
        />

        {/* Reply composer */}
        <View style={[tpStyles.composerWrap, { paddingBottom: (insets.bottom || 12) + 8 }]}>
          <ChatComposer
            value={threadInput}
            onChangeText={setThreadInput}
            onSend={() => setThreadInput('')}
            accent={accent}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const tpStyles = StyleSheet.create({
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.50)' },
  panel: {
    position: 'absolute', top: 0, bottom: 0, right: 0, width: SCREEN_W * 0.88,
    backgroundColor: '#0A0A0A', borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: '#38383A',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, gap: 10,
  },
  closeBtn: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#2C2C2E',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: C.label, flex: 1 },
  replyCount: { fontSize: 13, color: C.secondaryLabel },
  parentMsg: {
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#111111',
  },
  senderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  senderAvatar: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#2C2C2E',
    alignItems: 'center', justifyContent: 'center',
  },
  senderAvatarText: { fontSize: 9, fontWeight: '600', color: C.label },
  senderName: { fontSize: 14, fontWeight: '600', color: C.label },
  msgTime: { fontSize: 11, color: C.secondaryLabel },
  msgContent: { fontSize: 15, color: C.label, lineHeight: 20 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator },
  replyList: { flex: 1 },
  replyRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 10,
  },
  replySenderAvatar: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#2C2C2E',
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  replySenderText: { fontSize: 9, fontWeight: '600', color: C.label },
  replyContent: { flex: 1 },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  replySenderName: { fontSize: 13, fontWeight: '600', color: C.label },
  replyTime: { fontSize: 11, color: C.secondaryLabel },
  replyBody: { fontSize: 14, color: C.label, lineHeight: 19 },
  composerWrap: {
    paddingHorizontal: 12, paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator,
  },
});

// ─── Long-Press Context Menu ────────────────────────────────────────────────

type ContextMenuData = {
  message: RoomMessageV3;
  isSent: boolean;
  isChannel: boolean;
  bubbleColor: string;
  pageY: number;
};

function ContextMenu({
  data,
  accent,
  onClose,
}: {
  data: ContextMenuData;
  accent: string;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 120, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const dismiss = useCallback(() => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true })
      .start(() => onClose());
  }, [fadeAnim, onClose]);

  const actions = data.isChannel
    ? [
        { key: 'thread', label: 'Reply in Thread', icon: 'arrowshape.turn.up.left.fill' },
        { key: 'react', label: 'React', icon: 'face.smiling.fill' },
        { key: 'pin', label: 'Pin', icon: 'pin.fill' },
        { key: 'copy', label: 'Copy', icon: 'doc.on.doc.fill' },
        ...(data.isSent ? [{ key: 'edit', label: 'Edit', icon: 'pencil' }] : []),
        ...(data.isSent ? [{ key: 'delete', label: 'Delete', icon: 'trash.fill', destructive: true }] : []),
      ]
    : [
        { key: 'react', label: 'React', icon: 'face.smiling.fill' },
        { key: 'copy', label: 'Copy', icon: 'doc.on.doc.fill' },
        ...(data.isSent ? [{ key: 'delete', label: 'Delete', icon: 'trash.fill', destructive: true }] : []),
      ];

  const bubbleTop = Math.max(insets.top + 60, Math.min(data.pageY - 20, 300));

  return (
    <Modal transparent animationType="none" onRequestClose={dismiss}>
      <Animated.View style={[cmStyles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={cmStyles.backdrop} onPress={dismiss} />
        <Animated.View
          style={[
            cmStyles.content,
            {
              transform: [{ scale: scaleAnim }], top: bubbleTop,
              alignItems: data.isSent ? 'flex-end' : 'flex-start',
            },
          ]}
        >
          <Text style={cmStyles.timestamp}>{formatTimestampLabel(data.message.timestamp)}</Text>
          <View style={[cmStyles.bubble, { backgroundColor: data.bubbleColor, borderRadius: BUBBLE_R }]}>
            {data.message.voiceNote ? (
              <VoiceNoteBubble
                duration={data.message.voiceNote.duration}
                transcript={data.message.voiceNote.transcript}
                accent={accent}
              />
            ) : (
              <Text style={cmStyles.bubbleText}>{data.message.content}</Text>
            )}
          </View>
          <View style={cmStyles.menu}>
            {actions.map((action, idx) => (
              <Pressable
                key={action.key}
                style={[cmStyles.menuItem, idx < actions.length - 1 && cmStyles.menuItemBorder]}
                onPress={dismiss}
              >
                <Text style={[cmStyles.menuLabel, (action as any).destructive && cmStyles.menuLabelDest]}>
                  {action.label}
                </Text>
                <IconSymbol
                  name={action.icon as any}
                  size={16}
                  color={(action as any).destructive ? '#FF3B30' : C.label}
                />
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const cmStyles = StyleSheet.create({
  overlay: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.60)' },
  content: { position: 'absolute', left: 16, right: 16 },
  timestamp: {
    fontSize: 12, fontWeight: '500', color: C.secondaryLabel,
    textAlign: 'center', alignSelf: 'center', marginBottom: 8,
  },
  bubble: { maxWidth: '78%', paddingHorizontal: 12, paddingVertical: 8 },
  bubbleText: { fontSize: 16, lineHeight: 21, color: C.label },
  menu: {
    marginTop: 8, backgroundColor: '#2C2C2E', borderRadius: 14,
    overflow: 'hidden', minWidth: 200, maxWidth: 260,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 16,
  },
  menuItemBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#48484A' },
  menuLabel: { fontSize: 16, color: C.label },
  menuLabelDest: { color: '#FF3B30' },
});

// ─── Message Bubble ─────────────────────────────────────────────────────────

function MessageBubble({
  item,
  accent,
  isChannel,
  onTap,
  onLongPress,
  onThreadTap,
}: {
  item: Extract<DisplayItem, { type: 'message' }>;
  accent: string;
  isChannel: boolean;
  onTap: (msgId: string, pageY: number) => void;
  onLongPress: (data: ContextMenuData) => void;
  onThreadTap: (msg: RoomMessageV3) => void;
}) {
  const { message, isGroupEnd, isGroupStart, isLastSent } = item;
  const isSent = message.isMe;
  const bubbleRef = useRef<View>(null);

  const accentBg = `${accent}2E`; // 18% opacity

  const bubbleRadii = {
    borderTopLeftRadius: BUBBLE_R,
    borderTopRightRadius: BUBBLE_R,
    borderBottomLeftRadius: isSent ? BUBBLE_R : isGroupEnd ? TAIL_R : BUBBLE_R,
    borderBottomRightRadius: isSent ? (isGroupEnd ? TAIL_R : BUBBLE_R) : BUBBLE_R,
  };

  const bubbleColor = isSent ? accentBg : C.otherBubble;

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    bubbleRef.current?.measureInWindow((_x, y) => {
      onLongPress({ message, isSent, isChannel, bubbleColor, pageY: y });
    });
  };

  const handleTap = () => {
    bubbleRef.current?.measureInWindow((_x, y) => {
      onTap(message.id, y);
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
        {/* Sender avatar (channel only, on other's messages) */}
        {isChannel && !isSent && isGroupStart ? (
          <View style={styles.senderAvatar}>
            <Text style={styles.senderAvatarText}>{message.initials}</Text>
          </View>
        ) : isChannel && !isSent ? (
          <View style={styles.senderAvatarSpacer} />
        ) : null}

        <View style={{ maxWidth: '78%' }}>
          {/* Sender name (channel only, first in group) */}
          {isChannel && !isSent && isGroupStart && (
            <Text style={styles.senderNameLabel}>{message.sender}</Text>
          )}

          <Pressable
            ref={bubbleRef}
            onPress={handleTap}
            onLongPress={handleLongPress}
            delayLongPress={400}
          >
            <View style={[styles.bubble, { backgroundColor: bubbleColor, ...bubbleRadii }]}>
              {message.voiceNote ? (
                <VoiceNoteBubble
                  duration={message.voiceNote.duration}
                  transcript={message.voiceNote.transcript}
                  accent={accent}
                />
              ) : (
                <Text style={styles.bubbleText}>{message.content}</Text>
              )}
            </View>
          </Pressable>

          {/* Existing reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <View style={styles.reactionsRow}>
              {message.reactions.map((r) => (
                <View key={r.emoji} style={[styles.reactionChip, r.byMe && { borderColor: accent }]}>
                  <Text style={styles.reactionEmoji}>{r.emoji}</Text>
                  <Text style={styles.reactionCount}>{r.count}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Thread indicator */}
          {message.replyCount && message.replyCount > 0 && (
            <Pressable style={styles.threadIndicator} onPress={() => onThreadTap(message)}>
              <IconSymbol name="arrowshape.turn.up.left.fill" size={12} color={accent} />
              <Text style={[styles.threadText, { color: accent }]}>
                {message.replyCount} {message.replyCount === 1 ? 'reply' : 'replies'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Read receipt (DM only) */}
      {!isChannel && isLastSent && (
        <Text style={styles.readReceipt}>Delivered</Text>
      )}
    </View>
  );
}

// ─── Empty States ───────────────────────────────────────────────────────────

function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySub}>{subtitle}</Text>}
      <Text style={styles.emptyHint}>No messages yet</Text>
    </View>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function ThreadScreen() {
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();
  const mode = useMode();
  const router = useRouter();
  const { threadId, type, title } = useLocalSearchParams<{
    threadId: string;
    type: 'channel' | 'dm';
    title: string;
  }>();

  const isChannel = type === 'channel';

  const [inputText, setInputText] = useState('');
  const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);
  const [reactionTarget, setReactionTarget] = useState<{ messageId: string; pageY: number } | null>(null);
  const [threadPanel, setThreadPanel] = useState<RoomMessageV3 | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);

  // Simulate typing indicator for DMs (show for 3s then hide, repeating)
  const [showTyping, setShowTyping] = useState(false);
  useEffect(() => {
    if (isChannel) return;
    // Simulate someone typing periodically
    const timer = setTimeout(() => setShowTyping(true), 2000);
    const hideTimer = setTimeout(() => setShowTyping(false), 5000);
    return () => { clearTimeout(timer); clearTimeout(hideTimer); };
  }, [isChannel]);

  // Get messages
  const messages = useMemo(() => {
    if (isChannel) return getRoomMessages(threadId ?? '');
    return getDMMessages(threadId ?? '');
  }, [threadId, isChannel]);

  const displayItems = useMemo(() => processMessages(messages), [messages]);
  const hasMessages = messages.length > 0;

  // Get channel members for @mentions
  const channelMembers = useMemo(() => {
    if (!isChannel) return [];
    return getChannelMembers(threadId ?? '');
  }, [threadId, isChannel]);

  // Header info
  const headerInfo = useMemo(() => {
    if (isChannel) {
      const rooms = getRooms(mode);
      const room = rooms.find((r) => r.id === threadId);
      return {
        subtitle: room ? `${room.memberCount} members` : '',
        initials: room?.initials ?? (title ?? '').substring(0, 2).toUpperCase(),
      };
    }
    const dm = getGlobalDMs().find((t) => t.id === threadId);
    return {
      subtitle: dm?.role ?? '',
      initials: dm?.initials ?? (title ?? '').charAt(0),
    };
  }, [threadId, isChannel, mode, title]);

  const handleTap = (messageId: string, pageY: number) => {
    setReactionTarget({ messageId, pageY });
  };

  const handleReactionSelect = (emoji: string) => {
    setReactionTarget(null);
  };

  const handleMentionSelect = (name: string) => {
    // Replace @query with @name
    const lastAt = inputText.lastIndexOf('@');
    if (lastAt !== -1) {
      setInputText(inputText.substring(0, lastAt) + `@${name} `);
    }
    setMentionQuery(null);
  };

  const handleVoiceNote = (note: VoiceNotePayload) => {
    // In production this would append a voice message to the conversation
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.navBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={22} color={accent} />
        </Pressable>

        <View style={styles.navCenter}>
          <View
            style={[
              styles.navAvatar,
              isChannel && { borderRadius: 8, backgroundColor: '#0B1220' },
            ]}
          >
            <Text style={styles.navAvatarText}>{headerInfo.initials}</Text>
          </View>
          <View>
            <Text style={styles.navTitle} numberOfLines={1}>{title}</Text>
            {headerInfo.subtitle ? (
              <Text style={styles.navSubtitle} numberOfLines={1}>{headerInfo.subtitle}</Text>
            ) : null}
          </View>
        </View>

        {isChannel ? (
          <Pressable style={styles.navRight}>
            <IconSymbol name="pin.fill" size={16} color={accent} />
          </Pressable>
        ) : (
          <>
            <Pressable style={styles.navRight}>
              <IconSymbol name="phone.fill" size={18} color={accent} />
            </Pressable>
            <Pressable style={styles.navRight}>
              <IconSymbol name="video.fill" size={18} color={accent} />
            </Pressable>
          </>
        )}
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
                return (
                  <View style={styles.timestampWrap}>
                    <Text style={styles.timestampText}>{item.label}</Text>
                  </View>
                );
              }
              return (
                <MessageBubble
                  item={item}
                  accent={accent}
                  isChannel={isChannel}
                  onTap={handleTap}
                  onLongPress={setContextMenu}
                  onThreadTap={setThreadPanel}
                />
              );
            }}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              !isChannel && showTyping ? <TypingIndicator /> : null
            }
          />
        ) : (
          <View style={styles.flex1}>
            <EmptyState
              title={title ?? ''}
              subtitle={isChannel ? headerInfo.subtitle : undefined}
            />
          </View>
        )}

        {/* ── @Mentions picker ── */}
        {mentionQuery !== null && isChannel && (
          <MentionsPicker
            query={mentionQuery}
            members={channelMembers}
            onSelect={handleMentionSelect}
          />
        )}

        {/* ── Composer ── */}
        <View style={[styles.composerWrap, { paddingBottom: (insets.bottom || 12) + 49 }]}>
          <ChatComposer
            value={inputText}
            onChangeText={setInputText}
            onSend={() => setInputText('')}
            onVoiceNote={handleVoiceNote}
            accent={accent}
            onMentionTrigger={isChannel ? setMentionQuery : undefined}
          />
        </View>
      </KeyboardAvoidingView>

      {/* ── Reaction bar ── */}
      {reactionTarget && (
        <ReactionBar
          pageY={reactionTarget.pageY}
          onSelect={handleReactionSelect}
          onClose={() => setReactionTarget(null)}
        />
      )}

      {/* ── Long-press context menu ── */}
      {contextMenu && (
        <ContextMenu
          data={contextMenu}
          accent={accent}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* ── Thread slide-over panel ── */}
      {threadPanel && (
        <ThreadPanel
          parentMessage={threadPanel}
          replies={threadPanel.threadReplies ?? []}
          accent={accent}
          onClose={() => setThreadPanel(null)}
        />
      )}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  flex1: { flex: 1 },

  // Nav bar
  navBar: { flexDirection: 'row', alignItems: 'center', height: 44, paddingHorizontal: 8 },
  backBtn: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  navCenter: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 8,
  },
  navAvatar: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: C.secondaryBg,
    alignItems: 'center', justifyContent: 'center',
  },
  navAvatarText: { fontSize: 11, fontWeight: '600', color: C.secondaryLabel },
  navTitle: { fontSize: 16, fontWeight: '600', color: C.label },
  navSubtitle: { fontSize: 11, color: C.secondaryLabel },
  navRight: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' },

  // Messages
  messageList: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  timestampWrap: { alignItems: 'center', paddingVertical: 12 },
  timestampText: { fontSize: 12, fontWeight: '500', color: C.secondaryLabel },

  // Bubble
  bubbleRow: { flexDirection: 'row', paddingHorizontal: 0 },
  bubble: { paddingHorizontal: 12, paddingVertical: 8 },
  bubbleText: { fontSize: 16, lineHeight: 21, color: C.label },
  readReceipt: {
    fontSize: 11, color: C.secondaryLabel, alignSelf: 'flex-end',
    marginRight: 4, marginBottom: 4,
  },

  // Sender (channel)
  senderAvatar: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#2C2C2E',
    alignItems: 'center', justifyContent: 'center', marginRight: 6, marginTop: 2,
  },
  senderAvatarText: { fontSize: 10, fontWeight: '600', color: C.label },
  senderAvatarSpacer: { width: 34 },
  senderNameLabel: {
    fontSize: 12, fontWeight: '600', color: C.secondaryLabel, marginBottom: 2, marginLeft: 2,
  },

  // Reactions
  reactionsRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4, marginLeft: 2,
  },
  reactionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#1C1C1E', borderRadius: 12,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: 'transparent',
  },
  reactionEmoji: { fontSize: 14 },
  reactionCount: { fontSize: 12, color: C.secondaryLabel, fontWeight: '500' },

  // Thread indicator
  threadIndicator: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 4, marginLeft: 2, paddingVertical: 4,
  },
  threadText: { fontSize: 12, fontWeight: '600' },

  // Empty
  emptyContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.label, marginBottom: 4 },
  emptySub: { fontSize: 14, color: C.secondaryLabel, marginBottom: 8 },
  emptyHint: { fontSize: 14, color: '#48484A' },

  // Composer
  composerWrap: {
    paddingHorizontal: 12, paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator,
  },
});
