/**
 * CommsTabBar — Top text-segmented header for the Comms hub.
 * 5 text label tabs: Feed | Search | Inbox | Activity | Lists
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
  explore: 'Search',
  chat: 'Inbox',
  alerts: 'Activity',
  lists: 'Lists',
};

const TAB_ORDER = ['index', 'explore', 'chat', 'alerts', 'lists'];

export function CommsTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.tabRow}>
        {state.routes
          .filter((route) => TAB_ORDER.includes(route.name))
          .sort((a, b) => TAB_ORDER.indexOf(a.name) - TAB_ORDER.indexOf(b.name))
          .map((route) => {
            const routeIndex = state.routes.indexOf(route);
            const isFocused = state.index === routeIndex;
            const label = TAB_LABELS[route.name] ?? route.name;

            return (
              <Pressable
                key={route.key}
                style={styles.tab}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (!isFocused) {
                    navigation.navigate(route.name);
                  }
                }}
              >
                <ThemedText
                  style={[
                    styles.tabText,
                    { color: isFocused ? '#FFFFFF' : '#555' },
                  ]}
                >
                  {label}
                </ThemedText>
                {isFocused && <View style={styles.activeIndicator} />}
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
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2F3336',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingBottom: 2,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeIndicator: {
    width: 24,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
  },
});
