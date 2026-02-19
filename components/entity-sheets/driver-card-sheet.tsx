/**
 * Driver Card Sheet — lightweight driver preview bottom sheet.
 * Quick preview with identity and season stats.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { DriverCardData } from '@/utils/global-entity-sheets';

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  data: DriverCardData | null;
}

export function DriverCardSheet({ visible, onClose, data }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  if (!data) return null;

  const hue = nameToHue(data.team);

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={styles.container}>
        {/* Driver identity */}
        <View style={styles.identityRow}>
          <View style={[styles.numberCircle, { backgroundColor: `hsl(${hue}, 50%, 35%)` }]}>
            <Text style={styles.numberText}>#{data.number}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.driverName, { color: colors.text }]}>{data.name}</Text>
            <Text style={[styles.teamName, { color: colors.textSecondary }]}>{data.team}</Text>
            {data.category && (
              <Text style={[styles.category, { color: colors.textTertiary }]}>{data.category}</Text>
            )}
          </View>
        </View>

        {/* Stats row */}
        {(data.points != null || data.wins != null || data.podiums != null) && (
          <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {data.points != null && (
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>POINTS</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{data.points}</Text>
              </View>
            )}
            {data.wins != null && (
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>WINS</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{data.wins}</Text>
              </View>
            )}
            {data.podiums != null && (
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>PODIUMS</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{data.podiums}</Text>
              </View>
            )}
          </View>
        )}

      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  numberCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  teamName: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  category: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
  },
});
