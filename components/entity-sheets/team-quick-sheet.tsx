/**
 * Team Quick Sheet — lightweight team preview (long-press trigger).
 * 50% bottom sheet with Team KR, OSIE/DSIE, record.
 * CTA escalates to Team Sheet.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getKRColor } from '@/utils/kr-display';
import { openTeamSheet } from '@/utils/global-entity-sheets';
import type { TeamCardData } from '@/utils/global-entity-sheets';

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  data: TeamCardData | null;
}

export function TeamQuickSheet({ visible, onClose, data }: Props) {
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

  const krColor = getKRColor(data.teamKR);

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
            <Text style={[styles.subline, { color: colors.textSecondary }]}>
              {[data.level, data.conference].filter(Boolean).join(' · ') || '—'}
            </Text>
          </View>
          {data.teamKR != null && (
            <View style={[styles.krBadge, { backgroundColor: krColor + '20' }]}>
              <Text style={[styles.krValue, { color: krColor }]}>{Math.round(data.teamKR)}</Text>
              <Text style={[styles.krLabel, { color: colors.textTertiary }]}>TEAM KR</Text>
            </View>
          )}
        </View>

        {/* OSIE / DSIE row */}
        {(data.osie || data.dsie) && (
          <View style={[styles.systemRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {data.osie && (
              <View style={styles.systemItem}>
                <Text style={[styles.systemLabel, { color: colors.textTertiary }]}>OFFENSE</Text>
                <Text style={[styles.systemValue, { color: colors.text }]}>{data.osie}</Text>
                {data.osieScore != null && (
                  <Text style={[styles.systemScore, { color: getKRColor(data.osieScore) }]}>
                    {Math.round(data.osieScore)}
                  </Text>
                )}
              </View>
            )}
            {data.dsie && (
              <View style={styles.systemItem}>
                <Text style={[styles.systemLabel, { color: colors.textTertiary }]}>DEFENSE</Text>
                <Text style={[styles.systemValue, { color: colors.text }]}>{data.dsie}</Text>
                {data.dsieScore != null && (
                  <Text style={[styles.systemScore, { color: getKRColor(data.dsieScore) }]}>
                    {Math.round(data.dsieScore)}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

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
          {data.offKR != null && data.defKR != null && (
            <>
              <View style={styles.recordItem}>
                <Text style={[styles.recordLabel, { color: colors.textTertiary }]}>OFF KR</Text>
                <Text style={[styles.recordValue, { color: getKRColor(data.offKR) }]}>{Math.round(data.offKR)}</Text>
              </View>
              <View style={styles.recordItem}>
                <Text style={[styles.recordLabel, { color: colors.textTertiary }]}>DEF KR</Text>
                <Text style={[styles.recordValue, { color: getKRColor(data.defKR) }]}>{Math.round(data.defKR)}</Text>
              </View>
            </>
          )}
        </View>

        {/* CTA */}
        <Pressable
          style={[styles.ctaButton, { backgroundColor: accent }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
            setTimeout(() => openTeamSheet(data), 300);
          }}
        >
          <Text style={styles.ctaText}>Open Team Sheet</Text>
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
  subline: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
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
  systemRow: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    justifyContent: 'space-around',
  },
  systemItem: {
    alignItems: 'center',
    gap: 3,
  },
  systemLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  systemValue: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  systemScore: {
    fontSize: 11,
    fontWeight: '700',
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
