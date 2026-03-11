/**
 * Phone — 3-page swipeable layout. Footer icon position 4. Universal across all modes.
 * Page 0 (default): Recents — call history with [All] [Missed] filter pills.
 * Page 1: Contacts — alphabetical list with letter headers, online dots, org+role.
 * Page 2: Groups — group call presets with squircle icons, member count, last call time.
 * 3 dots at top. Swipe right on page 0 = side panel.
 * FAB on pages 1 and 2.
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

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { SwipeablePages } from '@/components/ui/swipeable-two-page';
import { LongPressContextMenu, type ContextMenuData } from '@/components/ui/long-press-context-menu';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  PHONE_CONTACTS,
  PHONE_GROUPS,
  RECENT_CALLS,
  MODE_BADGE_COLORS,
  MODE_BADGE_LABELS,
  type PhoneContact,
  type PhoneGroup,
  type RecentCall,
  type CallDirection,
} from '@/data/mock-phone';
import { initiateCall } from '@/utils/global-call';
import { openSidePanel } from '@/utils/global-side-panel';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';

// ─── Main Screen ────────────────────────────────────────────────────────────

type RecentsFilter = 'all' | 'missed';

export default function PhoneScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  const DIRECTION_ICONS: Record<CallDirection, { icon: string; color: string }> = useMemo(() => ({
    incoming: { icon: 'arrow.down.left', color: C.muted },
    outgoing: { icon: 'arrow.up.right', color: C.muted },
    missed: { icon: 'arrow.down.left', color: C.red },
    video: { icon: 'video.fill', color: C.muted },
  }), [C]);

  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);
  const [recentsFilter, setRecentsFilter] = useState<RecentsFilter>('all');

  const contactsScrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});

  // ── Data ──
  const recentCalls = useMemo(() => {
    if (recentsFilter === 'missed') return RECENT_CALLS.filter((c) => c.direction === 'missed');
    return RECENT_CALLS;
  }, [recentsFilter]);

  const contacts = useMemo(() => PHONE_CONTACTS, []);
  const groups = useMemo(() => PHONE_GROUPS, []);

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

  // ── Scroll footer hide ──
  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  // ── Call actions ──
  const callAudio = useCallback((name: string, initials: string, mode: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    initiateCall({ contactName: name, contactInitials: initials, mode, type: 'audio' });
  }, []);

  const callVideo = useCallback((name: string, initials: string, mode: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    initiateCall({ contactName: name, contactInitials: initials, mode, type: 'video' });
  }, []);

  const openMessage = useCallback((name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/messages/[threadId]', params: { threadId: name, type: 'dm', title: name } } as any);
  }, [router]);

  // ── Long press: Recents ──
  const longPressRecent = useCallback((call: RecentCall, pageY: number) => {
    setMenuData({
      title: call.name,
      subtitle: call.username,
      initials: call.initials,
      pageY,
      actions: [
        { key: 'audio', label: 'Audio Call', icon: 'phone.fill' },
        { key: 'video', label: 'Video Call', icon: 'video.fill' },
        { key: 'message', label: 'Message', icon: 'bubble.left.fill' },
        { key: 'profile', label: 'View Profile', icon: 'person.fill' },
        { key: 'copy', label: 'Copy Number', icon: 'doc.on.doc.fill' },
        { key: 'block', label: 'Block', icon: 'hand.raised.fill', destructive: true },
        { key: 'delete', label: 'Delete from Recents', icon: 'trash.fill', destructive: true },
      ],
      onAction: (key) => {
        if (key === 'audio') callAudio(call.name, call.initials, call.mode);
        else if (key === 'video') callVideo(call.name, call.initials, call.mode);
        else if (key === 'message') openMessage(call.name);
      },
    });
  }, [callAudio, callVideo, openMessage]);

  // ── Long press: Contacts ──
  const longPressContact = useCallback((contact: PhoneContact, pageY: number) => {
    setMenuData({
      title: contact.name,
      subtitle: `${contact.org} · ${contact.role}`,
      initials: contact.initials,
      pageY,
      actions: [
        { key: 'audio', label: 'Audio Call', icon: 'phone.fill' },
        { key: 'video', label: 'Video Call', icon: 'video.fill' },
        { key: 'message', label: 'Message', icon: 'bubble.left.fill' },
        { key: 'profile', label: 'View Profile', icon: 'person.fill' },
        { key: 'copy', label: 'Copy Number', icon: 'doc.on.doc.fill' },
        { key: 'share', label: 'Share Contact', icon: 'square.and.arrow.up' },
        { key: 'favorite', label: 'Add to Favorites', icon: 'star.fill' },
        { key: 'block', label: 'Block', icon: 'hand.raised.fill', destructive: true },
      ],
      onAction: (key) => {
        if (key === 'audio') callAudio(contact.name, contact.initials, contact.mode);
        else if (key === 'video') callVideo(contact.name, contact.initials, contact.mode);
        else if (key === 'message') openMessage(contact.name);
      },
    });
  }, [callAudio, callVideo, openMessage]);

  // ── Long press: Groups ──
  const longPressGroup = useCallback((group: PhoneGroup, pageY: number) => {
    setMenuData({
      title: group.name,
      subtitle: `${group.memberCount} members`,
      initials: group.initials,
      isSquircle: true,
      pageY,
      actions: [
        { key: 'audio', label: 'Audio Call', icon: 'phone.fill' },
        { key: 'video', label: 'Video Call', icon: 'video.fill' },
        { key: 'message', label: 'Message Group', icon: 'bubble.left.fill' },
        { key: 'members', label: 'View Members', icon: 'person.3.fill' },
        { key: 'edit', label: 'Edit Group', icon: 'pencil' },
        { key: 'pin', label: 'Pin', icon: 'pin.fill' },
        { key: 'delete', label: 'Delete', icon: 'trash.fill', destructive: true },
      ],
      onAction: (key) => {
        if (key === 'audio') callAudio(group.name, group.initials, group.mode);
        else if (key === 'video') callVideo(group.name, group.initials, group.mode);
        else if (key === 'message') openMessage(group.name);
      },
    });
  }, [callAudio, callVideo, openMessage]);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* 3-page swipeable: Recents | Contacts | Groups */}
      <SwipeablePages
        activeIndex={pageIndex}
        onPageChange={setPageIndex}
        onEdgeRight={openSidePanel}
      >
        {/* ── PAGE 0: RECENTS ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <View style={s.topBar}>
              <Text style={s.topBarTitle}>Recents</Text>
            </View>
            <View style={s.filterRow}>
              {([{ key: 'all', label: 'All' }, { key: 'missed', label: 'Missed' }] as { key: RecentsFilter; label: string }[]).map((f) => {
                const isActive = recentsFilter === f.key;
                return (
                  <Pressable
                    key={f.key}
                    style={[s.filterPill, isActive && s.filterPillActive]}
                    onPress={() => setRecentsFilter(f.key)}
                  >
                    <Text style={[s.filterText, isActive && s.filterTextActive]}>{f.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {recentCalls.length === 0 ? (
              <View style={s.emptyState}>
                <IconSymbol name="phone.fill" size={36} color={C.muted} />
                <Text style={s.emptyText}>No calls</Text>
              </View>
            ) : (
              recentCalls.map((call, idx) => {
                const isMissed = call.direction === 'missed';
                const dir = DIRECTION_ICONS[call.direction];
                const badgeColor = MODE_BADGE_COLORS[call.mode];
                const badgeLabel = MODE_BADGE_LABELS[call.mode];
                return (
                  <View key={call.id}>
                    {idx > 0 && <View style={s.separator} />}
                    <Pressable
                      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
                      onPress={() => callAudio(call.name, call.initials, call.mode)}
                      onLongPress={(e) => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        longPressRecent(call, e.nativeEvent.pageY);
                      }}
                      delayLongPress={400}
                    >
                      {/* Avatar */}
                      <View style={s.recentAvatar}>
                        <Text style={s.recentInitials}>{call.initials}</Text>
                      </View>

                      {/* Info */}
                      <View style={s.rowContent}>
                        <View style={s.recentNameRow}>
                          <Text style={[s.rowName, isMissed && { color: C.red }]} numberOfLines={1}>
                            {call.name}
                          </Text>
                          <View style={[s.modeBadge, { backgroundColor: badgeColor + '22' }]}>
                            <Text style={[s.modeBadgeText, { color: badgeColor }]}>{badgeLabel}</Text>
                          </View>
                        </View>
                        <View style={s.recentMeta}>
                          <IconSymbol name={dir.icon as any} size={12} color={dir.color} />
                          <Text style={[s.metaText, isMissed && { color: C.red }]}>
                            {call.username}
                          </Text>
                        </View>
                      </View>

                      {/* Right: duration/missed + timestamp */}
                      <View style={s.recentRight}>
                        <Text style={[s.recentDuration, isMissed && { color: C.red }]}>
                          {isMissed ? 'Missed' : call.duration ?? ''}
                        </Text>
                        <Text style={s.recentTimestamp}>{call.timestamp}</Text>
                      </View>
                    </Pressable>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* ── PAGE 1: CONTACTS ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <View style={s.topBar}>
              <Text style={s.topBarTitle}>Contacts</Text>
            </View>
          </View>
          <ScrollView
            ref={contactsScrollRef}
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
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
                    <Pressable
                      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
                      onPress={() => callAudio(contact.name, contact.initials, contact.mode)}
                      onLongPress={(e) => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        longPressContact(contact, e.nativeEvent.pageY);
                      }}
                      delayLongPress={400}
                    >
                      <View style={s.contactAvatar}>
                        <Text style={s.contactInitials}>{contact.initials}</Text>
                        {contact.online && <View style={s.onlineDot} />}
                      </View>
                      <View style={s.rowContent}>
                        <View style={s.contactNameRow}>
                          <Text style={s.rowName} numberOfLines={1}>{contact.name}</Text>
                          <Text style={s.contactUsername}>{contact.username}</Text>
                        </View>
                        <Text style={s.contactOrgRole} numberOfLines={1}>
                          {contact.org} · {contact.role}
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>

          {/* Alphabet scrubber */}
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

          {/* FAB: Add Contact */}
          <Pressable
            style={({ pressed }) => [s.fab, pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              console.log('Add new contact');
            }}
          >
            <IconSymbol name="plus" size={24} color={C.label} />
          </Pressable>
        </View>

        {/* ── PAGE 2: GROUPS ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <View style={s.topBar}>
              <Text style={s.topBarTitle}>Groups</Text>
            </View>
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {groups.length === 0 ? (
              <View style={s.emptyState}>
                <IconSymbol name="person.3.fill" size={36} color={C.muted} />
                <Text style={s.emptyText}>No groups yet</Text>
              </View>
            ) : (
              groups.map((group, idx) => (
                <View key={group.id}>
                  {idx > 0 && <View style={s.separator} />}
                  <Pressable
                    style={({ pressed }) => [s.row, pressed && s.rowPressed]}
                    onPress={() => callAudio(group.name, group.initials, group.mode)}
                    onLongPress={(e) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      longPressGroup(group, e.nativeEvent.pageY);
                    }}
                    delayLongPress={400}
                  >
                    <View style={s.groupIcon}>
                      <Text style={s.groupInitials}>{group.initials}</Text>
                    </View>
                    <View style={s.rowContent}>
                      <Text style={s.rowName} numberOfLines={1}>{group.name}</Text>
                      <Text style={s.groupMeta}>{group.memberCount} members</Text>
                    </View>
                    <Text style={s.groupTimestamp}>{group.lastCallTimestamp}</Text>
                  </Pressable>
                </View>
              ))
            )}
          </ScrollView>

          {/* FAB: Create Group */}
          <Pressable
            style={({ pressed }) => [s.fab, pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              console.log('Create new group');
            }}
          >
            <IconSymbol name="plus" size={24} color={C.label} />
          </Pressable>
        </View>
      </SwipeablePages>

      {/* Long-press context menu */}
      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  pageScroll: { flex: 1 },

  // Top bar
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topBarTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Filter pills (Recents)
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: C.surface,
  },
  filterPillActive: {
    backgroundColor: C.label,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.label,
  },
  filterTextActive: {
    color: C.bg,
  },

  // Shared row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 12,
    backgroundColor: C.bg,
  },
  rowPressed: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  rowContent: { flex: 1, marginLeft: 12, marginRight: 8 },
  rowName: { fontSize: 16, fontWeight: '500', color: C.label },

  // Recent call row
  recentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentInitials: { fontSize: 14, fontWeight: '700', color: C.secondary },
  recentNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recentMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  metaText: { fontSize: 13, color: C.muted },
  recentRight: { alignItems: 'flex-end' },
  recentDuration: { fontSize: 13, fontWeight: '500', color: C.secondary },
  recentTimestamp: { fontSize: 11, color: C.muted, marginTop: 2 },
  modeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  modeBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  // Contact row
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInitials: { fontSize: 14, fontWeight: '600', color: C.label },
  contactNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contactUsername: { fontSize: 13, color: C.muted },
  contactOrgRole: { fontSize: 13, color: C.muted, marginTop: 1 },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.green,
    borderWidth: 2,
    borderColor: C.bg,
  },

  // Group row
  groupIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupInitials: { fontSize: 14, fontWeight: '700', color: C.label },
  groupMeta: { fontSize: 13, color: C.muted, marginTop: 1 },
  groupTimestamp: { fontSize: 11, color: C.muted },

  // Letter section headers (Contacts)
  letterHeader: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 4,
    backgroundColor: C.bg,
  },
  letterHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.secondary,
  },

  // Alphabet scrubber (right edge, Contacts only)
  scrubber: {
    position: 'absolute',
    right: 2,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  scrubberLetter: {
    fontSize: 10,
    fontWeight: '600',
    color: C.muted,
    paddingVertical: 1,
    paddingHorizontal: 4,
  },
  scrubberLetterActive: {
    color: '#007AFF',
  },

  // Separator
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 72 },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 120, gap: 12 },
  emptyText: { fontSize: 16, color: C.muted },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
