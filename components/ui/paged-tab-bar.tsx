/**
 * PagedTabBar — Shared scrollable paged tab bar.
 * Replaces all 8 inline hub tab implementations.
 * Tabs render in a horizontal ScrollView with pagingEnabled snap.
 * Each tab is fixed width = screenWidth / 4 (exactly 4 per "page").
 */

import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TAB_WIDTH = SCREEN_WIDTH / 4;

export interface PagedTabBarProps {
  tabs: { id: string; label: string }[];
  activeIndex: number;
  onTabPress: (index: number) => void;
}

export function PagedTabBar({ tabs, activeIndex, onTabPress }: PagedTabBarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll to the page containing the active tab
  const scrollToPage = useCallback((index: number) => {
    const page = Math.floor(index / 4);
    scrollRef.current?.scrollTo({ x: page * SCREEN_WIDTH, animated: true });
  }, []);

  useEffect(() => {
    scrollToPage(activeIndex);
  }, [activeIndex, scrollToPage]);

  return (
    <View style={[styles.container, { borderBottomColor: colors.divider }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        snapToInterval={SCREEN_WIDTH}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
      >
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <Pressable
              key={tab.id}
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
                numberOfLines={1}
              >
                {tab.label}
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
  tab: {
    width: TAB_WIDTH,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
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
