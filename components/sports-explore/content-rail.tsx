/**
 * ContentRail — Reusable horizontal scroll carousel with title + "See All".
 * Used by both Sports Explore and Education Explore.
 */

import React from 'react';
import { View, FlatList, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ContentRailProps<T> {
  title: string;
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, colors: typeof Colors.light) => React.ReactElement;
  itemWidth?: number;
}

export function ContentRail<T>({ title, data, keyExtractor, renderItem, itemWidth = 180 }: ContentRailProps<T>) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: colors.text }]}>{title}</ThemedText>
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          hitSlop={8}
        >
          <ThemedText style={[styles.seeAll, { color: colors.textTertiary }]}>See All</ThemedText>
        </Pressable>
      </View>
      <FlatList
        horizontal
        data={data}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => (
          <View style={[styles.itemWrapper, { width: itemWidth }]}>
            {renderItem(item, colors)}
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    gap: 10,
  },
  itemWrapper: {},
});
