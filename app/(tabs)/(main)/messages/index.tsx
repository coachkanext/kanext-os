/**
 * Messages — universal to all modes.
 * Top bar: Edit (left) · Chats/Rooms/Emails pill (center) · Filter icon (right).
 * Edit tap → dropdown: Select Chats / Edit Pins.
 * Pinned conversations: large circular avatars at top (iOS Messages style) with unread dots.
 * Chat list below with swipe right-to-left to toggle read/unread.
 * Long press → iOS context menu (preview + Pin / Mark as Unread / Hide Alerts / Delete).
 * Two stacked FABs: Compose (top) + Search (bottom).
 * Filter dropdown: tab switcher at top + sub-filters below.
 * Search: full-screen overlay, grouped sections (Contacts → Pins → Chats → Links → Photos → Locations → Documents).
 * Footer hides on scroll down, reappears on scroll up.
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, TextInput, Animated,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useMode } from '@/context/app-context';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';
import { getInboxThreads, getRooms, getEmails, formatMessageTime } from '@/data/mock-messages-v3';
import type { InboxThreadV3, RoomV3 } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────

type MsgTab = 'Chats' | 'Rooms' | 'Emails';
type SearchSection = 'contacts' | 'pins' | 'chats' | 'links' | 'photos' | 'locations' | 'documents';

type ContextMenuItem = {
  icon: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

type ContextMenuState = {
  visible: boolean;
  items: ContextMenuItem[];
  anchorY: number;
};

const CHAT_PILLS    = ['All', 'Unread', 'Recently Deleted'] as const;
const CHANNEL_PILLS = ['All', 'Unread', 'Muted', 'Archived', 'Recently Deleted'] as const;
const EMAIL_PILLS   = ['Inbox', 'Starred', 'Sent', 'Drafts', 'Archived', 'Recently Deleted'] as const;

const FOOTER_HEIGHT = 49;
const SEARCH_BAR_HEIGHT = 52;
const SECTION_MAX = 3;
const SWIPE_REVEAL_W = 80;
const PILLS_ROW_H = 46;

// ── Thread row (swipe left → Read/Unread action) ──────────────────────────────

function ThreadRow({
  thread, C, styles, onPress, onLongPress, selectMode, selected, onToggle,
}: {
  thread: InboxThreadV3;
  C: ComponentColors;
  styles: ReturnType<typeof makeStyles>;
  onPress: () => void;
  onLongPress: (pageY: number) => void;
  selectMode?: boolean;
  selected?: boolean;
  onToggle?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.threadRow, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={selectMode ? onToggle : onPress}
      onLongPress={selectMode ? undefined : (e) => onLongPress(e.nativeEvent.pageY)}
      delayLongPress={350}
    >
      {selectMode && (
        <View style={[styles.selectCircle, selected && { backgroundColor: C.accent, borderColor: C.accent }]}>
          {selected && <IconSymbol name="checkmark" size={11} color="#FFF" />}
        </View>
      )}
      <View style={[styles.threadAvatar, { backgroundColor: C.surface }]}>
        <Text style={[styles.threadInitials, { color: C.label }]}>{thread.initials}</Text>
        {thread.unread && !selectMode && (
          <View style={[styles.unreadDot, { backgroundColor: C.accent, borderColor: C.bg }]} />
        )}
      </View>
      <View style={styles.threadInfo}>
        <View style={styles.threadTopRow}>
          <Text
            style={[styles.threadName, thread.unread && styles.threadNameBold, { color: C.label }]}
            numberOfLines={1}
          >
            {thread.name}
          </Text>
          <Text style={[styles.threadTime, { color: C.muted }]}>
            {formatMessageTime(thread.timestamp)}
          </Text>
        </View>
        {thread.username ? (
          <Text style={[styles.threadHandle, { color: C.muted }]} numberOfLines={1}>
            {thread.username}
          </Text>
        ) : null}
        <Text
          style={[styles.threadPreview, thread.unread && styles.threadPreviewBold, { color: thread.unread ? C.label : C.secondary }]}
          numberOfLines={2}
        >
          {thread.preview}
        </Text>
      </View>
      {!selectMode && <IconSymbol name="chevron.right" size={13} color={C.muted} />}
    </Pressable>
  );
}

// ── Room row ──────────────────────────────────────────────────────────────────

function RoomRow({
  room, C, styles, onPress, onLongPress, selectMode, selected, onToggle,
}: {
  room: RoomV3;
  C: ComponentColors;
  styles: ReturnType<typeof makeStyles>;
  onPress: () => void;
  onLongPress: (pageY: number) => void;
  selectMode?: boolean;
  selected?: boolean;
  onToggle?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.threadRow, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={selectMode ? onToggle : onPress}
      onLongPress={selectMode ? undefined : (e) => onLongPress(e.nativeEvent.pageY)}
      delayLongPress={350}
    >
      {selectMode && (
        <View style={[styles.selectCircle, selected && { backgroundColor: C.accent, borderColor: C.accent }]}>
          {selected && <IconSymbol name="checkmark" size={11} color="#FFF" />}
        </View>
      )}
      <View style={[styles.threadAvatar, { backgroundColor: room.color + '22' }]}>
        <Text style={[styles.channelHash, { color: room.color }]}>#</Text>
      </View>
      <View style={styles.threadInfo}>
        <View style={styles.threadTopRow}>
          <View style={styles.channelNameRow}>
            <Text
              style={[styles.threadName, room.unread && styles.threadNameBold, { color: C.label }]}
              numberOfLines={1}
            >
              {room.name}
            </Text>
            {room.locked && <IconSymbol name="lock.fill" size={11} color={C.muted} />}
          </View>
          <Text style={[styles.threadTime, { color: C.muted }]}>
            {formatMessageTime(room.timestamp)}
          </Text>
        </View>
        <Text
          style={[styles.threadPreview, room.unread && styles.threadPreviewBold, { color: room.unread ? C.label : C.secondary }]}
          numberOfLines={2}
        >
          {room.lastMessage}
        </Text>
        {room.readCount != null && room.totalCount != null && (
          <Text style={[styles.channelReadCount, { color: C.muted }]}>
            {room.readCount}/{room.totalCount} read
          </Text>
        )}
      </View>
      {!selectMode && <IconSymbol name="chevron.right" size={13} color={C.muted} />}
    </Pressable>
  );
}

// ── Pinned avatars row ────────────────────────────────────────────────────────

function PinnedAvatarsRow({
  threads, C, styles, onPress, editMode, onUnpin,
}: {
  threads: InboxThreadV3[];
  C: ComponentColors;
  styles: ReturnType<typeof makeStyles>;
  onPress: (t: InboxThreadV3) => void;
  editMode?: boolean;
  onUnpin?: (t: InboxThreadV3) => void;
}) {
  return (
    <View style={[styles.pinnedSection, { borderBottomColor: C.separator }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.pinnedContent, editMode && { paddingTop: 10 }]}
      >
        {threads.map(t => (
          <Pressable key={t.id} style={styles.pinnedItem} onPress={editMode ? undefined : () => onPress(t)}>
            <View style={[styles.pinnedAvatar, { backgroundColor: C.surface }]}>
              <Text style={[styles.pinnedInitials, { color: C.label }]}>{t.initials}</Text>
              {t.unread && !editMode && (
                <View style={[styles.pinnedUnreadDot, { backgroundColor: C.accent, borderColor: C.bg }]} />
              )}
              {editMode && (
                <Pressable
                  style={[styles.pinRemoveBtn, { backgroundColor: C.red, borderColor: C.bg }]}
                  onPress={() => onUnpin?.(t)}
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                  <IconSymbol name="minus" size={10} color="#FFF" />
                </Pressable>
              )}
            </View>
            <Text style={[styles.pinnedName, { color: C.label }]} numberOfLines={1}>
              {t.name.split(' ')[0]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// ── Pinned rooms row ──────────────────────────────────────────────────────────

function PinnedRoomsRow({
  rooms, C, styles, onPress, editMode, onUnpin,
}: {
  rooms: RoomV3[];
  C: ComponentColors;
  styles: ReturnType<typeof makeStyles>;
  onPress: (r: RoomV3) => void;
  editMode?: boolean;
  onUnpin?: (r: RoomV3) => void;
}) {
  return (
    <View style={[styles.pinnedSection, { borderBottomColor: C.separator }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.pinnedContent, editMode && { paddingTop: 10 }]}
      >
        {rooms.map(r => (
          <Pressable key={r.id} style={styles.pinnedItem} onPress={editMode ? undefined : () => onPress(r)}>
            <View style={[styles.pinnedAvatar, { backgroundColor: r.color + '22' }]}>
              <Text style={[styles.channelHash, { color: r.color }]}>#</Text>
              {r.unread && !editMode && (
                <View style={[styles.pinnedUnreadDot, { backgroundColor: C.accent, borderColor: C.bg }]} />
              )}
              {editMode && (
                <Pressable
                  style={[styles.pinRemoveBtn, { backgroundColor: C.red, borderColor: C.bg }]}
                  onPress={() => onUnpin?.(r)}
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                  <IconSymbol name="minus" size={10} color="#FFF" />
                </Pressable>
              )}
            </View>
            <Text style={[styles.pinnedName, { color: C.label }]} numberOfLines={1}>
              {r.name.replace(/^#/, '')}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// ── Email row ─────────────────────────────────────────────────────────────────

function EmailRow({
  email, C, styles, onPress, onLongPress,
}: {
  email: InboxThreadV3;
  C: ComponentColors;
  styles: ReturnType<typeof makeStyles>;
  onPress: () => void;
  onLongPress: (pageY: number) => void;
}) {
  const [starred, setStarred] = useState(false);
  return (
    <Pressable
      style={({ pressed }) => [styles.threadRow, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={onPress}
      onLongPress={(e) => onLongPress(e.nativeEvent.pageY)}
      delayLongPress={350}
    >
      <View style={[styles.threadAvatar, { backgroundColor: C.surface }]}>
        <Text style={[styles.threadInitials, { color: C.label }]}>{email.initials}</Text>
      </View>
      <View style={styles.threadInfo}>
        <View style={styles.threadTopRow}>
          <Text
            style={[styles.threadName, email.unread && styles.threadNameBold, { color: C.label }]}
            numberOfLines={1}
          >
            {email.name}
          </Text>
          <Text style={[styles.threadTime, { color: C.muted }]}>
            {formatMessageTime(email.timestamp)}
          </Text>
        </View>
        {/* Subject line */}
        <Text
          style={[styles.emailSubject, email.unread && styles.threadNameBold, { color: C.label }]}
          numberOfLines={1}
        >
          {email.role}
        </Text>
        <Text style={[styles.threadPreview, { color: C.secondary }]} numberOfLines={1}>
          {email.preview}
        </Text>
      </View>
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setStarred(v => !v);
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.emailStarBtn}
      >
        <IconSymbol
          name={starred ? 'star.fill' : 'star'}
          size={18}
          color={starred ? '#F59E0B' : C.muted}
        />
      </Pressable>
    </Pressable>
  );
}

// ── Context menu ──────────────────────────────────────────────────────────────

const CTX_ITEM_H = 50;
const CTX_PREVIEW_H = 86;
const CTX_WIDTH = 252;

function ThreadPreviewCard({
  thread, C, styles,
}: {
  thread: InboxThreadV3;
  C: ComponentColors;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.ctxPreview}>
      <View style={[styles.ctxPreviewAvatar, { backgroundColor: C.surface }]}>
        <Text style={[styles.ctxPreviewInitials, { color: C.label }]}>{thread.initials}</Text>
      </View>
      <View style={styles.ctxPreviewInfo}>
        <Text style={[styles.ctxPreviewName, { color: C.label }]} numberOfLines={1}>{thread.name}</Text>
        <Text style={[styles.ctxPreviewSub, { color: C.secondary }]} numberOfLines={2}>
          {thread.preview}
        </Text>
      </View>
    </View>
  );
}

function RoomPreviewCard({
  room, C, styles,
}: {
  room: RoomV3;
  C: ComponentColors;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.ctxPreview}>
      <View style={[styles.ctxPreviewAvatar, { backgroundColor: room.color + '22' }]}>
        <Text style={[styles.ctxPreviewInitials, { color: room.color }]}>#</Text>
      </View>
      <View style={styles.ctxPreviewInfo}>
        <Text style={[styles.ctxPreviewName, { color: C.label }]} numberOfLines={1}>{room.name}</Text>
        <Text style={[styles.ctxPreviewSub, { color: C.secondary }]} numberOfLines={2}>
          {room.lastMessage}
        </Text>
      </View>
    </View>
  );
}

function ContextMenuOverlay({
  ctxMenu, onClose, C, styles, preview,
}: {
  ctxMenu: ContextMenuState;
  onClose: () => void;
  C: ComponentColors;
  styles: ReturnType<typeof makeStyles>;
  preview?: React.ReactNode;
}) {
  const { height: screenH } = useWindowDimensions();
  if (!ctxMenu.visible) return null;

  const previewH = preview ? CTX_PREVIEW_H : 0;
  const menuH = ctxMenu.items.length * CTX_ITEM_H + previewH;
  const showAbove = ctxMenu.anchorY > screenH * 0.55;
  const rawTop = showAbove ? ctxMenu.anchorY - menuH - 12 : ctxMenu.anchorY + 12;
  const menuTop = Math.max(60, Math.min(rawTop, screenH - menuH - 16));

  return (
    <>
      <Pressable style={[StyleSheet.absoluteFill, styles.ctxBackdrop]} onPress={onClose} />
      <View style={[styles.ctxShadow, { top: menuTop, width: CTX_WIDTH }]}>
        <View style={[styles.ctxInner, { backgroundColor: C.bg, borderColor: C.separator }]}>
          {preview && (
            <>
              {preview}
              <View style={[styles.ctxDivider, { backgroundColor: C.separator, marginLeft: 0 }]} />
            </>
          )}
          {ctxMenu.items.map((item, i) => (
            <React.Fragment key={item.label}>
              <Pressable
                style={({ pressed }) => [styles.ctxItem, pressed && { backgroundColor: C.surfacePressed }]}
                onPress={() => { onClose(); item.onPress(); }}
              >
                <IconSymbol
                  name={item.icon as any}
                  size={18}
                  color={item.destructive ? C.red : C.label}
                />
                <Text style={[styles.ctxLabel, { color: item.destructive ? C.red : C.label }]}>
                  {item.label}
                </Text>
              </Pressable>
              {i < ctxMenu.items.length - 1 && (
                <View style={[styles.ctxDivider, { backgroundColor: C.separator }]} />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>
    </>
  );
}

// ── Compose sheet ─────────────────────────────────────────────────────────────

function ComposeSheet({
  C, styles, onClose, onSelectOption,
}: {
  C: ComponentColors;
  styles: ReturnType<typeof makeStyles>;
  onClose: () => void;
  onSelectOption: (opt: 'Chat' | 'Room' | 'Email') => void;
}) {
  const options: { icon: string; label: 'Chat' | 'Room' | 'Email'; color: string }[] = [
    { icon: 'message.fill',  label: 'Chat', color: C.accent },
    { icon: 'number',        label: 'Room', color: C.green },
    { icon: 'envelope.fill', label: 'Email',   color: C.red },
  ];

  return (
    <View style={styles.composeSheet}>
      <Text style={[styles.composeTitle, { color: C.label }]}>New</Text>
      {options.map(({ icon, label, color }, i) => (
        <React.Fragment key={label}>
          {i > 0 && <View style={[styles.composeDivider, { backgroundColor: C.separator }]} />}
          <Pressable
            style={({ pressed }) => [styles.composeOption, pressed && { backgroundColor: C.surfacePressed }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectOption(label);
              onClose();
            }}
          >
            <View style={[styles.composeIconWrap, { backgroundColor: color + '22' }]}>
              <IconSymbol name={icon as any} size={20} color={color} />
            </View>
            <Text style={[styles.composeOptionLabel, { color: C.label }]}>{label}</Text>
          </Pressable>
        </React.Fragment>
      ))}
    </View>
  );
}

// ── Search results ─────────────────────────────────────────────────────────────

function SearchResults({
  query, C, styles, threads, rooms, expandedSection, setExpandedSection, onOpenThread, bottomPad,
}: {
  query: string;
  C: ComponentColors;
  styles: ReturnType<typeof makeStyles>;
  threads: InboxThreadV3[];
  rooms: RoomV3[];
  expandedSection: SearchSection | null;
  setExpandedSection: (s: SearchSection | null) => void;
  onOpenThread: (t: InboxThreadV3) => void;
  bottomPad: number;
}) {
  const q = query.toLowerCase().trim();

  const matchContacts = useMemo(() => {
    if (!q) return [];
    return threads.filter(t =>
      t.name.toLowerCase().includes(q) || t.role.toLowerCase().includes(q),
    );
  }, [q, threads]);

  const matchPins = useMemo(() => {
    if (!q) return [];
    return threads.filter(t => t.pinned && t.name.toLowerCase().includes(q));
  }, [q, threads]);

  const matchChats = useMemo(() => {
    if (!q) return [];
    return threads.filter(t =>
      t.name.toLowerCase().includes(q) || t.preview.toLowerCase().includes(q),
    );
  }, [q, threads]);

  if (!q) {
    return (
      <View style={styles.searchEmpty}>
        <IconSymbol name="magnifyingglass" size={32} color={C.muted} />
        <Text style={[styles.searchEmptyText, { color: C.muted }]}>
          Search messages, people, files
        </Text>
      </View>
    );
  }

  if (!matchContacts.length && !matchChats.length) {
    return (
      <View style={styles.searchEmpty}>
        <Text style={[styles.searchEmptyText, { color: C.muted }]}>No results for "{query}"</Text>
      </View>
    );
  }

  type SectionDef = {
    key: SearchSection;
    label: string;
    items: (InboxThreadV3)[];
    renderItem: (item: InboxThreadV3) => React.ReactNode;
    alwaysShow?: boolean;
  };

  const sections: SectionDef[] = [
    {
      key: 'contacts',
      label: 'Contacts',
      items: matchContacts,
      renderItem: (t) => (
        <Pressable
          key={t.id}
          style={({ pressed }) => [styles.threadRow, pressed && { backgroundColor: C.surfacePressed }]}
          onPress={() => onOpenThread(t)}
        >
          <View style={[styles.threadAvatar, { backgroundColor: C.surface }]}>
            <Text style={[styles.threadInitials, { color: C.label }]}>{t.initials}</Text>
          </View>
          <View style={styles.threadInfo}>
            <Text style={[styles.threadName, { color: C.label }]}>{t.name}</Text>
            <Text style={[styles.threadPreview, { color: C.secondary }]} numberOfLines={1}>{t.role}</Text>
          </View>
        </Pressable>
      ),
    },
    {
      key: 'pins',
      label: 'Pins',
      items: matchPins,
      renderItem: (t) => (
        <Pressable
          key={t.id}
          style={({ pressed }) => [styles.threadRow, pressed && { backgroundColor: C.surfacePressed }]}
          onPress={() => onOpenThread(t)}
        >
          <View style={[styles.threadAvatar, { backgroundColor: C.surface }]}>
            <Text style={[styles.threadInitials, { color: C.label }]}>{t.initials}</Text>
          </View>
          <View style={styles.threadInfo}>
            <Text style={[styles.threadName, { color: C.label }]}>{t.name}</Text>
            <Text style={[styles.threadPreview, { color: C.secondary }]} numberOfLines={1}>{t.preview}</Text>
          </View>
        </Pressable>
      ),
    },
    {
      key: 'chats',
      label: 'Chats',
      items: matchChats,
      renderItem: (t) => (
        <Pressable
          key={t.id}
          style={({ pressed }) => [styles.threadRow, pressed && { backgroundColor: C.surfacePressed }]}
          onPress={() => onOpenThread(t)}
        >
          <View style={[styles.threadAvatar, { backgroundColor: C.surface }]}>
            <Text style={[styles.threadInitials, { color: C.label }]}>{t.initials}</Text>
          </View>
          <View style={styles.threadInfo}>
            <View style={styles.threadTopRow}>
              <Text style={[styles.threadName, { color: C.label }]} numberOfLines={1}>{t.name}</Text>
              <Text style={[styles.threadTime, { color: C.muted }]}>{formatMessageTime(t.timestamp)}</Text>
            </View>
            <Text style={[styles.threadPreview, { color: C.secondary }]} numberOfLines={1}>{t.preview}</Text>
          </View>
        </Pressable>
      ),
    },
    { key: 'links',     label: 'Links',     items: [], renderItem: () => null, alwaysShow: true },
    { key: 'photos',    label: 'Photos',    items: [], renderItem: () => null, alwaysShow: true },
    { key: 'locations', label: 'Locations', items: [], renderItem: () => null, alwaysShow: true },
    { key: 'documents', label: 'Documents', items: [], renderItem: () => null, alwaysShow: true },
  ];

  return (
    <ScrollView
      style={styles.searchScroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: bottomPad }}
    >
      {sections.map(section => {
        if (!section.items.length && !section.alwaysShow) return null;
        const isExpanded = expandedSection === section.key;
        const shown = isExpanded ? section.items : section.items.slice(0, SECTION_MAX);

        return (
          <View key={section.key}>
            <View style={styles.searchSectionHeader}>
              <Text style={styles.sectionLabel}>{section.label}</Text>
              {section.items.length > SECTION_MAX && !isExpanded && (
                <Pressable
                  onPress={() => setExpandedSection(section.key)}
                  style={styles.seeAllBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[styles.seeAll, { color: C.accent }]}>See All</Text>
                </Pressable>
              )}
            </View>
            {shown.length > 0
              ? shown.map(item => section.renderItem(item))
              : <Text style={[styles.searchEmptySectionText, { color: C.muted }]}>No results</Text>
            }
          </View>
        );
      })}
    </ScrollView>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function MessagesScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(C), [C]);
  const mode = useMode();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<MsgTab>('Chats');
  const [subFilter, setSubFilter] = useState<string | null>(null);
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [filterPillsVisible, setFilterPillsVisible] = useState(false);
  const pillsRevealAnim = useRef(new Animated.Value(0)).current;
  const [editDropdownVisible, setEditDropdownVisible] = useState(false);
  const [editPinsMode, setEditPinsMode] = useState(false);
  const [selectChatsMode, setSelectChatsMode] = useState(false);
  const [selectedThreadIds, setSelectedThreadIds] = useState<Set<string>>(new Set());
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchExpandedSection, setSearchExpandedSection] = useState<SearchSection | null>(null);
  const [composeSheetVisible, setComposeSheetVisible] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<ContextMenuState>({ visible: false, items: [], anchorY: 0 });
  const [ctxThread, setCtxThread] = useState<InboxThreadV3 | null>(null);
  const [ctxRoom, setCtxRoom] = useState<RoomV3 | null>(null);

  // Local mutable state for pinned/unread
  const [threads, setThreads] = useState<InboxThreadV3[]>(() => getInboxThreads(mode));
  const [rooms, setRooms] = useState<RoomV3[]>(() => getRooms(mode));
  const [emails, setEmails] = useState<InboxThreadV3[]>(() => getEmails(mode));

  // Re-derive when mode changes
  const prevMode = useRef(mode);
  if (prevMode.current !== mode) {
    prevMode.current = mode;
    setThreads(getInboxThreads(mode));
    setRooms(getRooms(mode));
    setEmails(getEmails(mode));
    setSubFilter(null);
  }

  const pinnedThreads = useMemo(() => threads.filter(t => t.pinned), [threads]);

  const filteredThreads = useMemo(() => {
    let list = threads.filter(t => !t.pinned);
    if (subFilter === 'Unread') list = list.filter(t => t.unread);
    else if (subFilter === 'Recently Deleted') list = [];
    return list;
  }, [threads, subFilter]);

  const pinnedRooms = useMemo(() => rooms.filter(r => r.pinned), [rooms]);

  const filteredRooms = useMemo(() => {
    let list = rooms.filter(r => !r.pinned);
    if (subFilter === 'Unread') list = list.filter(r => r.unread);
    else if (subFilter === 'Muted' || subFilter === 'Archived' || subFilter === 'Recently Deleted') list = [];
    return list;
  }, [rooms, subFilter]);

  const filteredEmails = useMemo(() => {
    let list = [...emails];
    if (subFilter === 'Starred') list = [];
    else if (subFilter === 'Sent') list = [];
    else if (subFilter === 'Drafts') list = [];
    else if (subFilter === 'Archived' || subFilter === 'Recently Deleted') list = [];
    else if (subFilter === 'Unread') list = list.filter(e => e.unread);
    return list;
  }, [emails, subFilter]);

  const toggleThreadRead = useCallback((id: string) => {
    setThreads(prev => prev.map(t => t.id === id ? { ...t, unread: !t.unread } : t));
  }, []);

  const toggleThreadPinned = useCallback((id: string) => {
    setThreads(prev => prev.map(t => t.id === id ? { ...t, pinned: !t.pinned } : t));
  }, []);

  const toggleRoomRead = useCallback((id: string) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, unread: !r.unread } : r));
  }, []);

  const toggleRoomPinned = useCallback((id: string) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, pinned: !r.pinned } : r));
  }, []);

  // Fade animations for search overlay
  const mainOpacity = useRef(new Animated.Value(1)).current;
  const resultsOpacity = useRef(new Animated.Value(0)).current;

  const lastScrollYRef = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    const dy = y - lastScrollYRef.current;
    lastScrollYRef.current = y;
    if (dy > 5) hideFooter();
    else if (dy < -5) showFooter();
  }, []);

  const activateSearch = useCallback(() => {
    setSearchActive(true);
    setSearchExpandedSection(null);
    Animated.parallel([
      Animated.timing(mainOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(resultsOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [mainOpacity, resultsOpacity]);

  const deactivateSearch = useCallback(() => {
    Animated.parallel([
      Animated.timing(mainOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(resultsOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setSearchActive(false);
      setSearchQuery('');
    });
  }, [mainOpacity, resultsOpacity]);

  const openThreadCtxMenu = useCallback((thread: InboxThreadV3, anchorY: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCtxThread(thread);
    const items: ContextMenuItem[] = [
      {
        icon: thread.pinned ? 'pin.slash.fill' : 'pin.fill',
        label: thread.pinned ? 'Unpin' : 'Pin',
        onPress: () => toggleThreadPinned(thread.id),
      },
      {
        icon: thread.unread ? 'message.fill' : 'message.badge.filled.fill',
        label: thread.unread ? 'Mark as Read' : 'Mark as Unread',
        onPress: () => toggleThreadRead(thread.id),
      },
      {
        icon: 'bell.slash.fill',
        label: 'Hide Alerts',
        onPress: () => {},
      },
      {
        icon: 'trash.fill',
        label: 'Delete',
        onPress: () => setThreads(prev => prev.filter(t => t.id !== thread.id)),
        destructive: true,
      },
    ];
    setCtxMenu({ visible: true, items, anchorY });
  }, [toggleThreadPinned, toggleThreadRead]);

  const openRoomCtxMenu = useCallback((room: RoomV3, anchorY: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCtxThread(null);
    setCtxRoom(room);
    setCtxMenu({
      visible: true,
      anchorY,
      items: [
        {
          icon: room.pinned ? 'pin.slash.fill' : 'pin.fill',
          label: room.pinned ? 'Unpin' : 'Pin',
          onPress: () => toggleRoomPinned(room.id),
        },
        {
          icon: room.unread ? 'message.fill' : 'message.badge.filled.fill',
          label: room.unread ? 'Mark as Read' : 'Mark as Unread',
          onPress: () => toggleRoomRead(room.id),
        },
        {
          icon: 'bell.slash.fill',
          label: 'Hide Alerts',
          onPress: () => {},
        },
        {
          icon: 'rectangle.portrait.and.arrow.right',
          label: 'Leave Room',
          onPress: () => {},
          destructive: true,
        },
      ],
    });
  }, [toggleRoomPinned, toggleRoomRead]);

  const closeCtxMenu = useCallback(() => {
    setCtxMenu(s => ({ ...s, visible: false }));
    setCtxThread(null);
    setCtxRoom(null);
  }, []);

  const toggleFilterPills = useCallback(() => {
    setFilterPillsVisible(prev => {
      const next = !prev;
      Animated.timing(pillsRevealAnim, {
        toValue: next ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      return next;
    });
  }, [pillsRevealAnim]);

  const fabBottom = insets.bottom + FOOTER_HEIGHT + 16;
  const searchBarBottom = insets.bottom + FOOTER_HEIGHT;
  const headerHeight = insets.top + 14 + 50;

  const pills: readonly string[] =
    activeTab === 'Chats' ? CHAT_PILLS
    : activeTab === 'Rooms' ? CHANNEL_PILLS
    : EMAIL_PILLS;

  // Unread counts for badge on All/Inbox pill
  const unreadThreadCount = useMemo(() => threads.filter(t => t.unread).length, [threads]);
  const unreadRoomCount   = useMemo(() => rooms.filter(r => r.unread).length, [rooms]);
  const unreadEmailCount  = useMemo(() => emails.filter(e => e.unread).length, [emails]);

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>

      {/* ── Main content (fades out when searching) ── */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: mainOpacity }]}
        pointerEvents={searchActive ? 'none' : 'auto'}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
          {/* Left */}
          {editPinsMode ? (
            <Pressable
              style={styles.headerTextBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setEditPinsMode(false);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.editBtnText, { color: C.accent }]}>Done</Text>
            </Pressable>
          ) : selectChatsMode ? (
            <Pressable
              style={styles.headerTextBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectChatsMode(false);
                setSelectedThreadIds(new Set());
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.editBtnText, { color: C.accent }]}>Cancel</Text>
            </Pressable>
          ) : (
            <Pressable
              style={styles.headerBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setEditDropdownVisible(v => !v);
                setFilterDropdownVisible(false);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.editBtnText, { color: C.accent }]}>Edit</Text>
            </Pressable>
          )}

          {/* Centered tab pill */}
          <Pressable
            style={[styles.statePill, { backgroundColor: C.surfacePressed }]}
            onPress={() => {
              if (editPinsMode || selectChatsMode) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setFilterDropdownVisible(v => !v);
              setEditDropdownVisible(false);
            }}
          >
            <Text style={[styles.statePillText, { color: C.label }]}>
              {selectChatsMode ? `${selectedThreadIds.size} Selected` : activeTab}
            </Text>
          </Pressable>

          {/* Right: filter icon, hidden in edit/select modes */}
          {editPinsMode || selectChatsMode ? (
            <View style={styles.headerBtn} />
          ) : (
            <Pressable
              style={styles.headerBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toggleFilterPills();
                setEditDropdownVisible(false);
                setFilterDropdownVisible(false);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <IconSymbol
                name={filterPillsVisible || subFilter !== null ? 'line.3.horizontal.decrease.circle.fill' : 'line.3.horizontal.decrease.circle'}
                size={22}
                color={filterPillsVisible || subFilter !== null ? C.accent : C.label}
              />
            </Pressable>
          )}
        </View>

        {/* Sub-filter pills — slides in when filter icon is tapped */}
        <Animated.View style={{
          height: pillsRevealAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILLS_ROW_H] }),
          opacity: pillsRevealAnim,
          overflow: 'hidden',
        }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsRow}
            style={styles.pillsScroll}
          >
            {pills.map(pill => {
              const isAll = pill === 'All' || pill === 'Inbox';
              const isActive = subFilter === null ? isAll : subFilter === pill;
              const count =
                isAll && activeTab === 'Chats' ? unreadThreadCount
                : isAll && activeTab === 'Rooms' ? unreadRoomCount
                : isAll && activeTab === 'Emails' ? unreadEmailCount
                : 0;
              return (
                <Pressable
                  key={pill}
                  style={[
                    styles.pill,
                    isActive
                      ? { backgroundColor: C.label }
                      : { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: C.separator },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (isActive) {
                      toggleFilterPills();
                    } else if (isAll) {
                      setSubFilter(null);
                    } else {
                      setSubFilter(pill);
                    }
                  }}
                >
                  <Text style={[styles.pillText, { color: isActive ? C.bg : C.secondary }]}>
                    {pill}{count > 0 ? ` ${count}` : ''}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Body */}
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: insets.bottom + FOOTER_HEIGHT + 150 }}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => {
            setFilterDropdownVisible(false);
            setEditDropdownVisible(false);
          }}
        >
          {/* ── Chats ── */}
          {activeTab === 'Chats' && (
            <>
              {subFilter === null && pinnedThreads.length > 0 && (
                <PinnedAvatarsRow
                  threads={pinnedThreads}
                  C={C}
                  styles={styles}
                  onPress={(t) => router.push(`/(tabs)/(main)/messages/${t.id}` as any)}
                  editMode={editPinsMode}
                  onUnpin={(t) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setThreads(prev => prev.map(x => x.id === t.id ? { ...x, pinned: false } : x));
                  }}
                />
              )}
              {!selectChatsMode && filteredThreads.length === 0 ? (
                <Text style={[styles.emptyText, { color: C.muted }]}>
                  {subFilter ? `No ${subFilter.toLowerCase()} chats` : 'No messages'}
                </Text>
              ) : (
                filteredThreads.map(t => (
                  <ThreadRow
                    key={t.id}
                    thread={t}
                    C={C}
                    styles={styles}
                    onPress={() => router.push(`/(tabs)/(main)/messages/${t.id}` as any)}
                    onLongPress={(y) => openThreadCtxMenu(t, y)}
                    selectMode={selectChatsMode}
                    selected={selectedThreadIds.has(t.id)}
                    onToggle={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedThreadIds(s => {
                        const n = new Set(s);
                        if (n.has(t.id)) n.delete(t.id); else n.add(t.id);
                        return n;
                      });
                    }}
                  />
                ))
              )}
            </>
          )}

          {/* ── Rooms ── */}
          {activeTab === 'Rooms' && (
            <>
              {subFilter === null && pinnedRooms.length > 0 && (
                <PinnedRoomsRow
                  rooms={pinnedRooms}
                  C={C}
                  styles={styles}
                  onPress={(r) => router.push(`/(tabs)/(main)/messages/${r.id}` as any)}
                  editMode={editPinsMode}
                  onUnpin={(r) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setRooms(prev => prev.map(x => x.id === r.id ? { ...x, pinned: false } : x));
                  }}
                />
              )}
              {!selectChatsMode && filteredRooms.length === 0 ? (
                <Text style={[styles.emptyText, { color: C.muted }]}>
                  {subFilter ? `No ${subFilter.toLowerCase()} rooms` : 'No rooms'}
                </Text>
              ) : (
                filteredRooms.map(r => (
                  <RoomRow
                    key={r.id}
                    room={r}
                    C={C}
                    styles={styles}
                    onPress={() => router.push(`/(tabs)/(main)/messages/${r.id}` as any)}
                    onLongPress={(y) => openRoomCtxMenu(r, y)}
                    selectMode={selectChatsMode}
                    selected={selectedThreadIds.has(r.id)}
                    onToggle={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedThreadIds(s => {
                        const n = new Set(s);
                        if (n.has(r.id)) n.delete(r.id); else n.add(r.id);
                        return n;
                      });
                    }}
                  />
                ))
              )}
            </>
          )}

          {/* ── Emails ── */}
          {activeTab === 'Emails' && (
            <>
              {filteredEmails.length === 0 ? (
                <Text style={[styles.emptyText, { color: C.muted }]}>
                  {subFilter ? `No ${subFilter.toLowerCase()} emails` : 'No emails'}
                </Text>
              ) : (
                filteredEmails.map(e => (
                  <EmailRow
                    key={e.id}
                    email={e}
                    C={C}
                    styles={styles}
                    onPress={() => router.push(`/(tabs)/(main)/messages/${e.id}` as any)}
                    onLongPress={(y) => openThreadCtxMenu(e, y)}
                  />
                ))
              )}
            </>
          )}
        </ScrollView>

        {/* FAB stack — hidden in select mode */}
        {!selectChatsMode && (
          <View style={[styles.fabStack, { bottom: fabBottom }]}>
            <Pressable
              style={[styles.fab, { backgroundColor: C.accent }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setComposeSheetVisible(true);
              }}
            >
              <IconSymbol name="square.and.pencil" size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable
              style={[styles.fab, { backgroundColor: C.accent }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                activateSearch();
              }}
            >
              <IconSymbol name="magnifyingglass" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
        )}

        {/* Select action bar */}
        {selectChatsMode && (
          <View style={[styles.selectBar, { bottom: insets.bottom + FOOTER_HEIGHT, backgroundColor: C.bg, borderTopColor: C.separator }]}>
            <Pressable
              style={[styles.selectDeleteBtn, { backgroundColor: selectedThreadIds.size > 0 ? C.red : C.surface }]}
              onPress={() => {
                if (selectedThreadIds.size === 0) return;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setThreads(prev => prev.filter(t => !selectedThreadIds.has(t.id)));
                setRooms(prev => prev.filter(r => !selectedThreadIds.has(r.id)));
                setSelectedThreadIds(new Set());
                setSelectChatsMode(false);
              }}
            >
              <Text style={[styles.selectDeleteText, { color: selectedThreadIds.size > 0 ? '#FFF' : C.muted }]}>
                {selectedThreadIds.size > 0 ? `Delete (${selectedThreadIds.size})` : 'Delete'}
              </Text>
            </Pressable>
          </View>
        )}
      </Animated.View>

      {/* ── Search results overlay ── */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: resultsOpacity, backgroundColor: C.bg }]}
        pointerEvents={searchActive ? 'auto' : 'none'}
      >
        <View style={{ height: headerHeight }} />
        <SearchResults
          query={searchQuery}
          C={C}
          styles={styles}
          threads={threads}
          rooms={rooms}
          expandedSection={searchExpandedSection}
          setExpandedSection={setSearchExpandedSection}
          onOpenThread={(t) => router.push(`/(tabs)/(main)/messages/${t.id}` as any)}
          bottomPad={insets.bottom + FOOTER_HEIGHT + SEARCH_BAR_HEIGHT + 8}
        />
      </Animated.View>

      {/* ── Search bar ── */}
      {searchActive && (
        <View style={[
          styles.searchBar,
          { bottom: searchBarBottom, backgroundColor: C.bg, borderTopColor: C.separator },
        ]}>
          <IconSymbol name="magnifyingglass" size={16} color={C.muted} />
          <TextInput
            style={[styles.searchBarInput, { color: C.label }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search..."
            placeholderTextColor={C.muted}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          <Pressable
            onPress={deactivateSearch}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.cancelBtn, { color: C.accent }]}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {/* ── Filter dropdown ── */}
      {filterDropdownVisible && (
        <>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setFilterDropdownVisible(false)} />
          <View style={[
            styles.filterDropdown,
            { top: insets.top + 56, backgroundColor: C.bg, borderColor: C.separator },
          ]}>
            {(['Chats', 'Rooms', 'Emails'] as MsgTab[]).map(tab => (
              <Pressable
                key={tab}
                style={({ pressed }) => [
                  styles.filterTabOption,
                  pressed && { backgroundColor: C.surfacePressed },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(tab);
                  setSubFilter(null);
                  setFilterDropdownVisible(false);
                }}
              >
                <Text style={[
                  styles.filterTabText,
                  { color: activeTab === tab ? C.label : C.secondary },
                  activeTab === tab && { fontWeight: '600' },
                ]}>
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* ── Edit dropdown ── */}
      {editDropdownVisible && (
        <>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setEditDropdownVisible(false)} />
          <View style={[
            styles.editDropdown,
            { top: insets.top + 56, backgroundColor: C.bg, borderColor: C.separator },
          ]}>
            {[
              {
                icon: 'pin.fill',
                label: 'Edit Pins',
                onPress: () => {
                  setEditPinsMode(true);
                  setSelectChatsMode(false);
                  setSelectedThreadIds(new Set());
                  setEditDropdownVisible(false);
                },
              },
              {
                icon: 'checkmark.circle',
                label: 'Select Chats',
                onPress: () => {
                  setSelectChatsMode(true);
                  setEditPinsMode(false);
                  setSelectedThreadIds(new Set());
                  setEditDropdownVisible(false);
                },
              },
            ].map(({ icon, label, onPress }, i) => (
              <Pressable
                key={label}
                style={({ pressed }) => [
                  styles.dropdownOption,
                  pressed && { backgroundColor: C.surfacePressed },
                  i === 0 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: C.separator,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onPress();
                }}
              >
                <IconSymbol name={icon as any} size={16} color={C.label} />
                <Text style={[styles.dropdownOptionText, { color: C.label }]}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* ── Compose sheet ── */}
      <BottomSheet
        visible={composeSheetVisible}
        onClose={() => setComposeSheetVisible(false)}
        useModal
        backgroundColor={C.bg}
        contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}
      >
        <ComposeSheet
          C={C}
          styles={styles}
          onClose={() => setComposeSheetVisible(false)}
          onSelectOption={(opt) => {
            if (opt === 'Chat') router.push('/(tabs)/(main)/messages/new-message' as any);
            else if (opt === 'Room') router.push('/(tabs)/(main)/messages/new-channel' as any);
          }}
        />
      </BottomSheet>

      {/* ── Context menu ── */}
      <ContextMenuOverlay
        ctxMenu={ctxMenu}
        onClose={closeCtxMenu}
        C={C}
        styles={styles}
        preview={
          ctxThread ? <ThreadPreviewCard thread={ctxThread} C={C} styles={styles} />
          : ctxRoom  ? <RoomPreviewCard  room={ctxRoom}    C={C} styles={styles} />
          : undefined
        }
      />

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextBtn: {
    height: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: {
    fontSize: 16,
    fontWeight: '400',
  },
  pinRemoveBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  selectCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.separator,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: 4,
  },
  selectBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  selectDeleteBtn: {
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  selectDeleteText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statePill: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
  },
  statePillText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Sub-filter pills row
  pillsScroll: {
    flexGrow: 0,
  },
  pillsRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Scroll
  scroll: { flex: 1 },

  // Pinned avatars section
  pinnedSection: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  pinnedContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
    flexDirection: 'row',
  },
  pinnedItem: {
    alignItems: 'center',
    width: 72,
    gap: 6,
    marginHorizontal: 2,
  },
  pinnedAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pinnedInitials: {
    fontSize: 22,
    fontWeight: '700',
  },
  pinnedName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  pinnedUnreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    borderWidth: 2.5,
  },

  // Thread row
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: C.bg,
  },
  threadAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  threadInitials: {
    fontSize: 17,
    fontWeight: '700',
  },
  channelHash: {
    fontSize: 22,
    fontWeight: '700',
  },
  unreadDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  threadInfo: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  threadTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  threadName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: C.label,
  },
  threadNameBold: {
    fontWeight: '600',
  },
  threadPreview: {
    fontSize: 14,
    lineHeight: 18,
  },
  emailSubject: {
    fontSize: 14,
    fontWeight: '400',
  },
  emailStarBtn: {
    padding: 4,
    flexShrink: 0,
  },
  threadHandle: {
    fontSize: 13,
    lineHeight: 16,
  },
  threadPreviewBold: {
    fontWeight: '500',
  },
  threadTime: {
    fontSize: 13,
    flexShrink: 0,
  },
  channelNameRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  channelReadCount: {
    fontSize: 11,
    marginTop: 1,
  },

  // Swipe action
  swipeAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SWIPE_REVEAL_W,
  },
  swipeActionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },

  // Empty
  emptyText: {
    textAlign: 'center',
    fontSize: 15,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emailEmpty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },

  // FAB stack
  fabStack: {
    position: 'absolute',
    right: 24,
    alignItems: 'center',
    gap: 12,
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },

  // Filter dropdown (centered below pill)
  filterDropdown: {
    position: 'absolute',
    alignSelf: 'center',
    left: '50%' as any,
    marginLeft: -110,
    minWidth: 220,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  filterTabOption: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  filterTabText: {
    fontSize: 17,
    textAlign: 'center',
  },
  filterSectionDivider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 6,
  },
  filterSectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 13,
    gap: 12,
  },
  dropdownOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
  },

  // Edit dropdown (left-aligned)
  editDropdown: {
    position: 'absolute',
    left: 16,
    minWidth: 200,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },

  // Search bar
  searchBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SEARCH_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  cancelBtn: {
    fontSize: 16,
    fontWeight: '500',
    flexShrink: 0,
  },

  // Search results
  searchScroll: { flex: 1 },
  searchEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  searchEmptyText: { fontSize: 15, textAlign: 'center' },
  searchEmptySectionText: {
    fontSize: 14,
    paddingHorizontal: 20,
    paddingBottom: 8,
    fontStyle: 'italic',
  },
  searchSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  seeAllBtn: { marginLeft: 'auto' as any },
  seeAll: { fontSize: 13, fontWeight: '500' },

  // Compose sheet
  composeSheet: { paddingBottom: 24 },
  composeTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  composeDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 74,
  },
  composeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  composeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composeOptionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },

  // Context menu
  ctxPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    minHeight: CTX_PREVIEW_H,
  },
  ctxPreviewAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ctxPreviewInitials: { fontSize: 15, fontWeight: '700' },
  ctxPreviewInfo: { flex: 1, minWidth: 0, gap: 3 },
  ctxPreviewName: { fontSize: 15, fontWeight: '600' },
  ctxPreviewSub: { fontSize: 13, lineHeight: 17 },
  ctxBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.28)',
    zIndex: 5000,
  },
  ctxShadow: {
    position: 'absolute',
    right: 16,
    zIndex: 5001,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 14,
  },
  ctxInner: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  ctxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: CTX_ITEM_H,
    paddingHorizontal: 16,
    gap: 14,
  },
  ctxLabel: {
    fontSize: 16,
    fontWeight: '400',
    flex: 1,
  },
  ctxDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
});
