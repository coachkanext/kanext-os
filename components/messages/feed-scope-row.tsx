/**
 * Feed Scope Row — horizontal chip row for scoping feed content.
 * Scopes: All / My Team / Staff / Players / Parents / Recruiting / League
 */

import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Spacing, BorderRadius } from '@/constants/theme';
import { FEED_SCOPES } from '@/data/mock-messages';
import type { FeedScope } from '@/data/mock-messages';

interface FeedScopeRowProps {
  activeScope: FeedScope;
  onScopeChange: (scope: FeedScope) => void;
}

export function FeedScopeRow({ activeScope, onScopeChange }: FeedScopeRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {FEED_SCOPES.map((s) => {
        const isActive = activeScope === s.key;
        return (
          <Pressable
            key={s.key}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? '#f5f5f5' : '#111',
                borderColor: isActive ? '#f5f5f5' : '#1a1a1a',
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onScopeChange(s.key);
            }}
          >
            <ThemedText
              style={[styles.chipText, { color: isActive ? '#000' : '#6e6e6e' }]}
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
    marginBottom: Spacing.sm,
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
