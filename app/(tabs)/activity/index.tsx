/**
 * Messages Screen — 3-tab: Inbox | Rooms | Nexus
 * Inbox: Unread + Mentions sections.
 * Rooms: Sectioned list (Pinned / Program / Direct) with Slack-style thread.
 * Nexus: Coming Soon.
 * Rendering context: Assistant Coach / Recruiting Coordinator (A2).
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { PagedTabBar } from '@/components/ui/paged-tab-bar';
import { EdgeHoldAdvance } from '@/components/ui/edge-hold-advance';
import PagerView from 'react-native-pager-view';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { ChatComposer } from '@/components/messages/chat-composer';
import { NewThreadSheet } from '@/components/messages/new-thread-sheet';
import { InboxRowV3 } from '@/components/messages/inbox-row-v3';
import { RoomsListV3 } from '@/components/messages/rooms-list-v3';
import { EmptyState } from '@/components/ui/empty-state';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMode } from '@/context/app-context';
import {
  getInboxThreads,
  getInboxMentions,
  getRoomMessages,
  formatMessageTime,
} from '@/data/mock-messages-v3';
import type {
  Mode,
  InboxThreadV3,
  RoomV3,
  ConversationMessageV3,
} from '@/types';

// =============================================================================
// CONSTANTS
// =============================================================================

const SCREEN_WIDTH = Dimensions.get('window').width;
const TAB_WIDTH_3 = SCREEN_WIDTH / 3;

const COMING_SOON_MODES = new Set<Mode>(['education', 'competition']);

const MESSAGES_TABS = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'nexus', label: 'Nexus' },
];

// Mock conversation for DM thread detail
const MOCK_THREAD_MESSAGES: ConversationMessageV3[] = [
  { id: 'm1', sender: 'You', initials: 'ME', content: 'Got it, thanks for the update.', timestamp: new Date(Date.now() - 3600000), isMe: true },
  { id: 'm2', sender: 'Them', initials: '??', content: 'Let me know if you have any questions.', timestamp: new Date(Date.now() - 1800000), isMe: false },
];

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function MessagesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const mode = useMode();

  if (COMING_SOON_MODES.has(mode)) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText style={{ fontSize: 32, fontWeight: '800', lineHeight: 40 }}>Coming Soon</ThemedText>
        <ThemedText style={{ fontSize: 15, opacity: 0.5, textAlign: 'center', marginTop: 8 }}>
          This mode is under development.{'\n'}Stay tuned for updates.
        </ThemedText>
      </ThemedView>
    );
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const [search, setSearch] = useState('');
  const [selectedThread, setSelectedThread] = useState<InboxThreadV3 | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomV3 | null>(null);
  const [inputText, setInputText] = useState('');
  const [roomInputText, setRoomInputText] = useState('');
  const [newThreadVisible, setNewThreadVisible] = useState(false);

  // ── Data ──

  const threads = useMemo(() => {
    let items = getInboxThreads(mode);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (t) => t.name.toLowerCase().includes(q) || t.preview.toLowerCase().includes(q),
      );
    }
    return [...items].sort((a, b) => {
      if (a.unread !== b.unread) return a.unread ? -1 : 1;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [mode, search]);

  const mentions = useMemo(() => {
    let items = getInboxMentions(mode);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (m) =>
          m.roomName.toLowerCase().includes(q) ||
          m.senderName.toLowerCase().includes(q) ||
          m.preview.toLowerCase().includes(q),
      );
    }
    return items;
  }, [mode, search]);

  const unreadThreads = useMemo(() => threads.filter((t) => t.unread), [threads]);

  // Room thread messages
  const roomMessages = useMemo(() => {
    if (!selectedRoom) return [];
    return getRoomMessages(selectedRoom.id);
  }, [selectedRoom]);

  // ── Handlers ──

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  const searchPlaceholder = activeIndex === 1 ? 'Search rooms' : 'Search people / messages';

  // Group mock messages for thread detail
  const groupedMessages = useMemo(() => {
    if (!selectedThread) return [];
    const messages = MOCK_THREAD_MESSAGES.map((m) => ({
      ...m,
      sender: m.isMe ? 'You' : selectedThread.name,
      initials: m.isMe ? 'ME' : selectedThread.initials,
    }));
    const groups: { date: string; messages: ConversationMessageV3[] }[] = [];
    let currentDate = '';
    for (const msg of messages) {
      const dateStr = msg.timestamp.toLocaleDateString();
      if (dateStr !== currentDate) {
        currentDate = dateStr;
        groups.push({ date: dateStr, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    }
    return groups;
  }, [selectedThread]);

  // ── Render ──

  return (
    <ThemedView style={styles.container}>
      {/* Tab bar */}
      <PagedTabBar
        tabs={MESSAGES_TABS}
        activeIndex={activeIndex}
        onTabPress={handleTabPress}
        accentColor={MODE_ACCENT[mode]}
        tabWidth={TAB_WIDTH_3}
      />

      {/* Search bar + compose */}
      <View style={styles.topRow}>
        <View style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.newBtn,
            { backgroundColor: colors.backgroundSecondary, opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setNewThreadVisible(true);
          }}
        >
          <IconSymbol name="square.and.pencil" size={20} color={colors.text} />
        </Pressable>
      </View>

      {/* ===== 3-PAGE CONTENT ===== */}
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={3} onAdvance={handleTabPress} wrap>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          {/* ===== INBOX ===== */}
          <View key="inbox" style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.sectionList} showsVerticalScrollIndicator={false}>
              {/* Section: Unread */}
              {unreadThreads.length > 0 && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>UNREAD</Text>
                    <View style={[styles.countBadge, { backgroundColor: MODE_ACCENT[mode] }]}>
                      <Text style={styles.countText}>{unreadThreads.length}</Text>
                    </View>
                  </View>
                  {unreadThreads.map((thread) => (
                    <InboxRowV3
                      key={thread.id}
                      thread={thread}
                      onPress={() => setSelectedThread(thread)}
                    />
                  ))}
                </>
              )}

              {/* Section: Mentions */}
              {mentions.length > 0 && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>MENTIONS</Text>
                  </View>
                  {mentions.map((mention) => (
                    <Pressable
                      key={mention.id}
                      style={({ pressed }) => [
                        styles.mentionRow,
                        {
                          backgroundColor: pressed ? colors.backgroundSecondary : 'transparent',
                          borderBottomColor: colors.border,
                        },
                      ]}
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    >
                      <View style={[styles.mentionIcon, { backgroundColor: colors.backgroundTertiary }]}>
                        <IconSymbol name="at" size={18} color={colors.textSecondary} />
                      </View>
                      <View style={styles.mentionContent}>
                        <View style={styles.mentionTopLine}>
                          <Text
                            style={[styles.mentionRoom, { color: MODE_ACCENT[mode] }]}
                            numberOfLines={1}
                          >
                            {mention.roomName}
                          </Text>
                          <Text style={[styles.mentionTime, { color: colors.textTertiary }]}>
                            {formatMessageTime(mention.timestamp)}
                          </Text>
                        </View>
                        <Text
                          style={[styles.mentionSender, { color: colors.textTertiary }]}
                          numberOfLines={1}
                        >
                          {mention.senderName}
                        </Text>
                        <Text
                          style={[styles.mentionPreview, { color: colors.textSecondary }]}
                          numberOfLines={2}
                        >
                          {mention.preview}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </>
              )}

              {/* Empty state */}
              {unreadThreads.length === 0 && mentions.length === 0 && (
                <EmptyState
                  icon="bubble.left.fill"
                  title="No Messages"
                  description="Your inbox will appear here."
                />
              )}
            </ScrollView>
          </View>

          {/* ===== ROOMS ===== */}
          <View key="rooms" style={{ flex: 1 }}>
            <RoomsListV3
              mode={mode}
              search={search}
              onRoomPress={(room) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedRoom(room);
              }}
            />
          </View>

          {/* ===== NEXUS (Coming Soon) ===== */}
          <View key="nexus" style={{ flex: 1 }}>
            <EmptyState
              icon="sparkles"
              title="Nexus"
              description="AI-governed intelligence queue coming soon."
            />
          </View>
        </PagerView>
      </EdgeHoldAdvance>

      {/* ===== Thread Detail Sheet ===== */}
      <BottomSheet
        visible={selectedThread !== null}
        onClose={() => {
          setSelectedThread(null);
          setInputText('');
        }}
        title={selectedThread?.name}
        useModal
      >
        {selectedThread && (
          <View style={styles.threadDetail}>
            <ThemedText style={[styles.threadRole, { color: colors.textTertiary }]}>
              {selectedThread.role}
            </ThemedText>

            <View style={styles.messagesContainer}>
              {groupedMessages.map((group, gi) => (
                <View key={gi}>
                  <View style={styles.dateSeparator}>
                    <View style={[styles.dateLine, { backgroundColor: colors.divider }]} />
                    <ThemedText style={[styles.dateText, { color: colors.textTertiary }]}>
                      {group.date}
                    </ThemedText>
                    <View style={[styles.dateLine, { backgroundColor: colors.divider }]} />
                  </View>
                  {group.messages.map((msg) => (
                    <View
                      key={msg.id}
                      style={[
                        styles.bubbleRow,
                        { justifyContent: msg.isMe ? 'flex-end' : 'flex-start' },
                      ]}
                    >
                      {!msg.isMe && (
                        <View
                          style={[
                            styles.msgAvatar,
                            { backgroundColor: colors.backgroundTertiary },
                          ]}
                        >
                          <ThemedText
                            style={[styles.msgAvatarText, { color: colors.textTertiary }]}
                          >
                            {msg.initials}
                          </ThemedText>
                        </View>
                      )}
                      <View
                        style={[
                          styles.bubble,
                          msg.isMe
                            ? styles.myBubble
                            : [styles.otherBubble, { backgroundColor: colors.backgroundTertiary }],
                        ]}
                      >
                        {!msg.isMe && (
                          <ThemedText style={[styles.msgSender, { color: colors.textTertiary }]}>
                            {msg.sender}
                          </ThemedText>
                        )}
                        <ThemedText
                          style={[
                            styles.msgContent,
                            { color: msg.isMe ? '#000' : colors.text },
                          ]}
                        >
                          {msg.content}
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.msgTime,
                            {
                              color: msg.isMe ? 'rgba(0,0,0,0.5)' : colors.textTertiary,
                            },
                          ]}
                        >
                          {formatMessageTime(msg.timestamp)}
                        </ThemedText>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>

            <ChatComposer
              value={inputText}
              onChangeText={setInputText}
              onSend={() => setInputText('')}
            />
          </View>
        )}
      </BottomSheet>

      {/* ===== Room Thread Sheet ===== */}
      <BottomSheet
        visible={selectedRoom !== null}
        onClose={() => {
          setSelectedRoom(null);
          setRoomInputText('');
        }}
        title={selectedRoom?.name}
        useModal
      >
        {selectedRoom && (
          <View style={styles.threadDetail}>
            {/* Pinned message banner */}
            {selectedRoom.pinnedMessage && (
              <View style={[styles.pinnedBanner, { backgroundColor: colors.backgroundSecondary }]}>
                <IconSymbol name="pin.fill" size={12} color={colors.textTertiary} />
                <ThemedText
                  style={[styles.pinnedText, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {selectedRoom.pinnedMessage}
                </ThemedText>
              </View>
            )}

            {/* Room meta */}
            <View style={styles.roomMeta}>
              <ThemedText style={[styles.roomMetaText, { color: colors.textTertiary }]}>
                {selectedRoom.memberCount} members
                {selectedRoom.locked ? ' · Restricted' : ''}
                {selectedRoom.category === 'program' ? ' · Program' : selectedRoom.category === 'direct' ? ' · Direct' : ''}
              </ThemedText>
            </View>

            {/* Messages */}
            <ScrollView style={styles.roomMessages} showsVerticalScrollIndicator={false}>
              {roomMessages.map((msg) => (
                <View key={msg.id} style={styles.roomMsgRow}>
                  {!msg.isMe && (
                    <View style={[styles.msgAvatar, { backgroundColor: colors.backgroundTertiary }]}>
                      <ThemedText style={[styles.msgAvatarText, { color: colors.textTertiary }]}>
                        {msg.initials}
                      </ThemedText>
                    </View>
                  )}
                  <View style={[styles.roomMsgBubble, { flex: 1 }]}>
                    {!msg.isMe && (
                      <View style={styles.roomMsgHeader}>
                        <ThemedText style={[styles.roomMsgSender, { color: colors.text }]}>
                          {msg.sender}
                        </ThemedText>
                        <ThemedText style={[styles.roomMsgRole, { color: colors.textTertiary }]}>
                          {msg.role}
                        </ThemedText>
                      </View>
                    )}
                    {msg.isMe && (
                      <View style={styles.roomMsgHeader}>
                        <ThemedText style={[styles.roomMsgSender, { color: colors.text }]}>
                          You
                        </ThemedText>
                      </View>
                    )}
                    <ThemedText style={[styles.roomMsgContent, { color: colors.text }]}>
                      {msg.content}
                    </ThemedText>
                    <ThemedText style={[styles.roomMsgTime, { color: colors.textTertiary }]}>
                      {formatMessageTime(msg.timestamp)}
                    </ThemedText>
                  </View>
                </View>
              ))}

              {roomMessages.length === 0 && (
                <View style={styles.roomEmpty}>
                  <ThemedText style={[styles.roomEmptyText, { color: colors.textTertiary }]}>
                    No messages yet. Start the conversation.
                  </ThemedText>
                </View>
              )}
            </ScrollView>

            {/* Input */}
            <ChatComposer
              value={roomInputText}
              onChangeText={setRoomInputText}
              onSend={() => setRoomInputText('')}
            />
          </View>
        )}
      </BottomSheet>

      {/* ===== New Thread Sheet ===== */}
      <BottomSheet
        visible={newThreadVisible}
        onClose={() => setNewThreadVisible(false)}
        title="New Message"
        useModal
      >
        <NewThreadSheet onClose={() => setNewThreadVisible(false)} />
      </BottomSheet>
    </ThemedView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Top controls
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: 8,
    paddingVertical: Spacing.sm,
  },
  searchBar: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  newBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section list
  sectionList: {
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },

  // Mention rows
  mentionRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
    alignItems: 'flex-start',
  },
  mentionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mentionContent: {
    flex: 1,
    minWidth: 0,
  },
  mentionTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mentionRoom: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  mentionTime: {
    fontSize: 12,
    marginLeft: 8,
  },
  mentionSender: {
    fontSize: 12,
    marginTop: 1,
  },
  mentionPreview: {
    fontSize: 14,
    lineHeight: 19,
    marginTop: 3,
  },

  // Thread detail
  threadDetail: {
    flex: 1,
  },
  threadRole: {
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  messagesContainer: {
    gap: 12,
    marginBottom: Spacing.md,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  dateLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dateText: {
    fontSize: 11,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgAvatarText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
  },
  msgSender: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  msgContent: {
    fontSize: 15,
    lineHeight: 20,
  },
  msgTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },

  // Room thread
  pinnedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  pinnedText: {
    fontSize: 13,
    flex: 1,
  },
  roomMeta: {
    marginBottom: Spacing.sm,
  },
  roomMetaText: {
    fontSize: 12,
  },
  roomMessages: {
    flex: 1,
    marginBottom: Spacing.sm,
  },
  roomMsgRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  roomMsgBubble: {
    minWidth: 0,
  },
  roomMsgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  roomMsgSender: {
    fontSize: 13,
    fontWeight: '600',
  },
  roomMsgRole: {
    fontSize: 11,
  },
  roomMsgContent: {
    fontSize: 15,
    lineHeight: 20,
  },
  roomMsgTime: {
    fontSize: 11,
    marginTop: 2,
  },
  roomEmpty: {
    alignItems: 'center',
    paddingTop: Spacing.xl * 2,
  },
  roomEmptyText: {
    fontSize: 14,
  },
});
