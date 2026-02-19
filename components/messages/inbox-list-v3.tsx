/**
 * InboxListV3 — Universal inbox FlatList.
 * Sorts: pinned first → requests → unread → read.
 * Filters by search string across name + preview.
 */

import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getInboxThreads } from '@/data/mock-messages-v3';
import { InboxRowV3 } from '@/components/messages/inbox-row-v3';
import type { Mode, InboxThreadV3 } from '@/types';

interface InboxListV3Props {
  mode: Mode;
  search: string;
  onSelectThread: (thread: InboxThreadV3) => void;
}

function sortInbox(threads: InboxThreadV3[]): InboxThreadV3[] {
  return [...threads].sort((a, b) => {
    // Pinned first
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    // Requests next
    if (a.isRequest !== b.isRequest) return a.isRequest ? -1 : 1;
    // Unread next
    if (a.unread !== b.unread) return a.unread ? -1 : 1;
    // Then by timestamp (newest first)
    return b.timestamp.getTime() - a.timestamp.getTime();
  });
}

export function InboxListV3({ mode, search, onSelectThread }: InboxListV3Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const threads = useMemo(() => {
    let items = getInboxThreads(mode);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (t) => t.name.toLowerCase().includes(q) || t.preview.toLowerCase().includes(q),
      );
    }
    return sortInbox(items);
  }, [mode, search]);

  const renderItem = useCallback(
    ({ item }: { item: InboxThreadV3 }) => (
      <InboxRowV3
        thread={item}
        onPress={() => onSelectThread(item)}
        onAccept={() => {/* TODO: accept request */}}
        onDecline={() => {/* TODO: decline request */}}
      />
    ),
    [onSelectThread],
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

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xl * 2,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
  },
});
