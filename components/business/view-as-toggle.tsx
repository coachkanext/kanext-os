/**
 * View As Toggle — RBAC role switcher for Business mode.
 * 3-segment pill: Founder | Investor | Public
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBusiness } from '@/context/business-context';
import type { BusinessRoleLens } from '@/utils/business-rbac';

const ACCENT_GOLD = '#FFFFFF';

const ROLES: { id: BusinessRoleLens; label: string }[] = [
  { id: 'B1', label: 'Founder' },
  { id: 'B7', label: 'Retail' },
  { id: 'B9', label: 'Board' },
  { id: 'B12', label: 'Public' },
  { id: 'B8', label: 'Advisor' },
  { id: 'B13', label: 'HoldCo' },
];

export function ViewAsToggle() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { viewAsRole, setViewAsRole } = useBusiness();

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundTertiary }]}>
      <ThemedText style={[styles.label, { color: colors.textTertiary }]}>VIEW AS</ThemedText>
      <View style={styles.pillRow}>
        {ROLES.map((role) => {
          const isActive = viewAsRole === role.id;
          return (
            <Pressable
              key={role.id}
              style={[
                styles.pill,
                isActive && { backgroundColor: ACCENT_GOLD + '28' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setViewAsRole(role.id);
              }}
            >
              <ThemedText style={[styles.pillText, { color: isActive ? ACCENT_GOLD : colors.textTertiary }]}>
                {role.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  pillRow: { flexDirection: 'row', flex: 1, gap: 4 },
  pill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
  },
  pillText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
});
