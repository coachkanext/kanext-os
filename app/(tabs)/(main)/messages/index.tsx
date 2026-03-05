/**
 * Messages Screen — Horizontal rooms row + vertical DM list.
 * Tapping a room or DM navigates to the thread view.
 * Compose FAB + search bar remain "Coming Soon".
 * Always-dark, matches jet black Home screen aesthetic.
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';
import { SPORTS_ROOMS, SPORTS_DM_THREADS } from '@/data/mock-sports-messages';
import type { SportsRoom, SportsDMThread } from '@/data/mock-sports-messages';

// Always-dark palette
const C = {
  bg: '#000000',
  surface: '#0B0F14',
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  placeholder: '#52525B',
};

const comingSoon = () => Alert.alert('Coming Soon', 'This feature is not yet available.');

// -- Room Circle ---------------------------------------------------------------

function RoomCircle({
  room,
  accent,
  onPress,
}: {
  room: SportsRoom;
  accent: string;
  onPress: () => void;
}) {
  const hasUnread = room.unreadCount > 0;

  return (
    <Pressable
      style={styles.roomCell}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View
        style={[
          styles.roomAvatar,
          hasUnread && { borderWidth: 2, borderColor: accent },
        ]}
      >
        <Text style={styles.roomInitials}>{room.avatarInitials}</Text>
      </View>
      <Text style={styles.roomName} numberOfLines={1}>
        {room.title}
      </Text>
    </Pressable>
  );
}

// -- DM Row -------------------------------------------------------------------

function DMRow({
  thread,
  accent,
  onPress,
}: {
  thread: SportsDMThread;
  accent: string;
  onPress: () => void;
}) {
  const hasUnread = thread.unreadCount > 0;

  return (
    <Pressable
      style={styles.dmRow}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      {/* Avatar */}
      <View style={styles.dmAvatar}>
        <Text style={styles.dmAvatarText}>{thread.participantInitials}</Text>
      </View>

      {/* Name + preview */}
      <View style={styles.dmCenter}>
        <Text
          style={[styles.dmName, hasUnread && styles.dmNameUnread]}
          numberOfLines={1}
        >
          {thread.participantName}
        </Text>
        <Text style={styles.dmPreview} numberOfLines={1}>
          {thread.lastMessagePreview}
        </Text>
      </View>

      {/* Time + unread dot */}
      <View style={styles.dmRight}>
        <Text style={styles.dmTime}>{thread.lastMessageTime}</Text>
        {hasUnread && (
          <View style={[styles.unreadDot, { backgroundColor: accent }]} />
        )}
      </View>
    </Pressable>
  );
}

// -- Screen -------------------------------------------------------------------

export default function MessagesListScreen() {
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();
  const router = useRouter();
  const rooms = SPORTS_ROOMS.slice(0, 6);

  const openRoom = (room: SportsRoom) => {
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

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Rooms row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.roomsRow}
        style={styles.roomsScroll}
      >
        {rooms.map((room) => (
          <RoomCircle
            key={room.id}
            room={room}
            accent={accent}
            onPress={() => openRoom(room)}
          />
        ))}
      </ScrollView>

      {/* Search bar */}
      <Pressable style={styles.searchBar} onPress={comingSoon}>
        <IconSymbol name="magnifyingglass" size={16} color={C.placeholder} />
        <Text style={styles.searchPlaceholder}>Search messages...</Text>
      </Pressable>

      {/* DM list */}
      <FlatList
        data={SPORTS_DM_THREADS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DMRow
            thread={item}
            accent={accent}
            onPress={() => openDM(item)}
          />
        )}
        contentContainerStyle={styles.dmList}
      />

      {/* Compose FAB */}
      <Pressable
        style={[styles.fab, { backgroundColor: accent, bottom: 24 + insets.bottom }]}
        onPress={comingSoon}
      >
        <IconSymbol name="square.and.pencil" size={22} color={C.textPrimary} />
      </Pressable>
    </View>
  );
}

// -- Styles -------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Rooms
  roomsScroll: {
    flexGrow: 0,
  },
  roomsRow: {
    paddingHorizontal: 16,
    gap: 16,
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
    fontSize: 14,
    fontWeight: '700',
    color: C.textPrimary,
  },
  roomName: {
    fontSize: 11,
    color: C.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: C.placeholder,
  },

  // DM list
  dmList: {
    paddingBottom: 80,
  },
  dmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dmAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dmAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textPrimary,
  },
  dmCenter: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  dmName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textPrimary,
  },
  dmNameUnread: {
    fontWeight: '700',
  },
  dmPreview: {
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 2,
  },
  dmRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  dmTime: {
    fontSize: 12,
    color: C.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
    shadowRadius: 8,
    elevation: 8,
  },
});
