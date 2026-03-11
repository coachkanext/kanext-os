/**
 * Ministry Card Sheet — lightweight ministry preview bottom sheet.
 * Quick preview with mission, volunteers, and leader.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Spacing } from '@/constants/theme';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import type { MinistryCardData } from '@/utils/global-entity-sheets';

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  data: MinistryCardData | null;
}

export function MinistryCardSheet({ visible, onClose, data }: Props) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  if (!data) return null;

  const hue = nameToHue(data.name);

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={styles.container}>
        {/* Ministry identity */}
        <View style={styles.identityRow}>
          <View style={[styles.iconCircle, { backgroundColor: `hsl(${hue}, 45%, 30%)` }]}>
            <Text style={styles.iconText}>{data.icon ?? '+'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.ministryName}>{data.name}</Text>
          </View>
        </View>

        {/* Mission text */}
        {data.mission && (
          <View style={styles.missionCard}>
            <Text style={styles.missionLabel}>MISSION</Text>
            <Text style={styles.missionText} numberOfLines={4}>
              {data.mission}
            </Text>
          </View>
        )}

        {/* Stats row */}
        {(data.volunteers != null || data.leader) && (
          <View style={styles.statsCard}>
            {data.volunteers != null && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>VOLUNTEERS</Text>
                <Text style={styles.statValue}>{data.volunteers}</Text>
              </View>
            )}
            {data.leader && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>LEADER</Text>
                <Text style={styles.statValue}>{data.leader}</Text>
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
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
    color: C.label,
  },
  ministryName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: C.label,
  },
  missionCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 6,
    backgroundColor: C.surface,
    borderColor: C.separator,
  },
  missionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: C.muted,
  },
  missionText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    color: C.secondary,
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
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: C.label,
  },
});
