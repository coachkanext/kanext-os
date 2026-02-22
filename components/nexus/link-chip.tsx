/**
 * Link Chip — tappable pill referencing an internal object.
 * Rendered inline in Nexus messages for governed object links.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { LinkChip as LinkChipType } from '@/types/nexus-v2';

const CHIP_ICON_MAP: Record<string, IconSymbolName> = {
  player: 'person.fill',
  team: 'person.3.fill',
  game: 'sportscourt.fill',
  room: 'bubble.left.and.bubble.right.fill',
  request: 'doc.text.fill',
  task: 'checkmark.circle.fill',
  workspace: 'folder.fill',
  resource: 'book.fill',
  packet: 'doc.richtext',
  case: 'shield.fill',
  receipt: 'receipt',
  compliance_item: 'shield.checkered',
  finance_event: 'dollarsign.circle.fill',
  sponsor: 'star.fill',
};

interface LinkChipProps {
  chip: LinkChipType;
  onPress?: (chip: LinkChipType) => void;
  compact?: boolean;
}

export function LinkChip({ chip, onPress, compact }: LinkChipProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const iconName = (chip.icon as IconSymbolName) || CHIP_ICON_MAP[chip.objectType] || 'link';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: colors.backgroundTertiary, opacity: pressed ? 0.7 : 1 },
        compact && styles.chipCompact,
      ]}
      onPress={() => onPress?.(chip)}
    >
      <IconSymbol name={iconName} size={compact ? 11 : 13} color={accent} />
      <ThemedText
        style={[styles.label, { color: accent }, compact && styles.labelCompact]}
        numberOfLines={1}
      >
        {chip.label}
      </ThemedText>
    </Pressable>
  );
}

interface LinkChipRowProps {
  chips: LinkChipType[];
  onPress?: (chip: LinkChipType) => void;
  compact?: boolean;
}

export function LinkChipRow({ chips, onPress, compact }: LinkChipRowProps) {
  if (!chips || chips.length === 0) return null;

  return (
    <View style={styles.row}>
      {chips.map((chip) => (
        <LinkChip key={chip.id} chip={chip} onPress={onPress} compact={compact} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 1,
    borderRadius: BorderRadius.full,
    gap: 5,
    marginRight: 6,
    marginBottom: 4,
  },
  chipCompact: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '500',
    maxWidth: 180,
  },
  labelCompact: {
    fontSize: 11.5,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
});
