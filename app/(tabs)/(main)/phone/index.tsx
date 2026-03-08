/**
 * Phone — 2-page swipeable layout.
 * Page 0: Groups (squircle). Page 1: Contacts (circular, with alphabet scrubber).
 * Favorites row above pages. Long press for actions (no row swipe).
 * Tap favorite = instant audio call. Tap contact/group = audio call.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { SwipeableTwoPage } from '@/components/ui/swipeable-two-page';
import { PinnedBubblesRow, type PinnedBubble } from '@/components/ui/pinned-bubbles-row';
import { LongPressContextMenu, type ContextMenuData } from '@/components/ui/long-press-context-menu';
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
  channelIconBg: '#0B1220',
  label: '#FFFFFF',
  secondary: '#A1A1AA',
  muted: '#52525B',
  separator: '#38383A',
  online: '#34C759',
};

// ─── Group Row (no swipe) ───────────────────────────────────────────────────

function GroupRow({
  group,
  onPress,
  onLongPress,
}: {
  group: PhoneGroup;
  onPress: () => void;
  onLongPress: (pageY: number) => void;
}) {
  return (
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
  );
}

// ─── Contact Row (no swipe) ─────────────────────────────────────────────────

function ContactRow({
  contact,
  onPress,
  onLongPress,
}: {
  contact: PhoneContact;
  onPress: () => void;
  onLongPress: (pageY: number) => void;
}) {
  return (
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
  );
}

export default function PhoneScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);

  const contactsScrollRef = useRef<ScrollView>(null);
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

  // Favorites as PinnedBubble shape
  const favBubbles: PinnedBubble[] = useMemo(() =>
    favorites.map((f) => ({
      id: f.id,
      initials: f.initials,
      name: f.name,
      isSquircle: false,
      online: f.online,
    })),
  [favorites]);

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

  const handleFavPress = (id: string) => {
    const fav = favorites.find((f) => f.id === id);
    if (fav) callAudio(fav);
  };

  const longPressContact = (contact: PhoneContact, pageY: number) => {
    setMenuData({
      title: contact.name,
      subtitle: contact.role,
      initials: contact.initials,
      isSquircle: false,
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
    setMenuData({
      title: group.name,
      subtitle: `${group.memberCount} members`,
      initials: group.initials,
      isSquircle: true,
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
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Favorites row */}
      <View style={{ paddingTop: 28 }}>
        <PinnedBubblesRow items={favBubbles} onPress={handleFavPress} />
      </View>

      {/* 2-page swipeable: Groups ↔ Contacts */}
      <SwipeableTwoPage
        activeIndex={pageIndex}
        onPageChange={setPageIndex}
        onEdgeRight={openSidePanel}
      >
        {/* Page 0: Groups */}
        <ScrollView
          style={s.pageScroll}
          contentContainerStyle={{ paddingBottom: 100 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>Groups</Text>
          </View>
          {groups.map((group, i) => (
            <View key={group.id}>
              {i > 0 && <View style={s.separator} />}
              <GroupRow
                group={group}
                onPress={() => callGroupAudio(group)}
                onLongPress={(pageY) => longPressGroup(group, pageY)}
              />
            </View>
          ))}
        </ScrollView>

        {/* Page 1: Contacts */}
        <ScrollView
          ref={contactsScrollRef}
          style={s.pageScroll}
          contentContainerStyle={{ paddingBottom: 100 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>Contacts</Text>
          </View>
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
                    onLongPress={(pageY) => longPressContact(contact, pageY)}
                  />
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </SwipeableTwoPage>

      {/* Alphabet scrubber (only on page 1) */}
      {pageIndex === 1 && (
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
                    contactsScrollRef.current?.scrollTo({ y, animated: true });
                  }
                }}
                hitSlop={{ left: 10, right: 10 }}
              >
                <Text style={[s.scrubberLetter, hasSection && s.scrubberLetterActive]}>
                  {letter}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Long-press context menu */}
      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  pageScroll: { flex: 1 },

  // Section headers
  sectionHeader: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
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

  // Group icon (square squircle)
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
});
