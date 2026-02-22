/**
 * Team Card Sheet — lightweight team preview bottom sheet.
 * For deep dives, see TeamQuickSheet (4-tab detailed profile).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { TeamCardData } from '@/utils/global-entity-sheets';

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

function getKRColor(kr: number): string {
  if (kr >= 80) return '#22C55E';
  if (kr >= 65) return accent;
  return '#EF4444';
}

interface Props {
  visible: boolean;
  onClose: () => void;
  data: TeamCardData | null;
}

export function TeamCardSheet({ visible, onClose, data }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();

  if (!data) return null;

  const hue = nameToHue(data.name);
  const initials = data.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={styles.container}>
        {/* Team identity */}
        <View style={styles.identityRow}>
          <View style={[styles.initialsCircle, { backgroundColor: `hsl(${hue}, 50%, 35%)` }]}>
            <Text style={styles.initialsText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.teamName, { color: colors.text }]}>{data.name}</Text>
            {data.conference && (
              <Text style={[styles.conference, { color: colors.textSecondary }]}>{data.conference}</Text>
            )}
          </View>
        </View>

        {/* Record row */}
        <View style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.recordItem}>
            <Text style={[styles.recordLabel, { color: colors.textTertiary }]}>OVERALL</Text>
            <Text style={[styles.recordValue, { color: colors.text }]}>{data.record || '—'}</Text>
          </View>
          {data.confRecord && (
            <View style={styles.recordItem}>
              <Text style={[styles.recordLabel, { color: colors.textTertiary }]}>CONF</Text>
              <Text style={[styles.recordValue, { color: colors.text }]}>{data.confRecord}</Text>
            </View>
          )}
          {data.teamKR != null && (
            <View style={styles.recordItem}>
              <Text style={[styles.recordLabel, { color: colors.textTertiary }]}>TEAM KR</Text>
              <Text style={[styles.recordValue, { color: getKRColor(data.teamKR) }]}>{data.teamKR}</Text>
            </View>
          )}
        </View>

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
  initialsCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  conference: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  recordCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    justifyContent: 'space-around',
  },
  recordItem: {
    alignItems: 'center',
    gap: 4,
  },
  recordLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  recordValue: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
});
