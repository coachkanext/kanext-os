/**
 * Block 4 — Quick Actions
 * 3 buttons in a row, each with icon + label.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { DashboardQuickAction } from '@/types/dashboard';

export function QuickActions({ actions }: { actions: DashboardQuickAction[] }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  if (actions.length === 0) return null;

  return (
    <View style={styles.row}>
      {actions.slice(0, 3).map((action) => (
        <Pressable
          key={action.id}
          style={[styles.button, { backgroundColor: colors.text + '0A', borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (action.routeTarget) {
              router.push(action.routeTarget as any);
            }
          }}
        >
          <IconSymbol name={action.icon as any} size={18} color={colors.text} />
          <ThemedText style={[styles.label, { color: colors.text }]}>{action.label}</ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
