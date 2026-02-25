/**
 * Coach Quick Sheet — lightweight coach preview (tap trigger).
 * 50% bottom sheet with avatar, name, title, tendency chips.
 * CTA escalates to Coach Sheet.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { openCoachSheet } from '@/utils/global-entity-sheets';
import type { CoachCardData } from '@/utils/global-entity-sheets';

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  data: CoachCardData | null;
}

export function CoachQuickSheet({ visible, onClose, data }: Props) {
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

  // Parse tendencies into chips
  const tendencyChips = data.tendencies
    ? data.tendencies.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={styles.container}>
        {/* Coach identity */}
        <View style={styles.identityRow}>
          <View style={[styles.avatarCircle, { backgroundColor: `hsl(${hue}, 40%, 30%)` }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.coachName, { color: colors.text }]}>{data.name}</Text>
            <Text style={[styles.coachTitle, { color: colors.textSecondary }]}>{data.title}</Text>
          </View>
        </View>

        {/* Details card */}
        <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {data.recordAtInstitution && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>Record at Institution</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{data.recordAtInstitution}</Text>
            </View>
          )}
          {data.tenure && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>Tenure</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{data.tenure}</Text>
            </View>
          )}
        </View>

        {/* Tendency chips */}
        {tendencyChips.length > 0 && (
          <View style={styles.chipRow}>
            {tendencyChips.map((chip, i) => (
              <View key={i} style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.chipText, { color: colors.text }]}>{chip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CTA */}
        <Pressable
          style={[styles.ctaButton, { backgroundColor: accent }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
            setTimeout(() => openCoachSheet(data), 300);
          }}
        >
          <Text style={styles.ctaText}>Open Coach Sheet</Text>
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
  coachName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  coachTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  detailsCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
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
