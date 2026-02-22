/**
 * LibraryRecordCard — Card with thumbnail, access badge, tags, clip count, export indicator.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getAccessLevelColor,
  getAccessLevelLabel,
  getRecordTypeLabel,
  type LibraryRecord,
} from '@/data/mock-sports-library';

interface LibraryRecordCardProps {
  record: LibraryRecord;
}

export function LibraryRecordCard({ record }: LibraryRecordCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const accessColor = getAccessLevelColor(record.accessLevel);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: pressed ? colors.cardElevated : colors.card },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      {/* Thumbnail */}
      <View style={[styles.thumbnail, { backgroundColor: record.thumbnailColor }]}>
        <IconSymbol name="play.fill" size={14} color="#fff" />
        <View style={styles.durationBadge}>
          <ThemedText style={styles.durationText}>{record.duration}</ThemedText>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <ThemedText style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {record.title}
          </ThemedText>
          {record.exportable && (
            <IconSymbol name="square.and.arrow.up" size={12} color={colors.textTertiary} />
          )}
        </View>

        {/* Access + Type badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.accessBadge, { backgroundColor: accessColor + '1A' }]}>
            <ThemedText style={[styles.accessText, { color: accessColor }]}>
              {getAccessLevelLabel(record.accessLevel)}
            </ThemedText>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[styles.typeText, { color: colors.textSecondary }]}>
              {getRecordTypeLabel(record.type)}
            </ThemedText>
          </View>
        </View>

        {/* Meta */}
        <View style={styles.metaRow}>
          <ThemedText style={[styles.meta, { color: colors.textTertiary }]}>
            {record.owner}
          </ThemedText>
          <View style={styles.dot} />
          <ThemedText style={[styles.meta, { color: colors.textTertiary }]}>
            {record.date}
          </ThemedText>
          <View style={styles.dot} />
          <ThemedText style={[styles.meta, { color: colors.textTertiary }]}>
            {record.clipCount} {record.clipCount === 1 ? 'clip' : 'clips'}
          </ThemedText>
        </View>

        {/* Tags */}
        <View style={styles.tagRow}>
          {record.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[styles.tagText, { color: colors.textSecondary }]}>{tag}</ThemedText>
            </View>
          ))}
          {record.workspaceRef && (
            <View style={[styles.tag, { backgroundColor: accent + '1A' }]}>
              <ThemedText style={[styles.tagText, { color: accent }]}>{record.workspaceRef}</ThemedText>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  thumbnail: {
    width: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  durationText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#fff',
  },
  info: {
    flex: 1,
    padding: Spacing.sm + 2,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 4,
  },
  accessBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
  },
  accessText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  typeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  meta: {
    fontSize: 10,
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#52525B',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  tag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '500',
  },
});
