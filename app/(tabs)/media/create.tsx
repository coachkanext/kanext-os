/**
 * Create — upload/post form for video content.
 * Visible only for creator roles (enforced by href: null in layout).
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UploadForm } from '@/components/media/upload-form';
import { Spacing } from '@/constants/theme';

export default function CreateScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedText style={styles.headerTitle}>Create</ThemedText>
      <UploadForm />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f5f5f5',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
});
