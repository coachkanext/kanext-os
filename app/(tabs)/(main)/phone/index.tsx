/**
 * Phone — Landing view mirroring Messages layout.
 * Pinned favorite bubbles > Groups (squircle) > Contacts (circular).
 * Tap row = audio call (default). Icons: message + video (cross-nav).
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useMode } from '@/context/app-context';
import {
  PHONE_CONTACTS,
  PHONE_GROUPS,
  getFavoriteContacts,
  type PhoneContact,
  type PhoneGroup,
} from '@/data/mock-phone';
import { initiateCall } from '@/utils/global-call';
import { openSidePanel } from '@/utils/global-side-panel';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';

const C = {
  bg: '#000000',
  surface: '#0B0F14',
  channelIconBg: '#0B1220',
  label: '#FFFFFF',
  secondary: '#A1A1AA',
  muted: '#52525B',
  separator: '#38383A',
  green: '#34D399',
  online: '#34C759',
};

// ─── Long-press context menu ─────────────────────────────────────────────────

type PreviewData = {
  title: string;
  subtitle: string;
  initials: string;
  isGroup: boolean;
  pageY: number;
  actions: { key: string; label: string; icon: string; destructive?: boolean }[];
  onAction: (key: string) => void;
};

function PreviewOverlay({ data, onClose }: { data: PreviewData; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 120, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const dismiss = useCallback(() => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true })
      .start(() => onClose());
  }, [fadeAnim, onClose]);

  const handleAction = useCallback((key: string) => {
    data.onAction(key);
    dismiss();
  }, [data.onAction, dismiss]);

  const cardTop = Math.max(insets.top + 40, Math.min(data.pageY - 30, 340));

  return (
    <Modal transparent animationType="none" onRequestClose={dismiss}>
      <Animated.View style={[pvS.overlay, { opacity: fadeAnim }]}>
        <Pressable style={pvS.backdrop} onPress={dismiss} />
        <Animated.View style={[pvS.content, { transform: [{ scale: scaleAnim }], top: cardTop }]}>
          <View style={pvS.previewCard}>
            <View style={[pvS.previewAvatar, data.isGroup ? { borderRadius: 12, backgroundColor: C.channelIconBg } : { borderRadius: 24 }]}>
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
  previewSub: { fontSize: 14, color: C.secondary, lineHeight: 19 },
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

// ─── Group Row (with swipe) ──────────────────────────────────────────────────

function GroupRow({
  group,
  onPress,
  onMessage,
  onVideoCall,
  onLongPress,
}: {
  group: PhoneGroup;
  onPress: () => void;
  onMessage: () => void;
  onVideoCall: () => void;
  onLongPress: (pageY: number) => void;
}) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = () => (
    <View style={s.swipeActions}>
      <Pressable style={s.swipePin} onPress={() => { swipeableRef.current?.close(); }}>
        <IconSymbol name="pin.fill" size={20} color="#FFFFFF" />
        <Text style={s.swipeActionText}>Favorite</Text>
      </Pressable>
      <Pressable style={s.swipeMute} onPress={() => { swipeableRef.current?.close(); }}>
        <IconSymbol name="bell.slash.fill" size={20} color="#FFFFFF" />
        <Text style={s.swipeActionText}>Mute</Text>
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
        style={({ pressed }) => [s.row, pressed && { backgroundColor: 'rgba(255,255,255,0.04)' }]}
        onPress={onPress}
        onLongPress={(e) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onLongPress(e.nativeEvent.pageY);
        }}
        delayLongPress={400}
      >
        <View style={s.groupIcon}>
          <Text style={s.groupInitials}>{group.initials}</Text>
        </View>
        <View style={s.rowContent}>
          <Text style={s.rowName} numberOfLines={1}>{group.name}</Text>
          <Text style={s.rowSub}>{group.memberCount} members</Text>
        </View>
      </Pressable>
    </Swipeable>
  );
}

// ─── Contact Row (with swipe) ────────────────────────────────────────────────

function ContactRow({
  contact,
  onPress,
  onMessage,
  onVideoCall,
  onLongPress,
}: {
  contact: PhoneContact;
  onPress: () => void;
  onMessage: () => void;
  onVideoCall: () => void;
  onLongPress: (pageY: number) => void;
}) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = () => (
    <View style={s.swipeActions}>
      <Pressable style={s.swipePin} onPress={() => { swipeableRef.current?.close(); }}>
        <IconSymbol name="pin.fill" size={20} color="#FFFFFF" />
        <Text style={s.swipeActionText}>Favorite</Text>
      </Pressable>
      <Pressable style={s.swipeMute} onPress={() => { swipeableRef.current?.close(); }}>
        <IconSymbol name="bell.slash.fill" size={20} color="#FFFFFF" />
        <Text style={s.swipeActionText}>Mute</Text>
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
        style={({ pressed }) => [s.row, pressed && { backgroundColor: 'rgba(255,255,255,0.04)' }]}
        onPress={onPress}
        onLongPress={(e) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onLongPress(e.nativeEvent.pageY);
        }}
        delayLongPress={400}
      >
        <View style={s.contactAvatar}>
          <Text style={s.contactInitials}>{contact.initials}</Text>
          {contact.online && <View style={s.onlineDot} />}
        </View>
        <View style={s.rowContent}>
          <Text style={s.rowName} numberOfLines={1}>{contact.name}</Text>
          <View style={s.contactMeta}>
            <Text style={s.rowSub}>{contact.username}</Text>
            <Text style={s.contactRole}>{contact.role}</Text>
          </View>
        </View>
      </Pressable>
    </Swipeable>
  );
}

export default function PhoneScreen() {
  const insets = useSafeAreaInsets();
  const mode = useMode();
  const router = useRouter();

  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});

  const favorites = useMemo(() => getFavoriteContacts(), []);
  const groups = useMemo(() => PHONE_GROUPS, []);
  const contacts = useMemo(() => PHONE_CONTACTS, []);

  // Group contacts alphabetically
  const groupedContacts = useMemo(() => {
    const map: Record<string, PhoneContact[]> = {};
    for (const c of contacts) {
      const letter = c.name.charAt(0).toUpperCase();
      if (!map[letter]) map[letter] = [];
      map[letter].push(c);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [contacts]);

  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

  // Right-swipe detection via raw touch events
  const touchRef = useRef({ x: 0, y: 0, t: 0, triggered: false });
  const onTouchStart = useCallback((e: any) => {
    touchRef.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY, t: Date.now(), triggered: false };
  }, []);
  const onTouchMove = useCallback((e: any) => {
    if (touchRef.current.triggered) return;
    const dx = e.nativeEvent.pageX - touchRef.current.x;
    const dy = e.nativeEvent.pageY - touchRef.current.y;
    if (dx > 60 && Math.abs(dy) < 40 && Date.now() - touchRef.current.t < 500) {
      touchRef.current.triggered = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      openSidePanel();
    }
  }, []);

  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  const callAudio = (contact: PhoneContact) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    initiateCall({ contactName: contact.name, contactInitials: contact.initials, mode: contact.mode, type: 'audio' });
  };

  const callVideo = (contact: PhoneContact) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    initiateCall({ contactName: contact.name, contactInitials: contact.initials, mode: contact.mode, type: 'video' });
  };

  const openMessage = (name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/messages/[threadId]', params: { threadId: name, type: 'dm', title: name } } as any);
  };

  const callGroupAudio = (group: PhoneGroup) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    initiateCall({ contactName: group.name, contactInitials: group.initials, mode: group.mode, type: 'audio' });
  };

  const callGroupVideo = (group: PhoneGroup) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    initiateCall({ contactName: group.name, contactInitials: group.initials, mode: group.mode, type: 'video' });
  };

  const longPressContact = (contact: PhoneContact, pageY: number) => {
    setPreviewData({
      title: contact.name,
      subtitle: contact.role,
      initials: contact.initials,
      isGroup: false,
      pageY,
      actions: [
        { key: 'message', label: 'Message', icon: 'bubble.left.fill' },
        { key: 'video', label: 'Video Call', icon: 'video.fill' },
        { key: 'copy', label: 'Copy Number', icon: 'doc.on.doc.fill' },
        { key: 'share', label: 'Share Contact', icon: 'square.and.arrow.up' },
        { key: 'profile', label: 'View Profile', icon: 'person.fill' },
        { key: 'pin', label: 'Pin to Favorites', icon: 'pin.fill' },
        { key: 'delete', label: 'Delete', icon: 'trash.fill', destructive: true },
      ],
      onAction: (key) => {
        if (key === 'message') openMessage(contact.name);
        else if (key === 'video') callVideo(contact);
      },
    });
  };

  const longPressGroup = (group: PhoneGroup, pageY: number) => {
    setPreviewData({
      title: group.name,
      subtitle: `${group.memberCount} members`,
      initials: group.initials,
      isGroup: true,
      pageY,
      actions: [
        { key: 'message', label: 'Message', icon: 'bubble.left.fill' },
        { key: 'video', label: 'Video Call', icon: 'video.fill' },
        { key: 'copy', label: 'Copy Number', icon: 'doc.on.doc.fill' },
        { key: 'share', label: 'Share Contact', icon: 'square.and.arrow.up' },
        { key: 'profile', label: 'View Profile', icon: 'person.fill' },
        { key: 'pin', label: 'Pin to Favorites', icon: 'pin.fill' },
        { key: 'delete', label: 'Delete', icon: 'trash.fill', destructive: true },
      ],
      onAction: (key) => {
        if (key === 'message') openMessage(group.name);
        else if (key === 'video') callGroupVideo(group);
      },
    });
  };

  return (
    <View
      style={[s.container, { paddingTop: insets.top }]}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
    >
      <ScrollView
        ref={scrollRef}
        style={s.scrollView}
        contentContainerStyle={{ paddingTop: 28, paddingBottom: 100 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Favorite bubbles (horizontal) ── */}
        {favorites.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.favRow}
          >
            {favorites.map((fav) => (
              <Pressable
                key={fav.id}
                style={s.favCell}
                onPress={() => callAudio(fav)}
              >
                <View style={s.favAvatar}>
                  <Text style={s.favInitials}>{fav.initials}</Text>
                  {fav.online && <View style={s.onlineDotBubble} />}
                </View>
                <Text style={s.favName} numberOfLines={1}>
                  {fav.name.split(' ')[0]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* ── Groups ── */}
        {groups.length > 0 && (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionLabel}>Groups</Text>
            </View>
            {groups.map((group, i) => (
              <View key={group.id}>
                {i > 0 && <View style={s.separator} />}
                <GroupRow
                  group={group}
                  onPress={() => callGroupAudio(group)}
                  onMessage={() => openMessage(group.name)}
                  onVideoCall={() => callGroupVideo(group)}
                  onLongPress={(pageY) => longPressGroup(group, pageY)}
                />
              </View>
            ))}
          </>
        )}

        {/* ── Contacts (grouped by letter) ── */}
        {groupedContacts.map(([letter, letterContacts]) => (
          <View
            key={letter}
            onLayout={(e) => { sectionOffsets.current[letter] = e.nativeEvent.layout.y; }}
          >
            <View style={s.letterHeader}>
              <Text style={s.letterHeaderText}>{letter}</Text>
            </View>
            {letterContacts.map((contact, i) => (
              <View key={contact.id}>
                {i > 0 && <View style={s.separator} />}
                <ContactRow
                  contact={contact}
                  onPress={() => callAudio(contact)}
                  onMessage={() => openMessage(contact.name)}
                  onVideoCall={() => callVideo(contact)}
                  onLongPress={(pageY) => longPressContact(contact, pageY)}
                />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* ── Alphabet scrubber (right edge) ── */}
      <View style={s.scrubber} pointerEvents="box-only">
        {ALPHA.map((letter) => {
          const hasSection = sectionOffsets.current[letter] != null;
          return (
            <Pressable
              key={letter}
              onPress={() => {
                const y = sectionOffsets.current[letter];
                if (y != null) {
                  Haptics.selectionAsync();
                  scrollRef.current?.scrollTo({ y, animated: true });
                }
              }}
              hitSlop={{ left: 10, right: 10 }}
            >
              <Text style={[s.scrubberLetter, hasSection && s.scrubberLetterActive]}>{letter}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── Long-press context menu ── */}
      {previewData && (
        <PreviewOverlay data={previewData} onClose={() => setPreviewData(null)} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollView: { flex: 1 },

  // Favorites row
  favRow: { paddingHorizontal: 16, gap: 14, paddingBottom: 16 },
  favCell: { alignItems: 'center', width: 64 },
  favAvatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#1C1C1E',
    alignItems: 'center', justifyContent: 'center',
  },
  favInitials: { fontSize: 15, fontWeight: '700', color: C.label },
  favName: {
    fontSize: 11, color: C.label, fontWeight: '500', textAlign: 'center', marginTop: 4,
  },
  onlineDotBubble: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: C.online,
    borderWidth: 2, borderColor: C.bg,
  },

  // Section headers
  sectionHeader: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  sectionLabel: {
    fontSize: 13, fontWeight: '600', color: C.secondary,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  // Shared row
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingLeft: 16, paddingRight: 12,
    backgroundColor: C.bg,
  },
  rowContent: { flex: 1, marginLeft: 12, marginRight: 8 },
  rowName: { fontSize: 16, fontWeight: '500', color: C.label },
  rowSub: { fontSize: 13, color: C.muted },

  // Group icon (square squircle — matches Messages channels)
  groupIcon: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: C.channelIconBg,
    alignItems: 'center', justifyContent: 'center',
  },
  groupInitials: { fontSize: 14, fontWeight: '700', color: C.label },

  // Contact avatar (circular)
  contactAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#1C1C1E',
    alignItems: 'center', justifyContent: 'center',
  },
  contactInitials: { fontSize: 14, fontWeight: '600', color: C.label },
  contactMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 1 },
  contactRole: { fontSize: 13, color: C.muted },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: C.online,
    borderWidth: 2, borderColor: C.bg,
  },

  // Letter section headers
  letterHeader: {
    paddingHorizontal: 16, paddingTop: 18, paddingBottom: 4,
    backgroundColor: C.bg,
  },
  letterHeaderText: {
    fontSize: 14, fontWeight: '700', color: C.secondary,
  },

  // Alphabet scrubber (right edge)
  scrubber: {
    position: 'absolute', right: 2, top: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
    paddingVertical: 60,
  },
  scrubberLetter: {
    fontSize: 10, fontWeight: '600', color: '#52525B',
    paddingVertical: 1, paddingHorizontal: 4,
  },
  scrubberLetterActive: {
    color: '#007AFF',
  },

  // Separator
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 72 },

  // Swipe actions (pin + mute; stays open on release)
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
});
