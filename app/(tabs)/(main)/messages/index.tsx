/**
 * Messages — conversation list.
 * No header. No title. Content starts immediately below status bar.
 * Layout: Room bubbles → Search → Pinned section → DM list → FAB compose.
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  FlatList,
  Alert,
  ActionSheetIOS,
  Platform,
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
  onLongPress: () => void;
}) {
  const hasUnread = room.unread > 0;
  return (
    <Pressable
      style={s.roomCell}
      onPress={onPress}
      onLongPress={onLongPress}
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

// ─── DM Row (swipe-left = delete, long press = context menu) ────────────────

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
}) {
  const swipeRef = useRef<Swipeable>(null);
  const hasUnread = thread.unreadCount > 0;

  const confirmDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Delete this conversation?',
          options: ['Delete', 'Cancel'],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
        },
        (idx) => {
          if (idx === 0) onDeleteConfirmed();
          swipeRef.current?.close();
        },
      );
    } else {
      Alert.alert('Delete conversation?', undefined, [
        { text: 'Cancel', style: 'cancel', onPress: () => swipeRef.current?.close() },
        { text: 'Delete', style: 'destructive', onPress: () => { onDeleteConfirmed(); swipeRef.current?.close(); } },
      ]);
    }
  };

  const renderRightActions = () => (
    <Pressable
      style={[s.swipeAction, { backgroundColor: C.red }]}
      onPress={confirmDelete}
    >
      <IconSymbol name="trash.fill" size={22} color="#FFF" />
      <Text style={s.swipeLabel}>Delete</Text>
    </Pressable>
  );

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const pinLabel = isPinned ? 'Unpin' : 'Pin';
    const readLabel = hasUnread ? 'Mark as Read' : 'Mark as Unread';
    const muteLabel = isMuted ? 'Show Alerts' : 'Hide Alerts';
    const options = [pinLabel, readLabel, muteLabel, 'Delete', 'Cancel'];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: thread.participantName,
          options,
          destructiveButtonIndex: 3,
          cancelButtonIndex: 4,
        },
        (idx) => {
          if (idx === 0) onPin();
          else if (idx === 1) onToggleRead();
          else if (idx === 2) onToggleMute();
          else if (idx === 3) onDeleteConfirmed();
        },
      );
    } else {
      Alert.alert(thread.participantName, undefined, [
        { text: pinLabel, onPress: onPin },
        { text: readLabel, onPress: onToggleRead },
        { text: muteLabel, onPress: onToggleMute },
        { text: 'Delete', style: 'destructive', onPress: onDeleteConfirmed },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      <Pressable
        style={s.dmRow}
        onPress={onPress}
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

  const handleRoomLongPress = (room: (typeof ROOMS)[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const isPinned = pinnedIds.has(room.id);
    const isMuted = mutedRoomIds.has(room.id);
    const pinLabel = isPinned ? 'Unpin' : 'Pin';
    const muteLabel = isMuted ? 'Show Alerts' : 'Mute';
    const options = [pinLabel, muteLabel, 'Mark as Read', 'Cancel'];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { title: room.title, options, cancelButtonIndex: 3 },
        (idx) => {
          if (idx === 0) togglePin(room.id);
          else if (idx === 1) toggleRoomMute(room.id);
          else if (idx === 2) markRoomRead(room.id);
        },
      );
    } else {
      Alert.alert(room.title, undefined, [
        { text: pinLabel, onPress: () => togglePin(room.id) },
        { text: muteLabel, onPress: () => toggleRoomMute(room.id) },
        { text: 'Mark as Read', onPress: () => markRoomRead(room.id) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
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
              onLongPress={() => handleRoomLongPress(room)}
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
              return (
                <Pressable
                  key={thread.id}
                  style={s.pinnedCell}
                  onPress={() => openDM(thread)}
                  onLongPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    const options = ['Unpin', 'Delete', 'Cancel'];
                    if (Platform.OS === 'ios') {
                      ActionSheetIOS.showActionSheetWithOptions(
                        { title: thread.participantName, options, destructiveButtonIndex: 1, cancelButtonIndex: 2 },
                        (idx) => {
                          if (idx === 0) togglePin(thread.id);
                          else if (idx === 1) handleDeleteThread(thread.id);
                        },
                      );
                    } else {
                      Alert.alert(thread.participantName, undefined, [
                        { text: 'Unpin', onPress: () => togglePin(thread.id) },
                        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteThread(thread.id) },
                        { text: 'Cancel', style: 'cancel' },
                      ]);
                    }
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
