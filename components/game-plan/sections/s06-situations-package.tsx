/**
 * S06 — Situations Package
 * Grouped by type (ATO/EOH/late/press/zone), HC-selectable plays with checkmark toggle
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { SituationPlay, SituationType } from '../game-plan-types';

interface Props {
  plays: SituationPlay[];
  onLayout?: (y: number) => void;
}

const TYPE_LABELS: Record<SituationType, string> = {
  ATO: 'After Timeout',
  EOH: 'End of Half',
  late: 'Late Clock',
  press: 'Press Break',
  zone: 'Zone Attack',
};

const TYPE_COLORS: Record<SituationType, string> = {
  ATO: Brand.precision,
  EOH: Brand.warning,
  late: Brand.error,
  press: Brand.success,
  zone: '#A78BFA',
};

export function S06SituationsPackage({ plays: initialPlays, onLayout }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [plays, setPlays] = useState(initialPlays);
  const [expandedGroup, setExpandedGroup] = useState<SituationType | null>(null);

  // Group by type
  const groups = plays.reduce<Record<SituationType, SituationPlay[]>>((acc, play) => {
    if (!acc[play.type]) acc[play.type] = [];
    acc[play.type].push(play);
    return acc;
  }, {} as Record<SituationType, SituationPlay[]>);

  const togglePlay = (playName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlays(plays.map((p) => p.name === playName ? { ...p, selected: !p.selected } : p));
  };

  const toggleGroup = (type: SituationType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedGroup(expandedGroup === type ? null : type);
  };

  return (
    <View onLayout={(e) => onLayout?.(e.nativeEvent.layout.y)}>
      {(Object.entries(groups) as [SituationType, SituationPlay[]][]).map(([type, groupPlays]) => {
        const isExpanded = expandedGroup === type;
        const selectedCount = groupPlays.filter((p) => p.selected).length;
        const typeColor = TYPE_COLORS[type];

        return (
          <View key={type} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable style={styles.groupHeader} onPress={() => toggleGroup(type)}>
              <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
                <ThemedText style={[styles.typeText, { color: typeColor }]}>{type}</ThemedText>
              </View>
              <ThemedText style={[styles.groupTitle, { color: colors.text }]}>{TYPE_LABELS[type]}</ThemedText>
              <ThemedText style={[styles.countText, { color: colors.textTertiary }]}>
                {selectedCount}/{groupPlays.length}
              </ThemedText>
              <IconSymbol
                name={isExpanded ? 'chevron.down' : 'chevron.right'}
                size={12}
                color={colors.textTertiary}
              />
            </Pressable>

            {isExpanded && groupPlays.map((play) => (
              <Pressable key={play.name} style={styles.playRow} onPress={() => togglePlay(play.name)}>
                <IconSymbol
                  name={play.selected ? 'checkmark.circle.fill' : 'circle'}
                  size={20}
                  color={play.selected ? Brand.success : colors.textTertiary}
                />
                <View style={styles.playInfo}>
                  <ThemedText style={[styles.playName, { color: colors.text }]}>{play.name}</ThemedText>
                  <ThemedText style={[styles.playDesc, { color: colors.textSecondary }]}>{play.description}</ThemedText>
                </View>
              </Pressable>
            ))}
          </View>
        );
      })}
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
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  typeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  groupTitle: { flex: 1, fontSize: 14, fontWeight: '600' },
  countText: { fontSize: 12 },
  playRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingTop: Spacing.sm + 2 },
  playInfo: { flex: 1 },
  playName: { fontSize: 14, fontWeight: '600' },
  playDesc: { fontSize: 12, lineHeight: 16, marginTop: 2 },
});
