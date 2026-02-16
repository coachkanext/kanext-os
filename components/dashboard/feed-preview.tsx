/**
 * Block 5 — Feed Preview
 * Section title + 3–5 list items with dividers + "View all" footer link.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { DashboardFeedPreview as FeedPreviewType } from '@/types/dashboard';

export function FeedPreview({ feed }: { feed: FeedPreviewType }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{feed.title}</ThemedText>
      {feed.items.map((item, i) => (
        <Pressable
          key={item.id}
          style={[
            styles.row,
            i < feed.items.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
          ]}
          onPress={() => {
            if (item.routeTarget) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(item.routeTarget as any);
            }
          }}
          disabled={!item.routeTarget}
        >
          {item.icon != null && (
            <IconSymbol name={item.icon as any} size={16} color={colors.textTertiary} />
          )}
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.itemTitle, { color: colors.text }]}>{item.title}</ThemedText>
            {item.subtitle != null && (
              <ThemedText style={[styles.itemSubtitle, { color: colors.textTertiary }]}>
                {item.subtitle}
              </ThemedText>
            )}
          </View>
          {item.timestamp != null && (
            <ThemedText style={[styles.timestamp, { color: colors.textTertiary }]}>{item.timestamp}</ThemedText>
          )}
        </Pressable>
      ))}
      {feed.viewAllLabel != null && (
        <Pressable
          style={styles.viewAll}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (feed.viewAllRoute) {
              router.push(feed.viewAllRoute as any);
            }
          }}
        >
          <ThemedText style={[styles.viewAllText, { color: colors.text }]}>
            {feed.viewAllLabel} →
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  timestamp: {
    fontSize: 11,
  },
  viewAll: {
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
    marginTop: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
