/**
 * Insert Sheet
 * Bottom sheet for inserting objects, links, or files into a Nexus conversation.
 * Replaces the old Engine launcher.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type InsertAction = 'object' | 'link' | 'file';

interface InsertOption {
  type: InsertAction;
  label: string;
  description: string;
  icon: IconSymbolName;
}

const INSERT_OPTIONS: InsertOption[] = [
  {
    type: 'object',
    label: 'Insert Object',
    description: 'Add a player, team, or entity',
    icon: 'cube.fill',
  },
  {
    type: 'link',
    label: 'Insert Link',
    description: 'Paste a URL or deep link',
    icon: 'link',
  },
  {
    type: 'file',
    label: 'Attach File',
    description: 'Upload a document or image',
    icon: 'paperclip',
  },
];

interface InsertSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectAction: (action: InsertAction) => void;
}

export function InsertSheet({
  visible,
  onClose,
  onSelectAction,
}: InsertSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handlePress = (type: InsertAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectAction(type);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Insert">
      <View style={styles.options}>
        {INSERT_OPTIONS.map((option) => (
          <Pressable
            key={option.type}
            style={({ pressed }) => [
              styles.option,
              { backgroundColor: colors.backgroundSecondary },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => handlePress(option.type)}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.backgroundTertiary }]}>
              <IconSymbol name={option.icon} size={22} color={colors.text} />
            </View>
            <View style={styles.optionText}>
              <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
              <ThemedText style={[styles.optionDescription, { color: colors.textSecondary }]}>
                {option.description}
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: Spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
  },
});
