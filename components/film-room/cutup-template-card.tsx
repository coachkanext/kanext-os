/**
 * CutupTemplateCard — Grid card for cutup template categories.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { CutupTemplate } from '@/data/mock-sports-workspaces';

interface CutupTemplateCardProps {
  template: CutupTemplate;
}

export function CutupTemplateCard({ template }: CutupTemplateCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: pressed ? colors.cardElevated : colors.card, borderColor: colors.border },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.backgroundTertiary }]}>
        <IconSymbol name={template.icon as any} size={24} color={colors.textSecondary} />
      </View>
      <ThemedText style={[styles.category, { color: colors.text }]} numberOfLines={1}>
        {template.category}
      </ThemedText>
      <ThemedText style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
        {template.description}
      </ThemedText>
      <View style={styles.metaRow}>
        <ThemedText style={[styles.clipCount, { color: colors.textTertiary }]}>
          {template.clipCount} clips
        </ThemedText>
      </View>
      <View style={styles.tagRow}>
        {template.tags.map((tag) => (
          <View key={tag} style={[styles.tag, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[styles.tagText, { color: colors.textSecondary }]}>{tag}</ThemedText>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47.5%',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.sm + 4,
    gap: 6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  category: {
    fontSize: 13,
    fontWeight: '600',
  },
  description: {
    fontSize: 11,
    lineHeight: 15,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clipCount: {
    fontSize: 10,
    fontWeight: '600',
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
