/**
 * Feed Scope Row — horizontal chip row for scoping feed content.
 * Premium styling with Luxury Control Room palette.
 */

import React from 'react';
import { StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FEED_SCOPES } from '@/data/mock-messages';
import type { FeedScope } from '@/data/mock-messages';

const ACCENT_GOLD = '#FFFFFF';

interface FeedScopeRowProps {
  activeScope: FeedScope;
  onScopeChange: (scope: FeedScope) => void;
  scopes?: { key: FeedScope; label: string }[];
}

export function FeedScopeRow({ activeScope, onScopeChange, scopes }: FeedScopeRowProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const scopeList = scopes ?? FEED_SCOPES;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {scopeList.map((s) => {
        const isActive = activeScope === s.key;
        return (
          <Pressable
            key={s.key}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? colors.text : colors.card,
                borderColor: isActive ? colors.text : colors.border,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onScopeChange(s.key);
            }}
          >
            <ThemedText
              style={[
                styles.chipText,
                { color: isActive ? colors.background : colors.textSecondary },
              ]}
            >
              {s.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  row: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
