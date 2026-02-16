/**
 * Enterprise Hub Tabs — 5-tab scrollable header synced with PagerView.
 * Mirrors TeamHubTabs pattern from app/(tabs)/index.tsx.
 */

import React, { useRef, useCallback, useEffect } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const TABS = ['Home', 'Proof Events', 'Data Room', 'Governance'];

interface EnterpriseHubTabsProps {
  activeIndex: number;
  onTabPress: (index: number) => void;
}

export function EnterpriseHubTabs({ activeIndex, onTabPress }: EnterpriseHubTabsProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const tabScrollRef = useRef<ScrollView>(null);
  const tabLayoutsRef = useRef<{ x: number; width: number }[]>([]);

  const scrollToTab = useCallback((index: number) => {
    const layout = tabLayoutsRef.current[index];
    if (layout && tabScrollRef.current) {
      tabScrollRef.current.scrollTo({
        x: Math.max(0, layout.x - 40),
        animated: true,
      });
    }
  }, []);

  useEffect(() => {
    scrollToTab(activeIndex);
  }, [activeIndex, scrollToTab]);

  return (
    <View style={[styles.container, { borderBottomColor: colors.divider }]}>
      <ScrollView
        ref={tabScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {TABS.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <Pressable
              key={tab}
              onLayout={(e) => {
                tabLayoutsRef.current[index] = {
                  x: e.nativeEvent.layout.x,
                  width: e.nativeEvent.layout.width,
                };
              }}
              style={[
                styles.tab,
                isActive && [styles.tabActive, { borderBottomColor: colors.text }],
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onTabPress(index);
              }}
            >
              <ThemedText
                style={[
                  styles.tabLabel,
                  { color: isActive ? colors.text : colors.textTertiary },
                  isActive && styles.tabLabelActive,
                ]}
              >
                {tab}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingTop: 4,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  tab: {
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomWidth: 2.5,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
});
