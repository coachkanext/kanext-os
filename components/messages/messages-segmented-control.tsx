/**
 * Messages Segmented Control
 * Custom tabBar for the Messages nested Tabs — header + 4-pill row at top.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

const TAB_LABELS: Record<string, string> = {
  index: 'Feed',
  chat: 'Chat',
  requests: 'Requests',
  alerts: 'Alerts',
};

export function MessagesSegmentedControl({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedText style={styles.title}>Messages</ThemedText>
      <View style={styles.pillRow}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const label = TAB_LABELS[route.name] ?? route.name;

          return (
            <Pressable
              key={route.key}
              style={[
                styles.pill,
                { backgroundColor: isFocused ? '#FFFFFF' : '#111' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (!isFocused) {
                  navigation.navigate(route.name);
                }
              }}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  { color: isFocused ? '#000' : '#9C9790' },
                ]}
              >
                {label}
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
    backgroundColor: '#000',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
