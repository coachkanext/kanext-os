/**
 * LoadingState Component
 * Reusable loading display for async data fetching.
 */

import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
}

export function LoadingState({ message, size = 'large' }: LoadingStateProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.tint} />
      {message && (
        <ThemedText style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </ThemedText>
      )}
    </View>
  );
}

/**
 * InlineLoader - For use within content areas
 */
export function InlineLoader({ color }: { color?: string }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.inline}>
      <ActivityIndicator size="small" color={color ?? colors.textTertiary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  message: {
    fontSize: 15,
    marginTop: Spacing.md,
  },
  inline: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
});
