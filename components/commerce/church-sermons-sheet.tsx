/**
 * Church Sermons Bottom Sheet
 *
 * Browse-only: current series card + recent sermon list with play/share.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CURRENT_SERIES, RECENT_SERMONS } from '@/data/mock-church-home';
import { Spacing, BorderRadius } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

const ACCENT = '#FBBF24';

export function ChurchSermonsSheet({ visible, onClose, colors }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Sermons" useModal>
      <View style={styles.container}>
        {/* Current Series Card */}
        <View style={styles.seriesCard}>
          <View style={[styles.seriesAccent, { backgroundColor: CURRENT_SERIES.color }]} />
          <View style={styles.seriesContent}>
            <Text style={[styles.seriesLabel, { color: ACCENT }]}>CURRENT SERIES</Text>
            <Text style={styles.seriesName}>{CURRENT_SERIES.name}</Text>
            <Text style={styles.seriesProgress}>
              Part {CURRENT_SERIES.currentPart} of {CURRENT_SERIES.totalParts}
            </Text>
          </View>
        </View>

        {/* Recent Sermons */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECENT SERMONS</Text>
        {RECENT_SERMONS.map((sermon) => (
          <View
            key={sermon.id}
            style={[styles.sermonRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.sermonTitle, { color: colors.text }]}>{sermon.title}</Text>
              <Text style={[styles.sermonMeta, { color: colors.textSecondary }]}>
                {sermon.speaker} · {sermon.date} · {sermon.duration}
              </Text>
              {sermon.seriesName && (
                <View style={[styles.seriesBadge, { backgroundColor: ACCENT + '22' }]}>
                  <Text style={[styles.seriesBadgeText, { color: ACCENT }]}>{sermon.seriesName}</Text>
                </View>
              )}
            </View>
            <View style={styles.sermonActions}>
              <Pressable style={styles.actionBtn}>
                <IconSymbol name="play.circle.fill" size={28} color={ACCENT} />
              </Pressable>
              <Pressable style={styles.actionBtn}>
                <IconSymbol name="square.and.arrow.up" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },

  seriesCard: {
    backgroundColor: '#181616',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: 8,
  },
  seriesAccent: { height: 3 },
  seriesContent: { padding: Spacing.md },
  seriesLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  seriesName: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  seriesProgress: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },

  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },

  sermonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.sm,
    gap: 10,
  },
  sermonTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  sermonMeta: { fontSize: 11, marginBottom: 4 },
  seriesBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  seriesBadgeText: { fontSize: 9, fontWeight: '700' },

  sermonActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: { padding: 4 },
});
