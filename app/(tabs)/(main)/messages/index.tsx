/**
 * Messages — universal inbox. iMessage-style.
 * K + "Messages" pill + Compose + RolePill top bar.
 * Search bar + filter pills (All | Unread | Brands | Subscribers).
 * Conversation list with swipe actions + long press menu.
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useRouter, useFocusEffect } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

// ---------------------------------------------------------------------------
// Types & mock data
// ---------------------------------------------------------------------------

type Conversation = {
  id: string;
  name: string;
  initials: string;
  preview: string;
  timestamp: string;
  unread: boolean;
  unreadCount: number;
  pinned: boolean;
  isBrand: boolean;
  isSubscriber: boolean;
};

const CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    name: 'Sarah Chen - Nike',
    initials: 'SC',
    preview: 'Let me check with the team on the timeline...',
    timestamp: '2:30 PM',
    unread: true,
    unreadCount: 3,
    pinned: false,
    isBrand: true,
    isSubscriber: false,
  },
  {
    id: 'c2',
    name: 'Alex Rivera',
    initials: 'AR',
    preview: "Thanks for the collab idea, I'm in!",
    timestamp: 'Yesterday',
    unread: false,
    unreadCount: 0,
    pinned: false,
    isBrand: false,
    isSubscriber: true,
  },
  {
    id: 'c3',
    name: 'Marcus Johnson',
    initials: 'MJ',
    preview: 'The coaching session was incredible...',
    timestamp: 'Apr 10',
    unread: false,
    unreadCount: 0,
    pinned: false,
    isBrand: false,
    isSubscriber: true,
  },
  {
    id: 'c4',
    name: 'KaNeXT Support',
    initials: 'KS',
    preview: 'Your ticket #1042 has been resolved.',
    timestamp: 'Apr 9',
    unread: false,
    unreadCount: 0,
    pinned: false,
    isBrand: false,
    isSubscriber: false,
  },
  {
    id: 'c5',
    name: 'Gatorade - Marcus Lee',
    initials: 'GL',
    preview: 'Q3 extension contract is ready for review.',
    timestamp: 'Apr 8',
    unread: false,
    unreadCount: 0,
    pinned: false,
    isBrand: true,
    isSubscriber: false,
  },
  {
    id: 'c6',
    name: 'Mom',
    initials: 'M',
    preview: 'Call me when you get a chance',
    timestamp: 'Apr 7',
    unread: false,
    unreadCount: 0,
    pinned: false,
    isBrand: false,
    isSubscriber: false,
  },
];

const SUBSCRIBER_CONVERSATIONS: Conversation[] = [
  {
    id: 's1',
    name: 'Sammy K',
    initials: 'SK',
    preview: 'Hey! Check out my latest drop 🎤',
    timestamp: '10:14 AM',
    unread: true,
    unreadCount: 2,
    pinned: true,
    isBrand: false,
    isSubscriber: false,
  },
  {
    id: 's2',
    name: 'Sammy K · Broadcast',
    initials: 'SK',
    preview: 'New video dropping Friday — be the first to watch.',
    timestamp: 'Yesterday',
    unread: false,
    unreadCount: 0,
    pinned: false,
    isBrand: false,
    isSubscriber: false,
  },
];

type FilterKey = 'All' | 'Unread' | 'Brands' | 'Subscribers';
const FILTERS: FilterKey[] = ['All', 'Unread', 'Brands', 'Subscribers'];

const TOP_BAR_H = 52;
const SEARCH_BAR_H = 52;

// ---------------------------------------------------------------------------
// ConversationRow
// ---------------------------------------------------------------------------

type ConversationRowProps = {
  conv: Conversation;
  C: ReturnType<typeof useColors>;
  onPress: () => void;
  onLongPress: () => void;
  onPin: () => void;
  onMute: () => void;
  onDelete: () => void;
};

function ConversationRow({
  conv,
  C,
  onPress,
  onLongPress,
  onPin,
  onMute,
  onDelete,
}: ConversationRowProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderLeftActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0.8, 1],
      extrapolate: 'clamp',
    });
    return (
      <Pressable
        style={[styles.swipeActionLeft, { backgroundColor: C.label }]}
        onPress={() => {
          swipeableRef.current?.close();
          onPin();
        }}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <IconSymbol name="bookmark.fill" size={22} color={C.bg} />
          <Text style={[styles.swipeActionLabel, { color: C.bg }]}>
            {conv.pinned ? 'Unpin' : 'Pin'}
          </Text>
        </Animated.View>
      </Pressable>
    );
  };

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-160, 0],
      outputRange: [1, 0.8],
      extrapolate: 'clamp',
    });
    return (
      <View style={styles.swipeRightContainer}>
        <Pressable
          style={[styles.swipeActionRight, { backgroundColor: C.surface }]}
          onPress={() => {
            swipeableRef.current?.close();
            onMute();
          }}
        >
          <Animated.View
            style={[styles.swipeActionInner, { transform: [{ scale }] }]}
          >
            <IconSymbol name="bell.slash.fill" size={22} color={C.secondary} />
            <Text style={[styles.swipeActionLabel, { color: C.secondary }]}>
              Mute
            </Text>
          </Animated.View>
        </Pressable>
        <Pressable
          style={[styles.swipeActionRight, { backgroundColor: '#B85C5C' }]}
          onPress={() => {
            swipeableRef.current?.close();
            onDelete();
          }}
        >
          <Animated.View
            style={[styles.swipeActionInner, { transform: [{ scale }] }]}
          >
            <IconSymbol name="trash.fill" size={22} color="#FFFFFF" />
            <Text style={[styles.swipeActionLabel, { color: '#FFFFFF' }]}>
              Delete
            </Text>
          </Animated.View>
        </Pressable>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
    >
      <Pressable
        style={[styles.rowContainer, { backgroundColor: C.bg }]}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        {/* Unread dot */}
        <View
          style={[
            styles.unreadDot,
            { backgroundColor: conv.unread ? C.ember : 'transparent' },
          ]}
        />

        {/* Avatar with optional badge */}
        <View style={styles.avatarWrapper}>
          <View style={[styles.avatar, { backgroundColor: C.surface }]}>
            <Text style={[styles.avatarText, { color: C.label }]}>
              {conv.initials}
            </Text>
          </View>
          {conv.unreadCount > 1 && (
            <View style={[styles.badge, { backgroundColor: C.ember }]}>
              <Text style={styles.badgeText}>{conv.unreadCount}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.rowContent}>
          <View style={styles.rowTopLine}>
            <Text
              style={[
                styles.rowName,
                {
                  color: C.label,
                  fontWeight: conv.unread ? '700' : '400',
                },
              ]}
              numberOfLines={1}
            >
              {conv.pinned ? '📌 ' : ''}{conv.name}
            </Text>
            <Text style={[styles.rowTimestamp, { color: C.secondary }]}>
              {conv.timestamp}
            </Text>
          </View>
          <Text style={[styles.rowPreview, { color: C.secondary }]} numberOfLines={1}>
            {conv.preview}
          </Text>
        </View>
      </Pressable>
    </Swipeable>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function MessagesScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaytv');
  const isOwner = role === roleCycles[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');
  const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS);
  const [subConversations, setSubConversations] = useState<Conversation[]>(SUBSCRIBER_CONVERSATIONS);

  const { opacity: headerOpacity, onScroll, scrollEventThrottle } = useScrollHeader();

  useFocusEffect(
    useCallback(() => {
      resetFooter();
    }, []),
  );

  const filtered = useMemo(() => {
    const base = isOwner ? conversations : subConversations;
    const searched = searchQuery
      ? base.filter(
          (c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.preview.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : base;
    switch (activeFilter) {
      case 'Unread':
        return searched.filter((c) => c.unread);
      case 'Brands':
        return searched.filter((c) => c.isBrand);
      case 'Subscribers':
        return searched.filter((c) => c.isSubscriber);
      default:
        return searched;
    }
  }, [searchQuery, activeFilter, isOwner, conversations, subConversations]);

  const handlePress = useCallback(
    (conv: Conversation) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push({
        pathname: '/(tabs)/(main)/messages/[threadId]' as any,
        params: {
          threadId: conv.id,
          name: conv.name,
          initials: conv.initials,
          isChannel: '0',
        },
      });
    },
    [router],
  );

  const handleLongPress = useCallback((conv: Conversation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(conv.name, undefined, [
      {
        text: conv.pinned ? 'Unpin' : 'Pin',
        onPress: () => handlePin(conv.id),
      },
      {
        text: conv.unread ? 'Mark as Read' : 'Mark as Unread',
        onPress: () => handleToggleRead(conv.id),
      },
      { text: 'Mute', onPress: () => handleMute(conv.id) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => handleDelete(conv.id),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, []);

  const handlePin = useCallback((id: string) => {
    const update = (list: Conversation[]) =>
      list.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c));
    setConversations((prev) => update(prev));
    setSubConversations((prev) => update(prev));
  }, []);

  const handleToggleRead = useCallback((id: string) => {
    const update = (list: Conversation[]) =>
      list.map((c) =>
        c.id === id
          ? { ...c, unread: !c.unread, unreadCount: c.unread ? 0 : 1 }
          : c,
      );
    setConversations((prev) => update(prev));
    setSubConversations((prev) => update(prev));
  }, []);

  const handleMute = useCallback((id: string) => {
    Alert.alert('Muted', `Notifications muted for this conversation.`);
  }, []);

  const handleDelete = useCallback((id: string) => {
    Alert.alert('Delete conversation?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setConversations((prev) => prev.filter((c) => c.id !== id));
          setSubConversations((prev) => prev.filter((c) => c.id !== id));
        },
      },
    ]);
  }, []);

  const handleCompose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/(main)/messages/new-message' as any);
  }, [router]);

  const totalPaddingTop = insets.top + TOP_BAR_H + SEARCH_BAR_H;
  const separatorMarginLeft = 16 + 8 + 12 + 48 + 12; // paddingH + dot + gap + avatar + gap

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      {/* ------------------------------------------------------------------ */}
      {/* Top bar (absolute, sits above scroll content)                       */}
      {/* ------------------------------------------------------------------ */}
      <Animated.View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top,
            backgroundColor: C.bg,
            opacity: headerOpacity,
            borderBottomColor: C.separator,
          },
        ]}
      >
        {/* Header row */}
        <View style={styles.headerRow}>
          {/* Left: K menu button */}
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8}>
            <KMenuButton />
          </Pressable>

          {/* Center: title pill */}
          <View style={styles.centerZone}>
            <View
              style={[
                styles.titlePill,
                { backgroundColor: C.surface, borderColor: C.separator },
              ]}
            >
              <Text style={[styles.titlePillText, { color: C.label }]}>
                Inbox
              </Text>
            </View>
          </View>

          {/* Right: compose + role pill */}
          <View style={styles.rightZone}>
            {isOwner && (
              <Pressable onPress={handleCompose} hitSlop={8} style={styles.composeButton}>
                <IconSymbol name="square.and.pencil" size={22} color={C.label} />
              </Pressable>
            )}
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>

        {/* Search bar */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: C.surface, borderColor: C.separator },
          ]}
        >
          <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
          <TextInput
            style={[styles.searchInput, { color: C.label }]}
            placeholder="Search messages..."
            placeholderTextColor={C.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </Animated.View>

      {/* ------------------------------------------------------------------ */}
      {/* Scroll content                                                       */}
      {/* ------------------------------------------------------------------ */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: totalPaddingTop,
          paddingBottom: 49 + insets.bottom + 16,
        }}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
          style={styles.pillsScroll}
        >
          {FILTERS.map((f) => {
            const isActive = activeFilter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setActiveFilter(f)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isActive ? C.activePill : C.surface,
                    borderColor: isActive ? C.activePill : C.separator,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: isActive ? C.activePillText : C.label },
                  ]}
                >
                  {f}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Conversation list */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="message.fill" size={36} color={C.muted} />
            <Text style={[styles.emptyText, { color: C.muted }]}>No messages</Text>
          </View>
        ) : (
          filtered.map((conv, index) => (
            <React.Fragment key={conv.id}>
              <ConversationRow
                conv={conv}
                C={C}
                onPress={() => handlePress(conv)}
                onLongPress={() => handleLongPress(conv)}
                onPin={() => handlePin(conv.id)}
                onMute={() => handleMute(conv.id)}
                onDelete={() => handleDelete(conv.id)}
              />
              {index < filtered.length - 1 && (
                <View
                  style={[
                    styles.separator,
                    {
                      backgroundColor: C.separator,
                      marginLeft: separatorMarginLeft,
                    },
                  ]}
                />
              )}
            </React.Fragment>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // Top bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    height: TOP_BAR_H,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  centerZone: {
    flex: 1,
    alignItems: 'center',
  },
  titlePill: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  titlePillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  rightZone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  composeButton: {
    padding: 2,
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },

  // Filter pills
  pillsScroll: {
    flexGrow: 0,
  },
  pillsRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  pill: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Conversation row
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rowContent: {
    flex: 1,
  },
  rowTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  rowName: {
    fontSize: 15,
    flex: 1,
  },
  rowTimestamp: {
    fontSize: 12,
    marginLeft: 8,
  },
  rowPreview: {
    fontSize: 14,
  },

  // Swipe actions
  swipeActionLeft: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeRightContainer: {
    flexDirection: 'row',
  },
  swipeActionRight: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeActionInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  swipeActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },

  // Separator
  separator: {
    height: StyleSheet.hairlineWidth,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
});
