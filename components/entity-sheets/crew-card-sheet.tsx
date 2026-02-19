/**
 * Crew Card Sheet — lightweight crew member preview bottom sheet.
 * Quick preview with "Ask Nexus about this crew member" CTA.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { openAskNexus } from '@/utils/global-ask-nexus';
import type { CrewCardData } from '@/utils/global-entity-sheets';

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

function getPitScoreColor(score: number): string {
  if (score >= 90) return '#4ade80';
  if (score >= 75) return '#fbbf24';
  return '#f87171';
}

interface Props {
  visible: boolean;
  onClose: () => void;
  data: CrewCardData | null;
}

export function CrewCardSheet({ visible, onClose, data }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

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
        {/* Crew member identity */}
        <View style={styles.identityRow}>
          <View style={[styles.avatarCircle, { backgroundColor: `hsl(${hue}, 45%, 32%)` }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.crewName, { color: colors.text }]}>{data.name}</Text>
            <Text style={[styles.crewRole, { color: colors.textSecondary }]}>{data.role}</Text>
            <Text style={[styles.crewTeam, { color: colors.textTertiary }]}>{data.team}</Text>
          </View>
        </View>

        {/* Pit score card */}
        {data.pitScore != null && (
          <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreLabel, { color: colors.textTertiary }]}>PIT SCORE</Text>
              <Text style={[styles.scoreValue, { color: getPitScoreColor(data.pitScore) }]}>
                {data.pitScore}
              </Text>
            </View>
          </View>
        )}

        {/* Ask Nexus CTA */}
        <Pressable
          style={[styles.askNexusButton, { backgroundColor: `hsl(${hue}, 45%, 25%)` }]}
          onPress={() => {
            onClose();
            openAskNexus({ screen: '/nexus', mode: 'sports', prefill: `Tell me about ${data.name}` });
          }}
        >
          <IconSymbol name="sparkles" size={16} color="#fff" />
          <Text style={styles.askNexusText}>Ask Nexus about this crew member</Text>
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
  crewName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  crewRole: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  crewTeam: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  scoreCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    justifyContent: 'space-around',
  },
  scoreItem: {
    alignItems: 'center',
    gap: 4,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scoreValue: {
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
