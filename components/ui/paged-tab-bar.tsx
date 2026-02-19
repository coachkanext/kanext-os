/**
 * PagedTabBar — Shared scrollable paged tab bar.
 * Replaces all 8 inline hub tab implementations.
 * Tabs render in a horizontal ScrollView with pagingEnabled snap.
 * Each tab is fixed width = screenWidth / 4 (exactly 4 per "page").
 *
 * When `accentColor` is provided, uses flat-button styling with mode-specific
 * accent colors (Home, Media, Messages tabs). Without it, uses the default
 * white/monochrome styling (Organization tab).
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
  accentColor?: string;
  /** Override per-tab width (default: SCREEN_WIDTH / 4). Use SCREEN_WIDTH / 3 for 3-tab layouts. */
  tabWidth?: number;
}

export function PagedTabBar({ tabs, activeIndex, onTabPress, accentColor, tabWidth }: PagedTabBarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll to the page containing the active tab (only when paging)
  const scrollToPage = useCallback((index: number) => {
    if (!accentColor) {
      const page = Math.floor(index / 4);
      scrollRef.current?.scrollTo({ x: page * SCREEN_WIDTH, animated: true });
    }
  }, [accentColor]);

  useEffect(() => {
    scrollToPage(activeIndex);
  }, [activeIndex, scrollToPage]);

  return (
    <View style={[styles.container, { borderBottomColor: colors.divider }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={!accentColor}
        snapToInterval={accentColor ? undefined : SCREEN_WIDTH}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        scrollEnabled={!accentColor}
      >
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;

          const resolvedWidth = tabWidth ?? TAB_WIDTH;

          if (accentColor) {
            // Flat-button accent styling
            return (
              <Pressable
                key={tab.id}
                style={[
                  styles.tab,
                  { width: resolvedWidth },
                  isActive && { borderBottomColor: accentColor, borderBottomWidth: 2 },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onTabPress(index);
                }}
              >
                <ThemedText
                  style={[
                    styles.accentTabLabel,
                    { color: isActive ? accentColor : '#888888' },
                    isActive && styles.accentTabLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </ThemedText>
              </Pressable>
            );
          }

          // Default white/monochrome styling (Organization tab)
          return (
            <Pressable
              key={tab.id}
              style={[
                styles.tab,
                { width: resolvedWidth },
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
    marginBottom: 8,
  },
  tab: {
    width: TAB_WIDTH, // default; overridden by resolvedWidth inline
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
  // Accent mode styles
  accentTabLabel: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  accentTabLabelActive: {
    fontWeight: '600',
  },
});
