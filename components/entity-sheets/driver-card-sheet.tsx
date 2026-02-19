/**
 * Driver Card Sheet — lightweight driver preview bottom sheet.
 * Quick preview with "Ask Nexus about this driver" CTA.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { openAskNexus } from '@/utils/global-ask-nexus';
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

        {/* Ask Nexus CTA */}
        <Pressable
          style={[styles.askNexusButton, { backgroundColor: `hsl(${hue}, 50%, 25%)` }]}
          onPress={() => {
            onClose();
            openAskNexus({ screen: '/nexus', mode: 'sports', prefill: `Tell me about driver ${data.name}` });
          }}
        >
          <IconSymbol name="sparkles" size={16} color="#fff" />
          <Text style={styles.askNexusText}>Ask Nexus about this driver</Text>
        </Pressable>
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
  askNexusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
  },
  askNexusText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
