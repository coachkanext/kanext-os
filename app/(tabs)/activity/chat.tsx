/**
 * Chat Screen — Messages/Groups toggle, swipeable thread rows, thread detail sheet.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
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
import { Spacing, BorderRadius } from '@/constants/theme';
import {
  MOCK_CHAT_THREADS,
  MOCK_GROUP_THREADS,
  formatMessageTime,
} from '@/data/mock-messages';
import type { ChatThread, ChatSubTab } from '@/data/mock-messages';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [subTab, setSubTab] = useState<ChatSubTab>('messages');
  const [search, setSearch] = useState('');
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [newThreadVisible, setNewThreadVisible] = useState(false);
  const [inputText, setInputText] = useState('');

  const threads = subTab === 'messages' ? MOCK_CHAT_THREADS : MOCK_GROUP_THREADS;

  const filteredThreads = useMemo(() => {
    if (!search.trim()) return threads;
    const q = search.toLowerCase();
    return threads.filter(
      (t) => t.title.toLowerCase().includes(q) || t.lastMessage.toLowerCase().includes(q),
    );
  }, [search, threads]);

  const renderThread = useCallback(
    ({ item }: { item: ChatThread }) => (
      <SwipeableThreadRow
        thread={item}
        onPress={() => setSelectedThread(item)}
      />
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
      {/* Search + New Message */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <IconSymbol name="magnifyingglass" size={16} color="#555" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search threads..."
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
          <IconSymbol name="square.and.pencil" size={20} color="#f5f5f5" />
        </Pressable>
      </View>

      {/* Messages / Groups Toggle */}
      <ChatToggle activeTab={subTab} onTabChange={setSubTab} />

      {/* Thread List */}
      <FlatList
        data={filteredThreads}
        keyExtractor={(item) => item.id}
        renderItem={renderThread}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

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
                          style={[styles.msgContent, { color: msg.isMe ? '#000' : '#f5f5f5' }]}
                        >
                          {msg.content}
                        </ThemedText>
                        <ThemedText
                          style={[styles.msgTime, { color: msg.isMe ? 'rgba(0,0,0,0.5)' : '#6e6e6e' }]}
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: 10,
    marginBottom: Spacing.sm,
  },
  searchBar: {
    flex: 1,
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
    color: '#f5f5f5',
  },
  newBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#191919',
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
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Thread detail
  threadDetail: {
    flex: 1,
  },
  contextChip: {
    backgroundColor: '#191919',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  contextText: {
    fontSize: 12,
    color: '#6e6e6e',
    fontWeight: '500',
  },
  participants: {
    fontSize: 13,
    color: '#6e6e6e',
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
    backgroundColor: '#1a1a1a',
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
    backgroundColor: '#191919',
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgAvatarText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6e6e6e',
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
    backgroundColor: '#191919',
    borderBottomLeftRadius: 4,
  },
  msgSender: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6e6e6e',
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
