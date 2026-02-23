/**
 * Messages Screen V3 — 3-tab universal PagerView: Inbox | Rooms | Nexus
 * Identical structure across all 5 modes — only seeded data changes per mode.
 * Requests fold inline into Inbox (Accept/Decline), pinned threads sort to top.
 * Nexus intelligence queue replaces old Requests + Pinned tabs.
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
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
import { InboxListV3 } from '@/components/messages/inbox-list-v3';
import { RoomsListV3 } from '@/components/messages/rooms-list-v3';
import { NexusQueueV3 } from '@/components/messages/nexus-queue-v3';
import { NexusAnswerSheet } from '@/components/messages/nexus-answer-sheet';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMode } from '@/context/app-context';
import { getUnansweredCount, formatMessageTime } from '@/data/mock-messages-v3';
import type { Mode, InboxThreadV3, NexusEscalationV3, ConversationMessageV3 } from '@/types';
import { EmptyState } from '@/components/ui/empty-state';

const EMPTY_MODES = new Set<Mode>(['sports', 'business', 'church', 'education', 'competition']);

// =============================================================================
// CONSTANTS
// =============================================================================

const SCREEN_WIDTH = Dimensions.get('window').width;
const TAB_WIDTH_3 = SCREEN_WIDTH / 3;

// =============================================================================
// MOCK CONVERSATION (reusable bubble pattern)
// =============================================================================

const MOCK_THREAD_MESSAGES: ConversationMessageV3[] = [
  { id: 'm1', sender: 'You', initials: 'ME', content: 'Got it, thanks for the update.', timestamp: new Date(Date.now() - 3600000), isMe: true },
  { id: 'm2', sender: 'Them', initials: '??', content: 'Let me know if you have any questions.', timestamp: new Date(Date.now() - 1800000), isMe: false },
];

// =============================================================================
// MAIN SCREEN
// =============================================================================

const COMING_SOON_MODES = new Set<Mode>(['education', 'competition']);

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

  // Search state
  const [search, setSearch] = useState('');

  // Thread detail state
  const [selectedThread, setSelectedThread] = useState<InboxThreadV3 | null>(null);
  const [inputText, setInputText] = useState('');
  const [newThreadVisible, setNewThreadVisible] = useState(false);

  // Nexus answer state
  const [selectedEscalation, setSelectedEscalation] = useState<NexusEscalationV3 | null>(null);

  // Build tabs with unanswered count badge
  const unansweredCount = getUnansweredCount(mode);
  const MESSAGES_TABS = useMemo(() => [
    { id: 'inbox', label: 'Inbox' },
    { id: 'rooms', label: 'Rooms' },
    { id: 'nexus', label: unansweredCount > 0 ? `Nexus (${unansweredCount})` : 'Nexus' },
  ], [unansweredCount]);

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  const handleSelectThread = useCallback((thread: InboxThreadV3) => {
    setSelectedThread(thread);
  }, []);

  const handleSelectEscalation = useCallback((escalation: NexusEscalationV3) => {
    setSelectedEscalation(escalation);
  }, []);

  // Group mock messages by day for thread detail
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

  return (
    <ThemedView style={styles.container}>
      {/* ===== MESSAGES HUB TAB BAR (3 tabs, full width) ===== */}
      <PagedTabBar
        tabs={MESSAGES_TABS}
        activeIndex={activeIndex}
        onTabPress={handleTabPress}
        accentColor={MODE_ACCENT[mode]}
        tabWidth={TAB_WIDTH_3}
      />

      {/* ===== SEARCH BAR + COMPOSE (hidden for empty modes) ===== */}
      {!EMPTY_MODES.has(mode) && (
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
      )}

      {/* ===== SWIPEABLE 3-PAGE CONTENT ===== */}
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={MESSAGES_TABS.length} onAdvance={handleTabPress} wrap>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          <View key="inbox" style={{ flex: 1 }}>
            {EMPTY_MODES.has(mode) ? (
              <EmptyState icon="bubble.left.fill" title="No Messages" description="Your inbox will appear here." />
            ) : (
              <InboxListV3 mode={mode} search={search} onSelectThread={handleSelectThread} />
            )}
          </View>
          <View key="rooms" style={{ flex: 1 }}>
            {EMPTY_MODES.has(mode) ? (
              <EmptyState icon="bubble.left.and.bubble.right.fill" title="No Rooms" description="Create rooms to collaborate with your team." />
            ) : (
              <RoomsListV3 mode={mode} search={search} />
            )}
          </View>
          <View key="nexus" style={{ flex: 1 }}>
            {EMPTY_MODES.has(mode) ? (
              <EmptyState icon="sparkles" title="No Escalations" description="Nexus escalations will appear here." />
            ) : (
              <NexusQueueV3 mode={mode} onSelectEscalation={handleSelectEscalation} />
            )}
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

      {/* ===== Nexus Answer Sheet ===== */}
      <NexusAnswerSheet
        escalation={selectedEscalation}
        onClose={() => setSelectedEscalation(null)}
      />

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
});
