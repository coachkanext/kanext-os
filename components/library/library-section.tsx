/**
 * LibrarySection — Collapsible section with header, item count, expand/collapse.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LibraryRecordCard } from '@/components/library/library-record-card';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { LibraryRecord, LibrarySectionConfig } from '@/data/mock-sports-library';

interface LibrarySectionProps {
  config: LibrarySectionConfig;
  records: LibraryRecord[];
}

export function LibrarySection({ config, records }: LibrarySectionProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [expanded, setExpanded] = useState(true);

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Pressable style={styles.header} onPress={toggle}>
        <View style={styles.headerLeft}>
          <ThemedText style={[styles.title, { color: colors.text }]}>{config.title}</ThemedText>
          <View style={[styles.countBadge, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[styles.countText, { color: colors.textSecondary }]}>
              {records.length}
            </ThemedText>
          </View>
        </View>
        <IconSymbol
          name={expanded ? 'chevron.up' : 'chevron.down'}
          size={14}
          color={colors.textTertiary}
        />
      </Pressable>

      {/* Records */}
      {expanded && (
        <View style={styles.recordList}>
          {records.map((record) => (
            <LibraryRecordCard key={record.id} record={record} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
  },
  recordList: {
    paddingHorizontal: Spacing.md,
  },
});
