/**
 * Document Reader Sheet — Bottom sheet for reading document detail in-app.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCategoryLabelV2 } from '@/data/mock-enterprise-v2';
import { getFileTypeIcon } from '@/data/mock-enterprise';
import type { DocumentV2 } from '@/types';

const ACCENT_GOLD = '#FFFFFF';

interface DocumentReaderSheetProps {
  visible: boolean;
  onClose: () => void;
  document: DocumentV2;
}

export function DocumentReaderSheet({ visible, onClose, document }: DocumentReaderSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={document.title} useModal>
      <View style={styles.container}>
        {/* Meta row */}
        <View style={styles.metaRow}>
          <View style={[styles.fileTypeIcon, { backgroundColor: ACCENT_GOLD + '15' }]}>
            <IconSymbol
              name={getFileTypeIcon(document.fileType) as any}
              size={16}
              color={ACCENT_GOLD}
            />
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: ACCENT_GOLD + '15' }]}>
            <ThemedText style={[styles.categoryText, { color: ACCENT_GOLD }]}>
              {getCategoryLabelV2(document.category)}
            </ThemedText>
          </View>
          <View style={[styles.visibilityBadge, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[styles.visibilityText, { color: colors.textTertiary }]}>
              {document.visibility.toUpperCase()}
            </ThemedText>
          </View>
        </View>

        {/* Description */}
        {document.description && (
          <ThemedText style={[styles.description, { color: colors.textSecondary }]}>
            {document.description}
          </ThemedText>
        )}

        {/* Tags */}
        {document.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {document.tags.map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: colors.backgroundTertiary }]}>
                <ThemedText style={[styles.tagText, { color: colors.textTertiary }]}>{tag}</ThemedText>
              </View>
            ))}
          </View>
        )}

        {/* Dates */}
        <View style={styles.dateRow}>
          <ThemedText style={[styles.dateText, { color: colors.textTertiary }]}>
            Created {document.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </ThemedText>
          <ThemedText style={[styles.dateText, { color: colors.textTertiary }]}>
            Updated {document.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </ThemedText>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        {/* Summary */}
        {document.summary && (
          <>
            <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>Summary</ThemedText>
            <ThemedText style={[styles.bodyText, { color: colors.text }]}>
              {document.summary}
            </ThemedText>
          </>
        )}

        {/* Body */}
        {document.body && (
          <>
            <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>Content</ThemedText>
            <ThemedText style={[styles.bodyText, { color: colors.text }]}>
              {document.body}
            </ThemedText>
          </>
        )}

        {/* Attachments */}
        {document.attachments.length > 0 && (
          <>
            <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>Attachments</ThemedText>
            {document.attachments.map((att, i) => (
              <View key={i} style={[styles.attachmentRow, { backgroundColor: colors.backgroundTertiary }]}>
                <IconSymbol name="paperclip" size={14} color={colors.textTertiary} />
                <ThemedText style={[styles.attachmentText, { color: colors.text }]}>{att}</ThemedText>
              </View>
            ))}
          </>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  fileTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  visibilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  visibilityText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  dateText: {
    fontSize: 11,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  attachmentText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
