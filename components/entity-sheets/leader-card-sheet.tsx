/**
 * Leader Card Sheet — lightweight leader preview bottom sheet.
 * Quick preview with ministry pills, bio snippet, and "Ask Nexus about this leader" CTA.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { openAskNexus } from '@/utils/global-ask-nexus';
import type { LeaderCardData } from '@/utils/global-entity-sheets';

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  data: LeaderCardData | null;
}

export function LeaderCardSheet({ visible, onClose, data }: Props) {
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
        {/* Leader identity */}
        <View style={styles.identityRow}>
          <View style={[styles.avatarCircle, { backgroundColor: `hsl(${hue}, 40%, 30%)` }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.leaderName, { color: colors.text }]}>{data.name}</Text>
            <Text style={[styles.leaderTitle, { color: colors.textSecondary }]}>{data.title}</Text>
          </View>
        </View>

        {/* Ministry pills */}
        {data.ministries && data.ministries.length > 0 && (
          <View style={[styles.ministriesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.ministriesLabel, { color: colors.textTertiary }]}>MINISTRIES</Text>
            <View style={styles.pillsRow}>
              {data.ministries.map((m) => (
                <View key={m} style={[styles.ministryPill, { backgroundColor: colors.text + '10' }]}>
                  <Text style={[styles.ministryPillText, { color: colors.text }]}>{m}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bio snippet */}
        {data.bio && (
          <View style={[styles.bioCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.bioText, { color: colors.textSecondary }]} numberOfLines={4}>
              {data.bio}
            </Text>
          </View>
        )}

        {/* Ask Nexus CTA */}
        <Pressable
          style={[styles.askNexusButton, { backgroundColor: `hsl(${hue}, 40%, 25%)` }]}
          onPress={() => {
            onClose();
            openAskNexus({ screen: '/nexus', mode: 'church', prefill: `Tell me about ${data.name}` });
          }}
        >
          <IconSymbol name="sparkles" size={16} color="#fff" />
          <Text style={styles.askNexusText}>Ask Nexus about this leader</Text>
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
  leaderName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  leaderTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  ministriesCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 8,
  },
  ministriesLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ministryPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  ministryPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bioCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
  bioText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
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
