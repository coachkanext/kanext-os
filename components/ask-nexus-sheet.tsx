/**
 * Ask Nexus Sheet — universal Q&A bottom sheet.
 * Two tabs: Ask (compose question) and History (past Q&A).
 * Founder-first V2: submit creates a "Pending" entry routed to founder.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  Keyboard,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius } from '@/constants/theme';
import {
  MOCK_ASK_HISTORY,
  getContextLabel,
  type AskNexusContext,
  type AskNexusEntry,
} from '@/data/mock-ask-nexus';

type AskTab = 'ask' | 'history';

interface AskNexusSheetProps {
  visible: boolean;
  onClose: () => void;
  context?: AskNexusContext;
}

export function AskNexusSheet({ visible, onClose, context }: AskNexusSheetProps) {
  const [tab, setTab] = useState<AskTab>('ask');
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<AskNexusEntry[]>(MOCK_ASK_HISTORY);

  const contextLabel = getContextLabel(context);

  const handleSend = useCallback(() => {
    if (!question.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Keyboard.dismiss();

    const newEntry: AskNexusEntry = {
      id: `ask-${Date.now()}`,
      question: question.trim(),
      context,
      contextLabel,
      status: 'pending',
      createdAt: new Date(),
    };

    setHistory((prev) => [newEntry, ...prev]);
    setQuestion('');
    setTab('history');
  }, [question, context, contextLabel]);

  const renderHistoryItem = useCallback(({ item }: { item: AskNexusEntry }) => {
    const isPending = item.status === 'pending';
    return (
      <View style={styles.historyItem}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyContext}>{item.contextLabel}</Text>
          <View style={[styles.statusBadge, isPending ? styles.statusPending : styles.statusAnswered]}>
            <Text style={[styles.statusText, isPending ? styles.statusTextPending : styles.statusTextAnswered]}>
              {isPending ? 'Pending' : 'Answered'}
            </Text>
          </View>
        </View>
        <Text style={styles.historyQuestion}>{item.question}</Text>
        {item.answer && (
          <Text style={styles.historyAnswer}>{item.answer}</Text>
        )}
        <Text style={styles.historyTime}>{formatTime(item.createdAt)}</Text>
      </View>
    );
  }, []);

  return (
    <BottomSheet useModal visible={visible} onClose={onClose} title="Ask Nexus">
      {/* Tab pills */}
      <View style={styles.tabRow}>
        {(['ask', 'history'] as const).map((t) => {
          const active = tab === t;
          return (
            <Pressable
              key={t}
              style={[styles.tabPill, active && styles.tabPillActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTab(t);
              }}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {t === 'ask' ? 'Ask' : 'History'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ASK TAB */}
      {tab === 'ask' && (
        <View style={styles.askContent}>
          {/* Context chips */}
          <View style={styles.contextRow}>
            <View style={styles.contextChip}>
              <IconSymbol name="location.fill" size={10} color="#6e6e6e" />
              <Text style={styles.contextChipText}>{contextLabel}</Text>
            </View>
            {context?.mode && (
              <View style={styles.contextChip}>
                <IconSymbol name="circle.fill" size={6} color="#3B82F6" />
                <Text style={styles.contextChipText}>{context.mode}</Text>
              </View>
            )}
          </View>

          {/* Input area */}
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              value={question}
              onChangeText={setQuestion}
              placeholder="Ask anything about your program..."
              placeholderTextColor="#4A4D55"
              multiline
              maxLength={500}
            />
          </View>

          {/* Send button */}
          <Pressable
            style={[styles.sendBtn, !question.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!question.trim()}
          >
            <IconSymbol name="paperplane.fill" size={16} color={question.trim() ? '#000' : '#555'} />
            <Text style={[styles.sendText, !question.trim() && styles.sendTextDisabled]}>
              Send to Founder
            </Text>
          </Pressable>

          <Text style={styles.disclaimer}>
            Your question will be reviewed and answered by a founder. Responses typically within 24 hours.
          </Text>
        </View>
      )}

      {/* HISTORY TAB */}
      {tab === 'history' && (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          scrollEnabled={false}
          contentContainerStyle={styles.historyList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No questions yet. Ask something!</Text>
          }
        />
      )}
    </BottomSheet>
  );
}

// ── Helpers ──

function formatTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

// ── Styles ──

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tabPill: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#2a2a2a',
  },
  tabPillActive: {
    backgroundColor: '#f5f5f5',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6e6e6e',
  },
  tabTextActive: {
    color: '#111',
  },

  // Ask tab
  askContent: {
    gap: 12,
  },
  contextRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  contextChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  contextChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
  },
  inputBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    minHeight: 100,
  },
  textInput: {
    fontSize: 14,
    color: '#f5f5f5',
    lineHeight: 20,
    padding: 0,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  sendBtnDisabled: {
    backgroundColor: '#2a2a2a',
  },
  sendText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  sendTextDisabled: {
    color: '#555',
  },
  disclaimer: {
    fontSize: 11,
    color: '#555',
    textAlign: 'center',
    lineHeight: 16,
  },

  // History tab
  historyList: {
    gap: 12,
  },
  historyItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: 6,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyContext: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6e6e6e',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusPending: {
    backgroundColor: '#F59E0B20',
  },
  statusAnswered: {
    backgroundColor: '#22C55E20',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextPending: {
    color: '#F59E0B',
  },
  statusTextAnswered: {
    color: '#22C55E',
  },
  historyQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f5f5f5',
    lineHeight: 20,
  },
  historyAnswer: {
    fontSize: 13,
    color: '#ccc',
    lineHeight: 18,
  },
  historyTime: {
    fontSize: 11,
    color: '#555',
  },
  emptyText: {
    fontSize: 13,
    color: '#6e6e6e',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
