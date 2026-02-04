/**
 * EmptyState Component
 * Reusable empty state display for tabs and lists.
 * Per spec: Show helpful empty states when there's no data to display.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface EmptyStateProps {
  icon: IconSymbolName;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  color?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  color,
}: EmptyStateProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accentColor = color ?? colors.tint;

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: accentColor + '15' }]}>
        <IconSymbol name={icon} size={48} color={accentColor} />
      </View>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={[styles.description, { color: colors.textSecondary }]}>
        {description}
      </ThemedText>
      {actionLabel && onAction && (
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: accentColor, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={onAction}
        >
          <ThemedText style={styles.actionLabel}>{actionLabel}</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  actionButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
