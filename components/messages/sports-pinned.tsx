/**
 * SportsPinned — Command shelf with priority-ordered pinned items.
 * R1 gets 10 items, R3 gets 4 items.
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
  getSportsPinnedItems,
  sortPinnedItems,
  getUrgencyColor,
  type PinnedItem,
} from '@/data/mock-sports-messages';

const DEFAULT_ROLE: SportsRoleLens = 'R1';

export function SportsPinned() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const role = DEFAULT_ROLE;

  const items = useMemo(() => {
    const raw = getSportsPinnedItems(role);
    const visible = raw.filter(
      (p) => getMessagesSectionVisibility(p.rbacSection, role) !== 'hidden',
    );
    return sortPinnedItems(visible);
  }, [role]);

  const renderItem = ({ item }: { item: PinnedItem }) => (
    <PinnedItemRow item={item} colors={colors} />
  );

  if (items.length === 0) {
    return (
      <View style={styles.emptyState}>
        <IconSymbol name="pin.fill" size={28} color={colors.textTertiary} />
        <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
          No pinned items
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

function PinnedItemRow({ item, colors }: { item: PinnedItem; colors: typeof Colors.light }) {
  const urgencyColor = getUrgencyColor(item.urgency);

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
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: urgencyColor + '1A' }]}>
        <IconSymbol name={item.icon as any} size={16} color={urgencyColor} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ThemedText style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.subtitle}
        </ThemedText>
      </View>

      {/* Type badge */}
      <View style={[styles.typeBadge, { backgroundColor: colors.backgroundTertiary }]}>
        <ThemedText style={[styles.typeText, { color: colors.textTertiary }]}>
          {item.type}
        </ThemedText>
      </View>

      {/* Urgency dot */}
      <View style={[styles.urgencyDot, { backgroundColor: urgencyColor }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100,
  },
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
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  urgencyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxl,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
  },
});
