/**
 * Library Bucket — expandable row with icon, label, count, and chevron.
 * Expands to reveal contained items.
 */

import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';

interface LibraryBucketProps {
  icon: IconSymbolName;
  label: string;
  count: number;
  children?: React.ReactNode;
}

export function LibraryBucket({ icon, label, count, children }: LibraryBucketProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View>
      <Pressable
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: pressed ? '#191919' : 'transparent' },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setExpanded(!expanded);
        }}
      >
        <IconSymbol name={icon} size={20} color="#6e6e6e" />
        <ThemedText style={styles.label}>{label}</ThemedText>
        <View style={styles.countBadge}>
          <ThemedText style={styles.countText}>{count}</ThemedText>
        </View>
        <IconSymbol
          name={expanded ? 'chevron.up' : 'chevron.down'}
          size={14}
          color="#555"
        />
      </Pressable>
      {expanded && children && (
        <View style={styles.expandedContent}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1a1a1a',
    gap: 12,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#f5f5f5',
  },
  countBadge: {
    backgroundColor: '#191919',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 4,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6e6e6e',
  },
  expandedContent: {
    paddingLeft: Spacing.md,
    backgroundColor: '#0a0a0a',
  },
});
