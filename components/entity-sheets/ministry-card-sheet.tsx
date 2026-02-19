/**
 * Ministry Card Sheet — lightweight ministry preview bottom sheet.
 * Quick preview with mission, volunteers, and leader.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

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
            <Text style={[styles.ministryName, { color: colors.text }]}>{data.name}</Text>
          </View>
        </View>

        {/* Mission text */}
        {data.mission && (
          <View style={[styles.missionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.missionLabel, { color: colors.textTertiary }]}>MISSION</Text>
            <Text style={[styles.missionText, { color: colors.textSecondary }]} numberOfLines={4}>
              {data.mission}
            </Text>
          </View>
        )}

        {/* Stats row */}
        {(data.volunteers != null || data.leader) && (
          <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {data.volunteers != null && (
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>VOLUNTEERS</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{data.volunteers}</Text>
              </View>
            )}
            {data.leader && (
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>LEADER</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{data.leader}</Text>
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
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
    color: '#fff',
  },
  ministryName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  missionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 6,
  },
  missionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  missionText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
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
    fontSize: 15,
    fontWeight: '700',
  },
});
