/**
 * Structured Block — renders rich content blocks inside Nexus responses.
 * Types: section, stat_row, bullet_list, callout, divider
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { StructuredBlock as StructuredBlockType } from '@/types/nexus-v2';

const VARIANT_COLORS = {
  info: { border: '#3B82F6', bg: 'rgba(59,130,246,0.08)', icon: 'info.circle.fill' as const },
  warning: { border: '#F59E0B', bg: 'rgba(245,158,11,0.08)', icon: 'exclamationmark.triangle.fill' as const },
  success: { border: '#10B981', bg: 'rgba(16,185,129,0.08)', icon: 'checkmark.circle.fill' as const },
  error: { border: '#EF4444', bg: 'rgba(239,68,68,0.08)', icon: 'xmark.circle.fill' as const },
};

interface Props {
  block: StructuredBlockType;
}

export function StructuredBlock({ block }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  switch (block.type) {
    case 'section':
      return (
        <View style={styles.section}>
          {block.title && (
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              {block.title}
            </ThemedText>
          )}
          {block.items?.map((item, i) => (
            <ThemedText key={i} style={[styles.sectionItem, { color: colors.textSecondary }]}>
              {item}
            </ThemedText>
          ))}
          {block.content && (
            <ThemedText style={[styles.sectionContent, { color: colors.textSecondary }]}>
              {block.content}
            </ThemedText>
          )}
        </View>
      );

    case 'stat_row':
      return (
        <View style={[styles.statRow, { backgroundColor: colors.backgroundTertiary }]}>
          {block.stats?.map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
                {stat.label}
              </ThemedText>
              <ThemedText
                style={[styles.statValue, { color: stat.color || colors.text }]}
              >
                {stat.value}
              </ThemedText>
            </View>
          ))}
        </View>
      );

    case 'bullet_list':
      return (
        <View style={styles.bulletList}>
          {block.title && (
            <ThemedText style={[styles.bulletTitle, { color: colors.text }]}>
              {block.title}
            </ThemedText>
          )}
          {block.items?.map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <ThemedText style={[styles.bulletDot, { color: colors.textTertiary }]}>•</ThemedText>
              <ThemedText style={[styles.bulletText, { color: colors.textSecondary }]}>
                {item}
              </ThemedText>
            </View>
          ))}
        </View>
      );

    case 'callout': {
      const variant = block.variant || 'info';
      const vc = VARIANT_COLORS[variant];
      return (
        <View style={[styles.callout, { borderLeftColor: vc.border, backgroundColor: vc.bg }]}>
          <View style={styles.calloutHeader}>
            <IconSymbol name={vc.icon} size={14} color={vc.border} />
            {block.title && (
              <ThemedText style={[styles.calloutTitle, { color: colors.text }]} numberOfLines={2}>
                {block.title}
              </ThemedText>
            )}
          </View>
          {block.content && (
            <ThemedText style={[styles.calloutContent, { color: colors.textSecondary }]}>
              {block.content}
            </ThemedText>
          )}
        </View>
      );
    }

    case 'divider':
      return <View style={[styles.divider, { backgroundColor: colors.border }]} />;

    default:
      return null;
  }
}

interface StructuredBlocksProps {
  blocks: StructuredBlockType[];
}

export function StructuredBlocks({ blocks }: StructuredBlocksProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <View style={styles.container}>
      {blocks.map((block, i) => (
        <StructuredBlock key={i} block={block} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    gap: 8,
  },

  // Section
  section: {
    marginVertical: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  sectionItem: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 4,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Stat Row
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    gap: 2,
  },
  statItem: {
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Bullet List
  bulletList: {
    marginVertical: 2,
  },
  bulletTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    paddingLeft: 4,
    marginBottom: 2,
  },
  bulletDot: {
    fontSize: 14,
    marginRight: 6,
    lineHeight: 20,
  },
  bulletText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },

  // Callout
  callout: {
    borderLeftWidth: 3,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm + 2,
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  calloutTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    flex: 1,
  },
  calloutContent: {
    fontSize: 13,
    lineHeight: 19,
    marginLeft: 20,
  },

  // Divider
  divider: {
    height: 1,
    marginVertical: 8,
  },
});
