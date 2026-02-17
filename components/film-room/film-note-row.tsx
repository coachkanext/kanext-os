/**
 * FilmNoteRow — Note row with author initials, content preview, type badge, lock icon.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getNoteTypeLabel,
  getNoteTypeColor,
  type FilmNote,
} from '@/data/mock-sports-workspaces';

interface FilmNoteRowProps {
  note: FilmNote;
}

export function FilmNoteRow({ note }: FilmNoteRowProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const typeColor = getNoteTypeColor(note.type);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? colors.cardElevated : colors.card },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      {/* Author Circle */}
      <View style={[styles.authorCircle, { backgroundColor: colors.backgroundTertiary }]}>
        <ThemedText style={[styles.authorInitials, { color: colors.text }]}>
          {note.authorInitials}
        </ThemedText>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <ThemedText style={[styles.author, { color: colors.text }]}>{note.author}</ThemedText>
          <View style={[styles.typeBadge, { backgroundColor: typeColor + '1A' }]}>
            <ThemedText style={[styles.typeText, { color: typeColor }]}>
              {getNoteTypeLabel(note.type)}
            </ThemedText>
          </View>
          {note.isLocked && (
            <IconSymbol name="lock.fill" size={10} color={colors.textTertiary} />
          )}
        </View>

        <ThemedText style={[styles.noteContent, { color: colors.textSecondary }]} numberOfLines={2}>
          {note.content}
        </ThemedText>

        <View style={styles.metaRow}>
          {note.timestamp && (
            <ThemedText style={[styles.meta, { color: colors.textTertiary }]}>
              {note.timestamp}
            </ThemedText>
          )}
          {note.clipRef && (
            <ThemedText style={[styles.meta, { color: colors.textTertiary }]}>
              {note.clipRef}
            </ThemedText>
          )}
          <ThemedText style={[styles.meta, { color: colors.textTertiary }]}>
            {note.createdAt}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm + 4,
    gap: Spacing.sm + 2,
  },
  authorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorInitials: {
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  author: {
    fontSize: 13,
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  noteContent: {
    fontSize: 13,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  meta: {
    fontSize: 11,
  },
});
