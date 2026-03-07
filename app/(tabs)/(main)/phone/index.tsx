/**
 * Phone — Landing view mirroring Messages layout.
 * Pinned favorite bubbles > Groups (squircle) > Contacts (circular).
 * Tap row = audio call (default). Icons: message + video (cross-nav).
 */

import React, { useMemo, useRef, useCallback } from 'react';
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

export default function PhoneScreen() {
  const insets = useSafeAreaInsets();
  const mode = useMode();
  const router = useRouter();

  const favorites = useMemo(() => getFavoriteContacts(), []);
  const groups = useMemo(() => PHONE_GROUPS, []);
  const contacts = useMemo(() => PHONE_CONTACTS, []);

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

  return (
    <View
      style={[s.container, { paddingTop: insets.top }]}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
    >
      <ScrollView
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
                <Pressable
                  style={({ pressed }) => [s.row, pressed && { backgroundColor: 'rgba(255,255,255,0.04)' }]}
                  onPress={() => callGroupAudio(group)}
                >
                  {/* Square squircle icon */}
                  <View style={s.groupIcon}>
                    <Text style={s.groupInitials}>{group.initials}</Text>
                  </View>
                  {/* Info */}
                  <View style={s.rowContent}>
                    <Text style={s.rowName} numberOfLines={1}>{group.name}</Text>
                    <Text style={s.rowSub}>{group.memberCount} members</Text>
                  </View>
                  {/* Cross-nav: message + video */}
                  <Pressable
                    style={({ pressed }) => [s.crossNavBtn, pressed && s.crossNavPressed]}
                    onPress={() => openMessage(group.name)}
                    hitSlop={6}
                  >
                    <IconSymbol name="bubble.left.fill" size={16} color={C.secondary} />
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [s.crossNavBtn, pressed && s.crossNavPressed]}
                    onPress={() => callGroupVideo(group)}
                    hitSlop={6}
                  >
                    <IconSymbol name="video.fill" size={16} color={C.secondary} />
                  </Pressable>
                </Pressable>
              </View>
            ))}
          </>
        )}

        {/* ── Contacts ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionLabel}>Contacts</Text>
        </View>
        {contacts.map((contact, i) => (
          <View key={contact.id}>
            {i > 0 && <View style={s.separator} />}
            <Pressable
              style={({ pressed }) => [s.row, pressed && { backgroundColor: 'rgba(255,255,255,0.04)' }]}
              onPress={() => callAudio(contact)}
            >
              {/* Circular avatar with online indicator */}
              <View style={s.contactAvatar}>
                <Text style={s.contactInitials}>{contact.initials}</Text>
                {contact.online && <View style={s.onlineDot} />}
              </View>
              {/* Info */}
              <View style={s.rowContent}>
                <Text style={s.rowName} numberOfLines={1}>{contact.name}</Text>
                <View style={s.contactMeta}>
                  <Text style={s.rowSub}>{contact.username}</Text>
                  <Text style={s.contactRole}>{contact.role}</Text>
                </View>
              </View>
              {/* Cross-nav: message + video */}
              <Pressable
                style={({ pressed }) => [s.crossNavBtn, pressed && s.crossNavPressed]}
                onPress={() => openMessage(contact.name)}
                hitSlop={6}
              >
                <IconSymbol name="bubble.left.fill" size={16} color={C.secondary} />
              </Pressable>
              <Pressable
                style={({ pressed }) => [s.crossNavBtn, pressed && s.crossNavPressed]}
                onPress={() => callVideo(contact)}
                hitSlop={6}
              >
                <IconSymbol name="video.fill" size={16} color={C.secondary} />
              </Pressable>
            </Pressable>
          </View>
        ))}
      </ScrollView>
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

  // Cross-nav buttons
  crossNavBtn: { padding: 6 },
  crossNavPressed: { opacity: 0.5 },

  // Separator
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 72 },
});
