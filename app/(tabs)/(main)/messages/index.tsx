/**
 * Messages — 3-page swipeable layout.
 * Page 0: Channels. Page 1: DMs. Page 2: Requests.
 * Per-page pinned bubbles. Filter pills on Pages 0/1.
 * Long press for actions (no row swipe). Horizontal swipe = page switch only.
 */

import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  Animated,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { SwipeablePages } from '@/components/ui/swipeable-two-page';
import { PinnedBubblesRow, type PinnedBubble } from '@/components/ui/pinned-bubbles-row';
import { LongPressContextMenu, type ContextMenuData } from '@/components/ui/long-press-context-menu';
import { useMode, useOperatingRole } from '@/context/app-context';
import { canCreateChannel } from '@/utils/messages-permissions';
import { NewDMSheet } from '@/components/messages/new-dm-sheet';
import { CreateChannelSheet } from '@/components/messages/create-channel-sheet';
import { getRooms, getGlobalDMs, getRequests, formatMessageTime } from '@/data/mock-messages-v3';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import { initiateCall } from '@/utils/global-call';
import type { InboxThreadV3, RoomV3 } from '@/types';

const C = {
  bg: '#000000',
  surface: '#0B0F14',
  channelIconBg: '#0B1220',
  label: '#FFFFFF',
  secondaryLabel: '#A1A1AA',
  separator: '#38383A',
};

// ─── FAB Popup Menu (staff-only two-option popup) ────────────────────────────

function FabPopupMenu({
  bottomOffset,
  onNewMessage,
  onNewChannel,
  onDismiss,
}: {
  bottomOffset: number;
  onNewMessage: () => void;
  onNewChannel: () => void;
  onDismiss: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
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
      duration: 120,
      useNativeDriver: true,
    }).start(() => onDismiss());
  }, [fadeAnim, onDismiss]);

  return (
    <Modal transparent animationType="none" onRequestClose={dismiss}>
      <Animated.View style={[fabMenuS.overlay, { opacity: fadeAnim }]}>
        <Pressable style={fabMenuS.backdrop} onPress={dismiss} />
        <Animated.View
          style={[
            fabMenuS.menu,
            {
              bottom: bottomOffset,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Pressable style={fabMenuS.menuItem} onPress={onNewMessage}>
            <IconSymbol name="bubble.left.fill" size={18} color="#FFFFFF" />
            <Text style={fabMenuS.menuLabel}>New Message</Text>
          </Pressable>
          <View style={fabMenuS.menuDivider} />
          <Pressable style={fabMenuS.menuItem} onPress={onNewChannel}>
            <IconSymbol name="number" size={18} color="#FFFFFF" />
            <Text style={fabMenuS.menuLabel}>New Channel</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const fabMenuS = StyleSheet.create({
  overlay: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject },
  menu: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#000000',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2F3336',
    overflow: 'hidden',
    minWidth: 180,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#2F3336',
  },
  menuLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});

// ─── Filter Pills ────────────────────────────────────────────────────────────

function FilterPills({ options, active, onSelect }: {
  options: string[];
  active: string;
  onSelect: (v: string) => void;
}) {
  return (
    <View style={s.filterRow}>
      {options.map((opt) => {
        const isActive = opt === active;
        return (
          <Pressable
            key={opt}
            style={[s.filterPill, isActive && s.filterPillActive]}
            onPress={() => onSelect(opt)}
          >
            <Text style={[s.filterPillText, isActive && s.filterPillTextActive]}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Channel Row (no swipe) ──────────────────────────────────────────────────

function ChannelRow({
  room,
  isMuted,
  onPress,
  onShowPreview,
  onCall,
  onVideoCall,
  onToggleMute,
}: {
  room: RoomV3;
  isMuted: boolean;
  onPress: () => void;
  onShowPreview: (data: ContextMenuData) => void;
  onCall: () => void;
  onVideoCall: () => void;
  onToggleMute: () => void;
}) {
  const rowRef = useRef<View>(null);
  const longPressedRef = useRef(false);

  const handleLongPress = () => {
    longPressedRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const muteLabel = isMuted ? 'Show Alerts' : 'Mute';
    rowRef.current?.measureInWindow((_x, y) => {
      onShowPreview({
        title: room.name,
        subtitle: `${room.memberCount} members`,
        initials: room.initials,
        isSquircle: true,
        pageY: y,
        actions: [
          { key: 'call', label: 'Audio Call', icon: 'phone.fill' },
          { key: 'video', label: 'Video Call', icon: 'video.fill' },
          { key: 'pin', label: room.pinned ? 'Unpin' : 'Pin', icon: 'pin.fill' },
          { key: 'mute', label: muteLabel, icon: 'bell.slash.fill' },
          { key: 'read', label: 'Mark as Read', icon: 'envelope.open.fill' },
          { key: 'delete', label: 'Delete', icon: 'trash.fill', destructive: true },
        ],
        onAction: (key) => {
          if (key === 'call') onCall();
          else if (key === 'video') onVideoCall();
          else if (key === 'mute') onToggleMute();
        },
      });
    });
  };

  return (
    <Pressable
      ref={rowRef}
      style={s.row}
      onPress={() => {
        if (longPressedRef.current) { longPressedRef.current = false; return; }
        onPress();
      }}
      onLongPress={handleLongPress}
      delayLongPress={400}
    >
      <View style={s.unreadCol}>
        {room.unread && <View style={s.unreadDot} />}
      </View>
      <View style={s.channelIcon}>
        <Text style={s.channelInitials}>{room.initials}</Text>
        {room.locked && (
          <View style={s.lockBadge}>
            <IconSymbol name="lock.fill" size={8} color="#A1A1AA" />
          </View>
        )}
      </View>
      <View style={s.rowContent}>
        <View style={s.rowTopRow}>
          <Text style={[s.rowName, room.unread && s.rowNameBold]} numberOfLines={1}>
            {room.name}
          </Text>
          <Text style={s.rowTime}>{formatMessageTime(room.timestamp)}</Text>
        </View>
        <Text style={s.rowPreview} numberOfLines={2}>{room.lastMessage}</Text>
      </View>
    </Pressable>
  );
}

// ─── DM Row (no swipe) ──────────────────────────────────────────────────────

function DMRow({
  thread,
  isMuted,
  onPress,
  onShowPreview,
  onCall,
  onVideoCall,
  onToggleMute,
}: {
  thread: InboxThreadV3;
  isMuted: boolean;
  onPress: () => void;
  onShowPreview: (data: ContextMenuData) => void;
  onCall: () => void;
  onVideoCall: () => void;
  onToggleMute: () => void;
}) {
  const rowRef = useRef<View>(null);
  const longPressedRef = useRef(false);

  const handleLongPress = () => {
    longPressedRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const muteLabel = isMuted ? 'Show Alerts' : 'Mute';
    const readLabel = thread.unread ? 'Mark as Read' : 'Mark as Unread';

    rowRef.current?.measureInWindow((_x, y) => {
      onShowPreview({
        title: thread.name,
        subtitle: thread.preview,
        initials: thread.initials,
        isSquircle: false,
        pageY: y,
        actions: [
          { key: 'call', label: 'Audio Call', icon: 'phone.fill' },
          { key: 'video', label: 'Video Call', icon: 'video.fill' },
          { key: 'pin', label: thread.pinned ? 'Unpin' : 'Pin', icon: 'pin.fill' },
          { key: 'mute', label: muteLabel, icon: 'bell.slash.fill' },
          { key: 'read', label: readLabel, icon: 'envelope.fill' },
          { key: 'delete', label: 'Delete', icon: 'trash.fill', destructive: true },
        ],
        onAction: (key) => {
          if (key === 'call') onCall();
          else if (key === 'video') onVideoCall();
          else if (key === 'mute') onToggleMute();
        },
      });
    });
  };

  return (
    <Pressable
      ref={rowRef}
      style={s.row}
      onPress={() => {
        if (longPressedRef.current) { longPressedRef.current = false; return; }
        onPress();
      }}
      onLongPress={handleLongPress}
      delayLongPress={400}
    >
      <View style={s.unreadCol}>
        {thread.unread && <View style={s.unreadDot} />}
      </View>
      <View style={s.dmAvatar}>
        <Text style={s.dmAvatarText}>{thread.initials}</Text>
      </View>
      <View style={s.rowContent}>
        <View style={s.rowTopRow}>
          <Text style={[s.rowName, thread.unread && s.rowNameBold]} numberOfLines={1}>
            {thread.name}
          </Text>
          <Text style={s.rowTime}>{formatMessageTime(thread.timestamp)}</Text>
        </View>
        <Text style={s.rowPreview} numberOfLines={2}>{thread.preview}</Text>
      </View>
    </Pressable>
  );
}

// ─── Request Row ─────────────────────────────────────────────────────────────

function RequestRow({
  thread,
  onAccept,
  onDecline,
}: {
  thread: InboxThreadV3;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <View style={s.requestRow}>
      <View style={s.dmAvatar}>
        <Text style={s.dmAvatarText}>{thread.initials}</Text>
      </View>
      <View style={s.requestContent}>
        <View style={s.rowTopRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[s.rowName, s.rowNameBold]} numberOfLines={1}>
              {thread.name}
              {thread.username ? (
                <Text style={s.requestUsername}> @{thread.username}</Text>
              ) : null}
            </Text>
          </View>
          <Text style={s.rowTime}>{formatMessageTime(thread.timestamp)}</Text>
        </View>
        {(thread.orgName || thread.role) && (
          <Text style={s.requestMeta} numberOfLines={1}>
            {thread.orgName}{thread.orgName && thread.role ? ' \u00B7 ' : ''}{thread.role}
          </Text>
        )}
        <Text style={s.rowPreview} numberOfLines={2}>{thread.preview}</Text>
        <View style={s.requestActions}>
          <Pressable style={s.acceptBtn} onPress={onAccept}>
            <Text style={s.acceptBtnText}>Accept</Text>
          </Pressable>
          <Pressable style={s.declineBtn} onPress={onDecline}>
            <Text style={s.declineBtnText}>Decline</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function MessagesListScreen() {
  const insets = useSafeAreaInsets();
  const mode = useMode();
  const router = useRouter();
  const role = useOperatingRole();
  const isStaff = canCreateChannel(role);

  const [pageIndex, setPageIndex] = useState(0);
  const [mutedIds, setMutedIds] = useState<Set<string>>(new Set());
  const [deletedIds] = useState<Set<string>>(new Set());
  const [composeVisible, setComposeVisible] = useState(false);
  const [fabMenuVisible, setFabMenuVisible] = useState(false);
  const [createChannelVisible, setCreateChannelVisible] = useState(false);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);

  // Filter state
  const [channelFilter, setChannelFilter] = useState<'All' | 'Unread' | 'Mentions'>('All');
  const [dmFilter, setDmFilter] = useState<'All' | 'Unread'>('All');

  // Request accept/decline state
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [declinedIds, setDeclinedIds] = useState<Set<string>>(new Set());

  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  const toggleMute = (id: string) => {
    setMutedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Mode-specific channels (always loaded regardless of page)
  const channels = useMemo(() => {
    const list = getRooms(mode).filter((r) => !deletedIds.has(r.id));
    return list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [mode, deletedIds]);

  // Cross-org DMs
  const dms = useMemo(() => {
    const list = getGlobalDMs().filter((t) => !deletedIds.has(t.id));
    return list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [deletedIds]);

  // Requests (filtered by accepted/declined)
  const requests = useMemo(() => {
    return getRequests()
      .filter(r => !acceptedIds.has(r.id) && !declinedIds.has(r.id))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [acceptedIds, declinedIds]);

  // Filtered channels
  const filteredChannels = useMemo(() => {
    if (channelFilter === 'All') return channels;
    return channels.filter(r => r.unread);
  }, [channels, channelFilter]);

  // Filtered DMs
  const filteredDMs = useMemo(() => {
    if (dmFilter === 'All') return dms;
    return dms.filter(t => t.unread);
  }, [dms, dmFilter]);

  // Badge on 3rd dot when requests exist
  const dotBadges = useMemo(() => {
    const set = new Set<number>();
    if (requests.length > 0) set.add(2);
    return set;
  }, [requests]);

  // Per-page pinned bubbles
  const pinnedChannels: PinnedBubble[] = useMemo(() => {
    return channels.filter((r) => r.pinned).map((r) => ({
      id: r.id, initials: r.initials, name: r.name,
      isSquircle: true, unread: r.unread,
    }));
  }, [channels]);

  const pinnedDMs: PinnedBubble[] = useMemo(() => {
    return dms.filter((t) => t.pinned).map((t) => ({
      id: t.id, initials: t.initials, name: t.name,
      isSquircle: false, unread: t.unread,
    }));
  }, [dms]);

  const openChannel = (room: RoomV3) => {
    router.push({
      pathname: '/messages/[threadId]',
      params: { threadId: room.id, type: 'channel', title: room.name },
    });
  };

  const openDM = (thread: InboxThreadV3) => {
    router.push({
      pathname: '/messages/[threadId]',
      params: { threadId: thread.id, type: 'dm', title: thread.name },
    });
  };

  const handlePinnedChannelPress = (id: string) => {
    const room = channels.find((r) => r.id === id);
    if (room) openChannel(room);
  };

  const handlePinnedDMPress = (id: string) => {
    const thread = dms.find((t) => t.id === id);
    if (thread) openDM(thread);
  };

  const handleAccept = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAcceptedIds((prev) => new Set(prev).add(id));
  }, []);

  const handleDecline = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDeclinedIds((prev) => new Set(prev).add(id));
  }, []);

  const handleComposeSend = (threadId: string) => {
    setComposeVisible(false);
    const thread = getGlobalDMs().find((t) => t.id === threadId);
    if (thread) {
      router.push({
        pathname: '/messages/[threadId]',
        params: { threadId: thread.id, type: 'dm', title: thread.name },
      });
    }
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* 3-page swipeable: Channels ↔ DMs ↔ Requests */}
      <SwipeablePages
        activeIndex={pageIndex}
        onPageChange={setPageIndex}
        onEdgeRight={openSidePanel}
        badges={dotBadges}
      >
        {/* Page 0: Channels */}
        <ScrollView
          style={s.pageScroll}
          contentContainerStyle={{ paddingBottom: 100 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingTop: 28 }}>
            <PinnedBubblesRow items={pinnedChannels} onPress={handlePinnedChannelPress} />
          </View>
          <FilterPills
            options={['All', 'Unread', 'Mentions']}
            active={channelFilter}
            onSelect={(v) => setChannelFilter(v as 'All' | 'Unread' | 'Mentions')}
          />
          <View style={s.sectionDivider}>
            <Text style={s.sectionLabel}>Channels</Text>
          </View>
          {filteredChannels.map((room, i) => (
            <View key={room.id}>
              {i > 0 && <View style={s.separator} />}
              <ChannelRow
                room={room}
                isMuted={mutedIds.has(room.id)}
                onPress={() => openChannel(room)}
                onShowPreview={setMenuData}
                onCall={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); initiateCall({ contactName: room.name, contactInitials: room.initials, mode: room.mode, type: 'audio' }); }}
                onVideoCall={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); initiateCall({ contactName: room.name, contactInitials: room.initials, mode: room.mode, type: 'video' }); }}
                onToggleMute={() => toggleMute(room.id)}
              />
            </View>
          ))}
        </ScrollView>

        {/* Page 1: DMs */}
        <ScrollView
          style={s.pageScroll}
          contentContainerStyle={{ paddingBottom: 100 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingTop: 28 }}>
            <PinnedBubblesRow items={pinnedDMs} onPress={handlePinnedDMPress} />
          </View>
          <FilterPills
            options={['All', 'Unread']}
            active={dmFilter}
            onSelect={(v) => setDmFilter(v as 'All' | 'Unread')}
          />
          <View style={s.sectionDivider}>
            <Text style={s.sectionLabel}>Direct Messages</Text>
          </View>
          {filteredDMs.map((thread, i) => (
            <View key={thread.id}>
              {i > 0 && <View style={s.separator} />}
              <DMRow
                thread={thread}
                isMuted={mutedIds.has(thread.id)}
                onPress={() => openDM(thread)}
                onShowPreview={setMenuData}
                onCall={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); initiateCall({ contactName: thread.name, contactInitials: thread.initials, mode: thread.mode, type: 'audio' }); }}
                onVideoCall={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); initiateCall({ contactName: thread.name, contactInitials: thread.initials, mode: thread.mode, type: 'video' }); }}
                onToggleMute={() => toggleMute(thread.id)}
              />
            </View>
          ))}
        </ScrollView>

        {/* Page 2: Requests */}
        <ScrollView
          style={s.pageScroll}
          contentContainerStyle={{ paddingBottom: 100 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.sectionDivider}>
            <Text style={s.requestCount}>
              {requests.length} pending request{requests.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={s.sectionDivider}>
            <Text style={s.sectionLabel}>Requests</Text>
          </View>
          {requests.map((thread, i) => (
            <View key={thread.id}>
              {i > 0 && <View style={s.separator} />}
              <RequestRow
                thread={thread}
                onAccept={() => handleAccept(thread.id)}
                onDecline={() => handleDecline(thread.id)}
              />
            </View>
          ))}
          {requests.length === 0 && (
            <View style={s.emptyState}>
              <Text style={s.emptyStateText}>No pending requests</Text>
            </View>
          )}
        </ScrollView>
      </SwipeablePages>

      {/* FAB compose button */}
      <Pressable
        style={[s.fab, { backgroundColor: '#0B0F14', bottom: insets.bottom + 60 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          if (isStaff) {
            setFabMenuVisible(true);
          } else {
            setComposeVisible(true);
          }
        }}
      >
        <IconSymbol name="plus" size={24} color="#FFFFFF" />
      </Pressable>

      {/* Compose sheet */}
      <NewDMSheet
        visible={composeVisible}
        onClose={() => setComposeVisible(false)}
        onSend={handleComposeSend}
        accent="#FFFFFF"
      />

      {/* FAB popup menu (staff only) */}
      {fabMenuVisible && (
        <FabPopupMenu
          bottomOffset={insets.bottom + 60 + 60}
          onNewMessage={() => {
            setFabMenuVisible(false);
            setComposeVisible(true);
          }}
          onNewChannel={() => {
            setFabMenuVisible(false);
            setCreateChannelVisible(true);
          }}
          onDismiss={() => setFabMenuVisible(false)}
        />
      )}

      {/* Create channel sheet */}
      <CreateChannelSheet
        visible={createChannelVisible}
        onClose={() => setCreateChannelVisible(false)}
      />

      {/* Long-press context menu */}
      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  pageScroll: { flex: 1 },

  // Filter pills
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4, gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16,
    backgroundColor: C.surface,
  },
  filterPillActive: {
    backgroundColor: '#FFFFFF',
  },
  filterPillText: {
    fontSize: 13, fontWeight: '600', color: '#FFFFFF',
  },
  filterPillTextActive: {
    color: '#000000',
  },

  // Section divider
  sectionDivider: {
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 13, fontWeight: '600', color: C.secondaryLabel, textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Unified row
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    paddingRight: 16, backgroundColor: C.bg,
  },
  unreadCol: { width: 24, alignItems: 'center', justifyContent: 'center' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFFFFF' },
  rowContent: { flex: 1, marginLeft: 12, marginRight: 8 },
  rowTopRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2,
  },
  rowName: { fontSize: 16, fontWeight: '400', color: C.label, flex: 1, marginRight: 8 },
  rowNameBold: { fontWeight: '600' },
  rowTime: { fontSize: 14, color: C.secondaryLabel },
  rowPreview: { fontSize: 14, color: C.secondaryLabel, lineHeight: 20 },

  // Channel icon (square squircle)
  channelIcon: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: C.channelIconBg,
    alignItems: 'center', justifyContent: 'center',
  },
  channelInitials: { fontSize: 14, fontWeight: '700', color: C.label },
  lockBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 16, height: 16, borderRadius: 8, backgroundColor: '#2C2C2E',
    alignItems: 'center', justifyContent: 'center',
  },

  // DM avatar (circular)
  dmAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#1C1C1E',
    alignItems: 'center', justifyContent: 'center',
  },
  dmAvatarText: { fontSize: 14, fontWeight: '600', color: C.label },

  // Separator
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 80 },

  // Request row
  requestRow: {
    flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12,
    paddingLeft: 16, paddingRight: 16, backgroundColor: C.bg,
  },
  requestContent: { flex: 1, marginLeft: 12 },
  requestUsername: { fontSize: 14, fontWeight: '400', color: C.secondaryLabel },
  requestMeta: { fontSize: 13, color: C.secondaryLabel, marginBottom: 4 },
  requestActions: {
    flexDirection: 'row', gap: 10, marginTop: 10,
  },
  acceptBtn: {
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  acceptBtnText: { fontSize: 14, fontWeight: '600', color: '#000000' },
  declineBtn: {
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 18,
    backgroundColor: C.surface,
  },
  declineBtnText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  requestCount: { fontSize: 15, fontWeight: '500', color: C.secondaryLabel },
  emptyState: {
    alignItems: 'center', justifyContent: 'center', paddingVertical: 60,
  },
  emptyStateText: { fontSize: 16, color: C.secondaryLabel },

  // FAB
  fab: {
    position: 'absolute', right: 20, width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 8,
  },
});
