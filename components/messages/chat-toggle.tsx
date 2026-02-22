/**
 * Chat Toggle — Primary / Requests / Groups capsule toggle.
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
  { key: 'primary', label: 'Primary' },
  { key: 'requests', label: 'Requests' },
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
                { backgroundColor: isActive ? '#0B0F14' : 'transparent' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onTabChange(tab.key);
              }}
            >
              <ThemedText
                style={[styles.tabText, { color: isActive ? '#FFFFFF' : '#A1A1AA' }]}
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
  },
  capsule: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 2,
  },
  tab: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
