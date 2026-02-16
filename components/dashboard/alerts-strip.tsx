/**
 * Block 3 — Alerts Strip
 * Compact list of 1–3 alerts with severity color dot + title.
 * Hidden if empty.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { DashboardAlert } from '@/types/dashboard';

const SEVERITY_COLORS: Record<DashboardAlert['severity'], string> = {
  critical: Brand.error,
  warning: Brand.warning,
  info: Brand.precision,
};

export function AlertsStrip({ alerts }: { alerts?: DashboardAlert[] }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  if (!alerts || alerts.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {alerts.map((alert, i) => (
        <Pressable
          key={alert.id}
          style={[
            styles.row,
            i < alerts.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
          ]}
          onPress={() => {
            if (alert.routeTarget) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(alert.routeTarget as any);
            }
          }}
          disabled={!alert.routeTarget}
        >
          <View style={[styles.dot, { backgroundColor: SEVERITY_COLORS[alert.severity] }]} />
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.title, { color: colors.text }]}>{alert.title}</ThemedText>
            {alert.message != null && (
              <ThemedText style={[styles.message, { color: colors.textTertiary }]} numberOfLines={1}>
                {alert.message}
              </ThemedText>
            )}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  message: {
    fontSize: 12,
    marginTop: 1,
  },
});
