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

const ACCENT = '#1D9BF0';

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
  container: { gap: 12 },

  seriesCard: {
    backgroundColor: '#0B0F14',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
  },
  seriesAccent: { height: 3 },
  seriesContent: { padding: 16 },
  seriesLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 6, textTransform: 'uppercase' },
  seriesName: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: -0.6, marginBottom: 4 },
  seriesProgress: { color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: '500', letterSpacing: 0.2 },

  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },

  sermonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  sermonTitle: { fontSize: 14, fontWeight: '800', letterSpacing: -0.3, marginBottom: 3 },
  sermonMeta: { fontSize: 11, fontWeight: '500', letterSpacing: 0.1, marginBottom: 5 },
  seriesBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  seriesBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },

  sermonActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actionBtn: { padding: 4 },
});
