/**
 * Driver Card Sheet — lightweight driver preview bottom sheet.
 * Quick preview with identity and season stats.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Spacing } from '@/constants/theme';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
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
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

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
            <Text style={styles.driverName}>{data.name}</Text>
            <Text style={styles.teamName}>{data.team}</Text>
            {data.category && (
              <Text style={styles.category}>{data.category}</Text>
            )}
          </View>
        </View>

        {/* Stats row */}
        {(data.points != null || data.wins != null || data.podiums != null) && (
          <View style={styles.statsCard}>
            {data.points != null && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>POINTS</Text>
                <Text style={styles.statValue}>{data.points}</Text>
              </View>
            )}
            {data.wins != null && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>WINS</Text>
                <Text style={styles.statValue}>{data.wins}</Text>
              </View>
            )}
            {data.podiums != null && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>PODIUMS</Text>
                <Text style={styles.statValue}>{data.podiums}</Text>
              </View>
            )}
          </View>
        )}

      </View>
    </BottomSheet>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
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
    color: C.label,
    letterSpacing: 0.5,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: C.label,
  },
  teamName: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
    color: C.secondary,
  },
  category: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: C.muted,
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    justifyContent: 'space-around',
    backgroundColor: C.surface,
    borderColor: C.separator,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: C.muted,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: C.label,
  },
});
