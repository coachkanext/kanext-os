/**
 * Chat Toggle — Messages / Groups capsule toggle.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { ChatSubTab } from '@/data/mock-messages';

interface ChatToggleProps {
  activeTab: ChatSubTab;
  onTabChange: (tab: ChatSubTab) => void;
}

const TABS: { key: ChatSubTab; label: string }[] = [
  { key: 'messages', label: 'Messages' },
  { key: 'groups', label: 'Groups' },
];

export function ChatToggle({ activeTab, onTabChange }: ChatToggleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.capsule}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[
                styles.tab,
                { backgroundColor: isActive ? '#2a2a2a' : 'transparent' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onTabChange(tab.key);
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
