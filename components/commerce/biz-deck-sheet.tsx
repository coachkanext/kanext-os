/**
 * Business Deck Bottom Sheet
 *
 * Primary pitch deck card + 3 supporting docs from DECK_DOCUMENTS.
 * Share/Download buttons (placeholders).
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DECK_DOCUMENTS, type DeckDocument } from '@/data/mock-business-home';
import { Spacing, BorderRadius } from '@/constants/theme';

const ACCENT = '#8B5CF6';

const TYPE_ICONS: Record<DeckDocument['type'], string> = {
  deck: 'doc.richtext.fill',
  pdf: 'doc.text.fill',
  video: 'play.rectangle.fill',
  doc: 'doc.fill',
};

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

export function BizDeckSheet({ visible, onClose, colors }: Props) {
  const primary = DECK_DOCUMENTS.find((d) => d.isPrimary);
  const supporting = DECK_DOCUMENTS.filter((d) => !d.isPrimary);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Deck" useModal>
      <View style={styles.container}>
        {/* Primary Deck Card */}
        {primary && (
          <View style={[styles.primaryCard, { backgroundColor: ACCENT + '15', borderColor: ACCENT + '33' }]}>
            <View style={styles.primaryHeader}>
              <IconSymbol name={TYPE_ICONS[primary.type] as any} size={28} color={ACCENT} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.primaryTitle, { color: colors.text }]}>{primary.title}</Text>
                <Text style={[styles.primaryMeta, { color: colors.textSecondary }]}>
                  {primary.type.toUpperCase()} · {primary.size}
                </Text>
              </View>
            </View>
            <View style={styles.primaryActions}>
              <Pressable style={[styles.actionButton, { backgroundColor: ACCENT }]}>
                <IconSymbol name="eye.fill" size={14} color="#fff" />
                <Text style={styles.actionButtonText}>View</Text>
              </Pressable>
              <Pressable style={[styles.actionButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
                <IconSymbol name="square.and.arrow.up" size={14} color={colors.text} />
                <Text style={[styles.actionButtonTextAlt, { color: colors.text }]}>Share</Text>
              </Pressable>
              <Pressable style={[styles.actionButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
                <IconSymbol name="arrow.down.circle" size={14} color={colors.text} />
                <Text style={[styles.actionButtonTextAlt, { color: colors.text }]}>Download</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Supporting Documents */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>SUPPORTING DOCUMENTS</Text>
        {supporting.map((doc) => (
          <Pressable
            key={doc.id}
            style={[styles.docRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <IconSymbol name={TYPE_ICONS[doc.type] as any} size={20} color={ACCENT} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.docTitle, { color: colors.text }]}>{doc.title}</Text>
              <Text style={[styles.docMeta, { color: colors.textSecondary }]}>
                {doc.type.toUpperCase()} · {doc.size}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={colors.textSecondary} />
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },

  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },

  primaryCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: 14,
  },
  primaryHeader: { flexDirection: 'row', alignItems: 'center' },
  primaryTitle: { fontSize: 16, fontWeight: '700' },
  primaryMeta: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  primaryActions: { flexDirection: 'row', gap: 8 },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  actionButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  actionButtonTextAlt: { fontSize: 13, fontWeight: '600' },

  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  docTitle: { fontSize: 14, fontWeight: '600' },
  docMeta: { fontSize: 11, fontWeight: '500', marginTop: 2 },
});
