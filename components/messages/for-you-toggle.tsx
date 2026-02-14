/**
 * ForYouToggle — For You / Following capsule toggle for Home feed.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { FeedMode } from '@/data/mock-messages';

interface ForYouToggleProps {
  activeMode: FeedMode;
  onModeChange: (mode: FeedMode) => void;
}

const TABS: { key: FeedMode; label: string }[] = [
  { key: 'for_you', label: 'For You' },
  { key: 'following', label: 'Following' },
];

export function ForYouToggle({ activeMode, onModeChange }: ForYouToggleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.capsule}>
        {TABS.map((tab) => {
          const isActive = activeMode === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[
                styles.tab,
                { backgroundColor: isActive ? '#2a2a2a' : 'transparent' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onModeChange(tab.key);
              }}
            >
              <ThemedText
                style={[styles.tabText, { color: isActive ? '#f5f5f5' : '#6e6e6e' }]}
              >
                {tab.label}
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
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  capsule: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 18,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
