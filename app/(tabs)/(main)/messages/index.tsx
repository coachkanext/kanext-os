/**
 * Messages — Universal landing view.
 * Single ScrollView: Pinned > Channels > DMs > FAB.
 * Works across all modes. DMs persist cross-org.
 * Search is handled globally by Nexus hold — no per-screen search bar.
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
import { Swipeable } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useMode } from '@/context/app-context';
import { NewDMSheet } from '@/components/messages/new-dm-sheet';
import { getRooms, getGlobalDMs, formatMessageTime } from '@/data/mock-messages-v3';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import { initiateCall } from '@/utils/global-call';
import type { InboxThreadV3, RoomV3 } from '@/types';

type FilterMode = 'all' | 'channels' | 'dms';

const C = {
  bg: '#000000',
  surface: '#0B0F14',
  channelIconBg: '#0B1220',
  label: '#FFFFFF',
  secondaryLabel: '#A1A1AA',
  placeholder: '#52525B',
  separator: '#38383A',
  red: '#FF3B30',
  otherBubble: '#0B0F14',
};

// ─── Preview Overlay (iOS-style long-press context menu) ─────────────────────

type PreviewData = {
  type: 'dm' | 'channel' | 'pinned';
  title: string;
  subtitle: string;
  initials: string;
  isChannel: boolean;
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
            { transform: [{ scale: scaleAnim }], top: cardTop },
          ]}
        >
          <View style={pvS.previewCard}>
            <View
              style={[
                pvS.previewAvatar,
                data.isChannel
                  ? { borderRadius: 12, backgroundColor: C.channelIconBg }
                  : { borderRadius: 24 },
              ]}
            >
              <Text style={pvS.previewInitials}>{data.initials}</Text>
            </View>
            <View style={pvS.previewText}>
              <Text style={pvS.previewName} numberOfLines={1}>{data.title}</Text>
              <Text style={pvS.previewSub} numberOfLines={2}>{data.subtitle}</Text>
            </View>
          </View>
          <View style={pvS.menu}>
            {data.actions.map((action, idx) => (
              <Pressable
                key={action.key}
                style={[pvS.menuItem, idx < data.actions.length - 1 && pvS.menuItemBorder]}
                onPress={() => handleAction(action.key)}
              >
                <Text style={[pvS.menuLabel, action.destructive && pvS.menuLabelDestructive]}>
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
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.60)' },
  content: { position: 'absolute', left: 24, right: 24, alignItems: 'center' },
  previewCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E',
    borderRadius: 14, padding: 14, width: '100%', gap: 12,
  },
  previewAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#1C1C1E',
    alignItems: 'center', justifyContent: 'center',
  },
  previewInitials: { fontSize: 16, fontWeight: '700', color: C.label },
  previewText: { flex: 1 },
  previewName: { fontSize: 17, fontWeight: '600', color: C.label, marginBottom: 2 },
  previewSub: { fontSize: 14, color: C.secondaryLabel, lineHeight: 19 },
  menu: {
    marginTop: 8, backgroundColor: '#000000', borderRadius: 14, overflow: 'hidden', width: '100%',
    borderWidth: 1, borderColor: '#2F3336',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    minHeight: 48, paddingHorizontal: 16,
  },
  menuItemBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#2F3336' },
  menuLabel: { fontSize: 16, color: C.label },
  menuLabelDestructive: { color: '#FF3B30' },
});


// ─── Channel Row ─────────────────────────────────────────────────────────────

function ChannelRow({
  room,
  isMuted,
  onPress,
  onDelete,
  onToggleMute,
  onTogglePin,
  onShowPreview,
  onCall,
  onVideoCall,
}: {
  room: RoomV3;
  isMuted: boolean;
  onPress: () => void;
  onDelete: () => void;
  onToggleMute: () => void;
  onTogglePin: () => void;
  onShowPreview: (data: PreviewData) => void;
  onCall: () => void;
  onVideoCall: () => void;
}) {
  const rowRef = useRef<View>(null);
  const swipeableRef = useRef<Swipeable>(null);
  const longPressedRef = useRef(false);

  const handleLongPress = () => {
    longPressedRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const muteLabel = isMuted ? 'Show Alerts' : 'Mute';
    rowRef.current?.measureInWindow((_x, y) => {
      onShowPreview({
        type: 'channel',
        title: room.name,
        subtitle: `${room.memberCount} members`,
        initials: room.initials,
        isChannel: true,
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

  const renderRightActions = () => (
    <View style={s.swipeActions}>
      <Pressable
        style={s.swipePin}
        onPress={() => {
          swipeableRef.current?.close();
          onTogglePin();
        }}
      >
        <IconSymbol name={room.pinned ? 'pin.slash.fill' : 'pin.fill'} size={20} color="#FFFFFF" />
        <Text style={s.swipeActionText}>{room.pinned ? 'Unpin' : 'Pin'}</Text>
      </Pressable>
      <Pressable
        style={s.swipeMute}
        onPress={() => {
          swipeableRef.current?.close();
          onToggleMute();
        }}
      >
        <IconSymbol name={isMuted ? 'bell.fill' : 'bell.slash.fill'} size={20} color="#FFFFFF" />
        <Text style={s.swipeActionText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
      </Pressable>
    </View>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={() => <View style={{ width: 1 }} />}
      leftThreshold={60}
      overshootLeft={false}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      onSwipeableWillOpen={(direction) => {
        if (direction === 'left') {
          swipeableRef.current?.close();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          openSidePanel();
        }
      }}
    >
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
        {/* Unread dot */}
        <View style={s.unreadCol}>
          {room.unread && <View style={[s.unreadDot, { backgroundColor: '#FFFFFF' }]} />}
        </View>

        {/* Square channel icon */}
        <View style={s.channelIcon}>
          <Text style={s.channelInitials}>{room.initials}</Text>
          {room.locked && (
            <View style={s.lockBadge}>
              <IconSymbol name="lock.fill" size={8} color="#A1A1AA" />
            </View>
          )}
        </View>

        {/* Content */}
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
    </Swipeable>
  );
}

// ─── DM Row ──────────────────────────────────────────────────────────────────

function DMRow({
  thread,
  isMuted,
  onPress,
  onDelete,
  onToggleMute,
  onTogglePin,
  onShowPreview,
  onCall,
  onVideoCall,
}: {
  thread: InboxThreadV3;
  isMuted: boolean;
  onPress: () => void;
  onDelete: () => void;
  onToggleMute: () => void;
  onTogglePin: () => void;
  onShowPreview: (data: PreviewData) => void;
  onCall: () => void;
  onVideoCall: () => void;
}) {
  const rowRef = useRef<View>(null);
  const swipeableRef = useRef<Swipeable>(null);
  const longPressedRef = useRef(false);

  const handleLongPress = () => {
    longPressedRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const muteLabel = isMuted ? 'Show Alerts' : 'Mute';
    const readLabel = thread.unread ? 'Mark as Read' : 'Mark as Unread';

    rowRef.current?.measureInWindow((_x, y) => {
      onShowPreview({
        type: 'dm',
        title: thread.name,
        subtitle: thread.preview,
        initials: thread.initials,
        isChannel: false,
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

  const renderRightActions = () => (
    <View style={s.swipeActions}>
      <Pressable
        style={s.swipePin}
        onPress={() => {
          swipeableRef.current?.close();
          onTogglePin();
        }}
      >
        <IconSymbol name={thread.pinned ? 'pin.slash.fill' : 'pin.fill'} size={20} color="#FFFFFF" />
        <Text style={s.swipeActionText}>{thread.pinned ? 'Unpin' : 'Pin'}</Text>
      </Pressable>
      <Pressable
        style={s.swipeMute}
        onPress={() => {
          swipeableRef.current?.close();
          onToggleMute();
        }}
      >
        <IconSymbol name={isMuted ? 'bell.fill' : 'bell.slash.fill'} size={20} color="#FFFFFF" />
        <Text style={s.swipeActionText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
      </Pressable>
    </View>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={() => <View style={{ width: 1 }} />}
      leftThreshold={60}
      overshootLeft={false}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      onSwipeableWillOpen={(direction) => {
        if (direction === 'left') {
          swipeableRef.current?.close();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          openSidePanel();
        }
      }}
    >
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
        {/* Unread dot */}
        <View style={s.unreadCol}>
          {thread.unread && <View style={[s.unreadDot, { backgroundColor: '#FFFFFF' }]} />}
        </View>

        {/* Circular avatar */}
        <View style={s.dmAvatar}>
          <Text style={s.dmAvatarText}>{thread.initials}</Text>
        </View>

        {/* Content */}
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
    </Swipeable>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function MessagesListScreen() {
  const insets = useSafeAreaInsets();
  const mode = useMode();
  const router = useRouter();

  const [mutedIds, setMutedIds] = useState<Set<string>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [composeVisible, setComposeVisible] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [filter, setFilter] = useState<FilterMode>('all');

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

  // Mode-specific channels
  const channels = useMemo(() => {
    if (filter === 'dms') return [];
    const list = getRooms(mode).filter((r) => !deletedIds.has(r.id));
    return list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [mode, deletedIds, filter]);

  // Cross-org DMs
  const dms = useMemo(() => {
    if (filter === 'channels') return [];
    const list = getGlobalDMs().filter((t) => !deletedIds.has(t.id));
    return list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [deletedIds, filter]);

  // Pinned items (channels + DMs)
  const pinnedItems = useMemo(() => {
    const pinnedChannels = channels.filter((r) => r.pinned);
    const pinnedDMs = dms.filter((t) => t.pinned);
    return [
      ...pinnedChannels.map((r) => ({ id: r.id, initials: r.initials, name: r.name, isChannel: true, unread: r.unread })),
      ...pinnedDMs.map((t) => ({ id: t.id, initials: t.initials, name: t.name, isChannel: false, unread: t.unread })),
    ];
  }, [channels, dms]);

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
      <ScrollView style={s.scrollView} contentContainerStyle={{ paddingTop: 28, paddingBottom: 100 }} onScroll={handleScroll} scrollEventThrottle={16}>
        {/* ── Pinned row (horizontal scroll of circular avatars) ── */}
        {pinnedItems.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.pinnedRow}
          >
            {pinnedItems.map((item) => (
              <Pressable
                key={item.id}
                style={s.pinnedCell}
                onPress={() => {
                  if (item.isChannel) {
                    const room = channels.find((r) => r.id === item.id);
                    if (room) openChannel(room);
                  } else {
                    const thread = dms.find((t) => t.id === item.id);
                    if (thread) openDM(thread);
                  }
                }}
              >
                <View
                  style={[
                    s.pinnedAvatar,
                    item.isChannel && { borderRadius: 12, backgroundColor: C.channelIconBg },
                    item.unread && { borderWidth: 2, borderColor: '#FFFFFF' },
                  ]}
                >
                  <Text style={s.pinnedInitials}>{item.initials}</Text>
                </View>
                <Text style={s.pinnedName} numberOfLines={1}>
                  {item.name.replace(/^#/, '').split(' ')[0]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* ── Filter pills ── */}
        <View style={s.filterPillRow}>
          {(['all', 'channels', 'dms'] as const).map((f) => (
            <Pressable
              key={f}
              style={[s.filterPill, filter === f && s.filterPillActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[s.filterPillText, filter === f && s.filterPillTextActive]}>
                {f === 'all' ? 'All' : f === 'channels' ? 'Channels' : 'DMs'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Channels list ── */}
        {channels.length > 0 && filter !== 'dms' && (
          <View style={s.sectionDivider}>
            <Text style={s.sectionLabel}>Channels</Text>
          </View>
        )}
        {channels.map((room, i) => (
          <View key={room.id}>
            {i > 0 && <View style={s.separator} />}
            <ChannelRow
              room={room}
              isMuted={mutedIds.has(room.id)}
              onPress={() => openChannel(room)}
              onDelete={() => setDeletedIds((prev) => new Set(prev).add(room.id))}
              onToggleMute={() => toggleMute(room.id)}
              onTogglePin={() => { /* pin toggle — wired to backend */ }}
              onShowPreview={setPreviewData}
              onCall={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); initiateCall({ contactName: room.name, contactInitials: room.initials, mode: room.mode, type: 'audio' }); }}
              onVideoCall={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); initiateCall({ contactName: room.name, contactInitials: room.initials, mode: room.mode, type: 'video' }); }}
            />
          </View>
        ))}

        {/* ── DMs list ── */}
        {dms.length > 0 && filter !== 'channels' && (
          <View style={s.sectionDivider}>
            <Text style={s.sectionLabel}>Direct Messages</Text>
          </View>
        )}
        {dms.map((thread, i) => (
          <View key={thread.id}>
            {i > 0 && <View style={s.separator} />}
            <DMRow
              thread={thread}
              isMuted={mutedIds.has(thread.id)}
              onPress={() => openDM(thread)}
              onDelete={() => setDeletedIds((prev) => new Set(prev).add(thread.id))}
              onToggleMute={() => toggleMute(thread.id)}
              onTogglePin={() => { /* pin toggle — wired to backend */ }}
              onShowPreview={setPreviewData}
              onCall={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); initiateCall({ contactName: thread.name, contactInitials: thread.initials, mode: thread.mode, type: 'audio' }); }}
              onVideoCall={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); initiateCall({ contactName: thread.name, contactInitials: thread.initials, mode: thread.mode, type: 'video' }); }}
            />
          </View>
        ))}
      </ScrollView>

      {/* ── FAB compose button ── */}
      <Pressable
        style={[s.fab, { backgroundColor: '#FFFFFF', bottom: insets.bottom + 60 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setComposeVisible(true);
        }}
      >
        <IconSymbol name="square.and.pencil" size={22} color="#000000" />
      </Pressable>

      {/* ── Compose sheet ── */}
      <NewDMSheet
        visible={composeVisible}
        onClose={() => setComposeVisible(false)}
        onSend={handleComposeSend}
        accent="#FFFFFF"
      />

      {/* ── Preview overlay ── */}
      {previewData && (
        <PreviewOverlay data={previewData} onClose={() => setPreviewData(null)} />
      )}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollView: { flex: 1 },

  // Pinned
  pinnedRow: { paddingHorizontal: 16, gap: 14, paddingBottom: 16 },
  pinnedCell: { alignItems: 'center', width: 64 },
  pinnedAvatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#1C1C1E',
    alignItems: 'center', justifyContent: 'center',
  },
  pinnedInitials: { fontSize: 15, fontWeight: '700', color: C.label },
  pinnedName: {
    fontSize: 11, color: C.label, fontWeight: '500', textAlign: 'center', marginTop: 4,
  },

  // Section divider
  sectionDivider: {
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8,
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
  unreadDot: { width: 10, height: 10, borderRadius: 5 },
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

  // FAB
  fab: {
    position: 'absolute', right: 20, width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 8,
  },

  // Swipe actions (pin + mute; full swipe = delete)
  swipeActions: { flexDirection: 'row' },
  swipePin: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    gap: 4,
  },
  swipeMute: {
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    gap: 4,
  },
  swipeActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Filter pills
  filterPillRow: {
    flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12,
  },
  filterPill: {
    backgroundColor: '#0B0F14',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14,
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
});
