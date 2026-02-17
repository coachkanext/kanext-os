/**
 * S04 — Shot Profile
 * Team zone bars + expandable per-player permission rows (green/yellow/red badges)
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ShotProfileData, ShotPermission } from '../game-plan-types';

interface Props {
  data: ShotProfileData;
  onLayout?: (y: number) => void;
}

const PERM_COLORS: Record<ShotPermission, string> = {
  green: Brand.success,
  yellow: Brand.warning,
  red: Brand.error,
};

const PERM_LABELS: Record<ShotPermission, string> = {
  green: 'GO',
  yellow: 'OK',
  red: 'NO',
};

export function S04ShotProfile({ data, onLayout }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null);

  return (
    <View onLayout={(e) => onLayout?.(e.nativeEvent.layout.y)}>
      {/* Team Zones */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.cardTitle, { color: colors.textSecondary }]}>TEAM SHOT ZONES</ThemedText>
        {data.teamZones.map((z, i) => (
          <View key={i} style={styles.zoneRow}>
            <ThemedText style={[styles.zoneName, { color: colors.text }]}>{z.zone}</ThemedText>
            <View style={styles.barWrap}>
              <View style={[styles.bar, { width: `${z.attemptsPct}%`, backgroundColor: Brand.precision + '60' }]} />
            </View>
            <ThemedText style={[styles.zonePct, { color: colors.textSecondary }]}>{z.attemptsPct}%</ThemedText>
            <ThemedText style={[styles.zoneEfg, { color: z.efgPct >= 50 ? Brand.success : colors.textTertiary }]}>
              {z.efgPct}% eFG
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Player Permissions */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.cardTitle, { color: colors.textSecondary }]}>PLAYER SHOT PERMISSIONS</ThemedText>
        {data.playerPermissions.map((pp, i) => {
          const isExpanded = expandedPlayer === i;
          return (
            <View key={i}>
              <Pressable
                style={styles.playerRow}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setExpandedPlayer(isExpanded ? null : i);
                }}
              >
                <ThemedText style={[styles.playerJersey, { color: colors.textTertiary }]}>#{pp.jersey}</ThemedText>
                <ThemedText style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>{pp.name}</ThemedText>
                <View style={styles.miniPerms}>
                  {pp.zones.slice(0, 3).map((z, zi) => (
                    <View key={zi} style={[styles.miniPerm, { backgroundColor: PERM_COLORS[z.permission] + '30' }]}>
                      <ThemedText style={[styles.miniPermText, { color: PERM_COLORS[z.permission] }]}>
                        {PERM_LABELS[z.permission]}
                      </ThemedText>
                    </View>
                  ))}
                </View>
                <IconSymbol name={isExpanded ? 'chevron.down' : 'chevron.right'} size={12} color={colors.textTertiary} />
              </Pressable>
              {isExpanded && (
                <View style={styles.permGrid}>
                  {pp.zones.map((z, zi) => (
                    <View key={zi} style={styles.permItem}>
                      <ThemedText style={[styles.permZone, { color: colors.textTertiary }]}>{z.zone}</ThemedText>
                      <View style={[styles.permBadge, { backgroundColor: PERM_COLORS[z.permission] + '20' }]}>
                        <ThemedText style={[styles.permBadgeText, { color: PERM_COLORS[z.permission] }]}>
                          {PERM_LABELS[z.permission]}
                        </ThemedText>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  zoneRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: 6 },
  zoneName: { fontSize: 12, width: 100 },
  barWrap: { flex: 1, height: 8, backgroundColor: '#222', borderRadius: 4, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 4 },
  zonePct: { fontSize: 12, width: 32, textAlign: 'right', fontWeight: '600' },
  zoneEfg: { fontSize: 11, width: 55, textAlign: 'right' },
  playerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 6 },
  playerJersey: { fontSize: 12, fontWeight: '600', width: 28 },
  playerName: { flex: 1, fontSize: 13, fontWeight: '500' },
  miniPerms: { flexDirection: 'row', gap: 3 },
  miniPerm: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  miniPermText: { fontSize: 9, fontWeight: '800' },
  permGrid: { paddingLeft: 34, paddingBottom: 8 },
  permItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3 },
  permZone: { fontSize: 12 },
  permBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  permBadgeText: { fontSize: 11, fontWeight: '700' },
});
