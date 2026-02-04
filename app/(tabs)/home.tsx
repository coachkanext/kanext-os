/**
 * Home Screen
 * Orientation only - displays current system context.
 * Per spec: Home = orientation only. No work performed here.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TopBar } from '@/components/top-bar';
import { Spacing } from '@/constants/theme';
import { useAppContext } from '@/context/app-context';

export default function HomeScreen() {
  const { state } = useAppContext();

  const handleAvatarPress = () => {
    // TODO: Open Avatar Drawer
    console.log('Avatar pressed - open drawer');
  };

  // Format mode name for display
  const formatMode = (mode: string) => {
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  };

  // Format role name for display
  const formatRole = (role: string) => {
    return role
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <ThemedView style={styles.container}>
      <TopBar onAvatarPress={handleAvatarPress} />

      <View style={styles.content}>
        {/* Context Display */}
        <View style={styles.contextSection}>
          {/* Mode */}
          <View style={styles.contextRow}>
            <ThemedText style={styles.contextLabel}>Mode</ThemedText>
            <ThemedText style={styles.contextValue}>
              {formatMode(state.mode)}
            </ThemedText>
          </View>

          {/* Organization */}
          <View style={styles.contextRow}>
            <ThemedText style={styles.contextLabel}>Organization</ThemedText>
            <ThemedText style={styles.contextValue}>
              {state.organization?.name ?? 'Not selected'}
            </ThemedText>
          </View>

          {/* Operating Role */}
          <View style={styles.contextRow}>
            <ThemedText style={styles.contextLabel}>Operating Role</ThemedText>
            <ThemedText style={styles.contextValue}>
              {formatRole(state.operatingRole)}
            </ThemedText>
          </View>

          {/* Program (Sports mode only) */}
          {state.mode === 'sports' && state.program && (
            <View style={styles.contextRow}>
              <ThemedText style={styles.contextLabel}>Program</ThemedText>
              <ThemedText style={styles.contextValue}>
                {state.program.name}
              </ThemedText>
            </View>
          )}

          {/* Cycle */}
          {state.cycle && (
            <View style={styles.contextRow}>
              <ThemedText style={styles.contextLabel}>
                {state.mode === 'sports' ? 'Season' : 'Cycle'}
              </ThemedText>
              <ThemedText style={styles.contextValue}>
                {state.cycle.name}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
  },
  contextSection: {
    gap: Spacing.lg,
  },
  contextRow: {
    gap: Spacing.xs,
  },
  contextLabel: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.5,
  },
  contextValue: {
    fontSize: 17,
    fontWeight: '600',
  },
});
