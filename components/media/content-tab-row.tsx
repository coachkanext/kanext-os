/**
 * Content Tab Row — reusable pill row for contextual tabs.
 * Mode-aware: Film mode shows My Team / League / Explore.
 * Recruiting mode shows My Targets / Opponents (Auto) / Recruit Discovery.
 */

import React from 'react';
import { ScrollView, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export type ContentTab = 'tab1' | 'tab2' | 'tab3' | 'tab4';
export type VideoMode = 'film' | 'recruiting';

const FILM_LABELS: Record<ContentTab, string> = {
  tab1: 'My Team',
  tab2: 'League',
  tab3: 'Explore',
  tab4: 'Coach',
};

const RECRUITING_LABELS: Record<ContentTab, string> = {
  tab1: 'My Targets',
  tab2: 'Opponents',
  tab3: 'Recruit Discovery',
  tab4: 'Coach',
};

interface ContentTabRowProps {
  activeTab: ContentTab;
  onTabChange: (tab: ContentTab) => void;
  mode: VideoMode;
}

export function ContentTabRow({ activeTab, onTabChange, mode }: ContentTabRowProps) {
  const labels = mode === 'film' ? FILM_LABELS : RECRUITING_LABELS;
  const tabs: ContentTab[] = ['tab1', 'tab2', 'tab3', 'tab4'];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.row}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <Pressable
            key={tab}
            style={[
              styles.pill,
              { backgroundColor: isActive ? '#f5f5f5' : '#111' },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onTabChange(tab);
            }}
          >
            <ThemedText
              style={[
                styles.pillText,
                { color: isActive ? '#000' : '#6e6e6e' },
              ]}
            >
              {labels[tab]}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexGrow: 0,
    marginBottom: Spacing.sm,
  },
  content: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
