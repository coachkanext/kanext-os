/**
 * Link Card — external coaching resource row.
 * Source badge, title, creator, tags, notes preview, external indicator.
 * Follows ClipCard row pattern.
 */

import React from 'react';
import { View, StyleSheet, Pressable, Linking } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius } from '@/constants/theme';
import { SOURCE_COLORS, type LinkCardItem } from '@/data/mock-coach-library';

interface LinkCardProps {
  item: LinkCardItem;
}

export function LinkCard({ item }: LinkCardProps) {
  const sourceColor = SOURCE_COLORS[item.source];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(item.url).catch(() => {});
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? '#0B0F14' : 'transparent' },
      ]}
      onPress={handlePress}
    >
      {/* Source badge */}
      <View style={[styles.sourceBadge, { backgroundColor: sourceColor + '25' }]}>
        <ThemedText style={[styles.sourceText, { color: sourceColor }]}>
          {item.source}
        </ThemedText>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ThemedText style={styles.title} numberOfLines={1}>{item.title}</ThemedText>
        <View style={styles.meta}>
          {item.creator && (
            <ThemedText style={styles.creator}>{item.creator}</ThemedText>
          )}
          {item.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {item.tags.slice(0, 2).map((tag) => (
                <View key={tag} style={styles.tagChip}>
                  <ThemedText style={styles.tagText}>{tag}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>
        {item.notes && (
          <ThemedText style={styles.notes} numberOfLines={1}>{item.notes}</ThemedText>
        )}
      </View>

      {/* External link icon */}
      <IconSymbol name="arrow.up.right.square" size={16} color="#9C9790" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#0B0F14',
    gap: 10,
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 56,
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creator: {
    fontSize: 12,
    color: '#9C9790',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  tagChip: {
    backgroundColor: '#0B0F14',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#9C9790',
    fontWeight: '500',
  },
  notes: {
    fontSize: 11,
    color: '#555',
    marginTop: 2,
  },
});
