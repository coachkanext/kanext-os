/**
 * Messages — conversation list.
 * No header. No title. Content starts immediately below status bar.
 * Layout: Room bubbles → Search → Pinned section → DM list → FAB compose.
 */

import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Modal,
  Animated,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useMode } from '@/context/app-context';
import { NewDMSheet } from '@/components/messages/new-dm-sheet';
import { SPORTS_DM_THREADS } from '@/data/mock-sports-messages';
import type { SportsDMThread } from '@/data/mock-sports-messages';

const C = {
  bg: '#000000',
  surface: '#0B0F14',
  secondaryBg: '#1C1C1E',
  label: '#FFFFFF',
  secondaryLabel: '#8E8E93',
  placeholder: '#52525B',
  separator: '#38383A',
  red: '#FF3B30',
};

const ROOMS = [
  { id: 'rm-team', title: 'Team', initials: 'TM', unread: 3 },
  { id: 'rm-staff', title: 'Staff', initials: 'CS', unread: 1 },
  { id: 'rm-guards', title: 'Guards', initials: 'GD', unread: 0 },
  { id: 'rm-wings', title: 'Wings', initials: 'WG', unread: 2 },
  { id: 'rm-bigs', title: 'Bigs', initials: 'BG', unread: 0 },
  { id: 'rm-recruiting', title: 'Recruiting', initials: 'RC', unread: 4 },
];

// ─── Room Bubble ────────────────────────────────────────────────────────────

function RoomBubble({
  room,
  accent,
  onPress,
  onLongPress,
}: {
  room: (typeof ROOMS)[0];
  accent: string;
  onPress: () => void;
  onLongPress: (pageY: number) => void;
}) {
  const hasUnread = room.unread > 0;
  const ref = useRef<View>(null);
  const longPressedRef = useRef(false);
  return (
    <Pressable
      ref={ref}
      style={s.roomCell}
      onPress={() => {
        if (longPressedRef.current) {
          longPressedRef.current = false;
          return;
        }
        onPress();
      }}
      onLongPress={() => {
        longPressedRef.current = true;
        ref.current?.measureInWindow((_x, y) => onLongPress(y));
      }}
      delayLongPress={400}
    >
      <View
        style={[
          s.roomAvatar,
          hasUnread && { borderWidth: 2, borderColor: accent },
        ]}
      >
        <Text style={s.roomInitials}>{room.initials}</Text>
      </View>
      <Text style={s.roomLabel} numberOfLines={1}>
        {room.title}
      </Text>
    </Pressable>
  );
}

// ─── Preview Overlay (iOS-style long-press context menu) ─────────────────────

type PreviewData = {
  type: 'dm' | 'room' | 'pinned';
  title: string;
  subtitle: string;
  initials: string;
  pageY: number;
  actions: { key: string; label: string; icon: string; destructive?: boolean }[];
  onAction: (key: string) => void;
};

function PreviewOverlay({
  data,
  onClose,
}: {
  data: PreviewData;
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
      data.onAction(key);
      dismiss();
    },
    [data.onAction, dismiss],
  );

  const cardTop = Math.max(
    insets.top + 40,
    Math.min(data.pageY - 30, 340),
  );

  return (
    <Modal transparent animationType="none" onRequestClose={dismiss}>
      <Animated.View style={[pvS.overlay, { opacity: fadeAnim }]}>
        <Pressable style={pvS.backdrop} onPress={dismiss} />

        <Animated.View
          style={[
            pvS.content,
            {
              transform: [{ scale: scaleAnim }],
              top: cardTop,
            },
          ]}
        >
          {/* ── Conversation preview card ── */}
          <View style={pvS.previewCard}>
            <View style={pvS.previewAvatar}>
              <Text style={pvS.previewInitials}>{data.initials}</Text>
            </View>
            <View style={pvS.previewText}>
              <Text style={pvS.previewName} numberOfLines={1}>
                {data.title}
              </Text>
              <Text style={pvS.previewSub} numberOfLines={2}>
                {data.subtitle}
              </Text>
            </View>
          </View>

          {/* ── Context menu ── */}
          <View style={pvS.menu}>
            {data.actions.map((action, idx) => (
              <Pressable
                key={action.key}
                style={[
                  pvS.menuItem,
                  idx < data.actions.length - 1 && pvS.menuItemBorder,
                ]}
                onPress={() => handleAction(action.key)}
              >
                <Text
                  style={[
                    pvS.menuLabel,
                    action.destructive && pvS.menuLabelDestructive,
                  ]}
                >
                  {action.label}
                </Text>
                <IconSymbol
                  name={action.icon as any}
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

const pvS = StyleSheet.create({
  overlay: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.60)',
  },
  content: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 14,
    padding: 14,
    width: '100%',
    gap: 12,
  },
  previewAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.secondaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: C.label,
  },
  previewText: {
    flex: 1,
  },
  previewName: {
    fontSize: 17,
    fontWeight: '600',
    color: C.label,
    marginBottom: 2,
  },
  previewSub: {
    fontSize: 14,
    color: C.secondaryLabel,
    lineHeight: 19,
  },
  menu: {
    marginTop: 8,
    backgroundColor: '#2C2C2E',
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
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

// ─── DM Row (swipe-left = delete, long press = preview) ─────────────────────

function DMRow({
  thread,
  accent,
  isPinned,
  isMuted,
  onPress,
  onDeleteConfirmed,
  onToggleRead,
  onPin,
  onToggleMute,
  onShowPreview,
}: {
  thread: SportsDMThread;
  accent: string;
  isPinned: boolean;
  isMuted: boolean;
  onPress: () => void;
  onDeleteConfirmed: () => void;
  onToggleRead: () => void;
  onPin: () => void;
  onToggleMute: () => void;
  onShowPreview: (data: PreviewData) => void;
}) {
  const swipeRef = useRef<Swipeable>(null);
  const rowRef = useRef<View>(null);
  const longPressedRef = useRef(false);
  const hasUnread = thread.unreadCount > 0;

  const renderRightActions = () => (
    <Pressable
      style={[s.swipeAction, { backgroundColor: C.red }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onDeleteConfirmed();
        swipeRef.current?.close();
      }}
    >
      <IconSymbol name="trash.fill" size={22} color="#FFF" />
      <Text style={s.swipeLabel}>Delete</Text>
    </Pressable>
  );

  const handleLongPress = () => {
    longPressedRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const pinLabel = isPinned ? 'Unpin' : 'Pin';
    const readLabel = hasUnread ? 'Mark as Read' : 'Mark as Unread';
    const muteLabel = isMuted ? 'Show Alerts' : 'Hide Alerts';

    rowRef.current?.measureInWindow((_x, y) => {
      onShowPreview({
        type: 'dm',
        title: thread.participantName,
        subtitle: thread.lastMessagePreview,
        initials: thread.participantInitials,
        pageY: y,
        actions: [
          { key: 'pin', label: pinLabel, icon: 'pin.fill' },
          { key: 'read', label: readLabel, icon: 'envelope.fill' },
          { key: 'mute', label: muteLabel, icon: 'bell.slash.fill' },
          { key: 'delete', label: 'Delete', icon: 'trash.fill', destructive: true },
        ],
        onAction: (key) => {
          if (key === 'pin') onPin();
          else if (key === 'read') onToggleRead();
          else if (key === 'mute') onToggleMute();
          else if (key === 'delete') onDeleteConfirmed();
        },
      });
    });
  };

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      <Pressable
        ref={rowRef}
        style={s.dmRow}
        onPress={() => {
          if (longPressedRef.current) {
            longPressedRef.current = false;
            return;
          }
          onPress();
        }}
        onLongPress={handleLongPress}
        delayLongPress={400}
      >
        {/* Unread dot */}
        <View style={s.unreadCol}>
          {hasUnread && (
            <View style={[s.unreadDot, { backgroundColor: accent }]} />
          )}
        </View>

        {/* Avatar */}
        <View style={s.dmAvatar}>
          <Text style={s.dmAvatarText}>{thread.participantInitials}</Text>
        </View>

        {/* Content */}
        <View style={s.dmContent}>
          <View style={s.dmTopRow}>
            <Text
              style={[s.dmName, hasUnread && s.dmNameBold]}
              numberOfLines={1}
            >
              {thread.participantName}
            </Text>
            <Text style={s.dmTime}>{thread.lastMessageTime}</Text>
          </View>
          <Text style={s.dmPreview} numberOfLines={2}>
            {thread.lastMessagePreview}
          </Text>
        </View>
      </Pressable>
    </Swipeable>
  );
}

function RowSeparator() {
  return <View style={s.separator} />;
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function MessagesListScreen() {
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();
  const mode = useMode();
  const router = useRouter();

  const [threads, setThreads] = useState(SPORTS_DM_THREADS);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [mutedRoomIds, setMutedRoomIds] = useState<Set<string>>(new Set());
  const [mutedThreadIds, setMutedThreadIds] = useState<Set<string>>(new Set());
  const [roomUnreads, setRoomUnreads] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    ROOMS.forEach((r) => { init[r.id] = r.unread; });
    return init;
  });
  const [composeVisible, setComposeVisible] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  if (mode !== 'sports') {
    return (
      <View style={[s.container, s.comingSoon, { paddingTop: insets.top + 60 }]}>
        <IconSymbol name="envelope.fill" size={48} color={C.placeholder} />
        <Text style={s.comingSoonTitle}>Messages</Text>
        <Text style={s.comingSoonSub}>Coming Soon</Text>
      </View>
    );
  }

  const openRoom = (room: (typeof ROOMS)[0]) => {
    router.push({
      pathname: '/messages/[threadId]',
      params: { threadId: room.id, type: 'room', title: room.title },
    });
  };

  const openDM = (thread: SportsDMThread) => {
    router.push({
      pathname: '/messages/[threadId]',
      params: { threadId: thread.id, type: 'dm', title: thread.participantName },
    });
  };

  const handleComposeSend = (threadId: string) => {
    setComposeVisible(false);
    const thread = SPORTS_DM_THREADS.find((t) => t.id === threadId);
    if (thread) {
      router.push({
        pathname: '/messages/[threadId]',
        params: { threadId: thread.id, type: 'dm', title: thread.participantName },
      });
    }
  };

  const togglePin = (id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleRoomMute = (roomId: string) => {
    setMutedRoomIds((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId); else next.add(roomId);
      return next;
    });
  };

  const markRoomRead = (roomId: string) => {
    setRoomUnreads((prev) => ({ ...prev, [roomId]: 0 }));
  };

  const handleDeleteThread = (threadId: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
  };

  const handleToggleRead = (threadId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, unreadCount: t.unreadCount > 0 ? 0 : 1 } : t,
      ),
    );
  };

  const toggleThreadMute = (threadId: string) => {
    setMutedThreadIds((prev) => {
      const next = new Set(prev);
      if (next.has(threadId)) next.delete(threadId); else next.add(threadId);
      return next;
    });
  };

  const handleRoomLongPress = (room: (typeof ROOMS)[0], pageY: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const isPinned = pinnedIds.has(room.id);
    const isMuted = mutedRoomIds.has(room.id);
    const pinLabel = isPinned ? 'Unpin' : 'Pin';
    const muteLabel = isMuted ? 'Show Alerts' : 'Mute';

    setPreviewData({
      type: 'room',
      title: room.title,
      subtitle: 'Group Room',
      initials: room.initials,
      pageY,
      actions: [
        { key: 'pin', label: pinLabel, icon: 'pin.fill' },
        { key: 'mute', label: muteLabel, icon: 'bell.slash.fill' },
        { key: 'read', label: 'Mark as Read', icon: 'envelope.open.fill' },
      ],
      onAction: (key) => {
        if (key === 'pin') togglePin(room.id);
        else if (key === 'mute') toggleRoomMute(room.id);
        else if (key === 'read') markRoomRead(room.id);
      },
    });
  };

  // Split threads into pinned vs regular
  const pinnedThreads = useMemo(
    () => threads.filter((t) => pinnedIds.has(t.id)),
    [threads, pinnedIds],
  );
  const regularThreads = useMemo(
    () =>
      [...threads]
        .filter((t) => !pinnedIds.has(t.id))
        .sort(
          (a, b) =>
            new Date(b.lastMessageTimestamp).getTime() -
            new Date(a.lastMessageTimestamp).getTime(),
        ),
    [threads, pinnedIds],
  );

  const roomsWithState = useMemo(
    () => ROOMS.map((r) => ({ ...r, unread: roomUnreads[r.id] ?? r.unread })),
    [roomUnreads],
  );

  const renderDMRow = (item: SportsDMThread) => (
    <DMRow
      thread={item}
      accent={accent}
      isPinned={pinnedIds.has(item.id)}
      isMuted={mutedThreadIds.has(item.id)}
      onPress={() => openDM(item)}
      onDeleteConfirmed={() => handleDeleteThread(item.id)}
      onToggleRead={() => handleToggleRead(item.id)}
      onPin={() => togglePin(item.id)}
      onToggleMute={() => toggleThreadMute(item.id)}
      onShowPreview={setPreviewData}
    />
  );

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <ScrollView style={s.scrollView} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* ── Room bubbles (first thing visible) ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.roomsRow}
          style={s.roomsScroll}
        >
          {roomsWithState.map((room) => (
            <RoomBubble
              key={room.id}
              room={room}
              accent={accent}
              onPress={() => openRoom(room)}
              onLongPress={(pageY) => handleRoomLongPress(room, pageY)}
            />
          ))}
        </ScrollView>

        {/* ── Search bar ── */}
        <Pressable
          style={s.searchBar}
          onPress={() => Alert.alert('Coming Soon', 'Search is not yet available.')}
        >
          <IconSymbol name="magnifyingglass" size={15} color={C.placeholder} />
          <Text style={s.searchText}>Search messages...</Text>
        </Pressable>

        {/* ── Pinned bubbles (below search, above DMs) ── */}
        {pinnedThreads.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.pinnedRow}
          >
            {pinnedThreads.map((thread) => {
              const hasUnread = thread.unreadCount > 0;
              const pinnedRef = React.createRef<View>();
              const pinnedLongPressed = { current: false };
              return (
                <Pressable
                  key={thread.id}
                  ref={pinnedRef}
                  style={s.pinnedCell}
                  onPress={() => {
                    if (pinnedLongPressed.current) {
                      pinnedLongPressed.current = false;
                      return;
                    }
                    openDM(thread);
                  }}
                  onLongPress={() => {
                    pinnedLongPressed.current = true;
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    pinnedRef.current?.measureInWindow((_x, y) => {
                      setPreviewData({
                        type: 'pinned',
                        title: thread.participantName,
                        subtitle: thread.lastMessagePreview,
                        initials: thread.participantInitials,
                        pageY: y,
                        actions: [
                          { key: 'unpin', label: 'Unpin', icon: 'pin.slash.fill' },
                          { key: 'delete', label: 'Delete', icon: 'trash.fill', destructive: true },
                        ],
                        onAction: (key) => {
                          if (key === 'unpin') togglePin(thread.id);
                          else if (key === 'delete') handleDeleteThread(thread.id);
                        },
                      });
                    });
                  }}
                  delayLongPress={400}
                >
                  <View
                    style={[
                      s.pinnedAvatar,
                      hasUnread && { borderWidth: 2, borderColor: accent },
                    ]}
                  >
                    <Text style={s.pinnedInitials}>{thread.participantInitials}</Text>
                  </View>
                  <Text style={s.pinnedName} numberOfLines={1}>
                    {thread.participantName.split(' ')[0]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* ── DM list ── */}
        {regularThreads.map((item, i) => (
          <View key={item.id}>
            {i > 0 && <RowSeparator />}
            {renderDMRow(item)}
          </View>
        ))}
      </ScrollView>

      {/* ── FAB compose button ── */}
      <Pressable
        style={[s.fab, { backgroundColor: accent, bottom: insets.bottom + 60 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setComposeVisible(true);
        }}
      >
        <IconSymbol name="square.and.pencil" size={22} color="#FFFFFF" />
      </Pressable>

      {/* ── Compose sheet ── */}
      <NewDMSheet
        visible={composeVisible}
        onClose={() => setComposeVisible(false)}
        onSend={handleComposeSend}
        accent={accent}
      />

      {/* ── iOS-style preview overlay on long press ── */}
      {previewData && (
        <PreviewOverlay
          data={previewData}
          onClose={() => setPreviewData(null)}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollView: {
    flex: 1,
  },

  // Coming soon
  comingSoon: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.label,
    marginTop: 8,
  },
  comingSoonSub: {
    fontSize: 15,
    color: C.secondaryLabel,
  },

  // Rooms
  roomsScroll: {
    flexGrow: 0,
    marginTop: 8,
  },
  roomsRow: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 14,
  },
  roomCell: {
    alignItems: 'center',
    width: 64,
  },
  roomAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomInitials: {
    fontSize: 15,
    fontWeight: '700',
    color: C.label,
  },
  roomLabel: {
    fontSize: 11,
    color: C.secondaryLabel,
    textAlign: 'center',
    marginTop: 4,
  },

  // Pinned bubbles (distinct from room bubbles — larger, different bg)
  pinnedRow: {
    paddingHorizontal: 16,
    gap: 14,
    paddingBottom: 16,
  },
  pinnedCell: {
    alignItems: 'center',
    width: 72,
  },
  pinnedAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.secondaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinnedInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: C.label,
  },
  pinnedName: {
    fontSize: 11,
    color: C.label,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 5,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 10,
    marginHorizontal: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    marginBottom: 12,
  },
  searchText: {
    fontSize: 16,
    color: C.placeholder,
  },

  // Swipe actions
  swipeAction: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 4,
  },

  // DM row
  dmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingRight: 16,
    backgroundColor: C.bg,
  },
  unreadCol: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dmAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.secondaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dmAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.label,
  },
  dmContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  dmTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  dmName: {
    fontSize: 16,
    fontWeight: '400',
    color: C.label,
    flex: 1,
    marginRight: 8,
  },
  dmNameBold: {
    fontWeight: '600',
  },
  dmTime: {
    fontSize: 14,
    color: C.secondaryLabel,
  },
  dmPreview: {
    fontSize: 14,
    color: C.secondaryLabel,
    lineHeight: 20,
  },

  // Separator
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.separator,
    marginLeft: 76,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
