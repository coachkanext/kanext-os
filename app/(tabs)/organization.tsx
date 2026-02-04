/**
 * Organization Screen
 * Universal operational surface - mode-specific truth view.
 * Per spec: Organization reflects "what is" - it never reasons, simulates, or decides.
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';

export default function OrganizationScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { state } = useAppContext();

  // Format mode name for display
  const getOrganizationTitle = () => {
    if (state.organization) {
      return state.organization.name;
    }

    // Default titles by mode
    switch (state.mode) {
      case 'sports':
        return 'Organization';
      case 'enterprise':
        return 'KaNeXT';
      case 'church':
        return 'International Christian Center';
      case 'education':
        return 'San Diego Christian College';
      default:
        return 'Organization';
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          {getOrganizationTitle()}
        </ThemedText>
        {state.cycle && (
          <ThemedText style={[styles.cycleLabel, { color: colors.textSecondary }]}>
            {state.cycle.name}
          </ThemedText>
        )}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.placeholder}>
          <ThemedText style={[styles.placeholderText, { color: colors.textTertiary }]}>
            Organization content will be displayed here based on the active mode.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  cycleLabel: {
    fontSize: 15,
    marginTop: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  placeholder: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
