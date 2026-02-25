/**
 * Player Quick Sheet — lightweight player preview (long-press trigger).
 * 50% bottom sheet with avatar, name/pos/class, KR badge, 3 skill tags.
 * CTA escalates to Player Sheet.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getKRColor, getArchetypeDisplay, CLUSTER_ORDER, CLUSTER_LABELS } from '@/utils/kr-display';
import { openPlayerSheet } from '@/utils/global-entity-sheets';
import type { PlayerCardData } from '@/utils/global-entity-sheets';

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

/** Derive 3 skill tags: archetype + top 2 cluster labels */
function deriveSkillTags(data: PlayerCardData): string[] {
  const tags: string[] = [];

  // First tag: archetype
  if (data.archetype) {
    tags.push(getArchetypeDisplay(data.archetype));
  }

  // Next 2: top clusters by score
  if (data.clusters) {
    const sorted = [...CLUSTER_ORDER]
      .map((key) => ({ key, score: (data.clusters as Record<string, number>)[key] ?? 0 }))
      .sort((a, b) => b.score - a.score);

    for (const entry of sorted) {
      if (tags.length >= 3) break;
      const label = CLUSTER_LABELS[entry.key]?.label;
      if (label && !tags.includes(label)) {
        tags.push(label);
      }
    }
  }

  return tags.slice(0, 3);
}

interface Props {
  visible: boolean;
  onClose: () => void;
  data: PlayerCardData | null;
}

export function PlayerQuickSheet({ visible, onClose, data }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();

  if (!data) return null;

  const hue = data.teamColor ? nameToHue(data.teamColor) : nameToHue(data.name);
  const initials = data.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const kr = data.kr;
  const krColor = getKRColor(kr);
  const skillTags = deriveSkillTags(data);

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={styles.container}>
        {/* Identity row */}
        <View style={styles.identityRow}>
          <View style={[styles.avatarCircle, { backgroundColor: `hsl(${hue}, 50%, 35%)` }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.playerName, { color: colors.text }]}>{data.name}</Text>
              {data.number ? (
                <Text style={[styles.jerseyBadge, { color: colors.textSecondary }]}>#{data.number}</Text>
              ) : null}
            </View>
            <Text style={[styles.playerMeta, { color: colors.textSecondary }]}>
              {data.position} · {data.classYear}
            </Text>
          </View>
          {kr != null && (
            <View style={[styles.krBadge, { backgroundColor: krColor + '20' }]}>
              <Text style={[styles.krValue, { color: krColor }]}>{Math.round(kr)}</Text>
              <Text style={[styles.krLabel, { color: colors.textTertiary }]}>KR</Text>
            </View>
          )}
        </View>

        {/* Skill tags */}
        {skillTags.length > 0 && (
          <View style={styles.tagRow}>
            {skillTags.map((tag, i) => (
              <View key={i} style={[styles.tagChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.tagText, { color: colors.text }]}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Quick stats */}
        {data.ppg != null && (
          <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {data.ppg != null && <QuickStat label="PPG" value={data.ppg.toFixed(1)} colors={colors} />}
            {data.rpg != null && <QuickStat label="RPG" value={data.rpg.toFixed(1)} colors={colors} />}
            {data.apg != null && <QuickStat label="APG" value={data.apg.toFixed(1)} colors={colors} />}
          </View>
        )}

        {/* CTA */}
        <Pressable
          style={[styles.ctaButton, { backgroundColor: accent }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
            setTimeout(() => openPlayerSheet(data), 300);
          }}
        >
          <Text style={styles.ctaText}>Open Player Sheet</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

function QuickStat({ label, value, colors }: { label: string; value: string; colors: typeof Colors.light }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    </View>
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
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  jerseyBadge: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  playerMeta: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  krBadge: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  krValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  krLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
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
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  ctaButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
});
