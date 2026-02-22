/**
 * ModePinnedV2 — Enhanced pinned messages for non-sports modes.
 * Priority sorting, pin indicators, unread badges.
 * Uses mode-keyed data from mock-messages.ts.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Mode } from '@/types';
import {
  PINNED_THREADS_BY_MODE,
  formatMessageTime,
  type ChatThread,
} from '@/data/mock-messages';

interface Props {
  mode: Mode;
  search?: string;
}

export function ModePinnedV2({ mode, search = '' }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();

  const threads = useMemo(() => {
    let list = PINNED_THREADS_BY_MODE[mode] ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) => t.title.toLowerCase().includes(q) || t.lastMessage.toLowerCase().includes(q),
      );
    }
    // Sort: unread first, then by timestamp
    return [...list].sort((a, b) => {
      if (a.unread > 0 && b.unread === 0) return -1;
      if (a.unread === 0 && b.unread > 0) return 1;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [mode, search]);

  const renderItem = ({ item }: { item: ChatThread }) => (
    <PinnedRow thread={item} colors={colors} accent={accent} />
  );

  if (threads.length === 0) {
    return (
      <View style={styles.emptyState}>
        <IconSymbol name="pin.fill" size={28} color={colors.textTertiary} />
        <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
          No pinned messages
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={threads}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

function PinnedRow({
  thread,
  colors,
  accent,
}: {
  thread: ChatThread;
  colors: typeof Colors.light;
  accent: string;
}) {
  const timeStr = formatMessageTime(thread.timestamp);
  const contextLabel = thread.context?.subtitle;

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
      {/* Pin icon */}
      <View style={[styles.iconContainer, { backgroundColor: accent + '1A' }]}>
        <IconSymbol name="pin.fill" size={16} color={accent} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ThemedText style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {thread.title}
        </ThemedText>
        {contextLabel && (
          <ThemedText style={[styles.contextLabel, { color: colors.textTertiary }]} numberOfLines={1}>
            {contextLabel}
          </ThemedText>
        )}
        <ThemedText style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={1}>
          {thread.lastMessage}
        </ThemedText>
      </View>

      {/* Right */}
      <View style={styles.right}>
        <ThemedText style={[styles.time, { color: colors.textTertiary }]}>{timeStr}</ThemedText>
        {thread.unread > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: accent }]}>
            <ThemedText style={styles.unreadText}>{thread.unread}</ThemedText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: 100 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
  contextLabel: { fontSize: 11 },
  preview: { fontSize: 13, marginTop: 1 },
  right: { alignItems: 'flex-end', gap: 4 },
  time: { fontSize: 11 },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadText: { fontSize: 10, fontWeight: '800', color: '#000' },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxl,
    gap: 8,
  },
  emptyText: { fontSize: 14 },
});
