/**
 * Messages Screen — 3-tab PagerView hub: Inbox | Groups | Requests
 * Matches the Media/Home swipe UX pattern exactly.
 * Mode-scoped — structure ready for mode-tagged data.
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  SectionList,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { SwipeableThreadRow } from '@/components/messages/swipeable-thread-row';
import { ChatComposer } from '@/components/messages/chat-composer';
import { NewThreadSheet } from '@/components/messages/new-thread-sheet';
import { RequestRow } from '@/components/messages/request-row';
import { RequestDetail } from '@/components/messages/request-detail';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMode } from '@/context/app-context';
import {
  MOCK_CHAT_THREADS,
  MOCK_GROUP_THREADS,
  formatMessageTime,
} from '@/data/mock-messages';
import type { ChatThread } from '@/data/mock-messages';
import {
  MOCK_PENDING_REQUESTS,
  MOCK_APPROVED_REQUESTS,
} from '@/data/mock-requests';
import type { RequestItem } from '@/data/mock-requests';

// =============================================================================
// TAB DEFINITIONS
// =============================================================================

const MESSAGES_TABS = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'groups', label: 'Groups' },
  { id: 'requests', label: 'Requests' },
];

// =============================================================================
// MESSAGES HUB TAB BAR (matches Media/Home pattern)
// =============================================================================

function MessagesHubTabs({
  tabs,
  colors,
  activeIndex,
  onTabPress,
}: {
  tabs: { id: string; label: string }[];
  colors: typeof Colors.light;
  activeIndex: number;
  onTabPress: (index: number) => void;
}) {
  const tabScrollRef = useRef<ScrollView>(null);
  const tabLayoutsRef = useRef<{ x: number; width: number }[]>([]);

  const scrollToTab = useCallback((index: number) => {
    const layout = tabLayoutsRef.current[index];
    if (layout && tabScrollRef.current) {
      tabScrollRef.current.scrollTo({
        x: Math.max(0, layout.x - 40),
        animated: true,
      });
    }
  }, []);

  useEffect(() => {
    scrollToTab(activeIndex);
  }, [activeIndex, scrollToTab]);

  return (
    <View style={[styles.hubTabsContainer, { borderBottomColor: colors.divider }]}>
      <ScrollView
        ref={tabScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hubTabsContent}
      >
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <Pressable
              key={tab.id}
              onLayout={(e) => {
                tabLayoutsRef.current[index] = {
                  x: e.nativeEvent.layout.x,
                  width: e.nativeEvent.layout.width,
                };
              }}
              style={[
                styles.hubTab,
                isActive && [styles.hubTabActive, { borderBottomColor: colors.text }],
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onTabPress(index);
              }}
            >
              <ThemedText
                style={[
                  styles.hubTabLabel,
                  { color: isActive ? colors.text : colors.textTertiary },
                  isActive && styles.hubTabLabelActive,
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// INBOX PAGE
// =============================================================================

function InboxPage({
  colors,
  search,
  onSelectThread,
}: {
  colors: typeof Colors.light;
  search: string;
  onSelectThread: (t: ChatThread) => void;
}) {
  const threads = useMemo(() => {
    const list = MOCK_CHAT_THREADS.filter((t) => !t.isGroup);
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (t) => t.title.toLowerCase().includes(q) || t.lastMessage.toLowerCase().includes(q),
    );
  }, [search]);

  const renderThread = useCallback(
    ({ item }: { item: ChatThread }) => (
      <SwipeableThreadRow thread={item} onPress={() => onSelectThread(item)} />
    ),
    [onSelectThread],
  );

  return (
    <FlatList
      data={threads}
      keyExtractor={(item) => item.id}
      renderItem={renderThread}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

// =============================================================================
// GROUPS PAGE
// =============================================================================

function GroupsPage({
  colors,
  search,
  onSelectThread,
}: {
  colors: typeof Colors.light;
  search: string;
  onSelectThread: (t: ChatThread) => void;
}) {
  const threads = useMemo(() => {
    const list = MOCK_GROUP_THREADS;
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (t) => t.title.toLowerCase().includes(q) || t.lastMessage.toLowerCase().includes(q),
    );
  }, [search]);

  const renderThread = useCallback(
    ({ item }: { item: ChatThread }) => (
      <SwipeableThreadRow thread={item} onPress={() => onSelectThread(item)} />
    ),
    [onSelectThread],
  );

  return (
    <FlatList
      data={threads}
      keyExtractor={(item) => item.id}
      renderItem={renderThread}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

// =============================================================================
// REQUESTS PAGE
// =============================================================================

function RequestsPage({
  colors,
  pending,
  approved,
  onSelectRequest,
  onApprove,
  onIgnore,
}: {
  colors: typeof Colors.light;
  pending: RequestItem[];
  approved: RequestItem[];
  onSelectRequest: (r: RequestItem) => void;
  onApprove: (r: RequestItem) => void;
  onIgnore: (r: RequestItem) => void;
}) {
  const sections = useMemo(
    () =>
      [
        { title: 'Pending', data: pending },
        { title: 'Approved', data: approved },
      ].filter((s) => s.data.length > 0),
    [pending, approved],
  );

  const renderItem = useCallback(
    ({ item }: { item: RequestItem }) => (
      <RequestRow
        request={item}
        onPress={() => onSelectRequest(item)}
        onApprove={() => onApprove(item)}
        onIgnore={() => onIgnore(item)}
      />
    ),
    [onSelectRequest, onApprove, onIgnore],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string } }) => (
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
      </View>
    ),
    [],
  );

  if (pending.length === 0 && approved.length === 0) {
    return (
      <View style={styles.emptyState}>
        <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
          No pending requests
        </ThemedText>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
    />
  );
}

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function MessagesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const mode = useMode();
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  // Search state
  const [search, setSearch] = useState('');

  // Thread detail state
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [inputText, setInputText] = useState('');
  const [newThreadVisible, setNewThreadVisible] = useState(false);

  // Requests state
  const [pending, setPending] = useState(MOCK_PENDING_REQUESTS);
  const [approved, setApproved] = useState(MOCK_APPROVED_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  // Request handlers
  const handleApprove = useCallback((item: RequestItem) => {
    setPending((prev) => prev.filter((r) => r.id !== item.id));
    setApproved((prev) => [{ ...item, status: 'approved' as const }, ...prev]);
    setSelectedRequest(null);
  }, []);

  const handleIgnore = useCallback((item: RequestItem) => {
    setPending((prev) => prev.filter((r) => r.id !== item.id));
    setSelectedRequest(null);
  }, []);

  const handleBlock = useCallback((item: RequestItem) => {
    Alert.alert('Block', `${item.name} has been blocked.`);
    setPending((prev) => prev.filter((r) => r.id !== item.id));
    setSelectedRequest(null);
  }, []);

  const handleReport = useCallback((item: RequestItem) => {
    Alert.alert('Report', `${item.name} has been reported.`);
    setSelectedRequest(null);
  }, []);

  // Group messages by day for thread detail
  const groupedMessages = useMemo(() => {
    if (!selectedThread) return [];
    const groups: { date: string; messages: typeof selectedThread.messages }[] = [];
    let currentDate = '';
    for (const msg of selectedThread.messages) {
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

  return (
    <ThemedView style={styles.container}>
      {/* ===== MESSAGES HUB TAB BAR ===== */}
      <MessagesHubTabs
        tabs={MESSAGES_TABS}
        colors={colors}
        activeIndex={activeIndex}
        onTabPress={handleTabPress}
      />

      {/* ===== SEARCH BAR + NEW MESSAGE ===== */}
      <View style={styles.topRow}>
        <View style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search..."
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

      {/* ===== SWIPEABLE CONTENT ===== */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
      >
        <View key="inbox" style={{ flex: 1 }}>
          <InboxPage
            colors={colors}
            search={search}
            onSelectThread={setSelectedThread}
          />
        </View>
        <View key="groups" style={{ flex: 1 }}>
          <GroupsPage
            colors={colors}
            search={search}
            onSelectThread={setSelectedThread}
          />
        </View>
        <View key="requests" style={{ flex: 1 }}>
          <RequestsPage
            colors={colors}
            pending={pending}
            approved={approved}
            onSelectRequest={setSelectedRequest}
            onApprove={handleApprove}
            onIgnore={handleIgnore}
          />
        </View>
      </PagerView>

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.bottom + 80, opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setNewThreadVisible(true);
        }}
      >
        <IconSymbol name="square.and.pencil" size={22} color="#000" />
      </Pressable>

      {/* Thread Detail Sheet */}
      <BottomSheet
        visible={selectedThread !== null}
        onClose={() => {
          setSelectedThread(null);
          setInputText('');
        }}
        title={selectedThread?.title}
        useModal
      >
        {selectedThread && (
          <View style={styles.threadDetail}>
            {selectedThread.context?.subtitle && (
              <View style={[styles.contextChip, { backgroundColor: colors.backgroundTertiary }]}>
                <ThemedText style={[styles.contextText, { color: colors.textTertiary }]}>
                  {selectedThread.context.subtitle}
                </ThemedText>
              </View>
            )}

            <ThemedText style={[styles.participants, { color: colors.textTertiary }]}>
              {selectedThread.participants.length} participants
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
                        <View style={[styles.msgAvatar, { backgroundColor: colors.backgroundTertiary }]}>
                          <ThemedText style={[styles.msgAvatarText, { color: colors.textTertiary }]}>
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
                          style={[styles.msgContent, { color: msg.isMe ? '#000' : colors.text }]}
                        >
                          {msg.content}
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.msgTime,
                            { color: msg.isMe ? 'rgba(0,0,0,0.5)' : colors.textTertiary },
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

      {/* Request Detail Sheet */}
      <BottomSheet
        visible={selectedRequest !== null}
        onClose={() => setSelectedRequest(null)}
        title="Request Detail"
        useModal
      >
        {selectedRequest && (
          <RequestDetail
            request={selectedRequest}
            onApprove={() => handleApprove(selectedRequest)}
            onIgnore={() => handleIgnore(selectedRequest)}
            onBlock={() => handleBlock(selectedRequest)}
            onReport={() => handleReport(selectedRequest)}
          />
        )}
      </BottomSheet>

      {/* New Thread Sheet */}
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

  // Hub Tab Bar (matches Media/Home pattern)
  hubTabsContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingTop: 4,
  },
  hubTabsContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  hubTab: {
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  hubTabActive: {
    borderBottomWidth: 2.5,
  },
  hubTabLabel: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  hubTabLabelActive: {
    fontWeight: '700',
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

  // List
  listContent: {
    paddingBottom: 100,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: Spacing.md,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Requests sections
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6e6e6e',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
  },

  // Thread detail
  threadDetail: {
    flex: 1,
  },
  contextChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  contextText: {
    fontSize: 12,
    fontWeight: '500',
  },
  participants: {
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
    backgroundColor: '#f5f5f5',
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
});
