/**
 * Coach Card Sheet — lightweight coach preview bottom sheet.
 * Quick preview with identity and details card.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
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

export function CoachCardSheet({ visible, onClose, data }: Props) {
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
          {data.bio && (
            <Text style={[styles.bioText, { color: colors.textSecondary }]} numberOfLines={4}>
              {data.bio}
            </Text>
          )}
        </View>

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
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  coachTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  detailsCard: {
    borderRadius: BorderRadius.lg,
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
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  bioText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
