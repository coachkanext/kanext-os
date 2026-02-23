/**
 * SportsInbox — Priority-ordered inbox with urgency chips and label pills.
 * RBAC-gated via getMessagesSectionVisibility.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getMessagesSectionVisibility, type SportsRoleLens } from '@/utils/sports-rbac';
import {
  SPORTS_INBOX_THREADS,
  sortInboxByPriority,
  getPriorityColor,
  getPriorityLabel,
  type SportsInboxThread,
} from '@/data/mock-sports-messages';

const DEFAULT_ROLE: SportsRoleLens = 'R3';

interface SportsInboxProps {
  search?: string;
}

export function SportsInbox({ search = '' }: SportsInboxProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const role = DEFAULT_ROLE;

  const threads = useMemo(() => {
    let filtered = SPORTS_INBOX_THREADS.filter(
      (t) => getMessagesSectionVisibility(t.rbacSection, role) !== 'hidden',
    );
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) => t.title.toLowerCase().includes(q) || t.preview.toLowerCase().includes(q),
      );
    }
    return sortInboxByPriority(filtered);
  }, [role, search]);

  const renderItem = ({ item }: { item: SportsInboxThread }) => (
    <InboxThreadRow thread={item} colors={colors} />
  );

  return (
    <FlatList
      data={threads}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <IconSymbol name="tray" size={28} color={colors.textTertiary} />
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No messages
          </ThemedText>
        </View>
      }
    />
  );
}

function InboxThreadRow({ thread, colors }: { thread: SportsInboxThread; colors: typeof Colors.light }) {
  const priorityColor = getPriorityColor(thread.priority);
  const priorityLabel = getPriorityLabel(thread.priority);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? colors.backgroundSecondary : 'transparent',
          borderBottomColor: colors.border,
        },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      {/* Urgency indicator */}
      {thread.priority !== 'normal' && (
        <View style={[styles.urgencyChip, { backgroundColor: priorityColor + '1A' }]}>
          <ThemedText style={[styles.urgencyText, { color: priorityColor }]}>
            {priorityLabel}
          </ThemedText>
        </View>
      )}

      {/* Main content */}
      <View style={styles.rowContent}>
        <View style={styles.topLine}>
          <View style={[styles.senderAvatar, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[styles.senderInitials, { color: colors.text }]}>
              {thread.senderInitials}
            </ThemedText>
          </View>
          <View style={styles.titleArea}>
            <ThemedText style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {thread.title}
            </ThemedText>
            <ThemedText style={[styles.sender, { color: colors.textSecondary }]} numberOfLines={1}>
              {thread.sender}
            </ThemedText>
          </View>
          <View style={styles.rightArea}>
            <ThemedText style={[styles.time, { color: colors.textTertiary }]}>{thread.time}</ThemedText>
            {thread.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <ThemedText style={styles.unreadText}>{thread.unreadCount}</ThemedText>
              </View>
            )}
          </View>
        </View>

        <ThemedText style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={2}>
          {thread.preview}
        </ThemedText>

        {/* Label pills */}
        <View style={styles.labelRow}>
          {thread.labels.map((label) => (
            <View key={label} style={[styles.labelPill, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[styles.labelText, { color: colors.textSecondary }]}>{label}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100,
  },
  row: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  urgencyChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginBottom: 4,
  },
  urgencyText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rowContent: {
    gap: 4,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  senderInitials: {
    fontSize: 11,
    fontWeight: '700',
  },
  titleArea: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  sender: {
    fontSize: 12,
    marginTop: 1,
  },
  rightArea: {
    alignItems: 'flex-end',
    gap: 4,
  },
  time: {
    fontSize: 11,
  },
  unreadBadge: {
    backgroundColor: '#fff',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000',
  },
  preview: {
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 40,
  },
  labelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginLeft: 40,
    marginTop: 2,
  },
  labelPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  labelText: {
    fontSize: 10,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
  },
});
