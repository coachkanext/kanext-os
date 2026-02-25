/**
 * Coach Sheet — Full coach profile bottom sheet.
 * Bio + System profile + Known levers.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing } from '@/constants/theme';
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

export function CoachSheet({ visible, onClose, data }: Props) {
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
        {/* Header */}
        <View style={styles.identityRow}>
          <View style={[styles.avatarCircle, { backgroundColor: `hsl(${hue}, 40%, 30%)` }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.coachName, { color: colors.text }]}>{data.name}</Text>
            <Text style={[styles.coachTitle, { color: colors.textSecondary }]}>{data.title}</Text>
            {data.tenure && (
              <Text style={[styles.tenure, { color: colors.textTertiary }]}>{data.tenure}</Text>
            )}
          </View>
        </View>

        {/* Bio */}
        {data.bio && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>BIO</Text>
            <Text style={[styles.bioText, { color: colors.textSecondary }]}>{data.bio}</Text>
          </View>
        )}

        {/* Record at institution */}
        {data.recordAtInstitution && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Record at Institution</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{data.recordAtInstitution}</Text>
            </View>
          </View>
        )}

        {/* System profile */}
        {(data.offSystem || data.defSystem) && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>SYSTEM PROFILE</Text>
            {data.offSystem && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Offensive System</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{data.offSystem}</Text>
              </View>
            )}
            {data.defSystem && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Defensive System</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{data.defSystem}</Text>
              </View>
            )}
          </View>
        )}

        {/* Known levers */}
        {data.knownLevers && data.knownLevers.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>KNOWN LEVERS</Text>
            {data.knownLevers.map((lever, i) => (
              <View key={i} style={styles.leverRow}>
                <Text style={[styles.bullet, { color: colors.textSecondary }]}>{'\u2022'}</Text>
                <Text style={[styles.leverText, { color: colors.text }]}>{lever}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Placeholder if sparse data */}
        {!data.bio && !data.offSystem && !data.defSystem && (!data.knownLevers || data.knownLevers.length === 0) && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
              Full coaching profile not yet available.
            </Text>
          </View>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 30 },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  coachName: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  coachTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, marginTop: 2 },
  tenure: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3, marginTop: 2 },

  card: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 8 },
  sectionTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  bioText: { fontSize: 13, fontWeight: '500', lineHeight: 19 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  infoValue: { fontSize: 13, fontWeight: '700' },

  leverRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  bullet: { fontSize: 13, lineHeight: 18 },
  leverText: { fontSize: 13, fontWeight: '600', lineHeight: 18, flex: 1 },

  placeholderText: { fontSize: 13, fontWeight: '500', fontStyle: 'italic' },
});
