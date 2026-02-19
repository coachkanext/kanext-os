/**
 * Player Card Sheet — lightweight player preview bottom sheet.
 * Quick preview with "Ask Nexus about this player" CTA.
 * For deep dives, see PlayerSheet (9-tab detailed profile).
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { openAskNexus } from '@/utils/global-ask-nexus';
import type { PlayerCardData } from '@/utils/global-entity-sheets';

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

function getKRColor(kr: number): string {
  if (kr >= 80) return '#4ade80';
  if (kr >= 65) return '#fbbf24';
  return '#f87171';
}

interface Props {
  visible: boolean;
  onClose: () => void;
  data: PlayerCardData | null;
}

export function PlayerCardSheet({ visible, onClose, data }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  if (!data) return null;

  const hue = data.teamColor ? nameToHue(data.teamColor) : nameToHue(data.name);
  const initials = data.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={styles.container}>
        {/* Player identity */}
        <View style={styles.identityRow}>
          <View style={[styles.avatarCircle, { backgroundColor: `hsl(${hue}, 50%, 35%)` }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.playerName, { color: colors.text }]}>
              {data.name} <Text style={{ color: colors.textSecondary }}>#{data.number}</Text>
            </Text>
            <Text style={[styles.playerMeta, { color: colors.textSecondary }]}>
              {data.position} · {data.height} · {data.weight} lbs · {data.classYear}
            </Text>
          </View>
        </View>

        {/* Background info */}
        {(data.hometown || data.previousSchool) && (
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {data.hometown && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Hometown</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{data.hometown}</Text>
              </View>
            )}
            {data.previousSchool && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Previous School</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{data.previousSchool}</Text>
              </View>
            )}
          </View>
        )}

        {/* Stats + KR row */}
        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {data.kr != null && (
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>KR</Text>
              <Text style={[styles.statValue, { color: getKRColor(data.kr) }]}>{data.kr}</Text>
            </View>
          )}
          {data.ppg != null && (
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>PPG</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{data.ppg.toFixed(1)}</Text>
            </View>
          )}
          {data.rpg != null && (
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>RPG</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{data.rpg.toFixed(1)}</Text>
            </View>
          )}
          {data.apg != null && (
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>APG</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{data.apg.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {/* Ask Nexus CTA */}
        <Pressable
          style={[styles.askNexusButton, { backgroundColor: `hsl(${hue}, 50%, 25%)` }]}
          onPress={() => {
            onClose();
            openAskNexus({ screen: '/nexus', mode: 'sports', prefill: `Tell me about ${data.name}` });
          }}
        >
          <IconSymbol name="sparkles" size={16} color="#fff" />
          <Text style={styles.askNexusText}>Ask Nexus about this player</Text>
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
    color: '#fff',
    letterSpacing: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  playerMeta: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  infoCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
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
