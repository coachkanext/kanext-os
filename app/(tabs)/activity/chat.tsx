/**
 * Messages Screen — Primary/Requests/Groups toggle, swipeable thread rows, thread detail sheet.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  SectionList,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { SwipeableThreadRow } from '@/components/messages/swipeable-thread-row';
import { ChatToggle } from '@/components/messages/chat-toggle';
import { NewThreadSheet } from '@/components/messages/new-thread-sheet';
import { ChatComposer } from '@/components/messages/chat-composer';
import { RequestRow } from '@/components/messages/request-row';
import { RequestDetail } from '@/components/messages/request-detail';
import { Spacing, BorderRadius } from '@/constants/theme';
import {
  MOCK_CHAT_THREADS,
  MOCK_GROUP_THREADS,
  formatMessageTime,
} from '@/data/mock-messages';
import type { ChatThread, ChatSubTab } from '@/data/mock-messages';
import {
  MOCK_PENDING_REQUESTS,
  MOCK_APPROVED_REQUESTS,
} from '@/data/mock-requests';
import type { RequestItem } from '@/data/mock-requests';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [subTab, setSubTab] = useState<ChatSubTab>('primary');
  const [search, setSearch] = useState('');
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [newThreadVisible, setNewThreadVisible] = useState(false);
  const [inputText, setInputText] = useState('');

  // Requests state
  const [pending, setPending] = useState(MOCK_PENDING_REQUESTS);
  const [approved, setApproved] = useState(MOCK_APPROVED_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);

  const threads = subTab === 'primary'
    ? MOCK_CHAT_THREADS.filter((t) => !t.isGroup)
    : MOCK_GROUP_THREADS;

  const filteredThreads = useMemo(() => {
    if (subTab === 'requests') return [];
    const list = subTab === 'primary' ? MOCK_CHAT_THREADS : MOCK_GROUP_THREADS;
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (t) => t.title.toLowerCase().includes(q) || t.lastMessage.toLowerCase().includes(q),
    );
  }, [search, subTab]);

  const renderThread = useCallback(
    ({ item }: { item: ChatThread }) => (
      <SwipeableThreadRow
        thread={item}
        onPress={() => setSelectedThread(item)}
      />
    ),
    [],
  );

  // Requests handlers
  const requestSections = useMemo(() => {
    return [
      { title: 'Pending', data: pending },
      { title: 'Approved', data: approved },
    ].filter((s) => s.data.length > 0);
  }, [pending, approved]);

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

  const renderRequestItem = useCallback(
    ({ item }: { item: RequestItem }) => (
      <RequestRow
        request={item}
        onPress={() => setSelectedRequest(item)}
        onApprove={() => handleApprove(item)}
        onIgnore={() => handleIgnore(item)}
      />
    ),
    [handleApprove, handleIgnore],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string } }) => (
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
      </View>
    ),
    [],
  );

  // Group messages by day
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
    <View style={styles.container}>
      {/* Search + New Message + Toggle */}
      <View style={styles.topRow}>
        <View style={styles.searchBar}>
          <IconSymbol name="magnifyingglass" size={16} color="#555" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#555"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <Pressable
          style={({ pressed }) => [styles.newBtn, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setNewThreadVisible(true);
          }}
        >
          <IconSymbol name="square.and.pencil" size={20} color="#FFFFFF" />
        </Pressable>
        <ChatToggle activeTab={subTab} onTabChange={setSubTab} />
      </View>

      {/* Content based on sub-tab */}
      {subTab === 'requests' ? (
        pending.length === 0 && approved.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>No pending requests</ThemedText>
          </View>
        ) : (
          <SectionList
            sections={requestSections}
            keyExtractor={(item) => item.id}
            renderItem={renderRequestItem}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
          />
        )
      ) : (
        <FlatList
          data={filteredThreads}
          keyExtractor={(item) => item.id}
          renderItem={renderThread}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

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
            {/* Context chip */}
            {selectedThread.context?.subtitle && (
              <View style={styles.contextChip}>
                <ThemedText style={styles.contextText}>
                  {selectedThread.context.subtitle}
                </ThemedText>
              </View>
            )}

            <ThemedText style={styles.participants}>
              {selectedThread.participants.length} participants
            </ThemedText>

            {/* Messages */}
            <View style={styles.messagesContainer}>
              {groupedMessages.map((group, gi) => (
                <View key={gi}>
                  <View style={styles.dateSeparator}>
                    <View style={styles.dateLine} />
                    <ThemedText style={styles.dateText}>{group.date}</ThemedText>
                    <View style={styles.dateLine} />
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
                        <View style={styles.msgAvatar}>
                          <ThemedText style={styles.msgAvatarText}>{msg.initials}</ThemedText>
                        </View>
                      )}
                      <View
                        style={[
                          styles.bubble,
                          msg.isMe ? styles.myBubble : styles.otherBubble,
                        ]}
                      >
                        {!msg.isMe && (
                          <ThemedText style={styles.msgSender}>{msg.sender}</ThemedText>
                        )}
                        <ThemedText
                          style={[styles.msgContent, { color: msg.isMe ? '#000' : '#FFFFFF' }]}
                        >
                          {msg.content}
                        </ThemedText>
                        <ThemedText
                          style={[styles.msgTime, { color: msg.isMe ? 'rgba(0,0,0,0.5)' : '#A1A1AA' }]}
                        >
                          {formatMessageTime(msg.timestamp)}
                        </ThemedText>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>

            {/* Composer */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: 8,
    marginBottom: Spacing.sm,
  },
  searchBar: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
  },
  newBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: Spacing.md,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Requests section
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A1A1AA',
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
    color: '#555',
  },

  // Thread detail
  threadDetail: {
    flex: 1,
  },
  contextChip: {
    backgroundColor: '#0B0F14',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  contextText: {
    fontSize: 12,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  participants: {
    fontSize: 13,
    color: '#A1A1AA',
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
    backgroundColor: '#0B0F14',
  },
  dateText: {
    fontSize: 11,
    color: '#555',
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
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgAvatarText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A1A1AA',
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
    backgroundColor: '#0B0F14',
    borderBottomLeftRadius: 4,
  },
  msgSender: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A1A1AA',
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
