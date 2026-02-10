/**
 * ErrorState Component
 * Reusable error display for failed data loading.
 * Per spec: Show helpful error states with retry option.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: IconSymbolName;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We couldn\'t load this content. Please try again.',
  icon = 'exclamationmark.triangle.fill',
  onRetry,
  retryLabel = 'Try Again',
}: ErrorStateProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const errorColor = '#EF4444';

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: errorColor + '15' }]}>
        <IconSymbol name={icon} size={48} color={errorColor} />
      </View>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </ThemedText>
      {onRetry && (
        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={onRetry}
        >
          <IconSymbol
            name="arrow.triangle.2.circlepath"
            size={16}
            color={colors.text}
            style={styles.retryIcon}
          />
          <ThemedText style={styles.retryLabel}>{retryLabel}</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

/**
 * NetworkErrorState - Specialized for connection issues
 */
export function NetworkErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="No connection"
      message="Please check your internet connection and try again."
      icon="exclamationmark.triangle"
      onRetry={onRetry}
    />
  );
}

/**
 * NotFoundState - For when content doesn't exist
 */
export function NotFoundState({
  entityName = 'content',
  onGoBack,
}: {
  entityName?: string;
  onGoBack?: () => void;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.textTertiary + '20' }]}>
        <IconSymbol name="questionmark.circle" size={48} color={colors.textTertiary} />
      </View>
      <ThemedText style={styles.title}>Not found</ThemedText>
      <ThemedText style={[styles.message, { color: colors.textSecondary }]}>
        This {entityName} doesn't exist or may have been removed.
      </ThemedText>
      {onGoBack && (
        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={onGoBack}
        >
          <IconSymbol
            name="chevron.left"
            size={16}
            color={colors.text}
            style={styles.retryIcon}
          />
          <ThemedText style={styles.retryLabel}>Go Back</ThemedText>
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
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  retryIcon: {
    marginRight: Spacing.xs,
  },
  retryLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});
