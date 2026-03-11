/**
 * Crew Card Sheet — lightweight crew member preview bottom sheet.
 * Quick preview with identity and pit score.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Spacing } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import type { CrewCardData } from '@/utils/global-entity-sheets';

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  data: CrewCardData | null;
}

export function CrewCardSheet({ visible, onClose, data }: Props) {
  const C = useColors();
  const accent = useAccentColor();
  const styles = useMemo(() => makeStyles(C, accent), [C, accent]);

  if (!data) return null;

  const hue = nameToHue(data.name);
  const initials = data.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const getPitScoreColor = (score: number): string => {
    if (score >= 90) return C.green;
    if (score >= 75) return accent;
    return C.red;
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={styles.container}>
        {/* Crew member identity */}
        <View style={styles.identityRow}>
          <View style={[styles.avatarCircle, { backgroundColor: `hsl(${hue}, 45%, 32%)` }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.crewName}>{data.name}</Text>
            <Text style={styles.crewRole}>{data.role}</Text>
            <Text style={styles.crewTeam}>{data.team}</Text>
          </View>
        </View>

        {/* Pit score card */}
        {data.pitScore != null && (
          <View style={styles.scoreCard}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>PIT SCORE</Text>
              <Text style={[styles.scoreValue, { color: getPitScoreColor(data.pitScore) }]}>
                {data.pitScore}
              </Text>
            </View>
          </View>
        )}

      </View>
    </BottomSheet>
  );
}

const makeStyles = (C: ComponentColors, accent: string) => StyleSheet.create({
  container: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: C.label,
    letterSpacing: 1,
  },
  crewName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: C.label,
  },
  crewRole: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
    color: C.secondary,
  },
  crewTeam: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 1,
    color: C.muted,
  },
  scoreCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    justifyContent: 'space-around',
    backgroundColor: C.surface,
    borderColor: C.separator,
  },
  scoreItem: {
    alignItems: 'center',
    gap: 4,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: C.muted,
  },
  scoreValue: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
});
