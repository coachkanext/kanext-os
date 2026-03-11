/**
 * Person Card Sheet — lightweight person preview bottom sheet.
 * Quick preview with ministry pills and status badge.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Spacing } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import type { PersonCardData } from '@/utils/global-entity-sheets';

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  data: PersonCardData | null;
}

export function PersonCardSheet({ visible, onClose, data }: Props) {
  const C = useColors();
  const accent = useAccentColor();
  const styles = useMemo(() => makeStyles(C), [C]);

  if (!data) return null;

  const hue = nameToHue(data.name);
  const initials = data.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active': return C.green;
      case 'inactive': return C.red;
      case 'pending': return accent;
      default: return C.secondary;
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={styles.container}>
        {/* Person identity */}
        <View style={styles.identityRow}>
          <View style={[styles.avatarCircle, { backgroundColor: `hsl(${hue}, 40%, 32%)` }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.personName}>{data.name}</Text>
              {data.status && (
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(data.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(data.status) }]}>
                    {data.status}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.personRole}>{data.role}</Text>
          </View>
        </View>

        {/* Ministry pills */}
        {data.ministries && data.ministries.length > 0 && (
          <View style={styles.ministriesCard}>
            <Text style={styles.ministriesLabel}>MINISTRIES</Text>
            <View style={styles.pillsRow}>
              {data.ministries.map((m) => (
                <View key={m} style={[styles.ministryPill, { backgroundColor: C.label + '10' }]}>
                  <Text style={styles.ministryPillText}>{m}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      </View>
    </BottomSheet>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
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
    color: C.label,
    letterSpacing: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  personName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: C.label,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  personRole: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
    color: C.secondary,
  },
  ministriesCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 8,
    backgroundColor: C.surface,
    borderColor: C.separator,
  },
  ministriesLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: C.muted,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ministryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  ministryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.label,
  },
});
